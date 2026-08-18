# watch-creators run log

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

## 2026-08-18 (nightly)

**Discovery only — 0 takes, 0 metaNotes, 4 queued.** `transcript-fetch/summary.json` reports
verdict `ok` with requested 0 / fetched 0: the queue was EMPTY when the deterministic step ran,
because the 08-17 local run drained all nine of last night's videos. Nothing was fetched from
YouTube or any transcript API by this agent, and nothing was installed or upgraded.

44 unique channel feeds polled with backoff, **44/44 HTTP 200**, 660 entries, diffed against a
**1092-id** seen-set built from the four STRUCTURED lanes (`pending-transcripts` seen[] /
skipped[] / videos[] + every `youtu.be` id in a take or metaNote url) — never a regex over log
prose. **33 unseen, all in-cycle** against the 2026-06-18 bound (the OLDEST date in
`ptr-builds.json`, not `builds[0]`).

**QUEUED (4)** — nightly keyword filter, fetch-broadly/queue-narrowly:
- `okaZqAQVRN0` izen — "Midnight Season 2 | Raid Specs Meta Predictions". General creator →
  metaNotes lane. Its own chapter list is Tanks / Healers / DPS / TOP DPS / Bottom DPS, and
  **raid is the bracket with the least PTR evidence**, so this is the highest-value item in
  tonight's sweep.
- `x0fxEWTq3Pw` Zorthas — "Pre-Season Tuning Analysis & Tier List Update". General creator;
  chapters Tuning Patch / Raid / Cantrip Tuning / Tier List Update. Description links the same
  Aug-18 tuning post the PTR sweep folded in tonight.
- `jlbQAmQMRCM` NeekapHere — "Retribution Paladin BUFFED — But We're Not Fixed Yet". His
  registered spec, and tonight's tuning edit buffs exactly that spec; the description promises
  aura-buff plus tier-set feedback.
- `6MlSd4nBtrI` Dratnos — "Race to World First Preview (Recap Day 0)". Queued on its
  DESCRIPTION, not its title: the chapter list carries "10:50 Raid Comp Predictions". His
  08-16 RWF video was left unseen for being pure logistics, which is the distinction.

**NOTHING retired to `seen[]`** — no dismissal tonight is durable.

**Left UNSEEN (29), counted rather than estimated:** 12 guides / routes / gearing videos
(Shadarek's Devourer BiS guide, leak's Survival gearing guide, Sha ×4 dungeon routes, Tactyks
×2 — the M+ one also firewalled by construction since he writes the Method M+ list, Dalaran
Gaming's Subtlety guide, YoDaTV routes, Megasett's shopping list, Tactyks' launch-prep promo);
10 stream / leveling / alt-gearing shells (Bansherz ×2, Critcake ×3, Clandon, Shindigg,
Tettles, Pkpawner split-run stream, YoDaTV's Twitch restream); 4 PvP-framed (Supatease ×3 —
"Nine WORST Specs 12.1" and "DISCOVERING THE BEST CLASSES 12.1" cannot be told from a PvP read
on the title alone, and the 08-09 precedent is that his season reads are PvP-reasoned — plus a
Dalaran Gaming duels video); NeekapHere's "This Week In WoW" news round-up; Sha's remaining
route videos. `media:description` again settled most of the triage at zero transcript cost.

No `latest` field advanced — nothing was distilled, so there is nothing new that is KNOWN.

## 2026-08-17 (local run — residential transcript catch-up)

Queue **9 -> 0**. yt-dlp 2026.07.04 (the requirements.txt pin; nothing installed or upgraded).
No 429 at any point: metadata paced at 1.6s, captions at 1.8s, 36 caption fetches, 0 misses.

**Discovery, unfiltered per the local-run rule.** 38 pollable creator feeds, all HTTP 200,
diffed against a 1045-id seen-set rebuilt from the four STRUCTURED lanes (never log prose).
50 unseen in-cycle against the 2026-06-18 bound (the OLDEST date in ptr-builds.json, taken
by date and not by index) + the 9 queued = 59 considered. Metadata was harvested FIRST as a
separate invocation (--print with sub flags silently simulates), which settled the live and
Short triage at zero caption cost.

**+13 takes, +24 metaNotes, 18 takes and 23 metaNotes superseded.**
- Three INDEPENDENT Devourer reads of the Aug 18 tuning pass, all distilled: Shadarek
  (d99gGdPLxFI), Jedith (QOmfIifvkgw), VooDooSaurus (byBgZmZlzxI). They agree the nerf
  landed and the spec is still upper-end, so all three are `mixed`; they disagree only on
  build preference. Shadarek is a genuine revision — the circulating sim figures used a
  typo'd 0.8 spell-power override instead of 0.88, so a 12% nerf was being read as 20%.
- NeekapHere Retribution (yUVywQqHtVs): `nerf`, bottom-five on sims, worse in raid than M+.
- Bicepspump Unholy (Y9Jlp2E04No): `mixed`, explicitly not expecting a repeat of its S1 meta.
- Kalamazi Warlock week-one (9bQVdlUqeAM): six takes, raid AND M+ per spec, so the pair
  genuinely replaces his older reads rather than half-retiring them.
- Dalaran Gaming Outlaw (rKjGaAE1k3w) and Assassination (lFJw787T2Do).
- izen KktdoK1OZVY -> 24 metaNotes in the M+ lens. **His stated basis is recorded in every
  patchContext**: he says outright he is NOT rating by maximum power but by how likely each
  spec is to be PLAYED, reasoning partly from PTR representation counts. Distilling that as
  strength would be the popularity-as-power inversion this project refuses elsewhere.

**Applied the list-mention rule and dropped 8 candidate metaNotes** whose only evidence was
membership in a bare enumeration: Feral, Havoc, Enhancement, Affliction, Demonology,
Vengeance, Holy Priest, and Frost DK/Ret/Subtlety. Frost MAGE was kept — it carries its own
worked reasoning about Arcane being played ~130x more.

**27 videos transcript-verified and moved to skipped[]** (durable; each carries what the
transcript turned out to be). Highlights:
- LBNinja7 MId00Jg51mo is an EASE-OF-PLAY ranking, not strength — "how easy I think each
  healer is". It is a lead for playstyle.complexity, which is guide-sourced, not a take.
- AutomaticJak mzjGn70Hf20 restates the same Aug-15 read already distilled from c_5u7Jpy-Uo
  the SAME DAY, and additionally reads Zorthas' and Archon's tier lists aloud. Skipped to
  avoid double-counting one creator's single-day opinion across two videos.
- Whispyr b3kZyBt660U is a gear/hero-talent guide (Deathstalker vs Fatebound, trinkets) —
  the standing example in SKILL.md of an item-level claim that must not become a take.
- All three Supatease uploads are PvP-framed despite PvE-sounding titles ("should you main
  for PvP", shuffle, conquest, BG Blitz). Confirmed by transcript, not by title.
- Tactyks ZS1GMWVLegs firewalled by construction (M+ video; he authors the Method M+ list).
- Sha bqVHzvKJCuA — the video SKILL.md flags as having been queued while still live and
  burning repeat API requests. Now an ended VOD; fetched locally and RESOLVED.
- 10 sub-minute Shorts retired to seen[] (duration is a fact that cannot change). The two
  upcoming premieres (baqjtPWid-M, U_bAsRSY5Y4) were left UNSEEN — no captions can exist yet.

**Trap hit and fixed, worth remembering.** The first write used `patchContext: "12.1 /
Season 2 — ..."`. `expertRead` era-gates on the LITERAL `PHASES.ptr.marker` ("12.1 PTR"),
so all 13 new takes were silently excluded while the 18 they superseded were not —
i.e. the run would have REMOVED coverage. `test/claude-md.test.mjs` caught it precisely
(3 specs newly without a raid take). Rewritten to "12.1 PTR — ...". metaNotes are NOT
era-gated, only bracket-scoped, so those were correct as written.

**Scope note for a human:** Bicepspump covers FROST DK in depth in Y9Jlp2E04No (he reads it
as the stronger of the two and a potential M+ meta spec, with dual-wield now mandatory), but
his registry entry is scoped Death Knight [Unholy], so nothing was attributed. Preheat
likewise published a Devastation Evoker guide while registered for Mage only. Both are
scope-widening candidates — flagged, not silently overridden.

## 2026-08-17 (nightly)

**Discovery clean, distillation impossible for a different reason than the last four nights.**
`transcript-fetch/summary.json` verdict **`ok`** with requested 0 / fetched 0 — not
`limit-exceeded`: the queue was simply EMPTY when the deterministic step ran, because the 08-16
local run drained all 12. So **0 takes and 0 metaNotes**, no `latest` advanced, and no transcript
fetched from YouTube or any API by this agent.

44 unique channel feeds polled with backoff, **44/44 HTTP 200**, 660 entries against a **1045-id**
seen-set built from the four structured lanes (never a regex over this log). **55 unseen, none
pre-cycle** (bound: 2026-06-18, the OLDEST date in ptr-builds.json).

**NINE QUEUED** — fetch broadly, queue narrowly; all take-shaped, and this is the first night in
five with a plausibly non-exhausted Supadata budget:
- `d99gGdPLxFI` Shadarek, `byBgZmZlzxI` VooDooSaurus, `QOmfIifvkgw` Jedith — **three
  independent Devourer DH reads of the 08-18 nerf**, which is exactly the corroboration
  `expertRead` shrinks by. Descriptions confirm substance (Shadarek: "sims had an error";
  VooDooSaurus: tier set + single target, Annihilator vs Void-Scarred).
- `yUVywQqHtVs` NeekapHere ("Is Retribution Paladin COOKED?" — "Ret is in some dire straits").
- `KktdoK1OZVY` izen — general creator, S2 M+ meta tier list → **metaNotes lane**.
- `MId00Jg51mo` LBNinja7 (each healer ranked), `mzjGn70Hf20` AutomaticJak (tier-list stream;
  his last one yielded 13 takes), `Y9Jlp2E04No` Bicepspump (description promises "my predictions
  for the meta status" for both DK specs — attribute Unholy only, his registered scope),
  `b3kZyBt660U` Whispyr (Assassination, "why is everything cleave").

**ONE retired to `seen[]`**: `syMKQGVlERo` Kalamazi, "Florida Man BBQ Cooking Stream" — durable,
not WoW at all (same series as `JNLnHEd_WiU` last night).

The other **45 stay UNSEEN** because none is a durable judgment, and the split is counted rather
than estimated: **19** guides / routes / trinket lists / build videos (Kesslive ×3, Megasett ×3,
Sha routes ×3, Dalaran ×2, Preheat ×2, Shadarek trinket lists ×2, Zorthas ×2, Baze, Tactyks
routes), **13** stream or Short shells (Bansherz ×2, Critcake ×2, Megasett ×2, Tettles ×2,
Kalamazi, Maximum live, NeekapHere zone vlog, Shindigg, and Sha `bqVHzvKJCuA` — still the
live-stream shape, still not queued), **10** PvP-framed uploads (Supatease ×9 + Dalaran's 5v5/1v1
duels), **`ZS1GMWVLegs`** Tactyks (M+, firewalled), **`QevyPqgpoEs`** Harrek (raw Dummy Dome pull
footage, logs linked in the description, no comparative read), and **`8b-nyzqIaQ8`** Dratnos,
whose own chapter list is entirely RWF logistics (headstart / splits / progression / bonus rolls)
with no spec-strength segment — a raid-scoped upload declined on its own metadata rather than on a
title guess.

Two firewall applications worth recording: **Tactyks' `ZS1GMWVLegs` and `nZJi0Fdgl5Q` are both
M+**, and he writes the Method M+ list (re-confirmed on the live page tonight — its M+ body
credits him by name), so they are out of scope by construction, not by taste.
And **Supatease's `iF9-2dpJdjo` (Shadow Priest) and `Tsy8Wr09VeA` (Destro)** name specs outside
his registered scope (Shaman / Affliction / Arms+Prot Warrior).

`media:description` again settled most of the triage at zero transcript cost. Nothing installed
or upgraded.
## 2026-08-16 (LOCAL run, ~14:30-16:00 UTC — the queue drain the nightly could not do)

**Queue fully drained: 12 → 0**, on yt-dlp from a residential IP, after four consecutive nightlies
reported `limit-exceeded` on the Supadata monthly budget. **34 takes and 21 metaNotes added**, all
from the August 18 launch tuning pass. This is the backlog local runs exist for.

Of the 12 queued: **8 distilled**, **3 retired to `seen[]`** as durable no-caption facts
(`vbYnrLDqHoc` Nintern, `JFEqnHV99uk` Musguete, `nTMq3Y3U14Y` Shadarek — the last has a
`live_chat` track only). Each was probed on **two player clients** (default android-vr and
`player_client=web`) before being written off, because a false durable dismissal abandons the
video permanently. **`U_bAsRSY5Y4` (Megasett) DEQUEUED and left UNSEEN** — yt-dlp returns "This
live event will begin in a few moments", so it is the `bqVHzvKJCuA` shape exactly: a live entry
that had been sitting in the queue since 08-12 spending Supadata requests against an exhausted
budget. Not `seen[]`, not `skipped[]`, so the finished VOD returns.

Distilled: izen `OdhbpI6Mjsw` (21 metaNotes — the whole pass, spec by spec), AutomaticJak
`c_5u7Jpy-Uo` (13 takes; his tier list splits raid and M+ on screen, so each spec got both),
LBNinja7 `DMtMmUW5uRE` (7), YoDaTV `shGSOb8YoMQ` (6), Bansherz `tFU5qCIEUF8` (5, a 2.3h stream),
Jedith `oomrLdyB8YA`, Musguete `lanOZvwWzw0`, Dratnos `-sShKFuX2cQ`.

**Published effect: 1 projection letter, 0 consensus letters** — Mistweaver raid B → A, measured
against `git show HEAD:dist/index.html` rather than the working `dist/`. It is NOT a lone-creator
healer-exemption move: `expertRead` reports a **4-creator** raid panel that is still net negative
(shrunk −0.167), just less negative than before.

**Two self-caught data-entry errors, both found by measuring the effect rather than trusting the
write.** (a) Four AutomaticJak takes were coded `buff` while their own claim text said the buff
leaves the spec short ("a little less poor", absent from his race comp) — corrected to `mixed`.
(b) More consequential: twelve takes on specs the pass did NOT touch were coded `neutral` as if
"no tuning change" were the reading. `expertRead` maps neutral to **abstain-but-still-counted**
(render.mjs:488), so coding an actively advocated spec neutral dilutes its own panel — the
placeholder-neutral defect in SKILL.md wearing a different hat. It published a **phantom
Restoration Shaman raid A+ → A downgrade**, caused purely by superseding AutomaticJak's 08-07
positive take with a neutral one while he still argues for the spec in his race comp. Recoded to
read polarity; the downgrade vanished. **The lesson worth keeping: `sentiment` is a directional
vote on the spec's standing, not a description of whether the patch notes moved it.**

**Discovery: 44/44 feeds, 1045-id seen-set, 32 unseen, all in-cycle — and ALL 32 LEFT UNSEEN.**
Today's crop is guide-heavy (Tactyks tank-busters, Dalaran Outlaw, Kesslive + Preheat Devastation,
Preheat Arcane hotfix), plus a Bansherz stream, a Zorthas delve video and 5 Supatease uploads on a
PvP-framed channel. Under the guide rule none of those yields a take, and none is a durable
judgment, so retiring them would be a guess — they stay genuinely unexamined and the next run
reconsiders them. Nothing was queued: the queue drains against the exhausted Supadata budget, so
"fetch broadly, queue narrowly" means queueing nothing tonight.

**TWO SCOPE-WIDENING CANDIDATES FOR RILEY — flagged, not acted on.** Both creators gave sustained,
competent analysis outside their declared `specs`, and per SKILL.md that is a human decision:
- **YoDaTV on Rogue.** His registered scope is Blood DK / Vengeance / Guardian / Brewmaster /
  Paladin / Prot+Arms Warrior. This video spends ~90 seconds on Rogue specifically, calling
  Subtlety "probably one of the best specs in the game", predicting Assassination will "go to the
  moon" in high-target dungeons, and reasoning concretely about Outlaw's target-cap problem at
  Altar of the Fangs. All of it was DROPPED.
- **Musguete on Subtlety.** Scope is Outlaw + Assassination. He gives a detailed Subtlety read
  (the intentional 4-5% bug, the 6% compensating buff, the four-set drop 100% → 60%, and a
  consequent mastery-to-crit stat shift). Dropped.

**PTR lead, verified and already covered:** every creator this run discusses an August 18/19 tuning
pass. It is already in `ptr-builds.json` as the 2026-08-15 entry (standalone forum topic 2336820),
landed by the nightly — so nothing to log. Recorded because five separate transcripts read like a
new build if you do not check.

`yt-dlp` at the `requirements.txt` pin (2026.07.04); nothing installed or upgraded. No 429s —
metadata and captions were fetched in small paced batches with `--sleep-requests 1.5`, and
`--list-subs` carried the caption probes. `media:description` again settled most of the discovery
triage at zero transcript cost.

## 2026-08-16 (nightly)

**Discovery clean, distillation impossible.** `transcript-fetch/summary.json` verdict
`limit-exceeded` (requested 1, fetched 0) — the Supadata monthly budget is exhausted, so **0 takes
and 0 metaNotes** were added and no `latest` field was advanced. No transcript was fetched from
YouTube or any API by this agent.

44 unique channel feeds polled with backoff, **44/44 HTTP 200**, 660 entries against a **1045-id**
seen-set built from the four structured lanes (never regex over this log). **26 unseen**, none
pre-cycle (bound: 2026-06-18, the OLDEST date in ptr-builds.json).

Three queue actions:
- **DEQUEUED `bqVHzvKJCuA`** (Sha) — the suspected still-live stream flagged 2026-08-09. Its RSS
  entry is now titled **"S2 Prep short stream"** with `published` moved 08-09 → 08-15 under the
  same id: live/stream metadata, not a guess. It had spent a Supadata request on four separate
  nights returning nothing. Left **UNSEEN** per the standing rule so the finished VOD can be
  picked up later — not `seen[]`, not `skipped[]`.
- **QUEUED `-sShKFuX2cQ`** (Dratnos, "My Raid Comp Prediction for 12.1 Venomous Abyss RWF") — the
  one take-shaped upload tonight, and raid-scoped, which is the thin bracket.
- **SEEN `JNLnHEd_WiU`** (Kalamazi, "Florida Man BBQ Cooking Stream") — durable: not WoW at all.

The other 23 stay UNSEEN because none is a durable judgment: 9 guides/routes (Kesslive ×2,
Preheat ×2, Megasett, Baze, Dalaran, Tactyks S2 routes, Sha ×2), 8 stream/Short shaped (Bansherz,
Tettles ×2, Critcake, NeekapHere, Kalamazi, Maximum, Megasett Short, Zorthas delve, plus
AutomaticJak's "Updating Tier Lists then M0s" — his dedicated tier-list video `c_5u7Jpy-Uo` is
already queued), 2 Supatease uploads on a PvP-framed channel ("Finding The Best Class 12.1",
"Destro Lock INSANE 12.1"), 1 raw log footage (Harrek's Dummy Dome healer pulls). Queue depth
unchanged at 12 against an exhausted budget — fetch broadly, queue narrowly.

`yt-dlp` tried ONCE for metadata on `bqVHzvKJCuA` and hit the expected datacenter bot wall ("Sign
in to confirm you're not a bot"); not retried, nothing installed or upgraded. Note for a local
run: `media:description` settled most of tonight's triage at zero transcript cost again.

## 2026-08-15 (nightly, 21:50 UTC — second run of this UTC day)

**Discovery clean, distillation impossible.** `transcript-fetch/summary.json` reports verdict
`limit-exceeded` (requested 1, fetched 0, `bqVHzvKJCuA`): the Supadata free-tier monthly budget
is spent, so there was no transcript to distil and **0 takes / 0 metaNotes** were added. No
YouTube or transcript-API fetch was made by this agent.

RSS: all **44** unique channel feeds polled with backoff, 44/44 HTTP 200, **660** entries
scanned against a **1035-id** seen-set built from the four structured lanes (`seen[]`,
`skipped[]`, `videos[]`, plus every `youtu.be` id in creator-takes.json) — never by regex over
this log. **17 unseen.**

- **1 retired to `seen[]`** as a durable dismissal: `80dIIds3qPM` (Dalaran Gaming, "What Did
  Blizzard Do To ROGUES In 12.1? (5v5 1v1 Duels) - PvP"). Explicit PvP frame = permanently out
  of scope, the same shape as `oUjUd8kcWew` retired earlier today.
- **0 queued.** The queue already holds 12 against an exhausted monthly budget, and everything
  else tonight is guide/route-shaped (Tactyks S2 routes, Sha's Temple of Sethraliss route,
  Megasett's Mistweaver M+ guide, Baze's Fury guide, Dalaran's Assassination guide), stream- or
  Short-shaped (Tettles ×2, Critcake, Kalamazi, NeekapHere, a Megasett achievement Short,
  Maximum's live AWTF test stream), raw footage (Harrek's Dummy Dome healer pulls), or a
  Supatease upload whose channel reads PvP by default.
- **16 left UNSEEN on purpose.** None of those judgments is durable, so they stay
  reconsiderable by a local run with yt-dlp rather than being marked off.

The one genuine borderline: `mzjGn70Hf20` (AutomaticJak, "Updating Tier Lists then M0s! | UI in
description!"). A tier-list update is the highest-value take shape, but this one is
stream-shaped and the same creator's *dedicated* tier-list video from the same day
(`c_5u7Jpy-Uo`, "Healer Tuning AND Tier List Updates for M+/Raid Season 2 Launch") is already
queued — so queueing it would likely spend a second request on duplicate content. Left unseen.

yt-dlp was tried **once**, to settle that video's duration/live status, and hit the expected
datacenter bot wall ("Sign in to confirm you're not a bot"); not retried, per the standing
back-off rule. That is also why `bqVHzvKJCuA` — still the suspected live stream first flagged
on 08-09 — was left queued rather than purged on a guess. No creator `latest` advanced, since
nothing was distilled.

## 2026-08-15 (nightly)

**Two independent degradations tonight, both recorded rather than worked around.**

1. **Transcripts: `limit-exceeded` again.** `transcript-fetch/summary.json`
   (2026-08-15T04:58:38Z) — 1 requested / 0 fetched on `bqVHzvKJCuA`, "remaining queue
   untouched". Supadata's free tier is 100 requests per MONTH and the budget is spent. **Zero
   takes, zero metaNotes** added, changed or superseded; no transcript was fetched by this
   agent by any means.
2. **NEW: the YouTube RSS endpoint is 404-walled from this runner.**
   `youtube.com/feeds/videos.xml?channel_id=…` returned 404 for **40 of 44** channels and did
   **not** clear across four rounds with backoff over ~10 minutes — so this is not the
   documented transient burst. Discovery was completed with the preinstalled **yt-dlp at its
   `requirements.txt` pin (2026.07.04 — never installed or upgraded in-run)**:
   `--flat-playlist --playlist-end 15 --extractor-args "youtubetab:approximate_date"` over each
   channel's `/videos` tab. **44/44 channels enumerated, 0 failures, 652 videos.**

- Seen-set rebuilt from the four structured lanes: **1011 ids**. 134 unseen; **31** date at or
  after the cycle's opening build (2026-06-18).
- **Queued 16** (queue 27 → **43**): six same-day reactions to tonight's Aug-18 tuning post —
  Shadarek (Devourer tier set), Nintern (Devourer), MadSkillzzTV (healer buffs/nerfs), Preheat
  (Arcane), Supatease, Dratnos — plus ten older 12.1 / Season-2 spec pieces from MadSkillzzTV,
  AutomaticJak, Megasett, Shindigg, Musguete and Bansherz.
- **NOTHING was written to `seen[]` this run, deliberately.** `approximate_date` is day-precise
  only for recent uploads and rounds older ones to mid-month — the 103 apparently pre-cycle
  videos cluster implausibly on the 15th of each month. `seen[]` is durable, so retiring them on
  an approximate date would permanently dismiss videos we never actually dated. They stay
  unexamined and will be reconsidered next run. **If RSS stays down, this is the cost to watch:
  the seen-set stops growing and the same 100+ videos are re-enumerated nightly.**
- No `generalCreators` (izen / Maximum / Zorthas) uploads were unseen this run, so no `latest`
  fields moved and `community.json` is untouched.
- Coverage recomputed: every spec holds at least one live take; **Brewmaster Monk** is still the
  only spec with no RAID-scoped one, and nothing queued tonight is Brewmaster.

## 2026-08-15 (nightly CI, headless Opus 5, single-shot; started 10:57Z — SECOND run of this UTC day)

**ZERO takes and ZERO metaNotes added, changed or superseded — the transcript budget is
spent.** `transcript-fetch/summary.json` (2026-08-15T10:57:18Z) reports verdict
**`limit-exceeded`** on the single video it attempted (`bqVHzvKJCuA`), 1 requested / 0
fetched, "remaining queue untouched": Supadata's free tier is **100 requests per MONTH** and
the month's budget is gone, third night running. No transcript was readable, and this agent
fetched none from YouTube or any transcript API by any means.

**RSS IS BACK.** Last night's 404 wall (40 of 44 channels, four rounds of backoff over ~10
minutes, worked around with yt-dlp) did not recur: `youtube.com/feeds/videos.xml` answered
**44/44 channels on the first attempt**, 660 videos enumerated, 0 failures. That confirms it
was the documented transient burst after all, just an unusually long one — yt-dlp stays the
fallback, not the default.

Seen-set rebuilt from the four STRUCTURED lanes (never a regex over this log): `seen[]` 502 +
`skipped[]` 295 + `videos[]` 43 + every `youtu.be/<id>` in a take or metaNote = **1027 ids**.
Against it, **14 unseen videos**, all 14 published on or after the 12.1 cycle's opening build
(2026-06-18, the OLDEST date in `ptr-builds.json` — taken as a date, never as an index). The
sweep is this small precisely because RSS dates are exact tonight, so nothing needed the
approximate-date caution the yt-dlp run had to record.

**8 queued** under the nightly keyword filter (queue 43 → **51**), all 08-14/08-15 uploads:
Preheat's 12.1 Arcane Mage guide (`ajdnU9EAGtU`, the highest-value item), Supatease "12.1
CLASS TESTING POWER" (`VdxJLYndJSg`), Bansherz "Friday Tuning" Hunter stream (`tFU5qCIEUF8`),
MadSkillzzTV on the Resilient key system (`E2YySmAwnuM`), Shadarek with a Havoc-guide stream
(`nTMq3Y3U14Y`), Shindigg 12.1 launch stream (`kxujYlK8KG8`), and two LBNinja7 Mistweaver
streams (`Qu5OGUGRZPM`, `FdMtgWW4oIk`). They drain when the monthly budget resets or in a
local run.

**6 NOT queued, and none of them written to `seen[]`** — this is deliberate. The lane exists
for videos dismissed on a DATE bound or a newest-first cut; a *keyword* dismissal is a
nightly-only economy (Supadata's monthly quota), and burning it into `seen[]` would
permanently retire the video from the unfiltered LOCAL sweep, which is exactly the breadth
the 08-08 policy bought. Left unexamined for a local run: Kalamazi "Main/Alt Gearing and Prep"
(`mMPBLggVX3E` — a Warlock authority on S2 gearing; the best of the six), Tettles
`Nk8WpSLYCVo`, Maximum "live from AWTF test stream" (`x27SdcsuiMU`), NeekapHere on the Coiled
Isle (`l6KzJBK6vrs`, zone content), Megasett achievement short (`f0DnTRIO3pw`), and Dalaran
Gaming "Demon Hunters Are BACK With Vengeance In 12.1! (5v5 1v1 Duels)" (`oUjUd8kcWew`) —
that last one matches the keyword filter but is **PvP duel content, out of scope for this PvE
tracker**, the same scope line ptr-watch applies to PvP-only tuning lines.

No `generalCreators` (izen / Maximum / Zorthas) upload was in scope this run — Maximum's only
new video is the AWTF PvP test stream — so no `latest` field moved and `community.json` is
untouched.

Coverage recomputed: every spec holds at least one live take; **Brewmaster Monk** is still the
only spec with no RAID-scoped one, and nothing queued tonight is Brewmaster.

## 2026-08-15 (local run, evening) — the 51-video queue drained with yt-dlp

The reason this run exists. Supadata's free tier has been `limit-exceeded` for three straight
nights, so the nightly added to `pending-transcripts.json` without ever draining it and the
queue had grown to **51**. yt-dlp from the residential IP fetched **45 of 51** on the pinned
2026.7.4 build with no extractor rot.

**6 could not be fetched and stay queued** — not skipped, because none was transcript-verified:
`bqVHzvKJCuA` (Sha) and `U_bAsRSY5Y4` (Megasett) both return "This live event will begin in a
few moments", and four have no captions published yet (`vbYnrLDqHoc` Nintern, `tFU5qCIEUF8`
Bansherz, `nTMq3Y3U14Y` Shadarek — all 08-15 uploads where auto-captions may still be
processing — plus `JFEqnHV99uk` Musguete from 07-15, which is a month old and probably never
getting them). Queue **51 → 6**.

**12 takes added, 11 superseded**, from 7 videos. Coverage recomputed after the merge with the
two-line recomputation, and the headline is that **`no raid take` is now empty**: Sha's Season 2
plans video (`im6DkjkRDlw`) carries a substantial raid-scoped Brewmaster read — the Celestial
Brew/Infusion cooldown doubling, argued structurally against the apex-talent proc loop — which
closes the one RAID-scoped gap this log has been carrying. Brewmaster raid confidence moved
**low → medium** as a result; it was previously a cell with no PTR-aware evidence at all.

Other takes: YoDaTV's log-based Prot Paladin M+ argument (Sentinel uptime 38% → 25-31%),
Shadarek on the Devourer tier-set gutting with pre-APL sim overrides, Preheat quantifying the
Arcane nerf at 4.7% ST / 2.5% AoE, MadSkillzzTV's five-healer walkthrough of the August 18
tuning (Resto Druid, Mistweaver split raid/M+, Disc raid, Holy Priest), Dratnos on Fury and
Arms, and Pkpawner on the Windwalker AoE-burst pullback.

**Net effect on published letters: zero.** 16 projection scores moved by 1-3 points in the
direction of the takes, and **no projection or consensus letter crossed a band** — shrinkage
plus the one-edge clamp working as designed.

**38 verified-skipped**, which is the point of the unfiltered local sweep: the title is a bad
predictor in both directions. Notable earned skips — Tactyks' "Venomous Abyss TANK TIPS" is a
pure encounter-mechanics guide with zero strength language despite reading like tank analysis;
Kalamazi's "COIN & CRAFT", flagged by last night's nightly as "the best of the six" unexamined,
turns out to be a gearing/embellishment guide with no spec read; and Preheat's full Arcane guide
(`ajdnU9EAGtU`) was recorded BEFORE the nerf he reacts to in `ekZp5FfWXfg`, so distilling it
would have recorded a superseded state. Both Supatease "class testing" streams were skipped on
measured framing rather than vibe (197 PvP references against 73 PvE in one; 36 against 14 in
the other) — battleground testing is out of scope for a PvE tracker.

**Three scope-review flags for a human — none acted on, per the skill's "note it, don't
silently override" rule:**
1. **YoDaTV competently analyses Balance Druid** (`9SUfTFMcRJk`) — a log-driven argument that
   Moonkin is weak in Season 2 M+, using a world-class Moonkin's parse. Balance is outside his
   declared Druid scope (Guardian only), so the take could not be written. This is the single
   highest-value blocked distillation of the run.
2. **Sha ranges well beyond Brewmaster** in `im6DkjkRDlw` — competent reads on Windwalker,
   Blood DK, Prot Warrior and Prot Paladin, including an explicit disagreement with YoDaTV's
   Wowhead tank list placing Prot Warrior weakest. Only the Brewmaster half was distilled.
3. **Supatease's authority looks PvP-shaped.** He holds 6 live takes across Shaman, Affliction
   and Arms/Prot Warrior, but both of his videos this run were PvP-framed by a wide margin and
   his tuning read-through is a PvP-lens recitation. Worth deciding whether a PvP creator
   should carry specialist takes in a PvE tracker's expert panel.

Also confirmed while distilling: the **August 18 class tuning** both Shadarek and Preheat react
to is already logged in `ptr-builds.json` (2026-08-15 entry, 14 specs) — ptr-watch caught it
this morning, so these takes are commentary on a build already in the feed, not a lead.

## 2026-08-14 — local run: transcript lane BLOCKED by a self-inflicted 429; 0 takes, 0 metaNotes

Discovery was complete and clean: **44/44 channels polled, 0 RSS failures, 34 unseen videos
all inside the 12.1 cycle** (bound = first `ptr-builds.json` entry, 2026-06-18) against a
**970-id** seen-set built from structured data only. Zero pre-cycle videos surfaced, so the
date bound cost nothing this run.

**The transcript fetch failed and it was my own doing — record this so the next run does not
repeat it.** Following the "fetch broadly, no keyword filter" rule for local runs, I handed
all 42 candidates (34 discovered + 8 queued) to a SINGLE yt-dlp invocation. YouTube
rate-limited the timedtext endpoint with **HTTP 429** partway through and it never cleared:
30/60/90s in-loop backoffs, then a 4-minute cooldown, then a further 7-minute cooldown — all
still 429. **0 of 42 transcripts retrieved.**

The lesson is about PACING, not about the unfiltered sweep, and the two must not be conflated
— dropping the keyword filter is correct and stays. What is wrong is bursting the resulting
list. The 2026-08-13 run drained its queue fine because it was small. A ~40-video sweep is
now the normal size, so it needs to be paced from the START (single invocation, several
seconds between videos, and stop on the first 429 rather than retrying into a deeper block) —
retry-after-burst does not recover, the block outlives the run.

Useful side-finding: **`--list-subs` was never rate-limited**, only the subtitle *download*
was. So caption AVAILABILITY can be probed cheaply even mid-block, which is how the three
skips below were confirmed without a second download attempt.

**Queue: 8 → 13** (3 durable skips out, 8 in).
- **3 verified skips** (YoDaTV `c5QQHhL34f0`, `u3XBRu8FNUU`, `0461YCGqWws` — Season 2 +20 key
  runs): confirmed twice, by download attempt and by an independent `--list-subs` probe, to
  have **no captions of any kind**. Silent key runs with no commentary track, so no transcript
  source can ever return anything. Moved to `skipped[]` to stop the nightly spending a paid
  Supadata request on each of them every run.
- **8 queued narrowly** from today's discovery, keyword-filtered as the queue rule requires
  (it is drained by the PAID lane): the two YoDaTV spec verdicts (`z0weFwfFuSQ` Prot Paladin
  got worse, `9SUfTFMcRJk` Moonkin not good in S2 M+), **Tactyks `P-V2_kWBmP8` Venomous Abyss
  TANK TIPS — raid-scoped tank, the documented scarcest signal**, AutomaticJak `3ONMAmgTre8`
  Holy Priest, Supatease `leHJTQQirT8` / `c-YGgqlosyQ` class-power, LBNinja7 `wm5l2vtzO2o`
  Mistweaver, and izen `Oeab1J60RfI` for the metaNotes lane.
- The other **26 discovered videos were deliberately NOT written to `seen[]`** — they were
  never examined, only failed on transport, so they must stay visible to the next unfiltered
  local sweep. RSS re-finds them for free.

Supadata remains `limit-exceeded` (free tier, 100/month), so the queue will not drain on the
nightly until the monthly budget rolls; the free yt-dlp lane in the next local run is the
realistic drain, once the 429 ages out.

## 2026-08-14 (nightly, CI runner)

**Transcripts: `limit-exceeded` again** — `transcript-fetch/summary.json` (2026-08-14T18:02:09Z)
attempted 1, fetched 0 on `bqVHzvKJCuA`, "remaining queue untouched". Supadata's free tier is
100 requests/month and the budget is spent, so **0 takes and 0 metaNotes** were added, changed or
superseded. No YouTube or transcript-API fetch of any kind was made by this agent.

**Discovery ran in full:** all 44 transcribable channels polled off the public RSS endpoint,
0 failures, seen-set rebuilt from the four structured lanes (978 ids). **33 unseen videos, every
one published inside the 12.1 cycle** (first build 2026-06-18).

- **Queued (14, nightly keyword filter):** Pkpawner "The Complete Windwalker Monk Guide For
  Season 2"; Dratnos "Gear Available Now, Week 1 FAQ"; Kalamazi on 12.1 embellishments; Shadarek
  Havoc/Devourer M0s; Sha ×2 (Season-2 Kings' Rest route, Season-2 plans); Bansherz ×3 (BM
  Hunter S2 M0 tour, Venomfall Deeps solo, io grind); Supatease ×2 ("Best 12.1 Change",
  "Number 1 Elemental Shaman NA"); YoDaTV 12.1 gearing; Dalaran Gaming 12.1 class-changes
  stream; Tettles 12.1 stream. Queue now **27**.
- **Appended to `seen[]` (19):** PvP duel/arena streams (Dalaran ×2, Supatease ×4 including
  "Top 7 Specs PVP Season 2" — PvP-only is out of scope for a PvE tracker), UI-setup videos,
  and generic first-day livestreams with no class/spec/12.1/Season signal. Recorded at
  discovery so the next run's accounting stays auditable.
- No `generalCreators` (izen / Maximum / Zorthas) uploads were unseen this run, so no `latest`
  fields moved and `community.json` is untouched.

## 2026-08-13 (nightly CI, 11:47Z — Opus 5; single-shot) — discovery complete, transcripts still limit-exceeded

- **TRANSCRIPT API KEY problem: limit-exceeded.** `transcript-fetch/summary.json`
  (2026-08-13T11:28:23Z): 1 requested / 0 fetched, `bqVHzvKJCuA` → "limit-exceeded", remaining
  queue untouched. Supadata's free tier is **100 requests per MONTH** and the budget is spent,
  so **0 takes and 0 metaNotes** were added, changed or superseded. Nothing was fetched from
  YouTube or any transcript API by this agent.
- **Discovery ran in full:** 44 distinct channels (114 class-creator entries + 3
  generalCreators), **44/44 HTTP 200, 0 RSS failures, 660 videos enumerated**, diffed against a
  **955-id** seen-set built from structured data only (pending `seen[]` + `skipped[]` +
  `videos[]`, union every `youtu.be` id in a take or metaNote). **11 unseen, all inside the
  12.1 cycle** (none pre-2026-06-18).
- **5 queued** (nightly keyword filter KEPT, per the monthly-budget rule), taking the queue to
  **20**: `sh7XxGz4DD8` Shadarek "Havoc Demon Hunter 12.1 Raiding & Mythic+ Guide" (drain this
  one first — a real spec guide from a scoped Havoc/Devourer creator), `luzhyXtdocM`
  MadSkillzzTV "12.1 Targeted Spells CHANGED", `81vn_Aq6k1Q` YoDaTV "A Few Tips for the First
  Week of 12.1...", `Z9HAi6-QVUs` Kalamazi and `nYatsKq_vVI` Shindigg (both stream VODs whose
  titles repeat an already-queued entry from 08-10/08-12 — queued because they pass the filter,
  but they are the low-value end of the queue).
- **6 not queued and deliberately NOT written into `seen[]`:** `j1VG7ZgUZ9A` + `qf81kWc96Z8`
  (Critcake stream titles), `hGV_YCJOD3E` (Tettles short), `r4VxP_NNBFM` (Tactyks mount
  giveaway), `vrFiZ1rlGz4` (Shindigg meme short), `6HWnK5sPxb8` (Dalaran Gaming PvP duels —
  same format as the already transcript-verified skip `FyzXK8_AMQ8`). A nightly keyword
  dismissal is a budget measure, not a durable verdict: hiding these would keep them out of the
  local unfiltered, date-bounded yt-dlp sweep that is supposed to reconsider them. `seen[]`
  stays at 483, `skipped[]` at 275.
- `generalCreators[].latest` left alone on purpose — those fields hold *distilled* one-line
  reads, not bare titles.
- Standing recommendation, unchanged and now worth more: a local yt-dlp catch-up run clears all
  **20** queued videos for free, and the queue now contains the first real per-spec 12.1 guides
  (Shadarek Havoc DH, NeekapHere Retribution Paladin).

## 2026-08-13 — LOCAL run (scheduled 07:10 task), residential yt-dlp catch-up

Ran after the CI nightly (`e87054d`) had already pushed. Scope: residential-only catch-up —
transcripts, which is the one lane a datacenter runner cannot do. Tier lists and metrics were
NOT re-fetched (CI did them today); the manifest was deliberately left alone (partial run).

- **The queue drained for free.** 30 candidates: the 20 queued videos plus 10 newly discovered.
  yt-dlp (pinned 2026.07.04, `player_client=android`) got **22 of 30** transcripts. The other 8
  are not IP-blocked — YouTube has published **no auto-captions** for them (6 livestream VODs)
  or the id is still an upcoming-live placeholder (`bqVHzvKJCuA`, `U_bAsRSY5Y4`). Nothing about
  a residential IP fixes those, which is worth knowing: **they are not catch-up work, they are
  videos that may never be captioned.**
- **Discovery, unfiltered + date-bounded** as the local rule requires: 44 channels, 44/44 HTTP
  200, 0 RSS failures, 660 entries, seen-set 960 (structured lanes only). **10 unseen, all
  inside the 12.1 cycle** (≥2026-06-18, the first `ptr-builds.json` entry). All 10 are now
  accounted for — none left dangling.
- **6 takes + 1 metaNote added, 3 superseded.** Queue **20 → 8**, `skipped[]` **275 → 292**.
  - `NeekapHere` **Retribution Paladin** (nerf, both) — his full Season 2 guide. **This closes
    one of the three documented raid-scoped gaps.** His verdict is explicit: Ret is fun but "a
    little bit weak right now". The mechanism is the tier set — Divine Arbiter's damage never
    beats Final Verdict, so on Templar single target you never press Divine Storm and therefore
    **never use the four-piece at all**; same on Templar AoE and Herald AoE, leaving Herald
    single target as the only case it works. He says the shipped fix (Divine Arbiter benefiting
    from Divine Purpose and Greater Judgment) is not good enough and expects to re-cut the video
    if it is retuned. Supersedes his 07-22 M+ take.
  - `Shadarek` **Havoc DH** (buff, both) — "pretty good for raid", built around an Essence Break
    that gained ~50% on its initial hit plus 12%/35% from the tier set and 40s→30s cooldown.
    Offsetting nerfs recorded too (Immolation Aura fury 40→30, Blind Fury, Inertia bugged to
    unplayable, leech worth ~80% of its old value after the global 25% HP buff). Supersedes his
    08-11 neutral read.
  - `MadSkillzzTV` **Discipline Priest** — split by bracket because his read is: **raid** buff
    ("insane in raid", expects a nerf), **M+** nerf (not in a good state, and the raid strength
    is what blocks a key-facing buff). Plus **Holy Paladin** (buff, M+) from live 12.1 rather
    than PTR — "moves bars like no other", "the latest hotness"; supersedes his 08-09 take.
  - `Bansherz` **Marksmanship** (buff, **raid**) — boss-by-boss, "king in the raid". Kept
    complementary to his 08-11 guide take rather than superseding it (different lens). His M+
    ordering is the opposite way round (Survival ≳ BM ≳ MM, all within a couple of percent) and
    is recorded inside the claim.
- **⚠ One judgment call with a measurable published effect.** `Zorthas` **Arcane Mage** metaNote
  (mixed): a 45-second short observing that he had Arcane at S before three of the last four
  seasons and C before the fourth — and the C season was the only one Arcane was actually meta —
  then calling its current high placement "a very risky spot". **The clip ends mid-sentence
  before he names the tier.** Recorded `mixed` (a hedge on his own call, not a weakness claim)
  and NOT superseding his substantive 08-09 M+ tier-list read. Effect, measured: because the
  nudge takes the newest note per creator, his positive Arcane vote is withdrawn, corroboration
  drops from 2 creators to 1, and the +3 meta nudge switches off — **Arcane Mage M+ forecast
  82.0 → 79.0, tier unchanged at A+**, 1 cell of 80. Defensible (he is explicitly cautioning
  against his own placement, which is exactly what an abstention encodes) but it is a truncated
  45-second clip moving a published score, so it is flagged here rather than buried.
- **17 videos transcript-verified and skipped** — the durable lane, so they never cost a fetch
  again. Dispositions worth keeping: the two Kalamazi launch streams and the Dalaran/Critcake/
  Tettles/Shindigg/Bansherz VODs restate reads their live takes already carry; Tactyks' raid
  guide says on camera it avoids spec-specific material; Dalaran's "COMPLETE Season 2 M+ Guide"
  turns out to name no player spec at all (its spec-sounding words are mob names).
- **Scope-widening candidate for a human** (not acted on): `r4VxP_NNBFM` has Tactyks giving a
  real read on **Blood DK and Vengeance DH** apex-talent random defensive procs — Vengeance in
  particular, where he says you can go a long time without a proc and it feels bad. Both sit
  outside his declared Guardian/Protection scope so nothing was attributed. Vengeance DH is one
  of the remaining raid-scoped gaps, so widening Tactyks' scope would be worth considering.
- **The title filter would have missed the best of this run again.** Under the nightly's keyword
  rule the two highest-value items were not the obvious ones: NeekapHere's Ret Paladin guide was
  already queued, but `Iu_h1QuAgOc` — titled "12.1 is HERE (Healer Gearing) | *NEW* !UI !main
  !tierlist" — carried the Discipline and Holy Paladin reads 8 hours into a 509-minute stream.
- **Standing note for the queue:** 6 of the 8 remaining entries are livestream VODs with no
  published captions. The nightly's Supadata drain will spend its 100-request monthly budget
  retrying videos that likely have nothing to fetch. Worth a rule (`noCaptionsAt` marker, or a
  cap on retries per id) if the pattern holds — not changed here, since queue policy is not a
  data run's call.

## 2026-08-13 (b) — Tactyks scope widened to Blood DK + Vengeance (owner-approved)

Riley approved widening Tactyks' scope after the 08-13 local run flagged him as a
multi-tank authority registered on only two tank specs.

- **The justification changed on inspection, and the log should record why.** The local run
  cited a passage in `r4VxP_NNBFM` (mythic dungeon world tour) as "Tactyks giving a real read
  on Blood DK and Vengeance". Re-checked: that stretch is a **two-way co-stream conversation**
  and the caption track does not reliably mark speaker turns, so the Blood DK / Vengeance
  proc-rate analysis cannot be attributed to him rather than his guest. **It was not used.**
  The real basis is `TaJvkmzeJ_8` — "SEASON 2 TANK RANKINGS AND TIERLIST FOR RAID AND MYTHIC+"
  (2026-08-09), a 24-minute solo tier list that ranks **every** tank spec in both brackets.
  Single speaker, no attribution ambiguity.
- **That video was deliberately RE-OPENED.** It is already in the seen-set (cited by his 08-09
  Protection Paladin takes) — on 08-09 only Prot Paladin could be distilled from it, because
  that was his entire scope at the time. The positive reason to re-open is the scope change
  itself, per the skill's re-open rule.
- **Two raid takes added, both firewalled to raid** (he authors the Method M+ list registered
  in `sources.json`, so his M+ half stays out):
  - **Blood DK** (buff, raid) — top of his raid list, and the placement he says he is most
    willing to stand behind. Immortal and gained only DR/durability into S2; the S1 "pitiful"
    single-target damage is fixed; unique grips (Gorefiend's, Abomination's Limb) plus AMZ.
    Expects at least one in most top S2 raid comps, possibly two purely for grips.
  - **Vengeance DH** (nerf, raid) — bottom of his raid list, B tier with Brewmaster, defined
    as "only bring these if you need the raid buff". Structural reason: its damage is tied to
    its defensives, so output and survival trade against each other, worst early in the tier.
    Havoc and Devourer both competitive, so the DH buff need not cost the tank slot.
- **Measured effect before landing (real `buildPayload` pipeline), 2 cells:**
  - `Death Knight|Blood|raid` **A/73/low → A+/75/medium — a published LETTER moves.**
  - `Demon Hunter|Vengeance|raid` C/39/low → C/37/low.
  The letter move is the **v11 tank exception working as designed**: `quorumNeeded` is 1 for
  Healer/Tank, so a single creator's shrunk read (×0.33) may cross exactly one band edge. This
  is the documented cost of that decision — Blood DK's published raid letter now rests on one
  creator — so it is recorded here explicitly rather than landing quietly.

### ⚠ Finding raised for a human, NOT acted on

**The M+ firewall is being violated for Protection Paladin.** His Paladin credential says
RAID SCOPE ONLY because he authors the Method M+ tier list already in the consensus — yet two
**live** M+ Prot Paladin takes exist (`TaJvkmzeJ_8?t=538` 08-09, `C0HuvxhvNnA?t=404` 08-10),
so he is counted once in the consensus and again in the expert lane. Measured: honouring the
firewall moves `Paladin|Protection|mplus` from B/56/high to B/55/high — 1 cell, no letter
change, so the double-count is small but real and currently understates nothing dramatic.
Separately, `npm run audit:creators` flags a supersede defect on the same creator: his 08-09
and 08-10 Prot Paladin takes are both live in **both** brackets, where the newer should have
retired the older. Both are curation calls, left for Riley.

### Correction to the 2026-08-13 (a) entry — a measurement error of mine

The (a) entry's closing note claimed the specialist take lane "appears inert", citing 0 of 80
cells changing when all takes are removed. **That was wrong, and it was my test harness, not
the tracker.** I called `projectionFor` directly on raw `data/specs.json`; but `spec.outlook`
is attached by `buildPayload` (render.mjs ~1849, `outlookFor`) *before* `projections()` runs,
and line 1093 reads `const expert = outlook ? expertRead(spec, takes, bracket) : null` — with
no `outlook` on the object, `expert` is null, `expertAdj` is 0, and the whole expert lane is
silently disabled. Undecorated specs therefore make the lane look dead.

Measured correctly through `buildPayload`: **removing all specialist takes changes 69 of 80
cells**, including letter moves (Holy Paladin M+ A+→S, Assassination raid C→B) and many
confidence downgrades. The lane is load-bearing.

Two consequences for the (a) entry as written:
- **"Closes the raid gap" was right, and understated.** `Paladin|Retribution|raid` went
  B/43/**low** → B/41/**medium** — the confidence upgrade is precisely the new raid panel
  being counted as a signal. The run moved **6 cells**, not the 1 reported: Havoc raid and
  M+ (+1 each), Marksmanship raid (+1), Retribution raid and M+, Discipline M+ (−1).
- **The Arcane Mage metaNote flagged as a "judgment call with a measurable published effect"
  had NO published effect.** Real numbers: A/73/medium with and without it — identical tier,
  score and confidence. The only change is the basis string losing its `meta read +3` clause,
  because the bounded terms were already capped at the A band edge. The reported "82.0 → 79.0"
  came from the same broken harness. The curation judgment still stands on its merits; the
  alarm about it moving a published number does not.

---

- 2026-08-12 (interactive, Riley — follow-up to the morning local run's scope-gap flag).
  **Owner decision: Tactyks added to Druid with Guardian scope**; the `v6A6ntuu8t4` skip is
  re-opened (positive reason: the skip WAS the scope gap) and distilled as **one raid-bracket
  take** (mixed — the apex rework he is a fan of and Mangle "back in the conversation" vs the
  significant Lunation/Lunar Beam nerf; Alune's Chosen still the raid build, with a plea to
  buff Druid of the Claw). skipped[] 276 → 275, takes 428 → 429. Measured through the
  snapshot diff: **0 consensus, 0 forecast letters, 0 within-band scores moved** — a mixed
  take abstains from panel direction, so only the drawer changes. `audit:creators` HIGH 0.
  **The RAID SCOPE ONLY firewall travels to the Druid entry, and it was re-verified rather
  than assumed**: method.gg/guides/tier-list/mythic-plus still opens "my name is Tactyks"
  (fetched today, 4 mentions), while the raid tier-list page has ZERO Tactyks mentions — so
  raid-lens takes are clean and M+ takes double-count him into consensus + expert lane. His
  Guardian guide's whole M+ section (iron-fur rage dump, 90s Incarn feasibility, M+ build) is
  therefore deliberately NOT in the take.
  ⚠ **DRIFT FLAGGED TO RILEY, not acted on: two live `bracket: "mplus"` Protection Paladin
  takes (08-09 tier-list placement, 08-10 guide M+ section) violate the recorded RAID SCOPE
  ONLY constraint.** Three runs (07-21, 08-09, 08-10) logged M+ takes without mentioning the
  constraint — missed, not overridden (the 08-09 entry even quotes community.json's scope but
  only the specs half). The 07-21 M+ take is already superseded; the two live ones nudge the
  Prot Paladin M+ forecast under his name while his Method M+ list feeds the same cell's
  consensus. Riley to decide: retire them, or record a deliberate exception in the credential.

- 2026-08-12 (LOCAL run, ~14:3xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly, which had TRANSCRIPT API limit-exceeded and queued 13). **Queue drained + a full
  unfiltered discovery sweep.** yt-dlp (pinned 2026.07.04) fetched **14 of the 20** queued:
  4 distilled, 10 transcript-verified-skipped. Not fetchable: 4 have no auto-captions yet
  (S2EmWMIcMkw Kalamazi, c5QQHhL34f0 YoDaTV, f2ytEOVE0fY Bansherz, nvhE2iC6pBk Shindigg) and
  2 are livestreams (bqVHzvKJCuA still live, FPJHlprfCik VOD unprocessed) — all six carry
  12.1/S2 title signal so they STAY queued per the keyword rule; queue 20 → **6**.
  **Takes +6 / metaNotes +7, each superseding exactly one same-lens predecessor (6 + 7
  retired, all matched 1:1 — no over-supersession).** izen's "Season 2 M+ Meta Specs" risk
  video yielded 7 M+ metaNotes (Blood DK, Holy Paladin, Arcane, Arms, Windwalker, Balance,
  Elemental); note it is the deliberate companion to his 08-09 comp-slots video, so the
  sentiments read as caveats, not downgrades — Arcane stays **positive** ("no real danger of
  falling out of the meta"), the rest mixed with the named risk in each note. Specialist takes:
  Dalaran Gaming on Outlaw (**buff** — Killing Spree buffed into a real burst window),
  Subtlety (mixed — nerfed this time and locked into Deathstalker, still "good on paper") and
  Assassination (neutral — offered as the safe pick with tuning explicitly not final);
  MadSkillzzTV on Mistweaver (mixed — walks his own tier list back to ~B, splits raid/M+,
  still waiting on buffs); Shadarek on Devourer and Havoc (both **neutral** — Devourer ahead
  under current tuning but he explicitly refuses to forecast meta).
  **DISCOVERY: 44 channels, 0 RSS failures, seen-set 938 across the four structured lanes**;
  local rule applied — no title filter, DATE-bounded at the cycle's opening build 2026-06-18.
  8 unseen in-cycle videos, all fetched and transcript-read, **all 8 skipped** (boss guides,
  week-1 gearing routing, a PvP duel cast, a comedy short). skipped[] 258 → **276**.
  ⚠ **SCOPE GAP for a human: `v6A6ntuu8t4` — Tactyks, "12.1 GUARDIAN DRUID M+ and Raid
  Guide".** Substantive 12.1 analysis from a Method guide author (apex rework, the significant
  Lunation cooldown nerf, tier bonus putting Mangle back, Incarn uptime offsetting the lost
  Lunar Beam) — but Tactyks has **no Druid entry at all** in community.json (declared scope:
  Protection Paladin), so validation would reject the take and the skill says flag rather than
  silently widen. He opens with "another tank guide", i.e. he is running a multi-tank series;
  worth a scope decision. Not attributed this run. · npm test 377/377 pass (UI invariants
  really ran, 0 skipped), build OK. **0 consensus letters and 0 forecast letters moved**;
  7 forecast scores moved within band (Blood DK M+ −3, Elemental M+ −3, Havoc/Devourer
  raid+M+ −1 each, Outlaw raid +1), each traceable to one supersession.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 11:31Z)

**TRANSCRIPT API KEY problem: limit-exceeded — zero takes, zero metaNotes, discovery
complete.** `transcript-fetch/summary.json` (11:29:29Z) reports verdict **limit-exceeded**
on the one video it attempted (`bqVHzvKJCuA`), 1 requested / 0 fetched, "stopped early …
remaining queue untouched". Supadata's free tier is 100 requests per MONTH and the budget is
spent, so no transcript was readable. This agent fetched nothing from YouTube or any
transcript API by any means, and **no take or metaNote was added, changed or superseded.**

- **Discovery ran in full:** all **44 unique channels** polled (73 transcribable creator
  entries collapse to 41 distinct channels plus the 3 generalCreators), **44/44 HTTP 200, 0
  RSS failures**, 660 videos enumerated, diffed against a **925-id seen-set built from
  structured data only** (pending `seen[]` + `skipped[]` + `videos[]`, union every
  `youtu.be` id in a take or metaNote — never log prose).
- **17 unseen videos, all published inside the 12.1 cycle** (none predate the 2026-06-18
  opening build). The nightly keyword filter was KEPT, per the monthly-budget rule; **13 were
  queued** to `data/pending-transcripts.json`, taking the queue to **20**:
  `c5QQHhL34f0` YoDaTV (Blood DK +20 Blinding Vale) · `o-n2WU1Y-4M` and `MIOc2oeUuGk`
  Shadarek (pre-season) · `U-Xl6VINTLw` LBNinja7 (Holy Paladin S2 M+ guide) · `NsiXhBpKwaU`
  Dalaran Gaming (release-day class changes) · `f2ytEOVE0fY` Bansherz · `4zRXrqXdppg` and
  `tPzhRxJ-0Tk` Sha (S2 dungeon guides) · `nvhE2iC6pBk` Shindigg · `yxZeT9h_jyE` Kalamazi
  (12.1 day-1 gearing) · `FPJHlprfCik` Critcake · **`1GfuhNQSZvI` izen — "Season 2 Mythic+
  Meta Specs", the archetypal metaNote source and the one most worth draining first** ·
  `EBu0U1mB4oE` Maximum.
- **4 not queued, and none of them is in `seen[]` on purpose.** Three failed the nightly
  keyword filter (`M-W-g71zfIM` Shadarek boss kill, `Ifj_93twYJc` Shadarek mount PSA,
  `TgjusfTTyv0` Tettles parsing short); one PASSED the keyword filter but is **PvP-only**
  (`FyzXK8_AMQ8` Dalaran Gaming, "5v5 1v1 Duels — PvP"), and this tracker rates PvE, so
  queueing it would spend a scarce paid fetch on out-of-scope content. Keyword/scope
  dismissals are a NIGHTLY budget measure, not a durable verdict — writing them into `seen[]`
  would hide them from the local unfiltered, date-bounded sweep that is supposed to
  reconsider them. `seen[]` therefore stays at 483.
- A local yt-dlp catch-up run would clear all 20 queued videos for free; that is the standing
  recommendation while the Supadata month is spent.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 20:35Z — SECOND run of this UTC day)

**Discovery complete, zero transcripts — the Supadata month is spent.**
`transcript-fetch/summary.json` (2026-08-12T20:35:12Z) reports verdict **"limit-exceeded"** on
the single video it attempted (`bqVHzvKJCuA`), 1 requested / 0 fetched, "stopped early …
remaining queue untouched". No transcript was readable, so **0 takes, 0 metaNotes** were added,
changed or superseded; this agent fetched nothing from YouTube or any transcript API.

- **44/44 channels polled, 44/44 HTTP 200, 0 RSS failures**, 660 videos enumerated (the 74
  transcribable creator entries collapse to 41 distinct channels + 3 generalCreators).
- Seen-set built from structured data only — `seen[]` 483 + `skipped[]` 275 + `videos[]` 6 +
  185 distinct `youtu.be` ids across takes/metaNotes = **946**.
- **10 unseen videos, all published today, all inside the 12.1 cycle.** The nightly keyword
  filter was KEPT (monthly-budget rule) and **9 were queued**, taking the queue to **15**:
  `u3XBRu8FNUU` + `0461YCGqWws` (YoDaTV, San'layn Blood DK S2 keys), `AIRolVGPD9o` (Tettles,
  12.1 launch), `48CShH2iiIk` (LBNinja7, Mistweaver S2), `xytqWggnImo` (Dalaran Gaming, "class
  changes"), `Iu_h1QuAgOc` (MadSkillzzTV, healer gearing), `KIUqoNuwSEA` (Bansherz, S2 day 2),
  `U_bAsRSY5Y4` (Megasett, 12.1 achievements) and — the one worth draining first —
  **`V0KmC4qmOio` (NeekapHere, "Retribution Paladin DPS Guide (PvE) Midnight 12.1")**, since
  Retribution Paladin is one of the three specs with no raid-scoped take at all.
- The one video not queued, `j1VG7ZgUZ9A` (Critcake, "Patch day! Short afternoon stream :)"),
  carries no class/spec/12.1/Season signal in its title. As on 08-12 (11:31Z), a nightly
  keyword dismissal was **not** written into `seen[]` — that is a budget measure, not a durable
  verdict, and hiding it would keep it out of the local unfiltered, date-bounded sweep that is
  supposed to reconsider it. `seen[]` stays at 483.
- `generalCreators[].latest` was left alone on purpose: those three fields hold *distilled*
  one-line reads, not bare titles (izen's is a full meta summary), and with no transcript
  readable, overwriting them with a new title would trade information for recency.
- Standing recommendation, unchanged: a local yt-dlp catch-up run clears all 15 queued videos
  for free.

## 2026-08-11 (nightly, CI) — full discovery, zero transcripts

- **Transcript budget is gone.** `transcript-fetch/summary.json` verdict **limit-exceeded**
  on the one video it tried (`bqVHzvKJCuA`), 1 requested / 0 fetched. **Zero takes, zero
  metaNotes** added or changed; no YouTube or transcript-API fetch by the agent.
- **Discovery ran in full: 76 feeds, 76/76 HTTP 200, zero failures**, 1140 entries. Seen-set
  rebuilt from the four structured lanes = **878 ids**. 30 unique unseen videos on or after
  the cycle bound 2026-06-18; 8 unseen before it.
- **Harrek had never been polled.** His entire feed came back unseen — 8 pre-cycle videos
  (2026-05-16..06-17, appended to `seen[]`) and 6 in-cycle, including two directly on the
  **Restoration Shaman rework** for 12.1. Worth an owner look at how he was added without
  ever entering the seen-set.
- **Nine queued** (launch-eve spec analysis, keyword-filtered as the nightly must be against
  the 100/month Supadata budget): Bansherz MM Hunter S2 guide; VooDooSaurus + Jedith
  Devourer DH 12.1; LBNinja7 Mistweaver M+ S2; **Tactyks Protection Paladin 12.1** (the spec
  he was added to close); Publik Shadow Priest S2; Obli DK tier list S2; two Harrek
  Restoration Shaman videos. Queue now holds 10 against a spent budget — it drains when the
  month rolls, or in a local yt-dlp run.
- **Deliberately not queued and NOT written to `seen[]`**, so a local run can sweep them
  free: Supatease and Dalaran Gaming PvP videos (out of scope for a PvE tracker), YoDaTV's
  Twitch re-uploads, misc stream VODs.
- `latest` refreshed on the queued creators' entries, each saying plainly that the video is
  **not yet distilled** — the field is display copy, not evidence of a take.

## 2026-08-11 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up after the 10:37Z nightly)

- **Queue drained: 10 → 1.** yt-dlp fetched **9 of the 10** queued videos first try
  (`youtube:player_client=android`, json3 auto-captions, residential IP — no bot wall).
  The tenth, `bqVHzvKJCuA` (Sha, "ptr and chill"), is an **unstarted live event** and stays
  queued: neither distilled nor transcript-verified, so it does not qualify for `skipped[]`.
- **16 takes added, 9 prior takes superseded, 0 metaNotes.** Specs closed: Frost + Unholy DK
  (Obli), Marksmanship (Bansherz), Devourer (VooDooSaurus **and** Jedith — they disagree,
  both recorded), Mistweaver (LBNinja7), Protection Paladin raid + M+ (Tactyks, the spec he
  was added to close), Shadow (Publik ×2), Holy Priest raid + M+ (AutomaticJak), Arms + Fury
  (Critcake), Restoration Shaman ×2 (Harrek, both archive-only — see below).
- **The unfiltered sweep paid for itself again, exactly as the 08-08 lesson predicts.**
  Discovery: 44 feeds, **44/44 HTTP 200**, 660 entries, seen-set 895 → **25 unseen, all
  in-cycle**. Fetched **20 of 25**. Two of the takes above came from videos a keyword filter
  would have thrown away: **Critcake's Arms and Fury reads are inside a stream VOD titled
  "Season 2 waiting room - 4354io DPS Warrior"** — he says plainly that Arms is really strong
  after the final tuning pass and that Fury is underrated because Arms has the spotlight.
  **AutomaticJak's Holy Priest guide** was likewise never queued.
- **18 verified skips** recorded with reasons, the notable one being `CB24zMaVZLg` (Dalaran
  Gaming, "12.1 Full Class Changes"): it is a **full patch-notes roundup narrated spec by
  spec**, i.e. the class-tuning-roundup case the scoping rule names. Distilling it would
  double-count the official notes — already in `ptr-builds.json` and already feeding the
  outlook tally — as an independent creator vote. Left undistilled deliberately.
- **4 ids to `seen[]`**: no auto-captions exist for them at all (`jNVEgIv52hU`,
  `wa2gOzDNW_o`, `fWlOFoqepww`) or the video is blocked (`XpHP0vk2nAg`). The nightly's
  Supadata drain reads `mode=native` — YouTube's own auto-captions — so queueing a
  captionless video would spend metered budget on a guaranteed miss. Fetch broadly, queue
  narrowly.
- **`S2EmWMIcMkw` (Kalamazi) deliberately left UNSEEN** — it had not started airing at fetch
  time, so it is genuinely unexamined and must be reconsidered, not recorded as dismissed.
- **Harrek's two videos are backfill, and both land `superseded: true`.** His 06-19 read is
  downbeat ("bottom of the barrel in pure HPS", raid "just okay"); his 07-22 reaction to the
  rework is the opposite ("absurdly strong", "zero notes"). But his **08-08 take was already
  live and is newer than both**, so publishing either as live would put a stale read in front
  of the current one. Archived for the record — the flip itself is the useful artifact — and
  **0 forecast movement** results from them.
- **FOR AN OWNER LOOK — scope widening.** Harrek's 06-19 video analyses **Preservation
  Evoker** in real depth (he works the Dream Breath rank-split numbers to a ~30% per-cast
  buff and assesses Temporal Barrier and the tier set). He is scoped `Shaman: ["Restoration"]`
  only, so **no Evoker take was written**. Not overridden silently; flagged here per the
  spec-scoping rule.
- **Live-take accumulation to watch** (`npm run audit:creators` territory): Obli now carries
  2 live Frost and 2 live Unholy takes, because his 08-06 M+ read is a group-composition
  claim about Blood DK grip redundancy rather than a spec-power read — a different lens, so
  not superseded. Bansherz, Tactyks and AutomaticJak keep their tier-list placements live
  alongside the new guide takes, following the precedent set by Bansherz's own 08-08/08-09
  guide entries ("complements, not replaces").

## 2026-08-11 (nightly, CI — second run of the day) — full discovery, still zero transcripts

- **Discovery complete: 44/44 unique channels polled, 0 RSS failures, 660 videos seen.**
  (73 transcribable creator entries collapse to 41 distinct channels — many creators cover
  several classes — plus the 3 `generalCreators`.)
- **Seen-set 919 ids**, built from structured data only, never log prose: `seen[]` +
  `skipped[]` + `videos[]` in `pending-transcripts.json`, union the `youtu.be/<id>` ids in
  every take and metaNote.
- **6 new in-scope videos, all queued** (nightly keyword filter kept, per the free-tier
  budget rule — breadth belongs in local runs):
  `t0xJ5hq7D0M` YoDaTV "Everything YOU Need to Know About Azta'rec, the NEW Delve Boss, in
  Midnight Season 2" · `RcL-aP8j6eg` Jedith "Devourer Demon Hunter SIMPLIFIED Void-Scarred
  Guide for 12.1" · `dtfGf1jfRXY` MadSkillzzTV "12.1 Healer Prep & UI Setup" ·
  `VucwChHTTUk` Sha "Voidscar Arena Quick Boss Guides | Midnight Season 2" · `4dgWpFJ4sv0`
  Megasett "patch day" · `S2EmWMIcMkw` Kalamazi "Patch 12.1 Is HERE! Gearing and Slammin".
  Queue is now **7** (the 08-09 Sha "ptr and chill" is still waiting).
  Nothing was dismissed at discovery this run, so `seen[]` is unchanged — every unseen video
  in the window was either already known or is now queued.
- **TRANSCRIPT BUDGET STILL EXHAUSTED.** `transcript-fetch/summary.json` verdict
  **`limit-exceeded`** on the one video it tried (`bqVHzvKJCuA`), 1 requested / 0 fetched,
  "stopped early … remaining queue untouched". No transcript was readable, so **0 takes and
  0 metaNotes** were added, changed or superseded. This agent fetched nothing from YouTube
  or any transcript API by any means. Supadata's free tier is 100 requests/MONTH, so the
  queue will drain when the month rolls or in a local yt-dlp run — whichever comes first.
- The queue is now 7 deep with the two newest cycle-relevant specialist videos in it
  (Jedith on Devourer DH, Kalamazi on Warlock gearing). Worth a local catch-up run.

## 2026-08-10 (nightly CI, headless Opus 5, single-shot; started 11:32Z)

- ⚠ **TRANSCRIPT BUDGET EXHAUSTED.** `transcript-fetch/summary.json` verdict
  **`limit-exceeded`** on the first queued video (`_gt1uHQrh1s`, izen) — 1 requested, 0
  fetched, "stopped early … remaining queue untouched". The free Supadata tier is 100
  requests/MONTH and it is spent. Consequence: **0 takes and 0 metaNotes added or changed
  this run**, and nothing in `videos[]` could be drained. Surfaced at the top of the manifest
  summary. The four videos queued on 08-09 are still queued.
- **Discovery ran in full anyway** — 43/43 transcribable channels polled via
  `youtube.com/feeds/videos.xml`, HTTP 200 on every one, zero retries needed, and no direct
  YouTube or transcript-API access by this agent.
- **Seen-set = 742** from the four structured lanes (443 seen + 133 skipped + 4 queued +
  the youtu.be ids in takes/metaNotes), against 645 videos across the feeds. **122 unseen on
  or after the cycle bound 2026-06-18; 9 unseen before it.**
- **The 9 pre-cycle videos were appended to `seen[]`** (all Nintern, 2026-03-20 → 2026-06-15:
  12.0.x Devourer guides, a Sporefall loot overview, addon and Great Vault videos). A video
  that predates the 12.1 opening build cannot discuss the cycle, so that dismissal is durable
  and belongs in the lane — unlike a title-cost dismissal.
- **Two videos queued** (queue now 6), keyword-filtered as the nightly must be:
  · **Zorthas — "FINAL TIER LIST for Season 2 M+ Midnight" (2026-08-09)**. The highest-value
    item on the board: he is a `generalCreators` entry, so this is the `metaNotes` archetype,
    and every live Zorthas metaNote is 2026-07-30 or older — a *final* S2 M+ read two days
    before launch is exactly what that lane is for.
  · **Kalamazi — "I'm Back! Sunday PTR Slammin" (2026-08-10)**. Warlock, launch eve; he holds
    all three Warlock specs and all three are among the nine without a writeup.
  His `latest` field was refreshed to name the queued video and to say plainly that it is
  **not yet distilled** — a `latest` that implied a distilled read we do not hold would be
  worse than a stale one.
- **Deliberately NOT queued and deliberately NOT written to `seen[]`** (08-08/08-09
  precedent — dismissed on cost, not on a transcript, so a local yt-dlp run can still sweep
  them for free): YoDaTV's 8 "Everything You Need to Know About <dungeon>" Season 2 guides,
  Supatease's PvP tier list and Road-to-Rank-1 arena streams (PvP is out of scope for a PvE
  tracker), Tettles' two 2026-08-10 shorts, and the July stream-VOD backlog whose creators
  already hold newer live takes.
- Reminder to the next run: the monthly Supadata window resets before the queue does. When
  it does, `_gt1uHQrh1s` (izen, Season 2 M+ DPS meta) and `SV3Snl21XC8` (Zorthas) are the two
  that most change what the page says.

## 2026-08-10 (local run — residential yt-dlp sweep; the nightly's transcript budget was exhausted)

The run the previous entry asked for. The nightly hit Supadata `limit-exceeded` on the first
queued video and distilled nothing; this run fetched transcripts itself with yt-dlp, which is
free, so the date-bounded unfiltered sweep was affordable.

- **Discovery**: 75 pollable creators (transcribable + `channelId`), 75/75 RSS HTTP 200 after
  retry, zero feed failures. Seen-set **753** from the four structured lanes. **204 unseen
  in-scope** videos (≥ the cycle bound 2026-06-18) — but only **130 unique**: creators listed
  under several classes (YoDaTV and MadSkillzzTV under six each) are polled once per listing,
  so the raw count triple-counts. Worth remembering before anyone panics at a big sweep number.
- **Transcripts fetched: 111 of 130.** No title filtering, per the local-run rule. 19 had no
  caption track at all and 1 livestream had not finished.
- **Distilled 3 videos → 49 metaNotes + 4 takes:**
  · **Zorthas — "FINAL TIER LIST for Season 2 M+ Midnight" (2026-08-09) → 40 metaNotes**, one
    per spec: a complete pre-launch M+ read with explicit tiers for all 40. Superseded his two
    live M+-lens notes (Blood DK, Holy Paladin, both 07-30); his 07-20/07-26 **raid**-lens notes
    were left live as complementary.
  · **izen — "Season 2 Mythic+ DPS Meta" (2026-08-09) → 9 metaNotes.** Superseded 8 of his
    08-03/08-06 M+-lens notes. His `latest` was refreshed to the distilled read.
  · **MadSkillzzTV — "12.1 Healer Prep" (2026-08-09) → 4 takes** (Holy Paladin, Resto Shaman,
    Holy Priest, Mistweaver). His live 08-04 **raid**-lens Resto Shaman take was correctly left
    alone; three M+-lens takes were superseded.
- **ASR decoding worth recording**: Zorthas' captions render **Devourer** as "Devastator"/
  "Devara"/"devour" and **Assassination** as "Azshara". Devourer is not missing from his tier
  list — it is at the **top of A+**, found only by chasing the mangling. Grep for the spec name
  alone and you will wrongly conclude a 39-spec list.
- **108 videos → `skipped[]`** with per-video reasons drawn from the transcript, not the title.
  The bulk are stream VODs; the substantive ones are recorded individually (Dratnos' patch-notes
  roundups read out Blizzard's text with no independent analysis of his Arms/Fury scope;
  Supatease's 12.1 tier list is PvP, outside our brackets; YoDaTV's dungeon guides are routes).
- **18 videos → `seen[]`: no caption track exists**, so no transcript lane can ever reach them
  (mostly silent gameplay POV clips — Sam's Frost DK and Woxtoxic's Bear runs). **Not queued on
  purpose**: Supadata's `mode=native` serves YouTube's own auto-captions, the same thing yt-dlp
  found absent, so queueing them would spend the monthly budget on a guaranteed miss. Two of
  them do carry real signal — Musguete's "Outlaw Rogue is looking Good in Season 2 Raids!" and
  "ARE ROGUES BACK in 12.1?!" — and are unreachable for the same reason. Flagged, not queued.
- **Queue 6 → 1.** The survivor is `bqVHzvKJCuA` (Sha, "ptr and chill"), a livestream yt-dlp
  reports as not yet begun; it keeps its slot because captions can still appear.

### For Riley — two judgement calls left open rather than taken

- **Nintern published a full Season 2 *Havoc* Demon Hunter guide** (`dI4E9S12Uy4`, 2026-08-10:
  talents, rotation, hero talents). His `community.json` scope is Demon Hunter **[Devourer]**,
  so no take was written. This is the "creator demonstrably covers a spec outside their listed
  specs" case the skill says to surface rather than silently override — widening him to
  `["Devourer", "Havoc"]` would make it distillable next run.
- **Kalamazi maintains a 12.1 Warlock spreadsheet** he links on stream and says he has now
  expanded to cover M+. The stream transcript itself carries only a passing "Demo is good and
  consistent", too incidental to attribute; the spreadsheet is where his actual analysis lives
  and would be a `paste-discord` / manual-source candidate. All three Warlock specs are still
  among those without a writeup.

### 2026-08-10 follow-up — Riley resolved both open calls

- **Nintern widened to `["Devourer", "Havoc"]`** (Riley, this session). Not a judgement call in
  the end but a correction: his `credential` string has read *"Fel Hammer FAQ/guide writer for
  Devourer **and Havoc**"* the whole time — only `specs` never caught up, and the guide itself
  opens with him naming that exact role. Safe to edit `community.json` directly because he is
  hand-curated; `apply-community-overrides.mjs` only rewrites entries marked
  `managedBy: "overrides"` (today just MadSkillzzTV).
- **His Season 2 Havoc guide `dI4E9S12Uy4` was distilled** and left `skipped[]` (241 → 240), since
  a take now cites it. Sentiment **neutral**, and that is the whole point of the entry: he reports
  continuity, not a power swing. The substantive claims are the PTR Inertia nerf to 12% making
  Exergy the pick, the lost 6% haste from the S1 set, and — the one comparative worth having on
  file — that the S2 Havoc set is **not** a big gain, which he contrasts directly with Devourer's
  at roughly 25%. Hero talents split by bracket: Aldrachi Reaver everywhere in raid, Fel-Scarred
  in M+ unless the comp needs funnel.
- **Measured: 0 consensus letters, 0 forecast letters, 0 forecast scores.** Correct — a `neutral`
  take carries no direction. It changes the Havoc drawer, not the forecast.
- **`npm run audit:creators` surfaced a MED the moment the take landed**: MadSkillzzTV held live
  Resto Shaman takes on 08-04 and 08-09 and the audit read them as un-superseded duplicates. They
  are genuinely complementary — 08-04 is raid-lens, 08-09 is M+-lens — but neither carried an
  explicit `bracket`, so only the prose said so. Added `bracket` to those five takes to match each
  take's own `patchContext`. Verified it was a labelling fix and not a semantic one: **0 scores
  moved**, because the patchContext regex already resolved both the same way. Audit is now
  HIGH 0 · MED 0.
- **Kalamazi's 12.1 Warlock spreadsheet is NOT publicly reachable** — checked and exhausted:
  it is not in the video description (which links only socials and three **12.0** Warlock guides
  from February, correctly pre-cycle), it is served on stream by a `!spreadsheet` chat command,
  and `kalamazi.gg`'s only non-social outbound link is a Discord invite — which hard rule 6 forbids
  fetching. Riley is supplying the link.

### 2026-08-10 — kalamazi.gg, and a supersession I had to walk back

Riley pointed at kalamazi.gg after the spreadsheet hunt failed. **My first check of the site
was wrong in method**: I grepped its links with a filter that excluded `kalamazi`, which threw
away every internal page and left only a Discord invite, so I reported "nothing there". The site
in fact carries `/guides/{affliction,demonology,destruction}`, `/guides/mythic-plus` and a
Season 2 `/guides/Midnight` raid guide. Enumerate internal hrefs before concluding a site is bare.

- **The spreadsheet is still not on it.** No `docs.google`/`sheets` link on any of the five pages.
  It is served on stream by a `!spreadsheet` command and lives in his Discord. Still needs Riley.
- **Currency was verified, not assumed**: all three Warlock tier-set texts on the site reproduce
  this repo's stored **Season 2** sets exactly — including Demonology's corrected 250%/225% from
  the 2026-07-31 build, which dates the pages after it. JSON-LD `dateModified` was same-day. The
  "check the Season 1 section" line on the Destruction page is a pointer to an archive, not a sign
  the page is stale.
- **Three Warlock takes added** (his first site-sourced takes; every prior Kalamazi take is
  YouTube). Two are `neutral` **on purpose**: the site's Destruction and Affliction content is
  hero-talent choice and per-boss spec assignment, which is an *intra-Warlock* recommendation
  about which of the three to bring — not a claim about their standing against other classes.
  Filing those as `buff` would feed the projection a strength signal the source never makes.
  Demonology is `mixed` and carries the one genuine comparative: most consistent of the three in
  keys, arguably better in low-to-mid keys, may not be as strong at the high end.

**The walk-back, recorded because the failure mode is instructive.** `audit:creators` flagged MED
on Demonology — two live `both`-lens takes — so I superseded his 2026-08-08 [nerf]. That was
wrong, and the build said so: **it moved a published forecast letter, Demonology M+ B → A**, by
*deleting* his negative power read rather than by adding evidence. The 08-08 take is a tuning
assessment ("feels like doing less damage"); the site is a build/consistency guide. Different
axes, so the guardrail applies — a still-valid take stays live — and `audit:creators` is a REPORT,
not a gate, so a MED must not be paid for with a public letter move.

The right fix was to make the new take's scope honest instead: it is an **M+** comparative, so
`bracket: "mplus"`, claim trimmed to match, 08-08 restored live. That cleared the MED *and* kept
the power read. **Result: 0 consensus letters, 0 forecast letters, 5 score moves of ±1** — the
proportionate footprint for build guidance. Lesson: when an audit finding and a published letter
disagree, re-scope the new evidence before retiring the old.

- **`sites[]`**: his guide hub is now linked from Warlock, alongside the SimC APL entry. Needed
  its own `SITE_HOSTS` entry — a separate allowlist from `TAKE_HOSTS`, so two reviewed code edits,
  both committed apart from the data.

## 2026-08-09 (~05:0xZ) — LOCAL run (Opus 5; evening of 08-08 local, ~13h after the morning sweep)

- **Discovery**: 42 transcribable feeds polled, 42/42 OK, 630 videos in feed. Seen-set
  built from the four structured lanes = **693**; unseen **139**, all of them in-cycle
  (cycle bound = first `ptr-builds.json` entry, 2026-06-18; **0** pre-cycle this time).
- **Scope taken: the 23 videos published on or after 08-07** — the window the morning run
  could not have seen. The remaining **116 unseen are the older tail (07-24 and back)**
  and were deliberately NOT written into `seen[]`: they are a newest-first budget cut, not
  a durable judgment, and leaving them out of the lanes is what keeps them reconsiderable.
  There is a clean gap between 07-25 and 08-06 in the unseen set, which is the morning
  run's coverage showing through.
- **Transcripts**: yt-dlp at the `requirements.txt` pin (2026.07.04), no title filtering.
  **18 of 23 fetched.** The 5 misses, and what each actually was:
  · `J6ynDbhl9mA` (Shindigg) and `QwbvLPZTh1U` (Bansherz) are **live right now**
    (`live_status: is_live`) — no captions can exist yet. Left UNSEEN so the VOD is picked
    up next run; queueing a live stream would spend Supadata budget on nothing.
  · `vK9ttexGFVg` (Preheat, **12.1 Mage Roundtable**, 8,978s, published 00:56Z) — real
    video, auto-captions simply not generated yet. Keyword-relevant, so **QUEUED**.
  · `0nBSXCbM1AY` — the ended live VOD of that same roundtable ("This live event has
    ended"). Duplicate content, so `seen[]` rather than a second queue slot.
  · `5BLQ3yzH8JM` (Supatease, "Only Elemental Can Do This") — a **20-second** clip. The
    duration is a durable fact that rules out spec analysis, so `seen[]`, not the queue.
- **14 takes added, 10 superseded, 13 verified skips.** takes 374 to 388, skipped 99 to
  112, queue 0 to 1, seen 440 to 442. No metaNotes: the only general creator with a new
  video was Maximum, and it was Season 1 content (see skips).
  · **Tettles** (scope Balance/Augmentation) — his final pre-launch M+ DPS tier list.
    Balance M+ `mixed` (a "really good comp filler", good boss damage, behind on overall,
    carried by Mark of the Wild); Augmentation M+ `nerf` (dropped to C on the Wing Leader
    nerf killing double duplicates). His considered Arcane/Arms/Elemental/Rogue reads are
    OUT of scope and were not taken, which is most of the video's content.
  · **YoDaTV** (Blood DK · Vengeance · Guardian · Brewmaster · Paladin whole · Prot/Arms
    Warrior) — final pre-launch tier list, 6 takes: Blood DK `buff` (S+ "even after the
    most recent nerf"), Holy Paladin `buff` (S+), Arms `buff` (best melee), Prot Warrior
    `nerf` (only good where Spell Reflection is), Guardian `nerf` (all Druids not good
    enough even counting Mark of the Wild), Ret Paladin `nerf` (significantly worse than
    last season). **Brewmaster and Vengeance were deliberately skipped** — his only
    statement covering them is "everything that's not blood DK is on a similar level",
    a group remark with no spec-specific analysis.
  · **Kalamazi** (Warlock whole) — Demonology `nerf`, bracket `both`, from the closing
    assessment of his published 12.1 guide: not much changed vs 12.0, feels like less
    damage, which he calls a tuning issue that may be buffed. The hedge is carried in the
    claim text rather than softened into `mixed`, because it is a one-directional read on
    where the spec sits and he is the tracked Warlock authority.
  · **AutomaticJak** (all six healers) — 5 takes across two videos: Holy Priest raid
    `nerf` ("still really undertuned for the raid"), Disc raid `buff` ("a very powerful
    position"; his raid tier list the same day keeps it S with stackability as the
    criterion), Holy Priest **M+** `mixed` (dungeon healing and mana much better, but
    survivability still really bad — he burns extra globals on himself), Mistweaver `both`
    `mixed` (bouncing through tuning, expects a strong landing), Holy Paladin `both` `buff`
    (mechanism, not just "it heals a lot": the +30% health-pool/creature-damage change
    makes Holy Light efficient where S1 was overweight Holy Light spam, and the S2 set
    guarantees Infusion of Light).
  · One AutomaticJak line was **left undistilled on purpose**: "about average in keys …
    a good position but not a great position" is said of "priest" without naming the spec,
    and guessing between Disc and Holy would have been fabricated attribution.
- **PROJECTION EFFECT, measured through `buildPayload` BEFORE committing: 10 cells moved,
  3 letters, 0 consensus letters.** All three letters trace to the documented
  writeup-gap fallback (`verdict > expert > tally`), and all three specs have `ptr: null`:
  · **Guardian Druid M+ S/89/high to A+/75/medium.** Before, the M+ panel was too weak to
    drive (Dalaran neutral + YoDaTV `mixed`) so the outlook fell back to the tuning tally
    at +10; YoDaTV's `nerf` gives a usable panel at −4. A 14-point swing that is a lane
    change, not a ±6 adjustment. RAID is untouched (still tally +10) — v8 bracket-scoping
    working exactly as designed. Confidence drops because the tally stops counting once
    the expert lane drives; arguably more truthful, but it is a code question and a data
    run does not touch it.
  · **Discipline Priest raid A+/86 to S/89** — 2-creator quorum, healer, one band.
  · **Demonology Warlock M+ A/64 to B/56** (and raid 84 to 77) — sign flip of a panel that
    was already 1-creator expert-driven at +4, because Kalamazi's newest read replaced his
    07-27 one. Note the tension for a human: Tettles calls Demo "the best Warlock spec by
    far" and YoDaTV reads Warlock as "pretty good", but **neither is scoped to Warlock**,
    so by construction only Kalamazi's read enters. That is the design (the specialist
    wins), and it is the case to look at first if the forecast reads wrong post-launch.
- **Verified skips, with what the transcript actually turned out to be** — three of these
  are titles that would have passed a keyword filter and still had nothing:
  · `R5jz5YjVEC8` Obli "How to play Frost DK in MIDNIGHT SEASON 2" — a talents/rotation/
    gear guide end to end. Frost DK is one of the nine writeup-less specs, so the
    temptation to extract something was real; the only forward-looking line is "interested
    to see what Frost DK would be like", which is anticipation, not a read.
  · `qBM_N6qBcEc` Tactyks Temple of Sethraliss guide — pure route and mechanics. This is
    the creator whose "dungeon guide" title cost the 08-08 run a take, so it was read
    rather than filtered. This time the title was honest.
  · `Ywx2jEiYsA4` Maximum "blowing up" — 23k words of Season 1 raid-progression
    watch-along; 2 references to Season 2 in the whole transcript.
  · `VRadRMvV6sg` Supatease and `tB4eRnAqpC0` / `ZPFPKeT3NqA` — a PvP arena stream and two
    PvP-only pieces. Supatease's is the interesting one: he DOES answer "top classes for
    next season", but reasons it from DR categories, snares and the stamina increase, so
    it is a PvP read and must not vote in PvE ratings.
  · `gOpjpjBuRI4` Shindigg levelling stream — its only 12.1 content is the Subtlety bug
    description, and he is scoped to Outlaw/Assassination.
  · `3STJjc4zVB4` Tettles dev interview, `5A5VuzMcgb8` Dalaran prep checklist (17 patch
    mentions, zero spec words), `QG70vZG8b9Y` Tettles 30k-word stream (chat-answer
    fragments of the tier list already taken — recording both dilutes one creator's read),
    and three Supatease transmog shorts of 27-66 words.
- **Registry**: `Maximum`'s `latest` updated. It carried a standing note "no settled
  pre-Season-2 tier list yet as of 2026-08-04 — re-check 2026-08-08..18", and this run
  answers it: asked directly on stream he says he does not want the regular tier-list
  format because it runs too long and has not found a replacement. Still no Maximum tier
  list with 12.1 three days out.
- **Scope observation for a human — not acted on**: Tettles' tier list contains
  substantial, clearly-reasoned reads on Arcane Mage, Arms Warrior, Elemental Shaman and
  all three Rogue specs (he has 100+ PTR runs behind them), all unusable because his entry
  is scoped to Balance. That is the scoping rule working, but he may be under-scoped for
  an M+ meta lens specifically.
- `npm test` **338 pass / 0 fail**, `npm run validate` clean, `npm run audit:creators`
  **HIGH 0 · MED 0 · INFO 19** (up one: Shindigg now shows "transcribable, zero takes
  ever" — correct, this run read him and found nothing in scope).

## 2026-08-09 (nightly, CI runner)

- **42/42 channels polled**, zero RSS failures (39 specialist + 3 general; 71 class entries
  collapse to 42 distinct channels because 8 creators are registered under more than one
  class). Seen-set rebuilt from the four structured lanes = **714 ids**; **119 unseen**.
- **1 transcript available** (`transcript-fetch/summary.json` verdict `ok`, 1/1 fetched):
  **Preheat — "12.1 Mage Roundtable ft. Porom, Forgy, Khaelt, Azuna"** (`vK9ttexGFVg`,
  2026-08-09, 4488 caption chunks). Distilled **4 takes**, attributed to Preheat with the
  panel named in the claim (the AutomaticJak Pres-panel precedent):
  · Arcane **buff / raid** — the panel's de-facto Season 2 raid pick; reasons are
    defensive (Prismatic Barrier window + refractive Mirror Image) plus no mana constraint.
  · Frost **nerf / raid** — Splitting Ice + Fractured Frost cuts gut the two-target cleave
    that was ~doubling its damage on PTR; Glacial Spike does not smart-target like Ice
    Lance, so spread two-target loses most; Frost drops to the stacked-two-target bosses.
  · Frost **neutral / M+** — the uncapped-AoE hole is unaddressed (a Spellslinger can lose
    a first pull to a tank); what improved is feel, via the Frostfire set's proc rate.
  · Fire **mixed / both** — a second Blazing Barrier charge and flat aura percentages
    instead of attention; defensive budget still locked in Cauterize; nobody on the panel
    expects it competitive at Season 2 start.
  Superseded Preheat's three 2026-05-23 12.0.7-live takes for the same specs in the same
  edit; removed the video from the queue.
- **20 videos queued** for the deterministic transcript step — keyword-filtered, which the
  NIGHTLY must stay (100 Supadata requests/month): Jedith ×4, leak ×2, Bansherz, Pkpawner,
  NeekapHere ×2, Musguete ×3, Megasett, Sha, Dratnos ×2, Obli, Zorthas, Maximum.
- **The other ~99 unseen videos were deliberately NOT written to `seen[]`.** They are
  mostly key/raid POV uploads and stream VODs that a title cannot adjudicate; leaving them
  unrecorded keeps them reconsiderable by a local yt-dlp run under the cycle date bound,
  which is where breadth belongs. `seen[]` is for videos this run actually dismissed.
- **community.json left untouched.** The `latest` fields hold curated per-creator notes
  from earlier runs (scope caveats, "his last tank content predates 12.1", izen's read
  summary); overwriting them with the bare newest RSS title — which is what a mechanical
  refresh does — destroys more than it updates, and no general creator posted anything new
  since the last run anyway.

## 2026-08-09 (LOCAL run, ~14:1xZ — Opus 5; scheduled residential catch-up after the 10:37Z nightly)

- **Queue fully drained: 20 → 0.** yt-dlp at the `requirements.txt` pin (2026.07.04), no
  install/upgrade. 17 of 20 returned captions; **3 have none at all** — `k6dxaoUqKGA`
  (Musguete), `b_yyDxBT_FQ` (Musguete short), `_zGku2p5vS4` (Obli stream VOD) — confirmed
  with `--list-subs` ("has no automatic captions", "has no subtitles"). Since the queue's
  drain path is Supadata `mode=native`, which serves YouTube's OWN auto-captions, those
  three could never have drained; they would have burned 3 requests/run of a 100/month
  budget forever. Moved to `skipped[]` as UNOBTAINABLE with that reason stated — a slightly
  wider use of the lane than "transcript read", and deliberate.
- **Only 1 of the 20 queued videos could move published output.** Measured before
  distilling: every other queued video is OLDER than the same creator's existing live take
  for that spec+lens, so distilling it would have created the different-dated same-lens
  live take that creator-invariant #3 names, and `expertRead` averages a creator's live
  takes — the stale read would have diluted the current one. The queue was a backlog of
  June/July videos exposed by the 08-08 unfiltered sweep, not new material.
- **1 take added from the queue** — Bansherz / **Beast Mastery** / 08-09 / `both` / buff,
  his Season 2 BM guide (Beast Cleave to 10s giving free 100% uptime, the tier set giving
  Cobra Shot a real rotational role, and a structural call that Dark Ranger has little
  reason to be played in either bracket because the set rewards Pack Leader's only filler).
  Follows the 08-08 Survival precedent exactly: recorded as COMPLEMENTARY to his 08-07 M+
  tier placement, not superseding it, and said so in `patchContext`.
- **Lens-gap hunt came up mostly empty, and that is the useful finding.** Checked every
  queued video for a bracket its creator lacks: Musguete's Mythic Sszorak raid POV looked
  like the one raid-scoped Rogue read, but his live 07-31 takes name no bracket in
  `patchContext`, so `takeInBracket` already resolves them to BOTH brackets — and the video
  predates the 07-31 rogue buff pass he himself called a major improvement, so landing it
  live would have dragged the current post-buff read backwards. Sha's 32k-word stream was
  read specifically for a RAID-scoped tank read to close the known tank gap: there is none.
- **Declined to stretch a passing mention into a raid take** (NeekapHere). His 07-09 video
  says in one clause that Blizzard wants Ret "solid in raid" — a read of design INTENT, not
  performance. Ret raid is a prior-only projection cell where the expert ceiling is ±12, so
  one stretched clause would have moved a published letter on almost nothing.
- **Unfiltered cycle-bounded discovery sweep run** (the breadth job the 08-08 nightly
  explicitly left for a local run): 21 creators polled, **101 in-cycle unseen** (bound =
  2026-06-18, the oldest entry in `ptr-builds.json`), 0 pre-cycle, 0 RSS failures.
  Took a **newest-first cut of 3**, all uploaded TODAY and all in scope:
  · **Tactyks — "Season 2 Tank Rankings and Tierlist for Raid and Mythic+"** → 2 takes.
    Scoped to Protection Paladin ONLY (community.json), so the rest of his tank list is
    firewalled out. RAID (mixed): reworked spec reads really solid and noticeably tankier
    with good output, placed just below Blood DK, but he is explicitly two-sided on whether
    a Prot Paladin gets a raid slot given Holy Paladin's strength — he would not be
    surprised either way; he flags Twin Fangs as full of Prot-Paladin immunity and
    Avenger's Shield shenanigans. M+ (mixed): just below the top tanks, net more defensive
    than S1 (flat 10% DR on Blessed Hammer, Word of Glory overshield, both crit Wings and
    Sentinel) against shorter Wings uptime at launch and a toned-down Apex node, with the
    same two-Paladins caveat. **Superseded his 07-21 raid take** (same creator/spec/lens,
    different date); his 07-21 M+ take was already superseded with nothing live replacing
    it, so the M+ take restores a live read. ASR hazard worth recording: this transcript
    renders prot warrior as "prompt/prop warrior" and prot paladin as "prop paladin"
    inconsistently, and "protar"/"prar" at [1076] is prot WARRIOR, not paladin — attribute
    off the surrounding section, not the token.
  · Kalamazi Destruction guide and Obli Unholy guide → **skipped[]**: both pure
    build/rotation/stat guides with no standing outlook read, and both creators already
    hold live takes for those specs.
- **The remaining ~98 in-cycle unseen videos were deliberately NOT written to `seen[]`.**
  The skill says a newest-first cut should record its dismissals, but these were not
  adjudicated — they are mostly key/raid POVs and stream VODs — and the 08-08 nightly left
  them unrecorded for exactly this reason. Writing them to `seen[]` would close off the
  breadth permanently on a cut made for time, not judgment. They stay reconsiderable; the
  backlog is the main outstanding item from this run.
- Effect on published output: **0 tier letters moved.** Projection scores moved 4 cells —
  Beast Mastery raid 35→37 and M+ 58→59; Protection Paladin raid 36→32 (the 19-day-old
  "buff" read replaced by a launch-eve "mixed" one) and M+ 55→56. `audit:creators` stays
  HIGH 0 / MED 0.

## 2026-08-15 (third run of the day — nightly, headless)

- **Transcript budget is exhausted: `transcript-fetch/summary.json` verdict
  `limit-exceeded`** (requested 1, fetched 0, on `bqVHzvKJCuA`). No transcript existed to
  distil, so **0 takes and 0 metaNotes** were added and no take moved. This agent fetched no
  transcript from YouTube or any API.
- Discovery: **44/44** unique channel feeds polled with backoff, **660 entries** scanned
  against a **1035-id** seen-set built from the four structured lanes (never from log prose).
  **25 unseen.**
- **Queued 6** (nightly keyword filter applies): `shGSOb8YoMQ` YoDaTV *12.1 M+ tierlist
  update*, `oomrLdyB8YA` Jedith *Devourer hit hard by tuning*, `DMtMmUW5uRE` LBNinja7 *healer
  tuning*, `c_5u7Jpy-Uo` AutomaticJak *healer tuning + tier list updates*, `lanOZvwWzw0`
  Musguete *Assa Rogue tuning*, `OdhbpI6Mjsw` izen *final Season-2 buffs & nerfs* (metaNotes
  lane — izen is a `generalCreators` entry and is firewalled out of `takes[]`).
- **Retired 3 to `seen[]`** as durable dismissals on an explicit PvP frame: `wzynLjlZJf4`
  ("Midnight PVP Tier List Season 2"), `Fi5pYpANSQ0` ("WoW PVP Saved"), `oUjUd8kcWew`
  (Dalaran Gaming, "5v5 1v1 Duels – PvP").
- **16 left UNSEEN on purpose** — guides/routes (Tactyks, Dalaran Assassination, Megasett
  Mistweaver, Baze Fury, Sha), stream VODs and Shorts (Tettles ×2, AutomaticJak, Kalamazi,
  Critcake, NeekapHere), Maximum's live "AWTF test stream", Harrek's raw Dummy Dome pull
  footage, and the two Supatease uploads whose PvP lens is inferred rather than stated. A
  budget or title dismissal is not durable and must stay reconsiderable by a local run.
- `bqVHzvKJCuA` stays queued and stays the **suspected still-live stream** flagged 08-09.
  `yt-dlp --print` could not settle it from this runner (datacenter bot wall, as expected),
  so it was left in place rather than purged on a guess — worth one metadata check from a
  residential IP, since it is at the head of the queue and has now spent several requests.

## 2026-08-18 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up, ~3.5h after the nightly)

Queue **4 -> 0**. All four drained with yt-dlp (`player_client=android`, json3 auto-subs);
every fetch returned captions on the first attempt, so nothing was re-queued and the
Supadata monthly budget was untouched.

- `okaZqAQVRN0` **izen**, *Midnight Season 2 | Raid Specs Meta Predictions* (08-17) —
  **39 RAID-scoped metaNotes**, the counterpart to the 08-16 M+ set. This is the full-roster
  raid read; **Holy Priest is the only spec he does not cover**. He states his own caveat on
  camera (last raid testing 07-24, three to four tuning rounds since), so he reasons from
  boss damage profiles rather than sims — carried into the `patchContext` verbatim in
  substance.
  **Superseded 34 older raid-ONLY izen notes.** The `both`- and `mplus`-scoped ones were
  left alone deliberately: a raid-scoped read cannot retire a note that still carries M+
  content, and the 08-15 tuning-pass notes are exactly that shape. Supersession was computed
  with a local copy of `takeInBracket`'s own raid/mplus regexes, not by eyeballing dates.
- `x0fxEWTq3Pw` **Zorthas**, *Pre-Season Tuning Analysis & Tier List Update* (08-18) —
  **5 raid + 19 M+ metaNotes**, 24 older same-bracket notes retired. Two things worth
  keeping: he **retracts** his earlier rogue-bearish video (his log data was wrong; Atrophic
  does work on much of the new raid's environmental damage), and he announces a **content
  pause for the next few weeks** during progression, so expect no uploads from him.
  His prior `latest` claimed the 08-09 tier list was "NOT yet distilled" — that was wrong,
  40 metaNotes dated 2026-08-09 exist; corrected in the same commit.
- `jlbQAmQMRCM` **NeekapHere**, *Retribution Paladin BUFFED* (08-18) — **1 take**,
  superseding his 08-17 read (audit stayed at MED 21, confirming it retired rather than
  diluted). Sentiment recorded **`mixed`, not `buff`**: his own framing is that the +6% only
  undoes an unexplained end-of-Season-1 nerf, and that the Divine Arbiter set still forces
  the wrong spender outside Herald single target, leaving Ret mid-pack at best.
- `6MlSd4nBtrI` **Dratnos**, *RWF Preview (Recap Day 0)* — **skipped[] (verified)**.
  A multi-speaker panel: **217 speaker-change markers**, guests including Kalamazi and Tal.
  Its Warrior content is a comp-drafting prediction game, and the one analytical line —
  the most imbalanced two-target specs being Frost Mage, Arms, Outlaw and Devastation —
  **cannot be attributed to Dratnos rather than a guest**. He already carries a live Arms
  read dated 08-16. This is the durable-skip lane working as intended: the title
  ("Race to World First Preview") would have been queued again next run otherwise.

Measured effect of the whole drain: **7 projection SCORES moved, 0 projection letters,
0 consensus letters** — the ±3 meta nudge staying within-tier, as designed.

`latest` advanced for all three distilled creators. NeekapHere's standing warning
("also posts cross-class news weeklies — those must never be distilled as Paladin takes")
was preserved verbatim in the rewrite.
