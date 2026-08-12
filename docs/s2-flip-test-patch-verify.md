# S2 flip-day test patch — verification log (2026-08-12)

Worktree: `.claude/worktrees/agent-ad5b2b8f7eaa4b380` @ `0bafe22` (clean).
Flip state simulated exactly per the amended spec: `src/normalize.mjs` PHASES →
`liveSeason: "s2"`, `liveLabel: "12.1"`, `ptr: null`, **`ptrSunset` DELETED** (DECISION 3
amendment 2026-08-12); `src/render.mjs` → `SNAPSHOT_PHASE: "12.1-live"`,
`CONSENSUS_VERSION: 4`. Nothing else in src/. Those src edits are NOT in the patch and
were reverted after verification.

Playwright really ran: `npm i --no-save playwright@1.61.1` + chromium (user-global cache
hit). **0 skipped in every run below** — the 23 UI invariants executed against a dist/
rebuilt at the state under test (build.test's `build(ROOT)` rewrites dist/ before the UI
file runs, so the invariants always see the current phase's page).

## (b) Counts

| run | tests | pass | fail | skipped |
|---|---|---|---|---|
| flip state, tests unpatched (BEFORE) | 377 | 347 | **30** | 0 |
| flip state, tests patched (AFTER) | 377 | **377** | **0** | 0 |
| pre-flip HEAD src, tests patched (safety check) | 377 | 375 | **2** (the two deliberate flip-only pins, listed below) | 0 |

## (a) The red list at flip state, before fixes — 30 tests, exactly six files

**test/build.test.mjs (1)**
- `every PTR metric-name key resolves against real data (2026-08-08)` — asserts `meta.ptrMetricNames` truthy; `PTR_METRIC_NAMES` is null when `PHASES.ptr` is null.

**test/check-refresh.test.mjs (1)**
- `age gate: SNAPSHOT_PHASE still pre-launch past its due date is a violation` — the gate tests the phase VALUE; at `"12.1-live"` it is silent by design, so the pinned violation can never fire.

**test/normalize.test.mjs (1)**
- `PHASES is the single era vocabulary and carries the current cycle` — the deliberate vocabulary pin (liveSeason "s1", ptr.marker, ptrSunset === false).

**test/render.test.mjs (19)** — root causes: (i) `expertRead` requires `PHASES.ptr != null` + marker match, so the take/expert lane returns null for ANY input between cycles; (ii) `PTR_MPLUS_SERIES` = {} (derives from the marker), so the zone-56 M+ testing lookup dies (the raid testing key is hardcoded and survives); (iii) nothing can be season-AHEAD of s2, so live outlets with `seasonVerified: "s2"` leave the next-patch term.
- `projectionFor: full-signal math is exact and transparent` — confidence high→medium (expert slot gone)
- `projectionFor: M+ uses the role's own zone-56 series; shifts clamp to 0–100` — tank fixture projects null (no lookup key) → crash on `.score`
- `confidence is a ratio against obtainable signals, not a raw count` — healer M+ high→low, DPS raid high→medium
- `expertRead: corroboration outranks a single loud voice` — null read → crash on `.raw`
- `expertRead: one prolific creator is one vote, not eight` — null → crash on `.shrunk`
- `expertRead: superseded and live-era takes are excluded` — last assert reads `.shrunk` of a null
- `outlookFor: experts set the direction only when no writeup exists` — panel silent → falls to tally "up"
- `outlookFor: a split or barely-there panel falls through to the tally` — `expertRead(...).shrunk` on null
- `projectionFor: the expert read either decides or adjusts, never both` — tally +10 replaces panel +4 → 99 not 93/94
- `projectionFor: an outlook the model refused to apply is not counted as evidence` — both cells drop to "low", notEqual fails
- `projectionFor: the prior slice's divisor is the consensus perSource count, frozen contributors included` — wowhead no longer ahead → no next-patch term → 50/50 tie, topPublisher icyveins
- `projectionFor: the next-patch term is divided by PUBLISHER, not by source id` — set shrinks to the era:"ptr" product alone → count 1 not 2
- `expertRead: takes are bracket-scoped — explicit field first, then patchContext` — null → crash on `.creators`
- `projectionFor: an M+ tier-list read no longer moves the raid forecast` — the M+ cell no longer hears them either
- `projectionFor: a cell the expert lane moved can never read prior-only` — nothing moved it → score === prior
- `projectionFor: when the expert panel drives, it is one signal, not two` — basis reads "outlook 0", no /expert panel/
- `expert quorum: three shrunk creators may cross ONE band edge…` — no panel → 86/75/74 unmoved
- `expert quorum: the meta nudge stays inside the band the expert term chose` — nudge applies inside A+ (78) instead of A (68)
- `expert quorum is role-scoped: one creator moves a healer/tank letter…` — parts.expertCreators null, no crossing for any role

**test/ui-invariants.test.mjs (7)** — the runbook predicted four; seven actually pin the old era-gating. Causes: ptr-null pins `state.era` to "live" (era toggle gone, icyveins-ptr option disabled + redirect to consensus), while B6's `FROZEN_FC` un-gates the projection surfaces in the live view.
- `every source view renders that source's OWN ratings` — icyveins-ptr selection redirects to consensus → consensus letter rendered
- `a deep link restores view state and the named drawer` — `era=ptr` param is inert; era reads "live"
- `the Into-12.1 movers strip is era-gated, ranked, and drills through` — strip stays VISIBLE in the live view under FROZEN_FC
- `an era-gated PTR tier list shows its own 12.1 letters and is unreachable in the 12.0.7 view` — unreachable in EVERY view now
- `Compare all distinguishes … and era-gates` — projection column present in the live view under FROZEN_FC
- `a spec with takes but no writeup says what IS known, not 'pending'` — writeup lane sunset; drawer shows "12.1 baseline view / Live-season data."
- `a source's column qualifier names the season that source's letters describe` — projection qualifier reads "12.1 forecast — frozen 2026-08-11", fails /forecast$/

**test/validate.test.mjs (1)**
- `validateData enforces era↔name consistency, finite values, and metric uniqueness` — the marker→era guard (`named 12.1 PTR but tagged era "live"`) dies with `PHASES.ptr`, by design (documented inline in validate.mjs).

## (c) Per-file: BOTH-STATE-SAFE vs FLIP-ONLY

| file | nature | what changed |
|---|---|---|
| `test/normalize.test.mjs` | **FLIP-ONLY** (deliberate pin) | PHASES pin updated to the flip values: liveSeason "s2", liveLabel "12.1", `ptr === null`, patchName unchanged, and **`ptrSunset` asserted ABSENT** (`!("ptrSunset" in PHASES)`) — not false. Reds on pre-flip HEAD by design. |
| `test/check-refresh.test.mjs` | **FLIP-ONLY** (deliberate pin) | The age-gate test now pins the flipped state: no SNAPSHOT_PHASE violation past PHASE_FLIP_DUE (the gate silenced itself on the value flip — its value-test property stays pinned by the untouched source-regex test). Reds on pre-flip HEAD by design. |
| `test/build.test.mjs` | BOTH-STATE-SAFE | ptrMetricNames assert guarded on `PHASES.ptr`: null phase → assert the payload ships `null` (not stale keys), else the original resolution walk. |
| `test/validate.test.mjs` | BOTH-STATE-SAFE | The marker→era assertion guarded on `PHASES.ptr` and derives the expected message from the marker; the other three assertions unconditional. |
| `test/render.test.mjs` | BOTH-STATE-SAFE | Preamble derives `MARKER`/`CYCLE_OPEN` from PHASES; every fixture patchContext now derives from `MARKER` (so the 12.2 marker re-arms them automatically). 19 tests branch: full machinery when a cycle is open, the documented closed-lane behaviour (expertRead null, no adjustment/quorum/crossing, honest confidence/prior-only tags, era-gate-before-bracket-scope) when closed. `S2_IS_AHEAD` branches the two season-ahead fixtures (perSource divisor still exercised in both states). |
| `test/ui-invariants.test.mjs` | BOTH-STATE-SAFE | Era-pin invariants branch on `payload().meta.frozenForecast` (movers visible for the frozen record; Compare-all keeps the frozen projection column while m:ptr/icyveins-ptr stay sunset; qualifier must read `12.1 forecast — frozen <date>`) and on `payload().meta.phases.ptr` for the pure era-pin surfaces (icyveins-ptr redirect-to-consensus asserted as the reachability contract; era=ptr deep-link param inert; drawer baseline slot). tlcount expectation now derived from perSource composition (the consensus honestly reads "Two" mid-transition — DECISION 1). No security/injection invariant touched. |

## (d) Surprises / drift vs the runbook

1. **`test/season-archive.test.mjs` DOES NOT EXIST in this tree** (checked at `0bafe22`). The instruction said it is new 2026-08-12 and phase-agnostic. The nearest matches are `test/freeze-season.test.mjs` and `test/report-card.test.mjs` — **both passed at flip state unmodified (0 failures, untouched by this patch)**, which is the behaviour the instruction predicted for "season-archive". If the file lands later, re-run the flip simulation before 08-18; nothing here covers it.
2. **Seven UI invariants red, not four.** The three extras beyond the runbook's list: the source-OWN-ratings loop (hits the icyveins-ptr redirect), the era=ptr deep link, and the takes-but-no-writeup drawer slot. All are the same two root causes (era pin + B6), no new mechanism.
3. **The flip-day tlcount reads "Two", not "Four"** — the count is derived from perSource, and method/archon are still s1 today, so the mid-transition consensus is icyveins+wowhead only. The flip branch derives the expectation from the payload instead of the registry's era filter. Re-measure on the day: it becomes "Three"/"Four" as those outlets flip, with no test edit needed.
4. **`applyFrozenForecast` deletes `projMovement`**, so the movers strip at flip state shows consensus-vs-frozen-forecast deltas — the existing row/sort/count assertions all held with no change; only the era-gating tail needed the branch.
5. No failure outside the runbook's six files. The gearing suite, escaping/injection invariants, digest, snapshot, fetch-*, freeze-season, report-card and community-overrides tests were green at flip state untouched.
6. Note for the flip commit itself: this patch was verified with `SNAPSHOT_PHASE = "12.1-live"`. The check-refresh pin only requires "not 12.1-ptr" (regex-pinned separately), so a different live id chosen in the commit stays green.

## Deliverables

- Patch (test/ only, 6 files; `git apply --check` clean against pristine `0bafe22`):
  `C:\Users\Riley\AppData\Local\Temp\claude\C--Users-Riley-Documents-Projects-WoW-Class-Tracker\fe9f0a68-16fc-4bee-907c-36abba8866a4\scratchpad\s2-flip-test-patch.diff`
- This log:
  `C:\Users\Riley\AppData\Local\Temp\claude\C--Users-Riley-Documents-Projects-WoW-Class-Tracker\fe9f0a68-16fc-4bee-907c-36abba8866a4\scratchpad\s2-flip-test-patch-verify.md`

---

## Re-verification against HEAD `33c7cdc` (2026-08-12, after the season-archive lane landed)

The patch was authored one commit earlier (`0bafe22`); re-verified in a fresh worktree
of current HEAD: `git apply --check` clean; flip state + patch = **382 / 0 / 0**
(Playwright really running); pre-flip HEAD + patch = **380 / 2 / 0**, the two reds being
exactly the deliberate flip-only pins (normalize's PHASES vocabulary, check-refresh's
age-gate). One both-state fix was folded into master directly rather than the patch:
`test/season-archive.test.mjs` now asserts the archive's own `seasonName` instead of a
"Season 1" literal, because at the flip state the freeze honestly derives Season 2.
