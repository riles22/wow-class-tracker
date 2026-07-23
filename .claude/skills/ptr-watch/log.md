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
