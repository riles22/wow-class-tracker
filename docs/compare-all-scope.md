# "Compare all" — the full-roster comparison view

**Status:** scoped 2026-08-02, not yet built. Queued ahead of the UI/UX pass and the
S2 transition scope at Riley's direction.

## What it is

One view holding **all 40 specs as rows** against **every rating and rank as columns** —
each tier-list source's letter, the consensus, our 12.1 projection, and the metric ranks —
sortable and filterable per column, sized to fit without vertical scrolling.

## Why it isn't just "Compare with a bigger cap"

The existing Compare (`.cmp-table`) is **transposed**: specs are columns, attributes are
rows. That orientation is why it caps at 3 — each extra spec costs horizontal width, which
is the scarce axis. Turning it sideways changes the scaling problem entirely: specs become
rows (cheap, we have 40 and vertical space to spend) and attributes become columns (fixed
count, ~12). The two views answer different questions and both should exist:

- **Compare** — "I'm deciding between these three specs, show me everything about each."
- **Compare all** — "Where does everything sit at once, and who's top by *this* measure?"

## Columns

Sticky left: **Spec** (class-coloured) · **Role**.

**Tier columns** (letters, from `spec.ratings[bracket]` + computed):
`icyveins` · `method` · `wowhead` · `archon` · `icyveins-ptr`¹ · **Consensus** · **Ours: 12.1**

¹ M+ only (no PTR raid list exists), and era-gated out of the 12.0.7-only view along with
the projection column — same rule every other surface follows.

**Rank columns** (numbers, never letters — hard rule 3).

The payload carries 28 distinct metric families, which is far too many. The curation that
makes this tractable: **ranks are already computed within (role, bracket, name)**, so one
column can be *role-polymorphic* — it selects the metric family matching each spec's role
and shows that rank. "WCL median" resolves to `Median rDPS (Mythic, all bosses)` for a DPS
spec, `… , tank` for a tank, `Median HPS (Mythic, all bosses)` for a healer. Three
families, one column, ranks that were always within-role anyway so nothing is being
compared across a boundary it shouldn't cross.

That collapses the column set to:

| Column | raid resolves to | mplus resolves to |
|---|---|---|
| WCL median (live) | Median rDPS/HPS (Mythic) ± tank | Median rDPS/HPS (M+) ± tank |
| Archon | 95th pct DPS/HPS (Mythic) | M+ score (95th pct) |
| Murlok ceiling | — | Top-50 avg M+ rating |
| SimC | Patchwerk DPS (DPS only) | — |
| PTR testing | 12.1 PTR raid testing score | 12.1 PTR M+ testing median |
| Dummy Dome | `ptrDummy` composite rank (DPS only) | — |

Empty cells are **"—" meaning no such measurement exists for this role**, which is not the
same as "pending fetch". Those two must render differently; conflating them is the kind of
quiet dishonesty this project keeps catching in itself.

## Honesty constraints (non-negotiable)

- Metric ranks stay **numbers**. No letter grade is ever derived from a metric column.
- **Murlok stays labelled a top-50 ceiling**, not popularity — header tooltip, same wording
  as the drawer.
- **Archon means throughput in raid, score in M+** — the header must say which.
- The projection column is **ours, not a source**: visually separated, never sorted in
  among the source columns as if it were a peer, and carrying its confidence dot.
- Era gating applies to the `icyveins-ptr` column, the projection column, and every
  `era: "ptr"` metric column.

## "Without scrolling" — what is actually achievable

40 rows at a compact 18–20px is 720–800px of table plus header. That fits a 1080p desktop
with the page chrome trimmed; it does **not** fit a 900px laptop viewport, and it will
never fit a phone. Plan: size rows to the viewport with a **readability floor**, and below
that floor let the table scroll inside its own `overflow` container (never the body).
Honest framing for the UI: "fits on a desktop screen" rather than "never scrolls".

## Sort and filter

- Click a header to sort; click again to reverse. Tier columns sort by the scale's
  numeric score, not alphabetically — `A+` above `A` above `B+`, which alphabetical
  ordering gets wrong in both directions.
- A filter row under the header: tier columns get a minimum-tier picker, rank columns get
  a max-rank input ("top N").
- Reuse the existing role/class/search/watchlist filters rather than duplicating them.
- Filters compose (AND), and the view states how many of 40 rows are showing.

## Where it lives

A third overlay in the Spec Finder / Ladder shell, opened from a button beside them — but
the shell's `max-width:940px` is too narrow, so it needs a wide variant. Deep-linkable via
the existing `applyHash`/`writeHash` state like every other view.

## Explicitly out of scope

- No new data, no new sources, no build step. Presentation only, from the existing payload
  (hard rule 4: `template.html` carries zero data).
- Not a replacement for the main grid or for Compare.
- No CSV/clipboard export in v1.

## Tests

- A UI invariant that every visible tier cell matches that source's own rating for that
  spec — the same guarantee the main grid has, which is what caught source-view bleed.
- Sort correctness on a tier column across the full 6-band scale including `B+`.
- Era gating: in the 12.0.7-only view, the `icyveins-ptr`, projection, and PTR-metric
  columns are absent, not merely blank.
- The "no measurement for this role" cell renders differently from "pending fetch".
