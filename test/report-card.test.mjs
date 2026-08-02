import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { gradeSnapshot, bandIndexer, launchPair, loadSnapshots } from "../src/report-card.mjs";
import { readFile } from "node:fs/promises";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCALES = { consensus: { bands: [
  { tier: "S", min: 88 }, { tier: "A+", min: 74 }, { tier: "A", min: 58 },
  { tier: "B", min: 40 }, { tier: "C", min: 0 }
] } };
const snap = (date, specs, extra = {}) => ({ date, phase: "12.1-ptr", projectionVersion: 4, specs, ...extra });

test("bandsOff sign: positive means the model was too OPTIMISTIC", () => {
  const f = snap("2026-07-01", { "Druid|Balance": { projection: { raid: { tier: "S", score: 90 } } } });
  const a = snap("2026-08-01", { "Druid|Balance": { consensus: { raid: "B" }, scores: { raid: 45 } } });
  const r = gradeSnapshot(f, a, SCALES);
  assert.equal(r.rows[0].bandsOff, 3, "forecast S, landed B → 3 bands too optimistic");
  assert.equal(r.overall.biasBands, 3);
  assert.equal(r.overall.biasScore, 45); // 90 forecast vs 45 actual
});

test("a declined forecast is not scored as a miss", () => {
  const f = snap("2026-07-01", {
    "A|X": { projection: { raid: null, mplus: { tier: "A", score: 60 } } },
    "A|Y": { projection: {} }
  });
  const a = snap("2026-08-01", {
    "A|X": { consensus: { raid: "S", mplus: "A" }, scores: {} },
    "A|Y": { consensus: { raid: "C" }, scores: {} }
  });
  const r = gradeSnapshot(f, a, SCALES);
  // Only the one cell that actually carried a forecast is graded.
  assert.equal(r.overall.n, 1);
  assert.equal(r.rows[0].bracket, "mplus");
  assert.equal(r.rows[0].bandsOff, 0);
});

test("a spec missing from either side is skipped, not counted wrong", () => {
  const f = snap("2026-07-01", { "A|X": { projection: { raid: { tier: "A", score: 60 } } } });
  const a = snap("2026-08-01", { "B|Z": { consensus: { raid: "A" }, scores: { raid: 60 } } });
  assert.equal(gradeSnapshot(f, a, SCALES).overall, null);
});

test("mode is carried through and never inferred by the grader itself", () => {
  const f = snap("2026-07-01", { "A|X": { projection: { raid: { tier: "A", score: 60 } } } });
  const a = snap("2026-08-01", { "A|X": { consensus: { raid: "A" }, scores: { raid: 60 } } });
  assert.equal(gradeSnapshot(f, a, SCALES).mode, "drift", "defaults to the non-committal reading");
  assert.equal(gradeSnapshot(f, a, SCALES, { mode: "grade" }).mode, "grade");
});

test("launchPair returns null until the phase boundary actually happens", () => {
  const pre = [snap("2026-08-01", {}), snap("2026-08-02", {})];
  assert.equal(launchPair(pre), null, "all pre-launch → nothing to grade yet");
  const withPost = [...pre, { ...snap("2026-08-19", {}), phase: "12.1-live" }];
  const pair = launchPair(withPost);
  assert.equal(pair.forecast.date, "2026-08-02", "last pre-launch snapshot is the frozen forecast");
  assert.equal(pair.actual.date, "2026-08-19", "first post-launch snapshot is the outcome");
});

test("bandIndexer orders best-first and rejects unknown tiers", () => {
  const idx = bandIndexer(SCALES);
  assert.equal(idx("S"), 0);
  assert.equal(idx("C"), 4);
  assert.equal(idx("B+"), null, "a source-scale tier is not a consensus band");
});

test("the repo's real snapshots grade without throwing, and report their version", async () => {
  const snaps = await loadSnapshots(ROOT);
  assert.ok(snaps.length >= 2);
  const scales = JSON.parse(await readFile(path.join(ROOT, "data", "scales.json"), "utf8"));
  const specs = JSON.parse(await readFile(path.join(ROOT, "data", "specs.json"), "utf8"));
  const hasProjection = s => Object.values(s.specs ?? {}).some(e => e.projection);
  const gradeable = snaps.filter(hasProjection);
  assert.ok(gradeable.length >= 2, "expected at least two snapshots carrying projections");
  const r = gradeSnapshot(gradeable[0], gradeable.at(-1), scales, { specs });
  assert.ok(r.overall.n > 0);
  assert.ok(r.projectionVersion >= 1);
  // Roles come from specs.json, so the role breakdown must not be all-unknown.
  assert.ok(!Object.keys(r.byRole).includes("unknown"), Object.keys(r.byRole).join(","));
});

test("snapshots predating the projection grade to null, not to a fabricated zero", async () => {
  // The earliest snapshots (2026-07-01 onward) were written before the projection existed.
  // Grading one must yield "nothing to grade" — a 0% exact score would read as a model
  // that got everything wrong, which is the opposite of the truth.
  const snaps = await loadSnapshots(ROOT);
  const scales = JSON.parse(await readFile(path.join(ROOT, "data", "scales.json"), "utf8"));
  const preProjection = snaps.find(s => !Object.values(s.specs ?? {}).some(e => e.projection));
  assert.ok(preProjection, "expected at least one pre-projection snapshot on file");
  const r = gradeSnapshot(preProjection, snaps.at(-1), scales);
  assert.equal(r.overall, null);
  assert.deepEqual(r.rows, []);
});
