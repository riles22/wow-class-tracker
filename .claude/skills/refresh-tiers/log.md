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


