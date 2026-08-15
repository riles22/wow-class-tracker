/* Build-time payload assembly: decorate specs with computed consensus and
   sim-derived fight-profile labels, collect metadata. Pure functions — no
   filesystem access. */

import {
  aheadSeasonFor, consensusFor, frozenLettersFor, isLiveEra, nextPatchTierSources,
  PHASES, scoreFor
} from "./normalize.mjs";

/* `seasonFinal` is data/season-final.json — each source's LAST letters about the live
   season, used only where an outlet has already moved on. Absent (null) reproduces the
   pre-2026-08-09 behaviour exactly. */
export function decorateSpecs(specs, sources, scales, seasonFinal = null) {
  return specs.map(spec => {
    const key = `${spec.class}|${spec.spec}`;
    return {
      ...spec,
      consensus: {
        raid: consensusFor(spec.ratings?.raid, sources, scales, "raid", PHASES.liveSeason,
          frozenLettersFor(seasonFinal, key, "raid")),
        mplus: consensusFor(spec.ratings?.mplus, sources, scales, "mplus", PHASES.liveSeason,
          frozenLettersFor(seasonFinal, key, "mplus"))
      }
    };
  });
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

/* The sample size below which a rank is real but THIN, and says so on the page. Distinct from
   MIN_RANK_N, which withholds a rank entirely: between the two, a spec gets its number and a
   visible qualifier rather than silence. 100 because that is where the current PTR cuts stop
   being comparable to the dense live cuts beside them — zone 56 runs from 21 parses (Fire Mage)
   to 1,107 (Arcane), a 50x spread rendered identically today. See metricRanks. */
export const LOW_SAMPLE_N = 100;

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
      /* THIN SAMPLE (2026-08-08). MIN_RANK_N is a floor, not a quality bar: clearing 10 logs
         buys a rank, and from then on a #24/27 built on 21 parses renders exactly like one
         built on 1,085. Measured on the zone-56 PTR M+ cut, which is ~41% of the effective M+
         projection weight: 13 of 27 specs sit under 100 parses and five under 50. The number
         is not wrong, but showing it with no visible qualifier invites a reader to weigh it
         like the dense rows beside it — and per the touch-legibility rule a tooltip does not
         count, because `title` does not exist on a phone.
         LOW_SAMPLE_N is deliberately a flat, stated threshold rather than a percentile of the
         field: a within-field rule would mark a fixed fraction of rows every run even when the
         whole cut is healthy, which trains readers to ignore it. */
      if (metric.n != null && metric.n < LOW_SAMPLE_N) metric.thin = true;
      else if ("thin" in metric) delete metric.thin; // upsert-in-place: never leave a stale flag
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
/* SUPPORT SPECS ARE NOT MEASURABLE HERE (2026-08-03, external audit). The Dummy Dome
   measures PERSONAL throughput. Augmentation is the game's only support spec: its own
   damage is deliberately low because its contribution is buffing allies, and a dummy
   room has no allies to buff. The same rDPS statistic ranks it 2 of 27 in live Mythic
   raid and 19 of 19 here — the cleanest possible demonstration that this environment
   measures exactly the thing the spec sacrifices.

   That invalid composite was not a rounding error: its zone-54 raid-testing row is n=5,
   below MIN_RANK_N, so the Dummy Dome was the ENTIRE PTR empirical term for its raid
   forecast, and it published C/34 against a live consensus of A/71.

   Excluding it from `fieldByCount` as well as from scoring is deliberate — its 79,755 at
   one target sits far below the next-lowest spec (126,678) and was depressing every other
   spec's percentile denominator too. This is the same exclusion healers and tanks already
   get, applied for the same reason: the measurement does not describe the role. */
const SUPPORT_SPECS = new Set(["Evoker|Augmentation"]);
const dummyMeasurable = s => s.role === "DPS" && !SUPPORT_SPECS.has(`${s.class}|${s.spec}`);

export function dummyDomeScores(specs) {
  const dps = specs.filter(s => dummyMeasurable(s) && s.ptrDummy?.targets && Object.keys(s.ptrDummy.targets).length);
  if (!dps.length) return specs;
  const allCounts = [...new Set(dps.flatMap(s => Object.keys(s.ptrDummy.targets)))].sort((a, b) => a - b);
  /* SAMPLE-SIZE FLOOR (2026-08-03, external audit). Every ordinary metric loses its rank
     below MIN_RANK_N parses, but this composite had no such guard: it gated only on how
     many target COUNTS a spec logged, so a count backed by two parses counted the same as
     one backed by ninety. 12 of 19 scored composites included at least one such cut.

     ptrDummy stores only count→DPS, but the parallel "Median raw DPS (12.1 PTR Dummy Dome,
     NT)" rows come from the same zone-52 fetch at the same target counts and DO carry n, so
     the sample size is recoverable without a data migration. It is the population of the
     raw-DPS series rather than of the rDPS cut — a different statistic over the same
     players — so treat it as a faithful proxy; if the two series ever diverge in coverage,
     carry n on ptrDummy itself instead of inferring it here. */
  const enoughParses = (spec, count) => {
    const m = (spec.metrics ?? []).find(x =>
      x.name === `Median raw DPS (12.1 PTR Dummy Dome, ${count}T)`);
    return m?.n == null || m.n >= MIN_RANK_N; // unknown n stays in; a KNOWN thin cut drops out
  };
  /* The REFERENCE FIELD contains only cuts that clear the floor (rank v3, 2026-08-04
     external audit). The floor above kept a thin cut out of its OWN composite but left
     its value in everyone else's denominator, so a two-parse median still depressed or
     inflated every other spec's percentile — removing the thin observations moved all 10
     scored composites. A thin cut is now judged against the clean field but is not part
     of it; a spec with an unknown n stays in, same as the floor itself. */
  const fieldByCount = new Map(
    allCounts.map(c => [c, dps.filter(s => enoughParses(s, c))
      .map(s => s.ptrDummy.targets[c]).filter(v => typeof v === "number")])
  );
  /* Tie-aware MIDRANK (2026-08-03, external audit). The old form counted only strictly
     lower values, so an all-tied field mapped every spec to 0 — the bottom of the scale —
     while ranking them all #1. Half credit for ties puts a fully tied field at 0.5
     (everyone at the median, which is what a tie means) and leaves an untied field alone.
     `ownIncluded` says whether v is a member of arr: a clean cut compares against the
     other n−1 values (self excluded from below/tied), while a thin cut compares against
     all n clean values it is not among — without the flag a thin value above the whole
     field would score n/(n−1) > 100%. */
  const pct = (arr, v, ownIncluded = true) => {
    if (arr.length < 2 || typeof v !== "number") return null;
    const others = arr.length - (ownIncluded ? 1 : 0);
    if (others < 1) return null;
    const below = arr.filter(x => x < v).length;
    const tied = arr.filter(x => x === v).length - (ownIncluded ? 1 : 0);
    return (below + 0.5 * Math.max(0, tied)) / others;
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
    const thin = [];
    for (const c of allCounts) {
      const clean = enoughParses(s, c);
      const p = pct(fieldByCount.get(c), s.ptrDummy.targets[c], clean);
      if (p == null) continue;
      perCount[c] = Math.round(p * 100);
      // A thin cut still DISPLAYS — judged against the clean field — but does not vote
      // in the headline composite and is not part of anyone's denominator.
      if (clean) ps.push(p); else thin.push(Number(c));
    }
    const coverage = { have: ps.length, of: allCounts.length,
      ...(thin.length ? { thin } : {}) };
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
export const EXPERT_QUORUM = 3; // creators needed before the adjustment may cross a band edge (v9)

/* Bracket scope for one take (v8, 2026-08-04 external audit). A creator ranking healers
   for M+ keys is not commenting on raid — yet the v7 read pooled every take into both
   brackets, so Mistweaver's raid forecast was moved by three M+-tier-list nerf reads
   (33 of the 99 live PTR takes are M+-scoped, 7 raid-scoped). Same precedence as the
   metaNotes nudge, same regexes, same field: an explicit `bracket` on the take wins;
   otherwise the patchContext text decides; a context naming neither applies to both
   (a "Season 2 review" is a whole-spec read). Scoping reads patchContext — where the
   take CAME from — not the claim text, which can name a bracket incidentally. */
/* Exported so `audit-creators` can ask the SAME question expertRead asks (2026-08-15).
   It used to group takes by the raw `t.bracket` string, which is not the lens the model
   uses: "both" feeds both lanes and an unscoped take is routed by patchContext. Measured on
   the live data, that mismatch hid 23 real dilutions while the tool reported zero. A second
   copy of this rule in the audit script would have drifted the same way, so there is one. */
export const takeInBracket = (t, bracket) => {
  if (bracket == null) return true; // unscoped call: the whole-spec arrow
  if (t.bracket === "raid" || t.bracket === "mplus") return t.bracket === bracket;
  if (t.bracket === "both") return true;
  const pc = String(t.patchContext ?? "");
  const mentionsRaid = /\braid\b/i.test(pc);
  const mentionsMplus = /m\+|mythic\s*plus|dungeon|keystone|\bkeys?\b/i.test(pc);
  if (!mentionsRaid && !mentionsMplus) return true;
  return bracket === "raid" ? mentionsRaid : mentionsMplus;
};

export function expertRead(spec, takes = [], bracket = null) {
  const mine = (takes ?? []).filter(t =>
    t.class === spec.class && t.spec === spec.spec && !t.superseded &&
    // Same era test the drawer uses: keyed on the CURRENT phase's marker (PHASES.ptr),
    // never a bare "PTR" substring — after launch, "12.1 PTR" takes describe the live
    // season, and only the NEXT cycle's marker reads as future-era again.
    PHASES.ptr != null && String(t.patchContext ?? "").includes(PHASES.ptr.marker) &&
    takeInBracket(t, bracket));
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
  /* The consolidated launch patch notes (kind: "patch-notes") are the AUTHORITY on what
     ships — and precisely for that reason they are excluded from this tally, which is a
     line-COUNTING heuristic and cannot read them (Riley + audit, 2026-08-07).

     Their format is one paragraph per spec restating the entire patch, so:
       · 34 of the 49 lines classify as null — a paragraph carrying both buffs and nerfs
         fails the unanimity rule by construction, so 28 of 40 specs would go silent if
         this were the tally's only input;
       · the ones that do classify can be flatly wrong — Holy Priest's line ("All healing
         +16% … mana cost -30% … healing +15%") reads as a NERF to the classifier.
     Counting them alongside the incremental builds also double-counts every change,
     because each launch line restates builds already tallied: verified that all 40 specs
     appearing here also appear in earlier builds and NONE relies on this entry as its
     only source, so excluding it loses no signal and removes a live phantom nerf.

     The consequence to be honest about: this tally measures the DIRECTION OF TUNING
     ACROSS THE PTR, not the shipping delta. The shipping delta lives in the patch notes,
     which the drawer now presents on their own terms. */
  const scored = builds.filter(b => (b.kind ?? "build") !== "patch-notes");
  const mentioned = scored.filter(b => (b.specsAffected ?? []).some(e =>
    e === full || e.startsWith(classLevel))).length;
  let buffs = 0, nerfs = 0;
  for (const b of scored) {
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
  // Writeups auto-confirm, so a verdict distilled before three tuning passes still drives
  // the ARROW. It no longer drives the projection shift when undated — v5 made an undated
  // verdict contribute zero (see projectionFor) — and this comment claimed otherwise until
  // 2026-08-03. Either way, STATE the contradiction rather than silently resolving it:
  // Blood DK publishes "Negative" while its own official lines are +2/−0 (audit 07-24, D5).
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
    basis: `${verdict ? `PTR read: ${verdict}` : "no writeup yet"} · touched in ${mentioned} of ${scored.length} PTR builds` +
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
     base  = weighted mean of { live consensus score (w=0.35, v9 — was .55) ,
                                PTR empirical (w=0.45) ,
                                external PTR tier list (w=0.30, v9 — was .25) } —
             renormalized when any are absent (so a spec with all three gives the PTR
             list ~27% of base, and a spec with NOTHING but the prior reads 100% prior:
             the reweight only moves cells that hold real PTR evidence).
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
     shift = 12.1 outlook direction (±10 at the cap since v9): a dated verdict earns the
             full 10, the tally scales 4/7/10 with line balance, an expert-driven
             direction reaches at most 9 (verdict-driven, see outlookFor — tiny-n
             testing never drives direction, only the empirical term)
     nudge = newest general-creator meta note for the spec: positive +3 · negative −3
     score = clamp(base + shift + nudge, 0, 100) → tier via the same consensus bands.
   Confidence = independent PTR signals present (testing, dummy, external PTR tier list,
   writeup/tuning outlook, specialist takes) as a RATIO of the signals OBTAINABLE for that spec and bracket:
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
        all unchanged. Not one series with v6.
   v8 — 2026-08-04 (external audit of v7). Three input corrections, no new weights:
          · the expert read is BRACKET-SCOPED in the projection (explicit take.bracket
            wins, else the same patchContext heuristic the meta nudge uses; a context
            naming neither bracket applies to both). 33 of the 99 live PTR takes are
            M+-scoped and were moving raid forecasts — Mistweaver's raid score carried
            a −2 built from three M+-tier-list reads. The whole-spec ARROW (outlookFor)
            stays unscoped; the per-bracket ladder is re-derived in projectionFor.
          · the Dummy Dome reference field excludes sub-MIN_RANK_N cuts (rank v3) — a
            thin cut was already refused a vote in its own composite but still sat in
            every other spec's percentile denominator. The dummy INPUT to the empirical
            term changes value for every scored spec.
          · the specialist-take lane counts in the confidence signals (numerator AND
            denominator). v7 let the expert adjustment move a score while "prior-only"
            claimed no PTR evidence existed — 5 cells published exactly that
            contradiction. When the panel drives the direction it fills the outlook
            slot's place instead (never counted twice).
        Not one series with v7.
   v9 — 2026-08-04, OWNER REWEIGHT (Riley, in-session — all three decisions clicked;
        the one version whose justification is an explicit editorial prior rather than
        an audit finding, recorded as such): "we are giving a little too much weight to
        the baseline… shift some more weight into the actual creator / expert takes and
        maybe the math of ptr changes and reviews." The prior is the 12.0.7 consensus —
        evidence about a meta that dies at launch (Aug 11) — so measured PTR data and
        the qualitative 12.1 reads now lead wherever they exist:
          · base weights: prior .55→.35, PTR list .25→.30 (empirical .45 unchanged).
            Renormalization keeps prior-only cells at 100% prior — untouched.
          · outlook shift cap ±7→±10: dated verdict 10, tally 4/7/10 by line balance,
            expert-driven ≤9 (still strictly under a written verdict).
          · expert adjustment ±4→±6, and with QUORUM (≥EXPERT_QUORUM=3 shrunk creators)
            it may cross ONE band edge — the single deliberate loosening of the v6
            "sentiment never moves a letter" bound: that bound guarded against
            single-source authority, and a ≥3-creator corroboration-shrunk panel is its
            opposite. One edge max; the meta nudge stays within-tier (lane still has
            one contributor). Crossings are named in the basis.
        Same-day sensitivity vs v8 measured and recorded in the PR. This is the version
        the frozen forecast will carry into the report card — deliberately: the freeze
        should encode the owner's actual pre-launch read, and the carry-forward baseline
        it must beat still copies the frozen live consensus forward. Not one series
        with v8.
   v10 — 2026-08-07 (Riley: creators, especially on healers and tanks, were not lining
        up with our forecasts). Diagnosis first: this was NOT a mis-set prior weight.
        The .35 never applied in raid, because renormalization gives the prior 100% once
        the other terms are absent — so lowering it would have changed nothing. Measured
        before the change: healers 7/7 and tanks 6/6 raid cells were 100% prior, along
        with 14 of 27 DPS. Two fixes shipped and one was tried and rejected:
          (A) REJECTED — filling raid coverage with Robydoby's PTR raid cut. It looked
              ideal (already ranked, 26 DPS + all 7 healers) and measured badly: r = −0.43
              against Dummy Dome, no sample size on any row, and 21 raid forecasts moved
              including 40-point swings. Full reasoning at the testing lookup in
              projectionFor. The raid gap therefore REMAINS; what changed is that we now
              say so instead of dressing a stale prior as a forecast.
          (B) CONFIDENCE HONESTY. A cell with no PTR empirical term and no PTR list now
              caps at "low" — six healer/tank raid cells were publishing "medium" over a
              forecast containing no 12.1 measurement at all. It caps at "low" and not
              "prior-only" because the v8 audit rightly holds that a signal which MOVES
              the number is evidence and must say so; "prior-only" keeps meaning "nothing
              touched it".
          (C) EXPERT HEADROOM. The ±6 ceiling was calibrated for a blend led by measured
              PTR evidence; on a 100%-prior cell it pinned the forecast to last patch —
              measured at 1.7–3.0 points against ~15-point bands, so one creator moved a
              forecast 2 points. It doubles to ±12 ONLY where there is no PTR empirical
              term and no PTR list, i.e. exactly the cells where specialists are the only
              12.1-aware evidence we hold. Band discipline is untouched: the
              adjFloor/adjCeil clamp still holds a non-quorum panel inside its band and
              lets a quorum panel cross exactly one edge.
        Weights themselves are unchanged, so the 2026-08-02 "weights frozen until the
        report card" line is not crossed: (B) is a labelling fix and (C) is a bound that
        only binds where the blend is empty. Not one series with v9.
   v11 — 2026-08-07 (Riley, deciding against a stated objection). The expert QUORUM is
        removed for healers and tanks: one creator may now cross a band edge for those
        roles, DPS unchanged. Rationale and the coverage numbers that forced the choice
        are at the expertQuorum site. Coverage was attempted FIRST, as asked, and came up
        empty: a sweep of all 14 transcribable tank/healer creators found no raid-scoped
        12.1 content to distil (the one candidate transcript-verified in full turned out
        to be a key-run POV whose "raid" passage is chat banter about raid buffs in M+),
        so the quorum change ships without the coverage improvement that would have made
        it safer. Effect: 2 tier moves, Holy Paladin raid A→A+ on 2 creators and
        Protection Warrior raid A+→S on ONE. That single-creator S is the cost of the
        decision, working exactly as specified — flag it if it looks wrong on the page.
        Not one series with v10.
     v12 (2026-08-08, owner-approved): UNITS FIX, not a weight change. The PTR empirical
        percentile is recentred from its by-construction mean of 50 onto the bracket's live
        consensus mean — location only, spread and ordering untouched. Full reasoning at the
        UNITS note in projectionFor. Measured: out-of-sample level gap vs the external 12.1
        read -15.2 → -10.2 (33% recovered), Spearman 0.552 → 0.541 (noise), sd unchanged.
        11 of 80 published letters move, ALL M+, ALL one band, ALL upward; raid identical
        (the zone-54 series reaches nobody, so there is no percentile to recentre there);
        0 consensus letters. Diagnosis note for the record: the divergence from the expert
        community that prompted this was measured as a LEVEL problem, not an ordering one —
        held out, this model predicts the external 12.1 M+ ordering at Spearman 0.549 against
        0.053 for the carry-forward baseline and 0.207 for the best single tier list we hold.
        The source-generosity hypothesis was tested and REFUTED (mean-centring every source
        moves 0 of 40 consensus scores — it is algebraically a no-op when all sources rate
        all specs); do not re-open it. */
/* v13 — 2026-08-09 (owner decision). Wowhead published its Season-2 lists early and is now
   admitted to the next-patch term: `ptrTierRead` reads `nextPatchTierSources`, which takes
   an era:"ptr" list OR a live outlet whose pages verify a season ahead of liveSeason. This
   is a new INPUT on unchanged .35/.45/.30 weights — the v3 precedent, not a reweight — but
   outputs are not identical, so the marker moves. Measured on landing: 28 projection letters
   moved (raid 21 / M+ 7), 75 scores, 21 confidence tags (19 low→medium, 2 prior-only→low,
   all raid, all up), max |Δ| 24 (Blood DK raid 48→72).
   The side effect to know: `noPtrEvidence` cells go 28→0, so the v10 doubled ±12 expert
   ceiling reverts to ±6 on all of them, and on 12 cells the expert adjustment SHRANK. That
   is why 19 of the 28 letter moves are downward — a raid cell that was the 12.0.7 prior
   plus a large specialist nudge is now the prior blended with a real 12.1 letter opinion. */
export { PHASES };
export const PROJECTION_VERSION = 13;

/* Rank-map version, stamped beside it. `snapshotStateOf().ranks` feeds movement
   comparison, and its meaning changed in the same commit as PROJECTION_VERSION v2:
   ties now share a rank, and rows below MIN_RANK_N carry no rank at all (so they are
   absent from the map rather than present with a misleading number).
   v3 — 2026-08-04: the Dummy Dome composite recomputed against a reference field that
   excludes sub-MIN_RANK_N cuts (see dummyDomeScores), so every dummy score/rank moved
   definitionally at once. Metric ranks themselves are unchanged, but the marker covers
   the ranks+dummy section as one unit — one boundary refresh loses metric-rank arrows
   too, the documented degrade-don't-reject cost.

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
export const RANK_VERSION = 3;

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
   snapshot on disk is rankVersion 2, so baseline selection survives the boundary.

   v3 — 2026-08-09: the frozen lane. The doctrine above enumerated only "a live source
   arriving, leaving, or being retyped", which predates `seasonVerified` (the field landed
   2026-08-04) — so a SEASON flip silently recomposed the mean with no registry edit at all.
   It happened the night Wowhead moved to Season 2: 0 of 80 letters changed at any outlet,
   yet 16 consensus cells moved and published as spec movement, the largest such night on
   record (33-night median 2, p90 9). Restoring Wowhead's final Season-1 letters through the
   frozen lane recomposes it a second time, back to exactly the pre-flip state. Both
   recompositions are registry decisions, not movement, so the boundary lands here.
   Read the rule as: bump when the set of sources the mean AVERAGES changes for any reason —
   a source arriving, leaving, being retyped, crossing a season, or entering the frozen lane.
   Measured on landing: 0 consensus arrows published, while 64 metric rankDeltas and 4 dummy
   rankDeltas survive — degrade-don't-reject working as documented.

   v4 — 2026-08-14: the icyveins SCALE re-spacing. This one is NOT a composition change, so
   read it as widening the rule above rather than fitting inside it: the trigger is a
   registry decision that re-scores the mean for every spec at once, and changing WHICH
   SOURCES compose it is only the commonest way that happens. Icy Veins' live M+ lists were
   rebuilt for Season 2 and publish S+ and B+, so the five-band icyveins scale grew to the
   same seven bands as icyveins-ptr; S moved from the 100 anchor to 92. Because the
   consensus still reads Icy Veins' Season-1 letters through the frozen lane, re-anchoring S
   re-scores those frozen letters — 13 consensus scores and 3 M+ letters move (Unholy DK,
   Devourer DH, Augmentation Evoker, all S -> A+) with no source having re-rated anything.
   Without this boundary the strip would publish three arrows nobody caused, which is the
   exact failure the marker exists to prevent.
   NOTE FOR THE 08-18 FLIP: the runbook's step 2 folds this same bump into the flip commit
   ("3 -> 4, it covers the scale re-spacing for free"). That bump is now SPENT. The flip
   recomposes the mean a second time — outlets leave the frozen lane and re-enter the live
   consensus as s2 — which is a genuine composition change and needs its own boundary, so
   the flip commit must bump 4 -> 5, not 3 -> 4. */
export const CONSENSUS_VERSION = 4;
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

   FLIP ON 2026-08-18, NOT AT PATCH LAUNCH (owner decision, 2026-08-08). The two dates are
   different events and the repo previously carried both readings — docs/s2-transition-scope.md
   said "launch day", the ptr-watch log said flip ~Aug 18. Settled on S2 open, for two reasons.
   (a) SETTLE_DAYS is [14, 28] from the flip: flip on 08-11 and the +14 grade lands on S2 day 7,
   squarely inside the week-one tier-list churn those windows exist to avoid; flip on 08-18 and
   it lands 09-01, on a settled season. (b) `sourceSeasonOk` keys on what a page says about the
   SEASON, and Season 1 is still live until 08-18 — flipping liveSeason to "s2" while the outlets
   are honestly still describing S1 blanks the consensus for no gain. The FREEZE is the separate
   one-shot and still belongs before 12.1 lands (08-10, after the nightly publishes): freeze what
   we predicted while it is still a prediction, flip when the season it predicts actually starts.

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

// Derived from the phase marker so the 12.2 cycle re-points these by config.
/* THE PTR METRIC-NAME CONTRACT, in one place (2026-08-08).
   These strings are LOOKUP KEYS: they must match data/specs.json byte for byte, or the series
   silently resolves to nothing — no error, no empty state, just a row that never appears. The
   template used to hand-type its own second copy of all eight (the Ladder series pickers), so
   the contract lived in two files that no test compared. Renaming a metric, or flipping
   PHASES.ptr at 12.1 launch, would have updated one and quietly broken the other.
   Now derived once from PHASES.ptr.marker and shipped in the payload as meta.ptrMetricNames,
   which is what the template reads. Null when there is no PTR phase — the callers already
   treat an absent series as "no such measurement", which is the honest rendering. */
export const PTR_METRIC_NAMES = PHASES.ptr ? (m => ({
  mplusTesting: {
    DPS: `Median rDPS (${m} M+ testing)`,
    Tank: `Median rDPS (${m} M+ testing, tank)`,
    Healer: `Median HPS (${m} M+ testing)`
  },
  raidTestingScore: {
    DPS: `${m} raid testing score (normalized)`,
    Tank: `${m} raid testing score (normalized)`,
    Healer: `${m} raid testing score (normalized)`
  },
  robydoby: {
    DPS: `99th pct DPS (${m} Mythic raid testing, Robydoby)`,
    Tank: null,
    Healer: `99th pct HPS (${m} Mythic raid testing, Robydoby)`
  },
  venomousAbyssPool: { DPS: `Median raw DPS (${m} Venomous Abyss, pooled)`, Tank: null, Healer: null },
  dummy1T: { DPS: `Median raw DPS (${m} Dummy Dome, 1T)`, Tank: null, Healer: null },
  dummy5T: { DPS: `Median raw DPS (${m} Dummy Dome, 5T)`, Tank: null, Healer: null },
  mplusKeysPool: { DPS: `Median raw DPS (${m} M+ keys, pooled)`, Tank: null, Healer: null }
}))(PHASES.ptr.marker) : null;

const PTR_MPLUS_SERIES = PTR_METRIC_NAMES?.mplusTesting ?? {};
function rankPct(spec, bracket, name) {
  const m = (spec.metrics ?? []).find(x => x.bracket === bracket && x.name === name);
  if (!m || m.rank == null || !m.of || m.of < 2) return null;
  return (1 - (m.rank - 1) / (m.of - 1)) * 100;
}
/* The PUBLISHER behind a source id: "icyveins-ptr" and "icyveins" are one outlet with two
   products. Used to stop a single publisher casting several votes in one averaged term. */
export const publisherOf = sourceId => String(sourceId).replace(/-(ptr|s\d+)$/, "");

/* External NEXT-PATCH tier-list opinion for one spec+bracket, on the shared 0–100 axis.
   Returns null when nothing rates it — including the upstream "TBD" case, which is stored
   as an explicit null rating and must stay ABSENT from the formula rather than scoring 0:
   "not yet placed" is missing evidence, not a bottom-tier verdict.

   Averaged BY PUBLISHER, not by source id (2026-08-09). The set is currently one outlet
   per bracket, so this is a no-op today — but the moment Icy Veins' own live pages verify
   the next season the M+ set becomes [icyveins, icyveins-ptr, wowhead], and a naive mean
   would hand Icy Veins two of three votes while it disagrees with itself by four bands. */
export function ptrTierRead(spec, bracket, sources, scales) {
  const byPublisher = new Map();
  for (const source of nextPatchTierSources(sources, bracket)) {
    const tier = spec.ratings?.[bracket]?.[source.id] ?? null;
    const score = scoreFor(scales, source.scale, tier);
    if (score === null) continue;
    const pub = publisherOf(source.id);
    if (!byPublisher.has(pub)) byPublisher.set(pub, []);
    byPublisher.get(pub).push({ label: source.name, tier, score });
  }
  if (!byPublisher.size) return null;
  const publishers = [...byPublisher.entries()].map(([pub, rows]) => ({
    publisher: pub,
    label: rows.length === 1 ? rows[0].label : `${rows[0].label} (${rows.length} lists)`,
    tiers: rows.map(r => r.tier).join("/"),
    score: rows.reduce((s, r) => s + r.score, 0) / rows.length
  }));
  return {
    score: publishers.reduce((s, p) => s + p.score, 0) / publishers.length,
    count: publishers.length,
    publishers: publishers.map(p => p.publisher),
    tiers: publishers.map(p => p.tiers).join("/"),
    detail: publishers.map(p => `${p.label} ${p.tiers}`).join(" · "),
    label: publishers.length === 1 ? publishers[0].label : `${publishers.length} next-patch lists`
  };
}
export function projectionFor(spec, bracket, scales, metaNotes = [], sources = [], takes = [], empiricalAnchor = null) {
  const prior = spec.consensus?.[bracket]?.score ?? null;
  /* RAID EMPIRICAL COVERAGE (v10, 2026-08-07). The zone-54 series was the only raid
     empirical input and it reaches the projection for NOBODY: MIN_RANK_N is 10 and every
     one of its 34 rows has n between 1 and 9 (ten specs sit at n=3), so metricRanks
     strips rank/of from all of them and rankPct returns null. The floor is right — 3 logs
     is not a ranking — but the consequence was silent and severe: with no PTR raid tier
     list (icyveins-ptr is M+ only, by design) and Dummy Dome being DPS-only, EVERY healer
     and tank raid forecast renormalized to 100% of the 12.0.7 prior, i.e. last patch's
     letter with an outlook nudge. That is what creators kept disagreeing with.
     The obvious candidate to fill it was Robydoby's 12.1 PTR raid-testing cut — already
     in the metrics layer, already ranked, covering 26 DPS and all 7 healers. It was tried
     and REJECTED on measurement, 2026-08-07; do not re-add it without new evidence:
       · it correlates NEGATIVELY with Dummy Dome, the other PTR raid empirical, at
         r = −0.43 across the 12 DPS specs holding both. Two measurements of the same
         question pointing opposite ways means at least one is noise, and we cannot tell
         which. Per-spec gaps reached 67 percentile points (Shadow Priest 80 vs 13);
       · every one of its 33 rows carries NO sample size, which is the only reason it
         clears MIN_RANK_N at all — it evades the floor by omission, not by being
         well-sampled;
       · admitting it at the .45 empirical weight moved 21 raid forecasts, including
         40-point swings (Mistweaver A+→B, Demonology A+→B).
     So raid empirical coverage stays as it is: Dummy Dome for DPS, nothing for healers
     and tanks. That gap is real and is now stated honestly by the confidence tag below
     rather than papered over with a signal we cannot vouch for. */
  /* UNITS (v12, 2026-08-08). rankPct returns a within-(role,bracket) percentile — a uniform
     grid whose mean is EXACTLY 50 by construction (verified: DPS/Tank/Healer all 50.00). It
     transports ORDER and carries no LEVEL. But it is then averaged against two quantities that
     live on the letter axis: the 12.0.7 consensus (M+ mean 59.9) and the PTR tier list (70.9).
     At .45 of the base weight — ~41% effective — that mean-50 grid drags every M+ cell toward
     50 for a reason that is arithmetic, not an opinion about any spec: it accounted for -8.9
     of the measured -10.5 gap against the external 12.1 read.
     The fix is a LOCATION shift only — recentre the percentile on the axis it is blended
     against. Spread and ordering are untouched (out-of-sample Spearman 0.552 → 0.541, noise),
     so this is not a re-weighting and does not lift the frozen-weights rule; it corrects the
     units of an existing term. Deliberately NOT a full z-remap: matching the prior's sd too
     looked better in-sample but the gain was circular and it crushed sd 18.5 → 12.3, pushing
     against the M+ extreme-compression question that docs/projection-audit-2026-08.md:350-360
     reserves for the post-launch grade. The mean-50 property is a provable bug; the spread
     is not provably wrong.
     `empiricalAnchor` is a property of the DATASET (where its letter axis sits), supplied by
     projections() from the live consensus. A caller with no dataset — a unit test on a
     synthetic spec — has no meaningful axis, so the identity anchor (no shift) is correct
     there and is the default. */
  const rawTesting = bracket === "raid"
    ? rankPct(spec, "raid", "12.1 PTR raid testing score (normalized)")
    : rankPct(spec, "mplus", PTR_MPLUS_SERIES[spec.role]);
  const testing = rawTesting == null || empiricalAnchor == null
    ? rawTesting
    : rawTesting - 50 + empiricalAnchor;
  const dummy = spec.ptrDummy?.score ?? null; // DPS-only composite, already 0–100
  const empParts = [[testing, 2], [dummy, 1]].filter(([v]) => v != null);
  const emp = empParts.length
    ? empParts.reduce((s, [v, w]) => s + v * w, 0) / empParts.reduce((s, [, w]) => s + w, 0)
    : null;
  const ptrList = ptrTierRead(spec, bracket, sources, scales);
  /* No measured PTR term and no PTR tier list ⇒ renormalization hands the 12.0.7 prior
     100% of the base weight, so the forecast IS last patch's letter. Used twice below:
     it raises the expert ceiling (they are then the only 12.1-aware evidence available)
     and it forces the honest "prior-only" confidence tag. */
  const noPtrEvidence = emp == null && !ptrList;
  /* (v9, owner reweight 2026-08-04) prior .55→.35, PTR list .25→.30. The prior is the
     12.0.7 consensus — evidence about a meta that dies at launch — and Riley's call was
     that measured PTR performance and the qualitative 12.1 reads should lead wherever
     they exist. Renormalization is what makes the cut safe: a cell with NO PTR evidence
     still reads 100% prior, so thin-evidence specs are untouched and the reweight moves
     exactly the cells that have something better to say. */
  const baseParts = [[prior, 0.35], [emp, 0.45], [ptrList?.score ?? null, 0.30]].filter(([v]) => v != null);
  if (!baseParts.length) return null; // nothing to project from — honest "—"
  const base = baseParts.reduce((s, [v, w]) => s + v * w, 0) / baseParts.reduce((s, [, w]) => s + w, 0);
  const totalW = baseParts.reduce((s, [, w]) => s + w, 0);
  /* PUBLISHER CONCENTRATION (rewritten 2026-08-09). This used to look for a PTR source
     whose id EXTENDED a live source's id, which could only ever catch the icyveins /
     icyveins-ptr pair. Two things broke it at once: Wowhead now feeds the next-patch term
     under its own id, so the prefix test cannot see it against itself; and the frozen lane
     means a contributor to the prior may not appear in a registry filter at all.
     Both are fixed by deriving from what the consensus ACTUALLY averaged — perSource is
     the ground truth for the prior slice, frozen contributors included — rather than
     re-deriving eligibility from the registry. Measured: the registry form reports Wowhead
     at 46% of a healer raid cell where the truth is 59.6%, and states 35% for Icy Veins on
     all 40 M+ cells where the truth is 22%. */
  const consensusIds = (spec.consensus?.[bracket]?.perSource ?? []).map(p => p.source);
  const ratedLive = consensusIds.length;
  const shares = new Map();
  const add = (pub, pct) => shares.set(pub, (shares.get(pub) ?? 0) + pct);
  if (prior != null && ratedLive) {
    const each = (0.35 / totalW) / ratedLive;
    for (const id of consensusIds) add(publisherOf(id), each);
  }
  if (ptrList) {
    const each = (0.30 / totalW) / ptrList.count;
    for (const pub of ptrList.publishers) add(pub, each);
  }
  /* Publisher id -> the outlet name a reader recognises. Prefer the LIVE-era source's name
     ("Icy Veins" over "Icy Veins (12.1 PTR)") so the basis names the outlet, not a product. */
  const publisherName = pub => {
    const owned = (sources ?? []).filter(x => x.kind === "tier-list" && publisherOf(x.id) === pub);
    return (owned.find(isLiveEra) ?? owned[0])?.name ?? pub;
  };
  const publisherShares = [...shares.entries()]
    .map(([publisher, share]) => ({ publisher, name: publisherName(publisher), pct: Math.round(share * 1000) / 10 }))
    .sort((a, b) => b.pct - a.pct);
  const topPublisher = publisherShares[0] ?? null;
  const sharedPublisherPct = topPublisher ? Math.round(topPublisher.pct) : null;
  const outlook = spec.outlook ?? null;
  const verdict = spec.ptr?.verdict ?? null;
  /* (v8) The expert read is BRACKET-SCOPED here (2026-08-04 external audit): the outlook
     ARROW stays a whole-spec read (outlookFor, unscoped — one arrow per spec is the
     display contract), but the projection is a per-bracket forecast, and pooling every
     take into both brackets let three M+-tier-list nerf reads move Mistweaver's RAID
     score. The per-bracket ladder below mirrors outlookFor's — verdict > expert > tally —
     re-derived with the scoped panel, so a spec whose takes are all M+-scoped can be
     expert-driven in one bracket and tally-driven in the other. */
  const expert = outlook ? expertRead(spec, takes, bracket) : null;
  const expertDrives = !verdict && expert != null && Math.abs(expert.shrunk) >= EXPERT_MIN;
  const bal = (outlook?.buffs ?? 0) - (outlook?.nerfs ?? 0);
  let dir = null;
  if (verdict) dir = outlook?.direction ?? null; // the verdict won the ladder; same both brackets
  else if (expertDrives) dir = expert.shrunk > 0 ? "up" : "down";
  // The whole-spec arrow is only re-derived when it came from the lane being re-scoped:
  // an expert-driven arrow whose scoped panel is too weak for THIS bracket falls back to
  // the tally, exactly as outlookFor's ladder would have without the panel.
  else if (outlook && outlook.source !== "expert") dir = outlook.direction;
  else if (outlook) dir = bal > 0 ? "up" : bal < 0 ? "down"
    : (outlook.buffs || outlook.nerfs || outlook.builds) ? "flat" : null;
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
  const datedVerdict = !!verdict && !!spec.ptr?.asOf;
  const shiftDir = datedVerdict || !verdict ? dir : null; // undated verdict → no shift
  /* (v7) When the expert panel set the direction, it also sets the magnitude — scaled by
     the same corroboration-shrunk strength, so one take moves less than five agreeing
     ones. The ceiling is deliberately below a dated verdict's flat 7: a realistic maximum
     panel (8 unanimous creators → shrunk .80) reaches 6, so no amount of take volume ever
     outranks a theorycrafter who sat down and wrote the spec up. */
  /* (v9) Headroom raised across the ladder — owner reweight: the tuning math and the
     qualitative reads were capped at half a band (±7 since v1) while the stale prior
     kept majority weight. A dated verdict now earns 10, the tally scales 4/7/10 by
     line balance, and an expert-driven direction reaches at most 9 — the "no amount of
     take volume outranks a written verdict" invariant holds at the new ceiling. */
  const mag = datedVerdict ? 10
    : expertDrives ? Math.min(9, Math.round(2 + 7 * Math.abs(expert.shrunk)))
    : Math.min(10, 4 + 3 * Math.max(0, Math.abs(bal) - 1));
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
  /* The count must describe the AGREEING set, not the lane (2026-08-03, external audit).
     Mixed and neutral reads are filtered out before the unanimity test — correctly, an
     abstention is not a vote — but the displayed count was taken from the unfiltered map,
     so two positives plus one Mixed fired the nudge and announced "3 creators agree" when
     only two did. Dormant today (all 125 metaNotes come from one creator) and therefore
     exactly the kind of defect that would have gone live silently the day a second general
     creator was registered. */
  const newestPerCreator = new Map();
  for (const n of notes) if (!newestPerCreator.has(n.creator)) newestPerCreator.set(n.creator, n);
  const votes = [...newestPerCreator.values()]
    .map(n => ({ n, d: n.sentiment === "positive" ? 1 : n.sentiment === "negative" ? -1 : 0 }))
    .filter(v => v.d);
  const corroborated = votes.length >= 2 && votes.every(v => v.d === votes[0].d);
  const nudge = corroborated ? votes[0].d * 3 : 0;
  const note = corroborated ? notes[0] : null;
  const nudgeCreators = corroborated ? votes.length : 0;

  /* Expert ADJUSTMENT (v7; recalibrated v9). The expert read either decides the outlook
     or adjusts the score — never both, which is what keeps it from being counted twice.
     It decided above only when no writeup exists; here it applies in the other case, so
     a spec WITH a writeup still has its specialists heard rather than ignored ("include
     them in our calculations", Riley 2026-08-02). ±6 at the cap since v9 (was ±4),
     realistically ±2 to ±5 once shrinkage is applied.

     (v10, 2026-08-07) The ceiling DOUBLES to ±12 when the cell has no PTR empirical term
     and no PTR list. ±6 was calibrated for a blend where measured PTR evidence leads;
     applied to a cell that is 100% the 12.0.7 prior it guaranteed the forecast stayed
     within a couple of points of last patch no matter how loudly specialists disagreed —
     measured: where the adjustment fired at all it averaged 1.7–3.0 points against band
     widths of ~15, so one creator moved a forecast 2 points and three unanimous ones
     moved it 4. That is why creators kept reading as out of step with us on healers and
     tanks specifically: those are the cells with nothing else in the blend.
     This does NOT loosen the band discipline — adjFloor/adjCeil below still clamp a
     non-quorum panel inside its own band and let a ≥EXPERT_QUORUM panel cross exactly one
     edge. The bigger cap only lets the term REACH those bounds instead of dying short of
     them; shrinkage still means a lone creator asks for ±4, not ±12. */
  const expertCap = noPtrEvidence ? 12 : 6;
  const expertAdj = !expertDrives && expert ? Math.round(expertCap * expert.shrunk) : 0;
  /* Band application, v9. The evidence terms (base + shift) pick the EVIDENCE band;
     the qualitative terms then apply in sequence, each with its own bound:

     · The expert adjustment is within-tier UNLESS the panel has QUORUM — at least
       EXPERT_QUORUM distinct creators, corroboration-shrunk — in which case it may
       cross ONE band edge ("several specialists agreeing can move a letter; one voice
       still can't", owner decision 2026-08-04). This deliberately loosens the v6/v7
       "sentiment never moves a published letter" bound in exactly one place: the v6
       objection was single-source authority, and a ≥3-creator shrunk panel is the
       opposite of a single source. One edge, never two — the panel refines the
       evidence's letter, it does not overrule the whole scale.
     · The meta nudge stays strictly within the RESULTING band (its lane still has one
       contributor; the v6 bound is untouched).

     Sequential application (expert first, then nudge inside the final band) is what
     makes "only the expert term may cross" enforceable rather than apportioned. */
  const evidenceScore = Math.round(Math.min(100, Math.max(0, base + shift)));
  const bands = scales.consensus.bands;
  const band = bands.find(b => evidenceScore >= b.min);
  const bandIdx = bands.indexOf(band);
  /* (v11, 2026-08-07 — Riley's call, made against a stated objection.) The quorum
     requirement is REMOVED for healers and tanks: any non-zero expert adjustment may
     cross a band edge for those roles, with no creator minimum. DPS keeps EXPERT_QUORUM.

     Why the exception is scoped this way: healer and tank raid cells are the ones with no
     PTR empirical term and no PTR list, so specialists are the only 12.1-aware evidence
     we hold for them, and the quorum bound meant that evidence could never reach the
     published letter. Measured at the time: all six tanks together held 8 takes with
     ZERO raid-scoped, no tank raid cell had more than 1 creator, and healers ran 2–5.
     So a threshold of 2 would have been inert for tanks and only 1 changes anything.

     What this knowingly gives up: the v6 bound against single-source authority. A lone
     creator can now move a published healer or tank letter, and for tanks that creator
     is often the only take on file for the spec. Shrinkage still applies (1 creator
     ⇒ ×0.33, so ±4 of the ±12 ceiling) and the one-edge clamp still holds, so the
     failure mode is a letter that is one band off on one person's read — not a runaway.
     Revisit when take coverage improves; a 2026-08-07 sweep of all 14 transcribable
     tank/healer creators found no raid-scoped 12.1 content to distil, so the coverage
     fix could not be done first. */
  const quorumNeeded = (spec.role === "Healer" || spec.role === "Tank") ? 1 : EXPERT_QUORUM;
  const expertQuorum = expertAdj !== 0 && expert.creators >= quorumNeeded;
  const adjFloor = expertQuorum ? (bands[bandIdx + 1]?.min ?? band.min) : band.min;
  const adjCeil = expertQuorum
    ? (bandIdx <= 1 ? 100 : bands[bandIdx - 2].min - 1)
    : (bandIdx <= 0 ? 100 : bands[bandIdx - 1].min - 1);
  const afterExpert = expertAdj
    ? Math.min(adjCeil, Math.max(adjFloor, evidenceScore + expertAdj))
    : evidenceScore;
  const tierBand = bands.find(b => afterExpert >= b.min) ?? band;
  const tierIdx = bands.indexOf(tierBand);
  const tierCeil = tierIdx <= 0 ? 100 : bands[tierIdx - 1].min - 1;
  const score = nudge
    ? Math.min(tierCeil, Math.max(tierBand.min, Math.round(afterExpert + nudge)))
    : afterExpert;
  /* The bounded terms are printed at their REQUESTED size, but a band edge can eat part
     or all of them — and 5 of 80 cells once silently advertised a number the score never
     received (3 of them printed "+1" and applied 0). The disclosure states the applied
     total and lets the per-term numbers stand as what was asked for; apportioning a
     partial clamp between two terms would be arbitrary. A quorum crossing is disclosed
     by name — a letter that moved on takes must say so. */
  const within = nudge + expertAdj;
  const appliedWithin = score - evidenceScore;
  const clampNote = within && appliedWithin !== within
    ? ` · bounded terms capped at ${appliedWithin > 0 ? "+" : ""}${appliedWithin} by the ${tierBand ? tierBand.tier : "tier"} edge`
    : "";
  const quorumNote = tierBand !== band
    ? ` · expert quorum (${expert.creators} creators) moved the letter ${band.tier}→${tierBand.tier}`
    : "";
  /* The outlook counts as evidence only when it was ELIGIBLE to act (2026-08-03, external
     audit). An undated verdict is refused a shift by the v5 rule above, yet was still
     tallied as a present signal — the model declining to trust a read while simultaneously
     citing it as evidence of being well-evidenced. Using shiftDir keeps a DATED "flat"
     verdict as evidence (a real read that happens to point nowhere) and drops only the
     ones the model itself rejected. 38 of 80 cells fall one confidence band.

     The EXPERT lane is its own signal type (v8, 2026-08-04 external audit). v7 let the
     expert adjustment move the score while omitting it from this tally, so 5 cells
     published "prior-only" — defined as "the live consensus, no PTR evidence" — with a
     score that differed from the prior (Mistweaver raid among them). A signal that moves
     the number is evidence and must say so. When the expert panel DRIVES the direction
     the outlook slot stays empty (!expertDrives) — the same evidence must not count
     twice under two names; a verdict-driven cell with a panel present counts both,
     because those are two different sources actually consulted. */
  const outlookSignal = shiftDir != null && !expertDrives;
  const signals = (testing != null ? 1 : 0) + (dummy != null ? 1 : 0) + (outlookSignal ? 1 : 0)
    + (ptrList ? 1 : 0) + (expert != null ? 1 : 0);
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
     healer and tank to medium. The denominators grew by one at v8 (the specialist-take
     lane became a counted signal type), so confidence tags are one series with v8
     snapshots onward, not with v7's — which the PROJECTION_VERSION boundary already
     enforces for the whole projection object. */
  const ptrListPossible = nextPatchTierSources(sources, bracket).some(s =>
    (s.pages ?? []).some(p => p.bracket === bracket && (p.role === spec.role || p.role === "All" || p.role == null)));
  const available = 3 // PTR testing + tuning outlook + specialist takes: obtainable everywhere
    + (spec.role === "DPS" ? 1 : 0) // Dummy Dome: DPS-only
    + (ptrListPossible ? 1 : 0);    // a next-patch tier list covering this bracket+role
  /* (v10, 2026-08-07) A cell with NO measured PTR term and no PTR tier list is the 12.0.7
     consensus with a nudge, whatever the ratio says — the score IS the prior, because
     renormalization hands it 100% of the weight once the other two terms are absent.
     Before this, four healer and two tank raid cells published "medium" on exactly that:
     outlook + takes scored 2 of 3 obtainable, and the badge read "reasonably evidenced"
     over a forecast carrying no 12.1 measurement at all. The ratio is still right about
     what was CONSULTED; it was wrong about what the number rests on.

     It caps at "low", NOT at "prior-only", and that distinction is load-bearing: the v8
     audit established that a signal which MOVES the number is evidence and must say so,
     so a cell the expert lane shifted must not claim nothing touched it. "prior-only"
     therefore keeps its original meaning — no signal of any kind — while "low" carries
     the new one: signals were consulted, but none of them measured 12.1. */
  const confidence = signals === 0 ? "prior-only"
    : noPtrEvidence ? "low"
    : signals >= available ? "high"
    : signals > available / 2 ? "medium"
    : "low";
  return {
    tier: tierBand ? tierBand.tier : null, score, confidence,
    /* `parts` is the basis string AS DATA (2026-08-03, external audit — the freeze
       artifact). Every number a post-launch audit needs was previously recoverable only
       by parsing prose, which is how the ±7 misreport survived two versions unnoticed.
       requested vs applied are both stated because the band clamp can eat within-tier
       terms; eligibility flags record what the model REFUSED, not just what it used. */
    parts: {
      prior: prior != null ? Math.round(prior) : null,
      testing: testing != null ? Math.round(testing) : null,
      dummy: dummy != null ? Math.round(dummy) : null,
      ptrList: ptrList ? Math.round(ptrList.score) : null,
      /* Provenance of the two letter-opinion terms, recorded so a post-launch auditor can
         reconstruct how much of this forecast came from an outlet that later helped
         compose the answer key. snapshot.mjs copies `parts` wholesale into the immutable
         frozen artifact, and basis strings are prose — this is the machine-readable half.
         Without it, forecast/answer-key overlap is unrecoverable after settlement. */
      ptrListCount: ptrList ? ptrList.count : null,
      ptrListPublishers: ptrList ? ptrList.publishers : null,
      consensusSources: consensusIds.length ? consensusIds : null,
      topPublisher: topPublisher ? topPublisher.publisher : null,
      topPublisherPct: topPublisher ? topPublisher.pct : null,
      publisherShares: publisherShares.length ? publisherShares : null,
      shift, shiftEligible: shiftDir != null,
      expertShrunk: expert ? expert.shrunk : null,
      expertCreators: expert ? expert.creators : null,
      expertAdjRequested: expertAdj, nudgeRequested: nudge,
      expertQuorum, evidenceTier: band ? band.tier : null,
      withinApplied: appliedWithin, evidenceScore,
      signals, obtainable: available
    },
    basis: `live baseline ${prior != null ? Math.round(prior) : "—"}`
      /* NOT labelled "pct" any more (2026-08-14). Since v12 this term is the within-role
         percentile RECENTRED onto the bracket's live consensus mean, so it no longer lives
         on a 0-100 percentile axis — it lives on the letter axis, like `live baseline` and
         `Dummy Dome` beside it. Calling it a percentile published five M+ cells reading
         "testing pct 110 / 106 / 102", which is self-evidently not a percentile. The number
         and the model are unchanged (the SCORE is clamped downstream; only this disclosure
         label moves), and basis strings are prose that snapshots deliberately do not store,
         so nothing versioned is affected. */
      + (testing != null ? ` · PTR ${bracket === "raid" ? "raid-testing" : "M+ testing"} ${Math.round(testing)}` : "")
      + (dummy != null ? ` · Dummy Dome ${Math.round(dummy)}` : "")
      /* Publisher concentration, disclosed (2026-08-03, external audit; rewritten
         2026-08-09). The original clause only fired when a PTR list's id extended a live
         list's id, so it spoke on 40 of 80 cells and said nothing on raid. Two changes made
         that untenable: Wowhead now feeds the next-patch term under its own id (invisible
         to a prefix test against itself) and, with the frozen lane, a prior contributor may
         not be in the live registry at all. Measured, the old clause was also wrong where
         it did speak — 35% claimed for Icy Veins on every M+ cell against a true 22%.
         So the share is now derived from what the consensus actually averaged and stated
         on EVERY cell. It matters here more than it did in August: with Wowhead admitted
         and its Season-1 letters frozen into the prior, one outlet reaches 59.6% of a
         healer raid forecast and up to 64% of a tank raid forecast. */
      + (ptrList ? ` · next-patch list${ptrList.count > 1 ? "s" : ""}: ${ptrList.detail} (${Math.round(ptrList.score)})` : "")
      + (topPublisher ? ` · biggest single input: ${topPublisher.name} ~${topPublisher.pct}% of this forecast` : "")
      // Report the shift ACTUALLY applied. This read "+7"/"−7" from v1 through v6, which
      // stopped being true at v5 when the magnitude began scaling with tally strength —
      // so a spec shifted +3 published a basis claiming +7. A transparency string that
      // states a number the model did not use is worse than no string (found 2026-08-03
      // while answering "how are we weighting each factor?").
      + (dir ? ` · outlook ${shift > 0 ? "+" : shift < 0 ? "−" : ""}${Math.abs(shift)}` +
          (expertDrives ? ` (expert panel: ${expert.creators} creator${expert.creators === 1 ? "" : "s"}, no writeup)` : "") : "")
      + (expertAdj ? ` · expert takes ${expertAdj > 0 ? "+" : "−"}${Math.abs(expertAdj)}` +
          ` (${expert.creators} creator${expert.creators === 1 ? "" : "s"}, ${expertQuorum ? "quorum — may move one band" : "within-tier only"})` : "")
      + (nudge ? ` · meta read ${nudge > 0 ? "+3" : "−3"} (${nudgeCreators} creators agree, within-tier only)` : "")
      + quorumNote
      + clampNote
  };
}
/* Where each bracket's letter axis actually sits, measured from the live consensus this
   build is working with. This is the anchor the mean-50 PTR percentile is recentred onto
   (see the UNITS note in projectionFor). Derived, never hand-written: it moves with the
   data, so no constant can go stale. Null when a bracket has no consensus at all — e.g.
   the S2 transition window before any outlet re-verifies — in which case the percentile
   is left unshifted rather than anchored to a number we do not have. */
export function empiricalAnchors(specs) {
  const out = {};
  for (const bracket of ["raid", "mplus"]) {
    const scores = specs.map(s => s.consensus?.[bracket]?.score).filter(v => v != null);
    out[bracket] = scores.length ? scores.reduce((a, c) => a + c, 0) / scores.length : null;
  }
  return out;
}

export function projections(specs, scales, creatorTakes, sources = []) {
  const metaNotes = creatorTakes?.metaNotes ?? [];
  const takes = creatorTakes?.takes ?? [];
  const anchors = empiricalAnchors(specs);
  for (const spec of specs) {
    const raid = projectionFor(spec, "raid", scales, metaNotes, sources, takes, anchors.raid);
    const mplus = projectionFor(spec, "mplus", scales, metaNotes, sources, takes, anchors.mplus);
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
    /* WHICH sources composed each mean (2026-08-09). CONSENSUS_VERSION is a hand-bumped
       integer and cannot track a rolling per-source season policy — from here to the phase
       flip the composition changes whenever an outlet flips, on its own schedule. Recording
       the set makes composition comparability DERIVABLE instead of asserted, which is what
       the forecast report card needs: without it, "Wowhead was 1 of 1 Season-2 lists in the
       answer key" is unrecoverable after settlement. Deliberately ignored by
       baselineDiffers/movementFor — movement semantics stay tier/rank-grained. */
    entry.consensusSources = {
      raid: (s.consensus?.raid?.perSource ?? []).map(p => p.source),
      mplus: (s.consensus?.mplus?.perSource ?? []).map(p => p.source)
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

/* The frozen archive's PROVENANCE, minus the letters — what the page needs to say
   "Wowhead: final Season 1 letters, 08 Aug" without carrying 320 tiers it already has. */
export function seasonFinalMeta(seasonFinal, liveSeason = PHASES.liveSeason) {
  const bySource = seasonFinal?.[liveSeason];
  if (!bySource || !Object.keys(bySource).length) return null;
  const sources = {};
  for (const [id, brackets] of Object.entries(bySource)) {
    sources[id] = Object.fromEntries(Object.entries(brackets ?? {}).map(([bracket, rec]) => [bracket, {
      frozenAt: rec?.frozenAt ?? null,
      fromCommit: rec?.fromCommit ?? null,
      lastSeasonVerifiedSnapshot: rec?.lastSeasonVerifiedSnapshot ?? null,
      publishedRange: rec?.publishedRange ?? null,
      letterCount: Object.keys(rec?.letters ?? {}).length
    }]));
  }
  return { season: liveSeason, sources };
}

/* THE FROZEN LANE FOR THE FORECAST COLUMN (DECISION 2, built 2026-08-12).
   `--frozen` declares the pre-launch forecast; the phase flip says 12.1 is live. Between
   the flip and the report card, the forecast column must keep showing the DECLARED
   forecast — the receipts the report card grades — not a recomputation off the settled
   Season-2 consensus, which by then is a forecast that already knows the answer
   (measured at the flip: 37 of 80 letters silently differ).

   Three-state lifecycle, all from existing signals — no new flag to forget:
   · pre-flip: artifact phase === SNAPSHOT_PHASE → inert, live machinery renders (which is
     why every pre-flip build and test is unaffected);
   · post-flip grading window: phases differ and no NEW PTR cycle exists → the artifact is
     the column, self-activating the moment the flip commit moves SNAPSHOT_PHASE;
   · next cycle opens (PHASES.ptr non-null again, e.g. 12.2): the artifact stands down —
     without this, the 12.2 `--frozen` would freeze the OLD artifact's cells instead of
     the live 12.2 projections, because snapshot.mjs reads payload projections.
   The overrides exist for tests (module constants cannot be moved from a test); callers
   never pass them. */
export function frozenForecastActive(artifact, { snapshotPhase = SNAPSHOT_PHASE, ptr = PHASES.ptr } = {}) {
  return artifact?.kind === "frozen-forecast" && artifact.phase !== snapshotPhase && !ptr;
}

/* Wholesale and honest substitution: a spec absent from the artifact renders no forecast
   rather than a freshly computed one, and each substituted cell's basis names the
   declaration so no surface can imply the number was computed today. projMovement is
   deleted, not recomputed — movement of a frozen record is a category error (and the flip
   commit's mandatory CONSENSUS_VERSION bump makes pickBaseline refuse cross-version
   comparison, so the strip reads "baseline established", not 21 phantom arrows). */
export function applyFrozenForecast(specs, artifact) {
  const stamp = p => p ? { ...p, frozen: true,
    basis: `Frozen pre-launch forecast, declared ${artifact.date} — ${p.basis ?? ""}` } : null;
  for (const spec of specs) {
    const cell = artifact.cells?.[`${spec.class}|${spec.spec}`] ?? null;
    spec.projection = cell ? { raid: stamp(cell.raid), mplus: stamp(cell.mplus) } : null;
    delete spec.projMovement;
  }
  return specs;
}

export function buildPayload({ specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers, historySnapshot, historySnapshots, seasonFinal = null, frozenForecast = null, now = null }) {
  const scored = dummyDomeScores(metricRanks(fightLabels(decorateSpecs(specs, sources, scales, seasonFinal))));
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

  const frozenActive = frozenForecastActive(frozenForecast);
  if (frozenActive) applyFrozenForecast(decorated, frozenForecast);
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
      /* WHICH LANES THE BASELINE CAN NARRATE (2026-08-15). "No arrows" has two completely
         different meanings and the client could not tell them apart: either nothing moved —
         honest stability, and the strip hiding is right — or a VERSION BOUNDARY makes the
         comparison meaningless, which is a thing to say out loud. The flip is exactly that
         case: its mandatory CONSENSUS_VERSION bump suppresses every consensus arrow, so the
         strip found all lanes empty and hid itself on the one day a reader most needs the
         explanation. Three places already promised the strip would read "Season 2 baseline
         established" (this file's applyFrozenForecast note, s2-transition-scope.md:95 and the
         flip runbook's step 2); nothing had ever built it, because nothing exposed this. */
      movementScope: baseline ? {
        consensus: consensusComparableWith(baseline),
        ranks: ranksComparableWith(baseline),
        projection: projComparableWith(baseline),
      } : null,
      phases: PHASES,
      /* Present ONLY while the frozen artifact is the forecast column's render source
         (post-flip, pre-sunset). The template keys every frozen-mode surface change on
         this — null means the live projection machinery is authoritative, which is every
         pre-flip build. */
      frozenForecast: frozenActive ? {
        date: frozenForecast.date, declaredPhase: frozenForecast.phase,
        projectionVersion: frozenForecast.projectionVersion ?? null,
        gitSha: frozenForecast.gitSha ?? null
      } : null,
      /* Frozen-lane provenance for the current live season, so the template never re-reads
         data/season-final.json (and so the letters themselves stay out of the payload —
         they are already in spec.consensus[].perSource). Null when nothing is frozen. */
      seasonFinal: seasonFinalMeta(seasonFinal),
      // The single source of truth for PTR series lookup keys — see PTR_METRIC_NAMES.
      // The template reads these instead of hand-typing a second copy that can drift.
      ptrMetricNames: PTR_METRIC_NAMES,
      projectionVersion: PROJECTION_VERSION,
      rankVersion: RANK_VERSION,
      consensusVersion: CONSENSUS_VERSION
    }
  };
}
