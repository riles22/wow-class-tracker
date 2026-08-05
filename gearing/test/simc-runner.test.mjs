import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { gunzipSync } from "node:zlib";
import {
  aggregateAcceptedRecord,
  checkpointAllowsResume,
  deterministicSeed,
  finalizeManifestAcceptance,
  jobFingerprint,
  makeAppendOnlyReplacement,
  mergeAcceptedRecord,
  parseCli,
  parseSimcReport,
  planManifest,
  promotionApprovalMatches,
  roundHalfEven,
  sha256,
  simcArgumentsForJob,
  validatePromotionCheckpoint,
  verifySimcExecutable,
  withPromotionLock,
} from "../src/run-simc-reference.mjs";
import { verifyCurationSourceFiles } from "../src/validate-curation-sources.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));

async function catalogs() {
  const [manifest, ledger] = await Promise.all([
    json("data/simc-run-manifest.json"),
    json("data/simc-reference-weights.json"),
  ]);
  return { manifest, ledger };
}

async function copyCurationSources(manifest, root) {
  const files = new Set((manifest.curationPolicies || []).flatMap((policy) =>
    Object.keys(policy.gearDataHashes || {})));
  for (const file of files) {
    const target = join(root, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, await readFile(fromRoot(file)));
  }
}

function singleBuildLedger(ledger, record = ledger.records[0]) {
  const copy = structuredClone(ledger);
  copy.records = [structuredClone(record)];
  const buildId = record.buildId;
  const simulator = copy.methodology.simulators?.[buildId] || copy.methodology.simulator;
  const auditLocation = copy.methodology.auditArtifacts.directories?.[buildId]
    || copy.methodology.auditArtifacts;
  copy.methodology.simulator = structuredClone(simulator);
  delete copy.methodology.simulators;
  copy.methodology.auditArtifacts.directory = auditLocation.directory;
  copy.methodology.auditArtifacts.compression = auditLocation.compression;
  delete copy.methodology.auditArtifacts.directories;
  copy.methodology.auditArtifacts.profiles = 1;
  copy.methodology.auditArtifacts.reports = record.runs.length;
  return copy;
}

function expectedAuditCounts(records, manifest) {
  const accepted = records.filter((record) => record.status === "accepted");
  const candidates = manifest.profiles.flatMap((profile) =>
    (profile.selectionEvidence?.scenarios || []).flatMap((scenario) => scenario.candidates || []));
  return {
    profiles: new Set([
      ...accepted.map((record) => `${record.buildId}\0${record.profileFile}`),
      ...candidates.map((candidate) => `${candidate.buildId}\0${candidate.profileFile}`),
    ]).size,
    reports: accepted.reduce((sum, record) => sum + (record.runs || []).length, 0),
    selections: new Set(candidates.map((candidate) =>
      `${candidate.buildId}\0${candidate.reportId}`)).size,
  };
}

test("plan accounts for all 40 specs and only exposes reviewed runnable profiles", async () => {
  const { manifest, ledger } = await catalogs();
  const plan = planManifest(manifest, ledger);
  assert.equal(plan.specs.length, 40);
  assert.deepEqual(plan.summary, plan.specs.reduce((summary, spec) => ({
    accepted: summary.accepted + spec.acceptedJobs,
    runnable: summary.runnable + spec.runnableJobs,
    blocked: summary.blocked + spec.blockedJobs,
  }), { accepted: 0, runnable: 0, blocked: 0 }));
  const reviewedJobCount = manifest.profiles.filter((profile) =>
    ["accepted", "ready"].includes(profile.status)).reduce((sum, profile) =>
    sum + profile.scenarioIds.length, 0);
  assert.equal(plan.summary.accepted + plan.summary.runnable, reviewedJobCount);
  const profiles = new Map(manifest.profiles.map((profile) => [profile.profileId, profile]));
  assert.ok(plan.jobs.filter((job) => job.state === "runnable")
    .every((job) => profiles.get(job.profileId)?.status === "ready"));
  assert.equal(plan.specs.find((spec) => spec.specKey === "Shadow Priest").acceptedJobs, 4);
  assert.equal(plan.specs.find((spec) => spec.specKey === "Destruction Warlock").acceptedJobs, 2);
  assert.equal(plan.specs.find((spec) => spec.specKey === "Augmentation Evoker").jobs.length, 0);
});

test("plan fails closed when a curated gear source changes by one byte", async (t) => {
  const { manifest, ledger } = await catalogs();
  const root = await mkdtemp(join(tmpdir(), "simc-curation-sources-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await copyCurationSources(manifest, root);

  assert.doesNotThrow(() => planManifest(manifest, ledger, { gearingRoot: root }));
  const declared = "data/raid-items.json";
  const path = join(root, declared);
  await writeFile(path, Buffer.concat([await readFile(path), Buffer.from(" ")]));
  assert.throws(() => planManifest(manifest, ledger, { gearingRoot: root }),
    /curation source hash mismatch for data\/raid-items\.json/);

  await rm(path);
  assert.throws(() => planManifest(manifest, ledger, { gearingRoot: root }),
    /curation source is missing or unreadable: data\/raid-items\.json/);

  await writeFile(path, await readFile(fromRoot(declared)));
  const unsafe = structuredClone(manifest);
  unsafe.curationPolicies[0].gearDataHashes["data/../raid-items.json"] = "a".repeat(64);
  assert.throws(() => planManifest(unsafe, ledger, { gearingRoot: root }),
    /unapproved curation source path/);
  assert.deepEqual(verifyCurationSourceFiles({ curationPolicies: [] }, root),
    { policies: 0, files: 0 });
});

test("plan accepts only records bound to the current resolved scenario provenance", async () => {
  const { manifest, ledger } = await catalogs();
  const profileId = "warlock-destruction-general";
  const scenarioId = "raid-st";
  const plannedJob = (candidate, evidence = ledger) => planManifest(candidate, evidence).jobs.find((job) =>
    job.profileId === profileId && job.scenarioId === scenarioId);
  assert.equal(plannedJob(manifest).state, "accepted");

  const mutations = [
    ["build", (copy, profile) => {
      profile.scenarioInputs[0].buildId = copy.builds.find((build) =>
        build.buildId !== profile.scenarioInputs[0].buildId).buildId;
    }],
    ["profile file", (_copy, profile) => {
      profile.scenarioInputs[0].profileFile = "MID2_Warlock_Destruction_Changed.simc";
    }],
    ["profile hash", (_copy, profile) => {
      profile.scenarioInputs[0].profileSha256 = "c".repeat(64);
    }],
    ["source actor", (_copy, profile) => {
      profile.scenarioInputs[0].sourceProfileName = "MID2_Warlock_Destruction_Changed";
    }],
    ["generator and talent source", (_copy, profile) => {
      profile.scenarioInputs[0].generatorSource = "https://example.com/changed.simc";
      profile.scenarioInputs[0].talentSource = "https://example.com/changed.simc";
    }],
    ["redirected base items", (_copy, profile) => {
      profile.scenarioInputs[0].redirectedBaseItemIds = ["239031"];
    }],
    ["tertiary ratings", (_copy, profile) => {
      profile.scenarioInputs[0].tertiaryRatingsPresent = false;
    }],
    ["item database", (_copy, profile) => {
      profile.scenarioInputs[0].itemDbSource = "ptrhead";
    }],
    ["logical profile", (_copy, profile) => { profile.name = "Changed logical profile"; }],
    ["scenario targets", (copy) => {
      copy.scenarios.find((scenario) => scenario.scenarioId === scenarioId).targets = 2;
    }],
    ["scenario fight style", (copy) => {
      copy.scenarios.find((scenario) => scenario.scenarioId === scenarioId).fightStyle = "HecticAddCleave";
    }],
    ["requested iterations", (copy) => { copy.acceptancePolicy.requestedIterationsPerRun = 26000; }],
    ["runs per record", (copy) => { copy.acceptancePolicy.runsPerRecord = 3; }],
    ["normalization", (copy) => { copy.acceptancePolicy.normalizeToPrimaryStat = false; }],
    ["secondary stat set", (copy) => { copy.acceptancePolicy.secondaryStats = ["Crit", "Haste", "Mast"]; }],
    ["maximum drift", (copy) => { copy.acceptancePolicy.maximumRelativeDrift = 0.04; }],
    ["simulator version", (copy, profile) => {
      copy.builds.find((build) => build.buildId === profile.scenarioInputs[0].buildId).version = "changed";
    }],
    ["simulator artifact", (copy, profile) => {
      copy.builds.find((build) => build.buildId === profile.scenarioInputs[0].buildId)
        .artifactSha256 = "a".repeat(64);
    }],
    ["simulator executable", (copy, profile) => {
      copy.builds.find((build) => build.buildId === profile.scenarioInputs[0].buildId)
        .simcExeSha256 = "b".repeat(64);
    }],
  ];
  for (const [label, mutate] of mutations) {
    const copy = structuredClone(manifest);
    const profile = copy.profiles.find((entry) => entry.profileId === profileId);
    mutate(copy, profile);
    assert.equal(plannedJob(copy).state, "runnable", label);
  }

  for (const [label, mutate] of [
    ["stable record id", (record) => { record.recordId += "-changed"; }],
    ["accepted run shape", (record) => { record.runs.pop(); }],
    ["source mode", (record) => { record.sourceMode = "curated-same-gear"; }],
    ["redirected base items", (record) => { record.redirectedBaseItemIds = ["239031"]; }],
    ["tertiary ratings", (record) => { record.tertiaryRatingsPresent = false; }],
  ]) {
    const changedLedger = structuredClone(ledger);
    const record = changedLedger.records.find((entry) =>
      entry.profileId === profileId && entry.scenario === scenarioId);
    mutate(record);
    assert.equal(plannedJob(manifest, changedLedger).state, "runnable", label);
  }

  const ready = structuredClone(manifest);
  ready.profiles.find((profile) => profile.profileId === profileId).status = "ready";
  ready.acceptancePolicy.requestedIterationsPerRun = 26000;
  assert.equal(plannedJob(ready).state, "runnable");

  const resampledLedger = structuredClone(ledger);
  const resampled = resampledLedger.records.find((record) =>
    record.profileId === profileId && record.scenario === scenarioId);
  resampled.requestedIterationsPerRun = manifest.acceptancePolicy.requestedIterationsPerRun + 25000;
  for (const run of resampled.runs)
    run.iterations = resampled.requestedIterationsPerRun;
  assert.equal(plannedJob(manifest, resampledLedger).state, "accepted");
  resampled.runs[0].iterations--;
  assert.equal(plannedJob(manifest, resampledLedger).state, "runnable");

  const blocked = structuredClone(manifest);
  const blockedProfile = blocked.profiles.find((profile) => profile.profileId === profileId);
  blockedProfile.status = "rejected";
  blockedProfile.scenarioInputs[0].profileSha256 = "d".repeat(64);
  assert.equal(plannedJob(blocked).state, "blocked");

  assert.ok(manifest.profiles.every((profile) => Array.isArray(profile.scenarioInputs)));
});

test("job seeds are deterministic, distinct, and exactly representable", () => {
  const values = [1, 2].map((run) => deterministicSeed("mage-frost-spellslinger::raid-st", run));
  assert.equal(values[0], deterministicSeed("mage-frost-spellslinger::raid-st", 1));
  assert.notEqual(values[0], values[1]);
  for (const value of values) {
    assert.match(value, /^\d+$/);
    assert.ok(BigInt(value) > 0n);
    assert.ok(BigInt(value) <= BigInt(Number.MAX_SAFE_INTEGER));
  }
});

test("resume requires both the current job fingerprint and checkpointed report bytes", () => {
  const report = Buffer.from('{"sim":"same inputs"}\n');
  const checkpoint = {
    fingerprint: "current-job",
    runs: [{ reportId: "profile-st_r1", resultSha256: sha256(report) }],
  };
  assert.equal(checkpointAllowsResume(checkpoint, "current-job", "profile-st_r1", report), true);
  assert.equal(checkpointAllowsResume(checkpoint, "changed-profile", "profile-st_r1", report), false);
  assert.equal(checkpointAllowsResume(checkpoint, "current-job", "profile-st_r1",
    Buffer.from('{"sim":"changed bytes"}\n')), false);
  assert.equal(checkpointAllowsResume(checkpoint, "current-job", "profile-st_r2", report), false);
});

test("promotion requires a complete checkpoint bound to the pinned executable and profile", async () => {
  const { manifest, ledger } = await catalogs();
  const job = planManifest(manifest, ledger).jobs.find((candidate) => candidate.profileId);
  const threads = 12;
  const fingerprint = jobFingerprint(manifest, job, job.build.simcExeSha256,
    job.profile.profileSha256, threads);
  const checkpoint = {
    schemaVersion: 1,
    fingerprint,
    executableSha256: job.build.simcExeSha256,
    profileSha256: job.profile.profileSha256,
    threads,
    runs: [1, 2].map((runNumber) => ({
      reportId: `${job.recordId}_r${runNumber}`,
      seed: deterministicSeed(job.jobId, runNumber),
      resultSha256: String(runNumber).repeat(64),
    })),
  };
  assert.deepEqual(validatePromotionCheckpoint(checkpoint, manifest, job,
    job.profile.profileSha256), { fingerprint, threads });
  assert.throws(() => validatePromotionCheckpoint({ ...checkpoint, runs: checkpoint.runs.slice(0, 1) },
    manifest, job, job.profile.profileSha256), /complete distinct run set/);
  assert.throws(() => validatePromotionCheckpoint(checkpoint, manifest, job, "a".repeat(64)),
    /current manifest job/);

  const requestedIterationsPerRun = manifest.acceptancePolicy.requestedIterationsPerRun + 25000;
  const overrideFingerprint = jobFingerprint(manifest, job, job.build.simcExeSha256,
    job.profile.profileSha256, threads, requestedIterationsPerRun);
  const overrideCheckpoint = { ...checkpoint, fingerprint: overrideFingerprint,
    requestedIterationsPerRun };
  assert.deepEqual(validatePromotionCheckpoint(overrideCheckpoint, manifest, job,
    job.profile.profileSha256), { fingerprint: overrideFingerprint, threads,
    requestedIterationsPerRun });
  assert.throws(() => validatePromotionCheckpoint({ ...overrideCheckpoint,
    requestedIterationsPerRun: requestedIterationsPerRun + 1 }, manifest, job,
  job.profile.profileSha256), /current manifest job/);
  assert.throws(() => validatePromotionCheckpoint({ ...checkpoint,
    requestedIterationsPerRun: manifest.acceptancePolicy.requestedIterationsPerRun }, manifest, job,
  job.profile.profileSha256), /invalid requested iteration override/);
});

test("forced record replacement uses append-only content-addressed report ids", () => {
  const bytes = [Buffer.from("first report\n"), Buffer.from("second report\n")];
  const candidate = {
    recordId: "mage-frost-test-raid-st",
    profileId: "mage-frost-test",
    scenario: "raid-st",
    status: "accepted",
    runs: bytes.map((contents, index) => ({
      reportId: `mage-frost-test-raid-st_r${index + 1}`,
      resultSha256: sha256(contents),
    })),
  };
  const existing = structuredClone(candidate);
  existing.simulatedAt = "2026-08-01T00:00:00Z";
  const evidence = { record: candidate,
    reportArtifacts: bytes.map((contents, index) => ({ reportId: candidate.runs[index].reportId,
      bytes: contents })) };
  const retained = makeAppendOnlyReplacement({ records: [existing] }, evidence, { force: true });
  assert.notEqual(retained, evidence);
  assert.deepEqual(evidence.record.runs.map((run) => run.reportId),
    ["mage-frost-test-raid-st_r1", "mage-frost-test-raid-st_r2"]);
  for (let index = 0; index < retained.record.runs.length; index++) {
    assert.equal(retained.record.runs[index].reportId,
      `mage-frost-test-raid-st_r${index + 1}_${sha256(bytes[index])}`);
    assert.equal(retained.reportArtifacts[index].reportId, retained.record.runs[index].reportId);
  }
  const recovered = makeAppendOnlyReplacement({ records: [retained.record] }, evidence);
  assert.deepEqual(recovered.record, retained.record,
    "retrying identical bytes reuses the prior append-only ids without requiring force");
});

test("explicit promotion approval is bound to the exact staged record", () => {
  const job = { jobId: "mage-frost-test::raid-st" };
  const evidence = { record: { recordId: "mage-frost-test-raid-st", runs: [{ resultSha256: "a".repeat(64) }] } };
  const approval = { schemaVersion: 1, jobId: job.jobId, record: structuredClone(evidence.record) };
  assert.equal(promotionApprovalMatches(approval, job, evidence), true);
  approval.record.runs[0].resultSha256 = "b".repeat(64);
  assert.equal(promotionApprovalMatches(approval, job, evidence), false);
});

test("promotion lock covers every shared mutable target and releases after completion", async () => {
  const directory = await mkdtemp(join(tmpdir(), "simc-runner-lock-"));
  const manifestPath = join(directory, "manifest.json");
  const weightsAPath = join(directory, "weights-a.json");
  const weightsBPath = join(directory, "weights-b.json");
  let release;
  let entered;
  const started = new Promise((resolve) => { entered = resolve; });
  const held = withPromotionLock([manifestPath, weightsAPath], async () => {
    entered();
    await new Promise((resolve) => { release = resolve; });
  });
  try {
    await started;
    await assert.rejects(withPromotionLock([manifestPath, weightsBPath], async () => {}),
      /promotion lock already exists/);
    release();
    await held;
    await withPromotionLock([manifestPath, weightsBPath], async () => {});
  } finally {
    release?.();
    await held.catch(() => {});
    await rm(directory, { recursive: true, force: true });
  }
});

test("executable verification is pinned to the manifest platform and architecture", async () => {
  const { manifest } = await catalogs();
  const active = manifest.builds.find((build) => build.buildId === manifest.activeBuildId);
  assert.equal(active.platform, process.platform);
  assert.equal(active.arch, process.arch);
  const otherPlatform = process.platform === "win32" ? "linux" : "win32";
  await assert.rejects(verifySimcExecutable("definitely-missing-simc", {
    buildId: "foreign-build", platform: otherPlatform, arch: process.arch,
    simcExeSha256: "0".repeat(64),
  }), /is pinned for/);
});

test("published coefficients use reviewed round-half-even behavior", () => {
  assert.equal(roundHalfEven(0.6289485, 6), 0.628948);
  assert.equal(roundHalfEven(0.4844015, 6), 0.484402);
});

test("runner arguments normalize against the selected spec's primary stat", () => {
  const seed = deterministicSeed("warrior-arms-colossus::aoe-5t", 1);
  const args = simcArgumentsForJob({
    profilePath: "C:\\profiles\\MID2_Warrior_Arms.simc",
    profile: { primaryStat: "Strength" },
    profileInput: { itemDbSource: "local" },
    scenario: { fightStyle: "Patchwerk", targets: 5 },
    policy: { requestedIterationsPerRun: 25000 },
  }, "C:\\reports\\arms.json", seed, 6);
  assert.deepEqual(args.slice(0, 3), ["ptr=1", "item_db_source=local",
    "C:\\profiles\\MID2_Warrior_Arms.simc"]);
  assert.ok(args.includes("scale_only=strength,crit,haste,mastery,versatility"));
  assert.ok(args.includes("desired_targets=5"));
  assert.ok(args.includes(`seed=${seed}`));
  assert.ok(args.includes("threads=6"));
  assert.ok(args.includes("iterations=25000"));
  assert.ok(simcArgumentsForJob({
    profilePath: "C:\\profiles\\MID2_Warrior_Arms.simc",
    profile: { primaryStat: "Strength" }, profileInput: {},
    scenario: { fightStyle: "Patchwerk", targets: 5 },
    policy: { requestedIterationsPerRun: 25000 },
  }, "C:\\reports\\arms.json", seed, 6, 50000).includes("iterations=50000"));
});

test("default job fingerprints remain byte-compatible while iteration overrides are bound", async () => {
  const { manifest, ledger } = await catalogs();
  const job = planManifest(manifest, ledger).jobs.find((candidate) => candidate.profileId);
  const executableHash = job.build.simcExeSha256;
  const profileHash = job.profileInput.profileSha256;
  const threads = 8;
  const legacyInput = { manifestId: manifest.manifestId, build: job.build,
    profile: job.profile, profileInput: job.profileInput, scenario: job.scenario,
    curationPolicy: job.curationPolicy, policy: manifest.acceptancePolicy,
    executableHash, profileHash, threads };
  const legacyFingerprint = sha256(Buffer.from(JSON.stringify(legacyInput)));
  assert.equal(jobFingerprint(manifest, job, executableHash, profileHash, threads),
    legacyFingerprint);
  assert.equal(jobFingerprint(manifest, job, executableHash, profileHash, threads,
    manifest.acceptancePolicy.requestedIterationsPerRun), legacyFingerprint);

  const requestedIterationsPerRun = manifest.acceptancePolicy.requestedIterationsPerRun + 25000;
  const overrideFingerprint = jobFingerprint(manifest, job, executableHash, profileHash, threads,
    requestedIterationsPerRun);
  assert.equal(overrideFingerprint, sha256(Buffer.from(JSON.stringify({ ...legacyInput,
    requestedIterationsPerRun }))));
  assert.notEqual(overrideFingerprint, legacyFingerprint);
  assert.throws(() => jobFingerprint(manifest, job, executableHash, profileHash, threads,
    manifest.acceptancePolicy.requestedIterationsPerRun - 1), /below the manifest minimum/);
});

test("accepted-record aggregation publishes only a higher iteration override", async () => {
  const { manifest, ledger } = await catalogs();
  const expected = ledger.records.find((record) => record.status === "accepted");
  const job = planManifest(manifest, ledger).jobs.find((candidate) =>
    candidate.recordId === expected.recordId);
  const minimum = manifest.acceptancePolicy.requestedIterationsPerRun;
  const legacy = aggregateAcceptedRecord({ profile: job.profile, profileInput: job.profileInput,
    scenario: job.scenario, build: job.build, policy: manifest.acceptancePolicy,
    profileSha256: job.profileInput.profileSha256,
    requestedIterationsPerRun: minimum, runs: structuredClone(expected.runs) });
  assert.equal(legacy.requestedIterationsPerRun, undefined);

  const requestedIterationsPerRun = minimum + 25000;
  const runs = structuredClone(expected.runs);
  for (const run of runs)
    run.iterations = requestedIterationsPerRun + (run.iterations - minimum);
  const resampled = aggregateAcceptedRecord({ profile: job.profile, profileInput: job.profileInput,
    scenario: job.scenario, build: job.build, policy: manifest.acceptancePolicy,
    profileSha256: job.profileInput.profileSha256, requestedIterationsPerRun, runs });
  assert.equal(resampled.requestedIterationsPerRun, requestedIterationsPerRun);
  const invalidRuns = structuredClone(runs);
  invalidRuns[0].iterations = requestedIterationsPerRun - 1;
  assert.throws(() => aggregateAcceptedRecord({ profile: job.profile, profileInput: job.profileInput,
    scenario: job.scenario, build: job.build, policy: manifest.acceptancePolicy,
    profileSha256: job.profileInput.profileSha256,
    requestedIterationsPerRun, runs: invalidRuns }),
  /requested iteration range/);
});

test("scenario inputs bind one logical profile to independently pinned source builds", async () => {
  const { manifest, ledger } = await catalogs();
  const staged = structuredClone(manifest);
  const stagedLedger = structuredClone(ledger);
  stagedLedger.records = stagedLedger.records.filter((record) =>
    record.profileId !== "warlock-destruction-general");
  const originalBuild = staged.builds[0];
  const newerBuild = { ...structuredClone(originalBuild), buildId: "simc-mid2-next",
    revision: "abcdef1", commit: "abcdef1234567890abcdef1234567890abcdef12",
    simcExeSha256: "f".repeat(64), auditDirectory: "data/simc-audit/abcdef1" };
  staged.builds.push(newerBuild);

  const logical = staged.profiles.find((profile) =>
    profile.profileId === "warlock-destruction-general");
  logical.status = "ready";
  logical.scenarioInputs = [
    {
      scenarioId: "raid-st",
      buildId: originalBuild.buildId,
      sourceProfileName: "Hellcaller",
      sourceMode: "official-output",
      generatorSource: "https://github.com/simulationcraft/simc/blob/229259b/profiles/generators/MID2/MID2_Generate_Warlock.simc",
      talentSource: "https://github.com/simulationcraft/simc/blob/229259b/profiles/generators/MID2/MID2_Generate_Warlock.simc",
      profileFile: "MID2_Warlock_Destruction.simc",
      profileSha256: "a".repeat(64),
      redirectedBaseItemIds: [],
      tertiaryRatingsPresent: false,
      itemDbSource: "ptrhead",
    },
    {
      scenarioId: "aoe-5t",
      buildId: newerBuild.buildId,
      sourceProfileName: "Diabolist",
      sourceMode: "official-output",
      generatorSource: "https://github.com/simulationcraft/simc/blob/abcdef1/profiles/generators/MID2/MID2_Generate_Warlock.simc",
      talentSource: "https://github.com/simulationcraft/simc/blob/abcdef1/profiles/generators/MID2/MID2_Generate_Warlock.simc",
      profileFile: "MID2_Warlock_Destruction_Diabolist.simc",
      profileSha256: "b".repeat(64),
      redirectedBaseItemIds: [],
      tertiaryRatingsPresent: false,
      itemDbSource: "ptrhead",
    },
  ];

  const jobs = planManifest(staged, stagedLedger).jobs.filter((job) => job.profileId === logical.profileId);
  assert.equal(jobs.length, 2);
  assert.deepEqual(jobs.map((job) => [job.scenarioId, job.build.buildId,
    job.profileInput.sourceProfileName, job.profileInput.profileFile]), [
    ["raid-st", originalBuild.buildId, "Hellcaller", "MID2_Warlock_Destruction.simc"],
    ["aoe-5t", newerBuild.buildId, "Diabolist", "MID2_Warlock_Destruction_Diabolist.simc"],
  ]);
  assert.ok(jobs.every((job) => job.profile.name === "General" && job.state === "runnable"));

  const aoe = jobs.find((job) => job.scenarioId === "aoe-5t");
  const fingerprint = jobFingerprint(staged, aoe, aoe.build.simcExeSha256,
    aoe.profileInput.profileSha256, 8);
  const changedInput = structuredClone(aoe);
  changedInput.profileInput.sourceProfileName = "Changed actor";
  assert.notEqual(jobFingerprint(staged, changedInput, changedInput.build.simcExeSha256,
    changedInput.profileInput.profileSha256, 8), fingerprint);
  const changedMapping = structuredClone(aoe);
  changedMapping.profile.scenarioInputs[0].profileSha256 = "c".repeat(64);
  assert.notEqual(jobFingerprint(staged, changedMapping, changedMapping.build.simcExeSha256,
    changedMapping.profileInput.profileSha256, 8), fingerprint);

  const record = aggregateAcceptedRecord({ profile: aoe.profile, profileInput: aoe.profileInput,
    scenario: aoe.scenario, build: aoe.build, policy: staged.acceptancePolicy,
    profileSha256: aoe.profileInput.profileSha256, runs: structuredClone(ledger.records[0].runs) });
  assert.equal(record.profile, "General");
  assert.equal(record.sourceProfileName, "Diabolist");
  assert.equal(record.buildId, newerBuild.buildId);
  assert.equal(record.sourceMode, "official-output");
  assert.equal(record.generatorSource, aoe.profileInput.generatorSource);
  assert.equal(record.talentSource, aoe.profileInput.talentSource);
  assert.equal(record.profileFile, aoe.profileInput.profileFile);
  assert.equal(record.profileSha256, aoe.profileInput.profileSha256);
  assert.equal(record.itemDbSource, "ptrhead");
  assert.deepEqual(record.redirectedBaseItemIds, []);
  assert.equal(record.tertiaryRatingsPresent, false);
});

test("retained reports reproduce every accepted v3 record", async () => {
  const { manifest, ledger } = await catalogs();
  const builds = new Map(manifest.builds.map((build) => [build.buildId, build]));
  const profiles = new Map(manifest.profiles.map((profile) => [profile.profileId, profile]));
  const scenarios = new Map(manifest.scenarios.map((scenario) => [scenario.scenarioId, scenario]));
  for (const expectedRecord of ledger.records.filter((record) => record.status === "accepted")) {
    const build = builds.get(expectedRecord.buildId);
    const profile = profiles.get(expectedRecord.profileId);
    const scenario = scenarios.get(expectedRecord.scenario);
    const profileInput = profile?.scenarioInputs?.find((input) => input.scenarioId === expectedRecord.scenario);
    assert.ok(build && profile && scenario && profileInput, expectedRecord.recordId);
    const runs = [];
    for (const expectedRun of expectedRecord.runs) {
      const compressed = await readFile(fromRoot(
        `${build.auditDirectory}/reports/${expectedRun.reportId}.json.gz`));
      const parsed = parseSimcReport(compressed, {
        reportId: expectedRun.reportId,
        seed: expectedRun.seed,
        build,
        profile,
        scenario,
        policy: manifest.acceptancePolicy,
        requestedIterationsPerRun: expectedRecord.requestedIterationsPerRun,
      });
      assert.deepEqual(parsed, expectedRun);
      runs.push(parsed);
    }
    const compressedProfile = await readFile(fromRoot(
      `${build.auditDirectory}/profiles/${profileInput.profileFile}.gz`));
    const rebuilt = aggregateAcceptedRecord({ profile, profileInput, scenario, build,
      policy: manifest.acceptancePolicy, profileSha256: sha256(gunzipSync(compressedProfile)),
      requestedIterationsPerRun: expectedRecord.requestedIterationsPerRun, runs });
    assert.deepEqual(rebuilt, expectedRecord);
  }
});

test("stable-id merge cannot overwrite accepted evidence without force", async () => {
  const { manifest, ledger } = await catalogs();
  const syntheticLedger = singleBuildLedger(ledger);
  const before = structuredClone(syntheticLedger);
  const original = syntheticLedger.records[0];
  assert.deepEqual(mergeAcceptedRecord(syntheticLedger, structuredClone(original),
    { manifest }).records[0], original);
  const replacement = structuredClone(original);
  replacement.simulatedAt = "2026-08-04T00:00:00Z";
  assert.throws(() => mergeAcceptedRecord(syntheticLedger, replacement, { manifest }), /already accepted/);
  assert.equal(mergeAcceptedRecord(syntheticLedger, replacement,
    { force: true, manifest }).records[0].simulatedAt,
    "2026-08-04T00:00:00Z");
  assert.deepEqual(syntheticLedger, before, "pure merge must not mutate the input ledger");
});

test("idempotent promotion still reconciles newly admitted selection provenance", async () => {
  const { manifest, ledger } = await catalogs();
  const legacyLedger = singleBuildLedger(ledger);
  delete legacyLedger.methodology.auditArtifacts.selections;
  const record = structuredClone(legacyLedger.records[0]);
  const merged = mergeAcceptedRecord(legacyLedger, record, { manifest });
  const selectionBuildId = manifest.profiles.find((profile) => profile.selectionEvidence)
    .selectionEvidence.scenarios[0].candidates[0].buildId;
  const expected = expectedAuditCounts(merged.records, manifest);

  assert.deepEqual(Object.keys(merged.methodology.simulators),
    [record.buildId, selectionBuildId].sort());
  assert.equal(merged.methodology.auditArtifacts.profiles, expected.profiles);
  assert.equal(merged.methodology.auditArtifacts.profiles - legacyLedger.methodology.auditArtifacts.profiles,
    expected.profiles - legacyLedger.methodology.auditArtifacts.profiles);
  assert.equal(merged.methodology.auditArtifacts.selections, expected.selections);
  assert.equal(legacyLedger.methodology.auditArtifacts.selections, undefined);
});

test("cross-build promotion includes selection-only builds and artifact counts in methodology", async () => {
  const { manifest, ledger } = await catalogs();
  const legacyLedger = singleBuildLedger(ledger);
  const staged = structuredClone(manifest);
  const newerBuild = { ...structuredClone(staged.builds[0]), buildId: "simc-mid2-next",
    revision: "abcdef1", commit: "abcdef1234567890abcdef1234567890abcdef12",
    artifactSource: "https://github.com/simulationcraft/simc-publish/actions/runs/999999",
    artifactSha256: "e".repeat(64), simcExeSha256: "f".repeat(64),
    auditDirectory: "data/simc-audit/abcdef1" };
  staged.builds.push(newerBuild);
  const record = { ...structuredClone(legacyLedger.records[0]),
    recordId: "mage-frost-synthetic-raid-st",
    profileId: "mage-frost-synthetic",
    buildId: newerBuild.buildId,
    specKey: "Frost Mage",
    profile: "Synthetic Frost",
    profileFile: "MID2_Mage_Frost_Synthetic.simc",
    profileSha256: "a".repeat(64),
    simcRevision: newerBuild.revision };
  const merged = mergeAcceptedRecord(legacyLedger, record, { manifest: staged });
  const selectionBuildId = staged.profiles.find((profile) => profile.selectionEvidence)
    .selectionEvidence.scenarios[0].candidates[0].buildId;
  const expectedBuildIds = [manifest.builds[0].buildId, selectionBuildId, newerBuild.buildId].sort();
  const expected = expectedAuditCounts(merged.records, staged);

  assert.equal(merged.methodology.simulator, undefined);
  assert.deepEqual(Object.keys(merged.methodology.simulators), expectedBuildIds);
  assert.deepEqual(merged.methodology.simulators[newerBuild.buildId], {
    version: newerBuild.version,
    revision: newerBuild.revision,
    commit: newerBuild.commit,
    gameBuild: newerBuild.gameBuild,
    platform: newerBuild.platform,
    arch: newerBuild.arch,
    artifactSource: newerBuild.artifactSource,
    artifactSha256: newerBuild.artifactSha256,
    simcExeSha256: newerBuild.simcExeSha256,
  });
  assert.equal(merged.methodology.auditArtifacts.directory, undefined);
  assert.equal(merged.methodology.auditArtifacts.compression, undefined);
  assert.deepEqual(merged.methodology.auditArtifacts.directories[newerBuild.buildId], {
    directory: newerBuild.auditDirectory,
    compression: newerBuild.compression,
  });
  assert.deepEqual(merged.methodology.auditArtifacts.directories[selectionBuildId], {
    directory: staged.builds.find((build) => build.buildId === selectionBuildId).auditDirectory,
    compression: staged.builds.find((build) => build.buildId === selectionBuildId).compression,
  });
  assert.equal(merged.methodology.auditArtifacts.profiles, expected.profiles);
  assert.equal(merged.methodology.auditArtifacts.profiles - legacyLedger.methodology.auditArtifacts.profiles,
    expected.profiles - legacyLedger.methodology.auditArtifacts.profiles);
  assert.equal(merged.methodology.auditArtifacts.reports, expected.reports);
  assert.equal(merged.methodology.auditArtifacts.reports - legacyLedger.methodology.auditArtifacts.reports,
    record.runs.length);
  assert.equal(merged.methodology.auditArtifacts.selections, expected.selections);
  assert.equal(merged.methodology.auditArtifacts.note, legacyLedger.methodology.auditArtifacts.note);
  assert.equal(legacyLedger.methodology.simulators, undefined,
    "pure merge must not mutate legacy methodology");
});

test("ready profiles are runnable but publish only as a complete scenario matrix", async () => {
  const { manifest, ledger } = await catalogs();
  const stagedManifest = structuredClone(manifest);
  const baselineCoverage = structuredClone(manifest.coverage);
  const frostProfile = { ...structuredClone(stagedManifest.profiles[0]),
    profileId: "mage-frost-test", specKey: "Frost Mage", name: "Reviewed Frost test",
    status: "ready", primaryStat: "Intellect" };
  const fireProfile = { ...structuredClone(frostProfile), profileId: "mage-fire-test",
    specKey: "Fire Mage", name: "Reviewed Fire test" };
  stagedManifest.profiles.push(frostProfile, fireProfile);
  const frostSpec = stagedManifest.specs.find((spec) => spec.specKey === "Frost Mage");
  const frostWasAccepted = frostSpec.status === "accepted";
  frostSpec.profileIds = [frostProfile.profileId];
  const fireSpec = stagedManifest.specs.find((spec) => spec.specKey === "Fire Mage");
  const fireWasAccepted = fireSpec.status === "accepted";
  fireSpec.profileIds = [fireProfile.profileId];
  const plan = planManifest(stagedManifest, ledger);
  assert.equal(plan.jobs.filter((job) => job.profileId === frostProfile.profileId
    && job.state === "runnable").length, 2);

  const evidence = structuredClone(ledger);
  const makeRecord = (profile, scenario, source) => ({ ...structuredClone(source),
    recordId: `${profile.profileId}-${scenario}`, profileId: profile.profileId,
    specKey: profile.specKey, profile: profile.name, scenario });
  evidence.records.push(
    makeRecord(frostProfile, "raid-st", ledger.records[0]),
    makeRecord(frostProfile, "aoe-5t", ledger.records[1]),
    makeRecord(fireProfile, "raid-st", ledger.records[0]),
  );
  const finalized = finalizeManifestAcceptance(stagedManifest, evidence, [frostProfile.profileId]);
  assert.equal(finalized.profiles.find((profile) => profile.profileId === frostProfile.profileId).status,
    "accepted");
  assert.equal(finalized.profiles.find((profile) => profile.profileId === fireProfile.profileId).status,
    "ready");
  assert.equal(finalized.specs.find((spec) => spec.specKey === "Frost Mage").status, "accepted");
  assert.deepEqual({ specs: finalized.coverage.acceptedEligibleSpecs,
    profiles: finalized.coverage.acceptedProfiles, records: finalized.coverage.acceptedRecords,
    reports: finalized.coverage.acceptedReports }, {
    specs: baselineCoverage.acceptedEligibleSpecs + Number(!frostWasAccepted) - Number(fireWasAccepted),
    profiles: baselineCoverage.acceptedProfiles + 1,
    records: baselineCoverage.acceptedRecords + 2,
    reports: baselineCoverage.acceptedReports + 4,
  });

  const partial = structuredClone(evidence);
  partial.records = partial.records.filter((record) => !(record.profileId === frostProfile.profileId
    && record.scenario === "aoe-5t"));
  assert.throws(() => finalizeManifestAcceptance(stagedManifest, partial, [frostProfile.profileId]),
    /every planned scenario/);
});

test("report validation rejects duration drift and extra scale-factor stats", async () => {
  const { manifest, ledger } = await catalogs();
  const record = ledger.records[0];
  const reportRun = record.runs[0];
  const build = manifest.builds.find((entry) => entry.buildId === record.buildId);
  const profile = manifest.profiles.find((entry) => entry.profileId === record.profileId);
  const scenario = manifest.scenarios.find((entry) => entry.scenarioId === record.scenario);
  const compressed = await readFile(fromRoot(`${build.auditDirectory}/reports/${reportRun.reportId}.json.gz`));
  const original = JSON.parse(gunzipSync(compressed).toString("utf8"));
  const expected = { reportId: reportRun.reportId, build, profile, scenario,
    policy: manifest.acceptancePolicy };
  const mutate = (change) => {
    const report = structuredClone(original);
    change(report.sim.options);
    return JSON.stringify(report);
  };
  assert.throws(() => parseSimcReport(mutate((options) => { options.max_time = 120; }), expected),
    /max_time must be 300/);
  assert.throws(() => parseSimcReport(mutate((options) => { options.vary_combat_length = 0; }), expected),
    /vary_combat_length must be 0.2/);
  assert.throws(() => parseSimcReport(mutate((options) => {
    options.scaling.scale_only += ",stamina";
  }), expected), /scale_only must contain exactly/);
  const requestedIterationsPerRun = manifest.acceptancePolicy.requestedIterationsPerRun + 25000;
  const workerAdjusted = mutate((options) => {
    options.iterations = requestedIterationsPerRun + options.threads - 1;
  });
  assert.equal(parseSimcReport(workerAdjusted, { ...expected,
    requestedIterationsPerRun }).iterations,
  requestedIterationsPerRun + original.sim.options.threads - 1);
  assert.throws(() => parseSimcReport(mutate((options) => {
    options.iterations = requestedIterationsPerRun - 1;
  }), { ...expected, requestedIterationsPerRun }), /outside the requested worker range/);
});

test("run report validation rejects a thread count different from the request", async () => {
  const { manifest, ledger } = await catalogs();
  const record = ledger.records[0];
  const reportRun = record.runs[0];
  const build = manifest.builds.find((entry) => entry.buildId === record.buildId);
  const profile = manifest.profiles.find((entry) => entry.profileId === record.profileId);
  const scenario = manifest.scenarios.find((entry) => entry.scenarioId === record.scenario);
  const compressed = await readFile(fromRoot(`${build.auditDirectory}/reports/${reportRun.reportId}.json.gz`));
  const original = JSON.parse(gunzipSync(compressed).toString("utf8"));
  const requestedThreads = original.sim.options.threads + 1;
  assert.throws(() => parseSimcReport(compressed, { reportId: reportRun.reportId,
    seed: reportRun.seed, build, profile, scenario, policy: manifest.acceptancePolicy,
    threads: requestedThreads }), /thread count .* does not match requested/);
});

test("report validation rejects a missing or underspecified simulator revision", async () => {
  const { manifest, ledger } = await catalogs();
  const record = ledger.records[0];
  const reportRun = record.runs[0];
  const build = manifest.builds.find((entry) => entry.buildId === record.buildId);
  const profile = manifest.profiles.find((entry) => entry.profileId === record.profileId);
  const scenario = manifest.scenarios.find((entry) => entry.scenarioId === record.scenario);
  const compressed = await readFile(fromRoot(`${build.auditDirectory}/reports/${reportRun.reportId}.json.gz`));
  const raw = gunzipSync(compressed).toString("utf8")
    .replace(/"git_revision"\s*:\s*"[^"]+"/, '"git_revision":""');
  assert.throws(() => parseSimcReport(raw, { reportId: reportRun.reportId, seed: reportRun.seed,
    build, profile, scenario, policy: manifest.acceptancePolicy }), /revision/);
  const oneCharacter = gunzipSync(compressed).toString("utf8")
    .replace(/"git_revision"\s*:\s*"[^"]+"/, '"git_revision":"2"');
  assert.throws(() => parseSimcReport(oneCharacter, { reportId: reportRun.reportId, seed: reportRun.seed,
    build, profile, scenario, policy: manifest.acceptancePolicy }), /revision/);
});

test("CLI is plan-first and mutations require explicit profile/scenario", () => {
  assert.deepEqual(parseCli([]), { command: "plan", force: false });
  assert.deepEqual(parseCli(["plan"]), { command: "plan", force: false });
  assert.deepEqual(parseCli(["run", "--profile", "p", "--scenario", "raid-st", "--simc", "simc.exe"]),
    { command: "run", force: false, profile: "p", scenario: "raid-st", simc: "simc.exe" });
  assert.equal(parseCli(["run", "--profile", "p", "--scenario", "raid-st", "--simc", "simc.exe",
    "--profile-file", "profile.simc"]).profileFile, "profile.simc");
  assert.equal(parseCli(["run", "--profile", "p", "--scenario", "raid-st", "--threads", "64"]).threads, 64);
  assert.equal(parseCli(["run", "--profile", "p", "--scenario", "raid-st",
    "--iterations", "50000"]).iterations, 50000);
  assert.throws(() => parseCli(["run", "--profile", "p"]), /requires --profile and --scenario/);
  assert.throws(() => parseCli(["plan", "--force"]), /promote-only/);
  assert.throws(() => parseCli(["plan", "--threads", "8"]), /not valid for plan/);
  assert.throws(() => parseCli(["plan", "--profile", "p"]), /not valid for plan/);
  assert.throws(() => parseCli(["promote", "--profile", "p", "--scenario", "raid-st",
    "--simc", "simc.exe"]), /not valid for promote/);
  assert.throws(() => parseCli(["promote", "--profile", "p", "--scenario", "raid-st",
    "--profile-file", "profile.simc"]), /run-only/);
  assert.throws(() => parseCli(["promote", "--profile", "p", "--scenario", "raid-st",
    "--iterations", "50000"]), /not valid for promote/);
  for (const invalid of ["0", "-1", "1.5", "many", "9007199254740992"])
    assert.throws(() => parseCli(["run", "--profile", "p", "--scenario", "raid-st",
      "--iterations", invalid]), /--iterations must be a positive integer/);
});
