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
## 2026-09-08 (nightly) — **WoWMeta's standing red CLEARS** (40 rows, fresh 09-08 snapshot); SimC re-simmed (23 rows); Murlok and Bloodmallet byte-identical; Archon walled night 20

- **WoWMeta unfroze upstream — the owner-accepted standing red of 2026-08-21 is over.** Both
  JSON API files pulled with plain `curl`, no headers, no proxy, no auth, and the web page
  deliberately not touched (stale S3 prerender).
  · `manifest.json` → `completedAt 2026-09-08T14:03:05Z`, **`snapshotDate 2026-09-08`**
  · `rankings/midnight/mplus/all/0.json` → 162,405 bytes, **`Last-Modified: Tue, 08 Sep 2026
    09:11:42 GMT`**
  The two AGREE, so this is not the 2026-08-04 pinned-manifest shape — and the payload was
  diffed rather than trusted to the manifest either way. Selected the 3 blocks with
  `categoryType ∈ {dps, hps, tank}` **AND** `sortField === "lowerBound"` **AND** `keyRange`
  absent — **whitelisting** those three types, because `melee` and `ranged` are SUBSETS of
  `dps` and blacklisting only `dungeon` silently double-counts 27 specs. 27 + 7 + 6 = **40
  rows**, class/spec byte-identical to the roster, 0 unmatched. Merged `lowerBound` at **ONE
  decimal to match the stored series precision** (a precision mismatch reports a whole series
  as moved and writes a phantom movement story), `n = numberOfCharacters`,
  `asOf = manifest.snapshotDate`. **All 40 values moved, max 6.94%** (Frost Mage 296.9 → 317.5)
  — a week of real population drift, far inside `maxValueMovePct` 0.6 and
  `maxFamilyMedianMovePct` 0.35, so no ack was needed. Raid endpoint not touched: its
  `lowerBound` is DPS throughput on a different scale. **Row `success`** — coverage date is the
  run date. → previousAsOf 2026-09-01, newAsOf 2026-09-08.
- **SimC — re-simmed, 23 rows, ordinary jitter.** `MID2_Raid.txt` HTTP 200, 1,365,008 bytes, and
  it HAS a `DPS Ranking:` block this run, so the plain-text lane sufficed and the HTML chart
  parse was not needed. Era-verified off the HEADER build string, never the visible version:
  `12.1.0.69587 Live (hotfix 2026-09-04/69587, git build HEAD c1935b92f4)`. The HEAD hash moved
  and the values moved with it, so this is a genuine new sim rather than an unchanged parse;
  `MID1_Raid` was not read (in-progress stub since 09-01, not a fallback). 43 profiles, leading
  `Raid` aggregate row skipped, mapped by **LONGEST-PREFIX with a hyphen allowed** — which is
  what keeps `MID2_Death_Knight_Frost_Rider` and `MID2_Demon_Hunter_Havoc_Fel-Scarred` from
  vanishing — best hero-variant per spec → **23 DPS specs**. The 7 unmapped profiles are all
  tanks (Blood, Vengeance, Brewmaster, both Protections), excluded by design; Augmentation
  absent by design; Balance / Feral / Devastation still absent upstream. All 23 moved, median
  ≈0.04%, **max 1.65%** (Assassination 238,656 → 242,604). `asOf` 2026-09-08 taken from the
  report's own **Last-Modified (07:27:42 GMT)**, read off the response rather than assumed.
- **Murlok — collector `success`, but the SOURCE date has not moved → `partial`.** The trusted
  pre-agent `fetch-stable-metrics.mjs` (14:47:04Z) reports HTTP 200 on all three meta pages
  (71,302 / 42,311 / 40,911 bytes, 1 attempt each), 40 rows, roleCounts 27/7/6, 0 omitted specs.
  Merged ONLY `metrics-fetch/updates.json`; no second parser written. Every page's
  `<time datetime>` reads **2026-09-02T10:10Z** (`dateBasis: source-time-datetime`), so the
  merged `asOf` is 2026-09-02 and the coverage date is 6 days old. Nothing was re-dated to the
  fetch date to buy a green row — the `maxAgeDays 5` red IS the signal that Murlok has not
  re-run.
- **Mythicstats — `success`.** Collector: `/period/latest` → `/period/1079`, HTTP 200, 197,642
  bytes, 38 rows (25/7/6). Shape check holds: role subtotals Ranged 29.2 / Melee 30.7 / Tank
  20.1 / Healer 19.9, **sum 99.9** — the representation SHARE series, not the `/meta`
  per-key-presence column that runs 7–10× higher. Fire Mage and Affliction Warlock are omitted
  from this period's chart and their stored shares are **held for review, not zeroed**, so the
  family stays at 40 rows. Undated source, so changed rows take the fetch date (19 at 09-08)
  and identical values keep theirs (12 at 09-05, 8 at 09-07, 1 at 09-04); the **25th-freshest**
  `asOf` — the date the gate actually reads — is **2026-09-07**, one day old, which is why this
  is `success` and Murlok is not.
- **Bloodmallet — 23/27 charts, all MID2, values byte-identical → `partial`.** All 27 DPS specs
  requested at `talent_target_scaling/castingpatchwerk`, up to 3 attempts each. The same
  persistent 4 — **Balance, Feral, Augmentation, Devastation** — returned the 76-byte
  `{"status": "error"}` body on every retry, which is the documented upstream not-re-simmed
  state and exactly the 23-spec pool the 2026-09-03 wholesale MID2 adoption left. `simc_settings.ptr`
  compared **explicitly against the STRING `"0"`** (truthy in JS — a naive check discards all 23),
  and `simc_settings.tier` read off each chart rather than hard-coded: **all 23 read MID2**, so
  the pool stays tier-uniform. Targets from `data[<tier>][<count>]`, already best-build.
  Pre-merge diff **moved 0 of 138 target rows** and every chart timestamp is still 2026-09-05,
  identical to stored — upstream has not re-simmed. `asOf` is each chart's OWN timestamp, never
  the run date; stamping today is precisely what defeats this source's staleness gate, since
  the contract measures bloodmallet off `fightProfile.asOf` itself. Coverage 2026-09-05 is 3
  days old against `maxAgeDays 5`, so no age violation yet.
- **Warcraft Logs — collector-owned, agent hands off entirely.** I hold no credentials and made
  no warcraftlogs.com request. `wcl-fetch/evidence.json` (attemptedAt 14:45:00Z, verdict
  `success`) applied its own rows: **wcl-leaderboard-raid success, 217 rows** (320 cuts: 217
  success, 103 **sparse** — below the 10-entry minimum, so they correctly landed nothing rather
  than a thin median) and **wcl-leaderboard-mplus success, 320 rows**, all cuts clean. Budget:
  138 queries, 128 ranked batches, 119.5s, `abortReason` null. The two LEGACY rows stay
  `unreachable` from `evidence.legacy` — exact aggregate population medians still have no
  verified sanctioned endpoint, and the new per-encounter top-100-**entry** medians are a
  different quantity that cannot green them. `rdps` is an FFXIV-only enum; its rejection is not
  a WoW outage. `check-wcl-metrics.mjs --manifest` passes; `data/wcl-coverage.json` untouched.
- **Archon — walled, night 20, all 6 numeric rows `unreachable`.** Pre-agent source-health plus
  my own GET both confirm (403 cloudflare-challenge on raid, 200 human-verification on M+,
  `__NEXT_DATA__` 0). Stored rows retained at their own dates: 32 Mythic DPS + 7 Mythic HPS
  (08-25), 33 Heroic DPS + 7 Heroic HPS (08-24), 40 M+ score + 79 Popularity (08-25). Heroic
  numbers were NOT merged under a Mythic name; the Popularity groups still sum to 100.0 each.
  Per-boss survivability remains the measured dead end and was not substituted.
- **Robydoby not refreshed** — its series is zone-54 12.1 PTR data and that cycle is closed;
  the sheet lane is dormant alongside the other PTR zones. It is outside the contract by design.
- `check-stable-metrics.mjs` passes against the trusted receipts and git HEAD.

## 2026-09-07 (nightly) — SimC re-simmed (23 rows, ±0.2%); Mythicstats period 1079 (23 shares moved); Murlok/Bloodmallet/WoWMeta byte-identical; Archon walled

- **Murlok + Mythicstats via the trusted pre-agent collector only** — no second parser, neither host
  fetched by the agent. `metrics-fetch/evidence.json` checkedAt 16:03:57Z, both `success`.
  · **Murlok**: 3 pages HTTP 200 first attempt, 27/7/6 = 40 rows, `omittedSpecs` empty,
    `sourceAsOf` **2026-09-02** off the pages' own `<time datetime>` (10:10Z), not the fetch date.
    All 40 ceilings byte-identical → nothing changed. **partial** (source date 5d behind the run).
  · **Mythicstats**: `/period/latest` → **/period/1079**, a NEW weekly period. Shape checks are the
    thing that separates the representation share from the `/meta` per-key-presence column and they
    pass — **sum 100.0**, roles Ranged 29.7 / Melee 30.2 / Tank 20.0 / Healer 20.1. 38 rows
    (25/7/6); `omittedSpecs` Mage|Fire and Warlock|Affliction are both **stored zeros**, left with
    their own dates (09-04, 09-05) rather than refreshed or re-zeroed. **23 shares moved** (Arms
    10.9→11.8, Arcane 12.6→12.4, Demonology 5.1→4.7) taking 09-07; 15 identical rows kept 09-05.
    Merged ONLY via `apply-metrics.mjs metrics-fetch/updates.json`; `check-stable-metrics` passes.
    **partial**: coverage probe (min-25th-freshest of 23@09-07 / 16@09-05 / 1@09-04) reads 09-05.
- **SimulationCraft — a real re-sim, merged.** `MID2_Raid.txt` HTTP 200, 1,364,593 bytes, and it
  HAS a `DPS Ranking:` block this run, so the HTML fallback was not needed. Header build string is
  the era check, not any visible version: `12.1.0.69587 Live (hotfix 2026-09-04/69587, git build
  HEAD 8de87ce5b2)` — **the HEAD hash moved**, which is the honest explanation for the movement.
  `MID1_Raid.txt` fetched for the record and still the 272-byte stub with the same header; not a
  fallback. 43 profiles, `Raid` aggregate row skipped, **longest-prefix mapping with a hyphen
  allowed** → 23 of 27 DPS specs (the 7 unmapped names are all tank profiles). All 23 moved but by
  **0.998–1.001×** — ordinary re-sim noise, nowhere near the 0.6 value gate.
- **Bloodmallet — fetched, diffed, nothing merged.** All 27 DPS specs requested, up to 3 attempts
  each. 23 charts + the 76-byte `{"status":"error"}` body on **all** retries for Balance, Feral,
  Devastation and Augmentation — the documented post-adoption roster. `simc_settings.tier` read OFF
  each chart (all **MID2**, matching the stored pool, so a mixed-tier merge was impossible), `ptr`
  compared to the STRING `"0"`, targets from `data[<tier>][<count>]`. Per-chart timestamps all
  **2026-09-05** — the chart's own date. 0 values / 0 dates / 0 tiers moved. **partial**, which is
  the designed outcome on a night upstream has not re-simmed.
- **WoWMeta — fetched and diffed, still frozen upstream.** `manifest.json` snapshotDate 2026-09-01
  AND the rankings file's `Last-Modified` Tue 01 Sep 22:23:28 GMT **agree**, so not the 08-04
  pinned-manifest shape — but the payload was diffed anyway. Whitelist selection
  (`categoryType ∈ {dps,hps,tank}` + `sortField === lowerBound` + `keyRange === undefined`) gives
  6+27+7 = 40 rows, so melee/ranged could not double-count. All 40 `lowerBound` and all 40
  `numberOfCharacters` byte-identical at the stored 1-dp precision. **partial**, owner-accepted.
- **WCL: read the pre-agent evidence only; no warcraftlogs.com request from this session.**
  `wcl-fetch/evidence.json` attemptedAt 16:01:53Z — leaderboard raid **success 210 rows** (min 200)
  and M+ **success 320 rows** (min 280), `landed` agreeing with both; OAuth and GraphQL healthy,
  138 queries, no abort. `legacy.wcl-live-raid/mplus` remain `unreachable` (no verified sanctioned
  aggregate endpoint) and their 47 + 40 stored S1 rows keep their 2026-08-10 dates untouched.
  `check-wcl-metrics --manifest` passes; `wcl-coverage.json` left exactly as the collector wrote it.
- **Archon: all six numeric requirements unreachable, night 19.** See the refresh-tiers entry for
  the probe; `__NEXT_DATA__` 0 on all 11 URLs. Nothing merged, nothing re-dated. The 2026-08-21
  per-boss-survivability dead end was NOT re-run.
- **Robydoby: nothing to do.** Tab map fetched (HTTP 200, 52,770 bytes); the newest Mythic tabs are
  still the **24/7 M** week already stored at 2026-07-24. It is closed-12.1-PTR-cycle data and
  outside the refresh contract by design.

## 2026-09-06 (nightly, SECOND run of the day) — every family re-fetched and diffed, 0 values moved anywhere; Archon walled night 18

- **Murlok + Mythicstats: trusted collector only, merged, nothing moved.** `metrics-fetch/evidence.json`
  (`checkedAt` 2026-09-06T19:44:23Z) reports both providers `success`. Murlok: 3 pages HTTP 200 (71,302 /
  42,311 / 40,911 bytes), 40 rows, role counts 27/7/6, `sourceAsOf` **2026-09-02** from the page's own
  `<time datetime>` (`dateBasis: source-time-datetime`), 0 omitted specs. Mythicstats: `/period/latest`
  redirected to **period 1079**, 211,338 bytes, 39 rows, role counts 26/7/6, sum **99.9%** with role
  subtotals 30.7 / 29.2 / 20 / 20 — the share column, not the `/meta` per-key-presence column — and
  `sourceAsOf: null` / `dateBasis: observed-undated-source`, so the metric `asOf` stays the observation
  date **2026-09-05** on unchanged values rather than being restamped today. `Mage|Fire` is the one
  omitted spec and is recorded as such. No parser was reimplemented agent-side; only
  `node src/apply-metrics.mjs metrics-fetch/updates.json` was run — **79 rows applied, pre-merge diff
  moved 0 / same 79 / new 0** — and `node src/check-stable-metrics.mjs` passes.
- **Warcraft Logs: read from the pre-agent artifacts ONLY; no warcraftlogs.com request was made from
  this session by any means.** `wcl-fetch/evidence.json` `attemptedAt` 2026-09-06T19:42:16Z, verdict
  **success**, transport `oauth:true graphql:true`, 654.56 of 3600 points spent, 138 queries in 123s,
  `abortReason: null`. `wcl-leaderboard-raid` **success, 207 rows** (zone 53, partition 1, difficulty 5,
  size 20, floor 200); `wcl-leaderboard-mplus` **success, 320 rows** (zone 55, partition 1, difficulty
  10, size 5, floor 280). The collector had already applied its rows before the agent started — the
  working tree arrived with 1,539 changed lines in `specs.json` — so nothing was recomputed or edited
  here; `node src/check-wcl-metrics.mjs` passes ("historical and failed/sparse cuts retained exactly").
  These are per-encounter top-100-ENTRY medians, not population medians and not unique-player medians.
  `evidence.legacy` keeps **`wcl-live-raid` and `wcl-live-mplus` at `unreachable`**: exact aggregate
  population medians still have no verified sanctioned endpoint, their S1 observations stay dated
  2026-08-10 and untouched, and the new leaderboard series cannot green them. `rdps` is FFXIV-only and
  its rejection is not a WoW outage. Closed PTR zone 52/54/56 rows untouched.
- **Bloodmallet: all 27 DPS charts requested fresh, byte-identical result.** `talent_target_scaling/
  castingpatchwerk`, HTTP 200 on every request. **23 charts returned data** — every one `simc_settings.tier
  = MID2` (read off the chart, never hard-coded), `ptr` the STRING `"0"` compared explicitly, one uniform
  per-chart timestamp of **2026-09-05**, target counts 1/2/3/5/8/15 complete on all 23. The same four
  specs returned the 76-byte `{"status":"error"}` body — **Balance, Feral, Augmentation, Devastation** —
  each retried once before being recorded absent; Augmentation is absent by design. Pre-merge diff:
  **moved 0 / same 23 / new 0**, max target-value move 0.00%, so nothing was merged and `fightProfile.asOf`
  stays each chart's own 2026-09-05. Pool remains tier-uniform at 23 MID2 profiles.
- **SimulationCraft: fetched and diffed, and the report has NOT been regenerated since this morning.**
  `MID2_Raid.txt` HTTP 200, **1,364,686 bytes** with a `DPS Ranking:` block, so the `.html` fallback was
  not needed; `MID1_Raid` not consulted. Header build string (never the visible Highcharts version):
  `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69587 Live (hotfix 2026-09-04/69587, git build
  HEAD ce0f19435e, no-networking)`. **The HEAD hash is UNCHANGED at `ce0f19435e`** and `Last-Modified`
  is still `Sun, 06 Sep 2026 07:27:29 GMT` — the same artifact the 13:50Z run ingested — which is the
  honest explanation for an unchanged parse, not a fresh sim. 44 ranking lines = the Raid aggregate
  (skipped) + 43 profiles, mapped by LONGEST-PREFIX with a hyphen allowed, best hero-variant per spec →
  **23 of 27 DPS specs**; the 7 unmapped names are all tank profiles (Protection Warrior, Brewmaster,
  Protection Paladin ×2, Vengeance, Blood ×2), correctly excluded. All 23 values identical to stored, so
  nothing was merged and `asOf` correctly stays **2026-09-06** — the date basis is the file's own
  `Last-Modified`, not the header's `hotfix 2026-09-04`, which is the GAME build and would regress every
  row by two days.
- **WoWMeta: fetched and diffed, upstream still frozen — the OWNER-ACCEPTED STANDING RED holds.**
  `manifest.json` `snapshotDate` **2026-09-01** and the rankings file's `Last-Modified`
  **Tue, 01 Sep 2026 22:23:28 GMT** agree, so this is not the 08-04 pinned-manifest shape. The rankings
  payload was diffed rather than trusted to the manifest: 44 blocks, whitelisting
  `categoryType ∈ {dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined` (never merely
  blacklisting "dungeon" — `melee`/`ranged` are subsets of `dps`) gives 27+7+6 = **40 rows, 0 unmatched**,
  and **moved 0 / same 40**. Nothing merged; the 09-01 coverage date correctly did not move, which is why
  this row is `partial` and not `success`.
- 🛑 **ARCHON, NIGHT 18 — all six numeric requirements plus survivability unreachable together.** All
  eleven registered archon.gg URLs returned HTTP 403 with a Cloudflare `Just a moment...` interstitial and
  **`__NEXT_DATA__` count 0**; the pre-agent `source-health/evidence.json` independently recorded raid
  `cloudflare-challenge` (403) and M+ `human-verification` (200). Nothing was solved, replayed or proxied,
  and nothing was backfilled from Warcraft Logs — Archon's percentile cuts are Archon's own. Stored values
  and their 2026-08-24/25 dates are untouched; the staleness reds are the honest signal.
- **Robydoby not fetched: dormant by posture, not by failure.** Its two sheets are zone-54 12.1 PTR
  percentiles from the closed cycle, it is deliberately outside `required-sources.json`, and the
  between-cycles posture keeps the PTR lanes closed. Stored rows are historical receipts.
- `npm run test:quiet` **546 tests / 504 pass / 0 fail / 42 skipped** (Playwright absent, so the UI
  invariants did not run), then `npm run build` and `node src/snapshot.mjs`.

## 2026-09-06 (nightly) — SimC re-simmed overnight (23 rows, all sub-1.3% moves); every other family verified and unchanged; Archon walled night 16

- **SimulationCraft — a genuinely FRESH report, the first in several nights.** `MID2_Raid.txt`
  HTTP 200, 1,364,686 bytes, and it HAS a `DPS Ranking:` block (line 58), so the `.html` fallback was
  not needed; `MID1_Raid` was not consulted (272-byte stub, not a fallback). Era-verified off the
  report's own header build string, never the visible Highcharts version:
  `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69587 Live (hotfix 2026-09-04/69587, git build HEAD ce0f19435e, no-networking)`.
  **That HEAD moved — `aa9de89aac` -> `ce0f19435e`** — which is the honest explanation for a moving
  parse, and the file's own `Last-Modified` is `Sun, 06 Sep 2026 07:27:29 GMT`, i.e. regenerated this
  morning, so `asOf` is the run date 2026-09-06 (the header's "hotfix 2026-09-04" is the GAME build,
  not the report's date — stamping it would have REGRESSED all 23 rows by two days). Ranking block
  bounded to its 44 contiguous lines = the `Raid` aggregate (skipped) + 43 profiles, mapped by
  LONGEST-PREFIX with a hyphen allowed, best hero-variant per spec -> **23 of 27 DPS specs**; the 7
  unmapped names are all tank profiles (Prot Warrior/Paladin, Brewmaster, Vengeance, Blood x2), which
  is correct. **All 23 values moved, every one under 1.3%** (largest Unholy DK 239,944 -> 236,833,
  -1.3%; median move ~0.05%) — ordinary iteration noise on a re-sim, nowhere near `maxValueMovePct`.
  The four absent specs are the same Balance / Feral / Augmentation / Devastation set as bloodmallet.
- **Bloodmallet — all 27 DPS charts requested, 23 landed, byte-identical.** `talent_target_scaling/
  castingpatchwerk`, up to 3 attempts each. 23 charts HTTP 200 with real data; **Balance, Feral,
  Augmentation and Devastation returned the 76-byte `{"status": "error"}` body on 4/4 attempts each**
  — the same persistent set as the 2026-09-03 MID2 adoption, so they are simply still absent upstream
  rather than a transient. Every landed chart carries `simc_settings.tier = "MID2"` (read off the
  chart, never hard-coded) and `ptr` the STRING `"0"` (compared explicitly), so the pool stays
  tier-uniform at 23 and the `SIM_TIER_REQUIRED` / uniformity gates are satisfied. `asOf` taken from
  each chart's OWN `timestamp`: all 23 read **2026-09-05**, unchanged, and a pre-merge diff reported
  moved 0 / same 23 / new 0 with no stored profile missing from the fetch. Merged anyway; confirmed
  no-op. Coverage date therefore stays 2026-09-05 — one day old, inside the success rule.
- **Murlok and Mythicstats — read from the trusted pre-agent collector ONLY, never re-parsed.**
  `metrics-fetch/evidence.json` (`checkedAt` 2026-09-06T13:49:33Z): murlok `success`, 3 pages HTTP 200
  (71/42/41 KB), 27 DPS + 7 healer + 6 tank = 40 rows, `sourceAsOf` **2026-09-02** from the page's own
  `<time datetime>` (`dateBasis: source-time-datetime`), not the fetch date; mythicstats `success`,
  `/period/latest` -> `/period/1079` HTTP 200, 39 rows (`omittedSpecs: ["Mage|Fire"]`, held for review
  rather than given a phantom zero), role subtotals Ranged 30.7 / Melee 29.2 / Tank 20 / Healer 20
  summing to **99.9** — the share column, not the per-key-presence widget — and `dateBasis:
  observed-undated-source`, so unchanged rows keep their existing 2026-09-05 `asOf`. Applied ONLY via
  `node src/apply-metrics.mjs metrics-fetch/updates.json` (79 rows); a pre-merge diff reported
  moved 0 / new 0 / same 79, and `node src/check-stable-metrics.mjs` passed.
- **Warcraft Logs — evidence-only, no request made from this session.** `wcl-fetch/evidence.json`
  (`attemptedAt` 2026-09-06T13:47:23Z, verdict `success`): `wcl-leaderboard-raid` **success, 207 rows**
  (320 cuts: 207 success + 113 empty/sparse, 0 failed; floor 200) and `wcl-leaderboard-mplus`
  **success, 320 rows** (320/320 cuts success, floor 280) — the M+ bracket recovered from last night's
  invalid cut. `landed` matches both. The collector had already applied the rows before the agent
  started; `node src/check-wcl-metrics.mjs` confirms the working tree matches the trusted collection
  exactly, with historical and sparse cuts retained. `legacy` still records `wcl-live-raid` and
  `wcl-live-mplus` as `unreachable`: no verified sanctioned aggregate endpoint exists, and the new
  per-encounter top-100-ENTRY medians are a different quantity that cannot green those rows. `rdps`
  is FFXIV-only and its rejection is not a WoW outage. Closed PTR zones 52/54/56 untouched.
- **WoWMeta — fetched and diffed, nothing to merge; the standing red holds.** Two plain `curl` calls,
  no headers/proxy/auth: `manifest.json` 304 bytes -> `snapshotDate` **2026-09-01**, and
  `rankings/midnight/mplus/all/0.json` 161,730 bytes with `Last-Modified: Tue, 01 Sep 2026 22:23:28 GMT`
  — the two AGREE, so this is upstream frozen, not a pinned manifest (the 08-04 shape). 44 blocks,
  whitelisted `categoryType ∈ {dps,hps,tank}` + `sortField === "lowerBound"` + `keyRange === undefined`
  -> 27+7+6 = 40 rows; all 40 identical to stored at 1 dp, `n` unchanged. Nothing merged, coverage date
  correctly does not move. HTML never fetched.
- **Archon — walled night 16, all six numeric families red together.** See the refresh-tiers entry:
  11/11 registered URLs HTTP 403 Cloudflare interstitial, `__NEXT_DATA__` count 0, corroborated by the
  pre-agent `source-health/evidence.json`. Nothing merged, no stored value or date touched, no
  backfill from Warcraft Logs (hard rule 3).
- **Robydoby not refreshed** — deliberately outside the refresh contract, and its series is the closed
  12.1 PTR zone-54 cycle, which the between-cycles posture keeps dormant. Stored rows are historical
  receipts.

## 2026-09-05 (nightly, FOURTH run of the day) — every family verified, nothing moved; SimC date basis pinned to the report's own Last-Modified; Archon walled night 15

- **Murlok + Mythicstats — via the trusted pre-agent collector only.** `metrics-fetch/evidence.json`
  (checkedAt 2026-09-05T20:05:56Z) records Murlok's three meta pages at HTTP 200 first attempt
  (71/42/41 KB) with `sourceDate` **2026-09-02** off the page's own `<time datetime>`
  (`dateBasis: source-time-datetime`), 40 rows, 27/7/6 by role, no omissions; and Mythicstats
  `/period/latest` → **period 1079** at HTTP 200, 206 KB, 39 rows, `Mage|Fire` the single omitted
  spec, role subtotals Ranged 30.7 / Melee 29.2 / Tank 20 / Healer 20 summing to 99.9 (the
  representation SHARE column, not the `/meta` per-key-presence one), `sourceAsOf: null` with
  `dateBasis: observed-undated-source`. Merged `metrics-fetch/updates.json` verbatim through
  `apply-metrics` — 79 rows, **0 values moved, 0 dates moved, 0 new**. No second parser was
  written on either host. `check-stable-metrics` clean.
- **Bloodmallet — fetched fresh, byte-identical.** All 27 DPS specs requested at
  `talent_target_scaling/castingpatchwerk`, up to 3 attempts each: 23 real charts, and the same
  four returned the 76-byte `{"status": "error"}` body on 3/3 — **Balance Druid, Feral Druid,
  Augmentation Evoker, Devastation Evoker**, the persistent set the 09-03 MID2 adoption already
  dropped. Every chart carried `simc_settings.tier = MID2` (read off the chart, never assumed)
  and `ptr` the STRING `"0"`; per-chart `metadata.timestamp` dates all **2026-09-05**, SimC build
  `aa9de89`. Targets taken from `data["MID2"][<count>]`, which is already best-build. All 23
  profiles identical to stored in value, tier AND date; the merge landed a no-op. Pool stays
  tier-uniform at 23.
- **SimulationCraft — fetched fresh, byte-identical, and the date basis is now written down.**
  `MID2_Raid.txt` HTTP 200, 1.36 MB, and it HAS a `DPS Ranking:` block so the `.html` fallback was
  not needed. Header build string (not the visible Highcharts version):
  `SimulationCraft 1210-01 for World of Warcraft 12.1.0.69587 Live (hotfix 2026-09-04/69587, git
  build HEAD aa9de89aac, no-networking)` — the HEAD hash is unchanged from the previous two runs,
  which is the honest explanation for an unchanged parse rather than a fresh sim. 44 ranking lines
  = the `Raid` aggregate (skipped) + 43 profiles; longest-prefix mapping with a hyphen allowed
  resolves 23 of 27 DPS specs (same four absent as Bloodmallet), the 20 unpicked names being tank
  profiles and lesser hero variants. **Date basis, worth pinning:** the header's `hotfix
  2026-09-04` is the GAME build, not the report's date — the file's own `Last-Modified` is
  **Sat, 05 Sep 2026 07:28:33 GMT**, i.e. the report was regenerated today, which is why the
  stored coverage date is 2026-09-05 and why stamping the hotfix date would have REGRESSED 23 rows
  by a day for no reason. Merged at 2026-09-05; confirmed no-op.
- **WoWMeta — fetched and diffed, nothing to merge; OWNER-ACCEPTED STANDING RED continues.** Two
  plain curl calls, no headers/proxy/auth: `manifest.json` HTTP 200 (`snapshotDate` **2026-09-01**,
  `completedAt` 2026-09-01T22:25:20Z) and `rankings/midnight/mplus/all/0.json` HTTP 200, 162 KB,
  **Last-Modified Tue, 01 Sep 2026 22:23:28 GMT** — the two agree, so upstream is frozen rather
  than our fetch. 44 blocks; whitelisting `categoryType ∈ {dps,hps,tank}` + `sortField ===
  "lowerBound"` + `keyRange === undefined` gives 27+7+6 = 40 rows, all 40 identical to stored in
  value, `n` and date. `asOf` stays the source's own 2026-09-01, four days behind the run, so the
  row is **partial** by the success rule; the real alarm is `maxAgeDays: 8`, still unbreached.
- **Archon — all six numeric requirements unreachable, night 15.** Same wall as the tier lanes:
  11/11 URLs HTTP 403, Cloudflare `challenge-platform`, `__NEXT_DATA__` count 0; the pre-agent
  `source-health` receipt independently shows the 403 and the HTTP-**200** human-verification
  shapes on the two ordinary routes. Nothing parsed, nothing backfilled from Warcraft Logs, every
  archon `asOf` left standing (Mythic DPS/HPS/M+ score/Popularity 2026-08-25, Heroic DPS/HPS
  2026-08-24). Rows still emitted separately per the split-row rule so no single failure hides
  another. Per-boss survivability remains the measured dead end — not re-run.
- **Warcraft Logs — read from the pre-agent artifacts ONLY; no warcraftlogs.com request of any
  kind was made from this session.** `wcl-fetch/evidence.json` attemptedAt 2026-09-05T20:03:51Z,
  verdict `partial`: `wcl-leaderboard-raid` **success**, 207 rows (zone 53, partition 1, difficulty
  5, size 20, minRows 200; 207 successful cuts + 113 sparse); `wcl-leaderboard-mplus` **partial**,
  319 rows (zone 55, partition 1, difficulty 10, size 5, rankingBracket **9** = key +10,
  `discoveryVerified: true`, minRows 280) with exactly one failed cut — Elemental Shaman on
  encounter 12859, status `invalid`, "Ranking run timestamp is in the future". Legacy
  `wcl-live-raid`/`wcl-live-mplus` remain `unreachable`: no verified sanctioned aggregate endpoint
  exists, the new per-encounter top-100-entry medians are a different quantity, and `rdps` being
  FFXIV-only is not a WoW outage. Closed PTR zone-52/54/56 rows untouched.
  `check-wcl-metrics.mjs` clean, including against the manifest.
- **Robydoby not refreshed** — it is the closed 12.1 PTR zone-54 curation lane, outside the refresh
  contract by design, and the PTR cycle has been shut since 2026-08-18. Stored rows are receipts.
- Stored precision re-checked per series before every diff (integers for SimC/WCL, 1 dp for
  wowmeta's `lowerBound` and Archon popularity, rounded target counts for bloodmallet) so nothing
  reported phantom movement.

## 2026-09-05 — Supported WCL leaderboard collection (reviewed local implementation)

- Corrected the unsupported-rdps diagnosis: official schema identifies that enum as FFXIV-only; WoW dps/hps work with existing credentials.
- First bounded collection:138 requests in133.6s,207 raid +319 dungeon metric rows merged,40 specs attempted across8 bosses/8 dungeons.113 raid cuts were empty or below10 entries. One Elemental/Blinding Vale cut was withheld for an upstream timestamp ahead of the collection clock; no guard relaxed.
- Per-encounter top100-entry medians stay distinct from population medians and historical PTR receipts. New receipt checker verifies exact data, sample provenance and old-row retention against the independent pre-agent artifact. Schema and UI disclose repeated characters, sample window, checked time, role limits and source links.
- Current item tooltips also corrected4 tier-set descriptions and corroborated Demonology's4pc assignment; see historical-notes-reconciliation-2026-09-05.md. Partial local run: previous complete manifest preserved. Two new requirements will be accounted for by the post-merge full nightly.

## 2026-09-05 (nightly, THIRD run of the day) — every metric family verified, NOTHING moved anywhere

- **Murlok + Mythicstats via the trusted pre-agent collectors only** (metrics-fetch/evidence.json,
  checkedAt 18:47:04Z). No second parser was written and neither host was fetched from this session.
  Murlok: 3 pages HTTP 200 first attempt, 27/7/6 = 40 rows, sourceDate 2026-09-02 off the
  `<time datetime>` (dateBasis source-time-datetime) — three days behind the run, hence **partial**.
  Mythicstats: /period/latest -> period 1079, 39 rows, Mage|Fire the one omitted spec, sum 99.9 with
  role totals 30.7 / 29.2 / 20.0 / 20.0 against the page's printed 30.8 Ranged. `updates.json` merged
  through apply-metrics; a pre-merge diff showed **all 79 rows identical to stored in value AND asOf**,
  so both merges were no-ops. `check-stable-metrics` passes.
- **Bloodmallet 23/27 charts, byte-identical.** Same four persistent error bodies as since 08-31
  (Balance, Feral, Augmentation, Devastation; 3/3 retries each, 76 B `{"status": "error"}`). All 23
  carry `simc_settings.tier = MID2` READ OFF THE CHART and `ptr` as the STRING "0" compared
  explicitly; pool stays tier-uniform at 23, so no drop and no floor engaged. asOf is each chart's own
  timestamp, all 23 at 2026-09-05 — which is why bloodmallet is **success** tonight rather than the
  usual partial. All 138 target values unchanged.
- **SimC MID2_Raid.txt, 1.36 MB, has a "DPS Ranking:" block** so the .html fallback was not needed.
  Header build `12.1.0.69587 Live (hotfix 2026-09-04/69587, git build HEAD aa9de89aac)` — the SAME
  HEAD the earlier nightly merged, which is the honest explanation for an unchanged parse. 44 ranking
  lines = Raid aggregate + 43 profiles; longest-prefix mapping with a hyphen allowed gives 23 of 27
  DPS specs, and the 7 unmapped names are all tank profiles (Prot Warrior/Paladin ×2, Brewmaster,
  Vengeance, both Blood builds). All 23 values identical to stored. MID1_Raid not consulted.
- **WoWMeta fetched and diffed anyway** rather than trusted to the manifest: manifest.json
  snapshotDate 2026-09-01 (Last-Modified 09-01 22:55 GMT) AGREES with the rankings file's
  Last-Modified (09-01 22:23 GMT) — not the 08-04 pinned-manifest shape. 44 blocks, whitelist
  {dps,hps,tank} + sortField lowerBound + keyRange undefined = 40 rows, 40/40 roster-matched, all 40
  `lowerBound` identical at the stored 1 dp. Partial; the 8-day age gate is not yet due (4 days).
- **Archon: night 14 of the wall** — all nine archon-* rows unreachable together. See refresh-tiers'
  entry for the transport detail. Nothing parsed, nothing substituted from Warcraft Logs, no
  snapshot moved. Per-boss survivability stays the measured dead end it was recorded as on 08-21.
- **WCL: evidence file only.** No warcraftlogs.com request of any kind was made from this session.
  `wcl-fetch/evidence.json` attemptedAt 18:46:53Z, verdict `rdps-broken`: zone 53 enc 3470 and zone 55
  enc 12993 both return "Internal server error" on `metric: rdps` with 0 rankings, while the `dps`
  control returns 100 on each — upstream metric family, not access (oauth true, graphql true, 1/3600
  points). `landed` and `rawRecipes` both empty, so neither row may claim success and no dps-family
  number was dressed up as rDPS.
- **Robydoby deliberately not refreshed.** Its sheets are the CLOSED 12.1 PTR cycle's zone-54 testing
  parses; re-merging would re-date closed-cycle PTR receipts. It sits outside required-sources.json by
  design, so this costs no manifest row.

## 2026-09-05 (nightly, SECOND run of the day) — Murlok 13 and Mythicstats 21 values re-cut inside the same day; SimC and Bloodmallet byte-identical; Archon walled night 13

- **Murlok — 13 rows merged, and a parser bug caught by counting.** The first pass anchored on
  `<a class="…meta-item` and returned **26/6/6 = 38** instead of 27/7/6 = 40, because the **top-ranked
  entry on each page writes `href` BEFORE `class`**. The two specs it silently dropped were
  Augmentation Evoker and **Restoration Shaman — the #1 healer**, i.e. precisely the row a shortfall
  hides. Re-anchored on `<a [^>]*meta-item`: 27/7/6 = 40, 0 unmatched. (New trap, worth keeping.)
  Diffed at the stored integer precision: 27 identical, 13 moved, **all of them healer and tank rows**
  and all sub-0.5% (largest Protection Paladin 3532 → 3521). Merged under the source's own
  `<time datetime>` date **2026-09-02** — unchanged from stored, and not the rendered "Updated 6 hours
  ago" string, which disagrees with it — so the row is **partial**, the documented WoWMeta 08-04 shape.
- **Mythicstats — 39 rows merged, 21 moved.** `/period/latest` → period **1079**, the same weekly
  period as the last three runs, but the window rolls within the period. Parse bounded to the
  "Spec representation in top keys" section and read per `<li>` from the img alt + `<span class="mt-1">`
  (never a "first percentage" regex — the bar's `height:NN.NNNN%` precedes the value). Shape-checked
  before merging: series sums to **99.9** with role subtotals DPS 59.9 / Tank 20.0 / Healer 20.0,
  matching the page's own printed labels (Ranged 30.8%, Melee 29.2%, Tank 20%, Healer 20%) — that sum
  is the only thing distinguishing this column from the `/meta` per-key-presence one. Fire Mage is the
  one roster spec absent this period; its stored row is a 0, so it adds no phantom share. Largest move
  Arcane Mage 13.1 → 12.6.
- **SimC — fetched, diffed, byte-identical, nothing merged.** `MID2_Raid.txt` 1.36 MB with a real
  `DPS Ranking:` block at line 4315 (no .html fallback needed). Header build string
  `12.1.0.69587 Live (hotfix 2026-09-04/69587, git build HEAD **aa9de89aac**)` — **unchanged from the
  run the morning nightly merged**, which is the honest explanation for an unchanged parse. Block
  bounded strictly to the contiguous ranking lines, stopping at the blank line before `HPS Ranking:`:
  44 lines = Raid aggregate (skipped) + 43 profiles → 23 of 27 DPS specs by longest-prefix mapping
  (hyphen allowed), with the 7 tank profiles correctly unmatched. All 23 values identical.
- **Bloodmallet — fetched, diffed, byte-identical, nothing merged.** 27 specs requested with up to 3
  retries each: 23 real charts, and the same 4 returning the 76-byte `{"status": "error"}` body on 3/3
  each (Balance, Feral, Augmentation, Devastation — the set unchanged since 08-31). All 23 carry
  `simc_settings.tier = MID2` read off the chart, `ptr` the STRING "0" compared explicitly; pool stays
  tier-uniform at 23, so no drop and no ack. Per-chart timestamps all **2026-09-05**, equal to stored.
- **WoWMeta — fetched, diffed, nothing to merge; partial.** manifest `snapshotDate` 2026-09-01 and the
  rankings file's `Last-Modified` 2026-09-01T22:23Z **agree** (not the 08-04 pinned-manifest shape),
  and the payload was diffed anyway: 44 blocks → whitelist {dps,hps,tank} + `sortField lowerBound` +
  `keyRange undefined` = 40 rows, all 40 `lowerBound` identical at 1 dp.
- **Archon (all six numeric requirements) — night 13 of the wall**, 403 + Cloudflare interstitial with
  `__NEXT_DATA__` count 0 on all 11 registered URLs; `specRankingsSection` unreadable, so 32 + 7 + 33 +
  7 + 40 + 79 stored rows left byte-identical and no snapshot moved. Per-boss survivability was NOT
  substituted (the measured 2026-08-21 dead end stands).
- **Warcraft Logs — evidence-only, no request made from this session by any means.**
  `wcl-fetch/evidence.json` attemptedAt 2026-09-05T16:29:01Z, verdict **rdps-broken**: zone 53 enc 3470
  and zone 55 enc 12993 both returned "Internal server error" on `metric: rdps` with 0 rankings while
  the `dps` controls returned 100 each — upstream metric-family fault, not access (oauth true, graphql
  true, 1/3600 points). `landed` empty, so both rows are `unreachable` and the 26-day red stands as the
  owner-accepted signal. `dps`-family numbers were not substituted under the rDPS-labelled series.
- Robydoby not fetched: its sheets are 12.1-PTR-cycle artifacts from a closed cycle and it sits
  outside the refresh contract by design.

## 2026-09-05 (nightly) — Bloodmallet re-simmed the WHOLE pool overnight; SimC + Mythicstats fresh; Murlok's healer/tank pages re-cut inside the same calendar day

- **Bloodmallet — 23 profiles merged, coverage 09-02 -> 09-05.** 27 requested with up to 3 retries; the
  same 4 returned the 76-byte error body on 3/3 (Balance, Feral, Augmentation, Devastation — the set
  standing since 08-31). All 23 carry `simc_settings.tier = MID2` **read off the chart**, `ptr` as the
  STRING "0" compared explicitly, so the pool is tier-uniform against the stored MID2 pool and
  composition is unchanged at 23 (no drop). `asOf` is each chart's OWN timestamp and all 23 now read
  2026-09-05, up from 21@09-02 + 2@09-03 — a genuine whole-pool re-sim, not a run-date stamp. **All 138
  target values moved, max 4.54%**, so no `value_move_ack` is needed; this is what an ordinary re-sim
  looks like next to the 1.15-2.87x MID1->MID2 season jump that did need one.
- **SimC — 23 rows, asOf 09-05.** `MID2_Raid.txt` 1.36 MB, Last-Modified 2026-09-05T07:28:33Z, and it
  HAS a `DPS Ranking:` block **at line 58, directly under the header** — worth checking the line number,
  because the file also carries a long in-progress generation log further down and the two look alike in
  a byte count. Header build string (not the visible Highcharts version): `12.1.0.69587 Live (hotfix
  2026-09-04/69587, git build HEAD aa9de89aac)` — hash moved from 7d86fb9c3a, which is why values moved.
  44 ranking lines, longest-prefix map with hyphen allowed -> 23 DPS specs; the 7 unmapped are tank
  profiles. 23/23 rows moved, max **0.11%**, family median 240089 -> 239944: iteration noise.
- **Mythicstats — 39 rows, asOf 09-05, and the row count is the finding.** Period 1079 again (rolling
  window; 22 of 39 values moved). Parse bounded to the "Spec representation in top keys" `<figure>`,
  read per `<li>` from the img alt + `<span class="mt-1">`. Sum 100.2, role subtotals ranged+melee 60.3
  / tank 20.0 / healer 19.9 — the representation share, not the /meta per-key-presence column.
  **Fire Mage is absent from the chart this period.** Not a parse failure: it was published at 0.0 on
  09-04 and the other 0.0 specs (Frost Mage, Augmentation, Discipline) are still listed, so upstream
  dropped it. Its stored 0.0 row was LEFT STANDING at its 09-04 date rather than re-invented at today's
  — the group still sums to the same 100.2, so no stale share is carried, and the coverage date (25th-
  freshest, floor 25) still advances.
- **Murlok — partial, and the reason is a same-day re-cut.** The machine-readable `<time datetime>` is
  the source's own date; the rendered "Updated N hours ago" is baked at page build and here read 1-7
  hours against real cut times ~67 hours old. DPS unchanged at 2026-09-02T10:10:21Z, but healer and tank
  have moved to **18:17:55Z / 18:18:12Z** (the 09-04 run saw all three at 10:10:2xZ) — same DATE, later
  time. The data matches exactly: 27/27 DPS byte-identical, 13/13 healer+tank moved (max 0.3%). Merged
  all 40 at the source's own 2026-09-02 per the WoWMeta 08-04 precedent; the coverage date therefore does
  not advance and the row is honestly `partial`. **A same-date re-cut is invisible to a date-only
  change detector — diff the values every run.**
- **WoWMeta — partial, upstream still frozen at 2026-09-01.** manifest `snapshotDate` and the rankings
  file's Last-Modified agree (22:55:42Z / 22:23:28Z), so not the 08-04 pinned-manifest shape; payload
  diffed anyway — 44 blocks, whitelist {dps,hps,tank} + lowerBound + `keyRange === undefined` -> 40 rows,
  all byte-identical at 1 dp. Owner-accepted standing red continuing.
- **WCL — evidence file only, verdict `rdps-broken`.** No warcraftlogs.com request from this session.
  oauth true / graphql true / 1 of 3600 points, `landed` and `rawRecipes` both empty, so neither
  wcl-live row may claim success. Owner-accepted standing red since 08-18.
- **Archon — walled night 12**, all 11 URLs 403 + "Just a moment..." interstitial, `__NEXT_DATA__` 0.
  All six numeric requirements plus survivability recorded unreachable; nothing backfilled from WCL.
- Robydoby not fetched: its sheets are the closed 12.1 PTR cycle's zone-54 parses, deliberately outside
  the contract, and there is no live-season lane for them.


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
