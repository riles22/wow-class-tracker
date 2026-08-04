# SimulationCraft reference audit artifacts

This folder retains the exact generated profiles and eight accepted JSON reports used for the Shadow Priest reference weights in `data/simc-reference-weights.json`.

- `profiles/*.simc.gz` contains the two generated Midnight Season 2 profiles.
- `reports/*.json.gz` contains both independent runs for each profile and encounter scenario.
- The build decompresses every artifact and verifies its original-byte SHA-256 against the corresponding `profileSha256` or `resultSha256` field before publishing the offline app.

The HTML reports, console logs, smoke tests, failed runs, and simulator executable are intentionally excluded because they are not needed to reproduce the published coefficients or verify their provenance.
