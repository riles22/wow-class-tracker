/* Data validation: every rule the build depends on. Returns a list of
   human-readable errors; the build aborts if any are present. */

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROLES = new Set(["DPS", "Healer", "Tank"]);
const BRACKETS = new Set(["raid", "mplus"]);
const VERDICTS = new Set(["Positive", "Mixed", "Negative"]);
const KINDS = new Set(["tier-list", "metrics", "notes-feed", "reference", "community"]);

export function validateData({ specs, sources, scales, community, ptrBuilds, creatorTakes }) {
  const errors = [];

  // --- scales ---
  const bands = scales?.consensus?.bands;
  if (!Array.isArray(bands) || bands.length === 0) {
    errors.push("scales.json: consensus.bands must be a non-empty array");
  } else {
    for (let i = 1; i < bands.length; i++) {
      if (bands[i].min >= bands[i - 1].min) {
        errors.push(`scales.json: consensus.bands must be sorted by descending min (band ${i})`);
      }
    }
    if (bands.at(-1).min !== 0) errors.push("scales.json: last consensus band must have min 0");
  }
  if (typeof scales?.consensus?.spreadThreshold !== "number") {
    errors.push("scales.json: consensus.spreadThreshold must be a number");
  }
  for (const [scaleId, scale] of Object.entries(scales?.scales ?? {})) {
    if (!Array.isArray(scale.tiers) || scale.tiers.length === 0) {
      errors.push(`scales.json: scale "${scaleId}" must define a non-empty tiers array`);
      continue;
    }
    for (const tier of scale.tiers) {
      if (typeof scale.values?.[tier] !== "number") {
        errors.push(`scales.json: scale "${scaleId}" tier "${tier}" has no numeric value`);
      }
    }
  }

  // --- sources ---
  const tierSources = new Map();
  const allSources = new Set();
  for (const source of sources) {
    if (!source.id || !source.name) errors.push(`sources.json: source missing id or name (${JSON.stringify(source.id)})`);
    allSources.add(source.id);
    if (!KINDS.has(source.kind)) errors.push(`sources.json: source "${source.id}" has unknown kind "${source.kind}"`);
    if (source.kind === "tier-list") {
      if (!scales.scales?.[source.scale]) {
        errors.push(`sources.json: source "${source.id}" references unknown scale "${source.scale}"`);
      }
      tierSources.set(source.id, source);
    }
  }
  if (tierSources.size === 0) errors.push("sources.json: no tier-list sources defined");

  // --- specs ---
  const seen = new Set();
  for (const spec of specs) {
    const key = `${spec.class} / ${spec.spec}`;
    if (seen.has(key)) errors.push(`specs.json: duplicate spec ${key}`);
    seen.add(key);
    if (!ROLES.has(spec.role)) errors.push(`specs.json: ${key} has invalid role "${spec.role}"`);

    for (const [bracket, ratings] of Object.entries(spec.ratings ?? {})) {
      if (!BRACKETS.has(bracket)) {
        errors.push(`specs.json: ${key} has unknown bracket "${bracket}"`);
        continue;
      }
      for (const [sourceId, tier] of Object.entries(ratings)) {
        const source = tierSources.get(sourceId);
        if (!source) {
          errors.push(`specs.json: ${key} ${bracket} rating from unknown source "${sourceId}"`);
          continue;
        }
        if (tier !== null && scales.scales[source.scale]?.values?.[tier] === undefined) {
          errors.push(`specs.json: ${key} ${bracket}.${sourceId} tier "${tier}" not in scale "${source.scale}"`);
        }
      }
    }

    for (const metric of spec.metrics ?? []) {
      if (!allSources.has(metric.source)) errors.push(`specs.json: ${key} metric from unknown source "${metric.source}"`);
      if (!BRACKETS.has(metric.bracket)) errors.push(`specs.json: ${key} metric has invalid bracket "${metric.bracket}"`);
      if (typeof metric.name !== "string" || !metric.name) errors.push(`specs.json: ${key} metric missing name`);
      if (typeof metric.value !== "number") errors.push(`specs.json: ${key} metric "${metric.name}" value must be a number`);
      if (metric.era != null && !["live", "ptr"].includes(metric.era)) errors.push(`specs.json: ${key} metric "${metric.name}" era must be "live" or "ptr"`);
    }

    if (spec.fightProfile != null) {
      const fp = spec.fightProfile;
      if (!allSources.has(fp.source)) errors.push(`specs.json: ${key} fightProfile from unknown source "${fp.source}"`);
      const targets = Object.entries(fp.targets ?? {});
      if (targets.length === 0) errors.push(`specs.json: ${key} fightProfile.targets must be a non-empty object`);
      for (const [count, dps] of targets) {
        if (!/^\d+$/.test(count) || typeof dps !== "number") {
          errors.push(`specs.json: ${key} fightProfile target "${count}" must map a numeric target count to numeric DPS`);
        }
      }
    }

    if (spec.playstyle != null) {
      const ps = spec.playstyle;
      if (!["Melee", "Ranged"].includes(ps.range)) errors.push(`specs.json: ${key} playstyle.range must be "Melee" or "Ranged"`);
      for (const attr of ["mobility", "utility"]) {
        if (!Number.isInteger(ps[attr]) || ps[attr] < 1 || ps[attr] > 5) errors.push(`specs.json: ${key} playstyle.${attr} must be an integer 1–5`);
      }
      if (ps.complexity != null && (!Number.isInteger(ps.complexity) || ps.complexity < 1 || ps.complexity > 5)) {
        errors.push(`specs.json: ${key} playstyle.complexity must be an integer 1–5`);
      }
    }

    if (spec.survivability != null) {
      if (typeof spec.survivability.tier !== "string" || !spec.survivability.tier) errors.push(`specs.json: ${key} survivability needs a tier string`);
      if (spec.survivability.source && !allSources.has(spec.survivability.source)) errors.push(`specs.json: ${key} survivability from unknown source "${spec.survivability.source}"`);
    }

    if (spec.ptr != null) { // omitted ptr == null ptr: every consumer treats both as "not tracked"
      if (!VERDICTS.has(spec.ptr?.verdict)) errors.push(`specs.json: ${key} ptr.verdict "${spec.ptr?.verdict}" invalid`);
      if (typeof spec.ptr?.summary !== "string" || !spec.ptr.summary) errors.push(`specs.json: ${key} ptr.summary missing`);
      if (!Array.isArray(spec.ptr?.changes) || spec.ptr.changes.length === 0) errors.push(`specs.json: ${key} ptr.changes must be a non-empty array`);
    }
  }

  // --- community registry ---
  const specsByClass = new Map();
  for (const s of specs) {
    if (!specsByClass.has(s.class)) specsByClass.set(s.class, new Set());
    specsByClass.get(s.class).add(s.spec);
  }
  for (const entry of community?.classes ?? []) {
    if (!entry.class) errors.push("community.json: class entry missing class name");
    if (!entry.discord?.name || !entry.discord?.url) errors.push(`community.json: ${entry.class} discord needs name + url`);
    for (const alt of entry.altDiscords ?? []) {
      if (!alt.name || !alt.url) errors.push(`community.json: ${entry.class} altDiscord needs name + url`);
    }
    for (const creator of entry.creators ?? []) {
      if (!creator.name || !creator.url) errors.push(`community.json: ${entry.class} creator needs name + url`);
      // Optional spec scoping: a creator credible on only some of a class's specs.
      // Absent = whole class. Each listed spec must be a real spec of that class.
      if (creator.specs != null) {
        if (!Array.isArray(creator.specs) || creator.specs.length === 0) {
          errors.push(`community.json: ${entry.class} creator "${creator.name}" specs must be a non-empty array when present`);
        } else {
          for (const sp of creator.specs) {
            if (!specsByClass.get(entry.class)?.has(sp)) {
              errors.push(`community.json: ${entry.class} creator "${creator.name}" scoped to "${sp}" which is not a ${entry.class} spec`);
            }
          }
        }
      }
    }
    for (const site of entry.sites ?? []) {
      if (!site.name || !site.url) errors.push(`community.json: ${entry.class} site needs name + url`);
    }
  }

  // --- creator takes (qualitative layer) ---
  const specKeys = new Set(specs.map(s => `${s.class}|${s.spec}`));
  for (const take of creatorTakes?.takes ?? []) {
    if (!specKeys.has(`${take.class}|${take.spec}`)) errors.push(`creator-takes.json: take references unknown spec ${take.class} / ${take.spec}`);
    if (!take.creator || !take.claim || !take.url) errors.push(`creator-takes.json: take for ${take.spec} needs creator + claim + url`);
  }

  // --- PTR build feed ---
  for (const build of ptrBuilds?.builds ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(build.date ?? "")) errors.push(`ptr-builds.json: build missing ISO date (${JSON.stringify(build.date)})`);
    if (!build.forumUrl) errors.push(`ptr-builds.json: build ${build.date} missing forumUrl`);
  }

  return errors;
}

export async function loadData(root) {
  const read = async name => JSON.parse(await readFile(path.join(root, "data", name), "utf8"));
  const [specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers] = await Promise.all([
    read("specs.json"), read("sources.json"), read("scales.json"),
    read("community.json"), read("ptr-builds.json"), read("creator-takes.json"),
    read("encounter-tiers.json")
  ]);
  // latest movement baseline from data/history/ (optional — absent before first snapshot)
  let historySnapshot = null;
  try {
    const files = (await readdir(path.join(root, "data", "history"))).filter(f => f.endsWith(".json")).sort();
    if (files.length) historySnapshot = JSON.parse(await readFile(path.join(root, "data", "history", files.at(-1)), "utf8"));
  } catch { /* no history yet */ }
  return { specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers, historySnapshot };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const data = await loadData(root);
  const errors = validateData(data);
  if (errors.length) {
    console.error(`✗ ${errors.length} validation error(s):`);
    for (const error of errors) console.error("  - " + error);
    process.exit(1);
  }
  console.log(`✓ data valid — ${data.specs.length} specs, ${data.specs.filter(s => s.ptr).length} PTR-tracked`);
}
