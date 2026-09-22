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

## 2026-09-21 (local, scheduled) — queue **2 → 0** drained at home (2/2 captions, one isolated 429 cleared on a single retry); **0 takes, 0 metaNotes**, both videos verified-skipped — run ~2.5 h AFTER today's nightly

- **Scope: residential-only catch-up, started ~02:05Z Sept 22 UTC on `df8d35c`** (the 09-21 nightly published 16:54Z and queued two videos). Both fetched with yt-dlp (pin still 2026.07.04, nothing installed; `--extractor-args youtube:player_client=android`, `--sleep-requests 3`, one video per invocation). Metadata printed in a SEPARATE invocation first: both `not_live`, `was_live=False`, 27 and 11 min. **One caption probe first** (LBNinja7 `kEorL6oVefU`) → 549 KB json3 clean, so the IP-scoped `timedtext` flag is still clear. The SECOND download (`2FgeUweFdXQ`) drew **HTTP 429 on the caption fetch while the info fetch succeeded** — the ISOLATED shape the skill says to retry once — and the retry landed 246 KB moments later. Stopped there (nothing else to fetch). Authenticated cookies lane NOT needed, NOT touched. Nothing queued for the metered lane.
- **LBNinja7 `kEorL6oVefU`** (*Healer Hero Tree Data You WON'T Like*, 27 min, 5,249 words) → **verified-skipped.** It is a WITHIN-spec hero-talent-tree share comparison from top logs (M+ then raid) for all seven healers: Lightsmith ~93/7 over Herald in M+ and Herald 100% in raid, Oracle 90/9 over Voidweaver in M+ and Voidweaver 99/<1 in raid, Wildstalker ~94/6 both brackets, Oracle 100% for Holy Priest in both, Conduit 98/2 over Master of Harmony, Flameshaper over Chronowarden, Totemic ~100% over Farseer. That is build data, not spec strength. The only cross-spec remarks restate his 2026-09-18 data read (Holy Priest strong in both brackets; Mistweaver "needs" the coming buffs), and the Disc / Resto Druid / Mistweaver tuning mentions are anticipation of the Sept-22 pass ("I do expect this number to change"), which the skill says is not a read. Distilling a Disc M+ "buff" from it would have superseded his stronger same-lens 09-18 leaderboard-count read with a passing forecast — declined. `skipped[]` reason records all of this.
- **AutomaticJak `2FgeUweFdXQ`** (*Secrets of Disc Raid Healing Midnight Season 2*, 11 min, 2,346 words) → **verified-skipped.** A Discipline raid rotation guide (Penance clipping for Greater Smite uptime, 5–12 atonement float, ~4 Flash Heals/min for self-atonement, Mind Blast before Penance, haste vs GCD cap with PI/Bloodlust/pot, Evangelism and Ultimate Penitence sequencing). His one spec-choice remark — he moved from Holy to Disc for the damage checks on Twin Fangs and Coiled Altar — is a fight-driven pick, not a comparative read. Guide-shaped, no take.
- `pending-transcripts.json`: `videos[]` 2 → 0, `skipped[]` 437 → 439, `seen[]` untouched. No creator `latest` advanced (nothing distilled). No new RSS sweep this run — the nightly's 44/44 poll is ~2.5 h old and its 345-video local backlog stays UNSEEN and is not re-litigated here.
- **Also this run (ptr-watch, same commit):** the Sept 21 hotfix batch logged (Evoker Unravel fixes, Ula'tek nerf) and the Sept 22 tuning post's v3 edit folded into the 09-18 entry (Blood DK Death Strike +15% not +25%, Vengeance Reaver's Glaive +25% not +30%, Warrior Mountain Thane lines PvE-only). Details in ptr-watch's log.
- **Manifest deliberately NOT touched** (partial run — the 16:37Z nightly manifest is the record). Gearing guide harvest SKIPPED: all three guide files are 6 days old (09-15), the weekly workflow is green and runs again tomorrow (Tue 08:37 UTC), no provider failed.
- Verification: `freeze-season` nothing to freeze. `npm run test:quiet` **636 pass / 2 fail / 1 skip** — the two fails are the PRE-EXISTING ui-invariants WCL fixture tests, re-confirmed red on clean `df8d35c` via `git stash` before any edit (owner fix pending: Kith'ix encounter 3513 in zone 53; CI's Tests run on the nightly commit was already red for the same reason). `npm run build` OK. `check-refresh --manifest`: the only failure line is the gitignored local `wcl-fetch/evidence.json` being stale (09-08, not from this run) — a local leftover the nightly regenerates, not a data finding; every degraded row is the nightly's own honest record. `check-official-notes --base=HEAD` passes.

## 2026-09-21 (nightly) — 44/44 channels polled, 2 queued, 0 takes (queue was empty when the transcript step ran)

- **44 of 44 configured channels polled inline**, all 200 on the first attempt; **660** feed entries read, `media:description` parsed alongside every title.
- **Seen-set rebuilt from STRUCTURED DATA** (pending-transcripts `seen[]`/`skipped[]`/`videos[]` + every `youtu.be` id cited in `creator-takes.json`): **1,288**. log.md prose was not regexed.
- **345 unseen entries** fall on or after the cycle's OPENING build date **2026-06-18** — derived as the MINIMUM date in `ptr-builds.json`, never `builds[0]` (which is the newest hotfix round-up). That is the standing local-run backlog and it is deliberately left **UNSEEN**: a nightly keyword cut is a budget dismissal, not a durable judgment, and marking it seen would silently abandon the hand-forward.
- **37 of those were published since the previous nightly started.** Triage of that window: **WoW: Forever beta content is a different product** and carries no Midnight 12.1 S2 spec read (Supatease ×6, Bansherz ×5, Whispyr ×3, NeekapHere ×2, Psybear, Kalamazi, MadSkillzzTV, Dalaran Gaming) — note Psybear's *"Feral Druid Is BROKEN in WoW Forever!"* names a roster spec in its title and is still out of scope, which is why the description is read and not just the title; PvP duel content out of scope (Dalaran Gaming); raw key/prog PoVs and boss guides carry no spec-strength read (YoDaTV ×6, Shadarek, Shindigg, Tactyks, Clandon, Critcake, Maximum, Sha, Dratnos ×2, Bansherz).
- **`leak`'s Twin Fangs commentary (`5LF-JYAo8j0`) declined on the fight-artifact rule**, and it is the interesting case of the night: its description says outright *"Survival is not very good at this boss"*, which reads like a spec-strength call but is BOSS-scoped — the same shape the skill records as a fight artifact rather than a meta read. Left unseen, not skipped.
- **2 videos QUEUED** to `pending-transcripts.json` for the deterministic step to drain: **`kEorL6oVefU`** (LBNinja7, *"Healer Hero Tree Data You WON'T Like"*, 2026-09-21 — a cross-healer hero-tree comparison; he is scoped to seven healer specs) and **`2FgeUweFdXQ`** (AutomaticJak, *"Secrets of Disc Raid Healing Midnight Season 2"*, 2026-09-21 — Discipline is in his registered scope and the lens is raid). Both ids came off the live RSS with an author match; neither sits in any existing lane. Both are hours old, so captions may still be lagging.
- **0 takes, 0 metaNotes.** `transcript-fetch/summary.json` (attemptedAt 16:35:45Z) reports verdict `ok` with **requested 0 / fetched 0** — the queue was EMPTY when the deterministic step ran, because the 2026-09-20 local run had drained it. So there was nothing to distil this run; tonight's two entries are for the next drain. The agent fetched no transcript from YouTube or any transcript API.
- No creator `latest` field advanced — none names a video distilled this run, and advancing one to a merely-newer title trades information for recency.


## 2026-09-20 (local, scheduled) — queue **5 → 0** drained at home (5/5 captions, no 429); **18 takes** + **15 metaNotes**, 1 verified skip, **2 tier-list panels** captured — run 1.5 h AFTER today's nightly

- **Scope: residential-only catch-up, started 16:02Z on `bc95c6b`** (the 09-20 nightly published 14:37Z and had queued five Sept-22-tuning reaction videos for Supadata). All five were fetched here with yt-dlp instead (pin still 2026.07.04, nothing installed; `--extractor-args youtube:player_client=android`, `--sleep-requests 3`, one video per invocation, 4 s pause). Metadata printed in a SEPARATE invocation first: all five `not_live`, `was_live=False`, 5–27 min. **One caption probe first** (Dorki `HuVu1eVqq98`) → 530 KB json3, so the IP-scoped `timedtext` flag is still clear; then **4/4 more landed** (84–508 KB). The batch loop matched `^ERROR` / `HTTP Error 4` only (the 09-19 false-stop lesson). Authenticated cookies lane NOT needed, NOT touched. Nothing queued for the metered lane.
- **Dorki `HuVu1eVqq98`** (*FINAL SEASON 2 M+ TIER LIST*, 24 min, 5,102 words, published 09-20) → **6 M+ takes, tank scope only** (his registered specs). Built on Tiercraft with five tiers — S raid buffs / S "natty strong" / A raid buffs / A natty strong / F "why even play" — and his shorthand matters for reading placements: "natty strong" unqualified is the S half, "**a** natty strong" is the A half (he says so for Arms and Unholy). Blood DK **buff** (natty strong; the tuning is "kind of fake" as a nerf — ~+2% ST vs ~−1% overall off his own logs; cracks at 21–22s but still best or close), Guardian **buff** (slammed to his top tier, underrated: Blood's tankiness plus the only Mark of the Wild), Vengeance **mixed** (no longer sold on S until it does 22s comfortably; "when you're not tanky, you're kind of dead"), Brewmaster **neutral** (A raid-buffs placement, no commentary), Protection Paladin **mixed** ("A natty strong", worse than Blood at everything), Protection Warrior **nerf** (F, realistically B). All six 09-05 M+ takes superseded. **Panel captured** in `creator-predictions.json` (`dorki-HuVu1eVqq98-2026-09-20`, `scope.keys` = the six tanks): Blood S, Guardian S, Brewmaster A, Prot Paladin A, Prot Warrior F, **Vengeance `tier: null`** — demoted from S on screen with no spoken destination. His DPS/healer placements (Ret "best DPS in the game", Frost DK a dark horse, Shadow F, Disc "has to be OP", …) are out of his registered scope and were NOT distilled or captured; the transcript is on record here if the owner wants them.
- **YoDaTV `tNPYXq3elsI`** (*ZERO NERFS? Tierlist Update*, 10 min) → **9 M+ takes** inside his scope (six tanks + Arms + Holy/Ret Paladin): Blood DK **buff** (S+, tuning a damage shuffle — <5% AoE loss, +5–7% ST, "basically unchanged"), Holy Paladin **buff** (the other S+), Vengeance **buff** (S on its own, "probably the second best tank", survivability now above Guardian's), Guardian **nerf** (split below VDH, "basically no damage"), Arms **buff** (S, still really good), Retribution **buff** (A+, deserved), Protection Paladin **nerf** (A; 6% damage, survivability at an all-time low), Brewmaster **nerf** (A; physical comps only, worse than last season), Protection Warrior **nerf** (A; "don't play it this season"). 7 of his 08-29 M+ takes and the 08-22 Holy/Ret M+ pair superseded. **Panel captured** (`yodatv-tNPYXq3elsI-2026-09-19`, native order S+/S/A+/A): 8 explicit letters, **Guardian `tier: null`** (only "separate from Vengeance", no letter spoken). Out-of-scope reads (Unholy "might take over", Devourer S, Feral maybe A+, Havoc a funnel pick, Resto Druid A+, Preservation A+, Holy Priest A+) not distilled.
- **Obli `q4sDG0siKnU`** (5 min) → **3 takes**: Frost raid **buff** (Obliterate up + Frostreaper doubled → "king of all damage profiles", a hard shift to Frost for the raid; Unholy keeps one cooldown-timing Mythic boss and maybe Coiled Altar's execute cleave), Frost M+ **buff** ("already one of the best melee specs … now insane"), Unholy raid **mixed** (Blightfall 200% still bugged, the San'layn lines "tiny onto tiny", single target "really hasn't" gone up, Unholy needs a lot of help). Superseded his 09-17 Frost raid, 09-14 Frost M+ and 09-17 Unholy raid takes; his 09-17 Unholy M+ neutral is a different lens and stays. The ASR boss name at 1:11 ("Vashj'ir") was NOT written as a name — the claim says "the Mythic boss where cooldowns must be sent on cooldown".
- **izen `sFNCt1mNb7U`** (general creator → `metaNotes[]` only; 27 min, 4,809 words) → **15 notes** in the tuning-walkthrough lens, each with an explicit `bracket` (13 `both`, Resto Druid `raid`, Discipline `mplus`): Blood neutral, Frost DK / Unholy / Devourer / Havoc / Vengeance mixed, Resto Druid positive (net buff that should carry it past Preservation in raid HPS — ~1.1% apart last week), Devastation mixed (Azure Strike worth pressing again; Flameshaper may pass Scalecommander; Mass Disintegrate is an anti-funnel), Fire / Frost Mage mixed (Frost's numbers mislead — Comet Storm +50% is 0%), Brewmaster negative (got nothing while struggling), Mistweaver mixed (under halfway to viable), Prot Paladin / Prot Warrior mixed, Discipline positive (the round's biggest buff, warranted for M+). **Deliberately NOT noted:** Shadow, Marksmanship, Augmentation, Windwalker — each already carries his same-day (09-19) raid-lens note from `iXjoMyr1LAs`, same-date supersession is forbidden, and the tuning read adds nothing the raid note lacks; Ret/Sub/Fury (hero-talent build reads, not spec reads); Survival/Feral/Arms (no read). Superseded: his five 08-22 `both`-lens notes on the specs re-read here, Resto Druid's 08-29 + 09-08 raid-lens notes, Discipline's 08-29 + 09-07 M+-lens notes — and, found in passing, his **08-29 Frost Mage raid note**, a stale same-lens duplicate of the live 09-08 raid read that an earlier run should have retired (both were live at once).
- **Supatease `lvXugC_JcAY` → `skipped[]`** (14 min read in full). The title says 12.1.5 but it is the Sept 22 LIVE post read aloud with PvP asides; every in-scope spec (Shaman, Affliction, Arms, Prot Warrior) is discussed only inside the PLAYER VERSUS PLAYER section from ~8:33. Same shape as his verified-skipped `hvxrLgUQk1w`. 0 takes, 0 metaNotes.
- **Lane hygiene**: 5 distilled/skipped ids removed from `videos[]`; queue **5 → 0**, skipped 436 → 437. One-record gate: `npm run validate` clean, `audit:creators` **HIGH 0 / MED 0 / INFO 9** (unchanged set). Registry `latest` advanced on 14 entries (Dorki ×6, YoDaTV ×6, Obli, izen), each to what was actually distilled. No RSS re-poll this run — the nightly polled all 44 feeds 1.5 h earlier and its 172 un-queued keyword hits stay UNSEEN as designed.
- **Every claim re-read against its own transcript at the deep-linked offset before the merge**; two placements written as `tier: null` rather than inferred (above). Takes are display-only while `expertRead` is dormant (`PHASES.ptr` null) → 0 projection movement.
- Verification: `npm run test:quiet` **636 pass / 2 fail / 1 skip** — the two fails are the PRE-EXISTING ui-invariants WCL fixture tests, re-confirmed red on clean `bc95c6b` via `git stash` before any edit (owner fix pending: Kith'ix encounter 3513 in zone 53). `freeze-season` nothing to freeze. Snapshot `2026-09-20.json` byte-identical to the nightly's (takes are not snapshot state), rebuilt; all 33 new entries present in dist, 0 in `HEAD:dist`.

## 2026-09-20 (nightly) — all 44 feeds polled (660 entries, 0 errors); **5 queued**, 0 distilled because the queue was empty when the transcript step ran

- **Discovery**: every transcribable creator with a `channelId` — 41 specialists + izen/Maximum/Zorthas — polled inline, no retries needed. Seen-set rebuilt from structured data only (queue `videos[]`/`skipped[]`/`seen[]` + every `youtu.be` id in a take or metaNote url): **1,283 ids**, 297 of them distilled. **346** unseen entries fall on or after the cycle-opening build **2026-06-18** (the OLDEST date in `ptr-builds.json`, never `builds[0]`); **177** pass the nightly keyword filter, which this run KEEPS — the queue is drained by the metered captions API, so breadth belongs in local runs.
- **Queued 5**, chosen as the analysis pieces rather than the POV/gameplay bulk: Dorki `HuVu1eVqq98` *FINAL SEASON 2 M+ TIER LIST* (09-20 — its `media:description` is a per-spec chapter list, so this is a real list read and a `creator-predictions.json` candidate when it is distilled), YoDaTV `tNPYXq3elsI` *ZERO NERFS? Tierlist Update & Patch Notes (September 22)* (09-19), Obli `q4sDG0siKnU` *Strange Unholy Buffs & BIG Frost ST Buff next reset!* (09-19), izen `sFNCt1mNb7U` *Keywords: BUFFS ONLY | Season 2's Last Balance Tuning Before 12.1.5* (09-19, **general lane** → metaNotes/leads only, never `takes[]`), Supatease `lvXugC_JcAY` *12.1.5 Emergency Class Tuning Update* (09-18 — flag at distillation: this creator's reads are routinely PvP-framed, and a 12.1.5-lens read is preview material, not a live-season take).
- **0 takes / 0 metaNotes, and that is not a gap.** `transcript-fetch/summary.json` reads verdict `ok`, **requested 0 / fetched 0 / cached 0** — the queue was empty when the deterministic step ran, so no transcript exists on this runner to read. The five drain next run. Usage receipt: 16 counted requests in the 30-day window, 0 uncertain.
- **One yt-dlp metadata probe, then stop.** Confirmed the settled datacenter-IP wall ("Sign in to confirm you're not a bot") on the first id and did not repeat it, install anything, or attempt a workaround — the decision is closed.
- **Deliberately left UNSEEN, not written to `seen[]`:** the 172 keyword hits not queued, the WoW:Forever beta uploads (a different product, but that is a title judgment), and LBNinja7 `Ljq_r4zAa0g` *"They did it… Mistweaver BUFFED!!"* — empty description and hashtag styling read as a Short, but the bot wall means the duration could not be **proved**, and only durable facts earn a `seen[]` entry.


## 2026-09-19 (local, scheduled) — CAPTION 429 CLEARED (one-day relapse, 09-18 only); queue **9 → 0** drained at home (9/9 captions), **19 takes** + **9 metaNotes**, 1 verified skip — run AFTER today's nightly

- **Scope: residential-only catch-up, 30 minutes after the 09-19 nightly finished** (publish 14:23Z; this run reset onto `51efd6a`). The nightly had
  queued 9 Sept-22-tuning reaction videos for Supadata; all nine were fetched here with yt-dlp instead, so the metered lane spends nothing on them.
  Metadata printed in a SEPARATE invocation first for every id (all `not_live`, `was_live=False`, 4–23 min). **One caption probe first** (izen
  `iXjoMyr1LAs`) → 407 KB json3 landed, so the IP-scoped `timedtext` flag that relapsed yesterday has decayed after one day of zero caption
  traffic; the other eight were then fetched one per invocation, `--sleep-requests 3` plus a 4 s pause, **9/9 landed** (61–505 KB), no 429, no
  client shuffling, nothing installed (yt-dlp still 2026.07.04). The authenticated cookies lane was NOT needed and NOT touched.
  ⚠️ Process slip worth writing down: the first batch loop grepped for `ERROR|429` case-insensitively and stopped on yt-dlp's impersonation
  WARNING ("If you encounter **errors**…") — a false stop, the caption had landed. Match `^ERROR` / `HTTP Error 4xx`, not the word.
- **izen `iXjoMyr1LAs`** (general creator → `metaNotes[]` only; 22 min, 3,974 words, published 2026-09-18/19) → **9 raid-lens metaNotes**,
  each anchored to its own passage: Balance **mixed** (#2 overall on two spread-add bosses, outdone on every other profile), Shadow **negative**
  (last Zoroak, last Vashnik, bottom third Twin Fangs), Arms **positive** (top of Twin Fangs on two-target uptime + early execute; named a
  cross-boss consistency), Demonology **positive**, Affliction **positive** (#1 Coiled Altar with real single target in every phase), Augmentation
  **mixed** (its Coiled Altar #1 is the intermission window; irrelevant elsewhere), Marksmanship **positive**, Fury **mixed**, Windwalker **mixed**.
  11 older izen RAID-lens notes on those specs superseded (lens read off `patchContext`; his M+-lens and unscoped 08-22 tuning notes untouched).
  **Abstentions:** Arcane (named only inside the "Demo, Arms and Arcane" consistency list — list-mention rule), Beast Mastery ("honorary melee",
  list only), Survival / Retribution / Unholy (two list-mentions each, no spec-specific read), Frost Mage (one fight-profile description on Twin
  Fangs), and the three Rogues ("all of the rogues" have very high single target on Zoroak — class-level, so no per-spec note).
- **MadSkillzzTV `KYrUOokbzHc`** (09-19, 11 min) → **10 bracket-scoped takes**: Resto Druid raid **mixed** / M+ **mixed**; Mistweaver raid **buff**
  / M+ **buff**; Discipline M+ **buff** (the 40% out-of-raid Atonement; 20%+ of an Oracle's healing, ~50% of a Voidweaver's; "not S tier with Holy
  Paladin"); Holy Priest raid **mixed** (tier-set crit bug fix → HPS dips, still very good); Holy Paladin M+ **buff** (still the S-tier healer) /
  raid **nerf** (deserved an HPS buff, got none); Resto Shaman M+ **mixed** (A tier on Skyfury/Bloodlust, not healing) / raid **nerf**. **10 older
  same-lens takes superseded**, including his 09-16 M+ reads on Resto Druid, Holy Paladin and Resto Shaman — a 09-19 video outdates a 09-16 one
  in the same lens. Preservation is not mentioned in the video and got no take. `latest` NOT advanced (managedBy overrides, owner-only).
- **Shadarek ×2, same day, and the second REVISES the first** — handled by lens split rather than same-date supersession (forbidden): the
  first-reaction video `UOTX7JIDhfo` supplies the **Devourer both/buff** take (Annihilator ~5% ST / ~5% raid, all on the priority target it lacks);
  the follow-up `TupcXnUY65E`, recorded after he simmed the buffs, supplies **both Havoc takes** — raid **buff** (~9% ST, "very strong in raid",
  boss-by-boss predictions; Fel-Scarred on the lower end and untouched) and M+ **mixed** (50% more priority damage but AoE still poor, comp- and
  dungeon-specific) — with the first video's superseded read ("tiny buff, Havoc struggling in raid") recorded inside each `patchContext`. His
  08-22 + 09-03 Devourer and 08-28 raid + M+ Havoc takes superseded.
- **Nintern `9Q-7rLk1vFU`** (09-18, 4 min) → Devourer **both/mixed** (welcome ST buff; "12.1.5 then 12.2 waiting room") and Havoc **both/mixed**
  ("not particularly confident" Aldrachi is playable; DH "not great in raid" for fight-structure reasons). His 08-09 Devourer and 08-10 Havoc live
  takes superseded; the 09-16 12.1.5-PTR-preview Devourer take is a different lens and stays live.
- **NeekapHere `tE55Y-E3ljE`** → Ret **both/buff** (Templar +4–6% ST, "extremely competitive" with Herald, which stays best in raid and his M+
  pick); 08-22 take superseded. The WoW: Forever half of the video is out of scope.
- **Kesslive `zqsyJMYa9q0`** → Augmentation **both/mixed** (buffs "basically do nothing", favour a dead Scalecommander build; spec "good for
  about ten guilds") and Devastation **both/mixed** (Pyre and Shattering Star real, the rest air; "fundamental issues" a tuning post cannot fix).
  His two unscoped 07-22 12.1-PTR takes superseded — first live reads from him this season.
- **Dalaran Gaming `-OuQUMzzWTE`** (23 min, 4,750 words) → **1 take**: Arcane **both/buff** ("everybody's playing Arcane, we all know this spec is
  really good"); 08-24 Arcane take superseded. Everything else inside his Druid/Hunter/Mage/Rogue/Shaman scope is the tuning post read aloud with
  "really good to see" — no comparative read, no take (Fire/Frost: "we'll see if it's enough"; Subtlety: Deathstalker "pretty solid ST" but the
  passage is hero-talent commentary). PvP section skipped.
- **Dratnos `H8jFWzDNKSs` → `skipped[]`** (21 min read in full). His registered scope is Arms/Fury and the Warrior passage is the dev note read
  aloud, nothing of his own — a neutral would be a placeholder. **⚑ Owner flag, not actioned:** his substantive reads are all out of scope and
  several are strong — Augmentation "secretly the best spec in the game for really high-end play" (Mythic Coiled Altar / Ula'tek boss damage) yet
  mid for 95% of players; Devastation "better than the numbers look", a possible sleeper M+ spec; DPS DKs unused in raid for lacking a raid buff;
  Aldrachi funnel a dangerous profile to balance; Protection Paladin already fine. If Riley wants Dratnos widened (he is a Liquid raider and reads
  the whole roster), that is a `community.json` scope decision; the transcript is on record here.
- **Lane hygiene**: 8 distilled ids removed from `videos[]`; Dratnos added to `skipped[]` with the reason above; queue **9 → 0**, skipped
  435 → 436. One-record gate: `npm run validate` clean, `audit:creators` **HIGH 0 / MED 0 / INFO 9** (unchanged set). Registry `latest`
  advanced for Shadarek, Nintern, NeekapHere, Kesslive, Dalaran Gaming (all five class entries) and izen — each to what was actually distilled.
- **Every claim re-read against its own transcript at the deep-linked offset before the merge**; two wordings tightened in that pass (Balance's Twin
  Fangs position was gestured on screen, not spoken — written as "outdone on two-target cleave", which he does say; Kesslive does not say
  Devastation's standing "will not move", so the claim says he treats the package as padding). No ASR name was written as a person.
- Verification: `npm run test:quiet` **636 pass / 2 fail / 1 skip** — the two fails are the PRE-EXISTING ui-invariants WCL fixture tests (red on
  `51efd6a` before any edit; owner fix pending, see refresh-metrics 09-18). `expertRead` dormant (`PHASES.ptr` null) → display-only, 0
  projection movement. Snapshot written (byte-identical to the nightly's — takes are not snapshot state), rebuilt, all 28 entries present in dist.

## 2026-09-19 (nightly) — 44/44 feeds polled, 2 pre-fetched transcripts → **5 takes** (4 MadSkillzzTV, 1 Critcake), 0 metaNotes, **9 queued**

- **Discovery**: 44 unique channelIds, **44/44 HTTP 200**, 0 failures, **660 entries**. Seen-set rebuilt from structured data only = **1,274 ids**. Cycle bound `Math.min` over ptr-builds = **2026-06-18** → **348 unseen in-cycle**, 238 keyword-matching.
- **Transcripts**: `summary.json` verdict **ok**, requested 2 / fetched 2 / cached 0, usage **16** counted requests over 30d, 0 uncertain. No API-key problem to surface. No yt-dlp invocation and no transcript-API call by me.
- **MadSkillzzTV `VZH4oZxZI-U`** (10h Preservation Evoker stream, 4,228 chunks / 19,249 words, published **2026-09-14**) → **4 bracket-scoped takes**. Holy Paladin **mplus/buff** ("I want to play resto shaman but I am fully aware holy paladin is better" — more comps, better spot healing, less restrictive); Resto Shaman **mplus/mixed** (second-most-popular "legitimately raid buffs", comp-restrictive, overlaps Elemental; level with Pres/HPriest/MW on pure healing); Preservation **mplus/mixed** (damage with the new tier set is "probably the only thing that could make it desirable in really high keys"; healing good but harder, no raid buff); Preservation **raid/mixed** (the main ramp healer right now, and the missing raid buff — not throughput — is why it was absent from the race).
  - ⚠️ **Three of the four are recorded SUPERSEDED ON ARRIVAL.** The video is 09-14 but his own **09-16** M+ reads on those three specs are newer in the same lens. Only the raid Preservation take is live; it supersedes his 09-04 Preservation raid read. Worth remembering as a shape: a queued backlog can deliver a video *older* than takes already on file, and the date-sort must still be right.
  - **Abstentions.** "Elemental is doing really well" **dropped** — Elemental Shaman is outside his registered scope (healer specialist; his Shaman scope is Restoration). His Resto Druid ramp remark is a mechanics description, not a strength read. And an ASR line at **1,082s** whose subject could be read as either Holy Paladin or Resto Shaman was **not used at all** — the Holy Paladin take rests entirely on the unambiguous 5,908s passage. `latest` **not** advanced: his six entries are `managedBy: "overrides"` and that file is owner-only.
- **Critcake `OkopAG80pXg`** (pug keys into reclear raid, 5,277 chunks / 28,628 words, 2026-09-17) → **1 raid take on Fury**: objectively the worst, lowest on the raid rankings, "needs like a 50% buff", the mid-season weapon helps but changes nothing meaningful, Blizzard will likely buff it soon — **and he then checks live and corrects himself**, Fury has climbed off the bottom while Heroic is still bottom. The correction is in the claim; a read that ends where the speaker stopped talking would have been wrong. Anchored to him by self-reference ("Blizzard would likely buff **us**"). Supersedes his 08-10 `both` Fury read, whose M+ half his 08-29 M+ take already replaced. `latest` advanced.
- **Queued 9 of the 25/run cap**, all 09-18/19 and all dedicated tuning or meta analysis rather than gameplay: izen `iXjoMyr1LAs` (S2 raid DPS meta, the metaNotes archetype), MadSkillzzTV `KYrUOokbzHc` (12.1 healer changes), Shadarek `UOTX7JIDhfo` + `TupcXnUY65E`, NeekapHere `tE55Y-E3ljE`, Kesslive `zqsyJMYa9q0`, Dratnos `H8jFWzDNKSs`, Nintern `9Q-7rLk1vFU`, Dalaran Gaming `-OuQUMzzWTE`. The Sept 22 tuning pass generated an unusually rich crop of spec-level reaction videos — worth spending the budget on.
- **Declined, and NOT marked seen** (229 other keyword matches): stream VODs, key/boss PoVs, guides, *WoW: Forever* beta content. Two named declines: **Supatease `lvXugC_JcAY`** ("12.1.5 Emergency Class Tuning Update") — PvP-framed creator, and 12.1.5 is the notes-only lane; **LBNinja7 `Ljq_r4zAa0g`** ("They did it… Mistweaver BUFFED!!") — hashtag title with an **empty `media:description`**, the clip-short shape.
- Both distilled ids removed from `videos[]` in the same edit; one-record gate passes. `audit:creators` **HIGH 0 / MED 0 / INFO 9**. `expertRead` still dormant (`PHASES.ptr` null), so these takes are display-only.

## 2026-09-18 (nightly) — 44/44 feeds polled, 1 pre-fetched transcript → 10 LBNinja7 healer takes, 2 queued, 0 metaNotes

- **Discovery**: 44 unique channelIds (116 class entries + 3 generalCreators), **44/44 HTTP 200**, 0 failures. Seen-set rebuilt from structured
  data only — **1,272 ids**. Cycle bound `Math.min` over ptr-builds = **2026-06-18**. **341 unseen in-cycle**, 244 keyword-matching.
- **Transcripts**: none fetched by me. `transcript-fetch/summary.json` verdict **ok**, requested 1 / fetched 1 (`ALQD4CucMB0`, 553 chunks),
  usage 14 counted requests / 30d. No API-key problem to surface.
- **Distilled**: LBNinja7 "Healer Balancing is... CONCERNING!!!" (2026-09-18) → **10 bracket-scoped takes**. M+ (his own hand count of the
  leaderboard top 500): Holy Paladin **buff** (354 of 500), Resto Shaman **buff**, Holy Priest **buff** (1→20 across the range), Disc Priest
  **nerf** (absent through top 400), Resto Druid **nerf**, Mistweaver **nerf** (5→13). Raid (WCL Mythic HPS chart): Holy Priest **buff**
  (highest average, max AND min), Mistweaver **nerf** (lowest; his own parse 70k HPS behind a Holy Priest for a 12% worse parse), Resto Shaman
  **nerf**, Disc Priest **nerf** (chart position flattered by a ~1,000-log die-hard sample, on his own reading).
- **Deliberate abstentions**: **Preservation Evoker got no take** — its only appearances are membership in representation lists, which is not a
  read. His closing M+ tuning ask contains two ASR-mangled ability names; only Vivify and "spot healing" were written, the mangles paraphrased.
- **Supersession**: 9 of his older live takes retired — same-lens replacements plus the general `both`/unscoped reads for the four specs where
  this run lands both brackets. His Holy Paladin and Resto Druid general reads stayed live as complementary (only M+ landed for those).
- **Lane hygiene**: `ALQD4CucMB0` removed from `videos[]` in the same edit. Validation's one-record gate reds on the overlap and it fired
  during this run before the merge — it works. Six LBNinja7 registry `latest` strings advanced to what was actually distilled.
- **Queued (2)**: MadSkillzzTV `VZH4oZxZI-U` (healer M+/raid stream, 09-14) and Critcake `OkopAG80pXg` (keys/raid stream, 09-17) — both
  creators whose streams yielded takes this month. The other 242 keyword matches were **not** queued and **not** marked seen: Blizzcon recaps,
  WoW: Forever beta coverage, boss/dungeon PoVs and guides carry no live-season spec-strength read, and a budget/keyword cut is not durable.
- yt-dlp probed **once** for metadata → the known datacenter bot wall ("Sign in to confirm you're not a bot"). No further YouTube requests, no
  version change. `audit:creators` HIGH 0 / MED 0.

## 2026-09-18 (local, scheduled) — THE CAPTION 429 IS BACK (first relapse since the 09-11 clearance); queue **0 → 1** (LBNinja7's healer-balance read queued for tonight's Supadata drain), 0 takes, 0 metaNotes — run BEFORE today's nightly

- **Scope: residential-only catch-up, run BEFORE today's nightly** (no schedule event by 14:20Z; the last poll was the 09-17 nightly's
  15:16Z sweep). RSS discovery re-run: **44/44 channels HTTP 200** (0 failures), **660 entries**. Seen-set = structured union of the four
  lanes = **1,272 ids** (no log regex). Cycle bound `min(builds[].date)` = **2026-06-18** → **342 unseen in-cycle**, of which **28 are
  newer than 2026-09-17T14:30Z**. Titles AND `media:description` read for all 28.
- **Three candidates chosen for a caption fetch**, metadata printed in a SEPARATE yt-dlp invocation first (all normal VODs, none live):
  LBNinja7 `ALQD4CucMB0` "Healer Balancing is... CONCERNING!!!" (09-18, 21:54 — a healer-balance talk video from the broad healer
  specialist, the one clear spec-read candidate); Dalaran Gaming `uyfaXIhTzzA` "5 Things You MUST Do This Week" (8:34, a weekly to-do
  that might carry a tuning note); Maximum `GBTie1Efs-k` "LIQUID WON THE MDI!!!" (65 min, a general-creator reaction that might carry a
  comp read).
- **Captions: 0/3 — `HTTP Error 429: Too Many Requests` on the `timedtext` download for every one**, the same IP-scoped abuse-flag
  shape as 08-23→09-10 (android player API, formats, titles and durations all resolve clean; only the subtitle fetch 429s). The 09-11
  clearance held for ten consecutive clean local runs through 09-17 (10/10 captions yesterday) and has now relapsed. ⚠️ Three videos were
  attempted in one loop rather than stopping on the first error — a process slip, not a retry (each id got exactly one attempt, no
  client shuffling, no backoff ladder). Nothing installed or upgraded (yt-dlp still the local 2026.07.04); no Supadata request.
- **The authenticated fallback was again NOT used, same reasoning as 09-02/09-03.** A genuine Netscape export
  (`~/Downloads/www.youtube.com_cookies.txt`, 2026-08-24, 23 youtube.com records — NOT the 792-byte robots.txt the 08-30 run found
  beside it) IS on disk, so the lane now has a usable credential — but SKILL.md scopes it QUEUE-ONLY as a bridge for a queued backlog,
  and an unattended scheduled run moving a logged-in Google session around is the wrong shape regardless. **Owner decision, unchanged:**
  if Riley wants scheduled runs to use that file when the anonymous lane 429s, say so explicitly; until then it stays untouched.
- **Queue 0 → 1: `ALQD4CucMB0` queued** (`{id, creator: "LBNinja7", title, published 2026-09-18, queuedAt 2026-09-18}`) — in scope by
  creator and content (all six of his registered healer specs are plausible subjects), transport-blocked, and its title carries no class
  or spec NAME, so the nightly's own keyword discovery might not queue it; tonight's Supadata drain (different network path, proven
  unaffected by this flag) should land it. **The other two stay UNQUEUED** per "fetch broadly, queue narrowly" — neither title carries
  class/spec/12.1/Season signal, and a metered request on a to-do list or an MDI reaction is exactly what the nightly filter exists to
  avoid. Neither goes to `seen[]` (transport dismissals stay unseen; they will be reconsidered by the next clean local run).
- **Declined from title + description, not fetched, nothing to `seen[]`** (25 of 28): stream VODs and key/reclear PoVs (Shadarek ×2
  Havoc +20s, Bansherz BM +20 / Kith'ix PTR MM PoV / M raid stream, YoDaTV ×2 VDH +20s, AutomaticJak Holy Priest key, Critcake pug keys,
  Preheat Coiled Altar Arcane, Kalamazi / Tactyks / Shindigg Coiled Altar prog streams, Megasett prog stream); *WoW: Forever* beta
  content (Supatease ×6 incl. the Dev Q&A reaction, NeekapHere ×2, Whispyr); Dalaran Gaming PvP duels; AutomaticJak's Eiiko
  cooldown-planner addon video.
- 0 takes, 0 metaNotes, 0 verified skips. `data/creator-takes.json` untouched; `npm run validate` clean. `expertRead` remains dormant
  between cycles (`PHASES.ptr` null).

## 2026-09-17 (nightly) — 44/44 feeds polled (660 entries); queue was empty when the collector ran, so **0 transcripts, 0 takes, 0 metaNotes**; **0 queued** — the one upload since this morning's local sweep is *WoW: Forever* content

- **Discovery:** all **44** unique tracked channels polled inline via the public RSS endpoint (116 class-creator entries + 3 `generalCreators` collapse to 44 distinct `channelId`s once `transcribable: false` and id-less entries drop), **44/44 HTTP 200** with retry+backoff, **0 failures**, **660 entries**. Nothing backgrounded, no subagents.
- **Seen-set from STRUCTURED DATA only** — union of `pending-transcripts.json` `seen[]` (550) / `skipped[]` (435) / `videos[]` (0) and every `youtu.be` id in a take or metaNote url = **1,271 ids**. `log.md` prose was not regexed. **339 unseen**, every one of them inside the cycle bound `min(builds[].date)` = **2026-06-18**; the nightly keyword filter narrows that to **163**.
- **TRANSCRIPTS: none to read.** `transcript-fetch/summary.json` reports verdict `ok`, requested 0 / fetched 0 / cached 0 — the queue was empty when the deterministic step ran, because this morning's residential local run drained it 8 -> 0. Usage: 13 counted requests in the 30-day window, `limit` null. So **0 takes and 0 metaNotes** tonight: an honest nothing, not a skipped step. No agent-side fetching of any kind — no yt-dlp, no transcript API.
- **QUEUED 0, and the reasoning is measured rather than assumed.** I re-polled every channel that uploaded today for exact `<published>` timestamps: exactly **one** upload lands after the local run's 14:23Z sweep — Supatease **S-696GEbfks** "WoW Forever Priest Overview (All New Skills) Is It Any Good?" at **15:16:35Z**, which is Classic+ / *WoW: Forever*, a different game mode with no Midnight S2 read. Everything else from 09-16/09-17 was already handled this morning: 8 ids transcript-verified into `skipped[]`, the rest shape-declined there (Obli's Twin Fangs PoV, Tactyks' Kith'ix testing + BlizzCon recap, Shadarek x3, YoDaTV x5, Bansherz x2, MadSkillzzTV, Whispyr's Kith'ix first look, Sha's Season-3 video, AutomaticJak's addon video, Dalaran Gaming's duels + alt PSA, six Supatease *Forever* overviews, Kalamazi's *Forever* Warlock talents, Preheat/Tettles/Shindigg/Clandon/Musguete streams). Queueing those would spend metered Supadata requests on exactly the shapes the nightly filter exists to avoid.
- **Nothing was written to `seen[]`** — a keyword, budget or shape decline is not a durable dismissal, so all 339 stay genuinely unexamined and reconsiderable by the next local run. `data/pending-transcripts.json` is unchanged this run.
- For the record, the residual 163 keyword hits are the documented zero-yield shapes: key/raid PoVs and stream VODs (Shadarek, YoDaTV, Bansherz, leak, Musguete, Reholy, LBNinja7, Critcake, Baze), Dalaran Gaming's **PvP** 5v5-duel series (PvP is out of scope and must never vote in PvE), *WoW: Forever* / Classic+ overviews, guide-shaped uploads (Dorki's Arms M+ damage guide, AutomaticJak's Resto Shaman M+ guide, Shadarek's route guide) and item/gear-level PSAs (Whispyr's "Bye Bye Puzzle Box" trinket/SimC override video is item-level throughout).
- No creator scope widened, no `latest` advanced (nothing distilled), no take or metaNote minted without a transcript, nothing added to `creator-predictions.json` (no published tier list or rank order was captured). Creator opinion moved no tier; `expertRead` remains dormant between cycles (`PHASES.ptr` null), so the take lane is display-only.


## 2026-09-17 (local, scheduled) — queue **8 → 0** drained through the anonymous yt-dlp lane (10/10 captions, no 429) plus one fresh in-scope video: **3 takes** (Obli's Unholy/Frost DK raid read), 0 metaNotes, **9 verified skips** — run BEFORE today's nightly

- **Scope: residential-only catch-up, run BEFORE today's nightly** (no schedule event by 14:23Z; the last poll was the 09-16 nightly's 15:08Z
  sweep). RSS discovery re-run: **44/44 channels HTTP 200** (0 failures), **660 entries**. Seen-set = structured union of the four lanes =
  **1,269 ids** (976 seen+skipped + 8 queued + 285 distilled-only take/metaNote urls; no log regex). Cycle bound `min(builds[].date)` =
  **2026-06-18** → 536 in-cycle, **341 unseen in-cycle**, of which **39 are newer than 2026-09-16T14:30Z**. Titles AND `media:description`
  read for all 39; metadata (`duration`, `live_status`, `was_live`) printed in a SEPARATE yt-dlp invocation from the caption downloads
  for the ten candidates (the simulate-mode trap). All ten are normal 8–36 min VODs, none live, none sub-minute.
- **Captions: 10/10 landed via the anonymous lane** (json3, `--sleep-requests 3`, one video per invocation, stop-on-first-error): **0
  errors, no 429** — the tenth through nineteenth consecutive clean probes since the August flag. Nothing installed or upgraded (yt-dlp
  still the local 2026.07.04; the impersonation warning is cosmetic); no cookies, no authenticated lane, no Supadata request.
- **The 8 queued by the 09-16 nightly were all transcript-verified and all yielded NOTHING — moved to `skipped[]` with reasons, which
  is the point of draining them here rather than spending 8 metered requests tonight:** Supatease `f6jLlrhXSDg` (read-aloud of the
  12.1.5 post #4 notes with PvP asides — every spec line restates the official note already in the preview ledger); izen `rb9dofIbc_A`
  (12.1.5 Kith'ix cantrip loot by armour type — gear-lane, and its 344-ilvl figure is already superseded by this week's PTR build per
  Wowhead 382926) and `B3_WVUOrqks` (BlizzCon day-1 recap; "Arcane is the meta mage" is a passing example for the new spec-based M+ title
  percentiles, not a read); NeekapHere `smqnFDWL7D0` (12.1.5 systems notes + the 7M-gold mount, "no paladin changes") and `323h0qlDbJo`
  (roadmap); Dalaran Gaming `yRa_jes8GFs` (BlizzCon systems recap); Baze `nSB8oQYupl4` (36-min live reaction to the Midnight panel — no
  Arms/Fury read; "monk tanks happen to be the meta" is a hypothetical for the title change); Dratnos `mSNa0_bbpak` (RWF day-12 recap:
  the Coiled Altar nerf/revert saga and Vantus calculus, no spec read). Grep triage was proved on the known-positive Obli file first.
- **Obli `u2JZWKphGfM` "What changes does Unholy DK need to be good? / Midnight 12.1 Season 2" (2026-09-17, 8:05)** → **3 takes**, all
  his own reads argued from the WCL 95th-percentile spec rankings, per-boss breakdowns and his own Twin Fangs kills on both DKs:
  **Unholy raid nerf** ("not looking great", right at the bottom of the rankings; low-target and spread cleave "so, so bad", single target
  "not great"; exceptions Vashnik/Sszorak on cooldown timing and possibly Coiled Altar for San'layn once logs exist; wish list = Necrotic
  Coil main-target buff, Dread Plague knob, a two-target Death Coil talent) — supersedes his 09-04 raid mixed; **Unholy M+ neutral**
  ("not so bad in Mythic+ — actually pretty decent … absolutely fine, no issues") — a genuine expressed steady read, not a placeholder;
  supersedes his 08-28 M+ buff; **Frost raid mixed** (also low in the rankings, "still being here isn't great", but shines on The Lost
  Explorers and Twin Fangs on two-target cleave, beat his own Unholy on Twin Fangs, and is his Mythic-progression pick for always-available
  damage) — supersedes his 09-04 raid buff. His 09-14 Frost M+ read stands (different lens). Not distilled: "Warlocks and Shadow Priests
  are having a great time on Sentinels" (a comparison point, outside his scope) and the Fury "haven't seen a single one" aside.
- **izen `oiREXpVWxQk` "Season 2's BiS Gear Problem: AWFUL Trinket Season" (2026-09-16, 19:24)** — fetched because izen is the
  highest-yield general creator; it is Complain Caturday on trinket distribution (raid last-boss Guillotine / Dooming Idol / Font of
  Venomous Rage / Voracious Heart vs weak M+ trinkets, and the Sept-22 trinket tuning). **Item-level throughout, no spec-level read** —
  an item- or gear-level claim never mints a spec take → `skipped[]`. Gearing-lane context only.
- **Declined from title + description, not fetched, nothing to `seen[]`** (shape/relevance declines are not durable dismissals): stream
  VODs and key/reclear PoVs (MadSkillzzTV healer stream, LBNinja7, Musguete Sszorak Sub PoV, Shadarek ×3, YoDaTV ×5, Bansherz ×2 incl. the
  Heroic Kith'ix PTR MM PoV, Clandon, Sha, Shindigg ×2, Preheat, Tettles, Tactyks' Kith'ix testing stream, Maximum's Kith'ix testing,
  Zorthas' Ula'tek Ele PoV); BlizzCon / *WoW: Forever* content (Tactyks' BlizzCon recap + future-of-content, Supatease ×6 Forever
  overviews, Shindigg vlog, Dalaran Gaming Talebound); PvP (Dalaran Gaming Feral-vs-Rogue duels); Whispyr's Kith'ix first look and Sha's
  Season-3 dungeon-pool video (encounter/dungeon content, no spec read); AutomaticJak's cooldown-planner addon video; Dalaran Gaming's
  alt-catch-up PSA. **Obli `5Itu4dmNP8M` "THE TWIN FANGS MYTHIC / Unholy DK POV"** (description: "it's DEFINITELY the weaker spec but…")
  was NOT fetched: the same-day talk video above is his full statement of that read and a PoV would only re-derive it.
- **Supersede pass (same creator + same spec + same lens): 3 Obli takes retired** (09-04 Unholy raid, 08-28 Unholy M+, 09-04 Frost raid);
  Obli live takes stay at 4. **Lane discipline:** the 8 drained ids left `videos[]` in the same edit they entered `skipped[]`; the
  distilled id sits in no lane; `npm run validate` clean.
- **Queue 8 → 0. 3 takes, 0 metaNotes; `latest` advanced for Obli only** (states what was distilled). No creator scope was widened. A
  single-spec standing read is not a published tier list → nothing for `creator-predictions.json`. No creator opinion moved any tier;
  `expertRead` remains dormant between cycles (`PHASES.ptr` null), so the take lane is display-only.

## 2026-09-16 (nightly) — 44/44 feeds polled; queue was empty when the collector ran so **0 transcripts, 0 takes, 0 metaNotes**; **8 in-scope videos queued** for the next drain

- **Discovery:** all **44** unique tracked channels polled inline via the public RSS endpoint (116 class-creator entries + 3 `generalCreators` collapse to 44 distinct `channelId`s once `transcribable: false` and id-less entries are dropped), **44/44 HTTP 200** with retry+backoff, 0 failures. Nothing backgrounded, no subagents.
- **Seen-set from STRUCTURED DATA only** — the union of `pending-transcripts.json` `seen[]` (550) / `skipped[]` (426) / `videos[]` (0) and every `youtu.be` id in a take or metaNote url — **1,261 ids**. `log.md` prose was not regexed.
- **343 unseen** videos surfaced; the nightly keyword filter (class/spec · Midnight · 12.1 · 12.1.5 · 12.2 · Season · tuning · tier list, title **plus** `media:description`) narrows that to **114**.
- **TRANSCRIPTS: none to read.** `transcript-fetch/summary.json` reports verdict `ok` with **requested 0 / fetched 0 / cached 0** — the queue was empty when the deterministic step ran, because this morning's residential local run had just drained it (7 takes + 15 metaNotes). So **0 takes and 0 metaNotes** were distilled tonight: an honest nothing, not a skipped step. Usage tracking shows 13 counted requests in the 30-day window, `limit` null.
- **No agent-side fetching.** I hold no transcript credentials. One `yt-dlp` **metadata** probe (`--print`, no subs) was attempted to check live-status/duration and returned the documented datacenter bot wall — *"Sign in to confirm you're not a bot"* — so I stopped immediately rather than retrying or trying a client workaround. Live/clip detection therefore fell back to RSS title+description shapes for this run.
- **QUEUED 8**, narrow by design (the queue is drained with metered requests, so locally-broad ≠ nightly-broad): Supatease **f6jLlrhXSDg** "12.1.5 Class Tuning Udate"; izen **B3_WVUOrqks** (BlizzCon 15-min recap) and **rb9dofIbc_A** (12.1.5 patch reveal); Baze **nSB8oQYupl4** ("Midnight Eclipse 12.2 Reaction | M+ rotation"); NeekapHere **323h0qlDbJo** (Midnight roadmap) and **smqnFDWL7D0** (12.1.5 PTR development notes); Dalaran Gaming **yRa_jes8GFs** (Season 3 reveal); Dratnos **mSNa0_bbpak** (RWF day 12 recap). Every id came from this run's own live RSS fetch with an author match — none is a search-result guess.
- **The other 335 unseen were left UNSEEN, deliberately** — a keyword/budget cut is not a durable dismissal and `seen[]` takes durable dismissals only. For the record, the bulk of the 114 keyword hits are shapes the distillation rules already say yield nothing: Shadarek/YoDaTV/Reholy/leak/J-Funk/Critcake gameplay PoVs, Dalaran Gaming's "5v5 1v1 Duels" **PvP** series (PvP is out of scope and must never vote in PvE), **WoW: Forever / Classic+** content (Kalamazi `2H-yHytwg-s` Forever Warlock talents, Psybear `LvanKc5FPxM`, Supatease `POSft313GdI` — a different game mode, no Midnight S2 read), guide-shaped uploads (Dorki `eoh6M6x0ohU` Arms M+ damage guide, Shadarek `fjBuMMigym0` route guide) and item-level PSAs (Shadarek `FHbZ5oWpl6U` trinket tuning, `Q-pRDTz8D6Y` catalysed-tier-set logging PSA) — an item- or gear-level claim never mints a spec take.
- No creator scope was widened, no `latest` field advanced (nothing was distilled), no take or metaNote minted without a transcript, and creator opinion moved no tier. `expertRead` remains dormant between cycles (`PHASES.ptr` null), so the take lane is display-only right now — which is also why nothing here touched a projection.

## 2026-09-16 (local, scheduled) — queue 0 → 0, but FIVE in-scope videos fetched and distilled locally: **7 takes + 15 metaNotes** (izen Week-4 M+ recap, MadSkillzzTV healer read, two Devourer 12.1.5 reactions, Critcake Arms); anonymous caption lane clear — run BEFORE today's nightly

- **Scope: residential-only catch-up, run BEFORE today's nightly** (no schedule event by 14:21Z; last poll was the second 09-15 nightly's
  ~15:54Z sweep). RSS discovery re-run — it costs no caption traffic: **44/44 channels HTTP 200** (119 creator entries → 79 pollable → 44
  distinct channels, 0 transcribable creators missing a `channelId`), **660 entries**, 0 failures. Seen-set = structured union of the four
  lanes = **1,255 ids** (549 seen + 426 skipped + 0 queued + 280 distilled-only take/metaNote urls; no log regex). Cycle bound
  `min(builds[].date)` = **2026-06-18** → 535 in-cycle, **348 unseen in-cycle**, of which **30 are newer than 2026-09-15T15:30Z**. Titles
  AND `media:description` read for all 30; metadata (`duration`, `live_status`, `was_live`) printed in a SEPARATE yt-dlp invocation from
  the caption downloads for the six candidates (the simulate-mode trap).
- **Six candidates, five fetched, one durable dismissal.** Captions via the anonymous yt-dlp lane (json3, `--sleep-requests 3`, one video
  per invocation, stop-on-first-error): **5/5 landed, 0 errors, no 429** — the lane is clear for a fifth, sixth, seventh, eighth and ninth
  consecutive probe after the August flag. Shindigg `kAb3PLNfGKk` "Addressing the Elephant in the room... ft. Dratnos" is a **58-second
  clip** → `seen[]` (sub-minute duration is a durable fact). Nothing installed or upgraded (yt-dlp still the local 2026.07.04; the
  "no JavaScript runtime" deprecation warning is cosmetic — captions still download); no cookies, no authenticated lane.
- **izen `7ZaRcXRH8u4` "Season 2 Mythic+ Week 4 | Meta Specs, Best Comps &...Havoc? Feral? What is this?" (2026-09-15, 23:05, 582
  events)** — the Week-3 recap's direct successor, same M+-outlook lens → **15 metaNotes**, one per genuine spec-level read: Demonology
  (positive: ~20% of 15+ keys, fifth DPS played, one in the top 100), Arcane (positive: now the LEAST-replaced meta DPS and the premier
  priority-damage spec; drops out most from +15 to +20), Arms (positive: in the top-keys trio after its buffs, but a swapped slot),
  Elemental (mixed: top trio but AoE without main-target focus, swapped most), Assassination (positive: the one growth confirmed at the very
  top, replaces Arcane at +20), Havoc (mixed: passed Devourer on play rate, damage "fine", no prio), Devourer (negative: fewer keeping up,
  passed by Havoc), Feral (mixed: top-end hipster pick in physical comps, gone by 15s), Balance (negative: dropped out of meta contention —
  squishy, small-pull season), Windwalker (mixed: good to ~16–18, pad damage, squishy), Guardian (mixed: share 11→~20 out of the other
  tanks, tankier, damage gap to Blood), Blood (positive: easily ahead on tankiness AND damage), Brewmaster (mixed: still one of the two
  de facto top-end melee-comp picks, no broader share read), Resto Shaman (positive: the physical-comp healer for Windfury, ~18% of keys),
  Holy Paladin (positive: default healer to 20–22; a Lightsmith-HPS doubt at very high keys). **Not distilled**: Retribution ("pretty
  much always extremely popular" — popularity only, no strength read), BM Hunter / Outlaw / Subtlety (bare list mentions in the
  top-average-score enumeration; the "Assassination is winning out" comparison is recorded on Assassination, not minted as Outlaw/Sub
  negatives), Mistweaver / Disc (not named). Sept-22 class tuning mentioned as upcoming — a lead already held by ptr-watch (topic 2335871).
- **MadSkillzzTV `6g8e91B7DDg` "12.1 Resto Druid is the BEST MDI Healer? | M+ Healer Meta & More" (2026-09-16, 12:15)** → **4 M+ takes**,
  all his own reads with his own MDI-does-not-translate disclaimer: Resto Druid (mixed: MDI-dominant on the Keeper of the Grove / Call of
  the Elder Druid / Dream of Cenarius damage-healing build he does not expect to work in real high keys; live build is Wildstalker),
  Preservation Evoker (mixed: the damage and priority damage to have made MDI, held out by Blessing of the Bronze), Holy Paladin (buff:
  the best high-key healer, climbing weekly), Resto Shaman (mixed: HPS not much different from other healers, propped up by
  Skyfury/Bloodlust utility). **Not distilled**: Vengeance DH and Assassination (MDI reads, and outside his registered healer scope);
  "Holy Priest / Mistweaver can heal for a lot too" (a single comparative aside, not a spec read). He reads Archon's auto-generated
  tier list on screen at ~10:40 but states his own agreement/disagreement — the takes carry HIS reasons (spot healing, safety, utility),
  not the list's letters.
- **Nintern `lgKrVkwJcfc` "CASTER CLEAVE IS BACK?! | 12.1.5 PTR Devourer Patch Notes 9/15" (2026-09-16, 10:15)** → **1 take**, Devourer,
  mixed, `both`, patchContext **"12.1.5 PTR preview — NOT LIVE"** (the 09-03/09-05 precedent): happy with the reshuffle, "doesn't solve our
  problems necessarily", excited by a speculative four-points-in-Midnight caster-cleave build he himself labels 1 a.m. plane conjecture.
  Supersedes his 09-03 preview reaction (`JMVnCyVzlNM`); his 08-09 live guide read stands.
- **VooDooSaurus `kgkTd-wi-mE` "MASSIVE Devourer Talent Tree Changes! But do they change anything?" (2026-09-16, 17:35)** → **1 take**,
  Devourer, mixed, `both`, same NOT-LIVE lens: loves The Hunt/Eradicate reachability and Annihilator's gains (Demonic Instinct, an extra
  Void Ray per meta from 2.5s Voidpurge), "big improvement" on last week, but playstyle barely changes, AFK Void-Scarred likely still
  correct, too many hard casts, real fixes are 12.2-sized. Supersedes his 09-05 first-look (`qthDWT2G9NM`); his 08-17 live read stands.
  Both Devourer reads verified against the official post #4 text read in ptr-watch tonight (18% / 2.5s / middle-gate moves all match).
- **Critcake `ccjTZkATHRU` "+20 Voidscar Arena - Arms Warrior" (2026-09-16, 30:11)** → **1 M+ take** from the 0:00 intro answering
  "is Arms actually S tier?": A+ or S− in keys — two-target unmatched, single-target prio matched by others, easily out-AoE'd; "not as
  good as the hype but still really good". Mixed. Supersedes his 08-29 M+ neutral (`S2nGA4gww8I`). The remaining 28 minutes are the key
  run (grepped: one in-run line "we're best at two targets, three targets, and we do really good prio damage", consistent, no separate
  claim). A single-spec placement is not a published tier list → nothing for `creator-predictions.json`.
- **Supersede pass (same creator + same spec + same lens): 14 izen metaNotes retired** — 11 from the 09-07 Week-3 recap
  (`zf9FpCLuTeI`), 2 from the 09-01 M+ outlook (`4z49EhVeP7I`: Balance, Windwalker), 1 from the 08-16 pre-launch M+ tier list
  (`KktdoK1OZVY`: Guardian) — **and 7 takes** (MadSkillzzTV's 09-04 M+ HPal/Pres/RSham + the 09-01 whole-spec Resto Druid short, whose
  raid half is separately held by his 09-04 raid take; Nintern 09-03; VooDooSaurus 09-05; Critcake 08-29). ⚠ A first pass over-matched:
  a `/Mythic\+|M\+/` lens regex also retired izen's **08-17 RAID predictions** (`okaZqAQVRN0`, 7 notes) and his **08-29 tuning
  walkthrough** (`bDElWkJxvtY`, 5 notes) because their patchContexts mention Mythic+ in passing; both were restored from HEAD before
  anything was committed. Earlier runs deliberately kept those two videos live beside the weekly M+ recaps — the raid lens is a different
  lens, and a tuning walkthrough is not a weekly recap. izen live metaNotes 104 → 105.
- **Declined from title + description, not queued, nothing to `seen[]`** (shape/relevance declines are not durable dismissals): stream
  VODs / reclear and key PoVs (LBNinja7, Bansherz, Tactyks "YAPPING INTO RECLEAR", Whispyr, Shindigg ×2, Shadarek, Clandon, Preheat
  Arcane raid, Supatease stream, Critcake keys, Tettles, Dalaran Gaming livestream); BlizzCon / *Forever* content (Kalamazi's Forever
  Warlock talent review, Psybear's Forever class updates, Preheat's vlog — a different game version); PvP (Dalaran Gaming Balance
  duels); vault/loot openings (Dratnos, NeekapHere); Supatease `f6jLlrhXSDg` "12.1.5 Class Tuning Udate" (clip-short shape, description
  copies the title, and his comparative reads are PvP-framed by the 08-09 rule); Whispyr `WtRqmNBkcEo` "Bye Bye Puzzle Box" (trinket
  nerf — an item-level claim never mints a spec take; same call as Shadarek's trinket video on 09-15). The three 09-15 Supatease *Forever*
  uploads were already declined by the second nightly.
- **Queue 0 → 0. 7 takes, 15 metaNotes; `latest` advanced for izen, MadSkillzzTV, Nintern, VooDooSaurus, Critcake** (each states what was
  distilled, never merely the newest upload). The 09-14 Dorki Arms scope flag still awaits Riley. No creator opinion moved any tier —
  metaNotes are display + the ±3 nudge only, and takes feed `expertRead`, which is era-dormant while `PHASES.ptr` is null.

## 2026-09-15 (nightly, second run of the day) — 44/44 feeds polled, 660 entries; 3 genuinely new videos, all *WoW: Forever* — 0 queued, 0 takes

- **Discovery**: all **44** unique tracked channels polled inline via the public RSS endpoint (116 class-creator entries
  + 3 `generalCreators` collapse to 44 distinct channels; `transcribable: false` reference entries skipped by design;
  **0** pollable creators missing a `channelId`). **44/44 succeeded** with retry+backoff, **660 entries**, 0 failures.
- **Seen-set** rebuilt as the structured union of the four lanes (`videos[]` 0 + `skipped[]` 426 + `seen[]` 549 + every
  `youtu.be` id in a take or metaNote url, 280 distilled) = **1,255 ids**. `log.md` was not regexed. Cycle bound derived
  as `min(builds[].date)` = **2026-06-18** — the date, never an index — giving **336 unseen** in-cycle entries, of which
  **16 are dated 2026-09-15 UTC** and **three are new since the 15:17Z sweep earlier today**.
- **The three new ones are all Supatease, all *WoW: Forever*, all declined from title + `media:description` without
  spending a metered request**: `POSft313GdI` "WoW Forever Paladin Overview" (15:32Z), `yC-bdPm3724` "Best Race WoW
  Forever" (15:54Z), `FBaKWdgvvg8` "Best Racials WoW Forever" (15:58Z). Two things rule them out independently: the
  content is a **different game version** and carries no Midnight Season 2 PvE spec read, and Supatease's comparative
  reads are **PvP-framed** by construction (the 2026-08-09 rule — a PvP read must never vote in PvE). The `#midnight`
  hashtag in two of the descriptions is channel boilerplate, not a subject.
- **0 takes, 0 metaNotes, 0 queued.** `transcript-fetch/summary.json` verdict **`ok`**, requested 0 / fetched 0 /
  cached 0 — the queue was already empty, so the deterministic step had nothing to drain and there was no transcript to
  distil. Usage receipt: 13 counted requests in the 30-day window, 0 uncertain, limit `null`. `creator-takes.json` and
  `data/pending-transcripts.json` are **byte-unchanged**. No filler neutral was minted to record that the sweep happened,
  and no `latest` was advanced.
- **Nightly keyword filter kept** (Supadata requests are metered); breadth belongs to local yt-dlp runs. No YouTube or
  transcript-API request was made by me at all.
- **Nothing moved to `seen[]`.** These are shape/scope declines, not durable dismissals, so all 336 stay unexamined and
  reachable by a future local unfiltered sweep — which is what keeps the accounting auditable.
- **⚑ SCOPE FLAG STILL OPEN FOR RILEY** (re-stated, not acted on, third night running): Dorki's "How To Do HUGE DAMAGE On
  Arms Warrior In M+ | Midnight 12.1" (`eoh6M6x0ohU`, 2026-09-14) stays **doubly excluded** — guide-shaped content
  carries no spec-strength read, and every Dorki entry in `community.json` is tank-scoped, so Warrior|**Arms** is outside
  his registered scope and no take could be attributed without a human widening it.
- No creator opinion moved any tier.

## 2026-09-15 (nightly) — 44/44 feeds polled, 660 entries, 0 transcripts available, 0 queued, 0 takes

- **Discovery**: all **44** unique tracked channels polled inline via the public RSS endpoint (119 creator entries → 79
  transcribable with a `channelId` → **44 distinct channels**; the 40 `transcribable: false` reference entries skipped by
  design; **0** pollable creators missing a `channelId`). 44/44 succeeded with retry+backoff, **660 entries**, 0 failures.
- **Seen-set** rebuilt as the structured union of the four lanes (`videos[]` 0 + `skipped[]` 426 + `seen[]` 549 + every
  `youtu.be` id in a take or metaNote url, 280 distilled) = **1,255 ids**. `log.md` was not regexed. Cycle bound derived
  as `min(builds[].date)` = **2026-06-18** — the date, never an index — giving **336 unseen** in-cycle entries, of which
  **26 are dated 2026-09-14 or later** and **13 are new since the 09-14 nightly sweep**.
- **0 takes, 0 metaNotes, 0 queued — the honest outcome.** `transcript-fetch/summary.json` verdict `ok`, requested 0 /
  fetched 0 / cached 0: the queue was already at 0, so there was nothing for the deterministic step to drain and nothing
  to distil. `creator-takes.json` and `data/pending-transcripts.json` are byte-unchanged (queue 0, skipped 426, seen 549).
  No filler neutral was minted to record that the sweep happened, and no YouTube or transcript-API fetch was made.
- **Nothing queued.** The nightly keyword filter was kept (Supadata requests are metered). **10** of the new videos pass
  it and all 10 are documented zero-yield or out-of-scope shapes, settled from title **plus `media:description`** without
  spending a metered request: item-level tuning news (Shadarek "Trinket Tuning | Puzzle Box Nerfed & Healer Trinket
  Buffs" — a gear-level claim is never a spec read, and it recaps the very blue post logged in ptr-watch tonight),
  guide-shaped how-tos (Shadarek's Raidbots dungeon-route simming guide; Sha's Ruby Life Pools tank-pull coaching
  session), PvP (Dalaran Gaming's 5v5/1v1 Balance Druid duels), BlizzCon / Forever / Season 3 announcement news (Dalaran
  Gaming ×2, Psybear, Tettles' "I skipped raid to go to Blizzcon"), and a stream VOD (MadSkillzzTV Preservation Evoker).
  The other 16 are key-run and raid-prog PoVs (Shadarek ×4, J-Funk, Clandon ×2, Critcake, LBNinja7), Twitch restream
  stubs (YoDaTV, Shindigg) and Forever shorts (Bansherz ×3, Supatease).
- **General lane quiet**: no `generalCreators` upload is newer than 2026-09-13, and izen's 15-minute BlizzCon recap was
  already declined on 09-14 as news rather than a per-spec meta read. The `metaNotes` lane is correctly empty tonight.
- **⚑ SCOPE FLAG STILL OPEN FOR RILEY** (re-stated, not acted on): Dorki's "How To Do HUGE DAMAGE On Arms Warrior In M+ |
  Midnight 12.1" (`eoh6M6x0ohU`, 2026-09-14) remains **doubly excluded** — guide-shaped content carries no spec-strength
  read, and every Dorki entry in `community.json` is tank-scoped, so Warrior|**Arms** is outside his registered scope and
  no take could be attributed without a human widening it.
- Nothing was moved to `seen[]`: these are shape and scope declines, not durable dismissals, so all 26 stay unexamined
  and reachable by a future local unfiltered yt-dlp sweep, and the accounting stays auditable. No creator opinion moved
  any tier.
## 2026-09-15 (local, scheduled) — queue 0 → 0; 18 new videos since the 09-14 nightly, none carries a spec-strength read: 0 probes, 0 queued, 0 takes — run BEFORE today's nightly

- **Scope: residential-only catch-up, run BEFORE today's nightly** (no schedule event by ~15:00Z; last poll was the 09-14 nightly's
  16:30Z). RSS discovery re-run — it costs no caption traffic: **44/44 channels HTTP 200** (79 pollable entries → 44 channels, 0
  transcribable creators missing a `channelId`), **660 entries**, 0 failures. Seen-set = structured union of the four lanes =
  **1,255 ids** (549 seen + 426 skipped + 0 queued + 280 distilled-only take/metaNote urls; no log regex). Cycle bound
  `min(builds[].date)` = **2026-06-18** → 532 in-cycle, **336 unseen in-cycle**, of which **18 are newer than the 09-14 nightly's poll**.
  Titles AND `media:description` read for all 18.
- **None was worth a fetch, and nothing was queued** — every one is a documented zero-yield or out-of-scope shape:
  · **Key-run / raid-prog PoVs and stream VODs** — Shadarek `9FBANvZ3mMc` (RLP +19) and `3DmQGTenvTY` (Kings' Rest +20), J-Funk
    `dWhzyDIf6pA` (Mythic Coiled Altar world-22nd kill clip, a talent string in the description), Clandon `IVzZJ5kB60g` (Disc Altar
    prog), Critcake `OTH3SnpSwbY` (Altar prog), MadSkillzzTV `VZH4oZxZI-U` (Prevoker stream + UI), Shindigg `jYuO77ty3iY` (vault
    stream), YoDaTV `Fsi6B3DHZ9s` (bare Twitch-link restream).
  · **BlizzCon / Forever news and vlogs** — Dalaran Gaming `BmYgPJ6BaHA`, Psybear `caQ-kyV5Hvw`, NeekapHere `0M8HkPndl3A` ("This Week
    in WoW"), Tettles `wT9Qh0s0Luk` ("I skipped raid to go to Blizzcon" — regular programming back next week), Bansherz `l4Nzd9CJvis`
    (#shorts), `JoiaTSNX0N0`, `9OyscfAD4PM` (Skyborne cinematic / leveling).
  · **PvP** — Dalaran Gaming `EDena1l9XBs` (Balance 5v5 / 1v1 duels): a PvP read must never vote in PvE.
  · **Tooling / item-level** — Shadarek `fjBuMMigym0` (Raidbots dungeon-route sim how-to) and **`FHbZ5oWpl6U` "Trinket Tuning | Puzzle
    Box Nerfed & Healer Trinket Buffs"** — a reaction to Linxy's 22-Sep trinket post (read directly in ptr-watch, zero class lines).
    Recorded as the one borderline call: it is in a registered creator's own scope and passes the keyword filter, but the content is
    ITEM-level by construction, and the standing rule is that an item- or gear-level claim never mints a spec take (a Mastery trinket
    nerf lands on every spec that carries it). Not fetched, not queued; reconsider only if a later video frames it as a spec placement.
- **No yt-dlp caption probe this run.** The anonymous lane has been clear for four single-video probes (09-11, 09-12, 09-14 ×2) after
  the 19-day IP flag; with nothing in the window that could yield a take, a probe would be volume for its own sake. Nothing installed
  or upgraded (yt-dlp still the local 2026.07.04); no cookies, no authenticated lane; still no unfiltered breadth sweep.
- **Queue 0 → 0. 0 takes, 0 metaNotes**; `creator-takes.json` and `pending-transcripts.json` byte-unchanged; no `latest` advanced;
  nothing moved to `seen[]` (shape and relevance declines are not durable dismissals — the 336 stay unexamined and reachable). The
  Dorki Arms scope flag from 09-14 still awaits Riley. No creator opinion moved any tier.


## 2026-09-14 (nightly) — 44/44 feeds polled, 660 entries, 0 transcripts available, 0 queued; one scope flag for Riley

- **Discovery**: all **44** unique tracked channels polled inline via the public RSS endpoint (79 creator entries collapse
  to 44 channels — 41 class-creator entries plus the 3 `generalCreators`; the 40 `transcribable: false` reference entries
  skipped by design; **0** pollable creators missing a `channelId`). 44/44 HTTP 200 with retry+backoff, **660 entries**,
  0 feed failures.
- **Seen-set** rebuilt as the structured union of the four lanes (`videos[]` + `skipped[]` + `seen[]` + every `youtu.be`
  id in a take or metaNote url) = **1,255 ids** (280 of them distilled). `log.md` was not regexed. Cycle bound derived as
  `min(builds[].date)` = **2026-06-18** — the date, never an index — giving 530 in-cycle feed entries, **333 unseen**, of
  which **19 are new since the 09-13 sweep**.
- **0 takes, 0 metaNotes, and that is the honest outcome.** `transcript-fetch/summary.json` verdict `ok`, requested 0 /
  fetched 0 / cached 0 — the queue was already drained to 0 by the 09-14 local run, so there was nothing to distil.
  `creator-takes.json` is byte-unchanged. No filler neutral was minted to record that the sweep happened.
- **Nothing queued.** The 19 new videos are BlizzCon/Forever reaction and roadmap news (Dalaran Gaming ×3, NeekapHere,
  MadSkillzzTV ×2, Obli, and izen's 15-minute BlizzCon recap — news, not the per-spec meta read the `metaNotes` lane
  takes), PvP duel/arena content (Supatease, Dalaran Gaming — a PvP read must never vote in PvE), and key-run / raid-prog
  PoVs and stream VODs (Shadarek ×2, YoDaTV ×4, Clandon, Critcake, LBNinja7, MadSkillzzTV, Sha's tank coaching session).
  All documented zero-yield or out-of-scope shapes, settled from title **plus `media:description`** without spending a
  metered request.
- **⚑ SCOPE FLAG FOR RILEY, not acted on.** Dorki published **"How To Do HUGE DAMAGE On Arms Warrior In M+ | Midnight 12.1"**
  (`eoh6M6x0ohU`, 2026-09-14) — a chaptered rotation/uptime/minmax how-to. It passes the nightly keyword filter, and it was
  the one genuinely borderline call this run, so the reasoning is recorded: it is **doubly excluded**. (a) Guide-shaped
  content carries no spec-strength read. (b) More decisively, **every Dorki entry in `community.json` is tank-scoped** —
  Blood, Vengeance, Guardian, Brewmaster, Protection Paladin, Protection Warrior — and Warrior|**Arms** is not among them,
  so no take from this video could be attributed without a human widening his scope. His own description still says "I will
  continue to provide tank and general content". Flagging rather than silently overriding, per the skill's rule.
- Nothing was moved to `seen[]`: these are shape and scope declines, not durable dismissals, so the 19 stay UNEXAMINED and
  reachable by a future local unfiltered yt-dlp sweep, and the accounting stays auditable.
  `data/pending-transcripts.json` is unchanged — queue 0, skipped 426, seen 549.
- No YouTube or transcript-API fetch was performed by the agent; no creator opinion moved any tier.

## 2026-09-14 (local, scheduled) — queue 0 → 0, but TWO fresh in-scope reads fetched and distilled locally: **4 takes** (Musguete ×3, Obli ×1), 0 metaNotes; anonymous caption lane clear a THIRD and FOURTH probe

- **Scope: residential-only catch-up, run BEFORE today's nightly** (no schedule event by 14:15Z; last poll was the 09-13 nightly's
  ~14:40Z). RSS discovery re-run: **44/44 channels HTTP 200** (79 pollable entries → 44 channels), **660 entries**, 0 failures.
  Seen-set = structured union of the four lanes = **1,253 ids** (549 seen + 426 skipped + 0 queued + take/metaNote urls; no log
  regex). Cycle bound `min(builds[].date)` = **2026-06-18** → **335 unseen in-cycle**, of which **17 are newer than the 09-13
  poll**. Titles AND `media:description` read for all 17.
- **Two were worth a fetch, and both were fetched here rather than queued** (local transcripts are free; the queue is metered):
  · **Musguete `4Y_CUMgHwp8` "Which Rogue Spec is META right now?"** (2026-09-14, 16:18 runtime) — a genuine comparative
    strength read across all three Rogue specs, all in his registered scope. Distilled into **three `bracket: "both"` takes**:
    Subtlety a little ahead for raid overall (one of the best single targets in the game; Assassination better on a number of
    bosses), Fatebound **Assassination "the best spec right now, at least for M+"** and his pick for everyone on ease, Outlaw very
    good in both brackets but gear-locked, hardest to learn and rarely brought ("popularity is awful"). **No predictions panel**:
    he publishes no tier labels and no strict rank list — the raid order is hedged per boss and the M+ order is conditional on comp
    and ease — and `docs/source-predictions.md` admits only explicitly ranked content. Same-lens supersessions: his 08-15 Subtlety
    (both), 08-24 Assassination (both) + 08-04 Assassination (mplus), 08-27 Outlaw (raid) + 08-04 Outlaw (mplus) — a both-bracket
    live read replaces the creator's live raid, M+ and both reads on that spec. His 07-31 tuning-direction reactions (no bracket)
    are a different lens and stay as they were.
  · **Obli `sZ6CJFwhwnk` "FROST DK Mythic + Guide and Breakdown / Blinding Vale +14"** (2026-09-14, 22:02) — mostly a how-to
    walkthrough, but it opens on a placement: Frost "pretty powerful at the moment", a very good pick, now **edging Unholy** in keys
    (reversing his 08-28 "Unholy a teeny bit ahead"), on the back of Yagi's and Mine's MDI showings, with gear dependence as the
    standing caveat. **One `mplus` Frost take**, superseding his 08-28 Frost M+ read. Unholy is a passing comparison here, not
    analysed — **no Unholy take**, and his 08-28 Unholy M+ read stays live. His 09-04 raid pair is untouched (different lens).
  · `latest` advanced on both registry entries to the videos actually distilled. Neither id was in `seen[]`/`skipped[]`.
- **Anonymous yt-dlp lane: clear again — two paced probes (`--sleep-requests 3`), two json3 tracks, no 429** (290 KB / 765
  events and 495 KB / 1,313 events). That makes four consecutive successes since the 09-11 clearance (09-11, 09-12, ×2 today).
  Metadata printed in separate invocations from the sub download; both `not_live`, `was_live=False`. yt-dlp still the local
  2026.07.04, nothing installed, no cookies, no authenticated lane. Still **no unfiltered breadth sweep** — a sweep is the volume
  shape that flagged the IP for 19 days; the 335 stay unexamined and reachable.
- **The other 15 new videos, settled from title + description, none fetched, nothing queued:** BlizzCon/Forever recaps — Dalaran
  Gaming `yRa_jes8GFs` ("Everything Blizzard Just Revealed for … Season 3"), izen [G] `B3_WVUOrqks` (6-hour BlizzCon recap — a
  news recap of announcements the official lanes swept directly; not a current-season meta read, no metaNote), MadSkillzzTV
  `2OLQVMsritQ` (Last Titan short). PvP — Dalaran Gaming `lLpAvn35aFY` (Frost DK 5v5 duels). PoVs/VODs/coaching — Shadarek
  `5WjSXcgo44A` / `F4MUq1bOb6w`, LBNinja7 `nU0pMdvgk9M` (+16 Temple with a build string), Clandon `Vi4Ncw7BOfA`, Sha
  `MuPfa4nRtkc`, Critcake `vc2fBBbFHL0`, YoDaTV ×4 (`Yge9HQFnKEQ`, `fHhpgM6WuG8`, `4BXJT9vweSs`, `c-GLu8sjGME`). And
  **Dorki `eoh6M6x0ohU` "How To Do HUGE DAMAGE On Arms Warrior In M+"** — Arms is OUTSIDE his registered tank scope and the
  video is a how-to, so not fetched; noted here in case Riley wants the scope reviewed.
- Nothing moved to `seen[]` (shape declines are not durable dismissals). **Queue 0 → 0. 4 takes, 0 metaNotes.** No creator
  opinion moved any tier; `expertRead` is dormant while `PHASES.ptr` is null, so these takes are drawer content only.

## 2026-09-13 (nightly) — 44/44 feeds polled, no transcripts to distil (queue was empty at collector time), **nothing queued: all 22 new videos are BlizzCon reactions, PvP or PoVs**

- **Discovery**: all **44** unique tracked channels polled inline via the public RSS endpoint (41 class-creator
  entries + 3 `generalCreators`; the 40 `transcribable: false` reference-only entries skipped by design; **0**
  pollable creators missing a `channelId`). 44/44 HTTP 200 with retry+backoff, **660 entries**, 0 feed failures.
- **Seen-set** rebuilt as the STRUCTURED union of the four lanes (`videos[]` + `skipped[]` + `seen[]` + every
  `youtu.be` id in a take or metaNote url) = **1,253 ids**; `log.md` not regexed. Cycle bound derived as
  `min(builds[].date)` = **2026-06-18** (the date, never an index) → **331 unseen in-cycle**, of which **22 are new
  since the 09-12 sweep**.
- **No transcripts were available to this agent.** `transcript-fetch/summary.json` verdict `ok`, **requested 0 /
  fetched 0 / cached 0** — the queue had been drained to 0 by the 09-12 local run, so the deterministic step had
  nothing to fetch (usage receipt: 13 counted requests in the 30-day window, 1 uncertain, no configured limit).
  Consequently **0 takes, 0 metaNotes**, `creator-takes.json` byte-unchanged, and **no filler `neutral` was minted**
  to record that the sweep happened.
- **NOTHING QUEUED, and that is the honest call** — none of the 22 new videos carries a spec-strength read, all
  settled from title + `media:description` at zero metered cost:
  · **BlizzCon / Warcraft-Forever reaction and news** — Dalaran Gaming `rmOnt3L9KaY` (Classic+ reveal) and
    `XnBZqAYwQW0` (watch party), NeekapHere `323h0qlDbJo` (retail roadmap) and `m4U-3TQxGDY`, MadSkillzzTV
    `aP7R1utFvBg`, Preheat `ZeIE5nR4V7E` (Forever dungeon raw footage), Obli `i7wobRoM1cM` (Last Titan teaser lore),
    Baze `nSB8oQYupl4` (12.2 Eclipse reaction) and `cNImgtirma4`. Announcement reaction is not a current-season spec
    read, and the announcements themselves were swept directly from the official channels this run.
  · **PvP** — Dalaran Gaming's 5v5/1v1 duel series (`PbgeFrYz10Q` Feral), Supatease `IhQMwNIWQbE` / `4gk3ouHr40o`
    ("Arcane is GOD MODE"). A PvP read must never vote in PvE, and Supatease's channel is the recorded trap shape.
  · **Key runs / raid PoVs / stream VODs** — Shadarek ×3, Bansherz `n-9SEoCrG6Y`, Musguete `fGix9q6vqeU`,
    MadSkillzzTV `t_bPuqkCDgc`, Critcake `KQuMcv9IUgE`, YoDaTV `v95wrgYbe2U`, and LBNinja7 `5DM4ZQNpUl8` ("Trash
    Mistweaver Build SLAMS +16") whose description is a build-string showcase, not a comparative read.
  · **Tooling** — izen `PiVbpiKamoA`, an EXBoss addon review (Week 4 QoL), no spec-strength segment.
- **Nothing moved to `seen[]`.** These are shape declines, not durable dismissals, so the 331 stay UNEXAMINED and
  reachable by a future local unfiltered yt-dlp sweep; the accounting stays auditable. **No creator opinion moved any
  tier.** No YouTube or transcript-API fetch was performed by the agent (no credentials held, by design).

## 2026-09-13 (local, scheduled) — queue 0 → 0; RSS discovery re-run (no nightly yet today): the ~25h window is BlizzCon reactions, PvP and an addon review — 0 probes, 0 queued, 0 takes

- **Scope: residential-only catch-up, run BEFORE today's nightly** (origin/master still `c21b150`; the schedule event
  has been firing 13:43–14:46Z all week and had not fired by 14:30Z). Unlike 09-12, the last discovery poll was
  ~25h old, so an RSS sweep WAS re-run here — RSS costs no caption traffic and cannot re-flag the IP.
- **Discovery**: 44/44 unique tracked channels HTTP 200 (79 pollable entries collapse to 44 channels), **660 entries**,
  0 failures. Seen-set rebuilt as the STRUCTURED union of the four lanes = **1,253 ids** (549 seen + 426 skipped + 0
  queued + take/metaNote urls; no log regex). Date bound `min(builds[].date)` = **2026-06-18** → **331 unseen in-cycle**
  (the 09-12 nightly counted 325). `media:description` parsed alongside every title.
- **The six videos newer than the 09-12 nightly's 13:43Z poll**, judged on title + description, none fetched:
  Dalaran Gaming `rmOnt3L9KaY` (Classic+ / WoW Forever reveal reaction) and `XnBZqAYwQW0` (BlizzCon watch-party
  livestream); Obli `i7wobRoM1cM` (Last Titan teaser — lore); MadSkillzzTV `aP7R1utFvBg` (BlizzCon watch party + MDI);
  NeekapHere `323h0qlDbJo` / `m4U-3TQxGDY` (roadmap / Forever news); Preheat `ZeIE5nR4V7E` (Forever dungeon raw
  footage); Baze `nSB8oQYupl4` ("Midnight Eclipse 12.2 Reaction | M+ rotation | New CASTER legendary?!") and
  `cNImgtirma4` (Classic Forever reaction); Critcake `KQuMcv9IUgE` (key o'clock livestream); izen [G] `PiVbpiKamoA`
  ("What is EXBoss" — an addon/tool review, neither a meta read nor a lead); Supatease `IhQMwNIWQbE` / `4gk3ouHr40o`
  (Arcane PvP) and Dalaran Gaming `PbgeFrYz10Q` (Feral 5v5 duels) — PvP lens, out of scope.
  Baze's 12.2 reaction is exactly the shape the 09-06 entry named: **content about a cycle the owner has not opened
  has no lane** (`expertRead` era-filters on `PHASES.ptr.marker`, null), so a transcript could not surface a take
  even if it held one. Reconsider when 12.2 opens.
- **No yt-dlp caption probe this run.** The anonymous lane has been clear for exactly two single-video probes
  (09-11, 09-12) after a 19-day IP flag; with nothing in the window that could yield a take, spending a probe would
  be volume for its own sake. Nothing installed or upgraded; no cookies, no authenticated lane.
- **Queue 0 → 0. 0 takes, 0 metaNotes**; `creator-takes.json` and `pending-transcripts.json` byte-unchanged; no
  `latest` advanced; nothing moved to `seen[]` (the 331 are budget/relevance cuts, not durable dismissals, and stay
  unexamined for a future unfiltered sweep). No creator opinion moved any tier.

## 2026-09-12 (local, scheduled) — queue drained 1 → 0; Dalaran Gaming's 12.1.5 walkthrough transcript-verified to NOTHING (correctly); anonymous caption lane clear for a second consecutive run

- **Scope: residential-only catch-up.** The CI nightly landed `90e3607` at ~14:02Z (started 13:43Z), ~10 minutes
  before this run started, with all 44 channels polled and one video queued. No discovery sweep was re-run here —
  re-polling 44 feeds the nightly polled minutes earlier produces nothing the nightly did not already see. This
  run's one job was to drain what CI could not fetch.
- **Anonymous caption lane: still clear.** One paced probe (`--sleep-requests 3`) on the only queued video: android
  player API 200, `en` auto-sub track found, json3 returned (283,365 B, 378 caption events, 12:33 runtime) — **no
  429**, the second consecutive success since the 09-11 clearance. yt-dlp at the local 2026.07.04 (requirements.txt
  pins 2026.8.19 for the RUNNER; nothing installed or upgraded in-run), no cookies, no authenticated lane. Metadata
  was printed in a SEPARATE invocation from the sub download (the `--print` simulate-mode trap): `not_live`,
  `was_live=False`, duration 753s.
- **VERIFIED-SKIPPED — Dalaran Gaming `bmUC_tpsdF8`, "Blizzard Is Fixing These 3 Specs in the Next Midnight
  Update" (2026-09-10).** Read end to end. It is a walkthrough of the **12.1.5 PTR** notes for exactly three specs:
  Devourer DH (Collapsing Star cancel-lockout removed, Fury-drain slowdown capped, Demonic Intensity moves The Hunt
  reset onto Star and +30% Hunt damage in Void Metamorphosis, Violent Transformation now resets Soul Immolation,
  Monster Rising 15%→10% Intellect / 15%→20% Star damage); Marksmanship (Blood Fletching replaces Unload — Aimed
  Shot crits apply a Master Marksman bleed at 20% for 4s with extra bleed on subsequent hits); Protection Warrior
  (Execute no longer consumes extra Rage, damage +100%; Colossus Practiced Strikes cuts Execute/Revenge Rage by 10).
  All three are the same three class sections already recorded as `applied` in `data/official-notes.json`
  ptr-preview post 1 **v3** (updated 2026-09-03), which the nightly's ledger check re-verified identical this
  morning — so it is a restatement of a tracked official post, **not a lead**.
  · Demon Hunter and Warrior are **outside his registered scope** (Druid / Hunter / Mage / Rogue / Shaman) — not
    distilled, per the scoping rule.
  · Marksmanship **is** in scope, but he explicitly declines a strength read: "until we can get some raid boss
    testing, we don't really know how good this is going to be for marksmanship" and "could potentially create
    some more engaging gameplay possibly". Anticipation is not a read; a `neutral` here would be the placeholder
    the skill forbids. And the 12.1.5 lane is notes-only while `PHASES.ptr` is null — `expertRead` would not
    consume a PTR-era take anyway.
  · **0 takes, 0 metaNotes**; `creator-takes.json` byte-unchanged; `latest` NOT advanced (still names `Fw6_unqijso`,
    the 09-05 video actually distilled). Moved `videos[]` → `skipped[]` with the reason above, `verifiedAt` 2026-09-12.
  · Note for the record: the 09-11 nightly declined to queue this id as a "class-tuning round-up" and the 09-12
    nightly queued it because the description could not settle it. The transcript settled it the 09-11 way. Both
    calls were defensible; the queue cost was one free residential fetch.
- **No creator opinion moved any tier.** Queue 1 → 0. Nothing moved to `seen[]`; the ~325 unseen in-cycle videos the
  nightly counted stay unexamined for a future unfiltered sweep — this run deliberately did not sweep, because a
  sweep is the volume shape that flagged the IP for 19 days and the lane has been clear for exactly two probes.

## 2026-09-12 (nightly) — 44/44 feeds polled, the one queued transcript distilled to NOTHING (correctly), 1 new video queued

- **Discovery**: all 44 unique tracked channels polled inline (41 class entries + 3 generalCreators; 40
  `transcribable: false` reference-only entries skipped; 0 pollable creators missing a `channelId`). 44/44 HTTP 200
  with retry+backoff, **660 entries**, 0 failures. Seen-set rebuilt as the STRUCTURED union of the four lanes =
  **1,252 ids** (no log regex). Date bound `min(builds[].date)` = **2026-06-18** → **325 unseen in-cycle**, **77**
  keyword-matching.
- **Distilled → nothing, which is the honest answer.** `transcript-fetch/summary.json` verdict `ok`, requested 1 /
  fetched 1 (303 chunks, mode=native): izen's `rYFv6Ohr7mE` "12.1 Week 4 | New Event Loot, Mega Delve's 7 Titles &
  Myth Track Loot, PTR Raid Testing". Read end to end. It **opens by stating this reset carried zero balance tuning and
  zero class/spec changes**, with none expected for ~12 days, then covers the 12.1.5 Kith'ix raid-testing schedule, the
  Winds of Mysterious Fortune satchels, and the mega-delve's seven titles and myth-track quest line. Reporting the
  ABSENCE of tuning is not a spec-strength read, and the rest is reward-system content — so **0 takes, 0 metaNotes**,
  `creator-takes.json` byte-unchanged, and izen's `latest` deliberately NOT advanced (it still names the 09-08 raid
  video it actually distilled). Moved `videos[]` → `skipped[]` with that reason, `verifiedAt` 2026-09-12.
- **Queued narrowly — one video**: Dalaran Gaming `bmUC_tpsdF8` "Blizzard Is Fixing These 3 Specs in the Next Midnight
  Update" (2026-09-10). A registered class-overview creator's spec-level patch-change review; its `media:description`
  is channel boilerplate with no chapter list, so only the transcript can settle it.
- Nothing else queued and **nothing moved to `seen[]`**: the remainder are PvP duels (Dalaran Gaming's own 5v5/1v1
  series, Supatease's "MM hunter 1v1 Feral"), gameplay PoVs and key runs, raid-night VODs, boss/dungeon/heal guides,
  gearing and logs PSAs (Shadarek's catalysed-stats PSA), and 12.1.5 loot reveals — all documented zero-yield or
  out-of-scope shapes. They stay UNEXAMINED rather than retired as budget cuts, so a local yt-dlp sweep can reach them.

## 2026-09-11 (nightly) — 44/44 feeds polled, 0 transcripts available (queue was empty at collector time), 1 video queued

- **Discovery**: all **44** unique tracked channels polled inline (41 class-creator entries + 3 generalCreators; the 40
  `transcribable: false` reference entries skipped; **0** pollable creators missing a `channelId`). 44/44 HTTP 200 with
  retry+backoff, **660** entries, 0 failures.
- **Seen-set** rebuilt as the structured union of the four lanes (`videos[]`/`skipped[]`/`seen[]` + every `youtu.be` id
  in a take or metaNote url) = **1,251** ids. Log prose not regexed. Cycle bound derived as `min(builds[].date)` =
  **2026-06-18** (the date, never an index) → **324 unseen in-cycle**, 178 matching the nightly keyword filter.
- **No transcripts were available to this agent.** `transcript-fetch/summary.json` verdict `ok`, requested 0 / fetched 0
  / cached 0 — the queue was already drained to 0 by the same-day local run, so the deterministic step had nothing to
  fetch. Consequently **0 takes, 0 metaNotes**; `creator-takes.json` untouched. A run that finds nothing reports
  nothing — no filler `neutral` was minted to record that the sweep happened.
- **Queued narrowly — exactly one**: izen (Izenhart) `rYFv6Ohr7mE`, "12.1 Week 4 | New Event Loot, Mega Delve's 7 Titles
  & Myth Track Loot, PTR Raid Testing" (2026-09-10). Settled from `media:description`, which publishes a chapter list
  opening **"00:00 Balance Tuning"**; izen is a generalCreator, so anything distilled lands in `metaNotes[]`/leads, never
  `takes[]`.
- **Nothing else queued, and nothing retired.** The other 323 are gameplay PoVs, key runs, raid-night VODs, boss and
  dungeon guides, gear/loot PSAs and PvP duel content — all recorded elsewhere in this skill as zero-yield or
  out of scope. They stay **UNSEEN** rather than being marked as budget cuts, so a local unfiltered yt-dlp sweep can
  still reach them and the accounting stays auditable. Specific declines worth recording:
  · Supatease `UdxfQ28klNo` "RESET DAY Time to See Which Classes Are BETTER" — his channel is PvP and this is the exact
    title shape the skill names as the trap; a PvP read must never vote in PvE.
  · Dalaran Gaming `bmUC_tpsdF8` "Blizzard Is Fixing These 3 Specs in the Next Midnight Update" — a class-tuning
    round-up, which the scoping rule says does not yield specialist takes; and the official channels were swept
    directly this run, so it is not needed as a lead either.
  · Tactyks `zncJeqViiTs` Mythic Twin Fangs boss guide — guide-shaped, the measured 7/7-zero-yield category. (He is
    also raid-scope-only, being the Method M+ list author.)
  · izen `rb9dofIbc_A` 12.1.5 patch overview — full chapter list is loot/delve content, no spec-strength segment.
- No creator opinion moved any tier.

## 2026-09-11 (local, scheduled) — THE CAPTION 429 HAS CLEARED (day 19); queue drained 1 → 0, AutomaticJak's M+ healer tier list distilled into 7 takes + 1 prediction panel

- **The anonymous residential caption lane is back.** One probe, per the standing bound, on the
  only queued video (`4SH6SUfKxpM`, AutomaticJak, published 2026-09-10): android player API 200,
  subtitle track found, and `timedtext` returned the json3 (371 KB, 512 caption events, 16:55
  runtime) — **no 429**. First successful anonymous caption download since 2026-08-23. yt-dlp at
  the `requirements.txt` pin (2026.07.04), nothing installed or upgraded, no cookies, no
  authenticated lane. The flag decayed on its own after 19 days of near-zero caption traffic
  (one probe per run), which is the diagnosis's decay mechanism working, just an order of
  magnitude slower than the 24–72h it expected. **Do not read one success as a durable state**:
  a sweep is exactly the volume shape that flagged the IP, so the next local run should pace
  from the start (`--sleep-requests 3`) and stop on the first 429 as before.
- **Scope was residential-only**, and the nightly window was open (14:40–15:10Z expected), so
  no discovery sweep was run this time: the nightly re-polls all 44 channels, and this run's
  one job was to drain what CI could not. The 09-10 nightly's ~145 left-unseen candidates stay
  unseen for it.
- **DISTILLED — AutomaticJak `4SH6SUfKxpM`, "Midnight Season 2 Healer M+ Tier List"
  (2026-09-10).** His own list ("our update for the M plus healer tier list", "I've got it at the
  B tier"), no guests, no co-stream. Specialist `takes[]`, all **bracket `mplus`**, one per
  healer, exactly his registered scope (six class entries = the seven healers): Holy Paladin
  **buff** (S — Lightsmith ~2× Herald's damage, "infinite" non-cooldown healing, Paladin and Shaman
  the only healers to time a 21 at recording), Restoration Shaman **buff** (A+ — "second best"
  again; Skyfury, double Healing Rain/Acid Rain, Poison Cleansing Totem), Mistweaver **mixed**
  (A+ but casted spells weak, Spin to Win far weaker, expects lighter representation),
  Preservation Evoker **buff** (A+ — "best position since early Dragonflight", Flameshaper +
  Fluttering Seedlings → Consume Flame), Holy Priest **mixed** (B — meets checks but single-target,
  cooldown-based, 100-to-zero to bleeds; he caveats his Disc-raid stat set), Restoration Druid
  **nerf** (C — Swiftmend HoT extension removed, representation collapsed, "worst patch from a
  gameplay perspective"), Discipline Priest **nerf** (bottom — "by far the worst healer in M+",
  Atonement dungeon modifier removed, mana economy "miles worse").
- **Supersession, same lens only: 7 retired, 7 kept.** The five 08-15 launch-list **M+** takes
  (Resto Druid, Mistweaver, Holy Paladin, Resto Shaman, Pres Evoker) and the two 08-21 first-week
  **M+** reads (Disc, Holy Priest) are superseded with a dated note. Every RAID-lens take (08-15
  raid rows, 08-26 Holy/Disc raid, 08-27 Pres/Resto Shaman raid) stays live — complementary,
  not replaced.
- **Prediction panel captured** (3a): `data/creator-predictions.json` gets its FIRST panel,
  `automaticjak-4SH6SUfKxpM-2026-09-10`, season s2, mplus/Healer, nativeOrder S · A+ · B · C.
  Two placements are positional rather than spoken letters, and the row text says so: Pres Evoker
  sits between Mistweaver ("also in that A+ tier") and "On our next tier, we've got Holy Priest";
  Disc is introduced under the plural "C-tier healers" heading and then "at the bottom of our
  tier list", so it is recorded C, last, with no separate lower letter invented. Resto Shaman's
  A+ is carried by the Mistweaver sentence ("also in that A+ tier"), and the text records that.
- **Verification pass done against the transcript before writing**: every number (2× damage,
  ~30% haste, 20% Shadow Mend, 5-to-20 Atonement scaling, 21s/20s/19s) sits on the referent he
  attached it to; ASR mangles never written as names ("Shayoon's gift" → Sheilun's Gift only
  where the spell is unambiguous; "night teams" for what is probably "nineteens" was DROPPED
  rather than guessed). The Oracle mana-regen remark is folded into the Holy Priest take as a
  spec-level read, not a separate claim. Nothing distilled from the sponsor segment.
- **Not distilled, deliberately**: the composition roll-call (Blood DK / Arcane / Ele / Arms)
  is a list-mention about DPS, outside his scope and outside the read; "Mistweaver casted spells
  feel terrible" in the closing rant restates the take already recorded.
- Lanes: `4SH6SUfKxpM` removed from `videos[]` in the same edit (queue **1 → 0**); the seven take
  urls are now its record; no id sits in two lanes; `npm run validate` clean. `latest` advanced
  on all six AutomaticJak entries to what was actually distilled. No metaNotes (specialist, not a
  general creator). No `skipped[]` or `seen[]` change.

## 2026-09-10 (nightly) — 44 channels, 1 transcript distilled into 8 raid metaNotes, 1 queued

- **Discovery**: 44 of 44 unique tracked channels polled inline over the public RSS endpoint (41 class-creator
  entries + the 3 generalCreators; `transcribable:false` skipped), all HTTP 200 with retry+backoff, **660 entries**.
  Seen-set rebuilt as the STRUCTURED union of the four lanes = **1,250 ids**; log.md was not regexed.
  **320 unseen**, and all 320 fall inside the cycle bound — the OLDEST date in ptr-builds.json, **2026-06-18**,
  taken as a DATE and never as `builds[0]`. Nightly mode, so the keyword filter stays on: **156 title hits**,
  10 of them PvP-framed and triaged out, leaving **146 candidates**.
- **DISTILLED — izen, `TJe8OnXl3pY`, "12.1 Raid Results | The Best DPS & Healers In Week 3 - BEWARE of the
  'Overall Results' Bait" (published 2026-09-08)**, pre-fetched by the deterministic step (verdict `ok`,
  `fetched:554` chunks, ms offsets). He is a generalCreator, so this is **metaNotes only** — 8 written, all
  raid-lens: Holy Priest **positive**, Discipline Priest **mixed**, Restoration Druid **positive**, Holy Paladin
  **negative**, Restoration Shaman **negative**, Preservation Evoker **mixed**, Arms Warrior **mixed**, Frost Mage
  **mixed**.
- **Curation was deliberately narrow, and the video is why.** Its whole thesis is that the overall raid DPS
  ranking is a LOGGING ARTIFACT — almost every parse sits on the early, easy, multi-target bosses, which is why 10
  of the top 13 are casters — so the caster cluster at the top was **not** distilled as spec strength. Only two DPS
  reads survive his own caveat, and both are recorded **mixed rather than positive** because he is explicit that
  Twin Fangs is the only boss in the tier with that two-target profile: Arms Warrior (Sweeping Strikes uptime he
  measures at 97.34%) and Frost Mage (innate Flurry + Frostbolt/Frostfire and Ice Lance cleave, surviving the nerf).
- **Deliberately DROPPED under the list-mention rule**: the buffs he enumerates for Balance Druid, Beast Mastery,
  Frost DK and Survival ("none of this had too big of an effect for now") — bare enumeration, no spec-specific
  read — and **Mistweaver Monk**, which appears only inside his recital of the PRE-tier consensus, never as his own
  read. Also dropped: the Marksmanship "isn't even turning around to target the adds" line, which is a comment on
  one player's play, not a spec read; and the pure-single-target boss enumeration ("triple rogue up there, feral,
  ret, beast mastery, marksmanship, havoc"), which is enumeration on both sides.
- **ASR discipline**: the boss the transcript renders variously as "Zorok" / "Zul'jin" / "Zuldazar" is one mangled
  name and is never quoted — only Twin Fangs, Entombed Sentinels and The Lost Explorers, which the captions render
  consistently. "Frost is very good at two target cleaving" is Frost MAGE, fixed by the following clause naming
  Flurry, Frostbolt/Frostfire Bolt and Ice Lance, not by the bare token.
- **Supersession, and what was deliberately NOT superseded.** Two older raid-lens izen notes retired: Holy Priest
  2026-07-17 and Arms Warrior 2026-08-31. The 2026-08-17 pre-launch and 2026-08-29 tuning-pass notes for the same
  specs were **left live on purpose** — their `patchContext` names both brackets, so under the model's own lens
  rule (`takeInBracket`/the metaNotes filter) they feed M+ as well, and retiring them with a raid-only note would
  silently drop that contribution. The new context is worded to mention raid and NOT any M+ token, so it stays
  raid-scoped.
- `TJe8OnXl3pY` removed from `videos[]` in the same edit — the take url is now its record, and no id sits in
  two lanes.
- **QUEUED (1)**: AutomaticJak `4SH6SUfKxpM` "Midnight Season 2 Healer M+ Tier List" (2026-09-10). His registered
  scope across five class entries is exactly the seven healers, so a healer tier list is squarely in scope and worth
  a metered request.
- **Left UNSEEN, not marked seen**: the remaining ~145 candidates are gameplay VODs, key-run PoVs, boss/spec guides
  and 12.1.5 feature explainers — guide-shaped content the distillation rules say carries no spec-strength read.
  Budget/priority cuts are not durable dismissals, so the next run reconsiders them.
- No YouTube or transcript-API fetch by the agent; yt-dlp neither run nor installed. izen's `generalCreators.latest`
  advanced to what this run actually distilled.

## 2026-09-09 (nightly) — 44 channels, 7 transcripts resolved: 2 distilled (18 records), 5 verified-skipped, 1 queued

All **44** unique tracked channels polled inline (41 class creators + 3 generalCreators), 15 entries each,
**660 entries, 0 fetch failures**, `media:description` parsed alongside every title. Seen-set recomputed
from the four structured lanes — never from this file — at **1,249 ids**; **314** unseen videos fall on or
after the cycle-opening build **2026-06-18** (oldest date in ptr-builds, not `builds[0]`). Nightly, so the
queue stayed keyword-filtered.

Supadata step: verdict `ok`, 3 fetched + 4 cached, 11 counted requests in the 30-day window. All 7 read in
full and resolved, so `videos[]` drained to 0 before one new video was queued.

**Distilled (2 videos -> 16 metaNotes + 2 takes).**
- izen `zf9FpCLuTeI` (2026-09-07, week-3 M+ recap) -> 16 M+-lens metaNotes. Movers: Demonology 0.9->5%
  and Beast Mastery 0.7->3.4% of high-key DPS after their buffs; the three meta specs all shed share
  (Arcane 15.1->13.8, Arms 12.7->8.9, Elemental 9.9->7.1) and in the popular comps Elemental is replaced
  first, Arms second, Arcane not at all. Healers/tanks unchanged (Holy Paladin then Resto Shaman; heavy
  Blood DK). Two careful ones: Holy Priest out-picking Discipline is rare (not seen since Shadowlands
  S3/S4) but he says it is still far from meta, so **mixed**, not positive; and Brewmaster's apparent
  "continuous rise" is a handful of one-trick mains — he says explicitly it did not get more popular —
  so **negative**. Frost DK, Retribution, Windwalker and Balance appear only in enumerations and were
  dropped per the list-mention rule; Marksmanship and Survival appear only as a bottom-level comparison
  anchor for BM and were dropped for the same reason.
- MadSkillzzTV `4qn2cENo0Rk` (2026-09-07, 20-chunk short) -> a bracket-SPLIT Holy Priest pair: raid
  **buff** (topping heroic charts, good Mythic HPS, Oracle, three-button rotation, fewest raid deaths via
  Restitution), M+ **mixed** (not the meta healer, but better than expected). His 09-04 whole-spec "both"
  take was superseded by the pair.

**Supersession discipline — one near-miss worth recording.** A first pass matched izen's older notes with
a loose `/M\+|Mythic\+/` test over `patchContext` and retired **7 RAID-lens 08-17 predictions**, because
that raid context mentions Mythic+ in its own caveat sentence. Caught on the diff and fully reverted by
restoring every flag from `HEAD` before re-applying an explicit, enumerated list: **14** notes retired,
all of them prior M+-RECAP-lens notes (08-15, 08-25, 08-27 x2, 09-01 x9, 09-03). The 08-29 tuning-pass
notes were deliberately LEFT LIVE — a "what does this buff do" read is not the same lens as a weekly meta
recap, which is the same call the 09-01 recap made. **Match the lens on an exact phrase, not a substring.**

**Verified-skipped (5), each with its reason in `skipped[]`.** Preheat `AUuP4Ex29X0` (Arcane variance +
proc pre-stacking technique, then an ElvUI walkthrough); leak `enxnA4o5aDo` (per-boss Survival cheat
sheet); LBNinja7 `QtsKpXY7NQE` — the interesting one: titled "Mistweaver Is Broken & NEEDS Fixing" but he
disclaims the power question in the opening, and the only power line in it is POSITIVE (the tier set makes
the spec "very strong" in M+), which merely corroborates his live 08-29 take, so writing a negative take
off that title would have inverted him; Obli `m7lbOASbT4s` (season CONTENT review — dungeons, raid design,
bonus rolls killing the Great Vault — whose only class content is a closing aside he flags himself, and
whose Frost trajectory claim is already carried, bracket-scoped, by his 09-04 raid takes; his "only
Warlocks enjoy this raid's cleave profile" line is outside his registered DK scope); AutomaticJak
`1z2CQXNWFLM` (heroic Ula'tek healing cooldown guide; its Shaman-intermission and Holy-Priest-immobility
lines are fight artifacts, not spec reads).

**Queued (1):** izen `TJe8OnXl3pY`, the 2026-09-08 RAID counterpart of the distilled M+ recap.
`npm run audit:creators`: 0 HIGH, 0 MED, 9 INFO (8 zero-yield transcribable creators + the standing
between-cycles note that the expert lane is dormant while `PHASES.ptr` is null).
izen's `latest` advanced to the video actually distilled and says the raid counterpart is queued, NOT
distilled. **MadSkillzzTV's entries are `managedBy: overrides`** and were left alone — an agent edit there
is overwritten at prebuild and would fail Gate 0; his `latest` is the owner's to move.

## 2026-09-09 (local, scheduled) — caption 429 on day EIGHTEEN; full 44/44 sweep (no nightly landed again); queue 4 → 7, nothing distilled

- **The anonymous caption lane is still dead, day EIGHTEEN.** One probe only, on the oldest
  queued video (`zf9FpCLuTeI`, izen): the webpage and the android player API both resolved
  200 and the subtitle track was found, then `timedtext` returned
  **`ERROR: Unable to download video subtitles for 'en': HTTP Error 429`**. That is the
  documented IP-scoped abuse flag on the caption endpoint, not a per-video or extractor
  problem — the metadata path is healthy, only captions are refused. **Deliberately did not
  retry or walk the queue**: hammering a rate-limited endpoint is how the flag gets extended,
  and one probe is enough to establish the state.
- **The authenticated bridge was NOT available**, same as every unattended run since 08-24.
  It needs Riley to supply a `cookies.txt` (or to drive the logged-in browser), and
  `--cookies-from-browser chrome` remains dead on this machine (App-Bound Encryption /
  DPAPI). An unattended run cannot open that lane, so nothing was distilled.
- **Full 44/44 discovery sweep, 0 feed failures** — worth doing because no nightly landed
  today either (its refresh job ran, but publish failed at Gate 1, so its discovery was
  discarded). Seen-set built from the four STRUCTURED lanes as specified (seen[] + skipped[]
  + videos[] + every `youtu.be/<id>` in creator-takes.json) = **1,246 ids**; never regexed
  from this file. 316 unseen videos published on/after the S2 launch bound (2026-08-18).
- **Queued 3 of those 316, narrowly** (queue 4 → **7**; the nightly's Supadata cap is 25/run,
  so this is well inside budget). The 313 left alone are overwhelmingly livestream VODs
  ("Raid Night!", "Reclear Night!", "keys", "on twitch") — no analytical signal, and long
  `was_live` VODs have no caption route at all. Queued, with the scope check done first
  against `community.json` rather than assumed from the class the entry sits under:
  · `QtsKpXY7NQE` **LBNinja7 — "Mistweaver Is Broken & NEEDS Fixing in 12.1.5"** (09-09).
    Squarely in scope: LBNinja7 carries an explicit `Monk|Mistweaver` entry, and the title
    is a spec-level balance claim about the 12.1.5 preview.
  · `m7lbOASbT4s` **Obli — "Does Midnight Season 2 miss the mark?"** (09-09). Scoped
    `Death Knight|Frost,Unholy`. Queued because the title carries **no class, spec or patch
    keyword** — precisely the shape a title filter drops, and it is a season-level assessment
    from a Method creator.
  · `1z2CQXNWFLM` **AutomaticJak — "Healing Heroic Ula'tek Guide"** (09-08). Scoped across
    five healer specs. Queued for the same reason: a "guide" title is the documented blind
    spot (the Tactyks/J-Funk lesson — a guide author's guide routinely carries spec analysis).
- **Explicitly NOT queued**, so a later run does not re-litigate them: Tettles "I Got
  Benched...." (09-08 — no signal at all, and Tettles is scoped Balance/Augmentation);
  Supatease "RESET DAY Time to See Which Classes Are BETTER" (09-09 — stream-shaped title
  despite Supatease being a class-roundup creator; would spend a metered request on a
  coin-flip). Neither was written to `seen[]` — they were not transcript-verified, so under
  the precedence ladder they stay simply undiscovered and remain eligible next run.
- **Nothing distilled ⇒ no takes, no metaNotes, no `skipped[]` entries.** A verified skip
  requires having READ the transcript; with captions 429 there is nothing to verify against,
  and inventing one would be exactly the durable-record corruption that lane exists to prevent.

## 2026-09-08 (local, scheduled) — caption 429 on day SEVENTEEN; full 44/44 sweep because no nightly had fired; TWO in-scope videos the nightly's title filter missed were queued

Ran as a stand-in for a nightly that had not fired by 14:13Z; the nightly then fired at 14:44Z and
published first, so this run's data was reset away — **except the queue additions below, which are
the one thing CI did not do.**

- **Caption lane still down, day 17 since 2026-08-23.** ONE probe spent per SKILL.md's bound, on the
  then-queued `jGeOuxbfGUo` (Kalamazi). Availability confirmed healthy first (936s, `not_live`, an
  `en` auto-caption track offering json3; `--list-subs` is never rate-limited), then the documented
  `player_client=android` json3 fetch returned **HTTP 429** on the `timedtext` download alone while
  the watch page and android player API both downloaded and subtitles resolved. Same third shape;
  no bot-wall message; no cookies file available to an unattended run, so the authenticated fallback
  was not open. **Resolved from the other side the same evening:** the nightly's Supadata lane (exempt
  from this IP flag) drained that video and **verified-skipped** it — it really was a channel update
  with no spec content. Day 17 again cost latency, not coverage.
- **Discovery ran here precisely because no nightly had:** 44/44 channels via the RSS endpoint, 660
  entries, **0 feed failures**. Seen-set from the four STRUCTURED lanes only (1,242 ids); cycle bound
  `Math.min` over build dates = 2026-06-18, taken as a DATE. 312 unseen in-cycle videos left UNSEEN.
- ⚑ **The two videos re-applied after the reset are the point of this entry.** Checked against the
  nightly's own lanes before adding — neither is in `videos[]`, `skipped[]` or `seen[]`, i.e. its
  keyword filter did not surface them, while it *did* independently queue the izen meta video I had
  also picked. Both were verified `not_live` with ordinary durations by an info fetch first:
  · `AUuP4Ex29X0` — **Preheat**, "Arcane is RNG. Fix your damage by fixing the odds." (568s, 09-08).
  · `enxnA4o5aDo` — **leak**, "Quick Survival Hunter Raid Tips for Heroic Venomous Abyss" (114s, 09-07).
  This is the **Tactyks/J-Funk pattern repeating**: a title is a bad predictor of whether a video
  carries spec analysis, and the nightly filters on titles by necessity because Supadata is metered.
  A local run's job is to catch what that filter drops — so queue narrowly and let the paid lane decide.

## 2026-09-08 (nightly) — 44/44 feeds, 0 failures; the one pre-fetched transcript yielded NOTHING and was verified-skipped; 2 queued

- **Discovery: all 44 unique tracked channels polled inline** via the public RSS endpoint (41
  class creators + the 3 `generalCreators`), 15 entries each, **0 fetch failures**, no retries
  needed. `media:description` parsed alongside the title on every entry, which is what settled
  most of the triage below at zero transcript cost.
- **Seen-set recomputed from the four machine-readable lanes** — `pending-transcripts.json`
  `seen[]` / `skipped[]` / `videos[]` plus every `youtu.be` id in `creator-takes.json` — never
  by regex over this file. **1,242 ids**, leaving **312 unseen**, all of them on or after the
  cycle's opening build **2026-06-18**, taken as `Math.min(...builds.map(b => b.date))` and NOT
  `builds[0]`, which is the newest entry.
- **Nightly, so the keyword filter stays on**: 86 of 312 titles matched, and 17 carried a strong
  spec-read signal. Breadth belongs in local runs; the queue is drained by the metered API.
- **DISTILLED / VERIFIED-SKIPPED: `jGeOuxbfGUo`** (Kalamazi, *Season 2 Character & Channel
  Update! Future Plans Etc*, 2026-09-06). The deterministic step returned verdict **`ok`, 1 of 1
  requested fetched**, 480 chunks (usage: 4 counted requests in the 30-day window, limit null).
  Read in full; **nothing distilled, and that is the correct outcome**. Two thirds is his own
  gear state and Great Vault coining arithmetic (ilvl 322, crafted staff and boots, which mythic
  boss to coin, "Janthrazette plus offhand is still like 2% DPS better than my staff", which
  trinkets are landmines) — gear-level by the distillation rules. The rest is guild progress in
  Just Woke Up, Blizzcon travel, and a request for video suggestions. **The two spec-adjacent
  lines both fail the bar**: his "Murder Row I like a lot more than I thought / Altar of Fangs
  is insane / RLP is honestly that bad" ranks **DUNGEONS, not specs**, and "there's going to be
  some nerfs coming in demo soon" is **anticipation**, which is explicitly not a read — he says
  in the same breath that "12.5 is already on PTR, there's no lock changes yet", which the
  official 12.1.5 ledger independently confirms (its only class sections are Devourer DH,
  Marksmanship Hunter, Protection Warrior). Minting a placeholder `neutral` here would assert a
  directional view he never expressed **and** dilute his real Warlock reads through
  `expertRead`'s denominator. Moved `videos[]` → `skipped[]` with that reasoning; his existing
  Warlock takes remain the current read, and his `latest` was NOT advanced.
- **QUEUED (2, narrowly):**
  · `zf9FpCLuTeI` — izen, *Season 2 - Mythic+ Week 3 | Meta Specs, Best Comps & 2 New TOP DPS
    Specs?* (2026-09-07). The metaNotes archetype: its description promises week-3 M+ popularity
    AND performance across all three roles with chapter marks at 01:02 healers / 02:05 tanks /
    03:30 DPS / 06:24 top 2 rising / 11:55 compositions. Newer than his distilled 09-01 video.
  · `4qn2cENo0Rk` — MadSkillzzTV, *Best "Easy" Healer in 12.1* (2026-09-07). Inside his
    registered healer scope (Holy/Disc Priest, Resto Druid, Resto Shaman, Preservation,
    Mistweaver, Holy Paladin). Flagged for the distiller: the description marks it `#shorts` and
    frames it as **easiest**, not strongest — if the transcript turns out to be a
    difficulty/playstyle read rather than a strength read, it is a `skipped[]`, not a take.
- **Triaged out and deliberately left UNSEEN** (budget/keyword dismissals are not durable, so a
  later run reconsiders them; only the reasoning is durable, and it lives here): Tactyks' seven
  Venomous Abyss boss guides and Megasett's mini-guides (guide-shaped, no spec-strength read);
  key-run and boss-kill POVs from YoDaTV, Reholy, Critcake, Baze, Bansherz, LBNinja7 and
  Musguete; gearing/vault PSAs (Sha's *Bonus Rolls or Tier?*, Whispyr's bonus-roll video,
  YoDaTV's Blood DK gearing guide, izen's *Bonus Roll is OP*); rotation and build guides
  (Bicepspump's Unholy how-to, Jedith's Fel-Scarred opener, Preheat's *Arcane is RNG*,
  Musguete's Ancient Arts guide); Dalaran Gaming's entire 5v5 duels series and Supatease's
  PvP output (**PvP is out of scope and a PvP-lens read must never vote in PvE**); Maximum's
  fourteen RWF `was_live` restreams, whose descriptions are all "watch on twitch"; Psybear's
  60-minute Ion Hazzikostas developer interview (game-design discussion, and outside his Feral
  scope); and Dratnos' RWF day recaps.
- **One worth naming: Supatease `0IxhGWTTJKA` "Frost DK is BACK"** (2026-09-07). Its
  `media:description` merely copies the title plus hashtags — the clip-short shape — and
  Supatease is **not registered for Death Knight at all** (his scoped classes are Shaman whole,
  Affliction Warlock, Arms/Protection Warrior), so a Frost DK take from him would be rejected by
  the take-scope validation anyway. Left unseen rather than retired, because a scope widening is
  an owner decision, not mine.
- **0 takes, 0 metaNotes added; `creator-takes.json` untouched.** No creator's `latest` advanced,
  since none of them names a video this run distilled. **No YouTube or transcript-API request was
  made by me** — the nightly rule holds. `npm run audit:creators`: HIGH 0 · MED 0 · INFO 9 (the
  eight zero-yield transcribable creators, plus the expected "expert lane dormant between cycles"
  note now that `PHASES.ptr` is null).
- Lane hygiene verified after the edit: **0 overlaps** across distilled / `skipped[]` / `seen[]` /
  `videos[]`. Final counts — videos 2, skipped 419, seen 549.

## 2026-09-07 (local, scheduled) — caption 429 on its SIXTEENTH day; one probe, nothing distilled; the nightly drained the queue mid-run

**The residential caption lane is still down — day 16 since 2026-08-23.** Nothing distilled, no
data file changed by this skill, `pending-transcripts.json` untouched.

- **ONE probe, per SKILL.md's bound.** `oGfnWqTcrZA` (Sha, "The Mythic+ Meta is Interesting...",
  2026-09-06) was the entire queue at bootstrap. Metadata and `--list-subs` were fetched first and
  both were healthy — `not_live`, 672s, an `en` auto-caption track offering json3 — then the
  documented `player_client=android` recipe at `--sleep-requests 1.5` → **HTTP 429**. Stopped there.
- **Same third shape as every previous day, re-derived rather than assumed**: the watch page and the
  android player API JSON both download, subtitles resolve (`Downloading subtitles: en`), format 18
  is selected and yt-dlp writes the subtitle target path — and only the `timedtext` download 429s.
  The datacenter bot-wall message never appeared. No cookies file was supplied, so the authenticated
  fallback was not open to this unattended run.
- **yt-dlp on this machine is 2026.07.04, BEHIND the `requirements.txt` pin of 2026.08.19.** Noted
  because the nightly installs the pin and this machine does not, so local and CI are not running the
  same extractor. It is NOT the cause here — the failure is an IP-scoped `timedtext` refusal that no
  client version changes — and SKILL.md forbids upgrading in-run, so nothing was touched.
- **No discovery sweep**, same reasoning as every 429 day: the nightly polled all 44 channels at
  16:01Z and queued what it found; duplicating that from here buys nothing.
- **The queue was drained by its designed path while this run was in progress.** The 2026-09-07
  nightly landed at 16:01Z, distilled `oGfnWqTcrZA` into a Sha Brewmaster M+ take via Supadata (which
  is exempt from this IP flag) and queued `jGeOuxbfGUo` (Kalamazi). That new video was NOT probed —
  this run's one probe was already spent. **Day 16 still costs latency, not coverage.**

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
