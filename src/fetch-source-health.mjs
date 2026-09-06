/* Availability evidence only: a successful probe is permission to run the normal
   source parser, never evidence of fresh values, season, coverage, or source dates.
   No credentials, cookies, challenge handling, proxies, or automatic redirects. */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROBE_TIMEOUT_MS = 20000;
export const PROBE_MAX_BYTES = 2 * 1024 * 1024;
export const PROBE_DELAY_MS = 1500;
const HEADERS = {
  "User-Agent": "WoW-Class-Tracker/1.0 (public source availability check)",
  Accept: "text/html",
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const record = (status, reason, bodySignature, extra = {}) => ({ status, reason, bodySignature, ...extra });

export function archonProbeTargets(sources) {
  const source = sources.find(s => s.id === "archon");
  if (!source || source.kind !== "tier-list" || (source.era && source.era !== "live"))
    throw new Error("Expected the live Archon tier-list registry entry");
  return ["raid", "mplus"].map(bracket => {
    const page = source.pages?.find(p => p.bracket === bracket && p.role === "DPS" && !p.ancillary && !p.label);
    if (!page) throw new Error(`Archon ${bracket} has no primary DPS page`);
    const url = new URL(page.url);
    const route = bracket === "raid" ? "raid" : "mythic-plus";
    if (url.protocol !== "https:" || !["archon.gg", "www.archon.gg"].includes(url.hostname)
        || url.username || url.password || url.port || url.hash || url.search
        || !url.pathname.startsWith(`/wow/tier-list/dps-rankings/${route}/`))
      throw new Error(`Archon ${bracket} probe requires its standard public rankings route`);
    return { sourceId: "archon", bracket, url: url.href };
  });
}

export function classifyArchonPage({ httpStatus, body }) {
  if (typeof body !== "string") throw new TypeError("Expected a decoded HTML response body");
  if (!Number.isInteger(httpStatus) || httpStatus < 100 || httpStatus > 599)
    throw new TypeError("Expected a valid HTTP status");
  if (/human\s+verification/i.test(body))
    return record("blocked", "The source requires human verification", "human-verification");
  if (/challenge-platform|cf-chl-|<title[^>]*>\s*just a moment/i.test(body))
    return record("blocked", "The source returned a Cloudflare challenge", "cloudflare-challenge");
  if (httpStatus === 401 || httpStatus === 403)
    return record("blocked", `The source refused access (HTTP ${httpStatus})`, "access-refused");
  if (httpStatus < 200 || httpStatus >= 300)
    return record("unreachable", `The source returned HTTP ${httpStatus}; redirects are not followed`, "http-error");
  const scripts = [...body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter(match => /(?:^|\s)id\s*=\s*["']__NEXT_DATA__["']/i.test(match[1]));
  if (scripts.length !== 1)
    return record("unresolved", "Expected exactly one __NEXT_DATA__ script", "missing-next-data");
  let state;
  try { state = JSON.parse(scripts[0][2]); }
  catch { return record("unresolved", "The __NEXT_DATA__ script is not valid JSON", "invalid-next-data"); }
  // Documented Archon rankings recipe: props.pageProps.page.specRankingsSection.
  // A generic Next.js shell/error page is insufficient. Empty tables are accessible
  // HTML but contain no usable rankings; they must not receive an available result.
  const rows = state?.props?.pageProps?.page?.specRankingsSection?.table?.data;
  const recognized = Array.isArray(rows) && rows.length > 0 && rows.every(row =>
    row && typeof row === "object" && typeof row.item === "string"
    && /<ActorIcon\b[^>]*\btype\s*=\s*["'][A-Za-z0-9-]+["']/.test(row.item)
    && ["dps", "hps", "score", "popularity", "parses"].some(key => Number.isFinite(row[key])));
  if (!recognized)
    return record("unresolved", "Expected a nonempty Archon specRankingsSection table with actor and numeric rows", "unexpected-page-schema");
  return record("available", "Recognized rankings payload; normal era, coverage, and source-date validation is still required",
    "archon-rankings", { tableRows: rows.length });
}

async function readBoundedBody(response, maxBytes, signal) {
  if (!response.body) return { body: "", bodyBytes: 0, bodyComplete: true,
    bodySha256: createHash("sha256").update("").digest("hex") };
  const reader = response.body.getReader();
  const cancel = () => { reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) cancel();
  const chunks = [];
  let bodyBytes = 0, bodyComplete = true;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const remaining = maxBytes - bodyBytes;
      const chunk = Buffer.from(value.subarray(0, remaining));
      chunks.push(chunk);
      bodyBytes += chunk.length;
      if (value.length > remaining) {
        bodyComplete = false;
        await reader.cancel();
        break;
      }
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
  const captured = Buffer.concat(chunks, bodyBytes);
  return { body: captured.toString("utf8"), bodyBytes, bodyComplete,
    bodySha256: createHash("sha256").update(captured).digest("hex") };
}

async function probe(target, { fetchImpl, now, timeoutMs, maxBytes }) {
  const attemptedAt = now().toISOString();
  const controller = new AbortController();
  let timer, httpStatus = null;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(Object.assign(new Error("Source probe timed out"), { code: "PROBE_TIMEOUT" }));
    }, timeoutMs);
  });
  let response;
  try {
    response = await Promise.race([deadline, (async () => {
      const res = await fetchImpl(target.url, { headers: HEADERS, redirect: "manual", signal: controller.signal });
      if (!Number.isInteger(res?.status) || res.status < 100 || res.status > 599
          || (res.body && typeof res.body.getReader !== "function"))
        throw Object.assign(new TypeError("Probe transport returned an invalid response"), { code: "PROBE_TOOL_ERROR" });
      httpStatus = res.status;
      return readBoundedBody(res, maxBytes, controller.signal);
    })()]);
  } catch (error) {
    if (error.code === "PROBE_TOOL_ERROR" || error instanceof ReferenceError || error instanceof SyntaxError) throw error;
    const timedOut = error.code === "PROBE_TIMEOUT" || controller.signal.aborted;
    return { ...target, attemptedAt, httpStatus,
      ...record("unreachable", timedOut ? `Request exceeded the ${timeoutMs}ms timeout` : "Request failed before a complete response could be read",
        timedOut ? "timeout" : "network-error"),
      bodyBytes: null, bodyComplete: false, bodySha256: null };
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
  const { body, ...signature } = response;
  const classification = response.bodyComplete
    ? classifyArchonPage({ httpStatus, body })
    : record("unresolved", `Response exceeded the ${maxBytes}-byte body limit; hash covers only the captured prefix`, "body-limit");
  return { ...target, attemptedAt, httpStatus, ...classification, ...signature };
}

export async function fetchSourceHealth({ sources, fetchImpl = fetch, delayImpl = pause,
  now = () => new Date(), timeoutMs = PROBE_TIMEOUT_MS, maxBytes = PROBE_MAX_BYTES, delayMs = PROBE_DELAY_MS }) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || !Number.isSafeInteger(maxBytes) || maxBytes < 1
      || !Number.isSafeInteger(delayMs) || delayMs < 0)
    throw new TypeError("Probe budgets must be integer milliseconds/bytes; timeout and byte budgets must be positive");
  const targets = archonProbeTargets(sources);
  const attemptedAt = now().toISOString();
  const pages = [];
  for (const target of targets) {
    if (pages.length) await delayImpl(delayMs);
    pages.push(await probe(target, { fetchImpl, now, timeoutMs, maxBytes }));
  }
  return { version: 1, attemptedAt, pages };
}

export async function writeSourceHealthEvidence(root, options = {}) {
  const raw = JSON.parse(await readFile(path.join(root, "data/sources.json"), "utf8"));
  const evidence = await fetchSourceHealth({ ...options, sources: raw.sources ?? raw });
  const directory = path.join(root, "source-health");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
  return evidence;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  try {
    const evidence = await writeSourceHealthEvidence(root);
    for (const page of evidence.pages)
      console.log(`  archon ${page.bracket}: ${page.status} (HTTP ${page.httpStatus ?? "none"}; ${page.bodySignature})`);
    console.log("✓ source-health/evidence.json written — availability only, no data or freshness dates changed");
  } catch (error) {
    console.error(`Source-health evidence failed: ${error.message}`);
    process.exitCode = 1;
  }
}
