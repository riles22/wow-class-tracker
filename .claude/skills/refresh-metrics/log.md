# refresh-metrics run log

Keep the newest ~20 entries; prune older ones when appending (prose is memory, not state —
parse counts and baselines the change detectors need live in the entries themselves).

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

- 2026-08-04 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). Scope: residential-only — the five WCL rDPS cuts CI recorded `unreachable`, plus
  the transcript queue (see watch-creators). Nothing CI already refreshed (tiers/archon/
  murlok/wowmeta/simc/bloodmallet/mythicstats/robydoby) was re-fetched or rewritten.
  · **ALL FIVE rDPS CUTS RESTORED; the curl finding held for the fourth consecutive run** —
  `curl` with the XHR header recipe cleared Cloudflare on the FIRST try for all 14 URLs
  (HTTP 200, no retries, no backoff, no challenge markers). Node `fetch()` was not attempted.
  The GraphQL `rdps` family is still 500 upstream and was not touched — the statistics table
  is a separate path and is what served these medians. · **Zone 46 live raid** (diff 5 / size
  20 / part 3, `amount`, `dpstype=rdps`): DPS 27/27, tank 6/6, healer HPS 7/7, healer DPS 7/7
  = 47 rows, parses 2,030-37,913 (raid DPS total 373,222). · **Zone 47 live M+** (diff 10 /
  size 5 / part 1): 27 + 6 + 7 = 40 rows, parses 19,893-352,375. · **Zone 56 PTR M+**:
  27 + 6 + 7 = 40 rows, parses 22-913 (total 5,669) — small-n as always. · **Zone 52 Dummy
  Dome** → `spec.ptrDummy`, 27 specs: 1T 27 / 2T 18 / 3T 15 / 5T 27, parses 1-252, coverage
  histogram {2 counts: 7 specs, 3: 7, 4: 13}. The "each spec appears twice" duplication did
  NOT occur again (third consecutive clean run); the dedupe-on-first-occurrence guard stayed
  in anyway. · **Zone 54 PTR raid still EMPTY upstream** (4 probes: Heroic 4/10 DPS + tank +
  healer, Mythic 5/20 DPS — all 9.14 KB fragments, headers render, zero data rows). Per the
  standing rule nothing was ingested and **the stored 34 rows AND that page's `snapshot` were
  both left at 2026-07-28.** · Integer rounding applied before merge per the 08-02 precision
  gotcha (fragment serves 2-decimal, stored convention is integer) — verified every stored
  value is an integer post-merge. · **VERIFICATION WORTH KEEPING: the two zone-46 healer cuts
  return identical parse counts (7,709-19,513, total 92,991) because they filter the same
  Healers population** — that is expected, NOT evidence of fetching one table twice. The check
  that settles it is the VALUES: HPS 160k-184k against healer-DPS 5k-33k. Confirm values, not
  parse counts, when sanity-checking those two. · Bumped `sources.json` snapshots to 2026-08-04
  for zones 46/47/56/52 ONLY. · 127 metric rows + 27 ptrDummy specs via apply-metrics.mjs,
  **0 unmatched**; diff verified scoped by source — `warcraftlogs` 127 moved / 192 untouched,
  and archon 160 / murlok 40 / mythicstats 40 / wowmeta 40 / simc 26 / robydoby 33 ALL
  byte-identical, with metric row count 658→658 and roster 40→40. npm test 229 (210/19/0),
  build OK 1107.4 KB, snapshot written, rebuilt after the snapshot. · **Manifest deliberately
  NOT touched** — partial run, so its five WCL rows still read the previous night's
  `unreachable` while the stored data is now fresh; the bounded one-day drift the local-run
  skill describes. `check-refresh --manifest` PASSED (exit 0) rather than failing its usual
  single line, because the nightly's `startedAt` was only ~1.9h old and inside the 12h window.
  · **wowmeta escalation still open and now one day closer**: upstream `snapshotDate` has been
  frozen at 2026-07-28 for eight days; its `maxAgeDays` is 8, so it breaches 2026-08-06 absent
  an upstream run. Untouched by this run — flagged for a human, not agent-fixable.

- 2026-08-02 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly, which itself was the second run of the day). Scope: residential-only — the five
  WCL rDPS cuts CI recorded `unreachable`. Nothing CI already refreshed (tiers/archon/
  murlok/wowmeta/simc/bloodmallet/mythicstats) was re-fetched or rewritten; the transcript
  queue was already drained to 0 by the nightly's deterministic step, so watch-creators had
  nothing residential to do. · **ALL FIVE rDPS CUTS RESTORED again; the 08-01 curl finding
  held exactly** — `curl` with the XHR header recipe cleared Cloudflare on the first try for
  every URL (HTTP 200, no retries, no backoff); Node `fetch()` was not attempted, per that
  entry's advice. The GraphQL `rdps` family is still 500 upstream and was not touched — the
  statistics table is a separate path and is what served these medians. · **PRECISION GOTCHA
  WORTH KEEPING: the stored WCL convention is INTEGER, the fragment serves 2-decimal values.**
  Merging raw would have shown 127/127 "moves" that are partly rounding noise — the same
  phantom-move shape wowmeta hit on 07-31. Verified every stored value across all four series
  is an integer, rounded before applying, then re-diffed. · **Zone 46 live raid** (diff 5 /
  size 20 / part 3, `amount`, `dpstype=rdps`): DPS 27/27, tank 6/6, healer HPS 7/7, healer DPS
  7/7 = 47 rows, parses 2,065-39,923 (raid DPS total 391,889). All 47 moved but **uniformly
  tiny — median 0.13-0.42%, max 1.16%** (healer-DPS cut), the one-extra-day-of-logs shape.
  · **Zone 47 live M+** (diff 10 / size 5 / part 1): 27 + 6 + 7 = 40 rows, parses
  20,465-374,422; median move 0.16-0.29%, max 1.40%. · **Zone 56 PTR M+**: 27 + 6 + 7 = 40
  rows, parses 20-765 (total 8,545); median ~1%, max 11.86% (Devastation Evoker
  229,895->257,167) — small-n volatility, expected and not a parse fault. · **Zone 52 Dummy
  Dome** -> `spec.ptrDummy`, 27 specs: 1T 27 / 2T 16 / 3T 13 / 5T 27, parses 1-250, coverage
  histogram {2 counts: 8 specs, 3: 9, 4: 10}. Moves up to 21.9% (Feral Druid 5T
  407,004->496,027) — tiny-n, as documented. **The "each spec appears twice" zone-52
  duplication did NOT occur this run either** (raw==rows on all four cuts, dupes=0) — second
  consecutive run without it; the dedupe-on-first-occurrence guard stayed in anyway. · **Zone
  54 PTR raid still EMPTY upstream** (4 probes: Heroic 4/10 DPS+tank+healer, Mythic 5/20 DPS —
  all 9.1 KB fragments, headers render but zero data rows, and the fragment carries WCL's own
  "50 public kills" aggregation-threshold note). Per the standing rule nothing was ingested
  and **the stored 34 rows AND that page's `snapshot` were both left at 2026-07-28.**
  · **Zone 57 Tidebound Grotto still empty** — 3 probes (Normal 3/10, Heroic 4/10, Mythic
  5/25) each returned the literal 114-byte "No statistics have been collected" message.
  · Bumped `sources.json` snapshots to 2026-08-02 for zones 46/47/56/52 ONLY. · 127 metric
  rows + 27 ptrDummy specs via apply-metrics.mjs, **0 unmatched**; diff verified scoped —
  only `warcraftlogs` series and `ptrDummy` moved, no roster/metric-count change, no other
  source touched. npm test 190 (178/12/0), build OK 995.5 KB, snapshot written, rebuilt after
  the snapshot. · **Manifest deliberately NOT touched** — partial run, so its five WCL rows
  still read the previous night's `unreachable` while the stored data is now fresh. That is
  the bounded one-day drift the local-run skill describes. `check-refresh --manifest` PASSED
  (exit 0) rather than failing its usual single line, because the nightly's `startedAt` was
  only ~2.6h old and still inside the 12h window.

- 2026-08-01 (LOCAL run, ~14:1xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). Scope: residential-only — WCL cuts CI recorded `unreachable` + the transcript
  queue. Nothing CI already refreshed (tiers/archon/murlok/wowmeta/simc/bloodmallet/
  mythicstats/robydoby) was re-fetched or rewritten. · **ALL FIVE rDPS CUTS RESTORED — and
  the transport finding is the reusable part: `curl` clears Cloudflare from this residential
  IP where Node's built-in `fetch()` does NOT.** A first probe using `fetch()` with the exact
  documented XHR-header recipe got HTTP 403 + `challenge-platform` on all five URLs; the same
  headers via `curl` returned HTTP 200 with full tables. This is a TLS-fingerprint block, not
  an IP block — so "the HTML endpoint works from residential" is only true through curl. Any
  future local run should skip the `fetch()` attempt entirely. (The GraphQL `rdps` family is
  still 500 upstream — this run went nowhere near the API; the statistics table is a separate
  path and is what served these medians.) · **Zone 46 live raid** (diff 5 / size 20 / part 3,
  `amount`, `dpstype=rdps`): DPS 27/27, tank 6/6, healer HPS 7/7, healer DPS 7/7 = 47 rows,
  parses 2,119–41,509. Moves vs the stored 07-31 values are uniformly tiny — every one of the
  47 moved, max 0.63% (Vengeance DH 75,770→76,248) — exactly the shape of one extra day of
  logs on a large population. · **Zone 47 live M+** (diff 10 / size 5 / part 1): 27 + 6 + 7 =
  40 rows, max move 1.30% (Arms Warrior 171,358→169,124). · **Zone 56 PTR M+**: 27 + 6 + 7 =
  40 rows, parses 19–688, max move 4.78% (Aug Evoker 253,022→240,921) — larger swings, small n,
  expected. · **Zone 52 Dummy Dome** → `spec.ptrDummy`, 27 specs: 1T 27 specs / 2T 17 / 3T 12 /
  5T 27 (parses 1–235), coverage histogram {2 counts: 8 specs, 3: 9, 4: 10}. Moves up to 23%
  (Windwalker Monk 5T 544,091→418,149) — tiny-n volatility, not a parse fault. **Parser note:
  the "each spec appears twice" duplication documented for zone 52 did NOT occur this run**
  (dupes=0 on every cut); the dedupe-on-first-occurrence guard stayed in anyway. · **Zone 54
  PTR raid is still EMPTY upstream** — all four probes (Heroic 4/10 DPS+tank+healer and Mythic
  5/20 DPS) returned 9.1 KB fragments with 0 spec rows. Per the standing rule, nothing was
  ingested and **the stored 34 rows AND that page's `snapshot` were both left at 2026-07-28**
  so the staleness stays visible rather than being papered over. · Bumped `sources.json`
  snapshots to 2026-08-01 for zones 46/47/56/52 ONLY. · `dpstype=dps` and `dpstype=rdps`
  return byte-identical tables for the zone-46 healer-DPS cut (verified), so
  "Median DPS (Mythic, healer)" carries no methodology ambiguity. · 127 metric rows + 27
  ptrDummy specs via apply-metrics.mjs, 0 unmatched. npm test 182 (170/12/0), build OK
  961.7 KB, snapshot written, rebuilt after the snapshot. · **Manifest deliberately NOT
  touched** — this was a partial run, so its rows still read the previous night's
  `unreachable` for these five cuts while the stored data is now fresh. That is the bounded
  one-day drift the local-run skill describes; tonight's nightly rewrites the file.

- 2026-07-31 (nightly CI, ~22:41Z — Opus 5; single-shot) · **WCL: agent holds no credentials;
  `wcl-fetch/evidence.json` (attemptedAt 22:38:03Z) is the only input and the verdict is
  still `rdps-broken`** — `characterRankings(metric: rdps)` on encounter 3176 returns HTTP
  200 with a bare "Internal server error" and 0 rankings, while transport is healthy (oauth
  true, graphql true, 1 point of 3600/hr). The five rDPS/normalized cuts are therefore
  `unreachable` and their stored data was not touched by any means. The three deterministic
  raw-DPS series landed BEFORE the agent started and were not re-fetched, recomputed or
  edited: **wcl-dummy-raw 103 rows** (1T 2000 / 2T 270 / 3T 164 / 5T 2000 players),
  **wcl-ptr-raid-raw 27** (6 of 8 Venomous Abyss bosses populated; Coiled Altar and Ula'tek
  returned 0 players — an untested window, not an error), **wcl-ptr-mplus-raw 27** (all 8
  dungeons, 1559–2000 players). · **Archon numbers**: re-read from
  `specRankingsSection.table.data[]`, never `tierList` — all four gated series emitted
  separately as the contract requires: 95th-pct DPS **33** rows (27 raid DPS + 6 tanks;
  healer `dps` column deliberately excluded), 95th-pct HPS **7**, M+ score **40**,
  Popularity **80**. Largest move in the whole Archon numeric set was 7.69% and it was Fire
  Mage popularity 0.65→0.6, i.e. under the gate's magnitude floor. **Survivability moved 6
  cells, all one band and all UPWARD** (Destruction Warlock / Resto Shaman / Resto Druid
  B→A; Fury Warrior / Preservation / Prot Paladin C→B), partially unwinding yesterday's 13
  downward moves — same tierLists array, same code path. · **WoWMeta** via the JSON API only
  (manifest.json + `rankings/midnight/mplus/all/0.json`, plain curl, no proxy): 44 blocks →
  whitelist `categoryType ∈ {dps,hps,tank}` **and** `sortField === "lowerBound"` **and**
  `keyRange === undefined` → 27+7+6 = **40 rows**, 0 unmatched, no melee/ranged
  double-count. **Recorded `partial`, not success: `snapshotDate` is still 2026-07-28** (3rd
  day unchanged) and asOf is the source's date, never today — all 40 values byte-identical,
  consistent with a genuinely frozen upstream snapshot. maxAgeDays 8 is not yet firing. · **Murlok**
  40/40, plain GET. Parser reminder that mattered again: segment between consecutive
  `class="...meta-item"` anchors and read the block's SECOND `.h3` (the first is the rank)
  plus the first number after `</svg>`; **one block on the DPS page carries no `href`, so
  href must be optional** or the parse throws. Alignment cross-checked against the href
  slug: 40/40 matched. 34 values moved, max 4.04% (Destruction Warlock 3738→3889), range
  3889–4352. · **Bloodmallet** 26/26 non-Augmentation profiles, `simc_settings.tier=="MID1"`
  asserted and the `ptr` flag compared against the STRING `"0"`. **All byte-identical** —
  simc_hash still 3344f0f (2026-07-08) for 25 specs and 7422280 (2026-07-15) for Elemental,
  so the batch has not re-run. · **SimC nightly** parsed from `MID1_Raid.txt` "DPS Ranking"
  (skip the leading `Raid` aggregate row, then 49 profiles; 6 tanks excluded, Augmentation
  absent by design) = 26/26, **all values byte-identical** — header still 1205-01 / WoW
  12.0.7.68887 / hotfix 2026-07-24, git HEAD f7ed532cb8, so the sim has NOT re-run since
  yesterday. · **Mythicstats** still period 1074 with the SAME counters as the last run
  (2000 keys / 10000 characters / 5080 unique / 21.3 avg key), so all 39 charted values are
  unchanged; **Devastation Evoker still has no bar** — an upstream absence, and writing a 0
  would be an inference, so its row was left alone. · **Robydoby (best-effort, deliberately
  outside the contract)**: htmlview tab map re-read, newest **Mythic** week is still 24/7
  (Sszorak #5 + Twin Fangs #6); the two CSVs were re-exported (note: `export?format=csv`
  307-redirects — curl needs `-L`) and all 24 DPS rows matched the stored 2026-07-24 values
  exactly, so nothing was written. Tidebound Grotto tabs skipped as required (zone 57 is not
  tracked). · npm test 176 (164/12/0), build OK 848.7 KB, snapshot written.

- 2026-07-14 (second same-day run, CI runner — Sonnet 5; builds on the earlier 07-14 run below, itself already committed) · **WCL live (zone 46 raid / zone 47 M+) INDEPENDENTLY RE-VERIFIED UNREACHABLE, and the structural cause is now nailed down** — reused ptr-watch's newly-cracked header recipe (OAuth token POST needs a browser User-Agent or Cloudflare silently empties the response; GraphQL POST additionally needs `Origin`/`Referer`/`sec-ch-ua` or you get a 403 challenge). With those headers the token mints fine and `characterRankings(metric: rdps)` still throws "Internal server error" on both zone 46 (Imperator Averzian, encounter 3176, difficulty 5/size 20/partition 3) and zone 47 (Algeth'ar Academy, encounter 112526, difficulty 10/size 5/partition 1) — byte-identical failure mode to zones 52/54/56, confirming this is a field-level API defect for this client, not a PTR-specific or query-specific gap. HTML fallback re-confirmed Cloudflare-challenged from this datacenter IP too. Per the ptr-watch finding, `dps`/`hps`/`wdps`/`default` metrics reportedly work but were NOT substituted — every stored metric name is rDPS-methodology and swapping in raw `dps` under the same name would misrepresent what's measured; flagging for a human decision whether a differently-named new metric is worth adding. No data changed, live medians stay at 07-09 asOf. · **Murlok** re-fetched fresh (all 3 role pages, plain GET, era-verified "Midnight Season 1 / Patch 12.0.7"): 40/40 rows, all 40 values byte-identical to the already-committed 07-14 figures (no-op re-confirmation, e.g. Aug Evoker/Unholy DK 4288 top, Destruction Warlock 3738 bottom). · **Mythicstats**: homepage index has no data table (fetch `/period/latest` instead) — period **1071 still current**, representation-share column re-confirmed (role subtotals 32.3+27.7+20+20=100%), all 40 values (incl. the recurring Restoration Druid affirmative-0, cross-verified via the Druid class breakdown summing to 100% without it) byte-identical to the committed 07-14 figures — stable, no drift. · **Bloodmallet**: 25/27 profiles re-fetched, `simc_settings.tier=="MID1"` and `ptr:"0"` confirmed on every response; all 25 profiles byte-identical to the committed 07-14 figures — upstream `metadata.timestamp` is still 2026-07-08 on every chart, i.e. Bloodmallet hasn't regenerated these sims in 6 days (worth flagging, not actionable here). Augmentation + Elemental Shaman still return `{"status":"error","message":"No standard chart with these values found."}` (same gap logged every run since 07-08) — kept last-known Elemental profile. Previously-flagged non-monotonic values (Assassination Rogue 15T<8T, Arms Warrior 3T<2T) persist unchanged. · **SimC nightly REFRESHED this run** (in scope this time, unlike 07-09/07-12/the earlier 07-14 run which skipped it): fetched the live `.txt` report fresh (WoW 12.0.7.68453, hotfix 2026-07-13, EndTime 2026-07-14 07:41 UTC — genuinely new nightly, not cached), parsed the `DPS Ranking:` table, took best hero-variant per DPS spec. 26/26 DPS specs (Augmentation absent as always — unsimmable support). Values shifted modestly vs the 07-09 baseline (e.g. Monk Windwalker 118368→115514, Warlock Demonology 118646→115636, both ~2.5% down; most others within ~1%) — plausible day-to-day sim noise plus the 07-13 hotfix, applied as genuine fresh values, asOf→07-14. · Updated `data/sources.json` snapshot dates for murlok/bloodmallet/mythicstats/simulationcraft (they were still showing 07-12/07-09 despite specs.json already carrying 07-14 data from the earlier run — closing that same gap on this layer). 106 metric rows (40 murlok no-op + 40 mythicstats no-op + 26 simulationcraft real update) + 25 fight profiles (no-op) applied via apply-metrics.mjs. npm test 65/65 pass, build OK (527.2 KB). `node src/snapshot.mjs` run (same-day file, no duplicate history entry).

- 2026-07-14 (nightly scheduled run, CI runner — Sonnet 5) · **WCL live (zone 46 raid / zone 47 M+) UNREACHABLE this run** — re-confirmed via a direct API call: v2 GraphQL `characterRankings` still errors server-side ("Internal server error") on a known-good live encounter (zone 46 Imperator Averzian, correct args) — same failure mode as every run since 07-08; HTML endpoint 403s from this datacenter IP as expected. No data fetched, existing live medians left unchanged at their 07-09 asOf (10th run in a row this layer has been stale — flagging that this WCL API gap looks structural, not transient, for a future interactive session to investigate). · **Archon numbers**: 160 rows (raid DPS 95th-pct 27 + HPS 7 + Popularity 40, mplus score 27 + Popularity 27; tank raid DPS 6 + Popularity 6 — all 40 specs × dps/hps/score + popularity across raid/mplus) via curl + `__NEXT_DATA__` parse, era-verified (lastUpdated 2026-07-13T12:00Z). **Bonus survivability re-fetch**: the same raid-DPS-page `__NEXT_DATA__` blob the tier-refresh agent pulled also carried the `survivability` metric tierList (all 3 raid roles, 40 rows) — merged via apply-metrics.mjs `survivability` key, asOf→07-14, no fetch cost beyond the tier pass. · **Murlok** 40/40 top-50 ceilings (all DPS/healer/tank roles; era-verified "Midnight Season 1 / Patch 12.0.7" on all 3 role-specific `/meta/{role}/m+` pages). · **Mythicstats** 40/40, period **1071 confirmed still current** via `/period/latest` redirect (no newer period published since 07-08 — over a week now on the same period, worth checking next run whether 1071 has closed), representation-share column re-confirmed via role-subtotal sum (32.3+27.7+20+20=100.0%); the 7 specs absent from the on-page table were cross-verified as genuine 0.0% via each class's own breakdown section rather than assumed. · **Bloodmallet** 25/27 profiles (MID1 confirmed on every response; each spec returned only a single build line this run, so no cross-build reconciliation was needed — simplest merge yet). Augmentation expected-absent (support spec); **Elemental Shaman still erroring upstream** ("No standard chart with these values found") — same gap logged every run since 07-08, kept last-known profile. Flagged two non-monotonic upstream values (Assassination Rogue 15T < 8T; Arms Warrior 3T < 2T) — reported as-fetched per the never-smooth policy, not corrected. **SimC nightly NOT fetched this run** (out of scope, as in the 07-12 run — only Bloodmallet's target-scaling API was pulled). 240 metric rows + 25 fight profiles + 40 survivability rows applied via apply-metrics.mjs (plus 282 tier rows from the same-night refresh-tiers pass — see that skill's log). npm test 54/54 pass, build OK (527.1 KB; combined run with ptr-watch/tiers/creators).

- 2026-07-12 (nightly scheduled run, CI runner — Sonnet 5) · **WCL live (zone 46 raid / zone 47 M+) UNREACHABLE this run** — independently re-confirmed the v2 GraphQL API's `characterRankings` field errors server-side ("Internal server error") even on a known-good live encounter (Imperator Averzian, zone 46) with fully correct difficulty/size/partition args — this is a genuine API-side/field problem for this client, not a query mistake or PTR-zone-specific gap; HTML fallback stays off-limits on this datacenter-IP runner. No data fetched, existing live medians left unchanged at their 07-09 asOf. · **Archon numbers**: 160 rows (raid DPS 95th-pct 27 + HPS 7 + Popularity 34, mplus score 27 + Popularity 27; tank raid DPS 6 + Popularity 6) via curl + `__NEXT_DATA__` parse, era-verified (lastUpdated 2026-07-11T12:00Z); popularity converted from Archon's raw 0-1 fraction to the tracker's 0-100 percentage convention before merge. · **Murlok** 39/40 top-50 ceilings (all DPS/healer/tank roles; era-verified "Midnight Season 1 / Patch 12.0.7"). · **Mythicstats** 40/40, period **1071** (still the current period — no newer one published since 07-08), representation-share column re-confirmed via the period detail page's role-bucket sum (32.3+27.7+20+20=100%); 5 rows for non-existent roster specs (Chrono Warden/Scalecommander/Voidweaver/Farseer/Hellcaller — hero-talent identities, not separate specs per the actual 40-spec roster) discarded before merge. · **Bloodmallet** 25/27 profiles (MID1 confirmed, all 6 target counts direct from the API — no cross-build reconciliation needed this run); Augmentation expected-absent (support spec); **Elemental Shaman's chart newly erroring** ("No standard chart with these values found" across all fight-style/chart-type variations tried, confirmed as a genuine upstream gap not a naming issue) — kept its last-known profile. **SimC nightly NOT fetched this run** (out of scope — only the Bloodmallet target-scaling API was pulled, not simulationcraft.org's MID1_Raid.txt report; that source's snapshot left unchanged). 240 metric rows + 25 fight profiles applied via apply-metrics.mjs (plus 352 tier rows from the same-night refresh-tiers pass — see that skill's log). npm test 54/54 pass, build OK (525.3 KB; combined run with ptr-watch/tiers/creators).

- 2026-07-09 (late-night local scheduled run, post-midnight — Fable 5) · **WCL live re-ingested, all 7 cuts — byte-identical to the evening ingest** (zone 46 Mythic raid DPS 27/771,830 · tank 6/112,709 · HPS 7/209,547 · healer-DPS 7/209,547; zone 47 M+ DPS 27/3,649,260 · tank 6/1,226,885 · HPS 7/1,224,931; WCL's 14-day window evidently recomputes less often than our cadence). Fetch gotcha: the HTML endpoint 403s Node's `fetch` even from this residential IP but passes **curl** with identical headers (TLS fingerprint) — use curl locally. · Via the 10-agent workflow (wf_78495b40-d2e): **Archon numbers** 160 rows (95th-pct DPS/HPS + M+ score + Popularity, small daily drift). **Murlok** 40/40 ceilings. **SimC nightly** 26 DPS specs (MID1 confirmed). **Mythicstats** 39 rows, period 1071 (Resto Druid absent again → keeps the evening's affirmative-0 row). **Bloodmallet** 25/27 profiles — Augmentation expected-absent, **Elemental still erroring upstream** → kept last-known profile. **Survivability** 40 rows applied (all three raid roles' tierLists populated). · 265 workflow metric rows + 87 live-WCL rows + 25 profiles merged via apply-metrics.mjs. npm test 54/54 pass, build OK (523.2 KB; combined run).

- 2026-07-09 (local evening run — restores the WCL live layer the CI run couldn't reach) · **WCL live REACHABLE (residential IP, HTML statistics endpoint with the XHR recipe; API creds present but the HTML path is the proven local recipe)** — all 7 cuts re-ingested, asOf→07-09: zone 46 Mythic raid DPS 27 specs/771,830 parses · tank 6/112,709 · HPS 7/209,547 · healer-DPS 7/209,547; zone 47 M+ DPS 27/3,649,260 · tank 6/1,226,885 · HPS 7/1,224,931. (Same comma-stripping parser as the PTR zones.) · **Archon numbers** 160 rows re-fetched (agent spot-check: values identical to this morning's, e.g. Blood DK raid 89361.93 — applied as no-op upserts; popularity fractions clean, sums ≈300 per bracket across the 3 role pools). · **Murlok** 40/40 ceilings (top: Aug/Unholy 4288, Devourer 4287; bottom Destruction 3738). · **Mythicstats** 40/40, period **1071 still in progress** (Resto Druid emitted as affirmative 0 — absent from both the spec list and the Druid class breakdown, which sums to 100% without it). · **SimC nightly** 26 DPS specs (MID1_ prefixes confirmed; best hero-variant per spec; Devourer implemented at 106,775; Augmentation absent as always). · **Bloodmallet** 25/27 profiles (simc tier MID1, sims dated 07-08): Augmentation expected-absent; **Elemental Shaman chart still missing upstream** ("No standard chart") — kept last-known profile, re-check next run. · 353 metric rows + 25 fight profiles applied this step (tier rows + survivability in refresh-tiers' entry). npm test 52/52 pass, build OK (485.8 KB; combined run).

- 2026-07-09 (nightly scheduled run) · **WCL live (zone 46 raid / zone 47 M+) UNREACHABLE this run** — v2 GraphQL API has no aggregate zone-wide statistics equivalent (only per-encounter rankings), and the HTML statistics-table fallback hit Cloudflare's 403 JS challenge on both zones from this CI runner's datacenter IP (consistent with every prior GitHub Actions run — works from residential IPs locally); no data fetched, existing live medians left unchanged at their prior asOf. · **Archon numbers**: 160 rows (raid DPS 95th-pct 33 + HPS 7 + Popularity 40, mplus score 40 + Popularity 40) — tank-raid popularity came back as a clean fraction this run (not the raw-DPS-instead-of-% quirk seen before), applied normally. · **Murlok** 40/40 top-50 ceilings. · **Mythicstats** 40/40, period **1071**, sourced from the `/period/1071` detail page's "Spec representation in top keys" section (not the homepage `/meta` widget, which this run's agent independently re-confirmed is a *different* per-key-presence metric, e.g. Guardian Druid 80%/Unholy DK 73% — validating the semantic-drift flag from two nights ago). Range 0.1–15.4%, sums ≈100.2% — passes the sanity check. · **SimC nightly** 26/26 DPS (Augmentation absent as always, best hero-variant Patchwerk DPS from `MID1_Raid.txt`). · **Bloodmallet** 25/26 profiles (MID1 confirmed); Elemental Shaman's chart still returns "No standard chart with these values found" (bloodmallet-side absence, same as prior runs) — kept its last-known profile. · 266 metric rows + 25 fight profiles applied via apply-metrics.mjs (plus 6 survivability rows and 318 tier rows from the same-night refresh-tiers pass — see that skill's log). npm test 48/48 pass, build OK (452.2 KB); combined nightly run with ptr-watch/tiers/creators (creators added 0 takes this run — YouTube datacenter-IP-blocked all 6 transcript attempts, logged as pending).

- 2026-07-08 (nightly scheduled run, later cycle — Opus 4.8; pull-every-source-every-run policy) · **WCL live medians re-fetched** (HTML statistics endpoint, residential IP): zone 46 Mythic raid (diff 5 / size 20 / partition 3) + zone 47 M+ (diff 10 / size 5 / partition 1; plural role tokens `Tanks`/`Healers`). **87 rows applied, asOf→07-08** (raid rDPS 27 + tank 6 + healer-HPS 7 + healer-DPS 7; M+ rDPS 27 + tank 6 + healer-HPS 7); evening medians (raid DPS 791k parses, M+ DPS 3.68M parses). · **Archon numbers re-fetched via agent** (fields from `props.pageProps.page.specRankingsSection.table.data[]`: `dps`/`hps`/`score`/`popularity`): 95th-pct DPS 27 (0 changed), 95th-pct HPS 7 (0 changed), M+ score 40 (0 changed), **Popularity 67 rows (27 raid + 40 mplus), 61 changed — all small live day-over-day shifts (<1.6×, no misparse)**. The 6 tank raid-95th-pct-DPS + tank raid Popularity not on Archon's raid-DPS page → kept prior values (not corrupted). · **Murlok top-50 ceilings** 40 rows (from server-rendered `/meta/{role}/m+`, NOT the WASM `/meta` shell) — 0 changed, range 3738–4288. · **Bloodmallet** 25/27 profiles — **all 25 byte-identical to the morning nightly sim (no-op)**; Augmentation + Shaman/Elemental return empty MID1 payloads (bloodmallet-side absence) → both correctly kept absent (Elemental fightProfile stays asOf 07-01, honest — unfetchable, not guessed). · **Mythicstats REFRESHED to period 1071 (MID1) — RESOLVES the morning run's flag.** The morning run skipped mythicstats over "semantic drift" (its /meta grab returned per-key-presence values, max 87, 16 zeros — wrong column). This run's agent read the **representation-SHARE column** (role subtotals Ranged 30.1 / Melee 29.6 / Tank 20.2 / Healer 20.1; **whole series sums to 99.8%**, matching the historical series' 100.4% sum, max 7.7 vs old 12.3) — the correct historical metric. Applied 40 rows asOf→07-08; 37 changed (real week-over-week: e.g. Devourer 7.2→3.9, Unholy 10.2→7.2, Blood 1.6→2.6). **Caveat:** period 1071 is IN-PROGRESS (~1550/2000 keys, early-week) so values will firm up as the week fills — but the column semantics are now confirmed correct (share-of-pool). · Merged via apply-metrics.mjs (87 + 40 + 181 rows, 25 profiles applied, all no-op except live WCL / popularity / mythicstats). npm test 48/48 pass, build OK (449.4 KB; combined run with ptr-watch/creators/tiers).

- 2026-07-08 (nightly weekly-freshness trigger — live metrics were asOf 2026-07-01, >6d old) · **WCL live medians refreshed (HTML statistics endpoint, residential IP).** Zone 46 Mythic raid (difficulty 5 / size 20 / partition 3 = 12.0.7) + zone 47 M+ (**recipe cracked: difficulty 10 / size 5 / partition 1** — the M+ page's difficulties array is empty so partition≠1001; also **role filter tokens are plural — `Tanks`/`Healers`, not Tank/Healer**, else the grid returns unfiltered). 87 rows: raid rDPS 27 DPS + 6 tank + 7 healer-HPS + 7 healer-DPS; M+ rDPS 27 + 6 tank + 7 healer-HPS. **Parse counts (`n`) dropped ~4-5× uniformly vs 07-01** (e.g. Devourer raid n 309k→65k) — NOT a recipe error: slot 9 (`14`) is a 14-day rolling sample, so this is genuine seasonal decay as 12.0.7 raiding winds down 2 weeks post-peak while attention shifts to the PTR; medians (135k-152k, compressed spread vs the old 122k-188k) are current and plausible. · **Web metrics via workflow (wf_a527f3e6-5d2):** Archon numbers 148 rows (raid 95th-pct DPS 27 + HPS 7, mplus M+ score 40, popularity 34) — pages lastUpdated 07-08; **+6 tank raid 95th-pct-DPS extracted by hand from the raid-tank page throughput tierList** (agent skipped that page). **Tank raid Popularity NOT refreshed** — Archon's raid-tank page renders DPS (not %) in its popularity tierList, so the 6 tanks keep 07-01 popularity (archon 07-01 ×6 residual). Murlok top-50 ceilings 40 (median Δ 0.4% vs old — consistent). SimC nightly MID1_Raid.txt 26 DPS (best hero variant per spec; WoW 12.0.7.68453 hotfix 07-07, live not PTR; Augmentation absent as always). Bloodmallet 25/27 fight profiles (MID1 confirmed); **Augmentation absent (unsimmable support, expected — matches prior 26 count)** and **Shaman/Elemental's chart returned "No standard chart with these values found" (bloodmallet-side absence) → Elemental keeps its 07-01 profile**. · **Mythicstats SKIPPED — semantic drift.** The live /meta values (period 1070) came back 7-10× the old series (max 87 vs old ~12, with 16 exact zeros) — looks like a per-key presence % rather than the historical representation-share metric. Rather than corrupt the series under the same name, kept mythicstats at asOf 2026-07-01 and left its snapshot at 07-01. **FLAG for a human/interactive session: re-derive which mythicstats column matches "Top-2000 keys representation."** · Merged via apply-metrics.mjs (87 + 220 rows, 25 profiles). Snapshots → 07-08 for warcraftlogs/murlok/bloodmallet/simulationcraft; mythicstats left 07-01. npm test 47/47, build OK (416.6 KB).

- 2026-07-01 (backfilled — the initial full metrics pass predated this log): WCL live
  medians (zone 46 Mythic raid + zone 47 M+) for all 40 specs, Archon 95th-pct +
  popularity, Murlok top-50 ceilings, Mythicstats top-2000 representation, SimC nightly
  Patchwerk, Bloodmallet talent_target_scaling fight profiles (26 DPS specs, MID1).
  Merged via apply-metrics.mjs; asOf 2026-07-01 across the quantitative layer.

- 2026-07-17 (nightly recovery run — Opus 4.8): full quantitative refresh.
  **Murlok** 40/40 top-50 ceilings (plain GET; all values byte-identical, stable).
  **Bloodmallet** 26/27 DPS fight profiles (talent_target_scaling/castingpatchwerk, MID1
  + ptr:0 confirmed; Augmentation absent by design; **Elemental Shaman RECOVERED** a fresh
  chart after being stuck at 2026-07-01; other 25 byte-identical). **SimC nightly** 26/26
  DPS (SimC 1205-01, WoW 12.0.7.68453 Live hotfix 07-13; ≤2.0% nightly deltas, Enhancement
  largest). **Mythicstats** period 1071→1072 (via /period/latest redirect), 40/40 computed
  as class% × within-class spec%; role subtotals re-verified Tank 20.0 / Healer 20.1 /
  DPS 60.1, total 100.2. **Archon survivability** recovered (40 rows, merged via
  apply-metrics survivability key). **WCL: 5 zones UNREACHABLE** — pre-agent
  wcl-fetch/evidence.json verdict rdps-broken (characterRankings metric:rdps → Internal
  server error on enc 3176, 0 rows landed); agent holds no WCL creds and did not fetch
  warcraftlogs.com; zones 46/47/52/54/56 left at 2026-07-09 baselines. npm test 85/85, build OK.

- 2026-07-17 (nightly — Opus 4.8) · Murlok 40/40 (byte-identical), Bloodmallet 26/26 MID1+ptr:0
  (byte-identical), SimC 1205-01 26/26 (same nightly build, 0 deltas), Mythicstats P1072 40/40
  (6 specs ±0.1, live intra-period churn). **WCL: evidence.json verdict rdps-broken** (metric:rdps
  → Internal server error on enc 3176); agent holds no creds, did not fetch warcraftlogs.com;
  zones 46/47/52(rDPS)/54/56 left at 07-09. **wcl-dummy-raw LANDED**: fetch-wcl.mjs merged 103
  raw-DPS medians (1T:2000 2T:149 3T:109 5T:1481 players) before agent start. npm test 88/88, build OK.

- 2026-07-17 (nightly late run — Fable 5) · Murlok 40/40 plain GET (byte-identical to same-day
  baseline). Bloodmallet 26/26 talent_target_scaling, MID1 + ptr:0 confirmed on every chart,
  0 profile changes. SimC MID1_Raid.txt same engine build (1205-01, WoW 12.0.7.68453 hotfix 07-13)
  but a FRESH nightly sim — 26/26 DPS specs, 26 value deltas vs HEAD (normal nightly variance).
  Mythicstats period 1072 MID1 via /period/latest (direct per-spec % list this time), 40/40,
  sum 100.2, byte-identical. **Archon numbers refreshed 07-14→07-17** (specRankingsSection precise
  values; upstream lastUpdated 07-16T12:00Z): 152 value updates across 95th pct DPS/HPS, M+ score,
  Popularity. WCL: evidence.json verdict rdps-broken (metric:rdps 500 on enc 3176) — zones
  46/47/52(rDPS)/54/56 unchanged at 07-09; agent holds no creds, fetched nothing from WCL. Raw-DPS
  series (dummy 103 rows + NEW zone-54/56 pooled 27+27) merged by the deterministic pre-agent step.
  npm test 91/91, build OK.

## 2026-07-17 (nightly, later) — metrics all re-fetched live, stable
Murlok 40/40 top-50 M+ ceilings (plain GET; era-verified, 12.1 hits were SVG coords), 0 changes.
Bloodmallet 26/26 non-Aug DPS profiles (MID1+ptr:0 confirmed), 0 target changes. SimC nightly
1205-01 / WoW 12.0.7.68453 Live (hotfix 07-13) 26/26 best-variant, 0 deltas (build unchanged since
last fetch). Mythicstats period 1072 40/40, sum 100.2%, 0 changes. Archon numbers re-merged (160
rows), 0 value changes (upstream lastUpdated 07-16T12:00Z unchanged). WCL evidence.json verdict
rdps-broken (metric:rdps 500 on enc 3176) — zones 46/47/52(rDPS)/54/56 stay 07-09; agent no creds,
fetched nothing. Raw-DPS series (dummy 103 + zone-54/56 pooled 27+27) merged pre-agent. npm test
91/91, build OK.

## 2026-07-17 (nightly, latest) — all live metrics re-fetched, 0 changes; WCL rdps still broken
Murlok 40/40 (plain GET; top-50 avg M+ rating 3738–4288; 12.1 hits were SVG coords, no season flip),
0 changes. Bloodmallet 26/26 non-Aug DPS (talent_target_scaling/castingpatchwerk, MID1 + ptr:0 on
every chart), targets at 1/2/3/5/8/15, 0 changes. SimC nightly MID1_Raid 1205-01 / 12.0.7.68453 Live
(hotfix 07-13, build unchanged) 26/26 best-variant, 0 deltas. Mythicstats period 1072 40/40 sum
100.2%, 0 changes. Archon numbers 160 rows (95th pct DPS/HPS, M+ score, Popularity), 0 value changes.
WCL evidence.json verdict rdps-broken — zones 46/47/52(rDPS)/54/56 stay 07-09 (agent holds no creds,
fetched nothing from warcraftlogs.com); raw-DPS series (dummy 103 + zone-54/56 pooled 27+27) merged
by the deterministic pre-agent step. npm test + build below.

## 2026-07-17 (nightly, 16:45Z) — all live-number sources re-fetched, 0 value changes
Murlok (3 pages, plain GET): 40 top-50 ceiling rows (range 3738-4288), 0 changes; the three "12.1"
hits are SVG path coords, not a season flip. Mythicstats (r.jina.ai /period/latest): period 1072
MID1, 40 specs, sum 100.2%, 0 changes. SimC nightly (MID1_Raid.txt, 1205-01 / 12.0.7.68453 Live /
hotfix 07-13): 26 best-variant DPS rows, 0 changes. Archon numbers (__NEXT_DATA__ specRankingsSection):
160 rows (33 DPS + 7 HPS + 40 M+score + 80 popularity), 0 value changes (dropped a stray `n` field I
first added — restored to the stored no-`n` shape so the merge is a true no-op). Bloodmallet (26 DPS
charts, talent_target_scaling/castingpatchwerk; MID1+ptr:0 confirmed each): 26 profiles, 0 target
changes. Archon per-encounter tiers (51 pages, 9 bosses throughput + 8 dungeons score × 3 roles):
680 cells, all 40/40 specs, 0 changes — encounter-tiers.json left unchanged. Archon survivability:
tierList EMPTY (tiers:[]) on all 3 raid pages again (throughput full 27/7/6) — transient upstream,
40 stored rows unchanged. WCL: agent holds no creds; evidence.json verdict rdps-broken → 5 rDPS cuts
unreachable (2026-07-09 baseline), 3 raw cuts merged by the deterministic step (103/27/27). apply-metrics
266 metrics + 26 profiles → no-op; only the deterministic WCL raw rows differ in the working tree.

## 2026-07-18 (nightly) — all live-number sources refreshed; Archon numbers drifted, WCL still rdps-broken
Archon numbers (specRankingsSection, 160 cells) re-parsed live — 149 small drifts (95th-pct DPS/HPS,
M+ score, Popularity) from the rolling window; ingested, asOf 07-18. Murlok 40/40 plain GET, 0 value
changes (parser now anchors on href to catch reversed href/class attribute order). Bloodmallet 26/26
DPS profiles (MID1+ptr:0), 0 target changes. SimC nightly MID1_Raid .txt (1205-01, WoW 12.0.7.68453
Live, hotfix 07-18) 26/26 best-variant, small nightly deltas (hyphen hero-variant + anomalous 0% block
handled via max). Mythicstats period 1072 unchanged (Fortified/Tyrannical) — same distribution, 40 rows
re-stamped current. WCL: agent holds no creds; evidence.json verdict rdps-broken → 5 rDPS/normalized cuts
unreachable (2026-07-09 baseline), 3 raw cuts merged by the deterministic step (dummy-raw 103, ptr-raid-raw
27, ptr-mplus-raw 27), asOf 07-18.

## 2026-07-19 (nightly) — Murlok/SimC/Mythicstats/Bloodmallet refreshed; WCL evidence-only (rdps-broken)
Murlok 40/40 (27 DPS+7 heal+6 tank) plain GET, parsed by spec-name h3 (handles reversed href/class order),
range 3738–4288, 0 value changes vs stored (Murlok ~8h refresh). SimC MID1_Raid.html (37MB): era-verified
WoW 12.0.7.68453 Live hotfix 2026-07-18, SimC 1205-01 (the visible "12.3.0" is Highcharts JS, not WoW) —
26/26 DPS best-variant per spec, all 26 shifted (nightly sim variance). Mythicstats Period 1072 (ongoing
reset): representation section 39 specs (Resto Druid absent = negligible top-2000 presence, kept at stored
0.1), 38/39 values moved vs stored (an ongoing period's distribution evolves daily — prior run's "no change"
was a same-day coincidence). Bloodmallet 26 non-Aug DPS talent_target_scaling, MID1 + ptr(=string "0")
confirmed, 0 target changes vs stored. **WCL**: agent holds no creds; wcl-fetch/evidence.json verdict
`rdps-broken` (characterRankings metric:rdps → Internal server error on enc 3176) → the 5 rDPS/normalized
cuts (live raid/mplus, PTR raid/mplus, dummy-dome) unreachable, data unchanged at 2026-07-09 baseline. The
3 raw cuts were merged by the deterministic src/fetch-wcl.mjs BEFORE the agent: wcl-dummy-raw 103 rows
(players 1T:2000/2T:172/3T:115/5T:1642), wcl-ptr-raid-raw 27 (6 of 8 bosses populated; Coiled Altar & Ula'tek
0 = untested), wcl-ptr-mplus-raw 27 (all 8 dungeons). asOf 07-18→07-19 on the merged/refreshed families.

## 2026-07-19 (21:1xZ, 2nd nightly run)
Murlok 40/40 top-50 M+ rating ceilings (range 3738-4288), 0 changes. Bloodmallet 26
non-Aug DPS talent_target_scaling, MID1 confirmed, 0 target changes. SimC nightly
MID1_Raid (12.0.7.68453 Live — no season flip) 26/26 best-variant DPS, 0 changes.
Mythicstats period 1072 (ongoing reset) 39 specs (Resto Druid absent), 0 changes.
**WCL**: agent holds no creds; evidence.json verdict `rdps-broken` → the 5
rDPS/normalized cuts (live raid/mplus, PTR raid/mplus, dummy-dome) unreachable, unchanged
at 2026-07-09 baseline. 3 raw cuts merged by the deterministic fetch step BEFORE agent:
wcl-dummy-raw 103 (players 1T:2000/2T:175/3T:122/5T:1695), wcl-ptr-raid-raw 27 (6/8
bosses; Coiled Altar & Ula'tek 0 = untested), wcl-ptr-mplus-raw 27 (all 8 dungeons). asOf 07-19.

## 2026-07-20 (nightly) — Murlok/SimC/Mythicstats/Bloodmallet/Archon# refreshed; WCL evidence-only (rdps-broken)
Murlok 40/40 (27 DPS+7 heal+6 tank) plain GET, spec-page card (href slug → first 4-digit li rating), range
3738-4288, 0 value changes (Murlok ~8h refresh, top-50 stable). SimC MID1_Raid.txt (1.5MB): era 12.0.7.68453
Live (hotfix 07-18) — 26/26 DPS best hero-variant per spec from Player: MID1_ sections (tanks/healers/Aug
excluded), all 26 shifted (nightly sim variance). Mythicstats period 1072 via r.jina.ai /period/latest
(homepage lacks % data): 39 specs (Resto Druid absent, kept stored), 0 changes. Bloodmallet 26 non-Aug DPS
talent_target_scaling, MID1 confirmed, counts 1/2/3/5/8/15, 0 target changes. Archon numbers (95th pct
DPS/HPS + Popularity raid; M+ score + Popularity) 40 specs from __NEXT_DATA__ specRankings table, 157/160
changed (daily). **WCL**: agent holds no creds; evidence.json verdict `rdps-broken` (characterRankings
metric:rdps → Internal server error, enc 3176) → the 5 rDPS/normalized cuts unreachable, unchanged at
2026-07-09 baseline. 3 raw cuts merged by the deterministic fetch step BEFORE agent: wcl-dummy-raw 103
(players 1T:2000/2T:175/3T:122/5T:1711), wcl-ptr-raid-raw 27 (6/8 bosses; Coiled Altar & Ula'tek 0=untested),
wcl-ptr-mplus-raw 27 (all 8 dungeons). asOf 07-20.

## 2026-07-21 (nightly)
WCL: agent holds no creds — read wcl-fetch/evidence.json (verdict rdps-broken). 3 raw-DPS families already
merged by the deterministic fetch step (asOf 07-21): dummy-raw 103 rows, ptr-raid-raw 27, ptr-mplus-raw 27.
The 5 frozen rDPS/normalized cuts unreachable (upstream Internal server error), data unchanged at 07-09.
Murlok: 40/40 top-50 M+ rating ceilings (plain GET, h3+first-4-digit), range 3738-4288, 0 value changes.
Bloodmallet: 26/26 non-Aug DPS fight profiles (talent_target_scaling/castingpatchwerk, MID1 confirmed, counts
1/2/3/5/8/15), 0 target changes. SimC nightly MID1_Raid (.txt, build 12.0.7.68453 Live hotfix 07-20, no flip):
26/26 DPS best hero-variant from the DPS Ranking table. Mythicstats: period 1072 (MID1, no flip) via r.jina.ai
/period/latest — 34 specs on the representation list (6 at ~0 keys this early-period: Blood DK, Vengeance DH,
Devastation, Holy Pal, Holy Priest, Resto Druid — upsert keeps their stored values, 40 stored). Archon drawer
numbers (95th pct DPS / popularity / M+ score — ungated, not in required-sources) left at 07-20: the popularity
% isn't cleanly present in the tierList entries and I won't fabricate it.

## 2026-07-22 (nightly) — non-WCL metrics refreshed live; WCL evidence-only (rdps-broken)
- **WCL**: agent holds no creds; per wcl-fetch/evidence.json verdict rdps-broken (attemptedAt 07-22T12:14Z).
  The deterministic fetch step merged the 3 raw-DPS series before the agent started (Dummy Dome 103, Venomous
  Abyss raid 27, M+ keys 27; all asOf 07-22). The 5 rDPS/normalized cuts (live raid/mplus zone 46/47, PTR raid
  zone 54, PTR mplus zone 56, Dummy Dome rDPS zone 52) stay unreachable at their 2026-07-09 baseline.
- **Murlok** 40/40 (27 DPS + 7 healer + 6 tank), plain GET, display-name→first-4-digit rating, range 3738–4288.
- **Bloodmallet** 26/26 non-Aug DPS fight profiles via talent_target_scaling/castingpatchwerk; MID1 confirmed;
  targets 1/2/3/5/8/15 from the single MID1 build.
- **SimC** nightly MID1_Raid.txt (1.5MB) DPS Ranking parsed; best hero-variant per DPS spec = 26/26.
- **Mythicstats** period 1072 (1073 not yet built/404) via r.jina.ai; era "Period 1072 MID1", no season flip;
  35 specs parsed from the representation list; 5 absent (~0 keys: Blood DK, Resto Druid, Devastation Evoker,
  Holy Pal, Holy Priest) keep stored values via upsert.

- 2026-07-23 (nightly CI, Opus 4.8; single-shot) · **WCL evidence-only** (no creds) — verdict **rdps-broken**, all rDPS/normalized cuts unreachable at 07-09; 3 raw keys (dummy-raw 103 / ptr-raid-raw 27 / ptr-mplus-raw 27) landed by the frozen fetch step, asOf 07-23 (see ptr-watch log). **Murlok** 40/40 (plain GET, per-card display-name → rating-before-</li>; Devourer & Outlaw use shortened /spec/m+ promo hrefs, caught by name match), range 3738-4288, asOf 07-23. **Bloodmallet** 26/26 non-Aug DPS profiles (talent_target_scaling/castingpatchwerk, MID1 confirmed, best-build 1/2/3/5/8/15), asOf 07-23. **SimC** nightly MID1_Raid.txt DPS Ranking, best hero-variant 26/26, asOf 07-23. **Mythicstats** period **1073** (newly built — prior run 1072; fetch /period/latest, flat per-spec list) all 40 specs; fresh reset week so values spread out vs 1072 (Guardian 17.8→13.8, Unholy 17→12.0, Devourer 15.8→8.5), asOf 07-23. **Archon survivability** 40 rows / 14 moves (merged here). **Robydoby** sheets checked live: newest Venomous Abyss week is **16/7 M** (= stored asOf 2026-07-16; 17/7 tabs are Tidebound Grotto = zone 57, skipped) — no newer week, data unchanged. npm test 114/114, build OK (656.6 KB), snapshot 07-23.

- 2026-07-24 (nightly CI, Opus 4.8; single-shot) · **WCL evidence-only** (no creds) — verdict **rdps-broken** (attemptedAt 07-24T12:05Z), all 5 rDPS/normalized cuts unreachable at the 07-09 baseline; the 3 raw keys landed via the frozen fetch step BEFORE the agent (evidence.landed: dummy-raw **103**, ptr-raid-raw **27**, ptr-mplus-raw **27**), asOf 07-24, agent did not touch them. **Archon metrics** all direct `__NEXT_DATA__` `specRankingsSection.table.data[]` (NOT tierList): 95th pct DPS (Mythic) 33 (raid DPS+tank), 95th pct HPS 7, M+ score 40, **Popularity 80** (raid 40 + M+ 40) — asOf 07-24 (Archon lastUpdated 07-23). **Archon survivability** 40 rows (survivability tierList, all 3 raid pages). **Archon encounters** full 51-page re-fetch (9 bosses throughput + 8 dungeons score × 3 roles) = **680 cells / 59 changed** vs committed (normal daily churn), 0 unmatched, asOf 07-24. **Murlok** 40/40 (plain GET, display-name → rating-before-</li>), range 3738-4288, asOf 07-24. **Bloodmallet** 26/26 non-Aug profiles (MID1 confirmed, best-build 1/2/3/5/8/15), asOf 07-24. **SimC** MID1_Raid.html (37 MB) — parsed the `#raid_dps` highcharts single-target series (`{name:"MID1_Class_Spec_Hero",y}`, JS-function-safe brace extraction, best hero-variant), 26/26 DPS (Frost DK 137690 ≈ committed 137691), asOf 07-24. **Mythicstats** still period **1073** but week's keys accumulated → 37/40 values moved (Devourer 8.5→12.1, Aug 4.4→8.1); **direct fetch works now** (SvelteKit SSRs data; r.jina.ai was IP-403 all run), asOf 07-24. **Robydoby** checked live: newest Mythic week still **16/7 M** (= stored asOf 07-16; 17/7 tabs = Tidebound Grotto zone 57, skipped) — unchanged, tolerated (out of contract). **Reachability note:** r.jina.ai 403-blocked this runner's IP all run (Wowhead tiers + would-be Mythicstats/WoWMeta paths), but WoWMeta/Mythicstats direct SSR + Archon/IV/Method/Murlok/Bloodmallet/SimC direct all worked. npm test 116/116, build OK (679.9 KB), snapshot 07-24.

- 2026-07-25 (nightly CI, Opus 5; single-shot) · **All non-WCL metric cuts refreshed.** Archon numerics re-read from `specRankingsSection.table.data[]`: 95th-pct DPS 33 (27 DPS + 6 tanks — the healer pages also carry a `dps` column; healer damage stays OUT to match the committed series shape), 95th-pct HPS 7, M+ score 40, Popularity 80, survivability 40. `archon-hps` and `archon-mplus-score` got their **first real attempt** (last run shipped placeholder `skipped` rows for the newly-added requirements). Murlok 40/40 live — all 40 values byte-identical to 07-24 (top-50 season ceilings are flat this late in S1; genuinely re-pulled, not skipped). Bloodmallet 26/26, also identical (same upstream `simc_hash` 3344f0f — the sim batch hasn't re-run). SimC nightly 26/26, all values moved slightly (Frost DK 137690→137711) = a newer run; **parser note: bracket-match the `#raid_dps` series' `"data":[` array, do NOT regex a fixed window** — a 60k-char window bleeds into later charts and yields ~2× values. Mythicstats period 1073 (week 18): the per-spec numbers are in the **"Spec representation in top keys"** chart (`<li class="flex flex-col items-center">` → `title="<spec> <class>"` + `<span class="mt-1">`), NOT the class-block percentages higher up; 38 specs listed, Resto Druid + Holy Priest absent → written 0. Robydoby refreshed to the newest **Mythic** week (24/7, only 2 boss tabs: Sszorak + Twin Fangs) = 24 DPS + 7 healer rows; specs absent from that 2-boss week keep their 16/7 values. **WCL: evidence-only** — `wcl-fetch/evidence.json` verdict **rdps-broken** (characterRankings metric:rdps → Internal server error on enc 3176, attemptedAt 22:38:55Z), so the 5 rDPS/normalized cuts stay unreachable at the 2026-07-09 baseline; the 3 raw keys landed pre-agent (dummy-raw 103 rows, ptr-raid-raw 27, ptr-mplus-raw 27) and were not touched.

- 2026-07-26 (nightly CI, Opus 5; single-shot) · WCL: **evidence-only** (verdict `rdps-broken`, encounter 3176 still 500s) — 5 rDPS cuts recorded `unreachable`, data untouched at the 07-09 baseline; the 3 deterministic raw keys landed pre-agent (dummy-raw **104** rows, +1 vs last run; ptr-raid-raw 27; ptr-mplus-raw 27). **Archon** 160 numeric rows across all four gated series (33 / 7 / 40 / 80) — all identical to committed because Archon's `lastUpdated` is still 07-24. Keep Popularity at **2 decimals** (`round(x*10000)/100`) or every row shows as a spurious change. **Murlok** 40/40 (range 3738-4288, unchanged again). **Mythicstats** period 1073 week 18, 38 specs, all unchanged — the week has stopped accumulating; Resto Druid + Holy Priest still absent from the chart, written 0. **Bloodmallet** 26/26, MID1 confirmed, byte-identical (simc_hash still 3344f0f). **SimC** 26/26 from the nightly, values moved slightly = a genuinely newer run. **GOTCHA (cost a merge-and-revert this run):** parsing `#raid_dps` by regex-scanning a fixed byte window after `"series"` **spills into the next chart on the page** and yields ~2.5x inflated values (Frost DK 137711 → 296861). Bracket-match the FIRST `"data":[ … ]` array only. The vs-committed diff caught it before merge — always diff before `apply-metrics`. **Robydoby** (best-effort, outside the contract): re-fetched the tab map + both 24/7 Mythic tabs (Sszorak, Twin Fangs); newest Mythic week is still 24/7, all 24 DPS 99th-pct values identical to committed, so nothing merged. CSV parse needs a quote-aware splitter — the percentile block sits at column 18 (`Class | 90th | 95th | 99th`).

- 2026-07-27 (nightly CI, Opus 5; single-shot) · WCL: **evidence-only** (verdict `rdps-broken`, encounter 3176 still 500s, attemptedAt 13:27:10Z) — 5 rDPS/normalized cuts recorded `unreachable`, data untouched at the 07-09 baseline; the 3 deterministic raw keys landed pre-agent (dummy-raw **104** rows, ptr-raid-raw 27, ptr-mplus-raw 27) and were not touched. **Archon** 160 numeric rows across all four gated series (33 / 7 / 40 / 80) — all identical to committed, aggregate `lastUpdated` still 07-24. **Murlok** 40/40: the DPS and tank pages are byte-identical again, but ALL SEVEN healer ceilings moved up (MW 4288→4335, RSham 4182→4234, Disc 4073→4118, HPal 3957→4017, Pres 3879→3976, HPriest 3838→3929, RDruid 3910→3913) — one role page refreshing while the others don't is normal, re-read a raw card to confirm the column before disbelieving it. **SimC**: switched to the **plain-text `MID1_Raid.txt`** (1.5 MB) "DPS Ranking" block instead of the 37 MB HTML — lines are `<dps> <pct>% MID1_{Class}_{Spec}[_{Hero}]`, 49 profiles, best hero-variant per spec = 26/26. This sidesteps the highcharts brace-matching trap that has burned two runs. Values moved slightly (Frost DK 137696→137700) = genuinely newer nightly (SimC 1205-01, WoW 12.0.7.68887, hotfix 07-24). **Mythicstats** period 1073 week 18, 38 specs, all unchanged (week stopped accumulating); Resto Druid + Holy Priest still absent, written 0. **GOTCHA:** in the "Spec representation in top keys" chart the `title` is lowercase-hyphenated (`devourer demon-hunter`) and the `<span class="mt-1">` value sits on its OWN line — a whitespace-strict regex returns 0 specs and would zero the whole roster; normalize `[-\s]+` on both sides and allow `\s*` around the number. **Bloodmallet** 26/26, MID1 confirmed, unchanged (simc_hash still 3344f0f / 7422280). **Robydoby** (best-effort, outside the contract): both sheets' tab maps re-fetched; newest Mythic week is still **24/7** (Sszorak + Twin Fangs) and all 24 DPS 99th-pct values are identical to committed, so nothing merged. npm test 159 (148 pass / 11 skipped), build 747.6 KB, snapshot 07-27.

- 2026-07-28 (nightly CI, Opus 5; single-shot) · WCL: **evidence-only** (verdict `rdps-broken`, encounter 3176 still 500s, attemptedAt 12:24:00Z) — 5 rDPS/normalized cuts recorded `unreachable`, data untouched at the 07-09 baseline; the 3 deterministic raw keys landed pre-agent (dummy-raw **104** rows — 1T 2000 / 2T 235 / 3T 157 / 5T 2000 players; ptr-raid-raw 27; ptr-mplus-raw 27) and were not touched. **Archon** 160 numeric rows across all four gated series (33 / 7 / 40 / 80) — and this run they finally MOVED, because the aggregate `lastUpdated` advanced 07-24 → **07-27** after three static runs. Survivability moved with it (Destro S→A, Disc / HPal / MW B→C). **Murlok** 40/40 (range 3738-4335) all identical to committed — the mirror image of last run, where only the healer page had refreshed. **GOTCHA (cost one parse iteration):** the murlok card class attribute is `class="vi-box meta-item <class>-color …"`, so splitting on the literal `class="meta-item` yields **zero** chunks and a silent 0-row parse; split on `meta-item ` and take the first non-numeric `<div class="h3">` as the display name. **Mythicstats** period 1073 week 18 — the week **resumed accumulating** after last run's flat read: 29 of 40 values moved (Aug 12.6→15.9, MW 14.0→16.2, Ret 3.2→1.8, RSham 5.2→3.5). Only **32** specs are charted now, down from 38: the six that vanished (Affliction, Blood DK, Vengeance, Balance, HPal, Prot Warrior) were all at 0.1 and fell under the chart's rounding floor — absence → 0, same handling as Resto Druid / Holy Priest since 07-17. **SimC** 26/26 from the plain-text `MID1_Raid.txt` "DPS Ranking" block (49 profiles, best hero-variant per spec), all 26 moved slightly = a genuinely newer nightly (SimC 1205-01, WoW 12.0.7.68887, hotfix 07-24), range 107082-137685. **Bloodmallet** 26/26, MID1 + `ptr:0` confirmed, byte-identical (simc_hash still 3344f0f, 7422280 for Elemental). **Robydoby** (best-effort, outside the contract): both sheets' tab maps re-fetched live; newest Mythic week is **still 24/7** (Sszorak + Twin Fangs) — no new week, nothing to merge. npm test 159 (148 pass / 11 skipped), build OK.

- 2026-07-28 (LOCAL evening run — residential-IP WCL restore) · The nightly refreshed Archon/Murlok/Mythicstats/SimC/Bloodmallet this morning but ALL canonical WCL series were frozen at 2026-07-09 (runner "rdps-broken" since 07-10). Restored from local HTML-endpoint fetches (XHR recipe, residential IP): z46 Mythic raid 4 cuts (27 rDPS / 7 HPS / 7 healer-DPS / 6 tank rDPS) + z47 M+ 3 cuts (27/7/6) all asOf 2026-07-28; removed the runner's 158 improvised "Median raw DPS (… pooled/Dummy Dome nT)" fallback rows (canonical series supersede them; they'll reappear if the runner recipe isn't fixed — flagged in run report). Same-day re-upserts of Archon (95th pct DPS/HPS, M+ score, Popularity raid tierList + mplus specRankingsSection recipe), Murlok 40, Mythicstats period-1073 40, SimC 26 (49 profiles → best-per-DPS-spec, 6 tank profiles excluded), Bloodmallet 26/27 profiles (Augmentation chart non-MID1 → skipped) + 40 Archon survivability tiers. WCL source snapshots 07-09→07-28. PTR zones 54/52/56 in ptr-watch log. npm test 148 pass, build OK (742.8 KB).

- 2026-07-29 (nightly CI, Opus 5; single-shot) · ⚠ **archon-popularity: the RAID series is CORRUPT in committed data and the fix could not be published.** All 40 stored raid "Popularity" rows hold DPS/HPS magnitudes under unit "%" (Outlaw 166000, Mistweaver 211500, Vengeance 88800), byte-identical to each spec's "95th pct DPS (Mythic)" — a prior run merged the `dps` column into the Popularity series. Today's live parse of `specRankingsSection.table.data[].popularity` returns the correct fractions (Unholy DK 10.33%, Blood DK 28.29%, Outlaw 0.52%). Merging them would move 40 rows ~100% and shift the family median, which `checkValueMove` rejects by design; the value-move gate has **no agent-writable proposal channel** (unlike `anomalyAckProposal`), so the corrected rows were **held back**, stored data left untouched, and the manifest row recorded `partial` with the fix instructions. **A human must re-run the nightly with the `value_move_ack` input to land it.** The M+ half (40 rows) refreshed normally. — **WCL**: evidence-only (verdict `rdps-broken`, encounter 3176 still 500s, attemptedAt 12:32:24Z) — 5 rDPS/normalized cuts `unreachable`, data untouched at the 07-28 values the local residential run restored; the 3 deterministic raw keys landed pre-agent (dummy-raw **104** rows — 1T 2000 / 2T 247 / 3T 159 / 5T 2000 players; ptr-raid-raw 27, 6 of 8 bosses populated; ptr-mplus-raw 27) and were not touched. HEAD carried none of the raw rows (the 07-28 local run had removed them), so all three re-land at asOf 07-29. **Archon** other three numeric series 80 rows (33 / 7 / 40), all moved with the 07-27→07-28 re-aggregation; survivability 40 rows, 0 moves. **Murlok** 40/40, range **3885-4352** (was 3738-4335) — the pages re-aggregated since last night. **Mythicstats**: **NEW period 1074** (up from 1073), page says it just started (top 1049 keys, 11.9 avg key level) — all **40** specs charted, up from 32, because a fresh period re-lists everything above the rounding floor, so no absence-to-zero handling was needed. **SimC** 26/26 from the plain-text `MID1_Raid.txt` "DPS Ranking" block (49 profiles, best hero-variant per spec; the 9 unmatched are tank profiles), all moved slightly = genuinely newer nightly (1205-01, 12.0.7.68887, hotfix 07-24), range 107091-137741. **Bloodmallet** 26/26, MID1 + `ptr:0` confirmed, byte-identical (simc_hash still 3344f0f, 7422280 for Elemental). **Robydoby** (best-effort, outside the contract): both tab maps re-fetched; newest Mythic week is **still 24/7** (Sszorak + Twin Fangs), and re-parsing both tabs reproduced the stored DPS values exactly — nothing to merge. **GOTCHA:** the Google Sheets `export?format=csv&gid=` endpoint answers **307** without `-L`; follow redirects or you get a 429-byte body and a silent zero-row parse. npm test 159 (148 pass / 11 skipped), build OK.

- 2026-07-30 (nightly CI, Opus 5; single-shot) · ⚠ **archon-popularity: the RAID series is STILL corrupt in committed data and the fix is STILL unpublishable — second consecutive night.** Independently re-confirmed rather than taken on trust from yesterday's log: all 40 stored raid "Popularity" rows hold DPS magnitudes under unit `%` (Blood DK 95300, Frost DK 173900, Unholy DK 170000), byte-identical to each spec's "95th pct DPS (Mythic)"; today's live parse of `specRankingsSection.table.data[].popularity` returns correct percentages (Blood DK 28.71, Unholy DK 10.09, Outlaw 0.52). Mechanics of the hold-back, for whoever lands it: apply-metrics was run with **all 160** Archon rows and the 40 raid Popularity values were then **restored byte-for-byte from `git show HEAD:data/specs.json`**, so the stored corrupt values and their 07-28 coverage date are untouched and `checkValueMove` sees no move. The M+ half (40 rows, 35 moved, range 0.62–38.4) IS published. **A human must re-run the nightly with `value_move_ack` to land the raid fix.** — **WCL**: evidence-only (verdict `rdps-broken`, encounter 3176 still 500s, attemptedAt 01:45:54Z) → 5 rDPS/normalized cuts `unreachable`, data untouched at 07-28; the 3 deterministic raw keys landed pre-agent and were not touched (dummy-raw **104** rows, 1T 2000 / 2T 248 / 3T 159 / 5T 2000; ptr-raid-raw 27 over 6 of 8 populated bosses; ptr-mplus-raw 27 over all 8 dungeons), asOf 07-29 → 07-30. **Archon** other numeric series: 33 "95th pct DPS" (range 88892–182141) + 7 "95th pct HPS" (184689–212157) + 40 "M+ score" (3396–4256), all moved with the 07-28→07-29 re-aggregation; survivability 40 rows, 3 moves. **Murlok** 40/40, range **3889–4352** (was 3885–4352). **Mythicstats**: still period **1074** but it is in progress and has grown a lot — top **2000** keys / 9999 characters / **19.1** avg key level, up from 1049 / 5245 / 11.9 last night — all 40 specs charted, all 40 values moved. **NEW MYTHICSTATS GOTCHA:** scanning the whole r.jina.ai page for `![Image N: <spec> <class>](…) <value>` yields **59** rows, because the "Classes and specs" and per-dungeon sections repeat the same image pattern; **bound the parse to the "## Spec representation in top keys" section** (next `## ` heading ends it) or you silently merge the wrong chart. **SimC** 26/26 from `MID1_Raid.txt`, **byte-identical** to committed (header still 1205-01 / 12.0.7.68887 / hotfix 07-24 — the sim has not re-run since last night); the stored series name is **"SimC nightly Patchwerk DPS"** — writing a new name orphans the old series, so read it off the data first. **Bloodmallet** 26/26, MID1 + `ptr:0` confirmed, byte-identical (simc_hash still 3344f0f @ 07-08, 7422280 @ 07-15 for Elemental). **Robydoby** (best-effort, outside the contract): both tab maps re-fetched; newest Mythic week still **24/7** (Sszorak + Twin Fangs) and re-parsing reproduced the stored values exactly. Reminder on top of yesterday's 307-redirect gotcha: the **DPS sheet's healer rows are healer DAMAGE**, not HPS — take healers from the separate healer spreadsheet only, or you publish ~380k "HPS" values. npm test 160 (149 pass / 11 skipped), build OK (780.9 KB).

- 2026-07-30 (nightly CI, **2nd run of the day**, Opus 5; single-shot) · **WCL: evidence-only, verdict `rdps-broken`** (attemptedAt 12:13:53Z; rdps on encounter 3176 still "Internal server error", transport healthy — oauth+graphql true). The 3 deterministic raw series landed pre-agent (dummy 104 rows / zone-54 pooled 27 / zone-56 pooled 27, all `applied` == `rowsBuilt`); the 5 frozen rDPS/normalized cuts stay at 2026-07-28, untouched. **Archon: 120 of 160 numeric rows merged.** Two parser regressions were caught and fixed IN-RUN, worth remembering: (a) `specRankingsSection.table.data[].dps`/`.hps` are **floats** (175006.94183143) — round them, or the diff rewrites every value as a long decimal; (b) each row's **`parses` is the series' `n`** — omitting it silently deletes the `n` from all 80 stored rows (the first merge showed 290 deletions vs 170 insertions, which is what surfaced both). **archon-popularity held back a THIRD night** — the raid half's 40 committed rows still carry DPS magnitudes under unit "%"; the live field parses correctly (Frost Mage 10.28, Unholy DK 10.11, Outlaw 0.52) but publishing moves all 40 rows ~100% and `checkValueMove` rejects it by design. This run excluded those 40 rows from the apply-metrics input rather than merging-then-reverting — cleaner, same result. Needs a human `value_move_ack` re-run. **Murlok moved** (7 healer/tank values, e.g. Mistweaver 4335→4288, Holy Pal 4017→3957; pages re-aggregate every 8h). **SimC re-ran** — all 26 values moved by sub-0.1% iteration noise on the same 12.0.7.68887 / hotfix 2026-07-24 build; parse the plain-text `MID1_Raid.txt` "DPS Ranking" block, not the 37 MB HTML. **Bloodmallet unchanged** (simc_hash still 3344f0f, Elemental still 7422280). **Mythicstats: r.jina.ai is now Cloudflare-403 here too** — but the site is server-rendered, so `curl https://mythicstats.com/period/latest` (302 → /period/1074) carries the whole chart; bound the parse to the `Spec representation in top keys` `<section>`. Period 1074 counters byte-identical to 01:50Z (2000 keys / 9999 chars / 19.1 avg) → 0 values moved, an honest no-op. **Robydoby** (best-effort, outside the contract): both tab maps re-fetched, newest Mythic week still **24/7**, DPS and HPS both already stored at that week, re-parse reproduced every value — no merge needed. npm test 160 (149 pass / 11 skipped), build OK.

- 2026-07-30 (LOCAL run, Opus 5 — **collided with the CI nightly; reconciled onto origin/master**) · Context: the 07-29 nightly aborted locally on a dirty tree, so Riley asked for a manual full refresh. It ran to completion and then failed to push — the CI nightly had landed **three** commits meanwhile (07-29 + two on 07-30) doing the same work. A `git pull --rebase` conflicted across 10 files including `specs.json` (two independently regenerated datasets do not merge mechanically), so per the runbook it was aborted, **not forced**. The local commit is preserved on branch **`local-refresh-20260730`** (ff74f3a) and only genuinely-new value was re-applied onto origin/master — same reconciliation pattern as 2026-07-28. · **THE ONE REAL FIX: Archon raid Popularity de-corrupted.** The nightly had detected it and held the fix back **three nights running** waiting on a human `value_move_ack` (the move is enormous: 175,200 → 2.49). Confirmed the stored series carried **DPS values under unit `%`** — all 40 rows >100, e.g. Devourer 178,800%. The local fetch parsed `popularity` from `specRankingsSection.table.data[]` correctly and the replacement values **sum to ~100% within each role** (raid Tank 99.99 / DPS 99.98 / Healer 100.01; M+ likewise), which is the check that settles it. 40 rows applied, asOf 07-28 → 07-30. The nightly's own `mplus` Popularity was already correct and was left alone, as were its 95th-pct DPS/HPS and M+ score series (all already 07-30). · Everything else this run duplicated the nightly and was **discarded rather than re-applied**: WCL live z46/z47, Murlok 40, Mythicstats, Bloodmallet 26, SimC 26, 40 survivability tiers. · **Parse gotchas worth keeping (all cost time this run):** (1) node's built-in `fetch()` gets Cloudflare-**403**'d on the WCL statistics endpoint where **curl with identical headers succeeds** — use curl as transport, node only to parse. (2) **Murlok**: the top-3 specs render in a different container, so splitting on `<a class="…meta-item">` silently yields **22/27** DPS; scan the document in order and pair each spec name with the next rating instead. (3) **Bloodmallet** returned byte-identical values to the stored 07-28 profiles — a useful confirmation that the best-build-per-target-count parse is right, not a stale fetch. (4) **robydoby** has nothing new: newest Mythic week is still 24/7 (already ingested); the only newer tabs are 17/7 Tidebound Grotto = zone 57, out of scope.

- 2026-07-31 (nightly CI, Opus 5; single-shot) · **archon-popularity is HEALTHY again** — the three-night raid-half corruption is gone from committed data (the 07-30 LOCAL run landed the de-corrupted series), so this run just refreshed all 80 rows normally with no hold-back. Kept the check that caught it: every value is a plausible percentage (raid 0.5–28.7), none carries a DPS magnitude, and no row equals its spec's 95th-pct DPS. **WCL**: evidence-only (verdict `rdps-broken`, encounter 3176 still 500s, attemptedAt 12:30:37Z, transport healthy) → the 5 rDPS/normalized cuts `unreachable`, data untouched at 07-28; the 3 deterministic raw keys landed pre-agent and were not touched (dummy-raw **103** rows applied, 1T 2000 / 2T 261 / 3T 162 / 5T 2000; ptr-raid-raw 27 over 6 of 8 populated bosses; ptr-mplus-raw 27 over all 8 dungeons), 07-30 → 07-31. One stored dummy-raw row (Augmentation 5T, n=1) stayed at 07-30 — that spec logged no 5-target parse this run, so 104 stored / 103 fresh; coverage still 07-31. **Archon** numeric: 33 "95th pct DPS" + 7 "95th pct HPS" + 40 "M+ score" + 80 Popularity, all moved with the 07-29→07-30 re-aggregation, **max single-row move 4.84%**. Remember the two 07-30 lessons — `dps`/`hps` are floats (round them) and each row's `parses` is the series' `n` (omit it and you silently delete `n` from every stored row). **Murlok** 40/40, 27 moved, range 3738–4350. **NEW MURLOK PARSER GOTCHA:** pairing spec names from `.h3` blocks inside a fixed-size window yields **28/40** (the block layout varies); instead segment the document between consecutive `class="…meta-item"` anchors and read each block's `alt="<Spec> <Class> Icon"` plus the first number after its `</svg>`. Verified alignment against the href slug + rank number. **NEW BLOODMALLET GOTCHA:** `simc_settings.ptr` is the **string `"0"`**, which is truthy in JS — a naive `if (ptr) reject` throws away all 26 profiles (it did, on the first pass this run). Compare explicitly. Profiles otherwise byte-identical (simc_hash still 3344f0f @ 07-08, 7422280 @ 07-15 for Elemental). **SimC re-ran**: all 26 moved by ≤0.097% iteration noise on the same 12.0.7.68887 / hotfix 07-24 build; range 107150–137612. **Mythicstats**: still period 1074 but it is still FILLING — 2000 keys / 10000 chars (5080 unique) / **21.3** avg key level, up from 9999 / 6607 / 19.1 — and 38 of 39 values moved. **Devastation Evoker has no bar on the chart this period at all** (0 occurrences of "devastation" in the page): a genuine upstream absence, not a parse error. Writing a 0 would be an inference, so its 07-30 row was left alone → 40 stored / 39 fresh. **Robydoby** (best-effort, outside the contract): both tab maps re-fetched; newest Mythic week still **24/7** (Sszorak + Twin Fangs) and the re-parse reproduced every stored value exactly, so no merge. **ROBYDOBY CSV GOTCHA, cost real time:** the export URL 307-redirects (use `-L`) *and* the percentile numbers are **comma-thousands-separated inside quoted cells** — splitting a line on `,` turns 305,041 into "305", so a real CSV parser is mandatory; also take the **rightmost** `Class` column (there are three) whose header quartet is `Class | 90th | 95th | 99th`. npm test 160 (149 pass / 11 skipped), build OK (802.2 KB).

- 2026-07-31 (LOCAL run, Opus 5 — residential IP; re-applied on top of the same day's nightly 370e058 after resetting to origin/master, per the local-run skill) · **Purpose of the run: unfreeze the five WCL cuts the nightly recorded `unreachable`.** The nightly had already refreshed Archon (160 rows, four gated series), Murlok 40, Mythicstats, SimC 26 and Bloodmallet (fightProfile 07-31) — **all verified current at 07-31 on master and deliberately NOT re-applied**; my own independent fetches of those five agreed with it (Archon aggregate `lastUpdated` 07-31T12:00Z, **all six popularity role-groups summing to exactly 100.00%** — a clean re-confirmation that the 07-30 de-corruption holds; Murlok 40/40 range 3889-4352; Mythicstats period 1074 grown to 2000 keys / 10,000 chars / **21.3** avg key level; SimC 26/26 from `MID1_Raid.txt` on the same 1205-01 / 12.0.7.68887 build; Bloodmallet 26/27 with **Augmentation skipped as non-MID1**). Recording that agreement rather than the values, since nothing was rewritten.
  · **WHAT DID LAND — live WCL, residential-only:** z46 Mythic raid 4 cuts (27 rDPS / 7 HPS / 7 healer-DPS / 6 tank; 419,059 / 105,406 / 105,406 / 60,169 parses) + z47 M+ 3 cuts (27/7/6; 3,203,540 / 1,077,008 / 1,079,073 parses) = **87 rows, 2026-07-28 → 2026-07-31.** PTR zones in the ptr-watch log (z52 + z56 also unfrozen; z54 empty upstream and left alone). WCL registry snapshots bumped for zones 46/47/52/56 only — **zone 54 left at 07-28 because nothing was ingested.**
  · **Transport gotchas re-confirmed:** node's built-in `fetch()` is Cloudflare-403'd on the WCL statistics endpoint where **curl with the same headers succeeds** — curl as transport, node only to parse. Wowhead is CloudFront-403 on direct curl **even from a residential IP**; r.jina.ai + `x-no-cache: true` carried all six pages. r.jina.ai is 403 on **mythicstats**, which is server-rendered anyway (`curl https://mythicstats.com/period/latest`), and works on **wowmeta**.
  · **Robydoby** (best-effort, outside the contract): both tab maps re-fetched with `-L` (the CSV export 307s without it); newest Mythic week still **24/7** (Sszorak + Twin Fangs), already stored — nothing to merge; the only newer tabs are 17/7 Tidebound Grotto = zone 57, out of scope.
  · Manifest deliberately untouched (partial run). `check-refresh --manifest` passed; its five `unreachable` WCL rows are the nightly's own record and now describe data this run has since refreshed — the bounded one-day drift the local-run skill documents as by design. npm test 160 (149 pass / 11 skipped), build OK (812.9 KB). Tier-side findings — a **reverted WoWMeta raid ingestion** and a **new WoWMeta M+ source-typing question** — are in the refresh-tiers log.

- 2026-08-01 (nightly CI, Opus 5; single-shot) · **WCL evidence-only** (verdict `rdps-broken`, encounter 3176 still 500s, attemptedAt 11:47:09Z, transport healthy at 1/3600 points) → the 5 rDPS/normalized cuts recorded `unreachable` with data untouched; the 3 deterministic raw keys landed pre-agent and were **not** touched (dummy-raw **103** applied, 1T 2000 / 2T 286 / 3T 174 / 5T 2000; ptr-raid-raw 27 across 6 of 8 populated bosses — Coiled Altar and Ula'tek at 0 players, an untested window; ptr-mplus-raw 27 across all 8 dungeons), 07-31 → 08-01. One stored dummy-raw row (Augmentation 5T) stays behind at 104 stored / 103 fresh. · **Archon** numeric: 33 "95th pct DPS" + 7 "95th pct HPS" + 40 "M+ score" + 80 Popularity + 40 survivability, all re-read from `specRankingsSection.table.data[]`. The DPS/HPS series moved slightly **even though page `lastUpdated` still reads 2026-07-31T12:00:00Z** — see the refresh-tiers entry; treat that field as a daily label, never a change detector. Popularity rounded to the stored **1-decimal** convention (rounding to 4 decimals rewrites all 80 rows for nothing); shape check clean, range 0.5–38.4, no DPS magnitudes. · **NEW WOWMETA PRECISION GOTCHA:** stored `lowerBound` is **2 decimals** (388.37), not an integer. `Math.round`-ing it reports **39 of 40 rows "changed"** on a byte-identical upstream snapshot and would have written a false movement story into history — round to 2. Upstream `snapshotDate` is **still 2026-07-28, a fourth day**, so the row is honestly `partial` (asOf is the source's date, never today); `maxAgeDays` 8 means it is now halfway to alarming. · **NEW BLOODMALLET PATH GOTCHA:** the target-count map is `data.MID1[<targetCount>]` — a flat count→DPS object that is **already best-build**. Treating `data[<targetCount>]` as the top level (or expecting a per-build sub-object to max over) yields **0 profiles from 26 successful HTTP 200s**, which looks exactly like an outage. 26/26 profiles, targets byte-identical, simc_hash still 3344f0f @ 07-08 (25 specs) and 7422280 @ 07-15 (Elemental) — the batch has not re-run. · **SimC HAS re-run**: git HEAD f7ed532cb8 → **ab7b0b85b0**, 25 of 26 values moved (max 1.50%), Frost DK 137612 → 137709, range 107129–137709, same 12.0.7.68887 / hotfix 07-24 build. Parse the `DPS Ranking:` block and map profiles by **longest-prefix** roster match — `MID1_Death_Knight_Frost_Rider` has underscores in both class and spec, so a `MID1_(\w+)_(\w+)_(\w+)` regex maps nothing. · **Murlok** 40/40, **11** moved, max 0.60%. Segment on meta-item anchor **opening tags** (keeping the `href`) so the slug cross-check is available — 40/40 slugs matched `/(class)/(spec)/m+`; note the slug is **class/spec**, the display name is **"Spec Class"**. · **Mythicstats**: still period 1074, week 19, and this time the counters have **stopped filling** (2000 keys / 10000 chars / 5080 unique / 21.3 avg — identical to 07-31), so all 39 values are unchanged. Devastation Evoker still has no bar → 40 stored / 39 fresh, left untouched rather than inferred to 0. · **Robydoby** (best-effort, outside the contract): newest Mythic week is still **24/7** (Sszorak + Twin Fangs), but unlike 07-31 the sheet **has been revised in place** — 6 of 31 rows moved (Devourer DH 267045 → 270472, Mistweaver 341024 → 345977, plus Enhancement / Affliction / Assassination / Holy Priest), so 31 rows were re-merged at the unchanged week date 2026-07-24. The 2 stored 07-16 rows (specs absent from the 24/7 week) were correctly left alone. npm test 182 (170 pass / 12 skipped), build OK (959.4 KB).

- 2026-08-02 (nightly CI, Opus 5; single-shot) · **WCL: evidence-only, verdict `rdps-broken` again** (`attemptedAt 2026-08-02T02:59:11Z`; `rdps@3176` → HTTP 200 with a bare "Internal server error", 0 rankings; transport healthy — oauth true, graphql true, 237/3600 points). The five rDPS/normalized cuts recorded `unreachable`, data untouched. The three **raw** keys landed from the deterministic step before the agent started and were only READ: `wcl-dummy-raw` 102 rows (1T 2000 / 2T 292 / 3T 176 / 5T 2000), `wcl-ptr-raid-raw` 27 (6 of 8 bosses populated; Coiled Altar + Ula'tek 0 players = an untested window, not an error), `wcl-ptr-mplus-raw` 27 (all 8 dungeons, 1669–2000 players). Two Dummy-Dome leftovers sit behind the run date because those specs logged no parse at that count (Aug Evoker 5T @07-30, Affliction Warlock 1T @08-01). · **Archon** all four numeric series refreshed from `specRankingsSection.table.data[]`: 95th-pct DPS 33 rows (89421–183590), HPS 7 (186445–214913), M+ score 40 (3396–4256, endpoints unchanged), Popularity 80 (0.5–38.4, shape-checked). The numbers moved only fractionally — which is the evidence that today's 13 Archon raid tier drops are a band re-cut, not a retune. · **WoWMeta `partial`**: JSON API only (never the S3 HTML prerender), 40 rows via the {dps,hps,tank} + `sortField==lowerBound` + `keyRange undefined` whitelist, values identical to committed — but `snapshotDate` is **still 2026-07-28, a fifth straight day**. `asOf` is the source's date, so a `success` claim would be dishonest. maxAgeDays is 8: it fires 2026-08-05 if upstream stays frozen, and the "observe the real cadence" note in required-sources.json now has a data point saying this is not a daily feed. · **Murlok** 40/40, href-slug cross-check 40/40, range 3889–4352 — **zero values moved**, unusual against the documented 8-hour re-aggregation and recorded as observed. · **SimC has NOT re-run**: git HEAD still `ab7b0b85b0`, all 26 values unchanged (107129–137709, Frost DK leads). **Bloodmallet has not re-run either**: `simc_hash` still 3344f0f (07-08) for 25 specs and 7422280 (07-15) for Elemental — 26/26 target sets byte-identical, 25 days old. · **Mythicstats**: still period 1074, but the sample rolled (3651 unique chars, was 5080; 22.1 avg key, was 21.3) and 31 of 39 values moved. Devastation Evoker still has no bar — upstream absence, row left alone. **Parse gotcha:** the bar value is a BARE number after the `<img>`; the `height: NN.NNNN%` style precedes it, so a "first percentage in the block" regex silently reads the bar height instead of the value. · **Robydoby** (best-effort, outside the contract): newest Mythic week is still **24/7**, and 25 of 31 rows match committed — but the SAME 6 rows the 08-01 run reported as revised upward have now **reverted to their pre-07-31 values** (Devourer DH 270472→267045, Mistweaver 345977→341024, plus Enhancement / Affliction / Assassination / Holy Priest). Re-merged at the unchanged week date. Worth a human's eye: a volunteer sheet oscillating on the same six cells is either a live-recalculating percentile block or an export cache, and either way its numbers are softer than a static snapshot implies. **Parse note:** read the RIGHT-HAND `Class | 90th | 95th | 99th` block by locating that exact 4-column header (col 18 on both sheets) with a quote-aware CSV split; scanning the whole row for class-spec tokens instead matches the per-player parse list and yields wrong numbers. npm test 182 (170 pass / 12 skipped), build OK (960.1 KB).


- 2026-08-02 (nightly CI, Opus 5; single-shot — **second run of the day**) · **WCL: evidence-only, verdict `rdps-broken` again** (`attemptedAt 2026-08-02T11:44:12.481Z`; `rdps@3176` → HTTP 200 with a bare "Internal server error", 0 rankings; transport healthy — oauth true, graphql true, 1/3600 points). The five rDPS/normalized cuts recorded `unreachable` with stored data untouched; the three deterministic **raw** keys landed pre-agent — `wcl-dummy-raw` 102 rows (1T 2000 / 2T 296 / 3T 177 / 5T 2000 ranked players), `wcl-ptr-raid-raw` 27 (Coiled Altar and Ula`tek at 0 players — between testing windows, not an error), `wcl-ptr-mplus-raw` 27 (1704-2000/dungeon). 37 Dummy Dome raw values and 22 PTR M+ raw values moved. · **murlok** 40/40 by plain GET; **all 40 values moved** since 03:02 (it refreshes ~8-hourly) — Devourer DH 4352→4358, Unholy DK 4350→4356, Survival 4126→4138. · **simulationcraft** 26/26 from the plain-text `MID1_Raid.txt` DPS Ranking block (49 profiles, best hero variant per spec, tanks excluded); **all 26 moved** — a genuinely newer nightly than the morning run. · **archon** all four numeric series re-read from `specRankingsSection.table.data[]`: DPS 33 / HPS 7 / M+ score 40 / popularity 80, values unchanged (08-01 aggregate). **Convention worth pinning:** the raid HEALER page also exposes a `dps` column, so a blanket ingest widens "95th pct DPS (Mythic)" from the stored 33 (DPS+tank) to 40 and quietly changes what the series means — filter healers out. · **bloodmallet** 26/26, `simc_settings.tier == MID1` confirmed on every chart, zero target values moved. · **mythicstats** period **1074** again (same week), 39 rows, 0 moves; **Devastation Evoker is absent from the figure entirely** — grep of the raw HTML for `devastation-evoker` returns zero, so it is a real upstream absence from the top-2000 keys, not a parse gap. · **wowmeta partial:** JSON API only (never the HTML prerender), 40 rows, but `manifest.snapshotDate` is **still 2026-07-28** — now 5 days stale and past the contract`s `maxAgeDays: 4`, so the heartbeat should be flagging it; worth a human check on whether their snapshot pipeline stalled. **Precision gotcha:** `lowerBound` is stored to 2 decimals (346.48); `Math.round` on merge showed **39 phantom value changes** — corrected before applying, net 0. · **robydoby** (best-effort, outside the contract): both sheets re-fetched, newest Mythic week still **24/7** (Sszorak + Twin Fangs); 24 DPS + 7 healer 99th-pct rows re-parsed and **identical to stored**, nothing merged. Its CSV needs a real quoted-field parser — values carry thousands separators, so a plain `split(",")` turns 305,123 into "305", which reads as a 1000x collapse. · npm test 190 (178/12), build OK, snapshot written, manifest rewritten and `check-refresh --manifest` passed.

- 2026-08-03 (LOCAL run, Opus 5 — residential; **full refresh** after the 10:37Z nightly failed Gate 1 and published nothing) · **The headline: all five WCL cuts CI has been recording `unreachable` were fetched successfully and landed.**
  · ⚠ **TRANSPORT CHANGE — record this before re-deriving it:** Node's global `fetch()` is now **Cloudflare-challenged on warcraftlogs.com even from a residential IP** (HTTP 403, "Just a moment..." JS-challenge body) with the documented XHR + browser-UA + Referer header set. **`curl` with the identical headers passes cleanly** (HTTP 200). It is a TLS-fingerprint block, not a header or IP problem. Shell out to curl for every statistics-table fetch.
  · **Live cuts landed (zone 46 Mythic 5/20/partition 3, zone 47 10/5/1):** `Median rDPS (Mythic, all bosses)` 27 specs / 385,461 parses · `…(Mythic, all bosses, tank)` 6 / 55,234 · `Median HPS (Mythic, all bosses)` 7 / 96,120 · `Median DPS (Mythic, healer)` 7 / 96,120 · `Median rDPS (M+, all dungeons)` 27 / 3,120,611 · `…(M+, all dungeons, tank)` 6 / 1,051,679 · `Median HPS (M+, all dungeons)` 7 / 1,049,653. **87 rows, 08-02 → 08-03.** The healer-DPS cut was verified genuinely distinct from the HPS cut (5.1k-33.0k vs 160k-184k) rather than assumed — same parse count on both makes an accidental same-column merge easy to miss.
  · **The rDPS split is worth internalising:** the v2 GraphQL `characterRankings(metric: rdps)` probe **still returns HTTP 200 + "Internal server error" + 0 rankings** (run's own probe, encounter 3176) — the upstream bug is unchanged — while the **HTML statistics table serves rDPS fine**. "rdps-broken" is an API-transport fact, NOT a statement that rDPS data is unavailable.
  · **Deterministic step run locally** (`src/fetch-wcl.mjs --out=wcl-fetch`, credentials from the skill config, which is gitignored and was never staged): landed `wcl-dummy-raw` 102 rows (1T 2000p / 2T 307p / 3T 182p / 5T 2000p), `wcl-ptr-raid-raw` 27 rows (Coiled Altar and Ula'tek 0 players — expected between windows), `wcl-ptr-mplus-raw` 27 rows (all 8 S2 dungeons 1,829-2,000p). All three 08-02 → 08-03.
  · ⚠ **`check-refresh --manifest` exits 1 with FOUR evidence cross-check failures** — `wcl-live-raid`, `wcl-live-mplus`, `wcl-ptr-mplus`, `wcl-dummy-dome` "claim success but the deterministic WCL fetch evidence landed no data for it this run". **This is a local-run blind spot in the gate, not a dishonest manifest.** The gate assumes the deterministic step is the ONLY path WCL data can take (true in CI, where the agent holds no credentials); locally these four landed via the HTML transport, which `fetch-wcl.mjs` does not implement and the evidence file therefore cannot vouch for. The evidence file exists at all only because the raw recipes were run. **Deliberately NOT resolved by deleting `wcl-fetch/`** (which would make the check print "expected for local runs" and pass) — that would trade auditability for a green line. → **FOR A HUMAN: decide whether the evidence cross-check should be skipped when the manifest's own `startedAt` indicates a local run, or whether local runs should simply not produce an evidence file.**
  · **Archon numbers** re-read from `specRankingsSection.table.data[]` against the new 08-03T12:00:00Z aggregate: 95th-pct DPS **33** (DPS + tank only — the healer page's `dps` column is deliberately not ingested), 95th-pct HPS **7**, M+ score **40**, Popularity **80**. Survivability 40.
  · **murlok** 40/40, **0 values moved** — checked rather than assumed: the page self-reports "Updated 7 hours ago" (~08-03T07:35Z, newer than our last fetch) and a **cache-busted `no-cache` re-fetch returned byte-identical values**, so this is a fresh read that genuinely did not move. Late-season top-50 averages plateau as the pool stops turning over.
  · **simulationcraft** 26/27 (Augmentation absent by design), 49 profiles, header `12.0.7.68887 Live (hotfix 2026-07-24)`, iterations 7500 — **all 26 values moved**, a genuinely newer nightly.
  · **bloodmallet** 26/26, `simc_settings.tier == "MID1"` confirmed on every chart, **0 target values moved** (no re-sim since the last run).
  · **mythicstats** 39 rows, same weekly period **1074**, but **27 of 39 values moved**. Alt labels are HYPHENATED per class ("beast-mastery hunter", "unholy death-knight") — normalise hyphens or 7 rows silently drop. **Restoration Druid absent** from the figure (verified by grepping raw HTML for both slug and alt forms); its stored row keeps its older asOf. **The absence ROTATED** — last run Devastation Evoker was missing and Resto Druid sat at 0.0; this run it is the reverse. Specs at ~0% flicker in and out, so a vanishing spec here is not by itself a parse regression.
  · **wowmeta `partial`** — JSON API (never the HTML prerender), 40 rows, whitelist `{dps,hps,tank}` + `lowerBound` + `keyRange undefined` (melee/ranged are SUBSETS of dps and would double-count). **Upstream `snapshotDate` is STILL 2026-07-28**, `completedAt` 2026-07-28T22:06:44Z — 6 days and unchanged for a fifth consecutive day. `asOf` correctly left at the source's date. Inside `maxAgeDays: 8`, so nothing is red, but the pipeline looks **stalled rather than slow** and breaches in 2 more days.
  · **robydoby** (best-effort, deliberately outside the contract): sheet fetched, 26 tabs mapped; **newest Mythic week is still 24/7**, and both its tabs re-parsed to values **identical to the stored 24 rows**, so nothing merged and `asOf` stays 2026-07-24. Tidebound Grotto / Backend / Template / Data tabs correctly skipped.

- 2026-08-03 (nightly CI, Opus 5; single-shot) · Every metric source attempted. **Zero values moved anywhere** — a local run at 14:09Z read the same upstream states ~1h earlier, and no upstream has re-published since.
  · **WCL: the agent held NO credentials and fetched nothing from warcraftlogs.com.** `wcl-fetch/evidence.json` (2026-08-03T15:10:51Z) verdict **`rdps-broken`** — `characterRankings(metric: rdps)` on encounter 3176 → HTTP 200 + bare "Internal server error", 0 rankings. So the five rDPS/normalized cuts (`wcl-live-raid`, `wcl-live-mplus`, `wcl-ptr-raid`, `wcl-ptr-mplus`, `wcl-dummy-dome`) are **`unreachable`**, data untouched. The three `*-raw` keys **landed via the deterministic step**: dummy 102 rows (1T 2000 / 2T 307 / 3T 182 / 5T 2000 ranked players), PTR raid pooled 27 rows (Coiled Altar + Ula'tek at 0 players — expected between windows), PTR M+ pooled 27 rows across all 8 dungeons.
  · **Their stored dates read 2026-08-03 anyway** — from the earlier *residential* local run, not from CI. Recorded explicitly in each manifest row so nobody later reads a current date as evidence CI reached the source.
  · **archon** four numeric series re-read from `specRankingsSection.table.data[]` (never `tierList`): 95th-pct DPS 33, 95th-pct HPS 7, M+ score 40, popularity 80. 0 of 160 moved (same 08-03T12:00Z aggregate).
  · **murlok** 40/40 by plain GET; page self-reports "Updated 7 hours ago"; **0 moved for the second consecutive run** — late-season top-50 averages plateau.
  · **bloodmallet** 26/26, `simc_settings.tier == "MID1"` confirmed on every chart, 0 target values moved. Augmentation returns `{status,message}` with no `data` key (by design).
  · **simulationcraft** 1.48 MB `MID1_Raid.txt`, header build **12.0.7.68887 (hotfix 2026-07-24/68887, HEAD 543891d765)**, 49 profiles → 26 best-variant rows, **0 moved** — the same nightly the local run read, so it has not re-simmed in between.
  · **mythicstats** period **1074** again, 39 rows, 0 moved. **Restoration Druid absent again** (grepped the raw HTML for slug AND alt form: 0 hits each) — genuine upstream absence, stored row keeps its older 2026-08-02 asOf.
  · **wowmeta `partial`** — JSON API only. `snapshotDate` **STILL 2026-07-28**, `completedAt` 2026-07-28T22:06:44Z: **6 days, unchanged for a sixth consecutive day.** Inside `maxAgeDays: 8`, so not red, but it breaches on **2026-08-05** if the upstream pipeline stays stalled.
  · **robydoby** (best-effort, outside the contract): sheet fetched, 26 tabs mapped, **newest Mythic week is still 24/7** — no new week, nothing merged, `asOf` stays 2026-07-24.

- 2026-08-04 (nightly CI, Opus 5; single-shot) · **Every metric source attempted; 12 of 13 landed fresh, wowmeta partial, the 5 rDPS-family WCL cuts still unreachable.**
  · **Archon numbers** re-read from `__NEXT_DATA__` `specRankingsSection.table.data[]` (never `tierList`): 95th-pct DPS **33 rows** (DPS + tanks; the healer page's `dps` column deliberately not ingested), 95th-pct HPS **7**, M+ score **40**, Popularity **80**. **30 of 33 DPS values moved fractionally** (Augmentation 183960→184315, Frost DK 174787→175097, Arcane 160145→159416) *while `lastUpdated` stayed at 2026-08-03T12:00:00Z* — third confirmation that field is a coarse daily label, not an aggregation timestamp.
  · **WoWMeta** JSON API, plain curl, no headers/proxy: manifest + `rankings/midnight/mplus/all/0.json`, 44 blocks → whitelist `{dps,hps,tank}` + `sortField "lowerBound"` + `keyRange undefined` = **40 rows**, 0 unmatched, 0 values changed. ⚠ **`snapshotDate` STILL 2026-07-28 — 7 days, seventh consecutive day, and `completedAt` is byte-identical to the value read on 07-31 and 08-03.** That is a stalled pipeline, not a slow cadence. `maxAgeDays` is 8, so it **breaches on 2026-08-06**. Recorded `partial` (asOf must be the source's own date). A human should decide: raise the threshold again, or let the alert fire.
  · **Murlok** 40/40 by plain GET, 0 values moved (third consecutive run — late-season top-50 pools stop turning over). ⚠ **NEW PARSE HAZARD:** murlok emits **both attribute orders** on the card anchor — `<a class="… meta-item …" href=…>` *and* `<a href=… class="… meta-item …">`. Splitting on `<a class=` returns **35 of 40** (Blood DK, Devastation/Preservation Evoker, Subtlety Rogue, Arms Warrior silently missing) with **0 unmatched reported**. Split on `<a [^>]*meta-item`. Same failure signature as the Method tier bug this run: a plausible-looking short list with no error.
  · **SimC** MID1_Raid.txt, 26 DPS rows. Header git build advanced **543891d765 → 8b483e2e60** (12.0.7.68887, hotfix 07-24, 7500 iters) — a genuinely new nightly, and values moved with it.
  · **Mythicstats** `/period/latest` → 1074 (unchanged period), 39 rows, 0 moved. Restoration Druid absent again — verified by grepping the raw HTML for both the slug and the hyphenated alt form (0 hits each); genuine upstream absence, stored row keeps its 2026-08-02 asOf.
  · **Bloodmallet** 26/26 profiles, `simc_settings.tier == "MID1"` confirmed on every chart, **0 target values moved** (no re-sim since the last run); Augmentation returns `{status,message}` with no `data` key, by design.
  · **Robydoby (best-effort, outside the contract)** — both sheets fetched, tab maps parsed. **Newest Mythic week is still `24/7`** (Sszorak #5 + Twin Fangs #6); re-derived 24 DPS + 7 healer 99th-pct values and they reproduce the stored rows **exactly**, so nothing was merged and `asOf` correctly stays 2026-07-24. Parse note: the CSV is CRLF *and* the percentile fields are **quoted with thousands commas** (`"209,206"`) — use `csv.reader`, not `split(',')`, and take the columns from the RIGHT-HAND `Class | 90th | 95th | 99th` header block, since each class-spec string also appears in the Class-Filter column and the per-parse listing.
  · **WCL: this agent held no credentials and fetched nothing from warcraftlogs.com.** `wcl-fetch/evidence.json` (12:28:01Z) verdict **`rdps-broken`** — `characterRankings(metric: rdps)` on encounter 3176 = HTTP 200 + bare "Internal server error", 0 rankings; OAuth and GraphQL transport both `ok` (3600/h, 1 point spent), isolating the fault to the rdps family exactly as documented. The three frozen-recipe **raw-DPS** series landed via the deterministic step: dummy 102 rows (1T 2000 / 2T 336 / 3T 191 / 5T 2000 ranked players), Venomous Abyss pooled 27 (Coiled Altar and Ula'tek `ok` with 0 players — between windows, not an error), M+ keys pooled 27 across all 8 S2 dungeons. The five rDPS/normalized cuts recorded `unreachable`, stored data untouched.

- 2026-08-04 (nightly CI, Opus 5; single-shot — **second run of the day**, 22:44Z) · **Every metric source attempted; 12 of 13 landed, wowmeta partial, the 5 rDPS-family WCL cuts still unreachable.**
  · **⚠ WOWMETA: the numbers moved while the date did not.** JSON API only. `manifest.json` is genuinely frozen — `snapshotDate` **2026-07-28**, `completedAt` 2026-07-28T22:06:44.110Z, HTTP `Last-Modified: 28 Jul 2026 22:06:45 GMT`. But `rankings/midnight/mplus/all/0.json` carries **`Last-Modified: 04 Aug 2026 19:18:33 GMT`** and **all 40 `lowerBound` values changed** (Guardian Druid 388.37→394.32, Shadow Priest 341.82→348.24, Windwalker 335.74→344.99; ≈+1–3% across the board, ranking essentially unchanged). Cache-busted re-fetch returned byte-identical values, so this is upstream, not CDN variance. **The rankings step of their pipeline is running and the manifest step is not.** Ingested the fresh values under the source's own 2026-07-28 date (asOf is never today) → `partial`. Breaches `maxAgeDays: 8` on **2026-08-06**. **PARSE NOTE FOR NEXT RUN: keep 2 decimals** (`round(x, 2)`) — the stored convention is `388.37`; rounding to int rewrites all 40 rows for no reason.
  · **Archon** re-read from `__NEXT_DATA__` `specRankingsSection.table.data[]`: 95th-pct DPS **33** (DPS + tanks; the healer page's `dps` column deliberately not ingested), HPS **7**, M+ score **40**, Popularity **80**. **Zero values moved** — and that is the *expected* result here, not a stall: `lastUpdated` has advanced to **2026-08-04T12:00:00Z**, i.e. the label has caught up to the aggregate the 12:31Z run already ingested under an 08-03 label. Same 680-row encounter set, **0 of 680 moved**, so `encounter-tiers.json` is byte-identical. **Survivability moved twice**: Destruction Warlock A→B, Outlaw Rogue A→B.
  · **Murlok** 40/40 by plain GET, **0 values moved** (fourth consecutive run — late-season top-50 pools have stopped turning over). Split on `<a [^>]*meta-item` per the 08-04 hazard note; second `.h3` is the label, rating follows `</svg>`.
  · **SimC** MID1_Raid.txt: header git build **still `8b483e2e60`** (12.0.7.68887, hotfix 07-24, 7500 iters) — same nightly as the 12:31Z run, so 26/26 values unchanged. An unchanged build hash is the honest explanation for an unchanged parse.
  · **Mythicstats** `/period/latest` → **1074** (week 19, 10000 chars / 2908 unique, 22.6 avg key) — same period, 39 rows, 0 moved. Restoration Druid absent again (genuine upstream absence; its stored row keeps 2026-08-02).
  · **Bloodmallet** 26/26, `tier == "MID1"` confirmed per chart, **0 target values moved** — every chart's own `timestamp` is 2026-07-08 (Elemental Shaman 2026-07-15), so nothing has been re-simmed. Augmentation returns `{status: error}` with no `data` key, by design.
  · **Robydoby (best-effort, outside the contract)**: `htmlview` fetched, **26 tabs mapped, newest Mythic week still `24/7`** (Sszorak #5 + Twin Fangs #6) → no new week, nothing merged, `asOf` stays 2026-07-24. No manifest row exists for it by design.
  · **WCL: no credentials held, nothing fetched from warcraftlogs.com by any means.** `wcl-fetch/evidence.json` (22:40:25Z) verdict **`rdps-broken`** — `characterRankings(metric: rdps)` on encounter 3176 = HTTP 200 + bare "Internal server error", 0 rankings; OAuth + GraphQL transport both `ok` (3600/h, 1 point). The three frozen-recipe **raw-DPS** series landed via the deterministic step: dummy **102** rows (1T 2000 / 2T 352 / 3T 201 / 5T 2000 ranked players), Venomous Abyss pooled **27** (Coiled Altar + Ula'tek `ok` with 0 players — between windows), M+ keys pooled **27** across all 8 S2 dungeons. The five rDPS/normalized cuts recorded `unreachable`, stored data untouched. Note their stored dates read 2026-08-04 rather than lagging: a residential-IP run earlier today reached the HTML statistics endpoint that CI cannot.

## 2026-08-05 (nightly, 12:31Z)
- **Archon numbers** re-read from `__NEXT_DATA__` `specRankingsSection.table.data[]` (never `tierList`): 33 × "95th pct DPS (Mythic)", 7 × HPS, 40 × "M+ score (95th pct)", 80 × Popularity = **160 rows, 0 unmatched**. **55 of 160 values moved** and parse counts moved with them (Devourer DH 27,351 → 25,185; Augmentation 19,154 → 17,603 — a rolling window shedding old parses), even though Archon's own `lastUpdated` still read **2026-08-04T12:00:00Z** at fetch time (cache-busted re-fetch confirms). So the label lags the data: recorded as a live re-read, `asOf` 2026-08-05, consistent with the 08-04 precedent of ingesting moved values under a lagging label.
- **WoWMeta: the frozen `snapshotDate` has UNSTUCK.** `manifest.json` now reads `snapshotDate 2026-08-05` (`completedAt 2026-08-05T03:22:11Z`) after 8 days pinned at 2026-07-28 — their manifest step is running again, so the **2026-08-06 `maxAgeDays` 8 breach flagged by the last two runs will not fire** and needs no owner decision. 40 rows (27 dps + 7 hps + 6 tank, whitelisted `categoryType` + `sortField lowerBound` + `keyRange undefined`), and at the stored 2-decimal precision **0 values moved** — the last run had already ingested these numbers when the rankings object was re-published 08-04; only the source's own stamp caught up. First key this cycle to go `partial → success` on the source's own date rather than ours.
- **SimC: NEW nightly build.** Header now `12.0.7.68974 Live (hotfix 2026-08-03/68974, git build HEAD f4719d79e8)` — the previous run had `68887 / 8b483e2e60`. 26/26 DPS-roster specs re-parsed from the plain-text `DPS Ranking` block, all 26 values moved. Almost all are sub-1% drift; the one real move is **Devourer DH 107,161 → 118,379 (+10.5%)**, and it is not a hero-variant selection artifact — BOTH variants sit at 115–118k in this build (Void-Scarred 118,379 / Annihilator 115,141), so the spec genuinely gained in the new sim. Augmentation absent by design.
- **Murlok** 40/40 by plain GET (r.jina.ai still dead on it), **0 values moved — fifth consecutive run.** Split on `<a [^>]*meta-item`; second `.h3` is the "Spec Class" label; rating is the number after `</svg>`.
- **Mythicstats: period rolled, but the new one is not live yet.** `/period/latest` now 302s to **`/period/1075`, which 404s** (7.5 KB error body) — the new week exists in the `/period` index but has no page. Ingested **1074** (week 19), which is still the newest period with data: **36 rows (was 39), 22 values moved**. Four specs are absent from the figure this run — Blood DK, Vengeance DH, Restoration Druid, Protection Paladin (previously only Resto Druid) — a genuine upstream absence, so their stored rows keep their older `asOf` rather than being invented. Header also re-cut within the period: 2426 unique characters / 22.8 avg key (was 2908 / 22.6). Row floor 25 and `maxRowDropPct` 0.25 both comfortably clear. Alt labels stay hyphenated per class — normalise before roster matching.
- **Bloodmallet** 26/26, `simc_settings.tier == "MID1"` confirmed on every chart, **0 target values moved**: every chart's own `timestamp` is still 2026-07-08 (Elemental Shaman 2026-07-15), i.e. nothing has been re-simmed, so only the verification date advanced. Augmentation returns `{status: "error"}` by design.
- **Robydoby (best-effort, outside the contract)**: both sheets fetched, 26 tabs mapped each; **newest Mythic week is still `24/7`** (Sszorak #5 + Twin Fangs #6). Re-parsed both weeks' CSVs anyway (24 in-roster DPS + 7 healer = 31 rows) and **every value matched what is stored**, so nothing was merged and `asOf` stays 2026-07-24. Transport note: the `export?format=csv&gid=` URL now answers **307** — use `curl -sL`, a non-following curl silently writes a "Temporary Redirect" HTML body.
- **WCL: no credentials held; nothing fetched from warcraftlogs.com by any means.** `wcl-fetch/evidence.json` (12:25:27Z) verdict **`rdps-broken`** — `characterRankings(metric: rdps)` on encounter 3176 = HTTP 200 with a bare "Internal server error", 0 rankings, while OAuth + GraphQL transport both report `ok` (3600/h, 1 point spent). The three frozen-recipe **raw-DPS** series landed via the deterministic step: dummy **102** rows (1T 2000 / 2T 386 / 3T 216 / 5T 2000 ranked players), Venomous Abyss pooled **27** (Coiled Altar + Ula'tek `ok` with 0 players — expected between testing windows), M+ keys pooled **27** across all 8 S2 PTR dungeons. The five rDPS/normalized cuts recorded `unreachable`; their stored rows were left untouched.

## 2026-08-05 (LOCAL run, Opus 5 — residential; scheduled 14:09Z catch-up after the 12:31Z nightly)
- **SCOPE: residential-only catch-up. The five rDPS-family WCL cuts the nightly recorded `unreachable` were ALL fetched and landed.** Nothing else was re-fetched — Archon, murlok, SimC, bloodmallet, mythicstats, wowmeta and robydoby were all refreshed by CI ~2h earlier and were deliberately left alone (independently regenerating what CI produced is what makes a local push unmergeable).
- **Transport, re-confirming the 08-03 finding — do not re-derive:** Node global `fetch()` stays Cloudflare-challenged on warcraftlogs.com even residentially; **`curl` with the identical XHR + browser-UA + Referer header set passes cleanly** (every cut HTTP 200 first try). TLS fingerprint, not headers or IP.
- **Landed, 127 metric rows + 27 Dummy Dome specs, 2026-08-04 -> 2026-08-05:**
  · zone 46 Mythic (diff **5** / size 20 / partition 3): `Median rDPS (Mythic, all bosses)` **27** specs / 356,431 parses · `…, tank` **6** / 51,050 · `Median HPS (Mythic, all bosses)` **7** / 88,856 · `Median DPS (Mythic, healer)` **7** / 88,856.
  · zone 47 M+ (10 / 5 / 1): `Median rDPS (M+, all dungeons)` **27** / 3,092,351 · `…, tank` **6** / 1,042,644 · `Median HPS (M+, all dungeons)` **7** / 1,040,368.
  · zone 56 PTR M+ (10 / 5 / 1, `amount`): `Median rDPS (12.1 PTR M+ testing)` **27** / 5,819 · `…, tank` **6** / 1,940 · `Median HPS (12.1 PTR M+ testing)` **7** / 1,941. All era `ptr`.
  · zone 52 Dummy Dome -> `spec.ptrDummy` **27 specs**; per-count rows 1T **27**/1,495p · 2T **21**/200p · 3T **17**/84p · 5T **27**/1,194p. Only the counts a spec actually logged were written.
- **The healer-DPS cut was verified genuinely distinct from the HPS cut rather than assumed** (5,094-33,007 vs 160,243-184,419). They share an identical parse count (88,856), which is exactly what makes an accidental same-column merge easy to miss.
- **All 127 rows moved, and the magnitudes are the evidence that this is honest drift, not a unit or column error:** live cuts move sub-1% (max 1.22% on healer-DPS, medians 0.09-0.26%), while the small-n PTR M+ cuts move a few percent (max 6.07% Assassination, tank median 2.34%) — precisely the noise profile you expect from ~200 parses/spec against 3.1M. `maxValueMovePct` is 0.6, so everything is orders of magnitude inside it. Stored convention is **integers** — rounded on merge, so no phantom moves.
- ⚠ **The documented zone-52 "each spec row appears twice (54 rows -> 27 specs)" quirk did NOT occur in this fetch.** Verified directly rather than blind-halving: one `summary-table`, 28 `<tr>`, **27 unique spec sprites, max duplicate count 1** on both 1T and 5T (and on zone 46 for control). Blind-halving here would have been wrong. `ptrDummy` stores no `n`, so the parse-count halving note was moot either way — but **check the fragment, never assume the doubling**.
- **zone 54 (PTR raid, normalized) — STILL EMPTY, and left frozen.** Heroic 4/10, Mythic 5/20 and the Tanks/Healers cuts all returned the ~9,140-byte header-only fragment: `<th>Class Spec Score Max Parses</th>` present, **zero `actor-sprite-` rows**. That is the valid-but-empty shape, not the 114-byte stub. The 34 stored rows and the zone-54 registry `snapshot` stay at **2026-07-28** so the staleness stays visible. **It breaches `maxAgeDays` 10 on 2026-08-08**; the Venomous Abyss opens 19 August, so a new testing window is the only thing that clears it.
- **zone 57 (Tidebound Grotto) — STILL EMPTY.** Normal 3/10, Heroic 4/10 and Mythic 5/25 each returned the literal 114-byte "No statistics have been collected for this zone, difficulty, size and region yet." Unchanged since 07-28.
- ⚠ **`check-refresh --manifest` fails on ONE line, and it is NOT the line the local-run skill predicts.** Expected on a partial run is `startedAt … is Nh old`; that check **passed** here because the nightly's `startedAt` (12:31Z) is only ~2h old, inside the 12h window. The actual failure is:
  `wcl evidence: attemptedAt "2026-08-03T14:45:59.729Z" is not from this run — a stale or malformed wcl-fetch/evidence.json must not vouch for anything`
  **Cause: a leftover `wcl-fetch/` directory from the 2026-08-03 local run is still sitting in the working tree.** It is **gitignored (`.gitignore:11`) and untracked**, so it never travelled with any commit and does not travel with this one. The gate is behaving correctly — refusing to let a two-day-old evidence file vouch for anything is the point. **Deliberately NOT deleted**: the 08-03 run raised "should local runs skip the evidence cross-check, or simply not produce an evidence file?" as an open question **for a human**, and silently removing the artifact would erase the evidence for that decision while making the line go green. **This run is new information for that decision: the stale file has now actively produced a red gate line on an unrelated run.** The five WCL manifest rows still honestly read `unreachable` (CI's record) — no success is being claimed for them anywhere.
- **Manifest deliberately NOT rewritten** — this was a partial/catch-up run, not a full refresh. Per the local-run rule the drift (rows saying `unreachable` while the stored data is fresh at 2026-08-05) is bounded at one day and the next nightly rewrites the file.
- **Movement:** `npm test` **311 pass / 0 fail / 20 skipped**, build OK (1135.9 KB). Snapshot written (it updates the nightly's same-date `data/history/2026-08-05.json` in place). Against the nightly's snapshot: **0 consensus tier moves** (no rating was touched) · **7 projection tier moves, every one single-band** — Havoc mplus B->A, Balance raid A->B, Windwalker mplus A->A+, Prot Paladin mplus A->B, Enhancement raid B->A, Arms raid A+->A, Arms mplus S->A+ · 32 projection score moves · 36 metric rank moves. That is the projection doing exactly what it is designed to do: zone-56 testing percentiles and the Dummy Dome composite are two of its PTR empirical inputs and both just went from a day stale to current.

## 2026-08-05 (nightly CI, Opus 5 — THIRD run of the day, 15:37Z; single-shot)
- **Every metric source re-fetched live. The one real mover is MURLOK, and it unfroze hard.** 27 of 40 rows moved after **five consecutive runs reading them unchanged** — and all 27 are DPS; healers and tanks held exactly. Biggest: Frost DK 3997 -> 4024, Arcane 3992 -> 4016, Devastation 4021 -> 4043, Windwalker 4059 -> 4075, BM Hunter 4121 -> 4135, Elemental 4108 -> 4121, Feral 4222 -> 4235; the only meaningful drops are Fury 4121 -> 4107 and Balance 4050 -> 4044. The "late-season top-50 pools have stopped turning over" reading from earlier runs is now **superseded** — they were turning over, just not on the days we looked.
- **Everything else reproduced exactly, and that is the correct reading, not a stalled fetch.** Archon's four numeric series (33 DPS / 7 HPS / 40 M+ score / 80 popularity) are byte-identical to the 12:31Z ingest because `lastUpdated` has now advanced to 2026-08-05T12:00:00Z — that run read this very cut early, under the previous day's label. wowmeta 40/40 identical at 2-dp (snapshotDate 2026-08-05, the eight-day freeze stays RESOLVED). SimC identical: **no new nightly**, header still `12.0.7.68974 / HEAD f4719d79e8`, so the 12:31Z Devourer +10.5% move stands and was not re-derived. Bloodmallet 26/26 identical, every chart still stamped 2026-07-08 (Elemental 07-15) — only the verification date advanced, said plainly rather than dressed up as fresh sims. Mythicstats period **1074 unchanged** (1075 still 302→404, the half-landed roll from this morning), 36 rows, same 4 upstream absences (Blood DK, Vengeance DH, Resto Druid, Prot Paladin).
- **ROBYDODY VERIFIED, NOT RE-INGESTED — no new week exists.** Tab map re-parsed from the htmlview `items.push` blocks (26 tabs): the newest **Mythic** week is still **24/7** (Sszorak #5 gid=16354462, Twin Fangs #6 gid=1886150557), already stored at `asOf 2026-07-24`. Both tabs fetched as CSV and re-parsed anyway: 24 DPS specs, **0 value diffs**. The 17/7 Tidebound Grotto tabs were skipped as always (zone 57, not tracked). **CSV parse note worth pinning:** the percentile block is the last four columns (`Class | 90th | 95th | 99th`) of a **row-ragged** sheet — quoted values like `"215,238"` mean a naive `split(',')` gives different column counts per row, so `cols[n-4]` finds nothing and the parse silently returns 0 specs. Use a real quote-aware CSV reader and locate the block by `lastIndexOf('Class')` in the header row (index 18 / 21 this week), not by offset from the end.
- **WCL is evidence-only on the runner; nothing was fetched from warcraftlogs.com.** `wcl-fetch/evidence.json` (this run's, attempted 15:33:19Z) verdict **`rdps-broken`** — `characterRankings(metric: rdps)` on encounter 3176 returns HTTP 200 with a bare "Internal server error" and 0 rankings while OAuth and GraphQL transport both report ok (3600/h, 1 point spent). So the five rDPS/normalized cuts are `unreachable` and untouched, while the three **raw-DPS** frozen-recipe series landed and genuinely re-medianed: dummy **102 rows** (1T 2000 / 2T 391 / 3T 216 / 5T 2000 ranked players, complete pagination) with **21 of 26 1T** and **12 of 27 5T** values moving; Venomous Abyss pooled **27 rows**, values unchanged (The Coiled Altar and Ula'tek returned ok/0 players — between testing windows, not an error); M+ keys pooled **27 rows**, **22 of 27** moved.
- **The stale-`wcl-fetch/` watch item from the 08-04 local run is MOOT here** — CI writes a fresh evidence file every night, and this run's is 4 minutes old. The open human question it raised (should local runs skip the cross-check, or not produce an evidence file?) is unchanged and still owner-side.
- `npm test` **311 pass / 0 fail / 20 skipped**; `npm run build` OK (1137.7 KB); `node src/snapshot.mjs` written; `check-refresh --manifest` **passes** (21 success / 5 degraded-unreachable, 0 tier moves vs baseline).

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
