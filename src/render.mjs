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
    if (labels.st == null && labels.cleave == null && labels.aoe == null) tag = null; // no comparable sims — no tag, not "Flexible"
    else if (labels.st === "strong" && labels.aoe === "strong") tag = "All-round";
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
/* Sample floor for ranking. A median over a handful of parses is a number, not a
   position: 52 rows across seven PTR families were ranked off fewer than 10 parses,
   including single-player medians published as "#14/25 DPS" and fed to the projection
   through rankPct (audit 2026-07-24, D7). Rows below the floor keep their VALUE — the
   drawer still shows the measurement with its n — but get no rank, and do not count
   toward `of`, so "#x of y" stays truthful. `n == null` means the source does not report
   a sample size (sims, scores); those are unaffected. This mirrors dummyDomeScores'
   coverage floor, which already refuses a headline number on thin evidence. */
export const MIN_RANK_N = 10;

export function metricRanks(specs) {
  const groups = new Map();
  for (const spec of specs) {
    for (const metric of spec.metrics ?? []) {
      const key = `${spec.role}|${metric.bracket}|${metric.name}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(metric);
    }
  }
  for (const all of groups.values()) {
    // Unranked rows are cleared explicitly: metrics upsert in place, so a row that used
    // to clear the floor and no longer does must lose its stale rank.
    for (const m of all) { if (m.n != null && m.n < MIN_RANK_N) { delete m.rank; delete m.of; } }
    const arr = all.filter(m => m.n == null || m.n >= MIN_RANK_N);
    arr.sort((a, b) => b.value - a.value);
    // Competition ranking: identical measured values share a rank. Ordering them #11 vs
    // #12 on the same number publishes a distinction the data does not contain, and
    // rankPct then hands the projection two different percentiles for one value
    // (audit 2026-07-24, C6).
    arr.forEach((metric, i) => {
      metric.rank = (i > 0 && arr[i - 1].value === metric.value) ? arr[i - 1].rank : i + 1;
      metric.of = arr.length;
    });
  }
  return specs;
}

/* Dummy Dome composite: the real-player PTR counterpart to the sim fight profile.
   For each DPS spec, normalize its median DPS at every logged target count to a
   within-role percentile across the DPS field (same method as fightLabels — robust
   to the tiny, outlier-prone PTR samples), then average the available counts into a
   single 0–100 composite and rank DPS specs by it (#1 = highest across the board).
   coverage = how many of the field's target counts the spec actually logged (an
   honesty flag: a spec that only logged one dummy is scored only on that one). */
export function dummyDomeScores(specs) {
  const dps = specs.filter(s => s.role === "DPS" && s.ptrDummy?.targets && Object.keys(s.ptrDummy.targets).length);
  if (!dps.length) return specs;
  const allCounts = [...new Set(dps.flatMap(s => Object.keys(s.ptrDummy.targets)))].sort((a, b) => a - b);
  const fieldByCount = new Map(
    allCounts.map(c => [c, dps.map(s => s.ptrDummy.targets[c]).filter(v => typeof v === "number")])
  );
  const pct = (arr, v) => {
    if (arr.length < 2 || typeof v !== "number") return null;
    return arr.filter(x => x < v).length / (arr.length - 1);
  };
  // Coverage floor: a spec earns a headline composite + rank only if it logged all but at
  // most one target count. Specs log dummies non-randomly (their favorable counts), so
  // averaging over only-logged counts lets omission inflate a spec — a spec that logged just
  // its strong dummy would outrank a broadly-tested one, and a single-count spec would get a
  // whole-field composite from one parse. Below the floor we still keep the per-count
  // percentiles (each honest against its own full field) but assign no composite/rank.
  const floor = Math.max(2, allCounts.length - 1);
  const ranked = [];
  for (const s of dps) {
    const perCount = {};
    const ps = [];
    for (const c of allCounts) {
      const p = pct(fieldByCount.get(c), s.ptrDummy.targets[c]);
      if (p == null) continue;
      perCount[c] = Math.round(p * 100);
      ps.push(p);
    }
    const coverage = { have: ps.length, of: allCounts.length };
    if (ps.length >= floor) {
      const score = Math.round((ps.reduce((a, b) => a + b, 0) / ps.length) * 100);
      s.ptrDummy = { ...s.ptrDummy, perCount, coverage, score };
      ranked.push(s);
    } else {
      s.ptrDummy = { ...s.ptrDummy, perCount, coverage };
    }
  }
  ranked.sort((a, b) => b.ptrDummy.score - a.ptrDummy.score
    || a.class.localeCompare(b.class) || a.spec.localeCompare(b.spec));
  ranked.forEach((s, i) => {
    const prev = i > 0 ? ranked[i - 1] : null;
    const rank = (prev && prev.ptrDummy.score === s.ptrDummy.score) ? prev.ptrDummy.rank : i + 1;
    s.ptrDummy = { ...s.ptrDummy, rank, of: ranked.length }; // ties share a rank, as above
  });
  return specs;
}

/* Resource/tempo terms invert direction ("cooldown reduced" is a buff, "cost increased"
   a nerf). The `s?` is load-bearing: the real 2026-07-14 line "…mana costs reduced by
   10%" classified as a NERF for want of it (audit 2026-07-24, C1). */
const RESOURCE_TERM = /\b(cooldown|recharge|cost|cast time)s?\b/i;
const TUNING_VERB = /\b(reduc|decreas|nerf|lower|increas|improv|buff)\w*\b/i;
const BUGFIX_MARK = /\(bug fix(?:es)?\)|\bbug fix(?:es)?\b|\bfixed\b|\bno longer incorrectly\b/i;
/* Patch-note units, normalized so "90 sec (was 60 seconds)" compares but
   "1 minute (was 20 seconds)" does not. */
const UNIT_ALIAS = {
  s: "s", sec: "s", secs: "s", second: "s", seconds: "s",
  min: "m", mins: "m", minute: "m", minutes: "m",
  yd: "yd", yds: "yd", yard: "yd", yards: "yd"
};
const normUnit = u => {
  if (!u) return null;
  const k = String(u).toLowerCase();
  return UNIT_ALIAS[k] ?? k.replace(/s$/, "");
};

/* Is this sentence ABOUT a bug fix rather than a power change? Blizzard's fix notes are
   written with tuning verbs ("Fixed X not being correctly INCREASED by Y"), so a bare
   verb count reads them as buffs — that is how Brewmaster published a full-tier 12.1
   promotion off one "Fixed …" line (audit 2026-07-24, N4). A sentence is a fix when it
   carries the explicit "(bug fix)" marker, or when its fix word precedes any tuning verb
   — which keeps Resto Druid's "Regrowth healing reduced by 20%; fixed Abundance's…"
   scoring as the nerf it is, because the real change is its own sentence. */
function isBugFixSentence(s) {
  const mark = BUGFIX_MARK.exec(s);
  if (!mark) return false;
  if (/\(bug fix(?:es)?\)/i.test(s)) return true;
  const verb = TUNING_VERB.exec(s);
  return !verb || mark.index < verb.index;
}

/* Classify one tuning highlight as "buff" | "nerf" | null. Three things a bare
   increase/reduce word-count gets wrong — resource inversion, the "X by 75% (was 100%)"
   idiom, and bug-fix framing — handled per clause with first-signal-wins. */
export function classifyHighlight(h) {
  // Sentences first, so a whole bug-fix sentence can be dropped before any clause inside
  // it is scored. The lookarounds keep decimals intact: "12.1" and "1.5 sec" never split.
  for (const sentence of String(h).split(/(?<!\d)[.;](?!\d)/)) {
    if (isBugFixSentence(sentence)) continue;
    for (const clause of sentence.split(/,|\band\b/i)) {
      const res = RESOURCE_TERM.test(clause);
      // "… 60% chance … (was 100%)": compare the LAST number before the paren to the old
      // value. Both sides may carry a unit and a trailing phrase, but neither trailing
      // phrase may contain a further number — "at 50% effectiveness (was 40% at 70%)" is
      // a two-axis change whose bare 50-vs-40 comparison would be meaningless.
      const was = /([\d.]+)\s*(%|[a-z]+)?[^()\d]*\(\s*was\s+([\d.]+)\s*(%|[a-z]+)?[^()\d]*\)/i.exec(clause);
      const down = /\b(reduc\w*|decreas\w*|nerf\w*|lower\w*)\b/i.test(clause);
      const up = /\b(increas\w*|improv\w*|buff\w*)\b/i.test(clause);
      const verbDir = (down && !up) ? (res ? "buff" : "nerf")
        : (up && !down) ? (res ? "nerf" : "buff")
          : null;
      if (was) {
        const now = parseFloat(was[1]), before = parseFloat(was[3]);
        const unitNow = normUnit(was[2]), unitBefore = normUnit(was[4]);
        // Disagreeing units make the numbers incomparable: "now lasts 1 minute (was 20
        // seconds)" is a 3× buff, not a cut. Skip rather than guess.
        if (unitNow && unitBefore && unitNow !== unitBefore) continue;
        if (now === before) continue;
        // Is the number the resource's LEVEL ("cooldown increased to 3 minutes") or the
        // SIZE OF A DELTA applied to it ("reduces cooldown BY 1s", "5 seconds of cooldown
        // reduction")? The distinction inverts the answer: a bigger cooldown is a nerf,
        // but a bigger cooldown *reduction* is a buff. When the clause states a delta the
        // verb already fixes the direction, and the value only says how much of it.
        // Deliberately scoped to clauses naming a resource — that is the only place the
        // inversion below can misfire, and a broader rule would mis-read lines like
        // "reduces physical damage taken by 8% (was 5%)", where the plain higher-is-better
        // reading is already correct.
        const isDelta = /\bby\s+[\d.]/i.test(clause) || /\b(reduction|increase)\b/i.test(clause);
        if (isDelta && res && verbDir) {
          const flipped = verbDir === "buff" ? "nerf" : "buff";
          return now > before ? verbDir : flipped;
        }
        return ((now > before) !== res) ? "buff" : "nerf"; // higher level = buff, unless it's a cost/cooldown
      }
      if (verbDir) return verbDir;
    }
  }
  return null;
}

/* 12.1 outlook: direction derived from the PTR writeup verdict when present,
   else from the balance of buff/nerf tuning lines in the PTR build feed. The zone-54
   PTR raid-testing rank, when landed, is NAMED in the basis string for context but
   does not flip the direction (tiny-n testing data stays informative, not a driver). */
/* Per-spec OFFICIAL tuning lines grouped by build, newest first (builds are stored
   newest-first). Two kinds of line reach a spec's drawer:

   - SPEC lines ("Arms Warrior — …"), matched by the "Spec Class " prefix. This rule is
     byte-identical to outlookFor's, so the drawer's fact list and the outlook arrow can
     never disagree about which lines are "about this spec".
   - CLASS-WIDE lines ("Hunter (all specs) — …"), scoped by BUILD MEMBERSHIP: included
     only when this spec appears in that build's specsAffected. Before this, five
     class-level highlights reached no drawer at all — including Hunter's Mark reverting
     to 1 target — and for nine spec-build pairs the class line was the spec's ONLY line,
     so the build's date vanished with it (audit 2026-07-24, D6).

   Membership, not text matching, is the scoping rule on purpose: matching "<Class> (" in
   the highlight would attach "Death Knight (San'layn) Blood-Soaked Ground…" to Frost DK,
   which is not a San'layn spec — and the data already knows better, since that build's
   specsAffected lists Blood and Unholy and deliberately omits Frost.

   This is DISPLAY ONLY. outlookFor still scores spec lines exclusively; that exclusion is
   deliberate and documented there. The redundant spec prefix is stripped for display; the
   line text is otherwise verbatim from the forum notes. */
/* The parentheticals that genuinely mean "every spec of this class", as they appear in the
   official notes. Anything else in "Class (…)" form is a narrower scope — almost always a
   hero talent tree — and must not be read as class-wide. */
const CLASS_WIDE = /\((?:class-wide|all specs)\)/;

export function specBuildChanges(spec, ptrBuilds) {
  const prefix = `${spec.spec} ${spec.class} `;
  const full = `${spec.spec} ${spec.class}`;
  const classLevel = `${spec.class} (`;
  const out = [];
  for (const b of ptrBuilds?.builds ?? []) {
    const affected = b.specsAffected ?? [];
    const namedHere = affected.includes(full);
    // "Class (…)" is not automatically the whole class. Only the explicit whole-class
    // sentinels are; the rest are HERO-TREE scopes ("Warlock (Hellcaller hero talents)",
    // "Death Knight (San'layn)") that reach some specs and not others, and the data does
    // not say which. Treating them as class-wide attached a Hellcaller line to Demonology,
    // which has no Hellcaller tree — the exact mis-attribution this function's comment
    // claims to prevent (audit 2026-07-25). A hero-tree line therefore attaches only when
    // the build's specsAffected names this spec outright: informative where the feed is
    // explicit, silent where it is not, and never guessing.
    const touchesSpec = affected.some(e => e === full || (e.startsWith(classLevel) && CLASS_WIDE.test(e)));
    const lines = [];
    for (const h of b.highlights ?? []) {
      if (h.startsWith(prefix)) { lines.push({ text: h.slice(prefix.length), classWide: false }); continue; }
      if (!h.startsWith(classLevel)) continue;
      if (CLASS_WIDE.test(h) ? touchesSpec : namedHere) lines.push({ text: h, classWide: true });
    }
    if (lines.length) {
      out.push({ date: b.date, forumPostNumber: b.forumPostNumber ?? null, forumUrl: b.forumUrl ?? null, lines });
    }
  }
  return out;
}

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
      // Class-wide lines DO reach the drawer's fact list (specBuildChanges scopes them by
      // build membership); they are excluded from SCORING only, which is what this is.
      if (!h.startsWith(`${full} `)) continue;
      const dir = classifyHighlight(h); // each line counts once, resource-aware
      if (dir === "buff") buffs++;
      else if (dir === "nerf") nerfs++;
    }
  }
  // Policy (Riley, 2026-07-06): writeups are attributed distillations of cited
  // theorycrafters and count as confirmed on landing — the verdict always drives the
  // outlook. Honesty lives in the mandatory source attribution, not a review gate.
  const verdict = spec.ptr?.verdict ?? null;
  let direction = null;
  if (verdict === "Positive") direction = "up";
  else if (verdict === "Negative") direction = "down";
  else if (verdict === "Mixed") direction = "flat";
  else if (buffs || nerfs) direction = buffs > nerfs ? "up" : nerfs > buffs ? "down" : "flat";
  else if (mentioned) direction = "flat";
  if (!direction) return null;
  // Zone-54 raid-testing rank joins the basis STRING for context (never the direction —
  // tiny-n testing data stays informative, not a driver).
  const testing = (spec.metrics ?? []).find(m => m.name === "12.1 PTR raid testing score (normalized)");
  // Writeups auto-confirm and carry no date (they are cited distillations, per policy),
  // so a verdict distilled before three tuning passes still drives the arrow and a ±7
  // projection shift. Until `ptr.asOf` is backfilled and can be compared properly, at
  // least STATE the contradiction rather than silently resolving it: Blood DK publishes
  // "Negative" while its own official lines are +2/−0 (audit 2026-07-24, D5).
  const balance = buffs - nerfs;
  const contradicts = (verdict === "Negative" && balance > 0) || (verdict === "Positive" && balance < 0);
  return {
    direction, builds: mentioned, buffs, nerfs,
    contradicted: contradicts || undefined,
    basis: `${verdict ? `PTR read: ${verdict}` : "no writeup yet"} · touched in ${mentioned} of ${builds.length} PTR builds` +
      (buffs || nerfs ? ` · highlighted tuning lines +${buffs}/−${nerfs}` : "") +
      (contradicts ? ` (the writeup predates this tuning — its ${verdict.toLowerCase()} read disagrees with the official lines since)` : "") +
      (testing?.rank ? ` · PTR raid-testing (zone 54) rank #${testing.rank}/${testing.of}` : "")
  };
}

/* ---- 12.1 projection: the tracker's OWN synthesized tier list for the coming patch.
   A computed forecast, NOT a source — it never feeds consensus (it derives from it),
   is era-gated to PTR views, and carries its full component breakdown for transparency.

   Formula per spec+bracket, everything on one 0–100 axis:
     base  = weighted mean of { live consensus score (w=0.55) ,
                                PTR empirical (w=0.45) } — renormalized when one absent.
       PTR empirical (per bracket, within-role percentiles ×100):
         raid  = mean of { zone-54 testing-score percentile (w=2),
                           Dummy Dome composite (w=1, DPS only) }
         mplus = mean of { zone-56 M+ testing percentile — rDPS / tank rDPS / HPS
                           by role (w=2), Dummy Dome composite (w=1, DPS only) }
     shift = 12.1 outlook direction: up +7 · down −7 · flat 0  (verdict-driven, see
             outlookFor — tiny-n testing never drives direction, only the empirical term)
     nudge = newest general-creator meta note for the spec: positive +3 · negative −3
     score = clamp(base + shift + nudge, 0, 100) → tier via the same consensus bands.
   Confidence = how many independent PTR signals exist (testing, dummy, writeup/tuning):
   3 → high, 2 → medium, 1 → low, 0 → prior-only (live baseline, no PTR evidence). */
/* Projection formula version — bump on ANY change to the weights, inputs, or clamps
   below. Stamped into the payload and every history snapshot so the post-launch report
   card grades each frozen forecast against the formula that actually produced it, and
   never averages two different formulas into one series.

   v1 — 2026-07-06. Prior .55 / empirical .45, testing:dummy 2:1, outlook ±7, meta ±3.
   v2 — 2026-07-25 (audit 2026-07-24). Weights and clamps UNCHANGED; the INPUTS moved,
        which is exactly what this marker exists for:
          · rankPct now returns null for rows below MIN_RANK_N (10 parses), so the
            PTR-testing term drops out for thin cuts instead of using a rank derived
            from one player's median;
          · tied metric values share a rank (competition ranking), so tied specs now
            get identical percentiles instead of arbitrarily different ones;
          · a meta note whose context says "Mythic raid" no longer nudges the M+
            bracket (the bare /mythic/ alternative used to match it);
          · classifyHighlight was corrected — plural resource terms, the
            "(was N <unit>)" idiom, and bug-fix notes — which moved the outlook ±7
            term for 7 specs.
        Practical consequence for the report card: v1 and v2 projections are NOT one
        series. Grade them separately, or grade only v2 onward. */
export const PROJECTION_VERSION = 2;

/* Rank-map version, stamped beside it. `snapshotStateOf().ranks` feeds movement
   comparison, and its meaning changed in the same commit as PROJECTION_VERSION v2:
   ties now share a rank, and rows below MIN_RANK_N carry no rank at all (so they are
   absent from the map rather than present with a misleading number).

   These markers are LOAD-BEARING, not documentation. A diff across a version boundary
   narrates definitional change as if it were real movement, so the readers below refuse
   to make cross-version comparisons: `versionOf` resolves a snapshot's effective version
   (absent field = 1, since every snapshot written before the marker existed came from the
   v1 formulas), and baselineDiffers/movementFor/projectionMovementFor/historySeries each
   drop the sections the boundary invalidates while keeping the ones it doesn't.

   Why degrade rather than reject: consensus TIERS are version-independent, and every
   snapshot on disk is rank-v1. Skipping mismatched snapshots outright would leave no
   baseline at all and silence real consensus movement — the opposite failure, and worse,
   because it is silent. So a cross-version baseline is still chosen and still narrates
   consensus; only the rank, dummy and projection arrows fall away. */
export const RANK_VERSION = 2;

/* Consensus-composition version. Consensus SCORES are source-derived, not formula-derived
   (see historySeries), so this is deliberately NOT a formula marker like the two above and
   it does NOT gate the Timeline sparklines — a source going quiet upstream is ordinary
   movement and must keep narrating.

   What it does gate is the one case that is NOT movement: when we change WHICH sources
   compose the consensus, every spec's mean recomposes at once and the ▲▼ engine would
   narrate a registry decision as spec movement. v2 = 2026-07-31, when WoWMeta left the M+
   consensus (retyped to kind:"metrics" after its letters were found to cluster on player
   count rather than the performance metric it advertises), taking the M+ mean from five
   tier-list sources to four and shifting 9 of 40 M+ tiers by one band on its own.

   Bump this ONLY when the tier-list source SET changes, never for upstream data movement.
   Degrade-don't-reject, as with ranks: a cross-version baseline is still chosen and still
   narrates ranks, dummy and projection; only the consensus arrows fall away. Every
   snapshot on disk is rankVersion 2, so baseline selection survives the boundary. */
export const CONSENSUS_VERSION = 2;
const versionOf = (snap, field) => snap?.[field] ?? 1;
const ranksComparableWith = snap => versionOf(snap, "rankVersion") === RANK_VERSION;
const projComparableWith = snap => versionOf(snap, "projectionVersion") === PROJECTION_VERSION;
const consensusComparableWith = snap => versionOf(snap, "consensusVersion") === CONSENSUS_VERSION;
// Snapshot phase marker — the season/settledness tag the post-launch forecast report
// card uses to find its endpoint ("first settled S2 consensus") without reading commit
// history. Flip to "12.1-live" (or the S2 season id) when 12.1 ships and the tracker is
// reconfigured for the live season — the boundary is then the first non-"12.1-ptr" snapshot.
export const SNAPSHOT_PHASE = "12.1-ptr";

const PTR_MPLUS_SERIES = {
  DPS: "Median rDPS (12.1 PTR M+ testing)",
  Tank: "Median rDPS (12.1 PTR M+ testing, tank)",
  Healer: "Median HPS (12.1 PTR M+ testing)"
};
function rankPct(spec, bracket, name) {
  const m = (spec.metrics ?? []).find(x => x.bracket === bracket && x.name === name);
  if (!m || m.rank == null || !m.of || m.of < 2) return null;
  return (1 - (m.rank - 1) / (m.of - 1)) * 100;
}
export function projectionFor(spec, bracket, scales, metaNotes = []) {
  const prior = spec.consensus?.[bracket]?.score ?? null;
  const testing = bracket === "raid"
    ? rankPct(spec, "raid", "12.1 PTR raid testing score (normalized)")
    : rankPct(spec, "mplus", PTR_MPLUS_SERIES[spec.role]);
  const dummy = spec.ptrDummy?.score ?? null; // DPS-only composite, already 0–100
  const empParts = [[testing, 2], [dummy, 1]].filter(([v]) => v != null);
  const emp = empParts.length
    ? empParts.reduce((s, [v, w]) => s + v * w, 0) / empParts.reduce((s, [, w]) => s + w, 0)
    : null;
  const baseParts = [[prior, 0.55], [emp, 0.45]].filter(([v]) => v != null);
  if (!baseParts.length) return null; // nothing to project from — honest "—"
  const base = baseParts.reduce((s, [v, w]) => s + v * w, 0) / baseParts.reduce((s, [, w]) => s + w, 0);
  const dir = spec.outlook?.direction ?? null;
  const shift = dir === "up" ? 7 : dir === "down" ? -7 : 0;
  // Bracket-scoped + supersession-aware note selection: a creator's raid read must
  // never color the M+ projection under their name (izen's reads genuinely differ per
  // bracket), and a retracted (superseded) note must not nudge what the drawer hides.
  // Notes whose patchContext names no bracket apply to both.
  const note = metaNotes
    // `n.date` is required: an undated note stringifies to "undefined", which sorts
    // ABOVE every ISO date in a descending localeCompare and would silently win the
    // "newest read" nudge. Validation enforces the date; this filter is defence in depth.
    .filter(n => n.class === spec.class && n.spec === spec.spec && n.sentiment && n.date && !n.superseded)
    .filter(n => {
      const pc = String(n.patchContext ?? "");
      // "Mythic raid" must not read as M+. The bare /mythic/ alternative matched it —
      // the exact cross-bracket leak the comment above says it prevents (audit C5).
      // An explicit n.bracket wins when present; the text heuristic is the fallback.
      if (n.bracket === "raid" || n.bracket === "mplus") return n.bracket === bracket;
      if (n.bracket === "both") return true;
      const mentionsRaid = /\braid\b/i.test(pc);
      const mentionsMplus = /m\+|mythic\s*plus|dungeon|keystone|\bkeys?\b/i.test(pc);
      if (!mentionsRaid && !mentionsMplus) return true;
      return bracket === "raid" ? mentionsRaid : mentionsMplus;
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] ?? null;
  const nudge = note?.sentiment === "positive" ? 3 : note?.sentiment === "negative" ? -3 : 0;
  const score = Math.round(Math.min(100, Math.max(0, base + shift + nudge)));
  const band = scales.consensus.bands.find(b => score >= b.min);
  const signals = (testing != null ? 1 : 0) + (dummy != null ? 1 : 0) + (dir != null ? 1 : 0);
  const confidence = signals >= 3 ? "high" : signals === 2 ? "medium" : signals === 1 ? "low" : "prior-only";
  return {
    tier: band ? band.tier : null, score, confidence,
    basis: `live baseline ${prior != null ? Math.round(prior) : "—"}`
      + (testing != null ? ` · PTR ${bracket === "raid" ? "raid-testing" : "M+ testing"} pct ${Math.round(testing)}` : "")
      + (dummy != null ? ` · Dummy Dome ${Math.round(dummy)}` : "")
      + (dir ? ` · outlook ${dir === "up" ? "+7" : dir === "down" ? "−7" : "0"}` : "")
      + (nudge ? ` · meta read ${nudge > 0 ? "+3" : "−3"} (${note.creator})` : "")
  };
}
export function projections(specs, scales, creatorTakes) {
  const metaNotes = creatorTakes?.metaNotes ?? [];
  for (const spec of specs) {
    const raid = projectionFor(spec, "raid", scales, metaNotes);
    const mplus = projectionFor(spec, "mplus", scales, metaNotes);
    if (raid || mplus) spec.projection = { raid, mplus };
  }
  return specs;
}

/* The comparable state a snapshot stores for one build — shared by snapshot.mjs (writer)
   and pickBaseline/movementFor (readers) so the key format can never drift. */
export function snapshotStateOf(specs) {
  const out = {};
  for (const s of specs) {
    const entry = {
      consensus: {
        raid: s.consensus?.raid?.tier ?? null,
        mplus: s.consensus?.mplus?.tier ?? null
      },
      ranks: Object.fromEntries(
        // Key includes source so two same-(bracket,name) metrics don't collide.
        (s.metrics ?? []).filter(m => m.rank != null).map(m => [`${m.source}|${m.bracket}|${m.name}`, m.rank])
      )
    };
    if (s.ptrDummy?.rank != null) entry.dummy = { rank: s.ptrDummy.rank, score: s.ptrDummy.score ?? null };
    // Enrichment (2026-07-09) — TIMELINE/report-card payload, deliberately IGNORED by
    // baselineDiffers/movementFor (movement semantics stay tier/rank-grained):
    // exact consensus scores, and the projection so the forecast's own history is
    // preserved for the post-launch report card (basis strings excluded — bulky,
    // reconstructible from the code at any commit).
    entry.scores = {
      raid: s.consensus?.raid?.score ?? null,
      mplus: s.consensus?.mplus?.score ?? null
    };
    if (s.projection) {
      const slim = p => p ? { tier: p.tier, score: p.score, confidence: p.confidence } : null;
      entry.projection = { raid: slim(s.projection.raid), mplus: slim(s.projection.mplus) };
    }
    out[`${s.class}|${s.spec}`] = entry;
  }
  return out;
}

/* Per-spec time series for the drawer timeline, built from the daily history snapshots
   (oldest → newest). Pre-enrichment snapshots stored only tier LETTERS — those map to
   band-midpoint scores so the line still draws; enriched snapshots (2026-07-09+) carry
   exact consensus scores and the projection's own history (the report-card raw data). */
export function historySeries(specs, scales, snapshots) {
  const bands = scales.consensus.bands; // sorted by descending min
  const midOf = tier => {
    const i = bands.findIndex(b => b.tier === tier);
    if (i < 0) return null;
    const hi = i === 0 ? 100 : bands[i - 1].min;
    return Math.round((bands[i].min + hi) / 2);
  };
  const ordered = [...(snapshots ?? [])].filter(s => s?.date && s.specs)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (!ordered.length) return null;
  const out = {
    dates: ordered.map(s => s.date),
    // Which snapshots carry EXACT scores (enrichment, 2026-07-09+). Earlier points are
    // reconstructed from tier letters — the UI must draw them distinctly, or the
    // midpoint→exact boundary reads as a score move that never happened.
    enriched: ordered.map(s => Object.values(s.specs).some(e => e?.scores && (e.scores.raid != null || e.scores.mplus != null))),
    specs: {}
  };
  // Projection scores are only comparable within one PROJECTION_VERSION. Points from an
  // older formula are dropped to null rather than plotted: a gap is honest, whereas
  // splicing v1 and v2 scores into one line draws a step the spec never took (the exact
  // thing PROJECTION_VERSION exists to prevent). Consensus scores are unaffected — they
  // come from the sources, not from our formula.
  const projOk = ordered.map(projComparableWith);
  for (const s of specs) {
    const key = `${s.class}|${s.spec}`;
    const row = { raid: [], mplus: [], projRaid: [], projMplus: [] };
    ordered.forEach((snap, i) => {
      const e = snap.specs[key];
      row.raid.push(e?.scores?.raid ?? (e?.consensus?.raid != null ? midOf(e.consensus.raid) : null));
      row.mplus.push(e?.scores?.mplus ?? (e?.consensus?.mplus != null ? midOf(e.consensus.mplus) : null));
      row.projRaid.push(projOk[i] ? (e?.projection?.raid?.score ?? null) : null);
      row.projMplus.push(projOk[i] ? (e?.projection?.mplus?.score ?? null) : null);
    });
    out.specs[key] = row;
  }
  return out;
}

/* Movement baseline: the most recent snapshot whose stored state DIFFERS from the present
   state. Refresh workflows snapshot AFTER refreshing, so the newest snapshot equals the
   just-refreshed data — a degenerate baseline that can never show movement (every CI
   rebuild deployed zero arrows). Skipping identical snapshots restores "movement since
   the last change" regardless of workflow ordering. Sections a snapshot predates (e.g.
   dummy on older files) are ignored, not treated as differences. */
export function pickBaseline(specs, snapshots) {
  const now = snapshotStateOf(specs);
  for (const snap of snapshots ?? []) {
    // Rank state from a different RANK_VERSION is not evidence of change — comparing it
    // would make every rank-v1 snapshot look "different" and stop the walk one snapshot
    // too early, hiding the real consensus movement further back.
    if (snap?.specs && baselineDiffers(now, snap.specs, ranksComparableWith(snap), consensusComparableWith(snap))) return snap;
  }
  return null;
}
function baselineDiffers(now, then, ranksComparable = true, consensusComparable = true) {
  const anyDummy = Object.values(then).some(e => e && e.dummy);
  const keys = new Set([...Object.keys(now), ...Object.keys(then)]);
  for (const k of keys) {
    const a = now[k], b = then[k];
    if (!a || !b) return true;
    // Across a consensus-composition boundary every mean recomposes at once, so a tier
    // difference is definitional, not evidence of change — the same reasoning ranks use.
    if (consensusComparable &&
        (a.consensus.raid !== (b.consensus?.raid ?? null) || a.consensus.mplus !== (b.consensus?.mplus ?? null))) return true;
    if (!ranksComparable) continue; // consensus tiers are version-independent; ranks are not
    const ar = a.ranks ?? {}, br = b.ranks ?? {};
    for (const r of new Set([...Object.keys(ar), ...Object.keys(br)])) if (ar[r] !== br[r]) return true;
    if (anyDummy && (a.dummy?.rank ?? null) !== (b.dummy?.rank ?? null)) return true;
  }
  return false;
}

/* Movement vs the chosen baseline snapshot: consensus-tier steps per bracket
   (positive delta = improved), per-metric rank deltas, and the Dummy Dome
   composite rank delta (positive = climbed). */
export function movementFor(specs, scales, snapshot) {
  if (!snapshot?.specs) return specs;
  // Consensus tiers are letters and mean the same thing in every version; ranks changed
  // meaning at RANK_VERSION 2 (ties share a rank, sub-MIN_RANK_N rows carry none), so a
  // cross-version rank diff is definitional, not movement.
  const ranksComparable = ranksComparableWith(snapshot);
  // Consensus arrows are suppressed across a composition boundary (CONSENSUS_VERSION):
  // the mean recomposed for every spec at once, which is a registry decision, not movement.
  const consensusComparable = consensusComparableWith(snapshot);
  const bandIdx = new Map(scales.consensus.bands.map((b, i) => [b.tier, i]));
  for (const s of specs) {
    const prev = snapshot.specs[`${s.class}|${s.spec}`];
    if (!prev) continue;
    const movement = {};
    for (const bracket of consensusComparable ? ["raid", "mplus"] : []) {
      const now = s.consensus?.[bracket]?.tier;
      const was = prev.consensus?.[bracket];
      if (now && was && now !== was && bandIdx.has(now) && bandIdx.has(was)) {
        movement[bracket] = { delta: bandIdx.get(was) - bandIdx.get(now), was, since: snapshot.date };
      }
    }
    if (Object.keys(movement).length) s.movement = movement;
    if (!ranksComparable) continue;
    for (const m of s.metrics ?? []) {
      // Key includes source: two sources can share a (bracket, name) but rank separately.
      const was = prev.ranks?.[`${m.source}|${m.bracket}|${m.name}`];
      if (was != null && m.rank != null && was !== m.rank) m.rankDelta = was - m.rank;
    }
    if (prev.dummy?.rank != null && s.ptrDummy?.rank != null && prev.dummy.rank !== s.ptrDummy.rank) {
      s.ptrDummy = { ...s.ptrDummy, rankDelta: prev.dummy.rank - s.ptrDummy.rank, since: snapshot.date };
    }
  }
  return specs;
}


/* The projection's OWN movement, as a SEPARATE pass (audit 2026-07-24, C3).
   It was computed and stored by snapshotStateOf every night and then thrown away: 13
   projection tier moves against 9 consensus moves on 07-23→07-24, while the grid rendered
   no arrows at all in the "Ours: 12.1" view and the change strip printed consensus letters
   over it.

   Why its own function rather than a branch inside movementFor: `projections()` runs AFTER
   movementFor (it consumes consensus + ranks + dummy + outlook, all of which movementFor's
   inputs precede), so inside movementFor `spec.projection` does not exist yet and this
   silently produced nothing. Keeping it separate makes that ordering a contract rather
   than a trap, and leaves movementFor's tier/rank-grained semantics untouched.

   This never feeds consensus (hard rule 3) and is deliberately NOT part of
   baselineDiffers — baseline selection stays tier/rank-grained, and a derived, jittery
   quantity must not get to choose it. scoreDelta rides along because the projection is
   jittery in a way the consensus is not: 6 of those 13 moves were ≤2 points across a band
   edge, so a bare arrow would imply a shift it did not earn. */
export function projectionMovementFor(specs, scales, snapshot) {
  if (!snapshot?.specs) return specs;
  // A projection computed by a different formula version is not a comparable "was".
  // Without this, changing the weights would publish a field-wide wave of forecast arrows
  // narrating our own code change as if the specs had moved.
  if (!projComparableWith(snapshot)) return specs;
  const bandIdx = new Map(scales.consensus.bands.map((b, i) => [b.tier, i]));
  for (const s of specs) {
    const prev = snapshot.specs[`${s.class}|${s.spec}`];
    if (!prev?.projection) continue;
    const projMovement = {};
    for (const bracket of ["raid", "mplus"]) {
      const now = s.projection?.[bracket];
      const was = prev.projection?.[bracket];
      if (now?.tier && was?.tier && now.tier !== was.tier && bandIdx.has(now.tier) && bandIdx.has(was.tier)) {
        projMovement[bracket] = {
          delta: bandIdx.get(was.tier) - bandIdx.get(now.tier),
          was: was.tier, since: snapshot.date,
          scoreDelta: (now.score != null && was.score != null) ? now.score - was.score : null
        };
      }
    }
    if (Object.keys(projMovement).length) s.projMovement = projMovement;
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

// Number of days a metric series may trail the freshest empirical data before it is
// called "frozen" in the honesty banner (H1). 7 clears normal per-source refresh
// staggering (Archon numbers a day behind sims is not "frozen") while catching the
// multi-week WCL rDPS outage (07-09 vs a 07-22 frontier = 13 days → flagged).
const STALE_DAYS = 7;

/* Tier lists publish on an EDITORIAL cadence (CLAUDE.md: "tier lists move weekly-ish"),
   so they legitimately trail a frontier that daily metric feeds set. Reusing STALE_DAYS
   here would flag a perfectly healthy source that simply had a quiet week — the false
   positive that makes a banner get ignored. 14 clears a normal weekly cadence with slack
   while still catching the failure this exists for: WoWMeta sat on a 2026-03-23 prerender
   for a week (130 days behind) with nothing anywhere in the tracker surfacing it. */
const TIER_STALE_DAYS = 14;
const dayGap = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/* Tier-list sources publish LETTERS, not metrics, so before 2026-07-31 they had no
   staleness surface anywhere: not the gate (which reads the agent-written `snapshot`),
   not the heartbeat, not this banner (which only ever walked spec.metrics / ptrDummy /
   fightProfile). That blind spot is how the WoWMeta freeze survived a week of runs that
   each fetched successfully, parsed 40/40 rows and logged "0 moves".

   Two honesty rules are baked in here:
   - A source is only as fresh as its LAGGIEST page. Wowhead once left its M+ Tank page at
     07-09 while the other five refreshed; taking the newest would have hidden that.
   - `published` (the date the PAGE says about itself — JSON-LD dateModified, "Last
     updated", Archon's lastUpdated) outranks `snapshot` (which an agent writes and which
     WoWMeta's proved can simply be false). But the "published" claim is only made when
     EVERY page of that source carries one: a source with mixed attestation falls back to
     the weaker "self-reported" wording rather than printing a publication date it cannot
     vouch for. That mixed case is precisely where a naive implementation prints a
     confident, wrong date.

   A source retyped away from `tier-list` (as WoWMeta was) correctly stops appearing here
   and picks up the ordinary metric path instead — it now has real `asOf` dates to trail. */
export function tierListHealth(sources) {
  const out = [];
  for (const source of sources ?? []) {
    if (source.kind !== "tier-list") continue;
    const dated = (source.pages ?? [])
      .map(p => ({ date: p.published ?? p.snapshot ?? null, attested: p.published ? "published" : "self" }))
      .filter(d => d.date);
    if (!dated.length) continue;
    out.push({
      label: `${source.name ?? source.id} tier list`,
      asOf: dated.map(d => d.date).sort()[0],
      source: source.id,
      kind: "tier-list",
      attested: dated.every(d => d.attested === "published") ? "published" : "self",
      pages: dated.length
    });
  }
  return out;
}

/* Data-health summary for the site's honesty banner: which empirical metric series
   have fallen far behind the freshest data (the WCL rDPS outage freezes several cuts
   at 2026-07-09 while tiers/sims refresh nightly, so the header's "latest snapshot"
   date over-promises for those series). Pure over the specs — no clock, no config;
   the frontier is the newest asOf actually present. Returns null when there's nothing
   to compare, or { latest, oldest, series[] } (series empty when all cuts are fresh). */
/* Staleness measured against the data's OWN newest date — deliberately clock-free, which
   is what keeps this honest when agent-written page snapshots lie, and keeps the build a
   pure function of the data. See the note inside about where the absolute check lives. */
/* Which Warcraft Logs pipeline a series comes from. The two are independently healthy:
   `characterRankings(metric: rdps)` — the redistributed family, including HPS and the
   normalized raid-testing score, and INCLUDING "Median DPS (Mythic, healer)", which is a
   healer's damage off the same endpoint — has been erroring upstream since 2026-07-09,
   while the deterministic raw-DPS fetch lands nightly. Grouping the banner by source alone
   folds them together and announces fresh rows as part of an outage, misdated by weeks
   (audit 2026-07-25). A name regex is not enough: /rDPS|HPS/ misses the healer row, which
   is exactly the kind of row the banner must not misattribute. The rule is the inverse and
   it is total — "raw DPS" is the raw family, everything else on this source is not. */
const wclFamily = label => (/\braw DPS\b/i.test(label) ? "raw" : "redistributed");

export function dataHealth(specs, sources = null) {
  const newest = new Map(); // series label → { asOf: newest seen, source }
  const note = (label, asOf, source) => {
    if (!asOf) return;
    const cur = newest.get(label);
    if (!cur || asOf > cur.asOf) newest.set(label, { asOf, source: source ?? cur?.source ?? null });
  };
  for (const spec of specs) {
    for (const m of spec.metrics ?? []) note(m.name, m.asOf, m.source);
    // ptrDummy carries its own source id — read it rather than assuming Warcraft Logs.
    if (spec.ptrDummy?.asOf) note("Dummy Dome rDPS (real-player medians)", spec.ptrDummy.asOf, spec.ptrDummy.source);
    // Sims live outside spec.metrics, so a stalled Bloodmallet run had no staleness
    // surface anywhere — not the gate, not the heartbeat, not this banner (audit
    // 2026-07-24, D3). Its gate probe is fixed; this is the user-visible half.
    if (spec.fightProfile?.asOf) note("Sim fight profiles (target-count DPS)", spec.fightProfile.asOf, spec.fightProfile.source);
  }
  const tiers = tierListHealth(sources);
  // Tier dates join the frontier: it means "the newest data of ANY kind we hold", so a
  // still-refreshing tier list correctly keeps exposing a stalled metric feed.
  const dates = [...[...newest.values()].map(v => v.asOf), ...tiers.map(t => t.asOf)].sort();
  if (!dates.length) return null;
  const latest = dates[dates.length - 1];
  // The source travels with each series so the banner can attribute a stall correctly. It
  // used to announce every stall as a Warcraft Logs rDPS outage, which made two Robydoby
  // Google Sheets a WCL API failure (audit 2026-07-24, D1).
  const all = [...newest.entries()]
    .map(([label, v]) => ({
      label, asOf: v.asOf, source: v.source ?? null,
      // Only Warcraft Logs has two independently-healthy pipelines to tell apart; every
      // other source is one feed, so it carries no family and gets no causal wording.
      ...(v.source === "warcraftlogs" ? { family: wclFamily(label) } : {})
    }))
    .concat(tiers)
    .sort((a, b) => a.asOf.localeCompare(b.asOf) || a.label.localeCompare(b.label));
  // `series` is the self-relative answer: stale against the data's OWN newest date. It has
  // one blind spot — if the whole empirical layer stalls together, `latest` stalls with it
  // and this goes empty at exactly the moment it matters (audit C7). The absolute check
  // that closes it is applied in the BROWSER instead of here, against the reader's clock:
  //   - the build stays a pure function of the data, so dist/index.html is byte-identical
  //     for identical data. Baking the build date in made the artifact change every night
  //     even on a completely quiet run, and publish commits dist.
  //   - a page read a month later ages honestly rather than reporting how fresh it looked
  //     on the day it was generated.
  // `all` carries every series' date so the client can redo the comparison; `staleDays` is
  // the threshold so the two implementations cannot drift apart.
  const thresholdFor = v => (v.kind === "tier-list" ? TIER_STALE_DAYS : STALE_DAYS);
  const series = all.filter(v => dayGap(v.asOf, latest) > thresholdFor(v));
  return { latest, oldest: series[0]?.asOf ?? null, series, all,
    staleDays: STALE_DAYS, tierStaleDays: TIER_STALE_DAYS };
}

export function buildPayload({ specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers, historySnapshot, historySnapshots, now = null }) {
  const scored = dummyDomeScores(metricRanks(fightLabels(decorateSpecs(specs, sources, scales))));
  // Prefer the full history (skip snapshots identical to the present state); fall back to
  // the single-snapshot param for callers/tests that pass one directly.
  const baseline = historySnapshots ? pickBaseline(scored, historySnapshots) : (historySnapshot ?? null);
  const decorated = movementFor(scored, scales, baseline);
  for (const spec of decorated) {
    const outlook = outlookFor(spec, ptrBuilds);
    if (outlook) spec.outlook = outlook;
    const changes = specBuildChanges(spec, ptrBuilds);
    if (changes.length) spec.buildChanges = changes;
  }
  projections(decorated, scales, creatorTakes); // after consensus/ranks/dummy/outlook — it consumes all four
  projectionMovementFor(decorated, scales, baseline); // MUST follow projections() — see its comment
  const latestBuild = ptrBuilds?.builds?.[0]?.date ?? null;
  // notes-feed pages track build posts, not page snapshots — stamp them from the feed
  const stampedSources = sources.map(source => source.kind !== "notes-feed" ? source : {
    ...source,
    pages: (source.pages ?? []).map(page => ({ ...page, snapshot: page.snapshot ?? latestBuild }))
  });
  return {
    specs: decorated,
    sources: stampedSources,
    history: historySeries(decorated, scales, historySnapshots),
    scales,
    community: community ?? null,
    ptrBuilds: ptrBuilds ?? null,
    creatorTakes: creatorTakes ?? null,
    encounterTiers: encounterTiers ?? null,
    dataHealth: dataHealth(decorated, sources),
    meta: {
      specCount: specs.length,
      trackedCount: specs.filter(spec => spec.ptr).length,
      latestSnapshot: latestSnapshot(sources),
      latestPtrBuild: latestBuild,
      movementSince: baseline?.date ?? null,
      projectionVersion: PROJECTION_VERSION,
      rankVersion: RANK_VERSION,
      consensusVersion: CONSENSUS_VERSION
    }
  };
}
