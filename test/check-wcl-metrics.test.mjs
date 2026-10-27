import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { checkWclMetrics, storedWclRows, wclDigest } from "../src/check-wcl-metrics.mjs";
import { LIVE_LEADERBOARDS, expectedMetricName, leaderboardCeiling } from "../src/wcl-live.mjs";
import { PHASES } from "../src/normalize.mjs";
import { createWclCoverage } from "../src/wcl-coverage.mjs";
import { loadData, validateData } from "../src/validate.mjs";

const roster = JSON.parse(await readFile(new URL("../data/specs.json", import.meta.url), "utf8"))
  .map(({ class: cls, spec, role }) => ({ class: cls, spec, role, metrics: [] }));
const NOW = new Date("2026-09-05T12:00:00Z");
const same = (a, b) => a.class === b.class && a.spec === b.spec && a.bracket === b.bracket && a.name === b.name;
function merge(baseline, updates) {
  const result = structuredClone(baseline);
  for (const { class: cls, spec, ...metric } of updates.metrics) {
    const target = result.find(s => s.class === cls && s.spec === spec);
    const at = target.metrics.findIndex(m => m.source === metric.source && m.bracket === metric.bracket && m.name === metric.name);
    if (at < 0) target.metrics.push(structuredClone(metric)); else target.metrics[at] = structuredClone(metric);
  }
  return result;
}
function fixture() {
  const baseline = structuredClone(roster), updates = { metrics: [] }, brackets = {}, landed = {};
  baseline[0].ptrDummy = { source: "warcraftlogs", asOf: "2026-08-18", targets: { "1": 100, "3": 200 } };
  baseline[0].metrics.push({ source: "warcraftlogs", bracket: "raid", name: "Historical population median fixture", value: 777, unit: "DPS", n: 1000, asOf: "2026-07-01" });
  for (const cfg of LIVE_LEADERBOARDS.brackets) {
    const cuts = [];
    for (const encounter of cfg.encounters) for (const spec of roster) {
      const metric = spec.role === "Healer" ? "hps" : "dps";
      const sample = { kind: "leaderboard-entries", cap: 100, metric, zoneId: cfg.zoneId, encounterId: encounter.id,
        partition: cfg.partition, difficulty: cfg.difficulty, size: cfg.size,
        ...(cfg.keystoneLevel ? { keystoneLevel: cfg.keystoneLevel } : {}), observedAt: "2026-09-05T11:59:30.000Z",
        oldestRun: "2026-08-19T10:00:00.000Z", newestRun: "2026-09-04T10:00:00.000Z", hasMorePages: true };
      const row = { class: spec.class, spec: spec.spec, source: "warcraftlogs", bracket: cfg.bracket,
        name: expectedMetricName(cfg, encounter, metric), value: 1000 + cuts.length, n: 100, unit: metric.toUpperCase(), era: "live", asOf: "2026-09-04", sample };
      updates.metrics.push(row);
      cuts.push({ class: spec.class, spec: spec.spec, encounterId: encounter.id, status: "success", samples: row.n,
        value: row.value, metric, asOf: row.asOf, observedAt: sample.observedAt, oldestRun: sample.oldestRun, newestRun: sample.newestRun, hasMorePages: sample.hasMorePages });
    }
    brackets[cfg.key] = { status: "success", rows: cuts.length, cuts, discoveryVerified: true };
    landed[cfg.key] = { rows: cuts.length };
  }
  // Previously landed leaderboard rows must survive a later sparse/failed cut.
  const { class: cls, spec, ...old } = updates.metrics[0];
  baseline[0].metrics.push({ ...structuredClone(old), value: 500, asOf: "2026-09-03",
    sample: { ...old.sample, observedAt: "2026-09-04T11:00:00.000Z", newestRun: "2026-09-03T10:00:00.000Z" } });
  const evidence = { schemaVersion: 2, attemptedAt: "2026-09-05T11:59:00.000Z", liveSeason: PHASES.liveSeason,
    baselineSha256: wclDigest(storedWclRows(baseline)), updatesSha256: wclDigest(updates), brackets, landed, verdict: "success" };
  return { baseline, updates, evidence, current: merge(baseline, updates), now: NOW,
    manifest: { sources: [ ...LIVE_LEADERBOARDS.brackets.map(c => ({ source: c.key, result: "success" })),
      { source: "wcl-live-raid", result: "unreachable" }, { source: "wcl-live-mplus", result: "unreachable" } ] } };
}
const currentRow = (f, row = f.updates.metrics[0]) => f.current.find(s => s.class === row.class && s.spec === row.spec).metrics.find(m => m.source === row.source && m.bracket === row.bracket && m.name === row.name);
function reseal(f) { f.evidence.updatesSha256 = wclDigest(f.updates); f.current = merge(f.baseline, f.updates); }
// Drops every update row the predicate picks and records its cut as `status` instead.
function omitWhere(f, predicate, status = "unreachable") {
  const removed = f.updates.metrics.filter(predicate);
  f.updates.metrics = f.updates.metrics.filter(row => !removed.includes(row));
  for (const row of removed) {
    const cfg = LIVE_LEADERBOARDS.brackets.find(c => c.bracket === row.bracket), receipt = f.evidence.brackets[cfg.key];
    const cut = receipt.cuts.find(c => c.class === row.class && c.spec === row.spec && c.encounterId === row.sample.encounterId);
    Object.assign(cut, { status, samples: status === "sparse" ? 5 : 0 });
    delete cut.value; delete cut.asOf;
    receipt.rows--; receipt.status = "partial";
    f.evidence.landed[cfg.key].rows--; f.evidence.verdict = "partial";
    f.manifest.sources.find(s => s.source === cfg.key).result = "partial";
  }
  reseal(f);
  return removed;
}
const omitFirst = (f, status) => omitWhere(f, (_, i) => i === 0, status)[0];
const reject = (f, pattern) => assert.match(checkWclMetrics(f).join("\n"), pattern);

test("WCL gate binds the public coverage summary to the independent receipt", () => {
  const f = fixture(); f.coverage = createWclCoverage(f.evidence, f.baseline);
  assert.deepEqual(checkWclMetrics(f), []);
  f.coverage.cuts[0].status = "failed";
  reject(f, /Public WCL coverage differs/);
});

test("WCL gate accepts exact trusted updates and retains the legacy archive without mutating inputs", () => {
  const f = fixture(), before = JSON.stringify(f);
  assert.deepEqual(checkWclMetrics(f), []);
  const originalOrder = f.baseline.flatMap(s => s.metrics.filter(m => m.source === "warcraftlogs").map(m => ({ class: s.class, spec: s.spec, ...m })));
  assert.equal(wclDigest(storedWclRows(f.baseline)), wclDigest(originalOrder), "owner binding must preserve hashes of already-collected legitimate baselines");
  assert.equal(JSON.stringify(f), before);
  assert.deepEqual(f.current[0].metrics[0], f.baseline[0].metrics[0]);
});

test("WCL gate rejects tampered canonical values, sample dates, labels and extra rows", () => {
  for (const mutate of [
    m => m.value++, m => m.asOf = "2026-09-05", m => m.name += " altered",
    m => m.sample.observedAt = "2026-09-05T11:59:59.000Z", m => m.sample.metric = "rdps",
  ]) {
    const f = fixture(); mutate(currentRow(f));
    reject(f, /Canonical WCL rows differ/);
  }
  const added = fixture(); added.current[0].metrics.push({ ...added.current[0].metrics[0], name: "Unreceipted measurement" });
  reject(added, /Canonical WCL rows differ/);
});

test("WCL update ceiling derives from the reviewed recipe (680 today) and refuses one row more", () => {
  assert.equal(leaderboardCeiling(roster.length), 680);
  const f = fixture(); assert.equal(f.updates.metrics.length, 680);
  f.updates.metrics.push(structuredClone(f.updates.metrics.at(-1))); reseal(f);
  reject(f, /WCL updates differ from the trusted receipt/);
  // One more reviewed encounter moves the ceiling with it; no literal to forget. The gate
  // itself must accept the full 720-row collection, which a restated 680 would refuse.
  const raid = LIVE_LEADERBOARDS.brackets.find(c => c.bracket === "raid");
  raid.encounters.push({ id: 999999, name: "Fixture encounter" });
  try {
    assert.equal(leaderboardCeiling(roster.length), 720);
    const wider = fixture(); assert.equal(wider.updates.metrics.length, 720);
    assert.deepEqual(checkWclMetrics(wider), []);
    wider.updates.metrics.push(structuredClone(wider.updates.metrics.at(-1))); reseal(wider);
    reject(wider, /WCL updates differ from the trusted receipt/);
  } finally { raid.encounters.pop(); }
  assert.equal(leaderboardCeiling(roster.length), 680);
});

test("new WCL updates must come from the pinned partition, even one validation would accept as reviewed", () => {
  const raid = LIVE_LEADERBOARDS.brackets.find(c => c.bracket === "raid"), next = raid.partition + 1;
  raid.reviewedPartitions.push({ id: next, name: "fixture partition" });
  try {
    const f = fixture(), row = f.updates.metrics.find(m => m.bracket === "raid");
    row.sample.partition = next; reseal(f);
    reject(f, /Invalid WCL leaderboard tuple, value, sample, or provenance/);
  } finally { raid.reviewedPartitions.pop(); }
});

test("WCL gate rejects updates whose payload hash or cut receipt differs", () => {
  const changed = fixture(); changed.updates.metrics[0].value++;
  reject(changed, /updates differ from the trusted receipt/);
  reseal(changed);
  reject(changed, /metric differs from its cut receipt/);
});

test("WCL gate independently validates metric names, roles and source-time provenance", () => {
  for (const mutate of [
    m => m.name = m.name.replace("median DPS", "median HPS"),
    m => m.era = "ptr", m => m.sample.metric = "rdps",
    m => m.asOf = "2026-09-05", m => m.sample.oldestRun = "2026-07-01T00:00:00.000Z",
    m => m.sample.observedAt = "2026-09-05T12:00:01.000Z",
    m => m.sample.newestRun = "2026-09-06T00:00:00.000Z",
    m => m.sample.observedAt = "2026-09-05T11:59:30.000+00:00",
    m => m.sample.oldestRun = "2026-08-19T10:00:00.000+00:00",
    m => m.sample.newestRun = "2026-09-04T10:00:00.000+00:00",
    m => { m.n = 99; m.sample.hasMorePages = true; },
  ]) {
    const f = fixture(); mutate(f.updates.metrics[0]); reseal(f);
    reject(f, /Invalid WCL leaderboard/);
  }
});

/* Skipped zero-amount entries (wcl-live.mjs readCut, 2026-10-27) sat on the returned page,
   so n + zeroAmountEntries is the page size: at most 100, and exactly 100 when WCL said more
   pages follow. The row and its cut receipt must agree on the count. */
function withZeroes(f, shape) {
  // An explicit cutZeroes: undefined means the receipt lacks the count, so no destructuring default.
  const { n, zeroes, hasMorePages } = shape, cutZeroes = Object.hasOwn(shape, "cutZeroes") ? shape.cutZeroes : zeroes;
  const row = f.updates.metrics[0], cfg = LIVE_LEADERBOARDS.brackets.find(c => c.bracket === row.bracket);
  const cut = f.evidence.brackets[cfg.key].cuts.find(c => c.class === row.class && c.spec === row.spec && c.encounterId === row.sample.encounterId);
  row.n = cut.samples = n; row.sample.hasMorePages = cut.hasMorePages = hasMorePages;
  if (zeroes === undefined) delete row.sample.zeroAmountEntries; else row.sample.zeroAmountEntries = zeroes;
  if (cutZeroes === undefined) delete cut.zeroAmountEntries; else cut.zeroAmountEntries = cutZeroes;
  reseal(f);
  return f;
}

test("WCL gate accepts counted zero-amount entries only when they fit the returned page and match the receipt", () => {
  assert.deepEqual(checkWclMetrics(withZeroes(fixture(), { n: 95, zeroes: 5, hasMorePages: true })), []);
  assert.deepEqual(checkWclMetrics(withZeroes(fixture(), { n: 27, zeroes: 3, hasMorePages: false })), []);
  for (const shape of [
    { n: 96, zeroes: 5, hasMorePages: true }, { n: 94, zeroes: 5, hasMorePages: true },
    { n: 98, zeroes: 3, hasMorePages: false }, { n: 95, zeroes: 0, hasMorePages: false },
    { n: 27, zeroes: 2.5, hasMorePages: false }, { n: 27, zeroes: "3", hasMorePages: false },
  ]) reject(withZeroes(fixture(), shape), /Invalid WCL leaderboard tuple, value, sample, or provenance/);
  reject(withZeroes(fixture(), { n: 95, zeroes: 5, hasMorePages: true, cutZeroes: undefined }), /metric differs from its cut receipt/);
  reject(withZeroes(fixture(), { n: 27, zeroes: 3, hasMorePages: false, cutZeroes: 4 }), /metric differs from its cut receipt/);
  reject(withZeroes(fixture(), { n: 100, zeroes: undefined, hasMorePages: true, cutZeroes: 5 }), /metric differs from its cut receipt/);
});

test("WCL gate retains failed and sparse cuts exactly, without blocking successful cuts", () => {
  for (const status of ["unreachable", "invalid", "sparse"]) {
    const f = fixture(), omitted = omitFirst(f, status);
    assert.deepEqual(checkWclMetrics(f), []);
    assert.equal(currentRow(f, omitted).value, 500);
    currentRow(f, omitted).value++;
    reject(f, /failed\/sparse cuts and historical data must be retained exactly/);
    f.current = merge(f.baseline, f.updates);
    const target = f.current.find(s => s.class === omitted.class && s.spec === omitted.spec);
    target.metrics = target.metrics.filter(m => !same({ ...m, class: target.class, spec: target.spec }, omitted));
    reject(f, /Canonical WCL rows differ/);
  }
});

/* Partition-switch retirement (fetch-wcl.mjs partitionRetirements, owner decision
   2026-10-27): baseline[0]'s stored raid row sits on the older reviewed partition, its cut
   came back `status` on the pin, and the rest of its (Tank) pool refreshed. */
const RAID = LIVE_LEADERBOARDS.brackets.find(c => c.bracket === "raid");
const rehash = f => { f.evidence.updatesSha256 = wclDigest(f.updates); return f; };
function retireFixture(status = "sparse") {
  const f = fixture(), gone = omitFirst(f, status), owner = f.baseline[0];
  owner.metrics.find(m => same({ ...m, class: owner.class, spec: owner.spec }, gone)).sample.partition = 1;
  f.evidence.baselineSha256 = wclDigest(storedWclRows(f.baseline));
  f.updates.retire = [{ class: gone.class, spec: gone.spec, source: gone.source, bracket: gone.bracket, name: gone.name }];
  f.evidence.retired = { [RAID.key]: { rows: 1 } };
  reseal(f);
  const target = f.current.find(s => s.class === gone.class && s.spec === gone.spec);
  target.metrics = target.metrics.filter(m => !same({ ...m, class: target.class, spec: target.spec }, gone));
  return f;
}

test("WCL gate accepts a sealed partition-switch retirement of an old-partition row whose cut WCL answered sparse or invalid", () => {
  assert.equal(retireFixture().baseline[0].metrics.at(-1).sample.partition, 1, "fixture retires an old-partition row");
  for (const status of ["sparse", "invalid"]) assert.deepEqual(checkWclMetrics(retireFixture(status)), []);
  // The public summary stays bound to the receipt: the retired cut reads as a cut, never as a kept value.
  const covered = retireFixture(); covered.coverage = createWclCoverage(covered.evidence, covered.baseline);
  assert.deepEqual(checkWclMetrics(covered), []);
  assert.equal(covered.coverage.cuts.find(c => c.class === covered.baseline[0].class && c.spec === covered.baseline[0].spec
    && c.bracket === "raid" && c.encounterId === RAID.encounters[0].id).status, "insufficient");
});

test("WCL gate refuses every partition retirement it cannot tie to an old row, a refreshed pool and an answered cut", () => {
  const bad = /Invalid WCL partition retirement/;
  reject(retireFixture("unreachable"), bad); // may still answer tomorrow; the merge refuses and WCL holds
  const pinned = retireFixture(); pinned.baseline[0].metrics.at(-1).sample.partition = RAID.partition;
  pinned.evidence.baselineSha256 = wclDigest(storedWclRows(pinned.baseline));
  reject(pinned, bad);
  for (const change of [
    entry => entry.name = "Historical population median fixture", // not a leaderboard row
    entry => entry.name += " (not stored)", entry => entry.source = "mythicstats", entry => entry.value = 1,
  ]) {
    const f = retireFixture(); change(f.updates.retire[0]); reject(rehash(f), bad);
  }
  const twice = retireFixture(); twice.updates.retire.push({ ...twice.updates.retire[0] }); twice.evidence.retired[RAID.key].rows = 2;
  reject(rehash(twice), bad);
  // Same series name, but only the DPS pool refreshed; the Tank pool held whole, so nothing in it may go.
  const held = retireFixture(), role = s => roster.find(r => r.class === s.class && r.spec === s.spec).role;
  const gone = held.updates.retire[0];
  omitWhere(held, row => row.bracket === "raid" && row.name === gone.name && role(row) === role(gone), "sparse");
  assert.ok(held.updates.metrics.some(row => row.bracket === "raid" && row.name === gone.name), "the DPS pool still refreshed");
  reject(held, bad);
});

test("WCL gate binds partition retirements to the sealed updates, the retired receipt and the canonical rows", () => {
  const unsealed = retireFixture(); unsealed.updates.retire.push({ ...unsealed.updates.retire[0], spec: "Other" });
  reject(unsealed, /WCL updates differ from the trusted receipt/);
  const empty = retireFixture(); empty.updates.retire = []; delete empty.evidence.retired;
  reject(rehash(empty), /WCL updates differ from the trusted receipt/);
  const unreceipted = retireFixture(); delete unreceipted.evidence.retired;
  reject(unreceipted, /wcl-leaderboard-raid: retired receipt does not match the sealed retirements/);
  const overstated = retireFixture(); overstated.evidence.retired[RAID.key].rows = 2;
  reject(overstated, /retired receipt does not match/);
  const stray = retireFixture(); stray.evidence.retired["wcl-live-raid"] = { rows: 0 };
  reject(stray, /WCL retired receipt names an unknown bracket/);
  // A sealed retirement the merge did not carry out leaves the old row in canonical data.
  const kept = retireFixture(); kept.current = merge(kept.baseline, kept.updates);
  reject(kept, /Canonical WCL rows differ/);
  // Without a retirement the old row must be retained exactly, as before.
  const plain = retireFixture(); delete plain.updates.retire; delete plain.evidence.retired;
  reject(rehash(plain), /Canonical WCL rows differ/);
  plain.current = merge(plain.baseline, plain.updates);
  assert.deepEqual(checkWclMetrics(plain), []);
});

/* A refused merge (owner decision 2026-10-27): nothing landed or was retired, so the night
   may publish only with every WCL row held exactly and no manifest success. */
function refusedFixture(f = fixture()) {
  Object.assign(f.evidence, { verdict: "merge-failed", detail: "Collected rows failed canonical validation: fixture", landed: {} });
  for (const s of f.manifest.sources) if (s.source.startsWith("wcl-leaderboard-")) s.result = "parse_error";
  f.current = structuredClone(f.baseline);
  return f;
}

test("a refused WCL merge passes only with every WCL row held exactly and no manifest success", () => {
  assert.deepEqual(checkWclMetrics(refusedFixture()), []);
  const covered = refusedFixture(); covered.coverage = createWclCoverage(covered.evidence, covered.baseline);
  assert.deepEqual(checkWclMetrics(covered), []);
  assert.ok(covered.coverage.cuts.every(c => c.status === "failed"), "the public summary verifies no cut");
  // A sealed retirement is held too: the old row stays and nothing is counted as retired.
  const retiring = refusedFixture(retireFixture()); delete retiring.evidence.retired;
  assert.deepEqual(checkWclMetrics(retiring), []);
  reject(refusedFixture(retireFixture()), /wcl-leaderboard-raid: retired receipt does not match the sealed retirements/);
  const landed = refusedFixture(); landed.current = merge(landed.baseline, landed.updates);
  reject(landed, /The WCL merge was refused, so every canonical WCL row must equal the baseline exactly/);
  const changed = refusedFixture(); changed.current[0].metrics.at(-1).value++;
  reject(changed, /must equal the baseline exactly/);
  const counted = refusedFixture(); counted.evidence.landed = fixture().evidence.landed;
  reject(counted, /coverage\/landed receipt does not match collected rows/);
  const claimed = refusedFixture(); claimed.manifest.sources.find(s => s.source === RAID.key).result = "success";
  reject(claimed, /wcl-leaderboard-raid: the WCL merge was refused, so nothing landed and the manifest cannot claim success/);
  // The refused updates stay bound to their receipt.
  const tampered = refusedFixture(); tampered.updates.metrics[0].value++;
  reject(tampered, /WCL updates differ from the trusted receipt/);
});

test("WCL gate refuses changed legacy rows and relocated metrics with forged ownership", () => {
  const changed = fixture(); changed.current[0].metrics[0].value++;
  reject(changed, /Canonical WCL rows differ/);
  const moved = fixture(), source = moved.current[0];
  const legacy = source.metrics.shift();
  moved.current[1].metrics.push({ ...legacy, class: source.class, spec: source.spec });
  reject(moved, /identity from the enclosing spec/);
});

test("WCL gate preserves every archived ptrDummy value, date and owner", () => {
  for (const mutate of [
    f => f.current[0].ptrDummy.targets["1"]++,
    f => f.current[0].ptrDummy.asOf = "2026-09-05",
    f => delete f.current[0].ptrDummy,
    f => { f.current[1].ptrDummy = f.current[0].ptrDummy; delete f.current[0].ptrDummy; },
    f => f.current[1].ptrDummy = structuredClone(f.current[0].ptrDummy),
  ]) {
    const f = fixture(); mutate(f);
    reject(f, /Historical WCL ptrDummy observations must be retained exactly/);
  }
});

test("canonical validation rejects WCL metric fields that can forge enclosing ownership", async () => {
  const data = await loadData(fileURLToPath(new URL("..", import.meta.url)));
  const target = data.specs.find(s => s.metrics?.some(m => m.source === "warcraftlogs"));
  const metric = target.metrics.find(m => m.source === "warcraftlogs");
  for (const field of ["class", "spec"]) {
    metric[field] = target[field];
    assert.ok(validateData(data, { fullRoster: true }).some(error => /class|spec/.test(error) && /enclosing|identity/.test(error)),
      `embedded ${field} must be rejected even when it currently matches the owner`);
    delete metric[field];
  }
});

test("WCL gate rejects missing and duplicate cut or bracket receipts", () => {
  const cfg = LIVE_LEADERBOARDS.brackets[0];
  const missing = fixture(); missing.evidence.brackets[cfg.key].cuts.pop();
  reject(missing, /coverage\/landed receipt/);
  const duplicated = fixture(); duplicated.evidence.brackets[cfg.key].cuts[1] = structuredClone(duplicated.evidence.brackets[cfg.key].cuts[0]);
  reject(duplicated, /duplicated cut receipt/);
  const bracket = fixture(); delete bracket.evidence.brackets[cfg.key];
  reject(bracket, /missing collection receipt/);
});

test("WCL gate prevents false-green and duplicated manifest claims, including legacy population medians", () => {
  const partial = fixture(); omitFirst(partial);
  partial.manifest.sources[0].result = "success";
  reject(partial, /manifest success needs complete trusted collection/);
  const old = fixture(); old.manifest.sources.find(s => s.source === "wcl-live-raid").result = "success";
  reject(old, /cannot vouch for historical population medians/);
  const duplicated = fixture(); duplicated.manifest.sources.push({ ...duplicated.manifest.sources[0] });
  reject(duplicated, /manifest success needs complete trusted collection/);
  const missing = fixture(); missing.manifest.sources.shift();
  reject(missing, /manifest success needs complete trusted collection/);
});

test("WCL gate rejects wrong baselines, stale/future attempts and wrong seasons", () => {
  for (const mutate of [
    f => f.baseline[0].metrics[0].value++,
    f => f.evidence.baselineSha256 = "0".repeat(64),
    f => f.evidence.attemptedAt = "2026-09-03T00:00:00.000Z",
    f => f.evidence.attemptedAt = "2026-09-06T00:00:00.000Z",
    f => f.evidence.attemptedAt = "2026-09-05T11:59:00.000+00:00",
    f => f.evidence.liveSeason = "unreviewed-next-season",
  ]) { const f = fixture(); mutate(f); reject(f, /bound to a different baseline/); }
});

test("WCL cohort dates may move backwards while the observation clock advances", () => {
  const f = fixture();
  const row = f.updates.metrics[0], cfg = LIVE_LEADERBOARDS.brackets[0];
  row.sample.newestRun = "2026-09-02T10:00:00.000Z"; row.asOf = "2026-09-02";
  const cut = f.evidence.brackets[cfg.key].cuts[0];
  cut.newestRun = row.sample.newestRun; cut.asOf = row.asOf;
  reseal(f);
  assert.deepEqual(checkWclMetrics(f), [], "new top entries can displace the most recent log without making the fetch stale");
});

test("WCL authentication failures authorize only unchanged data and degraded manifest rows", () => {
  const f = fixture();
  f.updates = { metrics: [] }; f.current = structuredClone(f.baseline);
  Object.assign(f.evidence, { verdict: "no-credentials", brackets: {}, landed: {}, updatesSha256: wclDigest(f.updates) });
  f.manifest.sources.forEach(s => s.result = "unreachable");
  assert.deepEqual(checkWclMetrics(f), []);
  f.current[0].metrics[0].asOf = "2026-09-05";
  reject(f, /Canonical WCL rows differ/);
});
