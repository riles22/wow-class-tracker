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


## 2026-10-02 (nightly) — 44/44 feeds polled; izen `LKzPqYFo6dw` distilled into **7 M+ metaNotes** (7 superseded); queue **2 → 3** (Obli DK season round-up + Musguete 12.1.5 Rogue); Tactyks `QsYJEKOp-dA` still `review-required`

- **Discovery:** every configured feed polled inline in the foreground — **44 distinct channel
  ids** behind the 79 transcribable entries (76 class-scoped + 3 `generalCreators`), up to 3
  attempts each, **44 of 44 HTTP 200, 0 failures, 0 entries missing a `channelId`**; the 40
  `transcribable: false` entries skipped by design.
- **Seen-set from structured data only** — `seen[]` 551 + `skipped[]` 448 + `videos[]` + every
  `youtu.be` id in a take or metaNote url = **1,316 ids**. Never regexed from this file.
- **402 unseen videos are in-cycle** against the computed bound (the OLDEST date in
  `ptr-builds.json`, **2026-06-18**, taken as a DATE and not an index), **184** of them
  keyword-matching. Nightly run ⇒ the keyword filter stays and the queue stays narrow; nothing
  was marked `seen[]` on a budget or title judgment, so the other 400 stay genuinely
  unexamined and reconsiderable.
- **Transcripts:** the deterministic step fetched 1 of the 2 queued (`summary.json` verdict
  `review-required`; usage 36 counted requests in the 30-day window, `limit` null). No agent-side
  yt-dlp or API call — this runner holds no transcript credentials.
- **izen `LKzPqYFo6dw`** "2/5 New Meta Specs? | Mythic+ Week 6 — 2 Weeks From 12.1.5"
  (published 2026-09-30, **481 chunks / 3,447 words, read in full**) → **7 metaNotes**, M+ lens,
  `generalCreators` lane only (never `takes[]`). His thesis is that the September 23 Unholy
  bug-fix buff is displacing two of the five meta-comp slots:
  **Unholy DK positive** (overall representation more than doubled ~2.2 → 4.8%, **0.2 → 4.8% in
  the highest keys**, ~15% of popular comps, and he judges its single-target/boss damage genuinely
  competitive rather than just popular);
  **Arms Warrior negative** (−14% in one week after a month that gained 7%; the all-rounder cut
  when a fifth candidate arrives, though he still credits two-target cleave, Execute and the shout);
  **Blood DK negative but explicitly NOT nerfed** (two specs of one class are historically not
  meta together, so Blood yields the tank slot; he still rates its damage above Guardian's and
  notes its larger defensive array);
  **Guardian Druid positive with no buff behind it** (11 → 22% of 20+ keys against Blood's opening
  83%, 27 → 40% in the post-hotfix cut, effective damage-taken parity once self-healing is netted
  — 290k vs 190k taken, ~50k external each — plus Mark of the Wild and big-pull synergy; he keeps
  the caveat that Guardian's damage is still a reasonable amount behind);
  **Assassination Rogue positive** (+6%, priority damage too valuable to drop);
  **Elemental Shaman mixed** (still growing, but weak single target and named a replacement
  candidate alongside Arms);
  **Arcane Mage neutral** — a read he genuinely expresses (unmoved since the season began, ruled
  out as the spec Unholy replaces), not a filler neutral.
  Each supersedes **that creator's previous live M+ note for the same spec** (7 superseded: Unholy
  09-25, Blood 09-25, Guardian 09-25, Elemental 09-25, Arms 09-22, Assassination 09-22, Arcane
  09-22). His 2026-08-16/08-17 **pre-launch** panels were left live, as every newer live note on
  this file has done. Every number was checked back against the chunk it deep-links to, and ASR
  mangles ("Anoli"/"ank" for Unholy, "Mwever" for Mistweaver, "rally cry") are paraphrased, never
  quoted.
- **DECLINED, on the documented rules:** Protection Paladin, Protection Warrior and Brewmaster —
  a single +21 damage-taken log plus a bare "the other tanks gave up on them" enumeration, i.e.
  fight artifact + list-mention; **Frost DK** — "stays practically the same" is a representation
  observation inside an enumeration, and the 2026-08-07 precedent is explicit that Frost DK must
  not be read off list membership; **Feral / Outlaw / Windwalker** — named only in a list of niche
  melee comps; **Mistweaver** — a Season-1 historical analogy, not a current read.
- Its id was removed from `videos[]` in the same edit (one-record rule), and izen's
  `generalCreators.latest` advanced to this distilled video rather than to a fresh title.
- **`QsYJEKOp-dA` (Tactyks) stays queued, untouched:** the provider returned
  `request-timeout: provider may have consumed a request; no automatic retry`, recorded as
  `review-required`. State was not reset and no replacement fetch was attempted.
- **QUEUED 2 (queue 2 → 3)**, both verified against this run's live RSS with an author match:
  **Obli `cUeoz6js3OY`** "How has the state of DK been in Season 2 of Midnight? /w @Bicepspump &
  @waalpen" (2026-10-02) — a season-state round-up inside his registered Frost/Unholy scope; it
  has **two guests**, so the ASR-has-no-speakers rule applies at distillation and only
  self-anchored claims may be attributed to him. **Musguete `zQgeZR1ag0Q`** "Patch 12.1.5 Rogue
  Changes: Everything You Need to Know" (2026-10-01) — in his Outlaw/Assassination/Subtlety scope;
  being pre-release 12.1.5 material it would be framed `"12.1.5 PTR preview — NOT LIVE"`, since
  `PHASES.livePatch` and `LABEL_FLIP_DUE` are both still null and the patch is dated Oct 13.
- **Not queued, with reasons** (so the next run need not re-reason them): the eight YoDaTV "Why
  Your Tank is Dying in …" dungeon-mechanic guides and Tactyks'/Bansherz' Mythic Ula'tek boss
  guides (guide-shaped, no spec-strength read); Shadarek's bonus-roll/crest PSA (gearing PSA);
  the leak/Critcake/Whispyr/Kalamazi key-run and prog streams; everything titled "WoW: Forever"
  (a different product); Dalaran Gaming's 5v5 duel series and Supatease's "Midnight PVP Tier List
  Update" (PvP lens, out of scope). None of these was written into `seen[]` — they remain unseen
  so a later run can still verify by transcript if one looks worth it.
- **No creator opinion touched a tier, a consensus or the frozen forecast.** `npm run
  audit:creators` → **HIGH 0 · MED 0 · INFO 9** (8 zero-take transcribable entries + the standing
  "expert lane dormant between cycles" note).

## 2026-10-02 (local, scheduled) — queue **2 → 2**: 0 captions fetched (persistent 429, sixth day); 0 takes, 0 metaNotes; run BEFORE today's nightly, which had not fired by 14:48Z

- Queue on entry: Tactyks `QsYJEKOp-dA` (Supadata `review-required`, untouched) and izen `LKzPqYFo6dw` ("2/5 New Meta Specs? | Mythic+ Week 6", 09-30, queued by the 10-01 nightly). Dratnos `eetDj-TI5UM` left the queue in the 10-01 nightly (`skipped[]`).
- One caption download attempted, on izen `LKzPqYFo6dw` (the newer item, never probed locally), default client, `--sleep-requests 3`: the android-vr player fetch succeeded and the subtitle request returned **HTTP 429** — the same timedtext shape as 09-25 through 10-01. **Caption traffic stopped there**; no second probe, no breadth sweep (same endpoint).
- yt-dlp still 2026.07.04 against the 2026.8.19 pin, not changed in-run. No authenticated fallback (needs a cookies.txt from Riley). `data/` unchanged; manifest left alone (partial run).

## 2026-10-01 (nightly) — 44/44 feeds polled, 660 entries, 400 unseen in-cycle; **1 transcript read → `skipped[]`, 1 queued; 0 takes, 0 metaNotes**; Tactyks still `review-required`

**Discovery.** Every configured YouTube feed polled inline in the foreground — 44 unique
`channelId`s behind the 79 transcribable creator entries (76 class-scoped + 3
`generalCreators`), up to 3 attempts each with backoff: **44 of 44 HTTP 200, 0 failures, 0
entries missing a channelId**. The 40 `transcribable: false` entries were skipped by design.
660 feed entries, `media:description` parsed alongside the title on every one.

**Seen-set from STRUCTURED DATA only** (never a regex over this file): `seen[]` 551 +
`skipped[]` 447 + `videos[]` 2 + 315 distinct `youtu.be` ids cited by a take or metaNote =
**1,315 ids**. 400 entries are unseen, and **every one of them is on or after the cycle bound
2026-06-18**, derived as `Math.min` over the dates in `data/ptr-builds.json` (never
`builds[0]`, which is the 09-29 hotfix). 251 of the 400 pass the nightly keyword cut
(class/spec names + Midnight/12.1/Season), which stays ON because the queue is drained by the
metered provider.

**No YouTube or transcript-API request was made by this agent.**
`transcript-fetch/summary.json` verdict **`review-required`** (requested 1 / fetched 1 /
cached 0):
- `QsYJEKOp-dA` (Tactyks, "Kith'ix Raid Testing on the 12.1.5 PTR…", 09-17, queued 09-26)
  remains `review-required` on *"request-timeout: provider may have consumed a request; no
  automatic retry"*, `failures: 1`, `nextAttemptAt: null`. It **stays queued with its retry
  state untouched** and no replacement was fetched. The verdict is neither `unauthorized` nor
  `limit-exceeded`, so no API-key problem is flagged in the manifest summary.
- Usage receipt: 35 counted requests / 1 uncertain in the 30-day window, `limit: null`.

**DISTILLED 0 takes and 0 metaNotes.**

**SKIPPED with a transcript-verified reason (1):** `eetDj-TI5UM` — Dratnos, "Weekly Vault:
Passion Raids" (2026-09-29), all **381** chunks read. It is a Great Vault loot-selection
walkthrough across his six tanks: neck/bracer/helmet/belt item-level arithmetic, socketed-vs-
unsocketed comparisons, bonus-roll sequencing against the new Nebulous Voidcore cadence, crest
saving until the Myth achievement, and an aside that he ran no M+ keys last week. That is
gear-level content, and the rule is explicit that an item- or gear-level claim never mints a
take. His registered scope here is **Warrior Arms/Fury**, and the warrior passage is purely
"which vault slot rolled what". The one comparative line in the whole transcript —
*"surprisingly the auto attacks were not anywhere near as bad as I thought … my fears were a
little overblown on playing Brewmaster on those fights once we have a decent chunk of gear"* —
fails on two independent tests: it is a single-encounter, gear-conditional survivability
observation (a fight artifact, not a spec-strength call), and **Brewmaster is outside his
registered scope**. Minting a neutral to record that the video was watched would have asserted
a directional view he never expressed and diluted his live Warrior reads through `expertRead`'s
per-creator averaging. 0 takes, 0 metaNotes. Moved out of `videos[]` into `skipped[]` in the
same edit, so the one-record rule holds (overlap check across all four lanes: 0).

**QUEUED 1, chosen on its `media:description`, not its title:** `LKzPqYFo6dw` — izen
(Izenhart), "2/5 New Meta Specs? | Mythic+ Week 6 - 2 Weeks From 12.1.5" (2026-09-30). The
description is a per-spec chapter list — *01:25 The Unholy Growth · 02:34 Damage Profiles ·
03:32 But if UH is growing… · 05:18 …then one is falling · 07:14 The 5 DPS · 08:23 The 2xRed
Question · 10:02 Guardian Druid · 16:14 Different Comps?* — and names "2 More DPS Specs up as
potential TOP 3 Picks in M+ as well as the major growing of the potential new Meta Tank". That
is the `metaNotes[]` archetype for a `generalCreators` entry, and the firewall holds: izen can
never receive a specialist `takes[]` attribution.

**Declined on description and left UNSEEN** (a budget/description judgment is not a durable
dismissal, so `seen[]` took nothing and stays at **551**): AutomaticJak `kbnF2DNzQjU` "Three
BIG Holy Priest Tips You Need To Know" and `qk4eaZ6-bHM` (guide-shaped how-to — the documented
zero-take shape); Critcake `oIbrnsfwEOc` "+21 RLP Arms Warrior" (a key run whose description is
a gear-level claim, "all that new gear is definitely making a big difference"); NeekapHere
`oSbpQvomOuo` and Dalaran Gaming `3W6JY-T4MYw` / `AB40BDcU1Pk` (12.1.5 release-date and
patch-notes recaps — content summaries with no spec-strength read); Bansherz `WQu3KIFOdOc`
(Mythic Ula'tek boss guide, MM-focused but a kill breakdown); Obli `Vz0gSsUBZEE` (San'layn
opener how-to); Whispyr `_RqREgnO62w` "Kith'ix First Look - Patch 12.1.5" (boss first-look);
Tettles `e-1ucW1ZjUA` / `Gt0Zgk1l3Fk` / `1Ndtl2Z8A4I` and Shadarek/Megasett/Sha key VODs
(stream re-uploads). **Supatease `_8GdxRs5OpI` "Midnight PVP Tier List Update 12.1" is a
triage-out, not a budget cut** — PvP is out of scope and a PvP-lens read must never vote in
PvE; same for his duel-tournament and WoW: Forever uploads, and for Dalaran Gaming's "5v5 1v1
Duels" series. A large share of this week's keyword hits are **WoW: Forever beta** content
(class deep dives, legacy-talent reviews, Forever class updates) — a different product
entirely, and it is why the unseen count is high while the distillable set is near empty.

No `community.json` `latest` was advanced, because nothing was distilled to advance one to.
Nothing read published a tier list or rank order, so `data/creator-predictions.json` was not
written. No creator opinion moved any rating.

## 2026-10-01 (local, scheduled) — queue **2 → 2**: 0 captions fetched (persistent 429, fifth day); 0 takes, 0 metaNotes; run BEFORE today's nightly, which had not fired by 14:15Z

- `--list-subs` (never rate-limited) on both queued videos: Dratnos `eetDj-TI5UM` and Tactyks `QsYJEKOp-dA` each carry an English auto-caption track (`en` + `en-orig`), so neither is a durable no-caption dismissal and both stay in `videos[]`.
- One caption download attempted, on Dratnos `eetDj-TI5UM` (the shorter of the two), without `player_client=android` at `--sleep-requests 3`: **HTTP 429** while the player fetch succeeded — the persistent timedtext shape again (09-25, 09-26, 09-27, 09-30, now 10-01). **Caption traffic stopped there**; no second probe. Tactyks' `review-required` Supadata state left untouched.
- yt-dlp still 2026.07.04 against the 2026.8.19 pin, not changed in-run. No authenticated fallback (needs a cookies.txt from Riley) and no breadth sweep (same caption endpoint). `data/` unchanged.

## 2026-09-30 (nightly) — 44/44 feeds polled; **0 takes, 0 metaNotes**; 1 transcript-verified skip (Sha's Brewmaster kill breakdown); 1 queued (Dratnos "Weekly Vault", per-class chapters)

- **Discovery: 44 of 44 channel ids HTTP 200, 0 failures**, up to 3 attempts each with backoff, polled inline in the foreground. 44 unique ids behind the **79** transcribable creator entries (76 class-scoped + 3 `generalCreators`); 0 entries missing a `channelId`; the 40 `transcribable: false` entries skipped by design. **660** feed entries.
- **Seen-set from STRUCTURED DATA only** — `seen[]` 551 + `skipped[]` 446 + `videos[]` 2 + 315 distinct `youtu.be` ids inside take/metaNote urls = **1,314** ids. Never a regex over this file. **391 unseen**, and every one of them is on or after the cycle bound **2026-06-18**, derived as `Math.min` over `ptr-builds.json` dates (never `builds[0]`, which is now the 2026-09-29 hotfix entry). **127** pass the nightly keyword cut, which stays ON because the queue is drained by the metered provider.
- **No transcript fetched by this agent; no YouTube or transcript-API request made.** `transcript-fetch/summary.json` verdict `review-required`, requested 1 / fetched 1 / cached 0. Usage receipt: 34 counted + 1 uncertain requests in the 30-day window, `limit: null`. Neither `unauthorized` nor `limit-exceeded`, so **no API-key problem flagged**.
  - `QsYJEKOp-dA` (Tactyks, 09-17) stays `review-required` on *"request-timeout: provider may have consumed a request; no automatic retry"* — **left queued with its retry state untouched**, no replacement fetched. Fifth night in that state.
  - `Wo69fFji8fc` (Sha) was **fetched: 235 chunks** and is the one thing read this run.
- **SKIPPED with a transcript-verified reason → `skipped[]` 446 → 447: `Wo69fFji8fc` (Sha, "Mythic Nymrissa Wavecaller | Brewmaster Commentary", 2026-09-19).** All 235 chunks read. It is a **kill-breakdown guide** — three-tank strategy with double Blood DK, taunt timing on the water-jet debuff, bubble soaking discipline, gripping Frost Scales onto the boss for their ~99% damage-reduction aura, which pools to clear — and carries **no spec-strength read**. Three tempting passages, all declined:
  1. the only comparative analysis is **INTRA-spec hero talents** — Shado-Pan against Master of Harmony (`t=187`–`t=235`) — and he explicitly says both are very good with competitive logs on almost all fights and to play whichever you prefer, so there is no direction in it. This is the **2026-09-29 Critcake `2zGgllzxL3U` precedent** exactly;
  2. *"I had the rank one damage parse … I believe I've been knocked down to rank two"* (`t=286`) is a **personal log placement on a single encounter**, not a claim about Brewmaster's strength — and per the skill a spec topping one fight is a fight artifact, not a meta read;
  3. *"pretty fun fight for brewmaster if you are not on add-control duty"* (`t=299`) is enjoyment, and *"thinking about possibly playing my BDK for this fight"* (`t=305`) is **anticipation**, which the skill names as not a read.
  It had been queued on 09-29 against the documented **raid-scoped TANK coverage gap**, and that is precisely when fabrication is most tempting: minting a filler `neutral` would have asserted a directional view he never expressed AND diluted his live 2026-08-21 raid read through `expertRead`'s per-creator average. Reporting nothing is the honest outcome. **His `community.json` `latest` was NOT advanced** — nothing was distilled to advance it to.
- **QUEUED 1 → `videos[]` stays at 2: `eetDj-TI5UM` (Dratnos, "Weekly Vault: Passion Raids", 2026-09-29).** Chosen on its **`media:description`, not its title**: the description is nothing but a per-class chapter list — `0:00 Death Knight / 2:24 Paladin / 5:13 Demon Hunter / 7:30 Monk / 10:12 Druid / 11:37 Warrior` — so there is a dedicated Warrior segment from a registered M+ analyst, inside his recorded Arms/Fury scope, and he carries **no bracket firewall** (unlike Tactyks on Method M+). His registry `latest` is still a 2026-07-01 PTR video, so the lane is overdue.
- **Declined on description rather than on title**, and all left **UNSEEN** because a description judgment is not a durable dismissal: `g7TrCPeGJK4` (izen, "Mythic+ Runs Down 30%!") — its full chapter list is Bonus Rolls / Playrate / Week 4-5 / Better Rewards / Heroic over M+ / M+ Loot / 2 Seasons Upside Down / Seasons Playrate, i.e. **participation and playrate**, with no per-spec chapter, and popularity is not a strength read; `oIbrnsfwEOc` (Critcake, "HUGE Overall in +21 RLP!") — a key run whose whole description is *"All that new gear is definitely making a big difference"*, an **item-level claim**, which the skill forbids minting a take from; the 12.1.5 release-date recaps (`oSbpQvomOuo` NeekapHere "Patch Notes … highlighted by the mega delve", `3W6JY-T4MYw` / `AB40BDcU1Pk` Dalaran Gaming) — news recaps, no spec-strength read; `Ljq_r4zAa0g` (LBNinja7, "They did it… Mistweaver BUFFED!!") — empty description and `#shorts`-style hashtag title, so almost certainly sub-minute, but **duration could not be verified** (yt-dlp is bot-walled on this runner and was not attempted), and an unverified duration is not the durable fact `seen[]` requires; plus the usual out-of-scope shapes — YoDaTV's nine "Why Your Tank is Dying in <dungeon>" guides, Dalaran Gaming's 1v1-duel PvP series, Supatease's dueling-tournament rankings, and the large "WoW: Forever" beta lane, which is a different product entirely.
- **`seen[]` took nothing this run and stays at 551.** The remaining 126 keyword hits are a budget cut, not a judgment, so they stay genuinely unexamined and will be reconsidered.
- **No creator opinion moved any rating.** No tier list or rank order was published by anything read, so `data/creator-predictions.json` was not written.

## 2026-09-30 (local, scheduled) — queue **3 → 2**: 1 durable no-caption dismissal, 0 captions fetched (persistent 429, fourth day); 0 takes, 0 metaNotes; run BEFORE today's nightly, which had not fired by 14:06Z

- `--list-subs` (never rate-limited) on the three queued videos: Sha `Wo69fFji8fc` and Tactyks `QsYJEKOp-dA` both carry an English auto-caption track; **Obli `5Itu4dmNP8M` has no automatic captions and no subtitles at all**, which the same client in the same session listed normally for the other two (and for leak `5LF-JYAo8j0` as a control), so this is the video and not the transport. Metadata: 414 s, `live_status: not_live`, `was_live: False`, uploaded 2026-09-17, which is 13 days, far past any auto-caption lag. **Moved `videos[]` → `seen[]`** as a durable fact ("no caption track of any kind"), so tonight's Supadata drain does not spend a metered request on a video that has no native captions to return. Its description's "definitely the weaker spec" line was NOT distilled: a description is a triage signal, never a take source (the 09-29 Critcake lesson).
- One caption download attempted, on Sha `Wo69fFji8fc`, without `player_client=android` at `--sleep-requests 3`: **HTTP 429** while the player fetch succeeded. That is the persistent timedtext shape (09-25, 09-26, 09-27 and now 09-30), so **caption traffic stopped there**. Sha and Tactyks stay in `videos[]` for Supadata; Tactyks' `review-required` state was left untouched.
- Installed yt-dlp is 2026.07.04 against the 2026.8.19 pin, with no JS runtime; not changed in-run (the skill forbids it). No authenticated fallback, because that needs a cookies.txt from Riley, and no breadth sweep, because it uses the same caption endpoint.

## 2026-09-29 (nightly) — 44/44 feeds polled; **1 leak RAID take** from 5LF-JYAo8j0; 1 transcript-verified skip; 2 queued; 0 metaNotes

- **Discovery: 44 unique channel ids behind 79 transcribable entries (76 class-scoped + 3 `generalCreators`), 44 of 44 HTTP 200, 0 failures, 0 entries missing a `channelId`.** Seen-set rebuilt from STRUCTURED DATA only (`seen[]` 550 + `skipped[]` 445 + `videos[]` 3 + every distinct `youtu.be` id in a take or metaNote url) = **1,312 ids**. 660 feed entries, **384 unseen**, all on or after the cycle bound **2026-06-18** (derived as the OLDEST date in `ptr-builds.json`, never `builds[0]`); **170** pass the nightly keyword cut, which stays on because the queue is drained by the metered provider.
- **Transcripts: none fetched by this agent, and no YouTube or transcript-API request made.** `transcript-fetch/summary.json` verdict `review-required`, requested 2 / fetched 2 / cached 0 — `2zGgllzxL3U` fetched:407, `5LF-JYAo8j0` fetched:308, and **`QsYJEKOp-dA` (Tactyks, 09-17) is still `review-required` on "request-timeout: provider may have consumed a request; no automatic retry"**, its third night in that state, so it STAYS QUEUED with its retry state untouched and no replacement fetched. Verdict is neither `unauthorized` nor `limit-exceeded`, so no API-key problem was flagged in the manifest summary. Usage receipt: **33** counted requests / 1 uncertain in the 30-day window, limit null.
- **DISTILLED — leak `5LF-JYAo8j0`, "Mythic Twin Fangs | Rank 1 Survival Hunter PoV and Commentary" (2026-09-21) → 1 RAID take, Hunter|Survival, `nerf`, deep-linked `t=543`.** The video is mostly a boss VOD review, but it closes with an explicit standing read: Mythic Twin Fangs is a miserable encounter for Survival (pet, Harpoon and Takedown pathing plus Wildfire Bomb unable to cleave both bosses — every historical Survival problem on one boss); he then **discounts his own rank-one parse himself** — "rank one of four", because almost nobody plays the spec on it — and reads the all-specs view for the encounter with Marksmanship far above his rank-one Survival parse. Verdict distilled as his: not the worst spec in the game, but pretty bad next to Marksmanship, simply not very good, "just play marksman if you have the choice", and he is being beaten inside his own raid group by people not parsing well. The **one strength he names is add damage** on the Spawn of Vexxol adds, which the claim carries as the fight-scoped bright side he offers it as — not as a revision. Identity is anchored by self-reference throughout. **Supersedes his 2026-09-05 raid take** (same raid lens, different date — the legitimate different-date supersede) and nothing else; he holds no other live Survival lens.
  - Sentiment stayed `nerf` rather than `mixed` on purpose: the add-damage carve-out is scoped to one encounter's adds and is the documented **fight-artifact** shape, so promoting it into the sentiment would soften a read he states three separate ways as negative.
- **SKIPPED with a transcript-verified reason — Critcake `2zGgllzxL3U`, "THANE Blasts?? - +21 Temple of Sethraliss" (2026-09-27).** ⚠️ **Queued on 09-28 on the strength of its `media:description`, which promised "Arms' ST/prio/2T damage is still higher though" — and the word "Arms" appears ZERO times in the transcript.** What is actually there is intra-spec: Mountain Thane was buffed ~3%, does less single target than **Slayer** and more AoE than Slayer, and he calls it solid on overall — Fury Mountain Thane against Fury Slayer, i.e. the hero-talent-within-one-spec standing skip (YoDaTV `qIIE4KDp_uU` precedent). Substance worth keeping: he plays a bloodthirst-focused variant over the standard raging-blow build and drops Blood Craze for Enrage Regeneration; you get **five globals inside an Improved Whirlwind window** when the final stack is consumed by Rampage, because the buff-consumption is delayed; and **recent sims have retired the Thunder Clap-spam rotation above six targets** (Thunder Blast stays high priority, Thunder Clap only to refresh). No read on Fury against any other spec, so a sentiment would have been the distiller's; a filler neutral would also dilute his substantive 09-16 Arms and 09-17 Fury reads through `expertRead`'s per-creator average. **The description being wrong about its own video is the lesson** — it is a good triage signal and not a substitute for the transcript.
- **QUEUED (2, keyword-relevant, no fetched transcript), both chosen on `media:description`:** **Obli `5Itu4dmNP8M`** "THE TWIN FANGS MYTHIC / Unholy DK POV" (2026-09-17 — its description says outright "Its **DEFINITELY the weaker spec**" and that he had already killed it on Frost, i.e. an explicit Unholy-against-Frost read inside his registered Frost/Unholy scope); and **Sha `Wo69fFji8fc`** "Mythic Nymrissa Wavecaller | Brewmaster Commentary" (2026-09-19 — a kill breakdown from the registered Brewmaster specialist, queued specifically at the documented raid-scoped **TANK** coverage gap).
- ⚠️ **yt-dlp metadata is unavailable on this runner and was abandoned after two calls.** Probing `5Itu4dmNP8M` and `Ljq_r4zAa0g` for `duration`/`live_status` returned the settled datacenter bot wall ("Sign in to confirm you're not a bot"), plus a new warning that **no JS runtime is present, so extraction is deprecated and metadata may be missing**. Stopped immediately rather than hammering, per the skill. Consequence: **LBNinja7 `Ljq_r4zAa0g`** "They did it… Mistweaver BUFFED!!" (09-19) could NOT be checked for the sub-minute Short shape its hashtag title and empty description suggest, so it was **not** queued and stays **UNSEEN** — an unverifiable candidate is an uncertainty dismissal, not a durable one.
- **The other 168 keyword hits stay UNSEEN, not `seen[]`** — a budget cut is not a durable dismissal, and `seen[]` took nothing this run. The backlog is overwhelmingly raid and key PoVs (Shadarek, Bansherz, Whispyr, Clandon, AutomaticJak, Reholy, Musguete, Preheat, Baze, J-Funk), Dratnos/Tactyks boss guides, Dalaran Gaming's and Supatease's PvP duel series, and the large **"WoW: Forever"** wave. Also examined and deliberately not queued: izen `g7TrCPeGJK4` (M+ participation counts, no per-spec reads); Musguete `gpE3J7s5_zM` (Fatebond vs Deathstalker — intra-Assassination hero talents, same skip as Critcake tonight); YoDaTV `qIIE4KDp_uU` (Deathbringer vs San'layn, intra-Blood); Whispyr `WtRqmNBkcEo` (trinket-nerf sims — an item-level claim, which never mints a take); Musguete `M0C9Y8x-Ll0` ("Sub Rogue IS PUMPING" on Mythic **Nymrissa**, the world boss — a fight artifact by construction); Supatease `Z8txiZ6jSPY` (PvP lane); Sha `5B5XWvXrNFY` and Dorki `eoh6M6x0ohU` (guide-shaped).
- **`latest` advanced on leak only**, to state what was actually distilled tonight. Critcake's was left as his 09-17 distilled read rather than overwritten with a verified skip — the rule is that `latest` states what is KNOWN, not what is newest. Neither video published a tier list or rank order (leak reads a third-party Warcraft Logs ranking, which is not his own prediction panel), so `data/creator-predictions.json` was not written. **No creator opinion moved any rating.**

## 2026-09-28 (nightly) — 44/44 feeds polled; **16 izen raid metaNotes** from jBVWrW2ibOw; 1 transcript-verified skip; 2 queued; 0 takes

- **Discovery: 44 unique channel ids behind 79 transcribable entries (76 class-scoped + 3 generalCreators), 44 of 44 HTTP 200, 0 failures, 0 entries missing a `channelId`.** Seen-set rebuilt from STRUCTURED DATA only (`seen[]` 550 + `skipped[]` 444 + `videos[]` + every `youtu.be` id in a take or metaNote url) = **1,310 ids**. **380 unseen videos**, all on or after the cycle bound **2026-06-18** (derived as the OLDEST date in `ptr-builds.json`, never `builds[0]`); **225** pass the nightly keyword filter, which stays on because the queue is drained by the metered API.
- **Transcripts: none fetched by this agent.** `transcript-fetch/summary.json` verdict `review-required`, requested 2 / fetched 2 / cached 0 — `jBVWrW2ibOw` fetched:446, `6PSzZBIDrYc` fetched:105, and **`QsYJEKOp-dA` (Tactyks, 09-17) is `review-required` on "request-timeout: provider may have consumed a request; no automatic retry"**, so it STAYS QUEUED with its state untouched and no replacement fetched. The verdict is neither `unauthorized` nor `limit-exceeded`, so no API-key problem was flagged in the manifest summary. Usage receipt: 31 counted requests / 1 uncertain in the 30-day window, limit null.
- **DISTILLED — izen `jBVWrW2ibOw`, "Raid Top DPS & HPS Results Post-Tuning | Week 6 | New Rising Faces" (2026-09-26) → 16 raid-lens metaNotes.** General-creator lane only, never `takes[]`. Unholy DK **positive** (bottom three → first overall; buffs weighted to single target, Red Plague + the Blightfall fix), Frost DK **positive but far smaller** (Obliterate ~15-20% of a single-target boss), Augmentation **positive** (personal-damage buff on a spec ~80%+ buff damage; he walks a Coilfang Darter log where ~17% is the player's own buttons), Marksmanship **positive** (the only small buff visibly landing; best of the three Hunters), Frost Mage **positive** against Fire, Resto Druid **positive** (HoT build, closing on Preservation), Havoc **mixed** (Aldrachi Ripper adopted for Wounded Quarry funnel, standings unmoved), Devastation **mixed**, Windwalker / Subtlety / Retribution **neutral** (Trickster and Templar still unplayed), Survival **negative** (no increase at all), Preservation / Fire Mage / Shadow Priest / Balance **negative**.
- ⚠️ **Supersede was scoped to the UNAMBIGUOUS raid lens and no further — 15 notes retired, not 40.** The new video is raid-only, so it superseded izen's live `raid outlook` / `RAID meta predictions` / `raid-meta recap` notes for those 16 specs. His **mixed-lens tuning walkthroughs were deliberately left live** (the 09-19 "announced September 22 tuning pass" and 09-23 "how the September 22 tuning is actually landing" notes cover *Mythic+ AND raid*), because a raid-only read does not replace their M+ half — the over-supersede failure the skill records from the Kalamazi bracket pass. Under-superseding costs drawer clutter; the meta nudge reads the NEWEST non-superseded note anyway.
- **Two claims declined from the same video, on the rules:** **Devourer DH** appears only inside the opening enumeration of buffed specs and is never analysed → list-mention, dropped; and the **Mountain Thane** remark is class-wide ("we are not going to be playing Mountain King in the raid regardless") and was **not** attributed to Arms or Fury.
- **SKIPPED with a transcript-verified reason — leak `6PSzZBIDrYc`, "Wildfire Bomb is Bugged... Again." (2026-09-26).** Substance worth keeping: the September 22 **+20% Wildfire Bomb buff did not apply to the periodic portion of REGULAR Wildfire Bomb** (it did apply to the initial hit and to the Shrapnel Bomb dot), read off the AP coefficients — 20.988% against Shrapnel's 25.2%, exactly 20.988% x 1.2 — with **no raid impact** because raid builds already ran Shrapnel Bomb, and in M+ grenade-juggler now 1.5-4.3% behind flanked at 5 and 8 targets, so he recommends flanked with Shrapnel Bomb and the Flanker's Advantage point moved to Shell Shock. **No take**: every comparison is intra-spec between two Survival builds, with no read on Survival against any other spec and no tier or meta call. Writing a sentiment would have meant the distiller supplying the direction, and a filler neutral would have diluted his substantive 08-22 live M+ standing read through `expertRead`'s per-creator average. It is a bug claim, not Blizzard's notes, so it is not feed material either.
- **QUEUED (2, keyword-relevant, no fetched transcript):** Critcake `2zGgllzxL3U` "THANE Blasts?? - +21 Temple of Sethraliss" (2026-09-27 — its own description carries an explicit comparative read, "first impression of Thane after buffs is surprisingly good... Arms' ST/prio/2T damage is still higher though"), and leak `5LF-JYAo8j0` "Mythic Twin Fangs | Rank 1 Survival Hunter PoV and Commentary" (2026-09-21, description states a spec-standing read). `media:description` was parsed on the discovery pass and is what settled both.
- **The rest of the 380 stayed UNSEEN on purpose.** They are budget dismissals, not durable ones: the sweep is overwhelmingly stream VODs, key-run PoVs, Dalaran Gaming's PvP duel series (out of scope) and **"WoW: Forever" beta content**. Tempting as it is to retire the Forever videos wholesale, marking a budget cut as seen is the failure that silently abandons a handed-forward backlog — anything not in one of the four lanes is genuinely unexamined and gets reconsidered.
- `generalCreators` `latest` for izen advanced to state what was actually distilled tonight. No creator take moved any tier.

## 2026-09-27 (local, scheduled) — 0 captions (persistent 429, third day); 0 takes, 0 metaNotes; queue left to the nightly's Supadata lane

- Probed once at 14:07Z, before today's nightly, on izen `peDmFfrUZeg`. The caption download returned HTTP 429 while the player fetch succeeded. One paced retry without `player_client=android` at `--sleep-requests 3` also returned 429. **Caption traffic stopped there.** This is the persistent timedtext shape (09-25, 09-26 and now 09-27).
- The nightly then drained that queue itself (published `af66dfd`: 4 izen metaNotes + 3 12.1.5 takes) and left 3 in the queue: Tactyks `QsYJEKOp-dA` (carried over from 09-26), plus two it queued today, izen `jBVWrW2ibOw` and leak `6PSzZBIDrYc`. **None were attempted here**, because the IP flag has not cleared. All three stay in `videos[]` for Supadata. `data/` was not touched by this skill.
- No authenticated fallback: this was an unattended run, and that lane needs a cookies.txt from Riley. No breadth sweep, since it needs the same caption endpoint.

## 2026-09-27 (nightly) — 44 feeds, 0 failures; 2 of 3 transcripts resolved → **4 metaNotes + 3 takes**, 2 queued; 1 left `review-required`

- **Transcripts.** `summary.json` verdict **`review-required`**: 2 of 3 fetched natively (`peDmFfrUZeg` 449 chunks, `GWaPC3CyfwI` 336), 0 cached, **29 counted requests** in the 30-day window, no configured limit. `QsYJEKOp-dA` (Tactyks) returned `review-required` on a **request-timeout that may have consumed a provider request** — so it **stays in `videos[]`** with its retry state untouched and no replacement was fetched. No YouTube or transcript-API request was made by this agent.
- **izen `peDmFfrUZeg` "EMERGENCY BROADCAST: Unholy DK now S Tier M+ DPS" (09-25) → 4 M+ `metaNotes`.** His follow-up on the September 23 Blightfall bug fix actually landing.
  · **Unholy DK `positive`** — the 09-23 asterisk resolved his way: every new top Unholy key is dated to this reset and every one runs Blightfall, against Arcane results spanning ten days. Play rate 0.7%→11% at all levels, 2%→5.6% at 15+, 0.2%→**3.4%** at 20+. Profile: priority damage inside AoE pulls ahead of Elemental and matching Arcane on the Altar of Fangs and Murder Row openers; pure single target ahead of Elemental, just behind Subtlety; one clear hole, short burst windows. His own two caveats are in the note (a handful of top keys only; Blizzard may nerf it back). **Supersedes his 09-23 `mixed` Unholy note**, which was explicitly conditional on this fix.
  · **Guardian Druid `positive`** — 12%→22% on like-for-like first-three-days windows; he names it the likeliest tank to make room for an Unholy DK, on Mark of the Wild's neutral versatility. Supersedes his 09-22 note.
  · **Elemental Shaman `mixed`, not negative** — he still calls it currently meta, but argues the comp case against it for the first time ("what's the point in keeping an elemental"), noting the swap costs no Bloodlust and the real loss is Arms' Windfury. `mixed` is the faithful read; `negative` would overstate a spec he calls meta in the same breath. Supersedes his 09-22 `positive` note.
  · **Blood DK `mixed`** — directly contradicts the "flat play rate" half of his 09-22 note: ~60% down by nearly 10 points this reset. The causal claim is **explicitly his speculation** (drop the Blood tank to fit a DK as DPS) and is labelled as such; the observed double-DK groups are reported as the intermediate state. Supersedes 09-22; his 09-23 note (the aura cut is immaterial, Blood still top tank damage) is a different subject and stays live.
  · **NOT distilled:** Demonology, whose only content is second-hand ("warlocks have been crying") plus the same squishiness point his 09-22 `negative` note already carries; Arcane and Subtlety, which appear only as the benchmarks Unholy is measured against; and his closing "as a healer, I'm biased, I prefer DKs over elementals, arms, wind walkers, demos, BM hunters" — self-declared bias and a bare enumeration, twice disqualified.
  - ASR note: this transcript writes Unholy as **"Anoli"/"Anholi"** and Blightfall as **"bllightfall"/"blindfold"/"Bllightfold"**. Paraphrased with the real names; no caption text quoted.
- **Dalaran Gaming `GWaPC3CyfwI` "WoW 12.1.5 PTR: Demon Hunter Rework, Rogue Buffs & More!" (09-26) → 3 takes**, all framed **"12.1.5 PTR preview — NOT LIVE"** (the patch has no launch date; `PHASES.livePatch` and `LABEL_FLIP_DUE` both null, so the live framing does not apply). It reviews the **2026-09-15** update of thread 2344395, i.e. content already in the notes-only preview ledger, so the video is a creator read and not a notes source.
  · **Outlaw `buff`** — the Deft Maneuvers rework (flat Blade Flurry surcharge → per-target cost) as the fix for maintaining Blade Flurry on one or two extra targets without high haste; "a very good convenience change that should result in a decent damage increase".
  · **Subtlety `mixed`** — he declines to score it in his own words: buff "potentially", nerf "conceivably"; wants the double-dip cleanup, expects consistency and possibly a tuning pass afterwards.
  · **Restoration Druid `buff`** — Nature's Bounty's Regrowth cleave read as "potentially good", compared to Glimmer Paladin, with the three-target cap named as its limit.
  · **Out of scope and NOT written:** Devourer DH (the video's headline), Holy Priest's Ultimate Serenity move, and the Protection Warrior Execute rollback deferred to 12.2/13.0 — none of Demon Hunter, Priest or Warrior is in his registered scope. Frost Mage IS in scope and still yielded nothing: the segment is bug-fix description with "it's hard to say honestly" as its only verdict, and minting a `neutral` there would be the placeholder the skill forbids.
  - ASR note: the transcript says "death maneuvers"; the talent is **Deft Maneuvers**.
- **Discovery.** 44 unique channel feeds behind 79 transcribable entries (76 class-scoped + 3 `generalCreators`), up to 3 attempts each, **44/44 HTTP 200, 0 errors**; the 40 `transcribable: false` entries skipped. Seen-set **1,308** ids from structured lanes only (`seen[]` 550 + `skipped[]` 444 + `videos[]` 3 + every distinct `youtu.be/<id>` in a take or metaNote). **374** unseen videos on or after the cycle bound **2026-06-18** (oldest date in ptr-builds.json, never `builds[0]`); **221** pass the nightly keyword cut.
- **2 queued**, both checked against `media:description` first: izen **`jBVWrW2ibOw`** "Raid Top DPS & HPS Results Post-Tuning | Week 6" — the chaptered per-spec RAID recap, and the raid counterpart to tonight's M+ notes; **`6PSzZBIDrYc`** leak "Wildfire Bomb is Bugged... Again." — his own description says it does not impact raid but can impact M+ and names the affected builds, i.e. a Survival Hunter read, inside his scope.
- **Deliberately not queued:** Zorthas `2VZwadTw-xU` "Why Was The Venomous Abyss So Bad?" (chaptered boss-by-boss raid DESIGN critique — no spec-strength content in the take model); AutomaticJak `N_1_KyNkFt4` (recurring stream VOD, description is links only, and his Disc/Holy reads were distilled 09-26); Sha `5B5XWvXrNFY` (first-pull dungeon guide); Shadarek `R5M0HJ-y0Q0` (Havoc commentary guide; his 09-23 Havoc reads stand); YoDaTV `qIIE4KDp_uU` (Deathbringer-vs-San'layn, hero-talent WITHIN Blood — the standing skip precedent); Obli `-nCfBUSYIU8` and AutomaticJak `dNwsLGq631M` (guide-shaped, held over from 09-26); Supatease `1UzY0mbiO-s` (PvP lane); the large **WoW: Forever** wave (Psybear, Supatease, Kalamazi, Dalaran Gaming, Nintern, Bansherz, Shindigg, NeekapHere) — a different product, and "different game version" is a content judgment, so they stay **unseen**.
- **The other 219 keyword hits stay UNSEEN, not `seen[]`** — a budget cut is not a durable dismissal, and `seen[]` took nothing this run. The backlog is mostly Mythic raid and key POVs (Shadarek, Bansherz, Critcake, Whispyr, Megasett, Preheat, Hopeful, Clandon, Tettles), Dratnos/Tactyks boss guides, Dalaran Gaming's PvP duel series, and the Forever wave.
- `latest` advanced on izen and on all five Dalaran Gaming class entries to the videos actually distilled. Neither video published a tier list or rank order — izen's "S Tier" is a TITLE and the skill forbids deriving a tier from one — so `creator-predictions.json` was not written. No creator opinion moved any tier.

## 2026-09-26 (nightly) — 44 feeds polled, 3 transcripts resolved: 2 takes, 1 verified skip, 1 prediction panel, 3 queued

- **Discovery.** All **44 unique channel feeds** behind the 79 configured transcribable entries polled (76 class-scoped + 3 `generalCreators`; most creators are registered under several classes and share one feed), **0 feed errors**. Seen-set **1,305 ids** from the four structured lanes. **372** unique unseen videos on or after the cycle bound **2026-06-18** (oldest date in ptr-builds.json, not `builds[0]`); **219** pass the nightly keyword filter. The remainder stay **UNSEEN** — a budget cut, not a durable dismissal.
- **Transcripts.** The deterministic step fetched all 3 queued videos (`summary.json` verdict `ok`, 3/3 fetched, 0 cached, **26 counted requests** in the 30-day window, no configured limit). No transcript was fetched by this agent. The runner's YouTube bot-wall was re-confirmed on a 4-video `yt-dlp` metadata probe (all four "Sign in to confirm you're not a bot") and the probe was then **abandoned rather than retried** — settled behaviour, not a new finding.
- **AutomaticJak `WglElpwZpZ4` "Is Disc BACK in Mythic+?" → 1 take (Discipline Priest, M+, `buff`).** Four +20 keys across both hero trees on the live dungeon-only Atonement buff: Atonement heals again, "no longer dead in keys", the 1% is reachable now; Voidweaver over Oracle on mana and AoE Atonement (he cites the Priest Discord's 27% vs ~17.5% split); explicitly **not meta** — binary one-dimensional healing with no fallback layer, weak scaling past Evangelism/Archangel, personals worse than Holy's against the season's bleeds, bad on the gather, Ruby Life Pools and Voidscar Arena heal checks a struggle where Den of Nalorakk and Murder Row were comfortable. Supersedes his **09-22** stream-VOD M+ read (same lens, different date); his 09-22 **raid** take stays live.
  - ⚠️ **No Holy Priest take was minted from this video, deliberately.** He makes real comparative Holy claims here (Serenity as a lay-on-hands, passive Renew/PoM/Echo trickle, 54k as Holy on Sept 9 against 53.2k as Disc on the same 20 Voidscar), but they are the *baseline* he measures Disc against, not a fresh Holy read — and writing them as a take would have **superseded his fuller 09-10 B-tier Holy placement** with a fragment. Flagging rather than distilling.
- **YoDaTV `tnwOizGhvU0` "Emergency Mythic+ Tierlist Update" → 1 take (Guardian Druid, M+, `mixed`) + 1 prediction panel.** He moves bear to one tier below Vengeance DH after viewer objections, explicitly on other players' key results, while saying he has not played much bear this season and still rates Vengeance better — `mixed`, not `buff`, because the upgrade and the caveats are the same sentence. Supersedes his 09-22 Guardian read.
  - **Out of scope and NOT written as takes:** his headline Unholy DK placement, Holy Priest → A+, Restoration Druid, Devourer DH. YoDaTV's declared scope is Blood DK / Vengeance / Guardian / Brewmaster / Paladin (all) / Prot+Arms Warrior. The Unholy DK read in particular is the loudest content in the video and the easiest scope violation to make.
  - **Prediction panel `yodatv-tnwOizGhvU0-2026-09-24`** (accounting-only ledger, never a rating input): Unholy DK **S** (he explicitly declines S+ — has not seen an Unholy take rank-one in any dungeon), Holy Priest **A+**, and three explicit `tier: null` rows with reasons — Guardian (relative placement only, no letter), Restoration Druid ("same with resto druid" is genuinely ambiguous between the tier and the decision to leave it), Devourer (bounded below S, no tier named). `nativeOrder` records only the tiers the audio evidences (S+/S/A+); the on-screen list is not readable from a transcript, so the rest of his roster is **absent rather than reconstructed**.
- **Obli `CtKL4uOPUIk` → `skipped[]`.** A Blightfall PLAY guide: one +17 walkthrough of hero-talent decision-making (when to cast Blightfall inside a burst window, Dark Transformation and Essence upkeep, Putrify charges after the dots are consumed), cut short when his recording died. Every comparison is Blightfall vs Rider/San'layn **within** Unholy. Same disposition as his and YoDaTV's hero-talent comparisons.
- **3 queued** (keyword-filtered, because the queue is drained by the metered API): izen **`peDmFfrUZeg`** "EMERGENCY BROADCAST: Unholy DK now S Tier M+ DPS" — description is an explicit chaptered meta read, the `metaNotes` lane; **`GWaPC3CyfwI`** Dalaran Gaming "WoW 12.1.5 PTR: Demon Hunter Rework, Rogue Buffs & More!"; **`QsYJEKOp-dA`** Tactyks "Kith'ix Raid Testing on the 12.1.5 PTR…" (raid scope only — he authors the Method M+ list).
- **Deliberately not queued:** Obli `-nCfBUSYIU8` and AutomaticJak `dNwsLGq631M` (both self-described guides/tips — "fetch broadly, queue narrowly"); Supatease `1UzY0mbiO-s` (`#classic`-tagged, and his lane is PvP); Whispyr `_RqREgnO62w` Kith'ix first look (his own description says "no one was online", so little to read); LBNinja7 `Ljq_r4zAa0g` (hashtag-only, no description — a probable Short, left **unseen** because the bot-wall means the duration could not be confirmed and a title is not a durable dismissal); the WoW: Forever beta uploads that dominate the window (Psybear's two Feral/bear-in-Forever videos among them) — left unseen rather than marked seen, since "different game version" is a content judgment made off a title.

## 2026-09-25 (nightly) — queue **4 → 3**: all four pre-fetched transcripts resolved (2 distilled, 2 verified-skipped), **2 takes + 22 metaNotes** added, 3 new videos queued; 79 feeds polled with 0 errors

- **Transcript step healthy again after the local run's 429.** `transcript-fetch/summary.json` verdict **`ok`**: 4 requested / 4 fetched / 0 cached, per-video `fetched:231/519/281/240` chunks, 23 counted requests in the 30-day window and no configured limit. No transcript was fetched by this agent. All four were read in full and **none was left waiting**.
- **Obli `kB0bop0aUpI` (2026-09-24) → two bracket-split Unholy DK takes.** Raid **`buff`**: the September 23 Blightfall bug fix makes Blightfall "the build everywhere" and puts the top Unholy single-target logs roughly 10% clear of the nearest Frost (he reads 242k against 227k on one boss), a spec he had called "dog water single target" now best in the bracket at it. Three bounds are written into the claim because he states all three himself — cleave and two-target fights still go to Frost, the pets build is close behind, and the sample is under 24 hours and skewed by Asian-server rank-chasing — plus his expectation that Blizzard over-nerfs it within days. M+ **`mixed`**: "kind of a bit neck and neck" with Frost, sample too small to call, "play what you want". Supersedes his 2026-09-23 raid read and his 2026-09-17 M+ read (same creator, same spec, same lens).
  - ⚠️ **No Frost DK take was minted from it**, even though he says "you're playing Frost for everything else" in raid. That line is the comparison baseline inside an Unholy update, and writing it would have retired his substantive 2026-09-19 Frost raid read for a sentence of framing. Flagged here rather than distilled.
  - Two ASR hazards handled: the boss names in this transcript are mangled ("Bashnik"/"Vashj'ir"/"Entomb Sentinel"), so the claim carries the numbers without asserting a boss name, and "Blightful" is written as Blightfall.
- **izen `mYt-nBOsKus` (2026-09-23) → 22 metaNotes across 17 specs**, his post-live walkthrough of the September 22 tuning with each buffed spec weighed against current raid and M+ results. Bracket-scoped with an explicit `bracket` field (`raid` / `mplus` / `both`) rather than left to the patchContext heuristic, because the video TITLE names both brackets and would have made every note read as both. Headlines: Discipline's atonement buff is "the biggest buff of the season" and compounds via the return to Voidweaver to ~20-25% M+ healing, with the other side argued at equal length ("a long climb", "still a very long shot"); Windwalker's single-target buff hits its real M+ gap rather than padding its strength; Shadow should improve in raid; Blightfall stays the big asterisk for Unholy (recorded **before** the 09-23 fix); the Havoc, Devourer, Retribution and Subtlety buffs mostly equalise hero talents rather than lift specs; both Mages and both DPS Evokers are too far back for AoE buffs to matter; Marksmanship splits raid-positive / M+-negative.
  - **Supersession:** the 11 same-spec notes from his 2026-09-19 pre-live read of this exact pass (`sFNCt1mNb7U`) were retired. The four `sFNCt1mNb7U` notes for specs this video does not revisit (Frost DK, Vengeance, Brewmaster, Protection Warrior) stay live, as do the weekly-recap notes from other videos — those are a different lens.
  - **Deliberately NOT distilled:** Retribution Paladin and Subtlety Rogue, whose content is hero-talent viability ("can you play Templar / Trickster now") rather than spec strength; Frost DK, where the only claim is "DPS DKs were having less of a good time" — the bare-group shape the list-mention rule refuses; Balance and Feral Druid, where he says the changes are simply not relevant and gives no standing read.
- **YoDaTV `dtQ0MnB9FxI` → `skipped[]`.** "Is Deathbringer BETTER Than San'layn Now?" is a hero-talent comparison entirely WITHIN Blood — rotation differences, a half-dungeon 262.6k/269k side-by-side he calls meaningless himself, a survivability comparison, and a note that swapping costs one ring and a flask. No claim about Blood against any other tank, no season call. Build-guide shaped.
- **Shadarek `UZrdIj5WLIw` → `skipped[]`.** A two-bug explainer for Aldrachi Reaver's Mark (the target-swap removal script stripping the re-applied mark 20 s later and daisy-chaining; the same-server-tick vanish) with a workaround. Mechanics PSA, not a strength read — his Aldrachi strength reads are the 2026-09-23 takes already on file.
- **Discovery: 79 transcribable feeds polled (every `classes[].creators` entry with a channelId plus all 3 `generalCreators`), 0 feed errors.** Seen-set **1,302** ids, built from the four structured lanes only. **366 unique unseen videos on or after the cycle's opening build 2026-06-18** (derived as `Math.min` over ptr-builds dates, never `builds[0]`), 244 of them keyword-matching.
- **3 queued, keyword-filtered as the nightly requires** (Supadata is metered): Obli `CtKL4uOPUIk` "Breaking down Blightfall in M+", AutomaticJak `WglElpwZpZ4` "Is Disc BACK in Mythic+?" — which is the direct test of izen's biggest call this week — and YoDaTV `tnwOizGhvU0` "Emergency Mythic+ Tierlist Update for 12.1!".
- **The other 363 stay UNSEEN, not `seen[]`** — a budget cut is not a durable dismissal. For the record of what the backlog actually is: Supatease, Psybear, NeekapHere, Kesslive, Jedith and Dalaran Gaming are publishing **WoW: Forever Classic-beta** content, Dalaran Gaming's WoW output is a PvP duel series, and the bulk of the rest is stream VODs and Mythic raid POVs (Tactyks, Tettles, Bansherz, Megasett, Clandon, Shindigg, Whispyr, Kalamazi, Preheat, Critcake, Maximum). Obli's `-nCfBUSYIU8` "Quick Unholy DK Blightfall Guide" was left unqueued as guide-shaped, its analysis sibling queued instead.
- **No tier moved.** `npm run audit:creators`: HIGH 0 / MED 0 / INFO 9 (8 zero-yield transcribable creators, plus the standing between-cycles coverage note).

## 2026-09-25 (local, scheduled) — queue **4 → 4** (0/4 captions: persistent 429); 0 takes, 0 metaNotes; run BEFORE today's nightly, which had not fired by 15:25Z

- **Captions: 0 of 4.** The first id, `kB0bop0aUpI` (Obli), drew HTTP 429 on the caption download while the webpage and player fetches succeeded. **Caption traffic stopped there**, as this skill requires (yesterday's run did not stop). One paced retry 20 s later, without `player_client=android` and at `--sleep-requests 3`, also returned 429. That is the persistent timedtext shape (2026-08-23/24), now on a second consecutive day. The other three (`mYt-nBOsKus` izen, `dtQ0MnB9FxI` YoDaTV, `UZrdIj5WLIw` Shadarek) were not attempted.
- All four **stay in `videos[]`** for the nightly's Supadata lane: a transport failure is not a durable judgment. `data/` untouched.
- No authenticated fallback: this was an unattended run, and that lane needs a cookies.txt from Riley.
- No breadth sweep. It needs the same caption endpoint.

- **Transcript step:** `transcript-fetch/summary.json` verdict **`ok`**, 3 of 3 requested fetched natively (`yDyEKvcZ3VM` 576 chunks, `Xs9g7fYCbCU` 91, `gUa2OZ2awWE` 410), 19 counted requests in the 30-day window, no limit configured. No YouTube or transcript-API request was made agent-side.
- **YoDaTV — “ANOTHER Blood DK Nerf? Is it Over?” (Xs9g7fYCbCU, 2026-09-22) → 3 M+ takes.** Blood DK `nerf`: the 09-21 revision (Death Strike +15% rather than the posted +25%) is a nerf against the first announcement, ST ~0.1%, priority flat, 5-/10-target AoE down 5–6%, but “the important damage is not really going down” and it will not change the meta. Vengeance `mixed`: the Aldrachi buff was trimmed too, and with ~6% off Blood the damage gap closes a lot (his scuffed Temple +20 at 217–218k, ~250k with Chaos Brand, against a rank-one 284k) — he still keeps Blood ahead and stays on Annihilator. Guardian `neutral`: “not a bear believer”, below both even after the nerfs. Superseded his three 2026-09-19 M+ takes on the same specs; his 09-19 tier-list **predictions ledger entry is untouched** (this video publishes no list).
- **Shadarek — Aldrachi Reaver Havoc guide (gUa2OZ2awWE, 2026-09-23) → 2 bracket-split Havoc takes.** ⚠️ Guide-shaped, and normally that means `skipped[]` — but this one carries an explicit post-buff strength read, so it yields. Raid `buff`: after the ~9% buff his sims put Aldrachi **~17% ahead** in pure single target and **13% ahead** at two targets (previously within a couple of percent), boss damage “drastically ahead” of the other melee, soul generation making it far more consistent; he recommends it on essentially everything, Fel-Scarred possibly kept for Ula’tek add-pad phases. M+ `mixed`: “not a good AoE spec — you will lose to basically everything in Mythic Plus”, but funnel and priority damage insane; no AoE talents; he has **not yet run real keys**, which the claim says. Superseded his two 2026-09-19 Havoc takes (same lenses); his Devourer take is untouched, that spec is not discussed.
- **izen — Mythic+ Week 5 recap (yDyEKvcZ3VM, 2026-09-22) → 12 M+ metaNotes** (general-creator lane, never `takes[]`). Elemental the standout riser and the only DPS spec in all three top comps; Holy Paladin ~75% of 20+ keys and still climbing against Resto Shaman’s ~20% at ~100 score behind; Blood DK flat at ~79% and still the top tank damage after the ~5–6% cut; Guardian 11% → 25% play rate, tankier than Blood but ~50k DPS behind (~30k recovered via Mark of the Wild); Brewmaster a 20+ melee-comp hipster pick only; Demonology’s early growth has not stuck at 20+; Arcane, Arms and Assassination hold; Retribution and BM broadly popular but fall off at the top. Superseded his same-lens Week 4 / Week 3 / 09-01 M+ notes for those specs; his 09-19 **tuning-walkthrough** notes are a different lens and were left live.
  - **Deliberately NOT distilled:** Windwalker, whose only appearance is as an example in a “generic constant AoE specs” grouping — a damage-profile remark reached by list membership, which is the 2026-08-07 rule. Same for the bare enumeration of who got buffed in the 09-22 round.
- **Discovery:** all **44** transcribable channels polled, 44/44 HTTP 200, against a **1,298-id** seen-set union (`seen[]` 550 + `skipped[]` 441 + `videos[]` + every `youtu.be/<id>` in a take or metaNote). **361 unseen**, 66 keyword-matching.
- **Queued 4** (nightly keeps the keyword filter; PER_RUN_CAP 25): `kB0bop0aUpI` Obli “Single target damage is INSANE / Unholy DK Midnight Season 2 update”, `mYt-nBOsKus` izen “How Did The Buffs Affect Specs?”, `dtQ0MnB9FxI` YoDaTV “Is Deathbringer BETTER Than San’layn Now?”, `UZrdIj5WLIw` Shadarek “Return of Aldrachi Reaver’s Mark Bug”.
- **Left UNSEEN, not `seen[]`:** the remaining 357 — PoV key/raid VODs, Dratnos/Tactyks boss guides, Dalaran Gaming’s PvP duel series, and the large WoW: Forever wave. A keyword/budget cut is not a durable dismissal, so they stay reconsiderable; `seen[]` took nothing this run.
- `npm run audit:creators`: **HIGH 0 / MED 0**, INFO 9 (8 transcribable-zero-yield creators, plus the expected “expert lane dormant between cycles”). No creator opinion touched a tier. No transcript published a tier list or rank order, so `creator-predictions.json` was not written.
## 2026-09-24 (local, scheduled) — queue **5 → 3** (2/5 captions, then 429); **3 takes, 0 metaNotes**; run BEFORE today's nightly, which had not fired by 15:06Z

- **Captions: 2 of 5.** `9pmu8UGX7TM` (Obli) and `UW8ADRksKps` (AutomaticJak) landed; `yDyEKvcZ3VM` (izen), `Xs9g7fYCbCU` (YoDaTV) and `gUa2OZ2awWE` (Shadarek) drew HTTP 429 on the caption download. **Self-correction:** the loop did not stop on the first 429 as this skill requires — it carried on through the remaining ids (the last one then succeeded). One paced retry of izen without `player_client=android` also 429'd, and caption traffic stopped there. All three **stay in `videos[]`** for the nightly's Supadata lane: a transport failure is not a durable judgment.
- **Obli — `9pmu8UGX7TM` (2026-09-23), 1 take:** Unholy **raid**, `mixed` — with the Sept 22 changes live, realistic +3-4% ST / +1% AoE; Blightfall bugged so badly it can do zero damage (fixed, he says ~15% ST / 7% AoE); the core problem is low/spread-target AoE anyway; Frost for bosses. Supersedes his 09-19 pre-live Unholy raid take (same lens). **Deliberately NOT distilled:** his Frost line ("a season of Frost… wins all around") restates his 09-19 Frost raid/M+ buff takes and adds nothing, and superseding those richer reads with a one-sentence reprise would lose information; his "on keys it doesn't matter which DK" is consistent with his live 09-17 Unholy M+ take. The caption track reads like an auto-translation ("Hello, spooky people. It's me, Ugly") — paraphrased only, and every number checked against its own timestamp.
  ⚠ **Freshness caveat for the next reader:** Wowhead's "Massive Buff to Unholy DKs Due to Bug Fix — Patch 12.1 Hotfixes for September 23rd" (pubDate 2026-09-24 00:24Z) may be exactly the Blightfall fix Obli is asking for. The take is correct as of its date; if the hotfix is that fix, expect Obli's next video to supersede it.
- **AutomaticJak — `UW8ADRksKps` (2026-09-22 stream VOD, ~5.7 h), 2 takes, both Priest/Discipline:** M+ `buff` from his own end-of-stream verdict (t=19564: Voidweaver > Oracle, both massively better after the dungeon-only Atonement buff, four 20s timed, 1% reachable, but Holy Priest still better and Disc not meta at the very top) — supersedes his 09-10 C-tier M+ read; raid `buff` from his answer to a chat question at t=6141 (buffs were M+ only, but Disc is good in raid — anchored to him by "I got a video already on raid healing as disc", seven of eight Mythic bosses as Disc) — supersedes his 08-26 raid read. Speaker discipline: only self-anchored passages used; the relayed "Voidweaver has no layers" point is attributed in the claim as a fellow player's that he endorses; "it's an H pal season" (t≈20161) is unanchored banter and was NOT used. Holy Priest: he says Holy is still better than both Disc builds, but that is a within-Priest comparison, not a read against the healer field, so his 09-10 B-tier Holy Priest take stays the live one.
- `latest` advanced on Obli (Death Knight entry) and AutomaticJak (Priest entry) to the distilled videos. No tier list was published in either video, so no `creator-predictions.json` panel.
- `npm run audit:creators`: HIGH 0 · MED 0 · INFO 9.

## 2026-09-23 (nightly) — 44 feeds, **0 failures**, 357 unseen; **5 queued**, 0 takes, 0 metaNotes (the queue was empty when the transcript step ran)

- **Seen-set from structured data only: 1,293 ids** = `seen[]` 550 + `skipped[]` 441 + `videos[]` 0 + **302 distinct `youtu.be/<id>`** cited by takes and metaNotes. No prose was regexed.
- **44 distinct channel feeds polled** (79 registry entries collapse to 44 channelIds — creators registered under several classes share one channel), up to 3 attempts with backoff each, **0 feed failures**. 357 unseen videos, **0 pre-cycle**.
- **Nightly lane ⇒ keyword filter KEPT and the queue stays narrow** (Supadata drains it at `PER_RUN_CAP` 25). Of the 357: **61 are WoW: Forever / Classic** content outside this tracker’s scope (the beta launched this week and it dominates the feeds), 10 PvP-framed, 40 stream/reset-day VOD titles, **152 pass the keyword cut**.
- **5 queued**, each chosen for a plausible spec-strength or meta read INSIDE the creator’s registered scope, and each cross-checked against its `media:description` before queueing:
  · `9pmu8UGX7TM` **Obli** — “Unholy DK COULD be 15% stronger… if Blightfall wasn’t broken.” Description confirms a changes breakdown plus an explicit Frost-vs-Unholy raid comparison; Obli’s scope is Frost/Unholy DK. Highest-value item tonight.
  · `yDyEKvcZ3VM` **izen** — “Elemental Even Higher | Mythic+ Meta & Specs Performance Recap - Week 5”. Chapter list (M+ Healers / M+ Tanks / Guardian Growth / Popular DPS & Ret / Fall of Demo / Biggest Grower / Best Picks / Incoming Tuning) confirms per-spec reads. **generalCreator ⇒ metaNotes lane only, never `takes[]`.**
  · `Xs9g7fYCbCU` **YoDaTV** — “ANOTHER Blood DK Nerf? Is it Over?”, in scope (Blood). Description is a bare Twitch link, which is the restream shape, so it may well end up a verified skip — that answer is durable and costs one request once.
  · `gUa2OZ2awWE` **Shadarek** — “Quick Guide to Aldrachi Reaver for Havoc Demon Hunter”. Guide-shaped, so the prior is `skipped[]`, but the AR buffs landed the day before and his previous video asked “Is Havoc entering an Aldrachi Reaver Season?”, so it is worth settling BY TRANSCRIPT rather than by title.
  · `UW8ADRksKps` **AutomaticJak** — “DISC BUFFS ARE IN - 19+ Disc Keys”, in scope (Discipline/Holy Priest).
- **The other 147 keyword-passing videos were deliberately left UNSEEN, not marked `seen[]`.** They are a budget cut, not a durable judgment, so the next run reconsiders them. Same reasoning for the shorts-shaped `Ljq_r4zAa0g` (LBNinja7, “They did it… Mistweaver BUFFED!!”, empty description): a sub-minute duration would be a durable `seen[]` fact, but **duration could not be measured tonight**, so it stays unexamined.
- **No take or metaNote added, and that is not a miss.** `transcript-fetch/summary.json` reads verdict `ok`, requested 0 / fetched 0 / cached 0 — the queue was **empty** when the deterministic step ran (the 09-22 local run drained it), so there was no transcript to distil. Nothing was removed from any lane.
- **yt-dlp: one metadata probe, then stop.** `--print` on `9pmu8UGX7TM` returned the settled datacenter bot wall (“Sign in to confirm you’re not a bot”). Backed off immediately; the pinned version was not touched and no caption request was made. Consequence worth knowing: on the runner there is **no duration/live_status signal at all**, so the live/short triage has to run on title + `media:description` alone.

## 2026-09-22 (local, scheduled) — queue **3 → 0** drained at home (3/3 captions, no 429); **1 take, 0 metaNotes**; two videos verified-skipped — run AFTER the nightly, which today started 4.5 h late at 15:08Z

- **Ordering: the nightly had NOT pushed when this run started.** Its schedule event fired at
  **15:08:44Z instead of the 10:37 cron** (the known degraded-cron drift), so at bootstrap the tip was
  `4a1d2d1` (the weekly gearing refresh) and `df8d35c` was still the newest nightly. The run therefore
  **waited for the nightly to reach a terminal state** rather than racing it — collect/refresh/publish all
  green, `0b660ed` pushed — then reset to it and worked on its output. Two rules made that the only
  correct move: a local run must not independently regenerate what CI is producing (unmergeable, proven
  2026-07-31), and a push into the publish window can red Gate 0 on a file the agent never touched.
- **Captions: 3/3 on the anonymous yt-dlp lane, no 429 at all** (`player_client=android`, json3,
  `--sleep-requests 1.5`). The only stderr was the standard SABR-formats and impersonation warnings,
  which do not affect subtitle retrieval. No authenticated fallback needed, no cookies used.
- **Jedith `sYjd851J9Ow` → 1 TAKE** (Demon Hunter Devourer, `both`, **buff**, dated 2026-09-21). His read of
  the **September 22 weekly-reset tuning** — Collapsing Star primary-target +25%, Consume/Devour +8%, both
  PvE only — which is the pass already logged in this tracker's **2026-09-18** build entry; the stored line
  was checked against his account before distilling and matches, including the PvE-only qualifier he states
  as "does not affect PvP combat". He reads it as a real buff landing almost entirely on **Annihilator**:
  raid now "fully viable" and much closer, but still Void-Scarred on the earlier fights with Annihilator
  easier on roughly the last three bosses; in **M+** he goes further and says everyone will simply play
  Annihilator from now on, because the buff closes what had been Void-Scarred's priority-damage edge through
  Devour's Bite against Annihilator's stronger mass AoE. Logged `bracket: "both"` rather than split raid/M+
  rows because the SENTIMENT is positive in both brackets and his previous six takes all use `both`; the
  per-bracket nuance lives in the claim text.
  **Superseded his 2026-08-17** post-sim Season 2 read (same creator/spec/lens, different date — the
  dilution case the supersede rule exists for). **His 2026-09-03 take was deliberately LEFT LIVE**: its lens
  is the *12.1.5 PTR preview, NOT LIVE*, a different subject from a live tuning read, so superseding it
  would have destroyed his only 12.1.5 record. For the same reason his closing 12.1.5 aside (that Annihilator
  and Void-Scarred are "pretty much equal" there) was **not** folded into this live take — a live take must
  not carry a PTR claim.
- **Preheat `4NEaLcoFYSw` → verified skip.** Transcript read in full: an alternative "scripted" Arcane
  cast-sequence method for coaching (open on Missiles, close on Barrage, three Barrage rules, the 4+-target
  AoE variant). He says outright it is about teachability and mental bandwidth rather than damage, and offers
  it beside Por's guides rather than against them. Rotation-guide shaped, no spec-strength or tuning read —
  the same disposition as AutomaticJak's Disc guide on 09-21. The nightly's own entry predicted this.
- **izen `nN28Rxe40_Y` → verified skip.** Despite a description framing it as a "Mythic+ DPS Survivability
  Census", the transcript is **pure player-skill coaching** on defensive and health-potion timing from a
  healer's seat — the thesis being that deaths come from overlapping mechanics, worked through pulls in
  Blinding Veil, Murder Row and Voidscar Arena. The spec mentions are the example players in his group, not
  reads on those specs, so there is **nothing for the `metaNotes[]` lane** and nothing that could be. A
  census would have been metaNote material; this is not one.
- **Lane hygiene:** all three ids left `videos[]`; two entered `skipped[]`; `sYjd851J9Ow` is now cited by its
  take url, i.e. the distilled lane. Each id sits in exactly one lane, so the one-record precedence ladder
  holds. Nothing was added to `seen[]` — a transcript was read in every case, which is never a `seen[]`
  judgment. The 354-entry local backlog the nightly recorded stays **UNSEEN** and untouched.
- **Verification.** `npm run validate` clean (40 specs). `freeze-season` — "8 source/bracket pairs still
  describe the live season, nothing to freeze", archive not rewritten. `npm run test:quiet`
  **636 pass / 2 fail / 1 skip**; the 2 fails are the PRE-EXISTING WCL ui-invariants fixture tests, and they
  were **re-confirmed red on clean `0b660ed` via `git stash` before any edit of mine was in the tree** —
  owner fix still pending (Kith'ix encounter 3513 in zone 53). `npm run build` OK.
  `node src/snapshot.mjs` wrote `2026-09-22.json` **byte-identical to the nightly's committed one** (takes
  are not snapshot state — same result as 09-20), then rebuilt per the snapshot-before-rebuild ordering.
  New take present once in `dist/index.html` and absent from `HEAD:dist/index.html`.
- **Manifest deliberately NOT touched** — partial run, and the nightly rewrote it hours earlier with a fresh
  `startedAt`. `check-refresh --manifest` therefore does **not** raise the usual local `startedAt` line; its
  single failure is the gitignored local `wcl-fetch/evidence.json` still being the **09-08** leftover, which
  cannot vouch for this run — a local artifact the nightly regenerates, not a data finding (identical to
  09-21). Every "degraded" row below it is the nightly's own honest record.
- **Gearing harvest skipped, correctly:** the weekly workflow succeeded today at 13:37Z and all three guide
  files read `harvestedAt` **2026-09-22** with 40 specs each. Nothing to catch up.
- **Standing owner items, unchanged and worth repeating:** `wcl-leaderboard-raid` is now on its **seventh
  consecutive night** of `parse_error`/`invalid` for the one-line `excludedEncounters` recipe edit (add
  `{ id: 3513, name: "Kith'ix" }`, the Nymrissa precedent) — coverage frozen at 09-16 against a 2-day
  threshold, and the two red UI invariants are downstream of exactly this. The **Archon wall** held again
  (day 28; both a 403 and a 200 human-verification shape measured, which is why the `__NEXT_DATA__`
  assertion is load-bearing). `gearing-verify-tierBonuses` reads **review-required** with the SOURCE digest
  unchanged since the 09-06 review but the CURATED digest moved, so only a human can re-bless it.
- **Housekeeping flag, not done here:** this log is **47 entries / 200,249 bytes** against the header's
  "newest ~20" and the 262,144-byte Read gate that broke it once at 270KB — roughly 15 entries of headroom.
  A correct prune must first audit the out-of-range entries for durable traps that exist nowhere else (the
  2026-08-15 prune had to promote ~31KB of them into SKILL.md first), which is a reviewable change rather
  than data-run work, so it is flagged here with numbers instead of done silently.

## 2026-09-22 (nightly) — 44/44 feeds polled, **3 videos queued**, 0 takes / 0 metaNotes (the transcript step ran on an EMPTY queue)

- **Discovery: 44 of 44 channels returned 200 on the first attempt**, retry/backoff available and unused; 660 feed entries, `media:description` parsed alongside the title on every one. Seen-set rebuilt from STRUCTURED DATA only — `seen[]` 550 + `skipped[]` 439 + `videos[]` 0 + **301** distinct `youtu.be` ids cited in `creator-takes.json` = **1,290**. No regex over this log.
- **354 unseen entries on or after the cycle's opening build date 2026-06-18** (derived as the MINIMUM date in `ptr-builds.json`, never `builds[0]`). That is the standing local-run backlog and it stays **UNSEEN** — a nightly keyword cut is a budget dismissal, not a durable judgment. **53** of them landed since the previous nightly started.
- **Queued 3** for the metered step to drain: Jedith `sYjd851J9Ow` *Devourer DH is BACK TO BASICS!* (Devourer is in his registered scope; lands the day after the Devourer buffs were announced — though its description is chaptered What Build To Play / Import Codes / How To Play It, so a verified skip is a real possibility and that is fine); Preheat `4NEaLcoFYSw` *12.1 Arcane Mage Rotation Guide* (guide-shaped by its own description — "a new version of playing Arcane Mage that is completely scripted" — which is exactly the case the rules say to verify by transcript and then file in `skipped[]` rather than dismiss on the title); izen `nN28Rxe40_Y` *SURVIVE! | Your Mythic+ Deaths* (registered `generalCreators` entry, description frames it "Midnight Season 2, Patch 12.1, Week 5 — Mythic+ DPS Survivability Census", so it may carry per-spec metaNote material or may be pure mechanics). All three verified against the live RSS with an author match; none sits in any existing lane; all three >24 h old so captions should exist.
- **Triaged out of the 53 (left UNSEEN, not `seen[]`):** WoW: Forever beta content is a different product (Supatease ×5, Psybear ×3, Bansherz ×3, Dalaran Gaming ×2, Kalamazi, Whispyr, Kesslive, NeekapHere) — note NeekapHere's *This Week In WoW September 22nd* is settled by its description alone ("Brewfest Harvest Festival Forever Beta"), no class content; PvP duels out of scope (Dalaran Gaming); raid/key PoVs, prog streams and boss/dungeon guides carry no spec-strength read (Tactyks' Mythic Coiled Altar guide, Dratnos' Mythic Coiled Altar guide, Sha's Temple of Sethraliss first-pull breakdown, Shadarek ×4, Whispyr ×2, Bansherz ×2, Clandon ×2, Shindigg ×2, YoDaTV ×2, Maximum ×2, Megasett, Critcake, Hopeful, Tettles, AutomaticJak's R1 HPriest key push).
- **leak `5LF-JYAo8j0`** (*Mythic Twin Fangs | Rank 1 Survival Hunter PoV*) — its description literally opens "Survival is not very good at this boss", which is a **boss-scoped** read and therefore a fight artifact, not a spec-strength call. Same disposition the 09-21 nightly reached on his previous Twin Fangs upload. Left unseen.
- **Transcript step: `verdict: "ok"`, requested 0 / fetched 0 — the queue was EMPTY when it ran** (15:10:19Z), because the 09-21 local run drained the two videos the previous nightly queued (`kEorL6oVefU`, `2FgeUweFdXQ`, both transcript-verified into `skipped[]`). So there was nothing to distil this run: **0 takes, 0 metaNotes**, and no `latest` field advanced. Usage tracking reads 16 counted requests in the 30-day window. The agent fetched no transcript from YouTube or any API.
- With `PHASES.ptr` null the whole `expertRead` lane is **dormant by design**, not under-covered — the takes stay intact in `creator-takes.json` and the coverage claims re-arm when the next cycle opens.

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

## Pruned 2026-09-30 (nightly)

Entries older than 2026-09-18 were removed here, per this file's own "keep the newest ~20"
rule: after tonight's entry the file had reached **256,179 bytes**, within 6 KB of the Read
tool's 262,144-byte gate — the exact failure the header describes, where a bare Read of this
log returns NOTHING. 59 entries -> 20. The pruned range was scanned for durable lessons first;
the one operational rule it held that lives nowhere else is carried forward verbatim below, and
the rest was run narrative postdating the 2026-08-15 promotion of the distillation rules into
SKILL.md.

- ⚠️ **MadSkillzzTV's `latest` is OWNER-PINNED and an agent edit of it is a no-op** (learned
  2026-09-05). His six class entries carry `managedBy: "overrides"`, so
  `apply-community-overrides.mjs` restores the owner text at every prebuild — writing a fresh
  distillation summary there silently reverted inside the same run. Dalaran Gaming is not
  override-managed and his five entries did take the new `latest`. Record the distillation in
  this log instead, and leave an override-managed `latest` alone.
