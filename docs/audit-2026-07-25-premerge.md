# Pre-merge audit — 2026-07-25

Scope: every change on `claude/project-audit-ux-review-6h8x2l` (14 commits, the 2026-07-24
audit's fix batches A–D). Run as an adversarial multi-lens review with the session's own
audit doc treated as *claims to check, not facts*, plus mutation testing of the new tests
and replay of every new gate against real committed history.

**Verdict: one blocker, fixed. Merged after the fix plus the honesty and gate items below.**

Read this file before proposing work on any of it — "Left open" records decisions, not
oversights.

---

## Blocker — fixed

### The version markers were written and never read

`PROJECTION_VERSION` / `RANK_VERSION` (commit 61d8589) were stamped into every snapshot and
consumed by nothing: `pickBaseline`, `baselineDiffers`, `movementFor`,
`projectionMovementFor` and `historySeries` all ignored them. So the v1→v2 bump published
**our own recompute as spec movement**.

Verified, not inferred:

- `data/specs.json` is **untouched** on this branch (only `community.json`,
  `required-sources.json`, `run-manifest.json` changed), yet the committed `dist/index.html`
  shipped **11 forecast arrows, 51 metric rank arrows and 3 Dummy Dome arrows**. The 11
  forecast arrows were exactly the 11 (spec, bracket) pairs whose projection differs between
  the v1 and v2 formulas.
- It also **erased real movement**: the redefined ranks made the 07-24 snapshot look
  "different", so the baseline walk stopped there. Master correctly showed
  `movementSince: 2026-07-23` with 9 consensus moves; the branch showed 07-24 and zero.
- It **recurred**. `pickBaseline` skips snapshots identical to the present state, so on any
  quiet night it walked past every v2 snapshot back to the v1 one and re-narrated the same
  phantom set. The old `RANK_VERSION` comment's "expect exactly one such night" was false.

**Fix (bdcb480).** A snapshot's effective version is `field ?? 1` — every snapshot written
before the markers existed came from the v1 formulas, and `rankVersion` is absent from all
18 history files. Readers then **degrade the comparison rather than reject the snapshot**:
`baselineDiffers` skips the rank/dummy sections across a rank boundary, `movementFor` drops
rank and dummy arrows while keeping consensus tier arrows (letters mean the same in every
version), `projectionMovementFor` returns early across a projection boundary, and
`historySeries` nulls projection points from older formulas so the sparkline shows a gap
instead of splicing two formulas into one line.

Two tempting fixes are worse than the bug, both verified:

- **Skipping mismatched snapshots** → all 18 files are rank-v1, baseline becomes `null`, and
  a night with 9 real moves narrates *nothing*, silently.
- **"Unstamped means current"** (to keep test fixtures green) → leaves the defect fully in
  place, since no history file carries `rankVersion`. Three tests now reject it.

Output after the fix: `movementSince: 2026-07-23`, 9 real consensus moves, zero phantom
arrows — stable across two simulated quiet nights, with rank arrows returning in full once a
v2 baseline exists. All five gates mutation-tested.

---

## Also fixed

| # | Finding | Fix |
|---|---------|-----|
| 1 | **Overrides sweep lost array position** — it removed managed entries then `push`ed them back, so appending one curated creator reordered `community.json` and Gate 0 failed the night, blaming the agent for a reorder the applier produced. | Retract *after* the upsert, not before; entries keep their slot. New order-**sensitive** test (the existing C8 test `.sort()`s, which is why this shipped). Name-collision capture deliberately unchanged — refusing on collision would make any pre-existing `community.json` unbuildable. |
| 2 | **Data-health banner** grouped by source alone, so from 2026-08-01 the six fresh raw-DPS series would join the rDPS outage clause and be misdated by 15 days. | `dataHealth()` now tags Warcraft Logs rows with an explicit `family`; the banner groups by (source, family) and the outage wording attaches only to the family actually erroring. A name regex was not enough — `Median DPS (Mythic, healer)` is rDPS-family despite its name, and the test pins exactly that row. Also dropped "Tier lists … refresh nightly", which `dataHealth()` cannot verify (it never reads `sources.json`) and which is false precisely when the nightly stalls. |
| 3 | **`minSuccessfulSources` was satisfiable by invented rows** — it counted every `result: "success"`, and rows matching no requirement are never probed. | Count only rows answering a requirement. Verified: 25 real sources `unreachable` + 10 `padding-N` successes now fails at "only 0 sources succeeded". |
| 4 | **One ack token waived two independent gates**, and the waived value findings were computed then discarded. | Separate `VALUE_MOVE_ACK` / `--value-ack=` and a `value_move_ack` workflow input, with **no fallback** to the anomaly ack; waived findings are now printed individually. |
| 5 | **The value guard read only `spec.metrics`** — 244 large-magnitude sim and Dummy Dome numbers were unguarded, and a 1000× Bloodmallet parse published green. | Indexed `fightProfile.targets` and `ptrDummy.targets` too. Replayed over 18 real nightly transitions: **zero new findings** — coverage, not noise. The 2 reds in that window are both ends of the true-positive Archon column-parse incident. |
| 6 | **`specBuildChanges` treated any `Class (…)` entry as class-wide**, so a Hellcaller line attached to Demonology, which has no Hellcaller tree. Latent, but the shape is already in `ptr-builds.json`. | Only `(class-wide)` and `(all specs)` are whole-class; a hero-tree line attaches solely to specs the build names outright. Real-data output is byte-identical (same 11 attachments). |
| 7 | **Viewnote said "the 12.0.7 consensus"** in six of seven ptr-era views, five of which show a single named tier list — the one surface added to prevent letter misattribution was committing it. | Label derived from `TIER_SOURCES` keyed off `state.source`. `docs/audit-2026-07-24.md` prescribed the bad sentence verbatim; that prescription is corrected in place so the next agent does not restore it. |
| 8 | **"43 specs change tier" on a 40-spec roster** — the summary printed (spec, bracket) pairs as specs. | Counts distinct specs: "32 of 40". Browser invariant asserts the count matches the payload and can never exceed the roster. |
| 9 | **The movers strip shipped *above* the PTR caveat**, contradicting its own comment. `git show c839e36` proves it was never below — the comment was wrong when written. | Intent honoured: moved below the caveat (these rows are the ones driven hardest by tiny-n PTR cuts). A DOM-order invariant now asserts the markup, not the comment. |
| 10 | **The XSS fixture never poisoned `data/ptr-builds.json`** — the most agent-written file in the repo, whose `highlights[]` are copied verbatim from a fetched Discourse thread. Mutating that sink's `esc()` left the suite green. | Fixture poisons it with the `"<Spec> <Class> "` prefix `specBuildChanges` requires (a bare probe is silently dropped and would give false assurance), plus a `markedSinks >= 4` sanity assertion so a fixture that renders nothing can never pass. |
| 11 | **The "ordering contract" test pinned no ordering** — reversing the two calls in `buildPayload` took `projMovement` 11 → 0 with the suite green. | The test now also proves its fixture is capable of producing a move, so it cannot pass for the wrong reason. |
| 12 | **The failed-publish reporter's comment overclaimed** — a step-level `if: failure()` cannot fire in a job that never got a runner, which is the 2026-07-25 incident it cites as motivation. | Comment states the real scope and names the heartbeat as the backstop for that mode. |
| 13 | **Local test recipe was a foot-gun** — `playwright` ships no postinstall browser, so the documented command produced 11 hard failures, not skips. | Header documents `npx playwright install chromium` and the `PLAYWRIGHT_CHROMIUM_EXECUTABLE` escape hatch, and says why a launch failure is deliberately *not* a skip. |

Also: removed two unused probe constants from `test/escaping.test.mjs` that implied coverage
that file does not have.

---

## Left open — deliberate

- **Value-guard margin.** A genuinely healthy night (07-23) came within **6.6pp** of the 60%
  row limit (Arcane Mage Dummy Dome 3T, 210881→323491), on a series written by the
  *deterministic* fetch step no agent can influence. The honest false-positive rate is ~1 in
  8, not the 1-in-3 the pre-merge estimate feared. Budget for one human `value_move_ack` on
  the first legitimate upstream recipe change rather than pre-emptively loosening the limit —
  per-family overrides would need a code change, and demoting the row check to advisory would
  remove the only guard against a single-spec column error.
- **`encounter-tiers.json` cell churn** (proposed at `audit-2026-07-24.md` A3, never
  implemented). Still unguarded on values; row counts and dates are covered.
- **Run-level failure coverage.** A `workflow_run`-triggered watcher is the right instrument
  for "the job never started". Not built; the 28h heartbeat covers it ~5h later.
- **Robydoby is intentionally outside the refresh contract.** It looks like a monitoring blind
  spot — 33 stored rows, no requirement row, 9 days stale and nothing would ever say so — and
  it was added as a requirement during this pass before `SOURCES.md:31` was found to state the
  decision explicitly: *"deliberately NOT in the refresh contract, so a volunteer sheet going
  quiet never reddens a night."* Reverted. **Do not re-add it.**

## Verified correct (executed, not inferred)

- **No game data was lost or altered.** Every published number, tier, writeup and source
  typing is byte-identical to master; master's v1 payload reproduces
  `data/history/2026-07-24.json` exactly (0/80 projection, 0/80 consensus mismatches).
- **22 of 24 attempted mutations were caught** by the suite. Removing `build.mjs`'s payload
  escape fails loudly under real Chromium, and the hashed CSP held even under that mutation —
  an unescaped build ships DOM injection, not code execution.
- **The ack path is human-only end to end.** On cron runs both ack env vars are empty and
  falsy; a waiver genuinely requires a manual `workflow_dispatch`.
- **Nothing in the diff grants an agent context the ability to push, tag or dispatch.**
- The A1 freshness precedence fix, `classifyHighlight` on real data, the rank floor and tie
  boundaries, and the UI lanes (fight-view override, column qualifiers, `chjump`
  drill-through, drawer `inert`, Ladder geometry 1920→320, `content-visibility`) all behave
  as documented.
