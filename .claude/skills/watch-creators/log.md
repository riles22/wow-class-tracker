# watch-creators run log

Keep the newest ~20 entries; prune older ones when appending. Machine state the change
detectors rely on (parse counts, seen video IDs) must stay in the NEWEST entries or a
dedicated section — narrative prose older than that is prunable memory.

- 2026-07-14 (nightly scheduled run, CI runner — Sonnet 5, second cycle) · yt-dlp already current at the requirements.txt pin (2026.07.04; not upgraded per runner policy). RSS: **all 24 feeds (23 transcribable creators + izen general lane) returned 200** (single fetch each, polite 1.5s sleep between). Dedup vs the full seen-set (log.md + creator-takes.json) + the prior cycle's 4 carried-over pendings: only **2 genuinely new uploads** since the prior 07-14 cycle — Supatease **OmC9bQZBlds** "Road to Rank 1 Multiclasser Day 3 Part 2" (07-14, same off-topic PvP-multiclasser shorts pattern as the already-skipped OmC9bQZBlds-adjacent batch — title-filter fail) and Kalamazi **5W-ULkFRjVI** "12.1 PTR The Venomous Abyss Normal Full Clear | Warlock POV" (07-14, raid-clear POV not a spec-changes analysis — same pattern as his recurring stream/testing VODs — title-filter fail); both added to seen. · **Retried all 4 carried-over pending transcripts** (Y6dW5dWoKGo LBNinja7 Holy Priest, yjJgdFZtscI Tettles Moonkin/Balance, z9sYqwzriCk izen M+ tank meta, gCNuP2AWvjU izen raid DPS meta) — **yt-dlp hit YouTube's bot-check ("Sign in to confirm you're not a bot") on all 4, consecutive failures** — not hammered further per the runner-IP-block mandate; all 4 remain **pending (datacenter IP blocked)**, NOT added to seen, for a future local run to catch up (Holy Priest video is now on its 4th pending run, Moonkin/izen-tank on their 3rd). · videos processed: **0 transcripts** · takes added: **0** · metaNotes added: **0**. **community.json unchanged** — izen's `latest`/`verifiedDate` already reflect the 07-12 gCNuP2AWvjU title from the prior cycle (confirmed current, no newer izen upload this cycle); no specialist creator `latest` fields refreshed (not warranted this cycle — no new confirmed-content videos). npm test 65/65 pass, build OK (527.6 KB byte-identical to committed dist — no data/ changed, so `node src/snapshot.mjs` not run this cycle).

## Seen/processed videoIds (nightly run 07-14 second cycle)
Triaged-and-skipped (add to seen): OmC9bQZBlds (Supatease) · 5W-ULkFRjVI (Kalamazi). Pending (datacenter IP blocked, NOT added to seen — retry next run): Y6dW5dWoKGo (LBNinja7, 4th pending run), yjJgdFZtscI (Tettles, 3rd pending run), z9sYqwzriCk (izen, 3rd pending run), gCNuP2AWvjU (izen, 2nd pending run).

- 2026-07-14 (nightly scheduled run, CI runner — Sonnet 5) · yt-dlp already current (2026.07.04; `pipx` reinstall confirms no newer release). RSS: **all 24 feeds (23 transcribable creators + izen general lane) returned 200** (single fetch each). Dedup vs the full seen-set (log.md + creator-takes.json): a handful of genuinely new uploads since the 07-12 run, plus the 3 still-pending videos from that run resurface (never added to seen). · **yt-dlp hit YouTube's bot-check ("Sign in to confirm you're not a bot") on ALL 5 attempted transcript fetches** — consecutive failures, not hammered further per the runner-IP-block mandate; logged **pending (datacenter IP blocked)** below. Pending (carried over + new): **Y6dW5dWoKGo** LBNinja7 "Another Day, Another BUFF | Midnight 12.1 PTR Oracle Holy Priest" (07-12, in-scope Holy Priest — 3rd run pending), **yjJgdFZtscI** Tettles "Moonkin is back" (07-11, likely Balance Druid PTR take — 2nd run pending), **z9sYqwzriCk** izen "12.1 PTR: Mythic+ & The Tank of the moment" (07-11, general-lane M+ meta read — 2nd run pending), **gCNuP2AWvjU** izen "Season 2 PTR | Mythic Raid Testing - DPS Results: Best & Most Popular Specs (so far)" (07-12, NEW — general-lane raid meta read), **wxCpwD8ER6o** Dalaran Gaming "What's Changing For Warlocks In Patch 12.1? (Early PTR Preview)" (07-12) — **out of scope regardless of transcript** (his community.json `specs` cover Druid/Hunter/Mage/Rogue/Shaman only, no Warlock — same recurring out-of-scope-overview pattern as the 07-10 Warrior video); added to seen rather than left pending since scope, not content, is the blocker. · videos processed: **0 transcripts** · takes added: **0** · metaNotes added: **0**. **izen `latest`/`verifiedDate` refreshed from RSS title alone (no transcript needed for this field) → "Season 2 PTR | Mythic Raid Testing - DPS Results: Best & Most Popular Specs (so far)" / 2026-07-12.** · **Triaged-and-skipped (title-filter fail / stream-VOD pattern, add to seen):** DalaranGaming SQ5DNrlHsmM (housing, non-topic), lQEykMhX_MU (PvP duels, recurring pattern); AutomaticJak 2aXklFznqwA "MW/Hpal M+! Testing | UI in description!" (07-13 — matches his established stream-VOD title convention, same pattern as the 07-12-skipped 0it3HMqL0KE/Oa6nG5dJKP4); Shindigg DT67B8xeSX0 (live DH keys stream), ftxFiy5fQyw (fellowship stream); YoDaTV cbFSD-MJwJ4 "Ruby Life Pools +18 | Lightsmith Prot Pally" (key POV, same pattern as prior Annihilator-VDH key-POV skips); LBNinja7 zJtyLN3DIKs "Mistweaver PUSH! Shaking Off Rust!!" (07-14 — identical livestream-VOD title to the already-skipped zuMR6znNSWw/woMigwo2V9c); Kalamazi _JtQm1mCeQ0 "PTR Keys and Normal Raid Testing | Sub Event on Twitch" (stream); Supatease ×4 "Road to Rank 1 Multiclasser" shorts (OmC9bQZBlds, _8Ql72T2LS8, ALejbJl58Gg, Csigy9hhOCw — off-topic/PvP). npm test/build run centrally after all parallel refresh steps this cycle (see combined nightly summary).

- 2026-07-17 (nightly recovery run — Opus 4.8) · yt-dlp 2026.07.04 (current). **All 24
  unique creator YouTube RSS feeds returned 200.** ~15 on-topic 12.1/S2 analysis videos
  found since the last processed run. **Transcripts UNREACHABLE from this datacenter IP** —
  yt-dlp returns YouTube's "Sign in to confirm you're not a bot" block (documented CI
  behavior) — so **0 takes / 0 metaNotes distilled this run**; the take-worthy videos are
  queued PENDING for a local catch-up run. community.json latest fields left unchanged.
  General-creator LEADS (Dratnos "PTR Update: Class Tuning & Corrosive Powers" IYq5bWKuOiU
  07-14; Kalamazi Warlock-changes 6nr1LrYp0xc 07-15) corroborate the 07-14 forum build
  already logged from the canonical thread by ptr-watch — no unverified build added.
## Pending (in-scope, transcript-blocked — distill on next local run)
Obli Xhem4-XtOmc (DK meta shift S2, 07-14) · Shadarek tB6Gse0qckA (Havoc DH "Bleak Outlook",
07-14) · Kalamazi 6nr1LrYp0xc (Aff talent / Destro nerfs, 07-15) + MbRU0TaQKww (07-15) ·
MadSkillzzTV YczUs2OcaJQ (Mistweaver M+, 07-12) + faDcvghS7ao (Holy Paladin, 07-13) +
QimwxPWKd_s (best M+ healer HPal/Priest, 07-13) · Tettles fw9buyf2n1o (Balance "Moonkin is
back", 07-15) + 0nW0wnI4OTo (gearing, 07-15) · Supatease HuRjN73exFk (12.1 healer class
changes, 07-17) · AutomaticJak TXv5nof2mZw (HPal PTR M+, 07-16). Triaged-skipped: PvP-duel
/ stream-VOD / key-POV content (Dalaran PvP duels, YoDaTV/Shindigg/Shadarek/Woxtoxic/Critcake
streams, Supatease "Road to Rank 1" VODs) and roundup-only videos (Dratnos, out of Arms/Fury scope).

- 2026-07-17 (nightly — Opus 4.8) · yt-dlp 2026.07.04 (current). YouTube RSS heavily IP-throttled:
  only **7/25 feeds returned entries** (Obli, Tettles, LBNinja7, Publik, Dalaran Gaming, MadSkillzzTV,
  Kesslive); the other 18 gave persistent HTTP 404 across 3 staggered retry rounds (datacenter block
  that did not clear in-run). **Transcripts UNREACHABLE** — yt-dlp bot-check ("Sign in to confirm
  you're not a bot"), verified on one video, not hammered — **0 takes / 0 metaNotes distilled**.
  community.json/creator-takes.json unchanged. New in-scope PENDING (transcript-blocked): MadSkillzzTV
  12.1 healer M+ testing set — JytzZ28QBkY (best M+ healer, 07-11) · 8hzzon6tf9M (Disc/Holy/RSham, 07-10)
  · r5tL2gAEhSw (Holy Pal, 07-10) · nSw9iA4kGBE (MW/HPal/Pres, 07-09). Prior pending (Obli Xhem4-XtOmc,
  Shadarek tB6Gse0qckA, Kalamazi 6nr1LrYp0xc/MbRU0TaQKww, Tettles fw9buyf2n1o/0nW0wnI4OTo, Supatease
  HuRjN73exFk, AutomaticJak TXv5nof2mZw) carries forward — those feeds were among today's 404s.

- 2026-07-17 (nightly late run — Fable 5) · yt-dlp 2026.07.04 (not touched per run rules). **All 25
  unique creator RSS feeds returned entries this run** (the earlier same-day 404 block cleared).
  38 unseen videos since the seen-set. **Transcripts still UNREACHABLE** — yt-dlp "Sign in to
  confirm you're not a bot" (verified once on vK-qyvXOVYM, not hammered) — **0 takes / 0 metaNotes
  distilled**. New in-scope PENDING (transcript-blocked): izen vK-qyvXOVYM (S2 M+ TOP-5 DPS
  metaNotes archetype, 07-14) · YoDaTV S4VNrinPFTA (12.1 M+ tierlist update w/ Prot Pally read,
  07-15; in-scope via Paladin entry). General-creator LEADS verified: izen B2iGuHL_iPI (07-15,
  "Round #5 of Balance Tuning — Prot Pal nerf/HPriest buffs") matches already-logged build #14 +
  the 07-16 no-forum-post hotfixes — no unverified build added; **izen latest field refreshed**
  (community.json, verifiedDate 07-17). Prior pending list carries forward (Obli Xhem4-XtOmc,
  Shadarek tB6Gse0qckA, Kalamazi 6nr1LrYp0xc/MbRU0TaQKww, Tettles fw9buyf2n1o/0nW0wnI4OTo,
  Supatease HuRjN73exFk, AutomaticJak TXv5nof2mZw, MadSkillzzTV JytzZ28QBkY/8hzzon6tf9M/r5tL2gAEhSw/
  nSw9iA4kGBE).
## Seen/triaged this run (07-17 late — add to seen-set)
Pending in-scope: vK-qyvXOVYM (izen metaNotes) · S4VNrinPFTA (YoDaTV Prot Pally tierlist) ·
B2iGuHL_iPI (izen lead, latest refreshed) · 6wo6wkSvznQ (izen 07-02 mage-defensives lead, tuning
already in logged builds). Triaged-skipped: chLJ-HXwGBs, OGqHbH5nHOI (Kalamazi stream/sub-event) ·
E3s8PdtytPA, c5iedJiEJXc, 3sO9f48Opzg, fl_fuoYOpz8, sKXS6NKrnDc, 7za0qAgY-pw, 1Bn3akReOi4,
6n3vvDqWaEE, osE5k0vToqI, onKjBxnmbno, dA3J8TLErXg, xoU2T53L99M, 6NIaXiYh9zE (Supatease PvP/VOD/
out-of-scope Rogue+Hunter) · SgX0IB4INHk, ryDr3EeAAMM (Critcake reclear/keys POV) · vSIzz6fBctY,
w-iGfC8y5_M, YObr6op6JOg, CwIYQl4u1Q0, W39Qd5_iRQA (Dalaran PvP duels/livestreams) · Q3JU6l4YPbg
(Dalaran cross-class M+ roundup — no-roundup rule) · zd-Y-hHmlKs (Dalaran Priest preview —
out of listed scope, flagged for human scope review) · n2ga6kdiGVQ, oWLz9ZyV9Ko (LBNinja7 generic
how-to/short) · TNoCCQWk01A, ztdsBTukkkw (Shindigg short/reclear) · JI7BWAjtfOI, YDwvn8SaXfU,
NihCvD5hHjA (YoDaTV key POVs) · rhE3OYf-VPU (AutomaticJak title-push VOD) · JLLekdtEaUs
(MadSkillzzTV addon video) · t_a8Z280vPE (Shadarek key POV).

## 2026-07-17 (nightly, later) — feeds polled, no new videos, transcripts IP-blocked
All 25 unique creator RSS feeds fetched live and FRESH (newest uploads 07-17 Kalamazi/Supatease,
07-16 several) — every recent upload already in the seen-set. **No genuinely-new videos since the
last run**: the newest UNSEEN item is 2026-06-30, i.e. pre-log-window back-catalog (log's seen-set
only spans 07-03→07-17), not a new publish. Transcripts still UNREACHABLE — yt-dlp "Sign in to
confirm you're not a bot" (verified once on vK-qyvXOVYM, not hammered) — **0 takes / 0 metaNotes**.
izen (general creator) newest is 07-15, already seen + prior-verified vs build #14 — no new build
lead. Prior pending queue (izen vK-qyvXOVYM, YoDaTV S4VNrinPFTA, + carried Obli/Kalamazi/Tettles/
Supatease/AutomaticJak/MadSkillzzTV) unchanged, awaits local transcript catch-up.

## 2026-07-17 (nightly, latest) — 3 genuinely-new videos, transcripts still IP-blocked; android-client experiment FAILED
All 25 unique creator RSS feeds fetched live and FRESH (25/25 OK, one retry pass). Diffed vs the
455-id seen-set: 175 "unseen" ids, but all but 3 are ≤2026-06-30 pre-log-window back-catalog (the
seen-set only spans 07-03→07-17), NOT new publishes. **3 genuinely-new videos (published 07-17,
after the last run):**
  · AutomaticJak `Rmkxzb1QQSQ` "BIG MW/Pres Nerfs, Holy Shock STILL Sucks and MORE Healer Tuning" —
    IN-SCOPE (AutomaticJak lists Evoker/Monk/Paladin/Priest; MW=Mistweaver, Pres=Preservation,
    Holy Shock=Holy Paladin all in scope). Would be distillable → QUEUED PENDING (transcript blocked).
  · Dalaran Gaming `xRk0mNKX6OE` "Everything Changing For Evokers In Patch 12.1 (Early PTR Preview)" —
    OUT of Dalaran's listed scope (Druid/Mage/Rogue/Shaman, not Evoker); flagged for human scope
    review, NOT attributed.
  · Tettles `fy1ojTpwNyo` "How Mythic+ Changed World of Warcraft Forever" — M+ history retrospective,
    not spec tuning/tier material; triaged-skipped.
**Bot-check experiment result (owner-approved 2026-07-17):** the `player_client=android` extractor
arg did NOT bypass the datacenter block — yt-dlp returned HTTP 429 + "Sign in to confirm you're not
a bot" on Rmkxzb1QQSQ (verified ONCE, not hammered). YouTube's client hole appears closed for the
runner IP; per the skill, videos queue pending and the fallback decision (managed transcript API /
residential proxy / self-hosted runner) is the owner's. **0 takes / 0 metaNotes distilled.**
izen (general) has no genuinely-new video (newest publish is prior 07-15, already seen + verified vs
build #14); no new build lead. New pending: AutomaticJak Rmkxzb1QQSQ; prior pending queue carries
forward for local transcript catch-up.

## 2026-07-17 (nightly, 16:45Z) — 2 new in-scope videos queued, transcripts still no-credentials
All 25 unique creator RSS feeds polled live (25/25 OK). Diffed vs seen-set (326 ids in log) +
pending queue (18). Recent window (≥07-15): 36 entries; all but 3 already seen/pending. **3
genuinely-new videos published 07-17:**
  · AutomaticJak `LHPjq9142qM` "MW Title Push then PTR M+" — AutomaticJak scope Evoker/Monk/Paladin/
    Priest; MW=Mistweaver + PTR M+ analysis, distillable → QUEUED PENDING (transcript unavailable).
  · MadSkillzzTV `I_nFVVmv610` "12.1 BEST M+ HEALERS (so far) | Tier List & Latest Changes" — healer
    specialist, PTR healer meta read, distillable → QUEUED PENDING.
  · Supatease `LcWIPLhak0E` "REROLLING FEELS SO GOOD" — reroll gameplay VOD, no tuning/tier content;
    triaged-skipped.
Kalamazi `chLJ-HXwGBs` (Tidebound Grotto = untracked zone-57 raid, Twitch sub-event stream) out of
tuning/tier scope — no action. **Transcripts: `transcript-fetch/summary.json` verdict `no-credentials`
(TRANSCRIPT_API_KEY not configured) — 0 fetched, 0 takes / 0 metaNotes distilled.** izen (general)
newest is 07-15 `B2iGuHL_iPI` (Round #5 balance tuning — matches the 07-16 PTR hotfixes, no forum
dev-notes post → no new build to log), already seen. Pending queue now 20 (18 carried + 2 new).

## 2026-07-17 (nightly, 17:0xZ) — TRANSCRIPT PIPELINE LIVE: 19 transcripts distilled (24 takes + 5 metaNotes)
TRANSCRIPT_API_KEY now configured — `transcript-fetch/summary.json` verdict `ok`, 19/20 fetched
(supadata native captions, ms offsets); LHPjq9142qM errored (invalid-request) → stays pending. First
real distillation run since the transcript drought. Feeds: all 25 RSS polled live (25/25 OK); no
genuinely-new in-scope videos vs the seen-set (recent Dalaran roundup/out-of-scope, izen B2iGuHL_iPI
lead already seen+verified, Supatease/Shindigg/Critcake/YoDaTV/LBNinja7 streams/POVs all prior-triaged).
Distilled (removed from pending):
  · Obli Xhem4-XtOmc (07-14): Unholy nerf→off meta, Frost holds/dual-wield — 2 takes (DK Unholy nerf, Frost neutral).
  · Shadarek tB6Gse0qckA (07-14): Havoc 2x nerf (Inertia 12%/6s, 5% aura), tier-set desync — Havoc nerf take (DH creator, in-depth Havoc analysis).
  · Kalamazi 6nr1LrYp0xc + MbRU0TaQKww (07-15): Patient Zero removed/Hedonic Gorging, Seed-UA bug fixed→ST still bad, Destro 4-set rework −5%, Demo M+ front-runner — 3 takes (Aff nerf, Destro nerf, Demo buff).
  · YoDaTV S4VNrinPFTA (07-15): Prot Pal −10-15% dmg no surv nerf still frontrunner tank; Guardian bugfix; Brew fine in physical; Blood same; VDH close 2nd — 5 takes.
  · Tettles fw9buyf2n1o (07-15): Moonkin best raid DPS in testing, weak tier set/Apex — Balance buff take.
  · MadSkillzzTV I_nFVVmv610 (07-17 healer tier list, culmination of 07-09→07-13 testing vids): MW S, HPal ?/high-A no-holy-shock, Totemic RSham A, Pres A, Disc A, RDruid B undertuned, HPriest ? — 7 takes.
  · AutomaticJak Rmkxzb1QQSQ (07-17, corroborated by TXv5nof2mZw 07-16): Pres nerf, MW nerf-but-strong, HPal sleeper, Disc mixed, HPriest buff — 5 takes.
  · izen vK-qyvXOVYM (07-14, generalCreator → metaNotes M+ lens): Arcane Mage / Frost DK / Ele Shaman positive, Balance neutral, Devourer mixed — 5 metaNotes (superseded older izen Arcane/FrostDK/Devourer M+ notes).
Transcript-verified-skipped (removed, superseded/no in-scope take): YczUs2OcaJQ, faDcvghS7ao, r5tL2gAEhSw,
QimwxPWKd_s, JytzZ28QBkY, 8hzzon6tf9M, nSw9iA4kGBE (older MadSkillzz healer-testing iterations → folded into
07-17 tier list) · 0nW0wnI4OTo (Tettles gearing ramble, no spec-strength take) · HuRjN73exFk (Supatease healer
class-change roundup, PvP-lensed — no in-depth in-scope spec take; Resto Shaman covered by MadSkillzz) ·
TXv5nof2mZw (AutomaticJak HPal deep-dive, corroborates Rmkxzb1QQSQ). Superseded 31 older takes for same
(creator,spec). Pending queue 20→1 (LHPjq9142qM only). 24 takes + 5 metaNotes added; `latest` refreshed.

## 2026-07-18 (nightly) — 1 take distilled (LHPjq9142qM); 2 new in-scope videos queued
All 25 unique creator RSS feeds polled live (25/25 OK). Transcript LHPjq9142qM (AutomaticJak "MW Title
Push then PTR M+", now retitled Ragnarok sponsored) fetched by the deterministic step this run →
distilled 1 take: **Holy Priest** S2 M+ meta caveat (no poison dispel across ~6 S2 dungeons makes Priest
a tough meta ask; rates Holy Paladin + Mistweaver the best two healers for the season's M+ heal checks).
His MW/HPal keys reads duplicate same-day takes 148/149 (Rmkxzb1QQSQ) → transcript-verified-skipped.
Removed LHPjq9142qM from pending. **2 genuinely-new in-scope videos published after last run's ~17:0xZ
poll → QUEUED PENDING** (no transcript this run): LBNinja7 `Gz17CIGREfU` "My Honest Opinion of Healers
in Season 2..." (cross-healer creator) and izen `WQI9eNr4qpo` "Season 2 PTR More Buffs & Nerfs | Healers
Tuning & Raid Testing" (generalCreator → metaNotes lane + build-lead check: no new forum build). izen
`latest` refreshed to WQI9eNr4qpo. Out-of-scope/triaged (not queued): Supatease Class-Tuning-S1 roundup
+ PVP vids (prior precedent), Kalamazi Tidebound Grotto (zone-57, untracked), Dalaran PvP duels. Pending
queue 1 → 2.

## 2026-07-19 (nightly) — 12 items distilled from 2 pre-fetched transcripts; 25/25 feeds polled; queue 2→0
All 25 unique creator RSS feeds polled live (25/25 OK). Both queued videos were pre-fetched by the
deterministic transcript step (summary.json verdict `ok`, 2/2 fetched) and distilled:
  · **LBNinja7 `Gz17CIGREfU`** (07-17, "My Honest Opinion of Healers in Season 2") — cross-healer creator,
    6 takes within his scoped specs: **Resto Shaman** buff (drought→downpour, tier-set Healing Rain/Downpour),
    **Mistweaver** mixed (Spinning Crane nerf → more dynamic Rising Sunkick rotation, "looking very good";
    Jade Empowerment/Master of Harmony left dead), **Resto Druid** nerf (powerful tier set nerfed → kit
    lacking), **Holy Paladin** buff (damage buffs more rewarding), **Holy Priest** neutral (solid/fun but no
    standout, wants a real DR + M+ reason), **Disc Priest** mixed (proc-fishy, but Void Shield nerf a good
    disperse). Superseded 18 prior LBNinja7 takes on those 6 specs (Preservation's 3 left intact — no clear
    read this video).
  · **izen `WQI9eNr4qpo`** (07-17, "Season 2 PTR More Buffs & Nerfs | Healers Tuning & Raid Testing") →
    generalCreator metaNotes, 6 healer raid-testing-outlook reads: **Resto Druid** negative (Abundance
    buffed back but still one of the weaker/less-popular), **Preservation** mixed (was best/most-popular,
    hefty Dream Breath/blessing nerfs toward the pack; Echo/TA flexibility), **Mistweaver** mixed (−8% all
    healing + odd +50% mastery), **Holy Paladin** positive (most-buffed of the cycle; no-Holy-Shock build
    still wins), **Disc** mixed (Penance up, Atonement/Void Shield raid nerf ~net nerf, ~neutral M+),
    **Holy Priest** positive (+20% total over 3 rounds, testing okay now). Superseded 5 prior izen raid-lens
    notes on those specs. Also confirmed no new forum build lead (the tuning izen recaps = the 07-16 PTR
    hotfix, not a new dev-notes post). izen `latest` refreshed to `5wntDvx3wmo` (07-18 delve-boss preview).
**0 new in-scope videos queued** — all genuinely-new videos this poll were out of scope: DalaranGaming/
Supatease PvP 1v1 duels + PvP/hangout streams, Critcake/Kalamazi/Shadarek/Shindigg gameplay streams (prior-
triaged), izen `5wntDvx3wmo` delve-boss mechanics (no per-spec meta read), DalaranGaming "Blizzard fixing
issues" general news, Supatease "Class Tuning Update S1" roundup (prior precedent: no in-depth in-scope take).
Pending queue 2→0. 6 takes + 6 metaNotes added.

## 2026-07-19 (nightly, 2nd run) — 25/25 feeds polled; 1 new video queued; queue 0→1
All 25 unique creator RSS feeds polled live (25/25 OK). Transcript queue was EMPTY at fetch time
(summary.json `requested:0 fetched:0 verdict:ok`) — nothing to distill this run; creator-takes.json
unchanged. **1 genuinely-new in-scope video QUEUED PENDING** (no transcript available this run):
Supatease `sZwBwfkcuZ0` "The Tides of The Meta Are Shifting" (07-19 14:32Z) — vague title + empty RSS
description, but Supatease is a scoped Shaman/Warlock/Warrior theorycrafter and a "meta shifting" video
is plausibly an S2 outlook; queued so a future transcript run distills-or-verified-skips rather than
dropping a possible meta signal. Out-of-scope / triaged (not queued): **DalaranGaming `CTByGtlOgkc`**
"What's Changing For Monks In Patch 12.1? (Early PTR Preview)" — a datamined patch-note readthrough, and
Dalaran carries no Monk spec-scope (same handling as his 07-17 Evoker preview `xRk0mNKX6OE`); Supatease
`FmcXJz3ab5k`/`cDoPzWhqGDc` (hangout/reroll streams), Shadarek `Gk-AT8rktWE` (Guardian Druid stream, off
his DH scope), Shindigg `kINGIlRORo4` (DH keys stream), Kalamazi `kZ1K_ynyq0E` (PTR keys stream), Critcake
`gaZGPSZLEg0` (Warrior io gameplay), Supatease `sZwBwfkcuZ0` aside all prior-triaged. izen newest still
`5wntDvx3wmo` (07-18 delve preview, already latest) — no new generalCreator meta/build content. Pending 0→1.

## 2026-07-19 (21:1xZ, 2nd nightly run)
All 25 unique creator RSS feeds polled live (25/25 OK). Transcript queue: the deterministic
step reported sZwBwfkcuZ0 "unavailable" (summary.json verdict ok, requested 1/fetched 0) —
nothing to distill; creator-takes.json unchanged. **Queued 1 new in-scope video**: Supatease
`HeHi9Y5aYX8` "Class Tuning Update Season 1 Midnight" (07-18; passes class-tuning title
filter, Supatease scope Sham/Lock/Warr). **Triaged out** (out of scope, not queued): Supatease
PvP news (yaFXwh7aOVU/xUKBXzWCJAs/aCNaf6Q6J9A) + reroll/hangout streams; Dalaran 5v5-duel PvP
entertainment (zLt0bLAxmdI/Q5ggb-Clkk8/ElvdcB-d5Mw) + "Blizzard Fixing Issues" general-news
(V8doyR2hOE4); Critcake io-push gameplay (wyWZMj0HDQw). izen newest 5wntDvx3wmo (already
`latest`, delve preview — not a meta/build video). Pending queue 1→2.

## 2026-07-20 (nightly) — 25/25 feeds polled; 2 transcripts distilled (PvP-skipped); queue 2→3
All 25 unique creator RSS feeds polled live (25/25 OK). **Transcript step fetched 2 videos** (summary.json
verdict ok, offsets ms): both Supatease — `sZwBwfkcuZ0` "The Tides of The Meta Are Shifting" (07-19) +
`HeHi9Y5aYX8` "Class Tuning Update Season 1 Midnight" (07-18). **Both transcript-verified-skipped as PvP-only**:
HeHi9Y5aYX8 is entirely the July 21 PvP-specific tuning (DH survivability, Mistweaver Way-of-the-Crane PvP
heal transfer, Holy/Disc Priest + Resto Shaman PvP heals) — no PvE tier/meta; sZwBwfkcuZ0 is a ~2h solo-shuffle/
BG-blitz Elemental Shaman gameplay VOD framed on the same PvP tuning (keyword scan: raid/mythic/tier-set/parse
all ~0). creator-takes.json unchanged. Removed both from the pending queue. **Queued 3 new in-scope 12.1
candidates** (no transcript this run): Kalamazi `okWbk283nd0` "Warlock MAY Need Some Buffs in 12.1" (07-20,
Affliction/Warlock scope, clearly PvE); Supatease `9XVHns6dRuY` "New Meta Incoming" (07-19) + `HuRjN73exFk`
"12.1 Class Changes Update Healers" (07-17) — ambiguous meta/class-change roundups in Supatease's Sham/Lock/Warr
scope, queued to distill-or-verified-skip. **izen** newest `5wntDvx3wmo` (07-18 delve preview, already `latest`;
07-17 WQI9eNr4qpo healer-tuning recap already seen) — no new generalCreator meta/build content. **Triaged out**
(off-scope, not queued): Shadarek CDHf1dkEGb0/fJMckvIB11Y (Guardian-Druid + Havoc keys streams, off his DH-take
scope), Shindigg 18v8Z_w1jjA (DH keys), Dalaran ifQ0QExZO9E/zLt0bLAxmdI/ElvdcB-d5Mw/Q5ggb-Clkk8/vSIzz6fBctY/
YObr6op6JOg (5v5-duel PvP) + V8doyR2hOE4/w-iGfC8y5_M (general-news + PTR testing livestream), Supatease PvP-news
+ Road-to-Rank-1 streams, Critcake wyWZMj0HDQw/SgX0IB4INHk (io gameplay), LBNinja7 n2ga6kdiGVQ (how-to-heal-a-
tank tutorial, not a spec read), AutomaticJak TXv5nof2mZw (RSham/HPal M+ UI stream), Kalamazi OGqHbH5nHOI
(sub-event), YoDaTV Tr7xu8oXiPY (twitch restream). Pending queue 2→3.

## 2026-07-21 (nightly) — 25/25 feeds polled; 3 transcripts distilled (1 kept, 2 PvP-skipped); queue 3→2
All 25 unique creator RSS feeds polled live (25/25 OK). **Transcript step fetched all 3 queued videos**
(summary.json verdict ok, offsets ms). **Distilled — Kalamazi `okWbk283nd0`** "Warlock MAY Need Some Buffs
in 12.1" (07-20): a genuine PvE post-raid-testing Warlock tuning breakdown → added 3 Warlock takes
(Demonology neutral — complete but ST-mediocre; Affliction nerf — only played for seed-cleave, ST poor
after tier-set 50→20% + Patient Zero removal, hopes baseline UA buff; Destruction nerf — 5% aura nerf +
4-set rework hurts spread/Havoc cleave). Superseded the 3 older 07-15 Kalamazi Warlock takes. **Both
Supatease videos transcript-verified-skipped as PvP-only**: `9XVHns6dRuY` "New Meta Incoming" (07-19) is a
~4h solo-shuffle/BG-blitz/arena VOD — its meta reads (Unholy DK/BM Hunter strong, "Aff best spec", Resto
Sham decent, Frost Mage better) are all PvP-arena context; the "tier list" he references is a PvP one.
`HuRjN73exFk` "12.1 Class Changes Update Healers" (07-17) is a PvP-framed healer-tuning roundup (solo
shuffle/BG/dueling lens) with only a passing Resto Shaman mention in Supatease's Shaman scope — not in-depth
PvE analysis. Removed all 3 from the queue. **Queued 2 new**: izen `m5lEbh4lrHA` "12.1 PTR - Best DPS Specs
After Tuning | Mythic Raid Testing Results" (07-20 — generalCreator metaNotes material, refreshed izen
`latest`) and Supatease `BvJ3o0_Tt3Q` "12.1 Most Nerfed Class" (07-20 — ambiguous class-tuning roundup in
scope, distill-or-verified-skip). **Triaged out** (off-scope, not queued): Kesslive I2tMsLhcSX8 (warmode
trolling), Supatease vWY4_2KpAxk/TvhgUOxCngY/sp6z-7NqpmY (solo-shuffle/PvP tier list/Ele damage clip),
LBNinja7 Po44tj5ZV00 (non-spec vlog), Shadarek CDHf1dkEGb0 (Guardian keys stream, off DH scope), YoDaTV
eWQJwJ24WR0/3jG7SoN4iRo (Prot Pal S2 keys streams), Critcake jWMfdOLOlpY (io push), Dalaran QQnqyNs4NFs/
sfjc1GJkjfg/ifQ0QExZO9E (5v5 duels + PvP-changes news), Shindigg 7Ta7gtyP_xY/18v8Z_w1jjA (DH keys),
AutomaticJak kXOdbKJPvxo (MW/Pres/HPriest M+ UI stream). izen newest is m5lEbh4lrHA (now queued). Pending
queue 3→2.

## 2026-07-22 (nightly) — 25/25 feeds polled; 2 pre-fetched transcripts distilled; queue 2→8
All 25 unique creator RSS feeds polled live (25/25 OK, one retry logic). **Deterministic transcript step
fetched both queued videos** (summary.json verdict ok, offsets ms). **Distilled — izen `m5lEbh4lrHA`**
"12.1 PTR - Best DPS Specs After Tuning | Mythic Raid Testing Results" (07-20, generalCreator): a full
Season-2 Mythic-raid-testing DPS recap → **17 new metaNotes** (lens "Season 2 PTR — raid testing outlook"),
superseding 12 older izen raid-lens notes for the same specs. Positive (tuned across profiles): Elemental,
Balance, Arcane, Devourer, Frost DK, Arms, Ret. Mixed (profile-dependent): Shadow, Frost Mage, Affliction,
Devastation. Negative (undertuned/disappointing): Assassination, Fury, Fire Mage, Augmentation, Survival,
Feral. **Supatease `BvJ3o0_Tt3Q`** "12.1 Most Nerfed Class" (07-20) transcript-verified-skipped: a 19-chunk
PvP snippet about Frost Mage / Rogue-Mage snare nerfs — PvP context + out of Supatease's PvE scope
(Shaman/Affliction/Arms-Prot). Removed both from queue. izen `latest` refreshed to his newer `g0NmG9sVQ-Q`
(07-21 Season 2 gearing-systems news — no per-spec reads, systems lens, not queued).
**Queued 8 new in-scope build-#16 reaction videos** (no transcripts available to the agent): Kalamazi
`Xy8iV9-WcRI` (Warlock changes), Whispyr `e_2JhO06r7Y` (Assassination buffs), Baze `nqEdcFi_7wk` (Fury/Arms
buffs), Obli `5PpRdVE02Y8` (Unholy DK San'layn), Shadarek `QPqLeneGJUg` (Havoc/Devourer buffs), VooDooSaurus
`1-5RVwgA6KM` (Devourer sims), Dratnos `7UTSF0BXbD4` (PTR changes recap — Arms/Fury scope), Supatease
`GIMxSexKfis` (12.1 BIG Class Update roundup, distill-or-skip). **Triaged out** (off-scope, not queued):
Supatease PvP/rap/drama/Ele-PVP-guide streams (`1UKu8qGszVc` `VNyFSQir2hE` `XYZUWEdEgpk` `J4e3QMpeS6g`
`X1R8EvIlmXc` `yxRmKx5Q1WA` `vWY4_2KpAxk`), Dalaran PvP duels + news (`YLpjECBfyLg` `Y_aGr-34u8M`
`s97eN2P7FoA`), Critcake io pushes (`lsQr_Efa0pA` `zzHKjkTYv-w`), AutomaticJak `Uu3t2siWgbQ` (UI/sponsored),
Obli `Q0DXJzjCqL8` (DK defensives tutorial, no meta read), Preheat `nsqND5BS-C4` (PTR-Mage livestream),
Shadarek `Qzys9RKWpPo` (Dev DH raiding stream), Shindigg `LJ94XJVXPL8` (raid stream), Tettles `QADGvYl5GCw`
(GM-cheating drama), YoDaTV `fPJ9Iw2B5Vk` (twitch restream). Pending queue 2→8.
