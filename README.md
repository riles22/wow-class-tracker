# Spec Tracker

Currently covering: **12.1 "Curse of Ula'tek" / Season 2 — LIVE** (patch 11 Aug 2026,
Season 2 opened 18 Aug 2026; Season 1's final standings live on as a frozen archive page).

[![Deploy](https://github.com/riles22/wow-class-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/riles22/wow-class-tracker/actions/workflows/deploy.yml)

A multi-source class/spec performance tracker for **World of Warcraft: Midnight** (Patch
12.1 — *"Curse of Ula'tek"*). All 40 Midnight specs, rated across several tier lists into a
single consensus, layered with live-season numbers, per-spec 12.1 change reads, and the
tracker's own forecast for the coming season — compiled into one self-contained HTML page,
plus a companion Season 2 gearing explorer.

**▶ Live: https://riles22.github.io/wow-class-tracker/**

Made by **[riles22](https://github.com/riles22)**. A personal project — if you fork, share, or repost it, please keep the credit.

## What it shows

- **Consensus tiers** from every tier-list source in `sources.json` (currently Icy Veins,
  Method, Wowhead and Archon — four editorial tier lists), each mapped onto one 0–100 axis and
  averaged, with a divergence marker where the sources disagree. A toggle switches from the
  consensus to any single source. Only real tier lists count here: WoWMeta was retyped to a
  metrics source in July 2026 once its letters were found to cluster on player count rather
  than performance, and it now contributes a number instead of a grade.
- **Era toggle** — during a PTR cycle, view the live season, the next patch's read, or
  both at once. Between cycles (as now, since the 18 Aug flip) there is only one era, so
  the toggle hides and every surface shows the live season; it returns when the 12.2 PTR
  opens.
- **Numbers that stay numbers.** Only real tier lists feed the letter consensus; measured
  data is shown as figures and never converted to grades — Warcraft Logs median rDPS/HPS,
  Archon 95th-percentile throughput and M+ score, Murlok top-50 rating ceilings, and
  Bloodmallet fight profiles (ST / cleave / AoE percentiles).
- **Patch layer** — per-spec official tuning in three honest lanes: live hotfix rounds on
  top, the consolidated "Shipped in 12.1" launch notes as the authority beneath, and the
  PTR development history that led there — plus the Season 2 tier-set bonuses as fact.
- **"Ours: 12.1" forecast — a FROZEN record** — the tracker's own pre-launch forecast
  tier list (raid + M+), declared frozen 2026-08-11 and rendered as a record: live
  consensus baseline blended with PTR testing percentiles and Dummy Dome composites,
  nudged by the tuning outlook and cited meta reads, every cell carrying its full
  component math and a confidence tag. A projection, not a source — it never feeds the
  consensus — and once the S2 consensus settles, a report card grades it.
- **Timeline sparklines** — every drawer charts the spec's consensus score (and our 12.1
  projection) across the daily history snapshots — the story of the meta, not just today.
- **Deep links, watchlist & compare** — every view is a shareable URL; star your specs
  (saved in-browser) and pin up to three side by side.
- **Movement arrows** (▲▼) versus the last snapshot where anything actually changed —
  per tier and per metric, for the consensus and for our own 12.1 forecast.
- **"Into 12.1 — biggest movers"** — the specs whose forecast tier differs most from their
  live consensus, ranked both ways, so the season-over-season shift is one glance.
- **Fight view** — pick a raid boss or M+ dungeon and the matching tier column swaps to
  Archon's per-encounter tiers (single-source by design, and labelled as Archon).
  Season-gated: hidden until Archon's Season-2 encounter tiers land, so a prior season's
  bosses never feed the live grid.
- **Past seasons** — each season's final standings freeze into a script-free archive page
  at the flip (Season 1 is live now, linked from the footer), so historical comparison
  never depends on a wayback machine.
- **The Ladder** — rank the whole field by any measured series (log medians, sims, 95th
  percentiles, adoption, PTR cuts). Measured numbers stay numbers: it never turns them
  into letter grades, never mixes sims with logs, and never crosses roles.
- **Compare all** — the full-roster matrix: 40 specs against every source letter, the
  consensus, the forecast and the metric ranks, sortable and filterable per column. Two kinds
  of absence render differently on purpose — `·` means no such measurement exists for that
  role, `—` means it exists but hasn't landed.
- **Season 2 gearing explorer** — a second self-contained page (`gearing.html`, reachable from
  the masthead tabs) covering raid, dungeon, catalyst and tier-set loot per spec; every spec
  drawer deep-links straight into it.
- **Cited creator takes** — a distilled, linked opinion layer that never feeds tiers — plus
  curated class Discords and creators.

Every row expands to a drawer with the full breakdown.

## Quick start (development)

```
npm test        # validate data + unit tests + build smoke test
npm run build   # → dist/index.html
npm run serve   # preview at http://localhost:8317
```

Requires **Node 20+** (see `engines` in `package.json`). No dependencies to install —
the build is plain Node.

## How it works

`data/*.json` is the source of truth; `src/build.mjs` compiles it with the
presentation-only `src/template.html` into a single `dist/index.html`.

- `data/specs.json` — the 40-spec roster (Midnight-era, includes Demon Hunter · Devourer)
  with per-source ratings, metrics, fight profiles, PTR writeups, tier sets, playstyle, and
  Dummy Dome data
- `data/sources.json` — source registry (tier lists, metrics sources, the PTR notes feed)
- `data/scales.json` — each source's tier scale mapped onto the shared 0–100 axis that
  produces the consensus
- `data/ptr-builds.json` — the dated 12.1 PTR build feed from Blizzard's official dev-notes thread
- `data/creator-takes.json` — the cited creator-take layer
- `data/encounter-tiers.json` — Archon's per-boss (throughput) and per-dungeon (score)
  tiers, behind the Fight selector
- `data/community.json` — curated class Discords + verified creators (links only)

Consensus, movement, fight-profile labels, and the Dummy Dome composite are all computed at
build time — never hand-written.

## Auto-updating

The site keeps itself current. A nightly [Claude Code](https://claude.com/claude-code)
agent checks for new PTR builds and tuning notes, new raid-testing data, and new creator
videos, and distills anything new into `data/*.json` — but it holds **no write
credentials**: it leaves its changes plus a machine-readable run manifest
(`data/run-manifest.json`, one honest result row per required source) for a separate
deterministic publish job. That job runs the gates — schema validation + unit tests, the
build, and `src/check-refresh.mjs` (source completeness, freshness, and mass-movement
anomaly checks against `data/required-sources.json`) — and only then commits, pushes, and
deploys to GitHub Pages. A daily heartbeat workflow goes red and files an issue if the
nightly stops completing or any source's data grows stale. **All game data is fetched
live, never recalled from model memory** — Midnight postdates the model's training
cutoff, so anything unfetchable is left blank rather than guessed.

For the full refresh and add-source procedures, open the project with Claude Code —
`CLAUDE.md` documents them, and `SOURCES.md` is the human-readable source inventory.

## Data sources

Tier and performance data belongs to its publishers — [Icy Veins](https://www.icy-veins.com/),
[Method](https://www.method.gg/), [Wowhead](https://www.wowhead.com/),
[Archon](https://www.archon.gg/wow), [Warcraft Logs](https://www.warcraftlogs.com/),
[Murlok.io](https://murlok.io/), and [Bloodmallet](https://bloodmallet.com/). This project
aggregates and links back to them; it doesn't replace them.

Creator takes are the cited opinions of their authors — quoted, linked, and dated in-app
with full credit, never altered or presented as this project's own. Every creator whose
analysis is used is acknowledged in the site footer and linked at the point their take appears.

## License

The **code** (build scripts, template, workflows) is [MIT-licensed](LICENSE) — fork away,
keep the credit. The **data** is not the code's to license: tier ratings, logs medians,
sims, and creator opinions belong to the publishers and authors credited above and in
`SOURCES.md`, and remain under their terms.
