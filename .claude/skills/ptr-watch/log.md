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

## 2026-08-21 (nightly CI)

**One build logged (`kind: "hotfix"`, 2026-08-20). No 12.2 PTR announcement in any channel.
PTR zone lanes remain dormant.**

- **Four channels swept, all healthy.** (1) Wowhead news RSS parsed per `<item>` block: 40
  items, newest 2026-08-20 22:51 CDT. (2) The news INDEX (`data.news.newsData`, brace-balanced
  from the id attribute) because it leads RSS within a run — tops out at the same **news=382552**,
  so the two agree and nothing landed mid-run. (3) Blue tracker (`data.blueTracker.default`):
  50 entries → **35 unique topics**, newest 2026-08-20 21:35; no standalone class-tuning blue
  post. (4) Dev-notes thread `2317811.json` via curl for the full `post_stream`: 17 posts,
  `last_posted_at` **2026-07-31**, newest still Linxy #19 — the closed cycle's expected quiet.
- **LOGGED: 2026-08-20 hotfixes**, verified against the CANONICAL forum source rather than the
  mirror — Kaivax's running topic **2336376**, title now "World of Warcraft: Midnight Hotfixes
  - August 20", post 1 edited 2026-08-21T02:27:47Z to append the section. Cited via
  `wowheadUrl` news=382550 (a hotfix has no post in the tracked thread).
- **Reading it with the `<ul>` nesting intact settled the one attribution question, and the
  RSS body could not have.** `<content:encoded>` flattens every heading to a bare `<p>`, so
  the Hellcaller line and the Affliction lines look like siblings there. In the cooked forum
  HTML the Hellcaller line sits **one level shallower**, directly under the bare Warlock
  heading — so it is logged `Warlock (Hellcaller hero talents)` (hero-tree scope), not as an
  Affliction line. Seven highlights over six specs plus that hero-tree line; specsAffected ↔
  highlights reconcile 7/7.
- **Classification was CHECKED against `classifyHighlight`, not asserted.** 5 of 7 classify
  null, but **two vote**: Marksmanship Hunter **nerf** (both its lines remove a damage
  double-dip — Precise Shots benefiting twice, Explosive Shot's AoE not reduced by DR) and
  Elemental Shaman **buff** (Master of the Elements now increases Earthquake damage). Neither
  moved an outlook DIRECTION — both specs are driven by a dated writeup verdict, so
  Marksmanship stays Mixed/flat at +5/−2 and Elemental stays Positive/up at +2/−1; only the
  stated line counts moved. The first draft of the entry's label claimed "none votes"; it was
  corrected against the function's actual output before landing.
- **ONE set bonus touched:** the last Affliction Warlock line fixes the Unstable Affliction
  granted by the Venomous Abyss 4-piece failing to grant a stack of Wither. `tierSet.asOf`
  advanced 2026-07-08 → **2026-08-20**, `source` re-pointed at the forum topic, and a dated
  parenthetical appended. The 4-piece WORDING is unchanged, so the stored bonus text was not
  rewritten — the Elemental Shaman 08-18 precedent. The upkeep gate is green by fact.
- **Swept and correctly NOT logged, each read in full:** "Heroic Vashnik Stealthily Nerfed"
  (news=382552) and "Nightmare Prey Affix Nerfed" (news=382549) — encounter and affix tuning,
  no class line; plus the post's own Delves, Dungeons and Raids (including all seven Heroic
  Ula'tek tuning lines), Items, Prey, Quests and Treasures sections.
- **Writeup lane recomputed, never quoted:** 1 spec at `ptr: null` (Demonology Warlock, the
  deliberate null), and `expertRead` returns null for all 40 specs in both brackets by
  construction — it gates on `PHASES.ptr`, which is null between cycles.
- Zone 54 / 52 / 56 / 57: **dormant**, per the between-cycles posture. Not fetched, not
  marked unreachable — their contract rows left with the flip.

## 2026-08-20 (local run — scheduled)

**Nothing new. Nothing changed.** Between-cycles posture, live lanes only; the four PTR zone
sweeps stayed dormant and were not marked unreachable (their contract rows are gone).

- **Wowhead news RSS** — 1 fetch, HTTP 200, 133 KB, 40 items, parsed per `<item>` block.
  Newest item is "Patch 12.1 Hotfixes for August 19th" at 2026-08-20 02:09 CDT, which is the
  same newest item the nightly saw and already logged as the 08-19 `hotfix` entry. Nothing
  newer exists. The other tuning-shaped titles in the window are all ENCOUNTER or ITEM tuning
  (Ula'tek nerfed, Coiled Altar, Venomcursed neck, M+ dungeon tuning) — out of scope for a
  per-spec feed, and the class-tuning ones predate entries already logged.
- **Official hotfix topic 2336376** — HTTP 200 (note: the `/t/<slug>/<id>.json` form 301s;
  follow redirects or use `/t/<id>.json`). Title still reads "…Hotfixes - August 19" and post 1's
  `updated_at` is 2026-08-20T03:14:06Z — the exact edit the nightly already captured. **No
  August 20 section has been appended yet.**
- **12.1 development-notes thread 2317811** — last post #19, 2026-07-31. Closed, as expected
  since the launch; the thread-rediscovery gotcha stays suspended.
- **12.2 PTR announcement: none.** Checked titles AND all 40 article bodies for
  `12.2` / `PTR` / "next patch" — **0 of 40 articles** mention any of them. `PHASES.ptr` stays
  null and starting a 12.2 cycle remains an owner action.

No `ptr-builds.json` entry, no `tierSet` change, no writeup touched.

## 2026-08-20 (nightly CI)

Between-cycles posture held: dormant lanes (WCL PTR zones 54/52/56/57) untouched, and no
WCL fetch of any kind was made by this agent. **One entry logged.**

**Four channels swept, all healthy.** (1) Wowhead news RSS parsed per `<item>` block: 40
items, newest 2026-08-20 02:09 CDT. (2) The news INDEX (`data.news.newsData`, brace-balanced
from the `id=` attribute) because it leads RSS within a run — it tops out at the same
news=382535, so the two agree and nothing landed mid-run. (3) Blue tracker
(`data.blueTracker.default`): 50 entries, newest 2026-08-19 22:15. (4) Dev-notes thread
`2317811.json` via curl for the full `post_stream` (WebFetch truncates to post 1): 17 posts,
`last_posted_at` 2026-07-31, newest still Linxy #19 — the closed 12.1 cycle's expected quiet,
not a lost thread. **No 12.2 PTR announcement anywhere in the four channels.**

**LOGGED — `kind: "hotfix"`, dated 2026-08-19**, "Patch 12.1 Hotfixes for August 19th"
(wowheadUrl news=382535). Verified against the CANONICAL forum source rather than the mirror:
Kaivax's running hotfix topic **2336376**, whose title has rolled to "World of Warcraft:
Midnight Hotfixes - August 19" and whose post 1 was edited 2026-08-20T03:14Z to append the
August 19 section. Read with heading structure INTACT off the cooked HTML `<ul>` nesting —
which is what settled the two attribution questions: **Army of the Dead** sits directly under
the bare `Death Knight` heading (logged `Death Knight (class-wide)`, so it reaches all three
DK specs via `CLASS_WIDE`), while **Dark Simulacrum / Cooldown Manager** sits INSIDE the
`Unholy` sub-list despite reading like a baseline line. Flattened to prose both would have
been guessable either way.

**The whole Classes section is bug fixes — no tuning value anywhere**, so every one of the 6
highlights classifies null and NONE votes in the outlook tally. That is the honest reading of
a bug-fix pass, not a gap. No set bonus is touched, so no `spec.tierSet` was advanced and the
tier-set upkeep gate stays quiet by fact rather than by omission. specsAffected ↔ highlights
reconcile 6/6.

**Swept and correctly NOT logged**, each checked rather than assumed: the Aug-19 post's own
Delves / Dungeons and Raids (Blinding Vale, Ruby Life Pools, Temple of Sethraliss and five
Venomous Abyss bosses) / Items / Quests sections and its single PvP line; "Ula'tek Nerfed"
and "Coiled Altar Massively Nerfed" (encounter tuning); "Hunter's Ritual Stone Weapon
Embellishment Nerfed" ("Hunter's Ritual Stone" is an ITEM name, not the class — the bare-token
trap in item shape); "Venomcursed Items Secondary Stat Changes" and "Blizzard Reverts Special
Weapon Restrictions" (items); "Mythic+ Dungeon Tuning with Season 2 Launch" (dungeon); and
Kaivax's standalone blue post **"Item Adjustment Incoming - August 25"** (topic 2338382),
fetched in full — it adjusts exactly one item (Aqirbane Reliquary secondary stats) and carries
no class line.

**Writeup lane**: recomputed, not quoted — 1 spec at `ptr: null` (Demonology Warlock, the
deliberate null: the source reported no changes). No new per-spec 12.1 review articles in the
RSS window; the cycle is closed, so this is the expected steady state.

## 2026-08-19 (local run — scheduled)

Between-cycles posture held. Dormant lanes (WCL PTR zones 54/52/56/57) not touched.
**Nothing logged — and that is the correct outcome, reached from source rather than
inherited.**

**RSS swept** (`wowhead.com/news/rss/all`, 40 items, parsed per `<item>` block): newest
2026-08-19 07:33 CDT. **No 12.2 / 12.1.5 PTR announcement** — the only PTR-category item in
the whole feed is the closed cycle's "Venomous Abyss Raid BoEs Datamined". The 08-15 lead
(news 382443, "Patch 12.1.5 PTR Now Listed on Battle.net Launcher") has still produced no
dev notes; re-check stands.

**Canonical hotfix topic 2336376 fetched and parsed** (Kaivax, post 1, updated
2026-08-19T01:53Z). Date sections present: **August 18, 17, 14, 13 — no August 19 section
yet**, so the nightly six hours earlier saw the same state.

**Three articles looked like gaps and all three are already-settled decisions:**
- news=382492 "August 17th — Hunter, Priest, Shaman & Warlock Bug Fixes". I extracted its
  class section from the FORUM JSON (not just the Wowhead mirror) and it is four bug fixes
  with no throughput value: BM Hunter Wildspeaker/Dire Beast, Holy Priest spec-swap, a bare
  **Shaman** heading with no spec qualifier, Destruction Warlock tooltip. The 08-18 log
  already records this as deliberately not logged, on the precedent that left 08-14 out.
- Topic 2336376's August 14 and August 13 Classes sections (Devastation Shattering Star,
  Warrior Slayer Executioner, Warlock pet Soul Leech, Demonology cooldown-manager,
  Affliction Seed of Corruption) — same shape, and the 08-15 entry records them re-read in
  full and independently confirmed as non-feed material.
- news=382517 "Coiled Altar Massively Nerfed" — I read the body: pure encounter health
  tuning, zero class lines. Correctly absent, as the 08-19 nightly says.

Not re-litigated. Recording the re-check only so the next run knows the 08-17 round-up has
now been verified against the forum JSON twice, by two different runs, to the same answer.

⚠️ **The `kind: "hotfix"` at builds[0] flag from 08-18 appears to be RESOLVED** — the feed's
newest entry is now the 08-18 hotfix and `npm test`'s validate/build lane is green on it.
The two suite failures tonight are unrelated (see the local-run report).

## 2026-08-19 (nightly)

Between-cycles posture held: the live lanes were swept, the four dormant WCL PTR zone lanes
(54 / 52 / 56 / 57) were not touched and have no contract rows.

**Four channels swept.** (1) Dev-notes thread `2317811.json` via curl for the full
`post_stream`: 17 posts, `last_posted_at` 2026-07-31, newest still Linxy #19 — a quiet thread
is the expected state now, not a lost one. (2) Wowhead news RSS, parsed per `<item>` block:
40 items, newest 2026-08-18 22:30 CDT. (3) The news INDEX (`data.news.newsData`,
brace-balanced from the id attribute), because it leads RSS within a run — it tops out at the
same id 382513, so nothing landed mid-run. (4) Blue tracker (`data.blueTracker.default`):
50 entries, newest 2026-08-18 20:54.

**LOGGED: a `kind: "hotfix"` entry dated 2026-08-18** — Blizzard's Season-2 launch-day
hotfixes. Verified against the canonical forum topic **2336376** ("World of Warcraft: Midnight
Hotfixes - August 18"), not just the Wowhead mirror; cited via `wowheadUrl` news=382516,
because a hotfix has no post in the tracked thread.

**The interesting part is what was deliberately NOT logged.** The article's title reads "Many
Class Bug Fixes" but its PvE class section is substantial — and it turned out to be the
SHIPPED form of the 2026-08-15 "Class Tuning Incoming – August 18" pass already in this feed.
All 15 of those specs were compared line by line against the forum JSON and are identical in
spec, effect and value. Restating them would count the same tuning **twice** in the outlook
tally, which counts LINES — the same double-counting reason `outlookFor` excludes the launch
patch notes. So the entry carries only what is genuinely new:

- **Elemental Shaman — the one new throughput change**, a spec absent from the 08-15 pass:
  +5% all damage alongside a Venomous Abyss 4-piece bug fix (the Overcharge! buff was
  sometimes not consumed, inflating free Maelstrom spenders). `spec.tierSet` asOf/source
  advanced to the 08-18 hotfix with a dated note on the 4-set — the tier-set upkeep gate's
  requirement, and a pure bug fix still bumps asOf.
- Bug-fix and mechanical lines for Blood DK, Subtlety Rogue, Demonology, Affliction,
  Destruction, Protection Warrior and the Hellcaller tree. Each was run through
  `classifyHighlight` before writing: **only the Elemental line votes** (as a buff); the rest
  return null, which is correct — they state no direction.

**Excluded, and said so in the entry label:** the whole PLAYER VERSUS PLAYER section. Worth
pinning — **Fire Mage's Venomous Abyss 4-piece change lives in that section and is explicitly
scoped "in PvP combat"**, so its PvE set bonus is unchanged and `spec.tierSet` was NOT touched.
A run that read that line as a set change would have bumped a tier set on a PvP-only tweak.
Also excluded: the Delves / Dungeons / Items / Professions / Quests sections and a cosmetic
tamed-Hydra size reduction.

**Also swept and correctly not logged:** "Coiled Altar Massively Nerfed" (encounter tuning) and
"Venomcursed Ula'tek Neck Tuning" (item), and Kaivax's 2026-08-12 **"Season 2 Class Tuning
Plans"** (topic 2335871) — read in full, it is a tuning ROADMAP with no per-spec line, which is
why it belongs in no feed entry.

**Coverage, recomputed rather than quoted:** 1 spec at `ptr: null` (Demonology Warlock, the
deliberate null). **`expertRead` now returns null for all 40 specs in BOTH brackets** — this is
not lost takes, it is by construction: it gates on `PHASES.ptr`, and the 12.1 PTR phase ended
at the flip. The expert lane is DORMANT between cycles and returns when a 12.2 PTR entry is
added to `PHASES`. Anyone running CLAUDE.md's coverage snippet after the flip will see 40/40
"gaps" and should read them as the phase, not a regression.

Zone state, for the record: 54 / 52 / 56 / 57 all dormant (closed cycle, no contract rows, no
fetch attempted). Live S2 zones 53 / 55 have no fetch path — see the metrics log.

## 2026-08-18 (nightly)

**No new build post — but the Aug-18 tuning post was EDITED twice and those edits are now in
the feed.** Four channels swept.
(1) Dev-notes thread `2317811.json` via curl for the full `post_stream`: 17 posts,
`last_posted_at` 2026-07-31T23:42:09Z, newest is Linxy #19 — already the feed's 07-31 entry.
(2) Wowhead news RSS parsed per `<item>` block: 40 items, newest 2026-08-17 23:07 CDT.
(3) The news INDEX (`data.news.newsData`, brace-balanced from the id attribute) — nothing
beyond RSS. (4) Blue tracker (`data.blueTracker.default`): 50 entries, newest 2026-08-17 20:55.

**Folded into the existing 2026-08-15 entry** (topic 2336820, canonical forum JSON read
directly — post `updated_at` 2026-08-18T01:51Z — not the Wowhead mirror):
- `PALADIN / Retribution — All ability damage increased by 6%` — a NEW spec for that entry, and
  it sits in the PvE **CLASS CHANGES** section, not the PvP one. `specsAffected` 14 → 15.
- `PRIEST / Discipline — Void Shield reflects 10% of damage (was 15%)`, appended to the existing
  consolidated Disc line (which stays mixed, so it still casts no outlook vote).
- Frost DK now reads "All ability **and auto-attack** damage increased by 9%".
- The entry's label previously claimed Retribution Paladin appears only under PvP. That is now
  false and was corrected in the same edit.
No set bonus changed in either edit, so no `spec.tierSet` update was due.

**Swept and deliberately NOT logged: the Kaivax "Hotfixes — August 17, 2026" round-up**
(news=382492, blue-tracker topic 2336376). Its class section is **bug fixes only** — a
functional Beast Mastery fix (Wildspeaker Dire Beast Kill Commands were not benefiting from
Killer Instinct / Alpha Predator / Specialized Arsenal / Savagery), a Holy Priest spec-swap
fix, a Shaman spellbook display bug and a Destruction Warlock tooltip — with no throughput
numbers, matching the precedent that left the 08-14 Kaivax hotfixes out.
⚠️ **Owner flag, learned the hard way tonight:** a `kind: "hotfix"` entry cannot currently be
the feed's NEWEST entry at all. `test/validate.test.mjs` ("host allowlists pin every
agent-writable URL field") sets `forumUrl` on `builds[0]` and asserts exactly ONE error; a
hotfix at index 0 adds the legitimate "hotfixes are not forum build posts" error and reds
`npm test`. The entry was written, tested, and removed again. Fixing the test is a reviewed
code edit — and note an agent-side test edit would not even help, since publish checks out
master and only takes the `data/` artifact.
Also correctly absent: "Mythic+ Dungeon Tuning with Season 2 Launch" / "Season 2 Dungeon
Adjustments" (dungeon, not class), and the datamined Venomcursed / Hunter's Ritual Stone item
hotfixes.

**WCL (evidence-only, no agent fetch):** verdict `rdps-broken`. zone-54 normalized and zone-52
`ptrDummy` unchanged; the raw-DPS pools landed via the deterministic step — zone 52 102 rows,
zone 54 27 rows (6 of 8 encounters returned players; The Coiled Altar and Ula'tek 0), zone 56
27 rows across all 8 dungeons. Zone 57 not probed — no credentials.

Writeup coverage RECOMPUTED (never read): 1 spec at `ptr: null` (Demonology Warlock, the
deliberate null), 0 specs without a raid-scoped expert read, 0 without an M+ one.

## 2026-08-17 (nightly)

**No new builds; nothing logged.** Four channels swept.
(1) Dev-notes thread `2317811.json` via curl for the full `post_stream`: 17 posts,
`last_posted_at` 2026-07-31T23:42:09Z, newest is Linxy #19 — already the feed's 07-31 entry.
Quiet 17 days now, because the PTR cycle ended when 12.1 shipped on 08-11.
(2) Wowhead RSS, parsed per `<item>` block: 40 items, newest 2026-08-16 19:10 CDT.
(3) News INDEX (`data.news.newsData`, brace-balanced from the id attribute), since it leads RSS
within a run: 20 posts, top id 382391 — nothing beyond RSS.
(4) Blue tracker (`data.blueTracker.default`): 50 entries, newest **2026-08-14 20:02**, i.e.
unchanged since last night. The only class-touching blues are still Linxy's "Class Tuning Incoming
– August 18" (topic 2336820), which IS the feed's 2026-08-15 entry, and the Aug-14 Kaivax hotfixes
(2336376). Kaivax's 08-12 "Season 2 Class Tuning Plans" (2335871) and Wowhead's 08-12 "Class
Tuning Roadmap" (news=382435) remain a **calendar** — Aug 18 / Aug 25 / Sep 1 / Sep 22, no
per-spec numbers — so they are still correctly absent from the feed.

Writeup coverage **recomputed, never read off prose**: 1 spec at `ptr: null` (Demonology Warlock,
the deliberate null — the source reported no changes), **0** specs without a raid-scoped expert
read, **0** without an M+ one. Unchanged from 08-15, and the CLAUDE.md paragraph still matches.

WCL zones are evidence-only on the runner (no credentials). `wcl-fetch/evidence.json` verdict
`rdps-broken`, so **zone 54 (normalized), zone 52 (ptrDummy rDPS) and zone 56 (rDPS/HPS) all
stay frozen** at 2026-07-28 / 2026-08-10 / 2026-08-10 respectively; zone 57 was not probed for the
same reason. What DID land is the deterministic raw-DPS lane: z52 102 rows, z54 27 rows (6 of 8
encounters populated — Vashnik 678, Soulcoiler 370, Sentinels 363, Sszorak 184, Lost Explorers 150,
Twin Fangs 146; Coiled Altar and Ula'tek zero), z56 27 rows across all eight dungeons.

## 2026-08-16 (nightly)

**No new builds; nothing logged.** Four channels swept.
(1) Dev-notes thread `2317811.json` via curl for the full `post_stream`: 17 posts,
`last_posted_at` 2026-07-31T23:42:09Z, newest is Linxy #19 — already the feed's 07-31 entry. The
thread has been quiet 16 days because the PTR cycle ended when 12.1 shipped on 08-11.
(2) Wowhead RSS, parsed per `<item>` block: 40 items, newest 2026-08-16 06:05 CDT.
(3) News INDEX (`data.news.newsData`, brace-balanced from the id attribute), since it leads RSS
within a run: 20 posts, top id 382474 — nothing beyond RSS.
(4) Blue tracker (`data.blueTracker.default`): 50 entries → 42 unique topics, newest 2026-08-14
20:02. The only class-touching blues are still Linxy's "Class Tuning Incoming – August 18"
(topic 2336820), which IS the feed's 2026-08-15 entry, and the Aug-14 Kaivax hotfixes (2336376),
re-read in full: its Classes section is entirely BUG FIXES (Devastation Shattering Star/Mastery,
Warrior Slayer Executioner double effect, Warlock pet Soul Leech, Demonology Soul Harvest) while
every numeric line in the post is trinkets and items. The Aug-13 round-up is the same shape.
Writing either as a `Spec Class - ...` highlight would put bug-fix text into the outlook tally.

Open LEAD, not logged: "Patch 12.1.5 PTR Now Listed on Battle.net Launcher" (news 382443, 08-13).
A new cycle means a NEW forum thread, but the article says the patch has not been updated and
nothing is datamineable yet — re-discover the thread when it is.

Writeup coverage RECOMPUTED (never read from prose): one spec has no `ptr` writeup — Demonology
Warlock, the deliberate "the source reported no changes" case — and **zero** specs lack a
raid-scoped or an M+-scoped expert read.

WCL zones: no fetch by this agent (no credentials). From `wcl-fetch/evidence.json`
(attemptedAt 10:54:32Z, verdict `rdps-broken`, OAuth+GraphQL healthy, 1 point spent):
**zone 54** normalized series unreachable, stays 2026-07-28 (its raw-DPS sibling landed, 27 rows
over 8 encounters — Coiled Altar and Ula'tek at 0 players, which is empty rather than an error);
**zone 52** ptrDummy unreachable, stays 2026-08-10 (raw 102 rows landed); **zone 56** rDPS/HPS
unreachable, stays 2026-08-10 (raw 27 rows landed); **zone 57** not probed — no credentials, and
it has been confirmed twice as having zero aggregated encounters.

## 2026-08-15 (nightly, 21:50 UTC — second run of this UTC day)

**Nothing new to log on any of the four channels.** (1) Dev-notes thread `2317811.json` via
curl for the full `post_stream`: 17 posts, `last_posted_at` 2026-07-31T23:42:09Z, newest is
Linxy #19 — already the feed's 07-31 entry. The thread has been quiet 15 days; the PTR cycle
ended when 12.1 shipped. (2) Wowhead RSS, parsed per `<item>` block: 40 items, newest
2026-08-15 15:35 CDT. (3) News INDEX (`data.news.newsData`, brace-balanced from the id
attribute) polled as well because it leads RSS within a run: 20 posts, top id 382472, nothing
beyond RSS. (4) Blue tracker (`data.blueTracker.default`): 50 entries → 42 unique topics.

**The two candidate blues were re-read in full and independently confirmed as non-feed
material** — the same conclusion the earlier run reached, reached again from the source rather
than inherited: topic **2336376** (Kaivax, Hotfixes August 14) has a Classes section that is
entirely BUG FIXES with no tuning values (Devastation Shattering Star / Mastery: Giantkiller,
Warrior Slayer Executioner double-effect, Warlock pet Soul Leech, Demonology cooldown-manager)
while every numeric change in it is trinkets and items; topic **2335871** (Kaivax, "Season 2
Class Tuning Plans", 08-12) is a calendar — Aug 18 / Aug 25 / Sep 1 / Sep 22 — with no per-spec
line. Writing either as a `Spec Class — …` highlight would feed bug-fix or calendar text into
the outlook tally.

**Lead recorded, not logged:** news 382443 (08-13) — "Patch 12.1.5 PTR Now Listed on Battle.net
Launcher". A new cycle means a NEW forum thread (the `thread` key would need re-discovery), but
the article states the patch itself has not been updated and no datamining is possible yet, so
there is nothing to discover. Re-check when 12.1.5 dev notes appear.

WCL zones were **not fetched by this agent** (no credentials): from `wcl-fetch/evidence.json`,
verdict `rdps-broken` — zone 54 (PTR raid, normalized) and zone 52 (Dummy Dome rDPS) and zone
56 (PTR M+ rDPS) all unreachable through the broken metric family, while the three RAW-DPS
recipes landed (52: 102 rows, 1T/2T/3T/5T = 2000/662/297/2000 ranked players; 54 Heroic: 27
rows across 8 encounters, Coiled Altar and Ula'tek at 0; 56: 27 rows, all eight dungeons at the
2000-player pagination ceiling). Zone 57 not probed — no credentials, and it has never
aggregated.

Writeup coverage recomputed rather than read: **one** spec has no `ptr` writeup (Demonology
Warlock, the deliberate "source reported no changes" null); **zero** specs lack a raid-scoped
or an M+-scoped expert read.

## 2026-08-15 (nightly)

**A new feed entry — the first in nine days.** The dev-notes thread is closed for this cycle
and Wowhead's RSS carried only the mirror, so the entry came off channel 3: a forum search
surfaced **"Class Tuning Incoming – August 18"** (Linxy, topic **2336820**, 2026-08-15T00:11Z),
the Season 2 launch tuning pass applied with the 08-18 weekly reset.

- Logged **`kind: "build"`, `forumPostNumber: 1`**, citing topic 2336820 directly with the
  Wowhead mirror (`news=382466`) alongside. It is a STANDALONE topic, not a reply in the
  tracked `thread`, so the `thread` key is unchanged. `kind: "hotfix"` was the first shape
  tried and is wrong twice over: the post *has* a forum citation, and validation forbids a
  hotfix carrying `forumUrl` — which also reds `test/validate.test.mjs`'s host-allowlist test,
  since that test sets `builds[0].forumUrl` and counts errors. **A hotfix must never be the
  newest entry unless that test is rewritten first.**
- **14 specs distilled**, one consolidated line each: Blood + Frost DK, Devourer DH,
  Restoration Druid, Beast Mastery Hunter, Arcane Mage, Mistweaver Monk, Discipline + Holy
  Priest, Assassination + Subtlety Rogue, Enhancement Shaman, Demonology Warlock, Fury Warrior.
  Coverage gate agrees 14/14.
- **Eight Season-2 tier sets revised → eight `spec.tierSet` updates in the same edit** (Frost
  DK, Devourer DH, BM Hunter, Arcane Mage, Mistweaver, Subtlety, Demonology, Fury), `asOf`
  2026-08-15, `source` = the forum topic. Clean value swaps into the stored wording where the
  notes allow; a dated parenthetical where they do not — Arcane (the notes cut the per-stack
  bonus 5%→3% but never restate the cap), Mistweaver (a relative "+33% activation rate" with no
  absolute), and **Demonology**, where Blizzard's post calls the Implode effect the **2-set**
  while the 06-18 datamine and the 07-31 notes both placed it on the 4-set: values were updated
  where the effect is stored rather than moved on one post's say-so.
- **The PLAYER VERSUS PLAYER section was deliberately NOT distilled.** It is the only place
  Fire Mage, Retribution Paladin, Restoration Shaman and Destruction Warlock appear in this
  post. Note the trap: the tier-set upkeep gate matches on spec name + set keyword and does
  **not** look at a `PvP only` prefix, so writing the PvP-only Fire Mage 4-set line even as a
  prefixed out-of-scope record would have fired the gate on a spec whose PvE set never changed.
  Precedent (07-31 Restoration Druid) is to log no line at all — followed.
- Checked and NOT logged: the Aug-13 / Aug-14 live hotfix round-ups (bug fixes + trinket and
  item tuning, no spec tuning), "Season 2 Trinket Tuning Now Live", and the 08-12 tuning
  roadmap (already recorded — passes 08-18, 08-25, 09-01, 09-22).
- **"Patch 12.1.5 PTR Now Listed on Battle.net Launcher"** (08-13) still stands as the tip-off
  that the NEXT cycle needs a new forum thread and a re-pointed `thread` key. Nothing datamined.
- **WCL zones 54 / 52 / 56 are evidence-only on the runner** — verdict "rdps-broken", nothing
  ingested, stored data untouched. Zone 57 is not covered by the deterministic step.
- **Writeup coverage recomputed (not read): 39 of 40.** Demonology Warlock's null deliberate.
- **Migration status, unchanged and NOT attempted:** 12.1 is live, Season 2 opens 08-18 (inside
  `PHASE_FLIP_DUE` 2026-08-20); tracker still pre-flip. Owner one-shot, docs/s2-flip-runbook.md.
- **Follow-up for the next LOCAL run:** the eight `tierSet` edits above make
  `check-refresh --age` report **`gearing-tierset-sync`** (8 specs whose gearing-side text the
  tracker has since corrected — the 2026-08-08 Preservation Evoker failure shape). The fix is
  `node gearing/src/sync-tracker-fields.mjs` then `npm run gearing:build`, both under
  `gearing/`, which the nightly publish job does not stage — so it was deliberately NOT run
  here. `npm test` and the publish gate are unaffected; only the heartbeat alarms.

## 2026-08-15 (nightly CI, headless Opus 5, single-shot; started 10:57Z — SECOND run of this UTC day)

All three channels checked; **nothing new to log — `data/ptr-builds.json` stays at 16 entries,
newest 2026-08-15.** No writeup changed, no `tierSet` changed.

1. **Official dev-notes thread** `2317811.json`: `posts_count` 17, `highest_post_number` still
   **19**, `last_posted_at` 2026-07-31T23:42:09Z. Closed for this cycle, as it has been since
   the patch shipped.
2. **Wowhead news RSS**: 40 items spanning 2026-08-11 → 2026-08-15T01:05Z, parsed per `<item>`
   block (never by tag adjacency). The newest item is 10 hours old, so the window is identical
   to the 05:34Z run's. Nothing tuning-related is unlogged: "Season 2 Class Tuning Incoming
   with Weekly Reset - Blood DK Nerf" is the mirror of the Aug-18 post already in the feed.
3. **Standalone blue posts** — the blue-tracker index is **Cloudflare-403 to this runner**
   (919-byte challenge body), so discovery was done against the forum's own Discourse search
   instead (`search.json?q=@<staff>+after:2026-08-12` for Linxy / Kaivax / Aerythlea). Newest
   Linxy post is still topic **2336820** "Class Tuning Incoming – August 18"
   (2026-08-15T00:11Z), already logged as feed entry #16. Newest Kaivax class content is the
   Aug-14 hotfix topic (2336376), below.
   *Transport note for the next run: the 403 is on `wowhead.com/blue-tracker` specifically,
   and `search.json` answered every query in one round with no auth. Prefer it.*

**Checked and deliberately NOT logged** — the Aug-14 live hotfix round-up (topic 2336376;
post 1 was EDITED at 2026-08-15T01:00:47Z and re-posted as post 18, which is why it can look
new). Its Classes section is **bug fixes only, with no tuning numbers**: Devastation's
Shattering Star now correctly benefits from Mastery: Giantkiller, Arms/Fury Slayer's
Executioner no longer double-dips, Warlock pets no longer keep re-learning Soul Leech, and a
Demonology cooldown-manager display fix. Everything numeric in that post is trinket/item
tuning (Coiled Fangstone +15%, Gaze of the Alnseer -20% primary stat, …) or reward plumbing.
This matches the 05:34Z run's disposition of the Aug-13/Aug-14 round-ups; re-litigating it
would only churn the feed.

**WCL zones 54 / 52 / 56 / 57 are evidence-only for this agent** and are reported under their
own manifest keys — see the refresh-metrics log for the `rdps-broken` verdict and the three
RAW keys that landed.

Coverage recomputed rather than read (the two-line recipe in CLAUDE.md): **39/40 writeups**,
the single null being Demonology Warlock, which is deliberate — the source reported no
changes, and "nothing changed" is not a verdict.

**Still open from the 05:34Z run, unchanged:** those eight `tierSet` edits still leave
`check-refresh --age` reporting `gearing-tierset-sync`. The fix is
`node gearing/src/sync-tracker-fields.mjs` + `npm run gearing:build` under `gearing/`, which
the nightly publish job does not stage — so it stays a LOCAL-run duty and was again not run
here. `npm test` and the publish gate are unaffected; only the heartbeat alarms.

## 2026-08-14 (nightly, CI runner)

**No new build — feed unchanged at 15 entries** (newest still the 2026-08-06 launch notes).

- **Official thread 2317811.json:** posts_count 17, highest_post_number still 19 (Linxy,
  2026-07-31T23:42Z). With 12.1 shipped this thread is closed for the cycle.
- **Wowhead news RSS** (40 items, 2026-08-11..08-14, bodies read from `content:encoded` in one
  fetch): no PTR build, no spec tuning. Three items recorded rather than logged —
  (a) the **Aug-13 live hotfixes** carry a Classes section that is two BUG FIXES (pet Spirit Walk
  in Vaults of Atal'utek; Affliction's Seed of Corruption not consuming Shard Instability) on
  LIVE realms, not PTR tuning, so nothing entered the feed — consistent with 08-12 and 08-13;
  (b) "Season 2 Trinket Tuning Now Live" is item tuning with no spec attribution;
  (c) **"Patch 12.1.5 PTR Now Listed on Battle.net Launcher" (08-13)** — the next cycle is
  starting. Per the standing gotcha, a new cycle means a NEW forum thread: re-discover it via
  Wowhead RSS and re-point the `thread` key when the first 12.1.5 development notes appear.
  Nothing is datamined yet.
- **Blue-tracker sweep** (US index, 20 topics, full browser header set — a UA-only GET is 403):
  no standalone class-tuning blue post. Only "Season 2 Class Tuning Plans" (the 08-12 roadmap
  already recorded: first pass 08-18, then 08-25 / 09-01 / 09-22) and the hotfix mirror.
- **WCL zones 54 / 52 / 56 are evidence-only on the runner** — verdict "rdps-broken", nothing
  ingested, stored data untouched. Zone 57 is not covered by the deterministic step and was not
  fetched here.
- **Writeup coverage unchanged: 39 of 40.** Demonology Warlock's null stays deliberate.
- **Migration status, unchanged and NOT attempted:** 12.1 is live, Season 2 opens 08-18 (inside
  `PHASE_FLIP_DUE` 2026-08-20); tracker still pre-flip. Owner one-shot, docs/s2-flip-runbook.md.

## 2026-08-13 (nightly CI, 11:47Z — Opus 5; single-shot) — no new build; the only new class item is a tuning ROADMAP

- **Feed unchanged at 15 entries**, newest still the 2026-08-06 launch patch notes.
- **(1) Official thread** `2317811.json`: posts_count 17, highest_post_number still **19**
  (Linxy, 2026-07-31T23:42Z). With 12.1 shipped the thread is effectively closed for this cycle.
- **(2) Wowhead news RSS**: 40 items, 2026-08-08 → 08-13, bodies read from `content:encoded` in
  a single fetch. Exactly one new class-relevant item — **"Class Tuning Roadmap for Midnight
  Season 2"** (news=382435, 08-12 18:34) — and it is a **schedule, not tuning**: Season 2 opens
  **August 18** with the first tuning pass that day, then **Aug 25 / Sep 1 / Sep 22**, with
  roughly four more passes before Season 3 and hotfixes "at any time". No per-spec line ⇒ no
  feed entry and no outlook vote. Everything else is live-service (scenario bugs, hero gear,
  Renown rewards, sparks, housing, Coiled Isle).
- **(3) Wowhead blue tracker** (`/blue-tracker?rss` with the FULL browser header set — a UA-only
  fetch is CloudFront-403 and reads as an empty feed): 50 items back to 08-07; the only
  class-relevant entries are the same roadmap mirrored as "Season 2 Class Tuning Plans". **No
  standalone class-tuning blue post** of the Kaivax "Healer Tuning" shape.
- No set-touching line landed ⇒ **no `spec.tierSet` upkeep due**. Writeup coverage holds at
  **39/40**; Demonology Warlock's `ptr: null` stays deliberate ("no changes going to Season 2"
  is not a verdict) and nothing was manufactured from tuning lines.
- **WCL (evidence-only on the runner):** `wcl-fetch/evidence.json` verdict **"rdps-broken"** —
  zone 54 (34 rows, 2026-07-28), zone 52 `ptrDummy` (27 specs, 2026-08-10) and zone 56 (40 rows,
  2026-08-10) are rDPS-family and stay frozen; their raw-DPS counterparts landed via the
  deterministic step. Zone 57 (Tidebound Grotto) is not covered by the fetch step and was not
  fetched here.
- **Migration status, unchanged and NOT attempted:** 12.1 is live; Blizzard's own roadmap post
  now re-confirms **Season 2 on August 18**, inside `PHASE_FLIP_DUE` 2026-08-20. Tracker is
  still pre-flip (`PHASES.liveSeason` "s1", `SNAPSHOT_PHASE` "12.1-ptr"). Owner one-shot; see
  docs/s2-flip-runbook.md.

- 2026-08-12 (LOCAL run, ~14:3xZ — Opus 5; scheduled residential catch-up after the 10:37Z
  nightly). **0 new builds, verified independently rather than inherited from the nightly.**
  Forum thread 2317811 fetched fresh (`.json`, HTTP 200, 407 KB): posts_count 17,
  highest_post_number **19**, last_posted_at **2026-07-31** — post #19 is already logged, and
  the development-notes thread is effectively closed now that 12.1 shipped on 08-06. Wowhead
  news RSS (40 items) carries **no class-tuning or hotfix article since launch**; the only
  tuning item in range is 08-07 "More Season 2 Mythic+ Dungeon Tuning — Ruby Life Pools and
  Temple Changes", which is dungeon-side and outside this feed's per-spec scope. Feed stays at
  **15 entries**, newest still the 08-06 launch patch notes. No set-bonus-touching highlight
  landed, so no `tierSet.asOf` upkeep was owed. · **Zones 54/52/56/57: not re-fetched — the
  WCL statistics-table endpoint is behind the human challenge** (see refresh-metrics entry
  same date); stored rows and snapshots left exactly as they were.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 11:31Z)

**No new build. Feed unchanged at 15 entries, newest still the 2026-08-06 launch patch
notes.** All three channels checked, plus the WCL zones by evidence only.

1. **Official thread `2317811.json`** — `posts_count` 17, `highest_post_number` **19**,
   newest Linxy post still 2026-07-31. Nothing after the two 07-31 posts already logged as
   builds #18/#19.
2. **Wowhead news RSS** — 40 items spanning 2026-08-06 → 2026-08-12, bodies read out of
   `content:encoded` in the single fetch. **Zero class-tuning lines anywhere in the window**:
   every item published since yesterday's run (14 of them, 08-11 17:17Z onward) scores 0
   change-verb hits — launch cinematic, Coiled Isle, known-issues, Lairs, Season 2 dungeon
   guides, "Class Guides Now Updated for Midnight Season 2" (a Wowhead guide-refresh
   announcement, not tuning), Battle.net sale, sparks/trophies/lair-queue fixes.
3. **Wowhead blue tracker** — `?rss` needs the FULL browser header set (a UA-only fetch is
   CloudFront-403; recorded because the plain-UA attempt looks exactly like an empty feed).
   50 items back to 08-06: **no standalone class-tuning blue post** of the Kaivax "Healer
   Tuning" shape. Launch-adjacent posts are all non-tuning (Curse of Ula'tek now live, known
   issues, Umbral title score finalisation, Lairs, pre-season, Twitch drops, sale).
   **Dated fact worth having: "The Shadows Deepen: Midnight Season 2 Begins August 18"
   (US) / 19 August (EU)** — Season 2 opens 08-18, which is inside `PHASE_FLIP_DUE`
   2026-08-20.
- **Tier sets:** no set-touching line landed, so no `spec.tierSet` upkeep was due.
- **Writeups:** coverage unchanged at 39/40. Demonology Warlock stays `ptr: null`
  deliberately — the source reported no changes, and "nothing changed" is not a verdict.
- **WCL zones are evidence-only on the runner and none of them could land.**
  `wcl-fetch/evidence.json` verdict "rdps-broken": zone 54 (PTR raid testing score), zone 52
  (`ptrDummy` median rDPS) and zone 56 (PTR M+ rDPS/HPS medians) are all rDPS-family and stay
  frozen at 2026-07-28 / 2026-08-10 / 2026-08-10. Their RAW-DPS counterparts DID land via the
  deterministic step (see refresh-metrics) and are deliberately different statistics. Zone 57
  (Tidebound Grotto) is not probed by the fetch step and was not fetched here.
- **Migration status, unchanged and NOT attempted here:** 12.1 is live, Season 2 opens 08-18,
  and the tracker is still configured pre-flip (`PHASES.liveSeason` "s1", `SNAPSHOT_PHASE`
  "12.1-ptr", `PHASE_FLIP_DUE` 2026-08-20). Owner one-shot.

## 2026-08-12 (nightly CI, headless Opus 5, single-shot; started 20:35Z — SECOND run of this UTC day)

**No new build; all three Blizzard channels checked and clean.** Feed unchanged at 15 entries,
newest still the 2026-08-06 launch patch notes.

1. **Official thread** `2317811.json`: `posts_count` 17, `highest_post_number` still **19**
   (Linxy, 2026-07-31T23:42Z). Nothing after the two 07-31 posts already logged as #18/#19.
   With 12.1 shipped on 08-11 this thread is effectively closed for the cycle.
2. **Wowhead news RSS**: 40 items spanning 2026-08-07..2026-08-12, bodies read out of
   `content:encoded` in the single feed fetch. Scanned every body for change verbs
   ("increased by / reduced by / (was / Developers' note" …): **zero hits across all 40 items**.
   The six items new since the 11:31Z run are all live-service (Blinding Vale / Temple scenario
   bugs, a bugged Zul'jarra contract, hero-gear and Renown-reward explainers, Vaults of
   Atal'Utek, sparks).
3. **Wowhead blue tracker** (`/blue-tracker?rss`, FULL browser header set — a UA-only fetch is
   CloudFront-403 and reads as an empty feed): 50 items back to 08-06. The only two carrying
   "hotfix" are Bob the Bartender and lair-queue grouping. **No standalone class-tuning blue
   post** of the Kaivax "Healer Tuning" shape.

No set-touching highlight landed, so no `spec.tierSet` upkeep was due.

**Writeup coverage stays 39/40 and Demonology Warlock's `ptr: null` is re-confirmed, not
inherited.** Icy Veins' Season-2 raid DPS page — now a live lane since the guides rebuilt —
says in its own words: *"Demonology Warlock received no changes going to Season 2, with the
only new feature added being their tier-set."* "Nothing changed" is not a verdict, so no
writeup was manufactured.

**WCL (evidence-only on the runner):** `wcl-fetch/evidence.json` verdict **"rdps-broken"** —
zone 54 (PTR raid testing score, 34 rows), zone 52 (`ptrDummy` median rDPS, 27 specs) and zone
56 (PTR M+ rDPS/HPS medians, 40 rows) are all rDPS-family and stay frozen at 2026-07-28 /
2026-08-10 / 2026-08-10. Their raw-DPS counterparts landed via the deterministic step (see
refresh-metrics). Zone 57 (Tidebound Grotto) is not covered by the fetch step and was not
fetched here.

**Migration status, unchanged and NOT attempted:** 12.1 is live, Blizzard's own post puts
Season 2 at **August 18 (NA) / 19 August (EU)**, and the tracker is still configured pre-flip
(`PHASES.liveSeason` "s1", `SNAPSHOT_PHASE` "12.1-ptr", `PHASE_FLIP_DUE` 2026-08-20). Owner
one-shot; see docs/s2-flip-runbook.md.

## 2026-08-11 (nightly, CI) — launch day; nine null writeups became one

- **PATCH 12.1 GOES LIVE TODAY.** Wowhead: 8 hours of NA maintenance ending 15:00 PT on
  2026-08-11; the week of 08-11 is a **PRE-SEASON**, and **Midnight Season 2 formally opens
  2026-08-18**. So "12.1 live" and "Season 2 live" are a week apart — worth saying out loud,
  because the tracker's era vocabulary has one `liveSeason` for both. The owner's frozen
  forecast is already declared (`data/forecasts/frozen-2026-08-11.json` at HEAD);
  `SNAPSHOT_PHASE` is still "12.1-ptr" against PHASE_FLIP_DUE 2026-08-20.
- **No new build.** Thread 2317811.json highest_post_number still 19 (Linxy, 07-31). Wowhead
  RSS (40 items, 08-04..08-10) carries launch trailer / maintenance / pre-season details /
  background downloader / housing — no per-spec tuning line. Blue-post sweep: Discourse
  search for @Kaivax and @Linxy since 08-05 returns housing, an outage and TBC Classic PTR
  notes only. **Transport note: the Wowhead blue-tracker index is JS-hydrated and every RSS
  path tried 404s** (`/blue-tracker/rss`, `/blue-tracker/rss/all`, `/blue-posts/rss`,
  `/news/rss/blue-tracker`) — use the forum's own `search.json` instead.
- **The writeup gap closed from 9 specs to 1, and the lane that did it was new.** Icy Veins'
  rebuilt LIVE tier-list pages now carry per-spec **Season 2 analysis paragraphs** — exactly
  the material the skill's lane (b) said would not exist "until launch". Today is launch.
  Eight writeups distilled with `source` + `asOf` (page dateModified): Frost DK **Positive**
  (burst redistributed into sustain, good raid testing), Feral Druid **Mixed** (talent buffs
  + Apex nerfs, energy fixed, single target still weak), Guardian Druid **Mixed** (Apex
  rework = steadier damage, but Balance Druid may take the Mark of the Wild slot),
  Restoration Druid **Negative** (Abundance rework + Verdant Infusion no longer extending
  HoTs "significantly lower Druid's throughput potential"), Holy Priest **Positive** (S2 mana
  buffs ease its one stated weakness), Elemental Shaman **Positive** (damage out of
  Ascendance into baseline; Stormbringer nerf opens Farseer), Affliction Warlock
  **Positive** (new set + Nightfall rework, Seed applying UA at 20%), Destruction Warlock
  **Positive** (damage buff + Conflagration of Chaos redesign).
- **Demonology Warlock stays `ptr: null` on purpose.** Its blurb says the spec received *no*
  changes beyond the tier set. "Nothing changed" is not one of Positive/Mixed/Negative, and
  rule (c) is explicit: no clear verdict from the source, no writeup.
- Worth flagging for the owner: these eight verdicts come from the SAME publisher whose
  letters feed the next-patch forecast term. Different components, but one voice.
- WCL zones are evidence-only from CI: zone 54/52/56 raw series landed pre-agent; the
  rDPS/normalized cuts stay frozen under the standing `rdps-broken` verdict.

## 2026-08-15 (third run of the day — nightly, headless)

- **No new build.** Four channels swept: (1) dev-notes thread `2317811.json` via curl — 17
  posts, `last_posted_at` **2026-07-31T23:42:09Z**, newest is Linxy #19, already logged; the
  PTR thread has been quiet 15 days because the cycle ended when 12.1 shipped 08-11. (2)
  Wowhead news RSS, 40 items, newest 2026-08-15 12:40 CDT. (3) The news INDEX
  (`data.news.newsData`, brace-balanced from the id attribute) polled as well since it leads
  RSS — top id 382472, nothing beyond RSS. (4) Blue tracker (`data.blueTracker.default`), 50
  entries deduped by topic.
- **Two candidate posts read in full and deliberately NOT logged.** The Aug-13 and Aug-14
  Kaivax hotfixes each carry a `Classes` section that is **entirely bug fixes** — Devastation
  Shattering Star/Mastery, Warrior Executioner double-effect, Warlock pet Soul Leech,
  Demonology cooldown-manager, Affliction Seed of Corruption — with no tuning values; and the
  Aug-12 "Season 2 Class Tuning Plans" is a **calendar** (Aug 18 / Aug 25 / Sep 1 / Sep 22)
  with no per-spec lines. Writing either as `Spec Class — …` highlights would feed bug-fix
  and schedule text into the outlook tally.
- The feed's newest entry (2026-08-15, Linxy topic **2336820**, "Class Tuning Incoming –
  August 18") is the Wowhead item `news=382466` and was logged by an earlier run today.
- **Writeup coverage recomputed, not read:** exactly **one** spec has no `ptr` writeup —
  Demonology Warlock, the deliberate "source reported no changes" null — and **every** spec
  now carries both a raid-scoped and an M+-scoped expert read (the Brewmaster raid gap noted
  on 08-14 is closed).
- WCL is evidence-only here: `wcl-fetch/evidence.json` verdict `rdps-broken`, so zone 54
  (normalized), zone 52 `ptrDummy` and zone 56 medians stay frozen; the three `*-raw` keys
  landed pre-agent (z52 102 rows with 1T/2T/3T/5T at 2000/662/297/2000 players; z54 27 rows,
  Coiled Altar and Ula'tek at 0 parses; z56 27 rows, all eight dungeons at the 2000 ceiling).
  Zone 57 not probed — the agent holds no WCL access at all.
- **SEASON STATE:** 12.1 is live and three of four tier sources self-identify as Season 2;
  the machinery handles this by design (seasonVerified s2 → season-ahead lane + frozen
  letters, Archon still s1 and the only live-consensus contributor). **OWNER: the one-shot
  `SNAPSHOT_PHASE` flip is still pending — runbook date 08-18, `PHASE_FLIP_DUE` Aug 20.**

## 2026-08-18 (LOCAL run, ~14:2xZ — Opus 5; scheduled residential catch-up, ~3.5h after the nightly)

**Nothing ingested. No snapshot or asOf touched.** Season 2 launched with today's reset, so
this run is mostly a state check at the boundary.

**Build feed — no new entry.**
- Forum dev-notes thread `2317811`: **unchanged since 07-31** (17 posts, highest 19,
  last_posted 2026-07-31T23:42Z). The cycle has moved off this thread onto standalone topics.
- Aug-18 tuning topic `2336820`: post #1 `updated_at` is still **2026-08-18T01:51Z** — the
  exact value the nightly already recorded when it folded in the Disc Priest / Ret Paladin /
  Frost DK edits. No further edits. (Its 214 replies are all player posts, not blue.)
- **The 08-17 Wowhead hotfix round-up was deliberately NOT logged.** Its four class lines are
  BM Hunter (Dire Beast Kill Commands now benefit from Killer Instinct / Alpha Predator /
  Specialized Arsenal / Savagery), Holy Priest (spec-swap leaves SW:P not becoming Holy
  Fire), Shaman (Lava Burst shows as Primal Strike in the spellbook) and Destruction (a
  Shadowburn tooltip duration). **Three of the four are cosmetic**, and cosmetic lines vote
  in the outlook tally through `classifyHighlight` — that is the "weakest evidence steers"
  inversion the project has already rejected twice. One real-but-small scaling fix does not
  justify importing three null-or-wrong votes. Reconsider only if a later round-up carries
  actual tuning.
- Also seen and out of per-spec scope: "Mythic+ Dungeon Tuning with Season 2 Launch",
  "Venomcursed Items Secondary Stat Changes", "Hunter's Ritual Stone Weapon Embellishment
  Nerfed" (item/dungeon tuning, not spec tuning).

**WCL — the transport wall has changed SHAPE, and it is worth recording precisely.**
From Riley's residential IP, the statistics-table endpoints no longer return a bare 403:
they **302-redirect to `https://www.warcraftlogs.com/human-challenge`** (Server: cloudflare,
CF-RAY present), which follows to a 200 challenge page of 2651 bytes. `src/wcl-probe.mjs`
reports the same event as `HTTP 403 … CLOUDFLARE CHALLENGE` on all four of its site-table
probes, so **the probe's "403" and a hand curl's "302" are the same wall seen two ways** —
do not read the discrepancy as two different faults. **Not bypassed**: completing a
human-challenge is out of bounds, so zones 46/52/54 stay frozen and honest.
GraphQL is healthy on the same credentials (OAuth fine, 3600 points/hour): `dps` and
`default` return data and are **byte-identical** (0 differing of 198 on enc 3176), while
`rdps`/`ndps` still return a bare "Internal server error". The rDPS family is therefore
still broken upstream and was **not** substituted from the raw-DPS series.

**Zone enumeration — the flip-runbook step-7 confirmation, and it has flipped.**
Step 7 asks for exactly this check "on the day". Both S2 zones were `frozen` when the
runbook was written on 08-14; **they are now LIVE**:
- **53** The Venomous Abyss — 9 encounters, partitions `1=12.1*`, Mythic 5 / size 20.
- **55** Mythic+ Season 2 — 8 encounters, partitions `1=Season 2*`, Dungeon 10 / size 5.
- **54** (PTR raid, 8 encounters) and **56** (PTR M+) have now gone **`frozen`** — the PTR
  zones closed as the live ones opened, which is the cleanest possible confirmation that
  53/55 are the right ids and not their PTR namesakes.
- **57** The Tidebound Grotto still **0 encounters** — the standing 07-28 finding holds for
  the fourth check. Nothing to ingest, still.
- **New: 510 "The Venomous Abyss Complete Raid"** (1 encounter, partition `1=12.1*`), the S2
  analogue of zone 509. Untracked, same scope decision as zone 50 "Sporefall".
- ⚠ **Zone 46's default partition now reads `3=12.0.7*`, with `4=12.1` available** — the
  runbook and CLAUDE.md both record the default as having moved to `4=12.1`. It has moved
  back, or the earlier reading was of a transient. **The stored recipes pin partition 3, so
  they are correct either way**, but the documented warning ("a zone-46 fetch that omits the
  partition now returns 12.1 data under a 12.0.7 label") is not true today. Re-check rather
  than trusting either number.

**The flip itself was NOT performed** — see the run report and the commit message. It is a
one-shot reviewed OWNER commit touching `scales.json` and `required-sources.json`, both on a
local DATA run's never-touch list. `PHASES.liveSeason` is still `"s1"`; `PHASE_FLIP_DUE` is
Aug 20.

## 2026-08-18 (~16:3xZ) — THE SEASON 2 FLIP LANDED (`5e92824`, interactive local run, owner-reviewed)

**`PHASES.liveSeason` is now `"s2"`, `ptr` is `null`, and every PTR surface is sunset.**
What this means for the next run of THIS skill:
- **There is no PTR lane to watch until the 12.2 cycle opens.** `PHASES.ptr` is null; the
  Era toggle is hidden; era-tagged metrics and takes are retained as history but off the
  page. When the 12.2 PTR thread appears (re-discover via Wowhead news RSS), restore
  `ptr: { marker: "12.2 PTR", label: "12.2" }` in normalize.mjs — a NEW thread, a NEW
  marker, and this skill re-arms.
- **The WCL contract now points at zones 53 (live raid) / 55 (live M+).** The six PTR
  requirement rows (zones 52/54/56) are GONE from required-sources.json — do not write
  manifest rows for them. rdps is still 500 upstream and the statistics transport is
  still Cloudflare-challenged, so both live rows read honestly unreachable until WCL
  heals; the recipes' partition labels are "12.1" (z53) and "Season 2" (z55), both id 1.
- **`SNAPSHOT_PHASE` is `"12.1-live"` and `CONSENSUS_VERSION` is 5.** The 2026-08-18
  snapshot is the report-card boundary. Never change either without reading the version
  log beside the constants.
- **`minSuccessfulSources` is 7** (re-based from 10 for the 19-requirement contract,
  owner-acked in the flip review). The contract comment says to recalibrate upward once
  S2 upstreams flow — that recalibration is a standing owner TODO, not this skill's call.
- The stale `wow-snapshot-phase-flip` scheduled task was DELETED before the flip (it
  predated the runbook and would have flipped SNAPSHOT_PHASE alone, silencing the
  PHASE_FLIP_DUE tripwire with the rest undone). Its SKILL.md remains on disk, unarmed.
