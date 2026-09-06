import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSpecSync, checkSpecSync, loadSpecSyncInputs, runSpecSync } from "../src/harvest-specs.mjs";

const clone = (v) => structuredClone(v);
const today = "2026-09-05";
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

test("local structural sync preserves all reviewed fallback and capability values", async () => {
  const inputs = await loadSpecSyncInputs();
  const generated = buildSpecSync(inputs, { checkedAt: today });
  const current = await readJson(new URL("../data/specs.json", import.meta.url));
  assert.deepEqual(generated.specs, current.specs);
  assert.equal(generated.specs.length, 40);
  assert.equal(generated.harvestedAt, inputs.baseline.reviewedAt);
  assert.equal(generated.legacyPriority.reviewedAt, inputs.baseline.reviewedAt);
  assert.equal(generated.structuralSync.checkedAt, today);
  assert.equal(generated.structuralSync.sources.armor.asOf, inputs.raid.harvestedAt);
  assert.equal(generated.structuralSync.sources.weapons.asOf,
    inputs.weapons.patchContexts["12.1-live"].asOf);
  assert.deepEqual(checkSpecSync(generated, inputs), {
    checkedAt: today, specs: 40, legacyReviewedAt: inputs.baseline.reviewedAt,
  });
  const nextDay = buildSpecSync(inputs, { checkedAt: "2026-09-06" });
  assert.deepEqual(nextDay.specs, generated.specs);
  assert.deepEqual(nextDay.legacyPriority, generated.legacyPriority);
  assert.deepEqual(nextDay.structuralSync.sources, generated.structuralSync.sources);
  assert.equal(nextDay.harvestedAt, generated.harvestedAt);
});

test("sync consumes current tier facts and ignores unrelated rating and metric changes", async () => {
  const inputs = await loadSpecSyncInputs();
  const before = buildSpecSync(inputs, { checkedAt: today });
  inputs.tracker[0].ratings = { raid: { "unit-test-source": "S" } };
  inputs.tracker[0].metrics = [{ source: "unit-test-source", value: 42 }];
  assert.deepEqual(buildSpecSync(inputs, { checkedAt: today }), before);
  inputs.tracker[0].tierSet = { set2: "Synthetic fixture text", set4: "Synthetic fixture text",
    asOf: "2026-09-04", source: "https://example.com/fixture" };
  assert.throws(() => checkSpecSync(before, inputs), /stale/);
  const after = buildSpecSync(inputs, { checkedAt: today });
  assert.deepEqual(after.specs[0].tierSet, inputs.tracker[0].tierSet);
  assert.notEqual(after.structuralSync.sources.tracker.digest, before.structuralSync.sources.tracker.digest);
  assert.equal(after.legacyPriority.baselineDigest, before.legacyPriority.baselineDigest);
  const tampered = clone(after);
  tampered.specs[0].weaponLoadouts = [];
  assert.throws(() => checkSpecSync(tampered, inputs), /stale/);
  tampered.specs = after.specs;
  tampered.structuralSync.sources.armor.asOf = today;
  assert.throws(() => checkSpecSync(tampered, inputs), /stale/);
});

test("sync refuses incomplete or conflicting reviewed inputs and invalid receipt dates", async () => {
  const inputs = await loadSpecSyncInputs();
  assert.throws(() => buildSpecSync(inputs, { checkedAt: "2026-02-30" }), /valid checkedAt/);
  const missing = clone(inputs);
  missing.tracker.pop();
  assert.throws(() => buildSpecSync(missing), /roster drift/);
  const duplicate = clone(inputs);
  duplicate.tracker[0] = duplicate.tracker[1];
  assert.throws(() => buildSpecSync(duplicate), /roster drift/);
  const badRole = clone(inputs);
  badRole.tracker[0].role = "Fighter";
  assert.throws(() => buildSpecSync(badRole), /invalid role/);
  const armor = clone(inputs);
  armor.raid.bosses[0].items.push({ id: 1, name: "Synthetic Forged Token", classes: ["Mage"] });
  assert.throws(() => buildSpecSync(armor), /conflicting tier-token armor/);
  const weapon = clone(inputs);
  weapon.weapons.specLoadouts["Blood Death Knight"].primaryStat = "Intellect";
  assert.throws(() => buildSpecSync(weapon), /invalid reviewed weapon/);
  const fallback = clone(inputs);
  fallback.baseline.priorities["Blood Death Knight"].secondaries.reverse();
  assert.throws(() => buildSpecSync(fallback), /contextual priority drifted/);
  const generated = buildSpecSync(inputs, { checkedAt: today });
  delete generated.structuralSync;
  assert.throws(() => checkSpecSync(generated, inputs), /no valid structural sync receipt/);
});

test("sync writes atomically, has a byte-stable same-day no-op and preserves output on failure", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "gearing-spec-sync-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "data"));
  const inputs = await loadSpecSyncInputs();
  const trackerPath = join(root, "tracker.json");
  const files = { "raid-items.json": inputs.raid, "weapon-proficiency.json": inputs.weapons,
    "stat-priority-overrides.json": inputs.overrides, "stat-priority-baseline.json": inputs.baseline };
  for (const [file, data] of Object.entries(files))
    await writeFile(join(root, "data", file), JSON.stringify(data));
  await writeFile(trackerPath, JSON.stringify(inputs.tracker));
  const outputPath = join(root, "data", "specs.json");
  const result = await runSpecSync({ root, trackerPath, checkedAt: today });
  assert.equal(result.changed, true);
  const before = await readFile(outputPath, "utf8");
  assert.equal((await runSpecSync({ root, trackerPath, checkedAt: today })).changed, false);
  assert.equal((await runSpecSync({ root, trackerPath, check: true })).checkedAt, today);
  assert.equal(await readFile(outputPath, "utf8"), before);
  await assert.rejects(readFile(outputPath + ".tmp"), { code: "ENOENT" });
  await writeFile(trackerPath, JSON.stringify(inputs.tracker.slice(1)));
  await assert.rejects(runSpecSync({ root, trackerPath, checkedAt: today }), /roster drift/);
  assert.equal(await readFile(outputPath, "utf8"), before);
});
