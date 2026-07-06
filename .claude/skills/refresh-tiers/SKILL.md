---
name: refresh-tiers
description: Refresh the tracker's tier-list ratings from Icy Veins, Method, Wowhead, and Archon. Use when the user says "refresh tiers", "update the tier lists", "pull new rankings", or when snapshot dates in data/sources.json look stale (tier lists move weekly-ish).
---

# Refresh tier-list ratings

Fetch the current Midnight tier lists live and merge them into `data/specs.json`.
**Never fill ratings from model memory** — Midnight postdates training cutoffs.

## Procedure

1. Read `data/sources.json` for the pages of each `kind: "tier-list"` source
   (icyveins, method, wowhead, archon). Fan out fetch agents per source (a Workflow
   with one agent per source works well — see the transcript of run `wf_b286902c-03c`
   for a proven prompt shape, including the era-verification requirement).
2. Era-verify every page: "Midnight", Season 1 / 12.0.x, or Devourer DH present in DPS
   lists. Unverifiable → skip that source, never guess.
3. Write rows `[{class, spec, bracket: "raid"|"mplus", source, tier}]` using the EXACT
   class/spec names from `data/specs.json` to a scratch file.
4. `node src/apply-ratings.mjs <file>` — refuses to write on unmatched rows.
5. Update `snapshot` dates (and moved URLs) in `data/sources.json`.
6. `npm test && npm run build`. Append a line to `.claude/skills/refresh-tiers/log.md`
   If any data/ file changed this run, finish with `node src/snapshot.mjs` (movement baseline; loadData skips baselines identical to the current state, so ordering vs the build is safe).
   (date · sources refreshed · notable tier movements) so the next run can diff.

## Gotchas (hard-won — trust these over intuition)

- **Archon raid pages carry THREE tierLists** (popularity/throughput/survivability).
  The default view groups by popularity — read the `metric: "throughput"` tierList.
  M+ pages use `metric: "score"`. Parse the `<script id="__NEXT_DATA__">` JSON from
  raw HTML; WebFetch's markdown conversion silently drops it.
- **Wowhead guide URLs move.** The tier lists live under
  `/guide/classes/tier-lists/{role}-rankings-{raids|mythic-plus}`; older URL shapes 404.
  Body is JS-rendered: use the r.jina.ai proxy or parse the embedded WH.markup from raw
  HTML. Wowhead's M+ DPS scale includes **A+**; role pages can have empty tiers.
- **Method's raid list URL is `/guides/tier-list/raiding`** (not `/raid`), and it may
  omit specs entirely (Vengeance DH was absent 2026-03) — omit, don't invent.
- **WoWMeta is JS-rendered (SvelteKit)** — WebFetch returns an empty shell; fetch via
  the r.jina.ai proxy. Its scale is S/A/B/C/D; page URLs live under /wow/…-tier-list
  (re-discover from the nav on 404).
- **murlok-style numbers are NOT tiers.** Only the five tier-list sources feed consensus.
- A new source first needs a scale in `data/scales.json` (check each tier round-trips
  through the consensus bands) and a registry entry — config only, no code.
