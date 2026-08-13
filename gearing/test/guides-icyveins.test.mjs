/* Icy Veins guide harvester (Phase B, docs/gearing-s2-scope.md G4/G9/G10/G12).

   Everything here runs against RECORDED FIXTURES in test/fixtures/icyveins-*.html — byte-exact
   subsets of the live pages, fetched 2026-08-13, each carrying its source URL in a header
   comment. Nothing in this file touches the network, and no harvested data file is committed:
   Phase B ships machinery, and the harvest itself is a local-run duty after the 08-18 flip.

   The fixtures were verified at recording time by parsing the FULL page response and the
   trimmed fixture and comparing the results; if you re-record one, do that again. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { consensusForItem, rosterFrom, SLOTS } from "../src/lib-guides.mjs";
import { SEASON } from "../src/season.mjs";
import { acceptsNamespace, articleMeta, bisUrl, changelogTop, dropStalePicks, EXPECTED_PATCH,
  itemLinkFields, parseBisPage, parseStatPriorityPage, parseTrinketTiers, SOURCE,
  statPriorityUrl } from "../src/harvest-guide-icyveins.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));
const fixture = (name) => readFile(fromRoot(`test/fixtures/icyveins-${name}.html`), "utf8");

const roster = rosterFrom(await json("data/raid-items.json"), await json("data/dungeon-items.json"));
const bis = async (name, specName) => parseBisPage(await fixture(name), { where: specName, roster });
const stats = async (name, specName) => parseStatPriorityPage(await fixture(name), { specName, where: specName });

const BIS_PAGES = [
  ["retribution-paladin-gear-best-in-slot", "Retribution Paladin"],   // melee DPS
  ["fire-mage-gear-best-in-slot", "Fire Mage"],                       // caster
  ["holy-paladin-gear-best-in-slot", "Holy Paladin"],                 // healer
];

/* ---------------------------------------------------------------- provenance */

test("every fixture records the URL and date it was captured", async () => {
  const names = ["retribution-paladin-gear-best-in-slot", "fire-mage-gear-best-in-slot",
    "holy-paladin-gear-best-in-slot", "protection-paladin-trinkets", "retribution-paladin-stat-priority",
    "fire-mage-stat-priority", "holy-paladin-stat-priority", "outlaw-rogue-stat-priority",
    "discipline-priest-stat-priority", "blood-death-knight-stat-priority",
    "protection-paladin-stat-priority"];
  for (const name of names) {
    const html = await fixture(name);
    assert.match(html, /FIXTURE — recorded from https:\/\/www\.icy-veins\.com\/wow\/[a-z0-9-]+/,
      `${name} must name the page it came from`);
    assert.match(html, /fetched \d{4}-\d{2}-\d{2}/, `${name} must carry its capture date`);
  }
});

test("the URLs are formulaic and match the pages the fixtures were recorded from", () => {
  assert.equal(bisUrl({ class: "Paladin", spec: "Retribution", role: "DPS" }),
    "https://www.icy-veins.com/wow/retribution-paladin-pve-dps-gear-best-in-slot");
  assert.equal(statPriorityUrl({ class: "Paladin", spec: "Holy", role: "Healer" }),
    "https://www.icy-veins.com/wow/holy-paladin-pve-healing-stat-priority");
  assert.equal(statPriorityUrl({ class: "Death Knight", spec: "Blood", role: "Tank" }),
    "https://www.icy-veins.com/wow/blood-death-knight-pve-tank-stat-priority");
  assert.equal(bisUrl({ class: "Demon Hunter", spec: "Beast Mastery", role: "DPS" }),
    "https://www.icy-veins.com/wow/beast-mastery-demon-hunter-pve-dps-gear-best-in-slot");
});

/* ---------------------------------------------------------------- the three lists */

test("each BiS page yields exactly the three published lists, correctly bracketed", async () => {
  for (const [name, specName] of BIS_PAGES) {
    const page = await bis(name, specName);
    assert.deepEqual(page.lists.map((list) => list.id),
      ["overall-best-in-slot", "best-mythic-gear", "best-raid-gear"], specName);
    assert.deepEqual(page.lists.map((list) => list.bracket), ["overall", "mplus", "raid"], specName);
    assert.deepEqual(page.lists.map((list) => list.tab), ["Overall", "Mythic+", "Raid"], specName);
    // 18 slots minus the two permanently blank ones (Shirt / Tabard), minus empty placeholders.
    for (const list of page.lists) assert.ok(list.picks >= 15 && list.picks <= 16, `${specName} ${list.id}: ${list.picks} picks`);
  }
});

test("the drop sources corroborate the list labels — this is the off-by-one check", async () => {
  for (const [name, specName] of BIS_PAGES) {
    const page = await bis(name, specName);
    const raid = page.lists.find((list) => list.bracket === "raid").evidence;
    const mplus = page.lists.find((list) => list.bracket === "mplus").evidence;
    assert.ok(raid.raid > raid.mplus, `${specName}: the raid list must drop mostly from the raid`);
    assert.ok(mplus.mplus > mplus.raid, `${specName}: the M+ list must drop mostly from dungeons`);
  }
});

test("mislabelled lists are refused, not published — heading vs tab", async () => {
  // Swap the two headings wholesale so id and heading text still agree with each other.
  // Only the tab strip now disagrees, and that alone must stop the page.
  const html = (await fixture("retribution-paladin-gear-best-in-slot"))
    .replace('<h3 id="best-mythic-gear">Best Mythic+ Gear</h3>', "@@RAID@@")
    .replace('<h3 id="best-raid-gear">Best Raid Gear</h3>', '<h3 id="best-mythic-gear">Best Mythic+ Gear</h3>')
    .replace("@@RAID@@", '<h3 id="best-raid-gear">Best Raid Gear</h3>');
  assert.throws(() => parseBisPage(html, { where: "swapped", roster }),
    /tab .* and heading .* disagree/);
});

test("mislabelled lists are refused, not published — the picks themselves disagree", async () => {
  // Now swap the tab labels too, so every label agrees and only the harvested drop sources
  // can tell that raid and M+ have been exchanged. Getting this wrong silently swaps the
  // picks that G10 then votes with, so the parser must refuse the page.
  const html = (await fixture("retribution-paladin-gear-best-in-slot"))
    .replace('<h3 id="best-mythic-gear">Best Mythic+ Gear</h3>', "@@H@@")
    .replace('<h3 id="best-raid-gear">Best Raid Gear</h3>', '<h3 id="best-mythic-gear">Best Mythic+ Gear</h3>')
    .replace("@@H@@", '<h3 id="best-raid-gear">Best Raid Gear</h3>')
    .replace('<span id="bis_0_1_button">Mythic+</span>', '<span id="bis_0_1_button">@@T@@</span>')
    .replace('<span id="bis_0_2_button">Raid</span>', '<span id="bis_0_2_button">Mythic+</span>')
    .replace("@@T@@", "Raid");
  assert.throws(() => parseBisPage(html, { where: "swapped", roster }),
    /off by one, do not publish this/);
});

test("an unrecognised list heading is a page redesign, not a row to skip", async () => {
  const html = (await fixture("fire-mage-gear-best-in-slot"))
    .replace('id="best-raid-gear"', 'id="best-heroic-gear"');
  assert.throws(() => parseBisPage(html, { where: "redesign", roster }),
    /carries 0 known list headings/);
});

/* ---------------------------------------------------------------- the picks */

test("both grids are read — the weapons grid is a second grid per list", async () => {
  const page = await bis("holy-paladin-gear-best-in-slot", "Holy Paladin");
  const weapons = page.picks.filter((pick) => pick.slot === "Main Hand" || pick.slot === "Off Hand");
  assert.equal(weapons.length, 6, "one main hand and one off hand in each of the three lists");
  assert.ok(weapons.every((pick) => pick.itemId));
});

test("gems and enchants inside a cell are not harvested as gear", async () => {
  // The Retribution helm cell carries the pick, then a gem (240892) and an enchant (244007),
  // each with its own data-wowhead item link. Only the link before the slot label is the pick.
  const page = await bis("retribution-paladin-gear-best-in-slot", "Retribution Paladin");
  const ids = new Set(page.picks.map((pick) => pick.itemId));
  assert.ok(ids.has("271465"), "the helm pick itself");
  assert.equal(ids.has("240892"), false, "a socketed gem is not a gear pick");
  assert.equal(ids.has("244007"), false, "an enchant is not a gear pick");
});

test("empty cells and the blank Shirt / Tabard slots produce no picks and no error", async () => {
  const page = await bis("retribution-paladin-gear-best-in-slot", "Retribution Paladin");
  // A two-hander leaves the off hand as a `bis_item--empty` placeholder in each of the three lists.
  assert.equal(page.diagnostics.emptyCells, 3);
  assert.equal(page.picks.some((pick) => /shirt|tabard/i.test(pick.slot)), false);
  for (const pick of page.picks) assert.ok(SLOTS.includes(pick.slot), `${pick.slot} is not a canonical slot`);
});

test("both item ids survive: the catalysed appearance and its pre-catalyst base", async () => {
  const page = await bis("holy-paladin-gear-best-in-slot", "Holy Paladin");
  const helm = page.picks.find((pick) => pick.bracket === "overall" && pick.slot === "Head");
  assert.equal(helm.itemId, "271465");
  assert.equal(helm.originalItemId, "239050", "Phase C joins sources on the base item");
  assert.equal(helm.ptrDomain, true, "roughly half of Season-2 links still sit on the ptr domain");
  assert.equal(helm.quality, 4);
  assert.equal(helm.name, "Warhelm of the Consecrated Flame");
});

test("every pick's drop text joins to our own harvested roster", async () => {
  for (const [name, specName] of BIS_PAGES) {
    const page = await bis(name, specName);
    for (const pick of page.picks) {
      assert.ok(pick.drop, `${specName} ${pick.slot}: "${pick.dropRaw}" did not resolve`);
      assert.ok(["raid", "mplus", "crafted", "catalyst"].includes(pick.drop.kind));
    }
    assert.equal(page.diagnostics.picksWithoutDrop, 0, specName);
  }
});

test("the Catalyst idiom is typed rather than forced onto a boss", async () => {
  const page = await bis("holy-paladin-gear-best-in-slot", "Holy Paladin");
  const catalysed = page.picks.find((pick) => pick.dropRaw === "Catalyst + King's Rest");
  assert.equal(catalysed.drop.kind, "catalyst");
  assert.equal(catalysed.drop.base, "Kings' Rest", "the base still joins across the apostrophe forms");
});

/* ---------------------------------------------------------------- alternatives (G9) */

test("alternatives are harvested from all three of Icy Veins' bullet shapes", async () => {
  // The bullets are hand-written per guide and every author writes them differently:
  //   Retribution  <strong>Helm</strong> - <item> from Nek'zali
  //   Holy         <strong>Helm:</strong> <item> from Nek'zali the Soulcoiler
  //   Fire Mage    Head &mdash; <item>          (no <strong> at all, no drop text)
  for (const [name, specName] of BIS_PAGES) {
    const page = await bis(name, specName);
    assert.ok(page.alternatives.length >= 14, `${specName}: ${page.alternatives.length} alternatives`);
    assert.equal(page.diagnostics.panelsWithoutAlternativeFaq, 0, specName);
    for (const alternative of page.alternatives) {
      assert.equal(alternative.endorsement, "alternative");
      assert.ok(["Head", "Shoulder", "Chest", "Hands", "Legs"].includes(alternative.slot),
        `${specName}: ${alternative.slot} is not a catalysable slot`);
      assert.ok(alternative.itemId);
    }
  }
});

test("a bullet that names no item records nothing rather than inventing a pick", async () => {
  // Retribution's raid bullets read "Shoulders - Tier Token from Lost Explorers" — a slot
  // with no item link. Icy Veins also writes "No good choices. Do not Catalyze." on some
  // specs; both must leave the count alone instead of producing an endorsement.
  const page = await bis("retribution-paladin-gear-best-in-slot", "Retribution Paladin");
  assert.equal(page.diagnostics.alternativeBulletsWithoutItem, 1);
  const raidAlternatives = page.alternatives.filter((alternative) => alternative.bracket === "raid");
  assert.equal(raidAlternatives.some((alternative) => alternative.slot === "Shoulder"), false);
});

test("the decoy bullet list in the same panel is never harvested", async () => {
  /* Every panel carries a SECOND FAQ ("Which Dungeons Should I Farm?" / "Which Raid-Items Do
     I Want Most?") whose bullets also begin `<strong>Weapon</strong>:` / `<strong>Trinkets</strong>:`
     and also link items. Reading "every <li> that starts with a slot word" would invent
     alternative votes out of prose — Weapon would throw, Trinkets would vote. */
  for (const [name, specName] of BIS_PAGES) {
    const page = await bis(name, specName);
    const slots = new Set(page.alternatives.map((alternative) => alternative.slot));
    assert.equal(slots.has("Trinket"), false, `${specName}: the dungeon FAQ leaked in`);
    assert.equal(slots.has("Main Hand"), false, `${specName}: the dungeon FAQ leaked in`);
    // At most five catalysable slots per list, three lists.
    assert.ok(page.alternatives.length <= 15, `${specName}: ${page.alternatives.length} alternatives is more than the FAQ publishes`);
  }
});

/* ---------------------------------------------------------------- trinket letter tiers (G8) */

test("trinket letters are read from the page, including tiers outside S-D", async () => {
  const holy = await bis("holy-paladin-gear-best-in-slot", "Holy Paladin");
  const tiers = [...new Set(holy.trinketTiers.map((row) => row.tier))];
  assert.deepEqual(tiers, ["S", "A", "B", "C", "D", "F-"], "Holy Paladin publishes an F- tier");
  assert.equal(holy.trinketTiers.filter((row) => row.tier === "S").length, 1);
  assert.equal(holy.trinketTiers[0].itemId, "270162");
  // Display order inside the card is a presentation convention (G8), so the source order is kept.
  for (const [index, row] of holy.trinketTiers.entries()) assert.equal(row.order, index);
});

test("an expandable trinket note does not add a second ranked row", async () => {
  // Retribution's S-tier entry expands into a note naming Maze-roa (268213). The ranked
  // trinket is the first link in the bullet; the note is commentary.
  const page = await bis("retribution-paladin-gear-best-in-slot", "Retribution Paladin");
  const sTier = page.trinketTiers.filter((row) => row.tier === "S");
  assert.deepEqual(sTier.map((row) => row.itemId), ["270173"]);
});

test("a published grouping row is recorded as a group, never given a letter", async () => {
  /* Protection Paladin's ranking table ends with a "Defensive Trinkets" row sitting
     alongside S/A/B. It is a grouping, not a rank within the letters. Giving it a letter
     would invent a rank; dropping it would lose three published trinkets. */
  const rows = parseTrinketTiers(await fixture("protection-paladin-trinkets"), { where: "Protection Paladin" });
  const grouped = rows.filter((row) => row.group);
  assert.equal(grouped.length, 3);
  for (const row of grouped) {
    assert.equal(row.tier, null, "a grouping row must not be given a letter");
    assert.equal(row.group, "Defensive Trinkets");
    assert.ok(row.itemId);
  }
  assert.deepEqual([...new Set(rows.filter((row) => row.tier).map((row) => row.tier))], ["S", "A", "B"]);
});

test("an unlabelled ranking row stops the parse", async () => {
  const html = (await fixture("fire-mage-gear-best-in-slot")).replace("<strong>S Tier</strong>", "<strong></strong>");
  assert.throws(() => parseTrinketTiers(html, { where: "renamed" }), /has no label/);
});

/* ---------------------------------------------------------------- self-dating */

test("the page dates itself from the Article graph, never from datePublished", async () => {
  const html = await fixture("retribution-paladin-gear-best-in-slot");
  const meta = articleMeta(html);
  assert.equal(meta.dateModified, "2026-08-11");
  assert.equal(meta.author, "Bolas");
  // datePublished on this page is 2012 — the article's creation year, useless as freshness.
  assert.match(html, /"datePublished":"2012-/);

  const changelog = changelogTop(html);
  assert.equal(changelog.date, "2026-08-11");
  assert.equal(changelog.text, "Updated for Patch 12.1.");
});

test("every fixture self-identifies as the patch the harvester gates on", async () => {
  assert.equal(EXPECTED_PATCH, "12.1");
  for (const [name, specName] of BIS_PAGES) {
    const page = await bis(name, specName);
    assert.equal(page.patch, EXPECTED_PATCH, specName);
    assert.ok(page.published, `${specName} must carry a self-reported date`);
  }
});

/* ---------------------------------------------------------------- stat priorities (G12) */

test("a spec that publishes one unscoped priority gets one unscoped build", async () => {
  const page = await stats("fire-mage-stat-priority", "Fire Mage");
  assert.equal(page.builds.length, 1);
  const [build] = page.builds;
  assert.equal(build.label, null, "the page's own '<Spec> Stat Priority' heading is not a scope");
  assert.equal(build.heroTalent, null);
  assert.equal(build.bracket, null);
  assert.equal(build.fightProfile, null);
  assert.deepEqual(build.stats.map((stat) => stat.key),
    ["intellect", "haste", "mastery", "versatility", "crit"]);
});

test("scoping is read from what the heading states and is never inferred", async () => {
  // Holy Paladin publishes three widgets: two by hero talent, one by bracket. A hero-talent
  // heading gets no bracket and a bracket heading gets no hero talent — the two axes are not
  // interchangeable, and guessing one from the other would invent a combination nobody published.
  const page = await stats("holy-paladin-stat-priority", "Holy Paladin");
  assert.equal(page.builds.length, 3);
  assert.deepEqual(page.builds.map((build) => [build.label, build.heroTalent, build.bracket]), [
    ["Herald of the Sun", "Herald of the Sun", null],
    ["Lightsmith", "Lightsmith", null],
    ["Mythic+", null, "mplus"],
  ]);
  // G12's implementation note: the id is synthetic (source + variant), never the bare name.
  for (const build of page.builds) assert.match(build.id, new RegExp(`^${SOURCE}:`));
  assert.equal(new Set(page.builds.map((build) => build.id)).size, 3);
});

test("two priorities under one heading are both kept, with no scope invented for either", async () => {
  /* Protection Paladin and Brewmaster Monk publish two widgets under a single heading and
     distinguish them only in prose ("…gearing defensively…" against "Offensively, …").
     Dropping the second would lose a published variant, which G12 forbids; reading
     "defensive" out of the sentence would invent a fourth scoping axis Icy Veins never
     published. So both survive, positionally distinguished, with the prose recorded verbatim. */
  const page = await stats("protection-paladin-stat-priority", "Protection Paladin");
  assert.equal(page.builds.length, 2);
  assert.equal(page.unlabelledBuilds, 2);
  assert.deepEqual(page.builds.map((build) => build.id), ["icyveins:general", "icyveins:general-2"]);
  for (const build of page.builds) {
    assert.equal(build.scopeSource, "position", "the page labelled neither of these");
    assert.equal(build.label, null);
    assert.equal(build.heroTalent, null);
    assert.equal(build.bracket, null);
    assert.ok(build.note, "the distinguishing prose must be recorded");
  }
  assert.match(page.builds[0].note, /defensively/);
  assert.match(page.builds[1].note, /Offensively/);
  // The two are genuinely different priorities, which is why losing one would matter.
  assert.notDeepEqual(page.builds[0].stats.map((stat) => stat.key), page.builds[1].stats.map((stat) => stat.key));
});

test("a heading-scoped build says so, and is not confused with a positional one", async () => {
  const page = await stats("holy-paladin-stat-priority", "Holy Paladin");
  for (const build of page.builds) assert.equal(build.scopeSource, "heading");
  assert.equal(page.unlabelledBuilds, 0);
});

test("Item Level leads several priorities and is kept, not silently dropped", async () => {
  for (const [name, specName] of [["retribution-paladin-stat-priority", "Retribution Paladin"],
    ["outlaw-rogue-stat-priority", "Outlaw Rogue"], ["holy-paladin-stat-priority", "Holy Paladin"]]) {
    const page = await stats(name, specName);
    assert.equal(page.builds[0].stats[0].key, "ilevel", specName);
    assert.equal(page.builds[0].stats[0].label, "Item Level", specName);
  }
});

test("soft caps published inside a stat label are captured as data", async () => {
  const page = await stats("outlaw-rogue-stat-priority", "Outlaw Rogue");
  const [build] = page.builds;
  const crit = build.stats.find((stat) => stat.key === "crit");
  const haste = build.stats.find((stat) => stat.key === "haste");
  assert.equal(crit.label, "Critical Strike to 40%");
  assert.deepEqual(crit.softCap, { stat: "Critical Strike", value: 40, unit: "%", text: "Critical Strike to 40%" });
  assert.equal(haste.softCap.value, 25);
  assert.deepEqual(page.unparsedCaps, []);
});

test("the rating idiom parses as a RATING, and is never mistaken for a percentage", async () => {
  /* Discipline Priest writes "Haste (until 1800 rating)" — the second of the two idioms Icy
     Veins publishes caps in, and a genuinely different quantity from Outlaw's "to 40%".

     HISTORY: lib-guides' parseSoftCap read only the percentage idiom, so this label came back
     null and was pinned here as a reported miss rather than being parsed source-side — a cap
     idiom means the same thing to all three harvesters, so reading it is the contract's job.
     The contract now reads it, and stamps `unit: "rating"` precisely so the two can never be
     compared: 1800 rating and 40% are not on one axis, and a cap that lost its unit would
     invite exactly that comparison. */
  const page = await stats("discipline-priest-stat-priority", "Discipline Priest");
  const haste = page.builds[0].stats.find((stat) => stat.key === "haste");
  assert.equal(haste.label, "Haste (until 1800 rating)", "the verbatim label is stored either way");
  assert.deepEqual(haste.softCap,
    { stat: "Haste", value: 1800, unit: "rating", text: "Haste (until 1800 rating)" });
  assert.deepEqual(page.unparsedCaps, [], "a cap that parses is not also reported as missed");

  // Both idioms now parse, and the unit is what keeps them apart.
  const outlaw = await stats("outlaw-rogue-stat-priority", "Outlaw Rogue");
  assert.equal(outlaw.builds[0].stats.find((stat) => stat.key === "crit").softCap.unit, "%");
});

test("a soft-cap idiom the shared parser cannot read is reported, never lost", async () => {
  /* The guarantee that must outlive both idioms now parsing: a label that READS capped and
     does not parse is announced in the run summary instead of quietly publishing an uncapped
     priority. TRAP 8 in the harvester is that mechanism, and it is not a stale one — it is the
     only thing standing between a third cap wording and a silently dropped cap.

     Every cap in the recorded fixtures parses today, so `unparsedCaps` is empty everywhere and
     the mechanism has nothing real left to catch. Rather than delete the coverage with the
     defect, the label below is SYNTHETIC — a wording Icy Veins does not currently publish,
     substituted into the real Discipline Priest fixture so the whole parse path still runs
     against a real page. */
  const html = (await fixture("discipline-priest-stat-priority"))
    .replace("Haste (until 1800 rating)", "Haste until the second breakpoint");
  const page = parseStatPriorityPage(html, { specName: "Discipline Priest", where: "synthetic cap idiom" });
  const haste = page.builds[0].stats.find((stat) => stat.key === "haste");
  assert.equal(haste.label, "Haste until the second breakpoint", "the verbatim label is kept");
  assert.equal(haste.softCap, null, "nothing is invented from an idiom we cannot read");
  assert.deepEqual(page.unparsedCaps, ["Haste until the second breakpoint"]);
});

test("the separator between two stats is real information and is preserved", async () => {
  // Retribution publishes Haste = Critical Strike. Flattening that to ">" would invent a
  // preference the guide deliberately did not express.
  const ret = await stats("retribution-paladin-stat-priority", "Retribution Paladin");
  assert.deepEqual(ret.builds[0].stats.map((stat) => stat.relationToNext), [">", ">", "=", ">", null]);

  // Blood Death Knight publishes ">=" — a third relation, and a tank page besides.
  const blood = await stats("blood-death-knight-stat-priority", "Blood Death Knight");
  const relations = new Set(blood.builds.flatMap((build) => build.stats.map((stat) => stat.relationToNext)));
  assert.ok(relations.has(">="), "the greater-equal separator must survive");
  // Blood DK abbreviates Critical Strike to "Crit"; the key comes from the container class.
  assert.ok(blood.builds[0].stats.some((stat) => stat.key === "crit" && stat.label === "Crit"));
});

test("an unknown separator stops the parse rather than being flattened", async () => {
  const html = (await fixture("retribution-paladin-stat-priority")).replace("ri-equal-line", "ri-approximately-line");
  assert.throws(() => parseStatPriorityPage(html, { specName: "Retribution Paladin", where: "new relation" }),
    /unknown separator/);
});

test("an unknown stat key stops the parse rather than dropping the stat", async () => {
  const html = (await fixture("fire-mage-stat-priority")).replace('stat-container versatility', "stat-container corruption");
  assert.throws(() => parseStatPriorityPage(html, { specName: "Fire Mage", where: "new stat" }),
    /unknown stat key/);
});

/* ---------------------------------------------------------------- G24: out-of-season picks

   The measured case, from the full-roster dry run of 2026-08-13: an Icy Veins BiS page still
   names Nexus King Salhadaar — a Season-1 raid boss, independently confirmed by Archon's own
   S1 roster. It is synthesised into a real fixture below (the same technique the soft-cap test
   above uses) so the whole parse path runs against a real page rather than a hand-built one. */

const S1_BOSS = "Nexus King Salhadaar";
const withS1Boss = async (name) => (await fixture(name)).replace(/Ula'tek/g, S1_BOSS);

test("a stale drop label no longer costs the whole spec — it is collected, not thrown", async () => {
  /* Before Phase E the BiS drop resolved HARD, so one Season-1 boss name threw out of
     parseBisPage and the spec's 48 picks, 14 alternatives, trinket letters and lists all
     vanished with it. That is the failure mode the scope settled against in "How a harvest
     fails": throwing surfaces ONE typo per run and loses everything that carried it.
     G24 cannot even function on such a page, because there are no picks left to partition. */
  const page = parseBisPage(await withS1Boss("fire-mage-gear-best-in-slot"),
    { where: "Fire Mage", roster });
  assert.equal(page.picks.length, 48, "every row the page published still parsed");
  assert.equal(page.diagnostics.picksWithUnresolvedDrop, 4);
  assert.deepEqual([...new Set(page.unresolvedDrops.map((miss) => miss.label))], [S1_BOSS],
    "and the run has the whole list to refuse on, in one pass");
  for (const miss of page.unresolvedDrops) assert.ok(miss.itemId && miss.slot);
});

test("G24: a pick naming Season-1 content is dropped from the run and the loss is disclosed", async () => {
  const page = parseBisPage(await withS1Boss("fire-mage-gear-best-in-slot"),
    { where: "Fire Mage", roster });
  const entry = { class: "Mage", spec: "Fire", bis: page };
  const stale = dropStalePicks([entry], roster);

  assert.equal(stale.dropped, 4, "the four Ula'tek rows now name a boss Season 2 does not hold");
  assert.equal(entry.bis.picks.length, 44);
  assert.equal(stale.kept, 44 + entry.bis.alternatives.length);
  assert.equal(entry.bis.picks.some((pick) => pick.dropRaw === S1_BOSS), false);
  // The disclosure the page renders: who lost what, worst first.
  assert.deepEqual(stale.byDropSource, [{ source: S1_BOSS, dropped: 4 }]);
  assert.deepEqual(stale.bySpec, [{ spec: "Fire Mage", dropped: 4 }]);
  assert.deepEqual(stale.byEndorsement, { bis: 4, alternative: 0 });
  assert.equal(stale.source, SOURCE, "the key the page merges the three harvests on");
  // Nothing vanishes without trace: the removed rows are still enumerable on the record.
  assert.equal(entry.bis.staleDrops.dropped, 4);
  assert.deepEqual([...new Set(entry.bis.staleDrops.removed.map((row) => row.label))], [S1_BOSS]);
  // And the per-list counts must describe the arrays beside them, or the file lies about itself.
  for (const list of entry.bis.lists)
    assert.equal(list.picks, entry.bis.picks.filter((pick) => pick.list === list.id).length);
});

test("a pick the parser DID source is never re-tested, and an unlabelled one is never dropped", async () => {
  /* Two refusals, both load-bearing. Re-deriving a sourced pick from its text alone would be a
     second opinion that could disagree with the parser's. And an unlabelled pick is not
     evidence of staleness — the harvester already refuses a run that cannot name its sources,
     so dropping here would punish the same condition twice and lose a vote that the item id
     identifies perfectly well. */
  const html = (await fixture("fire-mage-gear-best-in-slot"))
    .replace(/<span class="bis_item_drop">[\s\S]*?<\/span>/, "");
  const page = parseBisPage(html, { where: "Fire Mage", roster });
  assert.equal(page.diagnostics.picksWithoutDrop, 1, "one cell now states no source at all");
  assert.equal(page.diagnostics.picksWithUnresolvedDrop, 0);

  const before = page.picks.length;
  const entry = { class: "Mage", spec: "Fire", bis: page };
  const stale = dropStalePicks([entry], roster);
  assert.equal(stale.dropped, 0);
  assert.equal(entry.bis.picks.length, before);
});

test("with no roster to judge against, nothing is dropped", async () => {
  // A caller that cannot resolve anything must not conclude that everything is stale.
  const page = parseBisPage(await withS1Boss("fire-mage-gear-best-in-slot"), { where: "Fire Mage" });
  const entry = { class: "Mage", spec: "Fire", bis: page };
  assert.equal(dropStalePicks([entry], []).dropped, 0);
  assert.equal(dropStalePicks([entry], null).dropped, 0);
  assert.equal(entry.bis.picks.length, 48);
});

/* ---------------------------------------------------------------- namespace acceptance */

test("both Wowhead namespaces parse, whatever the season config says", async () => {
  /* Icy Veins spells the namespace as a query parameter (`&domain=ptr`) rather than a path
     segment, but the rule is the shared one: SEASON.wowheadNamespace decides what we EMIT and
     never what we ACCEPT. A link written before the flip keeps saying domain=ptr for as long
     as it takes Icy Veins to rewrite it, and a URL spelling is not a reason to delete a pick. */
  for (const namespace of ["ptr", "ptr-2", "beta", null])
    assert.equal(acceptsNamespace(namespace), true, `domain=${namespace} must still parse`);

  assert.equal(itemLinkFields("item=1")?.domain, null, "no domain= is the live namespace");
  assert.equal(itemLinkFields("item=1")?.ptrDomain, false);
  assert.equal(itemLinkFields("item=1&domain=ptr")?.domain, "ptr");
  assert.equal(itemLinkFields("item=1&domain=ptr")?.ptrDomain, true);

  // Measured on the three recorded BiS fixtures: 0.756 / 0.688 / 0.813 of picks still link the
  // ptr domain, against 0.734 across the whole roster in the 2026-08-13 dry run. The share is a
  // pre-launch READING, not a gate — the picks parse either way.
  const page = await bis("retribution-paladin-gear-best-in-slot", "Retribution Paladin");
  const ptr = page.picks.filter((pick) => pick.ptrDomain).length;
  assert.equal(ptr, 34);
  assert.equal(page.picks.length, 45);
  assert.equal(SEASON.wowheadNamespace, "ptr", "still pre-launch as of this commit");
});

test("the patch gate is the season config, not a second copy of the number", () => {
  // Launch day is a config edit in src/season.mjs; this is one of the fields that used to
  // require finding and editing a harvester by hand.
  assert.equal(EXPECTED_PATCH, SEASON.patch);
  assert.equal(EXPECTED_PATCH, "12.1");
});

/* ---------------------------------------------------------------- feeding the contract */

test("the harvested picks vote through consensusForItem exactly once per source (G10)", async () => {
  /* The whole point of harvesting three lists per source: Icy Veins names the same helm in
     Overall, M+ and Raid, and that must still be ONE Icy Veins vote. This is the shared
     contract's rule, exercised here on real harvested rows rather than hand-written ones. */
  const page = await bis("retribution-paladin-gear-best-in-slot", "Retribution Paladin");
  const picks = [...page.picks, ...page.alternatives].map((pick) => ({
    source: SOURCE, bracket: pick.bracket, slot: pick.slot, itemId: pick.itemId, endorsement: pick.endorsement,
  }));

  const helmInEveryList = page.picks.filter((pick) => pick.itemId === "271465");
  assert.equal(helmInEveryList.length, 3, "the helm is named by all three lists");
  const consensus = consensusForItem(picks, { id: "271465", kind: "raid" });
  assert.equal(consensus.picks, 1);
  assert.deepEqual(consensus.picksBy, [SOURCE]);

  // A base item that only ever appears as a catalyst alternative is an alternative, not a pick.
  const base = consensusForItem(picks, { id: "268229", kind: "raid" });
  assert.equal(base.picks, 0);
  assert.equal(base.alternatives, 1);
  assert.deepEqual(base.alternativesBy, [SOURCE]);
});
