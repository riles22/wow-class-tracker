---
name: refresh-tiers
description: Refresh the tracker's tier-list ratings from every tier-list source in data/sources.json (currently Icy Veins, Method, Wowhead, Archon). Use when the user says "refresh tiers", "update the tier lists", "pull new rankings", or when snapshot dates in data/sources.json look stale (tier lists move weekly-ish).
---

# Refresh tier-list ratings

Fetch the current Midnight tier lists live and merge them into `data/specs.json`.
**Never fill ratings from model memory** — Midnight postdates training cutoffs.

## Procedure

1. Read `data/sources.json` for the pages of each `kind: "tier-list"` source
   (currently icyveins, method, wowhead, archon — the registry is the source
   of truth, not this list). **Fetch each page inline, one source at a time.** Do NOT fan
   out subagents: the nightly runner passes `--disallowedTools "Agent,Task"`, so the call
   fails, and backgrounding slow work to "wait" for it was the root cause of the
   2026-07-15→17 lost nights. Era-verify as you go (step 2).
2. Era-verify every page: "Midnight", Season 1 / 12.0.x, or Devourer DH present in DPS
   — and STORE the observation: write `seasonVerified: "s1" | "s2"` on the page entry in
   sources.json (whichever season the page actually described). This is not bookkeeping:
   `consensusFor` drops a source from a bracket's consensus when its page's season does
   not match the current live season (PHASES.liveSeason, normalize.mjs) — the DECISION-1
   transition rule. Mis-recording it either keeps a stale list averaged in or silently
   shrinks the consensus.
   lists. Unverifiable → skip that source, never guess.
   **Except the era-gated sources** (`era: "ptr"` in the registry — `icyveins-ptr` today):
   those must verify as **12.1 / Season 2**. A page that reads Season 1 is the WRONG page
   for that source and must not be applied. Record each page's OWN date in `published`
   (JSON-LD `dateModified`, or the in-body "Last UPDATED" line) as well as `snapshot`.
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
- ✅ **WoWMeta is NO LONGER a tier-list source — do not fetch it here** (retyped to
  `kind: "metrics"` 2026-07-31, owner-approved; recipe now lives in **refresh-metrics**).
  It was removed from the letter consensus because two defects made its letters unusable:
  (a) they are Ckmeans clusters of an undocumented "Popular Choice"/"Optimized Potential"
  toggle that defaults to **player count**, so they ranked representation rather than
  performance (hard rule 3) — Augmentation had the highest lb_ci of all 27 M+ DPS specs
  while sitting in B; and (b) the HTML transport served a stale S3 prerender
  (`dateModified 2026-03-23`) that committed data matched 27/27 against the live view's
  9/27 — 130 days old under a `2026-07-31` stamp (hard rule 1). The tracker now publishes
  its `lowerBound` as a NUMBER from the JSON API. **Consensus is four tier-list sources:
  Icy Veins, Method, Wowhead, Archon.**
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
- **`icyveins-ptr` is a tier list you fetch but must NEVER let into the consensus.** It is
  era-gated in the registry (`era: "ptr"`), so `consensusFor` already skips it — you do not
  need to do anything to keep it out, and you must not "fix" a spec whose consensus ignores
  it. Its shape differs from every other source here in four ways, all deliberate:
  · **M+ only** — three pages (`mythic-ptr-{dps,healer,tank}-tier-list`). Icy Veins
    publishes no PTR raid list. If one ever appears, it needs a registry page + a
    `required-sources` review, not an improvised row.
  · **Six bands, including `B+`** (S/A+/A/B+/B/C) on its own `icyveins-ptr` scale. The live
    `icyveins` scale has five and does NOT include B+ — applying a PTR row under the live
    source id will fail validation, which is the intended backstop.
  · **`TBD` is a real upstream state**, not a parse miss. Write it as an explicit `null`
    (Augmentation Evoker and Vengeance DH were TBD at adoption). Omitting the row instead
    loses the distinction between "unplaced by the authors" and "we never checked".
  · **Weekly cadence** — rebuilt Sundays 14:00 CEST on stream, then published. Its
    `published` date trailing `snapshot` by up to a week is NORMAL and not a finding; a
    `published` date that stops advancing for more than ~2 weeks IS one (nothing gates it —
    see the known gap in SOURCES.md).
- **murlok-style numbers are NOT tiers.** Only the four LIVE tier-list sources feed
  consensus; era-gated lists are shown and feed the projection, never the mean.
- A new source first needs a scale in `data/scales.json` (check each tier round-trips
  through the consensus bands) and a registry entry — config only, no code.
