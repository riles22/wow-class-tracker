// Build the spec capability + stat-priority layer.
//
//   class/spec/role/tier-set   <- WoW Class Tracker  data/specs.json  (already curated)
//   armour type per class      <- OUR OWN harvested tier-token class lists (self-validating)
//   stat priority              <- Icy Veins per-spec stat-priority pages
//
// Icy Veins currently publishes 12.0.7 (live) priorities; Season 2 priorities do not exist
// yet. That is recorded per spec in `statPriorityPatch` so the UI can say so out loud.
//
//   node src/harvest-specs.mjs
//
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPriority } from "./lib-icy-veins.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// gearing/ lives inside the wow-class-tracker repo, so the tracker's curated spec list
// is a sibling of this subproject: <repo>/data/specs.json
const TRACKER = process.env.WOW_CLASS_TRACKER_SPECS
  || join(ROOT, "..", "data", "specs.json");
const EXPECTED_LIVE_PATCH = "12.0.7";
const WEAPON_PATCH_CONTEXT = "ptr-12.1.0";

// Primary stat is a specialization capability, not a property of how a guide happens
// to format its priority list. Keep it explicit and fail generation if the roster drifts.
const PRIMARY_BY_SPEC = new Map(Object.entries({
  "Blood Death Knight": "Strength",
  "Frost Death Knight": "Strength",
  "Unholy Death Knight": "Strength",
  "Havoc Demon Hunter": "Agility",
  "Devourer Demon Hunter": "Intellect",
  "Vengeance Demon Hunter": "Agility",
  "Balance Druid": "Intellect",
  "Feral Druid": "Agility",
  "Guardian Druid": "Agility",
  "Restoration Druid": "Intellect",
  "Augmentation Evoker": "Intellect",
  "Devastation Evoker": "Intellect",
  "Preservation Evoker": "Intellect",
  "Beast Mastery Hunter": "Agility",
  "Marksmanship Hunter": "Agility",
  "Survival Hunter": "Agility",
  "Arcane Mage": "Intellect",
  "Fire Mage": "Intellect",
  "Frost Mage": "Intellect",
  "Brewmaster Monk": "Agility",
  "Mistweaver Monk": "Intellect",
  "Windwalker Monk": "Agility",
  "Holy Paladin": "Intellect",
  "Protection Paladin": "Strength",
  "Retribution Paladin": "Strength",
  "Discipline Priest": "Intellect",
  "Holy Priest": "Intellect",
  "Shadow Priest": "Intellect",
  "Assassination Rogue": "Agility",
  "Outlaw Rogue": "Agility",
  "Subtlety Rogue": "Agility",
  "Elemental Shaman": "Intellect",
  "Enhancement Shaman": "Agility",
  "Restoration Shaman": "Intellect",
  "Affliction Warlock": "Intellect",
  "Demonology Warlock": "Intellect",
  "Destruction Warlock": "Intellect",
  "Arms Warrior": "Strength",
  "Fury Warrior": "Strength",
  "Protection Warrior": "Strength",
}));
const EXPECTED_ARMOR_BY_CLASS = {
  Priest: "Cloth", Mage: "Cloth", Warlock: "Cloth",
  Rogue: "Leather", Monk: "Leather", Druid: "Leather", "Demon Hunter": "Leather",
  Hunter: "Mail", Shaman: "Mail", Evoker: "Mail",
  Warrior: "Plate", Paladin: "Plate", "Death Knight": "Plate",
};

const slug = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const roleSlug = (r) => (/tank/i.test(r) ? "tank" : /heal/i.test(r) ? "healing" : "dps");

async function fetchText(url, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (wow-s2-gearing)" } });
      if (r.ok) return await r.text();
    } catch { /* retry below */ }
    if (attempt < tries) await new Promise((resolve) => setTimeout(resolve, attempt * 400));
  }
  return null;
}

// ---------------------------------------------------------------- inputs
const tracker = JSON.parse(await readFile(TRACKER, "utf8"));
const raid = JSON.parse(await readFile(join(ROOT, "data", "raid-items.json"), "utf8"));
const PROF = JSON.parse(await readFile(join(ROOT, "data", "weapon-proficiency.json"), "utf8"));
const OVERRIDES = JSON.parse(await readFile(join(ROOT, "data", "stat-priority-overrides.json"), "utf8"));
const BASELINE = JSON.parse(await readFile(join(ROOT, "data", "stat-priority-baseline.json"), "utf8"));
if (OVERRIDES._patch !== EXPECTED_LIVE_PATCH || !OVERRIDES.overrides
  || typeof OVERRIDES.overrides !== "object")
  throw new Error(`stat-priority-overrides.json must contain patch ${EXPECTED_LIVE_PATCH} overrides`);
if (BASELINE.schemaVersion !== 1 || BASELINE.patch !== EXPECTED_LIVE_PATCH || !BASELINE.priorities)
  throw new Error(`stat-priority-baseline.json must contain a reviewed ${EXPECTED_LIVE_PATCH} priority roster`);

// armour type per class, straight from the tier tokens we harvested
const ARMOR_BY_CLASS = {};
for (const b of raid.bosses) {
  for (const it of b.items) {
    if (!it.classes) continue;
    const armor = /woven/i.test(it.name) ? "Cloth" : /cured/i.test(it.name) ? "Leather"
      : /cast/i.test(it.name) ? "Mail" : /forged/i.test(it.name) ? "Plate" : null;
    if (!armor) continue;
    for (const c of it.classes) ARMOR_BY_CLASS[c.trim()] = armor;
  }
}
console.log("armour map derived from tier tokens:", ARMOR_BY_CLASS);
const armorDrift = Object.entries(EXPECTED_ARMOR_BY_CLASS)
  .filter(([className, armor]) => ARMOR_BY_CLASS[className] !== armor)
  .map(([className, armor]) => `${className}=${ARMOR_BY_CLASS[className] || "missing"} (expected ${armor})`);
const unknownArmorClasses = Object.keys(ARMOR_BY_CLASS).filter((className) => !EXPECTED_ARMOR_BY_CLASS[className]);
if (armorDrift.length || unknownArmorClasses.length)
  throw new Error(`tier-token armor map drift: ${armorDrift.concat(unknownArmorClasses.map((name) => `unexpected ${name}`)).join(", ")}`);

// ---------------------------------------------------------------- build
const trackerKeys = tracker.map((s) => `${s.spec} ${s.class}`);
const unknownPrimary = trackerKeys.filter((key) => !PRIMARY_BY_SPEC.has(key));
const obsoletePrimary = [...PRIMARY_BY_SPEC.keys()].filter((key) => !trackerKeys.includes(key));
if (unknownPrimary.length || obsoletePrimary.length) {
  throw new Error(`primary-stat map drift: missing=[${unknownPrimary.join(", ")}] obsolete=[${obsoletePrimary.join(", ")}]`);
}
const weaponKeys = Object.keys(PROF.specLoadouts || {});
const unknownWeapons = trackerKeys.filter((key) => !weaponKeys.includes(key));
const obsoleteWeapons = weaponKeys.filter((key) => !trackerKeys.includes(key));
if (unknownWeapons.length || obsoleteWeapons.length) {
  throw new Error(`weapon-loadout map drift: missing=[${unknownWeapons.join(", ")}] obsolete=[${obsoleteWeapons.join(", ")}]`);
}
const obsoleteOverrides = Object.keys(OVERRIDES.overrides).filter((key) => !trackerKeys.includes(key));
if (obsoleteOverrides.length)
  throw new Error(`stat-priority override map has unknown specs: ${obsoleteOverrides.join(", ")}`);
const contextualKeys = BASELINE.contextualProfileSpecs || [];
const missingContextual = contextualKeys.filter((key) => !OVERRIDES.overrides[key]);
const unexpectedContextual = Object.keys(OVERRIDES.overrides).filter((key) => !contextualKeys.includes(key));
if (missingContextual.length || unexpectedContextual.length)
  throw new Error(`stat-priority contextual roster drift: missing=[${missingContextual.join(", ")}] unexpected=[${unexpectedContextual.join(", ")}]`);
const baselineKeys = Object.keys(BASELINE.priorities);
const missingBaseline = trackerKeys.filter((key) => !baselineKeys.includes(key));
const obsoleteBaseline = baselineKeys.filter((key) => !trackerKeys.includes(key));
if (missingBaseline.length || obsoleteBaseline.length)
  throw new Error(`stat-priority review baseline drift: missing=[${missingBaseline.join(", ")}] obsolete=[${obsoleteBaseline.join(", ")}]`);

const out = [];
let ok = 0;
const failed = [];
for (const s of tracker) {
  const url = `https://www.icy-veins.com/wow/${slug(s.spec)}-${slug(s.class)}-pve-${roleSlug(s.role)}-stat-priority`;
  const html = await fetchText(url);
  let { priority, patch } = html ? extractPriority(html) : { priority: null, patch: null };

  const key = `${s.spec} ${s.class}`;
  const primary = PRIMARY_BY_SPEC.get(key);
  if (!html) failed.push(`${key}: source fetch failed`);
  if (html && patch !== EXPECTED_LIVE_PATCH)
    failed.push(`${key}: expected article patch ${EXPECTED_LIVE_PATCH}, got ${patch || "none"}`);

  // Manual profiles are authoritative for sources with multiple build/content lists.
  // Apply them even when the generic scraper found one valid list, otherwise the first
  // list on the page silently wins and all other contexts disappear.
  const ov = OVERRIDES.overrides[key];
  if (ov) {
    if (ov.primary && ov.primary !== primary)
      failed.push(`${key}: override primary ${ov.primary} conflicts with ${primary}`);
    priority = { primary, secondaries: ov.secondaries };
    patch = ov.patch || OVERRIDES._patch || patch;
  } else if (priority) {
    priority.primary = primary;
  }
  const statSource = ov?.source || url;
  const variants = ov?.variants?.map((variant) => ({
    ...variant,
    patch: variant.patch || patch,
    source: variant.source || statSource,
  })) || null;
  const secondaries = priority?.secondaries || [];
  const expectedSecondaries = new Set(["Crit", "Haste", "Mast", "Vers"]);
  const complete = priority?.primary === primary
    && secondaries.length === 4
    && new Set(secondaries).size === 4
    && secondaries.every((stat) => expectedSecondaries.has(stat));
  if (complete) ok++; else failed.push(`${key}: incomplete priority ${JSON.stringify(priority)}`);
  if (patch !== EXPECTED_LIVE_PATCH)
    failed.push(`${key}: generated priority patch must be ${EXPECTED_LIVE_PATCH}, got ${patch || "none"}`);
  if (!/^https:\/\//.test(statSource)) failed.push(`${key}: stat source is not a direct HTTPS URL`);
  const reviewed = BASELINE.priorities[key];
  if (reviewed.primary !== priority?.primary
    || JSON.stringify(reviewed.secondaries) !== JSON.stringify(priority?.secondaries)
    || reviewed.source !== statSource)
    failed.push(`${key}: priority changed from the reviewed baseline; audit the source before updating the baseline`);
  for (const variant of variants || []) {
    const stats = variant.secondaries || [];
    if (!variant.name || variant.patch !== EXPECTED_LIVE_PATCH || !/^https:\/\//.test(variant.source || "")
      || stats.length !== 4 || new Set(stats).size !== 4
      || stats.some((stat) => !expectedSecondaries.has(stat)))
      failed.push(`${key}: invalid stat profile ${variant.name || "unnamed"}`);
  }

  // class name in Class Tracker vs token list ("Death Knight" both sides, "Demon Hunter" -> "DH" handled below)
  const armor = ARMOR_BY_CLASS[s.class]
    ?? ARMOR_BY_CLASS[s.class.replace("Demon Hunter", "Demon Hunter")]
    ?? null;
  if (!armor) failed.push(`${key}: armor type could not be derived from tier tokens`);

  const weaponSpec = PROF.specLoadouts[key];
  if (weaponSpec.primaryStat !== primary)
    failed.push(`${key}: weapon primary ${weaponSpec.primaryStat || "none"} conflicts with ${primary}`);
  const weaponLoadouts = (weaponSpec.loadouts || []).filter((loadout) =>
    (loadout.patchContexts || weaponSpec.patchContexts || []).includes(WEAPON_PATCH_CONTEXT));
  if (!weaponLoadouts.length) failed.push(`${key}: no weapon loadout for ${WEAPON_PATCH_CONTEXT}`);
  if (!(weaponSpec.sourceUrls || []).length || weaponSpec.sourceUrls.some((source) => !/^https:\/\//.test(source)))
    failed.push(`${key}: missing direct weapon source URL`);

  out.push({
    class: s.class, spec: s.spec, role: s.role,
    armor,
    weaponLoadouts,
    weaponLoadoutPatchContext: WEAPON_PATCH_CONTEXT,
    weaponLoadoutSources: weaponSpec.sourceUrls,
    weaponLoadoutNote: weaponSpec.notes || null,
    weaponPrimaryStatExceptions: PROF.primaryStatExceptions || null,
    statPriority: priority,
    statPriorityVariants: variants,
    statPriorityNote: ov ? [ov.note, ov.caveat].filter(Boolean).join(" ") || null : null,
    statPriorityPatch: patch,
    statPrioritySource: priority ? statSource : null,
    tierSet: s.tierSet ?? null,
    // `ratings` is deliberately NOT copied (2026-08-08). Nothing in gearing reads it — not
    // the app, not validate-data, not a test — and 27 of 40 copies had drifted from the
    // tracker. A payload field that is silently wrong and rendered nowhere is a lie waiting
    // for a future surface to start believing it. Read ratings from the tracker.
  });
  process.stdout.write(priority ? "." : "x");
}
console.log("");

if (failed.length) {
  throw new Error(`refusing to overwrite data/specs.json:\n  ${failed.join("\n  ")}`);
}

const doc = {
  source: "WoW Class Tracker data/specs.json (class, spec, role, tier set) + Icy Veins stat-priority pages",
  harvestedAt: new Date().toISOString().slice(0, 10),
  caveat: "Icy Veins publishes LIVE-patch stat priorities. Season 2 (12.1) priorities are not published yet; treat ordering as a proxy.",
  weaponProficiencyProvenance: PROF._provenance,
  armorByClass: ARMOR_BY_CLASS,
  counts: {
    specs: out.length, withPriority: ok,
    withArmor: out.filter((x) => x.armor).length,
    withWeaponLoadouts: out.filter((x) => x.weaponLoadouts.length).length,
  },
  specs: out,
};
await writeFile(join(ROOT, "data", "specs.json"), JSON.stringify(doc, null, 2), "utf8");

console.log(`\nwrote data/specs.json`);
console.log(`  ${out.length} specs · ${ok} with stat priority · ${doc.counts.withArmor} with armour type · ${doc.counts.withWeaponLoadouts} with weapon loadouts`);
if (failed.length) console.log(`  no priority found for: ${failed.join(", ")}`);
