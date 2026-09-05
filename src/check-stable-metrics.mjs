/* Publish-side receipt check. The evidence and updates must come from the separate
   PRE-agent artifact, downloaded after the agent's untrusted data artifact. A hash
   alone does not make an agent-written receipt trustworthy. */
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PHASES } from "./normalize.mjs";
import { digest, storedSeries, STABLE_URLS } from "./fetch-stable-metrics.mjs";
import { STABLE_SERIES, ROLE_COUNTS, metricKey, validateRoster, validDate } from "./stable-metric-parsers.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hash = value => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const tuple = row => `${metricKey(row)}|${row.source}|${row.bracket}|${row.name}`;
const sorted = rows => rows.toSorted((a, b) => tuple(a).localeCompare(tuple(b)));
const date = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));

export function checkStableMetrics({ baseline, current, evidence, updates, sourcePagesBefore = null, sourcePagesAfter = null,
  manifest, now = new Date(), liveSeason = PHASES.liveSeason, maxAgeHours = 24 }) {
  const errors = [];
  try {
    validateRoster(baseline); validateRoster(current);
    if (!evidence || evidence.schemaVersion !== 1 || evidence.liveSeason !== liveSeason || !date(evidence.checkedAt)
      || Date.parse(evidence.checkedAt) > +now || +now - Date.parse(evidence.checkedAt) > maxAgeHours * 3600_000) throw new Error("Missing, stale, future, or wrong-season stable-metric evidence");
    if (!updates || Object.keys(updates).join() !== "metrics" || !Array.isArray(updates.metrics)
      || updates.metrics.length > 80 || !hash(evidence.updatesSha256) || digest(updates) !== evidence.updatesSha256) throw new Error("Stable-metric updates do not match their trusted receipt");
    if (!evidence.sources || !isDeepStrictEqual(Object.keys(evidence.sources).sort(), Object.keys(STABLE_SERIES).sort())) throw new Error("Stable-metric receipt must include both providers");
    if (manifest !== undefined && (!manifest || !Array.isArray(manifest.sources))) throw new Error("Stable-metric manifest must contain source rows");
    const byKey = new Map(baseline.map(s => [metricKey(s), s])), seen = new Set();
    for (const row of updates.metrics) {
      const series = STABLE_SERIES[row?.source];
      if (!series || !byKey.has(metricKey(row)) || row.bracket !== "mplus" || row.name !== series.name || row.unit !== series.unit
        || !isDeepStrictEqual(Object.keys(row).sort(), ["class", "spec", "source", "bracket", "name", "unit", "value", "asOf"].sort())
        || !Number.isFinite(row.value) || row.value < 0 || !validDate(row.asOf) || row.asOf > evidence.checkedAt.slice(0, 10)
        || (row.source === "murlok" && (!Number.isInteger(row.value) || row.value <= 0 || row.value > 10000))
        || (row.source === "mythicstats" && (row.value > 100 || Math.abs(row.value * 10 - Math.round(row.value * 10)) > 1e-7))
        || seen.has(tuple(row))) throw new Error("Invalid or duplicated stable-metric update tuple/value/date");
      seen.add(tuple(row));
    }
    for (const [source, allowedPages] of Object.entries(STABLE_URLS)) {
      const receipt = evidence.sources[source], rows = updates.metrics.filter(r => r.source === source);
      const before = storedSeries(baseline, source), after = storedSeries(current, source);
      if (!receipt || !["success", "partial", "pending", "invalid", "unreachable"].includes(receipt.status)
        || !hash(receipt.baselineSha256) || digest(before) !== receipt.baselineSha256) throw new Error(`${source}: receipt baseline does not match trusted Git data`);
      if (manifest !== undefined) {
        const manifestRows = manifest.sources.filter(row => row?.source === source);
        if (manifestRows.length !== 1) throw new Error(`${source}: manifest must contain exactly one matching source row`);
        // Stored data can still satisfy the age gate after today's request failed.
        // Only this run's trusted collector can establish a successful observation.
        if (manifestRows[0].result === "success" && receipt.status !== "success") throw new Error(`${source}: manifest claims success but trusted collection is ${receipt.status}`);
      }
      if (!Array.isArray(receipt.pages) || receipt.pages.length < 1 || receipt.pages.length > allowedPages.length) throw new Error(`${source}: invalid receipt pages`);
      for (const [i, page] of receipt.pages.entries()) {
        const requested = allowedPages[i], finalUrl = new URL(page.finalUrl);
        if (page.url !== requested.url || page.role !== requested.role || finalUrl.origin !== new URL(requested.url).origin
          || finalUrl.username || finalUrl.password || !Number.isInteger(page.httpStatus) || page.httpStatus < 0 || page.httpStatus > 599
          || (page.httpStatus === 200 && (!hash(page.bodySha256) || !Number.isInteger(page.bytes) || page.bytes <= 0 || page.bytes > 2 * 1024 * 1024))) throw new Error(`${source}: invalid source-page provenance`);
      }
      if (receipt.status !== "success") {
        if (rows.length || receipt.rows !== 0 || !isDeepStrictEqual(after, before)) throw new Error(`${source}: failed/partial source must leave all canonical rows unchanged`);
        if (sourcePagesBefore && sourcePagesAfter && !isDeepStrictEqual(sourcePagesBefore.find(s => s.id === source), sourcePagesAfter.find(s => s.id === source))) throw new Error(`${source}: failed/partial source registry was changed`);
        continue;
      }
      if (receipt.pages.length !== allowedPages.length || receipt.pages.some(p => p.httpStatus !== 200)
        || rows.length !== receipt.rows || !hash(receipt.metricsSha256) || digest(rows) !== receipt.metricsSha256) throw new Error(`${source}: claimed successful rows do not match evidence`);
      const roleCounts = Object.fromEntries(Object.keys(ROLE_COUNTS).map(role => [role, rows.filter(row => byKey.get(metricKey(row)).role === role).length]));
      if (!isDeepStrictEqual(roleCounts, receipt.roleCounts)) throw new Error(`${source}: role coverage differs from evidence`);
      const dates = rows.map(row => row.asOf).sort();
      if (!isDeepStrictEqual(receipt.metricAsOf, { oldest: dates[0], newest: dates.at(-1) })) throw new Error(`${source}: data dates differ from evidence`);
      if (source === "murlok") {
        if (!isDeepStrictEqual(roleCounts, ROLE_COUNTS) || receipt.omittedSpecs?.length || receipt.dateBasis !== "source-time-datetime"
          || receipt.sourceAsOf !== receipt.pages.map(p => p.sourceDate).sort()[0]) throw new Error("Murlok: incomplete coverage or invalid date basis");
        for (const page of receipt.pages) {
          if (page.finalUrl !== page.url || page.dateBasis !== "source-time-datetime" || !date(page.sourceTimestamp)
            || Date.parse(page.sourceTimestamp) > Date.parse(evidence.checkedAt) || page.sourceTimestamp.slice(0, 10) !== page.sourceDate) throw new Error("Murlok: invalid source update timestamp");
        }
        for (const row of rows) if (row.asOf !== receipt.pages.find(p => p.role === byKey.get(metricKey(row)).role).sourceDate) throw new Error("Murlok: asOf was substituted for the source-owned date");
      } else {
        const page = receipt.pages[0], periodId = new URL(page.finalUrl).pathname.match(/^\/period\/(\d+)\/?$/)?.[1];
        const omitted = baseline.filter(s => !rows.some(row => metricKey(row) === metricKey(s))).map(metricKey);
        const sum = Number(rows.reduce((n, row) => n + row.value, 0).toFixed(1));
        if (!periodId || periodId !== receipt.periodId || rows.length < 25 || rows.length > 40
          || !isDeepStrictEqual(omitted, receipt.omittedSpecs) || Math.abs(sum - 100) > rows.length * 0.05 + 0.051 || receipt.sum !== sum
          || !["source-time-datetime", "source-last-modified", "observed-undated-source"].includes(receipt.dateBasis) || receipt.dateBasis !== page.dateBasis) throw new Error("Mythicstats: representation/coverage/period receipt is invalid");
        for (const group of ["Melee", "Ranged", "Tank", "Healer"]) {
          const groupRows = rows.filter(row => { const spec = byKey.get(metricKey(row)); return (spec.role === "DPS" ? spec.playstyle?.range : spec.role) === group; });
          const subtotal = Number(groupRows.reduce((n, row) => n + row.value, 0).toFixed(1));
          if (!groupRows.length || receipt.roleTotals?.[group] !== subtotal || !Number.isFinite(receipt.printedTotals?.[group])
            || Math.abs(subtotal - receipt.printedTotals[group]) > groupRows.length * 0.05 + 0.051) throw new Error("Mythicstats: role subtotals disagree with published shares");
        }
        if (Math.abs(receipt.printedTotals.Tank - 20) > 0.1 || Math.abs(receipt.printedTotals.Healer - 20) > 0.1
          || Math.abs(receipt.printedTotals.Melee + receipt.printedTotals.Ranged - 60) > 0.2) throw new Error("Mythicstats: role composition is not the top-2000 representation series");
        for (const missing of omitted) if (before.some(row => metricKey(row) === missing && row.value !== 0)) throw new Error("Mythicstats: an omitted nonzero share cannot be carried forward");
        if (receipt.dateBasis === "observed-undated-source" && (receipt.sourceAsOf !== null || page.sourceDate !== null)) throw new Error("Mythicstats: undated source was given a publication date");
        if (receipt.dateBasis === "source-last-modified" && (!validDate(page.sourceDate) || receipt.sourceAsOf !== page.sourceDate
          || !Number.isFinite(Date.parse(page.lastModified)) || Date.parse(page.lastModified) > Date.parse(evidence.checkedAt)
          || new Date(page.lastModified).toISOString().slice(0, 10) !== page.sourceDate)) throw new Error("Mythicstats: publication date does not match the response");
        if (receipt.dateBasis === "source-time-datetime" && (!validDate(page.sourceDate) || receipt.sourceAsOf !== page.sourceDate
          || !date(page.sourceTimestamp) || Date.parse(page.sourceTimestamp) > Date.parse(evidence.checkedAt)
          || page.sourceTimestamp.slice(0, 10) !== page.sourceDate)) throw new Error("Mythicstats: source-owned date does not match the response");
        for (const row of rows) {
          const old = before.find(m => tuple(m) === tuple(row));
          const expected = receipt.dateBasis !== "observed-undated-source" ? page.sourceDate
            : old?.value === row.value && validDate(old.asOf) ? old.asOf : evidence.checkedAt.slice(0, 10);
          if (row.asOf !== expected) throw new Error("Mythicstats: unchanged observation was redated or source date was lost");
        }
      }
      for (const row of rows) {
        const old = before.find(m => tuple(m) === tuple(row));
        if (old?.asOf && row.asOf < old.asOf) throw new Error(`${source}: canonical source date regressed`);
      }
      const expected = new Map(before.map(row => [tuple(row), row]));
      for (const row of rows) expected.set(tuple(row), row);
      if (!isDeepStrictEqual(sorted([...expected.values()]), sorted(after))) throw new Error(`${source}: canonical data differs from the trusted collected rows`);
      if (sourcePagesBefore && sourcePagesAfter) {
        const beforeRegistry = sourcePagesBefore.find(s => s.id === source), afterRegistry = sourcePagesAfter.find(s => s.id === source);
        // Existing registry snapshots are observation dates, distinct from metric asOf.
        const comparable = structuredClone(afterRegistry);
        if (!beforeRegistry || !comparable || beforeRegistry.pages.length !== comparable.pages.length) throw new Error(`${source}: registry shape changed during collection`);
        for (const [i, page] of comparable.pages.entries()) {
          if (page.snapshot !== beforeRegistry.pages[i].snapshot && page.snapshot !== evidence.checkedAt.slice(0, 10)) throw new Error(`${source}: registry observation date lacks collection evidence`);
          page.snapshot = beforeRegistry.pages[i].snapshot;
        }
        if (!isDeepStrictEqual(comparable, beforeRegistry)) throw new Error(`${source}: collector does not authorize registry content edits`);
      }
    }
  } catch (error) { errors.push(error.message); }
  return errors;
}

export async function runStableMetricCheck({ root = ROOT, evidenceDir = path.join(root, "metrics-fetch"), base = "HEAD", manifestPath, now } = {}) {
  if (base !== "HEAD" && !/^[a-f0-9]{40}$/.test(base)) throw new Error("--base must be HEAD or an exact 40-character commit SHA");
  const commit = execFileSync("git", ["rev-parse", "--verify", `${base}^{commit}`], { cwd: root, encoding: "utf8", windowsHide: true }).trim();
  const gitJson = file => JSON.parse(execFileSync("git", ["show", `${commit}:${file}`], { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024, windowsHide: true }));
  const readJson = async file => JSON.parse(await readFile(file, "utf8"));
  return checkStableMetrics({ baseline: gitJson("data/specs.json"), current: await readJson(path.join(root, "data/specs.json")),
    sourcePagesBefore: gitJson("data/sources.json"), sourcePagesAfter: await readJson(path.join(root, "data/sources.json")),
    evidence: await readJson(path.join(evidenceDir, "evidence.json")), updates: await readJson(path.join(evidenceDir, "updates.json")),
    ...(manifestPath !== undefined ? { manifest: await readJson(path.resolve(root, manifestPath)) } : {}), ...(now ? { now } : {}) });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    const optionNames = { "--base": "base", "--evidence-dir": "evidenceDir", "--manifest": "manifestPath" };
    for (let i = 0; i < args.length; i += 2) {
      if (!args[i + 1] || !Object.hasOwn(optionNames, args[i])) throw new Error("Usage: node src/check-stable-metrics.mjs [--base HEAD|<sha>] [--evidence-dir <directory>] [--manifest <path>]");
      options[optionNames[args[i]]] = args[i + 1];
    }
    const errors = await runStableMetricCheck(options);
    if (errors.length) throw new Error(errors.join("\n"));
    console.log("Stable numeric feeds match trusted collection evidence; failed sources and absent rows retained honestly.");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
