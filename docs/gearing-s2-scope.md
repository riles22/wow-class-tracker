# Gearing Season-2 overhaul — scope

**Status:** SCOPED 2026-08-12. Eight owner decisions locked inline (⚑ G1–G8). Nothing built yet.
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

**Recon addendum (2026-08-18, Phase B build day — live re-verification corrected five recorded
facts; the parse recipes of record now live in `gearing/src/harvest-guide-*.mjs` and their
fixtures):**
- **Method now self-dates** — every subpage carries `Last Updated: <ordinal date>` plus a
  "Patch 12.1" chip, so G4's "must be labeled undated" concession is obsolete; its typographic
  apostrophes are the HTML entity `&rsquo;`, never raw U+2019.
- **Wowhead's BiS URL is role-less** (`/bis-gear`; the table's `bis-gear-pve-<role>` 404s), the
  guide body is `WH.markup.printHtml` markup (items `[item=ID]`, bosses `[url guide=N]`),
  `original-item=` is a markup attribute not a URL query, and only the Overall tab is a real
  Slot|Item|Source table — its raid/M+ sections are slot-less icon strips. The 403-to-plain-curl
  trap did not reproduce from a residential IP.
- **Icy Veins moved item identity into `data-wowhead=` attributes** (no Wowhead hrefs remain, so
  the `domain=ptr` trap is gone; `bonus=` runs 1–6 segments, not triplets), each list renders as
  a PAIRED main+weapons grid, drop sources are now anchors to its own boss/dungeon guides, and
  stat priorities are structured widgets that may LEAD with "Item Level".
- **Cross-source name variance is real and handled in `lib-guides.mjs`**: "King's Rest" (IV)
  vs canonical "Kings' Rest", Method's "Temple of Sethrallis" typo, dropped leading "The",
  and world-boss attributions (Nymrissa Wavecaller / Tidebound Grotto) outside the M+ roster.
  Text-join failures fall back to an item-ID join against our own catalog, flagged
  `sourceTextUnmatched` — rows are never dropped (the hard-error rule holds when BOTH fail).
- **Post-harvest findings (same day, full 40×3 run):** WCL zone 53 lists NINE encounters —
  the ninth is **Nymrissa Wavecaller** (verified via GraphQL), whom Icy Veins nonetheless
  files under world bosses and whose loot our 8-boss raid harvest does not carry; her rows
  classify `world` pending a Phase E re-harvest look. Method also names **"Vexhul"** (not a
  zone-53 encounter — unresolved, kept verbatim as `unknown`) and legitimately sources
  old-expansion dungeons in alternatives rows; one Wowhead author writes sources as bare
  `[npc=ID]`/`[zone=ID]` entities, preserved verbatim when no text exists.
- **No soft caps found on any recon spec** ("Haste to 18%" is captured by the parser but the
  idiom was absent 08-18); trinket letter-tier grids on Icy Veins also need per-spec
  re-checking before G8's display work leans on them.

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

**Phase A — SimC removal and unblock** (land after the flip). Delete the pipeline per G3 and the
healer lane per G5; collapse the setup card to Specialization · Build · Scoring method per G7;
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
scoped priorities selected by the Build control (G7); item level admitted as a *separate, named*
term per G2, never silently merged with secondary fit; custom weights as a full override that
announces itself on every ranked surface (G6). Trinkets get the per-source letter comparison of G8
and stay outside the ranking.

**Phase D — the game plan** (the differentiator). Join the ranked candidates to `droppedBy` —
the field we already have and never read — and to the difficulty/key ladders, producing a ranked
"where your upgrades live" view over bosses and dungeons, with both G2 components shown. Fill the
`droppedBy` gaps (39 of 104 raid items, 25 of 204 dungeon items) from Wowhead's guide tables.

**Phase E — launch re-harvest (C5).** Re-point the PTR-pinned harvest URLs and item-count
fingerprints, drop the `domain=ptr` / `wowhead.com/ptr/` handling to live, replace the pre-launch
`caveat`, and update the hardcoded "season max 344 · season opens Aug 18, 2026" subhead. Soft
window opens 08-18/19; the raid opens the week of Aug 18 per Blizzard.

**Phase E addendum — executed 2026-08-18, and the Nymrissa question settled.** The live
re-harvest resolved the open classification from the recon: **Nymrissa Wavecaller is a WORLD
boss.** Her three drops (268262/268263/268266) left Nek'zali's live guide table with no raid
destination, she has no live boss page, and Icy Veins files her under world bosses — so the
`world` pattern in `normalizeDropSource` keeps her (with a final-evidence comment), and her
items are simply out of the raid catalog (101 items, was 104). The PTR duplicate 268231
resolved the OTHER way from the PTR-era override: live Wowhead lists it only under The Coiled
Altar (boss 7), so `ITEM_OWNER_OVERRIDES` is empty again. All 65 tier item ids changed
PTR->live. Dungeon launch adjustments: Murder Row swapped 251134->271680, Den of Nalorakk
gained 271681 (205 items, was 204). The Phase-D droppedBy fill was promoted INTO
`harvest-dungeons.mjs` (`dungeonBossDropsFrom` in lib-wowhead reads the Boss Drop column of
the same overview tables the loot ids come from), because the data-side fill was clobbered by
the first re-harvest exactly as a data-side fill always will be; coverage is 205/205 and
backfilled names still face the encounter-roster gate. Catalyst counts re-pinned
159->157 ranked / 318->316 unique (the Nymrissa delta).

---

### ⚑ DECISION G9 (Riley, 2026-08-18, launch-day review): the enhancements lane

Enchants, gems, and consumables per spec, harvested from the SAME three guide sources and
ranked by the SAME distinct-sources consensus count the gear candidates use — ties broken
by each source's own published order (its first-listed pick), never by an invented score.
Built same-day from a three-agent live recon:

- **Icy Veins**: dedicated `…-gems-enchants-consumables` page (+1 fetch/spec, Node
  transport). The only real table is `table.enchants`; gems/consumables are heading-scoped
  prose; the weapon oil lives OUTSIDE the table; FAQ blocks must be stripped pre-extraction.
- **Wowhead**: sibling `enchants-gems-pve-<role>` page (+1 curl fetch/spec). Two BBCode
  grid tables; Gatherer type-6 spell names for weapon imbues; era-verified per page.
  **Slot vocabulary drifts hard across authors** ("Helmet", "Weapons (2h & Dual-Wield)",
  "Weapon - Main Hand", a bare "Gems" row) — the parser normalizes, and an unmappable slot
  row becomes a verbatim note, never a throw: the throwing version cost SIX SPECS their
  whole gear records when the error escaped into the runner's absent lane (full-harvest
  find, fixed same night with a containment rule: an enhancements failure may cost only
  the enhancements block).
- **Method**: zero extra fetches — everything parses from the stats page the harvester
  already downloads. Gems come in two markup shapes (unlabeled prose vs bold labels), so
  the parser classifies by item name, never by label.

Contract lives in lib-guides (`validateEnhancements`, `ENHANCEMENT_CONSUMABLE_KEYS`):
candidates keep published order, absent categories are OMITTED (Holy Paladin genuinely
has no augment rune), oils/imbues normalize into `consumables.weaponBuff`, and prose
conditionality (hero-talent/bracket exceptions) stays in free-text notes — the ragged-axes
reasoning of G7, again. The Enhancements tab renders in both scoring modes: custom weights
cannot apply to non-stat-scored recommendations, and the page says so.

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

### ⚑ DECISION G5 (Riley, 2026-08-12): retire the healer model lane with SimC

Delete `healer-reference-rankings.json` and the dormant `healerItemScore` path. It holds zero
records, its provider is permission-pending, and — the load-bearing reason — the dormant code is
written for the reference-mode-first architecture G1 replaces, so a future licensed healer model
would need it rewritten regardless. Under G1 healers rank by consensus like every other spec, so
retiring this closes no coverage gap. The README/ADR account stays as history.

### ⚑ DECISION G6 (Riley, 2026-08-12): `custom` weights survive as a FULL override

Decided against the recommended tiebreak-only demotion. Picking custom weights drives the entire
ordering and consensus is ignored — the power-user escape hatch stays exactly as powerful as it is
today.

**The cost, accepted, and the requirement it creates:** the page then has *two* ranking models, and
switching between them silently changes what "rank 1" means. So the custom mode must **announce
itself on the ranked surfaces**, not just in the selector — every ranked list rendered under custom
weights says it is ordered by your own numbers rather than by guide consensus, in visible text (not
a `title=`, per the tracker's own touch-legibility rule). Keeping the word "weights" here is
acceptable precisely *because* these are the user's own numbers; it must not borrow the vocabulary
of a simulated stat weight.

### ⚑ DECISION G7 (Riley, 2026-08-12): one "Build" selector listing real published combinations

The two selectors orphaned by G3 (`Ranking profile`, `Encounter` — both fed by the SimC manifest)
collapse into a single **Build** control whose options are exactly the combinations a source
actually published, e.g. `Herald of the Sun · Raid healing`.

This is chosen over two independent dropdowns because the scoping axes are **ragged and
spec-dependent**: Fire Mage / Windwalker / Outlaw / Balance / Prot Warrior publish 1 unscoped
priority, Rest Druid and Devourer DH publish 2 (by bracket), Holy Paladin publishes 3 (hero talent
AND bracket), and Wowhead scopes BM Hunter by hero-talent tree × fight profile. A 2-axis grid would
offer cells no source ever wrote. A spec whose sources disagree on scoping shape gets the union of
their published combinations, each labeled with the source that published it.

Resulting setup card: **Specialization · Build · Scoring method** (consensus | custom) — three
controls where there are four today.

### ⚑ DECISION G8 (Riley, 2026-08-12): trinket letter tiers stay per-source, never merged

Decided against normalizing the two letter scales onto a shared axis. A trinket shows
`Icy Veins: S · Wowhead: A` side by side and the reader judges.

**The cost, accepted:** trinkets have no single ordering, so they remain **outside the G1 top-5
ranking that every other slot gets** — the one slot where guides publish real depth is also the one
slot the page will not rank. This is a deliberate honesty-over-completeness trade, consistent with
the rule that different quantities never share a scale. Display order inside the trinket card is
then a presentation convention, not a ranking claim, and must be labeled as one; settle it at build
time (a stable, obviously-arbitrary order such as by first source's letter is fine — an order that
*looks* computed is not).

Note this leaves today's real defect unfixed in ranking terms: 5 of 14 raid trinkets carry any
secondaries and the rest score 0 and tie. Showing both sources' letters replaces a meaningless
ranked order with honest unranked information, which is the improvement — not a ranked trinket list.

**REVISED (Riley, 2026-08-18, launch-day review):** trinkets now RANK — but by
**guide-consensus count alone** (how many of the three guides name the trinket, dense
ranking, ties share a number), never by stat fit and never by merged letters. This keeps
both of G8's original refusals intact (no shared letter axis; no fit scores on an
effect-driven slot) while giving the slot the best/second-best ordering Riley wanted: the
consensus COUNT is the same coverage quantity every other slot already uses, so no new
scale is invented. Unnamed trinkets follow the ranked set explicitly unranked. Shipped
with the same pass: out-of-catalog guide picks (117 crafted, 55 world at ship time)
render in slot cards and the trinket card as counted-never-scored rows, and the game
plan gains a **Crafted** section (guide claims + the sheet's crafted ceiling — no fit,
no potential column, because no item data exists to compute either).

## Open questions for kickoff

None outstanding. Eight decisions (G1–G8) are locked; the next open choices arrive with Phase A
implementation (chiefly: how much of `validate-data.mjs` survives the SimC excision as reusable
schema checking).
