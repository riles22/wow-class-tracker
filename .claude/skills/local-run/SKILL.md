---
name: local-run
description: Run a tracker refresh (full or spot-fix) from a local/interactive session and push it to master safely — the local counterpart of the nightly, with the same honesty guarantees minus the CI gates. Use when Riley says "local run", "evening restore", "run the refresh here", or is pushing a data fix from a residential IP.
---

# Local run — the manual counterpart of the nightly

The nightly runs on a CI runner behind five deterministic gates. A local run has NONE of
them: no Gate 0 boundary guard, no manifest cross-check, no value-move guard, no anomaly
gate, no publish-side rebuild. It pushes straight to master and deploys immediately. That
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
  run is for. The human review replaces the `value_move_ack` input. **Say so in the
  commit message**: name what was corrupt, what the fix is, and how it was verified.
  That commit message is the ack record; without it the history shows a mass value move
  with no explanation, indistinguishable from the corruption it fixed.

## The procedure

1. **Start from current master.** `git fetch origin master && git checkout master &&
   git reset --hard origin/master` (or pull --ff-only). The nightly may have pushed
   while you slept; a local run must never rebase the night away.
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
4. **Verify like the publish job would**:
   ```
   npm test && npm run build
   node src/check-refresh.mjs --manifest   # informational — see below
   ```
   On a partial run, `--manifest` will fail on exactly one line — `startedAt … is Nh
   old — not a fresh write from this run`. That failure is expected and correct (you
   did not do a full refresh). **Anything else it prints is real** and must be either
   fixed or explainable before pushing; it is the same output the nightly gate reads.
5. **Snapshot**: `node src/snapshot.mjs` whenever data changed — this is both the
   movement baseline and the freshness heartbeat's proof-of-life for runs that skip
   the manifest (a snapshot only counts if strictly newer than the manifest date, so a
   local run on the same calendar day as a completed nightly does not extend the
   heartbeat — fine, the nightly already did).
6. **Rebuild after the snapshot** (`npm run build`) so the drawer Timeline includes
   the point you just wrote — the same ordering the nightly publish learned on 07-31.
7. **Commit with the run's story, push master directly.** Deploy fires on the push.
8. **Digest gap, known and accepted**: only the nightly publish posts to the pinned
   digest issue. A local run's changes appear in the NEXT nightly digest as part of its
   HEAD^..HEAD diff only if nothing else lands first — in practice they are documented
   by the local commit message instead. If a local run's changes are big enough that
   the digest thread should record them, run `node src/digest.mjs HEAD^ HEAD` and paste
   the output as a comment on the pinned issue manually.

## Scope — decide this before touching anything

CI runs the full refresh nightly (`.github/workflows/nightly.yml`, 10:37 UTC). The
scheduled local task now fires at **07:10 local (14:09 UTC)**, i.e. *after* CI, which is
the correct order for a catch-up run. **Default scope is residential-only catch-up** —
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

1. **`ptr-watch`** — Wowhead news RSS + the official forum thread for new builds; WCL
   zones **54** (PTR raid), **52** (Dummy Dome), **56** (PTR M+), **57** (Tidebound
   Grotto). Zone 54 has been empty upstream since 2026-07-31 (the 14-day rolling window
   aged out the mid-July parses) and 57 has never aggregated — **empty is not an error**:
   ingest nothing and leave both the stored rows and that zone's `snapshot` alone, so the
   staleness stays visible rather than being papered over.
2. **`watch-creators`** — draining the transcript queue is the main reason this run
   exists. Honour the `skipped[]` lane (durable verified-skips), the same-lens supersede
   pass, and the `generalCreators` → `metaNotes[]` firewall.
3. **`refresh-tiers` / `refresh-metrics`** — scoped per above. 🛑 **Do not apply WoWMeta
   M+ rows or re-stamp their `snapshot`** while that source is under review (see
   `refresh-tiers/log.md`, 2026-07-31).

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
  write; `npm test && npm run build`; `snapshot.mjs`; the manifest rewrite; all git
  staging, commit and push.
- If a verification agent and the main line disagree, **do not push** — report and stop.

## Report shape

Builds found; zone 54/52/56/57 state; videos processed and queue count before→after;
takes **and** metaNotes added; sources refreshed vs verified-unchanged; whether the
manifest was rewritten or deliberately left alone and why; what `check-refresh
--manifest` printed; what was rebuilt; whether you pushed.

## What a local run must never do

- Edit `data/community-overrides.json`, `data/required-sources.json`, `data/scales.json`,
  workflows, or gatekeeper code as part of a DATA run. Those are reviewed code edits
  with their own paper trail — a data commit that also moves the goalposts is exactly
  what Gate 0 exists to catch in CI, and locally nothing will catch it.
- Push with `npm test` red or the build broken. The deploy is immediate; there is no
  publish job to save you.
- Fill anything from model memory. Hard rule 1 applies at home too.
