// Verify and stage the reviewed official Unholy MID2 evidence without accepting it.
// `run-simc-reference.mjs promote` remains the only acceptance boundary.
import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzip as gzipCallback, gunzipSync } from "node:zlib";
import { promisify } from "node:util";
import {
  aggregateAcceptedRecord,
  deterministicSeed,
  findPlannedJob,
  jobFingerprint,
  parseSimcReport,
  planManifest,
  roundHalfEven,
  sha256,
  withPromotionLock,
} from "./run-simc-reference.mjs";
import { validateSimcAuditArtifacts } from "./validate-simc-audit.mjs";

const gzip = promisify(gzipCallback);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = join(ROOT, "data", "simc-run-manifest.json");
const DEFAULT_WEIGHTS = join(ROOT, "data", "simc-reference-weights.json");
const DEFAULT_WORK = join(ROOT, ".simc-work");
const PROFILE_ID = "death-knight-unholy-general";
const SPEC_KEY = "Unholy Death Knight";
const BUILD_ID = "simc-mid2-3b58991";
const REVIEWED_AT = "2026-08-04";
const GENERATOR_FILE = "MID2_Generate_Deathknight.simc";
const GENERATOR_SHA256 = "18cea7509a2c20e6bb74f0862df1405e543079a516be97f304eac87403b765ec";
const REDIRECTS = ["251126", "251138", "268222", "271878"];
const REVIEWED_ADVISORIES = Object.freeze([
  "Reviewed SimC stderr notice: Potion of Recklessness and Mastery ordering may need review.",
  "Reviewed SimC stderr notice: Rune of Unleashed Fire implementation has not yet been verified.",
]);
const SELECTION_SETTINGS = Object.freeze({
  threads: 2,
  fixedTime: true,
  maxTimeSeconds: 300,
  varyCombatLength: 0.2,
  optimalRaid: true,
  fightStyle: "Patchwerk",
  calculateScaleFactors: false,
});
const SETUP_FIELDS = [
  "race", "level", "role", "specialization", "profile_source", "party", "ready_type",
  "bugs", "valid_fight_style", "scale_player", "potion_used", "timeofday", "zandalari_loa",
  "vulpera_tricks", "earthen_mineral", "invert_scaling", "reaction_offset", "reaction_max",
  "reaction_mean", "reaction_stddev", "reaction_nu", "world_lag", "world_lag_stddev",
  "brain_lag", "brain_lag_stddev", "potion", "flask", "food", "augmentation",
  "temporary_enchant", "gear",
];

const PROFILES = Object.freeze({
  rider: Object.freeze({
    sourceFile: "MID2_Death_Knight_Unholy.simc",
    profileFile: "MID2_Death_Knight_Unholy.simc",
    sourceProfileName: "MID2_Death_Knight_Unholy_Rider",
    profileSha256: "4a31d2c390c872a7433e127e91f24b719dcac8893b3baa26d5560a83628295b1",
    talents: "CwPAAAAAAAAAAAAAAAAAAAAAAAwMjZMDDz2MzMTzmZmZMjBAAAAAAAgZGmZAwyMmZ2mZGjZAbmFDDZgZjhGLAYGAGzMjZAmZmxYA",
  }),
  sanlayn: Object.freeze({
    sourceFile: "MID2_Death_Knight_Unholy_San'layn.simc",
    // The evidence actor keeps its canonical apostrophe; the retained filename is portable.
    profileFile: "MID2_Death_Knight_Unholy_Sanlayn.simc",
    sourceProfileName: "MID2_Death_Knight_Unholy_San'layn",
    profileSha256: "59a96eb3e0927a2a812397d6bf10c1ebdcc74897a0df85e37bafc4e4cea55841",
    talents: "CwPAAAAAAAAAAAAAAAAAAAAAAAwMjZMDDz2MzMTzmZmZMjBAAAAAAAgZGmZAw2MmZ2mZGjZMwAzYRjlFAbTsBgZAYMzMmBzMYGjB",
  }),
});

const SELECTIONS = Object.freeze([
  Object.freeze({ scenarioId: "raid-st", actor: "rider", sourceFile: "rider-st.json",
    reportId: "death-knight-unholy-general-raid-st-rider-selection", seed: "424242",
    resultSha256: "77c4b4947e74dea458d0a4a1cddda22a859bfe304ff2e6ef0055ef518f60caad",
    iterations: 5001, baselineDps: 236036.0229, baselineDpsError: 214.848 }),
  Object.freeze({ scenarioId: "raid-st", actor: "sanlayn", sourceFile: "sanlayn-st.json",
    reportId: "death-knight-unholy-general-raid-st-sanlayn-selection", seed: "424242",
    resultSha256: "466e2df33e1d2f1d5e604337071897bb97fbb2c43bf98ef91134eb3e5f39721d",
    iterations: 5001, baselineDps: 228917.0641, baselineDpsError: 202.3456 }),
  Object.freeze({ scenarioId: "aoe-5t", actor: "rider", sourceFile: "rider-5t.json",
    reportId: "death-knight-unholy-general-aoe-5t-rider-selection", seed: "434343",
    resultSha256: "32f6aaf83709e8a0fcfc3060ed54bf1779be44d843b4815b2c7d68ba5d8818e3",
    iterations: 5001, baselineDps: 611506.3216, baselineDpsError: 539.9604 }),
  Object.freeze({ scenarioId: "aoe-5t", actor: "sanlayn", sourceFile: "sanlayn-5t.json",
    reportId: "death-knight-unholy-general-aoe-5t-sanlayn-selection", seed: "434343",
    resultSha256: "76e2572fe0120439ae1e2b6d40123ca6c277e603295545f54f4ddc5ce4238074",
    iterations: 5001, baselineDps: 662381.9604, baselineDpsError: 567.2446 }),
]);

const SCALE_REPORTS = Object.freeze([
  Object.freeze({ scenarioId: "raid-st", actor: "rider", runNumber: 1,
    sourceFile: "unholy-general-raid-st_r1.json",
    resultSha256: "5988b68dd38afb0c988dc2a51ceaaa4b163adc67c9914ee83015966086ecf393" }),
  Object.freeze({ scenarioId: "raid-st", actor: "rider", runNumber: 2,
    sourceFile: "unholy-general-raid-st_r2.json",
    resultSha256: "0e4a2144970f0926da79df44d9c894ab0e0e3404b6828342008041126d5fd69a" }),
  Object.freeze({ scenarioId: "aoe-5t", actor: "sanlayn", runNumber: 1,
    sourceFile: "unholy-general-aoe-5t_r1.json",
    resultSha256: "e5497aa1d09c84161f930b3d92f6ea6fbbf039d946d705338ef9a5435cb53682" }),
  Object.freeze({ scenarioId: "aoe-5t", actor: "sanlayn", runNumber: 2,
    sourceFile: "unholy-general-aoe-5t_r2.json",
    resultSha256: "a6fd333463ba189b0a3d3767e54e45c6d4d736a32cbe26f24c333074cf75d215" }),
]);

const TEXT_OUTPUTS = Object.freeze([
  ["materialize.txt", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
  ["rider-5t.txt", "a134f1f4c014e8d19adcbb1b94a032b3b5f1d022207b799ab533c1e85209914c"],
  ["rider-st.txt", "9e5fca7b2bf6321b599c7125de3110b933b203fb9944e1a850a77f58837e1ea4"],
  ["sanlayn-5t.txt", "bf3362dce99fc68247db4b13bc874b4c2da899002075d8eb45c3a3b7908fee90"],
  ["sanlayn-st.txt", "d9ebe8a02e54c5c9fa7cb3d3ea94f783dc29e622e5c942eed863d5ef6636f8f3"],
  ["unholy-general-aoe-5t_r1.txt", "44d269b1b138092b1d017a7e4d6d77b094da740ad26c2a4f30474a568aa735f3"],
  ["unholy-general-aoe-5t_r2.txt", "43a43932ff663b91fac07b6a02dc7366ca98fcad37d07922ea1058d535a5012e"],
  ["unholy-general-raid-st_r1.txt", "7adf4aa3f72f743fa612c648881d4d264735fad3236bcc18e49d11c9a8b0bec6"],
  ["unholy-general-raid-st_r2.txt", "d2a5c849422019a53f512768a66c181251067ae85e234735c06e971b285fbbd2"],
].map(([sourceFile, resultSha256]) => Object.freeze({ sourceFile, resultSha256 })));

export const PINNED_UNHOLY_EVIDENCE = Object.freeze({
  buildId: BUILD_ID,
  revision: "3b58991",
  commit: "3b5899178972f6dcb1bd2159c0092d883027d710",
  generatorFile: GENERATOR_FILE,
  generatorSha256: GENERATOR_SHA256,
  profiles: PROFILES,
  selections: SELECTIONS,
  scaleReports: SCALE_REPORTS,
  textOutputs: TEXT_OUTPUTS,
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}

function setupSignature(player) {
  return JSON.stringify(canonical(Object.fromEntries(SETUP_FIELDS
    .map((field) => [field, player?.[field] ?? null]))));
}

function rawJsonInteger(text, key) {
  return text.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`))?.[1] || null;
}

function gameVersion(value) {
  return String(value || "").replace(/\s+PTR$/i, "");
}

function tertiaryRatingsPresent(player) {
  return Object.values(player?.gear || {}).some((item) =>
    ["avoidance_rating", "leech_rating", "speed_rating"].some((field) => Number(item?.[field]) > 0));
}

function profileIdentity(bytes) {
  const text = bytes.toString("utf8");
  const actor = text.match(/^\s*[a-z][a-z_]*\s*=\s*"([^"]+)"\s*$/m)?.[1];
  const talents = text.match(/^\s*talents\s*=\s*(\S+)\s*$/m)?.[1];
  const redirectedBaseItemIds = [...text.matchAll(/redirected_base_stats=(\d+)/g)]
    .map((match) => match[1]);
  assert(actor && talents, "reviewed Unholy profile lacks its actor or talent loadout");
  assert(new Set(redirectedBaseItemIds).size === redirectedBaseItemIds.length,
    "reviewed Unholy profile repeats redirected_base_stats");
  return { actor, talents, redirectedBaseItemIds };
}

function exactArray(left, right) {
  return Array.isArray(left) && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

export function verifyPinnedInventory(files, inventory) {
  assert(files instanceof Map, "evidence files must be supplied as a Map");
  for (const entry of inventory) {
    const bytes = files.get(entry.sourceFile);
    assert(Buffer.isBuffer(bytes), `reviewed evidence is missing ${entry.sourceFile}`);
    const actual = sha256(bytes);
    assert(actual === entry.resultSha256,
      `${entry.sourceFile} SHA-256 ${actual} does not match reviewed ${entry.resultSha256}`);
  }
  return true;
}

function generatorSource(build) {
  return `https://github.com/simulationcraft/simc/blob/${build.commit}/profiles/generators/MID2/${GENERATOR_FILE}`;
}

function profileInput(build, profile) {
  const source = generatorSource(build);
  return {
    buildId: build.buildId,
    sourceProfileName: profile.sourceProfileName,
    sourceMode: "official-output",
    generatorSource: source,
    talentSource: source,
    profileFile: profile.profileFile,
    profileSha256: profile.profileSha256,
    itemDbSource: "local",
    redirectedBaseItemIds: [...REDIRECTS],
    tertiaryRatingsPresent: true,
  };
}

function candidateDeclaration(build, selection) {
  return {
    ...profileInput(build, PROFILES[selection.actor]),
    iterations: selection.iterations,
    baselineDps: selection.baselineDps,
    baselineDpsError: selection.baselineDpsError,
    reportId: selection.reportId,
    resultSha256: selection.resultSha256,
  };
}

export function buildUnholyProfile(manifest, { advisories = [] } = {}) {
  const build = manifest?.builds?.find((entry) => entry.buildId === BUILD_ID);
  assert(build?.status === "accepted", `manifest is missing accepted build ${BUILD_ID}`);
  assert(build.revision === PINNED_UNHOLY_EVIDENCE.revision
    && build.commit === PINNED_UNHOLY_EVIDENCE.commit,
  "manifest build does not match the reviewed Unholy evidence revision");
  const scenarios = [
    { scenarioId: "raid-st", seed: "424242", selected: "rider" },
    { scenarioId: "aoe-5t", seed: "434343", selected: "sanlayn" },
  ];
  return {
    profileId: PROFILE_ID,
    specKey: SPEC_KEY,
    name: "General",
    guideProfileName: "General",
    status: "ready",
    objective: "damage",
    primaryStat: "Strength",
    selectionMode: "same-gear-dps",
    scenarioIds: scenarios.map(({ scenarioId }) => scenarioId),
    scenarioInputs: scenarios.map(({ scenarioId, selected }) => ({
      scenarioId,
      ...profileInput(build, PROFILES[selected]),
    })),
    selectionEvidence: {
      metric: "DPS",
      requestedIterationsPerCandidate: 5000,
      settings: { ...SELECTION_SETTINGS },
      scenarios: scenarios.map(({ scenarioId, seed, selected }) => ({
        scenarioId,
        seed,
        selectedSourceProfileName: PROFILES[selected].sourceProfileName,
        candidates: SELECTIONS.filter((entry) => entry.scenarioId === scenarioId)
          .map((entry) => candidateDeclaration(build, entry)),
      })),
    },
    evidenceReview: {
      reviewedAt: REVIEWED_AT,
      generatorFile: GENERATOR_FILE,
      generatorSha256: GENERATOR_SHA256,
      capturedMaterializationOutput: "empty",
      armyGhoulNote: "Completed reports retain the army_ghoul zero-direct-DPS row; both actors initialized and every reviewed run completed.",
      // The two pinned notices were emitted outside the retained stdout files;
      // keep them explicit and merge any parseable captured advisory lines.
      advisories: [...new Set([...REVIEWED_ADVISORIES, ...advisories])],
    },
  };
}

function evidenceArtifactCounts(manifest, ledger) {
  const accepted = (ledger.records || []).filter((record) => record.status === "accepted");
  const candidates = (manifest.profiles || []).flatMap((profile) =>
    (profile.selectionEvidence?.scenarios || []).flatMap((scenario) => scenario.candidates || []));
  return {
    profiles: new Set([
      ...accepted.map((record) => `${record.buildId}\0${record.profileFile}`),
      ...candidates.map((candidate) => `${candidate.buildId}\0${candidate.profileFile}`),
    ]).size,
    reports: accepted.reduce((sum, record) => sum + (record.runs || []).length, 0),
    selections: new Set(candidates.map((candidate) =>
      `${candidate.buildId}\0${candidate.reportId}`)).size,
    buildIds: [...new Set([
      ...accepted.map((record) => record.buildId),
      ...candidates.map((candidate) => candidate.buildId),
    ])].sort(),
  };
}

export function buildUnholyAdmissionDocuments(manifest, ledger, options = {}) {
  assert(manifest?.schemaVersion === 2 && ledger?.schemaVersion === 3,
    "Unholy admission requires manifest v2 and ledger v3");
  const nextManifest = structuredClone(manifest);
  const nextLedger = structuredClone(ledger);
  const expected = buildUnholyProfile(nextManifest, options);
  const existingIndex = nextManifest.profiles.findIndex((profile) => profile.profileId === PROFILE_ID);
  if (existingIndex >= 0) {
    const existing = nextManifest.profiles[existingIndex];
    const comparable = { ...existing, status: "ready" };
    assert(JSON.stringify(comparable) === JSON.stringify(expected),
      `${PROFILE_ID} already exists with different reviewed evidence`);
    // Admission is safe to repeat after promotion; never downgrade accepted state.
    if (existing.status !== "accepted") nextManifest.profiles[existingIndex] = expected;
  } else nextManifest.profiles.push(expected);

  const spec = nextManifest.specs.find((entry) => entry.specKey === SPEC_KEY);
  assert(spec?.eligibility === "eligible" && ["pending", "accepted"].includes(spec.status),
    `${SPEC_KEY} is not an eligible conventional-DPS manifest row`);
  spec.profileIds ||= [];
  if (!spec.profileIds.includes(PROFILE_ID)) spec.profileIds.push(PROFILE_ID);
  assert(new Set(spec.profileIds).size === spec.profileIds.length,
    `${SPEC_KEY} repeats a profile id`);
  if (spec.status !== "accepted") {
    spec.status = "pending";
    spec.reason = "Reviewed official Unholy evidence is ready; both scenarios require explicit promotion before publication.";
  }

  const audit = nextLedger.methodology?.auditArtifacts;
  assert(audit && nextLedger.methodology, "ledger lacks its audit-artifact declaration");
  const counts = evidenceArtifactCounts(nextManifest, nextLedger);
  audit.profiles = counts.profiles;
  audit.reports = counts.reports;
  audit.selections = counts.selections;
  if (counts.buildIds.length === 1) {
    const build = nextManifest.builds.find((entry) => entry.buildId === counts.buildIds[0]);
    assert(build, `unknown evidence build ${counts.buildIds[0]}`);
    audit.directory = build.auditDirectory;
    audit.compression = build.compression;
    delete audit.directories;
  } else {
    audit.directories = Object.fromEntries(counts.buildIds.map((buildId) => {
      const build = nextManifest.builds.find((entry) => entry.buildId === buildId);
      assert(build, `unknown evidence build ${buildId}`);
      return [buildId, { directory: build.auditDirectory, compression: build.compression }];
    }));
    delete audit.directory;
    delete audit.compression;
  }
  assert(JSON.stringify(nextLedger.records) === JSON.stringify(ledger.records),
    "admission must not alter accepted records");
  return { manifest: nextManifest, ledger: nextLedger,
    profile: nextManifest.profiles.find((entry) => entry.profileId === PROFILE_ID), counts };
}

function parseSelectionReport(bytes, declaration, manifest, build) {
  const text = bytes.toString("utf8");
  let report;
  try { report = JSON.parse(text); }
  catch (error) { throw new Error(`${declaration.sourceFile} is not JSON: ${error.message}`); }
  const scenario = manifest.scenarios.find((entry) => entry.scenarioId === declaration.scenarioId);
  const options = report.sim?.options || {};
  const players = report.sim?.players || [];
  const player = players[0];
  const dps = player?.collected_data?.dps;
  const confidence = options.confidence_estimator;
  const profile = PROFILES[declaration.actor];
  assert(report.version === build.version && report.git_revision === build.revision,
    `${declaration.sourceFile} simulator build differs from the manifest`);
  assert((report.ptr_enabled === 1 || report.ptr_enabled === true)
    && options.dbc?.version_used === "PTR"
    && gameVersion(options.dbc?.PTR?.wow_version) === gameVersion(build.gameBuild),
  `${declaration.sourceFile} did not use the pinned PTR data`);
  assert(options.fight_style === scenario?.fightStyle && options.desired_targets === scenario?.targets,
    `${declaration.sourceFile} scenario differs from the manifest`);
  assert(rawJsonInteger(text, "seed") === declaration.seed
    && options.iterations === declaration.iterations && options.threads === SELECTION_SETTINGS.threads,
  `${declaration.sourceFile} seed, iterations, or threads differ from review`);
  assert(options.fixed_time === true && options.max_time === 300
    && options.vary_combat_length === 0.2 && options.optimal_raid === 1,
  `${declaration.sourceFile} fixed-time settings differ from review`);
  assert(!(options.scaling?.calculate_scale_factors === 1
    || options.scaling?.calculate_scale_factors === true)
    && player?.scale_factors === undefined && player?.scale_deltas === undefined,
  `${declaration.sourceFile} unexpectedly calculated scale factors`);
  assert(players.length === 1 && player?.specialization === SPEC_KEY
    && player?.name === profile.sourceProfileName && player?.talents === profile.talents,
  `${declaration.sourceFile} actor or talents differ from its reviewed profile`);
  assert(tertiaryRatingsPresent(player), `${declaration.sourceFile} lost reviewed tertiary ratings`);
  assert(roundHalfEven(dps?.mean, 4) === declaration.baselineDps
    && roundHalfEven(dps?.mean_std_dev * confidence, 4) === declaration.baselineDpsError,
  `${declaration.sourceFile} DPS or confidence error differs from review`);
  return { player, setup: setupSignature(player) };
}

function explicitAdvisories(files) {
  const lines = [];
  for (const output of TEXT_OUTPUTS) {
    const text = files.get(output.sourceFile).toString("utf8");
    for (const line of text.split(/\r?\n/))
      if (/^\s*(?:warning|error|advisory|notice)\s*[:\-]/i.test(line))
        lines.push(`${output.sourceFile}: ${line.trim()}`);
  }
  return [...new Set(lines)];
}

export function verifyUnholyEvidence(manifest, files) {
  const build = manifest?.builds?.find((entry) => entry.buildId === BUILD_ID);
  assert(build?.revision === PINNED_UNHOLY_EVIDENCE.revision
    && build.commit === PINNED_UNHOLY_EVIDENCE.commit,
  "manifest build does not match the pinned Unholy evidence");
  const inventory = [
    ...Object.values(PROFILES).map((profile) => ({ sourceFile: profile.sourceFile,
      resultSha256: profile.profileSha256 })),
    ...SELECTIONS,
    ...SCALE_REPORTS,
    ...TEXT_OUTPUTS,
  ];
  verifyPinnedInventory(files, inventory);

  for (const profile of Object.values(PROFILES)) {
    const identity = profileIdentity(files.get(profile.sourceFile));
    assert(identity.actor === profile.sourceProfileName && identity.talents === profile.talents
      && exactArray(identity.redirectedBaseItemIds, REDIRECTS),
    `${profile.sourceFile} identity, talents, or Catalyst redirects differ from review`);
  }

  const selectionSetups = SELECTIONS.map((entry) =>
    parseSelectionReport(files.get(entry.sourceFile), entry, manifest, build).setup);
  assert(new Set(selectionSetups).size === 1,
    "Unholy selection candidates do not share one non-talent character and gear setup");

  const profile = buildUnholyProfile(manifest);
  const parsedScaleReports = [];
  for (const declaration of SCALE_REPORTS) {
    const scenario = manifest.scenarios.find((entry) => entry.scenarioId === declaration.scenarioId);
    const reportId = `${PROFILE_ID}-${declaration.scenarioId}_r${declaration.runNumber}`;
    const seed = deterministicSeed(`${PROFILE_ID}::${declaration.scenarioId}`, declaration.runNumber);
    const bytes = files.get(declaration.sourceFile);
    const parsed = parseSimcReport(bytes, { reportId, seed, build, profile, scenario,
      policy: manifest.acceptancePolicy, threads: 2 });
    assert(parsed.resultSha256 === declaration.resultSha256,
      `${declaration.sourceFile} parsed SHA-256 differs from review`);
    const player = JSON.parse(bytes.toString("utf8")).sim?.players?.[0];
    const expectedProfile = PROFILES[declaration.actor];
    assert(player?.name === expectedProfile.sourceProfileName
      && player?.talents === expectedProfile.talents && tertiaryRatingsPresent(player),
    `${declaration.sourceFile} actor, talents, or tertiary ratings differ from review`);
    assert(setupSignature(player) === selectionSetups[0],
      `${declaration.sourceFile} does not share the selection gear setup`);
    parsedScaleReports.push({ ...declaration, reportId, seed, parsed, bytes });
  }
  for (const scenarioId of profile.scenarioIds) {
    const scenario = manifest.scenarios.find((entry) => entry.scenarioId === scenarioId);
    const input = profile.scenarioInputs.find((entry) => entry.scenarioId === scenarioId);
    aggregateAcceptedRecord({ profile, profileInput: input, scenario, build,
      policy: manifest.acceptancePolicy, profileSha256: input.profileSha256,
      runs: parsedScaleReports.filter((entry) => entry.scenarioId === scenarioId)
        .sort((left, right) => left.runNumber - right.runNumber).map((entry) => entry.parsed) });
  }
  return { build, parsedScaleReports, advisories: explicitAdvisories(files) };
}

export function buildWorkStage(manifest, ledger, verified) {
  const plan = planManifest(manifest, ledger);
  return ["raid-st", "aoe-5t"].map((scenarioId) => {
    const job = findPlannedJob(plan, PROFILE_ID, scenarioId);
    const reports = verified.parsedScaleReports.filter((entry) => entry.scenarioId === scenarioId)
      .sort((left, right) => left.runNumber - right.runNumber);
    assert(reports.length === manifest.acceptancePolicy.runsPerRecord,
      `${scenarioId} lacks its complete scale-report pair`);
    const profile = PROFILES[scenarioId === "raid-st" ? "rider" : "sanlayn"];
    const fingerprint = jobFingerprint(manifest, job, job.build.simcExeSha256,
      profile.profileSha256, 2);
    return {
      job,
      profile,
      reports,
      checkpoint: {
        schemaVersion: 1,
        fingerprint,
        executableSha256: job.build.simcExeSha256,
        profileSha256: profile.profileSha256,
        threads: 2,
        runs: reports.map(({ reportId, seed, parsed }) => ({
          reportId, seed, resultSha256: parsed.resultSha256, timestamp: parsed.timestamp,
        })),
      },
    };
  });
}

async function exists(path) {
  try { await access(path); return true; }
  catch { return false; }
}

function safeChild(root, ...parts) {
  const full = resolve(root, ...parts);
  assert(full.startsWith(`${resolve(root)}${sep}`), `path escapes ${root}`);
  return full;
}

async function atomicWrite(path, bytes) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${createHash("sha256")
    .update(`${path}\0${Date.now()}\0${Math.random()}`).digest("hex").slice(0, 12)}.tmp`;
  await writeFile(temporary, bytes);
  await rename(temporary, path);
}

async function atomicJson(path, value) {
  await atomicWrite(path, Buffer.from(`${JSON.stringify(value, null, 2)}\n`));
}

async function writeExactWorkFile(path, bytes) {
  if (await exists(path)) {
    const prior = await readFile(path);
    assert(sha256(prior) === sha256(bytes),
      `reviewed work staging conflicts with existing ${path}; choose a clean --work-dir`);
    return;
  }
  await atomicWrite(path, bytes);
}

async function writeAppendOnlyGzip(path, bytes) {
  if (await exists(path)) {
    let original;
    try { original = gunzipSync(await readFile(path)); }
    catch (error) { throw new Error(`retained artifact ${path} is not valid gzip: ${error.message}`); }
    assert(sha256(original) === sha256(bytes),
      `append-only artifact collision at ${path}`);
    return;
  }
  await atomicWrite(path, await gzip(bytes, { level: 9 }));
}

async function loadPinnedFiles(evidenceRoot) {
  const root = resolve(evidenceRoot);
  const names = [...new Set([
    ...Object.values(PROFILES).map((profile) => profile.sourceFile),
    ...SELECTIONS.map((entry) => entry.sourceFile),
    ...SCALE_REPORTS.map((entry) => entry.sourceFile),
    ...TEXT_OUTPUTS.map((entry) => entry.sourceFile),
  ])];
  return new Map(await Promise.all(names.map(async (name) =>
    [name, await readFile(safeChild(root, name))])));
}

async function retainAdmissionArtifacts(manifest, files) {
  const build = manifest.builds.find((entry) => entry.buildId === BUILD_ID);
  const auditRoot = safeChild(ROOT, build.auditDirectory);
  assert(auditRoot.startsWith(`${resolve(ROOT, "data", "simc-audit")}${sep}`),
    "manifest audit directory must remain below data/simc-audit");
  for (const profile of Object.values(PROFILES))
    await writeAppendOnlyGzip(safeChild(auditRoot, "profiles", `${profile.profileFile}.gz`),
      files.get(profile.sourceFile));
  for (const selection of SELECTIONS)
    await writeAppendOnlyGzip(safeChild(auditRoot, "selections", `${selection.reportId}.json.gz`),
      files.get(selection.sourceFile));
}

async function stageRunnerWork(manifest, ledger, verified, workRoot) {
  for (const stage of buildWorkStage(manifest, ledger, verified)) {
    const directory = safeChild(workRoot, stage.job.build.buildId, PROFILE_ID, stage.job.scenarioId);
    await writeExactWorkFile(safeChild(directory, stage.profile.profileFile),
      (await loadProfileBytes(stage.profile, verified, stage.reports)));
    for (const report of stage.reports)
      await writeExactWorkFile(safeChild(directory, `${report.reportId}.json`), report.bytes);
    await writeExactWorkFile(safeChild(directory, "checkpoint.json"),
      Buffer.from(`${JSON.stringify(stage.checkpoint, null, 2)}\n`));
  }
}

async function loadProfileBytes(profile, verified, reports) {
  // The verifier retains the file map privately on each parsed report via the caller;
  // the selected report carries the source profile key, while the immutable pin maps it.
  const files = verified.files;
  assert(files instanceof Map && reports.length, "verified evidence lost its profile bytes");
  return files.get(profile.sourceFile);
}

export function parseCli(argv) {
  const args = [...argv];
  const command = args.shift() || "help";
  assert(["admit", "help"].includes(command), `unknown command ${command}`);
  const options = { command };
  while (args.length) {
    const flag = args.shift();
    assert(flag.startsWith("--") && args.length, `invalid or incomplete option ${flag}`);
    const key = flag.slice(2);
    assert(["evidence-root", "manifest", "weights", "work-dir"].includes(key),
      `unknown option ${flag}`);
    assert(options[key] === undefined, `duplicate option ${flag}`);
    options[key] = args.shift();
  }
  if (command === "admit") assert(options["evidence-root"], "admit requires --evidence-root <path>");
  return options;
}

function usage() {
  return `Usage:\n  node gearing/src/admit-unholy-evidence.mjs admit --evidence-root <path> [--manifest <path>] [--weights <path>] [--work-dir <path>]\n\nThe command verifies the exact reviewed evidence, stages a READY profile and runner checkpoints, and does not accept records. Run the ordinary promoter once for each scenario afterward.`;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseCli(argv);
  if (options.command === "help") { console.log(usage()); return; }
  const manifestPath = resolve(options.manifest || DEFAULT_MANIFEST);
  const weightsPath = resolve(options.weights || DEFAULT_WEIGHTS);
  const workRoot = resolve(options["work-dir"] || DEFAULT_WORK);
  const evidenceRoot = resolve(options["evidence-root"]);
  return withPromotionLock([manifestPath, weightsPath], async () => {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const ledger = JSON.parse(await readFile(weightsPath, "utf8"));
    const files = await loadPinnedFiles(evidenceRoot);
    const verified = { ...verifyUnholyEvidence(manifest, files), files };
    const next = buildUnholyAdmissionDocuments(manifest, ledger,
      { advisories: verified.advisories });
    const alreadyAccepted = next.profile.status === "accepted";
    await retainAdmissionArtifacts(next.manifest, files);
    if (!alreadyAccepted) await stageRunnerWork(next.manifest, next.ledger, verified, workRoot);
    await validateSimcAuditArtifacts(next.ledger, next.manifest, ROOT);
    await atomicJson(weightsPath, next.ledger);
    await atomicJson(manifestPath, next.manifest);
    console.log(alreadyAccepted
      ? `${PROFILE_ID} is already accepted; reviewed artifacts remain unchanged.`
      : `${PROFILE_ID} is READY with both scale-report checkpoints staged. Use the ordinary promote command for raid-st and aoe-5t.`);
    return { ...next, workRoot, alreadyAccepted };
  });
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invoked) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
