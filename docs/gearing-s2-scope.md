# Gearing Season-2 overhaul — scope

**Status:** SCOPED 2026-08-12; eight owner decisions locked inline (⚑ G1–G8). **Phase A is
BUILT** — authored the same day on branch `gearing-phase-a`, NOT merged (nothing gearing-side
lands before the 08-18 flip). Phases B–E unbuilt. The "What exists today" section below is the
PRE-Phase-A baseline, pinned to commit `427d869`, and is deliberately left as measured.
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
| Self-dated | Yes — JSON-LD `dateModified` + dated changelog | Yes — `Updated:` + named author | Yes — `guide-update-date` (**corrected 2026-08-13**; the original recon looked only for JSON-LD) |
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
artifact**. Git history keeps every byte. *(Measured on landing: 383 files and ~30 MB removed,
`validate-data.mjs` 1,413 → 595 lines, artifact 2,119,303 → 1,726,547 bytes = 392,756 bytes and
18.5%, slightly more than projected because the inlined blob was not the only shrinkage.)*

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

**One consequence that supersedes an earlier owner direction** (recorded 2026-08-12, during
Phase A): both trinket surfaces used to lead with *"still waiting on trinket sims"* (owner
direction 2026-08-05). Removing the sim lane makes that a promise the project can no longer keep —
you cannot wait for a sim you have deleted the machinery to run. Both surfaces now lead with the
reason that stays true and needs no future sim: the value is in the effect, and this page does not
score effects. Pinned on both surfaces by test so they cannot drift apart; the G8 per-source letter
tiers that will eventually rank trinkets are Phase C work.

**Out of scope of this removal, deliberately:** the `/simc` **addon paste** in the Upgrade checker
is a gear-export parser, not a simulator ("it does not run a damage simulation or import stat
weights", `:380`) — it **stays**, and G2 makes it more central. The **tracker's own** SimC lane
(26 `SimC nightly Patchwerk DPS` metric rows, the `m:simc` Compare-all column, Bloodmallet fight
profiles) is a separate lane that never feeds gearing and is **untouched**.

### ⚑ DECISION G4 (Riley, 2026-08-12): harvest Icy Veins + Wowhead + Method

Three independent human-authored sources, each publishing per-slot items with boss-level sources
and item IDs — enough for real consensus rather than agree/disagree.

One cost accepted: **Method uses typographic apostrophes** (`Nek’zali`, `Ula’tek`, `Kings’ Rest`)
where Wowhead uses straight ones, so every boss-name join needs Unicode normalization. Phase B
found this is worse than recorded — Method ships the *entity* `Nek&rsquo;zali`, so decoding must
happen before any character fold, or `matchKey` reduces "King&rsquo;s Rest" to `kingrsquos rest`
and every one of its joins fails silently. Handled in `lib-guides.mjs`'s `decodeEntities`.

**A second cost recorded here was WITHDRAWN 2026-08-13** — "Method's gearing pages carry no update
date" is false; they carry a per-spec `guide-update-date`. See G11 for the correction and how the
error arose.

---

## Phase plan

Sequencing constraint: **gearing's tests run under the root `npm test`**, so a broken gearing
breaks the nightly publish gate. Phase A may be authored now but **must not land before the
08-18 flip** — keep flip week quiet.

**Phase A — SimC removal and unblock** (BUILT 2026-08-12 on `gearing-phase-a`; merges after the
flip). Delete the pipeline per G3 and the healer lane per G5; collapse the setup card to
Specialization · Build · Scoring method per G7; excise the six-file hash pin; repair
`project.test.mjs`; rewrite the ~15 README references. Verify: root `npm test` green, gearing
builds, artifact shrinks (measured 18.5%), `url(http…)` count in the built HTML still zero.

**Amended in execution — the two ADRs were NOT excised.** Deleting the operative sections of
`adr-simc-reference-pipeline.md` and `adr-simc-curated-profiles.md` would have destroyed the
reproducibility record and the 2026-08-05 **trinket-conditioning audit disclosure** — the only
surviving account of what the deleted evidence actually measured and what it was conditioned on.
This repo's convention for a superseded document is to **label externally, not excise**
(precedent: `finder-audit.md`, whose body was never edited — its HISTORY status lives in
CLAUDE.md's docs inventory). So each ADR's `Status:` line now records the supersession by G3 and
both bodies are byte-untouched, with both files listed as HISTORY in CLAUDE.md's docs inventory.

**Phase B — the guide harvest layer** (decisions G9–G14). Four harvesters — Icy Veins / Wowhead /
Method for human-authored picks, plus Archon for log-derived usage (G13, pending per G14) —
producing a per-spec, per-slot candidate set with source attribution and per-source dates. Harvest
**scoped** stat priorities (hero talent × bracket × fight profile), not one ordered list per spec —
this is strictly more information than today's model holds, and it is the honest answer to "new
stat weights for all classes". Capture the soft caps (`Haste to 18%`) as data even if v1 only
displays them. Normalize boss names to the canonical roster from our own harvested raid/dungeon
data, and treat an unmatchable name as a hard error rather than a dropped row.

**Phase B ships MACHINERY, not a harvest.** Parsers, schema, validation and tests land against
recorded page fixtures; the live harvest itself is a local-run duty that happens after the 08-18
flip, because every source is mid-season-transition until then and a harvest now would capture
PTR-era picks that Phase E replaces. A committed harvest before the flip would be pre-launch data
wearing a Season-2 label.

**Phase C — scoring model v2.** Consensus-first ordering per G1; stat fit as tiebreak from the
scoped priorities selected by the Build control (G7); item level admitted as a *separate, named*
term per G2, never silently merged with secondary fit; custom weights as a full override that
announces itself on every ranked surface (G6). Trinkets get the per-source letter comparison of G8
and stay outside the ranking.

**Phase D — the game plan** (the differentiator). Join the ranked candidates to `droppedBy` —
the field we already have and never read — and to the difficulty/key ladders, producing a ranked
"where your upgrades live" view over bosses and dungeons, with both G2 components shown. Fill the
`droppedBy` gaps (39 of 104 raid items, 25 of 204 dungeon items) from Wowhead's guide tables.

**Data gaps the Phase-B dry runs exposed, for Phase E to close** (measured 2026-08-13 against all
40 specs per source, live, no writes):
- **`Tidebound Grotto` resolves against nothing we hold** and failed 5 Icy Veins BiS pages. It is
  the Nymrissa Wavecaller *lair boss*, which Wowhead publishes on its own page — our
  `dungeon-items.json` harvest never included it. A real S2 source missing from our data.
- **`Nexus King Salhadaar` is a Season-1 boss** still cited by an Icy Veins page — independently
  confirmed by Archon, whose S1 raid roster names it. A guide carrying stale cross-season picks is
  exactly what `rosterMatchRate` is for.
- Method cites whole **Season-1 dungeons** (Skyreach, Pit of Saron, Magisters' Terrace) on four
  specs, and misspells shared bosses ("The Colled Altar", "Den of Narolakk", "Szorak", "Ula tek").
- Icy Veins' BiS pages carried a **0.734 ptr-domain share** pre-launch, so roughly three quarters
  of its item links were PTR-only — expected before the flip, and a useful post-flip check.

**Phase E — launch re-harvest (C5).** Re-point the PTR-pinned harvest URLs and item-count
fingerprints, drop the `domain=ptr` / `wowhead.com/ptr/` handling to live, replace the pre-launch
`caveat`, and update the hardcoded "season max 344 · season opens Aug 18, 2026" subhead. Soft
window opens 08-18/19; the raid opens the week of Aug 18 per Blizzard.

---

## How a harvest fails (settled 2026-08-13, during Phase B)

The scope originally said an unmatchable boss name is "a hard error rather than a dropped row".
Three harvester authors independently landed on something better and the rule is now:

**A row never disappears, and the RUN refuses.** An unresolvable drop source keeps its raw text,
the pick survives (it is identified by item id, and the bracket comes from *our* data, not the
guide's prose), every miss is collected, and the harvester refuses to write unless an explicit
env escape is set. Slots still throw, because a slot we cannot place means the parser has lost
its footing.

Why this beats throwing: Wowhead's 40 pages are written by 40 authors who misspell shared bosses
("The Coiled Alter", "Entomed Sentinels", "Alter of Fangs"), and Method's have their own typos
plus whole Season-1 dungeons. Throwing surfaces ONE typo per run and loses the entire spec that
carried it; collecting surfaces all of them at once and loses nothing. Both satisfy the original
intent — nothing is silently dropped — but only one is enumerable.

**`rosterMatchRate` is the season-currency signal that fell out of this.** Every page claims
"Patch 12.1"; the share of its drop sources that resolve against our Season-2 roster is evidence.
They already disagree — which is the measured confirmation that Phase B was right to ship
machinery rather than a harvest.

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

## Phase-B decisions (Riley, 2026-08-13)

These six answer G1's "how many guides name this item" precisely enough to write parsers against.

### ⚑ DECISION G9: BiS picks and alternatives are TWO signals, never merged

Guides publish one BiS pick per slot, plus weaker endorsements — Icy Veins' prose alternatives for
the five catalyzable slots, Wowhead's separate raid/M+ gear sections, both sites' trinket letter
tiers. Harvest both, and carry them as **two counts that never sum**: "3 guides pick this" and
"2 guides list this as an option". This is what gives consensus any reach below rank 1, which G1
recorded as its known weakness. Weighting them into one number was rejected — the weight would be
a quantity no guide published, the same invention G1 exists to avoid.

### ⚑ DECISION G10: one vote per source, matched to the item's own bracket

A source votes **at most once** per item. Which of its lists decides that vote is chosen by the
item's own source: a raid drop is judged by the outlet's raid list, an M+ drop by its M+ list,
with the Overall list as fallback when an outlet publishes no bracket-specific list. This needs no
new bracket control — every item already carries its source — and it stops Icy Veins' three lists
(Overall / M+ / Raid) from outvoting Wowhead and Method combined.

### ⚑ DECISION G11: Method votes — ~~disclosed as undated~~ **PREMISE CORRECTED 2026-08-13**

**The decision stands; the reason it was needed does not.** Riley chose "Method votes, disclosed as
undated" over abstention, on the stated fact that Method publishes no update date. **That fact was
wrong.** Every Method gearing page carries
`<span class="guide-update-date"><strong>Last Updated: </strong>11th Aug, 2026</span>` beside a
`Patch 12.1` label, and the dates are genuinely per-spec (9th–13th Aug 2026), tracking edits. The
2026-08-12 recon looked for a JSON-LD `dateModified` — which Method does not publish — and reported
the absence as "no date on page". Confirmed by direct fetch of two spec pages, 2026-08-13.

So Method is a **self-dated source like the other two**, its harvester parses the real date, and
there is no undated-source disclosure to build and no "stale Method ages silently" cost to accept.
The alternative Riley weighed (abstention, to keep every counted vote dated) was answering a
problem that does not exist.

**What survives from G11:** the undated path is still modelled honestly rather than deleted — a page
that ever ships without a date yields `published: null`, `selfDated: false`, and the harvester
**never substitutes the fetch date for a publication date**. Recording "we fetched it on X" is
honest; recording "they published it on X" is not. G4's cost note ("Method's gearing pages carry no
update date") is corrected by the same finding.

### ⚑ DECISION G12: the Build list is the UNION, each option labeled by its source

Every published variant from every source appears as its own option, tagged with who published it.
The sources scope differently — Icy Veins by hero talent AND bracket ("Herald of the Sun (raid
healing)"), Wowhead by hero talent × fight profile ("Pack Leader, Single-Target") — and merging on
a normalized key would assert those mean the same thing. They may not. Cost accepted: a longer
dropdown (5–6 builds for some specs) and visible near-duplicates where two outlets scope alike.

**Implementation note carried from the Phase-A recon:** `activeBuild()` matches variants by `name`
alone. A union across sources needs a **synthetic id** (source + variant), because two outlets can
publish the same variant name. Do not deepen name-matching.

### ⚑ DECISION G13: Archon is a separate signal that never affects order

Archon's gear data is **log-derived usage popularity** — what top players wear — which is a
different quantity from what a guide recommends. It gets its own displayed column ("worn by 12.1%
of Mythic raiders"), never summed with the consensus and never reordering anything, not even as a
tiebreak. Counting it as a fourth vote was rejected on precedent: WoWMeta was retyped from
`tier-list` to `metrics` on 2026-07-31 for exactly this — letters that clustered on player count
rather than performance — and the tracker already reads Archon's *throughput* list rather than its
popularity grouping. Popularity is also contaminated by drop rates, catch-up gear and week-one
availability. Its value is precisely that it can DISAGREE with the guides visibly.

### ⚑ DECISION G14: the Archon lane ships pending and backfills itself

Archon's gear pages describe Season 1 today and the data is log-derived, so a meaningful Mythic
sample is days-to-weeks after 08-18. The column ships in Phase B in a **pending** state, gated on
Archon's page verifying as Season 2 — the same season-verification the tracker already runs — and
fills itself on the first harvest that passes. Phase B does not wait for it. Showing Season-1 usage
next to Season-2 guide picks was rejected as the cross-season mixing every other rule here forbids.

## Open questions for kickoff

None outstanding. Fourteen decisions (G1–G14) are locked.
