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
     · seasonOrder — the seasons this project knows, OLDEST FIRST. Until 2026-08-09 the
                     pipeline only ever tested seasons for EQUALITY, which cannot express
                     "ahead"; when Wowhead published its Season-2 lists early we needed to
                     tell "this outlet is lagging" from "this outlet is already on the next
                     patch", and those are opposite facts with opposite handling. Declared,
                     never string-compared: "s10" must not sort below "s2". The 12.2 cycle
                     appends "s3" HERE and nowhere else.
     · seasonLabels — season id -> the patch label a visitor reads. `liveLabel` must equal
                     seasonLabels[liveSeason] (pinned by test); this map exists so a column
                     of NEXT-season letters can be labelled with its own patch instead of
                     inheriting the live one.
   At 12.1 launch: liveSeason -> "s2", liveLabel -> "12.1", ptr -> null (until the 12.2
   thread appears), alongside the SNAPSHOT_PHASE flip in render.mjs. */
export const PHASES = {
  liveSeason: "s2",
  liveLabel: "12.1",
  /* Season 2 flipped live 2026-08-18 (the runbook commit). `ptr` is null until the 12.2
     PTR thread appears — a null ptr hides the Era toggle, era-gates every PTR surface out
     of the page, and IS the PTR sunset (DECISION 3 as amended 2026-08-12; the old
     `ptrSunset` flag is deleted rather than flipped). When the 12.2 cycle opens, restore
     the shape `{ marker: "12.2 PTR", label: "12.2" }` — `marker` is a frozen DATA KEY for
     the whole cycle, `label` is what the page calls the era and drops " PTR" at launch. */
  ptr: null,
  /* The date liveSeason went live (ISO). Drawer metric rows whose asOf predates it are
     measurements of the PREVIOUS season and get a visible per-row era tag, because the
     box heading stamps liveLabel over every era:"live" row and the transition window
     mixes S1 cuts (frozen WCL zones, held-back ceilings) with genuine S2 rows under one
     "(12.1)" banner (2026-08-19 audit, B2). Update alongside liveSeason at every flip
     (the era-vocabulary pin test checks the shape). */
  liveSince: "2026-08-18",
  /* The tracked patch's display name — the masthead chip and footer read it via the
     build-time era tokens (build.mjs). It outlives `ptr` (the branding stays after the
     ptr lane sunsets), which is why it does not live inside it. */
  patchName: "Curse of Ula'tek",
  seasonOrder: ["s1", "s2"],
  seasonLabels: { s1: "12.0.7", s2: "12.1" },
};

export const isLiveEra = source => (source.era ?? "live") === "live";
/* Position of a season on the declared timeline; null when the id is unknown. */
export const seasonRank = (season, order = PHASES.seasonOrder) => {
  const i = (order ?? []).indexOf(season);
  return i === -1 ? null : i;
};

/* The PTR-era tier lists, in registry order.
   NOTE (2026-08-09): this is NO LONGER the projection's input set — use
   nextPatchTierSources below, which also admits a LIVE-era outlet that has published the
   next season early. Kept because "which sources carry era:ptr" is still a real question
   (the 12.0.7-only view, the registry's own bookkeeping). */
export const ptrTierSources = sources =>
  (sources ?? []).filter(s => s.kind === "tier-list" && !isLiveEra(s));

/* The season a LIVE-era source has moved ahead to for this bracket, or null.
   This is the mechanism that let Wowhead's early Season-2 lists reach the 12.1 forecast
   without the `era: "ptr"` retype — which was measured to null 80 of 80 consensus cells
   at the phase flip, because consensusFor drops non-live era BEFORE the season test.
   Keying on the SEASON instead means the same source re-enters the consensus and leaves
   the forecast term automatically when liveSeason advances: no owner action, no
   oscillating registry field.

   Three deliberate refusals:
   · a bracket whose pages carry seasonVerified on SOME pages and not others THROWS.
     `seasonVerified` is agent-writable (nightly.yml's Gate 0 allowlist), and treating a
     half-labelled bracket as "not ahead" would make one unwritten field a silent switch
     over 27-46% of every raid forecast. Absent on ALL pages is different and fine — it
     means "never checked", which the consensus rule already reads as current.
   · a bracket split ACROSS seasons (some pages s1, some s2 — an outlet mid-rebuild)
     returns null, so the source goes dark for that bracket: out of the consensus by
     sourceSeasonOk and out of the forecast by this. Never mix two seasons in one term.
   · an unknown season id throws rather than sorting last.
   `ancillary: true` pages are excluded from the page set here exactly as in
   sourceSeasonOk below (2026-08-19 audit, C1) — the two must read the SAME set or the
   structural consensus/forecast mutual exclusion breaks. */
export function aheadSeasonFor(source, bracket = null, liveSeason = PHASES.liveSeason, order = PHASES.seasonOrder) {
  if (source?.kind !== "tier-list" || !isLiveEra(source)) return null;
  const pages = (source.pages ?? []).filter(pg => !pg.ancillary && (bracket == null || pg.bracket === bracket));
  if (!pages.length) return null;
  const labelled = pages.filter(pg => pg.seasonVerified != null);
  if (!labelled.length) return null;
  if (labelled.length !== pages.length) {
    throw new Error(`sources.json: source "${source.id}" bracket "${bracket ?? "*"}" mixes season-verified and unverified pages — record seasonVerified on every page of a bracket, or none`);
  }
  const seasons = [...new Set(labelled.map(pg => pg.seasonVerified))];
  if (seasons.length !== 1) return null;
  const rank = seasonRank(seasons[0], order), live = seasonRank(liveSeason, order);
  if (rank == null) throw new Error(`sources.json: source "${source.id}" verifies unknown season "${seasons[0]}" — add it to PHASES.seasonOrder`);
  if (live == null) throw new Error(`PHASES.liveSeason "${liveSeason}" is not in PHASES.seasonOrder`);
  return rank > live ? seasons[0] : null;
}

/* Every external NEXT-PATCH letter opinion for this bracket: a dedicated era:"ptr" list,
   or a live outlet that has already published the next season. This is projectionFor's
   input set. Mutual exclusion with the consensus is structural, not enforced:
   aheadSeasonFor can only return a season when every page of the bracket verifies
   something other than liveSeason, which is exactly what makes sourceSeasonOk false. */
export const nextPatchTierSources = (sources, bracket = null, liveSeason = PHASES.liveSeason) =>
  (sources ?? []).filter(s => s.kind === "tier-list" &&
    (!isLiveEra(s) || aheadSeasonFor(s, bracket, liveSeason) != null));

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
   into one number is the lie this column must never tell (DECISION 1).

   Pages marked `ancillary: true` (per-boss/per-dungeon encounter cuts, survivability —
   inputs to encounter-tiers.json and drawer metrics, never to the letter consensus) are
   OUTSIDE this gate and outside aheadSeasonFor's page set (2026-08-19 audit, C1). The
   season test exists so the consensus never averages two seasons; a page that feeds no
   letters into the mean cannot cause that lie, but at the S2 transition Archon's retired
   S1 per-dungeon page — un-reverifiable upstream while its S2 raid parses were zero —
   was keeping the outlet's fully S2-verified M+ tier lists dark for weeks. The flag is
   registry structure (Gate-0 protected, human-reviewed); era-verify keeps writing
   seasonVerified on ancillary pages for the record, it just no longer gates letters. */
export const sourceSeasonOk = (source, bracket, liveSeason = PHASES.liveSeason) =>
  !(source.pages ?? []).some(pg =>
    !pg.ancillary &&
    (bracket == null || pg.bracket === bracket) &&
    pg.seasonVerified != null && pg.seasonVerified !== liveSeason);

/* The final letters a source published about the CURRENT live season, for one spec+bracket,
   read out of data/season-final.json. Shape: { [sourceId]: { tier, frozenAt } }.
   Keyed by season on purpose — see the frozen lane in consensusFor. */
export function frozenLettersFor(seasonFinal, specKey, bracket, liveSeason = PHASES.liveSeason) {
  const bySource = seasonFinal?.[liveSeason];
  if (!bySource) return null;
  const out = {};
  for (const [sourceId, brackets] of Object.entries(bySource)) {
    const rec = brackets?.[bracket];
    const tier = rec?.letters?.[specKey];
    if (tier === undefined) continue;
    out[sourceId] = { tier, frozenAt: rec.frozenAt ?? null };
  }
  return Object.keys(out).length ? out : null;
}

export function consensusFor(ratingsBySource, sources, scales, bracket = null, liveSeason = PHASES.liveSeason, frozenBySource = null) {
  const perSource = [];
  let frozenCount = 0;
  for (const source of sources) {
    if (source.kind !== "tier-list" || !isLiveEra(source)) continue;
    /* THE FROZEN LANE (2026-08-09, owner decision). A live outlet that has moved to the
       next season stops describing the patch we are running, so its CURRENT letters must
       not be averaged in — that rule is unchanged. But dropping it outright shrinks the
       mean's composition, which publishes as spec movement nobody wrote (16 cells the
       night Wowhead flipped) and, if every outlet flips before the phase flip, blanks the
       column entirely (measured: 80 of 80 cells null). So we substitute the last letters
       that outlet DID publish about this season, tagged so no surface can imply it
       re-rated anything. Cost measured at Wowhead's own rate of S1 change: 0.24 letters
       of 80 over the nine days to the flip.
       The lookup is keyed by season, which is what makes the cutover free: advance
       liveSeason and seasonFinal[liveSeason] is simply absent, so the lane goes cold with
       no flag, no date and no owner action. */
    const live = sourceSeasonOk(source, bracket, liveSeason);
    let tier = null, frozenAt = null;
    if (live) {
      tier = ratingsBySource?.[source.id] ?? null;
    } else {
      const frozen = frozenBySource?.[source.id];
      if (!frozen) continue;
      tier = frozen.tier ?? null;
      frozenAt = frozen.frozenAt ?? null;
    }
    const score = scoreFor(scales, source.scale, tier);
    if (score === null) continue;
    if (!live) frozenCount++;
    perSource.push({
      source: source.id, label: source.name, tier, score,
      ...(live ? {} : { lane: "frozen", frozenAsOf: frozenAt })
    });
  }
  if (perSource.length === 0) return null;

  const mean = perSource.reduce((sum, p) => sum + p.score, 0) / perSource.length;
  const spread = Math.max(...perSource.map(p => p.score)) - Math.min(...perSource.map(p => p.score));
  return {
    tier: consensusTier(mean, scales),
    score: Math.round(mean),
    spread,
    diverges: perSource.length > 1 && spread >= scales.consensus.spreadThreshold,
    frozenCount,
    perSource
  };
}
