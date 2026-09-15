# September 15 audit: priority fixes

This release addresses F1–F6 and S1 from [the comprehensive audit](audit-2026-09-15.md).

## Changes

1. **Gearing ceilings (F1):** ordinary raid and Mythic+ items use the reviewed Myth
   upgrade ceiling of 334; final-boss 344 exceptions remain. Acquisition levels and
   upgrade steps are labeled separately. The checker now finds upgrades above 324.
2. **Unique-Equipped items (F2):** upgrade candidates and loot-source potential check
   every equipped slot, including items with missing levels. A unique item can
   replace its own copy, but cannot become a duplicate in another slot. Checks use
   exact item IDs and the existing unique metadata; unmodeled unique groups remain
   outside this dataset's claims.
3. **Transcript recovery (F3):** artifact selection uses creation time and completed
   phase, scans all pages, and stops on ambiguous, unavailable or untrusted history.
   Explicit reconciliation authenticates an existing successful caption receipt
   and resolves only its matching request, preserving usage and later review holds.
4. **Method publication dates (F4):** both tier pages participate in deterministic
   publication-date evidence. Their verified August 10/13 dates remain distinct
   from capture dates, with the existing editorial-source 45-day review window.
5. **Phone controls (F5):** Ladder and Compare all have persistent accessible names;
   decorative symbols are hidden from assistive technology.
6. **Phone CI regression (F6):** tests check header/rail/drawer geometry and complete
   touch targets, including an explicit fresh NEW badge, instead of a fixed card
   height that rejected valid wrapping.
7. **Collector isolation (S1):** deterministic collection, agents and publication
   use separate jobs. Collector artifact IDs, archive digests and manifest hashes
   come directly from the collector job. Publication verifies every receipt byte.
   Untrusted refresh output downloads outside the checkout and may replace only
   approved tracked data/log files, so it cannot replace the verifying code.

## Transcript trust and migration

The metered provider key and new `TRANSCRIPT_STATE_SIGNING_KEY` remain in the
collector. `TRANSCRIPT_HANDOFF_KEY` encrypts the caption bundle; agent access to
that separate key grants no provider or state-signing authority. No dependency
was added.

Signed state binds exact bytes to repository, workflow, run, attempt and phase.
Restoration also checks that the exact artifact was created during the completed
collector job for its authenticated attempt. Re-uploading an older signed state
from an agent job therefore cannot roll the ledger back. Ambiguous timestamp
boundaries fail closed. The migration accepts only two reviewed historical IDs
and exact state hashes; invalid authentication never falls back to migration.

The September 12 completion receipt `10298937863` records 303 chunks for
`rYFv6Ohr7mE`. The latest pre-fix state `10403723590` has 13 counted requests and
one false uncertainty for that exact attempt. The release recovery uses
`transcript_reconcile_artifact_id=10298937863`, without approving a retry.

## Validation

- Focused gearing regressions pass; independent review checked 1,056 real unique
  item/spec combinations and all 285 catalog ceilings.
- Transcript selection/reconciliation regressions and independent adversarial
  cases pass. Both historical migration state hashes were verified from actual
  downloaded artifacts.
- Collector receipt substitution, hostile artifact paths, missing/changed inputs,
  encrypted handoff and workflow-boundary tests pass.
- The phone card regression passes in Chromium, Firefox and WebKit, with and
  without NEW. Actual browser checks confirm the audited gearing examples,
  Method publication-date display and phone accessible names.

Full-suite, release and hosted recovery receipts are recorded below after execution.
