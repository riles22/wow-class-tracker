import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { verdictFor, spacedName, medianOf, buildDummyRawRows, buildPooledRawRows, RAW_RECIPES,
  oauthToken, gql, LIVE_DIAGNOSTICS, probeLiveBrackets } from "../src/fetch-wcl.mjs";
import { checkManifest } from "../src/check-refresh.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* The deterministic WCL fetch stage's verdict mapping — the publish gate and the
   nightly agent both key off these verdicts, so the branches are pinned here.
   Transport deadlines/retries and diagnostic decisions are exercised with injected
   responses below; live upstream health is never a unit-test dependency. */

test("verdictFor: missing credentials", () => {
  const r = verdictFor({ hasCreds: false, oauth: null, transportOk: false, probe: null });
  assert.equal(r.verdict, "no-credentials");
  assert.match(r.detail, /WCL_CLIENT_ID/);
});

test("verdictFor: OAuth rejection", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: false, status: 401 }, transportOk: false, probe: null });
  assert.equal(r.verdict, "oauth-failed");
  assert.match(r.detail, /401/);
});

test("verdictFor: an unreachable OAuth endpoint (status 0) is a transport verdict, not a credential one", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: false, status: 0, error: "ENOTFOUND" }, transportOk: false, probe: null });
  assert.equal(r.verdict, "network-failed");
  assert.match(r.detail, /ENOTFOUND/);
});

test("verdictFor: transport failure after retry", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: false, probe: null });
  assert.equal(r.verdict, "network-failed");
});

test("verdictFor: the standing rdps-family 500 maps to rdps-broken with the upstream error named", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: true,
    probe: { encounterId: 3176, httpStatus: 200, errors: ["Internal server error"], rankings: 0 } });
  assert.equal(r.verdict, "rdps-broken");
  assert.match(r.detail, /3176/);
  assert.match(r.detail, /Internal server error/);
});

test("verdictFor: working rdps maps to rdps-restored (owner decision, still nothing landed)", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: true,
    probe: { encounterId: 3176, httpStatus: 200, errors: [], rankings: 57 } });
  assert.equal(r.verdict, "rdps-restored");
  assert.match(r.detail, /owner decision/);
});

test("verdictFor: no errors and no rankings is inconclusive, treated as transport failure", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: true,
    probe: { encounterId: 3176, httpStatus: 200, errors: [], rankings: 0 } });
  assert.equal(r.verdict, "network-failed");
});

const noPause = async () => {};
const liveVerdict = evidence => verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: true,
  brackets: evidence.brackets });
const diagnosticQuery = ({ metrics = {}, alterZone, alterEncounter } = {}) => {
  const calls = [];
  const query = async (_token, q) => {
    calls.push(q);
    const zoneId = Number(q.match(/zone\(id: (\d+)/)?.[1]);
    const cfg = LIVE_DIAGNOSTICS.brackets.find(c => c.zoneId === zoneId);
    if (cfg) {
      const zone = { id: cfg.zoneId, name: cfg.zoneName, frozen: false,
        partitions: [{ id: cfg.partition, name: cfg.partitionName }],
        difficulties: [{ id: cfg.difficulty, sizes: [cfg.size] }],
        encounters: [{ id: cfg.zoneId * 100, name: "Discovered live encounter" }] };
      alterZone?.(zone);
      return { status: 200, json: { data: { worldData: { zone } } } };
    }
    const encounterId = Number(q.match(/encounter\(id: (\d+)/)?.[1]);
    const spec = LIVE_DIAGNOSTICS.brackets.find(c => c.zoneId * 100 === encounterId);
    assert.ok(spec, "only discovered live encounters may be queried");
    for (const [arg, value] of Object.entries({ partition: spec.partition, difficulty: spec.difficulty, size: spec.size })) {
      assert.ok(q.includes(`${arg}: ${value}`), `explicit ${arg} is required`);
    }
    assert.ok(q.includes("page: 1"), "diagnostics must not paginate");
    const metric = q.match(/metric: (\w+)/)[1];
    assert.ok(["rdps", "dps"].includes(metric));
    const response = metrics[`${spec.bracket}:${metric}`] ?? (metric === "rdps" ? "error" : "working");
    if (response === "transport") return { status: 503, json: null };
    const encounter = { id: encounterId, zone: { id: spec.zoneId },
      characterRankings: response === "error" ? null : { rankings: response === "empty" ? [] : [{ amount: 12345, name: "not retained" }], hasMorePages: true } };
    alterEncounter?.(encounter, metric);
    return { status: 200, json: { data: { worldData: { encounter } },
      ...(response === "error" ? { errors: [{ message: "Internal server error" }] } : {}) } };
  };
  return { query, calls };
};

test("live diagnostics: both current brackets fail rDPS while controls work; no retired zone is queried", async () => {
  const fixture = diagnosticQuery();
  const evidence = await probeLiveBrackets("test-token", { query: fixture.query, pause: noPause });
  assert.deepEqual(Object.values(evidence.brackets).map(b => b.status), ["rdps-broken", "rdps-broken"]);
  assert.equal(fixture.calls.length, 6); // two discoveries, two rDPS, two controls
  assert.equal(evidence.probes.length, 4);
  assert.deepEqual(evidence.landed, {});
  assert.equal(liveVerdict(evidence).verdict, "rdps-broken");
  assert.ok(!JSON.stringify(evidence).includes("test-token"));
  assert.ok(!JSON.stringify(evidence).includes("not retained"));
  assert.ok(!JSON.stringify(evidence).includes("12345"));
});

test("live diagnostics: one recovered bracket raises the compatible notice without claiming both recovered", async () => {
  const fixture = diagnosticQuery({ metrics: { "raid:rdps": "working" } });
  const evidence = await probeLiveBrackets("test-token", { query: fixture.query, pause: noPause });
  assert.equal(evidence.brackets["wcl-live-raid"].status, "recipe-needed");
  assert.equal(evidence.brackets["wcl-live-mplus"].status, "rdps-broken");
  assert.equal(fixture.calls.length, 5); // recovered bracket needs no raw control
  const result = liveVerdict(evidence);
  assert.equal(result.verdict, "rdps-restored");
  assert.match(result.detail, /raid zone 53: recipe-needed/);
  assert.match(result.detail, /mplus zone 55: rdps-broken/);
  assert.deepEqual(evidence.landed, {});
});

test("live diagnostics: working rDPS still cannot vouch for fresh medians at the publish gate", async () => {
  const fixture = diagnosticQuery({ metrics: { "raid:rdps": "working", "mplus:rdps": "working" } });
  const evidence = await probeLiveBrackets("test-token", { query: fixture.query, pause: noPause });
  Object.assign(evidence, liveVerdict(evidence), { attemptedAt: "2026-09-05T15:00:00Z" });
  assert.equal(evidence.verdict, "rdps-restored");
  assert.equal(fixture.calls.length, 4);
  assert.deepEqual(evidence.landed, {});
  assert.deepEqual(RAW_RECIPES, [], "closed PTR recipes cannot land rows during live diagnostics");
  const requirements = LIVE_DIAGNOSTICS.brackets.map(b => ({ key: b.key, evidence: "wcl" }));
  const manifest = { run: "2026-09-05", startedAt: evidence.attemptedAt, summary: "Probe is not a refresh",
    sources: requirements.map(r => ({ source: r.key, result: "success", previousAsOf: null, newAsOf: null })) };
  const checked = checkManifest({ requirements }, manifest, {}, "2026-09-05", evidence);
  assert.equal(checked.errors.filter(e => e.includes("landed no data")).length, 2);
});

test("live diagnostics: failed or empty controls and empty rDPS are inconclusive, not proof of a metric outage", async () => {
  for (const metrics of [{ "raid:dps": "error" }, { "raid:dps": "empty" }, { "raid:rdps": "empty" }]) {
    const fixture = diagnosticQuery({ metrics });
    const evidence = await probeLiveBrackets("test-token", { query: fixture.query, pause: noPause });
    assert.equal(evidence.brackets["wcl-live-raid"].status, "inconclusive");
    assert.equal(liveVerdict(evidence).verdict, "network-failed");
  }
});

test("live diagnostics: rDPS or control transport failure stays separate from upstream metric errors", async () => {
  for (const metric of ["rdps", "dps"]) {
    const fixture = diagnosticQuery({ metrics: { [`raid:${metric}`]: "transport" } });
    const evidence = await probeLiveBrackets("test-token", { query: fixture.query, pause: noPause });
    assert.equal(evidence.brackets["wcl-live-raid"].status, "network-failed");
    assert.equal(evidence.brackets["wcl-live-mplus"].status, "rdps-broken");
    assert.equal(liveVerdict(evidence).verdict, "network-failed");
  }
});

test("live diagnostics: phase, zone, partition, size and encounter identity mismatches fail closed", async () => {
  const future = await probeLiveBrackets("test-token", { phases: { liveSeason: "s3", liveLabel: "12.2" },
    query: async () => assert.fail("phase mismatch must not query old content"), pause: noPause });
  assert.ok(Object.values(future.brackets).every(b => b.status === "configuration-mismatch"));
  for (const alterZone of [z => z.id++, z => z.partitions[0].name = "PTR", z => z.difficulties[0].sizes = [],
    z => z.frozen = true, z => z.encounters = [], z => z.partitions = {}, z => z.difficulties = {}]) {
    const fixture = diagnosticQuery({ alterZone });
    const evidence = await probeLiveBrackets("test-token", { query: fixture.query, pause: noPause });
    assert.ok(Object.values(evidence.brackets).every(b => b.status === "configuration-mismatch"));
    assert.equal(fixture.calls.length, 2);
  }
  const fixture = diagnosticQuery({ alterEncounter: e => e.zone.id = 54 });
  const evidence = await probeLiveBrackets("test-token", { query: fixture.query, pause: noPause });
  assert.ok(Object.values(evidence.brackets).every(b => b.status === "configuration-mismatch"));
  assert.deepEqual(evidence.landed, {});
});

test("live diagnostics: failed discovery does not cascade into guessed encounter probes", async () => {
  let calls = 0;
  const evidence = await probeLiveBrackets("test-token", { query: async () => {
    calls++;
    return { status: 0, json: null };
  }, pause: noPause });
  assert.equal(calls, 2);
  assert.equal(evidence.probes.length, 0);
  assert.ok(Object.values(evidence.brackets).every(b => b.status === "network-failed"));
  const malformed = await probeLiveBrackets("test-token", { query: async () => ({ status: 200,
    json: { errors: { message: "unexpected error shape" } } }), pause: noPause });
  assert.ok(Object.values(malformed.brackets).every(b => b.status === "network-failed"));
  assert.equal(malformed.probes.length, 0);
});

test("WCL transport: transient responses retry once with deadlines; API errors and credential rejections do not retry", async () => {
  let calls = 0;
  const pauses = [];
  const fetchImpl = async (_url, options) => {
    calls++;
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(calls === 1 ? "busy" : '{"data":{"ok":true}}', { status: calls === 1 ? 503 : 200 });
  };
  const r = await gql("not-a-real-token", "{query}", { fetchImpl, pause: async ms => pauses.push(ms) });
  assert.equal(r.status, 200);
  assert.equal(r.attempts, 2);
  assert.deepEqual(pauses, [2000]);
  calls = 0;
  const graphqlError = await gql("not-a-real-token", "{query}", { fetchImpl: async () => {
    calls++;
    return new Response('{"errors":[{"message":"Internal server error"}]}');
  }, pause: noPause });
  assert.equal(calls, 1);
  assert.equal(graphqlError.json.errors.length, 1);
  calls = 0;
  const denied = await oauthToken("id", "secret", { fetchImpl: async () => {
    calls++;
    return new Response("denied", { status: 401 });
  }, pause: noPause });
  assert.equal(calls, 1);
  assert.equal(denied.ok, false);
  assert.equal(denied.status, 401);
  assert.equal(verdictFor({ hasCreds: true, oauth: denied }).verdict, "oauth-failed");
});

test("WCL transport: exhausted network failures remain status zero; missing OAuth tokens never count as success", async () => {
  let calls = 0;
  const options = { fetchImpl: async () => { calls++; throw new Error("request deadline exceeded"); }, pause: noPause };
  const oauth = await oauthToken("id", "secret", options);
  assert.equal(calls, 2);
  assert.equal(oauth.ok, false);
  assert.equal(oauth.status, 0);
  assert.equal(verdictFor({ hasCreds: true, oauth }).verdict, "network-failed");
  calls = 0;
  const response = await gql("token", "{query}", options);
  assert.equal(calls, 2);
  assert.equal(response.status, 0);
  assert.equal(response.json, null);
  const noToken = await oauthToken("id", "secret", { fetchImpl: async () => new Response("{}"), pause: noPause });
  assert.equal(noToken.ok, false);
});

test("WCL transport: the request deadline actually aborts a stalled response and stops after one retry", async () => {
  let calls = 0;
  const r = await gql("token", "{query}", { timeoutMs: 5, pause: noPause,
    fetchImpl: async (_url, { signal }) => {
      calls++;
      return { status: 200, ok: true, text: () => new Promise((_resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("deadline failed to abort body")), 1000);
        signal.addEventListener("abort", () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
      }) };
    } });
  assert.equal(calls, 2);
  assert.equal(r.status, 0);
  assert.match(r.textHead, /timeout/i);
});

/* --- zone-52 raw-DPS median recipe (frozen 2026-07-17) ------------------------------ */

test("spacedName splits API camel-case into roster names without mangling single words", () => {
  assert.equal(spacedName("DemonHunter"), "Demon Hunter");
  assert.equal(spacedName("BeastMastery"), "Beast Mastery");
  assert.equal(spacedName("Devourer"), "Devourer");
  assert.equal(spacedName("Rogue"), "Rogue");
});

test("medianOf: odd takes the middle, even averages the two middles, empty is null", () => {
  assert.equal(medianOf([3, 1, 2]), 2);
  assert.equal(medianOf([4, 1, 3, 2]), 2.5);
  assert.equal(medianOf([]), null);
});

test("buildDummyRawRows: true per-spec medians, roster-filtered, honestly labeled ptr rows", () => {
  const roster = new Set(["Rogue|Outlaw", "Demon Hunter|Devourer"]);
  const byEncounter = [{
    targets: "1",
    rankings: [
      { class: "Rogue", spec: "Outlaw", amount: 100 },
      { class: "Rogue", spec: "Outlaw", amount: 300 },
      { class: "Rogue", spec: "Outlaw", amount: 200 },
      { class: "DemonHunter", spec: "Devourer", amount: 512.4 }, // camel-cased API name
      { class: "Priest", spec: "Holy", amount: 999 },            // healer — not this series' population
      { class: "Rogue", spec: "Outlaw", amount: "garbage" }      // non-finite amount dropped
    ]
  }, {
    targets: "5",
    rankings: [{ class: "Rogue", spec: "Outlaw", amount: 800 }]
  }];
  const rows = buildDummyRawRows(byEncounter, roster, "2026-07-17");
  assert.equal(rows.length, 3);
  const outlaw1 = rows.find(r => r.spec === "Outlaw" && r.name.includes("1T"));
  assert.equal(outlaw1.value, 200); // median of 100/200/300 — garbage excluded
  assert.equal(outlaw1.n, 3);
  assert.equal(outlaw1.bracket, "raid");
  assert.equal(outlaw1.era, "ptr");
  assert.match(outlaw1.name, /Median raw DPS \(12\.1 PTR Dummy Dome, 1T\)/);
  const dev = rows.find(r => r.spec === "Devourer");
  assert.equal(dev.class, "Demon Hunter"); // normalized to the roster name
  assert.equal(dev.value, 512);            // rounded
  assert.ok(!rows.some(r => r.spec === "Holy"));
  assert.equal(rows.find(r => r.name.includes("5T")).value, 800);
});

test("buildPooledRawRows: one row per spec, median over the pool of ALL encounters' entries", () => {
  const roster = new Set(["Rogue|Outlaw"]);
  const rows = buildPooledRawRows([
    { rankings: [{ class: "Rogue", spec: "Outlaw", amount: 100 }, { class: "Rogue", spec: "Outlaw", amount: 200 }] },
    { rankings: [{ class: "Rogue", spec: "Outlaw", amount: 900 }, { class: "Priest", spec: "Holy", amount: 5 }] }
  ], roster, "2026-07-17", "Median raw DPS (12.1 PTR Venomous Abyss, pooled)", "raid");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].value, 200); // pooled 100/200/900 — cross-encounter, not per-encounter
  assert.equal(rows[0].n, 3);
  assert.equal(rows[0].bracket, "raid");
  assert.equal(rows[0].era, "ptr");
});

test("raw series names never match the FROZEN rDPS/normalized requirements' probe patterns", async () => {
  // Regression teeth: if a raw series name matched e.g. "12\\.1 PTR raid testing", its
  // fresh rows would refresh the frozen requirement's coverage date and let a manifest
  // row vouch for the stale series.
  const config = JSON.parse(await readFile(path.join(ROOT, "data", "required-sources.json"), "utf8"));
  /* `req?.` guards the LOOKUP, not just `.date`. Flip-day step 7 removes the six PTR-era WCL
     rows (wcl-ptr-raid, wcl-ptr-mplus, wcl-dummy-dome and the three *-raw keys) from
     data/required-sources.json; two of those keys are named in the frozen list below, so with
     a bare `req.date?.` the helper dies with `TypeError: Cannot read properties of undefined
     (reading 'date')` — verified 2026-08-14 by filtering those keys out of the real contract.
     That would red the flip commit's own `npm test` (runbook step 9) on a retired requirement
     rather than a real defect, and the pre-staged flip test patch does not touch this file.
     A key that no longer exists simply contributes no patterns; the loop below still proves
     the raw names miss every requirement that IS still declared. */
  const patternsOf = key => {
    const req = config.requirements.find(r => r.key === key);
    return [req?.date?.namePattern, req?.rows?.namePattern].filter(Boolean).map(p => new RegExp(p));
  };
  const rawNames = [
    "Median raw DPS (12.1 PTR Dummy Dome, 1T)",
    ...RAW_RECIPES.filter(r => r.name).map(r => r.name)
  ];
  for (const frozen of ["wcl-ptr-raid", "wcl-ptr-mplus", "wcl-live-raid", "wcl-live-mplus"]) {
    for (const rx of patternsOf(frozen)) {
      for (const name of rawNames) {
        assert.ok(!rx.test(name), `${name} must not match ${frozen}'s pattern ${rx}`);
      }
    }
  }
  /* ...and each raw recipe's own requirement DOES match its series name. Guarded on both
     sides, because `[].every(…)` is TRUE: softening the lookup above would otherwise turn
     these three from a loud throw into three silent passes the day those keys retire —
     trading a spurious red for a vacuous green, which is the worse of the two. So skip a key
     that is genuinely gone, and demand a non-empty pattern set for one that is still there. */
  for (const [key, name] of [
    ["wcl-ptr-raid-raw", "Median raw DPS (12.1 PTR Venomous Abyss, pooled)"],
    ["wcl-ptr-mplus-raw", "Median raw DPS (12.1 PTR M+ keys, pooled)"],
    ["wcl-dummy-raw", "Median raw DPS (12.1 PTR Dummy Dome, 3T)"],
  ]) {
    if (!config.requirements.some(r => r.key === key)) continue;   // retired with the PTR lane
    const patterns = patternsOf(key);
    assert.ok(patterns.length, `${key} is still declared, so it must expose a name pattern to match`);
    assert.ok(patterns.every(rx => rx.test(name)), `${key}'s own pattern must match its series name "${name}"`);
  }
});
