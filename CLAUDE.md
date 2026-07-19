# Midnight 12.1 PTR Spec Tracker

Multi-source class/spec performance tracker for WoW Midnight (Patch 12.1 PTR, "Curse of Ula'tek").
Data lives in `data/*.json`; a build step compiles it with `src/template.html` into **one
self-contained artifact — `dist/index.html`** — a personal project. It's published as a
public GitHub Pages site (https://riles22.github.io/wow-class-tracker/) that auto-deploys
on push to `master`; the file also still opens directly in a browser.

## Commands

- `npm test` — schema validation + unit tests + build smoke test
- `npm run build` — data + template → `dist/index.html`
- `npm run validate` — data checks only
- `npm run serve` — preview `dist/index.html` at http://localhost:8317
- `node src/check-refresh.mjs --manifest|--age` — refresh integrity gates (nightly
  publish contract / staleness heartbeat) against `data/required-sources.json`

Always run `npm test && npm run build` after any data edit. Never edit `dist/index.html`
by hand — it is generated.

## Hard rules

1. **All game data is fetched live, never filled from model memory.** Midnight / 12.1
   postdates every model's training cutoff. Unfetchable → leave absent/null ("pending
   fetch" in the UI) rather than guessing.
2. **The 40-spec roster is Midnight-era and includes Demon Hunter · Devourer.** Do not
   "correct" it to a 39-spec pre-Midnight shape.
3. **Honest source typing.** Only `kind: "tier-list"` sources feed the letter-tier
   consensus. `kind: "metrics"` data (log medians, sim DPS, ratings ceilings) is displayed
   as numbers and NEVER converted to letter grades. Murlok's number is a *top-50 ceiling*
   (avg rating of each spec's best 50 players), not popularity, and must stay labeled so.
   Archon raid tiers come from its **throughput** tier list (not the default popularity
   grouping); Archon M+ tiers from its **score** tier list.
4. `src/template.html` is presentation only — zero data in it.
5. Data-changing workflows run **plan-first**: propose the diff, then apply. *(Interactive
   sessions only — the unattended nightly routine has no one to propose to; its
   substitute guardrails are the validation-gated merges, the test suite, the
   run-manifest completeness/honesty/anomaly gates (`src/check-refresh.mjs` vs
   `data/required-sources.json`), explicit path staging, rollback on failure, and the
   run report.)*
6. Discord content is never fetched (auth + TOS) — `data/community.json` holds curated
   links only, manually verified. Creator videos are opinion/analysis, not tier data.

**`SOURCES.md` is the canonical human-readable source inventory** — every source by
layer, with honesty rules and access etiquette. Keep it in sync when adding sources.

## Data model

### `data/specs.json` — array of 40 specs
```json
{
  "class": "Rogue", "spec": "Outlaw", "role": "DPS",
  "ratings": { "raid": { "icyveins": "A", "archon": "B" }, "mplus": { "...": "..." } },
  "metrics": [
    { "source": "warcraftlogs", "bracket": "raid", "name": "Median rDPS (Mythic, all bosses)",
      "value": 118000, "unit": "rDPS", "n": 25000, "asOf": "2026-07-01" }
  ],
  "fightProfile": { "source": "bloodmallet", "asOf": "2026-07-01",
                    "targets": { "1": 104255, "3": 197715, "8": 320000, "15": 543931 } },
  "ptr": null
}
```
- `ratings` keys are tier-list source ids; tiers must exist in that source's scale (null = unrated → "—").
- `metrics` rows upsert by (source, bracket, name) — see `src/apply-metrics.mjs`. Each
  may carry `era: "live" | "ptr"` (default live; names containing "12.1 PTR" are
  inferred ptr). At build time every metric gets `rank`/`of` — its position within
  (role, bracket, name), #1 = highest value; all current metrics are higher-is-better
  (extend `metricRanks` in render.mjs with a direction flag before adding one that isn't).
  The UI has an Era toggle (Both / 12.0.7 / 12.1 PTR) filtering verdicts, writeups,
  era-tagged metrics, and creator takes.
- `fightProfile.targets` maps target count → sim DPS (best build per count). The build
  derives ST/cleave/AoE labels (canonical counts 1/3/8; a spec missing a count gets a
  null label) as **within-role percentiles across DPS specs** (≥70th = strong, ≤30th =
  weak) plus a row tag (AoE-lean / ST-lean / All-round / Flexible / Low-sims; null when
  no canonical count is comparable). DPS specs only — healers/tanks have no sim basis.
- `ptrDummy` = real-player Dummy Dome logs (WCL zone 52): `{ source, asOf,
  targets: {"<count>": medianRDPS} }`, merged via apply-metrics.mjs `ptrdummy` key.
  A parallel **"Median raw DPS (12.1 PTR Dummy Dome, NT)"** metric series (plain
  `dps`, best-parse-per-player medians) is fetched AND merged by the deterministic
  `src/fetch-wcl.mjs` step (frozen recipe, owner-approved 2026-07-17) — agents never
  write it, and it never substitutes for the rDPS series (honest source typing).
  The build computes a 0–100 composite + rank across target counts (`dummyDomeScores`
  in render.mjs, coverage-floored) — never hand-write score/rank/perCount.
- `ptr` is the per-spec 12.1 writeup: `{ verdict: "Positive|Mixed|Negative", theme,
  summary, changes[], set2, set4, watch, source|sourceLabel }`. **Writeups are
  attributed distillations and auto-confirm on landing** (policy 2026-07-06: Riley
  defers to the cited theorycrafters — no review gate). The honesty lives in the
  mandatory provenance: every writeup MUST carry `source: <url>` (or
  `sourceLabel: "<who> — Discord"` for unlinkable posts); validation enforces it.
  Distill faithfully — the verdict is the SOURCE's read, never the distiller's own
  editorial call. The old `draft: true` flag is retired (treated as confirmed if ever
  encountered).

### Computed at build time (never hand-written)
- **Movement (▲▼)**: `build` compares consensus tiers + metric ranks + the Dummy Dome
  composite rank against the movement baseline — the most recent `data/history/*.json`
  snapshot that DIFFERS from the current state (`pickBaseline` in render.mjs skips
  post-refresh snapshots identical to now, so CI rebuilds show real movement). **Every
  refresh that changed data ends with `node src/snapshot.mjs`.** Zero movement means
  nothing actually moved since the last change — that's honest, not broken.
- **12.1 outlook (↗→↘)**: from the spec's `ptr.verdict` when present (writeups
  auto-confirm — see the ptr bullet), else the balance of buff/nerf tuning lines classified by
  `classifyHighlight` (render.mjs — resource-aware: "cooldown reduced" is a buff, and
  the "X% (was Y%)" idiom is decided by the values). The zone-54 raid-testing rank is
  named in the basis string for context but never drives the direction.
- **12.1 projection ("Ours: 12.1")**: the tracker's OWN forecast tier list for raid+M+,
  computed in `projectionFor` (render.mjs) — live consensus baseline (w .55) blended
  with PTR empiricals (zone-54/56 testing percentile w 2 : Dummy Dome w 1; total .45,
  renormalized when absent), shifted by outlook direction (±7) and the newest
  general-creator meta read (±3), clamped and mapped through the consensus bands, with
  a confidence tag (high/medium/low/prior-only by PTR-signal count). **A projection is
  NOT a source**: it never feeds consensus (it derives from it), is era-gated out of
  12.0.7-only views, and every surface carries its component basis string. Tune weights
  in code only — never hand-write `spec.projection`.
- **History snapshots are ENRICHED** (2026-07-09): `snapshotStateOf` stores exact
  consensus scores + the projection (tier/score/confidence, no basis strings) alongside
  the classic tiers/ranks. Movement/baseline comparison stays tier/rank-grained — the
  enrichment feeds the drawer **Timeline** sparklines (`historySeries` → payload
  `history`) and is the raw data for the post-launch **forecast report card** (grade the
  frozen pre-launch projection against the first settled S2 consensus).
- **Zone-54 raid testing covers ALL ROLES** (2026-07-09): healer (hps) and tank cuts
  merge under the SAME metric name as DPS — "12.1 PTR raid testing score (normalized)" —
  so within-role ranks and the projection consume them with no special-casing.
- **Client-side UX lanes** (template-only, no build step): URL-hash deep links (state +
  open drawer, `applyHash`/`writeHash`), localStorage watchlist (★ + Starred filter),
  the "What changed" strip (narrates the movement-baseline diff), and Compare (pin ≤3
  specs side by side; era-gates the projection rows like every other surface).
- **Fight view**: `data/encounter-tiers.json` holds Archon per-boss (throughput) and
  per-dungeon (score) tiers — single-source by design, labeled as Archon in the UI; the
  Fight selector swaps the matching tier column. Refresh alongside the tier lists.
- `spec.survivability` = Archon's raid survivability tier (merge via apply-metrics.mjs
  `survivability` key) — shown in the drawer's Source ratings box.
- `spec.playstyle` = `{ range: "Melee"|"Ranged", mobility: 1-5, utility: 1-5, complexity: 1-5, notes }`,
  guide-sourced (Icy Veins strengths/weaknesses + difficulty ratings); merge via
  apply-metrics.mjs `playstyle` key (or `complexity` key to merge just that field). Feeds
  the **Spec Finder** — a client-side weighted-scoring quiz (template.html,
  presentation-only, no build step) that ranks all 40 specs against user preferences
  (role, content, meta-vs-vibes, fight type, melee/ranged, mobility/survivability/
  utility/12.1-outlook) using existing data + playstyle. Criteria with no data are
  skipped and weights renormalized, so it degrades gracefully.

### `data/sources.json` — source registry
Kinds: `tier-list` (toggle button + consensus; needs `scale`), `metrics` (numbers in
drawers), `notes-feed` (PTR build feed), `reference` (footer link only), `community`
(community-layer registry entries). Each has `pages[]` with `bracket`, `role`,
optional `label`, `url`, `snapshot` (ISO date). All URLs must be https:// —
validation enforces it, plus host allowlists on every agent-writable URL field
(creator-take/metaNote citations, writeup + tier-set sources, community discord/creator
links, PTR build-feed links — the approved-host sets live in `src/validate.mjs`; a new
legitimate host fails the run red and is added there as a reviewed code edit).

### `data/scales.json` — tier scales + normalization
Each scale maps tiers onto one 0–100 axis; consensus = mean of available tier-list scores
mapped through `consensus.bands`, divergence dot when spread ≥ `spreadThreshold`.
Adding a tier-list source = config edit here + registry entry + backfill. No code changes.

### `data/ptr-builds.json` — 12.1 PTR build feed (newest first)
Per build: `{ date, label, forumPostNumber, forumUrl, wowheadUrl, icyveinsUrl,
specsAffected[], highlights[] }`. Canonical source: the official forum thread
(`thread` key) — each PTR build is a new reply post, machine-readable via Discourse
`.json`. **A new patch cycle means a NEW thread** — re-discover via Wowhead news RSS.

### `data/community.json` — curated community links
Per class: verified Discord (name + invite from wowhead.com/discord-servers, render via
r.jina.ai) and creators `{ name, credential, url, latest, verifiedDate, specs? }`. Add
only verified entries; prefer Wowhead/Icy-Veins/Method guide authors. **`specs`** is
optional per-creator spec scoping — the specs of that class the creator is actually
credible on (absent = whole class). Creators specialize (Obli = Frost/Unholy DK, not
Blood); watch-creators only attributes takes within a creator's scope so a DPS creator
never lends authority to their class's tank/healer spec. `transcribable: false` marks a
guide-byline/Discord-only authority (SimC devs, guide writers) — a display "who to read"
link the transcript pipeline skips (shown with a 📖). `sites[]` holds class
community-site links (Peak of Serenity, Dreamgrove, etc.); `altDiscords[]` holds
secondary spec-specific Discords (Death's Advance, Focused Will, …). Top-level
**`generalCreators[]`** is the cross-class PTR-news lane (e.g. izen): polled by
watch-creators for build/tuning LEADS (verified against the official forum before
logging) and linked under the build feed — never a specialist per-spec take authority, by
construction (the take-scope validation only reads `classes[].creators`). Their per-spec
season/meta OUTLOOK reads land in a SEPARATE `creator-takes.json` `metaNotes[]` lane
(sentiment positive|negative|neutral|mixed, cited + dated), rendered as a distinct "Meta
outlook" drawer section — validation requires a `metaNotes` author be a `generalCreators`
entry, so the news-lane generalists stay firewalled out of the specialist `takes[]` /
consensus layers while their meta commentary still surfaces per spec. One disclosed
exception: the newest bracket-scoped, non-superseded read nudges the 12.1 projection
±3, named in that projection's basis string.

## Refresh workflows

### Run manifest + integrity gates (2026-07-14 security audit + same-day re-audit)
`data/required-sources.json` is the machine-readable refresh contract — every source a
full refresh must account for, with staleness thresholds, row-count floors, a
row-drop limit (`maxRowDropPct` vs the last committed state), and mass-movement
anomaly limits. `data/run-manifest.json` is the per-run status file: one
honest result row per requirement (`success | partial | unreachable | blocked |
parse_error | skipped`; everything but success needs a `detail`; every row carries
`previousAsOf`/`newAsOf` — the stored dates before/after the run, null for undated
feeds, never regressing), plus `run`, a full
ISO `startedAt` (required — the heartbeat's precision signal; must be a FRESH
instant, ≤12h old at gate time), `summary`
(becomes the nightly commit message), and optional `anomalyAckProposal` (the agent's
cited evidence FOR a human ack — **the anomaly gate itself only accepts the
human-supplied `anomaly_ack` workflow input**, never anything agent-written; a
manifest carrying the old `anomalyAck` field is rejected outright).
`node src/check-refresh.mjs --manifest` enforces it in
the nightly publish gate — "success" claims are cross-checked against the actual stored
snapshot/asOf dates (metric families use COVERAGE dates: the min-th-freshest row, so
one fresh row can't vouch for a stale cut) and, for WCL rows, against
`wcl-fetch/evidence.json` from the deterministic fetch step — so quiet skips and
dishonest rows fail the publish. **Every full
refresh — nightly or local — ends by updating the manifest**; the freshness heartbeat
(`.github/workflows/freshness.yml` → `check-refresh --age`) also accepts a new history
snapshot as proof of life, alerts (one auto-closing issue + red run) on staleness past
thresholds, and comments only when the violating set changes.
The committed manifest is always the PREVIOUS run's record — never evidence about the
current run, and its standing skip/unreachable explanations never excuse skipping
again: each run attempts every requirement fresh and rewrites the file (fresh `run` +
`startedAt`); the nightly publish gate hard-fails on an unchanged manifest file.

### Tier lists (every `tier-list` source — currently Icy Veins / Method / Wowhead / Archon / WoWMeta)
1. Fetch each page in `sources.json` live; era-verify (Midnight S1, Devourer in DPS lists).
   Archon: parse the `__NEXT_DATA__` JSON script tag from raw HTML (WebFetch markdown
   drops it); raid = throughput tierList, M+ = score tierList.
2. Write rows `[{class, spec, bracket, source, tier}]` (exact roster names) to a scratch
   file → `node src/apply-ratings.mjs <file>` (refuses on unmatched rows).
3. Update `snapshot` dates in `sources.json`; `npm test && npm run build`.

### Metrics (Warcraft Logs / Murlok / Archon numbers)
1. WCL: zone 46 = live S1 raid (Mythic = difficulty **5**, size 20, partition 3 = 12.0.7);
   zone 47 = M+ S1 (difficulty **10**, size 5, partition 1); zone **54 is the 12.1 PTR raid**;
   zone **56 is the 12.1 PTR M+** ("Mythic+ Season 2 (PTR)", same recipe as zone 47 →
   metrics "Median rDPS/HPS (12.1 PTR M+ testing[, tank])", see the ptr-watch skill);
   zone **52 is the Dummy Dome** (fixed-target-count PTR dummies → `spec.ptrDummy`, see
   the ptr-watch skill) — all PTR data era-tagged `"ptr"`. Statistics-table
   endpoint needs `X-Requested-With: XMLHttpRequest` + browser UA + Referer; response is
   an HTML fragment with unclosed `<td>` — parse leniently. **Fetch each cut fresh every
   run** — the automation no longer gates fetches on staleness or a once-daily cap (policy
   2026-07-08: pull everything every run). The sanctioned long-term path is still their
   free v2 GraphQL API (OAuth client); keep the mechanical retry/backoff so fetches
   succeed.
2. Murlok meta pages: plain GET (r.jina.ai does NOT work on it).
3. Write `{ "metrics": [...], "profiles": [...] }` to a scratch file →
   `node src/apply-metrics.mjs <file>`; `npm test && npm run build`.

### Fight profiles (Bloodmallet)
`GET https://bloodmallet.com/chart/get/talent_target_scaling/castingpatchwerk/{snake_case_class}/{spec}`
per DPS spec; take best-build DPS at target counts 1/2/3/5/8/15; confirm
`simc_settings.tier == "MID1"`. Merge via `apply-metrics.mjs` (`profiles` key).

### Log a new PTR build
1. Watch Wowhead news RSS (`/news/rss/all`) for "12.1 PTR" + Development Notes/Class
   Tuning/Datamined; fetch the forum thread `.json` for the new post.
2. Add the build entry to `data/ptr-builds.json` (newest first), update affected specs'
   `ptr` writeups if their pass landed, rebuild.

### Community link health (occasional)
Re-render the Wowhead Discord index via r.jina.ai; check creator links via YouTube oEmbed
(`youtube.com/oembed?url=...&format=json`). Flag dead invites for manual review — never
auto-replace.

## Layout

```
data/     specs.json · sources.json · scales.json · ptr-builds.json · community.json ·
          creator-takes.json (qualitative layer — cited specialist takes[] + general-creator
          metaNotes[] season/meta outlook, never tiers) ·
          encounter-tiers.json (per-boss/dungeon Archon tiers) ·
          required-sources.json (refresh contract: required sources, staleness thresholds,
          row floors, anomaly limits) · run-manifest.json (per-run status file — see
          "Run manifest + integrity gates") ·
          pending-transcripts.json (machine transcript queue: agents append/remove,
          the deterministic fetch step drains) ·
          history/ (movement baselines written by snapshot.mjs)
src/      build.mjs · template.html · render.mjs · normalize.mjs · validate.mjs ·
          apply-ratings.mjs · apply-metrics.mjs · snapshot.mjs · serve.mjs ·
          check-refresh.mjs (manifest/freshness/anomaly gates) ·
          fetch-wcl.mjs + fetch-transcripts.mjs (deterministic pre-agent stages —
          the only WCL / transcript-API credential holders)
test/     normalize · validate · render · build · apply-metrics · apply-ratings · check-refresh
dist/     index.html  (generated — open directly in a browser)
docs/     working notes (finder-audit.md · security-audit-2026-07.md ·
          portfolio-audit-2026-07-18.md — audit dispositions)
legacy/   original single-file tracker (pre-conversion reference)
.github/  workflows/deploy.yml (build+deploy Pages on push) · workflows/ci.yml (tests on
          every push) · workflows/freshness.yml (daily staleness heartbeat → alert issue) ·
          dependabot.yml (weekly grouped action-SHA + pip bumps; requirements.txt pins
          yt-dlp) · CODEOWNERS (declares the human-owned boundary: workflows, gate
          contract, scales, registries, gatekeeper code)
.claude/skills/   refresh-tiers · refresh-metrics · ptr-watch · watch-creators
                  (each has the procedure + hard-won gotchas + a log.md memory)
```

Nightly automation lives in `.github/workflows/nightly.yml` (cron 10:37 UTC), split into
isolated stages since the 2026-07-14 security audit (tightened by the same-day
re-audit). First a **deterministic WCL fetch step** — the ONLY process holding
`WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` (step-scoped env) — runs `src/fetch-wcl.mjs` and
writes `wcl-fetch/evidence.json`, uploaded as its own artifact before the agent
starts. A second deterministic stage (`src/fetch-transcripts.mjs`, step-scoped
OPTIONAL `TRANSCRIPT_API_KEY`) drains the agent-maintained
`data/pending-transcripts.json` queue through the Supadata captions API
(`mode=native` — YouTube's own auto-captions; offsets in ms) into
`transcript-fetch/` for the agents to distill; a missing key is a clean
"no-credentials" skip (datacenter IPs can't reach YouTube directly — 2026-07
bot-wall, android-client workaround failed 2026-07-17). Then the **refresh** job runs a PRIMARY agent and — when a deterministic
completion check finds the manifest unwritten or failing (the recurring 07-15→07-17
early-stop failure) — a RECOVERY agent, both Claude
Code headless with a READ-ONLY token (no push/dispatch scopes, checkout credentials
not persisted, yt-dlp preinstalled at the `requirements.txt` pin, action pinned by
commit SHA, NO WCL credentials — the evidence file is their only WCL input) —
ptr-watch + watch-creators + a full tier/metric refresh **every run**
(policy 2026-07-08: no staleness gate — every source is pulled fresh nightly) — then
a final deterministic completion gate (manifest rewritten + tests + build +
check-refresh + WCL-credential health) fails the job with the real reason if the
night is incomplete, and `data/` + skill logs go to the **publish** job as
an artifact. Agent transcripts upload as the `agent-transcripts` artifact every run
and their tails are dumped into the job log on failure — READ THEM before theorizing
about a failed night (they found the 07-15→17 root cause — agents backgrounding slow
polls and ending their turn to "wait" — in one run; subagent tools are disabled and
both prompts carry the single-shot rule for exactly that reason). (`dispatch-nightly.yml` auto-kicks a nightly run whenever a
workflow-file change lands on master, via `gh workflow run` as github-actions[bot] —
`allowed_bots` on the agent steps permits that actor.) A `workflow_dispatch` input
`agent_model` overrides both agents' model for a single run (default
`claude-opus-4-8`) — one-off model trials without editing the workflow. Publish (deterministic, no AI, holds the write token) gates on a
boundary guard ("Gate 0", 2026-07-18 portfolio audit: the artifact may not alter the
gate contract `required-sources.json`, `scales.json`, or registry structure in
`sources.json`/`community.json` beyond their agent-updatable fields — those fail the
night red; agent-shipped `data/history/` snapshots are reset so movement/anomaly
baselines always come from committed history) → `npm test` →
`npm run build` → `node src/check-refresh.mjs --manifest` (which cross-checks WCL rows
against the pre-agent evidence artifact and takes its anomaly ack ONLY from the
human `anomaly_ack` workflow input), then snapshots, stages
explicit paths, commits (title = the manifest summary, sanitized), pushes, and
dispatches deploy.yml (GITHUB_TOKEN pushes don't auto-trigger workflows). Publish
checks out CURRENT master (not the trigger sha), and a push race rebases +
rebuilds the generated dist/ deterministically — any other conflict fails RED
instead of silently dropping the night (2026-07-17 fix: bash `-e` is suppressed
inside a `|| { … }` fallback group, which let a conflicted rebase pass green).
After a successful push, publish runs `src/digest.mjs HEAD^ HEAD` (deterministic
buildPayload diff: tier/projection/source moves, new takes+metaNotes, new builds,
verdict changes, manifest health) and comments it on the pinned "Nightly digest"
issue — GitHub notification mail is the owner's daily change email. A daily
heartbeat (`freshness.yml`) alerts via a single auto-closing issue + red run when the
last refresh signal exceeds 36h (full-timestamp precision via the manifest's
`startedAt`) or a source exceeds its max age. The agent step's only secret is
`CLAUDE_CODE_OAUTH_TOKEN` (~1-year validity — renew), the documented inherent
residual in `docs/security-audit-2026-07.md`. YouTube transcripts may be
IP-blocked on runners; those videos queue as "pending" and catch up in local runs. The
old local scheduled task and claude.ai cloud routine are retired (docs/cloud-routine.md
records why); the local task can still be run manually for transcript catch-up.
