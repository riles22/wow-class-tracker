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
