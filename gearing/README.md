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
node src/harvest-raid.mjs        # Venomous Abyss loot, per-item Wowhead tooltips
node src/harvest-dungeons.mjs    # M+ pool loot (8 dungeons); ilvl comes from key level
node src/harvest-tier.mjs        # Tier 36 set items
node src/harvest-specs.mjs       # spec capabilities + stat priorities (reads ../data/specs.json)
node src/harvest-sheet.mjs       # Norumu sheet — CAUTION: data/sheet-rewards.json was hand-distilled
                                 # 2026-08-18 from Gandalin's launch chart (owner-supplied); re-running
                                 # this harvester as-is would regress that update. Rework in Phase B.
node src/harvest-icons.mjs       # item icons, inlined base64
node src/harvest-catalyst-allocations.mjs
node src/validate-data.mjs       # cross-source validation gates
node src/build.mjs               # -> wow-s2-gearing.html (fully offline)
node --test test/project.test.mjs
```

From the repository root, the equivalent convenience commands are
`npm run gearing:test` and `npm run gearing:build`.

## Retired: SimC reference weights and the healer model lane

Both lanes were removed 2026-08-18 by docs/gearing-s2-scope.md Phase A (DECISIONS G3 and
G5): seven src modules, four test files, four data ledgers and data/simc-audit/ (~28 MB,
368 files). Git history keeps every byte; docs/adr-simc-reference-pipeline.md and
docs/adr-simc-curated-profiles.md remain as the design record, marked Retired.

## Ground rules (carried over from the standalone project)

- **Nothing is inferred.** Item fields come from the item's own tooltip; absent fields stay
  null. Values only the community sheet has are marked provisional in the UI.
- **`data/weapon-proficiency.json` and `data/stat-priority-overrides.json` are curated,
  not scraped** — their provenance headers say exactly where each fact came from.
- Harvesters refuse to overwrite data on unexplained loot-set changes
  (`WOW_ACCEPT_LOOT_CHANGES=1` after review).
- Guide-order priorities are the base ranking signal for all 40 specs and are labeled as
  the sorting device they are. The SimC reference pipeline and the healer throughput-model
  ledger were retired 2026-08-18 (docs/gearing-s2-scope.md, DECISIONS G3/G5); the
  guide-consensus model of DECISION G1 replaces them in Phase C.
- `_retired-wallpapers/` holds the superseded static wallpaper deliverables this project
  grew out of.

## Coupling to the tracker

Read-only: `src/harvest-specs.mjs` reads the tracker's curated `../data/specs.json`
(override with `WOW_CLASS_TRACKER_SPECS`). Nothing here writes outside `gearing/`.
