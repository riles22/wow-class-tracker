/* One-time, owner-authorized recovery of the audited Season-2 raw prediction ledger.
   This helper needs git history; build and report rendering never invoke it.
   The audited JSON supplies only reviewed native creator placements, never grades.
   Run: node src/recover-source-predictions.mjs --write (or --check). */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { captureSourceReceipts, sourceReceiptHash, validateSourcePredictions } from './source-predictions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (...args) => execFileSync('git', args, { cwd: ROOT, maxBuffer: 20e6 });
const blob = (rev, file) => git('show', `${rev}:${file}`);
const at = (rev, file) => JSON.parse(blob(rev, file));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export async function recoverSourcePredictionLedger() {
  const artifact = JSON.parse(await readFile(path.join(ROOT, 'data/forecasts/frozen-2026-08-11.json')));
  const audit = JSON.parse(await readFile(path.join(ROOT, 'docs/audit-evidence/2026-09-08-forecast/source-accuracy.json')));
  const rev = artifact.gitSha;
  const files = git('ls-tree', '--name-only', rev, 'data/').toString().trim().split('\n')
    .filter(p => /^data\/[^/]+\.json$/.test(p)).sort();
  const hash = createHash('sha256');
  for (const file of files) { hash.update(file.slice(5)); hash.update(blob(rev, file)); }
  if (hash.digest('hex') !== artifact.dataSha256) throw new Error('Freeze input blobs do not match the frozen data hash');
  const roster = Object.entries(artifact.cells).map(([key, cell]) => ({ key, role: cell.role }));
  const sourceFiles = commit => ({ sourcePath: 'data/specs.json', sourceBlobSha256: sha256(blob(commit, 'data/specs.json')),
    sourceRegistryBlobSha256: sha256(blob(commit, 'data/sources.json')), scaleBlobSha256: sha256(blob(commit, 'data/scales.json')) });
  const cohorts = audit.sites.map(site => {
    const specs = at(site.commit, 'data/specs.json'), sources = at(site.commit, 'data/sources.json');
    const scales = at(site.commit, 'data/scales.json'), source = sources.find(s => s.id === site.id);
    const group = { 'freeze-inputs': 'same-cutoff', 'prior-season-carry-forward': 'older-season',
      'preseason-2026-08-17': 'later-prelaunch' }[site.cutoff];
    const cutoffDate = group === 'later-prelaunch' ? '2026-08-17' : artifact.date;
    const season = group === 'older-season' ? 's1' : 's2';
    const pages = source.pages.filter(p => site.brackets.includes(p.bracket) && !p.ancillary
      && (['DPS', 'Healer', 'Tank'].includes(p.role) || site.id === 'method'));
    return { id: `${group}-${site.id}`, label: source.name, kind: 'site', comparisonGroup: group,
      sourceId: site.id, publisher: site.publisher, season, cutoffDate,
      date: pages.map(p => p.published).filter(Boolean).sort().at(-1) ?? null,
      gitSha: site.commit, ...sourceFiles(site.commit),
      scope: { brackets: site.brackets, roles: ['DPS', 'Healer', 'Tank'] },
      scopeNote: source.methodology, pages,
      nativeScale: { id: source.scale, ...scales.scales[source.scale] },
      rows: specs.flatMap(s => site.brackets.map(bracket => ({ key: `${s.class}|${s.spec}`, bracket,
        tier: s.ratings[bracket]?.[site.id] ?? null,
        ...(s.ratings[bracket]?.[site.id] == null ? { reason: 'Source did not publish a placement for this spec' } : {}) }))) };
  });
  const rawTakes = at(rev, 'data/creator-takes.json');
  for (const panel of audit.creators) {
    const selected = new Map(panel.rows.map(r => [r.key, r.nativeTier]));
    const records = rawTakes[panel.lane].filter(t => t.creator === panel.creator && t.url.includes(panel.video));
    if (records.length !== panel.coverage.preservedVideoMentions) throw new Error(`Creator panel drift ${panel.video}`);
    for (const [key] of selected) if (!records.some(r => `${r.class}|${r.spec}` === key)) throw new Error(`Missing reviewed placement ${key}`);
    const eligible = roster.filter(s => panel.scope === 'All roles' || panel.scope === s.role || s.key.startsWith(`${panel.scope.replace(' only', '')}|`));
    const creator = { id: `creator-${panel.video}`, label: panel.creator, creator: panel.creator,
      kind: 'creator', comparisonGroup: 'creator', season: 's2', date: panel.date, cutoffDate: artifact.date,
      gitSha: rev, sourcePath: 'data/creator-takes.json', sourceBlobSha256: sha256(blob(rev, 'data/creator-takes.json')),
      scope: { brackets: [panel.bracket], roles: [...new Set(eligible.map(s => s.role))], keys: eligible.map(s => s.key) },
      scopeNote: panel.creator === 'Zorthas' ? 'High-key composition outlook; compared here with the broader publisher consensus.'
        : panel.creator === 'AutomaticJak' && panel.bracket === 'raid' ? 'Raid progression and world-first composition lens; compared with broad raid consensus.'
        : 'A named dated video panel preserved as attributed paraphrases; later revisions remain separately dated.',
      nativeOrder: panel.nativeOrder,
      pages: [{ url: `https://youtu.be/${panel.video}`, published: panel.date, snapshot: artifact.date }],
      reviewedPlacementCount: selected.size, preservedVideoMentions: records.length,
      rows: records.map(t => ({ key: `${t.class}|${t.spec}`, bracket: panel.bracket,
        tier: selected.get(`${t.class}|${t.spec}`) ?? null,
        ...(!selected.has(`${t.class}|${t.spec}`) ? { reason: 'No unambiguous absolute placement preserved in this video paraphrase' } : {}),
        date: t.date, url: t.url, context: t.patchContext, text: t.claim ?? t.note,
        supersededAtFreeze: t.superseded ?? false })) };
    cohorts.push(creator);
  }
  const settledCommit = audit.actualCommit;
  const settled = { date: '2026-09-01', phase: '12.1-live', gitSha: settledCommit,
    ...sourceFiles(settledCommit),
    sourceReceipts: captureSourceReceipts({ liveSeason: 's2', scales: at(settledCommit, 'data/scales.json'),
      sources: at(settledCommit, 'data/sources.json'), seasonFinal: at(settledCommit, 'data/season-final.json') }),
    sourceRatings: Object.fromEntries(at(settledCommit, 'data/specs.json').map(s => [`${s.class}|${s.spec}`, s.ratings])) };
  settled.receiptSha256 = sourceReceiptHash(settled);
  const ledger = { kind: 'source-predictions', schemaVersion: 1, season: 's2', priorSeason: 's1',
    forecastDate: artifact.date, launchDate: '2026-08-18',
    freeze: { gitSha: rev, dataSha256: artifact.dataSha256,
      files: files.map(file => ({ path: file, sha256: sha256(blob(rev, file)) })) },
    recovery: { method: 'Git blob recovery plus reviewed explicit creator placements',
      reviewedPlacementsPath: 'docs/audit-evidence/2026-09-08-forecast/source-accuracy.json',
      note: 'No statistics from the audit report are copied into this ledger. Original native values, attribution and dated raw outcomes only.' },
    roster, cohorts, outcomes: [settled] };
  const errors = validateSourcePredictions(ledger, { frozenForecast: artifact });
  if (errors.length) throw new Error(errors.join('\n'));
  return ledger;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ledger = await recoverSourcePredictionLedger();
  const target = path.join(ROOT, 'data/predictions/s2.json'), body = JSON.stringify(ledger, null, 2) + '\n';
  const existing = await readFile(target, 'utf8').catch(e => { if (e.code === 'ENOENT') return null; throw e; });
  // Git may check text out as CRLF on Windows; preserve those bytes while comparing
  // the same canonical content generated from the original Git blobs.
  if (existing != null && existing.replaceAll('\r\n', '\n') !== body) throw new Error('Preserved prediction ledger differs; refusing to overwrite immutable receipts');
  if (process.argv.includes('--write') && existing == null) {
    await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, body);
  } else if (process.argv.includes('--check') && existing == null) throw new Error('Preserved prediction ledger is missing');
  console.log(`Source predictions: ${ledger.cohorts.length} cohorts, ${ledger.outcomes.length} raw outcome receipt; ${existing ? 'verified unchanged' : process.argv.includes('--write') ? 'created' : 'dry run'}`);
}
