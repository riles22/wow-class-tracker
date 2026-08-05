import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { dungeonLootIdsFrom, parseItem, parsedItemIssues, raidBossLootIdsFrom } from "../src/lib-wowhead.mjs";
import { extractPriority } from "../src/lib-icy-veins.mjs";
import { validateData } from "../src/validate-data.mjs";
import { validateSimcAuditArtifacts } from "../src/validate-simc-audit.mjs";
import { aggregateAcceptedRecord, parseSimcReport } from "../src/run-simc-reference.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const rootPath = fileURLToPath(new URL("..", import.meta.url));
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const profileInput = (profile, scenarioId) => Array.isArray(profile.scenarioInputs)
  ? profile.scenarioInputs.find((input) => input.scenarioId === scenarioId) : profile;
const simulatorForBuild = (build) => Object.fromEntries([
  "version", "revision", "commit", "gameBuild", "platform", "arch", "artifactSource",
  "artifactSha256", "simcExeSha256",
].map((field) => [field, build[field]]));

function ensureAcceptedSimcRecord(data) {
  const existing = data.simcWeights.records.find((record) => record.status === "accepted");
  if (existing) return existing;
  const weights = { Crit: 1.1, Haste: 1.2, Mast: 1.3, Vers: 0.9 };
  const record = {
    specKey: "Shadow Priest",
    profile: "Voidweaver (single- and multi-target)",
    scenario: "raid-st",
    targets: 1,
    status: "accepted",
    weights,
    runs: [
      { iterations: 1000, baselineDps: 100000, weights: { ...weights } },
      { iterations: 1000, baselineDps: 100100, weights: { ...weights } },
    ],
    maxRelativeDrift: 0.01,
    generatorSource: "https://github.com/simulationcraft/simc/blob/midnight/profiles/MID2/MID2_Priest_Shadow.simc",
    profileSha256: "a".repeat(64),
    simcRevision: "abcdef1",
    gameBuild: "12.1.0.12345",
    simulatedAt: "2026-08-03T01:00:00Z",
  };
  data.simcWeights.records.push(record);
  return record;
}

async function allValidatedData() {
  const [raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency, itemEligibility,
    tier, catalyst, catalystAllocations, simcManifest, simcWeights] = await Promise.all([
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/stat-priority-overrides.json"),
    json("data/stat-priority-baseline.json"), json("data/weapon-proficiency.json"),
    json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"), json("data/simc-run-manifest.json"),
    json("data/simc-reference-weights.json"),
  ]);
  return { raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency,
    itemEligibility, tier, catalyst, catalystAllocations, simcManifest, simcWeights };
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

function guidePage(markup) {
  return `<script>WH.markup.printHtml(${JSON.stringify(markup)}, "guide-body", {});</script>`;
}

function handMatches(hand, item) {
  return !!hand && !hand.mustBeEmpty
    && hand.inventorySlots.includes(item.slot)
    && hand.itemTypes.some((type) => type === (item.type == null ? null : item.type));
}

function weaponMatches(spec, item, handName = null) {
  const short = spec.statPriority.primary.slice(0, 3);
  const primary = item.primary === "Any" || String(item.primary).split("/").includes(short);
  return primary && spec.weaponLoadouts.some((loadout) => {
    const hands = handName ? [handName] : ["mainHand", "offHand"];
    return hands.some((hand) => handMatches(loadout.hands[hand], item));
  });
}

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.listeners = {};
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.value = "";
    this.disabled = false;
    this.hidden = false;
    this.tabIndex = 0;
    this.textContent = "";
    this.classList = { add() {}, remove() {} };
    this._innerHTML = "";
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(value) {
    this._innerHTML = String(value);
    if (value === "") {
      this.children = [];
      if (this.tagName === "SELECT") this.value = "";
    }
  }
  appendChild(child) {
    this.children.push(child);
    if (this.tagName === "SELECT" && !this.value) {
      const option = child.tagName === "OPTION" ? child
        : child.children.find((candidate) => candidate.tagName === "OPTION");
      if (option) this.value = option.value;
    }
    return child;
  }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "tabindex") this.tabIndex = Number(value);
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  focus() {}
  contains() { return false; }
  getBoundingClientRect() { return {right: 0, bottom: 0}; }
}

function fakeDocument(data) {
  const ids = new Map();
  for (const id of ["spec", "profile", "scenario", "scoring-mode", "spec-info", "scoring-summary", "weight-editor",
    "weight-crit", "weight-haste", "weight-mast", "weight-vers", "weight-reset", "bis-note", "bis",
    "tier-note", "tier", "src", "paths-note", "paths", "up", "simc", "curilvl", "up-hint",
    "p-items", "p-specs", "foot", "parse"])
    ids.set(id, new FakeElement(["spec", "profile", "scenario", "scoring-mode"].includes(id) ? "select"
      : id.startsWith("weight-") && id !== "weight-reset" ? "input" : "div"));
  ids.get("scoring-mode").value = "reference";
  ids.get("weight-editor").hidden = true;
  ids.get("curilvl").value = "292";
  const dataElement = new FakeElement("script");
  dataElement.textContent = JSON.stringify(data);
  ids.set("data", dataElement);
  return {
    ids,
    body: new FakeElement("body"),
    createElement: (tag) => new FakeElement(tag),
    getElementById: (id) => ids.get(id) || null,
    querySelector: (selector) => selector.startsWith("#") ? ids.get(selector.slice(1)) || null : null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
}

test("tooltip parsing preserves rating amounts and hybrid primary stats", () => {
  const item = parseItem({
    name: "Hybrid Shield", quality: 4, icon: "shield",
    tooltip: "Item Level 300<br>Binds when picked up<br>Unique-Equipped<br>Off Hand<br>Shield<br>+1,250 Strength<br>+1,250 Intellect<br>+700 Critical Strike<br>+350 Mastery<div>Classes: Priest</div><br>+125 Leech<br>+90 Avoidance<br>+80 Speed<br>Indestructible<br>Prismatic Socket",
  }, "1");
  assert.equal(item.primary, "Str/Int");
  assert.deepEqual(item.secondaries, ["Crit", "Mast"]);
  assert.deepEqual(item.secondaryRatings, { Crit: 700, Mast: 350 });
  assert.deepEqual(item.tertiaries, ["Leech", "Avoidance", "Speed", "Indestructible"]);
  assert.deepEqual(item.tertiaryRatings, { Leech: 125, Avoidance: 90, Speed: 80 });
  assert.deepEqual(item.sockets, ["Prismatic Socket"]);
  assert.deepEqual(item.classes, ["Priest"]);
  assert.equal(item.uniqueEquipped, true);
  assert.deepEqual(parsedItemIssues(item), []);
});

test("tooltip parsing preserves every Use and Equip effect", () => {
  const item = parseItem({
    name: "Two-effect Trinket", quality: 4, icon: "trinket",
    tooltip: "Item Level 300<br>Trinket<br>Use: Gain 500 Intellect for 20 sec.<br>Equip: Harmful spells grant 100 Haste.<br>Requires Level 90",
  }, "2");
  assert.deepEqual(item.effects, [
    { kind: "Use", text: "Gain 500 Intellect for 20 sec." },
    { kind: "Equip", text: "Harmful spells grant 100 Haste." },
  ]);
  assert.equal(item.effectKind, "Use");
  assert.equal(item.effect, "Gain 500 Intellect for 20 sec.");
  assert.deepEqual(parsedItemIssues(item), []);
});

test("guide parsers select semantic loot tables and ignore unrelated links", () => {
  const dungeon = guidePage([
    "[h2]Gear Drops[/h2]",
    "[table][tr][td]Armor[/td][/tr][tr][td]Item[/td][td]Boss Drop[/td][/tr]",
    "[tr][td][item=101 bonus=1][/td][td]Boss One[/td][/tr][/table]",
    "[h2]Class Bonus Rolls[/h2][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=999][/td][td]Weapon[/td][/tr][/table]",
  ].join(""));
  const raid = guidePage([
    "[h3]Gear[/h3][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=201][/td][td]Head[/td][/tr][/table]",
    "[h3]More Rewards[/h3][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=998][/td][td]Mount[/td][/tr][/table]",
  ].join(""));
  assert.deepEqual(dungeonLootIdsFrom(dungeon), ["101"]);
  assert.deepEqual(raidBossLootIdsFrom(raid), ["201"]);
  assert.throws(() => dungeonLootIdsFrom(guidePage("[h2>Overview[/h2]")), /loot table/);
});

test("Icy Veins parser uses the article patch and preserves the ordered stat run", () => {
  const preferred = [
    "<title>Navigation mentions Patch 12.0.5</title>",
    "<h1>Shadow Priest Stat Priority — 12.0.7</h1>",
    "<p>A good guideline for stats is:</p>",
    "<div>Intellect</div><div>Haste</div><div>Mastery</div><div>Critical Strike</div><div>Versatility</div>",
  ].join("");
  assert.deepEqual(extractPriority(preferred), {
    patch: "12.0.7",
    priority: { primary: "Intellect", secondaries: ["Haste", "Mast", "Crit", "Vers"] },
  });

  const fallback = "<h1>Example Guide - 12.0.7</h1><p>Haste</p><p>Mastery</p><p>Critical Strike</p><p>Versatility</p>";
  assert.deepEqual(extractPriority(fallback).priority, {
    primary: null, secondaries: ["Haste", "Mast", "Crit", "Vers"],
  });
  assert.equal(extractPriority("<h1>Broken - 12.0.7</h1><p>Haste</p>").priority, null);
});

test("generated datasets satisfy all build invariants", async () => {
  const data = await allValidatedData();
  const { raid, dungeons } = data;
  const retiredDelves = await json("data/delve-items.json");
  assert.deepEqual(validateData(data), {
    specs: 40, raidBosses: 8, dungeons: 8,
  });
  const kingsRest = dungeons.dungeons.find((dungeon) => dungeon.name === "Kings' Rest");
  const temple = dungeons.dungeons.find((dungeon) => dungeon.name === "Temple of Sethraliss");
  assert.ok(kingsRest.items.some((item) => item.id === "159645"));
  assert.equal(temple.items.some((item) => item.id === "159645"), false);
  assert.ok(raid.bosses.find((boss) => boss.boss === 1).items.some((item) => item.id === "268231"));
  assert.equal(raid.bosses.find((boss) => boss.boss === 7).items.some((item) => item.id === "268231"), false);
  assert.equal(raid.counts.tokens, 21);
  assert.ok(raid.bosses.find((boss) => boss.boss === 8).items.some((item) => item.id === "270909"));
  const hexIdol = raid.bosses.flatMap((boss) => boss.items).find((item) => item.id === "270169");
  assert.deepEqual(hexIdol.effects.map((effect) => effect.kind), ["Equip", "Use"]);
  assert.deepEqual({status: retiredDelves.status, consumedByBuild: retiredDelves.consumedByBuild,
    items: retiredDelves.items}, {status: "retired", consumedByBuild: false, items: []});
  const catalystBases = [...raid.bosses, ...dungeons.dungeons].flatMap((group) => group.items)
    .filter((item) => ["Head", "Shoulder", "Chest", "Hands", "Legs"].includes(item.slot));
  assert.equal(catalystBases.length, 94);
  assert.deepEqual(data.catalyst.mappedVenomcursedItemIds,
    ["271874", "271875", "271876", "271878"]);
  const directTier = data.tier.sets.flatMap((set) => set.items);
  assert.equal(data.tier.sets.length, 13);
  assert.equal(directTier.length, 65);
  assert.ok(directTier.every((item) => item.secondaries.length === 2));
  assert.deepEqual(data.catalystAllocations.counts,
    { catalystBases: 94, otherRanked: 159, directTier: 65, items: 318 });
  assert.equal(data.catalystAllocations.schemaVersion, 4);
  assert.deepEqual(data.catalyst.chargeSystem.catalystUnbound,
    { requirement: "first 4-piece class-set bonus", scope: "character", unlocksBonusDrops: true });
  assert.equal(data.catalyst.chargeSystem.serpentScion.bonusCharges, 1);
  assert.equal(Object.keys(data.catalystAllocations.items).length, 318);
  assert.ok(Object.values(data.catalystAllocations.items).every((item) =>
    Object.values(item.allocations).reduce((sum, value) => sum + value, 0) === 7000));
  const conventionalDpsSpecs = data.simcManifest.specs.filter((spec) =>
    spec.role === "DPS" && spec.eligibility === "eligible");
  assert.equal(conventionalDpsSpecs.length, 26);
  assert.ok(conventionalDpsSpecs.every((spec) => ["accepted", "pending"].includes(spec.status)
    && spec.profileIds.length > 0));
  const visibleDpsProfileIds = new Set(conventionalDpsSpecs.flatMap((spec) => spec.profileIds));
  assert.ok(data.simcManifest.profiles.filter((profile) => visibleDpsProfileIds.has(profile.profileId))
    .every((profile) => ["accepted", "ready"].includes(profile.status)));
  const curatedProfiles = data.simcManifest.profiles.filter((profile) =>
    profile.scenarioInputs.every((input) => input.sourceMode === "curated-same-gear"));
  assert.equal(curatedProfiles.length, 26);
  assert.ok(curatedProfiles.every((profile) => profile.scenarioInputs.every((input) =>
    input.generatorActorName && /^[a-f0-9]{64}$/.test(input.generatorSha256)
    && input.talentSource && input.talentSourceAsOf === input.curationReviewedAt
    && input.curationPolicyId && input.gearSetId && /^[a-f0-9]{64}$/.test(input.gearPlanSha256))));
  const expectedAcceptedMatrix = data.simcManifest.profiles
    .filter((profile) => profile.status === "accepted")
    .flatMap((profile) => profile.scenarioIds.map((scenarioId) => {
      const input = profileInput(profile, scenarioId);
      return `${profile.profileId}|${input.buildId}|${scenarioId}|accepted`;
    })).sort();
  const publishedProfileIds = new Set(data.simcManifest.profiles
    .filter((profile) => profile.status === "accepted").map((profile) => profile.profileId));
  assert.deepEqual(data.simcWeights.records.filter((record) => record.status === "accepted"
    && publishedProfileIds.has(record.profileId))
    .map((record) => `${record.profileId}|${record.buildId}|${record.scenario}|${record.status}`).sort(),
  expectedAcceptedMatrix);
  const evidenceProfileIds = new Set(data.simcManifest.profiles
    .filter((profile) => ["accepted", "ready"].includes(profile.status))
    .map((profile) => profile.profileId));
  assert.ok(data.simcWeights.records.filter((record) => record.status === "accepted")
    .every((record) => evidenceProfileIds.has(record.profileId)));
  assert.match(data.simcWeights.methodology.normalization, /selected profile's primary stat/);
  assert.doesNotMatch(data.simcWeights.methodology.normalization, /^Intellect\b/);
});

test("ready-profile evidence is recoverable without publishing partial coverage", async () => {
  const data = clone(await allValidatedData());
  const frostSpec = data.simcManifest.specs.find((spec) => spec.specKey === "Frost Mage");
  const acceptedEligibleBefore = data.simcManifest.coverage.acceptedEligibleSpecs;
  const frostWasAccepted = frostSpec.status === "accepted";
  const profile = data.simcManifest.profiles.find((entry) => entry.profileId === "mage-frost-general");
  profile.status = "ready";
  frostSpec.status = "pending";
  frostSpec.reason = "A reviewed profile still has only partial accepted evidence.";
  data.simcWeights.records = data.simcWeights.records.filter((record) =>
    record.profileId !== profile.profileId || record.scenario === "aoe-5t");
  const input = profileInput(profile, "aoe-5t");
  const build = data.simcManifest.builds.find((entry) => entry.buildId === input.buildId);
  let record = data.simcWeights.records.find((entry) =>
    entry.profileId === profile.profileId && entry.scenario === "aoe-5t");
  if (!record) {
    record = clone(data.simcWeights.records.find((entry) =>
      entry.status === "accepted" && entry.scenario === "aoe-5t"));
    Object.assign(record, { recordId: `${profile.profileId}-aoe-5t`, profileId: profile.profileId,
      specKey: profile.specKey, profile: profile.name, buildId: input.buildId,
      objective: profile.objective, primaryStat: profile.primaryStat,
      simcVersion: build.version, simcRevision: build.revision, gameBuild: build.gameBuild });
    for (const field of ["sourceProfileName", "sourceMode", "generatorActorName", "generatorSource",
      "generatorSha256", "talentSource", "talentSourceAsOf", "curationReviewedAt",
      "curationPolicyId", "gearSetId", "gearPlanSha256", "profileFile", "profileSha256",
      "itemDbSource", "redirectedBaseItemIds", "tertiaryRatingsPresent"])
      record[field] = clone(input[field]);
    record.runs.forEach((run, index) => {
      run.reportId = `mage_frost_ready_aoe_r${index + 1}`;
      run.seed = String(7000000000000000 + index);
    });
    data.simcWeights.records.push(record);
  }
  const acceptedProfiles = data.simcManifest.profiles.filter((entry) => entry.status === "accepted");
  Object.assign(data.simcManifest.coverage, {
    acceptedEligibleSpecs: data.simcManifest.specs.filter((spec) =>
      spec.eligibility === "eligible" && spec.status === "accepted").length,
    pendingEligibleSpecs: data.simcManifest.specs.filter((spec) =>
      spec.eligibility === "eligible" && spec.status === "pending").length,
    acceptedProfiles: acceptedProfiles.length,
    acceptedRecords: acceptedProfiles.reduce((sum, entry) => sum + entry.scenarioIds.length, 0),
    acceptedReports: acceptedProfiles.reduce((sum, entry) => sum + entry.scenarioIds.length
      * data.simcManifest.acceptancePolicy.runsPerRecord, 0),
  });
  const methodology = data.simcWeights.methodology;
  const selectionCandidates = data.simcManifest.profiles.flatMap((entry) =>
    (entry.selectionEvidence?.scenarios || []).flatMap((scenario) => scenario.candidates || []));
  const evidenceBuildIds = new Set([
    ...data.simcWeights.records.filter((entry) => entry.status === "accepted").map((entry) => entry.buildId),
    ...acceptedProfiles.flatMap((entry) => entry.scenarioIds
      .map((scenarioId) => profileInput(entry, scenarioId).buildId)),
    ...selectionCandidates.map((candidate) => candidate.buildId),
  ]);
  const evidenceBuilds = data.simcManifest.builds.filter((build) => evidenceBuildIds.has(build.buildId));
  methodology.simulators = Object.fromEntries(evidenceBuilds
    .map((build) => [build.buildId, simulatorForBuild(build)]));
  delete methodology.simulator;
  methodology.auditArtifacts.directories = Object.fromEntries(evidenceBuilds
    .map((build) => [build.buildId,
      { directory: build.auditDirectory, compression: build.compression }]));
  delete methodology.auditArtifacts.directory;
  delete methodology.auditArtifacts.compression;
  methodology.auditArtifacts.profiles = new Set([
    ...data.simcWeights.records.filter((entry) => entry.status === "accepted")
      .map((entry) => `${entry.buildId}|${entry.profileFile}`),
    ...selectionCandidates.map((candidate) => `${candidate.buildId}|${candidate.profileFile}`),
  ]).size;
  methodology.auditArtifacts.reports = data.simcWeights.records.filter((entry) =>
    entry.status === "accepted").reduce((sum, entry) => sum + entry.runs.length, 0);
  methodology.auditArtifacts.selections = selectionCandidates.length;
  data.simcWeights.generatedAt = data.simcWeights.records.filter((entry) => entry.status === "accepted")
    .map((entry) => entry.simulatedAt).sort().at(-1);

  assert.doesNotThrow(() => validateData(data));
  assert.equal(data.simcManifest.coverage.acceptedEligibleSpecs,
    acceptedEligibleBefore - (frostWasAccepted ? 1 : 0));
  assert.equal(frostSpec.status, "pending");

  const mismatchedSource = clone(data);
  mismatchedSource.simcWeights.records.find((entry) => entry.recordId === record.recordId)
    .sourceProfileName = "Frostfire";
  assert.throws(() => validateData(mismatchedSource), /simulation provenance/);
  const incompleteInputs = clone(data);
  incompleteInputs.simcManifest.profiles.find((entry) => entry.profileId === profile.profileId)
    .scenarioInputs.pop();
  assert.throws(() => validateData(incompleteInputs), /invalid profile mage-frost-general/);
  const unnamedInput = clone(data);
  delete unnamedInput.simcManifest.profiles.find((entry) => entry.profileId === profile.profileId)
    .scenarioInputs[0].sourceProfileName;
  assert.throws(() => validateData(unnamedInput), /invalid profile mage-frost-general/);
  const missingSelectionMode = clone(data);
  delete missingSelectionMode.simcManifest.profiles.find((entry) => entry.profileId === profile.profileId)
    .selectionMode;
  assert.throws(() => validateData(missingSelectionMode), /invalid profile mage-frost-general/);
  const staleSimulator = clone(data);
  staleSimulator.simcWeights.methodology.simulators[input.buildId].revision = "0000000";
  assert.throws(() => validateData(staleSimulator), /simulator provenance/);
});

test("curated same-gear inputs bind talent dates and gear snapshots to a reviewed policy", async () => {
  const data = clone(await allValidatedData());
  const curationPolicyId = "midnight-s2-dps-shell-v1";
  const gearSetId = "warlock-destruction-reference-shell";
  const reviewedAt = "2026-08-04";
  const generatorSha256 = "6".repeat(64);
  const gearPlanSha256 = "7".repeat(64);
  const gearDataHashes = clone(data.simcManifest.curationPolicies[0].gearDataHashes);
  data.simcManifest.curationPolicies.push({
    curationPolicyId,
    reviewedAt,
    gearDataHashes,
    generatorFileSha256: { "MID2_Generate_Warlock.simc": generatorSha256 },
    gearSets: [{ gearSetId, specKey: "Destruction Warlock", gearPlanSha256 }],
  });
  const curatedProvenance = {
    sourceMode: "curated-same-gear",
    generatorActorName: "MID2_Warlock_Destruction_Upstream",
    generatorSha256,
    talentSource: "https://www.wowhead.com/ptr/guide/classes/warlock/destruction/talent-builds-pve-dps",
    talentSourceAsOf: reviewedAt,
    curationReviewedAt: reviewedAt,
    curationPolicyId,
    gearSetId,
    gearPlanSha256,
  };
  const profile = data.simcManifest.profiles.find((entry) =>
    entry.profileId === "warlock-destruction-general");
  profile.scenarioInputs.forEach((input) => Object.assign(input, curatedProvenance));
  profile.selectionEvidence.scenarios.forEach((scenario) => scenario.candidates
    .forEach((candidate) => Object.assign(candidate, curatedProvenance)));
  data.simcWeights.records.filter((record) => record.profileId === profile.profileId)
    .forEach((record) => Object.assign(record, curatedProvenance));
  assert.doesNotThrow(() => validateData(data));

  const missingDungeonSnapshot = clone(data);
  delete missingDungeonSnapshot.simcManifest.curationPolicies
    .find((policy) => policy.curationPolicyId === curationPolicyId)
    .gearDataHashes["data/dungeon-items.json"];
  assert.throws(() => validateData(missingDungeonSnapshot), /invalid curation policy/);

  const staleReview = clone(data);
  staleReview.simcManifest.profiles.find((entry) => entry.profileId === profile.profileId)
    .scenarioInputs[0].curationReviewedAt = "2026-08-03";
  assert.throws(() => validateData(staleReview), /invalid profile warlock-destruction-general/);

  const wrongGearSet = clone(data);
  wrongGearSet.simcManifest.curationPolicies.find((policy) =>
    policy.curationPolicyId === curationPolicyId).gearSets
    .find((gearSet) => gearSet.gearSetId === gearSetId).specKey = "Affliction Warlock";
  assert.throws(() => validateData(wrongGearSet), /invalid profile warlock-destruction-general/);

  const wrongGenerator = clone(data);
  wrongGenerator.simcManifest.profiles.find((entry) => entry.profileId === profile.profileId)
    .scenarioInputs[0].generatorSha256 = "8".repeat(64);
  assert.throws(() => validateData(wrongGenerator), /invalid profile warlock-destruction-general/);

  const wrongGearPlan = clone(data);
  wrongGearPlan.simcManifest.profiles.find((entry) => entry.profileId === profile.profileId)
    .scenarioInputs[0].gearPlanSha256 = "9".repeat(64);
  assert.throws(() => validateData(wrongGearPlan), /invalid profile warlock-destruction-general/);
});

test("build data validation invalidates curated evidence when source bytes drift", async (t) => {
  const data = await allValidatedData();
  const root = await mkdtemp(join(tmpdir(), "gearing-curation-sources-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await copyCurationSources(data.simcManifest, root);

  assert.doesNotThrow(() => validateData(data, { gearingRoot: root }));
  const path = join(root, "data", "dungeon-items.json");
  await writeFile(path, Buffer.concat([await readFile(path), Buffer.from(" ")]));
  assert.throws(() => validateData(data, { gearingRoot: root }),
    /curation source hash mismatch for data\/dungeon-items\.json/);
});

test("retained SimC audit artifacts reproduce every accepted hash", async () => {
  const { simcWeights, simcManifest } = await allValidatedData();
  const declaredAudit = simcWeights.methodology.auditArtifacts;
  assert.deepEqual(await validateSimcAuditArtifacts(simcWeights, simcManifest, rootPath),
    { profiles: declaredAudit.profiles, reports: declaredAudit.reports });
  const escaped = clone(simcWeights);
  escaped.records[0].profileFile = `..${process.platform === "win32" ? "\\" : "/"}..${process.platform === "win32" ? "\\" : "/"}outside`;
  await assert.rejects(validateSimcAuditArtifacts(escaped, simcManifest, rootPath), /path escapes the reviewed audit directory/);
  const incomplete = clone(simcWeights);
  incomplete.records.pop();
  const acceptedProfiles = simcManifest.profiles.filter((profile) => profile.status === "accepted");
  const requiredPublishedProfiles = new Set(acceptedProfiles.flatMap((profile) =>
    profile.scenarioIds.map((scenarioId) => {
      const input = profileInput(profile, scenarioId);
      return `${input.buildId}|${input.profileFile}`;
    }))).size;
  const requiredPublishedReports = acceptedProfiles.reduce((sum, profile) =>
    sum + profile.scenarioIds.length * simcManifest.acceptancePolicy.runsPerRecord, 0);
  await assert.rejects(validateSimcAuditArtifacts(incomplete, simcManifest, rootPath),
    new RegExp(`expected ${requiredPublishedProfiles} generated profiles and ${requiredPublishedReports} accepted reports`));
  const selectionHashDrift = clone(simcManifest);
  selectionHashDrift.profiles.find((profile) => profile.selectionEvidence)
    .selectionEvidence.scenarios[0].candidates[0].resultSha256 = "a".repeat(64);
  await assert.rejects(validateSimcAuditArtifacts(simcWeights, selectionHashDrift, rootPath),
    /selections.*expected .* found/);
  const selectionMetadataDrift = clone(simcManifest);
  selectionMetadataDrift.profiles.find((profile) => profile.selectionEvidence)
    .selectionEvidence.scenarios[0].candidates[0].baselineDps += 1;
  await assert.rejects(validateSimcAuditArtifacts(simcWeights, selectionMetadataDrift, rootPath),
    /selection report DPS or confidence error differs/);
  const selectionCountDrift = clone(simcWeights);
  selectionCountDrift.methodology.auditArtifacts.selections -= 1;
  await assert.rejects(validateSimcAuditArtifacts(selectionCountDrift, simcManifest, rootPath),
    /accepted audit declaration/);
  const crossBuildSelection = clone(simcManifest);
  const otherBuild = crossBuildSelection.builds.find((build) => build.buildId === "simc-mid2-229259b");
  crossBuildSelection.profiles.find((profile) => profile.selectionEvidence)
    .selectionEvidence.scenarios[0].candidates[1].buildId = otherBuild.buildId;
  await assert.rejects(validateSimcAuditArtifacts(simcWeights, crossBuildSelection, rootPath),
    /selection candidates do not share one build/);
  const coefficientDrift = clone(simcWeights);
  const recordIndex = coefficientDrift.records.findIndex((record) =>
    record.recordId === "warlock-destruction-general-raid-st");
  const record = coefficientDrift.records[recordIndex];
  const profile = simcManifest.profiles.find((entry) => entry.profileId === record.profileId);
  const scenario = simcManifest.scenarios.find((entry) => entry.scenarioId === record.scenario);
  const input = profileInput(profile, scenario.scenarioId);
  const build = simcManifest.builds.find((entry) => entry.buildId === input.buildId);
  const runs = clone(record.runs);
  runs.forEach((run) => { run.weights.Crit += 0.2; });
  coefficientDrift.records[recordIndex] = aggregateAcceptedRecord({ profile, profileInput: input,
    scenario, build, policy: simcManifest.acceptancePolicy, profileSha256: input.profileSha256, runs });
  await assert.rejects(validateSimcAuditArtifacts(coefficientDrift, simcManifest, rootPath),
    /accepted report does not reproduce its ledger run/);

  const redirectedDrift = clone(simcManifest);
  redirectedDrift.profiles.find((entry) => entry.profileId === "priest-shadow-voidweaver")
    .scenarioInputs.forEach((input) => { input.redirectedBaseItemIds = ["271874", "268255"]; });
  await assert.rejects(validateSimcAuditArtifacts(simcWeights, redirectedDrift, rootPath),
    /retained profile redirected_base_stats ids differ from the manifest/);

  const tertiaryManifestDrift = clone(simcManifest);
  const tertiaryWeightsDrift = clone(simcWeights);
  const destruction = tertiaryManifestDrift.profiles.find((entry) =>
    entry.profileId === "warlock-destruction-general");
  destruction.scenarioInputs.forEach((input) => { input.tertiaryRatingsPresent = false; });
  destruction.selectionEvidence.scenarios.forEach((selection) => selection.candidates
    .forEach((candidate) => { candidate.tertiaryRatingsPresent = false; }));
  tertiaryWeightsDrift.records.filter((entry) => entry.profileId === destruction.profileId)
    .forEach((entry) => { entry.tertiaryRatingsPresent = false; });
  await assert.rejects(validateSimcAuditArtifacts(
    tertiaryWeightsDrift, tertiaryManifestDrift, rootPath), /tertiary ratings differ/);
});

test("retained curated headers bind the complete declared provenance", async () => {
  const { simcWeights, simcManifest } = await allValidatedData();
  const manifest = clone(simcManifest);
  const weights = clone(simcWeights);
  const profile = manifest.profiles.find((entry) => entry.scenarioInputs?.some((input) =>
    input.sourceMode === "curated-same-gear") && entry.selectionEvidence);
  assert.ok(profile, "expected at least one sealed curated profile");
  const target = profile.scenarioInputs.find((input) => input.sourceMode === "curated-same-gear");
  const changed = {
    generatorSource: "https://example.com/reviewed-generator.simc",
    talentSource: "https://example.com/reviewed-talents",
    gearSetId: `${target.gearSetId}-changed`,
  };
  const inputs = profile.scenarioInputs.filter((input) => input.profileFile === target.profileFile);
  const candidates = profile.selectionEvidence.scenarios.flatMap((scenario) => scenario.candidates)
    .filter((candidate) => candidate.profileFile === target.profileFile);
  const records = weights.records.filter((record) => record.profileId === profile.profileId
    && record.profileFile === target.profileFile);
  assert.ok(inputs.length > 0 && candidates.length > 0);
  [...inputs, ...candidates, ...records].forEach((declaration) => Object.assign(declaration, changed));

  for (const record of records) {
    const input = inputs.find((entry) => entry.scenarioId === record.scenario);
    assert.deepEqual(Object.fromEntries(Object.keys(changed).map((field) => [field, record[field]])),
      Object.fromEntries(Object.keys(changed).map((field) => [field, input[field]])));
  }
  await assert.rejects(validateSimcAuditArtifacts(weights, manifest, rootPath),
    /retained profile curation provenance differs from the manifest/);
});

test("selection audit requires retained candidate profiles and identical non-talent setups", async (t) => {
  const tempRoot = await mkdtemp(join(tmpdir(), "wow-simc-selection-"));
  t.after(() => rm(tempRoot, { recursive: true, force: true }));
  const { simcManifest } = await allValidatedData();
  const profile = clone(simcManifest.profiles.find((entry) => entry.selectionEvidence));
  profile.status = "ready";
  profile.scenarioIds = ["raid-st"];
  profile.scenarioInputs = profile.scenarioInputs.filter((input) => input.scenarioId === "raid-st");
  profile.selectionEvidence.scenarios = profile.selectionEvidence.scenarios
    .filter((scenario) => scenario.scenarioId === "raid-st");
  const selection = profile.selectionEvidence.scenarios[0];
  const build = clone(simcManifest.builds.find((entry) =>
    entry.buildId === selection.candidates[0].buildId));
  const scenario = clone(simcManifest.scenarios.find((entry) => entry.scenarioId === "raid-st"));
  const manifest = { schemaVersion: 2, activeBuildId: build.buildId, builds: [build],
    curationPolicies: [],
    profiles: [profile], scenarios: [scenario], acceptancePolicy: clone(simcManifest.acceptancePolicy) };
  const weights = { records: [], methodology: { auditArtifacts: {
    directory: build.auditDirectory, compression: build.compression,
    profiles: 2, reports: 0, selections: 2,
  } } };
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  const retain = async (kind, name, bytes) => {
    const path = join(tempRoot, build.auditDirectory, kind, `${name}.gz`);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, gzipSync(bytes));
  };
  const profileBytes = [];
  const reportBytes = [];
  for (const candidate of selection.candidates) {
    profileBytes.push(gunzipSync(await readFile(fromRoot(
      `${build.auditDirectory}/profiles/${candidate.profileFile}.gz`))));
    reportBytes.push(gunzipSync(await readFile(fromRoot(
      `${build.auditDirectory}/selections/${candidate.reportId}.json.gz`))));
    await retain("selections", `${candidate.reportId}.json`, reportBytes.at(-1));
  }
  await retain("profiles", selection.candidates[0].profileFile, profileBytes[0]);
  await assert.rejects(validateSimcAuditArtifacts(weights, manifest, tempRoot),
    /MID2_Warlock_Destruction_Diabolist\.simc\.gz/);

  await retain("profiles", selection.candidates[1].profileFile, profileBytes[1]);
  assert.deepEqual(await validateSimcAuditArtifacts(weights, manifest, tempRoot),
    { profiles: 2, reports: 0 });

  const mismatchedGear = JSON.parse(reportBytes[1].toString("utf8"));
  mismatchedGear.sim.players[0].gear.head.ilevel += 1;
  const mismatchedGearBytes = Buffer.from(JSON.stringify(mismatchedGear));
  selection.candidates[1].resultSha256 = hash(mismatchedGearBytes);
  await retain("selections", `${selection.candidates[1].reportId}.json`, mismatchedGearBytes);
  await assert.rejects(validateSimcAuditArtifacts(weights, manifest, tempRoot),
    /selection candidates do not share one non-talent character and gear setup/);

  selection.candidates[1].resultSha256 = hash(reportBytes[1]);
  await retain("selections", `${selection.candidates[1].reportId}.json`, reportBytes[1]);
  const mismatchedProfile = Buffer.from(profileBytes[1].toString("utf8")
    .replace(/^talents=.*$/m, "talents=mismatched-test-talents"));
  selection.candidates[1].profileSha256 = hash(mismatchedProfile);
  await retain("profiles", selection.candidates[1].profileFile, mismatchedProfile);
  await assert.rejects(validateSimcAuditArtifacts(weights, manifest, tempRoot),
    /selection report actor or talents do not match the retained candidate profile/);
});

test("SimC audit validation follows scenario inputs across build directories", async (t) => {
  const tempRoot = await mkdtemp(join(tmpdir(), "wow-simc-audit-"));
  t.after(() => rm(tempRoot, { recursive: true, force: true }));
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  const retain = async (directory, kind, name, bytes) => {
    const path = join(tempRoot, directory, kind, `${name}.gz`);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, gzipSync(bytes));
    return hash(bytes);
  };
  const builds = [
    { buildId: "simc-mid2-1111111", auditDirectory: "audit/1111111", compression: "gzip",
      version: "1205-01", revision: "1111111", gameBuild: "12.1.0.68914 PTR" },
    { buildId: "simc-mid2-2222222", auditDirectory: "audit/2222222", compression: "gzip",
      version: "1205-01", revision: "2222222", gameBuild: "12.1.0.68914 PTR" },
  ];
  const scenarios = [
    { scenarioId: "raid-st", fightStyle: "Patchwerk", targets: 1 },
    { scenarioId: "aoe-5t", fightStyle: "Patchwerk", targets: 5 },
  ];
  const talents = ["hellcaller-test-talents", "diabolist-test-talents"];
  const inputs = [
    { scenarioId: "raid-st", buildId: builds[0].buildId, sourceProfileName: "Hellcaller",
      sourceMode: "official-output",
      generatorSource: "https://github.com/simulationcraft/simc/blob/1111111/generator.simc",
      talentSource: "https://github.com/simulationcraft/simc/blob/1111111/generator.simc",
      profileFile: "MID2_Warlock_Destruction.simc", itemDbSource: "ptrhead",
      redirectedBaseItemIds: [], tertiaryRatingsPresent: false },
    { scenarioId: "aoe-5t", buildId: builds[1].buildId, sourceProfileName: "Diabolist",
      sourceMode: "official-output",
      generatorSource: "https://github.com/simulationcraft/simc/blob/2222222/generator.simc",
      talentSource: "https://github.com/simulationcraft/simc/blob/2222222/generator.simc",
      profileFile: "MID2_Warlock_Destruction_Diabolist.simc", itemDbSource: "ptrhead",
      redirectedBaseItemIds: [], tertiaryRatingsPresent: false },
  ];
  for (const [index, input] of inputs.entries()) {
    const profileBytes = Buffer.from(`warlock="${input.sourceProfileName}"\nspec=destruction\ntalents=${talents[index]}\n`);
    input.profileSha256 = await retain(builds[index].auditDirectory, "profiles",
      input.profileFile, profileBytes);
  }
  const profile = { profileId: "warlock-destruction-general", status: "accepted",
    specKey: "Destruction Warlock", name: "General", objective: "damage", primaryStat: "Intellect",
    selectionMode: "single-actor",
    scenarioIds: inputs.map(({ scenarioId }) => scenarioId), scenarioInputs: inputs };
  const acceptancePolicy = { runsPerRecord: 2, requestedIterationsPerRun: 1000,
    maximumRelativeDrift: 0.05 };
  const records = [];
  for (const [index, input] of inputs.entries()) {
    const build = builds[index];
    const scenario = scenarios[index];
    const requestedIterationsPerRun = index === 1 ? 2000 : undefined;
    const runs = [];
    for (let runNumber = 1; runNumber <= 2; runNumber++) {
      const reportId = `warlock_destruction_${index + 1}_r${runNumber}`;
      const seed = String(1000 + index * 10 + runNumber);
      const report = {
        version: build.version, git_revision: build.revision, ptr_enabled: 1,
        timestamp: `2026-08-04T00:0${index * 2 + runNumber}:00Z`,
        sim: {
          options: {
            dbc: { version_used: "PTR", PTR: { wow_version: "12.1.0.68914" } },
            fight_style: scenario.fightStyle, desired_targets: scenario.targets,
            fixed_time: true, optimal_raid: 1, max_time: 300, vary_combat_length: 0.2,
            iterations: (requestedIterationsPerRun ?? 1000) + 1,
            threads: 2, seed: Number(seed), confidence_estimator: 1.96,
            scaling: { calculate_scale_factors: 1, normalize_scale_factors: 1,
              scale_only: "intellect,crit,haste,mastery,versatility" },
          },
          players: [{ name: input.sourceProfileName, specialization: profile.specKey,
            talents: talents[index], scale_factors: { Int: 1, Crit: 0.6 + runNumber / 1000,
              Haste: 0.7 + runNumber / 1000, Mastery: 0.8 + runNumber / 1000,
              Vers: 0.5 + runNumber / 1000 },
            collected_data: { dps: { mean: 100000 + index * 5000 + runNumber,
              mean_std_dev: 10 } } }],
        },
      };
      const bytes = Buffer.from(JSON.stringify(report));
      await retain(build.auditDirectory, "reports", `${reportId}.json`, bytes);
      runs.push(parseSimcReport(bytes, { reportId, seed, build, profile, scenario,
        policy: acceptancePolicy, threads: 2, requestedIterationsPerRun }));
    }
    records.push(aggregateAcceptedRecord({ profile, profileInput: input, scenario, build,
      policy: acceptancePolicy, profileSha256: input.profileSha256,
      requestedIterationsPerRun, runs }));
  }
  const manifest = { schemaVersion: 2, activeBuildId: builds[1].buildId, builds,
    scenarios, acceptancePolicy, curationPolicies: [], profiles: [profile] };
  const weights = { records, methodology: { auditArtifacts: {
    directories: Object.fromEntries(builds.map((build) => [build.buildId,
      { directory: build.auditDirectory, compression: build.compression }])),
    profiles: 2, reports: 4,
  } } };

  assert.deepEqual(await validateSimcAuditArtifacts(weights, manifest, tempRoot),
    { profiles: 2, reports: 4 });
  assert.equal(weights.records[0].requestedIterationsPerRun, undefined);
  assert.equal(weights.records[1].requestedIterationsPerRun, 2000);
  const mismatchedIterations = clone(weights);
  mismatchedIterations.records[0].requestedIterationsPerRun = 2000;
  await assert.rejects(validateSimcAuditArtifacts(mismatchedIterations, manifest, tempRoot),
    /outside the requested worker range/);
  const mismatchedSource = clone(weights);
  mismatchedSource.records[0].sourceProfileName = "Diabolist";
  await assert.rejects(validateSimcAuditArtifacts(mismatchedSource, manifest, tempRoot),
    /profile artifact does not match the run manifest/);
  const mismatchedItemDatabase = clone(weights);
  mismatchedItemDatabase.records[1].itemDbSource = "local";
  await assert.rejects(validateSimcAuditArtifacts(mismatchedItemDatabase, manifest, tempRoot),
    /profile artifact does not match the run manifest/);
});

test("validation rejects incomplete data and curated-source drift", async () => {
  const valid = await allValidatedData();
  const mutations = [
    ["missing sheet", /item-level sheet/, (data) => { data.sheet = null; }],
    ["missing armor", /invalid armor type/, (data) => { data.specs.specs[0].armor = null; }],
    ["wrong but valid armor", /invalid armor type/, (data) => {
      data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Blood Death Knight").armor = "Cloth";
    }],
    ["stat profile drift", /generated stat profile drifted/, (data) => {
      const shadow = data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Shadow Priest");
      shadow.statPriority.secondaries = ["Vers", "Crit", "Haste", "Mast"];
    }],
    ["weapon source drift", /generated weapon loadouts drifted/, (data) => {
      data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Arms Warrior").weaponLoadouts = [];
    }],
    ["deleted contextual profile source", /contextual-profile roster/, (data) => {
      delete data.statOverrides.overrides["Shadow Priest"];
    }],
    ["reviewed flat-priority drift", /reviewed baseline/, (data) => {
      data.statBaseline.priorities["Frost Mage"].secondaries = ["Vers", "Haste", "Crit", "Mast"];
    }],
    ["missing trinket eligibility", /lacks explicit eligibility/, (data) => {
      delete data.itemEligibility.items["193762"];
    }],
    ["missing primary-bearing trinket rule", /trinket-eligibility roster/, (data) => {
      delete data.itemEligibility.items["158368"];
    }],
    ["missing unique metadata", /lacks unique-equipped metadata/, (data) => {
      delete data.raid.bosses[0].items[0].uniqueEquipped;
    }],
    ["empty dungeon", /no dungeon items/, (data) => { data.dungeons.dungeons[0].items = []; }],
    ["key-level ladder drift", /key-level ladder changed/, (data) => {
      data.dungeons.keyLevels[0].end = 999;
    }],
    ["reduced sheet checks", /sheet validation is incomplete/, (data) => {
      data.sheet.validation.total = 1;
      data.sheet.validation.confirmed = 1;
    }],
    ["lost provisional marker", /provisional-source markers/, (data) => {
      data.sheet.sheetOnlyKeys = data.sheet.sheetOnlyKeys.filter((key) => key !== "raidVault");
    }],
    ["leftover rating keys", /unexpected rating keys/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items).find((candidate) => candidate.secondaries.length);
      item.secondaries = [];
    }],
    ["missing armor item type", /lacks the armor type/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items).find((candidate) => candidate.slot === "Head");
      item.type = null;
    }],
    ["invalid item primary", /invalid primary-stat label/, (data) => {
      data.raid.bosses[0].items.find((item) => item.slot).primary = "Spirit";
    }],
    ["unexplained slotless raid item", /unexplained slotless raid item/, (data) => {
      data.raid.bosses[0].items.find((item) => item.slot).slot = null;
    }],
    ["catalyst slot drift", /catalyst slot policy/, (data) => {
      data.catalyst.setBonusSlots = data.catalyst.setBonusSlots.filter((slot) => slot !== "Head");
    }],
    ["direct tier stat loss", /invalid direct-tier stats/, (data) => {
      data.tier.sets[0].items[0].secondaries.pop();
    }],
    ["direct tier valid-pair drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.tier.sets[0].items[0];
      item.secondaries = ["Haste", "Vers"];
      item.secondaryRatings = { Haste: 80, Vers: 121 };
    }],
    ["direct tier rating drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.tier.sets[0].items[0];
      item.secondaryRatings = { ...item.secondaryRatings, Crit: 1, Mast: 999 };
    }],
    ["catalyst base slot swap", /Catalyst fingerprint/, (data) => {
      const items = data.raid.bosses.flatMap((boss) => boss.items);
      items.find((item) => item.id === "268236").slot = "Waist";
      items.find((item) => item.id === "268257").slot = "Legs";
    }],
    ["catalyst effect drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items)
        .find((candidate) => candidate.id === "271874");
      item.effect = "Unrelated effect.";
    }],
    ["catalyst secondary effect drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items)
        .find((candidate) => candidate.id === "271874");
      item.effects.push({ kind: "Equip", text: "Unreviewed second effect." });
    }],
    ["catalyst source substitution", /direct sources/, (data) => {
      data.catalyst.sources.blizzardPatchNotes = "https://example.com/not-authoritative";
    }],
    ["catalyst preservation drift", /preservation policy/, (data) => {
      data.catalyst.preservation.sockets = "guaranteed";
    }],
    ["catalyst charge unlock drift", /charge policy/, (data) => {
      data.catalyst.chargeSystem.catalystUnbound.scope = "account";
    }],
    ["stable allocation drift", /invalid stable secondary allocation/, (data) => {
      const entry = data.catalystAllocations.items["271555"];
      entry.allocations.Crit = 1;
    }],
    ["balanced allocation drift", /allocation values drifted/, (data) => {
      const entry = data.catalystAllocations.items["271555"];
      entry.allocations.Crit += 100;
      entry.allocations.Mast -= 100;
    }],
    ["SimC stale manifest coverage", /coverage summary is stale/, (data) => {
      data.simcManifest.coverage.acceptedEligibleSpecs += 1;
    }],
    ["SimC non-accepted spec missing reason", /non-accepted status lacks a reason/, (data) => {
      delete data.simcManifest.specs.find((spec) => spec.status !== "accepted").reason;
    }],
    ["SimC accepted spec missing a visible guide mapping",
      /accepted status lacks every visible guide profile mapping/, (data) => {
        data.simcManifest.profiles.find((profile) => profile.profileId === "priest-shadow-archon")
          .status = "rejected";
      }],
    ["SimC selection omitted a scenario", /invalid profile warlock-destruction-general/, (data) => {
      data.simcManifest.profiles.find((profile) => profile.selectionEvidence)
        .selectionEvidence.scenarios.pop();
    }],
    ["SimC selection chose the lower-DPS actor", /invalid profile warlock-destruction-general/, (data) => {
      const scenario = data.simcManifest.profiles.find((profile) => profile.selectionEvidence)
        .selectionEvidence.scenarios[0];
      scenario.selectedSourceProfileName = scenario.candidates[1].sourceProfileName;
    }],
    ["SimC selection has a tied winner", /invalid profile warlock-destruction-general/, (data) => {
      const candidates = data.simcManifest.profiles.find((profile) => profile.selectionEvidence)
        .selectionEvidence.scenarios[0].candidates;
      candidates[1].baselineDps = candidates[0].baselineDps;
    }],
    ["SimC selection reused a candidate", /invalid profile warlock-destruction-general/, (data) => {
      const candidates = data.simcManifest.profiles.find((profile) => profile.selectionEvidence)
        .selectionEvidence.scenarios[0].candidates;
      candidates.push(clone(candidates[0]));
    }],
    ["SimC selection candidate source drift", /invalid profile warlock-destruction-general/, (data) => {
      data.simcManifest.profiles.find((profile) => profile.selectionEvidence)
        .selectionEvidence.scenarios[0].candidates[1].generatorSource = "https://example.com/profile.simc";
    }],
    ["SimC selection mixed simulator builds", /invalid profile warlock-destruction-general/, (data) => {
      const profile = data.simcManifest.profiles.find((entry) => entry.selectionEvidence);
      const candidate = profile.selectionEvidence.scenarios[0].candidates[1];
      const otherBuild = data.simcManifest.builds.find((build) => build.buildId === "simc-mid2-229259b");
      candidate.buildId = otherBuild.buildId;
      candidate.generatorSource = `https://github.com/simulationcraft/simc/blob/${otherBuild.commit}/profiles/generators/MID2/MID2_Generate_Warlock.simc`;
    }],
    ["SimC selection enabled scale factors", /invalid profile warlock-destruction-general/, (data) => {
      data.simcManifest.profiles.find((profile) => profile.selectionEvidence)
        .selectionEvidence.settings.calculateScaleFactors = true;
    }],
    ["SimC stale selection artifact count", /selection-artifact count/, (data) => {
      data.simcWeights.methodology.auditArtifacts.selections -= 1;
    }],
    ["SimC stable profile ID mismatch", /spec\/profile does not match the run manifest/, (data) => {
      ensureAcceptedSimcRecord(data).profileId = "priest-shadow-archon";
    }],
    ["SimC unknown profile", /spec\/profile does not match/, (data) => {
      ensureAcceptedSimcRecord(data).profile = "Unknown Shadow profile";
    }],
    ["SimC duplicate scenario", /duplicate scenario record/, (data) => {
      const record = ensureAcceptedSimcRecord(data);
      data.simcWeights.records.push(clone(record));
    }],
    ["SimC missing weight", /invalid published weights/, (data) => {
      delete ensureAcceptedSimcRecord(data).weights.Vers;
    }],
    ["SimC missing weights object", /invalid published weights/, (data) => {
      delete ensureAcceptedSimcRecord(data).weights;
    }],
    ["SimC malformed weight", /invalid published weights/, (data) => {
      ensureAcceptedSimcRecord(data).weights.Crit = Number.NaN;
    }],
    ["SimC published mean drift", /published Crit weight does not match/, (data) => {
      ensureAcceptedSimcRecord(data).weights.Crit += 0.1;
    }],
    ["SimC claimed stability drift", /published stability does not match/, (data) => {
      ensureAcceptedSimcRecord(data).maxRelativeDrift = 0;
    }],
    ["SimC missing baseline DPS drift", /invalid baseline DPS stability/, (data) => {
      delete ensureAcceptedSimcRecord(data).baselineDpsRelativeDrift;
    }],
    ["SimC incomplete accepted matrix", /accepted reference matrix/, (data) => {
      data.simcWeights.records.pop();
    }],
    ["SimC accepted record with one run", /exactly 2 runs/, (data) => {
      ensureAcceptedSimcRecord(data).runs.pop();
    }],
    ["SimC iterations exceed their worker range", /invalid accepted run/, (data) => {
      const run = ensureAcceptedSimcRecord(data).runs[0];
      run.iterations = data.simcManifest.acceptancePolicy.requestedIterationsPerRun + run.threads;
    }],
    ["SimC non-canonical iteration override", /invalid requested iteration override/, (data) => {
      ensureAcceptedSimcRecord(data).requestedIterationsPerRun =
        data.simcManifest.acceptancePolicy.requestedIterationsPerRun;
    }],
    ["SimC run below its record iteration override", /invalid accepted run/, (data) => {
      const record = ensureAcceptedSimcRecord(data);
      record.requestedIterationsPerRun =
        data.simcManifest.acceptancePolicy.requestedIterationsPerRun + 25000;
      record.runs[0].iterations = record.requestedIterationsPerRun - 1;
    }],
    ["SimC excessive run drift", /stability threshold/, (data) => {
      ensureAcceptedSimcRecord(data).maxRelativeDrift = 0.051;
    }],
    ["SimC bad provenance", /simulation provenance/, (data) => {
      ensureAcceptedSimcRecord(data).generatorSource = "http://example.com/profile.simc";
    }],
    ["SimC top-level source substitution", /reviewed source/, (data) => {
      data.simcWeights.source = "https://example.com/not-simc";
    }],
    ["SimC audit directory substitution", /audit-artifact policy/, (data) => {
      const directories = data.simcWeights.methodology.auditArtifacts.directories;
      directories[Object.keys(directories)[0]].directory = "data/simc-audit/unreviewed";
    }],
    ["SimC profile digest substitution", /simulation provenance/, (data) => {
      ensureAcceptedSimcRecord(data).profileSha256 = "a".repeat(64);
    }],
    ["SimC profile filename substitution", /simulation provenance/, (data) => {
      ensureAcceptedSimcRecord(data).profileFile = "MID2_Priest_Shadow_Archon.simc";
    }],
    ["SimC simulated timestamp drift", /simulation provenance/, (data) => {
      ensureAcceptedSimcRecord(data).simulatedAt = "2026-08-03T03:00:00Z";
    }],
    ["SimC repeated seed", /repeated RNG seed/, (data) => {
      const record = ensureAcceptedSimcRecord(data);
      record.runs[1].seed = record.runs[0].seed;
    }],
  ];
  for (const [label, expected, mutate] of mutations) {
    const data = clone(valid);
    mutate(data);
    assert.throws(() => validateData(data), expected, label);
  }
});

test("validation accepts a higher per-record SimC iteration contract", async () => {
  const data = await allValidatedData();
  const record = ensureAcceptedSimcRecord(data);
  const minimum = data.simcManifest.acceptancePolicy.requestedIterationsPerRun;
  record.requestedIterationsPerRun = minimum + 25000;
  for (const run of record.runs)
    run.iterations = record.requestedIterationsPerRun + (run.iterations - minimum);
  assert.doesNotThrow(() => validateData(data));
});

test("stat profiles and explicit weapon edge cases remain correct", async () => {
  const [specDoc, raid, dungeons] = await Promise.all([
    json("data/specs.json"), json("data/raid-items.json"), json("data/dungeon-items.json"),
  ]);
  const findSpec = (key) => specDoc.specs.find((spec) => `${spec.spec} ${spec.class}` === key);
  const items = [...raid.bosses, ...dungeons.dungeons].flatMap((group) => group.items);
  const weapons = items.filter((item) => [
    "Main Hand", "One-Hand", "Two-Hand", "Off Hand", "Held In Off-hand", "Ranged",
  ].includes(item.slot));

  const shadow = findSpec("Shadow Priest");
  assert.deepEqual(shadow.statPriorityVariants.map((profile) => profile.secondaries), [
    ["Haste", "Mast", "Crit", "Vers"],
    ["Mast", "Crit", "Haste", "Vers"],
  ]);

  const frost = findSpec("Frost Death Knight");
  const spiritcudgel = items.find((item) => item.name === "Malevolent Spiritcudgel");
  assert.ok(spiritcudgel);
  assert.equal(weaponMatches(frost, spiritcudgel), false);

  for (const key of ["Havoc Demon Hunter", "Vengeance Demon Hunter"])
    assert.equal(findSpec(key).weaponLoadouts.some((loadout) =>
      Object.values(loadout.hands).some((hand) => (hand.itemTypes || []).includes("Dagger"))), false);

  const devourer = findSpec("Devourer Demon Hunter");
  assert.ok(weapons.some((item) => item.type === "Dagger" && weaponMatches(devourer, item)));

  const survival = findSpec("Survival Hunter");
  assert.equal(survival.weaponLoadouts.some((loadout) =>
    Object.values(loadout.hands).some((hand) => (hand.itemTypes || []).includes("Fist Weapon"))), false);

  const assassination = findSpec("Assassination Rogue").weaponLoadouts[0];
  assert.deepEqual(assassination.hands.mainHand.itemTypes, ["Dagger"]);
  assert.deepEqual(assassination.hands.offHand.itemTypes, ["Dagger"]);

  const outlaw = findSpec("Outlaw Rogue").weaponLoadouts[0];
  assert.equal(outlaw.hands.mainHand.itemTypes.includes("Dagger"), false);
  assert.equal(outlaw.hands.offHand.itemTypes.includes("Dagger"), true);

  const subtlety = findSpec("Subtlety Rogue").weaponLoadouts[0];
  assert.deepEqual(subtlety.hands.mainHand.itemTypes, ["Dagger"]);
  assert.ok(subtlety.hands.offHand.itemTypes.length > 1);

  const enhancement = findSpec("Enhancement Shaman");
  assert.equal(enhancement.weaponLoadouts[0].hands.mainHand.itemTypes.includes("Dagger"), false);

  const windwalkerTwoHand = findSpec("Windwalker Monk").weaponLoadouts
    .find((loadout) => loadout.id === "two-hand-staff-polearm");
  assert.deepEqual(windwalkerTwoHand.hands.mainHand.itemTypes, ["Staff", "Polearm"]);

  const mistweaver = findSpec("Mistweaver Monk");
  assert.ok(weapons.some((item) => item.slot === "Held In Off-hand"
    && weaponMatches(mistweaver, item, "offHand")));

  const fury = findSpec("Fury Warrior").weaponLoadouts[0];
  assert.deepEqual(fury.hands.mainHand.inventorySlots, ["Two-Hand"]);
  assert.deepEqual(fury.hands.offHand.inventorySlots, ["Two-Hand"]);
});

test("self-contained output embeds current data and valid browser JavaScript", async () => {
  const [html, template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, simcManifest, simcWeights, icons] = await Promise.all([
    readFile(fromRoot("wow-s2-gearing.html"), "utf8"),
    readFile(fromRoot("src/app.template.html"), "utf8"),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"), json("data/simc-run-manifest.json"),
    json("data/simc-reference-weights.json"),
    json("data/icons.json"),
  ]);
  const embedded = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(embedded);
  assert.deepEqual(JSON.parse(embedded[1]), {
    raid, specs, dungeons, sheet, itemEligibility, tier, catalyst, catalystAllocations,
    simcManifest, simcWeights, icons: icons.icons,
  });

  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.doesNotThrow(() => new Function(scripts.at(-1)[1]));
  assert.match(template, /filter\(it => maxAttainable\(it\) > threshold\)/);
  assert.match(template, /Trinkets are unranked/);
  assert.match(template, /role="tablist"/);
  assert.match(template, /<label for="spec">Specialization<\/label>/);
  assert.match(template, /<label for="scenario">Encounter<\/label>/);
  assert.match(template, /class="skip-link" href="#main-content"/);
  assert.match(template, /SimC reference \(when available\)/);
  assert.match(template, /Custom decimal weights/);
  assert.match(template, /@media \(max-width:640px\)/);
  assert.doesNotMatch(template, /main_hand:'One-Hand'/);
});

test("client app switches scenario-specific SimC profiles and labels their provenance", async () => {
  const [template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, simcManifest, simcWeights, icons] = await Promise.all([
    readFile(fromRoot("src/app.template.html"), "utf8"),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"), json("data/simc-run-manifest.json"),
    json("data/simc-reference-weights.json"),
    json("data/icons.json"),
  ]);
  const data = { raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, simcManifest, simcWeights, icons: icons.icons };
  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const appSource = `${scripts.at(-1)[1]}\nreturn { current: () => CUR, scoreFor: id => scoreItem(CUR, BY_ID[id]), weights: () => activeWeights(CUR), reference: () => activeReferenceRecord(), coverage: () => manifestSpecFor(CUR) };`;
  const startClient = (clientData) => {
    const document = fakeDocument(clientData);
    const app = new Function("document", "innerWidth", "innerHeight", appSource)(document, 1600, 900);
    return { document, app };
  };
  const { document, app } = startClient(data);
  const acceptedReferences = simcWeights.records.filter((record) => record.status === "accepted");
  assert.equal(acceptedReferences.length, simcManifest.coverage.acceptedRecords,
    "accepted SimC reference matrix must be populated");
  const referenceFor = (profileName, scenario) => {
    const profile = simcManifest.profiles.find((entry) => entry.guideProfileName === profileName);
    const input = Array.isArray(profile.scenarioInputs)
      ? profile.scenarioInputs.find((entry) => entry.scenarioId === scenario) : profile;
    return acceptedReferences.find((record) => record.profileId === profile.profileId
      && record.buildId === input.buildId && record.scenario === scenario);
  };
  const specSelect = document.ids.get("spec");
  const scoringMode = document.ids.get("scoring-mode");
  const scenarioSelect = document.ids.get("scenario");
  const assertProfileDisposition = (value, acceptedSourcePattern) => {
    if (value) {
      specSelect.value = value;
      specSelect.listeners.change();
    }
    const coverage = app.coverage();
    assert.ok(["accepted", "pending"].includes(coverage.status));
    if (coverage.status === "accepted") {
      assert.equal(scoringMode.value, "reference");
      assert.ok(app.reference());
      assert.match(document.ids.get("scoring-summary").innerHTML, acceptedSourcePattern);
    } else {
      assert.equal(scoringMode.value, "priority");
      assert.equal(app.reference(), null);
      assert.match(document.ids.get("scoring-summary").innerHTML,
        /reviewed SimulationCraft profile is ready for its planned runs/);
      assert.match(document.ids.get("scoring-summary").innerHTML, /Rough guide-order coefficients/);
    }
    return coverage;
  };

  assert.equal(app.current().spec, "Frost");
  assert.match(document.ids.get("bis").innerHTML, /Weapon setup:/);
  assertProfileDisposition(null, /Curated same-gear profile/);

  specSelect.value = "Priest|Shadow";
  specSelect.listeners.change();
  const profileSelect = document.ids.get("profile");
  assert.deepEqual(profileSelect.children.map((option) => option.value), [
    "Voidweaver (single- and multi-target)", "Archon (single- and multi-target)",
  ]);
  assert.equal(scoringMode.value, "reference");
  assert.deepEqual(scenarioSelect.children.map((option) => option.value), ["raid-st", "aoe-5t"]);
  assert.deepEqual(scenarioSelect.children.map((option) => option.textContent),
    simcManifest.scenarios.map((scenario) => scenario.label));
  let activeReference = referenceFor("Voidweaver (single- and multi-target)", "raid-st");
  assert.ok(activeReference);
  assert.deepEqual(app.reference(), activeReference);
  assert.deepEqual(app.weights(), activeReference.weights);
  assert.ok(Math.abs(app.scoreFor("271874") - activeReference.weights.Mast) < 1e-12);

  scenarioSelect.value = "aoe-5t";
  scenarioSelect.listeners.change();
  activeReference = referenceFor("Voidweaver (single- and multi-target)", "aoe-5t");
  assert.deepEqual(app.reference(), activeReference);
  assert.deepEqual(app.weights(), activeReference.weights);

  profileSelect.value = "Archon (single- and multi-target)";
  profileSelect.listeners.change();
  activeReference = referenceFor("Archon (single- and multi-target)", "aoe-5t");
  assert.deepEqual(app.reference(), activeReference);
  assert.deepEqual(app.weights(), activeReference.weights);
  assert.ok(Math.abs(app.scoreFor("271874") - activeReference.weights.Mast) < 1e-12);
  assert.match(document.ids.get("scoring-summary").innerHTML, new RegExp(activeReference.simcRevision));
  assert.match(document.ids.get("bis-note").innerHTML, /Archon \(single- and multi-target\)/);

  specSelect.value = "Warlock|Destruction";
  specSelect.listeners.change();
  assert.equal(document.ids.get("profile").value, "General");
  assert.equal(scoringMode.value, "reference");
  scenarioSelect.value = "raid-st";
  scenarioSelect.listeners.change();
  activeReference = referenceFor("General", "raid-st");
  assert.deepEqual(app.reference(), activeReference);
  assert.match(document.ids.get("scoring-summary").innerHTML,
    /MID2_Warlock_Destruction_Hellcaller/);
  assert.match(document.ids.get("scoring-summary").innerHTML, /Official SimC output/);
  assert.match(document.ids.get("scoring-summary").innerHTML, /upstream actor\/APL generator/);
  scenarioSelect.value = "aoe-5t";
  scenarioSelect.listeners.change();
  activeReference = referenceFor("General", "aoe-5t");
  assert.deepEqual(app.reference(), activeReference);
  assert.match(document.ids.get("scoring-summary").innerHTML,
    /MID2_Warlock_Destruction_Diabolist/);

  const curatedData = clone(data);
  const curatedProfile = curatedData.simcManifest.profiles.find((entry) =>
    entry.profileId === "warlock-destruction-general");
  const curatedInput = curatedProfile.scenarioInputs.find((entry) => entry.scenarioId === "raid-st");
  const curatedRecord = curatedData.simcWeights.records.find((entry) =>
    entry.profileId === curatedProfile.profileId && entry.scenario === "raid-st");
  const curatedProvenance = {
    sourceMode: "curated-same-gear",
    generatorActorName: "MID2_Warlock_Destruction_Upstream",
    generatorSha256: "6".repeat(64),
    talentSource: "https://www.wowhead.com/ptr/guide/classes/warlock/destruction/talent-builds-pve-dps",
    talentSourceAsOf: "2026-08-04",
    curationReviewedAt: "2026-08-04",
    curationPolicyId: "midnight-s2-dps-shell-v1",
    gearSetId: "warlock-destruction-reference-shell",
    gearPlanSha256: "7".repeat(64),
  };
  Object.assign(curatedInput, curatedProvenance);
  Object.assign(curatedRecord, curatedProvenance);
  const curatedClient = startClient(curatedData);
  curatedClient.document.ids.get("spec").value = "Warlock|Destruction";
  curatedClient.document.ids.get("spec").listeners.change();
  curatedClient.document.ids.get("scenario").value = "raid-st";
  curatedClient.document.ids.get("scenario").listeners.change();
  const curatedSummary = curatedClient.document.ids.get("scoring-summary").innerHTML;
  assert.match(curatedSummary, /Curated same-gear profile/);
  assert.match(curatedSummary, /upstream actor\/APL generator/);
  assert.match(curatedSummary, /talent source/);
  assert.match(curatedSummary, /as of <b>2026-08-04<\/b>/);

  const rejectedFirstData = clone(data);
  const rejectedProfile = clone(rejectedFirstData.simcManifest.profiles.find((profile) =>
    profile.guideProfileName === "Voidweaver (single- and multi-target)"));
  Object.assign(rejectedProfile, { profileId: "priest-shadow-rejected", name: "Rejected old profile",
    status: "rejected" });
  rejectedFirstData.simcManifest.profiles.unshift(rejectedProfile);
  rejectedFirstData.simcManifest.specs.find((spec) => spec.specKey === "Shadow Priest")
    .profileIds.unshift(rejectedProfile.profileId);
  const rejectedFirstClient = startClient(rejectedFirstData);
  rejectedFirstClient.document.ids.get("spec").value = "Priest|Shadow";
  rejectedFirstClient.document.ids.get("spec").listeners.change();
  assert.equal(rejectedFirstClient.app.reference().recordId, "priest-shadow-voidweaver-raid-st");

  const readyProfileData = clone(data);
  const readyGuideName = "Reviewed profile awaiting runs";
  const readyGuideSpec = readyProfileData.specs.specs.find((spec) =>
    `${spec.spec} ${spec.class}` === "Shadow Priest");
  readyGuideSpec.statPriorityVariants.push({
    ...clone(readyGuideSpec.statPriorityVariants[0]), name: readyGuideName,
  });
  const readyManifestProfile = clone(readyProfileData.simcManifest.profiles.find((profile) =>
    profile.guideProfileName === "Voidweaver (single- and multi-target)"));
  Object.assign(readyManifestProfile, {
    profileId: "priest-shadow-reviewed-ready",
    name: readyGuideName,
    guideProfileName: readyGuideName,
    status: "ready",
  });
  readyProfileData.simcManifest.profiles.push(readyManifestProfile);
  readyProfileData.simcManifest.specs.find((spec) => spec.specKey === "Shadow Priest")
    .profileIds.push(readyManifestProfile.profileId);
  const readyProfileClient = startClient(readyProfileData);
  readyProfileClient.document.ids.get("spec").value = "Priest|Shadow";
  readyProfileClient.document.ids.get("spec").listeners.change();
  readyProfileClient.document.ids.get("profile").value = readyGuideName;
  readyProfileClient.document.ids.get("profile").listeners.change();
  assert.equal(readyProfileClient.app.reference(), null);
  assert.match(readyProfileClient.document.ids.get("scoring-summary").innerHTML,
    /reviewed SimulationCraft profile is ready for its planned runs/);
  assert.match(readyProfileClient.document.ids.get("scoring-summary").innerHTML,
    /complete encounter matrix passes validation and is promoted/);

  const mismatchedData = clone(data);
  mismatchedData.simcWeights.records.find((record) =>
    record.recordId === "priest-shadow-voidweaver-raid-st").buildId = "simc-mid2-mismatched";
  const mismatchedClient = startClient(mismatchedData);
  mismatchedClient.document.ids.get("spec").value = "Priest|Shadow";
  mismatchedClient.document.ids.get("spec").listeners.change();
  assert.equal(mismatchedClient.app.reference(), null);
  assert.match(mismatchedClient.document.ids.get("scoring-summary").innerHTML, /no ID-exact record matches/);
  const voidweaverGuide = specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Shadow Priest")
    .statPriorityVariants.find((profile) => profile.name === "Voidweaver (single- and multi-target)");
  assert.deepEqual(mismatchedClient.app.weights(), Object.fromEntries(voidweaverGuide.secondaries.map((stat, index) =>
    [stat, [1, 0.75, 0.5, 0.25][index]])));

  specSelect.value = "Priest|Shadow";
  specSelect.listeners.change();
  profileSelect.value = "Archon (single- and multi-target)";
  profileSelect.listeners.change();
  const tierHtml = document.ids.get("tier").innerHTML;
  assert.match(tierHtml, /Season 2 Catalyst tier plan/);
  assert.match(tierHtml, /Charge planning \(PTR\)/);
  assert.match(tierHtml, /first 4-piece class-set bonus/);
  assert.equal((tierHtml.match(/data-catalyst-base="true"/g) || []).length, 22);
  assert.equal((tierHtml.match(/data-direct-tier="true"/g) || []).length, 5);
  assert.match(tierHtml, /Cosmic Penitent's Truesight/);
  assert.match(tierHtml, /Venomkeeper's Horrific Cowl/);
  assert.match(tierHtml, /Mapped Venomcursed item/);
  assert.match(tierHtml, /Crit 29%\/Haste 71%/);
  assert.match(tierHtml, /Slumbering Coil Curio/);
  assert.match(document.ids.get("bis").innerHTML, /Special-effect item shown outside the secondary-stat top five/);
  assert.match(document.ids.get("bis").innerHTML, /Consume the power of Hex Lord's Doom/);
  assert.doesNotMatch(document.ids.get("bis").innerHTML,
    /Blazebinder's Hoof|Preternatural Antivenom|Idol of the Howling Nexus/);
  assert.match(document.ids.get("src").innerHTML, /Hands tier token/);

  scoringMode.value = "custom";
  scoringMode.listeners.change();
  assert.match(document.ids.get("scoring-summary").innerHTML, /waiting for all four/);
  assert.equal(document.ids.get("weight-editor").hidden, false);
  assert.equal(profileSelect.disabled, false);
  const archonProfile = specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Shadow Priest")
    .statPriorityVariants.find((profile) => profile.name === "Archon (single- and multi-target)");
  const guideWeights = Object.fromEntries(archonProfile.secondaries.map((stat, index) =>
    [stat, [1, 0.75, 0.5, 0.25][index]]));
  assert.deepEqual(app.weights(), guideWeights);
  assert.equal(app.scoreFor("271874"), guideWeights.Mast);
  document.ids.get("weight-crit").value = "1.12";
  document.ids.get("weight-haste").value = "0.99";
  document.ids.get("weight-mast").value = "1.25";
  document.ids.get("weight-vers").value = "0.40";
  document.ids.get("weight-mast").listeners.input();
  assert.match(document.ids.get("scoring-summary").innerHTML, /Custom weights supplied by you/);
  assert.match(document.ids.get("scoring-summary").innerHTML, /Mastery <strong>1\.250<\/strong>/);
  assert.equal(app.scoreFor("271874"), 1.25);
  assert.match(document.ids.get("tier-note").innerHTML, /your custom weights/);

  assertProfileDisposition("Demon Hunter|Devourer", /Curated same-gear profile/);
  assert.match(document.ids.get("bis").innerHTML, /Allowed types:/);
  assert.match(document.ids.get("bis").innerHTML, /official source 1/);
  const uniqueWeaponData = clone(data);
  for (const group of [...uniqueWeaponData.raid.bosses, ...uniqueWeaponData.dungeons.dungeons])
    for (const item of group.items)
      if (["Main Hand", "One-Hand"].includes(item.slot)) item.uniqueEquipped = true;
  const uniqueWeaponClient = startClient(uniqueWeaponData);
  uniqueWeaponClient.document.ids.get("spec").value = "Demon Hunter|Devourer";
  uniqueWeaponClient.document.ids.get("spec").listeners.change();
  assert.match(uniqueWeaponClient.document.ids.get("bis").innerHTML, /Alternative hand only:/);

  for (const [value, acceptedSourcePattern] of [
    ["Death Knight|Unholy", /Official SimC output/],
    ["Warlock|Affliction", /Curated same-gear profile/],
    ["Warlock|Demonology", /Curated same-gear profile/],
  ]) assertProfileDisposition(value, acceptedSourcePattern);

  specSelect.value = "Evoker|Augmentation";
  specSelect.listeners.change();
  assert.equal(app.coverage().status, "unsupported");
  assert.match(document.ids.get("scoring-summary").innerHTML, /SimulationCraft reference unsupported/);
  assert.match(document.ids.get("scoring-summary").innerHTML, /party contribution/);

  specSelect.value = "Priest|Discipline";
  specSelect.listeners.change();
  assert.equal(app.coverage().status, "deferred");
  assert.match(document.ids.get("scoring-summary").innerHTML, /SimulationCraft reference deferred/);
  assert.match(document.ids.get("scoring-summary").innerHTML, /healing-output reference methodology/);

  specSelect.value = "Warrior|Arms";
  specSelect.listeners.change();
  document.ids.get("simc").value = [
    "head=high_level_helm,id=999999,ilevel=318",
    "main_hand=caustic_keeper_crusher,id=268198,ilevel=292",
  ].join("\n");
  document.ids.get("parse").listeners.click();
  const upgradeHtml = document.ids.get("up").innerHTML;
  assert.doesNotMatch(upgradeHtml, /no Season 2 item maps to this slot/);
  assert.match(upgradeHtml, /Caustic Keeper-Crusher|Malignant Toothed Edge|Maze-roa/);
  assert.match(upgradeHtml, /firstup/);

  specSelect.value = "Death Knight|Blood";
  specSelect.listeners.change();
  document.ids.get("simc").value = "back=current_cloak,id=999998,ilevel=330";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Silken Voodoo Drape/);
  assert.doesNotMatch(document.ids.get("up").innerHTML,
    /Speakeasy Shroud|Bloodthorn Burnous|Cloak of the Restless Tribes|Fireproof Drape/);

  specSelect.value = "Priest|Shadow";
  specSelect.listeners.change();
  document.ids.get("simc").value = "head=venomkeepers_horrific_cowl,id=271874,ilevel=344";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Catalyst conversion option/);
  assert.match(document.ids.get("up").innerHTML, /Mast 100% secondary allocation/);

  document.ids.get("simc").value = "head=cosmic_penitents_truesight,id=271555,ilevel=334";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Already class-set tier/);

  document.ids.get("simc").value = "head=legacy_mplus_head,id=239047,ilevel=292";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /data-catalyst-action="verify"/);
  assert.match(document.ids.get("up").innerHTML, /item ID alone does not prove/);

  document.ids.get("simc").value = "head=warrior_tier,id=271456,ilevel=334";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Selected-spec mismatch/);
  assert.doesNotMatch(document.ids.get("up").innerHTML, /Already class-set tier/);

  document.ids.get("simc").value = "head=plate_raid_base,id=268229,ilevel=334";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Selected-spec mismatch/);
  assert.doesNotMatch(document.ids.get("up").innerHTML, /Catalyst conversion option/);

  document.ids.get("simc").value = "head=unknown_current_head,id=999996,ilevel=330";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /data-direct-tier-acquisition="true"/);
  assert.match(document.ids.get("up").innerHTML, /Cosmic Penitent's Truesight/);
  assert.match(document.ids.get("up").innerHTML, /Standard slot token/);
  assert.match(document.ids.get("up").innerHTML, /Omni-tier token/);
  assert.match(document.ids.get("up").innerHTML,
    /data-tier-route="omni" data-max-ilvl="344"[\s\S]*?Mythic <b>344<\/b>/);

  document.ids.get("simc").value = "trinket1=current_trinket,id=999997,ilevel=292";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Trinkets are unranked/);
  assert.doesNotMatch(document.ids.get("up").innerHTML,
    /Blazebinder's Hoof|Preternatural Antivenom|Idol of the Howling Nexus/);

  specSelect.value = "Monk|Brewmaster";
  specSelect.listeners.change();
  profileSelect.value = "Offensive / damage";
  profileSelect.listeners.change();
  const brewmasterHtml = document.ids.get("tier").innerHTML;
  assert.ok(brewmasterHtml.indexOf('data-id="239033"') < brewmasterHtml.indexOf('data-id="193751"'));
});
