import { test } from "node:test";
import assert from "node:assert/strict";
import { checkManifest, checkFreshness, checkAnomaly, checkRowDrop, probeDate, probeRows, ageDays } from "../src/check-refresh.mjs";

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
  startedAt: "2026-07-14T10:41:00Z",
  summary: "test run",
  sources: [
    { source: "alpha", result: "success", previousAsOf: "2026-07-10", newAsOf: "2026-07-14" },
    { source: "beta", result: "success", previousAsOf: "2026-07-10", newAsOf: "2026-07-14" },
    { source: "feed", result: "success", previousAsOf: null, newAsOf: null }
  ]
});

test("probes: pages take the OLDEST date (lagging page is the finding), metrics the newest when the floor is 1", () => {
  const data = freshData(["2026-07-14", "2026-07-10"]);
  assert.equal(probeDate(config.requirements[0], data), "2026-07-10");
  assert.equal(probeDate(config.requirements[1], data), "2026-07-14");
  assert.equal(probeRows(config.requirements[0], data), 2); // null rating doesn't count
  assert.equal(probeRows(config.requirements[1], data), 1);
  assert.equal(ageDays("2026-07-14", "2026-07-09"), 5);
});

test("metric probes take a COVERAGE date — one fresh row cannot vouch for a mostly-stale cut", () => {
  // Same source, floor of 2: freshness is the 2nd-freshest row's date.
  const req = { key: "gamma", label: "Gamma metrics", maxAgeDays: 5,
    date: { type: "metrics", source: "gamma", namePattern: "^Gamma" },
    rows: { type: "metrics", source: "gamma", namePattern: "^Gamma", min: 2 } };
  const data = freshData();
  data.specs[0].metrics.push({ source: "gamma", bracket: "raid", name: "Gamma a", asOf: "2026-07-14" });
  data.specs[1].metrics.push({ source: "gamma", bracket: "raid", name: "Gamma b", asOf: "2026-07-10" });
  assert.equal(probeDate(req, data), "2026-07-10"); // masked staleness now visible

  const cfg = { ...config, requirements: [req] };
  const m = { ...goodManifest(), sources: [{ source: "gamma", result: "success", previousAsOf: "2026-07-10", newAsOf: "2026-07-14" }] };
  const masked = checkManifest(cfg, m, data, "2026-07-14");
  assert.ok(masked.errors.some(e => e.includes('"gamma" claims success but stored data is dated 2026-07-10')));

  data.specs[1].metrics.find(x => x.source === "gamma").asOf = "2026-07-14";
  assert.equal(probeDate(req, data), "2026-07-14");
  assert.deepEqual(checkManifest(cfg, m, data, "2026-07-14").errors, []);

  // Fewer rows than the floor: conservative (oldest) — the row floor complains separately.
  data.specs[1].metrics = [];
  assert.equal(probeDate(req, data), "2026-07-14");
});

test("probes: ptrDummy type reads spec.ptrDummy coverage date + count", () => {
  // min above the row count → coverage returns the OLDEST present date, like the real
  // wcl-dummy-dome requirement (min 15): one fresh spec can't vouch for a stale cut.
  const req = { key: "dome", label: "Dummy Dome", maxAgeDays: 10,
    date: { type: "ptrDummy" }, rows: { type: "ptrDummy", min: 15 } };
  const data = freshData();
  data.specs[0].ptrDummy = { asOf: "2026-07-14", targets: { "1": 100 } };
  data.specs[1].ptrDummy = { asOf: "2026-07-10", targets: { "1": 90 } };
  assert.equal(probeDate(req, data), "2026-07-10");
  assert.equal(probeRows(req, data), 2);
  // a spec without ptrDummy neither dates nor counts
  data.specs[1].ptrDummy = undefined;
  assert.equal(probeDate(req, data), "2026-07-14");
  assert.equal(probeRows(req, data), 1);
});

test("probes: encounterTiers type reads the file asOf + raid/mplus cell count", () => {
  const req = { key: "enc", label: "Encounter tiers", maxAgeDays: 10,
    date: { type: "encounterTiers" }, rows: { type: "encounterTiers", min: 1 } };
  const data = { ...freshData(),
    encounterTiers: { asOf: "2026-07-14", raid: { "Boss A": {}, "Boss B": {} }, mplus: { "Dungeon A": {} } } };
  assert.equal(probeDate(req, data), "2026-07-14");
  assert.equal(probeRows(req, data), 3); // 2 raid + 1 mplus
  // absent file: null date, zero rows (the gate's min floor then complains)
  assert.equal(probeDate(req, { ...freshData(), encounterTiers: null }), null);
  assert.equal(probeRows(req, { ...freshData(), encounterTiers: null }), 0);
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

test("provenance fields: previousAsOf/newAsOf are required per row and may never regress; anomalyAck is rejected outright", () => {
  const bare = goodManifest();
  delete bare.sources[0].previousAsOf;
  delete bare.sources[1].newAsOf;
  const r = checkManifest(config, bare, freshData(), "2026-07-14");
  assert.ok(r.errors.some(e => e.includes('"alpha" must include previousAsOf')));
  assert.ok(r.errors.some(e => e.includes('"beta" must include newAsOf')));

  const regressed = goodManifest();
  regressed.sources[0].newAsOf = "2026-07-01"; // below previousAsOf 2026-07-10
  assert.ok(checkManifest(config, regressed, freshData(["2026-07-14", "2026-07-14"]), "2026-07-14")
    .errors.some(e => e.includes('"alpha" newAsOf 2026-07-01 regressed')));

  // The gate never accepts its own override from the agent-written file — only the
  // human anomaly_ack workflow input (wired in the CLI) can acknowledge an anomaly.
  const acked = { ...goodManifest(), anomalyAck: "totally a real retune, trust me" };
  assert.ok(checkManifest(config, acked, freshData(), "2026-07-14")
    .errors.some(e => e.includes('"anomalyAck" is not accepted')));
  const proposed = { ...goodManifest(), anomalyAckProposal: "Blizzard post #19" };
  assert.deepEqual(checkManifest(config, proposed, freshData(), "2026-07-14").errors, []);
});

test("startedAt must be a FRESH write: a copied old instant or a future one fails when the gate knows the real time", () => {
  const old = goodManifest(); // startedAt 2026-07-14T10:41:00Z
  const r = checkManifest(config, old, freshData(), "2026-07-14T23:30:00Z"); // ~12.8h later
  assert.ok(r.errors.some(e => e.includes("not a fresh write")));
  assert.deepEqual(checkManifest(config, old, freshData(), "2026-07-14T18:00:00Z").errors, []); // 7.3h — fine

  const future = { ...goodManifest(), startedAt: "2026-07-14T12:00:00Z" };
  assert.ok(checkManifest(config, future, freshData(), "2026-07-14T10:00:00Z")
    .errors.some(e => e.includes("is in the future")));
});

test("startedAt is required, must be a real instant, and must belong to the run", () => {
  const missing = goodManifest();
  delete missing.startedAt;
  assert.ok(checkManifest(config, missing, freshData(), "2026-07-14")
    .errors.some(e => e.includes("startedAt must be a full ISO 8601 instant")));

  const dateOnly = { ...goodManifest(), startedAt: "2026-07-14" };
  assert.ok(checkManifest(config, dateOnly, freshData(), "2026-07-14")
    .errors.some(e => e.includes("startedAt must be a full ISO 8601 instant")));

  const wrongDay = { ...goodManifest(), startedAt: "2026-07-10T09:00:00Z" };
  assert.ok(checkManifest(config, wrongDay, freshData(), "2026-07-14")
    .errors.some(e => e.includes("does not belong to run")));

  const future = { ...goodManifest(), run: "2026-07-20", startedAt: "2026-07-20T01:00:00Z" };
  assert.ok(checkManifest(config, future, freshData(), "2026-07-14")
    .errors.some(e => e.includes("run date 2026-07-20 is in the future")));
});

/* --- WCL fetch evidence (deterministic step vouches; the agent's word never does) --- */

const evConfig = {
  maxRunAgeHours: 36,
  anomaly: { maxTwoBandMoves: 1, maxTotalMoves: 3 },
  requirements: [
    { key: "wclx", label: "WCL X", maxAgeDays: 10, evidence: "wcl",
      date: { type: "metrics", source: "beta", namePattern: "^Beta" },
      rows: { type: "metrics", source: "beta", namePattern: "^Beta", min: 1 } }
  ]
};
const evManifest = rows => ({ run: "2026-07-14", startedAt: "2026-07-14T10:41:00Z", summary: "t",
  sources: rows.map(r => ({ previousAsOf: "2026-07-09", newAsOf: "2026-07-14", ...r })) });
const evidenceOf = extra => ({ attemptedAt: "2026-07-14T10:39:00Z", verdict: "rdps-broken", detail: "rdps 500s", landed: {}, ...extra });

test("evidence-gated success needs the deterministic fetch to have landed rows", () => {
  const m = evManifest([{ source: "wclx", result: "success" }]);
  const blocked = checkManifest(evConfig, m, freshData(), "2026-07-14", evidenceOf({}));
  assert.ok(blocked.errors.some(e => e.includes('"wclx" claims success') && e.includes("landed no data")));

  const landed = checkManifest(evConfig, m, freshData(), "2026-07-14",
    evidenceOf({ verdict: "rdps-restored", landed: { wclx: { rows: 12 } } }));
  assert.deepEqual(landed.errors, []);
  assert.ok(landed.notes.some(n => n.includes("rDPS metric family works again")));
});

test("an honest unreachable row is consistent with broken-upstream evidence; local runs without evidence keep the date teeth only", () => {
  const honest = evManifest([{ source: "wclx", result: "unreachable", detail: "rdps family 500s upstream (evidence verdict rdps-broken)" }]);
  const r = checkManifest(evConfig, honest, freshData(), "2026-07-14", evidenceOf({}));
  assert.deepEqual(r.errors, []);
  assert.ok(r.degraded.some(d => d.startsWith("wclx: unreachable")));

  // No evidence file (local run): success is still policed by the stored-date teeth.
  const local = checkManifest(evConfig, evManifest([{ source: "wclx", result: "success" }]), freshData(), "2026-07-14", null);
  assert.deepEqual(local.errors, []);
});

test("stale or credential-degraded evidence is surfaced, and stale evidence cannot vouch", () => {
  const m = evManifest([{ source: "wclx", result: "unreachable", detail: "per evidence" }]);
  const stale = checkManifest(evConfig, m, freshData(), "2026-07-14", evidenceOf({ attemptedAt: "2026-07-10T00:00:00Z" }));
  assert.ok(stale.errors.some(e => e.includes("wcl evidence") && e.includes("not from this run")));

  const noCreds = checkManifest(evConfig, m, freshData(), "2026-07-14", evidenceOf({ verdict: "no-credentials", detail: "env unset" }));
  assert.ok(noCreds.degraded.some(d => d.includes("no-credentials")));
});

/* --- row-drop guard ---------------------------------------------------------------- */

test("row-drop guard: a >25% shrink vs the last committed state fails even above the absolute floor", () => {
  const cfg = { maxRowDropPct: 0.25, requirements: [
    { key: "alpha", label: "Alpha tiers", rows: { type: "ratings", sourceId: "alpha", min: 2 } }
  ] };
  const world = n => ({
    specs: Array.from({ length: 4 }, (_, i) => ({
      class: "X", spec: `S${i}`,
      ratings: { raid: { alpha: i * 2 < n ? "A" : null }, mplus: { alpha: i * 2 + 1 < n ? "B" : null } }
    })),
    encounterTiers: null
  });
  const prev = world(8); // 8 rated cells committed at HEAD
  assert.equal(probeRows(cfg.requirements[0], prev), 8);
  const dropped = checkRowDrop(cfg, world(5), prev); // -37.5%, still above the min floor of 2
  assert.ok(dropped.errors.some(e => e.includes('"alpha" fell 8 → 5 rows')));
  assert.deepEqual(checkRowDrop(cfg, world(7), prev).errors, []); // -12.5% is ordinary drift
  assert.deepEqual(checkRowDrop(cfg, world(5), null).errors, []); // no baseline → skip
  // A HEAD state already below the floor is no baseline (new requirement bootstrap).
  assert.deepEqual(checkRowDrop(cfg, world(0), world(1)).errors, []);
});

/* --- heartbeat --------------------------------------------------------------------- */

test("freshness heartbeat flags an old manifest run and per-source staleness (date-grain legacy fallback)", () => {
  const legacy = goodManifest();
  delete legacy.startedAt; // pre-startedAt manifests fall back to date-grain run math
  const r = checkFreshness(config, legacy, freshData(["2026-07-14", "2026-07-12"]), "2026-07-20");
  assert.ok(r.violations.some(v => v.includes("144h old")));
  assert.ok(r.violations.some(v => v.includes("alpha") && v.includes("8 days stale")));
  assert.ok(r.violations.some(v => v.includes("beta") && v.includes("6 days stale")));
  assert.ok(r.report.length >= 3);
  assert.equal(r.fingerprint, "alpha,beta,run-age");

  const fresh = checkFreshness(config, goodManifest(), freshData(), "2026-07-14");
  assert.deepEqual(fresh.violations, []);
  assert.equal(fresh.fingerprint, "");
});

test("freshness heartbeat uses startedAt at full-timestamp precision — 36h means 36h, not whole days", () => {
  const m = { ...goodManifest(), startedAt: "2026-07-14T02:00:00Z" };
  const stale = checkFreshness(config, m, freshData(), "2026-07-15T20:00:00Z"); // 42h after startedAt
  assert.ok(stale.violations.some(v => v.includes("42h old")), JSON.stringify(stale.violations));
  assert.ok(stale.fingerprint.includes("run-age"));

  const ok = checkFreshness(config, m, freshData(), "2026-07-15T10:00:00Z"); // 32h
  assert.deepEqual(ok.violations, []);
});

test("a newer history snapshot counts as proof of life (local refreshes count), date-grained", () => {
  const data = { ...freshData(), historySnapshots: [{ date: "2026-07-15" }] };
  const r = checkFreshness(config, null, data, "2026-07-15T23:00:00Z");
  assert.ok(!r.violations.some(v => v.includes("run-age") || v.includes("h old")));
  assert.ok(r.report.some(l => l.includes("history snapshot 2026-07-15")));
});

/* --- anomaly gate ------------------------------------------------------------------ */

const BANDS = [{ tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "B", min: 40 }, { tier: "C", min: 0 }];
const state = tiers => Object.fromEntries(Object.entries(tiers).map(([k, [raid, mplus]]) => [k, { consensus: { raid, mplus } }]));

test("anomaly gate: mass multi-band movement fails without a TRUSTED ack, passes with one", () => {
  const before = state({ "X|One": ["S", "S"], "X|Two": ["S", "A"], "X|Three": ["A", "A"] });
  const after = state({ "X|One": ["B", "C"], "X|Two": ["C", "A"], "X|Three": ["A", "A"] }); // 3 moves of ≥2 bands
  const bare = checkAnomaly(after, before, BANDS, config.anomaly, null);
  assert.equal(bare.twoBand, 3);
  assert.ok(bare.errors.some(e => e.includes("anomaly") && e.includes("anomaly_ack workflow input")));

  // The ack parameter is fed ONLY from the human-supplied workflow input / --ack /
  // ANOMALY_ACK env (see the CLI) — the agent-written manifest can merely propose.
  const acked = checkAnomaly(after, before, BANDS, config.anomaly, "Blizzard 2026-07-20 mass retune, forum post #19");
  assert.deepEqual(acked.errors, []);
  assert.ok(acked.notes.some(n => n.includes("acknowledged by trusted input")));
});

test("anomaly gate: ordinary single-band drift passes untouched", () => {
  const before = state({ "X|One": ["S", "A"], "X|Two": ["A", "A"] });
  const after = state({ "X|One": ["A", "A"], "X|Two": ["A", "B"] });
  const r = checkAnomaly(after, before, BANDS, config.anomaly, null);
  assert.deepEqual(r.errors, []);
  assert.equal(r.twoBand, 0);
  assert.equal(r.total, 2);
});
