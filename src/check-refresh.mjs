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
     node src/check-refresh.mjs --manifest [--now=ISO] [--ack=REASON] [--value-ack=REASON]
                                [--churn-ack="SOURCE:BRACKET … REASON"] [--wcl-evidence=PATH]
                                [--published-evidence=PATH]
         Nightly publish gate. Fails (exit 1) on: missing/duplicate manifest rows,
         missing/implausible startedAt, unexplained skips, "success" claims the stored
         data dates or the WCL fetch evidence contradict, a stored `published` that
         contradicts the published-date evidence or regresses vs HEAD,
         row-count floor breaches, a
         >maxRowDropPct row loss vs the last committed state (HEAD), a metric value
         move past the value limits vs HEAD, one tier-list source rewriting its own
         letters past the sourceChurn limits vs HEAD, or
         mass tier movement without a TRUSTED ack. The trusted ack comes ONLY from
         --ack= or the ANOMALY_ACK env var (in CI: a human-supplied workflow_dispatch
         input) — manifest.anomalyAckProposal is surfaced as the agent's evidence for
         that human but never satisfies the gate (re-audit: the AI being gated must
         not hold the gate's override). The value-move and source-churn guards take
         their OWN human acks the same way (--value-ack= / VALUE_MOVE_ACK and
         --churn-ack= / SOURCE_CHURN_ACK), with no fallback between the three.
         Expected unavailability (unreachable/blocked/
         partial/parse_error WITH a reason) degrades the run but does not fail it.
     node src/check-refresh.mjs --age [--now=ISO]
         Heartbeat. Fails when the last refresh signal is older than maxRunAgeHours
         (full-timestamp precision via manifest.startedAt; date-grain fallback for
         date-only signals) or any required source's stored data exceeds its
         maxAgeDays — regardless of whether the staleness was explained (an alert,
         not blame) — or a page's own published date exceeds its published.maxAgeDays
         (lag-class half of the published gate; the dishonesty-class half lives in
         --manifest). Prints a stable `fingerprint=` line (sorted violation keys) so
         the heartbeat workflow can comment only on state transitions. A stale key
         whose requirement carries an in-force acceptedStale entry is still a
         violation but is fingerprinted as `<key>.accepted`, which the workflow
         leaves out of its Monday reminder (see PIPELINE_KEYS below). */

import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData, validateData } from "./validate.mjs";
import { buildPayload, snapshotStateOf, SNAPSHOT_PHASE, PHASE_FLIP_DUE } from "./render.mjs";
import { PHASES, LABEL_FLIP_DUE, LABEL_FLIP_EXPECTED, seasonRank } from "./normalize.mjs";

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
  // A partition leaderboard can be rechecked without its included log dates moving.
  // Its trusted sample receipt dates collection separately; never apply this probe
  // to historical aggregates or silently restamp their source-owned asOf values.
  if (p.type === "leaderboardChecks") return coverage(matchMetrics(p, data.specs)
    .filter(m => m.sample?.kind === "leaderboard-entries")
    .map(m => m.sample.observedAt?.slice(0, 10)).filter(Boolean).sort());
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
    if (["no-credentials", "oauth-failed", "network-failed", "merge-failed"].includes(evidence.verdict)) {
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

export const FLOOR_RESTORE_DUE = "2026-11-01", FULL_FLOOR = 7;

/* OWNER-ACCEPTED STANDING STALENESS (owner decision 2026-10-06). Until then the heartbeat's
   Monday reminder skipped every key matching one regex in freshness.yml (ACCEPTED_KEYS,
   2026-09-25). It accepted whole families with no end date: on 2026-10-06 it covered 11 of
   24 stale keys, and nothing would ever have brought one back up for review. Acceptance now
   sits on the check it accepts, in data/required-sources.json:
     requirements[].acceptedStale            accepts the age key `<key>`
     requirements[].published.acceptedStale  accepts the self-date key `<key>-published`
   each { since, reason, reviewBy }: real YYYY-MM-DD dates, reviewBy on or after since, and
   a non-empty reason. An acceptance is in force while since <= today <= reviewBy (UTC
   dates), and it changes one thing: a STALE key is fingerprinted as `<key>.accepted`, which
   freshness.yml leaves out of the Monday reminder. The violation is still printed and still
   listed in the alert issue. It accepts staleness only, never absence: a requirement with no
   dated state at all keeps its plain key. After reviewBy the key reverts to its plain form.
   The workflow never lets an accepted token cover the plain key, so a lapse is a NEW key
   and reds the run on the first heartbeat after it.
   Pipeline keys can never be accepted: none goes through the acceptance path, an entry
   whose key is one is rejected, and freshness.yml matches them with or without the suffix.
   A malformed entry, or one placed anywhere but those two positions, accepts nothing and
   adds the pipeline key `accepted-stale-invalid`, red every day until it is fixed. */
export const PIPELINE_KEYS = Object.freeze(["run-age", "snapshot-phase", "min-sources-floor", "live-patch-label", "accepted-stale-invalid"]);
export const ACCEPTED_SUFFIX = ".accepted";
const ACCEPTANCE_FIELDS = ["since", "reason", "reviewBy"];
// Round-trips through Date.UTC, which rolls 2026-02-30 into March, so only real dates pass.
const realDate = v => typeof v === "string" && ISO_DATE.test(v) && new Date(utc(v)).toISOString().slice(0, 10) === v;

/* Why the acceptedStale entry for fingerprint key `key` cannot be honoured, or null when it
   can. Absent (undefined) and null both mean "not accepted" and are never a problem. */
export function acceptanceProblem(entry, key) {
  if (entry === undefined || entry === null) return null;
  const where = `acceptedStale for "${key}"`;
  if (PIPELINE_KEYS.includes(key)) return `${where}: "${key}" is a pipeline key, which can never be accepted`;
  if (typeof entry !== "object" || Array.isArray(entry)) return `${where} must be an object { since, reason, reviewBy }, got ${JSON.stringify(entry)}`;
  const unknown = Object.keys(entry).filter(field => !ACCEPTANCE_FIELDS.includes(field));
  if (unknown.length) return `${where} has unknown field(s) ${unknown.join(", ")}; only since, reason and reviewBy are read`;
  for (const field of ["since", "reviewBy"]) {
    if (!realDate(entry[field])) return `${where}: ${field} must be a real YYYY-MM-DD date, got ${JSON.stringify(entry[field] ?? null)}`;
  }
  if (entry.reviewBy < entry.since) return `${where}: reviewBy ${entry.reviewBy} is before since ${entry.since}`;
  if (typeof entry.reason !== "string" || !entry.reason.trim()) return `${where}: reason must be a non-empty string`;
  return null;
}

/* The JSON path of every acceptedStale in the contract that sits anywhere other than the two
   places checkFreshness reads (a gearing dataset, the top level, a nested block). Such an
   entry accepts nothing while looking as if it does, so the heartbeat reports it as invalid. */
const ACCEPTANCE_PATH = /^requirements\[\d+\](\.published)?\.acceptedStale$/;
export function misplacedAcceptances(config) {
  const found = [];
  const walk = (value, at) => {
    if (value === null || typeof value !== "object") return;
    for (const [field, child] of Object.entries(value)) {
      const here = Array.isArray(value) ? `${at}[${field}]` : at ? `${at}.${field}` : field;
      if (!Array.isArray(value) && field === "acceptedStale" && !ACCEPTANCE_PATH.test(here)) found.push(here);
      walk(child, here);
    }
  };
  walk(config, "");
  return found;
}

/* The in-season label flip (12.1.5 owner decision 6; constants beside PHASES in
   normalize.mjs). Returns the violation text, or null. One question: from LABEL_FLIP_DUE
   on, is the live patch the chip names (PHASES.livePatch?.label, else liveLabel) still
   OLDER than LABEL_FLIP_EXPECTED?
   · due null                                   → inert (no release date recorded yet)
   · today >= due, live patch older than expected → violation, fingerprint key `live-patch-label`
   · live patch is the expected one or LATER      → silent.
   "Older", not "different", is what makes it one-shot, like the SNAPSHOT_PHASE gate that
   tests for the old value: patches only move forward, so once the chip reaches 12.1.5 the
   condition never returns, whether at a later in-season patch or at the next season's
   flip (which resets livePatch to null and moves liveLabel on). Dotted numeric labels
   compare segment by segment ("12.1" < "12.1.5" < "12.2"); a label that is not purely
   dotted numbers falls back to exact equality with the expected one.
   A malformed due date is reported rather than string-compared, because a typo there
   would otherwise make the gate fire never, or always. The defaults read the real
   constants; tests pass fixtures. */
const DOTTED_PATCH = /^\d+(\.\d+)*$/;
function patchReached(label, expected) {
  if (!DOTTED_PATCH.test(String(label)) || !DOTTED_PATCH.test(String(expected))) return label === expected;
  const a = label.split(".").map(Number), b = expected.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d !== 0) return d > 0;
  }
  return true;
}

export function labelFlipViolation(now, { due = LABEL_FLIP_DUE, expected = LABEL_FLIP_EXPECTED,
  livePatch = PHASES.livePatch, liveLabel = PHASES.liveLabel } = {}) {
  if (due == null) return null;
  if (!ISO_DATE.test(String(due))) {
    return `LABEL_FLIP_DUE is ${JSON.stringify(due)}, not an ISO date — fix it in src/normalize.mjs (null keeps the gate inert)`;
  }
  const shown = livePatch?.label ?? liveLabel;
  if (dateOf(now) < due || patchReached(shown, expected)) return null;
  const current = livePatch?.label ? `"${livePatch.label}"` : "unset";
  return `PHASES.livePatch.label is ${current} on or after ${due} (LABEL_FLIP_DUE, the recorded ${expected} release date), ` +
    `so the chip still names ${shown} as the live patch — ` +
    `set PHASES.livePatch = { label: "${expected}", since: "<launch date>" } in src/normalize.mjs (the owner launch commit). ` +
    `If the release slipped, move LABEL_FLIP_DUE instead.`;
}

export function checkFreshness(config, manifest, data, now, gearing = null, { labelFlip = {} } = {}) {
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
  // The in-season patch label: the same one-shot shape, keyed on the live patch still
  // being OLDER than the expected one (labelFlipViolation above).
  const labelFlipFinding = labelFlipViolation(nowDate, labelFlip);
  if (labelFlipFinding) {
    violations.push(labelFlipFinding);
    keys.push("live-patch-label");
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
     when Archon returns or by the new date, whichever first.
     EXTENDED AGAIN 2026-10-01 -> 2026-11-01 (Riley, 2026-09-25, reviewed edit): Archon did
     not return — all nine archon-* rows have failed behind its human-verification wall in
     every committed run manifest since 2026-08-26 (recorded unreachable, then blocked from
     09-11) — and Icy Veins joined it, Cloudflare-blocked from the runners on every nightly
     since 2026-09-23. With both wcl-live rows unreachable (no sanctioned aggregate
     endpoint), 12 of 23 requirements cannot succeed from a runner. The
     nightlies 2026-09-19..09-25 landed 7, 7, 6, 7, 5, 8, 6 successes of 23 (09-23 at exactly
     5; counted from each nightly commit's data/run-manifest.json), so restoring 7 on 10-01
     would have redded three of those seven nights for a wall no run can fix. */
  if ((config.minSuccessfulSources ?? FULL_FLOOR) < FULL_FLOOR && dateOf(nowDate) > FLOOR_RESTORE_DUE) {
    violations.push(`minSuccessfulSources is still ${config.minSuccessfulSources} past ${FLOOR_RESTORE_DUE} — the S2-transition lowering (152dcc6) was dated "restore ~2026-09-01" and extended twice (2026-09-03, 2026-09-25) to ${FLOOR_RESTORE_DUE}. Put it back to ${FULL_FLOOR} in data/required-sources.json, or move FLOOR_RESTORE_DUE in src/check-refresh.mjs if the window must extend.`);
    keys.push("min-sources-floor");
  }
  /* Owner acceptances (PIPELINE_KEYS above). Every entry is validated before any age is
     measured, so a malformed one reds the heartbeat even on a day its key is fresh. */
  const acceptances = new Map(), acceptedTokens = new Set();
  for (const req of config.requirements) {
    for (const [key, entry] of [[req.key, req.acceptedStale], [`${req.key}-published`, req.published?.acceptedStale]]) {
      const problem = acceptanceProblem(entry, key);
      if (problem) {
        violations.push(`accepted-stale-invalid: ${problem}. It accepts nothing until it is fixed in data/required-sources.json`);
        keys.push("accepted-stale-invalid");
      } else if (entry != null) acceptances.set(key, entry);
    }
  }
  for (const at of misplacedAcceptances(config)) {
    violations.push(`accepted-stale-invalid: ${at} is not read by the heartbeat, which reads acceptedStale only on requirements[] and requirements[].published, so it accepts nothing; move or remove it in data/required-sources.json`);
    keys.push("accepted-stale-invalid");
  }
  const acceptanceOf = key => {
    const entry = acceptances.get(key);
    if (!entry) return null;
    return { ...entry, state: nowDate < entry.since ? "pending" : nowDate <= entry.reviewBy ? "in force" : "lapsed" };
  };
  const acceptNote = (key, status) => {
    const a = acceptanceOf(key);
    if (!a) return "";
    if (status === "fresh") return ` — acceptedStale on file until ${a.reviewBy}, unused today`;
    if (status === "absent") return " — acceptedStale covers staleness, not missing data";
    return a.state === "in force" ? ` — ACCEPTED until ${a.reviewBy}`
      : a.state === "lapsed" ? ` — acceptance LAPSED after ${a.reviewBy}` : ` — acceptance starts ${a.since}`;
  };
  // A stale source key: its accepted token while an acceptance is in force, else plain.
  const stale = (key, text) => {
    const a = acceptanceOf(key);
    if (a?.state === "in force") {
      violations.push(`${text} [ACCEPTED until ${a.reviewBy}, since ${a.since}: ${a.reason}]`);
      keys.push(key + ACCEPTED_SUFFIX);
      acceptedTokens.add(key + ACCEPTED_SUFFIX);
      return;
    }
    violations.push(!a ? text : a.state === "lapsed"
      ? `${text} [its acceptance LAPSED after ${a.reviewBy}: fix the source, or renew acceptedStale with a new reviewBy and reason, or remove it]`
      : `${text} [its acceptedStale takes effect ${a.since}]`);
    keys.push(key);
  };
  for (const req of config.requirements) {
    if (req.maxAgeDays == null || !req.date) continue;
    const date = probeDate(req, data);
    const age = date ? ageDays(nowDate, date) : null;
    const status = date == null ? "absent" : age > req.maxAgeDays ? "stale" : "fresh";
    report.push(`${req.key}: ${date ?? "no dated state"}${age != null ? ` (${age}d, max ${req.maxAgeDays}d)` : ""}${acceptNote(req.key, status)}`);
    if (date == null) { violations.push(`${req.key}: no dated state at all`); keys.push(req.key); }
    else if (age > req.maxAgeDays) stale(req.key, `${req.key} (${req.label}) is ${age} days stale — max ${req.maxAgeDays}d`);
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
    const key = `${req.key}-published`;
    const pubs = matchPages(req.date, data.sources).map(p => p.published).filter(Boolean).sort();
    const oldest = pubs[0] ?? null;
    const age = oldest ? ageDays(nowDate, oldest) : null;
    const status = oldest == null ? "absent" : age > req.published.maxAgeDays ? "stale" : "fresh";
    report.push(`${req.key} published: ${oldest ?? "no published state"}${age != null ? ` (${age}d, max ${req.published.maxAgeDays}d)` : ""}${acceptNote(key, status)}`);
    if (oldest == null) { violations.push(`${req.key}: a published gate is configured but no page carries a published date`); keys.push(key); }
    else if (age > req.published.maxAgeDays) {
      stale(key, `${req.key} (${req.label}) page self-date ${oldest} is ${age} days old (max ${req.published.maxAgeDays}d) — the page has likely rebuilt unseen, or upstream went quiet; check it`);
    }
  }
  // A successful night elsewhere must not hide a stalled official-note collector.
  // These instants verify intake coverage; they never advance a tuning fact's date.
  for (const id of config.officialNotes?.sources ?? []) {
    const key = `official-notes-${id}`;
    const source = data.officialNotes?.sources?.[id];
    const checkedAt = source?.checkedAt;
    const checkedMs = typeof checkedAt === "string" && ISO_INSTANT.test(checkedAt) ? Date.parse(checkedAt) : NaN;
    const hours = (nowMs - checkedMs) / 3600000;
    report.push(`${key}: ${checkedAt ?? "no verification receipt"}${Number.isFinite(hours) ? ` (${Math.round(hours)}h, max ${config.officialNotes.maxAgeHours}h)` : ""}`);
    if (!Number.isFinite(hours)) {
      violations.push(`${key}: no valid official-note verification receipt`); keys.push(key);
    } else if (hours < -5 / 60) {
      violations.push(`${key}: verification receipt is in the future`); keys.push(key);
    } else if (hours > config.officialNotes.maxAgeHours) {
      violations.push(`${key}: official-note intake has not been verified for ${Math.round(hours)}h (max ${config.officialNotes.maxAgeHours}h)`); keys.push(key);
    }
    const pending = [...(source?.posts ?? []).flatMap(post => post.sections ?? []), ...(source?.removedSections ?? [])]
      .filter(section => section.resolution?.disposition === "unresolved").length;
    if (pending) {
      violations.push(`${key}: ${pending} official-note class section(s) still need review`); keys.push(`${key}-unresolved`);
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
     tracker manifest does not claim external gearing work — guides have a separate weekly workflow.
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
        /* A dataset with a verificationGroup (owner decision 2026-10-06) ages from the NEWER of
           its own date and that group's lastVerifiedAt. readGearing passes the output of
           currentVerification, which nulls lastVerifiedAt once the published facts change, so
           only a verification of the facts now on the page can re-date them. A failed or
           overdue verification still reports below as gearing-verify-<group>; this only stops
           a weekly-verified dataset from reading as a months-old harvest. */
        const own = gearing.dates?.[ds.file] ?? null;
        const stamp = ds.verificationGroup && !gearing.verificationError
          ? gearing.verification?.groups?.[ds.verificationGroup]?.lastVerifiedAt : null;
        const verified = typeof stamp === "string" && Number.isFinite(Date.parse(stamp))
          && ISO_DATE.test(dateOf(stamp)) && dateOf(stamp) <= nowDate ? dateOf(stamp) : null;
        const byVerification = verified != null && (own == null || verified > dateOf(own));
        const date = byVerification ? verified : own;
        const age = date ? ageDays(nowDate, date) : null;
        const basis = !ds.verificationGroup ? ""
          : byVerification ? ` — last ${ds.verificationGroup} source verification (${ds.dateField} ${own ?? "none"})`
          : ` — ${ds.dateField}; ${verified ? `last ${ds.verificationGroup} verification ${verified} is not newer` : `no current ${ds.verificationGroup} verification`}`;
        report.push(`${ds.key}: ${date ?? "no dated state"}${age != null ? ` (${age}d, max ${ds.maxAgeDays}d)` : ""}${basis}`);
        if (date == null) {
          violations.push(`${ds.key}: gearing/data/${ds.file} carries no ${ds.dateField} date${ds.verificationGroup ? ` and no current ${ds.verificationGroup} verification` : ""}`);
          keys.push(ds.key);
        } else if (age > ds.maxAgeDays) {
          violations.push(`${ds.key} (gearing/data/${ds.file}) is ${age} days stale — max ${ds.maxAgeDays}d${ds.verificationGroup ? ` (newer of ${ds.dateField} and the last ${ds.verificationGroup} source verification; check gearing-verify.yml too)` : ""}. Check the weekly guide workflow or the dataset's harvest procedure in gearing/README.md`);
          keys.push(ds.key);
        }
        if (ds.dateField === "structuralSync.checkedAt" && age != null && age < 0) {
          violations.push(`${ds.key}: local consistency check date is in the future`);
          keys.push(ds.key);
        }
      }
      if (config.gearing.structuralSync && gearing.structuralSyncError) {
        violations.push(`gearing-specs-sync: ${gearing.structuralSyncError}`);
        keys.push("gearing-specs-sync");
      }
      for (const name of config.gearing.verification?.groups ?? []) {
        const item = gearing.verification?.groups?.[name], stamp = item?.lastVerifiedAt;
        const hours = stamp && Number.isFinite(Date.parse(stamp)) ? (nowMs - Date.parse(stamp)) / 3600000 : null;
        const limit = config.gearing.verification.maxAgeDays;
        report.push(`gearing-verify-${name}: ${item?.status ?? "missing"}, last verified ${stamp ?? "never"}`);
        if (gearing.verificationError || item?.status !== "verified" || hours == null || hours < 0 || hours > limit * 24) {
          keys.push(`gearing-verify-${name}`);
          violations.push(`gearing-verify-${name}: ${gearing.verificationError ?? item?.reason ?? "missing verification"}; weekly verification must succeed within ${limit} days`);
        }
      }
      /* The check that actually earns its keep. Age only says a harvest is old; THIS says the
         page is publishing something the tracker has already corrected — which is what
         happened with a superseded Preservation Evoker set bonus. Cheap, exact, no clock. */
      if (gearing.tierSetDrift > 0) {
        violations.push(`gearing-tierset-sync: ${gearing.tierSetDrift} spec(s) carry tier-set text the tracker has since corrected — run \`node gearing/src/harvest-specs.mjs\``);
        keys.push("gearing-tierset-sync");
      }
    }
  }
  // A configured key that itself ends in the suffix would read as accepted downstream.
  for (const key of new Set(keys)) {
    if (key.endsWith(ACCEPTED_SUFFIX) && !acceptedTokens.has(key)) {
      violations.push(`accepted-stale-invalid: the key "${key}" ends in "${ACCEPTED_SUFFIX}" without an acceptance, so the heartbeat would read it as accepted; rename it in data/required-sources.json`);
      keys.push("accepted-stale-invalid");
    }
  }
  return { violations, report, fingerprint: [...new Set(keys)].sort().join(",") };
}

/* --- mass-movement anomaly gate ----------------------------------------------------
   A one-night, many-spec, multi-band shift of the CONSENSUS is not the shape of normal
   tuning: it is a mass retune, a recomposition of the source set, or a loss of coverage.
   Blizzard DOES ship mass retunes, so a HUMAN can acknowledge a real one — `ack` reaches
   this gate only from the workflow_dispatch input / --ack / ANOMALY_ACK env, never from
   the agent-written manifest (re-audit 2026-07-14: the AI being gated must not hold the
   override). The agent may still write manifest.anomalyAckProposal — the CLI surfaces it
   as the agent's evidence for the human, and nothing more.

   CORRECTION 2026-10-06 (audit 2026-10-04, F2). This block used to say the gate catches
   the parse-bug shape of the 2026-07-09 Method incident. It cannot. The consensus averages
   four lists, so one outlet's bad parse arrives at about a quarter of its size: replayed on
   that day's data (eb71ea8^) with that day's code, the incident's uniform one-tier shift on
   35 of Method's 40 M+ letters makes 9 consensus moves and no two-band move, and passes. An
   all-S rewrite of Method's raid list on current data (34 letters, 23 of them two or more
   steps) makes 23 moves, none of two bands, and passes too. The July 9 bug was caught by
   the agent, never by this gate. One outlet rewriting its own list is checkSourceChurn's
   job (below); this gate still watches the consensus as a whole. */

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

/* --- per-source churn gate (audit 2026-10-04, F2) ----------------------------------
   One outlet rewriting its own list is the shape of a parse bug, and the consensus gate
   above cannot see it: the consensus is the mean of four lists, so one list's change
   arrives diluted to about a quarter. Replayed, the 2026-07-09 Method incident (a uniform
   one-tier shift on 35 of Method's 40 M+ letters) made 9 consensus moves, and an all-S
   rewrite of Method's raid list (34 letters, 23 of them two or more steps) made 23 with no
   two-band move. Both pass checkAnomaly. So this compares each tier-list source's OWN
   letters, bracket by bracket, against the last committed state (HEAD; in the publish job
   that is the tree from before the agent's output was overlaid):
     · only a letter→letter change counts. A letter arriving or leaving, and a spec added
       or removed, are coverage events the row floors, the row-drop guard and the anomaly
       gate's coverage-loss check already own;
     · a change is TWO-STEP when it crosses two or more places of the source's own `tiers`
       list in scales.json (Icy Veins A+→A is one step; Method S→B is two). A letter the
       scale does not hold has no measurable distance, so it counts as two-step;
     · a source+bracket breaches above sourceChurn.maxChangedLetters changed letters OR
       above sourceChurn.maxTwoStepChanges two-step ones (required-sources.json, so tuning
       them is a reviewed edit).
   Calibration, replayed with this function over every commit that changed specs.json.
   From 2026-08-20 to 2026-10-06 (64 commits) 25/10 fires on none, including the
   early-Season-2 churn of 08-22..25, the 09-27 Icy Veins catch-up and the 10-06 Method M+
   rebuild (12 letters), and it still catches both shapes above. The margin is thin, and
   that is the measured trade: the 08-22 Archon M+ recut and the 08-25 Archon Heroic
   re-harvest each changed exactly 25 letters, and two Icy Veins recuts (08-25, 09-27)
   reached 9 two-step changes. The first proposal, 20/8, fires on four of those commits.
   Before 2026-08-20 it would have fired six times: four July nightly runs of WoWMeta M+
   churn (07-17 twice, 07-19, 07-24; 26-28 letters, before WoWMeta was retyped to
   metrics), Archon's collapsed post-S1 raid sample on 08-14 (26/12), and the 08-15 Icy
   Veins M+ re-merge (33/17).

   A SEASON ADVANCE IS EXEMPT for the night it happens. When a page of the source+bracket
   records a LATER seasonVerified than it did at HEAD (ranked by PHASES.seasonOrder, never a
   string compare), the outlet has published a new season's list and a wholesale rewrite is
   the expected result; without this every outlet's flip at Season 3 fires. Replayed, it
   is what kept the S2 flips quiet: Wowhead raid and M+ on 08-09, Icy Veins raid on 08-11
   and Method raid on 08-14 changed 20-29 letters each, 10-11 of them two-step. Two limits,
   both deliberate. (1) The exemption covers that night only, so a re-merge landing on a
   LATER night than its flip needs the human ack: that is the 08-15 Icy Veins M+ re-merge
   above, blocked four nights on a scale edit. (2) seasonVerified is agent-writable and has
   no ratchet yet (F27), so a false advance could buy an exemption; but it also takes that
   outlet out of the live consensus (sourceSeasonOk) and into the frozen lane, so letters
   smuggled that way reach only the forecast term. A backward or deleted label earns
   nothing here.

   The ack is HUMAN-ONLY and separate from the other two: approving a consensus retune or a
   value rescale must not also waive a corrupted list, and the reverse. It reaches this
   function only from the source_churn_ack workflow input, --churn-ack= or SOURCE_CHURN_ACK,
   never from an agent-written file, and it waives EXACTLY the source:bracket pairs it names
   ("method:mplus — <reason + citation>"); a breach it does not name still fails. */

const CHURN_BRACKETS = ["raid", "mplus"];
// url alone is not unique in the registry, so a page is matched on its full identity.
const pageIdentity = p => [p.bracket, p.role ?? "", p.label ?? "", p.url ?? ""].join("|");

/* The season advance this source+bracket recorded since HEAD, or null. Reads the page set
   sourceSeasonOk and aheadSeasonFor read (ancillary pages feed no letters, so they cannot
   explain a letter rewrite) and matches each page to its HEAD self. An absent or unknown
   season on either side is no evidence of an advance. */
export function seasonAdvanceFor(prevSource, source, bracket, order = PHASES.seasonOrder) {
  const before = new Map((prevSource?.pages ?? [])
    .filter(p => !p.ancillary && p.bracket === bracket)
    .map(p => [pageIdentity(p), p.seasonVerified]));
  for (const p of source?.pages ?? []) {
    if (p.ancillary || p.bracket !== bracket || !before.has(pageIdentity(p))) continue;
    const from = before.get(pageIdentity(p));
    const was = seasonRank(from, order), now = seasonRank(p.seasonVerified, order);
    if (was != null && now != null && now > was) return { from, to: p.seasonVerified };
  }
  return null;
}

/* "method:mplus wowhead:raid — <reason + citation>". Pairs are sourceId:bracket tokens,
   case-insensitive; the whole string is kept as the reason. Null for an empty ack. */
export function parseChurnAck(ack) {
  if (typeof ack !== "string" || !ack.trim()) return null;
  const pairs = new Set();
  for (const m of ack.matchAll(/(?<![\w./-])([a-z0-9][a-z0-9-]*):(raid|mplus)(?![\w-])/gi)) {
    pairs.add(`${m[1].toLowerCase()}:${m[2].toLowerCase()}`);
  }
  return { pairs, reason: ack.trim() };
}

export function checkSourceChurn(config, data, prevData, prevSources, ack = null, order = PHASES.seasonOrder) {
  const errors = [], notes = [], acked = [], pairs = [];
  if (!prevData?.specs) return { errors, notes, acked, pairs };
  const maxChanged = config.sourceChurn?.maxChangedLetters, maxTwoStep = config.sourceChurn?.maxTwoStepChanges;
  if (!Number.isFinite(maxChanged) || !Number.isFinite(maxTwoStep)) {
    errors.push("source churn: data/required-sources.json has no usable sourceChurn limits (maxChangedLetters, maxTwoStepChanges) — a gate that cannot run must not pass");
    return { errors, notes, acked, pairs };
  }
  const granted = parseChurnAck(ack);
  const letter = v => (typeof v === "string" && v.trim()) ? v : null;
  const prevSpecs = new Map(prevData.specs.map(s => [`${s.class}|${s.spec}`, s]));
  const breached = new Set(), exempt = new Set();
  for (const source of (data.sources ?? []).filter(s => s.kind === "tier-list")) {
    const pos = new Map((data.scales?.scales?.[source.scale]?.tiers ?? []).map((t, i) => [t, i]));
    const prevSource = (prevSources ?? []).find(s => s.id === source.id) ?? null;
    for (const bracket of CHURN_BRACKETS) {
      let changed = 0, twoStep = 0;
      for (const spec of data.specs ?? []) {
        const was = letter(prevSpecs.get(`${spec.class}|${spec.spec}`)?.ratings?.[bracket]?.[source.id]);
        const now = letter(spec.ratings?.[bracket]?.[source.id]);
        if (was == null || now == null || was === now) continue; // arrivals, departures, no change
        changed++;
        if (!pos.has(was) || !pos.has(now) || Math.abs(pos.get(was) - pos.get(now)) >= 2) twoStep++;
      }
      if (!changed) continue;
      const pair = `${source.id}:${bracket}`;
      const advance = seasonAdvanceFor(prevSource, source, bracket, order);
      pairs.push({ pair, changed, twoStep, advance });
      if (changed <= maxChanged && twoStep <= maxTwoStep) continue;
      const what = `${pair} changed ${changed} of its letters vs the last committed state, ${twoStep} of them by two or more steps on its own scale (max ${maxChanged} changed, ${maxTwoStep} two-step)`;
      if (advance) {
        exempt.add(pair);
        notes.push(`source churn: ${what} — exempt: its seasonVerified advanced ${advance.from} → ${advance.to} tonight, so a new season's list replaced the old one`);
        continue;
      }
      breached.add(pair);
      if (granted?.pairs.has(pair)) { acked.push(what); continue; }
      errors.push(`mass-movement anomaly (one source's own list): ${what} — the whole-list parse-bug shape the consensus gate cannot see (the 2026-07-09 Method incident). If the outlet really rebuilt its list, leave the letters as verified and a human re-runs the nightly with the source_churn_ack input naming ${pair} (plus reason + citation); otherwise re-parse, or revert that source's letters and record parse_error`);
    }
  }
  if (acked.length) notes.push(`source churn: ${acked.length} finding(s) approved by human ack — ${granted.reason}`);
  if (granted && !granted.pairs.size) {
    notes.push(`source churn ack names no source:bracket pair, so it waived nothing — write e.g. "method:mplus — <reason + citation>"`);
  }
  for (const p of granted?.pairs ?? []) {
    if (breached.has(p)) continue;
    notes.push(`source churn ack names ${p}, which ${exempt.has(p) ? "its season advance already exempted" : "did not breach"} — nothing to waive there`);
  }
  return { errors, notes, acked, pairs };
}

/* --- CLI --------------------------------------------------------------------------- */

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const mode = args.includes("--age") ? "age" : args.includes("--manifest") ? "manifest" : null;
  const now = args.find(a => a.startsWith("--now="))?.slice(6) ?? new Date().toISOString();
  if (!mode) { console.error('usage: check-refresh.mjs --manifest|--age [--now=ISO] [--ack=REASON] [--value-ack=REASON] [--churn-ack="SOURCE:BRACKET … REASON"] [--wcl-evidence=PATH]'); process.exit(2); }

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
        dates[ds.file] = ds.dateField.split(".").reduce((value, key) => value?.[key], doc) ?? null;
      } catch { dates[ds.file] = null; }
    }
    let tierSetDrift = 0;
    try {
      const { syncTrackerFields } = await import("../gearing/src/sync-tracker-fields.mjs");
      tierSetDrift = (await syncTrackerFields({ check: true })).filter(c => c.textChanged).length;
    } catch { /* subproject absent or unreadable — the per-file report above already says so */ }
    let structuralSyncError = null;
    if (present && config.gearing.structuralSync) {
      try {
        const { loadSpecSyncInputs, checkSpecSync } = await import("../gearing/src/harvest-specs.mjs");
        const doc = JSON.parse(await readFile(path.join(root, "gearing", "data", "specs.json"), "utf8"));
        checkSpecSync(doc, await loadSpecSyncInputs({ root: path.join(root, "gearing") }));
      } catch (error) {
        dates["specs.json"] = null;
        structuralSyncError = error.message;
      }
    }
    let verification = null, verificationError = null;
    if (present && config.gearing.verification) {
      try {
        const { currentVerification } = await import("../gearing/src/verify-sources.mjs");
        const doc = JSON.parse(await readFile(path.join(root, "gearing/data/source-verification.json"), "utf8"));
        verification = await currentVerification(doc, path.join(root, "gearing"));
      } catch (error) { verificationError = error.message; }
    }
    return { present, dates, tierSetDrift, structuralSyncError, verification, verificationError };
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
    // The per-source churn guard takes a THIRD ack, for the same reason and again with no
    // fallback: approving a consensus retune or a value rescale must not also waive one
    // outlet's rewritten list (audit 2026-10-04, F2). It waives only the source:bracket
    // pairs it names, so it is never read from the manifest either.
    const churnAck = args.find(a => a.startsWith("--churn-ack="))?.slice(12) ?? process.env.SOURCE_CHURN_ACK ?? null;
    const payload = buildPayload(data);
    const baseline = data.historySnapshots?.[0] ?? null;
    const a = baseline
      ? checkAnomaly(snapshotStateOf(payload.specs), baseline.specs, data.scales.consensus.bands, config.anomaly, trustedAck)
      : { errors: [], notes: ["no history snapshot — anomaly gate skipped"], twoBand: 0, total: 0 };
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
    if (!prevData) console.log("  note: no HEAD baseline readable — row-drop, value-move and source-churn guards skipped");
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
    // One outlet rewriting its own list, against the same HEAD baseline, with its own ack.
    const churn = checkSourceChurn(config, data, prevData, prevSources, churnAck);
    for (const n of churn.notes) console.log("  note: " + n);
    for (const f of churn.acked) console.log("    waived by source-churn ack: " + f);
    const proposal = manifest?.anomalyAckProposal ?? null;
    if ((a.errors.length || churn.errors.length) && typeof proposal === "string" && proposal.trim()) {
      console.log(`  note: the agent PROPOSED an ack (not trusted — only a human re-run with the anomaly_ack or source_churn_ack input can approve): ${proposal.trim()}`);
    }
    failures.push(...m.errors, ...a.errors, ...pub.errors, ...drop.errors, ...vals.errors, ...churn.errors);
    for (const d of m.degraded) console.log("  degraded: " + d);
    for (const n of [...m.notes, ...a.notes]) console.log("  note: " + n);
    if (!m.errors.length) console.log(`  movement vs ${baseline?.date ?? "—"}: ${a.total} tier moves (${a.twoBand} of ≥2 bands)`);
    if (prevData) {
      const moved = churn.pairs.map(p => `${p.pair} ${p.changed} (${p.twoStep} two-step)`);
      console.log(`  source churn vs HEAD: ${moved.length ? moved.join(", ") : "no letter changed"}`);
    }
  }

  if (failures.length) {
    console.error(`✗ check-refresh ${mode}: ${failures.length} failure(s):`);
    for (const f of failures) console.error("  - " + f);
    process.exit(1);
  }
  console.log(`✓ check-refresh ${mode} passed (as of ${dateOf(now)})`);
}
