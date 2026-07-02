import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "../src/validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the repo's real data passes validation", async () => {
  const data = await loadData(ROOT);
  const errors = validateData(data);
  assert.deepEqual(errors, []);
});

test("the repo's data has all 40 Midnight specs across 13 classes", async () => {
  const { specs } = await loadData(ROOT);
  assert.equal(specs.length, 40);
  assert.equal(new Set(specs.map(s => s.class)).size, 13);
  // Midnight-era sanity marker: the third Demon Hunter spec exists.
  assert.ok(specs.some(s => s.class === "Demon Hunter" && s.spec === "Devourer"));
});

test("validateData catches bad tiers, roles, sources and duplicates", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.specs[0].role = "Bard";
  broken.specs[1].ratings.raid.icyveins = "SS";
  broken.specs[2].ratings.raid.unknownsource = "A";
  broken.specs.push(structuredClone(broken.specs[3]));
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('invalid role "Bard"')));
  assert.ok(errors.some(e => e.includes('tier "SS"')));
  assert.ok(errors.some(e => e.includes('unknown source "unknownsource"')));
  assert.ok(errors.some(e => e.includes("duplicate spec")));
});

test("validateData catches malformed ptr writeups", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  const tracked = broken.specs.find(s => s.ptr);
  tracked.ptr.verdict = "Amazing";
  tracked.ptr.changes = [];
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('ptr.verdict "Amazing"')));
  assert.ok(errors.some(e => e.includes("ptr.changes")));
});

test("validateData catches unsorted consensus bands", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.scales.consensus.bands = [{ tier: "C", min: 0 }, { tier: "S", min: 88 }];
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes("descending min")));
});

test("validateData requires every scale to declare tiers with numeric values", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  delete broken.scales.scales.method.tiers; // the client legend builder depends on tiers[]
  broken.scales.scales.icyveins.tiers.push("Z");
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('scale "method" must define a non-empty tiers array')));
  assert.ok(errors.some(e => e.includes('scale "icyveins" tier "Z" has no numeric value')));
});

test("a spec with an omitted ptr key is valid (same as ptr: null)", async () => {
  const data = await loadData(ROOT);
  const clone = structuredClone(data);
  delete clone.specs.find(s => s.ptr === null).ptr;
  assert.deepEqual(validateData(clone), []);
});
