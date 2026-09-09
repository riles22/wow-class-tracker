import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadData } from '../../../src/validate.mjs';
import { loadSnapshots, rankingFor } from '../../../src/report-card.mjs';
import { createForecastReport } from '../../../src/render-forecast-report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const data = await loadData(root);
data.historySnapshots = await loadSnapshots(root);
const report = createForecastReport(data);
const checkpoint = report.checkpoints[0];
const tieSensitivity = [];
for (const [label, grade] of [['forecast', checkpoint.grade], ['carry-forward', checkpoint.baseline]]) {
  const renamed = grade.rows.map((row, i) => ({ ...row, spec: String(9999 - i).padStart(4, '0') }));
  const renamedRanking = rankingFor(renamed);
  for (const [key, metric] of Object.entries(grade.ranking)) {
    if (key.endsWith('/top-tier')) continue;
    const [bracket, role] = key.split('/');
    const rows = grade.rows.filter(row => row.bracket === bracket && row.role === role);
    const dcg = list => list.slice(0, metric.k).reduce((sum, row, i) => sum + row.actualScore / Math.log2(i + 2), 0);
    const ideal = dcg([...rows].sort((a, b) => b.actualScore - a.actualScore));
    const minimum = dcg([...rows].sort((a, b) => b.forecastScore - a.forecastScore || a.actualScore - b.actualScore)) / ideal;
    const maximum = dcg([...rows].sort((a, b) => b.forecastScore - a.forecastScore || b.actualScore - a.actualScore)) / ideal;
    tieSensitivity.push({ label, key, current: metric, renamed: renamedRanking[key],
      ndcgTieRange: { min: +minimum.toFixed(3), max: +maximum.toFixed(3) } });
  }
}
const shortField = rankingFor([1, 2, 3].map(i => ({ spec: `DPS ${i}`, role: 'DPS', bracket: 'raid',
  forecastScore: i * 10, actualScore: i * 10, forecastTier: 'A', actualTier: 'A' })));
const tiedHealers = [100, 90, 80, 70].map((actualScore, i) => ({ spec: `Healer ${i}`, role: 'Healer', bracket: 'raid',
  forecastScore: 80, actualScore, forecastTier: 'A', actualTier: 'A' }));
const syntheticTies = { original: rankingFor(tiedHealers),
  renamed: rankingFor(tiedHealers.map((row, i) => ({ ...row, spec: `Healer ${9 - i}` }))) };
const cli = args => {
  const output = execFileSync(process.execPath, ['src/report-card.mjs', ...args], { cwd: root, encoding: 'utf8' });
  return { args, lines: output.split(/\r?\n/).filter(line => /mode:|forecast \d|overall|coverage /.test(line)) };
};
const evidence = {
  generatedAt: new Date().toISOString(),
  artifact: { date: report.artifact.date, gitSha: report.artifact.gitSha, dataSha256: report.artifact.dataSha256,
    projectionVersion: report.artifact.projectionVersion, consensusVersion: report.artifact.consensusVersion },
  checkpoints: report.checkpoints.map(c => ({ settleDays: c.settleDays, launchDate: c.launchDate, settleBy: c.settleBy,
    actualDate: c.actual?.date, reason: c.reason, forecast: c.grade, baseline: c.baseline })),
  tieSensitivity, shortField, syntheticTies,
  cli: [cli(['--forecast', '2026-08-11', '--settled', '2026-08-18']),
    cli(['--forecast', 'not-a-snapshot', '--settled', '2026-09-01']),
    cli(['--settled', '2026-09-01']),
    cli(['--forecast', '2026-08-11', '--settled', 'not-a-snapshot'])]
};
const out = new URL('./math-evidence.json', import.meta.url);
await writeFile(out, JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ written: fileURLToPath(out),
  tieSensitivity: tieSensitivity.map(({ label, key, current, renamed, ndcgTieRange }) => ({ label, key,
    spearman: current.spearman, topK: current.topK, ndcg: current.ndcg, renamedNdcg: renamed.ndcg, ndcgTieRange })),
  shortField, syntheticTies, cli: evidence.cli }, null, 2));
