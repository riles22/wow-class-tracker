# refresh-metrics run log

Keep the newest ~20 entries. Prune only in a local or interactive run, and first move into
SKILL.md any lesson that lives only in the entries being dropped: the nightly publishes data/,
dist/ and these logs but never SKILL.md, so a nightly prune can delete a rule but cannot save
it. Pruned 2026-08-15 (these four logs held 64-78 entries each, and none had ever been pruned):
watch-creators had reached 270KB, over the Read tool's 262,144-byte gate, so a bare Read of it
returned NOTHING. Pruned again: refresh-metrics and watch-creators by the 2026-09-30
nightly, ptr-watch and refresh-tiers on 2026-10-06.
check-skill-logs.mjs warns, and the nightly digest names the log, once one passes 200,000
bytes in a Windows checkout.

This file holds NO machine state. The seen-set moved to structured data on 2026-08-08
(pending-transcripts.json seen[]/skipped[]/videos[] plus take urls) precisely because
regexing ids out of this prose absorbed 231 ordinary English words into a 950-entry set;
parse counts are logged "for the record" behind no gate. It is narrative memory, and it is
prunable. Durable RULES belong in SKILL.md, not here — the 2026-08-15 prune had to promote
~31KB of parser traps out of the prune range first, because they existed nowhere else.

Entries are sorted NEWEST FIRST by date. Two forms are in use ("- <date>" and "## <date>"),
they interleave, and refresh-tiers was chronologically scrambled before this prune — so sort
by parsed DATE, never by position. Never cite this file from anywhere else, by line NUMBER
or by phrase: a prune deletes both. On 2026-10-06 three files still pointed at refresh-tiers
entries pruned weeks earlier. A rule other files need goes in SKILL.md; when an entry's
history matters, cite the commit that added it.

## 2026-10-08 (nightly, ~17:40 UTC) — Murlok landed (10-08); SimC new run, ≤0.1% noise; others flat

- Murlok + Mythicstats: applied metrics-fetch/updates.json only (80 rows; Murlok <time> 2026-10-08, Mythicstats period 1084, sum 100.1, 0 retired). check-stable-metrics passes.
- SimC MID2_Raid.txt: HEAD db768b52b4 (was e3fa778a86), same hotfix 2026-10-07/69933; 24 specs, all moved ≤0.1%; merged at 2026-10-07.
- Bloodmallet: 24 charts MID2, all dated 2026-10-07, identical to stored; Balance / Augmentation / Devastation error body 3/3. 12.1.5 hold not engaged.
- WoWMeta: snapshotDate 2026-09-15, rankings Last-Modified 2026-10-06, 40/40 identical; partial.
- WCL (receipt only): raid partial 291 rows (2 invalid: Feral 3421, Demonology 3429), M+ success 320. Archon walled.

## 2026-10-07 (nightly re-run, ~17:35 UTC) — SimC re-sim merged (24); Mythicstats 1084 landed (80 via collector); others flat

- **SimC — success, merged 24.** MID2_Raid.txt HEAD e3fa778a86 (hotfix 2026-10-07; was cafc27227e / 10-03). 23 of 24 moved; Devourer +5.0% (10-06 buffs), Enhancement +4.2%, the rest within ±0.1%. asOf 2026-10-07.
- **Mythicstats — success.** Collector: period 1084 now HTTP 200 (the morning's 404 cleared), 40 rows, sum 100.2, 0 retired. Murlok — partial, source date 10-03 (collector applied, values unchanged dates).
- **Bloodmallet — success, nothing merged.** 24 charts MID2, ptr "0", all dated 2026-10-07, byte-identical to stored; Balance/Augmentation/Devastation error 3/3.
- **WoWMeta — partial.** snapshotDate 2026-09-15; 40/40 identical.
- WCL (collector): raid partial 289 rows (2 invalid: Feral 3421, Demonology 3429; 29 sparse); M+ success 320. Archon walled (6 numeric rows blocked).

## 2026-10-07 (nightly) — Bloodmallet weekly re-sim merged (24 charts, 2026-10-07); everything else flat or stale upstream

- **Bloodmallet — success.** 24 charts MID2, ptr "0", all timestamped 2026-10-07 (Subtlety returned after erroring since 10-03); merged all 24, max move 4.7% (Devourer and Enhancement up after the Oct 6 buffs). Balance, Augmentation, Devastation still error 3/3. 12.1.5 hold not armed (LABEL_FLIP_DUE 2026-10-13).
- **SimC — partial.** MID2_Raid.txt same HEAD cafc27227e (hotfix 2026-10-03); 24 specs identical; nothing merged.
- **WoWMeta — partial.** snapshotDate 2026-09-15; rankings Last-Modified 2026-10-06 but all 40 values identical.
- **Murlok — partial** via collector (40 rows, source date 2026-10-03). **Mythicstats — unreachable** (collector pending: /period/1084 404; series preserved). check-stable-metrics passes.
- **WCL** from the trusted receipt: leaderboard raid partial (288 rows, 29 sparse, 3 invalid), M+ success (320); legacy aggregates unreachable. check-wcl-metrics passes. Archon walled (all six numeric rows blocked).

## 2026-10-06 (nightly, THIRD run of the day) — every numeric feed verified, nothing moved; WCL M+ now `success` (320 rows), raid `partial` (287)

- WCL (collector, attemptedAt 22:36:41Z): raid partial "287 median rows; 30 empty/sparse cuts; 3 failed/unattempted cuts"; M+ success "320 median rows; 0 empty/sparse; 0 failed". Legacy wcl-live-* unreachable as recorded. check-wcl-metrics passes.
- Murlok (source date 2026-10-03) + Mythicstats (period 1083, 38 rows, sum 100.2) via the trusted collector only; 78 metrics applied; check-stable-metrics passes.
- WoWMeta: snapshotDate still 2026-09-15; 40/40 lowerBound identical to stored. SimC MID2_Raid.txt HEAD cafc27227e (hotfix 2026-10-03), 24 specs identical. Bloodmallet 23/27 charts MID2, ptr "0", all 2026-09-30, byte-identical; Balance, Augmentation, Devastation, Subtlety error 3/3. Archon walled.

## 2026-10-06 (nightly, SECOND run of the day) — **every numeric feed verified and NOTHING moved**: SimC flat on an unchanged git HEAD, WoWMeta's moved values already merged by the 17:27 run, Bloodmallet 23/27 byte-identical at 2026-09-30, Murlok + Mythicstats confirmed via the trusted collector, WCL raid **and** M+ `partial`; Archon walled day 42

- **Murlok — `partial`.** Verified by the trusted pre-agent `fetch-stable-metrics.mjs` step and merged ONLY via `node src/apply-metrics.mjs metrics-fetch/updates.json`; no second parser was written. Receipt (checkedAt 2026-10-06T21:49:39Z): status `success`, three meta pages HTTP 200 (71,309 / 42,298 / 40,902 B, one attempt each), **40 rows** (27 DPS + 7 healer + 6 tank), `omittedSpecs: []`, `dateBasis: source-time-datetime`. `partial` because `asOf` is the source's own `<time datetime>` — **2026-10-03** (pages stamp 10:10:23Z / 10:13:12Z / 10:11:13Z) — three days before the run, so the stored coverage date cannot be within one day of it. All 40 values and all 40 dates identical to stored: an unchanged same-day recheck that advanced no source-owned date. `check-stable-metrics.mjs` passes.
- **Mythicstats — `success`.** Same trusted collector, same single merge path. `/period/latest` → `/period/1083` HTTP 200 (196,746 B, one attempt), **38 rows** (25 DPS + 7 healer + 6 tank) bound to the "Spec representation in top keys" section. The shape check that tells the two columns apart holds: role subtotals Ranged 27.6 / Melee 32.5 / Tank 20.1 / Healer 20.0 against the page's own printed 27.6 / 32.4 / 20.0 / 20.0, sum **100.2%**. The page publishes no timestamp → `sourceAsOf: null`, `dateBasis: observed-undated-source`; identical values keep their existing `asOf`, so the merged rows still carry 2026-09-29 / 2026-10-01 / 2026-10-06 and **not one date was advanced**. Two specs omitted by the chart — **Mage|Fire and Warlock|Affliction** — and NEITHER has a stored row, so nothing is held, no zero was fabricated, and `retiredSpecs` is empty.
- **WoWMeta — `partial`, frozen an ELEVENTH week.** Two plain curl calls, no headers, no proxy, never the HTML prerender: `manifest.json` 200 (353 B) → `snapshotDate` **2026-09-15** (completedAt 2026-09-15T14:25:48Z), **pinned 21 days**; `rankings/midnight/mplus/all/0.json` 200 (161,794 B) with `Last-Modified: Tue, 06 Oct 2026 09:16:55 GMT`. 44 blocks; whitelisting `categoryType ∈ {dps,hps,tank}` **+** `sortField === "lowerBound"` **+** `keyRange === undefined` selects exactly 3 blocks / 27+7+6 = **40 rows**, all 40 `classSpec` keys byte-identical to the roster. The 2026-08-04 incident shape was checked, not assumed — and this time there is nothing to ingest, because **this run's earlier 17:27 nightly already merged that movement** at the source's own 2026-09-15 date; all 40 `lowerBound` values now fetched match stored at the stored **1-decimal** precision. Letters were not read and must not be.
- **Bloodmallet — `partial`, 23 of 27, nothing merged.** All 27 DPS specs requested at `talent_target_scaling/castingpatchwerk`, up to 3 attempts each. **FOUR** returned the 76-byte `{"status": "error"}` body on 3/3 attempts: Balance Druid, Augmentation Evoker, Devastation Evoker and Subtlety Rogue — the same four as the 10-03 and 10-04 runs, so Subtlety's absence is NOT new tonight and its stored **2026-09-23** chart stands unrefreshed. All 23 charts read `simc_settings.tier` **MID2** and `simc_settings.ptr` the **STRING "0"** (compared explicitly, never truthily), and every `asOf` was taken from the chart's own `timestamp` — all 23 read **2026-09-30**, never the run date. Merged NOTHING: all 23 are byte-identical to stored across all six target counts. Pool stays 24 profiles (floor 15); coverage date 2026-09-30, 6 days, inside `maxAgeDays: 8`. ⚠️ **The 12.1.5 wholesale-adoption hold does NOT fire tonight**: `PHASES.livePatch` is null and today is before **`LABEL_FLIP_DUE = 2026-10-13`** (now set — it was null through 10-06's first run), and nothing in this run's evidence says 12.1.5 is live. From 10-13 the rule arms: re-sims may then be adopted only when EVERY chart's own date is on or after the release date, otherwise hold the whole pool and record `partial` with the date used and the split.
- **SimulationCraft — `partial`, 24 specs, nothing merged.** `reports/MID2_Raid.txt` HTTP 200, **1,447,156 B**, and it DOES carry a `DPS Ranking:` block, so the HTML fallback was not needed; `MID1_Raid.txt` deliberately not read (in-progress stub since 09-01, not a fallback). Era-verified off the HEADER build string, not the visible version: `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69933 Live (hotfix 2026-10-03/69933, git build HEAD cafc27227e, no-networking)`. 46 profile rows parsed, leading `Raid` aggregate skipped, mapped by **LONGEST-PREFIX with hyphens allowed**; the 7 unmapped names are exactly the tank profiles (Protection Paladin ×2 builds, Protection Warrior, Vengeance, Brewmaster, both Blood builds), correctly excluded from this DPS-only series. Best hero-variant per spec → **24** specs. **The git HEAD is unchanged at `cafc27227e` and all 24 values are identical to stored** — the honest explanation for a flat parse, said plainly. Coverage date 2026-10-03, 3 days, inside `maxAgeDays: 10`.
- **WCL — both leaderboard brackets `partial`; both legacy aggregates `unreachable`.** No agent-side WCL request of any kind; this agent holds no credentials. `wcl-fetch/evidence.json` (attemptedAt 2026-10-06T21:47:19Z; OAuth ok, GraphQL ok, 138 queries, 1 rate-limit point, abortReason null): **raid** `partial` — "287 median rows; 30 empty/sparse cuts; 3 failed/unattempted cuts; minimum 200 rows", pinned zone 53 / partition 1 / difficulty 5 / size 20, **no `supersededBy`** so no partition switch was attempted; **M+** `partial` — "317 median rows; 0 empty/sparse cuts; 3 failed/unattempted cuts; minimum 280 rows", zone 55 / partition 1 / difficulty 10 / size 5 / bracket 9 = key +10. Note the M+ bracket was `success` last night and is `partial` tonight, and that does NOT carry forward: its three `invalid` cuts all share one cause, a ranking run timestamp later than the collector's own observation instant (Assassination Rogue, Restoration Shaman, Unholy DK, each on one dungeon), and those three keep their prior observations byte-unchanged. `legacy["wcl-live-raid"/"wcl-live-mplus"]` stay `unreachable` — no verified sanctioned aggregate endpoint; `rdps` is **FFXIV-only** and its rejection is not a WoW outage. `node src/check-wcl-metrics.mjs --manifest data/run-manifest.json` passes. Closed PTR zones 52/54/56/57 untouched; `data/wcl-coverage.json` is the collector's sanitized receipt and was not edited.
- **Archon — all six numeric families `blocked`, day 42.** Site-wide human-verification wall; see the refresh-tiers entry for the two independent measurements. The 32 Mythic DPS, 7 Mythic HPS, 33 Heroic DPS, 7 Heroic HPS, 40 M+ score and 79 Popularity rows keep their values, parses and 2026-08-24/25 dates. No shape check was needed because nothing was merged, and the 2026-08-21 per-boss-survivability dead end was NOT re-run.
- **Robydoby** not refetched: zone-54 PTR sheets belong to the closed cycle, and the source is deliberately outside `required-sources.json`.

## 2026-10-06 (nightly) — SimC re-simmed on a new git HEAD (24 rows, max move **−0.083%**); **WoWMeta's rankings file moved all 40 values under a manifest pinned 21 days** (the 08-04 shape, merged at the source's own 2026-09-15 → `partial`); Murlok and Mythicstats verified via the trusted collector; Bloodmallet byte-identical at 2026-09-30; WCL M+ clean / raid `partial`; Archon walled day 42

- **Murlok + Mythicstats — collector only, never re-parsed here.** `metrics-fetch/evidence.json` (checkedAt 2026-10-06T16:57:02Z) reports both `success`; merged with a single `node src/apply-metrics.mjs metrics-fetch/updates.json` (78 rows: murlok 40, mythicstats 38) and `node src/check-stable-metrics.mjs` passes. Murlok: 3 pages HTTP 200, roleCounts 27/7/6, `sourceAsOf` **2026-10-03** from the page's own `<time datetime>` (dateBasis `source-time-datetime`), i.e. **unchanged and now 3 days old** — so the row is `partial` tonight where it was `success` on 10-04 at 1 day; the gate's success bound is the data's date, not the fetch. Mythicstats: `/period/latest` resolved to **period 1083**, 38 rows, sum 100.2 with role totals 27.6/32.5/20.1/20.0, `sourceAsOf: null` / dateBasis `observed-undated-source` (the page prints no timestamp and none was invented). **Warlock Affliction was RETIRED** by the collector under the 0.5-point rule (its stored share was 0) and `apply-metrics` removed that one row; Mage Fire was omitted upstream again and has no stored row to hold. Coverage date 2026-10-06 → `success`.
- **WoWMeta — `partial`, and it is the pinned-manifest shape again, not a freeze.** Two plain `curl` calls to the JSON API, no headers, no proxy, never the HTML prerender. `manifest.json` 200 with `snapshotDate` **2026-09-15** (`completedAt` 2026-09-15T14:25:48Z) — pinned for 21 days — while `rankings/midnight/mplus/all/0.json` 200, 161,794 B, carries **`Last-Modified: Tue, 06 Oct 2026 09:16:55 GMT`** and **all 40 `lowerBound` values and all 40 `numberOfCharacters` had changed**. This is exactly the 2026-08-04 case the skill documents: the manifest step and the rankings step run independently, so a pinned `snapshotDate` is not evidence the data is frozen. Selected by WHITELIST — `categoryType ∈ {dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined` → 6 + 27 + 7 = **40 rows**, with `melee`/`ranged` excluded so no spec double-counts; 44 blocks total, 0 unknown roster keys. Merged at the SOURCE's own lagging date 2026-09-15 at the stored 1-dp precision, `n = numberOfCharacters`. Largest move is well inside `maxValueMovePct` 0.6 (every spec within ~±1.5%; the biggest absolute is Guardian Druid 368 → 373 on n 88,773 → 96,577). Because the coverage date correctly does NOT move, the row stays `partial` and the standing 21-day red is honest — the owner note's "nothing to merge" clause no longer describes it, though: there WAS something to merge, under an old date. Raid endpoint deliberately not ingested (its `lowerBound` is DPS throughput, a different quantity).
- **SimulationCraft — `success`.** ⚠️ **Host note worth keeping: `https://downloads.simulationcraft.org/nightly/reports/MID2_Raid.txt` failed with curl exit 60 (TLS) and its `http://` form 404s. The registry host works** — `https://www.simulationcraft.org/reports/MID2_Raid.txt`, HTTP/2 200, **1,447,156 B**, `Last-Modified: Tue, 06 Oct 2026 07:30:49 GMT` — and it HAS a complete `DPS Ranking:` block, so the HTML fallback and its burst/DTPS-chart inflation trap were not needed. MID1_Raid.txt not read; it is a stub by design. Era-verified off the HEADER build string: `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69933 Live (hotfix 2026-10-03/69933, git build HEAD cafc27227e, no-networking)` — live 12.1.0, no 12.1.5 anywhere. The freshness detector moved: **git HEAD 2d54d825c3 → cafc27227e on an UNCHANGED WoW hotfix build**, which is the honest reason the values moved. 46 ranking lines, the `Raid` aggregate row skipped, mapped by LONGEST-PREFIX with a hyphen allowed to the best hero variant per DPS spec → **24 of 27 DPS specs**; the 7 unmapped names are all tanks (Prot Paladin ×2, Prot Warrior, Brewmaster, Vengeance-Annihilator, Blood DK ×2) and the 3 absent DPS are Balance Druid, Augmentation and Devastation Evoker — the same set Bloodmallet lacks. All 24 values moved and every move is Monte Carlo noise: the largest is Devourer DH 264,631 → 264,412, **−0.083%**, and Monk Windwalker −0.060%, against `maxValueMovePct` 0.6 — nothing held back, no `value_move_ack` needed. `asOf` is the report's OWN hotfix date **2026-10-03** (unchanged, as the previous runs recorded it), not today, so the coverage date is 3 days old and the row is `partial`-eligible by date even though the fetch and parse were complete.
- **Bloodmallet — `partial`, upstream has not re-simmed since 2026-09-30.** All 27 DPS specs requested at `talent_target_scaling/castingpatchwerk`, snake_case class names. **23 returned charts and 4 returned the 76-byte `{"status": "error", "message": "No standard chart with these values found."}` body** — Balance Druid, Augmentation Evoker, Devastation Evoker and **Subtlety Rogue** (which has been erroring since 2026-10-03, per this log’s own entry for that date — not new tonight). Each of the four was retried **3×** at 2 s spacing and errored on 12/12 attempts while the other 23 succeeded in the same minutes, so the endpoint was demonstrably healthy: this is upstream absence, not transport. `simc_settings.ptr` compared explicitly against the string `"0"`; tier read off each chart (`simc_settings.tier`, never hard-coded) and all 23 read **MID2**, matching the stored pool, so the uniformity gate sees no mix. Targets taken from `data[MID2][count]`, which is already best-build. **All 23 charts are byte-identical to stored** — same per-chart `timestamp` date 2026-09-30, max relative target move **0.00%** — so the merge was a no-op and the coverage date stays 2026-09-30 (6 days, inside the 8-day threshold). Subtlety's stored profile (2026-09-23, MID2) is simply retained, which is what absence means; the pool stays 24 rows and tier-uniform. **12.1.5 hold rule checked and found NOT to apply:** `PHASES.livePatch` is null, `LABEL_FLIP_DUE` is null, and nothing in this run's evidence says 12.1.5 is live (Blizzard dates it October 13), so the ordinary "merge current charts" branch is correct and no partial-re-sim hold was triggered.
- **Warcraft Logs — collector only, zero agent-side requests, recompute or edits.** `wcl-fetch/evidence.json` attemptedAt 2026-10-06T16:54:51Z, `verdict: partial`, oauth+graphql true, 16.57 of 3,600 hourly points, 138 queries in 126 s, abortReason null, `discoveryVerified: true` on both brackets, partition **1** on both — no `supersededBy`, so the dormant partition guard did not fire and the pinned partition stands. **`wcl-leaderboard-mplus` success**: 320 rows, 0 empty/sparse and 0 failed cuts, min 280. **`wcl-leaderboard-raid` partial**: 286 rows (min 200), 317 verified cuts, **31 empty/sparse cuts** (mostly Kith'ix-era encounters 3429/3492 and Fire Mage on 3421 at 0–9 samples, below the 10 minimum) and **3 `invalid` cuts** — Feral Druid on 3421 and Demonology Warlock on 3429 and 3492, all "Ranking amount must be positive". The row is recorded `partial` to match `evidence.brackets[key].status` exactly; the invalid cuts' prior observations are retained unchanged. `node src/check-wcl-metrics.mjs` and `--manifest` both pass; `data/wcl-coverage.json` was not touched. The two legacy rows `wcl-live-raid` / `wcl-live-mplus` are recorded `unreachable` verbatim from `evidence.legacy[key]`: there is still no verified sanctioned aggregate endpoint, `rdps` is FFXIV-only and is not a WoW outage test, and the new leaderboard series cannot green them.
- **Archon numerics — all six requirements `blocked`, day 42.** One bounded GET per representative page: HTTP 403, `challenge-platform`, **`__NEXT_DATA__` count 0** (asserted on the payload, never the status code). No `specRankingsSection` was reachable, so `archon-metrics`, `archon-hps`, `archon-heroic-dps`, `archon-heroic-hps`, `archon-mplus-score` and `archon-popularity` all keep their 2026-08-24/25 values and dates; the six rows are reported separately per the split-row rule so no single series hides behind another. The per-boss survivability dead end was NOT re-run (measured and closed 2026-08-21).
- **Robydoby not refetched, deliberately.** Its two sheets are the **closed 12.1 PTR cycle's** zone-54 percentiles; the retention rule keeps those stored rows as historical receipts rather than refreshing or reinterpreting them, and the source sits outside `required-sources.json` by design so its silence cannot redden a night.
- Merges this run: 78 stable-metric rows + 40 WoWMeta + 24 SimC + 23 Bloodmallet profiles (no-op) + 1 Mythicstats retirement, on top of the collector's pre-agent WCL merge. `npm run test:quiet` 696 tests / 627 pass / 0 fail / 69 skipped (Playwright absent, as the nightly expects), build 2,106.6 KB, snapshot written.

## 2026-10-04 (nightly) — SimC re-simmed on a new git HEAD (24 rows, max move **+0.057%**); Murlok and Mythicstats confirmed unchanged at their own 2026-10-03; Bloodmallet 23/27 still at 2026-09-30 (`partial`); WoWMeta frozen a **TENTH** week; WCL M+ bracket clean, raid `partial` on 2 invalid cuts; Archon walled day 40

**Murlok — `success`, 40 rows, nothing moved.** Verified by the trusted pre-agent
`fetch-stable-metrics.mjs` and merged ONLY via `node src/apply-metrics.mjs
metrics-fetch/updates.json` — no second agent-side parse. Receipt (`checkedAt
2026-10-04T15:31:30Z`): `status: success`, three meta pages HTTP 200 first attempt, roleCounts
**27 / 7 / 6**, `omittedSpecs` empty, `dateBasis: source-time-datetime`. The source-owned
`<time datetime>` date is **unchanged at 2026-10-03** (10:10:23Z / 10:11:13Z / 10:13:12Z) — a
same-day confirmation of unchanged fresh data, and it was NOT advanced to today. **0 of 40 values
moved.** Coverage 2026-10-03, one day old, inside the success bound.

**Mythicstats — `success`, 38 rows, same period 1083.** `/period/latest` → `/period/1083`, HTTP
200, 209,581 B. The SHARE column was confirmed rather than assumed: **sum 100.1** with role totals
Ranged 28.3 / Melee 31.9 / Tank 19.9 / Healer 20 against the page's printed 28.2 / 31.8 / 20 / 20
— the representation share series, not the `/meta` per-key-presence column. **Two specs omitted
upstream, Evoker Devastation and Mage Fire, and `retiredSpecs` is correctly EMPTY because neither
has a stored row left to retire** — no zero fabricated for either, and the drawer simply shows no
Mythicstats line. Undated source, so changed rows take the fetch date and identical rows keep
theirs: the family spans 2026-09-27 … 2026-10-03 and nothing was redated to today. Coverage
2026-10-03 (the 25th-freshest row). `node src/check-stable-metrics.mjs` → "Stable numeric feeds
match trusted collection evidence; failed sources and absent rows retained honestly."

**SimulationCraft — `success`.** `reports/MID2_Raid.txt` HTTP 200, **1,446,946 B**,
`Last-Modified: Sun, 04 Oct 2026 07:31:16 GMT`, and it HAS a complete `DPS Ranking:` block at line
60, so the `MID2_Raid.html` fallback and its burst/DTPS-chart inflation trap were not in play.
`MID1_Raid.txt` deliberately not read — it is a stub by design. Era-verified off the HEADER build
string, never a visible version: `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69933 Live
(hotfix 2026-10-03/69933, git build HEAD 2d54d825c3, no-networking)` — **live 12.1.0, no 12.1.5
anywhere in it**, which matters in the fortnight before 12.1.5 ships. git HEAD moved
**6c50c3c7b9 → 2d54d825c3** on an UNCHANGED WoW hotfix build: that SHA is the documented freshness
detector and the honest reason the values moved. 45 ranking lines, `Raid` aggregate skipped, mapped
by **LONGEST-PREFIX with a hyphen allowed** to best hero variant per DPS spec → **24 of 27**; the 7
unmapped names are all tanks (Prot Paladin ×2, Prot Warrior, Brewmaster, Vengeance-Annihilator,
Blood DK ×2) and correctly not ingested; the 3 absent DPS specs are Balance Druid, Augmentation
Evoker and Devastation Evoker, the same set Bloodmallet lacks. All 24 moved and all 24 are Monte
Carlo noise — **largest Rogue Subtlety 266,629 → 266,780, +0.057%** against `maxValueMovePct` 0.6,
so nothing held back and no `value_move_ack`. **`asOf` = the report's OWN hotfix date 2026-10-03**,
not the run date; it is one day old, so `success` is inside the bound. *(Parser note that still
holds: the ranking rows carry a `%` on the relative column — ` 225213 100.0%  Raid` — so a
`(\d+)\s+([\d.]+)\s+name` regex matches zero rows and reads exactly like a report with no block.)*

**Bloodmallet — `partial`, upstream has not re-simmed since 2026-09-30.** All 27 DPS specs
requested (`talent_target_scaling/castingpatchwerk`, up to 3 attempts each): **23 charts returned**,
and **four** give the 76-byte `{"status": "error", "message": "No standard chart with these values
found."}` body on every attempt — Balance Druid, Augmentation Evoker, Devastation Evoker and
**Subtlety Rogue**, the same persistent set as last night, retried rather than assumed absent.
`simc_settings.ptr` compared explicitly against the STRING `"0"` on every chart; `simc_settings.tier`
read off each chart (never hard-coded) and all 23 are **MID2**, matching the uniformly-MID2 stored
pool, so the tier gate is satisfied and no partial-tier mixing arises. `asOf` is each CHART's own
timestamp: **all 23 read 2026-09-30 and all 23 `targets` maps are byte-identical to stored**, so the
merge moved nothing. Coverage 2026-09-30, **four days old — inside `maxAgeDays: 8`, which is sized
to upstream's roughly weekly cadence, so this is the normal mid-week `partial` and no date was
touched to hide it.** Subtlety Rogue's stored **2026-09-23** profile is RETAINED unchanged, keeping
the stored pool at 24.
**12.1.5 hold does NOT apply tonight, checked rather than assumed:** `PHASES.livePatch` is null,
`LABEL_FLIP_DUE` is null, and Blizzard dates the patch **13 October NA / 14 October EU**, so the
patch is not live and nothing in this run's evidence says otherwise — current charts merge as
normal. Once that date passes, the wholesale rule arms: hold the whole pool until **every** chart is
dated on or after the release date.

**WoWMeta — `partial`, frozen a TENTH consecutive week.** JSON API only (never the HTML
prerender): `manifest.json` HTTP 200 with `snapshotDate 2026-09-15`, and
`rankings/midnight/mplus/all/0.json` HTTP 200, **162,488 B, 44 blocks**. Selected by **WHITELIST** —
`categoryType ∈ {dps, hps, tank}` AND `sortField === "lowerBound"` AND `keyRange === undefined` →
27 + 7 + 6 = **40 rows, 0 unmatched** `classSpec` names; the `melee`/`ranged` subsets excluded rather
than merely blacklisting `dungeon`. **The rankings file itself was diffed, not just the manifest
date** (the 08-04 pinned-manifest shape): all 40 `lowerBound` values and all 40
`numberOfCharacters` are identical to stored at the stored 1-decimal precision. Coverage stays
2026-09-15, **19 days old against `maxAgeDays: 8`** — the owner-accepted standing red, and the
heartbeat firing on it is the correct signal.

**Warcraft Logs — agent made NO request of any kind, no credentials held.**
- `wcl-leaderboard-mplus` **`success`**: evidence status `success`, **320 landed rows** (floor 280),
  zone 55 / partition 1 / difficulty 10 / size 5 at **bracket 9 = key +10**, **0** empty, sparse,
  failed or unattempted cuts across all eight dungeons. `supersededBy` null.
- `wcl-leaderboard-raid` **`partial`**, recorded from `evidence.brackets[...].status` verbatim:
  **287 landed rows** (floor 200), zone 53 / partition 1 / difficulty 5 / size 20, **31 sparse cuts**
  below the 10-entry floor and **2 invalid cuts — both Warlock Demonology, encounters 3429 and 3492,
  each "Ranking amount must be positive"**. Retention verified by hand: the stored raid family holds
  **288** rows, 287 observed 2026-10-04 and **exactly one retained — Warlock Demonology on Ula'tek,
  still at its 2026-10-02 observation** — which lines up with the invalid cut precisely.
  `supersededBy` null on both brackets, so the dormant partition guard did not fire and nothing was
  switched agent-side.
- The two legacy aggregates stay `unreachable` from `evidence.legacy[...]` verbatim; the leaderboard
  series is a different quantity (per-encounter top-100-ENTRY medians, entries may repeat
  characters, never pooled) and cannot green them. `node src/check-wcl-metrics.mjs --manifest
  data/run-manifest.json` → "WCL leaderboard metrics match trusted collection; historical and
  failed/sparse cuts retained exactly."

**Archon — all six numeric rows `blocked`, day 40.** Raid route HTTP 403 "Just a moment..."
(5,956 B, `__NEXT_DATA__` count **0**), M+ route the same (6,022 B); pre-agent source-health receipt
agrees (and records the M+ route as **HTTP 200** `human-verification`, the shape a status-only check
would read as success). No challenge solved or replayed. Every stored value, `n` and `asOf` left
exactly as it was: Mythic DPS/HPS and M+ score and Popularity at 2026-08-25, Heroic DPS/HPS at
2026-08-24. The six rows stay split so a single series cannot hide behind the others. **Per-boss
survivability was NOT attempted** — recorded dead end, four independent reasons, do not re-run.

**Robydoby — best-effort, outside the contract, nothing to merge.** `htmlview` HTTP 200, 54,677 B;
tab map parsed from the `items.push({name: … gid=N` blocks: **26 tabs**, newest **Mythic** week
still `24/7`, exactly where the stored 33 rows sit (31 @ 2026-07-24 + 2 @ 2026-07-16). That is the
closed 12.1 PTR cycle's final state, so no CSV export was pulled and nothing was merged or
re-stamped. No manifest row, by design.

## 2026-10-03 (nightly) — **Murlok RECOVERED** (40 rows at its own 2026-10-03, after last night's INVALID); SimC re-simmed on a new build, **Unholy DK −7.0%**; Mythicstats recalculated in-period, **Devastation Evoker retired**; Bloodmallet 23/27 with **Subtlety newly erroring**; WoWMeta frozen a NINTH week; Archon walled day 39

**Trusted collectors (the only input for these two families — no second parser was written).**
Receipt `metrics-fetch/evidence.json`, `checkedAt 2026-10-03T14:54:05.728Z`; merged ONLY via
`node src/apply-metrics.mjs metrics-fetch/updates.json` (78 metrics + 1 retire).
`node src/check-stable-metrics.mjs` passes.
- **Murlok `success` — a real recovery.** Last night the same collector reported the source
  INVALID (its page date had REGRESSED 10-01 → 09-29) and the row was `parse_error`. Tonight: all
  three meta pages HTTP 200 first attempt (71,309 / 42,298 / 40,902 B), role counts **27 / 7 / 6 =
  40**, 0 omitted specs, `dateBasis: source-time-datetime` off the page's own `<time datetime>`
  (10:10:23Z, 10:13:12Z, 10:11:13Z) → `sourceAsOf 2026-10-03`, a same-day coverage date.
  **previousAsOf 2026-10-01 → newAsOf 2026-10-03.** Name keeps "(ceiling)".
- **Mythicstats `success` — same period, but the values MOVED.** `/period/latest` → `/period/1083`
  (HTTP 200, 209,581 B), the third night on period 1083; unlike last night this is an **in-period
  recalculation**, not an unchanged recheck. Share-column checks reconcile: sum **100.1**, role
  totals Ranged 28.3 / Melee 31.9 / Tank 19.9 / Healer 20 against the page's own printed 28.2 /
  31.8 / 20 / 20 — the representation SHARE column, not the `/meta` per-key-presence figure.
  **31 rows took the fetch date 2026-10-03** because their values changed; the **7 unchanged rows
  keep their own older `asOf`** (5 at 10-01, one 09-29, one 09-27) exactly as the undated-source
  rule requires — no row was re-dated to today for being looked at.
  ⚠️ **First retirement under the owner's 2026-09-25 "show those specs as blank" decision.** Two
  specs are omitted upstream: **Mage|Fire**, which has no stored row to retire, and
  **Evoker|Devastation**, whose stored share was **0.1** — at or below
  `MYTHICSTATS_RETIRE_MAX_SHARE` (0.5), so its single row was REMOVED (39 → 38 rows, a 2.6% drop,
  far inside `maxRowDropPct` 0.25). **No fabricated zero was written in its place**; the drawer
  now prints no Mythicstats line for Devastation and Compare all shows "—". It returns by itself
  the first period that prints it again.

**Fetched by the agent.**
- **SimulationCraft `success`.** `reports/MID2_Raid.txt` HTTP 200, 1,447,313 B, and it **does**
  carry a complete `DPS Ranking:` block (46 lines), so the HTML fallback was not needed — but the
  same file ALSO contains "Generating Baseline … 1/45" progress spam, which is the exact shape the
  recipe warns reads as an in-progress log. Checked it through to **45/45** before trusting the
  block: one completed run, not a stale report with a fresh run appended.
  Era-verified off the **header build string**, never the visible version:
  `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69933 Live (hotfix 2026-10-03/69933, git
  build HEAD 6c50c3c7b9, no-networking)` → `asOf` is that hotfix date, **2026-10-03**.
  Mapped by **longest-prefix with a hyphen allowed**, best hero-variant per DPS spec, `Raid`
  aggregate skipped: 45 profiles → **24 DPS specs**, and the 7 unmapped names are all tanks (Prot
  Paladin ×2, Prot Warrior, Brewmaster, Vengeance, Blood DK ×2), correctly excluded. Balance,
  Augmentation and Devastation still absent upstream, so the pool holds at 24 of 27.
  **All 24 merged. 23 are sub-0.2% iteration noise; the one real move is Unholy Death Knight
  273,154 → 253,928 (−7.0%)** — the source's own number, well inside `maxValueMovePct` 0.6, and
  recorded plainly rather than narrated: it lands the same week Blizzard announced the Blightfall
  cut, and nothing here was adjusted to fit that coincidence.
- **Bloodmallet `partial`** — fetched complete, upstream has not re-simmed since **2026-09-30**,
  so the coverage date is three days old and that is not a success. All 27 DPS specs requested
  (`talent_target_scaling/castingpatchwerk`, 3 retries each): **23 charts returned**, and **four**
  give the 76-byte `{"status":"error"}` body on 8/8 attempts — Balance Druid, Augmentation Evoker,
  Devastation Evoker and, **newly tonight, SUBTLETY ROGUE** (Subtlety is the single stored profile
  dated 2026-09-23). Every one of the 23 reads `simc_settings.tier` **MID2** and `ptr` the
  **string "0"** (compared explicitly, never truthiness), and every chart's own `timestamp` is
  2026-09-30 → **all 23 byte-identical to stored, nothing merged.** Subtlety's stored MID2 profile
  is **RETAINED**: an error body is upstream absence, not a deletion signal, and the pool stays
  single-tier either way (24 profiles, all MID2; floor 15 untouched).
  **The 12.1.5 hold rule was checked and does not apply yet:** `PHASES.livePatch` null,
  `LABEL_FLIP_DUE` null, and 12.1.5 is **not live** (announced for October 13) — so there is no
  release date to adopt wholesale against. ⚠️ **This changes once `LABEL_FLIP_DUE` is set**: from
  that date the rule holds the WHOLE pool until every chart is dated on or after the release, and
  a partial re-sim must not be merged.
- **WoWMeta `partial`, frozen a NINTH week.** Two plain curls, no headers/proxy/auth:
  `manifest.json` 200 (353 B) still `snapshotDate 2026-09-15` (**18 days**), `rankings/…/0.json`
  200 (162,488 B) with `Last-Modified: Tue, 29 Sep 2026 10:03:08 GMT`. The rankings file was
  **fetched and DIFFED** rather than short-circuited on the frozen manifest date (the 2026-08-04
  rule — the two steps run independently): 44 blocks, whitelisted on `categoryType ∈ {dps,hps,tank}`
  **AND** `sortField === "lowerBound"` **AND** `keyRange === undefined` → tank 6 / dps 27 / hps 7
  = **40 rows**, 0 unmatched, `melee`/`ranged` subsets correctly excluded. Diffed at the **stored
  1-dp precision**: 40 of 40 `lowerBound` values and all 40 `numberOfCharacters` identical →
  nothing merged, no `asOf` restamped. The 18-day lag exceeds `maxAgeDays` **8**; the heartbeat red
  is the honest signal and no date was touched to quiet it.
- **Robydoby** (best-effort, deliberately outside the contract and so carrying **no manifest
  row**): `htmlview` HTTP 200, 16,209 B, tab map parsed — 26 tabs, and the newest **Mythic** week
  is still **24/7**, unchanged. Nothing merged, and deliberately so: this is a curated **zone-54**
  series from the **closed** 12.1 PTR cycle, and closed-cycle receipts are not refreshed.

**Warcraft Logs — agent holds no credentials and made no request.**
Read from `wcl-fetch/evidence.json` (`attemptedAt 2026-10-03T14:51:44.643Z`, oauth true, graphql
true, 370.57/3,600 hourly points, 138 queries, no abort).
- `wcl-leaderboard-raid` **partial** (not success): bracket status is `partial` —
  "287 median rows; 31 empty/sparse cuts; 2 failed/unattempted cuts; minimum 200 rows", and
  `landed.rows` 287 matches the 287 stored rows at `observedAt 2026-10-03`. The **2 invalid** cuts
  are Demonology Warlock on encounters 3429 and 3492 ("Ranking amount must be positive"); the 31
  sparse cuts are under the 10-entry minimum, 24 of them on 3492. All 33 keep prior observations,
  which is why one stored row still reads `observedAt 2026-10-02` (288 stored vs 287 landed).
- `wcl-leaderboard-mplus` **success**: "320 median rows; 0 empty/sparse; 0 failed", `landed.rows`
  320, every returned key level validated at exactly **10** (bracket 9).
- No partition supersession reported (`supersededBy` absent, pinned partition 1 on both).
- `wcl-live-raid` / `wcl-live-mplus` stay **unreachable**, recorded verbatim from
  `legacy[key]`: no verified sanctioned aggregate endpoint. The leaderboard series **cannot** green
  them. Closed PTR zone-52/54/56 rows untouched. `node src/check-wcl-metrics.mjs --manifest` passes.

**Archon — day 39 behind the wall**, all twelve routes 403 (the M+ route returning HTTP **200**
with a `human-verification` body, which is why body signature decides and not status). All six
numeric requirements are separate rows so it is visible which series are stale: 95th-pct DPS
(Mythic) 32 @ 08-25, HPS (Mythic) 7 @ 08-25, DPS (Heroic) 33 @ 08-24, HPS (Heroic) 7 @ 08-24,
M+ score 40 @ 08-25, Popularity 79 @ 08-25 — every one retained byte-identical. Per-boss
survivability was **not** substituted for the empty aggregate (measured dead end, 2026-08-21).

## 2026-10-02 (nightly) — **Murlok INVALID: its page date REGRESSED (10-01 → 09-29), nothing merged** (`parse_error`); SimC re-simmed on a new git HEAD; Mythicstats same period 1083, byte-identical; Bloodmallet 23/27 unchanged (`partial`); WoWMeta frozen an EIGHTH week; Archon walled day 38

**Warcraft Logs — no agent request of any kind.** Recorded from the deterministic pre-agent
collector: `wcl-fetch/evidence.json` `attemptedAt 2026-10-02T16:21:03.679Z`, verdict **success**,
`querySummary` 138 queries / 128 ranked batches / 8 budget checks / 137.2 s / `abortReason: null`.
- `wcl-leaderboard-raid`: **success, 287 rows** — zone **53**, partition **1**, difficulty **5**,
  size **20**, 33 empty/sparse cuts, 0 failed, all cuts `discoveryVerified`, floor 200. No
  `supersededBy`, so the dormant partition guard did not fire and the raid bracket stays pinned
  pending the reviewed switch (Mythic Kith'ix ranked entries + parity on the reviewed bosses, on
  the new partition).
- `wcl-leaderboard-mplus`: **success, 320 rows** — zone **55**, partition **1**, difficulty
  **10**, size **5**, `rankingBracket 9` = key **+10**, `keystoneLevel 10`, 0 omissions, 0
  failures, floor 280.
- `legacy`: `wcl-live-raid` / `wcl-live-mplus` both **unreachable**, recorded verbatim. Stored S1
  observations and their 2026-08-10 dates untouched; the leaderboard series is a different
  quantity and cannot green them. `rdps` is FFXIV-only and is not a WoW outage test.
- `node src/check-wcl-metrics.mjs` → "WCL leaderboard metrics match trusted collection;
  historical and failed/sparse cuts retained exactly." `data/wcl-coverage.json` not touched.
  Closed PTR zone-52/54/56 rows not read or reinterpreted.

**Murlok — `parse_error`, and this one is new.** `metrics-fetch/evidence.json`
`checkedAt 2026-10-02T16:23:25.603Z` reports **status `invalid`, rows 0**:
`"Source date regressed for Warrior|Arms (2026-09-29 < 2026-10-01)"`. All three meta pages
returned HTTP 200 first attempt (71,302 / 42,299 / 40,903 B), but every page's own
`<time datetime>` now reads **2026-09-29T02:10:2xZ** — OLDER than the **2026-10-01** the same DPS
page published last night, which the 10-01 entry recorded. The collector refuses a merge that
would move a source-owned date backwards, and **substituting the fetch date is exactly the
dishonesty the rule forbids**, so nothing was merged and nothing was re-dated: 40 stored rows
stay spanning 09-29…10-01, and the murlok registry pages were left alone (the receipt checker
requires a failed source to leave both canonical rows and its registry entry unchanged).
`parse_error` rather than `partial` because an `invalid` receipt is a source/parser-identity
question for review, not an outage. It clears by itself on a period that re-advances the date; if
it persists, it is a reviewed parser/configuration question, **not** something to paper over.

**Mythicstats — success, but an unchanged recheck.** Same trusted collector, `/period/latest` →
**`/period/1083`** (HTTP 200, 218,803 B) — the **same** period as last night. 39 rows, and the
share-column checks reconcile: sum **99.9**, role totals Ranged 29.6 / Melee 30.4 / Tank 20 /
Healer 19.9 against the page's printed 29.7 / 30.3 / 20 / 20, i.e. the representation SHARE
column and not the `/meta` per-key-presence figure. `Mage|Fire` omitted upstream with
`retiredSpecs` empty — correct, it has no stored row to retire. Merged with one
`node src/apply-metrics.mjs metrics-fetch/updates.json` → "✓ applied 39 metric(s)" and **0 values
moved**; every `asOf` keeps its own existing date (37 at 10-01, one 09-29, one 09-27), so the
undated-source rule held and nothing was redated to today. Coverage date **2026-10-01**.
`node src/check-stable-metrics.mjs` → "Stable numeric feeds match trusted collection evidence;
failed sources and absent rows retained honestly."

**SimulationCraft — success.** `reports/MID2_Raid.txt` HTTP 200, **1,446,737 B**, and it HAD a
`DPS Ranking:` block, so the HTML fallback and its burst/DTPS inflation trap were not in play.
Era-verified off the HEADER build string: *"SimulationCraft 1210-01 for World of Warcraft
**12.1.0.69933** Live (hotfix **2026-10-01**/69933, git build HEAD **38e22bd21a**,
no-networking)"* — live 12.1.0, no 12.1.5 anywhere. git HEAD moved **7cbb6ef5ff → 38e22bd21a**
with the build number held at 69933; that SHA is the freshness detector and the honest reason the
values moved. ⚠️ **Parser note for the next run: the ranking rows carry a `%` on the relative
column** (` 225572 100.0%  Raid`) — a `(\d+)\s+([\d.]+)\s+(name)` regex matches **zero** rows and
reads exactly like a report with no ranking block. 55 ranking lines, `Raid` aggregate skipped,
mapped by **LONGEST-PREFIX with a hyphen allowed** to **24 DPS specs** at best hero variant, 0
unmapped beyond the 14 tank rows (Blood DK, Vengeance, Brewmaster, both Protections), which are
correctly not ingested; the 3 DPS specs absent upstream are Balance Druid, Augmentation Evoker,
Devastation Evoker. All 24 values moved and every move is noise — largest **Havoc 271,366 →
271,068 = −0.11%**, far under `maxValueMovePct 0.6` — so nothing was held back and no
`value_move_ack` is needed. `asOf` = the report's own hotfix date **2026-10-01**.

**Bloodmallet — `partial`, upstream has not re-simmed since 09-30.** All 27 DPS specs requested;
**23** real payloads, **4** returned the 76-byte `{"status": "error"}` body on 2 attempts each —
**Balance Druid, Augmentation Evoker, Devastation Evoker, Subtlety Rogue**, the same persistent
set as last night. Every one of the 23 reads `simc_settings.tier = "MID2"` and
`simc_settings.ptr` = the **string** `"0"` (compared explicitly), target map read as
`data[tier][count]`. Per-chart `timestamp` dates **all 2026-09-30**, taken per spec. **The 12.1.5
wholesale-hold rule does NOT engage:** `PHASES.livePatch` null, `LABEL_FLIP_DUE` null, and this
run's own evidence puts 12.1.5 at **October 13** (not live), so neither keying date applies and
the normal merge stands. Merged 23 profiles at their own chart dates: **0 values moved**.
Subtlety keeps its stored 09-23 MID2 profile, so the pool is **24 profiles, single-tier MID2** and
the uniformity gate is satisfied; row floor 15 and the 25% row-drop gate clear. Coverage date
09-30 is **two days old**, which is why this is `partial` and not success.

**WoWMeta — `partial` (EIGHTH consecutive frozen week).** Two plain curl calls, both HTTP 200.
`manifest.json` `snapshotDate` **2026-09-15**, `Last-Modified` 15 Sep — unmoved; rankings file
`Last-Modified` **29 Sep 2026**, so the documented 2026-08-04 shape applies and the payload was
**fetched and diffed** rather than trusted to the manifest: 44 blocks, whitelist
`categoryType ∈ {dps, hps, tank}` **+** `sortField === "lowerBound"` **+**
`keyRange === undefined` → 27 + 7 + 6 = **40 rows, 0 unmatched**. At the stored 1-dp precision
**all 40 values and all 40 `n` are identical to stored**. Nothing merged, `asOf` stays 2026-09-15.

**Archon numbers — all six requirements BLOCKED (day 38).** Same 11-route probe as the tier lane:
every URL HTTP 403 behind the interactive challenge, `__NEXT_DATA__` count zero, corroborated by
`source-health/evidence.json` (M+ route is the 200-shaped wall). Nothing merged or re-dated:
95th-pct DPS (Mythic), HPS (Mythic), M+ score, Popularity and survivability stay at **2026-08-25**
and the two Heroic families at **2026-08-24**. The per-boss survivability substitution remains a
measured dead end and was not re-run.

**Robydoby — best-effort, outside the contract, unchanged.** `htmlview` HTTP 200, 56,597 B; 26
tabs parsed from the `items.push({name: …, …gid=N` blocks. The newest **Mythic** week is still
**24/7** (the closed 12.1 PTR cycle's last), with only `HC`/`M Tidebound Grotto` and
Backend/Template/Data tabs beyond it — no new Mythic week to re-parse, stored 33 rows untouched,
and no manifest row by design.

**Registry snapshots** bumped only where this run actually fetched the page: bloodmallet
(Target-count sims) 09-16 → **10-02**, mythicstats 09-17 → **10-02** (= the collector's
`checkedAt` date, which is what its receipt checker permits), simulationcraft MID2 report 09-21 →
**10-02**. Murlok's pages were deliberately **not** touched (failed source), and WoWMeta's stay at
its own frozen upstream date.

Finished with `npm run test:quiet` (**696 tests, 627 pass, 0 fail, 69 skipped** — Playwright is
deliberately absent on the runner, so the UI invariants are among the skips and this run proved
nothing about `template.html`) and `npm run build` (dist/index.html, 40 specs, 39 PTR-tracked,
2089.2 KB).

## 2026-10-01 (nightly) — **Mythicstats recovers on period 1083** (37 → 39 rows, Devastation + Affliction return); SimC re-simmed on a new git HEAD; Bloodmallet 23/27 with **Subtlety newly in the error set**; WoWMeta frozen a SEVENTH week; Archon walled day 37

**Warcraft Logs — no agent request of any kind.** Recorded from the deterministic pre-agent
collector: `wcl-fetch/evidence.json` `attemptedAt 2026-10-01T17:07:31.983Z`, verdict
**success**, `querySummary` 138 queries / 128 ranked batches / 8 budget checks / 127.6 s /
`abortReason: null`.
- `wcl-leaderboard-raid`: **success, 284 rows** — zone **53**, partition **1**, difficulty
  **5**, size **20**, 320 cuts all `discoveryVerified`, 36 empty/sparse cuts, 0 failed, floor
  200. No `supersededBy`, so the dormant partition guard did not fire and the raid bracket
  stays pinned pending the reviewed switch (Mythic Kith'ix ranked entries + parity on the
  reviewed bosses, on the new partition).
- `wcl-leaderboard-mplus`: **success, 320 rows** — zone **55**, partition **1**, difficulty
  **10**, size **5**, `rankingBracket 9` = key **+10**, `keystoneLevel 10`, 0 omissions, 0
  failures, floor 280.
- `legacy`: `wcl-live-raid` and `wcl-live-mplus` both **unreachable**, recorded verbatim —
  "Exact population medians have no verified sanctioned aggregate endpoint." Their stored S1
  observations and 2026-08-10 dates are untouched; the new leaderboard series does not and
  cannot green them. `rdps` is FFXIV-only and is not a WoW outage test.
- 604 rows across 32 metric names were merged by the collector before this agent started.
  `node src/check-wcl-metrics.mjs` → "WCL leaderboard metrics match trusted collection;
  historical and failed/sparse cuts retained exactly." `data/wcl-coverage.json` not touched.
  Closed PTR zone-52/54/56 rows not read, refreshed or reinterpreted.

**Murlok + Mythicstats — trusted collector only, no second parse.**
`metrics-fetch/evidence.json` `checkedAt 2026-10-01T17:09:45.566Z`.
- **Murlok: success**, 40 rows (27 DPS / 7 healer / 6 tank), three pages HTTP 200 on first
  attempt. Page-owned `<time datetime>`: DPS **2026-10-01T10:10:21Z**, Healer and Tank
  **2026-09-29T02:10:2xZ**; `sourceAsOf 2026-09-29`, `dateBasis: source-time-datetime`,
  stored metric span 09-29 … 10-01. No `n` invented (the page publishes none).
- **Mythicstats: success on a NEW weekly period — `/period/latest` → `/period/1083`**, which
  is the same period id that came back `invalid` last night; the receipt now verifies, so this
  requirement goes `parse_error` → `success` with nothing bypassed. 39 rows, and the
  share-column sanity checks reconcile: sum **99.9**, role totals Ranged 29.6 / Melee 30.4 /
  Tank 20 / Healer 19.9 against the page's printed 29.7 / 30.3 / 20 / 20 — i.e. the
  representation SHARE column, not the `/meta` per-key-presence figure. **`Mage|Fire` is
  omitted upstream and `retiredSpecs` is empty — correctly, because Fire Mage has no stored
  Mythicstats row at all**, so there was nothing to retire and nothing to hold the provider
  for; no zero was fabricated in its place.
- Merged with a single `node src/apply-metrics.mjs metrics-fetch/updates.json` → "✓ applied 79
  metric(s)". 35 Mythicstats values moved on the new period and **two specs returned after
  being absent — Devastation Evoker 0.1 and Affliction Warlock 0.1 (37 → 39 rows)**. Every
  moved value is a percentage well under `minValueMagnitude: 100`, so the value-move gate does
  not apply to them. `node src/check-stable-metrics.mjs` → "Stable numeric feeds match trusted
  collection evidence; failed sources and absent rows retained honestly."

**SimulationCraft — success.** `reports/MID2_Raid.txt` HTTP 200, **1,448,367 B**, and it HAD a
`DPS Ranking:` block, so the `MID2_Raid.html` fallback and its burst/DTPS-chart inflation trap
were not in play. Era-verified off the HEADER build string, never a visible version number:
*"SimulationCraft 1210-01 for World of Warcraft **12.1.0.69933** Live (hotfix **2026-09-30**
/69933, git build HEAD **7cbb6ef5ff**, no-networking)"* — live 12.1.0, no 12.1.5 anywhere. The
git HEAD moved **7532b322d7 → 7cbb6ef5ff** while the build number held at 69933; that SHA is
the documented freshness detector and the honest explanation for the movement. 45 ranking
lines, the `Raid` aggregate row skipped, mapped by **LONGEST-PREFIX with a hyphen allowed** to
**24 DPS specs** at their best hero variant, **0 unmapped names** (so no `_Fel-Scarred` or
`San'layn` profile was silently dropped). The 7 tank profiles are correctly not ingested, and
the 3 DPS specs absent upstream are **Balance Druid, Augmentation Evoker, Devastation Evoker**.
All 24 values moved and every move is noise — largest **Unholy Death Knight 273,395 →
273,078 = −0.12%**, far under `maxValueMovePct 0.6`, so nothing was held back and no
`value_move_ack` is needed. `asOf` = the report's own hotfix date **2026-09-30**.

**Bloodmallet — success, 23 of 27 charts.** All 27 DPS specs requested from
`chart/get/talent_target_scaling/castingpatchwerk/<snake_class>/<spec>`; 23 returned real
payloads and 4 returned the 76-byte `{"status": "error", …}` body on **3 attempts each**
(retried before concluding absence, per the documented ambiguity). Every one of the 23 reads
`simc_settings.tier = "MID2"` and `simc_settings.ptr` = the **string** `"0"` (compared
explicitly, never truthiness), and the target map was read as `data[tier][count]`, which is
already best-build. Per-chart `timestamp` dates are **all 2026-09-30** (Feral at 22:47, the
other 22 at 02:57–03:02) — taken per spec from the payload, never stamped with the run date.
**The 12.1.5 wholesale-hold rule does NOT engage:** `PHASES.livePatch` is null, `LABEL_FLIP_DUE`
is null, and nothing in this run's evidence says 12.1.5 is live (the official notes published
today put it at **Oct 13 NA / Oct 14 EU**), so neither keying date applies and the normal merge
stands. Merged 23 profiles at their own chart dates: only **Druid Feral** changed (`asOf`
09-23 → 09-30, largest target move 0.05%), the other 22 byte-identical. **`Rogue Subtlety` is
NEW in the error set** — it keeps its stored 2026-09-23 MID2 profile rather than being dropped,
so the pool is **24 profiles, 23 dated 09-30 + 1 dated 09-23, single-tier MID2** and the
uniformity gate is satisfied. Persistent error set is now Balance Druid, Augmentation Evoker,
Devastation Evoker and Subtlety Rogue; each rejoins on the night its chart appears. Row floor
15 and the 25% row-drop gate both clear.

**WoWMeta — partial (SEVENTH consecutive frozen week).** Two plain curl calls, no headers, no
proxy, both HTTP 200. `manifest.json` `snapshotDate` **2026-09-15**, unmoved. The rankings file
carries `Last-Modified: Tue, 29 Sep 2026 10:03:08 GMT`, so the documented 2026-08-04 shape
applies and the payload was **fetched and diffed rather than trusted to the manifest**: 44
blocks, whitelisting `categoryType ∈ {dps, hps, tank}` **+** `sortField === "lowerBound"` **+**
`keyRange === undefined` → 27 + 7 + 6 = **40 rows, 0 unmatched** (the `melee`/`ranged` blocks
are `dps` subsets and were excluded by whitelist, not by blacklisting "dungeon"). Compared at
the **stored 1-dp precision** (36 of 40 stored values carry 1 dp): **all 40 values and all 40
`n` are identical to stored**, `asOf` unchanged at 2026-09-15. So a newer Last-Modified with an
unchanged payload — nothing to merge, and the coverage date cannot advance. Recorded
`partial`; the age red is the honest signal and is the owner-accepted standing state.

**Archon numbers — all six requirements BLOCKED (day 37).** Same 11-route probe as the tier
lane this run: every archon.gg URL HTTP 403 behind Cloudflare's interactive "Just a moment..."
challenge, no `__NEXT_DATA__` to parse, independently corroborated by
`source-health/evidence.json`. Nothing merged, nothing re-dated: 95th-pct DPS (Mythic),
95th-pct HPS (Mythic), M+ score (95th pct), Popularity and survivability stay at **2026-08-25**,
and the two Heroic families at **2026-08-24**. The per-boss survivability substitution remains
the measured dead end (2 of 9 bosses, the only complete set a world boss, 55% tier
disagreement, 1–2 parses) and was not re-run.

**Robydoby — deliberately outside the refresh contract, checked best-effort.** `htmlview`
HTTP 200, 56,545 B; tab map parsed from the `items.push({name: …, …gid=N` blocks. The newest
**Mythic** week is still **24/7** (24 July — the closed 12.1 PTR cycle's last), with only
`HC`/`M Tidebound Grotto` and Backend/Template/Data tabs beyond it, so there is no new Mythic
week to re-parse and the stored 33 rows at 2026-07-24 / 2026-07-16 are unchanged. No manifest
row, by design: one volunteer's community sheet going quiet must never redden a nightly.

Finished with `npm run test:quiet` (**696 tests, 627 pass, 0 fail, 69 skipped** — Playwright is
deliberately absent on the runner, so the UI invariants are among the skips and this run proved
nothing about `template.html`) and `npm run build` (dist/index.html, 40 specs, 39 PTR-tracked,
2083.2 KB).

## 2026-09-30 (nightly) — **Bloodmallet AND SimC both re-simmed** (moves are noise: 4.16% / 0.26% max); **Mythicstats receipt `invalid` on a new period 1083 → `parse_error`, nothing merged**; Murlok success at its own 09-29 date; WoWMeta frozen a SIXTH week; Archon walled day 36

- **Bloodmallet — SUCCESS, coverage 2026-09-23 → 2026-09-30.** All 27 DPS specs requested from `chart/get/talent_target_scaling/castingpatchwerk` with a pause between and 2 attempts each, then **3 further attempts for every erroring spec**: **22 charts returned real data**, and **FIVE** returned the 76-byte `{"status":"error"}` body on all 5 attempts. Three are the persistent absentees since the 09-03 MID2 adoption (Balance Druid, Augmentation Evoker, Devastation Evoker) — **plus TWO NEW tonight: Feral Druid and Subtlety Rogue**, which returned data as recently as last night. Worth watching: both are in SimC's MID2 report tonight, so this is a Bloodmallet-side absence, not an upstream profile removal. `simc_settings.ptr` compared **EXPLICITLY against the string `"0"`** on all 22; `simc_settings.tier` **read off each chart** and `MID2` on all 22, matching the stored pool, so the pool stays **tier-uniform (24 profiles, all MID2)** and the `fightLabels` percentile trap stays shut. Targets from `data["MID2"][<count>]`, already best-build. `asOf` per chart from its own `timestamp`, never the run date: **all 22 read 2026-09-30**.
  **The 12.1.5 wholesale-adoption HOLD does NOT fire, and the run's own evidence is why** — this is the first night the question has real stakes, because 12.1.5 now has a date. `PHASES.livePatch` and `LABEL_FLIP_DUE` are **both still null** in `src/normalize.mjs`, and 12.1.5 **is not live**: Blizzard announced last night (news=383171, blue-tracker topics 2366151/2366152) that it ships **October 13 NA / 14 EU**, and tonight's SimC header still reads `World of Warcraft 12.1.0.69933 Live`. Neither keyed date applies and nothing says the patch is live, so current charts merge normally. ⚠️ **From the owner's launch commit (or from `LABEL_FLIP_DUE` once it is set and passed) this changes**: a partial re-sim must then be HELD WHOLE, and the pool is 24 specs of which 5 are erroring, so the first post-launch nights should expect `partial` rather than a merge.
  Pre-merge diff before merging: **132 target-count values compared, max move 4.16%** (Unholy DK 3T 404,699 → 387,874), median **0.07%**, **0 above `maxValueMovePct` 0.6** — nothing held back, no `value_move_ack` needed. Feral and Subtlety keep their existing 09-23 MID2 profiles untouched (profiles UPSERT, so no row was dropped: pool **24 → 24**, clear of the 15 floor and the 25% row-drop gate). Coverage (15th-freshest of 24) = **2026-09-30**, so this is a genuine success rather than the usual mid-week `partial`.
- **SimulationCraft — SUCCESS, coverage 2026-09-24 → 2026-09-29.** `reports/MID2_Raid.txt` HTTP 200, 1,446,801 B, and it **HAD** a `DPS Ranking:` block, so the `MID2_Raid.html` fallback and its burst/DTPS-chart inflation trap were not needed. Era-verified off the HEADER build string, never a visible version number: `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69933 Live (hotfix 2026-09-29/69933, git build HEAD 7532b322d7, no-networking)` — **live 12.1.0, no 12.1.5 anywhere in it**. The git HEAD moved **d08a1c38ef → 7532b322d7**, which is the documented freshness detector and the honest explanation for the movement. 46 ranking lines, Raid aggregate row skipped, mapped by **LONGEST-PREFIX with hyphens allowed** to **24** DPS specs at their best hero variant; the 7 unmapped profile names are all TANKS (Prot Paladin ×2, Prot Warrior, Brewmaster, Vengeance-Annihilator, Blood ×2) and correctly not ingested; the 3 absent DPS specs are Balance / Augmentation / Devastation, the same set Bloodmallet lacks. All 24 values moved, **largest +0.26%** (Unholy DK 272,675 → 273,395) — ordinary re-sim jitter, far under 0.6, nothing held back. `asOf` = the report's own hotfix date **2026-09-29**.
  ⚠️ **Transport note for whoever reads the ranking block next:** the line format is `<value> <pct>% <profile>`, i.e. value THEN percentage THEN name. A `/^\s*(\d+)\s+(\S+)/` regex therefore captures the PERCENTAGE as the profile name and maps **0 of 46 lines** while the fetch looks perfectly healthy — it reads exactly like "SimC changed shape". Match `/^\s*(\d+)\s+[\d.]+%\s+(\S+)/`. Cost one parse attempt tonight; caught only because the row count was printed before merging.
- **Mythicstats — `parse_error`, and nothing was merged.** The trusted pre-agent `fetch-stable-metrics.mjs` step reached the page but could not verify it: receipt `status: "invalid"`, `/period/latest` HTTP 200 on the first attempt resolving to **`/period/1083`** — a **NEW weekly period**, where 09-26…09-29 all resolved to 1082 — 315,873 B, **rows 0**, `sourceAsOf: null`, `details: "Mythicstats top-2000 population could not be verified"`. `invalid` rather than `partial` means the failure is in the fetched layout/inventory, which per the standing rule needs **a reviewed parser fix plus fixtures** (`test/fixtures/stable-metrics` + `test/stable-metrics.test.mjs`) — never an ad-hoc bypass of the receipt checker, and **never a second parser written inside the agent**, which is why none was. `metrics-fetch/updates.json` carried murlok's 40 rows and **nothing** for mythicstats, so all **37** stored "Top-2000 keys representation" rows keep their values and their own dates (coverage 2026-09-29, oldest row 2026-09-26): no share carried into a period that did not print it, no fabricated zero, no spec retired. `check-stable-metrics.mjs` passes, which is what confirms the failed provider was preserved exactly. **Likely the weekly roll**, since the last two period rolls also landed mid-week — but "likely" is not a diagnosis, and the receipt says review, so review is what it gets.
- **Murlok — SUCCESS at its own date.** Collected by the same trusted step and merged ONLY via `node src/apply-metrics.mjs metrics-fetch/updates.json`; no second parser. Receipt `status: success`, three meta pages HTTP 200 first attempt (71,302 / 42,299 / 40,903 B), **40 rows** at DPS 27 / Healer 7 / Tank 6, `sourceAsOf 2026-09-29` with `dateBasis source-time-datetime` from the pages' own `<time datetime>` stamps (2026-09-29T02:10:23–25Z), `omittedSpecs` none. Merged as "Top-50 avg M+ rating (ceiling)" — a top-50 **ceiling**, not popularity. The source's date was **NOT advanced to today**; coverage reads 2026-09-29, one day old, which `checkManifest` accepts.
- **WoWMeta — `partial`, frozen a SIXTH week.** Two plain curl calls to the JSON API (never the HTML prerender, never r.jina.ai): `manifest.json` HTTP 200 `snapshotDate 2026-09-15`, and `rankings/midnight/mplus/all/0.json` HTTP 200, 162,488 B, `Last-Modified Tue 29 Sep 2026 10:03:08 GMT` — **unchanged from last night**, so unlike the 09-29 run the rankings step has not re-run either. 44 blocks; selected by **WHITELIST** `categoryType ∈ {dps,hps,tank}` **+** `sortField === "lowerBound"` **+** `keyRange === undefined` (never a bare "dungeon" blacklist, because `melee`/`ranged` are subsets of `dps`) = 27 + 7 + 6 = **40 rows**, classSpec byte-identical to the roster, 0 unmatched. Merged at the stored **1-decimal** precision with `n = numberOfCharacters` and `asOf = manifest.snapshotDate` (**2026-09-15, not today**): **0 of 40 values moved**, so the merge was a genuine no-op. Published letters deliberately not ingested; the raid endpoint's `lowerBound` (DPS throughput, a different scale) not touched. The stored date is now **15 days old against `maxAgeDays` 8** — that heartbeat red is the honest signal, and no date was touched to hide it.
- **All six Archon numeric families — BLOCKED, day 36.** Nine routes probed, HTTP 403 `Just a moment...`, `__NEXT_DATA__` absent on every one, so `props.pageProps.page.specRankingsSection.table.data[]` was unreachable and none of `95th pct DPS (Mythic)` (32 rows @ 08-25), `95th pct HPS (Mythic)` (7 @ 08-25), `95th pct DPS (Heroic)` (33 @ 08-24), `95th pct HPS (Heroic)` (7 @ 08-24), `M+ score (95th pct)` (40 @ 08-25) or `Popularity` (79 @ 08-25) could be refreshed. All retained exactly, each row's `n` intact. **Six separate manifest rows as the skill requires**, never one combined row. Nothing was fetched, so Popularity's mandatory pre-merge shape check had no input and no merge was attempted — the failure mode that once published DPS magnitudes under unit `%` for three nights. Survivability likewise retained (40 @ 08-25); the per-boss substitution stays the measured dead end it was in August.
- **WCL — agent-side untouched, as designed.** No credentials, no warcraftlogs.com request of any kind, no row recomputed or edited, `data/wcl-coverage.json` left exactly as the collector wrote it. Pre-agent evidence: **`wcl-leaderboard-raid` success, 281 rows** (zone 53 / partition 1 / difficulty 5 / size 20, minRows 200, 39 sparse cuts below the 10-entry floor, 0 failures, `discoveryVerified: true`) and **`wcl-leaderboard-mplus` success, 320 rows** (zone 55 / partition 1 / difficulty 10 / size 5, `rankingBracket 9` = key +10, minRows 280, 0 sparse, 0 failures), both matching `landed[key].rows` exactly. **No partition supersession reported**, so the pinned partition stands; the reviewed raid switch still waits on Mythic Kith'ix ranked entries plus parity — and note from tonight's PTR sweep that Kith'ix is the 12.1.5 single-boss raid shipping Oct 13, so that evidence is weeks away, not months. `legacy["wcl-live-raid"/"wcl-live-mplus"]` remain `unreachable` (no verified sanctioned aggregate endpoint; `rdps` is FFXIV-only and is not a WoW outage test) with their 47 / 40 rows held at 2026-08-10. `check-wcl-metrics.mjs --manifest` passes.
- **Robydoby (best-effort, deliberately OUTSIDE the refresh contract) — nothing to merge.** Tab map fetched and parsed from the `items.push({name: …gid=N` blocks: 26 tabs, and the newest **Mythic** week is still **`24/7`** (24 July), exactly where the stored 33 rows already sit (31 @ 2026-07-24 + 2 @ 2026-07-16). That is the closed 12.1 PTR cycle's final state — the sheet has added no Mythic week since the 08-18 flip — so no CSV export was pulled and nothing was merged or re-stamped. No manifest row, by design: one volunteer's sheet going quiet must never redden a nightly.

## 2026-09-29 (nightly) — **WoWMeta pushed 40 new values under a manifest pinned a fifth week** (the 08-04 shape again); SimC re-simmed on the SAME build (max 1.44%); Bloodmallet 24/24 byte-identical; Mythicstats 1082 still rolling; Archon walled day 35

- **Murlok `success`, 40 rows, sourceAsOf 2026-09-29.** Collector-only lane: read `metrics-fetch/evidence.json`, merged ONLY `node src/apply-metrics.mjs metrics-fetch/updates.json`, no second parser. Receipt: three meta pages HTTP 200 (71,302 / 42,299 / 40,903 B), roleCounts 27/7/6, `dateBasis source-time-datetime` off the pages' own `<time datetime>` (2026-09-29T02:10:23–25Z), `omittedSpecs` empty. `check-stable-metrics.mjs` passes against the receipts and Git HEAD. Second consecutive daily publish after the 11-day freeze that ended 09-28.
- **Mythicstats `success`, 37 rows, period 1082 (fourth day on the same period, still updating).** Same collector lane. Receipt: `/period/latest` → `/period/1082`, 185,361 B, roleCounts DPS 24 / Healer 7 / Tank 6; role totals Ranged 27.1 / Melee 32.8 / Tank 20.1 / Healer 20.1 against the page's printed 27.2 / 32.9 / 20 / 20, whole-series sum **100.1** — the representation SHARE column, not the `/meta` per-key-presence figure. **Three specs absent from the chart, exactly one retired:** `omittedSpecs` = Devastation Evoker, Fire Mage, Affliction Warlock; `retiredSpecs` = **Warlock|Affliction** alone, its stored share at or under `MYTHICSTATS_RETIRE_MAX_SHARE` (0.5pp), and `apply-metrics` removed that one row. Devastation and Fire keep their stored rows and dates — no fabricated zero, and no stored share carried into a period that did not print it. **38 → 37 rows, a 2.6% drop**, far inside `maxRowDropPct` 0.25 and clear of the 25 floor.
- **WoWMeta `partial` — the rankings file moved while the manifest stayed pinned, so ALL 40 values landed under an unchanged date.** `manifest.json` HTTP 200, `snapshotDate` **2026-09-15** for the fifth week; `rankings/midnight/mplus/all/0.json` HTTP 200, 162,488 B, **`Last-Modified: Tue, 29 Sep 2026 10:03:08 GMT`**. This is the documented 2026-08-04 shape and the reason the skill says a frozen `snapshotDate` is NOT evidence the data is frozen: **40 of 40 `lowerBound` values changed**, largest single move **5.28%** (far under `maxValueMovePct` 0.6), and every `n` moved too (Blood DK 139,432 → 124,986). Selection by WHITELIST — `categoryType ∈ {dps,hps,tank}` **and** `sortField === "lowerBound"` **and** `keyRange === undefined` — out of 44 blocks → 27 + 7 + 6 = **40**, 0 unmatched (classSpec names are byte-identical to the roster). Merged at the stored **1-decimal** precision with `asOf = manifest.snapshotDate`, never today; letters not ingested; the raid endpoint not touched. `partial` is correct because the source-owned date cannot advance, and wowmeta's own `maxAgeDays` 8 is now past — that heartbeat red is the honest signal.
- **SimC `partial`, 24 rows, all moved, all noise.** `MID2_Raid.txt` HTTP 200, **1,446,550 B**, and it HAD a `DPS Ranking:` block so the HTML fallback (and its burst/DTPS-chart inflation trap) was not needed. Header build string, never the visible Highcharts version: `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69933 Live (hotfix 2026-09-24/69933, git build HEAD d08a1c38ef, no-networking)`. **The hash advanced (09-28 ran on the same 69933 hotfix) but the WoW build did not**, so `asOf` stays the report's own hotfix date **2026-09-24** and the coverage date correctly does not move. 46 ranking lines, `Raid` aggregate skipped, **longest-prefix mapping with hyphens allowed** → **24** DPS specs at best hero variant; the 7 unmapped names are all tank profiles (Prot Paladin ×2, Prot Warrior, Brewmaster, Vengeance, Blood ×2) and correctly not ingested. All 24 values moved, largest **Unholy Death Knight 268,794 → 272,675 = +1.44%** — ordinary re-sim jitter on an unchanged build, no `value_move_ack` needed. Live 12.1.0, no 12.1.5.
- **Bloodmallet `partial`, 24 of 27 at 2026-09-23, byte-identical.** 27 requested, ≤2 attempts each with a pause; the same three return the 76-byte error body every time (**Balance, Augmentation, Devastation** — absent since the 09-03 MID2 adoption, and the same three SimC has no MID2 profile for). `ptr` compared EXPLICITLY against the string `"0"`; `tier` READ OFF each chart = **MID2** on all 24, pool uniform; targets from `data[MID2][<count>]`, already best-build and non-empty on all 24. Every chart's own `timestamp` reads **2026-09-23** (6 days, inside `maxAgeDays` 8). **0 of 24 profiles moved on any target count**; the merge ran and left `data/specs.json` byte-identical. **The 12.1.5 hold does not fire:** `PHASES.livePatch` and `LABEL_FLIP_DUE` are both null, and this run's own evidence still has 12.1.5 PTR-only — Wowhead's data tree lists the live tree as **12.1.0** with separate `/ptr-2/` 12.1.5 URLs, and forum topic 2344395 is still titled "Midnight: 12.1.5 PTR Development Notes" with its newest staff post 2026-09-22.
- **All six Archon numeric families `blocked`, day 35.** Seven routes probed once each (the six registered tier routes plus the ancillary Mythic aggregate): HTTP 403, "Just a moment...", 3,435–3,508 B, **`__NEXT_DATA__` absent on every one**, so `props.pageProps.page.specRankingsSection.table.data[]` was unreachable and NOTHING was merged — no rounding pass, no `n` deletion, no Popularity shape check with no input. Rows retained exactly: 32 Mythic DPS + 7 Mythic HPS (08-25), 33 Heroic DPS + 7 Heroic HPS (08-24), 40 M+ score + 79 Popularity (08-25), 40 survivability (08-25). The measured 2026-08-21 per-boss survivability dead end was **not** re-run.
- **WCL: no agent request of any kind.** `wcl-leaderboard-raid` **success** at 279 rows and `wcl-leaderboard-mplus` **success** at 320, both recorded verbatim from the pre-agent collector's `brackets[].status` / `landed[].rows`; no partition supersession reported, so the pinned partition 1 stands on both. The legacy `wcl-live-raid`/`wcl-live-mplus` rows stay **unreachable** from `evidence.legacy[]` — no verified sanctioned aggregate endpoint, `rdps` is FFXIV-only and not a WoW outage test. `check-wcl-metrics.mjs --manifest` passes; `data/wcl-coverage.json` untouched.
- **Robydoby deliberately NOT refreshed.** Its series is the closed **12.1 PTR** zone-54 cut (`era: "ptr"`, 2026-07-16 / 07-24); re-parsing a community sheet to restamp closed-cycle PTR data is the reinterpretation the flip forbids. Outside `required-sources.json` by design, so no manifest row.

## 2026-09-28 (nightly) — **Murlok re-published after 11 days (09-17 → 09-28)**; SimC re-simmed on the same build (max move 0.13%); Bloodmallet 24/24 byte-identical; Mythicstats period 1082 re-observed identically; WoWMeta frozen a fourth week; Archon walled day 34

- **Murlok `success` — the one coverage date that genuinely advanced.** Trusted collector receipt (`metrics-fetch/evidence.json`, checkedAt 18:17:00Z): three meta pages HTTP 200 first attempt (71,302 / 42,299 / 40,903 B), complete **27 / 7 / 6 = 40** rows, 0 omitted, `dateBasis` `source-time-datetime`. The pages' own `<time datetime>` now reads **2026-09-28** (02:11:08-02:11:26Z) after eleven days pinned at 2026-09-17, so coverage moves 09-17 → 09-28 and the row is a real success rather than the usual date-held `partial`. Merged `metrics-fetch/updates.json` through `apply-metrics.mjs` and nothing else — no second parser. "(ceiling)" stays in the name.
- **SimulationCraft `partial`.** `MID2_Raid.txt` HTTP 200, **1,446,918 B**, and it HAD a `DPS Ranking:` block at line 60, so no HTML fallback and no burst/DTPS chart trap. Header build string (never the visible Highcharts version): `12.1.0.69933 Live (hotfix 2026-09-24/69933, git build HEAD **4c7c73621e**)` — HEAD advanced from **e25bc40189** on the **same WoW hotfix build**, i.e. a new sim run, not new game tuning. 45 ranking lines, `Raid` aggregate skipped, longest-prefix mapping with a hyphen allowed → **24** DPS specs; the 7 unmapped lines are exactly the tank builds. **All 24 values moved and all 24 are Monte Carlo noise — the largest is Feral Druid 251,137 → 251,464, +0.130%**, against `maxValueMovePct` 0.6. `asOf` stays the report's own hotfix date **2026-09-24**, which is exactly why the row is `partial`.
- **Bloodmallet `partial`, 24 of 27 at 2026-09-23.** 27 requested, ≤3 attempts each; the same three return the 76-byte error body every time (**Balance, Augmentation, Devastation** — absent since the 09-03 MID2 adoption and the same three SimC has no MID2 profile for). `ptr` compared explicitly against the STRING `"0"`; `tier` read off each chart = **MID2** on all 24, pool uniform; targets taken from `data[<tier>][<count>]`, whose leaf is a BARE NUMBER (the 09-27 trap). All 24 charts carry `timestamp` **2026-09-23** and **0 of 24 profiles moved** on any target count. **The 12.1.5 hold does not fire:** `PHASES.livePatch` and `LABEL_FLIP_DUE` are both null and this run's own evidence still has 12.1.5 PTR-only — Wowhead's data tree lists the live tree as **12.1.0** with separate `/ptr-2/` 12.1.5 URLs, topic 2344395 is still titled "PTR Development Notes", and the izen video distilled tonight (2026-09-26) says the patch is still about two weeks out.
- **Mythicstats `success`, and the period did NOT roll and did NOT move.** Receipt: `/period/latest` → `/period/**1082**` HTTP 200, 202,542 B — the same period as the last two nights. Shape checks: role subtotals Ranged 28.2 / Melee 31.8 / Tank 19.9 / Healer 19.9 against printed 28.2 / 31.8 / 20 / 20, sum **99.8** ⇒ the representation SHARE column, not the `/meta` presence widget. **38 rows** (25/7/6), `retiredSpecs` **empty**, and the two omitted specs (Evoker|Devastation, Mage|Fire) were both retired on earlier nights so nothing was stranded. Every value re-observed identically ⇒ no row took the fetch date and coverage correctly **stays 2026-09-27**, one day old. That is a same-day recheck confirming unchanged fresh data, which `checkManifest` accepts, not an advanced source-owned date.
- **WoWMeta `partial`, fourth week at the same snapshot.** `manifest.json` 353 B, `snapshotDate` **2026-09-15** (13 days). The rankings file was still fetched and DIFFED rather than short-circuited on the frozen manifest (the 08-04 incident): 162,376 B, 44 blocks, whitelist `{dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined` → 27+7+6 = **40 rows** read off `block.rankings`. At the stored **1-dp** precision: **0 of 40** values, 0 of 40 `n`, 0 dates. Merged anyway; specs.json byte-identical. Past `maxAgeDays` 8 ⇒ heartbeat red, which is the signal.
- **Warcraft Logs — collector-applied, agent touched nothing, both brackets green.** `wcl-leaderboard-raid` **`success`**: 277 rows against the 200 floor, 43 empty/sparse cuts under the 10-entry sample minimum, **0 failed/unattempted**, `landed.rows` 277 matching storage. `wcl-leaderboard-mplus` **`success`**: 320 of 320, 0 sparse, bracket 9 → +10 validated on the returned metadata. **No partition supersession reported**, so the pinned zone 53 / partition 1 / difficulty 5 / size 20 recipe stands and the raid switch still waits on Mythic Kith'ix entries + parity — an owner recipe change, never ours. Legacy `wcl-live-raid`/`-mplus` `unreachable` verbatim from `legacy[…]`. `check-wcl-metrics.mjs --manifest` passes; `wcl-coverage.json` untouched.
- **Archon — all six numeric requirements `blocked`, day 34.** Two routes probed, both HTTP 403 with a challenge body and no `__NEXT_DATA__`, so `specRankingsSection.table.data[]` could not be read and the mandatory Popularity shape-check could not be run — which is why nothing was merged. Retained unchanged: 32 Mythic DPS @ 08-25, 7 Mythic HPS @ 08-25, 33 Heroic DPS @ 08-24, 7 Heroic HPS @ 08-24, 40 M+ score @ 08-25, 79 Popularity @ 08-25, 40 survivability @ 08-25, encounter tiers @ 08-18 (still `season: "s1"`, still quarantined).
- **Robydoby deliberately NOT refreshed.** Its series is the closed **12.1 PTR** zone-54 cut (`era: "ptr"`, 2026-07-16 / 07-24); re-parsing a community sheet to restamp closed-cycle PTR data is the reinterpretation the flip forbids. Outside `required-sources.json` by design, so no manifest row.

## 2026-09-27 (nightly) — **SimC HEAD advanced, moves are pure noise (max 0.17%)**; Bloodmallet 24/24 byte-identical; Mythicstats 1082 keeps updating mid-week; Murlok/WoWMeta held by their own dates; Archon walled day 33

- ⚠️ **Bloodmallet trap, hit and fixed this run: `data[<tier>][<targetCount>]` is a BARE NUMBER, not a per-build object.** `data.MID2["1"] === 228705`. A first pass did `Math.max(...Object.values(row))` on it — `Object.values(228705)` is `[]` — and produced **24 charts with zero target counts** on 24 healthy HTTP 200s, which would have merged as empty profiles. It surfaced only because the loop printed `counts=` per spec. Print the counts every run; "already best-build" in the skill means the leaf is the value.
- **Bloodmallet `partial`, 24 of 27 at 2026-09-23.** 27 requested, ≤3 attempts each; the same three return the 76-byte error body every time (**Balance Druid, Augmentation, Devastation** — the set absent since the 09-03 MID2 adoption, and the same three SimC has no MID2 profile for). `ptr` compared explicitly against the STRING `"0"`; `tier` read off each chart = **MID2** on all 24, pool uniform. **The 12.1.5 hold does not fire:** `PHASES.livePatch` and `LABEL_FLIP_DUE` are both null, and this run's own evidence has 12.1.5 still PTR-only (Wowhead's data tree lists live **12.1.0** against PTR 12.1.5; thread 2344395 is still titled "PTR Development Notes"), so current charts merge normally. **0 of 24 profiles moved** on any target count.
- **SimulationCraft `partial`.** `MID2_Raid.txt` HTTP 200, 1,445,728 B, WITH a `DPS Ranking:` block so no HTML fallback. Header build: `12.1.0.69933 Live (hotfix 2026-09-24/69933, git build HEAD **e25bc40189**)` — HEAD advanced from **a69b06905b** on the SAME WoW hotfix build, i.e. a new sim run, not new game tuning. 45 ranking lines, `Raid` aggregate skipped, longest-prefix mapping with hyphens → **24 DPS specs**, 7 unmapped lines all tank builds. **All 24 values moved and all 24 moves are noise** — largest Windwalker **+0.17%**, everything else inside ±0.15%, against `maxValueMovePct` 0.6. `asOf` stays the report's own hotfix date **2026-09-24**, which is exactly why the row is `partial`.
- **Mythicstats `success`, and the period did NOT roll.** Trusted receipt: `/period/latest` → `/period/**1082**` (same as last night) HTTP 200, 202,542 B. Shape checks: role subtotals Ranged 28.2 / Melee 31.8 / Tank 19.9 / Healer 19.9 against printed 28.2 / 31.8 / 20 / 20, sum **99.8** — the representation SHARE column, not the `/meta` presence widget. **38 rows** (25/7/6); **32 values moved inside the same period id** and took the fetch date, 6 identical rows kept 09-26, so coverage advances to **2026-09-27**. Absences: Mage|Fire was already retired last night (no stored share to strand) and **Evoker|Devastation** is retired tonight under the 0.5-point `MYTHICSTATS_RETIRE_MAX_SHARE` bound — `updates.retire` removed exactly that one row (40→38 over two nights). It renders blank and returns by itself. ⚠️ **And the rule fired BOTH ways on the same night: `Mage|Frost`, retired on 09-26, is printed again by this period at 0**, so its row re-lands at 0 with the fetch date — which is why the series reads 38 rather than 37 after a retirement. Neither move is agent-side; `check-stable-metrics.mjs` re-derives the required set from git HEAD.
- **Murlok `partial`.** Receipt `success`: three pages HTTP 200 first attempt (71,302 / 42,311 / 40,911 B), 27/7/6 complete, 0 omitted, `sourceAsOf` **2026-09-17** from the pages' own `<time datetime>`. All 40 merged values identical to stored. The source date is **10 days** old and did not move ⇒ 5 days past `maxAgeDays` 5; that red is the signal. Merged `metrics-fetch/updates.json` only, no second parser.
- **WoWMeta `partial`, fourth week at the same snapshot.** `manifest.json` (353 B) `snapshotDate` **2026-09-15** (12 days). Rankings file still fetched and DIFFED rather than short-circuited on the manifest (the 08-04 incident): 162,376 B, `Last-Modified: Tue, 22 Sep 2026`, 44 blocks, whitelist {dps,hps,tank} + `sortField === "lowerBound"` + `keyRange === undefined` → 27+7+6 = **40 rows**. Compared at the stored **1-dp** precision first: **0 of 40** values, 0 of 40 `n`, 0 dates. Merged anyway; specs.json byte-identical. Past `maxAgeDays` 8 ⇒ heartbeat red.
- **Warcraft Logs — collector-applied, agent touched nothing, and the raid bracket is GREEN again.** `wcl-leaderboard-raid` **`success`** (was `partial` last night, `parse_error` for eight nights before that): 277 rows against the 200 floor, 43 empty/sparse cuts under the 10-entry sample minimum (Survival 8, Fire 2, Fury 5 on encounter 3421; Frost DK 7, Vengeance 6 on 3429), **0 failed or invalid cuts**, `discoveryVerified: true`, 320 verified cuts, `landed.rows` 277 matching storage. `wcl-leaderboard-mplus` **`success`**: 320 of 320, 0 sparse, bracket 9 → `keystoneLevel` 10 validated on the returned metadata. **No partition supersession reported**, so the pinned zone 53 / partition 1 / difficulty 5 / size 20 recipe stands and the raid switch still waits on Mythic Kith'ix entries + parity — an owner recipe change, never ours. Transport 830.15/3,600 points, 138 queries, no abort. Legacy `wcl-live-raid`/`-mplus` `unreachable` verbatim from `legacy[…]`. `check-wcl-metrics --manifest` passes; `wcl-coverage.json` untouched.
- **Archon — all six numeric requirements `blocked`, day 33.** `__NEXT_DATA__` absent from every probed route (the two raid Mythic aggregates were probed directly tonight), so `specRankingsSection.table.data[]` could not be read and no float rounding, `parses`→`n` mapping or percentage shape-check was possible. Retained unchanged: 32 Mythic DPS @ 08-25, 7 Mythic HPS @ 08-25, 33 Heroic DPS @ 08-24, 7 Heroic HPS @ 08-24, 40 M+ score @ 08-25, 79 Popularity @ 08-25, 40 survivability @ 08-25, 619 encounter tier rows @ 08-18 (still `season: "s1"`, still quarantined).
- **Robydoby deliberately NOT refreshed.** Its series is the closed **12.1 PTR** zone-54 cut (`era: "ptr"`, 2026-07-16/07-24); re-parsing a community sheet to restamp closed-cycle PTR data is the reinterpretation the flip forbids. Outside `required-sources.json` by design, so no manifest row.

## 2026-09-26 (nightly) — Mythicstats period **1082** lands (2 Mage rows RETIRED); SimC re-simmed on the same build; WCL raid `partial`; Murlok/WoWMeta/Bloodmallet all held by their own dates; Archon walled

- **Mythicstats — `success`, and the first retirement under the 2026-09-25 owner rule.** Trusted collector receipt: `/period/latest` → **`/period/1082`** HTTP 200, 215,345 B, role subtotals Ranged 30.1 / Melee 29.8 / Tank 20 / Healer 20, sum **99.9** (so this is the representation SHARE column, not the `/meta` per-key-presence widget). **38 rows** landed (25/7/6). **Mage|Fire (stored 0) and Mage|Frost (stored 0.1)** are absent from this period's chart and both sit at or under the 0.5-point `MYTHICSTATS_RETIRE_MAX_SHARE` bound, so `updates.retire` **removed exactly those two rows** (40 → 38, a 5% drop against `maxRowDropPct` 0.25) instead of zeroing them or holding the whole provider as 09-25 had to. Both specs now render blank and return by themselves when a later period prints them. 34 of the 38 remaining values moved with the new period — all percentage shares below the 100-unit `minValueMagnitude`, so the value-move guard does not apply — and changed rows take the fetch date, which advances the coverage date to **2026-09-26**. Merged `metrics-fetch/updates.json` only; `check-stable-metrics` passes.
- **Murlok — `partial`.** Receipt: three meta pages HTTP 200 first attempt (71,302 / 42,311 / 40,911 B), complete 27/7/6 parse, `sourceAsOf` **2026-09-17** off the page's own `<time datetime>` (`source-time-datetime`). All 40 merged values identical to stored. The source's own date is **9 days** old and did not move, so the coverage date cannot advance — 4 days past `maxAgeDays` 5, and that red is the honest signal.
- **WoWMeta — `partial`, third week at the same snapshot.** `manifest.json` (353 B) `snapshotDate` **2026-09-15** (11 days). The rankings file was still fetched and DIFFED rather than short-circuited on the manifest (the 2026-08-04 incident): 162,376 B, 44 blocks, whitelist {dps,hps,tank} + `sortField === "lowerBound"` + `keyRange === undefined` → **3 blocks, 27+7+6 = 40 rows**, and all 40 `lowerBound` values plus `numberOfCharacters` are byte-identical at the stored 1-dp precision. Merged anyway (no change detector); specs.json unchanged. Past `maxAgeDays` 8 ⇒ heartbeat red.
- **Bloodmallet — `partial`, 24 of 27 at 2026-09-23.** 27 requested, 3 attempts each; the same three specs return the 76-byte error body on every attempt (**Balance Druid, Augmentation Evoker, Devastation Evoker** — the same set SimC has no MID2 profile for). `ptr` compared explicitly against the string `"0"`; `tier` read off each chart = **MID2** on all 24, pool uniform. **The 12.1.5 hold does not fire this run:** `PHASES.livePatch` and `LABEL_FLIP_DUE` are both null and this run's own PTR sweep has 12.1.5 still PTR-only (topic titled "PTR Development Notes", Kith'ix testing still being scheduled), so current charts merge normally. Per-chart `timestamp` all 2026-09-23; **0 of 24 profiles moved** on any target count.
- **SimulationCraft — `partial` (fetched fresh, source date did not move).** `MID2_Raid.txt` HTTP 200, 1,446,217 B, with a `DPS Ranking:` block so no HTML fallback. Header build: `12.1.0.69933 Live (hotfix 2026-09-24/69933, git build HEAD **a69b06905b**)` — the git hash advanced from the stored run's `1e0751c16d` on the **same WoW hotfix build**, i.e. a new sim run, not a new game build. 45 ranking lines, `Raid` aggregate skipped, longest-prefix mapping with hyphens → **24 DPS specs**. 23 of 24 values moved and every move is noise: largest **Unholy DK 269,878 → 268,689, -0.44%**, everything else inside ±0.15%, nowhere near `maxValueMovePct` 0.6. `asOf` stays the report's own hotfix date **2026-09-24**, which is why this is `partial` and not `success` — the honest cost of not stamping the run date.
- **Warcraft Logs — collector-applied, agent touched nothing.** `wcl-leaderboard-mplus` **`success`** (320 rows from 320 cuts, 0 sparse, floor 280; bracket 9 = exactly +10 validated against returned metadata). `wcl-leaderboard-raid` **`partial`**: 276 rows (floor 200) with **43 sparse cuts** (under the 10-entry minimum — Survival Hunter 8, Fire Mage 2, Fury Warrior 5 on The Twin Fangs) and **1 invalid cut**, Arcane Mage on encounter 3497, rejected because a returned ranking run timestamp was in the FUTURE relative to the observation instant (15:05:24.057Z > 14:42:55.674Z) — a provider clock/ingest artifact the collector is right to refuse; those cuts keep their previous observations. **No partition supersession reported**, so the pinned zone 53 / partition 1 / difficulty 5 / size 20 recipe stands and the raid bracket stays there until the reviewed switch (which waits on Mythic Kith'ix ranked entries — Blizzard is only now scheduling that PTR testing). `check-wcl-metrics --manifest` passes. Legacy `wcl-live-raid`/`-mplus` remain `unreachable` verbatim from `legacy[…]`: no verified sanctioned aggregate endpoint, and `rdps` being FFXIV-only is not a WoW outage.
- **Archon — all six numeric requirements `blocked`, day 32.** Cloudflare interstitial on every route, no `__NEXT_DATA__`, so `specRankingsSection.table.data[]` could not be read; 32 Mythic DPS / 7 Mythic HPS / 33 Heroic DPS / 7 Heroic HPS / 40 M+ score / 79 Popularity rows all retained unchanged above their floors, and no percentage shape-check was possible because nothing was fetched.
- **Robydoby deliberately NOT refreshed.** Its series is the closed **12.1 PTR** zone-54 cut (33 rows, era ptr, 2026-07-16/07-24). The PTR lane is dormant and those stored rows are the cycle's final receipts — re-fetching a community sheet to restamp closed-cycle PTR data would be exactly the reinterpretation the flip forbids. It is outside `required-sources.json` by design, so no manifest row.

## 2026-09-25 (nightly) — SimC on a fresh build carrying the Blightfall fix (**Unholy +12%**); Bloodmallet / Murlok / WoWMeta all byte-identical upstream; Mythicstats still held for review; Archon walled day 31; WCL raid bracket still `invalid`

- **SimC — `success`, the one genuine mover.** `MID2_Raid.txt` HTTP 200, **1,441,334 B**, and it HAD a `DPS Ranking:` block so the HTML fallback was not needed. Header build string (never the visible Highcharts version): `12.1.0.69933 Live (hotfix 2026-09-24/69933, git build HEAD 1e0751c16d)` — the hash advanced from the stored 09-23 build, which is the honest explanation for the movement. 46 ranking lines, `Raid` aggregate skipped, **longest-prefix mapping with hyphens allowed** → **24** DPS specs at their best hero variant; 0 unmapped lines. **All 24 moved. Largest is Unholy Death Knight 240,871 → 269,878, +12.04%** — consistent with Blizzard's 2026-09-23 Blightfall bug fix landing in this build, and the same event the creator lane distilled today — with every other move under 3%. Nowhere near `maxValueMovePct` 0.6, so no `value_move_ack` is needed. `asOf` = the report's own hotfix date **2026-09-24**.
- **Bloodmallet — `partial`.** All 27 DPS specs requested, ≤3 attempts each: **24 charts, 3 persistent error bodies** (Balance, Augmentation, Devastation — the same set absent since the 09-03 MID2 adoption and the same three SimC has no MID2 profile for). `simc_settings.ptr` compared explicitly against the string `"0"`; `simc_settings.tier` read off every chart and MID2 on all 24, so the pool stays tier-uniform. `asOf` per chart from its own `timestamp`: all 24 read **2026-09-23**. Pre-merge diff **0 of 24 profiles moved** on any target count; the merge ran and left specs.json byte-identical. Coverage correctly does not advance ⇒ partial, 2 days old, inside `maxAgeDays` 5.
- **Murlok — `partial`, from the collector only.** `metrics-fetch/evidence.json` has all three meta pages HTTP 200 first attempt, a complete 27/7/6 = 40-row parse with no omitted specs, and `sourceAsOf` **2026-09-17** read from the page's own `<time datetime>`. Merged `metrics-fetch/updates.json` through apply-metrics.mjs and nothing else — no second parser. `check-stable-metrics.mjs` passes. The source date did not move, so coverage stays 2026-09-17: **8 days old, 3 past `maxAgeDays` 5**, which the heartbeat will report.
- **Mythicstats — `partial`, held for review for a second night.** `/period/latest` resolved to `/period/1082` at HTTP 200 (215,345 B) and the section parse was structurally sound (Ranged 30.1 / Melee 29.8 / Tank 20 / Healer 20, sum 99.9), but the collector **landed 0 rows** because Mage|Fire and Mage|Frost are missing from the chart and Mage|Frost has a nonzero stored share — merging would hand that share silently to the rest of the cut. Nothing merged; the 40 stored rows keep their values and their 2026-09-24 date. ⚠️ **Worth a reviewed look:** two Mage rows vanishing from one chart is either a genuine upstream omission or a markup change, and the collector cannot tell them apart.
- **WoWMeta — `partial`.** Both JSON API calls HTTP 200 with no headers, proxy or auth. `manifest.json` reports `snapshotDate` **2026-09-15** for the third run running. The rankings file (162,376 B, 44 blocks) was **fetched and diffed rather than short-circuited on the manifest** — a pinned snapshotDate is not evidence the data is frozen (the 08-04 incident) — selecting `categoryType ∈ {dps, hps, tank}` **+** `sortField === "lowerBound"` **+** `keyRange === undefined` for exactly 27 + 7 + 6 = **40** rows, and all 40 `lowerBound` values are identical to stored at the 1-decimal stored precision. Merged anyway per policy; no diff. **10 days old, past `maxAgeDays` 8** ⇒ heartbeat red, which is the honest signal.
- **Archon — all six numeric requirements `blocked`, day 31.** Cloudflare interstitial on every route, so `specRankingsSection.table.data[]` could not be read; no shape-check was possible because nothing was fetched, and nothing was merged. Stored rows retained at their original dates: archon-metrics 32 @ 08-25, archon-hps 7 @ 08-25, archon-heroic-dps 33 @ 08-24, archon-heroic-hps 7 @ 08-24, archon-mplus-score 40 @ 08-25, archon-popularity 79 @ 08-25, survivability 40 @ 08-25, encounters 619 tier rows @ 08-18 (still stamped `season: "s1"`, so still quarantined).
- **WCL — collector only, no agent request of any kind.** `wcl-leaderboard-mplus` **`success`**: 320 median rows from 320 cuts, 0 empty or sparse, against a 280 minimum, `landed.rows` 320, merge already applied before the agent started, `check-wcl-metrics.mjs` clean. `wcl-leaderboard-raid` **`parse_error`**: bracket status `invalid`, 0 rows, all 320 cuts reporting "Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration" — a reviewed-configuration mismatch needing an owner recipe review, not an outage, and plausibly the 12.1.5/S3 raid work moving the zone under the pinned recipe. The two legacy aggregate rows stay `unreachable` verbatim from `legacy[…]`: no verified sanctioned endpoint exists, and the new leaderboard series cannot green them.
- **Robydoby deliberately NOT refreshed.** Its sheets are curated zone-54 **12.1 PTR** parses and that cycle is closed; the stored rows are historical receipts, and re-parsing closed-zone data in a live refresh is what the WCL contract forbids. It is outside `required-sources.json` by design, so this costs no manifest row.

## 2026-09-24 (nightly) — SimC and Bloodmallet both on a fresh build; mythicstats rolled to a new period; Archon walled; WCL raid bracket `invalid`

- **SimulationCraft `success`** — `MID2_Raid.txt` HTTP 200, 1,439,597 B, and it HAD its `DPS Ranking:` block (line 60), so no HTML fallback. Header: `12.1.0.69933 Live (hotfix 2026-09-23/69933, git build HEAD c97e14c7a5)`. The git HEAD moved off the 09-22 report, so this is a genuine re-sim on the Sept 22/23 tuning; `asOf` is the report’s own hotfix date **2026-09-23**, not the run date. 45 profiles + the Raid aggregate, mapped by **longest prefix with hyphens allowed** (what keeps `MID2_Demon_Hunter_Havoc_Aldrachi_Reaver` and `MID2_Demon_Hunter_Devourer_Void-Scarred` on the right specs); best hero-variant per DPS spec = **24 rows**. The 7 unmapped profiles are exactly the tanks (both Blood builds, both Prot Paladin builds, Prot Warrior, Brewmaster, Annihilator Vengeance). All 24 values moved, **every one under 1%** (largest Windwalker +0.9%) — a re-sim, not a transport artifact.
- **Bloodmallet `success`** — all 27 DPS specs requested with up to 3 attempts each; **24 returned charts, 3 returned the 76-byte `{"status": "error"}` body on 8 of 8 attempts** (Balance Druid, Augmentation Evoker, Devastation Evoker — the same three SimC has no MID2 profile for, so upstream absence, not a parse failure). `simc_settings.ptr` compared explicitly against the STRING `"0"`; `simc_settings.tier` read off each chart and it is **MID2** on all 24, so the pool stays uniform and `SIM_TIER_REQUIRED` is satisfied. `asOf` per chart, never the run date: all 24 stamp **2026-09-23**. Exactly **one** profile moved — Destruction Warlock, the only spec still on 09-16, now re-simmed, largest per-target move 0.1%. 24 rows clears the 15 floor, no row drop.
- **Murlok `partial`** — collector receipts ONLY, no second parser agent-side. `metrics-fetch/evidence.json` (15:30:03Z): status `success`, three pages HTTP 200 first attempt (71,302 / 42,311 / 40,911 B), 27+7+6 = 40 rows, 0 omitted, `dateBasis` `source-time-datetime`. The page’s own `<time datetime>` still reads **2026-09-17**, seven days back, and that source-owned date is what was stored — a fresh 200 is not a fresh dataset, so `partial`.
- **Mythicstats `success`** — same collector; `/period/latest` HTTP 200, 231,090 B, finalUrl **`/period/1082`**, a NEW weekly period (last run was still on the 09-17 cut). 40 rows, 0 omitted. Shape checks are what tell the representation column from the per-key-presence widget: role totals Ranged 31.4 / Melee 28.9 / Tank 20 / Healer 20 against the page’s printed 31.3 / 28.7 / 20 / 20, sum 100.3. Site publishes no timestamp ⇒ `sourceAsOf: null`, `dateBasis` `observed-undated-source`; **33 of 40 rows moved** and took the fetch date, 7 identical rows kept their older `asOf`. `check-stable-metrics.mjs` passed against the trusted receipts and git HEAD.
- **WoWMeta `partial`** — two plain curl calls to the JSON API, never the HTML prerender. `manifest.json` snapshotDate **2026-09-15**; `rankings/midnight/mplus/all/0.json` HTTP 200, 162,376 B, **Last-Modified Tue 22 Sep 2026** — so the rankings file was re-fetched and diffed rather than short-circuited on the frozen snapshotDate (the 08-04 lesson). 44 blocks; the whitelist (`dps|hps|tank` + `sortField lowerBound` + `keyRange === undefined`) gives 27+7+6 = 40, 0 unmatched. ⚠️ the list lives under **`block.rankings`**, not `data`/`entries` — a wrong key returns 0 rows on a healthy fetch. Merged at the stored **1-dp** precision with `n = numberOfCharacters` and `asOf` = the source’s snapshotDate: **0 of 40** values, dates or sample sizes moved.
- **Archon `blocked` (all six numeric requirements)** — day 32 of the wall; see the refresh-tiers entry for the transport detail. Every Archon number and date is exactly as committed. The per-boss survivability substitution remains the 2026-08-21 measured dead end and was not attempted.
- **WCL — evidence only, zero agent fetches.** `wcl-leaderboard-mplus` **`success`**: bracket status `success`, 320 median rows, 0 empty/sparse, 0 failed, against a 280 minimum, and `evidence.landed` 320 — matching exactly; oauth+graphql both true, 4.27/3,600 hourly points, 70 queries/64 ranked batches/no abort. `wcl-leaderboard-raid` **`parse_error`**: bracket status **`invalid`**, 0 rows, all 320 cuts reporting “Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration” — a reviewed-configuration problem, not an outage, and it needs a recipe/zone check rather than any agent-side inference. Stored raid coverage stays 2026-09-16 / 227 rows. The legacy `wcl-live-raid`/`wcl-live-mplus` rows stay `unreachable` verbatim from `evidence.legacy`; the new series cannot green them. `check-wcl-metrics.mjs --manifest` passes.
- **Robydoby not refreshed, deliberately** — its series is closed-cycle 12.1 PTR zone-54 data (`era: "ptr"`), and the between-cycles posture says those stored rows are final receipts. It sits outside `required-sources.json` by design.
## 2026-09-23 (nightly) — **the Sept 22 class tuning shows up in BOTH sim feeds**: SimC 24/24 moved, Bloodmallet re-simmed 23 charts; Destruction newly absent; Archon day 31

- **SimulationCraft — `success`, 24 rows, asOf 2026-09-22.** `MID2_Raid.txt` HTTP 200, 1,439,813 B, and it HAD its `DPS Ranking:` block (line 60) so no HTML fallback and no burst/DTPS chart to misread. Header build string (never the visible Highcharts version): `12.1.0.69933 Live (hotfix 2026-09-22/69933, git build HEAD 7bbd7fc408)` — HEAD advanced from **1922637ad9** and the build from 69875, which is the honest explanation for the movement. 46 ranking lines, `Raid` aggregate skipped, longest-prefix mapping with a hyphen allowed → **24 of 27 DPS**; the 7 unmapped names are all tank builds. **All 24 moved, and the moves are the tuning rather than jitter**: Shadow Priest **+6.92%**, Havoc DH **+6.77%**, Retribution **+4.89%**, Frost DK **+4.44%**, Windwalker **+3.05%** — every one a spec buffed in that pass — against ≤0.31% for everything else. Largest move is far inside `maxValueMovePct` 0.6, so no ack.
- **Bloodmallet — upstream RE-SIMMED, `partial`, and the reason is coverage, not dates.** 23 charts returned, **every one timestamped 2026-09-23** (read per chart, never the run date); `simc_settings.tier` read off each and all 23 are **MID2**, matching the stored pool, so the pool stays tier-uniform at 24 profiles; `ptr` is the STRING `"0"` and was compared explicitly. Target maps taken as `data[MID2][<n>]`, **already best-build** — verified non-empty on all 23, which is the exact trap that produced 24 empty merges on 09-22. Pre-merge diff: **138 of 138 target values moved**, largest **+7.54%** (Frost Mage 15-target 645,952 → 694,645).
  - ⚠️ **The error set GREW: `Warlock Destruction` is NEW tonight**, joining the standing Balance Druid / Augmentation Evoker / Devastation Evoker trio. It had a chart as recently as the 09-22 run. Retried **4 more times on its own (7 total)** — same 76-byte `{"status": "error"}` body every time. Its stored MID2 profile is **RETAINED untouched at its own 2026-09-16 timestamp**, not deleted and not re-dated, so the published pool is 23 profiles at 09-23 and 1 at 09-16. That is why the row is `partial` even though the coverage date is today: 4 of 27 specs are absent and one of them regressed. Row floor 15 and the 25% row-drop gate are both clear at 24.
- **WoWMeta — `partial`, the pinned-manifest shape AGAIN but with no new numbers.** `manifest.json` snapshotDate still **2026-09-15** (8 days pinned) while the rankings file carries `Last-Modified: Tue, 22 Sep 2026 09:45:45 GMT` — so the payload was diffed rather than short-circuited on the manifest. Whitelisted `categoryType ∈ {dps,hps,tank}` + `sortField lowerBound` + `keyRange === undefined` out of 44 blocks → 27+7+6 = **40**, 0 unmatched. **Rounded to the stored 1-dp convention BEFORE comparing** (raw 370.1135831636792 vs stored 370.1; unrounded reports all 40 as moved): **0 of 40 values, 0 of 40 `n`s, 0 dates**. So the 09-22 re-upload carries the same numbers the 09-22 nightly already merged — the Last-Modified moved and the data did not. `asOf` stays 2026-09-15. At `maxAgeDays` 8.
- **Murlok — `partial`, collector receipts only.** `status: success`, 3 pages HTTP 200 on 1 attempt (40,911 / 42,311 / 71,302 B), roleCounts 27/7/6, 0 omissions, `sourceAsOf` **2026-09-17** off the pages’ own `<time datetime>`. Applied `metrics-fetch/updates.json` alone: 40 rows, **0 moved**. Six days old and never advanced to the fetch date ⇒ partial. No second parser written.
- **Mythicstats — `partial`, fifth consecutive HOLD.** `/period/latest` → `/period/**1082**` (a new weekly period; 1081 last night), HTTP 200, 305,481 B, but the collector records `rows: 0` with *“Mythicstats is incomplete or not the representation-share series”*. Nothing merged: all 40 stored rows keep their 2026-09-17 dates, no fabricated zeros, no silent share redistribution. **Worth a reviewed parser look** — five straight holds across two different period ids is starting to look like markup drift rather than one bad week.
- **WCL — agent did nothing; no credentials, no request.** `wcl-leaderboard-mplus` **`partial`** (not success): receipt status is `partial`, 319 of 320 cuts landed, and **1 cut is `invalid` — Hunter Beast Mastery on encounter 12993, “Ranking run timestamp is in the future (15:23:10Z > observed 15:10:33Z)”**; that cut keeps its previous observation. 319 rows merged by the collector itself, 320 stored against the 280 floor, coverage 09-22 → 09-23. `wcl-leaderboard-raid` **`parse_error`**: status `invalid`, 0 rows, all 320 cuts *“Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration”* while OAuth+GraphQL both succeeded (70 queries, 748.58 of 3,600 points) — **eighth consecutive night, root cause unchanged since 09-17: zone 53 gained encounter 3513 (Kith’ix) and `zoneValid` refuses any encounter outside the reviewed list.** That is a one-line REVIEWED recipe edit and was again not made here; 227 stored raid rows retained at 2026-09-16 and the `maxAgeDays` 2 red is the signal. Both legacy `wcl-live-*` rows `unreachable` verbatim from `evidence.legacy`. `wcl-coverage.json` untouched; all three checkers pass.
- **Archon — all six numeric rows `blocked`, day 31.** `__NEXT_DATA__` count 0 on both registered routes, so there is no `specRankingsSection` to read. Nothing merged, nothing backfilled from Warcraft Logs, per-boss survivability substitution still the measured dead end and not attempted.
- **Robydoby deliberately not fetched** — its sheets are curated zone-54 **12.1 PTR** parses from a closed cycle; outside `required-sources.json` by design, and re-ingesting closed-zone data in a live refresh is what the WCL posture forbids.

## 2026-09-22 (nightly) — **WoWMeta pushed 40 new values under a pinned manifest** (the 08-04 shape, reproduced); SimC re-simmed on a new HEAD; bloodmallet + murlok + mythicstats frozen upstream

- ⚠️ **WoWMeta: the manifest is pinned and the data is NOT.** `manifest.json` still reads `snapshotDate 2026-09-15` (`completedAt` 09-15T14:25:48Z — 7 days pinned) while `rankings/midnight/mplus/all/0.json` came back 162,376 B with **`Last-Modified: Tue, 22 Sep 2026 09:45:45 GMT`**, and **all 40 `lowerBound` values moved** (plus all 40 `numberOfCharacters`, which fell ~5–18% across the roster). This is exactly the 2026-08-04 incident shape the skill says never to short-circuit on the manifest for. A **cache-busted re-fetch returned `x-cache: Miss from cloudfront` and a byte-identical body**, ruling out CDN variance. Merged at the source's own 1-dp precision; `asOf` stays the published **2026-09-15**, NOT today and NOT the Last-Modified date ⇒ **partial** (7 days, inside `maxAgeDays` 8). Largest move Frost DK +1.97% (315.6 → 321.1), family median +1.2% — nowhere near `maxValueMovePct` 0.6, no ack involved.
- ⚠️ **Bloodmallet trap hit and fixed before the merge: `data[tier][<targetCount>]` is a BARE NUMBER, already best-build.** A first pass that expected a per-build sub-object to `max()` over produced 24 profiles with **empty `targets`** on 24 healthy HTTP 200s — indistinguishable from an outage, and it would have merged as data. The mandatory pre-merge diff caught it (144 `undefined`s); re-fetched with the corrected reader and the diff then moved **0 of 24 profiles, 0 of 144 target values**. Confirm an ingest against stored values, always.
- **Bloodmallet — 24/27, partial.** Persistent `{"status":"error"}` on 3/3 retries each for Balance Druid, Augmentation Evoker, Devastation Evoker (unchanged set). `simc_settings.tier` read off each chart = **MID2** on all 24, matching the stored pool, so the pool stays tier-uniform; `ptr` is the STRING `"0"` and was compared explicitly. `asOf` = each chart's own timestamp, **2026-09-16** for all 24 = 6 days ⇒ past `maxAgeDays` 5, and that heartbeat red is the honest signal.
- **SimulationCraft — success, 24 rows, asOf 2026-09-21.** `MID2_Raid.txt` (1,439,225 B) HAD its `DPS Ranking:` block (line 60, with the `text report took` / `html report took` trailer), so no HTML fallback and no burst/DTPS chart to misread. Header build string: `12.1.0.69875 Live (hotfix 2026-09-21/69875, git build HEAD 1922637ad9)` — hash advanced from 774babde5d, which is the honest explanation for the movement. 46 ranking lines, `Raid` skipped, LONGEST-PREFIX mapping with a hyphen allowed → 24 DPS; the 7 unmapped names are all tank builds. Every move tiny: largest **0.09%** (Survival), family median 241,640 → 241,647.5. `MID1_Raid.txt` still the 272-byte stub on the same header — not a fallback.
- **Murlok — collector receipt only, 40 rows, 0 moved, partial.** `status: success`, roleCounts 27/7/6, 0 omitted, `sourceAsOf` **2026-09-17** from the pages' own `<time datetime>`. 5 days old, at `maxAgeDays` 5 ⇒ partial. No second parser written.
- **Mythicstats — collector `partial`, 0 rows, HELD for review.** `/period/latest` → `/period/1081`, 194,101 B. `Evoker|Devastation` is omitted while carrying a nonzero stored share, so admitting the cut would redistribute its share as movement. **Omissions grew 3 → 4: `Warlock|Affliction` joined** Devastation, Augmentation and Fire Mage this period. Shape for the reviewer: Ranged 28.7 / Melee 31.5 / Tank 20.1 / Healer 20, sum **100.3** — the representation SHARE column, not the `/meta` per-key-presence figure. Nothing merged, no fabricated zeros, `dateBasis` still `observed-undated-source`.
- **WCL — agent did nothing.** Leaderboard M+ `success` 320/320 (collector's own pre-agent merge; coverage date → 2026-09-22); leaderboard raid `invalid` → **parse_error**, seventh consecutive night, all 320 cuts reporting "Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration" while OAuth+GraphQL both succeeded (2.09 of 3,600 points) — a reviewed recipe change, not an access failure. Legacy `wcl-live-raid`/`-mplus` stay `unreachable` verbatim from `evidence.legacy`. `wcl-coverage.json` left exactly as the collector wrote it.
- **Archon: all six numeric requirements `blocked`** — see the refresh-tiers entry for the wall probe. Nothing backfilled from another source under the archon id.
- **Robydoby not fetched:** its sheets are zone-54 **12.1 PTR** raid testing and that cycle is closed; it is deliberately outside `required-sources.json` and going quiet must never redden a night.

## 2026-09-21 (nightly) — murlok/mythicstats from the collector only; SimC re-simmed on a new HEAD; bloodmallet + wowmeta frozen upstream

- **Murlok — collector receipt only, 40 rows, 0 moved.** `metrics-fetch/evidence.json` (checkedAt 16:35:37Z) reads `status: success` across all three role pages (HTTP 200, 40,911–71,302 B), roleCounts 27/7/6, `sourceAsOf` **2026-09-17** from the pages' own `<time datetime>` stamps. Applied `metrics-fetch/updates.json` through `apply-metrics.mjs` — 40 rows, every value byte-identical to stored. A complete parse is not a fresh source date: 4 days old ⇒ **partial**.
- **Mythicstats — collector `partial`, 0 rows, source HELD for review.** `/period/latest` → `/period/1081`, HTTP 200, 196,664 B, but `Evoker|Devastation` is omitted from this period's chart while carrying a **nonzero stored share**, so admitting the cut would have redistributed that spec's share as if it were movement. `Mage|Fire` also omitted. Shape for the reviewer: Ranged 29.1 / Melee 31.1 / Tank 20 / Healer 20.1, sum **100.3** — the representation SHARE column, not the `/meta` per-key-presence figure. Nothing merged; all 40 stored rows keep their values and dates. **partial**.
- **SimulationCraft — 24 rows, all moved, all tiny.** `MID2_Raid.txt` HTTP 200, 1,439,769 B, and it HAD a `DPS Ranking:` block. Header: `12.1.0.69875 Live (hotfix 2026-09-19/69875, git build HEAD 774babde5d)` — the hash advanced from the previous run's `ff8ab6f63a`, which is the honest explanation for the movement. `MID1_Raid.txt` is still the **272-byte** in-progress stub carrying the SAME header; not a fallback. 46 ranking lines, `Raid` aggregate skipped, longest-prefix mapping with a hyphen allowed → 24 DPS specs; the **7 unmapped names are all tank builds** (Prot Warrior, Prot Paladin + its Templar variant, Brewmaster, Vengeance Annihilator, both Blood DK variants). Largest move **0.39 %** (Havoc), median under 0.05 % — ordinary overnight jitter, no `value_move_ack` involved. `asOf` = the report's own hotfix date 2026-09-19 ⇒ 2 days old ⇒ **partial**.
- **Bloodmallet — 24 of 27 charts, all `MID2`, 0 values moved.** The 3 persistent errors are Balance Druid, Augmentation Evoker and Devastation Evoker (retried 3× each, same 76-byte `{"status": "error"}` body). `simc_settings.tier` was READ OFF EACH CHART (never assumed) and all 24 read `MID2`, matching the stored pool, so the pool stays tier-uniform; `simc_settings.ptr` is the STRING `"0"` on all 24 and was compared explicitly. `asOf` = each chart's OWN timestamp, all 2026-09-16, identical to stored. Merged anyway per the no-change-detector policy: 0 of 24 profiles and 0 target values moved. 5 days old, at `maxAgeDays 5` ⇒ **partial**, and the heartbeat red is the honest signal.
- **WoWMeta — genuinely frozen upstream, not our fetch.** `manifest.json` `snapshotDate` **2026-09-15** and the rankings file's `Last-Modified` **Tue, 15 Sep 2026 09:33:36 GMT** AGREE, so this is not the 2026-08-04 pinned-manifest shape; the payload was diffed anyway, as that incident requires. Whitelisted `categoryType ∈ {dps,hps,tank}` **+** `sortField === "lowerBound"` **+** `keyRange === undefined` out of 44 blocks → 27+7+6 = 40, 0 unmatched. All 40 `lowerBound` values and `numberOfCharacters` byte-identical at the stored 1-decimal precision — nothing to merge. 6 days old, inside `maxAgeDays 8` ⇒ **partial**.
- **Archon numerics (all six rows) blocked** — the site-wide wall; `__NEXT_DATA__` count 0 on both registered routes, so no `specRankingsSection` exists to read. Nothing merged, nothing backfilled from Warcraft Logs.
- **WCL**: the agent holds no credentials and fetched nothing. `wcl-leaderboard-mplus` `success` (320/320 cuts, 320 rows vs the 280 floor); `wcl-leaderboard-raid` **`invalid`** with 0 rows — all 320 cuts report *"Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration"* while OAuth and GraphQL both succeeded (70 queries, 210.55 of 3,600 points), so it is a recipe/metadata mismatch needing a REVIEWED configuration change, recorded `parse_error`, with the 227 stored raid rows retained exactly at 2026-09-16. Both legacy `wcl-live-*` rows stay `unreachable` verbatim from `evidence.legacy`.
- **Robydoby deliberately not refreshed**: its sheets are curated zone-54 **12.1 PTR** parses and that cycle is closed — the stored rows are frozen historical receipts, and re-ingesting closed-zone data in a live refresh is exactly what the WCL posture forbids. It is outside `required-sources.json` by design, so nothing reddens.


## 2026-09-20 (nightly) — SimC re-simmed (24 rows, ≤0.11% jitter); Bloodmallet / WoWMeta / Murlok byte-identical upstream; Mythicstats **still held for review**; WCL raid cut still `invalid`

- **SimC — `success`, the only mover.** `MID2_Raid.txt` HTTP 200, **1,439,426 B**, and it **had** a `DPS Ranking:` block so the HTML fallback was not needed. Header build string (never the visible Highcharts version): `12.1.0.69875 Live (hotfix 2026-09-19/69875, git build HEAD ff8ab6f63a)` — the hash advanced from the stored run's `9f6eac0659`, which is the honest explanation for the movement. 46 ranking lines, Raid aggregate skipped, **longest-prefix mapping with hyphens allowed** → **24** DPS specs (best hero variant each); the 7 unmapped names are all tank profiles and correctly not ingested. **All 24 moved, largest 0.11%** — ordinary overnight jitter, nowhere near `maxValueMovePct` 0.6. `asOf` = the report's own hotfix date **2026-09-19**.
- **Bloodmallet — `partial`.** All 27 DPS specs requested, ≤3 attempts each. **24 charts, 3 persistent error bodies** (Balance, Augmentation, Devastation — the same set absent since the 09-03 MID2 adoption, and the same three SimC is missing). `simc_settings.tier` **read off every chart**: all 24 MID2, pool tier-uniform; `ptr` compared explicitly against the string `"0"`. `asOf` per chart from its own `timestamp`: all 24 read **2026-09-16**. Pre-merge diff **0 of 24 profiles moved** on any target count; the merge ran and left specs.json byte-identical. Coverage correctly does not advance → partial, 4 days old, inside `maxAgeDays` 5.
- **WoWMeta — `partial`, still the accepted upstream freeze.** Two plain-curl JSON calls (never the HTML prerender): `manifest.json` snapshotDate **2026-09-15** and the rankings file's own `Last-Modified: Tue, 15 Sep 2026 09:33:36 GMT` **agree**, so not the 08-04 pinned-manifest shape — and the payload was diffed anyway. Whitelisted `categoryType ∈ {dps,hps,tank}` + `sortField lowerBound` + `keyRange === undefined` → 27+7+6 = **40**, roster-exact. ⚠️ **Rounded to the stored 1-dp convention before comparing** (payload 365.1441919678634 vs stored 365.1; raw comparison reports all 40 as "moved"). Rounded: **0 of 40** values, `n`s or dates moved.
- **Murlok — `partial` (collector receipts only).** status success, 3 pages HTTP 200 on 1 attempt, 27/7/6 = 40 rows, 0 omissions, `sourceAsOf` **2026-09-17** off the pages' own `<time datetime>`. Merged `metrics-fetch/updates.json` alone; **0 of 40 moved**. Partial purely because a source-owned date 3 days old is never advanced to the fetch date.
- **Mythicstats — `partial`, third consecutive hold.** `/period/latest` → `/period/1081`, HTTP 200, 211,589 B, role subtotals 29.9/30/19.9/20.1 summing to 99.9 (the representation-share column, not the `/meta` presence column) — but the collector recorded **rows 0**: *"Omitted Mage|Frost has a nonzero stored share; source held for review"*. Nothing merged, no fabricated zero, all 40 stored rows keep their 2026-09-17 dates. Worth a reviewed look at whether that omission is real.
- **WCL — no agent-side request of any kind; all three checkers green.** `wcl-leaderboard-mplus` **success**: 320 rows ≥ 280 floor, zone 55 / p1 / d10 / size 5, `rankingBracket` 9 → keystoneLevel 10, discoveryVerified, 0 omissions; coverage 09-19 → **09-20**. `wcl-leaderboard-raid` **parse_error**: `status: "invalid"`, 0 rows, every cut *"Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration"* — **root cause unchanged since 09-17: WCL added encounter 3513 (Kith'ix) to zone 53 and `zoneValid` refuses any encounter outside the reviewed list.** That is a one-line REVIEWED recipe edit and was again not made here; coverage holds at 09-16 against `maxAgeDays` 2, and that red is the signal. `wcl-live-raid/mplus` stay **unreachable** off `evidence.legacy`.
- **Archon — all nine rows `blocked`, day 28.** Registered raid route 403 with a "Just a moment…" interstitial, `__NEXT_DATA__` count **0**; the pre-agent source-health receipt records the same, with the M+ route as the HTTP-200 human-verification shape. Every stored letter and number keeps its original date; the per-boss survivability substitution remains the measured dead end and was not attempted; nothing backfilled from Warcraft Logs.
- **Robydoby** deliberately not refreshed — the closed 12.1 PTR zone-54 lane, dormant between cycles and outside the contract by design.


## 2026-09-19 (local, scheduled) — NOT re-run: nightly metrics landed 30 minutes earlier; WCL raid still `invalid` on the Kith'ix encounter (owner fix pending)

- No metric fetched or merged. The nightly's manifest already records the day: SimC 24 rows fresh, Bloodmallet 24/27 unchanged (upstream
  2026-09-16), Murlok 40/40 unchanged (source date 09-17), Mythicstats held for review (omitted Frost Mage share), WCL M+ 320 ok, **WCL raid 0
  rows / `invalid`** — still the zone-53 encounter 3513 (Kith'ix) refusal root-caused 09-18; the one-line `excludedEncounters` recipe edit
  remains a reviewed owner change and was not made. Consequences unchanged: `wcl-leaderboard-raid` stays `parse_error`, and the two
  ui-invariants WCL fixture tests stay red on every run (636/2/1 again today).
- `check-refresh --manifest` on this partial run: the only failure is the stale gitignored local `wcl-fetch/evidence.json` (09-08 leftover,
  no WCL merge here) — the `startedAt` line did NOT fire because the nightly's 14:19Z stamp is still fresh. Manifest deliberately NOT rewritten.

## 2026-09-19 (nightly) — SimC re-simmed (24 rows, jitter only); Bloodmallet / WoWMeta / Murlok byte-identical upstream; Mythicstats **held for review** by the collector; WCL raid cut still `invalid`; Archon walled day 27

- **SimC — `success`, the one genuine mover.** `MID2_Raid.txt` HTTP 200, 1,439,746 B, and it **had** a `DPS Ranking:` block so the HTML fallback was not needed. Header build string (never the visible Highcharts version): `12.1.0.69875 Live (hotfix 2026-09-19/69875, git build HEAD 9f6eac0659)` — hash advanced, which is the honest explanation for the movement. 46 profile lines, Raid aggregate skipped, **longest-prefix mapping with hyphens allowed** → **24** DPS specs (best hero variant each). The 7 unmapped names are all tank profiles and correctly not ingested. **All 24 moved, every one <0.15%** (largest Windwalker 246,526→246,669, 0.06%) — ordinary overnight jitter, nowhere near `maxValueMovePct` 0.6. asOf 2026-09-19.
- **Bloodmallet — `partial`.** All 27 DPS specs requested, ≤3 attempts each. **24 charts, 3 persistent error bodies** (Balance, Augmentation, Devastation — the same set absent since the 09-03 MID2 adoption). `simc_settings.tier` **read off every chart**: all 24 MID2, pool tier-uniform; `ptr` compared explicitly against the string `"0"`. asOf taken **per chart** from its own `timestamp`: all 24 read **2026-09-16**. Pre-merge diff **0 of 24 profiles moved** on any target count; the merge ran and left specs.json byte-identical. Coverage date correctly does not advance → partial, 3 days old, inside `maxAgeDays` 5.
- **WoWMeta — `partial`, still the accepted upstream freeze.** Two plain-curl JSON calls (never the HTML prerender): `manifest.json` snapshotDate **2026-09-15** and the rankings file's own `Last-Modified: Tue, 15 Sep 2026 09:33:36 GMT` **agree**, so this is not the 08-04 pinned-manifest shape — and the payload was diffed anyway. Whitelisted `categoryType ∈ {dps,hps,tank}` + `sortField lowerBound` + `keyRange undefined` → 27+7+6 = **40**, 40/40 roster-exact. ⚠️ **Rounded to the stored 1-dp convention before comparing** — the payload is full float (365.1441919678634 against a stored 365.1), and comparing raw reports **all 40 as moved** against byte-identical upstream data. Rounded: **0 of 40** values, `n`s or dates moved. Nothing merged.
- **Murlok — `partial` (collector).** Receipts only: status success, 3 pages 200 on 1 attempt, 27/7/6 = 40 rows, 0 omissions, `sourceAsOf` **2026-09-17** off the pages' own `<time datetime>`. Merged `metrics-fetch/updates.json` alone; **0 of 40 moved**. Partial purely because a source-owned date 2 days old is never advanced to the fetch date.
- **Mythicstats — `partial`, and the receipt is the whole story.** `/period/latest` → `/period/1081`, 200, 211,589 B, role subtotals 29.9/30/19.9/20.1 summing to 99.9 (the representation-share column, not the `/meta` presence column) — but the collector recorded **rows 0** and held the source: *"Omitted Mage|Frost has a nonzero stored share; source held for review"*. Dropping an omitted spec that still carries a nonzero stored share would push phantom share into the new cut, so nothing merged and all 40 stored rows keep their 2026-09-17 dates. No fabricated zero for Frost Mage.
- **WCL — no agent-side request of any kind; three checkers green.** `wcl-leaderboard-mplus` **success**: 320 rows ≥ 280 floor, zone 55 / p1 / d10 / size 5, `rankingBracket` 9 → keystoneLevel 10, discoveryVerified, 0 omissions, asOf 2026-09-19. `wcl-leaderboard-raid` **parse_error**: `status: "invalid"`, 0 rows, every cut *"Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration"* — **root cause unchanged from the 09-18 local run: WCL added encounter 3513 (Kith'ix, the 12.1.5 boss) to zone 53 and `zoneValid` refuses any encounter outside the reviewed list.** That is a one-line REVIEWED recipe edit and was again not made here. Coverage 2026-09-16 against `maxAgeDays` 2, so the heartbeat will flag it — that red is the signal. `wcl-live-raid/mplus` stay **unreachable** off `evidence.legacy`: no verified sanctioned aggregate endpoint, and the new leaderboard series cannot green them.
- **Archon — all nine rows `blocked`, day 27.** Both registered routes 403 with a "Just a moment…" interstitial and `__NEXT_DATA__` count **0** (assert on payload, not status). Retention policy: every stored letter and number keeps its original date; the per-boss survivability substitution remains the measured dead end and was not attempted; nothing backfilled from Warcraft Logs.
- **Robydoby** deliberately not refreshed — it is the closed 12.1 PTR zone-54 lane, dormant between cycles and outside the contract by design.

## 2026-09-18 (nightly) — SimC build moved (23/24 values), everything else upstream-static; WCL raid cut still `invalid` on the Kith'ix zone change

- **SimulationCraft — the one real move.** `MID2_Raid.txt`, 1,439,899 B, has a `DPS Ranking:` block so the HTML lane was not needed. Header
  build **HEAD ae999065c5** (12.1.0.69814, hotfix 2026-09-17), a new hash against the stored values — which is the honest explanation for the
  movement. 45 profiles → longest-prefix map → **24 DPS specs** (7 tank profiles correctly matched nothing). **23 of 24 moved**, all tiny —
  largest `|delta|` **357 DPS on Outlaw (0.14%)**, nowhere near the 0.6 value-move gate. Shadow Priest held and kept its stored date.
- **Bloodmallet `partial`**: 24 charts HTTP 200, 3 persistent `{"status":"error"}` specs (Balance, Augmentation, Devastation — same set).
  All 24 `tier` **MID2**, `ptr` the string `"0"`, chart timestamps all **2026-09-16**. **0 of 24 profiles moved.** partial because that chart
  date is 2 days old; stamping today would defeat the very probe (`fightProfile.asOf`) the staleness gate reads.
- **WoWMeta `partial`**: rankings file diffed independently of the manifest date, as the rule requires — and this time both are static
  (`snapshotDate` 2026-09-15, rankings `Last-Modified` 15 Sep 09:33 GMT). Whitelisted dps/hps/tank + `lowerBound` + `keyRange === undefined`
  → 40 rows; all 40 values and all 40 `numberOfCharacters` identical to stored at the stored 1-dp precision. Re-merged at the source's date.
- **Murlok `success`** and **Mythicstats `partial`** both reported from the trusted collector receipt; I parsed no second copy. Murlok
  `sourceAsOf` **2026-09-17** (its own `<time datetime>`), 40 rows, 0 moved — last night landed the same cut. Mythicstats reached
  `/period/1081` (HTTP 200) but the receipt **held the provider**: Frost Mage is absent from the chart while carrying a nonzero stored share,
  so 0 rows landed and the whole 40-row series is preserved with its original dates. Worth a reviewed look at whether that omission is real.
  `check-stable-metrics` passes.
- **WCL**: no credentials, no request. M+ bracket **success, 320 rows** (all 320 cuts success, minRows 280), coverage 09-16 → 09-17. Raid bracket
  **`invalid`, 0 rows** — all 320 cuts report "Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration",
  the 09-17 root cause unchanged: **WCL added encounter 3513 (Kith'ix) to zone 53**, so `zoneValid` refuses the bracket. Reported `parse_error`,
  not an outage; the recipe is gatekeeper code and was **not** touched in a data refresh. `check-wcl-metrics --manifest` passes.
- **Archon's six numeric families all `blocked`** (day 26). Each reported as its own row so a partial recovery cannot hide behind a combined
  status. The per-boss survivability substitution stays a measured dead end — nothing was substituted.
- **Robydoby not refreshed**: its series is zone-54 **12.1 PTR** and that cycle is closed, so those rows are historical receipts. It is
  deliberately outside `required-sources.json`, so no manifest row.

## 2026-09-18 (local, scheduled) — **WCL raid `invalid` ROOT-CAUSED: WCL added encounter 3513 "Kith'ix" (the 12.1.5 boss) to zone 53**, and `zoneValid` refuses any encounter outside the reviewed list — a one-line reviewed recipe edit, NOT applied here; no metric merged; Archon walled day 26

- **Diagnosis, read-only, via `node src/wcl-probe.mjs`** (local credentials from the gitignored config, OAuth ok, exit 0): zone 53
  "The Venomous Abyss" is `frozen: false`, partitions `[{1,"12.1"}]`, Mythic difficulty 5 sizes `[20]` — all as reviewed — but its
  encounter list is now **TEN**: the eight pinned bosses, the excluded world boss 3379 Nymrissa Wavecaller, **and a new `3513 Kith'ix`**.
  `src/wcl-live.mjs` `zoneValid()` rejects a zone carrying any encounter not in `encounters ∪ excludedEncounters`, so every one of the
  320 raid cuts was refused with *"Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration"* —
  the collector doing exactly what its reviewed-configuration guard is for. The data endpoint itself is healthy: encounter 3470
  `characterRankings` dps AND hps both HTTP 200 with 100 rows, `hasMorePages` true. Zone 55 (M+) is unchanged (8 encounters,
  brackets 2–30 bucket 1) which is why the M+ cut landed 320/320 last night.
- **Why it appeared 09-17**: Kith'ix is the 12.1.5 encounter currently in PTR raid testing (Wowhead 382926 "Mythic Kith'ix … on Patch
  12.1.5 PTR"; Bansherz's "Mythic Kithix Best Pull PTR" PoV) — WCL registered it in the live zone ahead of the patch, as it did Nymrissa.
  It is not live and not one of the eight pinned Mythic bosses, so the shape of the fix is the Nymrissa precedent: add
  `{ id: 3513, name: "Kith'ix" }` to that bracket's `excludedEncounters` in `src/wcl-live.mjs` (line ~22), with a comment that it is
  the 12.1.5 boss registered pre-patch. **Not applied in this run**: the recipe is gatekeeper code and a reviewed configuration change per
  CLAUDE.md ("New cycle/zone configuration needs a reviewed recipe change"), and a scheduled data run does not edit it. Until it lands,
  every nightly's raid cut will refuse the same way (M+ unaffected) and the two WCL UI invariants stay red on each dispatched ci.yml run
  (they assume an `insufficient` raid cut exists in `wcl-coverage.json`, which the honest all-`failed` receipt no longer provides —
  a fixture assumption worth deriving from the data rather than asserting, but the receipt is honest and the page renders
  "collection failed · historical data retained" correctly).
- **Nothing merged anywhere.** No local `fetch-wcl.mjs` run (it would refuse identically and the local `wcl-fetch/evidence.json` is
  the gitignored 09-08 leftover); the 227 stored `(S2 Mythic: …)` rows keep their 09-14/15/16 dates, `wcl-coverage.json` untouched.
  Murlok / Mythicstats / SimC / Bloodmallet / WoWMeta not re-fetched — the 09-17 nightly covered all of them and today's will again.
- **Archon: six numeric requirements still `blocked`, day 26** — probe written up in tonight's refresh-tiers entry. Stored values, n and
  dates untouched.
- Robydoby not refreshed (closed zone-54 cycle, outside the contract).

## 2026-09-17 (nightly) — **Mythicstats receipt RECOVERED** (invalid -> success, 40 rows); SimC re-simmed (24, jitter only); Bloodmallet byte-identical; WoWMeta frozen at 09-15; **WCL RAID leaderboard cut came back `invalid`**; Archon walled day 25

- **Mythicstats — the 09-16 `invalid` cleared, 40 rows, `parse_error` -> `success`.** Reported from the trusted pre-agent collector only (`metrics-fetch/evidence.json`, checkedAt 15:18:18Z); I parsed no second copy. `/period/latest` HTTP 200 (233,769 B) resolving to **period 1081** — the SAME period id that failed to verify last night, so this is a completed/fixed upstream render rather than a new weekly roll. Receipt shape checks: rows 40, `omittedSpecs []`, roleCounts 27/7/6, **sum 99.9%** with role totals Ranged 32.2 / Melee 27.8 / Tank 19.9 / Healer 20.0 — the representation SHARE series, not the `/meta` per-key-presence column. Source publishes no update timestamp, so `dateBasis` stays `observed-undated-source`: **34** changed/new observations take the fetch date 2026-09-17 and the 6 unchanged shares keep their 2026-09-09/10/11 dates. Coverage 2026-09-11 -> **2026-09-17**.
- **Murlok — collector only, 40 rows.** Receipt `success`, three meta pages HTTP 200 first attempt (71,302 / 42,311 / 40,911 B), `sourceAsOf` **2026-09-17** from the pages' own `<time datetime>` (10:10:17-10:10:22Z), `dateBasis "source-time-datetime"`, `omittedSpecs []`. Merged ONLY `metrics-fetch/updates.json` (80 rows: 40 murlok + 40 mythicstats) through `apply-metrics.mjs`; `check-stable-metrics.mjs` passes.
- **SimulationCraft — genuinely fresh, `asOf` 2026-09-15 -> 2026-09-16, 24 rows.** `MID2_Raid.txt` HTTP 200, **1,439,604 B**, HAS a `DPS Ranking:` block so the text lane sufficed. Header read for era, never the Highcharts version: `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69814 Live (hotfix 2026-09-16/69814, git build HEAD 1e832c0849, no-networking)` — **HEAD moved** `66096c1dc1` -> `1e832c0849`, the honest explanation for values moving. 45 profile rows (Raid aggregate 221,047 skipped). ⚠️ The first line regex here expected an integer percent (`\d+%`) and the report writes `120.7%`, so it parsed **0 profiles on a healthy 1.4 MB fetch** — same silent-zero shape as the Icy Veins scale bug tonight; fixed to `[\d.]+%`. Longest-prefix mapping with hyphens allowed resolves `MID2_Demon_Hunter_Havoc_Fel-Scarred`, `MID2_Death_Knight_Frost_Rider`, `MID2_Rogue_Assassination_Deathstalker` correctly; the 5 tank profiles fall outside the DPS pool and Balance / Augmentation / Devastation are absent upstream. All 24 rows moved, all jitter: largest **Fire Mage +1.62%**, next Retribution **-1.23%**, median **+0.03%** — nowhere near `maxValueMovePct` 0.6, no ack needed.
- **Bloodmallet — byte-identical, coverage holds at 2026-09-16, 24 profiles.** All 27 DPS specs requested fresh (talent_target_scaling / castingpatchwerk), <=3 attempts each with a pause: 24 charts returned, **3** gave the 76-byte `{"status":"error"}` body on all three retries — Balance Druid, Augmentation Evoker, Devastation Evoker, the documented persistent-absence set and **the same three SimC is missing tonight**. Every chart carries `simc_settings.tier` **"MID2"** (read off the chart, never hard-coded) and `ptr` as the STRING `"0"` compared explicitly; pool stays tier-UNIFORM. `asOf` per chart's own `timestamp`: all 24 at **2026-09-16**. Pre-merge diff: **0 of 138 overlapping target rows moved >0.1%**, no spec joined or left. Upstream simply has not re-simmed since last night, so the coverage date correctly did not move and the row still records `success` (1 day old).
- **WoWMeta — frozen upstream, `partial`.** JSON API only (never the HTML prerender, never r.jina.ai). `manifest.json` snapshotDate **2026-09-15** AND the rankings file's `Last-Modified: Tue, 15 Sep 2026 09:33:36 GMT` agree, so this is a real freeze and not the 08-04 pinned-manifest shape — but the payload was still fetched and DIFFED (162,109 B, 44 blocks). Whitelist `{dps,hps,tank}` x `sortField === "lowerBound"` x `keyRange === undefined` -> 27+7+6 = **40** rows read from each block's **`rankings[]`** (an earlier pass looked for `data`/`rows` and found 0 — the key is `rankings`), 0 unmatched, 0 duplicates. Compared at the series' **stored 1-dp precision read off specs.json first** (raw 365.1441919678634 -> 365.1): **0 of 40 values, 0 n, 0 dates moved**, so nothing was merged. `partial` because the source-owned date is 2 days old on a 09-17 run; `maxAgeDays` is 8, so the heartbeat stays green.
- **WCL — nothing agent-side, and the RAID cut is `parse_error` tonight.** From `wcl-fetch/evidence.json` (15:16:59Z, verdict **partial**, oauth+graphql true, 2 of 3,600 hourly points): `wcl-leaderboard-mplus` **success, 320 rows** (min 280; zone 55 / partition 1 / difficulty 10 / size 5; rankingBracket 9 resolving to keystoneLevel **10**; discoveryVerified true; 0 omissions, 0 failures) and already merged by the collector before I started. `wcl-leaderboard-raid` **invalid, 0 rows** — all 320 cuts (40 specs x 8 pinned Mythic bosses, zone 53 / part 1 / diff 5 / size 20) returned *"Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration"*, so the collector refused rather than merging. Recorded `parse_error` per the contract: an invalid receipt needs a **reviewed** recipe/configuration fix, not an agent workaround. The 227 stored `(S2 Mythic: ...)` rows are retained byte-identical at 09-14/15/16, `data/wcl-coverage.json` untouched, `check-wcl-metrics.mjs` passes. Both `wcl-live-*` aggregates stay **unreachable** (no verified sanctioned endpoint; `rdps` is FFXIV-only and not a WoW outage test).
- **Archon: all six numeric requirements `blocked`, day 25** — measurement written up in tonight's refresh-tiers entry rather than repeated. Stored values/dates/`n` untouched (32 / 7 / 33 / 7 / 40 / 79 rows). The per-boss survivability dead end stays closed.
- **Robydoby not refreshed**: its sheets are the closed zone-54 PTR cycle and it is deliberately outside the refresh contract.


## 2026-09-16 (nightly) — **Bloodmallet AND SimC both re-simmed**, first time both moved on one night since the MID2 adoption; Murlok/WoWMeta steady; **Mythicstats receipt went `invalid`**; Archon walled

- **Bloodmallet — upstream re-simmed today, coverage date 2026-09-09 → 2026-09-16.** All 27 DPS specs requested fresh (talent_target_scaling / castingpatchwerk), ≤3 attempts each with a pause: **24 charts** returned, **3** returned the 76-byte `{"status":"error"}` body on all three retries — Balance Druid, Augmentation Evoker, Devastation Evoker, the documented persistent-absence set, and **the same three SimC is missing**, which is corroboration rather than coincidence. Every chart carries `simc_settings.tier` **"MID2"** (read off the chart, never hard-coded) and `ptr` `"0"` compared EXPLICITLY as a string; pool stays tier-UNIFORM. Targets read from `data["MID2"][count]` (already best-build) at 1/2/3/5/8/15. `asOf` per spec from each chart's own `timestamp`: **all 24 at 2026-09-16**. All 24 profiles moved — **value headroom checked BEFORE merging**: largest single row **Demonology Warlock 8T 643,345 → 985,086 = +53.1%**, under `maxValueMovePct` 0.6, and family medians move only **0.02 / 1.77 / 1.93 / 4.28 / 2.38 / 2.84 %** at 1/2/3/5/8/15T, far under `maxFamilyMedianMovePct` 0.35. **No `value_move_ack` needed and nothing was held back.** Row floor 15 and the 25% drop gate both clear at 24 (unchanged). `success`, because the source-owned date is today.
- **SimulationCraft — genuinely fresh, `asOf` 2026-09-12 → 2026-09-15.** `MID2_Raid.txt` HTTP 200, 1,439,459 B, and it HAS a `DPS Ranking:` block, so the plain-text lane was used. Header: `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69814 Live (hotfix 2026-09-15/69814, git build HEAD 66096c1dc1, no-networking)` — **the HEAD hash MOVED** (`ac0f3a3c7f` → `66096c1dc1`), which is the honest explanation for values moving. 45 profile rows (Raid aggregate skipped; block bounded by the first line that is not `<dps> <pct>% <profile>`), mapped by **longest-prefix with hyphens allowed** (`MID2_Demon_Hunter_Havoc_Fel-Scarred`, `MID2_Death_Knight_Frost_Rider` both correct), **0 unmapped**; the 5 tank profiles fall outside the DPS roster. 24 DPS rows, all moved, all small — largest **Fire Mage −1.5%**, everything else within ±0.1%. `asOf` is the report's hotfix date, never the run date. `success` (1 day old, inside the rule).
- **Murlok — collector only, 40 rows, 0 moves.** Reported from `metrics-fetch/evidence.json` (checkedAt 15:10:51Z), status `success`, 3 pages HTTP 200 in 1 attempt, roleCounts 27/7/6, `omittedSpecs []`, `sourceAsOf` **2026-09-15** from the pages' own `<time datetime>` (02:11Z), `dateBasis "source-time-datetime"`. Merged ONLY `metrics-fetch/updates.json`; I did not parse a second copy. `check-stable-metrics.mjs` passes.
- **WoWMeta — JSON API only, 40 rows, 0 moves.** `manifest.json` snapshotDate **2026-09-15**; `rankings/midnight/mplus/all/0.json` 162,109 B / 44 blocks fetched and diffed rather than short-circuited on the manifest date. WHITELIST of `{dps,hps,tank}` × `sortField === "lowerBound"` × `keyRange === undefined` → 27+7+6 = 40, 0 unmatched, 0 duplicates (melee/ranged are subsets of dps and would double-count 27 specs). Merged at the series' **stored 1-dp precision, read off specs.json before merging**; `n = numberOfCharacters`; 0 of 40 values, n, or dates moved. Letters not ingested.
- **Mythicstats — receipt status `invalid` (was `partial` yesterday), recorded `parse_error`, series preserved.** `/period/latest` HTTP 200 (287,409 B) redirected to **period 1081** (newer than yesterday's 1080), but **rows 0** landed and the receipt's own detail is "Mythicstats top-2000 population could not be verified", `sourceAsOf` null. An invalid receipt needs a **reviewed** parser/config fix (fixtures under `test/fixtures/stable-metrics`), not a bypass — I hand-rolled nothing. `updates.json` carries only the 40 murlok rows, so the whole "Top-2000 keys representation" series stays byte-identical at its 09-09/10/11 dates, no omitted spec zeroed, no date invented.
- **Archon: all six numeric requirements `blocked`, day 24.** `source-health/evidence.json` (15:10:48Z) recorded raid Heroic **403/cloudflare-challenge** and M+ **200/human-verification**; one further probe of the Mythic all-bosses page returned **403, 5,956 B, "Just a moment...", `__NEXT_DATA__` 0**. Reported as six separate rows so a partial recovery stays visible per series. All stored values/dates/`n` untouched (32 / 7 / 33 / 7 / 40 / 79 rows). The per-boss survivability dead end stays closed.
- **WCL: nothing agent-side.** The leaderboard rows were already merged by the deterministic collector (`wcl-fetch/evidence.json` 15:08:30Z, verdict `success`, oauth+graphql true, 2 of 3,600 hourly points): raid **227 rows** (min 200, zone 53 / part 1 / diff 5 / size 20, 93 empty-or-sparse cuts, 0 failed) and M+ **320 rows** (min 280, zone 55 / diff 10 / size 5, bracket 9 = +10, 0 sparse). `check-wcl-metrics.mjs` passes. `legacy` keeps both `wcl-live-*` aggregates **unreachable** — no verified sanctioned endpoint; `rdps` is FFXIV-only and its rejection is not a WoW outage. `data/wcl-coverage.json` untouched. Robydoby was not refreshed: its sheets are the closed zone-54 PTR cycle and it is deliberately outside the contract.

## 2026-09-15 (nightly, second run of the day) — Murlok 40 (collector), WoWMeta 40, Bloodmallet 24, SimC 24 — **0 value moves anywhere**; Mythicstats held; Archon walled

- **Murlok — from the trusted collector only.** `metrics-fetch/evidence.json` checkedAt 15:54:10Z, status `success`,
  three pages HTTP 200 in one attempt (71,302 / 42,311 / 40,911 B), roleCounts 27/7/6, `omittedSpecs []`, `sourceAsOf`
  **2026-09-15** from the pages' own `<time datetime>` (02:11:24–02:11:29Z). Merged ONLY `metrics-fetch/updates.json`
  (40 rows) — no second parser was written. **0 of 40 values moved.** `check-stable-metrics.mjs` green.
- **Mythicstats — `partial`, held for review, nothing merged.** Same receipt: `/period/latest` HTTP 200 (182,823 B)
  resolving to **period 1080**, role totals Ranged 27.9 / Melee 32.3 / Tank 20 / Healer 20 (sum 100.2%), but **rows 0**
  and detail *"Omitted Evoker|Devastation has a nonzero stored share; source held for review"* — four specs absent from
  the chart (Devastation, Fire Mage, Frost Mage, Affliction). The whole prior series stays byte-identical at 2026-09-11
  and the page snapshot stays 2026-09-11. `dateBasis: observed-undated-source`, so no date was invented.
- **WoWMeta — JSON API, `success`.** `manifest.json` completedAt 15T14:25:48Z / snapshotDate **2026-09-15**;
  `rankings/midnight/mplus/all/0.json` 162,109 B, `Last-Modified: Tue, 15 Sep 2026 09:33:36 GMT`. Whitelisted
  `categoryType ∈ {dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined` → 27+7+6 = **40 rows**, 0
  unmatched (className/spec byte-identical to the roster). Merged at the series' stored **1-dp** precision with
  `n = numberOfCharacters`. **0 of 40 values moved** — expected on a same-day recheck; the snapshot has not rolled since
  this morning. HTML never fetched.
- **Bloodmallet — `partial`, 24 of 27.** All 27 DPS specs requested, ≤3 attempts each. **Balance Druid, Augmentation and
  Devastation** returned the 76-byte error body on 3/3 retries each (the documented persistent-absence set; **Feral has
  rejoined** and now carries a chart). Every returned chart: `tier "MID2"`, `ptr "0"` (compared explicitly — `"0"` is
  truthy). Pool stays **uniform MID2**, no mixing. `asOf` taken per chart: 23 specs at **2026-09-09**, Feral at
  **2026-09-10** — never the run date. **0 of 144 target values moved, 0 dates moved.** Partial because the coverage date
  the contract measures is 6 days old; that red is the honest signal, not something to stamp away.
- **SimulationCraft — `partial`, 24 specs.** `MID2_Raid.txt` HTTP 200, 1,439,514 B, and it HAS a `DPS Ranking:` block, so
  the HTML lane was not needed. Header: `12.1.0.69814 Live (hotfix 2026-09-12/69814, git build HEAD ac0f3a3c7f)` —
  **the HEAD hash is unchanged from the committed state**, which is the honest explanation for **0 of 24 values moving**,
  said plainly rather than dressed up as a fresh sim. 45 profiles → longest-prefix map (hyphen allowed in the variant
  suffix) → 7 tank/healer profiles correctly fall outside the DPS roster → 24 best-hero-variant rows. Same three specs
  absent as Bloodmallet, which is a useful cross-check that the absence is upstream and not a parse bug.
- **Archon — all six numeric families `blocked`.** Cloudflare wall, evidence as recorded in the ptr/tiers logs; the
  per-boss survivability substitute is a measured dead end and was **not** attempted. Every stored Archon number keeps
  its 2026-08-24/25 date and value.
- **WCL — no agent-side request of any kind.** Rows reported from `wcl-fetch/evidence.json` (15:51:58Z, verdict
  `success`, 655.68/3600 hourly points): leaderboard raid `success` 227 rows = `landed` 227, leaderboard M+ `success`
  320 = 320; `legacy.wcl-live-raid`/`-mplus` both `unreachable` with the no-verified-aggregate-endpoint detail.
  `check-wcl-metrics.mjs --manifest` green. Closed PTR zone 52/54/56 rows and the S1 zone 46/47 rows untouched.
  Robydoby was **not** refreshed — it is a closed-cycle 12.1 PTR lane and deliberately outside the contract.

## 2026-09-15 (nightly) — WoWMeta UNFROZE after a week; SimC re-simmed again; Bloodmallet byte-identical a fifth run

- **WoWMeta — the standing red CLEARED by an actual upstream re-run, not by an ack.** JSON API only (two plain curls, no
  headers/proxy/auth): `manifest.snapshotDate` **2026-09-15** and the rankings file's `Last-Modified` (Tue, 15 Sep 2026
  09:33:36 GMT) agree, against 2026-09-08 on both for the previous six runs. 162,109 B payload diffed row by row rather
  than trusted to the manifest. Whitelist `{dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined` → 3
  of 44 blocks = **40 rows**, 0 unmatched (className/spec are byte-identical to the roster). All 40 values moved, all
  small — largest value delta Blood DK 365.9 → 365.1, largest population delta Arcane Mage 226,534 → 209,528 characters —
  nothing near `maxValueMovePct` 0.6. Stored at the series' own **1 dp**. `asOf` = the source's snapshotDate. **success.**
- **SimulationCraft — the git hash moved again, so this is a real sim.** `MID2_Raid.txt` HTTP 200, 1,439,514 B, and it
  carries a `DPS Ranking:` block, so the HTML lane was not needed. Header:
  `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69814 Live (hotfix 2026-09-12/69814, git build HEAD ac0f3a3c7f, no-networking)`
  — same build 69814 as 09-14 but HEAD **f8352efc00 → ac0f3a3c7f**. 45 ranking entries, Raid aggregate skipped,
  LONGEST-PREFIX mapping with a hyphen allowed → **24** DPS specs; the 7 unmapped entries are all tanks. **23 of 24 values
  moved and every move is noise** — largest Outlaw Rogue **-0.10%** (256,878 → 256,620), several under 0.01%. `asOf` = the
  report's own hotfix date **2026-09-12**, unchanged, 3 days old → `partial`. Balance / Augmentation / Devastation still
  absent upstream.
- **Bloodmallet — byte-identical for a FIFTH run, and a parser trap caught before it merged.** All 27 DPS specs requested
  (talent_target_scaling / castingpatchwerk), ≤3 attempts each: 24 charts, and the same persistent three returned the
  76-byte `{"status": "error"}` body on every retry (Balance Druid, Augmentation Evoker, Devastation Evoker) — **the same
  three SimC is missing**, which corroborates upstream absence over transport. ⚠️ The first parse in this session treated
  `data[<tier>][<count>]` as a per-build object to max over and produced **24 empty target maps** — the pre-merge diff
  reported "all 24 moved" with identical dates, which is what exposed it; the level is a bare number and is ALREADY
  best-build. Corrected before any merge. `ptr` compared against the STRING `"0"`; tier read off each chart → all 24
  `MID2`, pool uniform. 0 value moves, 0 tier changes, 0 profiles lost. Coverage date is the data's own **2026-09-09**,
  6 days → `partial`, and that red is the signal.
- **Murlok — success.** Trusted pre-agent collector only (checkedAt 15:17:34Z): 3 pages HTTP 200 (71,302 / 42,311 /
  40,911 B), 40 rows at 27/7/6, 0 omitted, source `<time datetime>` **2026-09-15T02:11:29Z**. Merged
  `metrics-fetch/updates.json` verbatim; `check-stable-metrics.mjs` passes.
- **Mythicstats — held for review, period 1080.** Collector `partial`: `/period/latest` → period 1080, HTTP 200,
  182,823 B, share column healthy (sum 100.2; Ranged 27.9 / Melee 32.3 / Tank 20 / Healer 20 — the representation share,
  not the `/meta` per-key-presence column). **Four** specs omitted upstream (Devastation Evoker, Fire Mage, Frost Mage,
  Affliction Warlock) and Devastation carries a nonzero stored share, so the whole source is held rather than merged
  partially. 0 rows in updates; stored 40-row series byte-identical at its own 2026-09-11.
- **Warcraft Logs — evidence only, no agent fetch of any kind.** From `wcl-fetch/evidence.json` (attemptedAt 15:15:15Z):
  raid bracket **success, 227 rows** (zone 53 / p1 / diff 5 / size 20, 8 pinned Mythic bosses, Nymrissa 3379 excluded) and
  M+ bracket **success, 320 rows** (zone 55 / p1 / diff 10 / size 5, rankingBracket 9 = exactly +10) — unlike 09-14 there
  was **no invalid cut**, so both brackets claim success. Across both, 547 cuts success and 93 sparse; sparse cuts land
  nothing and retain their prior observations. Transport: oauth+graphql, 7.6 points of a 3,600/hr limit, 138 queries.
  `legacy` still reports both `wcl-live-*` aggregates `unreachable`; the leaderboard series cannot and did not green them.
  `check-wcl-metrics.mjs` passes.
- **Archon: still walled, all six numeric families untouched** — 403 / "Just a moment" / `__NEXT_DATA__` 0 on all 11
  unique URLs; see the refresh-tiers entry. Per-boss survivability again NOT substituted for the empty aggregate.
- **Robydoby deliberately not fetched** — its two sheets are the closed 12.1 PTR zone-54 cycle's receipts, dormant between
  cycles and outside `required-sources.json` by design.
- 2026-09-15 (local, scheduled) — **Murlok's fresh daily cut merged and verified LOCALLY, then NOT pushed — superseded by tonight's nightly cut (same 2026-09-15 source date).**
  Run BEFORE today's nightly. `node src/fetch-stable-metrics.mjs` executed locally first (`metrics-fetch/` is gitignored, so no
  trusted nightly receipt was overwritten; checkedAt 2026-09-15T15:04:37Z). **Murlok `status: success`**: three meta pages HTTP 200
  (71,302 / 42,311 / 40,911 B), 27 DPS / 7 healer / 6 tank = **40 rows, 0 omitted**, every page's `<time datetime>` **2026-09-15T02:11Z**
  (was 2026-09-14T02:10Z). Merged ONLY `metrics-fetch/updates.json` through `apply-metrics.mjs`; no second parser. Pre-merge diff
  against HEAD: **38 of 40 values moved, 33 up / 5 down, max +0.99% (Augmentation 3245 → 3277), median |Δ| 0.26%** — one day of
  top-50 ceiling drift, nowhere near `maxValueMovePct`. Within-role ceiling ranks: **8 cells swapped in 4 adjacent pairs** (Devourer↔Havoc
  10/11, Shadow↔Fury 18/19, Survival↔Affliction 22/23, Augmentation↔Frost Mage 26/27) — the ▲▼ engine narrates those honestly.
  `asOf` = the source's own 2026-09-15. `check-stable-metrics.mjs` passes against the receipts. Registry `snapshot` for murlok
  deliberately not touched (gates nothing).
  **Mythicstats `partial` from the collector, held unchanged** — period **1080** again, but the omitted-upstream set has GROWN to four:
  Evoker|Devastation, Mage|Fire, Mage|Frost, Warlock|Affliction, and Devastation has a nonzero stored share, so the whole source is
  held rather than merged partially; 0 rows in `updates.json`, the stored 40 keep their 2026-09-11 date. Worth watching: the
  omission list has gone 0 → 2 → 4 specs across three days on the same period id.
  **Not attempted here (CI's job tonight, nothing residential-only about them):** WCL leaderboards (no local collection — the gitignored
  `wcl-fetch/evidence.json` is still the 09-08 local leftover, which is why `check-refresh --manifest` prints "wcl evidence … is not from
  this run"; no WCL row changed, so nothing needed vouching), Bloodmallet, SimC, WoWMeta. Archon's six numeric rows: walled day 22 from
  home (measured in refresh-tiers), nothing merged. Manifest deliberately left as the 09-14 nightly's record.
  **Side effect worth knowing: today is launch +28, and this run's `data/history/2026-09-15.json` is the first snapshot on or after
  the +28 settlement date**, so `dist/forecast-report.html` now renders the second checkpoint — **41 of 80 right vs 27 of 80 for
  carry-forward** (the +14 checkpoint read 40 / 27). Tonight's nightly rewrites the same-dated snapshot; letters did not move today,
  so the endpoint is the same either way. Chosen by date, not by anyone's action — no owner step is implied.
  **Why the data commit never shipped:** the nightly (run 34987153606) started while this run was verifying, and publish's `check-refresh-base` rejects newer `data/`
  or skill-log edits on master, so pushing would have failed the night red. The data commit was parked on branch `local-run-2026-09-15` and dropped once the
  nightly landed the same-day Murlok cut itself; these four log entries were re-applied on top of the nightly's commit (logs only, as on 09-13).
  **The +28 settlement also surfaced a stale TEST fixture, fixed in its own commit and pushed AHEAD of the nightly as code-only `7bde94d`:** `ui-invariants` read the report's FIRST `.result` and
  compared it with the banner, which summarises the LATEST settled checkpoint (`createForecastReport` takes `checkpoints.filter(c=>c.grade).at(-1)`).
  True while only +14 existed; today the first `.result` is the +14 count (40) and the banner says +28 (41), so the run went 608 → 607 pass
  the moment the snapshot landed. The locator now reads the `section.checkpoint-summary:has(#checkpoint-<settleDays>)` the banner points at —
  same intent, one section deeper. No application code changed; the banner behaviour is the 2026-09-08 owner design. Without the fix tonight's
  dispatched ci.yml would have gone red on the nightly's own 09-15 snapshot.


## Pruned 2026-09-30 (nightly)

Entries older than 2026-09-14 were removed here, per this file's own "keep the newest ~20"
rule: with tonight's entry the file had reached **237,605 bytes**, inside 25 KB of the Read
tool's 262,144-byte gate that made this log unreadable once before. 46 entries -> 20.
The pruned range was scanned for durable lessons first and held none that is not already in
SKILL.md: its ⚠️ notes were the Murlok `<a>`-attribute-order trap and the
`<time datetime>`-over-rendered-date rule (both in the Murlok recipe, and both moot agent-side
now that Murlok is collected deterministically), the Bloodmallet wholesale-hold reasoning (in
the Bloodmallet recipe), and the Mythicstats chart-departure case (the retirement rule, in the
Mythicstats recipe). The rest was run narrative.
