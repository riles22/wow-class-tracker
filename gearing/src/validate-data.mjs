import { createHash } from "node:crypto";

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
  "delveVault", "raidVault", "pvp"];
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


export function validateData({ raid, specs, dungeons, sheet, statOverrides, statBaseline,
  weaponProficiency, itemEligibility, tier, catalyst, catalystAllocations },
  { expectedPatch = "12.0.7", gearingRoot } = {}) {
  const errors = [];
  const rows = specs?.specs || [];
  if (rows.length !== 40) errors.push(`expected 40 specs, found ${rows.length}`);
  const keys = rows.map((s) => `${s.spec} ${s.class}`);
  if (new Set(keys).size !== keys.length) errors.push("spec keys are not unique");
  if (specs?.counts?.specs !== rows.length || specs?.counts?.withPriority !== rows.length
    || specs?.counts?.withArmor !== rows.length || specs?.counts?.withWeaponLoadouts !== rows.length)
    errors.push("spec summary counts are stale");

  validateGeneratedSources(rows, statOverrides, statBaseline, weaponProficiency, expectedPatch, errors);

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
