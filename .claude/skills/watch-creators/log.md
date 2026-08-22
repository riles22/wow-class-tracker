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

## 2026-08-22 (nightly) — 1 transcript read → 0 takes (PvP), 5 queued, 44 channels clean

**Discovery clean; the one transcript available this run was a PvP stream, so it yielded nothing
and was retired to `skipped[]` rather than mined for a take.**

- **DISCOVERY: 44 unique channels polled** (41 class-lane + 3 general), every one HTTP 200 on the
  first attempt, **0 RSS failures**, no retries needed and no backoff spent. Seen-set rebuilt from
  the four structured lanes (`seen[]` + `skipped[]` + `videos[]` + every `youtu.be` id in a take or
  metaNote url) — never from log prose. **85 entries came back unseen and in-cycle** (bound =
  2026-06-18, the OLDEST date in ptr-builds.json, derived not indexed).
- **`media:description` parsed alongside every title**, and it did most of the triage again: the
  large majority of the 85 are launch-week stream VODs with bare-Twitch or streamlabs descriptions
  ("M+ spam", "HEROIC SPLITS", "keys + raid tonight", RWF day-N splits). Those carry no
  spec-strength read under the standing guide-shaped/key-run rules and were left **UNSEEN**, not
  retired — an unverified shape dismissal is exactly what `seen[]` must not absorb, and leaving
  them unseen is what keeps the next run's accounting auditable.
- **DISTILLED: nothing. `kGsd9cMmBCc` (Supatease, "DISCOVERING THE BEST CLASSES 12.1", 08-18) →
  `skipped[]`.** The deterministic step fetched it (5,413 chunks, ~172k chars; the other two queued
  ids came back `unavailable`). Read in full: it is a **PvP stream** — arena lobbies, Training
  Grounds, duels, DR talk — with 46 "PvP", 10 "arena", 4 "battleground" and 6 "rated" against 0
  "Mythic+"; its 3 "mythic plus" mentions are about mount/transmog rewards and PvP participation,
  and its 4 "tier list" mentions are his own PvP prediction list, a racial-tier-list joke and chat
  teasing him. Precisely the 2026-08-09 shape: a PvP creator answering "the best classes" is still
  a PvP read, and the title is no defence. **0 takes, 0 metaNotes, no `latest` advanced** — and no
  filler `neutral` minted to record that the video was watched.
- **QUEUED 5**, keyword-filtered as the nightly lane requires (Supadata free tier = 100 requests per
  MONTH; last night's summary read `ok`, so there is headroom, but the queue stays narrow):
  `sIu3Kjo8ggI` (Shadarek, "Havoc is BUFFED | August 25th Class Tuning", 08-22),
  `BdzA4HWaUSc` (Kalamazi, "MASSIVE Warlock Buffs Announced! What Do They Mean?", 08-22),
  `y77i8M9dCSw` (NeekapHere, "Retribution Paladin 4-Piece Is FINALLY Worth Using", 08-22),
  `OyIp5Ua0Qo4` (izen, "Season 2 Mythic+ Meta Picks | Week 1 Early Choices", 08-21 — the metaNotes
  lane), `xHUTjrulyrA` (Supatease, "12.1 Class Tuning Did Your Spec Survive?", 08-22 — queued to
  settle by transcript whether his tuning content is PvP-framed like `kGsd9cMmBCc`, rather than
  guessing from the title in either direction). All five are analysis videos about the August 25
  tuning pass or the week-1 M+ meta, i.e. the content most likely to carry a real read.
  `xg5sxI6LspI` (Kalamazi, "HUGE Warlock Buffs Announced!", same day, generic link-block
  description) was NOT queued as the probable clip/restream of `BdzA4HWaUSc`, and left unseen.
- **RETIRED 2 ids to `seen[]` as durable SCOPE dismissals only**: `vn9QRw-zkoo` (Dalaran Gaming,
  "WoW 12.1 Rogue PvP Guide - ALL 3 SPECS Starter Guide") and `6zjh3PbfBno` (same channel,
  "Assassination Rogues Are Back To DELETING People! (5v5 1v1 Duels) - PvP"). Both self-identify as
  PvP in title AND description, which is a fact about the video rather than a budget cut.
- **`POENnO-sGog` and `1LfW9JXNRsI` stay queued** (both `unavailable` from Supadata this run) — they
  are neither distilled nor transcript-verified, so removing them would lose the backlog.
- yt-dlp was NOT used and NOT installed or upgraded: this is a nightly runner behind the settled
  datacenter bot wall, so the queue is the only path. No creator showed coverage outside their
  registered specs (nothing was distilled), so no scope widening is flagged, and no supersession was
  needed because no take was added.

## 2026-08-21 (nightly CI, second run of the day)

**Discovery complete and clean; distillation impossible. 0 takes, 0 metaNotes, 0 `latest`
advanced. 3 videos queued, 6 ids retired to `seen[]`.**

`transcript-fetch/summary.json` reports verdict **"ok"** with requested 0 / fetched 0 — not a
credential problem: `data/pending-transcripts.json` `videos[]` was EMPTY when the deterministic
step ran, because the 11:00Z run drained to zero and the 2026-08-21 local run cleared the rest.
So the step had nothing to drain and this agent holds no transcript credentials. Everything
queued below is for the NEXT run's deterministic step.

**Discovery: 44 unique channels polled (41 class-lane + 3 general), every one HTTP 200 on the
first attempt, 0 feed errors, 660 entries.** Seen-set rebuilt from the four structured lanes
(`seen[]` + `skipped[]` + `videos[]` + every `youtu.be/<id>` in a take or metaNote url) — never
from this file's prose — and measured at **1,167 ids**. 72 entries came back unseen.

`media:description` was parsed alongside every title, and it did most of the triage. The unseen
72 are almost entirely launch-week **stream VODs**: bare-Twitch-link descriptions (Shindigg,
Critcake, Bansherz, Clandon, Sha, Megasett, Maximum, Tactyks), key-run and split POVs, and
`streamlabs.com` boilerplate. Those carry no spec-strength read by the standing rules
(key-run/guide-shaped precedent), and they were left **UNSEEN** rather than retired — an
unverified budget/shape dismissal is exactly what `seen[]` must not absorb.

**Queued (3), keyword-filtered as the nightly lane requires (Supadata is 100 requests/MONTH):**
- `kGsd9cMmBCc` Supatease, "DISCOVERING THE BEST CLASSES 12.1" (2026-08-18). Queued to SETTLE the
  standing question rather than guess it: he is registered as a class-change-roundup authority
  (scoped Shaman all / Affliction / Arms+Protection Warrior), but the 2026-08-09 precedent is that
  his "best classes" content keeps turning out PvP-framed. One transcript answers it durably,
  either as a take or as a `skipped[]` record.
- `POENnO-sGog` Shadarek, "Azta'rec Nemesis Delve Boss Kill | Havoc Demon Hunter" (2026-08-20) —
  in-scope specs (Havoc/Devourer), solo content that may carry a spec read.
- `1LfW9JXNRsI` Harrek, "Midnight Season Two Delve Boss: Azta'rek — Restoration Shaman Solo"
  (2026-08-19) — Wowhead's Resto Shaman guide author. NOTE for whoever distils it: his own
  description compares the BOSS to Nullaeus and the TWW bosses, which is a boss read, not a spec
  read. Do not mint a Resto Shaman take out of it unless the transcript carries a spec-specific
  comparative claim.

**Retired to `seen[]` (6) — durable SCOPE dismissals only:** five explicitly PvP videos, out of
scope for a PvE tracker by their own titles and descriptions — Supatease `Ln9u8uDpP7E` "PVP Data
Analysis Week 1 Season 2", `BKpNGRtiDpc` "Honest Thoughts on PVP 12.1", `KeiluPpDWCQ` "This Is
Why PVE'rs Hate PVP", `DrleLy1u2dI` "World PVP Still Fun in 2026?", and Dalaran Gaming
`jzNfwI-tr_g` "5V5 1V1 DUELS IN MIDNIGHT" — plus MadSkillzzTV `ELRklBVajH4` "12.1 Best M+
Addon?", whose description states it is an EXBoss **addon** preview, i.e. content that cannot
contain a spec-strength read.

Supatease's four remaining ambiguous titles (`-NmzE6Pnqfo`, `QmTbOMRFJjQ`, `M0K2d-jzFas`,
`-0UpYyH_L58`, plus `RA9ysZxxRuE`) were left UNSEEN on purpose: spending a second and third
Supadata request on the same open question before the first one answers it is the wrong order.
Re-evaluate them once `kGsd9cMmBCc` comes back.

**yt-dlp was NOT usable and was not hammered.** One metadata probe (`--skip-download --print`, no
subtitle flags) on `ELRklBVajH4` returned the datacenter bot wall — "Sign in to confirm you're not
a bot" — which is the settled 2026-07-17 finding; the run stopped there rather than retrying. The
practical cost is that live_status and duration could not be read, so no Short or in-progress
stream could be retired on a measured fact tonight.

No creator demonstrated coverage outside their registered `specs`, so nothing is flagged for a
scope widening. No supersession was needed (no take was added).

## 2026-08-21 (SKILL.md step 4a — the operational half of the one-record rule)

**The check landed without the instruction that keeps a run from tripping it.** `0acbfae`
documented the precedence ladder and enforced it, but never said what to DO at the moment of
action. Added as step **4a**, deliberately parallel to step 4's "do this EVERY time you add a
take, it is not optional" — because it is the same kind of mandatory bookkeeping attached to
the same event.

- **The rule:** distilling a video makes its take/metaNote url that video's record, so if the
  id is still in `seen[]`, `skipped[]` or `videos[]`, remove it from that lane in the SAME
  edit. Placed at step 4a rather than in the lane description at step 2, because step 2 is read
  when you are deciding where something goes and step 4 is read when you are writing a take —
  and this fires on the write.
- **Why it needed saying:** five of the seven collisions the check found got there by exactly
  this route — considered at discovery, filed in `seen[]`, later distilled, never removed.
  The nightly dispatched to confirm the check (run 32512032066, green) did NOT exercise it:
  the agent queued 3 videos and added 6 ids to `seen[]` but distilled nothing, so the promotion
  path never ran. The check was proven not to break a night; it was not proven to catch a live
  agent's mistake. This guidance is what stops the first agent that takes that path from
  discovering the rule via a red run.
- **The asymmetry is spelled out** because it decides whether you can just delete: dropping
  from `seen[]` is lossless (bare id list), dropping from `skipped[]` destroys a `reason`, so
  the finding gets restated in this log first — the `aqe2LKeMIqQ` precedent.
- **Also covers the re-open direction**: a `skipped[]` video that yields a take on re-open
  loses its skip entry, because "nothing to distil" stops being true of it. That is what the
  Musguete re-open did for five ids, and it is now written down rather than inferred.

**Corrected a number I got wrong, in the same pass.** `okaZqAQVRN0` carries **39** live
metaNotes, not 40 — a miscount off a terminal listing that I propagated into the `0acbfae`
commit message, this log, and two places in SKILL.md. Verified against the data (39 then, 39
now); SKILL.md and the log line are fixed, the commit message stands because history is not
rewritten. The `x0fxEWTq3Pw` figure of 24 was checked at the same time and is correct.
The `1167 → 1167` seen-set measurement is now labelled as what it is — a reading taken across
the fix, not a constant. It is 1176 after tonight's nightly, and it grows with the roster.
## 2026-08-21 (cross-lane collisions — SEVEN, not two; validation gap closed)

**The two I reported were a sample, not the set.** Measuring every lane pair before writing
any fix turned up **seven** ids carrying two records at once, and `npm run validate` reported
clean on all of them. Data fixed, and the gap between what SKILL.md promised and what
validate.mjs did is closed.

- **What was actually enforced:** `videos[]`∩`seen[]` and `videos[]`∩`skipped[]`. That is all.
  The SKILL.md sentence "refuses to let an id sit in both lanes" sat in the `skipped[]`
  paragraph and read as covering every pair — it never did. Unenforced: `skipped[]`∩`seen[]`,
  and distilled∩anything.
- **The seven:**
  - `6MlSd4nBtrI` (Dratnos) — `skipped[]` + `seen[]`.
  - `aqe2LKeMIqQ` (Tettles) — distilled + `skipped[]`.
  - `HP3H1aDcQCo`, `Li67ghcCJo4`, `jlbQAmQMRCM`, `okaZqAQVRN0`, `x0fxEWTq3Pw` — distilled +
    `seen[]`, **all five previously unknown**. These are not marginal: `okaZqAQVRN0` carries
    **39 live izen metaNotes** and `x0fxEWTq3Pw` carries 24 from Zorthas. (Corrected
    2026-08-21: the 0acbfae commit message and this line both said 40 — a miscount off a
    terminal listing. The count was 39 then and is 39 now; the commit message stands as
    written since history is not rewritten.)
- **The rule, which the code now enforces:** the lanes are a PRECEDENCE LADDER, not tags —
  distilled (cited by its take/metaNote url) > `skipped[]` > `seen[]`, with `videos[]` meaning
  "still waiting" and overlapping none. An examined video carries exactly ONE record. This was
  always the stated intent — the `seen[]` comment in validate.mjs already spelled the ladder
  out ("everything else belongs here") — it just was not checked.
- **Six of seven were lossless.** `seen[]` is a bare id list, so dropping a redundant entry
  discards no information. **Verified the seen-set union is byte-identical: 1167 → 1167, zero
  ids stopped being examined.** This is deduplication, not forgetting — which matters, because
  the whole point of the union is that anything outside it is genuinely unexamined.
- **The seventh lost prose, so it is preserved here.** `aqe2LKeMIqQ` (Tettles, "Stream VOD")
  left `skipped[]`, and its reason read: *"Livestream VOD whose only spec reads are one-line
  replies to chat — no sustained analysis to distil. Transcript verified 2026-07-30 (local
  run)."* The video IS distilled — a Balance Druid take at `t=10036`, ~2.8 hours in — so
  `skipped[]` ("nothing to distil") contradicted it. The take url is now its only record.
  **The 07-30 finding still stands and is why this VOD should not be re-mined**: one take was
  taken from it and the remainder is chat replies.
- **The error message names the fix**, because a collision otherwise leaves you guessing which
  lane is authoritative: it prints "Keep <lane>, drop <lane>" derived from the ladder.
- **The test was mutation-checked**, not just run: neutering the four `collide()` calls makes it
  red (`not ok 19`), restoring them makes it green. It also asserts the committed file is clean,
  so it reds if the lanes drift apart again. `src/validate.mjs` is CODEOWNERS-owned
  (`@riles22`), so this is a reviewed code edit and its own commit.
## 2026-08-21 (re-open — the six scope-conditional Musguete skips)

**Five of six yielded a Subtlety take; all five land SUPERSEDED. The sixth is now a settled
skip.** Riley directed the re-open after the scope widening; the annotations added earlier
today are what made these six findable as re-openable.

- **All six re-fetched with yt-dlp and read in full** — 4-6 minutes each, all Musguete,
  published 2026-07-09..07-13, all 12.1 PTR Mythic raid-testing POVs. No 429 and no bot wall;
  paced ~4s apart with a hard stop on the first rate-limit, per the batch-429 precedent.
  The triage regex was proven on a known-positive (`lanOZvwWzw0`) BEFORE being trusted, per the
  rule that a broken extractor looks exactly like a batch with nothing in it.
- **`pqAH9DPyDPs` stays skipped, and its note is now SETTLED rather than conditional.** Its only
  Subtlety reference is him saying they did NOT test Subtlety on those bosses because another
  Subtlety rogue was in the raid — a statement the spec was untested, which is the opposite of a
  read. Independently confirmed.
- **The other five LEFT `skipped[]` entirely rather than being amended.** That lane means
  "transcript read, nothing to distil", and the file's own `seenNote` is explicit that distilled
  videos are cited by their take's url instead. Keeping them would have had the repo asserting
  both things about the same five ids. A guard in the merge refused to remove any id a take did
  not actually cite.
- **`5UjnyOvtRes` carried a same-day standing refusal and it was NOT stepped over silently.**
  This morning's note said it stays skipped for two reasons surviving the scope change. Both
  were checked and neither reaches a *superseded Subtlety* take: reason 1 ("raid lens already
  covered by his unbracketed 07-31 takes") names takes that are **Outlaw and Assassination** —
  he has no 07-31 Subtlety take, so the Subtlety raid lens was never covered by them; reason 2
  ("landing it live would dilute the post-buff read") is conditioned on landing LIVE, which
  `superseded: true` neutralises.

**The verification pass caught three BLOCKING errors in my drafts. Two were referent
transplants — the precise failure the honesty rule names — and one would have shipped.**
1. **`superseded` was ABSENT from all five, not `true`.** The patchContext prose said
   "superseded on landing"; the field was never written. Committed as drafted, all five would
   have landed LIVE and the Subtlety drawer would have gone **2 rows → 7**, publishing five
   pre-launch July PTR reads as current. **No gate catches this**: `validate.mjs` only
   type-checks `superseded` when present, and `audit-creators`' supersession check is
   era-scoped on `PHASES.ptr`, which is null between cycles — so it reports MED 0 having run on
   an empty set. Prose is not a flag.
2. **`5UjnyOvtRes`: a Fatebound comparison transplanted into a Subtlety take.** "Deathstalker
   beating Fatebound for single target" is explicitly and exclusively his **Assassination**
   claim; only the following clause ("even on subtlety rogue, the best one it's Deathstalker")
   is about Subtlety. Cut to the Subtlety half.
3. **`YCyxU0uQCWc`: the Darkest Night complaint lifted out of the ASSASSINATION block.** In that
   video every cue around it is Assassination-scoped. Removed. (It genuinely IS inside the
   Subtlety block in `_NvJjBK65ME`, where it is kept — the same talent, correctly filed in one
   video and not the other, which is exactly why this needs checking per-video.)

Also corrected: a cross-video superlative that rested on no source ("his most negative Subtlety
read of the testing series"); a modality upgrade ("he would go" for his "I might go"); a
dangling antecedent that pointed the spec-selection heuristic at the nerf complaint instead of
the single-target read; a deep link at `t=192` opening 0.84s inside the preceding Assassination
sentence (now `t=193`); and three omissions that changed the LEVEL of a read — the top-two
framing ("for now the best spec is between Subtlety and Outlaw"), the three-spec ranking on Twin
Fangs (Outlaw best, Assassination second, so Subtlety last), and his single-target hedge.

- **Why all five are superseded rather than leaving the newest live.** The 2026-07-13 read is
  empirical where the live 08-15 read is a tuning reaction, which is a real argument for keeping
  it — but its central content is the 8% nerf and a hope for reversal, and that hope was
  *answered* by the 08-15/18 pass the live take distils. All five predate the 07-31 buff pass,
  the 08-15/18 tuning and the 08-18 launch. `takeInBracket` also puts a `raid` take and the
  `both` anchor in ONE lane, so leaving one live would be a different-dated live pair — the
  invariant-3 defect. Note the `nerf`-sentiment Twin Fangs take WOULD have moved the panel vote
  had the lane been active.
- Deep links verified against raw caption offsets, not the flattened text: each opens on the
  first words of its Subtlety segment, none on a sibling spec's.
- No downstream movement: `expertRead` returns null for all 40 specs (`PHASES.ptr` null), and
  these "12.1 PTR" strings can never re-arm — the 12.2 marker will not match them. Payload
  identical outside the takes array; drawer unchanged at 2 live Subtlety takes. 371 tests pass,
  validate clean, `audit:creators` HIGH 0 · MED 0.
- **Second pre-existing cross-lane defect found, NOT fixed here** (unrelated, predates this
  commit): `aqe2LKeMIqQ` sits in `skipped[]` while a live-archive Tettles take cites it —
  one take pulled from a ~2.8h stream VOD, the remainder later skipped. Defensible on its own
  terms but it stretches the lane definition. Flagged alongside the `6MlSd4nBtrI`
  skipped/seen collision.

## 2026-08-21 (distillation — Musguete Subtlety, the read dropped for scope)

**1 take added: Rogue Subtlety, Musguete, 2026-08-15, `mixed`, bracket `both`.** This is the
read that was transcript-verified and DROPPED for scope on 2026-08-16 and cited as evidence in
the scope-widening commit above. With Subtlety now in his registry scope, `validate.mjs`'s
take-scope gate accepts it.

- **Distilled from the transcript, not from this log's paraphrase of it.** The 08-16 entry
  summarised the read in one line; that line is a paraphrase and is not a source. `lanOZvwWzw0`
  was re-fetched with yt-dlp (216s, author-matched Musguete, upload_date 20260815) and the take
  was written against the captions, per "a claim must rest on the source it deep-links".
- **An adversarial verification pass over the draft caught two BLOCKING errors of mine, and
  both are worth recording because they are the exact failure modes SKILL.md names:**
  1. **An invented event.** The draft said the 6% left the spec ~1% ahead "once that is
     corrected" — asserting a bug FIX that the creator never states and that appears nowhere in
     the build feed for this pass. He says only that there was a bug, that it had them 4-5%
     above intended, and that the buff compensates for it. The correction step was mine.
  2. **A valence inversion.** The draft framed the 6% as a disappointment — "much smaller than
     it looks", "compensation rather than a gain". He says the opposite in the same breath:
     "Which is very very good and it's I believe **even** 1% increased damage from what we had
     previously." The "even" makes it a net gain on top of the compensation. That is the
     distiller's editorial replacing the source's own read, and it would have been the basis
     for the take's sentiment.
  Also fixed: the deep link was `t=81`, which opens on his ASSASSINATION close (the Subtlety
  segment starts at 86.64s) — a Subtlety take would have landed the reader on the other spec's
  praise, and on the very sentence the sibling Assassination take already rests on. Now `t=87`.
- **Two provenance discrepancies are recorded in `patchContext` rather than silently resolved:**
  (a) the official August 18 post frames the pass as pulling back overperforming tier sets while
  raising baseline damage, and **no Subtlety damage-overperformance bug appears in our build
  feed for it** — the only Subtlety bug on file is the 08-06 double-generation Energy fix, a
  different pass and a different bug — so his bug premise and the ~1% net are HIS account, not a
  stated delta; (b) the official four-set covers **Eviscerate** alongside Black Powder and has
  **no leech component**, whereas he says "black powder and the leech rate" (almost certainly an
  ASR mangle of Eviscerate). The 100%→60% figure itself is exact and matches both the build feed
  and the stored `tierSet`. Neither discrepancy was used to overrule him — they are flagged so a
  reader sees them.
- **"Potent Powder" is attributed to HIM, not asserted by us.** The string appears nowhere in
  `data/`, our own record names other Subtlety talents (Shadow Dance, Secret Technique, The
  First Dance), and it could not be verified live — a Wowhead search merely echoed the query
  back, which is not verification. Written as "the talent he names as Potent Powder": hard
  rule 1 forbids resolving a 12.1 name from model memory, and the same caption track renders
  Eviscerate as "the leech rate" and his own name as "Mush Getz". The 20%-of-mastery MECHANIC
  is his and is stated plainly.
- **`mixed`, deliberately, and the case was argued both ways.** For `buff`: he calls the 6%
  very good, reads the net as positive, and closes that all three Rogue specs are in a very good
  position. For `mixed`, which wins: he sets an explicit nerf against it ("And we got nerfs"),
  on the ability he says was topping meters, and revises his own stat guidance DOWNWARD as a
  consequence. Encoding `buff` would drop the nerf; the closing line cannot carry it either,
  because it is class-wide and the skill forbids stretching a class-wide label into a spec read.
- **`both` because the Subtlety segment names no bracket at all.** The video's only raid/M+
  references are the A+/A tier-list placements at 47s-64s, which are explicitly about
  Assassination and belong to the sibling take — they cannot justify a bracket here.
- **Era stays `12.1 PTR`**: published 2026-08-15, before the flip, and he says outright the
  changes are "not live yet" until the 18th. It matches its own sibling and Dalaran Gaming's
  08-17 Subtlety take, and keeps these takes correctly OUT of the eventual 12.2 expert panel.
- **Nothing superseded** — Musguete had zero Subtlety takes. Dalaran Gaming's live 08-17 raid
  take is a different creator and is untouched; Subtlety now carries two live takes from two
  independent voices, which is the first time that has been true.
- `community.json`'s `latest` said in so many words that no Subtlety take was on file from him;
  it is corrected in the same commit, per the rule that `latest` states what is actually KNOWN.
- No downstream movement: `expertRead` is dormant (`PHASES.ptr` null), snapshot byte-identical,
  the only rendered change is the Subtlety drawer's Creator-takes section going 1 row → 2.
  371 tests pass, validate clean, `audit:creators` HIGH 0 · MED 0 · INFO 9.

## 2026-08-21 (owner registry edit — Musguete Subtlety scope)

**Riley authorised widening Musguete to include Subtlety. Landed as a reviewed human commit,
not an agent edit.** This resolves the OWNER FLAG raised in the nightly entry below (the one
noting his registry premise "No dedicated Subtlety content exists" had become false) and
repeated in the local-run entry above it. Those entries are left as written — they were true
when written; this entry supersedes them.

- **Lane matters here.** `data/community.json` is agent-writable in **`latest` and
  `verifiedDate` ONLY** — Gate 0 (`nightly.yml`, the `changedBeyond` guard) treats `specs` and
  `credential` as registry structure, and simulating each field against HEAD confirms a
  nightly artifact carrying either would fail the night RED. `.github/CODEOWNERS` also names
  `/data/community.json`. So this had to be an owner-reviewed commit on master, pushed the same
  session, well clear of the ~10:30-12:30 UTC nightly window (landed ~14:50 UTC).
  Musguete's entry is hand-curated (no `managedBy`), so `apply-community-overrides.mjs` never
  touches it and the edit will not be clobbered; routing it through
  `community-overrides.json` was considered and REJECTED — it would stamp
  `managedBy: "overrides"` and replace the hand-curated record.

- **THE TRIGGER IS NOT THE EVIDENCE, and that distinction is the substance of this entry.**
  `DHqw-Oq9NjY` "Maximize Your DPS NOW! Subtlety Rogue Season 2 Guide" (8m32s, verified live:
  oEmbed 200, author Musguete, newest upload on channelId `UCdgkIUZiySx2hL7edWPD_Gw`,
  published 2026-08-21T09:42:45Z) is what falsified the premise, but it does NOT carry the
  competence case. Its stats/BiS block is explicitly derivative — it summarises a published
  Wowhead Subtlety guide, and someone else's material read aloud is not the reader's own read
  (the same test that declined a Resto Druid read in an AutomaticJak co-stream and Maximum's
  Zorthas-scripted watch-along). Its comparative sentences are class-wide and generic.
  It is transcript-verified into `skipped[]` with all three reasons recorded.
  **The widening rests instead on two videos of his OWN analysis:**
  - `HDqRItIXGmE` (2026-08-04, "HOW are Rogues AFTER Buffs?") — a dedicated Subtlety segment of
    his own WCL log analysis running roughly 18s-306s. Independent corroboration that this is
    real and was dropped for scope: that video's two EXISTING takes deep-link at `t=311` and
    `t=535`, i.e. both start after the Subtlety segment ends.
  - `lanOZvwWzw0` (2026-08-15, "Assa Rogue WILL BE META?! Patch 12.1 Tunning") — Subtlety tuning
    detail (intentional 4-5% bug, 6% compensating buff, four-set 100%→60%, mastery-to-crit).
    A transcript-verified Subtlety read from this video was explicitly DROPPED for scope on
    2026-08-16; see that entry.
  Both titles and authors re-verified live via oEmbed before being written into a registry field.

- **The premise was already false on 2026-08-04** — three days BEFORE its own
  `verifiedDate: 2026-08-07` — and the transcript that falsified it had already been read.
  The failure was not discovery; it was that nothing re-checked a scope note against takes
  already on file.

- **Six durable `skipped[]` entries rested on the OLD scope and were annotated, not rewritten.**
  `5UjnyOvtRes` named it verbatim ("Subtlety content in the video is out of scope:
  community.json scopes Musguete to Outlaw and Assassination"); the other five (`qsCTpF_eYoY`,
  `YCyxU0uQCWc`, `F_fWti_cRP8`, `_NvJjBK65ME`, `pqAH9DPyDPs`, all 2026-08-10) read "within the
  creator's scoped specs". Each keeps its original text with a dated bracketed note appended.
  **None was re-queued**: all are 12.1 PTR-era, `expertRead` is dormant between cycles so
  nothing distilled from them could move a projection today, and `5UjnyOvtRes` carries two
  independent non-scope reasons. They are re-openable on scope by a future transcript run —
  which is precisely what the annotation exists to tell that run.

- **What this does and does not buy.** It does NOT close a coverage gap: **Dalaran Gaming** is
  unscoped (absent `specs` = whole class), transcribable, and already holds all six existing
  Subtlety takes including the only live one (2026-08-17 raid buff, `f8YlxVEbGCY?t=16`). What
  the edit actually buys is unblocking `validate.mjs`'s take-scope gate so Musguete's already-
  dropped Subtlety reads become distillable, plus registry honesty. Musguete becomes the only
  creator *scoped* to Subtlety who is also transcribable — Stealthi, Eleem and Fuu all cover it
  but are `transcribable: false`.
- **Firewalls checked and clear:** Musguete is not in `generalCreators[]`, and "Musguete" occurs
  zero times in `data/sources.json`, so he authors none of our registered tier lists.
- **Verified no downstream movement:** `expertRead` returns null for all 40 specs in both
  brackets (`PHASES.ptr` null), the frozen forecast lane is active, and the build payload is
  byte-identical outside the community subtree. `npm run validate` clean, `audit:creators`
  HIGH 0 · MED 0 · INFO 9 (unchanged), 371 tests pass.
- **Separate pre-existing defect found and NOT fixed here** (it predates this commit and is
  unrelated): `6MlSd4nBtrI` (Dratnos) sits in BOTH `skipped[]` and `seen[]`, which this SKILL.md
  says validation refuses — yet `npm run validate` passes. Either the check is missing from
  validate.mjs or the SKILL.md sentence overstates it. Flagged for its own reviewed commit.

## 2026-08-21 (local run, scheduled task)

**Queue drained to 0; 5 takes added across 3 specs; 0 metaNotes; 2 videos verified-skipped.**
Residential catch-up after the 10:37 UTC nightly (91205d7), which had queued two videos it
could not distil itself.

- **Queue drained (2 -> 0), both to `skipped[]`, neither yielding a claim.**
  - izen `gGzU0vD8R6M` "Season 2 Mythic+ Talking Points" — a genuinely substantive 12-minute
    argument that the S2 dungeon pool shifts value from large AoE toward single-target and
    low-target cleave (fewer casters per pack, far more mini-bosses; Void Scar Arena, King's
    Rest, Den of Nalorakk and Mardero each walked through). **No metaNote distilled**, and this
    is the run's one contestable call: the only per-spec content is a single two-sentence
    enumeration — "specs like arms ... specs like arcane ... specs like outlaw and specs like
    wind walker ... worse for specs like balance" — and **each of those five specs is named
    exactly ONCE in the whole transcript** (verified by grep over the flattened captions), with
    no second spec-specific mention anywhere. That is verbatim the `specs like X ... like Y`
    bare-enumeration shape SKILL.md's list-mention rule rejects. Balance was the closest call,
    because the Mardero passage that follows elaborates *why* a former massive-AoE dungeon now
    punishes it — but that passage describes the DUNGEON, and the only Balance-specific
    assertion in it is "was perfectly fine doing massive AoE". Dropped on the rule. The general
    dungeon-pace argument has no per-spec home in the data model, so nothing was written.
  - Nintern `k0mCjMlwyys` "Devourer Sim Update" — 2m42s gem-optimisation PSA (a crit-effectiveness
    gem config simming ~1k ahead; takeaway is "re-sim your own gems/enchants/Omnium Folio"). He
    calls it a super minor gain himself. Gear-level content, no spec-strength read — the standing
    guide-shaped rule, applied.

- **Unfiltered local sweep: 44/44 channel feeds HTTP 200, 66 unseen in-cycle** against the
  2026-06-18 bound (computed as the OLDEST date in `ptr-builds.json`, not `builds[0]`).
  Seen-set 1164 from the four structured lanes. Up one from the nightly's 65. Title filtering
  deliberately not applied; triage was by metadata (duration / `live_status`) on the 8
  candidates that could plausibly carry an analytical read.
- **Nothing was retired to `seen[]`.** No sub-minute durations and no caption-less videos were
  found, so no dismissal this run is durable. The 64 unexamined videos stay UNSEEN and will be
  reconsidered — they are overwhelmingly livestream/split-run shells (Tettles `9YgGUE2c5TM`
  3.6h `was_live`, Pkpawner `WeZH5pda1M4` 8.7h `was_live`), raid/M+ PoV clips, and the 9
  PvP-framed Supatease uploads.

- **AutomaticJak `PS-C4w5vJz8` "Holy or Disc? Midnight Season 2"** (7m41s, in scope: his Priest
  entry is `["Discipline","Holy"]`) — **4 takes**, all bracket-explicit, all `Season 2 live —`
  framing. His first-week live read moves Holy Priest UP sharply in both brackets from his
  08-15 launch tier list, and confirms the Disc M+ collapse he predicted on the PTR:
  - Discipline / mplus / `nerf` — "struggle busing in keys"; ties it to the removed independent
    Atonement dungeon modifier he and Clandon argued for on 08-06, and says if there were ever
    a season to bring it back, this is it. Supersedes his 08-06 M+ take (same argument, now
    confirmed live rather than predicted).
  - Discipline / raid / `mixed` — still expects Disc at RWF/top-100; damage remains the asset
    (~45k at 308 ilvl, "close to tank damage") despite the heavy nerfs, Rift buffed for
    two-target. Mixed because he advises everyone below that bracket to play Holy instead.
  - Holy / raid / `buff` — a real upgrade: on 08-15 he excluded Holy from his predicted race
    comp; now he reports seeing "tons of holy priests" through the opening Venomous Abyss week
    and recommends it below top-50/100 for ease of access and cheat death.
  - Holy / mplus / `buff` — "crushing it right now", effectively infinite mana on an Oracle
    build, and *decently tanky*, which speaks to the survivability gap that held his 08-15
    B-tier placement down.
  **Deliberately NOT used as evidence:** "smacked was top HPS on a seven-minute fight" — a
  named player on a single Heroic Twin Fangs kill, which is the fight-artifact trap. Also left
  out rather than guessed: several ASR-mangled talent names ("wood guides" = Wowhead, "Palm"
  ~ PoM, "trail"), since build minutiae are not a strength read.

- **Sha `vtNNBI8kdOw` "Heroic Twin Fangs | Brewmaster Commentary"** (9m03s, in scope: Brewmaster)
  — **1 take**, Brewmaster / raid / `buff`, superseding his 08-14 raid take. Having now actually
  raided the spec (~world-200 Heroic kill; he notes he does not normally do raid content) he
  **revises** that negative read: he states the bracket contrast directly — *he has been pretty
  down on Brewmaster in M+, but in raid it actually feels pretty okay* — credits two-target
  cleave via Master of Harmony plus the apex talent, Blackout Kick and Overwhelming Force, and
  reports that Master of Harmony + Exploding Keg + Empty the Cellar gives enough brew CDR that
  the rotation never goes dull. That last point directly answers the resource-deficit objection
  he raised on 08-14, which is why this is a genuine replacement rather than a second opinion.
  **He disclaims his own rank-1 parse outright** ("competing with literally myself", ~17
  Brewmasters in the bracket), so the take rests on kit behaviour and says so.
  - **His 08-06 M+ take was deliberately left LIVE and un-superseded.** He restates the M+
    negative here, but only as a one-clause aside with no new mechanism, whereas the 08-06 take
    is a detailed, mechanism-rich analysis in the same direction. Superseding a rich take with a
    thin restatement would strip the drawer of information while changing nothing — the
    re-affirmation is recorded here instead.

- **OWNER FLAG carried forward, unchanged:** Musguete `DHqw-Oq9NjY` "Subtlety Rogue Season 2
  Guide" falsifies his registry note ("No dedicated Subtlety content exists, so Subtlety is
  deliberately out of scope"). Not queued and not silently widened — it is also guide-shaped, so
  it yields no take either way. Still needs a human decision on the scope note.
- `expertRead` remains dormant for all 40 specs in both brackets (`PHASES.ptr` is null since the
  flip), so none of these five takes can move a projection — they are drawer context only.
- Verification pass done on all five takes against their own transcripts before commit: every
  number attached to the referent the creator attached it to, no ASR mangle written as a name,
  no claim resting on a video it does not deep-link.

## 2026-08-21 (nightly CI)

**Discovery complete; 0 takes, 0 metaNotes, 2 queued.** `transcript-fetch/summary.json`
reports verdict `ok` with requested 0 / fetched 0 — `pending-transcripts.json` was EMPTY when
the deterministic step ran, because the 2026-08-20 local run drained and distilled both videos
this nightly queued on 08-20 (2 Obli DK takes, 6 Dorki tank takes are in `creator-takes.json`).
No transcript was fetched from YouTube or any API by this agent.

- **44 unique channel feeds polled** with 3-attempt backoff (119 creator entries, 40 of them
  `transcribable: false`, sharing them), **44/44 HTTP 200**, 660 entries diffed against a
  **1162-id** seen-set built from the four STRUCTURED lanes — never a regex over this file.
- **65 unseen, all 65 in-cycle** against the 2026-06-18 bound (`Math.min` over
  `ptr-builds.json` dates, taken as a DATE and not as `builds[0]`). That is **down** from last
  night's 97 not because anything was retired but because YouTube RSS holds only 15 entries per
  channel and the tail scrolled out — a real loss of reach, recorded as such.
- **TWO QUEUED**, both chosen on `media:description` rather than title, under the nightly's
  keyword filter and the fetch-broadly/queue-narrowly rule that protects Supadata's
  100-request MONTHLY budget:
  - `gGzU0vD8R6M` — izen, "Season 2 Mythic+ Talking Points: Boltslop, Minibosses and Less AoE
    DPS". His own chapter list ends "10:27 DPS Damage Profiles"; a `generalCreators` entry, so
    the metaNotes lane.
  - `k0mCjMlwyys` — Nintern, "Midnight Season 2 Devourer Sim Update". Squarely inside his
    registered Devourer/Havoc scope and the first sim-update content of the live season.
- **NOTHING retired to `seen[]`** — no dismissal tonight is durable. The other 63 stay UNSEEN
  and were counted, not estimated: **9** PvP-framed (all Supatease, including the
  title-innocent "NEW PATCH NEW META DISCOVERY" and "DISCOVERING THE BEST CLASSES 12.1" — the
  durable 2026-08-09 finding is that he reasons every meta read from PvP), **29**
  livestream/split-run shells that cannot carry captions yet, **14** raid-boss and delve PoV
  clips, **3** guide-shaped, **7** other misc streams, and **1** named judgement call:
  Dratnos `3FKkYYSMiNo` (RWF Day 3) not queued, because its Day-1 and Day-2 twins were both
  transcript-verified and skipped for a structural reason that has not changed — a two-speaker
  co-cast the transcript never attributes — and its description promises speculation about
  tuning not yet posted, which is not a read.
- **OWNER FLAG (new).** Musguete published `DHqw-Oq9NjY` "Maximize Your DPS NOW! Subtlety Rogue
  Season 2 Guide". His registry entry reads `specs: [Outlaw, Assassination]` with the explicit
  note *"No dedicated Subtlety content exists, so Subtlety is deliberately out of scope"* —
  that premise is now false. Not queued and **not silently widened**: it is also guide-shaped
  how-to-play content, which yields no take by the standing rule. The scope note wants a human.
- **yt-dlp metadata probe** (no download, no captions, one video) hit the datacenter bot wall —
  "Sign in to confirm you're not a bot", the settled 2026-07-17 finding — and was abandoned
  immediately rather than retried. So `live_status`/`duration` triage is unavailable on CI, and
  stream shells and Shorts can only be left unseen, never retired.
- `npm run audit:creators`: **HIGH 0 · MED 0 · INFO 9** (8 transcribable creators with zero
  takes ever; the per-spec coverage sweep is suppressed while the expert lane is dormant).

## 2026-08-20 (local run — residential transcript catch-up, scheduled)

**9 takes added across 8 specs · 0 metaNotes · 4 takes superseded · queue drained 2 → 0 ·
47 transcripts fetched · 44 verified-skipped · 13 durably retired to `seen[]`.**
Ran ~3.2h after the nightly (manifest `startedAt` 11:00:40Z), so this was catch-up, not a race.

**The queue's two videos both distilled — the nightly could not, because it had no transcript
to read.** yt-dlp cleared the bot wall from this IP on the first try for all 47 attempts.

- **Obli `nmErWeN4woE`** (Frost DK Update, 08-20) → 2 takes. Frost DK **both/nerf**: reads the
  launch tuning as a severe net nerf, arguing it as a before/after against his own June PTR
  logs at comparable item level (Obliterate ~128k → 62k in a key; Breath of Sindragosa 451k →
  170k; Frost and Fury 585k → 364k; Reaper's Mark ~500k → 289k; Howling Blast 50k → 80k the only
  gain), and asks for the PTR Obliterate change to be reverted. Unholy DK **raid/nerf**: a
  secondary read he explicitly defers a full treatment on. Scoped Unholy to RAID, not both — the
  evidence he actually shows for it is the all-boss damage table; he gives no M+ read for Unholy.
- **Dorki `3r_vwmTUZXs`** (Season 2 M+ tier list, 08-19) → 6 takes, **all mplus**, and this is
  his FIRST take ever. **Dorki is registered as a TANK-only authority** (Blood DK, Vengeance,
  Guardian, Brewmaster, Prot Paladin, Prot Warrior), so only the six tank reads were attributed:
  Blood DK **buff** (alone at the top, "deserves its own tier", and he offers his own history of
  ranking DK worst as a bias check), Guardian **buff** and Vengeance **buff** (meta contenders),
  Prot Paladin **mixed** (contender on paper, but he builds no comp for it), Brewmaster **mixed**
  ("aggressively mid" but surrounded by strong comp partners), Prot Warrior **nerf** (spell
  reflect and little else). His whole-roster DPS and healer reads — Preservation, Holy Paladin,
  Resto Druid, Shadow Priest and the rest — were DELIBERATELY NOT LOGGED: out of scope, and
  `validate.mjs` would have failed them red anyway. Never converted his S/A/B/C into letters.
- **Dalaran Gaming `f8YlxVEbGCY`** (Subtlety guide, 08-17) → 1 take, Subtlety **raid/buff**.
  The whole read is the intro: Rogue looks like one of the strongest classes for Season 2,
  especially raid, with Subtlety leading boss damage — heavily hedged and caveated on nerfs.

**Supersessions (4).** Obli's 08-10 Frost and Unholy `both` takes, plus his 08-06 Frost `mplus`
take (the new `both` take occupies the M+ lens too). His 08-06 **Unholy** `mplus` take was left
LIVE on purpose — the new Unholy take is raid-scoped, so 08-06 remains the only M+ date on that
lens. Also superseded Dalaran's 08-12 Subtlety `both`; noted in its `supersededNote` that his M+
reservation is not carried forward, only preserved.

**THE FIND OF THE RUN — a title that lied in the direction that costs takes.**
Supatease `MDh9YwHmtZQ` "Nine WORST Specs 12.1" reads as a general spec-strength list and would
have been a nine-spec harvest. Its first sentence scopes it to **PvP** ("when it comes to PvP for
week number one"), and so does the number-one pick. Every read in it is an arena judgement about
cooldown dependence, durability and mobility. Verified-skipped. This is the fetch-broadly rule
paying off in the OTHER direction from the 08-08 Tactyks lesson: there a boring title hid a real
take, here an exciting title hid out-of-scope content. Neither is knowable from the title.

**Breadth, per the local rule — no keyword filter, DATE bound only.** 44 feeds, 44/44 HTTP 200,
100 unseen in-cycle against the 2026-06-18 bound (`Math.min` over `ptr-builds.json`, never
`builds[0]`), diffed against a 1104-id seen-set from the four structured lanes. Disposition of
all 100, so nothing is silently abandoned:
- **1 distilled** (Dalaran Subtlety) + the 2 queued above.
- **44 verified-skipped** with reasons: 9 dungeon-route walkthroughs (Sha ×6, Tactyks ×2, YoDaTV)
  where every "buff" is a vendor consumable and every "nerf" is a mob; 11 Bansherz PoV runs and
  4 short clips; 5 PvP videos (Supatease ×2, Dalaran ×3); 8 mechanics/gearing guides; the rest
  news and misc. **Tactyks' two dungeon videos were fetched specifically because the 08-08 run
  skipped him on a "dungeon guide" title** — this time the transcripts really do carry no spec
  content, which is now on the record rather than assumed.
- **13 durably retired to `seen[]`**: 10 sub-90s Shorts (duration is a fact that rules them out)
  and 3 "Video unavailable — blocked due to claimed content by SME". **This closes a gap the
  nightly named**: it could not verify durations at all, because the yt-dlp metadata probe hits
  the datacenter bot wall, so it had to leave Shorts unseen forever. Musguete `MVZ2YaUC9Fo` is
  one of these — the nightly flagged it as having a genuine strength claim in its description
  but declined to queue it because it could not VERIFY the sub-minute duration. Verified: 46s.
- **42 left UNSEEN on purpose**, because these are budget/transport dismissals and marking them
  seen would abandon a handed-forward backlog: 37 multi-hour stream VODs (3–12h raid/key
  streams), 2 with no caption track yet (Shadarek `POENnO-sGog`, Harrek `1LfW9JXNRsI` — both
  published within 2 days, auto-captions may still appear, so retiring them would risk losing a
  Havoc DH and a Resto Shaman read), 1 upcoming live, 2 "live event has ended" with no VOD.

**Dratnos `o3Ury9zK_1U` (RWF Day 2) — the nightly's judgement confirmed, not inherited.** Fetched
it rather than trusting the Day-1 precedent. Its "overtuned"/"nerf" language is all ENCOUNTER
tuning (Mythic Nymrissa, heroic Ula'tek, 25→20 scaling) plus server and bug problems, and the
transcript still never attributes either speaker of the co-cast. Skipped on both grounds.

`latest` advanced on Obli, Dorki (×6 class entries), Dalaran Gaming (×5) — each to a distilled
one-line read, never a bare title. `npm run audit:creators`: HIGH 0 · MED 0 · INFO 9 (was 15 —
Dorki and two others left the "transcribable, zero takes ever" list).

**Note for the next cycle:** `expertRead` and the audit's supersede check both era-filter on
`PHASES.ptr.marker`, which is null between cycles — so these 9 takes moved NO projection letter
today (verified: `expertRead` returns null for every spec, and the rendered forecast is the
frozen 08-11 artifact). The 08-20 snapshot came out byte-identical, which is the same fact from
the other side. They are archival and drawer-visible now, and they re-arm at 12.2 — which is
also when the supersessions above start mattering, so they were done properly rather than
deferred.

## 2026-08-20 (nightly CI)

**Discovery complete; 0 takes and 0 metaNotes added; 2 videos queued; no `latest` advanced.**
No transcript was fetched from YouTube or any transcript API by this agent, and nothing was
installed or upgraded.

`transcript-fetch/summary.json` reports verdict **"ok"** with requested 0 / fetched 0, because
`data/pending-transcripts.json` was EMPTY when the deterministic step ran (the 08-19 local run
had drained both of last night's queued videos into `skipped[]`). So there was no transcript in
existence to distil from, which is why nothing landed — a supply fact, not a judgement.

**44 unique channel feeds polled with backoff (119 creator entries, 40 of them
`transcribable: false` 📖, sharing those feeds): 44/44 HTTP 200, 660 entries.** Diffed against a
**1102-id** seen-set built from the four STRUCTURED lanes (`pending-transcripts` seen[] /
skipped[] / videos[] plus every `youtu.be` id in a take or metaNote url) — never a regex over log
prose. **97 unseen, all 97 in-cycle** against the 2026-06-18 bound (the OLDEST date in
ptr-builds.json, taken as a date and not as `builds[0]`); zero pre-cycle. Launch week plus the
Race to World First produces a lot of uploads.

**TWO QUEUED**, under the nightly's keyword filter and the fetch-broadly / queue-narrowly rule
that protects Supadata's 100-request MONTHLY budget. Both are spec-STRENGTH-read shaped, which
is the scarce thing in week two of a season:
- **Obli `nmErWeN4woE`** — "From S-tier to F-Tier... / Frost DK Update 12.1 Season 2". Its
  `media:description` is an explicit read, not a title guess: "TLDR; Frost heavily overnerfed and
  now DKs are in the worst spot they've been in for years." Squarely inside Obli's registered
  Frost/Unholy DK scope.
- **Dorki `3r_vwmTUZXs`** — "OFFICIAL SEASON 2 M+ TIER LIST | Midnight 12.1". Description carries
  his own chapter list (Intro / The List / Possible Comps / Revisions-Predictions), so it is a
  20-minute analysis rather than a clip. **Note for the distiller: this is DORKI'S OWN list, not
  a read-aloud of ours** — he is not on the rejected-creator register, and Archon/Icy Veins/
  Wowhead/Method are not his sources; if the transcript turns out to recap our registered lists
  on screen, `skipped[]` it and flag him. Scope to his six registered classes only. He is one of
  the 14 `[yield] transcribable, zero takes ever` entries in `npm run audit:creators`, so this is
  the first real chance at a Dorki take.

**NOTHING was retired to `seen[]`: no dismissal tonight is durable.** The other 95 stay UNSEEN
and were COUNTED, not estimated (2 + 2 + 31 + 29 + 10 + 8 + 4 + 11 = 97) — `media:description`
was parsed alongside every title and settled most of the triage at zero transcript cost:
**31** dungeon-route / boss / delve / gearing / BiS / spec-how-to guides (the standing rule that
guide-shaped content carries no spec-strength read; 5 of them are Tactyks' M+ content, separately
firewalled because he writes the Method M+ list), **29** livestream and Twitch shells — RWF split
streams, key-spam and "servers are live" broadcasts — which cannot carry captions yet and must be
left for the VOD, **10** raid-boss PoV clips whose descriptions are a Twitch link and a log url,
**8** PvP-framed uploads (Dalaran Gaming's duels plus Supatease's "DISCOVERING THE BEST CLASSES
12.1" / "NEW PATCH NEW META DISCOVERY" / "Nine WORST Specs 12.1" / "12.1 Most Fun PVP Tier List",
which the 08-09 precedent records as PvP-reasoned), **4** hashtag Shorts, and **11** others —
NeekapHere's "This Week In WoW" news round-up (08-18 precedent), three Supatease off-topic
commentary uploads, Whispyr's untitled reaction, and izen's "Season 2 Start Reminders", a QoL
to-do list whose chapters are keystone tricks and bonus rolls rather than a per-spec meta read,
so it is not `metaNotes[]` material.

Two judgement calls worth naming:
- **Dratnos `o3Ury9zK_1U`** ("RWF Day 2 Recap") NOT queued. Its Day-1 twin was transcript-verified
  and skipped on 08-19 for a structural reason that has not changed: it is a two-speaker co-cast
  and the transcript never identifies which voice is Dratnos. Left UNSEEN, not `seen[]` — this is
  a budget/shape dismissal, and the video becomes recoverable the moment the co-host is identified.
- **Musguete `MVZ2YaUC9Fo`** ("Season 2 is ROGUE SEASON!!") NOT queued despite a genuine
  strength claim in its description ("All 3 rogue specs are BLASTING RIGHT NOW!!"). It is a
  hashtag Short, and a sub-minute duration would be a durable `seen[]` fact — but that duration
  could not be VERIFIED (see below), and the rule is that only a verified fact retires an id.
  Left unseen.

**yt-dlp metadata probe hit the datacenter bot wall — settled behaviour, not a new failure.**
Three `--print` metadata calls (no download, no captions) all returned "Sign in to confirm you're
not a bot"; backed off immediately after the third rather than hammering, and made no further
YouTube request. This is the 2026-07-17 finding: residential IPs are unaffected, runners are
blocked, and the landed fallback is exactly the Supadata queue used above. Practical consequence
for this lane on CI: `live_status` and `duration` triage is unavailable, so stream-shells and
Shorts must be judged from title + `media:description` alone and can only be left unseen, never
retired.

## 2026-08-19 (local run — residential transcript catch-up, scheduled)

**Queue drained to ZERO: 2 in, 0 out. 44/44 feeds polled, 660 entries, 67 unseen (all
in-cycle against the 2026-06-18 bound). 5 transcripts fetched by yt-dlp, 1 take added,
4 verified-skipped, 1 retired to `seen[]`.** No metaNotes.

**The two queued videos both verified-skipped, and neither was a transport failure.**
- Dratnos `38bYF2buWg0` "RWF Day 1 Recap" — a TWO-SPEAKER co-cast. The only line inside his
  Arms/Fury scope is "arms warrior still looks great", spoken inside an answer anchored by
  self-reference ("in my estimation", "my predictions for the tier") — but the transcript
  never says WHICH voice is Dratnos, and `--print description` credits no co-host. The other
  voice's own picks (destruction warlock, balance druid, shadow priest) point at a Balance
  specialist. **This is the same call already on file for `6MlSd4nBtrI`, the Day 0 preview**,
  reached independently before that record was found. He also already carries a live
  raid-scoped Arms take (2026-08-16) from the same RWF-comp lens, so even a successful
  attribution would have superseded rather than added. Recoverable if the co-host is named.
- Shindigg `W40Mcpr1kLg` "12.1 Rogue Guide (All changes)" — a mechanics walkthrough of all
  three Rogue specs. Every comparison is INTERNAL (Trickster vs Deathstalker, finisher
  priority, stat thresholds, four opener methods). No spec-strength read exists in it.

**The one take: Dalaran Gaming → Restoration Druid, `bracket: "mplus"`, sentiment buff**
(`owz2wMTAa5k?t=222`, published 08-18). He weights the launch tuning's two Resto lines
differently — 4% healing "nice but not insane", 20% damage "significant" — and reads the
damage buff as an M+ opening. Captured WITH its hedging ("possibly, maybe, potentially"),
because that hedging is the read. **Two things deliberately not written:** his
"boomkins were going to be the go-to DPS" clause is received wisdom he reports, not his
analysis, so it did not become a Balance take (list-mention rule); and the 06-30 Resto take
was NOT superseded — it is a general-lens read of the June QoL redesign, a different lens
and a different change set from an M+-scoped read of August tuning.

**ERA FRAMING:** this take is the first written under the post-launch rule —
`patchContext` reads "Season 2 live — …", never "Season 2 PTR — …". Note the 08-18 nightly's
takes still say "12.1 PTR" for 08-18 content; those pre-date the flip in practice.

**Two guide-shaped videos transcript-verified rather than assumed** (both confirmed the
standing rule, both now durable in `skipped[]`): Shadarek `TdX8LxFVVME` (Devourer DH
BiS/rotation guide) and Sha `pBrG9id-5OM` (63-minute per-boss tanking walkthrough — checked
BECAUSE tanks are the thin lane, and it still carried nothing).
⚠️ **New parser trap, cost me a scan:** in a Demon Hunter transcript **every "meta" hit is
the ability Metamorphosis**, not the game meta. A keyword scan for meta-reads returns ~15
false positives per DH guide. The scan was validated against a known-positive file first
(the Dalaran transcript, 12/38 blocks) exactly as SKILL.md requires.

**Retired to `seen[]`: `ak84M-_idos`** (Supatease, "Assassination Rogue STRONG 12.1") — 20
SECONDS long. Sub-minute duration is a durable fact. Its siblings were checked and are NOT
retired: Tettles `ghJ_b308GQE`/`-_HdsFdOGKg` (111s/91s) and Megasett `a49UmUth7m0` (95s) all
exceed a minute, so they stay unseen rather than stretch the rule.

**The other ~62 stay UNSEEN on purpose** — a budget decision, not a judgment, so nothing was
retired: ~24 stream/Twitch VOD shells (metadata-confirmed, incl. Supatease `kGsd9cMmBCc`
at 6.9h `was_live` and Sha `N0gl58RajmI` at 11.6h), the guide/route block, and the PvP lane.
I stopped the sweep after four guide-shaped confirmations rather than spend ~40 more fetches
re-proving a settled rule and risking the batch-429. Anything not in the four lanes is still
genuinely unexamined.

## 2026-08-19 (nightly)

**44/44 feeds polled OK, 660 entries, 66 unseen — all in-cycle. 2 queued, 0 distilled.**

Distillation was impossible rather than skipped: `transcript-fetch/summary.json` reports
verdict `ok` with **requested 0 / fetched 0**, because `pending-transcripts.json` was EMPTY
when the deterministic step ran, so there was nothing to drain and no transcript to read.
No transcript was fetched from YouTube or any API by this agent; nothing was installed or
upgraded. No `latest` field advanced (there was nothing to advance it to).

Seen-set rebuilt from the four STRUCTURED lanes — **1096 ids** (pending-transcripts
`seen[]` 525 / `skipped[]` 361 / `videos[]` + every `youtu.be` id in a take or metaNote url) —
never a regex over log prose. Cycle bound taken as `Math.min(...builds.map(b => b.date))` =
**2026-06-18**, not `builds[0]`.

Launch week is loud: 66 unseen against ~33 last night, and **every one is in-cycle**, so the
date bound filtered nothing tonight and the triage did all the work.

**QUEUED (2)** — nightly keyword filter plus fetch-broadly/queue-narrowly, protecting
Supadata's 100-request MONTHLY budget:
- `38bYF2buWg0` **Dratnos** — "Race to World First Day 1 Recap - A Tough Start" (2026-08-19).
  Registered Warrior specialist; day-one raid analysis, and raid is the bracket carrying the
  least evidence.
- `W40Mcpr1kLg` **Shindigg** — "12.1 Rogue Guide (All changes)" (2026-08-18). His own class,
  and a *changes* walkthrough rather than a route/BiS guide, which is the distinction that
  makes it worth a transcript.

**NOT queued, counted rather than estimated (64), and NOTHING retired to `seen[]`** — no
dismissal tonight is durable:
- **24 stream / Twitch shells and live launch broadcasts** (YoDaTV, Critcake, Tettles,
  LBNinja7, AutomaticJak "SERVERS UP", Pkpawner, Whispyr, Clandon, Shindigg splits, Megasett,
  Shadarek raid splits, Tactyks launch stream, Dalaran's livestream, Supatease "DAY 1", and
  Maximum's "RWF day 1", whose description is literally "watch on twitch"). Captions cannot
  exist yet — leave UNSEEN so the VOD is reconsidered.
- **21 guides** — dungeon routes (Sha ×5, YoDaTV, Tactyks ×2), boss/delve guides (AutomaticJak
  Nymrissa, Tactyks Azta'rec, NeekapHere Azta'rec, Critcake), spec how-tos (leak ×2, Sam,
  Shadarek Devourer, Dalaran Subtlety, LBNinja7 Resto Shaman), gearing/shopping PSAs (leak,
  Megasett). Standing rule: guide-shaped content carries no spec-strength read. **4 of these
  are Tactyks' M+ content, separately firewalled** — he writes the Method M+ list.
- **8 PvP-framed** — Supatease ×5 (including "Nine WORST Specs 12.1" and "DISCOVERING THE BEST
  CLASSES 12.1"; the 08-09 precedent records his season reads as PvP-reasoned, and his
  registered scope is Shaman/Warlock/Warrior anyway, so the Assassination Rogue clip is out of
  scope twice over) and Dalaran Gaming's three "5v5 1v1 Duels" videos.
- **6 raid-boss PoV clips** (Bansherz) whose entire description is a Twitch link and a
  Warcraft Logs url — no commentary to distil.
- **4 shorts/off-topic**, and NeekapHere's "This Week In WoW August 18th" news round-up, left
  unseen on the 08-18 precedent.

`media:description` was parsed alongside every title on the discovery pass and settled most of
that triage at zero transcript cost — the Bansherz PoV clips and the Maximum restream were
decided entirely by their descriptions.

**Worth knowing before the next run spends budget here:** `expertRead` gates on `PHASES.ptr`,
which is null between cycles, so new takes currently move no projection at all — they are
drawer context only until a 12.2 PTR phase opens. That does not change the queueing rules, but
it does mean a thin night here costs nothing downstream.

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
