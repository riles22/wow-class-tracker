/* Encounter attribution for raid and dungeon loot — the `droppedBy` field Phase D prints
   (docs/gearing-s2-scope.md, G20/G21).

   Run against RECORDED page fixtures and the COMMITTED item data, so the numbers below are
   real coverage rather than a shape: 65 of 104 raid items and 179 of 204 dungeon items
   carried a source on 2026-08-13, and the assertions here pin exactly which rows the guide
   tables close and which ones they must not touch.

   Phase D ships MACHINERY, not a harvest — every source is mid-season-transition until
   2026-08-18 — so nothing here writes data/*.json. Each fixture's header names its URL, its
   fetch date and what was trimmed.

   Where a number looks arbitrary (17 rows in one panel, 8 Kings' Rest conflicts) it is what
   Wowhead published on 2026-08-13. A change to it means either Wowhead re-attributed a drop
   or the parser broke, and telling those apart is the point of a fixture. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { guideMarkupFrom, markupBlocks, markupHeadings } from "../src/lib-wowhead.mjs";
import { attributeRaidItems, attributionCounts as raidCounts, attributionFrom, BOSSES,
  NON_ENCOUNTER_TABS, parseRewardPanels, REWARDS_GUIDE } from "../src/harvest-raid.mjs";
import { assertAliasGroups, attributeDungeonItems, attributionCounts as dungeonCounts,
  dungeonDropRowsFrom, encounterKeyFor, POOL } from "../src/harvest-dungeons.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFile(fromRoot(path), "utf8");
const json = async (path) => JSON.parse(await read(path));
const fixture = (name) => read(`test/fixtures/wowhead-${name}.html`);
const clone = (value) => JSON.parse(JSON.stringify(value));

const RAID = await json("data/raid-items.json");
const DUNGEONS = await json("data/dungeon-items.json");

const PANELS = parseRewardPanels(await fixture("raid-rewards-gear-loot"));
const ATTRIBUTION = attributionFrom(PANELS);
const LAIR_HTML = await fixture("lair-nymrissa-wavecaller");

const DUNGEON_FIXTURES = {
  "Temple of Sethraliss": "dungeon-temple-of-sethraliss",
  "Ruby Life Pools": "dungeon-ruby-life-pools",
  "Kings' Rest": "dungeon-kings-rest",
  "Murder Row": "dungeon-murder-row",
  "The Blinding Vale": "dungeon-the-blinding-vale",
};
const ROWS = {};
for (const [name, slug] of Object.entries(DUNGEON_FIXTURES)) ROWS[name] = dungeonDropRowsFrom(await fixture(slug));

/* Attribute one dungeon against its fixture, on a clone, and report before/after coverage. */
function runDungeon(name) {
  const pool = POOL.find((dungeon) => dungeon.name === name);
  const items = clone(DUNGEONS.dungeons.find((dungeon) => dungeon.name === name).items);
  const before = items.filter((item) => item.droppedBy).length;
  const audit = attributeDungeonItems(pool, items, ROWS[name]);
  return { pool, items, audit, before, after: items.filter((item) => item.droppedBy).length };
}

/* ---------- the raid rewards page describes itself ---------- */

test("the rewards guide serves all nine gear-drop panels in one fetch", () => {
  assert.equal(PANELS.length, 9);
  assert.deepEqual(PANELS.map((panel) => panel.name), [
    "Nek'zali the Soulcoiler", "Entombed Sentinels", "The Lost Explorers",
    "Vashnik the Malignant", "Sszorak", "The Twin Fangs", "The Coiled Altar",
    "Ula'tek", "BoEs",
  ]);
  // Eight encounter panels, in the roster's own order, plus one that is not an encounter.
  assert.deepEqual(PANELS.filter((panel) => panel.isEncounter).map((panel) => panel.name),
    BOSSES.map((boss) => boss.name));
  assert.deepEqual(PANELS.filter((panel) => !panel.isEncounter).map((panel) => panel.name), ["BoEs"]);
  assert.match(REWARDS_GUIDE, /^https:\/\/www\.wowhead\.com\/guide\/midnight\/raids\//,
    "the rewards guide URL carries the /raids/ segment; without it Wowhead serves its 404 shell");
});

test("each panel yields only its drop table, never its difficulty ladder", () => {
  assert.deepEqual(PANELS.map((panel) => panel.rows.length), [17, 12, 13, 12, 12, 12, 14, 13, 9]);
  // Every panel also carries a Difficulty | Item Level | Mistcrests table. Reading it would
  // add currency rows and no items, so a row count equal to the panel's item count is the
  // evidence that the header test, not the table's position, chose the table.
  for (const panel of PANELS) {
    assert.ok(panel.rows.every((row) => /^\d+$/.test(row.itemId)), `${panel.name}: non-numeric item id`);
    assert.ok(panel.rows.every((row) => row.rawSlot), `${panel.name}: a drop row lost its slot cell`);
  }
});

test("the BoEs panel is loot without a kill, so it attributes nothing", () => {
  const boe = PANELS.find((panel) => panel.name === "BoEs");
  assert.equal(boe.rows.length, 9);
  assert.equal(boe.isEncounter, false);
  assert.ok(NON_ENCOUNTER_TABS.has("boes"));
  assert.deepEqual([...ATTRIBUTION.nonEncounter.keys()], ["BoEs"]);
  for (const row of boe.rows)
    assert.equal(ATTRIBUTION.byItem.has(row.itemId), false, `${row.itemId} was attributed to a boss`);
  // And none of them is in the harvested gear, so nothing downstream is waiting on them.
  const held = new Set(RAID.bosses.flatMap((boss) => boss.items.map((item) => String(item.id))));
  assert.deepEqual(boe.rows.filter((row) => held.has(row.itemId)), []);
});

test("an item listed under two panels keeps both, so the ownership override still has work to do", () => {
  assert.deepEqual(ATTRIBUTION.byItem.get("268231"), ["Nek'zali the Soulcoiler", "The Coiled Altar"]);
  // The rewards page reproduces the duplicate the boss guides carry, which is independent
  // confirmation that ITEM_OWNER_OVERRIDES resolves a Wowhead duplicate rather than ours.
  assert.equal(RAID.assignmentOverrides["268231"].boss, 1);
  const owners = RAID.bosses.filter((boss) => boss.items.some((item) => item.id === "268231"));
  assert.deepEqual(owners.map((boss) => boss.boss), [1]);
});

test("a page with no geardrops strip is refused rather than read as empty", () => {
  assert.throws(() => parseRewardPanels("<html><body>nothing here</body></html>"), /guide-body markup not found/);
  // A real Wowhead guide that simply has no tab strip — the lair boss page — must not parse
  // as "zero encounters", which would silently unattribute the whole raid.
  assert.throws(() => parseRewardPanels(LAIR_HTML), /no geardrops tab strip/);
});

/* ---------- the raid gap, closed ---------- */

test("the rewards guide closes every raid attribution gap: 65 of 104 -> 104 of 104", () => {
  const bosses = clone(RAID.bosses);
  const items = () => bosses.flatMap((boss) => boss.items);
  assert.equal(items().length, 104);
  assert.equal(items().filter((item) => item.droppedBy).length, 65);

  const audit = attributeRaidItems(bosses, ATTRIBUTION);

  assert.equal(items().filter((item) => item.droppedBy).length, 104);
  assert.equal(audit.filled.length, 39);
  assert.deepEqual(raidCounts(bosses), { fromTooltip: 65, fromGuide: 39, missing: 0 });
  // The three bosses whose tooltips were silent end to end.
  const byBoss = {};
  for (const row of audit.filled) byBoss[row.boss] = (byBoss[row.boss] ?? 0) + 1;
  assert.deepEqual(byBoss, {
    "Nek'zali the Soulcoiler": 14, "Vashnik the Malignant": 12, "The Coiled Altar": 13,
  });
  assert.equal(audit.notListed.length, 0, "every harvested item appears on the rewards page");
  // Drift is reported from both sides. The two Wowhead surfaces agreed exactly on
  // 2026-08-13: 104 boss-attributed rows, no row on either side the other lacks.
  assert.deepEqual(audit.guideOnly, []);
  assert.equal(ATTRIBUTION.byItem.size, 104);
});

test("every item states where its source came from, and a filled one never claims to be game data", () => {
  const bosses = clone(RAID.bosses);
  attributeRaidItems(bosses, ATTRIBUTION);
  for (const boss of bosses) {
    for (const item of boss.items) {
      assert.ok(Object.hasOwn(item, "droppedBySource"), `${item.id} has no provenance key`);
      assert.equal(item.droppedBySource === null, !item.droppedBy);
      assert.ok(["tooltip", "guide", null].includes(item.droppedBySource));
      if (item.droppedBySource === "guide") assert.equal(item.droppedBy, boss.name);
    }
  }
  const filled = bosses.flatMap((boss) => boss.items).filter((item) => item.droppedBySource === "guide");
  assert.equal(filled.length, 39);
});

test("a tooltip is never overwritten by the guide, and the two agreeing is recorded as agreement", () => {
  const bosses = clone(RAID.bosses);
  const before = new Map(bosses.flatMap((boss) => boss.items)
    .filter((item) => item.droppedBy).map((item) => [item.id, item.droppedBy]));
  const audit = attributeRaidItems(bosses, ATTRIBUTION);
  for (const item of bosses.flatMap((boss) => boss.items)) {
    if (before.has(item.id)) assert.equal(item.droppedBy, before.get(item.id), `${item.id} was overwritten`);
  }
  assert.equal(audit.exact, 25);
  assert.equal(audit.conflicts.length, 0, "no raid tooltip contradicts the rewards page");
  assert.equal(audit.aliasAgreements.reduce((sum, row) => sum + row.count, 0), 40);
});

test("alias agreements are itemised, which is the only place the Tidebound Grotto drops show up", () => {
  const bosses = clone(RAID.bosses);
  const audit = attributeRaidItems(bosses, ATTRIBUTION);
  assert.deepEqual(audit.aliasAgreements.map((row) => [row.encounter, row.tooltip, row.count]), [
    ["Nek'zali the Soulcoiler", "Nymrissa Wavecaller", 3],
    ["Entombed Sentinels", "Breath of Ula'tek", 12],
    ["The Lost Explorers", "Mor'zahi", 13],
    ["The Twin Fangs", "Vexhul", 12],
  ]);
  /* Three of those four rows are a boss's own sub-NPC. The first is not: Nymrissa Wavecaller
     is the Tidebound Grotto LAIR BOSS, and nothing in the data distinguishes her from a
     sub-NPC — which is exactly why the pairing is reported per run instead of absorbed.
     See the note above BOSSES in harvest-raid.mjs. */
  const grotto = audit.aliasAgreements.find((row) => row.tooltip === "Nymrissa Wavecaller");
  assert.equal(grotto.encounter, "Nek'zali the Soulcoiler");
});

test("the lair boss our pool never harvested already leaks four drops into the raid data", () => {
  /* Evidence, not a parser: the lair page has no tab strip and no Boss Drop column, so it is
     read here only to pin the measurement behind the Tidebound Grotto note. */
  const markup = guideMarkupFrom(LAIR_HTML);
  const headings = markupHeadings(markup);
  const gear = markupBlocks(markup, "table").filter((table) => {
    const section = [...headings].reverse().find((heading) => heading.start < table.start)?.text ?? "";
    return /gear drops/i.test(section);
  });
  const ids = [...new Set(gear.flatMap((table) =>
    [...table.raw.matchAll(/\[item=(\d+)(?=[\s\]])/g)].map((match) => match[1])))];
  assert.equal(ids.length, 13, "Nymrissa Wavecaller drops thirteen items");

  const owners = new Map();
  for (const boss of RAID.bosses) for (const item of boss.items) owners.set(String(item.id), boss.name);
  const held = ids.filter((id) => owners.has(id));
  assert.deepEqual(held.map((id) => [id, owners.get(id)]), [
    ["268225", "The Coiled Altar"],
    ["268262", "Nek'zali the Soulcoiler"],
    ["268263", "Nek'zali the Soulcoiler"],
    ["268266", "Nek'zali the Soulcoiler"],
  ]);
  // Nine of her thirteen drops are absent from every source we hold.
  const everything = new Set([...owners.keys(),
    ...DUNGEONS.dungeons.flatMap((dungeon) => dungeon.items.map((item) => String(item.id)))]);
  assert.equal(ids.filter((id) => !everything.has(id)).length, 9);
});

/* ---------- dungeon drop tables ---------- */

test("the drop table is chosen by its headers, not by its position under the heading", () => {
  // Every dungeon page puts the key-level ladder under the same "All Gear Drops" heading and
  // follows it with thirteen per-class Bonus Rolls grids. A row count equal to the dungeon's
  // own linked count is the evidence that none of them was read.
  assert.deepEqual(Object.fromEntries(Object.keys(DUNGEON_FIXTURES).map((name) => [name, ROWS[name].length])), {
    "Temple of Sethraliss": 34, "Ruby Life Pools": 20, "Kings' Rest": 33,
    "Murder Row": 25, "The Blinding Vale": 26,
  });
  for (const [name, rows] of Object.entries(ROWS)) {
    assert.ok(rows.every((row) => row.encounter), `${name}: a row lost its Boss Drop cell`);
    assert.ok(rows.every((row) => row.rawSlot), `${name}: a row lost its Slot cell`);
    assert.ok(rows.every((row) => !/^\d+\+?$/.test(row.encounter)),
      `${name}: a keystone-level row was read as a drop`);
  }
  assert.throws(() => dungeonDropRowsFrom("<html><body>x</body></html>"), /guide-body markup not found/);
});

test("the declared alias groups are the only equivalences, and they must name real encounters", () => {
  assert.equal(assertAliasGroups(), true);
  const declared = POOL.filter((dungeon) => dungeon.encounterAliases.length)
    .map((dungeon) => [dungeon.name, dungeon.encounterAliases]);
  assert.deepEqual(declared, [
    ["Kings' Rest", [["King Dazar", "Dazar, The First King"]]],
    ["Temple of Sethraliss", [["Adderis", "Aspix", "Adderis and Aspix"]]],
    ["Ruby Life Pools", [["Kyrakka", "Erkhart Stormvein", "Kyrakka and Erkhart Stormvein"]]],
  ]);
  const kings = POOL.find((dungeon) => dungeon.name === "Kings' Rest");
  assert.equal(encounterKeyFor(kings, "King Dazar"), encounterKeyFor(kings, "Dazar, The First King"));
  // The two bosses Wowhead conflates are NOT declared equal, which is what keeps them conflicts.
  assert.notEqual(encounterKeyFor(kings, "Aka'ali the Conqueror"),
    encounterKeyFor(kings, "The Council of Tribes"));
  assert.equal(encounterKeyFor(kings, ""), null);

  assert.throws(() => assertAliasGroups([{ name: "X", encounters: ["A", "B"], encounterAliases: [["A", "C"]] }]),
    /alias "C" is not one of the dungeon's encounters/);
  assert.throws(() => assertAliasGroups([{ name: "X", encounters: ["A", "B", "C"],
    encounterAliases: [["A", "B"], ["B", "C"]] }]), /appears in more than one alias group/);
  assert.throws(() => assertAliasGroups([{ name: "X", encounters: ["A"], encounterAliases: [["A"]] }]),
    /needs at least two names/);
});

/* ---------- the dungeon gap, closed ---------- */

test("the Boss Drop column closes every dungeon attribution gap: 179 of 204 -> 204 of 204", () => {
  const temple = runDungeon("Temple of Sethraliss");
  assert.deepEqual([temple.before, temple.after], [18, 34]);
  assert.equal(temple.audit.filled.length, 16);
  assert.equal(temple.audit.exact, 18);
  assert.equal(temple.audit.conflicts.length, 0);
  assert.deepEqual(dungeonCounts([{ items: temple.items }]), { fromTooltip: 18, fromGuide: 16, missing: 0 });
  // Adderis and Aspix are one kill; the guide writes the joint name and so do we.
  assert.deepEqual([...new Set(temple.audit.filled.map((row) => row.droppedBy))].sort(),
    ["Adderis and Aspix", "Galvazzt"]);

  const ruby = runDungeon("Ruby Life Pools");
  assert.deepEqual([ruby.before, ruby.after], [11, 20]);
  assert.equal(ruby.audit.filled.length, 9);
  assert.equal(ruby.audit.conflicts.length, 0);
  assert.deepEqual([...new Set(ruby.audit.filled.map((row) => row.droppedBy))],
    ["Kyrakka and Erkhart Stormvein"]);

  // Those two dungeons hold every gap: the other six are already complete, so 25 fills
  // take the pool from 179 of 204 to 204 of 204.
  const gaps = DUNGEONS.dungeons
    .filter((dungeon) => dungeon.items.some((item) => !item.droppedBy)).map((dungeon) => dungeon.name);
  assert.deepEqual(gaps.sort(), ["Ruby Life Pools", "Temple of Sethraliss"]);
  const total = DUNGEONS.dungeons.flatMap((dungeon) => dungeon.items);
  assert.equal(total.length, 204);
  assert.equal(total.filter((item) => item.droppedBy).length, 179);
  assert.equal(temple.audit.filled.length + ruby.audit.filled.length, 25);
});

/* ---------- what the guide must NOT be allowed to do ---------- */

test("Kings' Rest: an alias is agreement, a different boss is a conflict, and neither is written", () => {
  const kings = runDungeon("Kings' Rest");
  assert.deepEqual([kings.before, kings.after], [33, 33], "a complete dungeon gains nothing");
  assert.equal(kings.audit.filled.length, 0);
  assert.equal(kings.audit.exact, 14);
  assert.deepEqual(kings.audit.aliasAgreements,
    [{ dungeon: "Kings' Rest", tooltip: "King Dazar", guide: "Dazar, The First King", count: 11 }]);

  /* The real one: Wowhead's Season-2 table names only four of Kings' Rest's five bosses and
     folds Aka'ali the Conqueror's drops into The Council of Tribes. The tooltips disagree,
     the tooltips stand, and the eight rows are reported. */
  assert.equal(kings.audit.conflicts.length, 8);
  for (const row of kings.audit.conflicts) {
    assert.equal(row.tooltip, "Aka'ali the Conqueror");
    assert.equal(row.guide, "The Council of Tribes");
    assert.match(row.why, /different encounters/);
  }
  const guideBosses = new Set(ROWS["Kings' Rest"].map((row) => row.encounter));
  assert.equal(guideBosses.has("Aka'ali the Conqueror"), false);
  for (const item of kings.items.filter((candidate) => candidate.droppedBy === "Aka'ali the Conqueror"))
    assert.equal(item.droppedBySource, "tooltip");
});

test("a guide name from another dungeon never becomes an attribution", () => {
  const murder = runDungeon("Murder Row");
  const stray = murder.audit.conflicts.find((row) => row.guide === "Atroxus");
  assert.ok(stray, "the Atroxus row is missing from the fixture");
  assert.match(stray.why, /an encounter this dungeon does not have/);
  assert.equal(stray.tooltip, "Kystia Manaheart");
  // Atroxus is a Voidscar Arena boss, so the name is real — just not here.
  assert.ok(POOL.find((dungeon) => dungeon.name === "Voidscar Arena").encounters.includes("Atroxus"));
  const felsoaked = murder.items.find((item) => item.id === "251125");
  assert.equal(felsoaked.droppedBy, "Kystia Manaheart");
  assert.equal(felsoaked.droppedBySource, "tooltip");

  // The same page contradicts ITSELF on one item, listing it under two bosses.
  const doubled = murder.audit.conflicts.find((row) => row.id === "251123");
  assert.match(doubled.why, /attributes this item to two encounters/);
  assert.equal(doubled.guide, "Kystia Manaheart / Xathuux the Annihilator");

  // Drift between the guide table and the scoped set is reported from both sides.
  assert.deepEqual(murder.audit.guideOnly, [{ dungeon: "Murder Row", id: "271680", guide: "Kystia Manaheart" }]);
  assert.deepEqual(murder.audit.notListed.map((row) => row.id), ["251134"]);
  assert.deepEqual([murder.before, murder.after], [24, 24]);
});

test("The Blinding Vale: a whole encounter under an unknown name fills nothing", () => {
  const vale = runDungeon("The Blinding Vale");
  assert.equal(vale.audit.conflicts.length, 7);
  for (const row of vale.audit.conflicts) {
    assert.equal(row.guide, "Lightblossom Trinity");
    assert.equal(row.tooltip, "Meittik");
    assert.match(row.why, /an encounter this dungeon does not have/);
  }
  assert.equal(vale.audit.filled.length, 0);
  assert.deepEqual([vale.before, vale.after], [26, 26]);
  for (const item of vale.items) assert.equal(item.droppedBySource, "tooltip");
  // "Lightblossom Trinity" is not quietly adopted into the roster to make the run pass.
  for (const dungeon of POOL) assert.equal(dungeon.encounters.includes("Lightblossom Trinity"), false);
});

test("across every fixtured dungeon, a conflict costs nothing and gains nothing", () => {
  let filled = 0, conflicts = 0;
  for (const name of Object.keys(DUNGEON_FIXTURES)) {
    const run = runDungeon(name);
    filled += run.audit.filled.length;
    conflicts += run.audit.conflicts.length;
    assert.equal(run.after, run.before + run.audit.filled.length, `${name}: coverage moved by something other than a fill`);
    for (const item of run.items) {
      assert.ok(Object.hasOwn(item, "droppedBySource"));
      assert.equal(item.droppedBySource === null, !item.droppedBy);
      if (item.droppedBySource === "guide")
        assert.ok(run.pool.encounters.includes(item.droppedBy), `${item.id}: filled with an off-roster name`);
    }
  }
  assert.equal(filled, 25);
  assert.equal(conflicts, 17, "8 Kings' Rest + 7 Blinding Vale + 2 Murder Row");
});
