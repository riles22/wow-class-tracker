# Spec Finder — design audit (2026-07-01)

A research-backed audit of the "Find my spec" module: how spec-recommenders are best
designed (WoW-community practice + multi-criteria decision analysis + uncertainty
handling), and where our implementation stands against it. Every finding below was
**adversarially verified against the actual code** — generic recommender advice that
didn't hold up for our tool was dropped.

Method: 3 research agents (WoW practice, MCDA/recommender design, uncertainty/signal
handling) → 1 audit agent reading the real finder code + data → per-finding skeptic
verification. Full run: task `wtmvpdsl2`.

## Verdict

The finder is a well-built compensatory weighted-sum recommender that **correctly honors
the project's honest-source-typing rule** (tier ≠ raw output ≠ representation kept as
separate opt-in signals) and degrades gracefully. It has no fatal scoring flaw — the
feared "a high overall score buries the dealbreaker you asked for" was tested and
**refuted**. The worthwhile improvements are: stop ranking tanks by damage, stop letting
*draft* PTR verdicts pose as confirmed signal, add the one missing decision axis every
WoW guide leads with (**complexity/difficulty**), and add the community's core "skill
beats spec, meta only bites at the high end" framing. Everything else is small polish.

## What the research says (principles we should meet)

**WoW-community practice** (Wowhead, Method, Icy Veins, Overgear, wowclasspicker):
- Lead with **fun/fantasy**, not meta — every authoritative source opens with "pick what
  connects with you"; meta is a secondary, opt-in filter.
- The decision spine is **role → ranged/melee → complexity tolerance → solo-vs-group**.
- Score on the full toolkit: complexity, survivability, mobility, group utility
  (Bloodlust/battle-rez/interrupts), leveling-friendliness — not just DPS.
- **Contextualize meta by difficulty**: it barely matters below title-range M+ (~+12) and
  CE raiding; "bring the better player, not the better spec." Reassure that *every spec
  clears the content*.
- Frame results as a **shortlist of 2-3 great fits**, not one "correct" answer;
  main-choice is iterative.

**Recommender / MCDA design:**
- Split **hard filters** (must-haves, screened before scoring) from **soft weights**.
- **Skip-and-renormalize** missing data (never impute a mean/zero).
- **Audit for correlated / double-counted criteria** (an aggregate rating that already
  contains a sub-metric you also score).
- Avoid **false precision** in the result score; prefer per-criterion "why" over one %.
- Surface **near-ties** rather than forcing a spurious #1-vs-#2 order.

**Uncertainty / signal handling:**
- Keep tier / median-throughput / ceiling / representation as **distinct honest axes** —
  never blend into one grade. Tier is the honest *default* (it folds in everything).
- **Down-weight and visibly flag volatile inputs** (PTR, low-n); don't let PTR data pose
  as confirmed. Confidence should scale with n, source agreement, and era.

## What we already do well (validated)

- **Honest source-typing carried into the recommender.** "Chase the strongest" = tier
  (holistic); raw output and meta-share are separate opt-ins; the panel header spells out
  the distinction. Matches CLAUDE.md rule 3 and the research's #1 principle.
- **Role and melee/ranged are hard filters**, not soft weights — the correct decision spine.
- **Skip-and-renormalize** for missing criteria is implemented correctly (weight only
  accrues for non-null criteria) — the best-practice missing-data handling.
- **No compensatory-masking failure** (verified, not assumed): re-running the real scoring,
  a mobility-1 S-tier spec (Destruction Warlock) lands **#26/27** when the user selects
  "High mobility." The soft weights already demote dealbreakers hard enough that a
  non-compensatory floor would add complexity for no benefit.
- **No tier/representation double-count** (verified): consensus is computed only from
  `kind:"tier-list"` sources; representation is `kind:"metrics"` and structurally excluded.
- **Per-result explainability** (why-chips) and **deep-link to the spec drawer** are both
  best-practice touches already present.

## Findings (verified, prioritized)

### Ship — high value

1. **Tanks are ranked partly by damage output** — `throughput()` feeds a tank's
   DPS percentile into its "strength" score and a "raw output" chip. Ranking tanks by DPS
   is meaningless for tank *strength*. *Fix (small):* tanks get no throughput signal by
   default. **Refined per user feedback:** "I want a hard-hitting tank" is a valid
   *preference*, so tank damage is now **opt-in** — `throughput()` returns null for tanks
   unless the user ticks "Highest raw output", in which case tanks rank by damage-among-tanks
   with a "#n/6 tank damage" chip. Default off (audit), explicit on (player choice).

2. **Draft PTR verdicts pose as confirmed signal** — `outlookScore` gives a full up=1.0 to
   any Positive verdict, including `draft:true` writeups distilled from unconfirmed Wowhead
   articles, at ~.12 weight. *Fix (small, in render.mjs `outlookFor`):* gate the verdict
   path on the draft flag so draft specs fall through to the buff/nerf-line balance instead
   of inheriting a full verdict; self-heals when Riley confirms (deletes the draft flag).
   Relabel the chip "rising in 12.1 **(PTR)**"; add a muted "outlook: draft" caveat chip
   when the basis is a draft. This is the one place unverified data drives a hard signal.

3. **Add a complexity / difficulty axis** — the single most-cited beginner selection factor
   and the biggest genuine gap; all six current questions are power/utility signals, so even
   "Just for fun" only reshuffles those. *Fix (medium):* add a live-sourced
   `playstyle.complexity` (1-5, from Wowhead/Icy-Veins difficulty ratings — **fetched, not
   authored**), one question ("prefer simple or deep?"), and a soft criterion mirroring
   mobility (skipped when absent). Skip the fantasy/lore branch — it needs authored taxonomy
   this performance-focused tool can't source, and conflicts with the tool's identity.

4. **No "skill beats spec / meta only bites high-end" framing** — the community's dominant
   wisdom is absent, so meta advice is never contextualized. *Fix (small):* one static line
   in the panel header: "Every spec clears normal/heroic and low-mid keys — below
   title-range M+ and Cutting Edge, the player matters more than the spec."

### Ship — small polish

5. **SURV_MAP has dead entries** (`A+`, `D`) — Archon survivability only emits S/A/B/C.
   Delete them; add a one-line comment that it's a deliberate hand curve aligned to the
   consensus band centers.
6. **Cross-role score comparability** — when a fight type is selected, DPS get a `fight`
   criterion and tanks/healers get null, so their match numbers use different denominators.
   *Fix (small):* treat a selected-but-absent fight criterion as neutral (0.5) instead of
   dropping it, so every spec's number is on the same basis. (The score is already un-suffixed
   + metered + "matches"-framed, so no banding/coverage UI is warranted.)
7. **No sample-size floor on throughput/representation** — `of>1` is the only guard.
   *Fix (small):* ignore a candidate metric whose `n` is present and below ~200 so a freak
   thin-n median can't drive a "raw output" chip.

### No change (verified sound — do NOT "fix")

- **Compensatory masking** — refuted empirically; the weighted sum already demotes
  dealbreakers. A non-compensatory floor would wrongly exclude mid-value specs a player
  might enjoy.
- **tier/representation double-count** — refuted; they're structurally separate.
- **mobility/utility class-uniformity** — only 2 of 13 classes are fully uniform; finer
  splits have no fetch source (would violate the live-fetch rule). Leave; optional comment.

## Gaps noted but deliberately deferred

Fantasy/aesthetic matching, a lore-vs-playstyle top-level branch, solo/leveling-friendliness,
side-by-side comparison of finalists, and a live-slider iterative mode are all legitimate
per the research but are larger features that either need authored data this tool can't
source or expand scope well beyond a personal picker. Revisit only on demand.
