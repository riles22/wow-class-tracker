---
name: watch-creators
description: Check tracked YouTube creators for new Midnight/12.1 videos, pull transcripts, and distill per-spec "creator takes" into the tracker's qualitative layer. Use when the user says "check the creators", "any new creator videos?", "update creator takes", or on a scheduled/loop run.
---

# Watch creators — the qualitative layer

Discover new videos from the creators in `data/community.json`, fetch transcripts
locally, and distill them into cited per-spec takes in `data/creator-takes.json`.
**Creator opinion ≠ tier data** — takes never move a rating; they are context.

## Procedure

0. **Skip reference-only creators**: entries with `transcribable: false` (guide-byline
   or Discord-only authorities — e.g. SimC devs, guide writers) are display-only "who to
   read" links; the pipeline does not transcribe them. Process only creators with a
   YouTube `channelId` or a fetchable doc `url` and `transcribable !== false`.
1. **Discovery**: for each transcribable creator with a YouTube channel, fetch
   `https://www.youtube.com/feeds/videos.xml?channel_id=<id>` (no auth). Resolve an
   unknown channel_id once by grepping `"channelId"` from the raw watch-page HTML
   (browser UA) and cache it on the creator entry as `channelId`. Diff videoIds
   against `log.md`'s seen-set. **Title-filter before fetching** — creators post
   off-topic content; require class/spec/Midnight/12.1/Season keywords.
2. **Transcript** (videos ≥2–6h old — auto-captions lag upload). Sources in order:
   (a) **Nightly runner:** `transcript-fetch/<videoId>.json` — pre-fetched by the
   deterministic step (`src/fetch-transcripts.mjs`, Supadata captions API,
   `mode=native` = YouTube's own auto-captions; `chunks[].offset` is
   **milliseconds**). Check `transcript-fetch/summary.json` first; NEVER call the
   API or YouTube yourself in a nightly run.
   (b) **Local/residential runs:**
   `yt-dlp --no-update --extractor-args "youtube:player_client=android" --skip-download --write-auto-subs --sub-langs en --sub-format json3 --sleep-requests 1.5 -o "<scratchpad>/%(id)s.%(ext)s" <url>`
   Flatten json3 events to text, PRESERVING per-event `tStartMs`.
   (c) **Neither available** → queue it in `data/pending-transcripts.json`
   (`{id, creator, title, published, queuedAt}` — the machine queue the deterministic
   step drains, 25 fetches/run inside the free-tier budget); log.md keeps the
   human-readable trail. Remove a video from the queue ONLY once distilled or
   transcript-verified-skipped.
3. **Distill**: one summarization pass per video with a WoW-vocab-primed prompt:
   map mentions to exact roster spec names; emit discrete claims, each with creator,
   video title, date, patch context (announced / PTR / live), sentiment
   (buff / nerf / neutral), and a deep link `https://youtu.be/<id>?t=<seconds>` from
   the caption timestamp. Append to `data/creator-takes.json` (shape in that file).
   **Spec scoping (important):** creators specialize — most know one or two specs of a
   class, not all of them (Obli plays Frost/Unholy DK but not Blood; a DPS creator is
   not authoritative on their class's tank/healer spec). If the creator entry has a
   `specs` list, only attribute takes to those specs. If it has no list, still apply
   judgment: attribute a take to a spec **only when the creator demonstrably plays or
   analyzes it in depth** in the video — never stretch a class-wide label (or a
   class-tuning-roundup video) into a spec they merely mention in passing. When a
   video reveals a creator competently covers a spec outside their listed `specs`,
   note it in the run log for a human to widen the scope — don't silently override.
4. Supersede — **do this EVERY time you add a take, it is not optional** (audit
   2026-07-23 found 16 creator+spec pairs carrying multiple live takes across tuning
   passes): when you distill a new take for (creator, spec), scan the existing
   `takes[]` for that SAME creator + SAME spec and mark the older one `superseded: true`
   (never delete — the archive stays). Guardrail against over-superseding: only retire a
   prior take the new one genuinely REPLACES — same lens (both raid, both M+, or both
   general). A creator's still-valid raid take and a new M+ take on the same spec are
   COMPLEMENTARY; keep both live. The drawer shows only non-superseded takes and the
   projection's date-sort assumes the newest live take is the current read, so a stale
   un-superseded take both clutters the drawer and can mislead — supersede diligently,
   but only within the same lens.
4b. **General-coverage creators** (`community.json` top-level `generalCreators` — e.g.
   izen): a cross-class PTR-NEWS lane, NOT a specialist take lane. Poll their RSS the same
   way, title-filter for 12.1/PTR/Season relevance. **Never distill specialist per-spec
   `takes[]` from them** (they're outside the take-authority model; validation rejects a
   `takes[]` attribution to a general creator). Instead:
   (a) **META-OUTLOOK NOTES** — when a video gives per-spec season/meta reads (which specs
   look strong/weak for the upcoming season or current meta — izen's "best & most popular
   specs" raid/M+ recap videos are the archetype), distill them into `creator-takes.json`
   `metaNotes[]` (a SEPARATE lane from `takes[]`). Shape:
   `{class, spec, creator, date, sentiment: "positive|negative|neutral|mixed", note,
   patchContext, url, superseded}` — `note` = faithful paraphrase of THEIR read (never
   quote ASR captions), `url` = `youtu.be/<id>?t=<seconds>` deep link, `patchContext`
   carries the lens (e.g. "Season 2 PTR — raid testing outlook" vs "… — M+ outlook"; a
   spec may hold one of each). Validation requires the creator be a `generalCreators`
   entry, keeping the firewall intact. **Curate honestly**: capture only genuine spec-level
   reads — if the creator says a spec merely topped ONE fight because the fight favors its
   role (not a spec-strength call), that's a fight artifact, NOT a meta note; drop it or
   mark it `mixed`, never inflate it to `positive`. Supersede older metaNotes for the same
   (spec, lens) when a newer video updates the read.
   (b) **LEADS** — if a video covers a PTR build, tuning pass, or system change not yet in
   `data/ptr-builds.json`, verify it against the canonical official forum thread before
   logging anything (the video is the tip-off, never the source of record).
   (c) refresh the entry's `latest` field (title + date) so the site's build-feed link
   stays current; (d) note processed videoIds in `log.md`'s seen-set like any other creator.
5. `npm test && npm run build`; append date · videos processed · takes added · metaNotes added to `log.md`. If any data/ file changed this run, finish with `node src/snapshot.mjs` (movement baseline; loadData skips baselines identical to the current state, so ordering vs the build is safe).

## Gotchas

- `--print` combined with sub-download flags **silently enables simulate mode and
  writes nothing** — run metadata print and sub download as separate invocations.
- RSS endpoint throws transient 404 bursts that clear in minutes — retry with backoff,
  don't fail the run. The bare timedtext API is dead (200 with 0 bytes); don't use it.
- Auto-captions are ASR: WoW vocab gets mangled ("dragonfly talents" = Dragonflight,
  "It's Jack" = Jak). Never quote captions verbatim without the timestamp link;
  paraphrase in the claim text.
- NEVER install or upgrade yt-dlp in-run — the version is pinned in requirements.txt
  (Dependabot proposes weekly bumps; the nightly preinstalls the pin). Extractor rot
  shows up as sudden parse failures across ALL videos: record it in the run log and
  leave the bump to Dependabot review.
- **Runner bot-wall — SETTLED (2026-07-17):** the datacenter-IP "Sign in to confirm
  you're not a bot" wall blocks direct yt-dlp transcript fetches from runners
  (residential IPs unaffected). The `youtube:player_client=android` extractor-args
  workaround was tried and FAILED (2026-07-17). The landed fallback is the **Supadata
  captions API** — a deterministic pre-agent step (`src/fetch-transcripts.mjs`, drains
  `data/pending-transcripts.json`, `mode=native` = YouTube's own auto-captions). Agents
  do NOT fetch YouTube directly on the runner: queue in-scope videos to
  `pending-transcripts.json` and the transcript step drains them; genuinely IP-blocked
  videos catch up in a local run. This decision is closed — do not re-litigate the
  android client or re-judge the fallback.
- TOS: low-volume personal-use transcript fetching only. Store summaries + short
  excerpts with links, never redistribute full transcripts. RSS is explicitly public.
- Framing: label takes "Creator take — <name>, <date>"; require 2+ independent
  creators before describing anything as community consensus; tag patch state
  (announced changes get retuned before ship).
