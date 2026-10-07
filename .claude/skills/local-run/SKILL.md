---
name: local-run
description: Run a tracker refresh (full or spot-fix) from a local/interactive session and push it to master safely — the local counterpart of the nightly, with the same honesty guarantees minus the CI gates. Use when Riley says "local run", "evening restore", "run the refresh here", or is pushing a data fix from a residential IP.
---

# Local run — the manual counterpart of the nightly

The nightly runs on a CI runner behind five deterministic gates. A local run has NONE of
them: no Gate 0 boundary guard, no manifest cross-check, no value-move guard, no anomaly
gate, no per-source churn gate, no publish-side rebuild. It pushes straight to master and deploys immediately. That
is by design — the human at the keyboard *is* the review — but it means the honesty
guarantees only hold if the run actually does the things the gates would have checked.
This skill is that checklist. It was written after auditing the 07-28 and 07-30 local
runs (2026-07-31), which were sound but left drift the next nightly had to absorb.

## Why local runs exist

- **Residential IP**: WCL HTML statistics endpoints and YouTube transcripts work from
  home and not from CI runners. The 07-28 "evening restore" unfroze five WCL canonical
  series that CI could not fetch for 19 days. Transcript catch-up is the standing case
  (see watch-creators — CI-blocked videos queue as pending and land in local runs).
- **Human-acked fixes**: a change the nightly's gates would rightly block — like the
  07-30 Archon Popularity repair, a 40-row ~100% value move — is exactly what a local
  run is for. The human review replaces the `value_move_ack` input (or `anomaly_ack`, or
  `source_churn_ack` for one outlet's rebuilt list). **Say so in the
  commit message**: name what was corrupt, what the fix is, and how it was verified.
  That commit message is the ack record; without it the history shows a mass value move
  with no explanation, indistinguishable from the corruption it fixed.
  An unattended run (the scheduled task under Scope) has no human review to stand in for
  any of these inputs: if `check-refresh --manifest` prints a finding one of them would
  waive, do not push. Report it with the evidence the nightly agents would put in
  `anomalyAckProposal` (for a churn breach: each `source:bracket` pair, the outlet's page
  and the page's own date) and stop.

## The procedure

1. **Inspect the working tree and start from current master.** Fetch origin, then
   use `git switch master` and `git pull --ff-only` when the working tree permits.
   Preserve unrelated local work; never reset it away. The nightly may have pushed
   while you slept; a local run must never rebase the night away. If a nightly is
   queued, pending or in progress (the three lists in the push rule below), let it
   finish before you start: you would have to wait for it before pushing anyway, and
   starting after it saves redoing the run on top of its commit.
2. **Do the work through the existing skills** (refresh-tiers / refresh-metrics /
   ptr-watch / watch-creators / paste-discord). They carry the per-source gotchas; do
   not improvise transport recipes here.
3. **The manifest rule** (this is where the 07-28 run drifted):
   - **Full refresh** (you re-attempted every requirement, like a nightly): rewrite
     `data/run-manifest.json` exactly as the nightly would — fresh `run` + `startedAt`,
     one honest row per requirement. CLAUDE.md's "every full refresh — nightly or local —
     ends by updating the manifest" means this.
   - **Partial run / spot fix** (most local runs): **do not touch the manifest.** It is
     the previous run's record; editing some rows and not others makes it internally
     dishonest, and a fresh `startedAt` would claim a full refresh happened. The drift
     this leaves — manifest rows saying "unreachable" while the stored data is fresh —
     is bounded at one day, because the next nightly re-attempts everything and rewrites
     the file. That bound is the design, not an accident.
4. **Freeze any outlet that moved to the next season** — run this BEFORE the verify
   below, so the build and tests see the frozen letters:
   ```
   node src/freeze-season.mjs
   ```
   Deterministic and append-only: it walks git history for the newest commit whose own
   `data/sources.json` still verified each page at `PHASES.liveSeason` and lifts that
   commit's letters into `data/season-final.json`, never overwriting an existing record.
   Normally a no-op that prints "nothing to freeze". It matters on exactly the run where
   an era-verify step records a `seasonVerified` flip: without it that outlet drops out of
   the consensus, which publishes as spec movement nobody wrote (16 cells the night
   Wowhead flipped), and if every outlet flips before the phase flip the 12.0.7 column
   blanks entirely (measured: 80 of 80 cells null). **The nightly runs this too** — in its
   publish job, between Gate 0 and Gate 1 — so a local run that skips it and pushes leaves
   the flip for the nightly to catch, which means a day of published phantom movement.
   It needs real git history; a shallow clone cannot answer the question and it errors
   rather than writing an empty record.
5. **Verify like the publish job would**:
   ```
   npm run test:quiet && npm run build
   node src/check-refresh.mjs --manifest   # informational — see below
   ```
   On a partial run, `--manifest` will fail on exactly one line — `startedAt … is Nh
   old — not a fresh write from this run`. That failure is expected and correct (you
   did not do a full refresh). **Anything else it prints is real** and must be either
   fixed or explainable before pushing; it is the same output the nightly gate reads.
   For a metric collection, also run `node src/check-stable-metrics.mjs` against the
   fresh isolated receipts before committing. For an official-note pass, run
   `node src/check-official-notes.mjs`; a receipt is not complete while changed or
   removed class sections are unresolved. A source fetch failure preserves its
   existing data and receipt dates; never fabricate a resolution or a fresh date.
6. **Snapshot**: `node src/snapshot.mjs` whenever data changed — this is both the
   movement baseline and the freshness heartbeat's proof-of-life for runs that skip
   the manifest (a snapshot only counts if strictly newer than the manifest date, so a
   local run on the same calendar day as a completed nightly does not extend the
   heartbeat — fine, the nightly already did). Skip it when the only data change is
   bookkeeping, such as the official-notes ledger's `checkedAt` stamps (owner decision
   2026-10-06): that snapshot would vouch for a refresh that did not happen, and one dated
   after the newest manifest hides a missed nightly from the heartbeat (the 2026-09-02
   case in CLAUDE.md).
7. **Rebuild after the snapshot** (`npm run build`) so the drawer Timeline includes
   the point you just wrote — the same ordering the nightly publish learned on 07-31.
8. **Commit with the run's story, then push master directly, but only once the push rule
   below passes.** Deploy fires on the push.
9. **Digest gap, known and accepted**: only the nightly publish posts to the pinned
   digest issue. A local run's changes appear in the NEXT nightly digest as part of its
   HEAD^..HEAD diff only if nothing else lands first — in practice they are documented
   by the local commit message instead. If a local run's changes are big enough that
   the digest thread should record them, run `node src/digest.mjs HEAD^ HEAD` and paste
   the output as a comment on the pinned issue manually.

## Scope — decide this before touching anything

CI runs the full refresh nightly (`.github/workflows/nightly.yml`; the cron says 10:37 UTC,
but GitHub creates the runs hours later, as the push rule below records). **A scheduled local
task exists again**: Riley's Claude desktop task `wow-ptr-watch` runs this skill unattended
daily at 07:00 local time (next due 2026-10-05 14:05 UTC), verified 2026-10-04 against the
machine's task list. That reverses the 2026-08-14 note here, which said the local task was
retired along with the claude.ai cloud routine (`docs/cloud-routine.md` records why). The old
schedule's ORDERING lesson still holds: run *after* CI has had its go, so this is a catch-up
rather than a race. The clock no longer delivers that order, because 25 of the last 27
scheduled nightlies were created after 14:05 UTC; step 1 and the push rule do.
**Default scope is residential-only catch-up** —
the things a datacenter runner physically cannot do:

- drain `data/pending-transcripts.json` with yt-dlp (datacenter IPs hit YouTube's bot wall);
- re-fetch the WCL cuts the nightly recorded `unreachable` (the HTML statistics endpoints
  work from a residential IP, not from CI);
- verify-and-log what CI already refreshed today rather than rewriting it.

Independently regenerating data CI already produced is what makes a push unmergeable —
two independently regenerated datasets do not merge mechanically (proven 2026-07-31,
conflicts across ~8 data files). Do a **full** refresh only when the nightly did not run
or you intend to replace it; then the manifest rule above applies. The 2026-07-08
no-staleness-gate policy still holds *within* whichever scope you pick.

## The work — each skill's SKILL.md is authoritative

1. **`ptr-watch`** — now in its BETWEEN-CYCLES posture (see the ⚑ block at the top of
   its SKILL.md, added at the 2026-08-18 launch): Wowhead news RSS + official forums for
   **live 12.1 tuning** (hotfix round-ups → `kind: "hotfix"`, scheduled passes with their
   own forum topic → `kind: "build"`, both with `realm: "live"`, which every new entry must
   record) and the separate **12.1.5 notes-only preview**. While `PHASES.ptr` is null no
   12.1.5 PTR material enters the feed: its PTR builds, PTR hotfix rounds and consolidated
   notes posted before launch go in the run report, never `data/ptr-builds.json` (the
   development-notes thread's staff posts reach the site through the preview lane). The
   nightly prompts carry the same rule; a local run has only the skill to hold it.
   Read the deterministic official-notes receipts and resolve every changed class
   section; leave PHASES and the frozen forecast closed. The four PTR
   WCL zone sweeps (54/52/56/57) are DORMANT — skip them entirely; their contract rows
   were removed at the flip, so they need no manifest excuse. Stored zone rows are the
   closed cycle's final receipts: never refresh, never delete. Supported S2 WCL
   leaderboard collection now runs through `src/fetch-wcl.mjs` (recipe in refresh-metrics).
   Verify `node src/check-wcl-metrics.mjs` against the pre-collection committed baseline.
   Its new wcl-leaderboard-* requirements are separate from wcl-live-* population
   aggregates, which still lack a verified endpoint. Do not green those older requirements
   with leaderboard samples. The former rdps-outage diagnosis was incorrect: that enum
   is FFXIV-only. Keep all historical values and dates unchanged.
2. **`watch-creators`** — draining the transcript queue is the main reason this run
   exists. Honour the `skipped[]` lane (durable verified-skips), the same-lens supersede
   pass, and the `generalCreators` → `metaNotes[]` firewall.
   Supadata collection belongs in the nightly's durable usage/cache workflow;
   do not run `fetch-transcripts.mjs` with a new local ledger against the same API
   key or clear a review hold. A direct API run requires the latest trusted state
   and coordinated persistence back to the nightly; see
   `docs/transcript-operations.md`. Residential catch-up keeps its existing lane.
3. **`refresh-tiers` / `refresh-metrics`** — scoped per above. WoWMeta is a `metrics`
   source, not a tier list: refresh-tiers does not fetch it, and its M+ numbers follow the
   refresh-metrics recipe. *(Corrected 2026-10-06: this line said not to apply WoWMeta M+
   rows or re-stamp their `snapshot` while that source was under review, citing a
   refresh-tiers log entry since pruned. The review ended the same day, 2026-07-31, in the
   retype to `metrics`.)*
4. **Gearing guide harvest** (a separate weekly workflow since 2026-09-05, with
   local catch-up when a provider fails):
   when `gearing/data/guides/*.json` `harvestedAt` ages past ~7 days during the launch
   window (through ~09-15; the contract's 30d thresholds are the backstop, not the
   target), re-run the three harvesters from `gearing/`:
   `node src/harvest-guide-icyveins.mjs --force && node src/harvest-guide-wowhead.mjs
   --force && node src/harvest-guide-method.mjs --force`, then `npm run gearing:build`
   from the repo root and let the root suite gate it. Loot/tier/catalyst re-harvests
   (`harvest-raid` / `harvest-dungeons` / `harvest-tier` / `harvest-catalyst-allocations`)
   only on a loot-change signal or owner ask — each has fail-closed change gates that
   will tell you if reality moved. NEVER re-run `harvest-sheet.mjs` as-is (it would
   regress the owner-supplied Gandalin ilvl data — gearing/README.md).

## Orchestration limits (a scheduled run is unattended)

- **Never end the turn while a Workflow or background agent is still running.** Workflow
  backgrounds its agents; stopping to "wait" ends the run with a mutated tree, and the
  clean-tree precheck then makes the *next* run refuse to start. One backgrounded turn
  costs two runs — this is the 2026-07-15→17 failure mode. Poll to completion inside the
  turn, or do the work solo.
- Fan-out, if used, is **read-only verification that reports back and never writes**
  (parse verification, era-verification, `log.md` precedent lookups, checking a
  distillation against its cited source). Cap ~4 concurrent.
- **Single-threaded, main agent only:** every `apply-*.mjs` merge and direct `data/*.json`
  write; `npm run test:quiet && npm run build`; `freeze-season.mjs`; `snapshot.mjs`; the final rebuild; the manifest
  rewrite; all git staging, commit and push. (This list is a CONCURRENCY policy, not a
  running order — read it as "none of these may be delegated", not as a sequence. The
  order is steps 1-8 above, and step 7's rebuild-AFTER-snapshot is the part this list
  looks like it contradicts. On 2026-08-02 a local run followed this line's apparent
  ordering, shipped a dist whose Timeline ended on a null point for all 40 specs, and
  needed a follow-up commit to fix it.)
- If a verification agent and the main line disagree, **do not push** — report and stop.

## Report shape

Builds/hotfixes found; 12.2 PTR announcement check; videos processed and queue count
before→after; gearing guide harvest run-or-skipped and why;
takes **and** metaNotes added; sources refreshed vs verified-unchanged; whether the
manifest was rewritten or deliberately left alone and why; what `check-refresh
--manifest` printed; what was rebuilt; whether you pushed, or held the push and for which
run (id and status), and what you did once it finished.

## Push rule: hold while a nightly is queued, pending or in progress

Rewritten 2026-10-04 to follow the push rule in `docs/1215-launch-runbook.md`, which governs
every push to master. The 2026-08-14 version of this section set a clock window, 10:30–12:30
UTC, and the clock was wrong by hours: the cron says 10:37 UTC, but GitHub created the 27
scheduled nightlies of 2026-09-08 → 10-04 between **13:43 and 18:14 UTC** (each finished
18–42 minutes later), and the 69 since 2026-07-28 between 10:53 and 21:14 UTC. No time of
day is safe, so check run state before **every** push:

1. All three lists must be empty:
   ```
   gh run list --workflow nightly.yml --status in_progress
   gh run list --workflow nightly.yml --status queued
   gh run list --workflow nightly.yml --status pending
   ```
   `pending` is not optional. The `nightly-refresh` concurrency group (cancel-in-progress
   false, shared with `gearing-refresh.yml` and `gearing-verify.yml`) holds back a run that
   arrives while another run has the lock, and GitHub's concurrency docs call that state
   `pending`, not `queued`. On 2026-09-15 run 34990700222 waited 5 minutes that way.
2. The previous master commit's runs must be finished, in this order: nightly publish, the
   deploy it dispatches, then the Tests run it dispatches:
   `gh run list --limit 8 --json databaseId,workflowName,status,headSha`
3. Push only the commit you tested, with a plain `git push origin master`, never `--force`.
   A plain push is rejected if master moved, which makes it this skill's form of the
   runbook's `--match-head-commit`.

**Any non-empty list means hold.** A local commit is free; only the push races. Wait inside
the turn (`gh run watch <id>`, then the three lists again) and never end the turn to come
back later (see Orchestration limits). When the lists are empty and step 2 holds, fetch and
push. If the push is rejected, master moved, usually because the nightly published: do not
rebase, merge or cherry-pick onto it. Note the held commit's SHA, your record of what to
redo. If `git log --oneline origin/master..master` lists only that commit,
`git switch -C master origin/master` drops it and nothing else (otherwise stop and report);
then start again from step 1 and re-apply only what CI could not do. If you cannot wait,
leave the commit unpushed and report its SHA and the run that held it.

Why every push counts, in today's publish job:
- A run's base commit is fixed when GitHub creates the run. Since 2026-09-05 publish first
  runs `src/check-refresh-base.mjs`, which **fails the night red if master has since gained
  any `data/` or skill `log.md` edit**, and every local data run makes one. A queued or
  pending nightly already has its base, which is why those lists count.
- A push during publish gets the nightly's own `git push origin master` rejected, and the
  night goes red; publish does not rebase, by design.
- A master push cancels the nightly commit's waiting deploy and its in-progress Tests run,
  and that Tests run is the only UI-invariant check a nightly gets.

The 2026-08-14 failure, Gate 0 reading the artifact's older copy of an immutable file as an
agent edit, now stops at the base guard instead. Since 2026-09-15 publish also installs the
agent's output through `src/install-refresh-output.mjs`, which admits only HEAD-tracked data
and skill logs, rather than downloading the artifact over the checkout.

**A red night caused this way is not fixed by a re-run.** A re-run reuses the original run's
commit SHA and fails the same guard; the guard's own message says to start a new refresh on
current master, which means a new run (`gh workflow run nightly.yml --ref master`) once the
three lists are empty. Nothing is lost or corrupted; the cost is a wasted agent run.

**Flip day** is a local run by design and gets no exemption: the flip commit touches
`scales.json` and `required-sources.json`, and it waits for empty lists like any other push.

## What a local run must never do

- Edit `data/community-overrides.json`, `data/required-sources.json`, `data/scales.json`,
  `data/season-final.json`, `data/forecasts/`, `data/season-archive/`, workflows, or
  gatekeeper code as part of a DATA run. Those are reviewed code edits with their own paper
  trail — a data commit that also moves the goalposts is exactly what Gate 0 exists to catch
  in CI, and locally nothing will catch it. **That list is Gate 0's immutable set verbatim**
  (`nightly.yml`, the `git diff --quiet HEAD --` guard); the last three were missing here
  until 2026-08-14, which meant the one document telling a local run what CI protects
  under-reported it. The frozen lanes are the dangerous omission: `season-final.json` is
  append-only and written ONLY by `freeze-season.mjs`, and `forecasts/` holds the immutable
  artifact the report card grades — hand-editing either is unrecoverable and silent.
- Push with `npm test` red or the build broken. The deploy is immediate; there is no
  publish job to save you.
- Fill anything from model memory. Hard rule 1 applies at home too.
