import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDeploymentManifest, verifyDeployment, DEPLOYED_PAGES } from "../src/verify-deployment.mjs";

const commitSha = "a".repeat(40);
const baseUrl = "https://example.test/tracker/";
function fixture(t) {
  const dist = mkdtempSync(join(tmpdir(), "tracker-deployment-"));
  t.after(() => rmSync(dist, { recursive: true, force: true }));
  const pages = Object.fromEntries(DEPLOYED_PAGES.map(path => [path, `<!doctype html>\n<html><body>${path}</body></html>\n`]));
  for (const [path, html] of Object.entries(pages)) writeFileSync(join(dist, path), html);
  return { pages, dist, manifest: createDeploymentManifest({ dist, commitSha }) };
}
const htmlResponse = html => new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
const options = extra => ({ expectedSha: commitSha, baseUrl, attempts: 1, retryMs: 0, ...extra });

test("all three pages must match the trusted commit's exact HTML, normalizing only line endings", async t => {
  const { pages, manifest, dist } = fixture(t);
  for (const [path, html] of Object.entries(pages)) writeFileSync(join(dist, path), html.replaceAll("\n", "\r\n"));
  assert.deepEqual(createDeploymentManifest({ dist, commitSha }), manifest);
  const calls = [];
  const report = await verifyDeployment(options({ manifest, fetchImpl: async (url, init) => {
    calls.push({ url, init });
    return htmlResponse(pages[url.pathname.split("/").at(-1)].replaceAll("\n", "\r\n"));
  } }));
  assert.equal(report.ok, true);
  assert.equal(calls.length, 3);
  assert.ok(calls.every(({ url, init }) => url.searchParams.get("release") === commitSha && init.redirect === "manual" && init.signal instanceof AbortSignal));
});

test("a stale page causes bounded propagation retries and all pages are rechecked", async t => {
  const { pages, manifest } = fixture(t);
  let calls = 0, waits = 0;
  const report = await verifyDeployment(options({ manifest, attempts: 3, fetchImpl: async url => {
    calls++;
    return htmlResponse(url.searchParams.get("attempt") === "1" ? "<html>old release</html>" : pages[url.pathname.split("/").at(-1)]);
  }, sleep: async () => { waits++; } }));
  assert.equal(report.ok, true);
  assert.equal(report.attempt, 2);
  assert.equal(calls, 6);
  assert.equal(waits, 1);
});

test("wrong hashes stay red after the final retry instead of accepting a working but stale site", async t => {
  const { manifest } = fixture(t);
  const report = await verifyDeployment(options({ manifest, attempts: 2, sleep: async () => {}, fetchImpl: async () => htmlResponse("<html>stale</html>") }));
  assert.equal(report.ok, false);
  assert.equal(report.attempt, 2);
  assert.ok(report.pages.every(page => /does not match/.test(page.error)));
});

test("HTTP errors, redirects, and wrong content types cannot pass with otherwise matching text", async t => {
  const { pages, manifest } = fixture(t);
  for (const [status, contentType] of [[404, "text/html"], [302, "text/html"], [200, "application/json"]]) {
    const report = await verifyDeployment(options({ manifest, fetchImpl: async url => new Response(pages[url.pathname.split("/").at(-1)], {
      status, headers: { "content-type": contentType, location: "https://elsewhere.test/" },
    }) }));
    assert.equal(report.ok, false, `${status} ${contentType}`);
    assert.ok(report.pages.every(page => page.status === status));
  }
});

test("timeouts cover both response headers and body consumption", async t => {
  const { manifest } = fixture(t);
  for (const fetchImpl of [async () => new Promise(() => {}), async () => new Response(new ReadableStream({ start() {} }), { headers: { "content-type": "text/html" } })]) {
    const report = await verifyDeployment(options({ manifest, timeoutMs: 10, fetchImpl }));
    assert.equal(report.ok, false);
    assert.ok(report.pages.every(page => /timed out/.test(page.error)));
  }
});

test("oversized responses and network failures are failed checks", async t => {
  const { manifest } = fixture(t);
  const tooBig = await verifyDeployment(options({ manifest, maxBytes: 4, fetchImpl: async () => htmlResponse("<html>too big</html>") }));
  assert.ok(tooBig.pages.every(page => /exceeds/.test(page.error)));
  const unreachable = await verifyDeployment(options({ manifest, fetchImpl: async () => { throw new Error("Network unavailable"); } }));
  assert.ok(unreachable.pages.every(page => /Network unavailable/.test(page.error)));
});

test("wrong commit, missing page, or unsafe URL fail before contacting the site", async t => {
  const { manifest, dist } = fixture(t);
  const fetchImpl = async () => assert.fail("Invalid verification inputs must not fetch.");
  await assert.rejects(verifyDeployment(options({ manifest, expectedSha: "b".repeat(40), fetchImpl })), /trusted expected commit/);
  await assert.rejects(verifyDeployment(options({ manifest: { ...manifest, pages: manifest.pages.slice(0, 2) }, fetchImpl })), /three expected pages/);
  await assert.rejects(verifyDeployment(options({ manifest, baseUrl: "https://example.test/tracker/?redirect=elsewhere", fetchImpl })), /base URL/);
  assert.throws(() => createDeploymentManifest({ dist, commitSha: "master" }), /40-character/);
  rmSync(join(dist, "forecast-report.html"));
  assert.throws(() => createDeploymentManifest({ dist, commitSha }), /ENOENT/);
});

test("CI covers all browsers while Pages verification consumes the same run's trusted artifact", () => {
  const ci = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  const deploy = readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");
  assert.match(ci, /browser: \[chromium, firefox, webkit\]/);
  assert.match(ci, /PLAYWRIGHT_BROWSER: \$\{\{ matrix.browser \}\}/);
  assert.match(deploy, /verify:\s+needs: \[build, deploy\]/);
  assert.equal((deploy.match(/name: deployment-expected-\$\{\{ github.run_id \}\}/g) || []).length, 2);
  assert.ok(deploy.indexOf("--create --dist dist") < deploy.indexOf("Upload the built site"));
  assert.match(deploy, /--sha "\$GITHUB_SHA" --url "\$PAGE_URL"/);
  assert.doesNotMatch(deploy, /npm install|playwright install|run-id:/);
});
