import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { actorProjectionSha256 } from "./simc-profile-projection.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GEARING_ROOT = resolve(HERE, "..");
const DEFAULT_CATALOG = join(GEARING_ROOT, "data", "simc-curation-catalog.json");
const DEFAULT_MANIFEST = join(GEARING_ROOT, "data", "simc-run-manifest.json");
const DEFAULT_WORK_ROOT = join(GEARING_ROOT, ".simc-work", "curation");
const SECONDARIES = ["Crit", "Haste", "Mast", "Vers"];
const GUIDE_MULTIPLIERS = [1, 0.75, 0.5, 0.25];
const ARMOR_TYPES = new Set(["Cloth", "Leather", "Mail", "Plate"]);
const WEAPON_SLOTS = new Set([
  "Main Hand", "One-Hand", "Two-Hand", "Off Hand", "Held In Off-hand", "Ranged",
]);
const PRIMARY_NEUTRAL_SLOTS = new Set(["Neck", "Finger", "Back", "Trinket"]);
const TIER_SLOTS = ["Head", "Shoulder", "Chest", "Hands", "Legs"];
const PROFILE_SETUP_FIELDS = [
  "race", "level", "role", "specialization", "profile_source", "party", "ready_type",
  "bugs", "valid_fight_style", "scale_player", "potion_used", "timeofday", "zandalari_loa",
  "vulpera_tricks", "earthen_mineral", "invert_scaling", "reaction_offset", "reaction_max",
  "reaction_mean", "reaction_stddev", "reaction_nu", "world_lag", "world_lag_stddev",
  "brain_lag", "brain_lag_stddev", "potion", "flask", "food", "augmentation",
  "temporary_enchant", "gear",
];
const GEAR_SLOT_BY_KEY = Object.freeze({
  head: "Head", neck: "Neck", shoulder: "Shoulder", shoulders: "Shoulder", back: "Back",
  chest: "Chest", wrist: "Wrist", wrists: "Wrist", hands: "Hands", waist: "Waist",
  legs: "Legs", feet: "Feet", finger1: "Finger1", finger2: "Finger2",
  trinket1: "Trinket1", trinket2: "Trinket2", main_hand: "MainHand", off_hand: "OffHand",
});
const GEAR_KEYS = new Set(Object.keys(GEAR_SLOT_BY_KEY));
const PERMANENT_ENHANCEMENT_KEYS = ["gem_id", "enchant", "enchant_id"];
const PERMANENT_ENHANCEMENT_KEY_SET = new Set(PERMANENT_ENHANCEMENT_KEYS);
const TERTIARY_STATS = new Set(["Avoidance", "Leech", "Speed"]);
const CONSUMABLE_KEYS = new Set([
  "potion", "flask", "food", "augmentation", "temporary_enchant",
]);

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}

function canonicalJson(value) {
  return JSON.stringify(canonical(value));
}

function round(value, digits) {
  const factor = 10 ** digits;
  const sign = Math.sign(value) || 1;
  const scaled = Math.abs(value) * factor;
  const lower = Math.floor(scaled);
  const fraction = scaled - lower;
  const tolerance = Number.EPSILON * Math.max(1, scaled) * 4;
  const integer = Math.abs(fraction - 0.5) <= tolerance
    ? (lower % 2 === 0 ? lower : lower + 1) : Math.round(scaled);
  return sign * integer / factor;
}

function cleanId(value, label) {
  assert(/^[a-z0-9][a-z0-9-]*$/.test(value || ""), `${label} is unsafe: ${value || "missing"}`);
  return value;
}

function normalizeSlot(slot) {
  if (slot === "Shoulders") return "Shoulder";
  if (slot === "Wrists") return "Wrist";
  return slot;
}

function simcName(name) {
  return String(name || "item").toLowerCase().replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function guideWeights(priority) {
  const weights = Object.fromEntries(SECONDARIES.map((stat) => [stat, 0]));
  for (const [index, stat] of (priority?.secondaries || []).entries())
    if (SECONDARIES.includes(stat)) weights[stat] = GUIDE_MULTIPLIERS[index] || 0;
  return weights;
}

function allocationSource(item, allocations) {
  return allocations?.items?.[String(item.id)] || item;
}

function itemAllocations(item, allocations) {
  return allocationSource(item, allocations)?.allocations || item.secondaryRatings || {};
}

function itemTertiaries(item, allocations) {
  const source = allocationSource(item, allocations);
  const tertiaries = Array.isArray(source?.tertiaries) ? source.tertiaries.slice() : [];
  const tertiaryRatings = source?.tertiaryRatings && !Array.isArray(source.tertiaryRatings)
    ? { ...source.tertiaryRatings } : {};
  assert(tertiaries.every((stat) => TERTIARY_STATS.has(stat)),
    `${item.id} has an unsupported tertiary stat`);
  assert(Object.entries(tertiaryRatings).every(([stat, value]) =>
    TERTIARY_STATS.has(stat) && Number.isFinite(Number(value)) && Number(value) >= 0),
  `${item.id} has invalid tertiary ratings`);
  return { tertiaries, tertiaryRatings };
}

export function scoreItem(item, weights, allocations) {
  const ratings = itemAllocations(item, allocations);
  const total = Object.values(ratings).reduce((sum, value) => sum + Number(value || 0), 0);
  if (total) return (item.secondaries || []).reduce((sum, stat) =>
    sum + Number(ratings[stat] || 0) * Number(weights[stat] || 0) / total, 0);
  const stats = item.secondaries || [];
  return stats.length
    ? stats.reduce((sum, stat) => sum + Number(weights[stat] || 0), 0) / stats.length : 0;
}

function primaryMatches(spec, item) {
  const primary = spec.statPriority?.primary;
  if (!primary) return false;
  if (!item.primary) {
    if (PRIMARY_NEUTRAL_SLOTS.has(normalizeSlot(item.slot))) return true;
    const exceptions = spec.weaponPrimaryStatExceptions || {};
    return (exceptions.itemTypes || []).includes(item.type)
      || (exceptions.inventorySlots || []).includes(item.slot);
  }
  if (item.primary === "Any") return true;
  return item.primary.split("/").includes(primary.slice(0, 3));
}

function handMatches(hand, item) {
  return !!hand && !hand.mustBeEmpty
    && (hand.inventorySlots || []).includes(item.slot)
    && (hand.itemTypes || []).some((type) => type === (item.type == null ? null : item.type));
}

function recommendationMatches(spec, item, eligibility) {
  const rule = eligibility?.items?.[String(item.id)];
  return !rule || (rule.eligibleSpecs || []).includes(`${spec.spec} ${spec.class}`);
}

export function canUseItem(spec, item, eligibility = { items: {} }) {
  if (ARMOR_TYPES.has(item.type) && spec.armor && item.type !== spec.armor) return false;
  if (WEAPON_SLOTS.has(item.slot)) {
    const matches = (spec.weaponLoadouts || []).some((loadout) =>
      ["mainHand", "offHand"].some((hand) => handMatches(loadout.hands?.[hand], item)));
    if (!matches) return false;
  }
  return primaryMatches(spec, item) && recommendationMatches(spec, item, eligibility);
}

export function flattenRaidItems(data) {
  return (data?.bosses || []).flatMap((boss) => (boss.items || []).map((item) => ({
    ...item,
    slot: normalizeSlot(item.slot),
    sourceKind: "raid",
    sourceKey: boss.name,
  })));
}

export function flattenDungeonItems(data) {
  return (data?.dungeons || []).flatMap((dungeon) => (dungeon.items || []).map((item) => ({
    ...item,
    slot: normalizeSlot(item.slot),
    sourceKind: "dungeon",
    sourceKey: dungeon.name,
  })));
}

export function flattenTierItems(data) {
  return (data?.sets || []).flatMap((set) => (set.items || []).map((item) => ({
    ...item,
    slot: normalizeSlot(item.slot),
    tierClass: set.class,
    sourceKind: "direct-tier",
    sourceKey: set.name,
  })));
}

function stableItemSort(left, right, weights, allocations) {
  const difference = scoreItem(right, weights, allocations) - scoreItem(left, weights, allocations);
  if (Math.abs(difference) > 1e-12) return difference;
  return String(left.id).localeCompare(String(right.id), "en", { numeric: true });
}

function bestItem(items, weights, allocations) {
  return items.slice().sort((left, right) => stableItemSort(left, right, weights, allocations))[0] || null;
}

function enhancementValue(key, value, label) {
  const text = String(value ?? "");
  const valid = key === "gem_id" ? /^[1-9]\d*(?:\/[1-9]\d*)*$/.test(text)
    : key === "enchant_id" ? /^[1-9]\d*$/.test(text)
      : /^[a-z0-9][a-z0-9_.:-]*$/.test(text);
  assert(valid, `${label} has an unsafe ${key} value`);
  return text;
}

function validatedEnhancementMap(value, label) {
  assert(value && typeof value === "object" && !Array.isArray(value),
    `${label} enhancement map is missing`);
  const entries = Object.entries(value);
  assert(entries.length, `${label} enhancement map is empty`);
  const allowedSlots = new Set(Object.values(GEAR_SLOT_BY_KEY));
  const normalized = {};
  for (const [slot, attributes] of entries) {
    assert(allowedSlots.has(slot), `${label} enhancement slot ${slot} is invalid`);
    assert(attributes && typeof attributes === "object" && !Array.isArray(attributes),
      `${label} ${slot} enhancements are invalid`);
    const attributeEntries = Object.entries(attributes);
    assert(attributeEntries.length, `${label} ${slot} enhancements are empty`);
    assert(attributeEntries.every(([key]) => PERMANENT_ENHANCEMENT_KEY_SET.has(key)),
      `${label} ${slot} has unsupported enhancement attributes`);
    assert(!(Object.hasOwn(attributes, "enchant") && Object.hasOwn(attributes, "enchant_id")),
      `${label} ${slot} conflicts between enchant and enchant_id`);
    normalized[slot] = Object.fromEntries(PERMANENT_ENHANCEMENT_KEYS
      .filter((key) => Object.hasOwn(attributes, key))
      .map((key) => [key, enhancementValue(key, attributes[key], `${label} ${slot}`)]));
  }
  return normalized;
}

function gearLine(slot, item, itemLevel, redirectedBaseItemId, enhancements) {
  const keys = {
    Head: "head", Neck: "neck", Shoulder: "shoulders", Back: "back", Chest: "chest",
    Wrist: "wrists", Hands: "hands", Waist: "waist", Legs: "legs", Feet: "feet",
    Finger1: "finger1", Finger2: "finger2", Trinket1: "trinket1", Trinket2: "trinket2",
    MainHand: "main_hand", OffHand: "off_hand",
  };
  const key = keys[slot];
  assert(key && item, `cannot serialize missing ${slot} item`);
  return `${key}=${simcName(item.name)},id=${item.id},ilevel=${itemLevel}`
    + (redirectedBaseItemId ? `,redirected_base_stats=${redirectedBaseItemId}` : "")
    + PERMANENT_ENHANCEMENT_KEYS.filter((attribute) => Object.hasOwn(enhancements, attribute))
      .map((attribute) => `,${attribute}=${enhancements[attribute]}`).join("");
}

function reviewedCandidates(items, spec, eligibility) {
  return items.filter((item) => canUseItem(spec, item, eligibility));
}

export function buildCuratedGear({ spec, priority, raidData, dungeonData, tierData, allocations,
  eligibility, policy, weaponLoadoutId, enhancementSource }) {
  const weights = guideWeights(priority);
  const itemLevel = policy.itemLevel;
  const tierPieceCount = policy.tierPieces;
  assert(Number.isInteger(itemLevel) && itemLevel > 0, "curation policy needs a positive item level");
  assert(Number.isInteger(tierPieceCount) && tierPieceCount >= 4 && tierPieceCount <= 5,
    "curation policy tierPieces must be four or five");

  const raid = reviewedCandidates(flattenRaidItems(raidData), spec, eligibility);
  const reviewed = raid.concat(reviewedCandidates(flattenDungeonItems(dungeonData), spec,
    eligibility));
  const directTier = flattenTierItems(tierData).filter((item) => item.tierClass === spec.class);
  const tierChoices = TIER_SLOTS.map((slot) => {
    const direct = directTier.find((item) => item.slot === slot);
    assert(direct, `no direct ${slot} tier item exists for ${spec.class}`);
    const bases = reviewed.filter((item) => item.slot === slot && ARMOR_TYPES.has(item.type));
    const convertedBase = bestItem(bases, weights, allocations);
    const directScore = scoreItem(direct, weights, allocations);
    const convertedScore = convertedBase ? scoreItem(convertedBase, weights, allocations) : -Infinity;
    const tier = convertedScore > directScore
      ? { item: direct, base: convertedBase, score: convertedScore, mode: "catalyst" }
      : { item: direct, base: null, score: directScore, mode: "direct" };
    const off = bestItem(bases, weights, allocations);
    return { slot, tier, off,
      delta: off ? tier.score - scoreItem(off, weights, allocations) : Number.POSITIVE_INFINITY };
  });
  const tierSlotSet = new Set(tierChoices.slice().sort((left, right) =>
    right.delta - left.delta || TIER_SLOTS.indexOf(left.slot) - TIER_SLOTS.indexOf(right.slot))
    .slice(0, tierPieceCount).map((choice) => choice.slot));

  const selected = [];
  for (const choice of tierChoices) {
    if (tierSlotSet.has(choice.slot)) selected.push({ slot: choice.slot, item: choice.tier.item,
      redirectedBaseItemId: choice.tier.base?.id || null, tierMode: choice.tier.mode,
      allocationItem: choice.tier.base || choice.tier.item });
    else {
      assert(choice.off,
        `tier selection left ${spec.spec} ${spec.class} ${choice.slot} without a legal off-piece`);
      selected.push({ slot: choice.slot, item: choice.off, redirectedBaseItemId: null,
        tierMode: "off-piece", allocationItem: choice.off });
    }
  }

  for (const slot of ["Neck", "Back", "Wrist", "Waist", "Feet"]) {
    const item = bestItem(reviewed.filter((candidate) => candidate.slot === slot), weights,
      allocations);
    assert(item, `no eligible reviewed Season 2 ${slot} exists for ${spec.spec} ${spec.class}`);
    selected.push({ slot, item, redirectedBaseItemId: null, tierMode: null, allocationItem: item });
  }

  const rings = reviewed.filter((item) => item.slot === "Finger")
    .sort((left, right) => stableItemSort(left, right, weights, allocations));
  assert(rings.length >= 2, `fewer than two eligible Season 2 raid rings exist for ${spec.spec} ${spec.class}`);
  selected.push({ slot: "Finger1", item: rings[0], redirectedBaseItemId: null,
    tierMode: null, allocationItem: rings[0] });
  const secondRing = rings.find((item) => String(item.id) !== String(rings[0].id)) || rings[1];
  selected.push({ slot: "Finger2", item: secondRing, redirectedBaseItemId: null,
    tierMode: null, allocationItem: secondRing });

  const primary = spec.statPriority.primary;
  const trinketIds = policy.trinketIdsByPrimary?.[primary] || [];
  assert(trinketIds.length === 2, `curation policy needs two ${primary} trinket ids`);
  for (const [index, id] of trinketIds.entries()) {
    const item = reviewed.find((candidate) => String(candidate.id) === String(id));
    assert(item && canUseItem(spec, item, eligibility), `${id} is not an eligible ${primary} trinket`);
    selected.push({ slot: `Trinket${index + 1}`, item, redirectedBaseItemId: null,
      tierMode: null, allocationItem: item });
  }

  const loadout = (spec.weaponLoadouts || []).find((candidate) => candidate.id === weaponLoadoutId);
  assert(loadout, `${spec.spec} ${spec.class} lacks weapon loadout ${weaponLoadoutId}`);
  let main = null;
  for (const [handName, outputSlot] of [["mainHand", "MainHand"], ["offHand", "OffHand"]]) {
    const hand = loadout.hands?.[handName];
    if (!hand || hand.mustBeEmpty) continue;
    const candidates = reviewed.filter((item) => handMatches(hand, item));
    let item = bestItem(candidates, weights, allocations);
    if (handName === "offHand" && main?.uniqueEquipped && String(item?.id) === String(main.id))
      item = bestItem(candidates.filter((candidate) => String(candidate.id) !== String(main.id)),
        weights, allocations);
    assert(item, `no eligible ${weaponLoadoutId} ${handName} exists for ${spec.spec} ${spec.class}`);
    selected.push({ slot: outputSlot, item, redirectedBaseItemId: null,
      tierMode: null, allocationItem: item });
    if (handName === "mainHand") main = item;
  }

  const order = ["Head", "Neck", "Shoulder", "Back", "Chest", "Wrist", "Hands", "Waist",
    "Legs", "Feet", "Finger1", "Finger2", "Trinket1", "Trinket2", "MainHand", "OffHand"];
  selected.sort((left, right) => order.indexOf(left.slot) - order.indexOf(right.slot));
  assert(enhancementSource && typeof enhancementSource === "object",
    `${spec.spec} ${spec.class} lacks an enhancement source`);
  cleanId(enhancementSource.candidateId, "enhancement source candidate id");
  assert(/^[A-Za-z0-9_.-]+\.simc$/.test(enhancementSource.generatorFile || "")
    && typeof enhancementSource.sourceProfileName === "string"
    && enhancementSource.sourceProfileName.trim()
    && /^[a-f0-9]{64}$/.test(enhancementSource.generatorSha256 || ""),
  `${spec.spec} ${spec.class} enhancement source identity is invalid`);
  const enhancementsBySlot = validatedEnhancementMap(enhancementSource.slots,
    enhancementSource.candidateId);
  const selectedSlots = new Set(selected.map((entry) => entry.slot));
  assert(Object.keys(enhancementsBySlot).every((slot) => selectedSlots.has(slot)),
    `${enhancementSource.candidateId} enhances a slot absent from the curated gear shell`);
  const enhancementIdentity = {
    candidateId: enhancementSource.candidateId,
    generatorFile: enhancementSource.generatorFile,
    sourceProfileName: enhancementSource.sourceProfileName,
    generatorSha256: enhancementSource.generatorSha256,
  };
  const redirectedBaseItemIds = selected.map((entry) => entry.redirectedBaseItemId)
    .filter(Boolean).map(String);
  const items = selected.map((entry) => {
    const tertiary = itemTertiaries(entry.allocationItem, allocations);
    return {
      slot: entry.slot,
      id: String(entry.item.id),
      name: entry.item.name,
      ...(entry.redirectedBaseItemId
        ? { redirectedBaseItemId: String(entry.redirectedBaseItemId) } : {}),
      ...(entry.tierMode ? { tierMode: entry.tierMode } : {}),
      allocation: itemAllocations(entry.allocationItem, allocations),
      tertiaries: tertiary.tertiaries,
      tertiaryRatings: tertiary.tertiaryRatings,
      enhancements: enhancementsBySlot[entry.slot] || {},
      enhancementSource: enhancementIdentity,
    };
  });
  const tertiaryRatingsPresent = items.some((entry) => Object.values(entry.tertiaryRatings)
    .some((value) => Number(value) > 0));
  const plan = {
    policyId: policy.curationPolicyId || policy.policyId,
    itemLevel,
    tierPieces: tierPieceCount,
    weaponLoadoutId,
    weights,
    redirectedBaseItemIds,
    tertiaryRatingsPresent,
    items,
  };
  return {
    ...plan,
    gearPlanSha256: sha256(Buffer.from(canonicalJson(plan))),
    lines: selected.map((entry) => gearLine(entry.slot, entry.item, itemLevel,
      entry.redirectedBaseItemId, enhancementsBySlot[entry.slot] || {})),
  };
}

function peelComment(line) {
  let text = line;
  let depth = 0;
  while (/^\s*#/.test(text)) {
    text = text.replace(/^(\s*)#\s?/, "$1");
    depth += 1;
  }
  return { text, depth };
}

function stripCommentDepth(line, depth) {
  let text = line;
  if (!text.trim()) return "";
  for (let index = 0; index < depth; index++) {
    assert(/^\s*#/.test(text), `actor block comment depth changes before save: ${line}`);
    text = text.replace(/^(\s*)#\s?/, "$1");
  }
  return text;
}

function assignment(line) {
  const match = line.match(/^\s*([a-z][a-z0-9_.]*)\s*=\s*(.*?)\s*$/i);
  return match ? { key: match[1].toLowerCase(), value: match[2] } : null;
}

function unquote(value) {
  const text = String(value || "").trim();
  if ((text.startsWith('"') && text.endsWith('"'))
    || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  return text;
}

function actorBlock(generatorText, sourceProfileName) {
  const lines = generatorText.replace(/\r\n/g, "\n").split("\n");
  let start = -1;
  let depth = -1;
  for (let index = 0; index < lines.length; index++) {
    const peeled = peelComment(lines[index]);
    const entry = assignment(peeled.text);
    if (entry && unquote(entry.value) === sourceProfileName) {
      start = index;
      depth = peeled.depth;
      break;
    }
  }
  assert(start >= 0, `official generator actor ${sourceProfileName} was not found`);
  const block = [];
  for (const original of lines.slice(start)) {
    const text = stripCommentDepth(original, depth);
    block.push(text);
    if (assignment(text)?.key === "save") return block;
  }
  throw new Error(`official generator actor ${sourceProfileName} has no save boundary`);
}

function gearEnhancements(value, label) {
  const enhancements = {};
  for (const part of String(value).split(",").slice(1)) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim().toLowerCase();
    if (!PERMANENT_ENHANCEMENT_KEY_SET.has(key)) continue;
    assert(!Object.hasOwn(enhancements, key), `${label} repeats ${key}`);
    enhancements[key] = enhancementValue(key, part.slice(separator + 1).trim(), label);
  }
  assert(!(Object.hasOwn(enhancements, "enchant") && Object.hasOwn(enhancements, "enchant_id")),
    `${label} conflicts between enchant and enchant_id`);
  return enhancements;
}

export function extractPermanentEnhancements(generatorText, sourceProfileName) {
  const enhancementsBySlot = {};
  for (const line of actorBlock(generatorText, sourceProfileName)) {
    const entry = assignment(line);
    const slot = GEAR_SLOT_BY_KEY[entry?.key];
    if (!slot) continue;
    const enhancements = gearEnhancements(entry.value, `${sourceProfileName} ${slot}`);
    if (!Object.keys(enhancements).length) continue;
    assert(!Object.hasOwn(enhancementsBySlot, slot),
      `${sourceProfileName} repeats enhanced slot ${slot}`);
    enhancementsBySlot[slot] = enhancements;
  }
  return validatedEnhancementMap(enhancementsBySlot, sourceProfileName);
}

export function extractActorTalents(generatorText, sourceProfileName) {
  const values = actorBlock(generatorText, sourceProfileName)
    .map(assignment).filter((entry) => entry?.key === "talents")
    .map((entry) => unquote(entry.value));
  assert(values.length === 1 && /^[A-Za-z0-9+/=]+$/.test(values[0] || ""),
    `${sourceProfileName} must have one safe talent import`);
  return values[0];
}

export function pinnedCandidateTalents(generatorText, candidate) {
  assert(/^[A-Za-z0-9+/=]+$/.test(candidate?.talents || ""),
    `${candidate?.candidateId || "candidate"} lacks a safe catalog-pinned talent import`);
  if (candidate.talentSourceMode === "official-generator") {
    const sourceTalents = extractActorTalents(generatorText, candidate.sourceProfileName);
    assert(candidate.talents === sourceTalents,
      `${candidate.candidateId} talents differ from its pinned official generator actor`);
  }
  return candidate.talents;
}

export function extractActorSeed(generatorText, sourceProfileName, { talents, race, level, actorName,
  gearLines, profileFile, provenanceComments = [] }) {
  assert(/^[A-Za-z0-9+/=]+$/.test(talents || ""),
    `${sourceProfileName} lacks a safe catalog-pinned talent import`);
  const output = [];
  let sawActor = false;
  let sawTalents = false;
  let sawRace = false;
  for (const text of actorBlock(generatorText, sourceProfileName)) {
    const entry = assignment(text);
    if (!entry) {
      if (text.trim() && !text.trimStart().startsWith("#")) output.push(text);
      continue;
    }
    if (!sawActor && unquote(entry.value) === sourceProfileName) {
      output.push(`${entry.key}="${actorName || sourceProfileName}"`);
      sawActor = true;
      continue;
    } else if (entry.key === "save" || GEAR_KEYS.has(entry.key) || CONSUMABLE_KEYS.has(entry.key)
      || entry.key.startsWith("set_bonus")) continue;
    if (entry.key === "talents") {
      output.push(`talents=${talents}`);
      sawTalents = true;
    } else if (entry.key === "race") {
      output.push(`race=${race || unquote(entry.value)}`);
      sawRace = true;
    } else if (entry.key === "level" && level) {
      output.push(`level=${level}`);
    } else output.push(text);
  }
  assert(sawActor, `${sourceProfileName} actor block lacks its class declaration`);
  assert(sawTalents, `${sourceProfileName} actor block lacks talents`);
  assert(sawRace, `${sourceProfileName} actor block lacks race`);
  return [
    ...provenanceComments.map((comment) => `# ${comment}`),
    ...output,
    "",
    ...gearLines,
    "",
    `save=${profileFile}`,
    "",
  ].join("\n");
}

function sealedProfileBytes(bytes, provenanceComments) {
  const block = `${provenanceComments.map((comment) => `# ${comment}`).join("\n")}\n`;
  const text = bytes.toString("utf8");
  if (text.startsWith(block)) return bytes;
  assert(!/^# Curated same-gear profile:/m.test(text),
    "materialized profile contains a conflicting curation provenance block");
  return Buffer.from(`${block}${text}`);
}

function safeIntegerSeed(value) {
  const hex = sha256(Buffer.from(value)).slice(0, 16);
  const span = BigInt(Number.MAX_SAFE_INTEGER) - 1n;
  return ((BigInt(`0x${hex}`) % span) + 1n).toString();
}

function spawnProcess(executable, args, options) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(executable, args, { ...options, shell: false, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk; });
    child.stderr?.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolvePromise({ stdout, stderr })
      : reject(new Error(`SimulationCraft exited ${code}: ${(stderr || stdout).slice(-3000)}`)));
  });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function atomicWriteFile(path, value) {
  const temporary = join(dirname(path), `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, value, { flag: "wx" });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function verifyExecutable(simc, build) {
  const bytes = await readFile(resolve(simc));
  const actual = sha256(bytes);
  assert(actual === build.simcExeSha256,
    `SimulationCraft executable SHA-256 ${actual} does not match ${build.simcExeSha256}`);
  return resolve(simc);
}

function reportSetup(player) {
  return Object.fromEntries(PROFILE_SETUP_FIELDS.map((field) => [field, player?.[field] ?? null]));
}

function parseSelectionReport(bytes, expected) {
  const text = bytes.toString("utf8");
  const report = JSON.parse(text);
  const options = report.sim?.options || {};
  const player = report.sim?.players?.[0];
  const dps = player?.collected_data?.dps;
  const rawSeed = text.match(/"seed"\s*:\s*(\d+)/)?.[1];
  assert(report.version === expected.build.version && String(report.git_revision).startsWith(expected.build.revision),
    `${expected.candidate.sourceProfileName} selection used the wrong SimC build`);
  assert((report.ptr_enabled === 1 || report.ptr_enabled === true)
    && options.dbc?.version_used === "PTR", "selection report did not use PTR data");
  assert(options.fight_style === "Patchwerk" && options.desired_targets === expected.targets,
    "selection report scenario differs from the request");
  assert(options.threads === 2 && options.iterations >= 5000 && options.iterations < 5002,
    "selection report iterations or threads differ from policy");
  assert(rawSeed === expected.seed, "selection report seed differs from the request");
  assert(options.fixed_time === true && options.max_time === 300
    && options.vary_combat_length === 0.2 && options.optimal_raid === 1,
  "selection report combat settings differ from policy");
  assert(options.scaling?.calculate_scale_factors !== 1 && player?.scale_factors === undefined,
    "selection report unexpectedly calculated scale factors");
  assert(player?.name === expected.candidate.sourceProfileName,
    `selection actor ${player?.name || "missing"} differs from ${expected.candidate.sourceProfileName}`);
  assert(Number.isFinite(dps?.mean) && dps.mean > 0 && Number.isFinite(dps?.mean_std_dev),
    "selection report lacks baseline DPS");
  const confidence = options.confidence_estimator;
  assert(Number.isFinite(confidence) && confidence > 0, "selection report lacks confidence data");
  const setup = reportSetup(player);
  return {
    iterations: options.iterations,
    baselineDps: round(dps.mean, 4),
    baselineDpsError: round(dps.mean_std_dev * confidence, 4),
    setupSha256: sha256(Buffer.from(canonicalJson(setup))),
    resultSha256: sha256(bytes),
  };
}

function profilePriority(spec, logical) {
  if (logical.guideProfileName === "General") return spec.statPriority;
  const variant = (spec.statPriorityVariants || []).find((entry) =>
    entry.name === logical.guideProfileName);
  assert(variant, `${logical.specKey} lacks guide profile ${logical.guideProfileName}`);
  return { primary: spec.statPriority.primary, secondaries: variant.secondaries };
}

function generatorSource(build, generatorFile) {
  return `https://github.com/simulationcraft/simc/blob/${build.commit}/profiles/generators/MID2/${basename(generatorFile)}`;
}

function curatedActorName(candidateId) {
  return `MID2_Curated_${candidateId.split("-").map((part) =>
    part.charAt(0).toUpperCase() + part.slice(1)).join("_")}`;
}

export function catalogEnhancementCandidate(logical) {
  cleanId(logical?.enhancementSourceCandidateId, "enhancement source candidate id");
  const candidate = logical?.candidates?.find((entry) =>
    entry.candidateId === logical.enhancementSourceCandidateId);
  assert(candidate,
    `${logical?.profileId || "logical profile"} enhancement source candidate is not in its catalog candidates`);
  return candidate;
}

export function reviewedEnhancementSource(logical, candidate, generator) {
  const reviewed = logical.enhancementPlan;
  assert(reviewed && reviewed.sourceCandidateId === logical.enhancementSourceCandidateId
    && reviewed.generatorFile === candidate.generatorFile
    && reviewed.sourceProfileName === candidate.sourceProfileName
    && reviewed.generatorSha256 === generator.sha256,
  `${logical.profileId} reviewed enhancement source differs from its catalog candidate`);
  const extracted = extractPermanentEnhancements(generator.text, candidate.sourceProfileName);
  assert(canonicalJson(extracted) === canonicalJson(
    validatedEnhancementMap(reviewed.slots, logical.profileId)),
  `${logical.profileId} reviewed enhancement map differs from its pinned generator actor`);
  return {
    candidateId: candidate.candidateId,
    generatorFile: candidate.generatorFile,
    sourceProfileName: candidate.sourceProfileName,
    generatorSha256: generator.sha256,
    slots: extracted,
  };
}

export function curatedSelectionReportId(curationPolicyId, logicalProfileId, scenarioId,
  candidateId) {
  return `${cleanId(curationPolicyId, "curation policy id")}`
    + `-${cleanId(logicalProfileId, "logical profile id")}`
    + `-${cleanId(scenarioId, "scenario id")}`
    + `-${cleanId(candidateId, "candidate id")}-selection`;
}

export async function prepareCatalog({ simc, catalogPath = DEFAULT_CATALOG,
  manifestPath = DEFAULT_MANIFEST, workRoot = DEFAULT_WORK_ROOT, profileIds = [],
  onProgress = console.log }) {
  const [catalog, manifest, specsData, raidData, dungeonData, tierData, allocations, eligibility] = await Promise.all([
    readJson(catalogPath),
    readJson(manifestPath),
    readJson(join(GEARING_ROOT, "data", "specs.json")),
    readJson(join(GEARING_ROOT, "data", "raid-items.json")),
    readJson(join(GEARING_ROOT, "data", "dungeon-items.json")),
    readJson(join(GEARING_ROOT, "data", "tier-items.json")),
    readJson(join(GEARING_ROOT, "data", "catalyst-stat-allocations.json")),
    readJson(join(GEARING_ROOT, "data", "item-eligibility-overrides.json")),
  ]);
  assert(catalog.schemaVersion === 1 && Array.isArray(catalog.logicalProfiles),
    "curation catalog is missing or malformed");
  assert(catalog.generatorFileSha256 && !Array.isArray(catalog.generatorFileSha256),
    "curation catalog lacks pinned generator file hashes");
  const build = manifest.builds.find((entry) => entry.buildId === catalog.buildId);
  assert(build && build.commit === catalog.generatorCommit,
    "curation catalog build does not match the run manifest");
  const executable = await verifyExecutable(simc, build);
  const generatorRoot = join(dirname(executable), "profiles", "generators", "MID2");
  const selectedProfiles = catalog.logicalProfiles.filter((logical) =>
    !profileIds.length || profileIds.includes(logical.profileId));
  assert(selectedProfiles.length, "no requested curation profiles were found");
  const bundleRoot = join(resolve(workRoot), build.revision);
  const profileRoot = join(bundleRoot, "profiles");
  const seedRoot = join(bundleRoot, "seeds");
  const selectionRoot = join(bundleRoot, "selections");
  await Promise.all([mkdir(profileRoot, { recursive: true }), mkdir(seedRoot, { recursive: true }),
    mkdir(selectionRoot, { recursive: true })]);
  const policy = catalog.curationPolicies.find((entry) =>
    (entry.curationPolicyId || entry.policyId) === catalog.defaultCurationPolicyId);
  assert(policy, "catalog default curation policy is missing");
  const specs = new Map((specsData.specs || []).map((spec) => [`${spec.spec} ${spec.class}`, spec]));
  const generators = new Map();
  const loadGenerator = async (candidate) => {
    assert(/^[A-Za-z0-9_.-]+\.simc$/.test(candidate.generatorFile || "")
      && basename(candidate.generatorFile) === candidate.generatorFile,
    `${candidate.candidateId} generator filename is unsafe`);
    if (generators.has(candidate.generatorFile)) return generators.get(candidate.generatorFile);
    const path = join(generatorRoot, candidate.generatorFile);
    const bytes = await readFile(path);
    const digest = catalog.generatorFileSha256[candidate.generatorFile];
    assert(/^[a-f0-9]{64}$/.test(digest || "") && sha256(bytes) === digest,
      `${candidate.generatorFile} differs from its pinned SHA-256`);
    const loaded = { path, bytes, text: bytes.toString("utf8"), sha256: digest };
    generators.set(candidate.generatorFile, loaded);
    return loaded;
  };
  const prepared = [];

  for (const logical of selectedProfiles) {
    cleanId(logical.profileId, "logical profile id");
    const spec = specs.get(logical.specKey);
    assert(spec && spec.role === "DPS", `unknown conventional DPS spec ${logical.specKey}`);
    assert(Array.isArray(logical.candidates) && logical.candidates.length,
      `${logical.profileId} has no curation candidates`);
    const candidateIds = logical.candidates.map((candidate) =>
      cleanId(candidate.candidateId, "candidate id"));
    assert(new Set(candidateIds).size === candidateIds.length,
      `${logical.profileId} repeats a candidate id`);
    const enhancementCandidate = catalogEnhancementCandidate(logical);
    const enhancementGenerator = await loadGenerator(enhancementCandidate);
    const enhancementSource = reviewedEnhancementSource(logical, enhancementCandidate,
      enhancementGenerator);
    const priority = profilePriority(spec, logical);
    const gear = buildCuratedGear({ spec, priority, raidData, dungeonData, tierData, allocations,
      eligibility, policy, weaponLoadoutId: logical.weaponLoadoutId, enhancementSource });
    assert(/^[a-f0-9]{64}$/.test(logical.expectedGearPlanSha256 || "")
      && gear.gearPlanSha256 === logical.expectedGearPlanSha256,
    `${logical.profileId} gear plan differs from its reviewed catalog digest`);
    const curationPolicyId = policy.curationPolicyId || policy.policyId;
    const gearSetId = `${curationPolicyId}-${logical.profileId}`;
    const candidateProfiles = [];
    let canonicalRace = logical.race || null;
    for (const candidate of logical.candidates) {
      assert(/^[A-Za-z0-9_.-]+\.simc$/.test(candidate.profileFile || ""),
        `${candidate.candidateId} profile filename is unsafe`);
      const generator = await loadGenerator(candidate);
      const generatorSha256 = generator.sha256;
      const generatorText = generator.text;
      const talents = pinnedCandidateTalents(generatorText, candidate);
      if (!canonicalRace) {
        canonicalRace = actorBlock(generatorText, candidate.sourceProfileName)
          .map(assignment).find((entry) => entry?.key === "race")?.value;
        canonicalRace = unquote(canonicalRace);
      }
      assert(canonicalRace, `${logical.profileId} has no canonical race`);
      const sourceActorName = candidate.sourceProfileName;
      const materializedActorName = curatedActorName(candidate.candidateId);
      const provenanceComments = [
        `Curated same-gear profile: ${gearSetId}`,
        `Upstream actor name: ${sourceActorName}`,
        `Upstream actor/APL: ${generatorSource(build, candidate.generatorFile)}`,
        `Upstream generator SHA-256: ${generatorSha256}`,
        `Talent source: ${candidate.talentSource}`,
        `Gear plan SHA-256: ${gear.gearPlanSha256}`,
      ];
      const seed = extractActorSeed(generatorText, candidate.sourceProfileName, {
        talents,
        race: canonicalRace,
        level: policy.level,
        actorName: materializedActorName,
        gearLines: gear.lines,
        profileFile: candidate.profileFile,
        provenanceComments,
      });
      const seedPath = join(seedRoot, `${candidate.candidateId}.seed.simc`);
      const profilePath = join(profileRoot, candidate.profileFile);
      await writeFile(seedPath, seed);
      await spawnProcess(executable, [
        "ptr=1", "item_db_source=local", seedPath, "iterations=1", "threads=1", "fixed_time=1",
        "max_time=1",
      ], { cwd: profileRoot });
      const profileBytes = sealedProfileBytes(await readFile(profilePath), provenanceComments);
      assert(/^[a-f0-9]{64}$/.test(candidate.actorProjectionSha256 || "")
        && actorProjectionSha256(profileBytes, materializedActorName)
          === candidate.actorProjectionSha256,
      `${candidate.candidateId} materialized actor/APL differs from its reviewed catalog digest`);
      await writeFile(profilePath, profileBytes);
      for (const targets of [1, 5]) await spawnProcess(executable, [
        "ptr=1", "item_db_source=local", profilePath, "iterations=1", "threads=1", "fixed_time=1",
        "max_time=1", "fight_style=Patchwerk", `desired_targets=${targets}`,
      ], { cwd: profileRoot });
      const details = {
        ...candidate,
        generatorActorName: sourceActorName,
        sourceProfileName: materializedActorName,
        generatorSha256,
        buildId: build.buildId,
        sourceMode: "curated-same-gear",
        generatorSource: generatorSource(build, candidate.generatorFile),
        curationPolicyId,
        curationReviewedAt: catalog.reviewedAt,
        gearSetId,
        gearPlanSha256: gear.gearPlanSha256,
        itemDbSource: "local",
        redirectedBaseItemIds: gear.redirectedBaseItemIds,
        tertiaryRatingsPresent: gear.tertiaryRatingsPresent,
        profileSha256: sha256(profileBytes),
        profilePath,
      };
      candidateProfiles.push(details);
      onProgress(`materialized ${logical.profileId}/${candidate.candidateId}`);
    }

    const scenarios = [];
    for (const scenario of manifest.scenarios) {
      if (candidateProfiles.length === 1) {
        scenarios.push({
          scenarioId: scenario.scenarioId,
          selectedCandidateId: candidateProfiles[0].candidateId,
          selectedSourceProfileName: candidateProfiles[0].sourceProfileName,
          candidates: candidateProfiles,
        });
        continue;
      }
      const seed = safeIntegerSeed(`${logical.profileId}\0${scenario.scenarioId}\0selection`);
      const candidates = [];
      for (const candidate of candidateProfiles) {
        const reportId = curatedSelectionReportId(curationPolicyId, logical.profileId,
          scenario.scenarioId, candidate.candidateId);
        const reportPath = join(selectionRoot, `${reportId}.json`);
        await spawnProcess(executable, [
          "ptr=1", "item_db_source=local", candidate.profilePath, "optimal_raid=1",
          "fight_style=Patchwerk", `desired_targets=${scenario.targets}`, "fixed_time=1", "max_time=300",
          "vary_combat_length=0.2", "iterations=5000", "threads=2", `seed=${seed}`,
          `json2=${reportPath}`,
        ], { cwd: selectionRoot });
        const reportBytes = await readFile(reportPath);
        const parsed = parseSelectionReport(reportBytes, {
          build, candidate, targets: scenario.targets, seed,
        });
        candidates.push({ ...candidate, ...parsed, reportId, reportPath, seed });
        onProgress(`selected ${logical.profileId}/${scenario.scenarioId}/${candidate.candidateId}`);
      }
      const setupHashes = new Set(candidates.map((candidate) => candidate.setupSha256));
      assert(setupHashes.size === 1,
        `${logical.profileId}/${scenario.scenarioId} candidates do not use the same non-talent setup`);
      const winners = candidates.slice().sort((left, right) => right.baselineDps - left.baselineDps);
      assert(winners.length && (winners.length === 1 || winners[0].baselineDps !== winners[1].baselineDps),
        `${logical.profileId}/${scenario.scenarioId} has no unique DPS winner`);
      scenarios.push({
        scenarioId: scenario.scenarioId,
        seed,
        setupSha256: winners[0].setupSha256,
        selectedCandidateId: winners[0].candidateId,
        selectedSourceProfileName: winners[0].sourceProfileName,
        candidates,
      });
    }
    prepared.push({ ...logical, gear, gearSetId, canonicalRace, scenarios });
  }
  const bundle = {
    schemaVersion: 1,
    catalog: resolve(catalogPath),
    buildId: build.buildId,
    buildRevision: build.revision,
    preparedAt: new Date().toISOString(),
    profiles: prepared,
  };
  await writeFile(join(bundleRoot, "bundle.json"), `${JSON.stringify(bundle, null, 2)}\n`);
  return bundle;
}

export async function sealBundleProfiles(bundlePath) {
  const resolvedBundle = resolve(bundlePath);
  const profileRoot = resolve(dirname(resolvedBundle), "profiles");
  const bundle = await readJson(resolvedBundle);
  assert(bundle?.schemaVersion === 1 && Array.isArray(bundle.profiles),
    "curation bundle is missing or malformed");
  const byFile = new Map();
  for (const logical of bundle.profiles) for (const scenario of logical.scenarios || []) {
    for (const candidate of scenario.candidates || []) {
      const profilePath = resolve(candidate.profilePath || "");
      const relativeProfile = relative(profileRoot, profilePath);
      assert(relativeProfile && !isAbsolute(relativeProfile) && relativeProfile !== ".."
        && !relativeProfile.startsWith(`..${sep}`),
      `${candidate.profileFile || "candidate profile"} is outside the bundle profiles directory`);
      assert(basename(profilePath) === candidate.profileFile,
        `${candidate.profileFile || "candidate profile"} does not match its profile path basename`);
      const comments = [
        `Curated same-gear profile: ${candidate.gearSetId}`,
        `Upstream actor name: ${candidate.generatorActorName}`,
        `Upstream actor/APL: ${candidate.generatorSource}`,
        `Upstream generator SHA-256: ${candidate.generatorSha256}`,
        `Talent source: ${candidate.talentSource}`,
        `Gear plan SHA-256: ${candidate.gearPlanSha256}`,
      ];
      const prior = byFile.get(candidate.profileFile);
      assert(!prior || canonicalJson(prior.comments) === canonicalJson(comments),
        `${candidate.profileFile} has conflicting provenance across scenarios`);
      assert(!prior || prior.path === profilePath,
        `${candidate.profileFile} has conflicting paths across scenarios`);
      if (!prior) byFile.set(candidate.profileFile, {
        path: profilePath, comments, declaredHashes: new Set(),
      });
      byFile.get(candidate.profileFile).declaredHashes.add(candidate.profileSha256);
    }
  }
  const nextHashes = new Map();
  for (const [profileFile, entry] of byFile) {
    assert(entry.declaredHashes.size === 1, `${profileFile} has conflicting bundle hashes`);
    const original = await readFile(entry.path);
    const declared = [...entry.declaredHashes][0];
    const sealed = sealedProfileBytes(original, entry.comments);
    assert(sha256(original) === declared || sha256(sealed) === declared,
      `${profileFile} bytes differ from the bundle before sealing`);
    await atomicWriteFile(entry.path, sealed);
    nextHashes.set(profileFile, sha256(sealed));
  }
  for (const logical of bundle.profiles) for (const scenario of logical.scenarios || [])
    for (const candidate of scenario.candidates || [])
      candidate.profileSha256 = nextHashes.get(candidate.profileFile);
  await atomicWriteFile(resolvedBundle, `${JSON.stringify(bundle, null, 2)}\n`);
  return { bundle: resolvedBundle, profiles: nextHashes.size };
}

function parseCli(argv) {
  const [command = "help", ...rest] = argv;
  const options = { command, profileIds: [] };
  const valued = new Set(["--simc", "--catalog", "--manifest", "--work-dir", "--profile",
    "--bundle"]);
  for (let index = 0; index < rest.length; index++) {
    const flag = rest[index];
    assert(valued.has(flag), `unknown option ${flag}`);
    const value = rest[++index];
    assert(value, `${flag} requires a value`);
    if (flag === "--profile") options.profileIds.push(value);
    else options[flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  return options;
}

async function main(argv = process.argv.slice(2)) {
  const options = parseCli(argv);
  if (options.command === "help") {
    console.log("node gearing/src/curate-simc-profiles.mjs prepare --simc <path> [--profile <id>] [--work-dir <path>]\n"
      + "node gearing/src/curate-simc-profiles.mjs seal --bundle <bundle.json>");
    return;
  }
  if (options.command === "seal") {
    assert(options.bundle, "seal requires --bundle <bundle.json>");
    const result = await sealBundleProfiles(options.bundle);
    console.log(`Sealed ${result.profiles} profiles in ${result.bundle}`);
    return result;
  }
  assert(options.command === "prepare", `unknown command ${options.command}`);
  const bundle = await prepareCatalog({
    simc: options.simc || process.env.SIMC_EXE,
    catalogPath: options.catalog ? resolve(options.catalog) : DEFAULT_CATALOG,
    manifestPath: options.manifest ? resolve(options.manifest) : DEFAULT_MANIFEST,
    workRoot: options.workDir ? resolve(options.workDir) : DEFAULT_WORK_ROOT,
    profileIds: options.profileIds,
  });
  console.log(`Prepared ${bundle.profiles.length} logical profiles at ${join(
    options.workDir ? resolve(options.workDir) : DEFAULT_WORK_ROOT, bundle.buildRevision)}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
