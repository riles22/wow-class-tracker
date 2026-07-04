/* Build-time payload assembly: decorate specs with computed consensus and
   sim-derived fight-profile labels, collect metadata. Pure functions — no
   filesystem access. */

import { consensusFor } from "./normalize.mjs";

export function decorateSpecs(specs, sources, scales) {
  return specs.map(spec => ({
    ...spec,
    consensus: {
      raid: consensusFor(spec.ratings?.raid, sources, scales),
      mplus: consensusFor(spec.ratings?.mplus, sources, scales)
    }
  }));
}

/* Fight-profile labeling: within-role percentile of sim DPS at representative
   target counts (ST = 1T, cleave = 3T, AoE = 8T with fallbacks). Only DPS
   specs with fightProfile.targets participate; labels are relative to that
   population, and the basis (raw numbers) is kept for display. */
/* Canonical comparison target counts — ST=1, cleave=3, AoE=8. Fixed (no fallback)
   so the percentile population is strictly same-count: comparing a spec's 5-target
   sim against the field's 8-target sims would systematically deflate its AoE rank.
   A spec whose sim data lacks the canonical count gets a null label for that axis
   (honest "no comparable sim") rather than a wrong one. All current DPS specs carry
   1/3/8, so this is behavior-neutral today. */
const pickMetrics = fp => {
  const t = fp.targets ?? {};
  return { st: t["1"], cleave: t["3"], aoe: t["8"] };
};

export function fightLabels(specs) {
  const dps = specs.filter(s => s.role === "DPS" && s.fightProfile?.targets);
  const cols = { st: [], cleave: [], aoe: [] };
  const used = new Map();
  for (const spec of dps) {
    const m = pickMetrics(spec.fightProfile);
    used.set(spec, m);
    for (const k of Object.keys(cols)) if (typeof m[k] === "number") cols[k].push(m[k]);
  }
  const pct = (arr, v) => {
    if (arr.length < 2 || typeof v !== "number") return null;
    return arr.filter(x => x < v).length / (arr.length - 1);
  };
  const label = p => p == null ? null : p >= 0.7 ? "strong" : p <= 0.3 ? "weak" : "mid";

  for (const spec of dps) {
    const m = used.get(spec);
    const labels = {
      st: label(pct(cols.st, m.st)),
      cleave: label(pct(cols.cleave, m.cleave)),
      aoe: label(pct(cols.aoe, m.aoe))
    };
    let tag = "Flexible";
    if (labels.st === "strong" && labels.aoe === "strong") tag = "All-round";
    else if (labels.aoe === "strong") tag = "AoE-lean";
    else if (labels.st === "strong") tag = "ST-lean";
    else if (labels.st === "weak" && labels.aoe === "weak") tag = "Low-sims";
    spec.fightProfile = { ...spec.fightProfile, labels, tag, metricsUsed: m };
  }
  return specs;
}

/* Metric ranks: for every metric name, rank specs within (role, bracket, name) —
   #1 = highest value. All current metrics are higher-is-better (DPS/HPS medians,
   95th-pct throughput, M+ score, popularity %, rating ceilings); if a
   lower-is-better metric is ever added, extend this with a direction flag. */
export function metricRanks(specs) {
  const groups = new Map();
  for (const spec of specs) {
    for (const metric of spec.metrics ?? []) {
      const key = `${spec.role}|${metric.bracket}|${metric.name}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(metric);
    }
  }
  for (const arr of groups.values()) {
    arr.sort((a, b) => b.value - a.value);
    arr.forEach((metric, i) => { metric.rank = i + 1; metric.of = arr.length; });
  }
  return specs;
}

/* 12.1 outlook: direction derived from the PTR writeup verdict when present,
   else from the balance of buff/nerf tuning lines in the PTR build feed.
   Upgraded automatically when zone-54 PTR metrics land (they join the basis). */
export function outlookFor(spec, ptrBuilds) {
  const builds = ptrBuilds?.builds ?? [];
  if (!builds.length) return null;
  const full = `${spec.spec} ${spec.class}`;
  // Exact spec match, or a class-level entry ("Druid (class-wide)", "Warlock (Hellcaller
  // hero talents)") — anchored with startsWith so "Demon Hunter (class-wide)" can never
  // match Hunter, nor "Death Knight (…)" match a Knight-less class via substring.
  const classLevel = `${spec.class} (`;
  const mentioned = builds.filter(b => (b.specsAffected ?? []).some(e =>
    e === full || e.startsWith(classLevel))).length;
  let buffs = 0, nerfs = 0;
  for (const b of builds) {
    for (const h of b.highlights ?? []) {
      // Count only lines genuinely ABOUT this spec ("Arms Warrior — …"), not class-wide
      // lines that merely name it in prose ("Warrior (class-wide) — … exclusive to Arms …").
      if (!h.startsWith(`${full} `)) continue;
      if (/increas/i.test(h)) buffs++;
      if (/reduc|decreas|nerf/i.test(h)) nerfs++;
    }
  }
  // A draft writeup's verdict is unconfirmed (distilled from a Wowhead article, not yet
  // blessed by Riley) — don't let it drive a full up/down outlook; fall through to the
  // buff/nerf tuning-line balance, which is a real signal. Self-heals on confirm.
  const verdict = spec.ptr?.draft ? null : (spec.ptr?.verdict ?? null);
  let direction = null;
  if (verdict === "Positive") direction = "up";
  else if (verdict === "Negative") direction = "down";
  else if (verdict === "Mixed") direction = "flat";
  else if (buffs || nerfs) direction = buffs > nerfs ? "up" : nerfs > buffs ? "down" : "flat";
  else if (mentioned) direction = "flat";
  if (!direction) return null;
  return {
    direction, builds: mentioned, buffs, nerfs,
    basis: `${verdict ? `PTR read: ${verdict}` : "no writeup yet"} · touched in ${mentioned} of ${builds.length} PTR builds` +
      (buffs || nerfs ? ` · highlighted tuning lines +${buffs}/−${nerfs}` : "")
  };
}

/* Movement vs the latest data/history snapshot: consensus-tier steps per bracket
   (positive delta = improved) and per-metric rank deltas (positive = climbed). */
export function movementFor(specs, scales, snapshot) {
  if (!snapshot?.specs) return specs;
  const bandIdx = new Map(scales.consensus.bands.map((b, i) => [b.tier, i]));
  for (const s of specs) {
    const prev = snapshot.specs[`${s.class}|${s.spec}`];
    if (!prev) continue;
    const movement = {};
    for (const bracket of ["raid", "mplus"]) {
      const now = s.consensus?.[bracket]?.tier;
      const was = prev.consensus?.[bracket];
      if (now && was && now !== was && bandIdx.has(now) && bandIdx.has(was)) {
        movement[bracket] = { delta: bandIdx.get(was) - bandIdx.get(now), was, since: snapshot.date };
      }
    }
    if (Object.keys(movement).length) s.movement = movement;
    for (const m of s.metrics ?? []) {
      // Key includes source: two sources can share a (bracket, name) but rank separately.
      const was = prev.ranks?.[`${m.source}|${m.bracket}|${m.name}`];
      if (was != null && m.rank != null && was !== m.rank) m.rankDelta = was - m.rank;
    }
  }
  return specs;
}

export function latestSnapshot(sources) {
  const dates = sources
    .flatMap(source => source.pages ?? [])
    .map(page => page.snapshot)
    .filter(Boolean)
    .sort();
  return dates.at(-1) ?? null;
}

export function buildPayload({ specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers, historySnapshot }) {
  const decorated = movementFor(
    metricRanks(fightLabels(decorateSpecs(specs, sources, scales))),
    scales, historySnapshot
  );
  for (const spec of decorated) {
    const outlook = outlookFor(spec, ptrBuilds);
    if (outlook) spec.outlook = outlook;
  }
  const latestBuild = ptrBuilds?.builds?.[0]?.date ?? null;
  // notes-feed pages track build posts, not page snapshots — stamp them from the feed
  const stampedSources = sources.map(source => source.kind !== "notes-feed" ? source : {
    ...source,
    pages: (source.pages ?? []).map(page => ({ ...page, snapshot: page.snapshot ?? latestBuild }))
  });
  return {
    specs: decorated,
    sources: stampedSources,
    scales,
    community: community ?? null,
    ptrBuilds: ptrBuilds ?? null,
    creatorTakes: creatorTakes ?? null,
    encounterTiers: encounterTiers ?? null,
    meta: {
      specCount: specs.length,
      trackedCount: specs.filter(spec => spec.ptr).length,
      latestSnapshot: latestSnapshot(sources),
      latestPtrBuild: latestBuild,
      movementSince: historySnapshot?.date ?? null
    }
  };
}
