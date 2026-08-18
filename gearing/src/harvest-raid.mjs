// Harvest every Venomous Abyss drop from Wowhead's 12.1 live data.
//
// Two hops:
//   1. each boss guide page  -> the item IDs that boss drops
//   2. nether.wowhead.com    -> that item's own tooltip (slot, type, stats, effect)
//
// All parsing lives in lib-wowhead.mjs so every harvester agrees on the rules.
// Nothing is inferred: fields absent from the tooltip stay null, because guessed
// loot data is worse than missing loot data.
//
//   node src/harvest-raid.mjs
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getText, raidBossLootIdsFrom, fetchItems, parsedItemIssues } from "./lib-wowhead.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "raid-items.json");
const ACCEPT_LOOT_CHANGES = process.env.WOW_ACCEPT_LOOT_CHANGES === "1";
let previous = null;
let hasPrevious = false;
try {
  previous = JSON.parse(await readFile(DATA_PATH, "utf8"));
  hasPrevious = true;
}
catch (error) {
  if (error?.code !== "ENOENT")
    throw new Error(`cannot trust existing raid loot baseline: ${error.message}`, { cause: error });
}
const GUIDE = (slug) =>
  `https://www.wowhead.com/guide/midnight/raids/venomous-abyss-${slug}-boss-strategy-abilities`;
const ITEM_LEVEL_SOURCE = "https://www.wowhead.com/guide/midnight/raids/the-venomous-abyss-overview-location-rewards-bosses";
const DROP_LEVELS = [
  { bosses: [1], values: [279, 292, 305, 318] },
  { bosses: [2, 3], values: [282, 295, 308, 321] },
  { bosses: [4, 5, 6], values: [285, 298, 311, 324] },
  { bosses: [7, 8], values: [289, 302, 315, 344] },
];
const dropLevelsFor = (boss) => {
  const row = DROP_LEVELS.find((group) => group.bosses.includes(boss));
  return ["LFR", "Normal", "Heroic", "Mythic"]
    .map((need, index) => ({ need, ilvl: row.values[index] }));
};

const BOSSES = [
  { n: 1, slug: "nekzali-the-soulcoiler", name: "Nek'zali the Soulcoiler", token: null, dropAliases: ["Nek'zali the Soulcoiler"] },
  { n: 2, slug: "entombed-sentinels", name: "Entombed Sentinels", token: "Hands", dropAliases: ["Blood of Ula'tek", "Breath of Ula'tek"] },
  { n: 3, slug: "lost-explorers", name: "The Lost Explorers", token: "Shoulders", orderDisputed: true, dropAliases: ["Mor'zahi"] },
  { n: 4, slug: "vashnik-the-malignant", name: "Vashnik the Malignant", token: "Chest", orderDisputed: true, dropAliases: ["Vashnik", "Vashnik the Malignant"] },
  { n: 5, slug: "sszorak", name: "Sszorak", token: "Legs", dropAliases: ["Sszorak"] },
  { n: 6, slug: "twin-fangs", name: "The Twin Fangs", token: "Head", dropAliases: ["Vexhul", "Ithraz"] },
  { n: 7, slug: "coiled-altar", name: "The Coiled Altar", token: null, dropAliases: ["Zul'jan", "Hex Lord Malacrass", "The Coiled Altar"] },
  { n: 8, slug: "ulatek", name: "Ula'tek", token: "omni", dropAliases: ["Ula'tek"] },
];

if (hasPrevious) {
  const priorGroups = previous?.bosses;
  const priorNumbers = new Set((priorGroups || []).map((boss) => boss.boss));
  if (!Array.isArray(priorGroups) || priorGroups.length !== BOSSES.length
    || BOSSES.some((boss) => !priorNumbers.has(boss.n))
    || priorGroups.some((boss) => !(boss.items || []).length))
    throw new Error("cannot trust existing raid loot baseline: expected eight numbered, nonempty bosses");
}

// Duplicate-listing overrides. Empty since the 2026-08-18 launch re-harvest: the PTR-era
// override for 268231 (Soulslither Spaulders — listed under both Nek'zali and The Coiled
// Altar on PTR, forced to Nek'zali here) became obsolete when Wowhead's LIVE guide
// resolved the duplicate the OTHER way (verified 08-18: 0 mentions on Nek'zali's live
// page, 3 on The Coiled Altar's), and the stale override failed the harvest closed —
// exactly its design. Any future duplicate gets a new explicit entry here.
const ITEM_OWNER_OVERRIDES = {};

console.log("Harvesting The Venomous Abyss from Wowhead (12.1 live) ...");
const bosses = [];
const failed = [];

for (const b of BOSSES) {
  const html = await getText(GUIDE(b.slug));
  if (!html) {
    console.error(`  !! no guide page for ${b.name}`);
    failed.push(`${b.name}: guide fetch failed`);
    continue;
  }
  let ids;
  try { ids = raidBossLootIdsFrom(html); }
  catch (error) {
    console.error(`  !! no scoped loot table for ${b.name}`);
    failed.push(`${b.name}: ${error.message}`);
    continue;
  }
  const items = await fetchItems(ids);
  if (items.length !== ids.length) {
    failed.push(`${b.name}: ${ids.length - items.length} item tooltips failed`);
    continue;
  }
  const gear = items.filter((x) => x.ilvl && x.ilvl > 100);
  const schemaProblems = gear.flatMap((item) => parsedItemIssues(item)
    .map((issue) => `${item.id}=${issue}`));
  for (const item of gear.filter((candidate) => !candidate.slot)) {
    const classToken = Array.isArray(item.classes) && item.classes.length > 0;
    const omniToken = b.n === 8 && b.token === "omni" && item.id === "270909";
    if (!classToken && !omniToken) schemaProblems.push(`${item.id}=unexplained slotless raid item`);
  }
  if (schemaProblems.length) {
    failed.push(`${b.name}: parser schema ${schemaProblems.join(", ")}`);
    continue;
  }
  const unexpectedSources = gear.filter((item) => item.droppedBy && !b.dropAliases.includes(item.droppedBy));
  if (unexpectedSources.length) {
    failed.push(`${b.name}: unexpected tooltip sources ${unexpectedSources
      .map((item) => `${item.id}=${item.droppedBy}`).join(", ")}`);
    continue;
  }
  console.log(`  boss ${b.n}  ${b.name.padEnd(26)} ${String(items.length).padStart(3)} drops  ${String(gear.length).padStart(3)} gear`);
  bosses.push({
    boss: b.n, name: b.name, tokenSlot: b.token, orderDisputed: !!b.orderDisputed,
    dropAliases: b.dropAliases, dropLevels: dropLevelsFor(b.n), items: gear,
  });
}

if (failed.length) {
  throw new Error(`refusing to overwrite data/raid-items.json:\n  ${failed.join("\n  ")}`);
}

for (const [id, override] of Object.entries(ITEM_OWNER_OVERRIDES)) {
  const intendedBoss = bosses.find((boss) => boss.boss === override.boss);
  if (!intendedBoss?.items.some((item) => item.id === id)) {
    throw new Error(`refusing to overwrite data/raid-items.json: ownership override ${id} `
      + `is missing from intended boss ${override.boss}`);
  }
}

for (const boss of bosses) {
  boss.items = boss.items.filter((item) => {
    const override = ITEM_OWNER_OVERRIDES[item.id];
    return !override || override.boss === boss.boss;
  });
}

const lootChanges = [];
for (const oldBoss of previous?.bosses || []) {
  const current = bosses.find((boss) => boss.boss === oldBoss.boss);
  const before = new Set((oldBoss.items || []).map((item) => String(item.id)));
  const after = new Set((current?.items || []).map((item) => String(item.id)));
  const removed = [...before].filter((id) => !after.has(id));
  const added = [...after].filter((id) => !before.has(id));
  if (!current || removed.length || added.length)
    lootChanges.push(`${oldBoss.name}: removed=[${removed.join(",")}] added=[${added.join(",")}]`);
}
if (lootChanges.length && !ACCEPT_LOOT_CHANGES) {
  throw new Error("refusing to overwrite data/raid-items.json: scoped loot set changed; audit the boss guides "
    + `and rerun with WOW_ACCEPT_LOOT_CHANGES=1 if intentional:\n  ${lootChanges.join("\n  ")}`);
}
if (lootChanges.length) console.warn(`  accepted reviewed raid loot changes: ${lootChanges.join("; ")}`);

const raidOwners = new Map();
for (const boss of bosses) {
  for (const item of boss.items) {
    if (!raidOwners.has(item.id)) raidOwners.set(item.id, []);
    raidOwners.get(item.id).push(boss.name);
  }
}
const duplicateItems = [...raidOwners.entries()].filter(([, owners]) => owners.length > 1);
if (duplicateItems.length) {
  throw new Error(`refusing to overwrite data/raid-items.json: duplicate assignments: ${duplicateItems
    .map(([id, owners]) => `${id} (${owners.join(", ")})`).join("; ")}`);
}

const all = bosses.flatMap((b) => b.items);
const out = {
  source: "Wowhead 12.1 live boss-guide Gear tables + per-item tooltips",
  itemLevelSource: ITEM_LEVEL_SOURCE,
  harvestedAt: new Date().toISOString().slice(0, 10),
  caveat: "Season 2 live data (harvested from Wowhead's live guides after the 2026-08-18 launch). Mid-season hotfixes can still retune individual items between harvests.",
  assignmentOverrides: ITEM_OWNER_OVERRIDES,
  instance: "The Venomous Abyss",
  counts: {
    drops: all.length,
    gear: all.filter((x) => x.ilvl > 100).length,
    withEffect: all.filter((x) => x.effect).length,
    tokens: bosses.reduce((sum, boss) => sum + boss.items.filter((item) =>
      (item.classes && item.classes.length) || (boss.tokenSlot === "omni" && !item.slot)).length, 0),
    typed: all.filter((x) => x.type).length,
  },
  bosses,
};

await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(DATA_PATH, JSON.stringify(out, null, 2), "utf8");
console.log(`\nwrote data/raid-items.json`);
console.log(`  ${out.counts.drops} drops · ${out.counts.gear} gear · ${out.counts.withEffect} with effects · ${out.counts.tokens} tier tokens · ${out.counts.typed} with an armour/weapon type`);
