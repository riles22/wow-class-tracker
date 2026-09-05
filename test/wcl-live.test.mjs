import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { collectLeaderboards, LIVE_LEADERBOARDS, expectedMetricName } from "../src/wcl-live.mjs";

const roster = JSON.parse(await readFile(new URL("../data/specs.json", import.meta.url), "utf8"))
  .map(({ class: className, spec, role }) => ({ class: className, spec, role }));
const now = new Date("2026-09-05T20:00:00Z");
const phases = { liveSeason: "s2", liveLabel: "12.1", liveSince: "2026-08-18" };
const ok = data => ({ status: 200, json: { data } });
const options = { roster, now, phases, pause: async () => {} };
function zoneOf(cfg) {
  return { id: cfg.zoneId, name: cfg.zoneName, frozen: false,
    partitions: [{ id: cfg.partition, name: cfg.partitionName }], difficulties: [{ id: cfg.difficulty, sizes: [cfg.size] }],
    encounters: [...cfg.encounters, ...cfg.excludedEncounters].map(e => ({ ...e })),
    ...(cfg.bracketMetadata ? { brackets: { ...cfg.bracketMetadata } } : {}) };
}
function pageOf(spec, cfg, count = 100) {
  return { count, page: 1, hasMorePages: count === 100, rankings: Array.from({ length: count }, (_, i) => ({
    class: spec.className, spec: spec.specName, amount: 1000 - i, startTime: Date.parse("2026-09-01T12:00:00Z") + i,
    ...(cfg.keystoneLevel ? { hardModeLevel: 10, bracketData: 10 } : { hardModeLevel: 0, bracketData: 320 }),
    // Repeated player identities are deliberate: the recipe measures entries.
    name: "PRIVATE-PLAYER-NAME", server: { name: "PRIVATE-SERVER" }, report: { code: "PRIVATE-REPORT-ID" },
  })) };
}
function fakeQuery({ mutateZone, mutateCut, mutateResponse, rate, record = [] } = {}) {
  return async expression => {
    record.push(expression);
    if (expression.includes("rateLimitData")) return ok({ rateLimitData: rate?.(record) ?? { limitPerHour: 3600, pointsSpentThisHour: 0, pointsResetIn: 1200 } });
    const zoneId = Number(expression.match(/zone\(id: (\d+)\)/)?.[1]);
    if (zoneId) {
      const cfg = LIVE_LEADERBOARDS.brackets.find(b => b.zoneId === zoneId), zone = zoneOf(cfg);
      mutateZone?.(zone, cfg);
      return ok({ worldData: { zone } });
    }
    const encounterId = Number(expression.match(/encounter\(id: (\d+)\)/)?.[1]);
    const cfg = LIVE_LEADERBOARDS.brackets.find(b => b.encounters.some(e => e.id === encounterId));
    const encounter = { id: encounterId, zone: { id: cfg.zoneId } };
    const specs = [...expression.matchAll(/s(\d+): characterRankings\(metric: (\w+), className: ("[^"]+"), specName: ("[^"]+")/g)]
      .map(m => ({ alias: `s${m[1]}`, metric: m[2], className: JSON.parse(m[3]), specName: JSON.parse(m[4]) }));
    assert.ok(specs.length >= 1 && specs.length <= 5);
    for (const spec of specs) {
      const page = pageOf(spec, cfg);
      mutateCut?.(page, spec, cfg, encounterId);
      encounter[spec.alias] = page;
    }
    const response = ok({ worldData: { encounter } }); mutateResponse?.(response, specs, cfg, encounterId);
    return response;
  };
}

test("collects exact per-encounter medians for all 40 specs in <=128 ranked requests", async () => {
  const record = [], original = JSON.stringify(roster);
  const result = await collectLeaderboards({ ...options, query: fakeQuery({ record }) });
  assert.equal(result.updates.metrics.length, 640);
  assert.equal(result.querySummary.rankedBatches, 128); assert.equal(result.querySummary.budgetChecks, 8);
  assert.equal(result.querySummary.abortReason, null); assert.equal(JSON.stringify(roster), original);
  assert.ok(record.every(q => !q.includes("encounter(id: 3379)")));
  for (const cfg of LIVE_LEADERBOARDS.brackets) {
    assert.equal(result.brackets[cfg.key].status, "success"); assert.equal(result.brackets[cfg.key].cuts.length, 320);
    assert.equal(result.brackets[cfg.key].rows, 320); assert.equal(result.brackets[cfg.key].verifiedCuts, 320);
    for (const row of result.updates.metrics.filter(r => r.bracket === cfg.bracket)) {
      assert.equal(row.era, "live"); assert.equal(row.value, 951); assert.equal(row.n, 100);
      assert.equal(row.asOf, "2026-09-01"); assert.equal(row.sample.kind, "leaderboard-entries");
      assert.equal(row.sample.cap, 100); assert.equal(row.sample.observedAt, now.toISOString());
      assert.equal(row.sample.newestRun, "2026-09-01T12:00:00.099Z");
      const spec = roster.find(s => s.class === row.class && s.spec === row.spec), metric = spec.role === "Healer" ? "hps" : "dps";
      const encounter = cfg.encounters.find(e => e.id === row.sample.encounterId);
      assert.equal(row.unit, metric.toUpperCase()); assert.equal(row.name, expectedMetricName(cfg, encounter, metric));
    }
  }
  assert.ok(record.filter(q => q.includes("encounter(id:") && q.includes("difficulty: 10")).every(q => q.includes("bracket: 9")));
  const output = JSON.stringify(result);
  assert.ok(!output.includes("PRIVATE-")); assert.ok(!output.includes('"rankings"'));
});

test("pins live zone identity and +10 bracket mapping; only curly apostrophes normalize", async () => {
  const result = await collectLeaderboards({ ...options, query: fakeQuery({ mutateZone: zone => {
    zone.encounters.forEach(e => e.name = e.name.replace(/'/g, "’"));
  } }) });
  assert.equal(result.updates.metrics.length, 640);
  const wrong = await collectLeaderboards({ ...options, query: fakeQuery({ mutateZone: (zone, cfg) => {
    if (cfg.bracket === "mplus") zone.brackets.min = 1;
    else zone.name = "Different Raid";
  } }) });
  assert.equal(wrong.updates.metrics.length, 0); assert.equal(wrong.querySummary.rankedBatches, 0);
  assert.equal(wrong.brackets["wcl-leaderboard-raid"].status, "invalid");
  assert.match(wrong.brackets["wcl-leaderboard-mplus"].failures[0].detail, /metadata differs/);
});

test("a phase flip or missing roster member cannot collect old-season rankings", async () => {
  let calls = 0;
  const result = await collectLeaderboards({ ...options, phases: { ...phases, liveSeason: "s3" }, query: async () => { calls++; } });
  assert.equal(calls, 0); assert.equal(result.updates.metrics.length, 0);
  assert.equal(result.brackets["wcl-leaderboard-raid"].status, "invalid");
  await assert.rejects(() => collectLeaderboards({ ...options, roster: roster.slice(1), query: fakeQuery() }), /40-spec/);
});

test("empty final boss and sparse cuts are explicit omissions, never invented medians", async () => {
  const result = await collectLeaderboards({ ...options, query: fakeQuery({ mutateCut: (page, spec, cfg, encounterId) => {
    if (encounterId === 3492 || (encounterId === 12993 && spec.specName === "Blood")) {
      page.rankings = encounterId === 3492 ? [] : page.rankings.slice(0, 9); page.count = page.rankings.length; page.hasMorePages = false;
    }
  } }) });
  assert.equal(result.brackets["wcl-leaderboard-raid"].status, "success");
  assert.equal(result.brackets["wcl-leaderboard-raid"].rows, 280); assert.equal(result.brackets["wcl-leaderboard-raid"].omissions.length, 40);
  assert.ok(!result.updates.metrics.some(r => r.sample.encounterId === 3492));
  const cut = result.brackets["wcl-leaderboard-mplus"].cuts.find(c => c.encounterId === 12993 && c.spec === "Blood");
  assert.equal(cut.status, "sparse"); assert.equal(cut.samples, 9);
  assert.ok(!result.updates.metrics.some(r => r.sample.encounterId === 12993 && r.spec === "Blood"));
});

test("too little verified coverage stays partial even with no request failures", async () => {
  const result = await collectLeaderboards({ ...options, query: fakeQuery({ mutateCut: (page, _spec, cfg, encounterId) => {
    if (encounterId !== cfg.encounters[0].id) { page.rankings = []; page.count = 0; page.hasMorePages = false; }
  } }) });
  for (const cfg of LIVE_LEADERBOARDS.brackets) {
    assert.equal(result.brackets[cfg.key].status, "partial"); assert.equal(result.brackets[cfg.key].rows, 40);
    assert.equal(result.brackets[cfg.key].verifiedCuts, 320); assert.equal(result.brackets[cfg.key].failures.length, 0);
  }
});

test("invalid returned key, class, value, timestamp or ordering never lands that cut", async () => {
  const bad = [
    page => { page.rankings[0].class = "WrongClass"; },
    page => { page.rankings[0].amount = -1; },
    page => { page.rankings[0].startTime = Date.parse("2026-08-17"); },
    page => { page.rankings[0].startTime = Date.parse("2026-09-06"); },
    page => { page.rankings[1].amount = 5000; },
    page => { page.count = 101; },
    page => { page.page = 2; },
    page => { page.rankings[0].hardModeLevel = 11; },
  ];
  const result = await collectLeaderboards({ ...options, query: fakeQuery({ mutateCut: (page, spec, cfg, encounterId) => {
    if (cfg.bracket === "mplus" && spec.className === "DeathKnight" && spec.specName === "Blood") bad[cfg.encounters.findIndex(e => e.id === encounterId)](page);
  } }) });
  const receipt = result.brackets["wcl-leaderboard-mplus"];
  assert.equal(receipt.status, "partial"); assert.equal(receipt.failures.length, 8);
  assert.equal(receipt.rows, 312); assert.ok(!result.updates.metrics.some(r => r.bracket === "mplus" && r.spec === "Blood"));
  assert.match(receipt.failures.find(c => c.encounterId === 12825).detail, /amount must be positive/);
  assert.match(receipt.failures.find(c => c.encounterId === 61762).detail, /predates the live season.*2026-08-17/);
  assert.match(receipt.failures.find(c => c.encounterId === 12813).detail, /in the future.*2026-09-06.*observed 2026-09-05/);
});

test("ranking diagnostics distinguish a malformed amount from a malformed epoch timestamp", async () => {
  const result = await collectLeaderboards({ ...options, query: fakeQuery({ mutateCut: (page, spec, _cfg, encounterId) => {
    if (spec.className !== "DeathKnight" || spec.specName !== "Blood") return;
    if (encounterId === 12993) page.rankings[0].amount = "1000";
    if (encounterId === 12825) page.rankings[0].startTime = "2026-09-01";
  } }) });
  const failures = result.brackets["wcl-leaderboard-mplus"].failures;
  assert.equal(failures.length, 2);
  assert.match(failures.find(c => c.encounterId === 12993).detail, /amount is not a finite number/);
  assert.match(failures.find(c => c.encounterId === 12825).detail, /timestamp is not a valid epoch-millisecond integer/);
});

test("aliased query failure preserves other valid cuts in the same request", async () => {
  const result = await collectLeaderboards({ ...options, query: fakeQuery({ mutateResponse: (response, _specs, cfg, encounterId) => {
    if (cfg.bracket === "raid" && encounterId === 3470) {
      response.json.errors = [{ message: "Unavailable", path: ["worldData", "encounter", "s0"] }];
      response.json.data.worldData.encounter.s0 = null;
    }
  } }) });
  assert.equal(result.brackets["wcl-leaderboard-raid"].rows, 312);
  assert.equal(result.brackets["wcl-leaderboard-raid"].failures.length, 8);
  assert.equal(result.brackets["wcl-leaderboard-mplus"].status, "success");
});

test("three consecutive transport failures stop the bounded collection and retain completed cuts", async () => {
  const working = fakeQuery(); let rankingCalls = 0;
  const result = await collectLeaderboards({ ...options, query: async expression => {
    if (expression.includes("characterRankings") && ++rankingCalls > 1) return { status: 503, json: null };
    return working(expression);
  } });
  assert.equal(rankingCalls, 4); assert.equal(result.updates.metrics.length, 5);
  assert.match(result.querySummary.abortReason, /three consecutive/);
  assert.equal(result.brackets["wcl-leaderboard-raid"].status, "partial");
  assert.equal(result.brackets["wcl-leaderboard-mplus"].status, "unreachable");
});

test("initial and periodic budget checks prevent quota exhaustion", async () => {
  const initial = await collectLeaderboards({ ...options, query: fakeQuery({ rate: () => ({ limitPerHour: 3600, pointsSpentThisHour: 3500, pointsResetIn: 60 }) }) });
  assert.equal(initial.querySummary.rankedBatches, 0); assert.match(initial.querySummary.abortReason, /Insufficient/);
  let checks = 0;
  const periodic = await collectLeaderboards({ ...options, query: fakeQuery({ rate: () => ({ limitPerHour: 3600, pointsSpentThisHour: ++checks === 1 ? 0 : 3500, pointsResetIn: 60 }) }) });
  assert.equal(periodic.querySummary.rankedBatches, 16); assert.equal(periodic.updates.metrics.length, 80);
  assert.match(periodic.querySummary.abortReason, /Insufficient/);
});

test("overall deadline bounds both pauses and an unresponsive query", async () => {
  let ticks = 0;
  const paused = await collectLeaderboards({ ...options, query: fakeQuery(), maxRunMs: 10, clock: () => ticks, pause: async () => { ticks += 20; } });
  assert.equal(paused.querySummary.queries, 0); assert.match(paused.querySummary.abortReason, /deadline/);
  const hung = await collectLeaderboards({ ...options, query: () => new Promise(() => {}), maxRunMs: 10 });
  assert.match(hung.querySummary.abortReason, /deadline/); assert.equal(hung.querySummary.queries, 1);
});
