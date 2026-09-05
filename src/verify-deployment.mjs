// No browser or npm dependency on the release path. Expected hashes are generated
// by the trusted build job, transferred as a separate Actions artifact, and checked
// against the workflow's immutable commit before any public response is accepted.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEPLOYED_PAGES = Object.freeze(["index.html", "gearing.html", "forecast-report.html"]);
const NORMALIZATION = "html-newlines-lf";
const normalizeHtml = html => html.replace(/\r\n?/g, "\n");
const digest = html => createHash("sha256").update(normalizeHtml(html), "utf8").digest("hex");
const validSha = sha => typeof sha === "string" && /^[a-f0-9]{40}$/.test(sha);

export function createDeploymentManifest({ dist, commitSha }) {
  if (!validSha(commitSha)) throw new Error("Expected a full lowercase 40-character commit SHA.");
  return {
    schemaVersion: 1, commitSha, normalization: NORMALIZATION,
    pages: DEPLOYED_PAGES.map(path => {
      const html = normalizeHtml(readFileSync(join(dist, path), "utf8"));
      if (!/<html[\s>]/i.test(html)) throw new Error(`${path} is empty or is not an HTML document.`);
      return { path, sha256: digest(html), bytes: Buffer.byteLength(html, "utf8") };
    }),
  };
}

export function validateDeploymentManifest(manifest, expectedSha) {
  if (!validSha(expectedSha) || manifest?.commitSha !== expectedSha) throw new Error("Deployment manifest commit does not match the trusted expected commit SHA.");
  if (manifest.schemaVersion !== 1 || manifest.normalization !== NORMALIZATION) throw new Error("Unsupported deployment manifest format or normalization.");
  if (!Array.isArray(manifest.pages) || manifest.pages.length !== DEPLOYED_PAGES.length ||
      manifest.pages.some((page, index) => page?.path !== DEPLOYED_PAGES[index] || !/^[a-f0-9]{64}$/.test(page.sha256) || !Number.isSafeInteger(page.bytes) || page.bytes <= 0)) {
    throw new Error("Deployment manifest must contain the three expected pages and valid hashes/sizes in canonical order.");
  }
}

async function readBoundedHtml(response, maxBytes) {
  const length = response.headers.get("content-length");
  if (length && Number(length) > maxBytes) throw new Error(`Response exceeds ${maxBytes} bytes.`);
  if (!response.body) throw new Error("Response has no HTML body.");
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new Error(`Response exceeds ${maxBytes} bytes.`);
      chunks.push(Buffer.from(value));
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function checkPage(page, { baseUrl, commitSha, attempt, fetchImpl, timeoutMs, maxBytes }) {
  const url = new URL(page.path, baseUrl);
  url.searchParams.set("release", commitSha);
  url.searchParams.set("attempt", String(attempt));
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${timeoutMs} ms.`));
    }, timeoutMs);
  });
  const result = { path: page.path, url: url.href, status: null, ok: false };
  try {
    return await Promise.race([timeout, (async () => {
      const response = await fetchImpl(url, {
        redirect: "manual", signal: controller.signal,
        headers: { accept: "text/html", "cache-control": "no-cache" },
      });
      result.status = response.status;
      if (response.status !== 200) {
        await response.body?.cancel();
        throw new Error(`Expected HTTP 200; got ${response.status}. Redirects are not accepted.`);
      }
      if (!/^text\/html(?:\s*;|$)/i.test(response.headers.get("content-type") || "")) {
        await response.body?.cancel();
        throw new Error("Expected an HTML Content-Type.");
      }
      const html = normalizeHtml(await readBoundedHtml(response, maxBytes));
      result.bytes = Buffer.byteLength(html, "utf8");
      result.sha256 = digest(html);
      result.ok = result.sha256 === page.sha256 && result.bytes === page.bytes;
      if (!result.ok) result.error = `Published HTML does not match build ${commitSha}.`;
      return result;
    })()]);
  } catch (error) {
    return { ...result, ok: false, error: error.message };
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

export async function verifyDeployment({ manifest, expectedSha, baseUrl, fetchImpl = fetch,
  attempts = 10, retryMs = 15000, timeoutMs = 15000, maxBytes = 8 * 1024 * 1024,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), onAttempt = () => {} }) {
  validateDeploymentManifest(manifest, expectedSha);
  const base = new URL(baseUrl);
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash || !base.pathname.endsWith("/")) {
    throw new Error("Deployment base URL must be HTTPS, end in '/', and contain no credentials, query, or fragment.");
  }
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 20 || !Number.isFinite(retryMs) || retryMs < 0 || retryMs > 30000 ||
      !Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 30000 || !Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new Error("Invalid deployment retry, timeout, or size bounds.");
  }
  let pages;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    pages = await Promise.all(manifest.pages.map(page => checkPage(page, { baseUrl: base, commitSha: expectedSha, attempt, fetchImpl, timeoutMs, maxBytes })));
    const report = { ok: pages.every(page => page.ok), commitSha: expectedSha, attempt, pages };
    onAttempt(report);
    if (report.ok || attempt === attempts) return report;
    await sleep(retryMs);
  }
}

async function main(args) {
  const create = args[0] === "--create";
  if (create) args = args.slice(1);
  const options = {};
  while (args.length) {
    const key = args.shift();
    if (!["--manifest", "--sha", "--dist", "--url"].includes(key) || !args.length || args[0].startsWith("--") || key in options) {
      throw new Error("Usage: node src/verify-deployment.mjs [--create --dist dist] --manifest <file> --sha <commit> [--url <https-base/>]");
    }
    options[key] = args.shift();
  }
  if (!options["--manifest"] || !options["--sha"]) throw new Error("Both --manifest and --sha are required.");
  if (create) {
    if (options["--url"]) throw new Error("--url is only valid when verifying a deployment.");
    const manifest = createDeploymentManifest({ dist: options["--dist"] || "dist", commitSha: options["--sha"] });
    writeFileSync(options["--manifest"], JSON.stringify(manifest, null, 2) + "\n");
    console.log(`Expected deployment manifest written for ${manifest.commitSha}: ${manifest.pages.length} pages.`);
  } else {
    if (!options["--url"] || options["--dist"]) throw new Error("Verification requires --url and does not accept --dist.");
    const report = await verifyDeployment({ manifest: JSON.parse(readFileSync(options["--manifest"], "utf8")), expectedSha: options["--sha"], baseUrl: options["--url"],
      onAttempt: attempt => console.log(`Deployment verification ${attempt.attempt}/10: ${attempt.pages.map(page => `${page.path} ${page.ok ? "verified" : page.error}`).join("; ")}`),
    });
    if (!report.ok) throw new Error(`Deployment verification failed for ${report.commitSha} after ${report.attempt} attempts.`);
    console.log(`All three published pages match build ${report.commitSha}.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
