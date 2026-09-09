import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCreatorPredictions, captureCreatorPredictions } from '../src/creator-predictions.mjs';
import { predictionSeason } from '../src/snapshot.mjs';

const options = { specs: [{ class: 'Mage', spec: 'Arcane', role: 'DPS' }],
  community: { generalCreators: [{ name: 'Example' }] }, now: '2026-08-11' };
const panel = () => ({ id: 'example-2026-08-09', label: 'Example M+ panel', creator: 'Example',
  season: 's2', date: '2026-08-09', capturedAt: '2026-08-10', scopeNote: 'Highest keys',
  scope: { brackets: ['mplus'], roles: ['DPS'] }, nativeOrder: ['S', 'A', 'B'],
  pages: [{ url: 'https://youtu.be/example', published: '2026-08-09', snapshot: '2026-08-10' }],
  rows: [{ key: 'Mage|Arcane', bracket: 'mplus', tier: 'S', date: '2026-08-09',
    url: 'https://youtu.be/example?t=100', context: 'Season 2 PTR, high Mythic+',
    text: 'Explicit S placement in the dated video.', supersededAtFreeze: false }] });
const ledger = () => ({ schemaVersion: 1, panels: [panel()] });

test('creator intake accepts explicit native placements and keeps unknowns unscored', () => {
  const data = ledger();
  assert.deepEqual(validateCreatorPredictions(data, options), []);
  data.panels[0].rows[0] = { ...data.panels[0].rows[0], tier: null, reason: 'Conditional on tuning', conditional: true };
  assert.deepEqual(validateCreatorPredictions(data, options), []);
  data.panels[0].rows[0].tier = 'S';
  assert.match(validateCreatorPredictions(data, options).join(';'), /conditional predictions must remain unscored/);
});

test('creator intake rejects unverifiable dates, invented scales, unknown authors, unsafe links and duplicate placements', () => {
  for (const mutate of [
    p => { p.date = '2026-02-30'; }, p => { p.capturedAt = '2026-08-12'; },
    p => { p.nativeOrder = ['S', 'S']; }, p => { p.rows[0].tier = 'A+'; },
    p => { p.creator = 'Unknown guest'; }, p => { p.rows[0].url = 'https://unapproved.example/rank'; },
    p => { p.rows.push(structuredClone(p.rows[0])); }, p => { p.rows[0].bracket = 'raid'; },
    p => { p.rows[0].url = 'https://youtu.be/a-different-video?t=100'; },
    p => { p.scope.brackets.push('mplus'); },
  ]) {
    const data = ledger(); mutate(data.panels[0]);
    assert.ok(validateCreatorPredictions(data, options).length > 0);
  }
});

test('freeze intake excludes hindsight and other seasons and copies evidence without mutation', () => {
  const eligible = panel(), late = { ...panel(), id: 'later-capture', capturedAt: '2026-08-12' },
    other = { ...panel(), id: 'other-season', season: 's1' };
  const data = { schemaVersion: 1, panels: [eligible, late, other] };
  const frozen = captureCreatorPredictions(data, { date: '2026-08-11', season: 's2' });
  assert.deepEqual(frozen.map(p => p.id), [eligible.id]);
  frozen[0].rows[0].tier = 'B';
  assert.equal(eligible.rows[0].tier, 'S');
});

test('forecast target resolves the next PTR label with or without its display suffix', () => {
  for (const label of ['12.2', '12.2 PTR']) assert.equal(predictionSeason({ liveSeason: 's2', ptr: { label },
    seasonLabels: { s2: '12.1', s3: '12.2' } }), 's3');
  assert.equal(predictionSeason({ liveSeason: 's2', ptr: null }), 's2');
  assert.throws(() => predictionSeason({ ptr: { label: 'Unknown' }, seasonLabels: {} }), /resolve uniquely/);
});
