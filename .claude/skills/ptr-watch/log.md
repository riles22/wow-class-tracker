# ptr-watch run log

Keep the newest ~20 entries; prune older ones when appending. Machine state the change
detectors rely on (parse counts, seen video IDs) must stay in the NEWEST entries or a
dedicated section — narrative prose older than that is prunable memory.

- 2026-07-31 (nightly CI, ~22:41Z — Opus 5; single-shot) · builds found: **0 new.** Thread
  Discourse `.json` fetched live: `highest_post_number` still **18**, newest post still
  Linxy 2026-07-31 — i.e. the build the 20:45Z local run logged 2h earlier. ptr-builds.json
  untouched, tier-set upkeep gate quiet (npm test green). · Wowhead news RSS (40 items, back
  to 07-25) polled live. **Three 07-31 headlines were OPENED and READ rather than judged by
  title** — the shape that has burned earlier runs: `news=382322` **is** build #18 (already
  logged); `news=382321` "Patch 12.1 PTR Hotfixes — Freightrunners Nerfed and Small Class
  Tuning" is a **PTR hotfix** report (trinket crit scaling 1020→689 at Myth 6/6, plus one
  Evoker and one Shaman line) with **no corresponding forum post** — hotfixes are not
  builds, so no feed entry is due; `news=382325` "Season 2 Mythic+ Dungeon Tuning Notes" is
  creature/dungeon tuning with **zero spec and zero set content** (Ruby Life Pools routing,
  Sethraliss/Kings' Rest/Murder Row/Blinding Vale/Voidscar numbers), the same shape as the
  07-28 dungeon-tuning post that prior runs also did not log. **Gotcha worth keeping:** the
  bare `wowhead.com/news=<id>` form is CloudFront-403'd from the runner; the RSS `<link>`
  slug form works, but **only with `curl -L`** (it 301s to a `…-<id>` canonical URL). ·
  **Writeups:** no new per-spec 12.1 review article in the window; the two that exist
  (news=382300 Resto Shaman 07-29, news=382219 Fury Warrior 07-25) are already distilled
  with `source` + `asOf`. 9 specs still have no writeup and still have no source article to
  distil. ⚠️ **FOR A HUMAN:** Fury Warrior's `ptr.asOf` reads **2026-07-31** while its own
  `sourceLabel` dates the Archimtiros review to **2026-07-25** — under the asOf rule that
  should be the source's publication date. Flagged, not touched: fixing it is a
  re-distillation decision, not an unsourced edit. · **WCL zones are evidence-only here**
  (no credentials on the runner): evidence verdict `rdps-broken`, so zone-54 (PTR raid),
  zone-52 (Dummy Dome) and zone-56 (PTR M+) rDPS state is **unchanged**, and zone-57
  (Tidebound Grotto) could not be probed at all — the standing 07-28 finding holds (WCL has
  not aggregated statistics for that zone; the raid opens Aug 18). The three deterministic
  raw-DPS series DID land pre-agent (103 / 27 / 27 rows) and were not touched. · **NO SEASON
  FLIP** — 12.1 launches Aug 11, Season 2 Aug 18; every live source still self-identifies
  Midnight S1 / 12.0.7. **STANDING OWNER REMINDER: `SNAPSHOT_PHASE` in render.mjs needs its
  one-shot flip around 2026-08-18.** · npm test 176 (164/12/0), build OK, snapshot written.

- 2026-07-31 (scheduled LOCAL run, ~20:45Z — Opus 5) · builds found: **1 NEW — forum post
  #18, Linxy 2026-07-31T18:49:03Z, "Week of July 31st — Class Tuning & Tier Sets".** It
  landed ~6h AFTER the nightly's forum check (12:51Z, which correctly recorded
  highest_post_number=17) and ~1.5h after the 10:14-local run, so this is the first run
  that could see it. Thread now highest_post_number=18 / posts_count=16. **Logged to
  ptr-builds.json**: 24 PvE specs affected, 27 highlights (24 spec lines + Delves, Events,
  PvP). Broad pass — San'layn Blood and Unholy AoE pulled back, Havoc buffed across its
  primary abilities, Devourer cleave trimmed, Balance nerfed / Guardian +8%, Devastation's
  Scintillation interaction fixed with baseline compensation, BM/MM cut, Arcane single-target
  raised, Fire +6%, Frost's set and 2-target cleave trimmed, Holy Paladin/Priest +5% healing,
  Shadow spread-cleave trimmed, all three Rogue specs given aura buffs, Elemental's Farseer
  Ancestors cut 20%, all three Warlocks' single target raised with Destruction's cleave
  trimmed, Arms trimmed with a 4-set rework, Protection Warrior +6%. · **TIER-SET UPKEEP —
  6 specs updated** (`tierSet.set2/set4/asOf/source` → post #18): Devastation Evoker 2-set
  Shattering Star 150%→50%; Frost Mage 2-set Glacial Spike 25%→20% + Icicle chance 5%→4%,
  4-set Shatter 10%→5%; Shadow Priest 4-set free Void Volley 125%→100%; Arms Warrior 4-set
  Slam bonus 10%→20% stacking to 5 (was 3). Two needed judgment rather than a clean swap:
  **Unholy DK** — the notes say "The Venomous Abyss set bonus – damage of Necrotic Bolt and
  Withering Grasp increased by 25%" WITHOUT naming the piece, so per the skill's
  "neither-is-safe" rule it went in as a dated parenthetical on set2 (the bonus that grants
  both spells), with the ambiguity stated in the text rather than silently resolved.
  **Demonology Warlock** — a TOOLTIP fix: the 4-set had displayed Implosion at 125%/150%
  (which is what we had stored, copied from that wrong tooltip) against intended 250%/225%;
  corrected with a dated note saying the effect itself did not change. · **Writeup upkeep**
  (no verdict flipped — writeups are the cited author's read, and an official tuning build
  is not that author speaking): Frost Mage's `ptr.set2/set4` commentary got "(Pre-07-31
  values…)" markers because it quotes numbers this build changed (the RPPM criticism still
  stands); Arms Warrior got a 07-31 `changes[]` line plus a note in `set4` that the build
  answers the review's own complaint — the 3-stack Slam cap it called commonly overflowed
  rose to 5 with the bonus doubled. · **NOT logged as a build:** Wowhead news=382321 "Patch
  12.1 PTR Hotfixes" (07-31) — a PTR-realm hotfix list (Freightrunner's Flask scaling,
  Evoker Twin Flame -20% / Consume Flame heal 300%→240% + no longer ignoring caster healing
  modifiers, Shaman Ride the Lightning +59%) with NO forum post behind it. Only forum-posted
  PTR builds go in the feed. Worth watching whether these reappear in a later dev-notes post.
  · **Wowhead article transport note:** news article pages CloudFront-403 from this
  residential IP even with the full browser header set that works on the tier-list pages
  (919-byte error doc); r.jina.ai renders them fine and was used for 382321. The build's
  `wowheadUrl` (news=382322, "Class Tuning and Dev Notes for July 31st - Rogue Aura Buffs")
  is taken from the RSS feed entry, which is authoritative for title+link+date. · **zone 54
  (PTR raid testing): EMPTY, ingested nothing.** Both cuts probed fresh (Heroic 4/10 and
  Mythic 5/20, rdps normalized) — HTTP 200, 3037 bytes, table headers render but ZERO
  `main-table-number` cells, with WCL's own "bosses will only be included after 50 public
  kills" notice. The 14-day rolling window has aged out the mid-July parses, as the
  standing finding predicts. **Stored 34 rows and the source snapshot deliberately LEFT at
  2026-07-28** so the staleness stays visible instead of being papered over. · **zone 57
  (Tidebound Grotto): still EMPTY** — Normal 10 / Heroic 10 / Mythic 25 all probed, 0 rows.
  Never yet aggregated by WCL; raid opens Aug 18. · **zones 52 (Dummy Dome) and 56 (PTR M+):
  NOT re-fetched — verified current instead.** Both already carry 2026-07-31 data from the
  10:14-local run of the same day (ptrDummy 27 specs; zone-56 27 DPS / 6 tank / 7 healer),
  and the local-run skill's scope rule is to verify-and-log what has already landed today
  rather than regenerate it. · No season flip: 12.1 launches Aug 11, Season 2 Aug 18 — post
  #18 is still PTR notes and every source still self-identifies as Season 1 / 12.0.7.
  SNAPSHOT_PHASE still needs its one-shot owner flip ~2026-08-18. · npm test 163 (152 pass /
  11 skip / 0 fail), build OK 842.3 KB / 40 specs / 31 PTR-tracked, snapshot written, rebuilt
  after it. Manifest deliberately NOT rewritten (partial run — see the run report).

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

- 2026-07-29 (nightly CI, Opus 5; single-shot) · **builds found: 0.** Official thread Discourse `.json` fetched live — title unchanged, `highest_post_number` still **17** (Linxy 07-23, class bug fixes), already logged; ptr-builds.json untouched, no set-touching highlight, no tierSet upkeep due. Wowhead RSS (40 items) read live; two genuinely new 12.1 items, both fetched in full: **news=382287 — the official unlock schedule: Patch 12.1 launches the week of Aug 11 (Tidebound Grotto world difficulty, Altar of Fangs, Heroic/M0), and Season 2 the week of Aug 18 (Venomous Abyss N/H/M/LFR-W1, Mythic+ S2, PvP S2, Grotto N/H/M flex).** This is an ANNOUNCEMENT, not a launch — every tier and metric source still self-identifies as Midnight Season 1 / Patch 12.0.7, so **no season flip** and no migration attempted. → **OWNER: `SNAPSHOT_PHASE` in render.mjs needs its one-shot flip around 2026-08-18**, which is now a dated event rather than an open question. Second item, news=382294 "More Mythic+ Dungeon Tuning on 12.1 PTR" (07-28), is a **dungeon** tuning post from a DIFFERENT forum thread (2330956) — S2 dungeon-test scheduling plus creature/boss mechanic numbers (Ruby Life Pools Hailburst −10%, Hailbombs −37.5%, Temple of Sethraliss last-boss flow rework) with zero class tuning and zero set changes, so it correctly stays out of the class-tuning build feed. Re-checked the 07-25 Fury Warrior 12.1 review (news=382219): already fully absorbed into Fury's writeup; none of the 11 specs still lacking a writeup has a published per-spec review in this RSS window. **zone-54 / zone-52 / zone-56 / zone-57: evidence-only** — no WCL credentials on the runner and no scraping attempted; `wcl-fetch/evidence.json` verdict `rdps-broken`, so the normalized raid-testing score, ptrDummy and PTR M+ medians all stay at 07-28. Zone 57 Tidebound Grotto could not be probed for the same reason; the standing 07-28 finding (WCL has not aggregated the zone) is unchanged, and the raid is now confirmed to open Aug 18.

- 2026-07-30 (nightly CI, Opus 5; single-shot) · **builds found: 0.** Official thread Discourse `.json` fetched live — title unchanged, `highest_post_number` still **17** (Linxy 07-23, class bug fixes), already logged; `ptr-builds.json` untouched, no set-touching highlight, no tierSet upkeep due. Wowhead RSS (40 items) read live. **ONE actionable item, and it closed a real gap: news=382300 (07-29) "Some Great Changes for the Spec — Restoration Shaman Review in Midnight Season 2" by Harreks, Wowhead's Resto Shaman guide writer.** Resto Shaman already HAD a writeup, but it was an undated `sourceLabel: "Wowhead 12.1 class preview"` with verdict **Negative** whose whole thesis ("weakest raid healer in the game", "only Farseer touched") predated the 07-21 rework — so this is the rewrite case the skill allows, not a tuning-only append. Verdict **Negative → Positive**, which is *his* read and not an editorial call: "a big set of very needed and very well-aimed changes", "I expect Restoration Shamans to perform incredibly well going into season two", and a flat "no" to "is Restoration Shaman weak?". Distilled his analysis of the four pillars (Unleash Life doubled so it stops being half a spell propped up by the 2-set + Earthen Accord now an intuitive additive +20%; Riptide periodic doubled + the new Swelling Tides; Healing Rain's 6th target as a raid-only ~20% buff that finally separates raid from M+ tuning; Farseer ancestors' Chain Heal nearly tripled), rewrote `set2`/`set4` around his reads (the 8s duration cut *offsets* the 6th target; the −30% Condensation cut *corrects* an earlier +300% over-buff that was itself a response to an owner-only-absorb bug), and rebuilt `watch` around the three problems he says remain — mana with zero active regeneration, ~20–30% Mastery effectiveness, and Totemic still favoured by a **hidden Surging Totem passive** that doubles rain-talent healing and isn't accounted for in hero-tree balance. The writeup now carries **`source` (URL) AND `ptr.asOf` 2026-07-29** instead of a bare label. → **FOR A HUMAN (agent boundary — `src/validate.mjs` is code the nightly cannot publish): `"Shaman|Restoration"` can now be deleted from `UNDATED_WRITEUPS`; the list is documented shrink-only and this entry no longer needs the grandfather.** The article quotes the Venomous Abyss 2-set/4-set values identical to the stored `spec.tierSet` (asOf 07-21), so no set change was due. Everything else new in the window is correctly non-build: **382299 "Patch 12.0.7 Hotfixes for July 28th" is a LIVE hotfix, not a PTR build**; 382301 delve schedule, 382296 Week-0 vault rules, 382291 Venomous Abyss schedule (story mode delayed a week), 382289 flex Mythic lair, plus non-gameplay items. **No season flip** — 12.1 the week of **Aug 11**, Season 2 the week of **Aug 18**; today is 07-30 and every tier/metric source still self-IDs as Midnight Season 1 / 12.0.7. → **OWNER: `SNAPSHOT_PHASE` in render.mjs still needs its one-shot flip around 2026-08-18.** **zone-54 / 52 / 56 / 57: evidence-only** — no WCL credentials, nothing fetched from warcraftlogs.com by any means; verdict `rdps-broken`, so the normalized raid-testing score, `ptrDummy` and PTR M+ medians all stay at 07-28, while the 3 deterministic raw series landed pre-agent (see refresh-metrics log). Zone 57 unprobed for the same reason; the 07-28 finding (WCL has not aggregated the zone) stands.

- 2026-07-30 (nightly CI, **2nd run of the day**, Opus 5; single-shot) · **No new PTR build, no new writeup material, no tier-set upkeep due.** Forum Discourse `.json` fetched live: `highest_post_number` still **17**, newest post still Linxy 2026-07-23 (class bug fixes) — already logged, `ptr-builds.json` untouched. Wowhead news RSS (40 items) fetched live back to 07-23; the only item newer than the 01:50Z run is a Season of Discovery event post (not Midnight). **Loose end verified rather than assumed:** Holy Paladin's `spec.tierSet.asOf` is 07-23 sourced from news=382254 ("Datamined Class Tuning and Tier Set Changes — **Sub Rogue**, Holy Paladin") while Subtlety Rogue's is still 06-18, which looked like a missed pairing. It is not — that article's Rogue line is **"Rogue Subtlety **12.0** Class Set 2pc — Finishing moves deal 1.5% → 1.0% more damage per combo point"**, i.e. the SEASON 1 set, not the Venomous Abyss S2 set that `spec.tierSet` records (Backstab / Shuriken Storm). No S2 bonus changed, no edit due, and validate.mjs's upkeep gate is correctly quiet. Useful precedent: a datamine headline naming a spec is not by itself a Season-2 tier-set change — read which set the spell belongs to. **Zones 54 / 52 / 56 / 57: evidence-only**, verdict `rdps-broken`; nothing fetched from warcraftlogs.com by any means; zone 57 unprobed and the 07-28 finding (WCL has not aggregated the zone) stands. Raid confirmed to open Aug 18 (Aug 19 EU). 11 specs still carry no `ptr` writeup (Frost DK, Havoc DH, Feral/Guardian/Resto Druid, Brewmaster, Holy Priest, Elemental Shaman, all 3 Warlocks) and no article covering any of them appeared in the RSS window. **Standing owner reminder: `SNAPSHOT_PHASE` in render.mjs needs its one-shot flip around 2026-08-18.**

- 2026-07-30 (LOCAL run, Opus 5 — collided with the CI nightly; see refresh-metrics log for the reconciliation) · **No new PTR build** — forum thread Discourse `.json` fetched live, `highest_post_number` still **17** (Linxy, 07-23). **No season flip**: 12.1 launches **Aug 11**, Season 2 **Aug 18** (Wowhead 382287), so `SNAPSHOT_PHASE` in render.mjs stays `12.1-ptr` — the owner action is ~2 weeks out. · WCL zones were fetched live from a residential IP and all matched what the nightly had already landed, so **nothing PTR-side was re-applied**: **z54** Heroic empty / Mythic 23 DPS + 7 healer + 4 tank = **139 parses**, byte-identical to the 07-28 restore (no new testing window); **z52 Dummy Dome** 1T 1092 / 2T 119 / 3T 60 / 5T 979 = **2250 parses** (down from 2447 — the rolling 14-day window moving, not a fetch failure); **z56** 27+6+7 = **7770 parses**; **z57 Tidebound Grotto** still returns "No statistics have been collected" at diff 3/10, 4/10, 5/25 and LFR 1/10 — unchanged since 07-28. · **Zone-52 gotcha correction:** the documented "each spec row appears twice → halve the parse count" did **not** apply this run — the fragment returned exactly one row per spec (26/18/12/27 raw, zero duplicates). Dedupe by (class, spec) rather than blind-halving, or the counts get quietly cut in half when the page is in this shape. · The **Restoration Shaman writeup flip (Negative → Positive)** this run distilled independently was already landed by the nightly from the same 07-29 Wowhead review (Harreks), correctly dated `ptr.asOf: 2026-07-29` — no change needed.

- 2026-07-31 (nightly CI, Opus 5; single-shot) · **builds found: 0.** Official thread Discourse `.json` fetched live — title unchanged, `highest_post_number` still **17** (Linxy 07-23, class bug fixes), already logged; `ptr-builds.json` untouched, no set-touching highlight, no `tierSet` upkeep due. Wowhead news RSS (40 items) read live back to 07-23. **VERIFIED RATHER THAN ASSUMED — a build number in a headline is not a build:** news=382284 (07-27) "Patch 12.1 PTR News and Datamining Recap for Last Week — **Build 68914**" was fetched and read in full, because an unlogged build number is exactly the miss this skill exists to prevent. It is a weekly **roundup**, not development notes: its only tier-set item is the already-verified news=382254 (Holy Paladin + the Subtlety Rogue **Season 1 / 12.0** set), and there is no matching forum post, so no feed entry is due. **That recap is also a useful index, worth reusing:** it lists every Wowhead per-spec 12.1 review article as a `[cta-button=…]` link — **exactly 21 specs have one**, all already distilled — while the remaining specs appear as plain text with no link. That independently confirms the standing finding that the **9 specs still without a `ptr` writeup** (Frost DK, Feral / Guardian / Restoration Druid, Holy Priest, Elemental Shaman, all 3 Warlocks) simply have no source article to distill — it is not a gap in our reading. Both review articles in the RSS window (382300 Restoration Shaman 07-29, 382219 Fury Warrior 07-25) are already distilled with `source` + `asOf`. Everything else new in the window is correctly non-build (delve renown, Lairs preview, housing blueprints, D&D crossover, Season-of-Discovery). **NO SEASON FLIP** — 12.1 the week of **Aug 11**, Season 2 **Aug 18** (Aug 19 EU); every tier and metric source still self-IDs as Midnight Season 1 / 12.0.7. → **OWNER: `SNAPSHOT_PHASE` in render.mjs still needs its one-shot flip around 2026-08-18** (~2.5 weeks out). **zones 54 / 52 / 56 / 57: evidence-only** — no WCL credentials, nothing fetched from warcraftlogs.com by any means; verdict `rdps-broken`, so the normalized raid-testing score, `ptrDummy` and PTR M+ medians all stay at 07-28, while the 3 deterministic raw series landed pre-agent (see refresh-metrics log). Zone 57 unprobed for the same reason; the 07-28 finding (WCL has not aggregated the zone) stands.

- 2026-07-31 (LOCAL run, Opus 5 — residential IP; **rebased-free re-apply on top of the same day's nightly 370e058**, per the new local-run skill: reset to origin/master and re-applied only what CI could not fetch) · **builds found: 0**, independently confirmed before the nightly's own check was seen: official thread Discourse `.json` fetched live, title unchanged, `highest_post_number` still **17** (Linxy 07-23); `ptr-builds.json` untouched, no set-touching highlight, no `tierSet` upkeep due. Wowhead RSS (40 items) read live — nothing new is a class build (382305 faction spotlight, 382306 delve renown, 382309 lairs, 382303 housing blueprints, plus Classic/non-gameplay). **No season flip**: 12.1 **Aug 11**, Season 2 **Aug 18**. → **OWNER: `SNAPSHOT_PHASE` in render.mjs still needs its one-shot flip around 2026-08-18.**
  · **WCL fetched LIVE from a residential IP — this is the whole value of the run**, since the nightly recorded `rdps-broken` and left five cuts unreachable. Transport verified healthy first with a control fetch of live zone 46 (54 rows). **zone 52 Dummy Dome ingested**: 1T 26 specs/1086 parses · 2T 17/101 · 3T 11/51 · 5T 27/939 = **2177 parses**, 27 specs, `ptrDummy` **07-28 → 07-31** (down from 2250 on 07-30 = the 14-day window moving). Augmentation's 1T skipped again (n=3 support artifact, 07-28 precedent). **Row shape re-confirmed: exactly ONE row per spec, zero duplicates — dedupe by (class, spec), never blind-halve.** **zone 56 PTR M+ ingested**: 27 DPS + 6 tank + 7 healer = 40 rows, **8040 parses**, 07-28 → 07-31.
  · ⚠ **zone 54 raid testing is now EMPTY upstream.** Probed every valid combo (difficulty 3/4/5 × size 10/20/25): valid combos return an empty `<tbody>`, invalid ones the 114-byte "No statistics" stub — so this is the **14-day rolling window ageing out the mid-July testing parses** (last window ~07-14/16; today is 07-31), not a fetch failure. Per the skill, empty = nothing to ingest: the 34 stored "12.1 PTR raid testing score (normalized)" rows were **left untouched at 07-28** and the zone-54 registry snapshot was deliberately **left at 07-28** while the other four were bumped, so the staleness stays visible rather than being papered over. Expect it to stay empty until the next testing window or the Aug 18 raid open.
  · **zone 57 Tidebound Grotto** still returns the "No statistics have been collected" stub at 3/10, 4/10 and 5/25 — unchanged since 07-28. · npm test 160 (149 pass / 11 skipped), build OK, `check-refresh --manifest` passed. Manifest deliberately NOT rewritten (partial run — local-run skill step 3).
