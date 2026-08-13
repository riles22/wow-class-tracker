# gearing/ — Season 2 gear & loot explorer

A self-contained subproject that builds `wow-s2-gearing.html`: an offline, single-file app
for Midnight Season 2 (Curse of Ula'tek) gearing — best-per-slot rankings, loot sources,
the full item-level ladder, and a gear-export paste upgrade check (the `/simc` addon's
gear export, parsed — it never runs a simulation or imports stat weights).

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
node src/validate-data.mjs       # cross-source validation gates
node src/build.mjs               # -> wow-s2-gearing.html (fully offline)
node --test test/project.test.mjs
```

From the repository root, the equivalent convenience commands are `npm run gearing:test`
and `npm run gearing:build`. Run the tests after any harvest or data edit — gearing's
tests also run under the root `npm test`, so a broken gearing breaks the tracker's
nightly publish gate.

## What ranks items (2026-08-12 — the SimC lane is gone)

Phase A of `../docs/gearing-s2-scope.md` (owner decisions G1–G8) removed the
SimulationCraft reference-weight pipeline and the dormant healer-model ledger from this
subproject: 7 `src/` modules, 4 test files, 4 `data/` files and the 368-file
`data/simc-audit/` tree — **383 files and ~30 MB** — are gone, `validate-data.mjs` went
1,413 → 595 lines, and the built artifact shrank 2,119,303 → 1,726,547 bytes (**18.5%
smaller**). Git history keeps every byte, and `../docs/adr-simc-reference-pipeline.md` +
`../docs/adr-simc-curated-profiles.md` survive as the superseded design record — labeled
HISTORY rather than excised, because they hold the reproducibility account and the
2026-08-05 trinket-conditioning audit disclosure.

Nothing here runs, imports or stores a simulation any more. Two ranking inputs survive:

- **Guide stat priorities** (`data/specs.json` `statPriority` / `statPriorityVariants`,
  dated by `statPriorityPatch`, curated in `data/stat-priority-overrides.json`) — the
  primary signal, and the only one that covers all 40 specs uniformly.
  `GUIDE_MULTIPLIERS = [1, 0.75, 0.5, 0.25]` turns that published ORDER into fixed spacing
  for sorting, and the UI says so in visible text.
- **Custom decimal weights** — the reader's own numbers, and under G6 a FULL override.
  Because switching modes silently changes what "rank 1" means, every ranked surface says
  so in visible text — but through **three** different sites, not one helper:
  `renderBis`'s `#bis-note`, `renderTier`'s `#tier-note`, and `customOverrideNote()` on the
  Upgrade checker's cards, with `renderFooter` and `#scoring-summary` bracketing all tabs.
  A fourth ranked surface must add its own disclosure; grepping `customOverrideNote` alone
  will not tell you that.

So `Scoring method` offers exactly two options — `Guide order` and `Custom decimal
weights`. The old model-weight (`reference`) mode and the SimC-fed `Encounter` selector
no longer exist; the setup card is **Specialization · Build · Scoring method**.
**The option is labeled `Guide order`, not "consensus", on purpose:** Phase A harvests ONE
guide (all 40 `statPrioritySource` values are icy-veins.com), and `SOURCES.md` forbids
calling anything consensus without 2+ independent sources. The stored mode *value* is
`consensus` because that is the G7-recorded id and the end state; the label flips when
G1's multi-source harvest lands in Phase B/C. A test pins both the label and the absence
of the word "consensus" on the page.

The `/simc` **addon paste** in the Upgrade checker is untouched and stays — it is a
gear-export parser, not a simulator.

## Ground rules (carried over from the standalone project)

- **Nothing is inferred.** Item fields come from the item's own tooltip; absent fields stay
  null. Values only the community sheet has are marked provisional in the UI.
- **`data/weapon-proficiency.json` and `data/stat-priority-overrides.json` are curated,
  not scraped** — their provenance headers say exactly where each fact came from.
- Harvesters refuse to overwrite data on unexplained loot-set changes
  (`WOW_ACCEPT_LOOT_CHANGES=1` after review).
- **Guide priorities are the PRIMARY ranking signal, not a fallback** (reworded 2026-08-12
  under G1, when the model lane they used to fall back *from* was removed). They stay dated,
  they name the guide they came from, and they stay an ORDER: any spacing used to sort
  within one is a labeled sorting device, never a numeric stat weight — the guides
  deliberately publish no weights, so inventing one would be inventing a fact.
- **Different quantities never share a scale.** Consensus count, equal-item-level secondary
  fit and item-level delta are three different things: display and sort them as three
  things, never summed into one number and never compared as though they share a numeric
  axis. (Generalized 2026-08-12 from the same rule about model scores vs guide values.)
- **The gearing lane is firewalled from the tracker's own layers.** Nothing under
  `gearing/` feeds tracker tier grades, the source consensus or the 12.1 projection model,
  and the tracker's own MID1 sim metrics (Bloodmallet, the SimC nightly) are a separate
  lane that never feeds gearing.
- `_retired-wallpapers/` holds the superseded static wallpaper deliverables this project
  grew out of.

## Coupling to the tracker

Read-only: `src/harvest-specs.mjs` reads the tracker's curated `../data/specs.json`
(override with `WOW_CLASS_TRACKER_SPECS`). Nothing here writes outside `gearing/`.
