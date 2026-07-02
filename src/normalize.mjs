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

/* ratingsBySource: e.g. { icyveins: "A", method: "S" }
   sources: the registry from data/sources.json (only kind === "tier-list" entries count)
   Returns null when no source has rated the spec in this bracket. */
export function consensusFor(ratingsBySource, sources, scales) {
  const perSource = [];
  for (const source of sources) {
    if (source.kind !== "tier-list") continue;
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
