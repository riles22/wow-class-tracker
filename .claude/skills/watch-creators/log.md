# watch-creators run log

Keep the newest ~20 entries; prune older ones when appending. Machine state the change
detectors rely on (parse counts, seen video IDs) must stay in the NEWEST entries or a
dedicated section — narrative prose older than that is prunable memory.

- 2026-08-04 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). **Queue drain only — no re-discovery pass**, same reasoning as the 08-01 entry:
  the nightly had polled all 25 feeds at 12:3xZ and queued its five unresolved outputs, so
  re-discovering ~2h later would only surface uploads too fresh for auto-captions. Queue
  **5 → 0**; `skipped[]` unchanged at 8 — **all five distilled, none verified-skipped**.
  yt-dlp at the pinned 2026.07.04, json3 auto-subs, 5/5 clean on the first attempt from this
  residential IP (the impersonation warning printed on every one and is noise — subtitles
  downloaded regardless). **8 takes + 11 metaNotes added.**
  · **`oocq_kuo-pk`** (MadSkillzzTV, "12.1 TOP 3 Favorite & Strong Healers", 08-04, ~19 min)
  — his testing-based top three. **4 takes**: Resto Shaman (raid lens — the S2 mini-rework:
  Unleash Life/Earth Shield buffs, substantial Riptide buff, Healing Rain 5→6 targets, plus
  Farseer buffs; reads it as finally worth bringing to raid, with the proc-driven tier set as
  the downside), Pres Evoker (M+ — "most undervalued", bonkers healer DPS, gated on
  difficulty), Holy Paladin (M+ — "absolute blaster", Holy Shock buffed + cheaper, 4-set
  double Infusion, with his own OP-at-start-invites-nerfs caveat), Disc Priest (mixed —
  fun and less RNG but atonement transfer under-rewards in M+; conditional on a Blizzard fix).
  · **`Li-b-g6sXIE`** (MadSkillzzTV, "Holy Paladin Gearing for S2 & UI Setup", 08-03, 225 min)
  — **queued as a suspected gearing-PSA; it is NOT one, do not re-triage it that way.** It is
  a livestream VOD, but unlike the Tettles `aqe2LKeMIqQ` / Kalamazi `tfIcqmIi2o8` precedent its
  spec content is a *sustained* segment, not one-line chat replies: an explicit speculative S2
  M+ healer power tier list (~t=8042) plus a Holy Priest defence (~t=8400). **2 takes**, both
  chosen precisely because they are the parts the 08-04 structured video does NOT carry:
  Holy Priest (underrated, more than good enough after the latest 5% buff — his own reason for
  skipping it is build preference, not power) and Resto Shaman M+ (more likely to end up meta
  than Holy Paladin — not stronger today, but the physical melee comp looks strong and the
  early-season OP spec eats the nerf). The rest of the stream duplicates the structured video
  and was deliberately left undistilled.
  · **`VQnGFOstlgU`** (Whispyr, "Atrophic is a Real Raid Buff", 08-03, ~9 min) — **1 take**,
  Assassination Rogue (his only scoped spec). A log A/B analysis rebutting a circulating claim:
  the 5% reduction DOES apply to environmental damage on Twin Fangs and Sszorak because that
  damage is quietly attributed back to the boss; it fails only on named untargetable NPCs (The
  Lost Explorers worst at ~40% unreducible); concludes Atrophic beats Devotion Aura for the
  tier. Coda folded into the same claim: Rogue low-target cleave stays bad and the recent 10%
  Assassination aura buff does not address it. **He also states the Subtlety/Outlaw aura
  numbers — NOT attributed, both are outside his declared scope.**
  · **`15eTmWfKrLc`** (YoDaTV, "General Guide for Protection Paladin in 12.1! (Mythic+)",
  08-03, ~22 min) — **1 take**, Protection Paladin. Places it below Blood DK on current tuning
  and significantly worse on survivability/external healing; root cause is losing Sanctified
  Wrath plus the Reflection of Radiance nerf, so Sentinel covers ~20-25s/min against S1's
  30-40s windows, leaving ~15s/min with no cooldown. Says it is defensively worse than S1
  despite +10% DR. What keeps it playable is utility — near-solo interrupt coverage and the
  one-minute Sacrifice external. His one-line "Blood DK is the strongest tank" aside was NOT
  logged: it duplicates his own 08-02 Blood DK take.
  · **`EqgjDKVwYow`** (izen, "12.1 PTR - Season 2 | Rumors & Chats on Popular Specs &
  Potential Meta Picks", 08-03, ~16 min) — generalCreators, so **metaNotes only, 11 added**,
  all `Season 2 PTR — M+ outlook`: Windwalker +(rising physical-damage melee pick, tier set
  pushes SCK over RSK 120/60, but squishiest DPS and flat AoE), Mistweaver −(folding under
  repeated nerfs as Holy Pal/Resto Sham are buffed), Holy Paladin +(all-purpose meta-comp
  healer), Resto Shaman +(melee-comp healer of choice for mastery/windfury), Blood DK +(tank
  meta settled; the paladin pairing supplies its missing DR), Balance +(wins the last
  caster slot ~80/20 on versatility + a second combat res), Elemental ~(slightly higher raw
  damage but its raid buffs are dead weight in a caster comp), Marksmanship −(>10% nerf and
  no caster-comp synergy), Arcane +(locked in), Devourer +(second locked-in caster pick),
  Brewmaster −(fallen off). **Arms Warrior deliberately NOT logged** — his only mention is
  the "filthy melee" joke excluding it from caster comps, which is too light to overwrite the
  substantive 08-01 positive read.
  · **Supersede pass**: 7 takes + 11 metaNotes retired, all same-creator/same-spec/same-lens.
  Note the two-lens split on MadSkillzz Resto Shaman — the new 08-04 raid take retired his
  07-29 raid take, and the new 08-03 M+ take retired his 08-01 M+ take; they coexist because
  they are different lenses, exactly as the guardrail intends.
  · **Whispyr NOT superseded, on purpose** — his 07-21/07-22 takes are Apex-talent/build reads
  from the 07-21 tuning pass; the new one is raid utility + cleave profile. Different subject,
  so retiring them would be over-superseding. That does leave **3 live Whispyr Assassination
  takes** — flagging for a human in case the drawer feels crowded.
  · **Specialist `latest` fields left alone** (YoDaTV's still reads 07-30). Only izen's is
  routinely maintained and the nightly already advanced it to `EqgjDKVwYow`; changing registry
  fields on an ungated local run is not worth the drift. npm test 229 (210/19/0), build OK.

- 2026-08-01 (LOCAL run, ~14:1xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). **Queue drain only — no re-discovery pass.** The nightly had already polled all
  25 transcribable feeds today (25/25) and its sole unresolved output was one queued video;
  re-running discovery ~2h later would only surface uploads too fresh for auto-captions
  (the ≥2–6h rule), so scope stayed on the drain. Queue **1 → 0**; `skipped[]` unchanged at 4.
  · **`okDLvLGMFzs`** (Obli, "Single target BUFF, AOE NERF(?) for Unholy DK! / Midnight
  Season 2 PTR 12.1", published 08-01) — yt-dlp at the pinned 2026.07.04, json3 auto-subs,
  245 events / ~8 min. Fetched clean from this residential IP (the runner bot-wall does not
  apply here); the SABR + impersonation warnings printed but the subtitle download succeeded,
  so they are noise, not failure. **1 take added, Unholy DK.** His read: the 08-01 pass looks
  like an AoE nerf but is net a single-target buff — Virulent Plague −10%, graveyard −15%,
  Epidemic −12% are all modest, the auto-attack doubling only moves melee ~2%→4.4% on a dummy
  (still ~2% in a key, which he reads as a deliberate anti-pseudo-ranged nudge), and the real
  gain is Corrupted Blood/withering grasp +25%. He points at the single-target dummy
  leaderboard filling with 07-31/08-01 parses where it had been stale June logs, and lands on
  "A plus", explicitly rejecting the S-tier framing others are giving it. · **Superseded** his
  2026-07-31 Unholy take (`owCby8soRNY`) — same creator, same spec, same PTR-strength lens,
  one day apart with a tuning pass in between, so the newer genuinely replaces the strength
  read rather than complementing it. His 07-25 Frost take stays live (different spec). ·
  **Scope firewall held twice**: the video opens on Blood's San'layn nerf, and Blood is
  outside Obli's registered `specs` (Frost/Unholy) — no Blood take written. And "Frost went
  unscathed, no changes to Frost" is a patch-notes fact, not a spec-strength analysis, so no
  Frost take either; writing one would have inflated a non-statement. · Refreshed Obli's
  `latest` in community.json. · 0 metaNotes (Obli is a class specialist, not a
  `generalCreators` entry — that lane stays closed to him by validation). · npm test 182
  (170/12/0), build OK, snapshot written.

- 2026-07-31 (nightly CI, ~22:41Z — Opus 5; single-shot) · **All 25 unique transcribable
  feeds polled live — 25/25 HTTP 200 on the first attempt, 0 retries, 0 backoff.** The
  deterministic transcript step ran against an **EMPTY queue** (summary.json verdict `ok`,
  requested 0, fetched 0) because the 20:45Z local run had already drained it — so there
  was nothing to distil, and the agent fetched no transcript from YouTube or any API. ·
  **34 videos published since 2026-07-30** across all feeds; every one but a single video
  was already in the seen-set (creator-takes deep links + `pending-transcripts` `videos[]`
  and `skipped[]` + this log's per-run seen sections). · **QUEUED 1 genuinely new in-scope
  video: Kalamazi `Hn9upmp8ywc` (07-31, "BIG Warlock Buffs Are Here!")** — inside his
  class-wide Warlock scope and plainly about build #18's Warlock pass (Haunt 12→16%, Shadow
  Bolt +45%, Demonbolt +55%, Soul Fire +45%, Havoc 60→50%). His `community.json` `latest`
  was **deliberately NOT rewritten** — summarising a video whose transcript has not been
  read would be an unsourced claim; it gets refreshed when the take lands. · **TRIAGED OUT
  by title filter** (streams / PvP / systems-and-Classic+ news / restreams — the established
  pattern): YoDaTV `4TADJ-f8jec` + `vHv9Ixzoquc`, Tettles `c0HjG3hASUQ`, Dalaran Gaming
  `FIEboW-px8k` + `ItSboOGdXOY`, AutomaticJak `svrjfd3_ebk`, Supatease `M-QRkzkQ-X0` +
  `XnhSoy695cg`, Critcake `qkqwSJtmD88` + `AAm0W2V4xLE`, Kalamazi `UnoZnAX_Alo`. · Queue
  **0 → 1**, `skipped[]` unchanged at 5. **No creator opinion touched any rating.** ·
  ⚠️ **FOR A HUMAN — seen-set fragility, quantified this run:** deriving the seen-set by
  regex over this log's prose left **~180 pre-July videos** across the 25 feeds looking
  "new". They are not — they sat in the RSS windows of every run since 07-14 and were
  triaged by entries that have since been pruned. Treating them as seen is the right call
  today, but the durable fix is a **persisted seen-set file** (the same reasoning that
  produced `skipped[]`), not more prose. Until then, a run that trusts the regex will keep
  re-surfacing months-old VODs.

## Seen/triaged this run (07-31 nightly, ~22:41Z — add to seen-set)
Queued: Hn9upmp8ywc (Kalamazi). Triaged-skipped (no transcript, title filter): 4TADJ-f8jec,
vHv9Ixzoquc (YoDaTV), c0HjG3hASUQ (Tettles), FIEboW-px8k, ItSboOGdXOY (Dalaran Gaming),
svrjfd3_ebk (AutomaticJak), M-QRkzkQ-X0, XnhSoy695cg (Supatease), qkqwSJtmD88, AAm0W2V4xLE
(Critcake), UnoZnAX_Alo (Kalamazi).

- 2026-07-31 (scheduled LOCAL run, ~20:45Z — Opus 5) · yt-dlp 2026.07.04 (the
  requirements.txt pin; not touched). **All 25 unique transcribable feeds returned 200 on
  the first attempt, 0 retries.** Residential IP, so transcripts fetched directly — 3
  pulled, 3 resolved, **queue 1 → 0**. · **DISTILLED — Shadarek `mV7NM-Vh90I` "Havoc BUFFED
  & Devourer NERFED Class Tuning" (07-31)**, his same-day analysis of forum post #18, and
  the reason this run found the build worth cross-checking in the first place. **2 takes
  added**, both cited to timestamps: **Havoc** (buff, t=166) — he sims the pass at ~+3.6%
  Aldrachi Reaver (235.6k→244k) and ~+4.8% for a Fel-Scarred build that drops Deflecting
  Dance (230k→241k), cutting the hero-tree gap from ~6k to ~3k DPS, and deliberately
  discounts the Essence Break component because the sims still model the 4-set amplifying
  the DoT rather than the initial strike; **Devourer** (nerf, t=58) — the Eradicate
  secondary-target 15% cut is overdue and correct in his read (the values were split apart
  in the .5 patch precisely to be tuned and then left identical), hitting Void's Guard
  hardest, while the Annihilator Final Hour 8s→6s change is one he cannot account for and
  which costs both haste uptime and DR. **Superseded 2 same-lens takes**: his 07-30 Havoc
  "Season 2 outlook" (its Aldrachi-vs-Fel-Scarred gap figure is exactly what the new take
  updates, and its closing "expects no further changes before the season starts" was
  overtaken by this build the next day) and his 07-22 Devourer build-tuning read. **Left
  live**: his 07-30 Havoc TIER SET take — a different lens the new video only brushes in
  passing, and consistently (both flag the same 4-set-hits-the-DoT bug). Spec scoping: his
  Demon Hunter entry has no `specs` list, and he analyses both specs in depth here with
  sims and mechanics, so both attributions are earned rather than stretched. · **VERIFIED
  SKIPS → `skipped[]` (2 added, durable):** Kalamazi `YOnGHSUZ4A0` "Do These 5 Things NOW To
  Prep For Patch 12.1" — a character-prep PSA (Omnium Folio, Sporfall 298s, crafted
  embellished/socketed S1 gear, expiring currencies, Valera leveling); its only spec mention
  is which slots the Warlock set leaves open, the loot-targeting example the skill says not
  to inflate. Supatease `hvxrLgUQk1w` "12.1 Class Tuning BIG BUFFS Incoming" — a straight
  read-through of the whole 07-31 notes across every class with PvP-lens asides, i.e. the
  class-tuning-roundup shape the skill explicitly says not to stretch into per-spec takes;
  his own lane is Shaman and the Elemental Farseer lines get one narrated sentence with no
  analysis. **He is NOT a `generalCreators` entry, so the metaNotes lane is closed to him by
  validation — 0 metaNotes.** ⚠️ **FOR A HUMAN:** this cross-class PTR-news format IS
  generalCreators-lane behaviour and he does it regularly; worth deciding whether Supatease
  belongs there. Registry scope is an owner call, so nothing was changed — flagged only.
  · **TRIAGED OUT without a transcript fetch (title-filter / established pattern — add to
  seen):** MadSkillzzTV `W1vqQebN9UU` "12.1 Healer Prep/Alt Gearing & UI Setup | *NEW* !UI
  !Tierlist" (his stream-VOD title convention, !commands), AutomaticJak `tLxl5mlWNpU`
  "Sethrallis' Reworked Final Boss" (dungeon-encounter content, not spec strength), Dalaran
  Gaming `pZohT7rRJy8` "WoW Midnight 12.1: New Prey System Change & Rewards" (systems news).
  Everything else in the 07-28→07-31 RSS window was already in the seen-set from the
  nightly and the 10:14-local run (checked by id against creator-takes.json,
  pending-transcripts.json and this log): Obli owCby8soRNY, YoDaTV CNWAq9aOHO4, izen
  OQa0Yzv18Hs + fUZTzvbL3OU, Shadarek 7pNUYPaoePY + Z8Jygl_NpF4, Baze M_qVqxU_SrA, LBNinja7
  ZWFtBrOS8lA, MadSkillzzTV Zf3GQqG-z8s + nZX2jWzYDB8, AutomaticJak xote4lf9dfs, plus the
  usual stream/PvP/key-POV VODs. · community.json untouched (no `latest` field needed
  refreshing — izen's newest upload OQa0Yzv18Hs was already recorded this morning).
  · videos processed: **3 transcripts** · takes added: **2** · takes superseded: **2** ·
  metaNotes added: **0** · queue 1 → 0, skipped[] 3 → 5. npm test 163 (152/11/0), build OK,
  snapshot written then rebuilt.

## Seen/triaged this run (07-31 local, ~20:45Z — add to seen-set)
Distilled: mV7NM-Vh90I (Shadarek, 2 takes). Verified-skipped → `skipped[]`: YOnGHSUZ4A0
(Kalamazi), hvxrLgUQk1w (Supatease). Triaged-skipped (no transcript): W1vqQebN9UU
(MadSkillzzTV), tLxl5mlWNpU (AutomaticJak), pZohT7rRJy8 (Dalaran Gaming).

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

- 2026-07-23 (nightly CI, Opus 4.8; single-shot) · All **25/25** creator RSS feeds polled live. Deterministic transcript step fetched all **8** queued build-#16 reaction videos (summary.json verdict ok). **Distilled 12 in-scope takes from all 8**: Whispyr `e_2JhO06r7Y` (Assassination +6% all-dmg, lukewarm on Apex), Obli `5PpRdVE02Y8` (Unholy San'layn Blood Beast +1400%/Epidemic +75% over Rider), Baze `nqEdcFi_7wk` (unannounced Slayer stack fixes → Fury + Arms buffs), Shadarek `QPqLeneGJUg` (Devourer Collapsing Star +12% still behind / Havoc +5% rebalance), VooDoo `1-5RVwgA6KM` (Devourer Void's Guard ~14% ahead of Annihilator ST sims), Kalamazi `Xy8iV9-WcRI` (Aff buffed ST/M+ via Impetus Wrath / Demo nerfed "dead"), Dratnos `7UTSF0BXbD4` (Arms Dreadnought AoE rework), Supatease `GIMxSexKfis` (Resto Sham talent pass + Aff rework). **Superseded 17** older same-(creator,spec) takes. **Queued 4 new in-scope 07-22 videos** (no transcript yet): izen `0mtKobeslFA` (Specs Balance Tuning #7 — metaNotes/leads lane), MadSkillzzTV `32hM_eLonR4` (Resto Shaman healer M+ testing), Kesslive `beBJZnCXF0s` (weekly Evoker PTR update), Kalamazi `C82WusrvQ1E` (Warlock changes follow-up). izen `latest` refreshed to 0mtKobeslFA. **Triaged out** (off-scope, not queued): YoDaTV twitch restreams + off-Blood M+ tierlist vid, Supatease Enhance-PvP/drama/mount vids, Shadarek/Dalaran/Shindigg livestreams & PvP duels, Dratnos loot vid (outside Arms/Fury take scope). Pending queue **8→4**.

- 2026-07-24 (nightly CI, Opus 4.8; single-shot) · All **25/25** creator RSS feeds polled live (25/25 OK). Deterministic transcript step fetched all **4** queued 07-22 videos (summary.json verdict ok, offsets ms). **Distilled 4 specialist takes**: Kesslive `beBJZnCXF0s` (Augmentation buff — 3% aura + Wing Leader Breath-of-Eons CDR restores double-dupe in AoE; Devastation nerf-sentiment — only compensatory buffs, same Eternity Surge set every season), Kalamazi `C82WusrvQ1E` (Destruction neutral — "surprisingly okayish", best of 3 locks in ST but class needs buffs; **Aff/Demo NOT re-added** — already covered by the 07-22 `Xy8iV9-WcRI` takes, transcript-verified as duplicate content), MadSkillzzTV `32hM_eLonR4` (Resto Shaman buff — big build-#16 changes, "secretly really nice in raid", buffs more raid- than M+-impactful). **Superseded 6** older same-(creator,spec,lens) takes (2 Kess Aug + 2 Kess Dev + Kala Destro 07-20 + Mad RestoSham 07-17). **izen `0mtKobeslFA`** (Specs Balance Tuning #7, generalCreator) → **7 new metaNotes** (build-#16 reaction): positive Balance/Elemental/Arms (raid standouts), Devourer (M+ still gapping Havoc), Resto Shaman (top-4 healer raid), mixed Arcane (top-tier but deserved nerf), negative Unholy (still behind Frost in raid+M+); superseded 6 older izen same-(spec,lens) notes. **Queued 7 new in-scope videos** (no transcript to the agent): MadSkillzzTV `rVQpKFFfMso` (best M+ healer tierlist), izen `6G_Sg4xJol4` (Hunter's Mark raid-spots — metaNotes/leads), Kalamazi `-G4jfNvelp0` (Mythic raid testing), AutomaticJak `KMrletaO_a8` (RSham rework + Disc key — Disc in scope), YoDaTV `ayJrRKgwX0A` (Blood DK meta — in scope), YoDaTV `YbjvOhxVrw0` (emergency healer/tank tierlist — Holy Pal/Prot in scope), Supatease `L-Y9k2YL34M` (12.1 class update — Shaman/Aff in scope). izen `latest` refreshed to `6G_Sg4xJol4`. **Triaged out** (off-scope, not queued): Dalaran PvP duels + class-buffs/dungeon news roundups (`zahcyy0SQN8` `3cnzXhiS2QQ` `D_vBGnneXj4` `WrO_2ES59qk` — roundup, not a specialist take & Dalaran not a generalCreator), Supatease Enhance-PvP/drama/mount/reroll (`NffkOLMuuIk` `OEGN0VXhUhg` `9f2ndS5v4I4` `KizxeX0BBck` `ie-AZrposyc` `jmwvWSYlNno`), YoDaTV twitch restreams (`PxrN6L8lYAA` `brqDW3dtVJc` `f39cPNDLxLA`) + superseded 07-22 M+ tierlist (`25oNFzR-_qU`), AutomaticJak GM-cheat drama (`BHiCxGXH1B0`), Critcake raid-reclear stream (`ISJb_lOf9-0`), Shadarek/Dratnos loot/livestreams (`PlkEs_A1xQw` `a5XOTi-9ZbI` `AaYp5wzWVjI`). Pending queue **4→7**.

- 2026-07-25 (nightly CI, Opus 5; single-shot) · All **25/25** creator RSS feeds polled live (25/25 OK, no retries). Deterministic transcript step fetched all **7** queued videos (summary.json verdict `ok`, offsets ms). **Distilled 16 specialist takes from 5 videos**: **YoDaTV** `ayJrRKgwX0A` + `YbjvOhxVrw0` (Blood DK reversal — his own Kings' Rest log comparison puts it ahead of Prot Paladin on damage taken AND healing required, ~1-2 key levels safer in Rune Weapon; Prot Pal demoted out of meta contenders after the Reflection of Radiance nerf; Holy Pal healer front-runner; plus Prot Warrior / Vengeance / Brewmaster / Guardian), **MadSkillzzTV** `rVQpKFFfMso` (Mistweaver "by far the best healer, like miles" on the new mastery-stacking build — recorded BEFORE the 07-23 Morning Breeze −60%, and he predicted it; Resto Druid behind in M+; Disc stuck in the raid-vs-M+ balance squeeze), **AutomaticJak** `KMrletaO_a8` (Disc in a "much much better spot", Oracle Holy good in keys / weak in raid, Mistweaver top dog but nerf-bound), **Kalamazi** `-G4jfNvelp0` (Destro the universal next-tier pick + best ST, Demo pet nerfs "pretty rough" for no reason, Aff now probably the best M+ lock after overnight bug fixes). **Superseded 16** older same-(creator, spec, lens) takes. **Two transcript-verified SKIPS, zero takes**: Supatease `L-Y9k2YL34M` is a patch-notes read-through with no read on any spec in his Shaman/Affliction/Arms-Prot scope; **izen `6G_Sg4xJol4`** is a Hunter's-Mark raid-composition essay — its only per-spec mentions are hypothetical comp examples ("Ret can rip in this fight"), i.e. exactly the fight-artifact case the skill says NOT to inflate, so **no metaNotes were written from it**; its lead (Hunter's Mark reverted to 1 target) was verified as already logged under build #16. **Queued 7 new in-scope videos**: izen `wa60mXTVPxY` (fastest-rising S2 specs — metaNotes material), Kalamazi `4GG1seubsZ8` (Affliction bug fixes), AutomaticJak `n1NSfmvMrhU` (MW/HPal changes + raid test), Shadarek `ZAjeE9_d79E` (S2 M+ DPS impact — distill-or-skip), Obli `UJxhJRYxe9s` (San'layn Unholy), Tettles `G4booQ9CGSE` (Moonkin), LBNinja7 `MFpxVDQGU5I` (healer specs in S2). izen `latest` refreshed to `wa60mXTVPxY`. **Triaged out** (off-scope, not queued): Shadarek/Shindigg/Preheat/Critcake keys+raid livestreams, Supatease PvP/drama/rap/stream titles (`XZFA6VJJOUA` `3YV04t9Wm-8` `wgpJsZKVyYs` `vKxE89T9chU`), Dalaran 5v5 duels + news roundups, Tettles/AutomaticJak GM-drama, YoDaTV twitch restreams, Kalamazi `gXAECoUAb2s` (weekend stream), Tettles `HOszuJbXO3w` (same-title duplicate of the queued Moonkin video). Pending queue **7 → 7**.

- 2026-07-26 (nightly CI, Opus 5; single-shot) · All **25/25** creator RSS feeds polled live (25/25 OK, no retries needed). Deterministic transcript step fetched all **7** queued videos (summary.json verdict `ok`, 7/7, offsets ms). **Distilled 12 specialist takes from 4 videos**: **LBNinja7** `MFpxVDQGU5I` — his "how I'd fix the healers" video is a comedy wishlist format, but the *current-state* read on each of the seven healers is genuine and every one is inside his declared scope, so **7 takes** (Preservation needs no fixing / Flame Shaper "cranking damage"; Mistweaver very good post-SCK-nerf but stuck on one hero tree; Holy Pal well loved yet "just a whack-a-mole healer"; Resto Druid's 25%→15% set proc less punishing but still swingy; Disc lacking ramp punch, Penance damage "barely moving health bars"; Holy Priest no reason over Disc in keys; Resto Shaman set punishes an unclumped party). Care taken NOT to write the fairy's hypothetical fixes as real changes. **AutomaticJak** `n1NSfmvMrhU` — **2** (Holy Pal "very good right now", Holy Shock/Holy Light split, defends the tier set's added-mana clause as the right design; Mistweaver DOWNGRADED after Morning Breeze −60% to "decent in keys, falling behind in raid" — a real change from his 07-23 "still top dog"). His Disc and Holy Priest reads in this VOD duplicate the 07-23 `KMrletaO_a8` takes, so not re-added; a "top three healers" line at ~11419s is a guest voice, deliberately not attributed to him. **Obli** `UJxhJRYxe9s` — **2** (San'layn Unholy "inches ahead" of Frost, great ST/execute, weak 2-3 target cleave, notable difficulty jump on holding 7 Essence stacks; Frost keeps the better cleave/add-burst profile, swap for council fights, dual-wield season). **Tettles** `G4booQ9CGSE` — **1** (Moonkin's M+ meta slot is earned by its own damage, not carried by the Druid tank/healer meta); tagged `12.0.7 live — Mythic+ meta`, a DIFFERENT lens from his 07-15 S2-raid take, so both stay live per the supersede guardrail. **Superseded 14** older same-(creator, spec, lens) takes. **izen** `wa60mXTVPxY` → **3 metaNotes** (M+ lens): Blood DK the headline tank riser (DR-shaped buffs — Apex DRW 6% DR, +5% parry, Blood Shot 4%, San'layn 3% phys — popularity nearly level with Prot Pal, San'layn now the majority pick, 320k vs 200k DPS in the same +19), Marksmanship up to #2 popularity but he is explicit the talent rework FAILED (Explosive Shot still beats Aimed Shot post-bug-fix, Tactical Reload/Windrunner's Quiver still not worth it) so the rise is just the flat +5%, Mistweaver still "the most promising of the healers ... for Mythic+" even after Morning Breeze −60%. Superseded 2 older izen M+ notes. **Prot Paladin deliberately NOT written** — the video only restates his existing 07-09 note as context for Blood's rise, and inflating context into a fresh read is exactly what the skill warns against. **Two transcript-verified SKIPS, zero takes**: Shadarek `ZAjeE9_d79E` is a Season-2 creature-health/dungeon-systems commentary with no read on any spec (nothing on Havoc/Devourer/Vengeance); Kalamazi `4GG1seubsZ8` (published 07-24) covers the same Affliction bug fixes, Demo pet nerf and "Destro in a weird spot" ground as his **newer** `-G4jfNvelp0`, already distilled on 07-25 — re-adding would have back-dated duplicate takes for all three Warlock specs. **Queued 0 new**: the 13 uploads since last run are all livestreams (Shadarek/Shindigg/Critcake/AutomaticJak key + title pushes), Dalaran 5v5 PvP duels and reward roundups, Tettles/Dalaran GM-drama, a YoDaTV twitch restream, and LBNinja7 `uhRsc6vpRu8` ("This HAS To Be Said...", no class/spec/patch keyword in the title). izen `latest` already points at `wa60mXTVPxY` and stays. Pending queue **7 → 0**.

- 2026-07-27 (nightly CI, Opus 5; single-shot) · All **25/25** creator RSS feeds polled live (25/25 OK, no retries). **No transcripts to distill:** the queue was drained to 0 last run, so the deterministic step reported `requested 0 / fetched 0` (summary.json verdict `ok`) — **0 takes, 0 metaNotes**, an empty input rather than a skipped distillation. Of **33** previously-unseen uploads, **8 queued**: izen `m81w4xTnRrs` ("The Specs On Life Support In Season 2's PTR | 12.1 & Meta Talk" — metaNotes lane), MadSkillzzTV `Z8MTZevobgw` (best M+ healer post-hotfix), Kalamazi `ZOVnfoXjuoc` (which Warlock spec looks best in 12.1 M+), AutomaticJak `_V1s61R-mio` (caster Holy Pal in S2) + `wLqVYLOUg8o` (mastery Mistweaver / no-Shock Paladin), Tettles `aqe2LKeMIqQ` (Moonkin), Dalaran Gaming `cQHcrw2m_OU` (12.1 Rogue PTR — inside its class-wide Rogue scope, but Dalaran roundups have been rejected at distill time before, so judge it then), Reholy `laCDMF4Wy_s` (PTR King's Rest San'layn Blood DK — a run VOD, queued because Blood DK's PTR rise is the live question; drop it if the transcript is pure gameplay). izen `latest` refreshed to `m81w4xTnRrs`. **Triaged out** (not queued): Tettles `gbWzRIfSL7c` is a same-title duplicate of `aqe2LKeMIqQ` (Tettles keeps double-posting titles — `HOszuJbXO3w`/`G4booQ9CGSE` was the same pattern on 07-25); Kalamazi `xmQgtBDGN_Q` ("Quick Lil PTR Slam") and Supatease `cupVmrJOUmU`/`G5eImVklf7c`/`WfYBgOgnfi8` (PvP + patch hype) carry no spec read; Shadarek key-run/UI VODs (`WYSpp2BeY0w` `IIV5udR1Ano` `uB9txDWrlXk` `r86Zz1u0vQA` `7lkIia0eVwg`), Critcake key streams (`xmWAy62IcAk` `aSNos5zVTp4` `6yF4Q7SUimE`), Shindigg (`InJYLpo1VXA` `2BYD8y-xjvQ`), AutomaticJak `iw5JtBk0Wbo` (title push), YoDaTV twitch restreams (`OPN27kd-7K8` `44aw6EIT-n8`), Dalaran 5v5 duels + S1 to-do (`NOa9SvuyzMs` `MmT3uQQy3u0` `7hpQnrKrKiY` `Hi9qmlkLZZo` `xEjKXJYTW8o`), and the Tettles/Dalaran GM-drama uploads (`J96hzCwjjVA` `EakXflo16CA`). Pending queue **0 → 8**.

- 2026-07-28 (nightly CI, Opus 5; single-shot) · All **25/25** creator RSS feeds polled live (25/25 OK, no retries). Deterministic transcript step fetched **7 of 8** queued videos (summary.json verdict `ok`; Tettles `aqe2LKeMIqQ` came back **`unavailable`** — captions not exposed — so it STAYS queued). **Distilled 14 specialist takes from 5 videos.** **AutomaticJak** `wLqVYLOUg8o` + the 07-27 short `_V1s61R-mio` → **2**: Holy Paladin "one of the highest HPS healers in dungeons … the best, if not second best … definitely S tier", with the argument that the 4-set's 60% Holy Light mana penalty is what makes the kit whole (no-Holy-Shock build dead, Beacon of Virtue affordable in keys and some raid runs) and that bolting the drawback to a temporary set is better design than a baseline nerf; Mistweaver over-nerfed to "A-ish tier, maybe a little lower" after Morning Breeze −60% plus the earlier 8% caster cut. **Kalamazi** `ZOVnfoXjuoc` → **3** and it is a genuine REVERSAL of his 07-24 order: measured M+-build dummy tests give Demonology ~130k ST / ~380k AoE climbing to 410-420k in Tyrant, Affliction ~110k ST ("abysmal … diabolically bad" sustain, wants a ~30% Unstable Affliction buff, Nocturnal Yield removal now constrains shards) and Destruction ~120k ST but hardest to reach its ~360-370k AoE because Mayhem keeps proccing on the main target → **Demo > Aff > Destro** for 12.1 keys. **Supersede judgment worth keeping:** his 07-24 Destro and Demo takes are RAID-lens and stayed live as complementary; only the 07-24 **Affliction** take was superseded, because its headline was "probably the class's best Mythic+ spec" — the exact claim this video reverses. **Dalaran Gaming** `cQHcrw2m_OU` → **3**: this one is NOT the news-roundup shape that got Dalaran videos rejected before — it is a per-spec Rogue analysis inside his class-wide Rogue scope (Assassination +6% damage, Implacable rank-1 buff, double-poison tier-set buffs, strong but drifting passive as theorycrafters expect to drop the 4th Apex point; Outlaw's Killing Spree rework — over-capped combo points now add 15% damage each instead of duration, 20% faster inside Dread Rush, skips ≥5% DR targets — plus Audacity +80% Ambush making an "Ambush build" viable on damage but not on playstyle; Subtlety "back into a bit of a disaster spot", only a ~2% Goremaw's Bite buff, barely present in PTR M+ logs). **MadSkillzzTV** `Z8MTZevobgw` (a ~7h VOD, but the healer reads are substantive) → **6**: Holy Paladin "way stronger than it is on live" (5% healing + 50% Holy Shock + ~12% other HPS; the 4-set mana clause is ~a non-issue on double Beacon at 90% mana, and the live PTR value is **50%**, not the 60% in the notes) — "it could be a Holy Paladin season"; Mistweaver walked back from his own 07-23 "by far the best healer" to "strong, but I'm not sure it's S tier" after Morning Breeze −60%; Resto Shaman probably meta, Totemic in a full physical melee team "very hard to beat", but stacked RNG (set, Ascendance, storm totem); Resto Druid "the biggest loser by an absolute mile" (Verdant Infusion no longer extends HoTs, Apex proc'd by Swiftmend, Abundance banking gone); Holy Priest "the biggest slept on healer … by quite a bit of a margin", above Resto Druid in keys; Disc fun but mana- and atonement-constrained. **Superseded 14** older same-(creator, spec, lens) takes. **izen** `m81w4xTnRrs` ("The Specs On Life Support") → **12 metaNotes** on exactly the specs he names in his own closing summary — tanks Brewmaster / Guardian / Prot Warrior (M+ lens, popularity-driven; he rejects both the "old meta" and "no comp slot" excuses), healers Resto Druid (raid lens — never a top raid-test result since 07-16, Abundance 96%→50%→60%) plus Holy Priest and Preservation flagged **for M+ only** since both test well in raid, and DPS all three Rogue specs (his #1 buff priority — no in-class escape hatch), Devastation + Augmentation (his #2, Aug with an explicit "don't make it meta" asterisk) and Havoc (13 Devourer played per Havoc — the largest in-class gap). Superseded **5** older izen notes. **Deliberately NOT written:** his Blood DK, Devourer and Mistweaver lines restate existing notes as context for the new reads, which is the inflation the skill warns against. **One transcript-verified SKIP:** Reholy `laCDMF4Wy_s` is a King's Rest key-run VOD of pure party chatter with no analytical read on Blood DK (a party member saying "he is doing tank damage every pool" is not a spec read). **Queued 2 new:** izen `bAE5lf3wK_M` (07-27, "Are The Buffs Enough For The Top Meta Spot? | 12.1 PTR & Holy Paladin Changes" — metaNotes lane; izen `latest` refreshed to it) and Baze `M_qVqxU_SrA` (07-28 "Arms is so back 12.1 15+ Blinding Vale PTR" — a key-run VOD with a title claim, distill-or-verified-skip next run). **Triaged out, not queued:** the seven YoDaTV San'layn/Deathbringer Blood DK key-run VODs (`Jbg9kIg9EJ0` `TezuOhnrIp0` `AnCDyD2UM7E` `KXCoeyc6cws` `CRvqJHkfG7g` `EUa6nHm81X0` `5MSplMq9N8Y`), Reholy `l9wa0BNmYPg` (same pure-gameplay format just verified empty), LBNinja7 stream titles (`2vnJQzY5gE4` `_AKwKIp4RPM`), AutomaticJak `YpM6DIOInEA` (UI/testing VOD), Dalaran `vyLUvBw3Kcs` (5v5 PvP duels), Supatease `YCWnj2QxrW4` / `k1ec99zOI28` (season-ending + PvP), Critcake `e8DKW4wHWa0` (score push). Pending queue **8 → 3**.

- 2026-07-28 (LOCAL evening run — transcript catch-up, deduped against the nightly's coverage) · Fetched+distilled 21 analysis-video transcripts locally; on reconciliation found the nightly had already cited 16 of them, so only content from the 5 uncited videos landed: ZWFtBrOS8lA (LBNinja7 S2 M+ healer tier list, 07-28) → 7 takes (MW S-not-S+, HPal one-nerf-from-top, RSham A one-trick, Disc post-VoidShield-nerf, Pres sleeper, RDruid punished/buff-candidate, HPriest bottom); _V1s61R-mio (AutomaticJak caster-HPal short, 07-27) → 1 take; bAE5lf3wK_M (izen HPal M+ surge, 07-27) → 1 metaNote (HPal now #1 over MW in newest PTR logs); gCNuP2AWvjU (izen 07-12 Mythic raid DPS results) → 2 metaNotes (Enhancement + Windwalker melee-holdout reads); z9sYqwzriCk (izen 07-11 tank read) → 1 metaNote (Prot Pal runaway top tank; 1 older note superseded). **+8 takes, +4 metaNotes** total; izen `latest` → 07-28 Blood-DK-bug-fix video. yt-dlp updated. Duplicate distillations from the stale-base attempt preserved on branch local-catchup-20260728, not merged. npm test 148 pass, build OK.

- 2026-07-29 (nightly CI, Opus 5; single-shot) · All **25/25** creator RSS feeds polled live (25/25 HTTP 200, no retries, 375 entries). Deterministic transcript step fetched **all 3** queued videos (summary.json verdict `ok`) — including Tettles `aqe2LKeMIqQ`, which came back `unavailable` last night and succeeded this time. **Distilled 2 takes.** **Baze** `M_qVqxU_SrA` ("Arms is so back", 07-28) → 1: a self-described Fury main who has disliked Arms since BFA calls this the best Arms has felt in a very long time, crediting two Slayer changes — Sudden Death proc chance **15% → 25%** and the new **Tactical's Edge** free Sudden Death proc on Colossus Smash — for an execute-centric, much faster rotation (three Bladestorms inside Avatar, two inside a Colossus Smash window), no more rage starvation or Shaman dependence, and Execute first "by a mile" ahead of Bladestorm/Reap the Storm in his +15 Blinding Vale breakdown; explicitly says the loop is worth playing even if the numbers get nerfed. **Tettles** `aqe2LKeMIqQ` (07-26, a 3.8h PTR-keys stream VOD) → 1: the only substantive spec read in the whole VOD sits at ~2h47m, and it is a genuine one — asked whether S2 is a "Moonkin tier" he answers that the spec **might get nerfed again**, that after the first round of nerfs it "didn't seem that insane in raid anymore", but that it is "certainly one of the top couple of specs"; he also reads the board as unusually crowded (MM Hunter maybe top DPS on logs; Moonkin, Arcane, Arms, Elemental all good) and says he barely looks at the tier set. **Superseded 2** (Baze's 07-22 Arms take — same 12.1-PTR spec-state lens; Tettles' 07-15 Balance take — same S2-outlook lens). His 07-25 Balance take stays live: 12.0.7-live M+ meta is a **different lens**. **Deliberately NOT written from the Tettles VOD:** his enthusiastic Holy Paladin praise (~28m) and the "MM Hunter is maybe top DPS" aside — both outside his declared Druid / Augmentation-Evoker scope, and the second is a log observation, not a spec read. **`bAE5lf3wK_M` (izen) NOT re-distilled** — the 07-28 LOCAL catch-up run already landed its Holy Paladin metaNote; removed from the queue as already-handled rather than left to be double-distilled. **Queued 3 new in-scope**: Shadarek `Z8Jygl_NpF4` (07-28 "TIERLIST | WoW: Midnight Season 2 (Important)" — DH class-wide scope), MadSkillzzTV `Zf3GQqG-z8s` (07-28 "12.1 Best M+ Healers (UPDATED)" — his healer scope spans RDruid/RSham/Pres/MW/HPal/Disc/HPriest), izen `fUZTzvbL3OU` (07-28 Blood DK bug fix — metaNotes/leads lane; his `latest` already points at it from the local run). **Triaged out, not queued:** Preheat `QBGm9cgEjLE` + Shindigg `TFgO-q1S4Vw` (PTR livestream VODs), Kalamazi `7rIorwjv4_0` ("Quick Lil PTR Slam" — the same title shape was verified empty on 07-27), Supatease `xHd_VBC_Avk` `YXtGRYOPRKU` `31IkN0ugTDM` `nsSEqadIPnE` `3j-rUSeizyg` `jW_eJF3F0Dc` (PvP tier list, patch hype, transmog, shorts — all outside his Shaman/Affliction/Arms-Prot PvE scope), Dalaran `GQizrfwBXwc` (5v5 duels) + `xTa2r7-Tm-M` (mount roundup), AutomaticJak `CAfXTn7nejQ` (title-grind VOD), Critcake `cdJX8LuRG3Q` (score push), YoDaTV `qCQcwRN75A8` (twitch restream), Tettles `Lrn7cOwCIgE` (comment-section reaction). Pending queue **3 → 3**. No creator opinion touched any rating.

- 2026-07-30 (nightly CI, Opus 5; single-shot) · All **25/25** creator RSS feeds polled live (25/25 HTTP 200 first attempt, no retries, 375 entries). Deterministic transcript step fetched **all 3** queued videos (summary.json verdict `ok`; 76 / 862 / 245 chunks). **Distilled 7 takes + 1 metaNote.** **MadSkillzzTV** `Zf3GQqG-z8s` (07-28, "12.1 Best M+ Healers (UPDATED)") → **7 takes**, all inside his declared healer scope, and this video is explicitly an *update* to the 07-26 list so it supersedes cleanly: **Mistweaver falls to A** — the mastery-stacking Morning Breeze / Rising Sun Kick build he'd called S+ (90–100k damage in keys) is dead after a **60% Morning Breeze cut** on top of the ~8% healing nerf, and Sheilun/Vivify feels weak; **Holy Paladin rises to high A** ("some might even place it in S") — Holy Shock +50% and cheaper mana killed the no-Holy-Shock build, and the 4-set now carries what he thinks is the **first outright negative tier-set clause** (Holy Light mana **+60%** in the notes, ~50% datamined) offset by +5% healing, a trade he reads as an *improvement*; Lightsmith + Beacon of Virtue "pleasantly surprised" him; **Resto Shaman held at A**, could nitpick to S — he welcomes the tier-set nerf as moving power out of RNG procs, and expects **Totemic** in the physical-melee comp; **Preservation held** as the "biggest underdog" on pure numbers but he answers the meta question himself: probably not (pilot difficulty, range limits, no good raid buff); **Discipline FALLS to a new B+ row** — he admits the first ranking was generous, Oracle mana still bites and he wants more Atonement transfer for M+; **Resto Druid held** (Abundance/Regrowth buffs landed but Wildstalker damage is very low and he misses Verdant Infusion's HoT extension — explicitly jealous of Resto Shaman's new Swelling Tides); **Holy Priest held ~B** (not bad, damage low-end, wants gameplay changes). **Superseded his 7 prior same-lens M+ takes** (six 07-26 + the 07-17 Preservation one). **izen** `fUZTzvbL3OU` (07-28) → **1 metaNote** in the general-creator lane, never `takes[]`: Blood DK's Apex talent **Dance of Midnight had its stacking value written into a damage-TAKEN field instead of damage-REDUCED**, so every extra Dancing Rune Weapon proc *added* ~4% damage taken — live since Midnight launched. Fixed now, on top of the 4%→6% buff, and he shows the swing in logs: the same Shinki +17 goes **220k → 166k** damage taken per second and **57k → 39k** external HPS required, and a recent +20 puts Blood at 48k external HPS against Prot Paladin's 45k. His conclusion: Blood is a genuine meta-tank contender for S2. Superseded his 07-24 Blood DK M+ metaNote (same lens). His passing mention of **Vengeance's fiery-brand duration bug was deliberately NOT written up** — he frames it as the smaller case and it is not a spec-strength call. **TRANSCRIPT-VERIFIED-SKIPPED: Shadarek** `Z8Jygl_NpF4` ("TIERLIST | WoW: Midnight Season 2 (Important)") — the transcript shows a **joke video**: specs are ranked by whether they are Demon Hunters ("DH is all going up here"), Rogues are "always down at D tier", Augmentation goes in the "fake humans tier". No genuine analytical read → nothing distilled, and it was **removed** from the queue rather than left pending forever. Useful precedent: a title that reads like prime tier-list material can still be satire, and the queue is the right place to find that out. **Queued 2 new in-scope**: MadSkillzzTV `nZX2jWzYDB8` (07-29 "12.1 Healer Prep for Season 2"), izen `Kwugqa7HFao` (07-29 "Season 2's BIGGEST Gearing Changes & Tips For Season 2" — metaNotes/leads lane; his `latest` now points at it). **Triaged out, not queued:** Dalaran `ORoHOEUh_80` (livestream VOD), `mFjc6dvbTrU` (12.1 release-date schedule breakdown — news, and Dalaran is a *class* creator, so a news video has no lane here) and `JM3Uz_fGDP8` (PvP duels); AutomaticJak `S8UQh8VaPWA` (healer **trinket** guide — gear, not a spec-strength read); Shindigg `9UT5iwBhW4s` (PTR keys VOD). Pending queue **3 → 2**. No creator opinion touched any rating.

- 2026-07-30 (nightly CI, **2nd run of the day**, Opus 5; single-shot) · All **25/25** creator RSS feeds polled live (25/25 HTTP 200 first attempt, no retries). Deterministic transcript step fetched **both** queued videos (summary.json verdict `ok`; 5113 / 543 chunks). **Distilled 3 takes from MadSkillzzTV `nZX2jWzYDB8`** (07-29, "12.1 Healer Prep for Season 2", a ~5h prep stream — the analysis is scattered but real), all inside his declared healer scope: **Mistweaver SOFTENED** from yesterday's drop — he retested both builds after Morning Breeze −60%, calls the mastery build "a lot weaker" but still playable, personally prefers the normal build (base mastery spins to win at ~5 targets), pulls a post-nerf normal-build log doing **61k** damage ("not the worst, not the best" against the ~100k the mastery build used to reach), concludes "monks are not bad after the changes at all" with **spot healing** (Vivify / Sheilun's Gift) the real drag, and bets Blizzard buffs Sheilun's; **Holy Paladin FIRMED** from "high A, some would say S" to the outright **front runner** for best healer of the first 4–5 weeks of S2, S tier alongside Resto Shaman but "good in any" comp where Resto Shaman needs the melee/physical comp; **Resto Shaman gains a RAID-lens take** — "looking way better" in raid on the latest buffs — kept **complementary** to his live 07-28 M+ take per the lens guardrail, with his own caveat that raid healer tier lists are untrustworthy on two Mythic test bosses' worth of data. **Superseded his 2 same-lens 07-28 takes** (Mistweaver, Holy Paladin). **Deliberately NOT written:** his Resto Druid passage is a personal-enjoyment statement ("my least enjoyed healer … I don't care if it could be the best healer in Mythic+"), not a spec-strength read; his Holy Priest passage (viable to +21s, "won't scratch the meta", hasn't been meta since Shadowlands, prefers Archon over Oracle) restates the 07-28 take rather than replacing it. **TRANSCRIPT-VERIFIED-SKIPPED: izen `Kwugqa7HFao`** ("Season 2's BIGGEST Gearing Changes") — the full 26-minute transcript is a gearing / bonus-roll / great-vault PSA end to end (heroic-raid bonus rolls now mythic-track, 1:1 vault conversion, crest surplus → crafted gear, stockpiling tokens for alts); its only spec mentions are **loot-targeting examples** ("if I am a holy paladin … best-in-slot crit ring"), exactly the fight-artifact shape the skill says not to inflate → **0 metaNotes**, and no build/tuning lead. Removed from the queue rather than left pending. **Queued 1 new in-scope:** Shadarek `7pNUYPaoePY` (07-30 "State of Havoc DH Season 2" — his class-wide DH scope). **Triaged out, not queued:** YoDaTV `vblPETORg-I` (twitch restream), Supatease `8EeooCtkoik` (PvP), LBNinja7 `RJnOHSK5nFk` (Mistweaver stream title). Pending queue **2 → 1**. No creator opinion touched any rating.

- 2026-07-30 (LOCAL run, Opus 5 — collided with the CI nightly; see refresh-metrics log for the reconciliation) · Polled **25 channels** (52 transcribable class creators + izen), 0 RSS failures, 72 videos since 07-26, 19 new + title-relevant, **8 transcripts fetched** with yt-dlp at the requirements.txt pin (2026.07.04, **not upgraded**). The nightly had already distilled the MadSkillzz healer tier list (`Zf3GQqG-z8s`) and Baze's Arms video (`M_qVqxU_SrA`), so those were dropped on reconciliation. **3 takes re-applied, 1 superseded:** · `7pNUYPaoePY` **Shadarek "State of Havoc DH Season 2" (07-30)** — published after the nightly ran, so genuinely new. Two takes kept live as complementary lenses: *outlook* (Aldrachi ~4% clear of Felscarred in ST vs ~1% live, because Inertia 18→12%, Blind Fury and Immolation Aura nerfs all land on Felscarred and miss Aldrachi — he reads it as Felscarred dragged down rather than Aldrachi fixed, and expects no more changes before season start) and *tier set* (~8-9% but the 4-set "actively feels bad" forcing Essence Break onto a desynced cooldown; its 35% currently lands on the DoT instead of the initial strike). Superseded his 07-22 Havoc take. · `xote4lf9dfs` **AutomaticJak Resto Shaman** — **owner decision this run:** Riley confirmed Jak is credible on **all healing specs**, so he was added to **Shaman/Restoration** (the explicit ask) and **Druid/Restoration** (the only other healer spec he lacked), `latest` refreshed across all six entries. With scope widened the read landed as 1 take (Farseer "might finally be back" on the Riptide / totem-extension / ancestor-Chain-Heal buffs; flagged in the claim as a brief short-form read, since the video is a sponsored short). · **4 transcript-verified skips:** `Z8Jygl_NpF4` Shadarek "TIERLIST (Important)" is a **comedy bit** (every DH spec top, an actual "fake humans" tier for Augmentation); `aqe2LKeMIqQ` Tettles and `nZX2jWzYDB8` MadSkillzz are **stream VODs** (~5h for the latter) whose only spec reads are one-line chat replies; izen `Kwugqa7HFao` "Season 2's BIGGEST Gearing Changes" is gearing/loot strategy with **no per-spec meta reads** (4 incidental class mentions in 4k words) → no metaNotes. · **Left for a human:** Jak's **Priest** entry still has no `specs` list (= whole class, which includes Shadow, a DPS spec). If his authority is healer-only that entry wants scoping to Discipline/Holy — not changed here, since narrowing an existing scope was not requested. · Also reconciled the scheduled-task prompt (`~/.claude/scheduled-tasks/wow-ptr-watch/SKILL.md`): its standing "Update yt-dlp first (pip install -U yt-dlp)" line contradicted this skill's pin rule and now says not to upgrade in-run.
  - **Follow-up (owner decision, same day):** Riley confirmed AutomaticJak should not carry Shadow, so his **Priest** entry was scoped from whole-class to `["Discipline","Holy"]` and its credential aligned with his other five entries. This closes the item flagged earlier today. He now covers **exactly the 7 healer specs and no DPS spec** (Druid/Resto, Evoker/Pres, Monk/MW, Paladin/Holy, Priest/Disc+Holy, Shaman/Resto). No takes were orphaned — he has never had a Shadow take, and his two live Priest takes (Disc + Holy, 07-23) stay in scope.

## 2026-07-31 (nightly) — 25/25 feeds polled; 1 transcript verified against an existing take; queue 1→5
All 25 unique transcribable creator RSS feeds polled live, **25/25 HTTP 200 on the first attempt**, no retries.
The deterministic transcript step fetched the single queued video (`summary.json` verdict `ok`, 473 chunks).
**ALREADY DISTILLED — Shadarek `7pNUYPaoePY`** "State of Havoc DH Season 2" (07-30): read the fetched
transcript end to end and checked it against the **two Havoc takes already dated 2026-07-30** in
`creator-takes.json` (deep links `t=56` and `t=855`, landed by the 07-31 local run). They are faithful and
complete — Aldrachi ~4% ahead of Felscarred in single target vs ~1% on live (Inertia 18%→12%, Blind Fury
fury-gen nerf, Immolation Aura losing fury + 8% damage, all of which Aldrachi is indifferent to); the same
pure single-target Aldrachi build correct in M+ with Felscarred ~3% behind; AoE mediocre but funnel/priority
"unmatched"; set rated ~8–9% overall with the 4-set disliked for desyncing Essence Break, and the 35% bonus
currently landing on the DoT instead of the initial strike. **No duplicate take written**; removed from the
queue as distilled. His 07-22 same-lens Havoc take was already `superseded`.
**Queued 5 new in-scope videos** (no transcript available to the agent): izen `OQa0Yzv18Hs` (07-30 "PTR
Mythic+ Best DPS Specs — Arms Stocks Rising" — generalCreator **metaNotes** material, M+ lens; `latest`
refreshed to it), Shadarek `Z8Jygl_NpF4` (07-28 "TIERLIST | WoW: Midnight Season 2"), YoDaTV `CNWAq9aOHO4`
(07-30 "Blood DK Meta CONFIRMED? Mythic+ Tierlist Update" — **his declared scope is Protection Warrior, so
only a Prot Warrior take could ever come out of it**; distill-or-verified-skip), Obli `owCby8soRNY` (07-31
San'layn Unholy DK PTR, inside his Frost/Unholy scope), Kalamazi `YOnGHSUZ4A0` (07-31 "Do These 5 Things NOW
To Prep For Patch 12.1" — distill-or-verified-skip). **Not re-queued:** izen `Kwugqa7HFao`, already
transcript-verified-skipped on 07-30.
**Triaged out** (off-scope, not queued): 12 Supatease PvP/stream uploads (incl. `31IkN0ugTDM` PvP tier list,
`nsSEqadIPnE` Ele Shaman — outside his Arms/Prot scope), 6 Dalaran Gaming PvP-duel + systems-news items,
4 Tettles podcast/drama uploads, 3 YoDaTV twitch restreams, **MadSkillzzTV `_qJcyZP-TRw` and AutomaticJak
`S8UQh8VaPWA` — both healer-TRINKET videos: gear, not a spec-strength read**, plus stream VODs from Preheat
(`QBGm9cgEjLE`), Shindigg (`9UT5iwBhW4s`, `TFgO-q1S4Vw`), Critcake (x2), AutomaticJak (x2), LBNinja7 (x2),
Shadarek `xdjL13tqUIs` (Heroes of Hammerwatch 2 stream) and Kalamazi `7rIorwjv4_0` + `UnoZnAX_Alo`
(untitled PTR stream VODs). **Note for the seen-set:** `log.md` had no entries between 07-22 and today, so
this run reconstructed the seen-set from `creator-takes.json` URLs (92 distilled videoIds) + the pending
queue + a 2026-07-28 publish-date cutoff rather than from the log. No creator opinion touched any rating.

- 2026-07-31 (LOCAL run, Opus 5 — re-applied on top of the same day's nightly 370e058 after resetting to origin/master, per the local-run skill) · The nightly polled 25/25 and **queued 5 videos it could not transcribe from CI**; this run fetched those transcripts from a residential IP with yt-dlp at the **requirements.txt pin (2026.07.04 — not upgraded)** and distilled **3 of them: 9 takes + 1 metaNote, 8 takes superseded.** All 25 feeds were independently polled first (25/25 HTTP 200, 375 entries, 45 videos since 07-29, 28 unseen, 3 in scope after title filtering) — the same conclusion the nightly reached.
  · **YoDaTV `CNWAq9aOHO4`** (07-30, "Blood DK Meta CONFIRMED? Mythic+ Tierlist Update") → **8 takes**, a full same-lens replacement of his 07-24 list (all 7 superseded): **Blood DK alone in S+** — highest damage AND tankiest tank, with the Apex/Dancing Rune Weapon bug fix quantified as roughly 20% less damage taken across the half-dungeon the weapons are up, plus his own counter-evidence (most top PTR keys still are not Blood DK; he has not pushed it himself); **Prot Paladin A+ and "gutted"** by the Reflection of Radiance nerf (the +10% DR from Blessed Hammer washed out by Sentinel 15s to 12s), surviving on Blessing of Sacrifice — though he notes logs still show the highest keys done by Prot Paladin; **Holy Paladin holds S** as the best pure-healing healer, kept out of S+ by low damage and no raid buff; **Vengeance A+, "one buff away"** (Annihilator roughly on par with Blood DK counting Chaos Brand, Ultrakill measured about 30% behind, weak self-healing outside Metamorphosis, and a Void Fall Meteor double-proc bug that would hurt if fixed); **Guardian Druid drops to A** ("pretty nerfed", very low single target); **Brewmaster A**; **Prot Warrior A**, same placement as Season 1 plus unusually valuable Spell Reflect across the Season 2 pool; and a **spec new to his take set, Retribution A+** (damage "really good", still squishier than the tanky DPS and no damage raid buff) — a genuine placement with reasoning, though brief. → **FOR RILEY (scope question, not changed here): he analyses *Arms Warrior* in real depth in this video** — "the best DPS going into next season", with reasoning on funnel, two-target cleave and Spell Reflect — **but his Warrior entry is scoped to `Protection`, so no Arms take was attributed.** Widen that entry if he is credible on Arms.
  · **Obli `owCby8soRNY`** (07-31, San'layn Blightfall Unholy DK) → **1 take**, superseding his 07-25 same-lens M+ hands-on: deliberately deflationary — San'layn Blightfall has pushed ahead of Rider, but he finishes the key around 360-400k, says flatly it is "definitely not OP" and that Arms Warrior does the same damage, calls single target okay but not stellar, and flags a structurally weak 45-second cadence (one Dark Transformation window including the consumed Blightfall is worth only about 120k DPS, because Unholy has nothing else on that timer). Group-dependent: his own numbers were inflated by Shaman mastery, Havoc's magic-damage buff and Power Infusion, and in a fast-clearing key with a top-tier pilot he could not ramp at all. Build notes kept (Blightfall scales with Soul Reaper for a 20% bonus worth lining up; take Desecrate over the Death and Decay Vampiric Strike proc talent). His closing Frost DK line was **deliberately NOT written up** (too thin to supersede his fuller 07-25 Frost comparison), and his "Blood DK damage is absurd, no way that goes live" remark is **outside his declared Frost/Unholy scope** so it was not attributed — though it independently corroborates YoDaTV's Blood DK read.
  · **izen `OQa0Yzv18Hs`** (07-30, "PTR Mythic+ Best DPS Specs - Arms Stocks Rising") → **1 metaNote**: Arms, historically among the four or five least-played M+ specs every season since Legion and — with Feral and Devastation — one of the only specs never to make a meta comp, is right now the **most-picked DPS in +20s on the PTR**, two weeks out. He credits Slayer overtaking Colossus specifically (Tactical Edge rebuilt to grant a guaranteed Sudden Death proc off every Colossus Smash; Slayer's Dominance 15% to 25%; a bug fix raising the Executioner stack cap from three to five), showing Bladestorm's effective cooldown collapsing from 90s to roughly 24-26s in practice, plus Arms' priority damage against Marksmanship's spread AoE. The caveat he names himself: no dispel and an Attack Power buff unlikely to matter in the ranged-caster comps it would need to join. **Kept complementary** to his 07-22 Arms *raid*-lens note (different lens — nothing superseded). His Marksmanship mentions are a comparative foil, not a spec-strength call, so they were not written up.
  · **Queue 5 → 2**: the three above were drained as distilled. **Left queued deliberately:** `YOnGHSUZ4A0` (Kalamazi "Do These 5 Things NOW To Prep For Patch 12.1" — I triaged it out on the title as a class creator posting general news, per the Dalaran precedent, but the nightly queued it, so leaving it lets a future run settle it from the transcript rather than re-litigating on the title) and `Z8Jygl_NpF4` (Shadarek "TIERLIST (Important)") — **note for whoever drains it: this has already been transcript-verified as a comedy bit TWICE** (07-30 nightly and 07-30 local: every DH spec ranked top, an actual "fake humans" tier for Augmentation). It keeps reappearing, so the discovery step evidently re-queues it; that re-queue loop is worth fixing rather than re-transcribing it nightly. · `latest` refreshed for YoDaTV (six entries), Obli and izen. No creator opinion touched any rating.

- 2026-08-01 (nightly CI, Opus 5; single-shot) · All **25/25** feeds polled live (24 transcribable class creators + izen), **25/25 HTTP 200 first attempt**, no retries or backoff needed, 375 entries, **38 videos published since 07-30**. Deterministic transcript step verdict `ok` (requested 1, fetched 1). · **DISTILLED Kalamazi `Hn9upmp8ywc`** ("BIG Warlock Buffs Are Here!", 08-01) — a **4h05m / 5093-chunk** post-tuning stream testing the 07-31 Warlock pass hands-on (Dummy Dome, sims, keys). **4 takes added, 3 superseded within the same lens only.** *Destruction (raid)*: strongest Warlock in single target "by a decent margin", ~153–155k in his session vs ~146k Demo / ~144k Aff, his pick for most raid fights; he argues the Havoc 60→50% trim was unnecessary alongside the Chaos Bolt buff. *Demonology (raid)*: Shadow Bolt +45% / Demonbolt +55% / Gloomhound +35% likely push the build back to **Sacrificed Souls**, implosion edging Power Siphon in his tests, Soul Harvester simming just over Diabolist. *Affliction (raid)*: the Haunt 12%→16% modifier is real but he wanted a direct **UA** buff and says a ~4% effective bump "isn't going to do much"; still worth playing on a handful of seed-spam fights. *Destruction (M+)*: all three specs close, Destro the lean. **Superseded:** 07-24 Destro raid, 07-24 Demo raid, 07-27 Destro M+ — the 07-27 Aff and Demo **M+** takes were deliberately kept live as complementary lenses. Kalamazi's `latest` refreshed **only now that the transcript was actually read**. · **QUEUED 1 new in-scope:** Obli `okDLvLGMFzs` (08-01, "Single target BUFF, AOE NERF(?) for Unholy DK! / Midnight Season 2 PTR 12.1") — inside his listed Frost/Unholy scope. Queue **1 → 1**, `skipped[]` unchanged at 5. · **TRIAGED OUT by title filter (10 unseen, none in scope):** Supatease `gX15kwrmLrY` / `3RtKJIppzdc` / `dnHUc0cFOOk` (rank-push streams) + `CL7PkChRq3E` (Classic+ news); Dalaran Gaming `-bZHpvG9P38` + `_G9hsKtI_Fc` (5v5 1v1 PvP duels — this tracker is PvE); Tettles `jPsni-izY8A` (stream VOD) + `yFf4a0pax-I` (tournament drama); AutomaticJak `OrwA8lAuK-g` (title-grind stream). · **METHOD NOTE worth keeping:** the first seen-set pass used a loose 11-char-token regex over the log prose and produced **198** "ids", which risks marking a genuinely new video as seen. Every 07-30-or-newer id was therefore re-checked against **precise** sources — `youtu.be/` links in creator-takes, the queue, the `skipped[]` lane, and literal substring presence in the log — and all 28 "seen" calls held up. Prefer the precise check; the loose regex is fine only as a first-pass filter. · No creator opinion touched any rating. **Carried forward for a human:** the RSS windows still expose ~180 pre-July videos no surviving log entry names individually; the durable fix is a persisted seen-set file, not more prose.

- 2026-08-02 (nightly CI, Opus 5; single-shot) · All **25/25** feeds polled live (24 transcribable class creators + izen), **25/25 HTTP 200 first attempt**, no retries or backoff, 375 entries, **57 videos published since 07-30**. · **NOTHING DISTILLED, and that is not a miss:** the deterministic transcript step reported verdict `ok` with **requested 0 / fetched 0** because the committed queue was **empty**, so there was no transcript to read. The agent holds no transcript credentials and did not fetch YouTube or any transcript API. · **QUEUED 8 new in-scope videos (queue 0 → 8, `skipped[]` unchanged at 5):** LBNinja7 `Elr2gfyCFsE` (08-02, per-healer-spec Season 2 outlook), izen `OP49uzLmaDk` (08-01, "Specs Balance Tuning #9 — This Time It's Nerfs" — general-creator leads/metaNotes lane, verify against the forum before logging anything), Kalamazi `DnYoCpImTZw` (08-01, the *edited* Warlock-buffs video — distinct from the 4h stream `Hn9upmp8ywc` distilled 08-01, so expect same-lens supersession), AutomaticJak `AfxJlv15i04` (08-01, Season 2 PTR M+ healer tier list), MadSkillzzTV `3E1yuNcmS2g` (08-01, 12.1 best M+ healers), Supatease `NAErjQ18w0Y` (08-01, 12.1 Elemental Shaman — inside his Shaman scope), YoDaTV `9cnTo1yK3C8` (08-01, Season 2 patch notes + tierlist update), Tettles `_oVhOLNc3Dg` (08-01, "Moonkin is gone" — names a Druid spec and Tettles is the Druid authority, so let the transcript settle it rather than a title guess). · **TRIAGED OUT:** Dalaran Gaming `haVxf1T4XKw` + `uBvZ4Abj57M` (5v5 PvP duels / Trading Post — PvE tracker); YoDaTV `OKadtduMIns` (twitch restream); Shadarek `g95zUhNNtYU`, AutomaticJak `btNeQrcDcaI`, Shindigg `TCWyNP7f18E`, Critcake `50axk7g7dfg` (key-run / stream POVs, standing livestream precedent); Supatease `Ud8-YiXvm9M` (untitled news stream) and **`611TXOVEUAw` / `yd6v1ih-aWw` / `-LIZghTxXqI`** — Moonkin, Arms Warrior and Prot Paladin takes from a **Shaman** creator: no take could be attributed from them under the spec-scoping rule, which is *why* they were dropped rather than queued. That is now the second run in a row where Supatease posts cross-class reads; combined with the 07-31 `skipped[]` note on `hvxrLgUQk1w`, a human may want to consider whether he belongs in `generalCreators` — registry scope is not an agent's call. · **DATA-vs-LOG DISCREPANCY FOUND AND RESOLVED:** the 08-01 entry above says Obli `okDLvLGMFzs` was left QUEUED, but the committed `pending-transcripts.json` has an empty queue **and** `creator-takes.json` already holds a full 08-01 Obli Unholy take citing that exact video. So it was distilled and the log prose is what is stale — it was correctly treated as seen. Trust the data files over this log when they disagree. · No creator opinion touched any rating. **Carried forward for a human:** the RSS windows still expose ~180 pre-July videos no surviving log entry names individually; the durable fix is a persisted seen-set file, not more log prose.


- 2026-08-02 (nightly CI, Opus 5; single-shot — **second run of the day**) · All **25/25** feeds polled live (24 transcribable class creators + izen), **25/25 HTTP 200 first attempt**, no retries or backoff, 375 entries. yt-dlp neither invoked nor modified; no transcript API called by the agent. · Deterministic transcript step verdict `ok`, **requested 8 / fetched 8** (40-4082 chunks). **Distilled 32 takes from 6 videos + 17 metaNotes from 1; superseded 31 same-lens takes and 14 same-lens metaNotes. Queue 8 → 0, `skipped[]` 5 → 6.** · **AutomaticJak** `AfxJlv15i04` (S2 PTR M+ healer tier list) → **7**: Holy Paladin the **lone S** (tier-set Holy Light → Infusion → double-healing Flash loop, mana held up by Virtue + Shield of the Righteous, poison dispels in six of eight dungeons), Resto Shaman **A** with **Totemic still ahead of Farseer** despite the Farseer buffs, Mistweaver `actually needs buffs` (the mastery push plus the −60% Morning Breeze left the casted-healing backstop gone), Disc **B** (dispel profile + no active mana regen), Holy Priest **C** (Oracle ≫ Archon, no whole-party tool, dominant into rot), Resto Druid **C** and his harshest read of the year, Preservation strong on healing but priced out by GCDs and no raid cooldown. · **LBNinja7** `Elr2gfyCFsE` (season main-choice pros/cons) → **7**, and he explicitly revises his own tier list: Mistweaver went **S+ → S** and he now also puts **Holy Paladin in S** having tested it more; Resto Druid is `one numeric buff away`; Preservation `keeps winning`. · **MadSkillzzTV** `3E1yuNcmS2g` (90-second update) → **7**: Holy Paladin **finally into S**. · **YoDaTV** `9cnTo1yK3C8` (post-notes tier list update) → **9**: Blood DK keeps the top tank slot through the 4-5% damage nerf (survivability untouched), Guardian to **A+** on the 8% buff but still under half a DPS`s damage, Vengeance one defensive buff short, Prot Paladin faded since the Reflection of Radiance nerf, Arms and Arcane both **S+** but **mutually exclusive on raid buffs** (Battle Shout vs Arcane Intellect), and a Blood DK + Holy Paladin core is zero raid buffs. · **Tettles** `_oVhOLNc3Dg` → **1**. A 222-minute stream VOD — the shape usually skipped — but the Balance Druid stretch is sustained enough to distil: he calls the `Moonkin is gone` title clickbait, puts the nerf at ~3%, and his real concern is the raid profile (two of the last three bosses are two-target, Moonkin`s weakest case; good on three of the first four) plus bottom-half burst (~284k on Convoke/Keeper vs ~338k Unholy DK). **Precedent refinement:** a VOD is not automatically a skip — scan for a sustained segment before deciding. · **Supatease** `NAErjQ18w0Y` → **1** Elemental Shaman take, written with the lens stated in `patchContext`: his damage tests are on **PvP dummies and a duel** and his PvE read is secondhand from other players` logs. Distilled rather than skipped because the structural claim (power moved out of Ascendance into baseline, strong S2 set bonus) is patch-level, not PvP-only — but a reader must see the framing. · **izen** `OP49uzLmaDk` (Balance Tuning #9) → **17 metaNotes**, general-creator lane only: Blood DK (most-played PTR tank, `nerfed this little is a win`), Devourer (top of raid testing, nerf deserved, Void-Scarred hit hardest), Havoc (poor results, +5% is right), Balance (5th most-played M+ DPS; ~3% ST but 6-8% AoE), Devastation (the Scintillation/tier-set fix stacks two reductions → net ~2% **nerf** on an already-weak spec), Marksmanship (~12% total, very large), Arcane (already best and **still buffed** — Splintering Orbs 10→50% is the real one, Arcane Blast +20% is noise), Holy Paladin (already the most-played M+ healer, now 2.5-3x Mistweaver`s picks), Holy Priest (buff fine, wrong diagnosis), all three Rogues (bottom of raid testing; Outlaw got least because it was doing best), Elemental (Farseer −20%s ≈ 5%), Shadow (spread-cleave trim), Arms (**got away with it** — ~3% on Slayer, effectively a buff on Colossus with the 4-set going 10%×3 → 20%×5), Guardian + Prot Warrior (lowest-damage tanks get flat buffs). **No new build lead** — everything traces to the already-logged 07-31 notes. `latest` refreshed to this video. · **TRANSCRIPT-VERIFIED-SKIPPED: Kalamazi** `DnYoCpImTZw` — an **edited re-cut** of the 4h stream `Hn9upmp8ywc` distilled on 08-01: same walkthrough, same dummy tests, same numbers (Destro ~156k / Demo ~146k / Aff ~144k ST), same `Destro ahead by ~10k` conclusion, and his three live 08-01 Warlock takes already carry them. Moved to the durable `skipped[]` lane rather than duplicated. **New precedent: a creator re-uploading an edited cut of an already-distilled stream is a skip, not a supersede** — superseding would retire a take and replace it with the same content under a new url. · **TRIAGED OUT (only one previously-unseen upload since 03:02):** Shadarek `mVmrqa1Hslc` (PTR Temple of Sethraliss +15 POV) under the standing key-run/livestream precedent. · No creator opinion touched any rating. · npm test 190 (178/12), build OK, snapshot written, manifest rewritten, `check-refresh --manifest` passed.

- 2026-08-02 (LOCAL run, ~19:3xZ — Opus 5; residential catch-up, second local run of the day) · **Queue was already drained to 0 by the nightly's deterministic step**, so this run's value was discovery: all 25 feeds re-polled live for uploads published AFTER the nightly's ~11:48Z poll. **6 previously-unseen videos, all published today 13:00–17:05Z; 2 distilled, 4 triaged out.** · **DISTILLED — YoDaTV `vgBQJjfT20g`** (08-02T16:00, "General Guide for Blood Death Knight in 12.1! (Mythic+)") → **1 take, Blood DK**, which is exactly his declared `specs: ["Blood"]` scope for Death Knight. He opens by calling Blood **the best M+ tank at the start of Season 2** on current PTR testing — most damage of any tank especially in AoE, best self-healing, steadiest health bar in high keys — crediting the buffs plus the Apex-talent hotfix that flipped the talent from *increasing* damage taken 4% to *reducing* it 6% per stack (~10% swing on one weapon, ~20% on two). Also: San'layn over Deathbringer (Blood Soaked Ground 5%→8% physical DR) though he calls survivability close and says theorycraft may favour Deathbringer; Versatility/Haste for keys; tier set "very good" but his HPL testing says do **not** consume the 4-set at 10 stacks off cooldown. **Supersedes his 08-01 Blood take** (`9cnTo1yK3C8`) — same creator, same spec, same S2 M+ lens, same position stated more completely. · **DISTILLED (partially) — Dalaran Gaming `9l7sbfFnwSE`** (08-02T14:00, "HUGE Nerfs To S-Tier Specs! (Patch 12.1 PTR Class Buffs & Nerfs)") → **3 takes, all Rogue**. The video is overwhelmingly a **readthrough of the already-logged 07-31 build #18 notes**, and the skill's roundup rule says not to stretch that into per-spec takes — so nothing was distilled for Druid / Hunter / Mage / Shaman, where his commentary is recitation plus a sentence. **Rogue is the exception and his home class** (`specs: null`, "Rogue-focused guide YouTuber"): he gives a genuine structural read that the buffs (Assa +10%, Outlaw +6%, Sub +10%) are welcome but do **not** fix the class's real problem — all three are weak specifically at **two and three targets**, a "dead zone for the whole class" Blizzard did not address, and Subtlety's new Warfiend's Bite "just doesn't accomplish that goal". **Supersedes his three 07-26 Rogue takes** (`cQHcrw2m_OU`) — same creator, same specs, same 12.1/S2 M+ lens, and the 08-02 reads incorporate the 07-31 pass those predate. · **TRIAGED OUT (title/format filter, no transcript fetched — so NOT added to `skipped[]`, which is the transcript-verified lane):** Supatease `WeO7_4AARmU` (New Spell Visual) and `0vsuqy99F2A` (multiclasser gameplay); Critcake `abSbWlojhpc` (+24 key run POV) and Shadarek `NVbuuILEUGo` (PTR Temple of Sethraliss +17 POV), both under the standing key-run precedent; YoDaTV `R6pPLdrv7as` (twitch promo). · **Tettles `cNAYduWx_8c` ("Moonkin is gone 🦀🦀") — checked rather than assumed**, because Tettles is *the* Balance authority and build #18 nerfed Balance: yt-dlp reports `duration=NA` with a timestamped title, i.e. a **live stream**, so there are no captions to distill. Worth re-checking if a VOD is published. · Take vocabulary gotcha worth keeping: `takes[]` sentiment is **buff | nerf | neutral | mixed** (metaNotes use positive/negative/neutral/mixed) — nothing validates it, and a "positive" take went in before it was caught against the 294-row precedent and corrected to "buff". · No creator opinion touched any rating. Queue 0 → 0. takes 294 → 298 (108 live), metaNotes unchanged at 125. npm test 207 (194 pass / 13 skipped), build OK, snapshot written, manifest deliberately NOT rewritten (partial run), `check-refresh --manifest` passed.

- 2026-08-03 (LOCAL run, Opus 5; residential — the 10:37Z nightly failed its publish gate, so its discovery was discarded and this run re-derived everything live) · **25/25 feeds polled, all HTTP 200.** yt-dlp at the pinned **2026.7.4**; neither installed nor upgraded. Six genuinely-unseen in-scope videos in the 08-01+ window; **2 distilled, 2 transcript-verified-skipped, 2 triaged out by title/metadata**.
  · **DISTILLED — Kalamazi `ReWs_ZnYtO8`** (08-03, 16m, "WHAT Will Warlocks Play In 12.1's New Raid?") → **3 Warlock takes on a per-boss Venomous Abyss RAID lens**: Destruction reads as the spec for nearly every boss ("we're looking at a pretty big Destro raid") and is his best-in-single-target AND best-in-spread-cleave pick, but he tempers it at class level — lock single target is not in a phenomenal spot and there are classes ahead; Affliction is **undertuned**, its value narrowed to seed-spam into stacked adds after losing Patient Zero and Nocturnal Yield plus the tier-set nerf; Demonology is situational (single target level with Affliction ± Apex RNG, good stack cleave, but pet travel time hurts on add-chasing fights). **ASR CAUTION:** at ~10:50 the captions read "so destruction took a pretty big hit in this fight" in the middle of an Affliction passage — he misspoke (the sentence lists Affliction's losses and concludes "this is going to be a Destro fight"). Paraphrased to Affliction; do not quote that line.
  · **DISTILLED — LBNinja7 `gvh4R_QSwaI`** (08-02, 7m, "UPDATED Midnight Healer META Prediction") → **7 healer takes**. Mistweaver drops a clear step below Holy Paladin to the back of A (he is a Mistweaver main; says the Rising Sun Kick nerf hurts less on its own than expected but exposed how little Shaluun's Gift / spot healing contributes); Holy Paladin the lone S and "best healer" but deliberately not S+, held back by not amplifying the Blood DK / Arcane Mage / Warrior core dominating PTR keys; Resto Shaman to the top of A as the consistent pick; Disc and Preservation "still very solid" (Presv his standing sleeper); Holy Priest and Resto Druid better than their reputation but capped by comp ("a worse Disc Priest" / "a worse Resto Shaman").
  · **SUPERSEDE PASS — lens split, deliberately partial (10 retired).** Kalamazi's three 08-01 `Hn9upmp8ywc` **raid-lens** takes were superseded by the new raid takes; his 08-01 t=8857 **M+ outlook** take and his 07-27 `ZOVnfoXjuoc` **M+ dummy-testing** takes were **left live** — different lens. LBNinja7's seven 07-28 `ZWFtBrOS8lA` takes were superseded because the new video *explicitly* corrects that tier list; his seven 08-02 `Elr2gfyCFsE` **main-choice pros/cons** takes were **left live** — a playstyle/choice lens rather than a power ranking. Live counts after: Kalamazi 6, LBNinja7 14.
  · **VERIFIED-SKIPPED → durable `skipped[]` lane (6 → 8):** AutomaticJak `IJPVqbfI1w4` (41-second Short naming two S2 healer trinkets and their drop sources — pure loot-targeting, the shape the skill says not to inflate into a take, and trinkets are not in the data model); Kalamazi `tfIcqmIi2o8` (4h17m livestream VOD; its spec content is one-line chat replies — Haunt-buff grumbling, "all three locks are close in M+ but none are meta" — duplicating his structured same-day video, matching the Tettles `aqe2LKeMIqQ` precedent).
  · **TRIAGED OUT BY TITLE, not fetched:** Shadarek `K8PRMSVfkXI` (PTR +12 Altar of Fangs key-run POV — standing key-run precedent) and Dalaran Gaming `eax1FFPB6QI` (5v5/1v1 PvP duels — **PvP is out of scope for a PvE tracker**).
  · **NOT RE-OPENED, checked rather than assumed:** Tettles `cNAYduWx_8c` and Supatease `yd6v1ih-aWw` were re-surfaced by discovery because the nightly had queued them, but both were already correctly dispositioned on 08-02 (a livestream with no captions; Moonkin/Arms takes from a **Shaman** creator that the spec-scoping rule excludes). **This is the second time title/metadata triage decisions have had to be re-derived from log prose** — the durable `skipped[]` lane only covers *transcript*-verified skips, so metadata-triaged ids keep coming back. Worth a human deciding whether that lane should also accept a `triaged` reason.
  · `latest` refreshed on the Kalamazi and LBNinja7 entries that already carried the field (not added where absent — that would be a registry-structure change). Queue **0 → 0**. No creator opinion touched any rating.

- 2026-08-03 (nightly CI, Opus 5; single-shot) · **All 25/25 feeds polled live, 25/25 HTTP 200 first attempt, 375 entries. 0 takes, 0 metaNotes, 0 superseded.** `transcript-fetch/summary.json` verdict `ok` with **requested 0 / fetched 0** — correct, the local run at 14:09Z had already drained `pending-transcripts.json` to empty.
  · **Two videos new since that run, both triaged out BY TITLE without a transcript fetch:** Critcake `Xiy0gotKMRE` (08-03T15:13Z, "Setting up EllesmereUI") — UI configuration, no class/spec/patch content; Supatease `IKVfX3GY42M` (08-03T14:29Z, "Rank 1 WORLD Multiclasser GO TIME") — stream-session title, no spec or 12.1 content, matching his established VOD pattern (`yd6v1ih-aWw` dispositioned the same way on 08-02). Neither queued (neither passes the keyword filter), and both were <1h old anyway — inside the 2–6h auto-caption lag.
  · Queue **0 → 0**, `skipped[]` **8 → 8** (untouched). izen's `latest` already points at `OP49uzLmaDk` (08-01), still his newest, so `community.json` needed no edit. No creator opinion touched any rating.
  · **Method note for the next run:** deriving the seen-set by regex over log prose (backticked ids + `youtu.be/` links) **undercounts badly** — it reported 192 "unseen" videos when the true number was 2. A plain substring scan of the whole of `log.md` + `creator-takes.json` + `pending-transcripts.json` for each feed id is both simpler and correct; it cut the false positives to the ~168 pre-pipeline backlog entries that every run has already triaged. This is the third run to re-derive triage decisions from prose — the standing suggestion that `skipped[]` also accept a `triaged` reason still stands for a human.

- 2026-08-03 (LOCAL run, ~15:40Z — Opus 5; residential, scheduled task; **second local run of the day**, ~25 min after the 15:10Z nightly) · **All 25/25 feeds polled live, 25/25 HTTP 200 first attempt, no retries. 0 videos processed, 0 takes, 0 metaNotes, 0 superseded, queue 0 → 0, `skipped[]` unchanged at 8.** Nothing changed, and that is the correct outcome rather than a miss.
  · **Decisive check:** enumerated **every** upload across all 25 feeds published since 2026-08-02T00:00Z — **21 videos, all 21 already named in this log**, i.e. every one already distilled, transcript-verified-skipped, or title-triaged by the 08-02/08-03 runs. The newest upload anywhere is Critcake `Xiy0gotKMRE` (08-03T15:13Z, "Setting up EllesmereUI"), already triaged out by the nightly that was running when it published. **No creator has posted anything unprocessed.**
  · Spot-verified the two same-day items the log's prose does not name inline, against the DATA files rather than the log (per the standing "trust the data over this log" note): Kalamazi `ReWs_ZnYtO8` → **3 live Warlock takes** in `creator-takes.json` (Destruction buff / Affliction nerf / Demonology mixed, all 08-03, none superseded); AutomaticJak `IJPVqbfI1w4` → present in the durable `skipped[]` lane (`verifiedAt` 2026-08-03). Both correctly closed out. Totals unchanged: **takes 308 (108 live), metaNotes 125.**
  · **The prose-seen-set trap caught this run too, exactly as the previous entry predicted** — a heuristic id regex over `log.md` reported **178 "unseen"** videos when the true number was **0**. The plain-substring scan the last entry recommends returned the right answer immediately. That is now the fourth run to pay for re-deriving triage decisions from prose: **the standing suggestion for a human — a persisted seen-set file, or letting `skipped[]` also carry a `triaged` reason — still stands**, and it is the single highest-value cleanup left in this skill.
  · yt-dlp not invoked (nothing to fetch) and neither installed nor upgraded; no transcript API called. No creator opinion touched any rating. · `npm test` 207 (194 pass / 13 skipped), build OK and byte-identical, manifest deliberately NOT rewritten (partial run), no snapshot (no data changed).

- 2026-08-04 (nightly CI, Opus 5; single-shot) · **25/25 feeds polled live, 25/25 HTTP 200 first attempt, no retries. 0 takes, 0 metaNotes, 0 superseded — because no transcript existed for anything new, and inventing one is the failure mode this skill exists to prevent.**
  · **Seen-set by plain substring scan** of `log.md` + `creator-takes.json` + `pending-transcripts.json` + `community.json`, exactly as the last three entries recommend. It reported 179 "unseen", of which **167 are the pre-pipeline backlog** (everything ≤2026-07-11, already triaged historically) and **12 are genuinely new** since the 08-03 nightly. The recommendation still stands for a human: a persisted seen-set file, or letting `skipped[]` carry a `triaged` reason, would make this exact.
  · `transcript-fetch/summary.json` verdict **`ok`, requested 0 / fetched 0** — correct: the queue was empty when the deterministic step ran (12:31:32Z), before any of these 12 were discovered. No transcript API and no YouTube fetch was attempted by this agent; the runner bot-wall decision is closed.
  · **QUEUED 5** (queue 0 → 5): MadSkillzzTV **`oocq_kuo-pk`** "12.1 TOP 3 Favorite & Strong Healers | *NEW* Main? | Midnight Season 2" (08-04, per-spec healer strength reads, squarely in his healer scope — the highest-value item in the queue); izen **`EqgjDKVwYow`** "12.1 PTR - Season 2 | Rumors & Chats on Popular Specs & Potential Meta Picks" (08-03 — **generalCreators, so `metaNotes[]` only**, never `takes[]`); YoDaTV **`15eTmWfKrLc`** "General Guide for Protection Paladin in 12.1! (Mythic+)" (08-03); MadSkillzzTV **`Li-b-g6sXIE`** "Holy Paladin Gearing for S2 & UI Setup" (08-03 — passes the keyword filter but smells like the gearing-PSA shape; queued deliberately so the outcome lands in the durable `skipped[]` lane instead of being re-triaged from prose every run); Whispyr **`VQnGFOstlgU`** "Atrophic is a Real Raid Buff (Sorry Zorthas)" (08-03 — ambiguous title with no patch keyword, but from a tracked Assassination theorycrafter, so queued to settle it rather than guess).
  · **TRIAGED OUT BY TITLE, not fetched (7):** Supatease `jXQ9wyt9VYM` + `8X_v98oi5k4` and YoDaTV `lWJ_0wxGn1s` (stream-session VOD titles, established pattern); Shadarek `BaoSEn7sJt4` "PTR Murder Row +15 | AoE Aldrachi Havoc DH" (key-run POV — standing precedent, cf. `K8PRMSVfkXI`); Dalaran Gaming `WILd2ljY8NQ` (5v5/1v1 PvP duels — **PvP out of scope for a PvE tracker**) and `IwBMIrhG9rw` (transmog preview); AutomaticJak `ArFPvXrU79Y` (title-grind stream / UI).
  · `skipped[]` unchanged at 8. **izen's `latest` advanced `OP49uzLmaDk` (08-01) → `EqgjDKVwYow` (08-03)** — a factual pointer to his newest upload per skill step 4b(c), explicitly *not* a claim the video has been distilled. yt-dlp not invoked; neither installed nor upgraded. **No creator opinion touched any rating.**

- 2026-08-04 (nightly CI, Opus 5; single-shot — **second run of the day**, 22:44Z) · **25/25 feeds polled live, 25/25 HTTP 200 first attempt, no retries. 0 takes, 0 metaNotes, 0 superseded — no transcript existed for anything new, and inventing one is the failure mode this skill exists to prevent.**
  · `transcript-fetch/summary.json` verdict **`ok`, requested 0 / fetched 0** — correct: the queue was empty when the deterministic step ran (22:44:29Z), because a local run had already drained the five videos the 12:31Z nightly queued (their takes/metaNotes are in `creator-takes.json`: 316 takes, 136 metaNotes). No transcript API and no YouTube fetch attempted by this agent.
  · Seen-set by **plain substring scan** of `log.md` + `creator-takes.json` + `pending-transcripts.json` (both lanes) + `community.json`: 181 "unseen", of which **15 are genuinely new** (all uploaded 2026-08-04) and the rest are the pre-pipeline backlog. The standing recommendation for a human — a persisted seen-set file, or `skipped[]` carrying a `triaged` reason — is now four entries old and still the highest-value cleanup in this skill.
  · **QUEUED 3** (queue 0 → 3): AutomaticJak **`SQyKJx6FEVA`** "Season 2 PTR RAID Healer Tier List" (08-04 — squarely in his healer scope, description credits six named healer streamers and links WCL reports; the highest-value item in the queue); Obli **`0D5cRjmmfqM`** "Rider Frost DK PUMPS! / Den of Nalorakk +15 / Midnight Season 2 PTR" (08-04); Shadarek **`e7V3tCBr6as`** "Havoc & Devourer DH | Season 2 Bonus Roll Information" (08-04 — gearing-PSA shape like the already-skipped izen `Kwugqa7HFao`; queued so the outcome lands durably in `skipped[]` instead of being re-triaged from prose).
  · **Deliberate deviation from the key-run precedent, flagged for review:** `0D5cRjmmfqM` is a +15 POV, which the standing precedent triages out (cf. `BaoSEn7sJt4`, `K8PRMSVfkXI`). It was queued anyway because its RSS **description is an explicit build breakdown** ("good footage to run through of Rider … Would you be happy if Rider became the meta for Frost DK?"), **Frost DK is one of the 9 specs still at `ptr: null`**, and Obli is its registered authority. If the transcript turns out to be silent key-running, `skipped[]` records that and the precedent stands unbroken.
  · **TRIAGED OUT (12), by title AND RSS description — description was decisive this run:** seven Supatease uploads the same day, five of them hashtag clip shorts whose `media:description` is a verbatim copy of the title ("Elemental Shaman GODLIKE", "Elemental Shaman UNREAL", "You HAVE To Play THIS", "What Other Class Can Do This?", "Rank 1 WORLD Multiclasser"), plus "Supatease Sax Vibes" (off-topic) and "Final PVP Data Analysis Season 1 Midnight" (**PvP out of scope for a PvE tracker**); Tettles `vwY2ZbIwFkE` (meme title naming a spec — description is just "Enjoy the stream", i.e. a VOD); Dalaran Gaming `rjQyrbKaYLQ` (12.1 UI/QoL) and `TKHXjOYABBE` (5v5/1v1 PvP duels); Critcake `IvYq9roNc9Y` (+24 key-run VOD); izen `v6ky1gYjQWU` (08-04 buff/debuff aura-tracking UI change — a systems video with **no per-spec season read**, so nothing for the `metaNotes` lane either). **Reading `media:description` from the feed costs nothing extra and settled five borderline titles without a transcript fetch — worth doing every run.**
  · `skipped[]` unchanged at 8. **izen's `latest` advanced `EqgjDKVwYow` (08-03) → `v6ky1gYjQWU` (08-04)** — a factual pointer to his newest upload per step 4b(c), explicitly *not* a claim it was distilled. Four registry creators still carry no `channelId` (Kyrasis, Gamz, Azortharion, Voulk) and so have no feed to poll. yt-dlp not invoked; neither installed nor upgraded. **No creator opinion touched any rating.**

## 2026-08-05 (nightly, 12:31Z)
- **All 25 unique feeds polled live, 25/25 HTTP 200 on the first attempt, no retries.** (Kyrasis, Gamz, Azortharion and Voulk still carry no `channelId` and so have no feed.) 375 entries scanned; genuinely new since the last run = **9** (seven dated 2026-08-05, plus Supatease `B9qKaeqYkPU` and Shindigg `BhXcWVF3NkQ`). yt-dlp not invoked; nothing installed or upgraded; no transcript API called by this agent.
- **`transcript-fetch/summary.json` verdict `ok`, requested 3 / fetched 3** — the deterministic step drained the whole queue, so all three of the last run's queued videos were distillable this run. **3 videos processed → 8 takes added, 1 superseded, 0 metaNotes, 1 durable skip.**
  · **AutomaticJak `SQyKJx6FEVA` "Season 2 PTR RAID Healer Tier List" (08-04) → 7 takes, one per healer spec.** The highest-value item the queue has produced. His placements: **Disc Priest top** (huge HPS *and* ~70k+ single-target damage, no penalty for double-stacking, great mana on Voidweaver — with Klanden's caveat that the play style is "press buttons on CD" and Oracle lags); **Preservation Evoker A** (Flameshaper/Dream Breath, good mana, UT reports >1M HPS inside Stasis); **Holy Paladin A** (the PTR's ~30% health-pool inflation makes Holy Light/LoH correctly weighted; huge on-demand output; Clarius flags tight mana and Virtue sniping); **Resto Shaman B**, the dark horse — good numbers but no comp reason to take it over a second Disc; **Holy Priest C** (mana-starved every single pull, Archon > Oracle, boring between cooldowns); **Mistweaver C** (Meg: caster spells do nothing, the 8% aura nerf was unneeded, would not bring a Monk competitively); **Resto Druid bottom** (consistently last even in the stacked-rot environment that should suit it; Viteman asks for HoT buffs and a 4-piece rework). All 7 tagged `bracket: "raid"`.
  · **These do NOT supersede his 2026-08-01 M+ healer tier list** — different lens (raid vs M+), so the guardrail says keep both live. All of his older raid-lens takes were already superseded.
  · **Obli `0D5cRjmmfqM` "Rider Frost DK PUMPS! / Den of Nalorakk +15" (08-04) → 1 take; the flagged deviation from the key-run precedent PAID OFF.** It is a POV run, but it carries a real build read: tier set "pretty nuts" (stacking Remorseless Winter → Icy Death Torrent, crit-first with haste/mastery equal behind it), Rider mobility fixes a long-standing Frost weakness, build space narrowed to Breath-or-Frostbane (he recommends Breath for consistency). His reservation is the hype — single target "hasn't been anything outstanding" despite DK-community talk that Frost beats Unholy — while he does expect Frost to be **king of low-target cleave**. Recorded `sentiment: "mixed"`, `bracket: "mplus"`, and it **supersedes his 2026-07-25 Frost take** (same M+/spec-comparison lens, directly updated). Frost DK is one of the 9 specs at `ptr: null`, so this feeds the projection only through `expertRead` — **no writeup was manufactured from it**.
  · **Shadarek `e7V3tCBr6as` "Havoc & Devourer DH | Season 2 Bonus Roll Information" (08-04) → `skipped[]`, as predicted.** Transcript verified: a bonus-roll/loot-strategy PSA (vault-vs-token math, which bosses to roll for Havoc vs Devourer, item-level tracks). Real detail, but **no spec strength, tuning or outlook read** — nothing for `takes[]`. Same shape as the already-skipped izen gearing PSA `Kwugqa7HFao`. `skipped[]` 8 → 9.
- **QUEUED 3** (queue 3 → 3 after the drain): Kalamazi **`x1iLDzjKVvI`** "12.1 Warlock SIMS Are Here! We May Need Help..." (08-05 — the highest-value item: Warlock is 3 of the 9 uncovered specs and the description links the raidbots reports); Shadarek **`XPhaAJiAyD8`** "Large Devourer Bug Found | Sims Fixed to Reflect!" (08-05 — a sim correction, in scope); LBNinja7 **`_5fnAi89SGw`** "Season 1 Will NOT Be Missed" (08-05 — a healer-creator season retrospective; queued rather than dropped because its lens is uncertain from the title, and `skipped[]` will settle it durably if it is purely a live-season vent).
- **TRIAGED OUT (6), by title AND `media:description`:** Shadarek `RbQj88QCbfs` (+15 King's Rest POV — description is a WCL link plus boilerplate guide links, no analysis promise, so the standing key-run precedent applies) and `Ggj-grcxaQg` (Heroes of Hammerwatch 2 stream — off-topic); Preheat `eoWuDTtY-50` (stream VOD, description is coaching links); Supatease `B9qKaeqYkPU` "Rank 1 WORLD Multiclasser" (hashtag clip short whose description is a verbatim copy of the title); Shindigg `BhXcWVF3NkQ` (stream VOD, description is a Twitch link); plus the 08-04 Supatease batch already triaged by the last run. **Reading `media:description` remains worth doing every run — it settled all six without a transcript fetch.**
- `latest` advanced on **AutomaticJak** (7 class entries) and **Obli**, both factual pointers to the video actually distilled. The standing recommendation for a human is now five entries old: the seen-set is still re-derived by substring scan over `log.md`, so 178 pre-pipeline entries read as "unseen" every run — a persisted seen-set file, or a `triaged` reason lane alongside `skipped[]`, remains the highest-value cleanup in this skill. **No creator opinion touched any rating.**

## 2026-08-05 (LOCAL run, Opus 5 — residential; scheduled 14:09Z catch-up after the 12:31Z nightly)
- **The queue drained to ZERO from a residential IP: 3 requested, 3 fetched, 3 dispositioned (2 distilled, 1 durable skip).** yt-dlp at the `requirements.txt` pin (2026.07.04), `player_client=android`, json3 auto-subs — no bot wall, no transcript API used. Queue **3 -> 0**, `skipped[]` **9 -> 11**.
- **Kalamazi `x1iLDzjKVvI` "12.1 Warlock SIMS Are Here!" (08-05, 16 min) -> 3 takes, all `bracket: "raid"`.** The single highest-value item outstanding, and it delivered: a per-spec single-target sim read for all three Warlock specs, credited to the Warlock Discord APL authors (Zerfall, Magnus, Matokco, Milan).
  · **Destruction `buff`** — highest-simming Warlock spec at ~222k Hellcaller / ~215k Diabolist, and he expects it to be the most-played Warlock spec in the raid. He is explicit that 222k is *not* high in absolute terms (he cites specs at 250-270k), so the case rests on the toolkit: Warlock as one of the best spread-cleave classes, and **five of seven tested Venomous Abyss bosses reading as Destro fights**.
  · **Demonology `mixed`** — post-nerf, Soul Harvester now sims ~7k ABOVE Diabolist in pure single target (~211k), but he still expects Diabolist to be played: his own five-target 60s comparison came out 765k vs 548k, and he reads the tier as a cleave meat grinder. Class-level verdict "exceptionally mid".
  · **Affliction `nerf`** — "it's not good". The 4% Haunt modifier buff was the right lever (Haunt scales every damage source, not just UA) but nowhere near enough: ~205-206k Soul Harvester / ~200k Hellcaller against a 250k+ field, which he calls a 20-30% gap and a disaster.
  · ⚠ **SUPERSEDE CARE — a raid-lens take must NOT retire an M+-lens one.** A first pass treated every prior Kalamazi Warlock take as same-lens (they carry no explicit `bracket`, so a naive `bracket ?? "both"` reads them as whole-spec) and wrongly retired three M+ reads plus, on the second correction, over-restored a *fourth*: **there are TWO Kalamazi Destruction takes dated 2026-08-01**, one "post-tuning raid/dummy testing" (raid) and one "Season 2 M+ outlook" (M+). Lens must be read from `patchContext` when `bracket` is absent, and a date is not a unique key. Final state is correct: each of the three Warlock specs now carries **one live M+-lens take and one live raid-lens take**; 4 takes superseded in total (the three 08-03 raid reads + the 08-01 raid/dummy Destruction read).
- **Shadarek `XPhaAJiAyD8` "Large Devourer Bug Found | Sims Fixed to Reflect!" (08-05, 10 min) -> 1 take, Devourer, `buff`, `bracket: "both"`.** Explains the long-standing sims-vs-live gap on Devourer: because many Devourer abilities are ports of Havoc ones, **haste was being applied to the GCD twice**, erasing the post-cast gap on Devour (1.25s with Improved Consume) and granting extra casts at high haste. Modelled with no other changes, Annihilator single target went **214k -> 245k** (15% behind Void-Scarred -> 10%), and with early APL work **~250k ST / 231k AoE**, cutting the dungeon-route gap to ~2/3. He concludes both Devourer builds now sim ahead of Havoc "in every way" and ahead of most specs. **Two caveats recorded in the claim rather than dropped:** he calls it a live game bug Blizzard should fix before the tier starts, so the strength is contingent; and it sharply raises haste's value up to a GCD-floor breakpoint. Supersedes his 2026-07-31 Devourer take (whole-spec lens).
  · **No Havoc take written**, though he says Devourer is ahead of Havoc "in every way" — that is a comparative aside in a Devourer video, not the in-depth Havoc analysis the spec-scoping rule requires. His 07-31 Havoc takes stay live and untouched.
  · Independent corroboration worth noting: today's nightly separately recorded **SimC Devourer 107,161 -> 118,379 (+10.5%)** on a new build — a different lane reaching the same direction. No data was linked between them.
- **LBNinja7 `_5fnAi89SGw` "Season 1 Will NOT Be Missed" (08-05, 22 min) -> `skipped[]`.** The last run queued it because the lens was uncertain from the title; the transcript settles it as predicted. It is a **Season 1 systems retrospective**: four raid instances diluting raid night, repair costs, the top-1% M+ mount as the season's best addition, the May mana-food nerf that also swapped which foods gave mana vs health, and reroll tokens removing the grind (which he blames for his own burnout). **No spec strength, tuning or outlook read anywhere**; his only PTR remark is that tuning is "a crapshoot right now", naming no spec. He is a healer specialist in `classes[].creators`, not a `generalCreators` entry, so the metaNotes lane is closed to him by validation regardless. 0 takes, 0 metaNotes.
- **RE-POLLED all 25 feeds live (25/25 HTTP 200, 0 failures) — the nightly's 12:31Z sweep is ~2h old and two videos landed after it.**
  · **Tettles `TU9yAvkkIJ4` "People Told Me Healing Was Hard, So I Proved Them Wrong" (14:00Z) -> transcript fetched and `skipped[]`.** A **155-minute** annual zero-to-hero project: a freshly levelled Holy Priest taken solo through LFG to the 3,400 bracket during a subathon. Keyword scan of the full transcript: **zero occurrences of "12.1", "Season 2", "PTR" or "tier list"**. The eight "tier set" hits are his own Season 1 gearing narrative, and he explicitly says he never noticed how good it was. His spec justification — Holy is the least represented healer in the top 2000 keys, so "quote unquote bad" makes it an interesting challenge — is representation framing, not an outlook call. 0 takes. Same disposition as his stream VOD `aqe2LKeMIqQ`. **Catching this locally is worth real money to the next nightly: it is a 155-minute transcript the queue would otherwise have spent a fetch on.**
  · **AutomaticJak `1WZkbTUSO-I` "Exploring Ragnarok Rebirth on Release!" (13:00Z) -> triaged out by title + `media:description`**, no transcript fetched: sponsored content for a different game entirely (download links, top-up page). Not added to `skipped[]` — that lane is for transcript-VERIFIED skips, and this needed no transcript.
- `latest` advanced on **Kalamazi** and **Shadarek**, both factual pointers to the videos actually distilled. **No creator opinion touched any rating**; the two Warlock/Devourer reads reach the projection only as `expertRead` aggregate input.
- **The 9 uncovered specs stay `ptr: null`** — three of them (Affliction / Demonology / Destruction Warlock) now carry fresh, detailed creator takes, and **no writeup was manufactured from them**, per the standing rule that a creator take is aggregate projection input and never a dated verdict.
- **Standing recommendation, now six entries old and unchanged:** the seen-set is still re-derived by substring scan over this log, so pre-pipeline entries read as "unseen" every run. A persisted seen-set file, or a `triaged` reason lane alongside `skipped[]`, remains the highest-value cleanup here.

## 2026-08-05 (nightly CI, Opus 5 — THIRD run of the day, 15:37Z; single-shot)
- **25/25 feeds polled live, HTTP 200 first attempt, no retries. 375 entries parsed, 120 published since 07-28. ZERO takes and ZERO metaNotes distilled — and that is the honest outcome, not a miss.** `transcript-fetch/summary.json` reads verdict **`ok`, requested 0 / fetched 0**: the 14:09Z local run had already drained the queue empty, and **every** new candidate below was uploaded *after* the deterministic transcript step ran at 15:36Z. This agent fetched no transcript itself and never touched YouTube or a transcript API.
- **QUEUED 3 for the next drain, all Supatease, all inside his registered scope:**
  · `02rLfzEKLq4` "Affliction Lock 12.1 Damage Test" (08-05 15:10Z) — Warlock/Affliction is in scope, and Affliction is one of the 9 specs at `ptr: null`.
  · `089Gp0xV7Iw` "Elemental Shaman UNREAL" and `aOSWljAYUnw` "Elemental Shaman GODLIKE" (08-04) — Shaman is class-wide for him; Elemental is also uncovered.
- **FLAGGED FOR A HUMAN — NOT queued, NOT attributed: Supatease has moved outside his registered scope.** In one three-minute window (08-05 15:09-15:12Z) he posted four "12.1 Damage Test" clips: Affliction (in scope, queued above) plus `3fW7j8Ssa0o` **Demonology Warlock**, `oNZJviGSxc0` **Destruction Warlock** and `DaLXBrvxpjY` **Devastation Evoker** — Evoker being a class he is not registered for at all. His `community.json` scope is Shaman class-wide, Warlock/**Affliction**, Warrior/Arms+Protection. **Two of those three specs are among the 9 uncovered**, which makes this exactly the moment the skill warns about: the temptation to stretch a scope is highest when the spec has nothing else. Per step 3 this is a note for a human to widen the scope, **never a silent override**. If the scope is widened, all three clips are still in the feed window and can be queued next run.
- **TRIAGED OUT BY TITLE + `media:description`, no transcript fetched** (not added to `skipped[]` — that lane is for transcript-VERIFIED skips): Supatease `SO6pJYPI7l0` ("Supatease Sax Vibes"), `NyfCoA2QhdE` ("Final PVP Data Analysis Season 1" — **PvP, out of scope for a PvE tracker**), `pSZn7QF7QAw` + `wpoMbE2MQ_k` (clickbait clip shorts whose `media:description` merely copies the title — the documented Supatease short shape, same as the already-triaged `B9qKaeqYkPU`); Tettles `nH-b1QYaS8w` (stream VOD, duplicate title of the already-seen `vwY2ZbIwFkE`); Dalaran Gaming `-bZHpvG9P38` (5v5 PvP duels).
- **No `latest` field advanced** — nothing was distilled to point one at, and `latest` is a factual pointer to processed content, not a freshness stamp. **No creator opinion touched any rating.**
- **Standing recommendation, now seven entries old and unchanged:** the seen-set is still re-derived by substring scan over this log, so pre-pipeline entries read as "unseen" every run. A persisted seen-set file, or a `triaged` reason lane alongside `skipped[]`, remains the highest-value cleanup here — this run again had to hand-separate "log-mentioned" from "durably seen" across 120 videos.

## 2026-08-06 (nightly CI, Opus 5 — single-shot)
- **25/25 feeds polled live, HTTP 200 first attempt, no retries; 375 entries parsed.** yt-dlp
  not invoked, installed or upgraded; no transcript API and no YouTube page fetched by this
  agent. (Kyrasis, Gamz, Azortharion and Voulk still carry no `channelId`, so they have no
  feed to poll.)
- **`transcript-fetch/summary.json` verdict `ok`, requested 3 / fetched 3 — the whole queue
  drained. 3 videos processed → 0 takes, 0 metaNotes, 0 superseded, 3 durable skips
  (`skipped[]` 11 → 14).** All three queued Supatease items turned out to be clip shorts
  with no analytical content, and the transcripts say so unambiguously:
  · `02rLfzEKLq4` "Affliction Lock 12.1 Damage Test" — **7 caption chunks, ~20 s**. One
    dummy opener narrated (dots, Haunt, Malevolence, Dark Glare, Soul Harvest) and a closing
    *"that does not come close to taking him down, but it is what it is"*. **No number, no
    comparison, no tuning or outlook read.**
  · `089Gp0xV7Iw` "Elemental Shaman UNREAL" — **ONE chunk: "Boom. Shaga laga baby."**
  · `aOSWljAYUnw` "Elemental Shaman GODLIKE" — 5 chunks of loading-in reaction ("this guy's
    going to get zapped", "what is this? 2500").
  **Affliction and Elemental are both among the 9 specs at `ptr: null`**, which is exactly
  when over-reading a 20-second clip is most tempting. Nothing was written; the durable
  `skipped[]` lane now stops all three from being re-queued.
- **QUEUED 2** (queue 3 → 2):
  · **Shadarek `MdvcFzV0tmI`** "Season 2 Embellishment Tuning & Demon Hunter new BiS"
    (08-06 04:32Z) — description links the Wowhead embellishment-tuning post; the "new BiS"
    half may carry a DH itemisation read. Queued rather than triaged so the outcome lands
    durably either way.
  · **YoDaTV `duIjLdAU3HQ`** "General Guide for Vengeance DH in 12.1! (Mythic+)"
    (08-05 16:00Z) — squarely inside his registered Vengeance scope, and his 12.1 Prot
    Paladin guide of exactly this shape (`15eTmWfKrLc`) produced a take, so the format is
    proven productive.
- **TRIAGED OUT by title + `media:description`, no transcript fetched (5)** — not added to
  `skipped[]`, which is for transcript-VERIFIED skips: Supatease `mTV27AX1oIU` ("Rank 1
  WORLD Multiclasser MAIN TIME" — description copies the title, the documented Supatease
  short shape) and `7d4FVxcHwY8` ("MM Hunter 12.1 PVP Looks Insane" — **PvP, out of scope
  for a PvE tracker**, and MM Hunter is outside his registered scope anyway); YoDaTV
  `KVbS_yWPUDY` ("yodatv on twitch", stream VOD); Dalaran Gaming `0tnlu2XgYts` (5v5/1v1 PvP
  duels) and `AlPW1VTafMg` (Season 1 rewards PSA, no spec read).
- **The Supatease out-of-scope flag from the 08-05 run is still open for a human** and this
  run adds to it: `3fW7j8Ssa0o` (Demonology), `oNZJviGSxc0` (Destruction), `DaLXBrvxpjY`
  (Devastation Evoker) and now `7d4FVxcHwY8` (MM Hunter) are all outside his registered
  scope (Shaman class-wide, Warlock/**Affliction**, Warrior/Arms+Protection). Given the
  three transcripts read this run, the shape is now clearer: these are **seconds-long clip
  shorts**, so widening his scope would likely buy little — worth weighing before anyone
  edits the registry.
- **No `latest` field advanced** — nothing was distilled to point one at, and `latest` is a
  pointer to processed content, not a freshness stamp. **No creator opinion touched any
  rating.**
- **Standing recommendation, now eight entries old:** the seen-set is still re-derived by
  substring scan over this log (171 of 375 entries read as "unseen", nearly all pre-pipeline
  backlog). A persisted seen-set file, or a `triaged` reason lane alongside `skipped[]`,
  remains the highest-value cleanup in this skill.

## 2026-08-06 (LOCAL run, Opus 5 — scheduled residential catch-up, ~14:3xZ)
- **The queue is the reason this run exists, and it is now EMPTY: 2 → 0.** Both videos the
  12:49Z nightly queued were fetched with yt-dlp from this residential IP and read in full.
  No discovery pass — the nightly polled all 25 feeds 25/25 HTTP 200 ~2h earlier, and the
  residential-only scope says verify rather than re-poll.
- ⚠ **yt-dlp transport note:** `MdvcFzV0tmI` failed the first attempt with **HTTP 429 Too
  Many Requests** on the subtitle download (the video info fetch succeeded — only the
  caption request was throttled). It landed clean on a retry moments later **without** the
  `youtube:player_client=android` extractor-arg. 429 here is transient throttling, not the
  datacenter bot-wall; retry before queueing anything back.
- **1 take added.** `duIjLdAU3HQ` — YoDaTV, *"General Guide for Vengeance DH in 12.1!
  (Mythic+)"*, published 2026-08-05, 9 min. In scope: his Demon Hunter entry is scoped to
  `["Vengeance"]` and the video is wholly Vengeance. Distilled as **mixed**, `bracket:
  mplus` — he opens by calling the spec "looking really strong going into next season" on
  damage plus its raid buff, then explicitly **declines to call it the meta tank because
  its defensives are RNG-dependent**, which is both halves of a genuinely two-sided read
  and the reason it is not filed as a buff. Also captured: Annihilator recommended over
  Aldrachi (near-equal defensively, damage decides it), the Voidfall Spirit-Bomb-into-Soul-
  Cleave **six-meteor bug** the current rotation leans on, and his warning that the
  Sigil-of-Flame tier set makes trash gathering awkward.
  **Superseded** his 2026-08-01 Vengeance take (same creator, same spec, same M+ lens —
  a tier-list update the guide replaces). Same-lens rule honoured; no raid take touched.
- **1 verified-skip → `skipped[]` (durable lane).** `MdvcFzV0tmI` — Shadarek, *"Season 2
  Embellishment Tuning & Demon Hunter new BiS"*, 8 min, transcript read end to end. It is
  an **embellishment/itemization** video, not a spec read: the four new S2 crafted
  embellishments and the tuning pass that gutted them (Polished Amalgamate and Snakeskin
  Lining >90%, Adorned Fang 70% with a compensating proc-rate bump, the new versatility
  potion 52%), then BiS ranking for Havoc (unnerfed Hunter's Ritual Stone ~2% DPS) and
  Devourer (double Adorned Fang; the crafted offhand costs 69 intellect). **His negative
  sentiment is aimed at the embellishment tuning itself, never at Havoc or Devourer** —
  there is no spec-strength, spec-tuning or S2 outlook claim in it. Writing a nerf take for
  either spec from a crafted-gear nerf that lands on every spec equally would invent a read
  the video does not make. 0 takes, 0 metaNotes.
- **0 metaNotes** — neither creator is a `generalCreators` entry, so the firewall was never
  in play this run.
- `latest` refreshed on both entries (YoDaTV/Demon Hunter, Shadarek). `npm test` 332 pass /
  0 fail; build OK; snapshot written then rebuilt.

## 2026-08-07 — nightly CI (headless)

- **25/25 feeds polled live**, all HTTP 200 first attempt, 375 entries scanned. No yt-dlp
  invocation, no transcript API call, no YouTube page fetch by this agent.
- **`transcript-fetch/summary.json` verdict `ok`, requested 0 / fetched 0** — the queue was
  already empty, because the local run that followed the 08-06 nightly drained and
  distilled both videos that night had queued. So **0 takes, 0 metaNotes, 0 superseded,
  0 new durable skips**: there was nothing to distil, which is a real outcome, not a miss.
- **Queued 3 (queue 0 → 3)** for the next deterministic fetch:
  · `uGLPbkECmko` — YoDaTV, *"General Guide for Guardian Druid in 12.1! (Mythic+)"* (08-06).
    Squarely inside his registered `["Guardian"]` Druid scope, same shape as the Vengeance
    guide that yielded a take, **and Guardian Druid is one of the 9 specs with no writeup.**
  · `g0adl6lXPQM` — izen, *"Season 2 - 12.1 PTR | 2nd Chat on Rumors of Meta Picks &
    Popular Specs in S2"* (08-06) — the `metaNotes[]` lane, general-creator firewall intact.
  · `rX3X-I_4lCA` — AutomaticJak, *"Atonement Has A Problem"* (08-06, with Clandon of
    WarcraftPriests). Discipline is in his registered scope and the 12.1 notes move
    Atonement to 32% of damage done, so the timing is not coincidental.
- **FOR A HUMAN — scope question, deliberately not resolved here:** Obli published
  `gIgTCFhLyig` *"BLOOD DK is META next season?"* (08-06), an interview with Awootank that
  is a substantive Blood DK read. **Obli's registered specs are `["Frost","Unholy"]`**, so
  per the skill this run did not stretch his scope and did not queue it. Widening his
  `community.json` `specs` is an owner call; note that Reholy and YoDaTV already cover Blood.
- **Triaged out by title + `media:description`, no fetch:** PvP content (Supatease
  `XC-87cBXOD8`, the Dalaran Gaming 5v5/1v1 duel series), stream VODs (YoDaTV "yodatv on
  twitch" ×3, Shindigg, Critcake, Preheat), clip shorts (Supatease ×3, MadSkillzzTV
  `zoIliTYkpZc`), PTR key-run footage whose description is a bare twitch plug (YoDaTV ×4,
  Shadarek), and gearing/UI/PSA videos (MadSkillzzTV `Ca4eDpIlNDM`, Dalaran Gaming
  `W2nQ41jDxNI`). The three Supatease "12.1 Damage Test" clips (Demo/Destro/Dev Evoker) are
  both **outside his registered scope** (`["Affliction"]` for Warlock; he has no Evoker
  entry) and the same 5-to-7-chunk short shape already verified-skipped for Affliction.
- `latest` fields untouched — nothing was distilled to point one at.
- **No creator opinion touched any rating.** `npm test` 332 pass / 0 fail, build OK.

## 2026-08-07 (LOCAL run, Opus 5 — scheduled residential catch-up, ~15:0xZ)

- **Queue drained 3 → 0.** All three videos the nightly queued were fetched with the pinned
  yt-dlp (2026.07.04, `player_client=android`, json3 auto-subs), flattened preserving
  `tStartMs`, and distilled. No discovery pass was run — CI polled all 25 feeds this morning
  and re-polling would regenerate its work.
- **3 takes added, 3 superseded** (same creator + same spec + same lens in every case):
  · **Druid Guardian — YoDaTV** (`uGLPbkECmko`, bracket mplus, `mixed`). His S2 bear guide:
    tankiest tank with real utility, but damage a little low especially in the M+ build, which
    is why he does not call it the meta tank. Supersedes his 08-01 M+ tier-list take.
  · **Priest Discipline — AutomaticJak ×2** (`rX3X-I_4lCA`, with Clandon of WarcraftPriests).
    Deliberately split by lens, because the video's read genuinely splits: **raid `mixed`**
    (one of the strongest healers doing absurd damage, but atonement scaling falls off a cliff
    past five targets so high counts buy coverage not throughput) and **mplus `nerf`** (his own
    Voidweaver key testing feels awful; always-maxed output means no lever left once key level
    outruns gear). Supersede the 08-04 raid take and the 08-01 M+ take respectively — the
    same-lens rule kept them from cross-retiring each other.
- **21 metaNotes added for izen, 19 superseded** (generalCreators firewall intact — 0 takes
  attributed to him). His "2nd Chat on Rumors" is a full meta rundown: the death of
  Augmentation and the fall of Mistweaver as the two headline calls, Holy Paladin and Resto
  Shaman inheriting the healer slots, Outlaw legitimised by buffs, and the caster/melee comp
  picture. Five carry the raid lens on explicitly raid-specific sentences; the rest are M+.
- **A read-only verification pass over every new entry caught four real defects, all fixed
  before commit.** Recording them because each is a repeatable failure mode:
  · **A number attached to the wrong referent.** Clandon's "still triple every other healer,
    four times every other healer" describes the **halved 38-40k hypothetical**, not the
    measured 78-80k. The first distillation bolted it onto the measured figure — which also
    *understated* the real gap by half while sounding like a quote.
  · **An inverted causal clause.** izen says you took Mistweaver for its damage debuff and,
    with Enhancement too weak to be played, never got mastery/Windfury *at all*; the note had
    it as "had to accept a weak Enhancement to make it work", destroying the logic. The
    mislabel "magic debuff" had also bled in from an unrelated Vengeance line 8 minutes earlier.
  · **ASR pseudo-names and mangled samples.** "Ullhon" (from ASR "ulon") was written as if it
    were a name — removed in favour of "the Renewing Mist caster build", which is how izen
    names it himself two clauses later. "80 healers in these top 10" had become "the top 80
    M+ healer logs", which describes a different sample.
  · **A clause imported from a DIFFERENT video.** "Void Blast cannot be cast while moving"
    is not in this transcript at all — it came from the 08-04 AutomaticJak entry. True or not,
    a take must rest on the source it deep-links, so it was replaced with this video's own
    movement discussion.
- **3 proposed metaNotes DROPPED as inflated list-mentions** — Death Knight Frost, Beast
  Mastery Hunter, Fury Warrior. Each rested solely on membership in one list ("like BM, like
  Fury, like Devastation, like subtlety"), and **Frost is never even named** — the only
  reference is "both of the DK specs". Two of the three would have flipped a substantive prior
  read (Frost 07-14 positive → neutral; BM 07-06 positive → negative) on the thinnest possible
  evidence, which is the weakest-evidence-steers inversion the project rejects elsewhere. Both
  predecessors were **restored to live**. The retention line held evenly: every kept
  bubble-clump note has a second spec-specific mention (Havoc t=648, Unholy t=666/892,
  Subtlety t=777).
- **Devourer's sentiment was corrected `mixed` → `positive`** — izen names zero downsides for
  it and treats it as a caster-comp anchor; "perhaps a bit less [of a lock than Arcane]" is a
  remark about how settled the pick is, not a knock on the spec.
- **FOR A HUMAN, two small things.** (a) The guest is "Clandon" in today's entries but
  "Klanden" in the 08-04 one (ASR gives "Clanton"/"Clanin"); worth normalising. (b) izen's
  08-03 Elemental/Balance read was the more differentiated "nominally 50/50 but really more
  like 80/20 in Balance' favour"; this video restates a flat 50/50, so superseding is faithful
  to what he just said but the tracker now shows an even coin flip where his last reasoned
  lean was Balance.
- `latest` refreshed on YoDaTV/Druid, AutomaticJak/Priest and the izen generalCreators entry.
- **No creator opinion touched any rating.** `npm test` 332 pass / 0 fail, build OK, snapshot
  written then rebuilt.

## 2026-08-07 — targeted sweep: tank + healer RAID takes (local run)

**Why:** projection work found healer 7/7 and tank 6/6 raid cells sitting at 100% of the
12.0.7 prior, with the expert lane the only 12.1-aware input available to them. Riley
asked for coverage first, then a quorum change. This run went looking specifically for
**raid-scoped** tank/healer takes.

**Discovery:** RSS polled for the 14 transcribable creators whose scope covers a tank or
healer spec (Reholy, YoDaTV, Shadarek, Tettles, LBNinja7, Dalaran Gaming, MadSkillzzTV,
AutomaticJak, Kesslive, Pkpawner, Clandon, Supatease, Critcake, Baze — Kyrasis, Gamz and
Voulk still carry no `channelId`). 37 unseen titles passed a deliberately loose keyword
filter; almost all were 12.0.7-era gameplay POVs. Genuinely 12.1/Season-2 and tank/healer:
four YoDaTV videos (San'layn Blood DK ×2, Bear Druid ×2) — every one a **+19/+20 key run**,
i.e. M+, which is the bracket already over-represented in `takes[]`.

**Transcript-verified:** `FCv62odOpew` (YoDaTV, King's Rest +20, San'layn Blood DK, S2 PTR).
2,244 words, 369 caption events. Ten lines carry analytical vocabulary and the single
"raid" cluster (~760–1000s) is the creator answering chat about whether **raid buffs**
belong in Mythic+ comp design — a game-design opinion, not a read on Blood DK. No
sentiment, no comparison, no 12.1 outlook for the spec. Moved to `skipped[]` with that
reason rather than distilled: writing a raid-scoped Blood DK take out of it would have
manufactured exactly the signal this run went looking for, which is the failure mode the
procedure warns about hardest when a spec is uncovered.

**Takes added: 0. metaNotes added: 0. Skipped lane: 15 → 16.**

**Finding for the next run:** the tank/healer raid gap is NOT a distillation backlog. The
creators we track are not publishing 12.1 raid analysis for these roles right now — during
PTR they are running keys. All six tanks together hold 8 takes, none raid-scoped. If raid
coverage matters before launch, it needs either new creators who cover tank/healer raid,
or waiting for raid-testing content once 12.1 ships.

## 2026-08-07 — creator DISCOVERY sweep (75-agent orchestrated search) + scope audit

**Ask (Riley):** wide search for trusted creators across all specs, starting from the lead
that Maximum (Liquid) posts a pre-season tier-set/class roundup. Plus: audit existing
entries for the same two defects found on Kalamazi and Publik.

**Maximum — confirmed.** "Major Changes Are Coming in 12.1! - Reacting to Blue Post Changes"
(2026-06-23, `plBDfk0wE-Y`): Tuning Changes, then 12 of 13 classes individually (Warrior
absent), then Tier sets and Tier set bonuses. No settled pre-Season-2 tier list yet as of
his 2026-08-04 upload — **re-check 2026-08-08..18**. Added to `generalCreators` (class-level
claims, not spec-level). Liquid publishes no written class guides (verified 3 ways).

**Scope audit — both original findings were partly WRONG, and checking mattered:**
- **Publik** has no `transcribable:false` flag and is already scoped `["Shadow"]`. Nothing
  to fix. The valid half — he is a single point of failure on Shadow — is addressed by
  adding Elli and Jaerv as written sources.
- **Kalamazi** genuinely covers all three Warlock specs (live takes on each, newest video
  reads all three). Scoping him to his Affliction byline would have DELETED real Demo and
  Destro coverage. Left unscoped deliberately.
- 8 entries genuinely were over-broad and are now scoped from live RSS + take history:
  Tettles/Gamz -> Balance, Shadarek -> Havoc+Devourer, Kesslive -> Devastation+Augmentation,
  Voulk -> Preservation, Pkpawner -> Windwalker+Mistweaver, Critcake/Baze -> Arms+Fury.

**Added:** 8 transcribable (J-Funk WW, Sha BrM, Megasett MW, NeekapHere Ret, Tactyks PPal,
Sam FDK, leak SV, Musguete Outlaw+Assa), 7 reference-only (Elli, Jaerv, Sjeletyven, Jensen,
Taeznak, Mandl, Hype), Maximum to generalCreators. 50 -> 65 creators.

**Tactyks carries a conflict note: RAID SCOPE ONLY.** He authors the Method M+ tier list
already registered in `sources.json`; logging his M+ takes would double-count him into both
the consensus and the expert lane.

**Rejected, do not re-research:** Samiccus and Geezax both recap Icy Veins/Wowhead/Archon on
screen (double-counting our own sources into the meta nudge); Salty Clams has no caption
track on any video, so the transcript pipeline can never return anything. The verifier stage
also caught FOUR fabricated or wrong video ids in the discovery output — evidence that the
adversarial pass is load-bearing, not decoration.

**Structural finding:** almost nothing found is a 12.1 source. Every Method, Maxroll, Icy
Veins and Wowhead guide checked reads 12.0.7; only ~14 of ~45 confirmed candidates carry a
dated 12.1-era read. Most additions are "who to read" links that become useful when 12.1
guides land. Wowhead's `/ptr/guides/classes/` tree was NOT byline-swept — obvious next stop.

**Blocked:** the Maxroll-byline candidates (Wolfdisco, Xerwo, Soda, Miniaug, fraggo, revves,
Nicememes) cannot be added — `maxroll.gg` is not in `CREATOR_HOSTS` in validate.mjs, and
widening that list is a reviewed code edit by design.

**Still thin after all this (1 video creator):** Vengeance DH, Feral Druid, Devastation
Evoker, Shadow Priest, Subtlety Rogue, Demonology and Destruction Warlock. Feral and
Vengeance are NEW to that list — the scoping revealed they were only ever covered by
phantom whole-class entries. That is a truer number, not a regression.

## 2026-08-08 — Maximum panel-guest sweep (Riley supplied four video URLs)

**Source:** four Maximum "rank every spec w/ The WoW Community" panels — `v7g8zUPBk9M`
(Midnight spec tier list, 2026-02-22, 4h44m), `GJLB85qs1Fo` (Midnight all class changes,
2025-10-17), `rvjPMLDDRWk` (11.2 every spec, 2025-08-10, 5h39m), `y0yxBZd7aEI` (11.1 tier
list, 2025-02-24).

**Why these are unusually good sources:** the descriptions credit every guest with a link,
AND the chapter markers name which spec each guest was brought on to rank — 40 guest links
and 82 chapter attributions. Maximum invites the recognised authority per spec, so the
chapter line IS the scoping evidence. Extraction is deterministic (yt-dlp `--print
"%(description)s"`, parse the link block and the `HH:MM Topic w/ Guest` lines); no
transcript fetch was needed for any of it.

**Independent confirmation of 2026-08-07's scoping decisions** — worth recording because
it validates judgement calls made without this data:
- **Kalamazi is "Warlock" in all four panels**, never a single spec. Confirms leaving his
  entry unscoped was right and that narrowing him to his Affliction byline would have been
  a mistake.
- Megasett -> Mistweaver (3 panels), J-Funk -> Windwalker (2), Taeznak -> Death Knight (3),
  Shadarek -> Havoc, VooDooSaurus -> Devourer, Tettles -> Balance (3) + Augmentation in
  11.1. Every one matches the scope written yesterday.

**Added (verified live, channelIds resolved against the RSS endpoint with author match):**
Dorki (whole-role tank — one entry per tank class, 6 total), Bansherz (all 3 Hunter specs,
daily uploads, already on 12.1), Jedith (Havoc + Devourer), Hopeful (Arcane + Frost; Fire
EXCLUDED, its only evidence is 11.2-era), Psybear (Feral — first transcribable Feral voice).
Reference-only: HawkCorrigan (Ele; 237 SimC commits to 2026-08-06), ForeverGuy a.k.a.
Wowhead's "JustGuy" (Outlaw), Porom (Arcane), YouTee (Pres), Jdotb (Resto Druid),
Sanghelios (Dev/Aug). generalCreators: Zorthas, plus Dratnos.

**Two registry defects found and fixed:**
- **Porom was cited as the Arcane 12.1 writeup source in specs.json but had no
  community.json entry at all.** A writeup attributed to a creator the registry did not know.
- **Voulk had no `channelId`**, so RSS discovery silently skipped him despite him being
  transcribable. QuestionablyEpic (`UCU9wT3isnq82muSbxmyNM0g`) is his channel — his own
  credential says "creator of QE Live". Verified live and added.

**Dratnos** was filed only under Warrior scoped Arms/Fury, but his credential says "general
M+", his newest video covers Mages and Blood DK, and the 11.2 panel lists him on TANKS. Now
also a generalCreator; the Warrior entry stays, because the two lanes feed different
surfaces (per-spec `takes[]` vs cross-class `metaNotes[]`).

**Skip — do not re-research:** PiTyy (one panel not two; no YouTube; 51 followers), Goop (no
YouTube exists), Atlas (Maximum himself replaced him with Taeznak in later panels), Rook
(the published link is a 107k-member server invite naming no individual), MissMarvel
(dormant since 2025-12), **Touchpadwarrior — premise failed outright: nothing ties him to
Arms or any spec, "warrior" refers to the touchpad, and 15/15 uploads are comedy Shorts.**

**Honest outcome:** thin specs went 7 -> 5, and the TANK GAP DOES NOT CLOSE. Dorki is the
only tank candidate that exists, he is genuinely the role authority, but he has published
nothing on 12.1 and his newest upload is 2026-05-23 — so six tank specs gained a feed that
may produce zero takes this cycle. Still at one video creator: Devastation Evoker, Shadow
Priest, Subtlety Rogue, Demonology and Destruction Warlock — Maximum's panels do not cover
those, so they need a different discovery route.

## 2026-08-08 (LOCAL run, Opus 5 — scheduled residential catch-up, ~03:3xZ / 20:3x PDT 08-07)

- **Scope: creator lane only.** This run fired ~12.5h after the 08-07 local catch-up (15:0xZ)
  and ~16h after the 11:31Z nightly, so nothing in the tier/metric layer had aged: every WCL
  cut, tier list and metric series was already stamped 2026-08-07, i.e. the local calendar
  day. Nothing was re-fetched or regenerated — see the ptr-watch log for the same reasoning.
- **74 pollable channels swept** (all `transcribable` creators with a `channelId`, spec lane +
  generalCreators, deduped by channel). Zero feed errors, no 404 burst. Queue was **0 before
  and 0 after** — nothing was waiting; every video below was fetched locally with yt-dlp
  (pinned 2026.07.04, not upgraded).
- **47 videos published since the last run's window; 5 transcribed, 3 distilled, 2
  verified-skipped.** The other 42 were title-filtered: dungeon/boss guides (Tactyks, Sha,
  J-Funk), key-run and stream VODs (Bansherz, Supatease, Shindigg, YoDaTV, Critcake), PvP duel
  series (Dalaran Gaming), UI/addon and gearing content, and Tettles' encounter-designer
  interview.
- **Takes added (3):**
  · **Sha → Brewmaster, `nerf`, bracket `mplus`** (`LuD55m-cypE`, 2026-08-06). His review of the
    official 12.1 notes as the final word. Celestial Brew/Infusion absorb +50% / cooldown +100%
    breaks the Apex "Bring Me Another" loop; the tier set measures 10% (4pc) vs 1% (2pc) of his
    damage over a 4-minute test and its 4pc damage needs mobs standing in a small ground patch
    that keys do not provide; Vivify left at ~2% of his health bar after the +25% health change.
    Verdict: defensively fine on PTR 18s/19s, but low damage and brings little — swap tanks if
    on the fence; viable specifically as physical-comp filler.
    **This is the FIRST non-YoDaTV Brewmaster voice** — the spec went 1 → 2 creators.
  · **VooDooSaurus → Devourer, `mixed`, bracket `both`** (`JBpc1cPXWWg`, 2026-08-07). The
    haste/GCD double-apply bug present since Devourer's alpha is now modelled in the sims:
    Void Scourge ~275k single target, "insanely busted", still a Void Scourge raid season.
    `mixed` is deliberate and is the whole point of the take — he has REPORTED the bug and
    expects it fixed or aura-nerfed, so a `buff` would forecast strength his own source says
    is likely to be removed. Corroborates Shadarek's 08-05 take on the same bug (kept live,
    different creator).
  · **VooDooSaurus → Havoc, `buff`, bracket `both`** (same video, t=576). Aldrachi is the raid
    build with a genuinely good single-target number; funnel is the niche (11% single target,
    14-15% at 5-8 targets) and should suit this season's dungeons; raw AoE clearly behind
    Devourer. Second Havoc creator alongside Shadarek.
- **metaNotes added (2), both izen, both raid-lens** (`_joFJoQl8Ec`, 2026-08-07) — his review of
  the community "Dummy Dome" raid-healing dummy test:
  · **Mistweaver `negative`** — genuinely bottom; mastery buffed then reverted, 3% then 7% aura
    nerfs, S1 set worth ~15% healing replaced by an S2 set worth 6-7. He supplies the asterisk
    that the tested Monk was ~329 ilvl with no gems and missing enchants (worth 10-15%) and is
    explicit it would not close the gap.
  · **Restoration Druid `mixed`** — an explicit walk-back, and the reason it is `mixed` not
    `negative`: the Druid result was largely artefact (325 ilvl start, deliberately no tier set
    from a conviction the set was bad, Rampant Growth skipped — worth ~50% more per Regrowth —
    and a Season 1 Rejuvenation-heavy rotation at ~10 Regrowth CPM where he wants 25+). "Nowhere
    near as weak as this is being pointed out", though it may still need some buff.
  This **flips his stored Resto Druid raid read from `negative` (07-26) to `mixed`.**
- **Verified-skipped (2), both durable in `skipped[]`:** Kalamazi's Affliction guide
  (`smX1F93s8hI`) and leak's Survival guide (`EJq1vFBp1WE`). Both are full how-to guides —
  talents, rotations, stat weights, hero-tree choice — with no read on where the spec lands
  against others. **Deliberately NOT logged as `neutral` takes:** `expertRead` abstains on
  neutral but still counts the creator in the panel denominator, so a neutral take would
  assert a directional view they never expressed AND dilute the specs' real reads. leak's
  numbers (S2 set ~11% ST / ~19% AoE, Sentinel 2-3% ahead) are within-spec build choices;
  reading "new set beats old set" as a spec buff would fire for every spec with a guide video.
- **Supersede pass:** 3 retired, all same creator + same spec + same lens — VooDooSaurus'
  2026-07-21 Devourer take, izen's 2026-08-06 Mistweaver **raid** note (his 08-06 **M+** note
  stays live — different lens, complementary), and izen's 2026-07-26 Resto Druid raid note.
- **Scope discipline held in two places worth recording:** Sha talks warmly about BDK and Prot
  Warrior looking strong next season, but his entry is scoped `["Brewmaster"]`, so neither was
  attributed. VooDooSaurus names Shadarek, Azortharion and Sailor as sim collaborators — credit,
  not authorship, so no takes were attributed to them.
- **Forecast impact measured before pushing: 0 letters moved anywhere.** Three score shifts
  only — Havoc raid 69→71 and M+ 65→66 (Shadarek+VooDoo now 2 unanimous creators, so shrinkage
  eases), Brewmaster M+ 37→36 (YoDaTV neutral + Sha nerf). Devourer did not move at all, which
  is `mixed` abstaining exactly as designed.
- ⚠ **The two metaNotes are display-only and cannot move a number — by design, not by
  accident.** The meta nudge is v6-gated on **≥2 creators, unanimous**, and every one of the
  159 metaNotes on file is izen's, so the nudge has never fired and did not fire here. Zorthas,
  Maximum and Dratnos are registered generalCreators but have produced no metaNotes yet; the
  lane stays inert until one of them publishes per-spec season reads. Worth knowing before
  anyone reads a healer note and expects the forecast to answer it.

## 2026-08-08 (LOCAL run, Opus 5 — scheduled catch-up, ~04:2xZ / 21:2x PDT 08-07) — FIRST unfiltered date-bounded sweep

- **Scope: creator lane only**, same reasoning as the run 45 minutes earlier — every tier list,
  metric series and WCL cut is stamped 2026-08-07 (the current local calendar date), so nothing
  in the tier/metric layer could have aged and nothing was re-fetched. The manifest was
  deliberately NOT touched (partial-run rule).
- **This is the first run under the 2026-08-08 no-title-filter policy** (commits 31f5306 /
  c9db25a, landed ~20 minutes before this run, so the previous creator lane never exercised it).
  42 unique channels polled (74 creator entries deduped), zero feed errors, 630 videos in feed.
  Seen-set 142 → **544 unseen, 325 of them on/after the 2026-06-18 cycle bound.** The bound did
  its job: 219 videos were dropped as pre-cycle without a fetch.
- **325 is larger than the ~253 the policy anticipated**, so the sweep was tightened the way the
  skill prescribes — **newest-first**, cutting at 2026-08-04 (the post-patch-notes window) = 72
  videos. **61 transcripts fetched with yt-dlp** (pinned 2026.07.04, not upgraded; no bot wall;
  queue 0 before and 0 after — nothing was handed to Supadata, per fetch-broadly/queue-narrowly).
  11 had no transcript: 5 genuinely have no auto-captions yet, 4 are Twitch-restream placeholders
  ("yodatv on twitch"), 1 was mid-premiere, 1 is SME-blocked.
- **Takes added (7), from 4 videos:**
  · **J-Funk → Windwalker, `buff`, TWO bracket-scoped takes** (`nnvlZIENi84`, 2026-08-04) — a
    dedicated "should you play Windwalker in 12.1" overview. RAID (t=67): an underdog, fine but
    not exceptional in testing until a late undocumented hotfix buffed Spinning Crane Kick ~40%,
    which makes two-target damage substantial — weak on early spread cleave, strong later (he
    calls it flat-out overpowered on Twin Fangs), so "a pretty decent option". M+ (t=121): much
    stronger — first relevance since Shadowlands S3, possibly the highest AoE burst in the game,
    slightly better survivability, single target "a little suspect" but playable around. **This
    is the first J-Funk take on file**, and Windwalker went 1 → 2 creators.
  · **Musguete → Outlaw and Assassination, both `buff`, both `mplus`** (`HDqRItIXGmE`,
    2026-08-04) — PTR M+ log review after the Rogue buffs. Outlaw ~550k overall on the first
    page and "S tier in a physical comp" if unnerfed, with RNG/jackpot dependence as the honest
    limit; Assassination took the largest buff (~16% overall), >1M burst with sustain that keeps
    ramping, and is the spec he would currently pick. He expects both to be nerfed. He supplies
    his own caveats — WCL's own "testing data is not live data" warning, and a walkthrough of how
    pull count (7 vs 11 vs 15) drives the overalls he is quoting. **Subtlety was NOT attributed**
    — he analyses it at length and rates it behind the other two, but his entry is scoped
    Outlaw/Assassination. Flagged below for a human scope decision.
  · **Obli → Frost and Unholy, both `nerf`, both `mplus`** (`gIgTCFhLyig`, 2026-08-06) — a Blood
    DK discussion, but the in-scope content is his read on what Blood's strength does to the DPS
    specs: Blood brings no raid buff so its only utility is grip, which means a Frost or Unholy
    DK in a group that already has Blood loses a lot of value to grip redundancy, and "no matter
    how good Frost or Unholy looks" Blood is strong enough on both axes that placing a DPS DK is
    hard. His RWF line (one DPS DK at most) is recorded inside the claim rather than minted as a
    separate raid take — it is a world-first roster observation, not a general raid verdict.
  · **AutomaticJak → Restoration Shaman, `buff`, `raid`** (`v3Zqosa4gGc`, 2026-08-07) — an
    explicit upward revision of his own published tier list: he says he underrated Resto Shaman
    because he had overlooked Elemental Resistance (Healing Stream Totem also cutting Fire/Frost/
    Nature damage taken by 6%), which against an all-Nature raid is effectively a second Devotion
    Aura on top of the stamina. "Resto Shaman's going to be real good."
- **Supersede pass: 2 retired**, both same creator + spec + lens — Obli's 08-04 Frost `mplus`
  `mixed`, and AutomaticJak's 08-04 Resto Shaman `raid` `neutral`. **Obli's 08-01 Unholy take was
  deliberately NOT superseded**: it carries no bracket (general lens) and the new one is M+, and
  the guardrail is same-lens only — a general read and a bracket read are complementary.
- **Forecast impact measured before pushing: 1 letter moved.**
  · **Restoration Shaman raid B → A (57→59)** — and this is NOT the v11 single-creator healer
    path. The basis reads "expert takes +7 (5 creators, quorum — may move one band)": the panel is
    five creators and already mostly buff, and AutomaticJak flipping neutral → buff tipped it over
    the band edge. Confidence stays **low**, correctly — raid has no PTR empirical term, so the
    cell renormalizes to 100% of the 12.0.7 prior exactly as v10 documents.
  · Score-only: Unholy M+ 80→78, Windwalker M+ 75→76, Assassination M+ 70→72.
  · **Outlaw M+ did not move** — its basis says "bounded terms capped at 0 by the A edge", so
    Musguete's buff had nowhere to go.
  · **Frost M+ did not move at all** (A 59 before and after). Worth recording because it looks
    wrong and is not: the outlook was ALREADY −4 from the tuning tally, and the take going
    `mixed` → `nerf` only changed WHO supplies that −4. The basis gained "(expert panel: 1
    creator, no writeup)" while the number stayed identical.
- **Verified-skipped: 30 new entries, `skipped[]` 18 → 48.** Grouped: 7 dungeon/boss guides
  (Tactyks ×4, Sha ×2, J-Funk ×1), 6 PvP duel/testing videos (out of scope by the standing PvE
  rule), 6 UI/addon/gearing pieces, 8 sub-two-minute clips, 1 non-WoW stream, plus the two below.
- ⚠ **The premise behind the policy change did not hold in this batch, and that is worth
  recording honestly.** The rationale was that "a Method guide author's dungeon guide routinely
  carries spec analysis". Transcribed in full, **none of the seven dungeon/boss guides carries a
  spec read** — they are route, trash and boss-ability walkthroughs. Their apparent spec mentions
  are ability names (Bound by Shadow, Shadowborne Champion, Shadow Whirlwind, unholy mending,
  bloodsworn, blood drain), which is also a warning about any spec-name-frequency heuristic.
  Separately, **all four videos that yielded takes would have passed a keyword filter anyway**
  (titles carrying "12.1", "Buffs", "META next season", "PTR M+ Healer Testing"). So the real
  constraint this run cleared was the **backlog** — 325 unseen in-cycle videos from creators
  whose feeds had never been polled — not the filter. The policy is Riley's call and stands; this
  is data for the next time it is weighed, not a re-litigation.
- **Jedith's Devourer roundtable (`OFsc6LxpEek`) was read in full and skipped.** It is a
  mechanics/theorycrafting panel, not a state-of-the-spec verdict: sim methodology, Devourer's
  ~100k DPS min-max sim spread (so a single log is an inconsequential data point), Eradicate
  being untrackable on Warcraft Logs because of a game-side data gap, and closing play tips. No
  comparative read. Attribution would also have been unsafe — the clearest authority in the room,
  VooDooSaurus, is a guest and already has a newer self-published Devourer take (08-07).
- **Maximum's standing re-check discharged.** His registry note said "no settled pre-Season-2 tier
  list yet as of 2026-08-04 — re-check 2026-08-08..18". His only in-window upload is a pug-drama
  reaction video with no 12.1 content across 20k words, so he still has not published one; the
  entry is left as-is rather than overwritten with a worse `latest`. izen and Zorthas `latest`
  fields are already current.
- **Two scope observations for a human, neither acted on:**
  · **Musguete on Subtlety** — he opens the video with a full Subtlety analysis (Goremaw's Bite
    damage still split and not empowering enough, only 2-3 logs above 300k and those in the two
    pool-heavy dungeons, "better than it was but not enough"). That is competent coverage of a
    spec outside his `["Outlaw","Assassination"]` scope. Widening is a registry decision.
  · **Obli on Blood — do NOT widen.** He says so himself at t=644: "this is a blood video and I
    never post blood videos on my channel… for me blood is still like a new field." His
    `["Frost","Unholy"]` scope is correct, and this is positive evidence for keeping it.
- **27 videos transcribed but only grep-triaged — deliberately left UNSEEN, not skip-listed.**
  These are the long stream VODs and key-run PoVs where a targeted grep found no verdict language
  but no full read was done, so calling them verified would be dishonest. They will re-surface in
  the next sweep and cost nothing but a free local fetch. Bare ids (deliberately not written as
  URLs, so the seen-set regex does not swallow them): 3STJjc4zVB4, Ca4eDpIlNDM, 7O6Ri1vo0rc,
  CJDlFku1ubM, v3KU4yAad4Q, u-FoVTcxEMo, mthoGTKGQvw, 2Fwocjbt5qM, zMvg6wwgKuk, k41d2I9BNIU,
  vinyMVm4oV0, CjU5SrG0rLE, m1ImR68pJy4, PlIkwLUHlOs, mTV27AX1oIU, bVuPua2J444, RbQj88QCbfs,
  nH-b1QYaS8w, aYQprKVzN50, XU8I0Nfl8HU, f5JljxC31YU, eoWuDTtY-50, BhXcWVF3NkQ, vwY2ZbIwFkE,
  FEI1YAmGaNQ, 9pm0HZWhxd0, IvYq9roNc9Y. **MadSkillzzTV `Ca4eDpIlNDM` (31k words, healer prep)
  and Preheat `eoWuDTtY-50` (Fire:56/Arcane:29) are the two most likely to repay a full read.**
- **One attribution deliberately declined.** AutomaticJak's stream also contains a Resto Druid M+
  read ("okay for M plus, but probably like fourth best healer… middle of the pack", plus mana
  "miles worse" than it used to be). It is NOT logged: the Resto Shaman claim is anchored to the
  host by self-reference ("my tier list", "it's in the description"), the Druid lines are not,
  and the stream has guests. ASR speaker diarization is not evidence enough to mint a take.
- **~253 in-cycle videos remain unswept** (325 minus this batch's 72). The next local run should
  continue newest-first from 2026-08-03 backwards.

## 2026-08-08 (LOCAL run, Opus 5 — scheduled, ~05:3xZ; second unfiltered sweep, continuing the backlog)

- **Scope: creator lane only.** This run fired ~9 MINUTES after the interactive session that
  did the first unfiltered sweep, and ~5h BEFORE the 08-08 nightly. ptr-watch had just swept
  both discovery channels and the WCL cuts were fetched 14h earlier, so the only lane with
  real open work was the one the previous run handed off: *"~253 in-cycle videos remain
  unswept; continue newest-first from 2026-08-03 backwards."*
- **PTR re-confirmed cheaply rather than trusted.** Blizzard's Discourse group feed
  (`/groups/blizzard-tracker/posts.json`) re-pulled live: newest Linxy post in thread 2317811
  is still **#19 (2026-07-31)**, and the only newer blue posts are SpeedyRogue's dungeon
  tuning (t2330956 #8), housing bugs and promo. **No new build; the feed stays at 15 entries.**
  WCL zones deliberately not re-probed — all four were probed from this IP 14h earlier and
  every stored row already carries its current date.
- **Discovery: 42 feeds polled (39 transcribable class creators + 3 general), 1 transient
  failure (Tettles — the documented 404 burst).** 615 entries, 186 already seen.
  **429 unseen → 211 in-cycle (>= 2026-06-18), 218 pre-cycle.** The previous run's "~253"
  estimate was high by ~40; 211 is the measured figure.
- **Batch: newest 60 in-cycle, back to 2026-07-25. 52 transcripts landed** (~800k words);
  **8 had no English auto-captions** (2 YoDaTV key PoVs, Bansherz and Supatease streams, Sha,
  2 twitch-mirror uploads). Per *fetch broadly, queue narrowly* they were NOT queued — every
  one is a stream or key PoV, and the queue is drained by Supadata against a 100-request
  MONTHLY budget. They went to `seen[]`.
- **Method, stated plainly because it is weaker than a full read on the long VODs.** Two
  mechanical passes over every full transcript: a wide one (verdict stem or token within +/-5
  lines of any spec/class name) and a tight one (standing-verdict language with a spec name
  in the SAME or adjacent line). Everything the tight pass surfaced was read in context;
  the short analysis videos (<9k words) were read end to end. The first extractor scored
  **zero hits on all 52 files** — a trailing `\b` in the alternation killed every prefix
  form ("underperform**ing**", "nerf**ed**"). Worth recording: an extractor that returns
  nothing looks exactly like a batch with nothing in it.
- **7 takes + 5 metaNotes added; 47 verified skips; `skipped[]` 48 -> 95, `seen[]` 206 -> 432.**
  - **Megasett — Monk Mistweaver, the first Mistweaver specialist take on file.** Two,
    bracket-split from one video (`CJNPj7p71B8`, 08-02): **raid `nerf`** — his own Dummy Dome
    healer-dummy testing under agreed vendor gear puts Mistweaver ~40% below the strongest
    healers, which he attributes to stacked 3%+7% aura nerfs, the 60% Morning Breeze cut and
    the ~15% HPS loss of the S1 four-piece; Revival does ~675k total on a 3-min cooldown and
    is outhealed by class-tree passives. He will not bring it to the raid. And **M+ `neutral`**
    — he keeps the Monk for keys and calls it "pretty mid-pack" there, with no numbers behind
    that half, which is why the two are logged separately rather than as one whole-spec read.
  - **Musguete — Rogue Outlaw + Assassination `buff` (07-31)**, reacting to that day's aura
    pass (Assassination +10%, Outlaw +6%, Subtlety +10%). Logged **unbracketed** and **live**
    beside his 08-04 M+ takes: the supersede guardrail is same-lens, and a whole-patch tuning
    reaction is a different lens from a PTR-M+ log review. Direction matches his current read,
    so it cannot mislead. **Subtlety deliberately not attributed** — he reads the tuning line
    but gives no analysis, and it is outside his declared scope.
  - **Bansherz — Hunter BM / MM / Survival, M+ `neutral` (08-07)**: all three around B tier,
    "solid but not meta", Survival highest of the three; a Hunter main should stay, someone
    chasing the best spec should not swap. **His four older streams carrying earlier versions
    of this read were skipped, not logged** — one creator, one spec, one lens gets one live
    take, and 08-01's "MM strongest / SV best in keys worst in raid" predates the 08-03 nerfs
    he himself discusses on 08-03.
  - **Zorthas is now the SECOND general creator in `metaNotes[]`** (izen was the only one).
    From `gbGrLErnjxE` (07-30): **Blood DK `positive`** (strongest-looking tank for damage and,
    he says surprisingly, survivability) and **Holy Paladin `positive`** (simply out-heals every
    other healer), both M+ lens. From `JMnU-WUeOuk` (07-26): **Subtlety and Assassination
    `negative`, Outlaw `mixed`**, raid lens — rogue in the bottom five on nearly every boss in
    collated PTR raid logs, structurally weak on the 2-3 target cleave the new raid is built
    around, and Atrophic Poison delivering under 3% effective DR because so much new-raid
    damage is environmental or untargetable. Tagged in `patchContext` as recorded **before**
    the 07-31 rogue buffs, which is exactly why they move nothing (see below).
- **Model effect: 7 projection cells moved on SCORE, ZERO letter moves.** Measured against
  `git show HEAD:dist/index.html`, not against the working dist — `npm test` runs a build
  smoke test, so the local dist is already post-change by the time you think to copy it.
  - Blood DK M+ 78->81 and Holy Paladin M+ 82->85: the meta nudge **switched on**, basis now
    "meta read +3 (2 creators agree, within-tier only)". A second general creator is what
    unlocked corroboration — the single-voice izen reads were not firing it.
  - Mistweaver raid 87->85, Assassination raid 37->39, Outlaw raid 41->43: existing expert
    panels tipped from a net zero to a signed value by the third creator.
  - Hunter BM M+ 56->55, Survival 46->45; **MM did not move at all.**
  - Zorthas' rogue metaNotes moved nothing — izen's 08-01 raid reads are newer, so the
    newest-read nudge never reaches them. Correct, and worth knowing before wondering why.
- **The most substantive take of the run barely registers, and the reason is structural.**
  Megasett's raid read is detailed, first-hand and strongly negative, and it moves Mistweaver
  raid **two points inside A+**. Mistweaver raid has no PTR empirical term and no PTR raid tier
  list, so it renormalizes to **100% of the 12.0.7 prior (87)** — precisely the v10 limitation
  in CLAUDE.md. v11 removed the quorum requirement for healers so one creator *may* cross a
  band, but the +/-12 headroom applies to a panel average, and a 3-creator panel averaging to
  -2 has nowhere near enough to cross the A+ edge. Not a bug; recording it because "we finally
  got a Mistweaver specialist and the forecast still says A+" is the obvious next question.
- **Scope observations for a human — none acted on:**
  - **Tactyks still yields nothing on Protection Paladin.** He was added to close that spec;
    across four streams and four guides this batch (~95k words) there is no Protection Paladin
    standing read at all. He talks fluently about Guardian Druid, Blood DK, Prot Warrior and
    Warlock instead — all outside his declared scope.
  - **Sha (Brewmaster) likewise**: a real tank comparison in `7WMmhf92sNI` (Prot Warrior really
    good with unique advantages, BDK "too good to be true", Prot Paladin still good but no
    longer broken) covering every tank *except* the one he is scoped to.
  - **Bansherz** is emphatic that Arms is "the singular best spec next patch" and Arms+Arcane
    are the M+ dynamic duo. That is meta chatter from a Hunter main, not Warrior coverage —
    noted, not a widening case.
- **Maximum `ahFknNijxh4` is a watch-along**: the tier-list commentary in that transcript is
  Zorthas' script being read aloud. Attributing it to Maximum would have misattributed another
  creator's words to him. His registry entry left as-is, as the 08-07 run decided.
- **Shindigg declined to give a read** when asked directly which rogue spec is best on PTR
  ("not really sure... haven't played much"). Logged as a verified skip rather than squeezed
  into a take.
- **218 pre-cycle videos moved to `seen[]`** — a hard date-bound dismissal per the skill, and
  the single biggest reduction in future sweep noise available. **The ~151 in-cycle videos
  below this batch's cut were deliberately left UNSEEN**, not retired: they are a work queue,
  and marking a newest-first cut as seen would silently abandon a backlog the previous run
  explicitly handed forward. Next local run continues newest-first from **2026-07-25** back.
- **Still unread from the 08-07 batch**, and still worth it: MadSkillzzTV `Ca4eDpIlNDM`
  (31k words, healer prep) and Preheat `eoWuDTtY-50` (Fire:56/Arcane:29). Neither fell inside
  this run's newest-60 window.
- `npm test` **334 pass / 0 fail** (the 21 Playwright UI invariants skip locally; template.html
  untouched). `npm run build` OK (1273.3 KB), `node src/snapshot.mjs`, then rebuilt.
  `check-refresh --manifest` failed on **exactly one line** — `startedAt ... is 18h old` — which
  is the expected partial-run result. **Manifest deliberately NOT rewritten** (local-run skill
  step 3: this run re-attempted nothing outside the creator lane).
