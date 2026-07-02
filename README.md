# Midnight 12.1 PTR Spec Tracker

A class/spec performance tracker for WoW Midnight Patch 12.1 PTR ("Curse of Ula'tek").
Every spec carries ratings from multiple sources (Icy Veins, Method, Wowhead) over its
12.0.7 / Season 1 baseline, plus per-spec PTR change writeups. The build compiles it all
into a single self-contained `dist/index.html` you can drop into SharePoint.

## Quick start

```
npm test        # validate data + unit tests + build smoke test
npm run build   # → dist/index.html
npm run serve   # preview at http://localhost:8317
```

Requires Node 18+. No dependencies to install.

## How it works

- `data/specs.json` — 40 specs with per-source raid/M+ ratings, quantitative 12.0.7
  metrics (Warcraft Logs medians, Archon scores, Murlok top-50 ceilings), sim-based
  fight profiles (Bloodmallet target-count scaling → ST/cleave/AoE labels), and optional
  PTR writeups
- `data/sources.json` — source registry: tier lists (Icy Veins, Method, Wowhead, Archon),
  metrics sources, and the official PTR notes feed
- `data/scales.json` — each source's tier scale mapped onto one 0–100 axis, so different
  scales can be averaged into a **consensus** tier, with a divergence marker where
  sources disagree
- `data/ptr-builds.json` — dated 12.1 PTR build feed from Blizzard's official dev-notes thread
- `data/community.json` — curated class Discords + verified creators (links only)
- `src/template.html` — presentation only; `src/build.mjs` injects the data at build time

The viewer defaults to the Consensus view; a toggle switches to any single source. Every
row expands to show current-season numbers, fight profile, per-source ratings, and
community links. Only real tier lists feed the consensus — log/sim/rating numbers stay
numbers. Liquid Armory (SimulationCraft gearing data) is linked as a reference — a
gearing axis, not a spec-strength axis.

## Updating data

Edit the JSON in `data/`, then `npm test && npm run build`. For live tier-list refreshes
and other maintenance workflows, open the project with Claude Code — `CLAUDE.md` teaches
it the full refresh/add-source procedures (including the rule that tier data is always
fetched live, never recalled from model memory).
