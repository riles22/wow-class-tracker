# Transcript collection and recovery

The nightly keeps Supadata's native YouTube-caption endpoint and the existing
25-request run limit. Each request, including its response body, has a 45-second
deadline; collection stops after six minutes. There are no immediate request
retries. Agents still receive timestamped `transcript-fetch/<videoId>.json` files
and maintain `data/pending-transcripts.json` after distillation or verified skips.

## Persistent state

Before collection, the trusted collector job restores the newest `transcript-state-reserved`
or `transcript-state-complete` artifact from the master nightly workflow, ordered by
creation time across every artifact-list page. Numeric IDs are not chronological.
For uploads in the same second of one run, completed state supersedes reservation;
ambiguous ordering across runs stops collection. The
workflow conclusion does not matter: a failed publication still consumed any
requests already made. Lookup, expired-artifact, download, and state-validation
failures stop collection instead of silently resetting usage.

The prepare step reserves its selected batch in `transcript-fetch/state.json`.
That reservation is uploaded **before** the API-key step runs. The completed state
is uploaded immediately afterward, before either agent starts. A cancelled runner
therefore leaves a durable reservation even if its final upload never happens.
Unresolved reservations count conservatively as possible consumption and their
videos wait for review. A completed process releases reservations it knows were
never sent, including every reservation when the API key is absent.

State artifacts retain 90 days and contain only `state.json`, `plan.json`, and
optionally `summary.json`. **Never upload the plaintext `<videoId>.json` files.**
The state caches successful captions using AES-256-GCM, with a key derived by
HKDF from the step-scoped transcript API key and a fresh random salt. Only the
fetch step and optional authenticated-reconciliation step have that key. The reservation step uses cache metadata; the fetch step
decrypts captions in the collector job. A separate `TRANSCRIPT_HANDOFF_KEY` encrypts
the short-lived caption handoff to the agent job, which never receives the metered
API key. This avoids publishing full transcripts in
public-repository artifacts. Cached captions retain their original fetch dates
and are removed from state once the video leaves the queue.

An unchanged queue after a failed publication reuses cached captions without
another provider request. Key rotation or corrupted encrypted content reports a
review hold; it never silently purchases a replacement transcript.

State uploads also include `authentication.json`, signed using the collector-only
`TRANSCRIPT_STATE_SIGNING_KEY`. Verification binds the exact state bytes to the
repository, workflow, run, attempt and reserved/completed phase before the restored
state can be used. Agent jobs never receive that signing key. Migration accepts
only the two explicitly reviewed historical artifact IDs and exact state hashes
listed in `src/transcript-state-auth.mjs`; there is no general unsigned fallback.

### Reconcile an already completed request

Use the manual nightly input `transcript_reconcile_artifact_id` with the exact
completed receipt ID. The collector checks provenance and state authentication,
then matches video ID, originating run/attempt and reservation timestamp. Only a
successful receipt with an authenticated encrypted caption can resolve that
existing request. This performs no provider call, preserves request counts and
unrelated reservations, and never clears a later unresolved attempt. Replaying
the receipt is idempotent. The resulting state records the receipt ID and resolved
attempts for audit. Normal queue processing may discard a recovered cache after
the video has already left the queue.

For the September 15 repair, artifact `10298937863` from run `34697196941` proves
video `rYFv6Ohr7mE` completed with 303 chunks. The repair resolves the false hold
carried forward by the previous numeric-ID selection bug; it does not approve a
new request. This differs from `transcript_retry_ids`, which explicitly approves
a potentially chargeable retry after review.

## Usage and retry policy

`summary.json` reports requests sent this run, captions newly fetched, captions
reused, per-video outcomes, cooldown dates, and a rolling 30-day request count.
The ledger retains 90 days of attempts. Every request sent, plus unresolved
reservations, counts conservatively. This measures this collector's activity
since initialization; it is **not** the provider's billing ledger and excludes
prior usage or other applications sharing the account.

The optional Actions variable `TRANSCRIPT_REQUEST_BUDGET` sets an integer request
allowance for a rolling 30 days. An unset variable records usage without imposing
an invented monthly plan limit. `0` pauses new requests while retaining cached
captions. The per-run cap remains 25 regardless of the optional allowance. Do not
infer a subscription or quota from old documentation about a free plan.

| Outcome | Next action |
| --- | --- |
| Unavailable captions / HTTP404 | Retry after 1, 2, 4, then 7 days on successive failures. |
| HTTP402/429, unauthorized, or blocked403 | Stop the batch; provider-wide cooldown of at least 24 hours, respecting a longer `Retry-After`. |
| Timeout, transport failure, server error, empty payload, unexpected async job | Hold the video for review because the provider may already have consumed the request. |
| Cancelled run with an unfinished reservation | Hold unresolved videos for review; retain their possible consumption. |
| Successful captions still queued | Reuse the encrypted cache; send no new request. |

## First installation and reviewed recovery

The first manual nightly dispatch sets `transcript_state_initialize=true`. Its
default is false. Initialization is allowed only when both state-artifact
listings are successfully read and empty. Subsequent runs restore existing state
even if initialization was requested. An empty history later also needs explicit
review; automatic initialization cannot distinguish a new installation from
deleted operational history.

For a `review-required` video, inspect `summary.json`'s `retry` entry and the
provider's request history. Prefer recovering the existing response/cache or
restoring the previous API key. If a new request is justified, manually dispatch
with `transcript_retry_ids` containing only the reviewed video IDs, separated by
commas. This accepts possible duplicate consumption for those IDs. The prepare
step records `reviewedAt`, preserves all earlier usage, and rejects IDs that are
not queued and currently held for review. A reviewed retry remains subject to the
run limit, configured allowance, and provider cooldown.

Ordinary local catch-up continues using the documented residential transcript
lane. Do not start a separate Supadata ledger against the same key: download the
latest trusted state first, preserve its usage, and serialize requests with the
nightly. Direct `node src/fetch-transcripts.mjs` uses the existing local state and
runs both phases with atomic filesystem persistence; `--initialize` is reserved
for an explicitly reviewed first installation. GitHub uses separate `--prepare`
and `--fetch` invocations so the reservation can be uploaded between them. Local
collection does not automatically upload its state back to GitHub, so normal
API-backed collection belongs in the nightly workflow.
