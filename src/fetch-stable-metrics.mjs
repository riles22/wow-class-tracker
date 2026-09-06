/* Public, deterministic collectors. Writes isolated evidence + apply-metrics input;
   NEVER writes canonical game data. Upstream failure is evidence, not a process crash. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PHASES } from "./normalize.mjs";
import { parseMurlok, parseMythicstats, metricKey, STABLE_SERIES, validateRoster, validDate } from "./stable-metric-parsers.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const digest = value => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
export const STABLE_URLS = Object.freeze({
  murlok: [
    { role: "DPS", url: "https://murlok.io/meta/dps/m+" },
    { role: "Healer", url: "https://murlok.io/meta/healer/m+" },
    { role: "Tank", url: "https://murlok.io/meta/tank/m+" },
  ],
  mythicstats: [{ role: "All", url: "https://mythicstats.com/period/latest" }],
});
export function storedSeries(roster, source) {
  return roster.flatMap(spec => (spec.metrics ?? []).filter(m => m.source === source)
    .map(m => ({ class: spec.class, spec: spec.spec, ...m })))
    .sort((a, b) => `${metricKey(a)}|${a.bracket}|${a.name}`.localeCompare(`${metricKey(b)}|${b.bracket}|${b.name}`));
}
function existingMetric(roster, row) {
  return roster.find(s => metricKey(s) === metricKey(row))?.metrics?.find(m => m.source === row.source && m.bracket === row.bracket && m.name === row.name);
}

// Deadline covers redirects AND the response body; size limit is streamed rather
// than checked after allocating an unbounded response. No cross-origin redirects.
export async function fetchMetricPage(url, { fetchImpl = fetch, pause = sleep, timeoutMs = 20_000, maxBytes = 2 * 1024 * 1024 } = {}) {
  let result;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    let timer, reader;
    const work = async () => {
      let current = url, res;
      for (let redirects = 0; redirects <= 3; redirects++) {
        res = await fetchImpl(current, { headers: { "user-agent": "Mozilla/5.0 (compatible; WoWClassTracker/1.0)", accept: "text/html" }, redirect: "manual", signal: controller.signal });
        if (![301, 302, 303, 307, 308].includes(res.status)) break;
        const target = new URL(res.headers.get("location"), current);
        if (target.origin !== new URL(url).origin || redirects === 3) throw new Error("Unexpected redirect target/count");
        await res.body?.cancel(); current = target.href;
      }
      const declared = Number(res.headers.get("content-length") ?? 0);
      if (declared > maxBytes) throw new Error("HTML body exceeds size limit");
      const chunks = []; let bytes = 0;
      reader = res.body?.getReader();
      if (reader) {
        while (true) {
          const next = await reader.read(); if (next.done) break;
          bytes += next.value.byteLength;
          if (bytes > maxBytes) throw new Error("HTML body exceeds size limit");
          chunks.push(Buffer.from(next.value));
        }
      }
      const body = Buffer.concat(chunks).toString("utf8");
      return { url, finalUrl: current, httpStatus: res.status, attempts: attempt, bytes,
        bodySha256: digest(body), lastModified: res.headers.get("last-modified"), body };
    };
    try {
      result = await Promise.race([work(), new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error("Request/body deadline exceeded")); }, timeoutMs);
      })]);
    } catch (error) {
      result = { url, finalUrl: url, httpStatus: 0, attempts: attempt, bytes: 0, bodySha256: null, body: "",
        error: String(error?.message ?? error).slice(0, 300) };
    } finally {
      clearTimeout(timer); controller.abort();
      if (reader) reader.cancel().catch(() => {});
    }
    if (![0, 408, 429, 500, 502, 503, 504].includes(result.httpStatus) || attempt === 2 || /size limit|redirect/.test(result.error ?? "")) return result;
    await pause(2000);
  }
  return result;
}

export async function collectStableMetrics({ roster, liveSeason = PHASES.liveSeason, checkedAt = new Date().toISOString(), ...transport }) {
  validateRoster(roster);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(checkedAt) || Number.isNaN(Date.parse(checkedAt))) throw new Error("Invalid collection timestamp");
  const evidence = { schemaVersion: 1, checkedAt, liveSeason, sources: {} }, updates = { metrics: [] };
  for (const source of Object.keys(STABLE_URLS)) {
    const receipt = { status: "pending", pages: [], rows: 0, sourceAsOf: null, omittedSpecs: [], baselineSha256: digest(storedSeries(roster, source)) };
    evidence.sources[source] = receipt;
    const parsed = [];
    try {
      for (const [i, page] of STABLE_URLS[source].entries()) {
        if (i) await (transport.pause ?? sleep)(1000);
        const fetched = await fetchMetricPage(page.url, transport);
        const { body, ...pageEvidence } = fetched;
        receipt.pages.push({ role: page.role, ...pageEvidence });
        if (fetched.httpStatus !== 200) {
          receipt.status = source === "mythicstats" && fetched.httpStatus === 404 ? "pending" : "unreachable";
          throw new Error(`HTTP ${fetched.httpStatus}${fetched.error ? `: ${fetched.error}` : ""}; canonical series retained`);
        }
        const common = { roster, liveSeason, checkedAt };
        const result = source === "murlok" ? parseMurlok(body, { ...common, role: page.role })
          : parseMythicstats(body, { ...common, finalUrl: fetched.finalUrl,
            publishedAt: fetched.lastModified && Number.isFinite(Date.parse(fetched.lastModified)) ? new Date(fetched.lastModified).toISOString() : null });
        Object.assign(receipt.pages.at(-1), { sourceDate: result.sourceAsOf, sourceTimestamp: result.sourceTimestamp ?? null, dateBasis: result.dateBasis });
        parsed.push(result);
      }
      let rows = parsed.flatMap(p => p.rows);
      if (source === "mythicstats") {
        Object.assign(receipt, { periodId: parsed[0].periodId, roleTotals: parsed[0].roleTotals, printedTotals: parsed[0].printedTotals, sum: parsed[0].sum,
          omittedSpecs: parsed[0].omittedSpecs, dateBasis: parsed[0].dateBasis });
        // A genuine omitted chart entry is not a made-up zero. A retained nonzero
        // would add phantom share to the new period, so require review instead.
        for (const missing of receipt.omittedSpecs) {
          const previous = storedSeries(roster, source).find(m => metricKey(m) === missing && m.name === STABLE_SERIES[source].name);
          if (previous && previous.value !== 0) throw new Error(`Omitted ${missing} has a nonzero stored share; source held for review`);
        }
        if (parsed[0].sourceAsOf === null) rows = rows.map(row => {
          const previous = existingMetric(roster, row);
          return previous?.value === row.value && validDate(previous.asOf) ? { ...row, asOf: previous.asOf } : row;
        });
      } else receipt.dateBasis = "source-time-datetime";
      for (const row of rows) {
        const previous = existingMetric(roster, row);
        if (previous?.asOf && row.asOf < previous.asOf) throw new Error(`Source date regressed for ${metricKey(row)} (${row.asOf} < ${previous.asOf})`);
      }
      const sourceDates = parsed.map(p => p.sourceAsOf).filter(Boolean).sort();
      Object.assign(receipt, { status: "success", rows: rows.length, sourceAsOf: sourceDates[0] ?? null,
        roleCounts: Object.fromEntries(Object.keys({ DPS: 0, Healer: 0, Tank: 0 }).map(role => [role, rows.filter(row => roster.find(s => metricKey(s) === metricKey(row)).role === role).length])),
        metricAsOf: { oldest: rows.map(r => r.asOf).sort()[0], newest: rows.map(r => r.asOf).sort().at(-1) },
        metricsSha256: digest(rows) });
      updates.metrics.push(...rows);
    } catch (error) {
      if (!["unreachable", "pending"].includes(receipt.status) || receipt.pages.every(p => p.httpStatus === 200)) receipt.status = /Partial|incomplete|Omitted|Missing|Missing or ambiguous/i.test(error.message) ? "partial" : "invalid";
      receipt.details = String(error.message).slice(0, 500);
      receipt.rows = 0;
    }
  }
  evidence.updatesSha256 = digest(updates);
  return { evidence, updates };
}

export async function runStableMetrics({ root = ROOT, outputDir = path.join(root, "metrics-fetch"), ...options } = {}) {
  const roster = JSON.parse(await readFile(path.join(root, "data/specs.json"), "utf8"));
  const result = await collectStableMetrics({ roster, ...options });
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "updates.json"), JSON.stringify(result.updates, null, 2) + "\n");
  // Written last: evidence's digest detects mismatched files from an interrupted run.
  await writeFile(path.join(outputDir, "evidence.json"), JSON.stringify(result.evidence, null, 2) + "\n");
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && !(args.length === 2 && args[0] === "--output-dir")) throw new Error("Usage: node src/fetch-stable-metrics.mjs [--output-dir <directory>]");
    const { evidence } = await runStableMetrics(args.length ? { outputDir: path.resolve(args[1]) } : {});
    for (const [id, source] of Object.entries(evidence.sources)) console.log(`${id}: ${source.status}; ${source.rows} rows; source date ${source.sourceAsOf ?? "unpublished"}${source.details ? `; ${source.details}` : ""}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
