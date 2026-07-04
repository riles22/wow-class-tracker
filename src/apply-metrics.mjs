/* Merge fetched quantitative data into data/specs.json.
   Usage: node src/apply-metrics.mjs <data.json>

   The input file may contain either or both of:
     "metrics":  [{ "class", "spec", "bracket": "raid"|"mplus", "source",
                    "name", "value", "unit"?, "n"?, "asOf"? }]
     "profiles": [{ "class", "spec", "source", "asOf"?,
                    "targets": { "<targetCount>": <dps>, ... } }]
   Metrics upsert by (source, bracket, name); profiles replace fightProfile.
   Exact class+spec matching; refuses to write on any unmatched row or
   validation failure. */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "./validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function applyMetrics(dataPath, root = ROOT) {
  const input = JSON.parse(await readFile(dataPath, "utf8"));
  const data = await loadData(root);
  const byKey = new Map(data.specs.map(spec => [`${spec.class}|${spec.spec}`, spec]));
  const unmatched = [];
  let metricsApplied = 0, profilesApplied = 0;

  for (const row of input.metrics ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`metric: ${row.class} / ${row.spec} (${row.source})`); continue; }
    spec.metrics ??= [];
    const existing = spec.metrics.findIndex(m => m.source === row.source && m.bracket === row.bracket && m.name === row.name);
    const entry = { source: row.source, bracket: row.bracket, name: row.name, value: row.value };
    if (row.unit != null) entry.unit = row.unit;
    if (row.n != null) entry.n = row.n;
    if (row.asOf != null) entry.asOf = row.asOf;
    if (existing >= 0) spec.metrics[existing] = entry; else spec.metrics.push(entry);
    metricsApplied++;
  }

  for (const row of input.profiles ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`profile: ${row.class} / ${row.spec}`); continue; }
    spec.fightProfile = { source: row.source, asOf: row.asOf ?? null, targets: row.targets };
    profilesApplied++;
  }

  let survivabilityApplied = 0;
  for (const row of input.survivability ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`survivability: ${row.class} / ${row.spec}`); continue; }
    spec.survivability = { tier: row.tier, source: row.source ?? "archon", asOf: row.asOf ?? null };
    survivabilityApplied++;
  }

  let playstyleApplied = 0;
  for (const row of input.playstyle ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`playstyle: ${row.class} / ${row.spec}`); continue; }
    spec.playstyle = { range: row.range, mobility: row.mobility, utility: row.utility, notes: row.utilityNotes ?? row.notes ?? null };
    playstyleApplied++;
  }

  // Complexity merges into the existing playstyle object (separate fetch).
  for (const row of input.complexity ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`complexity: ${row.class} / ${row.spec}`); continue; }
    spec.playstyle = spec.playstyle ?? {};
    spec.playstyle.complexity = row.complexity;
    if (row.complexityNotes) spec.playstyle.complexityNotes = row.complexityNotes;
    playstyleApplied++;
  }

  // Season 2 tier set bonuses (actual 2pc/4pc text).
  for (const row of input.tiersets ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`tierset: ${row.class} / ${row.spec}`); continue; }
    spec.tierSet = { set2: row.set2 || null, set4: row.set4 || null, source: row.source ?? null, asOf: row.asOf ?? null };
    playstyleApplied++;
  }

  // Melee-capability verification (updates range + sets meleeCapable for hybrids).
  for (const row of input.melee ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`melee: ${row.class} / ${row.spec}`); continue; }
    spec.playstyle = spec.playstyle ?? {};
    if (row.primaryRange) spec.playstyle.range = row.primaryRange;
    spec.playstyle.meleeCapable = !!row.meleeCapable;
    playstyleApplied++;
  }

  if (unmatched.length) {
    throw new Error(
      `${unmatched.length} row(s) did not match any spec — nothing written:\n` +
      unmatched.map(u => "  - " + u).join("\n")
    );
  }

  const errors = validateData(data);
  if (errors.length) {
    throw new Error("Merged data failed validation — nothing written:\n" + errors.map(e => "  - " + e).join("\n"));
  }

  await writeFile(path.join(root, "data", "specs.json"), JSON.stringify(data.specs, null, 2) + "\n");
  return { metricsApplied, profilesApplied, survivabilityApplied, playstyleApplied };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dataPath = process.argv[2];
  if (!dataPath) {
    console.error("Usage: node src/apply-metrics.mjs <data.json>");
    process.exit(1);
  }
  try {
    const result = await applyMetrics(path.resolve(dataPath));
    console.log(`✓ applied ${result.metricsApplied} metric(s), ${result.profilesApplied} fight profile(s), ${result.survivabilityApplied} survivability tier(s), ${result.playstyleApplied} playstyle(s) → data/specs.json`);
  } catch (error) {
    console.error("✗ " + error.message);
    process.exit(1);
  }
}
