# Forecast accountability implementation — September 8, 2026

Riley authorized all fixes, additions and live publication following the
[forecast audit](forecast-audit-2026-09-08.md). The implementation preserves the original
forecast, history, model weights and live inputs. The report's original 41% exact / 89%
within-one-band result is unchanged.

## Resolved findings

| Finding | Implemented behavior |
| --- | --- |
| Carry-forward lost source provenance | Copy original composition metadata; gate baseline figures independently. |
| Manual CLI dates could silently substitute snapshots or bypass settlement | Reject malformed/unavailable dates, resolve omitted sides from the declared cycle, and reserve GRADE for fixed +14/+28 checkpoints. Other comparisons are labeled exploratory DRIFT. |
| Alphabetical ordering broke tied-rank fairness | Grading method 2 averages tied NDCG positions and shares top-k boundary membership; prediction names cannot affect scores. |
| Sparse groups had impossible top-k denominators | Clamp k to the matched group; mark whole-group top-k non-informative. |
| Results and pending checkpoint were buried | Show both checkpoint summaries first; collapse methods and detailed evidence. |
| Phone evidence lost spec/prediction identity | Use labeled stacked records for cell and source comparisons; preserve native keyboard disclosures and offline use. |
| Earlier publisher/creator predictions were not accountable | Add eight publisher cohorts and eight named creator panels, containing 59 reviewed explicit placements. Preserve dates, source scales, context, supersession, exclusions and matched comparison counts. |
| Publisher outcome overlap could flatter its own prediction | Show publisher-excluded results and full-consensus agreement separately. Creator results are ordering-only, with no unproven author holdout. |
| Historical source evidence required Git reconstruction | Preserve a raw immutable Season 2 ledger. Build-time scoring needs no Git history or network. Future snapshots/freezes capture raw source receipts and eligible structured creator panels. |
| Later refreshes could rewrite checkpoint receipts | Preserve the first completed checkpoint on same-day retries; subsequent daily observations land on later dates. Preserve historical scales when grading old outcomes. |

## Validation

- Full local suite: **582 passed, 0 failed, 1 expected seasonal skip**; existing UI invariants ran.
- New source, creator intake and snapshot regression tests cover matched denominators,
  missing receipts, native creator ties, invalid provenance, source exclusions, historical
  scale changes, future checkpoint capture, duplicate scope, source-panel identity, frozen
  retry behavior and immutable same-day outcomes.
- New forecast browser invariants run under Chromium, Firefox and WebKit, covering
  keyboard navigation, disclosure behavior, offline loading, desktop summary placement
  and phone widths down to 320px. The CI browser matrix explicitly includes them.
- Deterministic source-ledger recovery verification passes. All 80 September 1 outcome
  cells reconstruct from the preserved raw publisher letters and historical scales.
- Production build passes. The tracker and gearing HTML remain unchanged; the generated
  forecast report contains the additions. Original forecast/history data remain unchanged.

Live publication is verified separately through the exact commit's GitHub Pages run and
the public deployment hash check. Local build success alone is not a deployment receipt.

## Continuing behavior

The +28 checkpoint remains pending until a saved outcome on or after September 15.
The ordinary refresh/build workflow will populate it, preserve its first outcome, and
score sources using that date's captured receipts. No scheduled date or forecast weight
was changed. [Source methodology and capture schema](source-predictions.md) document the
new intake lane. Historical creator panels remain dated statements with limited coverage;
they do not establish any creator's final launch opinion or objective spec strength.
