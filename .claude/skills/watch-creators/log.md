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

## 2026-09-07 (nightly) — 44/44 feeds, 0 failures; 1 transcript distilled (Sha, Brewmaster M+); 1 queued

- **Discovery**: all 44 distinct transcribable channels with a `channelId` polled via the YouTube
  RSS endpoint, **0 feed failures, no retries needed**, `media:description` parsed alongside the
  title on the same pass. 660 feed entries.
- **Seen-set from the four STRUCTURED lanes only** — `seen[]` 549 + `skipped[]` 418 + `videos[]` 1
  plus every `youtu.be` id in a take or metaNote url = **1,241 ids**. `log.md` was never regexed.
  Cycle bound `Math.min(...builds.map(b => b.date))` = **2026-06-18**, taken as a DATE.
  **300 unseen in-cycle videos remain and are deliberately left UNSEEN** — budget, title and
  transport dismissals, not durable facts.
- **Transcripts: no YouTube or transcript-API request from this session.**
  `transcript-fetch/summary.json` verdict **ok** (supadata, native, ms offsets), requested 1 /
  fetched 1 / cached 0 → `oGfnWqTcrZA`, 364 chunks.
- **DISTILLED — Sha / `oGfnWqTcrZA`, "The Mythic+ Meta is Interesting..." (2026-09-06)**, a
  week-three Season 2 M+ composition read. **One take, on his ONE registered spec**: Brewmaster
  Monk, `mixed`, `bracket: mplus`, patchContext in **LIVE** era framing (not PTR). The read: the
  physical/hybrid meta has opened a genuine slot for Brewmaster — a marked softening of his
  2026-08-06 "swap back to another tank" advice — while he says plainly that Blood DK is "a little
  bit stronger", counts only **four** Brewmaster occurrences at US 20+ that are mostly the same
  players including himself, and would not slot Brewmaster into the magic-leaning CN comp without
  first dropping Elemental Shaman for something physical. Every figure and causal clause checked
  against the caption track before committing; ASR mangles ("Ellie shaman", "Ellesmere", "LE
  Shaman", "Sin Rogue") were not written as heard.
- **Supersession**: it retires his **2026-08-06** Brewmaster **M+** take (same creator, same spec,
  same lens). His **2026-08-21 live raid** take is a different lens and correctly stays live.
- ⚑ **FLAG FOR RILEY, not acted on.** The same video carries substantive M+ reads on Blood DK, Arms
  Warrior, Arcane Mage, Elemental Shaman, Feral Druid and Windwalker — all outside Sha's declared
  `specs: ["Brewmaster"]` and all deliberately NOT distilled. Note the shape: this is a cross-class
  meta read, which is the `generalCreators` metaNote lane, and Sha is not in it. Scope widening is
  an owner decision.
- **Lane hygiene**: the distilled id was removed from `videos[]` in the same edit and was in no
  other lane. Sha's `latest` advanced to a statement of what is now KNOWN.
- **yt-dlp hit the documented datacenter bot wall** ("Sign in to confirm you're not a bot") on a
  single metadata probe for a borderline `#shorts` (`4qn2cENo0Rk`, MadSkillzzTV "Best 'Easy' Healer
  in 12.1"). **Not retried**, nothing installed or upgraded. Because the sub-minute duration could
  not be VERIFIED, that id stays unseen rather than being retired on a guess.
- **Queued 1** under the nightly keyword filter (Supadata is metered): `jGeOuxbfGUo` — Kalamazi,
  "Season 2 Character & Channel Update! Future Plans Etc" (2026-09-06), a post-RWF update from a
  Warlock specialist. Deliberately NOT queued: Supatease `w7Gz-h1vDzM` (description copies the
  title — the clip-short shape, and his lane is PvP), izen `rb9dofIbc_A` (a 12.1.5 content-feature
  reveal, not a per-spec meta read), the YoDaTV/AutomaticJak/Musguete guides and every key/boss
  POV VOD (guide-shaped content yields no take).
- `npm run audit:creators`: **HIGH 0 / MED 0 / INFO 9**. Creator opinion moved no tier and no rating.

## 2026-09-06 (nightly, SECOND run of the day) — 44 channels polled, both queued transcripts landed and were distilled into 7 takes; 6 Dorki tank reads superseded; 1 queued

- **Discovery: all 44 distinct transcribable channels carrying a `channelId` polled via the YouTube RSS
  endpoint, 0 feed failures**, no retries needed, `media:description` parsed on the same pass. Seen-set
  rebuilt from the four structured lanes only (`pending-transcripts.json` `seen[]` 549 + `skipped[]` 418
  + `videos[]` 2, plus every `youtu.be/<id>` in a take or metaNote url) = **1,240 ids**; log.md was never
  regexed for ids. Cycle bound derived as `Math.min(...builds.map(b => b.date))` = **2026-06-18**, taken
  as a DATE and never as `builds[0]`. **292 unseen in-cycle videos** remain — the handed-forward backlog
  of budget and title dismissals, deliberately left UNSEEN so a later run reconsiders them.
- **The transcript step succeeded where the 2026-09-06 local retry could not.** `transcript-fetch/
  summary.json` verdict **ok**, source supadata, `mode=native`, offsets in ms: requested 2 / fetched 2 /
  cached 0 — `7XywFJ3u0YM` 272 chunks, `AeSgidbZVYU` 516 chunks. The pair had been stuck since the
  residential run hit the third-shape timedtext 429; Supadata is exempt from that IP flag, which is
  exactly the fallback's purpose. No YouTube or transcript-API request was made from this session.
- **Jedith, `7XywFJ3u0YM`, "BANG! Collapsing Star Problem Has Been SOLVED!...Sort of." (2026-09-03) —
  Demon Hunter · Devourer, `mixed`, bracket `both`, deep link t=502** (his own closing summary). A
  12.1.5 PTR PREVIEW read, labelled "NOT LIVE" in `patchContext` and carrying his own caveat that the
  changes are five weeks out. He splits the notes: the tree-agnostic Collapsing Star changes (range
  gained after the cast starts, no 5-second cooldown on a cancelled cast, fury-drain slowdown capped at
  ~1.5 full casts as the anti-cheese replacement) he calls incredible and expects to lift average
  Annihilator performance sharply, because missed Collapsing Stars and broken Impending Apocalypse ramp
  are in his view the biggest drag on ordinary players; the **Void-Scarred** rework he thinks the talent
  tree cannot afford, since his three mandatory capstones leave no points for the Apex talents and
  without those Collapsing Star "hits like a wet noodle". Every figure checked against the caption track:
  Demonic Intensity's 30% Hunt empower, Violent Transformation losing the Hunt reset (was 25% damage) and
  gaining a Soul Immolation reset, Monster Rising 15%→10% out-of-form Intellect and 15%→20% Collapsing
  Star damage — all match. Jedith is scoped to `["Havoc","Devourer"]`, so the attribution is in scope.
- **Dorki, `AeSgidbZVYU`, "OFFICIAL UPDATED SEASON 2 M+ TIER LIST | Midnight 12.1" (2026-09-05) — six
  takes, all bracket `mplus`, all superseding his 2026-08-19 reads.** He opens by saying it is time to
  redo the list and shows the old one, so this is the same lens explicitly replaced, not a parallel read;
  his own tier vocabulary is recorded in each `patchContext` (S = insane damage, A = raid-buff dependent,
  B = nothing special, C = suck). Only his six registered tank specs were attributed — every DPS and
  healer read in the video is outside his declared scope and was deliberately left undistilled.
  · **Blood DK · `buff` · t=70** — stays S, named with Holy Paladin as a proven spec, San'layn AoE
    credited; but no longer alone at the top and he would "maybe drop it a little down" the S ordering.
  · **Vengeance DH · `buff` · t=584** — the run's real movement: after its buffs he now calls it just as
    good as Blood DK and wants it in S, worse only on AoE, equal-or-better single target, Chaos Brand for
    caster groups, and first-named in the meta comp he settles on.
  · **Guardian Druid · `neutral` · t=890** — the honest weak spot: he never verbally places bear in a
    tier this time. The claim says so, and records only what he did say (bear a go-to alongside
    Brewmaster for the physical comp, "I don't think bear is necessarily bad"). Superseded anyway
    because it is the same lens redone; the claim states it is thinner than the August read rather
    than dressing it up.
  · **Brewmaster Monk · `mixed` · t=576** — A, raid-buff dependent, still the go-to with the physical
    comp; a step up from August's "distinctly mid".
  · **Protection Paladin · `nerf` · t=680** — he reverses himself on air, checking representation and
    dropping it out of the meta-contender group.
  · **Protection Warrior · `nerf` · t=693** — still lowest, but with an explicit "haven't played it
    enough to give it a fair shake" caveat that is preserved in the claim, plus his forward-looking note
    that the 12.1.5 Execute change could make it strong later (recorded as a preview expectation, not
    part of the live rating).
- **A 12.1.5 preview read does NOT supersede a live Season 2 read**, per the 2026-09-05 VooDooSaurus
  precedent — so Jedith's 2026-08-17 Devourer take stays live alongside the new preview take, and only
  the Dorki pairs were retired (6 of them, all `bracket: "mplus"`, all dated 2026-08-19).
- **Firewall re-verified rather than assumed.** All six registered tier-list pages were already fetched
  this run; a grep for "Dorki" across the Icy Veins, Method and Wowhead HTML returns nothing, and the
  Wowhead tank pages are bylined **YoDaTV** (M+) and **Dratnos** (raid). The Tactyks/Method-M+ constraint
  does not extend to him.
- **ASR discipline.** The captions render Blood DK as "bloody K", Protection as "prop", San'layn as
  "sand lane", Elemental as "Ellie", Mistweaver as "Miss Weaver", Retribution as "red paladin", and
  Void-Scarred as "void skard"/"Void's Guard"; none was written as heard — the reviewed spellings were
  used, and Void-Scarred follows the official 12.1.5 notes rather than the archive's older variants.
  One phrase in Dorki's monk composition ("arms, barrel, sin rogue") could not be resolved and was
  simply left out of the claim rather than guessed.
- **Lane hygiene (step 4a)**: both distilled ids removed from `videos[]` in the same edit; neither
  appeared in `seen[]` or `skipped[]`, so nothing else had to be dropped and no `reason` text needed
  restating here. `npm run validate` and `npm run audit:creators` both clean — **HIGH 0 · MED 0 ·
  INFO 9** (8 zero-yield transcribable creators plus the standing between-cycles dormancy line).
- **Queued 1** (nightly keyword filter KEPT — Supadata is metered and `PER_RUN_CAP` 25 is only the
  per-run guard): `oGfnWqTcrZA` — **Sha**, "The Mythic+ Meta is Interesting..." (2026-09-06). Its
  `media:description` is an explicit early-season meta-structure discussion naming specs that "haven't
  been good in a long time"; Sha is scoped to Brewmaster, so only a Brewmaster read would be
  attributable, but the video is analysis-shaped rather than a VOD. Id and author confirmed by oEmbed.
- **Deliberately NOT queued, and left UNSEEN rather than retired** (title/budget judgments, not durable
  facts): the whole Supatease block (PvP by construction); izen's `rb9dofIbc_A` 12.1.5 loot/delve reveal
  and Dalaran Gaming's `6EotvC_HxVs` / `8vM24CJGaRA` 12.1.5 feature and Labyrinth explainers (content
  coverage, not per-spec meta reads); NeekapHere's `smqnFDWL7D0`; Kalamazi's `jGeOuxbfGUo` channel
  update; Dalaran Gaming's `5x3Ws_aFLPA` gearing PSA (item-level claims are not spec reads); and the
  large tail of raid/key POV VODs and stream titles.
- **`latest` advanced only for the two creators this run actually distilled** (Jedith, Dorki), each to a
  one-line statement of what is now KNOWN — Jedith's explicitly noting the preview is not live and his
  Season 2 read still stands — never merely the newest upload title.

## 2026-09-06 (local, scheduled) — transcript drain BLOCKED: the timedtext 429 flag is live on this IP again; 0 of 2 queued videos landed

- **Why this run existed.** Tonight's nightly queued two videos it could not read from the runner:
  `AeSgidbZVYU` (Dorki, "OFFICIAL UPDATED SEASON 2 M+ TIER LIST | Midnight 12.1", published
  2026-09-05) and `7XywFJ3u0YM` (Jedith, "BANG! Collapsing Star Problem Has Been SOLVED!...Sort of.",
  2026-09-03). Draining that queue with yt-dlp from a residential IP is the standing reason a local
  run happens.
- **Both videos are real, fetchable content — the block is not about them.** `--list-subs` (never
  rate-limited) returned a full auto-caption set for each, `en` and `en-orig` included, in json3.
  Metadata fetched clean and confirms neither is a stream or a clip: both `not_live`, real durations
  (Dorki 1,033s, Jedith 550s), and the `uploader` field matches the registered creator on each.
- 🛑 **THE THIRD 429 SHAPE IS BACK** (last recorded 2026-08-23/24). The caption download 429'd on
  `AeSgidbZVYU` under `player_client=android`; the one permitted retry — after a 20s pause and
  WITHOUT the android client, which is precisely the `MdvcFzV0tmI` transient-throttle precedent —
  drew a second 429 on a different client while the info endpoint and `--list-subs` stayed healthy.
  That combination is the IP-scoped abuse flag on `timedtext`, not throttling. The run therefore
  **stopped there and never probed the second video**: SKILL.md caps a run that hits this at one
  caption probe, and every further request re-arms the flag it is waiting to have decay.
- **Consequence for the queue: both videos stay in `videos[]`, untouched. Queue 2 → 2.** Neither was
  distilled nor transcript-verified-skipped, and those are the only two exits from that lane. Nothing
  was written to `data/pending-transcripts.json`, `data/creator-takes.json` or `data/community.json`;
  no `latest` field was advanced onto a video nobody has read.
- **What the next run should do.** The flag decays after ~24–72h of zero caption traffic or an ISP IP
  rotation, so a local retry before ~2026-09-08 will most likely just spend a probe re-arming it.
  Either let Supadata drain the queue on a nightly, or ask Riley for a `cookies.txt` export — the
  authenticated lane is queue-only and exempt from this flag, and `--cookies-from-browser chrome`
  stays dead on this machine (App-Bound Encryption, not a yt-dlp version).
- **The Dorki video is the one worth having.** It is an UPDATE to the 2026-08-19 M+ tank tier list
  already distilled, so when it lands it triggers a same-lens (M+) supersede pass across his six
  scoped tank specs — Blood, Vengeance, Guardian, Brewmaster, Protection Paladin, Protection Warrior
  — rather than adding six parallel live takes.
- **Firewall re-check, recorded so the next distiller need not re-derive it.** Dorki's registered
  credential carries a Wowhead byline and Wowhead IS a registered tier-list source, but its lists are
  attributed to "Wowhead class writers", not to him, so the Tactyks/Method-M+ constraint does not
  extend here. `npm run audit:creators` is clean: HIGH 0 · MED 0 · INFO 9 (8 zero-yield transcribable
  creators plus the expected between-cycles dormancy line).
- **yt-dlp version note, no action taken.** The local binary is **2026.07.04** against the
  `requirements.txt` pin of **2026.08.19**. Not upgraded in-run, per SKILL.md — and it is not
  implicated here: the info and `--list-subs` endpoints both worked, which is not the extractor-rot
  signature.

## 2026-09-06 (nightly) — 44 channels polled, 2 transcripts distilled into 2 Devourer takes, 2 videos queued

- **Discovery: all 44 distinct transcribable channels carrying a `channelId` polled via the YouTube
  RSS endpoint, 0 feed failures**, no retries needed. Seen-set rebuilt from the four structured lanes
  (`pending-transcripts.json` `seen[]` 549 + `skipped[]` 418 + `videos[]` 2, plus every `youtu.be/<id>`
  in a take or metaNote url) = **1,238 ids**; log.md was never regexed for ids. Cycle bound derived as
  `min(builds[].date)` = **2026-06-18** (taken as a DATE, never `builds[0]`). **293 unseen in-cycle
  videos** remain — the handed-forward backlog of budget and transport dismissals, which stay UNSEEN
  on purpose so they are reconsidered rather than silently abandoned.
- **Both pre-fetched transcripts distilled; `summary.json` verdict `ok`** (supadata, `mode=native`,
  offsets in ms, requested 2 / fetched 2). Both are 12.1.5 PTR PREVIEW reads on **Demon Hunter ·
  Devourer**, and both creators are scoped to Devourer in `community.json`, so both attributions are
  in scope:
  - **Shadarek, `1fOYXu1WUEA`, "Devourer Demon Hunter 12.1.5 Changes are IMPORTANT" (2026-09-03)** —
    `mixed`, bracket `both`. Collapsing Star's added cast-range and the removal of the 5-second
    cancel lockout he expects nobody who plays Devourer to argue with, and although it is "not
    directly a buff" he expects it to raise average damage, **more in keys than in raid**; the
    Void-Scarred rework he reads as directionally right but insufficient, leaving a "very scuffed"
    tree that needs larger changes. Deep link t=257.
  - **Nintern, `JMVnCyVzlNM`, "GO BACK! | 12.1.5 PTR Devourer Patch Notes" (2026-09-03)** — `nerf`,
    bracket `both`. Same praise for the Collapsing Star half; on Void-Scarred he works the arithmetic
    (Demonic Intensity 20% -> 30% only replaces what Predator's Wake already gave, while Violent
    Transformation loses its 25% Hunt bonus AND the reset) to a net Hunt nerf, plus the out-of-form
    Intellect cut, and demonstrates on the tree that the Collapsing-Star build the changes point at
    cannot be assembled without dropping Devourer's Bite and Calamitous — "dead in the water" absent
    talent shuffling. He also rejects the developer note's stated premise. Deep link t=604.
- **Supersession: NONE, deliberately.** A 12.1.5 preview read does not replace a live Season 2 read —
  the VooDooSaurus precedent from 2026-09-05 is explicit about this — so Shadarek's 2026-08-22 live
  take and Nintern's 2026-08-09 Season 2 guide take both stay live alongside the new ones. No
  existing take was touched.
- **Lane hygiene (step 4a)**: both ids removed from `videos[]` in the same edit as the takes landed;
  neither appeared in `seen[]` or `skipped[]`, so nothing else had to be dropped and no `reason` text
  needed restating here. `npm run validate` and `npm run audit:creators` both clean (HIGH 0 · MED 0;
  the 9 INFO are the standing zero-take yield notes plus the between-cycles coverage suppression).
- **ASR discipline**: two ability names arrive mangled and were NOT written as heard. The captions
  render Soul Immolation as "Soul Annihilation"/"soul missions"/"soulation" across the two videos, so
  the reviewed spelling from the existing distilled record was used; and the talent both creators name
  as carrying most of Void-Scarred's AoE arrives as "void rain" (Shadarek) and "V-Rad" (Nintern) —
  almost certainly Eradicate, but not certainly enough to assert, so it is described functionally in
  both claims rather than named.
- **Queued 2 (nightly keyword filter kept — Supadata is 100 requests/MONTH, `PER_RUN_CAP` 25 is only
  the per-run guard):**
  - `7XywFJ3u0YM` — Jedith, "BANG! Collapsing Star Problem Has Been SOLVED!...Sort of." (2026-09-03).
    A third Devourer-scoped voice on the same 12.1.5 notes, from the creator who hosted the
    2026-08-04 Devourer roundtable.
  - `AeSgidbZVYU` — Dorki, "OFFICIAL UPDATED SEASON 2 M+ TIER LIST | Midnight 12.1" (2026-09-05).
    Direct successor to his 2026-08-19 list, which was the cycle's first tank content; he is the tank
    authority scoped to all six tank specs across five class entries.
- **Deliberately NOT queued, and left UNSEEN rather than retired** (each is a title/budget judgment,
  not a durable fact): the whole Supatease block (PvP by construction — duels, solo shuffle, PvP
  mounts, "12.1 PVP Tier List Update"; PvP reads must never vote in PvE); izen's `rb9dofIbc_A`
  12.1.5 loot/delve reveal and Dalaran Gaming's `6EotvC_HxVs` "5 Best Features" (content coverage, not
  per-spec meta reads); NeekapHere's `smqnFDWL7D0` (Retribution scope, and Retribution got no 12.1.5
  changes); Kalamazi's `jGeOuxbfGUo` channel update; and the large tail of raid/key POV VODs and
  stream titles, which the skill's own measurement says carry no spec-strength read.
- **`latest` advanced only for the two creators this run actually distilled** (Shadarek, Nintern),
  each to a one-line statement of what is now KNOWN plus the explicit note that their live read still
  stands — never merely the newest upload title.

## 2026-09-05 (nightly, FOURTH run of the day) — 44 channels, 3 transcripts distilled, 3 takes, 1 queued

- **Discovery**: all 44 distinct transcribable channels carrying a `channelId` polled via the
  YouTube RSS endpoint, **0 failures**, 15 entries each = 660 videos, `media:description` parsed
  alongside the title on the same pass. Seen-set recomputed from structured data only —
  `pending-transcripts` `seen[]` 549 + `skipped[]` 418 + `videos[]` 4, plus 266 distinct
  `youtu.be` ids across takes and metaNotes — **1,237** ids. Cycle bound derived from the
  build feed as `Math.min(...builds.map(b => b.date))` = **2026-06-18**. That leaves **288**
  unseen in-cycle videos, 193 of them keyword-relevant.
- **Transcripts**: `transcript-fetch/summary.json` verdict **ok** — 4 requested, 3 fetched
  (`58kKx4Wo0mQ` 349 chunks, `xAHhHStN2xw` 544, `qthDWT2G9NM` 536), `1fOYXu1WUEA` (Shadarek,
  "Devourer Demon Hunter 12.1.5 Changes are IMPORTANT") **error:524**, so it stays queued for the
  next drain. No YouTube or transcript-API request was made from this session.
- **Three takes distilled, one per transcript, each verified against its own caption track before
  being written** (every number checked against the referent the creator attached it to; no ASR
  mangle written as a name — "Uldir tech" is Ula'tek, "voids card/guard" is Void-Scarred, "Kamazi"
  is Kalamazi):
  · **leak — Hunter Survival, RAID, `nerf`** (`58kKx4Wo0mQ?t=2`). A structural rather than tuning
    read: Wildfire Bomb's cone only damages a mob when it reaches the CENTRE of its hit box where
    other AoE need only touch it, so it cannot hit both Twin Fangs bosses nor Ula'tek plus its
    adds (where Marksmanship's Explosive Shot can); Takedown is 8s Pack Leader / 10s Sentinel on a
    90s cooldown with Savagery costing two points for -30s against Beast Mastery's one point for
    -60s on Bestial Wrath; on heroic Ula'tek logs he puts Survival third from the bottom.
    **Supersedes his 2026-08-22 raid take** (same creator, same spec, same lens, newer date). His
    08-22 **M+** take is a different lens and stays live.
  · **Kalamazi — Warlock Demonology, M+, `buff`** (`xAHhHStN2xw?t=651`). Reads Demonology as
    "gapping" in keys and one of the best mass-AoE specs in the game, and uses that standing to
    drop the Felguard: Succubus ~1,400 DPS (~6%) ahead in single target, a further ~1.2k from
    moving the freed point to a 2% mastery node, and within ~1.5% in a 10-target AoE sim — a loss
    he calls unnoticeable precisely because damage is not the limiter, bought back as the Fel
    Hunter's 24s ranged spell lockout and purge against Axe Toss's 30s non-locking stun.
    **Supersedes his 2026-08-29 M+ take**; his 08-29 raid take stays live. Note the video's raid
    half is a per-fight PET list plus a restatement of "demo's been taking over a bit", which is
    representation and a repeat, so **no raid take was minted from it**.
  · **VooDooSaurus — Demon Hunter Devourer, `nerf`, bracket both, patchContext leading with
    "12.1.5 PTR preview — NOT LIVE"** (`qthDWT2G9NM?t=26`). Collapsing Star's quality-of-life work
    (range gained mid-cast, the 5s dropped-cast lockout gone, the Fury-drain pause capped at ~1.5
    casts) is a clear win Annihilator gets for free; the Void-Scarred rework nets a Hunt nerf
    (Demonic Intensity +5-10 points against Violent Transformation losing the reset AND its 25%
    Hunt damage outright), moves that reset to a Soul Immolation Void-Scarred never casts in Void
    metamorphosis, and drops out-of-form Intellect 15%→10% for roughly 5% less out-of-meta damage
    against Collapsing Star gaining 5 points. His verdict: melee Void-Scarred as played is dead
    while the caster build the changes point at cannot be assembled behind the bottom-of-tree
    two-point gates, so Annihilator is simply the build.
    **Deliberately NOT superseding his 2026-08-17 read**, which is a live 12.1 take — a preview of
    an unreleased patch does not replace a current read of the live spec, and the supersession
    guardrail says retire only what the new take genuinely replaces.
- **Lane hygiene (step 4a)**: all three distilled ids were checked against `seen[]`/`skipped[]` and
  none was present, so nothing had to be dropped; they left `videos[]` in the same edit.
- **Queued: exactly one** — Nintern `JMVnCyVzlNM`, "GO BACK! | 12.1.5 PTR Devourer Patch Notes"
  (2026-09-03). He is a registered Devourer/Havoc creator, so this is a second independent read on
  the same 12.1.5 Devourer section VooDooSaurus covered, which is worth one Supadata request.
  Queue is now 2 (`1fOYXu1WUEA` retry + this).
- **Deliberately not queued, and left UNSEEN rather than retired** (these are budget/title
  dismissals, not durable facts, so the next run reconsiders them): everything from Supatease and
  Dalaran Gaming, including "The Meta Has Been DECIDED" and "12.1 PVP Tier List Update (Solo
  Shuffle)" — both are PvP-framed by creator, and PvP reads must never vote in PvE; the YoDaTV /
  Bansherz / Critcake / Shadarek / Musguete / Clandon key-run and boss-POV uploads; Tactyks'
  Mythic boss guides and AutomaticJak's Resto Shaman M+ guide (guide-shaped content has yielded
  zero spec-strength reads across seven verified attempts); the vault / bonus-roll videos; and
  izen's "12.1.5 Patch | Flex Mythic Boss…", which is a patch-FEATURE reveal rather than the
  per-spec best-and-most-popular recap shape that his metaNotes come from.
- **No metaNotes this run** — no general-creator video with a per-spec season/meta read was
  transcribed.
- `latest` advanced on leak, Kalamazi and VooDooSaurus to state what was actually distilled, per
  step 4c; nobody else's was touched.

## 2026-09-05 (nightly, THIRD run of the day) — 44 channels, 1 transcript distilled, 2 takes, 4 queued

- **Discovery:** all 44 distinct transcribable channels with a channelId polled via the YouTube RSS
  endpoint, **0 failures**, 15 entries each = 660 videos, `media:description` parsed alongside the
  title. Seen-set recomputed from structured data only (pending seen[]/skipped[]/videos[] plus every
  `youtu.be` id in a take or metaNote url): **union 1233, 289 unseen, all 289 in-cycle** against the
  computed bound **2026-06-18** (the OLDEST date in ptr-builds.json, taken as a date, never an index).
- **Distilled the one pre-fetched transcript** (transcript-fetch/summary.json verdict `ok`,
  requested 1 / fetched 1, offsets in ms): Dalaran Gaming, *"5 Specs Blizzard Just SAVED In Season 2!
  (Class Buffs)"* (`Fw6_unqijso`, 2026-09-05) -> **2 M+ takes, both buff**: Feral Druid (the raid-aimed
  single-target buffs, Ferocious Bite named, become the priority damage keys demand, on top of
  best-in-class Druid party utility) and Guardian Druid (buffed enough to push high keys without
  reinventing Chosen of Elune / Moonfire / Thrash, named with Brewmaster as the sturdiest tanks
  outside Blood DK).
- **Three of the video's five specs were deliberately NOT distilled**: Demonology Warlock, Windwalker
  Monk and Brewmaster Monk. Dalaran Gaming has no Warlock or Monk entry at all — same call his own
  2026-09-01 entry records for Frost DK and Demonology. **FOR A HUMAN:** he now covers Warlock and Monk
  in round-up form often enough that widening his registered scope is worth a look; not doing it
  silently. His **Feral RAID** remark was also dropped — "it will take a little bit of time until we
  see if feral can actually compete" is anticipation, not a read.
- **No supersession.** His live Druid takes are the 2026-06-30 unscoped PTR-era pair and a 2026-08-29
  Feral RAID take — all a different lens from a live M+ read, so complementary. `Fw6_unqijso` removed
  from `videos[]` in the same edit per the one-record ladder; validation caught the overlap the moment
  the takes landed and before the queue edit, which is the check doing exactly its job.
- **Queue kept keyword-filtered** (nightly rule — Supadata is 100 requests/MONTH): 4 appended, chosen
  for a likely spec-strength read rather than a keyword hit — leak *"Wildfire Bomb Has HUGE Issues |
  Survival Needs These Changes in 12.1.5"* (chaptered mechanical critique), Kalamazi *"Demonology Is
  NOT Playing The Felguard!"* (description: "those buffs last week have shifted Demonology to a state
  of No Felguard play"), Shadarek and VooDooSaurus on the 12.1.5 Devourer changes. Nintern and Jedith
  cover the same Devourer topic and were left UNSEEN for a later run rather than spending four
  requests on one subject.
- **Left unqueued with reasons, and deliberately NOT marked seen** (they are budget/judgment cuts, not
  durable dismissals): the Supatease clips — bare descriptions copying the title, the clip-short
  shape, and his channel is the PvP lane the distillation rules exclude; Maximum's "Barista", a Twitch
  restream pointer; LBNinja7's boss-healing guide (guide-shaped); and the 12.1.5 **content-feature**
  previews from izen, Dalaran Gaming and NeekapHere, which are labyrinth/loot/mount reveals, not
  per-spec meta reads — note izen is a generalCreator, so a metaNote would have been the lane had the
  content been per-spec, and it is not.
- No transcript was fetched from YouTube or any transcript API by this session. Dalaran Gaming's
  `latest` updated on all five of his class entries to state what was actually distilled.

## 2026-09-05 (nightly, SECOND run of the day) — 2 takes + 1 metaNote from the two pre-fetched transcripts; 1 video queued

- **44 channels polled, 0 failures, 660 videos**, media:description parsed alongside the title.
  Seen-set recomputed from structured data only (pending-transcripts `seen[]`/`skipped[]`/`videos[]`
  plus every `youtu.be` id in a take or metaNote url): union **1232**, **288 unseen**, all 288 in-cycle
  against the computed bound **2026-06-18** (the OLDEST date in ptr-builds.json, taken as a date and
  not an index). 106 of the 288 match the nightly keyword filter.
- **Both pre-fetched transcripts distilled** (`transcript-fetch/summary.json` verdict "ok",
  requested 2, fetched 2, offsets in ms).
  - **Obli — "After the buffs, which DPS DK spec is better in Raid?" (Ze7qcYHcbvg, 2026-09-04) → 2 RAID
    takes**, inside his declared Frost/Unholy scope. *Frost, buff*: single target now on par with
    Unholy in the Sept 2-3 Heroic Sszorak logs, and Frost edges ahead on two-target cleave (a theme he
    sees on The Lost Explorers and Twin Fangs); he explicitly declines to name a better spec and says
    gear both. *Unholy, mixed*: he raided Mythic on it this week and "wasn't impressed with the
    damage", but keeps it ahead on the execute-heavy Coiled Altar, likes every Unholy hero build except
    Blightfall, and played Rider of the Apocalypse himself. Both **supersede his prior same-lens raid
    takes** (Frost 08-30, Unholy 08-28); his live M+ pair is untouched — different lens, complementary.
    His two-hander note (≈3-4% behind dual wield at equal gear, fine for raid) is carried as a
    weapon-choice read, not a bracket-strength claim.
  - **izen — "How HARD Are M+ Season 2 Keys?" (l6bJ-pcX-h4, 2026-09-03) → 1 metaNote.** The video is
    deliberately *not* about specs (he says so in the opening) and yielded exactly one spec-level read:
    **Holy Paladin, M+, negative** — if the season keeps leaning on rot damage and healing checks as
    keys climb he expects it to hurt Holy Paladin more than other healers, on lower flat five-target
    rot healing at the highest keys. It supersedes his 2026-09-01 Holy Paladin M+ note. The hedge is
    kept in the note text: he says "we will see if it will keep progressing down that road".
  - ⚠️ **DELIBERATELY NOT DISTILLED from the izen video**: his one clause naming Preservation Evoker and
    Restoration Shaman as "specs that could be better even right now than Holy Paladin in terms of that
    healing". It is a bare two-item enumeration with no second, spec-specific mention, which the
    list-mention rule excludes — and it would have moved two live reads on one clause.
- Era framing is **"Season 2 live"** on all three, never PTR.
- Lane hygiene: both distilled ids removed from `videos[]`; neither was sitting in `seen[]` or
  `skipped[]`, so nothing else had to be dropped. `latest` advanced for Obli (replaced — the old text
  described his now twice-superseded 08-28 read) and **appended** for izen rather than overwritten,
  because his existing entry is a 13-metaNote summary and this video is a single thin read.
- **Queued 1**: Dalaran Gaming, "5 Specs Blizzard Just SAVED In Season 2! (Class Buffs)"
  (Fw6_unqijso, 2026-09-05). The queue stays keyword-filtered because Supadata is a **100-request
  MONTHLY** budget. The other 105 keyword-matching in-cycle videos were left **UNSEEN, not retired** —
  they are budget/judgment dismissals, not durable ones: Supatease and Dalaran Gaming duel and
  patch-roundup shapes (both have long `skipped[]` precedent), boss/dungeon POVs, gearing and UI PSAs,
  RWF day recaps, and the three **12.1.5 Devourer reaction videos** (Shadarek, VooDooSaurus, Nintern),
  which belong to a cycle the owner has not opened.

## 2026-09-05 (nightly) — 12 takes from the two pre-fetched transcripts; MadSkillzzTV's healer review split raid/M+ across all seven healer specs

- **Discovery:** 44 transcribable channels with a `channelId` polled via YouTube RSS, **0 failures**,
  15 entries each = 660 videos, `media:description` parsed alongside the title. Seen-set recomputed
  from structured data only — `pending-transcripts` `seen[]`/`skipped[]`/`videos[]` plus every
  `youtu.be` id in a take or metaNote url — **union 1230**, 288 unseen, all 288 in-cycle against the
  computed bound 2026-06-18 (`Math.min` over ptr-builds dates, taken as a DATE not an index).
- **Distilled both pre-fetched transcripts** (`transcript-fetch/summary.json` verdict `ok`, requested 2
  fetched 2; no API or YouTube call from this session).
  **(a) MadSkillzzTV `MivlWUZEWOY`** "12.1 Best Healers (so far) | M+ & Raid Healer Balance"
  (2026-09-04) — **11 takes**, one per bracket per spec, covering all seven healer specs. The raid/M+
  split is the point of the video and the reads genuinely diverge: Mistweaver (raid **nerf**, the tier
  set forcing 2pc-old + 2pc-new; M+ **buff**), Holy Paladin (raid **nerf** on an unused Holy
  Light/Virtue 4pc; M+ **buff**, "probably the best healer" for keys), Discipline the mirror image
  (raid **buff** on personal damage in the double-Disc Coiled Altar comps; M+ **nerf**, the only healer
  without a 19-20 timed), Holy Priest **buff** in both, Preservation (raid **buff**, S-tier and double-
  stacked by Liquid/Echo/Method; M+ **buff**, underrated healer damage), Restoration Druid raid **buff**
  as a sleeper, Restoration Shaman M+ **mixed** — the new set is melee-comp-shaped and wasted in spread.
  **Not distilled:** the Archon M+ tier list he displays, because he says outright "This is not my tier
  list", and his expectations of future Blizzard buffs, which are anticipation rather than a read.
  **(b) Dalaran Gaming `A1PXCqNKAdo`** (2026-09-01), a 2h key stream — **1 take**: Beast Mastery Hunter
  M+ **buff**, his own-voice reaction repeated four times across the stream ("beast mastery buffs are
  looking kind of good", "just doing 200k, not breaking a sweat", "hunter damage is real good", "don't
  want to be beaten by beast master hunter in AoE"). Triaged out: Frost DK and Demonology remarks
  (second-hand — "apparently" — and both classes outside his registered scope) and the Font of Venomous
  Rage discussion (item-level AND explicitly "I heard").
- **Supersession, 11 records, same creator + spec + SAME LENS only.** Deliberately left live: MadSkillzz's
  09-01 `both`-scoped Restoration Druid read and Dalaran's 08-29 `both` Beast Mastery read, because a
  narrower successor must not retire the half it does not replace (the Kalamazi over-supersede precedent).
- **Queue:** both distilled ids removed from `videos[]` (neither sat in `seen[]` or `skipped[]`, so no
  weaker lane record to drop). Two queued for the paid drain, both RSS-verified with an author match:
  `Ze7qcYHcbvg` (Obli, "After the buffs, which DPS DK spec is better in Raid?", 09-04 — the description
  confirms a Frost-vs-Unholy raid comparison and Obli is the registered Frost/Unholy specialist) and
  `l6bJ-pcX-h4` (izen, "How HARD Are M+ Season 2 Keys?", 09-03, the generalCreators metaNotes lane).
- **286 unseen left UNSEEN**, not marked seen — budget and relevance cuts, not durable dismissals: the
  Supatease PvP block, gameplay PoVs and boss/dungeon guides, gearing PSAs, and the growing pile of
  12.1.5-changes videos which have **no lane at all** until the owner opens that cycle.
- ⚠️ **MadSkillzzTV`s `latest` is OWNER-PINNED and an agent edit of it is a no-op.** His six class
  entries carry `managedBy: "overrides"`, so `apply-community-overrides.mjs` restores the owner text at
  every prebuild — writing a fresh distillation summary there silently reverted inside the same run.
  Dalaran Gaming is not override-managed and his five entries did take the new `latest`. Do not try to
  fix this by editing `data/community-overrides.json`: it is owner-curated and Gate 0 reds the night.
- `npm run audit:creators`: **0 HIGH, 0 MED, 9 INFO** (8 transcribable-but-never-yielding creators, plus
  the standing "expert lane dormant between cycles" note).


## 2026-09-04 (nightly) — 3 pre-fetched transcripts distilled: 7 MadSkillzzTV healer takes, 3 Dalaran Gaming Rogue takes, 13 izen M+ metaNotes; 18 superseded; 2 new videos queued

- **All 44 transcribable channels with a `channelId` polled via the YouTube RSS endpoint, 0
  failures**, 15 entries each = 660 videos, `media:description` parsed alongside the title.
  Seen-set recomputed from structured data only (union **1228**); **284 unseen**, all 284 in-cycle
  against the computed bound 2026-06-18 (oldest date in `ptr-builds.json`, taken as a DATE).
- **Transcripts came from the deterministic step, as they must on a runner**:
  `transcript-fetch/summary.json` verdict `ok`, requested 3 / fetched 3. No YouTube or transcript
  API call was made from this session.
- **MadSkillzzTV `yD9mjG-ajUU` (2026-09-01, a 58-second short) — 7 takes.** Mistweaver
  (mplus buff / raid mixed), Discipline (raid buff / mplus mixed), Holy Paladin mplus buff,
  Restoration Shaman mplus buff, Restoration Druid both buff.
  ⚠️ **Preservation Evoker and Holy Priest were deliberately NOT distilled**, and this is the
  judgment call worth recording: for those two alone he switches from his own voice to *"if you
  ask a Preservation player, **they might tell you**…"* / *"you might look at a Holy Priest player
  and **they might tell you**…"*, then drops the device again for Holy Paladin and Resto Shaman
  ("**you look at** Holy Paladin who's also OP"). A rhetorical report of what a spec's own
  community says is not the creator's read — the same test that declined the Resto Druid passage
  in AutomaticJak's stream. Two positive takes were left on the table on purpose.
- **Dalaran Gaming `Kq3saXcBt10` (2026-09-02, 2h23m) — 3 takes from ONE passage.** A viewer asks
  whether this is a good season to roll a Rogue; his answer is self-anchored ("I'd say so", "I
  think so at least") and spec-specific: Subtlety **raid** buff ("really good in raids"),
  Assassination **both** buff ("so is assassination" + decent key play), Outlaw **mplus** buff
  ("a very, very meta Mythic+ spec"). The PvP half of the same answer triages out per the standing
  rule. Everything else in 2h23m is key-running commentary — the triage extractor (spec token AND
  strength token, proven on izen's transcript first at 12 hits before being trusted here) returned
  16 candidate segments and 15 were gameplay, gear or hearsay about an out-of-scope class.
- **izen `4z49EhVeP7I` (2026-09-01) — 13 metaNotes**, generalCreators lane, never `takes[]`. His
  M+ counterpart to the 08-31 raid recap, scoring the channel's own pre-season grid against two
  weeks of live results. Held: Blood DK, Holy Paladin, Brewmaster. Missed: **Demonology** is the
  big one (bottom-ranked pre-season, now 5th most popular DPS at high keys after three buff
  rounds, 5% -> 19% of keys); Assassination +14% and Subtlety +10% both rose post-grid while
  **Outlaw fell out as a relative casualty of its own class's buffs**; Retribution gained on a
  ~17% four-piece. Restoration Shaman kept its predicted popularity but not the triple-melee comp
  that justified it, and Balance/Feral are inverted (Feral ~100 score points higher, Balance
  played 4x more).
- **18 records superseded**, same creator + spec + LENS only. izen's M+-lens notes from
  `x429ozbMXnQ` / `OyIp5Ua0Qo4` / `KktdoK1OZVY` / `OdhbpI6Mjsw` retired; his 08-31 RAID recap and
  the 08-29 tuning-pass notes left live as complementary lenses.
- **Queue rewritten honestly.** The 3 distilled ids left `videos[]`; none was sitting in `seen[]`
  or `skipped[]`, so there was no weaker lane record to drop. Queued 2 (nightly keyword filter
  kept — Supadata is 100 requests/MONTH): `MivlWUZEWOY` (MadSkillzzTV, "12.1 Best Healers (so
  far) | M+ & Raid Healer Balance", 2026-09-04T08:00Z — its `media:description` confirms a healer
  tier list for raid and M+, so the description paid for itself again) and `A1PXCqNKAdo` (Dalaran
  Gaming, "BIG CLASS BUFFS ARE LIVE THIS WEEK", 2026-09-01). Both verified against the live RSS
  with an author match.
- **The other 282 stay UNSEEN, deliberately.** They are budget and relevance cuts, not durable
  dismissals. Three of them (Shadarek, VooDooSaurus, Nintern — all Devourer/12.1.5 patch-note
  reactions) are a new shape worth naming: **content about a cycle the owner has not opened has
  no lane**, `expertRead` era-filters on `PHASES.ptr.marker` which is null, so queueing them
  would spend the paid budget on takes that cannot surface. Reconsider them when 12.1.5 opens.
- `npm run audit:creators`: **0 HIGH, 0 MED**, 9 INFO (8 never-yielded creators + the standing
  "expert lane dormant between cycles" note).

- **PRUNE DEFERRED to a local run, deliberately — and the reason is structural.** This log is at
  31 entries against the header's "~20", but a NIGHTLY cannot prune safely: the 2026-08-15
  precedent is that durable rules must be promoted into `SKILL.md` *before* the entries carrying
  them are dropped, and the publish job stages only `data/`, `dist/` and
  `.claude/skills/*/log.md` (nightly.yml) — a `SKILL.md` edit made here is never committed. So a
  nightly prune can delete a rule but cannot save it. Checked before deferring: the drop range
  (11 entries) holds no rule-shaped or ⚠️-marked content, but the scan was a grep and not
  a read, which is exactly the confidence a nightly should not act on. Files are 130 KB, well under the Read tool's 262,144-byte gate, so
  nothing is broken by waiting for a run that can do both halves.
## 2026-09-04 (local, scheduled) — caption 429 on its THIRTEENTH day; queue held at 3, nothing distilled; ran BEFORE the nightly rather than after it

**The residential caption lane is still down — day 13 since 2026-08-23.** Nothing distilled, no
data file changed by this skill, `pending-transcripts.json` untouched (3 before, 3 after).

- **ONE probe this time, not two.** Previous days spent a second request confirming the block was
  endpoint-wide rather than per-video; twelve consecutive days of identical endpoint-wide results
  have settled that question, and SKILL.md's bound is "AT MOST one caption probe before stopping".
  So: `4z49EhVeP7I` (izen, "12.1 Season 2 | Mythic+ Best Specs & Meta" — the queue head and the
  highest-value item in it) with the documented `player_client=android` recipe at
  `--sleep-requests 1.5` → **HTTP 429**. Stopped there.
- **Same shape as every previous day, re-derived rather than assumed**: the watch page downloads,
  the android player API JSON downloads, subtitles resolve (`Downloading subtitles: en`), format 18
  is selected and yt-dlp writes the subtitle target path — and only the `timedtext` download 429s.
  Not the datacenter bot wall; that message never appeared. yt-dlp is at the `requirements.txt`
  pin (2026.07.04); nothing was installed or upgraded, and per the 08-24 elimination chain no
  client-side change is the fix.
- **The queue did NOT turn over since 09-03, unlike the previous run.** The same three videos are
  present (`4z49EhVeP7I` izen, `yD9mjG-ajUU` MadSkillzzTV, `Kq3saXcBt10` Dalaran Gaming), because
  this run happened ~40 minutes BEFORE today's nightly rather than after it — the 09-04 nightly had
  not fired at 14:0xZ. The Supadata drain that cleared the previous three has simply not run yet
  today. Worth stating plainly: **the 429 is still costing latency, not coverage**, and the paid
  API lane remains the designed path for this queue.
- **All three stay in `videos[]` and were deliberately NOT retired.** A transport failure is a
  transport dismissal and stays UNSEEN; filing them in `seen[]` would silently abandon three
  in-scope videos. `Kq3saXcBt10` (Dalaran Gaming, "PATCH 12.1.5 LEAKED? MAYBE NEW PTR LATER?") is
  now especially worth keeping: **its lead turned out to be RIGHT** — the 12.1.5 PTR development
  notes went up officially on 09-03 (Linxy, topic 2344395; see this cycle's ptr-watch entry). That
  does NOT promote the video to a source — it was verified against the canonical forum thread, per
  the general-creator firewall, and the thread is the citation — but it is a useful data point on
  this creator's lead quality, and the video is still worth distilling when a transcript path
  exists.
- **Still an owner decision, unchanged in shape from 08-24**: accept narrower coverage behind the
  nightly's keyword filter, raise the Supadata tier, or wait for the flag to decay. Thirteen days
  is far past the 24-72h decay the diagnosis expected, so "wait" continues to look like the
  weakest option. The authenticated fallback was again not used: moving a logged-in Google session
  around is the wrong thing for a scheduled run with nobody at the keyboard, and the
  browser-replay variant needs Riley present by construction.
- **No discovery sweep.** The reasoning differs slightly from previous 429 days and is worth
  recording: on those days the nightly had already polled all 44 channels shortly before the run,
  so a sweep was redundant. Today it has not — but the conclusion is the same, because there is no
  residential transcript path to act on a sweep's result, so it would only manufacture a backlog
  this run cannot serve, and the nightly's own discovery (with the working Supadata lane behind it)
  is due within the hour.


## 2026-09-03 (local, scheduled) — caption 429 on its TWELFTH day; queue held at 3, nothing distilled — but the Supadata lane drained tonight's nightly, so the queue is being served by its designed path

**The residential caption lane is still down — day 12 since 2026-08-23.** Nothing distilled, no
data file changed by this skill, `pending-transcripts.json` untouched (3 before, 3 after).

- **The probe was the cheap one the 08-24 addendum prescribes**, two requests total, no retry
  ladder, stopped on the first 429: `4z49EhVeP7I` (izen, "12.1 Season 2 | Mythic+ Best Specs &
  Meta") with the documented `player_client=android` recipe at `--sleep-requests 1.5` → **HTTP
  429**; one confirmation on `Kq3saXcBt10` (Dalaran Gaming) at `--sleep-requests 3` to establish
  the block is still ENDPOINT-wide rather than per-video → also **429**.
- **Same shape as every previous day, re-derived rather than assumed**: the watch page, the
  android player API and format resolution all succeed — yt-dlp resolves format 18 and writes the
  subtitle target path — and only the `timedtext` download 429s. Not the datacenter bot wall; that
  message never appeared. yt-dlp is at the `requirements.txt` pin (2026.07.04); nothing was
  installed or upgraded, and per the 08-24 elimination chain no client-side change is the fix.
- **The queue turned over completely since 09-02, which is the thing worth noticing.** The three
  videos this run probed are NOT the three the 09-02 local run left behind. Tonight's nightly
  (`b60bde2`) read its Supadata drain successfully and distilled **5 takes + 10 metaNotes**,
  clearing `nuUVv1WwfLM` / `acRd5yk-3N0` / `S2nGA4gww8I`, then queued three fresh ones
  (`4z49EhVeP7I` izen, `yD9mjG-ajUU` MadSkillzzTV, `Kq3saXcBt10` Dalaran Gaming). So the residential
  429 is currently costing **latency, not coverage** — the paid API lane is the designed path for
  this queue and it is working. That materially weakens the urgency of the owner decision below
  without removing it: the Supadata free tier is 100 requests/MONTH, so the nightly lane is a
  budget, not a substitute.
- **The AUTHENTICATED fallback was again not usable by an unattended run**, and was not worked
  around. Riley's 2026-08-24 cookies.txt exports are still on disk and SKILL.md sanctions
  `--cookies <file>` for exactly this bounded queue-only case, but moving a logged-in Google
  session around is the wrong thing for a scheduled run with nobody at the keyboard, and the
  browser-replay variant needs Riley present by construction. **Still an owner decision, unchanged
  in shape from 08-24**: accept narrower coverage behind the nightly's keyword filter, raise the
  Supadata tier, or wait for the flag to decay. Twelve days is far past the 24-72h decay the
  diagnosis expected, so "wait" continues to look like the weakest option.
- **All three stay in `videos[]` and were deliberately NOT retired.** A transport failure is a
  transport dismissal and stays UNSEEN; filing them in `seen[]` would silently abandon three
  in-scope videos, one of them (izen) a general-creator meta read and one (Dalaran Gaming) the
  source of the 12.1.5 PTR lead that the ptr-watch lane verified as unofficial tonight.
- **No discovery sweep**, same reasoning as every 429 day: tonight's nightly polled all 44
  channels ~40 minutes before this run, and there is no residential transcript path to act on the
  result, so a sweep would only manufacture a backlog this run cannot serve.


## 2026-09-03 (nightly) — 3 transcripts read: 10 izen raid metaNotes, 3 Dalaran takes, 2 Critcake takes; 3 new videos queued

- **Discovery**: all **44** transcribable channels with a `channelId` polled via the YouTube RSS
  endpoint, **0 failures**, 15 entries each = **660 videos**, `media:description` parsed alongside
  each title. Seen-set recomputed from the four structured lanes (`videos[]` / `skipped[]` / `seen[]`
  plus every `youtu.be` id in a take or metaNote url) = **1225 ids**. **275 unseen, all 275 inside
  the cycle** (bound **2026-06-18**, the OLDEST date in ptr-builds.json, taken as a DATE and not an
  index). This is a nightly, so the keyword filter governs QUEUEING: 168 of the 275 are
  keyword-relevant; the 107 that are not, and the keyword-relevant ones not queued, are **budget
  dismissals left in NO lane** so a local run reconsiders them.
- **transcript-fetch/summary.json**: verdict `ok`, requested 3 / fetched 3, all three read in full.
- **izen (Izenhart), `nuUVv1WwfLM` (2026-08-31) -> 10 metaNotes, raid lens.** His "Before & After"
  recap scores the channel's own pre-season raid predictions against live Heroic/Mythic parses and
  against what race guilds are fielding. Distilled: **Devourer DH negative** (simmed and tested well,
  now bottom half and arguably the worst caster in the game; the start-of-season tier-set cut is his
  causal claim); **Frost DK negative** (his single worst prediction-vs-reality gap, on fight profile
  rather than tuning); **Windwalker negative** (squishiest DPS alongside Balance, no full raid buff to
  lean on); **Havoc mixed** (taking Devourer's slot on MOVEMENT, not damage — both "midling to
  average"); **Marksmanship positive** (burst niche, double-MM in the race, with his own ceiling
  caveat); **Subtlety / Assassination / Outlaw positive** (post-testing buffs nobody got to test);
  **Balance positive** (add-slop AoE on Ula'tek plus the incoming 4%); **Arms positive** (best melee
  performer alongside Sub, two-target cleave). Each superseded izen's prior RAID-lens metaNote for
  that spec (10 superseded); his M+ and unbracketed notes are a different lens and stay live.
  **Outlaw's entry carries his own one-log caveat in the note** — he ranks it first on Zorak and then
  says that rests on a single logged parse. **Not distilled**: the bare enumeration of top Mythic
  results (all three Warlocks / Arcane / Shadow "all the way over there") is a list-mention, not a
  read; the Vengeance passage is explicitly hypothetical ("the biggest cooking play some of these top
  guilds MIGHT do"); Fire and Frost Mage appear only inside enumerations.
- **Dalaran Gaming, `acRd5yk-3N0` (2026-08-29) -> 3 takes.** His class-by-class walkthrough of the
  September 1 PvE pass — same shape as the 08-22 video that was distilled before, so the precedent is
  in the data. In-scope: **Feral Druid (buff, raid)** — he says Feral's raid value has fallen
  drastically this expansion and splits the pass by where it lands rather than quoting the headline;
  **Beast Mastery Hunter (buff, both)** — the 7% covers pet AND abilities, which is why he thinks it
  moves the spec; **Survival Hunter (buff, both)** — same shape, stated intent is to pull SV and BM up
  to Marksmanship, hedged on magnitude not direction. Superseded his general-lens 2026-06-25 BM and
  Survival takes (same creator, spec, lens); the Feral take is raid-scoped and does NOT retire his
  general 06-30 Feral take. **His Frost DK, Demon Hunter, Protection Paladin and Discipline Priest
  passages are substantive but fall outside his registered classes and were NOT distilled.** His
  Arcane line ("arcane already is really the better option") was deliberately **not** minted: it is
  thinner than his live 2026-08-24 Arcane take and would have displaced it for nothing.
- **Critcake, `S2nGA4gww8I` (2026-08-29) -> 2 takes, M+ lens.** The intro is a real read from the
  registered Arms/Fury specialist, on his own character with the new four-piece finally equipped:
  Arms and Fury are very close in keys, Arms does more priority damage, Fury very similar overalls,
  and he cannot say which is better — "which is a good situation to be in". Logged as **neutral** for
  both specs, which is a parity read he genuinely expressed, not a placeholder. It supersedes his
  2026-08-26 Fury M+ take, which had deferred exactly this comparison until the four-piece landed, and
  the two 2026-07-09 Arms M+ takes (same lens, PTR-era build commentary — superseded, never deleted).
  The remaining ~25 minutes is the key run with co-streamers and carries no further read; ASR gives no
  speakers, so nothing was attributed from it.
- **Queued 3** (keyword-relevant, no fetched transcript): izen `4z49EhVeP7I` (2026-09-01, the **M+
  counterpart** to the raid recap distilled tonight — highest-value item in the queue),
  MadSkillzzTV `yD9mjG-ajUU` (2026-09-01, a healer-balance short covering M+ and raid, and healer raid
  reads are the thin lane), Dalaran Gaming `Kq3saXcBt10` (2026-09-02, the "PATCH 12.1.5 LEAKED? MAYBE
  NEW PTR LATER?" stream — a ptr-watch LEAD to verify against the canonical thread, not a source).
  Supatease's week was again NOT queued: PvP-framed by construction. AutomaticJak's Resto Shaman M+
  guide and the boss/dungeon guides were not queued either — guide-shaped content yields no take.
- `npm run audit:creators` clean at **HIGH 0 / MED 0**, INFO 9 (eight zero-yield transcribable
  creators plus the standing "expert lane dormant between cycles" note).
## 2026-09-02 (local, scheduled) — caption 429 on its ELEVENTH day; queue held at 3, nothing distilled; the authenticated bridge was NOT available to an unattended run

**The residential caption lane is still down — day 11 since 2026-08-23.** Nothing distilled, no
data file changed by this skill, `pending-transcripts.json` untouched (3 before, 3 after).

- **The probe was the cheap one the 08-24 addendum prescribes**, and it was spent on the queue
  rather than on breadth: a single caption request on `nuUVv1WwfLM` (izen, "Midnight Season 2 |
  Best DPS & Raid Meta - Before & After Pre-Season Tier Lists") with the documented
  `player_client=android` recipe → **HTTP 429**. One confirmation on `acRd5yk-3N0` (Dalaran
  Gaming) at `--sleep-requests 3` to establish the block is still ENDPOINT-wide rather than
  per-video → also 429. Two requests total, no retry ladder, stopped there.
- **Same shape as every previous day, re-derived rather than assumed**: the watch page, the
  android player API and format resolution all succeed — durations, titles and channel names
  read clean — and only the `timedtext` subtitle download 429s. Not the datacenter bot wall;
  that message never appeared. yt-dlp is at the `requirements.txt` pin (2026.07.04); nothing was
  installed or upgraded, and per the 08-24 elimination chain no client-side change is the fix.
- **The AUTHENTICATED fallback was not usable by this run, and that is the honest reason the
  queue did not drain.** Riley's cookies.txt exports from 2026-08-24 are still on disk, and
  SKILL.md sanctions `--cookies <file>` as the durable lane for exactly this bounded
  queue-only case. Handling that credential file was **blocked by the harness permission
  classifier**, and the block was respected rather than worked around: an unattended scheduled
  run is the wrong place to be moving a logged-in Google session around, and the browser-replay
  variant of the fallback needs Riley present at the keyboard by construction. **This is an
  owner decision to surface, not an agent call** — the options are unchanged from 08-24 (accept
  narrower coverage behind the nightly's keyword filter, raise the Supadata tier, or wait for
  the flag to decay), with the new datum that eleven days is well past the 24–72h decay the
  diagnosis expected, so waiting is looking like the weakest of the three.
- **All three stay in `videos[]` and were deliberately NOT retired.** A transport failure is a
  transport dismissal and stays UNSEEN; filing them in `seen[]` would silently abandon three
  in-scope videos, one of them (izen) a general-creator meta read. The nightly's Supadata drain
  remains their designed path.
- **No discovery sweep**, same reasoning as every 429 day: the nightly's ran on 09-01 (44/44
  feeds clean) and there is no transcript path to act on the result, so a sweep would only
  manufacture a backlog this run cannot serve.

## 2026-09-01 (nightly) — 44 channels polled, 3 transcripts read → 1 take + 2 verified skips, 3 queued

- **Discovery**: all 44 transcribable channels with a `channelId` polled via the YouTube RSS
  endpoint, **0 failures**, 15 entries each = **660 videos**, `media:description` parsed
  alongside every title. Seen-set recomputed from the four structured lanes (`videos[]` /
  `skipped[]` / `seen[]` plus every `youtu.be` id in a take or metaNote url) = **1222 ids**.
  **254 unseen, all 254 inside the cycle** (bound **2026-06-18**, the OLDEST date in
  `ptr-builds.json`, taken as a date and not an index). This is a nightly, so the keyword
  filter governs QUEUEING: 174 of the 254 are keyword-relevant and 171 of those are budget
  dismissals left in **NO lane**, so a local run reconsiders them.
- **Distilled — 1 take.** Obli `wPDn4G-8JNs` "New Frost Single & Two target buffs coming on
  Tuesday!" (2026-08-30) → **Frost Death Knight, raid, sentiment buff**. He works the Sept 1
  values off his own logs (Howling Blast +15% also lifting Cryogenic Chamber because it stores
  Howling Blast damage; two main-target hits under Northwinds), sizes the whole thing at about
  6.5% single-target / 5% two-target ≈ 5–7M on his logs, and lands on "truly middle of the
  pack" / "the damage is just mid" — not enough for Hall of Fame guilds given DK brings only
  grip, but "absolutely fine" for ordinary raiders, no longer sandbagging. His 2026-08-28 Frost
  RAID take (sentiment nerf) is superseded — same creator, spec and lens; his 08-28 Frost **M+**
  take and both Unholy takes are a different lens and stay live.
- **Verified skips — 2**, both moved to `skipped[]` with the reason recorded there:
  · Whispyr `1qclgMKPdz4` "Fatebound is BACK…" — an Assassination hero-tree/BUILD and
    sim-correctness video (Fatebound over Deathstalker on execution cost against a ~2% lead
    inflated ~1.3% by a Mass Casualty single-target sim bug; Font of Venomous Rage under-simming
    by 25% from a missing null tick; a Wowhead guide pass). Every claim is hero-tree, trinket or
    guide-level → guide-shaped content rule, no take.
  · Shadarek `DJCr5_KFzcM` "Havoc DH new BiS Gear Setup and Post-Buff Sims" — a BiS-list update.
    The Sept 1 +4% is one input to the sim number (top build 254k) and is never compared against
    another spec; the substance is Font (mastery) displacing Heart of Vultalec (crit) and the
    stat-order consequences → gear-level claim rule, no take.
  Neither was minted as a filler `neutral`: a transcript with no comparative read goes to
  `skipped[]`, which is exactly what happened.
- **Queued 3** (narrow, per "fetch broadly, queue narrowly" — Supadata is a 100-request MONTHLY
  budget and September's just opened): izen `nuUVv1WwfLM` "Best DPS & Raid Meta — Before & After
  Pre-Season Tier Lists" (2026-08-31; general-creator **metaNotes** lane, its description
  promises a week-1/2 outcome-vs-PTR-prediction comparison, which is the archetype);
  Dalaran Gaming `acRd5yk-3N0` "New Buffs For Season 2! Class Tuning Coming with Weekly Reset"
  (2026-08-29); Critcake `S2nGA4gww8I` "Arms owns. +18 Ruby Life Pools" (2026-08-29 — a
  registered Arms/Fury specialist making an M+ placement claim in the title itself).
- **Deliberately NOT queued** despite matching keywords: Supatease's week (PvP-framed by
  construction — "Best PVP Classes 12.1", "Midnight PVP Tier List Season 2"), the large
  boss/dungeon-POV blocks from YoDaTV, Shindigg, Critcake, Reholy, Clandon, Megasett and
  Bansherz, Tactyks' boss guides, and the gearing/vault videos (Kalamazi, Sha, Dalaran's
  "Gearing is BROKEN") — all budget dismissals, all left UNSEEN.
- `npm run audit:creators` clean: **HIGH 0 · MED 0**, INFO 9 (8 zero-yield transcribable
  creators, plus the standing "expert lane dormant between cycles" note — `PHASES.ptr` is null,
  so the per-spec coverage sweep is suppressed and that is not data loss).

## 2026-08-31 (nightly) — 44 channels polled, 4 transcripts distilled into 15 takes + 24 metaNotes, 2 queued

- **Discovery: 44 unique transcribable channels, 0 RSS failures, 660 entries.** Seen-set
  recomputed from the four structured lanes (videos[] / skipped[] / seen[] / take+metaNote
  urls) = **1220 ids**, of which 250 come from take urls. **245 unseen videos, all 245 inside
  the cycle** (bound = 2026-06-18, the OLDEST date in ptr-builds.json, taken as a date and
  not an index). This is a nightly, so the keyword filter stays on for QUEUEING: those 243
  not queued are budget dismissals and are deliberately left in NO lane, so a local run
  reconsiders them.
- **Four pre-fetched transcripts, all distilled, none skipped.** `transcript-fetch/summary.json`
  verdict `ok`, requested 5 / fetched 4; `1qclgMKPdz4` (Whispyr) came back `unavailable` and
  stays queued.
  - **LBNinja7 `pdYpGLyZ7VM`** (2026-08-29) → **3 takes**, bracket `both`: Mistweaver a buff
    he expects to make it "a force to be reckoned with in raid" (and he names what the 5%
    does NOT buff — Ancient Teachings and SCK healing in keys); Restoration Druid buffed but
    already fine, the change he calls least needed; Discipline Priest mixed — glad of the
    Shadow Mend reduction, but "still stuck back in 2024" on mana and needing more.
    **Two asides deliberately NOT logged**: "holy's actually in a good spot" (Holy PALADIN,
    not Priest — the transcript reaches it through "any Paladin changes? prot only") and "no
    Shaman changes, Shaman's in a very good spot". Both are no-change remarks in a tuning
    reaction, and logging them would have clobbered two substantive 08-15 takes at the same
    lens with a passing line. Left for a video that actually argues them.
  - **Kalamazi `z_dKoGx_FIk`** (2026-08-29) → **5 takes**: Demonology M+ ("quite possibly the
    highest overall output damage spec in M+ right now", ST sim 205k → 228-232k, limited by
    utility not damage) and raid (taking over the cleave bosses); Hellcaller Affliction raid
    (the THC/Spire Coiled Altar pick) and M+ (universal Agony buff, hybrid Seed builds);
    Destruction M+ mixed (static at ~230k, strong only where mobs stay in Rain of Fire and
    Cataclysm — "doesn't perform the best" in pugs). His raid Destruction take from 08-26
    left LIVE: this video says nothing new about it.
  - **YoDaTV `xYXkZA1L490`** (2026-08-29) → **7 M+ takes**, all inside his registered tank +
    Paladin + Prot/Arms Warrior scope: Vengeance to S and possibly the best tank on the 4%
    damage-taken buff (and he retracts his own "Aldrachi cope" — Annihilator is better),
    Guardian level with it, Blood DK / Arcane / Holy Paladin / Arms unchanged as the best
    four, Brewmaster A+ as the preferred fiscomp tank, Protection Warrior unchanged in A,
    Protection Paladin left in A because ~5% damage does not fix post-Reflection-of-Radiance
    survivability. ⚠️ **One take declined on ASR**: the passage that appears to move
    Retribution to A+ reads "Brett's most recent buffs…", and the referent cannot be pinned
    without guessing at the mangle. A claim must rest on the source it deep-links, so it was
    dropped rather than written; the 08-22 Retribution take stays live.
  - **izen `bDElWkJxvtY`** (2026-08-29) → **24 metaNotes** (general-creator lane, never takes):
    every spec in the September 1 pass weighed against live Heroic/Mythic parses and M+
    score/damage/popularity charts. Highlights: Frost DK last in the raid on Mythic and
    second-last on Heroic; Feral weakest in Mythic yet the fourth-highest M+ average score;
    Balance top five in raid only because the early bosses cleave; Resto Druid mid-pack in
    raid but the least represented healer in high keys; Mistweaver "still not enough … to
    become decent"; Marksmanship left unbuffed precisely because it is performing; Prot
    Paladin's 150% Blaze of Glory worth ~3% of its damage; Augmentation the one bottom spec
    given nothing. **The opening list-mention was dropped per the list-mention rule** — Arcane,
    Arms, Elemental, Marksmanship, Blood DK, Holy Paladin and Preservation are named only as
    "specs whose players might have been sweating", which is not a spec read (Marksmanship
    and Arcane are logged from their own later, argued passages instead).
- **Supersession:** 15 same-creator/same-spec/same-lens takes and 20 izen metaNotes retired.
  Cross-lens pairs left alone — a prior `both` or unbracketed note is not the same lens as a
  new `raid` or `mplus` one.
- **Queued 2** (keyword-relevant, no fetched transcript): Obli `wPDn4G-8JNs` "New Frost Single
  & Two target buffs coming on Tuesday!" and Shadarek `DJCr5_KFzcM` "Havoc Demon Hunter new
  BiS Gear Setup and Post-Buff Sims". Queue is now 3 including the unavailable Whispyr video.
- `latest` advanced on all four creators to what this run actually distilled, never to a
  fresher title.

## 2026-08-31 (local, scheduled) — caption 429 on its FIFTH consecutive day; queue held at 5, nothing distilled

- **The anonymous residential caption lane is still 429.** One probe only, on the queue's head
  (`pdYpGLyZ7VM`, LBNinja7), with the skill's pinned recipe (`--extractor-args
  youtube:player_client=android --write-auto-subs --sub-langs en --sub-format json3
  --sleep-requests 1.5`, yt-dlp at the `requirements.txt` pin 2026.07.04). The info endpoint
  answered fine — webpage and android player API both fetched, subtitle track `en` detected and
  selected — and then the `timedtext` request failed `HTTP Error 429: Too Many Requests`. That
  is the IP-scoped abuse-flag shape, not throttling: the block sits on captions alone while
  metadata flows. **No retries, no client-shuffling, no backoff ladder, and no second video** —
  with the flag up, probing the other four would only spend goodwill on the one endpoint still
  answering.
- **Day five, and the relapse is now longer than the remission.** Clear 08-25 and 08-26; blocked
  08-27, 08-28, 08-29, 08-30 and 08-31. The 08-27 reading — that the 08-25 clearing was a
  remission rather than a fix — has five days behind it. **The residential yt-dlp caption lane
  should no longer be planned around**, and a scheduled run cannot fix it by trying harder.
- **The authenticated fallback still has no usable credential, and this run re-checked rather
  than assuming.** `~/Downloads/cookies.txt` is the SAME file the 08-30 run characterised:
  792 bytes, mtime Aug 24 21:24, and its first line is `# robots.txt file for YouTube`. It is a
  robots.txt, not a Netscape cookie export — no cookie records, no youtube.com domain. Only the
  file's size, mtime and first line were read, which is all that is needed to tell an export
  from a non-export; no browser cookie store was touched, and none should be. **If Riley wants
  this lane available to scheduled runs it needs a genuine Netscape-format export from a
  private window** — the 08-24 file will never work regardless of who reads it.
- **Queue deliberately UNCHANGED at 5** (`pdYpGLyZ7VM` LBNinja7, `z_dKoGx_FIk` Kalamazi,
  `bDElWkJxvtY` izen, `xYXkZA1L490` YoDaTV, `1qclgMKPdz4` Whispyr). **Nothing moved to
  `skipped[]`**: a skip is a DURABLE claim that the transcript was read and held nothing, and a
  transport 429 is not that — writing one would permanently retire a video nobody has read. All
  five carry keyword-shaped titles the nightly's own filtered discovery already queued, and they
  drain through Supadata on a different network path, proven unaffected by this flag.
- **No unfiltered breadth sweep, on purpose** (the 08-27 → 08-30 reasoning, unchanged): the
  local run's breadth privilege is that yt-dlp is free, and with captions 429ing a wider sweep
  yields no transcripts and therefore no takes. It would only spend the info endpoint's goodwill.
- **0 takes, 0 metaNotes, 0 videos distilled or skipped.** `creator-takes.json` and
  `pending-transcripts.json` are both byte-identical to HEAD.

## 2026-08-30 (local, scheduled) — the caption 429 is on its FOURTH consecutive day; queue held at 5, nothing distilled

- **One caption probe, one 429, stopped there** — the skill's rule, not a judgement call.
  `--list-subs` on the queued Whispyr video `1qclgMKPdz4` succeeded and returned the full
  auto-caption language table, so captions exist and the info endpoint is healthy; the single
  caption download that followed returned `ERROR: Unable to download video subtitles for 'en':
  HTTP Error 429: Too Many Requests`. That is the persistent IP-scoped abuse-flag shape on
  `timedtext`, not throttling. No retries, no client-shuffling, no backoff ladder.
- **Day four puts this PAST the skill's 24–72h decay window.** The relapse pattern is now
  clear 08-25, clear 08-26, blocked 08-27, 08-28, 08-29 and 08-30. The 08-27 reading — that
  the 08-25 clearing was a remission rather than a fix — has four days behind it. The
  residential yt-dlp caption lane cannot be treated as a reliable catch-up route, and a
  scheduled run cannot fix that by trying harder.
- **The authenticated fallback was again NOT usable, and the reason is now a FILE reason, not
  a harness one.** The `cookies.txt` in `~/Downloads` that the 08-28 run recorded as
  present-but-unreadable was read this run — and it is **not a cookie export at all**: 792
  bytes whose entire content is a `robots.txt` (`User-agent:` / `Disallow:` / `Sitemap:`
  lines, no cookie records, no youtube.com domain). So even with the permission question
  settled the owner-approved lane has no usable credential on disk. If Riley wants that lane
  available to scheduled runs, it needs a genuine Netscape-format export from a private
  window — the 08-24 file will never work no matter who can read it.
- **Queue deliberately UNCHANGED at 5** (`pdYpGLyZ7VM` LBNinja7, `z_dKoGx_FIk` Kalamazi,
  `bDElWkJxvtY` izen, `xYXkZA1L490` YoDaTV, `1qclgMKPdz4` Whispyr). Nothing moved to
  `skipped[]`: a skip is a DURABLE claim that the transcript was read and held nothing, and a
  transport 429 is not that. All five are keyword-shaped titles the nightly's own filtered
  discovery already queued, and they drain through Supadata on a different network path —
  proven unaffected by this flag by the 08-30 nightly, which fetched 2 of 3 while this lane
  was blocked.
- **No unfiltered breadth sweep, on purpose** (the 08-27/08-28/08-29 reasoning, unchanged):
  the local run's breadth privilege is that yt-dlp is free, and with captions 429ing a wider
  sweep yields no transcripts and therefore no takes — it would only spend the info endpoint's
  goodwill on the one service still answering.
- 0 takes, 0 metaNotes, 0 verified skips. `data/creator-takes.json` and
  `data/pending-transcripts.json` are both untouched.

## 2026-08-30 (nightly, CI runner) — 2 bracket-split Havoc takes; 1 verified-skipped; 4 queued

All **44** transcribable channels polled via the YouTube RSS endpoint, 0 failures, 15 entries
each = **660 videos**. `media:description` parsed alongside every title. No YouTube or
transcript-API request was made by this agent.

- **Seen-set recomputed as the four-lane union** (`seen` 549 + `skipped` 415 + `videos` 3 +
  every `youtu.be` id in a take or metaNote) = **1,216 ids**, leaving **238 unseen**, all inside
  the cycle bound **2026-06-18** (the OLDEST `ptr-builds` date, not `builds[0]`). 196 pass the
  nightly keyword filter.
- **Transcript step:** `transcript-fetch/summary.json` attemptedAt 2026-08-30T14:57:53Z, verdict
  **`ok`**, 3 requested / **2** fetched.
- **DISTILLED — Shadarek, `s508k-L7ims` "Havoc BUFFED AGAIN! | Sep 1st Class Tuning"**
  (170 chunks, ~6m12s, published 2026-08-28). A scripted, self-anchored read that splits by
  bracket, so **two takes**:
  · **Havoc / raid — buff.** The flat 4% aura buff on a spec he already called "pretty okay",
    plus a trinket correction he published the same day: **Font of Venomous Rage** was
    under-simming because SimC modelled the tooltip's four ticks when it actually ticks five —
    base tick 217,676 → 272,096, his average crit ~630k → 787k, roughly 25% missing. He now
    rates it his best on-use over Heart of Ula'tek (drops from Ula'tek, timers matching that
    fight's ~2:15 / 4:45 / 9:30 burns, cleaves; his own casts 2M and 4.7M, ~1.7M DPS in that
    window), amplifiable inside Inertia and potion windows. Conclusion: "incredibly good spot",
    "very well off in raid for the season".
  · **Havoc / M+ — buff.** Havoc "seems pretty good right now" and the extra 4% "will go a long
    way"; the buff roughly pays for dropping Glaive Tempest for Isolated Prey (≈4% overall lost
    against ≈10% single target gained), which he calls a newly available option.
  His **2026-08-22 whole-spec "both" take was superseded** by the pair — the Obli 08-23/08-28
  precedent for a bracket-split replacing a `both` read.
  **Devourer got NO take**: the only mention is that Havoc/Devourer stats now roll into
  Vengeance, a gear remark and not a read. The eleven other specs he names (Frost DK, Feral,
  Balance, Resto Druid, BM, Survival, Fire, Frost Mage, Mistweaver, Windwalker, Prot Paladin)
  are him reading the tuning notes aloud, outside his registered scope — including the Frost
  Mage "getting laid on Twin Fang on Mythic World First" line, which is a fight artifact twice
  over. `latest` advanced to state what was distilled.
- **VERIFIED-SKIPPED — Critcake, `UfjdyqXGbeM`** (255 chunks, ~26m): a commentated pug key run of
  the same shape as `if8kxRXBzSA`, skipped 08-28. His scripted intro is 4-set/gear housekeeping
  ("the spec still works even though I don't have ideal stats"); the rest is callouts, banter and
  chat answers. Three strength-adjacent lines tested and all failed — "I like the feel of Fury
  four piece … feels good" is feel not placement; "I felt like I would have done better as
  slayer" sits after a speaker-change marker; and the one genuinely comparative line, *"is arms
  and fury damage comparable. Yes,"* / *"keys."*, straddles a speaker boundary and cannot be
  attributed from the caption track. His 08-26 Fury M+ take stands as the current read. If he
  restates the Arms/Fury 4-set comparison in a scripted video, distil it then.
- **`pdYpGLyZ7VM`** (LBNinja7, "Healers Buffed AGAIN!! | 12.1 Tuning") came back `unavailable`
  from Supadata and **stays queued**.
- **QUEUED 4**, deliberately narrow against the **100-request MONTHLY** budget rather than the
  25-per-run cap: Kalamazi `z_dKoGx_FIk` (Warlock sims, all three specs), izen `bDElWkJxvtY`
  (general → metaNotes lane, Sept 1 tuning), YoDaTV `xYXkZA1L490` (M+ patch notes + tier-list
  update, tank-scoped — the coverage-poor role), Whispyr `1qclgMKPdz4` (Assassination, "Fatebound
  is BACK"). Shadarek's `DJCr5_KFzcM` "new BiS Gear Setup and Post-Buff Sims" was deliberately
  NOT queued — gear-shaped, same creator+spec distilled tonight.
- The remaining ~192 keyword-passing candidates are a **BUDGET cut** and were left **UNSEEN** so
  the next run reconsiders them. **Nothing was added to `seen[]` tonight.**

## 2026-08-29 (nightly, CI runner) — 4 takes from one pre-fetched transcript; 3 queued

All **44** transcribable channels polled via the YouTube RSS endpoint, 0 failures, 15 entries
each = **660 videos**. `media:description` parsed alongside every title, which settled three of
tonight's triage calls at zero transcript cost. No YouTube or transcript-API request was made by
this agent.

- **Transcript step:** `transcript-fetch/summary.json` attemptedAt 2026-08-29T15:17:21Z, verdict
  **`ok`**, 1 requested / 1 fetched — the single video the 08-28 run queued.
- **Obli, `n0H4JFE6Suc` "What did the buffs do for Frost DK?"** (205 caption chunks, 6m32s,
  published 2026-08-28T13:20Z) — his first raid week on BOTH Death Knights after the August 25
  pass, argued from his own logs on a 311-ilvl Frost main against a lower-geared Unholy alt, both
  on the 4-piece. It splits cleanly by bracket, which is why it is **four takes and not two**:
  · **Frost / raid — negative.** Falls away as fights lengthen ("just not it" on anything not
    killed fast); the two-target cleave he had expected to be its strength is the one place it
    merely does okay (Basilik the Malignant, the Lost Explorers) and Unholy does that better.
    Hard evidence is a within-player comparison, not a tier list — his worse-geared Unholy alt
    out-damaged his Frost main. Asks for a flat **10–15%**, sized off his own Hiz'garak log
    against an Arcane Mage at the same percentile, and wants the season's Obliterate change
    reverted plus a pass on Breath of Sindragosa's primary hit.
  · **Frost / M+ — positive.** "In Mythic+ we're actually doing pretty good", roughly level with
    Unholy, raised as the reason raid tuning must not overshoot into keys.
  · **Unholy / raid — positive.** Little opening burst but scales up as the encounter runs, with
    execute creeping higher, so San'layn is good for Mythic and can creep up to match meta
    classes; "Unholy can do everything Frost can do but better". NEW BUG he says has been live
    all tier: target damage amplifiers (he names Syzygy's Dig In, and Soul Reaper) do **not**
    apply to Blightfall's eruption damage, which is why the build currently only matches Rider.
  · **Unholy / M+ — positive.** "Very good", a teeny bit ahead of Frost.
  Both specs are inside his declared Frost/Unholy scope; Blood is untouched.
- **Superseded four prior Obli takes, each within the same lens** — Frost raid and Frost M+ from
  08-23, Unholy raid and Unholy M+ from 08-25. His `latest` line was rewritten to what was
  actually distilled, not to the newest upload.
- **Declined on the list-mention rule:** the Arcane Mage 176k figure and the Marksmanship Hunter
  comparison are the yardsticks of his own buff arithmetic, not reads on those specs.
- **Timing worth recording:** the video predates the September 1 tuning announcement by nine
  hours, and that pass gives Frost DK exactly the shape he asks for (Howling Blast +15%,
  Obliterate +15%, Frost Strike +20%, melee +10%). The take is his read on 08-28 and was NOT
  edited to anticipate it.
- **Queue:** `n0H4JFE6Suc` removed from `videos[]` (distilled, so its take url is its record and
  no weaker lane may hold it — the precedence ladder). Three appended:
  · Shadarek `s508k-L7ims` "Havoc BUFFED AGAIN! | Sep 1st Class Tuning" (Havoc/Devourer scope);
  · Critcake `UfjdyqXGbeM` "SLAYER FURY IS SO BACK" — queued on its DESCRIPTION ("Season 2 4-set
    acquired. Slayer Fury is back on the menu"), a placement claim, where his 08-28 pug-key video
    was correctly skipped as a commentated run;
  · LBNinja7 `pdYpGLyZ7VM` "Healers Buffed AGAIN!! | 12.1 Tuning" — description cites the Sept 1
    blue post, and this creator carries five healer specs across four classes.
- **Accounting:** seen-set union **1,213**; **228** unseen in-cycle videos of which **135** pass
  the nightly keyword filter. The **132 not queued stay UNSEEN**, not written to `seen[]` — a
  budget cut is exactly the dismissal class that must remain reconsiderable. Nightly keyword
  filtering kept, per Supadata's 100-request MONTHLY tier.
- **Two deliberate non-queues worth naming.** Both Supatease items ("12.1 MAJOR Class Changes BIG
  Update", "THE NEW META IS COMING") are from the creator SKILL.md names as the PvP-framing trap,
  and both titles are the exact shape it warns about. Dalaran Gaming's `seRL4jirX9E` "Talent
  Squish, New Modes, & Huge Patch Roadmap" is a LEAD about future plans; the forum and blue
  tracker carry no 12.2 PTR announcement tonight, so it is not corroborated and was not treated
  as a source. Shadarek's `DJCr5_KFzcM` (BiS gear setup + post-buff sims) was left unseen as
  gear-shaped and redundant with `s508k-L7ims` for the same buff window.

## 2026-08-29 (local, scheduled) — the caption 429 is on its THIRD consecutive day; queue held at 1, nothing distilled

- **Discovery ran in full and is the useful half of this run.** All **44** transcribable
  channels polled via the YouTube RSS endpoint, **0 feed failures**, 15 entries each.
  Unfiltered by title per the local-run rule, bounded by DATE at the cycle's opening build
  — derived as `Math.min(...builds.map(b => b.date))` = **2026-06-18**, not read off
  `builds[0]`, which is now the 2026-08-28 tuning pass and would have cut the sweep to a
  single day. Seen-set union recomputed rather than trusted: **1213** ids across the four
  lanes. **227 unseen in-cycle videos** stand after the bound.
- **The caption transport is still dead.** `--list-subs` on the queued Obli video
  `n0H4JFE6Suc` succeeded (full auto-caption language table, so captions exist and the info
  endpoint is healthy), and then **exactly one** caption download was spent, per the
  one-probe rule: `HTTP Error 429: Too Many Requests`. That is the persistent IP-scoped
  abuse-flag shape on `timedtext`, not throttling — third consecutive day, and the skill's
  24–72h decay window is now at its far end. Stopped the caption lane immediately; no
  retries, no client-shuffling, no backoff ladder.
- **Nothing was queued, deliberately, and this is the part worth not getting wrong.** The
  queue is drained by Supadata against a 100-request MONTHLY budget, so it stays
  keyword-filtered even on a local run — "fetch broadly, queue narrowly". The keyword-shaped
  titles in tonight's 227 (Shadarek "Havoc BUFFED AGAIN! | Sep 1st Class Tuning", LBNinja7
  "Healers Buffed AGAIN!! | 12.1 Tuning", Dalaran Gaming "New Buffs For Season 2! Class
  Tuning Coming with Weekly Reset") are ones **the nightly's own filtered discovery will
  queue by itself**, so hand-queueing them here would duplicate the nightly rather than add
  reach. The ones the nightly genuinely cannot see are the non-keyword titles — and those I
  could not fetch either, since the transport is down. So there was nothing this run could
  usefully add to the queue, and it stays at **1** (`n0H4JFE6Suc`, Obli, queued 08-28).
- **All 227 stay UNSEEN, on purpose.** This was a transport failure, and budget/transport
  dismissals never enter `seen[]` — that lane takes durable judgments only. Marking tonight's
  sweep seen would silently abandon a 227-video backlog and reproduce exactly the
  Tactyks/J-Funk failure. They will be reconsidered next run.
- **Leads noticed but NOT distilled** (they are ptr-watch's lane, and were verified there
  against the canonical forum post rather than off a video title): several creators posted
  on the September 1 class tuning pass within hours of the announcement. That pass is now
  logged in `data/ptr-builds.json` from **forum topic 2342331 read at version 3** — see
  ptr-watch/log.md. No take or metaNote was minted from any video title; a title is a lead,
  never a source.
- 0 takes, 0 metaNotes, 0 verified skips this run. `data/creator-takes.json` and
  `data/pending-transcripts.json` are both untouched.


## 2026-08-28 (nightly, CI runner) — 5 pre-fetched transcripts read: 3 takes, 7 metaNotes, 2 verified skips

- **Discovery:** all **44** transcribable channels polled via the YouTube RSS endpoint, 0
  failures, 15 entries each = 660 videos. Seen-set union (pending `seen[]` + `skipped[]` +
  `videos[]` + every `youtu.be/<id>` in a take or metaNote url) = **1,212**. Unseen **220**,
  all of them inside the cycle bound (2026-06-18, `Math.min` over `ptr-builds.json` — taken as
  a DATE, never an index); **130** pass the nightly keyword filter. The filter stays on, per the
  100-request MONTHLY Supadata budget; the 129 not queued stay UNSEEN rather than being written
  to `seen[]`, because a budget cut is exactly the dismissal class that must remain
  reconsiderable.
- **Transcripts:** all five queued videos were pre-fetched by the deterministic step
  (`transcript-fetch/summary.json` attemptedAt 2026-08-28T21:14:27Z, verdict **ok**, 5
  requested / 5 fetched). No YouTube or transcript-API request was made by this agent.
- **izen `x429ozbMXnQ` — "Season 2 Mythic+ Meta | Best Performing Specs and...Surprises"
  (2026-08-27, 26 min) → 7 metaNotes, M+ lens.** Arcane Mage positive (Prismatic Bolt proccing
  off Arcane Blast; "good at all points"), Arms Warrior positive (Slayer over Colossus after
  Tactical Edge began proccing Sudden Death; AoE back at War Within levels; 50 Bladestorms in
  28 minutes), Elemental Shaman positive (number one on average score; Voltaic Blaze + Purging
  Flames make Lava Burst a 5–6 target button; weak tankiness), Holy Paladin positive (gapping
  Resto Shaman by ~100 average score; top keys are essentially all Lightsmith), Blood DK
  positive (clear advantage among tanks off the score chart), Restoration Shaman **mixed** (the
  only real alternative, better on flat rot healing, much weaker spot and single-target), and
  Assassination Rogue **mixed** — logged mixed rather than positive because izen calls it "the
  first asterisk of the season": very high average score he cannot explain beyond four
  consecutive flat percentage buffs, and a lopsided profile that is much weaker on forced
  single target. Six prior izen M+ notes superseded (five from 08-25, Resto Shaman's from
  08-21); same lens, newer read.
  Deliberately NOT distilled: **Outlaw Rogue**, whose only appearance is the score-swap caveat
  (run keys as Assassination, swap to Outlaw, keep the score) — a scoring artifact, not a
  strength read; and **Marksmanship / Shadow Priest / Holy**, which appear solely as bare
  comparators in one enumeration (the list-mention rule).
- **AutomaticJak `l1qKWWYZGZE` — "This NEW Holy Priest Build Dominates" (2026-08-26, 11.5 min)
  → 2 RAID takes.** Holy Priest **buff**: he recommends Holy over Disc for 99% of raiders on
  the Venomous Abyss fights so far, calls it still one of the highest HPS specs in the game,
  and backs it with his own Lost Explorers log where his effective-healing-required-per-second
  was third from the bottom of the raid; immobility is the named cost, and he splits Oracle
  (≤20) from Archon (~30). Discipline Priest **nerf**: the same comparison run the other way —
  Holy is "much safer and less stressful" than Disc in this raid — closing with a direct ask to
  buff Disc via an Atonement modifier for dungeons. Both supersede his 08-21 raid takes on the
  same specs.
  ⚠️ **His M+ read was deliberately NOT logged, and this is the flag, not a decision.** The
  video contains a substantive M+ passage ("we've done 17s as holy… around like an A tier
  healer right now", weak AoE healing, verse-stacking to survive) — but AutomaticJak is the
  bylined author of the **Wowhead M+ healer tier list**, one of our four consensus sources, and
  he literally states a tier. Logging it would feed `consensusFor` and `expertRead` from one
  voice on the same cell, the Tactyks firewall shape. His existing 08-21 M+ takes were left
  live: pre-existing entries are an owner decision, flag never retire.
- **Musguete `ps4If_WbBPQ` — "Outlaw feels INSANE in Season 2! 12.1 Guide" (2026-08-27, 8 min)
  → 1 RAID take, buff.** Mostly a rotation/stat/talent update, which is normally the
  guide-shaped no-take case, but it carries an explicit placement claim with a mechanism: many
  of the new raid's bosses are two- and three-target cleave and Outlaw performs really well
  there, so he expects to keep seeing it raided; off his own meters, sustained damage is
  consistent and high outside burst and the opener burst is notably bigger than Season 1's. His
  live M+ Outlaw take (08-04) and the unscoped PTR-era tuning take (07-31) were left alone —
  different lenses, and a naive `bracket ?? "both"` retirement is the documented over-supersede
  failure.
- **Verified skips (2), both moved to `skipped[]` with reasons:** AutomaticJak `rGk2fajsQ1g`
  "Disc Priest in 60 Seconds" — 32 chunks, 59 seconds, pure how-to, no comparative read (and a
  Disc read from him IS on file from the same window, so nothing is lost); Critcake
  `if8kxRXBzSA` "+16 Murder Row" — 201 chunks, 31m20s of a commentated pug key run whose three
  strength-adjacent lines all fail the test ("I love slayer arms" is enjoyment, "Arms is very
  good on it" is one fight, and the tank-meta / Windwalker remarks answer chat about specs
  outside his declared Arms/Fury scope). No neutral take was minted to record having watched
  either.
- **Queued (1):** Obli `n0H4JFE6Suc` "What did the buffs do for Frost DK?" (2026-08-28). Queued
  on its DESCRIPTION rather than its title — "Frost got buffed with this reset but has it
  actually done anything for us in the raid? Short answer, no" is a raid-scoped spec-strength
  read in Obli's declared Frost/Unholy scope. Queue depth is now 1.
- **Considered and left unseen** (keyword/budget cut, reconsiderable next run): Bicepspump
  `_7W3AVF1p8c` Unholy DK rotation guide and Jedith `DbXY5OnAxoU` Havoc build/opener guide (both
  guide-shaped); Supatease `pLFqCP68UhY` "THE NEW META IS COMING" and `jBXCc2bTTDs` "Midnight
  PVP Tier List Season 2 Update" (PvP lens, the documented title trap); Dalaran Gaming
  `seRL4jirX9E` "Blizzard Just Revealed Huge Changes…" (design-news commentary from a class
  creator); the MadSkillzzTV and LBNinja7 healer streams and the YoDaTV / Bansherz / Shindigg /
  J-Funk key-and-raid PoV runs.


## 2026-08-28 (local, scheduled) — the caption 429 is on its SECOND consecutive day; queue held at 5, nothing distilled

**Videos processed: 0. Takes added: 0. MetaNotes added: 0. Queue: 5 → 5 (unchanged).**

- **One caption probe, one 429, stopped there** — the skill's rule, not a judgement call.
  `x429ozbMXnQ` (izen, "Season 2 Mythic+ Meta") at the pinned yt-dlp with the documented flags:
  metadata resolved normally (formats listed, "Downloading subtitles: en" reached) and ONLY the
  `timedtext` request failed, `HTTP Error 429: Too Many Requests`. That is the IP-scoped abuse-flag
  signature diagnosed 08-24, not the datacenter bot wall and not transient throttling. No retry loop.
- **This is day two of the current relapse** (clear 08-25 and 08-26, back 08-27, still blocked
  08-28). The 08-27 reading that the 08-25 clearing was a remission rather than a fix now has a
  second day behind it: the residential lane cannot be treated as a reliable catch-up route.
- **The authenticated fallback was NOT usable this run, and for a new reason worth recording.**
  A `cookies.txt` Riley exported on 08-24 is still on disk, so unlike 08-27 the file existed — but
  this session's permission layer refused the read, and working around a credential-access denial
  is not something a scheduled run should do. Recording it so the next run knows the blocker was
  the harness, not a missing file. If Riley wants the authenticated lane available to scheduled
  runs, that needs an explicit allowance rather than an agent finding a way round.
- **Queue deliberately UNCHANGED at 5** (`x429ozbMXnQ`, `ps4If_WbBPQ`, `rGk2fajsQ1g`,
  `l1qKWWYZGZE`, `if8kxRXBzSA`). Nothing moved to `skipped[]`: a skip is a DURABLE claim that the
  transcript was read and held nothing, and a transport 429 is not that. They drain through
  Supadata on the next nightly — a different network path, unaffected by this flag, and proven so
  by the 08-27 nightly which fetched 3 of 3 while this lane was blocked.
- **No unfiltered breadth sweep, on purpose** (the 08-27 reasoning, unchanged): the local run's
  breadth privilege is that yt-dlp is free, and with captions 429ing a wider sweep yields no
  transcripts and therefore no takes — the only thing it could produce is more QUEUE entries, which
  spend the nightly's 100/month Supadata budget. Counts stand: `seen[]` 549, `skipped[]` 413.


