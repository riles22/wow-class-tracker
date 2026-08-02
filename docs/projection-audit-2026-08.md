# 12.1 projection model — audit scope (2026-08-02)

**Status: SCOPE ONLY. No model change has been made.** This document enumerates every
input, weight and threshold in `projectionFor`, states the justification each currently
has, measures how much each one actually moves the output, and lists what evidence would
change it. Riley reviews this before anything is touched.

## Why now, and why it cannot wait until after launch

12.1 lands **Aug 11**, Season 2 **Aug 18**. At that boundary the pre-launch projection
freezes and becomes the thing the forecast report card grades against the first settled S2
consensus. Two consequences:

1. Auditing *after* launch means grading a model we already knew was flawed.
2. Any weight change bumps `PROJECTION_VERSION`, and the version markers exist precisely so
   two formulas are never averaged into one series. A post-launch change orphans the
   pre-launch forecast — there is no series left to grade.

So the audit window is now through ~Aug 10. After that the model should be frozen on
purpose, not by accident.

## The model as it stands (PROJECTION_VERSION 4)

Per spec and bracket, everything on one 0–100 axis:

```
base  = weighted mean of { live consensus score      w .55
                           PTR empirical             w .45
                           external PTR tier list    w .25 }   renormalized when absent
  PTR empirical = mean of { zone-54/56 testing percentile  w 2
                            Dummy Dome composite           w 1   (DPS only) }
shift = outlook direction:  up +7 · down −7 · flat 0
nudge = newest general-creator meta note: positive +3 · negative −3
score = clamp(base + shift + nudge, 0, 100) → tier via the consensus bands
confidence = signals present ÷ signals obtainable (all → high · >half → medium · any → low)
```

Supporting thresholds: `MIN_RANK_N = 10` (metric rows below 10 parses carry no rank, so
they drop out of the empirical term), Dummy Dome coverage floor (a spec needs all but at
most one target count to earn a composite), consensus bands S≥88 / A+≥74 / A≥58 / B≥40 / C≥0.

## Measured sensitivity — which knobs actually move the output

Each variant re-ran the full build and counted how many of the 80 projection tier cells
changed against the current model.

| knob | perturbation | tier cells moved | max score delta |
|---|---|---|---|
| **outlook shift** | ±7 → 0 (remove) | **12 / 80** | 7 |
| **outlook shift** | ±7 → ±12 | **11 / 80** | 5 |
| **outlook shift** | ±7 → ±4 | **6 / 80** | 3 |
| **PTR tier list** | .25 → 0 (remove) | 5 / 80 | 9 |
| **meta nudge** | ±3 → 0 (remove) | **5 / 80** | 3 |
| **meta nudge** | ±3 → ±6 | 5 / 80 | 3 |
| prior | .55 → .45 | 4 / 80 | 4 |
| empirical | .45 → .55 | 3 / 80 | 4 |
| PTR tier list | .25 → .40 | 3 / 80 | 4 |
| prior | .55 → .65 | 2 / 80 | 3 |
| empirical | .45 → .35 | 2 / 80 | 5 |
| PTR tier list | .25 → .15 | 1 / 80 | 3 |
| testing:dummy | 2:1 → 1:1 | 1 / 80 | 4 |
| testing:dummy | 2:1 → 3:1 | **0 / 80** | 2 |

**The headline: the additive shifts dominate, and the weights barely matter.** Every base
weight can be moved ±0.10 and at most 4 of 80 tiers change. Deleting the outlook shift
changes 12. The blend is robust; the constants bolted on after it are what decide tiers.

**The asymmetry worth staring at:** removing the meta nudge moves **5** tier cells —
exactly as many as removing the entire external PTR tier list. One creator's sentiment,
expressed as a ±3, has the same tier-moving power as a full 40-spec third-party tier list
weighted at .25. Doubling the nudge to ±6 moves the same 5 cells, which tells us it is
tipping borderline cells rather than expressing magnitude.

**Candidate for deletion:** the testing:dummy 2:1 ratio is inert — 3:1 changes nothing at
all, 1:1 changes one cell. It is a tuning knob that does not tune.

## Questions the audit must answer, in measured-influence order

### P1 — the outlook shift (±7), the single biggest lever

- **Magnitude is discarded.** Direction is three-valued, so a spec at +8/−1 receives the
  same +7 as one at +1/−0. Should the shift scale with the balance, or with the count of
  builds the spec appears in? Evidence: compare tier accuracy of both forms against the
  first settled S2 consensus, once it exists.
- **A writeup verdict overrides the tally entirely** and, historically, writeups carry no
  date — 29 are grandfathered as undated in `UNDATED_WRITEUPS`. A verdict distilled in June
  still drives a full ±7 today. The `contradicted` flag annotates the disagreement in the
  basis string but changes nothing. Options: decay a verdict's authority with age, require
  `asOf` before a verdict may drive the shift, or let the tally override a stale verdict.
- **±7 straddles a band boundary by construction.** With bands 18 points wide (A 58–73),
  a ±7 is ~40% of a band: enough to move a mid-band spec only when it is already near an
  edge. Is a discrete jump the right shape at all, versus scaling into the band?

### P2 — what feeds the direction

- `classifyHighlight` now requires clause unanimity (v4), so mixed lines abstain. That is
  new as of 2026-08-01 and its effect on direction has not been observed over a full cycle.
- Class-wide lines reach the drawer but are excluded from *scoring*. A class-wide buff that
  genuinely lifts every spec therefore never votes. Deliberate, but worth re-testing.
- The 9 specs with no writeup fall back entirely to the tally, so their forecast rests on
  how completely we distilled the notes — which the 2026-08-01 backfill just changed
  substantially (118 → 190 spec-build entries).

### P3 — the meta nudge (±3)

- One creator, one sentiment, no magnitude, and it moves as many tiers as a whole tier
  list. Options: weight by how many general creators agree, require two independent reads,
  or fold it into the empirical term rather than as an additive shift.
- Supersession and bracket-scoping are handled; recency beyond "newest wins" is not.

### P4 — the base blend (low priority, measured robust)

- Is .55 on a **12.0.7** consensus too much as PTR evidence matures? There is no time
  decay: the prior weighs the same on Aug 10 as it did on Jun 18 with no PTR data at all.
- Dummy Dome is DPS-only, so healers and tanks blend two terms where DPS blend three.
  Confidence now accounts for this; the blend does not.
- `MIN_RANK_N = 10` against zone-54 samples of n≈3–100 means many specs have no testing
  term. Is 10 the right floor, and should the empirical term abstain rather than
  renormalize when it is thin?

### P5 — structural, not a knob

- The projection maps through **consensus bands** that were calibrated for consensus means,
  not forecasts. Nothing has checked the band edges are right for this distribution.
- **Nothing measures whether past projections were correct.** The report card is designed
  but does not exist. Without it the audit can only reason about coherence, not accuracy.

## Proposed method

1. **Build the report card first, retrospectively.** We have enriched history snapshots
   back through the cycle. Grade older projections against *today's* consensus as a dry
   run — it will not be the real grading, but it exercises the machinery and gives the
   first empirical read on whether the model is biased up or down.
2. **Backtest each P1/P3 option** against that harness rather than arguing from taste.
3. **Bring findings back for approval before any weight moves.** Any change bumps
   PROJECTION_VERSION and must land before Aug 11 or wait until after the report card.
4. **Freeze deliberately on ~Aug 10** and record the freeze in the log.

## Deliverables

- The forecast report card, implemented and runnable retrospectively.
- A backtest table: current model vs each proposed variant, scored against settled tiers.
- A recommendation per P1–P4 with the evidence behind it.
- Whatever code change is approved, with PROJECTION_VERSION bumped and the rationale in the
  version comment, following the existing v1–v4 convention.

## Explicitly out of scope without a separate decision

- Changing the consensus bands (they govern the consensus column too, not just projections).
- Adding new data sources to the blend.
- Anything touching `SNAPSHOT_PHASE` or the launch transition — separate workstream.
