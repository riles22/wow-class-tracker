# Midnight Spec Tracker — 12.1 "Curse of Ula'tek", Season 2 LIVE

Multi-source class/spec performance tracker for WoW Midnight (Patch 12.1, "Curse of
Ula'tek" — LIVE since 2026-08-18; this file's older sections still speak in the PTR-era
voice where they record history).
Data lives in `data/*.json`; a build step compiles it with `src/template.html` into **one
self-contained artifact — `dist/index.html`** — a personal project. It's published as a
public GitHub Pages site (https://riles22.github.io/wow-class-tracker/) that auto-deploys
on push to `master`; the file also still opens directly in a browser.

## Commands

- `npm test` — schema validation + unit tests + build smoke test
- `npm run test:quiet` — the SAME suite through a compact reporter (`src/quiet-reporter.mjs`):
  63 bytes and the exact pass/fail/skip counts when green, full diagnostics with `file:line`
  when red, same exit code. **Use this in agent and interactive sessions.** Default TAP output
  is ~84KB, which the tool harness truncates to a 2KB preview — so a verbose run costs a
  second tool call to find out what failed and never shows the counts. Every deterministic
  gate (ci.yml, deploy.yml, nightly's completion gate, publish Gate 1) deliberately keeps
  verbose `npm test`; `test` is NOT redefined, so pointing an agent here cannot move a gate.
  ⚠️ **Read the skip LINE, not the skip COUNT.** The reporter used to append a Playwright
  warning whenever `skipped > 0`, and the suite has a permanent skip that has nothing to do
  with Playwright (freeze-season's assertion is expired until an outlet leaves S2, i.e.
  months). So every green run carried a false warning — and on 2026-08-23 it worked: it
  convinced a reader the UI invariants had not run when they had, and that was reported to
  the owner. It now NAMES the skipped tests and says `(UI invariants ran)`, switching to
  "skipped INCLUDING the UI invariants" only when a skip really came from that file. Both
  branches are exercised by hiding `node_modules/playwright` — with it absent the run reads
  **347 pass / 27 skipped**, which is exactly what the nightly sees.
- `npm run build` — data + template → `dist/index.html`
- `npm run validate` — data checks only
- `npm run audit:creators` — creator/expert-layer audit (scope, firewall, supersession,
  discovery reachability). A REPORT, not a gate; `--strict` exits 1 on any HIGH finding.
- `npm run serve` — preview `dist/` at http://localhost:8317 (serves every published
  page: `/` → index.html, `/gearing.html` → the gearing explorer, `/s1.html` → the
  frozen Season-1 archive; serve.mjs allowlists each by name)
- `npm run report-card` — grade the frozen pre-launch projection. Pre-settlement it runs in
  DRIFT mode against the CURRENT live consensus. Pre-flip that consensus was 12.0.7 and
  the forecast was *designed* to diverge from it; post-flip (2026-08-18) the live
  consensus IS early S2, so drift is now an unsettled preview of the real answer key —
  still not a grade, because week-one tier lists churn hard.
  Only GRADE mode (after the settled S2 consensus exists — arrives by itself ~09-01 via
  `SETTLE_DAYS`) scores the forecast.
- `npm run gearing:build` — rebuild `gearing/wow-s2-gearing.html`. **Required after any edit
  to `gearing/src/app.template.html`**: the artifact is committed, and a template edit
  without a rebuild publishes nothing (a test pins this since 2026-08-14).
  `npm run gearing:test` runs gearing's tests alone — all **44** of them. It ran only
  `project.test.mjs` (12) until 2026-08-23: Phase A correctly trimmed a five-file enumeration
  to one file, and Phases B and G9 added the guide-harvest and enhancements-parser suites
  without re-extending it, so a third of gearing's tests answered to no gearing command. It is
  a glob now (`node --test "gearing/test/*.test.mjs"`; Node expands it on both shells), so a
  new test file joins automatically — though the root `npm test` already
  discovers them, which is why a broken gearing reds the nightly publish gate.
- `node src/check-refresh.mjs --manifest|--age` — refresh integrity gates (nightly
  publish contract / staleness heartbeat) against `data/required-sources.json`

Always run `npm run test:quiet && npm run build` after any data edit. Never edit `dist/index.html`
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
   grouping); Archon M+ tiers from its **score** tier list. Early-S2 the raid letters read
   from the **Heroic** throughput list (owner decision 2026-08-25 — Mythic was 26/27 specs
   with six under 10 parses; the registry's methodology text carries the switch-back
   trigger, and the Mythic/Heroic NUMBERS stay separate metric families, never mixed).
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
  A source carrying `era: "ptr"` is stored here like any other but is **excluded from the
  consensus** (`consensusFor`) and hidden in the 12.0.7-only view — see the sources.json
  section. Adding one does NOT bump `CONSENSUS_VERSION`: the live source set is unchanged,
  so no movement baseline is invalidated.
- `metrics` rows upsert by (source, bracket, name) — see `src/apply-metrics.mjs`. Each
  may carry `era: "live" | "ptr"` (default live; names containing "12.1 PTR" are
  inferred ptr). At build time every metric gets `rank`/`of` — its position within
  (role, bracket, name), #1 = highest value; all current metrics are higher-is-better
  (extend `metricRanks` in render.mjs with a direction flag before adding one that isn't).
  The UI's Era toggle (which filtered verdicts, writeups, era-tagged metrics and creator
  takes across Both / 12.0.7 / 12.1 PTR) is HIDDEN while `PHASES.ptr` is null — since the
  2026-08-18 flip there is no second era to toggle to; it returns when a 12.2 PTR entry
  is added to `PHASES`.
- `fightProfile.targets` maps target count → sim DPS (best build per count). The build
  derives ST/cleave/AoE labels (canonical counts 1/3/8; a spec missing a count gets a
  null label) as **within-role percentiles across DPS specs** (≥70th = strong, ≤30th =
  weak) plus a row tag (AoE-lean / ST-lean / All-round / Flexible / Low-sims; null when
  no canonical count is comparable). DPS specs only — healers/tanks have no sim basis.
- `ptrDummy` = real-player Dummy Dome logs (WCL zone 52): `{ source, asOf,
  targets: {"<count>": medianRDPS} }`, merged via apply-metrics.mjs `ptrdummy` key.
  A parallel **"Median raw DPS (12.1 PTR Dummy Dome, NT)"** metric series (plain
  `dps`, best-parse-per-player medians) WAS fetched AND merged by the deterministic
  `src/fetch-wcl.mjs` step through the 12.1 PTR cycle (frozen recipe, owner-approved
  2026-07-17; the zone-52/54/56 recipes retired at the 2026-08-18 flip — the stored rows
  are history now) — agents never wrote it, and it never substitutes for the rDPS series
  (honest source typing).
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
  **Creator takes ARE the writeup fallback — but as an aggregate, never promoted into
  `ptr.verdict`** (Riley, 2026-08-03, superseding the 08-02 note that kept them out
  entirely: "we picked these experts for a reason: they are experts"). The distinction is
  the whole point. Writing one take's sentiment into `ptr.verdict` would hand a single
  YouTube video the full dated-verdict outlook shift — Feral has exactly one take — which
  is the "weakest evidence steers" inversion already rejected on the meta nudge. Instead
  `expertRead()` (render.mjs; the model is at PROJECTION_VERSION 13 — the version log lives
  beside the constant and is authoritative, this prose is not) aggregates the whole
  non-superseded PTR-era take set, one vote per creator, shrunk by corroboration.
  **DO NOT TRUST THE COVERAGE NUMBERS BELOW — RECOMPUTE THEM.** They are hand-maintained,
  they go stale within days, and on 2026-08-14 an audit found them not merely out of date but
  wrong in COMPOSITION: they named three raid gaps that were all already closed while missing
  the one that was actually open. Chasing a closed gap wastes a run; missing an open one is
  worse. **BETWEEN CYCLES THE WHOLE LANE IS DORMANT, NOT UNDER-COVERED** (2026-08-19
  audit, E1): `expertRead` era-filters on `PHASES.ptr.marker`, so while `PHASES.ptr` is
  null (since the 2026-08-18 flip, until the 12.2 thread appears) it returns null for
  every spec — the one-liner prints all-40 "no take" lists, the pin test below
  self-disarms, and none of that is data loss (all takes stay intact in
  creator-takes.json; the coverage claims below re-arm, and get re-verified, when the
  next cycle opens). The two-line recomputation, meaningful ONLY while a cycle is open:
  ```
  node -e 'const s=require("./data/specs.json"),t=require("./data/creator-takes.json");
  import("./src/render.mjs").then(r=>{const g=b=>s.filter(x=>!r.expertRead(x,t.takes,b)).map(x=>x.class+" "+x.spec);
  console.log("no writeup:",s.filter(x=>!x.ptr).map(x=>x.class+" "+x.spec));
  console.log("no raid take:",g("raid")); console.log("no mplus take:",g("mplus"));})'
  ```
  Coverage as measured 2026-08-15: **one** spec has no writeup (Demonology Warlock, whose null
  is deliberate — the source reported no changes, and "nothing changed" is not a verdict), down
  from nine; every spec carries at least one live take; and **zero** specs have no RAID-scoped
  take. That last count is the one that matters, because raid is the bracket with almost no PTR
  empirical evidence — the last gap was Brewmaster Monk, a TANK, in the role this file elsewhere
  records as having no PTR raid signal of any kind, and the 08-15 local drain (`a97e260`) closed
  it. **This paragraph is now pinned** by `test/claude-md.test.mjs`, which recomputes the gap
  sets and reds when the prose and the data disagree — added after this exact sentence went
  stale for the fourth time, including once in the very commit whose message announced it was
  closing the gap. The durable fix is still a computed digest coverage line
  (`audit-2026-07-24.md`, D12); until that exists the test is the backstop, but recompute rather
  than read. Since v8 the PROJECTION's
  read is **bracket-scoped** (an explicit `bracket: "raid"|"mplus"|"both"` on the take wins;
  else the patchContext text decides via the same regexes as the meta nudge; naming neither
  → both) — a creator's M+ tier-list read no longer moves raid forecasts. The whole-spec
  outlook ARROW stays unscoped. Take `sentiment` (buff|nerf|neutral|mixed), `patchContext`
  and `date` are validation-enforced model inputs. Since v9 a **quorum panel**
  (≥`EXPERT_QUORUM` = 3 shrunk creators) may move a projection letter by ONE band —
  disclosed in the basis — while smaller panels stay within-tier. **Do not** hand-write a
  `ptr` writeup from a creator take to "fill the gap" — the model already reads them, and
  a fabricated writeup would double-count.

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
  the "X% (was Y%)" idiom is decided by the values). **Classification requires UNANIMITY
  across a line's clauses** (2026-08-01): a line carrying both a buff and a nerf returns
  null and does not vote, because the feed's consolidated one-line-per-spec style makes
  mixed lines common and first-clause-wins scored them off whichever change happened to
  be written first. The zone-54 raid-testing rank is
  named in the basis string for context but never drives the direction.
- **12.1 projection ("Ours: 12.1")**: the tracker's OWN forecast tier list for raid+M+,
  computed in `projectionFor` (render.mjs) — live consensus baseline (w .35 since the v9
  owner reweight, 2026-08-04 — the 12.0.7 prior deliberately takes a minority stake)
  blended with PTR empiricals (zone-54/56 testing percentile w 2 : Dummy Dome w 1;
  total .45 — the percentile is **recentred onto the bracket's live consensus mean** since
  v12, see below) and the external era-gated PTR tier list (w .30, `ptrTierRead`), all
  renormalized when absent (a cell with no PTR evidence still reads 100% prior), shifted
  by outlook direction (±10 at the cap: dated verdict 10 · tally 4/7/10 by line balance ·
  expert-driven ≤9), adjusted by the bracket-scoped expert panel (±6; a ≥3-creator quorum
  may cross one band) and the newest
  general-creator meta read (±3, within-tier), clamped and mapped through the consensus
  bands, with a confidence tag. **A projection is
  NOT a source**: it never feeds consensus (it derives from it), is era-gated out of
  12.0.7-only views, and every surface carries its component basis string.
  **Since the flip the RENDERED "Ours: 12.1" column is the FROZEN 2026-08-11 artifact,
  not a live recomputation** — `frozenForecastActive` (render.mjs) switches the lane so
  post-launch data cannot leak into the graded record; the live computation resumes as
  the next cycle's forecast when a new PTR opens. Tune weights
  in code only — never hand-write `spec.projection`.
  **Confidence is a RATIO, not a count** (v3, 2026-07-31): signals present ÷ signals
  *obtainable* for that spec+bracket — all → high, more than half → medium, any → low,
  none → prior-only. A raw count breaks whenever a signal type arrives with near-universal
  coverage (the PTR tier list rates 38 of 40, and counting it moved 39 of 40 M+ specs to
  "high"), and it permanently capped healers/tanks below "high" for lacking a DPS-only
  Dummy Dome signal they can never have.
  ⚠️ **THE v10 BLOCK BELOW IS HISTORY — ITS CENTRAL MEASUREMENT NO LONGER HOLDS** (checked
  2026-08-15). It says 27 raid cells renormalize to 100% of the 12.0.7 prior. **The real
  number is now 0 of 40**: v13 admitted Wowhead's season-ahead list to `nextPatchTierSources`,
  so every raid cell carries a PTR-era letter opinion, and the v13 note beside
  `PROJECTION_VERSION` records the same thing from the other side ("`noPtrEvidence` cells go
  28→0"). Two consequences of reading it as current: the "Still open — tanks have no PTR raid
  signal of any kind" line at the end of the block is **false**, and the v10 remedies it
  describes (confidence capped at "low", the expert ceiling doubling to ±12) now fire on
  **nothing**, because both are keyed on `noPtrEvidence`. Kept rather than deleted because the
  REASONING is still the best account of why the raid bracket is structurally thin and why
  Robydoby's cut was rejected — but do not quote its numbers, and do not re-open the actions.
  **The raid bracket has almost no PTR empirical evidence, and that is the real reason
  creators read as out of step with us on healers and tanks** (v10, 2026-08-07). Measured:
  M+ is healthy (32% prior for every role), but in RAID the zone-54 series reaches NOBODY
  — `MIN_RANK_N` is 10 and all 34 rows carry n of 1..9 — there is no PTR raid tier list by
  design, and Dummy Dome is DPS-only. So healers 7/7, tanks 6/6 and 14 of 27 DPS raid
  cells renormalize to **100% of the 12.0.7 prior**. Two consequences to keep in mind:
  (a) **lowering the prior weight cannot fix this** — with the other terms absent,
  renormalization gives the prior 100% whatever its weight is, so `.35`→`.20` changes
  nothing; (b) Robydoby's PTR raid cut was tried as the fix and **rejected on measurement**
  (r = −0.43 against Dummy Dome, no sample size on any row, 21 forecasts moved with
  40-point swings) — reasoning is inline at `projectionFor`'s testing lookup, and it must
  not be re-added without new evidence. What shipped instead: confidence caps at "low"
  (never "prior-only", which keeps its v8 meaning of "nothing moved it") whenever a cell
  has no PTR empirical term and no PTR list, and the expert ceiling doubles to ±12 on
  exactly those cells, since specialists are then the only 12.1-aware evidence we hold.
  Band discipline is unchanged. **Still open:** tanks have no PTR raid signal of any kind,
  and the ±12 headroom moves scores but rarely letters, because crossing a band still
  needs a ≥3-creator quorum and most panels are 1–2 creators.
  **The percentile term had a UNITS bug and it was the main reason our letters read low**
  (v12, 2026-08-08). `rankPct` returns a within-(role,bracket) percentile — a uniform grid whose
  mean is **exactly 50 by construction** (verified: DPS/Tank/Healer all 50.00). It carries ORDER
  and no LEVEL, yet it was averaged at ~41% effective weight against two quantities living on the
  letter axis (12.0.7 consensus mean 59.9; the PTR tier list 70.9), dragging every M+ cell toward
  50. It accounted for **−8.9 of the measured −10.5** gap against the external 12.1 read. Fix is a
  LOCATION shift only — `raw − 50 + empiricalAnchor`, the anchor being that bracket's live
  consensus mean, derived per build by `empiricalAnchors()` so no constant can go stale (null when
  a bracket has no consensus, e.g. the S2 window, in which case nothing is shifted). Spread and
  ordering untouched, so this is **not a reweight and does not lift the frozen-weights rule**.
  Measured: out-of-sample level gap −15.2 → −10.2, Spearman 0.552 → 0.541 (noise), sd unchanged;
  **10 published letters moved, all M+, all one band, all upward; raid identical** (the zone-54
  series reaches nobody, so there is no percentile to recentre) and **0 consensus letters**.
  **Two dead ends recorded so they are not re-run.** (a) *Source generosity* — the four live lists
  have mean mapped scores 17 points apart (method 53.4 … icyveins 67.0) and Method's M+ list has no
  S tier at all, so it looks like a stingy source drags the consensus down. It does not:
  mean-centring every source moves **0 of 40** consensus scores, max delta 0.000000, because
  `consensusFor` is an unweighted mean over an identical source set and the offsets cancel
  algebraically. (b) *Rank/Borda aggregation* — agrees with the current consensus at rho 0.985;
  there is nothing to extract. **And the premise to check before any future "our ranks are wrong"
  pass:** held out (icyveins-ptr stripped so it cannot feed our own forecast), this model predicts
  the external 12.1 M+ ordering at Spearman **0.549**, against **0.053** for the carry-forward
  baseline the report card demands we beat, 0.207 for the best single list we hold, and **−0.279**
  for Method. The ordering is the part that works; when the tracker looks out of step, measure
  LEVEL before touching rank.
  **Quorum REMOVED for healers and tanks** (v11, 2026-08-07, Riley — decided against a
  stated objection): one creator may now cross a band edge for those two roles; DPS still
  needs `EXPERT_QUORUM`. Coverage was attempted first and came up empty — a sweep of all
  14 transcribable tank/healer creators found no raid-scoped 12.1 content to distil, and
  all six tanks together hold 8 takes with ZERO raid-scoped. What this knowingly trades is
  the v6 bound against single-source authority: a lone creator can move a published healer
  or tank letter, and for tanks that creator is often the only take on file. Shrinkage
  (1 creator ⇒ ×.33) and the one-edge clamp still apply, so the failure mode is a letter
  one band off on one person's read, not a runaway. It moved two cells on landing — Holy
  Paladin raid A→A+ (2 creators) and **Protection Warrior raid A+→S on ONE creator**,
  which is the cost of the decision made visible. Revisit if take coverage improves.
- **History snapshots are ENRICHED** (2026-07-09): `snapshotStateOf` stores exact
  consensus scores + the projection (tier/score/confidence, no basis strings) alongside
  the classic tiers/ranks. Movement/baseline comparison stays tier/rank-grained — the
  enrichment feeds the drawer **Timeline** sparklines (`historySeries` → payload
  `history`) and is the raw data for the post-launch **forecast report card** (grade the
  frozen pre-launch projection against the first settled S2 consensus).
- **Two one-shot OWNER actions at 12.1 launch — BOTH EXECUTED** (freeze declared
  2026-08-11, phase flip 2026-08-18; kept because the reasoning generalizes to every
  future cycle). `node src/snapshot.mjs --frozen` on the LAST pre-launch
  refresh declares which forecast the report card grades — and also writes the immutable
  forecast artifact `data/forecasts/frozen-<date>.json` (all 80 cells with component
  values + eligibility flags, git SHA, data hash, per-source snapshot dates): the record
  a post-launch audit re-derives the grade from, committed once by the owner and never
  regenerated. The grade itself reports coverage before accuracy, ranking metrics
  (Spearman / NDCG / top-k within role, S-A+ recall) and a carry-forward baseline —
  if the model cannot beat a forecast that just copies the frozen live consensus forward,
  the projection machinery added nothing; the `SNAPSHOT_PHASE` flip below
  says 12.1 is live. One boolean cannot encode both — flip at launch and the first live
  snapshot is a week-one guess rather than an outcome, flip after settlement and
  post-launch data has already leaked into the "frozen" forecast. Without `--frozen`,
  `launchPair` infers the freeze point from recency and a late pre-launch refresh silently
  moves what gets graded (it reports `frozenExplicit: false` when it had to guess).
  The settled side is chosen by date, not by the flip: `SETTLE_DAYS = [14, 28]` after
  launch, because tier lists churn hard in week one.
- **`SNAPSHOT_PHASE` (`render.mjs`) — the 12.1 flip is DONE** (2026-08-18: `"12.1-ptr"`
  → `"12.1-live"`, and the gate below self-silenced as designed; this bullet is the
  playbook for the NEXT cycle's flip). **Gated since 2026-08-02**: `check-refresh --age`
  (the daily heartbeat) fails red once `PHASE_FLIP_DUE` passes with the flip undone, so
  the one action nothing else can detect after the fact now announces itself. The gate
  tests the phase VALUE, so flipping it silences the check permanently — it cannot become
  a standing nag. Update `PHASE_FLIP_DUE` alongside the flip if launch slips. The first non-`12.1-ptr` snapshot is the endpoint
  the forecast report card grades the frozen pre-launch projection against, so nothing
  downstream can infer the boundary if this is missed. Recorded here because a code
  comment is invisible to whoever notices 12.1 going live (2026-07-24 audit, X3).
- **`dataHealth()` (`render.mjs`)** computes the frozen-series banner: every metric,
  `ptrDummy` and `fightProfile` date, grouped BY SOURCE so a stalled non-WCL feed is never
  announced as a Warcraft Logs outage. Staleness is relative to the data's own newest
  date — deliberately clock-free, which keeps it honest when page snapshot dates lie.
- **Zone-54 raid testing covers ALL ROLES** (2026-07-09): healer (hps) and tank cuts
  merge under the SAME metric name as DPS — "12.1 PTR raid testing score (normalized)" —
  so within-role ranks and the projection consume them with no special-casing.
- **The grid is "Console"** (2026-08-22 UX audit, direction C — chosen by Riley from three
  candidates; the audit canvas records the two that lost and why). The row went from five
  columns to **eleven grid items** — star+rank · spec · class · role · overall · raid · M+ ·
  trend spark · profile · notes · chevron — with a mono body at 12px and a 33px row. Measured:
  **27 specs per screen at 1440x900 against 18** before, **13** on a 375px phone against 6, and
  the whole document 10,533px -> 9,564px.
  ⚠️ **The spark header is DERIVED, never a literal.** It read `30d` until 2026-08-23, but
  `SPARK_POINTS` is a point COUNT and the two only agree at a daily cadence — at the real
  one (48 snapshots over 54 days) the window is **11 days**, so the column header was simply
  false, and the true span lived only in a per-row `title=` on a column that renders at
  >=980px, i.e. every landscape tablet, where a title does not exist. `sparkHeadLabel()`
  reads the same `history.dates` the tips do; a UI invariant recomputes it from the payload,
  so no cadence change can make it lie again. Do not hard-code a duration here.  **The two new columns cost NO new data, which is why the direction was affordable.** The
  spark reads `history.specs[key].raid/.mplus` (already shipped by `historySeries()` for the
  drawer Timeline) and the notes line joins `consensus[bracket].perSource`, which already
  carries each source's `label` and `tier`. Two rules on them:
  (a) the spark **starts at the first `history.enriched` point** and never plots the earlier
  tier-midpoint reconstruction — render.mjs is explicit that drawing them alike "reads as a
  score move that never happened", and at 72x14px there is no room for two line styles;
  (b) the notes line shows the **spread**, not the roll-call — `± m+ — Icy Veins S+ ↔ Method A`
  — because listing all four sources overflowed 308px on 9 of 40 rows and ellipsed mid-list.
  The full per-source list stays in the `title`.
  **The notes column is also the touch fix**: it is visible text where a `title=` used to be,
  and the audit counted 367 of the page's 407 tooltips inside the grid.
  (Those were the AUDIT-TIME counts of the problem, not a promise the total would fall. It is
  **490 of 539** now, re-counted 2026-08-23 — the notes cells and spark labels the audit added
  are themselves `title`-bearing, and that is the documented design, since each one has visible
  text beside it. Do not chase the total downwards; check that a new tooltip has a visible
  counterpart, which is the rule that actually matters.)
  Two things the row deliberately GAVE UP: the per-tier `.tscore` within-band meter (the 0-100
  Overall already carries position) and the tier badge plate — the letter is now the only
  saturated colour in the row body. The badge treatment survives in the legend and the drawer,
  where it reads as a swatch rather than as data.
  **Contracts the rebuild had to preserve, and did** (the UI invariants read these by class,
  never by position): exactly **two `.tier` elements per row in raid-then-mplus DOM order**
  with the letter as `textContent`, plus `.spec-txt`, `.cls`, `.newbadge`, `.conf`, `.mv`,
  `.head .hqual`, and `.row[data-idx][role=button][aria-expanded]` with an `inert` `.drawer`.
  `.metaline{display:contents}` is STILL the mechanism that lets the two tier cells be direct
  grid items on desktop and one flex line on the phone — do not remove it.
  **Breakpoint trap, hit once and fixed:** `.sparkcell` declares `display:flex` LATER in the
  sheet than the media query that hides it, so an unqualified `.sparkcell{display:none}` lost
  on source order at equal specificity and the column never hid — 10 grid items in 9 columns
  at 920px. The hide rules are qualified (`.head .sparkcell, .row .sparkcell`) for that reason.
  Item count must equal column count at every width: **11 at >=980px, 9 at 860-979** (spark +
  profile drop), **8 below** (notes drop), and the card layout under 760px.
  `contain-intrinsic-size` is **22px desktop and 60px card, and both are EXACT** — re-measured
  2026-08-23 against the shipped artifact, the content box is 22px and 60px on the nose. Earlier
  prose here claimed real content of 24 and 67 and called the declarations "deliberately low";
  both figures were wrong and the rationale with them. The rule they invoked still holds — OVER-
  estimating shrinks the document under the reader and skips rows — it just is not what these
  values are doing. Re-measure with `getBoundingClientRect().height` minus padding+border on a
  PAINTED row; an unpainted one reports the placeholder back at you.
- **Page weight and reading order** (same audit, stage 3). Measured before: the desktop
  document was **10,533px**, of which the footer was **7,200px (68%)** and the grid 22%; the
  first spec row sat at **890px**, the whole fold on a 1366x768 laptop. After: **5,382px**,
  footer 50%, grid 31%, first row at **637px**.
  Three changes got there.
  (a) **The data-first reading order is no longer phone-only.** The `order` block that fixed
  the phone in Aug 2026 now lives on `.wrap` at every width. Visual order only — DOM order is
  untouched, so the movers-after-caveat invariant still holds — and what stays ABOVE the grid
  is still exactly the honesty surfaces plus the 0-100 note.
  ⚠️ **`.wrap` is now a flex column, and that has a cost that bit once.** Flex items default to
  `min-width:auto`, so a child holding an unshrinkable run of text can push itself wider than
  `.wrap` — which block children never could. `.foot-grid`'s bare `1.1fr .9fr` then sized to
  content and went **582/476 -> 277/916**, wrapping every source row to four lines. Tracks are
  `minmax(0,...)` now and `.wrap > *` carries `min-width:0`. Any new full-width child with
  `white-space:nowrap` inside needs the same care.
  (b) **The patch feed is a dated INDEX.** Each entry was rendering its stored `label`, which
  is a paragraph and not a title — `#buildfeed` alone was 6,535px. The headline is capped on a
  word boundary with the full text in the `title`, and everything past `FEED_OPEN` (4) folds.
  6,535 -> ~700px.
  (c) **The spec drawer is a collapsed accordion**, 4,443px -> ~350px with everything folded.
  Riley chose `<details>` over tabs specifically so find-in-page and a whole-read screenshot
  still reach the content — every section is PRESENT, just closed.
  **The fold is applied in the DOM after assembly (`foldDrawerColumn`), not at the fifteen
  emit sites, and that is deliberate**: the sections are heterogeneous siblings — `.d-sec`,
  `.metrics` and `.srcbreak` carry their own `.d-h` INSIDE, while `.setbox` is preceded by a
  BARE `.d-h` sibling and `.watch` labels itself with a `<b>`. One pairing pass handles all
  three shapes; fifteen string edits would not have. Three traps it encodes:
  `.watch` must be recognised explicitly or it is swallowed into the fold above it; the
  summary label cuts at the first ` —`/` (`/` ·` with a floor of **6** characters (a floor of
  12 leaves "Timeline (" and "Meta outlook (" explaining themselves in the summary); and a
  heading the summary had to TRUNCATE keeps its full text visible inside the fold as
  `.dfold-full` rather than being demoted to a `title=`, which is the exact failure this
  audit exists to fix. `.dfold .dfold-dupe` is two classes deep on purpose — `.watch b` sets
  `display:block` and outranks a single class.
- **The legend is reachable from the top** (audit stage 4). The stage-3 reading order moved
  `#legendwrap` BELOW the grid, so on a first visit the glyphs arrived before their key —
  which made the `? Legend` button in the controls row load-bearing rather than a nicety.
  The sheet reuses the `.finder-ov` shell (inheriting the dialog role, focus handling, trap
  and Escape the other three overlays already had) and CLONES the children of
  `#legendwrap` rather than restating them: one legend, two presentations, so the sheet
  cannot drift from the inline one. The inline block stays exactly where it is — it still
  remembers its own toggle, which is a pinned invariant.
- **The controls fold can no longer strand itself** (audit stage 4). `.ctlsum` is
  `display:none` at >=760px, and the fold's open state is DOM state no media query can
  reach, so the only route back was a matchMedia change event; observed once at 1440px with
  `.controls` 25px tall and every filter, the search and both overlay buttons unreachable.
  `@media(min-width:760px){ .ctlfold:not([open]) > .ctlsum{display:flex} }` makes it
  self-healing — a visible control beats a correct-looking but unusable toolbar.
- **The source list folds per outlet** (audit stage 4): one summary line (name, author, page
  count, freshest date, gold when behind `META.latestSnapshot`) with the pages underneath.
  68 rows was 2,185px and the largest block left in the footer; it is 842px now, and the
  footer 1,374px of a 3,728px document — against 7,200px of 10,533px before the audit.
  **A source with an out-of-step page defaults to OPEN.** Its `.lagchip` is an honesty
  marker and must not be something you go looking for — and the chip is deliberately NOT
  copied onto the summary, because exactly one chip per out-of-step page is a pinned
  invariant that a duplicate would break.
  ⚠️ **The working tree is CRLF** (git autocrlf rewrites it on checkout/merge), so any patch
  script matching multi-line anchors must normalise its newlines to the file's or it
  silently finds 0 matches. This cost a cycle in stage 4.
- **The masthead is a 60px command bar** (audit stage 5, Riley's call after seeing it mocked
  against the shipped grid). The 302px masthead and the 100px health banner were 402 of the
  637px that preceded the first spec row; the page now reaches the grid at **363px** and
  shows **15 specs above the fold** on a 1440x900 screen (27 once the grid is scrolled to the
  top — the two figures answer different questions and both are quoted here deliberately).
  The bar carries the mark, the name in Cinzel at 18px, the patch chip, both site tabs,
  search, and all three tools — **Ladder, Compare all AND the ? legend**. The other seven
  controls stay in two tight rows below it, unchanged. Nothing moved into an overflow menu.
  **Deliberately spent:** the 46px Cinzel wordmark, the `#stars` starfield canvas (and its
  43-line animation IIFE), the animated `.rule`, and the eyebrow. Keeping the starfield
  behind a 60px bar was considered and rejected — it read as a strip of a header that was
  not there.
  **The lede survives, and had to.** It is the only place the premise is stated, so a
  one-line version is always visible in `.pitch` and the full paragraph folds behind
  "How to read it" — which is also where `#tlcount` lives, and a pinned invariant reads it.
  **The health banner is a chip** (`.dh-fold`): 100px -> 31px, expanding to the full banner.
  A caveat should not be the largest thing in the header.
  Two mobile traps this hit, both fixed: the bar wrapped to **253px** on a 375px phone until
  the tool labels were wrapped in `.btw` and dropped to their glyphs under 560px; and the
  patch chip is 192px, which forced its own row — so it has a **short form** (`.pc-short`,
  fed by the new `__ERA_SHORT__` token) rather than being hidden, because era attribution
  has to survive on the device most likely to screenshot the page. Phone bar: 148px.
  ⚠️ **The motion invariant was re-pointed, not weakened.** It probed `.rule`'s animation and
  the `#stars` canvas pixels, both of which are gone; it now reads the `.switch` and `.chev`
  transition durations, which flip with the same control and survive every layout. Its
  stronger checks — overlay/chart entrance classes and animation names — are untouched.
  Note `.chev` transitions two properties, so its duration reads `"0.18s, 0.15s"`.
- **Gearing carries the same bar** (2026-08-22). The 2026-08-05 rebrand aligned the two
  pages; compressing the tracker's masthead broke that alignment in the other direction —
  gearing still had the 179px Cinzel header the tracker had just dropped. Gearing's header
  is now the same 60px `.topbar` with the same anatomy in the same order (mark, name in
  Cinzel 18px, patch chip with a `.pc-short` phone form, separator, both tabs inline), and
  its `header` is 88px against 179 with the first control at **144px** against 603.
  **Its `.sitetab` had to be restyled too, and that is the trap**: gearing keeps its OWN
  copy of the tab CSS, so aligning only the tracker left gearing's tabs as a 42px tab STRIP
  inside a 60px bar and pushed the bar to 86px. Any future change to one page's bar has to
  be made in both templates — they mirror each other by hand, not by shared code.
  `h1` also had to come off its `clamp(28px,5vw,46px)`; the bar's name is `.brandname`.
- **Gearing's BiS rows carry Console's density too** (2026-08-22, the pass after the bar).
  67 rows at 69-105px each made the panel 4,710px; simple rows are **34px** now and the
  panel is 3,896px, with the document 5,612px -> 4,662px at 1440.
  The change that did most of it: `.src` used to be `grid-column:3/5`, i.e. its own second
  line, which cost ~30px a row while roughly **500px sat unused** beside the stat meta at
  1440. It is a fifth column at >=900px and drops back to its own line below that, where
  the width genuinely is not there. Gearing already had a `<=640px` block that stacks meta
  and src onto one column; the new `<=899px` rule sits above it and only covers tablets.
  **The column needs a FLOOR, not just a fraction.** As `minmax(0,1.1fr)` it collapsed to
  58px on rows with wide stat meta and truncated 20 labels; `minmax(140px,1.1fr)` clears
  the longest dungeon name ("Temple of Sethraliss", 132px) and truncation is zero — verified
  across four specs and at 1440 / 800 / 375.
  Console's colour-and-type law holds here as on the tracker: the item NAME stays in the
  body font because it is prose; rank, stat meta and source are mono.
  A `title` was briefly added to `.src` for the truncated cases and then REMOVED once the
  floor made truncation impossible — a tooltip duplicating fully visible text is exactly
  the noise this audit spent its time deleting.
- **Gearing's recommendations panel is a SLOT SHEET** (2026-08-22, Option A of the gearing
  design audit — Riley chose it from three structural options; the canvas records the two
  that lost and why). One row per equipment slot, each a `<details>` that expands to that
  slot's candidates. Sheet **460px** against 2,829px of cards; the panel 3,015 -> 1,755px
  and the document 5,475 -> 2,521px. Rows are 32px desktop / 50px phone.
  **The point of it is the tier merge.** `renderBis` filtered the pool with
  `!TIER_SET_SLOTS.has(it.slot)`, so Head/Shoulder/Chest/Hands/Legs were excluded from the
  recommendations grid entirely and only ever appeared under a tab named after the
  Catalyst — the character was split across two tabs by a game mechanic rather than by any
  question a player asks. Tier slots are ordinary rows now, marked with a `T` badge, and
  the leftover `"Tier slots — guide picks without drop data"` card is gone because those
  picks fold into their own slot rows. A test pins all five tier slots onto the sheet, the
  badge, and the absence of that card.
  Note `renderTier` is NOT the same view for those slots — it is a Catalyst conversion
  planner built from `isCatalystBase`, a different item filter. So the sheet's tier rows
  and the Catalyst tab legitimately show different items: the guide's pick versus the
  conversion bases. Moving the per-slot half of that planner into the slot rows is the
  next stage, with the cross-slot plan staying as a reference page.
  **Trinkets are ONE row covering both slots, deliberately.** The guides rank them as a
  pool and decline to name a pair, so two rows would repeat the same list and assert a
  1st/2nd the sources never gave. The row's body is `trinketCard` whole — a first attempt
  dropped it and would have lost the per-source letter tiers, the dense consensus ranking
  and the "stat fit is never computed" note, all of which are deliberate (G8). The gearing
  test caught that; `.sbody .card` just strips the nested frame.
  **Stage 2 added a per-slot footer** (`slotFooter`): the ENCHANT for that slot and, for a
  tier slot, the CATALYST route (token, base count, direct-tier item, pointer to the full
  plan). Both previously lived on their own tabs, so answering "what do I do about my
  chest" meant visiting three places. Eight of thirteen slots carry a footer for Frost
  Mage — the five tier slots plus every slot the guides publish an enchant for; Back and
  Wrist have none because the harvested data has none, which is data, not a bug.
  **The footer obeys G6 totality**: its consensus chip is gated on `usingCustom`, because
  guide-consensus surfaces must leave `#bis` entirely while custom weights are active. The
  gearing test caught the ungated version — `assert.doesNotMatch(bisHtml, /data-consensus=/)`.
  Note `usingCustom` is `customModeSelected() && !!customWeights()`, so selecting Custom in
  the dropdown without entering weights does NOT engage it; a browser spot-check that only
  flips the select is checking nothing.
  **Deliberately NOT in the footer:** the season-wide item-level ladder. It is identical
  for all thirteen slots, so repeating it thirteen times would be exactly the noise this
  audit exists to delete — it stays one reference page. Per-slot "where and how high" is
  already on each candidate row as its source and its `up to N`.
  ⚠️ **Slicing the sheet in a test: bound by the NEXT `.sname`, never by `</details>`.**
  Every candidate row contains its own item-details disclosure, so the first `</details>`
  after a slot's name closes inside that slot's first row and the slice captures one id
  instead of the whole slot. Both Neck assertions hit this.
- **The six tabs are now the sheet plus a five-item Reference row** (2026-08-22, Option A
  stage 3). `Gear recommendations` stopped being a tab: it is `#p-bis`, always on, and the
  other five — Tier & Catalyst, Enhancements, Upgrade checker, Loot sources, Item levels —
  are `aria-expanded` disclosure buttons in a `<nav class="refrow">` over `role="region"`
  panels, all closed on load. A **tablist was the wrong control** once the sheet stopped
  being one of the alternatives: a tablist asserts that exactly one of its panels is open,
  and here the correct default is none. `activateTab` toggles rather than selects, so a
  second click on the open button closes it. Document 2,531px against 5,475 before the
  option, and the whole page is reachable without opening anything.
  **Three placement defects came out of MEASURING it, not looking at it** — all three now
  pinned in `gearing/test/project.test.mjs`:
  (a) the nav kept the old tab strip’s DOM position, i.e. *above* `<main>`, so the five
  things just demoted to reference were still the first thing under the setup card;
  (b) `weaponLoadoutCards()` emitted before the sheet, putting the first slot row at
  **1,785px** — a setup is chosen as a complete pair so it stays a card, but it is not what
  the page is about, and it now follows the sheet (first slot **593px**);
  (c) ⚠️ **`#bis` is a two-column grid and the sheet has to span it.** Boxed into one 623px
  column, the desktop 8-column row template (min 640px with padding) overflowed **all 13
  rows** and truncated **88 elements** — and the responsive breakpoints could not save it,
  because a media query measures the **viewport**, not the column an element happens to sit
  in. `#bis .sheet{grid-column:1/-1}`; verified 0 truncated elements at 1440 with all 13
  slots open, and 1 at 375 (a long item name meeting `.sitem`’s deliberate ellipsis).
- **The five reference panels got Console density last** (2026-08-22, after stage 3). They
  kept the pre-audit 13px/10px table sizing right through the option, because they were
  behind tabs — demoting the tabs did not shrink them, it only stopped them being the first
  thing on the page. `table.src-tbl` now matches `.shead`/`.srow`: a 9.5px mono uppercase
  header and 6px cell padding, with **cells staying in the body font because they hold item
  and dungeon NAMES**, which is prose — the same colour-and-type law as the BiS rows.
  `table.paths` keeps its `nowrap` (every cell is a number or a difficulty name) and takes
  the density only. Loot sources 2,883 → 2,568px, Item levels 1,474 → 1,255px, row 58 → 49px.
  ⚠️ **This is where the `.src` class collision surfaced, and it was a real page-level bug.**
  `.src` is the generic small-mono meta style — divs, spans and table cells use it across the
  whole page — but the 2026-08-22 BiS density pass gave the bare selector the candidate row’s
  `grid-column:5` + `white-space:nowrap` + ellipsis. `grid-column` is inert on a `<td>`, but
  `nowrap` is not, and a `td` cannot clip the way a grid item does: the Loot sources table
  grew to **2,197px** and the document scrolled sideways to **2,292px at a 1,440px viewport**.
  It shipped in `d91bfa5` and stayed invisible for a day because the panel was behind a tab
  nobody had measured. The truncating behaviour is `.row > .src` now, in both the base rule
  and the two breakpoints; three assertions pin it. When adding a rule to a generic-sounding
  class here, **check where else the name is emitted first** — `.src` has 16 emit sites.
  For the record, the wide `table.paths` at 375px is NOT a defect: it sits in a
  `.card.wide.table-scroll` with `overflow-x:auto`, so the table scrolls and the page does not.
- ⚠️ **`.row` is keyed on its CONTAINER as well as the viewport** (2026-08-23). The BiS density
  pass gave `.row` a fifth `minmax(140px,1.1fr)` track, so the five-track template needs ~600px —
  but the two weapon-setup cards sit in a **~506px** column of the two-column `#bis` grid, and the
  `@media(max-width:899px)` fallback that drops the fifth column **measures the viewport**. Result:
  each card spilled **103px** past its border at every width from **901 to 1280px** — 1100px is an
  ordinary laptop — with the text landing on the neighbouring card and the whole document scrolling
  sideways. `.card{container-type:inline-size}` plus an `@container (max-width:620px)` twin of the
  same rule; the cards keep their side-by-side comparison, which spanning the grid would have lost.
  **This is the THIRD time the viewport-vs-container gap has bitten in one week** (the slot sheet,
  the `.src` collision, this), which is why the fix is general rather than another one-off span.
  Containment is safe here because nothing `position:fixed/absolute` lives inside a `.card` — `#tip`
  and `.skip-link` are both body-level; re-check that before putting a positioned element in a card.
  Verified 0 overflowing rows of 149 at 375 / 950 / 1100 / 1280 with every slot and panel open.
- **Gearing no longer opens on Frost Mage** (2026-08-22). It was a hardcoded
  `sel.value = 'Mage|Frost'` with nothing behind it, so every visitor landed on someone
  else's spec. Order is now: a `#spec=` deep link, then the spec you last looked at
  (`localStorage` key `wow-s2-gearing:spec`), then the top of the list.
  **`localStorage` is `typeof`-guarded like `location` and `history`** — the client-boot
  test runs that source through `new Function("document","innerWidth","innerHeight", …)`
  and an unguarded read throws there instead of failing a useful assertion.
  Two gearing tests had been using the Frost Mage default as an implicit fixture and now
  select the spec they need; one already had a `setSpec` helper it had never called for
  its first assertion. An app default is not a test fixture.
⚠️ **`.tiercell` sizing is coupled to the tier COLUMN width, and the coupling is silent.**
  It is a `34px auto` grid, sized when the tier was a badge plate in a 70px column. Console
  made the tier a bare glyph in a 40px column, which left the `.tind` marker slot **4px**,
  so the ±, the ▲▼ arrows and the projection's ●●● dots all overflowed into the 30d column
  — visible, ugly, and nothing errored. In the row it is a flex run now and the tier
  columns are **54px**; the worst case measured is 32px (projection view, letter + arrow +
  ± + three dots). Re-measure `scrollWidth` against `clientWidth` across all 80 cells in
  BOTH the consensus and projection views if either width changes again.
- **Between-cycles copy residue** (same audit, stage 3). All keyed on `PHASE.ptr` so they
  self-heal when the next cycle opens, rather than on data that has to be remembered:
  the masthead stamp says **"Latest class tuning"** rather than "Latest PTR build" when there
  is no PTR (a live tuning post falls back to `kind: "build"`, so the kind alone could not
  tell — this was the mislabel render.mjs's own residue note exists to catch); the footer
  heading is a **"patch feed"** between cycles; the **"PTR verdict" sort option hides** when
  the era filter is rendering no verdict chips; the lede states **both bracket counts** when
  the consensus is split, because a single figure contradicted the toolbar two rows below it;
  and the movers strip reframes from "Into 12.1" to **"Forecast vs. live consensus"** once the
  forecast is frozen, labelled **"not yet a grade"** — week-one tier lists churn hard and the
  report card only scores after `SETTLE_DAYS`, so a verdict there would overclaim.
- **Accessibility baseline** (same audit, stage 1). `.wrap` is `<main id="main">` with a
  focus-revealed `.skiplink`; the footer stays INSIDE main because the phone reading order is
  a flex `order` on `.wrap` and moving it out would break that, so it carries an explicit
  `role="contentinfo"`. `#toolstatus` is `role="status" aria-live="polite"` — it already held
  the count, so that was the whole fix — and the empty state has a **Clear filters** button
  (role + search + starred + PTR-only) because a filtered-to-nothing grid was a dead end.
  `@media(pointer:coarse)` now reaches `.starbtn` (32x44; it measured **15x13**), the
  disclosure summaries (44) and footer links (26, above the 24x24 AA floor — 44 each would add
  thousands of px to a footer we are trying to shrink).
  **`CLASS_COLOR_TEXT`** lifts the three official class colours that miss 4.5:1 as 11px text —
  Death Knight 3.27, Demon Hunter 3.48, Shaman 3.97 — to `#D45E76`/`#BE5AE0`/`#3E93E8`. The
  canonical `CLASS_COLOR` stays on the 4px `.cbar` and the compare dots, where the small-text
  ratio does not apply. Every other colour on the page already passes.
  **Two audit findings were RETRACTED on implementation, and must not be "fixed" again.**
  (1) The three overlays are already correct dialogs: `role="dialog"` + `aria-modal` + a label
  on the **panel** (not the backdrop), focus to the close button on open, restore to the opener
  on close, and a Tab trap. An audit that inspects the backdrop, or checks `activeElement`
  synchronously before the `setTimeout` that moves focus, will wrongly report all four missing.
  (2) Ignoring `prefers-reduced-motion` is DELIBERATE, not an oversight — `ui-invariants`
  emulates `reducedMotion: "reduce"` and then asserts motion stays ON, because the reference
  site does and this one ships a persisted control instead. Changing it reds that invariant by
  design; it is an owner decision, and the live argument for revisiting is that gearing honours
  the OS while the tracker does not.
- **Client-side UX lanes** (template-only, no build step): URL-hash deep links (state +
  open drawer, `applyHash`/`writeHash`), localStorage watchlist (★ + Starred filter),
  the "What changed" strip (narrates the movement-baseline diff), and Compare (pin ≤3
  specs side by side; era-gates the projection rows like every other surface).
  **⊞ Compare all** is the full-roster matrix (built 2026-08-03, `docs/compare-all-scope.md`):
  40 specs as rows against every source letter, the consensus, the forecast and the metric
  ranks, sortable and filterable per column. Its one non-obvious idea is the
  **role-polymorphic rank column** — 28 metric families collapse to ~5 because ranks are
  already computed within (role, bracket, name), so "WCL median" resolves to rDPS / tank
  rDPS / HPS by the row's role. Two absences render differently and must stay that way:
  `·` = no such measurement exists for that role, `—` = it exists but has not landed.
  Covered by six UI invariants. The overlays (Ladder / Compare / Compare all)
  deep-link via `view=` + short per-overlay params since the 2026-08-03 UI/UX pass;
  exploration state (search text, column filters) deliberately stays out of the URL.
  A `view=` naming an overlay that no longer exists is an inert no-op — the param is
  dropped and the rest of the link still applies (verified when the Finder was removed).
- **Touch legibility** (2026-08-05, from external mobile feedback): `title` does not
  exist on a phone, and **262 of the page's 288 tooltips sit inside the grid** — so every
  hover-only explanation is invisible on touch. Two consequences were fixed and both must
  be preserved: (a) the 0–100 Overall score is explained in VISIBLE text directly above
  the grid (a tester read the column as arbitrary; the honest answer is that 100 = every
  source's top tier and the consensus letter turns S at 88, so "100 = S" is wrong); and
  (b) `.head` is `display:none` under 760px, which meant the column qualifiers ("12.0.7" /
  "12.1 forecast" / "<boss> · Archon") — added precisely so a screenshot cannot
  misattribute the letters — were invisible on mobile. `fightHead` now also returns a bare
  `qual`, threaded into `rowHTML` as `quals` and rendered in the mobile-only `.mtag`.
  **Any new explanatory `title=` in the grid needs a visible counterpart or it does not
  exist for half the audience.**
- **Shared brand across both pages** (2026-08-05): the gearing page reads as the same
  site as the tracker, not a different product. The palette already matched (rebrand
  2026-08-04); the VOICE did not, which is what made the tab jarring. Gearing now uses the
  tracker's masthead vocabulary — mono eyebrow, brand mark, Cinzel title at the same size /
  letter-spacing / text-shadow, the animated `.rule` (with a reduced-motion guard it
  previously lacked). **Its three webfonts are EMBEDDED as base64 woff2, not linked**
  (Cinzel 700 + Inter and JetBrains Mono as variable latin subsets, ~124KB base64 total):
  `gearing/README.md` promises a fully offline single file, so a Google Fonts link would
  silently break that guarantee. All three are OFL-licensed. Two traps if you touch this:
  the mono stack must list `'JetBrains Mono'` FIRST (it was `ui-monospace,"JetBrains
  Mono"`, so the system face won and the embed did nothing), and the check that matters is
  `url(http…)` count in the built HTML — an external *anchor* href is fine, an external
  font/style URL is not.
- **Gearing deep link + CSP** (2026-08-07, the last two Phase-B items). Each spec drawer
  carries a **⚙ Gearing** link to `gearing.html#spec=<slug>`, where `<slug>` is the
  tracker's own `slugOf()` — **one identifier vocabulary across both pages**, verified
  1:1 for all 40 specs in both directions with no collisions (safe because
  `gearing/data/specs.json` is generated from the tracker's, and the lookup still fails
  soft: an unknown slug falls back to gearing's default rather than breaking the page).
  Gearing reads it in `specFromHash()` and writes it back with `replaceState` on change
  only, so an untouched URL stays clean. **Gearing now ships its own hashed CSP**, built
  the same way as the tracker's but STRICTER — `default-src 'none'` with no external
  origin at all, because its fonts and item icons are data: URIs. Three traps here:
  (a) `gearing/src/build.mjs` must normalize CRLF→LF *before* hashing or the hash is
  unmatchable from a Windows checkout; (b) the gearing client-boot test evaluates the app
  through `new Function("document","innerWidth","innerHeight", …)` — there is **no
  `location` and no `history`** in that scope, so every URL touch in gearing's client code
  must be `typeof`-guarded or that test dies; (c) the injection UI invariant's relative-href
  allowlist is now a pinned regex accepting `index.html`/`gearing.html` with an optional
  `[a-z0-9=&-]` fragment — `slugOf` can only emit that charset, so no roster value can
  widen it.
- **Footer order** (2026-08-05, Riley; amended at the 2026-08-18 launch review): the
  footer opens with **Sources & snapshot dates** and the build feed, then the "Past
  seasons" archive links and the credits. The `.footbrand` identity block this bullet
  used to place was REMOVED entirely at the launch review — do not reintroduce it.
- **Site tabs** (2026-08-05): the masthead ends in a two-tab strip — **Spec Tracker**
  (`index.html`) and **⚙ S2 Gearing** (`gearing.html`) — mirrored at the head of the
  gearing page, which lost its old one-way `.backlink`. Gearing used to be a fourth CTA
  button in the controls row, which read as a tool *inside* the tracker rather than the
  separate page it is. Consequences to keep in mind: `src/serve.mjs` now routes an
  allowlisted page set instead of always serving `index.html` (otherwise the tab is a
  local no-op), and the injection UI invariant's relative-href allowlist is exactly
  `index.html` + `gearing.html` — any other relative href is still a finding.
- **Fight view**: `data/encounter-tiers.json` holds Archon per-boss (throughput) and
  per-dungeon (score) tiers — single-source by design, labeled as Archon in the UI; the
  Fight selector swaps the matching tier column. Refresh alongside the tier lists.
  **Season-gated since the 2026-08-19 launch review**: the selector hides (and `fight=`
  deep links go inert) while the file's `season` stamp ≠ `PHASES.liveSeason` — so it is
  HIDDEN right now, until Archon's S2 encounter rebuild lands and stamps `s2`. The
  per-boss/per-dungeon/survivability REGISTRY pages are `ancillary: true` in
  sources.json (2026-08-19 audit, C1): era-verify still writes their `seasonVerified`
  for the record, but they no longer gate the letter consensus — they feed this file
  and drawer metrics, never the mean.
- `spec.tierSet` = the Season 2 set bonuses as fact: `{ set2, set4, asOf, source }`,
  official-notes/datamine-sourced (host-allowlisted). The drawer's "Season 2 tier set"
  box renders it as the primary line with the writeup's `ptr.set2/set4` as commentary
  beneath. **ptr-watch must update it whenever a build's notes touch a set bonus**
  (asOf = build date, source = the forum post) — the tier-set upkeep gate in
  validate.mjs fails the run when a set-touching build highlight lands without the
  spec's `tierSet.asOf` catching up.
  **Since 2026-08-23 the same upkeep is checked one page over** (owner decision): gearing keeps
  its OWN copy of `set2/set4/asOf` and renders it as fact, and nothing compared the two, so they
  drifted **five times** — most recently publishing "Genesis duration increased by 4 seconds" on
  one page of the site while the other said 8. The daily `--age` heartbeat was the sole detector
  and the nightly originally could not clear it, so every occurrence waited for a human local
  run. `validateData` now compares
  `gearing/data/specs.json` against `data/specs.json`. Resynchronize with
  `node gearing/src/harvest-specs.mjs && node gearing/src/harvest-specs.mjs --check && npm run gearing:build`.
  **Since 2026-09-05 the trusted nightly publish stage runs that local synchronization before
  Gate 1**, then explicitly stages the gearing data and artifact. This is the root validator
  reaching INTO `gearing/`, which it otherwise never does — read-only, one-directional, an absent
  subproject skips, and only specs present in BOTH are compared so a lagging roster is not an
  error. Consequence to know: **bumping a tracker `tierSet` now requires syncing the mirror in the
  same change**, which is why the upkeep gate’s own test bumps both.
- `spec.survivability` = Archon's raid survivability tier (merge via apply-metrics.mjs
  `survivability` key) — shown in the drawer's Source ratings box.
- `spec.playstyle` = `{ range: "Melee"|"Ranged", mobility: 1-5, utility: 1-5, complexity: 1-5, notes }`,
  guide-sourced (Icy Veins strengths/weaknesses + difficulty ratings); merge via
  apply-metrics.mjs `playstyle` key (or `complexity` key to merge just that field).
  Surfaced in the **Compare** overlay's Mobility / Utility / Complexity rows.
  It used to feed the **Spec Finder**, a weighted-scoring quiz over the whole roster —
  **removed 2026-08-05** (Riley) along with its CSS, its 281-line IIFE and its
  `view=finder` deep link. `.fopt`/`.fopts` and the `.finder-*` overlay shell survive it:
  The Ladder's series picker uses the former, every modal on the page uses the latter, so
  the names are legacy rather than dead code. Keep harvesting playstyle — Compare reads
  it — but there is no longer a quiz to feed, and `docs/finder-audit.md` is history now.

### `data/sources.json` — source registry
Kinds: `tier-list` (toggle button + consensus; needs `scale`), `metrics` (numbers in
drawers), `notes-feed` (PTR build feed), `reference` (footer link only), `community`
(community-layer registry entries). Each has `pages[]` with `bracket`, `role`,
optional `label`, `url`, `snapshot` (ISO date) and optional `published` (the date the PAGE
states about itself — never later than `snapshot`).
Optional **`seasonVerified`** (`"s1"|"s2"`, per page — written by refresh-tiers'
era-verify step) records which SEASON the page actually described at refresh. The
permanent rule (S2 transition, DECISION 1): a list feeds a bracket's consensus only when
its page for that bracket describes the current live season (`PHASES.liveSeason`,
normalize.mjs — the single era vocabulary; the 12.1 launch and every later cycle is a
config edit there + SNAPSHOT_PHASE, pinned by a test so the flip is deliberate).
Mid-transition the consensus honestly shrinks ("consensus of 2") and recovers as pages
update; the toolbar count, Source select and footer registry all say who is lagging —
and since 2026-08-19 the toolbar says BOTH brackets' counts when a transition splits
them ("consensus of 3 (raid) · 4 (M+) sources"), because one number would overstate a
bracket. Pages marked **`ancillary: true`** (Archon's per-boss/per-dungeon/survivability
cuts — encounter-tiers/metrics inputs, never letter inputs) are OUTSIDE the season gate
in both `sourceSeasonOk` and `aheadSeasonFor` (2026-08-19 audit, C1: Archon's retired,
un-reverifiable S1 per-dungeon page was keeping its fully S2-verified M+ lists dark).
The flag is registry structure — Gate-0 protected, added only as a reviewed human edit.
**The rule cuts BOTH ways, and until 2026-08-09 only one direction existed.** Seasons were
compared for equality alone, so "behind" and "ahead" were the same fact — then Wowhead
published its Season-2 lists early and every surface said it was *lagging*. `PHASES` now
carries **`seasonOrder`** (oldest first, declared — never string-compared, or "s10" sorts
below "s2") and **`seasonLabels`**; `aheadSeasonFor(source, bracket, liveSeason)` returns
the season an outlet has moved ahead to, or null. Two refusals are deliberate: a bracket
whose pages are split across seasons (mid-rebuild) returns null and the source goes DARK
for that bracket — out of the consensus and out of the forecast, never mixing two seasons
in one term; and a bracket carrying `seasonVerified` on some pages but not others THROWS,
because the field is agent-writable and an unwritten one would silently switch 27-46% of
a raid forecast.

**Two things consume "ahead", and they are different lanes:**
- **`nextPatchTierSources`** (= `era: "ptr"` OR season-ahead) is the 12.1 forecast's
  external-letter input — see `ptrTierRead` under the projection. Keying on SEASON rather
  than `era` is what makes the flip free: the outlet leaves the forecast and re-enters the
  consensus with no owner action. **Do not "fix" this by retyping a live source to
  `era: "ptr"`** — measured, that nulls 80 of 80 consensus cells at the phase flip, because
  `consensusFor` drops non-live era BEFORE the season test.
- **The FROZEN LANE** (`data/season-final.json`, `frozenLettersFor`) supplies that outlet's
  LAST letters about the live season, so the mean keeps its composition. Contributors are
  tagged `lane: "frozen"` with `frozenAsOf`. Without it, an outlet flipping recomposes the
  mean and the ▲▼ engine narrates a registry decision as spec movement (16 cells the night
  Wowhead flipped, the largest on record); if all four flip before the phase flip the column
  blanks entirely (measured: 80 of 80 null). Restoration is exact — 0/80 tier, score, spread
  and perSource-set diffs against the pre-flip commit. Staleness cost at Wowhead's own
  observed rate of S1 change: **0.24 letters of 80** over nine days.
  The archive is **derived and append-only**: `node src/freeze-season.mjs` walks git history
  for the newest commit whose own `sources.json` still verified that page at the live season
  and lifts that commit's letters, never overwriting an existing record, erroring rather than
  guessing. **Never hand-write it.** It runs in the nightly's publish job between Gate 0 and
  Gate 1 (publish has `fetch-depth: 0`; the refresh job's shallow checkout cannot answer the
  question, which is why it is not agent-side) and as step 4 of a local run. Gate 0 treats it
  as immutable alongside `required-sources.json`/`scales.json`, so an agent that writes it
  fails the night red. The READ side goes cold by itself at the flip: the lookup is keyed by
  season, so `seasonFinal[liveSeason]` is simply absent — measured, consulted in 0 of 80 cells.
  **The WRITE side does not, and that asymmetry was a real defect** (fixed 2026-08-11).
  `sourceSeasonOk` is a bare inequality: it is equally false for an outlet that has moved
  AHEAD and one lagging BEHIND, so freeze-season froze both. Simulated at the flip, method and
  archon — both still s1 — each gained raid+mplus records lifted from `e65332a`, the commit
  that *added* `seasonVerified` and where no page carried it, because the loose test matches
  vacuously wherever the field is absent. That is 159 letters of stale opinion written as a
  permanent record (the archive is append-only), moving 36 of 80 consensus letters, with no
  self-repair and nothing in validation to catch it — `validate.mjs` checks membership, era,
  roster and scale, never direction. The gate is now `aheadSeasonFor(...) != null`, and the
  history walk requires an **explicit** `seasonVerified === liveSeason` so it throws "Refusing
  to guess" rather than landing on a pre-2026-08-05 commit. A lagging outlet simply drops out
  of the consensus, which is what DECISION 1 already specifies.
Optional **`era`** (`"live"` default | `"ptr"`) marks a source whose ratings describe a
patch we are not running: an `era: "ptr"` tier list keeps its toggle button, its column,
its drawer row and its projection input, but `consensusFor` skips it and the 12.0.7-only
view disables it. A typo'd era fails validation rather than defaulting to live, and a
registry with no live-era tier list fails too (the consensus would have nothing to
average). Currently NONE: `icyveins-ptr` (the 12.1 cycle's M+-only PTR list) was retired
in the 2026-08-18 flip commit — removed from the registry, ratings and contract, its
letters superseded by the live Icy Veins S2 pages. Its scale deliberately REMAINS in
`data/scales.json` (test-pinned) as the template for the next cycle's era-gated source,
and the retirement one-shot's pin now guards the next flip rather than this one. All URLs must be https:// —
validation enforces it, plus host allowlists on every agent-writable URL field
(creator-take/metaNote citations, writeup + tier-set sources, community discord/creator
links, PTR build-feed links — the approved-host sets live in `src/validate.mjs`; a new
legitimate host fails the run red and is added there as a reviewed code edit).

### `data/scales.json` — tier scales + normalization
Each scale maps tiers onto one 0–100 axis; consensus = mean of available tier-list scores
mapped through `consensus.bands`, divergence dot when spread ≥ `spreadThreshold`.
Adding a tier-list source = config edit here + registry entry + backfill. No code changes.
**`consensus.bands` is mirrored in prose in two places in `template.html`** (2026-08-05):
the always-visible note above the grid ("S from 88 up") and the legend's full band line.
Editing the bands means editing both — a visitor reading a stale threshold off the page
is the same misattribution problem the column qualifiers exist to prevent. Adding a
*source* still needs no code change; only moving the BANDS does.

### `data/ptr-builds.json` — 12.1 PTR build feed (newest first)
Per build: `{ date, label, forumPostNumber, forumUrl, wowheadUrl, icyveinsUrl,
specsAffected[], highlights[] }`. Canonical source: the official forum thread
(`thread` key) — each PTR build is a new reply post, machine-readable via Discourse
`.json`. **A new patch cycle means a NEW thread** — re-discover via Wowhead news RSS.
**`specsAffected` and `highlights` must agree** — a coverage gate in validate.mjs fails
the run when a spec named in `specsAffected` receives no line that `specBuildChanges`
would surface (class-wide lines count, via build membership). Added 2026-08-01 after an
audit found the four earliest builds under-distilled at seeding: build #1 named 39 specs
but carried 6 lines, so 30 specs' 12.1 changes reached no drawer and never entered the
outlook tally for six weeks — every field individually well-formed, the two just never
checked against each other. All four (#1/#6/#10/#11) were backfilled from the forum
posts; drawer coverage went 118 → 190 spec-build entries.
Dense builds use ONE consolidated line per spec (see #16) — which is why
`classifyHighlight` requires clause unanimity; see PROJECTION_VERSION v4.

**`kind: "patch-notes"` is the consolidated LAUNCH notes and is a different animal**
(2026-08-07). Kinds are `build` (default) | `hotfix` | `patch-notes`. The patch notes are
the **authority on what actually ships** — where they differ from a PTR build, they win,
and the drawer says so: they render in their own gold "Shipping in 12.1" block above a
"How it got here — PTR development notes" list, because stacking them as one undated pile
read as redundant AND implied the superseded incremental figures were still live (Holy
Priest's +10% then +5% are superseded by the notes' +16%).
**They are excluded from the outlook tally, and being authoritative is exactly why.**
The tally counts LINES; the notes are one paragraph per spec restating the whole patch, so
mechanically they are unreadable to it: 34 of 49 lines classify null (a paragraph holding
both buffs and nerfs fails the unanimity rule), which would silence 28 of 40 specs if they
were the only input, and the ones that do classify can be flat wrong — Holy Priest's line
("All healing +16% … mana cost -30%") scored as a **nerf**. Counting them *alongside* the
builds also double-counts, since every launch line restates builds already tallied.
Verified before the change: all 40 specs present in the notes also appear in earlier
builds and none relies on them as its only source, so excluding them loses no signal;
0 outlook directions moved, 12 specs' stated line counts were corrected, and a phantom
nerf disappeared from Holy Priest. `PROJECTION_VERSION` deliberately NOT bumped — outputs
are numerically identical, so the snapshot series stays comparable.
**The honest limitation this leaves:** the tally measures the direction of tuning ACROSS
THE PTR, not the shipping delta. Revisit after the forecast report card, with the weights
unfrozen.

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

### Tier lists (every `tier-list` source — currently Icy Veins / Method / Wowhead / Archon)
*(WoWMeta was retyped to `kind: "metrics"` on 2026-07-31 — its letters clustered on player
count, not performance, and its HTML transport served a 130-day-old prerender. It now
publishes `lowerBound` as a number; recipe in the refresh-metrics skill.)*
1. Fetch each page in `sources.json` live; era-verify (the CURRENT live season per
   `PHASES.liveSeason` — S2 since 2026-08-18 — and Devourer in DPS lists).
   Archon: parse the `__NEXT_DATA__` JSON script tag from raw HTML (WebFetch markdown
   drops it); raid = throughput tierList, M+ = score tierList.
2. Write rows `[{class, spec, bracket, source, tier}]` (exact roster names) to a scratch
   file → `node src/apply-ratings.mjs <file>` (refuses on unmatched rows).
3. Update `snapshot` dates in `sources.json`; `npm run test:quiet && npm run build`.

**`icyveins-ptr` LEFT this loop at the 2026-08-18 flip** (added 2026-07-31, retired with
the cycle): the live Icy Veins S2 pages carry its letters now, and the source is out of
the registry and the contract. The rules it taught survive for the NEXT cycle's era-gated
source: era-verify the OTHER way (the page must self-identify as the NEXT patch, never
the live season), **TBD is written as explicit `null`** (never omitted, never guessed),
and the page's own `published` date rides alongside `snapshot`.

### Metrics (Warcraft Logs / Murlok / Archon numbers / SimC / Mythicstats / Bloodmallet / Robydoby)
1. WCL: **zone 53 = LIVE S2 raid** (partition 1, Mythic difficulty **5** size 20, 9
   encounters) and **zone 55 = LIVE S2 M+** (partition 1) — currently NO fetch path
   (transport outage; the wcl-live-* heartbeat red is owner-accepted 2026-08-18, see the
   contract rows). Retired-cycle map: zone 46 = S1 raid (Mythic = difficulty **5**,
   size 20, partition 3 = 12.0.7);
   zone 47 = M+ S1 (difficulty **10**, size 5, partition 1); zone **54 is the 12.1 PTR raid**;
   zone **56 is the 12.1 PTR M+** ("Mythic+ Season 2 (PTR)", same recipe as zone 47 →
   metrics "Median rDPS/HPS (12.1 PTR M+ testing[, tank])", see the ptr-watch skill);
   zone **52 is the Dummy Dome** (fixed-target-count PTR dummies → `spec.ptrDummy`, see
   the ptr-watch skill); zone **57 is Tidebound Grotto** — probed exhaustively 2026-07-28 and
   re-confirmed 2026-08-14 as having **0 encounters**: WCL has never aggregated it, so every
   statistics table returns "No statistics have been collected…". Empty is not an error:
   ingest nothing and leave the stored rows and snapshot alone. Reserved metric names and the
   verified recipe are in the ptr-watch skill, so a run auto-ingests the moment tables
   populate — all PTR data era-tagged `"ptr"`.
   **The SEASON-2 LIVE zones, enumerated against the API 2026-08-14** (they exist but read
   `frozen` until the content opens): raid = zone **53** "The Venomous Abyss", partition
   **1 = "12.1"**, Mythic difficulty 5 / size 20, **9 encounters**; M+ = zone **55** "Mythic+
   Season 2", partition **1 = "Season 2"**, difficulty 10 / size 5. **Live and PTR zones share
   a NAME** — 53/54 are both "The Venomous Abyss", 55/56 both "Mythic+ Season 2" — so tell
   them apart by the partition LABEL (`12.1`/`Season 2` vs `PTR`) and the encounter count
   (53 has 9, PTR 54 has 8), never by the id pattern. Partition IDS RESTART PER ZONE: both
   live S2 zones use partition `1`, so the "partition 3 = 12.0.7" model above is a fact about
   zone 46 only. **And zone 46's own default partition has already moved to `4 = 12.1`**, so a
   zone-46 fetch that omits the partition now returns 12.1 data under a 12.0.7 label — the
   recipes pin 3, keep it that way. Get ids from `node src/wcl-probe.mjs`, never a pattern,
   and note the probe must enumerate through `worldData.expansions { zones }`: the flat
   `worldData.zones` query returns 42 of the 66 zones and omits 53 and 55 specifically.
   Statistics-table
   endpoint needs `X-Requested-With: XMLHttpRequest` + browser UA + Referer; response is
   an HTML fragment with unclosed `<td>` — parse leniently. **Fetch each cut fresh every
   run** — the automation no longer gates fetches on staleness or a once-daily cap (policy
   2026-07-08: pull everything every run). The sanctioned long-term path is still their
   free v2 GraphQL API (OAuth client); keep the mechanical retry/backoff so fetches
   succeed.
   ⚠️ **The HTML statistics transport is currently DEAD, and not just from CI** (measured
   2026-08-14 from Riley's residential IP): every statistics-table request returns **HTTP 403
   with a Cloudflare challenge** — zones 46, 52 and 54 alike, with the documented headers.
   The residential-IP workaround that justified local runs no longer applies to THIS source.
   GraphQL is healthy on the same credentials (OAuth fine, 3600 points/hour, `dps`/`default`
   return data), so the standing split holds: the rDPS-family series stay frozen and honest
   rather than being substituted from the `dps` family, and zone 54's cross-boss normalized
   score still has no API analogue at all. Do not read a 403 as "unreachable, try later"
   without checking whether it is the challenge — that is a transport change, not an outage.
2. Murlok meta pages: plain GET (r.jina.ai does NOT work on it).
3. Write `{ "metrics": [...], "profiles": [...] }` to a scratch file →
   `node src/apply-metrics.mjs <file>`; `npm run test:quiet && npm run build`.

### Fight profiles (Bloodmallet)
`GET https://bloodmallet.com/chart/get/talent_target_scaling/castingpatchwerk/{snake_case_class}/{spec}`
per DPS spec; take best-build DPS at target counts 1/2/3/5/8/15. Merge via
`apply-metrics.mjs` (`profiles` key).
**A source's fight-profile pool may only ever hold ONE sim tier, and for bloodmallet that
tier must be RECORDED** (uniformity gated in validate.mjs since 2026-08-15; the recording
requirement — `SIM_TIER_REQUIRED` — since 2026-08-20). Read `simc_settings.tier` off each
chart into `profiles[].tier` — never hard-code the expected value, it moves each season
(`MID1` → `MID2` for S2). Uniformity alone was NOT enough: an absent tier is its own
bucket, so a pool where nobody carried the field passed as one null group. That was the
real state until 2026-08-20 — 0 of 26 profiles had a tier, and a partial merge that simply
OMITTED it passed validation with **0 errors** (verified; with the requirement in place the
same merge now reds with 18). The stored 26 were backfilled to `MID1` from the
refresh-metrics log's own contemporaneous record, changing no sim value or date. `fightLabels`
pools every DPS profile into one flat array with **no provenance key** and derives the
ST/cleave/AoE labels and row tag as within-role percentiles over it, and the tiers are not
comparable: MID2 measured a mean **1.79×** MID1 (range 1.114–2.563, varying by spec AND
target count, so no scale factor reconciles them — and percentiles are scale-invariant, so
"normalising" is a no-op). Merging a partial re-sim therefore publishes *which specs the
source has re-simmed* as if it were spec strength: on the 14-of-27 roster of 2026-08-15,
all 24 "strong" labels would have gone to the 14 re-simmed specs and none to the other 12,
with two specs published as "Low-sims" purely for not being re-simmed yet. **Adopt a new
tier wholesale or not at all.** This is the only gate aimed at MIXING; `check-refresh`'s
value-move guard measures MAGNITUDE and takes a human `value_move_ack`, so the night that
ack is given for a legitimate wholesale adoption is exactly the night a partial merge would
otherwise sail through. Note a wholesale adoption WILL need that ack (64 of 156 sim rows
move >60%), and the "adopt what exists, null the rest" shape is separately blocked by the
row floor (`rows.min` 15) and the row-drop gate (floor 19 of 26, which takes no ack).
**`fightProfile.asOf` is the CHART's own timestamp, per spec — never the run date.** It is in
the payload (`timestamp` / `metadata.timestamp`), and the specs genuinely differ. Stamping today
defeats the staleness gate exactly, because `required-sources.json` measures bloodmallet off
`fightProfile.asOf` itself — for a month that hid 31-day-old sims behind a 5-day threshold
(corrected 2026-08-08). Honest dates mean the manifest row is `partial` whenever upstream has not
re-simmed, and the heartbeat goes red; that red IS the signal. Recipe and the transient-error
gotcha live in the refresh-metrics skill.

### Log a new PTR build
1. Watch Wowhead news RSS (`/news/rss/all`) for "12.1 PTR" + Development Notes/Class
   Tuning/Datamined; fetch the forum thread `.json` for the new post.
2. Add the build entry to `data/ptr-builds.json` (newest first), update affected specs'
   `ptr` writeups if their pass landed, rebuild.

### Creator transcript breadth — local vs nightly (2026-08-08, Riley)
Title-filtering before a transcript fetch is **run-mode dependent**, because the two
transcript sources cost wildly different amounts. A **local run uses yt-dlp and must NOT
keyword-filter** — fetch every unseen video from a tracked creator and let the transcript
decide, bounded by DATE instead of title: only videos published on or after the **cycle's
OPENING build — the OLDEST date in `data/ptr-builds.json`**, 2026-06-18 for 12.1, since a
video predating the cycle cannot discuss it. Take the DATE, never an index: that file is
stored newest-first, so `builds[0]` is the most RECENT build and reading it as the bound
would cut the sweep two months short (this sentence said "first entry" until 2026-08-14).
That bound is load-bearing. Dropping the title
filter alone exposes **435 unseen videos**, not the ~42 the change was reasoning about,
because every newly-added creator has their ENTIRE 15-entry RSS feed unseen (Tactyks 15/15,
J-Funk 15/15, Dorki 15/15, and eleven more) and RSS reaches back years; 182 of those predate
the 12.1 cycle outright. The cycle bound cuts the sweep to ~253 and reads from the build
feed, so it moves with the cycle automatically at 12.2. If a sweep is still too large take
newest-first — never re-introduce keyword filtering as the limiter.
The title is a bad predictor: the 2026-08-08 local run filtered 42 of 47 videos on
titles and thereby skipped **Tactyks and J-Funk entirely**, the two creators added days
earlier to close Protection Paladin and Windwalker, because their uploads read "dungeon
guide" — and a Method guide author's dungeon guide routinely carries spec analysis. The
**nightly keeps the filter**: Supadata's free tier is **100 requests per MONTH**
(`PER_RUN_CAP = 25` is only the per-run guard), so an unfiltered nightly would exhaust the
month in two runs. Corollary that is easy to get wrong: **fetch broadly, queue narrowly** —
`pending-transcripts.json` is drained by the paid API, so a local run must not queue the
title-irrelevant videos it happened to fail on. Expect `skipped[]` to grow; that is the
point, since a verified skip costs one fetch once while a title guess costs the take
forever.

### Community link health (occasional)
Re-render the Wowhead Discord index via r.jina.ai; check creator links via YouTube oEmbed
(`youtube.com/oembed?url=...&format=json`). Flag dead invites for manual review — never
auto-replace.

## Layout

```
data/     specs.json · sources.json · scales.json · ptr-builds.json · community.json ·
          community-overrides.json (OWNER-curated community edits, applied at prebuild; agents
          may not edit it — Gate 0 applies it before its boundary diff, so an agent edit
          fails the night red —
          see apply-community-overrides.mjs) ·
          creator-takes.json (qualitative layer — cited specialist takes[] + general-creator
          metaNotes[] season/meta outlook, never tiers) ·
          encounter-tiers.json (per-boss/dungeon Archon tiers) ·
          required-sources.json (refresh contract: required sources, staleness thresholds,
          row floors, anomaly limits) · run-manifest.json (per-run status file — see
          "Run manifest + integrity gates") ·
          pending-transcripts.json (machine transcript queue: agents append/remove,
          the deterministic fetch step drains) ·
          season-final.json (each source's FINAL letters about the live season —
          derived + append-only, written ONLY by src/freeze-season.mjs, immutable to
          the nightly agent via Gate 0; feeds consensusFor's frozen lane) ·
          season-archive/ (frozen per-season FINAL STANDINGS records — written ONLY by
          src/freeze-season-archive.mjs, a one-shot owner action in flip week BEFORE the
          flip commit touches PHASES; append-only, Gate-0 immutable. Each <season>.json
          renders as the static archive page dist/<season>.html + a footer "Past
          seasons" link — DECISION 6, s2-transition-scope.md) ·
          history/ (enriched movement/timeline snapshots written by snapshot.mjs)
src/      build.mjs · template.html · render.mjs · normalize.mjs · validate.mjs ·
          apply-ratings.mjs · apply-metrics.mjs · apply-community-overrides.mjs
          (prebuild/prevalidate — hard-fails if absent) · snapshot.mjs · serve.mjs ·
          freeze-season.mjs (deterministic season freeze — publish job + local-run step 4) ·
          freeze-season-archive.mjs + render-season-archive.mjs +
          season-archive-template.html (the season-archive lane: one-shot freeze →
          script-free static page with its own default-src 'none' CSP; refuses
          non-current seasons and overwrites) ·
          digest.mjs (per-run change digest) ·
          check-refresh.mjs (manifest/freshness/anomaly gates) ·
          fetch-wcl.mjs + fetch-transcripts.mjs (deterministic pre-agent stages —
          the only WCL / transcript-API credential holders) ·
          fetch-published.mjs (deterministic pre-agent page-self-date evidence —
          no credentials; feeds check-refresh's published gate) ·
          report-card.mjs (`npm run report-card` — grades the frozen pre-launch projection
          against the settled post-launch consensus; pre-settlement it runs in DRIFT mode,
          where the answer key is the CURRENT live consensus the forecast is designed to
          diverge from, so "misses" there are expected and only GRADE mode scores accuracy) ·
          audit-creators.mjs (`npm run audit:creators` — the creator-layer invariants) ·
          assets/ (favicon + apple-touch icons, copied into dist/ by build.mjs) ·
          quiet-reporter.mjs (the AGENT lane's `node --test` reporter — `npm run test:quiet`;
          counts + full red diagnostics in 63 bytes against TAP's 84KB. No gate uses it and
          `npm test` is deliberately not redefined) ·
          wcl-probe.mjs (dispatch-only WCL/diagnostic probe, no standing role — also carries
          the S2 zone ENUMERATION the flip's WCL contract swap reads its zone ids from)
test/     normalize · validate · render · build · apply-metrics · apply-ratings ·
          check-refresh · claude-md (pins THIS file's numeric claims against the code and
          data that own them — added 2026-08-15 after an audit found nothing checked
          CLAUDE.md against reality and it had been calling a 7-band scale 6-band since
          521ceaf; when it reds, fix the prose, never the assertion) ·
          community-overrides · digest · escaping · fetch-transcripts ·
          fetch-wcl · fetch-published · freeze-season · report-card · season-archive ·
          snapshot · ui-invariants (the ONLY tests that execute template.html's
          client JS — they need Playwright, which is deliberately not a dependency, so
          `npm test` SKIPS them on a machine without it and CI runs them in its own job.
          NOTE: Riley's local checkout HAS playwright + chromium resolved, so `npm test`
          there runs the whole suite with 0 skipped and really does execute them — do not
          read a green local run as "the UI invariants were skipped". Treat any pass/skip
          COUNT written here as stale on sight and read it off the run instead; as of
          2026-08-15 it is 25 invariants inside 401 total. After any template.html
          change, run them for real:
          `npm i --no-save playwright@1.61.1 && npx playwright install chromium && npm test`)
dist/     index.html + gearing.html  (generated — open directly in a browser; the two
          LIVE pages, linked to each other by the masthead tab strip)
          + s1.html — the frozen Season-1 archive page (footer-linked; one
          <season>.html per season-archive record — serve.mjs and the injection
          invariant's href allowlist name each one explicitly)
docs/     working notes (finder-audit.md — HISTORY, the Spec Finder was removed
          2026-08-05 · security-audit-2026-07.md ·
          cloud-routine.md · portfolio-audit-2026-07-18.md · audit-2026-07-23.md ·
          audit-2026-07-24.md · audit-2026-07-25-premerge.md ·
          audit-2026-08-19.md (the post-flip audit) — audit dispositions.
          Read the NEWEST audit before proposing work: its "Still open" and "Leave alone"
          sections record what has already been decided, and re-litigating them wastes a
          run. **Do not take this list's ordering as the recency ordering** — it is
          hand-maintained and has already fallen behind once (until 2026-08-14 it stopped
          at 07-24 while 07-25-premerge existed, so an obedient reader picked the wrong
          "newest"). `ls docs/` is the authority. ·
          adr-simc-reference-pipeline.md + adr-simc-curated-profiles.md — the gearing SimC
          lane's ADRs, which gearing-s2-scope Phase A RETIRED (2026-08-18) — history now ·
          era-prose-scope.md — the launch-label mechanism (build-time era tokens) ·
          archive/ — preserved run logs from a retired agent runtime; a RECORD, not
          instructions, and historically wrong about the project as it now stands.
          token-audit-2026-08-15.md — the context/token audit: the Read tool's 262,144-byte
          hard gate (specs.json and creator-takes.json are still over it), why the skill logs
          were pruned and why the parser traps had to be promoted into SKILL.md first, and
          the agent-lane quiet test reporter.
          projection-audit-2026-08.md — the 12.1 model audit, with the frozen-weights
          recommendation. compare-all-scope.md — the design record for ⊞ Compare all
          (BUILT 2026-08-03), including the deltas between scope and build.
          s2-transition-scope.md — the SCOPED Season-2 transition plan (2026-08-04,
          owner decisions locked inline): launch-week machinery, the
          transition-window consensus rule (S2-verified sources only + count chip),
          the frozen forecast's on-page grading, the PTR-surface sunset (AMENDED
          2026-08-12: happens AT the flip, not +14 — ptrSunset is deleted in the flip
          commit), the Season-1 archive page (DECISION 6, 2026-08-12), the
          12.2-cycle generalization (PHASES constant), and the gearing-lane stub.
          Phase-1 machinery LANDED and the flip executed 2026-08-18 (the runbook's
          checklist is fully done; see git log around 5e92824).
          s2-flip-runbook.md — the operational 08-18 flip checklist (execution mode:
          LOCAL RUN, chosen 2026-08-12); read it before touching anything flip-related.
          s2-flip-test-patch.diff + s2-flip-test-patch-verify.md — the PRE-STAGED flip-day
          test patch and its verification log. The patch is applied INSIDE the flip commit
          (`git apply docs/s2-flip-test-patch.diff`) and is what makes `npm test` land green
          at the flip state; it is LF-pinned in .gitattributes so its hunks stay byte-exact.
          Re-verified 2026-08-14: applied to the current tree it reds exactly the two
          deliberate flip-only pins (check-refresh's age gate, normalize's PHASES
          vocabulary) and nothing else — that is the check to re-run if it is ever edited.
          gearing-s2-scope.md — the SCOPED gearing overhaul (2026-08-12, eight owner
          decisions G1-G8 locked): guide-consensus ranking replaces sim-derived weights, the
          SimC reference pipeline is REMOVED from gearing (it also un-pins the six gear
          data files blocking the re-harvest), three guide sources (Icy Veins + Wowhead
          + Method) are harvested with SCOPED stat priorities (hero talent × bracket ×
          fight profile), and the per-boss/dungeon "game plan" joins the ranked
          candidates to the `droppedBy` field the client already carries and never
          reads. Also: the healer model lane retires with SimC, `custom` weights survive
          as a full override that must ANNOUNCE itself on ranked surfaces, one "Build"
          selector replaces the two SimC-fed ones (the guides' scoping axes are ragged —
          1 to 3 published priorities per spec — so a 2-axis grid would invent cells),
          and trinket letter tiers stay per-source, which keeps trinkets deliberately
          OUTSIDE the top-5 ranking. **ALL FIVE PHASES LANDED 2026-08-18** (after the
          flip, honoring the sequencing constraint — gearing's tests run under the root
          `npm test`, so landing earlier would have broken the nightly publish gate),
          plus the G9 enhancements lane 2026-08-19: the SimC pipeline is GONE from
          gearing/, guide-consensus ranking is live, and the memory note "Gearing S2
          overhaul complete" records the same from the session side.
          published-gate-scope.md — the page-self-date integrity gate (2026-08-04,
          both owner decisions locked; BUILT same day): deterministic published-evidence
          step + staleness threshold, severity split dishonesty-red/lag-heartbeat.
          Closes the gap that let the 08-02 icyveins-ptr rebuild go unseen for two
          days while the manifest claimed success.)
**Creator-layer invariants** (audit 2026-08-08, `npm run audit:creators`). The qualitative
layer spans three surfaces — `classes[].creators`, `generalCreators[]`, and
`takes[]`/`metaNotes[]` — with rules that lived only in prose until an audit found FOUR
HIGH defects that all passed `npm run validate`:
1. **A transcribable creator MUST carry a `channelId`.** Without one, RSS discovery skips
   it every run while the flag advertises a video lane that is never polled. Azortharion
   and Gamz sat that way for weeks; both turned out to be WRITTEN authorities (their takes
   cite hackmd and Wowhead) and are now `transcribable: false`. Kyrasis' id was sitting
   unparsed inside his own url.
2. **The firewall runs BOTH directions.** A creator may hold specialist `takes[]` OR sit in
   `generalCreators[]`, never both — otherwise `projectionFor` counts one voice twice, in
   the expert lane (up to ±12 on a prior-only cell) and again as the ±3 meta nudge. Only
   the metaNotes direction was enforced; validate.mjs now blocks both. Dratnos tripped it
   the day it landed and stayed a Warrior specialist.
3. **Supersede only across DIFFERENT dates.** Several live takes sharing one date are one
   video yielding several discrete claims, which is allowed. Different-dated live takes for
   one (creator, spec, lens) are a real defect — `expertRead` averages a creator's live
   takes, so a stale one dilutes the current read.
4. **An unscoped entry is not automatically wrong** — Kalamazi genuinely covers all three
   Warlock specs, confirmed by four Maximum panels. The defect is an entry implying breadth
   the content does not show; the audit reports those as phantom authority rather than
   narrowing anything by itself.
**Twitch VODs cannot feed the take pipeline** (tested 2026-08-08): enumeration works with
no auth (`yt-dlp --flat-playlist twitch.tv/<user>/videos`, titles are informative), but
Twitch serves NO captions — `--list-subs` returns "has no subtitles". The distiller runs on
captions, so Twitch is a manual LEADS signal at best, never an automated take source.

gearing/  the Season 2 gear & loot explorer — a SELF-CONTAINED subproject (own data/,
          harvesters, validator, tests, build → gearing/wow-s2-gearing.html; see
          gearing/README.md). Imported 2026-08-04 from the standalone project; audited
          in docs/s2-transition-scope.md (Decision 4). The tracker build copies its
          artifact to dist/gearing.html (copy-if-present); the shared site tabs link to it.
          Since 2026-09-05, gearing-refresh.yml refreshes Icy Veins, Wowhead and Method
          guides weekly (Tuesday 08:37 UTC) and on manual dispatch. Loot/rule-source
          harvests remain manual. Its tests run under the root `npm test` (node --test
          discovers them). Read-only input coupling: harvest-specs derives capabilities
          from the tracker and reviewed local armor, weapon and fallback inputs; nothing
          in gearing/ writes outside gearing/. Nightly publish synchronizes and rebuilds
          the gearing mirror. structuralSync.checkedAt records local consistency only;
          source evidence dates and the historical 12.0.7 fallback review date stay intact.
legacy/   original single-file tracker (pre-conversion reference)
.github/  workflows/deploy.yml (build+deploy Pages on push) · workflows/ci.yml (tests on
          every push) · workflows/freshness.yml (daily staleness heartbeat → alert issue) ·
          workflows/nightly.yml + workflows/dispatch-nightly.yml (the refresh + its
          auto-kick) · workflows/gearing-refresh.yml (weekly verified guide refresh) ·
          workflows/wcl-probe.yml (dispatch-only WCL/diagnostic probe) ·
          dependabot.yml (weekly grouped action-SHA + pip bumps; requirements.txt pins
          yt-dlp) · CODEOWNERS (declares the human-owned boundary: workflows, gate
          contract, scales, registries, gatekeeper code)
.claude/skills/   refresh-tiers · refresh-metrics · ptr-watch · watch-creators ·
                  local-run · paste-discord
                  (each has the procedure + hard-won gotchas + a log.md memory)
```

**The 26 UI invariants now run against every nightly commit** (2026-08-23 owner decision):
`ci.yml` gained `workflow_dispatch` and the publish job dispatches it after pushing. They had
never run on a nightly — a `GITHUB_TOKEN` push does not trigger `on: push`, and the job’s own
`npm test` passes them as SKIPPED (373 tests, 27 skipped, exit 0) because Playwright is
deliberately absent, so 43 nightly commits deployed unchecked. Dispatched rather than gated:
`ci.yml` states the browser lives nowhere near the release path and that posture was kept, so a
UI break is found minutes AFTER the push, not before it. The dispatch is `continue-on-error` —
a dispatch hiccup must never redden a good publish; the ci.yml run reddens on its own.

Nightly automation lives in `.github/workflows/nightly.yml` (cron 10:37 UTC), split into
isolated stages since the 2026-07-14 security audit (tightened by the same-day
re-audit). First a **deterministic WCL fetch step** — the ONLY process holding
`WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` (step-scoped env) — runs `src/fetch-wcl.mjs` and
writes `wcl-fetch/evidence.json`, uploaded as its own artifact before the agent
starts. Since 2026-09-05, `src/fetch-source-health.mjs` also probes the two ordinary
public Archon DPS routes and writes `source-health/evidence.json` (separate artifact).
The prompts read this availability evidence before attempting the normal refresh;
a reachable payload still needs normal season, coverage and source-date checks, and
a blocked page never advances a stored data date. The transcript stage
(`src/fetch-transcripts.mjs`, step-scoped
OPTIONAL `TRANSCRIPT_API_KEY`) drains the agent-maintained
`data/pending-transcripts.json` queue through the Supadata captions API
(`mode=native` — YouTube's own auto-captions; offsets in ms) into
`transcript-fetch/` for the agents to distill; a missing key is a clean
"no-credentials" skip (datacenter IPs can't reach YouTube directly — 2026-07
bot-wall, android-client workaround failed 2026-07-17). The published-date stage
(`src/fetch-published.mjs`, no credentials) records what each published-bearing
registry page says about its own update date into `published-evidence/evidence.json`
(artifact, pre-agent) — the publish gate cross-checks stored `published` values
against it and the heartbeat alarms past `published.maxAgeDays`
(docs/published-gate-scope.md; an unreachable page degrades the cross-check, never
red). Then the **refresh** job runs a PRIMARY agent and — when a deterministic
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
both prompts carry the single-shot rule for exactly that reason). (`dispatch-nightly.yml` auto-kicks a nightly run when a
change to **`nightly.yml` or `dispatch-nightly.yml` specifically** lands on master (its
`push.paths` filter — NOT any workflow file; e.g. a `wcl-probe.yml` edit does not
trigger it), via `gh workflow run` as github-actions[bot] —
`allowed_bots` on the agent steps permits that actor.) A `workflow_dispatch` input
`agent_model` overrides both agents' model for a single run (default
`claude-opus-5`) — one-off model trials without editing the workflow. Publish (deterministic,
no AI, holds the write token) first runs `src/check-refresh-base.mjs` against the immutable
workflow `${{ github.sha }}` BEFORE downloading refresh output. It requires that base to
be an ancestor of current master and rejects newer `data/` or skill-log edits, so an older
artifact cannot overwrite them; code-only advances may proceed through the full rebuild.
It then gates on a
boundary guard ("Gate 0", 2026-07-18 portfolio audit: the artifact may not alter the
gate contract `required-sources.json`, `scales.json`, or registry structure in
`sources.json`/`community.json` beyond their agent-updatable fields — those fail the
night red; `data/season-final.json` is immutable to the agent for the same reason and by
the same gate; agent-shipped `data/history/` snapshots are reset so movement/anomaly
baselines always come from committed history) → **`node src/freeze-season.mjs`** (the
deterministic season freeze: any outlet whose pages flipped season tonight has its final
live-season letters lifted from git history, so the consensus keeps its composition
instead of publishing a recomposition as spec movement — needs publish's `fetch-depth: 0`,
which is why it cannot run agent-side) → deterministic gearing capability sync,
`harvest-specs.mjs --check` and `npm run gearing:build` → `npm test` →
`npm run build` → `node src/check-refresh.mjs --manifest` (which cross-checks WCL rows
against the pre-agent evidence artifact and takes its anomaly ack ONLY from the
human `anomaly_ack` workflow input), then snapshots, stages
explicit paths, commits (title = the manifest summary, sanitized), pushes, and
dispatches deploy.yml (GITHUB_TOKEN pushes don't auto-trigger workflows). Publish
checks out CURRENT master (not the trigger sha), subject to the refresh-base guard above.
**A rejected push now fails RED and requires a full refresh against current master**
(2026-09-05): no automatic rebase or partial rebuild may publish an untested merged tree.
After a successful push, publish runs `src/digest.mjs HEAD^ HEAD` (deterministic
buildPayload diff: tier/projection/source moves, creator-video activity from the
pending-transcripts queue diff (distilled / verified-skipped / queued / waiting),
new takes+metaNotes, new builds, verdict changes, manifest health) and comments it
on the pinned "Nightly digest" issue — GitHub notification mail is the owner's
daily change email. A daily
heartbeat (`freshness.yml`) alerts via a single auto-closing issue + red run when the
last refresh signal exceeds `maxRunAgeHours` in `data/required-sources.json` (28h since
2026-07-25; that file is the single source of truth for the number) or a source exceeds
its max age. The A1 blind spot is FIXED (2026-07-24 audit): the history-snapshot
proof-of-life signal now counts only when strictly newer than the manifest date, so a
same-dated snapshot can no longer cap the measured age at 24h and mask a missed night.
Margin is thin by design — a healthy night reads ~5h and a single miss ~28.6h — so a
nightly that lands after ~13:23 UTC re-opens the gap; widen the freshness cron or lower
the threshold if start times drift later. The agent step's only secret is
`CLAUDE_CODE_OAUTH_TOKEN` (~1-year validity — renew), the documented inherent
residual in `docs/security-audit-2026-07.md`. YouTube transcripts may be
IP-blocked on runners; those videos queue as "pending" and catch up in local runs. The
old local scheduled task and claude.ai cloud routine are retired (docs/cloud-routine.md
records why); the local task can still be run manually for transcript catch-up.

**Weekly guide publishing** (`gearing-refresh.yml`, 2026-09-05) shares the nightly
publisher lock. Each of the three active guide harvesters runs independently with
`--force`; failed or incomplete source verification preserves that source's published
file. `src/check-gearing-guides.mjs` checks source identity, per-spec verification,
dates and unexpected coverage losses before local capability sync, gearing build,
`npm test` and the root build. Only the three guide files, capability mirror and
generated artifacts are staged. A push race fails rather than rebasing; a successful
push dispatches deployment and browser checks. The final step still fails the run if
any provider failed, even when successfully verified providers were published. The
freshness heartbeat continues to age-check current guide evidence; the historical
12.0.7 stat fallback is checked for preserved contents and provenance rather than
being presented as a periodically refreshed live feed.
