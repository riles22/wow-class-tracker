# Gearing Season-2 overhaul — scope

**Status:** SCOPED 2026-08-12. Four owner decisions locked inline (⚑). Nothing built yet.
Supersedes the gearing bullets in `docs/s2-transition-scope.md` (DECISION 4's phase C) as the
authoritative plan for the gearing lane; that document remains authoritative for the tracker's
own Season-2 transition.

**The one-sentence model:** the gearing page stops deriving item value from a simulator we run
and starts deriving it from what the human guide authors actually publish — for all 40 specs
instead of 26 — and then does the thing no guide does: ranks *more than one option per slot* and
tells you which bosses and dungeons are worth your week.

**Why now:** the Season-2 flip (2026-08-18, `docs/s2-flip-runbook.md`) forces a gearing
re-harvest regardless (C5). Item data currently carries `caveat: "Pre-launch PTR data. Stats and
drop assignments may change before Aug 18 2026."` and the page hardcodes "season max 344 · season
opens Aug 18, 2026". The re-harvest is the natural moment to change what the page is *for*.

---

## What exists today (measured 2026-08-12, commit `427d869`)

Five tabs in `gearing/src/app.template.html`: **Gear recommendations · Tier & Catalyst · Upgrade
checker · Loot sources · Item levels**. 40 specs, 352 tracked items (104 raid gear drops across 8
bosses of The Venomous Abyss; 204 dungeon items across 8 dungeons; direct-tier rows).

**Three scoring modes** (`#scoring-mode`): `reference` (numeric weights — the current default when
records exist), `priority` (guide order), `custom` (user decimal weights). The scoring math
(`scoreItem`, `:667-680`) is a rating-share-weighted mean of four secondary-stat weights —
dimensionless, bounded by `max(weight)`, and **explicitly equal-item-level**: item level, sockets,
tertiaries, set bonuses and item effects are all absent from it. Trinkets are deliberately
unranked (5 of 14 raid trinkets carry any secondaries; the rest score 0 and tie).

**Coverage reality, and the reason this overhaul exists.** The `reference` mode is powered
entirely by `simc-reference-weights.json` — 60 accepted records over **26 of 40 specs**. Six tanks
and seven healers are formally `deferred`, Augmentation Evoker `unsupported`, and the separate
provider-neutral healer ledger (`healer-reference-rankings.json`) holds `records: []` with
Questionably Epic still `permission-required-pending`. So 14 specs already run on the guide-order
fallback, and healers have never had a model at all. **Guide priorities are the only signal that
covers all 40 specs uniformly.**

**The guide layer we already have is thin and stale.** `gearing/data/specs.json` stores one
`statPriority` per spec (plus `statPriorityVariants` on some), harvested from Icy Veins and
stamped `statPriorityPatch: "12.0.7"` — the *prior* patch. The UI says so at `:1313-1314`.
`GUIDE_MULTIPLIERS = [1, 0.75, 0.5, 0.25]` converts that order into fixed spacing, labeled
"fixed spacing for sorting, not character-specific stat weights or a simulation".

**The game plan is closer than it looks.** Every item already carries `droppedBy` — the specific
encounter/NPC name — populated on **179 of 204** dungeon items and **65 of 104** raid items. The
client never reads it (`grep droppedBy app.template.html` → nothing); it exists only for harvest
sanity checks and validation. The Loot sources tab counts equippable items per boss via `canUse`
and **never calls `scoreItem`**; the top-5 lists and the source tables are computed independently
and never joined. `boss.dropLevels` and `DUNG.keyLevels` (difficulty → ilvl ladders) exist and are
consumed only by the Upgrade checker.

**What the guide sources actually publish** (live-verified 2026-08-12, full recon in the session
record):

| | Icy Veins | Wowhead | Method |
|---|---|---|---|
| Numeric stat weights | **No** — and an editorial section titled "How To (Not) Use Stat Weights on Raidbots" advises against them | **No** — ordered lists + prose | No |
| Stat priority shape | Ordered, scoped by **bracket and hero talent** (Holy Paladin: 3 widgets; Rest Druid: 2) | Ordered, scoped by **hero talent × fight profile** (ST/AoE) | — |
| BiS | 18 slots × 3 lists (Overall / M+ / Raid), **one item per slot** | `Slot \| Item \| Source` table + catalyze/raid/M+ sections | 3 × `Slot \| Item \| Source` |
| Per-item source | `bis_item_drop`, free text, **unnormalized** | Linked to the boss's own guide | Boss-level |
| Item IDs | Yes, with `bonus=` and `original-item=` | Yes, with `?original-item=` | Yes |
| Self-dated | Yes — JSON-LD `dateModified` + dated changelog | Yes — `Updated:` + named author | **No date found** |
| Season | **Season 2 / 12.1** | **Season 2 / 12.1** | Season 2 / 12.1 |

Soft caps appear inside priority labels (`Haste to 18%`, `Critical Strike to 40%`) and are not
modeled anywhere today. Several specs lead with `Item Level` rather than a primary stat.

**Boss-level loot tables are harvestable without any sim.** Wowhead's raid rewards guide serves
all 9 boss panels in one fetch (105 boss-attributed item IDs + 9 BoE), and each of the 8 dungeon
overview guides carries an `Item | Slot | Boss Drop` table (24–33 rows). The Wowhead *database* is
a dead end for this — the raid zone listview links 15 of ~105 items, all to Ula'tek; new boss NPC
pages have no drops tab; item pages name trash NPCs, not bosses.

---

## The decisions

### ⚑ DECISION G1 (Riley, 2026-08-12): guide consensus ranks, stat fit breaks ties

Top-5-per-slot is ordered first by **how many harvested guides name the item for that slot**, and
within a consensus tier by secondary-stat fit. This is the tracker's own multi-source-consensus
ethos applied to gear, and it invents no numbers.

The known cost, accepted: guides publish **one item per slot**, so consensus is thick at rank 1
and thin below it — from rank 2 down, stat fit does most of the ordering. Three partial mitigations
exist in the source data and should be used: Icy Veins' three lists (Overall / M+ / Raid) disagree
per slot and each disagreement is a second opinion; Icy Veins publishes per-slot **prose
alternatives** for the five catalyzable slots; and both Icy Veins and Wowhead publish **letter-tiered
trinket rankings** (S/A/B/C/D) — the one place a guide ranks multiple items per slot, and the
obvious fix for trinkets currently scoring 0 and tying.

### ⚑ DECISION G2 (Riley, 2026-08-12): the plan shows both signals — coverage AND upgrade delta

A source's value combines (a) how many of your ranked items drop there, weighted by slot, and
(b) what you would actually gain over your current gear. Both are shown as **named components**,
never collapsed into one opaque number. Without a `/simc` paste only (a) is computable and the
page says so; pasting adds (b).

**This pulls item level into the scoring model, which today it is entirely outside of** — and M+
items are currently stored with `ilvl: null` (`app.template.html:456`). An upgrade delta needs a
comparable item level per candidate, per difficulty/key level. `boss.dropLevels` and
`DUNG.keyLevels` already carry those ladders; the work is joining them to candidates and being
explicit that "equal-ilvl secondary fit" and "ilvl delta" are different quantities that must not be
silently summed into one score.

### ⚑ DECISION G3 (Riley, 2026-08-12): remove the SimC reference pipeline from gearing entirely

Deleted: 7 modules in `gearing/src` (~4,553 lines), 4 test files (~2,027 lines), ~600 lines of
`validate-data.mjs`, and `gearing/data/simc-audit/` (**30 MB, 368 committed files**, ~94% of
`gearing/data/`). The built page loses 363,767 inlined JSON bytes — **17.2% of the 2,119,303-byte
artifact**. Git history keeps every byte.

Three consequences to handle deliberately:
1. **It unblocks the re-harvest.** `validate-curation-sources.mjs:38-70` SHA-256-pins the raw bytes
   of six gear data files (`raid-items`, `dungeon-items`, `tier-items`, `catalyst-rules`,
   `catalyst-stat-allocations`, `item-eligibility-overrides`); any re-harvest of those **fails the
   gearing build** until the pins are re-cut. Removing the pipeline removes the pin.
2. **The default scoring mode disappears** — `:874`/`:890` auto-select `reference`. The mode
   selector must be reworked, not just have an option deleted.
3. **`test/project.test.mjs` imports the SimC modules at top level** (`:12-13`), so removing them
   without editing it kills that whole file (18 further tests), and its hard coverage asserts
   (`:331-395`, e.g. `deferredHealers === 7`) must go with it.

**Out of scope of this removal, deliberately:** the `/simc` **addon paste** in the Upgrade checker
is a gear-export parser, not a simulator ("it does not run a damage simulation or import stat
weights", `:380`) — it **stays**, and G2 makes it more central. The **tracker's own** SimC lane
(26 `SimC nightly Patchwerk DPS` metric rows, the `m:simc` Compare-all column, Bloodmallet fight
profiles) is a separate lane that never feeds gearing and is **untouched**.

### ⚑ DECISION G4 (Riley, 2026-08-12): harvest Icy Veins + Wowhead + Method

Three independent human-authored sources, each publishing per-slot items with boss-level sources
and item IDs — enough for real consensus rather than agree/disagree.

Two costs accepted and to be disclosed in the UI: **Method's gearing pages carry no update date**,
so its contribution cannot be dated the way the tracker normally requires — it must be labeled
undated rather than silently assumed fresh; and **Method uses typographic apostrophes**
(`Nek’zali`, `Ula’tek`, `Kings’ Rest`) where Wowhead uses straight ones, so every boss-name join
needs Unicode normalization.

---

## Phase plan

Sequencing constraint: **gearing's tests run under the root `npm test`**, so a broken gearing
breaks the nightly publish gate. Phase A may be authored now but **must not land before the
08-18 flip** — keep flip week quiet.

**Phase A — SimC removal and unblock** (land after the flip). Delete the pipeline per G3; rework
the scoring-mode selector so guide-derived ranking is the only built-in mode alongside `custom`;
excise the six-file hash pin; repair `project.test.mjs`; delete both ADRs' operative sections
(keep them as history) and the ~15 README references. Verify: root `npm test` green, gearing
builds, artifact shrinks ~17%, `url(http…)` count in the built HTML still zero.

**Phase B — the guide harvest layer.** Three new harvesters (Icy Veins / Wowhead / Method)
producing a per-spec, per-slot candidate set with source attribution and per-source dates. Harvest
**scoped** stat priorities (hero talent × bracket × fight profile), not one ordered list per spec —
this is strictly more information than today's model holds, and it is the honest answer to "new
stat weights for all classes". Capture the soft caps (`Haste to 18%`) as data even if v1 only
displays them. Normalize boss names to the canonical roster from our own harvested raid/dungeon
data, and treat an unmatchable name as a hard error rather than a dropped row.

**Phase C — scoring model v2.** Consensus-first ordering per G1; stat fit as tiebreak from the
scoped priorities; trinkets ranked from the guides' own letter tiers instead of scoring 0; item
level admitted as a *separate, named* term per G2, never silently merged with secondary fit.

**Phase D — the game plan** (the differentiator). Join the ranked candidates to `droppedBy` —
the field we already have and never read — and to the difficulty/key ladders, producing a ranked
"where your upgrades live" view over bosses and dungeons, with both G2 components shown. Fill the
`droppedBy` gaps (39 of 104 raid items, 25 of 204 dungeon items) from Wowhead's guide tables.

**Phase E — launch re-harvest (C5).** Re-point the PTR-pinned harvest URLs and item-count
fingerprints, drop the `domain=ptr` / `wowhead.com/ptr/` handling to live, replace the pre-launch
`caveat`, and update the hardcoded "season max 344 · season opens Aug 18, 2026" subhead. Soft
window opens 08-18/19; the raid opens the week of Aug 18 per Blizzard.

---

## Honesty rules for this lane

1. **No invented numeric weights, ever.** Guides publish orderings and refuse to publish weights;
   any internal spacing used to break ties is a sorting device and must be labeled as one, exactly
   as `:1108` does today.
2. **Different quantities never share a scale.** Consensus count, equal-ilvl secondary fit, and
   item-level delta are three different things. Display them as three things. (Precedent: the
   README already requires model scores and guide fallbacks be "displayed and sorted separately,
   never compared as though they share a numeric scale".)
3. **Nothing is inferred** (existing README ground rule, unchanged). Item fields come from the
   item's own tooltip; absent stays null; sheet-only values render as provisional.
4. **Every source carries its own date**, and a source that publishes none (Method) says so.
5. **Pre-launch data is labeled pre-launch** until Phase E replaces it.

## Known traps (all measured, do not rediscover)

- **Wowhead returns 403 to plain `curl`.** `r.jina.ai` works; `curl -H "x-return-format: html"` via
  it yields raw server-rendered HTML. **WebFetch produced a false negative** on the raid rewards
  page ("no loot tables") — do not trust a WebFetch negative on Wowhead.
- **Icy Veins list-labeling is off-by-one on a naive walk.** The `<h3>` sits inside a
  `div.heading_container` *following* the preceding grid; anchor on the h3 id immediately preceding
  each `div.bis_items_grid` and verify against the grid's own drop sources.
- **Wowhead icon `alt=` text disagrees with anchor text** on ~6 raid rows. The anchor text + item ID
  pair is trustworthy; the icon alt is stale.
- **Dungeon guide item links live in the PTR namespace** (`wowhead.com/ptr/item=`) while raid links
  are live. Item IDs are identical; a regex must accept `(?:ptr/)?`.
- **Icy Veins item links carry `domain=ptr`** on roughly half of BiS items (Season-2 items not yet
  on the live domain), plus `bonus=` triplets that encode ilvl/socket/track and would need resolving
  for any numeric ilvl.
- **Wowhead's own S2 date prose is wrong** — its Season-2 overview says Aug 11; Blizzard's post says
  week of Aug 18. Guide prose is not authoritative on dates.
- **The Wowhead database cannot supply the boss map** for current content (15 of ~105 raid items,
  all attributed to Ula'tek).

## Explicitly out of scope

Delves, PvP gear, world drops and crafted-item recipe→source mapping (no per-item data exists;
they are ilvl-ladder columns only). Combinatorial multi-slot optimization, set-completion and
catalyst-charge budgeting, diminishing-returns and breakpoint modeling — all remain out, and the
page should keep saying so rather than implying a solver it does not have. Running any simulator
ourselves.

## Open questions for kickoff

1. **The healer model lane.** `healer-reference-rankings.json` is provider-neutral, empty, and
   permission-pending. Retire it with the SimC lane, or keep the (dormant) ledger and
   `healerItemScore` path for a future licensed integration? Note that under G1 healers stop being
   second-class regardless — consensus covers them like everyone else.
2. **Does `custom` weights survive?** User-supplied numbers are honest (the user chose them), and it
   is the natural power-user escape hatch under a consensus-first model — but it is the last
   remaining "weights" surface.
3. **Hero-talent selection UI.** Scoped priorities need a hero-talent control the page does not have
   today; where it lives (and whether it defaults from the tracker's own data) is undesigned.
4. **Trinket letter tiers across three sources** — two publish them, and their scales are not
   identical. Consensus over letter tiers needs the same normalization discipline the tracker's
   `scales.json` applies, or it needs to stay per-source.
