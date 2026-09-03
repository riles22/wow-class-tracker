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
   - published-evidence/evidence.json — written by the deterministic published-date
     step (src/fetch-published.mjs, docs/published-gate-scope.md) BEFORE the agent
     runs: what each published-bearing registry page says about its own update date.
     Stored `published` values are cross-checked against it, so a stale re-read can
     no longer claim success unchallenged (the 08-02 icyveins-ptr incident).

   Modes (CLI):
     node src/check-refresh.mjs --manifest [--now=ISO] [--ack=REASON] [--wcl-evidence=PATH]
                                [--published-evidence=PATH]
         Nightly publish gate. Fails (exit 1) on: missing/duplicate manifest rows,
         missing/implausible startedAt, unexplained skips, "success" claims the stored
         data dates or the WCL fetch evidence contradict, a stored `published` that
         contradicts the published-date evidence or regresses vs HEAD,
         row-count floor breaches, a
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
         not blame) — or a page's own published date exceeds its published.maxAgeDays
         (lag-class half of the published gate; the dishonesty-class half lives in
         --manifest). Prints a stable `fingerprint=` line (sorted violation keys) so
         the heartbeat workflow can comment only on state transitions. */

import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData, validateData } from "./validate.mjs";
import { buildPayload, snapshotStateOf, SNAPSHOT_PHASE, PHASE_FLIP_DUE } from "./render.mjs";

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
    // Clamp ≥1: a bootstrap requirement may carry rows.min 0 (see required-sources
    // comment), which must mean "no floor", never dates[length] === undefined.
    const min = Math.max(1, p.minFresh ?? req.rows?.min ?? 1);
    return dates[Math.max(0, dates.length - min)];
  };
  if (p.type === "pages") {
    const dates = matchPages(p, data.sources).map(x => x.snapshot).filter(Boolean).sort();
    return dates[0] ?? null;
  }
  if (p.type === "metrics") return coverage(matchMetrics(p, data.specs).map(m => m.asOf).filter(Boolean).sort());
  if (p.type === "ptrDummy") return coverage(data.specs.map(s => s.ptrDummy?.asOf).filter(Boolean).sort());
  // Sims live on spec.fightProfile, not spec.metrics, so a "metrics" probe can't see
  // them and bloodmallet was left reading its own page snapshot (audit 2026-07-24, D3).
  if (p.type === "fightProfiles") {
    return coverage(data.specs
      .filter(s => p.source == null || s.fightProfile?.source === p.source)
      .map(s => s.fightProfile?.asOf).filter(Boolean).sort());
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
    // Count TIER ROWS, not encounters. Counting encounters made the floor blind to the
    // thing that actually breaks: a partial Archon parse keeps all 17 encounters and
    // empties their tier maps. Truncating every encounter to 3 specs (680 -> 51 rows,
    // 92.5% of the surface) passed every gate green (audit 2026-07-24, N5).
    const count = bucket => Object.values(data.encounterTiers?.[bucket] ?? {})
      .reduce((n, e) => n + Object.keys(e?.tiers ?? {}).length, 0);
    return count("raid") + count("mplus");
  }
  throw new Error(`unknown rows probe type "${p.type}" (${req.key})`);
}

/* --- the nightly publish gate ------------------------------------------------------ */

export function checkManifest(config, manifest, data, now, evidence = null) {
  const errors = [], degraded = [], notes = [];
  if (!manifest || typeof manifest !== "object") return { errors: ["run-manifest: missing or unreadable"], degraded, notes };
  const nowDate = dateOf(now);
  const nowIsInstant = ISO_INSTANT.test(String(now));
  const nowMs = nowIsInstant ? Date.parse(now) : utc(nowDate);
  if (!ISO_DATE.test(manifest.run ?? "")) errors.push(`run-manifest: run must be YYYY-MM-DD (got ${JSON.stringify(manifest.run)})`);
  else if (ageDays(nowDate, manifest.run) > 1) errors.push(`run-manifest: run date ${manifest.run} is not this run (now ${nowDate}) — the agent must write the manifest every run`);
  else if (ageDays(nowDate, manifest.run) < -1) errors.push(`run-manifest: run date ${manifest.run} is in the future (now ${nowDate})`);
  // The gate must never accept the override field it exists to guard (folded from the
  // 2026-07-16 provenance gate): the ONLY ack path is the human anomaly_ack workflow
  // input. Agents write anomalyAckProposal, which the CLI merely prints for the human.
  if (Object.prototype.hasOwnProperty.call(manifest, "anomalyAck")) {
    errors.push('run-manifest: "anomalyAck" is not accepted from the agent-written manifest — a human supplies the anomaly_ack workflow input; write anomalyAckProposal (reason + citation) instead');
  }
  // startedAt proves a fresh write at full-timestamp precision (the heartbeat consumes
  // it); a date-only or missing value defeats both, and a copied old instant defeats
  // the "fresh" part — when the gate itself knows the real time (full-ISO now, as the
  // CLI always passes), the write must be recent and not from the future.
  const started = manifest.startedAt;
  if (typeof started !== "string" || !ISO_INSTANT.test(started) || Number.isNaN(Date.parse(started))) {
    errors.push(`run-manifest: startedAt must be a full ISO 8601 instant proving a fresh write (got ${JSON.stringify(started ?? null)})`);
  } else if (ISO_DATE.test(manifest.run ?? "") && Math.abs(ageDays(dateOf(started), manifest.run)) > 1) {
    errors.push(`run-manifest: startedAt ${started} does not belong to run ${manifest.run}`);
  } else if (nowIsInstant && Date.parse(started) - nowMs > 30 * 60000) {
    errors.push(`run-manifest: startedAt ${started} is in the future`);
  } else if (nowIsInstant && nowMs - Date.parse(started) > 12 * 3600000) {
    errors.push(`run-manifest: startedAt ${started} is ${Math.round((nowMs - Date.parse(started)) / 3600000)}h old — not a fresh write from this run`);
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
    if (evidence.verdict === "rdps-restored") notes.push('wcl evidence: the rDPS metric family works again upstream — owner decision needed: freeze a deterministic median recipe into src/fetch-wcl.mjs targeting the live S2 zones 53/55 (see refresh-metrics SKILL.md) before any WCL cut can land');
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
    // previousAsOf/newAsOf are required descriptive provenance on every row (folded
    // from the 2026-07-16 provenance gate). Exact equality against recomputed probe
    // dates proved brittle — six agent runs never satisfied it; the substantive teeth
    // are the success/coverage cross-checks below — but the fields must exist (null
    // for undated feeds) and may never regress.
    for (const field of ["previousAsOf", "newAsOf"]) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) {
        errors.push(`run-manifest: "${req.key}" must include ${field} (null when the source has no dated state)`);
      }
    }
    if (ISO_DATE.test(row.previousAsOf ?? "") && ISO_DATE.test(row.newAsOf ?? "") && row.newAsOf < row.previousAsOf) {
      errors.push(`run-manifest: "${req.key}" newAsOf ${row.newAsOf} regressed below previousAsOf ${row.previousAsOf}`);
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
  // A night where nothing at all arrived is currently indistinguishable from a healthy
  // quiet night: every row can be an honest "unreachable" and the gate passes, because
  // no rule says any source must actually have advanced (audit 2026-07-24, A4). Healthy
  // runs sit around 17-19 of 25, so the floor is a catastrophe detector, not a quality
  // bar — it fires only when the run brought back essentially nothing.
  if (config.minSuccessfulSources != null) {
    // Count only rows that ANSWER a requirement. Counting every row let the floor be met
    // with invented keys: rows matching no requirement are never probed against stored
    // dates, so ten `padding-N` successes satisfied the floor while all 25 real sources
    // said "unreachable". The one actor this gate exists to constrain is the one that
    // writes this file (audit 2026-07-25).
    const reqKeys = new Set(config.requirements.map(r => r.key));
    const ok = (manifest.sources ?? []).filter(r => r.result === "success" && reqKeys.has(r.source)).length;
    if (ok < config.minSuccessfulSources) {
      errors.push(`run-manifest: only ${ok} source${ok === 1 ? "" : "s"} succeeded, below the ${config.minSuccessfulSources} floor — this run brought back almost nothing; publishing it would present a failed night as a quiet one`);
    }
  }
  return { errors, degraded, notes };
}

/* --- page self-date integrity gate (docs/published-gate-scope.md, 2026-08-04) ------
   `snapshot` (when WE fetched) is cross-checked by checkManifest; `published` (what the
   PAGE states about itself) was gated by nothing — which is how the 08-02 icyveins-ptr
   rebuild went unseen for two days while the manifest claimed success and repeated a
   stale published date. Severity split by class (owner decision, in the scope doc):
     · MISMATCH — stored published ≠ what the deterministic pre-agent fetch saw on the
       page — is dishonesty-class RED, both directions: stored-older is the incident,
       stored-newer is an overclaim or the practically empty mid-run race (upstream
       rebuilds Sundays ~12:00 UTC, the nightly runs 10:37), which self-heals next night.
     · REGRESSION — a published date moving backwards vs the last committed state — is
       dishonesty-class RED needing no evidence (a page cannot un-publish).
     · STALENESS past published.maxAgeDays is lag-class and lives in checkFreshness (the
       heartbeat), not here.
   Our own fetch failing is never red: an unresolved evidence entry degrades the
   cross-check to ratchet + threshold, stated aloud — the same rule the WCL evidence
   follows. Missing evidence entirely (local runs) is a printed note. */
export function checkPublished(config, data, prevSources = null, evidence = null, now = null) {
  const errors = [], degraded = [], notes = [];
  const reqs = (config.requirements ?? []).filter(r => r.published);
  if (!reqs.length) return { errors, degraded, notes };
  let evidenceOk = false;
  if (evidence) {
    const eDate = dateOf(evidence.attemptedAt);
    if (!ISO_DATE.test(eDate) || (now != null && Math.abs(ageDays(dateOf(now), eDate)) > 1)) {
      errors.push(`published evidence: attemptedAt ${JSON.stringify(evidence.attemptedAt ?? null)} is not from this run — stale or malformed evidence must not vouch for anything`);
    } else evidenceOk = true;
    for (const p of evidence.problems ?? []) errors.push(`published evidence: config problem recorded by the fetch step — ${p}`);
  } else {
    notes.push("no published-date evidence — cross-check skipped (expected for local runs); the regression ratchet and staleness threshold still apply");
  }
  for (const req of reqs) {
    if (req.date?.type !== "pages") {
      errors.push(`published gate: "${req.key}" has a published block but its date probe is not pages-typed — the gate has no pages to read (config bug)`);
      continue;
    }
    const pages = matchPages(req.date, data.sources);
    const withPub = pages.filter(p => p.published);
    if (!withPub.length) {
      errors.push(`published gate: "${req.key}" has a published block but none of its ${pages.length} registry pages carries a published field — a gate pointed at nothing is a config bug`);
      continue;
    }
    const prevPages = prevSources ? matchPages(req.date, prevSources) : null;
    for (const page of withPub) {
      const label = `"${req.key}" page ${page.url ?? `${page.bracket ?? "?"}/${page.role ?? "?"}`}`;
      const prev = prevPages?.find(q => q.url === page.url);
      if (prev?.published && page.published < prev.published) {
        errors.push(`published gate: ${label} regressed ${prev.published} → ${page.published} — a page cannot un-publish; a stale re-read must not overwrite a newer stored date`);
      }
      if (!evidenceOk) continue;
      const e = (evidence.pages ?? []).find(x => x.url === page.url);
      if (!e) { notes.push(`published evidence: no entry for ${label} — cross-check skipped for this page`); continue; }
      if (e.resolved == null) {
        degraded.push(`published evidence: ${label} unresolved (${e.note ?? `http ${e.httpStatus ?? "?"}`}) — cross-check degraded to the regression ratchet + staleness threshold`);
      } else if (page.published !== e.resolved) {
        errors.push(`published gate: ${label} stores published ${page.published} but the page itself says ${e.resolved} (deterministic pre-agent fetch) — re-read the page and store what it states`);
      } else if (e.note) {
        notes.push(`published evidence: ${label} — ${e.note}`);
      }
    }
  }
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

/* Value-movement guard (audit 2026-07-24, A3). Row floors, drop limits and coverage dates
   all constrain how MANY rows arrive and how fresh they are — nothing constrained the
   numbers themselves. A units error or a parse that reads the wrong column publishes green
   and silently rewrites the throughput ranks the whole "how do specs stack up" job rests
   on. Compares every stored number against the last COMMITTED state, which by construction
   already passed every gate: spec.metrics rows, spec.fightProfile.targets (sims) and
   spec.ptrDummy.targets. Coverage is the point — it read only spec.metrics at first, which
   left every sim and Dummy Dome number free to be rescaled 1000x and publish green.

   Two limits, both deliberately generous: the raw-DPS PTR series legitimately churns
   10-20% night to night on small samples, so a single row must move a LOT to trip, and a
   family median moving is the shape of a units/column error rather than tuning. Rows that
   are new, removed, zero-based, or whose family is tiny are skipped — the row floors cover
   those. Limits live in required-sources.json so tuning them stays a reviewed edit. */
export function checkValueMove(config, data, prevData, ack = null) {
  const errors = [];
  if (!prevData || config.maxValueMovePct == null) return { errors };
  const maxRow = config.maxValueMovePct;
  const maxMedian = config.maxFamilyMedianMovePct ?? maxRow * 0.6;
  // Relative movement is meaningless near zero. "Top-2000 keys representation" is a
  // percentage that legitimately swings 0.1 -> 0.9 (an 800% "move" that is numerically
  // nothing), and replaying this guard over the real nightly history showed those rows
  // alone reddening otherwise-healthy nights. Units errors — the shape this exists for —
  // happen on large-magnitude series, so gate on absolute size first.
  const minMag = config.minValueMagnitude ?? 100;
  const index = specs => {
    const byKey = new Map(), byFamily = new Map();
    const add = (key, fam, value) => {
      if (typeof value !== "number") return;
      byKey.set(key, value);
      if (!byFamily.has(fam)) byFamily.set(fam, []);
      byFamily.get(fam).push(value);
    };
    for (const s of specs ?? []) {
      for (const m of s.metrics ?? []) {
        add(`${s.class}|${s.spec}|${m.source}|${m.bracket}|${m.name}`, `${m.source}|${m.bracket}|${m.name}`, m.value);
      }
      // Sim and Dummy Dome numbers live OUTSIDE spec.metrics, and reading only
      // spec.metrics left 244 large-magnitude values completely unguarded — a 1000x
      // Bloodmallet parse published green (audit 2026-07-25). Bloodmallet is re-fetched
      // and re-merged by an agent parse every night, which is exactly the exposure this
      // guard exists for; a partial mis-parse also corrupts the Dummy Dome composite,
      // the fight-profile labels and the projection's PTR term, not just the printed number.
      for (const [count, value] of Object.entries(s.fightProfile?.targets ?? {})) {
        add(`${s.class}|${s.spec}|${s.fightProfile.source}|sim|targets.${count}`, `${s.fightProfile.source}|sim|targets.${count}`, value);
      }
      for (const [count, value] of Object.entries(s.ptrDummy?.targets ?? {})) {
        add(`${s.class}|${s.spec}|${s.ptrDummy.source}|dummy|targets.${count}`, `${s.ptrDummy.source}|dummy|targets.${count}`, value);
      }
    }
    return { byKey, byFamily };
  };
  const median = arr => {
    if (!arr.length) return null;
    const a = [...arr].sort((x, y) => x - y);
    return a[Math.floor(a.length / 2)];
  };
  const prev = index(prevData.specs), cur = index(data.specs);

  for (const [key, was] of prev.byKey) {
    const now = cur.byKey.get(key);
    if (now == null || was === 0) continue; // new/removed rows are the row floors' job
    if (Math.abs(was) < minMag) continue;   // percentages and other near-zero series
    const move = Math.abs(now - was) / Math.abs(was);
    if (move > maxRow) {
      errors.push(`value move: "${key}" went ${was} → ${now} (${Math.round(move * 100)}% vs the last committed state, max ${Math.round(maxRow * 100)}%) — units/column-parse shape; a real upstream jump needs a reviewed limit change in required-sources.json`);
    }
  }
  for (const [fam, wasArr] of prev.byFamily) {
    const nowArr = cur.byFamily.get(fam);
    if (!nowArr || wasArr.length < 5 || nowArr.length < 5) continue;
    const w = median(wasArr), n = median(nowArr);
    if (!w || Math.abs(w) < minMag) continue;
    const move = Math.abs(n - w) / Math.abs(w);
    if (move > maxMedian) {
      errors.push(`family median move: "${fam}" median went ${w} → ${n} (${Math.round(move * 100)}%, max ${Math.round(maxMedian * 100)}%) — a whole family shifting together is a units/parse change, not tuning`);
    }
  }
  if (errors.length && ack) {
    return { errors: [], notes: [`value-move guard: ${errors.length} finding(s) approved by human ack — ${ack}`], acked: errors };
  }
  return { errors };
}

/* --- the heartbeat ----------------------------------------------------------------- */

export const FLOOR_RESTORE_DUE = "2026-10-01", FULL_FLOOR = 7;

export function checkFreshness(config, manifest, data, now, gearing = null) {
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
  // The snapshot signal exists so a LOCAL refresh (which snapshots per the hard rule)
  // isn't read as a dead nightly — so it only has a job to do when it is NEWER than the
  // manifest. Pushed unconditionally it was strictly harmful: a date-only snapshot is
  // evaluated at midnight grain, so one dated yesterday always scores exactly 24h and
  // beat any startedAt older than that, capping the measured age at 24h and making a
  // SINGLE missed night undetectable at any threshold (audit 2026-07-24, A1 — the real
  // age at the 17:23 heartbeat after one miss is ~28.6h). Comparing dates keeps the
  // legacy date-only `run` fallback working when startedAt is absent.
  const snap = data.historySnapshots?.[0]?.date;
  const manifestDate = dateOf(manifest?.startedAt ?? manifest?.run ?? "");
  if (snap && ISO_DATE.test(snap) && (!ISO_DATE.test(manifestDate) || snap > manifestDate)) {
    signals.push({ label: `history snapshot ${snap}`, hours: ageDays(nowDate, snap) * 24 });
  }

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
  /* The one-shot launch flip. SNAPSHOT_PHASE is an owner action with no other detector:
     if it is missed, post-launch snapshots keep the pre-launch tag, the report card can
     never locate the boundary it grades against, and nothing downstream can infer it
     later. Checked here because the heartbeat runs daily and already knows how to shout. */
  if (SNAPSHOT_PHASE === "12.1-ptr" && dateOf(nowDate) > PHASE_FLIP_DUE) {
    violations.push(`SNAPSHOT_PHASE is still "12.1-ptr" past ${PHASE_FLIP_DUE} — flip it in src/render.mjs to the live Season-2 id. Until then every snapshot is tagged pre-launch and the forecast report card cannot find the boundary it grades the frozen projection against.`);
    keys.push("snapshot-phase");
  }
  /* The one-shot transition restore (2026-08-19 audit, D1) — same shape as the flip gate
     above: a dated owner action whose omission nothing else can detect. 152dcc6 lowered
     the catastrophe floor 7 -> 5 for the S2 transition window with "restore ~09-01"
     recorded only in a comment and a commit message; if the date passed unremembered the
     floor stayed silently weakened. Restoring the value silences this permanently — it
     cannot become a standing nag; if the window legitimately needs extending, move the
     date here in the same reviewed edit that decides so.
     EXTENDED 2026-09-01 -> 2026-10-01 (Riley, 2026-09-03, that reviewed edit): the nine
     nightlies 2026-08-26..09-03 landed 5-7 successes of 21 (two at exactly 5), because 13
     requirements were structurally unable to succeed — the nine archon-* rows behind the
     human-verification wall, wcl-live x2 on the upstream rDPS 500, and both sim rows held
     pre-adoption. Restoring 7 would have redded six of those nine nights for no new fact.
     The same-day wholesale MID2 adoption lifts the reachable ceiling by two; restore to 7
     when Archon returns or by the new date, whichever first. */
  if ((config.minSuccessfulSources ?? FULL_FLOOR) < FULL_FLOOR && dateOf(nowDate) > FLOOR_RESTORE_DUE) {
    violations.push(`minSuccessfulSources is still ${config.minSuccessfulSources} past ${FLOOR_RESTORE_DUE} — the S2-transition lowering (152dcc6) was dated "restore ~2026-09-01" and extended once to ${FLOOR_RESTORE_DUE}. Put it back to ${FULL_FLOOR} in data/required-sources.json, or move FLOOR_RESTORE_DUE in src/check-refresh.mjs if the window must extend.`);
    keys.push("min-sources-floor");
  }
  for (const req of config.requirements) {
    if (req.maxAgeDays == null || !req.date) continue;
    const date = probeDate(req, data);
    const age = date ? ageDays(nowDate, date) : null;
    report.push(`${req.key}: ${date ?? "no dated state"}${age != null ? ` (${age}d, max ${req.maxAgeDays}d)` : ""}`);
    if (date == null) { violations.push(`${req.key}: no dated state at all`); keys.push(req.key); }
    else if (age > req.maxAgeDays) { violations.push(`${req.key} (${req.label}) is ${age} days stale — max ${req.maxAgeDays}d`); keys.push(req.key); }
  }
  /* Page self-date staleness (docs/published-gate-scope.md): lag-class — the page's own
     published date exceeding its threshold means an upstream cycle was likely missed
     unseen (the incident shape) or upstream has genuinely gone quiet; either way a
     human look is due. The maxAgeDays sweep above measures OUR fetch cadence via
     snapshot; this one measures the PAGE's claim about itself. Distinct fingerprint
     key so the alert issue reads which of the two it is. Oldest page, matching
     probeDate's pages rule: a lagging page is the finding. */
  for (const req of config.requirements) {
    if (req.published?.maxAgeDays == null || req.date?.type !== "pages") continue;
    const pubs = matchPages(req.date, data.sources).map(p => p.published).filter(Boolean).sort();
    const oldest = pubs[0] ?? null;
    const age = oldest ? ageDays(nowDate, oldest) : null;
    report.push(`${req.key} published: ${oldest ?? "no published state"}${age != null ? ` (${age}d, max ${req.published.maxAgeDays}d)` : ""}`);
    if (oldest == null) { violations.push(`${req.key}: a published gate is configured but no page carries a published date`); keys.push(`${req.key}-published`); }
    else if (age > req.published.maxAgeDays) {
      violations.push(`${req.key} (${req.label}) page self-date ${oldest} is ${age} days old (max ${req.published.maxAgeDays}d) — the page has likely rebuilt unseen, or upstream went quiet; check it`);
      keys.push(`${req.key}-published`);
    }
  }
  /* GEARING FRESHNESS (2026-08-08). The gearing subproject had no staleness surface of any
     kind: nothing in required-sources.json, check-refresh, freshness.yml, validate.mjs or
     snapshot.mjs mentioned it, and its own validator's seven "stale" strings are all COUNT
     assertions, never date comparisons. The nightly redeployed an 08-02 page every night and
     nothing anywhere would have noticed it rotting.
     Deliberately HEARTBEAT-ONLY, and deliberately a sibling of `requirements[]` rather than an
     entry in it. requirements[] is consumed by checkManifest as well as this function, so a row
     there would make the nightly publish gate demand a run-manifest entry for a subproject the
     nightly cannot refresh — gearing harvests are MANUAL because Wowhead is unreachable from CI.
     A sibling key is read only by the loop that iterates it. That is structural, not a
     convention. It is also NOT in gearing/src/validate-data.mjs, so `npm test` (nightly Gate 1)
     can never go red on a date the nightly has no way to fix.
     Thresholds are loose because there is no observed re-harvest cadence to calibrate against;
     the point is to make rot VISIBLE, not to nag about lag. */
  if (config.gearing?.datasets?.length) {
    if (!gearing?.present) {
      report.push("gearing: not present in this checkout — freshness not evaluated");
    } else {
      for (const ds of config.gearing.datasets) {
        const date = gearing.dates?.[ds.file] ?? null;
        const age = date ? ageDays(nowDate, date) : null;
        report.push(`${ds.key}: ${date ?? "no dated state"}${age != null ? ` (${age}d, max ${ds.maxAgeDays}d)` : ""}`);
        if (date == null) { violations.push(`${ds.key}: gearing/data/${ds.file} carries no ${ds.dateField} date`); keys.push(ds.key); }
        else if (age > ds.maxAgeDays) {
          violations.push(`${ds.key} (gearing/data/${ds.file}) is ${age} days stale — max ${ds.maxAgeDays}d. Gearing harvests are manual; see gearing/README.md`);
          keys.push(ds.key);
        }
      }
      /* The check that actually earns its keep. Age only says a harvest is old; THIS says the
         page is publishing something the tracker has already corrected — which is what
         happened with a superseded Preservation Evoker set bonus. Cheap, exact, no clock. */
      if (gearing.tierSetDrift > 0) {
        violations.push(`gearing-tierset-sync: ${gearing.tierSetDrift} spec(s) carry tier-set text the tracker has since corrected — run \`node gearing/src/sync-tracker-fields.mjs\``);
        keys.push("gearing-tierset-sync");
      }
    }
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
  let twoBand = 0, total = 0, vanished = 0;
  for (const [key, cur] of Object.entries(nowState)) {
    const prev = baselineSpecs?.[key];
    if (!prev) continue;
    for (const bracket of ["raid", "mplus"]) {
      const a = cur.consensus?.[bracket], b = prev.consensus?.[bracket];
      /* COVERAGE LOSS (2026-08-08). The null skip below used to swallow the single largest
         movement this gate can face: a cell that HAD a letter and now has none. That is not a
         quiet non-event, it is total loss of consensus coverage for that cell — and it is the
         exact shape of the Season-2 flip, where setting PHASES.liveSeason to "s2" while all four
         live lists still read seasonVerified "s1" blanks 80 of 80 cells. Measured on the
         committed data: every cell goes null, and because letter↔null pairs were skipped the
         gate reported ZERO movement and passed green. A total blackout must never be the one
         thing this gate cannot see. Counted separately from `total` because it is a different
         event with a different cause — coverage, not retuning — and the message must say so,
         otherwise a human reads "80 tier moves" and goes looking for a parse bug. */
      if (b != null && a == null && idx.has(b)) { vanished++; continue; }
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
  /* Any vanished cell breaches, with no numeric budget: losing every source for a bracket is
     rare and always worth a human look, and the deliberate case (the S2 flip) is precisely the
     one that should be acknowledged out loud rather than shipped silently. */
  if (vanished > 0) {
    const what = `consensus COVERAGE LOSS vs last snapshot: ${vanished} cell${vanished === 1 ? "" : "s"} went from a letter to no letter at all (every rating source for that spec+bracket dropped out)`;
    if (typeof ack === "string" && ack.trim()) notes.push(`${what} — acknowledged by trusted input: ${ack.trim()}`);
    else errors.push(`${what} — if this is the Season-2 transition (liveSeason flipped while the live lists still verify as the old season), re-run with the anomaly_ack workflow input naming the flip; otherwise a source parse has failed silently`);
  }
  return { errors, notes, twoBand, total, vanished };
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

  /* Read gearing's dates SOFT — mirroring src/build.mjs's copy-if-present treatment of the
     subproject. A checkout without gearing/ must not fail the heartbeat, but it also must not
     pass in silence, so absence is reported rather than skipped. Only the heartbeat reads this;
     checkManifest never sees it. */
  const readGearing = async () => {
    if (!config.gearing?.datasets?.length) return null;
    const dates = {};
    let present = false;
    for (const ds of config.gearing.datasets) {
      try {
        const doc = JSON.parse(await readFile(path.join(root, "gearing", "data", ds.file), "utf8"));
        present = true;
        dates[ds.file] = doc?.[ds.dateField] ?? null;
      } catch { dates[ds.file] = null; }
    }
    let tierSetDrift = 0;
    try {
      const { syncTrackerFields } = await import("../gearing/src/sync-tracker-fields.mjs");
      tierSetDrift = (await syncTrackerFields({ check: true })).filter(c => c.textChanged).length;
    } catch { /* subproject absent or unreadable — the per-file report above already says so */ }
    return { present, dates, tierSetDrift };
  };

  let failures = [];
  if (mode === "age") {
    const { violations, report, fingerprint } = checkFreshness(config, manifest, data, now, await readGearing());
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
    // The value-move gate takes its OWN ack. Sharing one token meant a human re-running to
    // approve a mass tier retune silently waived every value-move finding in the same run —
    // two unrelated judgements on one signature (audit 2026-07-25). Falling back to the
    // anomaly ack would recreate exactly that, so there is deliberately no fallback.
    const valueAck = args.find(a => a.startsWith("--value-ack="))?.slice(12) ?? process.env.VALUE_MOVE_ACK ?? null;
    const payload = buildPayload(data);
    const baseline = data.historySnapshots?.[0] ?? null;
    const a = baseline
      ? checkAnomaly(snapshotStateOf(payload.specs), baseline.specs, data.scales.consensus.bands, config.anomaly, trustedAck)
      : { errors: [], notes: ["no history snapshot — anomaly gate skipped"], twoBand: 0, total: 0 };
    const proposal = manifest?.anomalyAckProposal ?? null;
    if (a.errors.length && typeof proposal === "string" && proposal.trim()) {
      console.log(`  note: the agent PROPOSED an anomaly ack (not trusted — a human must re-run with the anomaly_ack input to approve): ${proposal.trim()}`);
    }
    // Row-drop guard baseline: the last committed state (in the publish job, HEAD is
    // the tree from before the agent's output was overlaid). Absent git → skip + note.
    const gitShow = f => new Promise(res =>
      execFile("git", ["-C", root, "show", `HEAD:${f}`], { maxBuffer: 64 * 1024 * 1024 },
        (err, out) => res(err ? null : out)));
    let prevData = null, prevSources = null;
    try {
      const [prevSpecs, prevEnc, prevSrc] = await Promise.all(
        [gitShow("data/specs.json"), gitShow("data/encounter-tiers.json"), gitShow("data/sources.json")]);
      if (prevSpecs) prevData = { specs: JSON.parse(prevSpecs), encounterTiers: prevEnc ? JSON.parse(prevEnc) : null };
      if (prevSrc) { const s = JSON.parse(prevSrc); prevSources = s.sources ?? s; }
    } catch { prevData = null; }
    if (!prevData) console.log("  note: no HEAD baseline readable — row-drop and value-move guards skipped");
    // Published-date evidence: written by src/fetch-published.mjs pre-agent; in CI the
    // publish job downloads the artifact to published-evidence/. Absent for local runs.
    const pubEvidencePath = args.find(a => a.startsWith("--published-evidence="))?.slice(21)
      ?? process.env.PUBLISHED_EVIDENCE ?? "published-evidence/evidence.json";
    const pubEvidence = await readJson(pubEvidencePath).catch(() => null);
    const pub = checkPublished(config, data, prevSources, pubEvidence, now);
    for (const d of pub.degraded) console.log("  degraded: " + d);
    for (const n of pub.notes) console.log("  note: " + n);
    const drop = checkRowDrop(config, data, prevData);
    // Human-only ack, distinct from the tier one: a reviewed recipe change (e.g. the
    // 2026-07-23 Archon fix, which rescaled two whole families the next night) is exactly
    // the legitimate case, and it must be approvable rather than unpublishable.
    const vals = checkValueMove(config, data, prevData, valueAck); // shares the HEAD baseline, not the ack
    for (const n of vals.notes ?? []) console.log("  note: " + n);
    // Show what was waived. An ack that prints only a count asks a human to approve a set
    // they were never shown — `acked` was computed and then dropped on the floor.
    for (const f of vals.acked ?? []) console.log("    waived by value ack: " + f);
    failures.push(...m.errors, ...a.errors, ...pub.errors, ...drop.errors, ...vals.errors);
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
