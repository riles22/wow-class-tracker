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

## 2026-08-15 (nightly, 21:50 UTC — second run of this UTC day)

All five tier lists re-fetched live and **ZERO tier moves anywhere** — 360 assignments re-read
(icyveins 80, icyveins-ptr 40, method 80, wowhead 80, archon 80), 0 unmatched, and nothing
merged because nothing moved.
The two Wowhead M+ DPS moves from the earlier run of this same day (Assassination B→A, Shadow
C→B) reproduce exactly, which is the useful confirmation: they were upstream, not parse drift.

Per-page row counts, printed and reconciled against 27 DPS + 7 healer + 6 tank = 40:
icyveins 27/7/6 + 27/7/6, icyveins-ptr 27/7/6, method 40 + 40, wowhead 27/7/6 + 27/7/6,
archon 27/7/6 + 27/7/6. Transports: Icy Veins plain browser-UA GET; Wowhead FULL header set
then unescape `\/` across the whole document BEFORE searching for `[tier-list=rows]` (one
block per page tonight, so no decoy `printHtml` was in play); Method `.tier__tier` blocks with
non-roster alts rejected by ROSTER MATCH (the 8 S2 dungeon names + the logo), never by
position; Archon `__NEXT_DATA__` with every entry resolved from its `icon` "Class-Spec" token.

**Era, unchanged and re-verified from each page's own body:** icyveins s2 (the raid-HEALER
page again carries a "Patch 12.0.7 / Midnight" title over a changelog reading "13 Aug. 2026:
Further updated for Midnight Season 2 launch" — body over title, the blue-tracker precedent),
icyveins-ptr s2, method s2 (raid body names The Venomous Abyss ×3; M+ lists the S2 dungeons),
wowhead s2, archon **s1** (encounterOptions are still the nine S1 bosses and the eight S1
dungeons). No `seasonVerified` value changed, so `freeze-season.mjs` had nothing to be run
for; the nightly publish job runs it regardless.

`published` re-read per page, never carried forward, and agreeing 9/9 with the deterministic
published-evidence artifact: icyveins raid DPS/tank 08-08, raid healer 08-13, M+ ×3 08-08;
icyveins-ptr ×3 08-09 (JSON-LD dateModified; the in-body "Last UPDATED" still says 08-02 and
dateModified wins). Wowhead 08-14/08-08/08-14/08-15/08-09/08-11. Archon `lastUpdated` is still
2026-08-15T12:00:00Z with unchanged totalParses (4277/1120/600) — it has not re-cut since the
earlier run, which is why the letters reproduce and the numeric rows stay `partial`.

Encounter tiers: full 51-page re-fetch (9 bosses + 8 dungeons × 3 roles), 51/51 HTTP 200,
618 rows parsed, 0 diffs. The same six role cuts are empty upstream (Crown ×3, Chimaerus
healer+tank, Vanguard tank) and three are short; their 59 stored rows were left untouched per
"empty = nothing to ingest", so the file still holds 677 rows at Archon's own 2026-08-14.

## 2026-08-15 (nightly)

All four live tier-list sources plus `icyveins-ptr` fetched fresh. **Consensus movement: 3
cells, all raid, all one band** — Preservation Evoker A+→A, Frost Mage A+→S, Protection
Warrior S→A+ — and all three are Archon's, because Archon is now the only source feeding the
live consensus in its own right (icyveins / method / wowhead all verify s2 = season-AHEAD and
contribute through the frozen lane, which keeps every cell at a consensus of 4).

- **archon — 80 assignments, 5 raid tier moves** (Frost Mage A→S, Outlaw Rogue B→A, Feral
  Druid A→B, Preservation Evoker B→C, Protection Warrior S→A); every M+ letter byte-identical.
  **The Season-1 raid sample collapsed further overnight**: total parses 3992 DPS / 1041 healer
  / 560 tank, against 6435 / 1582 / 897 on 08-14 and 219704 DPS on 08-12. Weak evidence — noted
  in the manifest, not smoothed. `lastUpdated` still reads 2026-08-14T12:00:00Z while every raid
  parse count moved, which is the standing reason the parse-count column, not `lastUpdated`, is
  Archon's re-cut detector. Archon still describes Season 1 (nine S1 bosses, eight S1 dungeons,
  zone label "VS / DR / MQD"), so `seasonVerified` stays s1.
  Per-encounter: 51/51 pages, 83 raid tier changes, 0 M+ changes, 677 rows (was 678 — Archon
  dropped Affliction Warlock from Vanguard). Empty upstream cuts (Crown all three roles,
  Chimaerus healer+tank, Vanguard tank) left untouched per "empty = nothing to ingest".
  Survivability: 40/40, **0 moves** (18 last night).
- **wowhead — 80 assignments, 6 moves, all on the raid DPS page**, which republished today
  (Fury Warrior B→A, Havoc DH B→A, Frost DK A→B, Arcane Mage A→B, Marksmanship Hunter A→B,
  Enhancement Shaman C→B). `published` advanced 08-08 → **08-14 on raid DPS and raid tank**;
  the other four unchanged. All six agree with published-evidence.
- **method — 80 assignments, 0 moves.** The Season-2 lists that landed yesterday are stable;
  self-dates unchanged (raid 10 Aug, M+ 13 Aug). Still s2 / season-ahead.
- **icyveins — raid 40/40, 0 moves; M+ STILL BLOCKED (sixth day).** The live M+ pages publish
  S+ / B+ / TBD, bands the 5-band `icyveins` scale does not carry, and their 40 letters are
  again byte-identical to the `icyveins-ptr` list — Icy Veins is still serving its PTR list as
  its live M+ list. 34 of 40 stored M+ letters would move if a merge were allowed. `scales.json`
  is the gate contract → OWNER ESCALATION, stored letters untouched. All `published` unchanged.
- **icyveins-ptr — 40/40 read, 0 moves.** No rebuild since 08-09 (Sunday 14:00 CEST cadence);
  Subtlety Rogue is still the literal upstream TBD, stored as an explicit null.
- No `seasonVerified` value changed this run, so `freeze-season.mjs` had nothing new to freeze
  (publish runs it regardless).

## 2026-08-15 (nightly CI, headless Opus 5, single-shot; started 10:57Z — SECOND run of this UTC day)

All four live tier sources + the era-gated PTR list re-fetched from scratch, 20 pages,
20/20 HTTP 200, 0 unmatched rows. **ZERO tier moves anywhere, on any source, in either
bracket** — every letter reproduces what the 05:34Z run left, which is an independent
confirmation rather than a skipped fetch. Nothing was applied, so `apply-ratings.mjs` was
not run and no `seasonVerified` value changed (→ nothing new for `freeze-season.mjs`).

- **icyveins — raid re-read 40/40, 0 moves; M+ STILL BLOCKED, seventh day.** Direct curl
  with a browser UA (200, 181–329 KB), parsed from `<table class="tier-list">` (first `<td>`
  = tier, `tier-list-entry` img `alt` = "Spec Class"). The live M+ pages still publish
  **S+ / B+ / TBD** — bands the 5-band `icyveins` scale does not carry — and their 40 letters
  are again **byte-identical to `icyveins-ptr`** (re-verified row by row, 27/7/6). 34 of 40
  stored M+ letters would move if a merge were allowed. `scales.json` is the gate contract →
  **owner escalation**, stored M+ letters untouched.
  Recorded because it is easy to misread as an opening: the live M+ **TANK** page alone
  carries no out-of-scale band this run (S/A+/A/B only, 6/6 in-scale). It was still NOT
  merged — its letters are the same PTR-list rebuild as the two blocked pages, and landing
  one third of a bracket would publish a half-updated M+ cut for the source. The escalation
  is the rebuild, not the individual band.
  Era: raid DPS title "Midnight (12.1)", raid tank "Patch 12.1 / Season 2", all three M+
  titles "Patch 12.1 / Midnight"; the raid-HEALER page again keeps a stale "(Patch 12.0.7 /
  Midnight)" title over an unambiguously Season-2 body ("ranked … for Midnight Season 2",
  changelog "Updated for Midnight Season 2 launch") — body over title, per the blue-tracker
  precedent. seasonVerified stays **s2** on all six, so icyveins remains season-AHEAD:
  out of the live consensus in its own right, into the next-patch forecast, with its final
  s1 letters carrying the consensus composition through the frozen lane.
  `published` re-read per page, never carried forward: raid DPS 08-08, raid healer 08-13,
  raid tank 08-08, M+ ×3 08-08 — unchanged and agreeing 6/6 with `published-evidence`.
- **icyveins-ptr — 40/40 read (27 DPS + 7 healer + 6 tank), 0 moves.** All three titles read
  "PTR Tier List for Midnight (Patch 12.1 / Season 2)" — era-verified the OTHER way, as this
  source requires. No rebuild since 08-09 (JSON-LD `dateModified` 2026-08-09 on all three,
  agreeing 3/3 with `published-evidence`), consistent with the Sunday 14:00 CEST cadence.
  Subtlety Rogue is still the literal upstream **TBD** and stays an explicit `null`.
- **method — 80/80 assignments, 0 moves.** Direct curl (200, 152–155 KB), parsed from the
  `.tier__tier` blocks. The only rejected `alt` strings are the eight Season-2 dungeon names
  and the site logos. Self-dates unchanged: raid "Last Updated 10th August 2026", M+ "13th
  August 2026"; raid body names "Venomous Abyss" ×3, zero "Season 1" mentions on either page.
  seasonVerified stays **s2** (season-AHEAD, frozen lane carrying its s1 letters).
- **wowhead — 80/80 assignments, 0 unmatched, 0 moves.** Full browser header set (200,
  19–92 KB `--compressed`); tiers parsed from the embedded `[tier-list=rows]` BBCode, whose
  closing tags are escaped `[\/…]` inside a JS string. JSON-LD `dateModified` per page: raid
  DPS 08-14, raid tank 08-14, raid healer 08-08, M+ DPS 08-13, M+ healer 08-09, M+ tank 08-11
  — all unchanged from the 05:34Z run (the two raid pages that republished yesterday have not
  moved again) and agreeing 6/6 with `published-evidence`. All six titles read "Midnight
  Season 2" → seasonVerified stays **s2**.
- **archon — 80/80 aggregate assignments, 0 moves; and this is the same CUT, not just the
  same letters.** 6 aggregate + 51 encounter pages by direct curl → `__NEXT_DATA__`
  (`specTierListSection.tierLists[]`, metric "throughput" for raid / "score" for M+, never the
  default popularity grouping). `lastUpdated` is 2026-08-14T12:00:00Z on all 57 pages AND every
  parse count is identical to the 05:34Z run — raid 3992 DPS / 1041 healer / 560 tank, M+
  1 957 260 / 661 033 / 662 388 — so Archon has genuinely not re-aggregated between the two
  runs. Note the contrast with 08-14→08-15, where the label held still while the parse counts
  moved: **the parse-count column, not `lastUpdated`, is the re-cut detector**, and tonight it
  agrees with the label.
  Era: the pages still describe Season 1 (nine S1 bosses in `encounterOptions`, the eight S1
  dungeons, zone label "VS / DR / MQD") → seasonVerified stays **s1**, and Archon remains the
  ONLY source feeding the live consensus in its own right.

## 2026-08-14 (nightly, CI runner)

All five tier sources fetched live; 320 assignments applied (icyveins raid 40, icyveins-ptr 40,
method 80, wowhead 80, archon 80).

- **METHOD REBUILT FOR SEASON 2 — `seasonVerified` s1 → s2 on both brackets.** The raid page
  now self-dates "Last Updated 10th August 2026" and describes "the Midnight Season 2 Raid,
  The Venomous Abyss"; the M+ page self-dates 13th August (Tactyks byline, "Midnight Season 2").
  Yesterday both pages carried **zero** occurrences of 12.1/Season 2. 51 tier moves — a wholly
  new list — including **Vengeance DH, absent from the raid list for months, now rated B**.
  Consequence is the designed one: a season-ahead outlet leaves the live consensus and becomes
  a next-patch forecast input, with publish's `freeze-season.mjs` restoring its final s1
  letters. Archon is now the ONLY source feeding the live consensus in its own right.
- **archon — 26 tier moves, ALL RAID, zero M+.** Not a retune: Season 1 ended on 08-11 and the
  raid parse pool collapsed ~97% (per-spec parses sum 219704 → 6435 on the DPS page; Devourer DH
  13674 → 527). M+ pool untouched at ~2.5M parses with byte-identical per-spec counts. Treat
  single-night raid moves from Archon as thin-sample noise until S2 refills the pool.
- **archon per-encounter — 185 moves, all raid; M+ byte-identical.** **Crown and Chimaerus now
  publish an EMPTY throughput tier list upstream** (142 / 299 parses; their survivability lists
  still populate), and Vanguard's tank cut is empty. Verified by re-fetching those pages alone,
  so it is upstream emptiness, not a parse miss → "empty = nothing to ingest": their stored rows
  were LEFT UNTOUCHED rather than erased. Vaelgor & Ezzorak legitimately lost 2 specs. 678 rows.
- **icyveins — raid landed (1 move: Restoration Druid B → A), M+ still scale-blocked, day 5.**
  The raid-healer page republished today (dateModified 2026-08-13T23:44Z, changelog "13 Aug.
  2026: Further updated for Midnight Season 2 launch after the first few live tests"), so its
  stored `published` advanced 08-06 → 08-13. Live M+ still publishes S+/B+/TBD and is still
  byte-identical to the icyveins-ptr list on all 40 rows — owner escalation, unchanged.
- **wowhead — 80 assignments, 0 moves**, all six `published` dates unchanged and agreeing with
  published-evidence. **icyveins-ptr — 0 moves**, no rebuild since 08-09 (Sunday cadence),
  Subtlety Rogue still an explicit TBD null.

## 2026-08-13 (nightly CI, 11:47Z — Opus 5; single-shot) — Archon re-cut: 2 raid tier moves + 23 per-encounter; Icy Veins M+ still scale-blocked

- **Transports, per the standing rule:** icyveins 6 + icyveins-ptr 3 pages by direct curl with
  a browser UA (200, 210–357 KB); method 2 pages by direct curl; wowhead 6 pages with the FULL
  browser header set (r.jina.ai is dead on `/guide/*` and was not tried); archon 6 aggregate +
  51 per-encounter pages by direct curl → `__NEXT_DATA__`. No proxy anywhere.
- **archon — the only source that moved.** Aggregate: 80 assignments, **2 tier moves, both
  raid — Discipline Priest S→A, Restoration Druid A→B**; both moved the consensus SCORE only
  (Disc raid 86→79, Resto Druid raid 73→67), no letter change. Per-encounter: 51/51 pages,
  40/40 specs each = 680 rows, **23 moves, all raid** — 11 on Salhadaar (Fire Mage A→S, Arms
  A→B, four healers B→A), 5 Chimaerus, 4 Midnight Falls, singles on Imperator/Crown/Beloren;
  every M+ per-dungeon tier byte-identical. `encounter-tiers.json` asOf → **2026-08-12**
  (Archon's own cut date). Survivability re-parsed 40/40, **0 moves**, so not re-merged.
  `lastUpdated` again 2026-08-12T12:00:00Z — but this time the numbers behind it DID move
  (raid parse counts −15%), the reverse of last night. The rule stands unchanged: the
  **parse-count column is the re-cut detector, not the label.** Era: still S1 content →
  `seasonVerified` s1.
- **icyveins — raid 40/40, 0 moves; M+ BLOCKED for the fourth day.** The live M+ pages publish
  S+/A+/B+/TBD, the `icyveins` scale has five bands with neither S+ nor B+, and the live M+
  letters are still byte-identical to `icyveins-ptr` on all 39 placed specs. 34 of 40 stored M+
  letters would move if a merge were possible (Arcane Mage B→S+, Beast Mastery A+→C, Blood DK
  C→S, Subtlety A→TBD). `scales.json` is CODEOWNERS-owned ⇒ **owner escalation**, stored M+
  untouched. Era detail worth keeping: the raid-HEALER page still titles itself "Patch 12.0.7"
  while its changelog's top line reads "11 Aug. 2026: Updated for Midnight Season 2 launch" —
  its other 20 "Season 2" hits are nav chrome, so read the CHANGELOG, not the nav. Body over
  title ⇒ `seasonVerified` s2 on all six.
- **icyveins-ptr — 40/40, 0 moves.** No rebuild since 2026-08-09 (Sunday cadence). Subtlety
  Rogue still a literal `<td>TBD</td>` → explicit null (39 rated, floor 24). `published`
  re-read: dateModified 2026-08-09 on all three; the in-body "Last UPDATED" still says 08-02
  and dateModified wins.
- **method — 79 assignments, 0 moves.** Still "Last Updated 31st March 2026" with **zero**
  occurrences of "12.1" or "Season 2" → `seasonVerified` s1. Vengeance DH still absent from the
  raid list; omitted, not invented.
- **wowhead — 80 assignments, 0 moves, but the M+ DPS page REBUILT TODAY** (JSON-LD
  dateModified 2026-08-13, was 08-08) without moving a letter; stored `published` advanced for
  that page only. All six titles read "Midnight Season 2" → `seasonVerified` s2 (season-ahead).

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 11:31Z)

**All four tier-list sources + the era-gated PTR list fetched live; ONE tier moved on the
whole roster.** Transports, per the standing rule: icyveins 6 pages + icyveins-ptr 3 pages
direct curl with a browser UA (200, 210–357 KB); method 2 pages direct curl (150/162 KB);
wowhead 6 pages direct curl with the FULL browser header set (73–326 KB — r.jina.ai is dead
on `/guide/*` and was not tried); archon 6 aggregate + 51 encounter pages direct curl →
`__NEXT_DATA__`. No proxy anywhere. 359 rating rows parsed, 0 unmatched.

- **wowhead — the one move: Guardian Druid M+ B → A.** It is not noise: the M+ TANK page's
  JSON-LD `dateModified` advanced **2026-08-08 → 2026-08-11** (the other five pages are
  unchanged at 08-08, M+ healer 08-09), and the stored `published` was updated to match.
  All six titles read "Midnight Season 2", so `seasonVerified` stays **s2** — Wowhead is
  season-AHEAD, i.e. out of the live consensus via the frozen lane and INTO the 12.1
  forecast, so this move lands on `ptrTierRead`, not on a published consensus letter.
- **icyveins — RAID applied (0 moves), M+ STILL BLOCKED, same escalation as 08-11.** All 6
  live pages parsed from `<table class="tier-list">`. Raid re-parsed 40/40 with zero moves
  against stored, an independent confirmation of yesterday's letters. The M+ pages again
  publish **S+ / A+ / B+ / TBD** — bands the five-band `icyveins` scale does not carry — and
  their letters are byte-identical to the `icyveins-ptr` list on **all 40** specs for the
  second day running: Icy Veins has *replaced* its live M+ lists with its PTR list. 34 of 40
  stored M+ letters would move if a merge were allowed (Arcane Mage B→S+, Blood DK C→S,
  Beast Mastery A+→C). `scales.json` is the gate contract, so this stays an **owner
  escalation**; stored M+ letters untouched. Era: five of six titles read 12.1/Season 2 and
  the raid-healer page keeps a stale 12.0.7 title over a Season-2 body — body over title,
  `seasonVerified` stays s2 on all six.
- **icyveins-ptr — 40/40 placed, 0 moves.** All three titles read "PTR Tier List for
  Midnight (Patch 12.1 / Season 2)" — the opposite era check, as required. Subtlety Rogue is
  still upstream **TBD** and stays an explicit `null` (39 rated, floor 24). `published`
  RE-READ per page rather than carried forward: JSON-LD `dateModified` 2026-08-09 on all
  three (the in-body "2nd of August" line loses by the documented precedence).
- **method — 79 rows, 0 moves, still Season 1.** Both pages still self-date "Last Updated
  31st March 2026" and contain **zero** occurrences of "12.1" or "Season 2", so
  `seasonVerified` stays **s1**. With Archon, it is one of only two sources still feeding the
  live consensus. Vengeance DH still absent from the raid list (39 raid / 40 M+).
- **archon — 80 aggregate rows, 0 tier moves; 26 PER-ENCOUNTER moves.** `lastUpdated` is now
  **2026-08-11T12:00:00Z on all six** aggregate pages (yesterday: 08-10 on five, 08-11 on the
  raid-tank page alone), and the raid aggregate genuinely re-cut — every raid parse count
  moved (see refresh-metrics). Despite that, not one aggregate letter moved. The per-encounter
  sweep (9 bosses + 8 dungeons × 3 roles = 51 pages, 51/51 200, 40/40 specs each = 680 rows)
  produced **26 tier moves, ALL on raid bosses** (Vorasius alone accounts for 9; the M+
  per-dungeon cut is unchanged, matching its unchanged aggregate). Written to
  `encounter-tiers.json` with the stored encounter NAMES preserved; `asOf` 2026-08-11 =
  Archon's own cut date. Era: pages still describe Season 1 content (VS/DR/MQD selector, the
  nine S1 bosses, eight S1 dungeons) → `seasonVerified` stays **s1**.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 20:35Z — SECOND run of this UTC day)

All four live tier sources + the era-gated PTR list re-fetched from scratch, 20 pages, 20/20
HTTP 200. **319 assignments applied, ZERO tier moves anywhere** — every letter on every source
reproduces the state the 11:31Z run left, which is an independent confirmation rather than a
skipped fetch.

- **icyveins — raid landed (40/40, 0 moves), M+ STILL BLOCKED, third day.** Parsed from
  `<table class="tier-list">` (first `<td>` = tier, `tier-list-entry` img `alt` = "Spec Class").
  The live M+ pages still publish **S+ / B+ / TBD**, bands the 5-band `icyveins` scale does not
  carry, and the live M+ letters are **byte-identical to `icyveins-ptr` on all 39 placed specs**
  (verified row by row this run) — Icy Veins has replaced its live M+ lists with its PTR list.
  21 DPS + 6 healer + 6 tank stored letters would move if a merge were allowed (Augmentation
  Evoker S→B, Beast Mastery A+→C, Blood DK C→S). `scales.json` is the gate contract, so this
  stays an **owner escalation** and the stored M+ letters were not touched.
  Era: five of six titles read "Patch 12.1 / Season 2"; the raid-HEALER page keeps a stale
  "(Patch 12.0.7 / Midnight)" title over an unambiguously Season-2 body — changelog "11 Aug.
  2026: Updated for Midnight Season 2 launch", "Midnight Season Two Launch Update", per-spec
  text about S2 nerfs/buffs. **Body over title** (blue-tracker precedent) → `seasonVerified`
  stays **s2** on all six. `published` re-read per page, never carried forward: raid DPS/tank +
  all three M+ **2026-08-08**, raid healer **2026-08-06** (JSON-LD `dateModified`; the in-body
  "LAST UPDATED - 10th of August" disagrees and loses by the documented precedence) — agrees
  6/6 with `published-evidence/evidence.json`.
- **icyveins-ptr — 39 rated rows, 0 moves.** All three PTR M+ pages 200; titles read "PTR Tier
  List for Midnight (Patch 12.1 / Season 2)". Subtlety Rogue is **still TBD upstream** (the
  literal `<td>TBD</td>` row) and stays an explicit `null`. `published` re-read: JSON-LD
  `dateModified` **2026-08-09** on all three (unchanged — its Sunday-rebuild cadence), agreeing
  3/3 with the published-evidence artifact.
- **method — 79 rows, 0 moves, still s1.** Both pages 200; `.tier__tier` blocks. The pages still
  self-date "Last Updated 31st March 2026" and contain **zero** occurrences of "12.1" or
  "Season 2", so `seasonVerified` stays **s1** — with Archon it is one of only two sources still
  inside the live consensus. Vengeance DH still absent from the raid list (39 raid / 40 M+):
  omitted, not invented.
- **wowhead — 80 rows, 0 moves.** Full browser header set (UA-only is Cloudflare-403 on
  `/guide/*`; r.jina.ai is dead on that path and was not tried). **Parser note worth keeping:**
  the `[tier-list=rows]` block sits inside a JS string, so the *closing* tag is `[\/tier-list]`
  — a regex anchored on `[/tier-list]` matches nothing and looks exactly like a missing block.
  Spec comes from `spec-badge=<slug>`. JSON-LD `dateModified`: raid ×3 + M+ DPS 2026-08-08, M+
  healer 08-09, M+ tank 08-11 — identical to stored `published`, 6/6 with published-evidence.
  All six titles read "Midnight Season 2" → `seasonVerified` **s2** (season-AHEAD: frozen lane
  for the consensus, live input to the 12.1 forecast).
- **archon — 80 aggregate rows + 680 per-encounter rows, 0 moves on both.** `__NEXT_DATA__`
  parsed from raw HTML, `metric: "throughput"` for raid and `"score"` for M+. All 51
  per-encounter pages (9 bosses + 8 dungeons × 3 roles) 200 with 40/40 specs each; not one tier
  moved, so `encounter-tiers.json` was left byte-identical at `asOf` 2026-08-11.
  **`lastUpdated` advanced to 2026-08-12T12:00:00Z on all six aggregate pages while every
  number behind it held** (all 40 raid and all 40 M+ parse counts byte-identical — see
  refresh-metrics). That is the reverse of last night and re-confirms the standing rule: on
  Archon the **parse-count column is the re-cut detector, the `lastUpdated` label is not.**
  Era: still Season-1 content (raid selector "VS / DR / MQD" + the nine S1 bosses; the eight S1
  dungeons) → `seasonVerified` stays **s1**. New this run: the zone-type selector now offers a
  third option, **"PTR M+"**, alongside Mythic+ and VS/DR/MQD — noted for the flip, not ingested.

## 2026-08-11 (nightly, CI) — THE SEASON FLIP: Icy Veins moved its LIVE lists to Season 2

- **Icy Veins flipped, on the morning Patch 12.1 goes live.** All six live pages fetched
  (HTTP 200, 200-295 KB) and all six now describe **Midnight Season 2 / Patch 12.1**:
  five titles say so outright ("Midnight (12.1)", "Season 2 Tier List (Patch 12.1 /
  Season 2)", "A Tier List for Midnight (Patch 12.1 / Midnight)"). The sixth — raid
  healer — still carries a **stale "Patch 12.0.7" title over a Season-2 body**
  ("Midnight Healer Tier List for Season 2", "Midnight Season Two Launch Update",
  in-body "LAST UPDATED - 10th of August"). Trust the BODY, not the title: same trap as
  the blue tracker's patch tag. `seasonVerified` s1 -> **s2 on all six**, so Icy Veins
  leaves the live consensus (frozen lane) and enters the next-patch forecast.
- **The M+ letters could NOT be applied, and that is the designed backstop.** Icy Veins'
  live M+ pages now publish the **seven-band PTR scale** — S+ (Arcane Mage, Arms Warrior),
  B+ (healer page), and a TBD (Subtlety Rogue) — while the `icyveins` scale has five bands
  and neither S+ nor B+. 19 of 27 M+ DPS letters are identical to the stored
  `icyveins-ptr` list, i.e. **they promoted the PTR list onto the live URLs**. Left
  unmerged; `scales.json` is CODEOWNERS/gate contract, so this is an owner escalation, not
  a collapse into a neighbouring band. While it stands, the M+ forecast's Icy Veins
  publisher read averages stale S1 live letters with the current PTR letters.
- **Raid letters WERE applied** (scale-clean: S/A+/A/B/C): 40 rows, **22 moved** — the S2
  list genuinely replaced the S1 one (Balance Druid B->S, Survival Hunter S->C, Unholy DK
  A+->C, Blood DK B->S). None of it touches the consensus, which no longer counts Icy Veins.
- **Consensus is down to two live-season sources** (Method + Archon) plus two frozen lanes
  (Wowhead since 08-09, Icy Veins from tonight). Measured consequence in the agent tree:
  **26 consensus tier moves**, which breaches the anomaly gate's 25 — but simulating the
  frozen lane from HEAD's icyveins letters (what `freeze-season.mjs` does in publish)
  gives **0 moves**. The 26 is a missing frozen lane, not movement.
- **icyveins-ptr rebuilt** (dateModified 08-02 -> **08-09**, its Sunday cadence): 11 tier
  moves, and Subtlety Rogue is **TBD upstream** this week -> stored as an explicit null.
- Method: unchanged, still self-dated 31 March 2026, still Season 1 -> stays s1, stays in
  the consensus. Wowhead: unchanged, still Season 2. Archon: 0 tier moves, still S1 content
  (a separate `beta-mythic-plus` "PTR M+" zone exists upstream — deliberately not ingested).
- Transport note for Wowhead: the BBCode tier label carries an attribute
  (`[tier-label bg=q5]S[/tier-label]`), so a bare `\[tier-label\]` regex matches **zero**
  rows and looks like an empty page. Split on `[tier]`, then match `\[tier-label[^\]]*\]`.

### Recovery pass (same night, 12:00Z) — the flip verified, and a gate that cannot pass agent-side

The primary agent exited on the anomaly gate. Recovery re-derived its biggest claim from
scratch rather than trusting the log, and everything held:

- **The flip is real.** Re-fetched the three live pages independently: raid-DPS title
  "Midnight (12.1)", M+ DPS "(Patch 12.1 / Midnight)", raid-healer stale "Patch 12.0.7"
  title over a body reading "Midnight Season Two Launch Update". The residual `Season 1`
  string hits (17-18 per page) are **navigation chrome** — the S1 raid/dungeon guide menu —
  not list content, which is worth knowing before someone "corrects" a future era-verify.
- **The applied letters are exact**: all 34 stored icyveins raid DPS+healer letters
  reproduce from the live tables, 0 mismatches, 0 unmatched. The M+ refusal is right too —
  the live M+ tables really do publish S+ / A+ / B / TBD against a 5-band scale.
- **The 26-move breach is the missing frozen lane, measured.** Ran `freeze-season.mjs` in a
  scratch COPY of the tree (never in the repo — `season-final.json` is Gate-0 immutable):
  it froze icyveins raid+mplus at 40 letters each from 9ed717d, and after a rebuild
  `check-refresh --manifest` in that copy reported **0 tier moves and PASSED**.

**The structural finding, for the owner.** On a season-flip night the refresh job's
completion gate **cannot pass, by construction, no matter what the agent does**: the frozen
lane that neutralizes the movement is written by `freeze-season.mjs` in the PUBLISH job
(between Gate 0 and Gate 1), while the refresh job runs `check-refresh --manifest` with no
frozen lane and no trusted ack. The agent's only levers would be dishonest — reverting
`seasonVerified` to s1, or writing `season-final.json` / `anomalyAck` (both rejected by
design). So the night reads RED on refresh and GREEN on publish (publish is
`needs: refresh` + `if: !cancelled()`, so it still runs, and Gate 3 sees 0 moves).

Two ways to close it if it recurs, both owner calls: run `freeze-season.mjs` before the
refresh job's completion gate, or teach the gate to discount movement attributable to a
source entering the frozen lane. **A narrower correction to CLAUDE.md than first written
here** (revised 2026-08-11): the original wording — "a related assumption in CLAUDE.md is
wrong" — was over-general and reads as a licence to move freeze-season agent-side. It is
not. Shallow checkout is ONE of three reasons freeze-season lives in publish, and it was
merely not the binding one *that night*: at depth 1 the walk happened to resolve, because
HEAD was itself the newest commit whose `sources.json` still verified icyveins at s1. That
is luck about where the freeze point sat, not a property of shallow clones — a walk that
must reach further back cannot answer at depth 1 at all. **The Gate-0 boundary is the
strongest reason and the one that settles it**: `data/season-final.json` is immutable to the
agent, so its writer cannot run in the agent's job. The third is that the archive is
append-only, so a wrong write is permanent and belongs behind the deterministic gates.
Do not relocate freeze-season on the strength of this entry.

## 2026-08-11 (nightly, CI — the SECOND scheduled run of this UTC day; started ~17:5xZ)

All four tier sources plus `icyveins-ptr` re-fetched from scratch by urllib with the full
browser header set. **Zero letters moved anywhere** — 279 assignments re-verified against
stored, 0 diffs. This is ~6h after the 12:00Z run, so an unchanged night is the expected
outcome, not a parse failure; every source was still pulled fresh per the no-staleness-gate
policy.

- **icyveins — `partial`, and for the SAME reason as this morning.** Six live pages, HTTP
  200, 210-357 KB. Era: five titles read "Patch 12.1 / Midnight" or "Season 2 / Patch 12.1";
  the raid-HEALER page still carries the stale "Patch 12.0.7" title over a Season-2 body
  (20 "Season 2" hits, 2 "12.1"), so body-over-title per the blue-tracker precedent.
  `seasonVerified` stays **s2** on all six. RAID re-parsed to 40/40 with **0 moves** against
  stored, so the letters this morning applied are confirmed by an independent fetch.
  **M+ is still blocked and the blockage got sharper**: the live M+ pages publish
  S+ / S / A+ / A / B / C / TBD, and the `icyveins` scale has five bands with neither S+ nor
  B+. New measurement worth recording — the live M+ letters are now **byte-identical to the
  `icyveins-ptr` list on all 40 specs** (this morning it was 19 of 27 DPS). Icy Veins has not
  merely promoted its PTR list onto the live URLs, it has replaced them with it. 34 of 40
  stored M+ letters would move if the scale allowed the merge. Still an OWNER escalation
  (`scales.json` is CODEOWNERS-owned); collapsing S+ into S would fabricate a placement the
  source is explicitly distinguishing.
- **icyveins-ptr — `success`.** Three PTR M+ pages, HTTP 200, era-verified the other way
  (every title "PTR Tier List for Midnight (Patch 12.1 / Season 2)"). 40/40 placed, **0
  moves**; Subtlety Rogue is still TBD upstream and stays an explicit `null` (39 rated rows,
  floor 24). `published` re-read from the page rather than carried forward: JSON-LD
  `dateModified` **2026-08-09** on all three, agreeing 3/3 with `published-evidence`. (The
  in-body "Last UPDATED - 2nd of August" line disagrees; dateModified wins by the documented
  precedence, and the weekly Sunday cadence makes a 2-day-old rebuild normal.)
- **method — `success`.** Both pages, HTTP 200 (153 / 165 KB), parsed from `.tier__tier`.
  79 assignments (39 raid — Vengeance DH still absent upstream — and 40 M+), 0 unmatched,
  **0 moves**. Still self-dates "Last Updated 31st March 2026", still zero "12.1"/"Season 2"
  strings anywhere in either page, so `seasonVerified` stays **s1** and Method remains one of
  only two live-season letter sources (with Archon). M+ still publishes no S tier.
- **wowhead — `success`.** Six pages, HTTP 200, 73-324 KB. Parse note for the next run:
  the `[tier-list=rows]` block sits inside a JS string, so the closing tag is `[\/tier-list]`
  and every inner tag is escaped — a regex written against the unescaped BBCode finds the
  opening marker and then matches nothing. 80 assignments, 0 unmatched, **0 moves**. All six
  titles read "Midnight Season 2", so `seasonVerified` stays **s2** (season-AHEAD: out of the
  live consensus via the frozen lane, into the next-patch forecast). JSON-LD dateModified:
  M+ healer 2026-08-09, the other five 2026-08-08 — agreeing 6/6 with published-evidence.
- **archon-tiers / -encounters / -survivability — `success`, all three.** 6 aggregate + 51
  per-encounter pages = 57 fetches, 57/57 HTTP 200, all parsed from `__NEXT_DATA__`
  (`specTierListSection.tierLists[]`, metric `throughput` for raid and `score` for M+, never
  the default popularity grouping). 80 aggregate assignments + **680** per-encounter rows
  (40/40 specs on every one of the 9 bosses and 8 dungeons, floor 440) + 40 survivability
  tiers. **0 moves on all three surfaces**, so `data/encounter-tiers.json` was not rewritten
  at all. Era: the pages still describe Season 1 (raid selector "VS / DR / MQD", the nine S1
  bosses, the eight S1 dungeons) — `seasonVerified` stays **s1**.
  Archon's own `lastUpdated` label is **2026-08-10T12:00:00Z on 5 of 6 aggregate pages** and
  2026-08-11T12:00:00Z on the raid-tank page alone, ~6h after that rebuild should have
  landed. Uneven per-page labels are worth watching but are not ours to fix; the identical
  values across two fetches 6h apart confirm no rebuild reached the data.

## 2026-08-10 (nightly CI, headless Opus 5, single-shot; started 11:32Z)

- **All five tier sources fetched live, 26 pages, 26/26 HTTP 200.** icyveins 6 (212-371 KB),
  icyveins-ptr 3 (220-357 KB), method 2 (153/165 KB), wowhead 6 (73-322 KB), archon 6
  aggregate + 51 encounter. 359 rating assignments applied, 0 unmatched.
- **Transport note for Wowhead:** `/guide/*` is Cloudflare-403 to a bare UA but 200 with the
  full browser header set (Accept / Accept-Language / Sec-Fetch-* / sec-ch-ua). No proxy
  needed this run.
- **Wowhead parse trap, cost one silent row:** keying on `[tier-label]…[/tier-label]\r\n
  [tier-content]` by tag adjacency drops any tier whose block carries an extra newline —
  Holy Priest's C on the M+ healer list went missing exactly that way (6 rows instead of 7,
  and the miss is invisible because `apply-ratings` never nulls an absent row). Split the
  `[tier-list=rows]` payload on `[tier]` and read label + badges **inside each block**.
- **Tier movement: 2, both Archon raid, both one band.** Frost DK A→B and Outlaw Rogue B→C.
  Both sit on the A/B and B/C cluster edges (Frost DK 175.1k against an A tier bottoming at
  177.2k). Re-fetched twice — byte-identical, so not a transport flake. Archon's
  `lastUpdated` label still reads 2026-08-09T12:00:00Z (its daily 12:00Z rebuild lands
  *after* the 10:37Z nightly), so this is its own reclustering, not a Blizzard retune.
  Net effect on the page: **1 consensus letter** (Outlaw raid B→C) and 2 forecast letters
  (Frost DK raid A→B, Subtlety raid A→B). icyveins / icyveins-ptr / method / wowhead: 0 moves.
- **Encounter tiers**: 51/51 pages, 40/40 specs each = 680 tier rows, 32 one-band moves
  (Vaelgor & Ezzorak 12, Imperator 5). Rewritten this time — heed the note above: `indent=2`
  + `ensure_ascii=False` + trailing newline keeps the diff to the rows that actually moved.
  Stored encounter NAMES kept; Archon's selector labels are short forms ("Imperator" vs
  "Imperator Averzian") and overwriting them would degrade the UI.
- **Season state unchanged.** icyveins/method/archon self-identify Season 1 (`s1`); wowhead
  is still AHEAD at Season 2 on all 6 pages (`s2`, frozen lane); icyveins-ptr verifies the
  other way at "Patch 12.1 / Season 2" (`s2`). No season flip — and the 12.1 launch date is
  now confirmed as **2026-08-11**, Season 2 opening **08-18**, so the flip is imminent.
- **published re-read from the pages themselves every run, never carried forward**:
  icyveins raid healer 2026-08-04 / raid tank 2026-06-30 / other four 2026-07-01;
  icyveins-ptr 2026-08-02 ×3; wowhead M+ healer 2026-08-09, other five 2026-08-08. Agrees
  15/15 with `published-evidence/evidence.json`.
- **Method still omits Vengeance DH from the raid list** (39 raid / 40 M+) and still has an
  empty S tier in M+. Both upstream facts, neither invented around.
- **icyveins-ptr had no TBD this week** — 40/40 placed, so no explicit nulls were written.

## 2026-08-09 (nightly, CI runner)

- **WOWHEAD FLIPPED TO SEASON 2 — the headline of the run.** All six pages rebuilt
  upstream on 2026-08-08 (JSON-LD `dateModified` 2026-08-08 on every one, previously
  2026-04-19 … 2026-08-05, and the independent pre-agent `published-evidence` probe saw
  the same). Every `<title>` now reads "… for Midnight Season 2" and the body is
  explicit: "Wowhead's DPS Tier List for the Venomous Abyss in Midnight Season 2 …
  damage output in **Patch 12.1**", with per-spec notes referring to the 12.1 PTR cycle.
  **This is NOT the patch going live** (12.1 ships Aug 11; these are pre-launch Season-2
  predictions) — it is a LIVE-era source publishing next-season lists early, which is
  exactly the case DECISION 1 spells out. Stored `seasonVerified: "s2"` on all six pages,
  so `consensusFor` drops Wowhead from both brackets; its column, letters, drawer row and
  projection input all remain. Consequences, measured: the live consensus is now a
  **consensus of 3** (Icy Veins · Method · Archon) and **16 consensus letters moved, all
  by exactly one band** (0 two-band, 0 coverage losses), so the anomaly gate is not
  breached and no ack is needed. The 12.1-forecast column moves with it, since the live
  consensus is the projection's prior.
- The Wowhead rebuild itself moved **49 of 80 letters** (raid 29, M+ 20) — a NEW list, not
  a retune, which is why the letters are stored as fetched rather than held at their S1
  values. Biggest: Arms C→S and Blood DK B→S raid, Ret A→C, Aug A→C raid / A+→C M+,
  Guardian S→B M+, Disc + Pres A→S raid.
- Everything else: **zero tier moves anywhere.** Icy Veins 80/80 (s1, published dates
  unchanged), Icy Veins PTR 40/40 (s2, published 2026-08-02, its 7-band scale intact),
  Method 79 (39 raid — Vengeance still absent upstream — + 40 M+, s1, M+ S tier still
  genuinely empty), Archon 80 on a fresh cut (`lastUpdated` 08-07T12:00Z → 08-08T12:00Z),
  Archon per-encounter 51/51 pages with 680 complete tier rows (22 moved), survivability
  17 of 40 moved (the same daily death-rate re-clustering; feeds no consensus).
- **No season flip in the tracker.** Icy Veins, Method and Archon all still self-identify
  as 12.0.7 / Season 1, so `PHASES.liveSeason` and `SNAPSHOT_PHASE` stay put — but Wowhead
  going first is the first real exercise of the transition rule. Two days to launch.

## 2026-08-09 (nightly CI, ~19:50-20:0xZ — the SECOND scheduled run of this UTC day)

- **All four live sources + the era-gated PTR list re-fetched from scratch; 0 letters moved
  anywhere except two Wowhead M+ healer cells.** Icy Veins 80 (6 pages, 207-362 KB),
  icyveins-ptr 40 (3 pages, all placed, no TBD), Method 79 (Vengeance DH still absent from
  the raid list — the documented omission), Wowhead 80, Archon 80 from the `throughput` /
  `score` tierLists at `lastUpdated` 2026-08-09T12:00:00Z.
- **WOWHEAD REBUILT ITS M+ HEALER PAGE TODAY** — `dateModified` 2026-08-08 → **2026-08-09**,
  confirmed independently by `published-evidence/evidence.json`, and the page's own stored
  `published` was advanced to match (the other five stay 08-08). Two moves, both upward:
  **Preservation Evoker C→B and Restoration Druid C→B**. Because Wowhead is season-AHEAD
  (s2), this touched no consensus letter — it reached the forecast through `ptrTierRead`,
  moving Resto Druid M+ 36→39 and Preservation M+ 74→76 in score, 0 projection letters.
- **Season state unchanged in both directions.** Icy Veins ("Patch 12.0.7 / Midnight",
  "Season 1"), Method ("Midnight Season 1 Raids…") and Archon (12.0.7, S1 boss/dungeon set)
  are still s1; Wowhead is still s2 on all six pages; icyveins-ptr still verifies the OTHER
  way as "Patch 12.1 / Season 2". No `seasonVerified` value changed, so the frozen lane and
  the consensus-of-3 composition are exactly as the morning run left them.
- **Archon per-encounter: 51/51 pages, 680 tier rows, ZERO changes** — so
  `data/encounter-tiers.json` was deliberately left untouched rather than rewritten with an
  identical payload. Note for whoever rewrites it next: `json.dump` defaults escape the
  em-dash in `_comment` and drop the trailing newline, which shows up as a 4-line diff on a
  file whose data did not change (`ensure_ascii=False` + a trailing `\n`).
- **Survivability re-cut again**: 16 of 40 moved one band (six A→B, eight B→C, Resto Shaman
  B→A, Preservation C→B). Daily re-clustering of Archon's own window; feeds no consensus.

## 2026-08-08 — nightly CI (headless, Opus 5, single-shot; started 11:26Z)

- **All 5 tier-list sources refreshed, ZERO tier moves anywhere** (80 icyveins + 40
  icyveins-ptr + 79 method + 80 wowhead + 80 archon = 359 assignments, 0 unmatched).
- **Transports, for the record** — Icy Veins: plain urllib + browser UA, 200 on all 6
  (parse `<table class="tier-list">`, tier from the row's first `<td>`, spec from each
  entry's summary `img alt`). Method: curl + UA, 200 on both (`.tier__tier` blocks;
  the M+ page's second tier list is Dungeon Difficulty — its 8 dungeon names are
  correctly unmatched). Wowhead: FULL browser header set (UA-only is 403), tiers from
  the `WH.markup` `[tier-list=rows]` payload. Archon: `__NEXT_DATA__` from raw HTML,
  `specTierListSection.tierLists[].tiers[].entries[][]` — note the shape is
  `tier`/`entries` (entries is an array **of arrays**), not `label`/`items`; a parser
  keyed on the latter returns 0 rows and looks exactly like an empty tier list.
- **Era-verify (all stored as `seasonVerified`)**: Icy Veins live 6/6 read
  "Patch 12.0.7 / Midnight" or "/ Season 1" → **s1**; Icy Veins PTR 3/3 read
  "PTR Tier List for Midnight (Patch 12.1 / Season 2)" → **s2**; Method both pages
  "Midnight Season 1"; Wowhead 6/6 "for Midnight Season 1"; Archon `page.description`
  "in 12.0.7" (raid) / "in Season 1" (M+). Devourer DH present in every DPS list.
- **Page-own dates re-read every run, never carried forward.** Icy Veins live
  2026-07-01 ×4 / 2026-08-04 (raid healer) / 2026-06-30 (raid tank); Icy Veins PTR
  2026-08-02 ×3 (JSON-LD **and** the "Last UPDATED - 2nd of August." line agree —
  6 days behind, normal for its Sunday rebuild, `published.maxAgeDays` 9); Wowhead
  2026-06-25 / 2026-04-21 / 2026-06-25 / **2026-04-19** / 2026-08-05 / 2026-05-28.
  All 15 agree with `published-evidence/evidence.json` 15/15. The 04-19 Wowhead M+ DPS
  page is now **111 days** old against its deliberately-loose 120 — it is the page the
  contract comment says to watch, and it has still not rebuilt for Season 2.
- **Archon WAS a new upstream cut**: `page.lastUpdated` 2026-08-06T12:00Z →
  **2026-08-07T12:00:00Z** (the 08-08 12:00Z publish had not landed at 11:26Z).
  Aggregate letters moved zero; 25 of 680 per-encounter tiers moved; **survivability
  moved 21 of 40, every one by exactly one band and 20 of them DOWNWARD** (Enhancement
  S→A, six A→B, thirteen B→C; only Brewmaster C→B up). That is the exact mirror of
  yesterday's 18-mostly-upward set — the same death-rate re-clustering oscillating back,
  not a spec-by-spec re-rating. It feeds no consensus.
- **No season flip.** 12.1 ships **Aug 11**; every live page still self-identifies as
  12.0.7 / Season 1, so `PHASES.liveSeason` and `SNAPSHOT_PHASE` stay put. Three days left.

## 2026-08-15 (third run of the day — nightly, headless)

- All four tier sources re-fetched live; **80 assignments each**, 0 unmatched, per-page
  counts reconciled (27 DPS + 7 healer + 6 tank = 40 per source-bracket).
- **Icy Veins M+ is no longer blocked.** `scales.json` now carries seven bands on the LIVE
  `icyveins` scale (S+ 100 … C 30, owner-widened 08-14), the M+ pages parse S+/S/A+/A/B+/B/C
  plus one literal `TBD` (Subtlety Rogue → explicit null), and all 40 stored M+ letters
  already reproduce the live pages — **0 of 40 would move**, so the escalation is closed by
  agreement rather than by a merge. Live M+ letters remain byte-identical to `icyveins-ptr`
  40/40: Icy Veins is publishing one Season-2 ranking twice.
- **Only movement anywhere: Wowhead M+ DPS — Assassination Rogue B→A, Shadow Priest C→B**,
  with the page's own `dateModified` advancing 08-13 → **2026-08-15T10:38:56-05:00** (stored
  `published` updated to match; agrees with published-evidence). Wowhead is season-AHEAD, so
  those letters feed the next-patch forecast, not the consensus: **0 published consensus and
  0 projection letters moved** measured against `git show HEAD:dist/index.html`.
- Era: icyveins s2 (raid-healer page still titles itself 12.0.7 over a Season-2 body — body
  over title), method s2, wowhead s2, **archon still s1** (S1 bosses + S1 dungeons + "VS / DR
  / MQD" zone label, even though its description now says "in 12.1"). No `seasonVerified`
  value changed, so `freeze-season.mjs` had nothing to observe.
- Archon **re-cut**: `lastUpdated` 2026-08-14 → **2026-08-15T12:00:00Z** with page
  `totalParses` moving (raid DPS 3992→4277) while every per-spec parse count and value held —
  the letters were reproduced, the numbers had nothing new (see refresh-metrics).
- `npm run test:quiet` **401 total / 370 pass / 0 fail / 31 skipped**, build OK, snapshot
  written, manifest rewritten, `check-refresh --manifest` green.
