# refresh-metrics run log

Keep the newest ~20 entries; prune older ones when appending (prose is memory, not state —
parse counts and baselines the change detectors need live in the entries themselves).

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
