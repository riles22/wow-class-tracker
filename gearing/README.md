# gearing/ — Season 2 gear & loot explorer

A self-contained subproject that builds `wow-s2-gearing.html`: an offline, single-file app
for Midnight Season 2 (Curse of Ula'tek) gearing — best-per-slot rankings, loot sources,
the full item-level ladder, and a SimC-paste upgrade check.

Imported 2026-08-04 from the standalone "World of Warcraft" project. It has no npm
dependencies and does not participate in the tracker's nightly pipeline (yet); harvests
are run manually.

**"Offline" is load-bearing, and fonts are the easy way to break it.** The page shares the
Spec Tracker's masthead vocabulary (2026-08-05), including its Cinzel/Inter/JetBrains Mono
typography — but those faces are **embedded as base64 woff2 data URIs**, never linked from
Google Fonts, so the built file still issues zero network requests. Regenerating them means
re-fetching the latin subsets and re-embedding; all three are OFL-licensed, so shipping
them inside the artifact is permitted. Verify after any change with:

```
node -e "const h=require('fs').readFileSync('wow-s2-gearing.html','utf8');console.log((h.match(/url\(\s*[\"']?https?:/gi)||[]).length)"
```

Zero is the only passing answer. (An external `<a href>` is fine — it is a link, not a
fetch; it is `url(http…)` in CSS and external `src=` that would break the guarantee.)

**CSP.** The build injects a Content-Security-Policy whose `script-src` is a sha256 hash
of the one inline app script, so only the exact script this build produced can run. It is
stricter than the tracker's — `default-src 'none'` with no external origin, since the
fonts and every item icon are data: URIs. Two things will silently break it: the build
must normalize CRLF→LF *before* hashing (the HTML parser normalizes newlines, so a Windows
checkout would otherwise produce an unmatchable hash), and any new inline `on*=` handler
or second bare `<script>` would be refused — the build hard-fails if it does not find
exactly one script to hash.

**Deep link.** `gearing.html#spec=<slug>` preselects a spec, where `<slug>` is the
tracker's `slugOf()` (`"<class> <spec>"` lowercased, non-alphanumerics → `-`). The tracker's
spec drawers link here. Unknown slugs fall back to the default spec rather than erroring.

**Client code must not assume a browser.** `test/project.test.mjs` boots the app through
`new Function("document","innerWidth","innerHeight", …)` to get a fast check without
Playwright. There is no `location`, `history` or `window` in that scope, so guard any use
of them with `typeof x === 'undefined'` or that test fails with a bare ReferenceError.

## Pipeline

```
node src/harvest-raid.mjs        # Venomous Abyss loot, per-item Wowhead PTR tooltips
node src/harvest-dungeons.mjs    # M+ pool loot (8 dungeons); ilvl comes from key level
node src/harvest-tier.mjs        # Tier 36 set items
node src/harvest-specs.mjs       # spec capabilities + stat priorities (reads ../data/specs.json)
node src/harvest-sheet.mjs       # Norumu community sheet, corroboration only
node src/harvest-icons.mjs       # item icons, inlined base64
node src/harvest-catalyst-allocations.mjs
node src/run-simc-reference.mjs plan # read-only SimC coverage/run plan
node src/validate-data.mjs       # cross-source validation gates
node src/build.mjs               # -> wow-s2-gearing.html (fully offline)
node --test test/project.test.mjs test/simc-runner.test.mjs test/simc-curator.test.mjs test/simc-curation-admission.test.mjs test/simc-unholy-admission.test.mjs
```

From the repository root, the equivalent convenience commands are
`npm run gearing:simc:plan`, `npm run gearing:simc:curate -- <prepare|seal> ...`,
`npm run gearing:test`, and `npm run gearing:build`.

## SimulationCraft reference weights

`data/simc-run-manifest.json` is the operational allowlist: it accounts for all 40 specs,
owns profile/build/scenario IDs, and records accepted, pending, deferred, and unsupported
coverage. `data/simc-reference-weights.json` is the accepted evidence ledger. Generic
coefficients are normalized to the profile's primary stat and are only an equal-item-level
secondary-fit heuristic; direct character and item simulations remain the stronger final
gearing test.

The runner is manual, plan-first, and resumable. It never starts a simulation without an
explicit `run`, and only `promote` can update committed evidence:

```text
node src/run-simc-reference.mjs plan
node src/run-simc-reference.mjs run --profile <profile-id> --scenario <scenario-id> --simc <path-to-simc> --profile-file <reviewed-profile.simc> [--iterations <n>]
node src/run-simc-reference.mjs promote --profile <profile-id> --scenario <scenario-id>
```

Curated same-gear profiles have a separate, auditable preparation and admission boundary:

```text
node src/curate-simc-profiles.mjs prepare --simc <path> [--profile <profile-id>] [--work-dir <path>]
node src/curate-simc-profiles.mjs seal --bundle <bundle.json>
node src/admit-simc-curation.mjs admit --bundle <bundle.json> [--bundle <bundle.json>]
node src/admit-unholy-evidence.mjs admit --evidence-root <reviewed-evidence-dir>
```

`SIMC_EXE` may replace `--simc`. The runner verifies the pinned executable and profile
SHA-256 values, uses two deterministic independent seeds, checks the report build/settings,
and rejects coefficient drift above the manifest threshold. Work stays in ignored
`.simc-work/`; promotion retains gzip-compressed original reports in `data/simc-audit/`.
The current verified simulator executable is explicitly pinned to Windows x64; the data
and generated offline app remain portable, while unsupported runner platforms fail visibly.
`--profile-file` supplies the reviewed input for a new profile and can be omitted when an
accepted profile already has a retained audit copy.
`--iterations` is a run-only resampling override. It must be at least the manifest minimum;
when it is higher, that exact request is bound into the checkpoint and accepted record while
the existing drift threshold remains unchanged. Use a fresh work directory to preserve an
earlier sample campaign.
For a new `ready` profile, each scenario promotion is staged until the full reviewed matrix
exists; only then are its manifest status and visible coverage changed to `accepted`.
Existing accepted evidence cannot be replaced unless `promote --force` is explicit.

A logical guide profile may use `scenarioInputs[]` when the highest-DPS reviewed source
build differs by encounter. These are exact manifest inputs, not generic target-count
descriptions: each entry pins its materialized and upstream actors, generator and gear-plan
hashes, talent provenance, profile bytes, simulator build, item database, Catalyst redirects,
and whether actual tertiary ratings are present.
The runner must place `ptr=1` and `item_db_source=local` before the profile path because
SimC resolves imported items in command-line order.

The first completed pilot adds Destruction Warlock. A 5,001-iteration same-gear comparison
selected Hellcaller for raid single target (+3.80% over Diabolist) and Diabolist for sustained
five-target AoE (+16.60% over Hellcaller). Both published coefficient records then passed
two 25,000-iteration runs with maximum secondary-weight drift below 1.53%. The selected
profiles model two Catalyst conversions through `redirected_base_stats`; their actual
tertiary ratings are also retained, modeled, and audited.

The 2026-08-04 conventional-DPS expansion now covers all 26 conventional DPS specs across
30 accepted logical profiles and 60 accepted scenario records. 4 `official-output`
profiles (8 records) cover Shadow Priest's two guide profiles, Destruction Warlock, and
Unholy Death Knight. The remaining 23 specs use 26 explicitly labeled `curated-same-gear`
profiles (52 records).

The production curated cohort uses `midnight-s2-raid-catalyst-v2`: 44 reviewed candidate
actor/APL pins, collision-free v2 profile and report IDs, exact SHA-pinned generator-derived
gems and enchants, and deterministic Catalyst-aware gear plans. The earlier unenhanced v1
artifacts were withdrawn and are not accepted production evidence. All 52 curated scenario
inputs honestly declare no positive tertiary ratings; Destruction and Unholy retain their
actual modeled tertiaries. 13 tank and healer specs remain deferred to role-appropriate
objectives, and Augmentation remains the 1 unsupported spec for personal-DPS scale factors.
See `../docs/adr-simc-curated-profiles.md` for the provenance decision and its boundaries.

## Healer reference rankings

`data/healer-reference-rankings.json` is a provider-neutral evidence ledger for healer
throughput gearing. It is deliberately separate from SimulationCraft: healer entries can
remain honestly SimC-deferred while a role-appropriate model supplies Raid or Mythic+
reference rankings through the same in-app gear cards and Catalyst comparison views.

Questionably Epic is the first candidate provider, but no model result is accepted yet.
The ledger records all seven healer specs as pending while provider permission, a versioned
export contract, and 12.1 Catalyst fixtures are unresolved. The public app therefore keeps
using its dated guide-order fallback; it does not call QE Live at runtime, scrape undocumented
report endpoints, or bundle the provider's unlicensed source.

Future accepted records must pin their provider/model version, profile, scenario, assumptions,
provenance, and exactly one scoring basis. Secondary-weight records remain equal-item-level
fit heuristics. Item-score records may represent nonlinear effects, but v1 admits only an
explicit list of known item IDs; it rejects unverified claims that the candidate pool is
complete. It also pins item scores to an equal-item-level, fixed-reference-set comparison and
describes Catalyst use as retained item contribution rather than reusing an unexplained
character snapshot. Exact model scores and guide-fallback values are displayed and sorted
separately, never compared as though they share a numeric scale. In every case the tracker's
own item catalog remains authoritative for inherited Catalyst secondaries, tertiaries,
sockets, bonus IDs, and cantrip effects.

Before running a newly curated profile, run `npm run gearing:test` from the repository root.
Long SimC batches are intentionally not part of the nightly tracker pipeline.

## Ground rules (carried over from the standalone project)

- **Nothing is inferred.** Item fields come from the item's own tooltip; absent fields stay
  null. Values only the community sheet has are marked provisional in the UI.
- **`data/weapon-proficiency.json` and `data/stat-priority-overrides.json` are curated,
  not scraped** — their provenance headers say exactly where each fact came from.
- Harvesters refuse to overwrite data on unexplained loot-set changes
  (`WOW_ACCEPT_LOOT_CHANGES=1` after review).
- Guide-order priorities remain dated fallback metadata and are labeled as such. All 26
  conventional DPS specs have accepted 12.1 PTR SimC reference coefficients; tanks retain
  their deferred role-specific fallback states, while healers also have a separate pending
  throughput-model ledger that publishes no coefficients until its admission gates pass.
- SimC reference coverage is separate from the root MID1 nightly DPS metric and never feeds
  tracker tier grades or the 12.1 projection model.
- `_retired-wallpapers/` holds the superseded static wallpaper deliverables this project
  grew out of.

## Coupling to the tracker

Read-only: `src/harvest-specs.mjs` reads the tracker's curated `../data/specs.json`
(override with `WOW_CLASS_TRACKER_SPECS`). Nothing here writes outside `gearing/`.
