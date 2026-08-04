// Harvest stable secondary-stat budget allocations for every ranked raid,
// Mythic+, and direct-tier item. Raw legacy dungeon tooltips use tiny rounded
// values; requesting a high reference item level exposes the underlying split
// precisely enough to recover Wowhead's 7,000-point allocation budget.
//
//   node src/harvest-catalyst-allocations.mjs
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getText, parseItem, TOOLTIP } from "./lib-wowhead.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "catalyst-stat-allocations.json");
const ACCEPT_CHANGES = process.env.WOW_ACCEPT_CATALYST_ALLOCATION_CHANGES === "1";
const read = async (name) => JSON.parse(await readFile(join(ROOT, "data", name), "utf8"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TIER_SLOTS = new Set(["Head", "Shoulder", "Chest", "Hands", "Legs"]);
const ARMOR_TYPES = new Set(["Cloth", "Leather", "Mail", "Plate"]);
const REFERENCE_ILVL = 1000;

const [raid, dungeons, tier] = await Promise.all([
  read("raid-items.json"), read("dungeon-items.json"), read("tier-items.json"),
]);
const rankedSourceItems = [
  ...raid.bosses.flatMap((boss) => (boss.items || []).map((item) => ({
    ...item, sourceKind: "raid", sourceKey: String(boss.boss), tierClass: null,
  }))),
  ...dungeons.dungeons.flatMap((dungeon) => (dungeon.items || []).map((item) => ({
    ...item, sourceKind: "mplus", sourceKey: dungeon.name, tierClass: null,
  }))),
].filter((item) => item.slot && (item.secondaries || []).length).map((item) => ({
  ...item,
  catalystCategory: TIER_SLOTS.has(item.slot) && ARMOR_TYPES.has(item.type) ? "base" : "ranked-item",
}));
const catalystBases = rankedSourceItems.filter((item) => item.catalystCategory === "base");
const directTier = tier.sets.flatMap((set) => (set.items || []).map((item) => ({
  ...item, catalystCategory: "direct-tier", sourceKind: "direct-tier",
  sourceKey: String(set.setId), tierClass: set.class,
})));
const candidates = [...rankedSourceItems, ...directTier];
const otherRanked = rankedSourceItems.length - catalystBases.length;
if (catalystBases.length !== 94 || otherRanked !== 159 || directTier.length !== 65
  || new Set(candidates.map((item) => String(item.id))).size !== 318)
  throw new Error("refusing to harvest stat allocations: expected 94 Catalyst bases, 159 other ranked items, and 65 direct-tier items");

let previous = null;
try { previous = JSON.parse(await readFile(DATA_PATH, "utf8")); }
catch (error) {
  if (error?.code !== "ENOENT")
    throw new Error(`cannot trust existing Catalyst allocation baseline: ${error.message}`, { cause: error });
}
if (previous && (previous?.counts?.items !== 318 || Object.keys(previous?.items || {}).length !== 318)
  && !ACCEPT_CHANGES)
  throw new Error("cannot trust existing stat-allocation baseline: expected 318 items");

console.log("Harvesting stable ranked-item stat allocations ...");
const items = {};
for (let offset = 0; offset < candidates.length; offset += 8) {
  const chunk = candidates.slice(offset, offset + 8);
  const pages = await Promise.all(chunk.map((item) =>
    getText(`${TOOLTIP(item.id)}&ilvl=${REFERENCE_ILVL}`)));
  for (let index = 0; index < chunk.length; index++) {
    const item = chunk[index], page = pages[index];
    if (!page) throw new Error(`refusing to overwrite allocations: reference tooltip ${item.id} failed`);
    const parsed = parseItem(JSON.parse(page), item.id);
    const expected = item.secondaries || [];
    if (expected.length < 1 || expected.some((stat) => !Number.isFinite(parsed.secondaryRatings[stat]))
      || Object.keys(parsed.secondaryRatings).some((stat) => !expected.includes(stat)))
      throw new Error(`refusing to overwrite allocations: ${item.id} stats do not match its tooltip`);
    const total = Object.values(parsed.secondaryRatings).reduce((sum, value) => sum + value, 0);
    const ordered = {};
    expected.forEach((stat, statIndex) => {
      ordered[stat] = statIndex === expected.length - 1
        ? 7000 - Object.values(ordered).reduce((sum, value) => sum + value, 0)
        : Math.round(parsed.secondaryRatings[stat] * 7000 / total);
    });
    if (Object.values(ordered).reduce((sum, value) => sum + value, 0) !== 7000)
      throw new Error(`refusing to overwrite allocations: ${item.id} budget does not total 7000`);
    items[String(item.id)] = {
      category: item.catalystCategory,
      sourceKind: item.sourceKind,
      sourceKey: item.sourceKey,
      tierClass: item.tierClass,
      name: item.name,
      slot: item.slot,
      type: item.type,
      secondaries: item.secondaries,
      dataRatings: item.secondaryRatings,
      tertiaries: item.tertiaries,
      tertiaryRatings: item.tertiaryRatings,
      sockets: item.sockets,
      dataIlvl: item.ilvl,
      dataTrack: item.track,
      effect: item.effect,
      effectKind: item.effectKind,
      effects: item.effects,
      allocations: ordered,
    };
  }
  process.stdout.write(".");
  await sleep(60);
}
console.log("");

const before = new Set(Object.keys(previous?.items || {}));
const after = new Set(Object.keys(items));
const removed = [...before].filter((id) => !after.has(id));
const added = [...after].filter((id) => !before.has(id));
const changed = [...after].filter((id) => before.has(id)
  && JSON.stringify(previous.items[id]) !== JSON.stringify(items[id]));
if ((removed.length || added.length || changed.length) && previous && !ACCEPT_CHANGES)
  throw new Error("refusing to overwrite allocations: reviewed Catalyst fingerprint changed; audit and rerun with "
    + `WOW_ACCEPT_CATALYST_ALLOCATION_CHANGES=1 if intentional\nremoved=[${removed}] added=[${added}] changed=[${changed}]`);

const out = {
  schemaVersion: 4,
  patchContext: "ptr-12.1.0",
  source: `Wowhead 12.1.0 PTR ranked-item tooltips scaled to reference item level ${REFERENCE_ILVL}`,
  sourceUrlPattern: "https://nether.wowhead.com/ptr/tooltip/item/{itemId}?locale=0&ilvl=1000",
  harvestedAt: new Date().toISOString().slice(0, 10),
  caveat: "The 7,000-point allocations are recovered from a high-level reference tooltip to avoid legacy-template rounding; displayed rating amounts still scale with actual item level.",
  counts: {
    catalystBases: catalystBases.length,
    otherRanked,
    directTier: directTier.length,
    items: candidates.length,
  },
  items,
};
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(DATA_PATH, JSON.stringify(out, null, 2), "utf8");
console.log(`wrote data/catalyst-stat-allocations.json (${out.counts.items} ranked items)`);
