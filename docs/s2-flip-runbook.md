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

0. **Freeze the Season-1 archive** — `node src/freeze-season-archive.mjs --season s1`,
   BEFORE anything touches PHASES (the script refuses any season that is not the tree's
   current liveSeason, so running it after step 1 errors instead of archiving a season
   that never happened). Writes `data/season-archive/s1.json` — append-only, Gate-0
   immutable; the next build emits `dist/s1.html` and the footer "Past seasons" link by
   itself (DECISION 6, s2-transition-scope.md). Commit it with the flip. If a late data
   refresh lands the same week before the flip, redo with `--force` — after the flip it
   is permanent.
1. **`src/normalize.mjs`**: `PHASES.liveSeason` → `"s2"`, `liveLabel` → `"12.1"`
   (the pin `liveLabel === seasonLabels[liveSeason]` holds), `ptr` → `null`, and
   **delete `ptrSunset`** — dead since DECISION 3's amendment (2026-08-12): the
   ptr-null pin IS the sunset now. (normalize.test.mjs:176 pins the field and the
   template boot reads it with a falsy-safe guard; both covered by the pre-staged
   flip-day test patch.)
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
   PTR list onto its live URLs (19/27 identical). Note `nextPatchTierSources` keys on
   `era`, not `PHASES.ptr`, so the flip alone does NOT retire it — this step is still
   real work. The COLUMN needs no keeping: per DECISION 3 as amended (2026-08-12) it
   leaves the UI at the flip with the rest of the PTR receipts. Retire = era/registry
   change that removes it from the forecast term; the exact mechanism is the owner's
   call in review (the "retype to live" path is ruled out — it would hand Icy Veins
   2 of 3 consensus votes).
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
advances and every subsequent night fails identically — a stuck pipeline.
**Chosen (Riley, 2026-08-12): LOCAL RUN** — the flip commit + step-9 verification happen
here and are pushed directly; no anomaly-ack plumbing. (The dispatch alternative —
`workflow_dispatch` with `anomaly_ack: "S2 transition: liveSeason flipped 2026-08-18"`,
shape pinned by test/check-refresh.test.mjs:499 — remains the documented fallback.) Expect the REFRESH job's completion gate to red on a
flip night regardless (the frozen lane that neutralizes movement is publish-side) — noise,
not a data problem; the refresh agents escalated correctly through the 08-11 flip.

## Still to BUILD before 08-18 (not flip-day work)

- ✅ **B6 — the frozen-forecast render path** — BUILT 2026-08-12, adversarially reviewed
  (13 findings, all folded in or recorded below). Loader in loadData, substitution in
  buildPayload (`frozenForecastActive`: inert while phases match, active in the grading
  window, stands down when a 12.2 PTR cycle opens), `projAvailable()` un-gates the
  projection surfaces under `META.frozenForecast`, every visible surface names the record
  (viewnote, drawer, qualifier, movers, data-health), validateData red-flags a wrong-shape
  artifact, digest.mjs diffs the same lane the page renders, snapshots stamp the
  artifact's projectionVersion while frozen. Covered by a doctored-payload Playwright
  invariant. The grade chip still waits for settlement (~09-01).

- ✅ **DECIDED 2026-08-12 — option (b), the sunset happens AT the flip** (Riley, choosing
  against the recommended (a); recorded as DECISION 3's amendment in
  s2-transition-scope.md). No template pass; `ptrSunset` is deleted in the flip commit
  (step 1); the receipts live on in the drawer's frozen basis strings and the immutable
  artifact. The original collision write-up is preserved in git history if the trade
  ever needs re-examining.

- ✅ **S1 ARCHIVE MACHINERY — BUILT 2026-08-12** (DECISION 6, s2-transition-scope.md):
  `src/freeze-season-archive.mjs` (one-shot freeze → `data/season-archive/s1.json`,
  refuses non-current seasons and overwrites), `src/render-season-archive.mjs` +
  `season-archive-template.html` (script-free static page, own `default-src 'none'`
  CSP), build.mjs emits `dist/<season>.html` + the footer "Past seasons" link only when
  a record exists, serve.mjs allowlists `s1.html`, the injection invariant's pinned
  href regex admits exactly `s1.html`, covered by test/season-archive.test.mjs
  (escape/CSP/allowlist, freeze-equals-published-consensus, append-only refusal, build
  wiring). Flip-day duty is step 0 above only.

- ✅ **Flip-day TEST PATCH — PRE-STAGED 2026-08-12** (`docs/s2-flip-test-patch.diff`;
  verification log `docs/s2-flip-test-patch-verify.md`). Simulated at the exact flip
  state (liveSeason "s2" · ptr null · `ptrSunset` deleted · SNAPSHOT_PHASE "12.1-live" ·
  CONSENSUS_VERSION 4) the suite reds 30 tests across the six expected files
  (render 19 · ui-invariants 7 — three more than predicted, same two root causes ·
  build/check-refresh/normalize/validate 1 each). With the patch: **382 pass / 0 fail /
  0 skipped** at the flip state, re-verified against HEAD after the season-archive lane
  landed. Applied to the CURRENT tree it reds exactly the 2 deliberate flip-only pins
  (normalize.test's PHASES vocabulary; check-refresh's age-gate) — every other change is
  both-state-safe (fixtures derive their era markers from PHASES, so the 12.2 cycle
  re-arms automatically), which is what keeps the pins making the flip deliberate.
  Flip-day usage: `git apply docs/s2-flip-test-patch.diff` inside the flip commit; step
  9's `npm test` then lands green.
- ✅ **nightly.yml prompt softening — PREPARED 2026-08-12** (chosen with the Dependabot
  bundle): BOTH agent prompts (the primary's COMPLETION CONTRACT and the recovery's
  "do not finish until" line) now carry the same one-exception rule — a mass-movement
  gate failure the agent did not cause is recorded in `anomalyAckProposal` and the agent
  finishes honestly; buying a green gate by editing observations (the `seasonVerified`
  revert) is named and forbidden. Same edit adds `data/season-archive/` to Gate 0's
  immutable set. Lands together with Dependabot #54 in ONE push so the auto-kicked
  nightly is spent once (merge #54 into the local branch carrying the prompt edit, push
  both as one).
- **Dependabot #54** (claude-code-action bump): safe to merge since `77bd0a3`; merge
  WITH the prompt-line edit above per the one-kick plan.

## 12.2-cycle note (review finding #7 — record it now, act at the next cycle)

A missed 12.2 `--frozen` would silently re-activate the stale 12.1 artifact as the
rendered forecast the moment the 12.2 flip lands. The lane's stand-down (`!PHASES.ptr`)
covers the window while a 12.2 PTR cycle is OPEN, not the gap after the 12.2 flip if no
new freeze was declared. A staleness guard is the durable fix, but the obvious predicate
("artifact must not predate the newest snapshot of its own phase") is WRONG — DECISION 5
freezes days before the flip while nightlies keep writing same-phase snapshots, so it
would refuse the legitimate 08-18 activation. A working variant needs the artifact's phase
to equal the phase of the newest snapshot whose phase differs from the current one — build
it with the 12.2 transition scope, not now.

## After settlement (~09-01, +14 days; second checkpoint +28)

- First real `npm run report-card` grade. Composition comparability landed (`2cb40f5`);
  remaining ergonomics: an artifact loader for the grade side (part of B6), a
  `--settle-days 28` flag (reachable today via `--settled <date>`), a markdown writer.
- ~~DECISION 3's +14 PTR-surface sunset~~ — no longer a +14 action: the sunset happened
  AT the flip (DECISION 3 amended 2026-08-12) and `ptrSunset` no longer exists.
- Gearing re-harvest (C5): a reviewed code+data task, NOT a date edit — harvests are
  PTR-pinned in code (harvest-*.mjs, lib-wowhead.mjs) and gearing's validator pins the PTR
  URLs + item-count fingerprints, so a live re-harvest fails until the pins are
  re-reviewed. Check the stat-priority guide pages' own season state at the source first.
  Soft window opens 08-18/19.
  **Riley (2026-08-12): significant gearing updates are planned BEYOND the re-harvest** —
  treat the gearing lane as a first-class pipeline item once the flip lands; scope to be
  defined with Riley at kickoff rather than inferred.

## Deliberately left alone (checked 08-11, do not re-open without new evidence)

Bloodmallet `maxAgeDays` 5 (the red IS the signal — owner decision in `edc63942`);
`published` threshold retightening (deferred ~09-01; tierListHealth already flags at 14d);
a Method `published` block (needs a deliberate number first — it self-dates 133d);
ci.yml-on-nightly-commits gap (narrow: publish+deploy both run npm test; exposure is the
23 UI invariants for 2.6-4.4h); skill-log pruning and payload slimming (C7, competes with
launch week); the seven measured dead ends listed in CLAUDE.md.
