# Season 2 flip runbook — 2026-08-18

**Status:** WRITTEN 2026-08-11 (launch day), consolidating the verified audit findings and
the owner-approved sequencing. This is the operational checklist for the one-shot flip;
`docs/s2-transition-scope.md` holds the DESIGN decisions and stays authoritative where they
overlap. Everything here was measured against the tree as of commit `2cb40f5` — re-verify
numbers that matter on the day, they move with the data.

## Already done before the flip (do not redo)

- 2026-08-11: Gate 1 unblock (derived freeze test), freeze-season direction fix
  (ahead/split/behind three-way — laggards are never frozen), freeze-marker restore +
  snapshot carry-forward + frozen-date skip (`77bd0a3`, `6166feb`), Gate 0 covers
  `data/forecasts/` (`93bd308`), era-prose mechanism (`83cdf99`), report-card
  composition comparability + probe zone enumeration (`2cb40f5`).
- 2026-08-11 ~22:00 UTC (same day, separate event): the LAUNCH label flip —
  `PHASES.ptr.label` → `"12.1"` + gearing masthead chip. **The 08-18 flip assumes this
  landed.** If it somehow did not, do it first.

## The flip commit — one reviewed owner commit, in this order

1. **`src/normalize.mjs`**: `PHASES.liveSeason` → `"s2"`, `liveLabel` → `"12.1"`
   (the pin `liveLabel === seasonLabels[liveSeason]` holds), `ptr` → `null`,
   `PHASES.ptrSunset` stays false until the +14 sunset (DECISION 3).
2. **`src/render.mjs`**: `SNAPSHOT_PHASE` `"12.1-ptr"` → the live S2 id (pick the id in the
   commit; the check-refresh phase gate silences itself on any non-`"12.1-ptr"` value).
   Bump **`CONSENSUS_VERSION` 3 → 4** — the transition plan (s2-transition-scope.md:50)
   commits to this at the boundary; it also covers the scale re-spacing below for free, and
   `pickBaseline` refuses cross-version comparison so the strip reads "Season 2 baseline
   established" instead of ~40 spurious arrows.
3. **`data/scales.json`** (CODEOWNERS, owner-reviewed): widen `icyveins` to the seven-band
   S2 scale, mirroring the `icyveins-ptr` anchors — S+ 100 / S 92 / A+ 82 / A 66 / B+ 57 /
   B 48 / C 30. Known collateral, measured 08-11: re-spacing S 100→92 moves 3 consensus
   letters + 13 scores through the frozen archive (re-scored via the current scale), and
   silently re-spaces the RAID bracket too — all covered by the version bump; name it in
   the commit message anyway.
4. **Re-merge Icy Veins' S2 M+ letters** — a fresh `refresh-tiers` fetch of the three live
   M+ pages on the day (the letters were never preserved; they may also have been retuned).
   TBD specs are explicit `null`, never omitted (the `icyveins-ptr` convention). Fallback
   if the fetch cannot land: write all 40 as explicit `null` — post-flip M+ consensus is
   then Wowhead alone, disclosed by the count chip. NEVER: collapse S+ into S (refused as
   fabrication, refresh-tiers/log.md:284), revert `seasonVerified` (a lie, and corrupts
   `aheadSeasonFor`), or hold the flip (the check-refresh gate reds past 08-20 and a missed
   report-card boundary is unrecoverable).
5. **Retire `icyveins-ptr` from the forecast** (B3): stop it feeding
   `nextPatchTierSources` — post-flip it would be the ONLY next-patch source on 39 M+
   cells while describing the season we are running, and Icy Veins has already promoted the
   PTR list onto its live URLs (19/27 identical). **Keep the column** — DECISION 3
   (s2-transition-scope.md:102-105) keeps it visible through the grading window as the
   forecast's receipts. Retire = era/registry change that removes it from the forecast
   term only; the exact mechanism is the owner's call in review (the "retype to live" path
   is ruled out — it would hand Icy Veins 2 of 3 consensus votes).
6. **Era prose residue**: with `ptr: null` the Era toggle hides (template boot, ~:1240) and
   the era tokens derive from `liveLabel` automatically. The remaining hand strings that
   still say "12.0.7" in JS tooltips (template ~:1740/:1763/:1787/:1791/:3166) read
   `PHASE.liveLabel` where interpolated; the ones left literal are all
   still-true-as-provenance — sweep the built page for "12.0.7" and judge each hit: a
   PROVENANCE claim ("Archon Season-1 (12.0.7) data") stays until the underlying data
   moves; a LIVENESS claim must not survive.
7. **`src/check-refresh.mjs` / `data/required-sources.json`** (CODEOWNERS): the WCL
   contract swap — re-point `wcl-live-raid`/`wcl-live-mplus` to the S2 zone ids and REMOVE
   the six PTR-era WCL rows (per the transition scope: removed, not skipped).
   **Get the ids from the probe, never a pattern**: dispatch `wcl-probe.yml` once the raid
   is open (08-18 US / 08-19 EU) — the zone enumeration landed in `2cb40f5` and is
   validated against the live API. As of 08-11 NO S2 zones exist upstream; zone 50
   "Sporefall" appeared in the Midnight list and is untracked — check what it is while
   there. Note the rdps family is still 500 upstream; re-pointing restores the CONTRACT,
   not necessarily data.
8. **Sim lane (C4)**: when Bloodmallet/SimC publish S2 sims, accept tier `MID2` and
   re-point the SimC report URL — **verify the `MID2_Raid.html` URL live, never assume it
   from the MID1 pattern**. Six places hardcode MID1 (refresh-metrics/SKILL.md:135,164;
   sources.json:388,402,486,497; required-sources.json:388; SOURCES.md:67-68). MID1 and
   MID2 sims are not comparable — whether `fightProfile` gets a `tier` field marking the
   basis change is an open owner call.
9. **Verify like a local run**: `node src/freeze-season.mjs` (expect: icyveins/wowhead
   pairs report LIVE again, method/archon report BEHIND and are NOT frozen — the 08-11 fix;
   the s2 archive stays empty until an outlet leaves s2), `npm test && npm run build`,
   check-refresh `--manifest` informational, snapshot, rebuild, push.

## How to run the flip night — NOT a scheduled run

Gate 3 measures ~31 moves against `maxTotalMoves` 25 on today's data (re-measure on the
day — it moves if method/archon flip their pages first), and a **scheduled** run can never
carry an anomaly ack. Worse, publish snapshots only after Gate 3, so the baseline never
advances and every subsequent night fails identically — a stuck pipeline. So: do the flip
as a **local run**, or `workflow_dispatch` the nightly with
`anomaly_ack: "S2 transition: liveSeason flipped 2026-08-18"` (the shape
test/check-refresh.test.mjs:499 pins). Expect the REFRESH job's completion gate to red on a
flip night regardless (the frozen lane that neutralizes movement is publish-side) — noise,
not a data problem; the refresh agents escalated correctly through the 08-11 flip.

## Still to BUILD before 08-18 (not flip-day work)

- **B6 — the frozen-forecast render path** (DECISION 2's missing half, deadline 08-18).
  `data/forecasts/frozen-2026-08-11.json` is written by snapshot.mjs and read by nothing;
  at the flip the "Ours: 12.1" column would silently recompute off the settled S2
  consensus — 37 of 80 letters different from the frozen record, a forecast that already
  knows the answer. Minimum slice: an artifact loader in build/render gated on
  `SNAPSHOT_PHASE !== artifact.phase` (self-activating at the flip commit, inert before
  it), rendering the frozen cells with a basis string naming the declaration date; the
  grade chip waits for settlement (~09-01). Build it in its own session with adversarial
  review — render-pipeline surgery on flip day itself is how mistakes ship.
- **nightly.yml refresh-agent prompt line** (~:321): "do not finish until check-refresh
  --manifest passes" is unsatisfiable on a flip night and points at the one dishonest
  lever no gate catches (reverting `seasonVerified`). Soften to: record honestly and
  escalate; the frozen lane neutralizes it publish-side. Bundle with the next
  nightly.yml edit — each such push auto-kicks a ~40-min agent run, so don't spend one on
  a prompt tweak alone.
- **Dependabot #54** (claude-code-action bump): safe to merge since `77bd0a3`; it touches
  nightly.yml so it auto-kicks a nightly — merge it WITH the prompt-line edit above to
  spend one kick, not two.

## After settlement (~09-01, +14 days; second checkpoint +28)

- First real `npm run report-card` grade. Composition comparability landed (`2cb40f5`);
  remaining ergonomics: an artifact loader for the grade side (part of B6), a
  `--settle-days 28` flag (reachable today via `--settled <date>`), a markdown writer.
- DECISION 3's +14 PTR-surface sunset (`ptrSunset: true`) — separate one-shot, not the
  flip.
- Gearing re-harvest (C5): a reviewed code+data task, NOT a date edit — harvests are
  PTR-pinned in code (harvest-*.mjs, lib-wowhead.mjs) and gearing's validator pins the PTR
  URLs + item-count fingerprints, so a live re-harvest fails until the pins are
  re-reviewed. Check the stat-priority guide pages' own season state at the source first.
  Soft window opens 08-18/19.

## Deliberately left alone (checked 08-11, do not re-open without new evidence)

Bloodmallet `maxAgeDays` 5 (the red IS the signal — owner decision in `edc63942`);
`published` threshold retightening (deferred ~09-01; tierListHealth already flags at 14d);
a Method `published` block (needs a deliberate number first — it self-dates 133d);
ci.yml-on-nightly-commits gap (narrow: publish+deploy both run npm test; exposure is the
23 UI invariants for 2.6-4.4h); skill-log pruning and payload slimming (C7, competes with
launch week); the seven measured dead ends listed in CLAUDE.md.
