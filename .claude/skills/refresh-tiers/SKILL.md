---
name: refresh-tiers
description: Refresh the tracker's tier-list ratings from every tier-list source in data/sources.json (currently Icy Veins, Method, Wowhead, Archon). Use when the user says "refresh tiers", "update the tier lists", "pull new rankings", or when snapshot dates in data/sources.json look stale (tier lists move weekly-ish).
---

# Refresh tier-list ratings

Fetch the current Midnight tier lists live and merge them into `data/specs.json`.
**Never fill ratings from model memory** — Midnight postdates training cutoffs.

## Procedure

1. Read `data/sources.json` for the pages of each `kind: "tier-list"` source
   (currently icyveins, method, wowhead, archon — the registry is the source
   of truth, not this list). **Fetch each page inline, one source at a time.** Do NOT fan
   out subagents: the nightly runner passes `--disallowedTools "Agent,Task"`, so the call
   fails, and backgrounding slow work to "wait" for it was the root cause of the
   2026-07-15→17 lost nights. Era-verify as you go (step 2).
2. Era-verify every page: "Midnight", the CURRENT live season per `PHASES.liveSeason`
   (S2 / 12.1 since the 2026-08-18 flip — the 12.0.x cue this line carried until
   2026-08-19 was one season stale), and Devourer DH present in DPS
   — and STORE the observation: write `seasonVerified: "s1" | "s2"` on the page entry in
   sources.json (whichever season the page actually described). This is not bookkeeping:
   `consensusFor` drops a source from a bracket's consensus when its page's season does
   not match the current live season (PHASES.liveSeason, normalize.mjs) — the DECISION-1
   transition rule. Mis-recording it either keeps a stale list averaged in or silently
   shrinks the consensus. Pages flagged `ancillary: true` (Archon per-boss/per-dungeon/
   survivability) still get `seasonVerified` written for the record, but they no longer
   gate the letter consensus (2026-08-19 audit, C1) — never add or remove that flag in a
   run; it is Gate-0 registry structure.
   lists. Unverifiable → skip that source, never guess.
   **A patch inside the season does not change the season** (added 2026-09-25, for
   12.1.5). A live list retitled "12.1.5" (or "Patch 12.1.5") that still ranks Season 2
   records `seasonVerified: "s2"`, exactly as its "12.1" title did — `PHASES.liveSeason`
   does not move for a mid-season patch, and reading the new number as a new season would
   drop the outlet from the consensus. A list labelled **"12.1.5 PTR"** (or any pre-launch
   12.1.5 preview) is not a live ranking: never write its letters as that source's live
   ratings, and never take `snapshot` or `published` from it. If a registered URL serves only
   such a preview, that page is unverifiable for this run: skip it and give the reason in the
   manifest row.
   **Except any era-gated source** (`era: "ptr"` in the registry — currently NONE:
   `icyveins-ptr` was retired at the 2026-08-18 flip, its letters superseded by the live
   Icy Veins S2 pages): such a source must era-verify the OTHER way, as the NEXT patch,
   and a page reading the current season is the wrong page for it. Record each page's OWN date in `published`
   (JSON-LD `dateModified`, or the in-body "Last UPDATED" line) as well as `snapshot`.
3. Write rows `[{class, spec, bracket: "raid"|"mplus", source, tier}]` using the EXACT
   class/spec names from `data/specs.json` to a scratch file.
4. `node src/apply-ratings.mjs <file>` — refuses to write on unmatched rows.
5. Update `snapshot` dates (and moved URLs) in `data/sources.json`.
5b. **If this run changed ANY `seasonVerified` value, run `node src/freeze-season.mjs`
   BEFORE the verify below** (audit 2026-08-14 — this step was missing entirely, which is
   how a standalone tier refresh could publish phantom movement). Step 4's era-verify is the
   only thing in the project that writes `seasonVerified`, so this skill is exactly where a
   season flip is first observed. The moment an outlet moves ahead it drops out of
   `consensusFor`, and unless its final live-season letters are lifted into
   `data/season-final.json` first, the mean recomposes and the ▲▼ engine narrates a registry
   decision as spec movement — 16 cells the night Wowhead flipped, the largest on record.
   The nightly runs this in its publish job, so a nightly-driven refresh is covered; a LOCAL
   or standalone run of this skill is not, and pushing without it leaves a day of published
   movement nobody wrote. It needs real git history (it walks for the freeze point) and is
   normally a no-op printing "nothing to freeze". See the local-run skill, step 4.
6. `npm run test:quiet && npm run build`. If any data/ file changed this run, finish with
   `node src/snapshot.mjs` (movement baseline; loadData skips baselines identical to the
   current state, so ordering vs the build is safe). **PREPEND** a line to
   `.claude/skills/refresh-tiers/log.md` (date · sources refreshed · notable tier
   movements) so the next run can diff — insert directly under the header block, never
   `cat >>` at the end. The log is NEWEST-FIRST and says so in its own header. This line said
   "Append" until 2026-08-15; obeying it is what left THIS log chronologically scrambled, so
   that a Read returned a July first page while this skill said to read "the last run".

## Gotchas (hard-won — trust these over intuition)

- **Archon outage retention (owner-confirmed 2026-09-05):** last verified in-season
  letters remain in consensus during failed fetches, with their original dates. An
  outage does not silently remove Archon; earlier three-source claims were wrong.
  In CI read `source-health/evidence.json` first. It checks ordinary representative
  raid/M+ routes and catches HTTP-200 verification pages; it does not certify every
  feed, season, page date, or any fresh observations. Never bypass a challenge or
  stamp dates from a diagnostic. Read `encounter-tiers.json`'s actual season/date
  before describing it; its S1 archive stays quarantined until S2 data lands.

- **Archon raid pages carry THREE tierLists** (popularity/throughput/survivability).
  The default view groups by popularity — read the `metric: "throughput"` tierList.
  M+ pages use `metric: "score"`. Parse the `<script id="__NEXT_DATA__">` JSON from
  raw HTML; WebFetch's markdown conversion silently drops it.
  **The registered raid pages are the HEROIC ones since 2026-08-25** (owner decision:
  early-S2 letter basis is Heroic while Mythic is sparse — see the archon methodology
  text in sources.json for the switch-back trigger). The registry URL is the authority
  as always — fetch what pages[] names, never assume a difficulty. Do NOT read letters
  off the ancillary "Mythic rankings" pages; they feed the numeric "(Mythic)" families
  only (refresh-metrics' lane). Same parse either way.
- **Wowhead guide URLs move.** The tier lists live under
  `/guide/classes/tier-lists/{role}-rankings-{raids|mythic-plus}`; older URL shapes 404.
  Body is JS-rendered. **Transport, in this order — the r.jina.ai proxy is DEAD on
  `wowhead.com/guide/*` (IP-403 since 2026-08-03) and must not be tried first:** fetch with
  the FULL browser header set (a UA-only request is Cloudflare-403), then parse the embedded
  `WH.markup [tier-list=rows]` block out of the raw HTML. **Keep the WH.markup instruction** —
  it is the current working parse, and the zero-row incidents on record were parser-anchoring
  bugs, not transport drift, so "the parse is broken" is the wrong first conclusion.
  Wowhead's M+ DPS scale includes **A+**; role pages can have empty tiers.
- **Method's raid list URL is `/guides/tier-list/raiding`** (not `/raid`), and it may
  omit specs entirely (Vengeance DH was absent 2026-03) — omit, don't invent.
- ✅ **WoWMeta is NO LONGER a tier-list source — do not fetch it here** (retyped to
  `kind: "metrics"` 2026-07-31, owner-approved; recipe now lives in **refresh-metrics**).
  It was removed from the letter consensus because two defects made its letters unusable:
  (a) they are Ckmeans clusters of an undocumented "Popular Choice"/"Optimized Potential"
  toggle that defaults to **player count**, so they ranked representation rather than
  performance (hard rule 3) — Augmentation had the highest lb_ci of all 27 M+ DPS specs
  while sitting in B; and (b) the HTML transport served a stale S3 prerender
  (`dateModified 2026-03-23`) that committed data matched 27/27 against the live view's
  9/27 — 130 days old under a `2026-07-31` stamp (hard rule 1). The tracker now publishes
  its `lowerBound` as a NUMBER from the JSON API. **Consensus is four tier-list sources:
  Icy Veins, Method, Wowhead, Archon.**
- **A 200 is not freshness — check the page's OWN published date.** The wowmeta freeze
  went unnoticed for a week because every run fetched successfully, parsed 40/40 rows,
  logged "0 moves", and wrote today's date. Nothing in the tracker surfaces a stale
  *tier-list* source: `check-refresh`'s staleness gate reads the agent-written
  `snapshot`, and `dataHealth()` only inspects metrics / ptrDummy / fightProfile. So for
  every tier source, read the date the page publishes about itself — JSON-LD
  `dateModified`, a "Last updated" string, Archon's `lastUpdated`, WoWMeta's
  "Last updated:" — and log it. If it disagrees with the transport you used, say so and
  do not stamp the snapshot with today. Archon's label is a page date, not a data date: it
  has moved without the data and stood still while the data moved (see "Lessons promoted
  from `log.md`" at the end of this file).
- **Transport can silently change the DATA, not just the delivery.** Direct-vs-proxy on
  wowmeta returns different datasets (March-23 prerender vs July-28 live), which is why
  the 07-17→07-24 "WoWMeta reclustering" entries (26/40, 24/40, 18/40, 28/40 moves) are
  **transport-induced view flips, not upstream movement** — they nonetheless fed
  consensus, the ▲▼ engine and `data/history/`, so the movement narrative for those
  dates is not trustworthy. Record which transport you used, every run.
- **`icyveins-ptr` — RETIRED at the 2026-08-18 flip** (history, kept for the next PTR
  cycle's source): it was the era-gated (`era: "ptr"`) M+-only PTR list, never in the
  consensus, feeding only the 12.1 forecast. At the flip it left the registry, the
  ratings and the contract; the live `icyveins` pages carry the S2 letters now. Rules
  that outlive it, for whichever source occupies the next-patch slot at 12.2: era-verify
  the OTHER way (the page must self-identify as the NEXT patch); `TBD` is a real
  upstream state written as explicit `null`, never omitted; a NEW band appearing
  upstream is an owner escalation (`scales.json` is CODEOWNERS-owned); and re-read
  `published` from the page every run — the published gate
  (docs/published-gate-scope.md) reds the night a carried-forward value contradicts it.
- **murlok-style numbers are NOT tiers.** Only the four LIVE tier-list sources feed
  consensus; era-gated lists are shown and feed the projection, never the mean.
- A new source first needs a scale in `data/scales.json` (check each tier round-trips
  through the consensus bands) and a registry entry — config only, no code.
- **One source rewriting much of its own list fails the per-source churn gate** (added
  2026-10-06, audit 2026-10-04 F2). `check-refresh --manifest` fails when a source+bracket
  changes more than `sourceChurn.maxChangedLetters` of its letters against HEAD, or more
  than `maxTwoStepChanges` of them by two or more places on its own scale (limits in
  `data/required-sources.json`). That is the whole-list parse-bug shape of the 2026-07-09
  Method shift, which the consensus anomaly gate cannot see. A bracket whose
  `seasonVerified` advanced this run is exempt. Otherwise check the parse first. If the
  outlet really rebuilt its list, leave the letters as verified and put the evidence in
  `anomalyAckProposal`: each `source:bracket` pair the gate named, the outlet's page URL,
  the page's own date and what changed, then the `source_churn_ack` value a human would
  re-run with (it waives only the pairs it names). Never pass `--churn-ack` yourself. If
  the parse is wrong, re-parse, or revert that source's letters and record `parse_error`.
  Never change `seasonVerified` to earn the exemption.

### Parser traps promoted from `log.md` (2026-08-15 context audit)

Every rule below was learned by a run getting it wrong, and each one produced HTTP 200
with plausible-looking output. They lived only in run-log prose until the log outgrew the
Read tool and had to be pruned; they are here because losing them risks fabricated
letters, not just a wasted run.

- **Print per-page row counts every run and reconcile them against the roster shape** —
  27 DPS + 7 healer + 6 tank = **40** per source-bracket (a 40/40 source only LOOKS partial
  next to the DPS page). Nothing mechanical catches a per-page shortfall: ratings UPSERT, so
  a page that parses zero rows leaves the previous letters standing, the stored count never
  drops, and both `required-sources`' row floor and `maxRowDropPct` stay green on a run that
  fetched nothing. Every silent parser failure on record returned HTTP 200 and surfaced ONLY
  because a count was printed — the Wowhead decoy `printHtml` (33/40 raid, 2026-08-01), the
  Method `findall` that ate the last tier block (29 rows of 39, all ten C-tier specs gone,
  0 "unmatched" reported, 08-04), the double-space era check (74/80, 07-27), the missing
  open paren (26/27, 07-30).
- **Wowhead: unescape first, then find the block — never anchor on the `printHtml` call.**
  Inside the `WH.markup` payload the BBCode is JSON-escaped (closing tags read
  `[\/tier-label]`), so a literal search for `[tier-list]` finds *nothing* and the page looks
  like it changed shape when it has not (2026-07-31). Unescape `\/` → `/` across the whole
  document, then search it for `[tier-list=rows] … [/tier-list]`. Anchoring on
  `WH.markup.printHtml(` is what produced the zero-row incidents the transport bullet above
  alludes to: the raid-HEALER page carries **two** such calls and the first is a 1.2 KB
  decoy, which returned 0 rows for that page while the other five parsed fine (2026-08-01).
  Also **match the tier label with tolerant whitespace** — Wowhead writes
  `[tier-label bg=q3]B [/tier-label]` with a trailing space inside the tag, and a strict
  regex mis-mapped 16 B-tier M+ DPS specs up to A before a cross-check caught it (07-20).
  If the prose `N. Spec Class (X Tier)` list is ever used as a fallback it is typo-ridden:
  normalise `X-Tier` → `X Tier` and match `[SABCDF]\+?` (a `[+-]?` pattern invented 13
  phantom `S-`/`A-`/`B-` moves, 07-30 / 08-02) and tolerate a missing `\(?`.
- **Icy Veins transport: curl from a home connection.** GitHub's runners have drawn a
  Cloudflare 403 ("Attention Required!", about 5.5 KB, no `tier-list-entry`) on all six
  pages since 2026-09-23, so the nightly records the row `blocked` and changes nothing, and
  every local run does the refresh (local-run skill, Scope). From home, curl with a browser
  user agent plus `Accept` and `Accept-Language` returns 200, while Node's `fetch` with the
  same headers still gets the 403, so the block keys on the client as well as the IP
  (2026-09-27). No proxy and no challenge solving. Count `tier-list-entry` in each body
  before parsing: a 403 page is not an empty list.
- **Icy Veins: take the FIRST `alt=` after each `class="tier-list-entry"`, and look the
  `"Spec Class"` string up WHOLE.** The first-alt rule is what excludes the spell-icon alts
  inside the expandable details blocks without needing an allow-list (2026-07-31). Splitting
  the alt positionally is the other half: at the LAST space `"Vengeance Demon Hunter"` yields
  class `Hunter` (2026-08-02). It cannot mislabel a spec — measured against the current
  roster the six two-word-class specs (Death Knight, Demon Hunter) go UNMATCHED and step 4
  refuses the whole file — so a positional split costs a run, not the truth. Wowhead's
  `[spec-badge=<spec>-<class>]` kebab slug (`vengeance-demon-hunter`) sidesteps the question.
- **Archon: resolve every entry from its `icon` "Class-Spec" token, never the display name**,
  and note `tiers[].entries` is a list **of lists**. Archon writes display names as
  `"BeastMastery Hunter"` / `"Blood DeathKnight"`, which match no roster entry; the icon reads
  `"DemonHunter-Devourer"` (2026-07-26 / 08-01). *(Corrected 2026-10-06: this bullet said
  Archon still described S1 and its S2 pages had yet to land. All six letter pages were
  verified `s2` by 2026-08-25, and Archon has fed the live consensus since, its last
  verified letters retained through the wall (outage bullet above). A first read after
  weeks behind the wall may move many letters at once: check the parse, then follow the
  per-source churn gate bullet.)*
- **Method's M+ page carries more than one tierlist and the extras are dungeon-difficulty
  blocks.** Reject by ROSTER MATCH — the eight dungeon names and the site logos simply fail
  to map — never by position: "take the first" and "take container[2]" are both on record and
  neither survives a page rebuild (2026-07-24 / 07-30 / 08-15).
- **Era-verify from the page's own title, changelog and ranking body — never a substring
  count, and never an exact-spacing literal.** The raid-HEALER page once titled itself
  "Midnight  Season 1" with a DOUBLE space, and a strict `/Midnight Season 1/` check silently
  dropped that page (74 rows instead of 80, 2026-07-27). Recorded false positives on the
  other side: editorial `[-- Season 2 --]` markers in Wowhead's markup and Icy Veins changelog
  rows for Dragonflight / TWW. Step 2 records what a misread costs. When they disagree, the
  ranking BODY wins over the title and the meta tags: the Icy Veins raid-healer page has kept
  the title "(Patch 12.0.7 / Midnight)" since at least 2026-08-28, and since 2026-09-13 both
  Method pages' `og:description` / `twitter:description` have named "The War Within Season
  3", while each of those bodies ranks Midnight Season 2.
- **`data/encounter-tiers.json` must carry a `season` stamp** (top-level, e.g.
  `"season": "s2"`) — the season the Archon encounter pages actually described,
  era-verified the same way as the tier pages' `seasonVerified`. The UI hides the
  whole Fight selector when the stamp is not `PHASES.liveSeason` (added 2026-08-19
  after the S1 file kept serving Imperator et al. into the live S2 grid), so an
  Archon S2 encounter refresh that forgets the stamp ships a hidden control, and a
  wrong stamp mixes seasons — stamp what you verified, never what you expect.
- **When `data/encounter-tiers.json` is rewritten, keep the COMMITTED encounter `name`
  values.** `page.title` is the generic page headline ("Midnight DPS Rankings and VS / DR /
  MQD Tier List"), not the boss name — taking it renames every encounter to the same string
  and destroys the per-boss attribution (2026-07-27). Single-source by design, so nothing
  cross-checks it.

### Lessons promoted from `log.md` (2026-10-06 prune)

The 2026-10-06 prune dropped the entries that carried these. As in the section above, each
one came from a run that got it wrong at HTTP 200.

- **Icy Veins: the tier letter is the first `<td>` of each row, and no class names it.** Each
  page has one `<table class="tier-list">`, and each `<tr>` is `<td>S</td><td>…entries…</td>`.
  A selector keyed on a `tier-list-tier-label` class found all 80 specs and returned every
  letter null (2026-09-12): the row count was perfect and the data was not. Print each page's
  count of NON-null letters beside its row count; the only legitimate null is a TBD row
  (below). Specs still come from the first-`alt` rule above.
- **Icy Veins: strip every `<style>…</style>` block before looking for the table, and assert
  exactly one `<table class="tier-list">` per page.** Cutting the document at the LAST
  `</style>` works on five pages and not on raid-healer, where a `</style>` sits at byte
  215,504 and the table at 152,329: 0 rows at HTTP 200 (2026-09-08). Ratings upsert, so the
  stored healer letters would have stood and every row gate stayed green; only the printed
  count caught it. It is the Wowhead `printHtml` decoy again in another form.
- **Icy Veins: a live list can carry a `TBD` row.** It is a literal `<tr><td>TBD</td>` row
  (Windwalker Monk and Frost Death Knight on the M+ DPS page in late August 2026, both rated
  on 2026-08-31). Write each spec in it as explicit `null`; never omit it and never guess. The
  parse then reads 80 while the RATED count that `required-sources` checks reads 78, and that
  gap is expected. A later letter for one of those specs is an arrival (null → letter), not a
  move.
- **Read a scale's `tiers` as the array it is: `new Set(scales.scales.<id>.tiers)`.**
  `Object.keys` on it gives `"0".."6"`, so every real letter fails the membership test and all
  six healthy Icy Veins pages parse 0 rows (2026-09-17), which looks exactly like an upstream
  rebuild until the printed count says otherwise.
- **Archon's `lastUpdated` is not its data date, in either direction.** On 2026-08-12 it
  advanced on all six aggregate pages while every parse count held; on 2026-08-16 it stayed
  pinned while every raid number moved, and five letters with them. The parse counts are the
  re-cut detector: compare them with the stored counts before calling a night "no change".
- **`published`: JSON-LD `dateModified` first, then the in-body "Last updated" line, never the
  visible changelog.** `resolvePage` in `src/fetch-published.mjs` applies that order. The Icy
  Veins raid-tank page has no in-body line and its changelog tops out at "08 Aug. 2026", so a
  changelog read gives 2026-08-08 and looks right; `dateModified` said 2026-08-29
  (2026-09-04). Check the stored value against the pre-agent published-evidence artifact: one
  that contradicts it reds the publish gate.
- **Method: rows come from `div.tier__tier`, the letter from its `tier__title`, and the specs
  from `tier__entries`, each named only in a `data-original-title` attribute (looked up
  WHOLE).** So a text search of the tag-stripped page reports Devourer missing from a list
  that ranks it (2026-09-04). Confirm Devourer from the parsed rows; a failed text search is
  not an era failure.
- **Prune this skill's log only in a local or interactive run** (2026-09-04). A nightly's
  `SKILL.md` edits are never published (the publish job stages `data/`, `dist/` and the skill
  logs), so a nightly prune can delete a lesson but cannot move it here. The log's header says
  the same.
