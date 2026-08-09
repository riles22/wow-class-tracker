# Era prose in template.html — scope

**Status:** SCOPED 2026-08-08. Not built. Must land **on 12.1 launch (2026-08-11)**, not before —
today the page is telling the truth, and these literals only become lies at launch.

## The problem in one line

`src/template.html` hardcodes **36 occurrences of "12.1 PTR" and 30 of "12.0.7"**. The Era toggle
is data-driven off `PHASE` (template.html:1130, fed from `PHASES` in normalize.mjs), but the PROSE
around it is not — so from 08-11 the masthead chip, the footer, the legend and a dozen tooltips all
tell every visitor that 12.1 is on the PTR and 12.0.7 is live, while the toggle beside them says
otherwise. The scope doc for the S2 transition (`docs/s2-transition-scope.md`) inventoried code,
data, contract and skills, but never covered the page's own identity text.

## Why this is not a find-and-replace

Three populations are mixed together and only ONE of them should change:

**A. Prose (change).** User-visible text that asserts which patch is live. ~20 occurrences.
Static HTML: the `<title>` (:5), the masthead `.patchchip` (:809), the Baseline line (:815),
the two Era buttons (:832-833), the confidence legend (:909), the build-feed heading (:961), the
`.footcover` line (:975). JS template strings: the era note on PTR sources (:1282), the two
"Current numbers" section headings (:1337-1338), the drawer's no-writeup and baseline-view
summaries (:1455, :1465, :1468), the fight-chip and source-chip explanations (:1629, :1652, :1676,
:1680), the projection button title (:1695), the source-option titles (:1704-1705), the column
qualifier (:1745), the Ladder era caption (:2590), and the Compare-all header tooltip (:2937).

**B. Metric NAME KEYS (change, but carefully — these are lookups, not labels).** Lines 2287 and
2792-2820 embed strings like `"Median rDPS (12.1 PTR M+ testing)"` and
`"12.1 PTR raid testing score (normalized)"`. These must match `data/specs.json` **byte for byte**
or the Ladder silently renders an empty series — no error, just nothing. `render.mjs` already
derives the same names from `PHASES.ptr.marker` (`PTR_MPLUS_SERIES`), so the template holds a
second, hand-maintained copy of the same contract. **This duplication is the real defect here**,
and it is a live drift risk today, independent of the launch date.

**C. Comments and historical notes (LEAVE).** ~9 occurrences (:294, :1014, :1128, :1232, :1261,
:1620, :1666, :1686, :1689, :2350, :2388, :2398) record why a decision was made at a point in
time. Rewriting them destroys the record. A comment saying "12.0.7-only view" is describing the
rule as it stood; it is not a claim about what is live now.

## The shape problem: `ptr` becomes null

`PHASES.ptr` is `{ marker, label }` today and goes **null** at launch (normalize.mjs:41). So this
is not a label swap — several strings need a different SHAPE when there is no PTR:

- `.footcover` reads `12.0.7 / Season 1 → 12.1 PTR "Curse of Ula'tek"`. With no PTR that arrow has
  nothing on its right-hand side; it should read `12.1 / Season 2 "Curse of Ula'tek"`.
- The Era toggle has one meaningful position and **should hide** (already called out in CLAUDE.md).
  Its two buttons' labels are moot if the control is gone.
- "No 12.1 PTR writeup yet" becomes "No 12.1 writeup yet" — the writeups do not stop existing.
- Anything phrased "switch Era to Both or 12.1 PTR" is unreachable advice once the toggle hides.

## Recommended build

1. **Build-time substitution for static HTML (A).** Extend the existing `__DATA_JSON__` mechanism in
   `build.mjs` with era placeholders resolved from `PHASES`. Build-time, not client-side, for two
   reasons: no flash of wrong content, and CLAUDE.md rule 4 says the template is presentation only
   with zero data in it — an era literal IS data, so this also closes a standing rule violation.
2. **`PHASE` reads for JS prose (A).** Those strings are already inside template literals; they can
   interpolate `PHASE.liveLabel` / `PHASE.ptr?.label` directly.
3. **One source of truth for metric names (B).** Ship the name builders in the payload (derived
   from `PHASES.ptr.marker` in render.mjs, where they already exist) and have the template read
   them, instead of keeping a parallel hand-typed copy. This is the piece worth doing **even if
   the rest slips** — it is a silent-failure class, not a cosmetic one.
4. **A `ptr === null` pass over the shapes above**, plus hiding the Era toggle.

## Verification

- The change must be a **byte-identical no-op at today's `PHASES` values** — diff `dist/index.html`
  before and after; anything that moves is a bug in the substitution, not an intended edit.
- Then flip `PHASES` in a scratch copy and eyeball the rendered page for the null-`ptr` shapes.
- `src/template.html` changes require the 21 Playwright UI invariants, which `npm test` SKIPS
  without Playwright. Run them for real:
  `npm i --no-save playwright@1.61.1 && npx playwright install chromium && npm test`
  (Playwright is currently installed in this checkout — `npm test` reports 0 skips.)
- Grep the built artifact for any surviving literal that should have been substituted.

## Sequencing

Land **on 08-11**, with `PHASES` flipped in the same commit — the prose and the config must move
together or the page contradicts itself in whichever direction they diverge. Item 3 (metric-name
deduplication) can and probably should land earlier, since it fixes a present-tense drift risk and
is invisible to the reader.
