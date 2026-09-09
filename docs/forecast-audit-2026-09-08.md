# Forecast report and historical prediction audit — September 8, 2026

The published forecast report works, and its headline +14-day result reproduces correctly. The frozen forecast improved substantially on carrying Season 1 forward. It is not the best predictor in every bracket or role. Several reporting defects and two usability issues should be addressed before adding a source leaderboard.

This document records the initial audit and proposed implementation scope, before remediation. Its screenshots and numerical evidence preserve that reviewed state. The owner subsequently authorized all fixes and live additions; see the [implementation and validation record](forecast-accountability-release-2026-09-08.md). Do not interpret the findings below as the current release status or regenerate these historical evidence files with newer grading code.

## Verified scope

- Audited checkout and public build: `343a878dcfeb7c4dc5b159df8e8af8e4763c7bdd`.
- `npm run test:quiet`: **546 passed, 0 failed, 1 expected seasonal skip**; browser invariants ran. The skipped test concerns a source leaving the current season, not forecast rendering.
- `npm run build`: passed and produced no tracked artifact difference. `git diff --check`: passed.
- Public `index.html`, `gearing.html`, and `forecast-report.html`: HTTP 200; all three match the normalized hashes and sizes of this exact local build. [Successful Pages run](https://github.com/riles22/wow-class-tracker/actions/runs/34243117203).
- Chromium at 1440×900 and 375×812: tracker/report round trip, both checkpoint anchors, keyboard focus, table scrolling, and provenance disclosures passed. All 80 cells appear, no page-level horizontal overflow or runtime errors occurred, and the report itself makes no external requests and contains no scripts. The hosted report has identical body text. This turn's additional manual audit used Chromium; it does not claim a new three-engine certification.

## What the forecast actually achieved

The declared forecast is **August 11**, the season boundary is **August 18**, and the first +14 eligible saved outcome is **September 1**. The +28 checkpoint correctly remains pending until a saved snapshot on or after **September 15**. These are fixed checkpoints, not a grade against today's changing consensus.

Every comparison here measures agreement with **publisher tier-list consensus**. It does not establish objective game strength, player performance, or an independent verdict on the publishers' shared assumptions.

| Measure, all 80 spec/bracket cells | Frozen forecast | Carry Season 1 consensus forward |
| --- | ---: | ---: |
| Exact letters | 33/80 — 41% | 17/80 — 21% |
| Within one band | 71/80 — 89% | 57/80 — 71% |
| Mean absolute band error; lower is better | 0.70 | 1.21 |

Forecast bias is −0.20 bands: slightly too pessimistic overall. Percentages follow the report's whole-number rounding.

Spearman correlation compares ordering within each role, handles ties with midranks, and ranges from −1 to +1. Higher is better; +1 means the two orderings agree. It is the most defensible current ordering measure for comparing tied tier lists; the NDCG and top-k caveats are recorded below.

| Group | Cells | Forecast Spearman | Carry-forward Spearman |
| --- | ---: | ---: | ---: |
| Raid DPS | 27 | 0.511 | −0.087 |
| Raid healers | 7 | 0.464 | −0.198 |
| Raid tanks | 6 | 0.841 | 0.464 |
| M+ DPS | 27 | 0.784 | 0.208 |
| M+ healers | 7 | 0.703 | 0.164 |
| M+ tanks | 6 | 0.200 | −0.086 |

The forecast improves ordering over the prior in all six groups. M+ tank ordering is still weak. Nine cells missed by two bands; none missed by more:

| Spec | Bracket | Forecast → settled |
| --- | --- | --- |
| Blood Death Knight | Raid | A → S |
| Guardian Druid | M+ | B → A+ |
| Preservation Evoker | M+ | A+ → B |
| Arcane Mage | Raid | A → S |
| Discipline Priest | Raid | S → A |
| Discipline Priest | M+ | A → C |
| Holy Priest | Raid | B → A+ |
| Shadow Priest | Raid | B → A+ |
| Demonology Warlock | M+ | B → A+ |

Confidence bins show 5/16 exact at low confidence, 23/54 at medium, and 5/10 at high. These are evidence-coverage labels, not calibrated probabilities. One small season cohort is insufficient to turn them into success probabilities or automatically retune creator/source weights.

## Historical source comparisons

### Provenance and scoring rules

The artifact's `gitSha`, `397373b300714a0ce0ed193d38be51b12e1f94b8`, preserves the raw source and creator inputs. Replaying the original hash recipe over all 12 top-level data JSON blobs reproduces the artifact's SHA-256 exactly: `c20edc631f835a08fafe1ef448b1649d1915d7a2c5da87e5568f61b626ff6441`. This verifies that these committed inputs match the freeze, rather than assuming the recorded Git HEAD also captured uncommitted data.

The September 1 raw source letters were recovered from `89f93e5cbc27761c98e3df2564939939986c211d`. Recomputing their consensus produces **zero differences in all 80 historical outcome letters and scores**. The frozen artifact has only one committed change in its Git history, and all 80 forecast cells still agree with its explicit declaration.

Site letter comparisons use each source's historically recorded score mapping and then the shared consensus bands. Thus “exact” means agreement on the normalized letter, not a literal comparison of different publishers' native scales. Ranking retains source-score ties. Model and prior comparisons use exactly the same source-covered cells. Source pages' current contents are not used to reconstruct past predictions; original URLs and their stored publication/collection dates remain in the evidence.

### Site predictions available at our August 11 freeze

Wowhead's six Season 2 lists were collected August 10, with page publication dates August 8–9. Icy Veins' three PTR M+ lists were also collected August 10 and dated August 2. Both were already predicting the next season at our cutoff.

| Prediction | Scope / coverage | Exact normalized letters | Within one band | Mean band error |
| --- | --- | ---: | ---: | ---: |
| Wowhead early S2 | Raid + M+, 80/80 | 37/80 — 46% | 75/80 — 94% | 0.60 |
| Our forecast on those cells | Raid + M+, 80/80 | 33/80 — 41% | 71/80 — 89% | 0.70 |
| Icy Veins PTR | M+, 40/40 | 15/40 — 38% | 39/40 — 98% | 0.65 |
| Our forecast on those cells | M+, 40/40 | 17/40 — 43% | 36/40 — 90% | 0.68 |

The actual frozen Icy Veins PTR coverage is 40, not the older documentation's 38. Its fewer exact hits but smaller average error illustrates why one percentage is not enough.

| Group | Our forecast | Wowhead early S2 | Icy Veins PTR |
| --- | ---: | ---: | ---: |
| Raid DPS Spearman | 0.511 | 0.832 | Not covered |
| Raid healer Spearman | 0.464 | 0.756 | Not covered |
| Raid tank Spearman | 0.841 | 0.429 | Not covered |
| M+ DPS Spearman | 0.784 | 0.772 | 0.709 |
| M+ healer Spearman | 0.703 | 0.716 | 0.796 |
| M+ tank Spearman | 0.200 | 0.463 | 0.883 |

Wowhead was particularly useful for raid DPS/healer ordering; our raid tank ordering was better. Icy Veins' PTR tank order substantially outperformed ours. These are observations for this season and checkpoint, not evidence that one source is always more reliable.

Original references: [Wowhead raid DPS](https://www.wowhead.com/guide/classes/tier-lists/dps-rankings-raids), [Wowhead M+ DPS](https://www.wowhead.com/guide/classes/tier-lists/dps-rankings-mythic-plus), [Icy Veins PTR DPS](https://www.icy-veins.com/wow/mythic-ptr-dps-tier-list), [PTR healers](https://www.icy-veins.com/wow/mythic-ptr-healer-tier-list), [PTR tanks](https://www.icy-veins.com/wow/mythic-ptr-tank-tier-list). These identify the source pages; the historical Git receipts, not today's pages, support the values above.

### Check whether a publisher helps grade itself

The full answer key includes Wowhead and Icy Veins. For each sensitivity check, remove that publisher's September 1 contribution and regrade both its prediction and ours against the same remaining three publishers. Icy Veins PTR is matched to live Icy Veins for exclusion. These are separate answer keys, so the rows must not become a combined leaderboard.

| Outcome sensitivity | Source mean error | Our mean error on same cells | Selected ordering result |
| --- | ---: | ---: | --- |
| Exclude Wowhead, 80 cells | 0.66 | 0.76 | Raid DPS: Wowhead 0.763 vs ours 0.436 |
| Exclude Icy Veins, 40 M+ cells | 0.78 | 0.55 | M+ tanks: Icy Veins 0.883 vs ours 0.200 |

Wowhead's overall band-error advantage and Icy Veins' tank-ordering advantage survive removing their own later opinions. Icy Veins' M+ letter calibration is worse than ours under its exclusion. Exclusion reduces direct self-inclusion; it does not eliminate shared authors, correlated opinions, or common inputs. Our forecast itself used these early source lists, so this is not a test of statistically independent models.

### Later pre-season snapshots and older-season benchmarks

There are also usable **August 17** S2 lists, after our freeze but before Season 2 opened. Their extra information makes them a different cohort. They are included because they were published beforehand, but not treated as an equal-deadline contest with the August 11 model.

| August 17 S2 source snapshot | Coverage | Exact normalized letters | Within one band | Mean band error |
| --- | ---: | ---: | ---: | ---: |
| Wowhead | 80/80 | 39/80 — 49% | 76/80 — 95% | 0.57 |
| Icy Veins live S2 pages | 79/80 | 32/79 — 41% | 72/79 — 91% | 0.68 |
| Method | 80/80 | 39/80 — 49% | 75/80 — 94% | 0.57 |

At our freeze, the live Icy Veins, Method, and Archon lists still described **Season 1**. Carrying those old letters into S2 gives 28% exact/1.20 mean error for Icy Veins (80 cells), 25%/1.25 for Method (79), and 29%/1.30 for Archon (80). These are prior-season carry-forward benchmarks, not failed Season 2 predictions. Archon still lacked an eligible S2 prediction in the later pre-season cohort. The detailed evidence retains each cohort's own date, coverage, same-cell model comparison, and publisher-exclusion result.

### Creator video retrospectives

Inventoried **624 frozen creator records across 37 creators**: 406 specialist takes and 218 general-creator notes. The archive stores attributed paraphrases rather than a complete structured ranking ledger. Eight dated videos preserve **59 explicit placements** that can be analyzed. All 59 were independently checked against the saved text for tier/order and bracket. These results grade those preserved claims; this audit did not newly verify the original video transcripts.

No tiers were inferred from sentiment, hype, discussion order, talent ranks, conditional “could be S” statements, or observations about a past PTR test. Creator tiers supply ordinal ordering only: there is no justified common numerical calibration for letter-accuracy percentages.

The following are **named historical videos, sometimes already superseded**, not a creator's synthesized latest launch prediction. “Ours” always uses the identical subset of specs.

| Creator and source date | Comparable subset | Creator Spearman | Ours, same cells | Status at freeze |
| --- | --- | ---: | ---: | --- |
| [Zorthas, Aug 9](https://youtu.be/SV3Snl21XC8?t=65) | 23/27 M+ DPS | 0.865 | 0.736 | Selected claims not superseded |
| [AutomaticJak, Aug 1](https://youtu.be/AfxJlv15i04?t=154) | 5/7 M+ healers | 0.763 | 0.821 | 2/5 selected claims superseded |
| [AutomaticJak, Aug 4](https://youtu.be/SQyKJx6FEVA?t=228) | 5/7 raid healers | 0.791 | 0.600 | 2/5 selected claims superseded |
| [MadSkillzzTV, July 28](https://youtu.be/Zf3GQqG-z8s?t=1028) | 5/7 M+ healers | 0.783 | 0.700 | All five selected claims superseded |

Zorthas's video covers all 40 specs, but the archive preserves explicit tiers for **29**: 23 DPS, three healers, and three tanks. Eleven tier placements remain unknown. His scope is the highest keys, while the grading target is the broader publisher consensus; AutomaticJak's raid discussion emphasizes world-first compositions. Those scope differences limit what a disagreement proves. Zorthas's better DPS-wide correlation also does not mean a better top-five selection: the existing top-k method gives him 2/5 versus our 3/5, subject to the tie caveat in F3.

Additional panels are too small for robust conclusions. Top-k is withheld when it would include the entire subset; three-item correlations are exploratory:

| Dated panel | Subset | Creator / ours Spearman | Limitation |
| --- | --- | --- | --- |
| Zorthas, Aug 9 | 3/7 M+ healers; 3/6 tanks | 1.000 / 0.866; 1.000 / 0.500 | Only three placements per role |
| [YoDaTV, Aug 8](https://youtu.be/Zc-pNsazA90?t=8) | 3/6 M+ tanks | 1.000 / 0.500 | Six explicit claims across roles; only tanks meet the three-cell minimum |
| [LBNinja7, Aug 2](https://youtu.be/gvh4R_QSwaI?t=69) | 3/7 M+ healers | 0.866 / 1.000 | Four other healer placements absent/relative |
| [Kalamazi, July 27](https://youtu.be/ZOVnfoXjuoc?t=1774) | Three Warlock specs in M+ | 0.500 / −0.500 | Class-only ordering; two claims superseded at freeze; prior correlation was 0.866 |
| [Bansherz, Aug 7](https://youtu.be/7O6Ri1vo0rc?t=17252) | Three Hunter specs in M+ | Not computable | All three recorded around B, so no differentiated ordering |

The full inventory gives source URLs, dates, patch/bracket context, supersession, and exclusions. Examples: izen's strongest numerical statements described PTR observations, while an S-tier candidate statement was conditional; Dalaran Gaming's rank-keyword matches describe talent ranks; Musguete's Outlaw S-tier case depends on tuning/composition; Tettles has one explicit Augmentation C but insufficient same-role placements; Bicepspump's explicit S statement describes the prior season. Their other qualitative reads are not silently turned into predictions. Some old video claims remain useful historical records even when a newer qualitative take supersedes them, but combining those dates into a made-up final list would be misleading.

## Findings and proposed fixes

### F1 — P2: carry-forward loses its provenance metadata

Location: `src/report-card.mjs`, `carryForward()` around line 303; `src/render-forecast-report.mjs`, `checkpointHTML()` around line 96.

`carryForward()` reconstructs each cell with only `projection`, discarding `consensusSources`. On the real August 11 → September 1 pair, the model grade correctly says comparable, while the baseline grade says `comparable: false` and incorrectly claims the snapshots predate recorded compositions. The HTML still displays baseline accuracy and ranking because its gate checks only the model grade.

The current baseline numbers reproduce correctly; this is a provenance/guard defect, not evidence that 21% should be a different number. Preserve each cell's metadata while replacing its projection, and check the baseline's comparability before publishing its metrics. Test the real differing-version, recorded-composition pair and a deliberately missing baseline receipt.

### F2 — P2: explicit CLI dates bypass settlement and silently select other snapshots

Location: `src/report-card.mjs` around lines 379–382.

`node src/report-card.mjs --forecast 2026-08-11 --settled 2026-08-18` prints **GRADE** despite selecting launch day, fourteen days before the first eligible settled outcome. The branch decides grade status using phase alone.

`--settled 2026-09-01` alone silently chooses July 1 as the forecast and reports 0/80 coverage. Supplying `--forecast 2026-08-11 --settled not-a-snapshot` silently substitutes September 8 and publishes a different 40% exact result. A misspelled explicit forecast likewise falls back to the oldest snapshot.

Reject requested dates that are absent or invalid; derive omitted sides from the declared default pair. Reuse the settlement rules for manual comparisons, and label early or nonstandard selections as exploratory/drift rather than the fixed settled report. Test each example above. The default CLI and published page choose the correct September 1 outcome today.

### F3 — methodology limitation: alphabetical ties affect ranking credit

Location: `src/report-card.mjs`, `ndcgAtK()` and `rankingFor()`, around lines 243–292.

The existing alphabetical tie-break is stable across input permutations, but it gives predictions ordering credit based on spec names. Renaming rows while preserving every paired score changes forecast raid-DPS NDCG from 0.865 to 0.872 and baseline M+-DPS NDCG from 0.790 to 0.722. The latter can range from **0.717 to 0.803** across tie orders. This matters more for external tier lists because they contain many tied values.

A synthetic four-healer forecast assigning everybody the same score can receive perfect NDCG and 3/3 top-k, or 0.841 and 2/3, solely from names. Spearman correctly returns unknown for that all-tied prediction.

The current conclusion that our forecast improves upon carry-forward survives every measured tie range. Recommended grading-method change: average DCG credit across tied forecast positions; use fractional or tie-inclusive top-k with an explicitly documented denominator. Add label-invariance tests, not only input-permutation tests. Keep frozen predictions intact and version/disclose any revised grading method. Until then, use Spearman as the primary source-ordering comparison and treat NDCG/top-k as secondary diagnostics.

### F4 — P2 for partial cohorts: small DPS groups get an impossible top-k denominator

Location: `src/report-card.mjs`, `rankingFor()` around line 268.

Three perfectly ordered DPS rows return `topK: { overlap: 3, of: 5, pct: 60 }`. The current complete 27-DPS report is unaffected; incomplete creator cohorts would expose the defect.

Clamp k to available paired rows, report the actual k and coverage, and explain that selecting the entire tiny field does not demonstrate useful top-choice discrimination. Alternatively withhold top-k when the field is too small. Test three- and four-DPS cohorts before using this helper for creators.

### F5 — P3: results are buried, and mobile scrolling loses row identity

Location: `src/render-forecast-report.mjs`, checkpoint layout and table/CSS helpers.

The first accuracy result starts at **y=876px** on a 900px desktop viewport and **y=1163px** on an 812px phone viewport. Technical composition/version prose comes before the result. The all-cells table adds 3,216px to page length.

On a 375px phone, the all-cells table has a 345px inner viewport and 965px content width. Scrolling its 620px range works, but spec, bracket, and forecast disappear entirely when the settled result/status is visible. This is a context problem, not whole-page overflow.

Put the brief result and carry-forward comparison immediately after coverage. Keep a plain-language outcome definition visible, and move detailed composition/version receipts into a methods disclosure. Use a compact mobile comparison or a carefully sized sticky identity column. Place both checkpoint summaries before the long cell table. A spec/role/bracket filter is useful later; it need not be a prerequisite for the smaller fixes.

## Suggested implementation order

1. Repair baseline metadata and CLI selection/settlement checks, with targeted regression tests.
2. Make the headline result and baseline easy to read; retain mobile row identity and verify both viewport sizes.
3. Agree on tie-aware grading, fix partial-cohort denominators, and disclose the grading-method revision.
4. Add source accountability using dated, immutable prediction receipts, same-cell model comparisons, within-role ranking, and publisher-excluded outcome sensitivity. Keep incomplete creator evidence visibly partial.
5. At the next forecast freeze, capture structured creator ranks/tiers, bracket, role, complete scale, source URL, publication date, collection date, conditional wording, and raw evidence. Save per-source outcome values/dates with settlement so future audits do not depend on reconstructing Git history.

Do not use this single checkpoint to change consensus membership or automatically weight sources. This audit evaluates the existing forecast and proposes improvements to accountability; it does not establish a general source-quality ranking across seasons.

## Evidence and reproduction

Evidence directory: [`audit-evidence/2026-09-08-forecast/`](audit-evidence/2026-09-08-forecast/).

- [`math-evidence.json`](audit-evidence/2026-09-08-forecast/math-evidence.json): both complete grades, all cells, tie ranges, small-cohort and CLI reproductions.
- [`source-accuracy.json`](audit-evidence/2026-09-08-forecast/source-accuracy.json): source mappings/URLs/dates, eight site cohorts, publisher-exclusion comparisons, eight creator videos, and the complete candidate inventory. [`source-accuracy-summary.json`](audit-evidence/2026-09-08-forecast/source-accuracy-summary.json) is a smaller numerical overview.
- [`deployment-check.json`](audit-evidence/2026-09-08-forecast/deployment-check.json): public HTTP statuses, exact hashes/sizes and audited SHA.
- [`browser-findings.json`](audit-evidence/2026-09-08-forecast/browser-findings.json), [`browser-details.json`](audit-evidence/2026-09-08-forecast/browser-details.json), and [`reading-order.json`](audit-evidence/2026-09-08-forecast/reading-order.json): measured browser behavior.
- Screenshots: [desktop top](audit-evidence/2026-09-08-forecast/report-1440-top.png), [phone top](audit-evidence/2026-09-08-forecast/report-375-top.png), [phone cells before scrolling](audit-evidence/2026-09-08-forecast/report-375-cells-start.png), [phone cells after scrolling](audit-evidence/2026-09-08-forecast/report-375-cells-end.png).

From the repository root, reproduce the calculations and failing edge cases with:

```powershell
node docs/audit-evidence/2026-09-08-forecast/reproduce-math.mjs
node docs/audit-evidence/2026-09-08-forecast/source-accuracy.mjs --write
```

The scripts read production data and historical Git objects, run read-only comparisons, and rewrite only their own evidence JSON. Both were rerun from these final paths. Source calculations independently reproduced, and every selected creator placement was reviewed against the historical text. They use the code currently checked out; the saved evidence above records the audited SHA's behavior before remediation. No dependencies were installed for this audit.
