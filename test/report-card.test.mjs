import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { gradeSnapshot, bandIndexer, launchPair, loadSnapshots, spearman, ndcgAtK, rankingFor, carryForward } from "../src/report-card.mjs";
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

test("a grade across a changed consensus definition is flagged NOT COMPARABLE (2026-08-08)", () => {
  // The freeze protects the forecast side — it is on disk. The ANSWER KEY has no such
  // protection: `actual.consensus` is written by whatever consensusFor is live at settlement,
  // while carryForward copies the frozen snapshot's old-definition consensus forward as the
  // baseline. Change the consensus between freeze and settlement and the model is graded
  // against a moved goalpost, in a measurement that has no second attempt.
  const cells = { "Druid|Balance": { projection: { raid: { tier: "A", score: 60 } } } };
  const actual = { "Druid|Balance": { consensus: { raid: "A" }, scores: { raid: 60 } } };

  const same = gradeSnapshot(
    snap("2026-08-10", cells, { consensusVersion: 2 }),
    snap("2026-09-01", actual, { consensusVersion: 2 }), SCALES);
  assert.equal(same.consensusVersion.comparable, true);
  assert.deepEqual(same.warnings, [], "matching definitions grade cleanly");

  const moved = gradeSnapshot(
    snap("2026-08-10", cells, { consensusVersion: 2 }),
    snap("2026-09-01", actual, { consensusVersion: 3 }), SCALES);
  assert.equal(moved.consensusVersion.comparable, false);
  assert.equal(moved.warnings.length, 1);
  assert.match(moved.warnings[0], /not on the same scale/);

  // An UNVERSIONED side cannot vouch for comparability either — absence is not agreement.
  const unknown = gradeSnapshot(snap("2026-08-10", cells), snap("2026-09-01", actual), SCALES);
  assert.equal(unknown.consensusVersion.comparable, false);
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

test("launchPair keeps FROZEN and SETTLED as separate events", () => {
  const pre = [snap("2026-08-01", {}), snap("2026-08-02", {})];
  assert.match(launchPair(pre).reason, /has not happened yet/,
    "a reason, not null — 'not yet' and 'the marker was never set' are different problems");

  // Launch day is NOT a settled outcome. One phase flip cannot mean both "stop forecasting"
  // and "the meta has settled"; grading against day 0 grades the outlets' week-one guess.
  const launchOnly = [...pre, { ...snap("2026-08-19", {}), phase: "12.1-live" }];
  assert.match(launchPair(launchOnly).reason, /not settled yet/);
  assert.equal(launchPair(launchOnly).settleBy, "2026-09-02", "launch + 14 days");

  const settled = [...launchOnly,
    { ...snap("2026-08-25", {}), phase: "12.1-live" },   // still inside the window
    { ...snap("2026-09-04", {}), phase: "12.1-live" }];
  const pair = launchPair(settled);
  assert.equal(pair.actual.date, "2026-09-04", "the first snapshot at or past the settle date");
  assert.equal(pair.forecast.date, "2026-08-02", "inferred freeze point: last pre-launch snapshot");
  assert.equal(pair.frozenExplicit, false, "…and it says the freeze was inferred, not declared");

  // An explicit freeze marker wins over recency, so a late pre-launch refresh cannot
  // quietly move the forecast being graded.
  const marked = [{ ...snap("2026-08-01", {}), frozen: true }, snap("2026-08-02", {}),
    { ...snap("2026-08-19", {}), phase: "12.1-live" }, { ...snap("2026-09-04", {}), phase: "12.1-live" }];
  const explicit = launchPair(marked);
  assert.equal(explicit.forecast.date, "2026-08-01");
  assert.equal(explicit.frozenExplicit, true);
});

test("gradeSnapshot reports COVERAGE, so a one-cell grade cannot read as 100%", () => {
  // The degenerate case the audit named: forecast one cell, get it right, publish
  // "100% exact" with nothing saying 79 cells were dropped.
  const f = snap("2026-08-02", { "Mage|Fire": { projection: { raid: { tier: "A", score: 60 } } },
                                 "Mage|Frost": { projection: {} } });
  const a = snap("2026-09-04", { "Mage|Fire": { consensus: { raid: "A" }, scores: { raid: 61 } },
                                 "Mage|Frost": { consensus: { raid: "B" }, scores: { raid: 45 } } });
  const g = gradeSnapshot(f, a, SCALES, { mode: "grade" });
  assert.equal(g.overall.exactPct, 100, "the graded cell really was exact");
  assert.equal(g.coverage.graded, 1);
  assert.ok(g.coverage.obtainable >= 2, "…but two cells had an outcome to grade against");
  assert.equal(g.coverage.declined, 1, "the unforecast cell is counted, not silently dropped");
  assert.equal(g.coverage.sufficient, false, "and the result declares itself not a full grade");
  assert.ok(g.coverage.coveragePct < 100);
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

/* ---------- ranking metrics + the carry-forward baseline ---------- */

test("spearman: agreement, inversion, ties, and refusal on tiny n", () => {
  assert.equal(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1);
  assert.equal(spearman([1, 2, 3, 4], [40, 30, 20, 10]), -1);
  assert.equal(spearman([1, 2], [2, 1]), null, "two points always correlate perfectly — refuse");
  // Ties get midranks, so a tied pair does not fabricate an ordering.
  const withTies = spearman([1, 2, 2, 3], [1, 2, 2, 3]);
  assert.equal(withTies, 1);
});

test("ndcgAtK: a perfect ordering is 1, a bad one is measurably less", () => {
  const rows = [
    { forecastScore: 90, actualScore: 90 },
    { forecastScore: 80, actualScore: 80 },
    { forecastScore: 70, actualScore: 70 },
    { forecastScore: 60, actualScore: 60 }
  ];
  assert.equal(ndcgAtK(rows, 3), 1);
  const inverted = rows.map((r, i) => ({ ...r, forecastScore: rows[rows.length - 1 - i].forecastScore }));
  assert.ok(ndcgAtK(inverted, 3) < 1);
});

test("rankingFor: k follows the role field size, and top-tier recall is band-based", () => {
  const mk = (spec, role, f, a, fT = "A", aT = "A") =>
    ({ spec, role, bracket: "raid", forecastScore: f, actualScore: a, forecastTier: fT, actualTier: aT });
  const rows = [
    // 6 DPS — top-5 makes sense; forecast gets 4 of the actual top 5.
    mk("d1", "DPS", 90, 95), mk("d2", "DPS", 85, 90), mk("d3", "DPS", 80, 85),
    mk("d4", "DPS", 75, 80), mk("d5", "DPS", 40, 75), mk("d6", "DPS", 70, 40),
    // 4 healers — k must drop to 3, not pretend 5 is meaningful in a field of 4.
    mk("h1", "Healer", 90, 90, "S", "S"), mk("h2", "Healer", 80, 80, "A+", "A+"),
    mk("h3", "Healer", 70, 70, "A", "S"), mk("h4", "Healer", 60, 60)
  ];
  const r = rankingFor(rows);
  assert.equal(r["raid/DPS"].k, 5);
  assert.equal(r["raid/DPS"].topK.overlap, 4, "d6 forecast into the top 5, d5 actually there");
  assert.equal(r["raid/Healer"].k, 3);
  // Top-tier recall: three cells SETTLED S/A+ (h1, h2, h3); the forecast placed two there.
  assert.equal(r["raid/top-tier"].of, 3);
  assert.equal(r["raid/top-tier"].hit, 2);
});

test("carryForward graded against its own source is perfect — that is the point", () => {
  // The baseline copies the frozen live consensus forward. Graded against that same
  // consensus it must score 100% — which is exactly why drift may never be a target and
  // why the CLI hides the baseline outside grade mode.
  const frozen = snap("2026-08-02", {
    "A|X": { consensus: { raid: "S", mplus: "A" }, scores: { raid: 90, mplus: 60 } },
    "A|Y": { consensus: { raid: "B" }, scores: { raid: 45 } }
  });
  const base = carryForward(frozen);
  assert.equal(base.specs["A|X"].projection.raid.tier, "S");
  assert.equal(base.specs["A|Y"].projection.mplus, null, "no consensus → no baseline claim");
  const g = gradeSnapshot(base, frozen, SCALES, { mode: "drift" });
  assert.equal(g.overall.exactPct, 100);
  assert.equal(g.overall.meanAbsScore, 0);
});

test("ranking metrics are stable under input order when scores tie", () => {
  // 2026-08-04 external audit: with tied scores the sort order — and therefore DCG and
  // the top-k cut — depended on input order, so the same data could grade differently
  // across runs. The spec-name tiebreak makes every ordering deterministic.
  const mk = (spec, f, a) => ({ spec, role: "DPS", bracket: "raid",
    forecastScore: f, actualScore: a, forecastTier: "A", actualTier: "A" });
  const rows = [
    mk("alpha", 80, 90), mk("bravo", 80, 70), mk("charlie", 80, 50),
    mk("delta", 60, 80), mk("echo", 60, 60), mk("foxtrot", 40, 40)
  ];
  const reversed = [...rows].reverse();
  const shuffled = [rows[3], rows[0], rows[5], rows[2], rows[4], rows[1]];
  const base = rankingFor(rows)["raid/DPS"];
  for (const perm of [reversed, shuffled]) {
    const r = rankingFor(perm)["raid/DPS"];
    assert.equal(r.ndcg, base.ndcg, "NDCG must not depend on input order");
    assert.equal(r.topK.overlap, base.topK.overlap, "…nor the top-k overlap");
    assert.equal(r.spearman, base.spearman);
  }
  assert.equal(ndcgAtK(rows, 3), ndcgAtK(reversed, 3));
});
