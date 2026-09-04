# refresh-metrics run log

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


## 2026-09-04 (nightly) — SimC re-simmed (23 rows, new HEAD) and Mythicstats moved WITHIN period 1079 (31 of 40); Murlok, WoWMeta and Bloodmallet all fetched, diffed and byte-identical; Archon walled night 11

- **SimulationCraft — MERGED 23 rows, a genuinely fresh sim.** `MID2_Raid.txt` HTTP 200, 1.36 MB,
  `Last-Modified 2026-09-04T07:29:44Z`, and it HAS a `DPS Ranking:` block so the `.html` fallback
  was not needed. Era-verified off the header build string, not the visible version:
  `12.1.0.69587 Live (hotfix 2026-09-02/69587, git build HEAD 7d86fb9c3a)` — the HEAD moved from
  the stored `f5b50a3f97`, which is the freshness detector and the honest reason values moved.
  43 profile lines mapped by LONGEST-PREFIX with a hyphen allowed, best hero-variant per spec,
  leading `Raid` row skipped -> 23 of 27 DPS. The 7 unmapped lines are the tank profiles, which
  is correct. Moves are **23 of 23 rows but max 0.3%**, family median 240106 -> 240089: ordinary
  iteration noise, nowhere near `maxValueMovePct` 0.6. asOf 2026-09-04.
- **Mythicstats — MERGED 40 rows at the SAME period.** `/period/latest` 302s to **1079 again**
  ("week 3 of MID2", top 2000 keys, 10000 characters / 3838 unique, 17.4 avg key level), yet
  **31 of 40 values moved**. Worth writing down: the period id is NOT a change detector — the
  window rolls inside the week, so re-parse and re-merge every run rather than short-circuiting
  on an unchanged period. Shape-checked before merging (the only thing separating this column
  from the `/meta` per-key-presence one): sum **100.2**, role subtotals Ranged 31.5 / Melee 28.5
  / Tank 20 / Healer 20. All values are under `minValueMagnitude` 100, so the relative-move guard
  correctly ignores swings like 0.3 -> 0.1.
- **Murlok — fetched, diffed, nothing to merge (partial).** Three meta pages, plain browser-UA
  GET, HTTP 200, 41–71 KB; 27/7/6 = 40 rows, 0 missing, all 40 byte-identical to stored.
  ⚠️ **Take the machine-readable `<time datetime="…">`, never the rendered "Updated N hours
  ago".** All three pages render "Updated 6 hours ago" while their `datetime` reads
  `2026-09-02T10:10:2xZ` — the visible string is server-rendered at build and was ~52h stale
  here. Believing it would have stamped today's date on two-day-old numbers, which is the exact
  failure the bloodmallet/wowmeta `asOf` rule exists to stop. asOf stays 2026-09-02.
- **WoWMeta — fetched, diffed, nothing to merge (partial).** `manifest.json` snapshotDate
  2026-09-01 and the rankings file's `Last-Modified` 2026-09-01 AGREE (so not the 08-04
  pinned-manifest shape), and the payload was diffed anyway: 44 blocks, whitelist
  `{dps,hps,tank}` + `sortField lowerBound` + `keyRange undefined` -> 40 rows, all identical.
  The 2026-08-21 owner-accepted standing red continues; upstream is frozen, not our fetch.
- **Bloodmallet — fetched, diffed, nothing to merge (partial).** All 27 DPS charts requested with
  up to 3 retries: 23 real charts, and the same **4** returning the 76-byte error body on 3/3
  each (Balance, Feral, Augmentation, Devastation). All 23 carry `simc_settings.tier = MID2`
  (read off the chart) and `ptr` as the string `"0"`; per-chart timestamps 21x 2026-09-02 plus
  Retribution and Demonology at 2026-09-03 — **identical to stored, and all 138 target values
  byte-identical**. Upstream has not re-simmed since the 09-03 wholesale adoption, so the
  coverage date honestly does not move and no ack was needed.
- **Archon — walled, night 11**, all nine archon-* rows `unreachable` together. Shape today was
  **HTTP 403 + Cloudflare "Just a moment..."**, not the 200-plus-human-verification body the
  contract label describes; `__NEXT_DATA__` count 0 on all 11 URLs. Nothing backfilled from WCL.
  The per-boss survivability substitution stays a closed dead end and was not attempted.
- **Warcraft Logs — evidence file only, no request made from this session.**
  `wcl-fetch/evidence.json` attemptedAt 2026-09-04T14:31:21Z, verdict `rdps-broken`, oauth and
  graphql both healthy (1 of 3600 points spent), `landed` and `rawRecipes` both **empty**. Both
  live rows recorded `unreachable`; stored rows stand at 2026-08-10.
- **Robydoby deliberately not fetched** — its two sheets are the CLOSED 12.1 PTR cycle's zone-54
  lane, it sits outside `required-sources.json` by design, and the stored rows are final receipts.

- **PRUNE DEFERRED to a local run, deliberately — and the reason is structural.** This log is at
  27 entries against the header's "~20", but a NIGHTLY cannot prune safely: the 2026-08-15
  precedent is that durable rules must be promoted into `SKILL.md` *before* the entries carrying
  them are dropped, and the publish job stages only `data/`, `dist/` and
  `.claude/skills/*/log.md` (nightly.yml) — a `SKILL.md` edit made here is never committed. So a
  nightly prune can delete a rule but cannot save it. Checked before deferring: the drop range
  (7 entries) holds no rule-shaped or ⚠️-marked content, but the scan was a grep and not
  a read, which is exactly the confidence a nightly should not act on. Files are 144 KB, well under the Read tool's 262,144-byte gate, so
  nothing is broken by waiting for a run that can do both halves.
## 2026-09-03 (local, interactive) — MID2 ADOPTED WHOLESALE: Bloodmallet 23 charts + SimC MID2_Raid 23 rows merged under Riley's value_move_ack; the three MID1-only rows dropped; both standing reds CLOSED

- **Decision and gate.** Riley chose adoption from the session's health check (the 09-02 heartbeat
  had the two sim rows at 57 and 26 days). `check-refresh --manifest --value-ack="…"` waived
  **151 findings** (138 Bloodmallet target rows + the family medians + 23 SimC rows) and then passed
  outright — movement 0, row-drop inside limits, no other line — so the ack was the only thing
  holding this. The manifest was NOT rewritten (partial run: two requirements, not a full
  refresh); its two `partial` rows describe last night honestly and the next nightly rewrites them.
- **Bloodmallet — 23 of 27 DPS charts merged, tier MID2 on every one** (read off
  `simc_settings.tier`, `ptr` the string `"0"`, per-chart `timestamp` date as `asOf`: 21 at
  2026-09-02, Retribution and Demonology at 2026-09-03). Targets kept at the canonical
  1/2/3/5/8/15 (the chart also publishes 4/6/9). **Balance, Feral, Augmentation, Devastation** still
  return the 76-byte error body on 3/3 retries each — the same four the nightly has recorded since
  08-31. The stored MID1 profiles for Balance, Feral and Devastation (Augmentation never had one)
  were **DROPPED, not held**: the uniformity guard rejected the merge with them present (verified —
  apply-metrics refused "MID2 x23 | MID1 x3"), so the order is drop first, merge second.
  26 -> 23 rows (11.5%). Measured against the stored MID1: 121 of 138 overlapping target rows moved
  >60%, MID2/MID1 ratio min 1.152, median 1.908, max 2.872 — identical to the 09-03 nightly's own
  numbers, which is the parse check.
- **SimC — `MID2_Raid.txt` (1,361,242 bytes, Last-Modified 2026-09-03T07:30:19Z), header
  `12.1.0.69587 Live (hotfix 2026-09-02/69587, git build HEAD f5b50a3f97)`.** `DPS Ranking:` block:
  43 profiles; longest-prefix mapping with the hyphen allowed reaches **23 of 27 DPS specs** (best
  hero-variant each); the 7 unmapped names are all tanks (Protection ×3, Brewmaster, Vengeance,
  Blood ×2) — the expected residue. Same four specs absent as Bloodmallet. Stored MID1 rows for
  Balance/Feral/Devastation dropped so the `SimC nightly Patchwerk DPS` rank pool sits on one side of
  `PHASES.liveSince` (the season-uniform guard fired on the mixed state, as designed). 26 -> 23 rows.
  `asOf` = the report's Last-Modified date, 2026-09-03. All 23 overlap rows moved >60% (1.78–2.35x).
- **Registry.** `sources.json`: bloodmallet author "(tier MID2)", both pages snapshot 2026-09-03 and
  the SimC-report page re-pointed at `MID2_Raid.html`; simulationcraft's report page label/url ->
  MID2_Raid, snapshot 2026-09-03, methodology/notes restated. **The report NAME follows the sim
  tier** — `MID1_Raid.txt` has been a 272-byte in-progress stub with the same build header since
  09-01 and is not a fallback (SKILL.md now says so in the transport bullet).
- **Contract + heartbeat (reviewed edits, separate commit).** Both labels in `required-sources.json`
  restated: the 08-21/08-28 OWNER-ACCEPTED STANDING REDs are CLOSED, and a night where the four
  missing specs still error simply merges the charts that exist (tier matches; row floor 15 and
  maxRowDropPct still bound it). Also `FLOOR_RESTORE_DUE` 09-01 -> **10-01** (exported; the test
  derives its "after" date from it): nine nightlies landed 5–7 of 21 with 13 requirements
  structurally unable to succeed, so restoring 7 would have redded six of nine nights.
- **Tests.** Two fixtures hard-coded the pool's tier and became no-ops/contradictions the moment
  the pool moved: `validate.test.mjs` (partial-mix and wholesale cases) and `apply-metrics.test.mjs`
  (the Outlaw profile row). Both now DERIVE the tier from the stored pool. 377 pass / 0 fail / 1
  permanent skip, UI invariants ran.
- **Trap for the next reader:** the sim tier will roll again (MID3 at 12.2). Everything above is
  keyed on reading the tier off the chart; the only literals left are the report URL in
  `sources.json` and the SKILL.md transport text — update both in the same reviewed edit.

## 2026-09-03 (nightly) — Murlok re-cut after five days (40 rows), WoWMeta's manifest finally caught up, Mythicstats rolled to period 1079; Bloodmallet and SimC still HELD

- **Murlok — MERGED, 40 rows, and it is the first re-cut since 2026-08-28.** Plain browser-UA GET
  on all three meta pages (r.jina.ai does not work on murlok), HTTP 200, 41-71 KB. Rows split on
  `<a [^>]*class="vi-box meta-item` per the 08-31 attribute-order trap; counts reconciled at
  27 DPS / 7 healer / 6 tank = 40 before merging. Each page's own `<time datetime>` now reads
  **2026-09-02T10:10Z** (08-28 for four straight nights before this), and every one of the 40
  values moved, all upward by **2.7-7.0%** (median about 4.2%) — the shape of rating ceilings
  climbing through a season, not a re-scale. Well inside `maxValueMovePct` 0.6 and
  `maxFamilyMedianMovePct` 0.35. Merged at the SOURCE's date 2026-09-02, so the row is `success`
  (stored date within a day of the run) and the coverage date advances honestly.
- **WoWMeta — MERGED, and this is the 08-04 pinned-manifest shape RESOLVING.** `manifest.json`
  HTTP 200 with `snapshotDate` **2026-09-01** (completedAt 2026-09-01T22:25:20Z) against 2026-08-11
  for the last three weeks; `rankings/midnight/mplus/all/0.json` HTTP 200, 161,730 bytes,
  `Last-Modified: Tue, 01 Sep 2026 22:23:28 GMT` (last night: 161,637 bytes at 01 Sep 00:21:38).
  Selection as specified: 44 blocks, whitelist `categoryType` in {dps,hps,tank} + `sortField`
  lowerBound + `keyRange === undefined` = 27+7+6 = **40 rows** (melee/ranged excluded as dps
  subsets). The payload was DIFFED rather than trusted, and the result is the mirror image of last
  night: **0 of 40 lowerBound values moved and 0 of 40 numberOfCharacters moved** — the 22:23 rewrite
  carries the same numbers we merged from the 00:21 file, and what actually changed is that the
  manifest caught up to them. So the merge here is a DATE correction, not new numbers: `asOf` moves
  2026-08-11 -> 2026-09-01, which is what the source now says its snapshot is. Row is `partial`, not
  success, because 09-01 is two days from the run and `check-refresh` requires within one.
- **Mythicstats — MERGED 40 rows at a NEW period.** `/period/latest` HTTP 200, 215 KB, now resolving
  to **period 1079** ("week 3 of MID2", Lindormi's Guidance / Xal'atath's Bargain: Devour / Fortified
  / Tyrannical / Xal'atath's Guile), against 1078 last night; the page says the period "just started
  and is still in progress" with 10000 characters (5350 unique), 16.6 average key level. Parse bounded
  to the "Spec representation in top keys" section (the whole page yields ~59 rows from the
  Classes-and-specs block and the per-dungeon sections), labels normalised on `[-\s]+`: **40 rows,
  0 unmatched — Fire Mage is back upstream**, so this is the first full-roster cut in days. Sanity
  check before merging: series sum **99.9** with role subtotals DPS 59.8 / Tank 20.0 / Healer 20.1,
  i.e. the representation share and not the `/meta` per-key-presence column. 37 of 40 values moved,
  which is a fresh-period reset rather than drift (Arms 12.2 -> 9.9, Outlaw 2.9 -> 1.1, Prot Paladin
  2.0 -> 3.3, Havoc 0.5 -> 1.4); every value is under `minValueMagnitude` 100 so the value-move gate
  does not apply. Merged at 2026-09-03.
- **Bloodmallet — HELD WHOLESALE for a ninth night, and the hold is now blocked by ONE gate.**
  All 27 DPS charts requested at `talent_target_scaling/castingpatchwerk` with 3 retries each:
  **23 return real payloads**, every one carrying `simc_settings.tier = MID2` (read off each chart,
  never hard-coded) at chart timestamps 2026-09-02 / 09-03; **4** still return the 76-byte
  `{"status": "error"}` body on every retry — **Balance Druid, Feral Druid, Augmentation Evoker,
  Devastation Evoker**. Retribution Paladin, which had been in that set, is BACK. Against the 26
  stored MID1 profiles (2026-07-08 / 07-15), wholesale adoption of the 23 would drop 26 -> 23 rows
  = **11.5%**, comfortably inside `maxRowDropPct` 0.25 — so the row floor no longer blocks it. What
  does: **121 of the 138 overlapping target rows move more than 60%** (MID2/MID1 ratio min 1.152,
  median 1.908, max 2.872), tripping `maxValueMovePct` 0.6, and that gate has no agent-writable
  proposal channel — only a human `value_move_ack` re-run or a reviewed local run can land it. The
  tier-uniformity invariant separately forbids a pool holding both MID1 and MID2. Nothing merged;
  `fightProfile.asOf` stays each chart's OWN timestamp, so the coverage date does not move and the
  staleness red is the honest signal.
- **SimulationCraft — HELD for a ninth night, same single blocker.** `MID2_Raid.txt` is 1.36 MB,
  `Last-Modified` 2026-09-03T07:30:19Z, header `12.1.0.69587 Live (hotfix 2026-09-02/69587, git build
  HEAD f5b50a3f97)` — a NEW build hash again (adc39a57a2 last night), so upstream is re-simming
  daily. Its `DPS Ranking:` block holds 43 profiles which map by longest-prefix (hyphen allowed) to
  **23 of 27 DPS specs**; absent are Balance, Feral, Augmentation and Devastation — **the same four
  Bloodmallet is missing**, which is why the two contract rows keep clearing together. `MID1_Raid.txt`
  is again **272 bytes** (Last-Modified 2026-09-03T07:07:34Z), an in-progress run with no ranking
  block, and carries the SAME build header as MID2 — so MID1 is neither a 12.0.7 artefact nor a
  usable fallback. Wholesale adoption would drop 26 -> 23 rows = 11.5%, inside the row floor, but all
  23 overlap rows move more than 60% (77.6% to 135.2%), so the value gate fires and needs the human
  `value_move_ack`. Nothing merged; the stored 26 rows and their 2026-08-08 date are byte-identical.
- **Archon numerics (six contract rows) — walled.** Same site-wide human-verification wall as the
  tier pages: all 11 registered archon.gg URLs HTTP 403, ~6.1 KB Cloudflare managed-challenge body,
  `__NEXT_DATA__` count 0. Asserted on `__NEXT_DATA__`, not the status code. Nothing merged, nothing
  backfilled from Warcraft Logs (hard rule 3).
- **Warcraft Logs — evidence file only, no warcraftlogs.com request made from this session by any
  means.** `wcl-fetch/evidence.json` attemptedAt 2026-09-03T14:42:44.810Z, verdict **`rdps-broken`**,
  detail "characterRankings(metric: rdps) on encounter 3176: Internal server error". Transport itself
  healthy (oauth true, graphql true, 3600 points/hour, 12.3 spent). `landed = {}` and
  `rawRecipes = {}`, so no key landed rows and no cut may claim success. Stored zone-53/55 series
  unchanged at 2026-08-10 — the OWNER-ACCEPTED standing red.
- **OWNER ACTION now overdue, surfaced by `check-refresh --age`**: `minSuccessfulSources` is still
  **5**, and the contract's own comment dated the S2-transition lowering "RESTORE TO 7 by ~2026-09-01".
  The heartbeat names it explicitly as of tonight. It is the GATE CONTRACT, so no agent may touch it —
  and the evidence says it is safe to restore: tonight's run landed **7** successes (icyveins, method,
  wowhead, murlok, mythicstats, blizzard-ptr, creators), exactly at the restored floor, with Archon
  walled and both WCL rows in their standing red. Restore it in `data/required-sources.json`, or move
  `FLOOR_RESTORE_DUE` in `src/check-refresh.mjs` if the window has to extend.
- **Also red on the heartbeat and NOT fixable from a nightly**: `gearing-specs` is 32 days stale
  (max 30). Gearing harvests are manual by design — a local-run duty, not a nightly one.
- **Robydoby not refreshed, deliberately**: the sheets are 12.1 PTR zone-54 percentiles and the PTR
  cycle is CLOSED, so the stored rows are that cycle's final receipts. It is outside
  `required-sources.json` by design and carries no manifest row.
## 2026-09-01 (nightly) — WoWMeta re-ran (40 rows merged under its own lagging date) and Mythicstats moved within period 1078 (39 rows); Murlok still frozen; SimC + Bloodmallet held a SEVENTH night

- **WoWMeta — the 2026-08-04 pinned-manifest shape is BACK, and diffing the payload is what
  caught it.** Two plain curls, no headers/proxy/auth. `manifest.json` HTTP 200 →
  `snapshotDate` **2026-08-11** (completedAt 2026-08-11T22:52:39Z), i.e. unchanged for 21
  days — but `rankings/midnight/mplus/all/0.json` came back HTTP 200 at **161,637 bytes with
  `Last-Modified: Tue, 01 Sep 2026 00:21:38 GMT`** (161,191 bytes / 11 Aug last night). The
  manifest step and the rankings step run independently, so the frozen snapshotDate is NOT
  evidence the data is frozen. Selection exactly as specified: 44 blocks, whitelist
  `categoryType ∈ {dps,hps,tank}` + `sortField lowerBound` + `keyRange === undefined` =
  27+7+6 = **40 rows** (melee/ranged excluded as dps subsets). **All 40 `lowerBound` values
  moved** and every `numberOfCharacters` grew, several severalfold (Arcane Mage 38,032 →
  228,312; Blood DK 61,738 → 179,977), which is a population accumulating rather than a
  re-scale. Merged at **1 dp** to match the stored precision, and `asOf` stays the SOURCE's
  `manifest.snapshotDate` 2026-08-11, never today — so the coverage date does not advance,
  the row is `partial`, and the staleness red stays as the honest signal. Movement is well
  inside the value gate (largest single move Augmentation 415.6 → 321.6 = −22.6%, family
  median ≈ −3%).
- **Mythicstats — moved WITHIN period 1078, which the period id alone would have hidden.**
  `/period/latest` HTTP 200, 196 KB, still resolving to period 1078, but the subtitle is NOT
  identical to last night: "10000 characters (**2671** unique), **17.3** average key level"
  against 2833 / 17.2. Parse bounded to the "Spec representation in top keys" section
  (scanning the page yields ~59 rows from the Classes-and-specs block and the per-dungeon
  sections), labels normalised on `[-\s]+`, whitespace-tolerant number match: **39 rows**.
  Shape-checked BEFORE merging — series sum **99.9** with role subtotals DPS 60.0 / Tank
  19.9 / Healer 20.0, i.e. the representation share and not the `/meta` per-key-presence
  column. **25 of 39 values moved** (largest: Unholy DK 1.5→0.9, Arms Warrior 11.5→12.2,
  Demonology Warlock 3.5→3.9). Merged at `asOf` 2026-09-01. **Frost Mage is BACK upstream**
  at an explicit 0.0 (it was absent last night); **Fire Mage is now the absent one** and
  keeps its stored 0 at 2026-08-30 — a legitimate upstream absence, not a parse failure.
- **Murlok — fetched cleanly, upstream still has not re-cut.** Three meta pages by plain
  browser-UA GET (r.jina.ai does not work on murlok), HTTP 200, 41–71 KB. Split on
  `<a [^>]*class="vi-box meta-item` per the 08-31 attribute-order trap; counts reconciled at
  27/7/6 = 40 before any merge. Each page's own `<time datetime>` reads
  **2026-08-28T03:00:31Z / 03:00:28Z / 03:00:31Z** — now FOUR days stale on a page that
  advertises an 8-hour cadence (its visible "Updated 4 hours ago" string disagrees with its
  own `<time>`; the `<time>` is the machine-readable one and is what we record). **0 of 40
  values moved.** Nothing merged, stored date correctly does not advance.
- **SimulationCraft — HELD for a seventh night, same single blocker.** `MID2_Raid.txt` 1.29 MB,
  `Last-Modified` 2026-09-01T07:28:41Z, header `12.1.0.69497 Live (hotfix 2026-09-01/69497,
  git build HEAD **adc39a57a2**)` — a NEW build hash (3b891e639e last night), so upstream is
  re-simming daily. Its `DPS Ranking:` block maps by longest-prefix (hyphens allowed) to
  **22 of 27 DPS specs**; absent are Balance, Feral, Augmentation, Devastation and
  Retribution — the same five Bloodmallet is missing. `MID1_Raid.txt` is again 272 BYTES
  (07:07:07Z), an in-progress log with no ranking block, and carries the SAME build header as
  MID2, so MID1 is neither the 12.0.7 artefact the contract label describes nor readable as a
  fallback. Wholesale adoption would drop 26 → 22 stored rows = 15.4%, inside `maxRowDropPct`
  0.25 — but all 22 overlap rows move more than 60% (MID2/MID1 ratio min 1.692, median 1.997,
  max 2.351), so `maxValueMovePct` fires and only a human `value_move_ack` can land it.
  Nothing merged; the stored 26 rows keep their 2026-08-08 date byte-identical.
- **Bloodmallet — HELD WHOLESALE for a seventh night, unchanged from last night.** All 27 DPS
  charts requested at `talent_target_scaling/castingpatchwerk` with 3 retries each: **22**
  return real payloads, every one carrying `simc_settings.tier = MID2` (read off each chart,
  never hard-coded) at chart timestamp **2026-08-29**; the same **5** return the 76-byte
  `{"status": "error"}` body on every retry (Balance, Feral, Augmentation, Devastation,
  Retribution). Against the 26 stored MID1 profiles (2026-07-08 / 07-15), **114 of the 132
  overlapping target rows move more than 60%** (ratio min 1.152, median 1.870, max 2.833), so
  the value gate blocks adoption and the tier-uniformity invariant separately forbids a pool
  holding both MID1 and MID2. Nothing merged; `fightProfile.asOf` stays each chart's OWN
  timestamp so the coverage date does not move.
- **Archon numerics — all six requirements unreachable, night 10 of the wall.** Same 403
  managed-challenge bodies as the tier lane (see refresh-tiers log). The Mythic and Heroic
  95th-pct DPS/HPS families, M+ score and Popularity all keep their stored rows and dates
  untouched.
- **Warcraft Logs — evidence file only; no warcraftlogs.com request was made from this
  session by any means.** `wcl-fetch/evidence.json` attemptedAt 2026-09-01T15:09:08.918Z,
  verdict **`rdps-broken`**, detail "characterRankings(metric: rdps) on encounter 3176:
  Internal server error". Transport itself healthy (oauth true, graphql true, 3600 points/h,
  1 spent), `landed` and `rawRecipes` both empty, so neither wcl-live row may claim success.
  This is the owner-accepted standing red.
- **Robydoby not refreshed** (deliberate, and it is outside `required-sources.json` by
  design): its sheets are zone-54 **12.1 PTR** raid testing from the CLOSED cycle, so there is
  nothing current to ingest and the stored rows stay as the cycle's final receipts.

## 2026-08-31 (nightly) — Murlok/Mythicstats/WoWMeta all frozen upstream, 0 rows merged; Bloodmallet and SimC coverage BOTH moved 19 → 22

- **Nothing merged this run, and every one of those is an upstream fact rather than a fetch
  failure.** Murlok 3 pages HTTP 200, Mythicstats HTTP 200, WoWMeta both endpoints HTTP 200,
  Bloodmallet 22 of 27 charts HTTP 200, SimC both reports HTTP 200. Archon's six numeric
  requirements are walled with the letters (see refresh-tiers).
- **Murlok: 40/40 rows parsed, 0 values moved, `<time datetime>` still 2026-08-28T03:00Z** on
  all three pages — three days stale against a page that advertises an 8-hour cadence.
  ⚠️ **A parser trap caught here, worth keeping: Murlok's `<a>` attribute ORDER is not stable.**
  Most rows are `<a class="vi-box meta-item …" href=…>` but some are `<a href=… class="vi-box
  meta-item …">`, and a regex anchored on `<a class="vi-box meta-item` silently dropped
  **4 of 40** rows — Arms Warrior, Beast Mastery, Restoration Druid, Protection Paladin — one
  per page plus one. It presented as "those specs left the page", i.e. exactly like real
  upstream movement. Caught only by reconciling 25/6/5 against the 27/7/6 roster shape.
  Split on `<a [^>]*class="vi-box meta-item` instead.
- **Mythicstats: period 1078 has NOT advanced.** `/period/latest` 302s to 1078 as it did last
  night, the subtitle is character-for-character identical ("Top 2000 keys, 10000 characters
  (2833 unique), 17.2 average key level"), and all 39 parsed rows equal the stored values.
  Sum 100.20 with role subtotals 60.10 / 20.10 / 20.00 — the representation column, not the
  `/meta` presence column. Frost Mage is still absent upstream and stays stored at 0.
  Stored asOf correctly stays 2026-08-30.
- **WoWMeta: frozen 20 days and the two independent dates still agree** — `manifest.json`
  snapshotDate 2026-08-11 and the rankings file's `Last-Modified: Tue, 11 Aug 2026 15:25:05
  GMT`. Payload diffed rather than trusted: 44 blocks, the dps/hps/tank + lowerBound +
  no-keyRange selection gives 27/7/6 = 40 rows, **0 of 40 lowerBound values moved**.
- **Bloodmallet coverage 19 → 22 of 27, and the row-drop objection is now GONE while the
  value-move one is not.** 22 charts return `simc_settings.tier = MID2` at chart timestamp
  2026-08-29 (read off the chart, never assumed); Arms and Fury re-simmed since last night.
  Five still return the 76-byte error body across 3 retries each: Balance, Feral,
  Augmentation, Devastation, Retribution. Stored is 26 profiles at MID1, 2026-07-08/07-15.
  Adopting the 22 wholesale would drop 26 → 22 = **15.4%, comfortably inside maxRowDropPct
  0.25** — that was 27% and blocking last night. What still blocks it: **114 of the 132
  overlapping target rows move more than 60%** (MID2/MID1 ratio min 1.152, median 1.870, max
  2.833), which is `maxValueMovePct` and has no agent-writable proposal channel. Held
  wholesale; stored data byte-identical; `fightProfile.asOf` untouched.
- **SimC: MID2 covers the same 22 of 27 DPS specs, and MID1 has stopped being a fallback at
  all.** `MID1_Raid.txt` is **272 bytes** (Last-Modified 2026-08-31T07:05Z) — a fresh
  in-progress run with no `DPS Ranking:` block — and its header now reads the SAME build as
  MID2: `12.1.0.69497 Live (hotfix 2026-08-29/69497, git build HEAD 3b891e639e)`. So MID1 is
  no longer the 12.0.7 artefact the contract row describes; it is a 12.1 run that has not
  produced a ranking yet. MID2_Raid.txt (1.29 MB, 07:27Z) parses 22 specs by longest-prefix
  (absent: Balance, Feral, Augmentation, Devastation, Retribution — the same five as
  Bloodmallet, as the contract predicted). All 22 overlap rows move >60% (ratio 1.692 /
  1.997 / 2.351), so the same `value_move_ack` gate applies. Held.
- **Robydoby deliberately not fetched.** Its two sheets are the CLOSED 12.1 PTR cycle's
  zone-54 percentiles; the stored rows are that cycle's final receipts and re-stamping them
  post-flip would be dishonest. Best-effort and outside the contract by design, so no
  manifest row is owed.
- **WCL: read from the pre-agent evidence file only, no warcraftlogs.com request made.**
  `wcl-fetch/evidence.json` attemptedAt 2026-08-31T17:41:53Z, verdict `rdps-broken`, oauth
  and graphql both true, `landed` empty, `rawRecipes` empty.

## 2026-08-30 (local, scheduled) — nothing merged; the Bloodmallet/SimC MID2 adoption is left for the owner ON PURPOSE

- **Nothing was fetched or merged this run.** The nightly (15:16Z, ~1h before this run) had
  already pulled every reachable metrics source: Mythicstats merged 39 rows, Murlok fetched
  clean and correctly did not advance an unchanged 08-28 cut, WoWMeta stays the owner-accepted
  frozen-upstream red, and the Archon numeric series are behind the same wall as its letters
  (see refresh-tiers/log.md). Re-fetching any of them here would regenerate CI's own data.
- **The MID2 adoption is the one live decision, and a scheduled run is the wrong place to make
  it.** Coverage moved again tonight — Bloodmallet returns real charts for **22 of 27** DPS
  specs against 19 on 08-29 (Havoc, Arms and Fury arrived), and SimC's `MID2_Raid.txt` maps to
  the same **22**. The five still missing are identical on both sources — Balance Druid, Feral
  Druid, Augmentation Evoker, Devastation Evoker, Retribution Paladin — so the two are
  converging together exactly as the contract row predicts.
- **What is no longer blocking, and what still is.** The row-drop floor has stopped being an
  obstacle on both rows: 22 of 26 is a 15% drop, inside `maxRowDropPct` 0.25. What remains is
  `maxValueMovePct` — all 22 overlapping SimC rows move **+69.3% to +135.1%** (Frost DK
  137,886 → 233,408; Fury Warrior 109,256 → 256,864) — plus, on Bloodmallet,
  `SIM_TIER_REQUIRED` and the tier-uniformity invariant, since MID2 measures ~1.79x MID1 with a
  spec- and target-count-dependent ratio that no scale factor reconciles.
- **Why this run declined it rather than exercising the local run's ack privilege.** The
  local-run skill says a human at the keyboard substitutes for the `value_move_ack` — but this
  run is the *unattended scheduled* one, and there is no human at the keyboard. Both contract
  rows say in terms "adopted WHOLESALE via the human value_move_ack". Adopting 22 specs would
  rewrite the ST/cleave/AoE labels and row tags across the whole DPS roster (`fightLabels`
  pools every profile with no provenance key), and dropping the other five would delete their
  stored profiles outright. That is a published-output change on a mass value move, and an
  unattended agent standing in for the human review the gate exists to require is exactly the
  substitution the gate is designed to prevent. Flagged, not taken.
- **Cheapest correct trigger for the next look:** the five missing specs. When Bloodmallet and
  SimC both cover 27 of 27, wholesale adoption becomes a clean single call needing only the
  ack — no partial-merge reasoning at all. Waiting costs stale sims; adopting early costs
  published labels that encode which specs upstream happened to re-sim.
- 0 metric rows, 0 profiles, 0 dates written. `data/run-manifest.json` deliberately untouched
  (partial run — see the local-run skill's manifest rule).

## 2026-08-30 (nightly, CI runner) — Mythicstats moved (28 of 39) and merged; Bloodmallet coverage 19 → 22 but still held

- **WCL (both live rows) — from the pre-agent evidence file only.** `wcl-fetch/evidence.json`,
  attemptedAt 2026-08-30T14:57:50.398Z, verdict **`rdps-broken`**; oauth true, graphql true,
  3600 points/hour with 1 spent; the single sanctioned retry (`characterRankings(metric: rdps)`
  on encounter 3176) returned HTTP 200 carrying "Internal server error" with 0 rankings.
  `landed` and `rawRecipes` both `{}`. Stored medians byte-identical — 47 Mythic-raid rows and
  40 M+ rows at their 2026-08-10 coverage date, now **20 days** old. This agent made no
  warcraftlogs.com request of any kind.
- **Archon (all six numeric series + survivability) — walled, night 6.** Same site-wide 403 as
  the tier pages; `specRankingsSection` sits behind the same challenge as `tierList`. Stored rows
  byte-identical: 95th pct DPS (Mythic) 32, HPS (Mythic) 7, DPS (Heroic) 33, HPS (Heroic) 7, M+
  score 40, Popularity 79 (all six role×bracket groups still summing to 100.0), survivability 40.
  The Heroic cuts are now **6 days** old, past their maxAgeDays of 5 — and Heroic is the basis of
  Archon's raid LETTERS since the 08-25 owner decision, so that red is the one that matters.
- **Mythicstats — MERGED 39 rows, the period matured.** `/period/latest` HTTP 200, 198 KB,
  302 → period **1078**, still week 2 of MID2, but the subtitle moved: 10,000 characters
  (**2,833** unique), **17.2** average key level, against (3,384) / 16.3 on 08-28 — the rolling
  top-2000 pool has turned over into higher keys, which is what a maturing period looks like.
  Parse BOUNDED to "Spec representation in top keys" ending at the "Classes and specs" heading;
  labels normalised across the lowercase-hyphenated form; value taken from the span AFTER the
  bar's `height:` style. Shape checks: 39 rows, 0 unmatched, sum **100.2%**, role subtotals DPS
  60.1 / Tank 20.1 / Healer 19.9, and the page's own headers agree (Ranged 30.3 / Melee 29.8 /
  Tank 20 / Healer 20) — the representation SHARE column, not the `/meta` per-key-presence
  figure. **28 of 39 values moved** (Arcane Mage 13.0 → 12.0, Retribution 3.7 → 3.2, Elemental
  6.6 → 7.2, Brewmaster 1.1 → 1.7); every value is under `minValueMagnitude` 100 so the
  value-move gate does not apply, and the family median moves 1.05 → 1.3. **Augmentation Evoker
  has returned** to the block at 0.0 after being absent on 08-28; **Frost Mage is still absent**,
  so its stored row stays untouched at 0 / asOf 08-27 and the family holds 40 rows. asOf 08-30.
- **Murlok — fetched clean, upstream still has NOT re-cut.** Three meta pages, plain browser-UA
  GET, HTTP 200, 70.9 / 41.9 / 40.6 KB. All three still carry `<time datetime="2026-08-28T03:00:2xZ">`
  — **two** daily 03:00Z cuts have now failed to publish. Payload diffed rather than trusted to
  the timestamp: 27/7/6 = 40 rows, 0 unmatched, ranks contiguous 1..N per page, all 40 values
  identical to stored at integer precision (Arms 3512 / Holy Paladin 3485 / Blood DK 3485).
  Merged nothing; snapshot left at 08-28 to match the cut it describes. Coverage date 2 days old
  against maxAgeDays 5, so not yet a red.
- **WoWMeta — frozen 19 days, and it is upstream.** `manifest.json` snapshotDate 2026-08-11
  (completedAt 22:52:39.026Z) and the rankings file's `Last-Modified: Tue, 11 Aug 2026 15:25:05
  GMT` agree. Payload diffed anyway per the 08-04 pinned-manifest lesson: 44 blocks, whitelist
  `categoryType ∈ {dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange` undefined → 3
  blocks = 27+7+6 = 40 rows, all 40 `lowerBound` and `numberOfCharacters` identical to stored at
  1 dp. Owner-accepted standing red. The wowmeta.com HTML was NOT fetched.
- **Bloodmallet — coverage improved, still HELD WHOLESALE (night 5).** All 27 DPS specs
  requested at `talent_target_scaling/castingpatchwerk` with up to 3 retries: **22 real charts
  against 19 last night**, and only **5** still return the 76-byte error body — Balance, Feral,
  Augmentation, Devastation, Retribution. Havoc, Arms and Fury arrived. Every one of the 22 reads
  `simc_settings.tier = MID2` (`ptr` is the string `"0"`) with chart timestamps **2026-08-29**
  (advanced from 08-26), against 26 stored MID1 profiles at 07-08/07-15. The **row-drop floor no
  longer blocks**: 22 of 26 is 15%, inside `maxRowDropPct` 0.25. What still blocks is the tier
  pair — `SIM_TIER_REQUIRED` + uniformity forbid a mixed pool, and `fightLabels` percentiles over
  a provenance-free pool would publish *which specs were re-simmed* as spec strength. Merged
  nothing; coverage date correctly stays 2026-07-08.
- **SimulationCraft — held (night 5), blocker unchanged, but MID1 has moved to 12.1.**
  `MID2_Raid.txt` 1.29 MB, Last-Modified 2026-08-30T07:27:34Z, header `12.1.0.69497 Live (hotfix
  2026-08-29/69497, git build HEAD 5f3ee6dba2)` — new build against last night's `f367d1aff1` —
  with 41 profiles in its `DPS Ranking:` block mapping by LONGEST-PREFIX (hyphen allowed) to the
  same **22 of 27** DPS specs; the 7 unmapped are tanks. Notably `MID1_Raid.txt` now reads the
  SAME 12.1.0.69497 header, i.e. the 12.0.7 artefact this row was anchored on is being re-run —
  but it is 272 bytes, an in-progress log with no ranking block, and `MID1_Raid.html` is still
  Last-Modified 2026-08-08. Adoption blocked by `maxValueMovePct`: all 22 overlaps move **+69.3%
  to +135.1%** (Frost DK 137,886 → 233,408; Fury 109,256 → 256,864), which takes a human
  `value_move_ack`. Merged nothing.
- **Robydoby** not refreshed: its sheets are the CLOSED 12.1 PTR cycle (zone 54), it is
  deliberately outside the refresh contract, and it carries no manifest row.
- Bloodmallet's missing 5 are **exactly** SimC MID2's missing 5, so the two are converging
  together as the contract rows predict.

## 2026-08-29 (nightly, CI runner) — every numeric source fetched cleanly and NONE had moved; SimC's blocker changed shape

- **WCL (both live rows) — from the pre-agent evidence file only.** `wcl-fetch/evidence.json`,
  attemptedAt 2026-08-29T15:17:18.717Z, verdict **`rdps-broken`**; oauth true, graphql true,
  3600 points/hour with 1 spent; the single sanctioned retry (`characterRankings(metric: rdps)`
  on encounter 3176) returned HTTP 200 carrying "Internal server error" with 0 rankings.
  `landed` and `rawRecipes` both `{}`, so neither key could honestly claim success. Stored
  medians byte-identical — 47 Mythic-raid rows and 40 M+ rows at their 2026-08-10 coverage
  date, now **19 days** old. This agent made no warcraftlogs.com request of any kind.
- **Archon (all six numeric series) — walled, night 5.** Same site-wide 403 human-verification
  wall as the tier pages; `specRankingsSection` lives behind the same challenge as `tierList`,
  so a walled page yields neither letters nor numbers. Stored rows byte-identical: 95th pct DPS
  (Mythic) 32, HPS (Mythic) 7, DPS (Heroic) 33, HPS (Heroic) 7, M+ score 40, Popularity 79 (all
  six role×bracket groups still summing to 100.0), survivability 40. Six separate manifest rows
  per the split-row rule. **archon-heroic-dps is now 5 days stale and at its `maxAgeDays`** —
  it is the dense early-season series AND the basis of Archon's raid letters, so its red is the
  one that matters most.
- **Murlok — fetched fine, upstream had NOT re-cut.** Three meta pages HTTP 200, 70.9 / 41.9 /
  40.6 KB, all still carrying `<time datetime="2026-08-28T03:00:2xZ">` — the same cut the 08-28
  run merged; the daily 03:00Z cut for the 29th had not published. Payload diffed anyway rather
  than trusted to the timestamp: parse anchored on the BARE `meta-item` class token inside the
  `<a>` (murlok varies attribute order), 27/7/6 = 40 rows, 0 unmatched, ranks contiguous 1..N,
  **all 40 values identical to stored**. Merged nothing and left the `sources.json` snapshot at
  2026-08-28 to match the cut it describes — re-stamping an unchanged reading with the run date
  is exactly the failure that defeats the staleness gate.
- **Mythicstats — period 1078 had neither advanced nor matured.** `/period/latest` → 1078,
  week 2 of MID2, and the subtitle is character-for-character the 08-28 reading: 10,000
  characters (**3,384 unique**), 16.3 average key level. Parse BOUNDED to "Spec representation
  in top keys" and ended at "Classes and specs"; 38 rows, 0 unmatched, sum **100.1%** with role
  subtotals DPS 60.1 / Tank 20.1 / Healer 19.9 — the SHARE column, not `/meta`'s per-key
  presence. All 38 values identical to stored → merged nothing. Augmentation Evoker and Frost
  Mage are still absent from the block (Fire Mage still renders at 0.0, so the page does still
  render zeros); their stored rows stay at value 0 / asOf 2026-08-27.
- **WoWMeta — upstream frozen 18 days, and it is not our transport.** `manifest.json`
  snapshotDate 2026-08-11 (completedAt 22:52:39.026Z) and `rankings/midnight/mplus/all/0.json`
  HTTP 200, 161,191 bytes, `Last-Modified: Tue, 11 Aug 2026 15:25:05 GMT` — the two agree.
  Payload diffed per the 08-04 pinned-manifest lesson: 44 blocks, whitelist
  `categoryType ∈ {dps,hps,tank}` **+** `sortField === "lowerBound"` **+** `keyRange undefined`
  → exactly 3 blocks = 27+7+6 = 40 rows, all `lowerBound` values and `numberOfCharacters` counts
  identical at the series' 1-dp stored precision. Owner-accepted standing red.
- **Bloodmallet — HELD WHOLESALE, night 4, unchanged.** All 27 DPS specs requested with up to 3
  retries: **19 real charts, 8 persistent 76-byte error bodies** (Havoc, Balance, Feral,
  Augmentation, Devastation, Retribution, Arms, Fury — the documented set, unchanged). All 19
  read `simc_settings.tier = MID2` (ptr is the string `"0"`) at chart timestamp 2026-08-26,
  against 26 stored MID1 profiles at 07-08/07-15. Blocked three ways, any one sufficient:
  `SIM_TIER_REQUIRED` + tier-uniformity; `fightLabels` pools with no provenance key so a partial
  merge publishes WHICH specs were re-simmed as spec strength; and 19 of 26 is past
  `maxRowDropPct` 0.25. Coverage date correctly stays 2026-07-08.
- **SimulationCraft — HELD, night 4, but THE BLOCKER CHANGED and the owner should know.**
  `MID2_Raid.txt` 1.29 MB, Last-Modified 2026-08-29T07:39:40Z, header
  `12.1.0.69497 Live (hotfix 2026-08-29/69497, git build HEAD f367d1aff1)` — a new build against
  last night's `6266922349` — with **41 profiles** in its `DPS Ranking:` block against 38.
  Mapped by LONGEST-PREFIX (hyphen allowed) those reach **22 of 27** DPS roster specs, up from
  19: **Devourer DH, Havoc DH, Arms and Fury Warrior have arrived**, leaving Balance, Feral,
  Augmentation, Devastation and Retribution absent (the 7 unmapped profiles are tanks). At 22 of
  26 stored rows a wholesale adoption is a **15% drop — now UNDER `maxRowDropPct` 0.25**, so the
  row floor no longer blocks it. What blocks it is **`maxValueMovePct`**: all 22 overlapping rows
  move **+69% to +135%** (Frost DK 137,886 → 233,250; Fury Warrior 109,256 → 256,860), and that
  gate takes only a human `value_move_ack` or a reviewed local run — there is no agent-writable
  proposal channel. Partial merging is separately forbidden: `SimC nightly Patchwerk DPS` is
  season-agnostic and its ranks pool across the family, so 4 MID1 rows standing beside 22 MID2
  ones is the mislabel honest typing forbids. `MID1_Raid.txt` is again a 272-byte in-progress log
  carrying the same 12.1.0.69497 header, so `MID1_Raid.html` — the 12.0.7.68974 artefact of
  2026-08-08 — remains the source of the stored 26 and is now three weeks old **on an old patch**.
- **Robydoby deliberately not refreshed.** Its two sheets are the *12.1 PTR* zone-54 raid-testing
  series of a CLOSED cycle; those stored rows are the cycle's final receipts, and it sits outside
  `required-sources.json` by design. Nothing to do until a 12.2 PTR opens.

## 2026-08-28 (nightly, CI runner) — Murlok +40 off a fresh 03:00Z cut; Mythicstats period 1078 matured and 30 of 38 moved; Bloodmallet and SimC held again

- **Warcraft Logs — evidence file only, no request of any kind made by this agent.**
  `wcl-fetch/evidence.json` attemptedAt 2026-08-28T21:14:24Z, verdict **rdps-broken**.
  Transport healthy on both legs (oauth true, graphql true, 3600 points/hour, 1 spent); the
  single sanctioned retry — `characterRankings(metric: rdps)` on encounter 3176 — returned
  HTTP 200 carrying "Internal server error" with 0 rankings. `landed` and `rawRecipes` are
  both empty objects, so no key could honestly claim success. wcl-live-raid and wcl-live-mplus
  recorded `unreachable`; stored "(Mythic …)" and "(M+, all dungeons …)" medians byte-identical
  at their 2026-08-10 coverage date. Owner-accepted standing red, clears when a zone-53/55
  recipe lands.
- **Murlok — MERGED 40 rows, and it is a genuinely newer cut.** Plain browser-UA GET on the
  three meta pages (r.jina.ai does not work on murlok), HTTP 200, 70.9 / 41.9 / 40.6 KB. All
  three carry `<time datetime="2026-08-28T03:00:2xZ">`, against the 08-27T18:36Z cut the last
  run merged. Parse anchored on the BARE `meta-item` class token inside the `<a>` rather than
  on a fixed attribute order. 27 / 7 / 6 = 40 rows, 0 unmatched, ranks verified contiguous
  1..N per page before merging. All 40 values moved, largest **Destruction +1.19% (3117 →
  3154)**, then Frost DK +0.87% and Frost Mage +0.85%; median about +0.4%, far under
  `maxValueMovePct` 0.6 and consistent with overnight top-50 rating churn. Stored as integers
  to match the series' own precision; no `n` (murlok exposes none). All three pages
  self-identify "Midnight Season 2 … Patch 12.1". asOf = 2026-08-28, the cut's own date.
- **Mythicstats — MERGED 38 rows.** `/period/latest` HTTP 200, 199 KB, resolving to **period
  1078, week 2 of MID2** — the same period as the last run, but MATURED: its subtitle now
  reads 10,000 characters (3,384 unique), 16.3 average key level against (4,397 unique), 15.4
  yesterday, and **30 of 38 values moved**. Parse BOUNDED to the "Spec representation in top
  keys" section, ending at the "Classes and specs" heading. Shape checks before merging: sum
  **100.1%** with role subtotals DPS 60.1 / Tank 20.1 / Healer 19.9, i.e. the representation
  SHARE column rather than the `/meta` per-key-presence figure. Largest relative moves are all
  sub-1-point rows (Outlaw 1.5 → 2.5, Enhancement 1.5 → 0.9, Devastation 0.3 → 0.1) and sit
  under `minValueMagnitude` 100 by design.
  ⚠️ **Two specs LEFT the chart entirely** — Augmentation Evoker and Frost Mage, both of which
  the 08-27 page rendered at an explicit 0.0. They are not in the block at all tonight (Fire
  Mage still is, at 0.0, so the page does still render zeros). Their stored rows were left
  UNTOUCHED at value 0 / asOf 2026-08-27 rather than re-stamped: writing 0 under today's date
  would assert a reading the page did not give, and absence is not measurably the same as a
  rendered zero. The family therefore holds 40 rows of which 2 carry yesterday's date, which is
  visible and honest; the coverage date is the 25th-freshest asOf, so the gate reads today.
- **Bloodmallet — HELD WHOLESALE, third night, unchanged reason.** All 27 DPS specs requested
  at `talent_target_scaling/castingpatchwerk` with up to 3 retries each: **19 real charts, 8
  persistent 76-byte error bodies** (Havoc, Balance, Feral, Augmentation, Devastation,
  Retribution, Arms, Fury — the documented set). Every one of the 19 reads
  `simc_settings.tier = MID2` (`ptr` is the string "0", as documented) at chart timestamp
  **2026-08-26**, against 26 stored profiles all on MID1 at 2026-07-08/07-15. Merging the 19
  is blocked three independent ways: the tier-uniformity invariant forbids a MID1+MID2 pool;
  `fightLabels` pools every DPS profile with no provenance key, so a partial merge publishes
  WHICH specs were re-simmed as spec strength; and 19 of 26 is past `maxRowDropPct` 0.25.
  Merged nothing, stored values/tiers/dates byte-identical, coverage date correctly stays
  2026-07-08. The eventual landing is a wholesale MID2 adoption needing a human
  `value_move_ack`.
- **SimulationCraft — HELD, third night, and the upstream picture moved slightly.**
  `MID2_Raid.txt` is 1.20 MB, Last-Modified 2026-08-28T07:40Z, and DOES carry a complete "DPS
  Ranking:" block of 38 profiles; its header self-identifies **12.1.0.69497 Live (hotfix
  2026-08-27/69497, git build HEAD 6266922349)** — a NEW build against last night's
  32146c2cc6. Coverage is still the blocker: longest-prefix mapping puts those 38 profiles on
  only **19 of 27** DPS roster specs (absent: Devourer DH, Balance, Feral, Augmentation,
  Devastation, Retribution, Arms, Fury — the same eight Bloodmallet is missing, which locates
  the upstream re-sim queue rather than being coincidence), and the 19 sit **+61% to +125%**
  above stored. Adopting 19 of 26 trips both the row-drop floor and `maxValueMovePct`; mixing
  MID1 and MID2 under one season-agnostic series name is the mislabel honest typing forbids.
  Worth recording for the next run: **`MID1_Raid.txt` is now itself a 272-byte in-progress log
  carrying the same 12.1.0.69497 header**, i.e. MID1 is being re-run against 12.1 while
  `MID1_Raid.html` — the actual source of the stored 26 — remains the 08-08 / 12.0.7 artefact.
  The MID1 fallback is therefore even less of a stable anchor than the contract row already
  says. Merged nothing; stored rows byte-identical, coverage date stays 2026-08-08.
- **WoWMeta — frozen upstream for a 17th day, and it is not our transport.** Two plain curls,
  no headers, no proxy: `manifest.json` snapshotDate **2026-08-11** (completedAt
  2026-08-11T22:52:39Z) and `rankings/midnight/mplus/all/0.json` HTTP 200, 161 KB, with
  `Last-Modified: Tue, 11 Aug 2026 15:25:05 GMT` — the two agree. Per the 08-04 pinned-manifest
  lesson the PAYLOAD was diffed rather than trusted: 44 blocks, whitelisting
  `categoryType ∈ {dps,hps,tank}` AND `sortField === "lowerBound"` AND `keyRange === undefined`
  selects exactly 3 blocks = 27+7+6 = **40 rows**, and all 40 `lowerBound` values and
  `numberOfCharacters` counts are identical to stored at the series' 1-dp precision. Nothing to
  merge, asOf correctly stays at the source's own 2026-08-11. Owner-accepted standing red.
- **Archon — all six numeric requirements unreachable, night four of the wall.** The
  `specRankingsSection` JSON lives behind the same challenge as the tierList: every registered
  page, the three `/heroic/` rankings pages and the site root all return HTTP 403 with
  `__NEXT_DATA__` absent. Recorded as six separate rows per the split-row rule so it stays
  visible which series failed. Stored Mythic DPS/HPS (coverage 2026-08-25), Heroic DPS/HPS
  (2026-08-24), M+ score (2026-08-25) and Popularity (79 rows, all role groups summing to
  100.0, 2026-08-25) are byte-identical. The per-boss survivability dead end is unchanged and
  was not re-litigated.
- Robydoby was not fetched this run (best-effort, deliberately outside the contract; the PTR
  sheets belong to the closed 12.1 cycle).

## 2026-08-27 (nightly, second run of the day) — Murlok recut at 18:36Z and merged; Bloodmallet has crossed to **MID2** but only for 19 of 27 specs, so it is held under the tier-uniformity rule

**Merged: 40 metric rows (murlok 40). Held back, each for a measured reason: bloodmallet,
simulationcraft, wowmeta, mythicstats. Unreachable: all six Archon numeric series + both WCL rows.**

- **MURLOK — merged, 40/40, all 40 values moved.** Plain GET on the three meta pages (r.jina.ai
  does not work on murlok), HTTP 200, 71.3 / 42.3 / 40.9 KB. All three carry
  `<time datetime="2026-08-27T18:36:2xZ">` — a genuinely NEWER cut than the one the 14:59 run
  merged, which is why this is a merge and not a no-op; the prose beside it reads "Updated 49
  minutes ago" against a real ~2h10m and is ignored, as always. Entries anchored on the BARE
  `meta-item` class token in the `<a>` tag rather than on `class="vi-box meta-item`, because
  murlok varies its attribute order and the strict form silently drops the href-first rows
  (3 of 40 tonight). 27 / 7 / 6 = 40 rows, 0 unmatched, ranks verified contiguous 1..N per page.
  Movement is uniform and small: 38 of 40 ceilings up, largest Demonology +1.06% (3307 → 3342),
  two down (Augmentation −1.29%, Destruction −0.83%), median ~+0.4% — nowhere near
  `maxValueMovePct` 0.6. Stored as integers, matching the series' own precision; no `n`.
- **MYTHICSTATS — fetched, verified current, nothing to merge.** `/period/latest` still resolves
  to **period 1078, week 2 of MID2**, with the identical subtitle to this morning's merge
  (10,000 characters, 4,397 unique, 15.4 average key level) — upstream has not recut since. Parse
  bounded to the "Spec representation in top keys" section (ending at "Classes and specs"), 40
  rows, 0 unmatched, sum **100.1%** with the page's own group headings Ranged 31.4 / Melee 28.6 /
  Tank 20 / Healer 20, i.e. the representation SHARE column and not the `/meta` per-key-presence
  figure. All 40 values byte-identical to stored, so nothing was merged and the coverage date
  correctly stays 2026-08-27.
- ⚠️ **BLOODMALLET — HELD WHOLESALE, and the reason changed tonight.** All 27 DPS specs requested
  with up to 3 retries each; **19 returned charts and 8 returned the 76-byte
  `{"status": "error"}`** (Havoc, Balance, Feral, Augmentation, Devastation, Retribution, Arms,
  Fury — the documented persistent set minus Devourer and Windwalker, which have now re-simmed).
  Every one of the 19 reads `simc_settings.tier` = **MID2** (`ptr` is the string "0", as
  documented) and timestamps 2026-08-26, against 26 stored profiles all on **MID1** at
  2026-07-08/07-15. So this is no longer "upstream has not re-simmed"; it is a season tier
  crossing that is **8 specs short of complete**, which is exactly the partial-pool case the
  uniformity gate exists for. Merging the 19 would publish *which specs bloodmallet has
  re-simmed* as spec strength, and it would also trip the row-drop floor (19 of 26, past
  `maxRowDropPct` 0.25) and `maxValueMovePct` on all 19 (+61% to +125% — the ~1.79× MID1→MID2
  scale, not spec movement). Merged nothing; stored `fightProfile` data byte-identical.
  **Landing this later will be a WHOLESALE adoption and will need a human `value_move_ack`** —
  worth flagging now so the night it happens is not a surprise.
- **SIMULATIONCRAFT — HELD, second night, same shape.** `MID1_Raid.txt` is now a 272-byte
  in-progress log with no `DPS Ranking:` block, and `MID1_Raid.html` (37 MB) is unchanged
  upstream: `Last-Modified` **2026-08-08**, header `12.0.7.68974 Live (hotfix 2026-08-06/68974)`
  — the exact state the stored 26 rows came from. `MID2_Raid.txt` (1.2 MB, Last-Modified
  2026-08-27T07:27Z) DOES carry a ranking block and its header reads **12.1.0.69497 Live**
  (hotfix 2026-08-26/69497, git build HEAD 32146c2cc6), so the "MID2 self-identifies as PTR"
  objection from 08-21 is resolved. What blocks it now is coverage: 38 profiles map to
  **19 of 27 DPS roster specs** (missing Devourer, Balance, Feral, Augmentation, Devastation,
  Retribution, Arms, Fury — the same eight bloodmallet is missing, which is a real signal about
  where the re-sim queue is rather than a coincidence), and the 19 sit +61% to +125% above their
  MID1 values. Adopting 19 of 26 would trip both the row-drop floor and the value-move gate.
  Held; stored data byte-identical, coverage date stays 2026-08-08. The owner-accepted standing
  red is doing its job.
- **WOWMETA — partial, unchanged upstream, 16 days frozen.** Two plain curls, no headers:
  `manifest.json` `snapshotDate` **2026-08-11** and the rankings file's `Last-Modified`
  **Tue, 11 Aug 2026 15:25:05 GMT** agree, and — per the 08-04 pinned-manifest lesson — the
  payload was diffed rather than trusted to the manifest: 44 blocks, the whitelist
  (`categoryType` ∈ dps/hps/tank **+** `sortField === "lowerBound"` **+** no `keyRange`) selects
  3 blocks = 40 rows, and all 40 `lowerBound` values and `numberOfCharacters` counts are
  identical to stored. Nothing to merge; coverage date correctly stays 2026-08-11. Owner-accepted
  standing red — do not ack it away.
- **ARCHON (all six numeric requirements) — unreachable, third night.** Same site-wide
  human-verification wall written up in tonight's refresh-tiers entry, now serving **HTTP 200 +
  a 2.5 KB interstitial** rather than 403. `archon-metrics`, `archon-hps`, `archon-heroic-dps`,
  `archon-heroic-hps`, `archon-mplus-score` and `archon-popularity` each record `unreachable`
  separately per the split-row rule. Stored data byte-identical; Mythic families stay 2026-08-25,
  Heroic families 2026-08-24, M+ score and Popularity 2026-08-25.
- **WCL — both live rows unreachable, read from the pre-agent evidence file, not from any fetch
  of ours.** `wcl-fetch/evidence.json` (attemptedAt **2026-08-27T20:43:50Z**) reads verdict
  **`rdps-broken`**: OAuth and GraphQL transport healthy (3600 points/hour, 1 spent), and the
  single sanctioned retry — `characterRankings(metric: rdps)` on encounter 3176 — returned HTTP
  200 carrying `Internal server error` with 0 rankings. `landed` and `rawRecipes` are both empty
  objects, so no key could honestly claim success. Stored medians stay at their 2026-08-10
  coverage date. This agent made no warcraftlogs.com request.
- **ROBYDOBY — deliberately not refreshed.** Its two sheets are the CLOSED 12.1 PTR cycle's raid
  testing percentiles; per the between-cycles posture those stored rows are final receipts, not a
  live lane. It is outside `required-sources.json` by design and gets no manifest row.

## 2026-08-27 (nightly) — Murlok +40 and Mythicstats +40 land; SimC's MID2 finally reads **Live** but is 19 of 27 specs and would trip three gates, so it is HELD

**Merged: 80 metric rows (murlok 40, mythicstats 40). Held back, each for a measured reason: bloodmallet, simulationcraft, wowmeta. Unreachable: all six Archon numeric series + both WCL rows.**

- **ARCHON (all six numeric requirements) — unreachable.** Site-wide Cloudflare human-verification
  wall, root included, through two transports; the measurement is written up in tonight's
  refresh-tiers entry rather than repeated here. `archon-metrics`, `archon-hps`,
  `archon-heroic-dps`, `archon-heroic-hps`, `archon-mplus-score` and `archon-popularity` all record
  `unreachable` separately, per the split-row rule — one combined row would hide which series
  failed. Stored data byte-identical; coverage dates correctly do not move (Mythic families
  2026-08-25, Heroic families 2026-08-24).
- **WCL — both live rows unreachable, from the pre-agent evidence file, not from any fetch of
  ours.** `wcl-fetch/evidence.json` (attemptedAt 2026-08-27T14:29:57Z) reads verdict
  **`rdps-broken`**: OAuth and GraphQL transport both healthy (3600 points/hour, 1 spent), and the
  single sanctioned retry — `characterRankings(metric: rdps)` on encounter 3176 — returned HTTP 200
  carrying `Internal server error` with 0 rankings. `landed` and `rawRecipes` are both **empty
  objects**, so no key could honestly claim success. This is the owner-accepted standing red
  recorded on both contract rows; stored medians stay at their 2026-08-10 coverage date. No
  warcraftlogs.com request was made by this agent.
- **MURLOK — merged, 40/40, all 40 values moved.** Plain GET on the three meta pages (r.jina.ai
  does not work on murlok), HTTP 200, 71.3 / 42.3 / 40.9 KB. All three pages read **"Updated ~50
  minutes ago"** and self-identify "Midnight Season 2 … Patch 12.1", so `asOf` = 2026-08-27.
  ⚠ **A parser trap worth recording, because it is the same 34-of-40 shape the 08-26 run hit and it
  is NOT a roster problem: murlok varies its ATTRIBUTE ORDER.** Splitting entries on
  `<a class="vi-box meta-item` yields **25 / 5 / 5 = 35 rows** with 0 unmatched and no error of any
  kind — because two entries per page write `<a href="…" class="vi-box meta-item …">` instead, and
  the five that vanish are simply the ones with `href` first (Windwalker Monk and Frost DK on the
  DPS page). Splitting on the BARE class token `class="vi-box meta-item` gives 27 / 7 / 6 = **40**.
  The count reconciliation is the only thing that catches this: every dropped row is silent, and
  metrics UPSERT, so a short parse would have left five stale ceilings standing under a fresh date.
  Ranks were additionally checked **contiguous 1..N** per page after the fix.
  Movement is uniform and small — all 40 ceilings rose, largest **Demonology 3200 → 3307 (3.3%)**,
  median ~2.4% — consistent with two days of top-50 rating climb, far under `maxValueMovePct` 0.6
  and `maxFamilyMedianMovePct` 0.35.
- **MYTHICSTATS — merged, 40 rows, 36 changed; the 08-26 HOLD is now correctly released.**
  `/period/latest` 302s to **/period/1078**, the same period the 08-26 run declined to merge, but
  it has matured: **10,000 characters (4,397 unique), 15.4 average key level** against yesterday's
  7,671 unique at **10.6** — the unique count falling while key level rises is exactly the
  signature of a week settling, and 15.4 is now comparable to completed period 1077's 15.3. Parse
  BOUNDED to the "Spec representation in top keys" section, ending at "Classes and specs" (the
  unbounded scan picks up the classes block and the per-dungeon sections); labels normalised across
  the lowercase-hyphenated form, value from `<span class="mt-1">` AFTER the bar's `height:` style.
  40 rows, 0 unmatched. **Shape checks before merging: sum 100.1%, role subtotals matching the
  page's own group headings Ranged 31.4 / Melee 28.6 / Tank 20 / Healer 20** — i.e. the
  representation SHARE column, not the `/meta` per-key-presence figure.
  **On the value-move gate: it does not apply here, and last night's entry said otherwise.** The
  08-26 detail gave "33 of 40 move far past `maxValueMovePct` 0.6" as its reason for holding.
  `checkValueMove` skips any row whose previous value is under `minValueMagnitude` (**100**), and
  the code comment names *this very series* as the reason that floor exists — every representation
  value is a single-digit or low-double-digit percentage, so none of them can trip it. Tonight 7
  rows would nominally exceed 60% relative movement (Demonology 1.1 → 3.2, BM Hunter 0.6 → 1.5,
  Frost Mage 0.1 → 0.0) and all 7 are below the floor. The 08-26 hold was still the right CALL —
  a day-one sample is not the quantity this series publishes — it was the stated MECHANISM that was
  wrong, which is recorded here so the next run does not inherit a false constraint.
- **SIMULATIONCRAFT — HELD, and the standing red's clearing condition is now HALF met.** This is
  the most changed source tonight and it needs an owner decision.
  · `MID1_Raid.txt` is now a **272-byte in-progress stub** (header + the Simulating… line, no
    `DPS Ranking:` block), so per the documented fallthrough `MID1_Raid.html` was fetched instead:
    37 MB, SimC **1205-01**, WoW **12.0.7.68974 Live (hotfix 2026-08-06)** — the same old-patch
    report our stored 2026-08-08 rows came from. MID1 is a 12.0.7 artefact now, not a stale 12.1 one.
  · `MID2_Raid.txt` (1.2 MB) **self-identifies `12.1.0.69497 Live (hotfix 2026-08-26/69497, git
    build HEAD 32146c2cc6)`** — Live, not the `12.1.0.69382 PTR` header that justified the
    2026-08-21 standing red — and it is a COMPLETE run (`EndTime = 2026-08-27 07:27:17`, text and
    html reports emitted) with a real `DPS Ranking:` block of **38 profiles**.
  · **But it covers 19 of the 27 DPS specs.** Mapped by longest-prefix with a hyphen allowed,
    best-variant-per-spec: 19 specs present, **8 absent — Devourer DH, Balance, Feral, Augmentation,
    Devastation, Retribution, Arms, Fury** (four classes missing outright; Augmentation is absent by
    design, so 7 of our 26 stored rows would be dropped).
  · **Why merging it in any form is blocked, measured rather than assumed.** MID2 runs ~2× MID1 on
    the overlap (Assassination 107,689 → 242,353; Subtlety 123,493 → 268,289; Havoc 116,571 →
    241,942; overlap median 118,762 → 234,644). So: (a) every one of the 19 rows exceeds
    `maxValueMovePct` 0.6, and these ARE above `minValueMagnitude`, so unlike mythicstats the gate
    genuinely fires; (b) the family median moves ~98% against `maxFamilyMedianMovePct` 0.35;
    (c) adopting wholesale drops 26 → 19 rows, a 27% drop against `maxRowDropPct` 0.25; and
    (d) merging only the 19 leaves seven **12.0.7** values standing under the same season-agnostic
    metric name "SimC nightly Patchwerk DPS", whose ranks are computed across the pooled family —
    the mixed-pool failure the bloodmallet tier rule forbids, here with no gate of its own to catch
    it. The value-move gate has no agent-writable proposal channel by design.
  · **Held: stored data byte-identical, coverage date stays 2026-08-08, row records `partial`.**
    Owner path when ready: a `value_move_ack` re-run (or a reviewed local run, where the commit
    message is the ack) that adopts MID2 **wholesale** — which also needs a decision on the 7
    dropped specs and on whether the metric name should carry the sim tier the way the bloodmallet
    `fightProfile.tier` field now does.
- **BLOODMALLET — HELD, partial upstream roster, same posture as 08-20 but with a WIDER roster than
  before.** 27 DPS charts requested at `talent_target_scaling/castingpatchwerk`, three attempts each:
  **19 return real payloads, 8 return the 76-byte `{"status": "error"}` body on 8/8 attempts** —
  Havoc, Balance, Feral, Augmentation, Devastation, Retribution, Arms, Fury. That persistent set has
  **shrunk from the ten recorded on 2026-08-20**: Devourer DH and Windwalker Monk now return data.
  Every one of the 19 carries `simc_settings.tier` = **MID2** (read off the chart, never hard-coded)
  and `timestamp` **2026-08-26**, against 26 stored **MID1** profiles at 2026-07-08/07-15. `ptr` is
  the string `"0"` and was compared explicitly.
  **Merged nothing, which is the rule and not caution**: `SIM_TIER_REQUIRED` plus the
  tier-uniformity invariant forbid a pool holding both MID1 and MID2, MID2 measured ~1.79× MID1 so
  the two are not comparable on the scale-invariant percentile axis `fightLabels` computes, and
  adopting only the 19 would drop 26 → 19 (27%, past `maxRowDropPct` 0.25) — the same arithmetic as
  SimC above, from the same upstream cause. `fightProfile.asOf` stays each chart's own stored date,
  so the coverage date correctly remains 2026-07-08 and the age red is the honest signal.
  **Note for the owner: bloodmallet and SimC are now blocked on the same eight-ish specs and both
  would clear together.** When the missing classes re-sim, a single reviewed local run can adopt
  both wholesale.
- **WOWMETA — fetched, diffed, nothing to merge; the owner-accepted standing red holds.**
  `manifest.json` `snapshotDate` **2026-08-11** and the rankings file's `Last-Modified`
  **Tue, 11 Aug 2026 15:25:05 GMT** agree, and — per the 08-04 pinned-manifest lesson — the payload
  was diffed rather than trusted to the manifest: 44 blocks, whitelisting
  `categoryType ∈ {dps,hps,tank}` **+** `sortField === "lowerBound"` **+** `keyRange === undefined`
  gives 27+7+6 = **40 rows, 0 unmatched**, and all 40 `lowerBound` values round-match stored at the
  series' stored 1-dp precision. 16 days frozen upstream; coverage date correctly stays 2026-08-11.
- **ROBYDOBY — deliberately not fetched.** Its two sheets are the **12.1 PTR** raid-testing lane and
  the PTR cycle closed at the 2026-08-18 flip; the stored rows are that cycle's final receipts, in
  the same class as the zone-52/54/56 rows ptr-watch is told never to refresh. It sits outside
  `required-sources.json` by design, so there is no manifest row and no red.

## 2026-08-26 (nightly) — Archon behind a human-verification wall (6 numeric rows unreachable); every other source fetched and NOTHING merged, all for measured reasons

**Archon (archon-metrics / -hps / -heroic-dps / -heroic-hps / -mplus-score / -popularity, plus
-survivability and -encounters): unreachable.** Site-wide "Human Verification" interstitial, HTTP 200
at ~1 KB with no `__NEXT_DATA__`; full write-up in the refresh-tiers log for this date. Not worked
around. All stored Archon numbers byte-identical.

**Murlok — partial, and the reason is a trap worth pinning.** Three pages HTTP 200. The page prints
**"Updated 13 seconds ago"** right next to `<time datetime="2026-08-25T02:45:24Z">` — the prose is a
server-rendered relative string and the `datetime` is the data's real date. Reading the prose as
freshness would have produced a `success` row on 19-hour-old data. All 40 values identical to stored,
consistent with the unchanged timestamp; nothing merged, `asOf` stays the source's own 2026-08-25.
⚠️ **The count reconciliation caught a real defect tonight.** A first parse split on the full opening
anchor and returned **24 DPS / 6 healer / 4 tank = 34 rows** — a short roster on a healthy HTTP 200,
which is exactly the silent-failure shape. Splitting on the bare `meta-item` token gives 27+7+6 = 40.
Print the counts and reconcile against 27/7/6 *before* merging, every time.

**Mythicstats — partial, HELD on a period roll.** `/period/latest` now 302s to **/period/1078**
(was 1077), and the page carries the site's own red banner **"This period just started and is still in
progress"**: "Top 2000 keys, 10000 characters (7671 unique), **10.6 average key level**" against 1077's
completed 2895 unique at **15.3**. Parsed cleanly all the same — section-bounded, labels normalised,
value taken from the `<span class="mt-1">` after the bar height — **40 rows, 0 unmatched, sum 100.10%,
role subtotals 60.1 / 20.0 / 20.0**, matching the page's own group headings, so this is the
representation SHARE column and not the `/meta` per-key-presence figure. Fire Mage is present this
period; it was absent from 1077's chart entirely. **33 of 40 values move**, many far past
`maxValueMovePct` 0.6 (Resto Druid 0.1→1.4, BM 0.6→4.8, Blood DK 13→7.4, Arms 12.7→6.1), so merging
would trip the value-move gate — which has no agent-writable proposal channel by design. Held; the
day-one sample is not the quantity this series publishes. Let a later run merge the matured week.

**Bloodmallet — partial, held, but upstream is clearly moving.** 27 charts requested (3 attempts
each), failures re-probed 5 more times each **alongside a control**: 18 returned data, 9 returned the
76-byte `{"status": "error"}` body on 8/8 attempts (Havoc, Balance, Feral, Augmentation, Devastation,
Retribution, **Elemental Shaman**, Arms, Fury) while Subtlety Rogue succeeded **5/5 interleaved**, so
the endpoint is demonstrably healthy. The available set MOVED: Devourer and Windwalker appeared
(17→18), Elemental dropped out, and **every one of the 18 charts is re-timestamped 2026-08-26**
(against 08-19/08-24 last night). All 18 carry `simc_settings.tier` **MID2** (read off the payload;
`simc_settings.ptr` is the STRING "0" and was compared explicitly) against MID1 in all 26 stored
profiles. Merged nothing, for three independent reasons: one tier per pool (MID2 ≈ 1.79× MID1 and
`fightLabels` pools with no provenance key), 18 < the 19-row drop floor, and Augmentation is absent by
design so a "complete" roster is 26. `fightProfile.asOf` stays each spec's own chart date; the age red
is the honest signal.

**SimulationCraft — partial, hold-MID1, with one real change.** `MID1_Raid.txt` is 272 bytes — a run
that has just started, no `DPS Ranking:` block — at **12.1.0.69497 Live (hotfix 2026-08-26/69497, git
build HEAD 0711f60438)**, so MID1 *is* being re-simmed on today's live build. `MID1_Raid.html` is
still the completed 12.0.7.68974 Live report at **git build 678e66d384** — the same hash last night
recorded, which is the honest explanation for an unchanged parse — matching stored `asOf` 2026-08-08.
`MID2_Raid.txt` is now complete on the same 69497 Live build (was 69465) and DOES carry a ranking
block, but resolves by longest-prefix to only **18 of 27** roster DPS specs (missing Havoc, Devourer,
Balance, Feral, Devastation, Retribution, Arms, Fury; Augmentation by design) — a 26→18 drop, 31%,
past the 25% limit, on top of a tier mix. Nothing merged.

**WoWMeta — partial, standing red, genuinely frozen.** `manifest.json` snapshotDate 2026-08-11 AND the
rankings file's `Last-Modified: Tue, 11 Aug 2026 15:25:05 GMT` agree, and the payload was **diffed**
rather than trusted to the manifest (the 08-04 pinned-manifest shape): 44 blocks → whitelisted
dps|hps|tank + `sortField lowerBound` + `keyRange undefined` = 27+7+6 = 40 rows, all 40 `lowerBound`
AND all 40 `numberOfCharacters` byte-identical to stored.

**WCL — unreachable, from the evidence artifact only.** `wcl-fetch/evidence.json` attemptedAt
2026-08-26T11:04:47Z, verdict **rdps-broken** (`characterRankings(metric: rdps)` on encounter 3176 →
"Internal server error"), transport healthy (oauth true, graphql true, 3600/hr, 1 spent),
`landed: {}`. This agent did not contact warcraftlogs.com by any means.

**Robydoby not refreshed** — deliberately outside the contract, and its series is the *closed* 12.1
PTR zone-54 cycle, so there is nothing current for it to carry.

## 2026-08-25 (local, evening) — Archon raid DPS/popularity merged wholesale-minus-Fire-Mage by OWNER DECISION; the "wait for 27/27" plan is superseded

- **The standing hold ended tonight, by Riley's call, on the drop path the nightly's manifest
  note said didn't exist.** Both 08-25 nightlies held the 26-of-27 raid DPS cut because a merge
  would leave Fire Mage's stored S1 row ranked inside an S2 pool ("no way to write 'unrated'
  for a number"). The third option — merge the 26+6 S2 rows and DROP Fire Mage's two stale S1
  rows (DPS family + raid Popularity) — keeps every pool season-uniform, sums popularity
  groups back to 100.0, and reads "—"/pending for Fire Mage, consistent with its null Archon
  letter. Chosen over waiting because Fire Mage is absent for being UNPLAYED at Mythic (also
  absent from Archon's throughput/popularity tier lists), so "all 27" had no near exit. It
  re-enters by ordinary upsert whenever Archon publishes it.
- Merged from the 2026-08-25T12:00Z dataset (fetched ~16:00 UTC, raw `__NEXT_DATA__`,
  `specRankingsSection.table.data`, resolved by `itemPath` slugs — immune to the
  "BeastMastery Hunter" compound-name trap): 26 DPS "95th pct DPS (Mythic)" rows (the 6 tank
  rows the 2nd nightly had merged were re-upserted, same values), 39 raid Popularity rows,
  7 HPS rows re-upserted, survivability 39/40. **Fire Mage's survivability hold was
  RESPECTED** (the 2nd nightly's call: 100.0 on zero parses is a clustering artifact) — its
  stale row self-labels via its own asOf. **SUPERSEDED an hour later by owner decision**
  (Riley, same evening): publish Archon's letter as Archon's letter — Fire Mage
  survivability S @2026-08-25 merged in a follow-up commit. Do not re-hold it; if the letter
  looks artifactual, that is Archon's methodology to own, and ours to store labeled. Popularity sums 100.0 per role at source;
  throughput letters cross-checked 39/39 against stored ratings. 6 rows under MIN_RANK_N=10
  (Fury 9, Feral 7, Frost Mage 5, Survival 4, Affliction 2, Vengeance 9) — value shown, no
  rank, honest.
- **validate.mjs now GATES the mixing these holds were protecting against** (season-uniform
  rank pools: era-live rows in one (role, bracket, name) pool must sit on one side of
  `PHASES.liveSince`). A future partial merge across a season boundary fails red instead of
  relying on run discipline; wholesale holds still pass. The three archon standing-red labels
  in required-sources.json were rewritten as resolved in the same change (reviewed code
  commit, not the data commit).
- Heartbeat after the merge: archon-metrics / archon-hps / archon-popularity all 0d; the
  remaining `--age` reds are the five pre-existing owner-accepted ones (wowmeta, wcl-live-*,
  bloodmallet, simulationcraft), untouched.
- **Later the same evening: the HEROIC raid families landed** (owner decision, with the
  letter-basis switch logged in refresh-tiers' log): "95th pct DPS (Heroic)" (26 DPS + 6
  tank) and "95th pct HPS (Heroic)" (7), n = parses, asOf 2026-08-24 = the pages' own
  lastUpdated (NOT the fetch date). All 40 rows ≥1,215 parses — zero under LOW_SAMPLE_N,
  zero under MIN_RANK_N. New contract rows `archon-heroic-dps` / `archon-heroic-hps`
  (maxAgeDays 5) landed in the SAME change as the SKILL.md recipe update — emit manifest
  rows for ALL SIX archon numeric requirements from tonight on. Heroic popularity
  deliberately NOT merged (stored "Popularity" stays the Mythic cut).

## 2026-08-25 (nightly, 2nd run of the day) — Archon re-clusters survivability inside four hours; tank DPS cut merged; every other series byte-identical

- **archon survivability — 39 of 40 merged, 26 letters MOVED against the merge made at 11:24Z the
  same day.** The raid pages' `lastUpdated` is 2026-08-25T12:00Z. Two checks before believing it:
  (1) each tier entry carries its own numeric value and **39 of 40 match that page's own
  `specRankingsSection.table` survivability column to the decimal**, with letters monotone in the
  number inside each role page — so tonight's letters are what this document says; (2) they do NOT
  match this build's popularity or throughput lists either (11/39 each), so the earlier letters were
  not a wrong-list read — the clustering itself moved. **Likely driver, and it is worth remembering:
  FIRE MAGE has entered the DPS survivability list at exactly 100.0% while still having no rankings
  row at all** — an extreme new anchor for a Ckmeans clustering. Fire Mage is the one row HELD
  (a letter with no visible parse basis), so its stale 08-17 value stands and self-labels via the
  per-spec `asOf`. Merged distribution S 8 / A 16 / B 12 / C 4.
- **archon-metrics — the six TANK rows of "95th pct DPS (Mythic)" merged** (6/6 complete role pool;
  `metricRanks` pools within (role, bracket, name), so a complete tank cut publishes on its own
  terms — the archon-hps precedent, applied without coupling). Moves 1.1–10.6%. The 26 raid DPS
  rows stay HELD on the same Fire Mage condition as the last three nights.
- **Byte-identical upstream, nothing merged**: archon-hps (7 rows, values AND parse counts equal),
  archon-mplus-score + M+ popularity (pages still 08-24T12:00Z), murlok 40/40, wowmeta 40/40 with
  `snapshotDate` still 2026-08-11 (rankings file DIFFED, not trusted to the manifest stamp),
  mythicstats period **1077** again (39 rows; Fire Mage absent from the chart, stored 0% at 08-22
  left alone).
- **bloodmallet**: 17/27 charts return data, all `simc_settings.tier` **MID2** against MID1 in all
  26 stored profiles; the same 10 specs error as on 08-20. Merged nothing — adopt a tier wholesale
  or not at all, and 17 is under the 19-of-26 floor anyway.
- **simulationcraft — real upstream movement, still not adoptable.** `MID1_Raid.txt` is a 272-byte
  in-progress log whose header now reads **12.1.0.69465 Live** (hotfix 2026-08-25, git build HEAD
  91edd10b21), so MID1 is finally being re-simmed on a live 12.1 build; `MID1_Raid.html` is still
  the completed 2026-08-08 12.0.7 report. **`MID2_Raid.txt` has flipped PTR → Live** on that same
  build (it read 12.1.0.69382 PTR last night) but is still a partial roster: 36 profiles covering
  **18 of 26** DPS specs. Adopting it would mix sim tiers AND drop 26 rows to 18 (31%, past the 25%
  limit). Held.
- **WCL**: no fetch by this agent. `wcl-fetch/evidence.json` (15:51:03Z) verdict `rdps-broken`,
  `landed {}` — transport healthy (oauth/graphql true), the rDPS family still 500s. Both live rows
  recorded unreachable; stored medians untouched at 08-10.
- **robydoby not refreshed** and that is deliberate, not an omission: its sheets are zone-54 **PTR**
  raid testing from the closed cycle and the stored rows are that cycle's final receipts. It is
  outside the refresh contract by design.

## 2026-08-25 (nightly) — Archon S2 survivability returns after 10 empty days; archon-hps un-held; murlok parser rebuilt after a 0-of-40 silent failure

- **murlok 40/40, ALL moved, max 11.4%.** The stored recipe here (split on `<h3>`) returned
  **0 rows on a healthy HTTP 200** — the spec name is not an `<h3>` element, it is a
  `<div class="h3">` inside each `meta-item` anchor, and the RANK number is a sibling div of the
  same class. Split on `meta-item`, take whichever `class="h3"` div matches the roster WHOLE
  (never by position), read the value from the `<li>` after the `</svg>`. Printing the count is
  the only thing that told these two apart from an outage.
  **murlok publishes a machine-readable date and it should be used**: `<time
  datetime="2026-08-25T02:45:22Z">` sits next to the human "Updated 32 minutes ago". asOf is that,
  not the run clock.
- **archon-survivability MERGED, 39 tiers, first S2 set this project has held.** The
  `metric:"survivability"` tierList on the three raid aggregate pages repopulated (26+7+6) after
  ten consecutive empty days. 30 of 39 moved and several move hard (Prot Warrior S→C, Brewmaster
  A→C, Holy Priest S→B, Retribution B→S) — that is a SEASON change, not a wobble. Per-boss pages
  again NOT used (the 2026-08-21 measurement settles that). Fire Mage is absent and keeps its own
  2026-08-17 date; that is honest here because `spec.survivability` carries a per-spec asOf the
  drawer renders with a season chip, so the one stale row is self-labelling. The page's
  `seasonVerified` recorded s1→s2 and its snapshot advanced; it is `ancillary`, so it moves no
  consensus.
- **archon-hps MERGED (7/7), reversing last night's hold on purpose.** Last night held it because
  the same page family's DPS third was stale — but that is coupling, and the split-row rule exists
  to prevent it: this requirement resolves its own coverage date from its own 7 rows, and its rank
  pool contains nothing but S2 values. Moves 14.5–43.8%, all inside `maxValueMovePct`. Parse
  counts FALL (Holy Paladin 390→167) because these are S2 counts replacing S1 ones.
- **archon-metrics still HELD, on one spec now.** The raid DPS table is 26 of 27 (was 24) with a
  real sample (Arcane 316 parses). Only Fire Mage blocks it: there is no way to write "unrated"
  for a NUMBER the way apply-ratings writes an explicit null for a letter, so one S1 value would
  sit at ~rank 5 of 27 and shift everything below it. Merge wholesale the first night Archon
  covers all 27.
- **archon-popularity: merged the two COMPLETE raid role groups.** Raid healer 7/7 and raid tank
  6/6 each sum to exactly 100.0 on their own, so they merge cleanly; raid DPS is held with
  archon-metrics because 26-of-27 would publish a group summing to 101.5. All six source groups
  summed to 100.00 before merging. 1 dp against a 2-dp payload.
- **archon-mplus-score 40/40, max 2.05% up, parse counts rising.**
- **mythicstats HELD at period 1077** — `/period/latest` still 302s to the same period first
  ingested 08-24, 39 rows byte-identical, totals 100.3% (DPS 60.1 / Tank 20.0 / Healer 20.2). The
  asOf was NOT re-stamped: re-dating unchanged data is the exact freshness lie the coverage-date
  gate exists to catch.
- **wowmeta frozen at 2026-08-11**, manifest `snapshotDate` and the rankings file's
  `Last-Modified` agreeing, all 40 `lowerBound` and `numberOfCharacters` unchanged. Diffed the
  payload rather than trusting the manifest, per the 08-04 incident.
- **bloodmallet: 17 MID2 / 10 persistent errors, nothing merged.** Same ten specs as 08-20 and
  08-24 (Havoc, Devourer, Balance, Feral, Augmentation, Devastation, Windwalker, Retribution,
  Arms, Fury) on 3/3 attempts each, controls interleaved fine. Upstream IS working through the
  roster: the three Warlock charts re-simmed 2026-08-24, the other 14 still read 08-19.
- **simulationcraft: hold MID1, and the picture is about to resolve itself.** `MID1_Raid.txt` is
  272 bytes (run just started); the HTML is the same completed report, `git build 678e66d384`
  unmoved. But that in-progress header now reads **12.1.0.69465 Live (hotfix 2026-08-25)** — MID1
  itself is being regenerated at a live 12.1 build, which would resolve this with no tier-mixing
  question at all. `MID2_Raid.txt` now HAS a DPS Ranking block at the same build; 36 profiles /
  18 of 26 DPS specs, missing eight of the same ten bloodmallet cannot re-sim.
- WCL: no fetch by this agent (no credentials, warcraftlogs.com not contacted). Evidence file
  verdict `rdps-broken`, `landed {}`; both rows `unreachable`.

## 2026-08-24 (local) — bloodmallet spot-probe: still MID2-partial, unchanged since the nightly, nothing merged

Read-only verification of the one source whose manifest row carries an explicit handoff. **No
fetch of any other metric source** — CI refreshed icyveins/method/wowhead/archon-tiers/
archon-mplus-score/murlok/mythicstats successfully at 11:37Z and re-pulling them locally would
only risk an unmergeable divergence, which is the standing local-run scope rule.

- **6 of the 27 DPS charts probed** via `talent_target_scaling/castingpatchwerk`, chosen to
  straddle the nightly's split: three it reported as data-bearing (Frost DK, Frost Mage,
  Destruction) and three from its persistent-error set (Havoc, Balance, Windwalker).
- **The split is unchanged, to the spec.** All three controls returned charts reading
  `simc_settings.tier` = **MID2** stamped **2026-08-19 02:5x** — the same tier and the same day
  the nightly recorded, so upstream has NOT re-simmed anything in the ~2.7h since. All three from
  the error set returned the same **76-byte** `{"status": "error"}` body. The ten-spec gap is
  holding, not closing.
- **Nothing was merged, and merging was never the option.** All 26 stored profiles are MID1;
  mixing tiers in one source pool fails `validate.mjs` outright, and `fightLabels` pools every DPS
  profile with no provenance key, so a partial merge would publish *which specs bloodmallet has
  re-simmed* as spec strength. Adopt wholesale or not at all. Stored data byte-identical; the
  47-day staleness red stands as the honest signal.
- The handoff the nightly wrote is unchanged and re-affirmed: the night all 27 charts return MID2
  is a **wholesale adoption that will need a human `value_move_ack`**, because MID2 runs a measured
  mean 1.79x MID1 and most rows move far past `maxValueMovePct`. Not an unattended-run decision.

## 2026-08-24 (nightly) — Murlok and Mythicstats both recut; Archon's raid numerics came back and were HELD

**Merged:** murlok 40 rows, mythicstats 39, archon M+ score 40 + M+ popularity 40.
**Held on purpose:** archon's raid numerics, bloodmallet, simulationcraft.

- **Murlok RECUT** (the last two nights it had not). All three meta pages plain browser-UA GET
  (r.jina.ai still does not work on murlok), 40/40 rows, 0 unmatched, pages self-report
  "Updated 6-7 hours ago". All 40 values moved — 26 of 27 DPS up (Arms 3229 -> 3367, Arcane
  3209 -> 3353), the bottom four down (Frost Mage 2846 -> 2673), max move 6.3%. Stamped
  asOf = the run date, because murlok publishes only a relative "N hours ago"; that is the
  exception to the publish-its-own-date rule, not a lapse from it.
- **Mythicstats**: /period/latest 302s to **/period/1077** ("Period 1077 MID2"), 199,856 bytes.
  39 rows, 33 moved. Identity check before merging: total **100.3%**, role subtotals DPS 60.1 /
  Tank 20.0 / Healer 20.2 — the representation SHARE column, not the /meta per-key-presence
  figure that reads 7-10x higher. Fire Mage is absent from the chart entirely; its stored value
  is already 0 and was left at its own 08-22 date rather than written as a dated zero, because
  an upstream absence is not a measurement.
- **Archon raid numerics came back and were NOT merged.** The rankings table repopulated with
  the tier lists: 24 of 27 DPS, 7/7 healer, 6/6 tank. Two reasons to hold. (a) Fire Mage, Frost
  Mage and Affliction Warlock have no row, so a merge leaves 3 Season-1 values inside a 27-row
  series that `metricRanks` pools within (role, bracket, name) with **no provenance key** — the
  bloodmallet mixing failure with seasons in place of sim tiers. (b) The whole Mythic cut is
  **918 parses**, 1-79 per spec (Assassination 1, Feral 2, Survival 3), against stored n in the
  hundreds, and `page.totalParses` still reads 0. For the record the moves are 0.6%-32%, none
  near maxValueMovePct — this is a coverage decision, not a value-move one. Merge wholesale the
  first night all 27 DPS specs appear.
- **The archon-metrics / archon-hps / archon-popularity labels in required-sources.json are now
  factually stale** — they say the S2 raid pages return "0 rows, totalParses 0". The rows came
  back tonight; only coverage is missing. Owner edit, not an agent one.
- **encounter-tiers.json: measured, then left alone.** All 17 S2 encounters enumerated from
  `encounterOptions` and all **51 pages** (17 x DPS/healer/tank) fetched, 200/200. Every dungeon
  is complete at 40 rows; of the nine raid bosses only **Nek'zali** publishes anything (36 rows)
  and the other eight are empty across all three roles. 356 rows against 619 stored = a **42%
  drop**, past maxRowDropPct 0.25 and below the 440 floor, and it would ship a one-of-nine-boss
  fight view. Stored S1 file byte-identical, season stamp stays s1, Fight selector stays hidden.
  The two "Per-" page snapshots were deliberately NOT advanced — nothing was ingested.
- **Survivability** is still 0 entries on all three raid aggregates, ninth day, even though
  throughput on those same pages repopulated. Nek'zali's per-boss page does carry 26 entries and
  was NOT used: the 2026-08-21 dead-end measurement stands.
- **Bloodmallet: 17 of 27 charts returned data and all 17 read `simc_settings.tier` = MID2
  (2026-08-19), against MID1 in all 26 stored profiles.** The same ten specs error on every
  retry as on 08-20 (Havoc, Devourer, Balance, Feral, Augmentation, Devastation, Windwalker,
  Retribution, Arms, Fury) with controls succeeding interleaved. Nothing merged: a two-tier pool
  fails validation outright, and MID2 runs a measured mean 1.79x MID1, so a partial merge would
  publish "which specs got re-simmed" as spec strength. **Handoff: the night all 27 return MID2
  is a wholesale adoption that WILL need a human `value_move_ack`.**
- **SimulationCraft: half the standing objection has cleared.** MID1_Raid.txt is 272 bytes (a
  run that just started, no ranking block), so the recipe falls to MID1_Raid.html — still the
  completed **12.0.7.68974** report (hotfix 08-06) behind the stored values, unchanged, nothing
  merged. But **MID2_Raid.html now reads "12.1.0.69404 Live (hotfix 2026-08-22/69404, git build
  HEAD c357aef3e7)"** — the PTR objection recorded on 08-21 is gone. What remains is
  completeness: 34 baseline profiles covering **18 DPS specs**, with no Druid and no Evoker
  profiles at all, and no Havoc, Devourer, Windwalker, Retribution, Arms or Fury — eight of the
  same ten bloodmallet cannot sim, which reads like one upstream module rebuild rather than two
  outages. The requirement's label needs rewriting; that is an owner edit.
- **WoWMeta frozen, and honestly so**: manifest snapshotDate 2026-08-11 and the rankings file's
  `Last-Modified: Tue, 11 Aug 2026 15:25:05 GMT` **agree** (the 08-04 incident was them
  disagreeing). Payload diffed anyway: 40/40 rows, all lowerBound values byte-identical.
- **WCL: no fetch by this agent.** wcl-fetch/evidence.json (attemptedAt 11:04:51Z, this run)
  reports verdict **rdps-broken** — OAuth and GraphQL healthy, the rdps retry on encounter 3176
  returns HTTP 200 carrying "Internal server error", `landed` empty. Both live rows unreachable.
- **Robydoby not fetched, deliberately**: it is a 12.1 PTR raid-testing sheet and the PTR cycle
  closed on 08-18, so its stored rows are era-tagged history. It is outside the refresh contract
  by design; there is nothing a between-cycles run can honestly add to it.

## 2026-08-23 (nightly) — Archon M+ merges 80 rows; Murlok and Mythicstats BOTH froze, and Murlok's page hides that in plain sight

**Merged: Archon M+ score 40 + Archon M+ Popularity 40. Merged nothing else. Two sources
that advanced last night are frozen upstream tonight, and one of them (Murlok) reports
"Updated 29 minutes ago" while its own `<time datetime>` says the cut is 29 HOURS old.**

- ⚠️ **MURLOK PUBLISHES A MACHINE-READABLE CUT TIME AND THE PROSE LIES — USE THE
  `datetime` ATTRIBUTE.** The visible string is `<time datetime="2026-08-22T05:48:15Z">Updated
  29 minutes ago</time>`: the relative phrase is baked in at page-generation time and does
  not re-render, so a page generated 2026-08-22 ~06:17 UTC still reads "29 minutes ago" a day
  later. All three meta pages carry it (dps 05:48:15Z, healer 05:48:13Z, tank 05:48:16Z) and
  a cache-busted re-fetch with `Cache-Control: no-cache` and a random query string reproduced
  the identical timestamps and byte sizes, ruling out the Cloudflare HIT. The 08-22 run
  stamped `asOf` = the run date off that prose and happened to be right only because the cut
  and the run fell on the same day; tonight the same reasoning would have written a 29-hour-
  old cut as today's. **40/40 rows parsed cleanly (27/7/6, 0 unmatched) and every single value
  is byte-identical to stored**, which is the corroborating evidence: nothing moved because
  Murlok has not recut, not because our parse drifted. Merged nothing; `asOf` stays
  2026-08-22 and the murlok page snapshots stay at 2026-08-22 rather than being bumped to a
  fetch date on data that did not move. Murlok claims an 8-hour cadence, so it is overdue.
- **Mythicstats: same period, identical numbers.** `/period/latest` 302s to period **1077**
  again — "week 1 of MID2", and the stats line is character-for-character last night's ("Top
  2000 keys, 10000 characters (3582 unique), 14.3 average key level"). Parse BOUNDED to the
  "Spec representation in top keys" section (it ends at `<h2>Classes and specs`), 40 rows, 0
  unmatched, 0 duplicates — the unbounded scan that yields 59 rows was not used. Shape checks
  still pass: sum 100.3%, role subtotals DPS 60.1 / Tank 20.0 / Healer 20.2, i.e. the
  representation-SHARE column and not the `/meta` per-key-presence figure. **0 of 40 values
  moved**; merged nothing, `asOf` stays 2026-08-22.
- **Archon numerics — the M+ half merged, the raid half still cannot.** Read from
  `props.pageProps.page.specRankingsSection.table.data[]`.
  · `M+ score (95th pct)` **40/40 merged** at `asOf` 2026-08-22 (the page's own `lastUpdated`,
    never the run date; it is within the 1-day window the manifest success cross-check
    applies, which is why this row can claim success). All 40 scores rose; largest move 4.8%,
    far under `maxValueMovePct` 0.6. `n` = each row's `parses`.
  · `Popularity` **40 M+ rows merged** at the stored 1-dp precision after the shape check —
    the three role groups sum to 100.10 / 100.10 / 100.00, every value is a plausible
    percentage and none equals that spec's own DPS figure. 63 of the 80 submitted values
    moved. The 40 RAID Popularity rows were NOT touched, so the requirement's coverage date
    (the min-60th-freshest of 80 rows) correctly stays 2026-08-16.
  · `95th pct DPS (Mythic)` and `95th pct HPS (Mythic)`: the Season-2 raid trickle grew again
    — DPS 20 rows (was 19), healer 6, tank 4 — but `page.totalParses` is still **0** on all
    three raid pages and the per-row `parses` run **1–10** (DPS 1–10, healer 2–5, tank 2–6)
    against stored n of 95–627. Merged nothing: the DPS series would shrink 33→20 rows,
    through the 25-row floor and the 0.25 row-drop limit, on single-digit evidence. Both stay
    at 2026-08-16. Owner-accepted standing red; do not ack it away.
- **Archon survivability + encounters, re-probed rather than assumed.** The three raid
  aggregate pages publish `survivability` EMPTY (0 entries) alongside throughput and
  popularity, so `spec.survivability` is untouched for all 40. The full Season-2 encounter set
  was swept: **all 9 bosses publish 0 throughput entries** (only Nek'zali 26 and Nymrissa 27
  publish survivability, and Nymrissa is the world boss — the 2026-08-21 measured dead end),
  while **all 8 M+ dungeons publish a full 27-entry score list** at `lastUpdated`
  2026-08-22T12:00:00Z and 239k–351k parses each. `encounter-tiers.json` still NOT rewritten,
  for the unchanged structural reason: it carries ONE top-level `season` stamp, so an M+-only
  rewrite either mislabels an S2 dungeon half as "s1" or stamps "s2" and un-hides the Fight
  selector over nine Season-1 bosses — and 8 × 27 = 216 rows is far under this requirement's
  440-row floor anyway. It becomes one clean reviewed change the day Archon publishes raid
  throughput.
- **WoWMeta: frozen 12 days, and the two clocks agree.** `manifest.json` snapshotDate
  2026-08-11 (completedAt 22:52:39.026Z) and the rankings file's `Last-Modified: Tue, 11 Aug
  2026 15:25:05 GMT` — so this is NOT the 08-04 pinned-manifest shape. Diffed the payload
  anyway: 44 blocks, whitelisting `categoryType ∈ {dps,hps,tank}` AND `sortField ===
  "lowerBound"` AND `keyRange === undefined` (a whitelist, never a "dungeon" blacklist —
  `melee`/`ranged` are subsets of `dps`) gives 3 blocks and 27+7+6 = 40 rows, roster-matching
  40/40 with no mapping table. All 40 identical to stored at the stored **1-dp** precision.
  Merged nothing.
- **Bloodmallet: the same 17-of-27 split for the fourth night.** All 27 DPS charts requested
  via `talent_target_scaling/castingpatchwerk`, up to 3 attempts each. The same 10 return the
  76-byte `{"status": "error"}` body on every retry — Havoc, Devourer, Balance, Feral,
  Augmentation, Devastation, Windwalker, Retribution, Arms, Fury — while the other 17 succeed
  interleaved in the same minutes, so the endpoint is healthy and those specs are simply not
  re-simmed. All 17 read `simc_settings.tier` = **MID2** (read off each chart, never
  hard-coded), `ptr` the string `"0"`, and their own chart timestamp **2026-08-19**. Stored is
  26 profiles at **MID1** dated 2026-07-08. **Merged nothing** — a 17 MID2 + 9 MID1 pool fails
  the uniformity gate outright, `fightLabels` pools every profile with no provenance key and
  MID2 runs a mean 1.79× MID1, and "adopt what exists" leaves 17 of 26, under the 19-row drop
  floor. `asOf` stays the charts' own dates, so the age red is the honest signal.
- ⚠️ **SimulationCraft: MID2 is no longer PTR — the objection is now COVERAGE ALONE.**
  `MID1_Raid.txt` is a 272-byte in-progress run with no `DPS Ranking:` block, so the recipe
  falls through to `MID1_Raid.html` (37.2 MB), which is still the 08-08 report: SimulationCraft
  **1205-01**, **12.0.7.68974 Live**, Timestamp **2026-08-08 07:28:33** — byte-for-byte the
  provenance of the 26 stored rows, so nothing to re-merge. `MID2_Raid.txt` now carries the
  header **12.1.0.69404 Live (hotfix 2026-08-22/69404, git build HEAD 325b18000c)** — last
  night it read `12.1.0.69382 PTR`, so the PTR half of the standing objection has cleared —
  and a complete 33-profile `DPS Ranking:` block. It is STILL not adoptable: mapped by
  longest-prefix, those 33 profiles cover **17 of the 26 stored DPS specs**, missing Havoc,
  Devourer, Balance, Feral, Devastation, Windwalker, Retribution, Arms and Fury — the same
  nine Bloodmallet cannot sim either, which is a real signal about where the MID2 APLs stand.
  Adopting would drop 26→17 rows, a 34.6% shrink against `maxRowDropPct` 0.25, and mixing two
  sim tiers under one series name is the failure the Bloodmallet gate exists to stop. Held
  MID1; merged nothing. **When a complete Live MID2 lands it will need a human
  `value_move_ack`.**
- **Warcraft Logs: no fetch by this agent, by any transport.** `wcl-fetch/evidence.json`
  (attemptedAt 2026-08-23T10:55:24.887Z, this run) reads verdict **`rdps-broken`** —
  `characterRankings(metric: rdps)` on encounter 3176 returns HTTP 200 carrying "Internal
  server error" with 0 rankings, while `transport.oauth` and `transport.graphql` are both true
  at 1 point spent of 3600/hour. So credentials and transport are healthy and the failure is
  WCL-side, unchanged. `landed` is `{}` and `rawRecipes` is `{}`, so no key has rows and no
  success claim exists for either row. Zone 53 and zone 55 stay without a fetch path; all
  stored medians byte-identical at 2026-08-10.
- **Robydoby not refreshed.** It is deliberately outside the refresh contract, and its series
  are 12.1-**PTR** raid-testing percentiles from a cycle that closed at the 08-18 flip — the
  stored rows are that cycle's final receipts, in the same class as the zone-52/54/56 metrics.
  Nothing to chase between cycles.

## 2026-08-22 (nightly) — Murlok +40, Mythicstats +34, Archon M+ +80; every other series frozen

**Three series genuinely advanced tonight, which is more than any night since the flip.**

- **MURLOK — merged, 40/40 rows, first movement since 08-20.** Plain GET on the three meta pages
  (r.jina.ai does not work on murlok), HTTP 200, real bodies 70.9 / 42.0 / 40.6 KB. 40/40 parsed
  from the `meta-item` blocks (rank `h3`, then the "Spec Class" `h3`, then the number after the
  `</svg>`), 0 unmatched, counts reconciled 27/7/6. All three pages read "Updated 30 minutes ago",
  so `asOf` = 2026-08-22. **All 40 ceilings rose** — Blood DK 2896→3230, Arms 2875→3229, Resto
  Shaman 2898→3223, Fire Mage 2346→2788 — a ~10–19% lift consistent with top-50 ratings climbing
  in week 1 of a season, and the ordering is essentially preserved (Blood/Arms/Resto Shaman still
  top). Largest single move 18.8%, well under `maxValueMovePct` 0.6, and the family median move is
  ~12% against `maxFamilyMedianMovePct` 0.35.
- **MYTHICSTATS — merged, 40 rows, 34 changed.** `/period/latest` 302s to **period 1077**, "week 1
  of MID2" (Lindormi's Guidance, Xal'atath's Bargain: Pulsar, Fortified, Tyrannical, Xal'atath's
  Guile), top 2000 keys / 10,000 characters / 14.3 average key level. Parse BOUNDED to the "Spec
  representation in top keys" section (ending at the next `<h2>/<h3>`): 40 rows, 0 unmatched, 0
  duplicates — the unbounded scan that yields 59 rows was not used. Labels come from each `<li>`'s
  `alt="devourer demon-hunter"` and the value from `<span class="mt-1">`, so the bar's
  `height: NN.NNNN%` style can not be read as the value. **Shape checks before merging: sum
  100.3%, role subtotals DPS 60.1 / Tank 20.0 / Healer 20.2** (ranged 28.3 + melee 31.7), i.e. the
  representation-share series and not the `/meta` per-key-presence column. Biggest moves are small
  in absolute terms (Arms 10.6→11.7, Arcane 9.8→10.6, BM Hunter 1.6→0.9) and all sit under
  `minValueMagnitude` 100, so the value-move gate does not apply.
- **ARCHON M+ — merged, 80 rows (40 score + 40 popularity), all 80 changed.** Same pages as the
  tier lane, read from `props.pageProps.page.specRankingsSection.table.data[]` — never `tierList`,
  which carries no numbers. `lastUpdated` 2026-08-21T12:00:00Z (was 08-20), `totalParses`
  1,626,924 / 542,213 / 542,193. Scores rose across the board (Arms 2892→2962, Arcane 2784→2952,
  Blood 2866→2957) with parse counts up ~50%. Popularity merged at the stored 1-dp precision after
  the shape check: **each role group sums to exactly 100.00%** and no row equals that spec's DPS
  figure. `asOf` = 2026-08-21, Archon's own cut date, which is inside the 1-day window the manifest
  success check applies — so `archon-mplus-score` is the one Archon row that can honestly claim
  success tonight.
- **ARCHON RAID — nothing merged, unchanged from the last three nights.** `specRankingsSection`
  now returns 19 DPS / 6 healer / 4 tank rows (up from 13/4/2) but `totalParses` is still **0** and
  every row carries n = 3–7. Against stored (2026-08-16, n = 95–627) this would move Arms
  208,648→133,283 (n 475→7) and Resto Druid's HPS 225,151→253,236 (n 292→3), and would shrink
  the DPS series from 33 rows to 19 — through the 25-row floor and the 0.25 row-drop limit. The
  three raid `survivability` tierLists are still EMPTY on the aggregate pages, so `spec.survivability`
  was left untouched for all 40 specs.
- **PER-BOSS SURVIVABILITY: still the recorded dead end, re-confirmed, not re-litigated.** Probed
  only to check whether the aggregate had recovered: Nek'zali publishes 26 survivability entries
  and Nymrissa 27 (Nymrissa is a WORLD BOSS), the other seven bosses and all three aggregates
  publish zero. That is the same 2 -of-9 coverage the 08-21 measurement rejected; merged nothing.
- **ARCHON PER-DUNGEON IS NOW FULLY AVAILABLE AT S2, AND THE RAID HALF IS NOT — an owner call.**
  The re-pointed registry URLs work: all 8 Season-2 dungeon pages return a populated `score`
  tierList (27 DPS entries each, `totalParses` 175,908–240,563 at lastUpdated 2026-08-21T12:00Z) —
  Altar of Fangs, Den of Nalorakk, Kings' Rest, Murder Row, Ruby Life Pools, Sethraliss (slug
  `sethraliss`, NOT `temple-of-sethraliss`, which 404s), The Blinding Vale, Voidscar Arena. But all
  9 Season-2 raid bosses publish **0 throughput entries**. `data/encounter-tiers.json` carries ONE
  top-level `season` stamp, so an M+-only rebuild would either mix an S2 dungeon half with an S1
  boss half under `s1` (mislabelled) or stamp `s2` and un-hide the Fight selector over nine
  Season-1 bosses. Left byte-identical (619 rows, `season: "s1"`, selector correctly hidden) and
  reported `partial`. It becomes a clean single change the day Archon publishes raid throughput.
- **WOWMETA — frozen upstream, nothing merged.** `manifest.json` snapshotDate **2026-08-11** and the
  rankings file's `Last-Modified: Tue, 11 Aug 2026 15:25:05 GMT` agree, so this is not the
  pinned-manifest shape. Diffed the payload anyway: 44 blocks → whitelist `categoryType ∈
  {dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined` → 3 blocks, 27+7+6 = 40
  rows, names matching the roster 40/40. All 40 `lowerBound` values identical to stored **at the
  stored 1-dp precision** (the raw floats differ only past the decimal — rounding first is what
  keeps this from reading as "40 of 40 moved"). Owner-accepted standing red.
- **BLOODMALLET — 17 of 27 at MID2, merged NOTHING.** The same 10 specs as the last three nights
  return the 76-byte `{"status": "error"}` body on all 3 attempts each (Havoc, Devourer, Balance,
  Feral, Augmentation, Devastation, Windwalker, Retribution, Arms, Fury) while the other 17 succeed
  interleaved, so the endpoint is healthy and those specs simply are not re-simmed. All 17 read
  `simc_settings.tier = MID2` off the chart (never hard-coded) and their own timestamp 2026-08-19;
  stored is 26 profiles at MID1 dated 2026-07-08 (Elemental 07-15). A 17-MID2 + 9-MID1 pool fails
  the tier-uniformity gate outright, and "adopt what exists" leaves 17 of 26, under the 19-row drop
  floor. Adopt MID2 wholesale or not at all.
- **SIMULATIONCRAFT — unchanged, and MID2 grew but is still not adoptable.** `MID1_Raid.txt` is a
  272-byte live in-progress run (12.1.0.69404 Live, hotfix 2026-08-21/69404, HEAD **22b442e063**)
  with no `DPS Ranking:` block, so the recipe falls through to `MID1_Raid.html` — 37.2 MB and still
  the 2026-08-08 report (SimulationCraft 1205-01, 12.0.7.68974 Live, HEAD 678e66d384, Timestamp
  2026-08-08 07:28:33+0000), byte-for-byte the provenance of the 26 stored rows. `MID2_Raid.txt` is
  now **1,022,648 B** (was 174,708) with a 94-line ranking block, but its header still self-identifies
  **12.1.0.69382 PTR** where MID1's reads Live, and its 42 profiles cover ~18 distinct DPS specs
  against the 26-spec stored roster. Holding MID1; merged nothing.
- **WCL — no fetch by this agent, evidence-only.** `wcl-fetch/evidence.json` attemptedAt
  2026-08-22T10:55:11Z, verdict **rdps-broken**, `landed {}`, `rawRecipes {}`; oauth and graphql
  both true with 1 point of 3600 spent, probe `rdps@3176` HTTP 200 carrying "Internal server error"
  and 0 rankings. Both live rows recorded `unreachable`; all stored WCL rows byte-identical at
  2026-08-10.
- **Robydoby not refreshed, deliberately**: it is the zone-54 12.1 PTR testing sheet from the CLOSED
  cycle and sits outside the refresh contract by design, so re-parsing it now could only re-merge
  PTR-era history. Its stored rows stay as the cycle's final receipts.

## 2026-08-21 (investigation — per-boss survivability: DEAD END, nothing merged)

**Checked on Riley's ask, after the archon-encounters re-point surfaced 26 survivability
entries on Nek'zali while the aggregate publishes zero. Answer: not a usable source. No data
changed.** The durable rule is now in SKILL.md; this is the working.

- **The aggregate is genuinely empty, re-confirmed live**: all three raid pages
  (`dps/healer/tank-rankings/raid/mythic/all-bosses`) return the `survivability` tierList with
  0 entries. That is the standing state since 2026-08-16.
- **Per-boss coverage is 2 of 9.** Swept every boss across all three role pages. Only
  **Nek'zali** and **Nymrissa** publish survivability; Sentinels, Vashnik, Explorers, Sszorak,
  The Twin Fangs, The Coiled Altar and Ula'tek are all zero.
  - Nek'zali: DPS 26/27 · healer 7/7 · tank 5/6 = **38 of 40**
  - Nymrissa: DPS 27/27 · healer 7/7 · tank 6/6 = **40 of 40**
- **The complete set is the disqualified one.** Nymrissa Wavecaller is a **WORLD BOSS**,
  settled by this project 2026-08-18 (`docs/gearing-s2-scope.md`, Phase E: no live boss page,
  Icy Veins files her under world bosses, her loot left the raid catalog 104→101). Archon
  lists her in the Venomous Abyss `encounterOptions` anyway — and WCL's zone 53 counts nine
  encounters including her — so the trap is well disguised: the one page that would fully
  refresh a 40-spec raid row is not raid content.
- **The disagreement was measured, not asserted.** Across the 38 specs present on both bosses,
  **21 tiers disagree (55%)**, and **14 swing ≥2 bands**: Frost DK S→A, Arcane A→S, Havoc A→S,
  Enhancement B→S, Outlaw B→S, **Fury C→S (three bands)**, Resto Druid S→A, Holy Priest S→A,
  Resto Shaman A→S, Mistweaver C→A, Blood DK S→A, **Brewmaster A→C**, Prot Warrior B→S,
  Guardian C→S. Survivability on a single encounter is a hazard-profile reading of that
  encounter, not a property of the spec — which is exactly what the aggregate exists to average
  out.
- **And the sample cannot carry it either.** The numeric lane
  (`specRankingsSection.table.data[].survivability`) is present on Nek'zali for 13 of 27 DPS at
  `parses` **1-2** — the same floor `archon-metrics` declined on this week ("a 95th percentile
  computed from one parse is that one parse"). Nymrissa is the stranger case: a complete 40/40
  LETTER list on a page whose ranking table has **zero rows**, so its letters have no visible
  parse basis at all. That alone would have stopped the merge.
- **Disposition: merge nothing.** The 40 stored tiers stay byte-identical at their 2026-08-17
  `asOf`, the `archon-survivability` page snapshot stays 2026-08-18, and the staleness red
  stays armed — the Bloodmallet/WCL precedent, where the red measures upstream reality rather
  than our effort. It clears when Archon's raid aggregate repopulates, which needs parse counts
  the raid does not yet have.
- Recorded in SKILL.md rather than only here, because the log is prunable and this WILL look
  like a free win to the next run that sees an empty aggregate beside a populated boss page.

## 2026-08-21 (nightly CI, second run of the day)

**Every metric source attempted; NOTHING merged. `data/specs.json` is byte-identical.** That is
the honest outcome tonight, not a skipped lane — five of the six live numeric sources are frozen
upstream at a date we already hold, and the sixth (Bloodmallet) is blocked by the tier gate.

- **Warcraft Logs** — no fetch by this agent, by any transport, API or HTML. Read
  `wcl-fetch/evidence.json` (attemptedAt 2026-08-21T18:11:24.705Z, this run): verdict
  **"rdps-broken"**, `landed` `{}`, `rawRecipes` `{}`, oauth true / graphql true, one probe
  `rdps@3176` HTTP 200 with "Internal server error", 1 point spent of 3600/hr. So the transport is
  healthy and the rDPS metric family is still 500ing upstream — the standing owner-accepted red.
  Both `wcl-live-raid` (zone 53) and `wcl-live-mplus` (zone 55) recorded **unreachable** with that
  verdict; all frozen WCL rows left at 2026-08-10. The three `*-raw` keys left the contract at the
  flip and get no row.
- **Archon numerics** — all four requirements emitted separately, per the split-row rule. Read
  from `props.pageProps.page.specRankingsSection.table.data[]` (never `tierList`, which holds only
  letters). **The M+ half re-parsed 27/7/6 = 40 rows and matched stored EXACTLY, value and `n`
  alike** (Arms 2892 n=156,334; Resto Shaman 2869 n=138,546; Blood DK 2866 n=200,480 …) against
  `lastUpdated` 2026-08-20T12:00:00Z — upstream has not recut, so `archon-mplus-score` and the
  40 M+ `Popularity` rows had nothing to advance.
  **UPDATE TO THE STANDING RED, worth reaching the owner: the S2 raid pages are no longer
  EMPTY.** The contract note (2026-08-21) says `specRankingsSection.table.data` returns 0 rows;
  tonight it returns **13 DPS / 4 healer / 2 tank** rows at `lastUpdated` 2026-08-21T12:00:00Z —
  but `totalParses` still reads **0** and every row carries **n = 1 or 2**. Nothing was merged and
  nothing should be: against stored (2026-08-16, n = 95–627) these would move Windwalker
  171,021 → 114,311, Arms 208,648 → 133,283 and Guardian 108,730 → 63,780, and would shrink the
  DPS cut from 33 rows to 13, straight through the 25-row floor and the 0.25 row-drop limit.
  The stored raid numbers are themselves Season-1 values dated 08-16; they stay put until Archon
  has real S2 raid parses. `archon-metrics`, `archon-hps` and `archon-popularity` all recorded
  partial.
- **Archon survivability** — the `metric: "survivability"` tierList on the three raid aggregate
  pages returned 0 entries again (same rebuild state as throughput/popularity). `spec.survivability`
  untouched; partial.
- **WoWMeta** — both JSON endpoints by plain curl, no headers/proxy/auth; the HTML prerender was
  not touched. `manifest.json` snapshotDate **2026-08-11** (completedAt 2026-08-11T22:52:39Z) and
  the rankings file's `Last-Modified: Tue, 11 Aug 2026 15:25:05 GMT` AGREE, so this is not the
  08-04 pinned-manifest shape. The payload was diffed anyway rather than trusted to the manifest:
  44 blocks → whitelist `categoryType ∈ {dps,hps,tank}` + `sortField === "lowerBound"` +
  `keyRange === undefined` → 27+7+6 = 40 rows, and **all 40 `lowerBound` values are identical to
  stored** at the 1-dp stored precision. Genuinely frozen upstream; partial, date stays 08-11.
- **Murlok** — 3 meta pages by plain GET (r.jina.ai does not work on murlok), HTTP 200,
  70,939 / ~63 / ~62 KB **uncompressed** (curl's `size_download` reported 8.5–9.6 KB because
  `--compressed` measures the compressed body — do not read that as an empty page). 27/7/6 = 40
  rows parsed from the `meta-item` blocks, 0 unmatched. All three pages carry
  `<time datetime="2026-08-20T03:32Z">` and all 40 ceilings match stored exactly. Partial; stored
  asOf stays 2026-08-20.
- **Mythicstats** — `https://mythicstats.com/period/latest` server-rendered, 302 → `/period/1077`,
  HTTP 200, 210,929 B: the SAME period as the last three nights. Parse bounded to the "Spec
  representation in top keys" section (whole-page scanning yields 59 rows from the repeated
  blocks): 40 li blocks → 40 rows, 0 unmatched, labels normalised on `[-\s]+`. Shape-checked
  before comparing — **sum 100.40%**, role subtotals DPS 60.3 / Tank 20.0 / Healer 20.1, i.e. the
  representation SHARE column and not the `/meta` per-key-presence figure. 0 value moves. Recorded
  success: the source is reachable, fully parsed and its stored coverage date is today's — but
  note nothing was merged, because the weekly period has not rolled.
- **SimulationCraft** — the standing recipe ran and the standing red is unchanged, with one
  detail refreshed. `MID1_Raid.txt` is a **221-byte live in-progress log** with no "DPS Ranking:"
  block (header: SimulationCraft 1210-01, 12.1.0.69404 **Live**, hotfix 2026-08-21/69404, git build
  HEAD 69a46e15b4), so the recipe falls through to `MID1_Raid.html` — which is 37.2 MB and still
  the **2026-08-08** report (SimulationCraft 1205-01, 12.0.7.68974 Live, hotfix 2026-08-06/68974,
  git build 678e66d384, Timestamp 2026-08-08 07:28:33+0000). That is byte-for-byte the provenance
  of the 26 stored rows, so there is nothing to re-merge and an unchanged build hash is the honest
  explanation. `MID2_Raid.txt` (174,708 B) again self-identifies **12.1.0.69382 PTR**, hotfix
  2026-08-20, and its "DPS Ranking:" block holds **33 profile lines covering 17 distinct DPS specs
  plus 6 tank profiles** — against a 26-spec stored roster. PTR-labelled and partial: not
  adoptable. Partial, date stays 2026-08-08.
- **Bloodmallet** — all 27 DPS charts requested via `talent_target_scaling/castingpatchwerk`, up
  to 3 attempts each. **17 return real data; the SAME 10 as the last two nights return the 76-byte
  `{"status": "error"}` body on every retry** (Havoc, Devourer, Balance, Feral, Augmentation,
  Devastation, Windwalker, Retribution, Arms, Fury) while the other 17 succeed interleaved in the
  same minutes — the endpoint is demonstrably healthy, those specs simply have not been re-simmed.
  Every one of the 17 reads `simc_settings.tier` = **MID2** (read off the chart, never assumed),
  `ptr` the string `"0"`, own chart timestamp **2026-08-19**, target counts 1,2,3,4,5,6,8,9,15.
  Stored is 26 profiles at **MID1**, 2026-07-08 (Elemental 07-15). **Merged nothing**, and the
  reasoning is the tier gate, not caution: a 17-MID2 + 9-MID1 pool fails `validate.mjs`'s
  uniformity check outright, `fightLabels` pools every profile with no provenance key so the
  MID2/MID1 mean ratio of ~1.79× would hand the "strong" labels to whichever specs happen to have
  been re-simmed, and "adopt what exists, null the rest" leaves 17 of 26 — under the 19-row
  drop floor. **Adopt MID2 wholesale or not at all**; that becomes possible only when all 27 charts
  carry it, and it will need a human `value_move_ack` when it does. Partial, coverage date stays
  2026-07-08 — the red heartbeat IS the signal.
- **Robydoby** — not fetched, and deliberately. Both sheets feed `era: "ptr"` zone-54 series from
  the CLOSED 12.1 PTR cycle; new rows merged under those names now would be stale-cycle data
  dressed as current. Outside `required-sources.json` by design, so no manifest row.

`npm run test:quiet` 373 / 341 pass / 0 fail / 32 skipped; build 1705.0 KB.

## 2026-08-21 (nightly CI)

**Merged: Archon M+ (40 score + 40 popularity) and Mythicstats (40). Held back: the whole
Archon RAID numeric cut, Bloodmallet, SimC, WoWMeta, Murlok, both WCL rows.** Row counts and
guard arithmetic were computed BEFORE every merge, never after.

- **Archon M+ numbers** — from `specRankingsSection.table.data[]`, never `tierList`.
  27 + 7 + 6 = **40/40** rows, 0 unmatched, floats rounded to the stored precision read off
  `specs.json` (score integer, popularity 1 dp). `parses` carried through as `n`
  (950,129 / 316,669 / 316,628). "M+ score (95th pct)" family median 2730 → **2751**, +0.8%
  against `maxFamilyMedianMovePct` 0.35; worst single row nowhere near `maxValueMovePct` 0.6.
  Popularity shape-checked first: values 0.3–43.6, the three role groups summing
  100.0 / 100.0 / 100.0, **0** rows equal to that spec's own 95th-pct DPS (the check that
  catches the DPS-column-under-a-%-unit failure). `asOf` = Archon's own `lastUpdated`
  2026-08-20T12:00:00Z.
- **Archon RAID numbers — NEW STATE, and the judgement call of the run.**
  `specRankingsSection.table.data` is no longer empty on the S2 raid pages: 13 DPS rows (of
  27), 4 healer (of 7), 2 tank (of 6). **Merged nothing.** Every row has `parses` of **1**
  except Destruction Warlock at 2 — a "95th percentile" from one parse is that one parse — and
  13 of 27 is a partial roster under a season-agnostic metric name, so the 13 re-based specs
  would rank below the 14 surviving S1 rows (n = 95–682) purely for having been re-based.
  Same shape as the Bloodmallet sim-tier trap. Held-back deltas run −11% to −39%
  (Windwalker 171,021 → 114,311; Arms 208,648 → 133,283) — all *inside* `maxValueMovePct`,
  so no gate would have stopped this; the judgement is the guard. Merge WHOLESALE the first
  night a full 27-spec raid cut with real parse counts appears, and expect a value-move check
  that night.
- **Mythicstats** — `/period/latest` → **/period/1077**, the same period as the last two
  nights but still live and still moving: "Top 2000 keys, 10000 characters (**4549** unique),
  **13.3** average key level" against last night's 5914 / 12.1. Parse bounded to the "Spec
  representation in top keys" section, terminated at the next `<h2>`; labels normalised on
  `[-\s]+`, whitespace allowed around the bare number. **40 rows, 0 unmatched.** Confirmed it
  is the representation SHARE column and not `/meta`'s per-key PRESENCE column before merging:
  sum **100.4%**, page's own role subtotals Ranged 28.6 / Melee 31.4 / Tank 20.0 / Healer 20.0,
  max row 12.0, no zeros. 37 of 40 moved (Blood DK 10.1 → 12.0, Arms 8.7 → 10.6, Balance
  3.6 → 2.7); every value far below the 100-magnitude floor, so the value-move gate correctly
  does not see them. `asOf` = the run date — this page publishes no date of its own.
- **Murlok** — 3 pages, plain GET, HTTP 200, 40/40 parsed, 0 unmatched. **Nothing merged and
  recorded `partial`, not `success`:** the pages' own `datetime="2026-08-20T03:32:10Z"` is
  identical to the stamp the series already carries and all 40 values are byte-identical
  (median 2744.5, range 2346–2898). Claiming success on an unchanged fetch is precisely the
  wowmeta-freeze failure mode.
- **WoWMeta** — `manifest.json` snapshotDate 2026-08-11 AND the rankings file's
  `Last-Modified: Tue, 11 Aug 2026 15:25:05 GMT` agree, so no movement is hidden behind a
  pinned manifest; the rankings file was cache-busted and diffed anyway. Whitelist
  (`categoryType ∈ {dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined`)
  → 40 of 44 blocks' worth, 40/40 name-matched, **all identical**. Upstream has not run for
  **10 days**; two days past the 8-day threshold, and that red is accurate.
- **Bloodmallet** — 27 charts × 5 attempts. **17 real, the SAME 10 persistently erroring**
  (Havoc, Devourer, Balance, Feral, Augmentation, Devastation, Windwalker, Retribution, Arms,
  Fury) with the 76-byte `{"status": "error"}` body — roster identical to last night, so no
  upstream progress in 24h. All 17 read `simc_settings.tier` **MID2** at chart timestamp
  2026-08-19 against 26 stored MID1 profiles; **merged nothing** per the sim-tier uniformity
  gate. `ptr` compared explicitly against the STRING `"0"`. `fightProfile.asOf` stays at the
  charts' own 07-08 / 07-15 — 44 days — and the heartbeat red is the true signal.
- **SimC** — `MID1_Raid.txt` is a 272-byte in-progress run with no ranking block (header
  1210-01, 12.1.0.69404 Live, git build HEAD **69a46e15b4**, moved from 3e75e1b590), so fell
  back to `MID1_Raid.html`: **unchanged** at 1205-01, 12.0.7.68974 Live, own timestamp
  2026-08-08 07:28:33. Re-parsed anyway — `"data":[…]` array ENCLOSING the first big-value
  `MID1_` hit, longest-prefix name mapping with a hyphen allowed — 49 profiles → **26 DPS
  specs, all byte-identical**; the 9 unmapped are tank profiles, excluded by design.
  MID2_Raid.txt still self-identifies **12.1.0.69382 PTR** and its ranking block is still
  partial (**33** distinct profiles, up one, from only ten classes — no Druid, Evoker or
  Warrior at all). Not adopted; owner decision unchanged.
- **WCL** — no fetch by this agent, no credentials, warcraftlogs.com not contacted by any
  means. `wcl-fetch/evidence.json` (attemptedAt 2026-08-21T11:00:57.617Z) reports verdict
  **rdps-broken**: OAuth and GraphQL healthy (3600/hr, 1 spent), `characterRankings(metric:
  rdps)` on encounter 3176 returns a bare "Internal server error". `landed` empty → both
  wcl-live rows `unreachable`, stored data untouched at 2026-08-10.
- **Robydoby** (best-effort, deliberately outside the contract): tab map re-read, 26 tabs,
  newest Mythic week still **24/7** — unchanged since the PTR cycle closed, as expected.
  Nothing to merge, nothing proposed into `required-sources.json`.

## 2026-08-20 (nightly CI)

**Merged: 160 metric rows across three sources (Archon M+ 80, Murlok 40, Mythicstats 40).
Held back: Bloodmallet and SimulationCraft, both deliberately. WCL: evidence-only, no fetch.**

- **Archon numerics** — read from `props.pageProps.page.specRankingsSection.table.data[]`, NOT
  the `tierList` structure. **M+ refreshed in full**: `M+ score (95th pct)` and `Popularity`,
  27 + 7 + 6 = 40 specs each, 0 unmatched, floats rounded to the STORED precision per series
  (score integer, popularity 1 dp — read off `specs.json` first, not assumed), each row's
  `parses` carried through as `n` (332,239 / 110,677 / 110,727). Shape-checked BEFORE merging:
  every popularity value a plausible percentage, role groups summing 99.9 / 99.9 / 100.1, and
  **no row equal to that spec's own 95th-pct DPS** (0 clashes) — the check that catches the
  DPS-column-under-a-`%`-unit failure. Movement is mild: score family median 2709 → 2730
  (+0.8%), worst single row a popularity move of 30.8% on a value of 1.3, far below the
  100-magnitude floor. asOf = Archon's own `lastUpdated` 2026-08-19, never the run date.
  **The RAID half could not be refreshed at all** — `specRankingsSection` is EMPTY (0 rows,
  `totalParses` 0) on all three Season-2 raid pages, the same rebuild-with-no-data state as the
  raid tier lists rather than a parse failure; the recipe was proven on the same run against the
  M+ pages. So `archon-metrics` (33 rows), `archon-hps` (7) and the 40 RAID popularity rows stay
  byte-identical at 2026-08-16 and nothing was restamped. Reported as four separate manifest
  rows per the split rule — coupling them would hide which series failed.
- **Murlok** — 3 meta pages by plain GET (r.jina.ai does not work on murlok), HTTP 200,
  41–71 KB, 40/40 parsed from the `meta-item` blocks. **MERGED.** All 40 values moved upward,
  family median 2192 → 2744.5 (**+25.2%**, against `maxFamilyMedianMovePct` 0.35) with a worst
  single row of Fire Mage 1539 → 2346 (**52.4%**, against `maxValueMovePct` 0.6) — both checked
  BEFORE merging, both inside the guards, so this lands without an ack. This is week-two of
  Season 2 doing exactly what a top-50 *ceiling* does: no zeros anywhere, range 2346–2898.
  Pages self-identify "Mythic+ in Midnight Season 2" and **publish their own timestamp** in a
  `datetime=` attribute (2026-08-20T03:32Z) — asOf is that, not the run date.
- **Mythicstats** — `https://mythicstats.com/period/latest` server-rendered (r.jina.ai is
  Cloudflare-403 on this host), 302 → **/period/1077**, the SAME period as last night but no
  longer half-filled: the page now reads **"Top 2000 keys, 10000 characters (5914 unique), 12.1
  average key level"** where last night it read "Top 999 keys, 4994 characters". So the series
  finally MEANS what its name says. Parse bounded to the "Spec representation in top keys"
  section (scanning the whole page yields 59 rows from the Classes-and-specs and per-dungeon
  blocks), labels normalised on `[-\s]+`: 40 rows, 0 unmatched. Verified it is the
  representation SHARE and not the `/meta` per-key-PRESENCE column before merging — series sum
  **100.1%**, role subtotals 30.7 / 29.3 / 20.0 / 20.0, max row 10.1, no zeros. 38 of 40 values
  moved (Restoration Shaman 5.6 → 8.2, Discipline Priest 2.5 → 1.0); all far below the
  100-magnitude floor, so the value-move gate correctly does not see them. asOf 2026-08-20:
  the page publishes no date of its own and the period is live.
- **WoWMeta** — both JSON API endpoints by plain curl, no headers/proxy/auth (the wowmeta.com
  HTML is a stale S3 prerender and was not touched). `manifest.json` snapshotDate **2026-08-11**
  and `rankings/…/0.json` carrying `Last-Modified: Tue, 11 Aug 2026 15:25:05 GMT` — the two
  agree, so unlike the 08-04 case there is no movement hidden behind a pinned manifest; the
  rankings file was DIFFED rather than trusted to the manifest date. Selected by WHITELIST
  (`categoryType ∈ {dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined`,
  never a "not dungeon" blacklist — melee/ranged are SUBSETS of dps) = 40 rows, 40/40
  name-matched. **All 40 `lowerBound` values and `numberOfCharacters` counts byte-identical to
  stored.** Nothing merged; asOf stays the SOURCE's 2026-08-11. Upstream has now not run a
  pipeline for **9 days** — one day past the contract's 8 — so the heartbeat reds on this
  tonight, accurately.
- **Bloodmallet** — all 27 DPS charts requested, 5 attempts each. **17 return real data and 10
  still return the 76-byte `{"status": "error"}` body persistently** (Havoc, Devourer, Balance,
  Feral, Augmentation, Devastation, Windwalker, Retribution, Arms, Fury) — retried rather than
  treated as structural, per the Beast Mastery precedent. Identical roster to last night: no
  progress in 24h. Every one of the 17 carries `simc_settings.tier` **"MID2"** (read off each
  chart, never hard-coded) with chart timestamps of 2026-08-19, while the 26 stored profiles are
  MID1-era. **MERGED NOTHING**, per the sim-tier uniformity gate: MID2 runs a mean 1.79× MID1
  and `fightLabels` pools every DPS profile with no provenance key, so a 17-of-27 merge would
  publish WHICH specs have been re-simmed as if it were spec strength. `simc_settings.ptr` was
  compared explicitly against the STRING `"0"`. `fightProfile.asOf` therefore stays at the
  CHARTS' own 2026-07-08 / 07-15 — **43 days stale** — and the heartbeat stays red, which is the
  true signal.
- **SimulationCraft** — **NEW UPSTREAM FACT, and it changes nothing tonight.** `MID2_Raid.txt`
  and `MID2_Raid.html` now EXIST (993 KB / 26.7 MB); both 404'd last night. Not adopted, for two
  independent reasons, each verified rather than assumed: (a) its header self-identifies
  `12.1.0.69382 **PTR**` (MID1's reads `Live`), and (b) its `DPS Ranking:` block is a **PARTIAL**
  run — 32 profiles covering roughly half the DPS roster (no Druid, Evoker, Monk, Warrior,
  Havoc/Devourer, Retribution), the same "which specs got re-simmed" trap the Bloodmallet gate
  exists to stop, and the metric name `SimC nightly Patchwerk DPS` is season-agnostic so a
  partial swap would publish silently. Meanwhile `MID1_Raid.txt` is a 272-byte LIVE IN-PROGRESS
  run with no ranking block (header 1210-01, 12.1.0.69382 Live, git build HEAD **3e75e1b590**,
  moved again from last night's b4248732a8), so the recipe fell back to `MID1_Raid.html` — which
  is **UNCHANGED**: 1205-01, 12.0.7.68974 Live, its own timestamp 2026-08-08 07:28:33. Re-parsed
  anyway by taking the `"data":[…]` array enclosing the FIRST big-value `MID1_` hit (a fixed byte
  window after `"series"` reads the later burst/DTPS charts at 2.2–2.5× inflation) and mapping
  profile names by LONGEST-PREFIX with a hyphen allowed: 49 profiles → 26 DPS specs, **all 26
  byte-identical**; the 9 unmapped names are tank profiles, excluded by design. Nothing merged —
  an unchanged build is the honest explanation for an unchanged parse. **OWNER DECISION: adopting
  MID2 is a source-definition change (the registry page is `MID1_Raid.html`) and should wait for
  a complete, Live-flagged MID2 run.** At 12 days the contract's 10-day gate is firing, correctly.
- **Warcraft Logs** — **no fetch of any kind by this agent**, by any transport, API or HTML; it
  holds no credentials. Read from `wcl-fetch/evidence.json` (attemptedAt 2026-08-20T11:00:22Z,
  this run): verdict **"rdps-broken"** — OAuth and GraphQL healthy (3600 points/hour, 1 spent),
  but `characterRankings(metric: rdps)` on encounter 3176 returns a bare "Internal server error".
  `evidence.landed` is EMPTY, so neither zone 53 (raid) nor zone 55 (M+) could land and both
  stored cuts are unchanged at 2026-08-10. This is the OWNER-ACCEPTED STANDING RED written into
  the requirements' own labels: the 10-day staleness alarm IS the intended signal, and it clears
  when a zone-53/55 recipe lands in `src/fetch-wcl.mjs`, not by acking it away.
- **Robydoby** (best-effort, deliberately OUTSIDE the contract) — tab map fetched: 26 tabs,
  newest Mythic week still **24/7**, unchanged. The sheet stopped with the 12.1 PTR cycle, which
  is the expected between-cycles state for a PTR-testing source. Nothing to re-merge; stored
  rows and snapshot untouched. No manifest row, by design.

## 2026-08-19 (nightly)

Season-2 re-bases arriving everywhere; two landed, two were held back at the value-move guard,
two are frozen upstream.

- **Archon M+ numerics — LANDED.** `M+ score (95th pct)` 40/40 rows from
  `specRankingsSection.table.data[]` on the three S2 M+ pages (never `tierList`, which has no
  numbers), floats rounded to stored integer precision, `parses` carried as `n`. This is the
  season re-base: 3396–4256 → 2663–2726, family median **3748 → 2710 (−27.7%)**, worst row
  −36.6% (Augmentation Evoker 4256 → 2699) — both checked BEFORE merging and both inside
  `maxFamilyMedianMovePct` 0.35 / `maxValueMovePct` 0.6, so it lands with no ack. asOf is
  Archon's own `lastUpdated` 2026-08-18, never the run date. The eight-day freeze is over.
  `Popularity` M+ 40 rows merged too, shape-checked first (role sums 99.8 / 100.1 / 99.9, no
  row equal to that spec's 95th-pct DPS).
- **Archon RAID numerics — cannot refresh.** `95th pct DPS (Mythic)` (33 rows) and
  `95th pct HPS (Mythic)` (7 rows) and the 40 raid `Popularity` rows all stay at 2026-08-16:
  the S2 raid pages return an **empty `specRankingsSection`** (`totalParses: 0`). Proven not a
  parse bug on the same run — the identical code path returned 27/7/6 rows on the M+ pages.
  Reported as three separate partial rows, never coupled.
- **Mythicstats — LANDED, and it rolled into Season 2.** `/period/latest` 302 → **/period/1077,
  "week 1 of MID2"** (period 1076 skipped upstream), ending the five-run freeze at period 1075.
  40/40 rows, sum 100.1%, max 9.0, no zeros — verified as the representation SHARE column, not
  the `/meta` per-key-PRESENCE column. All 40 values moved (Arcane Mage 0.2 → 9.0, Devourer DH
  14.1 → 3.3), all far below the guard's 100-magnitude floor. **Caveat recorded honestly in the
  manifest:** the series is named "Top-2000 keys representation" but this in-progress period
  reads "Top 999 keys, 4994 characters (4227 unique), 8.4 average key level", so tonight's
  share is measured over a smaller, still-growing pool than the name implies.
- **Murlok — HELD BACK, fourth night, but the picture changed.** Pages have now flipped their
  own titles to "Mythic+ in Midnight Season 2" (they read Season 1 last night) with a self
  stamp of 2026-08-19T03:00:43Z, and **the seven literal zeros are GONE** — every spec carries
  a real ceiling, so this is now a coherent S2 cut rather than a half-reset one. Still
  unmergeable: 40/40 values moved, family median **4008 → 2292 (−42.8%)** against the 0.35
  limit. Note which guard blocks it — the worst single row (Augmentation 4260 → 1772, 58.4%)
  squeaks *under* the 60% per-row cap, so it is the FAMILY-median guard, not the row guard.
  Held back wholesale; stored data byte-identical at 2026-08-15. Needs `value_move_ack`.
- **Bloodmallet — 17 of 27 now re-simmed (was 14), still merged NOTHING.** All 17 carry
  `simc_settings.tier` **MID2** with chart timestamps of 2026-08-19; the 26 stored profiles are
  MID1. The tier-uniformity gate is the whole point: a 17-of-27 merge publishes *which specs
  have been re-simmed* as spec strength. `simc_settings.ptr` compared explicitly against the
  STRING "0". The 10 persistent error bodies were retried five times each, not assumed
  structural. asOf stays at the charts' own 07-08/07-15 (42 days) and the heartbeat stays red —
  that red is the signal. When the last 10 land, the wholesale adoption will itself need a
  `value_move_ack` (MID2 ≈ 1.79× MID1).
- **WoWMeta — frozen upstream, 8 days.** manifest `snapshotDate` 2026-08-11 AND the rankings
  file's `Last-Modified` agree (so unlike 08-04 there is no movement hidden behind a pinned
  manifest — the rankings file was diffed, not trusted). 40/40 identical at 1 dp. Sitting
  exactly on the contract's 8-day threshold; red tomorrow if wowmeta does not run for S2.
- **SimulationCraft — unchanged, honestly.** `MID1_Raid.txt` is a 272-byte in-progress run
  (SimC 1210-01, 12.1.0.69382, git HEAD **b4248732a8**, moved from last night's 8a83cb502a) with
  no `DPS Ranking:` block; fell back to `MID1_Raid.html`, which is the same 1205-01 /
  12.0.7.68974 / 678e66d384 report as before. Re-parsed anyway (first big-value `MID1_` hit,
  longest-prefix name mapping): 26/26 byte-identical. No `MID2_Raid` report exists yet (404).
- **Warcraft Logs — no fetch by this agent.** `wcl-fetch/evidence.json` (this run) reports
  `rdps-broken`: OAuth + GraphQL healthy, `characterRankings(metric: rdps)` on encounter 3176
  returns a bare Internal server error. `evidence.landed` empty, so wcl-live-raid (zone 53) and
  wcl-live-mplus (zone 55) are both `unreachable` and their 47 + 40 stored rows are untouched at
  2026-08-10. Owner-accepted standing red per the requirement labels.
- **Robydoby not fetched, deliberately.** It curates zone-54 PTR parses — the CLOSED 12.1 PTR
  cycle — so its stored rows are that cycle's final receipts, like the zone-52/54/56 series.
  It is outside `required-sources.json` by design and needs no manifest row.

## 2026-08-18 (nightly)

**Everything fetched, nothing merged — the Season-1 metric layer is frozen upstream on the day
Season 2 opens.** Nine numeric requirements attempted, plus robydoby off-contract; the only
rows that moved tonight came from the deterministic WCL step, which this agent never touches.

- **archon numbers — all four requirements byte-identical to stored.** 95th pct DPS 33/33
  (27 DPS + 6 tank), HPS 7/7, M+ score 40/40, Popularity 80/80, each with its `parses` as `n`,
  read from `specRankingsSection.table.data[]`. Shape-checked Popularity before comparing:
  0.6–39.6, six role×bracket groups at 100.1 / 100.0 / 99.9 / 99.8 / 100.0 / 100.0 (599.8), no
  row equal to that spec's own DPS. Archon's page label reads `lastUpdated 2026-08-17T12:00Z`
  but the values have not moved — raid since 08-16, M+ since **08-10** — so nothing was merged
  and no date was restamped. Season 1 is dead content (4903 raid parses in the 14-day window).
  **Deliberately NOT merged: the raid-HEALER page's `dps` column** (7 healer rows, Holy Paladin
  10440 etc.) — merging it would grow the 33-row "95th pct DPS (Mythic)" series to 40 and
  quietly change what it measures.
- **murlok held wholesale for the third night, and the reason is now unmistakable.** 40/40
  parsed, but SEVEN specs publish a literal **0** (Devastation, Marksmanship, Arcane, Frost DK,
  Prot Warrior, Prot Paladin, Vengeance) — verified in the raw HTML, ranked 24th/25th with a
  published 0 — and all 40 values moved, median 4008 → 3435. Seven 100% moves against
  `maxValueMovePct` 0.6, which has no agent-writable proposal channel. **OWNER DECISION still
  needed: re-base or pause "Top-50 avg M+ rating (ceiling)" across the S2 boundary.**
- **bloodmallet: 14 of 27 charts return, all `simc_settings.tier` = MID2** (timestamps 08-15
  ×12, **08-18 ×2**), 13 persistently error after 3 automated + 2 manual retries. Merged
  nothing — the sim-tier uniformity gate and the wholesale rule. `fightProfile.asOf` stays at
  the charts' own 07-08/07-15 (41 days) and the heartbeat red is the true signal.
- **simulationcraft: `MID1_Raid.txt` is again a 272-byte in-progress run** — header
  `SimulationCraft 1210-01 … 12.1.0.69382 Live (hotfix 2026-08-18/69382, git build HEAD
  8a83cb502a)`, moved from last night's 5039a0f382. The HTML fallback is UNCHANGED (1205-01,
  12.0.7.68974, build 678e66d384): 49 profiles → 26 DPS specs, all 26 identical. No
  `MID2_Raid.{txt,html}` exists yet — both 404.
- **wowmeta frozen at snapshotDate 2026-08-11** (rankings file `Last-Modified` the same day, so
  manifest and data agree — not the 08-04 shape). 40 rows by whitelist, all identical at 1 dp.
- **mythicstats still period 1075, week 20 of MID1** for the fourth run. 34 rows, sum 100.3%,
  all identical; the 6 absent roster specs are the same 6 stored at 0.
- **robydoby (off-contract, best-effort): re-parsed and unchanged.** Newest Mythic week in the
  tab map is still **24/7** (Sszorak + Twin Fangs); 24 DPS + 7 healer rows via quote-aware CSV
  with `lastIndexOf('Class')` — every value identical to stored at 2026-07-24. The sheet has
  not been touched since the PTR ended.
- **WCL: agent fetched nothing** (no credentials). `wcl-fetch/evidence.json` verdict
  `rdps-broken`; the three raw keys landed — dummy-raw 102 rows (1T 2000 / 2T 688 / 3T 297 /
  5T 2000 players), zone-54 raw 27 rows from 6 of 8 encounters, zone-56 raw 27 rows from all 8
  dungeons — advancing those series 08-17 → 08-18. The five rDPS/normalized cuts stay frozen.

## 2026-08-17 (nightly)

**Archon raid merged, everything else fetched and held.** Archon re-cut its RAID data again
(`lastUpdated` 2026-08-15T12:00:00Z → 2026-08-16T12:00:00Z): 32 of 33 "95th pct DPS (Mythic)"
rows and 7/7 "95th pct HPS (Mythic)" rows moved in value and/or parse count, plus all 40 RAID
"Popularity" rows. Merged at Archon's OWN 2026-08-16, never the run date; floats rounded to the
stored integer precision and each row's `parses` carried through as `n`. Largest single DPS
move +8.6%, well inside `maxValueMovePct` 0.6. Popularity shape-checked BEFORE merging: role ×
bracket subtotals 100.1/100.0/99.9/99.8/100.0/100.0 (599.8), range 0.6–39.6, **0 rows equal to
that spec's own DPS**. Survivability 40/40, 2 moves, merged at 2026-08-16. The M+ side
(`M+ score (95th pct)` 40 rows and the 40 M+ Popularity rows) is **byte-identical and still
frozen at 2026-08-10** — S1 keys dead since 08-11 — so both requirements stay `partial` and go
red on the heartbeat, which is correct. Season 2 keys open 08-18.

**Murlok held back WHOLESALE for the second night, and the case is stronger than last night's.**
The roster is complete again (27 DPS, up from 22) but **eight** specs now read a literal 0
(Devastation, Marksmanship, Arcane, Frost DK, Preservation, Prot Warrior, Prot Paladin, Vengeance
DH) and **25 of 40** rows moved >10%, most down 19–23% (Balance 3971→3048, Holy Pal 3935→3040,
Assassination 3968→3113, Blood DK 3990→3212). Its `<time datetime>` moved to
2026-08-17T02:11:22Z while the title still reads "Midnight Season 1". Eight 100% moves against
`maxValueMovePct` 0.6 — which has NO agent-writable proposal channel — and merging the other 32
alone would publish an S1/S2 mixed pool under one name. **Owner decision still open**: re-base or
pause "Top-50 avg M+ rating (ceiling)" at the boundary. Parser note unchanged: anchor on
`meta-item`, 40/40.

Unchanged upstream, nothing merged: **wowmeta** (snapshotDate 2026-08-11, `Last-Modified`
11 Aug — manifest and rankings AGREE this time, unlike 08-04 — 40/40 identical at the stored 1 dp),
**mythicstats** (period **1075** MID1 for the fourth run running, 34 rows, sum 100.3%, subtotals
60.2/20.1/20.0, all identical; the weekly roll has not happened), **simulationcraft** (the HTML is
still 1205-01 / 12.0.7.68974 at 2026-08-08 07:28 and all 26 stored DPS values are byte-identical;
the `.txt` is again a live in-progress 1210-01 / 12.1.0.69299 run whose git build moved
6641c13132 → **5039a0f382**, so the S2 re-sim is still churning), **robydoby** (best-effort,
outside the contract: both sheets re-parsed at the newest Mythic week **24/7** — 24 DPS + 7 healer
role-filtered specs, every 99th-pct value identical; tank rows in the DPS tabs deliberately not
ingested).

**Bloodmallet unchanged from last night: 14 of 27 charts at tier MID2 (timestamps 2026-08-15), 13
still returning the 76-byte error body after 3 retries each.** Held back wholesale per the
tier-uniformity gate; `fightProfile.asOf` stays at the CHARTS' own 2026-07-08/07-15 (40 days) and
the heartbeat stays red — that red is the signal that upstream has not finished re-simming.

WCL: no fetch by this agent (no credentials). Evidence verdict `rdps-broken` (OAuth + GraphQL
healthy, `characterRankings(metric: rdps)` on 3176 still a bare Internal server error); the three
raw keys landed (z52 102 rows — 1T 2000 / 2T 668 / 3T 297 / 5T 2000; z54 27 rows, 6 of 8
encounters populated, Coiled Altar and Ula'tek zero; z56 27 rows, all eight dungeons at the full
2000-player page), and the five rDPS/normalized cuts stay frozen at 2026-08-10 / 2026-07-28.

## 2026-08-16 (nightly)

**Archon merged, everything else held or unchanged.** Archon has genuinely re-cut its RAID data
since last night (its `lastUpdated` label is pinned at 2026-08-15T12:00:00Z and did NOT move, so
the label is useless as a change detector in both directions): 33/33 "95th pct DPS (Mythic)" rows
and 7/7 "95th pct HPS (Mythic)" rows moved in value and/or parse count, plus all 40 RAID
"Popularity" rows. Merged at Archon's OWN 2026-08-15, never the run date. Biggest single move
Vengeance DH 95,424 → 72,432 DPS (-24%, inside maxValueMovePct 0.6) on 25 → 32 parses.
Popularity shape-checked before merging: role×bracket subtotals 100.0/100.1/100.0/99.8/100.0/100.0
(599.9 total), no row equal to that spec's DPS. The M+ side (`M+ score (95th pct)`, 40 rows, and
the 40 M+ Popularity rows) is **byte-identical and frozen at 2026-08-10** — S1 keys have been dead
content since 08-11 — so those two requirements stay `partial` and go red on the heartbeat, which
is the correct signal.

**Murlok has crossed the season boundary and the merge was HELD BACK WHOLESALE.** The DPS page
now lists 22 of 27 specs (Balance, Feral, Augmentation, Retribution, Elemental absent), five more
read a literal **0** (Devastation, Marksmanship, Arcane, Frost DK, Preservation), and every
surviving value dropped hard (Guardian 4268→4123, Blood DK 3990→3286, Holy Pal 3935→3131). Its own
`<time datetime>` moved 08-12T02:17Z → **2026-08-16T02:11:23Z** while the title and h1 still read
"Midnight Season 1". That is an S2 ratings rebuild, not a cut: the five zeros are 100% value moves
(maxValueMovePct 0.6, no agent-writable ack) and merging the other 30 alone would publish an S1/S2
mixed pool under one series name. **Owner decision needed** on re-basing or pausing "Top-50 avg M+
rating (ceiling)" at the flip. Parser note: keep anchoring on the `meta-item` class and reading the
href out of the tag — 40/40 rows where the href-anchored split found 10.

Unchanged upstream, nothing merged: **wowmeta** (snapshotDate 2026-08-11, Last-Modified 11 Aug,
40/40 lowerBound + numberOfCharacters identical), **mythicstats** (period 1075 MID1 week 20 again,
34 rows, sum 100.3%, subtotals 60.2/20.1/20.0, all identical), **simulationcraft** (html still
1205-01 / 12.0.7.68974, git build 678e66d384, timestamp 2026-08-08 — the `.txt` is a live
in-progress 1210-01 / 12.1.0.69299 run whose git build moved b642585cbf → 6641c13132, so the S2
re-sim is still churning), **robydoby** (best-effort, outside the contract: both sheets re-parsed
at the newest Mythic week 24/7 — 24 DPS + 7 healer specs, every 99th-pct value identical).

**Bloodmallet unchanged from last night: 14 of 27 charts at tier MID2 (timestamps 2026-08-15), 13
still returning the error body after 3 retries.** Held back wholesale per the tier-uniformity gate;
`fightProfile.asOf` stays at the CHART's own 2026-07-08 (39 days) and the heartbeat stays red.

WCL: no fetch by this agent (no credentials). Evidence verdict `rdps-broken`; the three raw keys
landed (z52 102 rows — 1T 2000 / 2T 664 / 3T 297 / 5T 2000; z54 27 rows; z56 27 rows), the five
rDPS/normalized cuts stay frozen at 2026-08-10 / 2026-07-28.

