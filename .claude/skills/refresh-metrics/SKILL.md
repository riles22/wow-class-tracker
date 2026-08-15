---
name: refresh-metrics
description: Refresh the tracker's quantitative layer — Warcraft Logs medians, Archon scores, Murlok top-50 ceilings, Bloodmallet target-count sims / fight profiles. Use when the user says "refresh metrics", "update the numbers", "refresh sims/fight profiles", or metric asOf dates are older than ~a week.
---

# Refresh quantitative metrics + fight profiles

Fetch live numbers and merge via `node src/apply-metrics.mjs <file>` (input shape:
`{ "metrics": [...], "profiles": [...] }` — see the header comment in that script).
Numbers stay numbers — **never convert metrics to letter tiers.**

## WCL API (preferred when configured)

**Nightly CI (2026-07-14 re-audit): the agent has NO WCL credentials.** A deterministic
pre-agent workflow step runs `src/fetch-wcl.mjs` with `WCL_CLIENT_ID`/`WCL_CLIENT_SECRET`
scoped to that step alone and writes `wcl-fetch/evidence.json` — on the runner, read
that file and record the five WCL manifest rows from it; never fetch warcraftlogs.com
yourself there (the publish gate cross-checks a pre-agent copy of the evidence, so a
fabricated WCL "success" fails the publish). Everything below applies to LOCAL runs.

Local credentials come from either source, checked in this order:
1. **Environment variables** `WCL_CLIENT_ID` + `WCL_CLIENT_SECRET` (also what
   `src/fetch-wcl.mjs` reads — you can run it locally to reproduce the CI evidence).
2. **`.claude/skills/refresh-metrics/config.json`** (see `config.json.example`) — the
   local path. Its keys are **`wclClientId` / `wclClientSecret`**, which are NOT the
   env-var names above. Nothing under `src/` ever reads this file — `fetch-wcl.mjs` and
   `wcl-probe.mjs` take `process.env.WCL_CLIENT_ID` / `WCL_CLIENT_SECRET` and nothing
   else — so if you are driving either script from the file, map the keys across
   yourself. Reading it as `clientId`/`clientSecret` silently yields `undefined` and the
   token POST fails with a bare **401** that looks exactly like revoked credentials; that
   misread cost a local run on 2026-08-13 and was logged as a doc nit on 08-08 before
   this line was corrected.

If either is present, use the sanctioned v2 GraphQL API instead of HTML scraping: POST
client-credentials to `https://www.warcraftlogs.com/oauth/token`, then query
`https://www.warcraftlogs.com/api/v2/client` (zone rankings/statistics by encounter,
difficulty, metric). If NEITHER is present, use the HTML fallback below and remind the
user ONCE per session that registering a free client at warcraftlogs.com/api/clients/
makes this sanctioned and more reliable.
Never commit config.json or echo the secret (env or file) into logs, commits, or reports.

## Sources & recipes

- **Warcraft Logs** (live S1: raid zone 46, M+ zone 47): statistics-table endpoint
  documented in CLAUDE.md → "Metrics" workflow. Needs `X-Requested-With: XMLHttpRequest`
  + browser UA + Referer headers; response is an HTML fragment with UNCLOSED `<td>` tags
  — parse with regex, not a strict parser. Metric names in use:
  "Median rDPS (Mythic, all bosses)" / "Median HPS (…)" / "…(M+, all dungeons)".
- **Archon numbers** (same `__NEXT_DATA__` JSON as tiers): "95th pct DPS (Mythic)",
  "95th pct HPS (Mythic)", "M+ score (95th pct)", "Popularity" (fraction × 100, unit "%").
  **Read them from `props.pageProps.page.specRankingsSection.table.data[]`** — each row is
  `{item: "<ActorIcon type='Class-Spec'>…", dps, survivability, popularity, parses}` (raid
  DPS/healer pages carry `dps`/`hps` + `popularity`; the M+ page carries the score +
  `popularity`). **NOT the `tierList` structure** — that holds only letter tiers, no
  numbers. (2026-07-21 stall root cause: an agent looked for popularity in `tierList`,
  didn't find it, and left ALL four numeric series stale at 07-20 rather than refreshing
  the ones it could — popularity is and was cleanly in `specRankingsSection`, verified by
  runner probe 2026-07-23.) Refresh every run; **emit a manifest row for ALL FOUR Archon
  numeric requirements — `archon-metrics` (95th-pct DPS, raid), `archon-hps` (95th-pct HPS,
  raid healers), `archon-mplus-score` (M+ score 95th pct) and `archon-popularity`** — each
  is separately gated in required-sources.json, and a missing row fails the publish. They
  are split deliberately: one combined row would hide which of the four series failed.
  (`archon-hps` and `archon-mplus-score` were added by the 2026-07-24 audit, D4 — 47
  published rows had neither a date gate nor a row floor and could vanish silently.)
  If a series ever genuinely can't be parsed, mark just that requirement `parse_error`
  with a detail; never leave the others stale by coupling.
  **`dps`/`hps` are FLOATS** (175006.94183143) — round them, or the diff rewrites every row
  as a long decimal. Each row's **`parses` IS the series' `n`**: omitting it silently DELETES
  `n` from all 80 stored rows (it surfaced as 290 deletions against 170 insertions). Before
  merging **Popularity**, shape-check — every value a plausible percentage, each of the six
  (role × bracket) groups summing to ~100 (~600 across all 80 rows), and no row equal to that
  spec's "95th pct DPS (Mythic)". A prior run merged the `dps` column in and 40 rows carried
  DPS magnitudes under unit `%` (Devourer 178,800%) through **three consecutive nights**.
- **Murlok** meta pages (plain GET; **r.jina.ai does NOT work on murlok**):
  "Top-50 avg M+ rating (ceiling)" — it is the avg rating of each spec's own top-50
  players, NOT popularity; keep the "(ceiling)" in the name.
- **Mythicstats** (mythicstats.com): per-spec representation % in the top 2000 keys per
  weekly period — metric name "Top-2000 keys representation", unit "%". **Server-rendered:
  fetch `https://mythicstats.com/period/latest` directly — r.jina.ai is Cloudflare-403 on
  this host** (the old "JS-heavy, fetch via r.jina.ai" line here was stale), and the site
  root has no data table. Note the period id in the refresh log. If `/period/latest` 302s to
  a period that 404s (a 7.5 KB error body), that is a half-landed weekly roll, not an outage
  — ingest the newest period that HAS data and record which.
  · **Bound the parse to the "Spec representation in top keys" section**, ending at the next
    `## ` heading or the enclosing `<section>`. Scanning the whole page for the spec-image
    pattern yields **59** rows, because the "Classes and specs" block and the per-dungeon
    sections repeat it — you then merge the wrong chart under the right series name.
  · **The column is the representation SHARE and the whole series sums to ≈100%** (role
    subtotals ≈ 30/30/20/20). The site's `/meta` widget serves a per-key-PRESENCE figure
    instead — measured 7–10× the historical series (max 87 against ~12) with 16 exact zeros.
    Sum the ingest and the role subtotals before merging; that sum is the ONLY thing telling
    the two columns apart under one metric name.
  · **Labels are lowercase-hyphenated per class and the value is a BARE number** —
    `devourer demon-hunter`, `unholy death-knight`. Normalise `[-\s]+` on both sides or 7
    rows silently drop, and allow `\s*` around the number: a whitespace-strict regex returns
    **0 specs** and would zero the roster. The bar's `height: NN.NNNN%` style PRECEDES the
    value, so a "first percentage in the block" regex reads the bar height instead.
- **Robydoby PTR raid sheets** (community Google Sheets, no auth — public CSV export;
  registered 2026-07-23, owner-approved): per-boss tabs of curated WCL zone-54
  testing parses with per-spec 90/95/99th-pct raw DPS. Fetch
  `docs.google.com/spreadsheets/d/1HpszfQOHqDQj8gacsID5Wq7OP6ndpGXoD2PgIs_dGB8/htmlview`
  and parse the tab map from the `items.push({name: "...", ...gid=N` script blocks —
  tab names are `<d/m> <HC|M> <Boss> (#n)`. Take the NEWEST **Mythic (`M`)** week's tabs
  (SKIP Tidebound Grotto tabs — that is zone 57, not tracked; skip Backend/Template/
  Data tabs). The metric name hardcodes "Mythic", so if the newest week is Heroic-only
  (`HC`), either keep the last Mythic week or relabel — never merge HC numbers under the
  Mythic name. Fetch each `export?format=csv&gid=<gid>` with **`curl -sL`** — the export URL
  307-redirects, and without `-L` you get a ~429-byte "Temporary Redirect" body and a silent
  zero-row parse that reads as an empty sheet. **Split on `\r?\n`** (the CSV is
  CRLF — a plain `\n` split leaves a trailing `\r` that breaks the last column) and use a
  **real quote-aware reader** (`csv.reader`, never `split(',')`): the numbers are
  comma-thousands-separated inside quoted cells, so a naive split turns `305,041` into `305`
  — a 1000× collapse that merges as data. Locate the percentile block by
  **`lastIndexOf('Class')` in the header row** (Class | 90th | 95th | 99th; class-spec is
  CamelCase like `DeathKnight-Frost`) — the sheet is row-RAGGED, so the block's column index
  moves week to week (18 and 21 both observed) and a fixed `cols[n-4]` offset finds nothing.
  Robydoby also **recalculates in place**: the same six cells moved up on 2026-08-01 and
  reverted on 08-02 at an unchanged week date, so re-parse and re-merge at the week's own
  date every run rather than short-circuiting on the tab map.
  Merge ONE row per DPS-roster spec: max 99th-pct across that
  week's bosses as "99th pct DPS (12.1 PTR Mythic raid testing, Robydoby)" (bracket raid,
  unit DPS, asOf = the week date from the tab names, era auto-ptr from the name). The
  HEALER sheet (id 1MBadxaZWpwj7h_3HcOtteypK3WSgp6o9sUIqvTryju4, same tab layout) merges
  the same way for Healer-roster specs as "99th pct HPS (12.1 PTR Mythic raid testing,
  Robydoby)" (unit HPS). A DPS spec absent from every boss that week (e.g. Marksmanship
  Hunter had zero logged parses the 16/7 week → 26/27 DPS landed) is a legitimate upstream
  absence, NOT a parse error — don't force it. **No tank series**: the sheets have no tank
  tab, and the tank specs that appear in the per-boss DPS lists are logged as tank-DPS
  (not a meaningful tank metric) — do not ingest them. No `n` — the sheet does not expose
  per-percentile parse counts; never fabricate one.
  **Posture — best-effort, deliberately OUTSIDE the refresh contract**: robydoby is NOT in
  required-sources.json by design. It is one volunteer's manually-updated community sheet;
  its going quiet must never redden a nightly. Refresh it opportunistically during metric
  runs, tolerate staleness, and do NOT propose it into required-sources.json. The sheets
  ask for visible credit — the registry entry + drawer label carry it; keep them.
- **WoWMeta** (population-wide M+ rating — retyped from tier-list to metrics 2026-07-31):
  **The manifest step and the rankings step run independently — a frozen `snapshotDate` is
  NOT evidence the data is frozen.** On 2026-08-04 `manifest.json` had been pinned at
  2026-07-28 for eight days while `rankings/midnight/mplus/all/0.json` carried
  `Last-Modified: 04 Aug 2026` and **all 40 `lowerBound` values had changed**; a cache-busted
  re-fetch reproduced them, ruling out CDN variance. Always fetch and diff the rankings file,
  ingest moved values under the source's own lagging date, and record `partial`.
  fetch the **JSON API**, never the web page. Two plain `curl` calls, no headers, no proxy,
  no auth (AmazonS3 behind CloudFront — no Cloudflare, so it should work from CI too,
  though that is high-confidence-unproven until the first nightly):
  ```
  curl -sf https://data.wowmeta.com/manifest.json                          # -> snapshotDate = the asOf
  curl -sf https://data.wowmeta.com/rankings/midnight/mplus/all/0.json     # -> one file, all 3 M+ pages
  ```
  The rankings file is an array of **44 blocks**; select
  `categoryType ∈ {dps, hps, tank}` **+** `sortField === "lowerBound"` **+**
  `keyRange === undefined` (All Keys) → 27 + 7 + 6 = **40 rows**. **WHITELIST those three
  categoryTypes — do not merely blacklist "dungeon"**: `melee` and `ranged` are SUBSETS of
  `dps` and silently double-count 27 specs. Merge `lowerBound` as
  **"M+ lower-bound 95% CI rating (Blizzard API, population-wide)"** (bracket mplus, unit
  `rating`, `n` = `numberOfCharacters`, `asOf` = `manifest.snapshotDate`).
  `classSpec.className`/`.spec` are byte-identical to the roster — 40/40, no mapping table.
  - **`asOf` is the SOURCE's snapshotDate, never today.** It legitimately lags the run
    (07-28 on a 07-31 run), so the manifest success cross-check (stored date must be
    within 1 day of the run) will reject a `success` claim on a lagging day. Record
    **`partial`** with the upstream date in the detail — the real staleness alarm is
    `maxAgeDays: 4` in required-sources.json, not the success claim.
  - **Never fetch wowmeta.com HTML**: it is a stale S3 prerender (`dateModified`
    2026-03-23) that the tracker unknowingly ingested for a week, and r.jina.ai is
    non-deterministic about executing the page JS. Both are untrustworthy transports.
  - Its published LETTERS are not ingested and must not be: they are Ckmeans clusters of an
    undocumented "Popular Choice"/"Optimized Potential" toggle defaulting to **player
    count**, so they rank representation, not performance. `lowerBound` is the CI lower
    bound of a spec's **mean** Blizzard rating across all logged players — a
    sample-size-penalised population mean, **not a ceiling** (that is `maxAmount`). Keep it
    clearly distinct from Murlok's top-50 ceiling.
  - The raid endpoint (`/rankings/midnight/raid/all-bosses/5.json`) is live, but its
    `lowerBound` is **DPS throughput** (~180k), a different quantity on a different scale —
    do not merge it under the M+ rating name.
- **SimulationCraft nightly** (`SimC nightly Patchwerk DPS`, 26 DPS specs):
  - **Transport:** prefer the plain-text `MID1_Raid.txt` `DPS Ranking:` block (~1.5 MB) when
    it HAS one — it is sometimes a live in-progress log of a newer run with no ranking block,
    in which case parse `MID1_Raid.html`. In the HTML take the `"data":[…]` array **enclosing
    the FIRST big-value `"name":"MID1_…","y":…` hit**; a fixed byte window after `"series"`, or
    a max across all blocks, reads the later burst/DTPS charts — ~2.2–2.5× inflated (Frost DK
    137,711 → 296,861), which cost a merge-and-revert on 2026-07-26 and was caught only by a
    pre-merge diff. Skip the leading `Raid` aggregate row; 49 profiles → best hero-variant per
    DPS spec = **26** (tanks/healers excluded, Augmentation absent by design).
  - **Map profile names by LONGEST-PREFIX, and allow a hyphen.** `MID1_Death_Knight_Frost_Rider`
    has underscores in both class and spec, so a `MID1_(w+)_(w+)_(w+)` regex maps nothing at
    all — a silent zero-row parse on a healthy fetch. A name class without `-` drops
    `MID1_Demon_Hunter_Havoc_Fel-Scarred` entirely and reads Devourer off its lesser build
    (115175 instead of 118341), which looks exactly like a real sim move.
  - **Era-verify off the header build string, not the visible version.** The "12.3.0" on the
    HTML report is the **Highcharts JS** version, not the WoW build; the real header reads e.g.
    `12.0.7.68974 Live (hotfix 2026-08-03/68974, git build HEAD f4719d79e8)`. That `HEAD <sha>`
    is also the freshness detector — f7ed532cb8 → ab7b0b85b0 moved 25 of 26 values, an
    unchanged 8b483e2e60 moved none — and an unchanged hash is the honest explanation for an
    unchanged parse, said plainly rather than dressed up as a fresh sim.
- **Bloodmallet** (fight profiles, DPS specs only):
  - **`simc_settings.ptr` is the STRING `"0"`**, which is truthy in JS — a naive
    `if (ptr) reject` throws away all 26 profiles. Compare explicitly. The target map is
    `data[<simc tier>][<targetCount>]` (read the tier key off `simc_settings.tier`) and is
    **ALREADY best-build**: treating `data[<targetCount>]` as the top level, or expecting a
    per-build sub-object to max over, yields **0 profiles from 26 successful HTTP 200s** —
    which looks exactly like an outage and would be recorded as one.
  `GET bloodmallet.com/chart/get/talent_target_scaling/castingpatchwerk/{class}/{spec}`
  — take BEST build DPS per target count (1/2/3/5/8/15) into `profiles[].targets`.
  - **`asOf` is the CHART's own timestamp, never today** — same rule as WoWMeta above, and it
    is easier to get right here because the date is sitting in the payload: every chart carries
    `timestamp` ("2026-07-08 02:52") and `metadata.timestamp` (microsecond precision), and the
    `subtitle` restates it as `UTC <ts> | SimC build: <hash>`. Take the DATE PART, **per spec** —
    they genuinely differ (on 2026-08-08: 25 specs at 2026-07-08, Elemental Shaman alone at
    2026-07-15).
  - **Carry `simc_settings.tier` through into `profiles[].tier`, and never merge a mixed
    pool** (2026-08-15). Do NOT hard-code the expected tier — it changes each season
    (`MID1` → `MID2` for Season 2). Read it off each chart and pass it in the profiles row;
    `apply-metrics.mjs` stores it as `fightProfile.tier` and `validate.mjs` fails the run
    when one source's fight-profile pool contains more than one tier.
    Why this is a gate and not advice: `fightLabels` (render.mjs) pools every DPS spec's
    profile into one flat array with **no provenance key** and derives the ST/cleave/AoE
    labels and row tag as within-role percentiles over it. Tiers are not comparable —
    measured 2026-08-15, MID2 runs a mean **1.79×** MID1 (range 1.114–2.563, varying by both
    spec and target count, so no scale factor reconciles them; percentiles are scale-invariant
    anyway, so "normalising" is a no-op). With the 14-of-27 roster available that day, merging
    the re-simmed specs alone would have handed **all 24 "strong" labels to those 14 and none
    to the other 12**, moved a label on 21 of 26 specs, and published two specs as "Low-sims"
    purely for not having been re-simmed. **Adopt a new tier wholesale across every spec of
    the source, or not at all** — a partial upstream roster means you merge nothing and record
    the row `partial`.
  - Why this is written down (2026-08-08): for a month every run stamped `asOf` with the RUN
    date while the sim values sat byte-identical. That defeats the staleness alarm *precisely* —
    `required-sources.json` measures bloodmallet via `date.type "fightProfiles"`, i.e. off
    `fightProfile.asOf`, the very field being overwritten, so `maxAgeDays: 5` never fired against
    a true age of 31 days. The gotcha below ("the gate reads the data's own coverage date, not a
    hand-written snapshot") does NOT protect sims, because for sims the coverage date IS
    hand-written. The incentive to get this wrong is real: `check-refresh.mjs:218` rejects a
    `success` row unless the stored date is within 1 day of the run, so honest dates mean the
    manifest row is **`partial`** on any day Bloodmallet has not re-simmed. Record it as partial
    and let the age gate go red — a red heartbeat is the true signal that upstream has stalled.
  - **The 76-byte `{"status": "error", ...}` body is a TRANSIENT, not a structural signal.**
    Augmentation genuinely has no standard chart (8/8 retries error), but Beast Mastery returned
    the identical body once and then succeeded on retry with real data. Retry before concluding a
    spec is absent — treating the error body as "by design" would silently drop a live spec.

## Gotchas

- **Bumping a `snapshot` date in `sources.json` no longer makes a source look fresh.**
  Since the 2026-07-24 audit (D3) the staleness gate for murlok, mythicstats,
  simulationcraft, bloodmallet and the WCL cuts reads the **data's own coverage date** —
  the min-th-freshest `asOf` across the actual rows (or `fightProfile.asOf` for sims) —
  not the page snapshot an agent writes by hand. Before that, rewriting 106 metric rows
  to 53 days stale while leaving the snapshots at today produced **zero** violations from
  either gate. Practical consequence: if a parse fails, say so in the manifest row and
  leave the data alone — you cannot paper over it, and you no longer need to, because the
  gate now measures the thing that matters.
- Bloodmallet class names are **snake_case** (`demon_hunter`, `beast_mastery`); the
  `targets` chart type and `hecticaddcleave` fight style return errors — use
  `talent_target_scaling`. Read `simc_settings.tier` off every chart and carry it through
  (see the tier-uniformity rule above) — do not assert a specific expected value, it moves
  each season.
- **WCL fetching**: pull each cut fresh every run — no at-most-daily cap (policy
  2026-07-08: pull everything every run). The server replies "Use the API … instead of
  scraping HTML" without the XHR header, so always send the XHR header + browser UA +
  Referer. The sanctioned path is a free v2 GraphQL client (warcraftlogs.com/api/v2/client)
  — the runner uses it (datacenter IPs get Cloudflare-blocked on the HTML endpoint); the
  HTML endpoint works from a residential IP for local runs.
- **WCL v2 API status (2026-07-14, probe-verified — read before re-deriving ANY of it):**
  - **Transport is SOLVED from datacenter runners.** Recipe: browser `User-Agent` on the
    `POST /oauth/token` call; `Origin: https://www.warcraftlogs.com` +
    `Referer: https://www.warcraftlogs.com/` + a `sec-ch-ua` header on the
    `/api/v2/client` POST. Without these, Cloudflare silently empty-bodies the token
    call and 403-challenges the GraphQL call. Reference implementation: `src/wcl-probe.mjs`.
  - **The blocker is WCL-side, not ours:** `characterRankings` throws a bare
    "Internal server error" for the entire redistributed-credit metric family
    (`rdps`/`ndps`/`cdps`/`bossrdps`) on EVERY encounter — live zone 46 and PTR zone 52
    alike — while `dps`/`hps`/`wdps`/`default` work. Bisected argument-by-argument
    (className/specName/difficulty/partition all fine) and reproduced deterministically.
  - **`metric: default` is NOT a workaround:** probe-verified byte-identical to plain
    `dps` (joined by character name, 0.00% delta on live and dummy encounters). Do not
    substitute `dps`-family numbers under the rDPS-labeled series (honest source
    typing), and do not rebuild statistics-table medians from rankings pages — the
    leaderboard is a paginated top-parses list (`count` is page-local), not the parse
    population, and zone 54's cross-boss normalized score has no API analogue at all.
  - **Third-party scrape proxies are a dead end (probe-verified 2026-07-21):** a
    Supadata `/v1/web/scrape` probe (owner-requested) DOES clear Cloudflare, but the
    statistics-table fragment answers non-XHR scrapers with WCL's explicit refusal
    ("Use the API at /v1/docs instead of scraping HTML."), and the rendered
    statistics PAGE returns only navigation chrome — the table loads via XHR after
    render, so no values come through (bigNumbers=0). The refusal message also
    settles the etiquette question: WCL's stated policy is API-only, and the API is
    exactly what's broken. Do not retry other scrape proxies; wait for the rdps fix.
  - **Standing behavior until WCL fixes it:** ONE cheap retry per run (a single
    `metric: rdps` query on a known-good encounter, e.g. 3176); if still 500, record
    the five WCL manifest rows as `unreachable` with this reason and leave data
    unchanged. On the nightly runner this check IS `src/fetch-wcl.mjs` (the
    deterministic pre-agent step — read its `wcl-fetch/evidence.json` instead of
    re-running anything); locally you can run the same script or the query by hand.
    The dispatch-only workflow **"WCL API probe (diagnostic)"**
    (`.github/workflows/wcl-probe.yml`) re-checks the whole picture in ~20s. If rdps
    starts working: zone 52 (single encounter per target count, small population) is
    the first candidate for an API-median recipe — validate full-population coverage
    by paginating to the end and comparing counts before trusting any median, and
    freeze the recipe into `src/fetch-wcl.mjs` (owner decision), never into the
    nightly agent.
  - **Frozen recipe #1 (owner-approved 2026-07-17): zone-52 RAW-DPS medians.**
    `src/fetch-wcl.mjs` paginates each DPS dummy's full `metric: dps` leaderboard
    (complete pagination or that encounter contributes nothing — rankings are
    best-parse-per-player sorted best-first, so a partial median is biased high) and
    merges per-spec medians via apply-metrics as
    `"Median raw DPS (12.1 PTR Dummy Dome, NT)"` (bracket raid, era ptr, n = ranked
    players). This is a DIFFERENT statistic from both `spec.ptrDummy` (median rDPS —
    still frozen until WCL fixes the API) and the statistics table's per-parse
    medians — raw DPS is never dressed up as rDPS (Aug Evoker is why), and agents
    never re-fetch or edit these rows (manifest key `wcl-dummy-raw`, success only via
    `evidence.landed`).
- **Zone 54 is the 12.1 PTR raid** (Venomous Abyss), zone 56 M+ S2 PTR — PTR-quality
  data. **Zone 52 is "Dummy Dome"** — a target-dummy sim harness (Sinister Single 1T /
  Diabolical Duo 2T / Terrible Trio 3T / Fearsome Five 5T / Hazardous Healer), NOT a raid;
  it's real-player fixed-target-count DPS/HPS (a logged analogue of Bloodmallet's target
  scaling). Don't confuse 52 with 54. (52 now feeds `spec.ptrDummy` — refreshed by
  ptr-watch step 6; boss ids 3591=1T / 3590=2T / 3592=3T / 3593=5T, `aggregate=amount`
  → median rDPS. Merge via `apply-metrics.mjs` `ptrdummy` key.)
- **PTR data stays labeled**: metric names carry "(12.1 PTR …)" AND rows carry
  `era: "ptr"` (apply-metrics preserves it; validation enforces name↔era agreement).
  Keep PTR series out of live baselines.
- Live raid zone 46: Mythic requires `size=20`; `difficulty=4` is HEROIC, Mythic is 5.
- Fight-profile labels are computed at build time (within-role percentiles) — you only
  supply raw `targets`; don't hand-write labels.
- Healers/tanks get no Bloodmallet profiles (DPS sims only) — that's by design.


### Traps promoted from `log.md` (2026-08-15 context audit)

Each was learned by a run merging something wrong on a healthy HTTP 200. They lived only
in run-log prose until the log outgrew the Read tool and had to be pruned.

- **Match each series' STORED precision — read it off `data/specs.json` before merging.** The
  convention is per-series and it CHANGES (WoWMeta's `lowerBound` was 2 dp in early August and is
  1 dp now; Archon Popularity is 1 dp against a 2-dp payload; WCL is integers against a 2-decimal
  fragment). A mismatch reports the whole series as moved — 39 of 40, 36 of 40 and 127 of 127 have
  all been seen against byte-identical upstream data — and writes a phantom movement story into
  history.
- **A correction big enough to trip `maxValueMovePct` (0.6) must be HELD BACK, not worked
  around.** Exclude those rows from the apply-metrics input (cleaner than merge-then-revert),
  leave stored data byte-identical, and record that requirement `partial` with the fix
  instructions in the detail. The value-move gate has **no agent-writable proposal channel** —
  unlike `anomalyAckProposal`, only a human `value_move_ack` re-run or a reviewed local run can
  land it (see the local-run skill: the commit message is the ack record).
- **A leftover `wcl-fetch/` from an earlier local run will red the manifest gate — move it aside,
  do not delete it.** `check-refresh --manifest` fails with *"wcl evidence: attemptedAt … is not
  from this run — a stale or malformed wcl-fetch/evidence.json must not vouch for anything"*
  (2026-08-05, recurred 08-12). The directory is gitignored and untracked, so it never travelled
  with any commit. Deleting it makes the check print "expected for local runs" and pass, trading
  auditability for a green line — and the artifact is the evidence for an open owner question
  raised 2026-08-03 (should local runs skip the cross-check, or simply not produce an evidence
  file?). This is NOT the `startedAt is Nh old` line the local-run skill predicts; that check
  passes independently.
- **`curl` and Node's global `fetch()` are not interchangeable on warcraftlogs.com.** With the
  identical documented XHR + browser-UA + Referer header set, `fetch()` drew HTTP 403 +
  `challenge-platform` on all five URLs while `curl` returned HTTP 200 with full tables — a TLS
  fingerprint block, not headers and not the IP, so "the HTML endpoint works from residential"
  was only ever true through curl. Since 2026-08-10 curl itself 302s to `/human-challenge`, so
  treat this as the recipe to resume from if the endpoint reopens, not a promise that it works
  today.
- **"rdps-broken" is a statement about the GraphQL API, not about rDPS data.** The v2
  `characterRankings(metric: rdps)` 500 and the HTML statistics table serving rDPS fine are
  independent facts — an evidence-file verdict of `rdps-broken` must not stop an HTML fetch, and
  a successful HTML fetch must not be read as the API being fixed.
- **`dpstype=dps` and `dpstype=rdps` return byte-identical tables for the zone-46 healer-DPS
  cut** (verified 2026-08-01), so "Median DPS (Mythic, healer)" carries no methodology ambiguity
  — do not rename it and do not re-derive the question.

After merging: `npm run test:quiet && npm run build`, then `node src/snapshot.mjs` (movement
baseline; loadData skips baselines identical to the current state, so ordering vs the
build is safe); append date + row counts to `.claude/skills/refresh-metrics/log.md`.
