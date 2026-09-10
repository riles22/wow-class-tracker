# UI/UX audit fixes — September 9, 2026

This pass implements the ten findings from the September 9 audit plus the forecast
breakdown shortcuts. It preserves the Console layout, native disclosures, persisted
motion preference, original source labels, source dates and frozen prediction history.

## Disposition

| Audit finding | Change | Verification |
| --- | --- | --- |
| 1. Compare all keyboard gaps and lost focus | Sort buttons with announced direction, spec-opening buttons, named column filters, and focus/scroll restoration. Edited number inputs cannot recursively replace the dialog during blur. | Keyboard sorting, role/encounter changes, column filters, spec opening and focus restoration. |
| 2. Faint supporting text | Readable text tokens for ranks, roles, notes, profiles and gear slots; accessible class-name colors in both comparison tables. | Rendered contrast checks across the roster and comparison views; the supporting token is 5.18:1 against the standard panel and 4.89:1 against the raised panel. |
| 3. Gearing link changes into Compare | Separate visual styling from comparison identity; only actual comparison buttons enter its event and synchronization paths. | Add/remove comparison without changing the neighboring link's label, destination or semantics. |
| 4. Excessive phone preamble | Condensed visible definitions and retained-rating notice; detailed explanation in nearby disclosures; corrected star/rank grid span and gearing spacing. | At 375×812, first tracker card ends at 662px and first gearing recommendation at 746px. Visible provenance and 44px star target retained. |
| 5. Forecast banner/report disagreement | Both lead with the same main-letter count. Original exact-tier metrics remain available in report details. | Banner matches report scorecard, with date and matching rule visible. |
| 6. Context-free gearing labels | Custom pick heading without an inapplicable guide column; mobile consensus rows say e.g. 2/3 guides. Custom trinkets explicitly remain unranked. | Empty/complete custom weights, phone labels, trinket summary and preserved disclaimer. |
| 7. Role search returns no matches | Match full roles and displayed aliases alongside spec/class names. | Debounced healer, tank, DPS, HLR and TNK searches return the corresponding roster. |
| 8. Parsed gear skips keyboard focus | Enhance rows after partial renders; associate tooltip with its owner; keyboard focus retains ownership despite incidental pointer hover. | Parse synthetic one-slot input, change fallback item level, Tab into rows and dismiss tooltip with Escape. |
| 9. Archive tab clipping | Wrapping navigation and visible focus styling; named focusable table regions with scoped headers. | 320/375/390px navigation bounds and keyboard horizontal table scrolling. |
| 10. Escaping custom reset button | Two-column intermediate weight editor and one-column phone editor. | Empty/filled controls stay inside the editor at 375, 640, 641, 700, 900, 901 and 1440px; additional visual sweep includes 320, 760 and 1024px. |
| Forecast navigation refinement | Our predictions / Creators / Sites shortcuts at completed checkpoints. | Native fragment navigation focuses the corresponding summary without changing creator-first order or adding script. |

## Measured phone improvement

Chromium, 375×812 touch viewport, default selection with fonts loaded:

| Surface | Audit before | Updated |
| --- | ---: | ---: |
| Tracker: first card top | 718px | 544px |
| Tracker: first card height | 153px | 119px |
| Tracker: first card bottom | 871px | 662px |
| Gearing: first recommendation top | 1,268px | 696px |
| Gearing: first recommendation bottom | Below viewport | 746px |

The original audit measured the public site; these updated values come from the
local production build based on `a608483fb4ec2fd0acb5ff87f37a46e3b934fe9f`.
They are layout observations, not fixed requirements for future data or source warnings.

## Validation and release scope

- Both generated build stages completed, in sequence.
- Full suite: **604 passed, 0 failed, 1 existing seasonal skip** (605 tests).
  UI invariants ran. The skipped case checks a frozen source's historical commit and
  remains dormant while no outlet has left the live season.
- The page suites cover 53 UI checks across tracker, gearing, forecast report and
  archive. Chromium and Firefox application checks passed; final test-only fixture
  isolation and explicit keyboard-focus changes also passed their focused reruns.
  Final complete WebKit rerun: **53 passed, 0 failed, 0 skipped**. Each browser has
  passing coverage for all 53 checks; the two final fixture adjustments were also
  retested in Chromium and Firefox.
- Final `gearing:build` then `build`, instruction-adapter check and whitespace checks
  passed. Source data directories have no diff.
- No dependencies, fetched game data, model weights, historical snapshots or frozen
  forecasts are changed. Synthetic browser fixtures do not represent actual characters.
- Browser automation and visual review do not substitute for a physical-device or
  NVDA/VoiceOver session; those are outside this pass.
- This document records implementation validation. Publication requires a separate
  exact-commit Pages deployment receipt and verification of all four public pages.

## Follow-up: source dates and NEW links

The source registry now separates source identity from a fixed date column. Page
counts, mixed dates and missing dates remain visible; full author credits move into
the disclosure. Individual pages distinguish the date captured (Snapshot) from the
publisher's own date (Page updated). Dates remain unbroken on phones and desktops.

NEW becomes a keyboard-accessible action for the exact newest visible creator take
or scoped tuning entry. It opens the drawer and containing disclosures, then scrolls
and moves focus to the dated item. A build with no relevant rendered lines, a hidden
era, or a superseded take cannot supply an unreachable target. The existing expiry
window and date/source records are preserved.

Follow-up validation:

- Full suite: **608 passed, 0 failed, 1 existing seasonal skip** (609 tests).
- All four new regression checks passed in Chromium, Firefox and WebKit: source/date
  preservation and responsive layout; exact creator-take navigation; all three tuning
  kinds including a tall entry; visibility, expiry and missing-target rules.
- The complete tracker UI suite also passed in Firefox and WebKit: **45 of 45** in
  each engine, with no skips. Final build, instruction and whitespace checks passed.
- A 390px touch walkthrough used real stored content with a controlled September 7
  browser clock. Blood Death Knight's 44×44px NEW button focused Dorki's September 5
  take and preserved its exact video timestamp link. This was a test of historical
  content inside the freshness window, not a change to dates or the live clock.
- Source pages remain intact across 16 registry entries; date layout was checked at
  320, 375, 720, 900 and 1440px. No source data or dependencies changed.
