# refresh-tiers run log

Keep the newest ~20 entries. Prune only in a local or interactive run, and first move into
SKILL.md any lesson that lives only in the entries being dropped: the nightly publishes data/,
dist/ and these logs but never SKILL.md, so a nightly prune can delete a rule but cannot save
it. Pruned 2026-08-15 (these four logs held 64-78 entries each, and none had ever been pruned):
watch-creators had reached 270KB, over the Read tool's 262,144-byte gate, so a bare Read of it
returned NOTHING. Pruned again: refresh-metrics and watch-creators by the 2026-09-30
nightly, ptr-watch and refresh-tiers on 2026-10-06.
check-skill-logs.mjs warns, and the nightly digest names the log, once one passes 200,000
bytes in a Windows checkout.

This file holds NO machine state. The seen-set moved to structured data on 2026-08-08
(pending-transcripts.json seen[]/skipped[]/videos[] plus take urls) precisely because
regexing ids out of this prose absorbed 231 ordinary English words into a 950-entry set;
parse counts are logged "for the record" behind no gate. It is narrative memory, and it is
prunable. Durable RULES belong in SKILL.md, not here — the 2026-08-15 prune had to promote
~31KB of parser traps out of the prune range first, because they existed nowhere else.

Entries are sorted NEWEST FIRST by date. Two forms are in use ("- <date>" and "## <date>"),
they interleave, and refresh-tiers was chronologically scrambled before this prune — so sort
by parsed DATE, never by position. Never cite this file from anywhere else, by line NUMBER
or by phrase: a prune deletes both. On 2026-10-06 three files still pointed at refresh-tiers
entries pruned weeks earlier. A rule other files need goes in SKILL.md; when an entry's
history matters, cite the commit that added it.

## 2026-10-06 (nightly, THIRD run of the day) — Method + Wowhead refetched and re-parsed, **0 of 160 letters moved**; Icy Veins Cloudflare-403 (day 13); Archon wall (letters RETAINED)

- Method: direct GET, 184,377 / 172,248 B; 40 + 40 rows, M+ dungeon block rejected by roster match (8 dungeon names). "Last Updated" 5th October 2026 (M+) / 10th August 2026 (raid); era "Midnight Season 2", Devourer present → s2.
- Wowhead: six pages 200, 27/7/6 per bracket = 80 rows, 0 unmatched; titles "Midnight Season 2"; dateModified unchanged (08-28 … 09-10).
- Icy Veins: 6 × HTTP 403, 5,487 B "Attention Required! | Cloudflare". Archon: 403 "Just a moment...", no __NEXT_DATA__ (matches source-health receipt). No seasonVerified changed, no freeze needed.

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

## Pruned 2026-10-06 (interactive session)

Entries older than the 2026-09-18 nightly were removed here, per this file's own "keep the
newest ~20" rule: the file had reached **197,578 bytes** in a Windows checkout. 59 entries -> 22.
The pruned range (the 2026-08-28 local run to the 2026-09-18 local run) was scanned for durable
lessons first, and the ones that lived nowhere else moved into SKILL.md in the same commit,
under "Lessons promoted from `log.md` (2026-10-06 prune)": Icy Veins' letter cell and its
`<style>` blocks, TBD rows written as null, scale membership, Archon's page date against its
data, the order of `published` evidence, and Method's markup. Two stale statements in SKILL.md
were corrected with them: Archon's season status, and which of a page's title, meta tags and
ranking body decides its era. The Wowhead byline overlap this log first flagged on 2026-08-27
is now recorded in watch-creators' SKILL.md, as an open owner decision. The rest was run
narrative.
