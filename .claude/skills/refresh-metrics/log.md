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
