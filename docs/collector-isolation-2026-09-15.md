# Collector isolation and receipt authentication — September 15, 2026

## Boundary

The nightly now uses three separate jobs/runners:

1. **collect** runs only deterministic source collectors. Provider credentials,
   caption request reservations, encrypted caption cache, and durable-state signing
   stay here. Source-unavailable outcomes remain ordinary recorded degradations.
2. **refresh** receives verified collector inputs, then runs primary/recovery agents.
   Its GitHub token is read-only and checkout credentials are not persisted. Its
   code, files, logs, and completion-check results are treated as untrusted outputs.
3. **publish** starts from trusted current master, checks the immutable refresh base,
   overlays the allowed agent data/logs, independently authenticates collector
   receipts, and reruns all existing gates before publishing explicit paths.

Uploading an artifact earlier on the same agent runner did not provide independent
provenance. An agent could alter later cached action execution; artifact APIs use
runtime credentials separate from `GITHUB_TOKEN`. Artifact names also are not
immutable identities. No such replacement was observed or attempted during audit.

Untrusted `nightly-refresh` output downloads to a temporary directory, never over
the publisher checkout. `src/install-refresh-output.mjs` admits only HEAD-tracked
data and skill-log paths, verifies regular files and bounded sizes, and refuses
missing or additional files before any copy. All agent-supplied history is ignored;
the publisher derives its own snapshots. This prevents a forged upload from
replacing the trusted gate scripts, Git metadata or workflow configuration.

## Exact collector bundle

The collector uploads `collector-receipts-<run-attempt>`. Its trusted job outputs
contain the artifact ID, archive digest, and SHA-256 of `collector-manifest.json`.
Neither the refresh artifact nor a name search chooses those values.

Each consumer downloads the exact ID into its runner's temporary directory.
`src/collector-receipts.mjs` checks the artifact ID/name, GitHub archive digest,
producer run/commit, manifest digest, repository/run/attempt/commit binding, all file
hashes/sizes, and an exact fixed inventory. Additional, missing, substituted,
nonregular and traversal paths fail before installation. The publisher's own check
uses trusted checkout code after the untrusted overlay. Its installation copies
only receipt directories; agent-edited canonical specs remain subject to the
existing exact-value/failed-source checks.

WCL collection previously merged verified measurements before agent execution.
That behavior is preserved: the collector's resulting specs and coverage are
included in the bundle and installed on the agent runner. The publisher does not
use that initial specs copy to erase later authorized agent work.

Individual named provider artifacts remain available for diagnostics, and can be
replaced by a full rerun on the trusted collector. They do not establish publication
trust. A missing/deleted bound bundle is an error, never a reason to accept a
same-name replacement or an older artifact.

## Caption privacy and state authority

Two distinct independent random 32-byte hexadecimal secrets are required:

- `TRANSCRIPT_HANDOFF_KEY`: encrypts only the cross-job caption bundle. It is present
  in collector packing and deterministic agent hydration steps. It confers no
  provider API access or durable-state authority.
- `TRANSCRIPT_STATE_SIGNING_KEY`: authenticates durable transcript state bytes and
  their repository/workflow/run/attempt/phase. It is available only on the collector
  runner, never in the agent job or its input bundle.

Collector preflight validates these keys before provider requests. Generate them
independently and install them through the repository's secret controls. Never
print them or reuse a provider API credential as either key.

Captions transfer with AES-256-GCM authenticated encryption, bound to the exact
producer context and retained in the collector artifact for seven days. Decryption
runs before the agent and uses only the handoff key, without another provider call.
No plaintext per-video transcript files, persistent cache, provider key, or state
signing key enters the collector handoff bundle. The metered `TRANSCRIPT_API_KEY`
is used only by trusted collection and explicitly reviewed cache reconciliation.

Reservations and completed state retain the existing 90-day artifact lifetime.
Their `authentication.json` must verify before restore or reconciliation can affect
request decisions. Verification also checks GitHub metadata for the exact artifact
and the signed run attempt: creation must fall within that attempt's completed
`collect` job. An agent upload begins only afterward, so replaying an older correctly
signed state in a new artifact fails this producer-window check. Verification uses
a read-only GitHub token and never makes provider requests. An untrusted job in the same workflow cannot forge a new valid
state signature. Migration accepts only the verifier's exact reviewed legacy
artifact IDs plus state hashes; it provides no generic unsigned fallback.

## Failure and rerun behavior

- A source refusal/partial collection still writes evidence and can reach publication
  under the unchanged honesty and completeness gates. Dates are not advanced merely
  because collection was attempted.
- Collector infrastructure, key, state-authentication or bundle-integrity failure
  stops dependent jobs. Reservations uploaded before an interrupted request remain
  available and conservatively accounted for.
- A failed agent can still reach the independent publisher gates if the collector
  succeeded, preserving the prior recovery/publish policy.
- **Rerun all jobs** after a failure. Reusing an earlier-attempt collector bundle
  with later-attempt consumers deliberately fails provenance validation. The bundle
  name includes the attempt, while diagnostic artifact names may be overwritten
  only by trusted collection.
- Manual publication races still fail stale-base or rejected-push checks. There is
  no automatic rebase, force push, or bypass of the existing anomaly/value approvals.

## Validation and release boundary

Local adversarial tests cover substituted files/manifests, IDs/digests/producers,
wrong-run/attempt reuse, traversal/additional files, junctions, bad encryption keys,
and preservation of degraded receipts and agent canonical edits. Workflow tests
assert job and credential separation, exact output binding, receipt checks after
overlay, and authenticated state ordering before reservations/provider requests.

Independent review of the collector bundle, secret boundaries and untrusted overlay
found no blocker; the 18 collector/overlay/workflow tests passed independently.
The state-authentication helper has its own review and tests.

Hosted validation subsequently passed in
[run 34990700222](https://github.com/riles22/wow-class-tracker/actions/runs/34990700222):
all three jobs succeeded, the publisher admitted 23 allowed data/log files and
authenticated all 12 collector files, and the exact resulting commit was deployed.
The collector also authenticated a prior run's signed transcript state and repaired
one proven historical completion with zero new transcript requests. See the
[priority-fix closeout and linked receipts](audit-priority-fixes-2026-09-15.md).

These receipts establish the observed execution and state transitions; they do not
independently establish provider account billing. No exploit is needed to validate
the intended fail-closed substitutions.
