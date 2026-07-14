# External security audit (2026-07) — disposition

An outside audit of all riles22 repos (received 2026-07-14) flagged this project's
nightly automation and several data-integrity gaps. This file maps each
wow-class-tracker finding to what was changed in the repo, what risk remains, and what
only the repo owner can do. The remediation landed on branch
`claude/security-audit-findings-8qems1`.

## Findings → disposition

### 1. Untrusted content, secrets, and write access shared one AI process — **largely addressed, residual documented**

The audit's top finding: the nightly agent fetched untrusted web content while holding
a `contents: write` + `actions: write` token and pushing straight to master.

Done (`.github/workflows/nightly.yml`):
- Split into two jobs. The **refresh** (agent) job token is now `contents: read` only —
  it cannot push, cannot dispatch workflows, and checkout credentials are not persisted
  (`persist-credentials: false`), so prompt-injected content has no ambient write path.
- The **publish** job is deterministic (no AI, no untrusted fetches): it downloads the
  agent's `data/` + skill logs as an artifact, runs the gates (tests → build →
  `src/check-refresh.mjs --manifest`), snapshots, stages explicit paths only, commits,
  pushes, dispatches deploy. A gate failure publishes nothing.
- `dist/` is deliberately **not** transferred between jobs — publish rebuilds it from
  source, so a tampered build artifact can't ride along.
- The commit title comes from the agent-written manifest summary but is sanitized to one
  printable-ASCII line and length-capped in the publish job.
- `anthropics/claude-code-action` pinned to the v1 commit SHA (was a mutable tag);
  Dependabot proposes reviewed bumps.

Residual, by design (revisit if the threat model changes):
- **WCL API credentials and the Claude OAuth token remain in the agent job's env.** The
  OAuth token is inherent (it *is* the agent's auth). Removing the WCL creds requires
  rewriting the WCL ingestion as a deterministic pre-fetch stage that runs before the
  agent — the audit's "stage 1". Worth doing if/when the WCL v2 GraphQL queries are
  stable enough to freeze into a script; tracked as the main follow-up. Exposure today:
  a free-tier API client (rate-limited, revocable, no PII).
- `--permission-mode bypassPermissions` stays: the run is headless (nobody to answer
  prompts), and the meaningful boundary is now credential scope rather than tool
  prompts. A deny-list would be theater against injection; the read-only token is not.

### 2. Prose workflow contract wasn't followed (quiet skips) — **addressed**

The 2026-07-12 run skipped SimC, Archon encounter/survivability pages, and left all WCL
cuts at 07-09 — and still went green. Now:

- `data/required-sources.json` — machine-readable contract: 18 required sources with
  staleness thresholds and row-count floors (floors set ~60–65% of real 2026-07-14
  counts).
- `data/run-manifest.json` — written by the agent **every** run, one honest row per
  requirement. The seed manifest reconstructs the 07-12 run, including its drift.
- `src/check-refresh.mjs --manifest` fails the publish on: a missing row, an
  **unexplained** skip, a `success` claim the stored snapshot/asOf dates contradict
  (the anti-drift teeth), or a row-count floor breach. Explained unavailability
  (unreachable/blocked/partial/parse_error + reason) degrades but publishes.
- A mass tier-movement anomaly gate (>6 moves of ≥2 bands, or >25 total, vs the latest
  history snapshot) blocks the parse-bug shape (the 07-09 Method incident); a real
  Blizzard mass retune passes only via an explicit, cited `anomalyAck` that lands in
  the run report.

### 3. WCL data stale-by-design on GitHub runners — **alerting addressed; runner choice is the owner's**

- Staleness is now measured and alerted (10-day threshold on every WCL cut) instead of
  silent: the heartbeat files/updates an issue and goes red — the audit's "open an
  automated issue when WCL remains unavailable for multiple runs".
- The manifest (committed nightly) is the current/stale/unavailable status surface;
  drawers already carry per-metric asOf dates.
- **Owner option, not doable from the repo:** a self-hosted runner on the residential
  connection for WCL acquisition, or keep the manual local catch-up runs. If a
  self-hosted runner is added, keep it for the *fetch* stage only.

### 4. Direct AI commits to production — **push removed from the agent; PR flow deliberately not adopted**

The agent can no longer commit or push anything. Publication is deterministic and gated
(tests, build, manifest contract, anomaly limits), which implements the audit's
"auto-merge low-risk data-only changes that pass strict anomaly gates" compromise —
risky shapes (mass movement, floor breaches, dishonest rows) now fail red for human
attention instead of publishing. A full PR-per-night flow was considered and not
adopted: with no reviewer at 3:37am it would either stall the site daily or be
auto-merged (equivalent to this, with more moving parts). Revisit post-12.1-launch.

### 5. Latest-package install during a privileged run — **addressed**

`yt-dlp` is pinned in `requirements.txt` (2026.7.4) and installed by the workflow
*before* the agent runs; the prompt forbids the agent from installing/upgrading
anything. Dependabot (pip ecosystem) proposes weekly tested bumps.

### 6. Freshness & heartbeat monitoring — **addressed**

`.github/workflows/freshness.yml` runs daily at 17:23 UTC: red run + alert issue when
the last refresh signal (manifest run date or newest history snapshot — so local
refreshes count) exceeds 36h, or any required source exceeds its max age. Note: the
2026-07-13 and 07-14 nightlies did not run as of this remediation — expect the first
heartbeat to go red honestly.

### 7. Validation improvements — **addressed**

`src/validate.mjs` now also rejects: duplicate source ids; duplicate class entries,
per-class creators, and general creators in community.json; impossible calendar dates
(e.g. `2026-99-99`); and future-dated values beyond a 1-day clock-skew allowance.
Required-source completeness, staleness thresholds, and suspicious row-count/tier-move
changes are enforced by `check-refresh.mjs` (see #2). Tests cover all of it
(`test/validate.test.mjs`, `test/check-refresh.test.mjs`).

### 8. Projection versioning & report card — **versioning done; report card is post-launch work**

`PROJECTION_VERSION` (render.mjs) is stamped into the payload meta and every history
snapshot, so the frozen pre-launch forecasts are gradeable against the formula that
produced them. The report card itself (grade projections vs first settled S2 consensus)
happens after 12.1 goes live, as CLAUDE.md already plans.

### 9. Documentation & maintenance — **addressed**

README now says Node 20+ (matching `package.json` engines); MIT `LICENSE` added with a
README note that the aggregated data stays the publishers'; `.github/dependabot.yml`
covers github-actions + pip.

## Shakeout results (2026-07-14, first supervised run of the new pipeline)

The architecture verified end to end on a manual dispatch: the de-privileged agent job
ran clean under `contents: read` (pinned action, pinned yt-dlp, artifact handoff), and
the publish job's three gates, no-op commit logic, and conditional deploy all behaved.
The run also exposed one behavioral hole: the agent found the seed manifest already
dated "today", treated it as proof the run had happened, and no-opped in under four
minutes — inheriting the standing "skipped" explanations without attempting the work.
Fixed the same day: the prompt now states the committed manifest is the *previous*
run's record and must be rebuilt from each run's own outcomes (with a fresh
`startedAt`), and the publish gate hard-fails if `data/run-manifest.json` is unchanged
from the committed copy. Run history from the same investigation: the old architecture
went green on 07-10, 07-11, and 07-13 while committing nothing — the manifest
requirement now makes a verifiable no-op impossible.

## Owner actions (not possible from repo files)

1. **Branch protection on master** — require the `Tests` check. Note the nightly
   publish job pushes to master with `GITHUB_TOKEN`; if you require PRs, the nightly
   needs a bypass allowance or a switch to PR+auto-merge.
2. **Secret scanning + push protection** — Settings → Code security and analysis.
3. **Actions default permissions** — set default workflow permissions to read-only
   (workflows here request write explicitly per job, so nothing breaks).
4. **CLAUDE_CODE_OAUTH_TOKEN renewal** — ~1-year validity; set a calendar reminder.
   GitHub can't see its expiry to warn you.
5. **Optional:** self-hosted runner (residential IP) for the WCL fetch stage (see #3).

## Explicitly out of scope here

Findings for ffplayoffpredictor, SpotifyCollabList, Skill-Issue-Bot, and RilesAIO —
different repos, not reachable from this session.
