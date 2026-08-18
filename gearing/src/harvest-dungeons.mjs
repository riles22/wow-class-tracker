// Harvest Season 2 Mythic+ dungeon loot from Wowhead's live dungeon guides.
//
// IMPORTANT — why there is no item level here.
// Mythic+ gear is the base dungeon item scaled at drop time by key level, so Wowhead
// shows these items at their template level (Ruby Life Pools reads "53", not a Season 2
// level). The item's slot, armour/weapon type, primary stat and secondaries ARE real and
// fixed; only the item level is dynamic. So we keep every item that has a slot and take
// the item level from the key-level table instead of the tooltip.
//
//   node src/harvest-dungeons.mjs
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getText, dungeonLootIdsFrom, dungeonBossDropsFrom, fetchItems, parsedItemIssues } from "./lib-wowhead.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "dungeon-items.json");
const ACCEPT_LOOT_CHANGES = process.env.WOW_ACCEPT_LOOT_CHANGES === "1";
let previous = null;
let hasPrevious = false;
try {
  previous = JSON.parse(await readFile(DATA_PATH, "utf8"));
  hasPrevious = true;
}
catch (error) {
  if (error?.code !== "ENOENT")
    throw new Error(`cannot trust existing dungeon loot baseline: ${error.message}`, { cause: error });
}
const M = (s) => `https://www.wowhead.com/guide/midnight/${s}-dungeon-overview-location-rewards`;
const MP = (s) => `https://www.wowhead.com/guide/midnight/${s}-dungeon-overview-mythic-plus`;
const G = (s) => `https://www.wowhead.com/guide/${s}-dungeon-strategy-guide`;
const D = (s) => `https://www.wowhead.com/guide/dungeons/${s}-strategy`;

// End-of-dungeon and Great Vault item levels by key level (see sheet 1 / Season 2 tables).
const KEY_ILVL = [
  { key: "Mythic 0", end: 292, vault: 302 }, { key: "+2", end: 295, vault: 305 },
  { key: "+3", end: 295, vault: 305 }, { key: "+4", end: 298, vault: 308 },
  { key: "+5", end: 302, vault: 308 }, { key: "+6", end: 305, vault: 311 },
  { key: "+7", end: 305, vault: 315 }, { key: "+8", end: 308, vault: 315 },
  { key: "+9", end: 308, vault: 315 }, { key: "+10 and above", end: 311, vault: 318 },
];

const POOL = [
  { name: "Altar of Fangs", expansion: "Midnight", isNew: true, encounters: ["Rav'i", "The Writhing Coil", "Zul'jan"], urls: [M("altar-of-fangs")] },
  { name: "Murder Row", expansion: "Midnight", encounters: ["Lithiel Cinderfury", "Xathuux the Annihilator", "Zaen Bladesorrow", "Kystia Manaheart"], urls: [M("murder-row")] },
  { name: "Den of Nalorakk", expansion: "Midnight", encounters: ["Nalorakk", "The Hoardmonger", "Sentinel of Winter"], urls: [M("den-of-nalorakk")] },
  { name: "The Blinding Vale", expansion: "Midnight", encounters: ["Lightwarden Ruia", "Ikuzz the Light Hunter", "Ziekket", "Meittik"], urls: [M("the-blinding-vale")] },
  { name: "Voidscar Arena", expansion: "Midnight", encounters: ["Charonus", "Atroxus", "Taz'Rah"], urls: [M("voidscar-arena")] },
  { name: "Kings' Rest", expansion: "Battle for Azeroth", encounters: ["The Golden Serpent", "Mchimba the Embalmer", "The Council of Tribes", "Aka'ali the Conqueror", "King Dazar", "Dazar, The First King"], urls: [MP("kings-rest"), G("kings-rest"), M("kings-rest")] },
  { name: "Temple of Sethraliss", expansion: "Battle for Azeroth", encounters: ["Adderis", "Aspix", "Adderis and Aspix", "Merektha", "Galvazzt", "Avatar of Sethraliss"], urls: [MP("temple-of-sethraliss"), G("temple-of-sethraliss")] },
  { name: "Ruby Life Pools", expansion: "Dragonflight", encounters: ["Melidrussa Chillworn", "Kokia Blazehoof", "Kyrakka", "Erkhart Stormvein", "Kyrakka and Erkhart Stormvein"], urls: [MP("ruby-life-pools"), D("ruby-life-pools")] },
];

if (hasPrevious) {
  const priorGroups = previous?.dungeons;
  const priorNames = new Set((priorGroups || []).map((dungeon) => dungeon.name));
  if (!Array.isArray(priorGroups) || priorGroups.length !== POOL.length
    || POOL.some((dungeon) => !priorNames.has(dungeon.name))
    || priorGroups.some((dungeon) => !(dungeon.items || []).length))
    throw new Error("cannot trust existing dungeon loot baseline: expected eight named, nonempty dungeons");
}

console.log("Harvesting Season 2 Mythic+ dungeon loot ...");
const dungeons = [];
const unresolved = [];

for (const d of POOL) {
  let ids = null, used = null, usedHtml = null;
  for (const u of d.urls) {
    const html = await getText(u);
    if (!html) continue;
    try {
      ids = dungeonLootIdsFrom(html);
      used = u;
      usedHtml = html;
      break;
    } catch { /* try the next known guide URL */ }
  }
  if (!ids) {
    unresolved.push(d.name);
    console.log(`  --   ${d.name.padEnd(22)} no loot table resolved`);
    continue;
  }
  const items = await fetchItems(ids);
  if (items.length !== ids.length) {
    unresolved.push(`${d.name} (${ids.length - items.length} tooltips failed)`);
    console.log(`  --   ${d.name.padEnd(22)} incomplete item tooltips`);
    continue;
  }
  // keep anything equippable; item level is supplied by KEY_ILVL, not the tooltip
  const gear = items.filter((it) => it.slot);
  if (!gear.length || gear.length !== ids.length) {
    unresolved.push(`${d.name} (${gear.length}/${ids.length} scoped items equippable)`);
    console.log(`  --   ${d.name.padEnd(22)} scoped loot table contains non-equippable items`);
    continue;
  }
  const schemaProblems = gear.flatMap((item) => parsedItemIssues(item)
    .map((issue) => `${item.id}=${issue}`));
  if (schemaProblems.length) {
    unresolved.push(`${d.name} (parser schema: ${schemaProblems.join(", ")})`);
    console.log(`  --   ${d.name.padEnd(22)} parsed item schema failed`);
    continue;
  }
  // Backfill droppedBy for tooltip-silent items from the same overview table the loot
  // ids came from (old-expansion tooltips carry no source line). Tooltip values win;
  // backfilled names face the encounter-roster gate below like any other attribution.
  const bossDrops = dungeonBossDropsFrom(usedHtml);
  for (const item of gear) {
    if (!item.droppedBy && bossDrops.has(item.id)) item.droppedBy = bossDrops.get(item.id);
  }
  const unexpectedSources = gear.filter((item) => item.droppedBy && !d.encounters.includes(item.droppedBy));
  if (unexpectedSources.length) {
    unresolved.push(`${d.name} (unexpected sources: ${unexpectedSources
      .map((item) => `${item.id}=${item.droppedBy}`).join(", ")})`);
    console.log(`  --   ${d.name.padEnd(22)} unexpected tooltip source`);
    continue;
  }
  dungeons.push({
    name: d.name, expansion: d.expansion, isNew: !!d.isNew,
    guide: used, encounters: d.encounters, linked: ids.length, items: gear,
  });
  console.log(`  ok   ${d.name.padEnd(22)} ${String(ids.length).padStart(3)} linked  ${String(gear.length).padStart(3)} equippable`);
}

if (unresolved.length) {
  throw new Error(`refusing to overwrite data/dungeon-items.json: ${unresolved.join(", ")}`);
}

const lootChanges = [];
for (const oldDungeon of previous?.dungeons || []) {
  const current = dungeons.find((dungeon) => dungeon.name === oldDungeon.name);
  const before = new Set((oldDungeon.items || []).map((item) => String(item.id)));
  const after = new Set((current?.items || []).map((item) => String(item.id)));
  const removed = [...before].filter((id) => !after.has(id));
  const added = [...after].filter((id) => !before.has(id));
  if (!current || removed.length || added.length)
    lootChanges.push(`${oldDungeon.name}: removed=[${removed.join(",")}] added=[${added.join(",")}]`);
}
if (lootChanges.length && !ACCEPT_LOOT_CHANGES) {
  throw new Error("refusing to overwrite data/dungeon-items.json: scoped loot set changed; audit the guide "
    + `and rerun with WOW_ACCEPT_LOOT_CHANGES=1 if intentional:\n  ${lootChanges.join("\n  ")}`);
}
if (lootChanges.length) console.warn(`  accepted reviewed dungeon loot changes: ${lootChanges.join("; ")}`);

const dungeonOwners = new Map();
for (const dungeon of dungeons) {
  for (const item of dungeon.items) {
    if (!dungeonOwners.has(item.id)) dungeonOwners.set(item.id, []);
    dungeonOwners.get(item.id).push(dungeon.name);
  }
}
const duplicateItems = [...dungeonOwners.entries()].filter(([, owners]) => owners.length > 1);
if (duplicateItems.length) {
  throw new Error(`refusing to overwrite data/dungeon-items.json: duplicate assignments: ${duplicateItems
    .map(([id, owners]) => `${id} (${owners.join(", ")})`).join("; ")}`);
}

const out = {
  source: "Wowhead 12.1 live — Midnight dungeon guides + per-item tooltips",
  harvestedAt: new Date().toISOString().slice(0, 10),
  caveat: "Season 2 live data (harvested from Wowhead's live guides after the 2026-08-18 launch). Mythic+ gear is scaled at drop time by key level, so item levels come from the key-level table, not from the item.",
  ilvlNote: "Wowhead shows these items at their template item level; the real level is set by key level on drop.",
  keyLevels: KEY_ILVL,
  unresolved,
  counts: {
    dungeonsInPool: POOL.length,
    dungeonsHarvested: dungeons.length,
    gear: dungeons.reduce((a, d) => a + d.items.length, 0),
  },
  dungeons,
};

await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(DATA_PATH, JSON.stringify(out, null, 2), "utf8");

console.log(`\nwrote data/dungeon-items.json`);
console.log(`  ${dungeons.length}/${POOL.length} dungeons · ${out.counts.gear} equippable items`);
