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
   local path, same two fields (`clientId`, `clientSecret`).

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
  "M+ score (95th pct)", "Popularity" (fraction × 100, unit "%").
- **Murlok** meta pages (plain GET; **r.jina.ai does NOT work on murlok**):
  "Top-50 avg M+ rating (ceiling)" — it is the avg rating of each spec's own top-50
  players, NOT popularity; keep the "(ceiling)" in the name.
- **Mythicstats** (mythicstats.com): per-spec representation % in the top 2000 keys per
  weekly period — metric name "Top-2000 keys representation", unit "%". JS-heavy; fetch
  via r.jina.ai. Note the period id in the refresh log.
- **Bloodmallet** (fight profiles, DPS specs only):
  `GET bloodmallet.com/chart/get/talent_target_scaling/castingpatchwerk/{class}/{spec}`
  — take BEST build DPS per target count (1/2/3/5/8/15) into `profiles[].targets`.

## Gotchas

- Bloodmallet class names are **snake_case** (`demon_hunter`, `beast_mastery`); the
  `targets` chart type and `hecticaddcleave` fight style return errors — use
  `talent_target_scaling`. Confirm `simc_settings.tier == "MID1"` on every chart.
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

After merging: `npm test && npm run build`, then `node src/snapshot.mjs` (movement
baseline; loadData skips baselines identical to the current state, so ordering vs the
build is safe); append date + row counts to `.claude/skills/refresh-metrics/log.md`.
