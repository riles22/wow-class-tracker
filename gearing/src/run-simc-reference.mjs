// Plan, run, and explicitly promote SimulationCraft reference-weight jobs.
//
// The committed manifest is the operational authority. `plan` never writes;
// `run` writes resumable raw reports beneath .simc-work; `promote` is the only
// command that changes the accepted-results ledger and retained audit files.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzip as gzipCallback, gunzipSync } from "node:zlib";
import { promisify } from "node:util";
import { verifyCurationSourceFiles } from "./validate-curation-sources.mjs";

const gzip = promisify(gzipCallback);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = join(ROOT, "data", "simc-run-manifest.json");
const DEFAULT_WEIGHTS = join(ROOT, "data", "simc-reference-weights.json");
const DEFAULT_WORK = join(ROOT, ".simc-work");
const SECONDARIES = ["Crit", "Haste", "Mast", "Vers"];
const SIMC_SECONDARIES = { Crit: "crit", Haste: "haste", Mast: "mastery", Vers: "versatility" };
const PRIMARY = {
  Agility: { option: "agility", report: "Agi" },
  Intellect: { option: "intellect", report: "Int" },
  Strength: { option: "strength", report: "Str" },
};
const RUNNABLE_PROFILE_STATUSES = new Set(["accepted", "ready"]);
const SOURCE_MODES = new Set(["official-output", "curated-same-gear"]);
const SELECTION_MODES = new Set(["single-actor", "same-gear-dps"]);
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const SIMULATOR_PROVENANCE_FIELDS = ["version", "revision", "commit", "gameBuild", "platform",
  "arch", "artifactSource", "artifactSha256", "simcExeSha256"];

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function roundHalfEven(value, digits) {
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
const round = roundHalfEven;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function cleanId(value, label) {
  assert(typeof value === "string" && ID_PATTERN.test(value), `${label} must be a stable lowercase id`);
  return value;
}

function isoTimestamp(value, label = "timestamp") {
  const normalized = typeof value === "number" && value < 1e12 ? value * 1000 : value;
  const date = new Date(normalized);
  assert((typeof value === "string" || Number.isFinite(value)) && Number.isFinite(date.valueOf()),
    `invalid SimC ${label}`);
  return date.toISOString().replace(".000Z", "Z");
}

function reportBytes(input) {
  const bytes = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes;
}

function rawJsonInteger(text, key) {
  const match = text.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`));
  return match ? match[1] : null;
}

function gameVersion(value) {
  return String(value || "").replace(/\s+PTR$/i, "");
}

function compareRevision(actual, build) {
  if (typeof actual !== "string" || !/^[a-f0-9]{7,40}$/i.test(actual)) return false;
  return actual === build.commit || actual === build.revision
    || String(actual || "").startsWith(build.revision)
    || String(build.commit || "").startsWith(String(actual || ""));
}

export function deterministicSeed(jobId, runNumber) {
  assert(typeof jobId === "string" && jobId, "job id is required for a deterministic seed");
  assert(Number.isInteger(runNumber) && runNumber > 0, "run number must be a positive integer");
  const hex = createHash("sha256").update(`${jobId}\0${runNumber}`).digest("hex").slice(0, 16);
  const safeSpan = BigInt(Number.MAX_SAFE_INTEGER) - 1n;
  return ((BigInt(`0x${hex}`) % safeSpan) + 1n).toString();
}

export function jobRecordId(profileId, scenarioId) {
  return `${cleanId(profileId, "profile id")}-${cleanId(scenarioId, "scenario id")}`;
}

function sameUniqueSet(actual, expected) {
  return Array.isArray(actual) && Array.isArray(expected) && actual.length === expected.length
    && new Set(actual).size === actual.length && new Set(expected).size === expected.length
    && actual.every((value) => expected.includes(value));
}

function profileProvenanceMatches(record, input) {
  return record.sourceProfileName === input.sourceProfileName
    && (record.generatorActorName ?? undefined) === (input.generatorActorName ?? undefined)
    && (record.generatorSha256 ?? undefined) === (input.generatorSha256 ?? undefined)
    && record.sourceMode === input.sourceMode
    && record.generatorSource === input.generatorSource
    && record.talentSource === input.talentSource
    && (record.talentSourceAsOf ?? undefined) === (input.talentSourceAsOf ?? undefined)
    && (record.curationReviewedAt ?? undefined) === (input.curationReviewedAt ?? undefined)
    && (record.curationPolicyId ?? undefined) === (input.curationPolicyId ?? undefined)
    && (record.gearSetId ?? undefined) === (input.gearSetId ?? undefined)
    && (record.gearPlanSha256 ?? undefined) === (input.gearPlanSha256 ?? undefined)
    && sameUniqueSet(record.redirectedBaseItemIds, input.redirectedBaseItemIds)
    && record.tertiaryRatingsPresent === input.tertiaryRatingsPresent;
}

function effectiveRequestedIterations(policy, requestedIterationsPerRun) {
  const minimum = policy?.requestedIterationsPerRun;
  assert(Number.isSafeInteger(minimum) && minimum > 0,
    "manifest requestedIterationsPerRun must be a positive integer");
  const requested = requestedIterationsPerRun ?? minimum;
  assert(Number.isSafeInteger(requested) && requested > 0,
    "requested iterations must be a positive integer");
  assert(requested >= minimum,
    `requested iterations ${requested} are below the manifest minimum ${minimum}`);
  return requested;
}

function simulationContractMatches(ledger, record, scenario, policy) {
  const methodology = ledger?.methodology || {};
  const settings = methodology.settings || {};
  const declaredScenario = methodology.scenarios?.[scenario.scenarioId];
  const secondaries = policy?.secondaryStats;
  if (!Number.isInteger(policy?.runsPerRecord) || policy.runsPerRecord < 1
    || !Number.isSafeInteger(policy.requestedIterationsPerRun) || policy.requestedIterationsPerRun < 1
    || !Number.isFinite(policy.maximumRelativeDrift) || policy.maximumRelativeDrift < 0
    || policy.normalizeToPrimaryStat !== true || !sameUniqueSet(secondaries, SECONDARIES)) return false;
  const simcSecondaries = secondaries.map((stat) => SIMC_SECONDARIES[stat]);
  const exactWeights = (weights) => weights && sameUniqueSet(Object.keys(weights), secondaries)
    && secondaries.every((stat) => Number.isFinite(weights[stat]) && weights[stat] >= 0);
  const runs = record.runs;
  const requestedIterationsPerRun = record.requestedIterationsPerRun
    ?? policy.requestedIterationsPerRun;
  if (record.requestedIterationsPerRun !== undefined
    && (!Number.isSafeInteger(record.requestedIterationsPerRun)
      || record.requestedIterationsPerRun <= policy.requestedIterationsPerRun)) return false;
  return methodology.acceptedRunCount === policy.runsPerRecord
    && methodology.maximumRelativeDrift === policy.maximumRelativeDrift
    && settings.requestedIterationsPerRun === policy.requestedIterationsPerRun
    && settings.normalizeScaleFactors === policy.normalizeToPrimaryStat
    && settings.calculateScaleFactors === true && settings.ptr === true && settings.optimalRaid === true
    && settings.fixedTime === true && settings.maxTimeSeconds === 300
    && settings.varyCombatLength === 0.2
    && settings.scaleOnlyPolicy?.primaryStatField === "primaryStat"
    && sameUniqueSet(settings.scaleOnlyPolicy?.secondaries, simcSecondaries)
    && declaredScenario?.fightStyle === scenario.fightStyle
    && declaredScenario?.targets === scenario.targets
    && exactWeights(record.weights) && Number.isFinite(record.maxRelativeDrift)
    && record.maxRelativeDrift >= 0 && record.maxRelativeDrift <= policy.maximumRelativeDrift
    && Array.isArray(runs) && runs.length === policy.runsPerRecord
    && runs.every((run) => Number.isInteger(run.threads) && run.threads > 0
      && Number.isSafeInteger(run.iterations) && run.iterations >= requestedIterationsPerRun
      && run.iterations < requestedIterationsPerRun + run.threads && exactWeights(run.weights));
}

function acceptedRecordFor(ledger, spec, profile, scenario, build, profileInput, policy) {
  const { profileId } = profile;
  const { scenarioId } = scenario;
  const recordId = jobRecordId(profileId, scenarioId);
  const declaredSimulator = ledger?.methodology?.simulators === undefined
    ? ledger?.methodology?.simulator : ledger.methodology.simulators?.[build.buildId];
  return (ledger?.records || []).find((record) => record.status === "accepted"
    && record.recordId === recordId
    && record.profileId === profileId && record.scenario === scenarioId
    && record.buildId === build.buildId && record.specKey === spec.specKey
    && record.profile === profile.name && record.objective === profile.objective
    && record.primaryStat === profile.primaryStat && record.targets === scenario.targets
    && record.simcVersion === build.version && record.simcRevision === build.revision
    && record.gameBuild === build.gameBuild && profileProvenanceMatches(record, profileInput)
    && record.profileFile === profileInput.profileFile
    && record.profileSha256 === profileInput.profileSha256
    && (record.itemDbSource ?? undefined) === (profileInput.itemDbSource ?? undefined)
    && SIMULATOR_PROVENANCE_FIELDS.every((field) => declaredSimulator?.[field] === build[field])
    && simulationContractMatches(ledger, record, scenario, policy));
}

function profileInputForScenario(profile, scenarioId, curationPolicies = null) {
  assert(Array.isArray(profile.scenarioInputs), `${profile.profileId} requires scenarioInputs`);
  assert(SELECTION_MODES.has(profile.selectionMode), `${profile.profileId} has an invalid selectionMode`);
  assert(profile.selectionMode === "same-gear-dps" ? !!profile.selectionEvidence : !profile.selectionEvidence,
    `${profile.profileId} selectionMode does not match its selection evidence`);
  const planned = profile.scenarioIds || [];
  const inputIds = profile.scenarioInputs.map((input) => input.scenarioId);
  assert(profile.scenarioInputs.length === planned.length
    && new Set(inputIds).size === inputIds.length
    && planned.every((id) => inputIds.includes(id)),
  `${profile.profileId} scenarioInputs must cover every planned scenario exactly once`);
  const matches = profile.scenarioInputs.filter((input) => input.scenarioId === scenarioId);
  assert(matches.length === 1, `${profile.profileId}/${scenarioId} requires exactly one scenario input`);
  const input = matches[0];
  assert(typeof input.buildId === "string" && typeof input.sourceProfileName === "string"
    && input.sourceProfileName.trim() && SOURCE_MODES.has(input.sourceMode)
    && typeof input.generatorSource === "string" && typeof input.talentSource === "string"
    && typeof input.profileFile === "string" && /^[a-f0-9]{64}$/.test(input.profileSha256 || ""),
  `${profile.profileId}/${scenarioId} has an incomplete scenario input pin`);
  assert(Array.isArray(input.redirectedBaseItemIds)
    && input.redirectedBaseItemIds.every((id) => /^\d+$/.test(id))
    && new Set(input.redirectedBaseItemIds).size === input.redirectedBaseItemIds.length
    && typeof input.tertiaryRatingsPresent === "boolean",
  `${profile.profileId}/${scenarioId} has invalid Catalyst or tertiary provenance`);
  if (input.sourceMode === "official-output") {
    assert(input.talentSource === input.generatorSource
      && input.generatorActorName === undefined
      && input.generatorSha256 === undefined && input.gearPlanSha256 === undefined
      && input.curationReviewedAt === undefined && input.curationPolicyId === undefined
      && input.gearSetId === undefined,
    `${profile.profileId}/${scenarioId} has invalid official-output provenance`);
    if (input.talentSourceAsOf !== undefined)
      assert(/^\d{4}-\d{2}-\d{2}$/.test(input.talentSourceAsOf),
        `${profile.profileId}/${scenarioId} has an invalid talentSourceAsOf`);
  } else {
    assert(/^\d{4}-\d{2}-\d{2}$/.test(input.talentSourceAsOf || "")
      && /^\d{4}-\d{2}-\d{2}$/.test(input.curationReviewedAt || "")
      && typeof input.generatorActorName === "string" && input.generatorActorName.trim()
      && /^[a-f0-9]{64}$/.test(input.generatorSha256 || "")
      && /^[a-f0-9]{64}$/.test(input.gearPlanSha256 || "")
      && ID_PATTERN.test(input.curationPolicyId || "") && ID_PATTERN.test(input.gearSetId || ""),
    `${profile.profileId}/${scenarioId} has incomplete curated-same-gear provenance`);
    if (curationPolicies) {
      const policy = curationPolicies.get(input.curationPolicyId);
      const gearSet = policy?.gearSets?.find((entry) => entry.gearSetId === input.gearSetId);
      const generatorFile = basename(new URL(input.generatorSource).pathname);
      assert(policy && policy.reviewedAt === input.curationReviewedAt
        && gearSet?.specKey === profile.specKey
        && gearSet.gearPlanSha256 === input.gearPlanSha256
        && policy.generatorFileSha256?.[generatorFile] === input.generatorSha256,
      `${profile.profileId}/${scenarioId} references an invalid curation policy or gear set`);
    }
  }
  if (input.itemDbSource !== undefined)
    assert(typeof input.itemDbSource === "string" && /^[a-z0-9_-]+$/.test(input.itemDbSource),
      `${profile.profileId}/${scenarioId} has an invalid itemDbSource`);
  return input;
}

/** Build a complete, read-only view of all 40 dispositions and every planned job. */
export function planManifest(manifest, ledger = { records: [] }, { gearingRoot = ROOT } = {}) {
  verifyCurationSourceFiles(manifest, gearingRoot);
  assert(manifest?.schemaVersion === 2, "SimC run manifest schemaVersion must be 2");
  assert(Array.isArray(manifest.specs) && manifest.specs.length === 40,
    "SimC run manifest must account for all 40 specs");
  assert(Array.isArray(manifest.profiles) && Array.isArray(manifest.scenarios)
    && Array.isArray(manifest.builds) && Array.isArray(manifest.curationPolicies),
  "SimC run manifest catalogs are incomplete");

  const builds = new Map(manifest.builds.map((build) => [build.buildId, build]));
  const profiles = new Map(manifest.profiles.map((profile) => [profile.profileId, profile]));
  const scenarios = new Map(manifest.scenarios.map((scenario) => [scenario.scenarioId, scenario]));
  const curationPolicies = new Map();
  for (const policy of manifest.curationPolicies) {
    assert(ID_PATTERN.test(policy?.curationPolicyId || "")
      && /^\d{4}-\d{2}-\d{2}$/.test(policy?.reviewedAt || "")
      && policy?.generatorFileSha256 && !Array.isArray(policy.generatorFileSha256)
      && Object.entries(policy.generatorFileSha256).length
      && Object.entries(policy.generatorFileSha256).every(([file, digest]) =>
        /^MID2_Generate_[A-Za-z]+\.simc$/.test(file) && /^[a-f0-9]{64}$/.test(digest))
      && Array.isArray(policy?.gearSets) && policy.gearSets.length
      && !curationPolicies.has(policy.curationPolicyId),
    "SimC run manifest has an invalid curation policy catalog");
    curationPolicies.set(policy.curationPolicyId, policy);
  }
  const jobs = [];

  for (const spec of manifest.specs) {
    const profileIds = spec.profileIds || [];
    if (spec.eligibility === "eligible" && !profileIds.length) {
      for (const scenarioId of spec.plannedScenarioIds || []) {
        jobs.push({
          jobId: `${spec.specKey}::${scenarioId}`,
          specKey: spec.specKey,
          profileId: null,
          scenarioId,
          state: "blocked",
          reason: spec.reason || "No reviewed SimC profile has been admitted.",
        });
      }
      continue;
    }

    for (const profileId of profileIds) {
      const profile = profiles.get(profileId);
      if (!profile) {
        jobs.push({ jobId: `${profileId}::unknown`, specKey: spec.specKey, profileId,
          scenarioId: null, state: "blocked", reason: "Profile id is absent from the curated catalog." });
        continue;
      }
      for (const scenarioId of profile.scenarioIds || []) {
        const profileInput = profileInputForScenario(profile, scenarioId, curationPolicies);
        const curationPolicy = profileInput.curationPolicyId
          ? curationPolicies.get(profileInput.curationPolicyId) : null;
        const scenario = scenarios.get(scenarioId);
        const build = builds.get(profileInput.buildId);
        let reason = null;
        if (profile.specKey !== spec.specKey) reason = "Profile/spec ownership does not match.";
        else if (!RUNNABLE_PROFILE_STATUSES.has(profile.status)) reason = `Profile status is ${profile.status}.`;
        else if (!build || build.status !== "accepted") reason = "Simulator build is not accepted.";
        else if (!scenario) reason = "Scenario is absent from the curated catalog.";
        else if (scenario.objective !== profile.objective) reason = "Profile/scenario objectives do not match.";
        else if (!PRIMARY[profile.primaryStat] || profile.primaryStat !== spec.primaryStat)
          reason = "Profile primary stat does not match the spec roster.";
        const accepted = !reason
          && acceptedRecordFor(ledger, spec, profile, scenario, build, profileInput,
            manifest.acceptancePolicy);
        const jobId = `${profileId}::${scenarioId}`;
        jobs.push({
          jobId,
          recordId: jobRecordId(profileId, scenarioId),
          specKey: spec.specKey,
          profileId,
          scenarioId,
          profile,
          scenario,
          build,
          profileInput,
          curationPolicy,
          state: reason ? "blocked" : accepted ? "accepted" : "runnable",
          reason,
          seeds: [1, 2].map((run) => deterministicSeed(jobId, run)),
        });
      }
    }
  }

  const specs = manifest.specs.map((spec) => {
    const own = jobs.filter((job) => job.specKey === spec.specKey);
    return { ...spec, jobs: own, acceptedJobs: own.filter((job) => job.state === "accepted").length,
      runnableJobs: own.filter((job) => job.state === "runnable").length,
      blockedJobs: own.filter((job) => job.state === "blocked").length };
  });
  return {
    specs,
    jobs,
    summary: Object.fromEntries(["accepted", "runnable", "blocked"].map((state) =>
      [state, jobs.filter((job) => job.state === state).length])),
  };
}

export function findPlannedJob(plan, profileId, scenarioId) {
  const job = plan.jobs.find((candidate) => candidate.profileId === profileId
    && candidate.scenarioId === scenarioId);
  assert(job, `No manifest job exists for ${profileId}/${scenarioId}`);
  assert(job.state !== "blocked", `${profileId}/${scenarioId} is blocked: ${job.reason}`);
  return job;
}

export function simcArgumentsForJob(job, reportPath, seed, threads, requestedIterationsPerRun) {
  const policy = job.policy;
  const requestedIterations = effectiveRequestedIterations(policy, requestedIterationsPerRun);
  const primary = PRIMARY[job.profile.primaryStat];
  assert(primary, `Unsupported primary stat ${job.profile.primaryStat}`);
  assert(/^\d+$/.test(seed) && BigInt(seed) <= BigInt(Number.MAX_SAFE_INTEGER), "seed must be an exact safe integer string");
  assert(Number.isInteger(threads) && threads > 0, "threads must be a positive integer");
  return [
    "ptr=1",
    ...(job.profileInput?.itemDbSource ? [`item_db_source=${job.profileInput.itemDbSource}`] : []),
    job.profilePath,
    "optimal_raid=1",
    `fight_style=${job.scenario.fightStyle}`,
    `desired_targets=${job.scenario.targets}`,
    "fixed_time=1",
    "max_time=300",
    "vary_combat_length=0.2",
    `iterations=${requestedIterations}`,
    `threads=${threads}`,
    `seed=${seed}`,
    "calculate_scale_factors=1",
    "normalize_scale_factors=1",
    `scale_only=${primary.option},crit,haste,mastery,versatility`,
    `json2=${reportPath}`,
  ];
}

/** Parse and validate one original-byte SimC JSON report. */
export function parseSimcReport(input, expected) {
  const original = reportBytes(input);
  const text = original.toString("utf8");
  let report;
  try { report = JSON.parse(text); }
  catch (error) { throw new Error(`invalid SimC JSON report: ${error.message}`); }

  const { build, profile, scenario, policy } = expected;
  const requestedIterationsPerRun = effectiveRequestedIterations(policy,
    expected.requestedIterationsPerRun);
  const sim = report.sim || {};
  const options = sim.options || {};
  const players = sim.players || [];
  assert(report.version === build.version, `SimC report version ${report.version} does not match ${build.version}`);
  assert(compareRevision(report.git_revision, build), "SimC report revision does not match the manifest build");
  assert((report.ptr_enabled === true || report.ptr_enabled === 1) && options.dbc?.version_used === "PTR",
    "SimC report did not use PTR data");
  assert(gameVersion(options.dbc?.PTR?.wow_version) === gameVersion(build.gameBuild),
    `SimC report game build ${options.dbc?.PTR?.wow_version || "missing"} does not match ${build.gameBuild}`);
  assert(options.fight_style === scenario.fightStyle && options.desired_targets === scenario.targets,
    "SimC report scenario does not match the manifest job");
  assert(options.fixed_time === true && options.optimal_raid === 1,
    "SimC report lacks fixed-time optimal-raid settings");
  assert(options.max_time === 300, "SimC report max_time must be 300 seconds");
  assert(options.vary_combat_length === 0.2, "SimC report vary_combat_length must be 0.2");
  assert(options.scaling?.calculate_scale_factors === 1 && options.scaling?.normalize_scale_factors === 1,
    "SimC report lacks normalized scale factors");
  assert(players.length === 1, `SimC report must contain exactly one player, found ${players.length}`);
  const player = players[0];
  assert(player.specialization === profile.specKey,
    `SimC report player ${player.specialization || "missing"} does not match ${profile.specKey}`);

  const threads = options.threads;
  const iterations = options.iterations;
  assert(Number.isInteger(threads) && threads > 0, "SimC report has invalid thread count");
  if (expected.threads !== undefined)
    assert(threads === expected.threads,
      `SimC report thread count ${threads} does not match requested ${expected.threads}`);
  assert(Number.isSafeInteger(iterations) && iterations >= requestedIterationsPerRun
    && iterations < requestedIterationsPerRun + threads,
  `SimC report iterations ${iterations} are outside the requested worker range`);
  const seed = rawJsonInteger(text, "seed");
  assert(seed && /^\d+$/.test(seed), "SimC report seed is missing or inexact");
  if (expected.seed) assert(seed === expected.seed, `SimC report seed ${seed} does not match ${expected.seed}`);

  const primary = PRIMARY[profile.primaryStat];
  const scale = player.scale_factors || {};
  assert(primary && Math.abs(scale[primary.report] - 1) <= 1e-6,
    `SimC report is not normalized to ${profile.primaryStat}`);
  const expectedScaleOnly = [primary.option, "crit", "haste", "mastery", "versatility"];
  const scaleOnlyValues = String(options.scaling.scale_only || "").split(",")
    .map((value) => value.trim()).filter(Boolean);
  const scaleOnly = new Set(scaleOnlyValues);
  assert(scaleOnlyValues.length === expectedScaleOnly.length && scaleOnly.size === expectedScaleOnly.length
    && expectedScaleOnly.every((stat) => scaleOnly.has(stat)),
  `SimC report scale_only must contain exactly ${expectedScaleOnly.join(",")}`);

  const rawWeights = { Crit: scale.Crit, Haste: scale.Haste, Mast: scale.Mastery, Vers: scale.Vers };
  assert(Object.values(rawWeights).every((value) => Number.isFinite(value)), "SimC report has incomplete secondary weights");
  const dps = player.collected_data?.dps;
  assert(Number.isFinite(dps?.mean) && dps.mean > 0 && Number.isFinite(dps?.mean_std_dev),
    "SimC report lacks baseline DPS statistics");
  const confidence = options.confidence_estimator;
  assert(Number.isFinite(confidence) && confidence > 0, "SimC report lacks its confidence estimator");

  const parsed = {
    reportId: expected.reportId,
    seed,
    iterations,
    threads,
    baselineDps: round(dps.mean, 4),
    baselineDpsError: round(dps.mean_std_dev * confidence, 4),
    weights: Object.fromEntries(SECONDARIES.map((stat) => [stat, round(rawWeights[stat], 6)])),
    resultSha256: sha256(original),
    timestamp: isoTimestamp(report.timestamp),
  };
  return parsed;
}

export function aggregateAcceptedRecord({ profile, profileInput, scenario, build, policy, profileSha256,
  requestedIterationsPerRun, runs }) {
  const requestedIterations = effectiveRequestedIterations(policy, requestedIterationsPerRun);
  assert(Array.isArray(runs) && runs.length === policy.runsPerRecord,
    `accepted records require exactly ${policy.runsPerRecord} runs`);
  assert(new Set(runs.map((run) => run.seed)).size === runs.length, "accepted runs reused an RNG seed");
  assert(new Set(runs.map((run) => run.reportId)).size === runs.length, "accepted runs reused a report id");
  assert(runs.every((run) => SECONDARIES.every((stat) => Number.isFinite(run.weights?.[stat])
    && run.weights[stat] >= 0)), "accepted runs contain invalid or negative weights");
  assert(runs.every((run) => Number.isInteger(run.threads) && run.threads > 0
    && Number.isInteger(run.iterations) && run.iterations >= requestedIterations
    && run.iterations < requestedIterations + run.threads),
  "accepted runs do not satisfy the requested iteration range");

  let maxRelativeDrift = 0;
  const weights = {};
  for (const stat of SECONDARIES) {
    const values = runs.map((run) => run.weights[stat]);
    weights[stat] = round(values.reduce((sum, value) => sum + value, 0) / values.length, 6);
    for (let left = 0; left < values.length; left++) for (let right = left + 1; right < values.length; right++) {
      const denominator = (Math.abs(values[left]) + Math.abs(values[right])) / 2;
      maxRelativeDrift = Math.max(maxRelativeDrift,
        denominator ? Math.abs(values[left] - values[right]) / denominator : 0);
    }
  }
  maxRelativeDrift = round(maxRelativeDrift, 6);
  assert(maxRelativeDrift <= policy.maximumRelativeDrift,
    `run drift ${(maxRelativeDrift * 100).toFixed(2)}% exceeds ${(policy.maximumRelativeDrift * 100).toFixed(2)}%`);
  const baselineValues = runs.map((run) => run.baselineDps);
  const baselineDpsRelativeDrift = round(Math.abs(baselineValues[0] - baselineValues[1])
    / ((baselineValues[0] + baselineValues[1]) / 2), 6);
  const simulatedAt = runs.map((run) => isoTimestamp(run.timestamp)).sort().at(-1);
  const input = profileInput || profileInputForScenario(profile, scenario.scenarioId);
  return {
    recordId: jobRecordId(profile.profileId, scenario.scenarioId),
    profileId: profile.profileId,
    buildId: build.buildId,
    objective: profile.objective,
    primaryStat: profile.primaryStat,
    specKey: profile.specKey,
    profile: profile.name,
    scenario: scenario.scenarioId,
    targets: scenario.targets,
    status: "accepted",
    ...(requestedIterations > policy.requestedIterationsPerRun
      ? { requestedIterationsPerRun: requestedIterations } : {}),
    weights,
    maxRelativeDrift,
    baselineDpsRelativeDrift,
    simcVersion: build.version,
    simcRevision: build.revision,
    gameBuild: build.gameBuild,
    simulatedAt,
    sourceProfileName: input.sourceProfileName,
    ...(input.generatorActorName ? { generatorActorName: input.generatorActorName } : {}),
    ...(input.generatorSha256 ? { generatorSha256: input.generatorSha256 } : {}),
    sourceMode: input.sourceMode,
    generatorSource: input.generatorSource,
    talentSource: input.talentSource,
    ...(input.talentSourceAsOf ? { talentSourceAsOf: input.talentSourceAsOf } : {}),
    ...(input.curationReviewedAt ? { curationReviewedAt: input.curationReviewedAt } : {}),
    ...(input.curationPolicyId ? { curationPolicyId: input.curationPolicyId } : {}),
    ...(input.gearSetId ? { gearSetId: input.gearSetId } : {}),
    ...(input.gearPlanSha256 ? { gearPlanSha256: input.gearPlanSha256 } : {}),
    profileFile: input.profileFile,
    profileSha256,
    ...(input.itemDbSource ? { itemDbSource: input.itemDbSource } : {}),
    redirectedBaseItemIds: [...input.redirectedBaseItemIds],
    tertiaryRatingsPresent: input.tertiaryRatingsPresent,
    runs,
  };
}

function simulatorProvenance(build) {
  return Object.fromEntries(SIMULATOR_PROVENANCE_FIELDS.map((field) => [field, build[field]]));
}

function selectionArtifacts(manifest) {
  return (manifest?.profiles || []).flatMap((profile) =>
    (profile.selectionEvidence?.scenarios || []).flatMap((scenario) => scenario.candidates || []));
}

function synchronizeMethodologyBuilds(methodology, accepted, manifest) {
  if (!methodology || !accepted.length) return;
  const buildIds = [...new Set([
    ...accepted.map((entry) => entry.buildId),
    ...selectionArtifacts(manifest).map((candidate) => candidate.buildId),
  ])].sort();
  if (!manifest && buildIds.length === 1
    && !methodology.simulators && !methodology.auditArtifacts?.directories)
    return;
  assert(manifest, "multi-build evidence promotion requires the current run manifest");
  const builds = new Map((manifest.builds || []).map((build) => [build.buildId, build]));
  const selected = buildIds.map((buildId) => {
    const build = builds.get(buildId);
    assert(build, `run or selection evidence references unknown simulator build ${buildId}`);
    return build;
  });
  if (selected.length === 1) {
    methodology.simulator = simulatorProvenance(selected[0]);
    delete methodology.simulators;
  } else {
    methodology.simulators = Object.fromEntries(selected.map((build) =>
      [build.buildId, simulatorProvenance(build)]));
    delete methodology.simulator;
  }
  const audit = methodology.auditArtifacts;
  if (!audit) return;
  if (selected.length === 1) {
    audit.directory = selected[0].auditDirectory;
    audit.compression = selected[0].compression;
    delete audit.directories;
  } else {
    audit.directories = Object.fromEntries(selected.map((build) => [build.buildId,
      { directory: build.auditDirectory, compression: build.compression }]));
    delete audit.directory;
    delete audit.compression;
  }
}

export function mergeAcceptedRecord(ledger, record, { force = false, manifest } = {}) {
  assert(record?.status === "accepted" && record.recordId, "only accepted stable-id records can be promoted");
  const records = [...(ledger.records || [])];
  const index = records.findIndex((existing) => existing.recordId === record.recordId
    || (existing.profileId === record.profileId && existing.scenario === record.scenario));
  if (index >= 0 && records[index].status === "accepted" && !force) {
    if (JSON.stringify(records[index]) !== JSON.stringify(record))
      throw new Error(`${record.recordId} is already accepted; pass --force to replace its evidence explicitly`);
  }
  if (index >= 0) records[index] = record;
  else records.push(record);
  const accepted = records.filter((entry) => entry.status === "accepted");
  const generatedAt = accepted.map((entry) => entry.simulatedAt).filter(Boolean).sort().at(-1)
    || ledger.generatedAt;
  const next = { ...ledger, generatedAt, records,
    methodology: ledger.methodology ? structuredClone(ledger.methodology) : ledger.methodology };
  synchronizeMethodologyBuilds(next.methodology, accepted, manifest);
  const audit = next.methodology?.auditArtifacts;
  if (audit) {
    audit.profiles = new Set([
      ...accepted.map((entry) => `${entry.buildId}\0${entry.profileFile}`),
      ...selectionArtifacts(manifest).map((candidate) =>
        `${candidate.buildId}\0${candidate.profileFile}`),
    ]).size;
    audit.reports = accepted.reduce((sum, entry) => sum + (entry.runs || []).length, 0);
    if (manifest) audit.selections = new Set(selectionArtifacts(manifest)
      .map((candidate) => `${candidate.buildId}\0${candidate.reportId}`)).size;
  }
  return next;
}

export function finalizeManifestAcceptance(manifest, ledger, profileIds) {
  const next = JSON.parse(JSON.stringify(manifest));
  const requested = new Set(profileIds);
  const acceptedRecords = (ledger.records || []).filter((record) => record.status === "accepted");
  for (const profile of next.profiles) {
    if (!requested.has(profile.profileId) || profile.status !== "ready") continue;
    const scenarios = new Set(acceptedRecords.filter((record) => record.profileId === profile.profileId)
      .map((record) => record.scenario));
    assert((profile.scenarioIds || []).every((scenarioId) => scenarios.has(scenarioId)),
      `${profile.profileId} cannot be accepted until every planned scenario is promoted`);
    profile.status = "accepted";
  }
  const acceptedProfileIds = new Set(next.profiles.filter((profile) => profile.status === "accepted")
    .map((profile) => profile.profileId));
  const profilesById = new Map(next.profiles.map((profile) => [profile.profileId, profile]));
  for (const spec of next.specs) {
    if (spec.eligibility !== "eligible") continue;
    const visible = (spec.profileIds || []).map((profileId) => profilesById.get(profileId))
      .filter((profile) => profile && profile.status !== "rejected");
    if (visible.length && visible.every((profile) => profile.status === "accepted")) {
      spec.status = "accepted";
      delete spec.reason;
    } else if (visible.length) {
      spec.status = "pending";
      spec.reason ||= "Not every visible guide profile has completed its accepted scenario matrix.";
    }
  }
  const eligible = next.specs.filter((spec) => spec.eligibility === "eligible");
  const coverage = next.coverage || {};
  const publishedRecords = acceptedRecords.filter((record) => acceptedProfileIds.has(record.profileId));
  coverage.acceptedEligibleSpecs = eligible.filter((spec) => spec.status === "accepted").length;
  coverage.pendingEligibleSpecs = eligible.length - coverage.acceptedEligibleSpecs;
  coverage.acceptedProfiles = acceptedProfileIds.size;
  coverage.acceptedRecords = publishedRecords.length;
  coverage.acceptedReports = publishedRecords.reduce((sum, record) => sum + (record.runs || []).length, 0);
  next.coverage = coverage;
  return next;
}

function withPolicy(job, manifest) {
  return { ...job, policy: manifest.acceptancePolicy };
}

async function exists(path) {
  try { await access(path); return true; }
  catch { return false; }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function atomicWrite(path, contents) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, contents);
  await rename(temporary, path);
}

export async function withPromotionLock(targetPaths, callback) {
  const paths = Array.isArray(targetPaths) ? targetPaths : [targetPaths];
  assert(paths.length > 0, "promotion lock requires at least one mutable target");
  const keyedPaths = new Map();
  for (const path of paths) {
    const resolved = resolve(path);
    const key = process.platform === "win32" ? resolved.toLowerCase() : resolved;
    if (!keyedPaths.has(key)) keyedPaths.set(key, resolved);
  }
  const lockPaths = [...keyedPaths.entries()]
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([, path]) => `${path}.promotion.lock`);
  const handles = [];
  try {
    for (const lockPath of lockPaths) {
      let handle;
      try {
        handle = await open(lockPath, "wx");
      } catch (error) {
        if (error.code === "EEXIST")
          throw new Error(`promotion lock already exists at ${lockPath}; another promotion may be running. If it is a crash remnant, inspect and remove that exact file manually.`);
        throw error;
      }
      handles.push({ handle, lockPath });
      await handle.writeFile(`${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString(),
        targets: paths.map((path) => resolve(path)) })}\n`);
    }
    return await callback();
  } finally {
    for (const { handle, lockPath } of handles.reverse()) {
      try { await handle.close(); }
      finally {
        try { await unlink(lockPath); }
        catch (error) { if (error.code !== "ENOENT") throw error; }
      }
    }
  }
}

function safeChild(root, ...parts) {
  const full = resolve(root, ...parts);
  assert(full.startsWith(`${resolve(root)}${sep}`), `path escapes ${root}`);
  return full;
}

function jobDirectory(workRoot, job) {
  return safeChild(workRoot, cleanId(job.build.buildId, "build id"),
    cleanId(job.profileId, "profile id"), cleanId(job.scenarioId, "scenario id"));
}

async function profileSourceBytes(job, gearingRoot, overridePath) {
  if (overridePath) return reportBytes(await readFile(resolve(overridePath)));
  const auditRoot = safeChild(gearingRoot, job.build.auditDirectory);
  const retained = safeChild(auditRoot, "profiles", `${basename(job.profileInput.profileFile)}.gz`);
  assert(await exists(retained), `retained profile is missing: ${relative(gearingRoot, retained)}`);
  return reportBytes(await readFile(retained));
}

export async function verifySimcExecutable(executable, build) {
  assert(executable, "run requires --simc <path> or SIMC_EXE");
  assert(build.platform === process.platform && build.arch === process.arch,
    `SimulationCraft build ${build.buildId} is pinned for ${build.platform || "unknown"}/${build.arch || "unknown"}; current runner is ${process.platform}/${process.arch}`);
  const path = resolve(executable);
  const actual = sha256(await readFile(path));
  assert(actual === build.simcExeSha256,
    `SimulationCraft executable SHA-256 ${actual} does not match ${build.simcExeSha256}`);
  return { path, sha256: actual };
}

function spawnProcess(executable, args, options) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(executable, args, { ...options, shell: false, windowsHide: true });
    let stdout = "", stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk; });
    child.stderr?.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolvePromise({ stdout, stderr })
      : reject(new Error(`SimulationCraft exited ${code}: ${(stderr || stdout).slice(-2000)}`)));
  });
}

function runReportId(job, runNumber) {
  return `${job.recordId}_r${runNumber}`;
}

export function jobFingerprint(manifest, job, executableHash, profileHash, threads,
  requestedIterationsPerRun) {
  const requestedIterations = effectiveRequestedIterations(manifest.acceptancePolicy,
    requestedIterationsPerRun);
  const input = { manifestId: manifest.manifestId, build: job.build,
    profile: job.profile, profileInput: job.profileInput, scenario: job.scenario,
    curationPolicy: job.curationPolicy,
    policy: manifest.acceptancePolicy,
    executableHash, profileHash, threads };
  if (requestedIterations > manifest.acceptancePolicy.requestedIterationsPerRun)
    input.requestedIterationsPerRun = requestedIterations;
  return sha256(Buffer.from(JSON.stringify(input)));
}

function checkpointMetadataMatches(checkpoint, fingerprint, executableSha256, profileSha256, threads,
  requestedIterationsPerRun) {
  return checkpoint?.schemaVersion === 1 && checkpoint.fingerprint === fingerprint
    && checkpoint.executableSha256 === executableSha256
    && checkpoint.profileSha256 === profileSha256 && checkpoint.threads === threads
    && (requestedIterationsPerRun === undefined
      ? checkpoint.requestedIterationsPerRun === undefined
      : checkpoint.requestedIterationsPerRun === requestedIterationsPerRun)
    && Array.isArray(checkpoint.runs);
}

export function checkpointAllowsResume(checkpoint, fingerprint, reportId, bytes, expectedSeed) {
  if (checkpoint?.fingerprint !== fingerprint || !Array.isArray(checkpoint.runs)) return false;
  const prior = checkpoint.runs.find((run) => run.reportId === reportId);
  return typeof prior?.resultSha256 === "string"
    && prior.resultSha256 === sha256(reportBytes(bytes))
    && (expectedSeed === undefined || prior.seed === expectedSeed);
}

export function validatePromotionCheckpoint(checkpoint, manifest, job, profileSha256) {
  assert(checkpoint?.executableSha256 === job.build.simcExeSha256,
    "work checkpoint executable SHA-256 does not match the accepted simulator build");
  assert(Number.isInteger(checkpoint.threads) && checkpoint.threads > 0,
    "work checkpoint has an invalid thread count");
  const requestedIterationsPerRun = checkpoint.requestedIterationsPerRun;
  if (requestedIterationsPerRun !== undefined)
    assert(Number.isSafeInteger(requestedIterationsPerRun)
      && requestedIterationsPerRun > manifest.acceptancePolicy.requestedIterationsPerRun,
    "work checkpoint has an invalid requested iteration override");
  const fingerprint = jobFingerprint(manifest, job, checkpoint.executableSha256,
    profileSha256, checkpoint.threads, requestedIterationsPerRun);
  assert(checkpointMetadataMatches(checkpoint, fingerprint, checkpoint.executableSha256,
    profileSha256, checkpoint.threads, requestedIterationsPerRun),
  "work checkpoint does not match the current manifest job");
  const expectedRuns = Array.from({ length: manifest.acceptancePolicy.runsPerRecord }, (_, index) => ({
    reportId: runReportId(job, index + 1),
    seed: deterministicSeed(job.jobId, index + 1),
  }));
  assert(checkpoint.runs.length === expectedRuns.length
    && new Set(checkpoint.runs.map((run) => run.reportId)).size === expectedRuns.length,
  "work checkpoint is not a complete distinct run set");
  for (const expected of expectedRuns) {
    const prior = checkpoint.runs.find((run) => run.reportId === expected.reportId);
    assert(prior?.seed === expected.seed && /^[a-f0-9]{64}$/.test(prior?.resultSha256 || ""),
      `work checkpoint entry ${expected.reportId} is missing or invalid`);
  }
  return { fingerprint, threads: checkpoint.threads,
    ...(requestedIterationsPerRun === undefined ? {} : { requestedIterationsPerRun }) };
}

async function runSelectedJob({ manifest, job, executable, profileFile, workRoot, gearingRoot, threads,
  requestedIterationsPerRun }) {
  const requestedIterations = effectiveRequestedIterations(manifest.acceptancePolicy,
    requestedIterationsPerRun);
  const iterationOverride = requestedIterations > manifest.acceptancePolicy.requestedIterationsPerRun
    ? requestedIterations : undefined;
  const verified = await verifySimcExecutable(executable, job.build);
  const originalProfile = await profileSourceBytes(job, gearingRoot, profileFile);
  const profileHash = sha256(originalProfile);
  assert(profileHash === job.profileInput.profileSha256,
    `profile SHA-256 ${profileHash} does not match ${job.profileInput.profileSha256}`);

  const directory = jobDirectory(workRoot, job);
  await mkdir(directory, { recursive: true });
  const profilePath = safeChild(directory, basename(job.profileInput.profileFile));
  const fingerprint = jobFingerprint(manifest, job, verified.sha256, profileHash, threads,
    iterationOverride);
  const checkpointPath = safeChild(directory, "checkpoint.json");
  const checkpointBase = { schemaVersion: 1, fingerprint, executableSha256: verified.sha256,
    profileSha256: profileHash, threads,
    ...(iterationOverride === undefined ? {} : { requestedIterationsPerRun: iterationOverride }) };
  let resumeCheckpoint = null;
  if (await exists(checkpointPath)) {
    try {
      const prior = await readJson(checkpointPath);
      if (checkpointMetadataMatches(prior, fingerprint, verified.sha256, profileHash, threads,
        iterationOverride))
        resumeCheckpoint = prior;
    } catch { resumeCheckpoint = null; }
  }
  if (!resumeCheckpoint)
    await atomicWrite(checkpointPath, `${JSON.stringify({ ...checkpointBase, runs: [] }, null, 2)}\n`);
  await atomicWrite(profilePath, originalProfile);
  const runnable = { ...job, profilePath, policy: manifest.acceptancePolicy };

  const runs = [];
  for (let runNumber = 1; runNumber <= manifest.acceptancePolicy.runsPerRecord; runNumber++) {
    const reportId = runReportId(job, runNumber);
    const seed = deterministicSeed(job.jobId, runNumber);
    const reportPath = safeChild(directory, `${reportId}.json`);
    let parsed = null;
    if (resumeCheckpoint && await exists(reportPath)) {
      const bytes = await readFile(reportPath);
      try {
        if (checkpointAllowsResume(resumeCheckpoint, fingerprint, reportId, bytes, seed))
          parsed = parseSimcReport(bytes, { reportId, seed, build: job.build,
            profile: job.profile, scenario: job.scenario, policy: manifest.acceptancePolicy, threads,
            requestedIterationsPerRun: requestedIterations });
      } catch { parsed = null; }
    }
    if (!parsed) {
      const args = simcArgumentsForJob(runnable, reportPath, seed, threads, requestedIterations);
      await spawnProcess(verified.path, args, { cwd: directory });
      assert(await exists(reportPath), `SimulationCraft did not create ${reportPath}`);
      parsed = parseSimcReport(await readFile(reportPath), { reportId, seed, build: job.build,
        profile: job.profile, scenario: job.scenario, policy: manifest.acceptancePolicy, threads,
        requestedIterationsPerRun: requestedIterations });
    }
    runs.push(parsed);
    const checkpoint = { ...checkpointBase,
      runs: runs.map((run) => ({ reportId: run.reportId, seed: run.seed,
        resultSha256: run.resultSha256, timestamp: run.timestamp })) };
    await atomicWrite(checkpointPath, `${JSON.stringify(checkpoint, null, 2)}\n`);
  }
  return { directory, runs };
}

async function writeGzipArtifact(path, original, conflictMessage) {
  if (await exists(path)) {
    const existing = reportBytes(await readFile(path));
    if (sha256(existing) === sha256(original)) return;
    throw new Error(conflictMessage || `retained artifact already exists with different bytes: ${path}`);
  }
  await mkdir(dirname(path), { recursive: true });
  await atomicWrite(path, await gzip(original, { level: 9 }));
}

export function makeAppendOnlyReplacement(ledger, evidence, { force = false } = {}) {
  const existing = (ledger.records || []).find((record) => record.status === "accepted"
    && (record.recordId === evidence.record.recordId
      || (record.profileId === evidence.record.profileId && record.scenario === evidence.record.scenario)));
  if (!existing || JSON.stringify(existing) === JSON.stringify(evidence.record)) return evidence;
  const withoutReportIds = (record) => ({ ...record, runs: (record.runs || []).map((run) => {
    const copy = { ...run };
    delete copy.reportId;
    return copy;
  }) });
  if (JSON.stringify(withoutReportIds(existing)) === JSON.stringify(withoutReportIds(evidence.record))) {
    const record = structuredClone(evidence.record);
    const reportArtifacts = evidence.reportArtifacts.map((artifact, index) => {
      assert(existing.runs[index]?.resultSha256 === record.runs[index]?.resultSha256,
        "idempotent retained evidence has mismatched run hashes");
      record.runs[index].reportId = existing.runs[index].reportId;
      return { ...artifact, reportId: existing.runs[index].reportId };
    });
    return { ...evidence, record, reportArtifacts };
  }
  if (!force) return evidence;
  const record = structuredClone(evidence.record);
  const reportArtifacts = evidence.reportArtifacts.map((artifact, index) => {
    const run = record.runs[index];
    assert(run && sha256(reportBytes(artifact.bytes)) === run.resultSha256,
      `report artifact ${artifact.reportId} does not match its accepted run hash`);
    const reportId = `${record.recordId}_r${index + 1}_${run.resultSha256}`;
    cleanId(reportId, "append-only report id");
    run.reportId = reportId;
    return { ...artifact, reportId };
  });
  return { ...evidence, record, reportArtifacts };
}

export function promotionApprovalMatches(approval, job, evidence) {
  return approval?.schemaVersion === 1 && approval.jobId === job.jobId
    && JSON.stringify(approval.record) === JSON.stringify(evidence.record);
}

async function readWorkEvidence({ manifest, job, workRoot, gearingRoot }) {
  const directory = jobDirectory(workRoot, job);
  const profilePath = safeChild(directory, basename(job.profileInput.profileFile));
  assert(await exists(profilePath), `run output is missing ${relative(gearingRoot, profilePath)}`);
  const originalProfile = await readFile(profilePath);
  const profileHash = sha256(originalProfile);
  assert(profileHash === job.profileInput.profileSha256, "work profile no longer matches the manifest SHA-256");
  const checkpointPath = safeChild(directory, "checkpoint.json");
  assert(await exists(checkpointPath), `run checkpoint is missing ${relative(gearingRoot, checkpointPath)}`);
  const checkpoint = await readJson(checkpointPath);
  const verifiedCheckpoint = validatePromotionCheckpoint(checkpoint, manifest, job, profileHash);

  const runs = [];
  const reportArtifacts = [];
  for (let runNumber = 1; runNumber <= manifest.acceptancePolicy.runsPerRecord; runNumber++) {
    const reportId = runReportId(job, runNumber);
    const reportPath = safeChild(directory, `${reportId}.json`);
    assert(await exists(reportPath), `run output is missing ${relative(gearingRoot, reportPath)}`);
    const bytes = await readFile(reportPath);
    const seed = deterministicSeed(job.jobId, runNumber);
    assert(checkpointAllowsResume(checkpoint, verifiedCheckpoint.fingerprint, reportId, bytes, seed),
      `${reportId} is not bound to the current verified run checkpoint`);
    const parsed = parseSimcReport(bytes, { reportId, seed,
      build: job.build, profile: job.profile, scenario: job.scenario, policy: manifest.acceptancePolicy,
      requestedIterationsPerRun: verifiedCheckpoint.requestedIterationsPerRun });
    assert(parsed.threads === verifiedCheckpoint.threads,
      `${reportId} thread count does not match the verified run checkpoint`);
    runs.push(parsed);
    reportArtifacts.push({ reportId, bytes });
  }
  const record = aggregateAcceptedRecord({ profile: job.profile, profileInput: job.profileInput,
    scenario: job.scenario,
    build: job.build, policy: manifest.acceptancePolicy, profileSha256: profileHash,
    requestedIterationsPerRun: verifiedCheckpoint.requestedIterationsPerRun, runs });
  return { job, directory, originalProfile, reportArtifacts, record };
}

async function retainWorkEvidence(evidence, gearingRoot) {
  const { job, originalProfile, reportArtifacts } = evidence;
  const auditRoot = safeChild(gearingRoot, job.build.auditDirectory);
  assert(auditRoot.startsWith(`${resolve(gearingRoot, "data", "simc-audit")}${sep}`),
    "manifest audit directory must be below data/simc-audit");
  await writeGzipArtifact(safeChild(auditRoot, "profiles", `${basename(job.profileInput.profileFile)}.gz`),
    originalProfile, `retained profile ${job.profileInput.profileFile} has different bytes; admit a new profile id/file/build instead of overwriting reviewed profile evidence`);
  for (const artifact of reportArtifacts)
    await writeGzipArtifact(safeChild(auditRoot, "reports", `${artifact.reportId}.json.gz`),
      artifact.bytes, `append-only report id collision for ${artifact.reportId}`);
}

async function promoteSelectedJob({ manifest, ledger, plan, job, workRoot, gearingRoot,
  manifestPath, weightsPath, force }) {
  const selected = await readWorkEvidence({ manifest, job, workRoot, gearingRoot });
  const marker = safeChild(selected.directory, "promotion.json");
  await atomicWrite(marker, `${JSON.stringify({ schemaVersion: 1, jobId: job.jobId,
    record: selected.record }, null, 2)}\n`);

  if (job.profile.status === "ready") {
    const profileJobs = (job.profile.scenarioIds || []).map((scenarioId) =>
      findPlannedJob(plan, job.profileId, scenarioId));
    const missingScenarios = [];
    for (const candidate of profileJobs) {
      const candidateMarker = safeChild(jobDirectory(workRoot, candidate), "promotion.json");
      if (!(await exists(candidateMarker))) missingScenarios.push(candidate.scenarioId);
    }
    if (missingScenarios.length)
      return { staged: true, record: selected.record, missingScenarios };

    const evidence = [];
    for (const candidate of profileJobs) {
      const item = await readWorkEvidence({ manifest, job: candidate, workRoot, gearingRoot });
      const candidateMarker = safeChild(item.directory, "promotion.json");
      const approval = await readJson(candidateMarker);
      assert(promotionApprovalMatches(approval, candidate, item),
      `${candidate.recordId} work evidence changed after its explicit promotion approval; promote that scenario again`);
      evidence.push(makeAppendOnlyReplacement(ledger, item, { force }));
    }
    let nextLedger = ledger;
    for (const item of evidence)
      nextLedger = mergeAcceptedRecord(nextLedger, item.record, { force, manifest });
    const nextManifest = finalizeManifestAcceptance(manifest, nextLedger, [job.profileId]);
    for (const item of evidence) await retainWorkEvidence(item, gearingRoot);

    // Validators permit accepted evidence under a ready profile, so the brief
    // two-file commit window is recoverable; the final manifest transition then
    // publishes the complete profile matrix atomically at the policy level.
    await atomicWrite(weightsPath, `${JSON.stringify(nextLedger, null, 2)}\n`);
    await atomicWrite(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);
    return { staged: false, records: evidence.map((item) => item.record), manifestFinalized: true };
  }

  const retained = makeAppendOnlyReplacement(ledger, selected, { force });
  const nextLedger = mergeAcceptedRecord(ledger, retained.record, { force, manifest });
  await retainWorkEvidence(retained, gearingRoot);
  await atomicWrite(weightsPath, `${JSON.stringify(nextLedger, null, 2)}\n`);
  return { staged: false, records: [retained.record], manifestFinalized: false };
}

export function parseCli(argv) {
  const args = [...argv];
  let command = "plan";
  if (args[0] && !args[0].startsWith("-")) command = args.shift();
  else if (args[0] === "--plan" || args[0] === "--run" || args[0] === "--promote")
    command = args.shift().slice(2);
  assert(["plan", "run", "promote", "help"].includes(command), `unknown command ${command}`);
  const options = { command, force: false };
  const values = new Set(["--profile", "--scenario", "--simc", "--profile-file", "--threads", "--iterations",
    "--manifest", "--weights", "--work-dir"]);
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--force") { options.force = true; continue; }
    if (arg === "--help" || arg === "-h") { options.command = "help"; continue; }
    assert(values.has(arg), `unknown option ${arg}`);
    assert(args[index + 1] && !args[index + 1].startsWith("--"), `${arg} requires a value`);
    const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    options[key] = args[++index];
  }
  if (options.threads !== undefined) {
    options.threads = Number(options.threads);
    assert(Number.isInteger(options.threads) && options.threads > 0,
      "--threads must be a positive integer");
  }
  if (options.iterations !== undefined) {
    options.iterations = Number(options.iterations);
    assert(Number.isSafeInteger(options.iterations) && options.iterations > 0,
      "--iterations must be a positive integer");
  }
  if (options.command === "run" || options.command === "promote") {
    assert(options.profile && options.scenario, `${options.command} requires --profile and --scenario`);
  }
  if (options.force) assert(options.command === "promote", "--force is promote-only");
  if (options.profileFile) assert(options.command === "run", "--profile-file is run-only");
  const allowed = {
    plan: new Set(["manifest", "weights"]),
    run: new Set(["profile", "scenario", "simc", "profileFile", "threads", "iterations",
      "manifest", "weights", "workDir"]),
    promote: new Set(["profile", "scenario", "force", "manifest", "weights", "workDir"]),
    help: new Set(),
  }[options.command];
  for (const [key, value] of Object.entries(options)) {
    if (key === "command" || (key === "force" && value === false)) continue;
    assert(allowed.has(key), `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is not valid for ${options.command}`);
  }
  return options;
}

function printHelp() {
  console.log(`Usage:
  node gearing/src/run-simc-reference.mjs [plan]
  node gearing/src/run-simc-reference.mjs run --profile <id> --scenario <id> --simc <path> [--profile-file <path>] [--threads <n>] [--iterations <n>]
  node gearing/src/run-simc-reference.mjs promote --profile <id> --scenario <id> [--force]

Path overrides: --manifest <path> --weights <path>; run/promote also accept --work-dir <path>
--iterations is run-only and must be at least the manifest requestedIterationsPerRun minimum.
SIMC_EXE may be used instead of --simc. plan/no arguments are strictly read-only.`);
}

function printPlan(plan) {
  console.log("SimulationCraft reference coverage (40 specs)");
  for (const spec of plan.specs) {
    const counts = spec.jobs.length
      ? `; jobs accepted=${spec.acceptedJobs} runnable=${spec.runnableJobs} blocked=${spec.blockedJobs}` : "";
    console.log(`${String(spec.status || spec.eligibility).toUpperCase().padEnd(11)} ${spec.specKey}${counts}`
      + (spec.reason ? ` — ${spec.reason}` : ""));
  }
  console.log(`Jobs: accepted=${plan.summary.accepted} runnable=${plan.summary.runnable} blocked=${plan.summary.blocked}`);
  for (const job of plan.jobs)
    console.log(`  ${job.state.padEnd(8)} ${job.profileId || job.specKey}/${job.scenarioId || "profile"}`
      + (job.reason ? ` — ${job.reason}` : ""));
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseCli(argv);
  if (options.command === "help") { printHelp(); return; }
  const manifestPath = resolve(options.manifest || DEFAULT_MANIFEST);
  const weightsPath = resolve(options.weights || DEFAULT_WEIGHTS);
  const workRoot = resolve(options.workDir || DEFAULT_WORK);
  const manifestGearingRoot = resolve(dirname(manifestPath), "..");

  if (options.command === "promote") {
    return withPromotionLock([manifestPath, weightsPath], async () => {
      // Shared state is deliberately re-read only after the cross-process lock;
      // no promotion may merge against a stale whole-file snapshot.
      const manifest = await readJson(manifestPath);
      const ledger = await readJson(weightsPath);
      const plan = planManifest(manifest, ledger, { gearingRoot: manifestGearingRoot });
      const job = withPolicy(findPlannedJob(plan, options.profile, options.scenario), manifest);
      const result = await promoteSelectedJob({ manifest, ledger, plan, job, workRoot,
        gearingRoot: ROOT, manifestPath, weightsPath, force: options.force });
      if (result.staged)
        console.log(`Validated ${result.record.recordId}; waiting to promote scenarios: ${result.missingScenarios.join(", ")}`);
      else console.log(`Promoted ${result.records.map((record) => record.recordId).join(", ")}`
        + (result.manifestFinalized ? " and finalized the profile manifest" : ""));
      return result;
    });
  }

  const manifest = await readJson(manifestPath);
  const ledger = await readJson(weightsPath);
  const plan = planManifest(manifest, ledger, { gearingRoot: manifestGearingRoot });
  if (options.command === "plan") { printPlan(plan); return plan; }

  const job = withPolicy(findPlannedJob(plan, options.profile, options.scenario), manifest);
  if (options.command === "run") {
    const executable = options.simc || process.env.SIMC_EXE;
    const threads = options.threads || Math.max(1, Math.min(8, availableParallelism()));
    const result = await runSelectedJob({ manifest, job, executable, profileFile: options.profileFile, workRoot,
      gearingRoot: ROOT, threads, requestedIterationsPerRun: options.iterations });
    console.log(`Completed ${job.recordId}: ${result.runs.length} verified reports in ${result.directory}`);
    return result;
  }
}

const isDirect = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isDirect) main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
