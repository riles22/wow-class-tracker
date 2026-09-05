# refresh-tiers run log

Keep the newest ~20 entries; prune older ones when appending — and MEAN it. Pruned
2026-08-15 (these four logs held 64-78 entries each, and none had ever been pruned): watch-creators had
reached 270KB, over the Read tool's 262,144-byte gate, so a bare Read of it returned NOTHING.

This file holds NO machine state. The seen-set moved to structured data on 2026-08-08
(pending-transcripts.json seen[]/skipped[]/videos[] plus take urls) precisely because
regexing ids out of this prose absorbed 231 ordinary English words into a 950-entry set;
parse counts are logged "for the record" behind no gate. It is narrative memory, and it is
prunable. Durable RULES belong in SKILL.md, not here — the 2026-08-15 prune had to promote
~31KB of parser traps out of the prune range first, because they existed nowhere else.

Entries are sorted NEWEST FIRST by date. Two forms are in use ("- <date>" and "## <date>"),
they interleave, and refresh-tiers was chronologically scrambled before this prune — so sort
by parsed DATE, never by position. Do not cite lines of this file by NUMBER from anywhere
else; grep for a phrase (docs/s2-flip-runbook.md used to do that and would have broken).

## 2026-09-05 (nightly, THIRD run of the day) — 240/240 rows re-parsed, ZERO letters moved; Archon walled night 14

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — 240 rows, 0 unmatched, 0 letters moved.** Counts
  reconciled per page BEFORE any merge (27 DPS / 7 healer / 6 tank on each bracket); `apply-ratings`
  was then run on the full 240 anyway and confirmed the no-op (no diff on specs.json).
- **Page self-dates all unchanged**, the honest explanation for a static parse, each re-read from the
  page rather than carried forward: Icy Veins JSON-LD dateModified 08-30 / 09-01 / 08-29 (raid) and
  08-30 ×3 (M+); Wowhead 08-31 ×3 (raid), 08-28 / 08-26 / 09-01 (M+); Method's own "Last Updated"
  lines 10th August (raid) and 13th August (M+).
- Era-verified from bodies and changelogs, never a substring count. All twelve Icy Veins and Wowhead
  pages self-identify as Season 2 and mention Season 1 only as the past; the Icy Veins raid-healer
  TITLE still says "(Patch 12.0.7 / Midnight)" and is overridden by its Season 2 body (body-over-title).
  Devourer present in all four DPS and both tank lists, correctly absent from the healer ones.
  seasonVerified stays s2 on all 20 pages, so nothing for freeze-season to observe.
- Transports, for the record: Icy Veins direct browser-UA GET (r.jina.ai not attempted, IP-403 here);
  Method direct; Wowhead the FULL browser header set, then unescape \\/ -> / across the whole document
  BEFORE locating [tier-list=rows], never anchoring on WH.markup.printHtml. Method's M+ page again
  offered 8 extra "tierlist" blocks that are the dungeon-difficulty ones — rejected by ROSTER MATCH,
  which is the only position-independent rejection.
- **Archon: night 14 of the wall.** All 11 distinct registered URLs fetched with the full header set;
  every one HTTP 403 with Cloudflare's "Just a moment..." body (6,054-6,180 B) and `__NEXT_DATA__`
  count 0 — asserted on __NEXT_DATA__, never on status, because the wall also appears as a 200
  "Human Verification" body (which is exactly the shape the pre-agent source-health probe caught on
  the M+ DPS route this run, 2,516 B, while our own fetch of the same URL drew the 403). Nothing
  parsed, nothing written, no snapshot touched; retention policy keeps Archon's last verified S2
  letters in the four-source consensus. encounter-tiers.json read, not assumed: still season "s1"
  at asOf 2026-08-17, so the Fight selector stays hidden.

## 2026-09-05 (nightly, SECOND run of the day) — 240/240 rows re-parsed, ZERO letters moved; Archon walled night 13

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — 240 rows, 0 unmatched, 0 letters moved.**
  `apply-ratings` was run on the full 240 anyway and confirmed the no-op (no diff on specs.json).
  Counts were reconciled per page BEFORE any merge: 27 DPS / 7 healer / 6 tank on each bracket.
- **Page self-dates all unchanged**, which is the honest explanation for a static parse: Icy Veins
  JSON-LD dateModified 08-30 / 09-01 / 08-29 (raid) and 08-30 / 08-30 / 08-30 (M+); Wowhead 08-31 ×3
  (raid), 08-28 / 08-26 / 09-01 (M+); Method's own "Last Updated" lines 10th August (raid) and
  13th August (M+). Every one re-read from the page, none carried forward.
- Era-verified from bodies and changelogs, never a substring count. All six Icy Veins and all six
  Wowhead pages self-identify as Season 2; the Icy Veins raid-healer TITLE still says
  "(Patch 12.0.7 / Midnight)" and is overridden by its Season 2 body, the blue-tracker body-over-title
  precedent. Devourer present in every DPS and tank list, correctly absent from Wowhead's healer pages.
  `seasonVerified` stays **s2** on all fourteen pages, so nothing changed and `freeze-season` had
  nothing to observe.
- **Archon: night 13 of the wall.** All 11 distinct registered archon.gg URLs fetched with the full
  browser header set; every one returned **HTTP 403 + Cloudflare "Just a moment…"** (6,075-6,159 bytes)
  with `__NEXT_DATA__` count 0. The pre-agent `source-health/evidence.json` independently caught BOTH
  documented shapes on its two ordinary public routes the same minute — Heroic raid DPS 403
  cloudflare-challenge, M+ DPS **HTTP 200** human-verification — which is exactly why the assertion is
  on `__NEXT_DATA__` presence and never on the status code. Nothing solved, replayed or automated past;
  nothing backfilled from Warcraft Logs; every archon snapshot date left untouched. Per the
  2026-09-05 owner-confirmed retention policy the last verified S2 Archon letters still contribute, so
  the consensus is still **four sources**.
- Snapshot dates for the three reachable sources were already 2026-09-05 (stamped by the morning
  nightly) and were **re-verified live rather than advanced** — recorded in the manifest rows too, so
  a reader does not mistake an unmoved date for an unattempted fetch.

## 2026-09-05 (nightly) — all three reachable sources parsed clean and ZERO letters moved; Archon walled night 12

- **Icy Veins** 6/6 pages, direct browser-UA GET, HTTP 200, 195-343 KB. `<style>` stripped first,
  `<table class="tier-list">` asserted at exactly 1 per page, letter from each row's first `<td>`,
  spec from each entry's FIRST `alt` looked up WHOLE. **raid 27/7/6 = 40, M+ 27/7/6 = 40, 0 unmatched,
  0 duplicates.** 0 letters moved. JSON-LD `dateModified` re-read on every page and all six match the
  stored `published` (08-30 / 09-01 / 08-29 raid; 08-30 / 08-30 / 08-30 M+) — a static page producing a
  static parse, which is the only combination that should ever be reported as "no movement".
- **Method** 2/2, HTTP 200, 159/166 KB. Roster match again rejects the M+ page's second tierlist — the
  same eight dungeon-difficulty labels, 0 spec rows unmatched, 40/40 both brackets, 0 letters moved.
  Its own `.last-updated` paragraphs still read 10th August (raid) and 13th August (M+). Note when
  grepping these: a `(?:st|nd|rd|th)` regex that starts at the digit eats the leading "1", so "10th"
  reads as "0th" — take the whole `<p class="last-updated">` text.
- **Wowhead** 6/6 with the full header set, HTTP 200, 75-341 KB. Unescape `\/` FIRST, then the
  `[tier-list=rows]` block; exactly one per page, 0 unmatched `[spec-badge=…]` slugs, 40/40 both
  brackets, 0 letters moved, and every `dateModified` matches stored `published` (raid 08-31 x3;
  M+ 08-28 / 08-26 / 09-01).
- **Archon: walled, night 12.** All 11 distinct registered URLs fetched: HTTP 403 with Cloudflare's
  "Just a moment..." interstitial, 6,054-6,159 bytes, `__NEXT_DATA__` count 0, zero "Human
  Verification" text — the 403 shape rather than the 200-plus-verification-body shape the contract
  label describes, which is exactly why the assertion is on `__NEXT_DATA__` presence. Nothing solved,
  replayed or backfilled; consensus stays "consensus of 3".
- Era: all 14 reachable pages self-identify as Season 2 / Patch 12.1 in the BODY. Two traps re-confirmed
  and both handled by reading the body, not a substring count — Icy Veins' raid-healer page still titles
  itself "(Patch 12.0.7 / Midnight)", and its DPS and M+ DPS pages mention Season 1 only in
  retrospective prose ("a less powerful version than Season 1"). No `seasonVerified` value changed,
  so freeze-season had nothing to observe.
- Snapshots bumped to 2026-09-05 for icyveins/method/wowhead (and the four fetched metric sources);
  archon's left untouched at 08-25 / 08-18.


## 2026-09-04 (nightly) — Icy Veins raid TANK re-cut (Protection Paladin A -> S, the only letter that moved anywhere); Method and Wowhead static; Archon walled night 11

- **Transport, recorded per the rule**: all 14 registered tier-list pages fetched by DIRECT
  browser-header GET (full header set — a UA-only request is Cloudflare-403 on wowhead;
  r.jina.ai deliberately not attempted, IP-403 on `wowhead.com/guide/*` since 2026-08-03 and
  never worked on murlok). Sizes read off disk, not `curl`'s `size_download`.
- **Icy Veins** (6 pages, 196–343 KB, HTTP 200): `<style>` stripped before parsing, exactly one
  `<table class="tier-list">` asserted per page, letter from each row's first `<td>`, spec from
  each `tier-list-entry`'s FIRST `img alt` looked up WHOLE. Counts reconciled BEFORE merging:
  raid 27/7/6 = 40, M+ 27/7/6 = 40, 80 rows, 0 unmatched, 0 duplicates, every letter inside the
  registered 7-band scale. **1 letter moved: Protection Paladin raid A -> S**, on the raid TANK
  page. Worth keeping as a first-alt-rule confirmation — that page's S row emits alts
  `Blood Death Knight` / `Death Grip Icon` / `Protection Paladin`, so a naive "all alts" pass
  would have tried to resolve an ability icon.
- ⚠️ **The raid-tank page's `published` was WRONG in the registry and is corrected to 2026-08-29.**
  It stored 2026-08-08. Its JSON-LD `dateModified` reads `2026-08-29T15:00` and the deterministic
  pre-agent `published-evidence` artifact independently resolves it to `2026-08-29`, so the two
  agree and the stored value contradicted both. The trap: this page has **no in-body
  "LAST UPDATED - Nth of Month" line** (the other five do), and its visible changelog still tops
  out at `08 Aug. 2026` — so a run that reads only the changelog lands on 08-08 and looks right.
  Take `dateModified` when the in-body line is absent, and cross-check the evidence artifact:
  a stored `published` that disagrees with it is a **red publish gate**, not a nit.
  Other `published` values re-read and unchanged — raid 08-30 / 09-01 / **08-29**, M+ 08-30 x3.
- **Method** (2 pages, 160/166 KB): parsed from `tier__tier` / `tier__title` /
  `data-original-title` and resolved by ROSTER MATCH, which again rejects the M+ page's second
  tierlist — its eight entries are the dungeon-difficulty blocks and none maps to a spec. Raid
  40/40, M+ 40/40, 0 spec rows unmatched. **ZERO letters moved**, and the pages' own "Last
  Updated" lines are unchanged at 10th August (raid) / 13th August (M+), which is the honest
  explanation. Era: both bodies self-identify as Midnight and both carry all three DH specs
  including Devourer — note the flattened-text `Devourer` check reads FALSE on these pages
  because the spec names live in `data-original-title` attributes, not in the text; check the
  parsed rows, not the stripped body.
- **Wowhead** (6 pages, 75–341 KB): unescape `\/` -> `/` across the whole document FIRST, then
  find `[tier-list=rows] … [/tier-list]` (never anchor on `WH.markup.printHtml`), segment on
  `[tier-label …]X[/tier-label]` with tolerant whitespace, resolve each `[spec-badge=…]` slug.
  Exactly one block per page; raid 27/7/6 = 40, M+ 27/7/6 = 40, 0 unmatched, 0 duplicate-tier
  conflicts. **ZERO letters moved**, and every `dateModified` matches the stored `published`
  (raid 08-31 x3, M+ 08-28 / 08-26 / 09-01), confirmed independently by the evidence artifact.
- **Archon — walled, night 11.** All 11 distinct registered URLs returned **HTTP 403 with
  Cloudflare's "Just a moment..." interstitial** (~6.0–6.2 KB), `__NEXT_DATA__` count 0, and the
  string "Human Verification" absent. **That is a DIFFERENT shape from the one
  `required-sources.json` describes** (HTTP 200 carrying a ~2.5 KB human-verification body) —
  which is exactly why that label tells you to assert on `__NEXT_DATA__` presence and never on
  the status code. Both shapes are the same wall; neither was worked around. Stored letters,
  numbers and snapshots byte-identical. Consensus stays Icy Veins + Method + Wowhead,
  "consensus of 3".
- No `seasonVerified` value changed anywhere this run, so `freeze-season` had nothing to observe.

- **PRUNE DEFERRED to a local run, deliberately — and the reason is structural.** This log is at
  28 entries against the header's "~20", but a NIGHTLY cannot prune safely: the 2026-08-15
  precedent is that durable rules must be promoted into `SKILL.md` *before* the entries carrying
  them are dropped, and the publish job stages only `data/`, `dist/` and
  `.claude/skills/*/log.md` (nightly.yml) — a `SKILL.md` edit made here is never committed. So a
  nightly prune can delete a rule but cannot save it. Checked before deferring: the drop range
  (8 entries) holds one rule that exists NOWHERE else — the 2026-08-16 Archon finding that
  `lastUpdated` moved independently of the data in BOTH directions ("do not read Archon's label as
  its data date in either direction"), which `SKILL.md` does not carry. Files are 107 KB, well under the Read tool's 262,144-byte gate, so
  nothing is broken by waiting for a run that can do both halves.
## 2026-09-03 (nightly) — Icy Veins raid HEALER re-cut (2 letters); Method and Wowhead static; Archon walled again

- **Transport, recorded per the rule**: all 14 registered tier-list pages fetched by DIRECT
  browser-header GET (full header set — a UA-only request is Cloudflare-403 on wowhead;
  r.jina.ai deliberately not attempted, IP-403 on `wowhead.com/guide/*` since 2026-08-03 and
  never worked on murlok). Sizes read off disk, not `curl`'s `size_download`.
- **Icy Veins** (6 pages, 196-343 KB, HTTP 200): `<style>` stripped before parsing, exactly one
  `<table class="tier-list">` asserted per page, letter from each row's first `<td>`, spec from
  each `tier-list-entry`'s FIRST `img alt` looked up WHOLE. Counts reconciled BEFORE merging:
  raid 27/7/6 = 40, M+ 27/7/6 = 40, 80 rows, 0 unmatched, 0 duplicates, every letter inside the
  registered 7-band scale. **2 letters moved, both on the raid HEALER page: Holy Priest A -> S
  and Holy Paladin S -> A** — a straight swap at the top of that list. That page is the one that
  re-cut: JSON-LD `dateModified` 2026-09-01 with an in-body "LAST UPDATED - 01st of September"
  and a new changelog row "01 Sep. 2026: Updated for the end of RWF Mythic progression", where
  last night recorded 2026-08-24 for it. `published` re-read per page: raid 08-30 / **09-01** /
  08-08, M+ 08-30 / 08-30 / 08-30.
- **Era note worth keeping**: the raid-healer page's TITLE still reads "(Patch 12.0.7 / Midnight)"
  while its body and changelog are unambiguously Season 2 ("large nerfs before Season 2's launch",
  "Further updated for Midnight Season 2 launch"). Body over title, the blue-tracker precedent —
  the Season 1 hits on all six pages are changelog rows and retrospective prose, never the ranking
  body. `seasonVerified` stays s2 everywhere; **no seasonVerified value changed this run**, so
  freeze-season had nothing to do (it runs publish-side anyway).
- **Method** (2 pages, 160/167 KB): parsed from `tier__title` / `data-original-title` and resolved
  by ROSTER MATCH, which again rejects the M+ page's second tierlist — its eight entries are
  dungeon-difficulty blocks (Altar of Fangs, Den of Nalorakk, King's Rest, Murder Row, Ruby Life
  Pools, Temple of Sethraliss, Voidscar Arena, The Blinding Vale) and none maps to a spec. Raid
  40/40, M+ 40/40, 0 unmatched. **ZERO letters moved.** The pages' own "Last Updated" lines are
  unchanged at 10th August (raid) and 13th August (M+), which is the honest explanation.
- **Wowhead** (6 pages, 75-340 KB): unescape `\/` -> `/` across the whole document FIRST, then find
  `[tier-list=rows] … [/tier-list]` (never anchor on `WH.markup.printHtml` — the raid-healer page
  carries a decoy call), segment on `[tier-label …]X[/tier-label]` with tolerant whitespace, resolve
  each `[spec-badge=<spec>-<class>]` slug. Exactly one tier-list block per page; raid 27/7/6 = 40,
  M+ 27/7/6 = 40, 0 unmatched slugs, 0 duplicate-tier conflicts. **ZERO letters moved** — and every
  page's `dateModified` is unchanged from last night (raid 08-31 x3, M+ 08-28 / 08-26 / 09-01), so
  a static parse is exactly what a static page should produce. Note the raid DPS list currently has
  no S tier at all; that is upstream's shape, not a dropped block.
- **Archon: walled again, unchanged since 2026-08-25/26.** All 11 distinct registered archon.gg URLs
  fetched individually with the full browser header set; every one returned **HTTP 403** with a
  ~6.1 KB Cloudflare managed-challenge body (`<title>Just a moment...</title>`) and `__NEXT_DATA__`
  count **0**. Asserted on `__NEXT_DATA__` presence, not the status code, per the contract note.
  No solve, replay or automation attempted; nothing backfilled from Warcraft Logs (hard rule 3).
  Stored letters, numbers and snapshots left byte-identical. Consensus stays Icy Veins + Method +
  Wowhead, "consensus of 3".
## 2026-09-01 (nightly) — Icy Veins raid DPS re-cut (5 letters) + Wowhead raid DPS/tank and M+ tank (10); Archon walled night 10

- **Transport, recorded per the rule**: every page fetched by DIRECT browser-header GET
  (full header set — a UA-only request is Cloudflare-403 on wowhead; r.jina.ai deliberately
  not attempted, it has been IP-403 on `wowhead.com/guide/*` since 2026-08-03 and never
  worked on murlok). Sizes read off disk, never `curl`'s `size_download` (that reports the
  COMPRESSED length under `--compressed`).
- **Icy Veins** — 6/6 pages HTTP 200, 196–343 KB. `<style>` stripped BEFORE parsing (the
  tier-list CSS ships inline), `<table class="tier-list">` asserted at exactly 1 per page,
  letter from each row's first `<td>`, spec from each `tier-list-entry`'s FIRST `img alt`
  looked up WHOLE. Counts reconciled before merge: raid 27/7/6 = 40, M+ 27/7/6 = 40,
  80 rows, 0 unmatched, 0 duplicates. **5 letters moved, all on the raid DPS page**:
  Demonology Warlock A→S, Beast Mastery Hunter B→A, Frost Death Knight B→A, Survival
  Hunter B→A, Fury Warrior A+→A. That page now self-dates **2026-08-30** (JSON-LD
  `dateModified` 2026-08-30T13:09:00Z and an in-body "LAST UPDATED - 30th of August"),
  where last night's run recorded 08-23 for it — the stored `published` was corrected to
  what the page says today rather than carried forward. Other page dates unchanged: raid
  healer 08-24, raid tank 08-08, all three M+ pages 08-30.
- **Method** — 2/2 pages HTTP 200, 160/167 KB. Parsed from `tier__tier` / `tier__title` /
  `data-original-title` and resolved by ROSTER MATCH, which is again what rejects the M+
  page's second tierlist (8 dungeon-difficulty blocks — Altar of Fangs, Den of Nalorakk,
  King's Rest, Murder Row, Ruby Life Pools, Temple of Sethraliss and two more — none of
  which maps to a spec). raid 40/40, M+ 40/40, 0 unmatched. **0 letters moved**, and the
  pages' own "Last Updated" lines are unchanged at 10th August (raid) / 13th August (M+),
  which is the honest explanation for a static parse.
- **Wowhead** — 6/6 pages HTTP 200, 74–339 KB. Recipe as recorded: unescape `\/`→`/` across
  the whole document FIRST, then the `[tier-list=rows] … [/tier-list]` block (never anchor
  on `WH.markup.printHtml`), segment on `[tier-label …]X[/tier-label]` with tolerant
  whitespace, resolve each `[spec-badge=<spec>-<class>]` slug. Exactly one tier-list block
  per page; raid 27/7/6 = 40, M+ 27/7/6 = 40, 0 unmatched, 0 duplicate-tier conflicts.
  **10 letters moved on the three pages that were re-cut, and none anywhere else** — raid
  DPS (dateModified 2026-08-31T15:47Z): Arms Warrior S→A, Arcane Mage B→A, Havoc DH A→B,
  Devourer DH A→B, Augmentation Evoker C→B; raid TANK (2026-08-31T15:53Z): Protection
  Paladin B→A, Guardian Druid B→A, Vengeance DH B→A, Brewmaster Monk A→B; M+ tank
  (**2026-09-01T09:55Z**, the only page dated today): Protection Paladin A→B. `published`
  re-read per page and written: raid 08-31/08-31/08-31, M+ 08-28/08-26/09-01.
- **Archon — walled for a TENTH consecutive night.** All 11 distinct registered archon.gg
  URLs (12 page entries; the survivability entry shares the Mythic all-bosses URL) fetched
  individually with the full browser header set: every one HTTP 403 with a ~6.1 KB
  Cloudflare managed-challenge body (`<title>Just a moment...</title>`, `cType: 'managed'`,
  `/cdn-cgi/challenge-platform/`) and `__NEXT_DATA__` count 0. Asserted on `__NEXT_DATA__`
  presence rather than the status code. No solve, replay or automation attempted; nothing
  backfilled from Warcraft Logs. Stored letters, numbers and snapshots byte-identical, and
  `data/encounter-tiers.json` stays stamped s1, so the Fight selector stays season-gated off.
- **Era-verify**: all 14 live-source pages self-identify as Midnight Season 2 with Devourer
  present in both DPS lists (the two healer pages legitimately have no DH). The Icy Veins
  Season-1 hits are changelog rows, not the ranking body — body-over-title as always. **No
  `seasonVerified` value changed anywhere this run**, so `freeze-season` had nothing to do
  (publish runs it regardless).
- Consensus effect of the whole night: **2 letters** — Vengeance DH raid B→A and Arcane Mage
  raid A+→S. Consensus composition unchanged at Icy Veins + Method + Wowhead (Archon still
  s1 and therefore still out).

## 2026-08-31 (nightly) — Icy Veins M+ re-cut (11 letters) + Wowhead raid healers (3); Archon walled night 9, and from CI it is STILL the 403

- **Three of four tier sources refreshed, 240 rows re-applied, 14 letters moved.** Icy Veins
  6 pages, Method 2, Wowhead 6 — all direct browser-UA GET, HTTP 200, r.jina.ai deliberately
  not attempted (IP-403 on these hosts). Per-page counts reconciled BEFORE any merge:
  Icy Veins raid 27/7/6 and M+ 27/7/6 = 80; Wowhead the same 80; Method 40 + 40. Zero
  unmatched, zero duplicate-tier conflicts, every letter inside its registered scale.
- **Icy Veins M+ moved 11 letters, and two of them were the TBD rows closing.** Last night's
  run recorded a literal TBD row holding Windwalker Monk and Frost Death Knight; both are
  rated now (Windwalker S, Frost DK A+), so they land as null → letter rather than as
  movement. The other nine: Demonology A+ → S+, Beast Mastery A → A+, Feral A → A+,
  Mistweaver A → A+, Holy Priest B → A, Survival B → A, Discipline C → B, Destruction
  A+ → A, Marksmanship A → B. All three M+ pages carry `dateModified` 2026-08-30 (15:31,
  13:48, 12:46 UTC) — the DPS page was re-cut about fifteen minutes AFTER last night's
  fetch, which is exactly why last night saw none of this.
- **Wowhead raid healers moved 3 and is dated TODAY** (`dateModified` 2026-08-31T11:20 −05:00):
  Discipline S → A, Holy Priest B → A, Holy Paladin A → B. Every other Wowhead page and both
  Method pages are byte-identical to last night. Method's own "Last Updated" strings are
  unchanged at 10th August (raid) and 13th August (M+).
- **The Icy Veins raid-HEALER page title still says "Patch 12.0.7 / Midnight" and it is still
  Season 2** — body over title, the blue-tracker precedent. Its section heading reads
  "Midnight Healer Tier List for Season 2" and "Season 2" appears 21 times in the body.
  seasonVerified stays `s2`; no seasonVerified value changed anywhere this run, so
  freeze-season had nothing to be triggered by.
- **Archon: night 9, and the shape depends on WHERE YOU FETCH FROM.** The 08-31 local entry
  below records the wall turning into an HTTP 200 carrying a ~2.5 KB human-verification body
  from Riley's residential IP. From the CI runner the same twelve registered pages return
  **HTTP 403 with a ~6.1 KB Cloudflare managed-challenge body** (`cType: 'managed'`,
  "Just a moment...", `/cdn-cgi/challenge-platform/`), `__NEXT_DATA__` count **0** on all
  twelve. So the two forms coexist and are IP-dependent — which does not change the required
  behaviour one bit, because the assertion that matters is `__NEXT_DATA__` presence and it is
  zero either way. Nothing touched: archon's snapshots stay 2026-08-25/08-18 and its letters
  stay out of the consensus, which remains Icy Veins + Method + Wowhead.

## 2026-08-31 (local, scheduled) — Archon walled an EIGHTH night, and the wall CHANGED SHAPE; 0 letters touched

- **Archon is still unreachable, but it is no longer serving the 403.** Two representative
  registered pages re-probed from Riley's residential IP with the full browser header set
  (raid heroic all-bosses DPS, and M+ 10 all-dungeons this-week DPS). Both returned **HTTP 200**
  — not the 403 the last seven nights recorded — with a **~2.5 KB** body (against 5.8–5.9 KB
  before), `<title>Human Verification</title>`, and `__NEXT_DATA__` count **0**.
- ⚠️ **This is exactly why the contract row says to assert on `__NEXT_DATA__` presence and not
  on the status code.** A status-code check would have read tonight's 200 as a recovery and
  then either merged an empty parse or thrown somewhere further downstream. The assertion held
  and reported the truth: the page is a challenge page, whatever its status line says. Same
  lesson as the WCL 403 note in CLAUDE.md, from the opposite direction — **a 200 is not
  reachability any more than a 403 is an outage.** Keep the assertion on the payload.
- **Not bypassed, and it must not be.** The interstitial is a human-verification challenge;
  completing or working around one is out of bounds for this project regardless of how much
  data sits behind it. The honest outcome is an `unreachable` row.
- **Nothing merged, nothing stamped.** No `snapshot` date advanced, no letter written:
  `data/specs.json`, `data/sources.json` and `data/encounter-tiers.json` are byte-identical to
  HEAD. Archon's 80 rated cells, its six numeric series and the 619 encounter rows all stand at
  their stored 2026-08-24/25 dates.
- **Standing consequence, unchanged:** Archon is the only tier source still describing S1, so
  the wall continues to hold off the one consensus recomposition the anomaly gate is waiting
  for, and `consensusFor` stays at Icy Veins + Method + Wowhead ("consensus of 3"). The
  `archon-heroic-dps` coverage date (2026-08-24) is now 7 days old against `maxAgeDays` 5 — and
  since the 2026-08-25 owner decision that is the series Archon's raid LETTERS read from, so
  the heartbeat red is the honest signal and is not to be acked away.
- **Icy Veins / Method / Wowhead deliberately NOT refetched this run.** All three are `success`
  rows the CI nightly fetches reliably, and today's nightly had not yet fired at run time
  (the schedule has been landing ~14:57–15:17Z since the 08-27 degradation, against its 10:37Z
  cron). Regenerating them locally is what makes a push unmergeable, and would have raced the
  night for no gain. Residential-only catch-up was the whole scope.

## 2026-08-30 (local, scheduled) — Archon walled a SEVENTH night; residential re-probe reproduced the wall; 0 letters touched

- **Scope: Archon only.** Icy Veins, Method and Wowhead were all fetched successfully by the
  nightly ~1h before this run (15:16Z) with zero letters moved, so re-fetching them here would
  be independently regenerating data CI already produced — the thing that makes a local push
  unmergeable. Verified-unchanged rather than re-fetched.
- **The wall held from a residential IP, and this is a CONFIRMATION, not a new finding.** The
  `archon-tiers` contract row already records the residential re-test of 2026-08-27 and
  declares the datacenter-IP hypothesis dead; this run reproduced it. One page probed
  (`dps-rankings/raid/heroic/all-bosses`) with the full browser header set: **HTTP 200**, 1,290
  bytes, `<title>Human Verification</title>`, and — the assertion that actually matters —
  **`__NEXT_DATA__` count 0**, exactly as the contract row instructs (never assert on the
  status code here; a status-only check would have recorded SUCCESS and stamped a fresh
  snapshot over unchanged letters).
- **Worth recording: the two shapes coexist.** Tonight's nightly saw **403** with a
  `Just a moment...` Cloudflare body from CI; this residential probe saw **200** with the
  signed `/human-challenge` form (hidden `intendedUrl` / `expiresAt` / `signature` fields, plus
  `window.__CF$cv$params`). Same wall, two presentations depending on the requesting path — so
  neither status code is diagnostic on its own, which is precisely why the contract asserts on
  `__NEXT_DATA__`.
- **No attempt was made to submit, replay or automate past the challenge.** The contract row
  says so in terms and it is also simply not something a scheduled run should do; the form is
  bot-detection and defeating it is out of scope at any hour. Nor was anything backfilled from
  Warcraft Logs — Archon's letters are Archon's own tiering, and publishing ours under the
  `archon` source id would fabricate the source (hard rule 3).
- **Consequence, unchanged and correctly handled by the build:** `consensusFor` stays at Icy
  Veins + Method + Wowhead and the toolbar reads "consensus of 3". Note the Archon pages are
  `seasonVerified: s2` as of the 08-25 snapshot, so this is a reachability outage rather than
  the season-gate case — the letters are 5 days stale, not withheld.
- `data/specs.json` ratings, `data/encounter-tiers.json` and every Archon snapshot date are
  byte-identical. 0 rows written.

## 2026-08-30 (nightly, CI runner) — all three reachable sources fetched, ZERO letters moved; Archon walled a SIXTH night

- **Icy Veins — all 6 live pages, HTTP 200, 196–343 KB decompressed, direct browser-UA GET**
  (r.jina.ai deliberately not tried; it is IP-403 on these hosts). `<style>` blocks stripped
  BEFORE parsing, `<table class="tier-list">` count asserted EXACTLY 1 per page, letter from
  each row's first `<td>`, spec from each `tier-list-entry`'s FIRST `img` alt looked up WHOLE.
  Counts reconciled before any merge: raid 27/7/6 = 40 and M+ 27/7/6 = 40 = **80 cells**,
  0 unmatched, 0 duplicates, every letter inside the registered 7-band scale. The M+ DPS page
  still carries its literal `<tr><td>TBD</td>` row holding Windwalker Monk and Frost Death
  Knight; both parse as explicit nulls and match the stored nulls, so the **rated**-cell count
  stays 78 (the number `required-sources` counts) while the parse reads 80. All 80 cells
  byte-identical to stored: **0 moves**, nothing merged, snapshots → 08-30. Self-dates (JSON-LD
  `dateModified`) unchanged: raid DPS 08-23, raid healer 08-24, raid tank 08-08, M+ DPS 08-23,
  M+ healer 08-23, M+ tank 08-23 — matching stored AND the pre-agent published-evidence
  artifact. Era-verified s2 on all six from the BODY: the raid healer page still titles itself
  "Patch 12.0.7 / Midnight" while its body counts Season 2 21× against Season 1 6× — body over
  title, the blue-tracker precedent. Devourer present and A in both DPS pages.
- **Method — both pages, HTTP 200, 159 KB / 166 KB.** Letters from each `tier__tier` block's
  `tier__title`, specs from each entry's `img` alt, extras rejected by ROSTER MATCH: the M+
  page's nine unmatched images are the eight dungeon-difficulty blocks + the Method logo, the
  raid page's one is the logo. 40 rows per bracket, 0 duplicates, letters confined to the
  4-band S|A|B|C scale. All 80 byte-identical: **0 moves**. Self-dates from the body's "Last
  Updated" line unchanged — raid 10th August 2026, M+ 13th August 2026 (the M+ list is bylined
  Tactyks, which is exactly why his creator entry is raid-scoped). Era-verified s2 from the
  body; neither page mentions Season 1.
- **Wowhead — all 6 pages, full browser header set, HTTP 200, 73–339 KB.** Unescape `\/` → `/`
  across the WHOLE document FIRST, then locate `[tier-list=rows] … [/tier-list]` — never anchor
  on `WH.markup.printHtml(`. Exactly ONE block per page, asserted; tolerant-whitespace tier
  labels; specs from the `[spec-badge=<spec>-<class>]` kebab slug. 27/7/6 per bracket = 80 rows,
  0 unmatched, 0 duplicates. **The 08-28 M+ DPS rebuild HELD**: Demonology S, Unholy A, Subtlety
  A, Balance B, Frost DK B and Frost Mage C all unchanged, and the tier shape counts out the
  same (S 1, A+ 2, A 7, B 14, C 3 = 27). All six `dateModified` unchanged (raid DPS 08-14, raid
  healer 08-18, raid tank 08-14, M+ DPS 08-28, M+ healer 08-26, M+ tank 08-18), matching stored
  and the artifact, so no `published` value was touched. **0 moves**, snapshots → 08-30.
- **Archon — walled, night 6, still the HTTP 403 form.** All 12 registered pages fetched
  individually: every one 403 with a 5.8–5.9 KB Cloudflare body, `<title>Just a moment...</title>`,
  `__NEXT_DATA__` count 0 — asserted on `__NEXT_DATA__` presence, never on the status code. The
  site ROOT returns the same 403 and r.jina.ai returns a 319-byte "Human Verification / One Quick
  Check" page, so this is upstream and not our parse. Nothing merged, no snapshot bumped,
  `encounter-tiers.json` untouched (s1 stamp, 619 tier rows). Consensus stays at Icy Veins +
  Method + Wowhead, "consensus of 3", and the S1→S2 recomposition the anomaly gate is waiting
  for is still held off by the wall.
- **No `seasonVerified` value changed**, so `freeze-season.mjs` had nothing to consider.

## 2026-08-29 (nightly, CI runner) — Wowhead's M+ DPS page REBUILT: 6 letters moved, Demonology B→S; Archon walled a FIFTH night

- **Icy Veins — all 6 live pages, HTTP 200, 196–343 KB decompressed, direct browser-UA GET**
  (r.jina.ai deliberately not tried; it is IP-403 on these hosts). `<style>` blocks stripped
  BEFORE parsing, `<table class="tier-list">` count asserted EXACTLY 1 per page, letter from
  each row's first `<td>`, spec from each `tier-list-entry`'s FIRST `img` alt looked up WHOLE.
  Counts reconciled before any merge: raid 27/7/6 = 40 and M+ 25/7/6 = 38, i.e. **78 rows**,
  0 unmatched, 0 duplicates, every letter inside the registered 7-band scale. The M+ DPS
  shortfall was VERIFIED rather than assumed — the page carries a literal `<tr><td>TBD</td>`
  row holding Windwalker Monk and Frost Death Knight, and both stay explicit stored nulls.
  All 78 letters byte-identical to stored: **0 moves**, nothing merged, snapshots → 08-29.
  Self-dates (JSON-LD `dateModified`) unchanged: raid DPS 08-23, raid healer 08-24, raid tank
  08-08, M+ DPS 08-23, M+ healer 08-23, M+ tank 08-23 — matching stored AND the pre-agent
  published-evidence artifact. Era-verified s2 on all six from the BODY: the raid healer page
  still titles itself "Patch 12.0.7 / Midnight" while its body counts Season 2 21× against
  Season 1 6× — body over title.
- **Method — both pages, HTTP 200, 159 / 166 KB.** 40 rows per bracket, 0 duplicates, letters
  confined to the 4-band S|A|B|C scale, **0 moves**. Extras rejected by ROSTER MATCH: the M+
  page's nine unmatched images are the eight dungeon-difficulty blocks plus the logo, the raid
  page's one is the logo. Self-dates from the body's "Last Updated" line: raid 10th August
  2026, M+ 13th August 2026 (bylined Tactyks), unchanged. Era-verified s2 — "the Midnight
  Season 2 Raid, The Venomous Abyss" and "dungeon difficulty in Midnight Season 2"; neither
  page mentions Season 1 at all.
- **Wowhead — all 6 pages, full browser header set, HTTP 200, 73–339 KB. THE M+ DPS PAGE
  REBUILT and six letters moved with it.** `dateModified` 2026-08-18 → **2026-08-28**T17:02:55-05:00.
  Moves: **Demonology Warlock B→S** (now alone in S), Unholy DK B→A, Subtlety Rogue B→A,
  Balance Druid A→B, Frost DK A→B, Frost Mage B→C. The S move is a 3-band jump, so the block
  was re-read STRUCTURALLY before merging and the tiers count out exactly — S 1, A+ 2 (Arms
  Warrior, Arcane Mage), A 7, B 14, C 3, D 0 = **27**. Corroborated by a witness the agent
  cannot write: the pre-agent published-evidence artifact independently reports 2026-08-28 for
  that page, so stored `published` advanced 08-18 → 08-28. The other five neither re-dated nor
  moved. Parse as always: unescape `\/` across the WHOLE document FIRST, then find
  `[tier-list=rows] … [/tier-list]` — never anchor on `WH.markup.printHtml(`. 80 rows, 0
  unmatched, exactly ONE tier-list block per page.
  Standing flag, unchanged: all four bylined Wowhead pages are written by registered creators
  (raid DPS + raid tank Dratnos, M+ DPS **tettles**, M+ healer AutomaticJak) — and tonight the
  firewall bites on the page that moved.
- **Archon — WALLED, night 5, in the 403 form.** All 12 registered pages HTTP 403, 5.9–6.2 KB
  Cloudflare body, `<title>Just a moment...</title>`, `__NEXT_DATA__` count **0**. Asserted on
  `__NEXT_DATA__` presence, never the status code. Two transports plus a root probe: the site
  ROOT `archon.gg/wow` returns the same 403, and r.jina.ai returns HTTP 200 with a 319-byte
  body that is entirely the "Human Verification / One Quick Check" page — the same inversion
  seen on 08-28. Nothing merged, no snapshot bumped, `encounter-tiers.json` untouched (season
  stamp still `s1`, 619 tier rows). Consensus stays at **3 sources**.
- **No `seasonVerified` value changed**, so `freeze-season` had nothing to consider.
- Consensus movement vs the last committed snapshot: **3 tier moves, 0 of ≥2 bands** — far
  under the anomaly limits (6 / 25), so no ack was needed or proposed.

## 2026-08-28 (nightly, CI runner) — 240 letters re-parsed across three sources, 0 moves; Archon walled a FOURTH night

- **Icy Veins — all 6 live pages, HTTP 200, 196–343 KB, direct browser-UA GET** (r.jina.ai
  deliberately not tried; it is IP-403 on these hosts). `<style>` blocks stripped BEFORE
  parsing — the page ships its whole tier-list CSS inline, so an unstripped anchor matches
  stylesheet rules — and the `<table class="tier-list">` count then asserted EXACTLY 1 per
  page. Letter from each row's first `<td>`, spec from each `tier-list-entry`'s FIRST `img`
  alt looked up WHOLE against the roster. Counts reconciled before any merge: 27 / 7 / 6 per
  bracket = **80 rows**, 0 unmatched, 0 duplicates, every letter inside the registered 7-band
  icyveins scale. Upstream still publishes exactly TWO M+ DPS specs as **TBD** (Windwalker
  Monk, Frost Death Knight); both stay explicit `null`. **All 80 letters byte-identical to
  stored**, so nothing was merged. Page self-dates re-read from JSON-LD `dateModified` and
  unchanged: raid DPS 2026-08-23, raid healer 2026-08-24, raid tank 2026-08-08, M+ DPS
  2026-08-23, M+ healer 2026-08-23, M+ tank 2026-08-23 — identical to stored `published` AND
  to the pre-agent `published-evidence/evidence.json`, three agreeing witnesses. Era-verified
  **s2** on all six from the BODY: the raid HEALER page still titles itself "Patch 12.0.7 /
  Midnight" while its body counts Season 2 21 times against Season 1 six — body over title,
  the blue-tracker precedent. `seasonVerified` unchanged, so freeze-season had nothing to
  consider.
- **Method — both pages, HTTP 200, 159 / 166 KB.** CSS stripped, letters from each
  `tier__tier` block's `tier__title`, specs from the entry `img` alts. Extra tierlists
  rejected by ROSTER MATCH, never by position: the M+ page's nine unmatched images are the
  eight dungeon-difficulty blocks (Altar of Fangs, Den of Nalorakk, King's Rest, Murder Row,
  Ruby Life Pools, Temple of Sethraliss, The Blinding Vale, Voidscar Arena) plus the Method
  logo; the raid page's single unmatched image is the logo. 40 rows per bracket, 0 duplicates,
  letters confined to the 4-band method scale S|A|B|C. **All 80 byte-identical.** Self-dates
  from the body's "Last Updated" line: raid 10th August 2026, M+ 13th August 2026 (bylined
  Tactyks), both unchanged. Era-verified s2 from the body — "the Midnight Season 2 Raid, The
  Venomous Abyss" and "dungeon difficulty in Midnight Season 2".
- **Wowhead — all 6 pages, HTTP 200, 73–339 KB, full browser header set** (a UA-only request
  is Cloudflare-403). Parse: unescape `\/` across the WHOLE document FIRST, then locate
  `[tier-list=rows] … [/tier-list]` in the unescaped text — never anchored on
  `WH.markup.printHtml(`, the decoy that once returned 0 rows for the raid-healer page.
  Exactly ONE tier-list block per page, asserted. Specs resolved from the
  `[spec-badge=<spec>-<class>]` kebab slug, which sidesteps the two-word-class split. 27 / 7 /
  6 = **80 rows**, 0 unmatched, 0 duplicates. **ZERO letters moved.** `dateModified`
  byte-identical to stored and to the published-evidence artifact on all six: raid DPS
  2026-08-14, raid healer 2026-08-18, raid tank 2026-08-14, M+ DPS 2026-08-18, M+ healer
  2026-08-26, M+ tank 2026-08-18. The M+ healer page that rebuilt on 08-26 and carried the
  Holy Priest C→B move has not re-dated or re-moved again — the right shape for real upstream
  movement settling.
- **Archon: walled for a FOURTH consecutive night, and the shape matches this morning's local
  run rather than last night's nightly.** All 12 registered pages plus the site ROOT return
  **HTTP 403**, 5.7–6.0 KB, `<title>Just a moment...`, `__NEXT_DATA__` count **0** — the
  Cloudflare challenge of 08-25/08-26, not the HTTP 200 "Human Verification" interstitial the
  08-27 nightly measured. Second transport for the record: r.jina.ai now returns **HTTP 200
  with a 232-byte body** whose entire content is "Human Verification / One Quick Check", i.e.
  the proxy reaches the interstitial where direct traffic is stopped a layer earlier — the
  exact inverse of last night. Either way `__NEXT_DATA__` is absent, which is the assertion
  the contract row mandates; a status-code check alone would have called tonight a clean 403
  and last night a success. Nothing merged, no snapshot bumped, stored letters byte-identical.
  Standing consequence unchanged: Archon is the only tier source still describing S1, so this
  wall is also holding off the one consensus recomposition the anomaly gate is waiting for.
- Snapshots bumped to 2026-08-28 for the three reachable sources (18 pages). `npm run
  test:quiet` 345 pass / 0 fail / 33 skipped, build clean, `node src/snapshot.mjs` written.


## 2026-08-28 (local, scheduled) — Archon's wall holds for a FOURTH night and has reverted from 200 to 403; no source re-fetched

- **Archon: still walled, and the shape flipped back.** Probed the site root plus four registered
  pages with the full browser header set: all five **HTTP 403**, 5.7–6.0 KB, `<title>Just a
  moment...`, `__NEXT_DATA__` count **0** on every one. That is the 08-25/08-26 Cloudflare
  interstitial again, NOT the HTTP 200 "Human Verification / One Quick Check" page the 08-27 local
  run measured. So the wall oscillates in presentation between nights while remaining continuously
  impassable — which is the strongest argument yet for the standing rule to **assert on
  `__NEXT_DATA__` presence, never on the status code**: across four nights this source has
  returned 403 and 200 for the same underlying block.
- **Root included in the probe**, as before: the root is not a tier list and has no reason to be
  gated on its own, so its interstitial makes "the site is walled" a measurement rather than an
  inference about our parse.
- **Not solved, and must not be.** It is a bot check; this project does not defeat those by policy.
  The honest record stays "unreachable". Nothing merged, no snapshot stamped, stored letters
  byte-identical. Note `archon-tiers` sits at 3d against a 4d max and will go red tomorrow on its
  own — that red is the honest signal, and it is Riley's call whether to wait it out or approach
  Archon.
- **Icy Veins / Method / Wowhead deliberately NOT re-fetched.** They were refreshed by the
  2026-08-27 nightly (1d, against a 4d max) and independently regenerating what CI already produced
  is what makes a local push unmergeable — the more so today, with GitHub's scheduler running hours
  late and today's nightly still pending. Same call as 08-27, same reason.


## 2026-08-27 (nightly) — three tier sources fetched, parsed and reconciled; ZERO letters moved anywhere, and Archon's wall holds for a third night

**Merged: 0 rows. Nothing to merge — all 240 letters parsed identical to stored.** No
`sources.json` edit was needed either: every page snapshot was already 2026-08-27 from the
earlier run today, and a snapshot is not bumped onto data that did not move.

- **ICY VEINS — 80/80, 0 moves.** Six pages by direct browser-UA GET, HTTP 200, 73–281 KB
  (r.jina.ai deliberately not tried; it is IP-403 on these hosts). `<style>` stripped BEFORE
  parsing and the `<table class="tier-list">` block count asserted **exactly 1 per page** — the
  page ships its whole tier-list CSS inline, so an unstripped anchor finds stylesheet rules.
  Letter from each row's first `<td>`, spec from each `.tier-list-entry`'s FIRST `img alt`
  looked up WHOLE against the roster. Counts reconciled to 27/7/6 per bracket = 80 **before**
  any merge: 0 unmatched, 0 duplicates, every letter inside the registered 7-band scale.
  The two M+ DPS TBDs (Windwalker Monk, Frost Death Knight) are still upstream and stay explicit
  nulls. Page self-dates from JSON-LD `dateModified`: raid 08-23 / 08-24 / 08-08, M+ 08-23 ×3 —
  identical to the stored `published` values AND to the pre-agent published-evidence artifact.
  Era-verified s2 from the BODY on all six; the raid HEALER page still titles itself
  "Patch 12.0.7 / Midnight" while its body is Season 2 throughout — body over title, as before.
- **METHOD — 80/80, 0 moves.** Both pages HTTP 200, 159 / 166 KB. Extra tierlists rejected by
  ROSTER MATCH, never by position: the M+ page's nine unmatched images are the eight dungeon
  blocks (Altar of Fangs, Den of Nalorakk, King's Rest, Murder Row, Ruby Life Pools, Temple of
  Sethraliss, The Blinding Vale, Voidscar Arena) plus the Method logo, and the raid page's one
  unmatched image is the logo. 40 rows per bracket, letters confined to the 4-band scale.
  Self-dates from the body: raid **10th August 2026**, M+ **13th August 2026** (Tactyks' byline),
  both unchanged. Era s2 from the body — "the Midnight Season 2 Raid, The Venomous Abyss" and
  "dungeon difficulty in Midnight Season 2"; Devourer present in both.
- **WOWHEAD — 80/80, 0 moves.** Six pages with the full browser header set, HTTP 200, 73–339 KB.
  Backslash-slash unescaped across the WHOLE document first, then `[tier-list=rows]` located in
  the unescaped text — never anchored on `WH.markup.printHtml(`, the decoy that once returned 0
  rows for raid-healer. Exactly one block per page, asserted; specs from the
  `[spec-badge=<spec>-<class>]` kebab slug. `dateModified` on all six is byte-identical to stored
  and to the published-evidence artifact, **including M+ healer at 2026-08-26T13:33Z** — the page
  that rebuilt yesterday and carried last night's single Holy Priest C→B move. It has not moved
  again, which is the right shape: one page re-dates, one letter moves, then both settle.
- ⚠️ **ARCHON — unreachable, third consecutive night, and the wall's SHAPE is now confirmed from
  CI too.** Every registered page and the site ROOT (`archon.gg/wow`, not a tier list and with no
  reason to be gated on its own) return **HTTP 200 carrying a ~2.5 KB "Human Verification / One
  Quick Check" interstitial** — not the 403 of 08-25/08-26. That matches what the 08-27 local run
  measured from a residential IP, so the wall is neither IP-scoped nor a CI artifact; it changed
  shape, and a checker keyed on the status code alone would now read it as a successful fetch of
  an empty page. Second transport tried: r.jina.ai returns **403** with Cloudflare's "Just a
  moment..." challenge, i.e. the proxy is stopped one layer earlier. Nothing merged, no snapshot
  bumped, `data/encounter-tiers.json` untouched and still season-gated out of the UI.
  Standing consequence unchanged: Archon is the one tier source still describing S1, so this wall
  is also holding back the consensus recomposition the anomaly gate is waiting for.


## 2026-08-27 (local, scheduled) — Archon's wall is NOT IP-scoped: it holds from a residential IP too, and it has changed shape from 403 to 200

- **The residential retry that this local run exists to make: Archon is still walled.** The nightly
  has recorded all 9 Archon rows unreachable for three consecutive nights, and the standing
  hypothesis for a CI-only block is a datacenter IP. Re-tested from Riley's residential IP with the
  full browser header set: **the wall holds**, so the datacenter-IP explanation is now ruled out.
  Nothing merged, no snapshot bumped, stored letters byte-identical.
- **⚠ THE SHAPE CHANGED AND IT NOW LOOKS LIKE SUCCESS — read the BODY, not the status.** The nightly
  saw **HTTP 403** with a "Just a moment..." interstitial. Tonight every registered page returns
  **HTTP 200** carrying a 1.3–2.5 KB `<title>Human Verification</title>` page ("One Quick Check /
  Please confirm that you are a human and not a bot"), with `__CF$cv$params` and the
  `/cdn-cgi/challenge-platform/` precursor script. **`__NEXT_DATA__` count is 0.** A transport check
  keyed on status alone would now record all 9 rows as SUCCESS and stamp today's snapshot over
  unchanged letters — which is the wowmeta failure mode (a 200 is not freshness) wearing a new hat.
  Assert on `__NEXT_DATA__` presence, never on the status code.
- **Measured as site-wide, not page-specific:** the same interstitial on the site ROOT
  (`archon.gg/`, 2452 b), on the raid Heroic DPS and Healer pages, and on the M+ DPS page. The root
  is not a tier list and has no reason to be gated on its own, which is what makes "the site is
  walled" a measurement rather than an inference about our parse.
- **The gate was NOT solved and must not be.** It is now an explicit interactive "I am a human and
  not a bot" button — a bot check, which this project does not defeat by policy; the honest record
  is "unreachable". If it persists, the decision is Riley's: wait it out, or approach Archon.
- **Standing consequence, unchanged:** Archon is the one tier source still describing S1 ("updating
  for 12.1"), so this wall is also holding back the consensus recomposition the anomaly gate is
  waiting for. Icy Veins / Method / Wowhead were refreshed by tonight's nightly and were NOT
  re-fetched here — independently regenerating what CI already produced is what makes a local push
  unmergeable.


## 2026-08-27 (nightly) — Archon's human-verification wall holds for a second night; Wowhead moves ONE letter (Holy Priest M+ C → B) and it is corroborated by the page's own date

**Three of four tier sources fetched and re-verified 80/80 each; Archon is unreachable, same wall as 08-26.**

- **ARCHON — unreachable, and the wall is SITE-WIDE, not page-specific.** Every registered page
  returns **HTTP 403 with Cloudflare's `Just a moment...` interstitial** (`challenge-platform` in
  the body, 5.9–6.2 KB) under the full browser header set: the three Heroic raid rankings pages,
  the M+ DPS page, and — the check that settles it — `https://www.archon.gg/wow` itself, the site
  ROOT, which is not a tier list and has no reason to be gated on its own. r.jina.ai was tried as
  a second transport and returns HTTP 200 carrying a 319-byte **"Human Verification / One Quick
  Check"** page, i.e. the proxy sees the same interstitial rather than the content. Two independent
  transports, one of them a probe of the root, is what makes "the site is walled" a measurement and
  not an inference about our own parse. **Nothing was merged and no Archon snapshot was bumped**;
  all nine Archon requirement rows record `unreachable`. Consequence to keep in view: Archon is the
  only tier source that would ever be *expected* to move S1 → S2 (it has been "updating for 12.1"
  on every bracket since the flip), so this wall is also blocking the one recomposition the anomaly
  gate is waiting for.
- **ICY VEINS — 80/80 re-verified, 0 letters moved, nothing merged.** Six pages by direct
  browser-UA GET, HTTP 200, 194–341 KB. Parse bounded to the single `<table class="tier-list">`
  block per page (block count asserted **exactly 1** on all six); the first `<td>` of each row is
  the letter, matched whole-cell against the registered seven-band icyveins scale; each
  `tier-list-entry`'s FIRST `img alt` is looked up WHOLE against the roster, never split at a
  space. Counts printed and reconciled against 27+7+6=40 BEFORE any merge: raid 27/7/6, M+ 27/7/6,
  **0 unmatched, 0 duplicates**. Upstream still publishes exactly TWO M+ DPS specs as **TBD** —
  Windwalker Monk and Frost Death Knight — and both stay explicit `null`, rendering "—" and sitting
  outside the consensus mean. Page self-dates re-read from JSON-LD `dateModified` and unchanged:
  raid DPS 2026-08-23T13:09Z, raid healer 2026-08-24T00:44Z, raid tank 2026-08-08T15:00Z, M+ DPS
  2026-08-23T15:31Z, M+ healer 2026-08-23T13:48Z, M+ tank 2026-08-23T12:46Z — identical to the
  stored `published` values AND to the pre-agent published-evidence artifact, so the published
  cross-check has three agreeing witnesses. Era-verified **s2 from the BODY, not the title**: the
  raid HEALER page still titles itself "Patch 12.0.7 / Midnight" while its body opens "the various
  healing specializations for Midnight Season 2" and discusses Season-2 Abundance — the
  body-over-title rule, same shape as the blue-tracker patch tag.
- **METHOD — 80/80 re-verified, 0 letters moved, nothing merged.** Raid `/guides/tier-list/raiding`
  and M+ `/guides/tier-list/mythic-plus`, HTTP 200, 159 / 166 KB. CSS stripped before parsing (the
  string `tierlist` occurs 25–27 times per page and all but a handful are stylesheet selectors —
  anchoring on it without dropping `<style>` finds rules, not rows). Rows read from the
  `tier__tier` blocks, letter from `tier__title`, spec from each entry `img alt`. **Rejection is by
  ROSTER MATCH, never by position**: the M+ page carries 48 images, of which the 8 that fail to map
  are exactly the eight dungeon-difficulty blocks (King's Rest, Ruby Life Pools, Voidscar Arena,
  The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs). 40 rows
  each bracket, 0 unmatched. Page self-dates read from the body's "Last Updated" line: **raid 10th
  August 2026, M+ 13th August 2026** (the M+ list is bylined Tactyks). Era-verified s2 from the
  body: raid says "the Midnight Season 2 Raid, The Venomous Abyss"; M+ says "dungeon difficulty in
  Midnight Season 2".
- **WOWHEAD — 80/80 parsed, ONE letter moved: Holy Priest M+ C → B.** Six pages, HTTP 200,
  73–339 KB. `\/` unescaped across the whole document FIRST, then the `[tier-list=rows] …
  [/tier-list]` block located in the unescaped text — never anchored on `WH.markup.printHtml(`,
  which is the decoy that once returned 0 rows for the raid-healer page. Exactly **1** tier-list
  block found per page, asserted. Letters read with tolerant whitespace inside `[tier-label …]`
  and specs from the `[spec-badge=<spec>-<class>]` kebab slug, which sidesteps the
  two-word-class-name split entirely. 27/7/6 per bracket, 0 unmatched.
  **The single move is corroborated rather than merely parsed:** the M+ HEALER page's own
  `dateModified` is **2026-08-26T13:33Z** — it rebuilt yesterday, alone among the six — and it is
  the only page whose letters changed. The other five self-date 2026-08-14 (raid DPS, raid tank)
  and 2026-08-18 (raid healer, M+ DPS, M+ tank), all unchanged from stored and from the pre-agent
  evidence artifact. A letter moving on the one page that re-dated, and nothing moving on the five
  that did not, is the shape of real upstream movement; a parser drift would not respect that line.
- **`seasonVerified` unchanged on every page** (all four sources stay `s2` / Archon `s2` untouched
  because it was never fetched), so `node src/freeze-season.mjs` had nothing to consider and step
  5b is a no-op this run — no outlet flipped season tonight.
- **BYLINE FIREWALL — a NEW finding, flagged for Riley, nothing retired.** Reading each Wowhead
  page's byline while era-verifying turned up that **four registered creators author tier-list
  pages this tracker feeds into `consensusFor`**: Dratnos (raid DPS **and** raid tank), tettles
  (M+ DPS), AutomaticJak (M+ healer), YoDaTV (M+ tank). The documented Tactyks/Method precedent
  says such a creator is firewalled from the bracket they author, or one voice feeds both the
  consensus letters and `expertRead` on the same cell. Only Tactyks has ever been recorded that
  way. Measured exposure in the CURRENT take set: **23 live takes** sit in the bracket their author
  writes — Dratnos 3 (2 unscoped `both` + 1 raid), tettles 4 (2 M+ + 2 unscoped), AutomaticJak 7
  M+, YoDaTV 9 M+. Per the standing rule this is an OWNER decision — flagged, not acted on. Icy
  Veins' three M+ pages are all bylined "Petko", who is not a registered creator, so that source
  is clean.


## 2026-08-26 (nightly) — ARCHON IS BEHIND A SITE-WIDE HUMAN-VERIFICATION WALL; the other three re-verified 80/80 with 0 moves

**Archon: unreachable, and the shape matters so it is not misread as a parse failure.** Every request
returns **HTTP 200 with a ~1 KB body titled "Human Verification"** — "One Quick Check … confirm that
you are a human and not a bot" — carrying a POST form to `/human-challenge` with
`intendedUrl`/`expiresAt`/`signature` hidden fields. There is **no `<script id="__NEXT_DATA__">` at
all**, so the documented parse has nothing to read; a parser that anchored on `__NEXT_DATA__` and
reported "0 rows" would be describing the wrong thing entirely.

Probed enough to establish it is site-wide and not path- or header-specific: `archon.gg/`, `/wow`,
and both a raid and an M+ tier-list URL all return the same interstitial, with a UA-only request,
with the full browser header set (`sec-ch-ua`, `sec-fetch-*`, `Upgrade-Insecure-Requests`), and with
a `Referer`; three further attempts spaced ~12s apart were identical. **It was NOT worked around** —
no form POST, no proxy, no scrape service. It is an explicit anti-bot control, and the WCL precedent
("Use the API … instead of scraping HTML") is that we respect a site's stated position rather than
route around it. All nine archon-* manifest rows are `unreachable`; every Archon-derived value in the
tree is byte-identical to last night's reviewed local run, no `seasonVerified` moved, so no source
entered or left the consensus and the frozen lane was untouched.

Note for whoever sees this next: last night's local run fetched Archon fine, so this is new and quite
possibly **runner-IP reputation** rather than a policy change. A local run from a residential IP is
the thing to try. If it persists past ~2026-08-30 the archon-* staleness reds start firing (their
stored dates are 08-24/08-25 against `maxAgeDays` 5).

**Icy Veins — 80/80, 0 moves.** Six pages by direct browser-UA GET, HTTP 200, 193-340 KB raw. Parse
bounded to the single `<table class="tier-list">` per page (block count printed: exactly 1 each);
first `<td>` = letter, matched WHOLE-CELL against the registered scale with `TBD` written as explicit
`null`; each entry's FIRST `img alt` looked up whole. raid 27/7/6 + M+ 27/7/6 = **80**, 0 unmatched,
0 dups. Still exactly two M+ DPS TBDs (Windwalker Monk, Frost DK), both carried as nulls. Page
dateModified re-read and unchanged (raid DPS 08-23, raid healer 08-24, raid tank 08-08, all three M+
08-23), matching stored `published` and the pre-agent evidence artifact. Era-verified **s2 from the
body**: the raid HEALER page *still* titles itself "(Patch 12.0.7 / Midnight)" while its body carries
21 Season-2 references to 6 Season-1 and its newest changelog row is 24 Aug 2026 — body over title.

**Method — 80/80, 0 moves.** raid S 6 / A 11 / B 17 / C 6; M+ S 2 / A 13 / B 21 / C 4. The M+ page
again carries a SECOND tierlist (8 blocks vs raid's 4) and the eight dungeon names were rejected by
**roster match and reported as unmatched**, never by position. Era s2 in both bodies.
⚠️ Devourer is carried only in tag ATTRIBUTES here (`data-original-title`), so a tags-stripped body
scan reports it absent — check the raw HTML before concluding a roster gap on this source.

**Wowhead — 80/80, 0 moves.** Full browser header set (UA-only is Cloudflare-403; r.jina.ai still not
tried, IP-403 on `/guide/*`). Unescaped `\/` across the whole document FIRST, then took the
`[tier-list=rows] … [/tier-list]` block — exactly one per page tonight, no decoy. Tolerant-whitespace
tier labels, specs from the `[spec-badge=<spec>-<class>]` kebab slug. M+ DPS again publishes A+ (2)
and no S. Page self-dates unchanged and matching the evidence artifact.

Snapshots advanced to 2026-08-26 for the three verified sources (14 page entries); Archon's were left
where they were, because nothing was fetched.


## 2026-08-25 (local, evening) — ARCHON'S RAID LETTER BASIS MOVES TO HEROIC (owner decision); 26 of 40 letters re-rated, CONSENSUS_VERSION 5 → 6

- **This is a BASIS change, not spec movement, and the version bump is what says so.**
  Riley switched `ratings.raid.archon` from the Mythic throughput list to the HEROIC one
  while Mythic is sparse: Heroic carries ~170x the parses (470k vs ~2,950 DPS), covers all
  27 DPS specs — closing the Fire Mage null with a real letter (B, 1,215 parses) — and has
  zero rows under the rank floor, where Mythic had six specs under 10 parses and rank
  agreement with Heroic of only rho 0.54–0.71 (Frost Mage: Mythic #1 on n=5, Heroic #20
  on 14k+). 26 letters moved on landing; the v6 bump makes `pickBaseline` refuse the
  cross-version comparison, so the strip reads "baseline established" instead of arrows.
- **The registry is the authority on which pages feed letters**: the three main raid pages
  now point at `.../raid/heroic/all-bosses` (seasonVerified s2 — the pages self-describe
  12.1/The Venomous Abyss with the nine S2 bosses). The Mythic pages stayed registered as
  labeled `ancillary: true` entries — they feed the "(Mythic)" numeric families and
  survivability, never letters. Same __NEXT_DATA__ parse either way.
- **Switch-back trigger, recorded in the archon methodology text**: Mythic 27/27 DPS with
  healthy samples → reviewed registry edit back to the Mythic URLs + its own
  CONSENSUS_VERSION bump. Do not switch back silently mid-run.


## 2026-08-25 (nightly, 2nd run of the day) — all four sources re-fetched, 319 rows parsed, **0 letters moved**

Every source fetched inline, one at a time. Per-page counts printed and reconciled against
27+7+6=40 before any merge, exactly as the 35-letter recut earlier today required.

- **icyveins 80/80, 0 unmatched, 0 moves.** Letter matched as a whole-cell alternation over the
  registered scale (the `\b` backtracking trap that read "A+" as "A" is now avoided by
  construction). **Two M+ DPS specs are still TBD upstream** — Windwalker Monk and Frost DK,
  withdrawn on the 08-25 morning recut — and both stay explicit null rather than reverting to their
  old S and A. Tier counts: raid S 7 / A+ 10 / A 14 / B 8 / C 1 = 40, M+ S+ 3 / S 5 / A+ 8 / A 13 /
  B 7 / C 2 / TBD 2 = 40. Self-dates unchanged (raid DPS 08-23T13:09Z, raid
  healer 08-24T00:44Z, raid tank 08-08, M+ all three 08-23).
- **method 80/80, 0 moves.** The M+ page's second tierlist (dungeon difficulty) rejected by ROSTER
  MATCH — its eight dungeon names came back as unmatched and were reported, never dropped silently.
- **wowhead 80/80, 0 moves.** Unescape `\/` first, then the `[tier-list=rows]` block; one block
  per page tonight, so the raid-healer decoy did not arise. Self-dates 08-14/08-18, unchanged.
- **archon 79/80, 0 moves.** Fire Mage is still absent from the S2 raid DPS throughput list; stored
  as explicit null, nothing invented.
- **Era-verify note worth keeping:** the Icy Veins raid HEALER page still titles itself
  "(Patch 12.0.7 / Midnight)" while its body is Season 2 throughout and its changelog reads
  "24 Aug. 2026: Updated for the start of RWF Mythic progression". Body over title — it stays s2.
  A title-only check would silently drop 7 rows from the raid consensus.
- **`seasonVerified` changed on two pages**: the Archon **Per-boss** and **Per-dungeon** entries go
  s1 → s2, because the pages fetched tonight describe Season 2 content. Both are `ancillary: true`,
  so this is a record-only edit — outside `sourceSeasonOk` and `aheadSeasonFor`, no consensus, no
  forecast, no frozen-lane effect. `freeze-season` therefore had nothing to freeze (no live-lane
  season moved); the encounter FILE keeps its own `season: "s1"` stamp, because its data is S1.


## 2026-08-25 (nightly) — ICY VEINS RECUTS 35 LETTERS AND WITHDRAWS TWO TO "TBD"; a \b in the letter regex nearly published 38 phantom moves

All four tier sources fetched inline, one at a time, no subagents. Per-page counts printed and
reconciled against 27+7+6=40 before every merge.

- **icyveins 80/80, 0 unmatched, 35 MOVES.** Six pages, direct browser-UA GET, HTTP 200,
  192–340 KB. **The parser trap of the night:** the first letter regex was
  `/^([SABCDF][+-]?)\b/`, and because `+` is a non-word character the `\b` cannot sit after
  "A+" — the engine backtracks and matches "A". Every plussed row therefore read one band low,
  and the diff against stored showed **38 moves on 78 rows**: the exact shape of the recorded
  "13 phantom S-/A-/B- moves" trap, and it looks like a real recut. Anchor the letter as a
  WHOLE-CELL alternation over the registered scale (`^(S\+|S|A\+|A|B\+|B|C|TBD)$`), then the
  tier tables print verbatim and can be eyeballed: raid DPS S 3 / A+ 10 / A 7 / B 6 / C 1 = 27,
  M+ DPS S+ 3 / S 2 / A+ 6 / A 8 / B 5 / C 1 / **TBD 2** = 27.
- **Icy Veins publishes "TBD" as a tier row**, and it is not the era-gated source this project
  used to reserve that rule for. Windwalker Monk and Frost Death Knight sit in it on the M+ DPS
  page. Written as **explicit null**, never omitted and never left at the previous letter — they
  now read "—" and average 3 sources in M+ instead of 4. Ratings UPSERT, so "omit it" silently
  publishes a letter the page has withdrawn.
- The recut is genuinely upstream: raid DPS `dateModified` 2026-08-23T13:09Z and M+ DPS
  2026-08-23T15:31Z against the 2026-08-16 stored, and five of six `published` values moved
  (raid DPS 08-16→08-23, raid healer 08-13→08-24, all three M+ 08-16→08-23; raid tank alone
  unchanged at 08-08). All six agree with the pre-agent `published-evidence/evidence.json`.
- **method 40+40, 0 moves, fourth night running.** M+ page again carries 8 tier blocks; the four
  dungeon-difficulty ones were rejected by ROSTER MATCH, never by position.
  Note: the era-check "Devourer present" flag came back FALSE on a tag-stripped body scan and it
  was a false alarm — Method writes spec names in `data-original-title` attributes, which
  tag-stripping deletes. Confirm Devourer from the PARSED ROWS (it is there, A in both brackets),
  not from body text.
- **wowhead 80/80, 0 moves.** Unescape backslash-slash across the whole document FIRST, then take
  the `[tier-list=rows]` block with the most `[spec-badge=]` hits. Exactly one block per page
  tonight. M+ DPS still S/A+/A/B/C/D with no S-tier spec.
- **archon raid 39 entries (26+7+6), up from 37.** Frost Mage and Affliction Warlock are BACK;
  only Fire Mage is still missing from the S2 raid list, and its stored letter was re-written as
  explicit null. `lastUpdated` 08-23T12:00Z → 08-24T12:00Z on all six.
- **Downstream: 25 consensus letter moves, all one band, zero two-band** — exactly at
  `maxTotalMoves` 25 and therefore NOT a breach (`check-refresh` tests `total > limit`). Most of
  it is the Icy Veins recut. No ack proposed. Two raid cells went 3→4 sources and two M+ cells
  went 4→3.
- No `seasonVerified` value changed on any consensus-feeding page, so freeze-season had nothing
  to do (and on the runner it is publish's step, never the agent's). The ancillary Archon
  survivability page DID move s1→s2 — see refresh-metrics.
- `node src/snapshot.mjs` deliberately NOT run: on the nightly runner the publish job resets
  agent-shipped `data/history/` snapshots and takes its own, and writing one here would become
  the anomaly gate's own baseline in the completion check that runs after this agent — turning a
  25-move night into a self-certified 0-move night. Local runs still snapshot.


## 2026-08-24 (nightly) — ARCHON'S SEASON-2 RAID LISTS LAND; the raid consensus recomposes 3 -> 4 sources

**The event the transition plan has been waiting for.** After three weeks of empty raid tier
lists, Archon's Mythic Venomous Abyss pages returned data tonight, so `seasonVerified`
advanced **s1 -> s2** on all three raid pages and Archon re-entered the raid consensus.

- **Icy Veins / Method / Wowhead: 240 letters re-parsed, ZERO moves, third night running.**
  Counts reconciled before merging (27/7/6 per bracket per source), 0 unmatched, and
  apply-ratings re-run to prove the match — the specs.json diff stayed empty for all three.
- **Archon RAID**: throughput lists returned 24 DPS + 7 healer + 6 tank = **37 entries**
  (0 unmatched), with the specRankingsSection table repopulating at the same 37 rows.
  Era-verified three ways before anything was written: `page.description` reads "tier list
  for The Venomous Abyss ... in 12.1", `specRankingsSection.title` reads "DPS Rankings for
  Mythic The Venomous Abyss", and **Devourer is present** in the DPS list.
- **21 raid letters recut** against the stored Season-1 ones, and **three specs were written
  as EXPLICIT NULL** — Fire Mage, Frost Mage, Affliction Warlock have no row in Archon's S2
  raid list at all. Leaving their S1 letters standing under an s2-verified source is exactly
  the two-seasons-in-one-number lie DECISION 1 exists to stop; they now render "—" and their
  raid consensus averages 3 sources while the other 37 average 4.
- **Archon M+ recut for the THIRD consecutive night**: 17 of 40 letters moved, eleven of them
  S->A as Archon's own clustering narrowed the S band from 12 specs to 7. Real recut, proven
  on the same fetch: every score rose (Arms 2985->3037, Assassination 2986->3031, Arcane
  2975->3005), parses rose with them (Arms 324,536->404,296), the page total went
  2,353,508 -> 3,082,472, and `lastUpdated` advanced 08-22T12:00Z -> 08-23T12:00Z on all six.
- **Downstream: 10 consensus letter moves, all ONE band, none two-band** — raid Frost DK A->B,
  Marksmanship B->A, Windwalker A->B, Prot Paladin B->A, Discipline S->A+, Elemental B->A,
  Prot Warrior B->A; M+ Preservation B->A, Marksmanship A->B, Fury A->B. Anomaly limits are
  25 total / 6 two-band, so the gate is **not** tripped and no ack was proposed. Measured
  against committed history (2026-08-23), not against tonight's own snapshot.
- **freeze-season is not involved.** Archon moved from BEHIND to current, not ahead;
  `aheadSeasonFor` returns null for it, and `season-final.json` holds only s1 records for
  the three outlets that flipped ahead pre-launch. Nothing to freeze, nothing frozen.
- Six `published` dates re-read from JSON-LD and unchanged, 6/6 against
  published-evidence/evidence.json for both Icy Veins and Wowhead. Method's in-body dates
  (raid 10 Aug, M+ 13 Aug) are unchanged and still not stored — fetch-published.mjs does not
  cover method, so a stored value there would never be cross-checked. Owner call, unchanged.
- The Icy Veins raid HEALER page still carries a "Patch 12.0.7 / Midnight" title over a body
  that opens "for Midnight Season 2" and whose changelog top line reads "Further updated for
  Midnight Season 2 launch after the first few live tests". Body over title, as always.
- **encounter-tiers.json was NOT rewritten** — see the refresh-metrics log entry for the
  measurement; the short version is that 8 of Archon's 9 raid bosses still publish nothing,
  so an S2 rewrite would be a 42% row drop and a one-boss fight view.


## 2026-08-23 (nightly) — 280 letters re-parsed; Archon's M+ recuts again, 13 of its 40 move

**Icy Veins, Method and Wowhead: 0 moves for the second night running. Archon M+ moved 13
letters on a fresh upstream recut and that produced exactly 4 consensus letter moves, all
one band. Archon raid still publishes nothing.**

- **Per-page counts printed and reconciled against 27 DPS + 7 healer + 6 tank = 40 BEFORE
  merging.** Icy Veins 27/7/6 raid + 27/7/6 M+ = 80, 0 unmatched. Wowhead the same, 80, 0
  unmatched. Method 40 + 40 = 80, 0 unmatched. Archon M+ 27/7/6 = 40, 0 unmatched; Archon
  raid 0 (see below). 280 assignments re-applied in total.
- **Icy Veins** — six pages by direct browser-UA GET, HTTP 200, 192–340 KB. Parsed from the
  single `<table class="tier-list">`, first `<td>` per row = the letter, each
  `tier-list-entry`'s FIRST `alt=` looked up WHOLE against the roster (never split at a
  space, which is what keeps the two-word-class specs matchable). Zero moves; JSON-LD
  `dateModified` agrees 6/6 with the stored `published` AND with
  published-evidence/evidence.json — raid DPS 2026-08-16, raid healer 08-13, raid tank
  08-08, all three M+ 08-16. Era read from body over title again: the raid HEALER page
  still titles itself "Patch 12.0.7 / Midnight" over a body running 21 Season-2 mentions to
  6 Season-1, and the raid DPS page "Midnight (12.1)" over 54 to 14. `seasonVerified` stays
  s2 on all six; nothing changed, so freeze-season had nothing to see.
- **Method** — both pages HTTP 200, 159/166 KB, parsed from the `tier__title` MARKUP blocks
  (the id appears 11 times in each document and 7 of those are CSS rules; anchoring on
  `class="tier__title"[^>]*>` selects only the real ones). Entries from
  `data-original-title="Spec Class"`. Raid 4 tier blocks, 40 entries. The M+ page again
  carries 8 blocks — 4 spec tiers plus 4 dungeon-difficulty blocks — and the extras were
  rejected by ROSTER MATCH, not by position: Altar of Fangs, Den of Nalorakk, King's Rest,
  Murder Row, Ruby Life Pools, Temple of Sethraliss, The Blinding Vale and Voidscar Arena
  all fail to map, which is the intended behaviour. 0 moves. In-body dates unchanged at
  "Last Updated 10th August 2026" (raid) and "13th August 2026" (M+); still not written to
  sources.json, because fetch-published.mjs does not cover method and a stored value there
  would sit permanently un-cross-checked — unchanged owner call from 08-22.
- **Wowhead** — six pages with the FULL browser header set (UA-only is Cloudflare-403;
  r.jina.ai stays untried, IP-403 on /guide/* since 08-03), HTTP 200, 73–339 KB. Unescaped
  `\/`→`/` across the WHOLE document first, then searched for `[tier-list=rows] …
  [/tier-list]` and took the block with the most `[spec-badge=]` hits rather than anchoring
  on `WH.markup.printHtml(`. Exactly one block per page. Tier labels matched with tolerant
  whitespace: S/A/B/C on all three raid pages, S/A/B/C on M+ healer, **A+**/A/B/C on M+ DPS
  (still no S-tier spec in that cut) and S/A/B on M+ tank. 0 moves. `dateModified` unchanged
  and agreeing with published-evidence 6/6: raid DPS 08-14, raid healer 08-18, raid tank
  08-14, all three M+ 08-18.
- **Archon — the split is unchanged in shape but the M+ half recut again.** All six
  aggregate pages HTTP 200, 52–92 KB, parsed from `<script id="__NEXT_DATA__">` at
  `props.pageProps.page.specTierListSection.tierLists`, entries resolved from each entry's
  icon "Class-Spec" token and `tiers[].entries` treated as a list OF LISTS.
  · **M+ (metric `score`)**: 40 entries, 0 unmatched, `lastUpdated` 2026-08-21T12:00:00Z →
    **2026-08-22T12:00:00Z**, and **13 of the 40 letters moved**. Upstream, not a parse
    artifact — proven three ways on the same fetch: every one of the 40 underlying scores
    moved up (Assassination 2961→2986, Arms 2962→2985, Arcane 2952→2975), parse counts rose
    with them (Arms 238,025→324,536) and the page total went 1,626,924 → **2,353,508**.
    Five B→…→S-class promotions (Fury, Windwalker, Shadow, Marksmanship, Demonology A→S),
    four B→A (Frost DK, Devastation, Beast Mastery, Holy Priest), three B→C (Augmentation,
    Affliction, Frost Mage) and Preservation C→B. Every move is ONE Archon band.
  · **Downstream: 4 consensus letters moved, all one band, zero two-band** — Augmentation
    M+ B→C, Affliction M+ B→C, Marksmanship M+ B→A, Fury M+ B→A — against anomaly limits of
    25 total / 6 two-band. Gate not tripped, no ack proposed. Note the ratio: 13 source
    letters produced 4 consensus letters, because the consensus is a 4-source mean.
  · **RAID**: all three tierLists (popularity, throughput, survivability) returned **0
    entries** for the fourth night, while the chrome stays Season-2 (`encounterOptions` = the
    nine Venomous Abyss bosses, description "tier list for The Venomous Abyss … in 12.1").
    `seasonVerified` DELIBERATELY left at **s1** on the three raid pages, unchanged reasoning
    from 08-21/08-22: the stored `ratings.raid.archon` letters ARE Archon's Season-1 letters,
    so flipping the flag would average them into the S2 raid consensus (the two-seasons-in-
    one-number lie DECISION 1 exists to prevent) and would publish one fabricated movement
    event tonight plus a second real one when genuine S2 letters land. With an empty DPS list
    there is no Devourer entry to era-verify against either, so "unverifiable → skip, never
    guess" applies.
- No `seasonVerified` value changed anywhere this run, so `freeze-season.mjs` is a no-op —
  and on the nightly runner it is the publish job's to run, never the agent's (Gate 0 holds
  `data/season-final.json` immutable to us).
- Page snapshots advanced 2026-08-22 → 2026-08-23 for icyveins, method, wowhead and the six
  Archon aggregate pages. The three `ancillary: true` Archon pages stay at 2026-08-18, the
  date the stored encounter data actually comes from.


## 2026-08-22 (nightly) — 280 letters re-parsed; Archon's M+ recut moves 25 of its 40

**Icy Veins, Method and Wowhead: 0 moves. Archon M+: 25 of 40 letters moved on an upstream
recut, the first real tier movement since the flip. Archon raid still publishes nothing.**

- **Per-page counts printed and reconciled against 27 DPS + 7 healer + 6 tank = 40 BEFORE
  merging**, every source: icyveins 27/7/6 raid + 27/7/6 M+ = 80, method 40 raid + 40 M+ = 80,
  wowhead 27/7/6 + 27/7/6 = 80, archon 27/7/6 M+ = 40 and **0/0/0 raid**. 0 unmatched rows
  anywhere. Total 280 assignments across the four sources.
- **Transports, recorded per the standing rule.** Icy Veins: direct browser-UA GET, 192–339 KB,
  parsed from `<table class="tier-list">` (first `<td>` = the letter) with each
  `tier-list-entry`'s FIRST `alt=` looked up WHOLE. Method: direct GET, 159/165 KB, parsed from
  the `.tier__title` blocks. Wowhead: FULL browser header set (r.jina.ai untried — IP-403 on
  `/guide/*` since 08-03), unescape `\/`→`/` across the whole document FIRST, then
  `[tier-list=rows] … [/tier-list]`, selecting the block with the most `[spec-badge=]` hits rather than
  anchoring on `WH.markup.printHtml(`; exactly one block per page, 73–337 KB. Archon:
  `__NEXT_DATA__` → `props.pageProps.page.specTierListSection.tierLists` (NOT `page.tierLists`),
  entries resolved from each entry's icon `Class-Spec` token, `tiers[].entries` a list of lists.
- **ARCHON M+ RECUT — the one real movement tonight.** `lastUpdated` advanced
  2026-08-20T12:00:00Z → **2026-08-21T12:00:00Z** and the whole distribution shifted up: DPS is
  now S 13 / A 5 / B 9 / **C 0** (was spread A/B/C), healers S 2 / A 1 / B 1 / C 3, tanks
  S 1 / A 2 / B 2 / C 1. 25 of 40 letters moved — 4 up two Archon bands (Balance, Enhancement,
  Retribution, Havoc B→S), Protection Warrior down two (A→C), the rest one. This is a genuine
  upstream recut, not a parse artifact: the underlying `score` column moved with it (Arms 2892→2962,
  Arcane 2784→2952) and parse counts rose ~50% (Arms 156,334→238,025), i.e. week-1 Season-2 keys
  climbing. Downstream it produced **16 consensus letter moves, every one a single band and none
  two-band** — well inside the anomaly limits (25 total / 6 two-band), so no ack is needed and
  none was proposed.
- **Archon RAID is unchanged from the last three nights**: all three tierLists (popularity,
  throughput, survivability) return **0 entries** on all three aggregate pages while the chrome is
  Season-2 (encounterOptions = the Venomous Abyss, description "tier list for The Venomous Abyss …
  in 12.1"). `seasonVerified` stays **s1** on the three raid pages for the reason the 08-21 run
  recorded and which has not changed: the stored `ratings.raid.archon` letters are Archon's
  SEASON-1 letters, flipping the flag would average them into the S2 raid consensus, and with an
  empty DPS list there is no Devourer entry to era-verify against. No `seasonVerified` value
  changed anywhere this run, so `freeze-season.mjs` had nothing to do.
- **Era verified from each page's own title AND body, never a substring count.** Two Icy Veins
  pages again carry a stale-era title over a Season-2 body — raid HEALER titles "Patch 12.0.7 /
  Midnight" with 21 Season-2 mentions against 6 Season-1, raid DPS titles "Midnight (12.1)" with
  48 against 14 — body over title, the blue-tracker precedent, so both stay s2. Method's raid page
  reads "the Midnight Season 2 Raid, The Venomous Abyss", its M+ page "Midnight Season 2" under
  Tactyks' byline. All six Wowhead titles self-identify Season 2. Method's M+ page again carries
  the 4 dungeon-difficulty blocks alongside the 4 spec tiers, and the 8 dungeon names plus the
  Method logo were rejected by ROSTER MATCH, never by position.
- **`published` re-read per page, not carried forward, and unchanged** — 12/12 agreement with
  `published-evidence/evidence.json`: icyveins raid DPS 2026-08-16, raid healer 08-13 (JSON-LD over
  the 08-10 "Last UPDATED" line), raid tank 08-08, M+ ×3 all 08-16; wowhead raid DPS 08-14, raid
  healer 08-18, raid tank 08-14, M+ ×3 all 08-18. **Method does publish an in-body date after all**
  — "Last Updated 10th August 2026" (raid) and "13th August 2026" (M+), which earlier runs recorded
  as absent. Not written to the registry: `fetch-published.mjs` does not cover method, so a stored
  `published` there would sit permanently un-cross-checked. Noted here for the owner instead.
- Snapshots bumped to 2026-08-22 for the 20 aggregate tier-list pages actually re-parsed. The three
  Archon ANCILLARY pages were probed (see refresh-metrics log) but merged nothing, so their
  snapshots stay at 2026-08-18 — the date the stored encounter/survivability data really comes from.


## 2026-08-21 (owner registry edit — archon-encounters URLs re-pointed to S2)

**Two URLs, verified live before being written. No data rebuilt, no dates touched.**
Riley authorised the re-point after the 18:37Z nightly diagnosed both registry URLs as
RETIRED upstream.

- **The retirement is independently confirmed, not taken on the agent's word.** Both stored
  URLs (`.../raid/mythic/imperator`, `.../mythic-plus/10/windrunner-spire/this-week`) return
  HTTP 200 with a **byte-identical 199,655-byte body**, `__NEXT_DATA__` page `/[gameSlug]`,
  `title: null`, no `specTierListSection`. A dead URL that answers 200 is the worst shape of
  all — it MASKED the real upstream state as "unreachable".
- **S2 encounters enumerated live** from the aggregate pages' `encounterOptions` rather than
  from the agent's list (a search result is a lead, never a fact): 9 raid bosses and 8 M+
  dungeons, ids matching what the nightly reported.
- **All 17 candidate URLs then swept individually.** Every one returns HTTP 200 with real page
  structure, so the URL PATTERN is right. The split is total and clean:
  - **raid: 9 of 9 bosses publish ZERO throughput entries.** Identical across every boss, so
    this is upstream data availability, not a per-boss quirk. (Nek'zali does carry 26
    survivability entries — noted, not acted on; survivability is a separate requirement whose
    own row reads the aggregate pages.)
  - **M+: 8 of 8 dungeons publish 27 score entries each** — the DPS lane is fully live.
- **Chosen representatives** (these URLs are templates the recipe iterates from, which is why
  the labels say "9 bosses" / "8 dungeons"): raid → `nekzali`, the first boss enumerated and
  the only one returning any data at all, so a reachability probe on it is meaningful;
  M+ → `altar-of-fangs`, first enumerated and verified at 27 entries.
- **`snapshot` deliberately NOT bumped** — left at 2026-08-18. The URLs changed; no encounter
  tiers were refreshed. Stamping today would restart a 10-day staleness clock on data that did
  not move, which is exactly the failure this project already wrote down for the
  archon-survivability row. The gate now reads 3d of 10d and will fire around 2026-08-28 if the
  lane still has not rebuilt — that red is the true signal and it is left armed.
- **`seasonVerified` deliberately left at `s1`** — that field is written by refresh-tiers'
  era-verify step, in the run that actually fetches and merges. A registry edit hand-writing it
  would claim a verification the pipeline did not perform. It self-heals on the next refresh.
  Inert either way here: both pages are `ancillary: true`, so they sit outside the season gate
  in both `sourceSeasonOk` and `aheadSeasonFor`.
- **What this does and does not buy.** It does NOT unblock the rebuild, and the numbers say so
  precisely: an M+-only S2 cut is 8 x 27 = 216 DPS rows, or 320 with healer and tank pages
  (8 x 40) — against this requirement's `rows.min` of **440**, with the raid side contributing
  zero. That floor lives in `required-sources.json`, which is Gate-0 and CODEOWNERS-owned, so
  lowering it is an owner decision and was NOT taken here. What the re-point buys is the
  DIAGNOSTIC: the next nightly can now distinguish "upstream has no S2 raid data yet" from
  "our URL is broken", which the 200-answering dead page made impossible.
- Verified after the edit: `npm run validate` clean, 373 tests / 372 pass / 0 fail,
  `freeze-season` still a no-op with the archive untouched (and still correctly reading
  archon/raid as BEHIND the live season, not ahead), heartbeat fingerprint unchanged at the
  five owner-accepted standing reds. `encounter-tiers.json` keeps its `s1` stamp, so the Fight
  selector stays hidden — `imperator` and `windrunner-spire` still appear once each in
  `dist/index.html`, but as the stored S1 encounter KEYS (Imperator Averzian, Windrunner
  Spire), not as URLs. Checked rather than assumed.


## 2026-08-21 (nightly CI, second run of the day — the 11:00Z run also refreshed all four)

**All four sources re-fetched live. 280 letter assignments parsed, 0 unmatched, ZERO tier moves
and zero consensus moves.** Per-page row counts were printed and reconciled against the
27 DPS + 7 healer + 6 tank = 40 roster shape BEFORE any merge, and `apply-ratings.mjs` re-applied
all 280 rows to prove the roster match — `git diff data/specs.json` came back empty.

- **Icy Veins** — 6 pages, direct browser-UA GET, HTTP 200, 192–340 KB. Parsed from
  `<table class="tier-list">`; each `tier-list-entry`'s FIRST `alt=` looked up WHOLE against the
  roster (never split at a space, which is what keeps the six two-word-class specs matchable).
  raid 27/7/6 + M+ 27/7/6 = 80, 0 unmatched, 0 moves. Own dates re-read per page and unchanged:
  raid DPS 2026-08-16, raid healer 08-13, raid tank 08-08, M+ DPS/healer/tank all 08-16 —
  6/6 agreement with `published-evidence/evidence.json`. Era read from title AND body: the raid
  HEALER page still titles itself "Patch 12.0.7 / Midnight" over a body of 21 Season-2 mentions
  against 6 Season-1, and the raid DPS page reads "Midnight (12.1)" over 54 against 14. Body over
  title (blue-tracker precedent) — `seasonVerified` stays **s2** on all six.
- **Method** — 2 pages, HTTP 200, 159/166 KB, parsed from `.tier__tier` blocks. 40 raid + 40 M+,
  0 moves. The M+ page carries 8 tier blocks (4 spec + 4 dungeon-difficulty); the extras were
  rejected by ROSTER MATCH, never by position — King's Rest, Ruby Life Pools, Voidscar Arena,
  The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs and the
  Method logo all failed to map, exactly as intended. Era is explicit in the ranking body
  ("the Midnight Season 2 Raid, The Venomous Abyss"; "Mythic+ … for Midnight Season 2", by
  Tactyks) and the dungeon pool is the S2 pool — **s2**, unchanged.
- **Wowhead** — 6 pages with the FULL browser header set (UA-only is Cloudflare-403; r.jina.ai
  stays untried, IP-403 on `/guide/*` since 2026-08-03), HTTP 200, 73–337 KB. Unescaped `\/`→`/`
  across the whole document FIRST, then searched for `[tier-list=rows] … [/tier-list]`, taking the
  block with the most `[spec-badge=]` hits rather than anchoring on `WH.markup.printHtml(` (the
  raid-healer decoy). One block per page, badge counts 27/7/6/27/7/6 = 80, 0 unmatched, 0 moves.
  Tier labels came back S/A/B/C/D/F everywhere except M+ DPS (S/A+/A/B/C/D — the documented A+)
  and M+ tank (S/A/B/C/D). All six titles self-identify Season 2. Own dates unchanged: raid
  08-14/08-18/08-14, M+ 08-18/08-18/08-18. **s2**, unchanged.
- **Archon** — 6 aggregate pages, HTTP 200, 52–92 KB, parsed from `<script id="__NEXT_DATA__">`.
  Note the path: the tier lists are at `page.specTierListSection.tierLists`, **not** `page.tierLists`
  — an earlier probe this run read the latter, got `[]` on all six, and would have reported the
  healthy M+ half as broken. Entries resolved from the `icon` "Class-Spec" token, never the
  display name, and `tiers[].entries` is a list OF LISTS.
  - M+ (score tierList): 27/7/6 = 40, 0 unmatched, **0 moves** — consistent with `lastUpdated`
    still reading 2026-08-20T12:00:00Z, i.e. upstream has not recut since this morning's run.
  - Raid: all three tierLists (popularity / throughput / survivability) returned **0 entries**.

**FINDING — Archon's RAID pages have rebuilt to Season 2, and `seasonVerified` was deliberately
left at `s1`.** The chrome is unambiguously S2 now: `encounterOptions` is the Venomous Abyss
(Nek'zali, Sentinels, Vashnik, Explorers, Sszorak, The Twin Fangs, The Coiled Altar, Ula'tek,
Nymrissa) and the description reads "tier list for The Venomous Abyss … in 12.1". But the tier
lists are EMPTY, so there are no S2 Archon raid letters to store — the 40 letters sitting in
`ratings.raid.archon` are its **Season-1** letters. Writing `seasonVerified: "s2"` would flip
`sourceSeasonOk` true and feed those S1 letters straight into the S2 raid mean, which is precisely
the two-seasons-in-one-number lie DECISION 1 exists to prevent; it would also manufacture a
movement event tonight and a second, real one the day genuine S2 letters land. The letters, not
the page furniture, are what the flag gates, and the letters are S1. Step 2's own escape hatch
applies: with an empty DPS list there is no Devourer entry to era-verify against, so the ranking
body is UNVERIFIABLE — "skip that source, never guess". **The correct flip is a single run that
replaces the letters and moves the flag together**, and that run is the one the skill already
predicts will trip the anomaly gate and need a human `anomaly_ack`. No `seasonVerified` value
changed anywhere tonight, so `freeze-season.mjs` has nothing to do (step 5b is a no-op).

**FINDING for the owner — the two ancillary Archon encounter URLs are dead.** Both registry URLs
still point at Season-1 content (`…/raid/mythic/imperator`, `…/mythic-plus/10/windrunner-spire/…`)
and both now 302 to Archon's game landing page: `__NEXT_DATA__.page` comes back as `/[gameSlug]`
with no `specTierListSection` at all, which is why both fetches returned an identical 199,262 B
body. URLs are owner-only under Gate 0, so this run could not re-point them. The S2 replacements
are enumerable from the aggregate pages' `encounterOptions` (the 9 bosses above; dungeons
Altar of Fangs, Den of Nalorakk, Kings' Rest, Murder Row, Ruby Life Pools, Sethraliss,
The Blinding Vale, Voidscar Arena). Two things gate an actual `encounter-tiers.json` rebuild
beyond the URL edit: the raid side has n=1–2 per spec so per-boss raid tiers would be noise, and
an M+-only rewrite is 8 × 40 = 320 tier rows, under the 440 floor in `required-sources.json`.
The file is untouched and still stamped `s1`, so the Fight selector stays hidden.

Snapshots: no `snapshot` date changed — all 23 tier-list pages were already stamped 2026-08-21 by
this morning's run, and a same-day second run cannot advance a date. Nothing was papered over;
the manifest rows say so explicitly. Transport used, for the record: plain `curl` with the full
browser header set on every source, no proxy anywhere.


## 2026-08-21 (nightly CI)

**Sources refreshed: all four. 240 letter assignments parsed, 0 unmatched, 15 tier moves —
all Archon M+ again, and again they are real.** Per-page row counts were printed and
reconciled against the 27 DPS + 7 healer + 6 tank = 40 roster shape BEFORE every merge.

- **Icy Veins** — 6 live pages by direct browser-UA GET, HTTP 200, 192–340 KB, parsed from
  `<table class="tier-list">` rows (first `<td>` = the letter; each `tier-list-entry`'s FIRST
  `alt=` looked up WHOLE against the roster, never split at a space). 27/7/6 raid + 27/7/6 M+
  = **80 rows, 0 unmatched, ZERO tier moves.** Page dates byte-identical to last night (raid
  DPS 08-16, raid healer 08-13, raid tank 08-08, M+ all three 08-16), agreeing **6/6** with
  `published-evidence/evidence.json`. Era off title AND body: **two** pages now carry a
  stale-era title over a Season-2 body — raid HEALER ("Patch 12.0.7 / Midnight", 21 S2
  mentions vs 6 S1) and raid DPS ("Midnight (12.1)", 54 vs 14). Body over title. All six stay
  `seasonVerified: s2`.
- **Method** — both pages live, HTTP 200, 158/165 KB, `.tier__tier` blocks. **40 + 40 rows,
  ZERO tier moves.** The M+ page again serves **8** tier blocks; the extra four are the
  dungeon-difficulty list, rejected by ROSTER MATCH (the eight S2 dungeon names + the Method
  logo alt all fail to map) and never by position. Last Updated 10th August (raid) / 13th
  August (M+), both unchanged. The `<meta description>` still reads "The War Within Season 3"
  on both — stale chrome; an era check reading the meta tag would drop both from the consensus.
- **Wowhead** — 6 pages with the FULL browser header set, HTTP 200, 73–337 KB. Unescape
  `\/` → `/` across the whole document FIRST, then find `[tier-list=rows] … [/tier-list]`;
  exactly one block per page (never anchor on `WH.markup.printHtml(` — the raid-healer decoy).
  **80 rows, 0 unmatched, ZERO tier moves.** `published` re-read: 08-14 / 08-18 / 08-14 /
  08-18 / 08-18 / 08-18, all unchanged, 6/6 against the evidence artifact. The raid-healer
  title still carries the DOUBLE space ("Midnight  Season 2") — the standing reason the era
  check is not an exact-spacing literal.
- **Archon** — 6 aggregate pages from `__NEXT_DATA__` → `specTierListSection.tierLists`,
  metric `score` for M+, entries resolved from the `icon` "Class-Spec" token, `tiers[].entries`
  read as a list OF LISTS. **M+ 40/40, 0 unmatched, 15 TIER MOVES**: two cross two bands
  (Mistweaver S→B, Vengeance C→A); the rest are Subtlety S→A; Balance / Enhancement /
  Windwalker / Marksmanship / Shadow / Devastation / Fire all A→B; Frost DK / Beast Mastery /
  Destruction B→C; Protection Paladin and Brewmaster B→A. Genuine week-two re-cut, not a
  parse artifact: the M+ parse pool tripled again overnight (DPS 332,239 → **950,129**;
  healer 110,677 → 316,669; tank 110,727 → 316,628). **Consensus impact was SIMULATED before
  merging** — 10 cells, all M+, all one band, 0 two-band, 0 vanished — so no ack needed and
  none proposed; the gate later confirmed 10 / 0 against the committed baseline.
  **RAID: tier lists still empty** (popularity, throughput and survivability all 0 entries,
  totalParses 0) on pages that self-describe Season 2. Left at `seasonVerified: s1` for the
  third night running, deliberately: the stored Archon raid letters ARE the S1 cut, and
  flipping the flag would average S1 opinion into the S2 raid consensus. Nulling them instead
  breaches the row floor (80→40 vs min 60) and `maxRowDropPct`, neither of which has an
  agent-side ack.
- **New upstream fact worth watching:** Archon's raid `specRankingsSection.table.data` is no
  longer empty (13 DPS / 4 healer / 2 tank rows) even though the tier lists are — so the raid
  ingest has started and the letters will follow. When they do, re-verify those three pages to
  s2 in the SAME run that merges them, and expect that night to need the human `anomaly_ack`.
- No `seasonVerified` value changed this run, so `freeze-season.mjs` has nothing to do.
  Snapshots 2026-08-20 → 2026-08-21 on all four sources' aggregate pages; Archon's three
  `ancillary` pages held at 2026-08-18 because nothing landed from them.


## 2026-08-20 (nightly CI)

**Sources refreshed: all four. 240 letter assignments parsed, 0 unmatched, 20 tier moves —
all Archon M+, and they are real.** Per-page row counts were printed and reconciled against
the 27 DPS + 7 healer + 6 tank = 40 roster shape BEFORE every merge.

- **Icy Veins** — 6 live pages by direct browser-UA GET, HTTP 200, 192–340 KB, parsed from
  `<table class="tier-list">` rows (first `<td>` = the letter; each `tier-list-entry`'s FIRST
  `alt=` looked up WHOLE against the roster, never split positionally, which is what keeps the
  six two-word-class specs matchable). 27/7/6 raid + 27/7/6 M+ = **80 rows, 0 unmatched, ZERO
  tier moves.** Consistent with the page dates, which are byte-identical to last night (raid
  DPS 08-16, raid healer 08-13, raid tank 08-08, M+ all three 08-16) and agree **6/6** with
  `published-evidence/evidence.json`. Era from each page's own title AND body: five titles
  self-identify Patch 12.1 / Season 2, and the raid-HEALER page again carries a
  "Patch 12.0.7 / Midnight" title over a Season-2 body (21 S2 mentions to 6 S1) — body over
  title, the blue-tracker precedent. `seasonVerified` stays s2 on all six.
- **Method** — both pages live, HTTP 200, 158/161 KB, parsed from `.tier__tier` blocks
  (`tier__title` = letter, img `alt` = "Spec Class"): 40 raid + 40 M+, **0 unmatched, ZERO
  moves**. The M+ page again carries **8** tier blocks, not 4; the extra set is the
  dungeon-difficulty list and was rejected by ROSTER MATCH (9 non-roster labels — the eight S2
  dungeons plus the Method logo — simply failed to map), never by position. Era from the BODY:
  raid "…the Midnight Season 2 Raid, The Venomous Abyss" (Last Updated 10th August 2026), M+
  "…in Midnight Season 2" under Tactyks' byline (Last Updated 13th August 2026). **The stale
  `<meta description>` still reads "The War Within Season 3" on both** — site chrome that
  contradicts the rendered body; an era check reading the meta tag would wrongly drop both
  pages from the consensus. `seasonVerified` stays s2.
- **Wowhead** — 6 pages with the FULL browser header set (a UA-only request is Cloudflare-403;
  r.jina.ai stays untried, IP-403 on `/guide/*` since 2026-08-03), HTTP 200, 73–337 KB. Parsed
  by unescaping `\/` → `/` across the whole document FIRST, then finding
  `[tier-list=rows] … [/tier-list]` — never anchoring on `WH.markup.printHtml(` — with tolerant
  whitespace on `[tier-label …]X [/tier-label]` and the `[spec-badge=<spec>-<class>]` kebab slug
  as the identifier: **exactly one tier-list block per page**, 80 rows, 0 unmatched, **ZERO
  moves**. All six titles read "for Midnight Season 2"; `seasonVerified` stays s2. `published`
  re-read per page and NOT carried forward — raid DPS 08-14, raid healer 08-18, raid tank 08-14,
  M+ DPS/healer/tank all 08-18 — unchanged from stored and agreeing **6/6** with the evidence
  artifact. Nothing rebuilt upstream since Season-2 launch day.
- **Archon** — 6 aggregate pages, HTTP 200, 48–92 KB, parsed from `<script id="__NEXT_DATA__">`
  at `props.pageProps.page.specTierListSection.tierLists`, taking metric **"score"** for M+
  (never the default popularity grouping) and resolving every entry from its icon "Class-Spec"
  token with `tiers[].entries` read as a list OF LISTS. **M+ merged 40/40 with 20 tier moves.**
  It is a genuine week-two re-cut, not a parse artifact: the M+ parse pool has nearly
  quadrupled overnight (88,280 + 29,405 + 29,435 last night → 332,239 + 110,677 + 110,727),
  0 rows unmatched, letters S/A/B/C as before. Largest moves: Assassination Rogue B→S, Fire Mage
  C→A, Discipline Priest A→C, Feral Druid and Outlaw Rogue A→S, Guardian Druid and Shadow Priest
  S→A. **RAID: still publishing NOTHING** — all three raid pages describe Season 2 (title
  "Midnight DPS/Healer/Tank Rankings and Raid Tier List", the 9 S2 bosses in the selector) but
  return `totalParses` 0 with all three tierLists (popularity/throughput/survivability) empty,
  two days into Mythic Venomous Abyss. Their `seasonVerified` was again left at **s1
  DELIBERATELY**, the same judgement as 08-19 and for the same reason: the field gates whether
  the STORED letters feed the live-season consensus, those stored letters are still the S1 cut,
  and flipping to s2 would average S1 opinion into the S2 raid consensus. Nulling them instead
  breaches the archon-tiers row floor (80 → 40 against min 60) and the 25% row-drop guard,
  neither of which has an agent-side ack path.
  **OWNER FLAG (repeat of 08-19): when Archon's raid tier list populates, re-verify those three
  pages to s2 in the SAME run that merges the new letters.**

**Consensus effect: 8 cells moved, all M+, all one band, 0 two-band** (Augmentation B→C,
Marksmanship A→B, Arcane S→A+, Holy Paladin A+→S, Protection Paladin A+→A, Retribution A→B,
Assassination A→A+, Demonology A→B). Checked against the anomaly limits BEFORE finishing:
8 of max 25 total, 0 of max 6 two-band, 0 vanished — no ack needed and none proposed. Archon
is in the M+ consensus (4 sources) and out of the raid consensus (3 sources), which is the
2026-08-19 `ancillary: true` change working as designed: the retired S1 per-dungeon page no
longer keeps Archon's fully S2-verified M+ lists dark.

**No `seasonVerified` value changed this run**, so `freeze-season.mjs` has nothing to freeze and
was correctly not run agent-side. Snapshots: the 6 Archon aggregate pages + all Icy Veins /
Method / Wowhead pages 2026-08-19 → 2026-08-20; the 3 labelled (ancillary) Archon pages left at
2026-08-18 because nothing landed from them, so their 10-day gates keep aging visibly.


## 2026-08-19 (nightly)

**ARCHON REBUILT FOR SEASON 2 — the event this lane has been waiting for, and it landed
half-finished.** Four sources refreshed; per-page row counts printed and reconciled against
the 27 DPS + 7 healer + 6 tank = 40 roster shape before any merge, as the standing rule
requires.

- **Icy Veins** — 6 pages, direct browser-UA GET, HTTP 200, 181–329 KB. 80/80 rows, 0
  unmatched, **0 tier moves**. Page self-dates identical to last night (raid DPS 08-16,
  healer 08-13, tank 08-08; all three M+ 08-16) and agreeing 6/6 with published-evidence,
  so nothing rebuilt since the 08-18 S2 re-cut. The raid-HEALER page STILL titles itself
  "Patch 12.0.7 / Midnight" over a Season-2 body (21 S2 mentions vs 6 S1) — body over title,
  third run in a row. seasonVerified s2, unchanged.
- **Method** — 2 pages, 80/80, 0 unmatched, **0 tier moves**. M+ page carries 8 tier blocks;
  the extra 4 are the dungeon-difficulty list, rejected by ROSTER MATCH (9 labels failed to
  map), never by position. NEW TRAP WORTH KNOWING: both pages' `<meta description>` still
  reads **"The War Within Season 3"** while the rendered body says "Midnight Season 2 Raid,
  The Venomous Abyss" / "in Midnight Season 2". An era check that reads the meta tag would
  drop both pages out of the consensus on stale site chrome. Read the BODY.
- **Wowhead** — 6 pages, full browser header set, 80/80, 0 unmatched, **0 tier moves**.
  Four pages re-dated themselves to 2026-08-18 (raid healer, M+ DPS/healer/tank) while
  publishing identical letters — a launch-day rebuild that changed no ranking. `published`
  re-read per page, agreeing 6/6 with published-evidence.
- **Archon** — the big one. **M+ pages have flipped to Season 2**: the encounter selector
  now lists the eight S2 dungeons (Altar of Fangs, Den of Nalorakk, Kings' Rest, Murder Row,
  Ruby Life Pools, Temple of Sethraliss, The Blinding Vale, Voidscar Arena), scores read
  2663–2726 against last week's S1 3396–4256, and 88,280 / 29,405 / 29,435 parses sit behind
  them. seasonVerified **s1 → s2** on all three, 40/40 letters merged, **25 tier moves**
  (Arcane Mage C→S, Devastation Evoker C→S, Blood DK C→S, Fury Warrior A→C the largest).
  **RAID pages have also rebuilt to S2 and publish NOTHING** — "DPS Tier List for Mythic The
  Venomous Abyss", the 9 S2 bosses in the selector, `totalParses: 0`, and all three tierLists
  (popularity / throughput / survivability) empty, because Mythic opened hours ago.

**The judgement call, recorded because the next run will face it again:** archon's three RAID
pages were deliberately left at `seasonVerified: "s1"`. The field gates whether the STORED
letters feed the live-season consensus, and the stored archon raid letters are still the S1
cut — flipping to s2 would average S1 opinion into the S2 raid consensus. The apparently
cleaner alternative, nulling those 40 letters as "upstream publishes no rating", is blocked:
archon's ratings count would fall 80 → 40 against the archon-tiers floor of 60 AND a 50% drop
against maxRowDropPct 0.25, and neither guard has an agent-side ack path. **When Archon's raid
list populates, flip those three pages to s2 in the same run that merges the new letters.**

**Net effect on the published grid: ZERO consensus moves, and that is correct.**
`sourceSeasonOk` reads EVERY page of a bracket, and archon's M+ bracket still contains the
per-dungeon encounter page at s1 — so Archon stays dark in both brackets' consensus. That is
the documented mid-rebuild refusal ("never mix two seasons in one term") doing exactly its
job, and it is why the anomaly gate saw 0 moves on the night an outlet re-cut 25 letters.

**Encounter lane is stuck and needs the owner.** Both registered per-encounter URLs
(`.../raid/mythic/imperator`, `.../mythic-plus/10/windrunner-spire/this-week`) now return
HTTP 200 with **no `page` object in `__NEXT_DATA__` at all** — Archon retired the S1
encounters. Probing the replacements: an S2 dungeon page (altar-of-fangs) returns a healthy
27-row DPS score tier list, an S2 raid boss page (nekzali-the-soulcoiler) returns
`totalParses: 0` and empty tier lists. So a full S2 rewrite tops out at 8 × 40 = **320 tier
rows**, below the archon-encounters floor of 440 and a 48% drop against the committed 619 —
two hard publish-gate errors with no ack channel. `data/encounter-tiers.json` was therefore
left byte-identical (season stamp still `s1`, so the UI keeps the Fight selector hidden).
Unsticking it needs a reviewed floor change in `required-sources.json`, or patience until
Venomous Abyss accumulates enough parses for per-boss tiers.


## 2026-08-18 (nightly)

**Icy Veins rebuilt for Season 2 — 18 tier moves, the biggest single-source move in weeks.**
All five tier lists re-fetched live: icyveins 6 pages, icyveins-ptr 3, method 2, wowhead 6,
archon 6 aggregate + 51 encounter = **74/74 HTTP 200**. Per-page counts printed and reconciled
against 27 DPS + 7 healer + 6 tank = 40 per source-bracket every time.

- **icyveins 80/80, 18 moves** (11 raid, 7 M+; `dateModified` 2026-08-16 on four of the six
  pages). Raid: Subtlety Rogue B→S, Assassination C→A+, Fury Warrior B→A+, Balance Druid S→A,
  Shadow Priest A+→B, Unholy DK C→B, Affliction A→B, Devastation A→B, Havoc C→B, Feral C→B,
  Augmentation C→B. M+: Subtlety (was upstream TBD) →A+, Enhancement A→A+, Devourer A+→A,
  Destruction A+→A, Frost DK A+→A, Augmentation B→A, Affliction A→B. Cross-checked the whole
  raid-DPS table tier by tier before merging (S 3 / A+ 6 / A 5 / B 11 / C 2 = 27) — a real
  re-cut, not a parser artifact.
- **Consensus impact: zero.** Icy Veins verifies s2 while `liveSeason` is s1, so its letters
  are out of `consensusFor` (the frozen lane holds its final S1 letters) and feed only the 12.1
  forecast: 0 consensus moves, **3 projection moves** (Balance raid A→B, Feral raid C→B,
  Augmentation raid C→B).
- **Era, read from body not title:** the raid-HEALER page *again* keeps a "Patch 12.0.7 /
  Midnight" title over a Season-2 body (changelog "13 Aug. 2026: Further updated for Midnight
  Season 2 launch after the first few live tests"). Body over title, per the blue-tracker
  precedent. No `seasonVerified` value changed anywhere tonight → nothing for freeze-season.
- **icyveins-ptr 39 + 1 explicit null**, 0 moves — unchanged since its 08-09 rebuild, which
  matches the weekly Sunday cadence. Subtlety Rogue is still upstream **TBD** and is stored as
  `null`, never omitted.
- **method 80/80, 0 moves.** The M+ page served **8** `tier__tier` blocks; the extra S/A/B/C
  set is the dungeon-difficulty list, rejected by ROSTER MATCH rather than by position.
- **wowhead 80/80, 0 moves.** Unescape `\/`→`/` first, then find `[tier-list=rows]`; never
  anchor on `WH.markup.printHtml(`.
- **archon 80/80, 0 moves**, still zone-46/47 (Imperator … Midnight Falls) → `seasonVerified`
  stays **s1**, and Archon remains the only source feeding the live consensus in its own right.
- **archon encounters 619 rows (was 678), 0 tier moves among the 619.** Archon now withholds
  the throughput tierList where Season-1 parses have dried up: Crown lost all three roles
  (172/45/24 parses, "Not a lot of data matches your filters"), Chimaerus kept DPS only,
  Vanguard lost tanks. Proven upstream rather than a parse failure by the *survivability*
  tierList still returning 27/7/6 on those same pages. 8.7% drop, inside `maxRowDropPct` 0.25
  and far above the 440 floor. `asOf` 08-16 → 08-17 (Archon's own `lastUpdated`).
- **archon survivability re-cut the TANK list**: Blood DK, Brewmaster and Vengeance B→A,
  Protection Paladin C→A, leaving Protection Warrior alone in S (95.8% against an 88.2–90.7%
  A band). Worth noting the oddity: the specRankings NUMBERS on those pages are byte-identical
  to stored, so this is a threshold re-cut, not new parses.
- `published` re-read per page, never carried forward, agreeing 15/15 with
  `published-evidence/evidence.json`: icyveins raid DPS 08-16 (stored said 08-08), raid healer
  08-13, raid tank 08-08, M+ ×3 08-16 (stored said 08-08); wowhead raid healer and M+
  healer/tank moved to 08-17. Snapshots 2026-08-17 → 2026-08-18. Transport: direct browser-UA
  GET everywhere (full header set on wowhead; r.jina.ai untried by rule).


## 2026-08-17 (nightly)

All five tier lists re-fetched live — icyveins 6 pages, icyveins-ptr 3, method 2, wowhead 6,
archon 6 aggregate + 51 encounter — **74/74 HTTP 200. Six tier moves, and each sits on a page
whose own self-date moved.**

Per-page row counts, printed and reconciled against 27 DPS + 7 healer + 6 tank = 40:
icyveins 27/7/6 raid + 27/7/6 M+, icyveins-ptr 27/7/6, method 40 + 40, wowhead 27/7/6 + 27/7/6,
archon 27/7/6 + 27/7/6. Icy Veins' two M+ DPS pages parse 27 rows but store 26 RATED — Subtlety
Rogue's cell is the literal upstream `TBD`, written as an explicit null. Transports: Icy Veins
plain browser-UA GET; Wowhead FULL header set, then unescape `\/` across the whole document
BEFORE searching `[tier-list=rows]` (one block per page, the raid-healer decoy not in play);
Method `.tier__tier` with non-roster alts rejected by ROSTER MATCH (8 S2 dungeon names + logo);
Archon `__NEXT_DATA__` resolved from each entry's `icon` "Class-Spec" token.

**Wowhead M+ healer rebuilt — two moves.** JSON-LD `dateModified` 2026-08-09 →
**2026-08-16T17:07:04-05:00** (matching the published-evidence artifact), and the block reads
S Preservation / A Holy Paladin / B Restoration Shaman + Mistweaver / C **Restoration Druid**,
**Discipline Priest**, Holy Priest. Both moved B → C. Stored `published` advanced to 08-16.

**Archon re-cut raid again — four moves**, `lastUpdated` 2026-08-15T12:00:00Z →
**2026-08-16T12:00:00Z** on all six pages. Shadow Priest S→A, Frost Mage S→A, Protection Warrior
A→S, Blood DK A→S. Corroboration is arithmetic from the same payload: Shadow 187.4k and Frost
Mage 186.7k now sit under Elemental's 189.6k (the S cut), while Prot Warrior 104.7k and Blood DK
100.3k joined Guardian's 108.7k in tank S.

Encounter tiers: full 51-page re-fetch, 619 rows parsed, **33 moves + 1 newly-populated cell**
(Vengeance DH on Vaelgor & Ezzorak, C — that boss goes 38 → 39 rows), **all raid**; M+
per-dungeon byte-identical, S1 keys being dead content. The same six role cuts are empty upstream
(Crown ×3, Chimaerus healer+tank, Vanguard tank) and their 59 stored rows were LEFT UNTOUCHED, so
the file holds 678 rows at Archon's own 2026-08-16. Committed encounter `name` values preserved.

Era re-verified per page and **nothing changed, so freeze-season had nothing to freeze**:
icyveins s2 (raid-healer still titles itself "Patch 12.0.7 / Midnight" over a changelog reading
"13 Aug. 2026: Further updated for Midnight Season 2 launch" — body over title), icyveins-ptr s2
(and its newest changelog row now says "Final Update of the progressive S2 PTR Midnight
tierlist", so its quiet week is a finished series, not a lag), method s2, wowhead s2, archon
**s1** (still the nine S1 bosses and eight S1 dungeons). Archon is still the only source in the
live consensus in its own right, which is why its four moves are the night's **3 consensus
letters — Blood DK raid B→A, Frost Mage raid S→A+, Protection Warrior raid A+→S** — and
**1 projection letter** (Prot Warrior raid A→A+), measured against `git show HEAD:dist/index.html`.

`published` re-read per page, 9/9 agreement with the deterministic artifact: icyveins 08-08 ×4 +
08-13 (raid healer), icyveins-ptr 08-09 ×3, wowhead 08-14/08-16/08-14/08-15/**08-16**/08-11.


## 2026-08-16 (nightly)

All five tier lists re-fetched live — icyveins 6 pages, icyveins-ptr 3, method 2, wowhead 6,
archon 6 aggregate + 51 encounter pages — 74/74 HTTP 200. **Six tier moves, all raid, and both
sources that moved show their own corroboration.**

Per-page row counts, printed and reconciled against 27 DPS + 7 healer + 6 tank = 40:
icyveins 27/7/6 raid + **26**/7/6 M+, icyveins-ptr **26**/7/6, method 40 + 40, wowhead 27/7/6
+ 27/7/6, archon 27/7/6 + 27/7/6. Both 26s are the literal upstream **TBD row** — Subtlety
Rogue's tier cell reads `TBD` on the Icy Veins live and PTR M+ DPS pages, stored as an explicit
null. Transports: Icy Veins plain browser-UA GET; Wowhead FULL header set, then unescape `\/`
across the whole document BEFORE searching `[tier-list=rows]`; Method `.tier__tier` with
non-roster alts rejected by ROSTER MATCH (8 S2 dungeon names + logo); Archon `__NEXT_DATA__`
resolved from each entry's `icon` "Class-Spec" token.

**Wowhead raid healer: Holy Priest A → B.** The page rebuilt — JSON-LD `dateModified` moved
2026-08-08 → **2026-08-16T00:20:29-05:00**, matching the published-evidence artifact — and its
single `[tier-list=rows]` block reads S Disc/Presevoker, A Holy Pal/Resto Sham, B Resto
Druid/**Holy Priest**/Mistweaver. Two `printHtml` calls on that page, one tier-list block, so
the known decoy was not in play.

**Archon re-cut with a PINNED LABEL — five tier moves.** `lastUpdated` is still
2026-08-15T12:00:00Z on all six pages (unchanged from last night, when the numbers had NOT
moved), yet every raid number moved tonight: 33/33 DPS+tank rows and 7/7 healer rows changed in
value and/or parse count. Moves: healer Holy Priest B→A, Mistweaver B→C; tank Prot Paladin C→B,
Brewmaster C→B, Vengeance DH B→C. Corroboration is arithmetic — Holy Priest 95th-pct HPS
230,745 → 239,634 passes Resto Shaman's 235,907, which is exactly the A it now reads. **Do not
read Archon's label as its data date in either direction**: last night it ticked ahead of the
data (correctly held back), tonight it lags behind it.

Encounter tiers: full 51-page re-fetch, 618 rows parsed, **51 rows changed, all raid** (M+
per-dungeon byte-identical — S1 keys are dead content). Six role cuts empty upstream (Crown ×3,
Chimaerus healer+tank, Vanguard tank) and three short; their 59 stored rows LEFT UNTOUCHED, so
the file still holds 677 rows at Archon's own 2026-08-15.

Era re-verified per page and **nothing changed, so freeze-season had nothing to freeze**:
icyveins s2 (raid-healer changelog "13 Aug. 2026: Further updated for Midnight Season 2 launch"
under a "Patch 12.0.7" title — body over title), icyveins-ptr s2, method s2 (raid body names The
Venomous Abyss; M+ names Season 2), wowhead s2, archon **s1** (still the nine S1 bosses and
eight S1 dungeons). Archon remains the only source in the live consensus in its own right —
which is why its five moves become the night's **2 consensus letters: Brewmaster Monk raid B→A
and Mistweaver Monk raid A+→A**, both one band.

`published` re-read per page, 9/9 agreement with the deterministic artifact: icyveins 08-08 ×4,
08-13 (raid healer), icyveins-ptr 08-09 ×3, wowhead 08-14/**08-16**/08-14/08-15/08-09/08-11.

