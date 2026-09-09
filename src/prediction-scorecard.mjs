/* Reader-facing right/wrong counts. Original labels stay intact; this deliberately
   separate rule is not a numerical calibration or a replacement for ranking metrics. */
const LETTERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
export const mainTierLetter = tier => typeof tier === 'string'
  ? /^([SABCDEF])(?:[+\-−])?$/.exec(tier)?.[1] ?? null : null;

export function createPredictionScorecard({ cohort, actual, roster }) {
  const specs = roster instanceof Map ? [...roster.values()] : roster;
  const keys = new Set(cohort.scope.keys ?? specs.map(s => s.key));
  const field = specs.filter(s => keys.has(s.key) && cohort.scope.roles.includes(s.role));
  const predictions = new Map(cohort.rows.map(r => [`${r.key}/${r.bracket}`, r]));
  const numeric = cohort.nativeOrder?.length > 0 && cohort.nativeOrder.every(t => /^[1-9]\d*$/.test(t));
  const rows = field.flatMap(spec => cohort.scope.brackets.map(bracket => {
    const p = predictions.get(`${spec.key}/${bracket}`), outcome = actual.specs?.[spec.key];
    const result = { key: spec.key, spec: spec.key.replace('|', ' '), role: spec.role, bracket,
      predicted: p?.tier ?? null, actual: outcome?.consensus?.[bracket] ?? null,
      status: 'not-scored', reason: null, sourceUrl: p?.url ?? cohort.pages?.find(page =>
        page.bracket === bracket && (!page.role || page.role === spec.role))?.url ?? null,
      sourceText: p?.text ?? null, supersededAtFreeze: p?.supersededAtFreeze ?? false };
    if (numeric) {
      const pool = field.filter(s => s.role === spec.role);
      const scores = pool.map(s => actual.specs?.[s.key]?.scores?.[bracket]);
      const complete = scores.every(Number.isFinite);
      const score = outcome?.scores?.[bracket];
      const first = complete ? scores.filter(v => v > score).length + 1 : null;
      const last = complete ? first + scores.filter(v => v === score).length - 1 : null;
      result.actual = complete ? first === last ? first : `Tied ${first}–${last}` : null;
      result.actualTied = complete && first !== last;
      result.predicted = p?.tier != null && /^[1-9]\d*$/.test(p.tier) ? Number(p.tier) : null;
      if (p?.conditional) result.reason = p.reason ?? 'This prediction was conditional.';
      else if (p?.tier == null) result.reason = p?.reason ?? 'No clear prediction was recorded.';
      else if (!complete) result.reason = 'An outcome is missing, so this group cannot be ranked.';
      else if (result.predicted == null || result.predicted > pool.length) result.reason = 'The predicted place is outside the recorded comparison group.';
      else if (first !== last && result.predicted >= first && result.predicted <= last) result.reason = 'The outcome is tied; an exact place cannot be judged.';
      else result.status = result.predicted < first ? 'too-high' : result.predicted > last ? 'too-low' : 'right';
      return result;
    }
    const predictedLetter = mainTierLetter(p?.tier), actualLetter = mainTierLetter(result.actual);
    if (p?.conditional) result.reason = p.reason ?? 'This prediction was conditional.';
    else if (p?.tier == null) result.reason = p?.reason ?? 'No clear prediction was recorded.';
    else if (result.actual == null) result.reason = 'No outcome was recorded for this spec.';
    else if (!predictedLetter || !actualLetter) result.reason = 'These labels do not have comparable main letter tiers.';
    else result.status = predictedLetter === actualLetter ? 'right'
      : LETTERS.indexOf(predictedLetter) < LETTERS.indexOf(actualLetter) ? 'too-high' : 'too-low';
    return result;
  }));
  const right = rows.filter(r => r.status === 'right').length;
  const total = rows.filter(r => r.status !== 'not-scored').length;
  const groupSizes = [...new Set(field.map(s => field.filter(x => x.role === s.role).length))];
  const classes = [...new Set(field.map(s => s.key.split('|')[0]))];
  return { mode: numeric ? 'rank' : 'tier', method: numeric ? 'exact-place' : 'main-letter',
    right, total, wrong: total - right, unscored: rows.length - total, eligible: rows.length,
    outcomeDate: actual.date, rows,
    scopeLabel: numeric ? groupSizes.length === 1 && new Set(field.map(s => s.role)).size === 1
      ? `Ranks among the ${groupSizes[0]} ${classes.length === 1 ? classes[0] + ' ' : ''}specs in this video's comparison.`
      : "Ranks within each role in this video's comparison." : null };
}
