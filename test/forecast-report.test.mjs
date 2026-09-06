import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData } from "../src/validate.mjs";
import { loadSnapshots, gradeSnapshot, carryForward } from "../src/report-card.mjs";
import { createForecastReport, renderForecastReport } from "../src/render-forecast-report.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = await loadData(ROOT);
fixture.historySnapshots = await loadSnapshots(ROOT);

test("the report grades all artifact cells at the fixed settled checkpoint, with the original prior baseline", () => {
  const report = createForecastReport(fixture);
  const first = report.checkpoints[0];
  assert.equal(first.settleDays, 14);
  assert.equal(first.grade.forecastDate, fixture.frozenForecast.date);
  assert.equal(first.grade.coverage.graded, Object.keys(fixture.frozenForecast.cells).length * 2);
  assert.equal(report.summary.href, "forecast-report.html");
  assert.equal(report.summary.comparable, true);
  const originalSnapshot = fixture.historySnapshots.find(s => s.date === fixture.frozenForecast.date);
  const options = { mode: "grade", specs: fixture.specs };
  assert.deepEqual(first.grade, gradeSnapshot(originalSnapshot, first.actual, fixture.scales, options),
    "artifact-derived grade must reproduce the explicit history declaration");
  assert.deepEqual(first.baseline, gradeSnapshot(carryForward(originalSnapshot), first.actual, fixture.scales, options),
    "carry-forward must reproduce the prior recorded at freeze");
  const html = renderForecastReport(report);
  assert.ok(html.indexOf("Coverage:") < html.indexOf("% exact letters"), "coverage precedes accuracy");
  const allCells = /<caption>All forecast cells at \+14 days<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/.exec(html)?.[1];
  assert.equal([...allCells.matchAll(/<tr>/g)].length, 80, "all declared cells appear in the full report");
  assert.match(html, /publisher tier-list consensus/);
  assert.match(html, /DISCLOSURE:/);
  assert.doesNotMatch(html, /NOT COMPARABLE:/);
});

test("+14 and +28 keep separate first eligible outcomes; current state cannot replace either", () => {
  const base = structuredClone(fixture);
  const original = createForecastReport(base);
  const first = original.checkpoints[0];
  // Use synthetic FUTURE history only in memory, so this test survives the real +28 landing.
  base.historySnapshots = base.historySnapshots.filter(s => s.date <= first.actual.date);
  const day28 = structuredClone(first.actual);
  day28.date = original.checkpoints[1].settleBy;
  for (const cell of Object.values(day28.specs)) { cell.consensus.raid = "C"; cell.scores.raid = 0; }
  const later = structuredClone(day28);
  later.date = "2099-01-01";
  for (const cell of Object.values(later.specs)) { cell.consensus.raid = "S"; cell.scores.raid = 100; }
  base.historySnapshots.unshift(later, day28);
  const report = createForecastReport(base);
  assert.equal(report.checkpoints[0].grade.actualDate, first.actual.date);
  assert.deepEqual(report.checkpoints[0].grade.overall, first.grade.overall);
  assert.equal(report.checkpoints[1].grade.actualDate, day28.date);
  assert.equal(report.summary.settleDays, 28);
  assert.equal(report.summary.actualDate, day28.date);
  assert.notDeepEqual(report.checkpoints[0].grade.overall, report.checkpoints[1].grade.overall);
  const html = renderForecastReport(report);
  assert.match(html, /id="checkpoint-14"/);
  assert.match(html, /id="checkpoint-28"/);
  assert.ok(!html.includes(later.date), "later current state must not become a settled endpoint");
});

test("pending checkpoints disclose their required date and never manufacture accuracy", () => {
  const base = structuredClone(fixture);
  const completed = createForecastReport(base);
  const launch = completed.checkpoints[0].launchDate;
  base.historySnapshots = base.historySnapshots.filter(s => s.date <= launch);
  const pending = createForecastReport(base);
  assert.equal(pending.summary, null);
  assert.ok(pending.checkpoints.every(c => !c.grade));
  const html = renderForecastReport(pending);
  assert.match(html, /Pending/);
  assert.ok(html.includes(completed.checkpoints[0].settleBy));
  assert.ok(html.includes(completed.checkpoints[1].settleBy));
  assert.doesNotMatch(html, /% exact letters/);
  base.historySnapshots = base.historySnapshots.filter(s => s.date < launch);
  assert.match(renderForecastReport(createForecastReport(base)), /launch has not happened yet/);
  assert.equal(createForecastReport({}), null);
  assert.equal(renderForecastReport(null), null);
});

test("report refuses a missing, changed, or differently selected freeze", () => {
  const date = fixture.frozenForecast.date;
  const withChange = change => { const f = structuredClone(fixture); change(f); return f; };
  assert.throws(() => createForecastReport(withChange(f => {
    f.historySnapshots = f.historySnapshots.filter(s => s.date !== date);
  })), /no matching explicit frozen history declaration/);
  assert.throws(() => createForecastReport(withChange(f => {
    f.historySnapshots.find(s => s.date === date).frozen = false;
  })), /no matching explicit frozen history declaration/);
  assert.throws(() => createForecastReport(withChange(f => {
    Object.values(f.frozenForecast.cells)[0].raid.score++;
  })), /forecast differs/);
  assert.throws(() => createForecastReport(withChange(f => {
    Object.values(f.frozenForecast.cells)[0].consensus.raid.score++;
  })), /prior differs/);
  assert.throws(() => createForecastReport(withChange(f => {
    Object.values(f.frozenForecast.cells)[0].consensus.raid.perSource[0].source = "different-source";
  })), /prior sources differ/);
  assert.throws(() => createForecastReport(withChange(f => {
    const later = f.historySnapshots.find(s => s.date > date && s.phase === f.frozenForecast.phase);
    assert.ok(later, "fixture should contain a later pre-launch snapshot");
    later.frozen = true;
  })), /selected history freeze differs/);
});

test("incomparable or empty grades never produce a publishable accuracy summary", () => {
  const data = structuredClone(fixture);
  const realReport = createForecastReport(data);
  data.historySnapshots = data.historySnapshots.filter(s => s.date <= realReport.checkpoints[0].actual.date);
  const settled = data.historySnapshots.find(s => s.date === realReport.checkpoints[0].actual.date);
  for (const cell of Object.values(settled.specs)) delete cell.consensusSources;
  const incomparable = createForecastReport(data);
  assert.equal(incomparable.summary, null);
  const incomparableHTML = renderForecastReport(incomparable);
  assert.match(incomparableHTML, /NOT COMPARABLE:/);
  assert.match(incomparableHTML, /Ungradeable checkpoint/);
  assert.match(incomparableHTML, /Coverage: 80\/80 paired cells/);
  assert.match(incomparableHTML, /Consensus source composition/);
  assert.match(incomparableHTML, /Original data SHA-256/);
  assert.doesNotMatch(incomparableHTML, /% exact|% within one band|Mean absolute error|signed bias|Spearman|NDCG|predicted S\/A\+|<td>[+-]?\d+ bands<\/td>/,
    "incomparable outcomes must not publish accuracy, ranking, recall, or grade differences");
  assert.equal([...incomparableHTML.matchAll(/<td>Not comparable<\/td>/g)].length, 80,
    "retain every raw forecast/outcome pair while withholding its grade");
  settled.consensusVersion = data.frozenForecast.consensusVersion; // restore comparability for the empty-outcome case
  for (const cell of Object.values(settled.specs)) cell.consensus = { raid: null, mplus: null };
  const empty = createForecastReport(data);
  assert.equal(empty.summary, null);
  const html = renderForecastReport(empty);
  assert.match(html, /No forecast cells could be graded/);
  assert.match(html, /No settled outcome/);
  assert.doesNotMatch(html, /% exact letters/);
});

test("rendering is deterministic, escapes provenance, and stays entirely offline without scripts", () => {
  const report = createForecastReport(fixture);
  const before = JSON.stringify(report);
  assert.equal(renderForecastReport(report), renderForecastReport(report));
  assert.equal(JSON.stringify(report), before, "renderer must not mutate its grading input");
  const attack = '</script><img src="https://evil.example/x" onerror="alert(1)">';
  const hostile = structuredClone(report);
  hostile.artifact.gitSha = attack;
  hostile.artifact.sourceDates[attack] = attack;
  const html = renderForecastReport(hostile);
  assert.ok(html.includes("&lt;/script&gt;&lt;img"));
  assert.doesNotMatch(html, /<script\b|<img\b|url\(/i);
  const tags = [...html.matchAll(/<[^>]*>/g)].map(m => m[0]).join("\n");
  assert.doesNotMatch(tags, /\sonerror\s*=/i, "escaped prose must never become an event attribute");
  assert.match(html, /default-src 'none'/);
  const links = [...html.matchAll(/href="([^"]*)"/g)].map(m => m[1]);
  assert.ok(links.every(link => link === "index.html" || /^#checkpoint-\d+$/.test(link)));
  assert.match(html, /\.tablewrap\{[^}]*overflow-x:auto/);
});
