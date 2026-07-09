# Midnight 12.1 PTR Spec Tracker

[![Deploy](https://github.com/riles22/wow-class-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/riles22/wow-class-tracker/actions/workflows/deploy.yml)

A multi-source class/spec performance tracker for **World of Warcraft: Midnight** (Patch
12.1 PTR — *"Curse of Ula'tek"*). All 40 Midnight specs, rated across several tier lists
into a single consensus, layered with live-season numbers, per-spec 12.1 PTR change reads,
and a spec-finder quiz — compiled into one self-contained HTML page.

**▶ Live: https://riles22.github.io/wow-class-tracker/**

Made by **[riles22](https://github.com/riles22)**. A personal project — if you fork, share, or repost it, please keep the credit.

## What it shows

- **Consensus tiers** from every tier-list source in `sources.json` (currently Icy Veins,
  Method, Wowhead, Archon, and WoWMeta), each mapped onto one
  0–100 axis and averaged — with a divergence marker where the sources disagree. A toggle
  switches from the consensus to any single source.
- **Era toggle** — view the 12.0.7 live season, the 12.1 PTR read, or both at once.
- **Numbers that stay numbers.** Only real tier lists feed the letter consensus; measured
  data is shown as figures and never converted to grades — Warcraft Logs median rDPS/HPS,
  Archon 95th-percentile throughput and M+ score, Murlok top-50 rating ceilings, and
  Bloodmallet fight profiles (ST / cleave / AoE percentiles).
- **12.1 PTR layer** — per-spec change writeups, datamined Season 2 tier-set bonuses, the
  official PTR build feed, Warcraft Logs zone-54 raid testing, and **Dummy Dome** (zone-52)
  real-player DPS by target count with a normalized composite score + rank across the field.
- **"Ours: 12.1" projection** — the tracker's own computed forecast tier list for the
  coming patch (raid + M+): live consensus baseline blended with PTR raid/M+ testing
  percentiles and Dummy Dome composites, nudged by the tuning outlook and cited meta
  reads — every cell carries its full component math and a confidence tag. A projection,
  not a source: it never feeds the consensus.
- **Movement arrows** (▲▼) versus the previous snapshot, per tier and per metric.
- **Spec Finder** — a weighted quiz that ranks all 40 specs against your preferences (role,
  content, meta-vs-vibes, fight type, melee/ranged, mobility, survivability, utility, outlook).
- **Cited creator takes** — a distilled, linked opinion layer that never feeds tiers — plus
  curated class Discords and creators.

Every row expands to a drawer with the full breakdown.

## Quick start (development)

```
npm test        # validate data + unit tests + build smoke test
npm run build   # → dist/index.html
npm run serve   # preview at http://localhost:8317
```

Requires **Node 18+**. No dependencies to install — the build is plain Node.

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
- `data/community.json` — curated class Discords + verified creators (links only)

Consensus, movement, fight-profile labels, and the Dummy Dome composite are all computed at
build time — never hand-written.

## Auto-updating

The site keeps itself current. A nightly [Claude Code](https://claude.com/claude-code)
routine (`wow-ptr-watch`) checks for new PTR builds and tuning notes, new raid-testing data,
and new creator videos; distills anything new into `data/*.json`; then commits and pushes. A
GitHub Actions workflow rebuilds `dist/index.html` from the data and deploys it to GitHub
Pages. **All game data is fetched live, never recalled from model memory** — Midnight
postdates the model's training cutoff, so anything unfetchable is left blank rather than guessed.

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
