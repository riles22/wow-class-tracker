import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PINNED_UNHOLY_EVIDENCE,
  buildUnholyAdmissionDocuments,
  buildWorkStage,
  parseCli,
  verifyPinnedInventory,
} from "../src/admit-unholy-evidence.mjs";
import { deterministicSeed, sha256 } from "../src/run-simc-reference.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const clone = (value) => structuredClone(value);

async function currentDocuments() {
  return {
    manifest: JSON.parse(await readFile(join(ROOT, "data", "simc-run-manifest.json"), "utf8")),
    ledger: JSON.parse(await readFile(join(ROOT, "data", "simc-reference-weights.json"), "utf8")),
  };
}

function withoutUnholyAdmission(manifest) {
  const next = clone(manifest);
  next.profiles = next.profiles.filter((profile) =>
    profile.profileId !== "death-knight-unholy-general");
  const spec = next.specs.find((entry) => entry.specKey === "Unholy Death Knight");
  spec.profileIds = (spec.profileIds || []).filter((profileId) =>
    profileId !== "death-knight-unholy-general");
  spec.status = "pending";
  spec.reason = "legacy false blocker";
  return next;
}

test("reviewed inventory rejects missing or tampered bytes", () => {
  const reviewed = Buffer.from("reviewed evidence\n");
  const inventory = [{ sourceFile: "reviewed.json", resultSha256: sha256(reviewed) }];
  const files = new Map([["reviewed.json", reviewed]]);
  assert.equal(verifyPinnedInventory(files, inventory), true);

  const tampered = new Map([["reviewed.json", Buffer.from("tampered evidence\n")]]);
  assert.throws(() => verifyPinnedInventory(tampered, inventory), /SHA-256 .* does not match reviewed/);
  assert.throws(() => verifyPinnedInventory(new Map(), inventory), /missing reviewed.json/);
});

test("Unholy admission is idempotent, READY-only, and preserves accepted records", async () => {
  const { manifest: currentManifest, ledger } = await currentDocuments();
  const manifest = withoutUnholyAdmission(currentManifest);
  const acceptedBefore = JSON.stringify(ledger.records);
  const advisories = ["scale.txt: Warning: preserved for review"];
  const first = buildUnholyAdmissionDocuments(manifest, ledger, { advisories });
  const profile = first.profile;
  const spec = first.manifest.specs.find((entry) => entry.specKey === "Unholy Death Knight");

  assert.equal(profile.status, "ready");
  assert.equal(profile.selectionMode, "same-gear-dps");
  assert.deepEqual(profile.scenarioInputs.map((input) => input.sourceProfileName), [
    "MID2_Death_Knight_Unholy_Rider",
    "MID2_Death_Knight_Unholy_San'layn",
  ]);
  assert.ok(profile.scenarioInputs.every((input) => input.sourceMode === "official-output"));
  assert.match(profile.scenarioInputs[0].generatorSource,
    /MID2_Generate_Deathknight\.simc$/);
  assert.equal(profile.evidenceReview.generatorSha256,
    "18cea7509a2c20e6bb74f0862df1405e543079a516be97f304eac87403b765ec");
  assert.equal(profile.scenarioInputs[1].profileFile, "MID2_Death_Knight_Unholy_Sanlayn.simc");
  assert.ok(!profile.scenarioInputs[1].profileFile.includes("'"));
  assert.ok(profile.evidenceReview.advisories.some((notice) =>
    /Potion of Recklessness/.test(notice)));
  assert.ok(profile.evidenceReview.advisories.some((notice) =>
    /Rune of Unleashed Fire/.test(notice)));
  assert.ok(profile.evidenceReview.advisories.includes(advisories[0]));
  assert.deepEqual(spec.profileIds.filter((id) => id === profile.profileId), [profile.profileId]);
  assert.doesNotMatch(spec.reason, /army_ghoul action smoke/);
  assert.equal(JSON.stringify(first.ledger.records), acceptedBefore);

  const second = buildUnholyAdmissionDocuments(first.manifest, first.ledger, { advisories });
  assert.deepEqual(second.manifest, first.manifest);
  assert.deepEqual(second.ledger, first.ledger);

  const drifted = clone(first.manifest);
  drifted.profiles.find((entry) => entry.profileId === profile.profileId)
    .scenarioInputs[0].profileSha256 = "a".repeat(64);
  assert.throws(() => buildUnholyAdmissionDocuments(drifted, first.ledger, { advisories }),
    /already exists with different reviewed evidence/);
});

test("re-admission after promotion never downgrades accepted state", async () => {
  const { manifest: currentManifest, ledger } = await currentDocuments();
  const staged = buildUnholyAdmissionDocuments(withoutUnholyAdmission(currentManifest), ledger);
  const promotedManifest = clone(staged.manifest);
  promotedManifest.profiles.find((profile) =>
    profile.profileId === "death-knight-unholy-general").status = "accepted";
  const spec = promotedManifest.specs.find((entry) => entry.specKey === "Unholy Death Knight");
  spec.status = "accepted";
  delete spec.reason;

  const repeated = buildUnholyAdmissionDocuments(promotedManifest, staged.ledger);
  assert.equal(repeated.profile.status, "accepted");
  assert.equal(repeated.manifest.specs.find((entry) =>
    entry.specKey === "Unholy Death Knight").status, "accepted");
});

test("work-stage checkpoints match the ordinary runner contract", async () => {
  const { manifest: currentManifest, ledger } = await currentDocuments();
  const admitted = buildUnholyAdmissionDocuments(withoutUnholyAdmission(currentManifest), ledger);
  const parsedScaleReports = PINNED_UNHOLY_EVIDENCE.scaleReports.map((entry) => {
    const reportId = `death-knight-unholy-general-${entry.scenarioId}_r${entry.runNumber}`;
    return {
      ...entry,
      reportId,
      seed: deterministicSeed(`death-knight-unholy-general::${entry.scenarioId}`, entry.runNumber),
      bytes: Buffer.from(entry.sourceFile),
      parsed: { reportId, resultSha256: entry.resultSha256, timestamp: "2026-08-04T23:16:30Z" },
    };
  });
  const stages = buildWorkStage(admitted.manifest, admitted.ledger, { parsedScaleReports });

  assert.deepEqual(stages.map((stage) => stage.job.scenarioId), ["raid-st", "aoe-5t"]);
  assert.equal(stages[0].profile.profileFile, "MID2_Death_Knight_Unholy.simc");
  assert.equal(stages[1].profile.profileFile, "MID2_Death_Knight_Unholy_Sanlayn.simc");
  for (const stage of stages) {
    assert.match(stage.checkpoint.fingerprint, /^[a-f0-9]{64}$/);
    assert.equal(stage.checkpoint.threads, 2);
    assert.equal(stage.checkpoint.runs.length, 2);
    stage.checkpoint.runs.forEach((run, index) => {
      assert.equal(run.reportId,
        `death-knight-unholy-general-${stage.job.scenarioId}_r${index + 1}`);
      assert.equal(run.seed, deterministicSeed(stage.job.jobId, index + 1));
    });
  }
});

test("CLI requires an explicit evidence root and rejects unrelated options", () => {
  assert.deepEqual(parseCli(["admit", "--evidence-root", "C:\\reviewed"]), {
    command: "admit", "evidence-root": "C:\\reviewed",
  });
  assert.throws(() => parseCli(["admit"]), /requires --evidence-root/);
  assert.throws(() => parseCli(["admit", "--accept", "yes"]), /unknown option/);
});
