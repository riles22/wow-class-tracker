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
2. **Transcript** (videos ≥2–6h old — auto-captions lag upload):
   `yt-dlp --no-update --skip-download --write-auto-subs --sub-langs en --sub-format json3 --sleep-requests 1.5 -o "<scratchpad>/%(id)s.%(ext)s" <url>`
   Flatten json3 events to text, PRESERVING per-event `tStartMs`.
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
4. Supersede: when a creator posts a newer take on the same spec, mark older ones
   `superseded: true` rather than deleting.
5. `npm test && npm run build`; append date · videos processed · takes added to `log.md`.

## Gotchas

- `--print` combined with sub-download flags **silently enables simulate mode and
  writes nothing** — run metadata print and sub download as separate invocations.
- RSS endpoint throws transient 404 bursts that clear in minutes — retry with backoff,
  don't fail the run. The bare timedtext API is dead (200 with 0 bytes); don't use it.
- Auto-captions are ASR: WoW vocab gets mangled ("dragonfly talents" = Dragonflight,
  "It's Jack" = Jak). Never quote captions verbatim without the timestamp link;
  paraphrase in the claim text.
- Update yt-dlp weekly in the same run (`python -m pip install -U yt-dlp`) — extractor
  rot is the #1 failure mode; the current install warns it's >90 days old.
- TOS: low-volume personal-use transcript fetching only. Store summaries + short
  excerpts with links, never redistribute full transcripts. RSS is explicitly public.
- Framing: label takes "Creator take — <name>, <date>"; require 2+ independent
  creators before describing anything as community consensus; tag patch state
  (announced changes get retuned before ship).
