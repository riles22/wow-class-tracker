# Season 2 transition — scope

**Status:** SCOPED 2026-08-04, decisions locked same day (Riley; all four recorded
inline at their ⚑ sites).
Covers three things Riley asked for in one arc: what launch week does to this tracker,
what "tracking everything live for S2" means, and how the next PTR cycle (12.2) starts
without rebuilding what 12.1 taught us. The launch-day owner checklist itself already
exists (CLAUDE.md: freeze → phase flip → report card); this scope is everything AROUND
those three commands.

## The one-sentence model

At launch the page's two eras trade places: "12.1 PTR" stops being the future and
becomes the present, "12.0.7" stops being the present and becomes history — and every
surface, gate, and skill that hardcodes which era is which has to follow within days,
while the outlets we aggregate flip their own pages on their own schedules.

## Inventory — everything that assumes 12.1 is PTR

Grounded sweep, 2026-08-04. This is the checklist the transition executes against.

**Code (owner-reviewed edits):**
- `SNAPSHOT_PHASE` + `PHASE_FLIP_DUE` (render.mjs) — the flip itself, already gated.
- `PTR_MPLUS_SERIES` + the zone-54 metric name in `projectionFor` — the projection's
  empirical inputs die with the PTR (the projection freezes anyway; see Phase 2).
- Metric era inference: names containing "12.1 PTR" ⇒ `era:"ptr"` (render.mjs +
  apply-metrics). S2 metric names must NOT contain that marker; the next PTR's names
  must carry the next patch's marker ("12.2 PTR"). Generalize to a constant.
- `fetch-wcl.mjs` — frozen recipe writes zone-52/56 series with "12.1 PTR" names and a
  zone-46 (S1) health probe. Needs a NEW owner-approved recipe for S2 zones; the S1/PTR
  cuts stop being fetched (their rows stay as history).
- The Era toggle (template) — "Both / 12.0.7 / 12.1 PTR" becomes "Both / 12.1 / 12.2 PTR"
  only when a 12.2 PTR exists; between launch and 12.2 announcement the toggle has one
  meaningful position and should hide (a one-era toggle is UI lying about having a choice).
- `takeEra` (template) + `expertRead` (render.mjs) — a take whose patchContext says
  "12.1 PTR" is FUTURE-era today, but after launch it describes the live season: era
  classification must key on the CURRENT phase, not on the string "PTR" alone.

**Data + contract (registry edits at transition):**
- `data/required-sources.json` — 8 WCL rows are era-specific (live-raid/mplus point at
  S1 zone 46/47 partitions; ptr-raid/mplus/dummy point at zones 54/56/52). At launch:
  live rows re-point to the S2 zones (numbers unknowable until Blizzard creates them —
  discovery step below), PTR rows are REMOVED from the contract (not marked skip —
  a contract row that can never succeed again is noise, and the gate hard-fails quiet
  skips by design).
- `data/sources.json` — every live tier-list page flips content S1→S2 at the outlet's
  own pace. `icyveins-ptr` (era:"ptr") retires when Icy Veins' MAIN M+ list is S2
  (their "ptr" URL then describes the live season or the next PTR — either way the
  era:"ptr" entry has served its purpose; its ratings history stays in specs.json).
- `data/scales.json` — CONSENSUS_VERSION bumps at the transition boundary: the same
  source ids now mean S2 opinions, so pre/post tiers are not one movement series.
- `data/ptr-builds.json` — the feed's subject changes: PTR build posts end; live S2
  hotfixes and weekly tuning become the primary channel (the 3-channel/4-channel
  discovery lessons in ptr-watch carry over wholesale — hotfix round-ups, standalone
  blue posts, and the S2 patch-notes thread when 12.1.x/12.2 opens).

**Skills (procedure flips):**
- refresh-tiers: era-verify inverts — pages must self-identify as 12.1/S2; a page still
  reading S1 is STALE, not wrong-page. Per-source transition status (below).
- ptr-watch: retargets to (a) S2 live hotfixes/tuning, (b) watching for the 12.2 PTR
  announcement (new forum thread = new cycle, discovered via Wowhead RSS as documented).
- watch-creators: patchContext conventions gain "12.1 live" / "S2" forms; the takeEra
  flip above is the code half of the same change.
- local-run/nightly: unchanged in shape; the manifest rows follow the contract.

## Phase 1 — the transition window (launch day → outlets settled, ~1–2 weeks)

The messy part. Blizzard flips in one day; our eight sources flip over days-to-weeks.

**Per-source transition status.** Each tier-list source's pages carry a
`seasonVerified: "s1" | "s2"` reading taken at refresh (the era-verify step already
reads exactly this off the page; it just doesn't store it). The UI shows a small
"updating for 12.1" chip on sources still serving S1.

⚑ **DECISION 1 (Riley, 2026-08-04): S2-only consensus with a count chip.** The
consensus averages only sources whose pages verify as S2, and the column says how many
opinions it currently rests on ("consensus of 2") until the registry recovers to full
strength. Honest and self-repairing — the alternative (averaging S1 and S2 lists in one
number) mixes two seasons in the page's core column. `consensusFor` gains a
seasonVerified filter; the divergence dot logic is unchanged (spread among fewer
sources is still spread).

**The frozen forecast during the window.** ⚑ **DECISION 2 (Riley, 2026-08-04):
frozen + labeled, then graded on the page.** The column keeps rendering the frozen
forecast, relabeled "Our pre-launch call" with a being-graded note; when the report
card lands (+14, refreshed +28) its verdict surfaces as a small grade chip on the
column header linking to the full card. Visitors watch the prediction meet reality —
the accountability IS the feature. The frozen artifact (data/forecasts/) is the
render source, not the live projection machinery, which stops running at the flip.

**Movement across the boundary is not movement.** The first S2 consensus differs from
the last S1 consensus because the game changed, not because opinion drifted. The
CONSENSUS_VERSION bump makes `pickBaseline` refuse cross-version comparison (existing
machinery — verified this is exactly what version markers exist for). The "What changed"
strip narrates "Season 2 baseline established" instead of 40 spurious arrows.

**WCL S2 discovery.** Zone ids for S2 raid/M+ don't exist until launch. A dispatch-run
probe (wcl-probe.yml exists for exactly this class of job) enumerates new zones,
confirms partition/difficulty ids, and the owner freezes the new recipe into
fetch-wcl.mjs — same review path as the 2026-07-17 zone-52 recipe.

**Sunset of PTR surfaces.** ⚑ **DECISION 3 (Riley, 2026-08-04): fade at settlement
(+14).** The Dummy Dome drawer box, zone-54/56 metric rows, the PTR columns in Compare
all/Ladder, and the icyveins-ptr column stay up through the grading window as the
forecast's receipts, then leave the UI once the report card lands. The underlying rows
stay in specs.json as history either way — this is a rendering sunset, not a deletion.

## Phase-1 machinery — LANDED 2026-08-04 (deltas from scope)

Shipped before PHASE_FLIP_DUE, as planned: `PHASES` in normalize.mjs is the single era
vocabulary (liveSeason / liveLabel / ptr.marker / ptrSunset) — consumed by consensusFor,
metric-name era inference, takeEra/expertRead, the Era toggle (labels from the payload;
the segment hides entirely when no PTR era exists or after sunset), PTR_MPLUS_SERIES
naming, and validate's name/era honesty gate. `seasonVerified` ships end to end:
validated ("s1"|"s2" or red), stored by refresh-tiers' era-verify step, enforced
per-bracket in consensusFor (the rule cuts both ways — an outlet that flips EARLY is
excluded from the pre-launch consensus too), surfaced as the toolbar's "consensus of N
(K updating)" count, an "updating…" suffix in the Source select, and an "updating for
<season>" chip in the footer registry. Launch is now the documented config edit:
PHASES + SNAPSHOT_PHASE in one commit (a pinned test fails on the flip so the edit is
deliberate), then agents write seasonVerified as outlets update.

**Deferred to the grading window, deliberately:** the sunset RENDERING (DECISION 3) and
the frozen-forecast column with its grade chip (DECISION 2). Both depend on artifacts
that only exist after the freeze/flip, and untestable launch-critical UI shipped early
is worse than scheduled work — the `ptrSunset` flag and the frozen artifact loader are
in place for them to build on, and there are two full weeks between launch and +14.

## Phase 2 — settled S2 (day +14 onward)

- **Report card runs** (day +14, again +28) — machinery shipped 2026-08-03: coverage
  first, ranking metrics within role, carry-forward baseline. Output lands as
  `docs/forecast-report-card.md` plus the on-page grade chip per DECISION 2.
- **The page's identity simplifies**: live S2 tracker. Consensus = S2 lists, metrics =
  S2 logs, movement = real week-over-week S2 drift, hotfix feed = the tuning story.
- **Writeups age into context**: `ptr` writeups described the S1→S2 change; they stay
  in the drawer as "the 12.1 read" history until creators' S2 content replaces the
  qualitative layer take-by-take (watch-creators keeps running; takes now live-era).
- **The gearing lane** ⚑ **DECISION 4, superseded same day.** The original decision
  ("stub it, build after the report card") was made before Riley revealed the gearing
  project already EXISTS — a standalone Season 2 gear & loot explorer imported as the
  `s2-gearing` branch and merged into `gearing/` (2026-08-04, audited below). The stub
  became an integration plan:

  **Audit verdict (2026-08-04, pre-merge review): healthy.** Pipeline green end to end —
  its validator (134 checked failure modes, pinned SimC commit + sha256-verified sim
  artifacts, source URLs on every catalyst fact), 10/10 tests including a client-boot
  test, and a 1.6MB fully-offline build with zero external requests at runtime. Its
  ground rules are the tracker's own culture arrived at independently: nothing inferred,
  curated-vs-scraped separation with provenance headers, refuse-on-unexplained-changes
  harvest gates, provisional data labeled as such in the UI. Coupling is read-only in
  the right direction (its harvest-specs reads the tracker's specs.json, never writes).

  **Known gaps, tracked not blocking:** (a) stat priorities are 12.0.7 proxies until
  12.1 guides publish — the UI discloses it; (b) harvests are manual and Wowhead is
  unreachable from CI, so data freshness is a LOCAL-RUN duty with no gate yet —
  post-launch it needs a re-harvest (items get tuned at launch) and eventually a
  required-sources-style freshness row; (c) no CSP in its HTML (the tracker build
  injects one — parity is Phase B); (d) gearing/data/specs.json is generated from the
  tracker's and committed — drift is possible if the tracker's roster data changes
  without a re-harvest.

  **Phased integration:**
  - **A (with the merge, DONE):** `gearing/` lands in-repo; `npm run build` copies its
    artifact to `dist/gearing.html` (copy-if-present), Pages serves it at /gearing.html;
    the tracker's CTA row links to it (⚙ S2 Gearing); its tests join `npm test`
    (`node --test` discovers them — suite went 229 → 239). The nightly cannot touch it:
    publish stages explicit paths and the agent artifact never included gearing/.
  - **B (transition window):** brand alignment (the tier-bars mark, shared palette),
    CSP parity, a per-spec Gearing drawer link from the tracker into the explorer's
    anchors, and the launch re-harvest (owner/local-run).
  - **C (after the report card):** deeper data integration per the original stub —
    whether gearing signals (sim deltas, BiS availability) inform any tracker surface,
    a freshness contract row, possible nightly participation if a CI-reachable harvest
    path exists. Design doc then.

## Phase 3 — the 12.2 cycle (repeatability)

The point of generalizing: next PTR is a config change, not a rebuild.

- **A `PHASES` constant** (render.mjs) owns the era vocabulary: current live id, current
  PTR id (nullable — between cycles there IS no PTR era), display labels, and the
  metric-name marker ("12.2 PTR"). Everything now keying on literal "12.1 PTR" reads
  from it: era inference, takeEra, the Era toggle, PTR_MPLUS_SERIES naming.
- **Cycle-start checklist** (mirrors the launch checklist, opposite direction): new
  forum thread discovered → new PTR zones probed → PTR contract rows added → era:"ptr"
  sources re-registered as outlets publish → projection machinery re-arms with the S2
  consensus as its new prior (PROJECTION_VERSION bumps; the report card's verdict on
  v7 informs the reweighting — that is the audit's "adopt v7 only if it beats v6"
  protocol, inherited here).
- **What 12.1 proved that carries forward unchanged**: era-gating architecture, the
  coverage gates, honest-absence rendering (·/—), the freeze/settle split, corroboration
  gates on qualitative lanes, channel-discovery lessons (dev-notes thread + hotfix
  round-ups + standalone blue posts + blue-tracker index).

## Explicitly out of scope

- Retuning projection weights (frozen per the 2026-08-02 audit until the report card).
- The gearing guide's own design (only its go/no-go and data-lane stub are in scope).
- Any change to the 40-spec roster machinery (S2 adds no specs).

## Timeline against the calendar

- **Now → Aug ~18**: land the Phase-1 machinery (seasonVerified, PHASES constant,
  consensus-transition behaviour per DECISION 1, sunset wiring per DECISION 3) so
  launch week is config + owner commands, not development.
- **PHASE_FLIP_DUE is Aug 20** — the heartbeat goes red past it if the flip is undone.
- **Launch day**: freeze → flip → contract swap → WCL probe dispatch.
- **+14 / +28**: report card; sunset completes per DECISION 3.
