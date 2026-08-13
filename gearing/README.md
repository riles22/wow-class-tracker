# gearing/ — Season 2 gear & loot explorer

A self-contained subproject that builds `wow-s2-gearing.html`: an offline, single-file app
for Midnight Season 2 (Curse of Ula'tek) gearing — best-per-slot rankings, loot sources,
the full item-level ladder, and a gear-export paste upgrade check (the `/simc` addon's
gear export, parsed — it never runs a simulation or imports stat weights).

Imported 2026-08-04 from the standalone "World of Warcraft" project. It has no npm
dependencies and does not participate in the tracker's nightly pipeline (yet); harvests
are run manually.

**"Offline" is load-bearing, and fonts are the easy way to break it.** The page shares the
Spec Tracker's masthead vocabulary (2026-08-05), including its Cinzel/Inter/JetBrains Mono
typography — but those faces are **embedded as base64 woff2 data URIs**, never linked from
Google Fonts, so the built file still issues zero network requests. Regenerating them means
re-fetching the latin subsets and re-embedding; all three are OFL-licensed, so shipping
them inside the artifact is permitted. Verify after any change with:

```
node -e "const h=require('fs').readFileSync('wow-s2-gearing.html','utf8');console.log((h.match(/url\(\s*[\"']?https?:/gi)||[]).length)"
```

Zero is the only passing answer. (An external `<a href>` is fine — it is a link, not a
fetch; it is `url(http…)` in CSS and external `src=` that would break the guarantee.)

**CSP.** The build injects a Content-Security-Policy whose `script-src` is a sha256 hash
of the one inline app script, so only the exact script this build produced can run. It is
stricter than the tracker's — `default-src 'none'` with no external origin, since the
fonts and every item icon are data: URIs. Two things will silently break it: the build
must normalize CRLF→LF *before* hashing (the HTML parser normalizes newlines, so a Windows
checkout would otherwise produce an unmatchable hash), and any new inline `on*=` handler
or second bare `<script>` would be refused — the build hard-fails if it does not find
exactly one script to hash.

**Deep link.** `gearing.html#spec=<slug>` preselects a spec, where `<slug>` is the
tracker's `slugOf()` (`"<class> <spec>"` lowercased, non-alphanumerics → `-`). The tracker's
spec drawers link here. Unknown slugs fall back to the default spec rather than erroring.

**Client code must not assume a browser.** `test/project.test.mjs` boots the app through
`new Function("document","innerWidth","innerHeight", …)` to get a fast check without
Playwright. There is no `location`, `history` or `window` in that scope, so guard any use
of them with `typeof x === 'undefined'` or that test fails with a bare ReferenceError.

## Pipeline

```
node src/harvest-raid.mjs        # Venomous Abyss loot, per-item Wowhead PTR tooltips
node src/harvest-dungeons.mjs    # M+ pool loot (8 dungeons); ilvl comes from key level
node src/harvest-tier.mjs        # Tier 36 set items
node src/harvest-specs.mjs       # spec capabilities + stat priorities (reads ../data/specs.json)
node src/harvest-sheet.mjs       # Norumu community sheet, corroboration only
node src/harvest-icons.mjs       # item icons, inlined base64
node src/harvest-catalyst-allocations.mjs
node src/harvest-guide-icyveins.mjs   # Icy Veins picks / alternatives / trinket letters / builds
node src/harvest-guide-wowhead.mjs    # Wowhead the same, plus hero-talent x fight-profile builds
node src/harvest-archon-gear.mjs # Archon log-derived USAGE (never a pick — see below)
node src/validate-data.mjs       # cross-source validation gates
node src/build.mjs               # -> wow-s2-gearing.html (fully offline)
node --test test/project.test.mjs
```

From the repository root, the equivalent convenience commands are `npm run gearing:test`
and `npm run gearing:build`. Run the tests after any harvest or data edit — gearing's
tests also run under the root `npm test`, so a broken gearing breaks the tracker's
nightly publish gate.

## What ranks items (2026-08-12 — the SimC lane is gone)

Phase A of `../docs/gearing-s2-scope.md` (owner decisions G1–G8) removed the
SimulationCraft reference-weight pipeline and the dormant healer-model ledger from this
subproject: 7 `src/` modules, 4 test files, 4 `data/` files and the 368-file
`data/simc-audit/` tree — **383 files and ~30 MB** — are gone, `validate-data.mjs` went
1,413 → 595 lines, and the built artifact shrank 2,119,303 → 1,726,547 bytes (**18.5%
smaller**). Git history keeps every byte, and `../docs/adr-simc-reference-pipeline.md` +
`../docs/adr-simc-curated-profiles.md` survive as the superseded design record — labeled
HISTORY rather than excised, because they hold the reproducibility account and the
2026-08-05 trinket-conditioning audit disclosure.

Nothing here runs, imports or stores a simulation any more. Two ranking inputs survive:

- **Guide stat priorities** (`data/specs.json` `statPriority` / `statPriorityVariants`,
  dated by `statPriorityPatch`, curated in `data/stat-priority-overrides.json`) — the
  primary signal, and the only one that covers all 40 specs uniformly.
  `GUIDE_MULTIPLIERS = [1, 0.75, 0.5, 0.25]` turns that published ORDER into fixed spacing
  for sorting, and the UI says so in visible text.
- **Custom decimal weights** — the reader's own numbers, and under G6 a FULL override.
  Because switching modes silently changes what "rank 1" means, every ranked surface says
  so in visible text — but through **three** different sites, not one helper:
  `renderBis`'s `#bis-note`, `renderTier`'s `#tier-note`, and `customOverrideNote()` on the
  Upgrade checker's cards, with `renderFooter` and `#scoring-summary` bracketing all tabs.
  A fourth ranked surface must add its own disclosure; grepping `customOverrideNote` alone
  will not tell you that.

So `Scoring method` offers exactly two options — `Guide order` and `Custom decimal
weights`. The old model-weight (`reference`) mode and the SimC-fed `Encounter` selector
no longer exist; the setup card is **Specialization · Build · Scoring method**.
**The option is labeled `Guide order`, not "consensus", on purpose:** Phase A harvests ONE
guide (all 40 `statPrioritySource` values are icy-veins.com), and `SOURCES.md` forbids
calling anything consensus without 2+ independent sources. The stored mode *value* is
`consensus` because that is the G7-recorded id and the end state; the label flips when
G1's multi-source harvest lands in Phase B/C. A test pins both the label and the absence
of the word "consensus" on the page.

The `/simc` **addon paste** in the Upgrade checker is untouched and stays — it is a
gear-export parser, not a simulator.

## The guide-harvest layer — Icy Veins (Phase B, G4 / G9 / G10 / G12)

`src/harvest-guide-icyveins.mjs` reads two formulaic pages per spec and emits, per spec:
the three BiS lists as `endorsement: "bis"` picks, the per-panel catalyst FAQ bullets as
`endorsement: "alternative"` (G9's second, never-summed count), the per-source trinket
letter tiers (G8), and one build per published stat-priority widget (G12). Both item ids
survive — the catalysed appearance and its `original-item=` base — because Phase C joins
sources on the base.

**Phase B ships machinery, not a harvest.** No harvested file is committed: every source is
mid-season-transition until 2026-08-18, and 73% of Icy Veins' pick links still sit on the
`ptr` domain (the run prints `ptrDomainShare` so a post-flip harvest can watch it fall).
Run it locally after the flip. `--dry-run` parses and reports without writing; `--force`
downgrades the refuse-to-write guards; the run refuses outright if the picks fall more than
10% against the previous file.

Correctness rests on **recorded fixtures**, not on the network: `test/fixtures/icyveins-*.html`
are byte-exact subsets of live pages (fetched 2026-08-13, each naming its URL in a header
comment), verified at recording time by parsing the full response and the trimmed fixture and
comparing the results. `test/guides-icyveins.test.mjs` runs entirely against them.

Four traps are load-bearing and are each pinned by a test:

- **List labelling.** A wrong label silently swaps raid and M+ picks, which G10 then votes
  with. Three independent signals must agree — the panel's `h3` id, its tab-button label, and
  the resolved drop sources of its own picks (a raid list whose drops are mostly dungeons is
  refused, not published).
- **Extra item links per cell.** Gems and enchants carry their own `data-wowhead` links; only
  the link before `span.bis_item_slot` is the pick.
- **The decoy bullet list.** Each panel carries a second FAQ whose bullets also begin
  `<strong>Weapon</strong>:` / `<strong>Trinkets</strong>:` and also link items. Alternatives
  come only from the FAQ whose question names the tier set / catalyst — otherwise the parser
  invents endorsements out of prose.
- **Nothing is flattened.** An unknown slot, an unjoinable drop name, an unknown stat key and
  an unseen `>` / `=` / `>=` separator all throw. Two tank specs publish two priorities under
  one heading, distinguished only in prose: both are kept, positionally distinguished, with the
  prose recorded verbatim and `heroTalent` / `bracket` / `fightProfile` left null — reading
  "defensive" out of a sentence would invent a scoping axis Icy Veins never published.

## The guide-harvest layer — Wowhead (Phase B, G4 / G9 / G10 / G12)

`src/harvest-guide-wowhead.mjs` reads two pages per spec — `.../bis-gear` and the
stat-priority page the BiS page's own nav links to — and emits the `Slot | Item | Source`
table as `endorsement: "bis"`, the "Best Gear from Raids" / "Best Gear from Mythic+" strips
and the "Best Gear to Catalyze" cards as `endorsement: "alternative"` (G9's second,
never-summed count), the letter-graded trinket tier list (G8), and one build per published
**hero talent × fight profile** combination (G12). Both item ids survive on a catalysed row:
the tier piece and its `original-item=` base, which is the id that actually drops.

**It parses the guide MARKUP, not the rendered HTML.** Wowhead ships the guide body inside
`WH.markup.printHtml(...,"guide-body")` and renders it in the browser, so the server HTML
contains no BiS table at all. Two consequences are strictly good: the cell structure is
unambiguous, and the recorded "icon `alt=` disagrees with the anchor text" trap cannot bite
because the markup carries no alt text. Access is via `r.jina.ai` with `x-return-format: html`
(Wowhead 403s a plain request; a WebFetch negative on Wowhead is a false negative).

**Phase B ships machinery, not a harvest.** No harvested file is committed — every source is
mid-season-transition until 2026-08-18. `--dry-run` parses and reports without writing;
`--spec <class>/<spec>` narrows the run; a changed pick set needs `WOW_ACCEPT_GUIDE_CHANGES=1`.
Correctness rests on recorded fixtures (`test/fixtures/wowhead-*.html`, fetched 2026-08-13,
each naming its URL and what was trimmed) and `test/guide-wowhead.test.mjs` runs only against
them.

A sweep of all 40 pages measured how much they actually vary, and each of these is pinned by
a test because each one silently produced ZERO of something before it was handled:

- **Nothing is guessed when the page is ambiguous.** Every spec labels its weapon row
  "Weapon", which means a bow for BM Hunter and a one-hand mace for Holy Paladin. The pick
  keeps its item and its endorsement with `slot: null`, is counted and printed, and is
  resolved later from the item's own tooltip. `Weapon (2h)` DOES resolve, because there the
  page said so.
- **Structure over wording.** Strips are found by `toc="Raid Drops"` (40/40) rather than by
  heading text (four wordings); columns are matched by meaning, since Arms Warrior writes
  `Item Slot | Name | Source`; the catalyse cards ship in three different layouts.
- **The guide id outranks the guide's own text.** Forty authors spell shared bosses several
  ways — "The Coiled Alter", "Entomed Sentinels", "Sethraliss" — or ship an empty anchor, all
  carrying the same `guide=<id>` as the correct spellings. A cross-page map repairs the name
  from the id, refuses any id whose resolved occurrences disagree, and stamps every repair
  `via: "guide-id"` with the text the page actually printed. Anything it cannot repair fails
  the run (`WOW_ACCEPT_UNNAMED_SOURCES=1` to accept them as unnamed after reading the list).
- **Two absences are different facts.** A stat page we failed to READ refuses the run; one
  Wowhead does not publish is recorded as an absence. Shipping the first as `builds: []` would
  read as "this guide publishes no stat priority".
- **A published tie stays a tie.** Holy Paladin's `Haste = Crit` is one rank holding two
  stats; ranking one above the other would invent an order the guide declined to give.

Two things it deliberately does NOT do: trinket letters never enter the pick lists (G8 keeps
them per-source and unranked), and the raid/M+ strips vote as Wowhead's **Overall** list —
they are highlights drawn from its one per-slot list, not a rival raid BiS list, and tagging
them otherwise would let a highlight outrank the site's own BiS choice.

## What does NOT rank items — Archon's usage lane (G13 / G14)

`src/harvest-archon-gear.mjs` → `data/archon-usage.json` records what the top logged players
actually **wear**: a usage share derived from Warcraft Logs parses. That is a different
quantity from what a guide recommends, so it is displayed beside the candidates and **never
orders, ranks or breaks ties between them** — not even as a last tiebreak. Popularity is
contaminated by drop rates, catch-up gear and week-one availability, and the tracker already
retyped WoWMeta out of its letter consensus (2026-07-31) for ranking representation as though
it were performance. Its worth is that it can visibly DISAGREE with the guides.

The file therefore has its own shape, and that shape cannot impersonate a guide pick: no
`endorsement`, no `picks`, no slot winner. `archonUsageIssues()` walks the whole document and
fails on any such key, so no future edit can quietly grow this lane a vote. Three things on
Archon's page are deliberately dropped: the **DPS/HPS columns** (Archon hides them itself and
says they are not an isolated throughput delta), the **"BiS" badge** (that is Wowhead's pick
republished — reading it double-counts Wowhead, second-hand), and the **Gear Overview** set
(one composed set, not a usage distribution).

**It ships `status: "pending"` and backfills itself.** Archon's gear pages describe Season 1
today, and the data is log-derived, so a meaningful Mythic sample is days-to-weeks after a
season opens. The harvester season-verifies before ingesting anything and refuses rather than
degrades; the committed placeholder carries the reason, the evidence and what would end the
wait. The gate is a **conjunction of five checks** — live lane · no beta warning · the live
season in the page's own prose · every encounter joins our harvested roster · a sample above
`MIN_PARSES` — and each one is load-bearing:

- **Prose alone is not enough.** Measured 2026-08-13: the raid page's season check *passes*
  (it says "Midnight 12.0.7", the then-live season) while its roster check fails 0/9, because
  `gearing/data` already describes the Season-2 raid Archon has no parses for.
- **Roster alone is not enough.** Archon's `beta-mythic-plus` lane already serves the complete
  Season-2 dungeon roster — off **16 parses**, under Archon's own warning that treating it as
  live data is "incorrect and inaccurate". A roster-only check ingests that. `test/fixtures/`
  keeps that page recorded so the refusal stays tested.

The season vocabulary is the tracker's `PHASES` (`../src/normalize.mjs`), imported **lazily
inside the CLI** so the module and its tests stay uncoupled. That is what makes the season
flip free: no second copy of "which season are we in" to remember.

`test/fixtures/*.html` are real bytes Archon served on 2026-08-13, trimmed to the fields the
parser reads. **Every one of them is Season-1 or PTR data and none of it is shippable** — they
exist to exercise the parser and the refusal, and each file says so in its own header.

## Ground rules (carried over from the standalone project)

- **Nothing is inferred.** Item fields come from the item's own tooltip; absent fields stay
  null. Values only the community sheet has are marked provisional in the UI.
- **`data/weapon-proficiency.json` and `data/stat-priority-overrides.json` are curated,
  not scraped** — their provenance headers say exactly where each fact came from.
- Harvesters refuse to overwrite data on unexplained loot-set changes
  (`WOW_ACCEPT_LOOT_CHANGES=1` after review).
- **Guide priorities are the PRIMARY ranking signal, not a fallback** (reworded 2026-08-12
  under G1, when the model lane they used to fall back *from* was removed). They stay dated,
  they name the guide they came from, and they stay an ORDER: any spacing used to sort
  within one is a labeled sorting device, never a numeric stat weight — the guides
  deliberately publish no weights, so inventing one would be inventing a fact.
- **Different quantities never share a scale.** Consensus count, equal-item-level secondary
  fit and item-level delta are three different things: display and sort them as three
  things, never summed into one number and never compared as though they share a numeric
  axis. (Generalized 2026-08-12 from the same rule about model scores vs guide values.)
- **The gearing lane is firewalled from the tracker's own layers.** Nothing under
  `gearing/` feeds tracker tier grades, the source consensus or the 12.1 projection model,
  and the tracker's own MID1 sim metrics (Bloodmallet, the SimC nightly) are a separate
  lane that never feeds gearing.
- `_retired-wallpapers/` holds the superseded static wallpaper deliverables this project
  grew out of.

## Coupling to the tracker

Read-only: `src/harvest-specs.mjs` reads the tracker's curated `../data/specs.json`
(override with `WOW_CLASS_TRACKER_SPECS`). Nothing here writes outside `gearing/`.
