// Deterministic spec-capability sync. No network requests are made here.
// Active Season 2 guide priorities are refreshed by harvest-guide-*.mjs.
// The reviewed 12.0.7 fallback remains unchanged and keeps its original review date.
import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LEGACY_PATCH = "12.0.7";
const WEAPON_PATCH_CONTEXT = "12.1-live";

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

const keyOf = (s) => `${s.spec} ${s.class}`;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const digest = (data) => createHash("sha256").update(JSON.stringify(data)).digest("hex");
const validDate = (date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
  && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
const sourceDate = (date) => validDate(date) ? date : null;
const trackerScope = (tracker) => tracker.map((s) => ({
  class: s.class, spec: s.spec, role: s.role, tierSet: s.tierSet ?? null,
}));

function assertRoster(keys, expected, label) {
  const missing = expected.filter((key) => !keys.includes(key));
  const unexpected = keys.filter((key) => !expected.includes(key));
  if (new Set(keys).size !== keys.length || missing.length || unexpected.length)
    throw new Error(`${label} roster drift: missing=[${missing}] unexpected=[${unexpected}] or duplicate keys`);
}

export async function loadSpecSyncInputs({ root = ROOT,
  trackerPath = process.env.WOW_CLASS_TRACKER_SPECS || join(root, "..", "data", "specs.json") } = {}) {
  const paths = { tracker: trackerPath, raid: join(root, "data", "raid-items.json"),
    weapons: join(root, "data", "weapon-proficiency.json"),
    overrides: join(root, "data", "stat-priority-overrides.json"),
    baseline: join(root, "data", "stat-priority-baseline.json") };
  return Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([key, path]) =>
    [key, JSON.parse(await readFile(path, "utf8"))])));
}

export function buildSpecSync(inputs, { checkedAt = new Date().toISOString().slice(0, 10) } = {}) {
  const { tracker, raid, weapons, overrides, baseline } = inputs;
  if (!validDate(checkedAt)) throw new Error("structural sync needs a valid checkedAt date");
  if (!Array.isArray(tracker)) throw new Error("tracker roster must be an array");
  const keys = tracker.map(keyOf);
  assertRoster(keys, [...PRIMARY_BY_SPEC.keys()], "tracker/primary-stat");
  if (tracker.some((s) => !["DPS", "Healer", "Tank"].includes(s.role)))
    throw new Error("tracker roster contains an invalid role");
  if (baseline?.schemaVersion !== 1 || baseline.patch !== LEGACY_PATCH || !baseline.priorities
    || !validDate(baseline.reviewedAt)) throw new Error("reviewed legacy priority baseline is missing or malformed");
  if (overrides?._patch !== LEGACY_PATCH || !overrides.overrides)
    throw new Error("legacy priority overrides are missing or have the wrong patch");
  if (weapons?._schemaVersion !== 2 || !weapons.specLoadouts || !weapons._provenance)
    throw new Error("reviewed weapon-proficiency source is missing or malformed");
  assertRoster(Object.keys(baseline.priorities), keys, "legacy baseline");
  assertRoster(Object.keys(overrides.overrides), baseline.contextualProfileSpecs || [], "legacy contextual");
  assertRoster(Object.keys(weapons.specLoadouts), keys, "weapon-loadout");

  const armorByClass = {};
  const tokens = [];
  for (const boss of raid?.bosses || []) for (const item of boss.items || []) {
    if (!Array.isArray(item.classes)) continue;
    const armor = /woven/i.test(item.name) ? "Cloth" : /cured/i.test(item.name) ? "Leather"
      : /cast/i.test(item.name) ? "Mail" : /forged/i.test(item.name) ? "Plate" : null;
    if (!armor) continue;
    tokens.push({ id: item.id, name: item.name, classes: item.classes });
    for (const className of item.classes.map((c) => c.trim())) {
      if (armorByClass[className] && armorByClass[className] !== armor)
        throw new Error(`conflicting tier-token armor for ${className}`);
      armorByClass[className] = armor;
    }
  }
  assertRoster(Object.keys(armorByClass), Object.keys(EXPECTED_ARMOR_BY_CLASS), "tier-token armor");
  for (const [className, armor] of Object.entries(EXPECTED_ARMOR_BY_CLASS))
    if (armorByClass[className] !== armor) throw new Error(`tier-token armor drift for ${className}`);

  const secondariesOk = (stats) => Array.isArray(stats) && stats.length === 4
    && new Set(stats).size === 4 && stats.every((s) => ["Crit", "Haste", "Mast", "Vers"].includes(s));
  const specs = tracker.map((s) => {
    const key = keyOf(s), primary = PRIMARY_BY_SPEC.get(key);
    const reviewed = baseline.priorities[key], ov = overrides.overrides[key];
    if (reviewed.primary !== primary || !secondariesOk(reviewed.secondaries)
      || !/^https:\/\//.test(reviewed.source || "")) throw new Error(`${key}: invalid reviewed priority`);
    if (ov && (ov.primary !== primary || !same(ov.secondaries, reviewed.secondaries)
      || ov.source !== reviewed.source || (ov.patch || overrides._patch) !== LEGACY_PATCH))
      throw new Error(`${key}: contextual priority drifted from reviewed baseline`);
    const variants = ov?.variants?.map((v) => ({ ...v,
      patch: v.patch || LEGACY_PATCH, source: v.source || reviewed.source })) || null;
    if ((variants || []).some((v) => !v.name || v.patch !== LEGACY_PATCH
      || !/^https:\/\//.test(v.source || "") || !secondariesOk(v.secondaries)))
      throw new Error(`${key}: invalid reviewed contextual priority`);
    const weaponSpec = weapons.specLoadouts[key];
    const weaponLoadouts = (weaponSpec.loadouts || []).filter((l) =>
      (l.patchContexts || weaponSpec.patchContexts || []).includes(WEAPON_PATCH_CONTEXT));
    if (weaponSpec.primaryStat !== primary || !weaponLoadouts.length
      || !(weaponSpec.sourceUrls || []).length
      || weaponSpec.sourceUrls.some((url) => !/^https:\/\//.test(url)))
      throw new Error(`${key}: invalid reviewed weapon capability`);
    return {
      class: s.class, spec: s.spec, role: s.role, armor: armorByClass[s.class],
      weaponLoadouts, weaponLoadoutPatchContext: WEAPON_PATCH_CONTEXT,
      weaponLoadoutSources: weaponSpec.sourceUrls, weaponLoadoutNote: weaponSpec.notes || null,
      weaponPrimaryStatExceptions: weapons.primaryStatExceptions || null,
      statPriority: { primary: reviewed.primary, secondaries: reviewed.secondaries },
      statPriorityVariants: variants,
      statPriorityNote: ov ? [ov.note, ov.caveat].filter(Boolean).join(" ") || null : null,
      statPriorityPatch: LEGACY_PATCH, statPrioritySource: reviewed.source,
      tierSet: s.tierSet ?? null,
    };
  });
  // Digests describe only the fields consumed, so a ratings/metrics refresh does not
  // invalidate structural sync. Source dates remain the dates of the recorded evidence;
  // checkedAt attests local consistency only, never a new visit to an external source.
  return {
    source: "Local tracker roster and tier sets + reviewed tier-token armor and weapon capabilities",
    harvestedAt: baseline.reviewedAt,
    caveat: "Current stat priorities come from the Season 2 guide harvest (Icy Veins / Wowhead / Method). The statPriority field here is the reviewed 12.0.7 fallback, used only when the guide layer lacks a build. Structural sync checks local inputs; it does not reverify external game facts.",
    structuralSync: { schemaVersion: 1, checkedAt, sources: {
      tracker: { path: "data/specs.json", digest: digest(trackerScope(tracker)),
        scope: "class, spec, role, tierSet; each tier set retains its own source and asOf" },
      armor: { path: "gearing/data/raid-items.json", digest: digest(tokens),
        asOf: sourceDate(raid.harvestedAt), scope: "tier-token item id, name and class lists" },
      weapons: { path: "gearing/data/weapon-proficiency.json", digest: digest(weapons),
        asOf: sourceDate(weapons.patchContexts?.[WEAPON_PATCH_CONTEXT]?.asOf), scope: WEAPON_PATCH_CONTEXT },
    } },
    legacyPriority: { patch: LEGACY_PATCH, reviewedAt: baseline.reviewedAt,
      baselineDigest: digest(baseline), overridesDigest: digest(overrides),
      provenance: baseline.provenance },
    weaponProficiencyProvenance: weapons._provenance, armorByClass,
    counts: { specs: specs.length, withPriority: specs.length, withArmor: specs.length,
      withWeaponLoadouts: specs.length }, specs,
  };
}

// Re-derive rather than trusting the receipt date or a claimed digest. A heartbeat can
// enforce checkedAt age separately after this proves current inputs and output agree.
export function checkSpecSync(doc, inputs) {
  if (doc?.structuralSync?.schemaVersion !== 1 || !validDate(doc.structuralSync.checkedAt))
    throw new Error("spec capabilities have no valid structural sync receipt; run gearing/src/harvest-specs.mjs");
  const expected = buildSpecSync(inputs, { checkedAt: doc.structuralSync.checkedAt });
  if (!same(doc, expected)) throw new Error("spec capability sync or its recorded provenance is stale; run gearing/src/harvest-specs.mjs");
  return { checkedAt: doc.structuralSync.checkedAt, specs: doc.specs.length,
    legacyReviewedAt: doc.legacyPriority.reviewedAt };
}

export async function runSpecSync({ root = ROOT, trackerPath, check = false, checkedAt } = {}) {
  const inputs = await loadSpecSyncInputs({ root, trackerPath });
  const outputPath = join(root, "data", "specs.json");
  if (check) return checkSpecSync(JSON.parse(await readFile(outputPath, "utf8")), inputs);
  const doc = buildSpecSync(inputs, { checkedAt });
  const serialized = JSON.stringify(doc, null, 2) + "\n";
  let before;
  try { before = await readFile(outputPath, "utf8"); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (before !== serialized) {
    const temp = outputPath + ".tmp";
    await writeFile(temp, serialized, "utf8");
    await rename(temp, outputPath);
  }
  return { changed: before !== serialized, checkedAt: doc.structuralSync.checkedAt,
    specs: doc.specs.length, legacyReviewedAt: doc.legacyPriority.reviewedAt };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.slice(2).some((arg) => arg !== "--check")) throw new Error("usage: node gearing/src/harvest-specs.mjs [--check]");
  const result = await runSpecSync({ check: process.argv.includes("--check") });
  console.log(`${result.specs} spec capabilities checked ${result.checkedAt}; legacy fallback remains reviewed ${result.legacyReviewedAt}`);
}
