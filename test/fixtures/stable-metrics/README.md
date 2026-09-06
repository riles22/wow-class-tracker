# Stable numeric collector fixtures

Captured by ordinary public GET on September 5, 2026; original URLs, response byte
counts, and SHA-256 digests are in `provenance.json`. These are bounded excerpts:
scripts, styles, SVG paths, image URLs, and decorative classes were removed. The
source-owned timestamp, labels, ranks, and numeric cells remain as returned.

Murlok includes all three role leaderboards (27/7/6). Tests reorder attributes to
reproduce the href-before-class regression without dropping the top-ranked entry.

Mythicstats includes only the period-1079 representation section: 39 published
specs, 99.9% after rounding, with Fire Mage absent. Bar-height percentages remain
in the fixture so a parser cannot accidentally use those as representation values.
Tests append a repeated-chart decoy and mutate markup/coverage to check rejection.

These are parser evidence, not current game data. Do not merge fixture values into
the tracker; production runs fetch the URLs again and create separate receipts.
