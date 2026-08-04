/* Pure scale-normalization and consensus math. Everything is driven by
   data/scales.json — no tier names or numeric values are hardcoded here. */

export function scoreFor(scales, scaleId, tier) {
  if (tier === null || tier === undefined || tier === "—") return null;
  const scale = scales.scales[scaleId];
  if (!scale) throw new Error(`Unknown scale "${scaleId}"`);
  const value = scale.values[tier];
  if (value === undefined) throw new Error(`Tier "${tier}" is not defined in scale "${scaleId}"`);
  return value;
}

export function consensusTier(score, scales) {
  for (const band of scales.consensus.bands) {
    if (score >= band.min) return band.tier;
  }
  return scales.consensus.bands.at(-1).tier;
}

/* A tier-list source whose letters describe a patch we are NOT running. The consensus is
   the CURRENT-patch picture (12.0.7 / Season 1), so a PTR list's letters must never be
   averaged into it — a 12.1 opinion and a 12.0.7 opinion are not two readings of one
   thing. Era-gating here rather than by omitting the source from the registry is what
   lets a PTR list still be stored in spec.ratings, shown in the 12.1 views, and consumed
   by the projection, while the live mean stays composed of live sources only.

   Consequence worth knowing: because the live source SET is unchanged by adding an
   era:"ptr" source, CONSENSUS_VERSION (render.mjs) does NOT move and no movement
   baseline is invalidated. Retyping or removing a LIVE source still does. */
/* ---- The era vocabulary, in ONE place (S2 transition scope, Phase 1) ----
   Every "which patch is live / which is PTR" literal in the pipeline reads from here,
   so the 12.1 launch and every later cycle is a config edit, not a code sweep:
     · liveSeason  — feeds the consensus rule below ("a list feeds the consensus only
                     when it describes the current live season")
     · liveLabel   — the Era toggle's live position
     · ptr         — null BETWEEN cycles (post-sunset, pre-announcement); its `marker`
                     is the exact substring that makes a metric name PTR-era and the
                     key takeEra/expertRead classify creator takes by
     · ptrSunset   — flips true at settlement (+14): PTR surfaces leave the UI while
                     the frozen forecast stays (DECISION 2/3, s2-transition-scope.md)
   At 12.1 launch: liveSeason -> "s2", liveLabel -> "12.1", ptr -> null (until the 12.2
   thread appears), alongside the SNAPSHOT_PHASE flip in render.mjs. */
export const PHASES = {
  liveSeason: "s1",
  liveLabel: "12.0.7",
  ptr: { marker: "12.1 PTR", label: "12.1 PTR" },
  ptrSunset: false,
};

export const isLiveEra = source => (source.era ?? "live") === "live";
/* The PTR-era tier lists, in registry order — the external 12.1 letter opinions that
   projectionFor consumes and the 12.0.7-only view hides. */
export const ptrTierSources = sources =>
  (sources ?? []).filter(s => s.kind === "tier-list" && !isLiveEra(s));

/* ratingsBySource: e.g. { icyveins: "A", method: "S" }
   sources: the registry from data/sources.json (only LIVE-era kind === "tier-list"
   entries count — see isLiveEra above)
   Returns null when no source has rated the spec in this bracket. */
/* A source's pages record which SEASON the page actually described at refresh
   (`seasonVerified: "s1"|"s2"` — written by the era-verify step; absent = never
   checked, treated as current). The rule is permanent, not a transition mode: a list
   feeds the consensus only when it describes the current live season. Mid-transition
   that shrinks the consensus to the outlets that have flipped ("consensus of 2") and
   it recovers by itself as pages update — and it equally keeps an outlet that flips
   EARLY out of the pre-launch consensus, in both cases because averaging two seasons
   into one number is the lie this column must never tell (DECISION 1). */
export const sourceSeasonOk = (source, bracket, liveSeason = PHASES.liveSeason) =>
  !(source.pages ?? []).some(pg =>
    (bracket == null || pg.bracket === bracket) &&
    pg.seasonVerified != null && pg.seasonVerified !== liveSeason);

export function consensusFor(ratingsBySource, sources, scales, bracket = null, liveSeason = PHASES.liveSeason) {
  const perSource = [];
  for (const source of sources) {
    if (source.kind !== "tier-list" || !isLiveEra(source)) continue;
    if (!sourceSeasonOk(source, bracket, liveSeason)) continue;
    const tier = ratingsBySource?.[source.id] ?? null;
    const score = scoreFor(scales, source.scale, tier);
    if (score !== null) perSource.push({ source: source.id, label: source.name, tier, score });
  }
  if (perSource.length === 0) return null;

  const mean = perSource.reduce((sum, p) => sum + p.score, 0) / perSource.length;
  const spread = Math.max(...perSource.map(p => p.score)) - Math.min(...perSource.map(p => p.score));
  return {
    tier: consensusTier(mean, scales),
    score: Math.round(mean),
    spread,
    diverges: perSource.length > 1 && spread >= scales.consensus.spreadThreshold,
    perSource
  };
}
