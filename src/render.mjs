/* Build-time payload assembly: decorate specs with computed consensus and
   sim-derived fight-profile labels, collect metadata. Pure functions — no
   filesystem access. */

import { consensusFor, ptrTierSources, scoreFor } from "./normalize.mjs";

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
   idiom, and bug-fix framing — are handled per clause.

   UNANIMITY, not first-signal-wins (2026-08-01). Every scoreable clause votes, and the
   line only classifies when they AGREE; a line carrying both a buff and a nerf returns
   null and does not vote in the outlook tally.

   Why this changed: highlights are not always one atomic tuning fact. The feed's own
   convention for dense builds (build #16 onward) is ONE consolidated line per spec —
   "Lava Burst and Lightning Bolt damage increased by 30%; … Ascendance now increases
   Elemental Overload damage by 30% (was 75%)" — where first-signal-wins scored the whole
   line off whichever clause happened to come first and silently discarded the rest. That
   made Elemental Shaman's 6/18 pass read as a pure buff and flipped its outlook, with the
   larger nerf in the same sentence never counted. 16 of the 139 highlights on file mix
   directions this way.

   Returning null is the honest answer, not a cop-out: "this line contains both a buff and
   a nerf" genuinely is not evidence of a direction, and outlookFor's tally is a COUNT of
   directional lines. A mixed line that voted either way would be a coin flip presented as
   a finding. Specs whose builds are all mixed lines simply fall to "flat" with a basis
   string that shows +0/−0 — visibly no signal, rather than an invented one. */
export function classifyHighlight(h) {
  const verdicts = new Set();
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
          verdicts.add(now > before ? verbDir : flipped);
        } else {
          verdicts.add(((now > before) !== res) ? "buff" : "nerf"); // higher level = buff, unless it's a cost/cooldown
        }
        continue; // the numeric idiom already decided this clause; the bare verb must not re-vote it
      }
      if (verbDir) verdicts.add(verbDir);
    }
  }
  // 0 scoreable clauses → no signal. 1 direction → that direction. Both → ambiguous,
  // which is not a direction and must not be reported as one.
  return verdicts.size === 1 ? [...verdicts][0] : null;
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
      out.push({ date: b.date, kind: b.kind ?? "build", forumPostNumber: b.forumPostNumber ?? null,
        forumUrl: b.forumUrl ?? null, wowheadUrl: b.wowheadUrl ?? null, lines });
    }
  }
  return out;
}

/* ---- expert read: the specialist creator takes, aggregated (v7, 2026-08-02) ----
   Policy (Riley, 2026-08-02): "we picked these experts for a reason: they are experts."
   The takes[] lane was display-only; it now steers the 12.1 projection. Two structural
   facts about the data decide the shape of this function.

   (1) COVERAGE IS TOTAL. All 40 specs carry at least one non-superseded PTR-era take —
   better than every other PTR signal we hold (external PTR tier list 38/40, zone-54
   raid testing 34/40, Dummy Dome 26/40). So this is not a fallback that fires rarely;
   it fires everywhere, which is exactly why it must be bounded rather than loud.

   (2) RAW NET SENTIMENT INVERTS THE EVIDENCE ORDERING. Counted straight, Arcane Mage
   reads +1.00 from a single take by a single creator while Arms Warrior reads +0.65
   from eight takes by five creators — one voice outranking five agreeing ones. That is
   the same "weakest evidence steers" inversion already rejected for the meta nudge.

   The fix is shrinkage toward zero by corroboration: average within each creator first
   (so one prolific creator is one vote, not eight), average across creators, then scale
   by n/(n+SHRINK) for n distinct creators. With SHRINK = 2 the multiplier runs
   .33 / .50 / .60 / .67 / .71 for 1..5 creators, which puts Arms (+0.46) above Arcane
   (+0.33) and keeps even a unanimous large panel short of a written verdict's authority.

   NO CODE-LEVEL RECENCY RULE, deliberately. The metaNotes lane keeps only the newest
   note per creator, and copying that here is tempting: Kalamazi tags Affliction "nerf"
   on 07-27 and "buff" on 08-01, and averaging them to zero looks like it is discarding
   his current position. It is not. Takes are per-claim, so one creator can hold two true
   readings at once (weak in M+ dummy testing, better after the 07-31 tuning) — and
   `superseded` already exists for genuine retraction, actively used on 190 of 298 takes.
   A heuristic that silently overrode that flag would be code second-guessing curation.
   If a take is stale, mark it superseded; do not teach the estimator to guess.

   Sentiment here is per-CLAIM ("this change is a buff"), not a whole-spec verdict — the
   same shape as the build-line tally, but filtered through people who chose what was
   worth discussing. That is why it slots into the outlook ladder between the writeup and
   the mechanical tally, rather than becoming a competing base term. */
export const EXPERT_SHRINK = 2;
export const EXPERT_MIN = 0.15; // below this the read is too weak/split to set a direction

export function expertRead(spec, takes = []) {
  const mine = (takes ?? []).filter(t =>
    t.class === spec.class && t.spec === spec.spec && !t.superseded &&
    // Same era test the drawer uses: keyed on the PTR marker, never a "live" substring.
    String(t.patchContext ?? "").includes("PTR"));
  if (!mine.length) return null;
  const byCreator = new Map();
  for (const t of mine) {
    const s = t.sentiment === "buff" ? 1 : t.sentiment === "nerf" ? -1 : 0; // neutral/mixed abstain
    if (!byCreator.has(t.creator)) byCreator.set(t.creator, []);
    byCreator.get(t.creator).push(s);
  }
  const perCreator = [...byCreator.values()].map(a => a.reduce((p, q) => p + q, 0) / a.length);
  const raw = perCreator.reduce((p, q) => p + q, 0) / perCreator.length;
  const creators = byCreator.size;
  const shrunk = raw * (creators / (creators + EXPERT_SHRINK));
  const newest = mine.map(t => t.date).filter(Boolean).sort().reverse()[0] ?? null;
  return { raw: +raw.toFixed(3), shrunk: +shrunk.toFixed(3), creators, takes: mine.length, newest };
}

export function outlookFor(spec, ptrBuilds, takes = []) {
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
  /* Direction ladder, best evidence first (v7, 2026-08-02):
       1. the writeup verdict — a theorycrafter's whole-spec written read
       2. the expert take consensus — specialists, corroboration-shrunk
       3. the build-line tally — Blizzard's own lines, counted mechanically
     Step 2 is the writeup fallback Riley asked for: nine specs have no writeup and all
     nine carry cited takes, so the qualitative layer no longer goes silent just because
     no one wrote a structured distillation. It sits ABOVE the tally because a specialist
     choosing what mattered beats counting every line equally, and BELOW the verdict
     because a per-claim sentiment is not a whole-spec read.
     EXPERT_MIN keeps a split or barely-there panel from casting a direction it does not
     actually have; those specs fall through to the tally exactly as before. */
  const expert = expertRead(spec, takes);
  const expertDecides = !verdict && expert != null && Math.abs(expert.shrunk) >= EXPERT_MIN;
  let direction = null, source = null;
  if (verdict === "Positive") { direction = "up"; source = "verdict"; }
  else if (verdict === "Negative") { direction = "down"; source = "verdict"; }
  else if (verdict === "Mixed") { direction = "flat"; source = "verdict"; }
  else if (expertDecides) { direction = expert.shrunk > 0 ? "up" : "down"; source = "expert"; }
  else if (buffs || nerfs) { direction = buffs > nerfs ? "up" : nerfs > buffs ? "down" : "flat"; source = "tally"; }
  else if (mentioned) { direction = "flat"; source = "tally"; }
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
  const expertPhrase = expert
    ? ` · expert takes ${expert.shrunk > 0 ? "+" : ""}${expert.shrunk.toFixed(2)} ` +
      `(${expert.takes} take${expert.takes === 1 ? "" : "s"} from ${expert.creators} ` +
      `creator${expert.creators === 1 ? "" : "s"}, corroboration-weighted` +
      `${source === "expert" ? " — sets the direction, no writeup on file" : ""})`
    : "";
  return {
    direction, source, expert: expert ?? undefined, builds: mentioned, buffs, nerfs,
    contradicted: contradicts || undefined,
    basis: `${verdict ? `PTR read: ${verdict}` : "no writeup yet"} · touched in ${mentioned} of ${builds.length} PTR builds` +
      expertPhrase +
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
                                PTR empirical (w=0.45) ,
                                external PTR tier list (w=0.25) } — renormalized when
             any are absent (so a spec with all three gives the PTR list ~20% of base).
       PTR empirical (per bracket, within-role percentiles ×100):
         raid  = mean of { zone-54 testing-score percentile (w=2),
                           Dummy Dome composite (w=1, DPS only) }
         mplus = mean of { zone-56 M+ testing percentile — rDPS / tank rDPS / HPS
                           by role (w=2), Dummy Dome composite (w=1, DPS only) }
       External PTR tier list = mean of every era:"ptr" tier-list source that rates this
         spec+bracket, through its own scale (Icy Veins' 12.1 M+ lists today — M+ only,
         so the raid bracket falls back to prior+empirical alone). It is deliberately the
         LIGHTEST base term: it is one outlet's subjective forward read, where the prior
         is four sources agreeing and the empirical is measurement. It is nonetheless the
         only EXTERNAL 12.1 opinion in the formula — everything else is our own reading of
         raw data — so it is the one term that can catch a spec the empiricals cannot yet
         see (a rework whose logs have not landed).
     shift = 12.1 outlook direction: up +7 · down −7 · flat 0  (verdict-driven, see
             outlookFor — tiny-n testing never drives direction, only the empirical term)
     nudge = newest general-creator meta note for the spec: positive +3 · negative −3
     score = clamp(base + shift + nudge, 0, 100) → tier via the same consensus bands.
   Confidence = independent PTR signals present (testing, dummy, external PTR tier list,
   writeup/tuning outlook) as a RATIO of the signals OBTAINABLE for that spec and bracket:
   all → high · more than half → medium · any → low · none → prior-only (live baseline, no
   PTR evidence). Obtainable is not four for everyone — Dummy Dome is DPS-only and no PTR
   raid tier list exists — which is the whole reason it is a ratio; see the block at the
   confidence assignment below for what a raw count got wrong. */
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
        series. Grade them separately, or grade only v2 onward.
   v3 — 2026-07-31. A new INPUT: external PTR tier lists (era:"ptr" sources) enter the
        base as a third term at w=0.25, and count toward the confidence signal tally.
        Prior .55 / empirical .45 / outlook ±7 / meta ±3 are all unchanged — but because
        the weights renormalize, adding a third term reweights the other two wherever it
        is present (a spec with all three reads .44/.36/.20 rather than .55/.45). Today
        that means every M+ projection moves and every raid projection does not, since
        Icy Veins publishes no PTR raid list. v2 and v3 are NOT one series.
   v5 — 2026-08-02 (audit, docs/projection-audit-2026-08.md). Weights and inputs
        UNCHANGED; the outlook SHIFT changed shape, which the audit measured as the single
        biggest lever in the model (removing it moved 12 of 80 tier cells, more than any
        weight perturbation).
          · (A) the shift now scales with tally strength — 1 line ±3, 2 lines ±5, 3+ ±7 —
            instead of a flat ±7 whether the balance was one line or five. A DATED verdict
            still earns the full 7: it is a whole-spec read, not a line count.
          · (C) an UNDATED verdict may no longer drive the shift, and contributes none.
            The data layer already treats undated writeups as a shrink-only legacy set;
            the model now agrees with it. Falling back to the tuning tally was measured
            and rejected — 13 of the 19 undated verdicts are "Mixed", so the fallback
            would manufacture directional shifts for 13 specs whose cited read says the
            changes cut both ways (13 tier cells moved rather than 5).
        Justified by coherence, not accuracy — the old behaviour was indefensible on its
        own terms (one line worth the same as five; an undateable read moving a band), and
        deliberately NOT selected by improving the report card's drift number, which
        rewards a forecast that merely copies the live consensus. v4 and v5 are NOT one
        series; the post-launch grade is what can rank them.
   v6 — 2026-08-02 (audit P3). The meta nudge, twice constrained. It now requires >= 2
        general creators whose newest live reads AGREE, and it may no longer change the
        published tier — it moves the score within the band evidence already chose.
        Today the lane has exactly one contributor, so the nudge is dormant and 7 tier
        cells revert to their evidence-only letters (Devourer raid+M+ off S, Marksmanship
        M+, Holy Paladin raid, Brewmaster M+, Outlaw M+, Fury raid). The bound is what
        makes the corroboration gate safe to reactivate: unbounded, a quorum would simply
        restore quorum-flavoured tier control. v5 and v6 are NOT one series.
   v4 — 2026-08-01. Weights and inputs UNCHANGED; the outlook TERM moved, for two reasons
        that landed together:
          · classifyHighlight now requires unanimity across a line's clauses — a line
            carrying both a buff and a nerf returns null instead of being scored off
            whichever clause came first. 13 of the 139 highlights on file reclassify.
          · the four earliest builds (#1/#6/#10/#11) were backfilled from the forum posts
            after an audit found specsAffected and highlights disagreeing: build #1 named
            39 specs but carried 6 lines, so 30 specs' 12.1 changes had never reached the
            outlook tally at all. Coverage went from 9 to 40 specs on #1 alone.
        Net effect: 3 of 40 outlook directions and 1 of 80 projection tiers move. Both
        changes make the tally MORE complete, so v4 scores are not comparable to v3.
   v7 — 2026-08-02. A new INPUT: the specialist creator takes (`creator-takes.json`
        takes[]) enter the model, on Riley's direction — the lane was display-only and
        the people in it were chosen for their expertise. See expertRead() for the
        estimator and why it shrinks by corroboration. Two entry points, mutually
        exclusive per spec so nothing is counted twice:
          · no writeup → the expert consensus SETS the outlook direction (the fallback
            for the nine specs with no ptr writeup) and its magnitude, capped below a
            dated verdict's flat 7;
          · writeup present → the expert consensus ADJUSTS the score within its band
            (±4 at the cap), like the meta nudge and bounded for the same reason.
        Prior/empirical/PTR-list weights, the verdict's ±7 and the meta nudge's ±3 are
        all unchanged. Not one series with v6. */
export const PROJECTION_VERSION = 7;

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

   Bump this ONLY when the LIVE tier-list source set changes, never for upstream data
   movement — and note that adding an era:"ptr" tier list is NOT such a change. Era-gated
   sources are excluded by consensusFor, so the live mean is composed of exactly the same
   sources before and after (icyveins-ptr, added 2026-07-31, moved no consensus cell and
   did not bump this). Only a live source arriving, leaving, or being retyped does.
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
/* The date by which SNAPSHOT_PHASE must no longer read "12.1-ptr". Season 2 opens
   2026-08-18 (12.1 itself lands 08-11); a couple of days of slack absorbs a delayed
   launch without nagging.

   This exists because the flip is the one action in the whole system that NOTHING can
   detect after the fact. Miss it and every post-launch snapshot is still stamped
   "12.1-ptr", so the forecast report card can never find the boundary it grades the
   frozen pre-launch projection against — and the loss is silent and permanent, since
   the pre-launch state cannot be reconstructed later. Every other lapse here announces
   itself: stale data trips a staleness gate, a missed nightly trips the heartbeat, a
   bad parse trips the anomaly gate. This one just quietly produces a wrong answer
   forever, which is exactly the kind of failure the rest of this repo refuses to allow.
   `check-refresh --age` therefore fails red once this date passes with the flip
   undone, turning the one silent failure into a loud one. */
export const PHASE_FLIP_DUE = "2026-08-20";

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
/* External PTR tier-list opinion for one spec+bracket, on the shared 0–100 axis.
   Mean across every era:"ptr" tier-list source that rates it (one today). Returns null
   when none does — including the upstream "TBD" case, which is stored as an explicit
   null rating and must stay ABSENT from the formula rather than scoring 0: "not yet
   placed" is missing evidence, not a bottom-tier verdict. */
export function ptrTierRead(spec, bracket, sources, scales) {
  const parts = [];
  for (const source of ptrTierSources(sources)) {
    const tier = spec.ratings?.[bracket]?.[source.id] ?? null;
    const score = scoreFor(scales, source.scale, tier);
    if (score !== null) parts.push({ label: source.name, tier, score });
  }
  if (!parts.length) return null;
  return {
    score: parts.reduce((sum, p) => sum + p.score, 0) / parts.length,
    tiers: parts.map(p => p.tier).join("/"),
    label: parts.length === 1 ? parts[0].label : `${parts.length} PTR lists`
  };
}
export function projectionFor(spec, bracket, scales, metaNotes = [], sources = []) {
  const prior = spec.consensus?.[bracket]?.score ?? null;
  const testing = bracket === "raid"
    ? rankPct(spec, "raid", "12.1 PTR raid testing score (normalized)")
    : rankPct(spec, "mplus", PTR_MPLUS_SERIES[spec.role]);
  const dummy = spec.ptrDummy?.score ?? null; // DPS-only composite, already 0–100
  const empParts = [[testing, 2], [dummy, 1]].filter(([v]) => v != null);
  const emp = empParts.length
    ? empParts.reduce((s, [v, w]) => s + v * w, 0) / empParts.reduce((s, [, w]) => s + w, 0)
    : null;
  const ptrList = ptrTierRead(spec, bracket, sources, scales);
  const baseParts = [[prior, 0.55], [emp, 0.45], [ptrList?.score ?? null, 0.25]].filter(([v]) => v != null);
  if (!baseParts.length) return null; // nothing to project from — honest "—"
  const base = baseParts.reduce((s, [v, w]) => s + v * w, 0) / baseParts.reduce((s, [, w]) => s + w, 0);
  const dir = spec.outlook?.direction ?? null;
  /* Outlook shift, v5. Two defects the 2026-08-02 audit measured, both fixed here.

     (C) An UNDATED verdict may not drive the shift. Validation already requires
     `ptr.asOf` on every new writeup and keeps UNDATED_WRITEUPS as a shrink-only list of
     grandfathered exceptions — but the model ignored that distinction, so three tier
     cells rested on a read whose date nobody recorded (Unholy DK raid sat a band lower
     for a "Negative" of unknown vintage). Such a verdict now contributes NO shift.

     Falling back to the tuning tally instead was the first design and was rejected on
     measurement: 13 of the 19 undated verdicts are "Mixed", which reads as flat and
     therefore contributes nothing today. Falling back would convert all 13 into
     directional shifts at once — 13 tier cells rather than 5 — and it would do so in
     exactly the case where a line count is least trustworthy. "Mixed" is a
     theorycrafter saying the changes cut both ways; that read ages far better than a
     "Positive", so overriding it with arithmetic is the wrong direction of travel.
     Removing an untrustworthy input should not manufacture a new one in its place.

     (A) The shift SCALES with tally strength. It was a flat ±7 whether the balance was
     one line or five: Elemental Shaman lost a full band on a single nerf line while
     Guardian's 4/0 was worth exactly the same. A dated verdict still earns the full 7 —
     it is a theorycrafter's whole-spec read, not a line count. */
  const bal = (spec.outlook?.buffs ?? 0) - (spec.outlook?.nerfs ?? 0);
  const datedVerdict = !!spec.ptr?.verdict && !!spec.ptr?.asOf;
  const shiftDir = datedVerdict || !spec.ptr?.verdict ? dir : null; // undated verdict → no shift
  /* (v7) When the expert panel set the direction, it also sets the magnitude — scaled by
     the same corroboration-shrunk strength, so one take moves less than five agreeing
     ones. The ceiling is deliberately below a dated verdict's flat 7: a realistic maximum
     panel (8 unanimous creators → shrunk .80) reaches 6, so no amount of take volume ever
     outranks a theorycrafter who sat down and wrote the spec up. */
  const expert = spec.outlook?.expert ?? null;
  const expertDrives = spec.outlook?.source === "expert";
  const mag = datedVerdict ? 7
    : expertDrives ? Math.min(7, Math.round(2 + 5 * Math.abs(expert.shrunk)))
    : Math.min(7, 3 + 2 * Math.max(0, Math.abs(bal) - 1));
  const shift = shiftDir === "up" ? mag : shiftDir === "down" ? -mag : 0;
  // Bracket-scoped + supersession-aware note selection: a creator's raid read must
  // never color the M+ projection under their name (izen's reads genuinely differ per
  // bracket), and a retracted (superseded) note must not nudge what the drawer hides.
  // Notes whose patchContext names no bracket apply to both.
  const notes = metaNotes
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
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  /* Meta nudge, v6. Two independent defects, and they interact — the bound is what makes
     the corroboration gate safe to switch back on.

     CORROBORATION (>= 2 creators, unanimous). Every other layer of this tracker refuses
     single-source authority: the consensus averages four tier lists so no outlet
     dominates, Murlok's quantified large-N numbers are never converted to letters, an
     era-gated PTR list is excluded from the mean. The nudge was the one place a lone
     individual's unquantified sentiment steered a published forecast — and all 108
     metaNotes on file come from one person, so "the newest general-creator read" was
     always the same voice. Unanimity rather than majority, matching classifyHighlight:
     a lane that disagrees with itself is not evidence of a direction. Corroboration is
     also a real noise filter — one read flipping in three days (izen's Beast Mastery,
     positive 07-06 to negative 07-09) is noise; several flipping together is a signal.

     BOUND (may not change the published tier). An input named "nudge" that promotes a
     spec into S is not nudging, it is deciding: Devourer reached the headline tier in
     BOTH brackets on one person's sentiment. The nudge now adjusts the score — so it
     still moves the meter, the ordering and the basis string — but the letter is decided
     by evidence alone. This generalises the objection rather than special-casing S:
     there is no principled reason a sentiment may promote into A+ but not into S.

     Why both. Asked directly whether five creators agreeing should move Brewmaster C→B,
     the honest answer is no — so source count alone was never the right gate, and a bare
     >=2 rule would have quietly restored a behaviour we do not endorse the moment the
     lane grew. Bounded, the answer flips to yes: several agreeing reads adjusting a score
     without touching a letter is exactly what a nudge should be. */
  const newestPerCreator = new Map();
  for (const n of notes) if (!newestPerCreator.has(n.creator)) newestPerCreator.set(n.creator, n);
  const dirs = [...newestPerCreator.values()]
    .map(n => n.sentiment === "positive" ? 1 : n.sentiment === "negative" ? -1 : 0)
    .filter(Boolean);
  const corroborated = dirs.length >= 2 && dirs.every(d => d === dirs[0]);
  const nudge = corroborated ? dirs[0] * 3 : 0;
  const note = corroborated ? notes[0] : null;
  const nudgeCreators = corroborated ? newestPerCreator.size : 0;

  /* Expert ADJUSTMENT (v7). The expert read either decides the outlook or adjusts the
     score — never both, which is what keeps it from being counted twice. It decided
     above only when no writeup exists; here it applies in the other case, so a spec WITH
     a writeup still has its specialists heard rather than ignored ("include them in our
     calculations", Riley 2026-08-02). Bounded like the meta nudge and for the same
     reason: it moves the meter, the ordering and the basis string, but the published
     letter stays decided by the writeup and the measurements. ±4 at the cap, and
     realistically ±1 to ±3 once shrinkage is applied. */
  const expertAdj = !expertDrives && expert ? Math.round(4 * expert.shrunk) : 0;
  // Tier is decided WITHOUT the nudge or the expert adjustment; both then move the score
  // only within that band. Clamping rather than discarding keeps the meter informative.
  const evidenceScore = Math.round(Math.min(100, Math.max(0, base + shift)));
  const band = scales.consensus.bands.find(b => evidenceScore >= b.min);
  const bandIdx = scales.consensus.bands.indexOf(band);
  const ceiling = bandIdx <= 0 ? 100 : scales.consensus.bands[bandIdx - 1].min - 1;
  const within = nudge + expertAdj;
  const score = within
    ? Math.min(ceiling, Math.max(band.min, Math.round(evidenceScore + within)))
    : evidenceScore;
  const signals = (testing != null ? 1 : 0) + (dummy != null ? 1 : 0) + (dir != null ? 1 : 0)
    + (ptrList ? 1 : 0);
  /* Confidence is a ratio against the signal types that COULD exist for this spec+bracket,
     not a raw count. Two reasons, one new and one long-standing:

     · A raw count breaks the moment a signal type arrives with near-universal coverage.
       The PTR tier list rates 38 of 40 specs, so counting it moved 39 of 40 M+ specs to
       "high" (from 18) — everyone shifted up by one, "high" quietly came to mean what
       "medium" meant, and the tag stopped discriminating between a well-evidenced spec
       and an ordinary one. Rating against what is obtainable is immune to that.
     · Dummy Dome is DPS-only by construction and no PTR raid tier list exists, so under a
       raw count a healer's raid projection could never exceed "medium" no matter how
       complete its evidence was. That was always a misread: it measured which signals the
       tracker collects, not how well-supported the forecast is.

     Bands: everything obtainable → high · MORE than half → medium · any → low · none →
     prior-only. Strictly more than half, not at least: with two obtainable signals a
     single one is thin evidence and must keep reading "low" — the tag's real job is the
     warning at the bottom, and an "at least half" band silently promoted every one-signal
     healer and tank to medium. A DPS spec's raid bracket is unchanged from v2 (3 of 3
     high, 2 medium, 1 low), which is what every existing snapshot was written under. */
  const ptrListPossible = ptrTierSources(sources).some(s =>
    (s.pages ?? []).some(p => p.bracket === bracket && (p.role === spec.role || p.role === "All" || p.role == null)));
  const available = 2 // PTR testing + tuning outlook: obtainable for every spec and bracket
    + (spec.role === "DPS" ? 1 : 0) // Dummy Dome: DPS-only
    + (ptrListPossible ? 1 : 0);    // an era:"ptr" tier list covering this bracket+role
  const confidence = signals === 0 ? "prior-only"
    : signals >= available ? "high"
    : signals > available / 2 ? "medium"
    : "low";
  return {
    tier: band ? band.tier : null, score, confidence,
    basis: `live baseline ${prior != null ? Math.round(prior) : "—"}`
      + (testing != null ? ` · PTR ${bracket === "raid" ? "raid-testing" : "M+ testing"} pct ${Math.round(testing)}` : "")
      + (dummy != null ? ` · Dummy Dome ${Math.round(dummy)}` : "")
      + (ptrList ? ` · ${ptrList.label} ${ptrList.tiers} (${Math.round(ptrList.score)})` : "")
      // Report the shift ACTUALLY applied. This read "+7"/"−7" from v1 through v6, which
      // stopped being true at v5 when the magnitude began scaling with tally strength —
      // so a spec shifted +3 published a basis claiming +7. A transparency string that
      // states a number the model did not use is worse than no string (found 2026-08-03
      // while answering "how are we weighting each factor?").
      + (dir ? ` · outlook ${shift > 0 ? "+" : shift < 0 ? "−" : ""}${Math.abs(shift)}` +
          (expertDrives ? ` (expert panel: ${expert.creators} creator${expert.creators === 1 ? "" : "s"}, no writeup)` : "") : "")
      + (expertAdj ? ` · expert takes ${expertAdj > 0 ? "+" : "−"}${Math.abs(expertAdj)}` +
          ` (${expert.creators} creator${expert.creators === 1 ? "" : "s"}, within-tier only)` : "")
      + (nudge ? ` · meta read ${nudge > 0 ? "+3" : "−3"} (${nudgeCreators} creators agree, within-tier only)` : "")
  };
}
export function projections(specs, scales, creatorTakes, sources = []) {
  const metaNotes = creatorTakes?.metaNotes ?? [];
  for (const spec of specs) {
    const raid = projectionFor(spec, "raid", scales, metaNotes, sources);
    const mplus = projectionFor(spec, "mplus", scales, metaNotes, sources);
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
    const outlook = outlookFor(spec, ptrBuilds, creatorTakes?.takes ?? []);
    if (outlook) spec.outlook = outlook;
    const changes = specBuildChanges(spec, ptrBuilds);
    if (changes.length) spec.buildChanges = changes;
  }
  // after consensus/ranks/dummy/outlook — it consumes all four, plus the era:"ptr" tier
  // lists it reads straight off spec.ratings via the registry
  projections(decorated, scales, creatorTakes, sources);
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
