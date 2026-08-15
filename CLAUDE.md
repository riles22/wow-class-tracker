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
- `npm run audit:creators` — creator/expert-layer audit (scope, firewall, supersession,
  discovery reachability). A REPORT, not a gate; `--strict` exits 1 on any HIGH finding.
- `npm run serve` — preview `dist/` at http://localhost:8317 (serves both published
  pages: `/` → index.html, `/gearing.html` → the gearing explorer)
- `npm run report-card` — grade the frozen pre-launch projection. Pre-settlement it runs in
  DRIFT mode against the CURRENT live consensus, which the 12.1 forecast is *designed* to
  diverge from, so its "misses" and its confidence breakdown are not accuracy measurements.
  Only GRADE mode (after the settled S2 consensus exists, ~09-01) scores the forecast.
- `npm run gearing:build` — rebuild `gearing/wow-s2-gearing.html`. **Required after any edit
  to `gearing/src/app.template.html`**: the artifact is committed, and a template edit
  without a rebuild publishes nothing (a test pins this since 2026-08-14).
  `npm run gearing:test` runs gearing's tests alone — though the root `npm test` already
  discovers them, which is why a broken gearing reds the nightly publish gate.
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
  A source carrying `era: "ptr"` is stored here like any other but is **excluded from the
  consensus** (`consensusFor`) and hidden in the 12.0.7-only view — see the sources.json
  section. Adding one does NOT bump `CONSENSUS_VERSION`: the live source set is unchanged,
  so no movement baseline is invalidated.
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
  worse. The two-line recomputation, which takes seconds and is always right:
  ```
  node -e 'const s=require("./data/specs.json"),t=require("./data/creator-takes.json");
  import("./src/render.mjs").then(r=>{const g=b=>s.filter(x=>!r.expertRead(x,t.takes,b)).map(x=>x.class+" "+x.spec);
  console.log("no writeup:",s.filter(x=>!x.ptr).map(x=>x.class+" "+x.spec));
  console.log("no raid take:",g("raid")); console.log("no mplus take:",g("mplus"));})'
  ```
  Coverage as measured 2026-08-14: **one** spec has no writeup (Demonology Warlock, whose null
  is deliberate — the source reported no changes, and "nothing changed" is not a verdict), down
  from nine; every spec carries at least one live take; and **one** has no RAID-scoped one
  (**Brewmaster Monk**). That last count is the one that matters, because raid is the bracket
  with almost no PTR empirical evidence — and note it is a TANK, the role this file elsewhere
  records as having no PTR raid signal of any kind. The durable fix is a computed digest
  coverage line (`audit-2026-07-24.md`, D12), still unbuilt; until it exists, recompute rather
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
  12.0.7-only views, and every surface carries its component basis string. Tune weights
  in code only — never hand-write `spec.projection`.
  **Confidence is a RATIO, not a count** (v3, 2026-07-31): signals present ÷ signals
  *obtainable* for that spec+bracket — all → high, more than half → medium, any → low,
  none → prior-only. A raw count breaks whenever a signal type arrives with near-universal
  coverage (the PTR tier list rates 38 of 40, and counting it moved 39 of 40 M+ specs to
  "high"), and it permanently capped healers/tanks below "high" for lacking a DPS-only
  Dummy Dome signal they can never have.
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
- **Two one-shot OWNER actions at 12.1 launch, and they are DIFFERENT events**
  (2026-08-03, external audit). `node src/snapshot.mjs --frozen` on the LAST pre-launch
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
- **`SNAPSHOT_PHASE` (`render.mjs`) is a one-shot OWNER action at 12.1 launch**: flip
  `"12.1-ptr"` to the live Season-2 id. **Gated since 2026-08-02**: `check-refresh --age`
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
- **Footer order** (2026-08-05, Riley): the footer opens with **Sources & snapshot dates**
  and the build feed; the `.footbrand` identity block sits BELOW them, above the credits.
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
- `spec.tierSet` = the Season 2 set bonuses as fact: `{ set2, set4, asOf, source }`,
  official-notes/datamine-sourced (host-allowlisted). The drawer's "Season 2 tier set"
  box renders it as the primary line with the writeup's `ptr.set2/set4` as commentary
  beneath. **ptr-watch must update it whenever a build's notes touch a set bonus**
  (asOf = build date, source = the forum post) — the tier-set upkeep gate in
  validate.mjs fails the run when a set-touching build highlight lands without the
  spec's `tierSet.asOf` catching up.
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
update; the toolbar count, Source select and footer registry all say who is lagging.
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
average). Currently one: `icyveins-ptr` (M+ only) — and note it does NOT self-repair at
the flip: at `liveSeason: "s2"` it still occupies the next-patch slot on all 40 M+ cells
while describing the season we are running. Retyping or merging it is an 08-18 one-shot
(pinned by a test so the behaviour cannot be inherited silently). All URLs must be https:// —
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
1. Fetch each page in `sources.json` live; era-verify (Midnight S1, Devourer in DPS lists).
   Archon: parse the `__NEXT_DATA__` JSON script tag from raw HTML (WebFetch markdown
   drops it); raid = throughput tierList, M+ = score tierList.
2. Write rows `[{class, spec, bracket, source, tier}]` (exact roster names) to a scratch
   file → `node src/apply-ratings.mjs <file>` (refuses on unmatched rows).
3. Update `snapshot` dates in `sources.json`; `npm test && npm run build`.

**`icyveins-ptr` is in this loop too** (added 2026-07-31) — same fetch, same
`apply-ratings.mjs`, but it era-verifies the OTHER way: the page must self-identify as
**12.1 / Season 2**, not Season 1. M+ only (no PTR raid list exists — do not invent one),
6-band scale including **B+**, and specs the page marks **TBD are written as explicit
`null`**, never omitted and never guessed. It also carries `published` (the page's own
date, from JSON-LD `dateModified` / the "Last UPDATED" line) alongside `snapshot`. It has
its own row in `required-sources.json`, so a run that skips it fails the publish gate.

### Metrics (Warcraft Logs / Murlok / Archon numbers / SimC / Mythicstats / Bloodmallet / Robydoby)
1. WCL: zone 46 = live S1 raid (Mythic = difficulty **5**, size 20, partition 3 = 12.0.7);
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
   `node src/apply-metrics.mjs <file>`; `npm test && npm run build`.

### Fight profiles (Bloodmallet)
`GET https://bloodmallet.com/chart/get/talent_target_scaling/castingpatchwerk/{snake_case_class}/{spec}`
per DPS spec; take best-build DPS at target counts 1/2/3/5/8/15; confirm
`simc_settings.tier == "MID1"`. Merge via `apply-metrics.mjs` (`profiles` key).
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
          wcl-probe.mjs (dispatch-only WCL/diagnostic probe, no standing role — also carries
          the S2 zone ENUMERATION the flip's WCL contract swap reads its zone ids from)
test/     normalize · validate · render · build · apply-metrics · apply-ratings ·
          check-refresh · community-overrides · digest · escaping · fetch-transcripts ·
          fetch-wcl · fetch-published · freeze-season · report-card · season-archive ·
          snapshot · ui-invariants (the ONLY tests that execute template.html's
          client JS — they need Playwright, which is deliberately not a dependency, so
          `npm test` SKIPS them on a machine without it and CI runs them in its own job.
          NOTE: Riley's local checkout HAS playwright + chromium resolved, so `npm test`
          there runs the whole suite with 0 skipped and really does execute them — do not
          read a green local run as "the UI invariants were skipped". Treat any pass/skip
          COUNT written here as stale on sight and read it off the run instead; as of
          2026-08-14 it is 24 invariants inside 385 total. After any template.html
          change, run them for real:
          `npm i --no-save playwright@1.61.1 && npx playwright install chromium && npm test`)
dist/     index.html + gearing.html  (generated — open directly in a browser; the two
          pages the site publishes, linked to each other by the masthead tab strip)
          + <season>.html per season-archive record once one exists (footer-linked
          frozen archive pages, e.g. s1.html — serve.mjs and the injection invariant's
          href allowlist name each one explicitly)
docs/     working notes (finder-audit.md — HISTORY, the Spec Finder was removed
          2026-08-05 · security-audit-2026-07.md ·
          cloud-routine.md · portfolio-audit-2026-07-18.md · audit-2026-07-23.md ·
          audit-2026-07-24.md · audit-2026-07-25-premerge.md — audit dispositions.
          Read the NEWEST audit before proposing work: its "Still open" and "Leave alone"
          sections record what has already been decided, and re-litigating them wastes a
          run. **Do not take this list's ordering as the recency ordering** — it is
          hand-maintained and has already fallen behind once (until 2026-08-14 it stopped
          at 07-24 while 07-25-premerge existed, so an obedient reader picked the wrong
          "newest"). `ls docs/` is the authority. ·
          adr-simc-reference-pipeline.md + adr-simc-curated-profiles.md — the gearing SimC
          lane's ADRs, which docs/gearing-s2-scope.md Phase A retires ·
          era-prose-scope.md — the launch-label mechanism (build-time era tokens) ·
          archive/ — preserved run logs from a retired agent runtime; a RECORD, not
          instructions, and historically wrong about the project as it now stands.
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
          Phase-1 machinery must land before PHASE_FLIP_DUE (Aug 20).
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
          OUTSIDE the top-5 ranking. Phase A must not land before the 08-18 flip —
          gearing's tests run under the root `npm test`, so a broken gearing breaks the
          nightly publish gate.
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
          artifact to dist/gearing.html (copy-if-present) and the CTA row links to it.
          Harvests are MANUAL (Wowhead unreachable from CI) — data freshness is a
          local-run duty. Its tests run under the root `npm test` (node --test discovers
          them). Read-only coupling: its harvest-specs reads the tracker's specs.json;
          nothing in gearing/ writes outside gearing/, and the nightly never touches it.
legacy/   original single-file tracker (pre-conversion reference)
.github/  workflows/deploy.yml (build+deploy Pages on push) · workflows/ci.yml (tests on
          every push) · workflows/freshness.yml (daily staleness heartbeat → alert issue) ·
          workflows/nightly.yml + workflows/dispatch-nightly.yml (the refresh + its
          auto-kick) · workflows/wcl-probe.yml (dispatch-only WCL/diagnostic probe) ·
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
bot-wall, android-client workaround failed 2026-07-17). A third deterministic stage
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
`claude-opus-5`) — one-off model trials without editing the workflow. Publish (deterministic, no AI, holds the write token) gates on a
boundary guard ("Gate 0", 2026-07-18 portfolio audit: the artifact may not alter the
gate contract `required-sources.json`, `scales.json`, or registry structure in
`sources.json`/`community.json` beyond their agent-updatable fields — those fail the
night red; `data/season-final.json` is immutable to the agent for the same reason and by
the same gate; agent-shipped `data/history/` snapshots are reset so movement/anomaly
baselines always come from committed history) → **`node src/freeze-season.mjs`** (the
deterministic season freeze: any outlet whose pages flipped season tonight has its final
live-season letters lifted from git history, so the consensus keeps its composition
instead of publishing a recomposition as spec movement — needs publish's `fetch-depth: 0`,
which is why it cannot run agent-side) → `npm test` →
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
