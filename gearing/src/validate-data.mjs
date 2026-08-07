import { createHash } from "node:crypto";
import { verifyCurationSourceFiles } from "./validate-curation-sources.mjs";

const SECONDARIES = new Set(["Crit", "Haste", "Mast", "Vers"]);
const PRIMARIES = new Set(["Agility", "Intellect", "Strength"]);
const ARMOR_TYPES = new Set(["Cloth", "Leather", "Mail", "Plate"]);
const ARMOR_SLOTS = new Set(["Head", "Shoulder", "Chest", "Wrist", "Hands", "Waist", "Legs", "Feet"]);
const TIER_SLOTS = new Set(["Head", "Shoulder", "Chest", "Hands", "Legs"]);
const APPEARANCE_ONLY_CATALYST_SLOTS = new Set(["Back", "Wrist", "Waist", "Feet"]);
const TIER_SETS = {
  "Death Knight": [2055, "Baleful Grave-Knight's Crucible"],
  "Demon Hunter": [2056, "Abyssal Doomhound's Pursuit"],
  Druid: [2057, "Bark of the Enigmatic Dreamwatcher"], Evoker: [2058, "Echo of Calamity"],
  Hunter: [2059, "Skulking Viper's Ambush"], Mage: [2060, "Primal Leywarden's Attire"],
  Monk: [2061, "Guile of the Monkey King"], Paladin: [2062, "Radiance of the Consecrated Flame"],
  Priest: [2063, "Cosmic Penitent's Raiment"], Rogue: [2064, "Chosen Bloodslayer's Hexweave"],
  Shaman: [2065, "Ophidian Oracle's Prophecy"],
  Warlock: [2066, "Damned Necrolyte's Shattered Restraints"],
  Warrior: [2067, "Jade Warlord's Dominion"],
};
const MAPPED_VENOMCURSED_ITEMS = new Set(["271874", "271875", "271876", "271878"]);
const CATALYST_SOURCES = {
  blizzardPatchNotes: "https://us.forums.blizzard.com/en/wow/t/midnight-curse-of-ulatek-ptr-development-notes/2317811/1",
  blizzardRewardChanges: "https://us.forums.blizzard.com/en/wow/t/curse-of-ulatek-endgame-reward-changes/2317450/1",
  catalystGuide: "https://www.wowhead.com/ptr/guide/midnight/matrix-catalyst-crafting-tier-set",
  chargeTooltip: "https://www.wowhead.com/ptr/currency=3465/venomblight-manaflux",
  chargeUpdate: "https://www.wowhead.com/news/catalyst-tooltips-updated-acquisition-now-works-similar-to-midnight-season-1-382051",
  serpentScionAchievement: "https://www.wowhead.com/ptr/achievement=62872/midnight-season-2-serpent-scion",
};
const TIER_OVERVIEW = "https://www.wowhead.com/guide/midnight/season-2-tier-set-bonus-appearance-overview";
const CATALYST_ALLOCATION_DIGEST = "7c0e02b0da5e7148a769a16143db0b5314d29f737968f265be47918912501a82";
const ITEM_PRIMARIES = new Set(["Agi", "Int", "Str", "Agi/Int", "Agi/Str", "Str/Int", "Any"]);
const ARMOR_PRIMARY = { Cloth: "Int", Leather: "Agi/Int", Mail: "Agi/Int", Plate: "Str/Int" };
const ARMOR_BY_CLASS = {
  Priest: "Cloth", Mage: "Cloth", Warlock: "Cloth",
  Rogue: "Leather", Monk: "Leather", Druid: "Leather", "Demon Hunter": "Leather",
  Hunter: "Mail", Shaman: "Mail", Evoker: "Mail",
  Warrior: "Plate", Paladin: "Plate", "Death Knight": "Plate",
};
const WEAPON_TYPES = new Set(["Dagger", "Sword", "Axe", "Mace", "Staff", "Bow", "Gun",
  "Crossbow", "Fist Weapon", "Polearm", "Warglaive", "Wand", "Shield"]);
const WEAPON_SLOTS = new Set(["Main Hand", "One-Hand", "Two-Hand", "Off Hand", "Held In Off-hand", "Ranged"]);
const PRIMARY_NEUTRAL_SLOTS = new Set(["Neck", "Finger", "Back", "Trinket"]);
const WEAPON_PATCH_CONTEXT = "ptr-12.1.0";
const SIMC_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SIMC_BUILD_SOURCE = "https://github.com/simulationcraft/simc/tree/midnight/profiles/MID2";
const SIMC_ARTIFACT_PREFIX = "https://github.com/simulationcraft/simc-publish/actions/runs/";
const SIMC_GENERATOR_PREFIX = "https://github.com/simulationcraft/simc/blob/";
const SIMC_SPEC_STATUSES = new Set(["accepted", "pending", "deferred", "unsupported"]);
const SIMC_ELIGIBILITY = new Set(["eligible", "deferred", "unsupported"]);
const SIMC_PROFILE_STATUSES = new Set(["accepted", "ready", "pending", "rejected"]);
const SIMC_SOURCE_MODES = new Set(["official-output", "curated-same-gear"]);
const SIMC_SELECTION_MODES = new Set(["single-actor", "same-gear-dps"]);
const HEALER_REFERENCE_OBJECTIVE = "healing-throughput";
const HEALER_REFERENCE_SCENARIOS = new Set(["raid", "mplus"]);
const HEALER_REFERENCE_STATUSES = new Set(["accepted", "pending", "rejected"]);
const HEALER_PROVIDER_STATUSES = new Set(["permission-required-pending", "approved", "rejected"]);
const HEALER_CATALYST_STATUSES = new Set(["validation-required", "validated"]);
const HEALER_SCORING_BASIS_KINDS = new Set(["secondary-weights", "item-scores"]);
// A "complete" pool cannot be trusted until the validator can derive its exact
// spec/scenario candidate set. Partial, explicit item IDs are the only admitted v1 shape.
const HEALER_ITEM_COVERAGE = new Set(["listed-items-only"]);
const HEALER_ITEM_SCORE_CONTEXT = {
  comparison: "equal-item-level",
  gearSet: "fixed-reference-set",
  catalyst: "retained-item-contribution",
};
const HEALER_PROVIDER = {
  id: "questionably-epic",
  name: "Questionably Epic",
  sourceUrl: "https://questionablyepic.com/live/",
  repositoryUrl: "https://github.com/Voulk/QuestionablyEpic",
  stagingPrUrl: "https://github.com/Voulk/QuestionablyEpic/pull/1748",
};
const CURATION_GEAR_DATA_FILES = new Set([
  "data/raid-items.json", "data/dungeon-items.json", "data/tier-items.json",
  "data/catalyst-stat-allocations.json",
]);
const EXPECTED_STAT_OVERRIDE_KEYS = new Set([
  "Blood Death Knight", "Devourer Demon Hunter", "Guardian Druid", "Restoration Druid",
  "Beast Mastery Hunter", "Survival Hunter", "Brewmaster Monk", "Holy Paladin",
  "Protection Paladin", "Discipline Priest", "Holy Priest", "Shadow Priest", "Outlaw Rogue",
  "Subtlety Rogue", "Enhancement Shaman",
]);
const EXPECTED_TRINKET_RULE_IDS = new Set([
  "158368", "159618", "193748", "193762", "250214", "250224", "250229", "250243",
  "250244", "250248", "250254", "250255", "270160", "270161", "270162", "270168",
  "270169", "270170", "270171", "270174", "270175", "273794",
]);
const EXPECTED_KEY_LEVELS = [
  { key: "Mythic 0", end: 292, vault: 302 }, { key: "+2", end: 295, vault: 305 },
  { key: "+3", end: 295, vault: 305 }, { key: "+4", end: 298, vault: 308 },
  { key: "+5", end: 302, vault: 308 }, { key: "+6", end: 305, vault: 311 },
  { key: "+7", end: 305, vault: 315 }, { key: "+8", end: 308, vault: 315 },
  { key: "+9", end: 308, vault: 315 }, { key: "+10 and above", end: 311, vault: 318 },
];
const EXPECTED_SHEET_ONLY = ["world", "crafted", "venomstone", "delveCoffer", "delveTrove",
  "delveVault", "raidVault"];
const EXPECTED_RAID_LEVELS = {
  1: [279, 292, 305, 318], 2: [282, 295, 308, 321], 3: [282, 295, 308, 321],
  4: [285, 298, 311, 324], 5: [285, 298, 311, 324], 6: [285, 298, 311, 324],
  7: [289, 302, 315, 344], 8: [289, 302, 315, 344],
};

function duplicateAssignments(groups, allow = []) {
  const allowed = new Set(allow.map(String));
  const seen = new Map();
  for (const group of groups) {
    for (const item of group.items || []) {
      const id = String(item.id);
      if (!seen.has(id)) seen.set(id, []);
      seen.get(id).push(group.name);
    }
  }
  return [...seen.entries()]
    .filter(([id, names]) => names.length > 1 && !allowed.has(id))
    .map(([id, names]) => `${id} (${names.join(", ")})`);
}

function validateItemRatings(item, where, errors) {
  const secondaries = item.secondaries || [];
  if (secondaries.some((stat) => !SECONDARIES.has(stat))
    || new Set(secondaries).size !== secondaries.length)
    errors.push(`${where}: ${item.id} ${item.name} has invalid secondary stats`);
  const ratings = item.secondaryRatings || {};
  if (Object.keys(ratings).some((stat) => !SECONDARIES.has(stat) || !secondaries.includes(stat)))
    errors.push(`${where}: ${item.id} ${item.name} has unexpected rating keys`);
  if (!secondaries.length) return;
  const missing = secondaries.filter((stat) => !Number.isFinite(ratings[stat]) || ratings[stat] <= 0);
  if (missing.length) errors.push(`${where}: ${item.id} ${item.name} lacks rating amounts for ${missing.join(", ")}`);
}

function validateInstanceStats(item, where, errors) {
  const tertiaries = item.tertiaries || [];
  const ratings = item.tertiaryRatings || {};
  const allowed = new Set(["Leech", "Avoidance", "Speed", "Indestructible"]);
  if (!Array.isArray(item.tertiaries) || !item.tertiaryRatings || !Array.isArray(item.sockets))
    errors.push(`${where}: ${item.id} ${item.name} lacks tertiary/socket metadata`);
  if (tertiaries.some((stat) => !allowed.has(stat)) || new Set(tertiaries).size !== tertiaries.length
    || Object.keys(ratings).some((stat) => !tertiaries.includes(stat)
      || !allowed.has(stat) || stat === "Indestructible")
    || tertiaries.some((stat) => stat !== "Indestructible"
      && (!Number.isFinite(ratings[stat]) || ratings[stat] <= 0)))
    errors.push(`${where}: ${item.id} ${item.name} has invalid tertiary metadata`);
  if ((item.sockets || []).some((socket) => typeof socket !== "string" || !socket))
    errors.push(`${where}: ${item.id} ${item.name} has invalid socket metadata`);
}

function validateCatalystAndTier(catalyst, tier, catalystAllocations, raidGroups, dungeonGroups, errors) {
  if (catalyst?.schemaVersion !== 1 || catalyst?.patchContext !== WEAPON_PATCH_CONTEXT
    || catalyst?.season !== 2)
    errors.push("catalyst rules are missing or have the wrong patch/schema");
  if (!sameSet(new Set(catalyst?.setBonusSlots || []), TIER_SLOTS)
    || !sameSet(new Set(catalyst?.appearanceOnlySlots || []), APPEARANCE_ONLY_CATALYST_SLOTS))
    errors.push("catalyst slot policy changed without review");
  if (catalyst?.eligibility?.pveMinimumTrack !== "Veteran"
    || catalyst?.eligibility?.seasonalPvpEligible !== true
    || catalyst?.eligibility?.professionCraftedEligible !== false
    || catalyst?.eligibility?.chargeCost !== 1
    || !sameSet(new Set(catalyst?.eligibility?.modeledSources || []), new Set(["raid", "mplus"])))
    errors.push("catalyst eligibility policy changed without review");
  const preservation = catalyst?.preservation || {};
  if (preservation.secondaryStats !== "confirmed" || preservation.tertiaryStats !== "confirmed"
    || preservation.specialEffects !== "certain-effects-confirmed"
    || preservation.itemLevel !== "established-current-behavior"
    || preservation.upgradeTrack !== "established-current-behavior"
    || preservation.sockets !== "expected-preview-required")
    errors.push("catalyst stat/effect preservation policy changed without review");
  if (!sameSet(new Set((catalyst?.mappedVenomcursedItemIds || []).map(String)), MAPPED_VENOMCURSED_ITEMS))
    errors.push("mapped Venomcursed item roster changed without review");
  if (!sameJson(catalyst?.sources, CATALYST_SOURCES) || !catalyst?.caveat)
    errors.push("catalyst rules lack review caveats or direct sources");
  const charges = catalyst?.chargeSystem || {};
  if (charges.currency !== "Venomblight Manaflux" || charges.passiveCadenceWeeks !== 2
    || charges.cap !== 8
    || charges.confidence !== "current-ptr-tooltips-not-final"
    || !sameJson(charges.bonusDropsAfterCatalystUnbound,
      ["Mythic+", "Season 2 raid bosses", "Bountiful Delves", "Rated PvP"])
    || !sameJson(charges.catalystUnbound, {
      requirement: "first 4-piece class-set bonus", scope: "character", unlocksBonusDrops: true,
    })
    || !sameJson(charges.serpentScion, {
      bonusCharges: 1,
      scope: "current character",
      criteriaAnyOf: [
        "2,000+ Mythic+ rating", "1,600+ Rated PvP rating", "Defeat Ula'tek on Heroic or Mythic",
      ],
    }))
    errors.push("Catalyst charge policy changed without review");

  const potentialBases = [
    ...raidGroups.flatMap((boss) => (boss.items || []).map((item) => ({
      item, category: "base", sourceKind: "raid", sourceKey: String(boss.boss), tierClass: null,
    }))),
    ...dungeonGroups.flatMap((dungeon) => (dungeon.items || []).map((item) => ({
      item, category: "base", sourceKind: "mplus", sourceKey: dungeon.name, tierClass: null,
    }))),
  ].filter(({item}) => TIER_SLOTS.has(item.slot) && ARMOR_TYPES.has(item.type));
  if (potentialBases.length !== 94 || new Set(potentialBases.map(({item}) => String(item.id))).size !== 94)
    errors.push(`expected 94 unique modeled Catalyst bases, found ${potentialBases.length}`);
  const effectBases = potentialBases.filter(({item}) => item.effect).map(({item}) => String(item.id));
  if (!sameSet(new Set(effectBases), MAPPED_VENOMCURSED_ITEMS))
    errors.push("effect-bearing Catalyst base roster changed without review");

  const sets = tier?.sets || [];
  const tierItems = sets.flatMap((set) => set.items || []);
  if (tier?.schemaVersion !== 1 || tier?.patchContext !== WEAPON_PATCH_CONTEXT
    || tier?.counts?.sets !== 13 || tier?.counts?.items !== 65
    || sets.length !== 13 || tierItems.length !== 65)
    errors.push("direct-tier dataset is missing or has stale counts");
  if (tier?.overviewUrl !== TIER_OVERVIEW
    || tier?.referenceSnapshot?.ilvl !== 334 || tier?.referenceSnapshot?.track !== "Myth 6/6"
    || new Set(tierItems.map((item) => String(item.id))).size !== 65)
    errors.push("direct-tier source or item identities are invalid");
  if (!sameSet(new Set(sets.map((set) => set.class)), new Set(Object.keys(TIER_SETS))))
    errors.push("direct-tier class roster changed without review");
  const directFingerprints = [];
  for (const set of sets) {
    const expectedSet = TIER_SETS[set.class] || [];
    if (set.setId !== expectedSet[0] || set.name !== expectedSet[1]
      || set.sourceUrl !== `https://www.wowhead.com/ptr/item-set=${set.setId}`)
      errors.push(`${set.class || "unknown"}: invalid direct-tier set identity`);
    if (!sameSet(new Set((set.items || []).map((item) => item.slot)), TIER_SLOTS))
      errors.push(`${set.class || "unknown"}: direct tier does not cover all five slots`);
    for (const item of set.items || []) {
      validateItemRatings(item, `tier/${set.class}`, errors);
      validateInstanceStats(item, `tier/${set.class}`, errors);
      if (item.classes?.length !== 1 || item.classes[0] !== set.class
        || item.type !== ARMOR_BY_CLASS[set.class]
        || item.primary !== ARMOR_PRIMARY[item.type]
        || item.secondaries.length !== 2)
        errors.push(`${set.class}: ${item.id} ${item.name} has invalid direct-tier stats or class policy`);
      directFingerprints.push({
        item, category: "direct-tier", sourceKind: "direct-tier",
        sourceKey: String(set.setId), tierClass: set.class,
      });
    }
  }

  const rankedSourceFingerprints = [
    ...raidGroups.flatMap((boss) => (boss.items || []).map((item) => ({
      item,
      category: TIER_SLOTS.has(item.slot) && ARMOR_TYPES.has(item.type) ? "base" : "ranked-item",
      sourceKind: "raid", sourceKey: String(boss.boss), tierClass: null,
    }))),
    ...dungeonGroups.flatMap((dungeon) => (dungeon.items || []).map((item) => ({
      item,
      category: TIER_SLOTS.has(item.slot) && ARMOR_TYPES.has(item.type) ? "base" : "ranked-item",
      sourceKind: "mplus", sourceKey: dungeon.name, tierClass: null,
    }))),
  ].filter(({item}) => item.slot && (item.secondaries || []).length);
  const fingerprints = [...rankedSourceFingerprints, ...directFingerprints];
  const reviewed = catalystAllocations?.items || {};
  if (catalystAllocations?.schemaVersion !== 4
    || catalystAllocations?.patchContext !== WEAPON_PATCH_CONTEXT
    || catalystAllocations?.counts?.catalystBases !== 94
    || catalystAllocations?.counts?.otherRanked !== 159
    || catalystAllocations?.counts?.directTier !== 65
    || catalystAllocations?.counts?.items !== 318
    || catalystAllocations?.sourceUrlPattern
      !== "https://nether.wowhead.com/ptr/tooltip/item/{itemId}?locale=0&ilvl=1000"
    || Object.keys(reviewed).length !== 318)
    errors.push("reviewed ranked-item stat-allocation fingerprint is missing or stale");
  const actualIds = new Set(fingerprints.map(({item}) => String(item.id)));
  if (!sameSet(actualIds, new Set(Object.keys(reviewed))))
    errors.push("ranked item roster drifted from its reviewed stat-allocation fingerprint");
  for (const meta of fingerprints) {
    const item = meta.item;
    const entry = reviewed[String(item.id)];
    if (!entry) continue;
    const expectedFingerprint = {
      category: meta.category, sourceKind: meta.sourceKind, sourceKey: meta.sourceKey,
      tierClass: meta.tierClass, name: item.name, slot: item.slot, type: item.type,
      secondaries: item.secondaries, dataRatings: item.secondaryRatings,
      tertiaries: item.tertiaries, tertiaryRatings: item.tertiaryRatings, sockets: item.sockets,
      dataIlvl: item.ilvl, dataTrack: item.track, effect: item.effect, effectKind: item.effectKind,
      effects: item.effects,
    };
    const actualFingerprint = Object.fromEntries(Object.keys(expectedFingerprint)
      .map((key) => [key, entry[key]]));
    if (!sameJson(actualFingerprint, expectedFingerprint))
      errors.push(`${item.id} ${item.name}: Catalyst fingerprint drifted from reviewed data`);
    const allocations = entry.allocations || {};
    if (!sameSet(new Set(Object.keys(allocations)), new Set(item.secondaries || []))
      || Object.values(allocations).some((value) => !Number.isFinite(value) || value <= 0)
      || Object.values(allocations).reduce((sum, value) => sum + value, 0) !== 7000)
      errors.push(`${item.id} ${item.name}: invalid stable secondary allocation`);
  }
  if (catalystAllocationDigest(reviewed) !== CATALYST_ALLOCATION_DIGEST)
    errors.push("reviewed ranked-item allocation values drifted without approval");
}

const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const sameSet = (left, right) => left.size === right.size && [...left].every((value) => right.has(value));
const catalystAllocationDigest = (items) => createHash("sha256").update(JSON.stringify(
  Object.keys(items || {}).sort((left, right) => Number(left) - Number(right)).map((id) => [
    id,
    Object.entries(items[id]?.allocations || {}).sort(([left], [right]) => left.localeCompare(right)),
  ]),
)).digest("hex");

function validateGeneratedSources(rows, statOverrides, statBaseline, weaponProficiency, expectedPatch, errors) {
  const rowByKey = new Map(rows.map((row) => [`${row.spec} ${row.class}`, row]));

  if (!statOverrides || statOverrides._patch !== expectedPatch || !statOverrides.overrides) {
    errors.push("stat-priority override source is missing or has the wrong patch");
  } else {
    if (!sameSet(new Set(Object.keys(statOverrides.overrides)), EXPECTED_STAT_OVERRIDE_KEYS))
      errors.push("stat-priority contextual-profile roster changed without review");
    for (const [key, override] of Object.entries(statOverrides.overrides)) {
      const row = rowByKey.get(key);
      if (!row) {
        errors.push(`stat-priority override has unknown spec ${key}`);
        continue;
      }
      const expectedVariants = (override.variants || []).map((variant) => ({
        ...variant,
        patch: variant.patch || override.patch || statOverrides._patch,
        source: variant.source || override.source,
      }));
      const expectedNote = [override.note, override.caveat].filter(Boolean).join(" ") || null;
      if (row.statPriority?.primary !== override.primary
        || !sameJson(row.statPriority?.secondaries, override.secondaries)
        || !sameJson(row.statPriorityVariants || [], expectedVariants)
        || row.statPriorityNote !== expectedNote
        || row.statPriorityPatch !== (override.patch || statOverrides._patch)
        || row.statPrioritySource !== override.source)
        errors.push(`${key}: generated stat profile drifted from its curated source`);
    }
    for (const row of rows) {
      const key = `${row.spec} ${row.class}`;
      if (!statOverrides.overrides[key]
        && ((row.statPriorityVariants || []).length || row.statPriorityNote))
        errors.push(`${key}: generated contextual profile has no curated source entry`);
    }
  }

  const baseline = statBaseline?.priorities;
  if (statBaseline?.schemaVersion !== 1 || statBaseline?.patch !== expectedPatch || !baseline) {
    errors.push("reviewed stat-priority baseline is missing or has the wrong schema");
  } else {
    if (!sameSet(new Set(statBaseline.contextualProfileSpecs || []), EXPECTED_STAT_OVERRIDE_KEYS))
      errors.push("reviewed contextual-profile roster changed without review");
    const baselineKeys = new Set(Object.keys(baseline));
    if (baselineKeys.size !== rows.length || [...baselineKeys].some((key) => !rowByKey.has(key)))
      errors.push("reviewed stat-priority baseline does not match the 40-spec roster");
    for (const row of rows) {
      const key = `${row.spec} ${row.class}`;
      const reviewed = baseline[key];
      if (!reviewed) continue;
      if (row.statPriority?.primary !== reviewed.primary
        || !sameJson(row.statPriority?.secondaries, reviewed.secondaries)
        || row.statPrioritySource !== reviewed.source)
        errors.push(`${key}: generated stat priority changed from the reviewed baseline`);
    }
  }

  const sourceLoadouts = weaponProficiency?.specLoadouts;
  if (weaponProficiency?._schemaVersion !== 2 || !sourceLoadouts) {
    errors.push("weapon-proficiency source is missing or has the wrong schema");
    return;
  }
  const sourceKeys = Object.keys(sourceLoadouts);
  if (sourceKeys.length !== rows.length || sourceKeys.some((key) => !rowByKey.has(key)))
    errors.push("weapon-proficiency spec keys do not match generated specs");
  for (const row of rows) {
    const key = `${row.spec} ${row.class}`;
    const source = sourceLoadouts[key];
    if (!source) continue;
    const expectedLoadouts = (source.loadouts || []).filter((loadout) =>
      (loadout.patchContexts || source.patchContexts || []).includes(WEAPON_PATCH_CONTEXT));
    if (source.primaryStat !== row.statPriority?.primary
      || !sameJson(row.weaponLoadouts, expectedLoadouts)
      || !sameJson(row.weaponLoadoutSources, source.sourceUrls)
      || row.weaponLoadoutNote !== (source.notes || null)
      || !sameJson(row.weaponPrimaryStatExceptions, weaponProficiency.primaryStatExceptions || null))
      errors.push(`${key}: generated weapon loadouts drifted from their curated source`);
  }
}

function validateItemEligibility(itemEligibility, allItems, rows, errors) {
  if (!itemEligibility || itemEligibility.schemaVersion !== 1
    || itemEligibility.patchContext !== WEAPON_PATCH_CONTEXT || !itemEligibility.items) {
    errors.push("item-eligibility source is missing or has the wrong schema");
    return;
  }
  const specKeys = new Set(rows.map((row) => `${row.spec} ${row.class}`));
  const itemById = new Map(allItems.map((item) => [String(item.id), item]));
  if (!sameSet(new Set(Object.keys(itemEligibility.items)), EXPECTED_TRINKET_RULE_IDS))
    errors.push("curated trinket-eligibility roster changed without review");
  for (const [id, rule] of Object.entries(itemEligibility.items)) {
    const item = itemById.get(id);
    if (!item || item.slot !== "Trinket") errors.push(`item eligibility references unknown trinket ${id}`);
    if (!Array.isArray(rule.eligibleSpecs) || !rule.eligibleSpecs.length
      || new Set(rule.eligibleSpecs).size !== rule.eligibleSpecs.length
      || rule.eligibleSpecs.some((key) => !specKeys.has(key)))
      errors.push(`trinket ${id}: invalid eligible spec list`);
    if (!rule.note || !/^https:\/\//.test(rule.source || ""))
      errors.push(`trinket ${id}: missing eligibility note or direct source`);
  }
  for (const item of allItems.filter((candidate) => candidate.slot === "Trinket" && !candidate.primary)) {
    if (!itemEligibility.items[String(item.id)])
      errors.push(`trinket ${item.id} ${item.name} lacks explicit eligibility`);
  }
}

const isoTimestamp = (value) => typeof value === "string"
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  && Number.isFinite(Date.parse(value));
const isoDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
const hexDigest = (value) => /^[a-f0-9]{64}$/i.test(value || "");
const uniqueStrings = (values) => Array.isArray(values) && values.every((value) => typeof value === "string")
  && new Set(values).size === values.length;
const uniqueNumericStrings = (values) => uniqueStrings(values)
  && values.every((value) => /^\d+$/.test(value));

function validateHealerScoringBasis(basis, knownItemIds, where, errors) {
  if (!basis || !HEALER_SCORING_BASIS_KINDS.has(basis.kind)
    || !(typeof basis.normalization === "string" && basis.normalization.trim())) {
    errors.push(`${where}: invalid healer scoring basis`);
    return;
  }

  if (basis.kind === "secondary-weights") {
    const weights = basis.weights;
    if (!sameSet(new Set(Object.keys(basis)), new Set(["kind", "normalization", "weights"]))
      || !weights || !sameSet(new Set(Object.keys(weights)), SECONDARIES)
      || Object.values(weights).some((value) => !Number.isFinite(value) || value < 0)
      || !Object.values(weights).some((value) => value > 0))
      errors.push(`${where}: invalid healer secondary weights`);
    return;
  }

  const items = Array.isArray(basis.items) ? basis.items : [];
  const itemIds = items.map((item) => String(item?.itemId || ""));
  if (!sameSet(new Set(Object.keys(basis)),
    new Set(["kind", "normalization", "itemCoverage", "context", "items"]))
    || !HEALER_ITEM_COVERAGE.has(basis.itemCoverage)
    || !basis.context
    || !sameSet(new Set(Object.keys(basis.context)), new Set(Object.keys(HEALER_ITEM_SCORE_CONTEXT)))
    || Object.entries(HEALER_ITEM_SCORE_CONTEXT).some(([key, value]) => basis.context[key] !== value)
    || !items.length || !uniqueNumericStrings(itemIds)
    || items.some((item) => !sameSet(new Set(Object.keys(item || {})), new Set(["itemId", "score"]))
      || !knownItemIds.has(String(item?.itemId))
      || !Number.isFinite(item?.score) || item.score < 0))
    errors.push(`${where}: invalid healer item scores or item coverage`);
}

function validateHealerReferences(healerReferences, rows, knownItemIds, errors) {
  const healerRows = rows.filter((row) => row.role === "Healer");
  const healerKeys = new Set(healerRows.map((row) => `${row.spec} ${row.class}`));
  const profilesBySpec = new Map(healerRows.map((row) => [
    `${row.spec} ${row.class}`,
    new Set((row.statPriorityVariants || []).length
      ? row.statPriorityVariants.map((profile) => profile.name) : ["General"]),
  ]));
  const provider = healerReferences?.provider;
  const catalyst = healerReferences?.catalyst;
  const coverage = Array.isArray(healerReferences?.coverage) ? healerReferences.coverage : [];
  const records = Array.isArray(healerReferences?.records) ? healerReferences.records : [];

  if (healerReferences?.schemaVersion !== 1
    || healerReferences?.patchContext !== WEAPON_PATCH_CONTEXT
    || healerReferences?.objective !== HEALER_REFERENCE_OBJECTIVE
    || !Array.isArray(healerReferences?.scenarios)
    || !Array.isArray(healerReferences?.coverage) || !Array.isArray(healerReferences?.records)
    || !sameSet(new Set(healerReferences.scenarios), HEALER_REFERENCE_SCENARIOS)
    || healerReferences.scenarios.length !== HEALER_REFERENCE_SCENARIOS.size)
    errors.push("healer reference dataset is missing or has the wrong patch/schema");

  if (!provider || provider.id !== HEALER_PROVIDER.id || provider.name !== HEALER_PROVIDER.name
    || provider.sourceUrl !== HEALER_PROVIDER.sourceUrl
    || provider.repositoryUrl !== HEALER_PROVIDER.repositoryUrl
    || provider.stagingPrUrl !== HEALER_PROVIDER.stagingPrUrl
    || !HEALER_PROVIDER_STATUSES.has(provider.status)
    || !(provider.version === null
      || (typeof provider.version === "string" && provider.version.trim()))
    || (provider.status === "approved" && !provider.version))
    errors.push("healer reference provider metadata is missing or unreviewed");

  if (!catalyst || !HEALER_CATALYST_STATUSES.has(catalyst.status)
    || !(typeof catalyst.caveat === "string" && catalyst.caveat.trim()))
    errors.push("healer reference catalyst validation caveat is missing");

  const coverageKeys = coverage.map((entry) => entry?.specKey);
  if (!uniqueStrings(coverageKeys) || !sameSet(new Set(coverageKeys), healerKeys)
    || coverage.length !== healerKeys.size)
    errors.push("healer reference coverage must account for all and only healer specs");

  const coverageBySpec = new Map();
  for (const entry of coverage) {
    const where = `healer coverage ${entry?.specKey || "unknown"}`;
    const generated = rows.find((row) => `${row.spec} ${row.class}` === entry?.specKey);
    const plannedScenarios = Array.isArray(entry?.plannedScenarios) ? entry.plannedScenarios : [];
    if (!generated || generated.role !== "Healer" || !HEALER_REFERENCE_STATUSES.has(entry?.status)
      || entry?.objective !== HEALER_REFERENCE_OBJECTIVE || !uniqueStrings(plannedScenarios)
      || !sameSet(new Set(plannedScenarios), HEALER_REFERENCE_SCENARIOS)
      || plannedScenarios.length !== HEALER_REFERENCE_SCENARIOS.size)
      errors.push(`${where}: invalid role, objective, status, or scenario plan`);
    if (entry?.status !== "accepted" && !(typeof entry?.reason === "string" && entry.reason.trim()))
      errors.push(`${where}: non-accepted status lacks a reason`);
    if (typeof entry?.specKey === "string" && !coverageBySpec.has(entry.specKey))
      coverageBySpec.set(entry.specKey, entry);
  }

  const recordIds = new Set();
  const recordMatrices = new Set();
  const acceptedBySpecScenario = new Set();
  for (const record of records) {
    const where = `healer reference ${record?.recordId || "unknown"}`;
    const generated = rows.find((row) => `${row.spec} ${row.class}` === record?.specKey);
    const matrix = `${record?.specKey || ""}\u0000${record?.profile || ""}\u0000${record?.scenario || ""}`;
    if (!SIMC_ID.test(record?.recordId || "") || recordIds.has(record?.recordId))
      errors.push(`${where}: invalid or duplicate record id`);
    else recordIds.add(record.recordId);
    if (recordMatrices.has(matrix)) errors.push(`${where}: duplicate spec/profile/scenario record`);
    else recordMatrices.add(matrix);

    if (!generated || generated.role !== "Healer" || !healerKeys.has(record?.specKey)
      || !HEALER_REFERENCE_STATUSES.has(record?.status)
      || record?.objective !== HEALER_REFERENCE_OBJECTIVE
      || !HEALER_REFERENCE_SCENARIOS.has(record?.scenario)
      || !(typeof record?.profile === "string" && record.profile.trim())
      || !profilesBySpec.get(record?.specKey)?.has(record?.profile))
      errors.push(`${where}: invalid healer roster, objective, status, profile, or scenario`);
    if (record?.status !== "accepted" && !(typeof record?.reason === "string" && record.reason.trim()))
      errors.push(`${where}: non-accepted status lacks a reason`);

    const recordProvider = record?.provider;
    if (!recordProvider || recordProvider.id !== HEALER_PROVIDER.id
      || !sameSet(new Set(Object.keys(recordProvider)), new Set(["id", "version"]))
      || !(recordProvider.version === null
        || (typeof recordProvider.version === "string" && recordProvider.version.trim())))
      errors.push(`${where}: invalid provider or version`);

    const model = record?.model;
    if (!model || !sameSet(new Set(Object.keys(model)), new Set(["name", "version"]))
      || !(typeof model.name === "string" && model.name.trim())
      || !(typeof model.version === "string" && model.version.trim()))
      errors.push(`${where}: invalid model identity`);

    const provenance = record?.provenance;
    if (!provenance || !/^https:\/\//.test(provenance.sourceUrl || "")
      || !(typeof provenance.method === "string" && provenance.method.trim())
      || typeof provenance.verified !== "boolean"
      || !(provenance.capturedAt === null || isoTimestamp(provenance.capturedAt))
      || !(provenance.artifactSha256 === null || hexDigest(provenance.artifactSha256)))
      errors.push(`${where}: invalid provenance`);
    if (!uniqueStrings(record?.assumptions) || !record.assumptions.length
      || record.assumptions.some((assumption) => !assumption.trim()))
      errors.push(`${where}: assumptions must be explicit and nonempty`);
    if (!uniqueStrings(record?.limitations) || !record.limitations.length
      || record.limitations.some((limitation) => !limitation.trim()))
      errors.push(`${where}: limitations must be explicit and nonempty`);
    validateHealerScoringBasis(record?.scoringBasis, knownItemIds, where, errors);

    if (record?.status === "accepted") {
      if (provider?.status !== "approved" || !provider.version
        || catalyst?.status !== "validated" || recordProvider?.version !== provider.version
        || provenance?.verified !== true || !isoTimestamp(provenance?.capturedAt)
        || !hexDigest(provenance?.artifactSha256))
        errors.push(`${where}: accepted ranking lacks permission or verified provenance`);
      if (coverageBySpec.get(record.specKey)?.status !== "accepted")
        errors.push(`${where}: accepted ranking requires accepted healer coverage`);
      acceptedBySpecScenario.add(`${record.specKey}\u0000${record.scenario}`);
    }
  }

  for (const entry of coverage.filter((candidate) => candidate?.status === "accepted")) {
    for (const scenario of entry.plannedScenarios || []) {
      if (!acceptedBySpecScenario.has(`${entry.specKey}\u0000${scenario}`))
        errors.push(`healer coverage ${entry.specKey}: accepted status lacks an accepted ${scenario} record`);
    }
  }
}

function simcProfileInput(profile, scenarioId) {
  return Array.isArray(profile?.scenarioInputs)
    ? profile.scenarioInputs.find((input) => input.scenarioId === scenarioId) || null : null;
}

function validSimcProfileInput(input, build, specKey, context) {
  const generatorPrefix = build
    ? `${SIMC_GENERATOR_PREFIX}${build.commit}/profiles/generators/MID2/` : "";
  if (!input || !build || !(typeof input.sourceProfileName === "string" && input.sourceProfileName.trim())
    || !SIMC_SOURCE_MODES.has(input.sourceMode)
    || !String(input.generatorSource || "").startsWith(generatorPrefix)
    || !String(input.talentSource || "").startsWith("https://")
    || !/^[A-Za-z0-9_.-]+\.simc$/.test(input.profileFile || "") || !hexDigest(input.profileSha256)
    || (input.itemDbSource !== undefined && !/^[a-z0-9_-]+$/.test(input.itemDbSource || ""))
    || !uniqueNumericStrings(input.redirectedBaseItemIds)
    || typeof input.tertiaryRatingsPresent !== "boolean") return false;

  if (input.sourceMode === "official-output")
    return input.talentSource === input.generatorSource
      && input.generatorActorName === undefined
      && input.generatorSha256 === undefined && input.gearPlanSha256 === undefined
      && (input.talentSourceAsOf === undefined || isoDate(input.talentSourceAsOf))
      && input.curationReviewedAt === undefined && input.curationPolicyId === undefined
      && input.gearSetId === undefined;

  const policy = context.curationPoliciesById.get(input.curationPolicyId);
  const gearSet = policy?.gearSetsById.get(input.gearSetId);
  const generatorFile = String(input.generatorSource || "").split("/").at(-1);
  return typeof input.generatorActorName === "string" && input.generatorActorName.trim()
    && hexDigest(input.generatorSha256) && hexDigest(input.gearPlanSha256)
    && isoDate(input.talentSourceAsOf) && isoDate(input.curationReviewedAt)
    && !!policy && input.curationReviewedAt === policy.reviewedAt
    && !!gearSet && gearSet.specKey === specKey
    && gearSet.gearPlanSha256 === input.gearPlanSha256
    && policy.generatorFileSha256?.[generatorFile] === input.generatorSha256;
}

function sameSimcInputProvenance(left, right) {
  return !!left && !!right && left.sourceProfileName === right.sourceProfileName
    && (left.generatorActorName ?? undefined) === (right.generatorActorName ?? undefined)
    && (left.generatorSha256 ?? undefined) === (right.generatorSha256 ?? undefined)
    && left.sourceMode === right.sourceMode && left.generatorSource === right.generatorSource
    && left.talentSource === right.talentSource
    && (left.talentSourceAsOf ?? undefined) === (right.talentSourceAsOf ?? undefined)
    && (left.curationReviewedAt ?? undefined) === (right.curationReviewedAt ?? undefined)
    && (left.curationPolicyId ?? undefined) === (right.curationPolicyId ?? undefined)
    && (left.gearSetId ?? undefined) === (right.gearSetId ?? undefined)
    && (left.gearPlanSha256 ?? undefined) === (right.gearPlanSha256 ?? undefined)
    && left.profileFile === right.profileFile && left.profileSha256 === right.profileSha256
    && (left.itemDbSource ?? undefined) === (right.itemDbSource ?? undefined)
    && sameSet(new Set(left.redirectedBaseItemIds || []), new Set(right.redirectedBaseItemIds || []))
    && left.tertiaryRatingsPresent === right.tertiaryRatingsPresent;
}

function validateSimcRunManifest(simcManifest, rows, errors) {
  const context = {
    objectivesById: new Map(), scenariosById: new Map(), buildsById: new Map(),
    profilesById: new Map(), profileInputsByMatrix: new Map(), specsByKey: new Map(), acceptedMatrix: new Set(),
    selectionArtifactsByKey: new Map(), curationPoliciesById: new Map(),
    expectedProfileCount: 0, expectedReportCount: 0,
  };
  if (simcManifest?.schemaVersion !== 2 || simcManifest?.manifestId !== "midnight-s2-reference-weights"
    || simcManifest?.patchContext !== WEAPON_PATCH_CONTEXT || !Array.isArray(simcManifest?.specs)
    || !Array.isArray(simcManifest?.profiles) || !Array.isArray(simcManifest?.builds)
    || !Array.isArray(simcManifest?.objectives) || !Array.isArray(simcManifest?.scenarios)
    || !Array.isArray(simcManifest?.curationPolicies)) {
    errors.push("SimC run manifest is missing or has the wrong patch/schema");
    return context;
  }
  if (simcManifest.source !== SIMC_BUILD_SOURCE || !isoDate(simcManifest.reviewedAt))
    errors.push("SimC run manifest lacks its reviewed source or date");

  for (const policy of simcManifest.curationPolicies) {
    const hashes = policy?.gearDataHashes;
    const generatorHashes = policy?.generatorFileSha256;
    const gearSets = Array.isArray(policy?.gearSets) ? policy.gearSets : [];
    const gearSetsById = new Map();
    let valid = SIMC_ID.test(policy?.curationPolicyId || "") && isoDate(policy?.reviewedAt)
      && !context.curationPoliciesById.has(policy?.curationPolicyId)
      && !!hashes && !Array.isArray(hashes) && typeof hashes === "object"
      && [...CURATION_GEAR_DATA_FILES].every((file) => hexDigest(hashes[file]))
      && Object.entries(hashes).every(([file, digest]) =>
        /^data\/[a-z0-9][a-z0-9-]*\.json$/.test(file) && hexDigest(digest))
      && !!generatorHashes && !Array.isArray(generatorHashes)
      && Object.keys(generatorHashes).length > 0
      && Object.entries(generatorHashes).every(([file, digest]) =>
        /^MID2_Generate_[A-Za-z]+\.simc$/.test(file) && hexDigest(digest))
      && gearSets.length > 0;
    for (const gearSet of gearSets) {
      if (!SIMC_ID.test(gearSet?.gearSetId || "") || gearSetsById.has(gearSet.gearSetId)
        || !(typeof gearSet?.specKey === "string" && gearSet.specKey.trim())
        || !hexDigest(gearSet.gearPlanSha256)) valid = false;
      else gearSetsById.set(gearSet.gearSetId, gearSet);
    }
    if (!valid) errors.push(`SimC manifest has invalid curation policy ${policy?.curationPolicyId || "unknown"}`);
    else context.curationPoliciesById.set(policy.curationPolicyId, { ...policy, gearSetsById });
  }

  const acceptance = simcManifest.acceptancePolicy || {};
  if (!Number.isInteger(acceptance.runsPerRecord) || acceptance.runsPerRecord !== 2
    || !Number.isInteger(acceptance.requestedIterationsPerRun) || acceptance.requestedIterationsPerRun !== 25000
    || acceptance.maximumRelativeDrift !== 0.05 || acceptance.normalizeToPrimaryStat !== true
    || !sameJson(acceptance.secondaryStats, [...SECONDARIES]))
    errors.push("SimC acceptance policy changed without review");

  const expectedObjectives = new Map([
    ["damage", "supported"], ["tank-composite", "deferred"],
    ["healing", "deferred"], ["support-contribution", "unsupported"],
  ]);
  for (const objective of simcManifest.objectives) {
    if (!SIMC_ID.test(objective?.objectiveId || "") || context.objectivesById.has(objective.objectiveId)
      || !objective.label || !["supported", "deferred", "unsupported"].includes(objective.status))
      errors.push(`SimC manifest has invalid objective ${objective?.objectiveId || "unknown"}`);
    else context.objectivesById.set(objective.objectiveId, objective);
  }
  if (context.objectivesById.size !== expectedObjectives.size
    || [...expectedObjectives].some(([id, status]) => context.objectivesById.get(id)?.status !== status))
    errors.push("SimC manifest objective catalog changed without review");

  for (const scenario of simcManifest.scenarios) {
    if (!SIMC_ID.test(scenario?.scenarioId || "") || context.scenariosById.has(scenario.scenarioId)
      || !context.objectivesById.has(scenario.objective) || !scenario.label || !scenario.fightStyle
      || !Number.isInteger(scenario.targets) || scenario.targets <= 0)
      errors.push(`SimC manifest has invalid scenario ${scenario?.scenarioId || "unknown"}`);
    else context.scenariosById.set(scenario.scenarioId, scenario);
  }
  if (!context.scenariosById.size) errors.push("SimC manifest has no runnable scenarios");

  for (const build of simcManifest.builds) {
    if (!SIMC_ID.test(build?.buildId || "") || context.buildsById.has(build.buildId)
      || build.status !== "accepted" || !build.version || !/^[a-f0-9]{7,12}$/.test(build.revision || "")
      || !/^[a-f0-9]{40}$/.test(build.commit || "") || !build.commit.startsWith(build.revision)
      || !build.gameBuild || build.platform !== "win32" || build.arch !== "x64"
      || build.profileTreeSource !== simcManifest.source
      || !String(build.artifactSource || "").startsWith(SIMC_ARTIFACT_PREFIX)
      || !hexDigest(build.artifactSha256) || !hexDigest(build.simcExeSha256)
      || build.auditDirectory !== `data/simc-audit/${build.revision}` || build.compression !== "gzip")
      errors.push(`SimC manifest has invalid build ${build?.buildId || "unknown"}`);
    else context.buildsById.set(build.buildId, build);
  }
  if (context.buildsById.get(simcManifest.activeBuildId)?.status !== "accepted")
    errors.push("SimC manifest active build is missing or unaccepted");

  const generatedByKey = new Map(rows.map((row) => [`${row.spec} ${row.class}`, row]));
  for (const spec of simcManifest.specs) {
    const generated = generatedByKey.get(spec?.specKey);
    const profileIds = Array.isArray(spec?.profileIds) ? spec.profileIds : [];
    const plannedScenarioIds = Array.isArray(spec?.plannedScenarioIds) ? spec.plannedScenarioIds : [];
    if (!generated || spec.specKey !== `${spec.spec} ${spec.class}` || context.specsByKey.has(spec.specKey)
      || spec.class !== generated.class || spec.spec !== generated.spec || spec.role !== generated.role
      || spec.primaryStat !== generated.statPriority?.primary || !PRIMARIES.has(spec.primaryStat)
      || !context.objectivesById.has(spec.objective) || !SIMC_ELIGIBILITY.has(spec.eligibility)
      || !SIMC_SPEC_STATUSES.has(spec.status) || !uniqueStrings(spec.profileIds)
      || !uniqueStrings(spec.plannedScenarioIds)
      || spec.plannedScenarioIds.some((id) => !context.scenariosById.has(id)))
      errors.push(`SimC manifest has invalid specialization ${spec?.specKey || "unknown"}`);
    else context.specsByKey.set(spec.specKey, spec);
    if (spec?.status !== "accepted" && !(typeof spec?.reason === "string" && spec.reason.trim()))
      errors.push(`SimC ${spec?.specKey || "unknown spec"}: non-accepted status lacks a reason`);

    const isAugmentation = spec?.specKey === "Augmentation Evoker";
    if (isAugmentation) {
      if (spec.role !== "DPS" || spec.eligibility !== "unsupported" || spec.status !== "unsupported"
        || spec.objective !== "support-contribution" || profileIds.length || plannedScenarioIds.length)
        errors.push("SimC Augmentation Evoker must remain explicitly unsupported");
    } else if (spec?.role === "DPS") {
      if (spec.eligibility !== "eligible" || !["accepted", "pending"].includes(spec.status)
        || spec.objective !== "damage" || !plannedScenarioIds.length)
        errors.push(`SimC ${spec.specKey}: conventional DPS disposition is invalid`);
    } else if (spec?.role === "Tank") {
      if (spec.eligibility !== "deferred" || spec.status !== "deferred"
        || spec.objective !== "tank-composite" || profileIds.length || plannedScenarioIds.length)
        errors.push(`SimC ${spec.specKey}: tank disposition is invalid`);
    } else if (spec?.role === "Healer") {
      if (spec.eligibility !== "deferred" || spec.status !== "deferred"
        || spec.objective !== "healing" || profileIds.length || plannedScenarioIds.length)
        errors.push(`SimC ${spec.specKey}: healer disposition is invalid`);
    }
  }
  if (!sameSet(new Set(context.specsByKey.keys()), new Set(generatedByKey.keys())))
    errors.push("SimC manifest does not account for the complete 40-spec roster");

  const profileNamesBySpec = new Map(rows.map((row) => [
    `${row.spec} ${row.class}`,
    new Set((row.statPriorityVariants || []).length
      ? row.statPriorityVariants.map((profile) => profile.name) : ["General"]),
  ]));
  const artifactHashes = new Map();
  for (const profile of simcManifest.profiles) {
    const spec = context.specsByKey.get(profile?.specKey);
    const scenarioIds = Array.isArray(profile?.scenarioIds) ? profile.scenarioIds : [];
    const scenarioInputMode = Array.isArray(profile?.scenarioInputs);
    let profileValid = SIMC_ID.test(profile?.profileId || "")
      && !context.profilesById.has(profile.profileId)
      && SIMC_PROFILE_STATUSES.has(profile.status) && !!spec
      && profile.objective === spec.objective && profile.primaryStat === spec.primaryStat
      && !!profile.name && profileNamesBySpec.get(profile.specKey)?.has(profile.guideProfileName)
      && SIMC_SELECTION_MODES.has(profile.selectionMode)
      && (profile.selectionMode === "same-gear-dps"
        ? profile.selectionEvidence !== undefined : profile.selectionEvidence === undefined)
      && uniqueStrings(profile.scenarioIds) && !!profile.scenarioIds.length
      && !profile.scenarioIds.some((id) => {
        const scenario = context.scenariosById.get(id);
        return !scenario || scenario.objective !== profile.objective;
      }) && scenarioInputMode;

    const inputs = scenarioInputMode ? profile.scenarioInputs : [];
    if (scenarioInputMode && (!uniqueStrings(inputs.map((input) => input?.scenarioId))
      || !sameSet(new Set(inputs.map((input) => input.scenarioId)), new Set(scenarioIds))))
      profileValid = false;
    const localArtifactHashes = new Map();
    for (const input of inputs) {
      const build = context.buildsById.get(input?.buildId);
      if (!input || !build || !scenarioIds.includes(input.scenarioId)
        || !validSimcProfileInput(input, build, profile.specKey, context)) {
        profileValid = false;
        continue;
      }
      const artifactKey = `${input.buildId}\u0000${input.profileFile}`;
      const priorHash = localArtifactHashes.get(artifactKey) || artifactHashes.get(artifactKey);
      if (priorHash && priorHash !== input.profileSha256) profileValid = false;
      else localArtifactHashes.set(artifactKey, input.profileSha256);
    }
    const localSelectionArtifacts = new Map();
    const selectionEvidence = profile?.selectionEvidence;
    if (selectionEvidence !== undefined) {
      const selectionSettings = selectionEvidence?.settings || {};
      const selectionScenarios = Array.isArray(selectionEvidence?.scenarios)
        ? selectionEvidence.scenarios : [];
      const selectionScenarioIds = selectionScenarios.map((entry) => entry?.scenarioId);
      if (profile.selectionMode !== "same-gear-dps" || !["accepted", "ready"].includes(profile.status)
        || selectionEvidence?.metric !== "DPS"
        || selectionEvidence?.requestedIterationsPerCandidate !== 5000
        || !sameSet(new Set(Object.keys(selectionSettings)), new Set([
          "threads", "fixedTime", "maxTimeSeconds", "varyCombatLength", "optimalRaid",
          "fightStyle", "calculateScaleFactors",
        ]))
        || selectionSettings.threads !== 2 || selectionSettings.fixedTime !== true
        || selectionSettings.maxTimeSeconds !== 300 || selectionSettings.varyCombatLength !== 0.2
        || selectionSettings.optimalRaid !== true || selectionSettings.fightStyle !== "Patchwerk"
        || selectionSettings.calculateScaleFactors !== false
        || !uniqueStrings(selectionScenarioIds)
        || !sameSet(new Set(selectionScenarioIds), new Set(scenarioIds)))
        profileValid = false;

      for (const selectionScenario of selectionScenarios) {
        const scenarioId = selectionScenario?.scenarioId;
        const scenario = context.scenariosById.get(scenarioId);
        const selectedInput = simcProfileInput(profile, scenarioId);
        const candidates = Array.isArray(selectionScenario?.candidates)
          ? selectionScenario.candidates : [];
        const candidateNames = candidates.map((candidate) => candidate?.sourceProfileName);
        const candidateBuildIds = new Set(candidates.map((candidate) => candidate?.buildId));
        if (!scenario || !selectedInput || scenario.fightStyle !== selectionSettings.fightStyle
          || !/^[1-9]\d*$/.test(selectionScenario?.seed || "")
          || !(typeof selectionScenario?.selectedSourceProfileName === "string"
            && selectionScenario.selectedSourceProfileName.trim())
          || candidates.length < 2 || !uniqueStrings(candidateNames) || candidateBuildIds.size !== 1) {
          profileValid = false;
          continue;
        }

        for (const candidate of candidates) {
          const build = context.buildsById.get(candidate?.buildId);
          if (!validSimcProfileInput(candidate, build, profile.specKey, context)
            || !Number.isInteger(candidate.iterations)
            || candidate.iterations < selectionEvidence.requestedIterationsPerCandidate
            || candidate.iterations >= selectionEvidence.requestedIterationsPerCandidate
              + selectionSettings.threads
            || !Number.isFinite(candidate.baselineDps) || candidate.baselineDps <= 0
            || !Number.isFinite(candidate.baselineDpsError) || candidate.baselineDpsError <= 0
            || !/^[a-z0-9][a-z0-9_-]*$/.test(candidate.reportId || "")
            || !hexDigest(candidate.resultSha256)
            || (candidate.seed !== undefined && candidate.seed !== selectionScenario.seed)) {
            profileValid = false;
            continue;
          }
          const artifactKey = `${candidate.buildId}\u0000${candidate.profileFile}`;
          const priorArtifactHash = localArtifactHashes.get(artifactKey) || artifactHashes.get(artifactKey);
          if (priorArtifactHash && priorArtifactHash !== candidate.profileSha256) profileValid = false;
          else localArtifactHashes.set(artifactKey, candidate.profileSha256);

          const selectionKey = `${candidate.buildId}\u0000${candidate.reportId}`;
          if (localSelectionArtifacts.has(selectionKey)
            || context.selectionArtifactsByKey.has(selectionKey)) profileValid = false;
          else localSelectionArtifacts.set(selectionKey, candidate);
        }

        const maximumDps = Math.max(...candidates.map((candidate) => candidate?.baselineDps));
        const winners = candidates.filter((candidate) => candidate?.baselineDps === maximumDps);
        const winner = winners.length === 1 ? winners[0] : null;
        if (!winner || selectionScenario.selectedSourceProfileName !== winner.sourceProfileName
          || winner.buildId !== selectedInput.buildId || !sameSimcInputProvenance(winner, selectedInput))
          profileValid = false;
        const shared = candidates[0];
        if (candidates.some((candidate) => candidate.sourceMode !== shared?.sourceMode
          || candidate.generatorSha256 !== shared?.generatorSha256
          || (candidate.itemDbSource ?? undefined) !== (shared?.itemDbSource ?? undefined)
          || !sameSet(new Set(candidate.redirectedBaseItemIds || []),
            new Set(shared?.redirectedBaseItemIds || []))
          || candidate.tertiaryRatingsPresent !== shared?.tertiaryRatingsPresent
          || (candidate.curationPolicyId ?? undefined) !== (shared?.curationPolicyId ?? undefined)
          || (candidate.gearSetId ?? undefined) !== (shared?.gearSetId ?? undefined)
          || (candidate.gearPlanSha256 ?? undefined) !== (shared?.gearPlanSha256 ?? undefined)))
          profileValid = false;
      }
    }
    if (!profileValid) errors.push(`SimC manifest has invalid profile ${profile?.profileId || "unknown"}`);
    else {
      for (const [artifactKey, profileSha256] of localArtifactHashes)
        artifactHashes.set(artifactKey, profileSha256);
      for (const [selectionKey, candidate] of localSelectionArtifacts)
        context.selectionArtifactsByKey.set(selectionKey, candidate);
      context.profilesById.set(profile.profileId, profile);
      for (const scenarioId of scenarioIds)
        context.profileInputsByMatrix.set(`${profile.profileId}\u0000${scenarioId}`,
          simcProfileInput(profile, scenarioId));
    }
  }
  for (const spec of context.specsByKey.values()) {
    const declared = new Set(spec.profileIds);
    const catalog = new Set([...context.profilesById.values()]
      .filter((profile) => profile.specKey === spec.specKey).map((profile) => profile.profileId));
    if (!sameSet(declared, catalog)) errors.push(`SimC ${spec.specKey}: profile catalog linkage is incomplete`);
    const visibleProfiles = [...declared].map((id) => context.profilesById.get(id))
      .filter((profile) => profile && profile.status !== "rejected");
    const acceptedGuideNames = new Set(visibleProfiles.filter((profile) => profile.status === "accepted")
      .map((profile) => profile.guideProfileName));
    const expectedGuideNames = profileNamesBySpec.get(spec.specKey) || new Set();
    const completeGuideCoverage = visibleProfiles.length > 0
      && visibleProfiles.every((profile) => profile.status === "accepted")
      && sameSet(acceptedGuideNames, expectedGuideNames);
    const readyDeclared = [...declared].filter((id) => context.profilesById.get(id)?.status === "ready");
    if (spec.status === "accepted" && !completeGuideCoverage)
      errors.push(`SimC ${spec.specKey}: accepted status lacks every visible guide profile mapping`);
    if (spec.status === "pending" && completeGuideCoverage)
      errors.push(`SimC ${spec.specKey}: pending status conflicts with complete guide profile coverage`);
    if (readyDeclared.length && !["pending", "accepted"].includes(spec.status))
      errors.push(`SimC ${spec.specKey}: ready profiles require a pending or accepted spec`);
    const guideProfileNames = new Set();
    for (const profile of [...context.profilesById.values()]
      .filter((entry) => entry.specKey === spec.specKey && entry.status !== "rejected")) {
      if (guideProfileNames.has(profile.guideProfileName))
        errors.push(`SimC ${spec.specKey}: non-rejected profiles have an ambiguous guide mapping`);
      guideProfileNames.add(profile.guideProfileName);
    }
    for (const profileId of declared) {
      const profile = context.profilesById.get(profileId);
      if (profile && profile.scenarioIds.some((id) => !spec.plannedScenarioIds.includes(id)))
        errors.push(`SimC ${spec.specKey}: profile scenarios exceed the spec plan`);
    }
  }

  const acceptedProfiles = [...context.profilesById.values()].filter((profile) => profile.status === "accepted");
  for (const profile of acceptedProfiles)
    for (const scenarioId of profile.scenarioIds)
      context.acceptedMatrix.add(`${profile.profileId}\u0000${scenarioId}`);
  context.expectedProfileCount = acceptedProfiles.length;
  context.expectedReportCount = context.acceptedMatrix.size * (acceptance.runsPerRecord || 0);
  const specs = [...context.specsByKey.values()];
  const expectedCoverage = {
    totalSpecs: specs.length,
    eligibleConventionalDps: specs.filter((spec) => spec.role === "DPS" && spec.eligibility === "eligible").length,
    acceptedEligibleSpecs: specs.filter((spec) => spec.eligibility === "eligible" && spec.status === "accepted").length,
    pendingEligibleSpecs: specs.filter((spec) => spec.eligibility === "eligible" && spec.status === "pending").length,
    deferredTanks: specs.filter((spec) => spec.role === "Tank" && spec.status === "deferred").length,
    deferredHealers: specs.filter((spec) => spec.role === "Healer" && spec.status === "deferred").length,
    unsupportedSpecs: specs.filter((spec) => spec.status === "unsupported").length,
    acceptedProfiles: context.expectedProfileCount,
    acceptedRecords: context.acceptedMatrix.size,
    acceptedReports: context.expectedReportCount,
  };
  if (!sameJson(simcManifest.coverage, expectedCoverage))
    errors.push("SimC manifest coverage summary is stale");
  return context;
}

function validateSimcReferenceWeights(simcWeights, simcManifest, manifest, errors) {
  if (simcWeights?.schemaVersion !== 3 || simcWeights?.runManifest !== "simc-run-manifest.json"
    || simcWeights?.patchContext !== WEAPON_PATCH_CONTEXT || !Array.isArray(simcWeights?.records)) {
    errors.push("SimC reference weights are missing or have the wrong patch/schema");
    return;
  }

  const methodology = simcWeights.methodology || {};
  const simulator = methodology.simulator;
  const settings = methodology.settings || {};
  const profileGeneration = methodology.profileGeneration || {};
  const auditArtifacts = methodology.auditArtifacts || {};
  const acceptedProfiles = [...manifest.profilesById.values()].filter((profile) => profile.status === "accepted");
  const acceptedEvidence = simcWeights.records.filter((record) => record?.status === "accepted");
  const evidenceBuildIds = new Set(acceptedEvidence.map((record) => record.buildId));
  for (const profile of acceptedProfiles)
    for (const scenarioId of profile.scenarioIds) {
      const input = manifest.profileInputsByMatrix.get(`${profile.profileId}\u0000${scenarioId}`);
      if (input?.buildId) evidenceBuildIds.add(input.buildId);
    }
  for (const candidate of manifest.selectionArtifactsByKey.values())
    evidenceBuildIds.add(candidate.buildId);
  if (simcWeights.source !== simcManifest?.source || !isoTimestamp(simcWeights.generatedAt))
    errors.push("SimC reference weights lack the reviewed source or generation timestamp");
  const simulatorMatchesBuild = (declared, build) => !!declared && !!build
    && declared.version === build.version && declared.revision === build.revision
    && declared.commit === build.commit && declared.gameBuild === build.gameBuild
    && declared.platform === build.platform && declared.arch === build.arch
    && declared.artifactSource === build.artifactSource
    && declared.artifactSha256 === build.artifactSha256
    && declared.simcExeSha256 === build.simcExeSha256;
  const simulators = methodology.simulators;
  let simulatorPolicyValid;
  if (simulators === undefined) {
    const onlyBuild = evidenceBuildIds.size === 1
      ? manifest.buildsById.get([...evidenceBuildIds][0]) : null;
    simulatorPolicyValid = simulatorMatchesBuild(simulator, onlyBuild);
  } else {
    simulatorPolicyValid = simulator === undefined && !!simulators && !Array.isArray(simulators)
      && typeof simulators === "object"
      && sameSet(new Set(Object.keys(simulators)), evidenceBuildIds)
      && [...evidenceBuildIds].every((buildId) =>
        simulatorMatchesBuild(simulators[buildId], manifest.buildsById.get(buildId)));
  }
  if (!simulatorPolicyValid)
    errors.push("SimC simulator provenance does not match the run manifest");
  if (profileGeneration.sourcePolicy !== "manifest-scenario-input"
      || !sameSet(new Set(profileGeneration.sourceModes || []), SIMC_SOURCE_MODES)
      || !(typeof profileGeneration.generatorSourceMeaning === "string"
        && profileGeneration.generatorSourceMeaning.trim())
      || profileGeneration.talentSourcePolicy !== "manifest-scenario-input"
      || profileGeneration.talentSourceAsOfPolicy !== "required-for-curated-same-gear"
      || profileGeneration.curationPolicy !== "manifest-curationPolicies"
      || profileGeneration.redirectedBaseItemIdsPolicy !== "manifest-scenario-input"
      || profileGeneration.tertiaryRatingsPolicy !== "manifest-scenario-input-and-retained-report")
    errors.push("SimC generated-profile policy does not match the run manifest");
  const auditDirectories = auditArtifacts.directories;
  let auditPolicyValid = evidenceBuildIds.size > 0;
  if (auditDirectories === undefined) {
    const evidenceBuild = evidenceBuildIds.size === 1
      ? manifest.buildsById.get([...evidenceBuildIds][0]) : null;
    auditPolicyValid = auditPolicyValid && !!evidenceBuild
      && auditArtifacts.directory === evidenceBuild.auditDirectory
      && auditArtifacts.compression === evidenceBuild.compression;
  } else if (!auditDirectories || Array.isArray(auditDirectories)
    || typeof auditDirectories !== "object"
    || !sameSet(new Set(Object.keys(auditDirectories)), evidenceBuildIds)) {
    auditPolicyValid = false;
  } else {
    for (const buildId of evidenceBuildIds) {
      const build = manifest.buildsById.get(buildId);
      const declared = auditDirectories[buildId];
      const directory = typeof declared === "string" ? declared : declared?.directory;
      const compression = typeof declared === "object" && declared?.compression
        ? declared.compression : auditArtifacts.compression;
      if (!build || directory !== build.auditDirectory || compression !== build.compression)
        auditPolicyValid = false;
    }
  }
  if (!auditPolicyValid)
    errors.push("SimC audit-artifact policy does not match the run manifest");
  const expectedScenarios = Object.fromEntries([...manifest.scenariosById.values()].map((scenario) => [
    scenario.scenarioId, { fightStyle: scenario.fightStyle, targets: scenario.targets },
  ]));
  if (settings.ptr !== true || settings.optimalRaid !== true || settings.fightStyle !== "Patchwerk"
    || settings.fixedTime !== true || settings.maxTimeSeconds !== 300 || settings.varyCombatLength !== 0.2
    || settings.requestedIterationsPerRun !== simcManifest?.acceptancePolicy?.requestedIterationsPerRun
    || settings.calculateScaleFactors !== true || settings.normalizeScaleFactors !== true
    || settings.scaleOnly !== undefined || settings.scaleOnlyScope !== undefined
    || settings.scaleOnlyPolicy?.primaryStatField !== "primaryStat"
    || !sameJson(settings.scaleOnlyPolicy?.secondaries, ["crit", "haste", "mastery", "versatility"])
    || methodology.acceptedRunCount !== simcManifest?.acceptancePolicy?.runsPerRecord
    || methodology.maximumRelativeDrift !== simcManifest?.acceptancePolicy?.maximumRelativeDrift
    || !sameJson(methodology.scenarios, expectedScenarios))
    errors.push("SimC reference methodology does not match the run manifest");

  const seen = new Set();
  const recordIds = new Set();
  const publishedMatrix = new Set();
  const acceptedArtifactProfiles = new Set();
  let acceptedArtifactReports = 0;
  const reportIds = new Set();
  const seeds = new Set();
  const acceptedTimestamps = [];
  const validStatuses = new Set(["accepted", "provisional", "rejected"]);
  const exactWeights = (weights, nonNegative) => weights && sameSet(new Set(Object.keys(weights)), SECONDARIES)
    && Object.values(weights).every((value) => Number.isFinite(value) && (!nonNegative || value >= 0));
  // The retained ledger was produced with round-half-even semantics. Preserve that
  // convention explicitly so a binary floating-point .5 tie cannot move evidence by
  // one millionth when regenerated by JavaScript instead of Python.
  const roundSix = (value) => {
    const scaled = value * 1e6;
    const lower = Math.floor(scaled);
    const fraction = scaled - lower;
    if (Math.abs(fraction - 0.5) < 1e-9) return (lower + (lower % 2 ? 1 : 0)) / 1e6;
    return Math.round(scaled) / 1e6;
  };
  const iterations = simcManifest?.acceptancePolicy?.requestedIterationsPerRun;
  const runsPerRecord = simcManifest?.acceptancePolicy?.runsPerRecord;

  for (const record of simcWeights.records) {
    const where = `SimC ${record?.specKey || "unknown spec"}/${record?.profile || "unknown profile"}`;
    const profile = manifest.profilesById.get(record?.profileId);
    const scenario = manifest.scenariosById.get(record?.scenario);
    const input = profile && scenario
      ? manifest.profileInputsByMatrix.get(`${profile.profileId}\u0000${scenario.scenarioId}`) : null;
    const build = manifest.buildsById.get(record?.buildId);
    const expectedRecordId = profile && scenario ? `${profile.profileId}-${scenario.scenarioId}` : null;
    if (!profile || !build || !scenario || record.specKey !== profile.specKey || record.profile !== profile.name
      || !input || record.buildId !== input.buildId || record.objective !== profile.objective
      || record.primaryStat !== profile.primaryStat || !profile.scenarioIds.includes(record.scenario))
      errors.push(`${where}: spec/profile does not match the run manifest`);
    if (!SIMC_ID.test(record?.recordId || "") || record.recordId !== expectedRecordId)
      errors.push(`${where}: invalid stable record id`);
    if (recordIds.has(record?.recordId)) errors.push(`${where}: duplicate record id`);
    recordIds.add(record?.recordId);
    if (!scenario || record.targets !== scenario.targets)
      errors.push(`${where}: scenario target count does not match the run manifest`);
    const key = `${record?.profileId}\u0000${record?.scenario}`;
    if (seen.has(key)) errors.push(`${where}: duplicate scenario record`);
    seen.add(key);

    if (!validStatuses.has(record?.status)) errors.push(`${where}: invalid status`);
    if (!exactWeights(record?.weights, true)) errors.push(`${where}: invalid published weights`);
    if (record?.status !== "accepted") {
      if (!record?.reason) errors.push(`${where}: non-accepted record lacks a reason`);
      continue;
    }
    if (!profile || !["accepted", "ready"].includes(profile.status))
      errors.push(`${where}: accepted evidence requires an accepted or ready profile`);
    if (profile?.status === "accepted") publishedMatrix.add(key);
    acceptedArtifactProfiles.add(`${record?.buildId}\u0000${record?.profileFile}`);
    acceptedArtifactReports += Array.isArray(record?.runs) ? record.runs.length : 0;
    acceptedTimestamps.push(record.simulatedAt);

    const hasIterationOverride = record.requestedIterationsPerRun !== undefined;
    const recordIterations = hasIterationOverride
      ? record.requestedIterationsPerRun : iterations;
    if (hasIterationOverride && (!Number.isSafeInteger(recordIterations) || recordIterations <= iterations))
      errors.push(`${where}: invalid requested iteration override`);
    if (!Array.isArray(record.runs) || record.runs.length !== runsPerRecord)
      errors.push(`${where}: accepted record must contain exactly ${runsPerRecord} runs`);
    else for (const run of record.runs) {
      if (!Number.isInteger(run?.threads) || run.threads <= 0
        || !Number.isSafeInteger(run?.iterations) || run.iterations < recordIterations
        || run.iterations >= recordIterations + run.threads
        || !Number.isFinite(run?.baselineDps) || run.baselineDps <= 0
        || !Number.isFinite(run?.baselineDpsError) || run.baselineDpsError <= 0
        || !exactWeights(run?.weights, false) || !/^\d+$/.test(run?.seed || "")
        || !/^[a-z0-9][a-z0-9_-]*$/.test(run?.reportId || "")
        || !hexDigest(run?.resultSha256) || !isoTimestamp(run?.timestamp))
        errors.push(`${where}: invalid accepted run`);
      if (reportIds.has(run?.reportId)) errors.push(`${where}: duplicate report id`);
      if (seeds.has(run?.seed)) errors.push(`${where}: repeated RNG seed`);
      reportIds.add(run?.reportId);
      seeds.add(run?.seed);
    }
    if (exactWeights(record.weights, true) && Array.isArray(record.runs) && record.runs.length === runsPerRecord
      && record.runs.every((run) => exactWeights(run?.weights, false))) {
      let derivedMaxDrift = 0;
      for (const stat of SECONDARIES) {
        const left = record.runs[0].weights[stat];
        const right = record.runs[1].weights[stat];
        const derivedMean = (left + right) / 2;
        const denominator = (Math.abs(left) + Math.abs(right)) / 2;
        const drift = denominator ? Math.abs(left - right) / denominator : 0;
        derivedMaxDrift = Math.max(derivedMaxDrift, drift);
        if (record.weights[stat] !== roundSix(derivedMean))
          errors.push(`${where}: published ${stat} weight does not match its runs`);
      }
      const derivedDpsDrift = Math.abs(record.runs[0].baselineDps - record.runs[1].baselineDps)
        / ((record.runs[0].baselineDps + record.runs[1].baselineDps) / 2);
      if (record.maxRelativeDrift !== roundSix(derivedMaxDrift)
        || record.baselineDpsRelativeDrift !== roundSix(derivedDpsDrift))
        errors.push(`${where}: published stability does not match its runs`);
    }
    if (!Number.isFinite(record.maxRelativeDrift) || record.maxRelativeDrift < 0
      || record.maxRelativeDrift > simcManifest?.acceptancePolicy?.maximumRelativeDrift)
      errors.push(`${where}: accepted record exceeds the stability threshold`);
    if (!Number.isFinite(record.baselineDpsRelativeDrift) || record.baselineDpsRelativeDrift < 0)
      errors.push(`${where}: invalid baseline DPS stability`);
    const runTimestamps = Array.isArray(record.runs) && record.runs.length === runsPerRecord
      && record.runs.every((run) => isoTimestamp(run?.timestamp))
      ? record.runs.map((run) => run.timestamp).sort() : [];
    if (!profile || !input || !build || !sameSimcInputProvenance(record, input)
      || record.simcVersion !== build.version || record.simcRevision !== build.revision
      || record.gameBuild !== build.gameBuild || !isoTimestamp(record.simulatedAt)
      || (runTimestamps.length === runsPerRecord && record.simulatedAt !== runTimestamps.at(-1)))
      errors.push(`${where}: accepted record lacks valid simulation provenance`);
  }
  if (!sameSet(publishedMatrix, manifest.acceptedMatrix))
    errors.push("SimC accepted reference matrix is incomplete or unexpected");
  for (const candidate of manifest.selectionArtifactsByKey.values())
    acceptedArtifactProfiles.add(`${candidate.buildId}\u0000${candidate.profileFile}`);
  if (auditArtifacts.profiles !== acceptedArtifactProfiles.size
    || auditArtifacts.reports !== acceptedArtifactReports)
    errors.push("SimC audit-artifact counts do not match the accepted evidence ledger");
  if ((auditArtifacts.selections ?? 0) !== manifest.selectionArtifactsByKey.size)
    errors.push("SimC selection-artifact count does not match the run manifest");
  if (acceptedTimestamps.length && simcWeights.generatedAt !== acceptedTimestamps.sort().at(-1))
    errors.push("SimC generation timestamp does not match the latest accepted record");
}

export function validateData({ raid, specs, dungeons, sheet, statOverrides, statBaseline,
  weaponProficiency, itemEligibility, tier, catalyst, catalystAllocations, simcManifest, simcWeights,
  healerReferences },
  { expectedPatch = "12.0.7", gearingRoot } = {}) {
  const errors = [];
  try { verifyCurationSourceFiles(simcManifest, gearingRoot); }
  catch (error) { errors.push(error.message); }
  const rows = specs?.specs || [];
  if (rows.length !== 40) errors.push(`expected 40 specs, found ${rows.length}`);
  const keys = rows.map((s) => `${s.spec} ${s.class}`);
  if (new Set(keys).size !== keys.length) errors.push("spec keys are not unique");
  if (specs?.counts?.specs !== rows.length || specs?.counts?.withPriority !== rows.length
    || specs?.counts?.withArmor !== rows.length || specs?.counts?.withWeaponLoadouts !== rows.length)
    errors.push("spec summary counts are stale");

  validateGeneratedSources(rows, statOverrides, statBaseline, weaponProficiency, expectedPatch, errors);
  const knownHealerItemIds = new Set([
    ...(raid?.bosses || []).flatMap((boss) => boss.items || []),
    ...(dungeons?.dungeons || []).flatMap((dungeon) => dungeon.items || []),
    ...(tier?.sets || []).flatMap((set) => set.items || []),
  ].map((item) => String(item.id)));
  validateHealerReferences(healerReferences, rows, knownHealerItemIds, errors);
  const simcContext = validateSimcRunManifest(simcManifest, rows, errors);
  validateSimcReferenceWeights(simcWeights, simcManifest, simcContext, errors);

  for (const s of rows) {
    const key = `${s.spec} ${s.class}`;
    if (!ARMOR_TYPES.has(s.armor) || s.armor !== ARMOR_BY_CLASS[s.class])
      errors.push(`${key}: invalid armor type`);
    const priority = s.statPriority;
    if (!priority || !PRIMARIES.has(priority.primary)) errors.push(`${key}: invalid primary stat`);
    const secondaries = priority?.secondaries || [];
    if (secondaries.length !== 4 || new Set(secondaries).size !== 4
      || secondaries.some((stat) => !SECONDARIES.has(stat)))
      errors.push(`${key}: invalid secondary priority`);
    if (s.statPriorityPatch !== expectedPatch)
      errors.push(`${key}: expected patch ${expectedPatch}, found ${s.statPriorityPatch || "none"}`);
    if (!/^https:\/\//.test(s.statPrioritySource || "")) errors.push(`${key}: missing direct stat source URL`);
    if (!Array.isArray(s.weaponLoadouts) || !s.weaponLoadouts.length)
      errors.push(`${key}: missing explicit weapon loadouts`);
    if (s.weaponLoadoutPatchContext !== WEAPON_PATCH_CONTEXT)
      errors.push(`${key}: expected weapon context ${WEAPON_PATCH_CONTEXT}`);
    if (!(s.weaponLoadoutSources || []).length
      || s.weaponLoadoutSources.some((source) => !/^https:\/\//.test(source)))
      errors.push(`${key}: missing direct weapon source URL`);
    const loadoutIds = (s.weaponLoadouts || []).map((loadout) => loadout.id);
    if (new Set(loadoutIds).size !== loadoutIds.length) errors.push(`${key}: duplicate weapon loadout ids`);
    for (const loadout of s.weaponLoadouts || []) {
      const main = loadout.hands?.mainHand;
      const off = loadout.hands?.offHand;
      if (!loadout.id || !main?.required || !(main.inventorySlots || []).length
        || !(main.itemTypes || []).length)
        errors.push(`${key}/${loadout.id || "unnamed"}: invalid main-hand rule`);
      if (!off || Number(!!off.required) + Number(!!off.mustBeEmpty) !== 1)
        errors.push(`${key}/${loadout.id || "unnamed"}: invalid off-hand rule`);
      if (off?.required && (!(off.inventorySlots || []).length || !(off.itemTypes || []).length))
        errors.push(`${key}/${loadout.id || "unnamed"}: incomplete off-hand rule`);
      if (main?.occupiesBothHands && !off?.mustBeEmpty)
        errors.push(`${key}/${loadout.id || "unnamed"}: two-hand rule does not empty off hand`);
      for (const hand of [main, off].filter((rule) => rule?.required)) {
        if (hand.inventorySlots.some((slot) => !WEAPON_SLOTS.has(slot)))
          errors.push(`${key}/${loadout.id}: invalid weapon inventory slot`);
        if (hand.itemTypes.some((type) => type !== null && !WEAPON_TYPES.has(type)))
          errors.push(`${key}/${loadout.id}: invalid weapon item type`);
        if (hand.itemTypes.includes(null) && !hand.inventorySlots.includes("Held In Off-hand"))
          errors.push(`${key}/${loadout.id}: null item type is only valid for held offhands`);
      }
    }
    const profiles = s.statPriorityVariants || [];
    if (profiles.length && JSON.stringify(profiles[0].secondaries) !== JSON.stringify(secondaries))
      errors.push(`${key}: default priority does not match the first named profile`);
    if (new Set(profiles.map((profile) => profile.name)).size !== profiles.length)
      errors.push(`${key}: duplicate profile names`);
    for (const profile of profiles) {
      const stats = profile.secondaries || [];
      if (!profile.name || stats.length !== 4 || new Set(stats).size !== 4
        || stats.some((stat) => !SECONDARIES.has(stat)) || profile.patch !== expectedPatch
        || !/^https:\/\//.test(profile.source || ""))
        errors.push(`${key}: invalid profile ${profile.name || "unnamed"}`);
    }
  }
  const generatedArmor = specs?.armorByClass || {};
  if (Object.keys(generatedArmor).length !== Object.keys(ARMOR_BY_CLASS).length
    || Object.entries(ARMOR_BY_CLASS).some(([className, armor]) => generatedArmor[className] !== armor))
    errors.push("generated class armor map changed from the authoritative roster");

  const dungeonGroups = dungeons?.dungeons || [];
  if (dungeonGroups.length !== 8) errors.push(`expected 8 dungeons, found ${dungeonGroups.length}`);
  if (new Set(dungeonGroups.map((dungeon) => dungeon.name)).size !== dungeonGroups.length)
    errors.push("dungeon names are not unique");
  const dungeonItemCount = dungeonGroups.reduce((sum, dungeon) => sum + (dungeon.items || []).length, 0);
  if (dungeons?.counts?.dungeonsInPool !== 8 || dungeons?.counts?.dungeonsHarvested !== dungeonGroups.length
    || dungeons?.counts?.gear !== dungeonItemCount)
    errors.push("dungeon summary counts are stale");
  if ((dungeons?.unresolved || []).length) errors.push(`unresolved dungeons: ${dungeons.unresolved.join(", ")}`);
  if (!sameJson(dungeons?.keyLevels, EXPECTED_KEY_LEVELS))
    errors.push("Mythic+ key-level ladder changed without review");
  for (const dungeon of dungeonGroups) {
    if (!(dungeon.items || []).length) errors.push(`${dungeon.name}: no dungeon items`);
    if (dungeon.linked !== (dungeon.items || []).length)
      errors.push(`${dungeon.name}: scoped loot-table count does not match harvested gear`);
    if (!/^https:\/\//.test(dungeon.guide || "") || !(dungeon.encounters || []).length)
      errors.push(`${dungeon.name}: missing scoped guide or encounter identities`);
    for (const item of dungeon.items || []) {
      if (item.droppedBy && !dungeon.encounters.includes(item.droppedBy))
        errors.push(`${dungeon.name}: ${item.id} has unexpected source ${item.droppedBy}`);
    }
  }
  for (const duplicate of duplicateAssignments(dungeonGroups, dungeons?.allowedDuplicateItemIds || []))
    errors.push(`duplicate dungeon assignment: ${duplicate}`);

  const raidGroups = raid?.bosses || [];
  if (raidGroups.length !== 8) errors.push(`expected 8 raid bosses, found ${raidGroups.length}`);
  if (new Set(raidGroups.map((boss) => boss.name)).size !== raidGroups.length
    || new Set(raidGroups.map((boss) => boss.boss)).size !== raidGroups.length)
    errors.push("raid boss identities are not unique");
  if (!/^https:\/\//.test(raid?.itemLevelSource || "")) errors.push("raid item-level source is missing");
  for (const boss of raidGroups) {
    if (!(boss.items || []).length) errors.push(`${boss.name}: no raid items`);
    const levels = boss.dropLevels || [];
    if (levels.length !== 4 || levels.some((row) => !row.need || !Number.isFinite(row.ilvl)))
      errors.push(`${boss.name}: invalid raid drop-level ladder`);
    if (JSON.stringify(levels.map((row) => row.ilvl)) !== JSON.stringify(EXPECTED_RAID_LEVELS[boss.boss]))
      errors.push(`${boss.name}: incorrect raid drop-level ladder`);
    if (!(boss.dropAliases || []).length) errors.push(`${boss.name}: missing encounter identities`);
    for (const item of boss.items || []) {
      if (item.droppedBy && !boss.dropAliases.includes(item.droppedBy))
        errors.push(`${boss.name}: ${item.id} has unexpected source ${item.droppedBy}`);
    }
  }
  for (const duplicate of duplicateAssignments(raidGroups, raid?.allowedDuplicateItemIds || []))
    errors.push(`duplicate raid assignment: ${duplicate}`);
  const correctedOwners = raidGroups.filter((boss) => (boss.items || []).some((item) => item.id === "268231"));
  const ownershipOverride = raid?.assignmentOverrides?.["268231"];
  if (correctedOwners.length !== 1 || correctedOwners[0]?.boss !== 1
    || ownershipOverride?.boss !== 1 || !/^https:\/\//.test(ownershipOverride?.source || ""))
    errors.push("Soulslither Spaulders ownership correction is missing or stale");

  const raidItems = raidGroups.flatMap((boss) => boss.items || []);
  const raidTokenCount = raidGroups.reduce((sum, boss) => sum + (boss.items || []).filter((item) =>
    (item.classes && item.classes.length) || (boss.tokenSlot === "omni" && !item.slot)).length, 0);
  if (raid?.counts?.drops !== raidItems.length
    || raid?.counts?.gear !== raidItems.filter((item) => item.ilvl > 100).length
    || raid?.counts?.withEffect !== raidItems.filter((item) => item.effect).length
    || raid?.counts?.tokens !== raidTokenCount
    || raid?.counts?.typed !== raidItems.filter((item) => item.type).length)
    errors.push("raid summary counts are stale");
  const finalBoss = raidGroups.find((boss) => boss.boss === 8);
  const omniTokens = (finalBoss?.items || []).filter((item) => !item.slot && item.ilvl > 100);
  if (finalBoss?.tokenSlot !== "omni" || omniTokens.length !== 1 || String(omniTokens[0]?.id) !== "270909")
    errors.push("Ula'tek omni-tier token is missing or ambiguous");

  const allItems = [...raidItems, ...dungeonGroups.flatMap((dungeon) => dungeon.items || [])];
  validateItemEligibility(itemEligibility, allItems, rows, errors);
  validateCatalystAndTier(catalyst, tier, catalystAllocations, raidGroups, dungeonGroups, errors);

  for (const boss of raidGroups)
    for (const item of boss.items || []) {
      validateItemRatings(item, `raid/${boss.name}`, errors);
      validateInstanceStats(item, `raid/${boss.name}`, errors);
    }
  for (const dungeon of dungeonGroups)
    for (const item of dungeon.items || []) {
      validateItemRatings(item, `dungeon/${dungeon.name}`, errors);
      validateInstanceStats(item, `dungeon/${dungeon.name}`, errors);
    }

  for (const group of [...raidGroups, ...dungeonGroups]) {
    for (const item of group.items || []) {
      if (typeof item.uniqueEquipped !== "boolean")
        errors.push(`${group.name}: ${item.id} ${item.name} lacks unique-equipped metadata`);
      if (!Array.isArray(item.effects)
        || item.effects.some((effect) => !["Use", "Equip"].includes(effect.kind) || !effect.text))
        errors.push(`${group.name}: ${item.id} ${item.name} has malformed effect metadata`);
      // Fail-closed floor (audit 2026-08-05): the trinket UI presents the effect text as the
      // trinket's ENTIRE value, and 33 of 41 trinkets carry no secondaries to fingerprint —
      // so a Wowhead tooltip-format break that nulled the extraction would previously ship
      // green while every trinket row went blank. All current trinkets carry an effect;
      // one arriving without one is a harvest failure, not a valid item.
      else if (item.slot === "Trinket" && item.effects.length === 0)
        errors.push(`${group.name}: ${item.id} ${item.name} is a trinket with no effect text — the UI presents the effect as the trinket's whole value; a tooltip-parse break must fail red here rather than render blank rows`);
      else if (item.effects.length) {
        if (item.effectKind !== item.effects[0].kind || item.effect !== item.effects[0].text)
          errors.push(`${group.name}: ${item.id} ${item.name} legacy effect fields do not match the first effect`);
      } else if (item.effect || item.effectKind) {
        errors.push(`${group.name}: ${item.id} ${item.name} has an effect outside the effect list`);
      }
      if (item.primary != null && !ITEM_PRIMARIES.has(item.primary))
        errors.push(`${group.name}: ${item.id} ${item.name} has an invalid primary-stat label`);
      if (item.primary === "Any" && !PRIMARY_NEUTRAL_SLOTS.has(item.slot))
        errors.push(`${group.name}: ${item.id} ${item.name} uses Any primary outside a neutral slot`);
      if (ARMOR_SLOTS.has(item.slot) && !ARMOR_TYPES.has(item.type))
        errors.push(`${group.name}: ${item.id} ${item.name} lacks the armor type required by ${item.slot}`);
      if (ARMOR_TYPES.has(item.type) && item.primary !== ARMOR_PRIMARY[item.type])
        errors.push(`${group.name}: ${item.id} ${item.name} has the wrong primary policy for ${item.type}`);
      if (!item.slot && item.ilvl > 100) {
        const classToken = Array.isArray(item.classes) && item.classes.length > 0;
        const omniToken = group.boss === 8 && group.tokenSlot === "omni" && String(item.id) === "270909";
        if (!classToken && !omniToken)
          errors.push(`${group.name}: ${item.id} ${item.name} is an unexplained slotless raid item`);
      }
      if (WEAPON_SLOTS.has(item.slot) && !item.primary)
        errors.push(`${group.name}: weapon ${item.id} ${item.name} lacks a primary-stat policy`);
      if (item.slot && !PRIMARY_NEUTRAL_SLOTS.has(item.slot) && !item.primary
        && item.slot !== "Held In Off-hand")
        errors.push(`${group.name}: ${item.id} ${item.name} lacks a required primary stat`);
      if (item.type === "Shield" && !String(item.primary).includes("Str"))
        errors.push(`${group.name}: shield ${item.id} ${item.name} lost its Strength primary stat`);
    }
  }

  if (!sheet || !Array.isArray(sheet.ladder) || !sheet.ladder.length || !sheet.rewards
    || !/^https:\/\//.test(sheet.sourceUrl || ""))
    errors.push("item-level sheet is missing or malformed");
  if ((sheet?.validation?.conflicts || []).length) errors.push("item-level sheet has validation conflicts");
  if (!Number.isFinite(sheet?.validation?.total) || sheet.validation.total < 20
    || sheet.validation.confirmed !== sheet.validation.total)
    errors.push("item-level sheet validation is incomplete");
  if (!sameSet(new Set(sheet?.sheetOnlyKeys || []), new Set(EXPECTED_SHEET_ONLY)))
    errors.push("item-level provisional-source markers changed without review");
  const ladder = sheet?.ladder || [];
  if (new Set(ladder).size !== ladder.length || ladder.some((level, index) =>
    !Number.isFinite(level) || (index && level <= ladder[index - 1]))
    || ladder[0] !== 256 || ladder.at(-1) !== 344)
    errors.push("item-level ladder is incomplete or unsorted");
  const rewardTracks = Object.entries(sheet?.rewards || {});
  if (!rewardTracks.length || rewardTracks.some(([, rewards]) => !Array.isArray(rewards) || !rewards.length))
    errors.push("item-level reward tracks are empty or malformed");
  for (const [track, rewards] of rewardTracks) {
    if (rewards.some((reward) => !ladder.includes(reward.ilvl) || !reward.label))
      errors.push(`${track}: reward falls outside the validated ladder`);
  }
  if (errors.length) throw new Error(`data validation failed:\n- ${errors.join("\n- ")}`);
  return { specs: rows.length, raidBosses: raidGroups.length, dungeons: dungeonGroups.length };
}
