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

## Release receipts

- Full local suite after integration: **639 tests; 638 passed, zero failed, one
  expected seasonal skip**, with browser invariants running (117.7 seconds).
- [PR 67](https://github.com/riles22/wow-class-tracker/pull/67) merged as
  `dbe47dbfc9522c1dd91f3584c76ba9098d0e8bbe` after both hosted test/browser runs passed.
- [Release CI](https://github.com/riles22/wow-class-tracker/actions/runs/34990653726)
  passed, including Chromium, Firefox and WebKit.
- [Pages deployment](https://github.com/riles22/wow-class-tracker/actions/runs/34990653889)
  built, deployed and verified the exact release. Independent verification at
  **2026-09-15 15:48:39 UTC** matched all four public pages, including the Season 1
  archive. See [the byte-comparison receipt](audit-evidence/2026-09-15/priority-release-verification.json).
- Live browser checks confirmed the 324-to-334 upgrade routes, legal second-ring
  suggestions and accessible phone controls. The only captured browser error came
  from the installed Grammarly extension, outside the application.

Hosted transcript repair succeeded in
[run 34990700222](https://github.com/riles22/wow-class-tracker/actions/runs/34990700222).
The collector restored signed artifact `10405308457` with HMAC and producer-window
verification, authenticated historical receipt `10298937863`, and saved repaired
completed artifact `10406230514`. **13 counted requests remain, uncertainty is zero,
and this run made zero new transcript requests.** The original September 12 attempt
now records `fetched`, with no outstanding reservation. The authenticated state
SHA-256 is `4834b8a9014c5e795b0f7caf9522a311e1f4bad3c78f7e3899ead306f58c50ac`.
See [the sanitized recovery receipt and collector log proof](audit-evidence/2026-09-15/priority-transcript-recovery.json).

The complete three-job refresh **passed** at **2026-09-15 16:10:29 UTC**. The
publisher admitted 23 allowed data/log files, ignored 71 agent history files, and
authenticated all 12 collector files from artifact `10406150847` after the untrusted
overlay. All integrity, source-retention, validation, build, completeness, snapshot
and publication gates passed. It published commit
`300d39640c665df9464d6b9f0564ede39480a3ef`, a direct child of the release commit.
See [the publisher receipt](audit-evidence/2026-09-15/priority-publisher-verification.json).

[The resulting Pages deployment](https://github.com/riles22/wow-class-tracker/actions/runs/34993290789)
passed. Independent verification at **2026-09-15 16:12:04 UTC** again matched all
four public pages to that exact commit's build; see
[the refreshed-site receipt](audit-evidence/2026-09-15/priority-refresh-verification.json).
[Its exact-commit CI run](https://github.com/riles22/wow-class-tracker/actions/runs/34993293103)
also passed unit tests and browser invariants in Chromium, Firefox and WebKit.
Both release and refreshed-commit CI outcomes are saved in
[the CI receipt](audit-evidence/2026-09-15/priority-ci-verification.json).

The preceding automatic verification run's collector also succeeded, with zero
transcript requests. That duplicate run was cancelled before publication so the
explicit repair run could replace its repeated agent work.

## Remaining scope

F7–F10 remain lower-priority follow-up items from the original audit. Known upstream
source refusals and partial coverage remain visible: this refresh retained 14
degraded requirement rows (nine blocked Archon, two unreachable legacy WCL, and
three partial metric feeds). Their dates and values were not silently promoted.
