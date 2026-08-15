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
   against the seen-set. **The seen-set is STRUCTURED DATA, never log prose** (2026-08-08).
   It is the union of four lanes, all machine-readable:
     · `data/pending-transcripts.json` → `seen[]` (considered, no richer record)
     · `data/pending-transcripts.json` → `skipped[]` (transcript read, nothing to distil)
     · `data/pending-transcripts.json` → `videos[]` (queued, still waiting)
     · `data/creator-takes.json` → every `youtu.be/<id>` in a take or metaNote url
   Do NOT regex log.md for ids. That was the old method and it matched any 11-character
   token, so it had silently absorbed **231 ordinary English words** ("residential",
   "substantial", "speculative") into a 950-entry set that could not be reconciled against
   anything. (Recompute the real size rather than trusting a number written here.)
   **`seen[]` takes DURABLE dismissals ONLY.** Append an id only for a judgment that cannot
   change: pre-cycle by an EXACT date, obviously not WoW, or a fact about the video that
   rules it out (a 20-second duration, no caption track of any kind). **Budget and transport
   dismissals stay UNSEEN** — the tail below a newest-first window, the nightly's keyword
   cut, a fetch that failed on transport, and any date that is only approximate (yt-dlp
   `approximate_date` rounds older uploads to mid-month, so 103 "pre-cycle" videos on
   2026-08-15 were deliberately NOT retired). Marking a budget cut as seen silently abandons
   a handed-forward backlog: three runs left 151, ~120 and 116 in-cycle videos out of the
   lanes on purpose, and it is the same failure that skipped Tactyks and J-Funk on "dungeon
   guide" titles. That is what makes the next run's accounting auditable: anything not in
   one of the four lanes is genuinely unexamined and will be reconsidered.
   **Title-filtering is RUN-MODE dependent** (Riley,
   2026-08-08) — the two transcript sources have wildly different costs:
   · **LOCAL run (yt-dlp): replace the keyword filter with a DATE bound.** Do not judge on
     the title — judge on whether the video could possibly contain current-cycle content.
     Fetch every unseen video **published on or after the current PTR cycle's OPENING
     build** — the OLDEST date in `data/ptr-builds.json`, which is 2026-06-18 for 12.1.
     Ignore anything older, because a video that predates the cycle cannot discuss it.
     **Take the date, do not take an index.** That file is stored NEWEST-FIRST, so
     `builds[0]` is the most recent build (2026-08-06 today) and using it would bound the
     sweep two months too late and silently drop most of the cycle — this line said "the
     FIRST entry" until 2026-08-14 and meant the opposite of what it read as. Derive it:
     `Math.min(...builds.map(b => b.date))`, or `builds.at(-1).date` while the file stays
     sorted. This bound matters: measured 2026-08-08, dropping the title filter alone exposed
     **435 unseen videos**, because every newly-added creator has their whole 15-entry feed
     unseen and RSS reaches back years. The cycle bound cuts that to ~253, and it is a hard
     fact rather than a guess — unlike a title. If a sweep is still too large, tighten by
     taking the newest first; never re-introduce keyword filtering as the limiter.
     Transcripts are free here, and the title is a bad predictor: the 2026-08-08
     run filtered out **42 of 47** videos on titles and, in doing so, skipped **Tactyks and
     J-Funk entirely** — the two creators added days earlier specifically to close
     Protection Paladin and Windwalker — because their uploads were labelled "dungeon
     guide". A Method guide author's dungeon guide routinely carries spec analysis; a
     title cannot tell you that. Skip only what is obviously not WoW at all.
     Expect this to grow the `skipped[]` lane fast, which is the point: a verified skip is
     a durable record that costs one fetch once, whereas a title guess costs the take
     forever.
   · **NIGHTLY (Supadata): KEEP the keyword filter** — class/spec/Midnight/12.1/Season.
     The free tier is **100 requests per MONTH** (`PER_RUN_CAP = 25` per run is only the
     per-run guard), so an unfiltered nightly would burn the monthly budget in two runs.
     Breadth belongs in local runs, which have no quota.
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
   **The QUEUE stays keyword-filtered even on a local run.** The unfiltered sweep above
   applies to what you fetch YOURSELF with yt-dlp, which is free. Anything you hand to the
   queue is drained by Supadata against a 100-request MONTHLY budget, so queueing every
   title-irrelevant video a local run happened to fail on would spend the nightly's quota
   on exactly the content the nightly filter exists to avoid. Locally: fetch broadly, queue
   narrowly — if yt-dlp fails on a video whose title carries no class/spec/12.1/Season
   signal, record it in log.md and move on rather than queueing it.
   **When you transcript-verify a video and distil NOTHING from it, move it to the
   `skipped[]` lane in the same file** — `{id, creator, title, reason, verifiedAt}`, where
   `reason` says what the transcript actually turned out to be. Validation enforces the
   shape and refuses to let an id sit in both lanes. This lane is DURABLE: before it
   existed (added 2026-07-31), "verified-skipped" lived only in log.md prose, every run
   re-derived its seen-set by regex over that prose, and Shadarek's comedy tier list
   `Z8Jygl_NpF4` came back three separate times — each costing a transcript fetch and a
   re-read. **Step 1 discovery must treat `skipped[]` ids as already-seen**, exactly like
   distilled ones. Only re-open one if you have a positive reason (e.g. the creator
   re-uploaded different content under the same id), and say so in the log.
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
   (c) **`latest` states what is actually KNOWN, never merely the newest upload** — advance
   it only to a video this run distilled, or write an explicit non-claim ("queued 2026-08-10,
   NOT yet distilled"). This is uniform across lanes: the `generalCreators` fields hold
   distilled one-line reads too (izen's is a full meta summary), so overwriting one with a
   fresh title trades information for recency; (d) note processed videoIds in `log.md`'s seen-set like any other creator.
5. `npm run test:quiet && npm run build`; **PREPEND** date · videos processed · takes added · metaNotes added to `log.md` — insert directly under the header block, never `cat >>` at the end. The log is NEWEST-FIRST and says so in its own header; this said "append" until 2026-08-15 and the next nightly re-scrambled three of the four logs by obeying it. If any data/ file changed this run, finish with `node src/snapshot.mjs` (movement baseline; loadData skips baselines identical to the current state, so ordering vs the build is safe).

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

### Distillation rules promoted from `log.md` (2026-08-15 context audit)

These are the honesty rules of this skill — most were learned by a run nearly writing a
claim the source did not make. They lived only in run-log prose until the log outgrew the
Read tool (it passed the 262,144-byte gate, so a bare Read returned NOTHING) and had to be
pruned.

- **Parse `media:description` alongside the title on every discovery pass.** It costs
  nothing over the RSS fetch already being made and settled five borderline titles in one
  nightly and six in the next with no transcript spent: a description copying the title is
  the clip-short shape, a bare Twitch link is a restream. It works the other way too —
  Obli`s `0D5cRjmmfqM` was queued *against* the key-run precedent because its description
  was an explicit build breakdown, and it yielded a take.
- **Verify every distilled claim against its own transcript before committing (2026-08-07).**
  A read-only pass over each new take and metaNote: every number attached to the referent the
  creator attached it to; no causal clause inverted; no ASR mangle written as a name; no
  sentence from another video. **A claim must rest on the source it deep-links.** One pass
  caught all four at once — a guest's "triple every other healer" bolted onto the measured
  78-80k instead of the halved 38-40k hypothetical (understating the real gap by half while
  reading like a quote), izen's Mistweaver logic inverted, the ASR pseudo-name "Ullhon"
  written as a person, and "Void Blast cannot be cast while moving" imported from the 08-04
  AutomaticJak entry and absent from the cited transcript.
- **A list-mention is not a read (2026-08-07).** Never distil a claim whose only evidence is
  membership in a bare enumeration ("like BM, like Fury, like Devastation"). Require a second,
  spec-specific mention; if the spec is not named at all there is no claim. Three proposed
  metaNotes rested solely on list membership and were dropped — **Frost DK was never named**,
  the only reference being "both of the DK specs" — and two would have flipped a substantive
  prior read (Frost 07-14 positive → neutral, BM 07-06 positive → negative).
- **Never mint a `neutral` take to record that you watched something (2026-08-08).** A
  transcript with no comparative read goes to `skipped[]`. `expertRead` abstains on neutral but
  still counts that creator in the panel denominator, so a filler neutral asserts a directional
  view they never expressed AND dilutes the spec's real reads. (A neutral the creator genuinely
  expressed is fine — the defect is the placeholder.) Same trap in another shape: reading "new
  set beats old set" as a spec buff would fire for every spec with a guide video.
- **Guide-shaped content yields no take, and spec-name frequency is not a signal
  (2026-08-08).** Dungeon/boss guides, spec how-tos, gearing / loot / bonus-roll /
  embellishment PSAs, trinket guides and UI setups carry no spec-strength read — verify by
  transcript, then `skipped[]`. All **seven** dungeon/boss guides in the first unfiltered sweep
  carried zero spec reads, and their apparent spec mentions were ability names (Bound by
  Shadow, unholy mending, bloodsworn). Never mint a take from an item- or gear-level claim: a
  crafted-gear nerf lands on every spec equally, and Whispyr's "pretty strong" dagger is
  explicitly not amplified by Assassination's mastery.
- **Scarcity is when fabrication is most tempting (2026-08-07).** A spec at `ptr: null`, with
  one creator, or in a bracket the projection reports as prior-only is never a licence to lower
  the evidence bar — and anticipation ("interested to see what Frost DK would be like") is not
  a read. A targeted sweep that finds nothing must report nothing: the tank/healer raid sweep
  found one key VOD whose only "raid" cluster was a game-design opinion, and distilling it would
  have manufactured exactly the signal the run went looking for.
- **ASR gives you no speakers — get identity from metadata, not the caption track
  (2026-08-07/08).** On any transcript with guests, co-streamers or chat, attribute a claim to
  the registered creator ONLY where the transcript anchors it to them by self-reference ("my
  tier list", "it's in the description"); otherwise drop it. A Resto Druid read in
  AutomaticJak's stream was declined on that test, Maximum's `ahFknNijxh4` is a watch-along
  whose tier-list commentary is **Zorthas' script read aloud**, and the 08-13 Tactyks widening
  refused a co-stream passage for the same reason. Where scope or identity matters, harvest it
  deterministically: `yt-dlp --print "%(description)s"` yields the credited link block and the
  `HH:MM Topic w/ Guest` chapter lines — four Maximum panels gave 40 guest links and 82 chapter
  attributions at zero transcript cost, and independently confirmed Kalamazi as "Warlock" in
  all four.
- **Verify every id a discovery pass produces against the live RSS endpoint, with an author
  match, before it enters the registry, a take or the queue (2026-08-07).** The 75-agent
  discovery sweep's verifier caught **four fabricated or wrong video ids in its own output**.
  Treat a search result as a lead, never a fact.
- **A creator who authors one of our registered tier lists is firewalled from that bracket
  (2026-08-07).** Tactyks writes the Method M+ list, so every one of his entries carries RAID
  SCOPE ONLY — logging his M+ reads feeds `consensusFor` and `expertRead` from one voice on the
  same cell. Carry the constraint to any new class entry and re-verify it against the live guide
  page rather than assuming; three runs missed it and logged M+ takes anyway. **Pre-existing
  violations are an owner decision, not yours** — two live M+ Prot Paladin takes have been
  flagged (08-12, 08-13) and still await Riley. Flag, never retire.
- **Read the lens from `patchContext` when `bracket` is absent, and never treat (creator, spec,
  date) as a unique key (2026-08-05).** A missing bracket is not "whole spec". Write an explicit
  `bracket` on every new take, and bracket-split a video whose read genuinely differs. A naive
  `bracket ?? "both"` pass on Kalamazi's Warlock sims wrongly retired three live M+ reads, and
  the correction then over-restored a fourth — there are **two** Kalamazi Destruction takes
  dated 2026-08-01, one raid and one M+.
- **PvP is out of scope, and a PvP-lens read must never vote in PvE (2026-08-09).** Duels, solo
  shuffle, BG blitz, arena, PvP tuning roundups and PvP tier lists all triage out. A PvP creator
  answering "top classes next season" is still a PvP read: Supatease reasons his from DR
  categories, snares and the stamina increase. Titles are no defence — "The Tides of The Meta
  Are Shifting", "New Meta Incoming" and "12.1 Class Changes Update Healers" all reached the
  queue and all turned out PvP-framed, their "tier list" a PvP one.
- **Detect live streams and clips from metadata, never queue them, and purge one already
  queued (2026-08-09).** `live_status: is_live` (or `duration=NA` with a timestamped title)
  means no captions can exist yet — leave it UNSEEN so the VOD is picked up next run. A
  sub-minute `duration` is a durable fact, so `seen[]`. An ended-live VOD of an already-queued
  premiere is duplicate content, not a second slot. This is not theoretical: `bqVHzvKJCuA` has
  sat queued while still live and spent a Supadata request on at least three nights, against a
  100-per-month budget already reading `limit-exceeded`.
- **Two different 429s, and confusing them costs a whole run (2026-08-06 / 2026-08-14).** An
  ISOLATED 429 on one caption download while the info fetch succeeds is transient throttling —
  `MdvcFzV0tmI` landed clean on a retry moments later, **without** `player_client=android`, so
  retry once before recording it unreachable. (The bot wall is the "Sign in to confirm you're
  not a bot" block, a different failure.) A 429 during a BATCH sweep is a rate-limit block that
  retries DEEPEN: 42 videos through one invocation drew a 429 that survived 30/60/90s backoffs,
  a 4-minute cooldown and a 7-minute cooldown — **0 of 42 transcripts retrieved**. Pace from the
  start and stop on the first 429. `--list-subs` is never rate-limited, so caption availability
  can still be probed mid-block.
- **Prove any grep/regex triage pass on a known-positive file before trusting it
  (2026-08-08).** An extractor that returns zero hits looks exactly like a batch with nothing in
  it. The first extractor in the 52-transcript sweep scored **zero hits on all 52 files** — a
  trailing `\b` in the alternation killed every prefix form ("underperform**ing**",
  "nerf**ed**") — and trusted, it would have reported an ~800k-word batch that actually held 7
  takes and 5 metaNotes as empty.
- **Measure the run's effect against `git show HEAD:dist/index.html`, never the working
  `dist/` (2026-08-08).** `npm test` runs a build smoke test that writes the real `dist/`, so by
  the time you think to copy it the comparison is post-change and reports zero movement whatever
  happened. Same discipline before claiming a metaNote moved anything: the general-creator nudge
  is gated on ≥2 creators agreeing, unanimous (render.mjs), so a one-voice lane is display-only.
- **Rejected creators and blocked hosts — do not re-research (2026-08-07 / 2026-08-08).** The
  durable rule: never add a creator who recaps our own registered tier lists on screen, which
  launders our sources back into the meta nudge as an independent voice. The register:
  **Samiccus** and **Geezax** (both read Icy Veins / Wowhead / Archon aloud); **Salty Clams**
  (no caption track on any video, so the pipeline can never return anything); PiTyy, Goop,
  Atlas, Rook, MissMarvel and **Touchpadwarrior** (premise failed — "warrior" refers to the
  touchpad, 15/15 uploads are comedy Shorts). Maxroll-byline candidates stay blocked until
  `maxroll.gg` is added to `CREATOR_HOSTS` in `validate.mjs` — still absent, and a reviewed code
  edit by design.
