import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPredictionScorecard, mainTierLetter } from '../src/prediction-scorecard.mjs';
import { createSourcePredictionReport } from '../src/source-predictions.mjs';
const read = async file => JSON.parse(await readFile(new URL(`../data/${file}`, import.meta.url), 'utf8'));
const ledger = await read('predictions/s2.json'), actual = await read('history/2026-09-01.json');
const forecast = await read('history/2026-08-11.json'), scales = await read('scales.json');

test('main-letter counts keep A modifiers together without changing the labels shown', () => {
  assert.equal(mainTierLetter('A−'), 'A');
  assert.equal(mainTierLetter('S+'), 'S');
  assert.equal(mainTierLetter('Good'), null);
  const cohort = { scope: { brackets: ['mplus'], roles: ['DPS'] }, rows: [
    { key: 'Mage|Arcane', bracket: 'mplus', tier: 'A-' },
    { key: 'Mage|Fire', bracket: 'mplus', tier: 'S+' },
    { key: 'Mage|Frost', bracket: 'mplus', tier: 'B+' }] };
  const outcome = { date: '2026-09-01', specs: { 'Mage|Arcane': { consensus: { mplus: 'A+' } },
    'Mage|Fire': { consensus: { mplus: 'A' } }, 'Mage|Frost': { consensus: { mplus: 'S' } } } };
  const result = createPredictionScorecard({ cohort, actual: outcome,
    roster: Object.keys(outcome.specs).map(key => ({ key, role: 'DPS' })) });
  assert.deepEqual([result.right, result.total, result.wrong, result.unscored], [1, 3, 2, 0]);
  assert.deepEqual(result.rows.map(r => [r.predicted, r.actual, r.status]),
    [['A-', 'A+', 'right'], ['S+', 'A', 'too-high'], ['B+', 'S', 'too-low']]);
});

test('all eight historical creator counts reproduce the reviewed labels and rank placements', () => {
  const expected = [[16, 29], [3, 5], [1, 5], [4, 6], [2, 3], [2, 5], [1, 3], [1, 3]];
  const creators = ledger.cohorts.filter(c => c.kind === 'creator');
  const results = creators.map(cohort => createPredictionScorecard({ cohort, actual, roster: ledger.roster }));
  assert.deepEqual(results.map(r => [r.right, r.total]), expected);
  assert.equal(results.reduce((n, r) => n + r.total, 0), 59);
  for (const result of results) {
    assert.equal(result.total, result.rows.filter(r => r.status !== 'not-scored').length);
    assert.equal(result.right, result.rows.filter(r => r.status === 'right').length);
  }
  const zorthas = results[0];
  assert.equal(zorthas.unscored, 11);
  const kalamazi = results[6];
  assert.equal(kalamazi.mode, 'rank');
  assert.deepEqual(kalamazi.rows.map(r => [r.key, r.predicted, r.actual, r.status]), [
    ['Warlock|Affliction', 2, 3, 'too-high'], ['Warlock|Demonology', 1, 1, 'right'],
    ['Warlock|Destruction', 3, 2, 'too-low']]);
});

test('missing, conditional, and custom placements never become incorrect predictions', () => {
  const cohort = structuredClone(ledger.cohorts.find(c => c.id === 'creator-ZOVnfoXjuoc'));
  cohort.nativeOrder = ['S', 'A', 'B'];
  cohort.rows[0].tier = null; cohort.rows[0].reason = 'No clear placement';
  cohort.rows[1].tier = 'S'; cohort.rows[1].conditional = true;
  cohort.rows[2].tier = 'Excellent';
  const result = createPredictionScorecard({ cohort, actual, roster: ledger.roster });
  assert.deepEqual([result.right, result.wrong, result.total, result.unscored], [0, 0, 0, 3]);
  assert.ok(result.rows.every(r => r.status === 'not-scored' && r.reason));
});

test('numeric predictions rank only the stated group and never break outcome ties alphabetically', () => {
  const cohort = ledger.cohorts.find(c => c.id === 'creator-ZOVnfoXjuoc');
  const changed = structuredClone(actual);
  changed.specs['Warlock|Affliction'].scores.mplus = 80;
  changed.specs['Warlock|Destruction'].scores.mplus = 80;
  const result = createPredictionScorecard({ cohort, actual: changed, roster: ledger.roster });
  assert.equal(result.total, 0);
  assert.ok(result.rows.every(r => r.actual === 'Tied 1–3' && r.status === 'not-scored'));
  const reversed = createPredictionScorecard({ cohort, actual: changed, roster: [...ledger.roster].reverse() });
  assert.deepEqual([reversed.right, reversed.total, reversed.unscored], [0, 0, 3]);
  delete changed.specs['Warlock|Demonology'].scores.mplus;
  const missing = createPredictionScorecard({ cohort, actual: changed, roster: ledger.roster });
  assert.ok(missing.rows.every(r => r.actual === null && r.status === 'not-scored'));
});

test('simple source counts depend on its prediction and outcome, even when our own model is missing', () => {
  const changed = structuredClone(forecast);
  changed.specs['Mage|Arcane'].projection.mplus = null;
  const before = createSourcePredictionReport({ ledger, checkpoint: actual, forecast, scales });
  const after = createSourcePredictionReport({ ledger, checkpoint: actual, forecast: changed, scales });
  for (let i = 0; i < before.cohorts.length; i++) assert.deepEqual(before.cohorts[i].scorecard, after.cohorts[i].scorecard);
  assert.equal(before.cohorts.find(c => c.id === 'same-cutoff-wowhead').scorecard.right, 47);
  assert.equal(before.cohorts.find(c => c.id === 'same-cutoff-icyveins-ptr').scorecard.right, 23);
});
