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
- ~~**WCL API credentials and the Claude OAuth token remain in the agent job's env.**~~
  **Closed by the 2026-07-14 re-audit remediation** (see the re-audit section below):
  the WCL credentials now live only in a deterministic pre-agent step
  (`src/fetch-wcl.mjs`), step-scoped and gone before the agent starts. The Claude
  OAuth token remains in the agent step — inherent (it *is* the agent's auth).
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

### 3. WCL data stale-by-design on GitHub runners — **alerting addressed; root cause pinned; runner choice is the owner's**

- Staleness is now measured and alerted (10-day threshold on every WCL cut) instead of
  silent: the heartbeat files/updates an issue and goes red — the audit's "open an
  automated issue when WCL remains unavailable for multiple runs".
- The manifest (committed nightly) is the current/stale/unavailable status surface;
  drawers already carry per-metric asOf dates.
- **Root cause resolved to a precise upstream bug (2026-07-14):** Cloudflare transport
  from datacenter runners is SOLVED (header recipe in the refresh-metrics skill), and
  the remaining blocker is WCL-side — the v2 API's `characterRankings` 500s on the
  whole rDPS metric family (`rdps`/`ndps`/`cdps`/`bossrdps`) on every encounter while
  `dps`/`hps`/`default` work; `default` was probe-verified to be plain dps, so no honest
  workaround exists. A dispatch-only diagnostic (`.github/workflows/wcl-probe.yml` →
  `src/wcl-probe.mjs`) re-checks in ~20s. **Owner option:** report the repro to WCL
  (any v2 client-credentials query with `metric: rdps` → "Internal server error").
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

## Re-audit disposition (2026-07-14, second external audit — verified before applying)

The outside auditor re-reviewed all repos the same day and rated this one A−/B+. Every
wow-class-tracker claim was independently verified against the code before acting —
all of them held up (its "genuinely fixed" list matched the workflows/gates exactly;
its current-WCL-state description matched the committed manifest). Findings →
disposition:

### High: AI still holds secrets while consuming untrusted content — **fixed**
The WCL credentials are no longer in the agent's environment. A deterministic step
(`src/fetch-wcl.mjs`) runs FIRST with `WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` scoped to
that step alone, performs the standing per-run WCL protocol (one cheap `rdps` check —
the entire rDPS family still 500s upstream, so nothing can honestly land anyway), and
writes `wcl-fetch/evidence.json` — the agent's ONLY WCL input. When WCL fixes the
rDPS family, the median recipe gets frozen into that script (zone 52 first), never
into the agent. Remaining in the agent step: `CLAUDE_CODE_OAUTH_TOKEN` only
(inherent — it is the agent's auth), exactly as the re-audit concedes.

### High: anomalyAck controlled by the same AI being gated — **fixed**
`checkAnomaly`'s ack now reaches the gate ONLY via the `anomaly_ack`
workflow_dispatch input (→ `ANOMALY_ACK` env on the publish job's Gate 3) or a local
`--ack=` flag — i.e. a human. Scheduled runs can never carry one. The agent may write
`anomalyAckProposal` (reason + citation) into the manifest; the gate prints it as
evidence for the reviewing human and it satisfies nothing.

### High/medium: "success" does not prove a source was fetched this run — **fixed for WCL, tightened elsewhere, residual documented**
- WCL rows are cross-checked against the fetch evidence, which is uploaded as its own
  artifact BEFORE the agent runs (`wcl-evidence`) — the publish gate reads that copy,
  so the agent has no tamper window. `success` on a WCL row requires
  `evidence.landed[key].rows > 0`; today that is impossible by construction, which is
  honest (nothing lands while rDPS is broken).
- `startedAt` is now required and validated (full ISO instant, must belong to the
  run); future-dated `run` values are rejected; `data/history/` snapshots are
  validated (a planted future-dated snapshot could otherwise silence the heartbeat
  forever and corrupt movement baselines — found during this remediation's own sweep).
- Residual, accepted: for the AI-scraped web sources (tier pages etc.) there is no
  deterministic fetch layer to generate content hashes — building one would mean
  rewriting the scraping deterministically, which is exactly what the AI distillation
  stage exists to avoid. Those sources keep the date/row/anomaly/row-drop teeth.

### Medium: one fresh metric can mask a mostly stale source — **fixed**
Metric-family date probes (`metrics`, `ptrDummy`) now return a COVERAGE date — the
min-th-freshest row's `asOf` (min = `date.minFresh`, else `rows.min`, else 1) — in
both the publish gate's success teeth and the heartbeat's staleness math. A single
fresh row no longer vouches for a cut whose other role cuts stayed old.

### Medium: row floors permit substantial silent loss — **fixed**
`checkRowDrop` compares every requirement's row count against the last committed
state (`git show HEAD:` — by construction a gate-passing state) and fails the publish
on a >`maxRowDropPct` (25%) shrink, even when still above the absolute floor.

### Medium: freshness uses dates rather than startedAt — **fixed**
The heartbeat parses `manifest.startedAt` as a real instant (36h now means 36h); the
date-only `run` value is strictly the legacy fallback for the same event, and history
snapshots stay date-grained (aging a bare date against a real clock would over-age a
same-day local snapshot into a false alert).

### Medium: WCL probe joins characters only by name — **fixed; conclusion re-checkable**
`wcl-probe.mjs` now joins by region+server+name, EXCLUDES keys that still collide
(counted, never guessed), compares pages 1–2, and imports its transport from
`fetch-wcl.mjs` so the recipe lives once. Note: the original "default == plain dps"
conclusion is expected to survive — a name-collision artifact biases toward
*differing* amounts, not identical ones — but the next dispatch of the probe workflow
re-verifies it under the fixed join.

### Additional suggestions — adopted / declined
- Heartbeat issue lifecycle — **adopted**: auto-close on recovery, body refreshed
  daily while stale, comment only when the violating set changes (fingerprint line
  from `check-refresh --age`). Also fixed a latent first-alert bug: `--jq
  '.[0].number'` prints literal `null` on an empty list, so the create-issue branch
  could never run; now `// empty`.
- Fetch evidence retained even on failed publication — **adopted** (the
  `wcl-evidence` artifact uploads before the agent, retention 7 days, regardless of
  publish outcome).
- Manual review for new source domains / creator authority — **already largely
  enforced in validation** (https-only, citation-host allowlist, creator-scope and
  generalCreators firewalls); a formal review process for config changes is an owner
  process choice, see owner actions.
- Commit signing / artifact attestation — **not adopted**: `GITHUB_TOKEN` pushes are
  already attributable to the workflow, the publish job is deterministic from gated
  inputs, and Pages redeploys rebuild from source; attestation adds moving parts
  without changing what an attacker able to defeat the gates could do. Revisit if the
  site ever gains consumers who need provenance.

### Re-audit points that were already true (no change needed)
- "The current manifest is now honest [about WCL]" — matches the committed manifest.
- "The unchanged-manifest check prevents exact reuse" — and the new
  startedAt/coverage/evidence teeth close the cheap ways around it.

## Reconciliation with the parallel agent PRs (2026-07-17)

While the re-audit remediation sat unmerged on its branch, a separate agent session
(under the owner's account) merged PRs #11–#14 to master: a provenance gate
(`check-manifest-provenance.mjs`), a primary+recovery two-agent nightly, a
`dispatch-nightly.yml` auto-trigger, CI build steps, a community-overrides registry —
and the MadSkillzzTV creator addition bundled into #11. Reconciled as follows:

- **Kept**: the primary+recovery agent structure, the final deterministic completion
  gate, `dispatch-nightly.yml` + `allowed_bots`, the CI build step, the
  community-overrides mechanism (it feeds `community.json` through full validation
  via npm pre-hooks — not a bypass).
- **Folded into `check-refresh.mjs`** (one gate, one file): rejecting any
  agent-written `anomalyAck` outright, requiring `previousAsOf`/`newAsOf` on every
  row, the no-regression rule, and a fresh-`startedAt` window (12h).
- **Removed**: `check-manifest-provenance.mjs` + its tests. Two defects: exact
  equality between agent-written `previousAsOf`/`newAsOf` and recomputed probe dates
  (an agent must reimplement probe semantics perfectly to pass — none of four runs
  did), and `test/nightly-provenance-gate.test.mjs`, a publish-job-only test
  asserting the OVERLAID manifest passes with a 3-hour startedAt window — a time
  bomb that misdirected every failure into "Gate 1: unit tests" whenever the refresh
  job had already failed. The kept substantive teeth (coverage dates, WCL evidence,
  row floors, row-drop, anomaly limits) police the same risks deterministically.
- **Flagged for the owner**: PRs #11–#14 merged without review, and #11 bundled new
  creator authority (MadSkillzzTV, scoped to six healer specs) into a
  security-sounding PR — exactly the shape this audit says needs human sign-off.
  The entry was kept (it was authored under the owner's account and validates
  cleanly) — and the owner confirmed on 2026-07-17 that the MadSkillzzTV addition
  was intended. The review-before-new-creator-authority rule stands for next time.

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
