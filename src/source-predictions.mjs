/* Historical source predictions are raw receipts, not consensus inputs. Build-time
   grading needs no git/network access and never recalculates the frozen forecast. */
import { createHash } from 'node:crypto';
import { gradeSnapshot, rankingFor, GRADING_VERSION } from './report-card.mjs';
import { PHASES, scoreFor, consensusTier, consensusFor, frozenLettersFor } from './normalize.mjs';
import { creatorPredictionUrlAllowed, creatorPredictionResource } from './creator-predictions.mjs';
import { createPredictionScorecard } from './prediction-scorecard.mjs';

const BRACKETS = ['raid', 'mplus'];
const ROLES = ['DPS', 'Healer', 'Tank'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SHA = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
const SITE_HOSTS = {
  icyveins: ['www.icy-veins.com', 'icy-veins.com'],
  'icyveins-ptr': ['www.icy-veins.com', 'icy-veins.com'],
  method: ['www.method.gg', 'method.gg'],
  wowhead: ['www.wowhead.com', 'wowhead.com'],
  archon: ['www.archon.gg', 'archon.gg']
};
const keyOf = s => s.key ?? `${s.class}|${s.spec}`;
const clone = value => structuredClone(value);
const hashOf = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sorted = values => [...values].sort();

export function captureSourceReceipts(data) {
  return clone({ schemaVersion: 1,
    liveSeason: data.liveSeason ?? data.meta?.phases?.liveSeason ?? PHASES.liveSeason,
    scales: data.scales, sources: (data.sources ?? []).filter(s => s.kind === 'tier-list'),
    seasonFinal: data.seasonFinal ?? {} });
}

export function sourceReceiptHash(receipt) {
  return hashOf({ sourceReceipts: receipt.sourceReceipts, sourceRatings: receipt.sourceRatings });
}

/* New forecast freezes carry the original registries/scales/ratings directly. They
   can create their prediction ledger without this season's git recovery helper. */
export function ledgerFromArtifact(artifact, { launchDate } = {}) {
  if (!artifact?.sourceReceipts || !artifact?.cells) return null;
  const receipt = artifact.sourceReceipts;
  const season = artifact.targetSeason;
  if (!season || !DATE.test(launchDate ?? '')) throw new Error('source predictions: future artifact needs targetSeason and launchDate');
  const roster = Object.entries(artifact.cells).map(([key, s]) => ({ key, role: s.role }));
  const artifactHash = hashOf(artifact);
  const provenance = { gitSha: artifact.gitSha, sourcePath: `data/forecasts/frozen-${artifact.date}.json`,
    sourceBlobSha256: artifactHash, provenance: 'frozen-artifact', sourceEncoding: 'canonical-json' };
  const cohorts = [];
  for (const source of receipt.sources) {
    const pages = (source.pages ?? []).filter(p => !p.ancillary && BRACKETS.includes(p.bracket));
    const brackets = BRACKETS.filter(b => {
      const sub = pages.filter(p => p.bracket === b);
      return sub.length && sub.every(p => p.seasonVerified === season && p.snapshot <= artifact.date);
    });
    if (!brackets.length) continue;
    cohorts.push({ id: `same-cutoff-${source.id}`, label: source.name, kind: 'site', comparisonGroup: 'same-cutoff',
      sourceId: source.id, publisher: source.id.replace(/-ptr$/, ''), season, cutoffDate: artifact.date,
      date: pages.filter(p => brackets.includes(p.bracket)).map(p => p.published).filter(Boolean).sort().at(-1) ?? null,
      ...provenance, scope: { brackets, roles: ROLES }, scopeNote: source.methodology,
      pages: pages.filter(p => brackets.includes(p.bracket)), nativeScale: { id: source.scale, ...receipt.scales.scales[source.scale] },
      rows: Object.entries(artifact.cells).flatMap(([key, s]) => brackets.map(bracket => {
        const tier = s.sourceRatings?.[bracket]?.[source.id] ?? null;
        return { key, bracket, tier, ...(tier == null ? { reason: 'No placement preserved at freeze' } : {}) };
      })) });
  }
  for (const panel of artifact.creatorPredictions ?? []) {
    if (panel.season !== season || panel.date > artifact.date || panel.capturedAt > artifact.date) {
      throw new Error('source predictions: creator panel not eligible at artifact freeze');
    }
    cohorts.push({ ...clone(panel), label: panel.label ?? panel.creator, kind: 'creator', comparisonGroup: 'creator',
      cutoffDate: artifact.date, ...provenance });
  }
  if (!cohorts.length) return null;
  const ledger = { kind: 'source-predictions', schemaVersion: 1, season, priorSeason: receipt.liveSeason,
    forecastDate: artifact.date, launchDate, freeze: { gitSha: artifact.gitSha, dataSha256: artifact.dataSha256 },
    consensusScale: clone(receipt.scales.consensus), roster, cohorts, outcomes: [] };
  const errors = validateSourcePredictions(ledger, { frozenForecast: artifact });
  if (errors.length) throw new Error(errors.join('; '));
  return ledger;
}

function safeUrl(value, hosts) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password
    && (!u.port || u.port === '443') && hosts.includes(u.hostname); } catch { return false; }
}
function scaleErrors(scale, label) {
  if (!scale || !Array.isArray(scale.tiers) || !scale.tiers.length || !scale.values) return [`${label}: missing native scale`];
  const errors = [];
  if (new Set(scale.tiers).size !== scale.tiers.length) errors.push(`${label}: duplicate native tier`);
  for (const tier of scale.tiers) if (!Number.isFinite(scale.values[tier])
    || scale.values[tier] < 0 || scale.values[tier] > 100) errors.push(`${label}: invalid scale value ${tier}`);
  for (let i = 1; i < scale.tiers.length; i++) if (scale.values[scale.tiers[i]] >= scale.values[scale.tiers[i - 1]]) {
    errors.push(`${label}: native tier order must descend`);
  }
  return errors;
}
function receiptErrors(receipt, label) {
  const errors = [];
  if (!receipt || receipt.schemaVersion !== 1 || !receipt.liveSeason || !Array.isArray(receipt.sources)
    || !receipt.scales?.scales || !Array.isArray(receipt.scales?.consensus?.bands)) return [`${label}: incomplete source receipts`];
  const ids = new Set();
  for (const source of receipt.sources) {
    if (ids.has(source.id)) errors.push(`${label}: duplicate source ${source.id}`);
    ids.add(source.id);
    if (source.kind !== 'tier-list' || !SITE_HOSTS[source.id]) errors.push(`${label}: unsupported tier publisher ${source.id}`);
    errors.push(...scaleErrors(receipt.scales.scales[source.scale], `${label} ${source.id}`));
    for (const page of source.pages ?? []) {
      if (!safeUrl(page.url, SITE_HOSTS[source.id] ?? [])) errors.push(`${label}: unsafe source URL`);
      if (!DATE.test(page.snapshot ?? '') || (page.published != null && (!DATE.test(page.published) || page.published > page.snapshot))) {
        errors.push(`${label}: invalid page dates`);
      }
    }
  }
  return errors;
}

export function validateSourcePredictions(ledger, { frozenForecast } = {}) {
  if (!ledger) return [];
  const errors = [];
  if (ledger.kind !== 'source-predictions' || ledger.schemaVersion !== 1) errors.push('source predictions: unsupported ledger');
  if (!Array.isArray(ledger.roster) || !Array.isArray(ledger.cohorts) || !Array.isArray(ledger.outcomes)) {
    return [...errors, 'source predictions: roster, cohorts and outcomes must be arrays'];
  }
  if (!DATE.test(ledger.forecastDate ?? '') || !DATE.test(ledger.launchDate ?? '')
    || ledger.forecastDate >= ledger.launchDate) errors.push('source predictions: invalid cycle dates');
  if (!SHA.test(ledger.freeze?.gitSha ?? '') || !HASH.test(ledger.freeze?.dataSha256 ?? '')) errors.push('source predictions: unknown freeze provenance');
  if (frozenForecast && (ledger.forecastDate !== frozenForecast.date || ledger.freeze?.gitSha !== frozenForecast.gitSha
    || ledger.freeze?.dataSha256 !== frozenForecast.dataSha256)) errors.push('source predictions: frozen artifact provenance mismatch');
  if (!Array.isArray(ledger.roster) || !ledger.roster.length) errors.push('source predictions: missing historical roster');
  const roster = new Map((ledger.roster ?? []).map(s => [s.key, s]));
  if (roster.size !== ledger.roster?.length || [...roster.values()].some(s => !ROLES.includes(s.role))) errors.push('source predictions: invalid historical roster');
  const cohortIds = new Set();
  for (const c of ledger.cohorts ?? []) {
    if (!c || !Array.isArray(c.rows) || !Array.isArray(c.scope?.brackets) || !Array.isArray(c.scope?.roles)) {
      errors.push('source predictions: invalid cohort rows or scope'); continue;
    }
    const label = `source predictions ${c.id}`;
    if (!c.id || cohortIds.has(c.id)) errors.push(`${label}: duplicate/missing cohort ID`);
    cohortIds.add(c.id);
    if (!['site', 'creator'].includes(c.kind)) errors.push(`${label}: unknown cohort kind`);
    if (!['same-cutoff', 'older-season', 'later-prelaunch', 'creator'].includes(c.comparisonGroup)) errors.push(`${label}: invalid comparison group`);
    if (!SHA.test(c.gitSha ?? '') || !c.sourcePath || !HASH.test(c.sourceBlobSha256 ?? '')) errors.push(`${label}: unknown historical provenance`);
    if (!DATE.test(c.cutoffDate ?? '') || c.cutoffDate >= ledger.launchDate) errors.push(`${label}: source cutoff is not prelaunch`);
    if ((c.comparisonGroup === 'same-cutoff' || c.kind === 'creator' || c.comparisonGroup === 'older-season')
      && c.cutoffDate > ledger.forecastDate) errors.push(`${label}: later information in frozen cutoff`);
    if (c.comparisonGroup === 'later-prelaunch' && c.cutoffDate <= ledger.forecastDate) errors.push(`${label}: later cohort has wrong cutoff`);
    if (!c.scope?.brackets?.length || c.scope.brackets.some(b => !BRACKETS.includes(b))
      || !c.scope?.roles?.length || c.scope.roles.some(r => !ROLES.includes(r))) errors.push(`${label}: invalid scope`);
    if (new Set(c.scope.brackets).size !== c.scope.brackets.length || new Set(c.scope.roles).size !== c.scope.roles.length
      || (c.scope.keys && new Set(c.scope.keys).size !== c.scope.keys.length)) errors.push(`${label}: duplicate scope member`);
    const scopeKeys = new Set(c.scope?.keys ?? roster.keys());
    if ([...scopeKeys].some(k => !roster.has(k))) errors.push(`${label}: scope names unknown spec`);
    if (c.kind === 'site') {
      if (!SITE_HOSTS[c.sourceId] || !SITE_HOSTS[c.publisher]) errors.push(`${label}: unknown publisher`);
      errors.push(...scaleErrors(c.nativeScale, label));
      const expectedSeason = c.comparisonGroup === 'older-season' ? ledger.priorSeason : ledger.season;
      if (c.season !== expectedSeason) errors.push(`${label}: wrong prediction season`);
      if (!c.pages?.length) errors.push(`${label}: missing source pages`);
      for (const p of c.pages ?? []) {
        if (!safeUrl(p.url, SITE_HOSTS[c.sourceId] ?? [])) errors.push(`${label}: unsafe source URL`);
        if (!DATE.test(p.snapshot ?? '') || p.snapshot > c.cutoffDate
          || p.seasonVerified !== expectedSeason) errors.push(`${label}: source page not eligible at cutoff`);
        if (p.published != null && (!DATE.test(p.published) || p.published > p.snapshot)) errors.push(`${label}: invalid publication date`);
      }
    } else {
      if (!Array.isArray(c.nativeOrder) || !c.nativeOrder.length
        || new Set(c.nativeOrder).size !== c.nativeOrder.length) errors.push(`${label}: unknown native order`);
      if (c.comparisonGroup !== 'creator' || c.season !== ledger.season) errors.push(`${label}: invalid creator season/group`);
      for (const page of c.pages ?? []) if (!creatorPredictionUrlAllowed(page.url)
        || !DATE.test(page.published ?? '') || !DATE.test(page.snapshot ?? '')
        || page.published > c.cutoffDate || page.snapshot > c.cutoffDate) errors.push(`${label}: invalid creator page receipt`);
    }
    const resources = new Set((c.pages ?? []).map(p => creatorPredictionResource(p.url)));
    const rows = new Set();
    for (const r of c.rows ?? []) {
      const rk = `${r.key}/${r.bracket}`;
      if (rows.has(rk)) errors.push(`${label}: duplicate placement ${rk}`);
      rows.add(rk);
      if (!roster.has(r.key) || !scopeKeys.has(r.key) || !c.scope?.brackets?.includes(r.bracket)
        || !c.scope?.roles?.includes(roster.get(r.key)?.role)) errors.push(`${label}: placement outside declared scope ${rk}`);
      if (r.tier == null) { if (!r.reason) errors.push(`${label}: missing tier without reason`); }
      else if (!(c.kind === 'site' ? c.nativeScale?.tiers : c.nativeOrder)?.includes(r.tier)) errors.push(`${label}: unknown tier ${r.tier}`);
      if (c.kind === 'creator') {
        if (r.conditional && r.tier != null) errors.push(`${label}: conditional predictions must remain unscored`);
        if (!creatorPredictionUrlAllowed(r.url)) errors.push(`${label}: unsafe creator URL`);
        if (!resources.has(creatorPredictionResource(r.url))) errors.push(`${label}: statement belongs to a different source panel`);
        if (!DATE.test(r.date ?? '') || r.date > c.cutoffDate || r.date !== c.date) errors.push(`${label}: creator claim after cutoff or from another panel`);
        if (!r.context || !r.text || typeof r.supersededAtFreeze !== 'boolean') errors.push(`${label}: missing attributed creator context`);
      }
    }
  }
  if (!cohortIds.size) errors.push('source predictions: empty cohort list');
  const dates = new Set();
  for (const outcome of ledger.outcomes ?? []) {
    if (!DATE.test(outcome.date ?? '') || outcome.date < ledger.launchDate || dates.has(outcome.date)) errors.push('source predictions: invalid/duplicate outcome date');
    dates.add(outcome.date);
    if (!SHA.test(outcome.gitSha ?? '') || !HASH.test(outcome.receiptSha256 ?? '')) errors.push('source predictions: unknown outcome provenance');
    errors.push(...receiptErrors(outcome.sourceReceipts, `source predictions outcome ${outcome.date}`));
    if (sourceReceiptHash(outcome) !== outcome.receiptSha256) errors.push(`source predictions outcome ${outcome.date}: raw receipt checksum mismatch`);
  }
  return errors;
}

function reconstructOutcome(actual, receipt, excludedPublisher = null) {
  const { sourceReceipts, sourceRatings } = receipt;
  const errors = receiptErrors(sourceReceipts, `outcome ${actual.date}`);
  if (errors.length) throw new Error(errors.join('; '));
  if (sourceReceipts.sources.some(s => s.pages?.some(p => p.snapshot > actual.date))) throw new Error(`outcome ${actual.date}: source receipt from the future`);
  const sourceById = new Map(sourceReceipts.sources.map(s => [s.id, s]));
  const specs = {};
  for (const [key, saved] of Object.entries(actual.specs ?? {})) {
    if (!sourceRatings?.[key]) throw new Error(`outcome ${actual.date}: raw letters missing for ${key}`);
    for (const bracket of BRACKETS) for (const [id, tier] of Object.entries(sourceRatings[key][bracket] ?? {})) {
      if (!sourceById.has(id)) throw new Error(`outcome ${actual.date}: unknown publisher ${id}`);
      scoreFor(sourceReceipts.scales, sourceById.get(id).scale, tier); // also rejects unknown native tiers
    }
    const consensus = {}, scores = {}, consensusSources = {};
    for (const bracket of BRACKETS) {
      const sourceSet = sourceReceipts.sources.filter(s => s.id !== excludedPublisher);
      const frozen = frozenLettersFor(sourceReceipts.seasonFinal, key, bracket, sourceReceipts.liveSeason);
      const c = consensusFor(sourceRatings[key][bracket], sourceSet, sourceReceipts.scales,
        bracket, sourceReceipts.liveSeason, frozen);
      consensus[bracket] = c?.tier ?? null;
      scores[bracket] = c?.score ?? null;
      consensusSources[bracket] = c?.perSource.map(s => s.source) ?? [];
      if (!excludedPublisher && ((saved.consensus?.[bracket] ?? null) !== consensus[bracket]
        || (saved.scores?.[bracket] ?? null) !== scores[bracket]
        || JSON.stringify(sorted(saved.consensusSources?.[bracket] ?? [])) !== JSON.stringify(sorted(consensusSources[bracket])))) {
        throw new Error(`outcome ${actual.date}: raw receipt disagrees with saved consensus for ${key} ${bracket}`);
      }
    }
    specs[key] = { consensus, scores, consensusSources };
  }
  return { ...actual, specs };
}

function receiptFor(ledger, checkpoint) {
  if (checkpoint.sourceReceipts) return { sourceReceipts: checkpoint.sourceReceipts,
    sourceRatings: Object.fromEntries(Object.entries(checkpoint.specs ?? {}).map(([k, s]) => [k, s.sourceRatings])) };
  return ledger.outcomes?.find(o => o.date === checkpoint.date) ?? null;
}

function comparisonFor(cohort, forecast, actual, scales, roster) {
  const rows = [], exclusions = [];
  const scopeKeys = new Set(cohort.scope.keys ?? roster.keys());
  const eligible = [...roster.values()].filter(s => scopeKeys.has(s.key) && cohort.scope.roles.includes(s.role))
    .flatMap(s => cohort.scope.brackets.map(bracket => ({ key: s.key, bracket })));
  const predictions = new Map(cohort.rows.map(r => [`${r.key}/${r.bracket}`, r]));
  const coverage = { rated: 0, eligible: eligible.length, matched: 0, missingPrediction: 0, missingOutcome: 0, missingBaseline: 0 };
  for (const { key, bracket } of eligible) {
    const prediction = predictions.get(`${key}/${bracket}`);
    let reason = null;
    if (prediction?.tier == null) { coverage.missingPrediction++; reason = prediction?.reason ?? 'No explicit placement preserved'; }
    else {
      coverage.rated++;
      const a = actual.specs?.[key], f = forecast.specs?.[key];
      if (a?.consensus?.[bracket] == null || !Number.isFinite(a?.scores?.[bracket])) { coverage.missingOutcome++; reason = 'No gradeable settled outcome'; }
      else if (!Number.isFinite(f?.projection?.[bracket]?.score) || !f?.projection?.[bracket]?.tier
        || !Number.isFinite(f?.scores?.[bracket]) || !f?.consensus?.[bracket]) { coverage.missingBaseline++; reason = 'Frozen model or carry-forward missing; excluded from all comparisons'; }
      else {
        const nativeScore = cohort.kind === 'site' ? cohort.nativeScale.values[prediction.tier]
          : cohort.nativeOrder.length - cohort.nativeOrder.indexOf(prediction.tier);
        rows.push({ ...prediction, spec: key.replace('|', ' '), role: roster.get(key).role,
          nativeTier: prediction.tier, forecastScore: nativeScore,
          ...(cohort.kind === 'site' ? { forecastTier: consensusTier(nativeScore, scales) } : {}),
          actualScore: a.scores[bracket], actualTier: a.consensus[bracket],
          oursScore: f.projection[bracket].score, oursTier: f.projection[bracket].tier,
          baselineScore: f.scores[bracket], baselineTier: f.consensus[bracket] });
      }
    }
    if (reason) exclusions.push({ key, bracket, reason });
  }
  coverage.matched = rows.length;
  const reports = {};
  for (const model of ['source', 'ours', 'baseline']) {
    const forecastRows = rows.map(r => ({ ...r,
      forecastScore: model === 'source' ? r.forecastScore : model === 'ours' ? r.oursScore : r.baselineScore,
      forecastTier: model === 'source' ? r.forecastTier : model === 'ours' ? r.oursTier : r.baselineTier }));
    if (cohort.kind === 'creator') {
      const rankRows = forecastRows.map(r => ({ spec: r.spec, role: r.role, bracket: r.bracket,
        forecastScore: r.forecastScore, actualScore: r.actualScore }));
      reports[model] = { kind: 'ordering', gradingVersion: GRADING_VERSION, coverage, ranking: rankingFor(rankRows), rows: rankRows };
    } else {
      const predictedSpecs = {}, actualSpecs = {};
      for (const r of forecastRows) {
        (predictedSpecs[r.key] ??= { ...forecast.specs[r.key], projection: {} }).projection[r.bracket] = { tier: r.forecastTier, score: r.forecastScore };
        const a = actualSpecs[r.key] ??= { consensus: {}, scores: {}, consensusSources: {} };
        a.consensus[r.bracket] = r.actualTier; a.scores[r.bracket] = r.actualScore;
        a.consensusSources[r.bracket] = actual.specs[r.key].consensusSources?.[r.bracket] ?? [];
      }
      reports[model] = gradeSnapshot({ ...forecast, specs: predictedSpecs }, { ...actual, specs: actualSpecs }, scales,
        { mode: 'grade', specs: [...roster.values()].map(s => ({ class: s.key.split('|')[0], spec: s.key.split('|')[1], role: s.role })) });
      // gradeSnapshot has a global two-bracket denominator; this report has explicit scope.
      reports[model].coverage = { ...coverage, graded: rows.length, obtainable: eligible.length,
        coveragePct: eligible.length ? Math.round(rows.length / eligible.length * 100) : 0 };
    }
  }
  return { coverage, rows, exclusions, ...reports };
}

export function createSourcePredictionReport({ ledger, checkpoint, forecast, scales, specs = [] } = {}) {
  if (!ledger || !checkpoint) return { status: 'unavailable', reason: !ledger ? 'No preserved source predictions' : 'Checkpoint pending', cohorts: [] };
  const errors = validateSourcePredictions(ledger);
  if (errors.length) throw new Error(errors.join('; '));
  if (!forecast || forecast.date !== ledger.forecastDate) throw new Error('source predictions: forecast cutoff mismatch');
  if (checkpoint.date < ledger.launchDate) throw new Error('source predictions: cannot grade a prelaunch outcome');
  const roster = new Map(ledger.roster.map(s => [s.key, s]));
  // Live roster can gain specs; original prediction scope always remains historical.
  for (const s of specs) if (roster.has(keyOf(s)) && roster.get(keyOf(s)).role !== s.role) throw new Error('source predictions: historical role changed');
  const receipt = receiptFor(ledger, checkpoint);
  if (receipt) reconstructOutcome(checkpoint, receipt); // fail closed before any holdout numbers
  // The axis at a fixed checkpoint is part of its receipt. Later live scale edits
  // must not rewrite an old prediction grade. New artifact ledgers preserve the
  // fallback axis at freeze; the recovered ledger has its original settled axis.
  const priorReceipt = ledger.outcomes?.filter(o => o.date <= checkpoint.date).sort((a, b) => a.date.localeCompare(b.date))[0];
  const gradingScales = receipt?.sourceReceipts.scales ?? (ledger.consensusScale
    ? { consensus: ledger.consensusScale } : priorReceipt?.sourceReceipts.scales);
  if (!gradingScales) throw new Error('source predictions: no preserved consensus axis for this checkpoint');
  const cohorts = ledger.cohorts.map(cohort => {
    const full = comparisonFor(cohort, forecast, checkpoint, gradingScales, roster);
    let holdout;
    if (cohort.kind === 'creator') holdout = { status: 'not-applicable', reason: 'Creator-to-publisher authorship is not independently recorded; no author holdout claimed.' };
    else if (!receipt) holdout = { status: 'unavailable', excludedPublisher: cohort.publisher,
      reason: 'This checkpoint lacks preserved raw publisher letters and scales; full-consensus agreement only.' };
    else {
      const held = reconstructOutcome(checkpoint, receipt, cohort.publisher);
      const comp = comparisonFor(cohort, forecast, held, gradingScales, roster);
      holdout = { status: 'ready', excludedPublisher: cohort.publisher, ...comp };
    }
    const warnings = [
      'Agreement with settled publisher opinion, not objective spec strength.',
      ...(cohort.kind === 'creator' ? [ 'Named dated video panel; not necessarily the creator final launch opinion.',
        'Only explicit preserved placements are ordered. Missing placements and within-tier ordering remain unknown.',
        ...(cohort.rows.some(r => r.tier != null && r.supersededAtFreeze)
          ? ['Some scored statements had already been superseded at the freeze; read this historical panel at its publication date.'] : []) ] : []),
      ...(cohort.comparisonGroup === 'later-prelaunch' ? ['Later information than our frozen forecast; not an equal-cutoff competition.'] : []),
      ...(cohort.comparisonGroup === 'older-season' ? ['Previous-season carry-forward benchmark, not a prediction of this season.'] : []),
      ...(cohort.scopeNote ? [cohort.scopeNote] : [])
    ];
    const { nativeScale, nativeOrder, rows: rawRows, ...meta } = cohort;
    return { ...meta, nativeScale: nativeScale ?? null, nativeOrder: nativeOrder ?? null,
      scorecard: createPredictionScorecard({ cohort, actual: checkpoint, roster }),
      ...full, fullConsensus: { source: full.source, ours: full.ours, baseline: full.baseline }, holdout,
      rawRows, warnings };
  });
  return { status: 'ready', actualDate: checkpoint.date, forecastDate: forecast.date,
    gradingVersion: GRADING_VERSION,
    rawOutcomeAvailable: Boolean(receipt), cohorts,
    warnings: ['Compare sources only within the same cutoff, role and covered cells. Publisher holdouts use different answer keys across publishers.'] };
}
