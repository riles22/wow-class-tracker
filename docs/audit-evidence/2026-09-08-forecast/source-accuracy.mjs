// Read-only audit, writes only its own JSON result when --write is supplied.
// Run from repository root: node docs/audit-evidence/2026-09-08-forecast/source-accuracy.mjs --write
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gradeSnapshot, carryForward, rankingFor } from '../../../src/report-card.mjs';
import { scoreFor, consensusTier, consensusFor } from '../../../src/normalize.mjs';

const git = (...args) => execFileSync('git', args, { maxBuffer: 20e6 });
const at = (rev, file) => JSON.parse(git('show', `${rev}:${file}`).toString('utf8'));
const artifact = JSON.parse(readFileSync('data/forecasts/frozen-2026-08-11.json'));
const forecastCommit = artifact.gitSha;
const actualCommit = git('rev-parse', '89f93e5').toString().trim();
const lateCommit = git('rev-parse', 'bae456da').toString().trim();
const forecast = at('9ed717d', 'data/history/2026-08-11.json');
const actual = at(actualCommit, 'data/history/2026-09-01.json');
const settledSpecs = at(actualCommit, 'data/specs.json');
const settledSources = at(actualCommit, 'data/sources.json');
const settledScales = at(actualCommit, 'data/scales.json');
const frozenTakes = at(forecastCommit, 'data/creator-takes.json');
const files = git('ls-tree', '--name-only', forecastCommit, 'data/').toString().trim()
  .split('\n').filter(p => /^data\/[^/]+\.json$/.test(p)).sort();
const hash = createHash('sha256');
for (const file of files) { hash.update(file.slice(5)); hash.update(git('show', `${forecastCommit}:${file}`)); }
const reconstructedHash = hash.digest('hex');
if (reconstructedHash !== artifact.dataSha256) throw new Error('Frozen raw input hash mismatch');

function answerExcluding(publisher) {
  return { ...actual, specs: Object.fromEntries(settledSpecs.map(s => {
    const consensus = {}, scores = {}, consensusSources = {};
    for (const bracket of ['raid', 'mplus']) {
      const c = consensusFor(s.ratings[bracket], settledSources.filter(x => x.id !== publisher),
        settledScales, bracket, 's2');
      consensus[bracket] = c?.tier ?? null;
      scores[bracket] = c?.score ?? null;
      consensusSources[bracket] = c?.perSource.map(p => p.source) ?? [];
    }
    return [`${s.class}|${s.spec}`, { consensus, scores, consensusSources }];
  })) };
}
const recreatedActual = answerExcluding(null);
for (const [key, s] of Object.entries(actual.specs)) for (const b of ['raid', 'mplus']) {
  if (s.consensus[b] !== recreatedActual.specs[key].consensus[b]
    || s.scores[b] !== recreatedActual.specs[key].scores[b]) throw new Error(`Settled mismatch ${key} ${b}`);
}
const compact = g => ({ overall: g.overall, byBracket: g.byBracket, ranking: g.ranking });
function restrict(f, source) {
  return { ...f, specs: Object.fromEntries(Object.entries(source.specs).map(([key, s]) =>
    [key, { ...f.specs[key], projection: Object.fromEntries(Object.keys(s.projection)
      .map(b => [b, s.projection[b] ? f.specs[key].projection[b] : null])) }])) };
}
function sourceResult(commit, id, brackets, cutoff) {
  const specs = at(commit, 'data/specs.json'), sources = at(commit, 'data/sources.json');
  const scales = at(commit, 'data/scales.json'), source = sources.find(s => s.id === id);
  const predicted = { ...forecast, specs: Object.fromEntries(specs.map(s =>
    [`${s.class}|${s.spec}`, { projection: Object.fromEntries(brackets.map(b => {
      const raw = s.ratings[b]?.[id] ?? null, score = scoreFor(scales, source.scale, raw);
      return [b, score == null ? null : { tier: consensusTier(score, scales), score }];
    })) }])) };
  const publisher = id === 'icyveins-ptr' ? 'icyveins' : id;
  const reports = {};
  for (const [answer, a] of [['fullConsensus', actual], ['leavePublisherOut', answerExcluding(publisher)]]) {
    reports[answer] = {};
    for (const [model, f] of [['source', predicted], ['ours', restrict(forecast, predicted)],
      ['carryForward', restrict(carryForward(forecast), predicted)]]) {
      reports[answer][model] = compact(gradeSnapshot(f, a, settledScales, { mode: 'grade', specs: settledSpecs }));
    }
  }
  return { cutoff, commit, id, publisher, brackets, pages: source.pages.filter(p => brackets.includes(p.bracket)),
    coverage: { rated: reports.fullConsensus.source.overall.n, eligible: specs.length * brackets.length },
    mapping: scales.scales[source.scale], reports };
}

// Explicit tiers in frozen, attributed paraphrases only. Deliberately no inferred tiers
// from sentiment, implicit ordering, discussion sequence, or later outcomes.
// Native ordinal tiers support ranking only: no invented shared numeric calibration.
const creatorPanels = [
  { creator: 'Zorthas', lane: 'metaNotes', video: 'SV3Snl21XC8', date: '2026-08-09', bracket: 'mplus',
    scope: 'All roles', nativeOrder: ['S', 'A+', 'A', 'A-', 'B', 'C', 'D'],
    tiers: {
      'Mage|Arcane': 'S', 'Warrior|Arms': 'S', 'Demon Hunter|Devourer': 'A+',
      'Shaman|Elemental': 'A', 'Death Knight|Unholy': 'A+', 'Death Knight|Frost': 'A+',
      'Rogue|Subtlety': 'A-', 'Rogue|Outlaw': 'A-', 'Rogue|Assassination': 'A-', 'Monk|Windwalker': 'A-',
      'Shaman|Enhancement': 'B', 'Warlock|Destruction': 'B', 'Warlock|Demonology': 'B', 'Warlock|Affliction': 'C',
      'Demon Hunter|Havoc': 'B', 'Paladin|Retribution': 'B', 'Hunter|Marksmanship': 'C',
      'Hunter|Beast Mastery': 'C', 'Hunter|Survival': 'C', 'Warrior|Fury': 'C', 'Mage|Frost': 'C',
      'Mage|Fire': 'D', 'Evoker|Devastation': 'D', 'Death Knight|Blood': 'S', 'Paladin|Protection': 'A-',
      'Warrior|Protection': 'B', 'Evoker|Preservation': 'A-', 'Priest|Discipline': 'C', 'Druid|Restoration': 'C'
    } },
  { creator: 'AutomaticJak', lane: 'takes', video: 'AfxJlv15i04', date: '2026-08-01', bracket: 'mplus',
    scope: 'Healer', nativeOrder: ['S', 'A', 'B', 'C'],
    tiers: { 'Paladin|Holy': 'S', 'Shaman|Restoration': 'A', 'Priest|Discipline': 'B',
      'Priest|Holy': 'C', 'Druid|Restoration': 'C' } },
  { creator: 'AutomaticJak', lane: 'takes', video: 'SQyKJx6FEVA', date: '2026-08-04', bracket: 'raid',
    scope: 'Healer', nativeOrder: ['S', 'A', 'B', 'C'],
    tiers: { 'Evoker|Preservation': 'A', 'Paladin|Holy': 'A', 'Shaman|Restoration': 'B',
      'Priest|Holy': 'C', 'Monk|Mistweaver': 'C' } },
  { creator: 'YoDaTV', lane: 'takes', video: 'Zc-pNsazA90', date: '2026-08-08', bracket: 'mplus',
    scope: 'All roles', nativeOrder: ['S+', 'S', 'A+', 'A', 'A-', 'B'],
    tiers: { 'Death Knight|Blood': 'S+', 'Paladin|Holy': 'S+', 'Warrior|Arms': 'S+',
      'Warrior|Protection': 'A-', 'Druid|Guardian': 'A', 'Paladin|Retribution': 'B' } },
  { creator: 'LBNinja7', lane: 'takes', video: 'gvh4R_QSwaI', date: '2026-08-02', bracket: 'mplus',
    scope: 'Healer', nativeOrder: ['S+', 'S', 'A'],
    tiers: { 'Monk|Mistweaver': 'A', 'Paladin|Holy': 'S', 'Shaman|Restoration': 'A' } },
  { creator: 'MadSkillzzTV', lane: 'takes', video: 'Zf3GQqG-z8s', date: '2026-07-28', bracket: 'mplus',
    scope: 'Healer', nativeOrder: ['S+', 'S', 'A', 'B+', 'B'],
    tiers: { 'Monk|Mistweaver': 'A', 'Paladin|Holy': 'A', 'Shaman|Restoration': 'A',
      'Priest|Discipline': 'B+', 'Priest|Holy': 'B' } },
  { creator: 'Kalamazi', lane: 'takes', video: 'ZOVnfoXjuoc', date: '2026-07-27', bracket: 'mplus',
    scope: 'Warlock only', nativeOrder: ['1', '2', '3'],
    tiers: { 'Warlock|Demonology': '1', 'Warlock|Affliction': '2', 'Warlock|Destruction': '3' } },
  { creator: 'Bansherz', lane: 'takes', video: '7O6Ri1vo0rc', date: '2026-08-07', bracket: 'mplus',
    scope: 'Hunter only', nativeOrder: ['S', 'A', 'B', 'C'],
    tiers: { 'Hunter|Beast Mastery': 'B', 'Hunter|Marksmanship': 'B', 'Hunter|Survival': 'B' } }
];
const roles = new Map(settledSpecs.map(s => [`${s.class}|${s.spec}`, s.role]));
function panelResult(panel) {
  const entries = frozenTakes[panel.lane].filter(x => x.creator === panel.creator && x.url.includes(panel.video));
  const byKey = new Map(entries.map(x => [`${x.class}|${x.spec}`, x]));
  const rows = Object.entries(panel.tiers).map(([key, nativeTier]) => {
    const evidence = byKey.get(key);
    if (!evidence || evidence.date !== panel.date) throw new Error(`Missing historical evidence ${panel.video} ${key}`);
    return { key, spec: key.replace('|', ' '), role: roles.get(key), bracket: panel.bracket, nativeTier,
      forecastScore: panel.nativeOrder.length - panel.nativeOrder.indexOf(nativeTier),
      actualScore: actual.specs[key].scores[panel.bracket], actualTier: actual.specs[key].consensus[panel.bracket],
      url: evidence.url, date: evidence.date, supersededAtFreeze: evidence.superseded ?? false,
      historicalField: `data/creator-takes.json ${panel.lane}[] ${panel.creator} ${panel.video} ${key}` };
  });
  const noTier = entries.filter(x => !panel.tiers[`${x.class}|${x.spec}`])
    .map(x => ({ spec: `${x.class} ${x.spec}`, reason: 'No unambiguous absolute tier preserved in this video paraphrase', url: x.url }));
  const cleanRanking = rr => Object.fromEntries(Object.entries(rankingFor(rr))
    .filter(([k]) => !k.endsWith('/top-tier')).map(([k, v]) =>
      [k, v.n > v.k ? v : { n: v.n, spearman: v.spearman, ndcg: null, topK: null,
        caveat: 'Tiny cohort; top-k omitted because it would include the entire subset.' }]));
  const oursRows = rows.map(r => ({ ...r, forecastScore: forecast.specs[r.key].projection[panel.bracket].score }));
  const priorRows = rows.map(r => ({ ...r, forecastScore: forecast.specs[r.key].scores[panel.bracket] }));
  return { ...panel, tiers: undefined, cutoff: 'freeze-inputs', commit: forecastCommit,
    coverage: { explicitTiers: rows.length, preservedVideoMentions: entries.length,
      roleUniverse: settledSpecs.filter(s => panel.scope === 'All roles' || s.role === panel.scope
        || panel.scope === `${s.class} only`).length },
    comparison: { creator: cleanRanking(rows), oursSameCells: cleanRanking(oursRows), carryForwardSameCells: cleanRanking(priorRows) },
    caveats: [ 'Historical attributed paraphrases, not freshly verified video transcripts.',
      'This panel is the named dated video, not a claim that it was the creator latest opinion at launch.',
      'No letter accuracy: creator-specific consensus-score calibration is absent.',
      'Ordering within each role; native tier ties remain tied; alphabetical top-k tiebreak follows report-card.',
      'Top-k suppressed where n is no larger than k, so a three-of-three top set cannot look informative; tiny-cohort correlation remains exploratory.',
      'No independent leave-author-out outcome: publisher-author overlap is not established by stored source IDs.' ],
    rows, exclusions: noTier };
}
const result = {
  generatedAt: new Date().toISOString(), forecastCommit, actualCommit,
  validation: { frozenDataHash: reconstructedHash, matchesArtifact: true, topLevelFiles: files.length,
    settledRawConsensusDifferences: 0, settledCellsValidated: 80 },
  methodology: [
    'Outcome is publisher consensus on 2026-09-01, not objective game strength.',
    'Primary comparison uses exact August 11 frozen-input cutoff. Source native tiers normalized with that commit scale, then consensus bands.',
    'Separate August 17 cohort means before Season 2 opening, after patch release and after our freeze; not a head-to-head with equal information.',
    'Every model comparison is on exactly the source-rated cells. Denominators refer to declared bracket scope.',
    'Leave-publisher-out removes Icy Veins live for Icy Veins PTR; this changes the answer key, so do not rank different holdouts against each other.',
    'Top-k is deterministically alphabetical within ties; tied source buckets contain less ordering information than exact scores.'
  ],
  sites: [
    sourceResult(forecastCommit, 'wowhead', ['raid', 'mplus'], 'freeze-inputs'),
    sourceResult(forecastCommit, 'icyveins-ptr', ['mplus'], 'freeze-inputs'),
    sourceResult(forecastCommit, 'icyveins', ['raid', 'mplus'], 'prior-season-carry-forward'),
    sourceResult(forecastCommit, 'method', ['raid', 'mplus'], 'prior-season-carry-forward'),
    sourceResult(forecastCommit, 'archon', ['raid', 'mplus'], 'prior-season-carry-forward'),
    sourceResult(lateCommit, 'wowhead', ['raid', 'mplus'], 'preseason-2026-08-17'),
    sourceResult(lateCommit, 'icyveins', ['raid', 'mplus'], 'preseason-2026-08-17'),
    sourceResult(lateCommit, 'method', ['raid', 'mplus'], 'preseason-2026-08-17')
  ],
  siteExclusions: [
    { id: 'archon', reason: 'Still verified S1 before Season 2 opening; historical measurement, not a S2 prediction.' },
    { id: 'method', cutoff: 'freeze-inputs', reason: 'Verified S1 at our freeze. Separate August 17 pre-season snapshot is scoreable.' },
    { id: 'icyveins', cutoff: 'freeze-inputs', reason: 'Live pages verified S1 at our freeze. Use its separate S2 PTR source there.' },
    { id: 'icyveins-ptr', cutoff: 'preseason-2026-08-17', reason: 'Avoid double-counting publisher; separate live S2 list selected for this later cohort.' }
  ],
  creators: creatorPanels.map(panelResult),
  creatorInventory: { takes: frozenTakes.takes.length, metaNotes: frozenTakes.metaNotes.length,
    fields: [...new Set([...frozenTakes.takes, ...frozenTakes.metaNotes].flatMap(Object.keys))] }
};
// Inspect every historical record, keeping old-patch and supersession scope visible.
// This inventory is broad discovery only; regex hits NEVER assign a tier or rank.
const inventory = {};
for (const lane of ['takes', 'metaNotes']) for (const take of frozenTakes[lane]) {
  const text = take.claim ?? take.note ?? '';
  const kind = /\b(?:S\+?|A[+-]?|B\+?|C|D|F)[ -]tiers?\b|\b(?:S\+|A[+-]|B\+)(?=\W|$)/.test(text)
    ? 'explicit-tier-candidate' : /#[1-9]|\b(?:ranks?|ranked|rankings?)\b|\b(?:top|bottom)[ -]?(?:[1-9]|five|three|two)\b/i.test(text)
    ? 'numeric-or-ranking-candidate' : /\b(?:best|worst|top|bottom|strongest|weakest|ahead of|behind)\b/i.test(text)
    ? 'relative-or-performance-candidate' : null;
  const row = inventory[take.creator] ??= { creator: take.creator, totalRecords: 0, candidates: [],
    disposition: 'Qualitative corpus; manually score only unambiguous absolute placements from a named video. Candidate matching is not placement extraction.' };
  row.totalRecords++;
  if (kind) row.candidates.push({ lane, spec: `${take.class}|${take.spec}`, date: take.date, url: take.url,
    bracket: take.bracket ?? null, patchContext: take.patchContext,
    supersededAtFreeze: take.superseded ?? false, kind,
    scope: /12\.0\.7|Season 1|S1\b/.test(take.patchContext ?? '') && !/12\.1|Season 2|S2\b/.test(take.patchContext ?? '')
      ? 'prior-season-only' : /12\.1|Season 2|S2\b/.test(take.patchContext ?? '') ? 'next-season' : 'unclear',
    includedInScoredPanel: creatorPanels.some(p => p.creator === take.creator && take.url.includes(p.video)
      && p.tiers[`${take.class}|${take.spec}`] != null) });
}
result.creatorInventory.byCreator = Object.values(inventory).sort((a, b) => a.creator.localeCompare(b.creator));
const dispositions = {
  'AutomaticJak': 'Named August 1 M+ and August 4 raid panels partially scoreable; later qualitative revisions retained as supersession, never assigned replacement tiers.',
  Bansherz: 'August 7 Hunter-only B-tier panel preserved; all native tiers tied, so no rank correlation can be computed.',
  Bicepspump: 'The explicit S-tier statement describes prior-season Unholy and is not a S2 prediction.',
  'Dalaran Gaming': 'Rank-keyword hits describe talent ranks, not spec placement. Remaining records are tuning or qualitative claims.',
  'izen (Izenhart)': 'Relative comp recommendations and PTR measured-performance observations; isolated S-tier candidate remark is conditional. No complete absolute tier/rank panel preserved.',
  Kalamazi: 'July 27 three-Warlock ordering explicitly preserved and scored as exploratory tiny-cohort correlation. Later reads concern changed tuning, individual profiles or different brackets.',
  Kesslive: 'Rank-keyword hits describe spell/talent ranks, not spec placement.',
  LBNinja7: 'August 2 corrected healer panel preserves three absolute tiers; remaining four placements are relative prose. July 28 numeric fragments and main-choice discussion retained in inventory, not mixed into corrected panel.',
  MadSkillzzTV: 'July 28 dated panel preserves five explicit tiers; other dated videos include revisions, conditional tiers or question-mark tiers. No inference from held-in-place without a complete same-video placement.',
  Musguete: 'Outlaw S-tier statement conditional on tuning and physical composition; other rank keyword is talent rank. Not a broad unconditional tier panel.',
  Obli: 'Rejecting S-tier framing does not assign a replacement tier; tuning and single-spec comparative claims remain qualitative.',
  Tettles: 'August 8 excerpt preserves Augmentation C, but Balance group has no explicit tier preserved; insufficient same-role coverage for accuracy statistics.',
  VooDooSaurus: 'Rank-keyword hits describe talent ranks; build comparisons do not rank specs.',
  Whispyr: 'Rank-keyword hit describes talent rank, not spec placement.',
  YoDaTV: 'August 8 six-spec panel explicit tiers preserved across roles. Role subsets too small for meaningful top-k; broader July/August videos are older revisions, not combined into a synthetic latest list.',
  Zorthas: 'August 9 full-roster video preserves 29 explicit native tiers of 40 mentions, including 23 DPS; 11 omissions remain unknown. July 26 bottom-five claims describe PTR observations, not a complete launch ranking.'
};
for (const row of result.creatorInventory.byCreator) {
  row.disposition = dispositions[row.creator] ?? row.disposition;
  row.candidateCount = row.candidates.length;
  row.tierOrRankCandidateCount = row.candidates.filter(c => c.kind !== 'relative-or-performance-candidate').length;
}
if (process.argv.includes('--write')) writeFileSync('docs/audit-evidence/2026-09-08-forecast/source-accuracy.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ validation: result.validation, sites: result.sites.map(s => ({ cutoff: s.cutoff, id: s.id,
  coverage: s.coverage, full: s.reports.fullConsensus.source.overall, holdout: s.reports.leavePublisherOut.source.overall })),
  creators: result.creators.map(p => ({ creator: p.creator, date: p.date, bracket: p.bracket, coverage: p.coverage, comparison: p.comparison })) }, null, 2));
