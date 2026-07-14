/* Refresh integrity gates (2026-07-14, from the external security audit).

   The nightly prompt alone proved not to be a completeness gate: the 2026-07-12 run
   quietly skipped SimC, Archon encounter/survivability pages, and left every WCL cut
   at 2026-07-09 — and still went green. These checks turn that drift into visible,
   machine-checked state:

   - data/required-sources.json  — the contract: every source the nightly must account
     for, with freshness thresholds, row-count floors, and anomaly limits.
   - data/run-manifest.json      — written by the refresh agent EVERY run: one row per
     required source with an honest result. Doubles as the public status file.

   Modes (CLI):
     node src/check-refresh.mjs --manifest [--now=YYYY-MM-DD]
         Nightly publish gate. Fails (exit 1) on: missing/duplicate manifest rows,
         unexplained skips, "success" claims the stored data dates contradict,
         row-count floor breaches, or mass tier movement without an explicit ack.
         Expected unavailability (unreachable/blocked/partial/parse_error WITH a
         reason) degrades the run but does not fail it.
     node src/check-refresh.mjs --age [--now=YYYY-MM-DD]
         Heartbeat. Fails when the last manifest run is older than maxRunAgeHours or
         any required source's stored data exceeds its maxAgeDays — regardless of
         whether the staleness was explained (an alert, not blame). */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData, validateData } from "./validate.mjs";
import { buildPayload, snapshotStateOf } from "./render.mjs";

export const RESULTS = new Set(["success", "partial", "unreachable", "blocked", "parse_error", "skipped"]);
// Results that mean "didn't fully land" — allowed with a reason, never silently.
const DEGRADED = new Set(["partial", "unreachable", "blocked", "parse_error", "skipped"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const dayMs = 86400000;
const utc = d => { const [y, m, dd] = d.split("-").map(Number); return Date.UTC(y, m - 1, dd); };
export const ageDays = (now, then) => (utc(now) - utc(then)) / dayMs;

/* --- probes: what the repo's committed state says about a source ------------------- */

const matchPages = (probe, sources) => (sources.find(s => s.id === probe.sourceId)?.pages ?? [])
  .filter(p => probe.bracket == null || p.bracket === probe.bracket)
  .filter(p => probe.labelIncludes == null || (p.label ?? "").includes(probe.labelIncludes))
  .filter(p => !probe.unlabeledOnly || p.label == null);

const matchMetrics = (probe, specs) => specs.flatMap(s => (s.metrics ?? [])
  .filter(m => m.source === probe.source && new RegExp(probe.namePattern).test(m.name ?? "")));

/* Oldest date for page probes (a lagging page IS the finding — see wowhead mplus/Tank,
   left at 07-09 by a run that refreshed the other five pages); newest for metric probes
   (rows legitimately persist from older fetches — the question is "did the pipeline
   land anything recently", not "is every row new"). */
export function probeDate(req, data) {
  const p = req.date;
  if (!p) return null;
  if (p.type === "pages") {
    const dates = matchPages(p, data.sources).map(x => x.snapshot).filter(Boolean).sort();
    return dates[0] ?? null;
  }
  if (p.type === "metrics") {
    const dates = matchMetrics(p, data.specs).map(m => m.asOf).filter(Boolean).sort();
    return dates.at(-1) ?? null;
  }
  if (p.type === "ptrDummy") {
    const dates = data.specs.map(s => s.ptrDummy?.asOf).filter(Boolean).sort();
    return dates.at(-1) ?? null;
  }
  if (p.type === "encounterTiers") return data.encounterTiers?.asOf ?? null;
  throw new Error(`unknown date probe type "${p.type}" (${req.key})`);
}

export function probeRows(req, data) {
  const p = req.rows;
  if (!p) return null;
  if (p.type === "ratings") {
    let n = 0;
    for (const s of data.specs) for (const br of Object.values(s.ratings ?? {}))
      if (br[p.sourceId] != null) n++;
    return n;
  }
  if (p.type === "metrics") return matchMetrics(p, data.specs).length;
  if (p.type === "fightProfiles") return data.specs.filter(s => s.fightProfile?.source === p.source).length;
  if (p.type === "ptrDummy") return data.specs.filter(s => s.ptrDummy != null).length;
  if (p.type === "survivability") return data.specs.filter(s => s.survivability != null).length;
  if (p.type === "encounterTiers") {
    return Object.keys(data.encounterTiers?.raid ?? {}).length + Object.keys(data.encounterTiers?.mplus ?? {}).length;
  }
  throw new Error(`unknown rows probe type "${p.type}" (${req.key})`);
}

/* --- the nightly publish gate ------------------------------------------------------ */

export function checkManifest(config, manifest, data, now) {
  const errors = [], degraded = [], notes = [];
  if (!manifest || typeof manifest !== "object") return { errors: ["run-manifest: missing or unreadable"], degraded, notes };
  if (!ISO_DATE.test(manifest.run ?? "")) errors.push(`run-manifest: run must be YYYY-MM-DD (got ${JSON.stringify(manifest.run)})`);
  else if (ageDays(now, manifest.run) > 1) errors.push(`run-manifest: run date ${manifest.run} is not this run (now ${now}) — the agent must write the manifest every run`);
  if (typeof manifest.summary !== "string" || !manifest.summary.trim()) errors.push("run-manifest: summary (one line, becomes the commit message) is required");
  else if (manifest.summary.length > 200) errors.push(`run-manifest: summary too long (${manifest.summary.length} > 200 chars)`);

  const rows = new Map();
  for (const row of manifest.sources ?? []) {
    if (rows.has(row.source)) errors.push(`run-manifest: duplicate row for "${row.source}"`);
    rows.set(row.source, row);
  }

  for (const req of config.requirements) {
    const row = rows.get(req.key);
    rows.delete(req.key);
    if (!row) { errors.push(`run-manifest: required source "${req.key}" has no row — every required source must be accounted for`); continue; }
    if (!RESULTS.has(row.result)) { errors.push(`run-manifest: "${req.key}" result "${row.result}" invalid (${[...RESULTS].join("|")})`); continue; }
    const detail = typeof row.detail === "string" && row.detail.trim() ? row.detail.trim() : null;
    if (DEGRADED.has(row.result)) {
      if (!detail) { errors.push(`run-manifest: "${req.key}" is ${row.result} with no detail — unexplained ${row.result} fails the run`); continue; }
      degraded.push(`${req.key}: ${row.result} — ${detail}`);
    }
    // Anti-drift teeth: a "success" claim must be visible in the stored data. This is
    // what makes the manifest more than prose — the agent can't mark a source fresh
    // while its snapshot/asOf dates stayed old.
    const date = probeDate(req, data);
    if (row.result === "success" && req.date && (date == null || ageDays(manifest.run ?? now, date) > 1)) {
      errors.push(`run-manifest: "${req.key}" claims success but stored data is dated ${date ?? "never"} (run ${manifest.run}) — mark it partial/unreachable with a reason instead`);
    }
    const rowCount = probeRows(req, data);
    if (req.rows?.min != null && rowCount != null && rowCount < req.rows.min) {
      errors.push(`data floor: "${req.key}" has ${rowCount} rows, below the ${req.rows.min} floor — catastrophic-shrink guard (raise the floor in required-sources.json only with a reviewed reason)`);
    }
  }
  for (const key of rows.keys()) notes.push(`run-manifest: row "${key}" matches no requirement (stale key after a config change?)`);
  return { errors, degraded, notes };
}

/* --- the heartbeat ----------------------------------------------------------------- */

export function checkFreshness(config, manifest, data, now) {
  const violations = [], report = [];
  // Proof of life = the newer of the manifest's run date and the newest history
  // snapshot: a LOCAL refresh (which snapshots per the hard rule but may predate
  // manifest habits) must not read as "the nightly stopped".
  const signals = [manifest?.run, data.historySnapshots?.[0]?.date].filter(d => d && ISO_DATE.test(d)).sort();
  const last = signals.at(-1) ?? null;
  if (!last) violations.push("no valid run-manifest run date or history snapshot — no refresh has ever completed under manifest enforcement");
  else {
    const hours = ageDays(now, last) * 24;
    report.push(`last refresh signal (manifest run or history snapshot): ${last} (${Math.round(hours)}h ago)`);
    if (hours > config.maxRunAgeHours) violations.push(`last refresh ${last} is ${Math.round(hours)}h old (max ${config.maxRunAgeHours}h) — the nightly is not completing`);
  }
  for (const req of config.requirements) {
    if (req.maxAgeDays == null || !req.date) continue;
    const date = probeDate(req, data);
    const age = date ? ageDays(now, date) : null;
    report.push(`${req.key}: ${date ?? "no dated state"}${age != null ? ` (${age}d, max ${req.maxAgeDays}d)` : ""}`);
    if (date == null) violations.push(`${req.key}: no dated state at all`);
    else if (age > req.maxAgeDays) violations.push(`${req.key} (${req.label}) is ${age} days stale — max ${req.maxAgeDays}d`);
  }
  return { violations, report };
}

/* --- mass-movement anomaly gate ----------------------------------------------------
   A one-night, many-spec, multi-band tier shift is the shape of a parse bug (the
   2026-07-09 Method incident), not of normal tuning. Blizzard DOES ship mass retunes,
   so the agent can acknowledge a real one via manifest.anomalyAck — a stated reason
   that lands in the run report and commit, never a silent bypass. */

export function checkAnomaly(nowState, baselineSpecs, bands, limits, ack) {
  const idx = new Map(bands.map((b, i) => [b.tier, i]));
  let twoBand = 0, total = 0;
  for (const [key, cur] of Object.entries(nowState)) {
    const prev = baselineSpecs?.[key];
    if (!prev) continue;
    for (const bracket of ["raid", "mplus"]) {
      const a = cur.consensus?.[bracket], b = prev.consensus?.[bracket];
      if (a == null || b == null || a === b || !idx.has(a) || !idx.has(b)) continue;
      total++;
      if (Math.abs(idx.get(a) - idx.get(b)) >= 2) twoBand++;
    }
  }
  const errors = [], notes = [];
  const breach = twoBand > limits.maxTwoBandMoves || total > limits.maxTotalMoves;
  if (breach) {
    const what = `tier movement anomaly vs last snapshot: ${twoBand} moves of ≥2 bands (max ${limits.maxTwoBandMoves}), ${total} total (max ${limits.maxTotalMoves})`;
    if (typeof ack === "string" && ack.trim()) notes.push(`${what} — acknowledged: ${ack.trim()}`);
    else errors.push(`${what} — parse-bug shape; if this is a real mass retune, set run-manifest anomalyAck to the reason`);
  }
  return { errors, notes, twoBand, total };
}

/* --- CLI --------------------------------------------------------------------------- */

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const mode = args.includes("--age") ? "age" : args.includes("--manifest") ? "manifest" : null;
  const now = args.find(a => a.startsWith("--now="))?.slice(6) ?? new Date().toISOString().slice(0, 10);
  if (!mode) { console.error("usage: check-refresh.mjs --manifest|--age [--now=YYYY-MM-DD]"); process.exit(2); }

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const readJson = async p => JSON.parse(await readFile(path.join(root, p), "utf8"));
  const config = await readJson("data/required-sources.json");
  const manifest = await readJson("data/run-manifest.json").catch(() => null);
  const data = await loadData(root);

  let failures = [];
  if (mode === "age") {
    const { violations, report } = checkFreshness(config, manifest, data, now);
    for (const line of report) console.log("  " + line);
    failures = violations;
  } else {
    const dataErrors = validateData(data, { fullRoster: true });
    if (dataErrors.length) failures.push(...dataErrors.map(e => "validate: " + e));
    const m = checkManifest(config, manifest, data, now);
    // Anomaly gate compares the CURRENT computed consensus against the newest history
    // snapshot (pre-snapshot ordering in the publish job: gate first, then snapshot).
    const payload = buildPayload(data);
    const baseline = data.historySnapshots?.[0] ?? null;
    const a = baseline
      ? checkAnomaly(snapshotStateOf(payload.specs), baseline.specs, data.scales.consensus.bands, config.anomaly, manifest?.anomalyAck)
      : { errors: [], notes: ["no history snapshot — anomaly gate skipped"], twoBand: 0, total: 0 };
    failures.push(...m.errors, ...a.errors);
    for (const d of m.degraded) console.log("  degraded: " + d);
    for (const n of [...m.notes, ...a.notes]) console.log("  note: " + n);
    if (!m.errors.length) console.log(`  movement vs ${baseline?.date ?? "—"}: ${a.total} tier moves (${a.twoBand} of ≥2 bands)`);
  }

  if (failures.length) {
    console.error(`✗ check-refresh ${mode}: ${failures.length} failure(s):`);
    for (const f of failures) console.error("  - " + f);
    process.exit(1);
  }
  console.log(`✓ check-refresh ${mode} passed (as of ${now})`);
}
