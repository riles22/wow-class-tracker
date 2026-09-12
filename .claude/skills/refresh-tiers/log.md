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

- 2026-09-12 (nightly) — **icyveins + method + wowhead all fetched fresh, 240 cells re-verified, 0 moves. Archon walled day 19.**
  Counts printed and reconciled before every merge: icyveins 6 pages → 27/7/6 raid + 27/7/6 M+ = **80 rows, 0 unmatched,
  0 null tiers**; method 2 pages → 40 + 40 = **80**, the four extra M+ `tier__tier` blocks rejected by ROSTER MATCH
  (Voidscar Arena, Den of Nalorakk) and not by position; wowhead 6 pages → **80**, exactly one `[tier-list=rows]` block
  per page so no decoy `printHtml` was hit. **Pre-merge diff: 0 of 80 moved for each of the three sources.**
  Transport: direct browser-UA / full-header GET on every page, r.jina.ai never attempted. Sizes taken off the written
  files (icyveins 195,936–343,441 B; method 157,206 + 163,857 B; wowhead 75,139–345,252 B).
  **Parser note worth keeping: Icy Veins' tier letter is NOT in a labelled div.** A selector keyed on a
  `tier-list-tier-label` class returned the right 80 specs with **all 80 tiers null** — the letters live in a
  `<table class="tier-list">` whose each `<tr>` is `<td>S</td><td>…entries…</td>`. Bounded the parse to that table and
  took the row's first `<td>`; the FIRST-`alt`-per-`tier-list-entry` rule still does the spec lookup, whole-string.
  This is exactly the failure the print-counts discipline exists to catch — the row count was perfect and the data wasn't.
  Page self-dates re-read live and **all twelve match the pre-agent published-evidence artifact exactly** (icyveins raid
  DPS 08-30 / healer 09-01 / tank 08-29, M+ all 08-30; wowhead raid all 08-31, M+ DPS 08-28 / healer 09-10 / tank 09-01).
  Method's own dates unchanged: raid 10th August, M+ 13th August 2026 (33 and 30 days old at source) — still recorded
  here rather than in a `published` field, since method has no registry `published` entries and the evidence step
  therefore never probed those pages. Era-verified from bodies, not substring counts: all fourteen pages self-identify as
  Midnight Season 2 and Devourer DH is present in every DPS list; the icyveins raid-healer title still says
  "(Patch 12.0.7 / Midnight)" and is overridden by its own "…for Season 2" H2 (body-over-title). **seasonVerified stays
  s2 everywhere — no value changed, so nothing for freeze-season.** Archon: all **eleven** registered routes attempted,
  all HTTP 403 Cloudflare with **zero `__NEXT_DATA__`** (assert on that, not the status code), matching the pre-agent
  source-health artifact; letters retained at their original 2026-08-25 snapshot per the 2026-09-05 retention decision.

## 2026-09-11 (nightly) — three sources re-verified S2, 240/240 rows, **0 letters moved**; Archon walled day 18

- **Icy Veins** 6/6 pages, direct browser-UA GET, HTTP 200, 195,860–343,365 B off the written files.
  Row counts printed before the merge and reconciled against the roster shape: raid 27/7/6 = 40, M+ 27/7/6 = 40.
  0 unmatched, 0 of 80 stored cells moved. JSON-LD `dateModified` re-read live — raid DPS 08-30, raid healer 09-01,
  raid tank 08-29, all three M+ 08-30 — matching this run's pre-agent published-evidence artifact exactly.
  The raid-healer `<title>` still says "(Patch 12.0.7 / Midnight)"; body-over-title precedent applies, its own H2 is
  "Midnight Healer Tier List for Season 2". seasonVerified stays s2 on all six.
- **Method** 2/2 pages, HTTP 200 (raid 157,217 B, M+ 163,868 B), 80 rows, 0 unmatched, 0 moved. The M+ page carries
  **8** `tier__tier` blocks: the first four are the spec list (S 2 / A 13 / B 21 / C 4 = 40), the last four are the
  "Mythic+ Dungeon Difficulty Tier List" and were rejected by **roster match** (Voidscar Arena, Den of Nalorakk),
  never by position. Its own dates are unchanged and now quite old: raid "Last Updated 10th August 2026",
  M+ "13th August 2026", and the raid page still carries its written-from-PTR-testing disclaimer.
  ⚠️ **Owner flag:** method has no `published` entries in the registry, so the pre-agent published-evidence step
  never probes these two pages and their staleness is invisible to the published gate. Adding the field would widen
  that gate's coverage without matching evidence, which is a reviewed registry edit, not a refresh edit — recorded
  in the manifest row rather than written.
- **Wowhead** 6/6 pages, full browser header set, HTTP 200, 75,150–345,238 B. Unescaped `\/` → `/` across the whole
  document FIRST, then `[tier-list=rows]`; exactly **1** block per page and every one yielded rows, so no decoy.
  80 rows, 0 unmatched, 0 moved. `dateModified` matches the evidence artifact: raid ×3 08-31, M+ DPS 08-28,
  M+ healer 09-10 (yesterday's rebuild, unchanged since), M+ tank 09-01.
- **Archon — day 18 of the access wall.** Both registered DPS routes fetched directly with the full header set:
  HTTP **403**, Cloudflare "Just a moment..." interstitial (3,449 / 3,498 B), **zero** `__NEXT_DATA__` tags.
  The pre-agent `source-health/evidence.json` independently records raid 403 `cloudflare-challenge` and M+ 200
  `human-verification`. No challenge solved or replayed, no proxy. Per the 2026-09-05 owner decision the source is
  RETAINED: its 80 S2 cells and 2026-08-25 snapshot are byte-unchanged and still feed the consensus.
- No `seasonVerified` value changed, so freeze-season had nothing to freeze. Snapshots bumped to 2026-09-11 on the
  14 icyveins/method/wowhead pages only; Archon's dates were deliberately left alone.

## 2026-09-10 (nightly) — three sources re-verified S2, 240/240 rows, Wowhead M+ healer rebuilt (2 letters moved); Archon walled day 17

- **Icy Veins** — all 6 pages direct browser-UA GET, HTTP 200, 195,860–343,365 B (measured off the written files,
  never `size_download`). Parsed per `<tr>`, letter from the row's first `<td>`, spec from each
  `tier-list-entry`'s FIRST `alt=` looked up WHOLE. Counts printed before merge: raid 27/7/6, M+ 27/7/6 = **80**,
  0 unmatched. **0 of 80 cells moved.** `dateModified` re-read live and unchanged: 08-30 / 09-01 / 08-29 /
  08-30 / 08-30 / 08-30, matching the pre-agent published-evidence artifact exactly. The raid-healer title still
  says "(Patch 12.0.7 / Midnight)" — overridden by body-over-title as before (20 Season-2 mentions vs 5 Season-1;
  changelog "01 Sep. 2026: Updated for the end of RWF Mythic progression").
- **Method** — both pages HTTP 200, 157,217 B (raid) / 163,868 B (M+); parsed from `.tierlist` -> `.tier__tier`
  blocks. **40 + 40 = 80, 0 misses, 0 moves.** The M+ page's second populated container is the dungeon-difficulty
  block and was rejected by ROSTER MATCH, never by position: all 8 dungeon names plus the Method logo alt failed to
  map and were dropped. Tier histogram raid S6/A11/B17/C6, M+ S2/A13/B21/C4 — an S tier is present on both this
  week. Body era-verify: "the Midnight Season 2 Raid, The Venomous Abyss" / "Midnight Season 2"; 0 mentions of
  Season 1 or 12.0.7. Its in-body "Last Updated 13th August 2026" is recorded here rather than written into
  sources.json — method carries no registered `published` field and is not in the published-evidence artifact, so
  inventing one would create a value the publish gate cannot cross-check.
- **Wowhead** — all 6 pages with the FULL browser header set, HTTP 200, 75,149–343,122 B. Unescape `\/` across
  the whole document FIRST, then locate `[tier-list=rows]`; never anchor on `WH.markup.printHtml(`. Exactly one
  block per page this run. **80 rows, 0 unmatched. TWO CELLS MOVED, both upward, both on the M+ healer page:
  Mistweaver Monk B -> A and Preservation Evoker B -> A.** That page's `dateModified` is **2026-09-10T08:59:35-05:00**
  — Wowhead rebuilt it this morning (committed value was 2026-08-26; the pre-agent published-evidence artifact
  independently reports 2026-09-10), so its stored `published` advanced. The rebuilt list reads S = Holy Paladin;
  A = Restoration Shaman, Mistweaver, Preservation; B = Holy Priest; C = Restoration Druid, Discipline — all 7
  healers accounted for, so this is a real editorial move and not a partial parse.
- **Archon — day 17 of the human-verification wall.** All five registered routes attempted fresh with the full
  header set: HTTP **403** with a Cloudflare interstitial ("Just a moment...", 5,956–6,043 B, **no**
  `__NEXT_DATA__`). The pre-agent source-health artifact independently records the raid DPS route as
  403/cloudflare-challenge and the M+ DPS route as HTTP 200 carrying a human-verification page. No challenge solved,
  replayed or proxied; no alternate transport. Nothing parsed, nothing written — its last verified S2 letters stay
  in the consensus under the owner-confirmed 2026-09-05 retention decision.
- `seasonVerified` is **s2 on every page of all four sources and no value changed**, so there was nothing for
  `freeze-season.mjs` to freeze. Snapshots advanced to 2026-09-10 on the 14 icyveins/method/wowhead pages only;
  Archon's stayed at 2026-08-25 / 2026-08-18.
- Anomaly check against the committed baseline: **2 tier moves, 0 of ≥2 bands** — far under the 25 / 6 limits, so
  no `anomalyAckProposal` is warranted.

## 2026-09-09 (nightly) — three sources re-verified S2, 240/240 rows, 0 letters moved; Archon walled day 16

All 14 reachable pages fetched inline in one session (no subagents), 195,983-343,487 B (Icy Veins),
157,217/163,868 B (Method), 75,149-342,577 B (Wowhead), every one HTTP 200 off the written file.
Per-page counts printed BEFORE the merge and reconciled against the roster shape — 27 DPS / 7 healer /
6 tank = 40 per source-bracket, **240 rows, 0 unmatched** — which is still the only thing that would
catch a silent per-page parser failure, since ratings upsert.
**0 of 240 stored cells moved**, so only the 14 snapshot dates advanced.

Transports and parses, all as documented, no drift: Icy Veins per-`<tr>`, letter from the first
`<td>`, spec from each entry's FIRST `img alt` looked up WHOLE; Method from `.tier__tier` with specs
resolved by ROSTER MATCH, which again rejected exactly the eight dungeon-difficulty entries on the M+
page; Wowhead unescaped `\/`->`/` first, then `[tier-list=rows]`, keeping the LARGEST block of each
page against the decoy-printHtml trap (1 block per page this run, 1,124-3,443 B).

Era: all six Icy Veins pages self-identify Season 2 / Patch 12.1 in body and changelog — including the
raid-healer page, whose TITLE still reads "(Patch 12.0.7 / Midnight)" and is overridden by the
body-over-title precedent — Method states Midnight Season 2 in both ledes, and every Wowhead title says
"for Midnight Season 2". Devourer present in all four DPS lists. `seasonVerified` s2 throughout and
UNCHANGED, so freeze-season had nothing to freeze.
Page self-dates re-read live, all unchanged and matching the pre-agent published-evidence artifact
12/12: IV raid 08-30 / 09-01 / 08-29 and M+ all 08-30; WH raid all 08-31, M+ 08-28 / 08-26 / 09-01.
Method's own stated dates (10 and 13 Aug) also unchanged; it carries no registry `published`.

**Archon: day 16 behind the wall.** The pre-agent source-health receipt has the raid route at 403
`cloudflare-challenge` and the M+ route at **200** `human-verification`; my own single ordinary GET of
both returned 403 with "Just a moment" bodies and **`__NEXT_DATA__` count 0** — assert on that, never on
the status code. Nothing solved or replayed, nothing backfilled from WCL, no snapshot bumped. Retention
policy holds: the stored S2 letters still feed the four-source consensus. `encounter-tiers.json` is
still `season: "s1"` / 2026-08-17, so the Fight selector stays hidden.

## 2026-09-08 (local, scheduled) — ran as a stand-in for a nightly that had not fired, then the nightly fired mid-run; DATA SUPERSEDED, one parser trap worth keeping

**No tier data from this run is in the tree.** It started at 14:13Z because GitHub's schedule event
had not delivered by then (the 09-07 nightly itself only ran at 16:01Z), did a full independent
refresh, and committed locally — and at 14:44Z the nightly finally fired. Rather than rebase two
independently regenerated datasets (which does not merge mechanically), the local commit was reset
away in favour of the nightly's. Recorded because the RESULTS agreed exactly, which is a genuine
independent check: 240/240 rows, **0 letters moved**, all 14 pages' JSON-LD `dateModified` unchanged
from stored, `seasonVerified` s2 throughout.

- ⚠️ **PARSER TRAP, and this one is new — do not slice the document at the LAST `</style>` before
  looking for `<table class="tier-list">`.** It is a tempting shortcut because Icy Veins ships the
  tier-list CSS inline, and it works on five of the six pages. On **raid/Healer it does not**: that
  page carries a `</style>` at byte 215,504 while the table sits at 152,329, so the slice discards
  the table and the page parses **0 rows at HTTP 200** while the other five parse perfectly.
  **Nothing mechanical would have caught it** — ratings UPSERT, so the seven stored healer letters
  would simply have stood unchanged, the stored count would never drop, and both the row floor and
  `maxRowDropPct` would have stayed green on a page that fetched nothing. It surfaced ONLY because
  per-page counts are printed and reconciled before any merge, which is exactly the discipline
  SKILL.md demands and exactly the class of failure it was written for.
  **The fix is to strip every `<style>…</style>` block and then find the table.** Worth promoting
  into SKILL.md's parser-traps section at the next prune, alongside the Wowhead `printHtml` decoy —
  it is the same failure wearing different clothes.
- Archon: independently re-probed and walled, with the shape back to **HTTP 403 cloudflare-challenge**
  on both ordinary public routes rather than the HTTP-200 human-verification body of recent days.
  Assert on `__NEXT_DATA__` presence either way, never the status code.

## 2026-09-08 (nightly) — 240/240 letters re-verified live, 0 moved; Archon walled a TWENTIETH night

- **Three sources fetched, parsed and reconciled in full; Archon blocked.** Every page below was
  fetched fresh in this session, and every byte count is measured off the WRITTEN FILE, never
  curl's `size_download` (which reports the compressed length under `--compressed` — it read
  54,945 against a real 206,114 on the first Wowhead page this run, which is exactly the trap).
- **Icy Veins — 6/6 pages, 120 rows, 0 unmatched.** Direct browser-UA GET, HTTP 200,
  195,863–343,032 bytes; r.jina.ai deliberately not attempted. Parsed per `<tr>` block: letter
  from the row's first `<td>`, spec from each `tier-list-entry`'s FIRST `img alt` looked up
  WHOLE against the roster (a positional split at the last space turns "Vengeance Demon Hunter"
  into class "Hunter"). Counts printed BEFORE the merge — raid 27/7/6 = 40, M+ 27/7/6 = 40.
  Note the M+ healer page genuinely lists **A+ AFTER A** in table order; verified against the
  raw `<td>` sequence rather than assumed to be a parse fault, and it is harmless because the
  letter comes from the label, not the position.
- **Wowhead — 6/6 pages, 120 rows, 0 unmatched.** Full browser header set (a UA-only request is
  Cloudflare-403). Unescaped `\/`→`/` across the whole document FIRST, then took every
  `[tier-list=rows] … [/tier-list]` block and kept the one with the most spec badges — **never**
  anchoring on `WH.markup.printHtml(`, which is what produced the raid-healer decoy incident.
  Exactly 1 block per page this run, so no decoy fired. Tier labels matched with tolerant
  whitespace (`[tier-label bg=q3]B [/tier-label]` has a trailing space inside the tag) and specs
  resolved from the `[spec-badge=<spec>-<class>]` kebab slug, which sidesteps the two-word-class
  problem entirely. **Empty tiers preserved as empty** — raid DPS `S` is empty, and D/F are
  empty on five pages; that is upstream's shape, not a shortfall.
- **Method — 2/2 pages, 80 rows, 0 unmatched.** Rejected the extra containers by **ROSTER
  MATCH**, never by position: the raid page served 3 containers and M+ served 5, and in each
  case exactly one matched 40 roster specs. M+'s extra block is the dungeon-difficulty list and
  failed to map cleanly — its 8 entries are Altar of Fangs, Den of Nalorakk, King's Rest, Murder
  Row, Ruby Life Pools, Temple of Sethraliss, The Blinding Vale, Voidscar Arena, which is also
  free corroboration of the S2 dungeon pool.
- **ZERO letters moved.** Pre-merge diff across all 240 fetched rows: 0 of 80 stored consensus
  cells changed on any of the three sources. `apply-ratings.mjs` still ran over the full 240-row
  file and rewrote nothing; only the 14 snapshot dates advanced to 2026-09-08.
- **Era-verify — body over title, twice this run.**
  · Icy Veins raid HEALER still titles itself *"(Patch 12.0.7 / Midnight)"* and its meta
    description repeats it, but the body is Season 2 and its changelog reads **01 Sep. 2026
    "Updated for the end of RWF Mythic progression"** and **11 Aug. 2026 "Updated for Midnight
    Season 2 launch"**. S2.
  · Method's `og:description` on BOTH pages still carries a stale *"The War Within Season 3"*
    boilerplate, while the raid body reads "the Midnight Season 2 Raid, The Venomous Abyss" and
    M+ reads "Method's Mythic+ Spec and Dungeon Tier List for Midnight Season 2". S2.
  · Icy Veins raid TANK's newest changelog line is 08 Aug. 2026 "Season 2 Update" against a
    2026-08-29 dateModified — older cadence, still S2.
  Devourer DH present in all four DPS lists. `seasonVerified` stays `s2` on all 14 pages;
  nothing changed, so **freeze-season had nothing to consider** and was not needed.
- **`published` re-read live on every page that carries one**, not carried forward, and it
  matches this run's pre-agent `published-evidence/evidence.json` exactly: Icy Veins raid DPS
  2026-08-30 / healer 2026-09-01 / tank 2026-08-29, M+ all three 2026-08-30; Wowhead raid all
  three 2026-08-31, M+ DPS 2026-08-28 / healer 2026-08-26 / tank 2026-09-01. Method has no
  `published` block in the contract, so its own "Last Updated" lines (raid 10th August 2026,
  M+ 13th August 2026) are logged here and written nowhere.
- **Archon — walled, night 20.** Two independent observations: the pre-agent
  `source-health/evidence.json` (14:47:01Z) records the raid route at **HTTP 403 /
  cloudflare-challenge / 5,764 bytes** and the M+ route at **HTTP 200 / human-verification /
  2,516 bytes**; my own browser-UA GET of the registered raid DPS page returned HTTP 403, a
  5,849-byte *"Just a moment…"* interstitial, **`__NEXT_DATA__` count 0**. Asserted on
  `__NEXT_DATA__` presence, not on status — the wall returns both codes now. No challenge
  solved, replayed or automated past; nothing backfilled from Warcraft Logs. All 240 stored
  Archon letters and the six unlabeled snapshots (2026-08-25) are byte-identical, and Archon
  stays in the four-source consensus under the owner-confirmed 2026-09-05 retention policy.

## 2026-09-07 (nightly) — 240/240 letters re-verified live, 0 moved; Archon walled a NINETEENTH night

- **All three reachable tier sources fetched fresh from THIS session**, direct browser-UA GET, no
  proxy (r.jina.ai is IP-403 on `wowhead.com/guide/*` and was deliberately not attempted). Byte
  counts read off the written files, never `curl`'s `size_download`.
  · **Icy Veins**, 6 pages, HTTP 200, 195,982–343,487 bytes. `<style>` stripped BEFORE parsing,
    one `<table class="tier-list">` per page, letter from each row's first `<td>`, spec from each
    `tier-list-entry`'s FIRST `alt=` looked up WHOLE against the roster.
    **raid 27/7/6 = 40, M+ 27/7/6 = 40, 80 rows, 0 unmatched.**
  · **Method**, 2 pages, HTTP 200, 158,880 and 165,531 bytes. The M+ page carried **EIGHT**
    `.tier__tier` blocks — the spec list then a dungeon-difficulty list — separated by ROSTER
    MATCH, never by position: blocks 0–3 are 2/13/21/4 = 40 roster specs with zero non-roster
    entries; blocks 4–7 hold 0 roster specs (eight dungeon names + the Method logo).
    **raid 40, M+ 40, 0 unmatched.**
  · **Wowhead**, 6 pages, HTTP 200, 75,149–341,214 bytes with the FULL browser header set. Unescape
    `\/`→`/` FIRST, then `[tier-list=rows] … [/tier-list]`; never anchored on
    `WH.markup.printHtml(`. One block per page this run, no decoys. Specs off the
    `[spec-badge=<spec>-<class>]` slug. **raid 27/7/6 = 40, M+ 27/7/6 = 40, 0 unmatched.**
- **0 letters moved across all 240 cells** (80 per source; moved 0 / same 80 / new 0 /
  stored-not-fetched 0 on each). `apply-ratings.mjs` was therefore never run and `specs.json`
  was not touched by this skill; only the 14 `snapshot` dates advanced to 2026-09-07.
- **Page self-dates re-read live, all unchanged**, and identical to this run's pre-agent
  `published-evidence` artifact: Icy Veins raid DPS 08-30 / healer 09-01 / tank 08-29, M+ all
  08-30; Wowhead raid all 08-31, M+ DPS 08-28 / healer 08-26 / tank 09-01. Method's own
  "Last Updated" lines are 10th August (raid) and 13th August (M+), unchanged; method carries no
  `published` field so nothing was written for it.
- **Era-verified from bodies and changelogs, not substring counts.** All 14 pages self-identify as
  Midnight Season 2 / Patch 12.1; Devourer present in both DPS and both tank lists and correctly
  absent from the two Wowhead healer lists. The Icy Veins raid-healer page STILL titles itself
  "(Patch 12.0.7 / Midnight)" over a Season 2 body with an 01 Sep. 2026 changelog row — body over
  title, the blue-tracker precedent. **No `seasonVerified` value changed**, so `freeze-season.mjs`
  had nothing to consider.
- **Archon: night 19 of the wall.** All ELEVEN registered URLs re-probed from this session:
  HTTP 403, 5,777–5,882 bytes, Cloudflare "Just a moment...", and the check that matters —
  `__NEXT_DATA__` count **0** on every one. The pre-agent `source-health/evidence.json` agrees
  from its own two routes (raid 403 cloudflare-challenge, M+ **200** human-verification), which is
  the reminder that a status-only check would have recorded success. No challenge solved or
  replayed, no `/_next/data/` route tried, no proxy. Letters retained per the 2026-09-05 owner
  policy — the consensus is still four sources including Archon's retained S2 letters — and no
  Archon snapshot date was touched.

## 2026-09-06 (nightly, SECOND run of the day) — 240/240 letters re-verified live, 0 moved; Archon walled an EIGHTEENTH night (Cloudflare, all 11 URLs)

- **All three reachable tier sources fetched fresh from THIS session** — nothing carried forward from
  the 13:50Z nightly. Direct browser-UA GET on every page, no proxy (r.jina.ai is IP-403 on
  `wowhead.com/guide/*` and was deliberately not attempted); byte counts read off the written files,
  never `curl`'s `size_download`, which reports the compressed length.
  · **Icy Veins**, 6 pages, HTTP 200, 195,859–343,364 bytes. `<style>` stripped BEFORE parsing (the
    tier-list CSS ships inline), exactly one `<table class="tier-list">` asserted per page, letter
    from each row's first `<td>`, spec from each `tier-list-entry`'s FIRST `alt=` looked up WHOLE
    against the roster. **raid 27/7/6 = 40, M+ 27/7/6 = 40, 80 rows, 0 unmatched.**
  · **Method**, 2 pages, HTTP 200, 158,880 and 165,531 bytes. `<style>` stripped first — the CSS block
    names `.tier__tier`/`.tier__icon`, so an unstripped search finds the stylesheet and not the list.
    Three `tierlist pw-item` containers on the raid page and **five** on M+; the roster match rejected
    the extras by itself, including the 9-entry dungeon-difficulty block (King's Rest, Ruby Life
    Pools, …) — never by position. **40 + 40 = 80 rows, 0 unmatched.**
  · **Wowhead**, 6 pages, HTTP 200, 75,149–341,214 bytes, FULL browser header set (a UA-only request
    is Cloudflare-403). `\/` unescaped across the whole document BEFORE searching for
    `[tier-list=rows]`; never anchored on `WH.markup.printHtml(`, which is what produced the past
    zero-row incidents. Exactly one tier-list block per page. Labels matched with tolerant
    whitespace and specs read off the `[spec-badge=<spec>-<class>]` kebab slug. **27/7/6 and 27/7/6 =
    80 rows, 0 unmatched.**
- **Pre-merge diff: 240 of 240 letters identical — moved 0 / same 240 / new 0 / absent 0.** Nothing
  was merged because there was nothing to merge; `apply-ratings.mjs` was not run.
- **Page self-dates re-read live and cross-checked against this run's `published-evidence` artifact,
  all matching stored values exactly.** Icy Veins JSON-LD `dateModified`: raid DPS 2026-08-30, raid
  healer 2026-09-01, raid tank 2026-08-29, M+ DPS 2026-08-30, M+ healer 2026-08-30, M+ tank
  2026-08-30. Wowhead: raid DPS/healer/tank all 2026-08-31, M+ DPS 2026-08-28, M+ healer 2026-08-26,
  M+ tank 2026-09-01. Method publishes no JSON-LD date; its in-body "Last Updated" lines read
  **10th August 2026** (raid) and **13th August 2026** (M+), and it carries no `published` block in
  the contract.
- **Era-verified from body, title and changelog — all six Icy Veins, both Method and all six Wowhead
  pages self-identify as Midnight Season 2 / Patch 12.1**, with Season 1 discussed in the past tense.
  Devourer present in every DPS and tank list (on Method it lives in the `alt=` attributes, so a
  text-only Devourer grep on that page returns false — check the parsed rows, not the stripped text).
  The Icy Veins raid-healer title still reads "(Patch 12.0.7 / Midnight)" and is again overridden by
  its body per the body-over-title precedent: changelog "01 Sep. 2026: Updated for the end of RWF
  Mythic progression", "11 Aug. 2026: Updated for Midnight Season 2 launch". **No `seasonVerified`
  value changed (all 26 pages stay `s2`), so `freeze-season.mjs` had nothing to do and step 5b is a
  no-op this run.**
- **`snapshot` dates already read 2026-09-06** from the earlier run today and were re-verified rather
  than rewritten — a same-day recheck confirms unchanged fresh data, it does not advance a date.
- 🛑 **ARCHON WALL, NIGHT 18.** The pre-agent `source-health/evidence.json` (19:44:21Z) already
  reported both probe routes `blocked` — raid `cloudflare-challenge` at HTTP 403, M+
  `human-verification` at HTTP 200. Confirmed independently here: **all ELEVEN distinct registered
  archon.gg URLs fetched with the full browser header set returned HTTP 403, 5,926–6,010 bytes, with
  `<title>Just a moment...</title>` and `cf_chl` markers, and `__NEXT_DATA__` count 0 on every one.**
  The assertion is on `__NEXT_DATA__` presence, not the status code, exactly as the contract's
  standing note requires. No challenge was solved, replayed or automated past. **Per the
  owner-confirmed retention policy (2026-09-05) Archon's last verified S2 letters stay in the
  consensus with their original 2026-08-25 dates** — an outage does not remove a source, and the
  consensus is still four sources. Not one Archon letter, snapshot or `seasonVerified` was touched.
- `data/encounter-tiers.json` re-read rather than described from memory rather than assumed:
  **`season: "s1"`, `asOf` 2026-08-17**, 619 tier rows (299 raid + 320 M+). It is still the
  QUARANTINED S1 archive — the stamp does not match `PHASES.liveSeason`, so the UI keeps the whole
  Fight selector hidden and `fight=` deep links inert, and it stays that way until an Archon S2
  encounter rebuild can actually be fetched. Unchanged this run. (Note the `archon-encounters`
  contract row probes the registry PAGE snapshot, 2026-08-18, not this file's `asOf`.)

## 2026-09-06 (local, scheduled) — Archon walled a SEVENTEENTH night, re-probed from a residential IP; 0 letters touched

- **Scope: residential-only catch-up.** The CI nightly landed `7a6cea3` at 13:50Z with Icy Veins,
  Method and Wowhead all `success` and 0 letters moved, so those three were deliberately NOT
  re-fetched here — independently regenerating what CI already produced is what makes a local push
  unmergeable. Archon was the only tier-side job worth a residential retry.
- **All ELEVEN distinct registered archon.gg URLs re-probed from Riley's residential IP** with the
  full browser header set (UA, Accept, Accept-Language, Sec-Fetch-\*, Sec-CH-UA\*,
  Upgrade-Insecure-Requests). Every one returned **HTTP 200** with a **2,498–2,519 byte** body,
  `<title>Human Verification</title>`, and `__NEXT_DATA__` count **0**. That is the 200-shaped wall
  the 08-31 local run first recorded — not the 403 Cloudflare "Just a moment..." managed challenge
  the CI runner drew from the same URLs four hours earlier the same day. The two forms still coexist
  and are still IP-dependent, and the assertion that matters (`__NEXT_DATA__` presence) is **0** from
  both, which is why it is the assertion.
- ⚠️ **A 200 is not reachability.** Restated because this is the seventeenth consecutive
  demonstration: a status-code check would have read all eleven of today's responses as a recovery
  and then merged an empty parse.
- **Not bypassed, and it must not be.** No challenge was solved, replayed or automated past; no
  proxy, no `_next/data` route, no cached-render service, no Warcraft Logs backfill (hard rule 3).
- **Nothing merged, nothing stamped.** `data/specs.json`, `data/sources.json` and
  `data/encounter-tiers.json` are byte-identical to HEAD. All 11 archon page snapshots stay at
  2026-08-25 / 2026-08-18; the 80 stored archon letters and its six numeric series stand at their
  2026-08-24/25 dates. Per the owner-confirmed retention policy (2026-09-05) those letters remain in
  the consensus, so the live consensus is still **four** sources — an outage does not remove a source.
- **`node src/freeze-season.mjs`: nothing to freeze.** No `seasonVerified` moved this run because
  nothing was re-verified; it printed "8 source/bracket pairs still describe the live season" and did
  not rewrite the archive.
- **Manifest deliberately NOT rewritten** (partial run, per local-run SKILL.md step 3). Unusually,
  `check-refresh --manifest` still **passed** rather than failing on the expected `startedAt … is Nh
  old` line: the nightly's own `startedAt` (13:50Z) was ~4.3h old at gate time, inside the ≤12h
  bound. The degraded set it printed is entirely the standing one — 9 archon rows, the wowmeta
  standing red, the two wcl-live aggregates, murlok's source-date lag.

## 2026-09-06 (nightly) — 240/240 rows re-parsed, ZERO letters moved; Archon walled night 16

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — 240 rows, 0 unmatched, 0 letters moved.** Per-page
  counts reconciled BEFORE the merge (27 DPS / 7 healer / 6 tank per bracket per source); exactly one
  `<table class="tier-list">` per Icy Veins page after stripping `<style>`, exactly one
  `[tier-list=rows]` block per Wowhead page, and 4 raid / 8 M+ `tier__tier` blocks on Method with the
  same 8 dungeon-difficulty labels (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale,
  Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs) as the only unmatched strings —
  rejected by ROSTER MATCH, never by position. A pre-merge diff against stored ratings reported
  moved 0 / same 240 / new 0 for all three sources.
- **Transports, recorded as always.** Icy Veins: direct browser-UA GET, HTTP 200, 196-343 KB written
  to disk (sizes read off the files, not curl's `size_download`, which reports the compressed length
  under `--compressed`). Wowhead: FULL browser header set, HTTP 200, 75-341 KB; `\/` unescaped across
  the whole document BEFORE searching for the block, never anchored on `WH.markup.printHtml`; each
  `[tier-label ...]X[/tier-label]` matched with tolerant whitespace and each `[spec-badge=<spec>-<class>]`
  kebab slug resolved. Method: direct browser-UA GET, HTTP 200, 159 KB (raid) / 166 KB (M+). r.jina.ai
  deliberately not attempted on either host.
- **Page self-dates re-read live, not carried forward, and all unchanged.** Icy Veins JSON-LD
  `dateModified` 2026-08-30 (raid DPS) / 09-01 (raid healer) / 08-29 (raid tank) / 08-30 x3 (M+);
  Wowhead 08-31 x3 (raid) and 08-28 / 08-26 / 09-01 (M+); Method's in-body "Last Updated" 10th August
  (raid) and 13th August (M+). Every value matches both the stored `published` and this run's
  pre-agent `published-evidence/evidence.json`.
- **Era-verified from each ranking body and changelog, never a substring count.** All 14 pages
  self-identify as Midnight Season 2 / Patch 12.1 ("Midnight DPS Raid Tier List for Season 2",
  "Mythic+ Tank Rankings - Tier List for Midnight Season 2", Method's "Mythic+ content and dungeon
  difficulty in Midnight Season 2"), and discuss Season 1 only in the past tense — the Icy Veins
  raid-healer page's title still reads "(Patch 12.0.7 / Midnight)" while its body is entirely Season 2
  ("looking fantastic in Season 2", "large nerfs before Season 2's launch", changelog "11 Aug. 2026:
  Updated for Midnight Season 2 launch"), so body-over-title applies again. Devourer present in the
  four DPS and two tank lists and correctly absent from the healer lists. `seasonVerified` stays `s2`
  on all 14 pages, so NO seasonVerified value changed this run and `freeze-season.mjs` had nothing to
  observe (it printed "8 source/bracket pairs still describe the live season — nothing to freeze").
- **ARCHON WALL, NIGHT 16.** All 11 distinct registered archon.gg URLs fetched with the full browser
  header set: every one returned **HTTP 403** with a ~5.9-6.0 KB Cloudflare "Just a moment..."
  interstitial and **`__NEXT_DATA__` count 0** — asserted on the payload, never on the status code.
  The pre-agent `source-health/evidence.json` independently probed the two ordinary public DPS routes
  minutes earlier and recorded `blocked` for both (raid 403 `cloudflare-challenge`; M+ **HTTP 200**
  carrying a 2,516-byte `human-verification` body — the 200-shaped wall the contract warns about).
  No challenge was solved, replayed or worked around. Per the owner-confirmed retention policy
  (2026-09-05) Archon's last verified S2 letters stay in the consensus with their original
  2026-08-25 dates; the consensus remains FOUR sources. No archon snapshot advanced.

## 2026-09-05 (nightly, FOURTH run of the day) — 240/240 rows re-parsed, ZERO letters moved; Archon walled night 15

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — 240 rows, 0 unmatched, 0 letters moved.** Per-page
  counts reconciled BEFORE the merge (27 DPS / 7 healer / 6 tank per bracket per source); one
  `tier-list` table per Icy Veins page, one `[tier-list=rows]` block per Wowhead page,
  4 raid / 8 M+ `tier__tier` blocks on Method with the 8 dungeon-difficulty labels the only
  unmatched strings (rejected by ROSTER MATCH, never by position). `apply-ratings` was run on the
  full 240 anyway and landed a confirmed no-op.
- **Page self-dates re-read, not carried forward, and all unchanged**: Icy Veins JSON-LD
  dateModified 2026-08-30 (raid DPS) / 09-01 (raid healer) / 08-29 (raid tank) / 08-30 ×3 (M+);
  Wowhead 08-31 ×3 (raid) and 08-28 / 08-26 / 09-01 (M+); Method's in-body "Last Updated"
  10th August (raid) and 13th August (M+). Every one matches the stored `published`.
- **Era-verified from the ranking bodies, not a substring count.** All six Icy Veins pages and all
  six Wowhead pages self-identify as Midnight Season 2 / Patch 12.1 in their own prose ("Midnight
  DPS Raid Tier List for Season 2", "Mythic+ Tank Rankings - Tier List for Midnight Season 2");
  both Method pages name "the Midnight Season 2 Raid, The Venomous Abyss" and "Mythic+ ... in
  Midnight Season 2". Devourer present in every DPS and tank list and correctly absent from the
  two Wowhead healer pages. The Icy Veins raid-HEALER page title still reads "(Patch 12.0.7 /
  Midnight)" — overridden by its Season 2 body per the body-over-title precedent, same as prior
  runs. **No `seasonVerified` value changed anywhere, so `freeze-season` had nothing to observe.**
- **Transport**, recorded per the standing rule: direct browser-UA GET for Icy Veins (200,
  196–343 KB) and Method (200, 159/166 KB); the FULL browser header set for Wowhead (200,
  75–341 KB). r.jina.ai deliberately not attempted on either host (IP-403 on `wowhead.com/guide/*`
  since 2026-08-03, and it is not a murlok/wowhead lane). Icy Veins `<style>` stripped before
  parsing; Wowhead `\/` unescaped across the whole document BEFORE locating the block, and tier
  labels matched with tolerant whitespace.
- **Archon: unreachable, night 15.** All 11 distinct registered archon.gg URLs fetched fresh with
  the full header set; every one returned HTTP 403 carrying Cloudflare's "Just a moment..."
  challenge-platform interstitial (6,054–6,180 bytes) with `__NEXT_DATA__` count **0** — the
  assertion is on `__NEXT_DATA__` presence, never the status code. The pre-agent
  `source-health/evidence.json` (attemptedAt 2026-09-05T20:05:54Z) independently recorded both
  known shapes on the two ordinary public routes it probes: Heroic raid DPS 403
  `cloudflare-challenge` (5,743 bytes) and M+ DPS **HTTP 200** `human-verification` (2,516 bytes).
  No challenge was solved, replayed or automated past, and nothing was backfilled from Warcraft
  Logs (hard rule 3). All archon snapshot dates and all 80 stored archon letters untouched. Per
  the owner-confirmed retention policy (2026-09-05) Archon's last verified S2 letters still
  contribute, so the consensus remains **four** sources.
- Snapshots for icyveins/method/wowhead were already 2026-09-05 from the earlier runs today and were
  RE-VERIFIED rather than advanced.

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
