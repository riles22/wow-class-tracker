// Bake data/*.json into one self-contained HTML file.
//
//   node src/build.mjs   ->   wow-s2-gearing.html
//
// The app markup lives in src/app.template.html; this only injects the data blob
// so the output works offline with no external requests.
//
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateData } from "./validate-data.mjs";
import { validateSimcAuditArtifacts } from "./validate-simc-audit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const readData = async (f) => JSON.parse(await readFile(join(ROOT, "data", f), "utf8"));

const raid = await readData("raid-items.json");
const specs = await readData("specs.json");
const dungeons = await readData("dungeon-items.json");
const sheet = await readData("sheet-rewards.json");
const statOverrides = await readData("stat-priority-overrides.json");
const statBaseline = await readData("stat-priority-baseline.json");
const weaponProficiency = await readData("weapon-proficiency.json");
const itemEligibility = await readData("item-eligibility-overrides.json");
const tier = await readData("tier-items.json");
const catalyst = await readData("catalyst-rules.json");
const catalystAllocations = await readData("catalyst-stat-allocations.json");
const simcWeights = await readData("simc-reference-weights.json");
let icons = { icons: {} };
try { icons = await readData("icons.json"); }
catch { console.warn("  (no data/icons.json -- run node src/harvest-icons.mjs for item icons)"); }
const template = await readFile(join(ROOT, "src", "app.template.html"), "utf8");

validateData({ raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency,
  itemEligibility, tier, catalyst, catalystAllocations, simcWeights });
const simcAudit = await validateSimcAuditArtifacts(simcWeights, ROOT);

// </script> inside the JSON would close the host <script> tag early
const blob = JSON.stringify({ raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
  catalystAllocations, simcWeights, icons: icons.icons })
  .replace(/<\/script>/gi, "<\\/script>");

if (!template.includes("__DATA__")) throw new Error("template is missing the __DATA__ placeholder");
const out = template.replace("__DATA__", blob);
await writeFile(join(ROOT, "wow-s2-gearing.html"), out, "utf8");

console.log(`wrote wow-s2-gearing.html  (${Math.round(out.length / 1024)} KB)`);
console.log(`  raid: ${raid.counts.gear} gear · ${raid.counts.withEffect} items with effects · ${raid.counts.tokens} tokens`);
console.log(`  m+:   ${dungeons.counts.gear} items across ${dungeons.counts.dungeonsHarvested}/${dungeons.counts.dungeonsInPool} dungeons`);
console.log(`  ${specs.counts.specs} specs · ${specs.counts.withPriority} with stat priority · ${specs.counts.withArmor} with armour type · ${specs.counts.withWeaponLoadouts} with weapon loadouts`);
console.log(`  ${tier.counts.items} direct tier items · catalyst rules ${catalyst.patchContext}`);
console.log(`  SimC audit: ${simcAudit.profiles} profiles · ${simcAudit.reports} accepted reports verified`);
