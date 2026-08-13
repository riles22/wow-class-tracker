# Gearing launch re-harvest runbook — from 2026-08-18

**Status:** WRITTEN 2026-08-13 (Phase E, ⚑ DECISION G25). This is the operational checklist for
the staggered re-harvest; `docs/gearing-s2-scope.md` holds the DESIGN decisions (G1–G25) and
stays authoritative where they overlap, and `docs/s2-flip-runbook.md` owns the tracker's own
flip, which must land first. Everything below was measured against the `gearing-phase-e` tree
at commit `2bf7729` plus the uncommitted Phase-E work — **re-verify anything that matters on
the day; these numbers move with the data.**

**The one-sentence version:** launch day is a config edit in `gearing/src/season.mjs` plus a
harvest, run in lane order, with each lane refusing on its own terms — and the only lane that
cannot start on 08-18 is Archon, which needs a log sample nobody has generated yet.

---

## Hard prerequisites, in this order

1. **The tracker's own 08-18 flip has landed** (`docs/s2-flip-runbook.md`). Nothing gearing-side
   moves before it. `gearing/test/season.test.mjs` pins `SEASON.patch` against the tracker's
   `PHASES.seasonLabels[SEASON.id]`, so flipping gearing first fails the suite, and gearing's
   tests run under the ROOT `npm test` — a broken gearing breaks the nightly publish gate in the
   busiest week of the cycle.
2. **The gearing branches merge in order: A → B → C → D → E.** They are a strictly linear stack
   (measured 2026-08-13: A ⊂ B ⊂ C ⊂ D ⊂ E, five commits ahead of master), so the order is
   enforced by the history itself — the failure mode is not "merged out of order", it is
   *cherry-picking one phase out of the stack*. Do not. Phase A is what un-pins the six
   SHA-256-pinned gear data files (`validate-curation-sources.mjs`), and **until Phase A is in,
   every re-harvest in Lane 2 below fails the gearing build by design.**
   As of 2026-08-13 master is five commits ahead of the stack and **zero files overlap**, so the
   merge is conflict-free; that will not stay true if a nightly touches `gearing/`.
3. **This is a LOCAL run.** Wowhead is unreachable from CI (`gearing/README.md`), harvests are a
   local-run duty, and none of the commands below belong in a workflow.

---

## Lane order, and why it is not negotiable

```
Lane 1  season config          season.mjs                    the only code edit
Lane 2  items and loot         raid · lair · dungeons · tier  builds the ROSTER
Lane 3  guides                 icyveins · wowhead · method    RESOLVE against that roster
Lane 4  archon                 usage column                   gated on its own sample
Lane 5  merge                  -> guide-picks/priorities      what the page actually reads
```

**Lane 2 before Lane 3 is the load-bearing one, and it is easy to get wrong** because the guide
harvesters look independent. They are not: G24 drops a guide pick whose stated source resolves
against nothing in **our own harvested roster**, so an incomplete item lane makes real
Season-2 picks read exactly like stale Season-1 ones.

This is not hypothetical — it is already visible in the recorded fixtures. Method's Holy Paladin
page cites `The Tidebound Grotto`; our roster does not hold it, because it is Nymrissa
Wavecaller's lair and our dungeon harvest never included it (⚑ G22). Run the guide lane against
today's roster and **4 of that page's 48 picks are dropped as out-of-season when every one of
them is current**. The same name failed five Icy Veins BiS pages in the 2026-08-13 dry run.

What stops that becoming silent damage: every guide harvester **refuses the write** on an
unresolvable source before anything is dropped, so a human sees the label first. The drop is
what *accepting* now means. Never accept without reading the list.

---

## Lane 1 — the season config (5 minutes, one file)

Edit `gearing/src/season.mjs` and nothing else:

- `wowheadNamespace: "ptr"` → **`null`**. Wowhead stops serving Season-2 items from `/ptr/` at
  launch. This decides only what we **emit**; every harvester **accepts** both spellings
  regardless, and always will — a `/ptr/` link outlives the flip by however long the outlet
  takes to rewrite it, and losing a pick to a URL spelling is not a trade this project makes.
  Pinned by `acceptsNamespace()` in all three guide harvesters (accepts `ptr`, `ptr-2`, `beta`
  and the live namespace) and by `gearing/test/season.test.mjs`.
- `maxItemLevel` — 344 as scoped. Verify against the live ladder tables before trusting it.
- Leave `id`, `patch`, `label`, `instance`, `opensAt` alone unless Blizzard moved the date.

```
npm test                        # root, from the repo root — gearing runs under it
```

Expect green with no other change. Things that used to be separate hand-edits and are now
downstream of this one field: Icy Veins' `EXPECTED_PATCH`, Wowhead's `--season` default
(`SEASON_NUMBER`), Method's `caveat` string, and every harvest file's `season` block.

**Verify:** `node --test gearing/test/season.test.mjs` (7 tests) and the four namespace tests in
the guide test files. If `SEASON.patch` and the tracker's `PHASES` disagree, stop — the tracker
flip is incomplete.

---

## Lane 2 — items and loot (as soon as the raid is live: US 08-18, EU 08-19)

Not my lane to script, but it gates everything else, so its acceptance criteria matter here.

```
node gearing/src/harvest-raid.mjs
node gearing/src/harvest-dungeons.mjs
node gearing/src/harvest-tier.mjs
node gearing/src/harvest-catalyst-allocations.mjs
node gearing/src/harvest-icons.mjs
node gearing/src/validate-data.mjs
```

**Its gate refuses on changed loot** (`WOW_ACCEPT_LOOT_CHANGES=1`) and on source conflicts
(`WOW_ACCEPT_SOURCE_CONFLICTS=1`). On a launch re-harvest **both will fire, and that is correct**
— the whole point of this run is that the data changed. Read the diff, then accept.

**Three things must be true before Lane 3 starts:**

1. **`Tidebound Grotto` exists as its own source** (⚑ G22). Today it sits in `raid-items.json`
   as a `dropAlias` of raid boss 1, which is mechanically indistinguishable from a legitimate
   sub-NPC — which is why nothing caught it. Its 13-item table lives on a **separate instance
   and lockout**; four items are misfiled (three under Nek'zali, one under The Coiled Altar) and
   nine are absent entirely. Left alone, Phase D's game plan sends a reader to Nek'zali for loot
   that drops somewhere else, and Lane 3 drops four Method picks that are perfectly current.
2. **The roster covers the season.** Sanity check: `rosterFrom()` yields 17 resolvable names
   today — 8 raid bosses, the raid instance itself, and 8 dungeons. A launch harvest that
   returns fewer is a partial fetch, not a smaller season.
3. **`droppedBy` gaps closed** — 39 of 104 raid items and 25 of 204 dungeon items carried no
   drop source at the Phase-D measurement. Phase D reads this field; a gap is a plan entry that
   silently does not exist.

---

## Lane 3 — the three guides (each the moment its own pages verify)

Each guide is independent of the others and gated on its own page state. Run them as they turn
over; there is no reason to wait for the slowest.

### Icy Veins

```
node gearing/src/harvest-guide-icyveins.mjs --dry-run
node gearing/src/harvest-guide-icyveins.mjs                # writes data/guide-picks-icyveins.json
```

**Its gate:** the article heading must self-identify as `SEASON.patch` (`12.1`), per page, or
that spec's BiS page is recorded as failed and the run refuses. It also refuses a rewrite that
drops picks by more than 10% against the committed file. Escape: `--force` (which relaxes
*both*, so read the output before using it).

**What changed in Phase E:** a BiS drop label now resolves **soft**. It used to throw, so one
Season-1 boss name cost the entire spec — 48 picks, 14 alternatives, the trinket letters and all
three lists — and reported exactly one typo per run. Now every miss is collected and the run
refuses with the whole list at once. That is the scope's own settled rule ("How a harvest
fails"), and G24 could not function without it: there are no picks left to partition on a page
that threw.

**Read in the summary:**
- `ptr-domain links: N%` — 73.4% roster-wide pre-launch (fixtures: 75.6 / 68.8 / 81.3%). Once
  `wowheadNamespace` is `null` this line reads as *stale links Icy Veins has not rewritten*
  rather than as an expected pre-launch reading. **A high share is not a failure** — those picks
  parse and count. It is a freshness signal about the outlet.
- `G24: dropped N pick(s) …` with the losing source names and the specs that lost them.

### Wowhead

```
node gearing/src/harvest-guide-wowhead.mjs --dry-run
node gearing/src/harvest-guide-wowhead.mjs                 # writes data/guide-picks-wowhead.json
```

**Its gate:** every page must state `Midnight Season <SEASON_NUMBER>` in its own prose, or that
spec is skipped and the run refuses; an unreadable stat page is a hole (refuses) while one
Wowhead genuinely does not publish is a fact (does not). Escapes:
`WOW_ACCEPT_UNNAMED_SOURCES=1` for source labels nothing can name, `WOW_ACCEPT_GUIDE_CHANGES=1`
for a changed pick set against the committed baseline. **On a launch re-harvest the second will
fire on nearly every spec** — that is the re-harvest, not a broken parser.

**The ordering rule, and it is the single most important thing on this page.** G24's drop runs
**after** `repairGuideSources`, never before. Wowhead's 40 pages are written by 40 authors who
misspell the shared bosses — "The Coiled Alter", "Entomed Sentinels", "Nymrissa Wavebinder",
"Sethraliss" — and every one of those names a *current* boss whose text simply does not resolve.
The repair takes the name from the page's own `guide=<id>` link, which is not a guess. Measured
on the recorded fixture (five misspelt rows): **drop-first deletes all five; repair-first deletes
none.** Pinned by `"G24 runs AFTER the guide-id repair…"` in `guide-wowhead.test.mjs`. If that
test is ever failing, do not run this lane.

### Method

```
node gearing/src/harvest-guide-method.mjs --dry-run        # plain https GET; no r.jina.ai needed
node gearing/src/harvest-guide-method.mjs                  # writes data/guide-method.json
```

**Its gate:** an unresolvable slot label, an unresolvable drop source, or a page with no readable
update date each refuse the write. Escape: `METHOD_ACCEPT_PARTIAL=1`. Since Phase E, accepting
also *drops* the unresolvable picks and discloses the count — so accepting is a statement that
you read the list and those sources really are out of season.

**Read `counts.rosterMatchRate` per spec, never the page's patch label.** Every page claims
"Patch 12.1"; the share of its drop sources that join our roster is what it still *describes*.
Measured 2026-08-13: 47 distinct labels do not resolve, including Method's own typos ("The
Colled Altar", "Den of Narolakk", "Szorak", "Ula tek") and, on four specs, whole Season-1
dungeons (Skyreach, Pit of Saron, Magisters' Terrace). The rate is deliberately computed over
what the page **published**, so the G24 drop cannot erase it — drop inside the parser and every
page reads 1.000 by construction, agreeing with its own label always, which is the exact
disagreement the number exists to measure.

Fixture baselines to compare a live run against: Holy Paladin 48 picks / rate 0.917 / 4 dropped
(all `The Tidebound Grotto`); Blood DK 30 picks / rate 1.000; Frost DK 51 picks / rate 1.000.

### What every guide lane emits for the page (G24's disclosure)

Each harvest file carries the same block, keyed so the page can merge the three and call
`staleDisclosure()` once:

```json
"staleDrops": {
  "source": "method",
  "dropped": 4,
  "kept": 44,
  "byDropSource": [{ "source": "The Tidebound Grotto", "dropped": 4 }],
  "bySpec":       [{ "spec": "Holy Paladin",           "dropped": 4 }],
  "byEndorsement": { "bis": 4, "alternative": 0 }
}
```

plus a per-spec `staleDrops.removed[]` naming every row that went, and a `season` block
(`id · label · patch · opensAt · predatesSeason`) so the staleness banner can call
`stalenessNotice()` without re-deriving the rule. Icy Veins and Wowhead carry `byEndorsement`;
Method's picks are all BiS, so it does not.

---

## Lane 4 — Archon (days to weeks after 08-18, and it says so itself)

```
node gearing/src/harvest-archon-gear.mjs --probe     # probe only; rewrites the pending record
node gearing/src/harvest-archon-gear.mjs             # probes, then harvests if the gate passes
```

**Do not wait for this lane and do not force it.** It ships `pending` (⚑ G14) and fills itself on
the first run that passes a **conjunction of five checks**: `lane` (a live zone type, not beta),
`noBetaWarning`, `season` (the page's own prose names the live season), `roster` (every encounter
it names joins our harvested roster) and `sample` (`totalParses ≥ 500`).

Measured 2026-08-13: the gate fails on `roster`, **0 of 9 encounters join** — the page names
Imperator, Vorasius, Salhadaar, Vaelgor & Ezzorak, Vanguard, Crown, Chimaerus, Belo'ren and
Midnight Falls, which is Season 1. (That listing is also the independent confirmation that
*Nexus King Salhadaar* — still cited by an Icy Veins BiS page — is Season-1 content, which is
the case G24 was written for.)

The five-check conjunction is not paranoia: on 2026-08-13 Archon's `beta-mythic-plus` lane
already served the complete Season-2 dungeon roster off **16 parses**, under Archon's own warning
that treating testing data as live is "incorrect and inaccurate". A roster-only check passes that
page; a prose-only check passes a live page whose content list has not turned over. Both
together, plus the lane and the sample floor, do not.

`WOW_ACCEPT_ARCHON_REGRESSION=1` exists for a sample that legitimately shrank. It is not a way
to skip the gate.

---

## Lane 5 — the merge, and the gap you will hit

**⚠ This step has no script yet, and it is what makes the harvest visible.**

The three guide harvesters write **per-source** files — `data/guide-picks-icyveins.json`,
`data/guide-picks-wowhead.json`, `data/guide-method.json`. The build reads **two merged** files,
`data/guide-picks.json` and `data/guide-priorities.json`, and nothing in `gearing/src` writes
them (verified 2026-08-13: `build.mjs` is their only reader; there is no writer). Both are
committed in the `pending` state, and their own `pending.gate` text — *"Fills on the first
post-flip local run of the three guide harvesters"* — describes a step that does not exist.

So: running all three guide lanes successfully still leaves the page ranking by stat fit alone
and saying so. That is honest and it is not broken, but it is not the finished feature.

Building the merge belongs to whoever owns the ranking lane, not to this runbook, but the shape
it must produce is already fully specified and validated:
`validate-data.mjs` (`GUIDE_SOURCE_IDS` = exactly `icyveins`, `wowhead`, `method`) engages the
real schema the moment `status` flips from `"pending"` to `"harvested"`, with no code change —
"correct on empty data and correct on a harvest, without an edit in between". Write the merged
files to that schema and the page fills in.

Until it exists, the honest end state of a launch re-harvest is: Lanes 1–4 committed, the
per-source files present and disclosed, `guide-picks.json` still pending.

---

## Blocked, or simply not ready?

The difference matters because one needs a person and the other needs a calendar.

| Symptom | Reading | Do |
|---|---|---|
| Archon `--probe` fails `roster` or `sample` | **Not ready.** Logs have not accumulated. | Nothing. Re-probe in a few days. |
| A guide page's season/patch check fails on *some* specs | **Not ready.** That outlet updates per spec. | Re-run that lane later; the others are unaffected. |
| A guide page's check fails on *all 40* specs | **Blocked.** A URL shape or the page's own wording changed. | Fetch one page by hand and look. |
| `unresolvable drop source` names a boss you recognise | **Blocked, on our side.** Lane 2 is incomplete or a name changed. | Fix the roster join. Do NOT accept — accepting drops a real pick. |
| `unresolvable drop source` names Season-1 content | **Ready, and G24 is working.** | Accept with the lane's escape; read the disclosed count. |
| `pick set changed` (Wowhead) | **Expected on a re-harvest.** | Read the diff, then `WOW_ACCEPT_GUIDE_CHANGES=1`. |
| `picks fell N -> M (>10%)` (Icy Veins) | **Ambiguous.** Real shrinkage or a broken parser. | Diff a page by hand before `--force`. |
| Any harvester 403s | **Blocked, transport.** | Wowhead needs `r.jina.ai` (+ `x-return-format: html`); Method takes a plain GET. **A WebFetch negative on Wowhead is not evidence of absence** — it reported "no loot tables" on a page with nine. |

---

## Known data gaps carried in from the scope (close these, do not rediscover them)

- **`Tidebound Grotto` / Nymrissa Wavecaller** — a real Season-2 source missing from our data;
  own instance and lockout; 4 items misfiled, 9 absent. ⚑ G22. Blocks Lane 3's accuracy.
- **`Nexus King Salhadaar`** — Season-1 raid boss still cited by an Icy Veins BiS page.
  Confirmed independently by Archon's own S1 roster listing. The G24 case.
- **Method's Season-1 dungeons** — Skyreach, Pit of Saron, Magisters' Terrace, on four specs.
- **Method's typos** — "The Colled Altar", "Den of Narolakk", "Szorak", "Ula tek". These are
  *not* stale content and Method publishes no guide ids to repair them from, so they will land
  in the refusal every run until Method fixes them or an alias is added.
- **Icy Veins' PTR domain share** — 0.734 pre-launch. A post-flip run should see it fall; it is
  a reading, never a gate.
- **`droppedBy`** — 39 of 104 raid and 25 of 204 dungeon items unattributed.

---

## Never do these

1. **Never run a guide lane before the item lane.** Real picks get dropped as stale and the
   disclosure will confidently tell you they were out of season.
2. **Never run G24's drop before Wowhead's guide-id repair.** Measured: five real votes deleted
   on one fixture page.
3. **Never accept an unresolvable source without reading it.** The escape flags exist so a human
   can say "these are genuinely Season-1", not so a run can be made to finish.
4. **Never gate what a harvester ACCEPTS on `SEASON.wowheadNamespace`.** It decides what we emit.
   A stale `/ptr/` link outlives the flip and is not a reason to lose a pick.
5. **Never recompute `rosterMatchRate` after the drop.** It measures the published set; recompute
   it and it reads 1.000 forever.
6. **Never commit a harvest before the tracker's flip has landed** — everything upstream is
   mid-transition, and the result is pre-launch data wearing a Season-2 label.
7. **Never hand-write `staleDrops`, `season` or a pending file.** All three are derived.

---

## Deliberately left alone (decided 2026-08-13; do not re-open without new evidence)

- **A catalyst pick whose BASE is out of season keeps its vote.** `resolveDropSource` types
  `"X (Catalyst)"` as a catalyst record whether or not `base` resolves, so `partitionStalePicks`
  keeps it. The catalyst is a current-season route and only the base is stale; dropping on a null
  base would also delete the legitimate bare `Catalyst` label, which several pages write. If a
  launch harvest shows this mattering, it is a decision, not a bug fix.
- **Alternatives are dropped by the same rule as picks.** G24 names no carve-out, and an
  alternative endorsement puts the item in the same ranked list. The risk — Icy Veins scrapes an
  alternative's drop text out of prose ("… from Nek'zali"), so a prose quirk could cost a vote —
  is *measurable* rather than argued: `staleDrops.byEndorsement` splits the two. Check it on the
  first live run; the recorded fixtures drop zero alternatives.
- **G24 tests the source TEXT, not the item pool.** The stronger test — "is this item id in our
  Season-2 pool" — is not what G24 specifies, and Phase C's ranking already iterates our items,
  so an item we do not hold never becomes a candidate anyway. Belt and braces, in that order.
- **The three harvesters keep their own namespace-accept patterns** rather than importing
  `lib-wowhead-url.mjs`'s closed `WOWHEAD_NAMESPACES` list. The asymmetry is principled and both
  halves are right: a **writer** must use a closed list (inventing a namespace produces a URL
  nobody serves), while a **reader** must accept anything (a fifth namespace should cost us a
  freshness signal, never a pick). Worth consolidating into one module with two exports if
  someone touches both; not worth coupling them today.
- **Method's per-spec dates are not a staleness gate.** They self-date 9th–13th Aug 2026 and the
  tracker already declined to set a `published` threshold for Method without a deliberate number
  (`docs/s2-flip-runbook.md`).
