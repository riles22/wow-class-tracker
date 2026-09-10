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
  assert.ok(html.includes(`Our forecast: <b>${first.scorecard.right} of ${first.scorecard.total} right</b>`), "headline uses the reader's main-letter counts");
  const allCells = /<caption>All forecast cells at \+14 days<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/.exec(html)?.[1];
  assert.equal([...allCells.matchAll(/<tr>/g)].length, 80, "all declared cells appear in the full report");
  assert.ok(html.includes(`Actual = the settled ranking from the tracked sites on ${first.actual.date}`));
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
  assert.equal(report.checkpoints[1].sourcePredictions.rawOutcomeAvailable, false,
    "+28 must not reuse September 1 publisher receipts");
  assert.ok(report.checkpoints[1].sourcePredictions.cohorts.filter(c => c.kind === "site")
    .every(c => c.holdout.status === "unavailable"));
  const html = renderForecastReport(report);
  assert.match(html, /id="checkpoint-14"/);
  assert.match(html, /id="checkpoint-28"/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, "completed checkpoints have distinct navigation targets");
  for (const days of [14, 28]) {
    for (const section of ["ours", "creators", "sites"]) {
      assert.ok(html.includes(`href="#checkpoint-${days}-${section}"`));
      assert.ok(html.includes(`<summary id="checkpoint-${days}-${section}">`), "shortcuts land on a keyboard-operable disclosure");
    }
  }
  assert.ok(!html.includes(later.date), "later current state must not become a settled endpoint");
});

test("the compact report summary preserves main-letter counts separately from detailed-band accuracy", () => {
  const report = createForecastReport(fixture);
  const latest = report.checkpoints.filter(c => c.grade).at(-1);
  for (const name of ["scorecard", "baselineScorecard"]) {
    const card = latest[name];
    const independentlyMatched = card.rows.filter(r => r.predicted != null && r.actual != null
      && /^[A-Z]/.exec(r.predicted)?.[0] === /^[A-Z]/.exec(r.actual)?.[0]).length;
    assert.deepEqual(report.summary[name], {
      right: independentlyMatched, total: card.total, unscored: card.unscored, method: "main-letter"
    });
  }
  assert.notEqual(report.summary.scorecard.right, latest.grade.overall.exact,
    "the retained forecast has main-letter matches that are not exact plus/minus matches");
  assert.deepEqual(report.summary.overall, latest.grade.overall, "existing detailed-band metrics remain available");
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
  assert.doesNotMatch(html, /class="checkpoint-shortcuts"/, "pending checks have no nonexistent breakdown links");
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
  data.sourcePredictions = null; // This synthetic answer key has no matching publisher receipts.
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
  assert.ok(!/<span class="answer answer-(?:right|too-high|too-low)">/.test(incomparableHTML),
    "the simplified breakdown must also withhold unchecked right/wrong labels");
  assert.equal([...incomparableHTML.matchAll(/<td[^>]*>Not comparable<\/td>/g)].length, 80,
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
  assert.ok(links.every(link => link === "index.html" || /^#checkpoint-\d+(?:-(?:ours|creators|sites))?$/.test(link) || /^https?:\/\//.test(link)));
  assert.match(html, /\.tablewrap\{[^}]*overflow-x:auto/);
});

test("a later checkpoint uses its own attached publisher receipts when present", () => {
  const base = structuredClone(fixture);
  const original = createForecastReport(base);
  const first = original.checkpoints[0];
  base.historySnapshots = base.historySnapshots.filter(s => s.date <= first.actual.date);
  const day28 = structuredClone(first.actual);
  day28.date = original.checkpoints[1].settleBy;
  const receipt = base.sourcePredictions.outcomes.find(o => o.date === first.actual.date);
  day28.sourceReceipts = structuredClone(receipt.sourceReceipts);
  for (const [key, spec] of Object.entries(day28.specs)) spec.sourceRatings = structuredClone(receipt.sourceRatings[key]);
  base.historySnapshots.push(day28);
  const report = createForecastReport(base);
  assert.equal(report.checkpoints[0].sourcePredictions.actualDate, first.actual.date);
  assert.equal(report.checkpoints[1].sourcePredictions.actualDate, day28.date);
  assert.equal(report.checkpoints[1].sourcePredictions.rawOutcomeAvailable, true);
  assert.ok(report.checkpoints[1].sourcePredictions.cohorts.filter(c => c.kind === "site")
    .every(c => c.holdout.status === "ready"));
});

test("both checkpoint summaries lead with plain counts and precede detail tables", () => {
  const html = renderForecastReport(createForecastReport(fixture));
  const summaries = html.slice(html.indexOf('<div class="checkpoint-summaries">'), html.indexOf('<section class="checkpoint-details">'));
  assert.match(summaries, /id="checkpoint-14"/);
  assert.match(summaries, /id="checkpoint-28"/);
  assert.match(summaries, /class="result"[\s\S]*?of \d+ right[\s\S]*?class="coverage"/);
  assert.doesNotMatch(summaries, /exact letters|within one band|Spearman|NDCG/);
  assert.doesNotMatch(summaries, /<table|consensusVersion|Original Git SHA/);
  assert.match(html, /class="cellcards"|class="tablewrap cellcards"/);
  assert.match(html, /data-label="Forecast"/);
  assert.match(html, /data-label="Settled"/);
  assert.match(html, /data-label="Predicted"/);
  assert.match(html, /data-label="Actual"/);
  assert.match(html, /Grading method 2/);
  assert.match(html, /overlap may be fractional/);
});

test("an incomparable carry-forward cannot publish baseline metrics beside a valid forecast", () => {
  const report = createForecastReport(fixture);
  for (const c of report.checkpoints.filter(c => c.grade)) {
    c.baseline.consensusVersion.comparable = false;
    c.baseline.overall.exactPct = 97.123;
    c.baseline.overall.withinOnePct = 98.456;
    for (const metric of Object.values(c.baseline.ranking)) metric.spearman = 0.123456;
    c.sourcePredictions = null;
  }
  const html = renderForecastReport(report);
  assert.match(html, /% exact letters/);
  assert.match(html, /Carry-forward comparison unavailable/);
  assert.doesNotMatch(html, /97\.123|98\.456|0\.123456/);
});

test("saved checkpoint scales keep historical grades stable after current scale changes", () => {
  const original = createForecastReport(fixture);
  const changed = structuredClone(fixture);
  changed.scales.consensus.bands.reverse();
  for (const scale of Object.values(changed.scales.scales)) {
    for (const tier of Object.keys(scale.values)) scale.values[tier] = 100 - scale.values[tier];
  }
  const report = createForecastReport(changed);
  assert.deepEqual(report.checkpoints[0].grade, original.checkpoints[0].grade);
  assert.deepEqual(report.checkpoints[0].baseline, original.checkpoints[0].baseline);
  assert.deepEqual(report.checkpoints[0].sourcePredictions, original.checkpoints[0].sourcePredictions);
});

test('a whole-group top-k cutoff does not hide informative NDCG ordering', () => {
  const report = createForecastReport(fixture);
  const metric = report.checkpoints[0].grade.ranking['raid/DPS'];
  metric.topK.informative = false;
  metric.ndcg = 0.432;
  const html = renderForecastReport(report);
  assert.match(html, /data-label="Forecast NDCG@k">0\.432<\/td>/);
  assert.match(html, /data-label="Forecast top-k overlap">— \(whole group\)<\/td>/);
});

test("source and creator reports retain separate cutoffs, scope, provenance and safe links", () => {
  const report = createForecastReport(fixture);
  const first = report.checkpoints.find(c => c.sourcePredictions?.status === "ready");
  assert.ok(first, "fixture supplies durable historical source receipts");
  const html = renderForecastReport(report);
  assert.match(html, /Older-season site benchmarks/);
  assert.match(html, /Later pre-launch site lists/);
  assert.match(html, /Creator results/);
  assert.match(html, /Unknown/);
  assert.match(html, /historical record is identified by its commit and file hash/);
  assert.match(html, /Order only/);
  assert.match(html, /whole group/);
  assert.match(html, /Superseded at cutoff/);
  assert.match(html, /Publisher-excluded comparison/);
  const hostile = structuredClone(report);
  const cohort = hostile.checkpoints[0].sourcePredictions.cohorts[0];
  cohort.pages[0].url = 'javascript:alert(1)';
  cohort.label = '<img src=x onerror=alert(1)>';
  cohort.rawRows[0].url = 'data:text/html,<script>alert(1)</script>';
  const rendered = renderForecastReport(hostile);
  assert.doesNotMatch(rendered, /href="(?:javascript:|data:)|<img\b|<script\b/);
  assert.match(rendered, /&lt;img/);
});

test("numbered prediction results display tied outcomes plainly and explain unscored rows", () => {
  const report = createForecastReport(fixture);
  const cohort = report.checkpoints[0].sourcePredictions.cohorts.find(c => c.kind === "creator");
  cohort.scorecard = { mode: "rank", right: 0, total: 0, unscored: 1,
    scopeLabel: "Ranks among three Warlock specs.", rows: [{ spec: "Warlock Affliction", bracket: "mplus",
      predicted: 1, actual: "Tied 1–2", actualTied: true, status: "not-scored", reason: "The actual outcome is tied." }] };
  const html = renderForecastReport(report);
  assert.ok(html.includes('data-label="Predicted"><b>#1</b>'));
  assert.ok(html.includes('data-label="Actual"><b>Tied 1–2</b>'));
  assert.ok(!html.includes("#Tied"));
  assert.ok(html.includes('answer-not-scored">Not scored</span><small class="row-note">The actual outcome is tied.'));
  assert.ok(html.includes("Ranks among three Warlock specs. #1 is best."));
});
