import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { isDeepStrictEqual, promisify } from "node:util";
import { gunzip as gunzipCallback } from "node:zlib";
import { aggregateAcceptedRecord, parseSimcReport } from "./run-simc-reference.mjs";

const gunzip = promisify(gunzipCallback);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const scenarioInput = (profile, scenarioId) => Array.isArray(profile?.scenarioInputs)
  ? profile.scenarioInputs.find((input) => input.scenarioId === scenarioId) || null
  : null;
const gameVersion = (value) => String(value || "").replace(/\s+PTR$/i, "");
const rawJsonInteger = (text, key) => {
  const match = text.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`));
  return match ? match[1] : null;
};
const roundHalfEven = (value, digits) => {
  const factor = 10 ** digits;
  const sign = Math.sign(value) || 1;
  const scaled = Math.abs(value) * factor;
  const lower = Math.floor(scaled);
  const fraction = scaled - lower;
  const tolerance = Number.EPSILON * Math.max(1, scaled) * 4;
  const integer = Math.abs(fraction - 0.5) <= tolerance
    ? (lower % 2 === 0 ? lower : lower + 1) : Math.round(scaled);
  return sign * integer / factor;
};
const SELECTION_SETUP_FIELDS = [
  "race", "level", "role", "specialization", "profile_source", "party", "ready_type",
  "bugs", "valid_fight_style", "scale_player", "potion_used", "timeofday", "zandalari_loa",
  "vulpera_tricks", "earthen_mineral", "invert_scaling", "reaction_offset", "reaction_max",
  "reaction_mean", "reaction_stddev", "reaction_nu", "world_lag", "world_lag_stddev",
  "brain_lag", "brain_lag_stddev", "potion", "flask", "food", "augmentation",
  "temporary_enchant", "gear",
];

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}

function selectionSetupSignature(player) {
  return JSON.stringify(canonical(Object.fromEntries(SELECTION_SETUP_FIELDS
    .map((field) => [field, player?.[field] ?? null]))));
}

function sameUniqueSet(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length
    && new Set(left).size === left.length && new Set(right).size === right.length
    && left.every((value) => right.includes(value));
}

function sameProfileProvenance(left, right) {
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
    && sameUniqueSet(left.redirectedBaseItemIds, right.redirectedBaseItemIds)
    && left.tertiaryRatingsPresent === right.tertiaryRatingsPresent;
}

function tertiaryRatingsPresent(player) {
  return Object.values(player?.gear || {}).some((item) =>
    ["avoidance_rating", "leech_rating", "speed_rating"].some((field) => Number(item?.[field]) > 0));
}

function profileIdentity(bytes) {
  const text = bytes.toString("utf8");
  const actor = text.match(/^\s*[a-z][a-z_]*\s*=\s*"([^"]+)"\s*$/m)?.[1];
  const talents = text.match(/^\s*talents\s*=\s*(\S+)\s*$/m)?.[1];
  const gearSetId = text.match(/^# Curated same-gear profile:\s*(.+?)\s*$/m)?.[1] || null;
  const generatorActorName = text.match(/^# Upstream actor name:\s*(.+?)\s*$/m)?.[1] || null;
  const generatorSource = text.match(/^# Upstream actor\/APL:\s*(.+?)\s*$/m)?.[1] || null;
  const generatorSha256 = text.match(/^# Upstream generator SHA-256:\s*([a-f0-9]{64})\s*$/m)?.[1] || null;
  const talentSource = text.match(/^# Talent source:\s*(.+?)\s*$/m)?.[1] || null;
  const gearPlanSha256 = text.match(/^# Gear plan SHA-256:\s*([a-f0-9]{64})\s*$/m)?.[1] || null;
  if (!actor || !talents) throw new Error("retained profile lacks its actor or talent loadout");
  const redirectedBaseItemIds = [...text.matchAll(/redirected_base_stats=(\d+)/g)]
    .map((match) => match[1]);
  if (new Set(redirectedBaseItemIds).size !== redirectedBaseItemIds.length)
    throw new Error("retained profile repeats a redirected_base_stats item id");
  return { actor, talents, gearSetId, generatorActorName, generatorSource, generatorSha256,
    talentSource, gearPlanSha256, redirectedBaseItemIds };
}

function verifySelectionReport(bytes, { profile, scenario, selectionScenario, candidate, build, settings }) {
  const text = bytes.toString("utf8");
  const report = JSON.parse(text);
  const options = report.sim?.options || {};
  const players = report.sim?.players || [];
  const player = players[0];
  const dps = player?.collected_data?.dps;
  const confidence = options.confidence_estimator;
  const failures = [];
  if (report.version !== build.version || report.git_revision !== build.revision)
    failures.push("simulator version or revision differs from the selected build");
  if (!(report.ptr_enabled === 1 || report.ptr_enabled === true)
    || options.dbc?.version_used !== "PTR"
    || options.dbc?.PTR?.wow_version !== gameVersion(build.gameBuild))
    failures.push("PTR game build differs from the selected build");
  if (options.fight_style !== scenario?.fightStyle || options.desired_targets !== scenario?.targets)
    failures.push("fight style or target count differs from the selected scenario");
  if (rawJsonInteger(text, "seed") !== selectionScenario.seed
    || options.iterations !== candidate.iterations || options.threads !== settings.threads)
    failures.push("seed, iterations, or threads differ from the selection declaration");
  if (options.fixed_time !== settings.fixedTime || options.max_time !== settings.maxTimeSeconds
    || options.vary_combat_length !== settings.varyCombatLength
    || options.optimal_raid !== Number(settings.optimalRaid))
    failures.push("fixed-time or raid settings differ from the selection declaration");
  if (settings.calculateScaleFactors !== false
    || options.scaling?.calculate_scale_factors === 1
    || options.scaling?.calculate_scale_factors === true
    || player?.scale_factors !== undefined || player?.scale_deltas !== undefined)
    failures.push("selection report calculated scale factors");
  if (players.length !== 1 || player?.specialization !== profile.specKey
    || player?.name !== candidate.sourceProfileName)
    failures.push("selection report player does not match the candidate profile");
  if (tertiaryRatingsPresent(player) !== candidate.tertiaryRatingsPresent)
    failures.push("selection report tertiary ratings differ from the candidate declaration");
  if (!Number.isFinite(dps?.mean) || dps.mean <= 0 || !Number.isFinite(dps?.mean_std_dev)
    || !Number.isFinite(confidence) || confidence <= 0
    || roundHalfEven(dps?.mean, 4) !== candidate.baselineDps
    || roundHalfEven(dps?.mean_std_dev * confidence, 4) !== candidate.baselineDpsError)
    failures.push("selection report DPS or confidence error differs from the declaration");
  if (failures.length) throw new Error(failures.join("; "));
  return { actor: player.name, talents: player.talents, setup: selectionSetupSignature(player) };
}

export async function validateSimcAuditArtifacts(simcWeights, simcManifest, root) {
  // Backward-compatible call shape for focused consumers that pass (weights, root).
  if (root === undefined) {
    root = simcManifest;
    simcManifest = JSON.parse(await readFile(join(root, "data", "simc-run-manifest.json"), "utf8"));
  }
  if (simcManifest?.schemaVersion !== 2 || !Array.isArray(simcManifest?.builds)
    || !Array.isArray(simcManifest?.profiles) || !Array.isArray(simcManifest?.scenarios)
    || !Array.isArray(simcManifest?.curationPolicies))
    throw new Error("SimC audit artifact validation failed:\n- run manifest is missing or malformed");

  const builds = new Map(simcManifest.builds.map((build) => [build.buildId, build]));
  const profiles = new Map(simcManifest.profiles.map((profile) => [profile.profileId, profile]));
  const scenarios = new Map(simcManifest.scenarios.map((scenario) => [scenario.scenarioId, scenario]));
  const acceptedProfiles = simcManifest.profiles.filter((profile) => profile.status === "accepted");
  const acceptedMatrix = new Set(acceptedProfiles.flatMap((profile) =>
    (profile.scenarioIds || []).map((scenarioId) => `${profile.profileId}\u0000${scenarioId}`)));
  const acceptedRecords = simcWeights.records?.filter((entry) => entry.status === "accepted") || [];
  const expected = new Map();
  const failures = [];
  const profileIdentities = new Map();
  const profileDeclarations = new Map();
  const acceptedRunEvidence = new Map();
  const selectionReportEvidence = new Map();
  const addExpected = (auditDirectory, relativePath, expectedHash, verify = null) => {
    const auditRoot = resolve(root, auditDirectory || "");
    const resolvedRoot = resolve(root);
    if (!auditDirectory || (!auditRoot.startsWith(`${resolvedRoot}${sep}`) && auditRoot !== resolvedRoot)) {
      failures.push(`${auditDirectory || "missing audit directory"}: path escapes the project root`);
      return;
    }
    const fullPath = resolve(auditRoot, relativePath);
    if (!fullPath.startsWith(`${auditRoot}${sep}`)) {
      failures.push(`${relativePath}: path escapes the reviewed audit directory`);
      return;
    }
    if (!/^[a-f0-9]{64}$/.test(expectedHash || "")) {
      failures.push(`${relativePath}: invalid expected SHA-256`);
      return;
    }
    const prior = expected.get(fullPath);
    if (prior && prior.expectedHash !== expectedHash)
      failures.push(`${relativePath}: conflicting expected SHA-256 values`);
    else expected.set(fullPath, { relativePath, expectedHash, verify: verify || prior?.verify || null });
  };
  const addProfile = (build, input) => {
    const artifactKey = `${build.buildId}\u0000${input.profileFile}`;
    const prior = profileDeclarations.get(artifactKey);
    if (prior && (!sameUniqueSet(prior.redirectedBaseItemIds, input.redirectedBaseItemIds)
      || prior.tertiaryRatingsPresent !== input.tertiaryRatingsPresent))
      failures.push(`${input.profileFile}: one retained profile has conflicting Catalyst or tertiary declarations`);
    else profileDeclarations.set(artifactKey, input);
    addExpected(build.auditDirectory, join("profiles", `${input.profileFile}.gz`), input.profileSha256,
      (bytes) => {
        const identity = profileIdentity(bytes);
        if (!sameUniqueSet(identity.redirectedBaseItemIds, input.redirectedBaseItemIds))
          throw new Error("retained profile redirected_base_stats ids differ from the manifest");
        if (input.sourceMode === "curated-same-gear"
          && (identity.gearSetId !== input.gearSetId
            || identity.generatorActorName !== input.generatorActorName
            || identity.generatorSource !== input.generatorSource
            || identity.generatorSha256 !== input.generatorSha256
            || identity.talentSource !== input.talentSource
            || identity.gearPlanSha256 !== input.gearPlanSha256))
          throw new Error("retained profile curation provenance differs from the manifest");
        profileIdentities.set(artifactKey, identity);
      });
  };

  for (const profile of acceptedProfiles) {
    for (const scenarioId of profile.scenarioIds || []) {
      const input = scenarioInput(profile, scenarioId);
      const build = builds.get(input?.buildId);
      if (!input || !build) {
        failures.push(`${profile.profileId}/${scenarioId}: accepted profile input references an unknown build`);
        continue;
      }
      addProfile(build, input);
    }
  }

  const seenSelectionReports = new Set();
  for (const profile of simcManifest.profiles) {
    const evidence = profile.selectionEvidence;
    if (!evidence) continue;
    for (const selectionScenario of evidence.scenarios || []) {
      const scenario = scenarios.get(selectionScenario?.scenarioId);
      const candidates = selectionScenario?.candidates || [];
      if (new Set(candidates.map((candidate) => candidate?.buildId)).size !== 1)
        failures.push(`${profile.profileId}/${selectionScenario?.scenarioId || "unknown"}: selection candidates do not share one build`);
      for (const candidate of candidates) {
        const build = builds.get(candidate?.buildId);
        const selectionKey = `${candidate?.buildId}\u0000${candidate?.reportId}`;
        if (!build) {
          failures.push(`${profile.profileId}/${selectionScenario?.scenarioId || "unknown"}: selection references an unknown build`);
          continue;
        }
        if (!/^[a-z0-9][a-z0-9_-]*$/.test(candidate?.reportId || "")) {
          failures.push(`${profile.profileId}/${selectionScenario?.scenarioId || "unknown"}: unsafe selection report id ${candidate?.reportId || "missing"}`);
          continue;
        }
        if (seenSelectionReports.has(selectionKey)) {
          failures.push(`${candidate.reportId}: duplicate retained selection report id`);
          continue;
        }
        seenSelectionReports.add(selectionKey);
        addProfile(build, candidate);
        addExpected(build.auditDirectory, join("selections", `${candidate.reportId}.json.gz`),
          candidate.resultSha256, (bytes) => {
            const verified = verifySelectionReport(bytes, {
              profile, scenario, selectionScenario, candidate, build, settings: evidence.settings || {},
            });
            const scenarioKey = `${profile.profileId}\u0000${selectionScenario.scenarioId}`;
            const retained = selectionReportEvidence.get(scenarioKey) || [];
            retained.push({ candidate, ...verified });
            selectionReportEvidence.set(scenarioKey, retained);
          });
      }
    }
  }

  const seenPublishedMatrix = new Set();
  const seenReports = new Set();
  for (const record of acceptedRecords) {
    const profile = profiles.get(record.profileId);
    const input = scenarioInput(profile, record.scenario);
    const build = builds.get(record.buildId);
    const matrixKey = `${record.profileId}\u0000${record.scenario}`;
    const requestedIterationsPerRun = record.requestedIterationsPerRun
      ?? simcManifest.acceptancePolicy.requestedIterationsPerRun;
    if (record.requestedIterationsPerRun !== undefined
      && (!Number.isSafeInteger(record.requestedIterationsPerRun)
        || record.requestedIterationsPerRun <= simcManifest.acceptancePolicy.requestedIterationsPerRun))
      failures.push(`${record.recordId || matrixKey}: invalid requested iteration override`);
    if (profile?.status === "accepted") seenPublishedMatrix.add(matrixKey);
    if (!profile || !["accepted", "ready"].includes(profile.status)
      || !profile.scenarioIds?.includes(record.scenario))
      failures.push(`${record.recordId || matrixKey}: accepted evidence is not planned by an accepted or ready profile`);
    if (!profile || !input || !build || input.buildId !== record.buildId)
      failures.push(`${record.recordId || matrixKey}: profile/build linkage does not match the run manifest`);
    if (input && !sameProfileProvenance(record, input))
      failures.push(`${record.recordId || matrixKey}: profile artifact does not match the run manifest`);
    if (!build) continue;
    // Use the ledger path as well as comparing it above so traversal mutations are
    // rejected directly by the audit boundary rather than only as metadata drift.
    addExpected(build.auditDirectory, join("profiles", `${record.profileFile}.gz`), record.profileSha256);
    if (input) addProfile(build, input);
    for (const run of record.runs || []) {
      if (!/^[a-z0-9][a-z0-9_-]*$/.test(run?.reportId || "")) {
        failures.push(`${record.recordId || matrixKey}: unsafe report id ${run?.reportId || "missing"}`);
        continue;
      }
      if (seenReports.has(run.reportId)) failures.push(`${run.reportId}: duplicate accepted report id`);
      seenReports.add(run.reportId);
      addExpected(build.auditDirectory, join("reports", `${run.reportId}.json.gz`), run.resultSha256,
        (bytes) => {
          const parsed = parseSimcReport(bytes, { reportId: run.reportId, seed: run.seed,
            build, profile, scenario: scenarios.get(record.scenario),
            policy: simcManifest.acceptancePolicy, threads: run.threads,
            requestedIterationsPerRun });
          if (!isDeepStrictEqual(parsed, run))
            throw new Error("accepted report does not reproduce its ledger run");
          const player = JSON.parse(bytes.toString("utf8")).sim?.players?.[0];
          if (tertiaryRatingsPresent(player) !== input?.tertiaryRatingsPresent)
            throw new Error("accepted report tertiary ratings differ from the manifest");
          const retained = acceptedRunEvidence.get(record.recordId) || [];
          retained.push({ parsed, actor: player?.name, talents: player?.talents });
          acceptedRunEvidence.set(record.recordId, retained);
        });
    }
  }
  if (seenPublishedMatrix.size !== acceptedMatrix.size
    || [...acceptedMatrix].some((key) => !seenPublishedMatrix.has(key)))
    failures.push("accepted result matrix does not match the run manifest");

  const profileCount = [...expected.values()].filter(({ relativePath }) =>
    relativePath.startsWith(`profiles${sep}`)).length;
  const reportCount = [...expected.values()].filter(({ relativePath }) =>
    relativePath.startsWith(`reports${sep}`)).length;
  const selectionCount = [...expected.values()].filter(({ relativePath }) =>
    relativePath.startsWith(`selections${sep}`)).length;
  const requiredPublishedReports = acceptedMatrix.size
    * (simcManifest.acceptancePolicy?.runsPerRecord || 0);
  const requiredPublishedProfiles = new Set(acceptedProfiles.flatMap((profile) =>
    (profile.scenarioIds || []).map((scenarioId) => {
      const input = scenarioInput(profile, scenarioId);
      return input ? `${input.buildId}\u0000${input.profileFile}` : `${profile.profileId}\u0000${scenarioId}`;
    }))).size;
  if (profileCount < requiredPublishedProfiles || reportCount < requiredPublishedReports)
    failures.push(`expected ${requiredPublishedProfiles} generated profiles and ${requiredPublishedReports} accepted reports, found ${profileCount} and ${reportCount}`);
  const declared = simcWeights?.methodology?.auditArtifacts || {};
  const evidenceBuilds = new Set([
    ...acceptedProfiles.flatMap((profile) => (profile.scenarioIds || [])
      .map((scenarioId) => scenarioInput(profile, scenarioId)?.buildId).filter(Boolean)),
    ...acceptedRecords.map((record) => record.buildId),
    ...simcManifest.profiles.flatMap((profile) => (profile.selectionEvidence?.scenarios || [])
      .flatMap((selectionScenario) => (selectionScenario.candidates || [])
        .map((candidate) => candidate.buildId))),
  ]);
  if (!evidenceBuilds.size && builds.has(simcManifest.activeBuildId))
    evidenceBuilds.add(simcManifest.activeBuildId);
  const declaredDirectories = declared.directories;
  let declarationMatches = declared.profiles === profileCount && declared.reports === reportCount
    && (declared.selections ?? 0) === selectionCount;
  if (declaredDirectories === undefined) {
    const onlyBuild = evidenceBuilds.size === 1 ? builds.get([...evidenceBuilds][0]) : null;
    declarationMatches = declarationMatches && !!onlyBuild
      && declared.directory === onlyBuild.auditDirectory && declared.compression === onlyBuild.compression;
  } else if (!declaredDirectories || Array.isArray(declaredDirectories)
    || typeof declaredDirectories !== "object"
    || Object.keys(declaredDirectories).length !== evidenceBuilds.size
    || [...evidenceBuilds].some((buildId) => !(buildId in declaredDirectories))) {
    declarationMatches = false;
  } else {
    for (const buildId of evidenceBuilds) {
      const build = builds.get(buildId);
      const entry = declaredDirectories[buildId];
      const directory = typeof entry === "string" ? entry : entry?.directory;
      const compression = typeof entry === "object" && entry?.compression
        ? entry.compression : declared.compression;
      if (!build || directory !== build.auditDirectory || compression !== build.compression)
        declarationMatches = false;
    }
  }
  if (!declarationMatches)
    failures.push("accepted audit declaration does not match the run manifest");

  await Promise.all([...expected].map(async ([fullPath, { relativePath, expectedHash, verify }]) => {
    try {
      const compressed = await readFile(fullPath);
      const original = await gunzip(compressed);
      const actualHash = digest(original);
      if (actualHash !== expectedHash)
        failures.push(`${relativePath}: expected ${expectedHash}, found ${actualHash}`);
      else if (verify) verify(original);
    } catch (error) {
      failures.push(`${relativePath}: ${error.message}`);
    }
  }));

  for (const record of acceptedRecords) {
    const profile = profiles.get(record.profileId);
    const input = scenarioInput(profile, record.scenario);
    const build = builds.get(record.buildId);
    const scenario = scenarios.get(record.scenario);
    const retained = acceptedRunEvidence.get(record.recordId) || [];
    const identity = build && input
      ? profileIdentities.get(`${build.buildId}\u0000${input.profileFile}`) : null;
    if (!profile || !input || !build || !scenario || retained.length !== (record.runs || []).length) continue;
    if (!identity || retained.some((run) => run.actor !== identity.actor || run.talents !== identity.talents)
      || identity.actor !== input.sourceProfileName) {
      failures.push(`${record.recordId}: accepted report actor or talents do not match the retained profile`);
      continue;
    }
    try {
      const orderedRuns = record.runs.map((run) => retained.find((entry) =>
        entry.parsed.reportId === run.reportId)?.parsed).filter(Boolean);
      const rebuilt = aggregateAcceptedRecord({ profile, profileInput: input, scenario, build,
        policy: simcManifest.acceptancePolicy, profileSha256: input.profileSha256,
        requestedIterationsPerRun: record.requestedIterationsPerRun, runs: orderedRuns });
      if (!isDeepStrictEqual(rebuilt, record))
        failures.push(`${record.recordId}: retained reports do not reconstruct the accepted ledger record`);
    } catch (error) {
      failures.push(`${record.recordId}: retained reports cannot reconstruct the accepted ledger record: ${error.message}`);
    }
  }

  for (const profile of simcManifest.profiles) {
    for (const selectionScenario of profile.selectionEvidence?.scenarios || []) {
      const scenarioKey = `${profile.profileId}\u0000${selectionScenario.scenarioId}`;
      const retained = selectionReportEvidence.get(scenarioKey) || [];
      if (retained.length !== (selectionScenario.candidates || []).length) continue;
      if (new Set(retained.map((entry) => entry.setup)).size !== 1)
        failures.push(`${profile.profileId}/${selectionScenario.scenarioId}: selection candidates do not share one non-talent character and gear setup`);
      for (const entry of retained) {
        const identity = profileIdentities.get(`${entry.candidate.buildId}\u0000${entry.candidate.profileFile}`);
        if (!identity || identity.actor !== entry.actor || identity.actor !== entry.candidate.sourceProfileName
          || identity.talents !== entry.talents)
          failures.push(`${entry.candidate.reportId}: selection report actor or talents do not match the retained candidate profile`);
      }
    }
  }

  if (failures.length)
    throw new Error(`SimC audit artifact validation failed:\n- ${failures.sort().join("\n- ")}`);
  return { profiles: profileCount, reports: reportCount };
}
