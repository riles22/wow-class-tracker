---
name: refresh-metrics
description: Refresh the tracker's quantitative layer — Warcraft Logs medians, Archon scores, Murlok top-50 ceilings, Bloodmallet target-count sims / fight profiles. Use when the user says "refresh metrics", "update the numbers", "refresh sims/fight profiles", or metric asOf dates are older than ~a week.
---

# Refresh quantitative metrics + fight profiles

Fetch live numbers and merge via `node src/apply-metrics.mjs <file>` (input shape:
`{ "metrics": [...], "profiles": [...] }` — see the header comment in that script).
Numbers stay numbers — **never convert metrics to letter tiers.**

## WCL API (preferred when configured)

If `.claude/skills/refresh-metrics/config.json` exists (see `config.json.example`),
use the sanctioned v2 GraphQL API instead of HTML scraping: POST client-credentials to
`https://www.warcraftlogs.com/oauth/token`, then query
`https://www.warcraftlogs.com/api/v2/client` (zone rankings/statistics by encounter,
difficulty, metric). If config.json is absent, use the HTML fallback below and remind
the user ONCE per session that registering a free client at
warcraftlogs.com/api/clients/ makes this sanctioned and more reliable.
Never commit config.json (gitignored); never print the secret.

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
- **WCL politeness**: fetch each cut once, at most daily; the server literally replies
  "Use the API … instead of scraping HTML" without the XHR header. Long-term, register
  a free v2 GraphQL client (warcraftlogs.com/api/v2/client) and migrate.
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
