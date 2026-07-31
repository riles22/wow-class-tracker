---
name: refresh-tiers
description: Refresh the tracker's tier-list ratings from every tier-list source in data/sources.json (currently Icy Veins, Method, Wowhead, Archon, WoWMeta). Use when the user says "refresh tiers", "update the tier lists", "pull new rankings", or when snapshot dates in data/sources.json look stale (tier lists move weekly-ish).
---

# Refresh tier-list ratings

Fetch the current Midnight tier lists live and merge them into `data/specs.json`.
**Never fill ratings from model memory** — Midnight postdates training cutoffs.

## Procedure

1. Read `data/sources.json` for the pages of each `kind: "tier-list"` source
   (currently icyveins, method, wowhead, archon, wowmeta — the registry is the source
   of truth, not this list). **Fetch each page inline, one source at a time.** Do NOT fan
   out subagents: the nightly runner passes `--disallowedTools "Agent,Task"`, so the call
   fails, and backgrounding slow work to "wait" for it was the root cause of the
   2026-07-15→17 lost nights. Era-verify as you go (step 2).
2. Era-verify every page: "Midnight", Season 1 / 12.0.x, or Devourer DH present in DPS
   lists. Unverifiable → skip that source, never guess.
3. Write rows `[{class, spec, bracket: "raid"|"mplus", source, tier}]` using the EXACT
   class/spec names from `data/specs.json` to a scratch file.
4. `node src/apply-ratings.mjs <file>` — refuses to write on unmatched rows.
5. Update `snapshot` dates (and moved URLs) in `data/sources.json`.
6. `npm test && npm run build`. If any data/ file changed this run, finish with
   `node src/snapshot.mjs` (movement baseline; loadData skips baselines identical to the
   current state, so ordering vs the build is safe). Append a line to
   `.claude/skills/refresh-tiers/log.md` (date · sources refreshed · notable tier
   movements) so the next run can diff.

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
- 🛑 **WOWMETA M+ IS UNDER REVIEW — DO NOT INGEST OR RE-STAMP IT** (2026-07-31, owner
  decision pending; evidence in this skill's log.md). Two independent defects, both
  verified: (a) the **live** view clusters its letters on **player count**, not the
  `lb_ci` performance metric its own prose claims — the page has an undocumented
  "Popular Choice" / "Optimized Potential" toggle and defaults to Popular Choice, so the
  letters are a popularity ranking feeding the M+ letter consensus (hard rule 3); and
  (b) a **direct** fetch returns a stale SSR prerender stamped `dateModified
  2026-03-23`, which is what committed data actually matches (27/27, vs 9/27 for the
  live view) — 130 days old while `sources.json` stamped it `2026-07-31` (hard rule 1).
  Until Riley rules, skip wowmeta in step 3 and **leave its `snapshot` values alone**
  rather than writing today's date. The wowmeta **raid** pages stay uningested with
  `snapshot: null` — that disposition is unchanged and separate.
- **A 200 is not freshness — check the page's OWN published date.** The wowmeta freeze
  went unnoticed for a week because every run fetched successfully, parsed 40/40 rows,
  logged "0 moves", and wrote today's date. Nothing in the tracker surfaces a stale
  *tier-list* source: `check-refresh`'s staleness gate reads the agent-written
  `snapshot`, and `dataHealth()` only inspects metrics / ptrDummy / fightProfile. So for
  every tier source, read the date the page publishes about itself — JSON-LD
  `dateModified`, a "Last updated" string, Archon's `lastUpdated`, WoWMeta's
  "Last updated:" — and log it. If it disagrees with the transport you used, say so and
  do not stamp the snapshot with today.
- **Transport can silently change the DATA, not just the delivery.** Direct-vs-proxy on
  wowmeta returns different datasets (March-23 prerender vs July-28 live), which is why
  the 07-17→07-24 "WoWMeta reclustering" entries (26/40, 24/40, 18/40, 28/40 moves) are
  **transport-induced view flips, not upstream movement** — they nonetheless fed
  consensus, the ▲▼ engine and `data/history/`, so the movement narrative for those
  dates is not trustworthy. Record which transport you used, every run.
- **murlok-style numbers are NOT tiers.** Only the five tier-list sources feed consensus.
- A new source first needs a scale in `data/scales.json` (check each tier round-trips
  through the consensus bands) and a registry entry — config only, no code.
