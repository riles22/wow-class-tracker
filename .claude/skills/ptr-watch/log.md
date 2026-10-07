# ptr-watch run log

Keep the newest ~20 entries. Prune only in a local or interactive run, and first move into
SKILL.md any lesson that lives only in the entries being dropped: the nightly publishes data/,
dist/ and these logs but never SKILL.md, so a nightly prune can delete a rule but cannot save
it. Pruned 2026-08-15 (these four logs held 64-78 entries each, and none had ever been pruned):
watch-creators had reached 270KB, over the Read tool's 262,144-byte gate, so a bare Read of it
returned NOTHING. Pruned again: refresh-metrics and watch-creators by the 2026-09-30
nightly, ptr-watch and refresh-tiers on 2026-10-06.
check-skill-logs.mjs warns, and the nightly digest names the log, once one passes 200,000
bytes in a Windows checkout.

This file holds NO machine state. The seen-set moved to structured data on 2026-08-08
(pending-transcripts.json seen[]/skipped[]/videos[] plus take urls) precisely because
regexing ids out of this prose absorbed 231 ordinary English words into a 950-entry set;
parse counts are logged "for the record" behind no gate. It is narrative memory, and it is
prunable. Durable RULES belong in SKILL.md, not here — the 2026-08-15 prune had to promote
~31KB of parser traps out of the prune range first, because they existed nowhere else.

Entries are sorted NEWEST FIRST by date. Two forms are in use ("- <date>" and "## <date>"),
they interleave, and refresh-tiers was chronologically scrambled before this prune — so sort
by parsed DATE, never by position. Never cite this file from anywhere else, by line NUMBER
or by phrase: a prune deletes both. On 2026-10-06 three files still pointed at refresh-tiers
entries pruned weeks earlier. A rule other files need goes in SKILL.md; when an entry's
history matters, cite the commit that added it.

## 2026-10-07 (nightly re-run, ~17:35 UTC) — no new tuning; ledger checkedAt only; 0 feed entries

- Ledger: both sources success (2336376 post 1 still v56; 2344395 posts 1/4/5/6 v3/v1/v1/v1); pending differed from stored only in checkedAt; 0 unresolved.
- Wowhead RSS (40 items), news index and blue tracker: nothing new since the morning run but WoW Forever items (news=383292/383284/383259, blue topic 2375129 — Forever PvP, out of scope). "Incoming Class Tuning - October 6" (2370266) still v1. 12.1 thread 2317811 unchanged.
- No new forecast cycle; PHASES.ptr null. 12.1.5 releases 2026-10-13 (LABEL_FLIP_DUE).

## 2026-10-07 (nightly) — quiet on every official channel; ledger unchanged at v56; feed holds at 47 (one citation upgraded)

- **Revision ledger:** official-notes receipt (checkedAt 2026-10-07T05:22:56Z) both sources success; live-hotfixes 2336376 post 1 still v56 (2026-10-06T22:36:40Z), ptr-preview 2344395 posts 1/4/5/6 at v3/v1/v1/v1. pending.json vs ledger: 0 added / 0 edited / 0 removed, 0 unresolved; only the two checkedAt stamps moved. check-official-notes --base=HEAD passes.
- **Topics re-fetched** (curl -L on /t/x/<id>.json): 2336376 v56; 2344395 newest staff post #6 (2026-09-29); 2370266 v1; 2373623 v2; closed 2317811 13 posts, last 2026-07-31. Nothing new.
- **Wowhead:** RSS 40 items (top news=383282), news index top 383282, blue tracker 50 entries — newest relevant topic still the Oct 6 compilation. The one new live-12.1 item, news=383282 "Class Changes, Raid Tuning - Patch 12.1 Hotfixes for October 6th" (2026-10-06 18:11 US-Central), was read from its RSS body and matches the stored 2026-10-06 entry's class and raid lines exactly; it replaces the blue-tracker mirror as that entry's wowheadUrl (label amended to say so). No new entry, no set bonus touched.
- 12.1.5 material: nothing new beyond news=383233 (logged 10-06). No new forecast cycle. Dormant WCL PTR lanes skipped.

## 2026-10-06 (nightly, THIRD run of the day) — **the hotfix compilation gained its October 6 block (v53 → v56, edited 22:36:40Z)**: 18 new sections, all dispositioned; one new feed entry (46 → 47); 12.1.5 preview lane unchanged

- **Revision ledger:** topic 2336376 post 1 moved v53 → v56 ("World of Warcraft: Midnight Hotfixes - October 6"). 18 new sections, 0 edited, 0 removed: 5 Classes (Unholy DK, Devourer DH, Brewmaster + Mistweaver Monk, Subtlety › Trickster, Enhancement Shaman) and 13 Player versus Player. Every Classes line was diffed against the 2026-10-02 "Incoming Class Tuning - October 6" entry (topic 2370266) and matches exactly, so all five are `irrelevant` as already carried (the 2026-09-22 precedent — no double count). All 13 PvP sections `irrelevant` under rule 3c (PvP talents / "in PvP combat"). The Dungeons and Raids block is the Ula'tek tuning already logged from topic 2373623; the compilation files Toxic Burn and Caustic Waves under General where the stored entry lists them with Stage 03 (same values). ptr-preview (topic 2344395): 4 staff posts, all versions unchanged; only checkedAt moved. `check-official-notes --base=HEAD` passes.
- **New feed entry** 2026-10-06 `kind: hotfix, realm: live`, `specsAffected: []`, one Non-class line recording that the 10-02 class pass and the Ula'tek tuning went live unchanged. No Wowhead round-up for Oct 6 existed yet (RSS + news index), so wowheadUrl = the blue-tracker mirror of the compilation (3b precedent). No set bonus touched.
- **Channels:** RSS 40 items (top news=383280); news index top 383280, nothing ahead of RSS; blue tracker 50 entries — new since the earlier runs: only the Oct 6 hotfix compilation (US/EU) and its Blizzard News mirror. 12.1 thread 2317811 still 13 posts (last 2026-07-31).
- **12.1.5 PTR material (run report only, not logged):** Wowhead news=383233 "Devourer DH Moving in the Right Direction - Review of Patch 12.1.5 Changes" (2026-10-06 09:00 CDT) — a 12.1.5 preview article; not a writeup source while 12.1.5 is not live.
- Dormant lanes (zones 52/54/56/57) skipped per the between-cycles posture.

## 2026-10-06 (nightly, SECOND run of the day — after the 17:27 UTC one) — **nothing new on any of the four official channels**; revision ledger UNCHANGED at v53, 0 sections added/edited/removed; feed holds at 46; `LABEL_FLIP_DUE` is now SET to 2026-10-13 (owner edit landed today — the six-night nag is CLOSED)

- **Official revision ledger (step 0) — clean.** `official-notes/evidence.json` (checkedAt 2026-10-06T21:49:43Z) reports both configured sources `success`: live-hotfixes topic 2336376 post 1 still at **version 53**, updatedAt 2026-10-02T00:02:37.783Z, same bodySha256, 120 class sections, 27 removed tombstones; ptr-preview topic 2344395 posts 1/4/5/6 at v3/v1/v1/v1, 18 sections. A keyed diff of `pending.json` against the committed ledger returned **0 added / 0 edited / 0 removed** in both sources, and with `checkedAt` neutralised the two files were byte-identical, so the ONLY write to `data/official-notes.json` is the two check timestamps and all 138 dispositions + 27 tombstones carry forward untouched. **0 unresolved.** `node src/check-official-notes.mjs --base=HEAD` reds before that write and passes after it — the expected shape of a quiet night.
- **Independent re-fetch of all four relevant topics**, not trusted from the receipt: **2336376** is still titled "World of Warcraft: Midnight Hotfixes - **October 1**", post 1 v53 — so at 22:00 UTC the **October 6 weekly-reset hotfix batch had NOT been posted**, and it raises no ledger obligation tonight (expect it on the 10-07 run). **2344395** (12.1.5 dev notes) unchanged, newest staff post still **#6, 2026-09-29T20:58:25Z**. **2370266** (Incoming Class Tuning - October 6) still post 1 **version 1**, and **2373623** (Incoming Ula'tek Raid Encounter Tuning - October 6) still post 1 **version 2** — so both entries logged earlier today need no reconciliation. The closed 12.1 dev-notes thread **2317811** is quiet as the posture block expects: 13 posts, newest staff post **#19, 2026-07-31**.
- **Three Wowhead discovery transports, nothing new for live 12.1.** RSS HTTP 200, 167,315 B, 40 items parsed per `<item>` block (window 10-01 … 10-06). News INDEX `data.news.newsData`, brace-balanced from the id attribute: 20 posts, totalPages 1564, top id **383278** at 2026-10-06 16:53 US-local — the index leads the RSS by nothing tonight, so no post landed mid-run. Blue tracker `data.blueTracker.default`: 50 entries, **43 unique topics** after deduping, newest class/raid-relevant topic still the already-logged 2026-10-05 21:44 Ula'tek encounter tuning. Every live-12.1 item in the window is already in the feed. **No set bonus is touched anywhere**, so no `spec.tierSet.asOf` advances and the upkeep gate stays quiet.
- ✅ **`LABEL_FLIP_DUE` IS NO LONGER NULL.** `src/normalize.mjs` now reads `LABEL_FLIP_DUE = "2026-10-13"` (the owner edit CLAUDE.md predicted, landed today), against `LABEL_FLIP_EXPECTED = "12.1.5"`. `PHASES.livePatch` is correctly still `null`. Consequences to carry forward: the `live-patch-label` heartbeat key arms on **2026-10-13 inclusive** and is a **pipeline** key, red every day it persists, and the 19:23 UTC cron means a launch commit landing after that day's heartbeat costs a red run. The six-consecutive-night nag in the entries below is closed; the runbook in `docs/1215-launch-runbook.md` is the next thing to read.
- **Run-report lane — seen and deliberately NOT logged in the feed** (`PHASES.ptr` is null, so 12.1.5 is a notes-only preview, not a cycle): (a) the consolidated **12.1.5 Content Update Notes**, Blizzard topic **2368213** (2026-10-01), a standalone topic rather than a reply in 2344395, so it reaches no site surface before launch and cannot be logged as `kind: "patch-notes"` while the displayed live patch is 12.1; (b) **"Midnight's 12.1.5 Content Update Arrives October 13"** (topic 2366152 US / 632485 EU, 2026-10-01) — October 13 NA, October 14 EU; (c) Wowhead's 12.1.5 spec previews, newest **"Devourer DH Moving in the Right Direction - Review of Patch 12.1.5 Changes"** (news=383233, 2026-10-06) — article analysis of an unreleased patch, so not `spec.ptr` writeup material; (d) "Patch 12.1.5 and Forever Class Deep Dives: This Week in WoW" (2026-10-02).
- **Dormant lanes skipped as designed:** steps 5-7b (WCL zones 54 / 52 / 56 / 57). The 12.1 cycle is closed, their contract rows left with it at the flip, so they get no manifest row and their stored rows stay untouched. Robydoby's PTR sheets were likewise not refetched.
- Writeup coverage **recomputed, not recited**: **one** spec has no `ptr` writeup — Demonology Warlock, the deliberate "the source reported no changes" null. `expertRead` stays dormant for all 40 specs while `PHASES.ptr` is null, so the coverage one-liner's take lists are all-40 by construction; that is not data loss.

## 2026-10-06 (nightly) — **one new feed entry: the October 6 Ula'tek raid encounter tuning** (topic 2373623); revision ledger UNCHANGED at v53, 0 sections added/edited/removed; feed 45 → 46; ⚠️ **12.1.5 still dated October 13 NA / 14 EU and `LABEL_FLIP_DUE` is STILL null (sixth consecutive night)**

- **Official revision ledger (step 0) — clean.** `official-notes/evidence.json` (checkedAt 2026-10-06T16:57:07Z) reports both configured sources `success`: live-hotfixes topic 2336376 post 1 at **version 53**, updatedAt 2026-10-02T00:02:37Z, 120 class sections, 27 removed tombstones; ptr-preview topic 2344395 posts 1/4/5/6 at v3/v1/v1/v1, 3+7+0+8 sections. `pending.json` carried **0 unresolved sections** and, with `checkedAt` neutralised, was byte-identical to the committed `data/official-notes.json` — so nothing was new or edited and the only write was the two check times. `node src/check-official-notes.mjs --base=HEAD` reds before that write (it compares the committed ledger against the trusted current revision) and passes after it; that is the expected shape of a quiet night, not a finding.
- **Independent re-fetch of the compilation.** `us.forums.blizzard.com/en/wow/t/2336376.json` fetched fresh this run: title still "World of Warcraft: Midnight Hotfixes - **October 1**", post 1 v53, updated 2026-10-02T00:02:37.783Z, newest dated block October 1 2026 — exactly the receipt. The October 6 weekly-reset batch had NOT been posted at 17:20 UTC, so it raises no obligation tonight.
- **NEW: Ula'tek raid encounter tuning for October 6.** Linxy, us.forums topic **2373623** "Incoming Ula'tek Raid Encounter Tuning - October 6", post 1 created 2026-10-06T02:44:12.639Z (post version 2, last edited 02:44:39.476Z), found via the Wowhead blue-tracker payload (2026-10-05 21:44:39 US-local) and cross-checked line for line against the Wowhead mirror **news=383264** (published 2026-10-05T21:45:44-05:00). The two agree exactly. Read with its per-stage heading nesting intact (General / Stage 02 / Stage 03). Logged as `kind: "hotfix", realm: "live"`, `forumUrl: null` with the topic cited in the label — the **2026-09-14 precedent** for an encounter-tuning post that has its own topic (validation refuses a `forumUrl` on a hotfix, and the `build` kind is reserved for the class-tuning passes). `specsAffected: []` (posts #7/#12/#13 precedent) and three `Non-class:` highlights. "set bonus", "-piece" and "tier set" appear **zero** times in the post, so no `spec.tierSet.asOf` advances.
- **Channels swept, all four, inline.** (1) Wowhead news RSS — 200, 190,182 B, 40 items parsed per `<item>` block. (2) Wowhead news INDEX (`data.news.newsData`, brace-balanced from the id attribute) — 200, totalPages 1564, 20 posts, top id 383256 at 2026-10-06 10:30; it agrees with the RSS, so nothing landed mid-run. (3) Blue tracker (`data.blueTracker.default`) — 50 entries, ~38 unique topics; the only class/raid-relevant topic newer than the last run is the Ula'tek one above. (4) The 12.1 dev-notes thread 2317811 — 13 posts, newest staff post **#19 2026-07-31**, quiet since the cycle closed, as the posture block expects.
- **12.1.5 lane, notes-only and unchanged.** The 12.1.5 development thread's newest staff post is still **#6, 2026-09-29T20:58:25Z** — matching the receipt — so the preview ledger gained nothing. Recorded here and NOT in `data/ptr-builds.json`, per the between-cycles posture: (a) **"Official 12.1.5 Patch Notes - Class Changes, Labyrinths, Kith'ix Raid"**, Wowhead news=383227-era article 2026-10-01, mirroring Blizzard topic **2368213** "12.1.5 Content Update Notes" (a standalone topic, not a reply in 2344395, so it reaches no site surface before launch); (b) **"Midnight's 12.1.5 Content Update Arrives October 13"** (topic 2366152 US / 632485 EU, 2026-10-01) — October 13 NA, October 14 EU; (c) Wowhead's own 12.1.5 spec previews, newest **"Devourer DH Moving in the Right Direction - Review of Patch 12.1.5 Changes"** (news=383233, 2026-10-06, by their Devourer writer Voodoosaurus), which is article analysis of an unreleased patch and therefore not writeup material for `spec.ptr` while `PHASES.ptr` is null; (d) "Patch 12.1.5 and Forever Class Deep Dives: This Week in WoW" (news 2026-10-02).
- ⚠️ **OWNER ACTION STILL OPEN, sixth night:** Blizzard has now dated 12.1.5 to **October 13** in its own announcement, and `LABEL_FLIP_DUE` in `src/normalize.mjs` is still `null`, so the `live-patch-label` heartbeat stays inert. Setting it is the one-line owner edit named in CLAUDE.md; agents do not touch `normalize.mjs` in a refresh. `PHASES.livePatch` correctly remains `null`.
- **Dormant lanes skipped as designed:** steps 5-7b (WCL zones 54 / 52 / 56 / 57). The 12.1 cycle is closed; their contract rows left with it at the flip, so they get no manifest row and their stored rows stay untouched. Robydoby's PTR sheets were likewise not refetched — same closed-cycle rule, and the source is deliberately outside `required-sources.json`.
- Writeup coverage recomputed, not recited: **one** spec has no `ptr` writeup — Demonology Warlock, whose null is the deliberate "the source reported no changes" case. `expertRead` remains dormant for all 40 specs while `PHASES.ptr` is null, so the coverage one-liner's take lists are all-40 by construction and that is not data loss.

## 2026-10-04 (nightly) — **nothing new on any of the four official channels**; revision ledger UNCHANGED at v53, 0 sections added/edited/removed; feed holds at 45; ⚠️ **the 12.1.5 notes now DATE the patch in their body — October 13 NA / October 14 EU — and `LABEL_FLIP_DUE` is STILL null (fourth consecutive night)**

**Official revision ledger first (step 0).** Pre-agent `official-notes/evidence.json` +
`pending.json`, `checkedAt 2026-10-04T15:31:34.486Z`, both sources `status: success`.
- `live-hotfixes` topic 2336376 post 1: still **v53** at `updatedAt 2026-10-02T00:02:37.783Z`,
  same `bodySha256`, 120 sections, and the 27 removed-section tombstones carried forward untouched.
- `ptr-preview` topic 2344395: posts 1 (v3), 4 (v1), 5 (v1), 6 (v1), all at unchanged body hashes.
- A keyed diff of pending against the stored ledger returns **0 added / 0 edited / 0 removed** in
  both sources, so the ONLY edit to `data/official-notes.json` is the two check timestamps and
  every prior disposition is preserved byte-for-byte. **0 unresolved** (live-hotfixes 22 applied /
  98 irrelevant + 27 irrelevant tombstones; ptr-preview 17 applied / 1 irrelevant).
- `node src/check-official-notes.mjs --base=HEAD` → "Official-note revisions, section
  dispositions and applied references verified."

**Forum JSON fetched independently rather than trusting the receipt.** 2336376 reproduces post 1
at v53 (title still "October 1"); the closed 12.1 PTR notes thread **2317811** is unchanged, newest
staff post still 2026-07-31; 2344395 matches the ledger exactly; the October 6 tuning topic
**2370266** is still post 1 **version 1** with staff post 2 empty, so the entry logged last night
needs no reconciliation.

**Discovery, three Wowhead transports, nothing new for live 12.1.** RSS HTTP 200, 213,155 B,
40 items parsed per `<item>` block; the news INDEX payload `data.news.newsData` (20 posts,
brace-balanced from the `id` attribute) tops out at **383243** at 2026-10-04 09:00, matching the
RSS top, so nothing landed mid-run; the blue-tracker payload `data.blueTracker.default` (50
entries, deduped by topic) has nothing newer than the already-logged 2026-10-02 tuning post. The
two live-12.1 items in the window — news=383242 (October 6 tuning) and news=383227 (October 1
hotfixes) — are both already in the feed. **No set bonus touched anywhere, so no `tierSet.asOf`
advances and the upkeep gate stays quiet.**

**Run-report lane — seen and deliberately NOT logged in the feed** (`PHASES.ptr` is null):
- ⚠️ **The consolidated 12.1.5 Content Update Notes (topic 2368213 / eu 632922, Wowhead
  news=383206) state the release date in their own BODY: "Patch 12.1.5 releases on October 13th
  for NA and October 14th for EU."** That is the announced date the owner action keys on —
  `LABEL_FLIP_DUE` in `src/normalize.mjs` is still `null`. `src/` is outside this agent's write
  boundary, so this is **reported, not edited, for the fourth consecutive night**. Two things that
  follow: the `live-patch-label` heartbeat key cannot fire at all while the constant is null, so
  there is no automated reminder behind this note; and once it IS set, the key is a **pipeline**
  key, red every day it persists, and the 19:23 UTC heartbeat cron means a launch commit landing
  after that day's run on release day costs a red night. The notes' own class section is Devourer
  DH, Resto Druid, Augmentation/Preservation Evoker, Marksmanship/Survival Hunter, Arcane/Frost/
  Frostfire/Spellslinger Mage, Monk, Disc/Holy Priest, Assassination/Outlaw/Subtlety Rogue,
  Enhancement/Resto Shaman and Protection Warrior — none of it reaches the site before launch, by
  design: the notes-only preview lane reads only staff posts in thread 2344395, and these are a
  standalone topic.
- The release-date announcement topic 2366152 (eu 632485 reads 14 October) — unchanged since
  2026-09-29, already recorded.
- The whole **WoW: Forever** beta stream in the RSS window (datamined class changes, Warrior and
  Gnome build notes, level-cap notes, dev podcast) is a different product and reaches nothing here.

**Dormant lanes, skipped as designed:** zone-54 PTR raid, zone-52 Dummy Dome, zone-56 PTR M+,
zone-57 Tidebound Grotto. The 12.1 PTR cycle is closed, their contract rows were removed at the
flip, their stored rows are final receipts — and the agent holds no WCL credentials in any case.

⚠️ **LOG SIZE, re-measured: 218 KB / 59 entries against the header's "newest ~20" and the Read
tool's 262,144-byte gate — about 44 KB of headroom, roughly ten nights at this entry size.** The
2026-10-03 entry scoped a prune and declined it for a single-shot run; that judgment still holds
tonight and tonight's entry was kept deliberately short instead. **Recommended owner/local action,
now overdue: prune ptr-watch and refresh-tiers to the newest ~20 entries, checking the removed
range for anything that exists nowhere but here.**

## 2026-10-03 (nightly) — **October 6 live class-tuning pass LOGGED** (`kind: build`, `realm: live`, feed 44 → 45); revision ledger UNCHANGED at v53, 0 sections added/edited/removed; ⚠️ **Blizzard has now dated 12.1.5 — October 13 — and `LABEL_FLIP_DUE` is STILL null**

**Official revision ledger first (step 0).** Pre-agent `official-notes/evidence.json` +
`pending.json`, `checkedAt 2026-10-03T14:54:09.570Z`, both sources `status: success`.
- `live-hotfixes` topic 2336376 post 1: still **v53** at `updatedAt 2026-10-02T00:02:37.783Z`,
  120 sections, and the 27 removed-section tombstones carried forward untouched.
- `ptr-preview` topic 2344395: posts 1 (v3), 4 (v1), 5 (v1), 6 (v1) all at unchanged body hashes.
- A keyed diff of pending against the stored ledger returns **0 added / 0 changed / 0 removed**
  in both sources; a whole-file compare ignoring `checkedAt` is **identical**. So the only edit
  to `data/official-notes.json` this run is the two check timestamps, every prior disposition is
  preserved byte-for-byte, and **0 sections are unresolved** (live-hotfixes 22 applied / 98
  irrelevant, ptr-preview 17 applied / 1 irrelevant).
- `node src/check-official-notes.mjs --base=HEAD` → "Official-note revisions, section
  dispositions and applied references verified."

**New feed entry (44 → 45): "Incoming Class Tuning - October 6".** `kind: "build"`,
`realm: "live"`, date **2026-10-02**, `forumUrl` the topic itself, `forumPostNumber: 1`, no
`patch` (optional on live entries, and the precedent 08-15/08-22/08-28/09-18 entries carry none).
- **READ FROM THE FORUM JSON**: us.forums topic **2370266**, post 1, created
  2026-10-02T22:37:59.944Z, **still VERSION 1** when fetched — so unlike the 09-18 pass there was
  no forum-versus-mirror divergence to reconcile. Diffed line by line against the Wowhead mirror
  **news=383242** (published 2026-10-02T17:42:56-05:00): zero differences. Staff post 2 of the
  topic is empty.
- This pass sits **OUTSIDE** the 2026-08-12 "Season 2 Class Tuning Plans" roadmap (topic 2335871,
  Aug 25 / Sep 1 / Sep 22 — all three already logged). It applies with each region's weekly
  maintenance on **October 6**, so the entry records the ANNOUNCEMENT; the values are not live.
- Six specs, six consolidated lines. Heading nesting kept INTACT, and it decides one attribution:
  Rogue's three buffs sit under "Rogue › Subtlety › **Trickster**", a hero-talent block NESTED
  INSIDE the Subtlety heading — not the sibling-of-the-spec-blocks shape that forced a class-wide
  Druid line on 09-18 — so they are Subtlety's.
- `classifyHighlight` was RUN on each line rather than assumed: **1 nerf** (Unholy DK — Blightfall
  200% → 100%, with the Augmentation-attribution bug fix as its second clause) and **5 buffs**
  (Devourer, Brewmaster, Mistweaver, Subtlety, Enhancement). **All six specs carry a dated
  `ptr.verdict`**, which outranks the tally, so **no 12.1 outlook direction moved** — only the
  basis line counts.
- **PvP half out of scope (rule 3c).** It is the larger half of this post and **17 specs appear
  THERE AND NOWHERE** in the Classes section (Blood/Frost DK, Havoc/Vengeance DH, Balance/Resto
  Druid, Augmentation, Beast Mastery, Fire/Frost Mage, Windwalker, Retribution, Outlaw, Resto
  Shaman, Demonology, plus class-wide Priest and Warrior) — which is why `specsAffected` is six
  names and not twenty-three. The PvP "Tank Specializations" block touches six tanks' PvP talents
  only. **No line in the Classes section is itself PvP-only**: every "Does not affect PvP combat"
  qualifier there marks an ordinary PvE line, which rule 3c keeps.
- **NO SET BONUS IS TOUCHED** — "set bonus", "-piece", "tier set" and "Venomous Abyss" all appear
  **zero** times in post 1 — so no `spec.tierSet.asOf` advances, the upkeep gate stays quiet and
  no gearing mirror resync was due.

**Discovery, three transports.** Wowhead RSS (HTTP 200, 212,697 B, 40 items, parsed per `<item>`
block and never by tag adjacency); the news INDEX payload `data.news.newsData` (20 posts,
brace-balanced from the `id` attribute — top item **383239** at 2026-10-03 09:00 matches the RSS
top, so nothing landed mid-run); the blue-tracker payload `data.blueTracker.default` (50 entries,
deduped by topic). Nothing else for live 12.1.

**Run-report lane — seen and deliberately NOT logged in the feed** (`PHASES.ptr` is null):
- ⚠️ **"Midnight's 12.1.5 Content Update Arrives October 13"** — us.forums topic **2366152**
  post 1 **v2**, created 2026-09-29T17:00:13.373Z (EU topic 632485 reads **14 October**);
  blue-tracker news 24307306. **This is the announced release date the owner action keys on:
  `LABEL_FLIP_DUE` in `src/normalize.mjs` is still `null` and must be set to it.** `src/` is
  outside this agent's write boundary, so it is reported, not edited — third consecutive night.
  Consequence to know: the `live-patch-label` heartbeat key is a **pipeline** key, red every day
  it persists once `LABEL_FLIP_DUE` passes, and the 19:23 UTC cron means a launch commit landing
  after that day's heartbeat on release day costs a red run.
- The consolidated **12.1.5 Content Update Notes** (topic 2368213 / eu 632922, Wowhead
  news=383206, 2026-10-01T12:00Z) — still run-report only: a `patch-notes` entry must carry
  `patch`, and validation refuses a `patch` newer than the displayed live patch, which is 12.1.
- "Patch 12.1.5 and Forever Class Deep Dives" (This Week in WoW blog, news=383237) — no tuning.
- The whole **WoW: Forever** beta stream (datamined class changes, Warrior/Gnome/Paladin builds,
  level-30 cap notes) is a different product and reaches nothing here.

**Dormant lanes, skipped as designed:** zone-54 PTR raid, zone-52 Dummy Dome, zone-56 PTR M+ and
zone-57 Tidebound Grotto. The 12.1 PTR cycle is closed; their contract rows were removed at the
flip, their stored rows are final receipts, and the agent holds no WCL credentials in any case.

⚠️ **LOG SIZE — measured, not pruned, and here is why.** This file is **215 KB with 58 entries**
against the header's "newest ~20" and the Read tool's **262,144-byte** hard gate: roughly **47 KB
of headroom, four or five nights at tonight's entry size.** `refresh-tiers/log.md` is 178 KB / 55
entries, `refresh-metrics` 130 KB / 22, `watch-creators` 119 KB / 25. A prune was scoped and then
**declined for this run, deliberately**: an automated pass restricted to "nothing new / ledger
clean" headlines carrying no rule-shaped language found only **2 entries / 4.8 KB** safely
removable here and **0** in refresh-tiers, because almost every entry contains at least one
durable-sounding clause. Cutting deeper needs per-entry judgment about whether a fact exists
anywhere else — which is exactly what the 2026-08-15 prune had to do by hand, promoting ~31 KB of
parser traps into SKILL.md first — and a single-shot unattended run is the wrong place to make
twenty of those calls quickly. **Recommended owner/local action before ~2026-10-08:** prune
ptr-watch and refresh-tiers to the newest ~20 entries, checking the removed range for anything not
already in SKILL.md.

## 2026-10-02 (nightly) — **October 1 live hotfix block LOGGED** (Feral fix + Survival Wildfire Bomb +20%); revision ledger v51 → v53, 2 new sections resolved `applied`; 12.1.5 notes + Oct 13 date stay in the run report; ⚠️ `LABEL_FLIP_DUE` still null

**Official revision ledger first (step 0).** Pre-agent `official-notes/evidence.json` +
`pending.json`, `checkedAt 2026-10-02T16:23:30.335Z`.
- `live-hotfixes` topic 2336376 post 1: **v51 → v53**, `updatedAt 2026-10-02T00:02:37.783Z`,
  120 sections, **2 NEW** — `…:2026-10-01:classes:druid:1` (Druid|Feral) and
  `…:2026-10-01:classes:hunter:1` (Hunter|Survival). Section inventory 163 → **165**; the 27
  removed-section tombstones carried forward unchanged; a keyed diff against HEAD shows
  **exactly two ADDED and zero CHANGED/REMOVED**, so no prior disposition was rewritten.
- `ptr-preview` topic 2344395: posts 1 (v3), 4 (v1), 5 (v1), 6 (v1) all at unchanged body
  hashes, 0 added / edited / removed. The notes-only 12.1.5 preview lane therefore publishes
  nothing new this run.
- Both new sections dispositioned **`applied`** with `references` naming the exact stored
  highlights of the new 2026-10-01 feed entry. Section text was read with its heading nesting
  INTACT and independently re-fetched from the topic JSON this run (title now "World of
  Warcraft: Midnight Hotfixes - October 1"); Feral and Survival each sit under their own spec
  heading, so neither attribution is a guess.
- `node src/check-official-notes.mjs --base=HEAD` → "Official-note revisions, section
  dispositions and applied references verified." **0 unresolved.**

**New feed entry (43 → 44), `kind: "hotfix"`, `realm: "live"`, date 2026-10-01.** The October 1
block carries two headings — Classes (Druid›Feral, Hunter›Survival) and Dungeons and Raids (one
Ula'tek Venomous Heart melee fix) — and **no Player versus Player heading**, so rule 3c did not
come into play this time. Cross-checked line for line against the Wowhead mirror
**news=383227** (published 2026-10-01T19:04:45-05:00): the two agree exactly.
- `specsAffected`: Feral Druid, Survival Hunter. Three highlights, one of them `Non-class:`.
- **The Survival +20% is the LIVE LANDING of the already-logged 2026-09-18 announcement, not a
  second buff** — Blizzard's own developers' note says the week-of-September-22 pass "did not
  properly increase the periodic damage of an untalented variant of Wildfire Bomb". The label
  records that framing; Wowhead covered it twice (news=383216 "Survival Hunter Buff to Wildfire
  Bomb Now Live", 22:12Z, plus the round-up) and its **0% single-target / 6.2% AoE figures are
  that outlet's estimates and are deliberately not stored as official values**.
- `classifyHighlight` run on each line rather than assumed: Survival **buff**, the Feral bug fix
  **null**, the non-class line **null**. Both specs' outlooks come from their dated
  `ptr.verdict` (Mixed), so **no direction moved** — only the basis line counts (Survival
  +5/−1 → +6/−1 across 8 → 9 builds; Feral +3/−0 across 7 → 8).
- **NO SET BONUS IS TOUCHED** — "set bonus", "-piece" and "tier set" all appear **zero** times
  in the 885-byte October 1 block — so no `spec.tierSet` date advances, the upkeep gate stays
  quiet and no gearing mirror resync was due.

**Discovery, three transports.** Wowhead RSS (40 items, 201,077 B, parsed per `<item>` block,
never by tag adjacency); the news INDEX payload `data.news.newsData` (20 posts, brace-balanced
from the `id` attribute — top item **383226** at 2026-10-02 09:15 agrees with the RSS top, so
nothing landed mid-run); the blue-tracker payload `data.blueTracker.default` (50 entries, whose
newest WoW-Midnight rows are the Oct 1 hotfix mirrors already handled). Nothing else for live
12.1.

**Seen and deliberately NOT logged (run-report lane).** The consolidated **12.1.5 Content Update
Notes** (us.forums topic 2368213 / eu 632922, blue-tracker 24304162, Wowhead news=383206,
published 2026-10-01T12:00Z) and **"Midnight's 12.1.5 Content Update Arrives October 13"**
(topics 2366152/2366151, blue-tracker 24307306; Wowhead news from 09-29). 12.1.5 is not live, so
consolidated notes cannot enter `ptr-builds.json` as `patch-notes` (the `patch` would exceed the
displayed live patch) and not as a PTR build either while `PHASES.ptr` is null. Also seen: the
large run of "WoW: Forever" beta articles, a different product.

⚠️ **OWNER ACTION STILL OPEN, third run running:** `LABEL_FLIP_DUE` in `src/normalize.mjs` is
still `null` while Blizzard's own notes now confirm **October 13 NA / October 14 EU**. Until an
owner sets it, the `live-patch-label` heartbeat stays inert and the Bloodmallet 12.1.5
wholesale-hold rule has no keying date (it did not engage this run — see refresh-metrics).

**Dormant lanes skipped as specified:** zone 54 (PTR raid), zone 52 (Dummy Dome), zone 56 (PTR
M+) and zone 57 (Tidebound Grotto). Their stored receipts were not read, refreshed or
reinterpreted; no manifest rows exist for them. The 12.1 PTR thread 2317811 was not re-polled
(closed since 2026-07-31; the rediscovery gotcha stays suspended).

## 2026-10-01 (nightly) — **OFFICIAL 12.1.5 PATCH NOTES PUBLISHED (Oct 1)** → run report only, NOT logged in `ptr-builds.json`; revision ledger 0 new / 0 edited / 0 removed sections, 0 unresolved; no new live 12.1 tuning; ⚠️ `LABEL_FLIP_DUE` still null

**Official revision ledger first (step 0).** Read the pre-agent `official-notes/evidence.json` +
`pending.json` (checkedAt 2026-10-01T17:09:51.506Z); no agent fetch of either topic.
- `live-hotfixes` (topic 2336376): post 1 still **v51**, updatedAt 2026-09-30T00:10:48.542Z,
  bodySha256 `2858fb54…`, 118 class sections — byte-identical to the committed ledger.
- `ptr-preview` (topic 2344395): posts 1 (v3), 4 (v1), 5 (v1, 0 sections), 6 (v1) unchanged,
  18 sections, all four bodySha256 values identical to the committed ledger.
- Section diff across both sources: **0 added, 0 edited, 0 removed**; the 27 live-hotfix
  removed-section tombstones carry forward untouched. 163 sections total, **0 unresolved**.
  So the only field that changed in `data/official-notes.json` is each source's `checkedAt`
  (2026-09-30T16:31:54.942Z → 2026-10-01T17:09:51.506Z) — verified by deep-comparing the
  pending ledger against the committed one with `checkedAt` stripped (identical: true).
  `node src/check-official-notes.mjs --base=HEAD` → "Official-note revisions, section
  dispositions and applied references verified."

**Channel sweep.** Wowhead RSS 40 items / 163,797 B, parsed per `<item>` block (never by tag
adjacency); news INDEX page 1 via `data.news.newsData` (20 posts, totalPages 1562, anchored on
the id attribute and brace-balanced); blue tracker via `data.blueTracker.default` (50 entries);
and the 12.1 PTR dev-notes thread `2317811.json`. The index agreed with the RSS top item, so
nothing landed mid-run.

**⚠️ THE NEW THING, AND IT IS DELIBERATELY NOT IN THE FEED.** Blizzard published the
**consolidated 12.1.5 Content Update Notes** on 2026-10-01 at 12:00Z — Blizzard forum topic
**2368213** (US) / 632922 (EU), blue-tracker news mirror 24304162, Wowhead
`news=383206` ("Official 12.1.5 Patch Notes - Class Changes, Labyrinths, Kith'ix Raid",
pubDate Thu 01 Oct 2026 12:02:39 -0500, 20,957-byte `content:encoded` body read in full).
12.1.5 ships **October 13 NA / October 14 EU**, so the displayed live patch is still 12.1 and
the posture block applies verbatim: pre-launch consolidated patch notes go in the run report
and this log, **never** `data/ptr-builds.json` — as `kind: "patch-notes"` they would carry a
`patch` newer than `displayedLivePatch` and red the run, and mislabelling them to "12.1" to
get past validation would publish 12.1.5 material as shipped 12.1 content. They also do not
reach the notes-only preview lane, which reads **only** staff posts in topic 2344395; this is
a standalone topic, exactly as 12.1's own notes (2333514) were. Nothing on the site moved.
What they contain, for the owner: CLASSES — Demon Hunter **Devourer** (Collapsing Star gains
range after the cast starts, loses the 5s cancel cooldown, Fury-drain slow capped at ~1.5
casts; Soulforged Blades 18% was 15%; Voidpurge 2.5s was 2s; talent repositioning; Void-Scarred
rewired so Collapsing Star rather than Void Metamorphosis grants the bonuses — Demonic
Intensity resets The Hunt and empowers it 30%, Violent Transformation resets Soul Immolation
and loses its Hunt reset/damage, Monster Rising Intellect 10% was 15% and Collapsing Star
damage 20% was 15%); Druid **Restoration** (Nature's Bounty redesigned — Regrowth heals up to
3 Rejuvenation'd allies for 15%); Evoker **Augmentation** (Temporality and Temporal Burst
scale with Mastery: Timewalker), **Scalecommander** (Melt Armor +100%), **Preservation**
(Merithra's Blessing 30s was 1 min; Consume Flame no longer double-dips) plus Chronowarden
fixes; Hunter **Marksmanship** (Unload removed, new **Blood Fletching**) plus Dark Ranger and
Survival fixes; Mage Arcane spell-density, Frost/Frostfire Splitting-Ice and Shatter fixes,
Spellslinger Splinterstorm tracking; a Monk Transcendence fix; Priest **Discipline** (Master
the Darkness 30s was 1 min) and **Holy** (Holy Celerity ↔ Ultimate Serenity swap); Rogue
**Outlaw** (Deft Maneuvers now +5 Energy per target hit up to 30, instead of a flat +30) and
**Subtlety** (a broad Shadow-damage modifier correctness pass, "impact … remains under
review") plus Assassination visuals; Shaman Enhancement and **Restoration** (Swelling Tides
extends rather than resets Riptide) fixes; Warrior **Protection** (**Execute damage +30%**,
and Colossus Practiced Strikes now also cuts Execute/Revenge Rage cost by 10). Plus the
single-boss **Unbinding of Kith'ix** raid (Mythic 15–25 flex), the **Labyrinth of Kindo'jan**,
Aqir Invasions, the mid-season refresh (extra weekly Nebulous Voidcore from the week of Oct 6,
Ascendant Venomstones from the week of Oct 20, crest cap lifted), the Keystone Myth 3,600
achievement, and housing/UI/PvP/Prey/warband-reputation sections. **No set-bonus line
anywhere in the notes**, so no `spec.tierSet` edit and the tier-set upkeep gate stays quiet.

**⚠️ OWNER ACTION STILL OPEN (second run in a row).** `LABEL_FLIP_DUE` in `src/normalize.mjs`
is still `null`, and the release date is now confirmed by the official notes themselves, not
just the announcement post. Until it is set to 2026-10-13 the `live-patch-label` heartbeat key
cannot arm, and a launch commit landing after the 19:23Z heartbeat on release day costs a red
run. `PHASES.livePatch` stays null, as it must until the owner's launch commit.

**Also seen, also not logged.** `news=383181` "Kith'ix Raid Boss Music Added on Patch 12.1.5
PTR" (09-29) — a PTR datamine, and while `PHASES.ptr` is null PTR material of any kind is not a
feed entry. `news=383204` "Aidan Moon Confirms Rage Bug for Warriors While Dual Wielding"
(10-01) reads as a Warrior tuning lead but the body is about the **WoW: Forever** beta's
dual-wield spec — a different product, out of scope; the RSS window is now dominated by
Forever beta coverage and none of it is Midnight 12.1.

**Live 12.1 lane: nothing new.** No "Class Tuning Incoming" post and no hotfix round-up since
the September 29 Ula'tek bug fix, which is already feed entry #1
(`kind: "hotfix", realm: "live"`). Blue tracker confirms: the newest Linxy live-hotfix entry
is "World of Warcraft: Midnight Hotfixes - September 29" (topic 2336376, 09-29 19:11Z).
`data/ptr-builds.json` unchanged at 43 entries, newest 2026-09-29.

**12.1 PTR cycle, confirmed closed.** `2317811.json`: 19 posts, `last_posted_at`
2026-07-31T23:42:09.995Z. The thread going quiet is not a lost thread (posture block) — the
12.1.5 preview has its own configured source and opening a 12.2 cycle is an owner action.

**Dormant lanes skipped as specified:** zone 54 (PTR raid), zone 52 (Dummy Dome), zone 56
(PTR M+) and zone 57 (Tidebound Grotto). Their contract rows were removed at the flip, so they
get no manifest row, and the stored zone-52/54/56 receipts in `specs.json` were not touched,
refreshed or relabelled.

## 2026-09-30 (nightly) — **12.1.5 RELEASE DATE ANNOUNCED: October 13 NA / 14 EU** ⚠️ owner must set `LABEL_FLIP_DUE`; Sept 29 live hotfix logged (no class line); dev-notes **post 6** → 8 preview sections resolved, 0 unresolved

- ⚠️⚠️ **OWNER ACTION NOW DUE, and nothing in the pipeline can do it for you.** Blizzard announced on 2026-09-29 that **Patch 12.1.5 releases October 13 (NA) / October 14 (EU), with weekly maintenance** — Wowhead news=383171 "Midnight Patch 12.1.5 Releases on October 13th" (2026/09/29 12:02), mirrored on the blue tracker as topics **2366151 / 2366152** (Blizzard Entertainment / Nethaera, 2026-09-29 12:27) and **632485** ("…Arrives 14 October", EU). `LABEL_FLIP_DUE` in `src/normalize.mjs` is still **null**, so the `live-patch-label` heartbeat key is inert and CLAUDE.md's one-line owner action is unperformed. A nightly agent does not edit code, so this is flagged in the manifest summary, the `blizzard-ptr` row and here. Note the cron interaction CLAUDE.md records: the heartbeat runs 19:23 UTC, `live-patch-label` is a PIPELINE key (red every day it persists), and a launch commit landing after that day's heartbeat on release day costs a red run.
- **Official revision ledger FIRST, as the skill orders.** Both pre-agent sources `status: success`. `live-hotfixes` (topic 2336376) post 1 moved **v49 → v51**, `updatedAt 2026-09-30T00:10:48.542Z`, still **118** class sections; `ptr-preview` (topic 2344395) posts **1 / 4 / 5 / 6** at v3 / v1 / v1 / **v1** with **3 / 7 / 0 / 8** sections. Diffed committed ledger against pending by section id + sha256: **0 hashes changed, 0 ids removed, 8 ids new** — all eight are **post 6**. So the v49→v51 bump on the live compilation added no class section at all, which is exactly right: its new September 29 block has **no Classes and no Player versus Player heading**.
- **8 new sections resolved; 0 unresolved anywhere in the ledger (was 8).** Post 6 re-fetched independently from the topic JSON with heading nesting INTACT and diffed against the Wowhead mirror **news=383180** — they agree exactly, and **no line is struck through** (`[reverted: …]` absent). Seven `CLASSES` sections → `applied` as **12.1.5 notes-only preview**, one per-spec paraphrase covering the full recorded scope: Evoker (Augmentation — Chronowarden Temporality/Temporal Burst now scale with Mastery: Timewalker, Scalecommander Melt Armor +100%; Preservation — Consume Flame no longer double-dips healing increases, two Chronowarden fixes), Hunter (Marksmanship + Survival, all bug fixes), Mage (Frost, three bug fixes), **Monk class-wide** (a bare `MONK` heading with no spec block → attributed to Brewmaster + Mistweaver + Windwalker, the 09-10 Rogue precedent; Transcendence: Transfer no longer usable while silenced with Linked Spirits), Rogue (Assassination + Subtlety — **visual-only**, weapon trails and cast visuals, explicitly no tuning), Shaman (Enhancement Static Accumulation fix; Restoration Riptide now EXTENDS rather than resets through Swelling Tides, plus a Nature's/Ancestral Swiftness Healing Rain fix), Warrior (Protection/Colossus — Practiced Strikes also cuts Execute and Revenge Rage cost by 10, with Blizzard's developers' note, and the post itself says these were already active in last week's PTR build, which is why the 09-03 preview note for the spec already carried the same effect).
  The `PLAYER VERSUS PLAYER` Evoker section → **`irrelevant`**, and the reason says plainly what the judgment rests on: "Merithra's Blessing is now considered an Arcane spell, and can be cast when locked out of Nature" carries **no "in PvP combat" qualifier**, so the exclusion rests on Blizzard's own placement plus what the change does (school lockout is the arena/BG mechanic), and Blizzard filed it under PvP rather than in the same post's `CLASSES` Preservation block. Precedent: the 09-09 and 09-10 PvP Evoker sections were excluded the same way.
  Nothing from post 6 touches `ptr-builds.builds`, `spec.ptr`, tier sets, live ratings or model inputs; **`PHASES.ptr` stays null**. `node src/check-official-notes.mjs --base=HEAD` green.
- **ONE new feed entry LOGGED — `data/ptr-builds.json` 42 → 43 entries, newest 2026-09-29.** The live 12.1 hotfix round of September 29: `kind: "hotfix"`, **`realm: "live"`** (dated on/after `BUILD_REALM_REQUIRED_FROM` 2026-09-26, so the realm is explicit, not a kind default), `forumUrl`/`forumPostNumber` null per the hotfix rule, cited via `wowheadUrl` news=383182 with the canonical topic URL in the label. Read from **topic 2336376 post 1 v51** (title now "…Hotfixes - September 29") and cross-checked line for line against the mirror. **NO class or spec line**: exactly two headings, Dungeons and Raids (The Venomous Abyss → Ula'tek → Mother's Wrath can be cast at a non-target with higher threat that has not passed the forced-swap threshold) and Events (Brewfest → Coren Direbrew drops now set the required level to the receiving player, still tradable). So `specsAffected: []` (the posts #7/#12/#13 precedent) and two `Non-class:` highlights; it reaches no drawer and votes in no outlook tally. Logged for the same reason as the 09-17/18/21 raid entries — raid difficulty is the context the raid bracket's letters are read against.
- **Four channels swept.** (1) **Wowhead RSS**, per `<item>` block: 40 items, newest 2026-09-30 10:00. (2) **News INDEX** polled too because it leads RSS — `data.news.newsData` (brace-balanced from the `id=` attribute) agrees item-for-item. XHR `/search/news` run and **sorted by date** for "12.2 PTR", "Class Tuning", "12.1.5" and "Patch 12.1 Hotfixes": **still NO 12.2 PTR announcement of any kind**; newest Class Tuning article is 2026-09-22 (news=383055, already covered). (3) **Blue tracker**: 50 entries → **43 unique topics**, no new standalone class-tuning post — newest is still 2354340 of 2026-09-21, the feed's 09-18 entry. (4) **Forum JSON** read directly for both configured topics via the SLUG form with `curl -L`; **2344395** `highest_post_number 6` with post 6 created 2026-09-29T20:58:25Z, **2336376** post 1 v51 whose newest date block is "September 29, 2026".
- **NOT logged, deliberately — recorded here and in the run report instead.** `PHASES.ptr` is null and 12.1.5 is an in-season patch, so its material enters no feed entry of any kind or realm, and its consolidated notes would be a `kind: "patch-notes"` entry only once the displayed live patch moves (an owner action): the **release-date announcement** (news=383171 + topics 2366151/2366152/632485 — the headline fact of the night), **"Keystone Myth Requires 3,600 Mythic+ Score in Patch 12.1.5"** (news=383172; it also promises "targeted dungeon tuning adjustments" at 12.1.5, worth knowing before the next M+ letter read), **"Weekly Bonus Rolls Start Next Week - Bonus Rolls and Ascendant Venomstones Unlock Schedule"** (news=383173: an extra Nebulous Voidcore from the week of Oct 7, Ascendant Venomstones from the week of Oct 20, crest cap lifted week of Oct 21 — gearing-lane relevant), and **"Kith'ix Raid Boss Music Added on Patch 12.1.5 PTR"** (news=383181, datamine, no class content). Also noted from the release post for whoever configures the next WCL recipe: the 12.1.5 raid is **single-boss Kith'ix with flexible 15–25 Mythic**, which is the boss the reviewed raid-partition switch is waiting on.
- **No set bonus was touched** anywhere tonight ("set bonus", "-piece", "tier set" absent from the Sept 29 block and from post 6), so no `spec.tierSet.asOf` moved, the tier-set upkeep gate had nothing to catch, and the gearing mirror needed no resync.
- **Dormant WCL PTR zones (54 raid / 52 Dummy Dome / 56 M+ / 57 Grotto) correctly skipped** — no contract rows, no manifest rows; the stored zone-52/54/56 rows in `specs.json` are the closed cycle's final receipts and were left untouched.
- **Writeup coverage recomputed, not remembered:** exactly **one** spec has no `ptr` writeup — Demonology Warlock, the deliberate "the source reported no changes" null. `expertRead` returns null for all 40 specs in both brackets, which is the documented DORMANT state while `PHASES.ptr` is null, not data loss.

## 2026-09-29 (nightly) — 0 new builds; official ledger byte-identical at v49 / **0 unresolved**; still no 12.2 PTR announcement, 12.1.5 still PTR-only

- **Official revision ledger FIRST, as the skill orders.** Both pre-agent sources `status: success`. `live-hotfixes` (topic 2336376) post 1 at **version 49**, `updatedAt 2026-09-25T17:19:59.285Z`, **118** class sections; `ptr-preview` (topic 2344395) posts **1 / 4 / 5** at v3 / v1 / v1 with **3 / 7 / 0** sections. `official-notes/pending.json` is **byte-identical to the committed ledger apart from `checkedAt`** (verified by normalising that one field away), so every section hash matched and every prior resolution carried over: 98 irrelevant + 20 applied on the live source, 10 applied on the preview, 27 removed-section tombstones. **ZERO unresolved sections**, so nothing blocks publication and nothing was distilled. `data/official-notes.json` rewritten only to advance both `checkedAt` values to `2026-09-29T16:39:26.553Z`; `node src/check-official-notes.mjs --base=HEAD` went from "ledger does not match trusted current source revision/section inventory" to green.
- **Four channels swept, nothing new — `data/ptr-builds.json` UNCHANGED (42 entries, newest 2026-09-24).**
  1. **Wowhead RSS**, parsed per `<item>` block (never tag adjacency): 40 items, newest 2026-09-29 10:00. The only 12.1 item in the window is *"More PvP Tuning - Patch 12.1 Hotfixes for September 24th"* (Thu 24 Sep 20:03), already the feed's newest entry. ⚠️ **The RSS window is now ~5 days and roughly 30 of its 40 items are "WoW: Forever" beta coverage** — the feed is no longer a reliable 12.1 discovery lane on its own, which is exactly why steps 2–4 below are not optional.
  2. **News INDEX** polled as well, because it leads RSS: `data.news.newsData` page 1 (brace-balanced from the `id=` attribute) agrees with the feed item-for-item, nothing newer. XHR news SEARCH (`/search/news` with the `X-Requested-With` header) run for "12.1.5", "Patch 12.1 Hotfixes" and "12.2 PTR" and **sorted by date** — the endpoint returns relevance order, so an unsorted read stops at 2026-08-27 and looks like a dead lane. Newest hotfix article **2026-09-24** (news=383108, logged); newest 12.1.5 item **2026-09-22** (news=383054, the achievement-only post; already preview-ledger content); **no 12.2 PTR announcement of any kind.**
  3. **Blue tracker** (`data.blueTracker.default`): 50 entries → **42 unique topics**. Newest class-relevant ones are all already covered — 2336376 "Hotfixes - September 24" (mirrored 09-25), 2344395 12.1.5 dev notes (09-22), 2354340 "Class Tuning Incoming -- September 22" (09-21, the feed's 09-18 entry).
  4. **Forum JSON read directly for all three topics.** ⚠️ **The bare `/t/x/<id>.json` form 301s and yields non-JSON** — use the SLUG form with `curl -L`: `/t/<slug>/<id>.json`. Results: **2317811** (the closed 12.1 dev-notes thread) `last_posted_at 2026-07-31T23:42:09`, highest post #19 — still closed, and per the posture block that silence is not a lost thread; **2344395** `highest_post_number 5`, newest staff post 2026-09-22T21:31; **2336376** post 1 v49, and its cooked body's **newest date block is "September 24, 2026"** (PvP-only movement-speed lines plus a Delves fix), confirming the 09-24 feed entry covers the tip.
- **NOT logged, deliberately — recorded here and in the run report instead.** `PHASES.ptr` is null and 12.1.5 is an in-season patch, not a forecast cycle, so its PTR material enters no feed entry of any kind or realm: the 12.1.5 dev-notes post #5 (2026-09-22, achievement changes — it reaches the site through the notes-only preview lane, and carries 0 class sections anyway) and the two **2026-09-16 "PTR Raid Testing: Heroic / Mythic Kith'ix"** blue posts (topics 2351272 / 2351274). Also out of scope: **"Midnight Season 2 PvP Rating Inflation Increased"** (Linxy, 2026-09-17, topic 2352531) — PvP-only, and this tracker rates PvE.
- **No set bonus was touched** by anything new, so no `spec.tierSet.asOf` moved and the tier-set upkeep gate had nothing to catch; the gearing mirror needed no resync.
- **Dormant WCL PTR zones (54 raid / 52 Dummy Dome / 56 M+ / 57 Grotto) correctly skipped** — their contract rows were removed at the flip, so they get NO manifest row, and the stored zone-52/54/56 rows in `specs.json` are the closed cycle's final receipts and were left untouched.
- **Writeup coverage recomputed rather than remembered:** exactly **one** spec has no `ptr` writeup — Demonology Warlock, whose null is the deliberate "the source reported no changes" case. No writeup was flagged or edited.

## 2026-09-28 (nightly) — 0 new builds; official ledger byte-identical at v49, **0 unresolved**; 12.1 dev-notes thread still closed at post #19; the news feed is now mostly "WoW: Forever" beta

- **Official revision ledger first, as the skill requires — and nothing moved.** Trusted receipts (`official-notes/evidence.json` + `pending.json`, checkedAt 2026-09-28T18:17:06.737Z) report both configured sources `success`: live hotfixes (topic **2336376**) post 1 at **revision 49**, updatedAt 2026-09-25T17:19:59.285Z; 12.1.5 preview (topic **2344395**) posts 1 / 4 / 5 at revisions 3 / 1 / 1 with 3 / 7 / **0** sections. Every post `bodySha256` and every section outline hash matches the committed ledger, so all prior resolutions carried forward — **155 sections + 27 removed-section tombstones, ZERO unresolved, zero new or edited**. `data/official-notes.json` was rewritten from `pending.json` and a strip-and-compare confirms its ONLY diff is the two `checkedAt` stamps. `check-official-notes.mjs` passes. Post 5 (2026-09-22) still carries no class sections, so it creates no obligation.
- **RSS: 40 items, 2026-09-24..09-28, nothing 12.1-class.** Parsed per `<item>` block, never by tag adjacency. The newest Midnight tuning item in the window is the already-logged `news=383108` "More PvP Tuning - Patch 12.1 Hotfixes for September 24th". No Development Notes / Class Tuning / Datamined post for 12.1, and no 12.2 PTR announcement.
- **News INDEX polled too**, because it leads the RSS within a run (the 08-04 lesson): `data.news.newsData` page 1, brace-balanced off the `id` attribute, newest id **383149** at 2026-09-28 11:34 — same picture, nothing 12.1-class.
- **Blue tracker swept for standalone blue posts in other topics** (the Kaivax precedent): `data.blueTracker.default`, 69,690 B, deduped by topic. Newest Midnight class item is Linxy's "World of Warcraft: Midnight Hotfixes - September 24" (topic 2336376 — the compilation the ledger already covers); newest tuning post is "Class Tuning Incoming -- September 22" (topic 2354340), already logged as the 2026-09-18 `realm: "live"` build entry.
- **12.1 development-notes thread 2317811 fetched in full via curl** (HTTP 200, 408,964 B — WebFetch truncates it): last post is **#19, 2026-07-31**. The cycle is closed, as the posture block says; this is not a lost thread.
- **Leads recorded, deliberately NOT logged to `data/ptr-builds.json`:**
  - The feed is now dominated by **"WoW: Forever"** beta coverage, including its own *development notes* (`news=383095`, 2026-09-24) and *class tuning* articles (`news=383092`, 2026-09-24). That is a different product's beta, **not a Midnight 12.2 PTR**, and opening a forecast cycle is an owner action either way. Do not mistake "Beta Development Notes" in a title for our thread.
  - **Midnight Season 3 dungeon-pool preview** (Blizzard news, 2026-09-16, topic 2351172) and "Blizzcon 2026, WoW Forever Beta, Midnight S3" (2026-09-18). S3 is not live; nothing to store.
  - 12.1.5 PTR material (raid testing posts for Kith'ix, PTR hotfix rounds) stays out of the feed entirely while `PHASES.ptr` is null; the notes-only preview lane covers topic 2344395 and nothing else.
- Zone 52 / 54 / 56 / 57 sweeps: **dormant, not attempted** — their contract rows were removed at the flip and the stored rows are the closed cycle's final receipts.
- `npm run test:quiet` 696 / 627 pass / 0 fail / 69 skipped; build 2,070.0 KB; snapshot `data/history/2026-09-28.json` written.

## 2026-09-27 (nightly) — 0 new builds; official ledger unchanged at v49 / 118 sections, **0 unresolved**; 12.1.5 still PTR-only; the RSS window is almost all "WoW: Forever"

- **Official revision ledger first, as the skill requires — and it is byte-identical.** Trusted receipts (`official-notes/evidence.json` + `pending.json`, checkedAt 2026-09-27T15:18:41.706Z) report both configured sources `success`: live hotfixes (topic **2336376**) post 1 **revision 49**, updatedAt 2026-09-25T17:19:59.285Z, 118 class sections; 12.1.5 preview (topic **2344395**) posts 1 / 4 / 5 at revisions 3 / 1 / 1, 3 + 7 + 0 sections. Every post `bodySha256` and every section outline hash matches the committed ledger, so all prior resolutions carried forward — **20 applied / 98 irrelevant live, 10 applied preview, 27 irrelevant removed-section tombstones, ZERO unresolved**. `data/official-notes.json` was rewritten from `pending.json` and its ONLY diff is the two `checkedAt` stamps (verified by a strip-and-compare). `check-official-notes.mjs --base=HEAD` passes.
- **All four discovery channels swept.** (1) Wowhead RSS HTTP 200, 168,912 B, parsed per `<item>` block: 40 items, 2026-09-23 → 09-27. (2) The news INDEX polled too, because it leads the RSS within a run — `data.news.newsData` page 1, newest id 383078 at 09-27 09:00, nothing the RSS lacked. (3) Blue-tracker JSON payload, 50 entries / 34 unique topics: newest class-relevant are the same hotfix compilation (Linxy 09-25 12:20) and "Midnight: 12.1.5 PTR Development Notes" (Linxy 09-22 16:31). (4) The 12.1 PTR thread 2317811 as Discourse JSON, 407,497 B: 13 posts, highest 19, last posted **2026-07-31** — a finished cycle, not a lost thread (rediscovery stays suspended).
- **Nothing new to log.** The only live 12.1 tuning in the window is news=383108 (Sept 24 hotfixes) and news=383075 (Sept 23 hotfixes), and **both are already feed entries** dated 09-24 and 09-23. No set bonus was touched, so the tier-set upkeep gate has nothing to chase; no `spec.ptr` writeup changed.
- ⚠️ **The RSS window is now dominated by "WoW: Forever", and it is NOT ours.** Three of its items look exactly like tracker material by title — "…Forever Beta Development Notes" (383095), "Wrath, Lava Burst and Holy Strike Buffs - …Class Tuning Changes" (383092), "Gnome Racial Heavily Nerfed…" (383093). Their BODIES settle it: Season of Discovery runes, Dire Bear Form, Campfire buffs, Pet Happiness, rune engraving, and **zero mentions of Midnight or 12.1**. It is a Classic-family product with its own beta, no configured forecast cycle, and no place in `ptr-builds.json` in any kind or realm. Expect to re-decide this every night while the beta runs; decide it on the body, never the title.
- **12.1.5 remains a notes-only preview and PTR-only.** Independent corroboration from tonight's tier fetches: every Wowhead page's data tree lists **live 12.1.0 against PTR 12.1.5**. No new 12.1.5 PTR build, PTR hotfix round or consolidated patch notes appeared this window; had one, it would go here and in the run report, never into the feed while `PHASES.ptr` is null. `PHASES`, `livePatch` (null), `LABEL_FLIP_DUE` (null) all untouched.
- **No 12.2 announcement.** Nothing in RSS, the index or the blue tracker opens a new cycle. The closest adjacent signals are Blizzard's Season 3 dungeon-pool preview (09-16) and the Kith'ix PTR raid-testing notices (09-16) — both already in the record, neither a cycle opener, which is an owner action.
- One spec-adjacent article was read and correctly yielded nothing: "Spiteful Soulcoiler Clarification on Mythic Coiled Altar" (383070) is an encounter-mechanic clarification whose only change is Blizzard editing an older hotfix line — already inside the ledger's unchanged v49 body.

## 2026-09-26 (nightly) — 0 new builds; the official ledger unchanged at v49/118 sections; no 12.2, 12.1.5 still PTR-only

- **Official revision ledger — nothing moved.** The trusted pre-agent receipts (`official-notes/evidence.json`, checkedAt 14:44:55.867Z) have both sources `success`: live-hotfixes topic 2336376 post 1 at **v49 / 118 sections**, ptr-preview topic 2344395 posts 1 (v3) / 4 (v1) / 5 (v1) / **10 sections**. Every post `bodySha256` and every section `sha256` matches the committed ledger, so the pending ledger raised **0 new, 0 changed, 0 removed** sections, every prior resolution carried by hash match, and the 27 removal tombstones are preserved. Only `checkedAt` advanced in `data/official-notes.json`; `check-official-notes --base=HEAD` passes with **0 unresolved**. (Post 1's v49 content — the September 24 PvP block — was reviewed by the 2026-09-26T02:06Z local run in `38dc0fe`, which is why a v47→v49 jump arrives with nothing outstanding.)
- **RSS + index + blue tracker: no new class tuning.** Wowhead RSS 200, 164,908 B, 40 items per `<item>` block, window 09-23..09-26; the news index (`data.news.newsData`, 20 posts, totalPages 1560) agrees and led it by nothing today; the blue tracker (`data.blueTracker.default`, 50 entries / **42 unique topics**) has no new Linxy tuning post — its newest are the same September 24 hotfix compilation (US 2336376 / EU 625785) and the September 22 12.1.5 PTR dev notes. `ptr-builds.json` therefore stays at **42 entries, newest 2026-09-24**. No set bonus touched anywhere ⇒ no `tierSet.asOf` bump and no gearing resync.
- **The window is dominated by a different game version.** 33 of the 40 RSS items are WoW: Forever beta / Classic coverage (including a "WoW: Forever Beta Class Tuning Changes" article and Development Notes for that beta). Those are NOT Midnight 12.1 tuning and must not reach this feed — the same class of trap as the blue tracker's patch tag, from the product side rather than the patch side.
- **Closed cycle confirmed again.** The 12.1 dev-notes thread 2317811 fetched in full (72,526 B, 13 posts, highest_post_number 19), still quiet at 2026-07-31. `PHASES.ptr` stays null, the 12.1.5 lane stays notes-only, and the WCL PTR zones 52/54/56/57 were not swept (contract rows removed at the flip).
- **Owner leads, not acted on:** Blizzard's 12.1.5 **Kith'ix PTR raid testing** posts (Heroic 10-30 and Mythic 15-25, blue tracker 09-16) and the **"Midnight Season 3 Dungeon Pool Preview"** (09-16). Both are cycle-opening events needing an owner configuration change, and the Kith'ix testing is the same evidence the WCL raid partition switch waits on.
- Log hygiene: this file holds **51 entries** against the header's "newest ~20". Pruning is genuinely due across all four logs (watch-creators is now ~227 KB against the Read tool's 262,144-byte gate), but an unattended nightly is the wrong place to delete narrative that may hold the only copy of a rule, so nothing was pruned tonight — flagging it for a reviewed prune-after-promotion pass.

## 2026-09-26 (local, UTC date; branch `claude/1215-notes-strike`) — receipt parser now marks struck text `[reverted: …]`; **4 ledger obligations resolved** (the reopened 12.1.5 Protection Warrior section re-resolved `applied`, 3 new Sept 24 PvP sections `irrelevant`); no feed entry, no tier set touched

- **Why a preview section reopened.** `textOf` in `src/official-notes.mjs` flattened `<s>` / `<del>` / `<strike>` into plain section text, so the 2026-09-16 review of 12.1.5 post 4 (topic 2344395, v1) published two WITHDRAWN Protection Execute lines as current. Struck text now arrives as `[reverted: …]` in the hashed line text only; headings (date, category, class, spec) still match on the unmarked text, so no section id or spec scope moves. Replaying one live fetch through both parsers: **1 of 128** section hashes changed (`2344395:4:2026-09-15:classes:warrior:1`). The live compilation carries **0** strike elements; post 4 holds the only **2**.
- **Receipts** (re-fetched 2026-09-26T02:06:41Z): `live-hotfixes` post 1 moved **v47 → v49** (updated 2026-09-25T17:19:59.285Z), **115 → 118** sections; `ptr-preview` posts 1 (v3) / 4 (v1) / 5 (v1), 10 sections, none edited. Against master's ledger, `pendingLedger` raised exactly these four obligations and **0** tombstones.
- **Protection Warrior (post 4) re-resolved `applied`** from the receipt text: of the post's three Execute lines, "no longer consumes additional Rage for additional damage" and "damage increased by 100%" are struck as reverted, and only "damage increased by 30%" stands; further Protection changes move to 12.2 / 13.0. The summary is scoped to post 4's own lines, because the September 3 Colossus Practiced Strikes change (post 1) is neither struck nor mentioned there. Post 1's section hash did not change, so its 09-03 preview still renders first in the drawer, unqualified; whether to annotate or reorder it is an OWNER question, not something this run changed.
- **The three 2026-09-24 Player versus Player sections (Hunter / Mage / Paladin) resolved `irrelevant`** (rule 3c): the US compilation now carries the block the 09-25 nightly read from the EU mirror; every line is written "in PvP combat" (Arcane's Chrono Shift is also a PvP Talent), and matches the existing 2026-09-24 feed entry. No new feed entry.
- Not a full sweep: RSS, the blue tracker and the dev-notes thread were not polled. `node src/check-official-notes.mjs --base=HEAD` passes on the fresh receipt; ledger now live 20 applied / 98 irrelevant, preview 10 applied, **0 unresolved**.

## 2026-09-25 (nightly) — ledger byte-identical to the committed one (**0 new / 0 changed / 0 removed sections**); one new `kind: "hotfix"` feed entry for Sept 24, read from the EU mirror because the CONFIGURED US topic has not carried the block yet

- **Revision ledger first.** Trusted pre-agent receipts (`official-notes/evidence.json` + `pending.json`, checkedAt 2026-09-25T15:32:41.989Z), both sources `success`. `live-hotfixes` topic 2336376 post 1 still at **v47**, updated 2026-09-24T00:12:25.841Z, **115** sections; `ptr-preview` topic 2344395 posts 1 (v3) / 4 (v1) / 5 (v1), **10** sections. `pendingLedger` raised **0 unresolved**, **0 tombstones**: every section retained its prior resolution by hash match, and the pending ledger diffed against `data/official-notes.json` is identical once `checkedAt` is aligned. So the only edit to that file is the two `checkedAt` stamps. `node src/check-official-notes.mjs --base=HEAD` passes.
- ⚠️ **The September 24 hotfix block exists, and the configured source does not have it.** The US compilation topic 2336376 was independently re-fetched this run (263,334 B) and reproduces the receipt exactly — title still "World of Warcraft: Midnight Hotfixes - September 23", post 1 v47, same `updated_at`, newest block 2026-09-23. The blue tracker shows Linxy posting "World of Warcraft: Midnight Hotfixes - 24 September" at 2026-09-24 19:19 on **eu.forums topic 625785**, the EU mirror of the same Kaivax running post. That mirror was fetched (333,805 B, post 1 **v49**, edited 2026-09-25T00:19:06.954Z) and read with heading nesting INTACT, then cross-checked line for line against the Wowhead round-up news=383108 (published 2026-09-25T01:03:59Z). The two agree. Because the ledger's configured source has not carried it, **no obligation is owed this run** — it will be raised when Blizzard updates the US post, and the feed entry is already on file by then.
- **Feed: one new entry, `kind: "hotfix"`, 2026-09-24** (41 → 42 builds), `specsAffected: []` (the posts #7/#12/#13 precedent), two highlights. Content is one Delves fix (Shadow Enclave "Infiltrate and Ameliorate", Oddball "Ingredient" teleporting out of the pit) and a **Player versus Player movement-speed pass that is PvP-only in every line** — Hunter Wing Clip 40% and Improved Snaring +10% "in PvP combat", Mage Arcane Chrono Shift **(PvP Talent)** 30% (was 50%), Paladin Consecrated Ground 20% (was 50%) — with a developers' note calling it "more adjustments to our prior changes to movement speed reduction effects". Rule 3c: logged with the `PvP only (out of scope …)` prefix so it deliberately fails the `Spec Class ` match, reaches no drawer and cannot vote in the PvE outlook tally. `forumUrl`/`forumPostNumber` null with the Wowhead mirror in `wowheadUrl`, per the hotfix precedent; the EU citation sits in the label.
- **"set bonus", "-piece" and "tier set" appear zero times in the September 24 block** ⇒ no `spec.tierSet.asOf` advances and no gearing mirror resync was needed.
- **RSS** `/news/rss/all` HTTP 200, 185,110 B, 40 items parsed per `<item>` block (never by tag adjacency). **News index** polled as well (`data.news.newsData`, anchored on the id attribute and brace-balanced: 20 posts, totalPages 1559) and it agrees — the only in-scope item above the watermark is news=383108. **Blue tracker** (`data.blueTracker.default`, deduped by topic): 50 entries / 42 unique topics; the one new relevant entry is the 24 September hotfix pair above.
- **Dev-notes thread 2317811** fetched in full by curl (408,996 B): 17 posts, `highest_post_number` 19, newest staff post 2026-07-31 (edited 08-01). Quiet since the cycle closed — expected, not a lost thread.
- **Writeups:** exactly **one** spec is still `ptr: null` — Demonology Warlock, whose null is deliberate (the source reported no changes). Nothing to fill.
- **Dormant lanes untouched:** the closed 12.1 PTR WCL zones 52 / 54 / 56 / 57 were not swept and have no contract rows; Robydoby's zone-54 sheets likewise were not re-parsed, since re-reading closed-cycle data in a live refresh is exactly what the contract forbids.
- **Leads recorded, NOT acted on** (opening a forecast cycle is an OWNER action — new `PHASES.ptr`, thread key, contract rows, zone probe): Blizzard's 12.1.5 **Kith'ix** raid-testing posts and the **"Midnight Season 3 Dungeon Pool Preview"** (blue posts 2026-09-16). Worth noting alongside them that the WCL collector's zone-53 raid bracket came back `invalid` on "zone identity/season/encounter metadata differs from reviewed configuration" — the raid recipe looks like it is being moved under us by the same S3 work. `PHASES.ptr` stays null; the 12.1.5 lane stays notes-only.

## 2026-09-24 (nightly) — Sept 23 hotfix block: **2 new ledger obligations, both applied, 0 unresolved**; one new `kind: "hotfix"` feed entry; no set bonus touched

- **Official revision ledger.** `official-notes/evidence.json` (checkedAt 15:30:09Z) has both sources `success`. live-hotfixes topic 2336376 post 1 moved **v44 -> v47** (updated 2026-09-24T00:12:25.841Z), 115 sections. `pendingLedger` raised exactly **two** unresolved sections, both dated 2026-09-23 and both Classes: `…:classes:death-knight:1` (Unholy) and `…:classes:monk:1` (Windwalker). No tombstones this time (the 27 stay as committed). The canonical topic JSON was independently re-fetched this run — title “World of Warcraft: Midnight Hotfixes - September 23”, post 1 v47, same updated_at — and the two blocks read identically with their heading nesting intact.
- **Both → `applied`, against a NEW 2026-09-23 feed entry.** Unlike the 09-22 batch, these lines are not restatements of an earlier announcement: they appear only in this compilation, so `buildRefCovers` is satisfied by an entry citing topic 2336376.
  - **Unholy Death Knight** — “Resolved an issue with Blightfall doing less damage as more time passes since the plague was applied.” A bug fix restoring the intended behaviour of the 09-18 Blightfall tuning. Wowhead (news=383075) computes “12% single target / 6% AoE from this bug fix alone, 15% / 7% compared to last week”; those are **that outlet’s derived estimates** and were deliberately NOT written into the highlight as official values.
  - **Windwalker Monk** — “Fixed an issue that caused PvP adjustments to Windwalker’s Celestial Conduit and Flurry Strikes to apply in PvE as well.” ⚠️ This names PvP but is **IN PvE scope**: rule 3c excludes changes that only alter PvP COMBAT, and this one stops PvP adjustments leaking into PvE, so its whole effect is on PvE Windwalker. Filing it PvP-only would have dropped a real PvE change.
  - Both lines state no tuning value, so `classifyHighlight` returns **null** for each and neither casts an outlook vote. That is the honest outcome, not a gap.
- **`"set bonus"`, `"-piece"` and `"tier set"` appear zero times in the September 23 block** ⇒ no `spec.tierSet` date advances, and no gearing mirror resync was needed.
- **Feed:** one entry, `kind: "hotfix"`, 2026-09-23, `specsAffected: ["Unholy Death Knight","Windwalker Monk"]`, three highlights (the two spec lines plus the non-class Delves/Valeera fix). `forumUrl`/`forumPostNumber` null with the Wowhead mirror in `wowheadUrl`, per the hotfix precedent. `check-official-notes --base=HEAD` passes with 0 unresolved.
- **ptr-preview topic 2344395** unchanged at posts 1/4/5; post 5 still inventories **zero class sections**, so the 12.1.5 notes-only lane owes nothing. `PHASES.ptr` stays null, nothing entered ptr-builds or any `ptr` verdict, no forecast reopened, no archived 12.1 PTR metric relabelled.
- **RSS:** `wowhead.com/news/rss/all` HTTP 200, 162,827 B, 40 items parsed per `<item>` block. The only new tuning item is news=383075 (2026-09-24T00:24:51Z); everything else above the watermark is WoW: Forever or Brewfest. **News index polled as well** (`data.news.newsData`, 20 posts, totalPages 1558) and it agrees with the RSS — nothing landed mid-run.
- **Blue tracker** parsed from `data.blueTracker.default` (brace-balanced from the id attribute): 50 entries / 42 unique topics. No standalone class-tuning blue post beyond the hotfix topic itself.
- **Dormant lanes untouched:** closed 12.1 PTR WCL zones 52/54/56/57 not swept, no contract rows. Blizzard’s 12.1.5 Kith’ix raid testing posts are still a 12.2-cycle-shaped event; opening a forecast cycle remains an OWNER action.
## 2026-09-23 (nightly) — the Sept 22 tuning went LIVE: **50 ledger obligations (23 new sections + 27 tombstones), all dispositioned, 0 unresolved**; one non-class hotfix entry logged; no class line restated

- **Official revision ledger — the big one.** `official-notes/evidence.json` (checkedAt 15:11:48Z) has both sources `success`. live-hotfixes topic 2336376 post 1 jumped **v42 → v44** (updated 2026-09-22T23:24:01Z), 117 → 113 sections. `pendingLedger` raised **23 new sections dated 2026-09-22 and 27 removed-section tombstones**. Independently fetched the topic JSON and the body sha256 `ca0844b2…` reproduced BYTE-FOR-BYTE against the trusted receipt, so the receipt and the live post are the same document.
- **The 11 Classes sections → `irrelevant` (already covered), not `applied`.** Every line was diffed against the stored 2026-09-18 announcement entry (“Class Tuning Incoming -- September 22”, topic 2354340) and matches at the same values, **including the v3 amendments** — Blood DK Death Strike +15%, Vengeance Reaver’s Glaive +25%, both Warrior Mountain Thane lines carrying “Does not apply to PvP combat”. Applying them would count the same tuning twice in the feed and in the outlook tally; this is the **2026-08-15/2026-08-18 precedent already in this ledger** (scheduled tuning announced in its own topic, landing later in the compilation). Mechanically it could not be `applied` anyway: `buildRefCovers` requires the referenced entry to cite THIS topic, and the 09-18 entry cites 2354340.
  - ⚠️ Two sections carry a spec scope wider than their content and the reasons say so: **Mage** lists Arcane and **Warrior** lists Arms only because each block opens with a class-level developers’ note, which makes `sectionsForPost` mark it class-wide. Neither spec has a line. **Druid** lists all four for the same reason (a bare `Hero Talents › Wildstalker` sibling block), and there the class-wide attribution is genuinely correct.
- **The 12 Player versus Player sections → `irrelevant` (rule 3c).** Read in full; every line is written “in PvP combat”. Two traps handled explicitly: Retribution’s **“Hammer of Light damage increased by 20%”** carries no PvP qualifier of its own but sits under the PvP heading with a developers’ note saying it raises Templar “also in PvP” — the PvE change is the separate **+50%** already in the 09-18 entry, so reading it as PvE would both double-count and misstate the value; and Priest’s class-wide **Mindgames +50%** is a PvP talent inside the PvP block (the 09-18 entry recorded the same exclusion).
- **The 27 tombstones → `irrelevant`, preserved.** Blizzard trimmed the 2026-08-13..08-18 blocks between v42 and v44 (confirmed against the live post, which no longer contains them). All 27 had already been excluded — 12 as covered by the 08-15/08-18 feed entries, 15 as pre-2026-09-04 historical baseline — so nothing was ever applied from them and no retained tracker fact depends on them. Reasons distinguish the two groups. `check-official-notes --base=HEAD` passes.
- **ptr-preview topic 2344395 gained post 5** (2026-09-22T21:31Z, 411 bytes): an **Achievements-only** note (Snake Eyes / Snake Eater / Good Night, Sweet Prince no longer required for Glory of the Wartorn Hero). **Zero class sections**, so no preview note is owed. The 12.1.5 lane stayed notes-only: `PHASES` untouched, nothing written into ptr-builds or any `ptr` verdict, no forecast reopened, no archived 12.1 PTR metric relabelled.
- **Feed: ONE new entry, `kind: "hotfix"`, dated 2026-09-22**, from Wowhead news=383055 “Class and Trinket Tuning Now Live”. It carries **only the genuinely new non-class content** — the Altar of Fangs (Blade of the Altar’s Laced Edge) and Temple of Sethraliss (Shrouded Fang’s Slither Strike) crowd-control fixes, plus the Housing jetpack line — with `specsAffected: []` (posts #7/#12/#13 precedent). The post’s Classes block is the 09-18 tuning and its Items block is the 09-15 trinket tuning, **both already logged from their own announcements and verified line-for-line identical**, so restating either would double-count. `"set bonus"`, `"-piece"` and `"tier set"` appear **zero** times in the post ⇒ no `spec.tierSet` date advances.
- **RSS:** 40 items parsed per `<item>` block (170,157 B), newest 2026-09-23T15:00Z. Only one new in-scope item, the one above. Wowhead’s own “Expected DPS Changes with September 22nd Class Tuning” (news=383037) is site analysis, not an official source, and was not logged.
- **Threads:** dev-notes 2317811 still quiet at 19 staff posts, newest 2026-07-31 — expected, the cycle is closed, not a lost thread. Blue tracker parsed from `data.blueTracker.default` (brace-balanced from the id attribute): 50 entries / 42 unique topics, no standalone class-tuning blue post beyond the two topics handled.
- **Dormant lanes untouched:** the closed 12.1 PTR WCL zones 52/54/56/57 were not swept and have no contract rows. Note for the record that Blizzard is running **12.1.5 Kith’ix raid testing** (blue posts 2026-09-16) — that is a 12.2-cycle-shaped event and starting a forecast cycle remains an OWNER action.

## 2026-09-22 (nightly) — ledger byte-identical to the committed one (**0 new / 0 changed / 0 removed sections**); all four tuning channels swept, nothing new; the Sept 22 tuning post re-verified at **v3** and NOT re-logged

- **Revision ledger first.** Trusted pre-agent receipts (`official-notes/evidence.json` + `pending.json`, checkedAt 15:10:14Z). `live-hotfixes` topic 2336376 post 1 at **v42**, updated 2026-09-22T00:51:27Z, `bodySha256 b25facd0…`, **117** class sections; `ptr-preview` topic 2344395 posts 1 (v3) and 4 (v1), 10 sections. Diffed section-by-section against `data/official-notes.json`: **0 new, 0 changed, 0 removed, 0 unresolved tombstones** — every section retained its prior resolution by hash match (18 applied + 99 irrelevant live, 10 applied preview). The 09-21 local run had already reconciled v42, so **only `checkedAt` advanced**. `node src/check-official-notes.mjs --base=HEAD` passes.
- **Wowhead news RSS** (`/news/rss/all`), 200, 160,547 B, parsed per `<item>` block (never by tag adjacency): 40 items, `content:encoded` on all 40, newest 2026-09-22 10:00 −0500, window back to 09-17. **News index** (`data.news.newsData`, anchored on the id attribute and brace-balanced): 20 posts, newest `news=383012` 09-22 10:00 AM — agrees with the RSS. **Blue tracker** (`data.blueTracker.default`, deduped by topic): 50 entries; newest class-relevant are Linxy's "Midnight Hotfixes - September 21" (topic 2336376 — the ledger source) and his 09-21 14:42 edit announcement on topic 2354340. Nothing unlogged in any of the three.
- ⚠️ **The Sept 22 tuning post was re-fetched and is at VERSION 3 — the version the 09-21 local run already folded in.** `topic 2354340` post 1, updated 2026-09-21T19:37:16Z. All 24 stored highlights re-diffed line by line against the live v3 text with heading nesting intact: Blood DK Death Strike **+15%**, Vengeance DH Reaver's Glaive **+25%**, both Warrior Mountain Thane lines carrying "Does not apply to PvP combat" — all match, so nothing was rewritten. **No second entry was created and no "now live" duplicate was added** even though the values apply with today's maintenance: edits fold into the existing 09-18 entry so the outlook tally never counts a restated line twice, and the entry correctly still records the ANNOUNCEMENT. Wowhead's mirror of the edit (`news=383035`) agrees.
- **Official dev-notes thread `2317811.json`** fetched in full by curl (408,497 B): 13 posts, `highest_post_number` 19, newest staff post 2026-07-31 (edited 08-01). Quiet since the 12.1 cycle closed — expected, not a lost thread. **No 12.2 PTR announcement**, so `PHASES.ptr` stays null.
- **Dormant lanes untouched:** WCL PTR zones 52 / 54 / 56 / 57 were not probed (their contract rows were removed at the flip; stored rows are the closed cycle's final receipts).
- **Observed and deliberately out of scope:** 12.1.5 PTR raid-testing announcements for Kith'ix (Heroic 10-30 and Mythic 15-25, 2026-09-16, topics 2351272 / 2351274). Opening a new forecast cycle is an OWNER action — new `PHASES.ptr` entry, thread key, contract rows, zone probe — never an agent-side edit, and the 12.1.5 lane stays notes-only.
- **No set bonus touched anywhere**, so no `spec.tierSet.asOf` moved and the tier-set upkeep gate (and its gearing mirror) is untouched. `data/ptr-builds.json` unchanged at 39 builds, head 2026-09-21.

## 2026-09-21 (local, scheduled, ~2.5 h after the nightly) — ledger re-fetched and **one new class section**: the Sept 21 hotfix batch (Evoker Unravel fixes + Ula'tek nerf) logged as a hotfix entry; the Sept 22 tuning announcement was **edited by Blizzard to v3** and its three changed lines were folded into the existing 09-18 entry; no 12.2 PTR

- **Revision ledger first.** Ran `node src/fetch-official-notes.mjs` locally (02:09:55Z Sept 22 UTC; the local `official-notes/` receipts are this run's own — the nightly's trusted artifact is not on this machine). `live-hotfixes` post 1 moved **v40 → v42** (updated 2026-09-22T00:51:27Z, 117 sections against 116) and the pending ledger carried exactly **one unresolved section**: `2336376:1:2026-09-21:classes:evoker:1`, a bare Evoker heading with two Unravel/Fire Breath behaviour fixes (Tip the Scales activation; not hitting every Fire Breath target). No spec block, no tuning value, no set bonus. `ptr-preview` posts 1 v3 / 4 v1 unchanged, 0 changed / 0 removed sections anywhere. The nightly (checkedAt 16:35Z) genuinely could not have seen this — the block landed ~8 h after it.
- **Logged as a new `kind: "hotfix"` entry dated 2026-09-21** (feed now 39 builds, head 2026-09-21): `Evoker (class-wide)` in specsAffected with one consolidated highlight (the 09-10 Rogue class-wide precedent; the coverage gate is satisfied by build membership for all three Evoker specs), plus a Non-class line for the raid/dungeon block. Cross-checked line for line against the Wowhead mirror `news=383042` (00:56Z): the mirror **dropped the "[With weekly restarts]" qualifier** on the two Ula'tek tuning lines (Stone Venom −40% on all difficulties; Boiling Venom on Mythic now an Important Aura) — the forum wording is the one stored, so the entry says those apply from the Sept 22 maintenance, not immediately. Ledger section resolved `applied` with a reference to the exact stored highlight; `node src/check-official-notes.mjs --base=HEAD` passes.
- **The Sept 22 tuning post was EDITED, and the feed entry was amended in place (the 08-15 precedent, so the outlook tally never counts a restated line twice).** Topic 2354340 post 1 is now **v3** (edited 2026-09-21T19:37:16Z; the stored entry was read at v2) and Linxy announced the diff in reply **#107** (19:42:03Z, "Made the following changes to the original post"), mirrored by Wowhead `news=383035` (20:38Z). Read from the forum JSON with nesting intact — the revision endpoint is 403 to the public, so v2 vs v3 was diffed against the stored highlights plus post #107's list. Three PvE changes, all folded into the 09-18 entry's highlights with a dated AMENDED note in its label: **Blood DK Death Strike +15% (was +25%)** — Blizzard's note says 25% overshot in cleave priority damage and 15% is "still a buff in single target but … closer to neutral in cleave"; **Vengeance DH Reaver's Glaive +25% (was +30%)** — Havoc's 25% unchanged; and both **Warrior Mountain Thane** lines (Fury + Protection, Lightning Strike / Ground Current +50%) gained "Does not apply to PvP combat", now written "(both PvE only)". Every other line re-diffed and unchanged. Blood DK's consolidated line stays MIXED under classifyHighlight, so **0 outlook directions move**. The values are still not live (Tuesday's reset).
- **RSS** `/news/rss/all` HTTP 200, 160,478 B, 40 items parsed per `<item>` block. Two class-relevant items since the nightly's head, both handled above (`383035` tuning update, `383042` hotfix round-up). Everything else is WoW: Forever beta coverage, Brewfest, interviews, a retracted XP article. **Zero "12.2 PTR" titles**; the "BlizzCon 2026 … Midnight S3" weekly roundup is not a PTR announcement. `PHASES.ptr` stays null; dormant WCL zones skipped by design.
- Verification and push details are in the watch-creators entry for this run (shared commit).

## 2026-09-21 (nightly) — ledger clean, three channels swept, **nothing new**; feed head still 2026-09-18

- **Revision ledger FIRST, per the 2026-09-05 procedure.** Read this run's trusted pre-agent receipts (`official-notes/evidence.json` + `pending.json`, checkedAt 16:35:41Z). Both sources fetched successfully: **live-hotfixes** topic 2336376 post 1 at **version 40**, updated 2026-09-17T23:29:35Z, `bodySha256 f062b3a6…`, **116** class sections; **ptr-preview** (12.1.5) topic 2344395 posts 1 (v3, 2026-09-03) and 4 (v1, 2026-09-15T23:09:31Z), **10** sections. Every post version, body hash and section hash is byte-identical to the committed ledger, so every section retained its prior resolution by hash match — **17 applied + 99 irrelevant** on the live feed, **10 applied** on the preview, **0 unresolved**, 0 tombstones. No section was new or edited ⇒ no new obligation; only `checkedAt` advanced in `data/official-notes.json`. `check-official-notes --base=HEAD` passes.
- **Wowhead news RSS**: HTTP 200, 153,869 B, parsed per `<item>` block (never by tag adjacency). 40 items, newest 2026-09-21T15:00Z, window back to 2026-09-17T15:30Z. No 12.1 class-tuning / hotfix-roundup / datamined-tuning article newer than the 2026-09-18 pair already logged.
- **News INDEX** (it leads the RSS within a run, so RSS alone is not sufficient): `data.news.newsData` anchored on the id attribute and brace-balanced — 20 posts, newest `news=383002` at 2026-09-21 10:00 AM. Agrees with the RSS; nothing newer.
- **Blue tracker** (the standalone-blue-post channel a thread poll can never surface): `data.blueTracker.default` parsed the same way and deduped by topic. Newest class-relevant topic is still Linxy's **"Class Tuning Incoming -- September 22"** (us topic 2354340) at 2026-09-18 18:48 — already logged. Also present and correctly NOT feed material: *Midnight Season 2 PvP Rating Inflation Increased* (PvP, out of scope) and the 12.1.5 PTR raid-testing notices for Kith'ix.
- **Official dev-notes thread** `2317811.json` fetched in full via curl (409,321 B): 17 posts, `highest_post_number` 19, newest Linxy post 2026-07-31 edited 2026-08-01. Quiet since the 12.1 cycle closed — expected, NOT a lost thread, and the rediscovery gotcha stays suspended. No 12.2 announcement, so `PHASES.ptr` stays null and every dormant WCL PTR zone lane (52/54/56/57) was skipped rather than marked unreachable.
- **Re-checked topic 2354340 for a silent edit** (a post can change without a new date or reply — the whole reason the ledger exists). Post 1 is still at **version 2** (created 23:03:10Z, edited 23:48:08Z), the exact version the committed build entry records reading, so its 24 highlights and 24-entry `specsAffected` stand unchanged. The values apply with tomorrow's weekly maintenance; the entry correctly remains an ANNOUNCEMENT.
- **No set bonus touched anywhere**, so no `spec.tierSet.asOf` moved and the tier-set upkeep gate (tracker + gearing mirror) is untouched. `data/ptr-builds.json` unchanged at its 2026-09-18 head, 38 builds.


## 2026-09-20 (local, scheduled, 1.5 h after the nightly) — verify-only: ledger re-fetched and identical, RSS + blue tracker re-read, **nothing newer than the nightly's sweep**; no new build/hotfix, no 12.2 PTR

- **Revision ledger first.** Ran `node src/fetch-official-notes.mjs` locally (16:03Z; the local `official-notes/` receipts are this run's own, not the nightly's trusted artifact): `live-hotfixes` post 1 still **v40** (updated 2026-09-17T23:29:35Z, 116 sections), `ptr-preview` posts 1 v3 / 4 v1 (3 + 7 sections). The pending ledger is **byte-identical to the committed `data/official-notes.json` apart from the two `checkedAt` stamps** — 0 added / 0 changed / 0 removed, 0 unresolved. Left the committed file untouched (the 09-19 local precedent: the nightly's 14:22Z check is the trusted one and nothing moved in the 100 minutes since).
- **RSS** `/news/rss/all` HTTP 200, 177,501 B, 40 items parsed per `<item>` block: exactly one item newer than the nightly's 09:00 −0500 head — *Faction Conflict & Heroic World Tier in The Last Titan* (Windows Central interview, 10:00), no class content. The only tuning items remain the 09-18 Sept-22 tuning mirror and the Ula'tek hotfix, both logged. Zero "12.2 PTR" titles. **Blue tracker** re-read too (plain `fetch` is Cloudflare-403 on `/blue-tracker` and `/news`; a curl with the full browser header set returns 200 / 69 KB, `data.blueTracker.default` brace-balanced, 50 entries): newest class-relevant Linxy post is still *Class Tuning Incoming -- September 22* (topic 2354340, 09-18 18:48); everything after it is Brewfest and Pirate's Day.
- `data/ptr-builds.json` unchanged at 38 builds, head 2026-09-18; `PHASES.ptr` null; dormant WCL zones skipped. Only creator-layer data changed this run (see watch-creators — the five queued reaction videos to the Sept 22 post). The Sept 22 changes apply at Tuesday's reset; nothing to apply yet.

## 2026-09-20 (nightly) — three channels swept, **nothing new since the Sept 18 head**; official revision ledger clean (0 added / 0 changed / 0 removed sections)

- **Revision ledger first, as the skill requires.** Read the trusted pre-agent receipts `official-notes/evidence.json` + `pending.json` (checkedAt 2026-09-20T14:22:01Z). `live-hotfixes` post 1 still **v40** (updated 2026-09-17T23:29:35Z); `ptr-preview` posts **1 v3** and **4 v1**. Section-by-section diff against the committed ledger: **0 added, 0 hash-changed, 0 removed** across all 126 sections, so every prior disposition (17 applied + 99 irrelevant on the hotfix post, 3 + 7 applied 12.1.5-preview notes) is retained by identical hash rather than re-asserted. Wrote the reviewed pending ledger to `data/official-notes.json` keeping the receipts' own check times; `node src/check-official-notes.mjs --base=HEAD` passes. No section touched a set bonus, so no `tierSet.asOf` needed to move.
- **RSS** (`/news/rss/all`, HTTP 200, 177,152 B): 40 items parsed per `<item>` block, newest 2026-09-20 09:00 -0500. **News INDEX** polled too, because it leads the feed within a run: `data.news.newsData` brace-balanced off its id attribute, 20 posts, newest `news=382973` — nothing above the RSS head. **Blue tracker** (`data.blueTracker.default`, 50 entries, deduped by topic): newest class-relevant Linxy post is still *Class Tuning Incoming -- September 22* (topic 2354340, 09-18 18:48), already the logged head; everything after it is Brewfest and Pirate's Day.
- **One borderline call, read in full rather than judged by title:** `news=382966` *"Mythic Nymrissa May Guarantee Great Vault Loot Slots"* (09-19). Body is a Raid Leader Discord **theory** about Flexible Mythic vault slots — "this theory hasn't been disproven yet" — i.e. a player discovery, not a Blizzard change, and no class content. Correctly **not** a feed entry.
- **Dev-notes thread 2317811.json** fetched directly (HTTP 200, 72,718 B): `posts_count` 13, `last_posted_at` **2026-07-31T23:42:09Z**, nothing after the logged post #19. That is the documented closed-cycle quiet, not a lost thread — the 12.1.5 preview rides its own configured source. `PHASES.ptr` stays null; no 12.1.5 material entered `ptr-builds`, `spec.ptr` or any model input.
- Dormant lanes (WCL zones 54 / 52 / 56 / 57) skipped by design and carry no manifest row. `data/ptr-builds.json` unchanged at 38 builds, head 2026-09-18.


## 2026-09-19 (local, scheduled, 30 min after the nightly) — verify-only: RSS re-read, **nothing newer than the nightly's sweep**; no new build/hotfix, no 12.2 PTR

- The 09-19 nightly (publish 14:23Z) had already logged the **September 22 tuning post** (topic 2354340, 24 specs, 24 highlights) and the
  Ula'tek Stone Venom hotfix and rewritten the notes ledger (clean, 0 unresolved). This run started 14:29Z on `51efd6a` and did NOT re-derive any
  of that. Wowhead `/news/rss/all` re-fetched HTTP 200, 161,893 B, 40 items — **byte-for-byte the same size the nightly recorded**; newest item is
  still the 09-19 14:00Z *WoW: Forever* phasing note; the only tuning items are the 09-18 "Augmentation Evoker Buff — Class Tuning Incoming" mirror
  and the Ula'tek hotfix, both already in the feed. Zero "12.2 PTR" titles. Forum threads not re-polled (the RSS would carry a new post).
- `data/official-notes.json` and `data/ptr-builds.json` untouched; `PHASES.ptr` null; dormant zones skipped. Only creator-layer data changed
  this run (see watch-creators) — the nine queued reaction videos to that very tuning post.

## Pruned 2026-10-06 (interactive session)

Entries older than the 2026-09-19 local run were removed here, per this file's own "keep the
newest ~20" rule: the file had reached **237,591 bytes** in a Windows checkout, within 25 KB of
the Read tool's 262,144-byte gate, and was growing by about 5 KB a night. 62 entries -> 22.
The pruned range (the 2026-08-29 nightly to the 2026-09-19 nightly) was scanned for durable
lessons first, and the ones that lived nowhere else moved into SKILL.md in the same commit,
under "Lessons promoted from `log.md` (2026-10-06 prune)": forum `.json` redirects, moderation
posts that look like blue posts, Wowhead news ids, checking a lead against the forum, the
lifecycle of a "Class Tuning Incoming" post, silent edits, the Wowhead mirror's lag, set-bonus
keywords, a running topic's lagging title, and attribution by heading. Three practices that
grew up in this range without an owner decision were settled by Riley the same day and are
recorded there as owner decisions. The rest was run narrative.
