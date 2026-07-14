import { test } from "node:test";
import assert from "node:assert/strict";
import { checkManifest, checkFreshness, checkAnomaly, probeDate, probeRows, ageDays } from "../src/check-refresh.mjs";

/* Small synthetic world: one tier-list source (two pages), one metrics source, one
   probe-less feed requirement — enough to exercise every gate rule without the repo's
   real data (which test/validate.test.mjs already covers end to end). */
const config = {
  maxRunAgeHours: 36,
  anomaly: { maxTwoBandMoves: 1, maxTotalMoves: 3 },
  requirements: [
    { key: "alpha", label: "Alpha tiers", maxAgeDays: 4,
      date: { type: "pages", sourceId: "alpha" },
      rows: { type: "ratings", sourceId: "alpha", min: 2 } },
    { key: "beta", label: "Beta metrics", maxAgeDays: 5,
      date: { type: "metrics", source: "beta", namePattern: "^Beta" },
      rows: { type: "metrics", source: "beta", namePattern: "^Beta", min: 1 } },
    { key: "feed", label: "Feed check", maxAgeDays: null, date: null, rows: null }
  ]
};

const freshData = (pageDates = ["2026-07-14", "2026-07-14"]) => ({
  sources: [{ id: "alpha", pages: [
    { bracket: "raid", snapshot: pageDates[0] },
    { bracket: "mplus", snapshot: pageDates[1] }
  ] }],
  specs: [
    { class: "X", spec: "One", ratings: { raid: { alpha: "A" }, mplus: { alpha: "B" } },
      metrics: [{ source: "beta", bracket: "raid", name: "Beta score", asOf: "2026-07-14" }] },
    { class: "X", spec: "Two", ratings: { raid: { alpha: null } }, metrics: [] }
  ],
  encounterTiers: null
});

const goodManifest = () => ({
  run: "2026-07-14",
  summary: "test run",
  sources: [
    { source: "alpha", result: "success" },
    { source: "beta", result: "success" },
    { source: "feed", result: "success" }
  ]
});

test("probes: pages take the OLDEST date (lagging page is the finding), metrics the newest", () => {
  const data = freshData(["2026-07-14", "2026-07-10"]);
  assert.equal(probeDate(config.requirements[0], data), "2026-07-10");
  assert.equal(probeDate(config.requirements[1], data), "2026-07-14");
  assert.equal(probeRows(config.requirements[0], data), 2); // null rating doesn't count
  assert.equal(probeRows(config.requirements[1], data), 1);
  assert.equal(ageDays("2026-07-14", "2026-07-09"), 5);
});

test("a complete, honest manifest passes with no errors", () => {
  const r = checkManifest(config, goodManifest(), freshData(), "2026-07-14");
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.degraded, []);
});

test("a required source with no manifest row fails the gate", () => {
  const m = goodManifest();
  m.sources = m.sources.filter(s => s.source !== "feed");
  const r = checkManifest(config, m, freshData(), "2026-07-14");
  assert.ok(r.errors.some(e => e.includes('"feed"') && e.includes("no row")));
});

test("an unexplained skip fails; an explained skip only degrades", () => {
  const m = goodManifest();
  m.sources.find(s => s.source === "beta").result = "skipped";
  const bare = checkManifest(config, m, freshData(), "2026-07-14");
  assert.ok(bare.errors.some(e => e.includes("unexplained skipped")));

  m.sources.find(s => s.source === "beta").detail = "upstream page 404s since the site redesign";
  const explained = checkManifest(config, m, freshData(), "2026-07-14");
  assert.deepEqual(explained.errors, []);
  assert.ok(explained.degraded.some(d => d.startsWith("beta: skipped")));
});

test("claiming success while the stored data stayed old fails (anti-drift teeth)", () => {
  // Both alpha pages left at 07-10 but the manifest says success on a 07-14 run.
  const r = checkManifest(config, goodManifest(), freshData(["2026-07-10", "2026-07-10"]), "2026-07-14");
  assert.ok(r.errors.some(e => e.includes('"alpha" claims success but stored data is dated 2026-07-10')));
  // ...and ONE lagging page is enough: pages probe takes the oldest.
  const partial = checkManifest(config, goodManifest(), freshData(["2026-07-14", "2026-07-10"]), "2026-07-14");
  assert.ok(partial.errors.some(e => e.includes('"alpha" claims success')));
});

test("a row-count floor breach fails regardless of the claimed result", () => {
  const data = freshData();
  data.specs[0].ratings.mplus.alpha = null; // 2 → 1 rating, floor is 2
  const r = checkManifest(config, goodManifest(), data, "2026-07-14");
  assert.ok(r.errors.some(e => e.includes("data floor") && e.includes('"alpha"')));
});

test("stale run dates, duplicate rows, and missing summaries fail", () => {
  const m = goodManifest();
  m.run = "2026-07-10";
  m.summary = "";
  m.sources.push({ source: "alpha", result: "success" });
  const r = checkManifest(config, m, freshData(["2026-07-10", "2026-07-10"]), "2026-07-14");
  assert.ok(r.errors.some(e => e.includes("run date 2026-07-10 is not this run")));
  assert.ok(r.errors.some(e => e.includes("summary")));
  assert.ok(r.errors.some(e => e.includes('duplicate row for "alpha"')));
});

test("freshness heartbeat flags an old manifest run and per-source staleness", () => {
  const r = checkFreshness(config, goodManifest(), freshData(["2026-07-14", "2026-07-12"]), "2026-07-20");
  assert.ok(r.violations.some(v => v.includes("144h old")));
  assert.ok(r.violations.some(v => v.includes("alpha") && v.includes("8 days stale")));
  assert.ok(r.violations.some(v => v.includes("beta") && v.includes("6 days stale")));
  assert.ok(r.report.length >= 3);

  const fresh = checkFreshness(config, goodManifest(), freshData(), "2026-07-14");
  assert.deepEqual(fresh.violations, []);
});

const BANDS = [{ tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "B", min: 40 }, { tier: "C", min: 0 }];
const state = tiers => Object.fromEntries(Object.entries(tiers).map(([k, [raid, mplus]]) => [k, { consensus: { raid, mplus } }]));

test("anomaly gate: mass multi-band movement fails without an ack, passes with one", () => {
  const before = state({ "X|One": ["S", "S"], "X|Two": ["S", "A"], "X|Three": ["A", "A"] });
  const after = state({ "X|One": ["B", "C"], "X|Two": ["C", "A"], "X|Three": ["A", "A"] }); // 3 moves of ≥2 bands
  const bare = checkAnomaly(after, before, BANDS, config.anomaly, null);
  assert.equal(bare.twoBand, 3);
  assert.ok(bare.errors.some(e => e.includes("anomaly")));

  const acked = checkAnomaly(after, before, BANDS, config.anomaly, "Blizzard 2026-07-20 mass retune, forum post #19");
  assert.deepEqual(acked.errors, []);
  assert.ok(acked.notes.some(n => n.includes("acknowledged")));
});

test("anomaly gate: ordinary single-band drift passes untouched", () => {
  const before = state({ "X|One": ["S", "A"], "X|Two": ["A", "A"] });
  const after = state({ "X|One": ["A", "A"], "X|Two": ["A", "B"] });
  const r = checkAnomaly(after, before, BANDS, config.anomaly, null);
  assert.deepEqual(r.errors, []);
  assert.equal(r.twoBand, 0);
  assert.equal(r.total, 2);
});
