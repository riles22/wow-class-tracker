import { createHash, randomUUID } from "node:crypto";
import {
  access, link, mkdir, open, readFile, rename, unlink, writeFile,
} from "node:fs/promises";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { gunzip as gunzipCallback, gzip as gzipCallback } from "node:zlib";
import { actorProjectionSha256 } from "./simc-profile-projection.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GEARING_ROOT = resolve(HERE, "..");
const DEFAULT_CATALOG = join(GEARING_ROOT, "data", "simc-curation-catalog.json");
const DEFAULT_MANIFEST = join(GEARING_ROOT, "data", "simc-run-manifest.json");
const DEFAULT_WEIGHTS = join(GEARING_ROOT, "data", "simc-reference-weights.json");
const ID = /^[a-z0-9][a-z0-9-]*$/;
const FILE = /^[A-Za-z0-9_.-]+\.simc$/;
const HEX = /^[a-f0-9]{64}$/;
const SELECTION_SETTINGS = {
  threads: 2,
  fixedTime: true,
  maxTimeSeconds: 300,
  varyCombatLength: 0.2,
  optimalRaid: true,
  fightStyle: "Patchwerk",
  calculateScaleFactors: false,
};
const SELECTION_ITERATIONS = 5000;
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
const PERMANENT_ENHANCEMENT_KEYS = ["gem_id", "enchant", "enchant_id"];
const PERMANENT_ENHANCEMENT_KEY_SET = new Set(PERMANENT_ENHANCEMENT_KEYS);
const PROFILE_ITEM_KEYS = new Set([
  "id", "ilevel", "redirected_base_stats", ...PERMANENT_ENHANCEMENT_KEYS,
]);
const SOURCE_FILES = {
  raidItems: "raid-items.json",
  dungeonItems: "dungeon-items.json",
  tierItems: "tier-items.json",
  catalystRules: "catalyst-rules.json",
  catalystStatAllocations: "catalyst-stat-allocations.json",
  itemEligibilityOverrides: "item-eligibility-overrides.json",
  specDefinitions: "specs.json",
};

const gzip = promisify(gzipCallback);
const gunzip = promisify(gunzipCallback);

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}

const canonicalJson = (value) => JSON.stringify(canonical(value));
const sameJson = (left, right) => canonicalJson(left) === canonicalJson(right);
const clone = (value) => structuredClone(value);

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

function simcName(name) {
  return String(name || "item").toLowerCase().replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function cleanId(value, label) {
  assert(typeof value === "string" && ID.test(value), `${label} is unsafe: ${value || "missing"}`);
  return value;
}

function cleanFile(value, label) {
  assert(typeof value === "string" && FILE.test(value) && basename(value) === value,
    `${label} is unsafe: ${value || "missing"}`);
  return value;
}

function hex(value, label) {
  assert(typeof value === "string" && HEX.test(value), `${label} is not a SHA-256 digest`);
  return value;
}

function uniqueStrings(values, label, pattern = null) {
  assert(Array.isArray(values) && values.every((value) => typeof value === "string")
    && new Set(values).size === values.length, `${label} must contain unique strings`);
  if (pattern) assert(values.every((value) => pattern.test(value)), `${label} contains an invalid value`);
  return values;
}

export function normalizeProvenanceDate(value, label = "provenance date") {
  assert(typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)
    && Number.isFinite(Date.parse(value.length === 10 ? `${value}T00:00:00Z` : value)),
  `${label} must be an ISO date or timestamp`);
  return value.slice(0, 10);
}

function generatorSource(build, generatorFile) {
  return `https://github.com/simulationcraft/simc/blob/${build.commit}`
    + `/profiles/generators/MID2/${basename(generatorFile)}`;
}

function gearPlanPayload(gear) {
  return {
    policyId: gear.policyId,
    itemLevel: gear.itemLevel,
    tierPieces: gear.tierPieces,
    weaponLoadoutId: gear.weaponLoadoutId,
    weights: gear.weights,
    redirectedBaseItemIds: gear.redirectedBaseItemIds,
    tertiaryRatingsPresent: gear.tertiaryRatingsPresent,
    items: gear.items,
  };
}

function validateGear(logical, catalogLogical, catalogPolicy, catalog) {
  const gear = logical.gear;
  assert(gear && gear.policyId === logical.curationPolicyId
    && gear.policyId === catalogPolicy.curationPolicyId,
  `${logical.profileId}: gear policy differs from the catalog`);
  assert(gear.itemLevel === catalogPolicy.itemLevel && gear.tierPieces === catalogPolicy.tierPieces
    && gear.weaponLoadoutId === logical.weaponLoadoutId,
  `${logical.profileId}: gear shell differs from the catalog policy`);
  uniqueStrings(gear.redirectedBaseItemIds, `${logical.profileId} redirected base ids`, /^\d+$/);
  assert(typeof gear.tertiaryRatingsPresent === "boolean" && Array.isArray(gear.items),
    `${logical.profileId}: gear shell is incomplete`);
  hex(gear.gearPlanSha256, `${logical.profileId} gear plan`);
  assert(sha256(Buffer.from(canonicalJson(gearPlanPayload(gear)))) === gear.gearPlanSha256,
    `${logical.profileId}: gear plan digest does not match its contents`);
  hex(catalogLogical.expectedGearPlanSha256,
    `${logical.profileId} catalog-pinned gear plan`);
  assert(gear.gearPlanSha256 === catalogLogical.expectedGearPlanSha256,
    `${logical.profileId}: gear plan differs from the reviewed catalog pin`);
  const expectedGearSetId = `${logical.curationPolicyId}-${logical.profileId}`;
  assert(logical.gearSetId === expectedGearSetId,
    `${logical.profileId}: gear set id differs from the deterministic policy id`);

  const enhancementCandidate = catalogLogical.candidates.find((candidate) =>
    candidate.candidateId === catalogLogical.enhancementSourceCandidateId);
  assert(enhancementCandidate, `${logical.profileId}: enhancement source is absent from the catalog`);
  const expectedEnhancementSource = {
    candidateId: enhancementCandidate.candidateId,
    generatorFile: enhancementCandidate.generatorFile,
    sourceProfileName: enhancementCandidate.sourceProfileName,
    generatorSha256: catalog.generatorFileSha256?.[basename(enhancementCandidate.generatorFile)],
  };
  hex(expectedEnhancementSource.generatorSha256,
    `${logical.profileId} enhancement source generator`);
  const enhancementPlan = catalogLogical.enhancementPlan;
  assert(enhancementPlan?.sourceCandidateId === expectedEnhancementSource.candidateId
    && enhancementPlan.generatorFile === expectedEnhancementSource.generatorFile
    && enhancementPlan.sourceProfileName === expectedEnhancementSource.sourceProfileName
    && enhancementPlan.generatorSha256 === expectedEnhancementSource.generatorSha256
    && enhancementPlan.slots && typeof enhancementPlan.slots === "object"
    && !Array.isArray(enhancementPlan.slots),
  `${logical.profileId}: enhancement plan differs from its catalog source`);
  assert(gear.items.length > 0, `${logical.profileId}: gear plan contains no items`);
  const slots = new Set();
  for (const item of gear.items) {
    assert(typeof item?.slot === "string" && !slots.has(item.slot),
      `${logical.profileId}: gear plan has an invalid or duplicate slot`);
    slots.add(item.slot);
    assert(sameJson(item.enhancementSource, expectedEnhancementSource),
      `${logical.profileId}/${item.slot}: enhancement source differs from the catalog`);
    const enhancements = item.enhancements;
    assert(enhancements && typeof enhancements === "object" && !Array.isArray(enhancements)
      && Object.keys(enhancements).every((key) => PERMANENT_ENHANCEMENT_KEY_SET.has(key))
      && !(Object.hasOwn(enhancements, "enchant") && Object.hasOwn(enhancements, "enchant_id")),
    `${logical.profileId}/${item.slot}: permanent enhancements are invalid`);
    assert(sameJson(enhancements, enhancementPlan.slots[item.slot] || {}),
      `${logical.profileId}/${item.slot}: enhancements differ from the catalog plan`);
  }
  assert(Object.keys(enhancementPlan.slots).every((slot) => slots.has(slot)),
    `${logical.profileId}: enhancement plan references an absent gear slot`);
  return gear;
}

function catalogLogicalProjection(catalogLogical, bundleLogical) {
  return Object.fromEntries(Object.keys(catalogLogical).map((key) => [key, bundleLogical[key]]));
}

function candidateProvenance(candidate, catalogCandidate, logical, gear, build, catalog) {
  assert(candidate.candidateId === catalogCandidate.candidateId,
    `${logical.profileId}: candidate id differs from the catalog`);
  const generatorActorName = candidate.generatorActorName;
  assert(typeof generatorActorName === "string" && generatorActorName.trim()
    && generatorActorName === catalogCandidate.sourceProfileName,
    `${logical.profileId}/${candidate.candidateId}: generator actor differs from the catalog`);
  assert(typeof candidate.sourceProfileName === "string" && candidate.sourceProfileName.trim()
    && candidate.sourceProfileName !== generatorActorName,
    `${logical.profileId}/${candidate.candidateId}: materialized actor name is missing`);
  assert(candidate.profileFile === catalogCandidate.profileFile
    && candidate.talentSourceMode === catalogCandidate.talentSourceMode
    && ["current-ptr-import", "official-generator"].includes(candidate.talentSourceMode)
    && candidate.talentSource === catalogCandidate.talentSource
    && candidate.talentSourceAsOf === catalogCandidate.talentSourceAsOf,
  `${logical.profileId}/${candidate.candidateId}: talent or output provenance differs from the catalog`);
  assert(typeof catalogCandidate.talents === "string" && catalogCandidate.talents.trim()
    && candidate.talents === catalogCandidate.talents,
  `${logical.profileId}/${candidate.candidateId}: talents differ from the reviewed catalog`);
  hex(catalogCandidate.actorProjectionSha256,
    `${logical.profileId}/${candidate.candidateId} catalog actor projection`);
  assert(candidate.actorProjectionSha256 === catalogCandidate.actorProjectionSha256,
    `${logical.profileId}/${candidate.candidateId}: actor projection differs from the reviewed catalog`);
  cleanFile(candidate.profileFile, `${logical.profileId} profile file`);
  assert(candidate.buildId === build.buildId && candidate.sourceMode === "curated-same-gear"
    && candidate.generatorSource === generatorSource(build, catalogCandidate.generatorFile),
  `${logical.profileId}/${candidate.candidateId}: build or generator provenance is invalid`);
  const expectedGeneratorSha = catalog.generatorFileSha256?.[basename(catalogCandidate.generatorFile)];
  hex(expectedGeneratorSha, `${catalogCandidate.generatorFile} catalog generator`);
  assert(candidate.generatorSha256 === expectedGeneratorSha,
    `${logical.profileId}/${candidate.candidateId}: generator digest differs from the catalog`);
  assert(candidate.curationPolicyId === logical.curationPolicyId
    && candidate.curationReviewedAt === catalog.reviewedAt
    && candidate.gearSetId === logical.gearSetId
    && candidate.gearPlanSha256 === gear.gearPlanSha256
    && candidate.itemDbSource === "local",
  `${logical.profileId}/${candidate.candidateId}: curation provenance is invalid`);
  assert(sameJson(candidate.redirectedBaseItemIds, gear.redirectedBaseItemIds)
    && candidate.tertiaryRatingsPresent === gear.tertiaryRatingsPresent,
  `${logical.profileId}/${candidate.candidateId}: profile gear declaration differs from its gear set`);
  hex(candidate.profileSha256, `${logical.profileId}/${candidate.candidateId} profile`);
  assert(typeof candidate.profilePath === "string" && candidate.profilePath,
    `${logical.profileId}/${candidate.candidateId}: profile path is missing`);
  return {
    sourceProfileName: candidate.sourceProfileName,
    generatorActorName,
    buildId: candidate.buildId,
    sourceMode: candidate.sourceMode,
    generatorSource: candidate.generatorSource,
    generatorSha256: candidate.generatorSha256,
    talentSource: candidate.talentSource,
    talentSourceAsOf: normalizeProvenanceDate(candidate.talentSourceAsOf,
      `${logical.profileId}/${candidate.candidateId} talent source date`),
    curationReviewedAt: catalog.reviewedAt,
    curationPolicyId: candidate.curationPolicyId,
    gearSetId: candidate.gearSetId,
    gearPlanSha256: candidate.gearPlanSha256,
    profileFile: candidate.profileFile,
    profileSha256: candidate.profileSha256,
    itemDbSource: candidate.itemDbSource,
    redirectedBaseItemIds: clone(candidate.redirectedBaseItemIds),
    tertiaryRatingsPresent: candidate.tertiaryRatingsPresent,
  };
}

function validateBundleProfile(bundleLogical, catalogLogical, context) {
  const { catalog, manifest, build, catalogPolicy } = context;
  cleanId(bundleLogical.profileId, "logical profile id");
  assert(sameJson(catalogLogical, catalogLogicalProjection(catalogLogical, bundleLogical)),
    `${bundleLogical.profileId}: logical profile differs from the reviewed catalog`);
  const spec = manifest.specs.find((entry) => entry.specKey === bundleLogical.specKey);
  assert(spec && spec.role === "DPS" && spec.eligibility === "eligible"
    && ["pending", "accepted"].includes(spec.status),
  `${bundleLogical.profileId}: specialization is not an eligible conventional DPS spec`);
  const catalogPolicyForLogical = catalog.curationPolicies.find((entry) =>
    entry.curationPolicyId === bundleLogical.curationPolicyId);
  assert(catalogPolicyForLogical === catalogPolicy,
    `${bundleLogical.profileId}: curation policy is not the reviewed catalog policy`);
  const gear = validateGear(bundleLogical, catalogLogical, catalogPolicy, catalog);
  const catalogCandidates = new Map(catalogLogical.candidates.map((candidate) =>
    [candidate.candidateId, candidate]));
  assert(catalogCandidates.size > 0, `${bundleLogical.profileId}: catalog has no candidates`);
  const scenarioIds = bundleLogical.scenarios?.map((scenario) => scenario.scenarioId) || [];
  uniqueStrings(scenarioIds, `${bundleLogical.profileId} scenario ids`);
  assert(sameJson([...scenarioIds].sort(), [...spec.plannedScenarioIds].sort()),
    `${bundleLogical.profileId}: bundle scenarios differ from the specialization plan`);

  const normalizedScenarios = [];
  const profileArtifacts = new Map();
  const selectionArtifacts = new Map();
  for (const scenario of bundleLogical.scenarios) {
    const scenarioDefinition = manifest.scenarios?.find((entry) =>
      entry.scenarioId === scenario.scenarioId);
    assert(scenarioDefinition?.fightStyle === SELECTION_SETTINGS.fightStyle
      && Number.isInteger(scenarioDefinition.targets) && scenarioDefinition.targets > 0,
    `${bundleLogical.profileId}/${scenario.scenarioId}: scenario definition is invalid`);
    const candidates = Array.isArray(scenario.candidates) ? scenario.candidates : [];
    assert(candidates.length === catalogCandidates.size,
      `${bundleLogical.profileId}/${scenario.scenarioId}: candidate matrix is incomplete`);
    const normalizedCandidates = [];
    const candidateIds = new Set();
    const materializedNames = new Set();
    for (const candidate of candidates) {
      const catalogCandidate = catalogCandidates.get(candidate.candidateId);
      assert(catalogCandidate && !candidateIds.has(candidate.candidateId),
        `${bundleLogical.profileId}/${scenario.scenarioId}: candidate matrix is invalid`);
      candidateIds.add(candidate.candidateId);
      const provenance = candidateProvenance(candidate, catalogCandidate, bundleLogical, gear,
        build, catalog);
      materializedNames.add(provenance.sourceProfileName);
      const profileKey = `${provenance.buildId}\0${provenance.profileFile}`;
      const profileArtifact = {
        buildId: provenance.buildId,
        profileFile: provenance.profileFile,
        sha256: provenance.profileSha256,
        sourcePath: candidate.profilePath,
        sourceProfileName: provenance.sourceProfileName,
        generatorActorName: provenance.generatorActorName,
        generatorSource: provenance.generatorSource,
        generatorSha256: provenance.generatorSha256,
        talentSource: provenance.talentSource,
        talents: candidate.talents,
        actorProjectionSha256: candidate.actorProjectionSha256,
        specKey: bundleLogical.specKey,
        gearSetId: provenance.gearSetId,
        gearPlanSha256: provenance.gearPlanSha256,
        redirectedBaseItemIds: provenance.redirectedBaseItemIds,
        gear: clone(gear),
      };
      const priorProfile = profileArtifacts.get(profileKey);
      assert(!priorProfile || sameJson(priorProfile, profileArtifact),
        `${bundleLogical.profileId}: candidate profile declaration conflicts across scenarios`);
      profileArtifacts.set(profileKey, profileArtifact);
      normalizedCandidates.push({ candidate, provenance });
    }
    assert(candidateIds.size === catalogCandidates.size,
      `${bundleLogical.profileId}/${scenario.scenarioId}: candidate ids differ from the catalog`);
    assert(materializedNames.size === catalogCandidates.size || catalogCandidates.size === 1,
      `${bundleLogical.profileId}: materialized candidate actor names must be unique`);
    const selected = normalizedCandidates.find(({ candidate }) =>
      candidate.candidateId === scenario.selectedCandidateId);
    assert(selected && selected.provenance.sourceProfileName === scenario.selectedSourceProfileName,
      `${bundleLogical.profileId}/${scenario.scenarioId}: selected candidate is inconsistent`);

    if (catalogCandidates.size > 1) {
      assert(/^\d+$/.test(scenario.seed || "") && HEX.test(scenario.setupSha256 || ""),
        `${bundleLogical.profileId}/${scenario.scenarioId}: selection seed or setup digest is invalid`);
      const maximum = Math.max(...normalizedCandidates.map(({ candidate }) => candidate.baselineDps));
      const winners = normalizedCandidates.filter(({ candidate }) => candidate.baselineDps === maximum);
      assert(winners.length === 1 && winners[0].candidate.candidateId === scenario.selectedCandidateId,
        `${bundleLogical.profileId}/${scenario.scenarioId}: selected candidate is not the unique DPS winner`);
      for (const { candidate, provenance } of normalizedCandidates) {
        assert(Number.isInteger(candidate.iterations) && candidate.iterations >= SELECTION_ITERATIONS
          && candidate.iterations < SELECTION_ITERATIONS + SELECTION_SETTINGS.threads
          && Number.isFinite(candidate.baselineDps)
          && candidate.baselineDps > 0 && Number.isFinite(candidate.baselineDpsError)
          && candidate.baselineDpsError > 0 && candidate.setupSha256 === scenario.setupSha256
          && candidate.seed === scenario.seed,
        `${bundleLogical.profileId}/${scenario.scenarioId}/${candidate.candidateId}: selection result is invalid`);
        cleanId(candidate.reportId, "selection report id");
        hex(candidate.resultSha256, `${candidate.reportId} selection result`);
        assert(typeof candidate.reportPath === "string" && candidate.reportPath,
          `${candidate.reportId}: selection report path is missing`);
        const selectionKey = `${provenance.buildId}\0${candidate.reportId}`;
        assert(!selectionArtifacts.has(selectionKey), `${candidate.reportId}: duplicate selection report`);
        selectionArtifacts.set(selectionKey, {
          buildId: provenance.buildId,
          reportId: candidate.reportId,
          sha256: candidate.resultSha256,
          sourcePath: candidate.reportPath,
          profileFile: provenance.profileFile,
          profileSha256: provenance.profileSha256,
          profileId: bundleLogical.profileId,
          specKey: bundleLogical.specKey,
          scenarioId: scenario.scenarioId,
          fightStyle: scenarioDefinition.fightStyle,
          targets: scenarioDefinition.targets,
          candidateId: candidate.candidateId,
          sourceProfileName: provenance.sourceProfileName,
          talents: candidate.talents,
          iterations: candidate.iterations,
          baselineDps: candidate.baselineDps,
          baselineDpsError: candidate.baselineDpsError,
          setupSha256: candidate.setupSha256,
          seed: candidate.seed,
          selectedCandidateId: scenario.selectedCandidateId,
          selectedSourceProfileName: scenario.selectedSourceProfileName,
          expectedCandidateCount: catalogCandidates.size,
        });
      }
    } else {
      assert(selected && normalizedCandidates.length === 1,
        `${bundleLogical.profileId}/${scenario.scenarioId}: single-actor selection is invalid`);
    }
    normalizedScenarios.push({ scenario, scenarioDefinition, selected,
      candidates: normalizedCandidates });
  }
  return { spec, gear, normalizedScenarios, profileArtifacts, selectionArtifacts };
}

function manifestInput(scenarioId, provenance) {
  return { scenarioId, ...clone(provenance) };
}

function selectionCandidate(candidate, provenance) {
  return {
    ...clone(provenance),
    iterations: candidate.iterations,
    baselineDps: candidate.baselineDps,
    baselineDpsError: candidate.baselineDpsError,
    reportId: candidate.reportId,
    resultSha256: candidate.resultSha256,
  };
}

function readyProfile(logical, validated) {
  const multi = logical.candidates.length > 1;
  const profile = {
    profileId: logical.profileId,
    specKey: logical.specKey,
    name: logical.guideProfileName,
    guideProfileName: logical.guideProfileName,
    status: "ready",
    objective: validated.spec.objective,
    primaryStat: validated.spec.primaryStat,
    selectionMode: multi ? "same-gear-dps" : "single-actor",
    scenarioIds: validated.normalizedScenarios.map(({ scenario }) => scenario.scenarioId),
    scenarioInputs: validated.normalizedScenarios.map(({ scenario, selected }) =>
      manifestInput(scenario.scenarioId, selected.provenance)),
  };
  if (multi) profile.selectionEvidence = {
    metric: "DPS",
    requestedIterationsPerCandidate: SELECTION_ITERATIONS,
    settings: clone(SELECTION_SETTINGS),
    scenarios: validated.normalizedScenarios.map(({ scenario, candidates }) => ({
      scenarioId: scenario.scenarioId,
      seed: scenario.seed,
      selectedSourceProfileName: scenario.selectedSourceProfileName,
      candidates: candidates.map(({ candidate, provenance }) =>
        selectionCandidate(candidate, provenance)),
    })),
  };
  return profile;
}

function compatibleExistingProfile(existing, expected) {
  if (!existing) return false;
  const normalized = clone(expected);
  normalized.status = existing.status;
  return ["ready", "accepted"].includes(existing.status) && sameJson(existing, normalized);
}

function evidenceIdentity(profile) {
  const inputs = profile.scenarioInputs || [];
  const candidates = (profile.selectionEvidence?.scenarios || [])
    .flatMap((scenario) => scenario.candidates || []);
  return {
    policyIds: new Set([...inputs, ...candidates].map((entry) => entry.curationPolicyId)
      .filter(Boolean)),
    profileFiles: new Set([...inputs, ...candidates].map((entry) => entry.profileFile)
      .filter(Boolean)),
    reportIds: new Set(candidates.map((entry) => entry.reportId).filter(Boolean)),
    sources: [...inputs, ...candidates].map((entry) => entry.sourceMode),
  };
}

function disjoint(left, right) {
  return [...left].every((value) => !right.has(value));
}

function occupiedEvidenceIdentities(manifest, weights, replacedProfileId) {
  const profileFiles = new Set();
  const reportIds = new Set();
  for (const profile of manifest.profiles) if (profile.profileId !== replacedProfileId) {
    const identity = evidenceIdentity(profile);
    for (const value of identity.profileFiles) profileFiles.add(value);
    for (const value of identity.reportIds) reportIds.add(value);
  }
  for (const record of weights.records) if (record.status === "accepted") {
    if (record.profileFile) profileFiles.add(record.profileFile);
    for (const run of record.runs || []) if (run.reportId) reportIds.add(run.reportId);
  }
  return { profileFiles, reportIds };
}

function assertReplaceableReadyCuratedProfile(existing, expected, weights, manifest) {
  assert(existing.status === "ready",
    `${existing.profileId}: only a ready curated profile may be replaced by corrected evidence`);
  const prior = evidenceIdentity(existing);
  const next = evidenceIdentity(expected);
  assert(prior.sources.length > 0
    && prior.sources.every((sourceMode) => sourceMode === "curated-same-gear"),
  `${existing.profileId}: official or unclassified evidence cannot be replaced`);
  assert(!weights.records.some((record) => record.status === "accepted"
    && (record.profileId === existing.profileId || prior.profileFiles.has(record.profileFile))),
  `${existing.profileId}: accepted ledger evidence cannot be replaced`);
  for (const field of ["profileId", "specKey", "guideProfileName", "objective", "primaryStat",
    "selectionMode"])
    assert(existing[field] === expected[field],
      `${existing.profileId}: corrected evidence changes coherent ${field}`);
  assert(sameJson([...(existing.scenarioIds || [])].sort(), [...(expected.scenarioIds || [])].sort()),
    `${existing.profileId}: corrected evidence changes the scenario plan`);
  assert(prior.policyIds.size > 0 && next.policyIds.size > 0
    && disjoint(prior.policyIds, next.policyIds),
  `${existing.profileId}: corrected curation policy id must be distinct`);
  assert(prior.profileFiles.size > 0 && next.profileFiles.size > 0
    && disjoint(prior.profileFiles, next.profileFiles),
  `${existing.profileId}: corrected profile filenames must be distinct`);
  assert(prior.reportIds.size === next.reportIds.size
    && (prior.reportIds.size === 0 || disjoint(prior.reportIds, next.reportIds)),
  `${existing.profileId}: corrected selection report ids must be distinct`);
  const occupied = occupiedEvidenceIdentities(manifest, weights, existing.profileId);
  assert(disjoint(next.profileFiles, occupied.profileFiles),
    `${existing.profileId}: corrected profile filename collides with another retained identity`);
  assert(disjoint(next.reportIds, occupied.reportIds),
    `${existing.profileId}: corrected selection report id collides with another retained identity`);
}

function mergeArtifact(target, key, artifact, label) {
  const prior = target.get(key);
  assert(!prior || sameJson(prior, artifact), `${label} conflicts across curation bundles`);
  if (!prior) target.set(key, artifact);
}

function gearSetFor(logical, validated) {
  return {
    gearSetId: logical.gearSetId,
    specKey: logical.specKey,
    profileId: logical.profileId,
    guideProfileName: logical.guideProfileName,
    itemLevel: validated.gear.itemLevel,
    tierPieces: validated.gear.tierPieces,
    weaponLoadoutId: validated.gear.weaponLoadoutId,
    gearPlanSha256: validated.gear.gearPlanSha256,
    redirectedBaseItemIds: clone(validated.gear.redirectedBaseItemIds),
    tertiaryRatingsPresent: validated.gear.tertiaryRatingsPresent,
  };
}

function mergePolicy(manifest, catalog, catalogPolicy, gearSets, gearDataHashes) {
  const expectedBase = {
    curationPolicyId: catalogPolicy.curationPolicyId,
    reviewedAt: catalog.reviewedAt,
    gearDataHashes: clone(gearDataHashes),
    generatorFileSha256: clone(catalog.generatorFileSha256),
    itemLevel: catalogPolicy.itemLevel,
    tierPieces: catalogPolicy.tierPieces,
  };
  const existingIndex = manifest.curationPolicies.findIndex((policy) =>
    policy.curationPolicyId === catalogPolicy.curationPolicyId);
  if (existingIndex < 0) {
    manifest.curationPolicies.push({ ...expectedBase, gearSets: [...gearSets.values()] });
    return;
  }
  const existing = manifest.curationPolicies[existingIndex];
  for (const [key, value] of Object.entries(expectedBase))
    assert(existing[key] === undefined || sameJson(existing[key], value),
      `${catalogPolicy.curationPolicyId}: existing curation policy ${key} conflicts with the catalog`);
  const existingGearSets = new Map((existing.gearSets || []).map((gearSet) =>
    [gearSet.gearSetId, gearSet]));
  for (const [gearSetId, gearSet] of gearSets) {
    const prior = existingGearSets.get(gearSetId);
    assert(!prior || sameJson(prior, gearSet), `${gearSetId}: existing gear set conflicts with the bundle`);
    if (!prior) existingGearSets.set(gearSetId, gearSet);
  }
  manifest.curationPolicies[existingIndex] = {
    ...existing,
    ...expectedBase,
    gearSets: [...existingGearSets.values()],
  };
}

function coverageFor(manifest) {
  const acceptedProfiles = manifest.profiles.filter((profile) => profile.status === "accepted");
  const acceptedRecords = acceptedProfiles.reduce((sum, profile) =>
    sum + (profile.scenarioIds || []).length, 0);
  return {
    totalSpecs: manifest.specs.length,
    eligibleConventionalDps: manifest.specs.filter((spec) =>
      spec.role === "DPS" && spec.eligibility === "eligible").length,
    acceptedEligibleSpecs: manifest.specs.filter((spec) =>
      spec.eligibility === "eligible" && spec.status === "accepted").length,
    pendingEligibleSpecs: manifest.specs.filter((spec) =>
      spec.eligibility === "eligible" && spec.status === "pending").length,
    deferredTanks: manifest.specs.filter((spec) =>
      spec.role === "Tank" && spec.status === "deferred").length,
    deferredHealers: manifest.specs.filter((spec) =>
      spec.role === "Healer" && spec.status === "deferred").length,
    unsupportedSpecs: manifest.specs.filter((spec) => spec.status === "unsupported").length,
    acceptedProfiles: acceptedProfiles.length,
    acceptedRecords,
    acceptedReports: acceptedRecords * (manifest.acceptancePolicy?.runsPerRecord || 0),
  };
}

function updateAuditDeclaration(weights, manifest) {
  const profileKeys = new Set();
  let reports = 0;
  const evidenceBuildIds = new Set();
  for (const record of weights.records.filter((entry) => entry.status === "accepted")) {
    profileKeys.add(`${record.buildId}\0${record.profileFile}`);
    evidenceBuildIds.add(record.buildId);
    reports += (record.runs || []).length;
  }
  let selections = 0;
  for (const profile of manifest.profiles) {
    if (profile.status === "accepted") for (const input of profile.scenarioInputs || [])
      evidenceBuildIds.add(input.buildId);
    for (const scenario of profile.selectionEvidence?.scenarios || []) {
      for (const candidate of scenario.candidates || []) {
        profileKeys.add(`${candidate.buildId}\0${candidate.profileFile}`);
        evidenceBuildIds.add(candidate.buildId);
        selections += 1;
      }
    }
  }
  const builds = new Map(manifest.builds.map((build) => [build.buildId, build]));
  const directories = {};
  for (const build of manifest.builds) if (evidenceBuildIds.has(build.buildId))
    directories[build.buildId] = {
      directory: build.auditDirectory,
      compression: build.compression,
    };
  assert(Object.keys(directories).length === evidenceBuildIds.size,
    "audit declaration references an unknown build");
  const prior = weights.methodology?.auditArtifacts || {};
  weights.methodology.auditArtifacts = {
    ...prior,
    profiles: profileKeys.size,
    reports,
    selections,
    directories,
  };
  delete weights.methodology.auditArtifacts.directory;
  return weights;
}

export function buildCurationAdmission({ bundles, catalog, manifest, weights, gearDataHashes }) {
  assert(Array.isArray(bundles) && bundles.length > 0, "at least one curation bundle is required");
  assert(catalog?.schemaVersion === 1 && ID.test(catalog?.buildId || "")
    && /^[a-f0-9]{40}$/.test(catalog?.generatorCommit || "")
    && normalizeProvenanceDate(catalog?.reviewedAt, "catalog review date") === catalog.reviewedAt
    && Array.isArray(catalog?.curationPolicies) && Array.isArray(catalog?.logicalProfiles)
    && catalog.generatorFileSha256 && !Array.isArray(catalog.generatorFileSha256),
  "curation catalog is missing or malformed");
  assert(manifest?.schemaVersion === 2 && Array.isArray(manifest?.builds)
    && Array.isArray(manifest?.curationPolicies) && Array.isArray(manifest?.profiles)
    && Array.isArray(manifest?.specs), "run manifest must use schemaVersion 2");
  assert(weights?.schemaVersion === 3 && Array.isArray(weights?.records)
    && weights?.methodology?.auditArtifacts, "reference ledger must use schemaVersion 3");
  const build = manifest.builds.find((entry) => entry.buildId === catalog.buildId);
  assert(build && build.status === "accepted" && build.commit === catalog.generatorCommit,
    "catalog build does not match an accepted manifest build");
  for (const [file, digest] of Object.entries(gearDataHashes || {})) {
    assert(/^data\/[a-z0-9][a-z0-9-]*\.json$/.test(file), `unsafe gear data hash key ${file}`);
    hex(digest, `${file} gear data`);
  }
  const expectedGearFiles = new Set(Object.values(SOURCE_FILES).map((file) => `data/${file}`));
  assert([...expectedGearFiles].every((file) => HEX.test(gearDataHashes?.[file] || "")),
    "gear data hashes do not cover every reviewed curation input");

  const catalogProfiles = new Map(catalog.logicalProfiles.map((logical) =>
    [logical.profileId, logical]));
  assert(catalogProfiles.size === catalog.logicalProfiles.length, "catalog profile ids are not unique");
  const catalogPolicies = new Map(catalog.curationPolicies.map((policy) =>
    [policy.curationPolicyId, policy]));
  assert(catalogPolicies.size === catalog.curationPolicies.length,
    "catalog curation policy ids are not unique");
  const mergedProfiles = new Map();
  for (const bundle of bundles) {
    assert(bundle?.schemaVersion === 1 && bundle.buildId === build.buildId
      && bundle.buildRevision === build.revision && Array.isArray(bundle.profiles),
    "curation bundle build provenance is invalid");
    for (const logical of bundle.profiles) {
      const prior = mergedProfiles.get(logical.profileId);
      if (prior) {
        assert(sameJson(prior, logical), `${logical.profileId}: conflicting duplicate curation bundle`);
      } else mergedProfiles.set(logical.profileId, logical);
    }
  }
  assert(mergedProfiles.size > 0, "curation bundles contain no logical profiles");

  const nextManifest = clone(manifest);
  const nextWeights = clone(weights);
  const profileArtifacts = new Map();
  const selectionArtifacts = new Map();
  const gearSetsByPolicy = new Map();
  for (const logical of mergedProfiles.values()) {
    const catalogLogical = catalogProfiles.get(logical.profileId);
    assert(catalogLogical, `${logical.profileId}: logical profile is absent from the catalog`);
    const catalogPolicy = catalogPolicies.get(logical.curationPolicyId);
    assert(catalogPolicy, `${logical.profileId}: catalog curation policy is missing`);
    const validated = validateBundleProfile(logical, catalogLogical, {
      catalog, manifest: nextManifest, build, catalogPolicy,
    });
    const expected = readyProfile(logical, validated);
    const existingIndex = nextManifest.profiles.findIndex((profile) =>
      profile.profileId === logical.profileId);
    if (existingIndex >= 0) {
      const existing = nextManifest.profiles[existingIndex];
      if (!compatibleExistingProfile(existing, expected)) {
        assertReplaceableReadyCuratedProfile(existing, expected, nextWeights, nextManifest);
        nextManifest.profiles[existingIndex] = expected;
      }
    } else nextManifest.profiles.push(expected);

    const spec = nextManifest.specs.find((entry) => entry.specKey === logical.specKey);
    assert(spec, `${logical.profileId}: specialization disappeared from the manifest`);
    assert(Array.isArray(spec.profileIds)
      && new Set(spec.profileIds).size === spec.profileIds.length,
    `${logical.profileId}: specialization profile ids contain duplicates`);
    if (!spec.profileIds.includes(logical.profileId)) spec.profileIds.push(logical.profileId);
    if (spec.status === "pending")
      spec.reason = "Reviewed curated same-gear profiles are ready; accepted scale-factor runs are still required.";
    const policyGearSets = gearSetsByPolicy.get(logical.curationPolicyId) || new Map();
    const gearSet = gearSetFor(logical, validated);
    const priorGearSet = policyGearSets.get(gearSet.gearSetId);
    assert(!priorGearSet || sameJson(priorGearSet, gearSet),
      `${gearSet.gearSetId}: conflicting gear set declarations`);
    policyGearSets.set(gearSet.gearSetId, gearSet);
    gearSetsByPolicy.set(logical.curationPolicyId, policyGearSets);
    for (const [key, artifact] of validated.profileArtifacts)
      mergeArtifact(profileArtifacts, key, artifact, `${artifact.profileFile} profile artifact`);
    for (const [key, artifact] of validated.selectionArtifacts)
      mergeArtifact(selectionArtifacts, key, artifact, `${artifact.reportId} selection artifact`);
  }
  for (const [policyId, gearSets] of gearSetsByPolicy)
    mergePolicy(nextManifest, catalog, catalogPolicies.get(policyId), gearSets, gearDataHashes);
  nextManifest.coverage = coverageFor(nextManifest);
  updateAuditDeclaration(nextWeights, nextManifest);
  assert(sameJson(nextWeights.records, weights.records), "curation admission must not mutate ledger records");
  return {
    manifest: nextManifest,
    weights: nextWeights,
    artifacts: {
      profiles: [...profileArtifacts.values()],
      selections: [...selectionArtifacts.values()],
    },
  };
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

function safeDescendant(root, path, label) {
  const resolvedRoot = resolve(root);
  const full = resolve(path);
  assert(full.startsWith(`${resolvedRoot}${sep}`), `${label} escapes ${resolvedRoot}`);
  return full;
}

async function readJson(path, label) {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) { throw new Error(`${label} is unreadable: ${error.message}`); }
}

function catalogSourceNames(catalog) {
  const names = {};
  for (const [key, file] of Object.entries(SOURCE_FILES)) {
    const declared = catalog.curationPolicies?.find((policy) =>
      policy.curationPolicyId === catalog.defaultCurationPolicyId)?.sourceFilePaths?.[key];
    assert(typeof declared === "string" && basename(declared) === file,
      `catalog sourceFilePaths.${key} must name ${file}`);
    names[`data/${file}`] = file;
  }
  return names;
}

async function hashGearData(catalog, manifestPath) {
  const dataRoot = dirname(manifestPath);
  const hashes = {};
  for (const [key, file] of Object.entries(catalogSourceNames(catalog)))
    hashes[key] = sha256(await readFile(safeDescendant(dataRoot, join(dataRoot, file), file)));
  return hashes;
}

function bundleArtifactRoots(bundlePath) {
  const bundleRoot = dirname(resolve(bundlePath));
  return {
    profileRoot: join(bundleRoot, "profiles"),
    selectionRoot: join(bundleRoot, "selections"),
  };
}

function candidateEntries(bundle) {
  return bundle.profiles.flatMap((logical) => logical.scenarios.flatMap((scenario) =>
    scenario.candidates.map((candidate) => ({ logical, scenario, candidate }))));
}

async function verifyBundleArtifactPaths(bundle, bundlePath) {
  const roots = bundleArtifactRoots(bundlePath);
  for (const { logical, scenario, candidate } of candidateEntries(bundle)) {
    const profilePath = safeDescendant(roots.profileRoot, candidate.profilePath,
      `${logical.profileId}/${candidate.candidateId} profile path`);
    assert(basename(profilePath) === candidate.profileFile,
      `${logical.profileId}/${candidate.candidateId}: profile path filename differs from the bundle`);
    if (logical.candidates.length > 1) {
      const reportPath = safeDescendant(roots.selectionRoot, candidate.reportPath,
        `${logical.profileId}/${scenario.scenarioId} selection path`);
      assert(basename(reportPath) === `${candidate.reportId}.json`,
        `${candidate.reportId}: selection path filename differs from the bundle`);
    }
  }
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

function parseEncodedGearItem(value, label) {
  const parts = String(value || "").split(",");
  const name = unquote(parts.shift());
  assert(/^[a-z0-9][a-z0-9_]*$/.test(name), `${label}: item name is invalid`);
  const attributes = {};
  for (const part of parts) {
    const index = part.indexOf("=");
    assert(index > 0, `${label}: item attribute is malformed`);
    const key = part.slice(0, index).trim().toLowerCase();
    const itemValue = unquote(part.slice(index + 1));
    assert(PROFILE_ITEM_KEYS.has(key) && !Object.hasOwn(attributes, key) && itemValue,
      `${label}: item has an unsupported or duplicate ${key || "attribute"}`);
    attributes[key] = itemValue;
  }
  assert(/^\d+$/.test(attributes.id || "") && /^\d+$/.test(attributes.ilevel || ""),
    `${label}: item id or level is invalid`);
  assert(!Object.hasOwn(attributes, "redirected_base_stats")
    || /^\d+$/.test(attributes.redirected_base_stats),
  `${label}: redirected base item id is invalid`);
  assert(!(Object.hasOwn(attributes, "enchant") && Object.hasOwn(attributes, "enchant_id")),
    `${label}: item contains conflicting enchants`);
  return {
    name,
    id: attributes.id,
    ilevel: attributes.ilevel,
    redirectedBaseItemId: attributes.redirected_base_stats || null,
    enhancements: Object.fromEntries(PERMANENT_ENHANCEMENT_KEYS
      .filter((key) => Object.hasOwn(attributes, key)).map((key) => [key, attributes[key]])),
  };
}

function expectedGear(gear, label) {
  assert(Number.isInteger(gear?.itemLevel) && gear.itemLevel > 0 && Array.isArray(gear.items),
    `${label}: expected gear plan is invalid`);
  const expected = {};
  for (const item of gear.items) {
    assert(Object.values(GEAR_SLOT_BY_KEY).includes(item.slot) && !Object.hasOwn(expected, item.slot),
      `${label}: expected gear slot ${item?.slot || "missing"} is invalid or duplicated`);
    assert(/^\d+$/.test(String(item.id || "")) && typeof item.name === "string" && item.name,
      `${label}/${item.slot}: expected item identity is invalid`);
    const enhancements = item.enhancements;
    assert(enhancements && typeof enhancements === "object" && !Array.isArray(enhancements)
      && Object.keys(enhancements).every((key) => PERMANENT_ENHANCEMENT_KEY_SET.has(key))
      && !(Object.hasOwn(enhancements, "enchant") && Object.hasOwn(enhancements, "enchant_id")),
    `${label}/${item.slot}: expected enhancements are invalid`);
    expected[item.slot] = {
      name: simcName(item.name),
      id: String(item.id),
      ilevel: String(gear.itemLevel),
      redirectedBaseItemId: item.redirectedBaseItemId ? String(item.redirectedBaseItemId) : null,
      enhancements: Object.fromEntries(PERMANENT_ENHANCEMENT_KEYS
        .filter((key) => Object.hasOwn(enhancements, key))
        .map((key) => [key, String(enhancements[key])])),
    };
  }
  return expected;
}

function profileGear(text, label) {
  const gear = {};
  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    if (line.trimStart().startsWith("#")) continue;
    const entry = assignment(line);
    const slot = entry && GEAR_SLOT_BY_KEY[entry.key];
    if (!slot) continue;
    assert(!Object.hasOwn(gear, slot), `${label}: profile gear slot ${slot} is duplicated`);
    gear[slot] = parseEncodedGearItem(entry.value, `${label}/${slot}`);
  }
  return gear;
}

function reportGear(player, label) {
  assert(player?.gear && typeof player.gear === "object" && !Array.isArray(player.gear),
    `${label}: selection report gear is missing`);
  const gear = {};
  for (const [key, item] of Object.entries(player.gear)) {
    const slot = GEAR_SLOT_BY_KEY[key.toLowerCase()];
    assert(slot && !Object.hasOwn(gear, slot) && typeof item?.encoded_item === "string",
      `${label}: selection report gear slot ${key} is invalid or duplicated`);
    gear[slot] = parseEncodedGearItem(item.encoded_item, `${label}/${slot}`);
  }
  return gear;
}

function verifyProfileIdentity(bytes, artifact) {
  const text = bytes.toString("utf8");
  const expectedHeader = [
    `# Curated same-gear profile: ${artifact.gearSetId}`,
    `# Upstream actor name: ${artifact.generatorActorName}`,
    `# Upstream actor/APL: ${artifact.generatorSource}`,
    `# Upstream generator SHA-256: ${artifact.generatorSha256}`,
    `# Talent source: ${artifact.talentSource}`,
    `# Gear plan SHA-256: ${artifact.gearPlanSha256}`,
  ].join("\n");
  assert(text.replace(/\r\n/g, "\n").startsWith(`${expectedHeader}\n`),
    `${artifact.profileFile}: sealed provenance header differs from the admitted declaration`);
  const actor = text.match(/^\s*[a-z][a-z_]*\s*=\s*"([^"]+)"\s*$/m)?.[1];
  assert(actor === artifact.sourceProfileName,
    `${artifact.profileFile}: materialized actor differs from its declaration`);
  const talents = text.replace(/\r\n/g, "\n").split("\n")
    .filter((line) => !line.trimStart().startsWith("#")).map(assignment)
    .filter((entry) => entry?.key === "talents").map((entry) => unquote(entry.value));
  assert(talents.length === 1 && talents[0] === artifact.talents,
    `${artifact.profileFile}: talents differ from the reviewed candidate`);
  assert(actorProjectionSha256(bytes, artifact.sourceProfileName)
    === artifact.actorProjectionSha256,
  `${artifact.profileFile}: non-gear actor/APL projection differs from the reviewed catalog`);
  const actualGear = profileGear(text, artifact.profileFile);
  const reviewedGear = expectedGear(artifact.gear, artifact.profileFile);
  assert(sameJson(actualGear, reviewedGear),
    `${artifact.profileFile}: materialized gear differs from the catalog-pinned plan`);
  return { actor, talents: talents[0], gear: actualGear };
}

function reportSetup(player) {
  return Object.fromEntries(PROFILE_SETUP_FIELDS.map((field) => [field, player?.[field] ?? null]));
}

function parseSelectionReport(bytes, artifact, build, profile) {
  let report;
  try { report = JSON.parse(bytes.toString("utf8")); }
  catch (error) { throw new Error(`${artifact.reportId}: selection report is invalid JSON: ${error.message}`); }
  const options = report.sim?.options || {};
  const players = report.sim?.players;
  const gameBuild = String(build.gameBuild || "").match(/^(\d+\.\d+\.\d+\.\d+) PTR$/)?.[1];
  assert(report.version === build.version && report.git_revision === build.revision,
    `${artifact.reportId}: selection report differs from the pinned SimC build`);
  assert(gameBuild && (report.ptr_enabled === 1 || report.ptr_enabled === true)
    && options.dbc?.version_used === "PTR"
    && options.dbc?.PTR?.wow_version === gameBuild,
  `${artifact.reportId}: selection report differs from the pinned PTR game build`);
  assert(Array.isArray(players) && players.length === 1,
    `${artifact.reportId}: selection report must contain exactly one player`);
  const player = players[0];
  assert(player?.name === artifact.sourceProfileName && player.specialization === artifact.specKey,
    `${artifact.reportId}: selection actor or specialization differs from the candidate`);
  assert(player.talents === artifact.talents && profile.talents === artifact.talents,
    `${artifact.reportId}: selection talents differ from the retained profile`);
  assert(options.fight_style === artifact.fightStyle && options.desired_targets === artifact.targets,
    `${artifact.reportId}: selection scenario differs from the manifest`);
  assert(options.threads === SELECTION_SETTINGS.threads
    && options.iterations === artifact.iterations
    && options.iterations >= SELECTION_ITERATIONS
    && options.iterations < SELECTION_ITERATIONS + SELECTION_SETTINGS.threads,
  `${artifact.reportId}: selection iterations or threads differ from policy`);
  assert(Number.isSafeInteger(options.seed) && String(options.seed) === artifact.seed,
    `${artifact.reportId}: selection seed differs from the bundle`);
  assert(options.fixed_time === SELECTION_SETTINGS.fixedTime
    && options.max_time === SELECTION_SETTINGS.maxTimeSeconds
    && options.vary_combat_length === SELECTION_SETTINGS.varyCombatLength
    && options.optimal_raid === 1,
  `${artifact.reportId}: selection combat settings differ from policy`);
  assert(options.scaling?.calculate_scale_factors !== 1
    && options.scaling?.calculate_scale_factors !== true && player.scale_factors === undefined,
  `${artifact.reportId}: selection report unexpectedly calculated scale factors`);
  const dps = player.collected_data?.dps;
  const confidence = options.confidence_estimator;
  assert(Number.isFinite(dps?.mean) && dps.mean > 0 && Number.isFinite(dps?.mean_std_dev)
    && Number.isFinite(confidence) && confidence > 0,
  `${artifact.reportId}: selection report lacks baseline DPS or confidence data`);
  const baselineDps = round(dps.mean, 4);
  const baselineDpsError = round(dps.mean_std_dev * confidence, 4);
  assert(baselineDps === artifact.baselineDps && baselineDpsError === artifact.baselineDpsError,
    `${artifact.reportId}: baseline DPS or error differs from the report bytes`);
  const actualGear = reportGear(player, artifact.reportId);
  assert(sameJson(actualGear, profile.gear),
    `${artifact.reportId}: selection gear differs from the retained profile`);
  const setupSha256 = sha256(Buffer.from(canonicalJson(reportSetup(player))));
  assert(setupSha256 === artifact.setupSha256,
    `${artifact.reportId}: non-talent setup digest differs from the report bytes`);
  return { baselineDps, baselineDpsError, setupSha256, candidateId: artifact.candidateId,
    sourceProfileName: artifact.sourceProfileName, profileFile: artifact.profileFile };
}

function verifySelectionWinners(plan, loaded) {
  const groups = new Map();
  for (const artifact of loaded.filter((entry) => entry.reportId)) {
    const key = `${artifact.profileId}\0${artifact.scenarioId}`;
    const entries = groups.get(key) || [];
    entries.push(artifact);
    groups.set(key, entries);
  }
  for (const [key, entries] of groups) {
    const first = entries[0];
    assert(entries.length === first.expectedCandidateCount
      && new Set(entries.map((entry) => entry.candidateId)).size === entries.length,
    `${key.replace("\0", "/")}: parsed selection candidate matrix is incomplete`);
    assert(new Set(entries.map((entry) => entry.parsedSelection.setupSha256)).size === 1,
      `${key.replace("\0", "/")}: candidates do not share the same non-talent setup`);
    const maximum = Math.max(...entries.map((entry) => entry.parsedSelection.baselineDps));
    const winners = entries.filter((entry) => entry.parsedSelection.baselineDps === maximum);
    assert(winners.length === 1 && winners[0].candidateId === first.selectedCandidateId
      && winners[0].sourceProfileName === first.selectedSourceProfileName,
    `${key.replace("\0", "/")}: retained reports do not select the declared unique DPS winner`);
    const manifestProfile = plan.manifest.profiles.find((profileEntry) =>
      profileEntry.profileId === first.profileId);
    const scenarioInput = manifestProfile?.scenarioInputs?.find((input) =>
      input.scenarioId === first.scenarioId);
    assert(scenarioInput?.sourceProfileName === winners[0].sourceProfileName
      && scenarioInput.profileFile === winners[0].profileFile,
    `${key.replace("\0", "/")}: selected manifest scenario input differs from the parsed winner`);
  }
}

async function loadArtifactBytes(plan, builds, gearingRoot) {
  const loaded = [];
  const profileSemantics = new Map();
  for (const artifact of [...plan.artifacts.profiles, ...plan.artifacts.selections]) {
    const bytes = await readFile(resolve(artifact.sourcePath));
    assert(sha256(bytes) === artifact.sha256,
      `${artifact.reportId || artifact.profileFile}: source artifact SHA-256 differs from the bundle`);
    const build = builds.get(artifact.buildId);
    assert(build, `${artifact.buildId}: artifact references an unknown build`);
    let parsedProfile = null;
    let parsedSelection = null;
    if (!artifact.reportId) {
      parsedProfile = verifyProfileIdentity(bytes, artifact);
      profileSemantics.set(`${artifact.buildId}\0${artifact.profileFile}`, parsedProfile);
    } else {
      const profile = profileSemantics.get(`${artifact.buildId}\0${artifact.profileFile}`);
      assert(profile, `${artifact.reportId}: retained candidate profile was not loaded`);
      parsedSelection = parseSelectionReport(bytes, artifact, build, profile);
    }
    const auditRoot = safeDescendant(join(gearingRoot, "data", "simc-audit"),
      join(gearingRoot, build.auditDirectory), `${build.buildId} audit directory`);
    const destination = artifact.reportId
      ? safeDescendant(join(auditRoot, "selections"),
        join(auditRoot, "selections", `${artifact.reportId}.json.gz`), artifact.reportId)
      : safeDescendant(join(auditRoot, "profiles"),
        join(auditRoot, "profiles", `${artifact.profileFile}.gz`), artifact.profileFile);
    loaded.push({ ...artifact, bytes, destination, parsedProfile, parsedSelection });
  }
  verifySelectionWinners(plan, loaded);
  return loaded;
}

async function verifyAppendOnlyDestinations(artifacts) {
  for (const artifact of artifacts) if (await exists(artifact.destination)) {
    const original = await gunzip(await readFile(artifact.destination));
    assert(sha256(original) === artifact.sha256,
      `${artifact.destination}: retained append-only artifact has different bytes`);
  }
}

async function appendOnlyGzip(artifact) {
  if (await exists(artifact.destination)) return false;
  await mkdir(dirname(artifact.destination), { recursive: true });
  const temporary = `${artifact.destination}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, await gzip(artifact.bytes, { level: 9 }), { flag: "wx" });
    try { await link(temporary, artifact.destination); }
    catch (error) {
      if (error.code !== "EEXIST") throw error;
      const original = await gunzip(await readFile(artifact.destination));
      assert(sha256(original) === artifact.sha256,
        `${artifact.destination}: retained append-only artifact has different bytes`);
      return false;
    }
    return true;
  } finally {
    try { await unlink(temporary); } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
}

async function atomicJsonWrite(path, value) {
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  try { await rename(temporary, path); }
  catch (error) {
    try { await unlink(temporary); } catch (cleanup) { if (cleanup.code !== "ENOENT") throw cleanup; }
    throw error;
  }
}

async function withAdmissionLock(paths, callback) {
  const lockPaths = [...new Set(paths.map((path) => resolve(path)))].sort()
    .map((path) => `${path}.promotion.lock`);
  const handles = [];
  try {
    for (const lockPath of lockPaths) {
      let handle;
      try { handle = await open(lockPath, "wx"); }
      catch (error) {
        if (error.code === "EEXIST")
          throw new Error(`promotion lock already exists at ${lockPath}`);
        throw error;
      }
      handles.push({ handle, lockPath });
      await handle.writeFile(`${JSON.stringify({ pid: process.pid,
        startedAt: new Date().toISOString(), targets: paths.map((path) => resolve(path)) })}\n`);
    }
    return await callback();
  } finally {
    for (const { handle, lockPath } of handles.reverse()) {
      try { await handle.close(); }
      finally {
        try { await unlink(lockPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
      }
    }
  }
}

export async function admitCuration({ bundlePaths, catalogPath = DEFAULT_CATALOG,
  manifestPath = DEFAULT_MANIFEST, weightsPath = DEFAULT_WEIGHTS }) {
  const resolvedCatalog = resolve(catalogPath);
  const resolvedManifest = resolve(manifestPath);
  const resolvedWeights = resolve(weightsPath);
  assert(Array.isArray(bundlePaths) && bundlePaths.length > 0, "admit requires --bundle <path>");
  return withAdmissionLock([resolvedManifest, resolvedWeights], async () => {
    const [catalog, manifest, weights] = await Promise.all([
      readJson(resolvedCatalog, "curation catalog"),
      readJson(resolvedManifest, "run manifest"),
      readJson(resolvedWeights, "reference ledger"),
    ]);
    const bundles = [];
    for (const input of bundlePaths) {
      const bundlePath = resolve(input);
      const bundle = await readJson(bundlePath, `curation bundle ${bundlePath}`);
      assert(resolve(bundle.catalog || "") === resolvedCatalog,
        `${bundlePath}: bundle catalog path differs from --catalog`);
      await verifyBundleArtifactPaths(bundle, bundlePath);
      bundles.push(bundle);
    }
    const gearDataHashes = await hashGearData(catalog, resolvedManifest);
    const plan = buildCurationAdmission({ bundles, catalog, manifest, weights, gearDataHashes });
    const gearingRoot = resolve(dirname(resolvedManifest), "..");
    const builds = new Map(plan.manifest.builds.map((build) => [build.buildId, build]));
    const artifacts = await loadArtifactBytes(plan, builds, gearingRoot);
    await verifyAppendOnlyDestinations(artifacts);
    let retained = 0;
    for (const artifact of artifacts) retained += Number(await appendOnlyGzip(artifact));
    await atomicJsonWrite(resolvedWeights, plan.weights);
    await atomicJsonWrite(resolvedManifest, plan.manifest);
    return {
      admittedProfiles: plan.manifest.profiles.length - manifest.profiles.length,
      retainedArtifacts: retained,
      verifiedArtifacts: artifacts.length,
      manifest: resolvedManifest,
      weights: resolvedWeights,
    };
  });
}

export function parseCli(argv) {
  const [command = "help", ...args] = argv;
  const options = { command, bundlePaths: [] };
  const valued = new Set(["--bundle", "--catalog", "--manifest", "--weights"]);
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    assert(valued.has(flag), `unknown option ${flag}`);
    const value = args[++index];
    assert(value && !value.startsWith("--"), `${flag} requires a value`);
    if (flag === "--bundle") options.bundlePaths.push(value);
    else options[flag.slice(2)] = value;
  }
  if (command === "admit") assert(options.bundlePaths.length, "admit requires --bundle <path>");
  else assert(command === "help", `unknown command ${command}`);
  return options;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseCli(argv);
  if (options.command === "help") {
    console.log("node gearing/src/admit-simc-curation.mjs admit --bundle <bundle.json> [--bundle <bundle.json>] [--catalog <path>] [--manifest <path>] [--weights <path>]");
    return null;
  }
  const result = await admitCuration({
    bundlePaths: options.bundlePaths,
    catalogPath: options.catalog,
    manifestPath: options.manifest,
    weightsPath: options.weights,
  });
  console.log(`Admitted ${result.admittedProfiles} ready profiles; verified ${result.verifiedArtifacts} artifacts (${result.retainedArtifacts} newly retained).`);
  return result;
}

const isDirect = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isDirect) main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
