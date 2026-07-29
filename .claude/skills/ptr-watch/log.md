# ptr-watch run log

Keep the newest ~20 entries; prune older ones when appending. Machine state the change
detectors rely on (parse counts, seen video IDs) must stay in the NEWEST entries or a
dedicated section — narrative prose older than that is prunable memory.

- 2026-07-14 (second nightly run, later cycle, CI runner — Sonnet 5) · builds found: **0 new.**
  Forum thread (topic 2317811) newest post still **#13** (Linxy, 2026-07-09 00:08Z) —
  highest_post_number=13, posts_count=11, byte-identical again. Wowhead RSS since the
  earlier 07-14 run's 07-13 16:28 recap check: five new items, all non-tuning — "What is
  Classic+?" (382163), SoD community event extension (382162), Classic+ flight-paths
  op-ed (382154), "More Mythic Venomous Abyss Raid Testing on July 16th" (382157 —
  informational testing-schedule note, not class tuning), "The Big Haranir Revelation"
  lore piece (382153). No new writeup-material articles → no specs.json changes this
  cycle (Frost Mage's writeup from the earlier 07-14 run stands; PTR-tracked specs
  still 29). · **WCL API: MAJOR BREAKTHROUGH on reachability, but a new precise
  blocker found.** Both prior blanket findings ("Cloudflare 403s the HTML endpoint from
  this datacenter IP" and "GraphQL returns bare Internal server error") turned out to
  be conflatable — re-tested from scratch per this run's mandate to use ONLY the v2
  GraphQL API: (1) `POST /oauth/token` was silently getting Cloudflare-blocked (empty
  body) with a bare curl call — adding a real browser `User-Agent` fixed OAuth
  immediately (token issued, scopes view-user-profile/view-private-reports). (2) The
  GraphQL `/api/v2/client` endpoint was ALSO being Cloudflare-blocked (403 challenge
  page) even with a valid bearer token and UA — adding `Origin: https://www.warcraftlogs.com`,
  `Referer: https://www.warcraftlogs.com/`, and a `sec-ch-ua` header cleared that block
  too (confirmed via `rateLimitData` returning real JSON). **So the API itself is fully
  reachable this run** — a first, and worth keeping these headers in the standing recipe.
  (3) With the transport fixed, isolated the actual `characterRankings` failure by
  bisecting arguments one at a time on a known-good LIVE encounter (3176 Imperator
  Averzian) and independently on PTR encounter 3591 (zone 52 dummy): className,
  specName, partition, and difficulty args all work fine; the failure is the **`metric`
  argument value itself** — `metric: rdps` (and its siblings `ndps`, `cdps`, `bossrdps`,
  i.e. the composite/redistributed-credit metric family) throws "Internal server error"
  on EVERY encounter tried, while `metric: dps`, `hps`, `wdps`, and `default` all return
  normal paginated rankings. This is a genuine, narrow, reproducible server-side bug/gap
  in WCL's v2 API for the rDPS-family metrics specifically — not an auth, transport, or
  query-shape problem. Since every existing WCL metric in this tracker (zone 54 raid
  testing score, zone 52 Dummy Dome medians, zone 56 M+ testing) is methodologically
  rDPS (external-cooldown-redistributed damage, matching the retired HTML endpoint's
  `dpstype=rdps`), silently substituting raw `dps` under the same metric names would
  quietly change what's being measured — a Honest-source-typing violation — so per
  policy this was NOT done. Additionally, even if rdps worked, zone 54's cross-boss
  normalized 0–100 score has no GraphQL analogue at all (`characterRankings` is a
  single-encounter per-(class,spec) leaderboard, paginated ~100/page; reconstructing
  WCL's own cross-boss normalization algorithm from raw pages would be inventing an
  unvalidated statistic, not fetching one) — so full parity would still be impractical
  even with a working rdps field. **Net outcome: zone-54 (all 3 roles), zone-52, and
  zone-56 data all LEFT UNCHANGED at their 2026-07-09 baselines** (raid Heroic 27
  DPS/7 Healer/6 Tank specs; Dummy Dome 27 specs; M+ testing 27 DPS/6 tank/7 healer) —
  no data fetched or fabricated. **Follow-up for next session:** the Cloudflare-bypass
  header recipe (UA + Origin + Referer + sec-ch-ua) is now proven and should let a
  future run skip re-litigating transport and go straight to watching whether WCL fixes
  the `rdps`/`ndps`/`cdps`/`bossrdps` metric values (retry periodically — cheap, single
  bisection query) rather than assuming the whole API is down. Season-flip check: forum
  thread and all Wowhead RSS items this cycle describe 12.1 as still PTR/testing (the
  382157 item is literally about scheduling MORE PTR testing) — **no season-2-live
  signal, tracker unaffected.** npm test 65/65 pass, build OK (527.6 KB, 40 specs, 29
  PTR-tracked; no data files changed by this run, so no snapshot needed for this scope).

- 2026-07-14 (nightly scheduled run, CI runner — Sonnet 5) · builds found: **0 new.** Forum thread (topic 2317811) newest post still **#13** (Linxy, 2026-07-09 00:08Z) — highest_post_number=13, posts_count=11, byte-identical. Wowhead RSS since the 07-12 run: **"Patch 12.1 PTR News and Datamining Recap for Last Week - Build 68570" (Archimtiros, news=382158, 07-13)** verified via r.jina.ai to be a **recap article only** — "Build 68570" is the recap's own title numbering, not a new client build or forum post; it re-links the already-logged build 68569 dev notes plus the Arcane Mage (382132, already distilled) and Scalecommander Wingleader-reaction (382133, already distilled) pieces. No new forum post → no ptr-builds.json entry. **One genuine new writeup-material item: "A Reduction in Defensives? - Frost Mage Class Changes and Tier Set Review" (Dorovon, Wowhead Frost Mage guide writer, news=382151, 07-12)** → **added Frost Mage's first `ptr` writeup** (verdict Mixed — flat 4% dmg buff + a tier set with real rotation variety, but Dorovon calls the defensive pass "arguably a nerf to Frost specifically" — Improved Ice Barrier loses its HP bonus, Temporal Realignment less reliable — closing that Frost "will continue to struggle to survive in Season 2"; PTR-tracked specs 28→29). · **zone-54/zone-52/zone-56: WCL confirmed UNREACHABLE again this run** — re-tested both paths independently: v2 GraphQL `characterRankings` still returns a bare "Internal server error" on a known-good live encounter (zone 46 Imperator Averzian, correct args) AND on zone-52/56 PTR encounters directly (tested encounter 3591 and 12660) — same server-side/field-level failure as 07-12, not a query-shape issue; HTML endpoint 403s from this datacenter IP as expected. No data fetched or fabricated; existing 07-09 baselines (zone-54 Heroic 27/1121, zone-52 total 1446, zone-56 DPS 27/2732 tank 6/912 healer 7/912) left unchanged. npm test/build run combined with tiers/metrics/creators this cycle (see below).

- 2026-07-17 (nightly recovery run — Opus 4.8) · builds found: **1 new** (2 forum posts).
  Forum thread (topic 2317811) now tops at **post #15** (was #13): **#14** (Linxy,
  2026-07-14T21:57Z) "Week of July 14th — Class Changes & Tier Sets" + **#15** (2026-07-14T22:46Z)
  Rogue Outlaw addendum, matching Wowhead news=382170 "(Rogue Added)…Week of July 14th".
  Logged ONE ptr-builds.json entry (forumPostNumber 14, newest-first) with PvE tuning
  highlights for **17 specs across 10 classes**: Havoc DH (Inertia 18%→12%), Devourer DH,
  Resto/Guardian Druid, Preservation Evoker, BM/MM Hunter (Explosive Shot +100%), **Survival
  Hunter** (Flamefang Pitch removed + Bombardier/Wildfire rework), Arcane/Fire Mage, Prot
  Paladin (Hammer&Anvil −20%, 4pc 200%→100%), Holy Priest (mana −10%, Benediction +15%),
  Shadow Priest (Idol of N'Zoth Insanity halved), Resto Shaman (Healing Rain +20%), Aff
  Warlock (Hedonic Gorging new, Patient Zero removed), Destro Warlock (all dmg −5%), Outlaw
  Rogue (Killing Spree rework). Plus S2 systems (Corrosive Power/Coiled Isle), M+ S2 boss
  tuning, PvP/UI. **NOT logged:** 07-16 Wowhead "Class Tuning Hotfixes" (news=382189) — PTR
  hotfixes with no forum post, per canonical-source rule. · **zone-54/52/56 WCL UNREACHABLE**
  again (pre-agent evidence.json rdps-broken; 500 upstream) — baselines unchanged at 07-09.
  npm test 85/85, build OK.

- 2026-07-17 (nightly — Opus 4.8) · Forum thread (.json) + Wowhead RSS checked live. Thread tops
  at post #15 (Rogue Outlaw addendum, 07-14) under build #14 already logged — **no new forum build**.
  RSS newest 12.1 items = 07-16 "Class Tuning Hotfixes" (news=382189, PTR hotfixes, no forum post →
  not a build) + 07-14 datamined tier-set post (WL/SP/Surv, already in build #14). ptr-builds.json
  unchanged. **zone-54/52/56 WCL evidence-only, verdict rdps-broken** (500 upstream) — baselines 07-09.
  npm test 88/88, build OK.

- 2026-07-17 (nightly late run — Fable 5) · builds found: 0 new. Forum thread (topic 2317811, .json)
  still tops at post #15 (Rogue Outlaw addendum, 07-14) under build #14 already logged. Wowhead RSS
  newest 12.1 items: 07-16 "Class Tuning Hotfixes on Patch 12.1 PTR" (news=382189 — PTR hotfixes, NO
  forum post → not a build per canonical-source rule, unchanged triage), 07-16 "Heroic and Mythic
  Tidebound Grotto Raid Testing Tomorrow" (zone-57 raid, not tracked), 07-16 Holy Paladin tier-set
  review (news=382188 — spec already has a Clarius-sourced writeup; tuning already in build #14, no
  wholesale rewrite per policy). ptr-builds.json unchanged. · zone-54/52/56 WCL evidence-only —
  wcl-fetch/evidence.json verdict rdps-broken (metric:rdps 500 on enc 3176) — rDPS baselines stay
  07-09; deterministic step merged raw-DPS series pre-agent (dummy 103 rows refreshed; NEW pooled
  zone-54 Venomous Abyss 27 rows n=44-avg, zone-56 M+ keys 27 rows). npm test 91/91, build OK.

## 2026-07-17 (nightly, later) — no new PTR build
Forum thread (Discourse .json) tops at post #15 (Rogue Outlaw addendum, 07-14) under already-logged
build #14 — no new forum build. Wowhead RSS newest 12.1 items 07-16 or older, all prior-triaged
(07-16 Class Tuning Hotfixes = no forum post, not a build; 07-16 Holy Paladin tier-set review = spec
already has a Clarius writeup, tuning in build #14; 07-16 M+ mob-count tooltip = not tuning).
ptr-builds.json unchanged. zone-54/52/56 evidence-only — evidence.json rdps-broken; rDPS/normalized
baselines stay 07-09; deterministic step merged raw-DPS series (dummy 103, zone-54 27, zone-56 27).
npm test 91/91, build OK.

## 2026-07-17 (nightly, latest) — no new build; WCL evidence-only, rdps still broken
Forum thread `.json` fetched live: tops at post #15 (Linxy Rogue Outlaw addendum, 07-14 22:46Z)
under already-logged build #14 — NO new forum post. Wowhead news RSS fetched live: newest 12.1 items
are ≤07-16 (07-16 Class Tuning Hotfixes = PTR hotfixes, no forum post → not a build; 07-16 Holy
Paladin tier-set review = spec already has a writeup; 07-16 M+ mob-count tooltip = not tuning), all
prior-triaged. ptr-builds.json unchanged. Untracked-writeup candidates noted: Affliction/Destruction
Warlock still lack `ptr` writeups (07-14 Wowhead datamined recap is not verdict-bearing — no writeup
fabricated, honest source typing). WCL zones 54/52/56 evidence-only: evidence.json verdict
rdps-broken (metric:rdps 500 on enc 3176) — rDPS/normalized baselines stay 07-09; deterministic step
already merged the raw-DPS series (dummy 103, zone-54 raid 27, zone-56 M+ 27). npm test + build below.

## 2026-07-17 (nightly, 16:45Z) — no new build; WCL PTR evidence-only (rdps-broken)
Forum Discourse `.json` fetched live: `highest_post_number` = 15; top post #15 (Linxy, Rogue Outlaw
addendum, 07-14 22:46Z) already logged under build #14 — NO new forum build. Wowhead news RSS newest
12.1 items are ≤07-16, all prior-triaged: 07-16 "Class Tuning Hotfixes on Patch 12.1 PTR" (PTR
hotfixes, no forum dev-notes post → not a logged build); 07-16 Holy Paladin tier-set review (spec
already has a writeup); 07-16 M+ mob-count tooltip (not tuning). `ptr-builds.json` unchanged. Specs
still lacking writeups (Frost DK, Havoc DH, Feral, Guardian, Resto Druid, Brewmaster, Holy Priest,
Elemental, Aff/Demo/Destro Warlock) — the 07-14 datamined recaps carry no source verdict; none
fabricated (honesty rule). WCL PTR zones 54/52/56 are evidence-only this run: `wcl-fetch/evidence.json`
verdict `rdps-broken` (characterRankings metric:rdps → Internal server error), so the 5 rDPS/normalized
cuts stay at their 2026-07-09 baseline; the 3 raw-DPS cuts (dummy-raw 103, ptr-raid-raw 27,
ptr-mplus-raw 27) were merged by the deterministic fetch step before the agent ran.

## 2026-07-18 (nightly) — no new build; forum tops at #15, 07-17 RSS items out of class-build scope
Forum thread (Discourse .json) tops at post #15 (Linxy Rogue Outlaw addendum, 07-14) under already-logged
build #14 — no new development-notes build. Wowhead RSS newest 12.1 items (07-17) are PvP Class Tuning,
a Delve boss preview, and 'More Season 2 Mythic+ Tuning' (dungeon/boss, not class) — none a new class
build nor a per-spec review with a clear verdict; ptr-builds.json unchanged, no writeups fabricated.
WCL zones 54/52/56 are evidence-only (rdps-broken) — see refresh-metrics log; the 3 raw cuts landed via
the deterministic step. No zone-54/52/56 rDPS state change (frozen at 2026-07-09).

## 2026-07-19 (nightly) — no new forum build; WCL PTR cuts evidence-only (rdps-broken)
Forum thread (Discourse .json) checked live: highest_post_number 15, newest post #15 (Linxy, Rogue Outlaw
addendum, 2026-07-14T22:46Z) already logged under build #14 — NO new forum development-notes build.
Wowhead news RSS checked live: newest 12.1 items (07-16→07-18) are PvP Class Tuning (07-17), More Season 2
M+ tuning (07-17, dungeon/boss), a Season 2 Delve boss preview (07-18), housing decor (07-18), and a "Class
Tuning Hotfixes on PTR for July 16th" HOTFIX — none a new class development-notes build post, and no new
per-spec review with a clear verdict. izen's 07-17 recap corroborated the 07-16 healer hotfix tuning
(verified against the forum: no new dev-notes post → not logged as a build). ptr-builds.json unchanged; no
writeups fabricated. zone-54 (PTR raid) / 52 (Dummy Dome) / 56 (PTR M+) are evidence-only this run: WCL
evidence.json verdict rdps-broken → the normalized/rDPS zone cuts unreachable (data at 2026-07-09 baseline);
the 3 raw-DPS pooled cuts were merged by the deterministic fetch step (see refresh-metrics log). No season flip.

## 2026-07-19 (21:1xZ, 2nd nightly run)
Forum thread (Discourse .json) tops at post #15 (Linxy Rogue Outlaw addendum, 07-14) under
already-logged build #14 — NO new development-notes build. Wowhead RSS newest 12.1 items
(07-19 Temple of Sethraliss M+ S2 first-look; 07-18 delve boss preview + housing decor;
07-17 PvP Class Tuning + More S2 M+ Tuning; 07-16 Class Tuning HOTFIXES + Holy Paladin
review) — none a new class dev-notes build; the 07-16 Holy Paladin review is already
covered by the existing Clarius writeup (Positive). ptr-builds.json unchanged; no writeups
fabricated. zone-54/52/56 evidence-only (rdps-broken); 3 raw cuts merged by fetch step. No season flip.

## 2026-07-20 (nightly) — no new forum build; WCL PTR cuts evidence-only (rdps-broken)
Forum thread (Discourse .json) tops at post #15 (Linxy Rogue Outlaw addendum, 07-14) under already-logged
build #14 — NO new development-notes build. Wowhead RSS newest 12.1 items (07-19 Temple of Sethraliss M+ S2
first-look; 07-18 delve boss preview + wooden decor; 07-17 PvP Class Tuning + More S2 M+ Tuning; 07-16 Class
Tuning HOTFIXES + M+ tooltip mob-count) — none a new class dev-notes build post, none a per-spec review with
a clear verdict. ptr-builds.json unchanged; no writeups fabricated. zone-54/52/56 evidence-only: WCL
evidence.json verdict rdps-broken → the normalized/rDPS cuts unreachable (data at 2026-07-09 baseline); the
3 raw-DPS pooled cuts merged by the deterministic fetch step (see refresh-metrics log). No season flip.

## 2026-07-21 (nightly)
Forum Discourse JSON + Wowhead news RSS both checked live. Official thread tops at post #15 (Linxy Rogue
Outlaw addendum, 07-14), already accounted for under logged build #14 — NO new development-notes build.
RSS newest 12.1 items (07-21 Combat Potions/Consumables; 07-20 datamined cinematic text [lore], Ruby Life
Pools M+ S2 first-look; 07-19 Temple of Sethraliss S2 first-look) — none a class dev-notes build. The 07-15
"Datamined Class and Tier Set Changes — Warlock/Shadow Priest/Survival Hunter" reflects the already-logged
07-14 build and predates last run. No season flip (all sources still "Season 2 (PTR)" / 12.0.7 live).
ptr-builds.json unchanged; no writeups fabricated. WCL zones 54/52/56 evidence-only (rdps-broken per
wcl-fetch/evidence.json).
## 2026-07-21 (interactive, owner-requested) — tier-set audit + backfill; gate added
Owner asked whether spec-card tier-set sections track PTR set changes. They did NOT:
39/40 `tierSet` entries still carried the 06-18 Wowhead datamine (only Holy Pal 06-30),
and posts 10/11/14 held THREE builds of set revisions — several never even logged as
highlights (MM, Holy Priest, Outlaw, Enh, RSham 06-30; Balance, RDruid-2set, Frost Mage,
Holy Pal 07-08; Shadow 07-14). Session egress blocks the forum, so verbatim wording was
fetched via a branch-dispatched wcl-probe run (runners reach it fine; Discourse topic
.json holds all posts' raw). Backfilled 20 specs' tierSet (asOf = newest change build,
source = the forum post), appended dated "(pre-<date> …)" notes to 12 writeups whose set
commentary reviewed replaced designs, and added the missing set highlights to the feed.
NEW GATE: validate.mjs fails when a build highlight names a spec + set keyword newer
than that spec's tierSet.asOf — step 3 now documents the pairing. ALSO re-probed WCL
(same run): GraphQL rdps family still 500s; the site statistics tables are
Cloudflare-challenged from datacenter runners (HTTP 403 challenge on z52/z54/z46) —
Dummy Dome rDPS stays unreachable from CI; a residential/local run remains the only
catch-up path.

- 2026-07-23 (nightly CI, Opus 4.8; single-shot) · **No new PTR build.** Forum thread (Discourse .json) highest post is still **#16** (Linxy, 2026-07-21 "Week of July 21st"), already logged with 24 specs / 32 highlights + Venomous Abyss tier-set changes. Wowhead news RSS since then is only datamine recaps of #16 (Hunter/Shaman/Warrior tier-set changes, 07-22) plus Season 2 M+ dungeon tuning + PvP hotfixes — none a new class build. No season flip (thread still "12.1 PTR Development Notes"; sources self-ID Midnight S1/12.0.7). **WCL: evidence-only** (agent holds no creds) — `wcl-fetch/evidence.json` verdict **rdps-broken** (characterRankings metric:rdps → Internal server error on enc 3176, attemptedAt 12:12Z). The 5 rDPS/normalized cuts (z46 raid, z47 M+, z54 PTR raid, z56 PTR M+, z52 Dummy Dome rDPS) stay UNREACHABLE at their 2026-07-09 baseline. The 3 raw keys landed via the frozen fetch recipe before the agent started: dummy-raw 103 specs (players 1T:2000 2T:192 3T:140 5T:1986), ptr-raid-raw 27 specs (z54 HC, 6 populated bosses: Nek'zali 370/Sentinels 363/Vashnik 678/Lost Explorers 150/Sszorak 184/Twin Fangs 146; Coiled Altar & Ula'tek 0=untested), ptr-mplus-raw 27 specs (z56, all 8 dungeons 994-2000 players) — asOf 07-23, agent did not touch these rows.

- 2026-07-25 (nightly CI, Opus 5; single-shot) · **No new PTR build.** Forum Discourse `.json` fetched live: `highest_post_number` is still **17** (Linxy, 2026-07-23), already logged — `ptr-builds.json` unchanged. Wowhead news RSS (40 items) checked live; no new dev-notes build. No season flip. **Two tier-set/writeup actions closed out last run's open items:** (1) the **Sub Rogue** tier-set line the 07-24 run flagged as unverifiable was fetched (Wowhead datamine 382254) and turns out to be a **12.0 / SEASON 1** class-set nerf (finishers 1.5% → 1.0% per combo point) — NOT a Venomous Abyss S2 change, so `spec.tierSet` was correctly left alone; record that so a future run doesn't "fix" it. (2) The same datamine shows the **Holy Paladin 12.1 4-set** shipped reading "**mana cost is increased by 50%**" while forum post #17 announced **60%** — `tierSet.set4` now quotes the datamined build wording verbatim and discloses the discrepancy; `asOf` stays the 07-23 build date and `source` moved to the datamine article. Also distilled Archimtiros's **2026-07-25 Wowhead Fury Warrior 12.1 review** into the Fury `ptr` writeup: verdict stays **Mixed** (his own read — "objectively good changes… just kind of mediocre"), the old Raging-Blow `watch` item is now RESOLVED (Hack and Slash buffs Raging Blow damage instead of refunding charges), and the writeup finally carries a `source` URL instead of a bare label. **WCL zones 54 / 52 / 56 evidence-only** (agent holds no creds): verdict rdps-broken, so the normalized/rDPS cuts stay at the 07-09 baseline; the 3 raw-DPS pooled series landed via the deterministic step (z54 6 of 8 bosses populated, z56 all 8 dungeons, z52 all 4 dummies).

- 2026-07-26 (nightly CI, Opus 5; single-shot) · **No new PTR build.** Official thread Discourse `.json` fetched live — `highest_post_number` still **17** (Linxy, 2026-07-23, "Class Bug Fixes"), already logged as build #17; `ptr-builds.json` unchanged and no set-touching highlight to pair, so no `tierSet` upkeep was due. Wowhead news RSS (40 items) checked live: nothing newer than 2026-07-25, and both 07-25 items are non-build (in-game map coordinates UI; the Fury Warrior 12.1 class review that the 07-25 run already distilled into the Fury writeup). No spec writeups changed. **No season flip** — thread still "Midnight: Curse of Ula'tek PTR Development Notes", every tier source still self-IDs Midnight Season 1 / 12.0.7, and Wowhead's own 07-24 headline is "Midnight Season 1 Officially Ending Soon" (i.e. S2 not live yet; the PTR is a marked release candidate, so expect the flip soon — `SNAPSHOT_PHASE` in render.mjs is the owner action when it lands). WCL zone-54 / 52 / 56 were **evidence-only** per the runner rule: `wcl-fetch/evidence.json` verdict `rdps-broken` (encounter 3176 still returns a bare Internal server error), so the normalized raid-testing score, `spec.ptrDummy` and the PTR M+ medians all stay frozen at the 07-09 baseline. The three deterministic raw-DPS series DID land pre-agent: zone 52 **104** rows (1T 2000 / 2T 221 / 3T 148 / 5T 2000 players), zone 54 Heroic 27 rows pooled over 6 populated bosses (Coiled Altar and Ula'tek at 0 players = untested windows, not an error), zone 56 27 rows over all 8 dungeons (1294-2000 players each).

- 2026-07-27 (nightly CI, Opus 5; single-shot) · **No new PTR build.** Official thread Discourse `.json` fetched live — `highest_post_number` still **17** (Linxy, 2026-07-23, "Class Bug Fixes"), already logged as build #17; `ptr-builds.json` unchanged, no set-touching highlight, so no `tierSet` upkeep was due. Wowhead news RSS (40 items) checked live: newest items are 07-26 and non-class (Turbulent Timeways leveling, in-game map coordinates UI); no dev-notes or class-tuning post since 07-23. **No season flip** — thread still "Midnight: Curse of Ula'tek PTR Development Notes", every source self-IDs Midnight Season 1 / 12.0.7, and the RSS still carries "Midnight Season 1 Officially Ending Soon" (07-24) alongside "Patch 12.1 PTR Now a Release Candidate" — the flip is close, and `SNAPSHOT_PHASE` in render.mjs is the owner action when it lands. **ONE writeup updated (a backlog item, not a new build):** the 2026-07-21 Wowhead **12.1 Arms Warrior class review** (news=382216) had never been distilled — no prior run picked it up even though the Fury review got distilled on 07-25. Appended its two bug findings to Arms' `changes[]` (the S2 2-set's Slam splash unintentionally triggers Mortal Wounds, spreading Deep Wounds to every nearby target for +5-9% on top of the splash's own 3-6%; Dreadnaught now counts as a distinct spell → extra Martial Prowess stacks and Battlelord resets in 2-target play; and the Slayer **Executioner asynchronous-buff bug** that schedules a removal event even at max stacks, so stacks expire early and Bladestorm CDR is erratic), rewrote `watch` around the review's own "still strong, but uncertain" read, and gave the writeup a clickable `source` URL alongside the existing `sourceLabel`. Verdict stays **Mixed** — the source's read, not an editorial call. The review quotes the Arms set bonuses verbatim identical to the stored `tierSet` (asOf 07-21), so no set change was due. **Reachability note:** direct Wowhead article pages are CF-403 from the runner but r.jina.ai with `x-no-cache: true` renders them fine, and the news RSS itself is reachable directly. WCL zones 54 / 52 / 56 were **evidence-only** per the runner rule: verdict `rdps-broken`, so the normalized raid-testing score, `spec.ptrDummy` and the PTR M+ medians stay frozen at 07-09; the three raw-DPS series landed pre-agent (z52 104 rows, z54 Heroic 27 over 6 populated bosses — Coiled Altar and Ula'tek at 0 = untested windows, z56 27 over all 8 dungeons).

- 2026-07-28 (nightly CI, Opus 5; single-shot) · **No new PTR build.** Official thread Discourse `.json` fetched live — `highest_post_number` still **17** (Linxy, 2026-07-23, "Class Bug Fixes"), already logged; `ptr-builds.json` unchanged, no set-touching highlight, so no `tierSet` upkeep was due. Wowhead news RSS (40 items) checked live: the only new 12.1 item is **382284 "PTR News and Datamining Recap for Last Week - Build 68914"** (07-28) — fetched and read in full, it is a link roundup of already-logged content (the 07-24 Sub Rogue / Holy Paladin datamined tuning, mounts, housing, M+ creature health, the encrypted 12.1.5 build) plus the per-spec class-review index; **it announces no new dev-notes post and no new tuning**, so nothing was logged from it. The other new item, "Blood Death Knight Apex Talent Hotfixed to Reduce Damage Taken" (07-28), is a **LIVE 12.0.7 hotfix, not a PTR build** — correctly kept out of the feed. **Re-verified the 07-24 datamined tier-set article (382254) is fully absorbed**, since a recap resurfacing it is exactly how a missed set change would look: Holy Paladin's `tierSet` already cites it with the 07-23 amendment (notes say 60%, the datamined spell carries 50% — the build value is what is stored), and the Subtlety entry in it is `Rogue Subtlety **12.0** Class Set 2pc` — the SEASON 1 set, not the Season 2 set `spec.tierSet` stores, so no change was due there. Useful check to repeat: cross-reference the recap's class-review link list against the specs still lacking a `ptr` writeup (11 of 40) — none of those 11 has a published review, so there is no writeup backlog left from Wowhead's editorial series. **No season flip.** WCL zones 54 / 52 / 56 were **evidence-only** per the runner rule: verdict `rdps-broken`, so the normalized raid-testing score, `spec.ptrDummy` and the PTR M+ medians stay frozen at 07-09; the three raw-DPS series landed pre-agent (z52 104 rows, z54 Heroic 27 over 6 populated bosses — Coiled Altar and Ula'tek at 0 players = untested windows, z56 27 over all 8 dungeons).

- 2026-07-28 (LOCAL evening run — residential-IP WCL restore; reconciled onto the nightly's same-day commit deaa475) · Discovery: the local clone was 19 days stale while the CI nightly kept running — an initial full local refresh was rebuilt on the stale base, then abandoned (preserved on branch local-catchup-20260728) and only its unique value re-applied semantically onto origin/master. builds found: 0 new beyond the already-logged #17 (local fetch confirmed highest_post_number=17; launch dates seen in RSS: 12.1 = Aug 11, S2 = Aug 18, PTR now release-candidate). · **WCL canonical series RESTORED** (all were frozen at 2026-07-09 by the runner's broken rdps recipe; its improvised "Median raw DPS (… pooled)" fallback rows — 158 across specs — were removed now that the canonical series are current): **zone-54: testing moved Heroic→Mythic** — Heroic (diff 4) now 0 rows upstream (partition 2 also empty), Mythic (diff 5/20) has 23 DPS + 7 healers + 4 tanks, 139 parses (n=1–9; top DPS Affliction 93.31/n5, Devourer 86.78/n6, Balance 86.53/n9) — "12.1 PTR raid testing score (normalized)" re-sourced from Mythic, 6 stale Heroic-only rows removed (Feral, Guardian, Fire, Assassination, Outlaw, Prot Warrior). **zone-52 Dummy Dome refreshed** (1T 1208 / 2T 111 / 3T 58 / 5T 1070 = 2447 parses; 27 specs; Aug 1T skipped, n=3 support artifact; ptrDummy asOf 07-09→07-28). **zone-56 PTR M+ refreshed** (27+6+7 cuts, 7273 parses). Live zones in refresh-metrics log. ⚠ ACTION NEEDED: the nightly runner's WCL path has been broken since 07-10 ("rdps-broken: 5 unreach, 3 raw") — its fallback rows will likely reappear tomorrow unless the runner recipe/v2-API path is fixed. npm test 148 pass, build OK (40 specs, 29 PTR-tracked, 742.8 KB).

- 2026-07-28 (interactive follow-up — Tidebound Grotto watch added) · Riley asked to add WCL Tidebound Grotto raid-testing data. Probed zone 57 exhaustively (4-agent workflow wf_46b9e948-8c0 + gap-fill: 34 combos — difficulties 1/2/3/4/5 × sizes 0/10/15/20/25 × partitions 1/2 × boss 0/3379): zone exists (single boss 3379 "Nymrissa Wavecaller"; LFR/N/H size 10, Mythic size 25, no partitions) but EVERY statistics table returns WCL's honest "No statistics have been collected for this zone, difficulty, size and region yet." — nothing to ingest (hard rule: no data invented). Testing did occur (~07-14+, izen/Kalamazi coverage; raid opens Aug 18 per Wowhead) — WCL just hasn't aggregated the zone. Added step 7b to SKILL.md with the verified recipe + reserved metric names ("Median rDPS/HPS (12.1 PTR Tidebound Grotto)[, tank]", era ptr, bracket raid, amount aggregate, projection-safe by name) so nightly runs auto-ingest the moment tables populate. No data files changed.
