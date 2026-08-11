# 12.1 projection model — audit scope (2026-08-02)

**Status: P1–P5 complete. Shipped PROJECTION_VERSION 5 and 6; P4 and P5 closed with no
change, deliberately.** This document enumerates every input, weight and threshold in
`projectionFor`, states the justification each has, measures how much each actually moves
the output, and records what was changed and what was left alone. Sections are in audit
order; the resolutions are inline.

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

## The model as it stood at audit start (PROJECTION_VERSION 4)

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

## P1 resolved — shipped as PROJECTION_VERSION 5 (2026-08-02)

Options **A + C** adopted, moving **5 of 80** tier cells: Unholy DK raid B→A, Outlaw raid
B→C, Outlaw M+ A→B, Elemental raid B→A, Demonology raid A→B.

**A design detail changed on measurement.** C was first written as "an undated verdict
falls back to the tuning tally", which sounded more informative than discarding it. Built
that way it moved **13** cells, not 5. Cause: **13 of the 19 undated verdicts are
"Mixed"**, which reads as flat and therefore contributes nothing today — the fallback
would have converted all 13 into directional shifts at once, in precisely the case where a
line count is least trustworthy. "Mixed" is a theorycrafter saying the changes cut both
ways, and that read ages far better than a "Positive" does. Shipped as: an undated verdict
contributes **no** shift. Removing an untrustworthy input must not manufacture a new one.

## P3 findings (2026-08-02) — the meta nudge

The audit flagged the ±3 as moving as many tier cells as an entire external tier list. Two
facts found on inspection make it worse than the sensitivity table suggested.

**All 108 metaNotes come from one person.** The `generalCreators` lane has exactly one
contributor, izen (Izenhart). "The newest general-creator meta read" is always the same
individual, so the obvious remedies — weight by agreement, require corroboration — have
nobody to corroborate against today.

**Seven of 80 published tier cells are decided by that one read:**

| cell | without nudge → with | nudge |
|---|---|---|
| Demon Hunter Devourer raid | A+ → **S** | +3 |
| Demon Hunter Devourer mplus | A+ → **S** | +3 |
| Hunter Marksmanship mplus | A → A+ | +3 |
| Paladin Holy raid | B → A | +3 |
| Monk Brewmaster mplus | B → **C** | −3 |
| Rogue Outlaw mplus | A → B | −3 |
| Warrior Fury raid | A → B | −3 |

**The sentiment is volatile on its own terms.** 24 specs carry more than one live
(non-superseded) note and only the newest counts. izen's own read on Beast Mastery went
positive (07-06) → negative (07-09) in three days; Discipline positive → mixed; Devastation
mixed → negative. The nudge tracks whichever way the most recent one landed.

Also worth noting: only 2 of 4 sentiment values do anything — `mixed` (25 notes) and
`neutral` (6) map to 0 — so 31 of 108 notes are inert by design.

### The structural objection

Everything else in this tracker refuses to let one source decide a letter. The consensus
averages four tier lists precisely so no single outlet dominates; Murlok's numbers are
never converted to tiers; an era-gated PTR list is excluded from the mean. The meta nudge
is the **one** place where a single individual's unquantified sentiment moves a published
tier — and it currently does so seven times, including putting Devourer at S in both
brackets.

### Options

| option | effect today |
|---|---|
| **1. Stop feeding the nudge into the projection; keep displaying it** in the drawer's Meta outlook section | 7 cells revert; the qualitative read stays visible to readers, just not in the forecast |
| **2. Require ≥2 independent general creators to agree** | identical to option 1 today (one creator), self-reactivating if the lane grows |
| **3. Reduce the magnitude** (±1 or ±2) | fewer crossings, but no magnitude can *never* cross a band — it only makes single-source tier control rarer, not principled |
| **4. Keep as-is** | already disclosed in every basis string |

**Recommendation: option 2.** It is option 1 in practice today, but it states the actual
principle — corroboration, not deletion — and reactivates on its own if a second general
creator is ever registered. It is also the option most consistent with how every other
layer of this tracker already treats a lone source.

This one needs Riley's call: it removes a signal he deliberately added, and unlike P1 the
current behaviour is not internally incoherent — just single-sourced.

## P3 resolved — shipped as PROJECTION_VERSION 6 (2026-08-02)

Both constraints, because they are not independent.

**Corroboration.** A nudge now requires **≥2 general creators whose newest live reads
agree**, unanimously — matching the clause-unanimity rule `classifyHighlight` already
uses, since a lane that disagrees with itself is not evidence of a direction. Newest-per-
creator, so a prolific contributor cannot corroborate themselves.

**Bound.** The nudge may **no longer change the published tier**. The tier is decided by
evidence (base + outlook shift); the nudge then moves the score only *within* that band,
so it still drives the meter, the ordering and the basis string. This generalises the
objection instead of special-casing S — there is no principled reason a sentiment may
promote into A+ but not into S.

**Why both, and why the bound is the load-bearing one.** Asked directly whether five
creators agreeing should move Brewmaster C→B, the honest answer is *no* — so source count
alone was never the right gate, and a bare ≥2 rule would have quietly restored a behaviour
we do not endorse the first time the lane grew. Bounded, the answer flips to *yes*: several
agreeing reads adjusting a score without touching a letter is precisely what a nudge is.

**The reactivation path is tested, not dormant.** A code path that is unreachable today,
untested, and self-activating the first time someone registers a second creator would fire
months from now unattended and start moving published output with nobody watching — worse
than an honest deletion. `test/render.test.mjs` therefore stands up a synthetic two-creator
lane and pins: the quorum firing, the bound holding at the band ceiling (87 not 89) and
symmetrically at the floor (74 not 72), disagreement producing nothing, one creator's two
notes counting as one voice, and superseded/off-bracket/undated reads failing to pad a
quorum.

### Net effect, v4 → v6: 10 of 80 tier cells

| | |
|---|---|
| P1 (v5) | Unholy DK raid B→A · Outlaw raid B→C · Elemental raid B→A · Demonology raid A→B |
| P3 (v6) | **Devourer raid S→A+** · **Devourer M+ S→A+** · Marksmanship M+ A+→A · Brewmaster M+ C→B · Holy Paladin raid A→B · Fury raid B→A |

Devourer coming off S in both brackets is the headline: it was the clearest case of an
input named "nudge" deciding the top of the chart on one person's sentiment.

The qualitative read is unchanged and still rendered in the drawer's Meta outlook section.
It stopped steering the forecast; it did not stop being published.

## P4 and P5 closed with no change (2026-08-02)

### P4a — the finding that outranks every weight question

**21 of 40 raid cells have a base that is 100% the 12.0.7 consensus.** Not weighted
towards it — entirely it. Their basis strings read `live baseline 49 · outlook 0`, with no
PTR term of any kind. A further 19 are prior + Dummy Dome. **No raid cell has a PTR
raid-testing term at all**, because every zone-54 row sits below `MIN_RANK_N` (34 of 74
testing rows are unranked; the n distribution is min 1, p25 4, median 40).

**Re-verified 2026-08-02 after the local run restored all five WCL rDPS cuts** (master
`bf69002`): still 21 prior-only raid cells, still **zero** with a raid-testing term. So
this was never the outage — fresh zone-54 data changes nothing, because the testing
population itself is tiny-n (world-first testers on templated gear) and sits below the
floor regardless of how recently it was fetched. The finding is structural, not
transient.

So for half the raid bracket, "our 12.1 forecast" is last patch's consensus plus a tuning
shift. That is not a modelling error — it is the honest consequence of the PTR raid data
not existing yet — and **the model already says so: all 21 are tagged `low` confidence.**
The confidence ratio introduced in v3 is doing exactly the job it was built for.

No change made. Reweighting cannot manufacture evidence, and lowering `MIN_RANK_N` to
admit n=1–4 medians would reintroduce precisely the defect audit D7 removed. The fix is
data — the WCL API recovering, or a local run restoring the series — not a coefficient.

**Handover to the UI pass:** a `low`-confidence letter currently looks identical to a
well-evidenced one in the "Ours: 12.1" column. The disclosure exists but lives in the
basis string, which means hovering or opening the drawer. Half the raid forecasts are
carrying that caveat invisibly. That is a presentation problem, not a model one, and it is
the single highest-value thing the UI/UX pass could address.

### P4b — the other blend questions, measured and left alone

- Effective prior weight after renormalization: 100% when it is the only term (21 raid
  cells), 69% with the PTR list only, 55% with the empirical, 44% with all three. The
  spread is entirely driven by which evidence exists, not by the coefficients.
- Dummy Dome is DPS-only, so healers and tanks blend fewer terms. Confidence accounts for
  this since v3; the blend deliberately does not, because renormalizing already gives the
  remaining terms their full share.
- No time decay on the prior. Worth revisiting **after** the grade — with 21 cells resting
  entirely on the prior, decaying it today would just move them toward an empty middle.

### P5 — band fit, and a real compression signal

The projection maps through bands calibrated for consensus means. Comparing distributions:

| bracket | source | mean | sd | band spread |
|---|---|---|---|---|
| raid | consensus | 58.9 | 18.2 | C7 B14 A9 A+8 S2 |
| raid | projection | 58.3 | 18.7 | C9 B12 A10 A+6 S3 |
| mplus | consensus | 60.1 | 16.2 | C5 B11 A15 A+5 S4 |
| **mplus** | **projection** | **59.3** | **14.3** | **C3 B18 A12 A+6 S1** |

Raid fits well. **M+ is compressed**: sd 14.3 against the consensus's 16.2, with 18 specs
piled into B and only one reaching S where the consensus has four. That is regression
toward the mean, the expected behaviour of any averaging model — and it means the forecast
systematically under-calls extremes.

No change made, on purpose. Correcting variance without accuracy evidence risks
overshooting in the other direction, and the drift metric cannot adjudicate it (a
compressed forecast that hugs the middle would *improve* its drift score). This is exactly
what the post-launch grade is for: if S2 settles with four S-tier M+ specs and the frozen
forecast called one, the compression is real and quantified. Recorded here so that check
gets made rather than rediscovered.

## Recommended freeze

The model is coherent as of v6 and the two open questions (prior decay, M+ compression)
both need the grade to settle. **Freeze at v6 through launch.** Reopen once the first
settled Season-2 consensus exists and the report card can rank options on accuracy rather
than coherence.

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

---

## Addendum — second external audit (of v7), 2026-08-04

A second outside audit reviewed v7 (the expert-take integration). Bottom line accepted:
v7 is materially safer than v6, but three correctness issues had to land before freezing
any forecast. All were verified against the data before acting — every count reproduced —
and all shipped as **PROJECTION_VERSION 8** (+ RANK_VERSION 3) the same day.

| # | Finding | Verified | Disposition |
|---|---------|----------|-------------|
| 1 | Specialist takes leak between brackets — `expertRead()` had no bracket input; 33 of 99 live PTR takes are M+-scoped, 7 raid-scoped; Mistweaver raid carried a −2 built from three M+ tier-list reads | ✓ (33/7 measured; MW takes listed) | **Fixed.** The projection's read is bracket-scoped (explicit `take.bracket` wins, else the same patchContext heuristic the meta nudge uses; neither → both). The whole-spec arrow stays unscoped. MW raid: S/98 → S/100 ("live S-tier prior; exact 12.1 rank unresolved" — the audit's requested reading). |
| 2 | Thin Dummy Dome observations remained in the reference field — excluded from their own composite but still in everyone's denominator | ✓ (structural) | **Fixed.** `fieldByCount` now holds only cuts clearing MIN_RANK_N; thin cuts display against the clean field (member-aware midrank so a thin outlier can't read >100%). All 10 scored composites moved, 5 dummy ranks — RANK_VERSION 3. |
| 3 | Take `sentiment`/`patchContext` unvalidated — a single-field mutation crossed tier boundaries with nothing failing red | ✓ (validate.mjs takes loop had no such gates) | **Fixed.** sentiment enum (buff\|nerf\|neutral\|mixed), patchContext + date required, optional bracket enum, superseded boolean — all fail validation red. |
| 4 | Confidence inconsistent — the expert adjustment moved scores while omitted from the signal count; 5 cells read "prior-only" with a score ≠ prior; the UI tooltip claimed "No PTR evidence" | ✓ (exactly 5 cells reproduced, MW raid among them) | **Fixed.** The take lane is a counted signal type (numerator and denominator; never double-counted when it drives the direction). Zero prior-only cells with a moved score remain. |
| 5 | Report card: top-k/NDCG order-dependent on ties; grade measures agreement with settled publisher consensus, not realized strength | ✓ (bare score sorts) | **Fixed / documented.** Deterministic spec-name tiebreak on every ranking sort (pinned by a permutation test); the publisher-consensus caveat now leads the module header. |

Net v7→v8 effect at ship: 25 of 80 projection scores moved, 5 tiers
(Guardian raid A+→S, Resto Druid raid A+→S, Arcane raid A→B, Frost Mage raid A+→A,
Marksmanship M+ A+→A), 30 confidence tags.

**Deferred, deliberately** (the audit's own "coefficient tuning can wait"): the v8
statistical redesign it sketches — explicit per-take scope at distillation time,
continuous sample-size shrinkage, WCL+Robydoby as one correlated family, partial pooling
toward role means, rank intervals / top-three probabilities, confidence as posterior
uncertainty. These change the model's *shape*, not its honesty, and belong after the
report card grades the frozen forecast — the harness that can tell whether they help.
The explicit `bracket` field on takes is already supported end-to-end, so distillation
can start writing it now.

### v9 — the owner reweight (2026-08-04, same day, after v8 shipped)

Distinct from everything above: **not an audit finding — an editorial prior, recorded as
such.** Riley: "we are giving a little too much weight to the baseline… shift some more
weight into the actual creator / expert takes and maybe the math of ptr changes and
reviews." All three decisions clicked in-session: prior .55→.35 and PTR list .25→.30 in
the base blend; outlook shift cap ±7→±10 (dated verdict 10, tally 4/7/10, expert-driven
≤9); expert adjustment ±4→±6 with a **quorum rule** — a ≥3-creator corroboration-shrunk
panel may move the published letter by ONE band, disclosed in the basis. The quorum rule
is the single deliberate loosening of the v6 "sentiment never moves a letter" bound; the
bound's objection was single-source authority, and a ≥3-creator shrunk panel is its
opposite. The meta nudge stays within-tier (one contributor).

The justification is the honest kind v5 established (coherence/priors, never fitting the
drift number): the prior is the 12.0.7 consensus — evidence about a meta that dies at
launch — and renormalization confines the reweight to cells holding real PTR evidence
(prior-only cells: measured 0 moved). Measured v8→v9: 61 of 80 scores, 13 tiers, exactly
3 quorum crossings (Mistweaver M+ S→A+ on three healer specialists' nerf reads; Arms
raid A→A+ and Arms M+ A+→S on its five-creator bullish panel).

> **CORRECTION (2026-08-11): the freeze landed at `PROJECTION_VERSION` 13, not v9.** The line
> below was written when v9 was current and was never updated as v10–v13 shipped (the raid
> prior-only reweight, the healer/tank quorum removal, the percentile units fix). The
> immutable artifact `data/forecasts/frozen-2026-08-11.json` records `projectionVersion: 13`,
> and that is what the report card grades. The authoritative version log is the inline
> commentary at `src/render.mjs:640-806`, not this document — read it there first. This
> document's "Freeze at v6" heading is likewise superseded by its own v9 addendum and now by
> this note.

The intent below still holds, with v13 substituted for v9: the frozen forecast should encode the owner's actual
pre-launch read, and the carry-forward baseline it must beat still copies the frozen
live consensus forward, so the report card can say whether the conviction was earned.
