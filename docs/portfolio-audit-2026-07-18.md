# Disposition: external portfolio audit (2026-07-18) — wow-class-tracker section

Verified 2026-07-19 against the live repo, the GitHub API, and a worktree at the
audit-date commit. Scope here is this repo only; the audit's other four repos are out of
scope for this document. Fixes landed on `claude/audit-review-updates-sqe7m2`.

## Claim-by-claim verification

| Audit claim | Verdict | What we found |
|---|---|---|
| `npm test` 97/97 | **Correct (then)** | 97/97 at the 2026-07-18 nightly commit (943d509). HEAD is 103/103 — the digest feature added tests on 07-19. |
| Build produces a self-contained ~599 KB artifact | **Correct (then)** | 613,385 bytes (599.0 KiB) at 943d509; 607.1 KiB now. |
| No runtime npm dependencies | **Correct** | package.json has no dependencies field at all — not even devDependencies. |
| Validation/CSP/freshness/anomaly/evidence/revalidation stack exists | **Correct** | All six sub-claims verified in code (CSP with per-build inline-script hashes lives in `src/build.mjs`; revalidation actually runs **twice** — refresh-job completion gate + publish gates). |
| AI step doesn't receive WCL/transcript secrets | **Correct** | Step-scoped envs; agent jobs hold only `CLAUDE_CODE_OAUTH_TOKEN` on a `contents: read` token, `persist-credentials: false`. |
| 85 commits July 4–18; "repeated nightly/recovery activity" | **Overstated** | 81 commits, and 66 of them are the owner's own development work (heavy feature period). Nightly automation is one publish commit per successful night by design. |
| "Aim for one canonical nightly commit per day and skip no-op publication" | **Already true / by design** | One commit per night already. Manifest-only nights skip the Pages deploy (`deploy=false`) but still commit — the manifest rewrite **is** the freshness heartbeat's proof of life (`startedAt` ≤36 h or red). Skipping it would starve the heartbeat. |
| All 5 Dependabot PRs non-mergeable | **Wrong** | Live API check: every one of #2–#6 is `mergeable_state: clean`. Most plausibly the auditor read GitHub's transient `unknown`/`mergeable: null` (lazy mergeability computation) as "conflicted". They *were* pairwise-overlapping, which is the real reason to consolidate. |
| No open issues | **Correct (then)** | The one open issue (#15, nightly digest thread) was created 07-19 by design. |
| Structural validity ≠ factual validity; registries need harder boundaries | **Substantially correct — the sharpest finding** | See below. The audit's abstract concern maps to concrete holes we confirmed and closed. |
| "Flag disagreement between sources instead of forcing one value" | **Already implemented** | Per-source ratings are never collapsed in data; consensus is a derived view with an explicit `diverges` flag (spread ≥ `spreadThreshold`) surfaced in the UI. Metrics are never merged across sources or converted to tiers. |
| "Preserve raw evidence + stable source hash per claim" | **Correct — mostly missing** | URL+date provenance is mandatory everywhere, but no raw fetched content or content hash survives (WCL evidence.json is a 7-day artifact; already the documented accepted residual in `security-audit-2026-07.md`). Deferred — see below. |
| Untrack `dist/index.html` | **Declined** | See below. |
| Google-Fonts self-hosting note | **Correct** | fonts.googleapis.com/gstatic is the page's *only* externally loaded resource, and the CSP already pins exactly that. Low priority, agreed. |
| Season-2 freeze + report card | **Already planned** | Enriched history snapshots (2026-07-09) exist specifically as the raw data for the post-launch report card. Revisit at S2 launch. |

## Registry-boundary findings (audit's central point, made concrete)

The audit was right that deterministic gates proved *shape*, not *authority* — and the
verification pass found the specific holes:

1. **The gate read its own contract from the agent's tree.** `check-refresh --manifest`
   ran in publish against the artifact-overlaid working copy, so an agent could rewrite
   `data/required-sources.json` thresholds (row floors, staleness, anomaly limits) in the
   same run they'd excuse. Same exposure for `data/scales.json` (normalization values)
   and registry membership in `sources.json`/`community.json` (adding a creator grants
   take authority instantly).
2. **Anomaly-baseline laundering.** The mass-movement gate baselined against the newest
   `data/history/` snapshot *from the artifact* — an agent-planted same-day snapshot
   matching tampered data would neutralize it. (The row-drop gate was already immune: it
   baselines against git HEAD.)

**Fix (this branch): publish "Gate 0"** — before any other gate, the publish job fails
red if the artifact modified `required-sources.json`, `scales.json`, or the structure of
`sources.json` (beyond page `snapshot` dates) / `community.json` (beyond `latest` +
`verifiedDate`); and it resets any agent-supplied `data/history/` changes (reset, not
fail: CLAUDE.md instructs refreshes to snapshot, so an agent doing so is compliant —
publish re-derives its own snapshot post-gates either way). Registry membership changes
now genuinely require a reviewed commit to master, which is the audit's control (b)
implemented structurally rather than by policy.

**Fix (this branch): host allowlists everywhere.** The `TAKE_HOSTS` pattern (which
already pinned creator-take/metaNote citations) now also pins: PTR writeup + tier-set
`source` URLs, community discord/altDiscord invites, creator + generalCreator channel
URLs, and the PTR build feed's `thread`/`forumUrl` (Blizzard forums only) /
`wowheadUrl` / `icyveinsUrl`. The allowlists live in `src/validate.mjs` — code the
nightly can't publish changes to — so widening one is inherently a reviewed edit.
`community.json` `sites[]` stays https-only by design (heterogeneous class-community
domains).

Also added `.github/CODEOWNERS` declaring the human-owned boundary (workflows, gate
contract, scales, registries, gatekeeper code). It becomes enforcing only if a branch
ruleset requires code-owner review — declarative until then, but the boundary is now
written down and Gate 0 enforces the data-side subset mechanically.

## Dependency PRs

Rather than merging five overlapping single-action PRs, this branch applies all five
bumps in one tested change (the audit's "maintenance train"), with SHAs taken from the
Dependabot branches themselves: checkout v7.0.0, setup-node v7.0.0, download-artifact
v8.0.1, configure-pages v6.0.0, deploy-pages v5.0.0. Release-note review found no
behavioral traps for this repo: checkout v6 moves persisted credentials out of
`.git/config` (we persist only in publish; agent checkouts stay
`persist-credentials: false`), v7 restrictions target triggers we don't use;
download-artifact v8's digest check now *fails* on mismatch (an upgrade for the
evidence-artifact chain — fail-loud matches this repo's philosophy) and remains
compatible with upload-artifact v4, which is still the current major. Dependabot is now
configured to **group** future action bumps into one weekly PR. When this branch merges
to master, Dependabot auto-closes #2–#6.

Live-fire note: `dispatch-nightly.yml` auto-kicks a nightly run when workflow changes
land on master, so the artifact-handoff path (upload v4 → download v8) gets a real
end-to-end test the first night. Watch that run.

## Declined / deferred, with reasons

- **Untracking `dist/index.html`** — declined. It's a deliberate design point (the
  artifact is openable straight from the repo; the committed copy is also the deployed
  history), the push-race rebuild is small and was battle-hardened 2026-07-17, and
  Pages already builds fresh via deploy.yml either way. Cost of restructuring the
  publish loop exceeds the churn it saves. Revisit at the S2 freeze if at all.
- **Raw-evidence archive / content hashes** — deferred, not disputed. Cheap starter
  when wanted: commit `wcl-fetch/evidence.json` (or its sha256) beside the manifest;
  store a sha256 of fetched tier-list pages next to each `snapshot` date; upload
  `transcript-fetch/` as an artifact so distilled takes stay auditable. Left as a
  design decision because it changes what the nightly commits nightly.
- **Self-hosting fonts** — agreed-low-priority; not done. Would add ~100 KB+ of woff2
  to the single-file artifact to remove one CSP-pinned dependency.
- **Filing tracking issues** — the audit's two wow-tracker issues are superseded by
  this document + branch; the owner can file from here if wanted.

## Owner-only checklist (not verifiable or settable from the repo)

Settings → verify once (also flagged as pending in `security-audit-2026-07.md`):
default Actions workflow permissions read-only; secret scanning + push protection;
branch ruleset on `master` (require CI; optionally code-owner review for
`.github/**` + registry paths — note the nightly publish pushes straight to master, so
a blanket "require PR" rule would break it: scope any review requirement to paths the
publish job never stages); Dependabot security updates; artifact retention. And renew
`CLAUDE_CODE_OAUTH_TOKEN` before it expires (~1-year validity from setup).
