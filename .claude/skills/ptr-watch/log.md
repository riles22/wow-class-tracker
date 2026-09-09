# ptr-watch run log

Keep the newest ~20 entries; prune older ones when appending — and MEAN it. Pruned
2026-08-15 (these four logs held 64-78 entries each, and none had ever been pruned): watch-creators had
reached 270KB, over the Read tool's 262,144-byte gate, so a bare Read of it returned NOTHING.

This file holds NO machine state. The seen-set moved to structured data on 2026-08-08
(pending-transcripts.json seen[]/skipped[]/videos[] plus take urls) precisely because
regexing ids out of this prose absorbed 231 ordinary English words into a 950-entry set;
parse counts are logged "for the record" behind no gate. It is narrative memory, and it is
prunable. Durable RULES belong in SKILL.md, not here — the 2026-08-15 prune had to promote
~31KB of parser traps out of the prune range first, because they existed nowhere else.

Entries are sorted NEWEST FIRST by date. Two forms are in use ("- <date>" and "## <date>"),
they interleave, and refresh-tiers was chronologically scrambled before this prune — so sort
by parsed DATE, never by position. Do not cite lines of this file by NUMBER from anywhere
else; grep for a phrase (docs/s2-flip-runbook.md used to do that and would have broken).

## 2026-09-09 (nightly) — nothing new in any channel; official ledger unchanged at 102 sections

**Official revision ledger first, as the skill orders.** This run's pre-agent receipt (checkedAt
14:49:21Z) returned both sources `success`: live-hotfixes topic 2336376 post 1 still **version 31** /
updatedAt 2026-09-05T01:21Z, ptr-preview topic 2344395 post 1 still **version 3** / updatedAt
2026-09-03T22:48Z. Every one of the **102 class sections** hashed identically to the committed ledger,
so all prior resolutions carried forward (**5 applied, 97 irrelevant**) — no new, edited, removed or
unresolved sections, and only `checkedAt` moved in `data/official-notes.json`.
`check-official-notes.mjs --base=HEAD` passes.
The 12.1.5 lane stayed **NOTES ONLY**: `PHASES.ptr` still null, nothing written into `ptr-builds` or any
`spec.ptr` verdict, no forecast reopened, no archived 12.1 PTR metric relabelled.

**Feed sweep — four channels, not one.** (1) Wowhead RSS 198,705 B, 40 items parsed per `<item>` block;
newest live 12.1 class item is still *September 4th Hotfixes* (news=382760), already logged.
(2) The news INDEX (which leads RSS within a run) brace-balanced from `data.news.newsData`: agrees, newest
382735. (3) Blue tracker `data.blueTracker.default`, 50 entries: newest class-relevant post is still
Linxy's 09-04 hotfix topic. The one new Linxy-flagged topic since, **2343549 "Week 3 of 3: Interrupts and
dispels"**, was fetched and is a PLAYER bug-report thread (a quest not counting warlock pets) — logged here
so the next run does not re-open it. (4) Dev-notes thread `2317811.json`: 17 posts, highest_post_number 19,
last post 2026-07-31 — the closed cycle, expected, rediscovery gotcha still suspended.
`ptr-builds.json` unchanged at **29 entries**, newest 2026-09-04. No set-bonus line landed, so no
`tierSet.asOf` bump and no gearing resync.
Everything newer in the feeds is 12.1.5 datamining, the Kith'ix raid-testing schedule, or non-class content.

Dormant lanes skipped as designed (zones 54 / 52 / 56 / 57); their contract rows left the manifest at the
flip, so they are absent rather than "unreachable". One writeup gap remains and is deliberate: Demonology
Warlock, whose source reported no changes.

## 2026-09-09 (local, scheduled) — ledger re-checked at a fresh receipt (102 sections, 0 unresolved, nothing moved upstream); no new live 12.1 tuning; no 12.2

- **Ran the trusted collector locally** because no nightly output landed today (see below):
  `node src/fetch-official-notes.mjs` → both sources `success`, checkedAt
  2026-09-09T14:14:40.941Z. live-hotfixes 99 class sections, ptr-preview 3.
- **Upstream has NOT moved.** Compared field-by-field against the committed ledger: post
  identity is IDENTICAL on both sources — live-hotfixes topic 2336376 post 1 still
  **version 31** (updated 2026-09-05T01:21:46Z, bodySha256 `443e3bd1e9d2…`), ptr-preview
  topic 2344395 post 1 still **version 3** (2026-09-03T22:48:20Z, `970dd474c20f…`). Section
  inventory diffed by (id + sha256): **0 sections only in the committed ledger, 0 only in the
  fresh receipt**. Dispositions carried forward untouched — live-hotfixes 2 applied / 97
  irrelevant, ptr-preview 3 applied, **0 unresolved, 0 removedSections**.
- **So the only edit was the intake stamp**, both `checkedAt` fields 09-08T14:47:08.969Z →
  09-09T14:14:40.941Z; `git diff --numstat` = 2 insertions, 2 deletions, and the built
  artifact moved by exactly the one rendered date (+ its CSP hash). This is the intake
  check advancing, NOT a new date for any tuning fact — CLAUDE.md's rule, held literally.
  `check-official-notes.mjs` went from "ledger does not match trusted current source
  revision/section inventory" (its only failing condition here is `checkedAt` inequality)
  to green.
- **RSS sweep: 40 items, no new live 12.1 tuning.** The newest tuning-shaped items are still
  "September 4th Hotfixes — Ula'tek, Classes, Catalyst" (published 09-05) and "…Hotfixes for
  September 3" (09-04), both already logged — `data/ptr-builds.json` newest entries are the
  09-04 and 09-03 `kind: "hotfix"` round-ups. Nothing since.
- **No 12.2 anywhere.** Every PTR-category item in the feed is 12.1.5 (Kith'ix raid testing
  schedule, Labyrinth rewards, trading-post/transmog datamining, maps, renown). The one
  class-relevant 12.1.5 item, "Class Changes for Devourer DH — 12.1.5 PTR Development Notes"
  (09-03), is exactly the ptr-preview post already distilled into the three applied sections
  (Demon Hunter|Devourer, Hunter|Marksmanship, Warrior|Protection). 12.1.5 stays notes-only:
  `PHASES.ptr` untouched, frozen forecast untouched.
- **Dormant lanes skipped as specified** — the four PTR WCL zone sweeps (54/52/56/57) were not
  attempted and need no manifest excuse; their contract rows went at the flip.

## 2026-09-08 (nightly) — official ledger clean (102 sections, 0 unresolved); no new live 12.1 tuning in any of the four channels

- **Revision ledger FIRST, before the RSS/date sweep.** `official-notes/evidence.json` +
  `pending.json` checkedAt 2026-09-08T14:47:08Z, both configured sources `success`:
  · **live-hotfixes** topic 2336376 post 1, **version 31**, updatedAt 2026-09-05T01:21:46Z, 99 sections
  · **ptr-preview** topic 2344395 post 1, **version 3**, updatedAt 2026-09-03T22:48:20Z, 3 sections
  Body hashes and **all 102 section hashes identical** to the committed ledger, so every prior
  resolution carried forward untouched — **5 applied / 97 irrelevant / 0 unresolved**, and
  `removedSections` stayed empty on both sources. Neither post number nor version moved, which
  is the point of hashing every section rather than trusting the newest feed date. Wrote
  `pending.json` to `data/official-notes.json`; the ONLY diff is `checkedAt`
  (2026-09-07T16:04:02Z → 2026-09-08T14:47:08Z), 2 insertions / 2 deletions.
  `node src/check-official-notes.mjs --base=HEAD` passes.
- **12.1.5 stayed NOTES ONLY.** `PHASES.ptr` is still null, nothing entered `ptr-builds.builds`
  or any `spec.ptr` verdict, no forecast reopened, no archived 12.1 PTR metric relabelled. The
  three preview sections still carry their attributed summaries (Devourer DH Collapsing Star /
  Demonic Intensity / Monster Rising; Marksmanship's Blood Fletching replacing Unload;
  Protection Warrior's Execute rework).
- **Four channels swept, not one — all four agree there is nothing new.**
  1. **Wowhead news RSS** `/news/rss/all`: HTTP 200, 187,755 bytes, 40 items parsed per `<item>`
     block (never by tag adjacency). Newest LIVE 12.1 class item is still *September 4th Hotfixes
     — Ula'tek, Classes, Catalyst* (news=382760, Fri 04 Sep 20:30 CDT), already logged as the
     2026-09-04 entry.
  2. **The news INDEX**, which leads the RSS within a run: `data.news.newsData` brace-balanced
     from the id attribute (the `</div>`-terminated slice and a naive `}` search both fail here).
     Page 1 of 1,549 agrees with the RSS exactly; newest is news=382776, 12.1.5 Labyrinth
     rewards, 2026-09-08 09:00. **Both index and blue tracker needed the FULL browser header
     set** — a short UA+Accept curl drew CloudFront 403 (919 bytes) on both, and the full set
     returned 200 at 45,053 / 68,243 bytes. Re-learned this run; it is the documented rule and
     it still bites.
  3. **Blue tracker**: `data.blueTracker.default`, 50 entries (~30 unique topics). Newest
     class-relevant post is Linxy *World of Warcraft: Midnight Hotfixes - 4 September* at
     2026-09-04T20:22Z. No standalone class-tuning blue post since — the Kaivax-style channel
     that hid six healer specs for 17 days is clear.
  4. **Official dev-notes thread** `2317811.json`: 17 posts, highest_post_number 19, last post
     **#19 Linxy 2026-07-31**. That is the CLOSED 12.1 PTR cycle sitting quiet exactly as
     expected, and the thread-rediscovery gotcha stays suspended — the 12.1.5 preview has its
     own configured source and opening a 12.2 cycle is an owner action.
- Everything newer in the feeds is 12.1.5 datamining (Labyrinth rewards, Kith'ix loot, trading
  post, mount models), RWF recaps, or non-class content. **No tier-set-touching highlight
  landed**, so no `spec.tierSet` needed bumping and the gearing mirror needed no resync.
- **Dormant lanes untouched, as designed**: zones 54 / 52 / 56 / 57 were not swept and carry no
  contract row. Their stored rows in specs.json are the closed cycle's final receipts.
- ptr-builds.json unchanged: 29 entries, newest 2026-09-04, oldest 2026-06-18.

## 2026-09-07 (nightly) — official ledger clean (102 sections, 0 unresolved); no new live 12.1 tuning in any of the four channels

- **Revision ledger FIRST, before the RSS/date sweep**, because a post can be edited without
  acquiring a new date or reply. `official-notes/evidence.json` + `pending.json` checkedAt
  2026-09-07T16:04:02Z, both configured sources `success`:
  · **live-hotfixes** topic 2336376 post 1, **version 31**, updatedAt 2026-09-05T01:21:46Z, 99 sections
  · **ptr-preview** topic 2344395 post 1, **version 3**, updatedAt 2026-09-03T22:48:20Z, 3 sections
  Body hashes and **all 102 section hashes identical** to the committed ledger; `removedSections`
  empty on both. Dispositions carried forward on identical hashes rather than re-asserted:
  **5 applied, 97 irrelevant, 0 unresolved.** `data/official-notes.json` rewritten from the trusted
  pending ledger — the only change is the two `checkedAt` stamps. `check-official-notes.mjs` passes.
- **Wowhead RSS**: 40 items, 2026-09-02 → 2026-09-07, parsed per `<item>` block (never by tag
  adjacency). Newest class-tuning item is "September 4th Hotfixes - Ula'tek, Classes, Catalyst",
  **already logged** as the 2026-09-04 hotfix entry. Everything after it is 12.1.5 datamining,
  Trading Post, the raid skip, TBC and BlizzCon — no live 12.1 class tuning.
- **News INDEX polled too**, because it leads the RSS within a run. `data.news.newsData`
  brace-balanced from the id attribute: 20 posts, newest **382771** (09-07, Trading Post
  datamining). Nothing the RSS did not already have.
- **Blue tracker** (`data.blueTracker.default`, same parse): 50 entries, deduped by topic. Newest
  class-relevant blue post is Linxy's "Midnight Hotfixes - September 4" on topic **2336376** — the
  running compilation the ledger already covers. No newer standalone class-tuning topic; the last
  was "Class Tuning Incoming – September 1", already in the feed.
- **Official dev-notes thread** `2317811.json`: still ends at **post 19** (Linxy, 2026-07-31). That
  is the closed 12.1 PTR cycle, not a lost thread — the rediscovery gotcha stays suspended and no
  thread key was touched.
- **Nothing written to the feed.** No build/hotfix entry added, no `tierSet` touched (so the upkeep
  gate and the gearing mirror needed no change). The 12.1.5 lane stayed NOTES ONLY: `PHASES`
  untouched, nothing into `ptr-builds.builds` or any `spec.ptr` verdict, no forecast reopened, no
  archived 12.1 PTR metric relabelled.
- **Dormant lanes correctly skipped**: zone-54 raid testing, zone-52 Dummy Dome, zone-56 PTR M+ and
  zone-57 Tidebound Grotto were not attempted and have no contract rows. Their stored values remain
  the closed cycle's final receipts.

## 2026-09-06 (nightly, SECOND run of the day) — ledger re-checked at a fresh receipt, no new sections; no new live 12.1 tuning; 12.1.5 stays notes-only

- **Revision ledger first, as the skill orders.** `official-notes/evidence.json` (`checkedAt`
  2026-09-06T19:44:27Z, i.e. a receipt taken ~6h after the 13:49Z one the previous run consumed)
  reports BOTH configured sources `success`: `live-hotfixes` topic 2336376 post 1 at **version 31**,
  `updatedAt` 2026-09-05T01:21:46Z, body sha `443e3bd1e9…`; `ptr-preview` topic 2344395 post 1 at
  **version 3**, `updatedAt` 2026-09-03T22:48:20Z, body sha `970dd474c2…`. Both revision numbers and
  both body hashes are unchanged against the committed ledger.
- **Section inventory compared whole, not by post version.** A structural diff of
  `official-notes/pending.json` against `data/official-notes.json` reports the two files
  **byte-identical apart from `checkedAt`** — so 0 sections added, 0 removed, 0 with a changed
  sha256, across 99 live-hotfix sections (2 `applied`, 97 `irrelevant`) and 3 ptr-preview sections
  (all 3 `applied`). **0 unresolved, 0 tombstones.** The ledger was rewritten with this run's
  `checkedAt` and nothing else; `node src/check-official-notes.mjs` passes.
- **Live 12.1 tuning lane: nothing new, four channels polled.**
  · **Wowhead news RSS** — 200, 177,836 bytes, 40 items parsed per `<item>` block (never by tag
    adjacency), window 2026-09-02..2026-09-06. Newest hotfix round-up is still **news=382760,
    "September 4th Hotfixes - Ula'tek, Classes, Catalyst"**, which is already the feed's newest
    entry. Nothing tuning-shaped on 09-05 or 09-06.
  · **Wowhead news INDEX** (`data.news.newsData`, brace-balanced from the id attribute) — 20 posts,
    top id 382762 at 2026-09-06 13:43. It agrees with the RSS rather than leading it this run, so
    nothing landed mid-run.
  · **Official dev-notes thread 2317811** — fetched by curl (not WebFetch, which truncates the
    `post_stream`): 17 posts, `last_posted_at` **2026-07-31T23:42:09Z**. The 12.1 PTR thread is
    closed, exactly as the between-cycles posture says; this is not a lost thread.
  · **Blue tracker** (`data.blueTracker.default`) — 50 entries, 40 unique topics. Newest
    class-relevant blue post is Linxy's 09-04 hotfix topic (2336376), already logged. **Topic
    2342331 "Class Tuning Incoming – September 1" was re-fetched and re-read at version 4**
    (post 1, `updated_at` 2026-08-31T19:44:31Z) because the tracker restamps it: its fifteen PvE
    lines plus the class-wide Shaman/Farseer line are line-for-line what the 2026-08-28 feed entry
    already carries, and the separate Player versus Player section remains out of scope.
- **Nothing written to `data/ptr-builds.json` and no `tierSet` touched** — no build, no hotfix
  round-up and no set-bonus line arrived. The tier-set upkeep gate and the
  `specsAffected` ↔ `highlights` coverage gate both stay green untouched.
- **12.1.5 remains NOTES ONLY.** `PHASES.ptr` is still null, no 12.1.5 material entered
  `ptr-builds.builds` or any `spec.ptr` verdict, the frozen 12.1 forecast was not reopened, and no
  archived 12.1 PTR metric was relabelled. The three preview sections stay in the ledger's
  `notes[]` lane where they render as "12.1.5 PTR preview — not live".
- **Dormant lanes skipped, as designed**: the four WCL PTR zone sweeps (54 raid / 52 Dummy Dome /
  56 M+ / 57 Grotto). Their contract rows were removed at the flip, so they get no manifest row and
  the stored zone-52/54/56 receipts were not touched.

## 2026-09-06 (nightly) — official ledger clean and unchanged, no new live 12.1 tuning, 12.1.5 stays notes-only

- **Revision ledger first, as the skill orders.** `official-notes/evidence.json` (`checkedAt`
  2026-09-06T13:49:37Z) reports BOTH configured sources `success`: `live-hotfixes` topic 2336376 post 1
  at **version 31**, `updatedAt` 2026-09-05T01:21:46Z, body sha `443e3bd1e9…`; `ptr-preview` topic
  2344395 post 1 at **version 3**, `updatedAt` 2026-09-03T22:48:20Z, body sha `970dd474c2…`. Both the
  revision numbers and the body hashes are IDENTICAL to the committed ledger, and a section-by-section
  comparison found **0 sections added, 0 removed and 0 whose sha256 changed** (99 live-hotfix sections,
  3 ptr-preview sections). Every prior resolution therefore carried forward untouched — 2 applied +
  97 irrelevant on the live lane, 3 applied on the preview lane, **0 unresolved**, 0 tombstones. The
  only edit written to `data/official-notes.json` was the two `checkedAt` timestamps; no disposition,
  reference, section hash, source identity or date was invented or altered.
  `node src/check-official-notes.mjs` passes ("Official-note revisions, section dispositions and
  applied references verified").
- **12.1.5 stays NOTES-ONLY.** `PHASES.ptr` is still null, nothing entered `ptr-builds.builds` or any
  `spec.ptr`, no tier set moved, no forecast reopened, and no archived 12.1 PTR metric was relabelled.
  For the record, the three preview sections cover **Devourer DH, Marksmanship Hunter and Protection
  Warrior** — the same three specs both distilled creators independently describe as the whole first
  round of 12.1.5 class changes.
- **RSS sweep — 40 items, window 2026-09-01T19:23 to 2026-09-06T08:00.** Parsed per `<item>` block
  (title THEN link), never by tag adjacency. Nothing new in the LIVE 12.1 tuning lane: the newest
  relevant article is "September 4th Hotfixes - Ula'tek, Classes, Catalyst" (2026-09-04 20:30), which
  is already logged as the 2026-09-04 hotfix entry and already resolved in the ledger. Everything else
  12.1.5-flavoured is content datamining (Kith'ix raid loading screen, cantrip items, labyrinth maps,
  mounts, key bindings, Prey renown, delve Hall of Fame) plus the "Class Changes for Devourer DH -
  Midnight 12.1.5 PTR Development Notes" article that the preview lane already owns. **No 12.2 PTR
  announcement.**
- **News INDEX polled as well, because it LEADS the RSS.** `data.news.newsData` extracted by anchoring
  on the id attribute and brace-balancing (string-aware) — 20 posts, `totalPages` 1548, newest
  **382640, 2026/09/06 08:00**, identical topline to the RSS. Nothing landed mid-run.
- **Blue-tracker sweep (step 3b) — the standalone-blue-post channel is quiet.** 50 entries parsed from
  `data.blueTracker.default`, deduped by topic. Newest Blizzard class content is Linxy's
  "World of Warcraft: Midnight Hotfixes - September 4" (topic 2336376, 2026-09-04 20:21) — the same
  post the trusted collector reads — and "Hotfixes: September 4, 2026". Since then: only 12.1.5
  overview/mount/PTR-category posts and BlizzCon marketing. The last CLASS TUNING post remains
  Linxy's "Class Tuning Incoming – September 1" (2026-08-31), already in the feed as the 2026-08-28
  build entry.
- **Official 12.1 dev-notes thread re-polled and still closed.** `2317811.json` via curl (not WebFetch,
  which truncates to post 1): HTTP 200, 72,308 bytes, `posts_count` 17, `last_posted_at`
  **2026-07-31T23:42:09Z** — unchanged since the cycle closed, exactly as the between-cycles posture
  predicts. Not a lost thread; the rediscovery gotcha stays suspended until an owner opens 12.2.
- **Dormant lanes skipped by design**, per the posture block: the four WCL PTR zone sweeps (54 raid /
  52 Dummy Dome / 56 M+ / 57 Tidebound Grotto). Their contract rows left at the flip, so they get no
  manifest row and nothing was fetched from warcraftlogs.com by this session.
- **Writeups**: exactly one spec still has `ptr: null` — Demonology Warlock, whose null is the
  deliberate "the source reported no changes" case, not a gap. Nothing was manufactured to close it.
  No tier-set-touching highlight landed, so the tier-set upkeep gate had nothing to pair and the
  gearing mirror needed no resynchronisation.

## 2026-09-05 (nightly, FOURTH run of the day) — official ledger clean and unchanged, no new live 12.1 tuning, 12.1.5 stays notes-only

- **Official revision ledger first, per the 2026-09-05 procedure.** `official-notes/evidence.json`
  and `pending.json` (checkedAt 2026-09-05T20:06:00Z) both come back `status: success`:
  live-hotfixes topic 2336376 post 1 at **version 31**, `updatedAt` 2026-09-05T01:21:46Z, 99 class
  sections; ptr-preview topic 2344395 post 1 at **version 3**, `updatedAt` 2026-09-03T22:48:20Z,
  3 sections. Every section hash matched its stored counterpart, so every prior resolution carried
  and **0 sections are unresolved** on either source; `removedSections` empty on both. The reviewed
  pending ledger was written to `data/official-notes.json` — the only byte that changed is each
  source's `checkedAt`. `check-official-notes.mjs` passes.
- **The three 12.1.5 sections stay exactly where they are**: Devourer DH, Marksmanship Hunter and
  Protection Warrior, each `applied` as a `notes[]` preview summary and nothing else. `PHASES.ptr`
  untouched (still null), no 12.1.5 line written into `ptr-builds.json`, no `spec.ptr` verdict, no
  tier set, no rating, no model input, no archived 12.1 PTR metric relabelled.
- **Wowhead news RSS**: HTTP 200, 193 KB, 40 items parsed per `<item>` block (never by tag
  adjacency), newest 2026-09-05 18:00 UTC. The only class-relevant item is "September 4th Hotfixes
  - Ula'tek, Classes, Catalyst" (news 382760, posted 09-04 20:30), which is the round-up already
  logged as the **2026-09-04** hotfix entry. Everything else is 12.1.5 datamining (loading screen,
  Cantrip loot, maps, key bindings, mounts, delve achievement, Venomstones, warband reputations),
  RWF coverage, encounter-only hotfixes ("Phase 2 Nerfed on Mythic Ula'tek", "Heroic Coiled Altar
  Nerfed"), or non-WoW. **Nothing new to log; the feed's newest entry stays 2026-09-04.**
- **News INDEX polled as well** (it leads the RSS within a run): `data.news.newsData` page 1, 20
  posts, top id 382694 at 2026-09-05 13:00 — nothing the RSS did not already carry.
- **Blue tracker swept** (`data.blueTracker.default`, 50 entries → ~30 unique topics). Newest blue
  class content is Linxy's "World of Warcraft: Midnight Hotfixes - September 4" (topic 2336376),
  i.e. the ledger's own live-hotfix source, already applied. "Week 3 of 3: Interrupts and dispels"
  (2026-09-01) was opened and checked: topic 2343549 is a PLAYER thread whose blue content is a
  quest-credit bug report about warlock pets — not class tuning, nothing to log. No standalone
  Kaivax/Linxy tuning post of the "Healer Tuning - July 16" shape exists since the last run.
- **Dev-notes thread re-polled for completeness**: `2317811.json` HTTP 200, 17 posts, highest post
  number 19, newest Linxy post **2026-07-31** — dormant exactly as the between-cycles posture
  predicts, and NOT a lost thread. No 12.2 PTR announcement anywhere in the sweep.
- **Dormant lanes skipped, not marked unreachable**: the four WCL PTR zone sweeps (54 raid, 52
  Dummy Dome, 56 M+, 57 Grotto) have no contract rows since the flip. Stored zone-52/54/56 rows
  are the closed cycle's final receipts and were not touched, refreshed, or reinterpreted.
- **Writeup coverage**: one spec still at `ptr: null`, Demonology Warlock, and that null is
  deliberate (the source reported no changes). No tier-set-touching highlight landed, so the
  tier-set upkeep gate had nothing to pair and no `tierSet.asOf` needed bumping — and therefore no
  gearing mirror resync was required this run.

## 2026-09-05 — Historical reconciliation and current tooltip corrections

- Fresh official compilation and scheduled announcements confirm all59 historical post-launch PvE sections already represented, including16 set-related sections. Replaced baseline exclusions with specific reason-only reconciliation notes; no duplicate tuning, changed dispositions or invented effective dates.
- Fresh Wowhead item tooltips271528/271564/271546 corrected Restoration2pc, Arcane4pc24% cap, Fire4pc25% damage bonus and Affliction2pc/4pc placement. Current tooltip corroborates Demonology's4pc effect despite Blizzard prose calling it2pc; discrepancy disclosed. Added dated caveats to3 archived writeups, preserving their verdicts and sources.
- Rebuilt gearing's derived spec data. Official-note digest now reports meaningful added/edited/removed applied summaries, including notes-only PTR preview, while ignoring check-time-only changes. The preview remains separate from forecasts.

## 2026-09-05 (nightly, THIRD run of the day) — official ledger clean, no new live tuning, 12.1.5 lane untouched

- **Revision ledger first, per the skill.** official-notes/evidence.json (checkedAt 18:47:09Z) reports
  both configured sources `success`: live-hotfixes topic 2336376 post 1 at **version 31**, updatedAt
  2026-09-05T01:21:46Z, **99 class sections**; ptr-preview topic 2344395, **3 sections**. Every section
  hash matches the committed ledger, so every prior resolution carried over — live 2 applied / 97
  irrelevant, 12.1.5 preview 3 applied notes (Demon Hunter, Hunter, Warrior) — with **0 unresolved and
  0 removed-section tombstones**. The reviewed pending ledger was written to data/official-notes.json;
  the ONLY change is the checkedAt instant. `check-official-notes` passes.
- **12.1.5 stayed NOTES ONLY**: PHASES untouched, nothing written into ptr-builds.json or any
  `spec.ptr` verdict, no forecast reopened, no archived 12.1 PTR metric relabelled.
- **Four channels swept, nothing new in the LIVE 12.1 tuning lane.** (1) Wowhead news RSS 193 KB, 40
  items parsed per `<item>` block, newest 2026-09-05 13:00 CDT — the only class-relevant items are the
  already-logged September 4 hotfix round-up (news=382760) and 12.1.5 preview coverage. (2) News INDEX
  (`data.news.newsData`, brace-balanced from the id attribute) polled too because the index leads the
  RSS: 20 posts, newest 382694, nothing the RSS lacked. (3) Blue tracker (`data.blueTracker.default`)
  50 entries / ~30 unique topics, newest 2026-09-04 20:23 — only the Sept 4 hotfix mirrors and 12.1.5
  items. The one candidate that looked like a standalone tuning post, Linxy in **"Week 3 of 3:
  Interrupts and dispels" (topic 2343549)**, was fetched directly and is a player quest-bug thread —
  worth recording so the next run does not re-chase it. (4) The tracked 12.1 dev-notes thread
  2317811.json: highest_post_number 19, last_posted_at 2026-07-31, quiet as expected for a CLOSED
  cycle — not a lost thread, and no agent-side thread-key change was made.
- No build or hotfix entry added; ptr-builds.json still tops out at the 2026-09-04 hotfix. No set
  bonus was touched this run, so the tier-set upkeep gate had nothing to pair.
- Writeup coverage recomputed rather than remembered: **1 spec at `ptr: null`** — Demonology Warlock,
  the deliberate one (the source reported no changes). Nothing to fill.
- Dormant lanes skipped as the between-cycles posture requires: zone 54 / 52 / 56 / 57 were NOT
  fetched and carry no contract rows; their stored receipts are the closed cycle's final state.

## 2026-09-05 (nightly, SECOND run of the day) — nothing new in the live 12.1 lane; the 12.1.5 PTR cycle is open and still UNINGESTED

- **Four channels polled fresh**, ~2h45m after the morning nightly. (1) Wowhead news RSS — HTTP 200,
  205 KB, 40 items parsed per `<item>` block, newest 2026-09-05 09:00 ("Tips and Tricks for Clearing
  Black Temple"). (2) Wowhead news INDEX (`data.news.newsData`, brace-balanced from the id attribute)
  polled as well because the index leads the RSS: 20 posts, newest id 382737. (3) Blue tracker
  (`data.blueTracker.default`): 50 entries, ~30 unique topics, newest 2026-09-04 20:23 — only the
  September 4 hotfix mirrors and the 12.1.5 items. No standalone live-12.1 class-tuning blue post.
  (4) Canonical sources read directly: Kaivax hotfix topic 2336376 is still titled "…Hotfixes -
  September 4", post 1 still at **version 31, last edited 2026-09-05T01:21:46Z** — identical to the
  state the morning run logged, so its round-up needed no re-log; and the 12.1 dev-notes thread
  2317811 is quiet at 19 posts, last 2026-07-31, which is what a closed cycle looks like.
- **Nothing logged.** `data/ptr-builds.json` is unchanged at 29 entries, newest 2026-09-04.
- The Enhancement Shaman set-bonus line in the September 4 round-up **stays deferred** to an owner
  local run for the reason already written into that entry's label: the tier-set upkeep gate plus the
  2026-08-23 two-page rule need `gearing/data/specs.json` resynced in the same change, and gearing/
  never travels in the nightly refresh artifact.
- ⚠️ **OWNER ESCALATION, second night running: the 12.1.5 PTR is open.** Linxy's "Midnight: 12.1.5 PTR
  Development Notes" (us topic **2344395**, posted 2026-09-03T16:42Z, version 3) was read this run and
  it carries a real CLASSES section — Demon Hunter › Devourer: Collapsing Star no longer goes on a
  5-second cooldown when its cast is cancelled, gains extra range after the cast starts, and its
  Fury-drain slow is now time-limited to ~1.5 casts; Void-Scarred bonuses (Demonic Intensity et al.)
  move onto Collapsing Star casts rather than onto entering Void Metamorphosis. The news feed now
  carries a dozen 12.1.5 articles. **Opening a cycle is an OWNER action** — new `PHASES.ptr` entry,
  thread key, contract rows, zone probe via `node src/wcl-probe.mjs` — and `PHASES.ptr` is still null,
  so nothing 12.1.5 was written to the feed, to a writeup, or to a take.
- Dormant WCL PTR zone sweeps (52/54/56/57) correctly not attempted; their contract rows left at the flip.

## 2026-09-05 (nightly) — ONE new live-12.1 hotfix round-up logged (Sept 4), with its Enhancement Shaman set-bonus line deliberately DEFERRED to a local run

- **Four channels polled.** (1) Wowhead news RSS — HTTP 200, 205 KB, 40 items parsed per `<item>`
  block (never by tag adjacency), newest 2026-09-05 08:00. (2) Wowhead news INDEX
  (`data.news.newsData`, brace-balanced from the id attribute) polled as well because the index
  leads the RSS: 20 posts, newest id 382757. (3) Blue tracker (`data.blueTracker.default`): 50
  entries, ~30 unique topics, newest 2026-09-04 20:23 — only the hotfix mirrors (Kaivax + Linxy EU,
  plus the Blizzard News copy) and Linxy's 12.1.5 PTR Development Notes. No standalone live-12.1
  class-tuning blue post. (4) Canonical source read directly: Kaivax topic 2336376, now titled
  "World of Warcraft: Midnight Hotfixes - September 4", post 1 at version 31, last edited
  2026-09-05T01:21:46Z, read with heading structure INTACT.
- **Logged:** `data/ptr-builds.json` gains a 2026-09-04 `kind: "hotfix"` entry (feed now 29) —
  Balance Druid (Stellar Amplification cooldown-manager tracking; Twin Moons' range increased by
  target combat reach) plus the non-class round-up (Ula'tek Ingested Venom / Serpent's Bite overlap,
  housing Secret Souvenir credit, the non-set Catalyst-eligibility fix, Preternatural Antivenom).
  Classification CHECKED not assumed: the consolidated Balance line scores **buff** on the range
  increase, and the line is left as written rather than reworded — steering `classifyHighlight` by
  editing a highlight would be gaming the outlook tally.
- ⚠️ **DEFERRED, and this is a structural nightly limit worth remembering.** The same round-up carries
  "Enhancement Shaman — Corrected an issue where the Venomous Abyss 4-set bonus was not properly
  increasing the upfront damage of Crash Lightning." It is real 12.1 PvE tuning and belongs in the
  entry, but it trips `SET_KEYWORD`, so the tier-set upkeep gate demands Enhancement Shaman's
  `tierSet.asOf` advance to 2026-09-04 — and since the 2026-08-23 two-page rule that also demands
  `gearing/data/specs.json` be re-synced in the SAME change. **gearing/ never travels in the nightly
  refresh artifact** (publish uploads `data/` + skill logs and checks out master for everything else),
  so a nightly-side bump is unpublishable in both directions, and this was VERIFIED rather than
  assumed: bumping the tracker alone reds `validate` with "gearing/data/specs.json: Enhancement Shaman
  tierSet.asOf does not match data/specs.json", and syncing the mirror as well would simply be dropped
  at publish and red Gate 1 there instead. So the line is omitted from `specsAffected`/`highlights`
  and the omission is written into the entry's own `label`, the manifest row and here — an explicit
  deferral, not a silent under-distillation. **OWNER local run:** bump the tierSet asOf/source, run
  `node gearing/src/sync-tracker-fields.mjs && npm run gearing:build`, then add the line and
  Enhancement Shaman to the 2026-09-04 entry. Same shape as the 09-03 Holy Priest and 09-02 Fire Mage
  set lines, both of which a local run handled.
- **12.1.5 still NOT ingested.** The feed now carries nine 12.1.5 PTR articles (loading screen, Kith'ix
  loot, renown catch-up, maps, key bindings, "Class Changes for Devourer DH") and Linxy's dev-notes
  topic is on the blue tracker. Opening a cycle is an OWNER action — new `PHASES.ptr` entry, thread
  key, contract rows, zone probe — and `PHASES.ptr` is still null, so nothing 12.1.5 was written.
- Dormant WCL PTR zone sweeps (52/54/56/57) correctly not attempted; their contract rows left at the flip.


## 2026-09-04 (nightly) — nothing new in the live 12.1 lane; the September 3 round-up was already logged by a local run ~30 minutes earlier, and 12.1.5 stays UNINGESTED pending the owner

- **Four channels polled, not one.** (1) Wowhead news RSS — HTTP 200, 210 KB, 40 items parsed per
  `<item>` block, newest 2026-09-04 09:30. (2) The news INDEX as well, because the index leads
  the RSS within a run: `data.news.newsData` brace-balanced from the id attribute, 20 posts,
  newest 382645 at 09-04 09:30. (3) The blue tracker (`data.blueTracker.default`), 50 entries,
  newest 2026-09-03 19:16 — no standalone class-tuning blue post. (4) The canonical source read
  directly rather than off the Wowhead mirror.
- **The running hotfix post's `updated_at` is NOT a new-content signal.** Kaivax's topic 2336376
  shows post 1 `updated 2026-09-04T00:15:02Z`, which looks like a September 4 round-up landed —
  it has not. Read with its heading structure intact, the newest dated section is still
  **"September 3, 2026"**, whose two class lines (Priest › Holy 2-set Renew fix, Shaman ›
  Restoration Totemic Oversurge fix) are already stored verbatim in the feed's 09-03 entry with
  Holy Priest's `tierSet.asOf` advanced. Check the newest **section date**, never the post's edit
  timestamp. The old 12.1 dev-notes thread 2317811 is unchanged since 2026-07-31.
- **12.1.5 — still an OWNER action, still nothing ingested.** Linxy's "Midnight: 12.1.5 PTR
  Development Notes" (us.forums topic 2344395) is unchanged from what this morning's local run
  recorded: post 1 at **version 3**, last edited 2026-09-03T22:48:20Z, with posts #2 and #3 the
  usual empty reservation posts. Wowhead's 12.1.5 PTR news category has grown to nine articles in
  the current 40-item feed, including **"Class Changes for Devourer DH — Midnight 12.1.5 PTR
  Development Notes"**. None of it was written anywhere: opening a cycle means a new
  `PHASES.ptr` entry, a new `thread` key, contract rows and a `wcl-probe` zone enumeration, and
  `PHASES.ptr` is still `null`. Corollary for the creator lane the same night — the three
  12.1.5-changes videos in the RSS sweep have no lane to land in either, and were left unseen
  rather than queued.
- **Dormant lanes correctly untouched**: zones 54 / 52 / 56 / 57 were not swept and their
  contract rows do not exist; the stored zone-52/54/56 rows remain the closed cycle's receipts.

- **PRUNE DEFERRED to a local run, deliberately — and the reason is structural.** This log is at
  31 entries against the header's "~20", but a NIGHTLY cannot prune safely: the 2026-08-15
  precedent is that durable rules must be promoted into `SKILL.md` *before* the entries carrying
  them are dropped, and the publish job stages only `data/`, `dist/` and
  `.claude/skills/*/log.md` (nightly.yml) — a `SKILL.md` edit made here is never committed. So a
  nightly prune can delete a rule but cannot save it. Checked before deferring: the drop range
  (11 entries) holds one ⚠️ that IS safe to drop — the 2026-08-22 gearing tier-set
  sync handoff, verified resolved tonight (`check-refresh --age` no longer reds
  `gearing-tierset-sync`) — and nothing else rule-shaped. Files are 107 KB, well under the Read tool's 262,144-byte gate, so
  nothing is broken by waiting for a run that can do both halves.
## 2026-09-04 (local, scheduled) — **PATCH 12.1.5 PTR IS LIVE AND OFFICIAL** — the between-cycles posture ENDS on an owner action, not on this run; plus the September 3 hotfix round-up logged (2 class lines, one of them a set-bonus fix)

Ran ~40 minutes BEFORE today's nightly rather than after it — the 09-04 nightly had not fired at
14:0xZ (yesterday's fired late, 14:42Z). So this is a genuine first sweep of the day, not catch-up
verification, and the two findings below reached master ahead of the night rather than behind it.

- **The 12.2-announcement lane finally fired — as 12.1.5.** Yesterday's run chased the Dalaran
  Gaming "PATCH 12.1.5 LEAKED?" title down to eight player posts with zero blue and correctly
  logged it as speculation. It is speculation no longer: **Linxy posted "Midnight: 12.1.5 PTR
  Development Notes" (us.forums topic 2344395) at 2026-09-03T16:42:43Z**, post 1 now at **version 3**
  (last edited 22:48:20Z — already revised once). Posts #2 and #3 are Linxy's EMPTY reservation
  posts (0 bytes), the same shape the 12.1 thread used to accumulate later build posts. Wowhead
  mirrors it at news=382730 and has opened a **PTR news category** (nine 12.1.5 articles in the
  current 40-item feed: the reveal, datamined maps, mount models, key bindings, Warband
  reputations, Ascendant Venomstones, a solo-delve achievement, a vendor-mount cost update).
- **NOTHING FROM 12.1.5 WAS INGESTED, AND THAT IS THE RULE, NOT CAUTION.** The between-cycles
  block is explicit: opening a cycle is an **OWNER action** — a new `PHASES.ptr` entry, a new
  `thread` key, contract rows, and a zone probe via `node src/wcl-probe.mjs` — "not an agent-side
  thread-key update". Two further reasons it would have been wrong to log these into
  `data/ptr-builds.json` as ordinary entries: (a) the feed is the LIVE 12.1 lane, so 12.1.5 PTR
  changes would render in the drawer's shipping/development surfaces as though they were live
  now; (b) with `PHASES.ptr` null there is no era to attribute them to, so `classifyHighlight`
  would fold next-patch changes straight into the live outlook tally. The feed's `thread` key is
  untouched and still points at the closed 12.1 thread (2317811).
- **What the owner is deciding about, recorded so the decision does not need re-fetching.** The
  notes carry real class work for three specs: **Devourer Demon Hunter** (Collapsing Star range,
  no 5s cooldown on cancel, Fury-drain slow now time-limited; Void-Scarred reshuffled — Demonic
  Intensity now resets The Hunt at +30%, Violent Transformation resets Soul Immolation instead,
  Monster Rising Intellect 15%→10% and Collapsing Star damage 15%→20%); **Marksmanship Hunter**
  (new talent **Blood Fletching**, and **Unload has been removed**); **Protection Warrior**
  (Execute no longer consumes optional Rage and its damage is **increased by 100%**; Colossus's
  Practiced Strikes now cuts Execute and Revenge Rage cost by 10). Non-class: the "Promise of
  Tomorrow" campaign, Labyrinths (mega-dungeon-scale Delves), Aqir Invasions, a one-boss raid
  (**The Unbinding of Kith'ix**), Ascendant Venomstones (upgrade a fully-upgraded S2 Hero/Mythic
  weapon, trinket or necklace — a **gearing-lane** input when it ships), and Legion/BfA warband
  reputations. All read off the canonical thread, not the mirror.
- **The live 12.1 lane also produced a real entry**: the **September 3 hotfix round-up**, logged as
  the `2026-09-03` `kind: "hotfix"` build. Read from Kaivax's canonical running blue post (topic
  2336376, title rolled to "…Hotfixes - September 3", post 1 at **version 29**, last edited
  2026-09-04T00:15:02Z) with its `<ul>` heading structure intact, rather than off the Wowhead
  mirror. Both class lines sit under an explicit SPEC heading — Priest › Holy and Shaman ›
  Restoration — so there was no class-wide or hero-tree attribution call to make; the Shaman line
  names Totemic inside its own text under the Restoration heading, so it stays spec-scoped (the
  08-31 Affliction/Hellcaller precedent). No PvP section this round.
- **Classification was checked, and the two lines DISAGREE — which is worth writing down because
  every previous round-up in this cycle classified uniformly null.** The Holy Priest line is null;
  the Restoration Shaman line classifies **buff**, on "did not properly increase the healing done
  by". That vote was left standing rather than reworded away: the stored text is the verbatim
  blue-post line, and editing a highlight to steer `classifyHighlight` would be gaming the outlook
  tally. It is also defensible on the merits — a talent that was silently doing nothing and now
  works is honestly more healing than before the hotfix. Measured after the rebuild: **it moved no
  published outlook arrow** (Restoration Shaman's outlook was already ↗ off its dated verdict,
  which outranks the tally).
- **The Holy Priest line touches a SET BONUS, so the tier-set upkeep gate fired and was closed in
  this same commit** — including the gearing mirror, which the nightly structurally cannot do
  (publish stages `data/`, `dist/` and skill logs, never `gearing/`). `spec.tierSet.asOf`
  2026-06-30 → **2026-09-03**, source moved to the September 3 blue post, and the set2 TEXT gained
  a dated parenthetical rather than a rewrite, because this was a bug fix making the printed
  2-piece behave as written — no value changed. Exactly the shape of the 2026-09-02 Fire Mage
  close. `node gearing/src/sync-tracker-fields.mjs` reported the one field, and
  `npm run gearing:build` rebuilt the artifact in the same change, so the two pages cannot state
  different set bonuses.
- **Two encounter-tuning articles again correctly NOT logged** — the raid nerfs inside the same
  September 3 round-up (Ula'tek Caustic Waves, a Blight Vein tooltip correction) are encounter
  work, not class tuning, so they ride in the entry's `Non-class:` highlight and produce no
  `specsAffected`.
- **Dormant lanes skipped as prescribed** — the four PTR WCL zone sweeps (54/52/56/57). Their
  contract rows were removed at the flip, so they need no manifest excuse and got none. **Note for
  the owner:** when 12.1.5 opens as a cycle, this is where the new zone ids get probed.
- **Archon deliberately NOT re-probed from residential.** The wall is measured not IP-scoped
  (re-tested 08-27 and 08-30); the manifest's nine `archon-*` rows carry yesterday's finding and a
  residential GET would only re-derive a settled transport fact.


## 2026-09-03 (local, scheduled) — live lane swept clean; NO 12.1.5/12.2 PTR announcement, and the creator "leak" is player speculation with no blue post behind it

Ran ~40 minutes after tonight's nightly published (`b60bde2`, publish 15:05:31Z), so this is
catch-up verification rather than a second pass. **Nothing changed; no file this skill owns was
touched.**

- **Wowhead RSS swept fresh** (`/news/rss/all`, direct browser-UA GET, HTTP 200, 210,538 bytes,
  40 items reaching back to 2026-09-01T16:04). Parsed per `<item>` block, never by tag adjacency
  — the documented trap. Newest tuning-relevant article is **"Ula'tek Changes and Class Fixes -
  Patch 12.1 Hotfixes for September 2nd"** (2026-09-03T01:07), which tonight's nightly already
  logged as the `2026-09-02` `kind: "hotfix"` entry off the canonical Kaivax blue post. **No
  September 3 round-up has been published yet** — the feed's two newest items (14:00 Mark of the
  Illidari consumables, 13:00 a Race-to-World-First think piece) carry no tuning.
- **Two encounter-tuning articles were correctly NOT logged**: "Phase 2 Nerfed on Mythic Ula'tek"
  (09-02T17:33) and "Nymrissa Wavecaller Nerfs, Mythic Twin Fangs Changed" (09-01T17:22). Both are
  RAID ENCOUNTER tuning — boss health and mechanics — not class tuning, so they produce no
  `highlights` and no `specsAffected`. Recorded here because the titles read tuning-shaped and a
  future run may re-find them and wonder why they are absent.
- **The 12.2 / next-cycle lane is still empty, and the "leak" was chased down rather than
  dismissed.** Queued creator video `Kq3saXcBt10` (Dalaran Gaming, 09-02) is titled "PATCH 12.1.5
  LEAKED? MAYBE NEW PTR LATER?", which is exactly the general-creator LEAD the firewall says to
  verify against the official forum before believing. Verified:
  - Wowhead RSS carries **no** 12.1.5 or PTR article across all 40 items.
  - Blizzard forum search (`search.json?q=PTR order:latest`, 50 topics) surfaces one on-point
    thread — **"They're Really Delaying 12.1.5 PTR"** (topic 2344249, 2026-09-03T04:44). Fetched
    it: **all 8 posts are players, zero staff/blue.** Its content is speculation (one poster
    claims 12.1.5 notes appeared on Facebook and were deleted; another cites an interview saying
    "before BlizzCon"). None of that is citable and none of it is ingested — hard rule 1.
  - Net reading: there is **no PTR announcement**, and the community's own framing is that the
    PTR is LATE, not that it opened. The between-cycles posture holds unchanged.
- **Dormant lanes skipped as prescribed** — the four PTR WCL zone sweeps (54/52/56/57). Their
  contract rows were removed at the flip, so they need no manifest excuse and got none.
- **Archon was deliberately NOT re-probed from residential.** The wall is measured **not
  IP-scoped** (re-tested residentially 2026-08-27, and again on 08-30), and tonight's nightly hit
  it from CI ~40 minutes before this run and recorded all nine `archon-*` rows unreachable. A
  residential GET therefore re-derives a settled transport fact and answers nothing the nightly
  did not already answer; SKILL.md's "do not re-derive" applies. Reported from the nightly's
  finding instead.

## 2026-09-03 (nightly) — ONE new feed entry: the September 2 hotfix round-up (3 class lines, all bug fixes); PTR zone lanes dormant

- **New entry, 2026-09-02, `kind: "hotfix"`.** Canonical source read directly rather than off the
  Wowhead mirror: Kaivax's running hotfix blue post (`us.forums.blizzard.com/en/wow/t/2336376.json`),
  title now "World of Warcraft: Midnight Hotfixes - September 2", post 1 at **version 27**, updated
  2026-09-03T01:11:28Z; read with its `<ul>` heading structure INTACT. Three class lines:
  Druid > **Feral** (Unseen Predator Rank 1 now prefers targets not immune / not taking under 5%
  physical damage), Warlock > **Destruction** (Font of Venomous Rage channel could be cancelled if
  spell-queued after Cataclysm), and a **bare Warrior heading** with no spec block beneath it
  (Bladestorm now displays as an important aura on nameplates) — logged **class-wide** rather than
  guessed onto Arms or Fury, the 2026-08-26 Warrior precedent. All three classify **null** under
  `classifyHighlight` — checked with the real function, not assumed — so this round-up casts no
  outlook vote, which is the honest reading of a pure bug-fix pass. **No line touches a set bonus**,
  so no `spec.tierSet` date moves and the upkeep gate stays quiet.
- **Mirror-vs-canonical discrepancy worth recording**: Wowhead's news=382725 renders the Warrior line
  as "**Bladetorm**"; the blue post reads **Bladestorm**. Logged the canonical spelling.
- **The whole Player versus Player section triages out** (Balance Druid's Faerie Swarm raid-frame
  debuff, the Evoker PvP-vendor staff fix, Preservation's Rewind-under-Cyclone fix) — standing rule,
  not an omission.
- **Non-class content folded into the entry's summary line**: Mythic Ula'tek phase-two nerfs (Soul
  Constrictor duration to 5s, Blight Vein damage -25%, both Mythic-only), two Doomscale Egg pickup
  fixes, and two Catalyst repairs (remaining Great Vault items now convertible; certain non-armor
  items no longer appear convertible).
- **Lanes polled and otherwise empty.** Wowhead news RSS HTTP 200, 40 items spanning 2026-08-30T13:00Z
  to 2026-09-03T14:00Z. The news INDEX (`data.news.newsData`, 20 posts, totalPages 1547) tops out at
  the same id as RSS (382623), so nothing landed mid-run. Blue tracker (`data.blueTracker.default`,
  50 entries, 50 unique topics) carries no standalone class-tuning post beyond what is already logged;
  Linxy's "Week 3 of 3: Interrupts and dispels" (topic 2343549) turned out to be a player thread with a
  blue reply, not a class post. The dev-notes thread 2317811 is at 17 posts, `last_posted_at`
  2026-07-31T23:42Z — correctly quiet for a closed cycle.
- **Not logged, deliberately**: news=382721 "Phase 2 Nerfed on Mythic Ula'tek" is the same encounter
  work already covered by the Sept-2 blue post and carries no class content; news=382699 "Season 2 DPS
  Rankings for The Venomous Abyss: Week 2" is Wowhead's own analysis, not a Blizzard post and not a
  registered tier list.
- **No 12.2 PTR announcement anywhere** (RSS, news index, blue tracker, forum). `PHASES.ptr` is still
  null, so the between-cycles posture holds: **zone lanes 54 / 52 / 56 / 57 stayed dormant** and were
  not fetched or marked unreachable — their contract rows left with the flip. The expert lane is
  dormant for the same reason (`audit:creators` reports the coverage sweep suppressed).
- Note for the next run: Dalaran Gaming's 2026-09-02 stream is titled "PATCH 12.1.5 LEAKED? MAYBE NEW
  PTR LATER?" — a LEAD only. Nothing in the official forum, the blue tracker or Wowhead's news index
  supports a new PTR, so nothing was logged; the video is QUEUED for transcript so the claim can be
  read and checked against the canonical thread next run.
## 2026-09-02 (local) — the Sept 1 round-up logged (3 new class lines), and the deferred Fire Mage tier-set action CLOSED

- **Between-cycles posture unchanged**: live lanes only; PTR zone sweeps (54/52/56/57) stayed
  dormant. No 12.2 PTR announcement anywhere in the Wowhead RSS sweep (40 items, 25 of them
  dated 08-31 or later) — the 12.1 development-notes thread this feed's `thread` key tracks is
  still the closed cycle's.
- **Canonical source, not the mirror**: Kaivax's running hotfix blue post (us.forums topic
  2336376), title now "World of Warcraft: Midnight Hotfixes - September 1", post 1 at
  **version 26**, last edited 2026-09-02T00:30:25Z, read with its `<ul>` heading structure
  INTACT so every class line sits under an explicit SPEC heading. The Wowhead article is the
  citation only (news=382716 — the id was VERIFIED off the RSS `<link>`, not guessed; a first
  draft of this entry carried 382731 and was corrected before commit).
- **ONLY THREE class lines are new to the feed**, all bug fixes with no tuning value: Unholy
  Death Knight (Mastery: Dreadblade / Foul Infections not increasing Plague Erupt crit chance),
  Beast Mastery Hunter (Wild Thrash ignoring target bounding radius) and Assassination Rogue
  (Caustic Spatter triggering off non-class Nature damage such as trinkets).
- **The Sept 1 tuning pass itself is NOT re-distilled** — the 2026-08-25 precedent. It shipped
  verbatim from the already-logged 08-28 "Class Tuning Incoming – September 1" post; checked
  line by line against that entry and matching at identical values across all 15 spec lines,
  including the Mistweaver Monk 4-piece line (activation chance 25%, was 20%) whose
  `spec.tierSet` was already advanced to the announcing post. The outlook tally counts LINES,
  so logging them twice would double-count one pass. The Shaman › Farseer Natural Harmony fix
  is likewise already carried by 08-28.
- **The whole Player versus Player section triages out** — roughly half the post (Devourer DH,
  Havoc, Druid/Feral/Restoration, Devastation and Preservation Evoker, Beast Mastery, all three
  Mage specs, Discipline, Rogue/Assassination, Elemental and Enhancement Shaman, Arms, Fury).
  Standing rule, not an omission.
- **One line DISCLOSED rather than logged**: "Resolved an issue where Protection Paladin's
  Mastery did not function correctly against Caustic Deluge or Eternal Venom" names a spec but
  sits under Dungeons and Raids › The Venomous Abyss › The Twin Fangs, not under a Classes spec
  heading. By the heading-structure discipline this feed uses it is an ENCOUNTER line, so it is
  recorded in the non-class summary rather than minted as a Protection Paladin change.
- **THE 08-31 DEFERRAL IS CLOSED — this is the local run that entry asked for.** The Mage › Fire
  line ("Resolved an issue where the 2-piece set bonus: Flamestrike did not correctly always
  grant Hot Streak when it is a guaranteed critical strike due to Pyroclasm") is now logged, and
  the tier-set upkeep gate duly required Fire Mage's `spec.tierSet.asOf` to advance to
  2026-08-31. That fired the 2026-08-23 two-page rule exactly as predicted — `npm run validate`
  red with two errors naming `gearing/data/specs.json` — which is precisely why the nightly
  structurally could not do it (its publish job stages only `data/`, `dist/` and the skill logs,
  never `gearing/`). Fixed in the SAME change with
  `node gearing/src/sync-tracker-fields.mjs && npm run gearing:build`; the mirror comparison is
  back to 0 drifting fields across all 40 specs. The set bonus TEXT is unchanged — a bug fix
  making the printed 2-piece behave as written, not a value change — so only `asOf` and `source`
  moved, with a dated parenthetical recording why.
- **Nothing published moved**: all 79 outlook arrows are byte-identical before and after. The
  Unholy DK line does classify `buff` (restoring intended crit scaling is a real gain), but it
  joined a tally that already pointed the same way rather than flipping a direction.
- **Manifest deliberately NOT touched** — partial run, per the local-run rule. `check-refresh
  --manifest` failed on exactly the one expected line (`startedAt … 23h old`); every other row
  it printed was a documented owner-accepted standing red.

## 2026-09-01 (nightly) — TWO feed changes: the Aug 31 hotfix round-up logged, and the Sept 1 tuning post gained a line at version 4

- **Between-cycles posture unchanged**: live lanes only. PTR zone sweeps (54/52/56/57) stayed
  dormant — the 12.1 PTR cycle is closed and those contract rows were removed at the flip.
- **(a) Wowhead news RSS** HTTP 200, 191 KB, 40 items spanning 2026-08-27T18:53Z to
  2026-09-01T09:30Z, parsed per `<item>` block (never by tag adjacency). Two candidates in
  the window, and they resolved in opposite directions:
  · `news=382701` "Coiled Altar and Ula'tek Fixes - Patch 12.1 Hotfixes for August 31st" —
    REAL class content, logged (below).
  · `news=382697` "Estimated DPS and Healing Increases for September 1st Class Tuning"
    (2026-09-01) — Wowhead's own class writers' *estimates* of the already-logged 08-28 pass,
    not a Blizzard post and not a new tuning event, so it is NOT a feed entry. Noting it here
    because it will look like new tuning to the next reader: it restates our 08-28 values with
    per-spec throughput guesses (Frost DK 7%, Feral 8-10% ST / 6% AoE, BM 6.5%, Frost Mage 6%,
    Fire 2.9%, Havoc 3.8%, Vengeance 0% with ~5.55% less damage taken, Resto Druid 4%).
- **(b) Wowhead news INDEX** (`data.news.newsData`, brace-balanced from the id attribute) and
  **(c) blue tracker** (`data.blueTracker.default`, 50 entries ≈ 30 unique topics) both polled.
  The tracker's newest entries are Kaivax "World of Warcraft: Midnight Hotfixes - August 31"
  (US topic 2336376, posted 2026-08-31 20:10) and Linxy "Class Tuning Incoming – September 1"
  (topic 2342331) re-listed at 2026-08-31 14:49 — the second is what surfaced the version bump.
- **(d) Official dev-notes thread** `2317811.json` HTTP 200, 17 posts, `last_posted_at`
  2026-07-31T23:42Z — quiet for a month, which is CORRECT for a closed cycle. The
  thread-rediscovery gotcha stays suspended.
- **NEW ENTRY: 2026-08-31, `kind: "hotfix"`** — read from the canonical source (us.forums topic
  2336376, post 1 at **version 23**, updated 2026-09-01T01:10:18Z) with its `<ul>` heading
  structure INTACT, not off the flattened Wowhead mirror. Every class line sits under an
  explicit SPEC heading, so there is no class-wide/hero-tree attribution question this time:
  Unholy DK (Dread / Virulent Plague Erupt modifier interactions), Restoration Druid (Grove
  Guardians priority; Everbloom 6→5 targets), Mistweaver Monk (Soothing Mist aura), Holy
  Priest (Guardian Angel / Guardian Spirit cooldown), Affliction Warlock (Hellcaller Blackened
  Soul via Fatal Echoes), plus a `Non-class:` line for the Venomous Abyss encounter work,
  the Gnarldor Isle delve change, the Omnium Folio CC fix and a Group Finder move. All six
  lines classify **null** under `classifyHighlight`, i.e. bug fixes cast no outlook vote —
  checked, not assumed.
- ⚠️ **ONE CLASS LINE FROM THAT ROUND-UP IS DELIBERATELY NOT LOGGED, AND IT IS AN OWNER
  ACTION.** The Mage › Fire entry — "Resolved an issue where the 2-piece set bonus: Flamestrike
  did not correctly always grant Hot Streak when it is a guaranteed critical strike due to
  Pyroclasm" — touches a SET BONUS, so logging it obliges Fire Mage's `spec.tierSet.asOf` to
  advance to 2026-08-31 (a pure bug fix still bumps `asOf`), and since the 2026-08-23 two-page
  rule that same change must re-sync `gearing/data/specs.json` and rebuild the gearing artifact
  **in the same commit**. The nightly structurally cannot do that: publish stages only `data/`,
  `dist/` and the skill logs, never `gearing/`, so a tracker-side bump would land on master
  without its mirror and red the publish gate for everyone. Fire Mage is therefore absent from
  `specsAffected` and the line is not reworded to dodge the gate — it is recorded here and in
  the entry's own `label`. **To close it in a local run**: add the fix as a `Fire Mage — …`
  highlight on the 2026-08-31 entry, bump `tierSet.asOf` → 2026-08-31 with
  `source: https://us.forums.blizzard.com/en/wow/t/world-of-warcraft-midnight-hotfixes-august-31/2336376`
  (wording unchanged; append a dated parenthetical), then
  `node gearing/src/sync-tracker-fields.mjs && npm run gearing:build`.
- **THE 08-28 TUNING POST GAINED A LINE AT VERSION 4.** Post 1 of topic 2342331 was edited to
  v4 at **2026-08-31T19:44:31Z**, after last night's run had read v3. Re-read in full: the
  fifteen stored PvE lines are unchanged line for line, and **one line is new** — Shaman ›
  Hero Talents › Farseer, "Fixed an issue that caused Natural Harmony to increase the healing
  of Nature's Guardian by 20% instead of its listed and intended 10%." It sits under a bare
  Shaman heading at hero-tree depth with no spec block beneath it, so it is logged
  **class-wide with the tree named in the line text** (the Evoker/Flameshaper and
  Rogue/Deathstalker precedent from the 08-27 round-up) rather than guessed onto Elemental or
  Restoration. Class-wide lines reach all three Shaman drawers and are excluded from the
  outlook tally by construction, so this adds a fact and casts no vote — verified: the line
  classifies null anyway, and `specBuildChanges` returns it for all three Shaman specs.
  `specsAffected` gained "Shaman (class-wide)"; the entry's label records the v3→v4 diff.
- **No tier-set upkeep is owed by either change** beyond the disclosed Fire Mage deferral:
  the Mistweaver 4-piece line was already reconciled with the 08-28 entry, and validation is
  green (`✓ data valid — 40 specs, 39 PTR-tracked`).

## 2026-08-31 (nightly) — all four live lanes polled, 0 new entries; the Sept 1 pass re-verified at v3 against the stored build

- **No new build, hotfix or tuning post anywhere.** `data/ptr-builds.json` untouched; its
  newest entry is still the 2026-08-28 "Class Tuning Incoming – September 1" pass, which
  applies at tomorrow's weekly reset.
  - Wowhead news **RSS**: HTTP 200, 40 items spanning 2026-08-27T00:57Z → 2026-08-31T17:43Z.
    Nothing class-tuning or hotfix shaped after 08-28. The two candidates in the window are
    both already logged: news=382674 (the Sept 1 mirror, = our 08-28 entry) and news=382657
    ("Patch 12.1 Hotfixes for August 27th", = our 08-27 entry). The Coiled Altar nerf/unnerf
    articles (382658, 382679) are raid-encounter tuning, not class tuning, and are correctly
    out of the feed.
  - Wowhead news **INDEX** (`data.news.newsData`, brace-balanced from the id attribute):
    20 posts, top id 382660 at 2026-08-31 12:43 — the index does NOT lead the RSS this run,
    both top out in the same place.
  - Wowhead **blue tracker** (`data.blueTracker.default`): 50 entries, newest 2026-08-28
    17:48 (Linxy, "Class Tuning Incoming – September 1", US and EU). No standalone blue post
    since. Last hotfix topic is Kaivax's 08-27 round-up, already logged.
  - **Official dev-notes thread** 2317811.json: HTTP 200, posts_count 17, `last_posted_at`
    2026-07-31T23:42Z — quiet for a month, which is correct and expected: the 12.1 PTR cycle
    is closed and this is not a lost thread (the rediscovery gotcha stays suspended).
- **The Sept 1 tuning post was re-read at version 3 and the stored entry survives it exactly.**
  Topic 2342331 fetched via the `/t/<id>.json` form (the slug form 301s and leaves an empty
  body — use the bare id). `updated_at` 2026-08-28T22:48:44Z, unchanged since we logged it.
  All 15 stored highlights match the v3 text line for line, including the Mistweaver
  four-piece 20% → 25%, Shred logged class-wide at the shallower heading depth, and the whole
  PLAYER VERSUS PLAYER section correctly left undistilled. No tierSet change is owed —
  Mistweaver's was already advanced on 08-28 and the validator's upkeep gate is green.
- **Writeup coverage: 1 spec at `ptr: null`, Demonology Warlock, and that null is deliberate**
  (the source reported no changes). Unchanged from 08-15.
- **PTR zone lanes 54 / 52 / 56 / 57 stayed dormant** as the between-cycles posture requires;
  no WCL request of any kind was made from this session, and their contract rows were removed
  at the flip so there is nothing to report as unreachable.

## 2026-08-31 (local, scheduled) — 0 new builds; no hotfix round-up since Aug 27; Sept 1 pass STILL v3; no 12.2

- **Feed unchanged at 24 entries; nothing logged.** Wowhead news RSS fetched once (HTTP 200,
  157,896 bytes, 40 items spanning 08-27 → 08-31) and read per `<item>` block, never by tag
  adjacency. Titles AND `content:encoded` bodies were both scanned — the body pass is what
  makes a "no new tuning" claim honest, since Wowhead headlines the highlights rather than the
  scope (the 08-28 article names three specs for a pass that carries fourteen).
- **The canonical rolling hotfix topic is the authority, and it says August 27.** Kaivax topic
  **2336376** fetched directly (`.json`, HTTP 200, 34 KB): title still "World of Warcraft:
  Midnight Hotfixes - August 27", post 1 at **v21**, last edited 2026-08-28T00:59:15Z. Its
  bold date sections enumerate Aug 27/26/25/21/20/19/18/17/14/13 and **nothing later** — so
  08-28, 08-29 and 08-30 genuinely had no hotfix round-up, rather than one we missed. The Aug
  27 section is already logged as this feed's 2026-08-27 `hotfix` entry. Checked the topic
  BODY for a later section rather than trusting the rolled title, because the title lags the
  edit that appends a section.
- **The September 1 tuning post is unchanged: still v3.** Topic **2342331** post 1 created
  2026-08-28T22:27:13Z, updated 2026-08-28T22:48:44Z, `version` 3 — byte-identical in version
  terms to what the 08-29 run distilled. The pass applies with tomorrow's weekly maintenance,
  so this was the check worth making today: an amended post would have changed fourteen specs'
  logged lines the night before they go live. It was not amended.
- ⚠️ **NEW GOTCHA — a blue name on a post number is not a blue post.** A naive scan of that
  topic's `post_stream.posts` shows "#5 | Linxy", which reads as a second Linxy post carrying a
  clarification. It is not: `post_type: 3` with `action_code: "pinned.enabled"` and a
  **zero-length `cooked`** — a Discourse small-action recording that Linxy pinned the topic.
  The cheap cross-check that settles it is `details.participants`, which lists Linxy at
  `post_count: 1`. **Filter on `post_type === 1` (or a non-empty `cooked`) before reading a
  post as content**, or a moderation event gets distilled as tuning.
- **Forum transport note:** `us.forums.blizzard.com/en/wow/t/x/<id>.json` returns **HTTP 301
  with a zero-byte body** — the slug-less form redirects. Use `-L`, or the real slug. Without
  `-L` this looks exactly like a dead topic.
- **Dev-notes thread 2317811: no change**, newest post still #19 (Linxy, 2026-07-31T23:42Z),
  `last_posted_at` 2026-07-31. The closed 12.1 cycle's expected quiet, per the between-cycles
  posture — not a lost thread. Note `posts_count` reads 17 against a highest post number of 19
  (deleted replies); do not read that gap as missing blue posts.
- **No 12.2 PTR announcement** in any channel — RSS titles, RSS bodies (`12.2` / `Patch 12.2`
  matched nothing), the dev-notes thread, or the hotfix topic.
- **Writeup lane unchanged:** still exactly 1 spec at `ptr: null` (Demonology Warlock, the
  deliberate null — the source reported no changes). No new per-spec 12.1 review articles in
  the RSS window.
- **Dormant lanes correctly skipped**, not marked unreachable: the four PTR WCL zone sweeps
  (54/52/56/57) have no contract rows since the flip, so they need no manifest excuse.

## 2026-08-30 (local, scheduled) — 0 new builds; Sept 1 pass re-read and still at forum v3; no 12.2

- **Between-cycles posture, live lanes only.** The four PTR WCL zone sweeps (54/52/56/57)
  stay dormant and were not attempted; their contract rows were removed at the flip, so they
  need no manifest excuse.
- **Wowhead news RSS swept** (`/news/rss/all`, HTTP 200, 154 KB, 40 items, parsed per `<item>`
  block rather than by tag adjacency). Twenty-three items dated 2026-08-28 or later; **none is
  new class-tuning content**. The two that look like it are already logged: "Boomkin, Feral
  Druid, Mistweaver Monk Buffs — Class Tuning Coming with Weekly Reset" (08-28) IS the
  September 1 pass already in the feed, and "Vashnik LFR Nerf — Patch 12.1 Hotfixes for August
  27th" (08-28) is the round-up logged as the 2026-08-27 hotfix entry. No "Hotfixes for August
  28th/29th" round-up has been published yet.
- **Deliberately NOT logged: "Bonus Roll Hotfix Applied Early: No More Loot from Locked
  Bosses"** (08-29). It is a live hotfix, but it changes bonus-roll/loot-lock behaviour and
  touches no spec's tuning, so it has an empty `specsAffected` and would fail the
  `specsAffected` ↔ `highlights` coverage gate for the right reason. A loot-level change lands
  on every spec equally; the patch feed is the class-tuning record, not a general patch log.
- **The September 1 pass was RE-READ rather than assumed current**, since announced tuning gets
  retuned before it ships and the pass is two days out. Discourse JSON for topic 2342331
  (follow the 301 — the bare `.json` URL redirects): post #1 by Linxy is still **version 3**,
  `updated_at` 2026-08-28T22:48:44Z, unchanged since the 08-29 local run distilled it. The
  stored build entry (14 specs, 15 highlights) is therefore current by construction; nothing
  to re-distil.
- **No 12.2 PTR announcement** anywhere in the sweep. `PHASES.ptr` stays null and the cycle
  stays closed; opening a 12.2 cycle remains an owner action, not an agent-side edit.
- `data/ptr-builds.json` untouched; newest entry stays the 2026-08-28 "Class Tuning Incoming –
  September 1" post.

## 2026-08-30 (nightly, CI runner) — 0 new builds; the Sept 1 pass still at forum v3, no 12.2 anywhere

Between-cycles posture unchanged: `PHASES.ptr` is null, no 12.2 PTR announcement in any lane,
and the dormant WCL PTR zone sweeps (54 / 52 / 56 / 57) were correctly skipped — their contract
rows left with the flip and must not be re-added to the manifest.

- **Wowhead news RSS** — HTTP 200, 154 KB, 40 items parsed per `<item>` block, window
  2026-08-26 → 2026-08-30 09:00 CDT. The only class-tuning item is still **news=382674**, the
  2026-08-28 feed entry. Every 08-28…08-30 item's `content:encoded` body was keyword-scanned;
  the one tuning-bearing article is **news=382679 "(Reverted) Mythic Coiled Altar Nerfed Again"**
  — ENCOUNTER tuning (Defilement healing absorb −20%, Coalesced Venom −15%, Venom Rupture −10%,
  variance removed) and **reverted** on lockout issues. No class content, so no feed entry: the
  `specsAffected: []` + `Non-class:` precedent is for posts in the tracked dev-notes thread, not
  for Wowhead race articles.
- **Forum, re-read rather than assumed** — topic **2342331** post 1 is still **version 3**,
  created 2026-08-28T22:27:13.800Z, last updated 22:48:44.482Z. Its spec sections reconcile 1:1
  against the stored entry's 14 `specsAffected` / 15 `highlights`, including the Mistweaver line
  "The Venomous Abyss 4-piece set bonus chance to activate has been increased from 20% to 25%"
  that `spec.tierSet` already carries at asOf 2026-08-28 — so the **tier-set upkeep gate needed
  nothing tonight** and the gearing mirror was not touched. (Note the topic slug 301-redirects to
  a percent-encoded en-dash form; fetch with `curl -L` or the `.json` comes back empty.)
- **Dev-notes thread 2317811** — `highest_post_number` still **19**, newest post Linxy
  2026-07-31. The closed 12.1 PTR cycle, unchanged.
- **News INDEX polled too**, because it LEADS the RSS within a run: `data.news.newsData`
  brace-balanced from its `id` attribute, 20 posts, top id 382669 at 09:00 — nothing the RSS
  lacked.
- **Blue-tracker index** `data.blueTracker.default`, 50 entries / ~35 unique topics. Newest
  class-relevant topic is still Linxy's September 1 tuning post (US 2342331 / EU 627043, both
  2026-08-28); nothing standalone since. `data/ptr-builds.json` untouched, newest entry stays
  2026-08-28.
- One creator LEAD noted and **not** logged: Dalaran Gaming's 08-28 "WoW Is Changing FOREVER.
  Talent 'Squish', New Modes, & Huge Patch Roadmap!" is downstream of the Psybear/Tettles Ion
  Hazzikostas interviews, and no official channel carries a 12.2 PTR announcement — the video is
  the tip-off, never the source of record.

## 2026-08-29 (nightly, CI runner) — 0 new builds; the Sept 1 pass verified still at forum v3

Between-cycles posture unchanged: `PHASES.ptr` is null, no 12.2 PTR announcement in any lane,
and the dormant WCL PTR zone sweeps (54 / 52 / 56 / 57) were correctly skipped — their contract
rows left with the flip and must not be re-added to the manifest.

- **Wowhead news RSS** — HTTP 200, 151 KB, 40 items parsed per `<item>` block, window
  2026-08-25 → 2026-08-29 09:00 CDT. The only class-tuning item is **news=382674** ("Boomkin,
  Feral Druid, Mistweaver Monk Buffs — Class Tuning Coming with Weekly Reset"), which this
  morning's LOCAL run had already landed as the 2026-08-28 feed entry. Its `content:encoded`
  body was re-read tonight and reconciled line-for-line against the stored entry: all fifteen
  PvE highlights match, the separate PLAYER VERSUS PLAYER section stays out of scope, and the
  set-bonus line ("The Venomous Abyss 4-piece set bonus chance to activate has been increased
  from 20% to 25%") is the one `Mistweaver.tierSet` already carries at asOf 2026-08-28 — the
  gearing mirror is byte-identical, so the tier-set upkeep gate needed nothing.
- **The forum post itself was re-read, not assumed.** Topic **2342331** post 1 is still
  **version 3**, created 2026-08-28T22:27:13Z, last updated 22:48:44Z — no v4 edit since the
  local run distilled it. (That version matters: Wowhead mirrored v1, which understates
  Discipline's PvP figures and omits Fire Mage's PvP-exclusion clause. Neither affects PvE.)
- **News INDEX polled as well**, because it LEADS the RSS within a run: `data.news.newsData`
  brace-balanced from its `id` attribute, 20 posts, top id 382670 at 09:00 — nothing the RSS
  lacked.
- **Blue-tracker index** `data.blueTracker.default`, 50 entries. Newest class-relevant topic is
  still Linxy's September 1 tuning post (2342331, 28 Aug 17:48 CDT); above it only WoW Weekly,
  Black Temple and a "Raid Bonus Roll Update".
- **The canonical running hotfix post was read DIRECTLY**, since it is edited in place:
  `2336376.json` post 1 is at **version 21**, updated 2026-08-28T00:59:15Z, with dated sections
  August 27, 26, 25, 21, 20, 19, 18, 17, 14, 13 — **no August 28 or 29 section**, and neither
  literal string appears in the post. The two hotfix-shaped news items since (382677 "Bonus Roll
  Hotfix Applied Early" and the Mythic Coiled Altar nerf) are loot-system and encounter tuning
  with no class line, so neither earns a feed entry.
- **Dev-notes thread 2317811** unchanged at post #19, last posted 2026-07-31T23:42Z — the closed
  cycle's expected silence, not a lost thread. The rediscovery gotcha stays suspended.
- **Watch item carried forward:** topic 2335871 "Season 2 Class Tuning Plans" is at 190 posts
  with Kaivax only at post #1, still unedited since 2026-08-12. Its roadmap named **Aug 25,
  Sep 1 and Sep 22**, so the pass now in the feed is the second of three and the next one is
  three weeks out. Separately, Dalaran Gaming published "Talent Squish, New Modes, & Huge Patch
  Roadmap" on 08-28 — a creator LEAD about future plans that the official lanes do NOT
  corroborate tonight; the video was left unqueued and unseen rather than treated as a source.
