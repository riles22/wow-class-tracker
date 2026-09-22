# ptr-watch run log

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

## 2026-09-19 (nightly) — **TWO new feed entries**: the Sept 22 class tuning pass (24 specs) and a datamined Ula'tek encounter hotfix; official ledger clean at post-1 v40; still no 12.2 PTR

- **Ledger first, per the skill.** `official-notes/evidence.json` (checkedAt 14:00:04Z) — both configured sources **success**: live hotfix compilation topic **2336376 post 1 at revision 40** (updatedAt 2026-09-17T23:29:35Z, **116** class sections) and the 12.1.5 development thread **2344395** posts 1 (v3, 3 sections) and 4 (v1, 7 sections). The reviewed pending ledger is byte-identical to the committed `data/official-notes.json` **apart from the two `checkedAt` stamps** — 0 new, 0 edited, 0 removed sections, **0 unresolved dispositions**. Written through; `check-official-notes` passes.
- **Discovery, two channels.** Wowhead RSS `/news/rss/all` HTTP 200, 161,893 B, parsed per `<item>` block (never by tag adjacency) — 40 items, newest 14:00Z. Blue-tracker index parsed from `id="data.blueTracker.default"` by string-aware brace balancing — 40 entries, ~30 unique topics. That second lane is what named the canonical source: **Linxy, "Class Tuning Incoming -- September 22", us.forums topic 2354340**, posted 18:48 — the Wowhead article alone would have left the entry citing a mirror.
- **Entry 1 — `kind: "build"`, 2026-09-18, topic 2354340 post 1, READ AT VERSION 2** (created 23:03:10Z, edited to v2 at 23:48:08Z). The third of the three weekly S2 tuning passes from the 2026-08-12 roadmap; applies at the **Sept 22** weekly maintenance, so the entry records the ANNOUNCEMENT. **24 specsAffected / 24 highlights**, coverage gate green.
  - **Mirror diff done line by line**: Wowhead published news=382999 at 23:05:34Z, i.e. off **v1**, and **exactly one PvE line differs** — Blood DK's aura cut reads "All ability **and minion** damage reduced by 6%" in v2. Forum wording stored.
  - **Nesting decided one attribution**: Druid's "Bursting Growth damage increased by 15%" sits under a bare `Hero Talents > Wildstalker` block that is a **sibling** of the spec blocks (depth-annotated dump, not flattened prose), so it is logged **`Druid (class-wide)`** — the 08-28 Shaman/Farseer precedent. Feral's own Wildstalker line (Patient Custodian) is nested under Feral and is attributed to Feral.
  - **PvP kept out, both shapes.** The whole PLAYER VERSUS PLAYER section is undistilled; **9 specs appear there and nowhere in Classes** (Preservation Evoker, BM Hunter, Holy Priest, Assassination + Outlaw Rogue, Elemental + Enhancement Shaman, Affliction Warlock, Arms Warrior) and are correctly absent from specsAffected. Separately, one line INSIDE the Classes section is itself PvP-only — Discipline Priest's "Atonement healing is no longer increased by 40% in PvP combat" — and was **not** written as a highlight (rule 3c); its PvE sibling (+40% outside raid/BG) is logged.
  - **No set bonus anywhere in the post** ("set bonus", "-piece" and "Venomous Abyss" all count 0; the one "tier set" hit is prose in Devastation's dev note), so **no `spec.tierSet.asOf` moved** and no gearing resync was needed.
  - **classifyHighlight run on all 24 rather than assumed**: 21 buff, **3 null** — Blood DK (6% aura cut vs Death Strike +25%, a cleave reduction and six Deathbringer buffs), Survival Hunter (Wildfire Bomb +20% vs its primary-target bonus 80%→50%, which Blizzard itself calls single-target-neutral), Shadow Priest (six +15% ST buffs vs a Psychic Link cleave cut and Shadeburst −5%). Mixed lines not voting is the intended behaviour.
- **Entry 2 — `kind: "hotfix"`, 2026-09-18**: the datamined Ula'tek change, Stone Venom's tank DoT range now **50,000 yards (was 100)**, so the Phase-2 tank can no longer outrange it. Wowhead news=382998 is the only citation (nothing on the blue tracker, hotfix topic still v40) and Wowhead itself calls it datamined. **Zero class content** → `specsAffected: []` and a `Non-class:` highlight, the posts #7/#12/#13 precedent. Its per-difficulty damage figures are Wowhead's measurements, flagged as such in the label.
- **Writeups**: recomputed, not remembered — 1 spec at `ptr: null` (Demonology Warlock, the deliberate one). No writeup touched; a live tuning pass is not writeup material.
- **Dormant lanes correctly skipped** (WCL zones 52/54/56/57); no contract row exists for them. **No 12.2 PTR announcement** in either channel. 12.1.5 stayed notes-only: `PHASES.ptr` untouched, nothing written into `ptr-builds.builds`, `spec.ptr` or any model input — the only 12.1.5 item in the RSS window was a Mythic Kith'ix loot change, which is not class content.

## 2026-09-18 (nightly) — ledger clean at post-1 v40; ONE new feed entry (Sept 17 live hotfixes, zero class content); dev-notes thread still quiet at #19

- **Revision ledger FIRST** (official-notes receipts, checkedAt 14:38:51Z). Both sources returned: live hotfixes topic 2336376 post 1 now at
  **version 40**, last edited 2026-09-17T23:29:35Z, 116 sections; 12.1.5 thread 2344395 posts 1 and 4, 3 + 7 sections. Every post bodySha256
  and all **126 section hashes identical** to the committed ledger, so 27 applied / 99 irrelevant / **0 unresolved** all carried forward and the
  only thing that changed in `data/official-notes.json` is `checkedAt`. `check-official-notes --base=HEAD` passes.
- **Feed: +1 entry, 2026-09-17, kind hotfix, `specsAffected: []`.** Read from the forum post with nesting intact and cross-checked against
  Wowhead news=382983. The September 17 block has **no Classes heading at all** — Dungeons and Raids (Ruby Life Pools enemy-forces count fix;
  Coiled Altar Unnerving Fixation no longer over-targeting tanks) and Player versus Player (rating inflation up; Font of Venomous Rage -50% in
  PvP). PvP lines carry the out-of-scope prefix, so nothing reaches a drawer or the outlook tally. No set bonus touched → no `tierSet.asOf` moved.
- **Dev-notes thread 2317811**: newest staff post is still **#19 (Linxy, 2026-07-31)**. Cycle closed, `PHASES.ptr` stays null.
- **Discovery, all four channels**: RSS 40 items + news index 20 posts (index polled because it leads the feed) + blue tracker 50 entries /
  50 unique topics. The window is almost entirely **WoW: Forever beta** coverage. 382983 was the only new in-scope item.
- **12.1.5 stayed NOTES ONLY.** The Kith'ix PTR raid-testing blue posts (2026-09-16, Heroic 10-30 and Mythic 15-25) and news=382926 (Kith'ix
  Myth 9/6 loot removed) were read and deliberately **not** written into `ptr-builds`, `spec.ptr`, tier sets or any model input.
- Dormant WCL PTR zones (52/54/56/57) not swept — contract rows removed at the flip. Writeup gaps: still exactly **1** (Demonology Warlock,
  deliberate). Note for the record: Kith'ix is also why the WCL **raid** collector reads `invalid` — zone 53 gained encounter 3513.

## 2026-09-18 (local, scheduled) — ledger MOVED on revision only: hotfix post v38→v40 with **0 class-section changes** (September 17 section is dungeon/raid/PvP only); NO new feed entry; still no 12.2 PTR — run BEFORE today's nightly

- **Official revision ledger ran FIRST**, from a fresh local `node src/fetch-official-notes.mjs` (checkedAt 2026-09-18T14:24:03Z, both
  sources `success`). `live-hotfixes` (topic 2336376) post 1 moved **version 38 → 40**, last edited 2026-09-17T23:29:35Z, and the pending
  ledger surfaced **0 unresolved, 0 removed**: all **116** class sections hash-identical to the 09-17 nightly's ledger, newest class section
  still dated 2026-09-15. `ptr-preview` (topic 2344395) unchanged — post 1 v3, post 4 v1, **10** sections all still `applied`. Ledger clean
  **126/126**; `data/official-notes.json` rewritten from `pending.json` exactly as received (only the revision/hash/checkedAt stamps
  moved). `node src/check-official-notes.mjs --base=HEAD` → "revisions, section dispositions and applied references verified".
- **What v39/v40 added was read directly off the canonical post** (`posts/29891478.json`, version 40, 87,603 chars): a new **September 17**
  section — Ruby Life Pools enemy-forces credit fix (Blazebound Destroyers / Primalist Flamedancers), The Coiled Altar's Unnerving Fixation
  targeting tanks less, a PvP rating-inflation increase, and Font of Venomous Rage −50% in PvP combat. **No Classes heading, no class line**
  → no `kind: "hotfix"` entry (same call as the 08-28 Bonus Roll / Coiled Altar items). The tier-set upkeep gate had nothing to check.
- **Wowhead RSS: 40 items, 135,223 B, parsed per `<item>` block**; 18 newer than 2026-09-17T14:00Z. The only hotfix-shaped item is the
  09-17 23:37 mirror of the section above ("Fixed Count Issues in Ruby Life Pools"), body read in full, no class line. Everything else is
  *WoW: Forever* beta coverage, the BlizzCon Live Q&A liveblog (scanned for tuning/balance/12.2 — only transmog/race-class-combo answers
  and "Class Design … high skill ceiling" generalities), and one 12.1.5 PTR item (Mythic Kith'ix loot ilvl, already noted 09-17). **Zero
  titles carry "12.2 PTR"**; no 12.2 forecast-cycle trigger.
- **Threads re-read directly**: 2335871 "Season 2 Class Tuning Plans" still 195 posts with Kaivax only at #1 (v1, unedited since 08-12) —
  the roadmap's **Sep 22** pass is next Tuesday; 2344395 still 4 staff posts (#4 last, 09-15T23:09Z). Dev-notes 2317811 not re-polled
  (closed cycle; the RSS would carry a new post).
- **12.1.5 stayed NOTES ONLY.** `PHASES.ptr` untouched at null; nothing entered the feed or any `ptr` verdict. Dormant zones 54/52/56/57
  correctly skipped, stored rows untouched.
- Verification: `npm run test:quiet` 639 tests — **636 pass, 1 permanent skip, 2 fail that are PRE-EXISTING on HEAD `7126952`**
  (re-run on the clean tree before any edit: identical) — both `ui-invariants` WCL tests ("WCL coverage distinguishes insufficient logs…"
  asserts `fixture has a verified sparse raid cut`; "the Ladder defaults to current WCL…" expects "insufficient logs" text). The nightly's
  honest `failed` receipt for all 320 raid cuts removed the `insufficient` fixture both tests assume; the ci.yml run the 09-17 nightly
  dispatched (35241401522) reds on exactly these two in all three browsers. Fixture-rot, not a page defect — root cause and fix in tonight's
  refresh-metrics entry. `freeze-season`: 8 pairs still live, nothing to freeze. `check-refresh --manifest`: the expected
  `startedAt … 23h old` line plus the stale gitignored local `wcl-fetch/evidence.json` (09-08 leftover — no WCL merge this run).
  Manifest deliberately NOT rewritten (partial run). Snapshot `2026-09-18.json` written, then rebuilt.

## 2026-09-17 (nightly) — ledger clean **126/126** again (both sources byte-identical to this morning's local run); **no new feed entry**; 12.1.5 stayed notes-only; still no 12.2 PTR; dev-notes thread dormant

- **Ledger FIRST, from this run's pre-agent receipts** (`official-notes/evidence.json` + `pending.json`, checkedAt 2026-09-17T15:18:22Z). Both configured sources `success`: live hotfix topic **2336376** post 1 (updated 2026-09-16T00:41:40Z, **116** class sections) and the 12.1.5 preview topic **2344395** posts 1 and 4 (updated 2026-09-03T22:48:20Z / 2026-09-15T23:09:31Z, **3 + 7** sections). Every one of the **126** section hashes matched the committed ledger, so all 126 retained their prior applied/irrelevant resolution — **0 unresolved, 0 `removedSections` tombstones**, nothing to review. The reviewed pending ledger was written to `data/official-notes.json`; the ONLY diff is each source's `checkedAt` (14:25:14Z -> 15:18:22Z). `node src/check-official-notes.mjs --base=HEAD` passes.
- **Four discovery channels, nothing new.** (1) Wowhead news RSS, 208,839 B, **40 items** parsed per `<item>` block (never by tag adjacency). Everything newer than the logged 2026-09-15 entries is out of scope: *WoW: Forever* / Classic+ datamining (the bulk of both days), a **Season 3 dungeon pool** preview, a Mythic Coiled Altar **encounter-mechanics** article (382934 — Soulcoiler spawn + ghost-fixate behaviour, no class line), a 12.1.5 **loot** change (382926, Mythic Kith'ix Myth 9/6 -> 3/6) and a Paladin **glyph/toy** datamine (382917). I read the full `content:encoded` bodies of the three that tripped a tuning-word scan rather than judging on titles. (2) News **index** payload `data.news.newsData` polled separately because it LEADS the RSS — page 1, 20 posts, top id **382926**, nothing the RSS did not have. (3) **Blue tracker** payload `data.blueTracker.default`, 50 entries: newest class-relevant topics are the 09-15 hotfixes (2336376) and the 09-15 12.1.5 dev notes (2344395), both already accounted for; 09-16 brought only Linxy's **Kith'ix PTR raid-testing schedule** posts and the Season 3 dungeon preview. (4) The 12.1 dev-notes thread `2317811.json`: `posts_count` 13, `last_posted_at` **2026-07-31**, dormant as expected for a CLOSED cycle — not a lost thread.
- **12.1.5 stayed NOTES-ONLY, as the policy requires**: no `ptr-builds.json` entry, no `spec.ptr` verdict, no `PHASES` edit, no archived-metric relabel. No build or hotfix this run touched a set bonus, so the tier-set upkeep gate had nothing to pair and `spec.tierSet`/the gearing mirror were not touched.
- **No 12.2 PTR announcement** (the only 12.2 item all window is a datamined lair world boss, Noctinaxx), so `PHASES.ptr` stays null and the dormant lanes stay dormant — steps 5-7b (WCL zones 54/52/56/57) were correctly NOT attempted and carry no manifest row.
- Writeup coverage recomputed rather than remembered: **Demonology Warlock is still the single deliberate `ptr: null`**. No writeup was manufactured from tuning lines.


## 2026-09-17 (local, scheduled) — ledger clean 126/126 (both sources byte-identical to the 09-16 nightly); NO new feed entry; 12.1.5 PTR loot change and raid-testing posts read, all non-class; still no 12.2 PTR — run BEFORE today's nightly

- **Scope:** residential-only catch-up at 14:23Z with **no nightly yet today** (origin/master at `1b05436`, the weekly gearing verification's
  publish; the last nightly is `da9bf44`, 09-16 at 15:30Z). Between-cycles posture unchanged: `PHASES.ptr` null, the dormant WCL PTR zone
  sweeps (52/54/56/57) skipped (NOT marked unreachable — their contract rows were removed at the flip), the 12.1.5 lane notes-only. Manifest
  deliberately NOT rewritten (partial run).
- **Revision ledger FIRST, from a fresh local `node src/fetch-official-notes.mjs`** (checkedAt 2026-09-17T14:25:14Z; `official-notes/` is
  gitignored, so no trusted nightly receipt was overwritten). Both sources `success` and **both byte-identical to the committed ledger**:
  live hotfix topic **2336376 post 1 still v38** (updated 2026-09-16T00:41:40Z, 116 sections) and the 12.1.5 dev thread **2344395 post 1
  still v3** (3 sections) **plus staff post #4 still v1** (2026-09-15T23:09:31Z, 7 sections). All **126** section hashes matched, so every
  prior resolution was retained — 17 applied live / 99 irrelevant / 10 applied preview, **0 unresolved, 0 removedSections**.
  `data/official-notes.json` rewritten from the reconciled pending ledger so that ONLY the two `checkedAt` stamps moved
  (15:10:55Z → 14:25:14Z); `check-official-notes.mjs --base=HEAD` passes.
- **NO new feed entry.** `ptr-builds.json` stays at **35 entries**, newest 2026-09-15.
- **All four discovery channels swept.** Wowhead RSS 208,839 B / 40 items (parsed per `<item>` block), newest id **382961**; the news INDEX
  (`data.news.newsData`, 20 posts / 1,554 pages) agrees on the top ids; the blue tracker (`data.blueTracker.default`, 50 entries, fetched
  with the full browser header set after a UA-only GET returned the 919-byte CloudFront 403) tops out at Linxy's 09-16 **Kith'ix Heroic /
  Mythic raid-testing** posts — no new class-tuning blue post; topic **2335871** "Season 2 Class Tuning Plans" still Kaivax #1 v1, last reply
  2026-08-31, the promised **September 22** class pass still ahead; topic **2346119** (Kith'ix testing schedule) unchanged at 2 staff posts.
- **Items newer than the 09-16 nightly's sweep, all read in full, all non-class:** **382926** "Mythic Kith'ix No Longer Drops Myth 9/6 Loot on
  Patch 12.1.5 PTR" (this week's PTR build downgrades the Kith'ix cantrip drops from Myth 9/6 = 344 to Myth 3/6 — a **gearing-lane** fact
  for the 12.1.5 window, no class data), **382934** (undocumented Mythic Coiled Altar fixate change / Soulcoiler spawn hotfix not applying —
  encounter tuning, no class line), **382930** (Season 3 M+ dungeon rotation and per-dungeon changes), **382920** (MMORPG interview: Paladin
  chargers, the 12.2 caster legendary), **382921** (addon changes carried into *Forever*), plus ~25 *WoW: Forever* datamining items. Zero
  `12.2 PTR` strings across RSS bodies, the index and the tracker.
- **12.2 PTR check: still NOT open.** Opening a cycle stays an owner action.
- **Writeups:** one spec still at `ptr: null` — Demonology Warlock, deliberate. No tier-set change today, so the upkeep gate had nothing to
  pair and the gearing mirror needed no resync. **No WCL request of any kind.**

## 2026-09-16 (nightly) — ledger clean 126/126 (both sources byte-identical to this morning's local run); NO new build entry; three new non-class news items read in full; still no 12.2 PTR

- **Scope:** the scheduled nightly, starting 15:11Z, ~50 minutes after today's residential local run (`e38de11`) which had already logged the Sept-15 hotfixes and resolved every pending section. Between-cycles posture unchanged: `PHASES.ptr` null, the dormant WCL PTR zone sweeps (52/54/56/57) skipped (NOT marked unreachable — their contract rows were removed at the flip), the 12.1.5 lane notes-only.
- **Revision ledger FIRST**, from this run's trusted pre-agent receipts (`official-notes/evidence.json`, checkedAt **2026-09-16T15:10:55Z**). Both sources `success` and **both byte-identical to the committed ledger**: live hotfix topic **2336376 post 1 still v38** (updated 2026-09-16T00:41:40Z, **116 sections**) and the 12.1.5 dev thread **2344395 post 1 still v3** (3 sections) **plus staff post #4 still v1** (2026-09-15T23:09:31Z, 7 sections). `postIdentity` matched exactly for both sources and all **126** section hashes matched, so every prior resolution was retained — **17 applied live / 99 irrelevant / 10 applied preview, 0 unresolved, 0 removedSections**. `data/official-notes.json` was rewritten from the reconciled pending ledger so that ONLY the two `checkedAt` stamps moved (14:22:56Z → 15:10:55Z); `check-official-notes.mjs --base=HEAD` passes.
- **NO new feed entry.** `ptr-builds.json` stays at **35 entries**, newest 2026-09-15. Nothing in any channel carried a class line that is not already logged.
- **All four discovery channels swept.** Wowhead RSS 225,178 B / 40 items (parsed per `<item>` block, never by tag adjacency), newest id **382919**. News INDEX from `data.news.newsData` by brace-balancing off the id attribute (20 posts, 1,553 pages, same top ids — the index leads RSS, so it is polled too). Blue tracker from `data.blueTracker.default` (50 entries): the US/EU mirrors of the Sept-15 hotfix and 12.1.5 posts, the Sept-22 trinket-tuning and Sept-15 raid-tuning topics (both already logged as 09-14/09-15 entries), Q&A and BlizzCon items — **no new class-tuning standalone blue post**. Official dev-notes thread **2317811** fetched directly: 17 posts, `last_posted_at` 2026-07-31T23:42:09Z, unchanged. Topic **2335871** "Season 2 Class Tuning Plans" still Kaivax #1 v1 (2026-08-12), 195 posts — the promised **September 22** class pass is still ahead.
- **Three items newer than the local run's sweep, all read in full, all non-class:** **382886** "Noctinaxx: A Giant Azerite Bat is the Lair World Boss for Patch 12.2" (BlizzCon interview content about a 12.2 raid lair — no class data, no PTR), **382913** (Gamespot Classic+ interview) and **382917** "Libram of the Matriarch" — a Paladin **toy** from Mythic Kith'ix granting a cosmetic Avenging Wrath glyph, i.e. cosmetic with no combat value, correctly out of scope.
- **12.2 PTR check: still NOT open.** Zero `12.2 PTR` strings across the RSS bodies, the news index and the blue tracker. The in-development forum category **345** is the 12.1.5 one; its only staff topics remain the configured dev thread **2344395** and the Kith'ix raid-testing schedule **2346119**, whose sole 09-16 reply (`#3`, 10:47Z) is a deleted non-staff post. Opening a cycle stays an owner action.
- **Writeups:** one spec still at `ptr: null` — Demonology Warlock, deliberate (the source reported no changes). None manufactured. No tier-set change tonight, so the upkeep gate had nothing to pair and the gearing mirror needed no resync. **No WCL request of any kind** (no credentials on this runner).

## 2026-09-16 (local, scheduled) — ledger MOVED: hotfix post v36→v38 (+3 live class sections, two tier-set fixes) and a NEW 12.1.5 dev-thread post #4 (+7 preview sections, 13 spec notes); ONE hotfix feed entry; still no 12.2 PTR — run BEFORE today's nightly

- **Scope:** residential-only catch-up at 14:21Z with **no nightly yet today** (origin/master at `c8ee5cb`; the last nightly is `300d396`, the
  second 09-15 run). Between-cycles posture unchanged: `PHASES.ptr` null, the dormant WCL PTR zone sweeps (52/54/56/57) skipped, the 12.1.5 lane
  notes-only. Manifest deliberately NOT rewritten (partial run).
- **Revision ledger FIRST, from a fresh local `node src/fetch-official-notes.mjs`** (checkedAt 2026-09-16T14:22:56Z; `official-notes/` is
  gitignored, so no trusted nightly receipt was overwritten). Both sources `success` and BOTH MOVED for the first time since 09-11:
  · live hotfix topic **2336376 post 1: v36 → v38**, updated 2026-09-16T00:41:40Z, title now "…Hotfixes - September 15", **116 sections
    (was 113)** — three NEW class sections dated 2026-09-15, all under explicit spec headings: Hunter › Marksmanship (Aimed Shot cast
    animation on gun/crossbow), Paladin › Protection (Consecration's first tick now benefits from the Venomous Abyss set's crit increase),
    Priest › Holy (Renewed Vigor from the 2-piece could exceed 3 stacks). All 113 prior sections hash-identical → prior resolutions retained.
  · 12.1.5 dev thread **2344395: post 1 still v3 (3 sections)** and a **NEW staff post #4** (Linxy, 2026-09-15T23:09:31Z, v1, 6,833 B) with
    **7 class sections / 13 spec notes**: Devourer (Soulforged Blades 18%, Voidpurge 2.5s, The Hunt + Eradicate moved to the middle gate, tree
    reshuffle), Resto Druid (Nature's Bounty redesign), Pres Evoker (Merithra's Blessing 30s), Arcane (Spell Density) + Frost (Splitting Ice
    fixes, Frostfire/Spellslinger hero fixes), Disc (Master the Darkness 30s) + Holy Priest (Holy Celerity ↔ Ultimate Serenity swap), Outlaw
    (Deft Maneuvers 5 Energy/target) + Subtlety (Shadow-damage modifier consistency pass), Prot Warrior (Execute RESTORED to old behaviour
    with +100% and +30%; further Prot work refocused on 12.2/13.0). Also in the post: Kith'ix raid testing starts Sept 16 (non-class).
  **All 10 unresolved sections resolved**: 3 live `applied` with `references` into the new feed entry, 7 preview `applied` with one faithful
  `notes[]` summary per specKey (13 notes). 0 irrelevant this time, 0 removedSections. `check-official-notes.mjs --base=HEAD` passes.
  Ledger totals now **17 applied live / 99 irrelevant / 10 applied preview, 0 unresolved**.
- **ONE new feed entry, `kind: "hotfix"`, dated 2026-09-15**, read from the canonical Discourse body (post 1 v38) with nesting intact and
  cross-checked line for line against the Wowhead mirror **news=382918** ("Spark of Tides Fix - Patch 12.1 Hotfixes for September 15th"):
  three spec lines (Marksmanship Hunter / Protection Paladin / Holy Priest) plus a Non-class line for the rest of the round-up (the Venomous
  Abyss encounter tuning announced 09-14 now live + one new Coiled Altar Spirit-of-Redemption fix, Spark of Tides catch-up, two quest fixes,
  Curse Surges every 30 min). All three spec lines `classifyHighlight` → **null** (bug fixes, no outlook vote). It sits at index 0 — the two
  existing 09-15 entries (trinket post 00:31Z, raid-buff round-up 15:39Z) predate the hotfix post's ~19:41Z appearance.
- **TIER-SET UPKEEP GATE ENGAGED, twice.** Both the Paladin and Priest lines touch a Venomous Abyss set bonus, so `spec.tierSet.asOf` → 2026-09-15
  for **Protection Paladin** (07-14 → 09-15, source now the Sept-15 hotfix topic, set2 gains a dated parenthetical: first-tick crit fix, no value
  changed) and **Holy Priest** (09-03 → 09-15, second dated parenthetical on set2: 3-stack cap fix, no value changed). `npm run validate` then
  reddened on exactly the four expected gearing-mirror mismatches; `node gearing/src/harvest-specs.mjs && --check && npm run gearing:build`
  re-synced `gearing/data/specs.json` and rebuilt the artifact; validate green.
- **Discovery sweep, all four channels, and they agree.** Wowhead RSS 224,438 B / 40 items (per-`<item>` parse), newest **382919**; nine items
  newer than the last nightly's top id 382904. Every body grepped for PTR/hotfix/tuning/12.2 strings: hits are the two mirrors above
  (382918 hotfixes, **382916** "More Class Changes - Patch 12.1.5 PTR Development Notes" — read and matched against post #4 verbatim),
  382919 (12.1.5 decor recipe costs, non-class), 382908 (Curse Surges hotfix, non-class), 382917 (Paladin glyph, cosmetic). News INDEX
  (`data.news.newsData`, 20 posts, 1,553 pages) same top ids. Blue tracker (`data.blueTracker.default`, 50 entries → 41 unique topics): the
  US/EU mirrors of both posts, "Missing Sparks of Tides - Updated September 15" (2341043, item), "Season 1 Mythic+ 0.1%/1% Rewards"
  (2350346, non-class), the Sept-17 Q&A and BlizzCon recaps — **no new class-tuning standalone post**. Topic **2335871** "Season 2 Class
  Tuning Plans" still Kaivax #1 v1 (2026-08-12), 195 posts — the promised Sept-22 class pass is still ahead. Thread **2317811** unchanged
  (17 posts, last 2026-07-31; quiet ≠ lost between cycles).
- **12.2 PTR check: still NOT open.** The PTR forum category now redirects to `/c/in-development/midnight-1215-public-test-realm/345` — it is
  the 12.1.5 category — and its only staff topics are the configured dev thread 2344395 and the Kith'ix testing schedule 2346119 (whose 09-16
  reply is a deleted non-staff post). No "12.2 PTR" string in any RSS body, index entry or tracker title. Opening a cycle stays an owner action.
  `ptr-builds.json` now **35 entries**, newest 2026-09-15.
- **Writeups:** one spec still at `ptr: null` — Demonology Warlock, deliberate. No writeup manufactured. No WCL request of any kind.

## 2026-09-15 (nightly, second run of the day) — ledger clean 116/116 again; ONE new feed entry: the Venomous Abyss raid buff went live (non-class)

- **Official revision ledger ran FIRST** from the pre-agent receipts (`official-notes/`, checkedAt **15:54:15Z**). Both
  sources unchanged from the committed ledger: live hotfix topic **2336376** post 1 still **v36** (updated
  2026-09-11T03:11:02Z, **113 sections**); the 12.1.5 dev thread **2344395** post 1 still **v3** (2026-09-03T22:48:20Z,
  **3 sections**). Every section hash byte-identical, so all **116** retained their prior resolutions (**17 applied / 99
  irrelevant, 0 unresolved, 0 removedSections**). `data/official-notes.json` rewritten from `pending.json` so only the
  two `checkedAt` stamps moved; `check-official-notes.mjs --base=HEAD` passes.
- **All four discovery channels swept.** Wowhead RSS 285,646 B / 40 items (parsed per `<item>` block); the JS-hydrated
  news index from `data.news.newsData` by brace-balancing off the id attribute (20 posts, newest **382898** and
  **382904**); the blue tracker from `data.blueTracker.default` (50 entries, ~40 unique topics after deduping by topic
  id); and the official 12.1 dev-notes thread **2317811** (17 posts, `last_posted_at` 2026-07-31T23:42:09Z — unchanged,
  and between cycles a quiet thread is not a lost thread).
- **ONE new entry, `kind: "hotfix"`, dated 2026-09-15** — Wowhead **news=382904**, "1% Raid Buff Now Live in The
  Venomous Abyss": the seasonal **Fury of the Dead** buff activated at 1% damage and healing, granted by a quest from
  Strongblood Jak'mo rather than automatically, and expected (Wowhead's expectation, not an announced schedule) to
  escalate 1%/week to a 15% cap on the Season 1 pattern. **There is no Blizzard forum post for it** — neither the blue
  tracker nor topic 2336376 carries it — so the round-up is the only citation and the entry's label says exactly that.
  `specsAffected: []` plus a `Non-class:` highlight (the posts #7/#12/#13 precedent): it reaches no spec drawer and votes
  in no outlook tally, because **a uniform +1% moves no spec relative to another**. Logged for the same reason as the
  09-14 raid-tuning entry — raid difficulty is the context the raid bracket's letters are read against. No set bonus is
  touched, so the tier-set upkeep gate is not engaged and no `spec.tierSet.asOf` moved.
- **Everything else in the RSS window triages out and it is worth recording why:** 37 of the 40 items are BlizzCon /
  *WoW: Forever* / Season 3 / 12.2 announcement coverage, and `news=382898` ("Dungeon Experience Changes in … Forever")
  is a *different game version*, not Midnight tuning. Nothing datamined, no class-tuning article, no per-spec 12.1
  review to distil.
- **12.2 LEADS STILL NOTED, STILL NOT ACTED ON.** BlizzCon announced 12.2 / 12.2.5 / Season 3 and Linxy posted "The
  Unbinding of Kith'ix Raid Testing Schedule" on 09-08. Opening a forecast cycle is an **OWNER** action (new
  `PHASES.ptr`, new thread key, contract rows, `wcl-probe` zone enumeration) — `PHASES.ptr` stays **null**, no 12.2
  material was written to `ptr-builds`, `spec.ptr` or any metric, archived 12.1 PTR metrics keep their labels, and the
  12.1.5 lane stays notes-only.
- **Dormant WCL PTR zone lanes (52 / 54 / 56 / 57) correctly NOT swept** — their contract rows left at the flip and the
  stored rows are the closed cycle's final receipts. I hold no WCL credentials and made no warcraftlogs.com request.
- **Writeups:** one spec still at `ptr: null` — **Demonology Warlock** — and that null is deliberate (the source reported
  no changes; "nothing changed" is not a verdict). No writeup was manufactured from tuning lines.

## 2026-09-15 (nightly) — ledger clean 116/116; TWO live tuning posts logged, both entirely non-class (raid encounters + trinkets)

- **Official revision ledger ran FIRST** from the pre-agent receipts (checkedAt 15:17:39Z). Both sources unchanged:
  live hotfix topic **2336376** post 1 still **v36**, updated 2026-09-11T03:11:02Z, **113 sections**; the 12.1.5 dev
  thread **2344395** post 1 still **v3**, updated 2026-09-03T22:48:20Z, **3 sections**. Every section hash is
  byte-identical to the committed ledger, so all 116 retained their prior resolutions (live 14 applied / 99 irrelevant;
  preview 3 applied), **0 unresolved, 0 removedSections**. `data/official-notes.json` rewritten from `pending.json` so
  only the two `checkedAt` stamps moved; `check-official-notes.mjs --base=HEAD` passes.
- **RSS + news index + blue tracker all swept, and they agree.** Wowhead RSS 286,562 B / 40 items (parsed per `<item>`
  block, never by tag adjacency); the JS-hydrated news index read from `data.news.newsData` by brace-balancing off the id
  attribute (20 posts, newest **382891** at 2026/09/15 09:00); the blue tracker from `data.blueTracker.default` (50
  entries, ~40 unique topics). The newest Blizzard hotfix compilation post is still "Midnight Hotfixes - September 10",
  already in the feed.
- **TWO new feed entries, both `kind: "hotfix"`, both read from the CANONICAL Blizzard post rather than the mirror.**
  · Linxy topic **2349528** "The Venomous Abyss Raid Tuning - September 15" (created 2026-09-14T22:22:12Z) → entry
    **2026-09-14**: post-RWF difficulty cuts across Sszorak, Twin Fangs, The Coiled Altar and Ula'tek.
  · Linxy topic **2349649** "Midnight Season 2 Trinket Tuning - September 22" (created 2026-09-15T00:31:16Z) → entry
    **2026-09-15**: eight named trinkets, announced a week ahead of the Sept 22 maintenance.
  **Neither carries a class or spec line** — one is entirely encounter mechanics, the other entirely item effects — so
  both get `specsAffected: []` plus `Non-class:` highlights (the posts #7/#12/#13 precedent), reach no spec drawer and
  cast no vote in any outlook tally. **No set bonus is touched in either post**, so the tier-set upkeep gate is not
  engaged and no `spec.tierSet.asOf` moved. Logged rather than dropped because raid difficulty and trinket power are the
  context the raid bracket's letters are read against.
- **The 12.1 PTR dev-notes thread 2317811 is CLOSED and that is expected** — polled for completeness: 17 posts,
  `last_posted_at` 2026-07-31T23:42:09Z, unchanged. Between cycles a quiet thread is not a lost thread; the
  rediscovery gotcha stays suspended. The dormant WCL PTR zone lanes (52 / 54 / 56 / 57) were correctly NOT swept —
  their contract rows left at the flip and their stored rows are the closed cycle's final receipts.
- **12.2 LEADS NOTED, NOT ACTED ON.** BlizzCon (12–13 Sep) announced 12.2, 12.1.7 "Talebound" and Season 3 content, and a
  blue post "The Unbinding of Kith'ix Raid Testing Schedule" appeared 2026-09-08. Opening a new forecast cycle is an
  OWNER action (new `PHASES.ptr`, new thread key, contract rows, zone probe) — **`PHASES.ptr` stays null**, no 12.2
  material was written to `ptr-builds`, `spec.ptr` or any metric, and the 12.1.5 lane remains notes-only.
- **Writeups:** one spec still at `ptr: null` — Warlock Demonology — and that null is deliberate (the source reported no
  changes; "nothing changed" is not a verdict). No writeup was manufactured from tuning lines.
## 2026-09-15 (local, scheduled) — ledger clean (116/116 unchanged, 0 unresolved); two NEW Linxy blue posts read in full — raid-encounter tuning and a 22-Sep trinket pass, ZERO class lines, nothing logged; still no 12.2 PTR — run BEFORE today's nightly

- **Scope:** residential-only catch-up at ~14:58Z with **no nightly yet today** (origin/master at `20cbc5d`, the 13:59Z weekly
  gearing-guide refresh; the last nightly is 55794e3, schedule event 16:30Z yesterday). Between-cycles posture unchanged:
  `PHASES.ptr` null, dormant WCL PTR zone sweeps skipped, the 12.1.5 lane notes-only.
- **Revision ledger FIRST, from a fresh local `node src/fetch-official-notes.mjs`** (checkedAt 2026-09-15T14:58:51Z; `official-notes/`
  is gitignored, so no trusted nightly receipt was overwritten). Both sources `success`: live hotfix topic **2336376 post 1 still v36**
  (updated 2026-09-11T03:11:02Z, 113 sections); 12.1.5 dev thread **2344395 post 1 still v3** (2026-09-03T22:48:20Z, 3 sections).
  `pending.json` deep-diffed against the committed ledger with `checkedAt` stripped: **identical** — 14 applied live · 99 irrelevant ·
  3 applied 12.1.5, **0 unresolved, 0 removedSections**. Written to `data/official-notes.json` per step 4 (the two `checkedAt` stamps
  are the whole diff); `check-official-notes.mjs --base=HEAD` passes.
- **Wowhead news RSS:** HTTP 200, 286,562 B, 40 items parsed per `<item>` block; window 2026-09-12 17:00 → 2026-09-15 09:00 CDT,
  newest id **382891**. Nine items are newer than the 09-14 nightly's top id 382879. Every article BODY was grepped for
  PTR / hotfix / tuning / 12.2 strings, not just titles. **0 class tuning, 0 hotfix round-ups, 0 build posts.** The two
  tuning-titled items are mirrors of the blue posts below (382885 raid tuning, 382890 trinket tuning); 382863 (minimap addon
  hotfix) is the UI restriction already read on 09-14; every other hit is BlizzCon interview/roadmap prose naming 12.2 / 12.2.5 /
  12.2.7 as release cadence. **News INDEX** polled too (`data.news.newsData`, 20 posts, 1,552 pages): same top id, no lead.
- **Blue tracker** (`data.blueTracker.default`, 50 entries → 41 unique topics): **two NEW Linxy standalone posts since the 09-14
  nightly, both fetched as Discourse JSON and read with heading structure intact:**
  · **"The Venomous Abyss Raid Tuning - September 15"** (topic **2349528**, created 2026-09-14T22:22Z, v1) — Sszorak / Twin Fangs /
    Coiled Altar / Ula'tek encounter nerfs (damage, cast times, add counts, per difficulty). **0 class or spec names in the body.**
    Encounter tuning, not class tuning — same disposition as the 08-27 Coiled Altar and 09-01 Vashnik precedents; no feed entry.
  · **"Midnight Season 2 Trinket Tuning – September 22"** (topic **2349649**, created 2026-09-15T00:31Z, v1) — announced a week
    ahead for the **22 September** reset: Preternatural Antivenom +75% healing, Seed of Radiant Hope / Mycolic Medicine / Unstable
    Felheart Crystal healing +40–58% with shorter cooldowns, Ruby Whelp Shell reshaped, Gaze of the Alnseer −10% primary stat,
    Vaelgor's Final Stare −10% and **Algeth'ar Puzzle Box −25% Mastery**; Blizzard calls it the FINAL S2 trinket pass. **0 class
    or spec names.** Item-level tuning is not class tuning and never enters the feed (an item-level claim is not a spec claim).
    ⚑ **Heads-up for the GEARING lane, not acted on:** these are scheduled, not live, and the guide trinket letters are the
    guides' to move — the weekly gearing-refresh (Tuesdays 08:37 UTC) will pick up whatever Icy Veins / Wowhead / Method republish
    after 09-22. Nothing to write today.
  Everything else newer is BlizzCon recaps, the Sept-17 Q&A thread and Forever marketing. Topic **2335871** "Season 2 Class Tuning
  Plans" is at 195 posts, Kaivax still only at #1 and still **v1** (2026-08-12) — the Sept 22 class pass it promised is still ahead
  (and now shares a reset with the trinket pass). Thread **2317811** unchanged (17 posts, last 2026-07-31).
- **12.2 PTR check: still NOT open.** PTR forum category 345 re-read: the only staff topics are the configured 12.1.5 dev thread
  2344395 and the 09-09 Kith'ix testing schedule; **no 12.2 dev-notes thread**, no PTR realm string in the RSS window, index or
  tracker beyond the Diablo 3.2.1 PTR notes inside the BlizzCon Day-1 roundup. Opening the cycle stays an owner action; nothing touched.
  `ptr-builds.json` still 31 entries, newest 2026-09-10.
- 0 builds, 0 hotfixes, 0 tierSet edits (upkeep gate quiet) from THIS run; its `data/official-notes.json` stamp write was never pushed (see refresh-metrics).
  ⚑ **Disposition divergence, for Riley:** the nightly that landed ~40 minutes later (f4ace95) read the SAME two Linxy posts and DID log them, as
  two `kind: "hotfix"` feed entries with `specsAffected: []` and Non-class highlights (the thread-post precedent of #7/#12/#13 extended to standalone
  blue posts), where this run logged nothing on the encounter/trinket-tuning precedent (08-27 Coiled Altar, 09-01 Vashnik). Both keep every class
  drawer and tally untouched — the difference is whether the patch feed indexes non-class Blizzard posts. The nightly's entries stand; this is
  recorded so the two agents stop alternating on it. Worth a one-line rule in SKILL.md either way.


## 2026-09-14 (nightly) — ledger clean 116/116, nothing new in any of four channels; a 12.1.5 PTR realm is raid-testing but no 12.2 thread exists

- **Official revision ledger ran FIRST** from the pre-agent receipts (checkedAt 16:33:07Z). Both sources `success`:
  live hotfix topic **2336376** post 1 still **v36**, updated 2026-09-11T03:11:02Z, **113 sections**; the 12.1.5 dev thread
  **2344395** post 1 still **v3**, updated 2026-09-03T22:48:20Z, **3 sections**. Every section hash matches the committed
  ledger — **116 of 116 retained their prior resolutions (17 applied + 99 irrelevant), zero unresolved, zero tombstones**.
  `data/official-notes.json` rewritten from `pending.json` with identities, inventories, hashes and this run's check times
  exactly as received; the only diff is the two `checkedAt` stamps. `check-official-notes.mjs --base=HEAD` passes.
- **RSS**: HTTP 200, 283,299 B, 40 items parsed per `<item>` block. Window 2026-09-12 19:31 → 2026-09-14 15:22, entirely
  BlizzCon 2026 / WoW: Forever coverage. No Class Tuning, no hotfix round-up, no 12.1/12.1.5 build post.
  The one hotfix-titled item, **news=382863 "Minimap Addon Tech Will Be Disabled in Hotfix"**, was read in full from
  `content:encoded` rather than judged on its title: it is an announced restriction on `MinimapCompassTexture` (addons can
  no longer supply custom compass assets or call `GetRotation`/`SetTexture`/`SetAtlas`/`SetSVG` on it while in an instance
  with `rotateMinimap` on), sourced from the WoW UI Discord, with **no class or spec line and no ship date**. Out of feed
  scope; nothing logged. Worth noting the shape for next time — "…in Hotfix" in a title is not a hotfix round-up.
- **News INDEX** (`data.news.newsData`, brace-balanced from the id attribute) leads the RSS by nothing this run — same
  newest id 382863. **Blue tracker** (`data.blueTracker.default`, 50 entries → 40 unique topics): newest class-tuning post
  is still Linxy's "Hotfixes - September 10" (topic 2336376), already the 2026-09-10 feed entry. Everything newer is
  BlizzCon panel recaps, the Sept-17 Q&A announcement, and the 09-08 Kith'ix raid-testing schedule.
- **The tracked 12.1 thread 2317811.json fetched in full**: 17 posts, `last_posted_at` 2026-07-31T23:42:09Z, unchanged.
  Closed, not lost.
- **NEW this run, and the reason it is written down:** the PTR forum **category 345** listing was read as well. It confirms
  the 12.1.5 PTR realm is live and testing — Linxy's "The Unbinding of Kith'ix Raid Testing Schedule" (topic 2346119,
  created 2026-09-09, Heroic 13:30 PDT / Mythic 14:30 PDT on Wednesday September 16) was read in full and is a pure
  timetable with **zero tuning content**. The only staff dev-notes topic in that category is the configured 12.1.5 thread
  2344395; **there is no 12.2 dev-notes thread**. Everything else in the category is public player feedback, which the
  source policy excludes. So: a running PTR realm is NOT by itself a forecast cycle. `PHASES.ptr` stays null, the frozen
  12.1 forecast is untouched, archived PTR metrics keep their labels, and the 12.1.5 lane stays notes-only. Opening a cycle
  (new `PHASES.ptr`, thread key, contract rows, zone probe) remains an OWNER action.
- `data/ptr-builds.json` untouched — 31 entries, newest 2026-09-10. No build's notes touched a set bonus, so no
  `spec.tierSet` moved and the upkeep gate (and its gearing mirror) stayed quiet.
- Dormant lanes skipped as designed: zones 54 / 52 / 56 / 57 are the closed cycle and carry no contract rows.

## 2026-09-14 (local, scheduled) — ledger clean (116/116 unchanged, 0 unresolved); no new tuning on any of four channels; still no 12.2 PTR — run BEFORE today's nightly

- **Scope:** residential-only catch-up run at ~14:15Z with **no nightly yet today** (origin/master still `9e4f2f3`; the schedule
  event fired 14:38Z yesterday). Between-cycles posture unchanged: `PHASES.ptr` null, dormant WCL PTR zone sweeps skipped, the
  12.1.5 lane notes-only.
- **Revision ledger FIRST, from a fresh local `node src/fetch-official-notes.mjs`** (checkedAt 2026-09-14T14:17:35Z; the
  `official-notes/` directory is gitignored so no trusted nightly receipt was overwritten). Both sources `success`: live hotfix
  topic **2336376 post 1 still v36** (updated 2026-09-11T03:11:02Z, 113 sections); 12.1.5 dev thread **2344395 post 1 still v3**
  (2026-09-03T22:48:20Z, 3 sections). `pending.json` diffed against the committed ledger: **identical apart from the two
  `checkedAt` stamps** — 14 applied live · 99 irrelevant · 3 applied 12.1.5, **0 unresolved, 0 removedSections**. Written to
  `data/official-notes.json` per step 4; `check-official-notes.mjs --base=HEAD` passes. (Tonight's nightly will supersede the
  stamps, as 0c6b740 did to yesterday's.)
- **Wowhead news RSS:** HTTP 200, 289,290 B, 40 items parsed per `<item>` block; window 2026-09-12 14:23 → 2026-09-14 00:06 CDT,
  newest id **382879** (Day-2 BlizzCon roundup). The 19 items newer than the 09-13 nightly's top id 382857 are ALL "WoW: Forever"
  panel coverage. Every article BODY was grepped for PTR / hotfix / tuning strings, not just titles: the only PTR hits are Diablo's
  (Iconic Uniques, Stone of Jordan) and one 12.2 feature line ("the Dummy Dome from PTR is getting an upgrade" — a Calibration
  Chamber announcement, not a PTR opening). **0 class tuning, 0 hotfix round-ups, 0 build posts.** News INDEX polled too
  (`data.news.newsData`, 20 posts, 1,552 pages): same top id, no lead over the RSS.
- **Blue tracker** (`data.blueTracker.default`, 50 entries): newest class post is still Linxy's **"Hotfixes - September 10"**
  (2336376, already the 2026-09-10 `hotfix` feed entry); everything newer is Nethaera's Sept-17 Q&A submissions thread and BlizzCon
  panel recaps. Topic **2335871** "Season 2 Class Tuning Plans" is at 195 posts, Kaivax still only at #1 and still **v1**
  (2026-08-12) — the Sept 22 pass it promised is still ahead. Thread **2317811** unchanged (17 posts, last 2026-07-31).
- **12.2 PTR check: still NOT open.** No 12.2 dev-notes thread, no PTR realm string anywhere in the RSS window, the index or the
  tracker. Opening the cycle stays an owner action; nothing touched. `ptr-builds.json` still 31 entries, newest 2026-09-10.
- 0 builds, 0 hotfixes, 0 tierSet edits (upkeep gate quiet). `data/official-notes.json` is this lane's only write.

## 2026-09-13 (nightly) — ledger clean a second night (116/116 sections unchanged, 0 unresolved); no new tuning anywhere; **BlizzCon announced 12.2 but NO PTR — owner action, nothing touched**

- **Revision ledger FIRST, from this run's pre-agent receipts** (`official-notes/evidence.json` + `pending.json`,
  checkedAt 2026-09-13T14:40:53Z). Both configured sources `status: success`: live hotfix topic **2336376 post 1
  still v36**, updated 2026-09-11T03:11:02Z, **113 sections**; the 12.1.5 dev thread **2344395 post 1 still v3**,
  updated 2026-09-03T22:48:20Z, **3 sections**. Every section hash is identical to the committed ledger, so all 116
  keep their prior resolutions (**14 applied live tuning · 99 irrelevant · 3 applied 12.1.5 preview**), **0
  unresolved**, **0 removedSections**. `data/official-notes.json` rewritten from `pending.json` with source
  identities, inventories, hashes and this run's check times exactly as received — the only change in the file is
  the two `checkedAt` stamps. `check-official-notes.mjs --base=HEAD` passes.
- **RSS sweep:** `wowhead.com/news/rss/all` HTTP 200, 354,642 B, 40 items parsed per `<item>` block (never by tag
  adjacency). Window 2026-09-11 17:00 → 2026-09-13 00:51 and it is **entirely BlizzCon 2026 coverage** — no Class
  Tuning, no hotfix round-up, no build post. **News INDEX** (`data.news.newsData`, brace-balanced from the id
  attribute) leads the RSS by nothing this run: same newest id 382857.
- **Blue tracker** (`data.blueTracker.default`, 50 entries → ~40 unique topics): newest class-tuning post is still
  Linxy's "Hotfixes - September 10" (topic 2336376), already logged as the 2026-09-10 `hotfix` entry. Everything
  newer is BlizzCon panel recaps, the Sept-17 Q&A announcement, and Linxy's **09-08 "The Unbinding of Kith'ix Raid
  Testing Schedule"** — a scheduling post with no class content, so no feed entry.
- **12.1 dev-notes thread 2317811.json fetched in full:** 17 posts, `last_posted_at` 2026-07-31T23:42:09Z,
  unchanged. The cycle is closed, not a lost thread (the rediscovery gotcha stays suspended).
- **OWNER ESCALATION, no agent action taken.** BlizzCon 2026 (2026-09-12) announced **patch 12.2 "Midnight:
  Eclipse"** (news=382820), plus 12.1.7 "Talebound", 12.2.5 and a Season 3 dungeon rotation. **No 12.2 PTR realm
  and no 12.2 dev-notes thread has opened** — the only PTR strings in the whole RSS window are Diablo's 3.2.0/3.2.1
  and a HotS hero. Opening a new forecast cycle (`PHASES.ptr`, new thread key, contract rows, `wcl-probe.mjs` zone
  probe) is an owner action, so **`PHASES`, the frozen 12.1 forecast, `ptr-builds.json` (31 entries, newest
  2026-09-10) and every archived PTR metric were left exactly as they are**, and the 12.1.5 lane stays notes-only.
  Worth knowing for that flip: the 12.2 announcement means the next cycle is now a *when*, not an *if*.
- Dormant lanes skipped by posture, not marked unreachable: zone-54 / 52 / 56 / 57 WCL PTR sweeps (their contract
  rows were removed at the flip). No tierSet touched → the upkeep gate is quiet. `npm run test:quiet` 546 pass /
  0 fail / 63 skipped (UI invariants absent on the runner by design); build clean; snapshot written.

## 2026-09-13 (local, scheduled) — ledger clean (116/116 unchanged, 0 unresolved); no new builds on any of four channels; 12.2 "Eclipse" ANNOUNCED at BlizzCon, no PTR

- **Scope: residential-only catch-up, run BEFORE today's nightly.** At 14:30Z origin/master was still `c21b150`
  (the 09-12 local run) and `gh run list` showed no 2026-09-13 nightly — the schedule event has been landing
  13:43–14:46Z all week (09-09 14:46, 09-10 14:36, 09-11 14:35, 09-12 13:43), so it had simply not fired yet.
  Kept the default catch-up scope rather than a full refresh: the nightly is expected, and two independent
  regenerations of the same day do not merge. Manifest deliberately NOT rewritten.
- **Revision ledger first**, from a LOCAL `node src/fetch-official-notes.mjs` (checkedAt 2026-09-13T14:30:58Z; no
  nightly receipt existed yet to preserve). Both sources `status: success` — live-hotfixes topic 2336376 post 1 still
  **version 36** (edited 2026-09-11T03:11:02Z), ptr-preview topic 2344395 post 1 still **version 3** (edited
  2026-09-03T22:48:20Z), both matching the committed ledger's revision AND updated time. Pending vs committed deep-compared
  with `checkedAt` stripped: **byte-identical** (74,192 chars both sides) — 116 sections on both sides, 0 added, 0 removed,
  0 outline hashes changed, 0 tombstones, **0 unresolved**. The only write this produced was the two `checkedAt`
  values (a 2-line diff), and `check-official-notes --base=HEAD` passed on it — but that write was **SUPERSEDED,
  not pushed**: the nightly fired at 14:38Z while this run was verifying, its publish landed `0c6b740` at 14:59Z
  with its own trusted receipt and later `checkedAt`, so the held local commit was dropped (reset to origin/master,
  no rebase) and only these log entries were re-applied. Net data change from this run: **none**.
- **RSS** (HTTP 200, 354,642 B, 40 items, parsed per `<item>` block): the whole window is **BlizzCon 2026** (news
  382809–382857, Sat 09-12 12:00Z → Sun 09-13 00:51Z). Newest class-TUNING item is still news=382799 (the stored
  2026-09-10 hotfix). No "Class Tuning", no "Hotfixes", no Development Notes item.
- **12.2 PTR announcement check — ANNOUNCED, NOT OPENED.** news=382820 "Midnight: Eclipse Announced as Patch 12.2 —
  Reveal Cinematic" and news=382850 (roadmap: 12.1.7 "Talebound" rogue-like mode BEFORE 12.2; Wrath Remix summer 2027
  after 12.2.7). Read both bodies from `content:encoded`: cinematic + roadmap only, **no PTR date, no development-notes
  thread, no class notes**. Nothing agent-side follows from it — opening a cycle is the owner action recorded in the
  posture block. Flagged for Riley: the next cycle will be **12.2 "Eclipse"**, with a 12.1.7 interim patch in between.
  Also seen, none tuning: 382846 (spec-based top-5% M+ achievements in 12.2), 382831 (Season 3 M+ rotation),
  382844 (final raid "The Worldcore"), 382825 (legendary caster dagger in 12.2), 382849 (transmog in 12.2.5).
- **News INDEX** (`data.news.newsData`, brace-balanced from the id attribute; 20 posts, 1,551 pages): top id 382857,
  agrees with RSS exactly — nothing ahead of it. **Both index and blue tracker drew CloudFront 403 (919 B) on a
  UA+Accept curl and 200 (43,117 / 69,334 B) with the full browser header set** — the documented rule, re-bitten.
- **Blue tracker** (`data.blueTracker.default`, 50 entries → 40 unique topics): all BlizzCon recaps (Blizzard
  Entertainment ×N), Kaivax's Sept 17 Q&A call, Linxy's 09-08 Kith'ix raid-testing schedule; newest class-relevant
  is still Linxy "Midnight Hotfixes - September 10" (topic 2336376, the ledger's source at v36). No standalone tuning
  topic.
- **Dev-notes thread 2317811.json**: 17 posts, highest_post_number 19, last staff post #19 Linxy 2026-07-31 (edited
  08-01). Closed cycle, quiet as expected; rediscovery gotcha stays suspended.
- `ptr-builds.json` unchanged at **31 entries**, newest 2026-09-10. No set-bonus line, no `tierSet.asOf` bump. 12.1.5
  stayed notes-only, `PHASES` untouched, frozen forecast untouched. Dormant WCL lanes (zone 52/54/56/57) skipped.
  Writeup coverage: 1 spec at `ptr: null` (Demonology Warlock, deliberate).
- Verify (on the pre-nightly tree `c21b150` + the checkedAt edit): `npm run test:quiet` **608 pass / 0 fail /
  1 skipped** (the permanent freeze-season skip; UI invariants ran — so the owner-deferred NEW-badge phone-card
  regression has self-healed as predicted). Build OK (1948.4 KB). `freeze-season`: 8 pairs live, nothing to freeze.
  `check-refresh --manifest`: the expected `startedAt … 25h old` line plus the stale gitignored 09-08
  `wcl-fetch/evidence.json` leftover (no WCL fetch this run, WCL rows untouched, left in place as on 09-11).
  **No snapshot written by this run**: the only rendered diff was the two `checkedAt` stamps, no tier/rank/projection
  state moved, and a 09-13 history point would only have masked a dropped nightly — the nightly then wrote the real
  `2026-09-13.json` itself. Re-verified after the reset: `npm run test:quiet` green on `0c6b740` + these logs.

## 2026-09-12 (nightly) — ledger clean (116/116 sections unchanged, 0 unresolved), no new builds on any of four channels

- **Revision ledger first**, from the pre-agent `official-notes/` artifact (checkedAt 2026-09-12T13:45:39Z). Both sources
  fetched `status: success` — live-hotfixes topic 2336376 post 1 at **version 36** (edited 2026-09-11T03:11:02Z) and
  ptr-preview topic 2344395 post 1 at **version 3** (edited 2026-09-03T22:48:20Z), both matching the committed ledger's
  recorded revision AND body hash. Diffed section by section: **116 sections on both sides, 0 added, 0 removed, 0 outline
  hashes changed**, 0 tombstones, therefore **0 unresolved obligations** — every section keeps its prior resolution
  (17 applied, 99 irrelevant). The only write to `data/official-notes.json` is each source's `checkedAt`; verified with
  a normalised deep-compare that the two files are otherwise byte-identical before writing.
  `check-official-notes --base=HEAD` passes.
- **RSS** (HTTP 200, 202,633 B, 40 items, parsed per `<item>` block): newest class item is still **news=382799**
  (09-10 class bugfixes), which is the stored 2026-09-10 entry. Newest item overall is news=382646, a Delve gravestone
  article. **News INDEX** polled too (it leads RSS within a run): `data.news.newsData` brace-balanced from the id
  attribute, 20 posts, top id 382646 — nothing class-relevant ahead of RSS. **Blue tracker**: 50 entries → 40 unique
  topics, newest class-relevant are Linxy's "Midnight Hotfixes - September 10" (2336376, the compilation the ledger
  covers) and the 12.1.5 dev notes (2344395, the ptr-preview source). No untracked tuning topic.
- **Dev-notes thread 2317811.json** fetched directly: 17 posts, highest_post_number 19, newest Linxy post 2026-07-31
  (edited 08-01). Quiet since the cycle closed — expected under the between-cycles posture, not a lost thread.
- `ptr-builds.json` unchanged at **31 entries**, newest 2026-09-10. No set-bonus line landed, so no `tierSet.asOf` bump.
  12.1.5 stayed NOTES ONLY — `PHASES` untouched, nothing into ptr-builds or any `ptr` verdict, no forecast reopened.
  The RSS window's 12.1.5 Kith'ix raid-testing schedule and datamining articles were read as preview material only.
- Dormant lanes correctly skipped (zone 52/54/56/57). Writeup coverage: **1** spec at `ptr: null` (Demonology Warlock,
  the deliberate "source reported no changes" case).

## 2026-09-11 (nightly) — ledger clean (116/116 sections unchanged, 0 unresolved), no new builds on any of four channels

- **Revision ledger first**, from the pre-agent `official-notes/` artifact (checkedAt 14:37:49Z). Both sources fetched
  `status: success` — live-hotfixes topic 2336376 post 1 at **version 36** (edited 2026-09-11T03:11:02Z) and
  ptr-preview topic 2344395 post 1 at version 3. Diffed section by section against `data/official-notes.json`:
  **116 sections on both sides, 0 added, 0 removed, 0 outline hashes changed**, 0 tombstones, therefore **0 unresolved
  obligations**. The 09-11T03:11 edit had already been reconciled by the same-day local run at 14:12, so every section
  legitimately retains its prior resolution (14 applied live-tuning references, 99 explicit irrelevant reasons, 3
  applied 12.1.5 preview note sets). The ONLY write to the ledger is each source's `checkedAt`; no disposition,
  reference, note, hash or source date altered. `check-official-notes --base=HEAD` passes.
- **Wowhead RSS** HTTP 200, 203,920 B, 40 items parsed per `<item>` block. Newest class item is news=**382799**
  "Wildfire Bomb, Glory of the Vanguard…", pubDate 2026-09-11T03:43Z — **already** the stored 2026-09-10 hotfix entry
  (same id and slug). No new feed entry.
- **News INDEX** polled too, since it leads RSS within a run: `data.news.newsData` brace-balanced from the id
  attribute, 20 posts, top id 382799 — nothing ahead of RSS this time.
- **Blue tracker** swept for standalone blue posts outside the tracked thread: `data.blueTracker.default`, 50 entries,
  ~40 unique topics. Newest class-relevant are Linxy "Midnight Hotfixes - September 10" (topic 2336376, the running
  compilation the ledger already covers) and "Class Tuning Incoming - September 1" (logged). No untracked tuning topic.
- **Official 12.1 dev-notes thread** `2317811.json` fetched directly: 17 posts, highest_post_number 19, newest Linxy
  post 2026-07-31 (edited 08-01). Quiet since the cycle closed — expected under the between-cycles posture, NOT a lost
  thread, and the rediscovery gotcha stays suspended.
- `data/ptr-builds.json` unchanged: 31 builds, newest 2026-09-10. Zone-52/54/56/57 sweeps correctly skipped (dormant;
  their contract rows were removed at the flip). 12.1.5 stayed NOTES ONLY — PHASES untouched, nothing written into
  ptr-builds or a `ptr` verdict, no forecast reopened, no archived PTR metric relabelled.
- Writeup coverage recomputed rather than remembered: **1** spec at `ptr: null`, Demonology Warlock — the deliberate
  "the source reported no changes" null.

## 2026-09-11 (local, scheduled) — new 09-10 live hotfix logged (7 class lines), a SILENT 09-09 edit caught by the ledger (Totemic → Stormbringer), 8 obligations resolved

- **Scope: residential-only catch-up, pushed BEFORE the nightly's window.** No nightly commit
  existed for 09-11 at 14:10Z, but per the 09-08 lesson (the schedule has settled at roughly
  +4h, ~14:40–15:10Z) a nightly was assumed to still be coming, so nothing CI regenerates was
  touched — no tier, metric or WCL work. The official-note ledger and feed WERE worked, because
  they are deterministic reads of one canonical post: a nightly starting after this push simply
  finds the obligations already resolved.
- **Official revision ledger ran FIRST**, locally (`node src/fetch-official-notes.mjs`, checkedAt
  2026-09-11T14:12:31Z): `live-hotfixes` (topic 2336376) post 1 moved **version 33 → 36**, last
  edited 2026-09-11T03:11:02Z, title now "…Hotfixes - September 10"; **116 pending vs 109 stored
  sections, 8 unresolved**. `ptr-preview` (topic 2344395) unchanged — post 1 still v3, all 3
  sections hash-identical and still `applied`. NOTE: the on-disk `official-notes/topic-*.json`
  files are 09-05 leftovers the collector does not rewrite (post 1 at v31 inside them); the
  receipt TEXT lives in `evidence.json`, and that is what was read, with the heading nesting
  intact.
- **Seven of the eight are a new dated section, 2026-09-10** — Death Knight › Unholy, Hunter ›
  Survival, Mage › Hero Talents › Spellslinger, Paladin › Holy and › Protection, Rogue (bare
  heading), Shaman › Restoration, plus Player versus Player › Evoker. **New feed entry, kind
  `hotfix`, dated 2026-09-10** (ptr-builds 30 → 31), mirror news=382799 (pubDate 2026-09-10
  22:43 −0500), every line cross-checked present in the mirror body. Heading discipline: the
  Mage line has NO spec heading, only the hero-tree one, so it is `Mage (class-wide) —
  Spellslinger: …` (the 2026-08-27 Rogue/Deathstalker precedent — the data does not say which
  specs hold the tree, and guessing is the Hellcaller mis-attribution the 07-25 audit fixed);
  Rogue's Thistle Tea line is under a bare Rogue heading and class-wide on its face; the other
  five carry explicit spec headings. The PvP Evoker section triages out (`irrelevant`, PvP-only).
  **All seven class lines classify null** under `classifyHighlight` — a pure bug-fix and
  Cooldown-Manager round-up, so no arrow, no tally vote, and no misfire this time (the 09-09
  Warrior "damage buff / Cooldown Manager" misfire has no counterpart here: the Rogue tracking
  line carries no buff/nerf noun). No line names a set bonus; tier-set upkeep not engaged.
- **The eighth is the one worth the ledger's existence: the 09-09 Shaman section was EDITED
  without a new date or reply.** Its hash moved because Blizzard re-attributed the Crash
  Lightning / Windfury Weapon fix from **Totemic to STORMBRINGER**. Neither the RSS date sweep
  nor the mirror (news=382799 carries only the 09-10 block) could have surfaced this — exactly
  the September-4 Enhancement-set omission shape the ledger was built for. The stored 09-09
  Enhancement highlight now carries the corrected verbatim wording, the 09-09 entry's label
  records the correction with the version/edit time, and the section is re-resolved `applied`
  against the corrected line. `node src/check-official-notes.mjs --base=HEAD` passes.
- **Discovery lanes: nothing else.** Wowhead RSS 40 items, HTTP 200, 203,920 B, parsed per
  `<item>` block: newest item IS the 09-10 mirror; no "Class Tuning" post, no standalone blue
  post, no 12.2 PTR announcement (zero titles carry "12.2"). 12.1.5 items in the window are
  all feature/reward previews (Labyrinth rewards, decor, Kith'ix story prep) — none is a
  forecast-cycle trigger. Blue tracker and news index not re-swept this run: the ledger and RSS
  agree, and the nightly re-sweeps all four channels.
- **12.1.5 stayed NOTES ONLY.** `PHASES.ptr` untouched at null; nothing 12.1.5 entered the feed
  or any `ptr` verdict; no archived 12.1 PTR metric relabelled.
- **Dormant lanes correctly skipped**: zones 54 / 52 / 56 / 57. Stored rows untouched.
- Verification: `npm run test:quiet` 609 tests — 607 pass, 1 permanent skip, **1 fail that is
  PRE-EXISTING on HEAD `a4c58ec`** (re-run on the stashed tree: same `ui-invariants` phone-card
  assertion "the star rail does not stretch the first line of the card"; the owner-deferred
  NEW-badge 44px touch-target regression, which self-heals ~09-12 when the 09-09 Blood DK entry
  ages out). `freeze-season`: 8 pairs still live, nothing to freeze. `check-refresh --manifest`:
  the expected `startedAt … 23h old` line plus a stale local `wcl-fetch/evidence.json`
  (gitignored 09-08 leftover — no WCL fetch this run, manifest WCL rows untouched). Manifest
  deliberately NOT rewritten (partial run). Snapshot `2026-09-11.json` written, then rebuilt.

## 2026-09-10 (nightly) — new 09-09 live hotfix logged (7 class lines), all 7 official-note obligations resolved, two Warrior tier sets bumped

- **Official revision ledger ran FIRST**, from the pre-agent artifact (checkedAt 2026-09-10T14:39:26Z).
  `live-hotfixes` (topic 2336376) post 1 moved **version 31 -> 33**, last edited 2026-09-09T23:21:51Z, and the
  pending ledger surfaced **7 unresolved sections**, all dated 2026-09-09: Classes › Death Knight, Druid,
  Paladin, Priest, Shaman, Warrior, plus Player versus Player › Evoker. `ptr-preview` (topic 2344395) is
  unchanged — post 1 still version 3, all 3 sections hash-identical and still `applied`.
- **Canonical body read directly**, not off the Wowhead mirror: `2336376.json` (266,024 B, title now
  "World of Warcraft: Midnight Hotfixes - September 9", post 1 version 33 — matching the receipt exactly), with
  the `<ul>` nesting INTACT. Confirms the receipt line for line.
- **New feed entry, kind `hotfix`, dated 2026-09-09** (ptr-builds 29 -> 30). Six of the seven class lines sit
  under an explicit SPEC heading; the Flash Heal line sits under a **bare Priest heading** with no spec block, so it
  is logged `Priest (class-wide)` even though its own text names Discipline and Shadow — the 2026-09-02 Warrior
  Bladestorm precedent, heading structure over line text. The Enhancement Totemic line names its hero tree inside
  its own text under the Enhancement heading, so it stays spec-scoped (2026-08-31 Affliction/Hellcaller precedent).
  The whole PvP section (Preservation Evoker's Stasis-in-the-starting-room fix) triages out.
- ⚠ **classifyHighlight misfire, disclosed and left standing — this one is worth an owner fix.** Five of the seven
  class lines classify null, but BOTH Warrior lines classify **nerf**. The cause is mechanical: the clause carries the
  NOUN "damage buff" (matching the `up` regex `buff\w*`) beside the words "Cooldown Manager" (matching
  `RESOURCE_TERM`'s `cooldown`), so the resource inversion fires `up && res -> nerf` on a pure UI tracking line.
  Verified in isolation: "Arms Warrior — Slam damage buff can now be tracked in the Cooldown Manager." alone returns
  `nerf`. The verbatim blue-post text is stored anyway — rewording a highlight to steer the tally is gaming it
  (2026-09-03 precedent) — and the misfire **cannot move either arrow**, because Arms and Protection Warrior both
  carry `ptr.verdict: "Mixed"`, which outranks the tally; it only writes a −1 into their displayed basis line
  ("+5/−0" -> "+5/−1"). A fix would need `RESOURCE_TERM` to not match "Cooldown Manager", or the `up` verb regex
  to not match the noun "buff".
- **Tier-set upkeep: two specs.** Both Warrior lines name a Venomous Abyss set bonus, so `SET_KEYWORD` fires and
  Arms + Protection Warrior's `tierSet.asOf` advanced 2026-08-07 / 2026-07-08 -> **2026-09-09**, source set to the
  September 9 topic, with a dated parenthetical on set4 / set2 recording that only Cooldown Manager tracking changed
  and **no bonus behaviour or value moved**. Per the 2026-08-23 two-page rule the gearing mirror was re-synced in the
  SAME change (`harvest-specs.mjs`, then `--check`, then `gearing:build`) — the nightly has been able to do this
  since 2026-09-05, so it was NOT deferred to a local run.
- **Discovery lanes, all four swept, nothing else new.** Wowhead RSS: 40 items, HTTP 200, 204,557 B, parsed per
  `<item>` block — the mirror is news=382794 (2026-09-09T23:47). News INDEX (`data.news.newsData`, brace-balanced
  from the id attribute) leads no further, also topping out at 382794. Blue tracker (`data.blueTracker.default`,
  50 entries, deduped by topic): no standalone class-tuning blue post since "Class Tuning Incoming – September 1"
  (2026-08-31), already carried by the 2026-08-28 build entry. Nothing 12.1.5 entered the feed.
- **12.1.5 stayed NOTES ONLY.** `PHASES.ptr` untouched at null; no 12.1.5 material in ptr-builds or any `ptr`
  verdict; no archived 12.1 PTR metric relabelled. Note the RSS carried "The Unbinding of Kith'ix Raid Testing
  Schedule - Patch 12.1.5 PTR" (news=382788) — a raid-testing schedule, deliberately NOT a forecast-cycle trigger.
- **Dormant lanes correctly skipped**: zones 54 / 52 / 56 / 57. Their contract rows left at the flip; the stored
  rows are the closed cycle's final receipts and were not touched.
- **Writeup coverage recomputed, not remembered**: exactly one spec has no writeup — Demonology Warlock, whose null
  is deliberate. The expert-read lane stays dormant (`PHASES.ptr` null), as documented.

## 2026-09-09 (nightly) — nothing new in any channel; official ledger unchanged at 102 sections

**Official revision ledger first, as the skill orders.** This run's pre-agent receipt (checkedAt
14:49:21Z) returned both sources `success`: live-hotfixes topic 2336376 post 1 still **version 31** /
updatedAt 2026-09-05T01:21Z, ptr-preview topic 2344395 post 1 still **version 3** / updatedAt
2026-09-03T22:48Z. Every one of the **102 class sections** hashed identically to the committed ledger,
so all prior resolutions carried forward (**5 applied, 97 irrelevant**) — no new, edited, removed or
unresolved sections, and only `checkedAt` moved in `data/official-notes.json`.
`check-official-notes.mjs --base=HEAD` passes.
The 12.1.5 lane stayed **NOTES ONLY**: `PHASES.ptr` still null, nothing written into `ptr-builds` or any
`spec.ptr` verdict, no forecast reopened, no archived 12.1 PTR metric relabelled.

**Feed sweep — four channels, not one.** (1) Wowhead RSS 198,705 B, 40 items parsed per `<item>` block;
newest live 12.1 class item is still *September 4th Hotfixes* (news=382760), already logged.
(2) The news INDEX (which leads RSS within a run) brace-balanced from `data.news.newsData`: agrees, newest
382735. (3) Blue tracker `data.blueTracker.default`, 50 entries: newest class-relevant post is still
Linxy's 09-04 hotfix topic. The one new Linxy-flagged topic since, **2343549 "Week 3 of 3: Interrupts and
dispels"**, was fetched and is a PLAYER bug-report thread (a quest not counting warlock pets) — logged here
so the next run does not re-open it. (4) Dev-notes thread `2317811.json`: 17 posts, highest_post_number 19,
last post 2026-07-31 — the closed cycle, expected, rediscovery gotcha still suspended.
`ptr-builds.json` unchanged at **29 entries**, newest 2026-09-04. No set-bonus line landed, so no
`tierSet.asOf` bump and no gearing resync.
Everything newer in the feeds is 12.1.5 datamining, the Kith'ix raid-testing schedule, or non-class content.

Dormant lanes skipped as designed (zones 54 / 52 / 56 / 57); their contract rows left the manifest at the
flip, so they are absent rather than "unreachable". One writeup gap remains and is deliberate: Demonology
Warlock, whose source reported no changes.

## 2026-09-09 (local, scheduled) — ledger re-checked at a fresh receipt (102 sections, 0 unresolved, nothing moved upstream); no new live 12.1 tuning; no 12.2

- **Ran the trusted collector locally** because no nightly output landed today (see below):
  `node src/fetch-official-notes.mjs` → both sources `success`, checkedAt
  2026-09-09T14:14:40.941Z. live-hotfixes 99 class sections, ptr-preview 3.
- **Upstream has NOT moved.** Compared field-by-field against the committed ledger: post
  identity is IDENTICAL on both sources — live-hotfixes topic 2336376 post 1 still
  **version 31** (updated 2026-09-05T01:21:46Z, bodySha256 `443e3bd1e9d2…`), ptr-preview
  topic 2344395 post 1 still **version 3** (2026-09-03T22:48:20Z, `970dd474c20f…`). Section
  inventory diffed by (id + sha256): **0 sections only in the committed ledger, 0 only in the
  fresh receipt**. Dispositions carried forward untouched — live-hotfixes 2 applied / 97
  irrelevant, ptr-preview 3 applied, **0 unresolved, 0 removedSections**.
- **So the only edit was the intake stamp**, both `checkedAt` fields 09-08T14:47:08.969Z →
  09-09T14:14:40.941Z; `git diff --numstat` = 2 insertions, 2 deletions, and the built
  artifact moved by exactly the one rendered date (+ its CSP hash). This is the intake
  check advancing, NOT a new date for any tuning fact — CLAUDE.md's rule, held literally.
  `check-official-notes.mjs` went from "ledger does not match trusted current source
  revision/section inventory" (its only failing condition here is `checkedAt` inequality)
  to green.
- **RSS sweep: 40 items, no new live 12.1 tuning.** The newest tuning-shaped items are still
  "September 4th Hotfixes — Ula'tek, Classes, Catalyst" (published 09-05) and "…Hotfixes for
  September 3" (09-04), both already logged — `data/ptr-builds.json` newest entries are the
  09-04 and 09-03 `kind: "hotfix"` round-ups. Nothing since.
- **No 12.2 anywhere.** Every PTR-category item in the feed is 12.1.5 (Kith'ix raid testing
  schedule, Labyrinth rewards, trading-post/transmog datamining, maps, renown). The one
  class-relevant 12.1.5 item, "Class Changes for Devourer DH — 12.1.5 PTR Development Notes"
  (09-03), is exactly the ptr-preview post already distilled into the three applied sections
  (Demon Hunter|Devourer, Hunter|Marksmanship, Warrior|Protection). 12.1.5 stays notes-only:
  `PHASES.ptr` untouched, frozen forecast untouched.
- **Dormant lanes skipped as specified** — the four PTR WCL zone sweeps (54/52/56/57) were not
  attempted and need no manifest excuse; their contract rows went at the flip.

## 2026-09-08 (nightly) — official ledger clean (102 sections, 0 unresolved); no new live 12.1 tuning in any of the four channels

- **Revision ledger FIRST, before the RSS/date sweep.** `official-notes/evidence.json` +
  `pending.json` checkedAt 2026-09-08T14:47:08Z, both configured sources `success`:
  · **live-hotfixes** topic 2336376 post 1, **version 31**, updatedAt 2026-09-05T01:21:46Z, 99 sections
  · **ptr-preview** topic 2344395 post 1, **version 3**, updatedAt 2026-09-03T22:48:20Z, 3 sections
  Body hashes and **all 102 section hashes identical** to the committed ledger, so every prior
  resolution carried forward untouched — **5 applied / 97 irrelevant / 0 unresolved**, and
  `removedSections` stayed empty on both sources. Neither post number nor version moved, which
  is the point of hashing every section rather than trusting the newest feed date. Wrote
  `pending.json` to `data/official-notes.json`; the ONLY diff is `checkedAt`
  (2026-09-07T16:04:02Z → 2026-09-08T14:47:08Z), 2 insertions / 2 deletions.
  `node src/check-official-notes.mjs --base=HEAD` passes.
- **12.1.5 stayed NOTES ONLY.** `PHASES.ptr` is still null, nothing entered `ptr-builds.builds`
  or any `spec.ptr` verdict, no forecast reopened, no archived 12.1 PTR metric relabelled. The
  three preview sections still carry their attributed summaries (Devourer DH Collapsing Star /
  Demonic Intensity / Monster Rising; Marksmanship's Blood Fletching replacing Unload;
  Protection Warrior's Execute rework).
- **Four channels swept, not one — all four agree there is nothing new.**
  1. **Wowhead news RSS** `/news/rss/all`: HTTP 200, 187,755 bytes, 40 items parsed per `<item>`
     block (never by tag adjacency). Newest LIVE 12.1 class item is still *September 4th Hotfixes
     — Ula'tek, Classes, Catalyst* (news=382760, Fri 04 Sep 20:30 CDT), already logged as the
     2026-09-04 entry.
  2. **The news INDEX**, which leads the RSS within a run: `data.news.newsData` brace-balanced
     from the id attribute (the `</div>`-terminated slice and a naive `}` search both fail here).
     Page 1 of 1,549 agrees with the RSS exactly; newest is news=382776, 12.1.5 Labyrinth
     rewards, 2026-09-08 09:00. **Both index and blue tracker needed the FULL browser header
     set** — a short UA+Accept curl drew CloudFront 403 (919 bytes) on both, and the full set
     returned 200 at 45,053 / 68,243 bytes. Re-learned this run; it is the documented rule and
     it still bites.
  3. **Blue tracker**: `data.blueTracker.default`, 50 entries (~30 unique topics). Newest
     class-relevant post is Linxy *World of Warcraft: Midnight Hotfixes - 4 September* at
     2026-09-04T20:22Z. No standalone class-tuning blue post since — the Kaivax-style channel
     that hid six healer specs for 17 days is clear.
  4. **Official dev-notes thread** `2317811.json`: 17 posts, highest_post_number 19, last post
     **#19 Linxy 2026-07-31**. That is the CLOSED 12.1 PTR cycle sitting quiet exactly as
     expected, and the thread-rediscovery gotcha stays suspended — the 12.1.5 preview has its
     own configured source and opening a 12.2 cycle is an owner action.
- Everything newer in the feeds is 12.1.5 datamining (Labyrinth rewards, Kith'ix loot, trading
  post, mount models), RWF recaps, or non-class content. **No tier-set-touching highlight
  landed**, so no `spec.tierSet` needed bumping and the gearing mirror needed no resync.
- **Dormant lanes untouched, as designed**: zones 54 / 52 / 56 / 57 were not swept and carry no
  contract row. Their stored rows in specs.json are the closed cycle's final receipts.
- ptr-builds.json unchanged: 29 entries, newest 2026-09-04, oldest 2026-06-18.

## 2026-09-07 (nightly) — official ledger clean (102 sections, 0 unresolved); no new live 12.1 tuning in any of the four channels

- **Revision ledger FIRST, before the RSS/date sweep**, because a post can be edited without
  acquiring a new date or reply. `official-notes/evidence.json` + `pending.json` checkedAt
  2026-09-07T16:04:02Z, both configured sources `success`:
  · **live-hotfixes** topic 2336376 post 1, **version 31**, updatedAt 2026-09-05T01:21:46Z, 99 sections
  · **ptr-preview** topic 2344395 post 1, **version 3**, updatedAt 2026-09-03T22:48:20Z, 3 sections
  Body hashes and **all 102 section hashes identical** to the committed ledger; `removedSections`
  empty on both. Dispositions carried forward on identical hashes rather than re-asserted:
  **5 applied, 97 irrelevant, 0 unresolved.** `data/official-notes.json` rewritten from the trusted
  pending ledger — the only change is the two `checkedAt` stamps. `check-official-notes.mjs` passes.
- **Wowhead RSS**: 40 items, 2026-09-02 → 2026-09-07, parsed per `<item>` block (never by tag
  adjacency). Newest class-tuning item is "September 4th Hotfixes - Ula'tek, Classes, Catalyst",
  **already logged** as the 2026-09-04 hotfix entry. Everything after it is 12.1.5 datamining,
  Trading Post, the raid skip, TBC and BlizzCon — no live 12.1 class tuning.
- **News INDEX polled too**, because it leads the RSS within a run. `data.news.newsData`
  brace-balanced from the id attribute: 20 posts, newest **382771** (09-07, Trading Post
  datamining). Nothing the RSS did not already have.
- **Blue tracker** (`data.blueTracker.default`, same parse): 50 entries, deduped by topic. Newest
  class-relevant blue post is Linxy's "Midnight Hotfixes - September 4" on topic **2336376** — the
  running compilation the ledger already covers. No newer standalone class-tuning topic; the last
  was "Class Tuning Incoming – September 1", already in the feed.
- **Official dev-notes thread** `2317811.json`: still ends at **post 19** (Linxy, 2026-07-31). That
  is the closed 12.1 PTR cycle, not a lost thread — the rediscovery gotcha stays suspended and no
  thread key was touched.
- **Nothing written to the feed.** No build/hotfix entry added, no `tierSet` touched (so the upkeep
  gate and the gearing mirror needed no change). The 12.1.5 lane stayed NOTES ONLY: `PHASES`
  untouched, nothing into `ptr-builds.builds` or any `spec.ptr` verdict, no forecast reopened, no
  archived 12.1 PTR metric relabelled.
- **Dormant lanes correctly skipped**: zone-54 raid testing, zone-52 Dummy Dome, zone-56 PTR M+ and
  zone-57 Tidebound Grotto were not attempted and have no contract rows. Their stored values remain
  the closed cycle's final receipts.

## 2026-09-06 (nightly, SECOND run of the day) — ledger re-checked at a fresh receipt, no new sections; no new live 12.1 tuning; 12.1.5 stays notes-only

- **Revision ledger first, as the skill orders.** `official-notes/evidence.json` (`checkedAt`
  2026-09-06T19:44:27Z, i.e. a receipt taken ~6h after the 13:49Z one the previous run consumed)
  reports BOTH configured sources `success`: `live-hotfixes` topic 2336376 post 1 at **version 31**,
  `updatedAt` 2026-09-05T01:21:46Z, body sha `443e3bd1e9…`; `ptr-preview` topic 2344395 post 1 at
  **version 3**, `updatedAt` 2026-09-03T22:48:20Z, body sha `970dd474c2…`. Both revision numbers and
  both body hashes are unchanged against the committed ledger.
- **Section inventory compared whole, not by post version.** A structural diff of
  `official-notes/pending.json` against `data/official-notes.json` reports the two files
  **byte-identical apart from `checkedAt`** — so 0 sections added, 0 removed, 0 with a changed
  sha256, across 99 live-hotfix sections (2 `applied`, 97 `irrelevant`) and 3 ptr-preview sections
  (all 3 `applied`). **0 unresolved, 0 tombstones.** The ledger was rewritten with this run's
  `checkedAt` and nothing else; `node src/check-official-notes.mjs` passes.
- **Live 12.1 tuning lane: nothing new, four channels polled.**
  · **Wowhead news RSS** — 200, 177,836 bytes, 40 items parsed per `<item>` block (never by tag
    adjacency), window 2026-09-02..2026-09-06. Newest hotfix round-up is still **news=382760,
    "September 4th Hotfixes - Ula'tek, Classes, Catalyst"**, which is already the feed's newest
    entry. Nothing tuning-shaped on 09-05 or 09-06.
  · **Wowhead news INDEX** (`data.news.newsData`, brace-balanced from the id attribute) — 20 posts,
    top id 382762 at 2026-09-06 13:43. It agrees with the RSS rather than leading it this run, so
    nothing landed mid-run.
  · **Official dev-notes thread 2317811** — fetched by curl (not WebFetch, which truncates the
    `post_stream`): 17 posts, `last_posted_at` **2026-07-31T23:42:09Z**. The 12.1 PTR thread is
    closed, exactly as the between-cycles posture says; this is not a lost thread.
  · **Blue tracker** (`data.blueTracker.default`) — 50 entries, 40 unique topics. Newest
    class-relevant blue post is Linxy's 09-04 hotfix topic (2336376), already logged. **Topic
    2342331 "Class Tuning Incoming – September 1" was re-fetched and re-read at version 4**
    (post 1, `updated_at` 2026-08-31T19:44:31Z) because the tracker restamps it: its fifteen PvE
    lines plus the class-wide Shaman/Farseer line are line-for-line what the 2026-08-28 feed entry
    already carries, and the separate Player versus Player section remains out of scope.
- **Nothing written to `data/ptr-builds.json` and no `tierSet` touched** — no build, no hotfix
  round-up and no set-bonus line arrived. The tier-set upkeep gate and the
  `specsAffected` ↔ `highlights` coverage gate both stay green untouched.
- **12.1.5 remains NOTES ONLY.** `PHASES.ptr` is still null, no 12.1.5 material entered
  `ptr-builds.builds` or any `spec.ptr` verdict, the frozen 12.1 forecast was not reopened, and no
  archived 12.1 PTR metric was relabelled. The three preview sections stay in the ledger's
  `notes[]` lane where they render as "12.1.5 PTR preview — not live".
- **Dormant lanes skipped, as designed**: the four WCL PTR zone sweeps (54 raid / 52 Dummy Dome /
  56 M+ / 57 Grotto). Their contract rows were removed at the flip, so they get no manifest row and
  the stored zone-52/54/56 receipts were not touched.

## 2026-09-06 (nightly) — official ledger clean and unchanged, no new live 12.1 tuning, 12.1.5 stays notes-only

- **Revision ledger first, as the skill orders.** `official-notes/evidence.json` (`checkedAt`
  2026-09-06T13:49:37Z) reports BOTH configured sources `success`: `live-hotfixes` topic 2336376 post 1
  at **version 31**, `updatedAt` 2026-09-05T01:21:46Z, body sha `443e3bd1e9…`; `ptr-preview` topic
  2344395 post 1 at **version 3**, `updatedAt` 2026-09-03T22:48:20Z, body sha `970dd474c2…`. Both the
  revision numbers and the body hashes are IDENTICAL to the committed ledger, and a section-by-section
  comparison found **0 sections added, 0 removed and 0 whose sha256 changed** (99 live-hotfix sections,
  3 ptr-preview sections). Every prior resolution therefore carried forward untouched — 2 applied +
  97 irrelevant on the live lane, 3 applied on the preview lane, **0 unresolved**, 0 tombstones. The
  only edit written to `data/official-notes.json` was the two `checkedAt` timestamps; no disposition,
  reference, section hash, source identity or date was invented or altered.
  `node src/check-official-notes.mjs` passes ("Official-note revisions, section dispositions and
  applied references verified").
- **12.1.5 stays NOTES-ONLY.** `PHASES.ptr` is still null, nothing entered `ptr-builds.builds` or any
  `spec.ptr`, no tier set moved, no forecast reopened, and no archived 12.1 PTR metric was relabelled.
  For the record, the three preview sections cover **Devourer DH, Marksmanship Hunter and Protection
  Warrior** — the same three specs both distilled creators independently describe as the whole first
  round of 12.1.5 class changes.
- **RSS sweep — 40 items, window 2026-09-01T19:23 to 2026-09-06T08:00.** Parsed per `<item>` block
  (title THEN link), never by tag adjacency. Nothing new in the LIVE 12.1 tuning lane: the newest
  relevant article is "September 4th Hotfixes - Ula'tek, Classes, Catalyst" (2026-09-04 20:30), which
  is already logged as the 2026-09-04 hotfix entry and already resolved in the ledger. Everything else
  12.1.5-flavoured is content datamining (Kith'ix raid loading screen, cantrip items, labyrinth maps,
  mounts, key bindings, Prey renown, delve Hall of Fame) plus the "Class Changes for Devourer DH -
  Midnight 12.1.5 PTR Development Notes" article that the preview lane already owns. **No 12.2 PTR
  announcement.**
- **News INDEX polled as well, because it LEADS the RSS.** `data.news.newsData` extracted by anchoring
  on the id attribute and brace-balancing (string-aware) — 20 posts, `totalPages` 1548, newest
  **382640, 2026/09/06 08:00**, identical topline to the RSS. Nothing landed mid-run.
- **Blue-tracker sweep (step 3b) — the standalone-blue-post channel is quiet.** 50 entries parsed from
  `data.blueTracker.default`, deduped by topic. Newest Blizzard class content is Linxy's
  "World of Warcraft: Midnight Hotfixes - September 4" (topic 2336376, 2026-09-04 20:21) — the same
  post the trusted collector reads — and "Hotfixes: September 4, 2026". Since then: only 12.1.5
  overview/mount/PTR-category posts and BlizzCon marketing. The last CLASS TUNING post remains
  Linxy's "Class Tuning Incoming – September 1" (2026-08-31), already in the feed as the 2026-08-28
  build entry.
- **Official 12.1 dev-notes thread re-polled and still closed.** `2317811.json` via curl (not WebFetch,
  which truncates to post 1): HTTP 200, 72,308 bytes, `posts_count` 17, `last_posted_at`
  **2026-07-31T23:42:09Z** — unchanged since the cycle closed, exactly as the between-cycles posture
  predicts. Not a lost thread; the rediscovery gotcha stays suspended until an owner opens 12.2.
- **Dormant lanes skipped by design**, per the posture block: the four WCL PTR zone sweeps (54 raid /
  52 Dummy Dome / 56 M+ / 57 Tidebound Grotto). Their contract rows left at the flip, so they get no
  manifest row and nothing was fetched from warcraftlogs.com by this session.
- **Writeups**: exactly one spec still has `ptr: null` — Demonology Warlock, whose null is the
  deliberate "the source reported no changes" case, not a gap. Nothing was manufactured to close it.
  No tier-set-touching highlight landed, so the tier-set upkeep gate had nothing to pair and the
  gearing mirror needed no resynchronisation.

## 2026-09-05 (nightly, FOURTH run of the day) — official ledger clean and unchanged, no new live 12.1 tuning, 12.1.5 stays notes-only

- **Official revision ledger first, per the 2026-09-05 procedure.** `official-notes/evidence.json`
  and `pending.json` (checkedAt 2026-09-05T20:06:00Z) both come back `status: success`:
  live-hotfixes topic 2336376 post 1 at **version 31**, `updatedAt` 2026-09-05T01:21:46Z, 99 class
  sections; ptr-preview topic 2344395 post 1 at **version 3**, `updatedAt` 2026-09-03T22:48:20Z,
  3 sections. Every section hash matched its stored counterpart, so every prior resolution carried
  and **0 sections are unresolved** on either source; `removedSections` empty on both. The reviewed
  pending ledger was written to `data/official-notes.json` — the only byte that changed is each
  source's `checkedAt`. `check-official-notes.mjs` passes.
- **The three 12.1.5 sections stay exactly where they are**: Devourer DH, Marksmanship Hunter and
  Protection Warrior, each `applied` as a `notes[]` preview summary and nothing else. `PHASES.ptr`
  untouched (still null), no 12.1.5 line written into `ptr-builds.json`, no `spec.ptr` verdict, no
  tier set, no rating, no model input, no archived 12.1 PTR metric relabelled.
- **Wowhead news RSS**: HTTP 200, 193 KB, 40 items parsed per `<item>` block (never by tag
  adjacency), newest 2026-09-05 18:00 UTC. The only class-relevant item is "September 4th Hotfixes
  - Ula'tek, Classes, Catalyst" (news 382760, posted 09-04 20:30), which is the round-up already
  logged as the **2026-09-04** hotfix entry. Everything else is 12.1.5 datamining (loading screen,
  Cantrip loot, maps, key bindings, mounts, delve achievement, Venomstones, warband reputations),
  RWF coverage, encounter-only hotfixes ("Phase 2 Nerfed on Mythic Ula'tek", "Heroic Coiled Altar
  Nerfed"), or non-WoW. **Nothing new to log; the feed's newest entry stays 2026-09-04.**
- **News INDEX polled as well** (it leads the RSS within a run): `data.news.newsData` page 1, 20
  posts, top id 382694 at 2026-09-05 13:00 — nothing the RSS did not already carry.
- **Blue tracker swept** (`data.blueTracker.default`, 50 entries → ~30 unique topics). Newest blue
  class content is Linxy's "World of Warcraft: Midnight Hotfixes - September 4" (topic 2336376),
  i.e. the ledger's own live-hotfix source, already applied. "Week 3 of 3: Interrupts and dispels"
  (2026-09-01) was opened and checked: topic 2343549 is a PLAYER thread whose blue content is a
  quest-credit bug report about warlock pets — not class tuning, nothing to log. No standalone
  Kaivax/Linxy tuning post of the "Healer Tuning - July 16" shape exists since the last run.
- **Dev-notes thread re-polled for completeness**: `2317811.json` HTTP 200, 17 posts, highest post
  number 19, newest Linxy post **2026-07-31** — dormant exactly as the between-cycles posture
  predicts, and NOT a lost thread. No 12.2 PTR announcement anywhere in the sweep.
- **Dormant lanes skipped, not marked unreachable**: the four WCL PTR zone sweeps (54 raid, 52
  Dummy Dome, 56 M+, 57 Grotto) have no contract rows since the flip. Stored zone-52/54/56 rows
  are the closed cycle's final receipts and were not touched, refreshed, or reinterpreted.
- **Writeup coverage**: one spec still at `ptr: null`, Demonology Warlock, and that null is
  deliberate (the source reported no changes). No tier-set-touching highlight landed, so the
  tier-set upkeep gate had nothing to pair and no `tierSet.asOf` needed bumping — and therefore no
  gearing mirror resync was required this run.

## 2026-09-05 — Historical reconciliation and current tooltip corrections

- Fresh official compilation and scheduled announcements confirm all59 historical post-launch PvE sections already represented, including16 set-related sections. Replaced baseline exclusions with specific reason-only reconciliation notes; no duplicate tuning, changed dispositions or invented effective dates.
- Fresh Wowhead item tooltips271528/271564/271546 corrected Restoration2pc, Arcane4pc24% cap, Fire4pc25% damage bonus and Affliction2pc/4pc placement. Current tooltip corroborates Demonology's4pc effect despite Blizzard prose calling it2pc; discrepancy disclosed. Added dated caveats to3 archived writeups, preserving their verdicts and sources.
- Rebuilt gearing's derived spec data. Official-note digest now reports meaningful added/edited/removed applied summaries, including notes-only PTR preview, while ignoring check-time-only changes. The preview remains separate from forecasts.

## 2026-09-05 (nightly, THIRD run of the day) — official ledger clean, no new live tuning, 12.1.5 lane untouched

- **Revision ledger first, per the skill.** official-notes/evidence.json (checkedAt 18:47:09Z) reports
  both configured sources `success`: live-hotfixes topic 2336376 post 1 at **version 31**, updatedAt
  2026-09-05T01:21:46Z, **99 class sections**; ptr-preview topic 2344395, **3 sections**. Every section
  hash matches the committed ledger, so every prior resolution carried over — live 2 applied / 97
  irrelevant, 12.1.5 preview 3 applied notes (Demon Hunter, Hunter, Warrior) — with **0 unresolved and
  0 removed-section tombstones**. The reviewed pending ledger was written to data/official-notes.json;
  the ONLY change is the checkedAt instant. `check-official-notes` passes.
- **12.1.5 stayed NOTES ONLY**: PHASES untouched, nothing written into ptr-builds.json or any
  `spec.ptr` verdict, no forecast reopened, no archived 12.1 PTR metric relabelled.
- **Four channels swept, nothing new in the LIVE 12.1 tuning lane.** (1) Wowhead news RSS 193 KB, 40
  items parsed per `<item>` block, newest 2026-09-05 13:00 CDT — the only class-relevant items are the
  already-logged September 4 hotfix round-up (news=382760) and 12.1.5 preview coverage. (2) News INDEX
  (`data.news.newsData`, brace-balanced from the id attribute) polled too because the index leads the
  RSS: 20 posts, newest 382694, nothing the RSS lacked. (3) Blue tracker (`data.blueTracker.default`)
  50 entries / ~30 unique topics, newest 2026-09-04 20:23 — only the Sept 4 hotfix mirrors and 12.1.5
  items. The one candidate that looked like a standalone tuning post, Linxy in **"Week 3 of 3:
  Interrupts and dispels" (topic 2343549)**, was fetched directly and is a player quest-bug thread —
  worth recording so the next run does not re-chase it. (4) The tracked 12.1 dev-notes thread
  2317811.json: highest_post_number 19, last_posted_at 2026-07-31, quiet as expected for a CLOSED
  cycle — not a lost thread, and no agent-side thread-key change was made.
- No build or hotfix entry added; ptr-builds.json still tops out at the 2026-09-04 hotfix. No set
  bonus was touched this run, so the tier-set upkeep gate had nothing to pair.
- Writeup coverage recomputed rather than remembered: **1 spec at `ptr: null`** — Demonology Warlock,
  the deliberate one (the source reported no changes). Nothing to fill.
- Dormant lanes skipped as the between-cycles posture requires: zone 54 / 52 / 56 / 57 were NOT
  fetched and carry no contract rows; their stored receipts are the closed cycle's final state.

## 2026-09-05 (nightly, SECOND run of the day) — nothing new in the live 12.1 lane; the 12.1.5 PTR cycle is open and still UNINGESTED

- **Four channels polled fresh**, ~2h45m after the morning nightly. (1) Wowhead news RSS — HTTP 200,
  205 KB, 40 items parsed per `<item>` block, newest 2026-09-05 09:00 ("Tips and Tricks for Clearing
  Black Temple"). (2) Wowhead news INDEX (`data.news.newsData`, brace-balanced from the id attribute)
  polled as well because the index leads the RSS: 20 posts, newest id 382737. (3) Blue tracker
  (`data.blueTracker.default`): 50 entries, ~30 unique topics, newest 2026-09-04 20:23 — only the
  September 4 hotfix mirrors and the 12.1.5 items. No standalone live-12.1 class-tuning blue post.
  (4) Canonical sources read directly: Kaivax hotfix topic 2336376 is still titled "…Hotfixes -
  September 4", post 1 still at **version 31, last edited 2026-09-05T01:21:46Z** — identical to the
  state the morning run logged, so its round-up needed no re-log; and the 12.1 dev-notes thread
  2317811 is quiet at 19 posts, last 2026-07-31, which is what a closed cycle looks like.
- **Nothing logged.** `data/ptr-builds.json` is unchanged at 29 entries, newest 2026-09-04.
- The Enhancement Shaman set-bonus line in the September 4 round-up **stays deferred** to an owner
  local run for the reason already written into that entry's label: the tier-set upkeep gate plus the
  2026-08-23 two-page rule need `gearing/data/specs.json` resynced in the same change, and gearing/
  never travels in the nightly refresh artifact.
- ⚠️ **OWNER ESCALATION, second night running: the 12.1.5 PTR is open.** Linxy's "Midnight: 12.1.5 PTR
  Development Notes" (us topic **2344395**, posted 2026-09-03T16:42Z, version 3) was read this run and
  it carries a real CLASSES section — Demon Hunter › Devourer: Collapsing Star no longer goes on a
  5-second cooldown when its cast is cancelled, gains extra range after the cast starts, and its
  Fury-drain slow is now time-limited to ~1.5 casts; Void-Scarred bonuses (Demonic Intensity et al.)
  move onto Collapsing Star casts rather than onto entering Void Metamorphosis. The news feed now
  carries a dozen 12.1.5 articles. **Opening a cycle is an OWNER action** — new `PHASES.ptr` entry,
  thread key, contract rows, zone probe via `node src/wcl-probe.mjs` — and `PHASES.ptr` is still null,
  so nothing 12.1.5 was written to the feed, to a writeup, or to a take.
- Dormant WCL PTR zone sweeps (52/54/56/57) correctly not attempted; their contract rows left at the flip.

## 2026-09-05 (nightly) — ONE new live-12.1 hotfix round-up logged (Sept 4), with its Enhancement Shaman set-bonus line deliberately DEFERRED to a local run

- **Four channels polled.** (1) Wowhead news RSS — HTTP 200, 205 KB, 40 items parsed per `<item>`
  block (never by tag adjacency), newest 2026-09-05 08:00. (2) Wowhead news INDEX
  (`data.news.newsData`, brace-balanced from the id attribute) polled as well because the index
  leads the RSS: 20 posts, newest id 382757. (3) Blue tracker (`data.blueTracker.default`): 50
  entries, ~30 unique topics, newest 2026-09-04 20:23 — only the hotfix mirrors (Kaivax + Linxy EU,
  plus the Blizzard News copy) and Linxy's 12.1.5 PTR Development Notes. No standalone live-12.1
  class-tuning blue post. (4) Canonical source read directly: Kaivax topic 2336376, now titled
  "World of Warcraft: Midnight Hotfixes - September 4", post 1 at version 31, last edited
  2026-09-05T01:21:46Z, read with heading structure INTACT.
- **Logged:** `data/ptr-builds.json` gains a 2026-09-04 `kind: "hotfix"` entry (feed now 29) —
  Balance Druid (Stellar Amplification cooldown-manager tracking; Twin Moons' range increased by
  target combat reach) plus the non-class round-up (Ula'tek Ingested Venom / Serpent's Bite overlap,
  housing Secret Souvenir credit, the non-set Catalyst-eligibility fix, Preternatural Antivenom).
  Classification CHECKED not assumed: the consolidated Balance line scores **buff** on the range
  increase, and the line is left as written rather than reworded — steering `classifyHighlight` by
  editing a highlight would be gaming the outlook tally.
- ⚠️ **DEFERRED, and this is a structural nightly limit worth remembering.** The same round-up carries
  "Enhancement Shaman — Corrected an issue where the Venomous Abyss 4-set bonus was not properly
  increasing the upfront damage of Crash Lightning." It is real 12.1 PvE tuning and belongs in the
  entry, but it trips `SET_KEYWORD`, so the tier-set upkeep gate demands Enhancement Shaman's
  `tierSet.asOf` advance to 2026-09-04 — and since the 2026-08-23 two-page rule that also demands
  `gearing/data/specs.json` be re-synced in the SAME change. **gearing/ never travels in the nightly
  refresh artifact** (publish uploads `data/` + skill logs and checks out master for everything else),
  so a nightly-side bump is unpublishable in both directions, and this was VERIFIED rather than
  assumed: bumping the tracker alone reds `validate` with "gearing/data/specs.json: Enhancement Shaman
  tierSet.asOf does not match data/specs.json", and syncing the mirror as well would simply be dropped
  at publish and red Gate 1 there instead. So the line is omitted from `specsAffected`/`highlights`
  and the omission is written into the entry's own `label`, the manifest row and here — an explicit
  deferral, not a silent under-distillation. **OWNER local run:** bump the tierSet asOf/source, run
  `node gearing/src/sync-tracker-fields.mjs && npm run gearing:build`, then add the line and
  Enhancement Shaman to the 2026-09-04 entry. Same shape as the 09-03 Holy Priest and 09-02 Fire Mage
  set lines, both of which a local run handled.
- **12.1.5 still NOT ingested.** The feed now carries nine 12.1.5 PTR articles (loading screen, Kith'ix
  loot, renown catch-up, maps, key bindings, "Class Changes for Devourer DH") and Linxy's dev-notes
  topic is on the blue tracker. Opening a cycle is an OWNER action — new `PHASES.ptr` entry, thread
  key, contract rows, zone probe — and `PHASES.ptr` is still null, so nothing 12.1.5 was written.
- Dormant WCL PTR zone sweeps (52/54/56/57) correctly not attempted; their contract rows left at the flip.


## 2026-09-04 (nightly) — nothing new in the live 12.1 lane; the September 3 round-up was already logged by a local run ~30 minutes earlier, and 12.1.5 stays UNINGESTED pending the owner

- **Four channels polled, not one.** (1) Wowhead news RSS — HTTP 200, 210 KB, 40 items parsed per
  `<item>` block, newest 2026-09-04 09:30. (2) The news INDEX as well, because the index leads
  the RSS within a run: `data.news.newsData` brace-balanced from the id attribute, 20 posts,
  newest 382645 at 09-04 09:30. (3) The blue tracker (`data.blueTracker.default`), 50 entries,
  newest 2026-09-03 19:16 — no standalone class-tuning blue post. (4) The canonical source read
  directly rather than off the Wowhead mirror.
- **The running hotfix post's `updated_at` is NOT a new-content signal.** Kaivax's topic 2336376
  shows post 1 `updated 2026-09-04T00:15:02Z`, which looks like a September 4 round-up landed —
  it has not. Read with its heading structure intact, the newest dated section is still
  **"September 3, 2026"**, whose two class lines (Priest › Holy 2-set Renew fix, Shaman ›
  Restoration Totemic Oversurge fix) are already stored verbatim in the feed's 09-03 entry with
  Holy Priest's `tierSet.asOf` advanced. Check the newest **section date**, never the post's edit
  timestamp. The old 12.1 dev-notes thread 2317811 is unchanged since 2026-07-31.
- **12.1.5 — still an OWNER action, still nothing ingested.** Linxy's "Midnight: 12.1.5 PTR
  Development Notes" (us.forums topic 2344395) is unchanged from what this morning's local run
  recorded: post 1 at **version 3**, last edited 2026-09-03T22:48:20Z, with posts #2 and #3 the
  usual empty reservation posts. Wowhead's 12.1.5 PTR news category has grown to nine articles in
  the current 40-item feed, including **"Class Changes for Devourer DH — Midnight 12.1.5 PTR
  Development Notes"**. None of it was written anywhere: opening a cycle means a new
  `PHASES.ptr` entry, a new `thread` key, contract rows and a `wcl-probe` zone enumeration, and
  `PHASES.ptr` is still `null`. Corollary for the creator lane the same night — the three
  12.1.5-changes videos in the RSS sweep have no lane to land in either, and were left unseen
  rather than queued.
- **Dormant lanes correctly untouched**: zones 54 / 52 / 56 / 57 were not swept and their
  contract rows do not exist; the stored zone-52/54/56 rows remain the closed cycle's receipts.

- **PRUNE DEFERRED to a local run, deliberately — and the reason is structural.** This log is at
  31 entries against the header's "~20", but a NIGHTLY cannot prune safely: the 2026-08-15
  precedent is that durable rules must be promoted into `SKILL.md` *before* the entries carrying
  them are dropped, and the publish job stages only `data/`, `dist/` and
  `.claude/skills/*/log.md` (nightly.yml) — a `SKILL.md` edit made here is never committed. So a
  nightly prune can delete a rule but cannot save it. Checked before deferring: the drop range
  (11 entries) holds one ⚠️ that IS safe to drop — the 2026-08-22 gearing tier-set
  sync handoff, verified resolved tonight (`check-refresh --age` no longer reds
  `gearing-tierset-sync`) — and nothing else rule-shaped. Files are 107 KB, well under the Read tool's 262,144-byte gate, so
  nothing is broken by waiting for a run that can do both halves.
## 2026-09-04 (local, scheduled) — **PATCH 12.1.5 PTR IS LIVE AND OFFICIAL** — the between-cycles posture ENDS on an owner action, not on this run; plus the September 3 hotfix round-up logged (2 class lines, one of them a set-bonus fix)

Ran ~40 minutes BEFORE today's nightly rather than after it — the 09-04 nightly had not fired at
14:0xZ (yesterday's fired late, 14:42Z). So this is a genuine first sweep of the day, not catch-up
verification, and the two findings below reached master ahead of the night rather than behind it.

- **The 12.2-announcement lane finally fired — as 12.1.5.** Yesterday's run chased the Dalaran
  Gaming "PATCH 12.1.5 LEAKED?" title down to eight player posts with zero blue and correctly
  logged it as speculation. It is speculation no longer: **Linxy posted "Midnight: 12.1.5 PTR
  Development Notes" (us.forums topic 2344395) at 2026-09-03T16:42:43Z**, post 1 now at **version 3**
  (last edited 22:48:20Z — already revised once). Posts #2 and #3 are Linxy's EMPTY reservation
  posts (0 bytes), the same shape the 12.1 thread used to accumulate later build posts. Wowhead
  mirrors it at news=382730 and has opened a **PTR news category** (nine 12.1.5 articles in the
  current 40-item feed: the reveal, datamined maps, mount models, key bindings, Warband
  reputations, Ascendant Venomstones, a solo-delve achievement, a vendor-mount cost update).
- **NOTHING FROM 12.1.5 WAS INGESTED, AND THAT IS THE RULE, NOT CAUTION.** The between-cycles
  block is explicit: opening a cycle is an **OWNER action** — a new `PHASES.ptr` entry, a new
  `thread` key, contract rows, and a zone probe via `node src/wcl-probe.mjs` — "not an agent-side
  thread-key update". Two further reasons it would have been wrong to log these into
  `data/ptr-builds.json` as ordinary entries: (a) the feed is the LIVE 12.1 lane, so 12.1.5 PTR
  changes would render in the drawer's shipping/development surfaces as though they were live
  now; (b) with `PHASES.ptr` null there is no era to attribute them to, so `classifyHighlight`
  would fold next-patch changes straight into the live outlook tally. The feed's `thread` key is
  untouched and still points at the closed 12.1 thread (2317811).
- **What the owner is deciding about, recorded so the decision does not need re-fetching.** The
  notes carry real class work for three specs: **Devourer Demon Hunter** (Collapsing Star range,
  no 5s cooldown on cancel, Fury-drain slow now time-limited; Void-Scarred reshuffled — Demonic
  Intensity now resets The Hunt at +30%, Violent Transformation resets Soul Immolation instead,
  Monster Rising Intellect 15%→10% and Collapsing Star damage 15%→20%); **Marksmanship Hunter**
  (new talent **Blood Fletching**, and **Unload has been removed**); **Protection Warrior**
  (Execute no longer consumes optional Rage and its damage is **increased by 100%**; Colossus's
  Practiced Strikes now cuts Execute and Revenge Rage cost by 10). Non-class: the "Promise of
  Tomorrow" campaign, Labyrinths (mega-dungeon-scale Delves), Aqir Invasions, a one-boss raid
  (**The Unbinding of Kith'ix**), Ascendant Venomstones (upgrade a fully-upgraded S2 Hero/Mythic
  weapon, trinket or necklace — a **gearing-lane** input when it ships), and Legion/BfA warband
  reputations. All read off the canonical thread, not the mirror.
- **The live 12.1 lane also produced a real entry**: the **September 3 hotfix round-up**, logged as
  the `2026-09-03` `kind: "hotfix"` build. Read from Kaivax's canonical running blue post (topic
  2336376, title rolled to "…Hotfixes - September 3", post 1 at **version 29**, last edited
  2026-09-04T00:15:02Z) with its `<ul>` heading structure intact, rather than off the Wowhead
  mirror. Both class lines sit under an explicit SPEC heading — Priest › Holy and Shaman ›
  Restoration — so there was no class-wide or hero-tree attribution call to make; the Shaman line
  names Totemic inside its own text under the Restoration heading, so it stays spec-scoped (the
  08-31 Affliction/Hellcaller precedent). No PvP section this round.
- **Classification was checked, and the two lines DISAGREE — which is worth writing down because
  every previous round-up in this cycle classified uniformly null.** The Holy Priest line is null;
  the Restoration Shaman line classifies **buff**, on "did not properly increase the healing done
  by". That vote was left standing rather than reworded away: the stored text is the verbatim
  blue-post line, and editing a highlight to steer `classifyHighlight` would be gaming the outlook
  tally. It is also defensible on the merits — a talent that was silently doing nothing and now
  works is honestly more healing than before the hotfix. Measured after the rebuild: **it moved no
  published outlook arrow** (Restoration Shaman's outlook was already ↗ off its dated verdict,
  which outranks the tally).
- **The Holy Priest line touches a SET BONUS, so the tier-set upkeep gate fired and was closed in
  this same commit** — including the gearing mirror, which the nightly structurally cannot do
  (publish stages `data/`, `dist/` and skill logs, never `gearing/`). `spec.tierSet.asOf`
  2026-06-30 → **2026-09-03**, source moved to the September 3 blue post, and the set2 TEXT gained
  a dated parenthetical rather than a rewrite, because this was a bug fix making the printed
  2-piece behave as written — no value changed. Exactly the shape of the 2026-09-02 Fire Mage
  close. `node gearing/src/sync-tracker-fields.mjs` reported the one field, and
  `npm run gearing:build` rebuilt the artifact in the same change, so the two pages cannot state
  different set bonuses.
- **Two encounter-tuning articles again correctly NOT logged** — the raid nerfs inside the same
  September 3 round-up (Ula'tek Caustic Waves, a Blight Vein tooltip correction) are encounter
  work, not class tuning, so they ride in the entry's `Non-class:` highlight and produce no
  `specsAffected`.
- **Dormant lanes skipped as prescribed** — the four PTR WCL zone sweeps (54/52/56/57). Their
  contract rows were removed at the flip, so they need no manifest excuse and got none. **Note for
  the owner:** when 12.1.5 opens as a cycle, this is where the new zone ids get probed.
- **Archon deliberately NOT re-probed from residential.** The wall is measured not IP-scoped
  (re-tested 08-27 and 08-30); the manifest's nine `archon-*` rows carry yesterday's finding and a
  residential GET would only re-derive a settled transport fact.


## 2026-09-03 (local, scheduled) — live lane swept clean; NO 12.1.5/12.2 PTR announcement, and the creator "leak" is player speculation with no blue post behind it

Ran ~40 minutes after tonight's nightly published (`b60bde2`, publish 15:05:31Z), so this is
catch-up verification rather than a second pass. **Nothing changed; no file this skill owns was
touched.**

- **Wowhead RSS swept fresh** (`/news/rss/all`, direct browser-UA GET, HTTP 200, 210,538 bytes,
  40 items reaching back to 2026-09-01T16:04). Parsed per `<item>` block, never by tag adjacency
  — the documented trap. Newest tuning-relevant article is **"Ula'tek Changes and Class Fixes -
  Patch 12.1 Hotfixes for September 2nd"** (2026-09-03T01:07), which tonight's nightly already
  logged as the `2026-09-02` `kind: "hotfix"` entry off the canonical Kaivax blue post. **No
  September 3 round-up has been published yet** — the feed's two newest items (14:00 Mark of the
  Illidari consumables, 13:00 a Race-to-World-First think piece) carry no tuning.
- **Two encounter-tuning articles were correctly NOT logged**: "Phase 2 Nerfed on Mythic Ula'tek"
  (09-02T17:33) and "Nymrissa Wavecaller Nerfs, Mythic Twin Fangs Changed" (09-01T17:22). Both are
  RAID ENCOUNTER tuning — boss health and mechanics — not class tuning, so they produce no
  `highlights` and no `specsAffected`. Recorded here because the titles read tuning-shaped and a
  future run may re-find them and wonder why they are absent.
- **The 12.2 / next-cycle lane is still empty, and the "leak" was chased down rather than
  dismissed.** Queued creator video `Kq3saXcBt10` (Dalaran Gaming, 09-02) is titled "PATCH 12.1.5
  LEAKED? MAYBE NEW PTR LATER?", which is exactly the general-creator LEAD the firewall says to
  verify against the official forum before believing. Verified:
  - Wowhead RSS carries **no** 12.1.5 or PTR article across all 40 items.
  - Blizzard forum search (`search.json?q=PTR order:latest`, 50 topics) surfaces one on-point
    thread — **"They're Really Delaying 12.1.5 PTR"** (topic 2344249, 2026-09-03T04:44). Fetched
    it: **all 8 posts are players, zero staff/blue.** Its content is speculation (one poster
    claims 12.1.5 notes appeared on Facebook and were deleted; another cites an interview saying
    "before BlizzCon"). None of that is citable and none of it is ingested — hard rule 1.
  - Net reading: there is **no PTR announcement**, and the community's own framing is that the
    PTR is LATE, not that it opened. The between-cycles posture holds unchanged.
- **Dormant lanes skipped as prescribed** — the four PTR WCL zone sweeps (54/52/56/57). Their
  contract rows were removed at the flip, so they need no manifest excuse and got none.
- **Archon was deliberately NOT re-probed from residential.** The wall is measured **not
  IP-scoped** (re-tested residentially 2026-08-27, and again on 08-30), and tonight's nightly hit
  it from CI ~40 minutes before this run and recorded all nine `archon-*` rows unreachable. A
  residential GET therefore re-derives a settled transport fact and answers nothing the nightly
  did not already answer; SKILL.md's "do not re-derive" applies. Reported from the nightly's
  finding instead.

## 2026-09-03 (nightly) — ONE new feed entry: the September 2 hotfix round-up (3 class lines, all bug fixes); PTR zone lanes dormant

- **New entry, 2026-09-02, `kind: "hotfix"`.** Canonical source read directly rather than off the
  Wowhead mirror: Kaivax's running hotfix blue post (`us.forums.blizzard.com/en/wow/t/2336376.json`),
  title now "World of Warcraft: Midnight Hotfixes - September 2", post 1 at **version 27**, updated
  2026-09-03T01:11:28Z; read with its `<ul>` heading structure INTACT. Three class lines:
  Druid > **Feral** (Unseen Predator Rank 1 now prefers targets not immune / not taking under 5%
  physical damage), Warlock > **Destruction** (Font of Venomous Rage channel could be cancelled if
  spell-queued after Cataclysm), and a **bare Warrior heading** with no spec block beneath it
  (Bladestorm now displays as an important aura on nameplates) — logged **class-wide** rather than
  guessed onto Arms or Fury, the 2026-08-26 Warrior precedent. All three classify **null** under
  `classifyHighlight` — checked with the real function, not assumed — so this round-up casts no
  outlook vote, which is the honest reading of a pure bug-fix pass. **No line touches a set bonus**,
  so no `spec.tierSet` date moves and the upkeep gate stays quiet.
- **Mirror-vs-canonical discrepancy worth recording**: Wowhead's news=382725 renders the Warrior line
  as "**Bladetorm**"; the blue post reads **Bladestorm**. Logged the canonical spelling.
- **The whole Player versus Player section triages out** (Balance Druid's Faerie Swarm raid-frame
  debuff, the Evoker PvP-vendor staff fix, Preservation's Rewind-under-Cyclone fix) — standing rule,
  not an omission.
- **Non-class content folded into the entry's summary line**: Mythic Ula'tek phase-two nerfs (Soul
  Constrictor duration to 5s, Blight Vein damage -25%, both Mythic-only), two Doomscale Egg pickup
  fixes, and two Catalyst repairs (remaining Great Vault items now convertible; certain non-armor
  items no longer appear convertible).
- **Lanes polled and otherwise empty.** Wowhead news RSS HTTP 200, 40 items spanning 2026-08-30T13:00Z
  to 2026-09-03T14:00Z. The news INDEX (`data.news.newsData`, 20 posts, totalPages 1547) tops out at
  the same id as RSS (382623), so nothing landed mid-run. Blue tracker (`data.blueTracker.default`,
  50 entries, 50 unique topics) carries no standalone class-tuning post beyond what is already logged;
  Linxy's "Week 3 of 3: Interrupts and dispels" (topic 2343549) turned out to be a player thread with a
  blue reply, not a class post. The dev-notes thread 2317811 is at 17 posts, `last_posted_at`
  2026-07-31T23:42Z — correctly quiet for a closed cycle.
- **Not logged, deliberately**: news=382721 "Phase 2 Nerfed on Mythic Ula'tek" is the same encounter
  work already covered by the Sept-2 blue post and carries no class content; news=382699 "Season 2 DPS
  Rankings for The Venomous Abyss: Week 2" is Wowhead's own analysis, not a Blizzard post and not a
  registered tier list.
- **No 12.2 PTR announcement anywhere** (RSS, news index, blue tracker, forum). `PHASES.ptr` is still
  null, so the between-cycles posture holds: **zone lanes 54 / 52 / 56 / 57 stayed dormant** and were
  not fetched or marked unreachable — their contract rows left with the flip. The expert lane is
  dormant for the same reason (`audit:creators` reports the coverage sweep suppressed).
- Note for the next run: Dalaran Gaming's 2026-09-02 stream is titled "PATCH 12.1.5 LEAKED? MAYBE NEW
  PTR LATER?" — a LEAD only. Nothing in the official forum, the blue tracker or Wowhead's news index
  supports a new PTR, so nothing was logged; the video is QUEUED for transcript so the claim can be
  read and checked against the canonical thread next run.
## 2026-09-02 (local) — the Sept 1 round-up logged (3 new class lines), and the deferred Fire Mage tier-set action CLOSED

- **Between-cycles posture unchanged**: live lanes only; PTR zone sweeps (54/52/56/57) stayed
  dormant. No 12.2 PTR announcement anywhere in the Wowhead RSS sweep (40 items, 25 of them
  dated 08-31 or later) — the 12.1 development-notes thread this feed's `thread` key tracks is
  still the closed cycle's.
- **Canonical source, not the mirror**: Kaivax's running hotfix blue post (us.forums topic
  2336376), title now "World of Warcraft: Midnight Hotfixes - September 1", post 1 at
  **version 26**, last edited 2026-09-02T00:30:25Z, read with its `<ul>` heading structure
  INTACT so every class line sits under an explicit SPEC heading. The Wowhead article is the
  citation only (news=382716 — the id was VERIFIED off the RSS `<link>`, not guessed; a first
  draft of this entry carried 382731 and was corrected before commit).
- **ONLY THREE class lines are new to the feed**, all bug fixes with no tuning value: Unholy
  Death Knight (Mastery: Dreadblade / Foul Infections not increasing Plague Erupt crit chance),
  Beast Mastery Hunter (Wild Thrash ignoring target bounding radius) and Assassination Rogue
  (Caustic Spatter triggering off non-class Nature damage such as trinkets).
- **The Sept 1 tuning pass itself is NOT re-distilled** — the 2026-08-25 precedent. It shipped
  verbatim from the already-logged 08-28 "Class Tuning Incoming – September 1" post; checked
  line by line against that entry and matching at identical values across all 15 spec lines,
  including the Mistweaver Monk 4-piece line (activation chance 25%, was 20%) whose
  `spec.tierSet` was already advanced to the announcing post. The outlook tally counts LINES,
  so logging them twice would double-count one pass. The Shaman › Farseer Natural Harmony fix
  is likewise already carried by 08-28.
- **The whole Player versus Player section triages out** — roughly half the post (Devourer DH,
  Havoc, Druid/Feral/Restoration, Devastation and Preservation Evoker, Beast Mastery, all three
  Mage specs, Discipline, Rogue/Assassination, Elemental and Enhancement Shaman, Arms, Fury).
  Standing rule, not an omission.
- **One line DISCLOSED rather than logged**: "Resolved an issue where Protection Paladin's
  Mastery did not function correctly against Caustic Deluge or Eternal Venom" names a spec but
  sits under Dungeons and Raids › The Venomous Abyss › The Twin Fangs, not under a Classes spec
  heading. By the heading-structure discipline this feed uses it is an ENCOUNTER line, so it is
  recorded in the non-class summary rather than minted as a Protection Paladin change.
- **THE 08-31 DEFERRAL IS CLOSED — this is the local run that entry asked for.** The Mage › Fire
  line ("Resolved an issue where the 2-piece set bonus: Flamestrike did not correctly always
  grant Hot Streak when it is a guaranteed critical strike due to Pyroclasm") is now logged, and
  the tier-set upkeep gate duly required Fire Mage's `spec.tierSet.asOf` to advance to
  2026-08-31. That fired the 2026-08-23 two-page rule exactly as predicted — `npm run validate`
  red with two errors naming `gearing/data/specs.json` — which is precisely why the nightly
  structurally could not do it (its publish job stages only `data/`, `dist/` and the skill logs,
  never `gearing/`). Fixed in the SAME change with
  `node gearing/src/sync-tracker-fields.mjs && npm run gearing:build`; the mirror comparison is
  back to 0 drifting fields across all 40 specs. The set bonus TEXT is unchanged — a bug fix
  making the printed 2-piece behave as written, not a value change — so only `asOf` and `source`
  moved, with a dated parenthetical recording why.
- **Nothing published moved**: all 79 outlook arrows are byte-identical before and after. The
  Unholy DK line does classify `buff` (restoring intended crit scaling is a real gain), but it
  joined a tally that already pointed the same way rather than flipping a direction.
- **Manifest deliberately NOT touched** — partial run, per the local-run rule. `check-refresh
  --manifest` failed on exactly the one expected line (`startedAt … 23h old`); every other row
  it printed was a documented owner-accepted standing red.

## 2026-09-01 (nightly) — TWO feed changes: the Aug 31 hotfix round-up logged, and the Sept 1 tuning post gained a line at version 4

- **Between-cycles posture unchanged**: live lanes only. PTR zone sweeps (54/52/56/57) stayed
  dormant — the 12.1 PTR cycle is closed and those contract rows were removed at the flip.
- **(a) Wowhead news RSS** HTTP 200, 191 KB, 40 items spanning 2026-08-27T18:53Z to
  2026-09-01T09:30Z, parsed per `<item>` block (never by tag adjacency). Two candidates in
  the window, and they resolved in opposite directions:
  · `news=382701` "Coiled Altar and Ula'tek Fixes - Patch 12.1 Hotfixes for August 31st" —
    REAL class content, logged (below).
  · `news=382697` "Estimated DPS and Healing Increases for September 1st Class Tuning"
    (2026-09-01) — Wowhead's own class writers' *estimates* of the already-logged 08-28 pass,
    not a Blizzard post and not a new tuning event, so it is NOT a feed entry. Noting it here
    because it will look like new tuning to the next reader: it restates our 08-28 values with
    per-spec throughput guesses (Frost DK 7%, Feral 8-10% ST / 6% AoE, BM 6.5%, Frost Mage 6%,
    Fire 2.9%, Havoc 3.8%, Vengeance 0% with ~5.55% less damage taken, Resto Druid 4%).
- **(b) Wowhead news INDEX** (`data.news.newsData`, brace-balanced from the id attribute) and
  **(c) blue tracker** (`data.blueTracker.default`, 50 entries ≈ 30 unique topics) both polled.
  The tracker's newest entries are Kaivax "World of Warcraft: Midnight Hotfixes - August 31"
  (US topic 2336376, posted 2026-08-31 20:10) and Linxy "Class Tuning Incoming – September 1"
  (topic 2342331) re-listed at 2026-08-31 14:49 — the second is what surfaced the version bump.
- **(d) Official dev-notes thread** `2317811.json` HTTP 200, 17 posts, `last_posted_at`
  2026-07-31T23:42Z — quiet for a month, which is CORRECT for a closed cycle. The
  thread-rediscovery gotcha stays suspended.
- **NEW ENTRY: 2026-08-31, `kind: "hotfix"`** — read from the canonical source (us.forums topic
  2336376, post 1 at **version 23**, updated 2026-09-01T01:10:18Z) with its `<ul>` heading
  structure INTACT, not off the flattened Wowhead mirror. Every class line sits under an
  explicit SPEC heading, so there is no class-wide/hero-tree attribution question this time:
  Unholy DK (Dread / Virulent Plague Erupt modifier interactions), Restoration Druid (Grove
  Guardians priority; Everbloom 6→5 targets), Mistweaver Monk (Soothing Mist aura), Holy
  Priest (Guardian Angel / Guardian Spirit cooldown), Affliction Warlock (Hellcaller Blackened
  Soul via Fatal Echoes), plus a `Non-class:` line for the Venomous Abyss encounter work,
  the Gnarldor Isle delve change, the Omnium Folio CC fix and a Group Finder move. All six
  lines classify **null** under `classifyHighlight`, i.e. bug fixes cast no outlook vote —
  checked, not assumed.
- ⚠️ **ONE CLASS LINE FROM THAT ROUND-UP IS DELIBERATELY NOT LOGGED, AND IT IS AN OWNER
  ACTION.** The Mage › Fire entry — "Resolved an issue where the 2-piece set bonus: Flamestrike
  did not correctly always grant Hot Streak when it is a guaranteed critical strike due to
  Pyroclasm" — touches a SET BONUS, so logging it obliges Fire Mage's `spec.tierSet.asOf` to
  advance to 2026-08-31 (a pure bug fix still bumps `asOf`), and since the 2026-08-23 two-page
  rule that same change must re-sync `gearing/data/specs.json` and rebuild the gearing artifact
  **in the same commit**. The nightly structurally cannot do that: publish stages only `data/`,
  `dist/` and the skill logs, never `gearing/`, so a tracker-side bump would land on master
  without its mirror and red the publish gate for everyone. Fire Mage is therefore absent from
  `specsAffected` and the line is not reworded to dodge the gate — it is recorded here and in
  the entry's own `label`. **To close it in a local run**: add the fix as a `Fire Mage — …`
  highlight on the 2026-08-31 entry, bump `tierSet.asOf` → 2026-08-31 with
  `source: https://us.forums.blizzard.com/en/wow/t/world-of-warcraft-midnight-hotfixes-august-31/2336376`
  (wording unchanged; append a dated parenthetical), then
  `node gearing/src/sync-tracker-fields.mjs && npm run gearing:build`.
- **THE 08-28 TUNING POST GAINED A LINE AT VERSION 4.** Post 1 of topic 2342331 was edited to
  v4 at **2026-08-31T19:44:31Z**, after last night's run had read v3. Re-read in full: the
  fifteen stored PvE lines are unchanged line for line, and **one line is new** — Shaman ›
  Hero Talents › Farseer, "Fixed an issue that caused Natural Harmony to increase the healing
  of Nature's Guardian by 20% instead of its listed and intended 10%." It sits under a bare
  Shaman heading at hero-tree depth with no spec block beneath it, so it is logged
  **class-wide with the tree named in the line text** (the Evoker/Flameshaper and
  Rogue/Deathstalker precedent from the 08-27 round-up) rather than guessed onto Elemental or
  Restoration. Class-wide lines reach all three Shaman drawers and are excluded from the
  outlook tally by construction, so this adds a fact and casts no vote — verified: the line
  classifies null anyway, and `specBuildChanges` returns it for all three Shaman specs.
  `specsAffected` gained "Shaman (class-wide)"; the entry's label records the v3→v4 diff.
- **No tier-set upkeep is owed by either change** beyond the disclosed Fire Mage deferral:
  the Mistweaver 4-piece line was already reconciled with the 08-28 entry, and validation is
  green (`✓ data valid — 40 specs, 39 PTR-tracked`).

## 2026-08-31 (nightly) — all four live lanes polled, 0 new entries; the Sept 1 pass re-verified at v3 against the stored build

- **No new build, hotfix or tuning post anywhere.** `data/ptr-builds.json` untouched; its
  newest entry is still the 2026-08-28 "Class Tuning Incoming – September 1" pass, which
  applies at tomorrow's weekly reset.
  - Wowhead news **RSS**: HTTP 200, 40 items spanning 2026-08-27T00:57Z → 2026-08-31T17:43Z.
    Nothing class-tuning or hotfix shaped after 08-28. The two candidates in the window are
    both already logged: news=382674 (the Sept 1 mirror, = our 08-28 entry) and news=382657
    ("Patch 12.1 Hotfixes for August 27th", = our 08-27 entry). The Coiled Altar nerf/unnerf
    articles (382658, 382679) are raid-encounter tuning, not class tuning, and are correctly
    out of the feed.
  - Wowhead news **INDEX** (`data.news.newsData`, brace-balanced from the id attribute):
    20 posts, top id 382660 at 2026-08-31 12:43 — the index does NOT lead the RSS this run,
    both top out in the same place.
  - Wowhead **blue tracker** (`data.blueTracker.default`): 50 entries, newest 2026-08-28
    17:48 (Linxy, "Class Tuning Incoming – September 1", US and EU). No standalone blue post
    since. Last hotfix topic is Kaivax's 08-27 round-up, already logged.
  - **Official dev-notes thread** 2317811.json: HTTP 200, posts_count 17, `last_posted_at`
    2026-07-31T23:42Z — quiet for a month, which is correct and expected: the 12.1 PTR cycle
    is closed and this is not a lost thread (the rediscovery gotcha stays suspended).
- **The Sept 1 tuning post was re-read at version 3 and the stored entry survives it exactly.**
  Topic 2342331 fetched via the `/t/<id>.json` form (the slug form 301s and leaves an empty
  body — use the bare id). `updated_at` 2026-08-28T22:48:44Z, unchanged since we logged it.
  All 15 stored highlights match the v3 text line for line, including the Mistweaver
  four-piece 20% → 25%, Shred logged class-wide at the shallower heading depth, and the whole
  PLAYER VERSUS PLAYER section correctly left undistilled. No tierSet change is owed —
  Mistweaver's was already advanced on 08-28 and the validator's upkeep gate is green.
- **Writeup coverage: 1 spec at `ptr: null`, Demonology Warlock, and that null is deliberate**
  (the source reported no changes). Unchanged from 08-15.
- **PTR zone lanes 54 / 52 / 56 / 57 stayed dormant** as the between-cycles posture requires;
  no WCL request of any kind was made from this session, and their contract rows were removed
  at the flip so there is nothing to report as unreachable.

## 2026-08-31 (local, scheduled) — 0 new builds; no hotfix round-up since Aug 27; Sept 1 pass STILL v3; no 12.2

- **Feed unchanged at 24 entries; nothing logged.** Wowhead news RSS fetched once (HTTP 200,
  157,896 bytes, 40 items spanning 08-27 → 08-31) and read per `<item>` block, never by tag
  adjacency. Titles AND `content:encoded` bodies were both scanned — the body pass is what
  makes a "no new tuning" claim honest, since Wowhead headlines the highlights rather than the
  scope (the 08-28 article names three specs for a pass that carries fourteen).
- **The canonical rolling hotfix topic is the authority, and it says August 27.** Kaivax topic
  **2336376** fetched directly (`.json`, HTTP 200, 34 KB): title still "World of Warcraft:
  Midnight Hotfixes - August 27", post 1 at **v21**, last edited 2026-08-28T00:59:15Z. Its
  bold date sections enumerate Aug 27/26/25/21/20/19/18/17/14/13 and **nothing later** — so
  08-28, 08-29 and 08-30 genuinely had no hotfix round-up, rather than one we missed. The Aug
  27 section is already logged as this feed's 2026-08-27 `hotfix` entry. Checked the topic
  BODY for a later section rather than trusting the rolled title, because the title lags the
  edit that appends a section.
- **The September 1 tuning post is unchanged: still v3.** Topic **2342331** post 1 created
  2026-08-28T22:27:13Z, updated 2026-08-28T22:48:44Z, `version` 3 — byte-identical in version
  terms to what the 08-29 run distilled. The pass applies with tomorrow's weekly maintenance,
  so this was the check worth making today: an amended post would have changed fourteen specs'
  logged lines the night before they go live. It was not amended.
- ⚠️ **NEW GOTCHA — a blue name on a post number is not a blue post.** A naive scan of that
  topic's `post_stream.posts` shows "#5 | Linxy", which reads as a second Linxy post carrying a
  clarification. It is not: `post_type: 3` with `action_code: "pinned.enabled"` and a
  **zero-length `cooked`** — a Discourse small-action recording that Linxy pinned the topic.
  The cheap cross-check that settles it is `details.participants`, which lists Linxy at
  `post_count: 1`. **Filter on `post_type === 1` (or a non-empty `cooked`) before reading a
  post as content**, or a moderation event gets distilled as tuning.
- **Forum transport note:** `us.forums.blizzard.com/en/wow/t/x/<id>.json` returns **HTTP 301
  with a zero-byte body** — the slug-less form redirects. Use `-L`, or the real slug. Without
  `-L` this looks exactly like a dead topic.
- **Dev-notes thread 2317811: no change**, newest post still #19 (Linxy, 2026-07-31T23:42Z),
  `last_posted_at` 2026-07-31. The closed 12.1 cycle's expected quiet, per the between-cycles
  posture — not a lost thread. Note `posts_count` reads 17 against a highest post number of 19
  (deleted replies); do not read that gap as missing blue posts.
- **No 12.2 PTR announcement** in any channel — RSS titles, RSS bodies (`12.2` / `Patch 12.2`
  matched nothing), the dev-notes thread, or the hotfix topic.
- **Writeup lane unchanged:** still exactly 1 spec at `ptr: null` (Demonology Warlock, the
  deliberate null — the source reported no changes). No new per-spec 12.1 review articles in
  the RSS window.
- **Dormant lanes correctly skipped**, not marked unreachable: the four PTR WCL zone sweeps
  (54/52/56/57) have no contract rows since the flip, so they need no manifest excuse.

## 2026-08-30 (local, scheduled) — 0 new builds; Sept 1 pass re-read and still at forum v3; no 12.2

- **Between-cycles posture, live lanes only.** The four PTR WCL zone sweeps (54/52/56/57)
  stay dormant and were not attempted; their contract rows were removed at the flip, so they
  need no manifest excuse.
- **Wowhead news RSS swept** (`/news/rss/all`, HTTP 200, 154 KB, 40 items, parsed per `<item>`
  block rather than by tag adjacency). Twenty-three items dated 2026-08-28 or later; **none is
  new class-tuning content**. The two that look like it are already logged: "Boomkin, Feral
  Druid, Mistweaver Monk Buffs — Class Tuning Coming with Weekly Reset" (08-28) IS the
  September 1 pass already in the feed, and "Vashnik LFR Nerf — Patch 12.1 Hotfixes for August
  27th" (08-28) is the round-up logged as the 2026-08-27 hotfix entry. No "Hotfixes for August
  28th/29th" round-up has been published yet.
- **Deliberately NOT logged: "Bonus Roll Hotfix Applied Early: No More Loot from Locked
  Bosses"** (08-29). It is a live hotfix, but it changes bonus-roll/loot-lock behaviour and
  touches no spec's tuning, so it has an empty `specsAffected` and would fail the
  `specsAffected` ↔ `highlights` coverage gate for the right reason. A loot-level change lands
  on every spec equally; the patch feed is the class-tuning record, not a general patch log.
- **The September 1 pass was RE-READ rather than assumed current**, since announced tuning gets
  retuned before it ships and the pass is two days out. Discourse JSON for topic 2342331
  (follow the 301 — the bare `.json` URL redirects): post #1 by Linxy is still **version 3**,
  `updated_at` 2026-08-28T22:48:44Z, unchanged since the 08-29 local run distilled it. The
  stored build entry (14 specs, 15 highlights) is therefore current by construction; nothing
  to re-distil.
- **No 12.2 PTR announcement** anywhere in the sweep. `PHASES.ptr` stays null and the cycle
  stays closed; opening a 12.2 cycle remains an owner action, not an agent-side edit.
- `data/ptr-builds.json` untouched; newest entry stays the 2026-08-28 "Class Tuning Incoming –
  September 1" post.

## 2026-08-30 (nightly, CI runner) — 0 new builds; the Sept 1 pass still at forum v3, no 12.2 anywhere

Between-cycles posture unchanged: `PHASES.ptr` is null, no 12.2 PTR announcement in any lane,
and the dormant WCL PTR zone sweeps (54 / 52 / 56 / 57) were correctly skipped — their contract
rows left with the flip and must not be re-added to the manifest.

- **Wowhead news RSS** — HTTP 200, 154 KB, 40 items parsed per `<item>` block, window
  2026-08-26 → 2026-08-30 09:00 CDT. The only class-tuning item is still **news=382674**, the
  2026-08-28 feed entry. Every 08-28…08-30 item's `content:encoded` body was keyword-scanned;
  the one tuning-bearing article is **news=382679 "(Reverted) Mythic Coiled Altar Nerfed Again"**
  — ENCOUNTER tuning (Defilement healing absorb −20%, Coalesced Venom −15%, Venom Rupture −10%,
  variance removed) and **reverted** on lockout issues. No class content, so no feed entry: the
  `specsAffected: []` + `Non-class:` precedent is for posts in the tracked dev-notes thread, not
  for Wowhead race articles.
- **Forum, re-read rather than assumed** — topic **2342331** post 1 is still **version 3**,
  created 2026-08-28T22:27:13.800Z, last updated 22:48:44.482Z. Its spec sections reconcile 1:1
  against the stored entry's 14 `specsAffected` / 15 `highlights`, including the Mistweaver line
  "The Venomous Abyss 4-piece set bonus chance to activate has been increased from 20% to 25%"
  that `spec.tierSet` already carries at asOf 2026-08-28 — so the **tier-set upkeep gate needed
  nothing tonight** and the gearing mirror was not touched. (Note the topic slug 301-redirects to
  a percent-encoded en-dash form; fetch with `curl -L` or the `.json` comes back empty.)
- **Dev-notes thread 2317811** — `highest_post_number` still **19**, newest post Linxy
  2026-07-31. The closed 12.1 PTR cycle, unchanged.
- **News INDEX polled too**, because it LEADS the RSS within a run: `data.news.newsData`
  brace-balanced from its `id` attribute, 20 posts, top id 382669 at 09:00 — nothing the RSS
  lacked.
- **Blue-tracker index** `data.blueTracker.default`, 50 entries / ~35 unique topics. Newest
  class-relevant topic is still Linxy's September 1 tuning post (US 2342331 / EU 627043, both
  2026-08-28); nothing standalone since. `data/ptr-builds.json` untouched, newest entry stays
  2026-08-28.
- One creator LEAD noted and **not** logged: Dalaran Gaming's 08-28 "WoW Is Changing FOREVER.
  Talent 'Squish', New Modes, & Huge Patch Roadmap!" is downstream of the Psybear/Tettles Ion
  Hazzikostas interviews, and no official channel carries a 12.2 PTR announcement — the video is
  the tip-off, never the source of record.

## 2026-08-29 (nightly, CI runner) — 0 new builds; the Sept 1 pass verified still at forum v3

Between-cycles posture unchanged: `PHASES.ptr` is null, no 12.2 PTR announcement in any lane,
and the dormant WCL PTR zone sweeps (54 / 52 / 56 / 57) were correctly skipped — their contract
rows left with the flip and must not be re-added to the manifest.

- **Wowhead news RSS** — HTTP 200, 151 KB, 40 items parsed per `<item>` block, window
  2026-08-25 → 2026-08-29 09:00 CDT. The only class-tuning item is **news=382674** ("Boomkin,
  Feral Druid, Mistweaver Monk Buffs — Class Tuning Coming with Weekly Reset"), which this
  morning's LOCAL run had already landed as the 2026-08-28 feed entry. Its `content:encoded`
  body was re-read tonight and reconciled line-for-line against the stored entry: all fifteen
  PvE highlights match, the separate PLAYER VERSUS PLAYER section stays out of scope, and the
  set-bonus line ("The Venomous Abyss 4-piece set bonus chance to activate has been increased
  from 20% to 25%") is the one `Mistweaver.tierSet` already carries at asOf 2026-08-28 — the
  gearing mirror is byte-identical, so the tier-set upkeep gate needed nothing.
- **The forum post itself was re-read, not assumed.** Topic **2342331** post 1 is still
  **version 3**, created 2026-08-28T22:27:13Z, last updated 22:48:44Z — no v4 edit since the
  local run distilled it. (That version matters: Wowhead mirrored v1, which understates
  Discipline's PvP figures and omits Fire Mage's PvP-exclusion clause. Neither affects PvE.)
- **News INDEX polled as well**, because it LEADS the RSS within a run: `data.news.newsData`
  brace-balanced from its `id` attribute, 20 posts, top id 382670 at 09:00 — nothing the RSS
  lacked.
- **Blue-tracker index** `data.blueTracker.default`, 50 entries. Newest class-relevant topic is
  still Linxy's September 1 tuning post (2342331, 28 Aug 17:48 CDT); above it only WoW Weekly,
  Black Temple and a "Raid Bonus Roll Update".
- **The canonical running hotfix post was read DIRECTLY**, since it is edited in place:
  `2336376.json` post 1 is at **version 21**, updated 2026-08-28T00:59:15Z, with dated sections
  August 27, 26, 25, 21, 20, 19, 18, 17, 14, 13 — **no August 28 or 29 section**, and neither
  literal string appears in the post. The two hotfix-shaped news items since (382677 "Bonus Roll
  Hotfix Applied Early" and the Mythic Coiled Altar nerf) are loot-system and encounter tuning
  with no class line, so neither earns a feed entry.
- **Dev-notes thread 2317811** unchanged at post #19, last posted 2026-07-31T23:42Z — the closed
  cycle's expected silence, not a lost thread. The rediscovery gotcha stays suspended.
- **Watch item carried forward:** topic 2335871 "Season 2 Class Tuning Plans" is at 190 posts
  with Kaivax only at post #1, still unedited since 2026-08-12. Its roadmap named **Aug 25,
  Sep 1 and Sep 22**, so the pass now in the feed is the second of three and the next one is
  three weeks out. Separately, Dalaran Gaming published "Talent Squish, New Modes, & Huge Patch
  Roadmap" on 08-28 — a creator LEAD about future plans that the official lanes do NOT
  corroborate tonight; the video was left unqueued and unseen rather than treated as a source.
