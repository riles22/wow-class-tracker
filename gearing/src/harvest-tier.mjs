// Harvest the 13 class-specific Season 2 tier sets from Wowhead's 12.1 PTR.
// These are the actual products created by raid tokens, so their fixed stat
// distributions can be compared with stat-preserving Catalyst conversions.
//
//   node src/harvest-tier.mjs
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchItems, getText, itemIdsFrom, parsedItemIssues } from "./lib-wowhead.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "tier-items.json");
const ACCEPT_ITEM_CHANGES = process.env.WOW_ACCEPT_TIER_CHANGES === "1";
const SET_URL = (setId) => `https://www.wowhead.com/ptr/item-set=${setId}`;
const SLOT_ORDER = ["Head", "Shoulder", "Chest", "Hands", "Legs"];

const SETS = [
  { class: "Death Knight", setId: 2055, name: "Baleful Grave-Knight's Crucible" },
  { class: "Demon Hunter", setId: 2056, name: "Abyssal Doomhound's Pursuit" },
  { class: "Druid", setId: 2057, name: "Bark of the Enigmatic Dreamwatcher" },
  { class: "Evoker", setId: 2058, name: "Echo of Calamity" },
  { class: "Hunter", setId: 2059, name: "Skulking Viper's Ambush" },
  { class: "Mage", setId: 2060, name: "Primal Leywarden's Attire" },
  { class: "Monk", setId: 2061, name: "Guile of the Monkey King" },
  { class: "Paladin", setId: 2062, name: "Radiance of the Consecrated Flame" },
  { class: "Priest", setId: 2063, name: "Cosmic Penitent's Raiment" },
  { class: "Rogue", setId: 2064, name: "Chosen Bloodslayer's Hexweave" },
  { class: "Shaman", setId: 2065, name: "Ophidian Oracle's Prophecy" },
  { class: "Warlock", setId: 2066, name: "Damned Necrolyte's Shattered Restraints" },
  { class: "Warrior", setId: 2067, name: "Jade Warlord's Dominion" },
];

let previous = null;
try { previous = JSON.parse(await readFile(DATA_PATH, "utf8")); }
catch (error) {
  if (error?.code !== "ENOENT")
    throw new Error(`cannot trust existing tier-item baseline: ${error.message}`, { cause: error });
}

console.log("Harvesting the 13 Midnight Season 2 class sets ...");
const sets = [];
for (const set of SETS) {
  const html = await getText(SET_URL(set.setId));
  if (!html) throw new Error(`refusing to overwrite tier data: set page ${set.setId} failed`);
  const ids = itemIdsFrom(html);
  if (ids.length !== 5)
    throw new Error(`refusing to overwrite tier data: ${set.class} set has ${ids.length}, not 5, items`);
  const items = await fetchItems(ids);
  if (items.length !== ids.length)
    throw new Error(`refusing to overwrite tier data: ${set.class} item tooltips were incomplete`);
  const problems = items.flatMap((item) => parsedItemIssues(item).map((issue) => `${item.id}=${issue}`));
  if (problems.length)
    throw new Error(`refusing to overwrite tier data: ${set.class} parser schema ${problems.join(", ")}`);
  if (new Set(items.map((item) => item.slot)).size !== 5
    || items.some((item) => !SLOT_ORDER.includes(item.slot)))
    throw new Error(`refusing to overwrite tier data: ${set.class} does not have one item in every tier slot`);
  if (items.some((item) => item.classes?.length !== 1 || item.classes[0] !== set.class))
    throw new Error(`refusing to overwrite tier data: ${set.class} class restriction did not parse exactly`);
  items.sort((left, right) => SLOT_ORDER.indexOf(left.slot) - SLOT_ORDER.indexOf(right.slot));
  sets.push({ ...set, sourceUrl: SET_URL(set.setId), items });
  console.log(`  ${set.class.padEnd(13)} ${items.map((item) => item.id).join(", ")}`);
}

const changes = [];
for (const oldSet of previous?.sets || []) {
  const current = sets.find((set) => set.class === oldSet.class);
  const before = new Set((oldSet.items || []).map((item) => String(item.id)));
  const after = new Set((current?.items || []).map((item) => String(item.id)));
  const removed = [...before].filter((id) => !after.has(id));
  const added = [...after].filter((id) => !before.has(id));
  if (!current || removed.length || added.length)
    changes.push(`${oldSet.class}: removed=[${removed.join(",")}] added=[${added.join(",")}]`);
}
if (changes.length && !ACCEPT_ITEM_CHANGES)
  throw new Error("refusing to overwrite tier data: class-set item IDs changed; audit and rerun with "
    + `WOW_ACCEPT_TIER_CHANGES=1 if intentional:\n  ${changes.join("\n  ")}`);

const out = {
  schemaVersion: 1,
  patchContext: "ptr-12.1.0",
  source: "Wowhead 12.1.0 PTR class-set pages + per-item tooltips",
  overviewUrl: "https://www.wowhead.com/guide/midnight/season-2-tier-set-bonus-appearance-overview",
  harvestedAt: new Date().toISOString().slice(0, 10),
  caveat: "Pre-launch PTR data. Direct tier item stats may change before Season 2 launches.",
  referenceSnapshot: { ilvl: 334, track: "Myth 6/6" },
  counts: { sets: sets.length, items: sets.flatMap((set) => set.items).length },
  sets,
};

await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(DATA_PATH, JSON.stringify(out, null, 2), "utf8");
console.log(`wrote data/tier-items.json (${out.counts.sets} sets, ${out.counts.items} items)`);
