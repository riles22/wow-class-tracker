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

## 2026-08-15 (nightly, 21:50 UTC — second run of this UTC day)

Every numeric source re-fetched; **not one value moved**, so nothing was merged and most rows
are honestly `partial`. Row counts: archon 33 DPS + 7 HPS + 40 M+ score + 80 popularity (all
byte-identical incl. every parse count), wowmeta 40/40 identical with Last-Modified 11 Aug
15:25 GMT confirming its own manifest snapshotDate 2026-08-11, murlok 40/40 identical,
mythicstats 34 rows summing 100.3% (60.2/20.1/20.0 by role) identical, robydoby 24 DPS + 7
healer identical.

**A parser trap caught tonight, worth keeping: murlok writes the anchor attributes in either
order.** Some rows are `<a href=... class="...meta-item...">` and others `<a class="...
meta-item..." href=...>`, so splitting the document on the href form returned **10 of 40 rows
on three HTTP 200 pages** — the silent-shortfall shape that only a printed row count catches.
Anchor on the `meta-item` class and read the href out of the tag. Also noted: each murlok page's
own `<time datetime>` reads 2026-08-12T02:17Z despite the site's "updated every 8 hours" claim,
and the pages still self-label Season 1 — upstream looks frozen while our fetch is healthy.

**Bloodmallet is the one moving source and it is still held back wholesale.** 14 of 27 DPS
charts return data after 3 retries each; all 14 are `simc_settings.tier` **MID2** with chart
timestamps 2026-08-15, against MID1 in stored data. The 13 absent are Augmentation (by design)
plus Havoc, Devourer, Balance, Feral, Devastation, Windwalker, Retribution, Assassination,
Outlaw, Demonology, Arms, Fury. Merging the 14 would publish *which specs got re-simmed* as
spec strength (`fightLabels` pools with no provenance key; MID2 ≈ 1.79× MID1), so the tier
gate holds and `fightProfile.asOf` stays at the CHART's 2026-07-08 — 38 days, threshold 5,
heartbeat red on purpose. When the roster completes, that adoption will also need a human
`value_move_ack` (64 of 156 sim rows move >60%).

SimC: `MID1_Raid.txt` is again a 272-byte in-progress log, header
`12.1.0.69299 Live (hotfix 2026-08-15/69299, git build HEAD b642585cbf)` — a Season-2 re-sim
running now. `MID1_Raid.html` is unchanged (1205-01, 12.0.7.68974, git build 678e66d384,
timestamp 2026-08-08 07:28:33Z), so an unchanged parse is the honest explanation.

Robydoby (best-effort, outside the contract): tab map re-parsed, newest **Mythic** week is
still 24/7 M (Sszorak + Twin Fangs) — the sheet stopped with the PTR cycle — and re-parsing
both tabs at that week's own date reproduces all 24 in-scope DPS and all 7 healer values, so
no in-place recalculation this time. Tank rows in the per-boss DPS lists were not ingested.

WCL: no credentials in this run; five rDPS-family cuts recorded `unreachable` from
`wcl-fetch/evidence.json` (verdict `rdps-broken`), three raw keys landed by the deterministic
step (dummy 102 rows, ptr-raid 27, ptr-mplus 27) and were neither re-fetched nor edited here.

## 2026-08-15 (nightly)

A quiet numbers night: only Archon's raid cut and murlok produced a fresh observation, and
Archon's did not advance its own date, so most rows are honestly `partial`.

- **archon — raid halves re-cut, M+ halves frozen for the fifth run.** "95th pct DPS (Mythic)"
  33 rows, 29 values moved (largest Outlaw Rogue 169079 → 180395, +6.7%); "95th pct HPS
  (Mythic)" 7/7 moved; Popularity raid 32 of 40 moved. All merged at **Archon's own cut date
  2026-08-14**, never today — so the coverage dates do not advance and these are `partial`, not
  `success`. "M+ score (95th pct)" and the M+ popularity half are byte-identical to stored for
  the fifth consecutive run and were left at **2026-08-10**; that is now 5 days against
  `maxAgeDays: 5`, so the heartbeat alarms tomorrow unless Archon re-cuts its M+ numbers. That
  red is the correct signal.
- **murlok — 40/40, 0 value changes**, second night running: the Season-1 M+ ladder is finished,
  so the top-50 ceilings are frozen until Season 2 opens 08-18. Murlok publishes no self-date
  **and no cut identity**, so the fetch date is the only honest observation date and the live
  re-read is stamped 2026-08-15. Rank column contiguous 1..27 / 1..7 / 1..6 — the parse tell.
- **mythicstats — period 1075 unchanged, all 34 bars byte-identical, NOTHING merged.** Contrast
  with murlok deliberately: this source *does* publish a cut identity, so an unchanged period
  plus unchanged values is the same cut and re-stamping it would be the exact failure the
  bloodmallet/wowmeta `asOf` rule exists to prevent. Rows stay at 2026-08-14.
- **wowmeta — `manifest.snapshotDate` still 2026-08-11 (fourth day)**, all 40 `lowerBound` and
  all 40 `numberOfCharacters` reproduce stored exactly. Nothing merged.
- **bloodmallet — third consecutive night blocked, byte-for-byte the same picture.** The same
  14 specs return MID2 charts (re-simmed 2026-08-12); the same 13 return the 76-byte error body
  on all four retries. Merging 14 MID2 against 12 stored MID1 would mix sim tiers inside the
  within-role percentile labels the build derives, so stored MID1 profiles stay at 2026-07-08
  (38 days). OWNER DECISION still pending: adopt MID2 wholesale once the roster is complete.
- **simulationcraft — same report, seventh run.** Timestamp 2026-08-08 07:28:33+0000, build
  1205-01, WoW **12.0.7**.68974 — still simming the previous patch four days after 12.1 shipped.
  All 26 stored values reproduce exactly. Reconfirmed the parse trap: matching player names
  across *all* `"series"` blocks instead of the first returns ~2.2× the right number (that is
  the burst chart), which is why the first block is pinned.
- **robydoby (best-effort, outside the contract)** — sheet re-read, newest Mythic week is still
  24/7; nothing new to ingest.
- **WCL — no fetch of any kind by this agent.** `wcl-fetch/evidence.json` (2026-08-15T04:54:53Z)
  verdict **"rdps-broken"** — rdps@3176 still "Internal server error" while OAuth/GraphQL are
  healthy (3600 pts/h, 36.74 spent). The three raw keys landed via the deterministic step:
  `wcl-dummy-raw` 103 rows, `wcl-ptr-raid-raw` 27, `wcl-ptr-mplus-raw` 27. Five rDPS cuts frozen.

## 2026-08-15 (nightly CI, headless Opus 5, single-shot; started 10:57Z — SECOND run of this UTC day)

Every metric source attempted fresh. **Nothing was merged, because no upstream had re-cut
since the 05:34Z run** — verified value-by-value rather than assumed, which is the point of
re-fetching: an unchanged number that has been reproduced from the live source is evidence,
an unchanged number that was never fetched is a skip.

- **archon-metrics / archon-hps / archon-mplus-score / archon-popularity — all four re-read,
  all four byte-identical, none merged.** Read from `__NEXT_DATA__`
  `specRankingsSection.table.data[]` (NOT `tierList`, which carries letters only): 33 raid
  `dps` rows + 7 raid `hps` rows + 40 M+ `score` rows + 80 `popularity` rows (fraction ×100,
  1 dp), every `parses` count also identical. Archon's own cut label is still
  2026-08-14T12:00:00Z. So the stored dates stand where the earlier run left them — raid DPS
  and HPS at **2026-08-14**, M+ score and M+ popularity at **2026-08-10** — and all four rows
  are `partial`, never `success`: stamping today would be exactly the re-stamp the
  bloodmallet/wowmeta `asOf` rule forbids. **archon-mplus-score is now 5 days old against
  `maxAgeDays: 5`**, so the heartbeat alarms on it from here; that red is the honest signal
  that Archon has not re-cut its M+ numbers since 08-10, not a defect on our side.
  The raid healer page's `dps` column (healer DPS) is excluded here exactly as the stored
  33-row shape has always excluded it.
- **archon-survivability — 40/40 re-parsed (metric "survivability" specifically), 0 moves.**
  Same 08-14 cut; nothing merged, stored `asOf` stays 2026-08-14.
- **wowmeta — JSON API only, never the stale S3 HTML prerender.** `manifest.json` +
  `rankings/midnight/mplus/all/0.json`, plain curl, 200. Whitelist `categoryType ∈
  {dps,hps,tank}` **+** `sortField == "lowerBound"` **+** `keyRange === undefined` → exactly
  27+7+6 = **40 rows** (the whitelist is what stops `melee`/`ranged`, which are subsets of
  `dps`, from double-counting 27 specs). `manifest.snapshotDate` is **2026-08-11 for the
  fifth day** (pipeline `completedAt` 2026-08-11T22:52:39.026Z, unchanged) and all 40
  `lowerBound` values + all 40 `numberOfCharacters` reproduce stored exactly at 1 dp.
  `asOf` is the source's snapshotDate and never today → nothing merged, stored stays
  **2026-08-11** (4 days, maxAgeDays 8) → `partial`.
- **murlok — 40/40 re-read live, 0 value moves.** Three meta pages by plain GET (200, 8–9 KB
  gzipped / 70 KB inflated); r.jina.ai is not used on murlok. Parsed by splitting on `<a>`
  tags and testing for `meta-item` anywhere in the tag — murlok's attribute order is NOT
  stable, and a naive `<a class="vi-box meta-item…` split silently dropped 4 of 40 rows on
  the first attempt tonight. The tell that it parsed cleanly is the rank column being
  contiguous 1..27 / 1..7 / 1..6, and it is. Every "Top-50 avg M+ rating (ceiling)" is again
  unchanged: the Season-1 M+ ladder is finished, so the top-50 ceilings stay frozen until
  Season 2 opens 08-18. Murlok publishes no self-date and no cut identity ("updated every 8
  hours with live data"), so the fetch date IS the only honest observation date; stored `asOf`
  was already 2026-08-15 from the earlier run and remains correct.
- **mythicstats — still period 1075, 34/34 bars identical.** Fetched directly (200, 185 KB;
  `/period/latest` 302s to `/period/1075`), no proxy needed. Week 20 of MID1, top 2000 keys /
  10 000 characters (2863 unique), 22.6 average key level — all unchanged. This source
  publishes a cut IDENTITY, so an unchanged period + unchanged values IS the same cut:
  nothing merged, nothing re-stamped, rows stay at **2026-08-14**. Six specs remain absent
  from the figure upstream and keep their older dates.
- **simulationcraft — same completed report, verified rather than assumed.** MID1_Raid.html
  re-fetched (200, 37.2 MB); header still `Timestamp: 2026-08-08 07:28:33+0000`,
  SimulationCraft 1205-01. All **26** stored "SimC nightly Patchwerk DPS" values reproduce
  EXACTLY, taking the best variant per spec from the FIRST `"__data":[{"series":[{"data":[`
  block (later blocks are burst/DTPS/priority charts carrying different quantities — matching
  on player name across all blocks reads the wrong chart). The block also contains the six
  tank specs; they are not stored and were not added, matching the long-standing 26-row DPS
  shape. Rows stay at **2026-08-08** (7 days, maxAgeDays 10) → `partial`. The report is still
  simming 12.0.7, four days after 12.1 shipped.
- **bloodmallet — MID1 IS STILL RETIRED AND MID2 IS STILL INCOMPLETE, fourth night; nothing
  ingestible.** All 27 DPS specs requested from `talent_target_scaling/castingpatchwerk`,
  4 attempts each: the SAME 14 returned charts, and **they were re-simmed today —
  `timestamp` 2026-08-15 07:35–07:37, up from 2026-08-12** — while the SAME 13 (Havoc +
  Devourer DH, Balance + Feral Druid, Augmentation + Devastation Evoker, Windwalker Monk,
  Retribution Paladin, Assassination + Outlaw Rogue, Demonology Warlock, Arms + Fury Warrior)
  returned the 76-byte `{"status": "error"}` body on all four tries. Every returned chart is
  `simc_settings.tier == "MID2"`. Merging 14 MID2 charts alongside 12 stored MID1 profiles
  would mix two sim tiers inside the within-role percentile labels the build derives from
  `fightProfile`, so the stored MID1 profiles are untouched at **2026-07-08** (38 days,
  maxAgeDays 5 — the red heartbeat IS the honest signal). **OWNER DECISION STILL PENDING:**
  adopt MID2 wholesale once bloodmallet has re-simmed the full DPS roster. The fresh 08-15
  timestamps say upstream is actively re-simming, so the decision may become actionable soon.
- **robydoby (best-effort, outside the contract)** — `htmlview` re-read (200), tab map parsed
  from the `items.push({name: …gid=N` blocks: 26 tabs, newest **Mythic** week is still
  **24/7** (Sszorak #5, Twin Fangs #6). No new Mythic week → nothing to ingest; the 17/7
  Tidebound Grotto tabs are zone 57 and are skipped by design.
- **WCL — no fetch of any kind by this agent, by any means.** `wcl-fetch/evidence.json`
  (attemptedAt 2026-08-15T10:53:48Z) verdict **"rdps-broken"**: `characterRankings(metric:
  rdps)` on encounter 3176 still returns a bare "Internal server error" while OAuth and
  GraphQL are healthy (3600 points/hour, 1 spent). `evidence.landed` carries the three RAW
  keys only — `wcl-dummy-raw` 103 rows (1T 2000 ranked players / 2T 662 / 3T 297 / 5T 2000),
  `wcl-ptr-raid-raw` 27 rows pooled over the six Venomous Abyss encounters that carry parses
  (Vashnik 678, Soulcoiler 370, Sentinels 363, Sszorak 184, Lost Explorers 150, Twin Fangs
  146; Coiled Altar and Ula'tek both 0 — an unopened testing window, not an error), and
  `wcl-ptr-mplus-raw` 27 rows over all 8 Season-2 PTR dungeons at 2000 each. Those rows were
  merged by the deterministic step itself before this agent started and were neither
  re-fetched nor edited here. The five rDPS/normalized cuts stay frozen: live raid + live M+ +
  PTR M+ + Dummy Dome rDPS at **2026-08-10**, zone-54 normalized at **2026-07-28**.

## 2026-08-14 (nightly, CI runner)

- **archon — a genuine new cut with a collapsed sample.** 33 rows of "95th pct DPS (Mythic)" and
  7 of "95th pct HPS (Mythic)" merged at Archon's own cut date 2026-08-14; every value moved and
  every parse count fell with the end of Season 1 (n now in the hundreds, e.g. Unholy DK 17203 →
  477). Raid "Popularity" merged (39/40 moved); **the M+ half of popularity and all 40 M+ score
  rows are byte-identical with identical parse counts — the M+ cut has NOT re-run since 08-10**,
  so nothing was re-stamped (both rows recorded `partial`). Archon's re-cut detector is the
  parse-count column, never `lastUpdated`, which advanced on pages that did not re-cut.
- **murlok — 40/40, zero value changes.** Ranks contiguous 1..27 / 1..7 / 1..6. The Season-1 M+
  ladder is finished, so the top-50 ceilings are frozen; murlok publishes no self-date, so the
  fresh observation is stamped at the fetch date.
- **wowmeta — no re-run.** manifest.snapshotDate still 2026-08-11 (completedAt 22:52:39Z
  unchanged), all 40 lowerBound + numberOfCharacters reproduce stored exactly. Nothing merged.
- **bloodmallet — MID1 retired, MID2 still incomplete (night 2).** 14 of 27 DPS specs return
  charts, all `simc_settings.tier == "MID2"` re-simmed 2026-08-12 19:37–19:45; the other 13
  return the 76-byte error body on 4 retries each. Merging a partial MID2 set beside 12 stored
  MID1 profiles would mix sim tiers inside the build's within-role percentile labels, so nothing
  was ingested. **Owner decision pending: adopt MID2 wholesale once the roster re-sims.**
- **simulationcraft — no re-sim.** MID1_Raid.html re-fetched (37.2 MB), own Timestamp still
  2026-08-08 07:28:33+0000. All 26 stored values reproduce exactly. **PARSE NOTE:** take the
  best variant per spec from the **FIRST** `"data":[…]` chart block only — the later blocks are
  burst/DTPS/priority charts, and matching player names across all blocks reads ~300k values
  that look like DPS and are not.
- **mythicstats — period still 1075** (10000 chars / 2863 unique, 22.6 avg key). 34 bars, 15
  moved. Spec name comes from the bar `<img title=…>`; the visible label carries only the number.
- **robydoby (best-effort, outside the contract)** — sheet re-read, newest Mythic week is still
  24/7; nothing new to ingest.
- **WCL — no fetch of any kind by this agent.** `wcl-fetch/evidence.json` (2026-08-14T17:58:40Z)
  verdict **"rdps-broken"**. The three raw keys landed via the deterministic step:
  `wcl-dummy-raw` 103 rows, `wcl-ptr-raid-raw` 27, `wcl-ptr-mplus-raw` 27. Five rDPS cuts frozen.

## 2026-08-13 (nightly CI, 11:47Z — Opus 5; single-shot) — Bloodmallet retired the MID1 charts; Archon raid re-cut landed

- **BLOODMALLET HAS RETIRED MID1 — this is the finding of the run.** All 27 DPS specs
  requested, 4 retries each: **14 charts returned and every one is `simc_settings.tier ==
  "MID2"`** (re-simmed 2026-08-12 19:37–19:45 UTC); the other **13 return the 76-byte
  `{"status": "error"}` body on all four tries**, and 12 of those served live MID1 charts
  yesterday (Havoc + Devourer DH, Balance + Feral Druid, Devastation Evoker, Windwalker,
  Retribution, Assassination + Outlaw, Demonology, Arms + Fury; the 13th is Augmentation
  Evoker, the documented genuine absence). Consequence to plan around: the stored MID1 pool can
  no longer be **refreshed or completed**, and a 14-MID2/12-MID1 mix would make every
  ST/cleave/AoE label an artifact of which specs upstream re-simmed (the labels are within-role
  percentiles). Nothing written; 26 profiles stay whole at 2026-07-08 coverage (36 days vs
  maxAgeDays 5 — the red heartbeat is the correct signal). The MID2 re-harvest is an owner
  one-shot for the 12.1-live migration and is now additionally **blocked on Bloodmallet
  publishing the remaining 13 specs**.
- **archon — the raid half re-cut, the M+ half did not.** 95th-pct DPS 33 rows and HPS 7 rows
  all moved (Frost Mage 177412/22611 → 177498/19239; parse counts −15% as S1 winds down),
  merged at Archon's own cut date **2026-08-12**. M+ score 40/40 and the M+ popularity half are
  byte-identical for the third run ⇒ **not** re-stamped, so they stay at 2026-08-10 and both
  those requirements are honestly `partial`. Reminder the run re-proved: the healer page's
  table also carries a `dps` column (healer DPS) — excluded, as the stored 33-row shape always
  has.
- **murlok — 40/40, every value unchanged** (S1 ladder frozen). Parser note: split on `<a>`
  tags and test for `meta-item` anywhere in the tag — attribute order is NOT stable — and check
  that the rank column comes out contiguous (1..27 / 1..7 / 1..6); a gap is the tell that the
  regex dropped specs. Merged at the run date, which is legitimate here and only here: murlok
  publishes no date of its own, so `asOf` can only mean "observed live on".
- **wowmeta — upstream has not re-run.** snapshotDate still 2026-08-11, all 40 `lowerBound` +
  `numberOfCharacters` identical at the stored 1-decimal precision ⇒ nothing merged, `partial`.
  (Round to 1 decimal, not to an integer — `Math.round` alone reports 36 phantom moves.)
- **simulationcraft — same completed report** (Timestamp 2026-08-08 07:28:33+0000, 1205-01 for
  12.0.7.68974), 26/26 stored values reproduced exactly. **New parse gotcha:** the player-name
  regex must allow a **hyphen** — `MID1_Demon_Hunter_Devourer_Void-Scarred` is Devourer DH's
  best variant (118341); `[A-Za-z_]+` silently drops it and scores the 115175 Annihilator
  profile, which looks exactly like upstream drift.
- **mythicstats — still period 1075** (MID1, 10000 characters / 3247 unique), 36 bars parsed,
  2 moved (Unholy DK 17.8→17.7, Subtlety 0.2→0.3): the page recomputes *within* a period.
  **Beast Mastery is back** after yesterday's absence → absent set back to four (Vengeance DH,
  Restoration Druid, Devastation Evoker, Protection Paladin).
- **Robydoby (best-effort, outside the contract) — nothing new.** Newest Mythic week still
  **24/7** (Sszorak #5, Twin Fangs #6), already stored at 2026-07-24. Untouched.
- **WCL — no fetch of any kind by this agent.** `wcl-fetch/evidence.json` (attemptedAt
  2026-08-13T11:28Z) verdict **"rdps-broken"**. The three raw-DPS keys landed via the
  deterministic step itself: `wcl-dummy-raw` 102 rows (1T 2000 / 2T 658 / 3T 297 / 5T 2000),
  `wcl-ptr-raid-raw` 27 rows (six Venomous Abyss encounters with parses; Coiled Altar and
  Ula'tek 0), `wcl-ptr-mplus-raw` 27 rows (all 8 S2 PTR dungeons at 2000). The five rDPS-family
  cuts stay frozen and unchanged.

- 2026-08-12 (LOCAL run, ~14:3xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). **No metric source re-fetched or re-stamped** — CI refreshed Archon / Murlok /
  Mythicstats / WoWMeta / Bloodmallet / SimC this morning, and independently regenerating what
  CI produced is what makes a local push unmergeable. `data/run-manifest.json` deliberately
  untouched (partial run).
- **WCL: the standing `rdps-broken` verdict is re-confirmed from a residential IP, and the
  HTML endpoint is STILL behind the human challenge — so residential access bought nothing
  this run either.** One cheap retry per the standing rule: OAuth issues a token (1081 chars),
  `characterRankings(metric: rdps)` on encounter 3176 returns a bare "Internal server error"
  GraphQL body at HTTP 200, while plain `dps` on the same encounter answers normally
  (count 80, "Imperator Averzian") — i.e. breakage is API-side, not IP-side, unchanged since
  07-14. The statistics-table fallback for zones 46 and 47, sent by **curl** with the full
  documented header set (XHR + browser UA + Referer), returns **HTTP 302 → `/human-challenge`**
  on both — the same wall as 08-10/08-11. Completing a bot check is not the agent's to do and
  this run is unattended, so it was not attempted. **Net: all five WCL cuts left exactly as
  stored** (zones 46/47 and ptrDummy at 08-10, zone 54 at 07-28, zone 56 at 08-10); the healthy
  `dps` numbers were NOT substituted under the rDPS-labeled series.
- ⚠ **Local-only gate artifact, worth knowing before it is re-diagnosed:** `check-refresh
  --manifest` failed on one line here — *"wcl evidence: attemptedAt 2026-08-10T14:36:31.636Z
  is not from this run"*. That is a **gitignored leftover** `wcl-fetch/evidence.json` from the
  08-10 local run; the nightly's real evidence lives in a CI artifact that a local checkout
  never has. Moving the stale file aside makes the gate print **✓ check-refresh manifest
  passed**, and nothing about it is committed. Note this is NOT the `startedAt is Nh old`
  failure the local-run skill predicts — that check passed, because the nightly's own
  `startedAt` (11:31Z) was ~3h old at gate time.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 11:31Z)

- **WCL — the agent holds no credentials and fetched nothing from warcraftlogs.com by any
  means.** Sole input `wcl-fetch/evidence.json` (attemptedAt 11:25:51Z), verdict
  **"rdps-broken"**: `characterRankings(metric: rdps)` on encounter 3176 returns a bare
  "Internal server error" at HTTP 200 while OAuth + GraphQL transport are healthy (3600/h
  limit, 1 point spent). The five rDPS/normalized cuts stay frozen, unchanged. The three
  RAW-DPS series were landed by the deterministic step itself: `wcl-dummy-raw` 102 rows
  (1T 2000 / 2T 658 / 3T 297 / 5T 2000 ranked players), `wcl-ptr-raid-raw` 27 rows pooled
  over six Venomous Abyss encounters that carry parses (The Coiled Altar and Ula'tek at 0 =
  an unopened window, not an error), `wcl-ptr-mplus-raw` 27 rows over all 8 S2 PTR dungeons
  at 2000 each. Agent neither re-fetched nor edited those rows.
- **archon — the RAID aggregate genuinely re-cut; the M+ aggregate did NOT.** Read from
  `__NEXT_DATA__` `specRankingsSection.table.data[]` (never `tierList`). Raid: all 33
  "95th pct DPS (Mythic)", all 7 "95th pct HPS (Mythic)" and 20 of 40 raid "Popularity"
  values moved, and — the decisive check — **every raid parse count moved** (e.g. Frost Mage
  177461→177412, Augmentation 186705→187213, Mistweaver HPS 220527→221621). Merged with
  `asOf` = **Archon's own lastUpdated date 2026-08-11**, not the run date. M+: all 40
  "M+ score (95th pct)" and all 40 M+ "Popularity" values AND all 40 parse counts are
  byte-identical to stored, so despite the page's `lastUpdated` label advancing to
  2026-08-11 nothing was re-merged — re-stamping an unchanged cut is exactly the failure the
  bloodmallet/wowmeta asOf rule exists to prevent. M+ rows stay at 2026-08-10.
  **Note for the next run: the parse-count column is the reliable re-cut detector here; the
  `lastUpdated` label moved on pages whose data did not.**
- **murlok — 40/40 re-parsed, and EVERY value dropped.** Plain GET (never r.jina.ai), 200,
  41–71 KB. Moves are large and one-directional: Fire Mage 3910→3179 (−18.7%), Restoration
  Druid 3926→3426, Protection Warrior 4000→3557, Holy Priest 3954→3411, with most specs
  −2..3%. This is the shape of a season boundary — 12.1 went live 08-11 22:00 UTC and the
  S1 top-50 pools are emptying — not a parse artifact: the same 40 spec blocks parsed, the
  page still updates every 8h, and no value is anywhere near the 60% row / 35% family-median
  anomaly limits. Merged at the run date (murlok publishes no snapshot date).
- **wowmeta — the SOURCE's snapshotDate advanced 2026-08-05 → 2026-08-11 with byte-identical
  numbers.** JSON API only (`manifest.json` + `rankings/midnight/mplus/all/0.json`, plain
  curl, 161 KB); whitelist `categoryType ∈ {dps,hps,tank}` + `sortField == lowerBound` +
  `keyRange undefined` = exactly 27+7+6 = 40 rows. All 40 `lowerBound` values AND all 40
  `numberOfCharacters` match stored exactly — the mirror image of yesterday, when the values
  re-cut behind an unchanged date. Merged with `asOf` = the source's 2026-08-11, per the
  standing rule, so the stored date advances honestly on the source's own say-so.
- **mythicstats — same period 1075, 36 rows, 2 values moved.** Fetched directly (200,
  187 KB); `/period/latest` 302s to the period page. Still MID1, 10000 characters / 3247
  unique. Unholy DK 17.7→17.8 and Subtlety Rogue 0.3→0.2 (representation = class% × spec%);
  the other 34 held. The same four specs are absent upstream (Vengeance DH, Restoration
  Druid, Devastation Evoker, Protection Paladin) — a real zero-representation absence, and
  their stored rows keep their older dates rather than being forced forward.
- **bloodmallet — upstream still has not re-simmed; nothing merged.** All 27 DPS specs
  requested with up to 4 retries; 26 charts returned, every one `simc_settings.tier == MID1`
  with all six target counts, and **all 26 target vectors byte-identical to stored**. Chart
  timestamps are unchanged: 25 specs at 2026-07-08, Elemental Shaman alone at 2026-07-15.
  Augmentation Evoker returned the 76-byte `{"status": "error"}` body on all 4 tries — the
  documented genuine absence. `asOf` is the CHART's own date, so the sims now read **35 days
  old** against `maxAgeDays: 5` and the heartbeat going red IS the correct signal.
- **simulationcraft — the same completed report, nothing to ingest.** MID1_Raid.html
  re-fetched (200, 37.2 MB); header still "Timestamp: 2026-08-08 07:28:33+0000",
  SimulationCraft for 12.0.7.68974 (hotfix 2026-08-06, git 678e66d384). Verified rather than
  assumed: 24 of the 26 stored "SimC nightly Patchwerk DPS" values reproduce exactly out of
  the DPS-ranking chart's own `__data` block (the two that do not are hero-talent-variant
  naming, not value drift). Rows stay at 2026-08-08.
- **Robydoby (best-effort, outside the contract) — nothing new.** Tab map re-read from the
  `htmlview` script blocks: 26 tabs, newest **Mythic** week still **24/7** (Sszorak #5, Twin
  Fangs #6), already stored at 2026-07-24. No CSV export was needed.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 20:35Z — SECOND run of this UTC day)

**BLOODMALLET HAS RE-SIMMED FOR SEASON 2 (`MID2`) AND THE NEW CHARTS WERE DELIBERATELY NOT
INGESTED.** All 27 DPS specs requested from `talent_target_scaling/castingpatchwerk` with up to
4 retries each; 26 charts returned (Augmentation Evoker still the documented genuine absence —
the 76-byte `{"status": "error"}` body on all 4 tries). Of those 26:
- **14 now carry `simc_settings.tier == "MID2"`** with their own timestamp **2026-08-12**
  (Frost/Unholy DK, all three Hunters, all three Mages, Shadow Priest, Subtlety Rogue,
  Elemental/Enhancement Shaman, Affliction/Destruction Warlock);
- **12 are still `MID1`**, byte-identical to stored at 2026-07-08 (Elemental's stored 07-15 row
  is one of the flipped ones).

The MID2 numbers are on a different footing entirely — Frost DK 1T 133,933 → 219,211, 8T
391,980 → 1,001,606; roughly 1.7–2.3× across the board. `fightProfile` labels (ST/cleave/AoE,
row tags) are **within-role percentiles across DPS specs**, so merging 14 MID2 vectors into a
pool of 12 MID1 vectors would make every label an artifact of *which specs Bloodmallet has
re-simmed so far*, not of spec strength. The skill's "confirm `tier == MID1`" check is exactly
this era gate, so nothing was written and the stored sims stay whole at 26 profiles /
2026-07-08 coverage (35 days, `maxAgeDays` 5 — the red heartbeat is the honest signal).
**When the tracker takes its 12.1-live migration, the MID2 set is ready and this is a
one-shot re-harvest, not a per-spec drip.**

- **archon (all four numeric requirements) — parsed clean, NOTHING re-merged.** 160 rows read
  from `specRankingsSection.table.data[]` (never `tierList`). All 40 raid values, all 40 M+
  values, all 40 raid parse counts and all 40 M+ parse counts are **byte-identical to stored**
  even though `lastUpdated` advanced to 2026-08-12T12:00:00Z on all six pages. Re-stamping an
  unchanged cut with a fresher date is precisely the failure the asOf rule exists to prevent,
  so the families keep their real coverage dates: 95th-pct DPS and HPS **2026-08-11**, M+ score
  and Popularity **2026-08-10**. All four rows are `partial` for that reason.
- **wowmeta — re-fetched, unchanged.** JSON API only (manifest + `rankings/midnight/mplus/all/0`),
  plain curl, 200, 161 KB. Whitelist `categoryType ∈ {dps,hps,tank}` + `sortField == lowerBound`
  + `keyRange undefined` → exactly 27+7+6 = 40 rows. `manifest.snapshotDate` still **2026-08-11**
  (pipeline completedAt 2026-08-11T22:52:39Z) and all 40 `lowerBound` values + all 40
  `numberOfCharacters` byte-identical → nothing merged, `partial`.
- **murlok — 40/40 re-parsed, 0 value moves.** Plain GET on the three meta pages (200,
  41–71 KB; never r.jina.ai). **Parser gotcha found and worth keeping: the `<a>` attribute order
  is not stable.** Most cards are `<a class="… meta-item …" href=…>` but some are
  `<a href=… class="… meta-item …">`, so a regex anchored on `class="[^"]*meta-item` silently
  dropped 4 specs (DPS ranks 4/14/17 — Subtlety Rogue, Elemental Shaman, Arms Warrior — and
  healer rank 3, Discipline Priest) while looking like a clean 36-row parse. Match
  `<a [^>]*meta-item[^>]*>` instead, and **check the rank column for gaps** — 1,2,3,5,6… is the
  tell. Yesterday's 40-row parse is confirmed correct; the values have not moved since the
  season-boundary drop this morning.
- **mythicstats — 35 rows, 0 value moves.** Direct fetch (200, 187 KB), still period **1075**,
  MID1, 10000 characters / 3247 unique. **Beast Mastery Hunter has now dropped off the page**
  (absent set is Vengeance DH, Restoration Druid, Devastation Evoker, Protection Paladin,
  Beast Mastery Hunter — 35 published, was 36): a legitimate upstream zero-representation
  absence in the last week of Season 1, not a parse miss. Its stored row keeps its older date.
- **simulationcraft — same report, verified value-by-value.** MID1_Raid.html re-fetched (200,
  37.2 MB); header still "Timestamp: 2026-08-08 07:28:33+0000", SimulationCraft 1205-01 for
  12.0.7.68974. **26 of 26** stored "SimC nightly Patchwerk DPS" values reproduce **exactly**
  out of the report's own chart data. Method note for future runs: take the `"data":[…]` array
  that **encloses the first big-value `"name":"MID1_…","y":…` hit**; a max over every series in
  the file picks up the later "Damage per Second (Click title for burst)" charts instead and
  disagrees with every stored value.
- **Robydoby (best-effort, outside the contract) — nothing new.** Tab map re-read from the
  `htmlview` script blocks: 26 tabs, newest **Mythic** week still **24/7** (Sszorak #5, Twin
  Fangs #6), already stored at 2026-07-24. Stored rows untouched.
- **WCL — no fetch of any kind by this agent.** `wcl-fetch/evidence.json` (attemptedAt
  2026-08-12T20:31:35Z) verdict **"rdps-broken"**; OAuth + GraphQL transport healthy (3600/h,
  1 point spent). The three raw-DPS keys landed via the deterministic step itself —
  `wcl-dummy-raw` 102 rows (1T 2000 / 2T 658 / 3T 297 / 5T 2000 ranked players),
  `wcl-ptr-raid-raw` 27 rows (six Venomous Abyss encounters with parses; The Coiled Altar and
  Ula'tek both 0), `wcl-ptr-mplus-raw` 27 rows (all 8 S2 PTR dungeons at 2000). The five
  rDPS-family cuts stay frozen and unchanged.

## 2026-08-11 (nightly, CI)

- **Archon split cleanly in two this run.** RAID re-cut (33 "95th pct DPS" rows and all 7
  HPS rows moved; 14 of 40 raid popularity values moved) and was merged at today's date.
  **M+ did not**: all 40 "M+ score (95th pct)" values AND all 40 M+ popularity values are
  byte-identical to 08-10, with Archon's own `lastUpdated` unchanged at 2026-08-10T12:00:00Z.
  Nothing M+ was merged and neither date was restamped -> `archon-mplus-score` and
  `archon-popularity` are honest **partials**. (Last run had M+ popularity moving, which is
  what made a same-label fetch defensible then; that evidence is absent today.)
- **Murlok: 40/40 values byte-identical to 08-10, and re-merged anyway.** The page states
  "Updated 4 hours ago" on an 8-hour cadence, so this is a **static Season-1 ladder on the
  last day of the season**, not a stalled feed — the distinction the wowmeta/bloodmallet
  rule turns on is whether the SOURCE has a date, and murlok's says fresh. Protection
  Paladin is back on the tank page after vanishing last run, so no row had to be held over.
- **Mythicstats re-cut inside the same period id**: still period 1075 / week 20, but
  3247 unique characters and 22.5 avg key level (vs 3949 / 21.8 last night) and 25 values
  moved. Period id alone is NOT a change detector — compare the population line too.
  36 of 40 specs on the chart; Vengeance DH, Restoration Druid, Devastation Evoker and
  Protection Paladin are absent upstream and keep their stored rows.
- **Bloodmallet still frozen at 2026-07-08** (Elemental alone 07-15) — 26 charts fetched,
  all MID1, all target maps byte-identical, Augmentation still the 76-byte error body.
  34 days stale against maxAgeDays 5: the red heartbeat is the correct signal.
- **SimulationCraft is mid-run.** MID1_Raid.html is the same completed report
  (Last-Modified 2026-08-08 07:28:34 GMT, in-report Timestamp 07:28:33+0000, stored values
  reproduce exactly), while `MID1_Raid.txt` is currently a **272-byte stub** — header plus
  "Simulating..." — i.e. a new nightly is running and has not published results. Useful
  cheap probe: the .txt tells you the run state without pulling the 37 MB HTML.
- **WoWMeta** unchanged (snapshotDate 2026-08-05, 40/40 identical) -> partial, not restamped.
- **Robydoby** (best-effort, outside the contract): newest Mythic week on the sheet is still
  24/7 with two boss tabs, which is exactly what is stored -> nothing to merge.
- **WCL**: evidence-only (`rdps-broken`, 11:25:06Z, OAuth + GraphQL healthy, 1 point spent).
  The five rDPS/normalized cuts stay frozen; the three raw series landed pre-agent (Dummy
  Dome 102 rows / Venomous Abyss 27 / M+ keys 27). No warcraftlogs.com fetch by the agent.

- 2026-08-11 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). **No metric source re-fetched or re-stamped** — CI refreshed Archon / Murlok /
  Mythicstats / WoWMeta / Bloodmallet / SimC this morning, and independently regenerating
  what CI produced is what makes a local push unmergeable. `data/run-manifest.json`
  deliberately untouched (partial run).
- **WCL: the standing `rdps-broken` state is confirmed from a residential IP, and the
  08-09 FULL outage has CLEARED.** OAuth issues a token, `rateLimitData` answers
  (3600/h, 1 point spent), and `characterRankings` returns **100 rankings for `dps` and for
  `hps`** on encounter 3176. The redistributed-credit family is still dead: `rdps`, `ndps`
  and `playerscore` each return a bare "Internal server error" GraphQL body at HTTP 200.
  So this is byte-for-byte the verdict the nightly's pre-agent evidence recorded — the
  breakage is **API-side, not IP-side**, and residential access buys nothing here.
- **The HTML statistics endpoint is still behind the human challenge.** `zone/statistics/46`
  and `zone/statistics/47`, sent with the full documented header set (XHR + browser UA +
  Referer), both return **HTTP 302 → `/human-challenge`**. This is the same wall the 08-10
  run hit; that run only got through because **Riley cleared the challenge himself in the
  in-app browser** and the fetches ran as in-page XHR through his session. Completing a bot
  check is not the agent's to do, and this run is unattended, so it was not attempted.
- **Net: all five WCL cuts left exactly as they were** (zones 46/47 and ptrDummy at 08-10,
  zone 54 at 07-28, zone 56 at 08-10). Nothing papered over, nothing substituted — in
  particular the healthy `dps`/`hps` numbers were NOT dressed up under the rDPS-labeled
  series. Re-check next run: if `rdps` answers, the standing one-retry rule applies; if it
  still 500s, the restore needs an owner-cleared browser session as on 08-10.

## 2026-08-11 (nightly, CI — second scheduled run of this UTC day; started ~17:5xZ)

Every metric source attempted fresh. **Upstream had not moved on any of them except
WoWMeta**, which is the honest headline: this run sits ~6h behind the 12:00Z one.

- **Warcraft Logs — no fetch attempted, by design.** This agent holds no WCL credentials.
  `wcl-fetch/evidence.json` (pre-agent, 17:46:24Z) reports verdict **`rdps-broken`**:
  `characterRankings(metric: rdps)` on encounter 3176 returns a bare "Internal server error"
  at HTTP 200 with OAuth and GraphQL both healthy (rate limit 3600/h, 1 point spent). So the
  five rDPS/normalized cuts stay **unreachable** and untouched — zones 46/47 and `ptrDummy`
  at 2026-08-10, zone 54 at 2026-07-28, zone 56 at 2026-08-10. The three RAW series landed
  from the frozen recipe in the deterministic step itself: `wcl-dummy-raw` 102 rows (1T 2000
  ranked players / 2T 655 / 3T 289 / 5T 2000), `wcl-ptr-raid-raw` 27 rows pooled over the six
  Venomous Abyss encounters carrying parses (The Coiled Altar and Ula'tek at 0), and
  `wcl-ptr-mplus-raw` 27 rows over all 8 S2 PTR dungeons at 2000 each. Agents neither
  re-fetch nor edit those rows.
- **Archon numbers — all four series `partial`, and the reason is the same for each.** The
  full `specRankingsSection.table.data[]` was re-read off the same six pages the tier pass
  fetched: 33 rows of "95th pct DPS (Mythic)" (27 DPS + 6 tanks — the tank page's `dps`
  column belongs to this family), 7 of "95th pct HPS (Mythic)", 40 of "M+ score (95th pct)"
  and 80 of "Popularity". **160 of 160 values byte-identical to stored** once popularity is
  rounded to the stored 1 decimal (raw payload carries 2: e.g. Frost Mage raid popularity
  9.9668… → 10.0, stored 10). Archon's own `lastUpdated` is unchanged at 2026-08-10T12:00:00Z
  on five of six pages. Nothing was re-merged, because re-stamping an unchanged Archon cut
  with a fresher date is precisely the bloodmallet/wowmeta failure written up below.
  archon-metrics and archon-hps stay dated 2026-08-11 (this morning's merge), M+ score and
  popularity stay at 2026-08-10.
- **WoWMeta — `partial`, and the only source that moved.** JSON API only, plain curl, HTTP
  200 on both calls. `manifest.json` `snapshotDate` is **still 2026-08-05**, byte-identical
  to the stored `asOf` — but the rankings payload has been RE-CUT behind that unchanged
  label: all 40 `lowerBound` values differ and so do the `numberOfCharacters` (Guardian Druid
  394.3/83423 → 396.6/75340, Blood DK 339.8/47979 → 341.6/61738). Moves are ~0.3-1.5%, far
  under every anomaly threshold. Merged the live values with **`asOf` kept at the source's
  own 2026-08-05** — never today — so the row is `partial` and the age gate keeps measuring
  the real thing. Worth a note for whoever reads this next: a source that re-cuts its data
  without bumping its own snapshot date defeats a date-only change detector, so this family
  is only safe to diff on VALUES.
- **Murlok — `success`.** Three meta pages by plain GET (never r.jina.ai), HTTP 200,
  41-72 KB. 40/40 specs parsed from the meta-item blocks (`<div class="h3">` label + the
  number in the infobar). Every value identical to the stored 2026-08-11 cut; Murlok
  refreshes every 8h, so no re-cut in 6h is expected. Pages still self-describe
  "Midnight Season 1 … Patch 12.0.7".
- **Mythicstats — `success`.** Fetched DIRECTLY (r.jina.ai answers but hands back a
  condensed 19 KB markdown whose per-spec numbers cannot be attributed reliably — the direct
  page is 187 KB and server-rendered; use it). Still **period 1075**, 10000 characters /
  **3247 unique** / 22.5 avg key — the identical cut to this morning's, and 36/36 published
  values match stored exactly. The four specs absent upstream (Vengeance DH, Restoration
  Druid, Devastation Evoker, Protection Paladin) keep their older dates, which is what makes
  the family's coverage date honest.
- **Bloodmallet — `partial`, 34 days stale upstream and that red is the signal.** All 27 DPS
  specs requested with up to 4 retries; 26 charts returned, every one `simc_settings.tier ==
  MID1`. Chart timestamps: **25 at 2026-07-08, Elemental Shaman alone at 2026-07-15** — the
  same per-spec dates already stored, and all 26 target-count vectors byte-identical.
  Augmentation Evoker returned the 76-byte `{"status": "error"}` body on all 4 tries (the
  documented genuine absence). `asOf` left at the chart's own date, never the run date.
- **SimulationCraft — `partial`.** MID1_Raid.html fetched live (37 MB). Its own header still
  reads `Timestamp: 2026-08-08 07:28:33+0000`, `git build 678e66d384`, hotfix 2026-08-06 —
  the same completed report as the last two runs. Spot-verified rather than assumed: the 21
  cleanly-keyed DPS specs reproduce their stored values out of the fetched report with 0
  diffs. No re-sim to ingest.
- **Robydoby (best-effort, deliberately outside the contract) — nothing new.** Tab map
  re-read from the `htmlview` script blocks: 26 tabs, newest **Mythic** week still
  **24/7** (Sszorak #5, Twin Fangs #6), already stored at 2026-07-24. The two 17/7 Tidebound
  Grotto tabs are zone 57 and correctly skipped. No fetch of the CSV exports was needed.

- 2026-08-10 (LOCAL evening run, ~21:4xZ — Opus 5; owner-requested pre-freeze catch-up after
  the 12:03Z nightly, which had TRANSCRIPT API limit-exceeded + the standing rdps-500). Scope:
  WCL only — nothing CI refreshed today was re-fetched.
  · **TRANSPORT CHANGE — the 08-04 curl finding is DEAD.** curl + XHR headers now 302s to
  /human-challenge on EVERY statistics URL (tested twice). Tonight's transport: the OWNER
  cleared the challenge in the in-app browser (one click), then all 16 fetches ran as in-page
  fetch() with the XHR header through that session — HTTP 200 first try, every URL. Next run:
  expect curl to fail; either repeat the owner-click path or wait for the nightly evidence file.
  · **Zone 46 live raid** (5/20/3): 27+6+7+7 = 47 rows, parses 1,567-27,023; healer-DPS sanity
  check — values 5.4k-33k vs HPS 163k-187k ✓ (per this log 08-04: check VALUES, not parse counts).
  · **Zone 47 live M+** (10/5/1): 40 rows, parses 17,322-328,103.
  · **Zone 56 PTR M+**: 40 rows, parses 21-1,311 (Arcane 1,311 / HPal 871 — the healer testing
  wave landed; MW n dropped 199→148 as the 14-day window aged out early parses).
  · **Zone 52 Dummy Dome** → ptrDummy 27 specs: 1T 27 / 2T 26 / 3T 21 / 5T 27 = 101 cells,
  parses 1-409. Spec-appears-twice duplication did NOT occur (4th consecutive clean run).
  · **Zone 54 still EMPTY** (probe Heroic 4/10 DPS: 9.1 KB fragment, 0 data rows) — stored 34
  rows AND that page snapshot left at 2026-07-28.
  · **HEALER DUMMY (zone 52 boss 3594, hps cut): AGGREGATES BUT WAS REJECTED — DO NOT INGEST
  THE MEDIAN.** 7/7 specs, n 33-73, but medians span 2,246 (HPriest) → 338,168 (Disc), a 150x
  spread, while maxes sit 442k-621k (1.4x). The median is idle-parse-contaminated: a healer
  alone at the dummy has nobody to heal, so it measures what fraction of a spec's parses came
  from organized full-raid sessions, not healing output. Publishing it would claim RDruid
  heals 3% of Disc. Revisit only with a per-player-best or session-filtered statistic.
  · Integer rounding: first merge landed 222 two-decimal values (this log's 08-02 gotcha caught
  it on read-back); re-merged, 386/386 integers verified.
  · sources.json snapshots → 2026-08-10 for 46/47/56/52 ONLY. 127 rows + 27 ptrDummy via
  apply-metrics, 0 unmatched. **11 forecast letters moved (10 M+, 1 raid), 0 consensus** —
  healer/tank zone-56 medians sit in a ±7% band, so modest honest moves reorder the
  within-role percentile wholesale (the v12 ORDER-not-LEVEL property, named in the commit).
  Manifest deliberately untouched (partial run; nightly startedAt 11:59Z stands).

## 2026-08-10 (nightly CI, headless Opus 5, single-shot; started 11:32Z)

- **Archon numbers: all four series re-read and merged** from
  `specRankingsSection.table.data[]` (never `tierList`) — 95th pct DPS 33 rows, 95th pct HPS
  7, M+ score 40, Popularity 80, plus survivability 40. 160 metric rows applied.
  · Raid DPS moved on 33/33 (Frost Mage 177031→177235), HPS on 7/7, popularity on 74/80 —
    so the raid aggregate genuinely rolled forward and `asOf` advances.
  · **M+ score moved on 0/40.** It is a slow weekly-scale number; popularity on the *same
    rows* did move, which is what proves the page was live rather than cached. Don't read a
    static score column as a stale fetch.
  · **Round popularity to 1 decimal** — the stored series is 1dp, and `round(x*100, 2)` fakes
    a 39-row diff (10 → 9.98) out of nothing.
- **Three sources were unchanged upstream and were deliberately NOT restamped.** All three
  were *verified* unchanged rather than assumed:
  · **bloodmallet** — 26/27 charts (Augmentation errors on all 4 retries, the documented
    genuine absence). Every chart timestamp identical (25 @ 2026-07-08, Elemental Shaman @
    2026-07-15) and all 26 target maps byte-identical. Now **33 days** old against
    `maxAgeDays: 5`; the red heartbeat is the correct signal, per the 08-08 correction.
  · **simulationcraft** — same report (`Timestamp: 2026-08-08 07:28:33+0000`, git build
    2026-08-06/68974). All 26 stored values reproduce exactly. **Parse gotcha:** bracket-match
    the FIRST `"data":[` after `"__data"` (later charts in the same file are different
    quantities and will silently give you ~2.5x numbers), and use a hyphen-tolerant name
    regex — Havoc's profile is `MID1_Demon_Hunter_Havoc_Fel-Scarred`, so `[A-Za-z_]+` drops
    it and only it.
  · **wowmeta** — JSON API only. `manifest.snapshotDate` still 2026-08-05, all 40
    `lowerBound` values byte-identical. **Round to 1 decimal** here too (stored 394.3, not
    394) or you manufacture 34 phantom moves.
- **murlok**: 39/40. **Protection Paladin is absent from the tank page upstream** — it lists
  only five tanks. Its stored row keeps its old value and date; not deleted, not invented.
  27 of the 39 values moved.
- **mythicstats**: still **period 1075, week 20 of MID1** (10000 characters / 3949 unique,
  21.8 avg key). All 39 parsed values byte-identical → nothing merged, `asOf` held at
  2026-08-09. Devastation Evoker is still absent from the top-2000 chart (stored row stays
  2026-08-07, value 0).
- **robydoby (best-effort, outside the contract)**: tab map re-read; the newest Mythic week
  is still **24/7** (Sszorak #5, Twin Fangs #6). Nothing new since the stored 2026-07-24 cut,
  so nothing merged. Do not promote it into `required-sources.json`.
- **WCL**: evidence-only (`rdps-broken`, 11:32:01Z, OAuth+GraphQL healthy, 1 point spent).
  Five rDPS/normalized cuts stay frozen; the three raw series landed pre-agent (dummy 104
  rows / Venomous Abyss 27 / M+ keys 27). No warcraftlogs.com fetch of any kind by the agent.
- `npm test` 336 pass / 0 fail / 27 skipped; `npm run build` OK; `check-refresh --manifest`
  passes (1 tier move vs the committed baseline, 0 of ≥2 bands).

## 2026-08-09 (nightly, CI runner)

- **Archon** — new upstream cut (08-07T12:00Z → 08-08T12:00Z): 95th-pct DPS 33, HPS 7,
  M+ score 40, popularity 80 = 160 rows at asOf 2026-08-09; 59 values changed, all far
  inside `maxValueMovePct`. Read from `specRankingsSection.table.data[]`, never `tierList`.
- **Murlok** 40/40 at 2026-08-09; **0 of 40 values moved**. Not a stale fetch: the pages
  self-report "Updated 7 hours ago" and refresh every 8h — the top-50 ceiling is simply
  near-static this late in Season 1. Plain GET only (r.jina.ai still does not work there).
- **Mythicstats** — `r.jina.ai` returned **403 this run**; fetched the site DIRECTLY
  instead (index 200, and `/period/latest` is server-rendered, 206 KB). Period **1075**,
  week 20 of MID1, top 2000 keys / 10000 characters / 21.8 avg key. 39 of 40 specs at
  2026-08-09; Devastation Evoker is absent from the bars entirely (as last run — its
  stored value is 0.0%), so its row keeps the older date rather than being invented.
- **WoWMeta** partial: JSON API 200 but `manifest.snapshotDate` is **still 2026-08-05**,
  the third consecutive night with no upstream pipeline run. 40 rows re-merged unchanged;
  the coverage date stays 08-05 (4 days, maxAgeDays 8).
- **Bloodmallet** partial: 26/27 charts (Augmentation still errors on all 3 retries — the
  documented genuine absence), MID1 confirmed, and the per-spec chart timestamps are
  **unchanged at 2026-07-08 (Elemental 07-15)** with 0 of 26 profiles moving a value.
  32 days without a re-sim against `maxAgeDays 5` — the heartbeat SHOULD go red here; that
  red is the signal (the 08-08 honest-date correction), not something to paper over.
- **SimulationCraft** partial: the fetched `MID1_Raid.html` is the SAME report as
  yesterday — Timestamp **2026-08-08 07:28:33+0000**, SimC 1205-01, WoW 12.0.7.68974.
  Re-verified the reduction rule while re-parsing: best build per spec (max matched all 26
  stored values exactly, min matched none), tanks excluded. asOf stays the report's own
  date, so the row is partial.
- **Robydoby** (best-effort, outside the contract): both sheet indexes fetched; the newest
  **Mythic** week is still **24/7**, i.e. the week already stored at asOf 2026-07-24. Nothing
  new to ingest, so nothing was merged — and a probe of the 24/7 CSV tabs made clear the
  right-hand percentile block does not sit at a fixed column offset, so re-deriving the
  parse for a week that has not changed would have risked writing wrong values for no gain.
- **WCL**: this agent holds no credentials and fetched nothing from warcraftlogs.com. Per
  `wcl-fetch/evidence.json` (11:04:54Z, verdict **rdps-broken** — `characterRankings(rdps)`
  on 3176 still a bare Internal server error while OAuth/GraphQL transport is fine), the
  five rDPS/normalized cuts stay frozen (zones 46/47 at 08-07, zone 54 at 07-28, ptrDummy
  at 08-07) and only the three deterministic RAW series landed, by the fetch step itself:
  dummy 104 rows (1T 2000 / 2T 593 / 3T 274 / 5T 2000 ranked players), Venomous Abyss
  pooled 27, M+ keys pooled 27 — all at 2026-08-09.
- `npm test` 317 pass / 0 fail / 21 skipped; `npm run build` OK; `check-refresh --manifest`
  passes (16 consensus tier moves vs the committed baseline, 0 of ≥2 bands).

- 2026-08-09 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). **Scope: residential-only catch-up. No metric source was re-fetched or
  re-stamped** — CI had already refreshed Archon/Murlok/Mythicstats/WoWMeta/Bloodmallet/SimC
  this morning, and independently regenerating what CI produced is what makes a local push
  unmergeable. `data/run-manifest.json` deliberately NOT touched (partial run — it remains
  the nightly's honest record; a fresh `startedAt` would claim a full refresh happened).
- **WCL is in a FULL API OUTAGE from here, wider than the standing rdps breakage.** The
  mandated cheap retry was run against the canonical probe (`characterRankings(metric: rdps,
  page: 1)` on encounter 3176, the exact query `fetch-wcl.mjs` uses): **HTTP 500**. So was
  plain `dps`. So was `{ worldData { encounter(id: 3176) { id name } } }`. So was
  **`rateLimitData`** — the simplest query the API accepts — all returning a 500 with an
  HTML "An error has occurred" page rather than a GraphQL error body. OAuth still issues a
  token fine, so this is not credentials and not our transport. That is a strictly broader
  fault than the documented `rdps-broken` state (where `dps`/`hps` work), and it began
  AFTER the nightly's 11:04:54Z fetch step, which did land its three raw-DPS series.
- **The HTML statistics endpoint no longer clears Cloudflare from a residential IP with
  node `fetch`** — worth recording, because the skill currently says it does. Both
  `zone/statistics/table/46/...?dpstype=rdps` and the zone-54 normalized cut returned
  **HTTP 403 with a "Just a moment..." interstitial** (6.2 KB, spriteRows=0), sent with the
  full documented header set (XHR + browser UA + Referer). Residential IP is evidently no
  longer sufficient on its own — Cloudflare is fingerprinting the client, not just the
  address. A real browser might still render it, but that is a scrape path against WCL's
  stated API-only policy and was not attempted.
- **Net: no WCL data obtainable by either transport this run; all five frozen series left
  untouched** (zones 46/47 at 08-07, zone 54 at 07-28, ptrDummy at 08-07). Nothing papered
  over. Re-check next run — if `rateLimitData` answers again the outage has cleared, and the
  separate question of whether `rdps` itself is fixed is back to the standing one-retry rule.

## 2026-08-09 (nightly CI, ~19:5x-20:0xZ — second scheduled run of the day)

- **SIMC PARSE GOTCHA, and it was silently wrong until this run.** Hero-talent profile names
  can carry a **HYPHEN** — `MID1_Demon_Hunter_Havoc_Fel-Scarred`, `..._Devourer_Void-Scarred`
  — so a profile-name character class of `[A-Za-z_'0-9]` **drops Havoc entirely** (it has no
  hyphen-free variant) and reads Devourer off its lesser build: 115175 instead of the correct
  **118341**, a 2.7% error that looks exactly like a real sim move. Include `-` in the pattern.
  With it fixed, all 26 stored DPS values reproduced EXACTLY. Report unchanged from the last
  two runs (SimC 1205-01, WoW 12.0.7.68974, git **678e66d384**, Timestamp 2026-08-08
  07:28:33+0000) → `partial`, asOf stays 08-08. `MID1_Raid.txt` is a live in-progress log of
  a NEWER run (git e5e7634a61, 4 of 49 profiles) with no ranking block — not ingestible.
- **MURLOK PARSE GOTCHA:** the meta-item anchor emits its attributes in **either order**
  (`<a class="vi-box meta-item…"` and `<a href="…" class="vi-box meta-item…"`), so a regex
  anchored on `<a class=` drops 5 of 40 specs (Frost/Fire Mage, Marksmanship, Destruction
  Warlock, one tank) — and it drops them *silently*, since the page still parses. Match
  `<a [^>]*class="[^"]*meta-item`. 40/40 at 2026-08-09, **0 values moved** (second run of the
  day; the pages refresh ~8-hourly).
- **Archon** all four numeric series re-read from `specRankingsSection.table.data[]` at
  `lastUpdated` 2026-08-09T12:00:00Z: 33 DPS / 7 HPS / 40 M+ score / 80 popularity, plus 40
  survivability. Values identical to this morning's ingest (same daily aggregate); the
  survivability BANDS moved on 16 of 40 — clustering, not throughput.
- **Bloodmallet** `partial`: 26/27 charts (Augmentation still errors on all 3 retries), MID1
  confirmed on every one, chart timestamps **still 2026-07-08 (Elemental 07-15)** and 0 of 26
  target sets moved — 32 days without a re-sim against `maxAgeDays 5`. The heartbeat red is
  the signal; do not paper it over by stamping the run date.
- **WoWMeta** `partial`: JSON API only, 40 rows, `manifest.snapshotDate` **still 2026-08-05**
  for the fourth consecutive night.
- **Mythicstats** `success`: r.jina.ai still 403s, fetched directly; `/period/latest` is
  server-rendered. Period **1075** (week 20; 2000 keys / 10000 chars, 3949 unique, 21.8 avg —
  the unique-character count moved, so the sample rolled within the period), 39 rows, 0 values
  moved. Devastation Evoker absent from the figure again (0 slug hits in raw HTML).
- **Robydoby** (best-effort, outside the contract): both sheet indexes fetched; newest
  **Mythic** week is still **24/7** (Sszorak + Twin Fangs). Unlike the last run the parse WAS
  re-derived and verified — locate the 4-column `Class | 90th | 95th | 99th` header with a
  real CSV reader (it sits at col 18 on both sheets, but do not hardcode that), strip
  thousands separators, take the max 99th across the week's bosses: **31 rows, all 31
  byte-identical to stored**, so nothing was merged and the two 07-16 leftovers were left
  alone. Six cells oscillated between the 08-01 and 08-02 runs; they are stable now.
- **WCL**: evidence-only (`rdps-broken`, 19:46:17Z). Five cuts frozen, three raw series
  landed pre-agent (dummy 104 / Venomous Abyss 27 / M+ keys 27). No warcraftlogs.com fetch.
- `npm test` 336 pass / 0 fail / 27 skipped; `npm run build` OK; `check-refresh --manifest`
  passes (0 tier moves vs the committed baseline).

## 2026-08-08 — nightly CI (headless, Opus 5, single-shot; started 11:26Z)

- **WCL: agent holds no credentials, fetched nothing from warcraftlogs.com.** Sole input
  `wcl-fetch/evidence.json` (11:03:50Z), verdict **`rdps-broken`** — `characterRankings
  (metric: rdps)` on encounter 3176 still 200-with-"Internal server error", 0 rankings,
  while OAuth + GraphQL transport report ok (3600/h, 1 point). So the five rDPS/normalized
  cuts (`wcl-live-raid`, `wcl-live-mplus`, `wcl-ptr-raid`, `wcl-ptr-mplus`,
  `wcl-dummy-dome`) are `unreachable` and their data was **left untouched**; the three
  deterministic RAW keys landed before the agent started and advanced to 2026-08-08:
  dummy 102 rows (1T 2000 / 2T 549 / 3T 250 / 5T 2000 ranked players), zone-54 pooled 27,
  zone-56 pooled 27. Corroboration for zone 54's emptiness: its raw cut reports **The
  Coiled Altar and Ula'tek at 0 ranked players** — between testing windows.
- **Archon numbers** — 160 rows from `specRankingsSection.table.data[]` (never `tierList`):
  95th-pct DPS 33, 95th-pct HPS 7, M+ score 40, popularity 80. New cut (lastUpdated
  08-07T12:00Z), all moves well inside `maxValueMovePct`.
- **WoWMeta `partial`** — JSON API only (`manifest.json` + `rankings/midnight/mplus/all/0.json`,
  plain curl, 161 KB). 40 rows via the dps|hps|tank **whitelist** (melee/ranged are subsets
  of dps). `snapshotDate` still **2026-08-05**, byte-identical to yesterday's cut: 0 of 40
  values and every `n` unchanged. **Two consecutive nights with no upstream pipeline run** —
  `maxAgeDays` 8 not breached, but worth watching.
- **Murlok** 40/40, plain GET (r.jina.ai does not work on it), split on
  `class="vi-box meta-item ` — 27/7/6 items is the correct count. 27 values moved, all
  DOWN by 1–13 rating (largest Feral 4235→4222).
- **SimC — NEW nightly build**, HEAD `678e66d384` (was `fee98c101c`) at the same
  12.0.7.68974 / hotfix 2026-08-06. 26/26 DPS specs. **Bound the parse strictly between
  `DPS Ranking:` and `HPS Ranking:`** — a fixed-size window past the block also swallows
  the HPS section (49 real profiles vs 60 lines in an 8 KB window); it happened to be
  harmless here only because healer profiles can't match a DPS-role spec. 25 of 26 moves
  are sub-1%; the exception is **Fury Warrior 114,165 → 109,256 (−4.3%)**, no reordering.
- **Bloodmallet** 26/26, `simc_settings.tier == "MID1"` on every chart, **zero target
  values moved** — chart timestamps are still 2026-07-08 02:5x (Elemental 07-15), i.e.
  nothing re-simmed upstream; only our verification date advanced. Augmentation returns
  `{status: "error"}` by design.
- **Mythicstats** — fetch **`/period/latest`**, not the site root (the root's 9 KB markdown
  has no representation section; the period page's 19 KB does). Period 1075 still, week
  progressed: 3949 unique characters (was 4650) at 21.8 avg key (was 21.5). **39 of 40
  parsed — Devastation Evoker has dropped out of the top-2000 cut entirely** and appears
  nowhere on the page. Legitimate upstream absence: its stored row was left alone rather
  than written as a fabricated 0.0. The coverage probe (25th-freshest of 40) is unaffected.
- **Robydoby (best-effort, outside the contract)** — `htmlview` tab map fetched, 26 tabs,
  newest **Mythic** week is still **24/7** (Sszorak + Twin Fangs), which is already
  ingested at `asOf 2026-07-24`. One CSV re-fetched to confirm reachability (200, 776
  lines). Nothing new upstream, so nothing merged.
- **Registry snapshots** bumped to 2026-08-08 for murlok / bloodmallet / simulationcraft /
  mythicstats / robydoby and WCL zones **52 and 56** (their raw series landed today).
  **Zones 46/47 left at 2026-08-07 and zone 54 at 2026-07-28** — this agent observed
  neither, and bumping a snapshot for a cut that did not refresh is the "a 200 is not
  freshness" trap in reverse.
- `npm test` **313 pass / 0 fail / 21 skipped** (Playwright UI invariants skip in this job);
  `npm run build` OK (1272.8 KB); `node src/snapshot.mjs`; `check-refresh --manifest` **passes**.

## 2026-08-07 — nightly CI (headless)

- **Archon** (new 2026-08-06T12:00:00Z cut): 160 numbers re-read from
  `specRankingsSection.table.data[]` — 95th-pct DPS 33, 95th-pct HPS 7, M+ score 40,
  Popularity 80. 61 of 160 values moved; largest relative move 12.5% (a small popularity
  figure), well inside `maxValueMovePct` 0.6.
- **Murlok** 40/40 (27/7/6). Split on `class="vi-box meta-item ` — the documented fix; the
  narrower `<a class="vi-box meta-item ` literal still silently drops 5 specs. 27 values
  moved, all DPS, max +0.68%.
- **WoWMeta** JSON API only (manifest + `/rankings/midnight/mplus/all/0.json`, plain curl,
  no headers). 40 rows, **0 values moved and every `n` identical** because
  `snapshotDate` is STILL **2026-08-05** — two days behind. Recorded `partial`, not
  success: `asOf` is the source's date, never today. `maxAgeDays` 8 not breached.
- **SimulationCraft** — new nightly: `git build HEAD fee98c101c` (was `c5b695436c`) at the
  same `hotfix 2026-08-06/68974`. 26/26 specs, all moved, all sub-1% (largest Shadow Priest
  +0.95%). No reordering.
- **Bloodmallet** 26/26 charts, `tier == "MID1"` on every one, **zero target values moved**:
  chart timestamps are still 2026-07-08 (Elemental 2026-07-15). Only our verification date
  advanced — say that plainly rather than calling it fresh sims.
- **Mythicstats** still period **1075**, but the in-progress week moved: 4650 unique
  characters (was 6313) at 21.5 average key level (was 19.8), so 38 of 40 values moved.
  All values are percentages, below the anomaly gate's `minValueMagnitude` 100.
- **Robydoby** (best-effort, outside the contract): both sheets fetched, tab map parsed —
  the newest **Mythic** week is still `24/7`, the week already stored at `asOf 2026-07-24`.
  Nothing new upstream, so nothing merged; the 17/7 Tidebound Grotto tabs stay skipped
  (zone 57, not tracked).
- **WCL: agent holds no credentials and fetched nothing from warcraftlogs.com.**
  `wcl-fetch/evidence.json` (2026-08-07T11:27:10Z) verdict **`rdps-broken`** — rdps on
  encounter 3176 still 500s with OAuth and GraphQL both healthy. The three `*-raw` keys
  landed via the frozen recipe before the agent started (dummy 103 rows: 1T 2000 / 2T 505 /
  3T 232 / 5T 2000; PTR raid 27 pooled; PTR M+ 27 pooled); the five rDPS/normalized cuts
  stay frozen and untouched.
- **Registry snapshots** bumped to 2026-08-07 for murlok / mythicstats / bloodmallet /
  simulationcraft / robydoby. **The five warcraftlogs page entries were deliberately NOT
  bumped** — this agent fetched none of those pages, and the gates read the data's own
  coverage dates anyway.
- `npm test` **332 pass / 0 fail**, build OK, snapshot written; `check-refresh --manifest`
  and `--age` both pass.

## 2026-08-07 (LOCAL run, Opus 5 — scheduled residential catch-up, ~15:0xZ, after the 11:31Z nightly)

- **Scope: residential-only.** The five cuts the nightly recorded `unreachable` were re-fetched
  and landed; Archon, Murlok, Mythicstats, SimC, Bloodmallet, WoWMeta and every tier list were
  left exactly as CI produced them (verify-not-rewrite). WoWMeta stays untouched under the
  standing 07-31 review hold as well as the no-regenerate rule.
- **The rDPS split held for the third night running.** CI's `wcl-fetch/evidence.json`
  (2026-08-07T11:27:10Z) verdict was `rdps-broken` — `characterRankings(metric: rdps)` on
  encounter 3176 still 200s with a bare "Internal server error" while OAuth and GraphQL are
  healthy. From this residential IP the **HTML statistics table served rDPS on every cut**:
  21 fetches, all HTTP 200, **0 unmatched roster rows anywhere**. `rdps-broken` remains an
  API-transport fact, not a claim that rDPS is unavailable.
- **Transport unchanged:** curl only, with the XHR + browser-UA + Referer header set. Not
  re-derived; see the 08-06 entry.
- **127 metric rows + 27 ptrDummy specs applied, asOf → 2026-08-07:**
  · zone 46 Mythic raid (5/20/p3): DPS 27 / 310,093 parses · tank 6 / 44,340 · HPS 7 / 76,845
    · **healer-DPS 7 / 76,845**
  · zone 47 M+ (10/5/p1): DPS 27 / 3,062,512 · tank 6 / 1,033,136 · HPS 7 / 1,030,993
  · zone 56 PTR M+ (10/5/p1): DPS 27 / 5,939 · tank 6 / 1,980 · HPS 7 / 1,981
  · zone 52 Dummy Dome: 1T 27 specs / 1,733 parses · 2T 23 / 275 · 3T 19 / 83 · 5T 27 / 1,234
- ⚠ **`Median DPS (Mythic, healer)` had silently fallen a day behind** — it sat at 2026-08-05
  because the 08-06 local run fetched only three of zone 46's four cuts. It is a real tracked
  series (rDPS-family despite the name — see docs/audit-2026-07-25-premerge.md row 2) and it is
  inside `wcl-live-raid`'s `^Median .*\(Mythic` pattern, so it was hidden by coverage dating
  rather than alarmed on. **Zone 46 is FOUR cuts, not three.** Re-verified genuinely distinct
  from the HPS cut before merging: HPS 161k–186k vs healer-DPS 5.1k–33.1k, on identical parse
  counts — which is exactly what makes an accidental same-column merge easy to miss.
- **Value-move check (the guard CI's anomaly gate would have applied): 0 moves >50%.** Live
  cuts max |Δ| 0.27–2.08%, median 0.12–0.64%, on parse counts drifting −7% (raid, the 14-day
  rolling window) and ~−1% (M+). PTR M+ max 4.19%, median ~1% on ~5,900 parses. Dummy Dome
  largest were Feral 5T −15.4% and Fury 1T +12.8% — far calmer than 08-06's −42.9% on the 3T
  cut, whose population grew 79 → 83 parses.
- **Zone-52 duplicate-row gotcha did NOT apply again** — raw row count equalled deduped count
  on all four dummies (27/23/19/27). Deduped by (class, spec); never blind-halve.
- **Registry snapshots** bumped to 2026-08-07 for zones 46 / 47 / 56 / 52; **zone 54 left at
  2026-07-28** (empty upstream — the staleness stays visible).
- `npm test` **332 pass / 0 fail**; `npm run build` OK (1226.9 KB); `node src/snapshot.mjs`
  written, then rebuilt (step-6 ordering). `check-refresh --manifest` failed on exactly one
  line — the **stale gitignored `wcl-fetch/evidence.json` from 2026-08-03**, the same
  local-hygiene leftover as 08-06 (`.gitignore:11`); with it moved aside the gate exits **0**.
  Manifest deliberately NOT rewritten (partial run — local-run skill step 3).

## 2026-08-06 (nightly CI, Opus 5 — single-shot)
- **Two real movers this run: MYTHICSTATS finally rolled to period 1075, and SimC shipped a
  new nightly.** Everything else re-fetched live and reproduced its stored values, which is
  the honest reading rather than a stalled fetch — see each entry for why.
- **MYTHICSTATS: the half-landed period roll has COMPLETED.** The last two runs found
  `/period/latest` 302-ing to `/period/1075` while 1075 itself 404'd, and ingested 1074
  instead. 1075 now renders: *"Period 1075 MID1 (Lindormi's Guidance, Xal'atath's Bargain:
  Pulsar, Tyrannical, Fortified, Xal'atath's Guile)"*, top 2000 keys / 10000 characters
  (6313 unique) / 19.8 avg key, flagged **"just started and still in progress"**. **40/40
  roster specs** parsed from the "Spec representation in top keys" section — the four 1074
  absences (Blood DK, Vengeance DH, Resto Druid, Prot Paladin) are all back — 0 unmatched,
  all 40 values new. Fetched via r.jina.ai (the site is JS-heavy). Alt labels stay
  hyphenated (`beast-mastery hunter`, `unholy death-knight`); normalise before matching.
- **SimC: NEW nightly.** Header `12.0.7.68974 Live (hotfix 2026-08-06/68974, git build HEAD
  c5b695436c)`; previous run had hotfix 2026-08-03 / HEAD f4719d79e8. 26/26 DPS-roster specs
  re-parsed from the plain-text `DPS Ranking` block (best hero/talent variant per spec). All
  26 values moved and **every move is sub-0.15%** — largest is Retribution Paladin 112,288 →
  112,146 — i.e. iteration noise on a rebuilt nightly with no reordering of the field. Last
  run's Devourer +10.5% jump therefore stands and was not re-derived. Augmentation absent by
  design.
- **MURLOK — parse fix worth pinning, it silently lost 5 specs.** Splitting on the literal
  `<a class="vi-box meta-item ` returns only **35** rows because murlok emits **both**
  attribute orders: `<a class="vi-box meta-item …">` AND `<a href="/mage/frost/m+"
  class="vi-box meta-item …">`. Marksmanship Hunter, Fire Mage, Frost Mage, Protection
  Paladin and Destruction Warlock were the casualties, and `apply-metrics` would have
  upserted the other 35 while leaving those five carrying a stale `asOf` — a silently mixed
  cut that passes every gate (floor is 25). **Split on `class="vi-box meta-item ` instead**;
  the correct per-page item counts are **27 / 7 / 6**, and a short count is the tell.
  40/40 landed, 27 values moved (all DPS, max +0.67%).
- **Archon** — all four numeric series re-read from `__NEXT_DATA__`
  `specRankingsSection.table.data[]` (never `tierList`): 33 × "95th pct DPS (Mythic)", 7 ×
  HPS, 40 × "M+ score (95th pct)", 80 × Popularity = **160 rows, 0 unmatched, 0 values
  moved**. That is correct, not a stall: `page.lastUpdated` still reads
  **2026-08-05T12:00:00Z** at 12:49Z, so their daily 12:00Z cut had not yet published for
  08-06 and this is the same upstream data the last run read. Max relative move across all
  160 rows: 0.0% (checked, not assumed).
- **WoWMeta** — JSON API only (never the stale HTML prerender). 44 blocks →
  whitelist `categoryType ∈ {dps,hps,tank}` + `sortField lowerBound` + `keyRange undefined`
  = 27 + 7 + 6 = **40 rows**, class/spec byte-identical to the roster. **0 of 40 values
  moved at the stored 2-decimal precision.** ⚠ **Round to 2 dp, not to integer** — a naive
  `round()` reports all 40 as "changed" (394.32 → 394) and would rewrite the file for
  nothing. `snapshotDate` still **2026-08-05**, so recorded **`partial`**: the source's own
  date did not advance, and `asOf` is the source's date, never ours.
- **Bloodmallet** 26/26, `simc_settings.tier == "MID1"` confirmed on every chart, **0 target
  values moved** — every chart's own `timestamp` is still 2026-07-08 02:52–02:55 (Elemental
  Shaman 2026-07-15 02:25), i.e. nothing has been re-simmed upstream; only our verification
  date advanced. Augmentation returns `{status: "error"}` by design.
- **Robydoby (best-effort, outside the contract): VERIFIED, NOT re-ingested — no new week.**
  26 tabs mapped from the htmlview `items.push` blocks; newest **Mythic** week is still
  **24/7** (Sszorak #5 gid=16354462, Twin Fangs #6 gid=1886150557). Both CSVs re-fetched
  with `curl -sL` (the export URL 307s) and re-parsed with a **quote-aware** reader locating
  the block by `lastIndexOf('Class')` in the header row (index **18** this week): **24
  in-roster DPS specs, 0 value diffs**, so nothing merged and `asOf` stays 2026-07-24. The
  12 tank/healer rows the DPS sheet carries are tank-DPS and correctly not ingested.
- **WCL is evidence-only on the runner; nothing was fetched from warcraftlogs.com by any
  means.** `wcl-fetch/evidence.json` (this run's, 2026-08-06T12:28:34Z) verdict
  **`rdps-broken`** — `characterRankings(metric: rdps)` on encounter 3176 returns HTTP 200
  with a bare "Internal server error" and 0 rankings while OAuth + GraphQL transport both
  report ok (3600/h, 1 point). The five rDPS/normalized cuts recorded `unreachable`, stored
  rows untouched. The three frozen-recipe **raw-DPS** series landed via the deterministic
  step: dummy **102 rows** (1T 2000 / 2T 488 / 3T 228 / 5T 2000 ranked players, complete
  pagination), Venomous Abyss pooled **27** (Coiled Altar + Ula'tek `ok` with 0 players —
  between windows), M+ keys pooled **27** across all 8 S2 PTR dungeons.
- ⚠ **`wcl-ptr-raid` (zone 54) breaches `maxAgeDays` 10 TOMORROW (2026-08-07)** — stored at
  2026-07-28, and the last residential run confirmed the zone itself returns the
  valid-but-empty fragment at both Heroic and Mythic. The Venomous Abyss opens 08-18/19; a
  new testing window is the only thing that clears it. The heartbeat firing is correct
  visibility, not a fixable miss.

## 2026-08-06 (LOCAL run, Opus 5 — scheduled residential catch-up, ~14:3xZ, after the 12:49Z nightly)
- **Scope: residential-only. The five rDPS cuts the nightly recorded `unreachable` were all
  re-fetched and landed; nothing CI already refreshed was regenerated.** Archon, Murlok,
  Mythicstats, SimC, Bloodmallet, WoWMeta and every tier list were left exactly as the
  nightly produced them (verify-not-rewrite — independently regenerating them is what made
  the 07-30/07-31 pushes unmergeable).
- **The rDPS split held again, and this is the whole reason the local run exists.** The
  nightly's `wcl-fetch/evidence.json` verdict was `rdps-broken` (`characterRankings(metric:
  rdps)` on encounter 3176 = HTTP 200 + bare "Internal server error"), so CI froze all five
  cuts at 2026-08-05. From this residential IP the **HTML statistics table served rDPS
  fine on every cut** — 17 fetches, all HTTP 200, **0 unmatched roster rows anywhere**.
  "rdps-broken" remains an API-transport fact, not a statement that rDPS is unavailable.
- **Transport, unchanged and worth not re-deriving:** `curl` only. Node's global `fetch()`
  is still Cloudflare-403'd on warcraftlogs.com even residentially; curl with the identical
  XHR + browser-UA + Referer headers passes clean.
- **120 metric rows + 27 ptrDummy specs applied, asOf → 2026-08-06:**
  · zone 46 Mythic raid (5/20/p3): DPS 27 / 334,385 parses · tank 6 / 47,838 · HPS 7 / 83,189
  · zone 47 M+ (10/5/p1): DPS 27 / 3,084,131 · tank 6 / 1,040,250 · HPS 7 / 1,037,955
  · zone 56 PTR M+ (10/5/p1): DPS 27 / 5,894 · tank 6 / 1,965 · HPS 7 / 1,966
  · zone 52 Dummy Dome: 1T 27 specs / 1,563 parses · 2T 21 / 263 · 3T 19 / 79 · 5T 27 / 1,221
- **Value-move check (the guard CI's anomaly gate would have applied): 0 moves >50%.** The
  live series are the honest tell that the parse is right — max |Δ| 0.2–1.0% and median
  |Δ| 0.1–0.3% across all six live cuts, on parse counts that drifted −6% (raid, the 14-day
  rolling window) and ~0% (M+). PTR M+ moved more (max 10.9%, median ~1%) on its ~5,900-parse
  population, which is expected at that n, not a misparse.
- ⚠ **Dummy Dome 3T is very thin and it moved a raid forecast band.** 79 parses across 19
  specs (~4 each) produced the run's two largest moves — Assassination Rogue −42.9% and
  Marksmanship Hunter −26.8% — and Marksmanship's dummy composite fell rank 2→5 (score
  87→62), which alone took its **raid projection A+/84 → A/70**. The cell is tagged
  `confidence: low` and the composite is coverage-floored, so the machinery disclosed it
  correctly; recording it here because a band change off ~4 parses per spec is worth a
  human eye, not because anything is wrong.
- **Zone-52 duplicate-row gotcha did NOT apply this run** — raw row count equalled deduped
  count on all four dummies (27/21/19/27). Keep deduping by (class, spec); never blind-halve.
- **Registry snapshots** bumped to 2026-08-06 for zones 46 / 47 / 56 / 52; **zone 54 left at
  2026-07-28** (see ptr-watch log — empty upstream, so the staleness stays visible).
- `npm test` **332 pass / 0 fail**; `npm run build` OK (1130.0 KB); `node src/snapshot.mjs`
  written, then rebuilt (step-6 ordering). `check-refresh --manifest` — see the note in the
  run report: its single failure is a **stale gitignored `wcl-fetch/evidence.json` from
  2026-08-03**, the exact local-hygiene case `.gitignore:20-24` documents; with that
  leftover moved aside the gate exits **0**. Manifest deliberately NOT rewritten (partial
  run — local-run skill step 3).

## 2026-08-15 (third run of the day — nightly, headless)

- **Bloodmallet has begun its MID2 roll-over and nothing was merged.** 14 of 27 DPS specs
  return charts, **all `simc_settings.tier` = MID2, all timestamped 2026-08-15**; the other
  13 return the "No standard chart" body after 3 retries (Augmentation by design, 12 simply
  not re-simmed). Stored pool is MID1 @ 2026-07-08. This is exactly the mixed-tier case the
  08-15 gate exists for — adopt wholesale or not at all — so the family stays 38 days stale
  and `check-refresh --age` reds on it alone. **A wholesale adoption will need a human
  `value_move_ack`:** MID2 runs ~1.5–2.5× MID1 per spec.
- **Archon numbers: label moved, data did not.** All six pages re-stamped
  `lastUpdated` 2026-08-15T12:00:00Z, yet all **160 values and all parse counts are
  byte-identical** to the stored 08-14/08-10 cuts. Merging on the label would re-date
  unchanged numbers daily — the precise failure mode the bloodmallet/wowmeta `asOf` rule
  forbids — so all four archon numeric rows are `partial`. Consequence to expect:
  `archon-mplus-score` and `archon-popularity` sit at exactly 5d/5d and go red on the
  heartbeat tomorrow unless Archon re-aggregates. S1 content is dead, so a freeze is the
  honest reading.
- **WoWMeta** frozen and proven so: `snapshotDate` 2026-08-11, rankings file diffed anyway
  (40/40 byte-identical) and its `Last-Modified` header reads *Tue, 11 Aug 2026 15:25:05 GMT*.
- **SimC**: `MID1_Raid.txt` is a live in-progress log (272 B, no ranking block) headed
  **12.1.0.69299 / git build b642585cbf** — the Season-2 re-sim is running now. The HTML
  report is still 12.0.7.68974, build **678e66d384**, timestamp 2026-08-08 07:28 — unchanged
  hash, unchanged parse, nothing merged. Expect a large legitimate move once 69299 publishes.
- **Murlok** 40/40 reproduced exactly (Guardian 4268 / Brewmaster 4038 / Blood DK 3990);
  pages still self-label "Midnight Season 1" while the body says Patch 12.1.
- **Mythicstats** period **1075 MID1**, section-bounded parse = 34 rows (a whole-page scan
  returns 59), sum 100.3 with role subtotals 60.2 / 20.0 / 20.1 → the SHARE series, not the
  `/meta` presence column. All values identical to stored.
- **Robydoby** (best-effort, outside the contract): newest Mythic week is still **24/7**
  (Sszorak + Twin Fangs tabs); 24 DPS + 7 healer specs re-parsed with the quote-aware reader
  and the `lastIndexOf('Class')` header locate (col 18 this week) — 31 rows, all identical to
  stored, nothing merged.
- WCL is evidence-only on this runner: verdict `rdps-broken`, the three `*-raw` keys landed
  pre-agent (102 / 27 / 27 rows), the five rDPS-family cuts stay frozen and untouched.
