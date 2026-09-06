# Transcript collection and recovery

The nightly keeps Supadata's native YouTube-caption endpoint and the existing
25-request run limit. Each request, including its response body, has a 45-second
deadline; collection stops after six minutes. There are no immediate request
retries. Agents still receive timestamped `transcript-fetch/<videoId>.json` files
and maintain `data/pending-transcripts.json` after distillation or verified skips.

## Persistent state

Before collection, the workflow restores the newest `transcript-state-reserved`
or `transcript-state-complete` artifact from the master nightly workflow. The
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
fetch step has that key. The reservation step uses cache metadata; the fetch step
decrypts captions for the agents. This avoids publishing full transcripts in
public-repository artifacts. Cached captions retain their original fetch dates
and are removed from state once the video leaves the queue.

An unchanged queue after a failed publication reuses cached captions without
another provider request. Key rotation or corrupted encrypted content reports a
review hold; it never silently purchases a replacement transcript.

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
