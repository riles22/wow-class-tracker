# Historical prediction accountability

The forecast report compares the frozen model with preserved publisher lists and named,
dated creator panels. It measures agreement with settled publisher opinion. It does not
measure objective spec strength or change any live ranking or model weight.

## Comparison rules

- Same-cutoff Season 2 publisher lists, previous-season carry-forward lists, later
  prelaunch publisher lists, and individual creator panels are separate cohorts.
- Advanced comparisons compare each source with the model and prior on the same covered
  spec/bracket cells. Missing placements, missing outcomes and missing baseline cells have
  explicit counts and exclusions. Roles are ranked separately.
- The primary view answers **how many were right** and shows each original prediction
  beside the dated outcome. Riley chose main-letter matching: A−, A and A+ all count as A,
  and S+ counts as S. This applies consistently to the model, sites and creator tier lists.
  The displayed original labels are never rewritten. This is a coarse label match, not a
  calibration of what each author meant by a tier. A source's simple count does not depend
  on whether our own model or prior forecast is available for the same spec.
- Numeric predictions are checked as places within their recorded comparison group.
  Kalamazi's panel ranks the three Warlock specs; it is not a three-tier list. Outcomes
  tied across a predicted place cannot be judged as an exact place and remain unscored.
  Missing or conditional predictions and missing outcomes are also unscored, never wrong.
- Advanced publisher comparisons retain their historical numeric scales. Creator ordering
  still uses the native order; creator letters are never assigned invented numerical
  distances or converted to the tracker's consensus bands. Advanced normalized exact-tier
  percentages are a different measure from the primary main-letter count.
- Publisher holdouts remove that publisher from the outcome and compare all three predictors
  against the resulting answer key. Holdouts from different publishers have different answer
  keys. Creator authorship within publishers is not independently recorded, so no creator
  author holdout is claimed.
- Grading method 2 averages NDCG over tied forecast positions and uses fractional top-k
  membership at tied boundaries. The effective k cannot exceed the covered group size;
  whole-group top-k is marked non-informative. Model version and grading version are separate.
- A +14 or +28 checkpoint uses the first eligible saved outcome after its deadline. Later
  builds do not move an already-selected checkpoint. Raw receipts are verified against every
  saved outcome cell before holdout scores are shown. Without raw receipts, holdouts remain
  unavailable rather than borrowing another date's letters.

## Preserved Season 2 evidence

`data/predictions/s2.json` is an immutable raw ledger recovered from reviewed Git history.
It preserves freeze identity, historical roster, native source scales, dated source pages,
raw placements and September 1 outcome letters. The frozen forecast and old history files
are unchanged. `src/recover-source-predictions.mjs` documents deterministic recovery;
normal builds read the ledger without Git history or network access.

The eight creator panels represent particular published videos. Some statements had already
been superseded by the freeze, some cover a single class, and some concern world-first raid
or very high keys. Their dates, evidence and scope remain visible. They are not a composite
claim about any creator's final launch view.

For the September 1 outcome, the simple creator counts are Zorthas 16/29, AutomaticJak
Mythic+ 3/5 and raid 1/5, YoDaTV 4/6, LBNinja7 2/3, MadSkillzzTV 2/5, Bansherz 1/3,
and Kalamazi 1/3 exact places among the three Warlocks. These are 56 tier predictions
and 3 rank predictions. Each card's total can be checked directly against its result rows.

## Future creator capture

`data/creator-predictions.json` is the optional intake ledger. Its initial empty state is
intentional: historical Season 2 recovery lives in the immutable ledger, not a backdated
new intake. Only content actually read and explicitly ranked may enter this file.

```json
{
  "schemaVersion": 1,
  "panels": [{
    "id": "author-video-date",
    "label": "Author — dated Mythic+ panel",
    "creator": "Registered creator name",
    "season": "s3",
    "date": "2026-10-01",
    "capturedAt": "2026-10-02",
    "scope": { "brackets": ["mplus"], "roles": ["DPS"] },
    "scopeNote": "Source's stated key range, difficulty and tuning assumptions",
    "nativeOrder": ["S", "A", "B", "C"],
    "pages": [{ "url": "https://youtu.be/VIDEO_ID", "published": "2026-10-01", "snapshot": "2026-10-02" }],
    "rows": [{
      "key": "Mage|Arcane", "bracket": "mplus", "tier": "A",
      "date": "2026-10-01", "url": "https://youtu.be/VIDEO_ID?t=123",
      "context": "Source's season, PTR/live and content lens",
      "text": "Faithful paraphrase of the explicit placement, not a fabricated quote.",
      "supersededAtFreeze": false
    }]
  }]
}
```

This is a schema example, not a real prediction. `scope.keys` may narrow a class-only panel;
without it coverage includes the historical roster for the declared roles/brackets. Preserve
the complete native ordering used by the panel. A missing or conditional placement uses
`tier: null` with `reason`; a conditional claim also records `conditional: true`. Do not
combine several videos into one undated opinion or supply missing placements from memory.

Ordinary snapshots now save raw publisher letters, scales, registry/page dates and season
policy alongside their consensus. Future owner-declared freezes also save those receipts and
creator panels captured by that date for the declared target season. Equivalent freeze retries
preserve original bytes; changed declarations fail. A new cycle can build its source report
from that artifact without another history reconstruction. Old immutable records remain intact.
