/* An accounting-only intake lane. Sentiment in creator-takes.json never supplies ranks. */
const ROLES = new Set(['DPS', 'Healer', 'Tank']);
const BRACKETS = new Set(['raid', 'mplus']);
const HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be',
  'hackmd.io', 'kalamazi.gg', 'www.kalamazi.gg', 'wingsisup.com']);
const dateOK = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export const creatorPredictionUrlAllowed = value => {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password
    && (!u.port || u.port === '443') && HOSTS.has(u.hostname); } catch { return false; }
};
export function creatorPredictionResource(value) {
  if (!creatorPredictionUrlAllowed(value)) return null;
  const url = new URL(value);
  if (url.hostname === 'youtu.be') return `youtube:${url.pathname.split('/').filter(Boolean)[0] ?? ''}`;
  if (url.hostname.endsWith('youtube.com')) return `youtube:${url.searchParams.get('v') ?? url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? ''}`;
  url.hash = '';
  return url.href;
}

export function validateCreatorPredictions(ledger, { specs = [], community, now = new Date().toISOString().slice(0, 10) } = {}) {
  if (ledger == null) return [];
  if (ledger.schemaVersion !== 1 || !Array.isArray(ledger.panels)) return ['creator predictions: expected schemaVersion 1 and panels array'];
  const errors = [], ids = new Set(), roster = new Map(specs.map(s => [`${s.class}|${s.spec}`, s.role]));
  const creators = community ? new Set([...(community.classes ?? []).flatMap(c => c.creators ?? []),
    ...(community.generalCreators ?? [])].map(c => c.name)) : null;
  for (const panel of ledger.panels) {
    const label = `creator predictions ${panel?.id ?? '(unnamed)'}`;
    if (!panel || typeof panel !== 'object') { errors.push(`${label}: invalid panel`); continue; }
    if (!panel.id || ids.has(panel.id)) errors.push(`${label}: missing or duplicate ID`);
    ids.add(panel.id);
    if (!panel.creator || (creators && !creators.has(panel.creator))) errors.push(`${label}: unknown creator`);
    if (!panel.label || !panel.scopeNote || !/^s\d+$/.test(panel.season ?? '')) errors.push(`${label}: needs label, season and content lens`);
    if (!dateOK(panel.date) || !dateOK(panel.capturedAt) || panel.date > panel.capturedAt || panel.capturedAt > now) errors.push(`${label}: invalid publication/capture dates`);
    if (!Array.isArray(panel.nativeOrder) || !panel.nativeOrder.length || panel.nativeOrder.some(v => typeof v !== 'string' || !v)
      || new Set(panel.nativeOrder).size !== panel.nativeOrder.length) errors.push(`${label}: needs the source's explicit native order`);
    if (!Array.isArray(panel.scope?.brackets) || !panel.scope.brackets.length || panel.scope.brackets.some(b => !BRACKETS.has(b))
      || !Array.isArray(panel.scope?.roles) || !panel.scope.roles.length || panel.scope.roles.some(r => !ROLES.has(r))) errors.push(`${label}: invalid bracket/role scope`);
    for (const field of ['brackets', 'roles', 'keys']) if (panel.scope?.[field] != null
      && (!Array.isArray(panel.scope[field]) || new Set(panel.scope[field]).size !== panel.scope[field].length)) errors.push(`${label}: duplicate or invalid scope ${field}`);
    const keys = new Set(panel.scope?.keys ?? roster.keys());
    if ([...keys].some(k => !roster.has(k))) errors.push(`${label}: unknown spec in scope`);
    if (!Array.isArray(panel.pages) || !panel.pages.length) errors.push(`${label}: missing source page`);
    for (const p of panel.pages ?? []) if (!creatorPredictionUrlAllowed(p.url) || p.published !== panel.date || !dateOK(p.snapshot)
      || p.snapshot > panel.capturedAt || p.snapshot < p.published) errors.push(`${label}: invalid source page or dates`);
    const resources = new Set((panel.pages ?? []).map(p => creatorPredictionResource(p.url)));
    if (!Array.isArray(panel.rows) || !panel.rows.length) errors.push(`${label}: no preserved statements`);
    const rows = new Set();
    for (const row of panel.rows ?? []) {
      const key = `${row.key}/${row.bracket}`;
      if (rows.has(key)) errors.push(`${label}: duplicate placement ${key}`);
      rows.add(key);
      if (!roster.has(row.key) || !keys.has(row.key) || !panel.scope?.brackets?.includes(row.bracket)
        || !panel.scope?.roles?.includes(roster.get(row.key))) errors.push(`${label}: placement outside scope ${key}`);
      if (row.tier == null ? !row.reason : !panel.nativeOrder?.includes(row.tier)) errors.push(`${label}: placement needs a native tier or exclusion reason`);
      if (row.conditional && row.tier != null) errors.push(`${label}: conditional predictions must remain unscored`);
      if (!creatorPredictionUrlAllowed(row.url) || row.date !== panel.date || !row.context || !row.text || typeof row.supersededAtFreeze !== 'boolean') errors.push(`${label}: missing dated, attributed statement evidence`);
      if (!resources.has(creatorPredictionResource(row.url))) errors.push(`${label}: statement belongs to a different source panel`);
    }
  }
  return errors;
}

export function captureCreatorPredictions(ledger, { date, season }) {
  return structuredClone((ledger?.panels ?? []).filter(p => p.season === season && p.date <= date && p.capturedAt <= date));
}
