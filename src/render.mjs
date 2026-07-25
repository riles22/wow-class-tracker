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
export function specBuildChanges(spec, ptrBuilds) {
  const prefix = `${spec.spec} ${spec.class} `;
  const full = `${spec.spec} ${spec.class}`;
  const classLevel = `${spec.class} (`;
  const out = [];
  for (const b of ptrBuilds?.builds ?? []) {
    const affected = b.specsAffected ?? [];
    // Does this build claim to touch this spec (by name, or via a class-level entry)?
    const touchesSpec = affected.some(e => e === full || e.startsWith(classLevel));
    const lines = [];
    for (const h of b.highlights ?? []) {
      if (h.startsWith(prefix)) { lines.push({ text: h.slice(prefix.length), classWide: false }); continue; }
      if (touchesSpec && h.startsWith(classLevel)) lines.push({ text: h, classWide: true });
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
   below (v1 = the 2026-07-06 formula: prior .55 / empirical .45, testing:dummy 2:1,
   outlook ±7, meta read ±3). Stamped into the payload and every history snapshot so
   the post-launch report card grades each frozen forecast against the formula that
   actually produced it. */
export const PROJECTION_VERSION = 1;
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
  for (const s of specs) {
    const key = `${s.class}|${s.spec}`;
    const row = { raid: [], mplus: [], projRaid: [], projMplus: [] };
    for (const snap of ordered) {
      const e = snap.specs[key];
      row.raid.push(e?.scores?.raid ?? (e?.consensus?.raid != null ? midOf(e.consensus.raid) : null));
      row.mplus.push(e?.scores?.mplus ?? (e?.consensus?.mplus != null ? midOf(e.consensus.mplus) : null));
      row.projRaid.push(e?.projection?.raid?.score ?? null);
      row.projMplus.push(e?.projection?.mplus?.score ?? null);
    }
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
    if (snap?.specs && baselineDiffers(now, snap.specs)) return snap;
  }
  return null;
}
function baselineDiffers(now, then) {
  const anyDummy = Object.values(then).some(e => e && e.dummy);
  const keys = new Set([...Object.keys(now), ...Object.keys(then)]);
  for (const k of keys) {
    const a = now[k], b = then[k];
    if (!a || !b) return true;
    if (a.consensus.raid !== (b.consensus?.raid ?? null) || a.consensus.mplus !== (b.consensus?.mplus ?? null)) return true;
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
const dayGap = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/* Data-health summary for the site's honesty banner: which empirical metric series
   have fallen far behind the freshest data (the WCL rDPS outage freezes several cuts
   at 2026-07-09 while tiers/sims refresh nightly, so the header's "latest snapshot"
   date over-promises for those series). Pure over the specs — no clock, no config;
   the frontier is the newest asOf actually present. Returns null when there's nothing
   to compare, or { latest, oldest, series[] } (series empty when all cuts are fresh). */
/* `now` is an OPTIONAL build-time date (YYYY-MM-DD). Without it the computation is purely
   self-relative — staleness measured against the data's own newest date — which is what
   keeps this honest when agent-written page snapshots lie, and is why the relative design
   is kept rather than replaced. But it has one blind spot: if the whole empirical layer
   stalls together, `latest` stalls with it, every gap is 0, and the banner goes silent at
   exactly the moment it matters most (audit 2026-07-24, C7). Passing a real clock (build
   time, not any fetched date) as an upper bound closes that without giving up the
   relative behaviour when the data is fresh. */
export function dataHealth(specs, now = null) {
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
  const dates = [...newest.values()].map(v => v.asOf).sort();
  if (!dates.length) return null;
  const latest = dates[dates.length - 1];
  // Measure against whichever is later: the freshest data, or today. Identical to the old
  // behaviour whenever the pipeline is healthy (they coincide); the difference only shows
  // when EVERYTHING has stopped moving, which is the case the old rule could not see.
  const today = typeof now === "string" && /^\d{4}-\d{2}-\d{2}/.test(now) ? now.slice(0, 10) : null;
  const reference = today && today > latest ? today : latest;
  // The source travels with each frozen series so the banner can attribute the stall
  // correctly. It used to announce every stall as a Warcraft Logs rDPS outage, which
  // made two Robydoby Google Sheets a WCL API failure (audit 2026-07-24, D1).
  const series = [...newest.entries()]
    .filter(([, v]) => dayGap(v.asOf, reference) > STALE_DAYS)
    .map(([label, v]) => ({ label, asOf: v.asOf, source: v.source ?? null }))
    .sort((a, b) => a.asOf.localeCompare(b.asOf) || a.label.localeCompare(b.label));
  return { latest, reference, oldest: series[0]?.asOf ?? null, series };
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
    dataHealth: dataHealth(decorated, now),
    meta: {
      specCount: specs.length,
      trackedCount: specs.filter(spec => spec.ptr).length,
      latestSnapshot: latestSnapshot(sources),
      latestPtrBuild: latestBuild,
      movementSince: baseline?.date ?? null,
      projectionVersion: PROJECTION_VERSION
    }
  };
}
