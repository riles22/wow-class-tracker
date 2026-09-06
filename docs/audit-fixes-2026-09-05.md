# Audit fixes and owner decisions — 2026-09-05

> Historical handoff, superseded later on September 5: Riley approved all recommendations and publication. The fixes below are committed, repository protections are enabled, and fresh gearing data has been fetched. See [the refresh recovery and release report](refresh-recovery-2026-09-05.md) for the current state, validation, and remaining upstream failures. The original findings and decision rationale are retained below.

Twelve of the thirteen findings in [the September 4 audit](audit-2026-09-04.md) have code fixes prepared locally. F9 is a source-policy decision and remains unchanged. The fixes are on `codex/audit-fixes-2026-09-04`, based on `4d1bde6e7f62b344928c4854dac155c779f3fa30`. They have not been committed, pushed, or deployed; the public nightly vulnerability remains until the workflow patch reaches master.

No game/source data, stored forecast, history snapshot, model weight, source membership, or dependency changed. Every existing field in the generated tracker payload was compared with HEAD and is identical; only `meta.forecastReport` was added.

## Fixes

| Finding | Result | Implementation and regression coverage |
| --- | --- | --- |
| F1 — privileged filename execution | Fixed locally | `src/check-skill-logs.mjs` replaces shell interpolation with literal Git argument arrays. HEAD supplies the path allowlist; NUL-delimited reads cover working, staged, ignored, and untracked log changes. New paths, deletions, renames, and nonregular replacements fail closed. Staging repeats admission and uses literal pathspecs. Legitimate log pruning still warns rather than fails. `test/skill-logs.test.mjs` covers unusual literal filenames, unauthorized paths, stage-time changes, and workflow wiring. |
| F2 — failed guide refresh erases data | Fixed | Guide fetches stage verified observations, distinguish verified 404 absence from failed transport, and fail incomplete runs without replacing the published source. Retrying the same request resumes successes. Tests reproduce all-failure and partial-failure runs and verify the downstream candidate payload remains unchanged. |
| F3 — incorrect weapon upgrade gain | Fixed | Game-plan comparisons use curated hand eligibility and the equipped loadout. Tests cover casters, shields, actual offhand upgrades, legitimate dual wield, and two-hand setups. |
| F4 — false guide freshness | Fixed | A zero-fetch run preserves exact bytes and dates. Per-spec verification receipts derive the oldest complete-roster date; a single refreshed spec cannot freshen the whole source. Pending legacy outcomes remain retriable and distinct from verified absence. Mixed-date resume and incomplete-coverage tests enforce this. |
| F5 — frozen artifact overwritten on retry | Fixed | Same-content retries retain the original artifact bytes, Git SHA, and data hash. Changed-content retries fail before writes; malformed existing artifacts also fail closed. Snapshot tests verify provenance and refusal behavior. |
| F6 — explicit PTR metric accepted as live after phase close | Fixed | Validation rejects a PTR-named metric explicitly tagged live regardless of whether a PTR cycle is open. Closed-cycle and current/future-label tests cover the bypass. |
| F7 — settled report unavailable in the site | Fixed | `dist/forecast-report.html` derives forecasts and carry-forward priors from the immutable artifact, verifies its declaration, and grades the first eligible saved +14/+28 outcomes separately. The tracker links the comparable completed result. No current-data recomputation replaces frozen values. Incomparable or missing outcomes cannot produce public accuracy claims. |
| F8 — value movement acknowledgement missing from completion gates | Fixed | Both refresh completion gates receive `VALUE_MOVE_ACK`, matching the publish gate. Structural tests keep value, magnitude, and anomaly acknowledgements distinct. |
| F9 — Archon outage policy contradicts runtime | Decision below | The existing retained-source behavior is preserved. Neither source membership nor the immutable refresh contract was silently changed. |
| F10 — valid comparison labeled NOT COMPARABLE | Fixed | The CLI and HTML share `reportWarnings()`: a comparable composition disclosure says DISCLOSURE; a genuinely incomparable grade says NOT COMPARABLE. |
| F11 — B tier shown beside rounded 58 score | Fixed | Visible comparison scores and consensus tooltips use the original contributor mean, e.g. 57.5. Stored scores, sorting, tiers, forecasts, and movement are unchanged. Browser regression checks the fractional boundary. |
| F12 — mobile loot sources overflow | Fixed | Each wide loot-source table scrolls within its container. Chromium tests open all five disclosures at 320px and 390px. The existing CI browser job now runs these gearing checks alongside tracker checks. |
| F13 — keyboard sort loses focus | Fixed | After a header sort rerenders the grid, focus returns to the replacement header. Enter/Space checks also verify that sorting from the dropdown preserves dropdown focus. |

## Verification

- Both production builders passed: `npm run gearing:build` and `npm run build`. Generated files were rebuilt from their templates.
- Final `npm run test:quiet` passed **404 tests, zero failures, one expected skip**, in 26.5 seconds after both production builds. The skip is an existing frozen-source assertion whose premise no longer applies to the current season; browser invariants ran.
- Browser invariants actually executed, including hostile-data/CSP checks, tracker interactions, sort focus, fractional scores, report navigation, and gearing phone disclosures.
- Manual report checks at 320px, 390px, and 1440px: HTTP 200 through the real preview route, no page errors, no page-level horizontal overflow, no scripts, and zero external requests. Its wide tables scroll locally; both provenance disclosures remain readable.
- The current +14 report grades **80/80 cells**, **33 exact (41%)**, and **71 within one band (89%)**, using the September 1 outcome. The +28 checkpoint requires a snapshot on or after September 15 and remains pending. These measure agreement with publisher consensus; they do not certify objective game performance or publisher freshness.
- Fresh independent pre-patch and post-patch security reviews examined F1's admission/read/staging boundary. The post-patch review found no reachable shell-execution bypass; its staged-then-deleted path observation was addressed with indexed-path admission and a regression.
- `git diff --check` passed. `git diff -- data gearing/data` is empty. No real guide harvest, secret access, exploit against Actions, or deployment was performed.

Security disposition: **fixed in local code, not yet deployed**. Literal filenames no longer enter a shell, unauthorized artifact paths are refused, and legitimate content-only updates retain their warning-only churn policy. Tests use isolated local Git repositories; they do not emulate a full GitHub artifact-service round trip or every Linux filename encoding.

## Decisions and recommendations

### 1. Archon during the access outage

**Choose:** retain its last verified Season-2 letters with explicit age disclosure, or exclude them after a defined expiry.

**Recommendation: retain dated observations during this outage and make the contract/UI explanation explicit.** The current runtime already does this. Removing the source changed 24 of 80 letters in the audit's controlled comparison, so automatic removal would publish a large source-composition change without new spec evidence. The tradeoff is continuing to use older opinions. If expiry is preferred, specify the threshold and apply the existing consensus-version/movement safeguards; do not implement an isolated Archon switch.

After the choice, update the false three-source claim in `data/required-sources.json` and align visible stale-source explanation. Source dates and freshness alarms should stay honest in either policy. No access-check bypass or substitute data under Archon's name is proposed.

### 2. The overdue gearing-spec maintenance job

**Choose:** split structural capability upkeep from the legacy stat fallback, or rebuild the old fallback harvester for Season 2.

**Recommendation: split the job and retire live harvesting of the 12.0.7 fallback.** `gearing/src/harvest-specs.mjs` still requires patch 12.0.7 and reviewed baseline/override ledgers from that patch. Its current patch guard is correctly refusing drift. The active guide layer already covers all 40 specs with Season-2 guide ranking data. Keep legacy fallback evidence dated, sync class/spec/role/tier-set structure from the tracker and reviewed capability provenance, and record structural verification separately. This is a bounded follow-up to the data contract, rather than changing a patch constant or stamping today's date on old facts.

This choice is why the gearing-spec freshness condition was not silenced by this repair. The existing Archon/WCL upstream freshness conditions also remain visible.

### 3. Repository secret protection

**Choose:** enable repository secret-scanning alerts and push protection, or retain the present settings.

**Recommendation: enable both.** Push protection can reject pushes containing supported secret patterns, and a deliberate bypass creates an alert. This is an administrative setting change, with occasional false-positive handling as the tradeoff; it is separate from the source-code fix for F1. Public-repository background scanning and repository alert/push-protection settings are distinct. [GitHub's settings guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository), [push-protection behavior](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/prevent-future-leaks/enable-push-protection).

### 4. Branch protection and the nightly publishing route

**Choose:** add branch protections with an automation-compatible release route, or continue direct pushes with the current in-workflow gates.

**Recommendation: block force-push/deletion first; introduce required PR checks only with a concrete nightly route that can satisfy them.** A blanket PR/check rule can stop the existing direct-push nightly. Full protection needs either a narrowly authorized publishing app or a nightly PR/check/merge flow, which changes credentials or operating behavior. Do not require owner self-approval in this single-owner repository. The existing owner decision to run browser CI after nightly publication remains unchanged; this patch simply adds gearing coverage to that same job. [GitHub's branch-rule behavior](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

### Work that can wait

Payload slimming remains optional. The audit measured the calculation core at about 8ms median; the larger opportunity is reducing duplicate browser payload while preserving provenance and offline behavior. Recommendation: defer a framework migration and broad refactor. Neither is needed to ship these repairs.

## Release handoff

All changes are local and reviewable. No repository settings changed. Publishing should include the workflow helper/tests, the CI browser-command update, both template builds, and the generated report page. After publication, verify Tests and Pages against the exact released SHA and verify the first nightly reaches the new admission and acknowledgement gates. Local tests cannot establish that an unpublished workflow is deployed.
