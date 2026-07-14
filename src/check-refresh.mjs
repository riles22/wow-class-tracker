/* Refresh integrity gates (2026-07-14, from the external security audit; tightened the
   same day by the follow-up re-audit).

   The nightly prompt alone proved not to be a completeness gate: the 2026-07-12 run
   quietly skipped SimC, Archon encounter/survivability pages, and left every WCL cut
   at 2026-07-09 — and still went green. These checks turn that drift into visible,
   machine-checked state:

   - data/required-sources.json  — the contract: every source the nightly must account
     for, with freshness thresholds, row-count floors, and anomaly limits.
   - data/run-manifest.json      — written by the refresh agent EVERY run: one row per
     required source with an honest result. Doubles as the public status file.
   - wcl-fetch/evidence.json     — written by the deterministic WCL fetch step (which,
     since the re-audit, is the only process holding the WCL credentials) and uploaded
     as its own artifact BEFORE the agent runs; WCL manifest rows are cross-checked
     against it, so the agent can neither fabricate a WCL "success" nor tamper with
     the evidence the gate reads.

   Modes (CLI):
     node src/check-refresh.mjs --manifest [--now=ISO] [--ack=REASON] [--wcl-evidence=PATH]
         Nightly publish gate. Fails (exit 1) on: missing/duplicate manifest rows,
         missing/implausible startedAt, unexplained skips, "success" claims the stored
         data dates or the WCL fetch evidence contradict, row-count floor breaches, a
         >maxRowDropPct row loss vs the last committed state (HEAD), or
         mass tier movement without a TRUSTED ack. The trusted ack comes ONLY from
         --ack= or the ANOMALY_ACK env var (in CI: a human-supplied workflow_dispatch
         input) — manifest.anomalyAckProposal is surfaced as the agent's evidence for
         that human but never satisfies the gate (re-audit: the AI being gated must
         not hold the gate's override). Expected unavailability (unreachable/blocked/
         partial/parse_error WITH a reason) degrades the run but does not fail it.
     node src/check-refresh.mjs --age [--now=ISO]
         Heartbeat. Fails when the last refresh signal is older than maxRunAgeHours
         (full-timestamp precision via manifest.startedAt; date-grain fallback for
         date-only signals) or any required source's stored data exceeds its
         maxAgeDays — regardless of whether the staleness was explained (an alert,
         not blame). Prints a stable `fingerprint=` line (sorted violation keys) so
         the heartbeat workflow can comment only on state transitions. */

import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData, validateData } from "./validate.mjs";
import { buildPayload, snapshotStateOf } from "./render.mjs";

export const RESULTS = new Set(["success", "partial", "unreachable", "blocked", "parse_error", "skipped"]);
// Results that mean "didn't fully land" — allowed with a reason, never silently.
const DEGRADED = new Set(["partial", "unreachable", "blocked", "parse_error", "skipped"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/;

const dayMs = 86400000;
const utc = d => { const [y, m, dd] = d.split("-").map(Number); return Date.UTC(y, m - 1, dd); };
const dateOf = v => String(v ?? "").slice(0, 10);
export const ageDays = (now, then) => (utc(dateOf(now)) - utc(dateOf(then))) / dayMs;

/* --- probes: what the repo's committed state says about a source ------------------- */

const matchPages = (probe, sources) => (sources.find(s => s.id === probe.sourceId)?.pages ?? [])
  .filter(p => probe.bracket == null || p.bracket === probe.bracket)
  .filter(p => probe.labelIncludes == null || (p.label ?? "").includes(probe.labelIncludes))
  .filter(p => !probe.unlabeledOnly || p.label == null);

const matchMetrics = (probe, specs) => specs.flatMap(s => (s.metrics ?? [])
  .filter(m => m.source === probe.source && new RegExp(probe.namePattern).test(m.name ?? "")));

/* Oldest date for page probes (a lagging page IS the finding — see wowhead mplus/Tank,
   left at 07-09 by a run that refreshed the other five pages). Metric-family probes
   take a COVERAGE date — the min-th-freshest row's date, min = date.minFresh, else
   rows.min, else 1 — i.e. "how fresh is the cut once at least a floor's worth of rows
   count". One freshly-landed row can no longer vouch for a source whose other role
   cuts/specs stayed old (re-audit 2026-07-14); rows beyond the floor legitimately
   persist from older fetches. Fewer rows than the floor ⇒ the oldest row's date
   (conservative; the row-count floor complains separately). */
export function probeDate(req, data) {
  const p = req.date;
  if (!p) return null;
  const coverage = dates => {
    if (!dates.length) return null;
    const min = p.minFresh ?? req.rows?.min ?? 1;
    return dates[Math.max(0, dates.length - min)];
  };
  if (p.type === "pages") {
    const dates = matchPages(p, data.sources).map(x => x.snapshot).filter(Boolean).sort();
    return dates[0] ?? null;
  }
  if (p.type === "metrics") return coverage(matchMetrics(p, data.specs).map(m => m.asOf).filter(Boolean).sort());
  if (p.type === "ptrDummy") return coverage(data.specs.map(s => s.ptrDummy?.asOf).filter(Boolean).sort());
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

export function checkManifest(config, manifest, data, now, evidence = null) {
  const errors = [], degraded = [], notes = [];
  if (!manifest || typeof manifest !== "object") return { errors: ["run-manifest: missing or unreadable"], degraded, notes };
  const nowDate = dateOf(now);
  if (!ISO_DATE.test(manifest.run ?? "")) errors.push(`run-manifest: run must be YYYY-MM-DD (got ${JSON.stringify(manifest.run)})`);
  else if (ageDays(nowDate, manifest.run) > 1) errors.push(`run-manifest: run date ${manifest.run} is not this run (now ${nowDate}) — the agent must write the manifest every run`);
  else if (ageDays(nowDate, manifest.run) < -1) errors.push(`run-manifest: run date ${manifest.run} is in the future (now ${nowDate})`);
  // startedAt proves a fresh write at full-timestamp precision (the heartbeat consumes
  // it); a date-only or missing value defeats both.
  const started = manifest.startedAt;
  if (typeof started !== "string" || !ISO_INSTANT.test(started) || Number.isNaN(Date.parse(started))) {
    errors.push(`run-manifest: startedAt must be a full ISO 8601 instant proving a fresh write (got ${JSON.stringify(started ?? null)})`);
  } else if (ISO_DATE.test(manifest.run ?? "") && Math.abs(ageDays(dateOf(started), manifest.run)) > 1) {
    errors.push(`run-manifest: startedAt ${started} does not belong to run ${manifest.run}`);
  }
  if (typeof manifest.summary !== "string" || !manifest.summary.trim()) errors.push("run-manifest: summary (one line, becomes the commit message) is required");
  else if (manifest.summary.length > 200) errors.push(`run-manifest: summary too long (${manifest.summary.length} > 200 chars)`);

  // WCL fetch evidence (when present): it must be from THIS run to vouch for anything,
  // and its verdict is surfaced where a human will read the gate output.
  if (evidence) {
    const eDate = dateOf(evidence.attemptedAt);
    if (!ISO_DATE.test(eDate) || Math.abs(ageDays(nowDate, eDate)) > 1) {
      errors.push(`wcl evidence: attemptedAt ${JSON.stringify(evidence.attemptedAt ?? null)} is not from this run — a stale or malformed wcl-fetch/evidence.json must not vouch for anything`);
    }
    if (evidence.verdict === "rdps-restored") notes.push('wcl evidence: the rDPS metric family works again upstream — owner decision needed: freeze a deterministic median recipe into src/fetch-wcl.mjs (zone 52 first; see refresh-metrics SKILL.md) before any WCL cut can land');
    if (["no-credentials", "oauth-failed", "network-failed"].includes(evidence.verdict)) {
      degraded.push(`wcl evidence: ${evidence.verdict} — ${evidence.detail ?? "the deterministic WCL fetch step failed before reaching a metric conclusion"}`);
    }
  }

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
    // while its snapshot/asOf dates stayed old (and, for metric families, "fresh"
    // means a floor's worth of rows landed, not one lucky row — see probeDate).
    const date = probeDate(req, data);
    if (row.result === "success" && req.date && (date == null || ageDays(manifest.run ?? nowDate, date) > 1)) {
      errors.push(`run-manifest: "${req.key}" claims success but stored data is dated ${date ?? "never"} (run ${manifest.run}) — mark it partial/unreachable with a reason instead`);
    }
    // Evidence teeth (re-audit): for evidence-gated requirements the agent's word is
    // not enough — "success" needs the deterministic fetch step to have actually
    // landed rows this run. The evidence artifact uploads before the agent runs.
    if (req.evidence && evidence && row.result === "success") {
      const landed = evidence.landed?.[req.key];
      if (!landed || !((landed.rows ?? 0) > 0)) {
        errors.push(`run-manifest: "${req.key}" claims success but the deterministic WCL fetch evidence (verdict ${JSON.stringify(evidence.verdict ?? null)}) landed no data for it this run`);
      }
    }
    const rowCount = probeRows(req, data);
    if (req.rows?.min != null && rowCount != null && rowCount < req.rows.min) {
      errors.push(`data floor: "${req.key}" has ${rowCount} rows, below the ${req.rows.min} floor — catastrophic-shrink guard (raise the floor in required-sources.json only with a reviewed reason)`);
    }
  }
  for (const key of rows.keys()) notes.push(`run-manifest: row "${key}" matches no requirement (stale key after a config change?)`);
  return { errors, degraded, notes };
}

/* Baseline-relative shrink guard (re-audit 2026-07-14): the absolute floors (rows.min,
   ~60-65% of real counts) catch catastrophic collapse but tolerate a ~35-40% silent
   loss. Comparing against the last COMMITTED state (HEAD — by construction a state
   that passed these gates) catches partial parse losses long before the floor.
   Sources legitimately shed a row or two (an upstream list omitting a spec);
   maxRowDropPct (default 25%) sits far above that. A requirement whose HEAD state was
   already below its floor is skipped — no baseline to shrink from. */
export function checkRowDrop(config, data, prevData) {
  const errors = [];
  if (!prevData) return { errors };
  const maxPct = config.maxRowDropPct ?? 0.25;
  for (const req of config.requirements) {
    if (!req.rows) continue;
    let prev, cur;
    try { prev = probeRows(req, prevData); cur = probeRows(req, data); } catch { continue; }
    if (prev == null || cur == null || prev < (req.rows.min ?? 1)) continue;
    const floor = Math.floor(prev * (1 - maxPct));
    if (cur < floor) {
      errors.push(`row drop: "${req.key}" fell ${prev} → ${cur} rows (>${Math.round(maxPct * 100)}% loss vs the last committed state) — parse-loss shape; a real upstream shrink needs a reviewed floor/limit change in required-sources.json`);
    }
  }
  return { errors };
}

/* --- the heartbeat ----------------------------------------------------------------- */

export function checkFreshness(config, manifest, data, now) {
  const violations = [], report = [], keys = [];
  const nowDate = dateOf(now);
  const nowMs = ISO_INSTANT.test(String(now)) ? Date.parse(now) : utc(nowDate);
  // Proof of life = the freshest of: manifest.startedAt (full-timestamp precision —
  // date-only math quantized the 36h threshold into whole-day steps and could be off
  // by almost a day, re-audit 2026-07-14), the manifest run date, and the newest
  // history snapshot (a LOCAL refresh — which snapshots per the hard rule — must not
  // read as "the nightly stopped"). Date-only signals keep date-grain math
  // (midnight-to-midnight): aging a bare date against a real clock would over-age a
  // same-day local snapshot into a false alert.
  const signals = [];
  // startedAt and run describe the SAME event — the date-only run is strictly the
  // legacy fallback, never a competing signal (its midnight-grain age understates a
  // morning run by up to a day, which would defeat the timestamp precision).
  if (typeof manifest?.startedAt === "string" && ISO_INSTANT.test(manifest.startedAt) && !Number.isNaN(Date.parse(manifest.startedAt))) {
    signals.push({ label: `manifest startedAt ${manifest.startedAt}`, hours: (nowMs - Date.parse(manifest.startedAt)) / 3600000 });
  } else if (manifest?.run && ISO_DATE.test(manifest.run)) {
    signals.push({ label: `manifest run ${manifest.run}`, hours: ageDays(nowDate, manifest.run) * 24 });
  }
  const snap = data.historySnapshots?.[0]?.date;
  if (snap && ISO_DATE.test(snap)) signals.push({ label: `history snapshot ${snap}`, hours: ageDays(nowDate, snap) * 24 });

  const freshest = signals.length ? signals.reduce((a, b) => (b.hours < a.hours ? b : a)) : null;
  if (!freshest) {
    violations.push("no valid run-manifest startedAt/run date or history snapshot — no refresh has ever completed under manifest enforcement");
    keys.push("run-age");
  } else {
    const hours = Math.max(0, freshest.hours);
    report.push(`last refresh signal: ${freshest.label} (${Math.round(hours)}h ago)`);
    if (hours > config.maxRunAgeHours) {
      violations.push(`last refresh (${freshest.label}) is ${Math.round(hours)}h old (max ${config.maxRunAgeHours}h) — the nightly is not completing`);
      keys.push("run-age");
    }
  }
  for (const req of config.requirements) {
    if (req.maxAgeDays == null || !req.date) continue;
    const date = probeDate(req, data);
    const age = date ? ageDays(nowDate, date) : null;
    report.push(`${req.key}: ${date ?? "no dated state"}${age != null ? ` (${age}d, max ${req.maxAgeDays}d)` : ""}`);
    if (date == null) { violations.push(`${req.key}: no dated state at all`); keys.push(req.key); }
    else if (age > req.maxAgeDays) { violations.push(`${req.key} (${req.label}) is ${age} days stale — max ${req.maxAgeDays}d`); keys.push(req.key); }
  }
  return { violations, report, fingerprint: [...new Set(keys)].sort().join(",") };
}

/* --- mass-movement anomaly gate ----------------------------------------------------
   A one-night, many-spec, multi-band tier shift is the shape of a parse bug (the
   2026-07-09 Method incident), not of normal tuning. Blizzard DOES ship mass retunes,
   so a HUMAN can acknowledge a real one — `ack` reaches this gate only from the
   workflow_dispatch input / --ack / ANOMALY_ACK env, never from the agent-written
   manifest (re-audit 2026-07-14: the AI being gated must not hold the override).
   The agent may still write manifest.anomalyAckProposal — the CLI surfaces it as the
   agent's evidence for the human, and nothing more. */

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
    if (typeof ack === "string" && ack.trim()) notes.push(`${what} — acknowledged by trusted input: ${ack.trim()}`);
    else errors.push(`${what} — parse-bug shape; if this is a real mass retune, a human re-runs the nightly with the anomaly_ack workflow input (reason + citation)`);
  }
  return { errors, notes, twoBand, total };
}

/* --- CLI --------------------------------------------------------------------------- */

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const mode = args.includes("--age") ? "age" : args.includes("--manifest") ? "manifest" : null;
  const now = args.find(a => a.startsWith("--now="))?.slice(6) ?? new Date().toISOString();
  if (!mode) { console.error("usage: check-refresh.mjs --manifest|--age [--now=ISO] [--ack=REASON] [--wcl-evidence=PATH]"); process.exit(2); }

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const readJson = async p => JSON.parse(await readFile(path.resolve(root, p), "utf8"));
  const config = await readJson("data/required-sources.json");
  const manifest = await readJson("data/run-manifest.json").catch(() => null);
  const data = await loadData(root);

  let failures = [];
  if (mode === "age") {
    const { violations, report, fingerprint } = checkFreshness(config, manifest, data, now);
    for (const line of report) console.log("  " + line);
    console.log(`fingerprint=${fingerprint || "clean"}`);
    failures = violations;
  } else {
    const dataErrors = validateData(data, { fullRoster: true });
    if (dataErrors.length) failures.push(...dataErrors.map(e => "validate: " + e));
    // WCL fetch evidence: written by the deterministic fetch step; in CI the publish
    // job downloads the pre-agent artifact to wcl-fetch/. Absent for local runs.
    const evidencePath = args.find(a => a.startsWith("--wcl-evidence="))?.slice(15) ?? process.env.WCL_EVIDENCE ?? "wcl-fetch/evidence.json";
    const evidence = await readJson(evidencePath).catch(() => null);
    if (!evidence) console.log(`  note: no WCL fetch evidence at ${evidencePath} — evidence cross-check skipped (expected for local runs)`);
    const m = checkManifest(config, manifest, data, now, evidence);
    // Anomaly gate compares the CURRENT computed consensus against the newest history
    // snapshot (pre-snapshot ordering in the publish job: gate first, then snapshot).
    // The trusted ack comes from a human (workflow input / env / --ack), NEVER from
    // the agent-written manifest.
    const trustedAck = args.find(a => a.startsWith("--ack="))?.slice(6) ?? process.env.ANOMALY_ACK ?? null;
    const payload = buildPayload(data);
    const baseline = data.historySnapshots?.[0] ?? null;
    const a = baseline
      ? checkAnomaly(snapshotStateOf(payload.specs), baseline.specs, data.scales.consensus.bands, config.anomaly, trustedAck)
      : { errors: [], notes: ["no history snapshot — anomaly gate skipped"], twoBand: 0, total: 0 };
    const proposal = manifest?.anomalyAckProposal ?? manifest?.anomalyAck ?? null;
    if (a.errors.length && typeof proposal === "string" && proposal.trim()) {
      console.log(`  note: the agent PROPOSED an anomaly ack (not trusted — a human must re-run with the anomaly_ack input to approve): ${proposal.trim()}`);
    }
    // Row-drop guard baseline: the last committed state (in the publish job, HEAD is
    // the tree from before the agent's output was overlaid). Absent git → skip + note.
    const gitShow = f => new Promise(res =>
      execFile("git", ["-C", root, "show", `HEAD:${f}`], { maxBuffer: 64 * 1024 * 1024 },
        (err, out) => res(err ? null : out)));
    let prevData = null;
    try {
      const [prevSpecs, prevEnc] = await Promise.all([gitShow("data/specs.json"), gitShow("data/encounter-tiers.json")]);
      if (prevSpecs) prevData = { specs: JSON.parse(prevSpecs), encounterTiers: prevEnc ? JSON.parse(prevEnc) : null };
    } catch { prevData = null; }
    if (!prevData) console.log("  note: no HEAD baseline readable — row-drop guard skipped");
    const drop = checkRowDrop(config, data, prevData);
    failures.push(...m.errors, ...a.errors, ...drop.errors);
    for (const d of m.degraded) console.log("  degraded: " + d);
    for (const n of [...m.notes, ...a.notes]) console.log("  note: " + n);
    if (!m.errors.length) console.log(`  movement vs ${baseline?.date ?? "—"}: ${a.total} tier moves (${a.twoBand} of ≥2 bands)`);
  }

  if (failures.length) {
    console.error(`✗ check-refresh ${mode}: ${failures.length} failure(s):`);
    for (const f of failures) console.error("  - " + f);
    process.exit(1);
  }
  console.log(`✓ check-refresh ${mode} passed (as of ${dateOf(now)})`);
}
