import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { checkManifest, checkFreshness, checkAnomaly, checkRowDrop, checkValueMove, probeDate, probeRows, ageDays } from "../src/check-refresh.mjs";

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

test("probes: fightProfiles reads spec.fightProfile coverage, not the page snapshot (audit 2026-07-24, D3)", () => {
  // Sims live outside spec.metrics, so bloodmallet's date probe used to read the page
  // snapshot an agent writes by hand — 106 rows aged 53 days passed both gates green.
  const req = { key: "sims", label: "Sims", maxAgeDays: 5,
    date: { type: "fightProfiles", source: "bloodmallet" },
    rows: { type: "fightProfiles", source: "bloodmallet", min: 2 } };
  const data = freshData();
  data.specs[0].fightProfile = { source: "bloodmallet", asOf: "2026-07-14" };
  data.specs[1].fightProfile = { source: "bloodmallet", asOf: "2026-07-10" };
  assert.equal(probeDate(req, data), "2026-07-10"); // coverage, not the freshest row
  assert.equal(probeRows(req, data), 2);

  // a fresh page snapshot cannot vouch for stale sims any more
  const stale = checkFreshness({ ...config, requirements: [req] }, goodManifest(), data, "2026-07-20");
  assert.ok(stale.violations.some(v => v.includes("sims") && v.includes("10 days stale")),
    JSON.stringify(stale.violations));

  // another source's profiles don't count toward this requirement
  data.specs[1].fightProfile = { source: "other", asOf: "2026-07-14" };
  assert.equal(probeRows(req, data), 1);
});

test("probes: encounterTiers counts TIER ROWS, not encounters (audit 2026-07-24, N5)", () => {
  const req = { key: "enc", label: "Encounters", maxAgeDays: null,
    date: null, rows: { type: "encounterTiers", min: 6 } };
  const full = {
    ...freshData(),
    encounterTiers: {
      raid: { a: { name: "A", tiers: { "X|One": "S", "X|Two": "A", "X|Three": "B" } },
              b: { name: "B", tiers: { "X|One": "A", "X|Two": "B", "X|Three": "C" } } },
      mplus: { c: { name: "C", tiers: { "X|One": "S", "X|Two": "A" } } }
    }
  };
  assert.equal(probeRows(req, full), 8); // 3 + 3 + 2 rows, NOT 3 encounters

  // the real failure shape: a partial parse keeps every encounter and guts its tier map.
  // Under the old encounter-count probe this scored 3 and sailed past any sane floor.
  const gutted = JSON.parse(JSON.stringify(full));
  for (const b of ["raid", "mplus"]) {
    for (const k of Object.keys(gutted.encounterTiers[b])) {
      gutted.encounterTiers[b][k].tiers = { "X|One": "S" };
    }
  }
  assert.equal(Object.keys(gutted.encounterTiers.raid).length + Object.keys(gutted.encounterTiers.mplus).length, 3);
  assert.equal(probeRows(req, gutted), 3);
  assert.ok(probeRows(req, gutted) < req.rows.min, "a gutted parse must fall below the floor");
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

test("probes: encounterTiers type reads the file asOf + total tier-row count", () => {
  // Rewritten 2026-07-24 (N5): this used to assert the ENCOUNTER count, which is exactly
  // the blind spot — encounters survive a partial parse, their tier maps do not.
  const req = { key: "enc", label: "Encounter tiers", maxAgeDays: 10,
    date: { type: "encounterTiers" }, rows: { type: "encounterTiers", min: 1 } };
  const data = { ...freshData(), encounterTiers: { asOf: "2026-07-14",
    raid: { "Boss A": { tiers: { "X|One": "S", "X|Two": "A" } }, "Boss B": { tiers: { "X|One": "B" } } },
    mplus: { "Dungeon A": { tiers: { "X|One": "A", "X|Two": "C" } } } } };
  assert.equal(probeDate(req, data), "2026-07-14");
  assert.equal(probeRows(req, data), 5); // 2 + 1 raid rows + 2 mplus rows, not 3 encounters
  // encounters present but empty is the partial-parse shape — it must score ZERO
  const empty = { ...freshData(),
    encounterTiers: { asOf: "2026-07-14", raid: { "Boss A": {}, "Boss B": {} }, mplus: { "Dungeon A": {} } } };
  assert.equal(probeRows(req, empty), 0);
  // absent file: null date, zero rows (the gate's min floor then complains)
  assert.equal(probeDate(req, { ...freshData(), encounterTiers: null }), null);
  assert.equal(probeRows(req, { ...freshData(), encounterTiers: null }), 0);
});

test("a run where essentially nothing arrived cannot publish as a quiet night (audit 2026-07-24, A4)", () => {
  const cfg = { ...config, minSuccessfulSources: 2 };
  const allDead = { ...goodManifest(), sources: goodManifest().sources.map(r =>
    ({ ...r, result: "unreachable", detail: "upstream down", newAsOf: r.previousAsOf })) };
  const r = checkManifest(cfg, allDead, freshData(), "2026-07-14");
  assert.ok(r.errors.some(e => e.includes("below the 2 floor")), JSON.stringify(r.errors));

  // …and an ordinary partially-degraded night still passes
  const ok = checkManifest(cfg, goodManifest(), freshData(), "2026-07-14");
  assert.deepEqual(ok.errors, []);

  // absent config key = no floor (back-compat with an un-migrated contract)
  assert.deepEqual(checkManifest(config, allDead, freshData(), "2026-07-14").errors
    .filter(e => e.includes("floor —")), []);

  // The floor must not be satisfiable by INVENTED rows. A row keyed to no requirement is
  // never probed against a stored date, so padding was a free pass for the one actor this
  // gate constrains — the process that writes the manifest (audit 2026-07-25).
  const padded = { ...allDead, sources: [...allDead.sources,
    ...Array.from({ length: 5 }, (_, i) => ({ source: `padding-${i}`, result: "success", detail: null, previousAsOf: null, newAsOf: null })) ] };
  const p = checkManifest(cfg, padded, freshData(), "2026-07-14");
  assert.ok(p.errors.some(e => e.includes("below the 2 floor")),
    "invented success rows must not count toward the floor: " + JSON.stringify(p.errors));
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

  // …and it still wins over an OLDER manifest, which is the case it exists for: a local
  // refresh that snapshotted after the last nightly must not read as a dead nightly.
  const m = { ...goodManifest(), startedAt: "2026-07-13T02:00:00Z" };
  const local = checkFreshness(config, m, data, "2026-07-15T23:00:00Z");
  assert.deepEqual(local.violations, []);
  assert.ok(local.report.some(l => l.includes("history snapshot 2026-07-15")));
});

test("a same-dated history snapshot cannot mask a missed nightly (audit 2026-07-24, A1)", () => {
  // The real shape: the nightly starts ~12:47Z and snapshots the same day; the heartbeat
  // runs at 17:23Z. If the next night never fires, the last signal is ~28.6h old at the
  // following heartbeat — but a date-only snapshot dated the SAME day scores exactly 24h
  // and, pushed unconditionally, capped the measured age at 24h forever.
  const m = { ...goodManifest(), run: "2026-07-14", startedAt: "2026-07-14T12:47:00Z" };
  const data = { ...freshData(), historySnapshots: [{ date: "2026-07-14" }] };

  const missed = checkFreshness({ ...config, maxRunAgeHours: 28 }, m, data, "2026-07-15T17:23:00Z");
  assert.ok(missed.violations.some(v => v.includes("run-age") || v.includes("h old")),
    `a missed night must alert, got ${JSON.stringify(missed.violations)}`);
  assert.ok(missed.report.some(l => l.includes("manifest startedAt")),
    "the precise signal must be the one reported, not the midnight-grain snapshot");

  // the same night, landed: ~4.6h old, no alert — the threshold must not cry wolf
  const healthy = checkFreshness({ ...config, maxRunAgeHours: 28 }, m, data, "2026-07-14T17:23:00Z");
  assert.deepEqual(healthy.violations, []);
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

test("checkValueMove catches units/column-parse shapes, not normal churn (audit 2026-07-24, A3)", () => {
  const cfg = { ...config, maxValueMovePct: 0.60, maxFamilyMedianMovePct: 0.35, minValueMagnitude: 100 };
  const mk = vals => ({ specs: vals.map((v, i) => ({
    class: "C", spec: `S${i}`, role: "DPS",
    metrics: [{ source: "wcl", bracket: "raid", name: "Median rDPS", value: v, asOf: "2026-07-14" }],
  })) });
  const base = mk([100, 110, 120, 130, 140, 150]);

  // no baseline, or no configured limit: the guard is inert
  assert.deepEqual(checkValueMove(cfg, base, null).errors, []);
  assert.deepEqual(checkValueMove(config, mk([1, 1, 1, 1, 1, 1]), base).errors, []);

  // realistic night-to-night churn on small PTR samples must not trip
  assert.deepEqual(checkValueMove(cfg, mk([115, 96, 138, 118, 122, 168]), base).errors, []);

  // a units error moves the whole family together — the shape this exists for
  const unitsError = checkValueMove(cfg, mk(base.specs.map(s => s.metrics[0].value / 1000)), base);
  assert.ok(unitsError.errors.length >= 6, "every row of a rescaled family must be flagged");
  assert.ok(unitsError.errors.some(e => /family median move/.test(e)),
    "…and the family median move must be called out as its own finding");

  // one row moving alone is still caught above the row limit
  const oneRow = checkValueMove(cfg, mk([100, 110, 120, 130, 140, 400]), base);
  assert.equal(oneRow.errors.filter(e => /^value move/.test(e)).length, 1);
  assert.match(oneRow.errors[0], /C\|S5\|wcl\|raid\|Median rDPS/);

  // new and removed rows are the row floors' business, not this guard's
  assert.deepEqual(checkValueMove(cfg, mk([100, 110, 120, 130, 140, 150, 999]), base).errors, []);

  // NEAR-ZERO SERIES ARE EXEMPT. Replaying this guard over the real nightly history showed
  // percentage metrics reddening healthy nights on their own: "Top-2000 keys
  // representation" legitimately swings 0.1 -> 0.9, an 800% "move" that is numerically
  // nothing. Relative movement is only meaningful above some magnitude, and units errors
  // — the shape this exists for — happen on large-magnitude series.
  const pct = vals => ({ specs: vals.map((v, i) => ({
    class: "C", spec: `P${i}`, role: "DPS",
    metrics: [{ source: "mythicstats", bracket: "mplus", name: "Top-2000 keys representation", value: v, asOf: "2026-07-14" }],
  })) });
  const pctBase = pct([0.1, 0.4, 0.9, 1.1, 2.0, 4.4]);
  assert.deepEqual(checkValueMove(cfg, pct([0.9, 0.1, 0.3, 0.2, 1.5, 3.0]), pctBase).errors, [],
    "a percentage series must not trip a relative-movement guard");

  // A REVIEWED rescale (e.g. the 2026-07-23 Archon recipe fix, which legitimately moved
  // two whole families the next night) must be approvable, not unpublishable.
  const rescaled = mk(base.specs.map(s => s.metrics[0].value * 30));
  assert.ok(checkValueMove(cfg, rescaled, base).errors.length > 0, "a family rescale is flagged");
  const acked = checkValueMove(cfg, rescaled, base, "Archon recipe fix, audit M1");
  assert.deepEqual(acked.errors, [], "…and clears with the human ack");
  assert.match(acked.notes[0], /approved by human ack — Archon recipe fix/);
  assert.ok(acked.acked.length > 0, "the acked findings are still reported for the record");
});

test("the value-move ack is a separate human token from the anomaly ack, and its waivers are printed", async () => {
  /* Both gates are human-only, but they are unrelated judgements. Feeding one token to
     both meant a human re-running to approve a citable mass TIER retune also, silently,
     approved every VALUE finding in that run — including ones they never saw, because
     `acked` was computed and then discarded (audit 2026-07-25). This pins the wiring: the
     function-level behaviour is covered above, but the defect lived entirely in the CLI. */
  const src = await readFile(new URL("../src/check-refresh.mjs", import.meta.url), "utf8");

  assert.match(src, /VALUE_MOVE_ACK/, "the value gate needs its own env input");
  assert.match(src, /checkValueMove\(config, data, prevData, valueAck\)/,
    "checkValueMove must receive the value ack, never the anomaly ack");
  assert.match(src, /checkAnomaly\(.*config\.anomaly, trustedAck\)/, "the anomaly gate keeps its own token");
  // No silent fallback: `valueAck = … ?? ANOMALY_ACK` would restore the exact defect.
  const valueLine = src.split("\n").find(l => l.includes("const valueAck"));
  assert.ok(valueLine && !valueLine.includes("ANOMALY_ACK") && !valueLine.includes("trustedAck"),
    "the value ack must not fall back to the anomaly ack: " + valueLine);
  assert.match(src, /waived by value ack/, "a human must see WHAT their ack waived, not just how many");

  const wf = await readFile(new URL("../.github/workflows/nightly.yml", import.meta.url), "utf8");
  assert.match(wf, /value_move_ack:/, "the separate input must be dispatchable");
  assert.match(wf, /VALUE_MOVE_ACK: \$\{\{ inputs\.value_move_ack \}\}/,
    "…and wired to the gate step, or the input is decorative");
});

test("checkValueMove covers sims and Dummy Dome, not just spec.metrics", () => {
  /* fightProfile.targets and ptrDummy.targets live OUTSIDE spec.metrics. Indexing only
     spec.metrics left 244 large-magnitude numbers on real data completely unguarded: a
     1000x Bloodmallet parse published green. Bloodmallet is re-fetched and re-merged by an
     agent parse every night, so it is squarely in the threat model this guard exists for
     (audit 2026-07-25). Replayed over 18 real nightly transitions, the added coverage
     produced zero new findings — it is coverage, not noise. */
  const cfg = { ...config, maxValueMovePct: 0.6, maxFamilyMedianMovePct: 0.35, minValueMagnitude: 100 };
  const mk = (sim, dummy) => ({ specs: sim.map((v, i) => ({
    class: "C", spec: `P${i}`, role: "DPS", metrics: [],
    fightProfile: { source: "bloodmallet", asOf: "2026-07-14", targets: { "1": v, "3": v * 2 } },
    ptrDummy: { source: "warcraftlogs", asOf: "2026-07-14", targets: { "1": dummy[i] } },
  })) });
  const base = mk([100000, 110000, 120000, 130000, 140000, 150000],
                  [90000, 95000, 100000, 105000, 110000, 115000]);

  assert.deepEqual(checkValueMove(cfg, base, base).errors, [], "an unchanged night is silent");
  // normal sim churn between Bloodmallet runs
  assert.deepEqual(checkValueMove(cfg, mk([112000, 104000, 131000, 121000, 152000, 141000],
                                          [93000, 91000, 106000, 99000, 117000, 110000]), base).errors, []);

  const rescaled = checkValueMove(cfg, mk(base.specs.map(s => s.fightProfile.targets["1"] * 1000),
                                          base.specs.map(s => s.ptrDummy.targets["1"])), base);
  assert.ok(rescaled.errors.some(e => e.includes("bloodmallet|sim|targets.1")),
    "a rescaled sim column must be caught: " + JSON.stringify(rescaled.errors.slice(0, 2)));
  assert.ok(rescaled.errors.some(e => /family median move/.test(e) && e.includes("sim")),
    "…and the family median move alongside it");

  const dummyBroken = checkValueMove(cfg, mk(base.specs.map(s => s.fightProfile.targets["1"]),
                                             base.specs.map(s => s.ptrDummy.targets["1"] * 1000)), base);
  assert.ok(dummyBroken.errors.some(e => e.includes("warcraftlogs|dummy|targets.1")),
    "a rescaled Dummy Dome column must be caught too");
  // …and the sim family, untouched in that run, stays silent — no blanket reddening.
  assert.ok(!dummyBroken.errors.some(e => e.includes("|sim|")), "an unrelated healthy family must not be dragged in");
});

/* ---- the one-shot launch flip (2026-08-02) ---- */

test("age gate: SNAPSHOT_PHASE still pre-launch past its due date is a violation", () => {
  const after = checkFreshness(config, goodManifest(), freshData(), "2026-08-25");
  assert.ok(after.violations.some(v => v.includes("SNAPSHOT_PHASE")), after.violations.join("\n"));
  assert.ok(after.fingerprint.includes("snapshot-phase"));
});

test("age gate: the flip is NOT nagged before its due date", () => {
  // Season 2 opens 08-18 and the due date carries slack for a delayed launch. A gate
  // that fires early trains the owner to ignore it, which is worse than no gate.
  const before = checkFreshness(config, goodManifest(), freshData(), "2026-08-12");
  assert.ok(!before.violations.some(v => v.includes("SNAPSHOT_PHASE")), before.violations.join("\n"));
  assert.ok(!before.fingerprint.includes("snapshot-phase"));
});

test("age gate: once flipped, the check goes quiet forever", async () => {
  // Guards against the gate becoming a permanent nag after a correct flip: the condition
  // is on the phase VALUE, not the date, so a live-season id passes at any future date.
  const { PHASE_FLIP_DUE } = await import("../src/render.mjs");
  assert.match(PHASE_FLIP_DUE, /^\d{4}-\d{2}-\d{2}$/);
  const src = await readFile(new URL("../src/check-refresh.mjs", import.meta.url), "utf8");
  assert.match(src, /SNAPSHOT_PHASE === "12\.1-ptr" && dateOf\(nowDate\) > PHASE_FLIP_DUE/,
    "the gate must test the phase VALUE, so flipping it silences the check permanently");
});
