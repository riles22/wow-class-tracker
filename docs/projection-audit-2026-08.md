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

## First measurements from the report card (2026-08-02)

`src/report-card.mjs` is built and runs retrospectively. Sweeping every snapshot that
carries a projection against the newest consensus gives this:

| horizon | forecast | proj v | exact | within 1 | MAE (bands) | bias (bands) | bias (pts) |
|---|---|---|---|---|---|---|---|
| 23 d | 2026-07-10 | 1 | 43% | 86% | 0.71 | −0.14 | −3.0 |
| 19 d | 2026-07-14 | 1 | 43% | 89% | 0.69 | −0.11 | −3.1 |
| 15 d | 2026-07-18 | 1 | 44% | 86% | 0.70 | −0.17 | −3.8 |
| 10 d | 2026-07-23 | 1 | 43% | 89% | 0.69 | −0.14 | −4.0 |
| 8 d | 2026-07-25 | 2 | 46% | 88% | 0.66 | −0.14 | −3.5 |
| 5 d | 2026-07-28 | 2 | 48% | 85% | 0.69 | −0.21 | −3.4 |
| 3 d | 2026-07-30 | 2 | 46% | 85% | 0.70 | −0.17 | −2.5 |
| **2 d** | 2026-07-31 | **3** | 50% | 90% | 0.61 | **+0.01** | **−0.6** |
| **1 d** | 2026-08-01 | **4** | 50% | 91% | 0.61 | **+0.01** | **−0.1** |

Two findings, one of them load-bearing for how the audit should proceed.

**1. Error does not grow with horizon.** A 23-day-old forecast scores MAE 0.71 bands; a
1-day-old one scores 0.61. If the gap between projection and consensus were accumulated
meta movement, it would widen with distance — it barely does. So the ~0.65-band standing
gap is *structural*, not drift. That is what makes it worth auditing at all.

**2. The v2→v3 boundary removed a persistent pessimistic lean.** Every v1 and v2 forecast
sits ≈0.15 bands / 3–4 points BELOW the live consensus, and that lean does not shrink as
the horizon shortens (v2 at 8 days is −0.14, v2 at 3 days is −0.17). At v3 it goes to
+0.01 / −0.6 and stays there at v4. The jump lands exactly on the version boundary, not on
a horizon boundary, which points at the change itself: v3 added the external PTR tier list
to the base. It appears to have been correcting a real bias, not just adding noise.

### The trap this metric sets, stated before anyone optimises into it

A projection identical to the live consensus would score **100% exact, zero bias** — and be
worthless, because it forecasts nothing. Drift rewards the trivial model. It is therefore
diagnostic only: useful for spotting a systematic lean, never a target to tune toward.
Nothing in the audit may be justified by "it improves the drift number". Only the
post-launch grade, against a settled Season-2 consensus, can score accuracy.

The corollary matters too: v3's bias of ~0 is not automatically *better* than v1's −0.15.
It means the forecast now sits centred on the live picture. Whether that is right depends
entirely on how much 12.1 actually moves the meta — which is precisely what the real grade
will answer and this one cannot.

### Also worth noting

- Confidence is doing real work: `high`-confidence cells score MAE 0.64 vs `medium` at
  0.78. The tag is not decorative, which is mild evidence for the v3 ratio change.
- Tanks are the weakest cohort (33% exact, MAE 1.0 across 12 cells) and healers the
  strongest (57%, MAE 0.5). Small n, but consistent with tanks having the fewest
  obtainable signals.
- Snapshots before 2026-07-09 carry no projection at all. The grader returns "nothing to
  grade" for them rather than a 0% score, which would read as total failure.

## P1 findings (2026-08-02) — what the ±7 is actually doing

Removing the shift moves 12 of 80 tier cells. Those 12 are the forecasts that rest
entirely on the least principled term in the model, so they are worth naming:

| cell | without shift → with | driver |
|---|---|---|
| Death Knight Unholy raid | A → **B** | **UNDATED** verdict *Negative* |
| Rogue Outlaw raid | C → **B** | **UNDATED** verdict *Positive* |
| Rogue Outlaw mplus | B → **A** | **UNDATED** verdict *Positive* |
| Demon Hunter Havoc raid | B → A | dated verdict *Positive* |
| Paladin Holy raid | B → A | dated verdict *Positive* |
| Shaman Restoration mplus | A → A+ | dated verdict *Positive* |
| Druid Guardian raid | A+ → **S** | tally 4/0 |
| Druid Guardian mplus | B → A | tally 4/0 |
| Druid Restoration raid | A+ → **S** | tally 3/1 |
| Warlock Destruction raid | B → A | tally 4/1 |
| **Shaman Elemental raid** | A → **B** | **tally 0/1 — one nerf line** |
| **Warlock Demonology raid** | B → **A** | **tally 1/0 — one buff line** |

Six verdict-driven, six tally-driven, **three driven by a verdict with no date at all**.

**Two defects are now quantified rather than asserted.**

*Magnitude is discarded, and it matters.* Among specs with no writeup, the tallies on file
span `0/1`, `1/0`, `1/1`, `2/3`, `3/1`, `4/0`, `4/1`, `5/0` — and every one receives the
identical ±7. Elemental Shaman's raid forecast drops a full band on the strength of **one**
nerf line; Demonology gains one on **one** buff line; Guardian's 4/0 and Destruction's 4/1
are worth exactly the same as those singletons.

*Undated verdicts move tiers.* Validation already requires `ptr.asOf` on every NEW writeup,
and `UNDATED_WRITEUPS` is an explicitly shrink-only list of 19 grandfathered exceptions. But
the model does not honour that distinction: an undated verdict drives a full ±7 today, and
three tier cells currently rest on one. Unholy DK's raid forecast is a band lower because of
a *Negative* read whose date nobody recorded.

### Candidate fixes, characterised

| option | change | tier cells moved |
|---|---|---|
| **A** | shift scales with tally strength (1 line → 3, 2 → 5, 3+ → 7; verdicts keep 7) | 2 |
| **B** | flat floor: `\|balance\| ≤ 1` → 3, else 7 | 2 (identical to A today) |
| **C** | an undated verdict may not drive the shift; fall back to the tally | 3 |

A and B are indistinguishable on current data because no spec sits at `\|balance\| = 2`;
A generalises, B has a cliff there. C is orthogonal to both — it fixes provenance, not
magnitude, and can be adopted alongside. Together: 5 of 80 cells.

C's honest cost: Outlaw *loses* two bands (raid B→C, M+ A→B) because an undated Positive
read was lifting it. That is the point — without a dated source we should not be lifting it.

**What this evidence is and is not.** These options are justified by *coherence*, not
accuracy: the current behaviour is indefensible on its own terms (one line worth the same
as five; an unfalsifiable input moving a band), not "the new behaviour scores better".
Nothing here was chosen by improving the drift number, per the trap above. Only the
post-launch grade can rank them on accuracy.

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
