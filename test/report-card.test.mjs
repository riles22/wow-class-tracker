import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { gradeSnapshot, bandIndexer, launchPair, loadSnapshots, spearman, ndcgAtK, rankingFor, carryForward, reportWarnings,
  GRADING_VERSION, parseReportArgs, selectReportPair } from "../src/report-card.mjs";
import { readFile } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";

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
  assert.match(reportWarnings(moved)[0], /^NOT COMPARABLE:/);

  // An UNVERSIONED side cannot vouch for comparability either — absence is not agreement.
  const unknown = gradeSnapshot(snap("2026-08-10", cells), snap("2026-09-01", actual), SCALES);
  assert.equal(unknown.consensusVersion.comparable, false);
});

test("recorded compositions outrank the version integer — the S2 boundary bump must not void the grade (2026-08-11)", () => {
  /* The version-equality check had a guaranteed false alarm: the S2 transition MANDATES a
     CONSENSUS_VERSION bump at the boundary, so the one grade this file exists to produce
     would always have stamped ⚠ NOT COMPARABLE. Snapshots carry per-spec consensusSources
     since 2026-08-09 precisely so comparability can be DERIVED: a recomposition is disclosed
     as a warning (coverage before accuracy), never a refusal. */
  const cells = { "Druid|Balance": {
    projection: { raid: { tier: "A", score: 60 } },
    consensusSources: { raid: ["icyveins", "method", "wowhead", "archon"] } } };
  const actual = { "Druid|Balance": {
    consensus: { raid: "A" }, scores: { raid: 60 },
    consensusSources: { raid: ["icyveins", "wowhead"] } } };

  const graded = gradeSnapshot(
    snap("2026-08-11", cells, { consensusVersion: 3 }),
    snap("2026-09-01", actual, { consensusVersion: 4 }), SCALES);

  assert.equal(graded.consensusVersion.comparable, true,
    "a version bump with known compositions must not void the grade");
  assert.deepEqual(graded.consensusComposition.changedBrackets, ["raid"]);
  assert.ok(graded.warnings.some(w => /recomposed/.test(w) && /consensus of 2/.test(w)),
    "the recomposition must be disclosed with the answer key's source count");
  assert.ok(graded.warnings.some(w => /consensusVersion moved/.test(w)),
    "the version move stays visible as a secondary note");
  assert.ok(!graded.warnings.some(w => /NOT comparable/.test(w)),
    "disclosure, not refusal");
  assert.ok(reportWarnings(graded).every(w => w.startsWith("DISCLOSURE:")),
    "accepted recompositions and version changes must not receive a refusal prefix");

  // Same compositions on both sides: clean, even across a version bump — nothing recomposed.
  const same = gradeSnapshot(
    snap("2026-08-11", cells, { consensusVersion: 3 }),
    snap("2026-09-01", { "Druid|Balance": { ...actual["Druid|Balance"],
      consensusSources: { raid: ["icyveins", "method", "wowhead", "archon"] } } }, { consensusVersion: 4 }), SCALES);
  assert.equal(same.consensusVersion.comparable, true);
  assert.deepEqual(same.consensusComposition.changedBrackets, []);
});

test("the report-card CLI labels accepted warnings as disclosures", async () => {
  const snapshots = await loadSnapshots(ROOT);
  const pair = launchPair(snapshots);
  assert.ok(pair.actual, "the settled checkpoint used by the published report must exist");
  const scales = JSON.parse(await readFile(path.join(ROOT, "data", "scales.json"), "utf8"));
  const report = gradeSnapshot(pair.forecast, pair.actual, scales, { mode: "grade" });
  assert.equal(report.consensusVersion.comparable, true);
  assert.ok(report.warnings.length > 0, "fixture should retain the consensus-version disclosure");
  const output = execFileSync(process.execPath, [path.join(ROOT, "src", "report-card.mjs")],
    { cwd: ROOT, encoding: "utf8" });
  for (const warning of reportWarnings(report)) assert.ok(output.includes(warning));
  assert.doesNotMatch(output, /NOT COMPARABLE:/);
  assert.match(output, /mode: GRADE/);
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
  // Both the old deterministic tiebreak and the new shared positions must remain
  // independent of the input array's order. Label invariance is checked separately.
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

test("grading v2 averages the entire forecast tie, even when the cutoff splits it", () => {
  const rows = [100, 90, 80, 70].map((actualScore, i) => ({ spec: `healer-${i}`,
    role: "Healer", bracket: "raid", forecastScore: 80, actualScore }));
  const expected = +(85 * (1 + 1 / Math.log2(3) + 0.5)
    / (100 + 90 / Math.log2(3) + 80 / 2)).toFixed(3);
  assert.equal(ndcgAtK(rows, 3), expected,
    "the fourth tied spec contributes to mean gain even though k is three");
  const metric = rankingFor(rows)["raid/Healer"];
  assert.equal(metric.topK.overlap, 2.25);
  assert.equal(metric.topK.pct, 75);
  assert.equal(metric.topK.informative, true);
  assert.deepEqual(metric.topK.shares.map(r => r.forecast), [0.75, 0.75, 0.75, 0.75]);
  const renamed = rows.map((r, i) => ({ ...r, spec: `renamed-${9 - i}` }));
  for (const changed of [renamed, [...renamed].reverse()]) {
    const after = rankingFor(changed)["raid/Healer"];
    assert.equal(after.ndcg, metric.ndcg);
    assert.equal(after.spearman, metric.spearman);
    assert.equal(after.topK.overlap, metric.topK.overlap);
  }
});

test("fractional top-k is symmetric, preserves perfect tied predictions, and exposes memberships", () => {
  const rows = [90, 80, 70, 60, 50, 50].map((forecastScore, i) => ({ spec: `dps-${i}`,
    role: "DPS", bracket: "raid", forecastScore, actualScore: [90, 80, 70, 60, 20, 50][i] }));
  const metric = rankingFor(rows)["raid/DPS"];
  assert.equal(metric.topK.overlap, 4.5);
  assert.equal(metric.topK.pct, 90);
  assert.deepEqual(metric.topK.shares.slice(4), [
    { spec: "dps-4", forecast: 0.5, actual: 0, overlap: 0 },
    { spec: "dps-5", forecast: 0.5, actual: 1, overlap: 0.5 }
  ]);
  const swapped = rankingFor(rows.map(r => ({ ...r,
    forecastScore: r.actualScore, actualScore: r.forecastScore })))["raid/DPS"];
  assert.equal(swapped.topK.overlap, metric.topK.overlap);
  const self = rankingFor(rows.map(r => ({ ...r, actualScore: r.forecastScore })))["raid/DPS"];
  assert.equal(self.topK.overlap, 5);
  assert.equal(self.topK.pct, 100);
  assert.equal(self.ndcg, 1);
});

test("small cohorts clamp k to the available field and mark whole-field top-k uninformative", () => {
  for (const n of [3, 4, 5, 6]) {
    const rows = Array.from({ length: n }, (_, i) => ({ spec: `dps-${i}`, role: "DPS",
      bracket: "raid", forecastScore: i + 1, actualScore: i + 1 }));
    const metric = rankingFor(rows)["raid/DPS"];
    assert.equal(metric.k, Math.min(n, 5));
    assert.equal(metric.topK.of, Math.min(n, 5));
    assert.equal(metric.topK.overlap, Math.min(n, 5));
    assert.equal(metric.topK.pct, 100);
    assert.equal(metric.topK.informative, n > 5);
  }
});

test("carry-forward retains provenance and grading v2 preserves the frozen letter results", async () => {
  const snapshots = await loadSnapshots(ROOT);
  const forecast = snapshots.find(s => s.date === "2026-08-11");
  const actual = snapshots.find(s => s.date === "2026-09-01");
  const scales = JSON.parse(await readFile(path.join(ROOT, "data", "scales.json"), "utf8"));
  const specs = JSON.parse(await readFile(path.join(ROOT, "data", "specs.json"), "utf8"));
  const original = structuredClone(forecast);
  const baseline = carryForward(forecast);
  for (const [key, cell] of Object.entries(forecast.specs)) {
    assert.deepEqual(baseline.specs[key].consensusSources, cell.consensusSources);
    assert.deepEqual(baseline.specs[key].consensus, cell.consensus);
    assert.deepEqual(baseline.specs[key].scores, cell.scores);
  }
  const grade = gradeSnapshot(forecast, actual, scales, { mode: "grade", specs });
  const prior = gradeSnapshot(baseline, actual, scales, { mode: "grade", specs });
  assert.equal(GRADING_VERSION, 2);
  assert.equal(grade.gradingVersion, GRADING_VERSION);
  assert.equal(prior.gradingVersion, GRADING_VERSION);
  assert.equal(prior.consensusVersion.comparable, true);
  assert.deepEqual(prior.consensusComposition, grade.consensusComposition);
  assert.deepEqual(prior.warnings, grade.warnings);
  assert.equal(grade.coverage.graded, 80);
  assert.equal(prior.coverage.graded, 80);
  assert.deepEqual([grade.overall.exact, grade.overall.withinOne, grade.overall.meanAbsBands], [33, 71, 0.7]);
  assert.deepEqual([prior.overall.exact, prior.overall.withinOne, prior.overall.meanAbsBands], [17, 57, 1.21]);
  assert.deepEqual(forecast, original, "constructing or grading the baseline must not mutate its frozen input");
});

test("CLI options reject unknown, duplicate, missing, invalid, and unavailable dates", () => {
  assert.deepEqual(parseReportArgs(["--settled", "2026-09-01"]), { settledDate: "2026-09-01" });
  assert.deepEqual(parseReportArgs([]), {});
  for (const args of [["--other"], ["--forecast"], ["--forecast", "--settled", "2026-09-01"],
    ["--settled", "not-a-date"], ["--settled", "2026-02-30"],
    ["--forecast", "2026-08-11", "--forecast", "2026-08-11"]]) {
    assert.throws(() => parseReportArgs(args), /option|requires|Invalid/);
  }
  for (const [args, error] of [
    [["--forecast"], /requires a YYYY-MM-DD/],
    [["--settled", "not-a-snapshot"], /Invalid snapshot date/],
    [["--settled", "2099-01-01"], /No history snapshot/]
  ]) {
    const child = spawnSync(process.execPath, [path.join(ROOT, "src", "report-card.mjs"), ...args],
      { cwd: ROOT, encoding: "utf8" });
    assert.equal(child.status, 1);
    assert.match(child.stderr, error);
    assert.doesNotMatch(child.stdout, /mode: GRADE|overall/);
  }
});

test("CLI defaults omitted sides to the declared checkpoint and labels other dates exploratory", async () => {
  const snapshots = await loadSnapshots(ROOT);
  for (const options of [{}, { settledDate: "2026-09-01" }, { forecastDate: "2026-08-11" }]) {
    const pair = selectReportPair(snapshots, options);
    assert.equal(pair.forecast.date, "2026-08-11");
    assert.equal(pair.actual.date, "2026-09-01");
    assert.equal(pair.mode, "grade");
    assert.equal(pair.checkpoint, 14);
  }
  for (const options of [
    { forecastDate: "2026-08-11", settledDate: "2026-08-18" },
    { forecastDate: "2026-08-11", settledDate: "2026-09-08" },
    { forecastDate: "2026-08-10", settledDate: "2026-09-01" }
  ]) {
    const pair = selectReportPair(snapshots, options);
    assert.equal(pair.mode, "drift");
    assert.match(pair.reason, /Exploratory comparison/);
  }
  const cli = args => execFileSync(process.execPath, [path.join(ROOT, "src", "report-card.mjs"), ...args],
    { cwd: ROOT, encoding: "utf8" });
  assert.match(cli(["--settled", "2026-09-01"]), /forecast 2026-08-11/);
  const early = cli(["--forecast", "2026-08-11", "--settled", "2026-08-18"]);
  assert.match(early, /mode: DRIFT/);
  assert.match(early, /Exploratory comparison/);
  assert.doesNotMatch(early, /mode: GRADE/);
});

test("fixed checkpoint selection uses declared cycles, first eligible outcomes, and both settlement windows", () => {
  const mk = (date, phase, frozen = false) => snap(date, { "Mage|Fire": {
    projection: { raid: { tier: "A", score: 60 } } } }, { phase, frozen });
  const history = [mk("2026-12-01", "older-live"), mk("2027-01-01", "next-ptr", true),
    mk("2027-01-08", "next-ptr"), mk("2027-01-10", "next-live"),
    mk("2027-01-25", "next-live"), mk("2027-01-26", "next-live"), mk("2027-02-07", "next-live")];
  const first = selectReportPair([...history].reverse());
  assert.equal(first.forecast.date, "2027-01-01");
  assert.equal(first.actual.date, "2027-01-25", "first saved outcome after Jan 24, not an invented Jan 24 snapshot");
  assert.equal(first.mode, "grade");
  assert.equal(selectReportPair(history, { settledDate: "2027-02-07" }).checkpoint, 28);
  assert.equal(selectReportPair(history, { settledDate: "2027-01-26" }).mode, "drift");
  assert.equal(selectReportPair(history.map(s => ({ ...s, frozen: false }))).mode, "drift",
    "an inferred forecast may not become a declared accuracy grade");
  const laterCycle = [mk("2027-02-15", "future-ptr", true), mk("2027-03-01", "future-live"),
    mk("2027-03-15", "future-live")];
  assert.equal(selectReportPair([...history, ...laterCycle]).forecast.date, "2027-02-15");
  assert.equal(selectReportPair([...history, ...laterCycle], { settledDate: "2027-01-25" }).mode, "grade");
  const incomplete = [...history.filter(s => s.date < "2027-02-07"), ...laterCycle];
  assert.equal(selectReportPair(incomplete, { forecastDate: "2027-01-01", settledDate: "2027-03-15" }).mode, "drift",
    "a subsequent season may not supply a missing old checkpoint");
});
