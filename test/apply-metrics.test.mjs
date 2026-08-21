/* The merge scripts are the only writers of data/specs.json and run unattended nightly —
   these tests pin their refusal + atomicity guarantees against a throwaway copy of the
   real repo data (never the repo itself). */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, cp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { applyMetrics } from "../src/apply-metrics.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let root; // temp fixture root with a full copy of data/

before(async () => {
  root = await mkdtemp(path.join(tmpdir(), "tracker-fixture-"));
  await cp(path.join(ROOT, "data"), path.join(root, "data"), { recursive: true });
});
after(async () => { await rm(root, { recursive: true, force: true }); });

const specsPath = () => path.join(root, "data", "specs.json");
const input = async rows => {
  const p = path.join(root, "input.json");
  await writeFile(p, JSON.stringify(rows));
  return p;
};
const readSpecs = async () => JSON.parse(await readFile(specsPath(), "utf8"));

test("an unmatched row refuses the whole merge and leaves specs.json untouched", async () => {
  const before_ = await readFile(specsPath(), "utf8");
  const p = await input({ metrics: [
    { class: "Rogue", spec: "Outlaw", bracket: "raid", source: "warcraftlogs", name: "T", value: 1 },
    { class: "Rogue", spec: "Swashbuckler", bracket: "raid", source: "warcraftlogs", name: "T", value: 1 } // not a spec
  ] });
  await assert.rejects(applyMetrics(p, root), /did not match any spec — nothing written/);
  assert.equal(await readFile(specsPath(), "utf8"), before_, "file must be byte-identical after refusal");
});

test("a validation failure after merge writes nothing", async () => {
  const before_ = await readFile(specsPath(), "utf8");
  const p = await input({ metrics: [
    { class: "Rogue", spec: "Outlaw", bracket: "raid", source: "warcraftlogs", name: "Bad value", value: -5 }
  ] });
  await assert.rejects(applyMetrics(p, root), /failed validation — nothing written/);
  assert.equal(await readFile(specsPath(), "utf8"), before_);
});

test("metrics upsert by (source, bracket, name) — replaces without duplicating, era survives", async () => {
  const row = { class: "Rogue", spec: "Outlaw", bracket: "raid", source: "warcraftlogs",
    name: "Test metric (12.1 PTR)", value: 100, era: "ptr", n: 5, asOf: "2026-07-06" };
  await applyMetrics(await input({ metrics: [row] }), root);
  await applyMetrics(await input({ metrics: [{ ...row, value: 120, n: 9 }] }), root);
  const outlaw = (await readSpecs()).find(s => s.class === "Rogue" && s.spec === "Outlaw");
  const rows = outlaw.metrics.filter(m => m.name === "Test metric (12.1 PTR)");
  assert.equal(rows.length, 1, "upsert must replace, not append");
  assert.equal(rows[0].value, 120);
  assert.equal(rows[0].n, 9);
  assert.equal(rows[0].era, "ptr", "era must survive the merge (regression: was silently dropped)");
});

test("ptrdummy merge replaces spec.ptrDummy wholesale with defaults applied", async () => {
  await applyMetrics(await input({ ptrdummy: [
    { class: "Rogue", spec: "Outlaw", asOf: "2026-07-06", targets: { "1": 111111, "5": 333333 } }
  ] }), root);
  const outlaw = (await readSpecs()).find(s => s.class === "Rogue" && s.spec === "Outlaw");
  assert.equal(outlaw.ptrDummy.source, "warcraftlogs"); // default source
  assert.deepEqual(outlaw.ptrDummy.targets, { "1": 111111, "5": 333333 });
  assert.equal(outlaw.ptrDummy.asOf, "2026-07-06");
});

test("profiles merge replaces fightProfile; survivability and playstyle merge their shapes", async () => {
  await applyMetrics(await input({
    // `tier` is required for bloodmallet since 2026-08-20 (validate.mjs SIM_TIER_REQUIRED),
    // and MID1 keeps this row uniform with the rest of the stored pool. It also pins the
    // passthrough at apply-metrics.mjs:49, which was implemented but untested — the same
    // invisibility that let a whole harvest omit the field.
    profiles: [{ class: "Rogue", spec: "Outlaw", source: "bloodmallet", asOf: "2026-07-06", tier: "MID1", targets: { "1": 1, "3": 2, "8": 3 } }],
    survivability: [{ class: "Rogue", spec: "Outlaw", tier: "B", asOf: "2026-07-06" }],
    complexity: [{ class: "Rogue", spec: "Outlaw", complexity: 3 }]
  }), root);
  const outlaw = (await readSpecs()).find(s => s.class === "Rogue" && s.spec === "Outlaw");
  assert.deepEqual(outlaw.fightProfile.targets, { "1": 1, "3": 2, "8": 3 });
  assert.equal(outlaw.fightProfile.tier, "MID1", "the chart's own sim tier must survive the merge");
  assert.equal(outlaw.survivability.tier, "B");
  assert.equal(outlaw.survivability.source, "archon"); // default
  assert.equal(outlaw.playstyle.complexity, 3);
});

test("playstyle merge preserves fields landed by the separate complexity fetch (audit C4)", async () => {
  // Land complexity first, then a playstyle row for the same spec. A bare assignment in
  // the playstyle branch wiped complexity/complexityNotes silently — validation cannot
  // see a missing optional field, and those fields feed the Spec Finder.
  await applyMetrics(await input({ complexity: [
    { class: "Rogue", spec: "Outlaw", complexity: 4, complexityNotes: "tricky" }
  ] }), root);
  await applyMetrics(await input({ playstyle: [
    { class: "Rogue", spec: "Outlaw", range: "Melee", mobility: 5, utility: 3, notes: "n" }
  ] }), root);

  const outlaw = (await readSpecs()).find(s => s.class === "Rogue" && s.spec === "Outlaw");
  assert.equal(outlaw.playstyle.complexity, 4, "complexity must survive a later playstyle merge");
  assert.equal(outlaw.playstyle.complexityNotes, "tricky");
  assert.equal(outlaw.playstyle.mobility, 5);   // …and the new fields still land
  assert.equal(outlaw.playstyle.range, "Melee");
});
