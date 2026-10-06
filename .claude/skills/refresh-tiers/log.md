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

## 2026-10-06 (nightly, SECOND run of the day) — Method + Wowhead refetched and re-parsed, **0 of 160 letters moved**; Icy Veins Cloudflare-403 day **13**; Archon wall day **42** (letters RETAINED); **0 consensus letters moved**; per-source churn gate: no letter changed

- **Method — `success`, 40/40 both brackets.** Direct browser-header GET, HTTP 200, 184,377 B (mythic-plus) and 172,248 B (raiding). Parsed per `.tierlist` container: each `.tier__tier` block's `.tier__title` letter against its `.tier__entries` `data-original-title` labels. Counts printed and reconciled to the roster shape: **40 rows, 40 unique specs, 0 duplicates, 0 unmatched** per bracket; M+ S4/A13/B19/C4, raid S6/A11/B17/C6. The M+ page's extra dungeon-difficulty tierlist was rejected by **ROSTER MATCH, not position** — its eight labels (King's Rest, Den of Nalorakk, Murder Row, The Blinding Vale, Ruby Life Pools, Voidscar Arena, Temple of Sethraliss, Altar of Fangs) simply fail to map. Era-verified from the BODY: both pages say "Midnight Season 2" in their own prose, the raid page names The Venomous Abyss, Devourer is present (A in both brackets), and the only `12.1` string is a "Patch 12.1 Guides" nav tile → `seasonVerified` stays **s2**. Page own-dates re-read: **5th October 2026** (M+) and **10th August 2026** (raid), matching the stored `published` values and the independent published-evidence receipt exactly. All 80 letters identical to stored after the M+ rebuild the 17:27 run merged, so nothing moved and no source-owned date advanced.
- **Wowhead — `success`, 80/80.** All six pages HTTP 200 (76 KB … 347 KB) by direct browser-header GET; r.jina.ai deliberately not tried. Parsed the documented way: **unescape `\/` across the whole document FIRST**, then take the LARGEST `[tier-list=rows] … [/tier-list]` block (never anchor on `WH.markup.printHtml(` — the raid-Healer decoy), read each `[tier-label]` letter with tolerant whitespace, resolve specs from the `[spec-badge=<spec>-<class>]` kebab slug. Per-page counts: raid 27 / 7 / 6, M+ 27 / 7 / 6 = **80 rows, 80 unique (bracket, spec), 0 unmatched**, with **A+** present on the M+ DPS scale as expected. Era-verified from each page's own `<title>`, all six reading "for Midnight Season 2" → `seasonVerified` **s2**. ⚠️ **`12.1.5` now appears on all six pages and is NOT a 12.1.5 preview** — it is Wowhead's site-wide PTR *environment switcher* ("View the 12.1.5 PTR version of this page", a `/ptr-2/` link) plus a `versions` map in the page JSON. The registered URLs are the LIVE pages, so the refresh-tiers 12.1.5 rule does not fire and no letters were read from a preview. JSON-LD `dateModified` unchanged at 2026-08-31 ×3 / 2026-08-28 / 2026-09-10 / 2026-09-01, agreeing cell-for-cell with the stored `published` values and the published-evidence receipt. 0 letters moved.
- **Icy Veins — `blocked`, day 13.** One bounded GET per page with the full browser header set: **HTTP 403 on all six**, body exactly **5,485 B** each, "Attention Required! | Cloudflare" ×4, `tier-list-entry` count **0**. Matches the independent published-evidence receipt (403 and a null resolved date on all six). Nothing parsed, so all 80 letters, the 2026-09-27 snapshots, the per-page `published` dates and `seasonVerified` are byte-unchanged. r.jina.ai not tried (recorded dead lane).
- **Archon — `blocked`, day 42, letters RETAINED.** Source-health receipt: registered Heroic raid DPS route **403 / "cloudflare-challenge"** (5,743 B), registered M+ DPS route **200 / "human-verification"** (2,516 B). One bounded direct GET each from this session: 403, 5,849 B and 5,915 B, both `<title>Just a moment...</title>` with a `challenge-platform` script and **zero `__NEXT_DATA__`** blocks. No challenge solved, replayed or proxied. All 80 letters stay in the consensus at their 2026-08-25 snapshot under the owner-confirmed 2026-09-05 retention policy. `data/encounter-tiers.json` was READ rather than assumed: still `source: "archon"`, `asOf: "2026-08-17"`, `season: "s1"`, so its 619 rows stay quarantined out of the Fight selector.
- **No `seasonVerified` value changed this run**, so `freeze-season.mjs` had nothing to do (and the publish job runs it regardless). **Per-source churn gate: "no letter changed"** in either bracket of any source, so the new 25/10 limits were nowhere near tripping and no `source_churn_ack` is wanted. Consensus movement: **0 tier moves (0 of ≥2 bands)**.

## 2026-10-06 (nightly) — **Method's M+ list REBUILT upstream (own date 2026-08-13 → 2026-10-05): 12 of its 40 M+ letters moved**, 4 consensus letters with them; Wowhead re-parsed byte-identical; Icy Veins Cloudflare-403 day **13**; Archon wall day **42** (letters RETAINED)

- **Transport recorded, every source.** Direct browser-header `curl` only; no proxy. r.jina.ai was not attempted on any page (recorded dead on `wowhead.com/guide/*` since 2026-08-03 and on murlok, and it is not the page itself).
- **Icy Veins — `blocked`, 13th consecutive day.** One bounded GET per registered page with the full header set: **HTTP 403 on all six**, body exactly 5,488 B each, containing "Attention Required! | Cloudflare" and `cf-error`, `tier-list-entry` count **0**. This agrees with the independent pre-agent `published-evidence/evidence.json` (attemptedAt 2026-10-06T16:57:14Z), which records http 403 and a null resolved date for all six icyveins pages. Nothing parsed, so all 80 stored letters, the 2026-09-27 snapshots, the per-page published dates (2026-08-29 … 2026-09-24) and `seasonVerified: "s2"` are unchanged.
- **Method — `success`, and the M+ list genuinely moved.** Both pages HTTP 200 (M+ 184,377 B, raid 172,248 B). Page self-dates read off the body's own "Last Updated" line: **M+ 5th October 2026** (was 2026-08-13) and **raid 10th August 2026** (unchanged) — both match the collector's resolved dates exactly. Era-verified from the BODY, not the title: the M+ page says "Mythic+ Spec and Dungeon Tier List for Midnight Season 2" and the raid page "the Midnight Season 2 Raid, The Venomous Abyss", so both record `seasonVerified: "s2"`. ⚠️ **The four "Season 3" hits on each page are STALE `<meta>`/OG description tags reading "The War Within Season 3"** — the documented false-positive class; body over title, as the blue-tracker precedent requires. Per-tier row counts printed and reconciled: M+ S 4 / A 13 / B 19 / C 4 = **40**; raid S 6 / A 11 / B 17 / C 6 = **40**. The M+ page's extra four tier blocks are the dungeon-difficulty list and were rejected by ROSTER MATCH, never by position — the 8 unmatched entries are exactly the eight dungeon names (King's Rest, Den of Nalorakk, Murder Row, The Blinding Vale, Ruby Life Pools, Voidscar Arena, Temple of Sethraliss, Altar of Fangs). 0 duplicate (spec, bracket) pairs.
- **The 12 Method M+ moves** (every one adjacent on its S/A/B/C scale, so **0 two-band moves** against `anomaly.maxTwoBandMoves` 6, and 12 total against `maxTotalMoves` 25 — no `anomalyAckProposal` is warranted): Arms Warrior A→S, Elemental Shaman A→S, Beast Mastery Hunter B→A, Unholy DK B→A, Assassination Rogue B→A, Subtlety Rogue B→A, Retribution Paladin B→A, Protection Paladin A→B, Holy Priest C→B, Balance Druid A→B, Destruction Warlock A→B, Devastation Evoker B→C. The list is Tactyks' own and its intro and disclaimers are unchanged; the direction of travel matches the live meta the creator layer reported the same night, which is the honest reason to believe it is upstream movement rather than a parse flip.
- **Consensus effect: 4 letters, all M+, all one band** — Unholy DK A→A+, Subtlety Rogue A→A+, Elemental Shaman A+→S, Destruction Warlock A→B.
- **Wowhead — `success`, 0 of 80 letters moved.** All six pages HTTP 200 (76,499–346,694 B of real decompressed body, not a compressed `size_download`). Parsed by unescaping `\/` → `/` across the whole document FIRST and then locating `[tier-list=rows] … [/tier-list]` — never anchored on `WH.markup.printHtml(`, and the tier label matched with tolerant whitespace. Exactly one tier-list block per page and **27 / 7 / 6 per role in both brackets = 80 rows, 0 unmatched `[spec-badge=…]` slugs, 0 duplicates.** `dateModified` read per page and byte-identical to the collector receipt: raid DPS/Healer/Tank 2026-08-31, M+ DPS 2026-08-28, M+ Healer 2026-09-10, M+ Tank 2026-09-01. All six titles read "Midnight Season 2" → `seasonVerified: "s2"`. The "12.1.5" tokens on every page are sidebar news links; a patch inside the season does not move the season.
- **Archon — `blocked`, 42nd consecutive day.** One bounded GET per representative bracket page: **HTTP 403**, 5,977 B (raid Heroic DPS) and 6,043 B (M+ DPS), both carrying `challenge-platform` and **`__NEXT_DATA__` count 0** — asserted on the payload, not the status code, exactly as the contract label demands. Per the owner-confirmed 2026-09-05 retention policy the last verified S2 letters stay in the consensus with their original 2026-08-25 snapshot dates; nothing was stamped, nothing was removed, and no Warcraft Logs value was substituted. `source-health/evidence.json` from the trusted pre-agent step agrees and adds that the M+ route served the 200/"human-verification" variant to it minutes earlier — i.e. the wall serves both shapes, which is precisely why the `__NEXT_DATA__` assertion exists.
- **`seasonVerified` changed on 0 pages**, so `freeze-season.mjs` had nothing to observe agent-side (publish runs it regardless, between Gate 0 and Gate 1).
- `data/encounter-tiers.json` left alone and re-read rather than assumed: it is still the quarantined S1 archive (`season: "s1"`, `asOf: 2026-08-17`, 0 encounters carrying tier rows), so the Fight selector stays hidden and `fight=` deep links stay inert until Archon's S2 encounter rebuild is reachable.
- ⚠️ **`method published` 2026-08-10 is 57 days old against the 45-day lag threshold** and remains a heartbeat finding — but it is now the RAID page alone; the M+ page cleared it tonight by re-dating to 2026-10-05.

## 2026-10-04 (nightly) — Method + Wowhead fetched and re-parsed clean, **0 of 160 letters moved**; Icy Veins Cloudflare-403 day 12; Archon wall day 40 (letters RETAINED); ⚠️ Method's own page date is now 55 days old and trips the published-gate lag threshold

**Counts printed and reconciled every page, because nothing mechanical catches a shortfall.**
Per source-bracket the roster shape is 27 DPS + 7 healer + 6 tank = **40**.
- **Wowhead — success.** All six pages direct browser-header GET, HTTP 200, **76,478–346,673 B of
  real decompressed body** (never `size_download`, which is the compressed figure). Parsed by
  unescaping `\/` across the whole document FIRST, then locating `[tier-list=rows] … [/tier-list]`,
  then taking the candidate block with the MOST `[spec-badge=]` entries — which is how the known
  1.2 KB decoy on the raid-healer page cannot win without hard-coding anything. Tier labels matched
  with tolerant whitespace. Rows: 27 / 7 / 6 raid and 27 / 7 / 6 M+, **80 total, 0 unmatched slugs,
  0 conflicts**. M+ DPS carries `A+` as expected. Each page's JSON-LD `dateModified` read and
  **unchanged**: raid DPS/Healer/Tank 2026-08-31, M+ DPS 2026-08-28, M+ Healer 2026-09-10, M+ Tank
  2026-09-01 — byte-identical to the independent pre-agent published-evidence receipt, so
  `published` was not touched.
- **Method — success, and the era check mattered tonight.** Both pages HTTP 200 (177,916 B M+,
  171,265 B raid). ⚠️ **Both carry a STALE `og`/`meta` description reading "The War Within
  Season 3"** — four hits each — while the body, Tactyks' author intro and the ranking preamble read
  **"Midnight Season 2"** and name "The Venomous Abyss". Body over meta, the blue-tracker precedent;
  `seasonVerified` stays `s2`. A naive substring count on "Season 3" would have dropped a healthy
  source out of the consensus. 4 tier blocks per bracket, **40 + 40 roster rows, 0 unmatched**, and
  the M+ page's extra tierlist container was rejected **by roster match, never by position**: its 8
  entries are dungeon names (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of
  Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs) and all 8 failed to map. M+ now has an
  S tier (2 specs) — the old "Method's M+ list has no S tier" note is historical.
- **All 160 rows re-applied** through `apply-ratings.mjs` ("applied 160 rating(s) across 40 specs").
  **0 of 160 letters moved**; a semantic diff against `HEAD:data/specs.json` confirms **0 specs with
  a ratings change**. Only the two sources' fetch `snapshot` advanced to 2026-10-04.
- **Icy Veins — blocked, day 12.** One bounded GET per registered page with the full header set:
  **HTTP 403 "Attention Required! | Cloudflare" on all six**, 5,488-byte bodies of identical length,
  zero tier-list markup. Agrees exactly with the pre-agent published-evidence receipt (`http 403`,
  `resolved: null`, all six). All 80 letters, the 2026-09-27 snapshots, the per-page `published`
  dates and `seasonVerified` left untouched. r.jina.ai not tried — recorded dead lane.
- **Archon — blocked, day 40.** One bounded GET per representative route: raid **403 "Just a
  moment..."** (5,956 B, `__NEXT_DATA__` count **0**), M+ the same (6,022 B). Asserted on
  `__NEXT_DATA__` presence, not the status code, exactly as the standing note requires. Matches the
  pre-agent source-health receipt (raid 403 `cloudflare-challenge`; M+ **HTTP 200**
  `human-verification` — the shape that would fool a status-only check). No challenge solved,
  replayed or automated past. **Owner retention policy (2026-09-05) applied: the last verified S2
  letters still feed the consensus**, so the consensus is still four sources and nothing was
  removed, dropped or back-filled from Warcraft Logs.
- **`data/encounter-tiers.json` read rather than assumed:** `season: "s1"`, `asOf: 2026-08-17`, still
  the S1 encounters — the quarantined archive, Fight selector still hidden, stamp NOT touched.

**No `seasonVerified` value changed anywhere this run, so `freeze-season.mjs` had nothing to do**
(publish runs it between Gate 0 and Gate 1 regardless).

⚠️ **New heartbeat item worth an owner eye:** `check-refresh --age` now reports *"method … page
self-date 2026-08-10 is 55 days old (max 45d) — the page has likely rebuilt unseen, or upstream went
quiet; check it"*. Checked tonight: the page is genuinely serving its own 10 August build with
unchanged letters, so this is upstream going quiet rather than a parse we are missing — but it is the
first time Method has crossed that threshold, and the raid list has now been static for eight weeks.

## 2026-10-03 (nightly) — Method + Wowhead refetched and reparsed, **0 of 160 letters moved**; Icy Veins walled **day 11** from CI; Archon walled **day 39**; **0 consensus letters moved**

**Reachable (2 of 4 sources).**
- **Method** — both pages HTTP 200 by direct browser-header GET, 177,635 B (mythic-plus) /
  170,984 B (raiding). Parsed by **ROSTER MATCH over every `.tierlist` container**, never by
  position: **6** containers on the M+ page and **4** on the raid page, exactly one of each mapping
  to the roster at **40/40 distinct specs** with **0 non-roster titles inside it**, and the
  8-entry dungeon-difficulty container (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding
  Vale, Den of Nalorakk, Murder Row …) correctly mapping to **0** roster specs and being rejected.
  Tier counts: raid **S6 / A11 / B17 / C6**, M+ **S2 / A13 / B21 / C4**. Page-stated dates re-read
  and unchanged: "Last Updated 13th August 2026" (M+), "10th August 2026" (raid).
- **Wowhead** — all six pages HTTP 200, 76,503–346,698 B. Recipe followed in order: unescape
  `\/` across the WHOLE document first, then `[tier-list=rows] … [/tier-list]`, then
  `[tier-label …]…[/tier-label]` with **tolerant whitespace** and `[spec-badge=<spec>-<class>]`
  kebab slugs. Exactly **one** tier-list block per page this run (no decoy on the raid-healer
  page), **0 unmatched badges** anywhere. Per-page row counts printed and reconciled to the roster
  shape: raid **27 + 7 + 6 = 80**, M+ **27 + 7 + 6 = 80**. JSON-LD `dateModified` re-read per page
  → 2026-08-31 ×3, 2026-08-28, 2026-09-10, 2026-09-01, all unchanged and all **matching the
  independent pre-agent published-evidence receipt exactly**.
- **160 of 160 letters byte-identical to stored, 0 moves.** Expected: both outlets' own update
  dates are weeks old and did not move. Only the capture-date `snapshot` advances to 2026-10-03;
  `published` stays each page's own date.

**Era verification — and the "patch inside the season" rule got its first real exercise.**
All eight reachable pages still title themselves **Midnight Season 2** (the Wowhead raid-healer
page still with its **double space**, "Midnight  Season 2", which is exactly why the check is not
an exact-spacing literal), Devourer present in both DPS lists, `seasonVerified` **s2** on all
eight — unchanged. Two false-positive traps checked rather than assumed: every Wowhead page now
contains the string **12.1.5** (sidebar/news furniture, not the ranking era — and a mid-season
patch does not move `PHASES.liveSeason` anyway), and the two **"Season 3"** hits on the M+ DPS and
M+ tank pages are **2024-dated user comments**, not ranking body. No `seasonVerified` value
changed, so `node src/freeze-season.mjs` was still run and reported "8 source/bracket pairs still
describe the live season — nothing to freeze there".

**Walled (2 of 4).**
- **Icy Veins, day 11 from CI.** One bounded GET per page with the full header set → HTTP **403**
  "Attention Required! | Cloudflare" on all six, **5,485 B on every single page** (identical byte
  length, which is itself the interstitial's fingerprint). Agrees with the pre-agent
  published-evidence receipt exactly (403, `dateModified` null, `lastUpdated` null, `resolved`
  null, six pages). Nothing parsed → nothing written; snapshot holds at 2026-09-27 from the
  residential local run.
- **Archon, day 39.** All **twelve** registered routes probed once each → HTTP **403**
  "Just a moment…", 6,054–6,159 B. The pre-agent source-health receipt shows the two shapes side
  by side: the raid route 403/`cloudflare-challenge`, the M+ route **HTTP 200** with
  `bodySignature: human-verification` — a 200 that is a challenge page, which is precisely why
  availability is judged on body signature and not on status code. No proxy, no r.jina.ai, no
  challenge solve or replay. All 80 stored letters retained and still feeding both brackets'
  consensus (owner-confirmed 2026-09-05: an outage does not remove a source).
- `data/encounter-tiers.json` read directly rather than described: still `season: "s1"`,
  `asOf 2026-08-17`, 9 encounters / 619 rows — the quarantined S1 archive, Fight selector still
  hidden by design. No stamp written, because nothing was observed.

**Consensus:** unchanged — 0 of 80 letters moved, and `check-refresh --manifest` reports
"movement vs 2026-10-02: 0 tier moves (0 of ≥2 bands)". Transport used, for the record: direct
`curl -L --compressed` with the full browser header set on every source; no proxy anywhere.

## 2026-10-02 (nightly) — Method + Wowhead refetched and reparsed, **0 of 160 letters moved**; Icy Veins walled **day 10** from CI; Archon walled **day 38**; **0 consensus letters moved**

**Method — success.** Both registered pages by direct browser-header GET, HTTP 200, **170,984 B**
(raiding) and **177,635 B** (mythic-plus) decoded. Era-verified from the ranking BODY: the
`og:description` on both still carries the stale "The War Within Season 3" boilerplate while the
bodies read "Midnight Season 2 Raid, The Venomous Abyss" and "Mythic+ content and dungeon
difficulty in Midnight Season 2" (Tactyks' byline) — body over metadata, the blue-tracker
precedent — so `seasonVerified` stays **s2** on both pages and nothing was frozen.
Parsed from `tier__tier` / `tier__title` / `tier__entries`, spec read off `data-original-title`
and looked up **WHOLE** against the roster: **3** tierlist containers on raid and **5** on M+,
**40 roster rows each** (27 DPS + 7 healer + 6 tank; Devourer present in both — it lives in an
attribute, so a tag-stripped text search will report it missing, which is not an era failure),
and **8 distinct non-roster labels rejected by ROSTER MATCH rather than position** (King's Rest,
Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of
Sethraliss, Altar of Fangs — the dungeon-difficulty blocks). Tier histogram raid S6/A11/B17/C6,
M+ S2/A13/B21/C4. **All 80 letters identical to stored.** Pages' own "Last Updated" lines re-read
unchanged (raid **10th August 2026**, M+ **13th August 2026**), agreeing with the pre-agent
published receipt, so `published` is untouched and only `snapshot` advances to 2026-10-02.

**Wowhead — success.** All six pages by direct browser-header GET, HTTP 200, **76,505–346,700 B**
decoded; r.jina.ai not attempted (dead on `/guide/*` since 2026-08-03). Unescaped `\/` → `/`
across the whole document FIRST, then matched `[tier-list=rows] … [/tier-list]` with tolerant
whitespace on the tier labels, and selected the block with the most roster `[spec-badge=…]` hits
rather than anchoring on `WH.markup.printHtml(` (the raid-healer decoy). **Per-page counts
printed and reconciled: 27 / 7 / 6 raid and 27 / 7 / 6 M+ = 80**, 0 rejected slugs, 0 role
mismatches, `A+` present on the M+ DPS scale. **All 80 letters identical to stored.** Each page's
own JSON-LD `dateModified` re-read and byte-equal to the independent pre-agent receipt: raid
**2026-08-31** ×3, M+ DPS **2026-08-28**, M+ healer **2026-09-10**, M+ tank **2026-09-01**.
Note the three `12.1.5` hits on every page: they are the env-switcher links to the separate
`wowhead.com/ptr-2/…` preview pages, **not** a 12.1.5 ranking on the registered live page — so
the new "a patch inside the season does not change the season" rule is satisfied trivially and
`seasonVerified` stays s2.

**Icy Veins — blocked, day 10.** One bounded GET per registered page with the full browser header
set: HTTP **403** "Attention Required! | Cloudflare" on all six (1,892–1,894 B). Matches the
independent pre-agent `published-evidence` receipt exactly (403 / `dateModified` null /
`lastUpdated` null / `resolved` null on all six). No proxy, no challenge solve, no replay.
Nothing parsed, nothing written: snapshot stays **2026-09-27**, every `published` date untouched,
no `seasonVerified` changed, and the stored 80 letters keep feeding both brackets (owner-confirmed
retention — an outage does not remove a source).

**Archon — blocked, day 38.** All **eleven** archon.gg routes probed once each: every one HTTP
**403** with the interactive "Just a moment…" body (3,410–3,482 B) and **`__NEXT_DATA__` count
ZERO**, which is the assertion that matters rather than the status code. Corroborated by
`source-health/evidence.json`, where the M+ route returns the **200-shaped** human-verification
page (2,516 B) — exactly the shape a status-only check would have recorded as success. Nothing
merged, no date advanced, nothing backfilled from Warcraft Logs (hard rule 3).

**Consensus effect: none.** `seasonVerified` unchanged everywhere, so `freeze-season` had nothing
to consider (it runs publish-side anyway); 0 of 80 consensus letters moved, and
`check-refresh --manifest` reports **0 tier moves** against today's baseline.

## 2026-10-01 (nightly) — Method + Wowhead refetched and reparsed, **0 of 160 letters moved**; Icy Veins walled (day 9 from CI); Archon walled day 37; **0 consensus letters moved**

**Method — success.** Both registered pages by direct browser-header GET, HTTP 200, **162,876 B**
(raiding) and **169,525 B** (mythic-plus) decoded. Era-verified from the body, not the metadata:
the `og:description` on both pages still reads *"The War Within Season 3"* (stale boilerplate)
while the ranking body reads *"how each spec ranks for Raiding content in the Midnight Season 2
Raid, The Venomous Abyss"* and *"Method's Mythic+ Spec and Dungeon Tier List for Midnight
Season 2"* — body over title/meta, the blue-tracker precedent, so `seasonVerified: "s2"` is
unchanged on both. The pages' own dates are **Last Updated 10th August 2026** (raid) and **13th
August 2026** (M+), exactly matching the stored `published` values and the independent
pre-agent published-evidence receipt, so `published` was not touched; `snapshot` → 2026-10-01.
Parse: one roster-matching `tierlist` block per page. **The "Mythic+ Dungeon Difficulty Tier
List" block was rejected by ROSTER MATCH** (0 of its names map), never by position — the
documented rule, since "take the first" and "take container[2]" have each failed a page
rebuild. Counts printed and reconciled against the 27 DPS + 7 healer + 6 tank = 40 shape:
raid **S 6 / A 11 / B 17 / C 6 = 40**, M+ **S 2 / A 13 / B 21 / C 4 = 40**, 0 unmatched rows.
**0 of 80 letters moved.**

**Wowhead — success.** All six registered pages by direct browser-header GET, HTTP 200,
76,480–346,401 B decoded; no r.jina.ai (dead on `/guide/*` since 2026-08-03). Unescaped
`\/` → `/` across the whole document **first**, then searched for `[tier-list=rows] …
[/tier-list]`, with tolerant whitespace on `[tier-label …]` (Wowhead writes a trailing space
inside the tag). Exactly **one** such block per page this run — no decoy, the raid-healer
two-call trap did not fire — and per-page counts printed: raid 27/7/6, M+ 27/7/6, **80 rows,
0 unmatched, 0 duplicates**. Spec identity came from the `[spec-badge=<spec>-<class>]` kebab
slug, which sidesteps the two-word-class split problem entirely. JSON-LD `dateModified`:
raid DPS 2026-08-31, raid Healer 2026-08-31, raid Tank 2026-08-31, M+ DPS 2026-08-28, M+ Healer
2026-09-10, M+ Tank 2026-09-01 — byte-identical to the pre-agent published-evidence receipt
and to the stored `published`, so those stayed put; `snapshot` → 2026-10-01. Every page title
self-identifies Midnight Season 2 (the stray "Season 1/3/4" hits are changelog rows).
**0 of 80 letters moved.**

**Icy Veins — BLOCKED (day 9 from CI).** All six registered URLs fetched once each with the
full browser header set (UA + Accept + Accept-Language + Accept-Encoding + sec-ch-ua +
Sec-Fetch-* + Upgrade-Insecure-Requests + no-cache): **HTTP 403** with the
`<title>Attention Required! | Cloudflare</title>` interstitial on all six, 5,487-byte bodies.
One retry after a pause with a different UA and a Google referer returned the same
interstitial at 1,894 B. This agrees exactly with the independent pre-agent
published-evidence receipt (http 403, `dateModified: null`, `resolved: null`, all six pages).
No proxy, no challenge solve, no replay; r.jina.ai was not attempted. Nothing parsed, so
nothing written: `snapshot` stays **2026-09-27** (set by the 09-27 residential local run),
every page-stated `published` date is untouched, and no `seasonVerified` value changed. The
stored 80 Icy Veins letters stand and keep feeding both brackets' consensus.

**Archon — BLOCKED (day 37).** All **11** archon.gg routes probed once each with the same full
header set — the six registered letter pages (raid heroic all-bosses × 3 roles, M+ +10
all-dungeons this-week × 3 roles), the three ancillary Mythic all-bosses pages, plus
`raid/mythic/nekzali` and `mythic-plus/10/altar-of-fangs/this-week`. Every one returned
**HTTP 403** with Cloudflare's interactive `Just a moment...` / `challenge-platform` body
(3,435–3,507 B); no `__NEXT_DATA__` on any of them. The independent pre-agent
`source-health/evidence.json` recorded the same wall from the other side: raid
`httpStatus 403 / cloudflare-challenge`, M+ `httpStatus 200 / human-verification`. No
challenge was solved, replayed or bypassed, and availability was not treated as data.
**Retention (owner-confirmed 2026-09-05):** Archon's last verified S2 letters stay in the
consensus with their original 2026-08-25 dates — an outage does not remove a source.

**`data/encounter-tiers.json` read directly rather than assumed:** still `season: "s1"`,
`asOf: "2026-08-17"`. The S1 archive stays quarantined and the Fight selector stays hidden
(`season ≠ PHASES.liveSeason`); no S2 encounter observation landed, so neither the stamp nor
any encounter `name` was touched.

**The `method-published` heartbeat key is firing, and this run establishes WHY.** `check-refresh --age`
now reports the Method raid page self-date 2026-08-10 as 52 days old against its 45-day threshold,
with the gate advising "the page has likely rebuilt unseen, or upstream went quiet". It is the
second: the pages WERE fetched fresh today, their own Last Updated lines still read 10th / 13th
August 2026, and all 80 letters are byte-identical to stored. So nothing rebuilt behind us and no
carried-forward `published` value contradicts the page — Method has simply not retouched its
Season 2 tier lists in seven weeks. Nothing to merge, nothing to re-date; the red is the honest
signal and clearing it would mean stamping a date the page does not claim.

**0 `seasonVerified` values changed this run**, so `freeze-season.mjs` had nothing to freeze
agent-side (the publish job runs it between Gate 0 and Gate 1 regardless, with the
`fetch-depth: 0` history it needs). `apply-ratings.mjs` was still run on the full 160-row
file per the no-staleness-gate policy — "✓ applied 160 rating(s) across 40 specs" — and a
deep comparison of every spec's `ratings.raid` / `ratings.mplus` object against
`git show HEAD:data/specs.json` reports **0 differences**. **0 consensus letters moved.**

## 2026-09-30 (nightly) — Method + Wowhead refetched and reparsed, **0 of 160 letters moved**; Icy Veins walled (day 8 from CI); Archon walled day 36; **0 consensus letters moved**

- **Method — SUCCESS, 80/80 rows, 0 moved.** Both registered pages HTTP 200 by direct browser-header GET (163,420 B raid / 170,071 B mplus, decoded). Era read from the **BODY, not the meta tags**: the og/twitter description boilerplate still says "The War Within Season 3" (4 hits per page) while the ranking body reads "Midnight Season 2" and, on raid, "Venomous Abyss"; Devourer present in both. **Body over title, so `seasonVerified` stays `s2`** — reading the og tag would have dropped Method out of BOTH brackets' consensus. Zero "12.1.5" hits on either page, so neither is a pre-launch preview; and per the 2026-09-25 rule a live list retitled "12.1.5" would still be `s2`, because `PHASES.liveSeason` does not move for a mid-season patch. Parse: split on `<div class="tier__tier`, letter from the sibling `tier__title`, entries bounded to THAT block's `tier__entries`, resolved from `data-original-title` looked up WHOLE against the roster. Counts printed before merging — raid **40** (S 6 / A 11 / B 17 / C 6), mplus **40** (S 2 / A 13 / B 21 / C 4), each 27 DPS / 7 healer / 6 tank, **0 unmatched, 0 duplicates**. The mplus page's eight extra `tier__entries` names are the dungeon-difficulty block and were rejected **by ROSTER MATCH, never by position** (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs). "Last Updated" re-read live: **10th August 2026** (raid), **13th August 2026** (mplus) — unchanged, matching the registry and the pre-agent published-evidence receipt, so `published` untouched and only `snapshot` advances to 2026-09-30.
- **Wowhead — SUCCESS, 80/80 rows, 0 moved.** All six pages HTTP 200 by direct browser-header GET, 76,469–346,401 B decoded; **no r.jina.ai** (dead on `/guide/*` since 2026-08-03). Recipe in order: unescape `\/` → `/` across the whole document FIRST, then take the `[tier-list=rows] … [/tier-list]` block — **exactly ONE per page tonight**, so there was no decoy `printHtml` to pick between — match `[tier-label …]<TIER>[/tier-label]` with **tolerant whitespace**, resolve specs from the `[spec-badge=<spec>-<class>]` kebab slug (which sidesteps the two-word-class split entirely). Per-page counts reconciled against the roster shape BEFORE merging: raid DPS **27** (A 8 / B 14 / C 5), raid Healer **7** (S 1 / A 3 / B 3), raid Tank **6** (S 1 / A 3 / B 2), mplus DPS **27** (S 1 / **A+ 2** / A 7 / B 14 / C 3), mplus Healer **7** (S 1 / A 3 / B 1 / C 2), mplus Tank **6** (S 1 / A 3 / B 2) = **80**, 0 unmatched slugs, 0 duplicates, Devourer present in both DPS lists. Era: every `h1` reads "for Midnight Season 2". The **3 "12.1.5" hits per page were inspected rather than assumed**: they are the site's data-tree switcher — the live tree is `"10":"12.1.5"` in the version map plus a `data-env="ptr2"` link titled "View the 12.1.5 PTR version of this page" pointing at a separate `/ptr-2/` URL — and the Season 1 / Season 3 hits are retrospective prose and user comments. `seasonVerified` stays `s2` on all six. JSON-LD `dateModified` re-read per page: raid **2026-08-31** ×3, mplus DPS **2026-08-28**, mplus Healer **2026-09-10**, mplus Tank **2026-09-01** — all unchanged, all matching both the stored `published` values and the pre-agent receipt, so only `snapshot` advances.
- **Icy Veins — BLOCKED from CI, eighth consecutive night.** One bounded GET per page with the full browser header set: **HTTP 403 with the "Attention Required! | Cloudflare" interstitial on all six** (5,487-byte bodies), and one paced retry of the raid-DPS page returned the same interstitial at 1,892 bytes. Matches the independent pre-agent published-evidence receipt exactly (`http 403`, `resolved: null`, all six). **No proxy, no challenge solve, no replay**; r.jina.ai not attempted. Nothing parsed ⇒ nothing written: `snapshot` stays **2026-09-27** (the 09-27 residential local run), every `published` untouched, no `seasonVerified` changed. The stored 80 IV letters stand and keep feeding both brackets' consensus, which is why the grid still reads a 3-source consensus rather than shrinking.
- **Archon — BLOCKED, day 36.** All nine routes probed once each with the full header set (six registered tier routes — dps/healer/tank raid **Heroic** all-bosses and dps/healer/tank `mythic-plus/10/all-dungeons/this-week` — plus the three raid Mythic all-bosses ancillary pages): **HTTP 403, `<title>Just a moment...</title>`, 5,530–5,626 B, and `__NEXT_DATA__` ABSENT on every one**, so neither the raid **throughput** tierList nor the M+ **score** tierList existed to read. Agrees with the pre-agent source-health receipt (raid route `cloudflare-challenge` at 403; M+ route `human-verification` at **HTTP 200** — a 200 that is still a wall, which is the reason that receipt exists). Per the owner-confirmed 2026-09-05 retention rule Archon's last verified S2 letters stay in the consensus at their own **2026-08-25** snapshot: an outage does not remove a source.
- **`data/encounter-tiers.json` READ, not written** — still `season: "s1"` at `asOf 2026-08-17`, 619 tier rows, so the Fight selector stays hidden and the S1 archive stays quarantined. Committed encounter `name` values untouched.
- **No `seasonVerified` value changed anywhere this run**, so `freeze-season.mjs` has nothing to freeze (it runs in the publish job regardless). **0 consensus letters moved** — measured by recomputing `consensusFor` for all 80 cells against `git show HEAD:data/specs.json` — so the anomaly gate saw 0 moves of a 25 limit and no `anomalyAckProposal` was written.

## 2026-09-29 (nightly) — Method + Wowhead refetched and reparsed, **0 of 160 letters moved**; Icy Veins walled (day 7 from CI); Archon walled day 35

- **Method `success`, 40 + 40 = 80 rows, 0 moved.** Both pages HTTP 200, 163,420 B (raid) / 170,071 B (mplus) decoded — note `--compressed` reports the COMPRESSED size (28,517 / 29,159), so judge bodies off the file on disk, never `size_download`. Parse: split on `<div class="tier__tier`, letter from the sibling `tier__title`, entries bounded to `tier__entries`, spec resolved from `data-original-title` looked up WHOLE — raid **S6/A11/B17/C6**, mplus **S2/A13/B21/C4**, 27/7/6 per bracket, 0 unmatched, 0 duplicates. The mplus page's four EXTRA `tier__tier` blocks are the dungeon-difficulty list and were rejected by **ROSTER MATCH, never by position** (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs). ⚠️ **Era from the BODY, still a live trap:** 4 `Season 3` hits per page, every one inside the stale `og:`/`twitter:`/`meta` description "…for Raiding content in The War Within Season 3", against a body reading "Midnight Season 2 Raid, The Venomous Abyss" / "Midnight Season 2" — body over title, `seasonVerified` stays `s2`; the og tag would have dropped Method from BOTH brackets. Zero `12.1.5` hits on either page. "Last Updated" 10th August (raid) / 13th August (mplus), unchanged and matching the published-evidence receipt. Snapshot → 2026-09-29.
- **Wowhead `success`, 80 rows, 0 moved.** Six pages HTTP 200, 76,494–346,675 B decoded. Recipe held exactly: unescape `\/` → `/` document-wide FIRST, then `[tier-list=rows] … [/tier-list]` (**exactly one block per page — no decoy**), tolerant-whitespace `[tier-label]`, specs from `[spec-badge=<spec>-<class>]` slugs. Counts reconciled against the roster shape: raid DPS **A8/B14/C5 = 27**, raid Healer **S1/A3/B3 = 7**, raid Tank **S1/A3/B2 = 6**, mplus DPS **S1/A+2/A7/B14/C3 = 27**, mplus Healer **S1/A3/B1/C2 = 7**, mplus Tank **S1/A3/B2 = 6**; 0 unmatched slugs; Devourer DH present in both DPS lists. Per-page JSON-LD `dateModified`: raid 2026-08-31 ×3, mplus DPS 08-28, Healer 09-10, Tank 09-01 — all unchanged, all matching stored `published` and the receipt. Snapshot → 2026-09-29.
  - The **3 `12.1.5` hits per page are again the data-tree switcher**, verified in context this run: the environment list literally reads `"2":"12.1.0" … "10":"12.1.5"` and the anchor says "View the 12.1.5 PTR version of this page" pointing at `/ptr-2/…`. Live tree is 12.1.0. The `Season 1` hits (2–15 per page) are retrospective prose and the 4 `Season 3` hits on mplus DPS are user comments. `seasonVerified` stays `s2` on all six.
- **Icy Veins `blocked`, seventh consecutive walled night from CI.** One bounded GET per registered page with the full browser header set: HTTP **403** on all six. Body size varied within the same outcome — the raid-DPS page returned a **5,486 B** "Attention Required! | Cloudflare" interstitial on a UA-only probe and a **1,893 B** variant with the full header set, and the other five all came back 1,892–1,894 B. **Size alone is not a diagnosis** (the 09-26 entry made the same point in reverse). Agrees exactly with the independent pre-agent published-evidence receipt (http 403, `resolved: null`, all six). No proxy, no challenge solve, no replay. Nothing parsed ⇒ `snapshot` stays **2026-09-27** (the 09-27 residential local run) and every page-stated `published` date is untouched; the stored 80 letters keep feeding the consensus.
- **Archon `blocked`, day 35.** All six registered tier routes **plus** the ancillary Mythic aggregate probed once each: HTTP **403**, `<title>Just a moment...</title>`, 3,435–3,508 B, and **`__NEXT_DATA__` absent on all seven** — so neither the raid **throughput** tierList nor the M+ **score** tierList existed to read, and the survivability tierList with them. Agrees with the pre-agent source-health receipt (raid `cloudflare-challenge` at 403; M+ `human-verification` at **HTTP 200** — the shape that makes "a 200 is not freshness" literal, and note the M+ route answers 200 to the collector and 403 to us; both are walls). Per the owner-confirmed 2026-09-05 retention rule its last verified S2 letters stay in the consensus at their own 2026-08-25 snapshot. `data/encounter-tiers.json` READ, not written: still `season: "s1"` at asOf 2026-08-17 (9 raid + 8 mplus encounters, 619 tier rows) ⇒ the Fight selector stays hidden and the S1 archive stays quarantined.
- **No `seasonVerified` value changed this run**, so `freeze-season.mjs` has nothing to freeze (publish runs it regardless). Consensus composition unchanged; `check-refresh --manifest` reports **0 tier moves**.

## 2026-09-28 (nightly) — Method + Wowhead refetched and reparsed, **0 of 160 letters moved**; Icy Veins walled again from CI; Archon walled day 34

- **Icy Veins `blocked`.** One bounded direct GET per registered page with the full browser header set: HTTP **403** with an identical **5,487-byte** Cloudflare interstitial ("Attention Required! | Cloudflare", cf-error blocks, Ray ID) on all six URLs. Matches the independent pre-agent published-evidence receipt exactly (http 403, `resolved: null`, all six). No proxy, no challenge solve, no replay. Nothing parsed ⇒ `snapshot` stays **2026-09-27** (set by yesterday's residential local run) and the page-stated `published` dates are untouched. The 09-27 log's transport note still stands: from a residential IP **curl** works where Node's `fetch` does not — the block keys on the client fingerprint as well as the IP — but neither works from this runner.
- **Method `success`, 40 + 40 = 80 rows, 0 moved.** Both pages HTTP 200 (163,409 B raid / 170,060 B mplus). ⚠️ **Era-verify from the BODY, not the meta tags — this page is a live trap.** `og:description` still says "**The War Within Season 3**" while the ranking body says "the **Midnight Season 2** Raid, The Venomous Abyss" and "Method's Mythic+ Spec and Dungeon Tier List for **Midnight Season 2**". Body over title (the blue-tracker precedent) ⇒ `seasonVerified` stays `"s2"` on both pages; reading the og tag would have dropped Method out of the consensus for both brackets. Page "Last Updated" lines 10th August (raid) / 13th August (mplus), unchanged and matching the published-evidence receipt. Parse: split on `<div class="tier__tier`, bound entries to `class="tier__entries"`, read `data-original-title` — raid **S6/A11/B17/C6**, mplus **S2/A13/B21/C4**. The four extra mplus blocks are the **dungeon-difficulty** list and were rejected by **roster match**, never by position (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs). Snapshot → 2026-09-28.
- **Wowhead `success`, 80 rows, 0 moved.** Six pages HTTP 200, 76,379-346,383 B. Recipe held: unescape `\/` → `/` across the whole document FIRST, then take `[tier-list=rows] … [/tier-list]` (**exactly one block per page this run — no decoy**), read `[tier-label]…[/tier-label]` with tolerant whitespace, resolve specs from the `[spec-badge=<spec>-<class>]` kebab slug. Counts reconciled against the roster shape: raid DPS **A8/B14/C5 = 27**, raid Healer **S1/A3/B3 = 7**, raid Tank **S1/A3/B2 = 6**, mplus DPS **S1/A+2/A7/B14/C3 = 27**, mplus Healer **S1/A3/B1/C2 = 7**, mplus Tank **S1/A3/B2 = 6**; 0 unmatched slugs. Devourer DH present in both DPS lists.
- ⚠️ **New false-positive shape on Wowhead: "12.1.5" now appears on every live tier page and it is NOT content.** It is the site's data-tree environment switcher — the live tree is `12.1.0` and 12.1.5 is a separate `/ptr-2/` URL ("View the 12.1.5 PTR version of this page"). The h1/title still read "for Midnight Season 2", so `seasonVerified` stays `"s2"`. A substring check for the patch number would have mis-flagged all six pages as a 12.1.5 preview and skipped them.
- Per-page JSON-LD `dateModified`: raid 2026-08-31 x3, mplus DPS 2026-08-28, Healer 2026-09-10, Tank 2026-09-01 — all unchanged and all matching the stored `published` and the pre-agent receipt. Snapshot → 2026-09-28.
- **Archon `blocked`, day 34.** Both representative routes probed once each: HTTP 403 with a "Just a moment..." / challenge-platform body (6,191 / 6,235 B), no `__NEXT_DATA__`, so neither the raid **throughput** tierList nor the M+ **score** tierList could be read. Agrees with the pre-agent source-health receipt (raid cloudflare-challenge 403; mplus human-verification at HTTP 200 — note the M+ route returns 200 to the collector and 403 to us, and both are walls). Per the owner-confirmed retention rule its last verified S2 letters (2026-08-25) stay in the consensus with their original dates. `data/encounter-tiers.json` untouched, still `season: "s1"` at 2026-08-17 ⇒ the Fight selector stays hidden.
- **No `seasonVerified` value changed this run**, so `freeze-season.mjs` has nothing to do (it is the publish job's step regardless). Consensus composition unchanged; `check-refresh --manifest` reports **0 tier moves**.

## 2026-09-27 (local, scheduled) — **Icy Veins fetched from a residential IP after four walled nights: 80/80 rows, 23 IV cells moved, 7 consensus letters moved**; run AFTER today's nightly (`af66dfd`)

- **Scope: residential-only catch-up.** The nightly fired 15:16Z and published `af66dfd` with Icy Veins `blocked` (Cloudflare 403 on all six pages, its fifth night since 09-23). The same six URLs return HTTP 200 from this residential IP by **curl** with a browser UA + Accept + Accept-Language. ⚠️ **Transport note:** Node's built-in `fetch` with identical headers got the 403 "Attention Required" page (5,486 B) on all six, so the block keys on the client fingerprint and not just the IP. Use curl for local IV catch-up. No proxy, no challenge solved.
- **Parse:** bounded to each page's single `<table class="tier-list">`, one `<tr>` at a time. The tier comes from the row's first `<td>` and the spec from the FIRST `alt=` after each `class="tier-list-entry"`, looked up WHOLE against the roster with the role checked. Fetched twice (14:07Z and 15:59Z) with identical results. Counts: raid DPS 27 (S 2 / A+ 8 / A 7 / B 8 / C 2), healer 7 (S 3 / A 3 / B 1), tank 6 (S 2 / A 3 / B 1); M+ DPS 27 (S+ 4 / S 4 / A+ 6 / A 6 / B 6 / C 1), healer 7 (S 2 / A+ 1 / A 2 / B 2), tank 6 (S 1 / A+ 2 / A 3). **80 rows, 0 unmatched, 0 duplicates**, every letter in the icyveins scale.
- **Era:** all six bodies are Season 2 (34–55 "Season 2" hits, Venomous Abyss named, Devourer on the DPS pages). The raid-healer page still TITLES itself "(Patch 12.0.7 / Midnight)", the known stale label; body over title. No page is a 12.1.5 preview. `seasonVerified` stays `s2` on all six and no value changed, so `freeze-season.mjs` printed "nothing to freeze".
- **Page dates (JSON-LD `dateModified` via `extractDateModified`):** raid DPS **09-24** (was 08-30), raid healer 09-01 (unchanged), raid tank 08-29 (unchanged), M+ DPS **09-23** (was 08-30; its body byline says 24th, and dateModified wins per the published-gate precedence), M+ healer **09-24**, M+ tank **09-24** (both were 08-30). `snapshot` 2026-09-27 on all six.
- **23 IV cells moved** (IV's 09-23/24 update): raid Unholy DK B→S, Arcane S→A+, Arms S→A+, Elemental A+→A, Destruction A+→A, Subtlety S→A, Outlaw A+→B, Survival A→B, Augmentation C→B, Fire A→B, Devourer A→B, Enhancement A→B, Fury A→C, BM A→C; M+ Assassination A+→S+, Feral A+→S, Demonology S+→A+, Marksmanship B→A, Affliction A→B, Destruction A→B, Mistweaver A+→A, Resto Druid B→A+, Holy Priest A→B.
- **7 consensus letters moved:** raid Unholy DK B→A, Devourer A→B, BM Hunter B→C, Fire Mage B→C, Destruction A+→A; M+ Resto Druid C→B, Marksmanship B→A.
- **Archon:** one residential probe returned a 200 "Human Verification" page (1,288 B, no `__NEXT_DATA__`). Walled day 33; nothing written.
- **Manifest left alone** (partial run). Its `icyveins` row still reads `blocked` / 09-22 for today's nightly. That is the bounded one-day drift the local-run skill accepts, and tomorrow's nightly rewrites it.

## 2026-09-27 (nightly) — Method + Wowhead fetched live, **160 cells, 0 moves**; Icy Veins and Archon both walled (Archon day 33)

- **Method `success`.** Both pages by direct browser-header GET, HTTP 200, 163,420 B (raid) / 170,071 B (M+). Parsed `tier__tier <letter>-tier` blocks, each entry resolved from its `data-original-title` "Spec Class" string looked up WHOLE: raid S6/A11/B17/C6 = **40/40**, M+ S2/A13/B21/C4 = **40/40**, 0 unmatched, 0 duplicates. The M+ page's four EXTRA tierlist blocks are the dungeon-difficulty ones and were rejected by **roster match, never position** — the eight dropped labels are King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs.
  - ⚠️ **Era-verify from the BODY on this source, and expect the meta tags to lie.** `Season 3` matches 4x on each page and every hit is a stale `og:`/`twitter:` description reading "The War Within Season 3"; the ranking body says "Midnight Season 2" and the raid page names The Venomous Abyss. Body over title (the blue-tracker precedent) ⇒ `seasonVerified: s2`. A count-based era check would have dropped both pages out of the consensus.
  - Page-stated dates re-read and unchanged: raid "Last Updated 10th August 2026", M+ 13th August — byte-identical to the independent published-evidence receipt.
- **Wowhead `success`.** All six pages HTTP 200, 76,399-346,574 B, direct browser headers (no r.jina.ai — dead on `/guide/*`). Unescaped `\/` document-wide FIRST, then one `[tier-list=rows]` block per page (exactly one each tonight, so no decoy `printHtml` to pick between), tolerant-whitespace `[tier-label …]` match, `[spec-badge=<spec>-<class>]` slugs. **Counts printed and reconciled: 27/7/6 + 27/7/6 = 80**, 0 non-roster badges. M+ DPS carries the A+ band as expected. `dateModified` re-read per page into `published`: 08-31 x3 raid, 08-28 / 09-10 / 09-01 M+.
  - The `12.1.5` hits on every Wowhead page are the site's **data-tree switcher** ("Live PTR 12.1.0 PTR 12.1.5") and the `Season 3` hits on M+ DPS are **user comments** about Dragonflight. Neither is a season signal; `seasonVerified` stays s2 on all six.
- **0 of 160 letters moved**, so no `seasonVerified` changed and `freeze-season.mjs` had nothing to be run for (it is publish-side in a nightly anyway).
- **Icy Veins `blocked`, second run running.** One bounded GET per page, full header set: HTTP **403** with a 5,486-byte "Attention Required! | Cloudflare" interstitial on **all six**. Agrees exactly with the pre-agent published-evidence receipt (403, null resolved date, all six). No proxy or challenge replay. `snapshot` stays 2026-09-22 and the stored 80 letters stand.
- **Archon `blocked`, day 33.** Source-health receipt: raid route http 403 `cloudflare-challenge`, M+ route **http 200 `human-verification`** — the shape that makes "a 200 is not freshness" literal. This session probed all six tier routes plus the four ancillary ones: HTTP 403, `<title>Just a moment...</title>`, `__NEXT_DATA__` **absent everywhere**, so no `tierList` existed to read. Retention decision holds: the 2026-08-25 S2 letters stay in the consensus at their own date.
- `encounter-tiers.json` untouched and still stamped `season: "s1"` (asOf 2026-08-18), so the Fight selector stays hidden — read the file, not this sentence, next run.

## 2026-09-26 (nightly) — Method + Wowhead fetched live, **160 cells, 0 moves**; Icy Veins and Archon both walled (Archon day 32)

- **Method — `success`.** Both pages HTTP 200 (163,420 / 170,071 B). Parsed from the page's own **`div.tier__tier`** blocks reading the sibling `div.tier__title` for the letter — S/A/B/C once on raid, **twice on M+** — with every entry accepted by **ROSTER MATCH** on `data-original-title`, never by position; that rejected exactly the M+ page's 8 dungeon-difficulty entries (Altar of Fangs, Den of Nalorakk, King's Rest, Murder Row, Ruby Life Pools, Temple of Sethraliss, The Blinding Vale, Voidscar Arena) and nothing else. **raid 40 (S 6 / A 11 / B 17 / C 6), M+ 40 (S 2 / A 13 / B 21 / C 4) = 80**, roles 27/7/6 per bracket, 0 unmatched, 0 duplicate specs, **0 of 80 cells moved**. Era read from the BODY as always — both pages still carry stale "The War Within Season 3" meta/og boilerplate over a visible "Midnight Season 2 … The Venomous Abyss" page-desc — so `seasonVerified` stays s2; Devourer present. "Last Updated" re-read live (10th / 13th August 2026), matching registry + published-evidence receipt, so only `snapshot` advances.
  - ⚠️ **A note for the next parser rewrite:** the older logs' `div.tierlist.pw-item` container count (3, then 4, then 6) counts *wrappers*, and the first raid wrapper is the prose introduction with no entries. Anchoring on `tier__tier` + `tier__title` skips that question entirely and produced the same 80 cells; if a future run reports 0 rows from a "tierlist container" walk on a healthy 200, this is the shape to try.
- **Wowhead — `success`.** All six pages HTTP 200 (76-346 KB). Documented parse: unescape `\/` → `/` FIRST, then `[tier-list=rows] … [/tier-list]`, `[tier-label …]<TIER>[/tier-label]` with tolerant whitespace, specs from `[spec-badge=<spec>-<class>]` slugs; `WH.markup.printHtml(` deliberately not used as an anchor. Exactly one `[tier-list=rows]` block per page. Counts printed and reconciled BEFORE merge: **raid 27 (A 8 / B 14 / C 5) + 7 (S 1 / A 3 / B 3) + 6 (S 1 / A 3 / B 2); M+ 27 (S 1 / A+ 2 / A 7 / B 14 / C 3) + 7 (S 1 / A 3 / B 1 / C 2) + 6 (S 1 / A 3 / B 2) = 80**, 0 slugs unmatched, **0 of 80 cells moved**. `dateModified` re-read live (raid 2026-08-31 ×3, M+ DPS 08-28, healer 09-10, tank 09-01) — identical to registry and receipt, so only `snapshot` advances to 2026-09-26.
- **Icy Veins — `blocked`.** All six pages HTTP 403 with a 1,892-1,895-byte Cloudflare interstitial ("Attention Required", cf-error, Ray ID) on one bounded GET each with the full header set. No proxy or challenge workaround. Agrees exactly with the pre-agent published-evidence receipt (403 / null resolved date, all six). Nothing parsed ⇒ no letter, no `snapshot` (still 2026-09-22), no `published` date moved. Note the body is ~1.9 KB tonight against ~5.5 KB on 09-25 — a different Cloudflare error page, same 403 outcome; size alone is not a diagnosis.
- **Archon — `blocked`, day 32.** Source-health receipt: registered raid route HTTP 403 `cloudflare-challenge`, registered M+ route HTTP 200 `human-verification`. One bounded confirming GET per route returned the "Just a moment..." body (6,084 / 6,150 B) with zero `__NEXT_DATA__` tags. No challenge solved, replayed or proxied. Per the 2026-09-05 owner decision the last verified S2 letters STAY in the consensus at their 2026-08-25 snapshot.
- **No `seasonVerified` value changed**, so there is nothing for `freeze-season.mjs` to freeze (and it is Gate-0 immutable to this agent in any case — the publish job runs it). Consensus composition unchanged at four sources; `check-refresh --manifest` reports **0 tier moves**.

## 2026-09-25 (nightly) — Method + Wowhead fetched live, **160 cells, 0 moves**; Icy Veins and Archon both walled (Archon day 31)

- **Wowhead — `success`.** All six registered pages HTTP 200 by direct browser-header GET (76-346 KB). Parsed the documented way: unescape `\/` → `/` across the whole document FIRST, then `[tier-list=rows] … [/tier-list]` and `[tier-label …]<TIER>[/tier-label]` with tolerant whitespace, specs from their `[spec-badge=<spec>-<class>]` slugs. `WH.markup.printHtml(` deliberately not used as an anchor (the raid-healer decoy). Counts printed and reconciled against the roster shape BEFORE merging: **raid 27/7/6, M+ 27/7/6 = 80**, exactly one `[tier-list=rows]` block per page, 0 slugs unmatched. **0 of 80 cells moved.** JSON-LD `dateModified` re-read live on each page — raid 2026-08-31 ×3, M+ DPS 2026-08-28, M+ healer 2026-09-10, M+ tank 2026-09-01 — identical to the committed `published` values and to the pre-agent published-evidence receipt, so only `snapshot` advances to 2026-09-25. Era-verified from title + body ("DPS Raid Rankings for Midnight Season 2", the Venomous Abyss intro) with Devourer present; the Season 1 strings are retrospective prose inside the per-spec writeups, which is the documented false positive.
- **Method — `success`.** Both pages HTTP 200 (163,409 / 170,060 B). Parsed from the page's own `tierlist` containers — **4 on raid, 6 on M+** — accepting entries by **ROSTER MATCH** on `data-original-title`, never by position; that rejected the M+ page's 8 dungeon-difficulty entries and nothing else. **raid 40 (S 6 / A 11 / B 17 / C 6), M+ 40 (S 2 / A 13 / B 21 / C 4) = 80**, 0 unmatched, 0 stored specs absent upstream, **0 of 80 cells moved**. ⚠️ **Era had to be read from the BODY:** both pages' og/meta/twitter descriptions still carry stale **"The War Within Season 3"** boilerplate while the visible intro says "Midnight Season 2 Raid, The Venomous Abyss" — body over title, the blue-tracker precedent, so `seasonVerified` stays s2. Each page's own "Last Updated" line re-read live (10th August / 13th August 2026), matching the registry and the published-evidence receipt, so `published` is unchanged and only `snapshot` advances.
- **Icy Veins — `blocked`.** All six pages HTTP 403 with a 5,487-byte Cloudflare body, on two attempts each with the full header set. No proxy or challenge workaround attempted. This agrees exactly with the independent pre-agent published-evidence receipt (http 403, null resolved date, all six). Nothing parsed ⇒ no letter, no `snapshot` (still 2026-09-22) and no `published` date moved.
- **Archon — `blocked`, day 31.** The source-health receipt has the registered raid route at HTTP 403 `cloudflare-challenge` and the registered M+ route at HTTP 200 `human-verification`; one bounded confirming GET per route returned the "Just a moment..." interstitial (6,041 / 6,107 B) with no `__NEXT_DATA__`. Per the 2026-09-05 owner decision the last verified S2 letters STAY in the consensus at their 2026-08-25 snapshot — an outage does not remove a source.
- **No `seasonVerified` value changed**, so `freeze-season.mjs` had nothing to freeze (the nightly's publish job runs it regardless). Consensus composition is unchanged at four sources; `check-refresh --manifest` reports **0 tier moves**.

## 2026-09-24 (nightly) — Method + Wowhead fetched live, **160 cells, 0 moves**; Icy Veins and Archon both walled

- **Method `success`** — both pages direct browser-header GET, HTTP 200, 159,223 B (raid) / 165,874 B (M+) off the decoded bodies. Parsed from the page’s own `div.tierlist.pw-item` containers (raid 3, M+ 5), every entry accepted by **roster match on `data-original-title`**, never by position — which is what rejects the M+ page’s fifth container, the dungeon-difficulty block, whose 8 entries were the only unmatched values on either page. Counts printed and reconciled BEFORE the merge: raid **40** (S 6 / A 11 / B 17 / C 6), M+ **40** (S 2 / A 13 / B 21 / C 4). 0 of 80 stored cells moved.
  - ⚠️ **Era-verify from the BODY.** Both pages’ `<meta name=description>` still says **“The War Within Season 3”** — stale boilerplate — while the visible intro says “Midnight Season 2” and names The Venomous Abyss. Body over title (the blue-tracker precedent), so `seasonVerified` stays `s2`. A substring count of “Season N” would have read S3 as the majority on the raid page and dropped it from the consensus.
  - Page-stated dates re-read live: raid **10th August 2026**, M+ **13th August 2026** — unchanged, matching the registry and this run’s pre-agent published-evidence receipt. Only `snapshot` advanced.
- **Wowhead `success`** — all six pages HTTP 200, 76,255–346,455 B. Unescaped `\/` across the whole document FIRST, then took the `[tier-list=rows] … [/tier-list]` block and read `[spec-badge=<spec>-<class>]` slugs with tolerant-whitespace `[tier-label]` matching; **never** anchored on `WH.markup.printHtml(`. Exactly one tier-list block per page this run. Counts: raid DPS 27 (A 8 / B 14 / C 5), raid Healer 7 (S 1 / A 3 / B 3), raid Tank 6 (S 1 / A 3 / B 2), M+ DPS 27 (S 1 / A+ 2 / A 7 / B 14 / C 3), M+ Healer 7 (S 1 / A 3 / B 1 / C 2), M+ Tank 6 (S 1 / A 3 / B 2) = 27+7+6 per bracket, 0 unmatched. 0 of 80 stored cells moved. JSON-LD `dateModified` re-read per page — 08-31 / 08-31 / 08-31 / 08-28 / 09-10 / 09-01 — identical to the committed `published` values.
- **Icy Veins `blocked`** — all six URLs HTTP 403 with the “Attention Required! | Cloudflare” body (5,486 B) on the full browser header set. r.jina.ai tried once as an alternate transport and returned the “Just a moment…” interstitial too, so **both** known transports are shut. Matches the pre-agent published-evidence receipt (http 403, `resolved: null`, all six). Nothing parsed ⇒ nothing written: snapshot stays 2026-09-22 and the page-stated dates stay as committed.
- **Archon `blocked`, day 32** — `source-health/evidence.json` records the raid route at 403 `cloudflare-challenge` and the M+ route at 200 `human-verification`; an independent agent fetch of both got 403 “Just a moment…” interstitials (6,084 / 6,150 B) with no `__NEXT_DATA__` at all. No challenge solved, replayed or proxied. Per the 2026-09-05 owner decision its last verified S2 letters **stay in the consensus**; the six pages keep their 2026-08-25 snapshot.
- **`data/encounter-tiers.json` read, not written** — still `season: "s1"` at asOf 2026-08-17, so the Fight selector stays hidden and the S1 archive stays quarantined until an S2 Archon rebuild can actually be fetched.
- **No `seasonVerified` value changed**, so `freeze-season.mjs` was a no-op (“8 source/bracket pairs still describe the live season — nothing to freeze”) and the archive was not rewritten.
## 2026-09-23 (nightly) — **Icy Veins joined the wall**; Wowhead + Method 160/160 cells re-verified S2 with **0 moves**; Archon day 31

- ⚠️ **ICY VEINS IS CLOUDFLARE-BLOCKED FROM THIS RUNNER TODAY, and it was NOT yesterday.** All six registered pages returned HTTP 403 with an identical **5,487-byte** “Attention Required! | Cloudflare” interstitial. Retried three times with a second UA on the raid DPS page: same 403. **r.jina.ai is not a way round it** — HTTP 200 carrying *“Target URL returned error 403: Forbidden”* and the “Enable JavaScript and cookies to continue” body. The pre-agent `published-evidence` artifact independently records `http 403` / `dateModified: null` on all six, so it is not this parser. Nothing merged: **80 letters, 6 `published` dates, 6 `seasonVerified` values and 6 snapshots all stay at 2026-09-22.** Recorded `blocked`. If this holds, the consensus keeps Icy Veins under the same owner-confirmed retention policy Archon is under — an outage does not remove a source.
- **Wowhead — 80/80, 0 moves.** Full browser header set (UA-only is 403). Unescaped `\/` → `/` across the WHOLE document FIRST, then searched for `[tier-list=rows] … [/tier-list]`; **never anchored on `WH.markup.printHtml(`**, the decoy that zeroed the raid-healer page on 2026-08-01. Exactly 1 block per page. Counts printed and reconciled BEFORE the merge: raid 27 DPS (A 8 / B 14 / C 5) + 7 healer (S 1 / A 3 / B 3) + 6 tank (S 1 / A 3 / B 2); M+ 27 DPS (S 1 / A+ 2 / A 7 / B 14 / C 3) + 7 healer (S 1 / A 3 / B 1 / C 2) + 6 tank (S 1 / A 3 / B 2). 0 unmatched — the `[spec-badge=<spec>-<class>]` kebab slug sidesteps the two-word-class split entirely. JSON-LD `dateModified` re-read live: raid ×3 2026-08-31, M+ DPS 2026-08-28, M+ healer 2026-09-10, M+ tank 2026-09-01 — all six match the registry **and** this run’s published-evidence artifact, 0 mismatches.
- **Method — 80/80, 0 moves.** Parsed the page’s own `.tierlist pw-item` containers (raid 3, M+ 5) and accepted rows **by ROSTER MATCH on `data-original-title`, never by container position** — which is exactly what rejects the M+ page’s fifth container, the dungeon-difficulty block, whose 8 entries (Altar of Fangs … Voidscar Arena) were the only unmatched values on either page. Raid S 6 / A 11 / B 17 / C 6; M+ S 2 / A 13 / B 21 / C 4. `Last Updated` re-read: **10th August 2026** (raid) and **13th August 2026** (M+), matching registry + evidence.
  - ⚠️ **Method’s `<meta name="description">` still says “The War Within Season 3” on BOTH pages.** Era-verify off the RANKING BODY, as the skill says: both bodies carry Midnight and Season 2, **zero** “War Within” and **zero** “Season 1”, and Devourer DH is present. Body beats title (the blue-tracker precedent) ⇒ `seasonVerified` stays `s2`. A head-tag-based check would have dropped both pages out of the consensus.
- **Archon — day 31, unbroken.** Registered raid route 403 / 5,935 B, registered M+ route 403 / 6,022 B, both “Just a moment…”. **Asserted on `__NEXT_DATA__` presence, not the status code: count 0 on both.** The pre-agent source-health receipt records raid `cloudflare-challenge` (403) and M+ `human-verification` (HTTP **200**, 2,516 B) — the 200-shaped wall the contract warns about. No challenge solved, replayed or automated past; nothing backfilled from Warcraft Logs under the archon id. All nine `archon-*` rows `blocked`, every stored letter and snapshot unchanged.
- **No `seasonVerified` value changed this run**, so `freeze-season.mjs` had nothing to do (it runs in the publish job regardless). Snapshots advanced for wowhead + method only. 0 consensus letters moved; `check-refresh --manifest` reports **0 tier moves**.

## 2026-09-22 (nightly) — 240/240 cells re-verified S2, **0 moves**; Archon wall unbroken (28th night)

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — all fetched fresh, all parsed, 0 unmatched, 0 of 240 stored cells moved.** Per-page counts printed and reconciled against the 27/7/6 roster shape BEFORE any merge, which is the only thing that catches a silent per-page shortfall (ratings UPSERT, so a zero-row page leaves the old letters standing and every floor stays green).
- **Icy Veins** — anchored on the single `<table class="tier-list">` element per the 09-21 trap note (the string `tier-list` occurs **159 times** on the raid DPS page); tier letter from each `<tr>`'s own first `<td>`, spec from the FIRST `alt=` after each `class="tier-list-entry"` span, looked up WHOLE. Raid S 4 / A+ 9 / A 10 / B 3 / C 1 = 27 DPS; M+ S+ 4 / S 3 / A+ 7 / A 7 / B 5 / C 1 = 27. JSON-LD `dateModified` re-read live on all six and matches both the registry and the pre-agent published-evidence receipt: raid DPS 08-30, raid healer 09-01, raid tank 08-29, M+ all three 08-30.
- **Method** — walked every `tier__tier` block and rejected by ROSTER MATCH: raid 4 blocks, M+ **8**, the four extra M+ blocks being the dungeon-difficulty lists whose eight entries (Altar of Fangs … Voidscar Arena) simply fail to map. Raid S 6 / A 11 / B 17 / C 6; M+ S 2 / A 13 / B 21 / C 4. In-body "Last Updated" re-read: raid 10th August 2026, M+ 13th August 2026 (no JSON-LD on either page — the published-evidence receipt resolves no date for Method either, which is the honest shape, not a gap).
- **Wowhead** — full browser header set, unescape `\/`→`/` across the WHOLE document first, then the single `[tier-list=rows]` block per page (never the `printHtml(` anchor); specs off the `[spec-badge=…]` kebab slug. Raid DPS still publishes **no S tier** (A 8 / B 14 / C 5). `dateModified`: raid ×3 08-31, M+ DPS 08-28, M+ healer 09-10, M+ tank 09-01 — all matching the registry and the receipt.
- **Era-verify: `seasonVerified` stays `s2` on all 14 live pages, unchanged.** Read from each page's BODY, not its title. No `seasonVerified` value moved, so `freeze-season` had nothing to freeze and no frozen-lane record was created.
- **Archon: blocked, all nine `archon-*` rows.** Pre-agent `source-health/evidence.json` (15:10:07Z) reports raid 403 `cloudflare-challenge` / M+ 200 `human-verification`; four registered routes probed directly all returned **HTTP 200 with a ~2.5 KB `<title>Human Verification</title>` interstitial and `__NEXT_DATA__` count 0**. The assertion stays on `__NEXT_DATA__` PRESENCE, not the status code — the wall has now been seen serving both 403 and 200 on the same night. Nothing solved, replayed or bypassed. Per the owner-confirmed 2026-09-05 retention policy Archon's last verified S2 letters STAY in the four-source consensus; an outage does not remove a source.
- `encounter-tiers.json` untouched: still `season: "s1"`, asOf 2026-08-18, 619 rows, Fight selector correctly hidden.

## 2026-09-21 (nightly) — 240/240 cells re-verified, **0 moves**; Archon wall unbroken

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — all fetched fresh, all parsed, 0 unmatched, 0 stored cells moved.** Per-page counts printed and reconciled against the 27/7/6 roster shape before any merge.
- ⚠️ **Icy Veins parser trap hit and fixed this run: anchor on `<table class="tier-list">`, NOT on the first literal `tier-list` match.** The page's inline CSS block names the class **66 times** and the first occurrence is ~150 KB *before* the table, so a `lastIndexOf('<table', idx)` walk off that hit lands in the stylesheet and returns **0 rows on all six pages** — a healthy HTTP 200 reading as a shape change. Regex for the opening tag instead. Also note `tier-list-entry-with-icon` (35 per page) lives entirely OUTSIDE the table and is not an entry class; splitting on the exact string `class="tier-list-entry"` gives 27/7/6 cleanly.
- **Icy Veins**: 6 pages, HTTP 200, 197,136–344,643 B. Era-verified from each page's own BODY, not its title — the raid-healer page still titles itself *"(Patch 12.0.7 / Midnight)"* while its breadcrumb is the Venomous Abyss Raid Guide and its byline reads *Last Updated: Sep 1, 2026*; all six bodies carry Season 2 20–50× against a handful of historical Season 1 references. `seasonVerified` stays `s2`.
- **Method**: 2 pages, 159,223 B + 165,874 B. Raid has **4** tier blocks, M+ has **8**; the four extra M+ blocks are the dungeon-difficulty lists, rejected by ROSTER MATCH (8 dungeon names) and never by position. 40 + 40, no duplicate (bracket, spec) pair. Method publishes no JSON-LD `dateModified`, so the in-body *Last Updated* line is the authority: raid 10th August 2026, M+ 13th August 2026.
- **Wowhead**: 6 pages with the full browser header set. Unescaped `\/`→`/` across the document FIRST, then located `[tier-list=rows]` — exactly one block per page this run, so the raid-healer decoy `printHtml` (both pages carry two calls) was not in play. Specs resolved from the kebab `[spec-badge=<spec>-<class>]` slug. Empty tiers are legitimate and present: the raid-DPS page publishes **no S tier** (A 8 / B 14 / C 5) and M+ tank rendered 5 tier groups rather than 6.
- **Published dates re-read live and all 14 match** both the committed registry and this run's pre-agent `published-evidence` artifact (attemptedAt 16:35:46Z). 0 mismatches, so no `published` value changed — only the 14 `snapshot` dates advanced to 2026-09-21.
- **Archon still walled** (unbroken since 2026-08-25/26). Both registered application routes probed once each with the full header set: HTTP **403**, 5,956 / 6,022 B, Cloudflare *"Just a moment…"*, `__NEXT_DATA__` count **0** on both. This run's `source-health` receipt independently recorded raid 403 `cloudflare-challenge` and M+ **HTTP 200** `human-verification` — i.e. the wall served BOTH shapes within ~90 seconds, which is exactly why the assertion is on `__NEXT_DATA__` presence and never on the status code. Letters and snapshot dates untouched at 2026-08-25; Archon stays in the four-source consensus per the owner retention policy.
- No `seasonVerified` value changed, so `freeze-season` had nothing to do (it runs in publish regardless).


## 2026-09-20 (nightly) — 240/240 cells re-verified, **0 moves**; Archon walled day 28

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — all fetched fresh, all parsed, 0 unmatched, 0 stored cells moved.** Per-page counts printed and reconciled against the 27/7/6 roster shape before any merge, because nothing mechanical catches a per-page shortfall (ratings upsert).
- **Icy Veins**: 6 pages, HTTP 200, 197,083–344,590 B. Era-verified from each page's own BODY: the raid-healer page still titles itself *"(Patch 12.0.7 / Midnight)"* while its breadcrumb is the Venomous Abyss Raid Guide, its byline reads *Last Updated: Sep 1, 2026* and its changelog's newest lines are *"01 Sep. 2026: Updated for the end of RWF Mythic progression"* and *"11 Aug. 2026: Updated for Midnight Season 2 launch"* — body over title, so `seasonVerified` stays `s2`.
- **Method**: 2 pages. The M+ page carries **8** tier blocks; the extras are the dungeon-difficulty lists and the site logo, rejected by ROSTER MATCH (9 rejects, all dungeon names) and never by position. 40 + 40 with no duplicate (bracket, spec) pair; M+ still has no S+ band.
- **Wowhead**: 6 pages with the full browser header set. Unescaped `\/`→`/` across the document FIRST, then located `[tier-list=rows]`; exactly one block per page this run, so the healer-page decoy was not in play. Tier labels matched with tolerant whitespace; specs resolved from the kebab `[spec-badge=<spec>-<class>]` slug.
- **Published dates re-read live and all 14 match** both the committed registry and this run's pre-agent `published-evidence` artifact: Icy Veins 08-30/09-01/08-29/08-30/08-30/08-30, Method 08-10 + 08-13, Wowhead 08-31×3 / 08-28 / 09-10 / 09-01. 0 mismatches, so no `published` value changed — only the 14 `snapshot` dates advanced to 2026-09-20.
- **Archon day 28**: the registered raid-Heroic route probed once — HTTP 403, 3,278 B, Cloudflare *"Just a moment…"*, `__NEXT_DATA__` count **0** (assert on payload, never status). This run's `source-health` receipt independently records raid 403 challenge + M+ **HTTP 200** human-verification, the documented 200-with-a-wall shape. Letters and snapshot dates untouched at 2026-08-25; per the owner retention policy Archon stays in the four-source consensus with its last verified S2 letters.
- No `seasonVerified` value changed, so `freeze-season` had nothing to do (it runs in publish regardless).


## 2026-09-19 (local, scheduled) — NOT re-run: the nightly re-verified 240/240 cells 30 minutes earlier (publish 14:23Z, 0 moves, Archon walled day 27)

- Residential-only scope; regenerating what CI produced today is the unmergeable-push failure the local-run skill warns about. No tier page
  fetched, no `snapshot` date touched, Archon not re-probed (the nightly's own attempt with the full header set was 403 + `__NEXT_DATA__` 0 an hour
  before this run; a second residential probe would add nothing to the wall count and the retention policy is unchanged).

## 2026-09-19 (nightly) — 240/240 cells re-verified S2, **0 moves**; Archon walled a **twenty-seventh** day

- **Icy Veins 80/80.** All 6 pages direct browser-UA GET, HTTP 200, 197,156–344,663 B off the written files. Parse bounded to `<table class="tier-list">`: tier from each `<tr>`'s own first `<td>`, spec from the FIRST `img alt` after `class="tier-list-entry"`, looked up WHOLE. Counts printed before the merge: raid 27/7/6, M+ 27/7/6, **0 unmatched**. Tiers: raid DPS S/A+/A/B/C · raid healer S/A/B · raid tank S/A/B · M+ DPS S+/S/A+/A/B/C · M+ healer S/A+/A/B · M+ tank S/A+/A.
- **Method 80/80.** Both pages HTTP 200 (159,223 / 165,874 B). Walked every `tier__tier <letter>-tier` block. Extras rejected by **roster match, never position**: 9 rejects on M+ (the eight dungeon names + the Method logo) and 1 on raid (the logo). S/A/B/C on both; Method's M+ list still has no S+ band.
- **Wowhead 80/80.** Full browser header set; unescape `\/`→`/` FIRST, then take the largest `[tier-list=rows]` block rather than anchoring on `WH.markup.printHtml(` — one block per page this run (27/7/6/27/7/6 badges), so no decoy was in play, but the selection rule is what makes that checkable. Tier labels matched with tolerant whitespace; specs from the kebab `[spec-badge=]` slug. Raid DPS still has **no S band** (A/B/C only).
- **Pre-merge diff: 0 of 240 cells moved.** `apply-ratings` then left `data/specs.json` byte-identical. Only the 14 `snapshot` dates advanced to 2026-09-19.
- **Published dates re-read live from each page and all 14 match** both the committed registry and this run's pre-agent `published-evidence` artifact (attemptedAt 14:00:28Z) — 0 mismatches. IV raid DPS 08-30 / healer 09-01 / tank 08-29, IV M+ all 08-30; Method 08-10 raid, 08-13 M+; Wowhead raid ×3 08-31, M+ DPS 08-28, M+ healer 09-10, M+ tank 09-01.
- **Era-verify from bodies, not titles.** The IV **raid-healer page still titles itself "(Patch 12.0.7 / Midnight)"** over a Season-2 body ("Midnight Healer Tier List for Season 2", "LAST UPDATED - 01st of September", changelog topping out at the S2 launch and RWF updates) — body over title, blue-tracker precedent. Method's raid page self-identifies "This Midnight Season 2 Raiding tier list for The Venomous Abyss Raid" with **zero** "Season 1" hits on either page; Wowhead's six titles all end "for Midnight Season 2". Devourer DH present on every DPS page. **No `seasonVerified` value changed**, so `freeze-season.mjs` had nothing to trigger (and it is publish-side anyway).
- **Archon: walled, day 27, and re-measured rather than assumed.** This run's `source-health/evidence.json` (13:59:55Z) recorded raid **403 / cloudflare-challenge** (5,764 B) and M+ **200 / human-verification** (2,516 B). My own attempt with the full header set: both routes **403**, 5,956 / 6,022 B "Just a moment…", **`__NEXT_DATA__` count 0** — asserted on payload presence, never on status, which is the documented trap. No challenge solved, replayed or bypassed; no proxy. Retention policy holds: all 240 Archon letters keep their 2026-08-25 snapshot and stay in the four-source consensus; nothing backfilled from Warcraft Logs.

## 2026-09-18 (nightly) — 240/240 cells re-verified S2, **0 moves**; Archon still walled (day 26), re-confirmed after this morning’s local probe

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80**, all fetched fresh this session, all HTTP 200. Per-page counts printed and reconciled to
  27 DPS / 7 healer / 6 tank before every merge; 0 unmatched, 0 duplicates, 0 role mismatches. **Pre-merge diff moved 0 of 240 stored cells.**
- **The scales.json shape trap bit again and the printed count caught it again.** `scales.icyveins` is a wrapper — the tier list is
  `scales.scales.icyveins.tiers`, an ARRAY. Reading it the other way produced **0 rows on all six healthy Icy Veins pages**, which looks
  exactly like a page rebuild. Print per-page counts before believing any parse.
- Method: the M+ page's **second populated tierlist is the dungeon-difficulty list** (9 entries) and the raid page carries the site logo; all 10
  were rejected by **roster match**, never by container position.
- Wowhead: unescape `\/` first, then choose the `[tier-list=rows]` block with the most `[spec-badge=]` entries (one block per page this run,
  so no decoy — but the rule is what makes that checkable). Tolerant whitespace on `[tier-label ...]`.
- **Page self-dates re-read live and 0 of 14 disagreed** with either the committed registry or this run's published-evidence artifact.
  Era-verified from each ranking body; note Icy Veins' raid-healer page still **titles** itself "(Patch 12.0.7 / Midnight)" over a Season-2
  body — body over title. **No `seasonVerified` value changed**, so there was nothing for `freeze-season` to do.
- **Archon**: source-health receipt first (raid 403 cloudflare-challenge, M+ 200 human-verification), then one confirming GET per bracket —
  both 403, "Just a moment", `__NEXT_DATA__` count **0**. Nothing parsed, nothing bypassed. All 240 Archon letters keep their 2026-08-25 dates
  under the owner-confirmed retention rule; `encounter-tiers.json` still stamps **s1** so the Fight selector stays hidden.

## 2026-09-18 (local, scheduled) — Archon walled a TWENTY-SIXTH day, re-probed once from a residential IP (403 "Just a moment..." today); 0 letters touched; run BEFORE today's nightly

- **Archon: still walled.** Root plus two registered pages (raid Heroic DPS all-bosses, raid Heroic healer all-bosses) with a browser
  header set: all three **HTTP 403**, 5,690–5,901 B, `<title>Just a moment...`, `__NEXT_DATA__` count **0** (asserted on presence,
  never on the status code — the 09-17 local probe saw the 200-shaped "Human Verification" variant of the same wall). Not solved, not
  replayed, nothing backfilled from Warcraft Logs. Stored letters, snapshot dates and `seasonVerified` byte-identical; the owner-confirmed
  retention policy (2026-09-05) keeps the four-source consensus.
- **Icy Veins / Method / Wowhead deliberately NOT re-fetched** — the 09-17 nightly re-verified 240/240 cells S2 with 0 moves (1d against a
  4d max), today's nightly will pull them again in an hour, and an independent regeneration is what makes a local push unmergeable.
- `freeze-season`: 8 pairs still describe the live season, nothing to freeze; `season-final.json` untouched.

## 2026-09-17 (nightly) — Icy Veins / Method / Wowhead all re-fetched and re-parsed, **240/240 cells re-verified S2, 0 moves**; Archon walled a **TWENTY-FIFTH** day

- **Icy Veins — 6/6 pages, 80 rows (27/7/6 per bracket), 0 moves.** Direct browser-UA GET, HTTP 200, 197,156-344,663 B measured off the written files. ⚠️ **Trap hit and fixed inside this run:** the first parse read the icyveins scale with `Object.keys(scales.scales.icyveins.tiers)` — `tiers` is an **ARRAY**, so the membership set was `{"0".."6"}` and every tier cell was rejected: **0 rows on all six healthy pages**, which looks exactly like an upstream rebuild. The per-page count print is the only thing that caught it (the standing rule, earned again). Correct form is `new Set(scales.scales.<source>.tiers)`. Letters: raid DPS S4/A+9/A10/B3/C1, raid healer S3/A3/B1, raid tank S2/A3/B1, M+ DPS S+4/S3/A+7/A7/B5/C1, M+ healer S2/A+1/A2/B2, M+ tank S1/A+2/A3. JSON-LD `dateModified` re-read live on each page (08-30 / 09-01 / 08-29 / 08-30 / 08-30 / 08-30) and matches both the registry and the pre-agent published-evidence artifact. Era from each page's own ranking-body H2 ("... for Season 2" on all six); the raid-healer page TITLE still says "(Patch 12.0.7 / Midnight)" and is overridden by its body, the blue-tracker precedent.
- **Method — 2/2 pages, 80 rows, 0 moves.** 157,217 / 163,868 B. Tier from each `div.tier__tier`'s `.tier__title`, specs from `data-original-title`. The M+ page's four EXTRA tier blocks are the **dungeon-difficulty** list and were rejected by ROSTER MATCH, never by position — the 8 unmatched names are exactly the dungeons (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs). Raid S6/A11/B17/C6, M+ S2/A13/B21/C4. Self-dates "Last Updated 10th August 2026" (raid) and "13th August 2026" (M+), both matching the registry. ⚠️ Both pages' `og:description` is stale boilerplate still naming **"The War Within Season 3"**; the ranking bodies say "Midnight Season 2" / "Patch 12.1" and the M+ page is bylined Tactyks — body over meta, so this is not an era failure.
- **Wowhead — 6/6 pages, 80 rows, 0 moves.** FULL browser header set (UA-only is Cloudflare-403; r.jina.ai is dead on `/guide/*`), 76,072-346,242 B. Unescaped `\/` across the whole document FIRST, then sliced `[tier-list=rows] ... [/tier-list]` out of `WH.markup` — never anchored on `printHtml(` — tier via tolerant-whitespace `[tier-label]`, spec via the `[spec-badge=<spec>-<class>]` slug. Raid DPS A8/B14/C5, raid healer S1/A3/B3, raid tank S1/A3/B2, M+ DPS S1/A+2/A7/B14/C3, M+ healer S1/A3/B1/C2, M+ tank S1/A3/B2. `dateModified` 08-31 / 08-31 / 08-31 / 08-28 / **09-10** / 09-01, all matching the registry and the published-evidence artifact.
- **Published cross-check: 0 mismatches of 14** against this run's pre-agent artifact — no carried-forward `published` value contradicts its page.
- **Pre-merge diff moved 0 of 240 stored cells**, and `apply-ratings` then applied 240 rows across 40 specs with 0 unmatched. Snapshots advanced 2026-09-16 -> **2026-09-17** for all 14 pages of the three fetched sources. **No `seasonVerified` value changed** (all s2), so `node src/freeze-season.mjs` was a no-op: "8 source/bracket pairs still describe the live season — nothing to freeze there."
- **Archon — DAY 25 of the wall, all nine rows blocked.** `source-health/evidence.json` (15:18:15Z) recorded the registered raid Heroic page **403 / cloudflare-challenge** (5,764 B) and the M+ DPS page **200 / human-verification** (2,516 B). I probed three registered URLs myself (raid heroic all-bosses, M+ healer this-week, the Mythic all-bosses ancillary page): all **403, 5,913-5,988 B, "Just a moment...", `__NEXT_DATA__` count 0** — asserted on `__NEXT_DATA__` presence, never the status code. No challenge solved or replayed, nothing backfilled from WCL. Per the owner-confirmed 2026-09-05 retention policy Archon's last verified S2 letters stay in the four-source consensus; its 80 stored rating cells, encounter tiers and snapshot dates are untouched. `encounter-tiers.json` still stamps `s2` at asOf 2026-08-18 — read off the file, not assumed.


## 2026-09-17 (local, scheduled) — Archon walled a TWENTY-FOURTH day, re-probed once from a residential IP (200-shaped "Human Verification" again); 0 letters touched; run BEFORE today's nightly

- **Archon: still walled from home.** One registered page (raid DPS Heroic) fetched with the browser header set: **HTTP 200, 2,501 B,
  `<title>Human Verification</title>`, `challenge-platform` present, `__NEXT_DATA__` count 0**. Assertion stays on `__NEXT_DATA__`
  presence, never the status code. One probe only; nothing merged, no snapshot stamped; the 80 letters verified 2026-08-25 stay in the
  consensus at their original dates per the 2026-09-05 retention policy.
- **Icy Veins / Method / Wowhead: NOT re-fetched.** The 09-16 nightly re-verified all 240 cells S2 with 0 moves ~23h ago and today's nightly
  is expected at ~15:00Z; independently regenerating them here is exactly the unmergeable-push shape the local-run skill warns about.
  `node src/freeze-season.mjs`: "8 source/bracket pairs still describe the live season — nothing to freeze".
- Manifest deliberately left alone (partial run). `check-refresh --manifest` printed the two expected lines only: the stale `startedAt`
  (23h) and the gitignored 09-08 `wcl-fetch/evidence.json` leftover.

## 2026-09-16 (nightly) — 240/240 cells re-verified S2 across the three reachable sources, **0 moves**; Archon walled a TWENTY-FOURTH day (403 "Just a moment..." from CI)

- **All three reachable sources re-fetched from scratch**, even though today's residential local run had deliberately skipped them: the committed manifest is the previous run's record and never excuses skipping work.
- **Icy Veins 80/80** (6 pages, direct browser-UA GET, HTTP 200, 196,973–344,480 B off the written files, never curl's `--compressed` size). Parse bounded to each page's `<table class="tier-list">`, one `<tr>` at a time: tier from the row's first `<td>` accepted only against the icyveins scale; spec from the FIRST `img alt` after `class="tier-list-entry"`, looked up WHOLE. Counts printed and reconciled before the merge: raid 27/7/6, M+ 27/7/6. Letters raid DPS S4/A+9/A10/B3/C1, raid healer S3/A3/B1, raid tank S2/A3/B1, M+ DPS S+4/S3/A+7/A7/B5/C1, M+ healer S2/A+1/A2/B2, M+ tank S1/A+2/A3. **0 of 80 cells moved.** JSON-LD `dateModified` re-read live: 08-30 / 09-01 / 08-29 / 08-30 / 08-30 / 08-30 — identical to the registry AND to this run's pre-agent `published-evidence`. The raid-healer page title still reads "(Patch 12.0.7 / Midnight)", overridden by its own **"Midnight Healer Tier List for Season 2"** H2 — body over title.
- **Wowhead 80/80** (6 pages, FULL browser header set, HTTP 200, 76,048–346,218 B). Unescaped `\/` → `/` across the whole document FIRST, then searched for `[tier-list=rows] … [/tier-list]` — never anchored on `WH.markup.printHtml(`, whose raid-healer decoy is on record. Exactly **1** block per page; tier labels matched with tolerant whitespace; specs from the `[spec-badge=<spec>-<class>]` kebab slug. Letters raid DPS A8/B14/C5, raid healer S1/A3/B3, raid tank S1/A3/B2, M+ DPS S1/A+2/A7/B14/C3, M+ healer S1/A3/B1/C2, M+ tank S1/A3/B2. **0 of 80 moved.** `dateModified` re-read live: raid 08-31 ×3, M+ DPS 08-28, M+ healer **09-10**, M+ tank 09-01 — all matching the registry and the published-evidence artifact.
- **Method 80/80** (2 pages, HTTP 200, raid 157,217 B / M+ 163,868 B). Walked every `<div class="tier__tier X-tier">`, cross-checked the class token against the block's own `tier__title` text (0 disagreements), read entries from the `tier__icon` img alt, and **rejected by ROSTER MATCH, never by position** — the M+ page's dungeon-difficulty list contributed 8 unmapped names (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs) and was dropped cleanly. Raid S6/A11/B17/C6, M+ S2/A13/B21/C4. **0 of 80 moved.** Own "Last Updated" lines re-read: raid **10th August 2026**, M+ **13th August 2026** — matching the registry's 2026-08-10 / 2026-08-13.
- **Era-verify:** all 14 pages self-identify Season 2 from the ranking body (Method's titles are undated, so the body is the only cue: "the Midnight Season 2 Raid, The Venomous Abyss" / "Mythic+ Spec and Dungeon Tier List for Midnight Season 2"); Devourer DH present in every DPS list. **`seasonVerified` unchanged at `s2` on every page**, so no season flip was observed and `freeze-season` has nothing to freeze (publish runs it anyway).
- **Archon: walled, day 24.** `source-health/evidence.json` (15:10:48Z) already recorded both representative routes blocked — raid DPS Heroic **403 / cloudflare-challenge**, M+ DPS **200 / human-verification**. I made exactly **one** further probe, of the Mythic all-bosses numeric page: **HTTP 403, 5,956 B, `<title>Just a moment...</title>`, `__NEXT_DATA__` count 0**. Assertion stays on `__NEXT_DATA__` presence, never the status code. Nothing merged, no snapshot stamped; the 80 letters verified 2026-08-25 stay in the consensus at their original dates per the 2026-09-05 retention policy.
- `data/encounter-tiers.json` still `season: "s1"` (asOf 2026-08-17) — Fight selector stays hidden, S1 archive stays quarantined.
- Snapshots advanced 2026-09-15 → **2026-09-16** for icyveins / method / wowhead only.

## 2026-09-16 (local, scheduled) — Archon walled a TWENTY-THIRD day, re-probed once from a residential IP (200-shaped "Human Verification" today); 0 letters touched; run BEFORE today's nightly

- **Archon: still walled from home.** One registered page (raid DPS Heroic) fetched with the browser header set: **HTTP 200, 1,287 B,
  `<title>Human Verification</title>`, `challenge-platform` present, `__NEXT_DATA__` count 0** — the 200 shape again (yesterday from home was
  the 403 "Just a moment..." shape; the two remain interchangeable on one IP). Assertion stays on `__NEXT_DATA__` presence, never the status
  code. One probe only; nothing merged, no snapshot stamped; the 80 letters verified 2026-08-25 stay in the consensus at their original dates
  per the 2026-09-05 retention policy.
- **Icy Veins / Method / Wowhead deliberately NOT re-fetched.** The second 09-15 nightly re-parsed all 240 cells ~22h ago (0 moves), and
  today's nightly is still pending at 14:21Z — independently regenerating what CI is about to produce is what makes a local push unmergeable.
  Same call as 09-12/13/14/15.
- `freeze-season.mjs`: "8 source/bracket pairs still describe the live season — nothing to freeze"; archive unchanged.
- **Tier-set upkeep touched two specs tonight via ptr-watch** (Protection Paladin, Holy Priest — Sept-15 hotfix set-bonus behaviour fixes,
  `asOf` → 2026-09-15) and the gearing mirror was re-synced + rebuilt in the same change; no letter or scale involved.
- `data/encounter-tiers.json` still `season: "s1"` (asOf 2026-08-17) — Fight selector stays hidden.

## 2026-09-15 (nightly, second run of the day) — 240/240 cells re-verified S2 across the three reachable sources, 0 moves; Archon still walled

- **Scope:** this is the SECOND nightly-shaped run today (the first wrote the committed manifest at 15:18Z; my collector
  receipts are 15:54Z). Every source was re-fetched from scratch anyway — the committed manifest is the previous run's
  record and never excuses skipping work — so all three reachable tier sources were parsed and diffed fresh.
- **Icy Veins 80/80** (6 pages, direct browser-UA GET, HTTP 200, 196,773–344,280 B off the written files). Counts printed
  and reconciled before the merge: raid 27/7/6, M+ 27/7/6. Letters raid DPS S4/A+9/A10/B3/C1, raid healer S3/A3/B1, raid
  tank S2/A3/B1, M+ DPS S+4/S3/A+7/A7/B5/C1, M+ healer S2/A+1/A2/B2, M+ tank S1/A+2/A3. **0 of 80 cells moved.**
  JSON-LD `dateModified` re-read live: 08-30 / 09-01 / 08-29 / 08-30 / 08-30 / 08-30 — identical to the registry AND to
  this run's pre-agent `published-evidence` artifact. The raid-healer page title still says "(Patch 12.0.7 / Midnight)"
  and is overridden by its own **"Midnight Healer Tier List for Season 2"** H2 — body over title.
- **Method 80/80** (raid 157,217 B, M+ 163,868 B). Parsed by walking `.tierlist pw-item` containers and their
  `.tier__tier` blocks; **the M+ dungeon-difficulty container was rejected BY ROSTER MATCH**, its 8 entries (King's Rest,
  Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss, Altar of Fangs)
  simply failing to map — never by position. Raid S6/A11/B17/C6, M+ S2/A13/B21/C4, **0 of 80 moved**. Self-dates read
  live from the "Last Updated" line: 10th August / 13th August 2026, matching the registry and the published-evidence
  artifact. ⚠ Both pages' **og:description still reads "The War Within Season 3"** while the bodies read "Midnight
  Season 2 Raid, The Venomous Abyss" and Tactyks' "Mythic+ Spec and Dungeon Tier List for Midnight Season 2" — body over
  meta, the same precedent as the Icy Veins title. Worth remembering: the meta tag is the WRONG lane to era-verify from.
- **Wowhead 80/80** (full browser header set; r.jina.ai deliberately not attempted, IP-403 on `/guide/*` since 08-03).
  Unescaped `\/` first, THEN found `[tier-list=rows]` — exactly one block per page, 1,124–3,443 B, including the
  raid-HEALER page that carries the 2026-08-01 decoy `printHtml`. Specs resolved from the `[spec-badge=<spec>-<class>]`
  kebab slug. Raid DPS A8/B14/C5, raid healer S1/A3/B3, raid tank S1/A3/B2, M+ DPS S1/A+2/A7/B14/C3, M+ healer
  S1/A3/B1/C2, M+ tank S1/A3/B2, **0 of 80 moved**. `dateModified` 08-31 ×3 / 08-28 / 09-10 / 09-01, matching registry
  and published-evidence.
- **Archon BLOCKED, ninth requirement row and all.** `source-health/evidence.json` read FIRST as directed (15:54:08Z):
  raid Heroic DPS **HTTP 403 `cloudflare-challenge`** (5,743 B), M+ DPS **HTTP 200 `human-verification`** (2,516 B). My
  own three attempts at 16:00Z with the full header set returned HTTP 403 "Just a moment…" interstitials of 5,956–6,022 B
  with **zero `__NEXT_DATA__` tags**. No challenge solved, replayed or proxied. Retention rule holds: Archon's last
  verified S2 letters stay in the consensus at their 2026-08-25 dates.
- **No `seasonVerified` value changed** on any page (all 14 non-ancillary pages stay `s2`), so freeze-season had nothing
  to freeze and no movement baseline was recomposed. Page snapshots for the three reachable sources already read
  2026-09-15 from this morning's run and were **confirmed, not advanced** — a same-day recheck must not move a date.

## 2026-09-15 (nightly) — 240/240 cells re-verified S2, 0 moves; Archon still walled, 403 Cloudflare shape from the runner

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — 0 of 240 stored cells moved.** All 14 pages fetched fresh this run;
  only the 14 snapshot dates advanced to 2026-09-15. Counts printed and reconciled per page before every merge:
  Icy Veins raid 27/7/6 + M+ 27/7/6, Method raid 40 + M+ 40, Wowhead raid 27/7/6 + M+ 27/7/6. 0 unmatched rows,
  0 duplicate (bracket,spec) pairs, 0 null tiers across all three sources. `apply-ratings.mjs` accepted all 240.
- **Transport, for the record:** direct browser-UA GET everywhere. Icy Veins 196,701–343,872 B, Method 157,217 / 163,868 B,
  Wowhead 75,209–345,374 B — all measured off the WRITTEN FILES, never curl's `size_download` (which reports the
  compressed size under `--compressed`). r.jina.ai was not attempted on any host; it is dead on `wowhead.com/guide/*`.
- **Parser notes.** Icy Veins: one `<table class="tier-list">` per page, tier letter from each row's first `<td>`, spec
  from the FIRST `img alt` after `class="tier-list-entry"` and looked up WHOLE — the 64 `tier-list-entry` occurrences on
  the raid-DPS page collapse to 27 entries because the spell-icon alts inside the details blocks are correctly excluded by
  the first-alt rule. Wowhead: unescape `\/` → `/` across the whole document FIRST, then find `[tier-list=rows]`; exactly
  one block per page, so no `printHtml` decoy this run. Method: rejected the 8 dungeon-name entries BY ROSTER MATCH
  (King's Rest, Ruby Life Pools, Voidscar Arena, The Blinding Vale, Den of Nalorakk, Murder Row, Temple of Sethraliss,
  Altar of Fangs), never by container position.
- **Era-verification read off each page's own ranking body.** All six Icy Veins H2s say Season 2 — note the raid-HEALER
  page TITLE still reads "(Patch 12.0.7 / Midnight)" while its H2 reads "Midnight Healer Tier List for Season 2"; body
  over title, the blue-tracker precedent. Method's raid page states "This Midnight Season 2 Raiding tier list for The
  Venomous Abyss Raid". All six Wowhead titles read "for Midnight Season 2". Devourer DH present in every DPS list.
  **No `seasonVerified` value changed**, so `freeze-season` had nothing to freeze and none was needed agent-side.
- **`published` re-read live, not carried forward**, and every value matched both the registry and this run's pre-agent
  `published-evidence/evidence.json`: Icy Veins raid DPS 2026-08-30 / healer 2026-09-01 / tank 2026-08-29, M+ all
  2026-08-30; Wowhead raid all 2026-08-31, M+ DPS 2026-08-28 / healer 2026-09-10 / tank 2026-09-01. Method publishes a
  "Last Updated" line (raid 10 Aug 2026, M+ 13 Aug 2026) but carries no `published` field in the registry, so nothing was
  written to one.
- **Archon: still walled, unbroken since 2026-08-25/26.** `source-health/evidence.json` read first (raid Heroic DPS 403
  `cloudflare-challenge`, M+ DPS 200 `human-verification`); the agent then attempted all 11 unique registered URLs and got
  **HTTP 403 + a ~6 KB "Just a moment" interstitial on 11 of 11**, `__NEXT_DATA__` count **0** on every one. Asserted on
  `__NEXT_DATA__` presence, never the status code. Nothing solved, replayed or proxied; no snapshot advanced; the retained
  S2 letters stay in the four-source consensus per the 2026-09-05 owner policy. `encounter-tiers.json` re-read directly —
  still `season: "s1"`, asOf 2026-08-17, 619 tier rows — so the Fight selector stays hidden and the S1 archive stays
  quarantined.
## 2026-09-15 (local, scheduled) — Archon walled a TWENTY-SECOND day, re-probed from a residential IP (403 shape today); 0 letters touched; run BEFORE today's nightly

- **Archon: still walled from home, and today the residential IP sees the 403 shape.** Root plus all 12 registered page entries (11
  unique URLs) fetched with the full browser header set, 1 s apart: **HTTP 403 every time, 5,937–6,223 B, `<title>Just a moment...`,
  `__NEXT_DATA__` count 0** on all 13 — yesterday the same routes from home returned the 200-shaped "Human Verification" body, so
  the two shapes are confirmed interchangeable on one IP; the assertion stays on `__NEXT_DATA__` presence, never the status code.
  Nothing merged, no snapshot stamped; the 80 letters verified 2026-08-25 stay in the consensus at their original dates per the
  2026-09-05 retention policy.
- **Icy Veins / Method / Wowhead deliberately NOT re-fetched.** The 09-14 nightly re-parsed all 240 cells ~22h ago (0 moves), and
  today's nightly is still pending — independently regenerating what CI is about to produce is what makes a local push unmergeable.
  Same call as 09-12/13/14.
- `freeze-season.mjs`: "8 source/bracket pairs still describe the live season — nothing to freeze"; archive unchanged.
- `data/encounter-tiers.json` still `season: "s1"` (asOf 2026-08-17) — Fight selector stays hidden.


## 2026-09-14 (nightly) — 240/240 cells re-verified S2, 0 moves; Archon walled a TWENTY-SECOND day (403 shape from the runner)

- **Icy Veins 80/80, Method 80/80, Wowhead 80/80 — 0 of 240 stored cells moved.** All 14 pages fetched fresh this run;
  only the 14 snapshot dates advanced to 2026-09-14. Counts printed and reconciled per page before every merge
  (27 DPS / 7 healer / 6 tank = 40 per source-bracket), 0 unmatched, 0 duplicate (bracket,spec) pairs, 0 null tiers.
- **Transports used, for the record.** Icy Veins: direct browser-UA GET (196,759–344,266 B off the written files), parse
  bounded to `<table class="tier-list">`, tier from the row's first `<td>`, spec from the FIRST `alt=` after
  `tier-list-entry` looked up WHOLE. Method: direct browser-UA GET, per `<div class="tier__tier <letter>-tier">` with the
  letter from that block's own `.tier__title` and specs resolved by ROSTER MATCH on `.tier__icon data-original-title` —
  the M+ page's four extra blocks (the dungeon-difficulty lists) failed to map and were rejected that way, never by index.
  Wowhead: full browser header set, unescape `\/` FIRST then slice `[tier-list=rows] … [/tier-list]`, specs from the
  `[spec-badge=<spec>-<class>]` slug; exactly one tier-list block per page, so no decoy `printHtml` was in play.
- **Era checks, from bodies not titles.** Icy Veins raid-healer still titles itself "(Patch 12.0.7 / Midnight)" over an H2
  reading "Midnight Healer Tier List for Season 2"; Method's raid AND M+ `og:description` still say "The War Within
  Season 3" over bodies reading "Midnight Season 2". Both overridden by body, per the blue-tracker precedent. All six
  Wowhead H1s read "… for Midnight Season 2". Devourer DH present in every DPS list. **No `seasonVerified` value changed,
  so there was nothing for `freeze-season` to freeze** (it is publish-side on a nightly in any case).
- **Page self-dates re-read live and cross-checked** against both the committed registry and this run's pre-agent
  `published-evidence/evidence.json` — all 12 published-bearing pages agree exactly: IV raid 08-30 / 09-01 / 08-29, IV M+
  08-30 ×3, WH raid 08-31 ×3, WH M+ 08-28 / 09-10 / 09-01. Method publishes neither JSON-LD `dateModified` nor an in-body
  update line, so no `published` value was written for it.
- **Archon: day 22 of the wall, and the shape differs from yesterday's LOCAL probe.** All 12 registered page entries
  (11 unique URLs) fetched with the full browser header set: **HTTP 403, 6,054–6,159 B, "Just a moment" /
  challenge-platform, `__NEXT_DATA__` count 0 on all twelve** — the Cloudflare shape, where the 09-14 local run from a
  residential IP saw the 200-shaped "Human Verification" body on the same routes. Worth remembering that BOTH shapes are
  the same block and neither is readable; the assertion stays on `__NEXT_DATA__` presence. This run's pre-agent
  `source-health/evidence.json` independently saw one of each (raid heroic 403 cloudflare-challenge, M+ 200
  human-verification). Nothing merged, no snapshot stamped, 80 letters unchanged at 2026-08-25 per the 2026-09-05
  retention policy.
- `data/encounter-tiers.json` read directly rather than assumed: still `season: "s1"`, asOf 2026-08-17 — Fight selector
  stays hidden, S1 archive stays quarantined.

## 2026-09-14 (local, scheduled) — Archon walled a TWENTY-FIRST day, re-probed from a residential IP; 0 letters touched; run BEFORE today's nightly

- **Archon: still walled from home.** Root plus all 12 registered pages fetched with the full browser header set, 1 s apart:
  **HTTP 200 every time, 2,452–2,519 B, `<title>Human Verification`, `__NEXT_DATA__` count 0** on all 13 — the 200-shaped wall
  (the 09-13 nightly saw the 403 Cloudflare shape on the same routes from the runner). Same site-wide block, still impassable,
  still not something this project defeats. Nothing merged, no snapshot stamped; the 80 letters verified 2026-08-25 stay in the
  consensus at their original dates per the 2026-09-05 retention policy.
- **Icy Veins / Method / Wowhead deliberately NOT re-fetched.** The 09-13 nightly re-parsed all 240 cells ~24h ago (0 moves), and
  today's nightly is still pending — independently regenerating what CI is about to produce is what makes a local push
  unmergeable. Same call as 09-12/09-13.
- `freeze-season.mjs`: "8 source/bracket pairs still describe the live season — nothing to freeze"; archive unchanged.

## 2026-09-13 (nightly) — three live sources re-fetched and re-era-verified, **0 of 240 cells moved**; Archon walled a TWENTIETH day; Method's stale "Season 3" meta caught and overridden

- **Icy Veins** — 6/6 pages, direct browser-UA GET, HTTP 200, 196,512–344,019 B (sizes off the written files, never
  curl's compressed `size_download`). Parse bounded to each page's `<table class="tier-list">`, tier letter from the
  row's first `<td>` as `^([SABCDF])([+-])?$`, spec from the FIRST `alt=` after `class="tier-list-entry"` looked up
  WHOLE. Counts printed before merging: **raid 27/7/6 = 40, M+ 27/7/6 = 40**, 0 unmatched, 0 null tiers.
  `dateModified` re-read live: raid DPS 08-30, raid healer 09-01, raid tank 08-29, M+ all three 08-30 — identical to
  the registry AND to this run's pre-agent `published-evidence` artifact. Era from each ranking body: all six carry a
  Season 2 H2; the raid-healer page's TITLE still says "(Patch 12.0.7 / Midnight)" and is overridden by its own H2
  per body-over-title.
- **Method** — 2/2 pages HTTP 200 (157,217 / 163,868 B). Parsed per `.tier__tier <letter>-tier` container; raid 4
  blocks → 40 rows (S 6 / A 11 / B 17 / C 6), M+ 8 blocks → 40 rows (S 2 / A 13 / B 21 / C 4), 0 unmatched, 0
  duplicate (bracket, spec) pairs. The M+ page's extra blocks are the dungeon-difficulty lists, rejected by **ROSTER
  MATCH** ("Voidscar Arena", "Den of Nalorakk" fail to map) — never by container index.
  ⚠️ **NEW ERA TRAP, worth remembering:** both Method pages' `og:description` / `twitter:description` now read
  **"The War Within Season 3"** — stale social metadata from a previous expansion's template — while the ranking
  bodies read "Midnight Season 2 Raid, The Venomous Abyss" and "Mythic+ content and dungeon difficulty in Midnight
  Season 2" (Tactyks' byline names Midnight Season 2). An era check that counted "Season 3" in the raw document, or
  read the meta tags, would have marked BOTH pages season-ahead and dropped Method out of the consensus for both
  brackets. Body over title/meta, same precedent as the blue tracker's patch tag. `seasonVerified` stays `s2`.
- **Wowhead** — 6/6 pages with the full browser header set, HTTP 200, 75,254–345,422 B. Unescape `\/` FIRST, then
  slice `[tier-list=rows] … [/tier-list]` (never anchor on `WH.markup.printHtml` — the raid-healer decoy), tolerant
  whitespace on the tier label, specs from the `[spec-badge=<spec>-<class>]` slug. **40 + 40 rows, 0 unmatched.**
  `dateModified` live: raid ×3 = 08-31, M+ DPS 08-28, M+ healer **09-10**, M+ tank 09-01 — all matching the registry
  and the published-evidence artifact. Era from each H1: all six "… for Midnight Season 2" (raid healer with the
  documented DOUBLE space).
- **Pre-merge diff: 0 of 240 stored cells moved** across the three sources, so `apply-ratings.mjs` re-applied 240
  identical letters and the only registry change is **14 snapshot dates → 2026-09-13**. No `seasonVerified` value
  changed anywhere, so there was **nothing for `freeze-season.mjs` to freeze** (and the publish job runs it anyway).
- **Archon — walled day 20.** All eleven registered routes attempted fresh with the full header set: **HTTP 403
  every time**, 5,947–6,031 B of Cloudflare "Just a moment" / `challenge-platform`, `__NEXT_DATA__` count **0**.
  The pre-agent `source-health/evidence.json` (14:40:46Z) independently shows the two shapes side by side: raid
  heroic **403 cloudflare-challenge**, M+ **200 "human verification" (2,516 B)** — which is exactly why the
  assertion is on payload presence and never the status code. Nothing solved, replayed or automated past; nothing
  backfilled from Warcraft Logs. Per the 2026-09-05 retention policy the 80 letters verified 2026-08-25 stay in the
  consensus at their ORIGINAL dates — **no archon snapshot advanced**. `encounter-tiers.json` read off the file:
  still `season s1` / `asOf 2026-08-17`, so the Fight selector stays hidden and the S1 archive stays quarantined.

## 2026-09-13 (local, scheduled) — Archon walled a TWENTIETH day, re-probed from a residential IP; 0 letters touched

- **Scope: residential-only catch-up, run BEFORE today's nightly** (no 09-13 nightly had fired by 14:30Z; the
  schedule event has been landing 13:43–14:46Z all week). Icy Veins, Method and Wowhead were NOT re-fetched here —
  the nightly is expected to pull them within the hour, and a second independent regeneration of the same day is
  what makes a local push unmergeable. Their letters stand as the 09-12 nightly left them (240/240 S2, 0 moves).
- **The two ordinary public archon.gg routes re-probed from Riley's residential IP** with the full browser header
  set (raid Heroic DPS all-bosses; M+ 10 DPS all-dungeons this-week): both **HTTP 200**, **2,501 / 2,516 B**,
  `<title>Human Verification</title>`, `__NEXT_DATA__` count **0** — byte-for-byte the same 200-shaped wall the
  08-31, 09-06 and 09-12 local runs recorded. Not bypassed, no proxy, no challenge solved, nothing backfilled.
- **Nothing merged, nothing stamped.** `data/specs.json`, `data/sources.json`, `data/encounter-tiers.json`
  byte-identical to HEAD; all 11 archon snapshots stay at 2026-08-25 / 2026-08-18; the 80 stored letters stay in
  the consensus per the 2026-09-05 retention decision. Gearing guide harvest skipped: all three guide files
  `harvestedAt` 2026-09-08 (5.6 d) and the weekly `gearing-refresh` run of 09-08 is green.
- Manifest deliberately NOT rewritten (partial run).

## 2026-09-12 (local, scheduled) — Archon walled a NINETEENTH day, re-probed from a residential IP; 0 letters touched

- **Scope: residential-only catch-up.** The CI nightly landed `90e3607` at ~14:02Z with Icy Veins, Method and
  Wowhead all `success`, 240/240 re-verified S2 and 0 letters moved, so those three were NOT re-fetched here
  (independently regenerating what CI produced minutes earlier is what makes a local push unmergeable).
- **The two ordinary public archon.gg routes re-probed from Riley's residential IP** with the full browser header
  set (raid Heroic DPS all-bosses; M+ 10 DPS all-dungeons this-week): both **HTTP 200**, **2,501 / 2,516 B**,
  `<title>Human Verification</title>`, `__NEXT_DATA__` count **0**. Same 200-shaped wall the 08-31 and 09-06
  local runs recorded; the nightly's source-health artifact drew a 403 Cloudflare challenge on the raid route and
  the same 200 human-verification body on M+ from the runner four hours earlier. Not bypassed, no proxy, no
  challenge solved, nothing backfilled from Warcraft Logs.
- **Nothing merged, nothing stamped.** `data/specs.json`, `data/sources.json`, `data/encounter-tiers.json`
  byte-identical to HEAD; all 11 archon snapshots stay at 2026-08-25 / 2026-08-18; the 80 stored letters stay in
  the consensus per the 2026-09-05 retention decision.
- Manifest deliberately NOT rewritten (partial run).

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
