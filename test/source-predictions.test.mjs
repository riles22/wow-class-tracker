import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSourcePredictionReport, validateSourcePredictions, captureSourceReceipts,
  sourceReceiptHash, ledgerFromArtifact } from '../src/source-predictions.mjs';
import { GRADING_VERSION } from '../src/report-card.mjs';

const read = async name => JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), 'utf8'));
const ledger = await read('data/predictions/s2.json');
const artifact = await read('data/forecasts/frozen-2026-08-11.json');
const forecast = await read('data/history/2026-08-11.json');
const checkpoint = await read('data/history/2026-09-01.json');
const scales = await read('data/scales.json');
const options = { ledger, checkpoint, forecast, scales };
const cohort = (report, id) => report.cohorts.find(c => c.id === id);

test('raw preserved receipts validate against original freeze and produce all 16 separately scoped cohorts', () => {
  assert.deepEqual(validateSourcePredictions(ledger, { frozenForecast: artifact }), []);
  const report = createSourcePredictionReport(options);
  assert.equal(report.gradingVersion, GRADING_VERSION);
  assert.equal(report.cohorts.length, 16);
  assert.equal(report.rawOutcomeAvailable, true);
  assert.equal(ledger.cohorts.filter(c => c.kind === 'creator').flatMap(c => c.rows.filter(r => r.tier != null)).length, 59);
  assert.equal(ledger.cohorts.filter(c => c.kind === 'site').length, 8);
  assert.ok(!('overall' in ledger.cohorts[0]), 'raw data contains no generated grade');
  assert.ok(!('reports' in ledger.cohorts[0]), 'audit statistics were not copied into raw ledger');
});

test('site grades normalize their own historical native scales, including S+ and the old Icy Veins S=100', () => {
  const r = createSourcePredictionReport(options);
  const wowhead = cohort(r, 'same-cutoff-wowhead');
  assert.equal(wowhead.source.overall.exact, 37);
  assert.equal(wowhead.source.overall.meanAbsBands, 0.6);
  assert.equal(wowhead.holdout.source.overall.meanAbsBands, 0.66);
  const ptr = cohort(r, 'same-cutoff-icyveins-ptr');
  const old = cohort(r, 'older-season-icyveins');
  assert.equal(ptr.nativeScale.values.S, 92);
  assert.equal(ptr.nativeScale.values['S+'], 100);
  assert.equal(old.nativeScale.values.S, 100);
  assert.equal(ptr.source.overall.exact, 15);
  assert.equal(ptr.holdout.source.overall.meanAbsBands, 0.78);
  assert.equal(ptr.holdout.ours.overall.meanAbsBands, 0.55);
  assert.ok(wowhead.source.consensusVersion.comparable, 'known changed composition is disclosed, not falsely hidden');
});

test('M+ scope has denominator 40 and never treats unpublished raid as 40 declined predictions', () => {
  const c = cohort(createSourcePredictionReport(options), 'same-cutoff-icyveins-ptr');
  assert.deepEqual(c.coverage, { rated: 40, eligible: 40, matched: 40, missingPrediction: 0, missingOutcome: 0, missingBaseline: 0 });
  assert.equal(c.source.coverage.obtainable, 40);
  assert.equal(c.source.coverage.coveragePct, 100);
  for (const side of [c.fullConsensus, c.holdout]) {
    assert.equal(side.source.overall.n, side.ours.overall.n);
    assert.equal(side.source.overall.n, side.baseline.overall.n);
    assert.deepEqual(side.source.rows.map(r => [r.spec, r.bracket, r.actualTier]), side.ours.rows.map(r => [r.spec, r.bracket, r.actualTier]));
  }
  assert.equal(c.holdout.excludedPublisher, 'icyveins');
  assert.ok(!c.holdout.source.consensusComposition.actual.mplus.includes('icyveins'));
});

test('missing source placements and missing baseline cells stay out of every compared model', () => {
  const original = cohort(createSourcePredictionReport(options), 'older-season-method');
  assert.equal(original.coverage.rated, 79);
  assert.equal(original.coverage.missingPrediction, 1);
  const modified = structuredClone(options);
  modified.forecast.specs['Death Knight|Blood'].projection.mplus = null;
  const c = cohort(createSourcePredictionReport(modified), 'same-cutoff-wowhead');
  assert.equal(c.coverage.missingBaseline, 1);
  assert.equal(c.source.overall.n, 79);
  assert.equal(c.ours.overall.n, 79);
  assert.equal(c.baseline.overall.n, 79);
  assert.ok(c.exclusions.some(x => x.key === 'Death Knight|Blood' && x.bracket === 'mplus'));
});

test('creator native tiers produce order-only results with honest sparse and superseded coverage', () => {
  const r = createSourcePredictionReport(options);
  const z = cohort(r, 'creator-SV3Snl21XC8');
  assert.equal(z.coverage.rated, 29);
  assert.equal(z.coverage.eligible, 40);
  assert.equal(z.source.ranking['mplus/DPS'].n, 23);
  assert.equal(z.source.ranking['mplus/DPS'].spearman, 0.865);
  assert.equal(z.ours.ranking['mplus/DPS'].spearman, 0.736);
  assert.equal(z.source.overall, undefined);
  assert.equal(z.holdout.status, 'not-applicable');
  assert.equal(z.source.ranking['mplus/Tank'].topK.informative, false);
  const mad = cohort(r, 'creator-Zf3GQqG-z8s');
  assert.equal(mad.rows.filter(x => x.supersededAtFreeze).length, 5);
  assert.ok(mad.warnings.some(w => w.includes('superseded')));
  const bansherz = cohort(r, 'creator-7O6Ri1vo0rc');
  assert.equal(bansherz.source.ranking['mplus/DPS'].spearman, null, 'three tied B placements contain no ordering');
});

test('later pre-season lists and previous-season carry-forwards cannot enter same-cutoff comparison', () => {
  const r = createSourcePredictionReport(options);
  const late = cohort(r, 'later-prelaunch-method');
  assert.equal(late.season, 's2');
  assert.equal(late.cutoffDate, '2026-08-17');
  assert.ok(late.warnings.some(w => w.includes('Later information')));
  const old = cohort(r, 'older-season-method');
  assert.equal(old.season, 's1');
  assert.ok(old.warnings.some(w => w.includes('Previous-season')));
  const altered = structuredClone(ledger);
  altered.cohorts.find(c => c.id === late.id).comparisonGroup = 'same-cutoff';
  assert.ok(validateSourcePredictions(altered).some(e => e.includes('later information')));
});

test('invalid provenance, unknown tiers, unsafe URLs and post-cutoff claims fail validation', () => {
  const cases = [
    [l => { l.freeze.dataSha256 = 'unknown'; }, /provenance/],
    [l => { l.cohorts[0].rows[0].tier = 'SUPER'; }, /unknown tier/],
    [l => { l.cohorts[0].pages[0].url = 'javascript:alert(1)'; }, /unsafe source URL/],
    [l => { l.cohorts[0].pages[0].url = 'https://www.wowhead.com.evil.test/x'; }, /unsafe source URL/],
    [l => { l.cohorts[0].pages[0].seasonVerified = 's1'; }, /not eligible/],
    [l => { l.cohorts[8].rows[0].date = '2026-09-01'; }, /creator claim after cutoff/],
    [l => { l.cohorts[8].rows[0].conditional = true; }, /conditional predictions must remain unscored/],
    [l => { l.cohorts[8].rows[0].url = 'https://youtu.be/another-video'; }, /different source panel/],
    [l => { l.cohorts[8].scope.brackets.push('mplus'); }, /duplicate scope/],
    [l => { l.cohorts[8].scope.roles.push('DPS'); }, /duplicate scope/],
    [l => { l.cohorts[8].rows[0].tier = null; delete l.cohorts[8].rows[0].reason; }, /without reason/]
  ];
  for (const [mutate, match] of cases) { const l = structuredClone(ledger); mutate(l); assert.match(validateSourcePredictions(l).join(';'), match); }
  const mismatch = structuredClone(artifact); mismatch.gitSha = 'a'.repeat(40);
  assert.match(validateSourcePredictions(ledger, { frozenForecast: mismatch }).join(';'), /provenance mismatch/);
  assert.match(validateSourcePredictions({ ...ledger, cohorts: {} }).join(';'), /must be arrays/);
});

test('tampered raw outcome or saved outcome mismatch is rejected rather than grading changed answer keys', () => {
  const altered = structuredClone(options);
  altered.ledger.outcomes[0].sourceRatings['Death Knight|Blood'].raid.wowhead = 'C';
  assert.throws(() => createSourcePredictionReport(altered), /checksum mismatch/);
  altered.ledger.outcomes[0].receiptSha256 = sourceReceiptHash(altered.ledger.outcomes[0]);
  assert.throws(() => createSourcePredictionReport(altered), /disagrees with saved consensus/);
  const actual = structuredClone(options);
  actual.checkpoint.specs['Death Knight|Blood'].scores.raid = 12;
  assert.throws(() => createSourcePredictionReport(actual), /disagrees with saved consensus/);
});

test('the next checkpoint uses newly captured raw receipts without replacing the original September 1 outcome', () => {
  const day28 = structuredClone(checkpoint);
  day28.date = '2026-09-15';
  day28.sourceReceipts = structuredClone(ledger.outcomes[0].sourceReceipts);
  for (const [key, cell] of Object.entries(day28.specs)) cell.sourceRatings = structuredClone(ledger.outcomes[0].sourceRatings[key]);
  // Blood M+ all four publishers -> C. Mean (30+24+34+24)/4 = 28.
  for (const source of ['icyveins', 'method', 'wowhead', 'archon']) day28.specs['Death Knight|Blood'].sourceRatings.mplus[source] = 'C';
  day28.specs['Death Knight|Blood'].consensus.mplus = 'C';
  day28.specs['Death Knight|Blood'].scores.mplus = 28;
  const next = createSourcePredictionReport({ ...options, checkpoint: day28 });
  assert.equal(next.actualDate, '2026-09-15');
  assert.equal(next.rawOutcomeAvailable, true);
  assert.notDeepEqual(next.cohorts[0].source.overall, createSourcePredictionReport(options).cohorts[0].source.overall);
  assert.equal(checkpoint.specs['Death Knight|Blood'].scores.mplus, 98, 'historical fixture remains intact');
});

test('a checkpoint without raw source receipts still shows honest full consensus and unavailable holdouts', () => {
  const future = structuredClone(checkpoint); future.date = '2026-09-15';
  const r = createSourcePredictionReport({ ...options, checkpoint: future });
  assert.equal(r.rawOutcomeAvailable, false);
  assert.equal(r.cohorts[0].holdout.status, 'unavailable');
  assert.equal(r.cohorts[0].holdout.source, undefined);
  assert.equal(r.cohorts[0].source.overall.n, 80);
});

test('capture clones dated registry/scales and new frozen artifacts build source ledgers without git', () => {
  const historical = ledger.outcomes[0].sourceReceipts;
  const captured = captureSourceReceipts({ liveSeason: 's2', sources: historical.sources, scales: historical.scales,
    seasonFinal: historical.seasonFinal });
  assert.deepEqual(captured, historical);
  captured.sources[0].name = 'Changed';
  assert.notEqual(historical.sources[0].name, 'Changed');
  const fresh = structuredClone(artifact);
  fresh.date = '2026-09-02'; fresh.targetSeason = 's2'; fresh.sourceReceipts = structuredClone(historical);
  for (const [key, cell] of Object.entries(fresh.cells)) cell.sourceRatings = ledger.outcomes[0].sourceRatings[key];
  fresh.creatorPredictions = [];
  const derived = ledgerFromArtifact(fresh, { launchDate: '2026-09-09' });
  assert.ok(derived.cohorts.length >= 4);
  assert.deepEqual(validateSourcePredictions(derived, { frozenForecast: fresh }), []);
  assert.equal(derived.outcomes.length, 0);
  assert.equal(ledgerFromArtifact(artifact, { launchDate: '2026-08-18' }), null, 'old artifact remains unchanged and uses recovered ledger');
});

test('later live consensus-scale changes cannot rewrite a fixed historical source grade', () => {
  const edited = structuredClone(scales);
  edited.consensus.bands = [{ tier: 'S', min: 0 }];
  const before = createSourcePredictionReport(options);
  const after = createSourcePredictionReport({ ...options, scales: edited });
  for (let i = 0; i < before.cohorts.length; i++) {
    assert.deepEqual(after.cohorts[i].fullConsensus, before.cohorts[i].fullConsensus);
    assert.deepEqual(after.cohorts[i].holdout, before.cohorts[i].holdout);
  }
});

test('future written creator panels use the same allowed attribution hosts as creator intake', () => {
  const future = structuredClone(ledger);
  const p = future.cohorts.find(c => c.kind === 'creator');
  p.pages[0].url = 'https://kalamazi.gg/guides';
  p.rows.forEach(r => { r.url = 'https://kalamazi.gg/guides'; });
  assert.deepEqual(validateSourcePredictions(future), []);
});
