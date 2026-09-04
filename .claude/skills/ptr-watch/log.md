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

## 2026-08-29 (local run, residential) — the September 1 tuning pass lands; Archon walled night 5

- **A real find, and the first tuning pass this feed has caught on announcement day.**
  Wowhead news RSS (HTTP 200, 147 KB, 40 items, parsed per `<item>` block) surfaced
  **news=382674 "Boomkin, Feral Druid, Mistweaver Monk Buffs - Class Tuning Coming with
  Weekly Reset"**, published 2026-08-28 17:28 CDT. Canonical source located and read
  directly rather than off the mirror: Discourse search resolved it to **topic 2342331,
  "Class Tuning Incoming – September 1" (Linxy, 2026-08-28T22:27:13Z)**. Logged as
  `kind: "build"`, `forumPostNumber: 1` of its own topic, mirror carried in `wowheadUrl`.
- **Read at VERSION 3, and that is the whole reason to fetch the forum rather than the
  mirror.** Post 1 was created 22:27:13Z and edited to v3 at 22:48:44Z; Wowhead published
  at 22:28:50Z, i.e. off v1. Two stale spots in the mirror, both confirmed harmless here:
  Discipline Priest's PvP absorb/Atonement buffs read 10/10/5% there against 15/15/10% in
  v3 (PvP-only either way, so out of scope and not distilled), and the mirror omits the
  "Does not apply to PvP combat." clause v3 attaches to Fire Mage's +3%. **No PvE value
  differs between versions** — so nothing had to be re-distilled, but the check is what
  establishes that rather than assuming it.
- **Heading nesting kept intact, and it settled the one attribution question** exactly as
  the 08-22 Warlock line did. "Shred damage increased by 10%." sits at list **depth 2**,
  directly under the bare Druid heading, one level SHALLOWER than the Balance / Feral /
  Restoration blocks at depth 3. Logged **class-wide**, not as Feral — despite Shred being
  a cat-form ability. The post's structure is the evidence; inference is not. Depths were
  measured by walking `<ul>`/`<li>` in the cooked HTML, not eyeballed off a flattened dump,
  because a flattened dump renders d2 and d3 identically.
- **PvP section deliberately not distilled** (rule 3c). Nine specs appear there and
  NOWHERE in the Classes section — Devourer DH, Devastation and Preservation Evoker,
  Arcane Mage, Assassination Rogue, Elemental and Enhancement Shaman, Arms and Fury
  Warrior — which is why they are absent from `specsAffected`. Lines that merely CARRY a
  PvP exclusion (Havoc/Balance/Feral/Windwalker "does not affect PvP combat") are ordinary
  PvE lines and were kept.
- **One set bonus touched → tierSet upkeep done in the same change.** "The Venomous Abyss
  4-piece set bonus chance to activate has been increased from 20% to 25%" is Mistweaver
  Monk's. `spec.tierSet.asOf` → 2026-08-28, `source` → this post. Note this is the **first
  absolute activation rate the notes have ever given for this bonus**: the 2026-08-15 pass
  could record only "+33% relative, no absolute available", so the stored parenthetical was
  REPLACED rather than appended to, and the bonus text itself was left verbatim (the notes
  still do not restate the full bonus, so a value swap had nothing to swap into). Gearing's
  mirror re-synced in the same change per the two-page rule —
  `node gearing/src/sync-tracker-fields.mjs && npm run gearing:build`, 1 field, text changed.
- **Every line checked against `classifyHighlight` rather than assumed** — all **15 return
  `buff`**, matching what the label claims. The two worth having verified: Discipline's
  "Shadow Mend mana cost reduced by 20%" (resource-aware, so a cost cut reads as a buff)
  and Vengeance's two mitigation lines in the "X% (was Y%)" idiom (decided by the values).
  Survival's line carries a PvP-scoped *smaller* increase ("only 3% while engaged in PvP")
  rather than a nerf clause, so it stays one-directional and votes.
- **Effect, measured against `git show HEAD:dist/index.html` and not the working tree:**
  14 spec drawers gained a build line, and 14 outlook tallies each gained a buff (e.g.
  Frost DK +3/−3 → +4/−3 over 7 of 23 builds; Protection Paladin +1/−2 → +2/−2).
  **0 outlook directions, 0 projection letters and 0 consensus letters moved** — the
  affected specs all read `source: "verdict"`, where the dated writeup outranks the tally,
  and the forecast lane is frozen post-flip. That is the honest result, not a null one:
  the pass is recorded and visible, it just does not move an arrow this week.
- **The pass is an ANNOUNCEMENT** — values apply at each region's weekly maintenance on
  September 1, so nothing live has changed yet. Said so in the label.
- **Archon: walled night 5**, and re-probed from a residential IP rather than assumed.
  Site root `archon.gg/wow` and the raid throughput tier list both return **HTTP 403,
  5.7/5.9 KB, `cf-mitigated: challenge`, `__NEXT_DATA__` absent** — the same shape as
  nights 4 and 5, and the root probe again shows this is site-wide rather than a tier-list
  gate. Residential blocked too, so the 08-27 finding that it is not IP-scoped still holds.
  Nothing merged, no snapshot bumped, stored letters and encounter tiers byte-identical.
- No 12.2 PTR announcement in any lane. The four dormant WCL PTR zone sweeps were skipped
  and no manifest row invented for them.


## 2026-08-28 (nightly, CI runner) — every live lane polled, 0 new builds; the August 27 round-up was already logged this morning

- **Between-cycles posture unchanged.** `PHASES.ptr` is null, no 12.2 PTR announcement in any
  lane, so the four dormant WCL PTR zone sweeps (54 / 52 / 56 / 57) were correctly skipped and
  no manifest row was invented for them.
- **(a) Wowhead news RSS** — HTTP 200, 148 KB, 40 items parsed per `<item>` block (never by tag
  adjacency), window 2026-08-25 through 2026-08-28 15:16 CDT. The only class-tuning item in the
  window is **news=382657 "Vashnik LFR Nerf - Patch 12.1 Hotfixes for August 27th"**, which is
  ALREADY the newest entry in `data/ptr-builds.json` — landed by this morning's local run with
  all six class lines and the three class-wide attributions (Blur, Flameshaper, Deathstalker)
  read off the post's heading structure. Its content was re-read from `<content:encoded>`
  tonight and matches the logged entry line for line, so nothing was added.
- **(b) News INDEX polled as well**, because it LEADS the RSS within a run: `data.news.newsData`
  brace-balanced from its `id` attribute, 20 posts, top id 382668 at 2026-08-28 15:16 — nothing
  the RSS lacked, and nothing class-related after 382657.
- **(c) Blue-tracker index** `data.blueTracker.default`, 50 entries. The newest class-relevant
  topic is still Kaivax's 27 August hotfix (topic 2336376, posted 19:59), already this feed's
  citation. Everything above it is the Black Temple / WoW Weekly / BCC anniversary lane plus a
  "Raid Bonus Roll Update" (topic 2341990), none of which carries a class line.
- **(d) The canonical running hotfix post was read DIRECTLY, not inferred from its tracker
  timestamp**, since it is edited in place: `2336376.json`, title still "…Hotfixes - August
  27", post 1 `updated_at` **2026-08-28T00:59:15Z** — the same edit the local run distilled —
  and its dated section headings run August 27, 26, 25, 21, 20, 19, 18, 17, 14, 13. **There is
  no August 28 section.** The literal string "August 28" does not appear in the post.
- **(e) The 12.1 development-notes thread 2317811** is at post **#19**, last posted
  2026-07-31T23:42Z: unchanged, and the closed cycle's expected silence rather than a lost
  thread. The rediscovery gotcha stays suspended.
- **Also checked: topic 2335871 "Season 2 Class Tuning Plans"**, now 190 posts but with Kaivax
  present only at post #1 (unedited since 2026-08-12) — the whole tail is player replies. Its
  roadmap still points at a pass after the first full week of live Season 2 data, so a "Class
  Tuning Incoming" post remains plausible in the next few days; izen independently says at the
  end of tonight's distilled video that another round of balance tuning lands at the end of
  this week. Nothing to log until it exists.
- **Correctly NOT logged from the same window:** "Mythic Coiled Altar Nerfed - Race to World
  First" (news=382658) — encounter tuning, its five lines all Veil of Twilight / Malacrass /
  Zul'jan / Spiteful Soulcoiler / Mass Dreadmarch; the Vashnik LFR and Normal difficulty
  numbers that headline 382657's own mirror; and the two Ion Hazzikostas interviews. No
  set-bonus text was touched anywhere, so no `spec.tierSet` needed advancing and the gearing
  mirror needed no resync — which also means the nightly did not hit the structural bind the
  08-26 entry documents.
- **Writeup coverage** recomputed rather than remembered: exactly one spec has no `ptr`
  writeup, Demonology Warlock, whose null is the deliberate "the source reported no changes"
  case. Nothing to fill.


## 2026-08-28 (local, scheduled) — the August 27 hotfix round-up lands: 6 class lines, 3 of them class-wide on NESTING, and a misclassified Blur line that structurally cannot vote

- **One new feed entry: `2026-08-27`, `kind: "hotfix"`.** It postdates the 2026-08-27 nightly
  (which started 20:43Z; the Wowhead mirror published 2026-08-28T01:30Z and the canonical post was
  edited 2026-08-28T00:59:15Z), so no nightly had seen it, and today's 10:37Z nightly has not run —
  GitHub's scheduler is badly delayed right now (yesterday's fired at 20:43Z, ten hours late).
- **Canonical source read directly, per the 08-25/08-26 precedent:** Kaivax's running hotfix blue
  post, us.forums topic 2336376, title rolled to "World of Warcraft: Midnight Hotfixes - August 27",
  post 1 edited 2026-08-28T00:59:15Z. Read with `<ul>` nesting INTACT.
- **The nesting settled THREE attributions, not one.** The flattened Wowhead mirror renders two of
  them as "EvokerFlameshaper:" and "RogueDeathstalker:", which reads as spec scoping and is not:
  · Blur sits under a bare **Demon Hunter** heading with no spec beneath → class-wide.
  · Flameshaper sits under **Evoker**, one level SHALLOWER than the Preservation block → class-wide.
  · Deathstalker sits under **Rogue**, which has no spec block at all → class-wide.
  Flameshaper and Deathstalker are HERO talents spanning two specs each (Devastation/Preservation,
  Assassination/Subtlety), so pinning either to one spec would be inference the post does not make.
- **⚠ The Blur line classifies NERF and the classification is WRONG in direction.** The fix removes
  a PvP adjustment that was leaking into PvE and explicitly restores Blur's PvE damage reduction
  "to previous intended values" — a defensive restoration. It reaches no tally, and that is
  STRUCTURAL rather than lucky: `outlookFor` scores only highlights beginning "<Spec> <Class> ",
  so class-wide lines are excluded from scoring by construction while still reaching the drawer's
  fact list via `specBuildChanges`. Confirmed empirically, not just by reading the code — outlook
  captured for all eleven specs across the three affected classes before and after: direction,
  source and buff/nerf tallies identical on all eleven, with the Demon Hunter specs holding at
  Havoc +7/−1, Devourer +2/−2, Vengeance +4/−0. Only build MEMBERSHIP moved (N of 21 → N+1 of 22),
  which is the ordinary bookkeeping of adding a build they are all named in.
  The first draft of the entry label overclaimed this as "all eleven unchanged"; it was corrected
  to name the membership move before commit.
- **No set bonus is touched**, so no `spec.tierSet` bump and no gearing mirror resync — this
  round-up does not repeat the split the 2026-08-26 entry documents.
- **12.2 PTR: still nothing.** Swept all 40 RSS items, titles and `content:encoded` bodies, for
  12.2 / PTR / "next patch". Two hits, both design commentary in Ion Hazzikostas interviews: the
  Psybear one names "a plan for Patch 12.1.5, 12.2, and well beyond" as release-cadence talk, and
  the Tettles one discusses PTR-testing philosophy in general. Neither is an announcement. The
  between-cycles posture is unchanged and the dormant zone sweeps stayed dormant.
- **RSS parser trap, hit and recorded:** the documented `<title>`-then-`<link>` ordering is
  right, but a first pass that built the tag regex through a shell `node -e` string returned 40
  items with every field EMPTY — which looks exactly like a dead feed rather than a quoting fault.
  Moving the same regex into a `.mjs` file fixed it with no logic change. Prove the extractor on a
  known-positive item before believing an empty result; this is the third shape of that lesson.


## 2026-08-27 (nightly) — nothing new in any live lane; the dev-notes thread is still at post #19 and no 12.2 PTR has been announced

**Builds found: 0. `data/ptr-builds.json` untouched.** Newest entry stays the 2026-08-26 live
hotfix round-up that the same-day local run completed (its deferred Devourer set line landed there).

- **All three live lanes polled, not just the RSS.** (a) Wowhead news RSS: HTTP 200, 161 KB,
  40 items parsed per `<item>` block (title-then-link order, never tag adjacency), window
  2026-08-24 → 2026-08-27 15:00. Nothing after the already-logged 08-26 hotfix (news=382643,
  19:57) is class tuning: the six newer items are a TBC anniversary compendium, the Psybear
  developer interview, an RWF day-9 recap, a pet guide, a Taliesin/Evitel opinion piece and an
  achievement note. (b) The news INDEX (`data.news.newsData`, brace-balanced from the id
  attribute) — polled because the index LEADS the RSS within a run; page 1 held 20 posts, top id
  382642, and surfaced nothing the RSS had not. (c) The blue-tracker index
  (`data.blueTracker.default`): 50 entries, newest class-relevant one is Kaivax's 26 August
  hotfix topic 2336376 at 19:55, already the citation on the logged entry.
- **The canonical running hotfix post was read directly, not inferred from its tracker
  timestamp** — it is edited in place, so a stale index entry proves nothing. `2336376.json`:
  post 1 created 2026-08-14, `updated_at` **2026-08-27T00:55:19Z**, which is the same edit the
  local run already distilled; its newest dated heading is still **August 26, 2026**. No
  August 27 section exists yet.
- **The 12.1 development-notes thread (2317811) is at post #19, last posted 2026-07-31T23:42Z**
  — unchanged, and the closed cycle's expected silence rather than a lost thread. No 12.2 PTR
  announcement in any lane, so the between-cycles posture holds and `PHASES.ptr` stays null.
- **Dormant lanes skipped as designed**: the WCL PTR zone sweeps (54 raid / 52 Dummy Dome /
  56 M+ / 57 Tidebound Grotto). Their contract rows left at the flip, so they get no manifest
  row, and the stored zone-52/54/56 rows remain the closed cycle's final receipts. This agent
  made no warcraftlogs.com request of any kind.
- Watch item for the next few runs, from the 08-22 entry's own citation: Blizzard's Season 2
  tuning roadmap (topic 2335871) names **September 1** as the next scheduled pass, so a
  "Class Tuning Incoming" post is expected around 08-29 to 08-31.


## 2026-08-27 (local, scheduled) — the nightly's DEFERRED set line landed: the August 26 Devourer entry is logged and the gearing mirror resynced in the same commit

- **The one class line the nightly could not ship is now shipped.** Tonight's nightly logged 4 of
  the August 26 round-up's 5 class lines and deferred the fifth by design — "Fixed an issue that
  prevented the effect of the Devourer 2-piece set bonus (Soulburst) from displaying correctly"
  matches SET_KEYWORD, so logging it obliges a `tierSet.asOf/source` bump, and since 2026-08-23
  `validateData` also requires `gearing/data/specs.json` to carry identical `set2/set4/asOf`. The
  nightly's refresh artifact and publish staging are `data/` + `dist/` + skill logs, so a nightly
  agent structurally cannot ship the gearing half; a local run holds the whole tree and can.
- **Re-verified live before editing rather than inherited from the manifest.** Topic 2336376 fetched
  as `.json` (HTTP 200, 33 KB); post 1, `updated_at` 2026-08-27T00:55:19Z — unchanged since the
  nightly read it, so no August 27 section exists yet. The August 26 section was sliced by its own
  date marker and re-counted: **5 class lines**, matching the stored 4 plus the deferred Devourer one.
- **The trap this run had to avoid, and did:** the same post also carries a Devourer **4-piece**
  tuning note ("performing significantly above expectations, so we're reducing its power"). Located
  by byte offset it sits at 43730, inside the **August 18** section (42779–64717) — the launch-day
  tuning, already historic. Only the 2-piece display fix belongs to August 26. A grep for
  "Devourer" across the post without date-slicing would have pulled a live-looking 4-piece nerf into
  an August 26 entry.
- **What changed:** the 2026-08-26 entry gains the highlight and `Devourer Demon Hunter` in
  `specsAffected` (both PREPENDED, since Demon Hunter is first in the post's own order) — 5 specs /
  5 highlights. Devourer's `tierSet.asOf` 2026-08-15 → 2026-08-26, `source` → the hotfix topic, and a
  dated parenthetical appended to **set2** (the piece the fix concerns); the 2-piece WORDING is
  unchanged, per the 2026-08-20 Affliction Warlock and 2026-08-18 Elemental Shaman precedents. The
  entry's own label was rewritten from "⚠ ONE CLASS LINE IS DELIBERATELY MISSING" to a resolved
  "✔ LANDED" note, so the data no longer advertises a deferral that has been paid.
- **Impact measured, not assumed:** `classifyHighlight` returns **null** on the line (a display-bug
  fix), so it does not vote and no outlook DIRECTION moved; `npm run validate` passes, which is what
  proves the `specsAffected` ↔ `highlights` coverage gate and the tierSet-sync gate are both
  satisfied. `node gearing/src/sync-tracker-fields.mjs` reported exactly 1 field synced, 1 with
  changed text.
- **RSS + forum sweep, nothing new:** Wowhead news RSS re-fetched (HTTP 200, 187 KB, 40 items parsed
  per `<item>` block), newest item 2026-08-27T08:00-0500 — the SAME head the nightly saw, so nothing
  landed in the intervening half hour. **No 12.2 PTR announcement.** The Aug 26 hotfix article is
  already logged; the Tettles/Ion interview, the Mysterious Mix Master achievement item and the RWF
  recaps carry no class tuning.
- **STRUCTURAL, for Riley (unchanged and worth a decision):** any set-touching hotfix puts the
  nightly in exactly this position again — it must defer, and the deferral then blocks that hotfix's
  line until someone runs locally. The fix would be letting the publish job stage `gearing/`, or
  moving the mirror sync into the build.


## 2026-08-27 (nightly) — the August 26 hotfix round-up LANDED (4 of its 5 class lines); the 5th touches a SET BONUS and a nightly structurally cannot ship it

- **Feed +1: `2026-08-26`, `kind: "hotfix"`, 4 specs / 4 highlights.** Canonical source read
  DIRECTLY rather than off the Wowhead mirror: Kaivax's running hotfix blue post (us.forums topic
  **2336376**, `.json` via curl so the whole `post_stream` comes back), whose title has rolled to
  "World of Warcraft: Midnight Hotfixes - August 26" and whose post 1 was edited
  **2026-08-27T00:55:19Z** to carry the August 26 section. Read with its `<ul>` heading structure
  INTACT, which is what settles the post's one attribution question: the **Sudden Death** line sits
  directly under the bare **Warrior** heading with no spec beneath it, one level SHALLOWER than the
  four spec-scoped lines, so it is logged `Warrior (class-wide)` rather than guessed onto Arms or
  Fury. `specsAffected` carries the `Warrior (class-wide)` sentinel, which is what makes
  `specBuildChanges` route it — verified after the edit that Arms, Fury AND Protection each receive
  it flagged `classWide`, and that Prot Paladin / Holy Priest / Elemental Shaman each receive their
  own line.
- **Classification checked, not assumed.** Three of the four classify **null**; **Elemental Shaman
  classifies BUFF** (the Farseer fix restores healing Maelstrom Supremacy was failing to increase)
  and is reported as such rather than talked down. It moved no outlook DIRECTION — Elemental is
  driven by a dated writeup verdict (Positive → up), so only its stated line counts moved, **+2/−1
  across 6 builds → +3/−1 across 7**. Verified by running `outlookFor` against the committed feed
  and the new one side by side.
- ⚠ **ONE CLASS LINE IS DELIBERATELY MISSING AND NEEDS A LOCAL RUN — the biggest thing in this
  entry.** The post's **Devourer Demon Hunter** line ("Fixed an issue that prevented the effect of
  the Devourer **2-piece set bonus** (Soulburst) from displaying correctly") matches `SET_KEYWORD`,
  so logging it obliges bumping that spec's `tierSet.asOf`/`source` — and since 2026-08-23
  `validateData` ALSO requires `gearing/data/specs.json` to carry identical `set2`/`set4`/`asOf`.
  **The nightly cannot ship the gearing half.** The refresh artifact is `path: data/` +
  `.claude/skills/*/log.md`, and publish stages `git add data/ dist/ ".claude/skills/*/log.md"` —
  `gearing/` travels in neither. So publish would check out master's mirror (asOf 2026-08-15) over
  my bumped tracker copy.
  **Measured rather than assumed:** with the tracker bumped and the mirror at its committed text,
  `validateData` returns **exactly 2 errors**, both the `tierSetSync` message for Devourer Demon
  Hunter. That is a Gate-1 red, which discards the whole night — and it would REPEAT every night
  after, because the un-logged hotfix gets re-derived each run and the same agent reaches the same
  edit. A permanent nightly outage against one display-bug line is the wrong trade, so the line is
  deferred and the deferral is written into the build entry's own `label` (not only here), so it is
  discoverable from the data.
  **LOCAL-RUN FIX, one pass:** append the Devourer line to the 2026-08-26 entry's `highlights` and
  `"Devourer Demon Hunter"` to its `specsAffected`; set that spec's `tierSet.source` to
  `https://us.forums.blizzard.com/en/wow/t/world-of-warcraft-midnight-hotfixes-august-26/2336376`
  and `tierSet.asOf` to `2026-08-26`, appending a dated parenthetical to `set2` (the 2-piece
  **wording is unchanged**, so do not rewrite the bonus text — the 08-20 Affliction Warlock entry is
  the precedent); then `node gearing/src/sync-tracker-fields.mjs && npm run gearing:build`.
  **Worth raising with Riley as a structural item, not just a chore:** any set-touching hotfix now
  puts the nightly in this position, and it will recur.
- **Out of scope, deliberately not distilled** (all verified present and passed over): the Delves
  section (Infiltrator Garand, Gnok); the whole Dungeons and Raids section (Venomous Abyss Story
  Mode followers, The Lost Explorers' Cauterizing Flame interaction, the two Ula'tek fixes for
  Mother's Wrath targeting and duplicate Doomscale Shell); Items and Rewards (Silvermoon Splendor /
  Nebulous Voidcore, Catalyst eligibility for Great Vault and bonus-rolled raid armor, Season 2
  socketing, Renown "Overflowing" caches); and the PvP-only Training Grounds: Arena fix.
- **Three discovery channels swept, all three clean beyond the above.**
  · **Wowhead news RSS** (`/news/rss/all`, 187 KB, 40 items parsed per `<item>` block): newest item
    2026-08-27 08:00. The only class-relevant item newer than the stored feed's 2026-08-25 head is
    news=382643, the August 26 hotfix article. Correctly NOT logged from the same window:
    "Coiled Altar, Ula'tek and Nymrissa Tuning with Weekly Reset" and "Heroic Vashnik Nerfed in
    Hotfixes" (encounter tuning, no class line) and the Tettles/Ion interview news=382637 (design
    commentary, not tuning).
  · **Wowhead news INDEX** polled as well, because the index leads RSS within a run
    (`data.news.newsData`, brace-balanced from the id attribute): 20 posts, newest 382629 at
    2026-08-27 08:00 — identical head to RSS, so nothing landed mid-run.
  · **Blue tracker** (`data.blueTracker.default`, 50 entries): nothing newer than the August 26
    hotfix topic. The most recent standalone class-tuning topic is "Class Tuning Incoming –
    August 25" (2339812), stamped 2026-08-24 18:59 for its Restoration-Druid update — already
    carried by the feed's 2026-08-22 entry, which lists Restoration Druid. **No new standalone blue
    post**, and **no 12.2 PTR announcement** anywhere in the window.
- **The 12.1 development-notes thread (2317811) is still at post #19, `last_posted_at`
  2026-07-31T23:42Z.** That is the closed cycle's expected silence, re-verified this run, NOT a
  lost thread — the rediscovery gotcha stays suspended until Blizzard announces 12.2, at which point
  opening the new cycle is an owner action.
- **Dormant lanes skipped as designed:** the four WCL PTR zone sweeps (54 raid / 52 Dummy Dome /
  56 M+ / 57 Tidebound Grotto). Their contract rows left with the flip, so they get no manifest row
  and the stored zone-52/54/56 series stay untouched as the closed cycle's final receipts. This
  agent made no request to warcraftlogs.com by any route.
- **Tier-set upkeep otherwise clean:** the Restoration Druid 4-piece "Genesis duration increased by
  8 seconds (was 4)" from the 08-25 pass is already stored at 8 with `asOf` 2026-08-22, and the
  gearing mirror agrees — the drift this gate exists for is not present.


## 2026-08-26 (nightly) — the August 25 hotfix round-up LANDED; one new class line in it (Unholy DK), the other 14 are the 08-22 pass restated

Between-cycles posture unchanged: the 12.1 PTR cycle is closed, so only the live lanes ran and
the four dormant WCL PTR zone sweeps (54 raid / 52 Dummy Dome / 56 M+ / 57 grotto) were skipped
rather than recorded — their contract rows left with the flip. No 12.2 PTR announcement in any
channel, so no owner escalation is due.

**Three discovery channels swept, not one.** (a) Wowhead news RSS — HTTP 200, 179,289 bytes,
40 items parsed per `<item>` block. (b) The news INDEX, because it leads RSS within a run:
`data.news.newsData` extracted by anchoring on the id attribute and brace-balancing from there,
20 posts, top id 382626, head identical to the RSS so nothing landed mid-run. (c) The
blue-tracker index (`data.blueTracker.default`, 50 entries, deduped by topic) — and this is the
channel that carried tonight's find. RSS alone would have missed it: the hotfix round-up has no
Wowhead news article covering its Classes section.

**Logged: 2026-08-25, kind `hotfix`.** Canonical source read directly, not off a mirror —
Kaivax's rolling hotfix post, us.forums topic **2336376**, title now "World of Warcraft: Midnight
Hotfixes - August 25", post 1 edited **2026-08-25T17:11:23Z** to append the section (72,987 chars,
read with its `<ul>` nesting intact). Cited via the wowhead blue-tracker mirror in `wowheadUrl`
(the hotfix kind forbids a `forumUrl` and validation enforces it).

**Only ONE class line is new to this feed:** Unholy Death Knight — "Resolved an issue causing the
Unholy Devotion attack speed increase to also reduce attack damage and therefore have a neutral
effect." It classifies **null** under `classifyHighlight` (checked in-process, not assumed): its
clauses mix an *increase* with a *reduce*, so it does not vote. That is the honest reading — the
net effect is a buff, but the sentence is not one-directional.

**The other 14 lines were deliberately NOT re-distilled**, and this is the judgment worth
remembering. The Classes section is the 2026-08-22 "Class Tuning Incoming – August 25" pass
restated verbatim as it shipped; compared line by line, all 14 match at identical values. The
outlook tally counts LINES, so logging them again would double-count one tuning pass — the same
reasoning CLAUDE.md gives for excluding the launch patch notes. The comparison also settles the
tier-set question for free: both set-bonus lines (Restoration Druid 4-piece Genesis +8s,
Retribution Paladin 4-piece Divine Arbiter +150%/+75%) are unchanged from the announcing post,
whose date the two `spec.tierSet` entries already carry, so nothing needed advancing and the
upkeep gate is quiet *honestly* rather than by omission.

The post's PvP section is very large this week (Devourer, Havoc, Feral, Augmentation, MM, Survival,
Fire, Brewmaster, Windwalker, three Paladin specs, all three Priest, all three Rogue, Elemental and
Restoration Shaman, all three Warlock, Arms) and is out of scope per the PvE rule.

**Swept and correctly NOT logged:** the **August 21** round-up (news=382566) — it has no Classes
section at all, only Delves / Dungeons and Raids / Housing / Items / Prey, which is why the feed's
gap between 08-20 and 08-25 is right; the encounter and affix articles news=382602 (Heroic Vashnik),
382607, 382610 and 382597 (M+ tuning); and **news=382603 "Estimated DPS Increases for August 25th
Class Tuning"**, which is Wowhead's own third-party sim ESTIMATE of this pass, not a source of
tuning values.

Also checked: forum post 2339812 is still at **version 2** (edited 2026-08-24T21:44Z), i.e. no
further edit since last night's amendment, so the 08-22 entry stands as written. The official
development-notes thread 2317811 is still quiet since post #19 on 2026-07-31 — the closed cycle's
expected silence, not a lost thread. Writeup coverage recomputed rather than remembered:
**1 of 40** specs has no `ptr` writeup (Demonology Warlock, deliberate — its source reported no
changes).


## 2026-08-25 (nightly, 2nd run of the day) — nothing new; the Aug 25 pass is live but Blizzard has posted no round-up for it yet

Ran at ~15:55Z, i.e. after the 11:24Z nightly and the ~14:30Z local sweep. **No feed entry created,
no data file touched by this lane.** All four channels swept:

- **Wowhead RSS** 40 items, HTTP 200, 154 KB, parsed per `<item>` block. Nothing new since the
  14:30Z local sweep; newest is `news=382603` (08:05 CDT).
- **News INDEX polled as well** (`data.news.newsData`, 20 posts, newest 382603) because the index
  leads the RSS — same head, so nothing landed mid-run.
- **Blue tracker** (`data.blueTracker.default`, brace-balanced from the id attribute): newest
  Blizzard class post is still Kaivax's "Class Tuning Incoming – August 25". No 12.2 PTR
  announcement in any channel.
- **Dev-notes thread 2317811**: last Linxy post is #19, 2026-07-31 — the closed cycle's silence.

Three examined and correctly NOT logged:
- `news=382603` "Estimated DPS Increases for August 25th Class Tuning" — **Wowhead's own class
  writers' sim estimates OF the already-logged pass**, not Blizzard data. Worth recording that its
  16-row table is a clean cross-check on our distillation: it names exactly the 14 PvE specs in the
  08-22 entry (plus Preservation Evoker and Havoc DH in the headline, both of which ARE in our
  `specsAffected`), so no spec was missed.
- **The running hotfix post has an August 21 section with no Classes block at all** (topic 2336376,
  title rolled to "August 21", post 1 v15, edited 2026-08-22T01:46Z): Delves, Dungeons and Raids,
  Housing, Items, Prey only. That is why there is no 08-21 hotfix entry in the feed and why one
  should not be manufactured — the absence is upstream's, not a distillation gap.
- `news=382602` Vashnik, `news=382597` M+ tuning, the Nymrissa and Altar of Fangs blue posts:
  encounter/dungeon tuning, out of scope.

The 08-22 entry's v2 amendment re-verified against the forum JSON: topic 2339812 is **still version
2**, updated 2026-08-24T21:44Z, so no third edit landed. No set bonus touched → no `spec.tierSet`
advanced. Writeup coverage recomputed rather than remembered: **one** spec at `ptr: null`
(Demonology Warlock, the deliberate one). PTR zone lanes (54/52/56/57) dormant, as designed.


## 2026-08-25 (local) — nothing new to log; the August 25 tuning had not gone live yet at run time

Delta check against the nightly's own sweep three hours earlier (its `startedAt` 11:24:31Z), run
at ~14:30Z. **No feed entry created, no data file touched by this lane.**

- **Wowhead RSS**: 40 items, HTTP 200, 155 KB. **Three landed after the nightly's sweep** — the
  only one in scope is `news=382602` "Heroic Vashnik Nerfed in Hotfixes" (12:17Z). Read in full
  from `content:encoded` rather than judged by its title: it is **pure encounter tuning** (Blood /
  Shadow / Flame Infusion each 200% → 100% on Normal and Heroic, plus the Imbibe damage ladder)
  with **zero class lines**, so it is correctly not feed material — the same call the nightly made
  on `news=382597`. The other two were a Delve loot post and a Method world-first recap.
- **The August 25 class tuning pass is ALREADY LOGGED** as the 2026-08-22 `kind: "build"` entry
  (topic 2339812, 14 specs / 15 highlights). It had **not gone live** when this ran: US weekly
  reset is ~15:00Z and the run was ~14:30Z, so its live confirmation belongs to the next sweep.
  Recording this explicitly because "the announced pass is in the feed" and "the pass has shipped"
  are different facts and only the first is true tonight.
- **Three forum topics polled, all byte-unchanged since the nightly:**
  · dev-notes `2317811` — still `highest_post_number` 19 (Linxy, 2026-07-31). The closed 12.1
  cycle's expected silence; per the between-cycles posture this is NOT a lost thread.
  · running hotfix `2336376` — post#1 still v15 at 2026-08-22T01:46:38Z, so **no August 23/24/25
  hotfix section has been added** upstream.
  · `2339812` "Class Tuning Incoming – August 25" — post#1 still v2 at 2026-08-24T21:44:22Z, i.e.
  the PvP-only amendment the nightly already handled. No third revision.
- **NO 12.2 SIGNAL.** All 40 RSS titles *and* bodies scanned for "12.2", "next major patch", "PTR
  is now available", "PTR Development Notes", "Public Test Realm" — **0 hits**, matching the
  nightly. PTR zone sweeps (54/52/56/57) remain dormant and were not attempted.
- **Transport note for the next run:** the Discourse `.json` needs the **canonical slug** —
  `…/t/<slug>/<id>.json` returns 200, while the `…/t/x/<id>.json` placeholder form returns an
  EMPTY body with no error, which reads exactly like a dead topic. `curl -sL` on the bare
  `…/t/<id>.json` form also works. Cost one wasted probe round; recorded so it does not cost
  another. (Wowhead's `/news` index remains 403 to a UA-only curl, as the existing trap says —
  the RSS carried everything needed, so the full header set was not required tonight.)


## 2026-08-25 (nightly) — the August 25 tuning post was EDITED to v2, and the edit is PvP-only

- **No new feed entry.** Newest entry stays 2026-08-22.
- **The finding:** forum topic 2339812 "Class Tuning Incoming – August 25" — the source of the
  logged 08-22 entry — went from **version 1 to version 2 at 2026-08-24T21:44:22Z**. It was still
  v1 and unedited when checked 24 hours earlier, and Wowhead re-headlined its mirror news=382565
  as "(Updated) … Restoration Druid Tuning Added", which reads like new PvE tuning and is not.
  Blizzard's own words: "Following a review of feedback and data, we've decided to make a few
  additional updates for **the PvP tuning** this week." What it actually does:
  (a) attaches "Does not apply to PvP combat" to two Restoration Druid lines already logged here
  at the SAME PvE numbers (Rejuvenation/Germination +15%, Everbloom 48% of Lifebloom's final heal
  was 40%) — those two clauses gained a "PvE only" marker to match the Preservation, Affliction
  and Demonology lines that already carried one, and the consolidated line still classifies null;
  (b) adds PvP-combat-only changes for Fire Mage (Burnout 50% of remaining Ignite in PvP, was 75%)
  and Arms Warrior (Slayer's Strike +5% in PvP, was +15%) — **out of scope per rule 3c** and
  deliberately NOT written as spec highlights.
  `specsAffected` unchanged; the amendment and its date are recorded in the entry's own label.
  **Lesson worth keeping: re-poll a logged post's `version`/`updated_at`, not just the topic list.**
  Nothing in the news feed or blue tracker would have told you the PvE section was untouched —
  only reading the diff does.
- The **EU mirror topic 626484** ("Class Tuning Incoming – 26 August") took the identical v2 edit
  at 21:46Z. Same pass, not a second one; the US topic already carries it.
- **No 12.2 signal.** All 40 RSS bodies plus the news-index and blue-tracker payloads scanned for
  "12.2", "next major patch", "PTR is now available", "PTR Development Notes", "Public Test Realm"
  — zero hits. Dev-notes thread 2317811 still at highest post 19 (Linxy, 2026-07-31).
- Swept and correctly not logged: news=382597 "Mythic+ Tuning Changes Now Live" (Murder Row /
  Blinding Vale trash and boss tuning, zero class lines), news=382564 Concealed Pistol, the
  Trading Post and BCC Anniversary items, the RWF day recaps. Running hotfix topic 2336376 is
  still v15 at 2026-08-22T01:46:38Z — no Aug 23/24 hotfix section exists yet.
- No set bonus touched → no `spec.tierSet` advanced.
- Channels: RSS 40 items / 154 KB, news index 20 posts (newest id 382597), blue tracker 50
  entries → 42 unique topics. PTR zone sweeps (54/52/56/57) dormant between cycles, not attempted.


## 2026-08-24 (local) — verification pass over the nightly; one post-nightly article read and correctly not logged

**No feed change. The newest entry stays 2026-08-22** ("Class Tuning Incoming – August 25"). Ran as
the scheduled local ptr-watch ~2.7h after the nightly (CI `startedAt` 11:37Z, this run 14:1xZ) and
re-derived its "nothing new" independently rather than trusting it. Nothing written by this skill:
no feed entry, no `tierSet` touch.

- **Wowhead news RSS**: HTTP 200, 121,890 bytes, 40 items, parsed per `<item>` block (never by tag
  adjacency), bodies free in `content:encoded`.
- **One item POSTDATES the nightly's sweep and was read in full.** The nightly's newest was
  `news=382495` (08-24 00:56Z); tonight's is **`news=382541`** "Communicate Cooldowns and Resources
  with Expanded Pings" (08-24 12:17Z, ~3.1 KB of body text after tag-stripping). It is a UI feature
  article about the new `/pingspell` command, macro examples and resource-bar pings — **zero class
  or spec tuning values**, so a feed entry would carry an empty specsAffected/highlights pair and
  reach no drawer. Correctly not logged. This is the case the sweep exists for: it landed in the
  ~40-minute gap between the nightly's RSS read and its publish.
- **Edit checks on all three canonical topics — every one byte-matching the nightly's record**,
  so no in-place amendment slipped in after its poll: running hotfix topic **2336376** ("Hotfixes -
  August 21") post #1 still **v15**, `updated_at` 2026-08-22T01:46:38Z, so no August 22/23/24
  hotfix section has been appended; **2339812** ("Class Tuning Incoming – August 25") post #1 still
  **v1**, unedited since creation, so the logged 08-22 distillation is current and the Aug-25
  reset pass has not been revised; dev-notes thread **2317811** still at highest post **19**
  (Linxy, 2026-07-31), the closed cycle's expected silence.
- **`news=382566`** (the Aug-21 hotfix round-up) remains correctly ABSENT — settled by the 08-23
  local run and re-confirmed by tonight's nightly, which read the body in full and found its
  sections are Delves/Dungeons/Raids/Housing/Items/Prey with no class lines. Not re-derived here.
- **12.2 PTR: still no announcement.** All 40 RSS bodies scanned for `12.2`, "next major patch",
  "PTR is now available", "PTR Development Notes" and "Public Test Realm" — **0 hits** in titles or
  bodies. (Two creator videos in the transcript queue carry tuning-flavoured titles — Dalaran
  Gaming's "Up To 350% Increases Dropping Next Reset!" and izen's "FIRST Buffs & Nerfs of Season 2"
  — and both point at the already-logged 08-22 post, which is the leads-are-not-sources rule
  working as intended.)
- PTR zone sweeps (54/52/56/57) remain dormant and were not attempted; their contract rows were
  removed at the flip.


## 2026-08-24 (nightly) — three channels swept, nothing new to log, still no 12.2 PTR

**No new feed entry. The newest entry stays 2026-08-22** (the "Class Tuning Incoming – August 25"
post), and every canonical post behind the recent entries was re-polled for in-place EDITS rather
than assumed static.

- **Wowhead news RSS**: 40 items, parsed per `<item>` block (never by tag adjacency), bodies free
  in `content:encoded`. Newest item Sun 23 Aug 19:56 CDT (news=382495).
- **News INDEX** (`data.news.newsData`, anchored on the id attribute and brace-balanced): 20 posts,
  newest **382495**. It did not lead the RSS tonight, but was polled anyway — the 08-04 case is
  exactly a post landing between the two.
- **Blue tracker** (`data.blueTracker.default`): 66 KB, 50 entries, **44 unique topics** after
  deduping by topic id. Newest 2026-08-22 22:58 (Zorbrix, the Evoker disconnect thread).
- **Edit checks, all three unchanged:** running hotfix topic **2336376** post #1 still **v15**,
  `updated_at` 2026-08-22T01:46:38Z — so no August 22 or 23 hotfix section has been appended;
  **2339812** ("Class Tuning Incoming – August 25") post #1 still **v1**, unedited since creation,
  so the logged 08-22 distillation is current; dev-notes thread **2317811** still at highest post
  19 (Linxy, 2026-07-31), the closed cycle's expected silence.
- **Swept and correctly NOT logged**, each read rather than judged by title: **news=382566**
  "Patch 12.1 Hotfixes for August 21st" — body read in full, and its sections are Delves, Dungeons
  and Raids, The Venomous Abyss, Housing, Items and Prey with **zero class or spec lines**, so a
  `kind: "hotfix"` entry would carry an empty specsAffected/highlights pair and reach no drawer
  (this re-confirms the 08-23 local finding rather than re-deriving it); **news=382564** "Concealed
  Pistol in Murder Row" — a dungeon-item guide about vendor Extra Action items, no class content;
  the Mythic Nymrissa nerf and the Evoker disconnect acknowledgement (encounter tuning and a bug);
  the Altar of Fangs and Item Adjustment topics (dungeon and item tuning); and the RWF day recaps.
- **The only value-bearing class line anywhere on or after 08-21** is in the already-logged 08-22
  tuning post. No set bonus was touched by anything tonight, so no `spec.tierSet` needed advancing.
- **12.2 PTR: still no announcement.** All 40 RSS bodies scanned for `12.2`, "next major patch",
  "PTR is now available", "PTR Development Notes" and "Public Test Realm" — **zero hits** in titles
  or bodies.
- PTR zone sweeps (54/52/56/57) remain dormant and were not attempted; their contract rows were
  removed at the flip. Nothing written by this skill: no feed entry, no tierSet touch.


## 2026-08-23 (local) — verification pass over the nightly; nothing new, and the Aug-21 hotfix round-up is correctly ABSENT

**No feed change.** Ran as the scheduled local ptr-watch ~3h after the nightly (CI `startedAt`
11:21Z, this run 14:11Z) and re-derived its "nothing new" independently rather than trusting it.

- **Wowhead news RSS**: HTTP 200, 121,628 bytes, 40 items, parsed per `<item>` block. Newest
  item 2026-08-23.
- **The one apparent gap was checked and is not a gap.** "Patch 12.1 Hotfixes for August 21st —
  Raid and Delve Fixes" (news=382566, published 08-22) sits one day past the feed's newest
  hotfix entry (2026-08-20) and looks exactly like a missed round-up. Its body was read in full
  from `content:encoded`: Delves, Dungeons and Raids (Altar of Fangs, Rav'i, Zul'jan), The
  Venomous Abyss, Housing, Items, Prey — and **zero class or spec lines**. A `kind: "hotfix"`
  entry would carry an empty `specsAffected`/`highlights` pair and reach no drawer, so no entry
  is warranted. Recorded here so the next run does not re-open it.
- **"Heroic Ula'tek Nerfs and Raid Bug Fixes" (news=382550, published 08-21) is the AUGUST 20
  set, not a new one** — its in-body date header reads "August 20, 2026". Already logged: the
  stored 08-20 entry cites that exact URL and its 7 `specsAffected` match the article's class
  blocks one-for-one (Havoc, Restoration Druid, Marksmanship, Holy Priest, Elemental,
  Affliction, Warlock/Hellcaller class-wide). **Date-in-title is not date-of-hotfixes — read the
  body header**, or a re-log of an existing set looks like a discovery.
- **Class-tuning sweep over every article on/after 08-21**: the only value-bearing class line in
  the window is "Druid of the Claw: Ravage damage increased by 20% **in PvP combat**", from the
  already-logged 08-22 tuning post — and PvP is deliberately out of scope for this PvE tracker.
- **Dev-notes thread 2317811**: re-polled, `last_posted_at` still 2026-07-31T23:42Z, unchanged.
  The closed cycle's expected silence, not a lost thread (the rediscovery gotcha stays suspended).
- **12.2 PTR: still no announcement.** Scanned all 40 RSS bodies for `12.2` / "next major patch" /
  "PTR is now available" / "PTR Development Notes" — zero hits.
- Nothing written: no feed entry, no `tierSet` touch, no snapshot, no manifest edit.


## 2026-08-23 (nightly) — three channels swept, nothing new to log, still no 12.2 PTR

**No new feed entry. The newest entry stays 2026-08-22 (the "Class Tuning Incoming – August
25" post), and the canonical forum post behind it is still v1 — unedited since creation, so
the logged distillation is current.**

- **Wowhead news RSS**: 40 items, parsed per `<item>` block (never by tag adjacency), bodies
  free in `content:encoded`. Newest item Sat 22 Aug 2026 22:34:02.
- **News INDEX** (`data.news.newsData`, anchored on the id attribute and brace-balanced via
  `raw_decode`): 20 posts on page 1, newest **382572** (2026/08/22 10:34 PM). It did NOT lead
  the RSS tonight — both top out on the same article — but it was polled anyway, because the
  index leading by minutes is exactly the 08-04 case.
- **Blue tracker** (`data.blueTracker.default`): 50 entries, 44 unique topics after deduping
  by topic id. Newest Blizzard class-tuning topic is still Kaivax's "Class Tuning Incoming –
  August 25" (us 2339812) / "– 26 August" (eu 626484), both 2026-08-21 20:3x, already logged.
- **Dev-notes thread 2317811**: re-polled, `highest_post_number` 19, `last_posted_at`
  2026-07-31T23:42:09Z. The closed cycle's expected silence, not a lost thread — the
  rediscovery gotcha stays SUSPENDED until Blizzard announces a 12.2 PTR.
- **Nothing about a 12.2 PTR** in any of the three channels — no realm, no thread, no
  announcement article.
- **Swept and correctly NOT logged**, each checked rather than assumed:
  · `382569` "Venomous Abyss Race to World First Day 4 Recap: Mythic Begins, Ula'tek Killed,
    **and Class Tuning**" — the title is the trap; the body (1,128 chars, read whole) is a
    Dratnos/Tettles recap-video announcement about splits and gearing and carries **not one
    per-spec value**. No feed entry.
  · `382571` Mythic Nymrissa Wavecaller nerf and Limestone's "Nymrissa Wavecaller Tuning
    Changes" blue post — encounter tuning, not class.
  · `382572` Evoker disconnect / Disintegrate bugs — a bug acknowledgement with no tuning.
  · The running hotfix post 2336376 ("World of Warcraft: Midnight Hotfixes - August 21") —
    post #1 is at v15 with `updated_at` 2026-08-22T01:46:38Z, i.e. it has not been touched
    since the 08-22 run verified its August 21 section carries no Classes block at all.
  · "Item Adjustment Incoming - August 25" (2338382) and "Altar of Fangs Adjustments"
    (2339724) — item and dungeon tuning, out of the class lane.
- ⚠️ **HANDOFF: the 08-22 tier-set corrections have NOT reached the gearing subproject.**
  `check-refresh --age` reds on **`gearing-tierset-sync`** — gearing/data/specs.json still
  carries the PRE-08-22 4-piece text for **Restoration Druid** and **Retribution Paladin**,
  the two `spec.tierSet` entries the August-25 tuning entry corrected. Diffed against
  data/specs.json to confirm: exactly 2 mismatches, both `set4`, both trailing-clause. NOT
  fixed by this run on purpose — the fix is `node gearing/src/sync-tracker-fields.mjs`
  followed by `npm run gearing:build`, and the nightly publish job stages only `data/`,
  `dist/` and the skill logs, so a gearing edit made here would never be committed. Local-run
  duty, like every other gearing harvest.
- **Tier-set upkeep**: no set bonus was touched by anything tonight, so no `spec.tierSet`
  needed advancing (the two advanced on 08-22 — Restoration Druid 4pc and Retribution Paladin
  4pc — are current).
- **PTR zone sweeps (54 / 52 / 56 / 57) remain dormant** and were not attempted; their
  contract rows were removed at the flip, so they are correctly absent from the manifest
  rather than recorded unreachable.


## 2026-08-22 (nightly) — the August 25 tuning pass logged: 14 specs, 2 set bonuses

**Between-cycles posture unchanged: no 12.2 PTR announcement anywhere, the dev-notes thread is
still quiet, and the four PTR zone sweeps stay dormant.** One new feed entry, from the LIVE lane.

- **Live lanes swept in full.** Wowhead news RSS (40 items, parsed per `<item>` block; bodies come
  free in `<content:encoded>`), the news INDEX payload `data.news.newsData` (which leads the RSS —
  newest id 382566, and it agreed with RSS tonight), and the blue-tracker payload
  `data.blueTracker.default` (66 KB page, 50 entries deduped by topic). Nothing about a 12.2 PTR
  realm, a 12.2 thread, or a next-patch announcement in any of the three.
- **NEW ENTRY — 2026-08-22, kind `build`: "Class Tuning Incoming – August 25"** (Kaivax, us topic
  **2339812**, post 1, created 2026-08-22T01:37:59Z). Verified against the canonical forum JSON, not
  taken off the Wowhead mirror (news=382565), and read with its heading nesting INTACT. This is the
  first of the three weekly Season-2 passes Blizzard scheduled in "Season 2 Class Tuning Plans"
  (topic 2335871, 2026-08-12 — Aug 25 / Sep 1 / Sep 22). Standalone topic, so post number 1 of its
  own topic, exactly like the 08-15 entry. Entry date is the post's own UTC date, the same
  convention the 08-15 entry used.
  - **14 specs in `specsAffected`, 15 highlights** (one consolidated line per spec plus one
    class-wide line). classifyHighlight checked rather than assumed: **13 lines classify buff**,
    Restoration Druid classifies **null** because its consolidated line genuinely mixes buffs with
    two nerfs (Nature's Bounty 10% was 20%, Everbloom 5 targets was 6) — Blizzard's own note
    describes it as trading raid healing for dungeon healing — and the Warlock class-wide line is
    excluded from scoring by construction while still reaching all three Warlock drawers.
  - **The one attribution question settled by nesting**: "Imp, Voidwalker, Sayaad, and Felhunter
    damage increased by 350%" sits directly under the bare Warlock heading, one level SHALLOWER
    than the Affliction/Demonology/Destruction blocks → logged `Warlock (class-wide)`, not against
    a spec.
  - **TWO SET BONUSES TOUCHED, both `spec.tierSet` entries advanced** to asOf 2026-08-22 with the
    forum post as `source`: Restoration Druid's 4-piece (a clean value swap into the stored
    wording — Genesis duration now +8s, was +4s) and Retribution Paladin's 4-piece Divine Arbiter
    (a dated parenthetical, since the notes give damage multipliers rather than replacement bonus
    text: main target +150%, secondary +75%). The tier-set upkeep gate passes.
  - **The PLAYER VERSUS PLAYER section is large this week and is deliberately not distilled.**
    Devourer and Havoc defensive nerfs, Feral, Augmentation, Marksmanship, Survival, Fire Mage,
    Windwalker, three Paladin specs, all three Priest specs, all three Rogue specs, Elemental and
    Restoration Shaman, all three Warlock specs and Arms Warrior appear there and NOWHERE in the
    PvE section — which is why they are absent from `specsAffected`. Note the direction this cuts:
    logging them would have let PvP nerfs vote in the PvE outlook tally for Devourer, Havoc and
    Holy Priest. Lines that merely CARRY a PvP exclusion ("Does not apply to PvP combat") are
    ordinary PvE lines and were kept.
- **Swept and correctly NOT logged**: "Patch 12.1 Hotfixes for August 21st" (news=382566; verified
  against Kaivax's running hotfix post, topic 2336376, whose post 1 was edited 2026-08-22T01:46Z —
  its August 21 section has **no Classes block at all**, only Delves, Dungeons and Raids, Housing,
  Items and Prey); "Altar of Fangs Nerfed" and "Heroic Vashnik Stealthily Nerfed" (encounter
  tuning); "Evokers Are Having Disconnect and Disintegrate Bugs" (a bug report, no tuning value);
  and the 08-12 "Season 2 Class Tuning Plans" roadmap, which carries dates but not a single
  per-spec value, so it gets no entry of its own and is instead cited inside the new entry's label.
- **Dev-notes thread 2317811 re-polled**: highest post still **19** (Linxy, 2026-07-31) — unchanged,
  the closed cycle's expected silence, and not a lost thread.
- **Writeup coverage recomputed, not remembered**: exactly one spec has no writeup (Demonology
  Warlock, whose null is deliberate — the source reported no changes). `expertRead` returns null for
  all 40 in both brackets because `PHASES.ptr` is null between cycles; that is the dormant lane, not
  data loss, and the pin test self-disarms accordingly.
- **FOR THE OWNER — the gearing page now carries stale tier-set text for those two specs.**
  `check-refresh --age` reports `gearing-tierset-sync: 2 spec(s) carry tier-set text the tracker has
  since corrected`, which is that check doing exactly its job (the 2026-08-08 Preservation Evoker
  failure). The remedy is `node gearing/src/sync-tracker-fields.mjs` followed by `npm run
  gearing:build`, and it is deliberately NOT run here: the nightly publish job stages only `data/`,
  `dist/` and the skill logs, so a gearing/ edit could not be committed and would only leave the
  tree inconsistent. It is a local-run action.
- Zone sweeps 54 / 52 / 56 / 57: **dormant, not attempted, and no manifest rows written** — their
  contract rows were removed at the flip. Stored zone-52/54/56 rows stay as the closed cycle's final
  receipts.


## 2026-08-21 (nightly CI, second run of the day — the 11:00Z run also landed)

**No new build, hotfix or patch-notes entry. `data/ptr-builds.json` unchanged.** Between-cycles
posture held: the PTR zone sweeps (54 / 52 / 56 / 57) were skipped as dormant and no manifest row
was written for them, per the SKILL's between-cycles block.

Three live channels swept, all healthy:

1. **Wowhead news RSS** (`/news/rss/all`, parsed per `<item>` block, never by tag adjacency):
   HTTP 200, 112,515 B, 40 items, newest news=382560 at 2026-08-21 13:00 CDT. Nothing in the
   window is class tuning. The only hotfix-shaped article is news=382550 (Aug 20), already logged.
   Swept and correctly not logged: 382552 "Heroic Vashnik Stealthily Nerfed", 382549 "Nightmare
   Prey Affix Nerfed", 382554 (achievement), 382506 "Viserio Cooldowns Updated for Midnight
   Season 2" (an addon, not the game), 382558/382559/382557/382545/382538 (RWF and boss coverage).
2. **News INDEX** (`data.news.newsData`, anchored on the id attribute and brace-balanced —
   the index leads RSS within a run): totalPages 1540, 20 posts on page 1, top id 382560,
   identical to the RSS head. No post the RSS missed.
3. **Blue tracker** (`data.blueTracker.default`): 50 entries, 44 unique topics. Newest
   class-relevant entry is Kaivax's running hotfix topic (us 2336376), whose title still reads
   "…Hotfixes - August 20". Read the canonical forum JSON directly rather than the mirror:
   post 1's `updated_at` is 2026-08-21T02:27:47Z and its `<strong>` date sections top out at
   **August 20, 2026** — i.e. exactly the state the 11:00Z run already logged. Post 42 (Linxy,
   2026-08-21T00:52Z) is the Aug 20 section as a reply, and post 40 (Kaivax, 2026-08-20T03:14Z)
   is Aug 19; both are already in the feed. **No August 21 section exists yet.**

Dev-notes thread `2317811.json`: `posts_count` 17, `last_posted_at` 2026-07-31T23:42Z, newest
post #19. Quiet since the cycle closed — expected, not a lost thread.

**Two blue posts examined and deliberately NOT logged, recorded here so the next run does not
re-litigate them:**

- **"Season 2 Class Tuning Plans"** (Kaivax, us 2335871, 2026-08-12T23:32Z). Class-relevant and
  absent from the feed, so it was read in full. It is a **roadmap**: no spec is named, no value
  changes, nothing `specBuildChanges` could surface. Its content is the tuning CALENDAR —
  Aug 18 (season start), **Aug 25 (first week of S2 tuning)**, Sep 1 (second week), Sep 22
  (fifth week), with roughly four more passes between Sep 22 and S3, and a stated intent to keep
  early progression tuning conservative until Mythic Ula'tek dies. `kind` has no value that fits
  (it is not a build, not a hotfix, not patch notes), and forcing it to `build` with
  `specsAffected: []` would put a schedule announcement in a change feed nine days behind two
  entries that already shipped. **The actionable part is the Aug 25 date: expect a real tuning
  pass in the next run window after weekly maintenance.**
- **"Item Adjustment Incoming - August 25"** (Kaivax, us 2338382, 2026-08-18T20:54Z). One item —
  Aqirbane Reliquary now grants a smaller quantity of all secondaries (was a large quantity of
  Crit only), second on-equip randomised. Items are out of the per-spec feed scope by the
  standing precedent.

Spec writeups: recomputed rather than remembered — **one spec has no `ptr` writeup, Demonology
Warlock**, whose null is the deliberate "the source reported no changes" case. No writeup gap to
work, so lanes (a)–(e) were not opened. `expertRead` returns null for all 40 specs in both
brackets because `PHASES.ptr` is null between cycles; that is the documented dormant state, not
coverage loss. No set bonus was touched anywhere tonight, so no `spec.tierSet` moved and the
tier-set upkeep gate has nothing to pair.

`npm run test:quiet` 373 tests / 341 pass / 0 fail / 32 skipped (Playwright absent, CI runs the
UI invariants in their own job); build 1705.0 KB.


## 2026-08-21 (local run, scheduled task)

**Nothing new to log — verified, not assumed. No 12.2 PTR announcement. PTR zone lanes remain
dormant.** A short confirmatory sweep after the nightly (91205d7), whose own sweep closed at
2026-08-20 22:51 CDT; this run checks only the window since.

- **Wowhead news RSS** re-fetched, HTTP 200, 40 items parsed per `<item>` block. Exactly ONE
  item is newer than the nightly's newest: `news=382506` "Viserio Cooldowns Updated for Midnight
  Season 2" (2026-08-21 09:14 CDT). Read rather than judged on its title — **Viserio Cooldowns is
  a third-party raid-cooldown planning addon** that has been updated for S2 with a raid planning
  hub. No class line, no tuning. Correctly NOT logged.
- **Canonical hotfix topic 2336376 fetched directly** (not the Wowhead mirror). Title still reads
  "World of Warcraft: Midnight Hotfixes - August 20"; **post 1's `updated_at` is
  2026-08-21T02:27:47Z — byte-identical to the timestamp the nightly recorded**, and its newest
  date heading is still "August 20, 2026". So the nightly's `kind: "hotfix"` entry for 08-20 is
  current and complete, and there is no August 21 section to append. The topic's
  `last_posted_at` of 2026-08-21T13:36Z is community replies, not Kaivax — checking post 1's
  edit time rather than the topic's last post is what distinguishes the two.
- **12.2 PTR announcement: absent from two independent channels.** The 12.1 dev-notes thread
  (2317811) is still 17 posts with `last_posted_at` 2026-07-31T23:42Z — the closed cycle's
  expected quiet, not a lost thread — and no RSS item mentions 12.2 or a new PTR. When the 12.2
  thread does appear it must be re-discovered via RSS; a new cycle means a NEW thread.
- **PTR zone sweeps (54 / 52 / 56 / 57) skipped by design**, per the between-cycles posture.
  Their contract rows were removed at the flip, so they need no manifest excuse. Stored zone rows
  are the closed cycle's final receipts and were not touched.
- The live S2 WCL zones (53 raid / 55 M+) still have no fetch path; the `wcl-live-*` heartbeat red
  is owner-accepted (2026-08-18) and was deliberately left alone.


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

