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
