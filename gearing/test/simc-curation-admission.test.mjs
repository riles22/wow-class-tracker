import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { gunzipSync } from "node:zlib";
import {
  admitCuration, buildCurationAdmission, normalizeProvenanceDate, parseCli, sha256,
} from "../src/admit-simc-curation.mjs";
import { actorProjectionSha256 } from "../src/simc-profile-projection.mjs";

const clone = (value) => structuredClone(value);
const canonical = (value) => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
    : value;
const digestObject = (value) => sha256(Buffer.from(JSON.stringify(canonical(value))));
const generatorCommit = "a".repeat(40);
const generatorSha256 = "b".repeat(64);
const buildId = "simc-test-abcdef1";
const simcVersion = "1205-01";
const simcRevision = "abcdef1";
const ptrGameBuild = "12.1.0.68914";
const policyId = "test-curation-policy";
const profileSetupFields = [
  "race", "level", "role", "specialization", "profile_source", "party", "ready_type",
  "bugs", "valid_fight_style", "scale_player", "potion_used", "timeofday", "zandalari_loa",
  "vulpera_tricks", "earthen_mineral", "invert_scaling", "reaction_offset", "reaction_max",
  "reaction_mean", "reaction_stddev", "reaction_nu", "world_lag", "world_lag_stddev",
  "brain_lag", "brain_lag_stddev", "potion", "flask", "food", "augmentation",
  "temporary_enchant", "gear",
];
const sourceFilePaths = {
  raidItems: "gearing/data/raid-items.json",
  dungeonItems: "gearing/data/dungeon-items.json",
  tierItems: "gearing/data/tier-items.json",
  catalystRules: "gearing/data/catalyst-rules.json",
  catalystStatAllocations: "gearing/data/catalyst-stat-allocations.json",
  itemEligibilityOverrides: "gearing/data/item-eligibility-overrides.json",
  specDefinitions: "gearing/data/specs.json",
};
const sourceFiles = Object.values(sourceFilePaths).map((value) => value.split("/").at(-1));

function selectionReport({ actor, talents, targets, seed, dps, error }) {
  return {
    version: simcVersion,
    git_revision: simcRevision,
    ptr_enabled: 1,
    sim: {
      options: {
        max_time: 300,
        vary_combat_length: 0.2,
        iterations: 5001,
        threads: 2,
        seed: Number(seed),
        fixed_time: true,
        optimal_raid: 1,
        fight_style: "Patchwerk",
        desired_targets: targets,
        confidence_estimator: 2,
        scaling: { calculate_scale_factors: 0 },
        dbc: { PTR: { wow_version: ptrGameBuild }, version_used: "PTR" },
      },
      players: [{
        name: actor,
        specialization: "Frost Death Knight",
        talents,
        race: "pandaren",
        level: 90,
        role: "attack",
        profile_source: "default",
        gear: { head: { encoded_item:
          "test_helm,id=201,ilevel=334,redirected_base_stats=101,gem_id=999" } },
        collected_data: { dps: { mean: dps, mean_std_dev: error / 2 } },
      }],
    },
  };
}

function reportBytes(value) {
  return Buffer.from(`${JSON.stringify(value)}\n`);
}

function setupDigest(report) {
  const player = report.sim.players[0];
  return digestObject(Object.fromEntries(profileSetupFields.map((field) =>
    [field, player[field] ?? null])));
}

function fixtureProfileBytes({ catalogCandidate, actor, gearPlanSha256 }) {
  const generatorSource = `${"https://github.com/simulationcraft/simc/blob/"}${generatorCommit}`
    + "/profiles/generators/MID2/MID2_Generate_Deathknight.simc";
  return Buffer.from([
    `# Curated same-gear profile: ${policyId}-death-knight-frost-general`,
    `# Upstream actor name: ${catalogCandidate.sourceProfileName}`,
    `# Upstream actor/APL: ${generatorSource}`,
    `# Upstream generator SHA-256: ${generatorSha256}`,
    `# Talent source: ${catalogCandidate.talentSource}`,
    `# Gear plan SHA-256: ${gearPlanSha256}`,
    `deathknight="${actor}"`,
    "source=default",
    "spec=frost",
    "level=90",
    "race=pandaren",
    "role=attack",
    `talents=${catalogCandidate.talents}`,
    "potion=test_potion",
    "# Default action priority list",
    "actions=auto_attack",
    "actions+=/frost_strike",
    "head=test_helm,id=201,ilevel=334,redirected_base_stats=101,gem_id=999",
    "# Gear Summary",
    "# gear_ilvl=334.00",
    "",
  ].join("\n"));
}

function fixture() {
  const candidates = [
    {
      candidateId: "frost-first",
      sourceProfileName: "MID2_Death_Knight_Frost_First",
      generatorFile: "MID2_Generate_Deathknight.simc",
      profileFile: "MID2_Frost_First_Curated.simc",
      talentSourceMode: "official-generator",
      talentSource: "https://example.test/frost/first",
      talentSourceAsOf: "2026-08-04T12:00:00Z",
      talents: "ABC",
    },
    {
      candidateId: "frost-second",
      sourceProfileName: "MID2_Death_Knight_Frost_Second",
      generatorFile: "MID2_Generate_Deathknight.simc",
      profileFile: "MID2_Frost_Second_Curated.simc",
      talentSourceMode: "current-ptr-import",
      talentSource: "https://example.test/frost/second",
      talentSourceAsOf: "2026-08-04T13:00:00Z",
      talents: "DEF",
    },
  ];
  const catalogLogical = {
    profileId: "death-knight-frost-general",
    specKey: "Frost Death Knight",
    guideProfileName: "General",
    curationPolicyId: policyId,
    weaponLoadoutId: "two-hand",
    enhancementSourceCandidateId: "frost-first",
    enhancementPlan: {
      sourceCandidateId: "frost-first",
      generatorFile: "MID2_Generate_Deathknight.simc",
      sourceProfileName: "MID2_Death_Knight_Frost_First",
      generatorSha256,
      slots: { Head: { gem_id: "999" } },
    },
    candidates,
  };
  const catalog = {
    schemaVersion: 1,
    buildId,
    generatorCommit,
    generatorFileSha256: { "MID2_Generate_Deathknight.simc": generatorSha256 },
    reviewedAt: "2026-08-04",
    defaultCurationPolicyId: policyId,
    curationPolicies: [{
      curationPolicyId: policyId,
      itemLevel: 334,
      tierPieces: 4,
      sourceFilePaths,
    }],
    logicalProfiles: [catalogLogical],
  };
  const manifest = {
    schemaVersion: 2,
    manifestId: "midnight-s2-reference-weights",
    activeBuildId: buildId,
    acceptancePolicy: { runsPerRecord: 2 },
    builds: [{
      buildId,
      status: "accepted",
      version: simcVersion,
      revision: simcRevision,
      commit: generatorCommit,
      gameBuild: `${ptrGameBuild} PTR`,
      auditDirectory: "data/simc-audit/abcdef1",
      compression: "gzip",
    }],
    curationPolicies: [],
    scenarios: [
      { scenarioId: "raid-st", fightStyle: "Patchwerk", targets: 1 },
      { scenarioId: "aoe-5t", fightStyle: "Patchwerk", targets: 5 },
    ],
    profiles: [],
    specs: [{
      specKey: "Frost Death Knight",
      class: "Death Knight",
      spec: "Frost",
      role: "DPS",
      primaryStat: "Strength",
      objective: "damage",
      eligibility: "eligible",
      status: "pending",
      reason: "No profile.",
      profileIds: [],
      plannedScenarioIds: ["raid-st", "aoe-5t"],
    }],
    coverage: {},
  };
  const acceptedRecord = {
    recordId: "existing-raid-st",
    status: "accepted",
    buildId,
    profileFile: "Existing.simc",
    runs: [{ reportId: "existing-r1" }, { reportId: "existing-r2" }],
  };
  const weights = {
    schemaVersion: 3,
    methodology: { auditArtifacts: { profiles: 1, reports: 2, selections: 0 } },
    records: [acceptedRecord],
  };
  const gear = {
    policyId,
    itemLevel: 334,
    tierPieces: 4,
    weaponLoadoutId: "two-hand",
    weights: { Crit: 1, Haste: 0.75, Mast: 0.5, Vers: 0.25 },
    redirectedBaseItemIds: ["101"],
    tertiaryRatingsPresent: false,
    items: [{
      slot: "Head",
      id: "201",
      name: "Test Helm",
      redirectedBaseItemId: "101",
      allocation: { Crit: 7000 },
      tertiaries: [],
      tertiaryRatings: {},
      enhancements: { gem_id: "999" },
      enhancementSource: {
        candidateId: candidates[0].candidateId,
        generatorFile: candidates[0].generatorFile,
        sourceProfileName: candidates[0].sourceProfileName,
        generatorSha256,
      },
    }],
  };
  gear.gearPlanSha256 = digestObject(gear);
  catalogLogical.expectedGearPlanSha256 = gear.gearPlanSha256;
  for (const [index, candidate] of candidates.entries()) {
    const actor = `MID2_Curated_Frost_${index + 1}`;
    candidate.actorProjectionSha256 = actorProjectionSha256(fixtureProfileBytes({
      catalogCandidate: candidate, actor, gearPlanSha256: gear.gearPlanSha256,
    }), actor);
  }
  const materialized = candidates.map((candidate, index) => ({
    ...candidate,
    sourceProfileName: `MID2_Curated_Frost_${index + 1}`,
    generatorActorName: candidate.sourceProfileName,
    buildId,
    sourceMode: "curated-same-gear",
    generatorSource: `${"https://github.com/simulationcraft/simc/blob/"}${generatorCommit}`
      + "/profiles/generators/MID2/MID2_Generate_Deathknight.simc",
    generatorSha256,
    curationPolicyId: policyId,
    curationReviewedAt: "2026-08-04",
    gearSetId: `${policyId}-${catalogLogical.profileId}`,
    gearPlanSha256: gear.gearPlanSha256,
    itemDbSource: "local",
    redirectedBaseItemIds: ["101"],
    tertiaryRatingsPresent: false,
    profileSha256: String(index + 1).repeat(64),
    profilePath: `/work/profiles/${candidate.profileFile}`,
  }));
  const selectionReports = new Map();
  const scenarios = [
    { scenarioId: "raid-st", seed: "111", winner: 0, dps: [200, 190] },
    { scenarioId: "aoe-5t", seed: "222", winner: 1, dps: [300, 350] },
  ].map((scenario) => {
    const scenarioCandidates = materialized.map((candidate, index) => {
      const baselineDpsError = 1 + index;
      const reportId = `${catalogLogical.profileId}-${scenario.scenarioId}-${candidate.candidateId}-selection`;
      const report = selectionReport({ actor: candidate.sourceProfileName,
        talents: candidate.talents, targets: scenario.scenarioId === "raid-st" ? 1 : 5,
        seed: scenario.seed, dps: scenario.dps[index], error: baselineDpsError });
      const bytes = reportBytes(report);
      selectionReports.set(reportId, { report, bytes });
      return {
        ...candidate,
        iterations: 5001,
        baselineDps: scenario.dps[index],
        baselineDpsError,
        setupSha256: setupDigest(report),
        resultSha256: sha256(bytes),
        reportId,
        reportPath: `/work/selections/${reportId}.json`,
        seed: scenario.seed,
      };
    });
    assert.equal(new Set(scenarioCandidates.map((candidate) => candidate.setupSha256)).size, 1);
    return {
      scenarioId: scenario.scenarioId,
      seed: scenario.seed,
      setupSha256: scenarioCandidates[0].setupSha256,
      selectedCandidateId: candidates[scenario.winner].candidateId,
      selectedSourceProfileName: materialized[scenario.winner].sourceProfileName,
      candidates: scenarioCandidates,
    };
  });
  const bundle = {
    schemaVersion: 1,
    catalog: "/catalog.json",
    buildId,
    buildRevision: "abcdef1",
    preparedAt: "2026-08-04T20:00:00Z",
    profiles: [{
      ...clone(catalogLogical),
      gear,
      gearSetId: `${policyId}-${catalogLogical.profileId}`,
      canonicalRace: "pandaren",
      scenarios,
    }],
  };
  const gearDataHashes = Object.fromEntries(sourceFiles.map((file, index) =>
    [`data/${file}`, (index + 1).toString(16).repeat(64)]));
  return { catalog, manifest, weights, bundle, gearDataHashes, selectionReports };
}

async function materializeFixture() {
  const temporary = await mkdtemp(join(tmpdir(), "simc-curation-admission-"));
  const gearing = join(temporary, "gearing");
  const dataRoot = join(gearing, "data");
  const bundleRoot = join(gearing, ".simc-work", "batch", "abcdef1");
  const profileRoot = join(bundleRoot, "profiles");
  const selectionRoot = join(bundleRoot, "selections");
  await Promise.all([mkdir(dataRoot, { recursive: true }), mkdir(profileRoot, { recursive: true }),
    mkdir(selectionRoot, { recursive: true })]);
  const data = fixture();
  const catalogPath = join(dataRoot, "simc-curation-catalog.json");
  const manifestPath = join(dataRoot, "simc-run-manifest.json");
  const weightsPath = join(dataRoot, "simc-reference-weights.json");
  const bundlePath = join(bundleRoot, "bundle.json");
  data.bundle.catalog = catalogPath;
  const profileBytes = new Map();
  for (const [index, catalogCandidate] of data.catalog.logicalProfiles[0].candidates.entries()) {
    const actor = `MID2_Curated_Frost_${index + 1}`;
    const bytes = fixtureProfileBytes({ catalogCandidate, actor,
      gearPlanSha256: data.bundle.profiles[0].gear.gearPlanSha256 });
    const path = join(profileRoot, catalogCandidate.profileFile);
    await writeFile(path, bytes);
    profileBytes.set(catalogCandidate.profileFile, bytes);
    for (const scenario of data.bundle.profiles[0].scenarios) {
      const candidate = scenario.candidates[index];
      candidate.profilePath = path;
      candidate.profileSha256 = sha256(bytes);
      const bytesForReport = data.selectionReports.get(candidate.reportId).bytes;
      candidate.reportPath = join(selectionRoot, `${candidate.reportId}.json`);
      candidate.resultSha256 = sha256(bytesForReport);
      await writeFile(candidate.reportPath, bytesForReport);
    }
  }
  await Promise.all(sourceFiles.map((file, index) =>
    writeFile(join(dataRoot, file), `${JSON.stringify({ file, index })}\n`)));
  await Promise.all([
    writeFile(catalogPath, `${JSON.stringify(data.catalog, null, 2)}\n`),
    writeFile(manifestPath, `${JSON.stringify(data.manifest, null, 2)}\n`),
    writeFile(weightsPath, `${JSON.stringify(data.weights, null, 2)}\n`),
    writeFile(bundlePath, `${JSON.stringify(data.bundle, null, 2)}\n`),
  ]);
  return { temporary, data, dataRoot, bundlePath, catalogPath, manifestPath, weightsPath,
    profileBytes };
}

async function persistBundle(context) {
  await writeFile(context.bundlePath, `${JSON.stringify(context.data.bundle, null, 2)}\n`);
}

function correctedFixture() {
  const data = fixture();
  const nextPolicyId = `${policyId}-v2`;
  const catalogLogical = data.catalog.logicalProfiles[0];
  const bundleLogical = data.bundle.profiles[0];
  data.catalog.defaultCurationPolicyId = nextPolicyId;
  data.catalog.curationPolicies[0].curationPolicyId = nextPolicyId;
  catalogLogical.curationPolicyId = nextPolicyId;
  bundleLogical.curationPolicyId = nextPolicyId;
  bundleLogical.gear.policyId = nextPolicyId;
  delete bundleLogical.gear.gearPlanSha256;
  bundleLogical.gear.gearPlanSha256 = digestObject(bundleLogical.gear);
  catalogLogical.expectedGearPlanSha256 = bundleLogical.gear.gearPlanSha256;
  bundleLogical.expectedGearPlanSha256 = bundleLogical.gear.gearPlanSha256;
  bundleLogical.gearSetId = `${nextPolicyId}-${bundleLogical.profileId}`;
  const filenames = new Map();
  for (const candidate of catalogLogical.candidates) {
    candidate.profileFile = candidate.profileFile.replace(/\.simc$/, "_V2.simc");
    filenames.set(candidate.candidateId, candidate.profileFile);
  }
  for (const candidate of bundleLogical.candidates)
    candidate.profileFile = filenames.get(candidate.candidateId);
  for (const scenario of bundleLogical.scenarios) for (const [index, candidate] of
    scenario.candidates.entries()) {
    candidate.curationPolicyId = nextPolicyId;
    candidate.gearSetId = bundleLogical.gearSetId;
    candidate.gearPlanSha256 = bundleLogical.gear.gearPlanSha256;
    candidate.profileFile = filenames.get(candidate.candidateId);
    candidate.profilePath = `/work/profiles/${candidate.profileFile}`;
    candidate.profileSha256 = (index + 7).toString(16).repeat(64);
    candidate.reportId = `${candidate.reportId}-v2`;
    candidate.reportPath = `/work/selections/${candidate.reportId}.json`;
  }
  return data;
}

test("pure admission builder emits ready scenario winners and is idempotent", () => {
  const data = fixture();
  const recordsBefore = clone(data.weights.records);
  const first = buildCurationAdmission({
    bundles: [data.bundle], catalog: data.catalog, manifest: data.manifest,
    weights: data.weights, gearDataHashes: data.gearDataHashes,
  });
  assert.deepEqual(first.weights.records, recordsBefore);
  const profile = first.manifest.profiles[0];
  assert.equal(profile.status, "ready");
  assert.equal(profile.selectionMode, "same-gear-dps");
  assert.equal(profile.scenarioInputs[0].sourceProfileName, "MID2_Curated_Frost_1");
  assert.equal(profile.scenarioInputs[1].sourceProfileName, "MID2_Curated_Frost_2");
  assert.equal(profile.scenarioInputs[0].generatorActorName, "MID2_Death_Knight_Frost_First");
  assert.equal(profile.scenarioInputs[0].talentSourceAsOf, "2026-08-04");
  assert.equal(profile.selectionEvidence.settings.threads, 2);
  assert.equal(profile.selectionEvidence.scenarios[0].candidates.length, 2);
  assert.equal(first.manifest.specs[0].status, "pending");
  assert.deepEqual(first.manifest.specs[0].profileIds, [profile.profileId]);
  assert.match(first.manifest.specs[0].reason, /scale-factor runs/);
  assert.deepEqual(first.manifest.curationPolicies[0].generatorFileSha256,
    data.catalog.generatorFileSha256);
  assert.equal(first.manifest.curationPolicies[0].gearSets[0].gearPlanSha256,
    data.bundle.profiles[0].gear.gearPlanSha256);
  assert.deepEqual(first.weights.methodology.auditArtifacts, {
    profiles: 3,
    reports: 2,
    selections: 4,
    directories: {
      [buildId]: { directory: "data/simc-audit/abcdef1", compression: "gzip" },
    },
  });
  const second = buildCurationAdmission({
    bundles: [data.bundle, clone(data.bundle)], catalog: data.catalog,
    manifest: first.manifest, weights: first.weights, gearDataHashes: data.gearDataHashes,
  });
  assert.deepEqual(second.manifest, first.manifest);
  assert.deepEqual(second.weights, first.weights);
});

test("corrected curated evidence can replace only an unaccepted ready profile", () => {
  const original = fixture();
  const admitted = buildCurationAdmission({ bundles: [original.bundle], catalog: original.catalog,
    manifest: original.manifest, weights: original.weights,
    gearDataHashes: original.gearDataHashes });
  const corrected = correctedFixture();
  const result = buildCurationAdmission({ bundles: [corrected.bundle], catalog: corrected.catalog,
    manifest: admitted.manifest, weights: admitted.weights,
    gearDataHashes: corrected.gearDataHashes });
  const profile = result.manifest.profiles.find((entry) =>
    entry.profileId === corrected.bundle.profiles[0].profileId);
  assert.equal(profile.status, "ready");
  assert.equal(profile.scenarioInputs[0].curationPolicyId, `${policyId}-v2`);
  assert.match(profile.scenarioInputs[0].profileFile, /_V2\.simc$/);
  assert.ok(profile.selectionEvidence.scenarios.every((scenario) =>
    scenario.candidates.every((candidate) => candidate.reportId.endsWith("-v2"))));
  assert.deepEqual(result.manifest.specs[0].profileIds, [profile.profileId]);
});

test("corrected evidence cannot replace accepted, official, or reused artifact identities", () => {
  const original = fixture();
  const admitted = buildCurationAdmission({ bundles: [original.bundle], catalog: original.catalog,
    manifest: original.manifest, weights: original.weights,
    gearDataHashes: original.gearDataHashes });
  const cases = [
    {
      name: "accepted profile",
      expected: /only a ready curated profile/,
      mutate: (manifest) => { manifest.profiles[0].status = "accepted"; },
    },
    {
      name: "accepted record",
      expected: /accepted ledger evidence/,
      mutate: (_manifest, weights) => { weights.records.push({ status: "accepted",
        profileId: original.bundle.profiles[0].profileId,
        profileFile: original.bundle.profiles[0].scenarios[0].candidates[0].profileFile }); },
    },
    {
      name: "official evidence",
      expected: /official or unclassified evidence/,
      mutate: (manifest) => { manifest.profiles[0].scenarioInputs[0].sourceMode = "official-output"; },
    },
    {
      name: "profile filename reuse",
      expected: /profile filenames must be distinct/,
      mutate: (_manifest, _weights, corrected) => {
        const reused = original.bundle.profiles[0].scenarios[0].candidates[0].profileFile;
        corrected.catalog.logicalProfiles[0].candidates[0].profileFile = reused;
        corrected.bundle.profiles[0].candidates[0].profileFile = reused;
        for (const scenario of corrected.bundle.profiles[0].scenarios)
          scenario.candidates[0].profileFile = reused;
      },
    },
    {
      name: "selection report id reuse",
      expected: /selection report ids must be distinct/,
      mutate: (_manifest, _weights, corrected) => {
        const reused = admitted.manifest.profiles[0].selectionEvidence.scenarios[0]
          .candidates[0].reportId;
        const candidate = corrected.bundle.profiles[0].scenarios[0].candidates[0];
        candidate.reportId = reused;
        candidate.reportPath = `/work/selections/${reused}.json`;
      },
    },
    {
      name: "another manifest profile filename",
      expected: /profile filename collides with another retained identity/,
      mutate: (manifest, _weights, corrected) => {
        const profileFile = corrected.bundle.profiles[0].scenarios[0].candidates[0].profileFile;
        manifest.profiles.push({
          profileId: "other-ready-profile",
          status: "ready",
          scenarioInputs: [{ sourceMode: "curated-same-gear", profileFile }],
        });
      },
    },
    {
      name: "accepted ledger report id",
      expected: /report id collides with another retained identity/,
      mutate: (_manifest, weights, corrected) => {
        const reportId = corrected.bundle.profiles[0].scenarios[0].candidates[0].reportId;
        weights.records.push({ status: "accepted", profileId: "other-accepted-profile",
          profileFile: "Other_Accepted.simc", runs: [{ reportId }] });
      },
    },
  ];
  for (const entry of cases) {
    const manifest = clone(admitted.manifest);
    const weights = clone(admitted.weights);
    const corrected = correctedFixture();
    entry.mutate(manifest, weights, corrected);
    assert.throws(() => buildCurationAdmission({ bundles: [corrected.bundle],
      catalog: corrected.catalog, manifest, weights,
      gearDataHashes: corrected.gearDataHashes }), entry.expected, entry.name);
  }
});

test("admission rejects stale generator identity and normalizes only valid dates", () => {
  assert.equal(normalizeProvenanceDate("2026-08-04T12:00:00Z"), "2026-08-04");
  assert.throws(() => normalizeProvenanceDate("this week"), /ISO date or timestamp/);
  const data = fixture();
  data.bundle.profiles[0].scenarios[0].candidates[0].generatorActorName = "wrong";
  assert.throws(() => buildCurationAdmission({
    bundles: [data.bundle], catalog: data.catalog, manifest: data.manifest,
    weights: data.weights, gearDataHashes: data.gearDataHashes,
  }), /generator actor differs/);
  const talents = fixture();
  talents.bundle.profiles[0].scenarios[0].candidates[0].talents = "TAMPERED";
  assert.throws(() => buildCurationAdmission({ bundles: [talents.bundle],
    catalog: talents.catalog, manifest: talents.manifest, weights: talents.weights,
    gearDataHashes: talents.gearDataHashes }), /talents differ from the reviewed catalog/);
  const projection = fixture();
  projection.bundle.profiles[0].scenarios[0].candidates[0].actorProjectionSha256 = "d".repeat(64);
  assert.throws(() => buildCurationAdmission({ bundles: [projection.bundle],
    catalog: projection.catalog, manifest: projection.manifest, weights: projection.weights,
    gearDataHashes: projection.gearDataHashes }), /actor projection differs from the reviewed catalog/);
});

test("CLI accepts repeatable bundle flags", () => {
  assert.deepEqual(parseCli(["admit", "--bundle", "one.json", "--bundle", "two.json",
    "--manifest", "manifest.json"]), {
    command: "admit",
    bundlePaths: ["one.json", "two.json"],
    manifest: "manifest.json",
  });
});

test("filesystem admission verifies, gzips append-only artifacts, and reruns cleanly", async () => {
  const context = await materializeFixture();
  try {
    const first = await admitCuration({ bundlePaths: [context.bundlePath],
      catalogPath: context.catalogPath, manifestPath: context.manifestPath,
      weightsPath: context.weightsPath });
    assert.deepEqual({ admitted: first.admittedProfiles, retained: first.retainedArtifacts,
      verified: first.verifiedArtifacts }, { admitted: 1, retained: 6, verified: 6 });
    for (const [file, bytes] of context.profileBytes) {
      const retained = await readFile(join(context.dataRoot, "simc-audit", "abcdef1", "profiles",
        `${file}.gz`));
      assert.deepEqual(gunzipSync(retained), bytes);
    }
    const admittedManifest = JSON.parse(await readFile(context.manifestPath, "utf8"));
    assert.equal(admittedManifest.profiles[0].status, "ready");
    const second = await admitCuration({ bundlePaths: [context.bundlePath],
      catalogPath: context.catalogPath, manifestPath: context.manifestPath,
      weightsPath: context.weightsPath });
    assert.deepEqual({ admitted: second.admittedProfiles, retained: second.retainedArtifacts,
      verified: second.verifiedArtifacts }, { admitted: 0, retained: 0, verified: 6 });
  } finally {
    await rm(context.temporary, { recursive: true, force: true });
  }
});

async function rewriteCandidateReport(context, mutate) {
  const candidate = context.data.bundle.profiles[0].scenarios[0].candidates[0];
  const report = clone(context.data.selectionReports.get(candidate.reportId).report);
  mutate(report, candidate, context.data.bundle.profiles[0].scenarios[0]);
  const bytes = reportBytes(report);
  candidate.resultSha256 = sha256(bytes);
  await writeFile(candidate.reportPath, bytes);
  await persistBundle(context);
}

async function rewriteCandidateProfile(context, mutate) {
  const scenarios = context.data.bundle.profiles[0].scenarios;
  const profilePath = scenarios[0].candidates[0].profilePath;
  const bytes = Buffer.from(mutate(await readFile(profilePath, "utf8")));
  await writeFile(profilePath, bytes);
  for (const scenario of scenarios) scenario.candidates[0].profileSha256 = sha256(bytes);
  await persistBundle(context);
}

test("filesystem admission rejects report, winner, talent, and gear tampering before retention",
  async (t) => {
    const cases = [
      {
        name: "pinned PTR build",
        expected: /pinned PTR game build/,
        mutate: (context) => rewriteCandidateReport(context, (report) => {
          report.sim.options.dbc.PTR.wow_version = "12.1.0.99999";
        }),
      },
      {
        name: "selection worker settings",
        expected: /iterations or threads differ/,
        mutate: (context) => rewriteCandidateReport(context, (report) => {
          report.sim.options.threads = 3;
        }),
      },
      {
        name: "single player actor",
        expected: /exactly one player/,
        mutate: (context) => rewriteCandidateReport(context, (report) => {
          report.sim.players.push(clone(report.sim.players[0]));
        }),
      },
      {
        name: "actor specialization",
        expected: /actor or specialization differs/,
        mutate: (context) => rewriteCandidateReport(context, (report) => {
          report.sim.players[0].specialization = "Unholy Death Knight";
        }),
      },
      {
        name: "selection seed",
        expected: /seed differs/,
        mutate: (context) => rewriteCandidateReport(context, (report) => {
          report.sim.options.seed += 1;
        }),
      },
      {
        name: "baseline DPS",
        expected: /baseline DPS or error differs/,
        mutate: (context) => rewriteCandidateReport(context, (report) => {
          report.sim.players[0].collected_data.dps.mean += 1;
        }),
      },
      {
        name: "non-talent setup",
        expected: /non-talent setup digest differs/,
        mutate: (context) => rewriteCandidateReport(context, (report) => {
          report.sim.players[0].race = "human";
        }),
      },
      {
        name: "report digest",
        expected: /source artifact SHA-256 differs/,
        mutate: async (context) => {
          const candidate = context.data.bundle.profiles[0].scenarios[0].candidates[0];
          await writeFile(candidate.reportPath, Buffer.concat([
            context.data.selectionReports.get(candidate.reportId).bytes, Buffer.from(" "),
          ]));
        },
      },
      {
        name: "declared winner",
        expected: /not the unique DPS winner/,
        mutate: async (context) => {
          const scenario = context.data.bundle.profiles[0].scenarios[0];
          scenario.selectedCandidateId = scenario.candidates[1].candidateId;
          scenario.selectedSourceProfileName = scenario.candidates[1].sourceProfileName;
          await persistBundle(context);
        },
      },
      {
        name: "selection talents",
        expected: /selection talents differ/,
        mutate: (context) => rewriteCandidateReport(context, (report) => {
          report.sim.players[0].talents = "TAMPERED";
        }),
      },
      {
        name: "profile level",
        expected: /actor\/APL projection differs/,
        mutate: (context) => rewriteCandidateProfile(context,
          (profile) => profile.replace("level=90", "level=91")),
      },
      {
        name: "profile race",
        expected: /actor\/APL projection differs/,
        mutate: (context) => rewriteCandidateProfile(context,
          (profile) => profile.replace("race=pandaren", "race=human")),
      },
      {
        name: "explicit set bonus override",
        expected: /actor\/APL projection differs/,
        mutate: (context) => rewriteCandidateProfile(context,
          (profile) => profile.replace("actions=auto_attack",
            "set_bonus.midnight_season_2_4pc=0\nactions=auto_attack")),
      },
      {
        name: "explicit save output",
        expected: /actor\/APL projection differs/,
        mutate: (context) => rewriteCandidateProfile(context,
          (profile) => `${profile}save=Tampered_Profile.simc\n`),
      },
      {
        name: "profile action list",
        expected: /actor\/APL projection differs/,
        mutate: (context) => rewriteCandidateProfile(context,
          (profile) => profile.replace("actions+=/frost_strike", "actions+=/obliterate")),
      },
      {
        name: "profile enhancements",
        expected: /materialized gear differs/,
        mutate: (context) => rewriteCandidateProfile(context,
          (profile) => profile.replace("gem_id=999", "gem_id=998")),
      },
    ];
    for (const entry of cases) await t.test(entry.name, async () => {
      const context = await materializeFixture();
      try {
        const beforeManifest = await readFile(context.manifestPath, "utf8");
        const beforeWeights = await readFile(context.weightsPath, "utf8");
        await entry.mutate(context);
        await assert.rejects(admitCuration({ bundlePaths: [context.bundlePath],
          catalogPath: context.catalogPath, manifestPath: context.manifestPath,
          weightsPath: context.weightsPath }), entry.expected);
        assert.equal(await readFile(context.manifestPath, "utf8"), beforeManifest);
        assert.equal(await readFile(context.weightsPath, "utf8"), beforeWeights);
        await assert.rejects(access(join(context.dataRoot, "simc-audit", "abcdef1")));
      } finally {
        await rm(context.temporary, { recursive: true, force: true });
      }
    });
  });
