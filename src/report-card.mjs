/* Forecast report card: grade a frozen projection against a settled consensus.

   The projection is the tracker's own forecast, and until now nothing has ever checked
   whether it was RIGHT. Every other honesty mechanism in this repo constrains inputs
   (source typing, era gating, provenance); this one is the only outcome measure, and the
   2026-08-02 audit scope named its absence as the reason the model can be reasoned about
   for coherence but not accuracy.

   Two distinct uses, and conflating them would be the easy lie:

   · GRADE (the real thing, post-launch). Forecast = the last snapshot of the pre-launch
     phase; actual = the first settled Season-2 consensus. This measures accuracy.
   · DRIFT (available now). Forecast = an older snapshot; actual = today's consensus,
     which is still 12.0.7. A 12.1 forecast is not WRONG for disagreeing with the patch it
     was never predicting, so this is NOT accuracy — it measures how far the forecast sits
     from the live picture and, aggregated, whether the model leans optimistic. Every
     result carries `mode` so a drift number can never be read as a grade.

   Version handling: `projectionVersion` labels the formula that produced a forecast.
   Grading one frozen forecast against reality is valid at any version — but two forecasts
   from different versions are not one series, so a run refuses to aggregate across them
   and reports the version it graded. */

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRACKETS = ["raid", "mplus"];

/* Band index, best = 0. The consensus bands are the shared axis both a projection tier and
   a consensus tier are expressed in, so "how wrong" is a difference of positions, not of
   raw scores — a 3-point score miss that crosses a band edge matters more to a reader than
   a 12-point miss that does not. Score error is reported alongside, never instead. */
export function bandIndexer(scales) {
  const order = scales.consensus.bands.map(b => b.tier);
  return tier => {
    const i = order.indexOf(tier);
    return i === -1 ? null : i;
  };
}

/* Grade one forecast snapshot against one actual snapshot.
   Returns per-cell rows plus aggregates. `mode` is "grade" or "drift" — the caller states
   which, because only the caller knows whether `actual` is a settled Season-2 consensus. */
export function gradeSnapshot(forecast, actual, scales, { mode = "drift", specs = [] } = {}) {
  const idx = bandIndexer(scales);
  const roleOf = new Map(specs.map(s => [`${s.class}|${s.spec}`, s.role]));
  const rows = [];

  /* COVERAGE (2026-08-03, external audit). Skipping ungradeable cells is right, but
     reporting only the graded ones is not: a run that graded 1 of 80 cells and got it
     right returned "100% exact" with nothing saying the other 79 were dropped. Accuracy
     without a denominator is the single most misleading number this file could publish,
     and it is a ONE-SHOT measurement — there is no second Season-2 launch to re-run it
     against. Count what was obtainable and why each cell fell out. */
  let obtainable = 0, declined = 0, ungradeable = 0, rosterGap = 0;

  for (const [key, f] of Object.entries(forecast.specs ?? {})) {
    const a = actual.specs?.[key];
    if (!a) { rosterGap += BRACKETS.length; continue; } // absent one side — roster change, not a miss
    for (const bracket of BRACKETS) {
      const fTier = f.projection?.[bracket]?.tier ?? null;
      const aTier = a.consensus?.[bracket] ?? null;
      // A cell is OBTAINABLE when the outcome exists to grade against; whether we forecast
      // it is our choice, and declining is honest but must still show up in the denominator.
      if (aTier != null) obtainable++; else { ungradeable++; continue; }
      if (fTier == null) { declined++; continue; }
      const fi = idx(fTier), ai = idx(aTier);
      if (fi == null || ai == null) { ungradeable++; continue; }
      rows.push({
        spec: key.replace("|", " "), bracket,
        role: roleOf.get(key) ?? null,
        forecastTier: fTier, actualTier: aTier,
        // POSITIVE = the spec landed in a WORSE band than forecast, i.e. the model was
        // too optimistic about it. Negative = too pessimistic.
        bandsOff: ai - fi,
        forecastScore: f.projection?.[bracket]?.score ?? null,
        actualScore: a.scores?.[bracket] ?? null,
        confidence: f.projection?.[bracket]?.confidence ?? null
      });
    }
  }

  const agg = subset => {
    if (!subset.length) return null;
    const off = subset.map(r => r.bandsOff);
    const scored = subset.filter(r => r.forecastScore != null && r.actualScore != null);
    const scoreErr = scored.map(r => r.forecastScore - r.actualScore);
    const mean = xs => xs.reduce((s, x) => s + x, 0) / xs.length;
    return {
      n: subset.length,
      exact: off.filter(x => x === 0).length,
      withinOne: off.filter(x => Math.abs(x) <= 1).length,
      exactPct: Math.round(off.filter(x => x === 0).length / subset.length * 100),
      withinOnePct: Math.round(off.filter(x => Math.abs(x) <= 1).length / subset.length * 100),
      meanAbsBands: +(mean(off.map(Math.abs))).toFixed(2),
      // Signed, and the number the audit actually wants: a model that is right on average
      // but wrong in both directions is a different problem from one that leans.
      biasBands: +(mean(off)).toFixed(2),
      meanAbsScore: scored.length ? +(mean(scoreErr.map(Math.abs))).toFixed(1) : null,
      biasScore: scored.length ? +(mean(scoreErr)).toFixed(1) : null
    };
  };

  const by = (fn) => {
    const out = {};
    for (const r of rows) (out[fn(r)] ??= []).push(r);
    return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, agg(v)]));
  };

  const coverage = {
    graded: rows.length, obtainable,
    coveragePct: obtainable ? Math.round(rows.length / obtainable * 100) : 0,
    declined, ungradeable, rosterGap,
    // A grade covering less than most of the obtainable field is not a grade of the model,
    // it is a grade of a subset — say so in the object rather than in a comment.
    sufficient: obtainable > 0 && rows.length / obtainable >= 0.8
  };

  return {
    mode, coverage,
    forecastDate: forecast.date, actualDate: actual.date,
    forecastPhase: forecast.phase ?? null, actualPhase: actual.phase ?? null,
    projectionVersion: forecast.projectionVersion ?? 1,
    overall: agg(rows),
    byBracket: by(r => r.bracket),
    byConfidence: by(r => r.confidence ?? "none"),
    byRole: by(r => r.role ?? "unknown"),
    rows
  };
}

export async function loadSnapshots(root = ROOT) {
  const dir = path.join(root, "data", "history");
  const files = (await readdir(dir)).filter(f => f.endsWith(".json")).sort();
  return Promise.all(files.map(async f => JSON.parse(await readFile(path.join(dir, f), "utf8"))));
}

/* Pick the pair the REAL grading uses: the last pre-launch snapshot as the frozen
   forecast, and the first post-launch one as the settled outcome. Returns null when the
   boundary has not happened yet — which is the state today, and the reason the CLI
   falls back to drift mode instead of inventing a grade. */
/* Days after launch at which a Season-2 consensus is treated as SETTLED. Tier lists
   churn hard in week one; grading against day 0 grades the outlets' first guess, not the
   meta. Two checkpoints so a single noisy week cannot define the verdict. */
export const SETTLE_DAYS = [14, 28];
const addDays = (iso, n) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) + n * 86400000;
  return new Date(t).toISOString().slice(0, 10);
};

/* FROZEN and SETTLED are two different events and one phase flip cannot encode both
   (2026-08-03, external audit). Flip at launch and the first live snapshot is a
   week-one guess, not an outcome; flip after settlement and post-launch observations have
   already leaked into what we call the frozen forecast.

   So each side is chosen by its own explicit marker:
     forecast — the newest snapshot carrying `frozen: true`, falling back to the last
                pre-phase snapshot (with `frozenExplicit: false` recorded, so a reader
                knows the freeze point was inferred rather than declared);
     actual   — the first post-phase snapshot at least `settleDays` after launch.
   Returns { reason } instead of null when a pair cannot be formed, because "not yet" and
   "the marker was never set" are different problems and only one of them is fine. */
export function launchPair(snapshots, prePhase = "12.1-ptr", { settleDays = SETTLE_DAYS[0] } = {}) {
  const pre = snapshots.filter(s => (s.phase ?? prePhase) === prePhase);
  const post = snapshots.filter(s => (s.phase ?? prePhase) !== prePhase);
  if (!pre.length) return { reason: "no pre-launch snapshots" };
  if (!post.length) return { reason: "launch has not happened yet (no post-phase snapshot)" };
  const frozen = pre.filter(s => s.frozen === true);
  const forecast = frozen.length ? frozen.at(-1) : pre.at(-1);
  const launchDate = post[0].date;
  const settleBy = addDays(launchDate, settleDays);
  const actual = post.find(s => s.date >= settleBy);
  if (!actual) {
    return { reason: `season not settled yet — need a snapshot on or after ${settleBy} ` +
      `(launch ${launchDate} + ${settleDays}d); newest post-launch is ${post.at(-1).date}`,
      forecast, launchDate, settleBy };
  }
  return { forecast, actual, launchDate, settleBy, settleDays,
    frozenExplicit: frozen.length > 0 };
}

const fmt = a => a ? `${String(a.exactPct).padStart(3)}% exact · ${String(a.withinOnePct).padStart(3)}% within one band · MAE ${a.meanAbsBands} bands · bias ${a.biasBands > 0 ? "+" : ""}${a.biasBands}${a.biasScore != null ? ` (${a.biasScore > 0 ? "+" : ""}${a.biasScore} pts)` : ""} · n=${a.n}` : "—";

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const arg = k => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
  const snapshots = await loadSnapshots();
  const scales = JSON.parse(await readFile(path.join(ROOT, "data", "scales.json"), "utf8"));
  const specs = JSON.parse(await readFile(path.join(ROOT, "data", "specs.json"), "utf8"));

  const pair = launchPair(snapshots);
  const fDate = arg("--forecast"), aDate = arg("--settled");
  let forecast, actual, mode;
  if (fDate || aDate) {
    forecast = snapshots.find(s => s.date === fDate) ?? snapshots[0];
    actual = snapshots.find(s => s.date === aDate) ?? snapshots.at(-1);
    mode = (actual.phase ?? "12.1-ptr") !== "12.1-ptr" ? "grade" : "drift";
  } else if (pair.actual) {
    ({ forecast, actual } = pair); mode = "grade";
  } else {
    // launchPair now returns a REASON rather than a bare null, because "launch has not
    // happened" and "the season has not settled" call for different waiting.
    if (pair.reason) console.log(`\n(no grade yet: ${pair.reason})`);
    forecast = snapshots[0]; actual = snapshots.at(-1); mode = "drift";
  }

  const r = gradeSnapshot(forecast, actual, scales, { mode, specs });
  console.log(`\nForecast report card — mode: ${r.mode.toUpperCase()}`);
  if (r.mode === "drift") {
    console.log("  NOT an accuracy grade: the 'actual' side is still a 12.0.7 consensus, and a");
    console.log("  12.1 forecast is not wrong for disagreeing with the patch it never predicted.");
    console.log("  Read the bias line only — it says which way the model leans.");
  }
  console.log(`  forecast ${r.forecastDate} (phase ${r.forecastPhase}, projection v${r.projectionVersion}) → actual ${r.actualDate} (phase ${r.actualPhase})`);
  // Coverage before accuracy, always: a percentage without its denominator is the most
  // misleading thing this tool could print, and this is a one-shot measurement.
  const c = r.coverage;
  console.log(`  coverage   ${c.graded}/${c.obtainable} gradeable cells (${c.coveragePct}%)` +
    `${c.declined ? ` · ${c.declined} declined` : ""}${c.ungradeable ? ` · ${c.ungradeable} no outcome` : ""}` +
    `${c.rosterGap ? ` · ${c.rosterGap} roster gap` : ""}` +
    `${c.sufficient ? "" : "  ← PARTIAL: this grades a subset, not the model"}`);
  if (r.mode === "grade" && pair.frozenExplicit === false) {
    console.log("  NOTE: the freeze point was INFERRED (last pre-launch snapshot), not declared.");
    console.log("        Mark the frozen forecast explicitly next cycle — see launchPair.");
  }
  console.log("");
  console.log("  overall   ", fmt(r.overall));
  for (const [k, v] of Object.entries(r.byBracket)) console.log(`  ${k.padEnd(10)}`, fmt(v));
  console.log();
  for (const [k, v] of Object.entries(r.byConfidence)) console.log(`  conf ${k.padEnd(11)}`, fmt(v));
  console.log();
  for (const [k, v] of Object.entries(r.byRole)) console.log(`  ${k.padEnd(10)}`, fmt(v));
  const worst = [...r.rows].sort((a, b) => Math.abs(b.bandsOff) - Math.abs(a.bandsOff)).slice(0, 8);
  console.log("\n  largest misses:");
  for (const w of worst) console.log(`    ${w.spec} ${w.bracket}: forecast ${w.forecastTier} → actual ${w.actualTier} (${w.bandsOff > 0 ? "+" : ""}${w.bandsOff}, conf ${w.confidence})`);
  console.log();
}
