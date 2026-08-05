# ADR: SimC reference-weight pipeline

- Status: Accepted
- Date: 2026-08-04
- Scope: `gearing/` only

## Context

The Season 2 gearing explorer now lives inside the WoW Class Tracker repository. It needs
reference secondary-stat coefficients for every specialization that SimulationCraft can
model honestly, while retaining the accepted Shadow Priest reports byte-for-byte. The
upstream MID2 profile set is incomplete, a full matrix is expensive to run, and damage
scale factors do not represent healer throughput, tank survival, or Augmentation support.
The tracker's MID1 nightly DPS metrics and projection model solve different problems and
must not consume these coefficients.

## Decision

Keep the system isolated under `gearing/` and split its responsibilities:

- `data/simc-run-manifest.json` is the curated operational catalog. It accounts for all
  40 tracker specs, defines supported scenarios and reviewed build/profile inputs, and
  records whether each spec is eligible, pending, deferred, or unsupported. A logical guide
  profile may bind each scenario to a different reviewed source actor through
  `scenarioInputs[]`; each input pins the materialized and upstream actors, provenance mode,
  build, profile, generator, and gear-plan hashes, talent source, item database, Catalyst
  redirects, and actual tertiary-rating declaration.
- `data/simc-reference-weights.json` is the accepted-results ledger. Records use stable
  profile, build, and result IDs and retain the simulator version, source hashes, seeds,
  run-level coefficients, drift, and timestamps needed to reproduce an acceptance.
- `src/run-simc-reference.mjs` is manual, plan-first, and resumable. Planning is read-only;
  execution and promotion require explicit commands. It validates the pinned executable,
  keeps raw compressed reports, uses two independent runs, and refuses unstable or
  mismatched results. A reviewed profile remains `ready` and invisible until every planned
  scenario has separately passed promotion; the final promotion publishes the full matrix.
- Validation derives the expected run matrix and coverage from the manifest instead of
  hard-coding Shadow Priest. It follows each accepted record into the correct build-specific
  audit directory. The app shows accepted coverage, the actual source actor, and honest
  fallback states.
- Conventional personal-DPS specs are the completed execution cohort: 26 accepted specs,
  30 logical profiles, and 60 scenario records. 6 tank specs and 7 healer specs remain
  deferred to role-appropriate objectives (13 deferred); Augmentation remains the 1
  unsupported spec.

The schema change itself did not run simulations. The subsequent Destruction pilot used a
bounded same-gear DPS comparison to select Hellcaller for single target and Diabolist for
five targets. The later expansion admitted official Unholy evidence and the v2 curated
campaign for the remaining 23 conventional DPS specs. The final matrix contains 4
`official-output` profiles with 8 records and 26 `curated-same-gear` profiles with
52 records. The v2 campaign pins exact permanent enhancements for all 44 reviewed actor/APL
candidates; its Catalyst model retains positive source tertiaries when present and records
their audited absence across all 52 curated scenario inputs. The unenhanced v1 artifacts
were withdrawn and are not accepted production evidence. Neither the root nightly pipeline
nor the projection model is changed.

## Options considered

1. Feed weights into the tracker projection model. Rejected: local derivative scale
   factors are neither tier grades nor cross-spec DPS measurements.
2. Use a gearing-owned manifest and evidence ledger. Chosen: it is auditable, resumable,
   portable with the offline app, and can expose incomplete coverage without guessing.
3. Continue hand-editing a Shadow-specific JSON file. Rejected: it cannot safely scale to
   many specs or distinguish reviewed profiles from incomplete upstream drafts.

## Consequences

- Adding a spec requires a reviewed manifest entry before any simulation can be promoted.
- Accepted records remain reproducible and cannot silently drift when display labels or
  guide priorities change.
- Coverage can expand incrementally without publishing provisional values as accepted.
- One readable guide profile can use the best measured source actor per encounter without
  pretending those actors are user-facing guide variants. Job fingerprints include the
  complete scenario mapping, so changing any source invalidates resumable work.
- The offline data/app remain portable, but the currently verified SimC executable hash is
  explicitly limited to Windows x64 until another platform artifact is independently pinned.
- The manifest and ledger intentionally duplicate a small amount of provenance; validation
  must reject disagreement between their stable IDs and source metadata.
- Final character gearing decisions still favor direct gear simulations over generic
  reference coefficients, especially for effects, sockets, unequal item levels, and
  current stat totals.

## Remaining follow-up

Conventional DPS expansion is complete. Affliction and Demonology use explicitly labeled
curated same-gear profiles, and the earlier Unholy `army_ghoul` blocker is resolved. Future
work requires separate tank-damage/survival and healer-throughput contracts; Augmentation
remains unsupported until a defensible contribution model exists.
