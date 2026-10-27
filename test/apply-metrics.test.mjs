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

test("retire removes one stored Mythicstats share at or below the bound (blank, not zeroed) and refuses every other shape (owner decision 2026-09-25)", async () => {
  const series = { source: "mythicstats", bracket: "mplus", name: "Top-2000 keys representation" };
  const share = (spec, value) => ({ class: "Rogue", spec, ...series, unit: "%", value, asOf: "2026-09-20" });
  const tuple = spec => ({ class: "Rogue", spec, ...series });
  await applyMetrics(await input({ metrics: [share("Outlaw", 0.5), share("Assassination", 0.6)] }), root);
  assert.equal((await applyMetrics(await input({ retire: [tuple("Outlaw")] }), root)).metricsRetired, 1);
  const specs = await readSpecs(), rogue = spec => specs.find(s => s.class === "Rogue" && s.spec === spec);
  assert.ok(!rogue("Outlaw").metrics.some(m => m.source === "mythicstats"), "absent, not zeroed");
  assert.equal(rogue("Assassination").metrics.find(m => m.source === "mythicstats").value, 0.6, "only the named tuple goes");
  assert.equal((await applyMetrics(await input({ retire: [tuple("Outlaw")] }), root)).metricsRetired, 0, "an already-absent tuple is a no-op");
  const before_ = await readFile(specsPath(), "utf8");
  await assert.rejects(applyMetrics(await input({ retire: [tuple("Assassination")] }), root), /stores 0\.6%, above the 0\.5% retirement bound — nothing written/);
  for (const other of [{ source: "murlok" }, { name: "Meta presence" }, { bracket: "raid" }]) {
    await assert.rejects(applyMetrics(await input({ retire: [{ ...tuple("Assassination"), ...other }] }), root), /only the Mythicstats "Top-2000 keys representation" M\+ series can be retired; nothing written/);
  }
  await assert.rejects(applyMetrics(await input({ retire: [{ ...tuple("Assassination"), source: "warcraftlogs", bracket: "raid", name: "Retire probe" }] }), root),
    /names no stored leaderboard row on a reviewed partition other than the raid pin — nothing written/);
  await assert.rejects(applyMetrics(await input({ retire: [tuple("Swashbuckler")] }), root), /did not match any spec — nothing written/);
  await assert.rejects(applyMetrics(await input({ metrics: [share("Outlaw", 0.4)], retire: [tuple("Outlaw")] }), root), /also upserted — nothing written/);
  assert.equal(await readFile(specsPath(), "utf8"), before_);
});

/* The WCL partition-switch lane (fetch-wcl.mjs partitionRetirements, owner decision
   2026-10-27): a pool moving to the pin may drop the old row of a cut the pin cannot
   refresh. Without that retirement the same merge mixes partitions and is refused. */
test("retire drops an old-partition WCL leaderboard row so a moving pool lands whole, and refuses every other WCL shape", async () => {
  const specs = await readSpecs(), pin = 2;
  const pool = specs.filter(s => s.role === "DPS").map(s => [s, s.metrics.find(m => m.bracket === "raid" && m.sample?.kind === "leaderboard-entries"
    && m.sample.encounterId === 3470)]).filter(([, m]) => m);
  assert.ok(pool.length >= 3, "fixture needs a real multi-spec raid pool");
  for (const [, m] of pool) m.sample.partition = 1; // the whole pool still on the older reviewed partition
  await writeFile(specsPath(), JSON.stringify(specs, null, 2) + "\n");
  const [[left, leftRow], ...rest] = pool;
  const moved = rest.map(([s, m]) => ({ class: s.class, spec: s.spec, ...structuredClone(m), sample: { ...m.sample, partition: pin } }));
  const tuple = { class: left.class, spec: left.spec, source: "warcraftlogs", bracket: "raid", name: leftRow.name };
  const unchanged = await readFile(specsPath(), "utf8");
  await assert.rejects(applyMetrics(await input({ metrics: moved }), root), /mixes WCL partitions/);
  await assert.rejects(applyMetrics(await input({ metrics: moved, retire: [tuple, { ...tuple, name: "Not stored" }] }), root),
    /names no stored leaderboard row on a reviewed partition other than the raid pin — nothing written/);
  await assert.rejects(applyMetrics(await input({ metrics: moved, retire: [{ ...tuple, class: rest[0][0].class, spec: rest[0][0].spec }] }), root), /also upserted — nothing written/);
  assert.equal(await readFile(specsPath(), "utf8"), unchanged);
  const result = await applyMetrics(await input({ metrics: moved, retire: [tuple] }), root);
  assert.deepEqual([result.metricsApplied, result.wclRetired, result.metricsRetired], [moved.length, 1, 0]);
  // Tanks share the DPS series name in their own pool, which this merge leaves alone.
  const after = await readSpecs(), rows = after.filter(s => s.role === "DPS")
    .flatMap(s => s.metrics.filter(m => m.name === leftRow.name).map(m => [s.class, s.spec, m.sample.partition]));
  assert.deepEqual(rows.filter(([cls, spec]) => cls === left.class && spec === left.spec), [], "absent, not zeroed");
  assert.ok(rows.length === moved.length && rows.every(([, , partition]) => partition === pin));
  // A row already on the pin is no longer an old-partition row, so it cannot be retired.
  await assert.rejects(applyMetrics(await input({ retire: [{ ...tuple, class: rest[0][0].class, spec: rest[0][0].spec }] }), root),
    /names no stored leaderboard row on a reviewed partition other than the raid pin — nothing written/);
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
  // `tier` is required for bloodmallet since 2026-08-20 (validate.mjs SIM_TIER_REQUIRED), and
  // the row must match the tier the stored pool ALREADY carries or the uniformity guard
  // rejects the merge — so read it off the fixture data rather than hard-coding it (a literal
  // "MID1" reddened this test the day the pool moved to MID2, 2026-09-03). It also pins the
  // passthrough at apply-metrics.mjs:49, which was implemented but untested — the same
  // invisibility that let a whole harvest omit the field.
  const poolTier = (await readSpecs()).find(s => s.fightProfile?.source === "bloodmallet")?.fightProfile.tier ?? "MID1";
  await applyMetrics(await input({
    profiles: [{ class: "Rogue", spec: "Outlaw", source: "bloodmallet", asOf: "2026-07-06", tier: poolTier, targets: { "1": 1, "3": 2, "8": 3 } }],
    survivability: [{ class: "Rogue", spec: "Outlaw", tier: "B", asOf: "2026-07-06" }],
    complexity: [{ class: "Rogue", spec: "Outlaw", complexity: 3 }]
  }), root);
  const outlaw = (await readSpecs()).find(s => s.class === "Rogue" && s.spec === "Outlaw");
  assert.deepEqual(outlaw.fightProfile.targets, { "1": 1, "3": 2, "8": 3 });
  assert.equal(outlaw.fightProfile.tier, poolTier, "the chart's own sim tier must survive the merge");
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
