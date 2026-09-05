import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { archonProbeTargets, classifyArchonPage, fetchSourceHealth, writeSourceHealthEvidence } from "../src/fetch-source-health.mjs";

const sources = [{ id: "archon", kind: "tier-list", pages: [
  { bracket: "raid", role: "DPS", url: "https://www.archon.gg/wow/tier-list/dps-rankings/raid/heroic/all-bosses" },
  { bracket: "mplus", role: "DPS", url: "https://www.archon.gg/wow/tier-list/dps-rankings/mythic-plus/10/all-dungeons/this-week" },
  { bracket: "raid", role: "DPS", ancillary: true, url: "https://www.archon.gg/wow/tier-list/dps-rankings/raid/mythic/all-bosses" },
] }];
const statePage = page => `<html><script type="application/json" id="__NEXT_DATA__">${JSON.stringify({ props: { pageProps: { page } } })}</script></html>`;
// Documented rankings schema, with inert example numbers rather than game data.
const rankings = statePage({ specRankingsSection: { table: { data: [
  { item: "<ActorIcon type='Mage-Frost' />", dps: 100, parses: 20 },
] } } });
const now = () => new Date("2026-09-05T15:00:00Z");
const options = { sources, now, delayMs: 0, delayImpl: async () => {} };

test("source health rejects both 200 verification pages and 403 challenges", () => {
  const human = classifyArchonPage({ httpStatus: 200, body: "<title>Human Verification</title>" });
  assert.equal(human.status, "blocked");
  assert.equal(human.bodySignature, "human-verification");
  const cloudflare = classifyArchonPage({ httpStatus: 403, body: "<title>Just a moment...</title><script src='/cdn-cgi/challenge-platform'></script>" });
  assert.equal(cloudflare.status, "blocked");
  assert.equal(cloudflare.bodySignature, "cloudflare-challenge");
  assert.equal(classifyArchonPage({ httpStatus: 403, body: "Forbidden" }).status, "blocked");
});

test("source health requires the actual rankings schema, never 200 or generic Next state", () => {
  const available = classifyArchonPage({ httpStatus: 200, body: rankings });
  assert.equal(available.status, "available");
  assert.equal(available.tableRows, 1);
  assert.match(available.reason, /era, coverage, and source-date/);
  for (const body of ["<html>Fine</html>", statePage({ error: "not found" }),
    '<script id="__NEXT_DATA__">{broken</script>', rankings + rankings,
    rankings.replace('id="__NEXT_DATA__"', 'data-id="__NEXT_DATA__"'),
    statePage({ specRankingsSection: { table: { data: [] } } }),
    statePage({ specRankingsSection: { table: { data: [{ item: "unrelated", dps: 100 }] } } })])
    assert.equal(classifyArchonPage({ httpStatus: 200, body }).status, "unresolved");
  assert.equal(classifyArchonPage({ httpStatus: 302, body: rankings }).status, "unreachable");
  assert.throws(() => classifyArchonPage({ httpStatus: null, body: rankings }), /HTTP status/);
});

test("source health chooses current registry routes and refuses nonpublic alternatives", () => {
  assert.deepEqual(archonProbeTargets(sources).map(t => t.url), sources[0].pages.slice(0, 2).map(p => p.url));
  for (const url of ["https://proxy.example/archon", "https://user:password@www.archon.gg/wow/tier-list/dps-rankings/raid/heroic/all-bosses",
    "http://www.archon.gg/wow/tier-list/dps-rankings/raid/heroic/all-bosses", "https://www.archon.gg/_next/data/build/page.json",
    sources[0].pages[1].url]) {
    const changed = structuredClone(sources);
    changed[0].pages[0].url = url;
    assert.throws(() => archonProbeTargets(changed), /standard public rankings route/);
  }
  assert.throws(() => archonProbeTargets([]), /registry entry/);
});

test("source health preserves mixed bracket outcomes, delays requests, and emits no bodies or cookies", async () => {
  const calls = [], delays = [];
  const result = await fetchSourceHealth({ ...options, delayMs: 1500, delayImpl: async ms => delays.push(ms),
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(url.includes("/raid/") ? rankings : "<title>Human Verification</title>", {
        status: 200, headers: { "Set-Cookie": "never-include-this" },
      });
    } });
  assert.equal(result.attemptedAt, now().toISOString());
  assert.deepEqual(result.pages.map(p => [p.bracket, p.status]), [["raid", "available"], ["mplus", "blocked"]]);
  assert.deepEqual(delays, [1500]);
  assert.ok(calls.every(c => c.init.redirect === "manual" && c.init.signal instanceof AbortSignal && !c.init.headers.Cookie));
  for (const row of result.pages) {
    assert.match(row.bodySha256, /^[a-f0-9]{64}$/);
    assert.ok(row.bodyBytes > 0 && row.bodyComplete);
    assert.equal(row.body, undefined);
    assert.equal(row.snapshot, undefined);
    assert.equal(row.published, undefined);
  }
  assert.ok(!JSON.stringify(result).includes("never-include-this"));
});

test("source health timeout bounds even a noncooperative transport and slow response body", async () => {
  const start = Date.now();
  const stalled = await fetchSourceHealth({ ...options, timeoutMs: 10, fetchImpl: async () => new Promise(() => {}) });
  assert.ok(Date.now() - start < 5000, "a transport ignoring abort must not hold the runner indefinitely");
  assert.ok(stalled.pages.every(p => p.bodySignature === "timeout" && p.httpStatus === null));
  let cancellations = 0;
  const bodyStall = await fetchSourceHealth({ ...options, timeoutMs: 10,
    fetchImpl: async () => new Response(new ReadableStream({ start() {}, cancel() { cancellations++; } })) });
  assert.ok(bodyStall.pages.every(p => p.bodySignature === "timeout" && p.httpStatus === 200));
  assert.equal(cancellations, 2, "timed-out response streams must be released");
});

test("source health limits downloaded body capture and records network errors independently", async () => {
  let call = 0;
  const result = await fetchSourceHealth({ ...options, maxBytes: 50, fetchImpl: async () => {
    if (call++) throw new TypeError("network failed, private diagnostics must not be copied");
    return new Response(rankings);
  } });
  assert.equal(result.pages[0].bodySignature, "body-limit");
  assert.equal(result.pages[0].bodyBytes, 50);
  assert.equal(result.pages[0].bodyComplete, false);
  assert.match(result.pages[0].bodySha256, /^[a-f0-9]{64}$/);
  assert.equal(result.pages[1].bodySignature, "network-error");
  assert.ok(!JSON.stringify(result).includes("private diagnostics"));
  await assert.rejects(fetchSourceHealth({ ...options, timeoutMs: 0 }), /budgets/);
  await assert.rejects(fetchSourceHealth({ ...options, fetchImpl: async () => ({}) }), /invalid response/);
  await assert.rejects(fetchSourceHealth({ ...options, fetchImpl: async () => { throw new ReferenceError("tool bug"); } }), /tool bug/);
});

test("source health writes outage evidence successfully and leaves registry bytes unchanged", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "source-health-test-"));
  try {
    await mkdir(path.join(root, "data"));
    const registry = JSON.stringify(sources);
    await writeFile(path.join(root, "data/sources.json"), registry);
    const result = await writeSourceHealthEvidence(root, { ...options,
      fetchImpl: async () => new Response("<title>Human Verification</title>", { status: 200 }) });
    assert.ok(result.pages.every(p => p.status === "blocked"));
    assert.deepEqual(JSON.parse(await readFile(path.join(root, "source-health/evidence.json"), "utf8")), result);
    assert.equal(await readFile(path.join(root, "data/sources.json"), "utf8"), registry);
    await assert.rejects(writeSourceHealthEvidence(path.join(root, "missing"), options), /ENOENT/);
    await rm(path.join(root, "source-health/evidence.json"));
    await mkdir(path.join(root, "source-health/evidence.json"));
    await assert.rejects(writeSourceHealthEvidence(root, { ...options,
      fetchImpl: async () => new Response("Forbidden", { status: 403 }) }), /EISDIR|EPERM/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
