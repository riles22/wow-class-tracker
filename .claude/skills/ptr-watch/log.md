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

## 2026-08-15 (nightly, 21:50 UTC — second run of this UTC day)

**Nothing new to log on any of the four channels.** (1) Dev-notes thread `2317811.json` via
curl for the full `post_stream`: 17 posts, `last_posted_at` 2026-07-31T23:42:09Z, newest is
Linxy #19 — already the feed's 07-31 entry. The thread has been quiet 15 days; the PTR cycle
ended when 12.1 shipped. (2) Wowhead RSS, parsed per `<item>` block: 40 items, newest
2026-08-15 15:35 CDT. (3) News INDEX (`data.news.newsData`, brace-balanced from the id
attribute) polled as well because it leads RSS within a run: 20 posts, top id 382472, nothing
beyond RSS. (4) Blue tracker (`data.blueTracker.default`): 50 entries → 42 unique topics.

**The two candidate blues were re-read in full and independently confirmed as non-feed
material** — the same conclusion the earlier run reached, reached again from the source rather
than inherited: topic **2336376** (Kaivax, Hotfixes August 14) has a Classes section that is
entirely BUG FIXES with no tuning values (Devastation Shattering Star / Mastery: Giantkiller,
Warrior Slayer Executioner double-effect, Warlock pet Soul Leech, Demonology cooldown-manager)
while every numeric change in it is trinkets and items; topic **2335871** (Kaivax, "Season 2
Class Tuning Plans", 08-12) is a calendar — Aug 18 / Aug 25 / Sep 1 / Sep 22 — with no per-spec
line. Writing either as a `Spec Class — …` highlight would feed bug-fix or calendar text into
the outlook tally.

**Lead recorded, not logged:** news 382443 (08-13) — "Patch 12.1.5 PTR Now Listed on Battle.net
Launcher". A new cycle means a NEW forum thread (the `thread` key would need re-discovery), but
the article states the patch itself has not been updated and no datamining is possible yet, so
there is nothing to discover. Re-check when 12.1.5 dev notes appear.

WCL zones were **not fetched by this agent** (no credentials): from `wcl-fetch/evidence.json`,
verdict `rdps-broken` — zone 54 (PTR raid, normalized) and zone 52 (Dummy Dome rDPS) and zone
56 (PTR M+ rDPS) all unreachable through the broken metric family, while the three RAW-DPS
recipes landed (52: 102 rows, 1T/2T/3T/5T = 2000/662/297/2000 ranked players; 54 Heroic: 27
rows across 8 encounters, Coiled Altar and Ula'tek at 0; 56: 27 rows, all eight dungeons at the
2000-player pagination ceiling). Zone 57 not probed — no credentials, and it has never
aggregated.

Writeup coverage recomputed rather than read: **one** spec has no `ptr` writeup (Demonology
Warlock, the deliberate "source reported no changes" null); **zero** specs lack a raid-scoped
or an M+-scoped expert read.

## 2026-08-15 (nightly)

**A new feed entry — the first in nine days.** The dev-notes thread is closed for this cycle
and Wowhead's RSS carried only the mirror, so the entry came off channel 3: a forum search
surfaced **"Class Tuning Incoming – August 18"** (Linxy, topic **2336820**, 2026-08-15T00:11Z),
the Season 2 launch tuning pass applied with the 08-18 weekly reset.

- Logged **`kind: "build"`, `forumPostNumber: 1`**, citing topic 2336820 directly with the
  Wowhead mirror (`news=382466`) alongside. It is a STANDALONE topic, not a reply in the
  tracked `thread`, so the `thread` key is unchanged. `kind: "hotfix"` was the first shape
  tried and is wrong twice over: the post *has* a forum citation, and validation forbids a
  hotfix carrying `forumUrl` — which also reds `test/validate.test.mjs`'s host-allowlist test,
  since that test sets `builds[0].forumUrl` and counts errors. **A hotfix must never be the
  newest entry unless that test is rewritten first.**
- **14 specs distilled**, one consolidated line each: Blood + Frost DK, Devourer DH,
  Restoration Druid, Beast Mastery Hunter, Arcane Mage, Mistweaver Monk, Discipline + Holy
  Priest, Assassination + Subtlety Rogue, Enhancement Shaman, Demonology Warlock, Fury Warrior.
  Coverage gate agrees 14/14.
- **Eight Season-2 tier sets revised → eight `spec.tierSet` updates in the same edit** (Frost
  DK, Devourer DH, BM Hunter, Arcane Mage, Mistweaver, Subtlety, Demonology, Fury), `asOf`
  2026-08-15, `source` = the forum topic. Clean value swaps into the stored wording where the
  notes allow; a dated parenthetical where they do not — Arcane (the notes cut the per-stack
  bonus 5%→3% but never restate the cap), Mistweaver (a relative "+33% activation rate" with no
  absolute), and **Demonology**, where Blizzard's post calls the Implode effect the **2-set**
  while the 06-18 datamine and the 07-31 notes both placed it on the 4-set: values were updated
  where the effect is stored rather than moved on one post's say-so.
- **The PLAYER VERSUS PLAYER section was deliberately NOT distilled.** It is the only place
  Fire Mage, Retribution Paladin, Restoration Shaman and Destruction Warlock appear in this
  post. Note the trap: the tier-set upkeep gate matches on spec name + set keyword and does
  **not** look at a `PvP only` prefix, so writing the PvP-only Fire Mage 4-set line even as a
  prefixed out-of-scope record would have fired the gate on a spec whose PvE set never changed.
  Precedent (07-31 Restoration Druid) is to log no line at all — followed.
- Checked and NOT logged: the Aug-13 / Aug-14 live hotfix round-ups (bug fixes + trinket and
  item tuning, no spec tuning), "Season 2 Trinket Tuning Now Live", and the 08-12 tuning
  roadmap (already recorded — passes 08-18, 08-25, 09-01, 09-22).
- **"Patch 12.1.5 PTR Now Listed on Battle.net Launcher"** (08-13) still stands as the tip-off
  that the NEXT cycle needs a new forum thread and a re-pointed `thread` key. Nothing datamined.
- **WCL zones 54 / 52 / 56 are evidence-only on the runner** — verdict "rdps-broken", nothing
  ingested, stored data untouched. Zone 57 is not covered by the deterministic step.
- **Writeup coverage recomputed (not read): 39 of 40.** Demonology Warlock's null deliberate.
- **Migration status, unchanged and NOT attempted:** 12.1 is live, Season 2 opens 08-18 (inside
  `PHASE_FLIP_DUE` 2026-08-20); tracker still pre-flip. Owner one-shot, docs/s2-flip-runbook.md.
- **Follow-up for the next LOCAL run:** the eight `tierSet` edits above make
  `check-refresh --age` report **`gearing-tierset-sync`** (8 specs whose gearing-side text the
  tracker has since corrected — the 2026-08-08 Preservation Evoker failure shape). The fix is
  `node gearing/src/sync-tracker-fields.mjs` then `npm run gearing:build`, both under
  `gearing/`, which the nightly publish job does not stage — so it was deliberately NOT run
  here. `npm test` and the publish gate are unaffected; only the heartbeat alarms.

## 2026-08-15 (nightly CI, headless Opus 5, single-shot; started 10:57Z — SECOND run of this UTC day)

All three channels checked; **nothing new to log — `data/ptr-builds.json` stays at 16 entries,
newest 2026-08-15.** No writeup changed, no `tierSet` changed.

1. **Official dev-notes thread** `2317811.json`: `posts_count` 17, `highest_post_number` still
   **19**, `last_posted_at` 2026-07-31T23:42:09Z. Closed for this cycle, as it has been since
   the patch shipped.
2. **Wowhead news RSS**: 40 items spanning 2026-08-11 → 2026-08-15T01:05Z, parsed per `<item>`
   block (never by tag adjacency). The newest item is 10 hours old, so the window is identical
   to the 05:34Z run's. Nothing tuning-related is unlogged: "Season 2 Class Tuning Incoming
   with Weekly Reset - Blood DK Nerf" is the mirror of the Aug-18 post already in the feed.
3. **Standalone blue posts** — the blue-tracker index is **Cloudflare-403 to this runner**
   (919-byte challenge body), so discovery was done against the forum's own Discourse search
   instead (`search.json?q=@<staff>+after:2026-08-12` for Linxy / Kaivax / Aerythlea). Newest
   Linxy post is still topic **2336820** "Class Tuning Incoming – August 18"
   (2026-08-15T00:11Z), already logged as feed entry #16. Newest Kaivax class content is the
   Aug-14 hotfix topic (2336376), below.
   *Transport note for the next run: the 403 is on `wowhead.com/blue-tracker` specifically,
   and `search.json` answered every query in one round with no auth. Prefer it.*

**Checked and deliberately NOT logged** — the Aug-14 live hotfix round-up (topic 2336376;
post 1 was EDITED at 2026-08-15T01:00:47Z and re-posted as post 18, which is why it can look
new). Its Classes section is **bug fixes only, with no tuning numbers**: Devastation's
Shattering Star now correctly benefits from Mastery: Giantkiller, Arms/Fury Slayer's
Executioner no longer double-dips, Warlock pets no longer keep re-learning Soul Leech, and a
Demonology cooldown-manager display fix. Everything numeric in that post is trinket/item
tuning (Coiled Fangstone +15%, Gaze of the Alnseer -20% primary stat, …) or reward plumbing.
This matches the 05:34Z run's disposition of the Aug-13/Aug-14 round-ups; re-litigating it
would only churn the feed.

**WCL zones 54 / 52 / 56 / 57 are evidence-only for this agent** and are reported under their
own manifest keys — see the refresh-metrics log for the `rdps-broken` verdict and the three
RAW keys that landed.

Coverage recomputed rather than read (the two-line recipe in CLAUDE.md): **39/40 writeups**,
the single null being Demonology Warlock, which is deliberate — the source reported no
changes, and "nothing changed" is not a verdict.

**Still open from the 05:34Z run, unchanged:** those eight `tierSet` edits still leave
`check-refresh --age` reporting `gearing-tierset-sync`. The fix is
`node gearing/src/sync-tracker-fields.mjs` + `npm run gearing:build` under `gearing/`, which
the nightly publish job does not stage — so it stays a LOCAL-run duty and was again not run
here. `npm test` and the publish gate are unaffected; only the heartbeat alarms.

## 2026-08-14 (nightly, CI runner)

**No new build — feed unchanged at 15 entries** (newest still the 2026-08-06 launch notes).

- **Official thread 2317811.json:** posts_count 17, highest_post_number still 19 (Linxy,
  2026-07-31T23:42Z). With 12.1 shipped this thread is closed for the cycle.
- **Wowhead news RSS** (40 items, 2026-08-11..08-14, bodies read from `content:encoded` in one
  fetch): no PTR build, no spec tuning. Three items recorded rather than logged —
  (a) the **Aug-13 live hotfixes** carry a Classes section that is two BUG FIXES (pet Spirit Walk
  in Vaults of Atal'utek; Affliction's Seed of Corruption not consuming Shard Instability) on
  LIVE realms, not PTR tuning, so nothing entered the feed — consistent with 08-12 and 08-13;
  (b) "Season 2 Trinket Tuning Now Live" is item tuning with no spec attribution;
  (c) **"Patch 12.1.5 PTR Now Listed on Battle.net Launcher" (08-13)** — the next cycle is
  starting. Per the standing gotcha, a new cycle means a NEW forum thread: re-discover it via
  Wowhead RSS and re-point the `thread` key when the first 12.1.5 development notes appear.
  Nothing is datamined yet.
- **Blue-tracker sweep** (US index, 20 topics, full browser header set — a UA-only GET is 403):
  no standalone class-tuning blue post. Only "Season 2 Class Tuning Plans" (the 08-12 roadmap
  already recorded: first pass 08-18, then 08-25 / 09-01 / 09-22) and the hotfix mirror.
- **WCL zones 54 / 52 / 56 are evidence-only on the runner** — verdict "rdps-broken", nothing
  ingested, stored data untouched. Zone 57 is not covered by the deterministic step and was not
  fetched here.
- **Writeup coverage unchanged: 39 of 40.** Demonology Warlock's null stays deliberate.
- **Migration status, unchanged and NOT attempted:** 12.1 is live, Season 2 opens 08-18 (inside
  `PHASE_FLIP_DUE` 2026-08-20); tracker still pre-flip. Owner one-shot, docs/s2-flip-runbook.md.

## 2026-08-13 (nightly CI, 11:47Z — Opus 5; single-shot) — no new build; the only new class item is a tuning ROADMAP

- **Feed unchanged at 15 entries**, newest still the 2026-08-06 launch patch notes.
- **(1) Official thread** `2317811.json`: posts_count 17, highest_post_number still **19**
  (Linxy, 2026-07-31T23:42Z). With 12.1 shipped the thread is effectively closed for this cycle.
- **(2) Wowhead news RSS**: 40 items, 2026-08-08 → 08-13, bodies read from `content:encoded` in
  a single fetch. Exactly one new class-relevant item — **"Class Tuning Roadmap for Midnight
  Season 2"** (news=382435, 08-12 18:34) — and it is a **schedule, not tuning**: Season 2 opens
  **August 18** with the first tuning pass that day, then **Aug 25 / Sep 1 / Sep 22**, with
  roughly four more passes before Season 3 and hotfixes "at any time". No per-spec line ⇒ no
  feed entry and no outlook vote. Everything else is live-service (scenario bugs, hero gear,
  Renown rewards, sparks, housing, Coiled Isle).
- **(3) Wowhead blue tracker** (`/blue-tracker?rss` with the FULL browser header set — a UA-only
  fetch is CloudFront-403 and reads as an empty feed): 50 items back to 08-07; the only
  class-relevant entries are the same roadmap mirrored as "Season 2 Class Tuning Plans". **No
  standalone class-tuning blue post** of the Kaivax "Healer Tuning" shape.
- No set-touching line landed ⇒ **no `spec.tierSet` upkeep due**. Writeup coverage holds at
  **39/40**; Demonology Warlock's `ptr: null` stays deliberate ("no changes going to Season 2"
  is not a verdict) and nothing was manufactured from tuning lines.
- **WCL (evidence-only on the runner):** `wcl-fetch/evidence.json` verdict **"rdps-broken"** —
  zone 54 (34 rows, 2026-07-28), zone 52 `ptrDummy` (27 specs, 2026-08-10) and zone 56 (40 rows,
  2026-08-10) are rDPS-family and stay frozen; their raw-DPS counterparts landed via the
  deterministic step. Zone 57 (Tidebound Grotto) is not covered by the fetch step and was not
  fetched here.
- **Migration status, unchanged and NOT attempted:** 12.1 is live; Blizzard's own roadmap post
  now re-confirms **Season 2 on August 18**, inside `PHASE_FLIP_DUE` 2026-08-20. Tracker is
  still pre-flip (`PHASES.liveSeason` "s1", `SNAPSHOT_PHASE` "12.1-ptr"). Owner one-shot; see
  docs/s2-flip-runbook.md.

- 2026-08-12 (LOCAL run, ~14:3xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). **0 new builds, verified independently rather than inherited from the nightly.**
  Forum thread 2317811 fetched fresh (`.json`, HTTP 200, 407 KB): posts_count 17,
  highest_post_number **19**, last_posted_at **2026-07-31** — post #19 is already logged, and
  the development-notes thread is effectively closed now that 12.1 shipped on 08-06. Wowhead
  news RSS (40 items) carries **no class-tuning or hotfix article since launch**; the only
  tuning item in range is 08-07 "More Season 2 Mythic+ Dungeon Tuning — Ruby Life Pools and
  Temple Changes", which is dungeon-side and outside this feed's per-spec scope. Feed stays at
  **15 entries**, newest still the 08-06 launch patch notes. No set-bonus-touching highlight
  landed, so no `tierSet.asOf` upkeep was owed. · **Zones 54/52/56/57: not re-fetched — the
  WCL statistics-table endpoint is behind the human challenge** (see refresh-metrics entry
  same date); stored rows and snapshots left exactly as they were.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 11:31Z)

**No new build. Feed unchanged at 15 entries, newest still the 2026-08-06 launch patch
notes.** All three channels checked, plus the WCL zones by evidence only.

1. **Official thread `2317811.json`** — `posts_count` 17, `highest_post_number` **19**,
   newest Linxy post still 2026-07-31. Nothing after the two 07-31 posts already logged as
   builds #18/#19.
2. **Wowhead news RSS** — 40 items spanning 2026-08-06 → 2026-08-12, bodies read out of
   `content:encoded` in the single fetch. **Zero class-tuning lines anywhere in the window**:
   every item published since yesterday's run (14 of them, 08-11 17:17Z onward) scores 0
   change-verb hits — launch cinematic, Coiled Isle, known-issues, Lairs, Season 2 dungeon
   guides, "Class Guides Now Updated for Midnight Season 2" (a Wowhead guide-refresh
   announcement, not tuning), Battle.net sale, sparks/trophies/lair-queue fixes.
3. **Wowhead blue tracker** — `?rss` needs the FULL browser header set (a UA-only fetch is
   CloudFront-403; recorded because the plain-UA attempt looks exactly like an empty feed).
   50 items back to 08-06: **no standalone class-tuning blue post** of the Kaivax "Healer
   Tuning" shape. Launch-adjacent posts are all non-tuning (Curse of Ula'tek now live, known
   issues, Umbral title score finalisation, Lairs, pre-season, Twitch drops, sale).
   **Dated fact worth having: "The Shadows Deepen: Midnight Season 2 Begins August 18"
   (US) / 19 August (EU)** — Season 2 opens 08-18, which is inside `PHASE_FLIP_DUE`
   2026-08-20.
- **Tier sets:** no set-touching line landed, so no `spec.tierSet` upkeep was due.
- **Writeups:** coverage unchanged at 39/40. Demonology Warlock stays `ptr: null`
  deliberately — the source reported no changes, and "nothing changed" is not a verdict.
- **WCL zones are evidence-only on the runner and none of them could land.**
  `wcl-fetch/evidence.json` verdict "rdps-broken": zone 54 (PTR raid testing score), zone 52
  (`ptrDummy` median rDPS) and zone 56 (PTR M+ rDPS/HPS medians) are all rDPS-family and stay
  frozen at 2026-07-28 / 2026-08-10 / 2026-08-10. Their RAW-DPS counterparts DID land via the
  deterministic step (see refresh-metrics) and are deliberately different statistics. Zone 57
  (Tidebound Grotto) is not probed by the fetch step and was not fetched here.
- **Migration status, unchanged and NOT attempted here:** 12.1 is live, Season 2 opens 08-18,
  and the tracker is still configured pre-flip (`PHASES.liveSeason` "s1", `SNAPSHOT_PHASE`
  "12.1-ptr", `PHASE_FLIP_DUE` 2026-08-20). Owner one-shot.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 20:35Z — SECOND run of this UTC day)

**No new build; all three Blizzard channels checked and clean.** Feed unchanged at 15 entries,
newest still the 2026-08-06 launch patch notes.

1. **Official thread** `2317811.json`: `posts_count` 17, `highest_post_number` still **19**
   (Linxy, 2026-07-31T23:42Z). Nothing after the two 07-31 posts already logged as #18/#19.
   With 12.1 shipped on 08-11 this thread is effectively closed for the cycle.
2. **Wowhead news RSS**: 40 items spanning 2026-08-07..2026-08-12, bodies read out of
   `content:encoded` in the single feed fetch. Scanned every body for change verbs
   ("increased by / reduced by / (was / Developers' note" …): **zero hits across all 40 items**.
   The six items new since the 11:31Z run are all live-service (Blinding Vale / Temple scenario
   bugs, a bugged Zul'jarra contract, hero-gear and Renown-reward explainers, Vaults of
   Atal'Utek, sparks).
3. **Wowhead blue tracker** (`/blue-tracker?rss`, FULL browser header set — a UA-only fetch is
   CloudFront-403 and reads as an empty feed): 50 items back to 08-06. The only two carrying
   "hotfix" are Bob the Bartender and lair-queue grouping. **No standalone class-tuning blue
   post** of the Kaivax "Healer Tuning" shape.

No set-touching highlight landed, so no `spec.tierSet` upkeep was due.

**Writeup coverage stays 39/40 and Demonology Warlock's `ptr: null` is re-confirmed, not
inherited.** Icy Veins' Season-2 raid DPS page — now a live lane since the guides rebuilt —
says in its own words: *"Demonology Warlock received no changes going to Season 2, with the
only new feature added being their tier-set."* "Nothing changed" is not a verdict, so no
writeup was manufactured.

**WCL (evidence-only on the runner):** `wcl-fetch/evidence.json` verdict **"rdps-broken"** —
zone 54 (PTR raid testing score, 34 rows), zone 52 (`ptrDummy` median rDPS, 27 specs) and zone
56 (PTR M+ rDPS/HPS medians, 40 rows) are all rDPS-family and stay frozen at 2026-07-28 /
2026-08-10 / 2026-08-10. Their raw-DPS counterparts landed via the deterministic step (see
refresh-metrics). Zone 57 (Tidebound Grotto) is not covered by the fetch step and was not
fetched here.

**Migration status, unchanged and NOT attempted:** 12.1 is live, Blizzard's own post puts
Season 2 at **August 18 (NA) / 19 August (EU)**, and the tracker is still configured pre-flip
(`PHASES.liveSeason` "s1", `SNAPSHOT_PHASE` "12.1-ptr", `PHASE_FLIP_DUE` 2026-08-20). Owner
one-shot; see docs/s2-flip-runbook.md.

## 2026-08-11 (nightly, CI) — launch day; nine null writeups became one

- **PATCH 12.1 GOES LIVE TODAY.** Wowhead: 8 hours of NA maintenance ending 15:00 PT on
  2026-08-11; the week of 08-11 is a **PRE-SEASON**, and **Midnight Season 2 formally opens
  2026-08-18**. So "12.1 live" and "Season 2 live" are a week apart — worth saying out loud,
  because the tracker's era vocabulary has one `liveSeason` for both. The owner's frozen
  forecast is already declared (`data/forecasts/frozen-2026-08-11.json` at HEAD);
  `SNAPSHOT_PHASE` is still "12.1-ptr" against PHASE_FLIP_DUE 2026-08-20.
- **No new build.** Thread 2317811.json highest_post_number still 19 (Linxy, 07-31). Wowhead
  RSS (40 items, 08-04..08-10) carries launch trailer / maintenance / pre-season details /
  background downloader / housing — no per-spec tuning line. Blue-post sweep: Discourse
  search for @Kaivax and @Linxy since 08-05 returns housing, an outage and TBC Classic PTR
  notes only. **Transport note: the Wowhead blue-tracker index is JS-hydrated and every RSS
  path tried 404s** (`/blue-tracker/rss`, `/blue-tracker/rss/all`, `/blue-posts/rss`,
  `/news/rss/blue-tracker`) — use the forum's own `search.json` instead.
- **The writeup gap closed from 9 specs to 1, and the lane that did it was new.** Icy Veins'
  rebuilt LIVE tier-list pages now carry per-spec **Season 2 analysis paragraphs** — exactly
  the material the skill's lane (b) said would not exist "until launch". Today is launch.
  Eight writeups distilled with `source` + `asOf` (page dateModified): Frost DK **Positive**
  (burst redistributed into sustain, good raid testing), Feral Druid **Mixed** (talent buffs
  + Apex nerfs, energy fixed, single target still weak), Guardian Druid **Mixed** (Apex
  rework = steadier damage, but Balance Druid may take the Mark of the Wild slot),
  Restoration Druid **Negative** (Abundance rework + Verdant Infusion no longer extending
  HoTs "significantly lower Druid's throughput potential"), Holy Priest **Positive** (S2 mana
  buffs ease its one stated weakness), Elemental Shaman **Positive** (damage out of
  Ascendance into baseline; Stormbringer nerf opens Farseer), Affliction Warlock
  **Positive** (new set + Nightfall rework, Seed applying UA at 20%), Destruction Warlock
  **Positive** (damage buff + Conflagration of Chaos redesign).
- **Demonology Warlock stays `ptr: null` on purpose.** Its blurb says the spec received *no*
  changes beyond the tier set. "Nothing changed" is not one of Positive/Mixed/Negative, and
  rule (c) is explicit: no clear verdict from the source, no writeup.
- Worth flagging for the owner: these eight verdicts come from the SAME publisher whose
  letters feed the next-patch forecast term. Different components, but one voice.
- WCL zones are evidence-only from CI: zone 54/52/56 raw series landed pre-agent; the
  rDPS/normalized cuts stay frozen under the standing `rdps-broken` verdict.

## 2026-08-11 (nightly, CI — second run of the day) — no new build; all three channels clean

- **Official thread `2317811.json`** — `highest_post_number` still **19** (Linxy,
  2026-07-31), `posts_count` 17. Nothing after the two 07-31 posts already logged as builds
  #18 and #19.
- **Wowhead news RSS** — 40 items spanning 2026-08-05..2026-08-11, bodies read out of
  `content:encoded` (one fetch, all 40 articles). Only ONE carries real class-tuning text and
  it is the **2026-08-06 launch patch notes, already logged** as the `patch-notes` entry. The
  four other change-verb hits are out of scope by construction: an Icy Veins/Raider.IO
  interview *about* a class-tuning roadmap (talk, not notes), embellishment/potion tuning,
  Altar of Fangs dungeon tuning, and a Delve-boss addon hotfix. "Jimothy Added in Latest
  Patch 12.1 PTR Build" (08-07) is a real build article with **zero** class-tuning lines —
  worth recording so the next run does not re-open it.
- **Wowhead blue tracker** — the index page is JS-hydrated and yields zero hrefs to a plain
  fetch (do not bother with it); **`/blue-tracker?rss` is server-rendered and works**, 50
  items back to 2026-08-06. No standalone class-tuning blue post of the Kaivax
  "Healer Tuning - July 16" shape. The launch-adjacent posts are all non-tuning: "Curse of
  Ula'tek Goes Live August 11" (NA; EU reads 12 August), Pre-Season Details, housing,
  Twitch drops, and a re-post of the same Content Update Notes at 2026-08-11 12:32.
- **Feed unchanged at 15 entries**, newest still the 2026-08-06 patch notes. No tier-set
  line landed, so no `spec.tierSet` upkeep was due.
- **Writeup coverage unchanged at 39/40.** Demonology Warlock remains the single `ptr: null`
  and remains deliberate — its source reported no changes beyond the tier set, and "nothing
  changed" is not one of Positive/Mixed/Negative.
- **WCL zones are evidence-only from CI.** Zone 52/54/56 raw series landed pre-agent (see
  refresh-metrics log); zone 54 normalized, zone 56 rDPS/HPS and `ptrDummy` stay frozen under
  the standing `rdps-broken` verdict. Zone 57 (Tidebound Grotto) is not in the deterministic
  recipe and was not probed — unchanged since 2026-07-28's empty result.
- **Launch status, for the record.** Blizzard's own blue post says Curse of Ula'tek goes live
  **August 11 (NA) / 12 August (EU)**, and Season 2 formally opens Aug 18. Icy Veins and
  Wowhead have already rebuilt their lists as Season 2; Method and Archon have not. The
  tracker itself is still configured pre-flip (`PHASES.liveSeason` "s1", `SNAPSHOT_PHASE`
  "12.1-ptr", `PHASE_FLIP_DUE` 2026-08-20) — the migration is an owner one-shot and was not
  attempted here.

- 2026-08-10 (LOCAL evening run, ~21:4xZ — Opus 5; pre-freeze WCL catch-up only). Zone 54
  probed once (Heroic 4/10 DPS): still EMPTY upstream, rows + snapshot stay 2026-07-28. Zones 52
  and 56 refreshed via the owner-cleared browser session (see refresh-metrics log 2026-08-10:
  curl is now human-challenged; the healer dummy 3594 aggregates but its median was REJECTED
  as idle-parse-contaminated — full reasoning there). Forum thread + Wowhead RSS NOT
  re-checked tonight — the 12:03Z nightly covered them; build feed current at 12 builds.

## 2026-08-10 (nightly CI, headless Opus 5, single-shot; started 11:32Z)

- **No new build. Feed unchanged at 15 entries**, newest still the 2026-08-06 launch patch
  notes. All three channels swept:
  1. **Official thread** `2317811.json` — `highest_post_number` still **19** (Linxy,
     2026-07-31), 17 posts, all logged.
  2. **Wowhead news RSS** — 40 items, 2026-08-02 → 2026-08-09, bodies read from
     `content:encoded`. The 12.1 items are Jimothy (cosmetic model), More Season 2 M+ Dungeon
     Tuning (Ruby Life Pools / Temple *encounter* tuning), Datamined Hotfixes (M+/raid/delve
     ability **flags** — e.g. Stir the Depths gains "Treat as Area of Effect", Void Toxin no
     longer reflectable), Embellishment/Potion tuning (items), Altar of Fangs dungeon
     changes, and the Blizzard × Icy Veins / Raider.IO / Wowhead interview. **None carries a
     per-spec tuning line.**
  3. **Standalone blue posts** — Discourse search `@Kaivax after:2026-08-04` returns only
     season-end, housing, server and M+-score topics; `@Linxy` none. Wowhead's
     `/blue-tracker` HTML is JS-hydrated (0 topic hrefs) but **`/blue-tracker?rss` works with
     the browser header set** — 50 items, newest 2026-08-08, no class tuning. Worth
     remembering: the RSS variant needs `Accept: application/rss+xml`, a plain UA 403s.
- **Standing lead, now dated**: in the 08-07 interview Blizzard says the Season 2 class-tuning
  **roadmap** ships "in the next couple of days". Still not published as of this run. That is
  the next thing to catch.
- **Launch dates confirmed from the same sweep**: 12.1 goes live **2026-08-11**, Season 2
  opens **2026-08-18** (blue tracker "Curse of Ula'tek Goes Live August 11", plus the
  Season-1-ends-Aug-17 topic).
  ⚠ **The two owner one-shots are now imminent and still not ours to do**: the frozen
  forecast (`node src/snapshot.mjs --frozen`) must land on the LAST pre-launch refresh —
  which, with 12.1 live tomorrow, is effectively tonight's publish — and the SEPARATE
  `SNAPSHOT_PHASE` flip belongs at the Season-2 open (08-18, backstopped by
  `PHASE_FLIP_DUE` 08-20). `SNAPSHOT_PHASE` correctly still reads `12.1-ptr`.
- **WCL zones 52/54/56/57: evidence-only this run** (`wcl-fetch/evidence.json`, verdict
  `rdps-broken`). No zone-54 normalized cut and no zone-52 `ptrDummy` could land; the raw
  DPS series landed pre-agent — Dummy Dome 104 rows (1T 2000 players / 2T 635 / 3T 288 /
  5T 2000), Venomous Abyss 27 rows over the 6 encounters that have parses (Coiled Altar and
  Ula'tek at 0 players — untested window, not an error), M+ keys 27 (all 8 dungeons at the
  2000 ceiling).
- **The 9 specs at `ptr: null` stay null** (Frost DK, Feral/Guardian/Restoration Druid, Holy
  Priest, Elemental Shaman, all three Warlocks). No spec-review article for any of them is in
  the RSS window. New negative result worth recording so it is not re-attempted blind:
  **Wowhead's site search is not a discovery lane from CI** — `/search?q=…` returns 200 with
  zero `/news/` hrefs (JS-hydrated), and `/search/suggestions-template?q=…` *does* answer 200
  with JSON but only returns items and spells, never news. The remaining lanes for these nine
  are Discord paste-ins and community/HackMD guides, i.e. local-run work.

## 2026-08-09 (~05:0xZ) — LOCAL run (Opus 5; scheduled residential catch-up, evening of 08-08 local)

- **NO NEW BUILD. Feed stays at 15 entries; `ptr-builds.json` untouched.**
- **Channel 1 — official thread.** `2317811.json` pulled in full by curl (408 KB):
  `highest_post_number` still **19**, `last_posted_at` 2026-07-31T23:42Z. Unchanged since
  the 07-31 build; Linxy's forum activity feed corroborates (newest post 2026-07-31).
- **Channel 2 — Wowhead news RSS**, 40 items back to 2026-08-01, parsed per `<item>`.
  Two items newer than the 08-08 morning run's window, neither loggable: "From Narrative
  to End-Game Content" (Inven Global interviews — narrative and endgame systems, no
  tuning) and "The Very Boring Optimal Strategy for the Great Vault in Season 2" (a Bonus
  Roll gearing strategy piece). A keyword sweep of ALL 40 article bodies for tuning verbs
  found nothing new: the only dense hit is the 08-06 patch notes already in the feed.
- **A new PTR build DID deploy on 08-07/08 — and it carries no class tuning.** "Jimothy
  Added in Latest Patch 12.1 PTR Build" (08-08 00:34Z) confirms a build went up, but the
  article is a model/animation datamine of one NPC. No tuning article accompanied it and
  the forum thread got no post, so nothing enters the feed. Worth recording because the
  phrase "latest PTR build" in a headline is not by itself a feed event.
- **Channel 3 — blue tracker: the documented transport is DOWN from here.** Both
  `wowhead.com/blue-tracker` direct and via r.jina.ai return Cloudflare **403
  "Just a moment…"** (the news RSS on the same host is fine — it is the page, not the
  host). Substituted the Blizzard forum's own Discourse endpoints, which work with a
  plain browser UA and are the upstream anyway: `user_actions.json?username=<poster>`
  and `search.json`. Kaivax's newest 8 posts (to 08-07) are housing bugs, server
  status, M+ Umbral cutoffs and live-realm hotfixes — **no class-tuning blue post**.
  Two transport facts worth keeping: `user_actions.json` 404s for Kaivax specifically
  (profile resolves 200, activity feed does not), so use `search.json?q=%40<user>` for
  that poster; and `groups.json` is 403, so the tracker group cannot be enumerated.
- **The 08-07 LEAD is STILL outstanding and now overdue**: the Wowhead/Icy Veins/Raider.IO
  interview quoted Blizzard saying a Season 2 class-tuning roadmap "should release in the
  next couple days". Two days on it has not appeared in any of the three channels
  (forum search for "Class Tuning"/"roadmap" after 08-04 returns only player threads).
  12.1 ships **Aug 11**.
- **An UNVERIFIED PTR hotfix is corroborated by three independent creators and is
  deliberately NOT logged.** Tettles, YoDaTV and Shindigg each describe, from their own
  play, a Subtlety Rogue hotfix "one or two days ago" that fixed shadow damage failing to
  apply and overshot — YoDaTV and Shindigg both say it now double-dips on abilities that
  already worked, and expect it to be reverted. Tettles separately describes an Arcane
  Mage bug fix in the same window. Neither has an official source: no forum post, and no
  Wowhead hotfix round-up since 08-04. The rule is that a creator video is the tip-off and
  never the source of record, so nothing was written. **Re-check this first next run** —
  if a round-up appears it is a `hotfix` entry, and if the changes ship it lands in the
  launch notes instead.
- **WCL: unchanged, and the cause is still upstream, not us.** The one sanctioned cheap
  retry (local `config.json` credentials — note the keys are `wclClientId` /
  `wclClientSecret`, as the 08-08 run's doc nit records): OAuth **ok**,
  `characterRankings(metric: dps)` on encounter 3176 returns 100 rankings,
  `metric: rdps` still returns a bare **"Internal server error"**. The residential HTML
  statistics transport is **also still Cloudflare-403** (`server: cloudflare`, `cf-ray`
  present) exactly as on 08-08, so that regression has not lifted either. Zones
  54 / 52 / 56 / 57 not ingested; **no `snapshot` or `asOf` was touched**, so zone 54
  stays visibly frozen at 2026-07-28 (12d against the deliberately-raised maxAgeDays 40).
- **9 specs still `ptr: null`**, unchanged. Frost DK, Guardian Druid, Holy Priest and
  Demonology Warlock all gained or updated creator takes this run and none was promoted
  into a writeup — the expert aggregate is the sanctioned path and a hand-written writeup
  would double-count.
- **NO SEASON FLIP** — 12.1 ships Aug 11; `SNAPSHOT_PHASE` remains the pending one-shot
  owner action, `PHASE_FLIP_DUE` Aug 20.

## 2026-08-09 (nightly, CI runner)

- **No new build.** Official thread `2317811.json`: `highest_post_number` still **19**
  (Linxy, 2026-07-31T23:42Z) — already logged. Feed unchanged at 15 entries, newest the
  2026-08-06 launch patch notes.
- **Wowhead RSS** (40 items, 08-01 → 08-08, read from `content:encoded`): the 12.1 items
  are Jimothy datamined in the latest PTR build (cosmetic), More Season 2 M+ Dungeon
  Tuning (Ruby Life Pools / Temple of Sethraliss — encounter, no spec lines), Datamined
  Hotfixes (M+/raid/delve ability FLAGS — e.g. Void Toxin no longer reflectable, which is
  encounter-side and NOT a Warrior change), Embellishment + Potion tuning (items), and the
  Blizzard × Icy Veins × Raider.IO interview. **Nothing with a per-spec tuning line, so
  nothing was written.** Lead worth watching: that interview says a Season 2 **class-tuning
  roadmap** ships "in the next couple of days".
- **Blue-post channel**: the Wowhead blue-tracker index is JS-hydrated (0 topic links in
  raw HTML) and 403s through r.jina.ai. Swept the forum's own Discourse **search.json**
  instead (`q=@Kaivax after:2026-07-31`, same for @Linxy) — season/housing/M+-score topics
  only, no class tuning. Recording the transport because the 08-02 gotcha assumes the
  Wowhead index is reachable; it was not tonight, and Discourse search covers it.
- **WCL is evidence-only on the runner** (verdict `rdps-broken`): zone 54 normalized stays
  at 2026-07-28 (12 days; window raised to 40 for exactly this), zone 52 `ptrDummy` and
  zone 56 medians stay at 08-07. The three deterministic RAW series landed at 2026-08-09
  — and the zone-54 raw cut reporting **0 ranked players on The Coiled Altar and Ula'tek**
  independently corroborates that zone 54 is empty upstream, not just unreachable.
- **9 specs still `ptr: null`** (Frost DK · Feral/Guardian/Restoration Druid · Holy Priest ·
  Elemental Shaman · all three Warlocks). No spec-review article for any of them in the RSS
  window, and no Discord paste-in on a nightly, so they honestly stay null.
- **NO SEASON FLIP in the game** — but Wowhead's tier lists flipped to Season 2 ahead of it
  (see refresh-tiers log). `SNAPSHOT_PHASE` remains the pending one-shot owner action,
  `PHASE_FLIP_DUE` Aug 20, launch Aug 11.

- 2026-08-09 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly) · **No new PTR build.** Official forum thread fetched live via Discourse `.json`:
  `highest_post_number` still **19** (Linxy, 2026-07-31), unchanged since the last run —
  posts #18/#19 are already logged. Wowhead news RSS fetched live (40 items, HTTP 200): the
  **newest item is dated 08 Aug**, so there is nothing at all from today and nothing the
  nightly had not already seen. The 08-06 consolidated launch patch notes remain the newest
  entry in `data/ptr-builds.json` (15 entries). Nothing ingested, nothing stamped.
- **WCL zones 54/52/56/57 could not be checked** — the whole Warcraft Logs GraphQL API is
  returning HTTP 500 on every query from here, including `rateLimitData`; see the
  refresh-metrics log for the evidence. Stored rows and snapshots left alone, so the
  staleness stays visible rather than being papered over.
- ⚠ **OWNER ACTION DUE TOMORROW.** `render.mjs` states the freeze belongs on **2026-08-10,
  after the nightly publishes** — `node src/snapshot.mjs --frozen`, which declares which
  forecast the report card grades and writes the immutable
  `data/forecasts/frozen-<date>.json`. 12.1 lands **08-11**. This is an owner one-shot
  (committed once, never regenerated) so an unattended run must not do it; flagged in the
  run report. The SEPARATE `SNAPSHOT_PHASE` flip is NOT due yet — owner decision 2026-08-08
  moved it to **Season 2 open, 08-18**, not patch launch, with `PHASE_FLIP_DUE` 08-20 as the
  red-gate backstop. Both still pending; `SNAPSHOT_PHASE` correctly still reads `12.1-ptr`.

## 2026-08-09 (nightly CI, ~19:5xZ — second scheduled run of the day)

- **No new build. Three channels checked, all clean.** (1) Thread `2317811.json`:
  `highest_post_number` still **19** (Linxy, 2026-07-31) — nothing since. (2) Wowhead news
  RSS, 40 items 08-02→08-09, bodies read from `content:encoded`: the 12.1 items are Jimothy
  (cosmetic model in the newest PTR build), More Season 2 M+ Dungeon Tuning (Ruby Life
  Pools / Temple of Sethraliss encounter numbers), Datamined Hotfixes (ability FLAGS —
  immunity/reflect/LoS), Embellishment + Potion tuning (items) and the Atrophic Poison deep
  dive (a **community** finding about how the existing Rogue raid buff interacts with
  environmental damage — analysis, not a Blizzard change, so nothing to log). (3) Blue
  posts: Discourse search over @Kaivax / @Linxy since 08-01 → season-end, housing, server
  and M+ score topics only.
- **LEAD WORTH WATCHING: Blizzard has promised a Season 2 CLASS TUNING ROADMAP** "in the
  next couple of days" (Wowhead/Icy Veins/Raider.IO interview with Paul Kubit, news=382375,
  2026-08-07). That is exactly the kind of post that lands as a standalone blue topic
  rather than a reply in 2317811 — sweep the blue tracker for it, not just the thread.
- **The 9 uncovered specs stay `ptr: null`** (Frost DK, Feral/Guardian/Resto Druid, Holy
  Priest, Elemental Shaman, all three Warlocks). No spec-review article for any of them in
  the RSS window, and Wowhead's own `/news/search` is **Cloudflare-403 to this runner**, so
  lane (a) of the uncovered-spec procedure is not available from CI — it needs a local run
  or a search engine. Nothing was manufactured from tuning lines.
- **WCL: evidence-only, verdict `rdps-broken`** (`attemptedAt 2026-08-09T19:46:17Z`) — the
  five rDPS/normalized cuts stay frozen (zones 46/47 at 08-07, zone 54 at 07-28, ptrDummy at
  08-07); the three deterministic RAW series landed pre-agent: dummy 104 rows (1T 2000 /
  2T 623 / 3T 284 / 5T 2000), Venomous Abyss 27 (6 of 8 bosses populated — Coiled Altar and
  Ula'tek at 0 players, an untested window), M+ keys 27 (all 8 dungeons at the 2000 ceiling).
- ⚠ **The two owner one-shots are still pending and still not ours to do**: the frozen
  forecast (`node src/snapshot.mjs --frozen`, due 2026-08-10 after the nightly publishes;
  12.1 lands 08-11) and the SEPARATE `SNAPSHOT_PHASE` flip (owner-set for Season 2 open,
  08-18, backstopped by `PHASE_FLIP_DUE` 08-20). `SNAPSHOT_PHASE` correctly still reads
  `12.1-ptr`.

## 2026-08-08 (LOCAL run, Opus 5 — scheduled residential catch-up, ~03:3xZ / 20:3x PDT 08-07)

- **Both discovery channels swept live; NO new builds, and the feed stays at 15 entries.**
  This run fired ~12.5h after the 08-07 local catch-up and ~16h after the nightly, so the
  sweep was done fresh rather than trusting either — the window between them is exactly where
  a launch-week build could land unseen (12.1 ships 08-11 US / 08-12 EU, four days out).
- **A new PTR build WAS deployed in that window and it carries no class tuning.** Wowhead
  news 382381 (2026-08-08T00:34Z) — "Jimothy Added in Latest Patch 12.1 PTR Build" — confirms a
  build went up, but the article is a datamined cosmetic NPC model (a raccoon) and nothing else.
  Logged here so the next run does not re-investigate it as a missing tuning post.
- **Official forum thread 2317811: unchanged, newest post still #19 (2026-07-31).** Full
  Discourse `.json` pulled by curl (406 KB, 17 posts); no new Linxy reply.
- **Blue-tracker lane swept a different way, and the new way is worth keeping.** Wowhead's
  `/blue-tracker` index is **Cloudflare 403 to plain curl** (919-byte challenge, both the bare
  index and `?bt-forum=wow-us`) — the same wall the skill records for `wowhead.com/guide/*`.
  The canonical substitute is the Blizzard forums' own Discourse group feed:
  `us.forums.blizzard.com/en/wow/groups/blizzard-tracker/posts.json?limit=40` — HTTP 200 on
  plain curl, 20 posts with `created_at`, `username`, `topic_title`, `topic_id`, `post_number`.
  That is a direct read of the same source Wowhead mirrors, so it closes the 3b lane without
  depending on Wowhead rendering. **Use this first next time.**
- **Two Blizzard posts in the window, both out of per-spec scope, neither logged:**
  · SpeedyRogue, topic 2330956 #8 (08-07 21:32Z) — "More Season 2 Mythic+ Dungeon Tuning",
    large Ruby Life Pools / Temple of Sethraliss / Altar of Fangs / Den of Nalorakk / Blinding
    Vale encounter changes. **Dungeon tuning, zero per-spec class lines.** It is also not a
    reply in the tracked dev-notes thread, so `forumUrl` could not cite it; build #19's
    precedent (a no-class-tuning entry) does not extend here because that one WAS a thread post.
    An entry would carry 0 specs and reach no drawer.
  · Kaivax, housing blueprint bug; BlizzardEntertainment WoW Weekly / Twitch drop / Discord
    linking — all systems and promo.
- **Also seen and deliberately not treated as tuning data:** Wowhead's two 08-07 Blizzard
  interview write-ups, one titled "Class Tuning, Myth 9/6". Dev commentary in an interview is
  not a tuning note and has no verbatim spec lines; it never enters the feed or the tally.
- **WCL zones NOT re-probed this run, and that is the honest call.** All four were probed from
  this same residential IP 12.5h earlier (zone 54 empty 9.1 KB shell, zone 52 and 56 ingested,
  zone 57 still the 114-byte "no statistics collected" body) and every stored row already
  carries `asOf 2026-08-07` — the current local calendar date, so a re-fetch could not advance
  a single date and would only churn 127 rows with sub-percent drift. Nothing is stale: the
  live cuts are 1 day against `maxAgeDays` 10, and zone 54 stays visibly frozen at 2026-07-28
  (11 days, `maxAgeDays` 40) as intended.
- **9 specs still `ptr: null`, unchanged.** Three of this run's five transcripts were per-spec
  12.1 analysis, but none of it was promoted into a writeup — CLAUDE.md is explicit that creator
  takes feed the writeup gap only as an aggregate through `expertRead()`. Sha's Brewmaster video
  is the tempting case and was left alone for exactly that reason.
- **NO SEASON FLIP.** → **OWNER: the one-shot `SNAPSHOT_PHASE` flip is still pending;
  `PHASE_FLIP_DUE` is Aug 20, launch is Aug 11, and the Phase-1 S2 machinery is due before it.**
  `check-refresh --age` passes today (`fingerprint=clean`), so the gate is not yet nagging.

## 2026-08-08 (LOCAL, ~05:3xZ — confirmation only, no ingest)

- Fired ~9 minutes after the 08-07 evening sweep, so this was a re-confirmation rather than a
  fresh investigation. **Blizzard Discourse group feed** (`/groups/blizzard-tracker/posts.json`,
  the transport the last run recommended over the Cloudflare-403 Wowhead blue-tracker) pulled
  live: newest Linxy post in thread 2317811 is still **#19, 2026-07-31**. Newer blue posts are
  SpeedyRogue's Season 2 dungeon tuning (t2330956 #8, no per-spec class lines), a housing
  blueprint bug, and promo. **No new build or hotfix; feed stays at 15 entries.**
- **WCL zones 54 / 52 / 56 / 57 not re-probed.** Fetched from this same residential IP 14h
  earlier; every stored row carries its current date and nothing is near a staleness threshold
  (live cuts 1d against 10; zone 54 visibly frozen at 2026-07-28, 11d against 40).
- 9 specs still `ptr: null`, unchanged. The creator lane added a first-hand Mistweaver raid
  read this run (Megasett) — deliberately NOT promoted into a `ptr` writeup; CLAUDE.md is
  explicit that creator takes reach the writeup gap only as an aggregate via `expertRead()`.
- **NO SEASON FLIP** — the one-shot `SNAPSHOT_PHASE` action remains pending; `PHASE_FLIP_DUE`
  is Aug 20 and launch is Aug 11. `check-refresh --age` still passes (`fingerprint=clean`).

## 2026-08-08 — nightly CI (headless, Opus 5, single-shot; started 11:26Z)

- **NO NEW BUILD. Feed stays at 15 entries; nothing in `ptr-builds.json` changed.**
- **Channel 1 — official thread.** `2317811.json` pulled in full by curl (408 KB):
  `highest_post_number` still **19**, newest Linxy post **2026-07-31** (builds #18/#19,
  already logged).
- **Channel 2 — Wowhead news RSS**, 40 items back to 2026-07-31, parsed per `<item>`.
  A new PTR build **did** land 08-07, but its only reported content is a datamined
  cosmetic (**"Jimothy Added in Latest Patch 12.1 PTR Build"**) — no class tuning.
  Deliberately NOT logged, with reasons: Season 2 **M+ dungeon encounter** tuning
  (08-07 Ruby Life Pools / Temple of Sethraliss; 08-05 Altar of Fangs), **embellishment
  + potion** tuning (08-05: Polished Ammolite −90% crit, Snakeskin Lining −90%, Adorned
  Fang −70% haste, Liquid Luster −52% vers), and **datamined ability-flag hotfixes**
  (08-04: dungeon/raid/delve immunity + reflect + AoE-DR flags). None carries a
  spec-attributable line; a highlight with no `Spec Class ` prefix reaches no drawer and
  could only pollute the outlook tally.
- **Channel 3 — blue tracker.** The direct page is **JS-hydrated: 200, 69 KB, ZERO
  `/blue-tracker/topic/` hrefs** even with the full browser header set — use the
  **r.jina.ai** render, which lists topics cleanly. Newest US/EU topics: M+ Umbral score
  cutoffs (07 Aug), the S2 dungeon-test feedback thread, Coiled Isle / Discord-link /
  Twitch-drop promo, and the already-logged Content Update Notes. **No standalone
  class-tuning blue post** of the 2026-07-16 "Healer Tuning" shape.
- **LEAD for the next run:** the 08-07 Blizzard interview (Wowhead / Icy Veins / Raider.IO,
  Paul Kubit + Rachel Vought) says a Season 2 **class-tuning roadmap "should release in the
  next couple days"** — verify against the forum before logging anything.
- **Tier sets:** no build highlight touched a set bonus, so no `tierSet.asOf` bump.
- **9 specs still `ptr: null`** (Frost DK · Feral/Guardian/Restoration Druid · Holy Priest ·
  Elemental Shaman · all three Warlocks). Lanes worked this run and what they cost:
  (a) Wowhead site search is JS-hydrated — `?search=` through r.jina.ai returns ad-consent
  chrome and no articles; (b) Icy Veins news index likewise, RSS 404s; (d) **community
  sites checked directly for the first time in a while** — `dreamgrove.gg`'s Feral,
  Guardian and Resto compendiums are explicit **12.0.7** documents (Feral and Guardian
  mention "12.1" **zero** times; Resto only inside an addons caution), and the
  DK / Priest / Shaman / Warlock `sites[]` entries are SimC APL and sim-profile **repos**,
  not analysis. So the Dreamgrove lane is genuinely dry for 12.1 today — worth re-checking
  after launch, when the compendiums rebuild for Season 2.
- **WCL zones 54 / 52 / 56 are evidence-only on this runner.** `wcl-fetch/evidence.json`
  verdict `rdps-broken`; the three RAW keys landed (zone-54 pooled shows **Coiled Altar
  and Ula'tek at 0 ranked players**, i.e. between testing windows), the five rDPS/normalized
  cuts did not. Zone 57 (Tidebound Grotto) is not in the deterministic step and was not
  probed from here.
- **NO SEASON FLIP** — 12.1 ships **Aug 11**, every live tier page still reads 12.0.7 /
  Season 1. `SNAPSHOT_PHASE` remains the pending one-shot owner action; `PHASE_FLIP_DUE`
  is Aug 20.

## 2026-08-08 — LOCAL run (~14:1xZ, Opus 5; scheduled residential catch-up, ~3h after the nightly)

- **NO NEW BUILD. Feed stays at 15 entries; `ptr-builds.json` untouched.**
- **Channel 1 — official thread.** `2317811.json` pulled in full by curl (408 KB):
  `highest_post_number` still **19**, `last_posted_at` 2026-07-31T23:42Z. Unchanged from
  the nightly.
- **Channel 2 — Wowhead news RSS**, 40 items back to 2026-07-31, parsed per `<item>`.
  Exactly **one** item newer than the nightly's window: "Things to Do to Prepare for Patch
  12.1" (08-08 13:10Z). Read its `content:encoded` — a pre-patch checklist (campaign chapter,
  Omnium Folio, Coiled Isle unlock) with **zero** tuning verbs. Not logged.
- **Channel 3 — blue tracker** via the r.jina.ai render (the direct page is still
  JS-hydrated). Newest topics are the S2 dungeon-test feedback thread, M+ Umbral cutoffs,
  a housing blueprint bug, launch/Twitch-drop promo. **No standalone class-tuning blue post.**
- **The 08-07 LEAD is still outstanding**: the Blizzard interview said a Season 2
  class-tuning roadmap "should release in the next couple days". As of this run it has not
  appeared in any of the three channels. Carry it forward — 12.1 ships **Aug 11**.
- **WCL: the residential HTML transport is DOWN too, and this is new.** Prior runs relied on
  "the HTML statistics endpoint works from a residential IP" (refresh-metrics, ptr-watch
  step 5). Today all five cuts return **HTTP 403 "Just a moment…" with `server: cloudflare`**
  — and so does `warcraftlogs.com/` itself, so it is a whole-origin challenge from this IP,
  not an endpoint or header problem. Ruled out by probe: the documented minimal XHR recipe,
  a full browser header set (sec-ch-ua / sec-fetch-* / Origin), and a plain document-mode
  navigation all get the same challenge with a `cf-ray`. **Nothing was ingested and no
  `snapshot`/`asOf` was touched** — the staleness stays visible, per the standing rule.
- **The sanctioned API path was also re-checked** (the documented ONE cheap retry, run
  locally with the config.json credentials): OAuth **ok**, `characterRankings(metric: dps)`
  on encounter 3176 returns 100 rankings, `metric: rdps` still returns a bare **"Internal
  server error"**. So the rDPS family remains broken upstream exactly as the nightly's
  `wcl-fetch/evidence.json` verdict `rdps-broken` recorded at 11:03Z — the five WCL rows are
  honestly unreachable from here too, for the same upstream reason rather than an IP one.
  Zones 54 / 52 / 56 / 57 therefore not ingested; zone 54 remains frozen at 2026-07-28
  (11d against the deliberately-raised maxAgeDays 40).
- **Doc nit found while doing this**: refresh-metrics SKILL.md says config.json carries
  "the same two fields (`clientId`, `clientSecret`)". The actual keys — per
  `config.json.example` and the live file — are **`wclClientId` / `wclClientSecret`**.
  Reading the skill literally yields a silent OAuth 401. Not fixed in this data run.
- **9 specs still `ptr: null`**, unchanged (Frost DK · Feral/Guardian/Restoration Druid ·
  Holy Priest · Elemental Shaman · all three Warlocks). No writeup was manufactured from
  this run's creator takes — Frost DK, Holy Priest and Mistweaver all gained takes, and
  CLAUDE.md is explicit they reach the writeup gap only as an aggregate via `expertRead()`.
- **NO SEASON FLIP** — 12.1 ships Aug 11; `SNAPSHOT_PHASE` remains the pending one-shot
  owner action, `PHASE_FLIP_DUE` Aug 20.

## 2026-08-07 — nightly CI (headless)

- **THE OFFICIAL PATCH 12.1 NOTES LANDED (2026-08-06) AND ARE NOW IN THE FEED** — builds
  14 → 15, and it is the largest single entry the feed has ever carried: **all 40 specs**
  plus 9 class-wide lines.
  · **It is NOT a reply in the tracked dev-notes thread.** `2317811.json` is still at
    `highest_post_number` 19 (Linxy, 07-31). The notes are a standalone Blizzard post,
    found by sweeping the **Wowhead blue-tracker index** (full browser header set — a
    UA-only fetch is 403) → `curse-of-ulatek-content-update-notes-2333514`. That forum post
    is a two-sentence stub linking `worldofwarcraft.blizzard.com/en-us/news/24293281`.
  · **Transport trap worth keeping:** `worldofwarcraft.com/en-us/news/<id>` 301s to
    `worldofwarcraft.blizzard.com` and curl without `-L` returns a 134-byte nginx stub that
    looks like a fetch failure. Follow the redirect (or use the `.blizzard.com` host).
  · **Read from the ARTICLE's HTML, never the RSS `content:encoded`.** Wowhead's RSS body
    flattens the whole thing to `<p>`/`<br>` — no headings, no nesting — which is exactly
    the attribution-destroying shape the skill warns about. The article keeps `<details>`
    per class with `<strong>` spec headings and nested `<ul>`; a recursive `<li>`/`<ul>`
    walk yields **773 outline lines** with intact `CLASS > Spec > Hero Talents > Tree`
    paths. Every per-spec line in the entry came from that outline.
  · Logged as a **build** (not a hotfix) with `forumUrl` = the blue post, `forumPostNumber`
    null, `wowheadUrl` = news=382367. **Do not file a standalone blue post as `kind:
    "hotfix"` when it is the newest entry**: `test/validate.test.mjs` mutates
    `ptrBuilds.builds[0].forumUrl` and a hotfix rejects that field, so the suite goes red —
    and a test edit is not in the nightly's staged paths, so it cannot be fixed from CI.
- **Tier-set upkeep.** The only **Season 2** set change in the notes is Retribution
  Paladin's *Divine Arbiter now benefits from Divine Purpose and Greater Judgment*
  (its dev note names the tier set) → `tierSet.set4` amended, `asOf` 2026-08-06, `source`
  = the blue post. The Augmentation Evoker / Restoration Shaman / Arms Warrior lines touch
  **Midnight Season 1** set bonuses — a different set from the one the card shows — so all
  three Season 2 bonuses were **re-verified unchanged** against their own cited sources
  (thread posts 16 and 18; Wowhead news 381911) and only `asOf` was bumped. The upkeep gate
  cannot tell S1 from S2 wording, so expect it to fire on any S1 set line; the honest fix is
  a re-verify against the ORIGINAL source, never re-pointing the card at the new post.
- **9 specs stay `ptr: null`.** No per-spec 12.1 analysis for any of them appeared in the
  RSS window, and the other discovery lanes are closed from CI: Wowhead search is
  JS-hydrated, the Icy Veins news index is JS-hydrated with a 404 RSS, and a DuckDuckGo
  HTML query returned **zero** results from this IP. Guardian Druid may close next run —
  YoDaTV published a 12.1 Guardian guide, now queued for transcript (see watch-creators).
- **WCL is evidence-only on this runner.** `wcl-fetch/evidence.json` verdict
  `rdps-broken`; zone 54 (PTR raid, normalized), zone 52 `ptrDummy` and zone 56 medians all
  stay frozen. The three `*-raw` keys landed pre-agent. Zone 57 not probed (agent holds no
  WCL access at all).
- **NO SEASON FLIP** — the patch notes are pre-launch (12.1 ships **Aug 11 US / Aug 12 EU**,
  Venomous Abyss **Aug 18/19**) and every live tier-list page still era-verifies as 12.0.7 /
  Season 1. → **OWNER: the one-shot `SNAPSHOT_PHASE` flip is still pending, `PHASE_FLIP_DUE`
  Aug 20.**
- `npm test` 332 pass / 0 fail, build OK, snapshot written, manifest rewritten and both
  `check-refresh` gates pass.

## 2026-08-15 (third run of the day — nightly, headless)

- **No new build.** Four channels swept: (1) dev-notes thread `2317811.json` via curl — 17
  posts, `last_posted_at` **2026-07-31T23:42:09Z**, newest is Linxy #19, already logged; the
  PTR thread has been quiet 15 days because the cycle ended when 12.1 shipped 08-11. (2)
  Wowhead news RSS, 40 items, newest 2026-08-15 12:40 CDT. (3) The news INDEX
  (`data.news.newsData`, brace-balanced from the id attribute) polled as well since it leads
  RSS — top id 382472, nothing beyond RSS. (4) Blue tracker (`data.blueTracker.default`), 50
  entries deduped by topic.
- **Two candidate posts read in full and deliberately NOT logged.** The Aug-13 and Aug-14
  Kaivax hotfixes each carry a `Classes` section that is **entirely bug fixes** — Devastation
  Shattering Star/Mastery, Warrior Executioner double-effect, Warlock pet Soul Leech,
  Demonology cooldown-manager, Affliction Seed of Corruption — with no tuning values; and the
  Aug-12 "Season 2 Class Tuning Plans" is a **calendar** (Aug 18 / Aug 25 / Sep 1 / Sep 22)
  with no per-spec lines. Writing either as `Spec Class — …` highlights would feed bug-fix
  and schedule text into the outlook tally.
- The feed's newest entry (2026-08-15, Linxy topic **2336820**, "Class Tuning Incoming –
  August 18") is the Wowhead item `news=382466` and was logged by an earlier run today.
- **Writeup coverage recomputed, not read:** exactly **one** spec has no `ptr` writeup —
  Demonology Warlock, the deliberate "source reported no changes" null — and **every** spec
  now carries both a raid-scoped and an M+-scoped expert read (the Brewmaster raid gap noted
  on 08-14 is closed).
- WCL is evidence-only here: `wcl-fetch/evidence.json` verdict `rdps-broken`, so zone 54
  (normalized), zone 52 `ptrDummy` and zone 56 medians stay frozen; the three `*-raw` keys
  landed pre-agent (z52 102 rows with 1T/2T/3T/5T at 2000/662/297/2000 players; z54 27 rows,
  Coiled Altar and Ula'tek at 0 parses; z56 27 rows, all eight dungeons at the 2000 ceiling).
  Zone 57 not probed — the agent holds no WCL access at all.
- **SEASON STATE:** 12.1 is live and three of four tier sources self-identify as Season 2;
  the machinery handles this by design (seasonVerified s2 → season-ahead lane + frozen
  letters, Archon still s1 and the only live-consensus contributor). **OWNER: the one-shot
  `SNAPSHOT_PHASE` flip is still pending — runbook date 08-18, `PHASE_FLIP_DUE` Aug 20.**
