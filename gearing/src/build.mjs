// Bake data/*.json into one self-contained HTML file.
//
//   node src/build.mjs   ->   wow-s2-gearing.html
//
// The app markup lives in src/app.template.html; this only injects the data blob
// so the output works offline with no external requests.
//
import { createHash } from "node:crypto";
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
const simcManifest = await readData("simc-run-manifest.json");
const simcWeights = await readData("simc-reference-weights.json");
let icons = { icons: {} };
try { icons = await readData("icons.json"); }
catch { console.warn("  (no data/icons.json -- run node src/harvest-icons.mjs for item icons)"); }
const template = await readFile(join(ROOT, "src", "app.template.html"), "utf8");

validateData({ raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency,
  itemEligibility, tier, catalyst, catalystAllocations, simcManifest, simcWeights },
{ gearingRoot: ROOT });
const simcAudit = await validateSimcAuditArtifacts(simcWeights, simcManifest, ROOT);

// </script> inside the JSON would close the host <script> tag early
const blob = JSON.stringify({ raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
  catalystAllocations, simcManifest, simcWeights, icons: icons.icons })
  .replace(/<\/script>/gi, "<\\/script>");

if (!template.includes("__DATA__")) throw new Error("template is missing the __DATA__ placeholder");
let out = template.replace("__DATA__", blob);

// Normalize to LF before hashing. The HTML parser normalizes CRLF->LF before the browser
// hashes an inline script, so a CRLF artifact from a Windows checkout would make the CSP
// hash unmatchable; it also keeps local and CI builds byte-identical.
out = out.replace(/\r\n?/g, "\n");

// Content-Security-Policy, hashed at build time so only the exact inline script this build
// produced can execute (parity with the tracker's build.mjs, 2026-08-07). This policy is
// STRICTER than the tracker's on purpose: that page loads webfonts from Google, whereas
// this one makes no network requests at all -- the fonts and every item icon are data:
// URIs -- so no external origin appears here and default-src stays 'none'.
// The template carries no inline event handlers and no <form>, so hash-only script-src
// and form-action 'none' hold. style-src needs 'unsafe-inline' for the <style> block and
// the inline style= attributes the renderer writes.
const scriptHashes = [...out.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => "'sha256-" + createHash("sha256").update(m[1], "utf8").digest("base64") + "'");
// The <script id="data" type="application/json"> blob is not executable and is correctly
// skipped by the bare-<script> match above; exactly one app script should remain.
if (scriptHashes.length !== 1) {
  throw new Error(`expected exactly 1 inline app script to hash, found ${scriptHashes.length}`);
}
const csp = `default-src 'none'; script-src ${scriptHashes.join(" ")}; ` +
  "style-src 'unsafe-inline'; font-src data:; img-src data:; base-uri 'none'; form-action 'none'";
const withCsp = out.replace('<meta charset="utf-8">',
  `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">`);
if (withCsp === out) throw new Error("could not inject CSP: <meta charset=\"utf-8\"> not found");
out = withCsp;

await writeFile(join(ROOT, "wow-s2-gearing.html"), out, "utf8");

console.log(`wrote wow-s2-gearing.html  (${Math.round(out.length / 1024)} KB)`);
console.log(`  raid: ${raid.counts.gear} gear · ${raid.counts.withEffect} items with effects · ${raid.counts.tokens} tokens`);
console.log(`  m+:   ${dungeons.counts.gear} items across ${dungeons.counts.dungeonsHarvested}/${dungeons.counts.dungeonsInPool} dungeons`);
console.log(`  ${specs.counts.specs} specs · ${specs.counts.withPriority} with stat priority · ${specs.counts.withArmor} with armour type · ${specs.counts.withWeaponLoadouts} with weapon loadouts`);
console.log(`  ${tier.counts.items} direct tier items · catalyst rules ${catalyst.patchContext}`);
console.log(`  SimC coverage: ${simcManifest.coverage.acceptedEligibleSpecs} accepted · ${simcManifest.coverage.pendingEligibleSpecs} pending DPS · ${simcManifest.coverage.deferredTanks + simcManifest.coverage.deferredHealers} deferred · ${simcManifest.coverage.unsupportedSpecs} unsupported`);
console.log(`  SimC audit: ${simcAudit.profiles} profiles · ${simcAudit.reports} accepted reports verified`);
