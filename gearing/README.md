# gearing/ — Season 2 gear & loot explorer

A self-contained subproject that builds `wow-s2-gearing.html`: an offline, single-file app
for Midnight Season 2 (Curse of Ula'tek) gearing — best-per-slot rankings, loot sources,
the full item-level ladder, and a SimC-paste upgrade check.

Imported 2026-08-04 from the standalone "World of Warcraft" project. It has no npm
dependencies and does not participate in the tracker's nightly pipeline (yet); harvests
are run manually.

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

## Ground rules (carried over from the standalone project)

- **Nothing is inferred.** Item fields come from the item's own tooltip; absent fields stay
  null. Values only the community sheet has are marked provisional in the UI.
- **`data/weapon-proficiency.json` and `data/stat-priority-overrides.json` are curated,
  not scraped** — their provenance headers say exactly where each fact came from.
- Harvesters refuse to overwrite data on unexplained loot-set changes
  (`WOW_ACCEPT_LOOT_CHANGES=1` after review).
- Stat priorities are live-patch (12.0.7) proxies until 12.1 guides publish; the UI says so.
- `_retired-wallpapers/` holds the superseded static wallpaper deliverables this project
  grew out of.

## Coupling to the tracker

Read-only: `src/harvest-specs.mjs` reads the tracker's curated `../data/specs.json`
(override with `WOW_CLASS_TRACKER_SPECS`). Nothing here writes outside `gearing/`.
