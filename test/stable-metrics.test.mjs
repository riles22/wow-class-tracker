import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseMurlok, parseMythicstats, STABLE_SERIES, metricKey } from "../src/stable-metric-parsers.mjs";
import { collectStableMetrics, fetchMetricPage, runStableMetrics, STABLE_URLS, digest } from "../src/fetch-stable-metrics.mjs";
import { checkStableMetrics } from "../src/check-stable-metrics.mjs";

// Only taxonomy comes from the project. Receipt tests must not start failing when
// tomorrow's real metrics are newer than these deliberately frozen fixtures.
const roster = JSON.parse(await readFile(new URL("../data/specs.json", import.meta.url), "utf8"))
  .map(({ class: className, spec, role, playstyle }) => ({ class: className, spec, role, playstyle, metrics: [] }));
const checkedAt = "2026-09-05T23:00:00.000Z", now = new Date("2026-09-05T23:10:00.000Z");
const fixtures = Object.fromEntries(await Promise.all(["murlok-dps", "murlok-healer", "murlok-tank", "mythicstats-1079"].map(async id => [id, await readFile(new URL(`./fixtures/stable-metrics/${id}.html`, import.meta.url), "utf8")])));
const options = { roster, liveSeason: "s2", checkedAt };
const mythicOptions = { ...options, finalUrl: "https://mythicstats.com/period/1079" };
const baselineRows = [
  ...["DPS", "Healer", "Tank"].flatMap(role => parseMurlok(fixtures[`murlok-${role.toLowerCase()}`], { ...options, role }).rows),
  ...parseMythicstats(fixtures["mythicstats-1079"], mythicOptions).rows,
  // Synthetic retained zero exercises the source's real missing-Fire entry.
  { class: "Mage", spec: "Fire", source: "mythicstats", bracket: "mplus", ...STABLE_SERIES.mythicstats, value: 0, asOf: "2026-09-04" },
];
for (const row of baselineRows) {
  const { class: _class, spec: _spec, ...metric } = row;
  roster.find(s => metricKey(s) === metricKey(row)).metrics.push(metric);
}
const fixtureFor = url => url.includes("murlok") ? fixtures[`murlok-${url.split("/")[4]}`] : fixtures["mythicstats-1079"];
const fakeFetch = async url => url.endsWith("/latest") ? new Response(null, { status: 302, headers: { location: "/period/1079" } }) : new Response(fixtureFor(url));
const collect = (extras = {}) => collectStableMetrics({ ...options, fetchImpl: fakeFetch, pause: async () => {}, ...extras });
function mergeRows(baseline, updates) {
  const result = structuredClone(baseline);
  for (const row of updates.metrics) {
    const spec = result.find(s => metricKey(s) === metricKey(row));
    const { class: _class, spec: _spec, ...metric } = row;
    const i = spec.metrics.findIndex(m => m.source === row.source && m.bracket === row.bracket && m.name === row.name);
    if (i < 0) spec.metrics.push(metric); else spec.metrics[i] = metric;
  }
  return result;
}
const verify = (result, extras = {}) => checkStableMetrics({ baseline: roster, current: mergeRows(roster, result.updates), ...result, now, liveSeason: "s2", ...extras });
function rebind(result) {
  result.evidence.updatesSha256 = digest(result.updates);
  for (const id of Object.keys(STABLE_SERIES)) if (result.evidence.sources[id].status === "success") result.evidence.sources[id].metricsSha256 = digest(result.updates.metrics.filter(r => r.source === id));
  return result;
}

test("Murlok recorded fixtures parse all 27/7/6 specs including Devourer", () => {
  const rows = [];
  for (const role of ["DPS", "Healer", "Tank"]) {
    const parsed = parseMurlok(fixtures[`murlok-${role.toLowerCase()}`], { ...options, role });
    assert.equal(parsed.sourceAsOf, "2026-09-02"); rows.push(...parsed.rows);
  }
  assert.equal(rows.length, 40); assert.equal(new Set(rows.map(metricKey)).size, 40);
  assert.ok(rows.some(r => r.class === "Demon Hunter" && r.spec === "Devourer"));
  assert.ok(rows.every(r => r.name.endsWith("(ceiling)") && r.unit === "rating" && !("n" in r)));
});

test("Murlok href-first/class-first and quote/whitespace changes cannot drop the top spec", () => {
  for (const role of ["DPS", "Healer", "Tank"]) {
    const html = fixtures[`murlok-${role.toLowerCase()}`];
    const reordered = html.replace(/<a class="([^"]*)" href="([^"]*)">/g, "<a href='$2'\n class='$1'>");
    assert.deepEqual(parseMurlok(reordered, { ...options, role }), parseMurlok(html, { ...options, role }));
  }
});

test("Murlok requires machine time, full role coverage, exact identity and current season", () => {
  const html = fixtures["murlok-dps"], parse = h => parseMurlok(h, { ...options, role: "DPS" });
  assert.throws(() => parse(html.replace(/ datetime="[^"]+"/, "")), /timestamp/);
  assert.throws(() => parse(html.replace(/2026-09-02/g, "2026-09-06")), /timestamp/);
  assert.throws(() => parse(html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/, "")), /Partial/);
  assert.throws(() => parse(html.replace('href="/warrior/arms/m+"', 'href="/mage/fire/m+"')), /mismatch/);
  assert.throws(() => parse(html.replace(/Season 2/g, "Season 1")), /season/);
  assert.throws(() => parse(html.replace(/>\s*3657\s*</, ">pending<")), /Malformed/);
  assert.throws(() => parse("<title>Just a moment...</title>"), /verification/);
});

test("Mythicstats reads bounded shares, not repeated charts or taller bar percentages", () => {
  const parsed = parseMythicstats(fixtures["mythicstats-1079"], mythicOptions);
  assert.equal(parsed.rows.length, 39); assert.equal(parsed.sum, 99.9);
  assert.deepEqual(parsed.roleCounts, { DPS: 26, Tank: 6, Healer: 7 });
  assert.deepEqual(parsed.omittedSpecs, ["Mage|Fire"]);
  assert.equal(parsed.rows.find(r => r.class === "Mage" && r.spec === "Arcane").value, 12.6);
  assert.equal(parsed.sourceAsOf, null); assert.equal(parsed.dateBasis, "observed-undated-source");
  const decoy = '<section><h2>Classes and specs</h2><li><img alt="arcane mage"><span class="mt-1">87</span></li></section>';
  assert.deepEqual(parseMythicstats(fixtures["mythicstats-1079"] + decoy, mythicOptions), parsed);
});

test("Mythicstats normalizes hyphenated spec/class labels and optional numeric whitespace", () => {
  const html = fixtures["mythicstats-1079"];
  const changed = html.replace(/alt="([^"]*)"/g, (_, label) => `alt='${label.replace(/ /g, "-")}'`).replace(/<span class="mt-1">\s*(\d+(?:\.\d+)?)\s*<\/span>/g, '<span class="mt-1">$1</span>');
  assert.deepEqual(parseMythicstats(changed, mythicOptions), parseMythicstats(html, mythicOptions));
});

test("Mythicstats preserves published timestamps when available and rejects future ones", async () => {
  const html = fixtures["mythicstats-1079"];
  const parsed = parseMythicstats(html, { ...mythicOptions, publishedAt: "2026-09-05T12:00:00Z" });
  assert.equal(parsed.sourceAsOf, "2026-09-05"); assert.equal(parsed.dateBasis, "source-last-modified");
  const timestamped = html + '<time datetime="2026-09-05T12:00:00Z">Updated yesterday</time>';
  assert.equal(parseMythicstats(timestamped, mythicOptions).dateBasis, "source-time-datetime");
  assert.throws(() => parseMythicstats(html, { ...mythicOptions, publishedAt: "2026-09-05T23:30:00Z" }), /future/);
  const result = await collect({ fetchImpl: async url => url.endsWith("/period/1079") ? new Response(timestamped) : fakeFetch(url) });
  assert.deepEqual(verify(result), []);
});

test("Mythicstats rejects changed HTML, missing positive shares, wrong period/season and presence values", () => {
  const html = fixtures["mythicstats-1079"], parse = h => parseMythicstats(h, mythicOptions);
  assert.throws(() => parse(html.replace('class="mt-1"', 'class="changed"')), /Malformed/);
  assert.throws(() => parse(html.replace(/<li\b[^>]*>[\s\S]*?<\/li>/, "")), /printed share/);
  assert.throws(() => parse(html.replace(/MID2/g, "MID1")), /season/);
  assert.throws(() => parse(html.replace(/Period 1079/g, "Period 1078")), /period/);
  assert.throws(() => parse(html.replace(/Spec representation in top keys/g, "Meta presence")), /section/);
  assert.throws(() => parse(html.replace(/>\s*12\.6\s*</, ">87.0<")), /printed share/);
  assert.throws(() => parse(html.replace(/Top 2000 keys/g, "Top 100 keys")), /population/);
});

test("collector keeps source time and unchanged undated observations; genuine absence remains absent", async () => {
  const result = await collect();
  assert.equal(result.updates.metrics.length, 79);
  assert.equal(result.evidence.sources.murlok.status, "success");
  assert.equal(result.evidence.sources.murlok.sourceAsOf, "2026-09-02");
  assert.equal(result.evidence.sources.mythicstats.status, "success");
  assert.ok(!result.updates.metrics.some(r => r.source === "mythicstats" && metricKey(r) === "Mage|Fire"));
  assert.deepEqual(verify(result), []);
  const old = structuredClone(roster);
  for (const spec of old) for (const row of spec.metrics) if (row.source === "mythicstats") row.asOf = "2026-08-30";
  const aged = await collect({ roster: old });
  for (const row of aged.updates.metrics.filter(r => r.source === "mythicstats")) {
    const previous = old.find(s => metricKey(s) === metricKey(row)).metrics.find(m => m.source === "mythicstats");
    assert.equal(row.asOf, previous.value === row.value ? "2026-08-30" : "2026-09-05");
  }
  assert.deepEqual(verify(aged, { baseline: old, current: mergeRows(old, aged.updates) }), []);
});

test("missing previously nonzero Mythicstats share holds the whole provider atomically", async () => {
  const baseline = structuredClone(roster);
  baseline.find(s => s.class === "Mage" && s.spec === "Fire").metrics.find(m => m.source === "mythicstats").value = 1.5;
  const result = await collect({ roster: baseline });
  assert.equal(result.evidence.sources.mythicstats.status, "partial");
  assert.match(result.evidence.sources.mythicstats.details, /nonzero/);
  assert.equal(result.updates.metrics.length, 40);
  assert.deepEqual(verify(result, { baseline, current: mergeRows(baseline, result.updates) }), []);
});

test("individual provider failure and a half-landed weekly period leave prior rows intact", async () => {
  const result = await collect({ fetchImpl: async url => url.includes("murlok") ? new Response("blocked", { status: 403 }) : fakeFetch(url) });
  assert.equal(result.evidence.sources.murlok.status, "unreachable");
  assert.equal(result.evidence.sources.mythicstats.status, "success");
  assert.deepEqual(verify(result), []);
  const bad = mergeRows(roster, result.updates);
  bad[0].metrics.find(m => m.source === "murlok").asOf = "2026-09-05";
  assert.match(verify(result, { current: bad }).join(), /unchanged/);
  const pending = await collect({ fetchImpl: async url => url.endsWith("/period/1079") ? new Response("not found", { status: 404 }) : fakeFetch(url) });
  assert.equal(pending.evidence.sources.mythicstats.status, "pending");
  assert.equal(pending.updates.metrics.length, 40); assert.deepEqual(verify(pending), []);
});

test("fetch transport bounds retries, response bytes, body deadlines and redirect origin", async () => {
  let calls = 0;
  const retry = await fetchMetricPage(STABLE_URLS.murlok[0].url, { fetchImpl: async () => { calls++; return new Response("later", { status: 503 }); }, pause: async () => {} });
  assert.equal(calls, 2); assert.equal(retry.httpStatus, 503);
  const large = await fetchMetricPage(STABLE_URLS.murlok[0].url, { fetchImpl: async () => new Response("0123456789"), maxBytes: 5 });
  assert.match(large.error, /size limit/); assert.equal(large.attempts, 1);
  const redirect = await fetchMetricPage(STABLE_URLS.murlok[0].url, { fetchImpl: async () => new Response(null, { status: 302, headers: { location: "https://example.invalid/" } }) });
  assert.match(redirect.error, /redirect/); assert.equal(redirect.attempts, 1);
  const stalled = await fetchMetricPage(STABLE_URLS.murlok[0].url, { fetchImpl: async () => new Response(new ReadableStream({ start() {} })), timeoutMs: 10, pause: async () => {} });
  assert.match(stalled.error, /deadline/); assert.equal(stalled.attempts, 2);
});

test("trusted checker rejects stale/future evidence, tuple/digest tampering and unlanded collected rows", async () => {
  const result = await collect();
  assert.match(verify(result, { now: new Date("2026-09-07") }).join(), /stale/);
  assert.match(verify(result, { now: new Date("2026-09-04") }).join(), /future/);
  const altered = structuredClone(result); altered.updates.metrics[0].value++;
  assert.match(verify(altered).join(), /trusted receipt/);
  const wrong = structuredClone(result); wrong.updates.metrics[0].unit = "%"; rebind(wrong);
  assert.match(verify(wrong).join(), /tuple/);
  const unlanded = mergeRows(roster, result.updates); unlanded[0].metrics.find(m => m.source === "murlok").value++;
  assert.match(verify(result, { current: unlanded }).join(), /canonical data differs/);
});

test("optional manifest cannot claim success for failed collection even while stored rows are fresh", async () => {
  const result = await collect({ fetchImpl: async url => url.includes("mythicstats") ? new Response("blocked", { status: 403 }) : fakeFetch(url) });
  assert.equal(result.evidence.sources.mythicstats.status, "unreachable");
  assert.ok(roster.some(s => s.metrics.some(m => m.source === "mythicstats" && m.asOf === "2026-09-05")));
  assert.deepEqual(verify(result), []); // Partial local runs intentionally omit the old manifest.
  const manifest = { sources: [{ source: "murlok", result: "partial" }, { source: "mythicstats", result: "success" }] };
  assert.match(verify(result, { manifest }).join(), /mythicstats: manifest claims success.*unreachable/);
  manifest.sources[1].result = "unreachable";
  assert.deepEqual(verify(result, { manifest }), []); // Successful Murlok parse still permits stale/partial.
  assert.match(verify(result, { manifest: { sources: manifest.sources.slice(0, 1) } }).join(), /exactly one/);
  assert.match(verify(result, { manifest: { sources: [...manifest.sources, manifest.sources[0]] } }).join(), /exactly one/);
  assert.match(verify(result, { manifest: null }).join(), /must contain source rows/);
});

test("trusted checker will not accept redated source-owned values, redated unchanged values, or role forgery", async () => {
  const result = await collect();
  const redated = structuredClone(result);
  redated.updates.metrics.filter(r => r.source === "murlok").forEach(r => r.asOf = "2026-09-05");
  redated.evidence.sources.murlok.metricAsOf = { oldest: "2026-09-05", newest: "2026-09-05" }; rebind(redated);
  assert.match(verify(redated).join(), /source-owned date/);
  const wrongRoles = structuredClone(result); wrongRoles.evidence.sources.mythicstats.roleTotals.Tank = 87;
  assert.match(verify(wrongRoles).join(), /role subtotals/);
  const wrongBaseline = structuredClone(result); wrongBaseline.evidence.sources.murlok.baselineSha256 = "0".repeat(64);
  assert.match(verify(wrongBaseline).join(), /baseline/);
});

test("collector writes isolated files only, with a receipt bound to the updates", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "stable-metrics-test-"));
  await mkdir(path.join(root, "data")); const original = JSON.stringify(roster); await writeFile(path.join(root, "data/specs.json"), original);
  await runStableMetrics({ root, checkedAt, liveSeason: "s2", fetchImpl: fakeFetch, pause: async () => {} });
  assert.equal(await readFile(path.join(root, "data/specs.json"), "utf8"), original);
  const evidence = JSON.parse(await readFile(path.join(root, "metrics-fetch/evidence.json"), "utf8"));
  const updates = JSON.parse(await readFile(path.join(root, "metrics-fetch/updates.json"), "utf8"));
  assert.equal(evidence.updatesSha256, digest(updates)); assert.deepEqual(verify({ evidence, updates }), []);
});
