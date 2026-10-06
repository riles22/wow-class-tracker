import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { checkManifest, checkFreshness, checkAnomaly, checkRowDrop, checkValueMove, checkPublished, checkSourceChurn, parseChurnAck, seasonAdvanceFor, probeDate, probeRows, ageDays, FLOOR_RESTORE_DUE, labelFlipViolation } from "../src/check-refresh.mjs";
import { LABEL_FLIP_DUE, LABEL_FLIP_EXPECTED } from "../src/normalize.mjs";

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
const evidenceOf = extra => ({ attemptedAt: "2026-07-14T10:39:00Z", verdict: "partial", detail: "No verified aggregate endpoint", landed: {}, ...extra });

test("leaderboard collection coverage cannot be vouched for by one fresh cut or legacy asOf dates", () => {
  const req = { key: "leaderboards", date: { type: "leaderboardChecks", source: "warcraftlogs", namePattern: ".*" }, rows: { min: 2 } };
  const data = { specs: [{ metrics: [
    { source: "warcraftlogs", name: "legacy", asOf: "2026-09-05" },
    { source: "warcraftlogs", name: "cut1", asOf: "2026-08-20", sample: { kind: "leaderboard-entries", observedAt: "2026-09-05T18:00:00.000Z" } },
    { source: "warcraftlogs", name: "cut2", asOf: "2026-09-04", sample: { kind: "leaderboard-entries", observedAt: "2026-09-02T18:00:00.000Z" } },
  ] }] };
  assert.equal(probeDate(req, data), "2026-09-02");
  data.specs[0].metrics[2].sample.observedAt = "2026-09-05T18:00:00.000Z";
  assert.equal(probeDate(req, data), "2026-09-05");
  assert.equal(data.specs[0].metrics[1].asOf, "2026-08-20", "collection does not relabel the included log date");
});

test("evidence-gated success needs the deterministic fetch to have landed rows", () => {
  const m = evManifest([{ source: "wclx", result: "success" }]);
  const blocked = checkManifest(evConfig, m, freshData(), "2026-07-14", evidenceOf({}));
  assert.ok(blocked.errors.some(e => e.includes('"wclx" claims success') && e.includes("landed no data")));

  const landed = checkManifest(evConfig, m, freshData(), "2026-07-14",
    evidenceOf({ verdict: "success", landed: { wclx: { rows: 12 } } }));
  assert.deepEqual(landed.errors, []);
  assert.ok(!landed.notes.some(n => /rDPS.*works again/.test(n)));
});

test("an honest unreachable row is consistent with unavailable aggregate evidence; local runs without evidence keep the date teeth only", () => {
  const honest = evManifest([{ source: "wclx", result: "unreachable", detail: "No verified aggregate endpoint" }]);
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

test("gearing freshness is heartbeat-only and reports absence rather than passing silently (2026-08-08)", () => {
  /* The gearing subproject had no staleness surface anywhere: not required-sources, not
     check-refresh, not freshness.yml, and its own validator's "stale" strings are all count
     assertions. The nightly redeployed an 08-02 page nightly and nothing would have noticed.
     Three properties matter and each is asserted below: it lives OUTSIDE requirements[] so the
     publish gate can never demand a manifest row for a subproject the nightly cannot refresh;
     a checkout without gearing/ is reported, not skipped; and the tier-set sync check measures
     WRONGNESS (the page publishing text the tracker already corrected) rather than mere age. */
  const cfg = { ...config, gearing: { datasets: [
    { key: "gearing-raid", file: "raid-items.json", dateField: "harvestedAt", maxAgeDays: 30 }
  ] } };
  const data = freshData();

  const stale = checkFreshness(cfg, goodManifest(), data, "2026-09-20",
    { present: true, dates: { "raid-items.json": "2026-08-02" }, tierSetDrift: 0 });
  assert.ok(stale.violations.some(v => v.includes("gearing-raid") && v.includes("stale")),
    JSON.stringify(stale.violations));

  const ok = checkFreshness(cfg, goodManifest(), data, "2026-08-14",
    { present: true, dates: { "raid-items.json": "2026-08-02" }, tierSetDrift: 0 });
  assert.ok(!ok.violations.some(v => v.includes("gearing-raid")), "12 days is inside a 30-day threshold");

  // Absence is REPORTED, never silent — a missing subproject must not read as a clean bill.
  const absent = checkFreshness(cfg, goodManifest(), data, "2026-08-14", { present: false, dates: {}, tierSetDrift: 0 });
  assert.ok(absent.report.some(l => l.includes("gearing: not present")), JSON.stringify(absent.report));
  assert.ok(!absent.violations.some(v => v.includes("gearing")), "a checkout without gearing/ must not fail the heartbeat");

  // Drift fires regardless of age — this is the Preservation Evoker shape.
  const drift = checkFreshness(cfg, goodManifest(), data, "2026-08-14",
    { present: true, dates: { "raid-items.json": "2026-08-02" }, tierSetDrift: 2 });
  assert.ok(drift.violations.some(v => v.includes("gearing-tierset-sync") && v.includes("harvest-specs")),
    JSON.stringify(drift.violations));

  // And it stays out of requirements[], so checkManifest can never demand a gearing row.
  assert.ok(!(config.requirements ?? []).some(r => String(r.key).startsWith("gearing")));
});

test("freshness heartbeat uses startedAt at full-timestamp precision — 36h means 36h, not whole days", () => {
  const m = { ...goodManifest(), startedAt: "2026-07-14T02:00:00Z" };
  const stale = checkFreshness(config, m, freshData(), "2026-07-15T20:00:00Z"); // 42h after startedAt
  assert.ok(stale.violations.some(v => v.includes("42h old")), JSON.stringify(stale.violations));
  assert.ok(stale.fingerprint.includes("run-age"));

  const ok = checkFreshness(config, m, freshData(), "2026-07-15T10:00:00Z"); // 32h
  assert.deepEqual(ok.violations, []);
});

test("gearing structural receipts never hide drift or claim future verification", () => {
  const cfg = { ...config, gearing: { structuralSync: true, datasets: [
    { key: "gearing-specs", file: "specs.json", dateField: "structuralSync.checkedAt", maxAgeDays: 30 }
  ] } };
  const state = { present: true, dates: { "specs.json": "2026-08-14" }, tierSetDrift: 0 };
  assert.ok(!checkFreshness(cfg, goodManifest(), freshData(), "2026-08-14", state).fingerprint.includes("gearing"));
  const drift = checkFreshness(cfg, goodManifest(), freshData(), "2026-08-14",
    {...state, structuralSyncError:"recorded provenance differs from current inputs"});
  assert.ok(drift.fingerprint.includes("gearing-specs-sync"));
  assert.ok(drift.violations.some(v=>v.includes("recorded provenance differs")));
  const future = checkFreshness(cfg, goodManifest(), freshData(), "2026-08-13", state);
  assert.ok(future.violations.some(v=>v.includes("check date is in the future")));
});

test("weekly source verification alerts on missed runs, changed facts, errors and future receipts", () => {
  const cfg = { ...config, gearing: { datasets: [
    { key: "gearing-tier", file: "tier-items.json", dateField: "harvestedAt", maxAgeDays: 30 }
  ], verification: { maxAgeDays: 9, groups: ["tierBonuses"] } } };
  const state = { present: true, dates: { "tier-items.json": "2026-08-10" },
    verification: { groups: { tierBonuses: { status: "verified", reason: "Matches reviewed source", lastVerifiedAt: "2026-08-14T12:00:00.000Z" } } } };
  assert.ok(!checkFreshness(cfg, goodManifest(), freshData(), "2026-08-15", state).fingerprint.includes("gearing"));
  for (const stamp of ["2026-08-01T12:00:00.000Z", "2026-08-16T12:00:00.000Z", "invalid", null]) {
    const changed = structuredClone(state); changed.verification.groups.tierBonuses.lastVerifiedAt = stamp;
    assert.ok(checkFreshness(cfg, goodManifest(), freshData(), "2026-08-15", changed).fingerprint.includes("gearing-verify-tierBonuses"));
  }
  for (const changed of [
    { ...state, verification: null },
    { ...state, verificationError: "Published facts changed" },
    { ...state, verification: { groups: { tierBonuses: { ...state.verification.groups.tierBonuses, status: "review-required" } } } },
  ]) assert.ok(checkFreshness(cfg, goodManifest(), freshData(), "2026-08-15", changed).fingerprint.includes("gearing-verify-tierBonuses"));
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

test("anomaly gate: a consensus BLACKOUT is movement, not silence (2026-08-08)", () => {
  // The Season-2 flip shape: liveSeason moves to "s2" while every live list still verifies
  // as "s1", so consensusFor returns null for every cell. Before this guard, letter↔null
  // pairs were skipped, so total loss of coverage counted as ZERO moves and passed green —
  // the one event the gate most needs to see was the one it structurally could not.
  const before = state({ "X|One": ["S", "A"], "X|Two": ["A", "B"] });
  const after = state({ "X|One": [null, null], "X|Two": [null, null] });
  const bare = checkAnomaly(after, before, BANDS, config.anomaly, null);
  assert.equal(bare.total, 0, "no letter→letter move happened, and the gate should not invent one");
  assert.equal(bare.vanished, 4, "every cell lost its letter entirely");
  assert.ok(bare.errors.some(e => e.includes("COVERAGE LOSS")), "a blackout must fail red");

  // The deliberate case is acknowledged out loud, through the same human-only token.
  const acked = checkAnomaly(after, before, BANDS, config.anomaly, "S2 transition: liveSeason flipped 2026-08-18");
  assert.deepEqual(acked.errors, []);
  assert.ok(acked.notes.some(n => n.includes("acknowledged by trusted input")));

  // A cell ARRIVING (null → letter) is coverage recovering and must not be penalised.
  const recovering = checkAnomaly(before, after, BANDS, config.anomaly, null);
  assert.equal(recovering.vanished, 0);
  assert.deepEqual(recovering.errors, []);
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

/* --- per-source churn gate (audit 2026-10-04, F2) ---------------------------------- */

/* Two tier-list sources on their real scales, Method's four places and Icy Veins' seven,
   so one pair of letters can be one step on one scale and two on the other; a metrics
   source the gate must ignore; and 40 specs, the size of the real roster. */
const CHURN_LIMITS = { sourceChurn: { maxChangedLetters: 25, maxTwoStepChanges: 10 } };
const METHOD_TIERS = ["S", "A", "B", "C"];
const IV_TIERS = ["S+", "S", "A+", "A", "B+", "B", "C"];
// seasons: { raid, mplus } per page; an explicit null leaves seasonVerified off the page.
const churnPages = (id, seasons = {}) => ["raid", "mplus"].map(bracket => {
  const season = bracket in seasons ? seasons[bracket] : "s2";
  return { bracket, role: "All", url: `https://example.test/${id}/${bracket}`, ...(season == null ? {} : { seasonVerified: season }) };
});
const churnWorld = (seasons = {}) => ({
  sources: [
    { id: "method", kind: "tier-list", scale: "method", pages: churnPages("method", seasons.method) },
    { id: "icyveins", kind: "tier-list", scale: "icyveins", pages: churnPages("icyveins", seasons.icyveins) },
    { id: "murlok", kind: "metrics", pages: [] }
  ],
  scales: { scales: { method: { tiers: METHOD_TIERS }, icyveins: { tiers: IV_TIERS } } },
  specs: Array.from({ length: 40 }, (_, i) => ({ class: "K", spec: `S${i}`, ratings: {
    raid: { method: METHOD_TIERS[i % 4], icyveins: IV_TIERS[i % 7] },
    mplus: { method: METHOD_TIERS[(i + 1) % 4], icyveins: IV_TIERS[(i + 3) % 7] }
  } }))
});
// Rewrite one source+bracket's letter on the first n specs (every spec by default).
const relist = (world, id, bracket, fn, n = world.specs.length) => {
  const w = structuredClone(world);
  w.specs.slice(0, n).forEach((s, i) => { s.ratings[bracket][id] = fn(s.ratings[bracket][id], i); });
  return w;
};
const churnOf = (now, before, ack = null, order) =>
  checkSourceChurn(CHURN_LIMITS, now, { specs: before.specs }, before.sources, ack, order);
const oneUp = tiers => t => tiers[Math.max(0, tiers.indexOf(t) - 1)];

test("source churn: one outlet rewriting its whole list fails red, which the consensus gate cannot see (F2)", () => {
  const before = churnWorld();
  const r = churnOf(relist(before, "method", "raid", () => "S"), before);
  // Method raid holds S/A/B/C ten times each: 30 letters change, the 20 from B and C by two or more places.
  assert.deepEqual(r.pairs, [{ pair: "method:raid", changed: 30, twoStep: 20, advance: null }]);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /method:raid changed 30 of its letters .*20 of them by two or more steps/);
  assert.match(r.errors[0], /source_churn_ack input naming method:raid/);
  /* Both agent prompts let a run finish when check-refresh fails ONLY on its "mass-movement
     anomaly" check, with the evidence in anomalyAckProposal for the human. A real upstream
     rebuild needs exactly that path, so this wording is load-bearing. */
  assert.match(r.errors[0], /^mass-movement anomaly/);
});

test("source churn: the 2026-07-09 shape, a uniform one-tier shift, fails on the changed count alone", () => {
  // Method M+ on A/B/C only, so every letter can move up one place; 35 of 40 do, as on July 9.
  const before = relist(churnWorld(), "method", "mplus", (_, i) => ["A", "B", "C"][i % 3]);
  const r = churnOf(relist(before, "method", "mplus", oneUp(METHOD_TIERS), 35), before);
  assert.deepEqual(r.pairs, [{ pair: "method:mplus", changed: 35, twoStep: 0, advance: null }]);
  assert.equal(r.errors.length, 1, "no letter moved two places, and the count alone must still fire");
});

test("source churn: recuts within the limits pass; both limits are strict and steps count on the source's own scale", () => {
  const before = relist(churnWorld(), "method", "mplus", (_, i) => ["A", "B", "C"][i % 3]);
  // 25 one-step changes sit exactly on the limit and pass; the 26th fires.
  assert.deepEqual(churnOf(relist(before, "method", "mplus", oneUp(METHOD_TIERS), 25), before).errors, []);
  assert.equal(churnOf(relist(before, "method", "mplus", oneUp(METHOD_TIERS), 26), before).errors.length, 1);

  // Two-step changes: 10 pass, and an 11th fires although only 11 letters changed.
  const twoAway = t => IV_TIERS[IV_TIERS.indexOf(t) + 2] ?? IV_TIERS[IV_TIERS.indexOf(t) - 2];
  const ten = churnOf(relist(before, "icyveins", "raid", twoAway, 10), before);
  assert.deepEqual(ten.pairs, [{ pair: "icyveins:raid", changed: 10, twoStep: 10, advance: null }]);
  assert.deepEqual(ten.errors, []);
  const eleven = churnOf(relist(before, "icyveins", "raid", twoAway, 11), before);
  assert.equal(eleven.errors.length, 1);
  assert.match(eleven.errors[0], /icyveins:raid changed 11 of its letters .*11 of them/);

  // S → A is one place on Method's scale and two on Icy Veins' (S, A+, A).
  const sToA = t => (t === "S" ? "A" : t);
  const steps = churnOf(relist(relist(before, "method", "raid", sToA), "icyveins", "raid", sToA), before);
  assert.deepEqual(steps.pairs.map(p => [p.pair, p.changed, p.twoStep]), [["method:raid", 10, 0], ["icyveins:raid", 6, 6]]);

  // A letter the scale does not hold has no measurable distance, so it counts as two-step.
  const offScale = churnOf(relist(before, "method", "raid", () => "Z", 11), before);
  assert.equal(offScale.pairs[0].twoStep, 11);
  assert.equal(offScale.errors.length, 1);
});

test("source churn: a letter arriving or leaving, or a spec added or removed, is coverage and not churn", () => {
  const world = churnWorld();
  const before = relist(world, "method", "mplus", () => null, 30); // 30 M+ letters absent at HEAD arrive tonight…
  const now = relist(world, "method", "raid", () => null, 30);     // …while 30 raid letters leave
  now.specs.splice(39, 1);                                          // a spec leaves the roster
  now.specs.push({ class: "K", spec: "New", ratings: { raid: { method: "S" }, mplus: { method: "C" } } });
  const r = churnOf(now, before);
  assert.deepEqual(r.pairs, []);
  assert.deepEqual(r.errors, []);
});

test("source churn: a season advance exempts that source+bracket on the night it lands, ranked by seasonOrder", () => {
  // Method's raid page advances s1 → s2 tonight, and both of its lists are rewritten to all S.
  const before = churnWorld({ method: { raid: "s1", mplus: "s2" } });
  const now = relist(relist(churnWorld(), "method", "raid", () => "S"), "method", "mplus", () => "S");
  const r = churnOf(now, before);
  assert.deepEqual(r.pairs.map(p => [p.pair, p.advance]), [["method:raid", { from: "s1", to: "s2" }], ["method:mplus", null]]);
  assert.equal(r.errors.length, 1, "only the bracket whose season advanced is exempt");
  assert.match(r.errors[0], /method:mplus/);
  assert.ok(r.notes.some(n => /method:raid .*exempt: its seasonVerified advanced s1 → s2/.test(n)));
  const named = churnOf(now, before, "method:raid method:mplus — Method's new-season lists, <link>");
  assert.deepEqual(named.errors, []);
  assert.ok(named.notes.some(n => n.includes("method:raid, which its season advance already exempted")));

  // Errors left by an all-S raid rewrite when Method's raid page goes from `from` to `to`.
  const breachOf = (from, to, order) => churnOf(
    relist(churnWorld({ method: { raid: to } }), "method", "raid", () => "S"),
    churnWorld({ method: { raid: from } }), null, order).errors.length;
  assert.equal(breachOf("s1", "s2"), 0);
  assert.equal(breachOf("s2", "s1"), 1, "a backward move is no advance");
  assert.equal(breachOf(null, "s2"), 1, "a label appearing from nothing is no evidence of an advance");
  assert.equal(breachOf("s1", "s3"), 1, "a season PHASES.seasonOrder does not know has no rank");
  assert.equal(breachOf("s2", "s3", ["s1", "s2", "s3"]), 0, "…until the order declares it");
  // Ranked by the declared order, never by string: "s10" sorts below "s9" as text.
  const tenSeasons = Array.from({ length: 10 }, (_, i) => `s${i + 1}`);
  assert.equal(breachOf("s9", "s10", tenSeasons), 0);
  assert.equal(breachOf("s10", "s9", tenSeasons), 1);

  // An ancillary page feeds no letters, so its season cannot explain a letter rewrite.
  const withAncillary = season => {
    const w = churnWorld();
    w.sources[0].pages.push({ bracket: "raid", role: "All", label: "per-boss", url: "https://example.test/method/bosses", ancillary: true, seasonVerified: season });
    return w;
  };
  assert.equal(churnOf(relist(withAncillary("s2"), "method", "raid", () => "S"), withAncillary("s1")).errors.length, 1);
  // …nor can a letter page that turned ancillary the same night its label advanced.
  const turned = churnWorld({ method: { raid: "s2" } });
  turned.sources[0].pages[0].ancillary = true;
  assert.equal(churnOf(relist(turned, "method", "raid", () => "S"), churnWorld({ method: { raid: "s1" } })).errors.length, 1);

  // Pages are matched to their HEAD selves by full identity (url alone repeats in the registry).
  const prev = { pages: [{ bracket: "raid", role: "DPS", url: "https://example.test/a", seasonVerified: "s1" }] };
  const advanced = { pages: [{ ...prev.pages[0], seasonVerified: "s2" }] };
  assert.deepEqual(seasonAdvanceFor(prev, advanced, "raid"), { from: "s1", to: "s2" });
  assert.equal(seasonAdvanceFor(prev, advanced, "mplus"), null, "the other bracket did not advance");
  const added = { pages: [...prev.pages, { bracket: "raid", role: "Healer", url: "https://example.test/a", seasonVerified: "s2" }] };
  assert.equal(seasonAdvanceFor(prev, added, "raid"), null, "a page new tonight has no HEAD self to advance from");
  assert.equal(seasonAdvanceFor(null, advanced, "raid"), null, "no HEAD registry, no evidence");
});

test("source churn ack: a human names exactly the source:bracket pairs it waives", () => {
  const before = churnWorld();
  const now = relist(relist(before, "method", "raid", () => "S"), "method", "mplus", () => "S"); // both brackets breach
  assert.equal(churnOf(now, before).errors.length, 2);

  const one = churnOf(now, before, "method:raid — Method rebuilt its raid list, https://example.test/method/raid");
  assert.equal(one.errors.length, 1, "the pair it does not name still fails");
  assert.match(one.errors[0], /method:mplus/);
  assert.equal(one.acked.length, 1);
  assert.match(one.acked[0], /^method:raid changed 30/);
  assert.ok(one.notes.some(n => /1 finding\(s\) approved by human ack — method:raid — Method rebuilt/.test(n)),
    "what was waived, and why, must be printed");

  assert.deepEqual(churnOf(now, before, "METHOD:Raid, method:MPLUS: new-season lists, <link>").errors, [], "pairs are case-insensitive");

  const vague = churnOf(now, before, "Method rebuilt everything, trust me");
  assert.equal(vague.errors.length, 2, "an ack that names no pair waives nothing");
  assert.ok(vague.notes.some(n => n.includes("names no source:bracket pair")));

  // Near-misses are not pairs: a plural, a pair inside a URL. A pair that did not breach waives nothing.
  const nearMiss = "method:raids https://example.test/method:raid wowhead:mplus";
  assert.deepEqual([...parseChurnAck(nearMiss).pairs], ["wowhead:mplus"]);
  const near = churnOf(now, before, nearMiss);
  assert.equal(near.errors.length, 2);
  assert.ok(near.notes.some(n => n.includes("wowhead:mplus, which did not breach")));
  assert.equal(parseChurnAck("   "), null);
  assert.equal(parseChurnAck(null), null);
});

test("source churn: missing limits fail closed; no HEAD baseline skips, as the other HEAD guards do", async () => {
  const before = churnWorld();
  const now = relist(before, "method", "raid", () => "S");
  const unconfigured = checkSourceChurn({}, now, { specs: before.specs }, before.sources);
  assert.equal(unconfigured.errors.length, 1);
  assert.match(unconfigured.errors[0], /no usable sourceChurn limits/);
  assert.deepEqual(checkSourceChurn(CHURN_LIMITS, now, null, null), { errors: [], notes: [], acked: [], pairs: [] });

  // The real contract carries both limits, where Gate 0 keeps them out of the agent's reach.
  const required = JSON.parse(await readFile(new URL("../data/required-sources.json", import.meta.url), "utf8"));
  for (const k of ["maxChangedLetters", "maxTwoStepChanges"]) {
    assert.ok(Number.isInteger(required.sourceChurn?.[k]) && required.sourceChurn[k] > 0, `sourceChurn.${k}`);
  }
});

test("the source-churn ack is a third human-only token, wired through all three gate steps", async () => {
  const src = await readFile(new URL("../src/check-refresh.mjs", import.meta.url), "utf8");
  assert.match(src, /checkSourceChurn\(config, data, prevData, prevSources, churnAck\)/);
  const churnLine = src.split("\n").find(l => l.includes("const churnAck"));
  assert.ok(churnLine && churnLine.includes("SOURCE_CHURN_ACK"), "the churn gate reads its own env input: " + churnLine);
  // No fallback to another token, and never the agent-written manifest.
  for (const other of ["ANOMALY_ACK", "VALUE_MOVE_ACK", "trustedAck", "valueAck", "manifest"]) {
    assert.ok(!churnLine.includes(other), `the churn ack must not read ${other}: ${churnLine}`);
  }
  assert.match(src, /failures\.push\([^)]*\.\.\.churn\.errors\)/, "a churn breach must fail the run");
  assert.match(src, /waived by source-churn ack/, "a human must see WHAT their ack waived");

  /* Forwarded to the same three steps as the other two acks (audit 2026-09-04, F8): an ack
     only at publish would leave the primary check failing on the approved change, start a
     recovery agent, and redden the refresh job before publish could run. */
  const wf = await readFile(new URL("../.github/workflows/nightly.yml", import.meta.url), "utf8");
  const inputs = wf.slice(wf.indexOf("workflow_dispatch:"), wf.indexOf("\nconcurrency:"));
  assert.match(inputs, /\n      source_churn_ack:\r?\n/, "the separate input must be dispatchable");
  const envLine = "SOURCE_CHURN_ACK: ${{ inputs.source_churn_ack }}";
  for (const name of ["Check primary agent completion", "Final deterministic completion gate", '"Gate 3: refresh contract']) {
    const start = wf.indexOf(`- name: ${name}`);
    assert.ok(start >= 0, name);
    const next = wf.indexOf("\n      - name:", start + 1);
    assert.ok(wf.slice(start, next < 0 ? undefined : next).includes(envLine), `${name} must receive the churn ack`);
  }
  assert.equal(wf.split(envLine).length - 1, 3, "…and no other step, least of all an agent step, may see it");
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

test("age gate: the flip landed, so no SNAPSHOT_PHASE nag even past the due date", () => {
  // Pre-flip this asserted the OPPOSITE: "12.1-ptr" past PHASE_FLIP_DUE was a violation.
  // The 08-18 flip commit moved SNAPSHOT_PHASE off "12.1-ptr", and the gate tests the
  // phase VALUE (pinned by regex below), so it is silent at any date from here on —
  // flipping is the one action that may silence it, and it did.
  const after = checkFreshness(config, goodManifest(), freshData(), "2026-08-25");
  assert.ok(!after.violations.some(v => v.includes("SNAPSHOT_PHASE")), after.violations.join("\n"));
  assert.ok(!after.fingerprint.includes("snapshot-phase"));
});

test("age gate: the flip is NOT nagged before its due date", () => {
  // Season 2 opens 08-18 and the due date carries slack for a delayed launch. A gate
  // that fires early trains the owner to ignore it, which is worse than no gate.
  const before = checkFreshness(config, goodManifest(), freshData(), "2026-08-12");
  assert.ok(!before.violations.some(v => v.includes("SNAPSHOT_PHASE")), before.violations.join("\n"));
  assert.ok(!before.fingerprint.includes("snapshot-phase"));
});

/* The dated floor-restore gate (2026-08-19 audit, D1) — same one-shot shape as the
   phase-flip gate: 152dcc6 lowered minSuccessfulSources 7 -> 5 for the S2 transition
   with "restore ~09-01" recorded only in prose, and nothing would have noticed the date
   passing. The gate keys on the VALUE, so restoring it silences the check permanently. */
test("age gate: a below-full floor is nagged past its restore date, and only then", () => {
  const lowered = { ...config, minSuccessfulSources: 5 };
  // Before the due date: the transition window is legitimate, no nag.
  const before = checkFreshness(lowered, goodManifest(), freshData(), "2026-08-25");
  assert.ok(!before.violations.some(v => v.includes("minSuccessfulSources")), before.violations.join("\n"));
  assert.ok(!before.fingerprint.includes("min-sources-floor"));
  // Past it: red until restored. The date is read off the module so a reviewed extension
  // of the window (2026-09-03: 09-01 -> 10-01; 2026-09-25: 10-01 -> 11-01) moves this pin
  // with it instead of reddening it.
  const dayAfter = new Date(Date.parse(FLOOR_RESTORE_DUE) + 86400000).toISOString().slice(0, 10);
  const after = checkFreshness(lowered, goodManifest(), freshData(), dayAfter);
  assert.ok(after.violations.some(v => v.includes("minSuccessfulSources is still 5")), after.violations.join("\n"));
  assert.ok(after.fingerprint.includes("min-sources-floor"));
  // Restored (or absent — the fixture default): quiet at any date, forever.
  const restored = checkFreshness({ ...config, minSuccessfulSources: 7 }, goodManifest(), freshData(), "2027-01-01");
  assert.ok(!restored.violations.some(v => v.includes("minSuccessfulSources")), restored.violations.join("\n"));
  const absent = checkFreshness(config, goodManifest(), freshData(), "2027-01-01");
  assert.ok(!absent.fingerprint.includes("min-sources-floor"));
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

/* ---- the in-season label flip (12.1.5 owner decision 6) ----
   Same one-shot shape as the two gates above: a dated owner action (set PHASES.livePatch
   when 12.1.5 ships) that nothing else notices being missed. Dormant until the owner
   records the release date in LABEL_FLIP_DUE. Every fixture names its own liveLabel, so a
   later season flip in the real PHASES cannot change what these tests exercise. */

const LABEL_KEY = "live-patch-label";
const SEASON_OPENING = "12.1"; // fixture: the season's opening label, which a mid-season patch leaves in place
const labelFlipAt = (now, labelFlip) => checkFreshness(config, goodManifest(), freshData(), now, null,
  { labelFlip: { liveLabel: SEASON_OPENING, ...labelFlip } });

test("label-flip gate: inert while no due date is recorded, at any date", () => {
  for (const now of ["2026-09-25", "2027-06-01"]) {
    const r = labelFlipAt(now, { due: null, livePatch: null });
    assert.ok(!r.fingerprint.includes(LABEL_KEY), r.violations.join("\n"));
  }
  assert.equal(labelFlipViolation("2027-06-01", { due: null, livePatch: null, liveLabel: SEASON_OPENING }), null);
});

test("label-flip gate: due and unflipped is a violation from the due date itself", () => {
  const due = "2026-10-20";
  // The day before: legitimately not live yet, no nag.
  assert.ok(!labelFlipAt("2026-10-19", { due, livePatch: null }).fingerprint.includes(LABEL_KEY));
  // On the due date (inclusive) and after: red, with the owner action in the text.
  for (const now of [due, "2026-10-21T17:23:00Z"]) {
    const r = labelFlipAt(now, { due, livePatch: null });
    assert.ok(r.fingerprint.split(",").includes(LABEL_KEY), `fingerprint ${r.fingerprint}`);
    const v = r.violations.find(x => x.includes("PHASES.livePatch"));
    assert.match(v, /is unset on or after 2026-10-20 \(LABEL_FLIP_DUE, the recorded 12\.1\.5 release date\)/);
    assert.match(v, /still names 12\.1 as the live patch/);
    assert.match(v, /src\/normalize\.mjs/);
  }
  // A livePatch naming an OLDER patch is not the flip the gate is waiting for.
  assert.match(labelFlipViolation("2026-10-21", { due, expected: "12.1.5", livePatch: { label: "12.1", since: "2026-08-18" }, liveLabel: SEASON_OPENING }),
    /is "12\.1" on or after/);
});

test("label-flip gate: flipped is clean at every date, so setting livePatch silences it", () => {
  const due = "2026-10-20";
  const livePatch = { label: LABEL_FLIP_EXPECTED, since: "2026-10-20" };
  for (const now of [due, "2027-06-01"]) {
    const r = labelFlipAt(now, { due, livePatch });
    assert.ok(!r.fingerprint.includes(LABEL_KEY), r.violations.join("\n"));
  }
});

test("label-flip gate: one-shot, so later patches and the next season never re-arm it", () => {
  /* The gate asks whether the live patch is still OLDER than the expected one. A test for
     "different" would fire again the moment livePatch moved on, including the null that the
     field's own contract requires at the next season flip. The labels below are FIXTURES,
     not claims about future patches. */
  const due = "2026-10-20", expected = "12.1.5";
  const quiet = (now, livePatch, liveLabel) => labelFlipViolation(now, { due, expected, livePatch, liveLabel });
  assert.equal(quiet("2027-01-15", { label: "12.1.7", since: "2027-01-12" }, SEASON_OPENING), null,
    "a later in-season patch has passed the expected one");
  assert.equal(quiet("2027-06-01", null, "12.2"), null,
    "next season: livePatch back to null and liveLabel moved on");
  assert.equal(quiet("2027-06-01", { label: "13.0.5", since: "2027-05-01" }, "13.0"), null);
  // Still older is still red, at any distance past the due date.
  assert.match(quiet("2027-06-01", null, SEASON_OPENING), /is unset on or after/);
  // A label that is not purely dotted numbers cannot be ordered: exact equality decides.
  assert.match(quiet("2026-10-21", { label: "12.1.5 hotfix", since: "2026-10-20" }, SEASON_OPENING), /is "12\.1\.5 hotfix"/);
});

test("label-flip gate: a malformed due date is reported, never string-compared", () => {
  const r = labelFlipAt("2026-09-25", { due: "Oct 20", livePatch: null });
  assert.ok(r.fingerprint.split(",").includes(LABEL_KEY));
  assert.ok(r.violations.some(v => /LABEL_FLIP_DUE is "Oct 20", not an ISO date/.test(v)), r.violations.join("\n"));
});

test("label-flip gate: the real constants are well-formed and today's state is inert", () => {
  // Shape only, NOT a value pin: recording the release date is the owner's one-line
  // edit to LABEL_FLIP_DUE and must not need a test edit alongside it.
  assert.equal(typeof LABEL_FLIP_EXPECTED, "string");
  // Dotted numbers, or the gate can only test equality and stops being one-shot.
  assert.match(LABEL_FLIP_EXPECTED, /^\d+(\.\d+)*$/);
  assert.ok(LABEL_FLIP_DUE === null || /^\d{4}-\d{2}-\d{2}$/.test(LABEL_FLIP_DUE), `LABEL_FLIP_DUE ${LABEL_FLIP_DUE}`);
  if (LABEL_FLIP_DUE === null) {
    // No fixture: the module's own constants and PHASES, as the heartbeat runs them.
    const r = checkFreshness(config, goodManifest(), freshData(), "2027-06-01");
    assert.ok(!r.fingerprint.includes(LABEL_KEY), r.violations.join("\n"));
  }
});

test("heartbeat: every pipeline and owner-deadline key reds the run every day it persists", async () => {
  /* freshness.yml colours the run red on a NEW key, and every day only for keys matching
     PIPELINE_KEYS. A dated owner gate missing from that pattern would red once, then pass
     with a warning while its deadline stayed missed. Nothing tied the two files together
     until 2026-09-26, when live-patch-label arrived after the pattern was written. A new
     one-shot gate in checkFreshness belongs in this list and in PIPELINE_KEYS. */
  const yml = await readFile(new URL("../.github/workflows/freshness.yml", import.meta.url), "utf8");
  const m = yml.match(/^\s*PIPELINE_KEYS:\s*"([^"]+)"/m);
  assert.ok(m, "freshness.yml no longer declares PIPELINE_KEYS as a quoted env value");
  const pipeline = new RegExp(m[1]);
  for (const key of ["run-age", "snapshot-phase", "min-sources-floor", LABEL_KEY]) {
    assert.ok(pipeline.test(key), `PIPELINE_KEYS ${m[1]} does not match "${key}"`);
  }
  // Anchored: a source key that merely contains one of these words stays a news-only key.
  assert.ok(!pipeline.test(`x-${LABEL_KEY}`) && !pipeline.test("run-age-x"), `PIPELINE_KEYS ${m[1]} is not anchored`);
});

/* ---------- the published-date gate (docs/published-gate-scope.md, 2026-08-04) ---------- */

const pubConfig = { requirements: [
  { key: "gated", label: "Gated tiers", maxAgeDays: 4,
    published: { maxAgeDays: 9 },
    date: { type: "pages", sourceId: "gated" } }
] };
const pubData = (published = "2026-08-02", snapshot = "2026-08-04") => ({
  sources: [{ id: "gated", pages: [
    { bracket: "mplus", role: "DPS", url: "https://example.com/dps", snapshot, published }
  ] }],
  specs: [], encounterTiers: null
});
const pubEvidence = (resolved = "2026-08-02", extra = {}) => ({
  attemptedAt: "2026-08-04T10:38:00Z",
  pages: [{ key: "gated", url: "https://example.com/dps", httpStatus: 200,
    dateModified: resolved, lastUpdated: resolved, resolved, ...extra }]
});

test("published gate: a stored date the page contradicts fails red, both directions", () => {
  // The incident direction: stored stale, page moved on.
  const stale = checkPublished(pubConfig, pubData("2026-07-26"), null, pubEvidence("2026-08-02"), "2026-08-04");
  assert.equal(stale.errors.length, 1);
  assert.match(stale.errors[0], /stores published 2026-07-26 but the page itself says 2026-08-02/);
  // The other direction is an overclaim (or the practically-empty mid-run race) — also red.
  const over = checkPublished(pubConfig, pubData("2026-08-03"), null, pubEvidence("2026-08-02"), "2026-08-04");
  assert.equal(over.errors.length, 1);
  // Agreement is clean.
  const ok = checkPublished(pubConfig, pubData("2026-08-02"), null, pubEvidence("2026-08-02"), "2026-08-04");
  assert.deepEqual(ok.errors, []);
});

test("published gate: a date regressing vs the committed state is red with no evidence needed", () => {
  const prevSources = pubData("2026-08-02").sources;
  const r = checkPublished(pubConfig, pubData("2026-07-26"), prevSources, null, "2026-08-04");
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /regressed 2026-08-02 → 2026-07-26/);
  // Advancing (or holding) against the committed state is fine without evidence.
  const fwd = checkPublished(pubConfig, pubData("2026-08-02"), pubData("2026-07-26").sources, null, "2026-08-04");
  assert.deepEqual(fwd.errors, []);
  assert.ok(fwd.notes.some(n => n.includes("no published-date evidence")), "the skipped cross-check is stated");
});

test("published gate: our own fetch failing degrades, never red — and stale evidence vouches for nothing", () => {
  const unresolved = checkPublished(pubConfig, pubData("2026-07-26"), null,
    pubEvidence(null, { resolved: null, note: "http 503" }), "2026-08-04");
  assert.deepEqual(unresolved.errors, [], "an unreachable page must not fail the night");
  assert.equal(unresolved.degraded.length, 1);
  assert.match(unresolved.degraded[0], /degraded to the regression ratchet/);
  // Evidence from another day cannot vouch — that IS an error (mirrors the WCL rule).
  const old = checkPublished(pubConfig, pubData("2026-08-02"), null,
    { ...pubEvidence("2026-08-02"), attemptedAt: "2026-07-30T10:38:00Z" }, "2026-08-04");
  assert.ok(old.errors.some(e => e.includes("not from this run")));
});

test("published gate: a gate pointed at nothing is a config bug, not a silent pass", () => {
  const noPub = { sources: [{ id: "gated", pages: [{ bracket: "mplus", url: "https://example.com/dps", snapshot: "2026-08-04" }] }], specs: [], encounterTiers: null };
  const r = checkPublished(pubConfig, noPub, null, null, "2026-08-04");
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /none of its 1 registry pages carries a published field/);
  const badProbe = { requirements: [{ key: "x", published: { maxAgeDays: 9 }, date: { type: "metrics", source: "x" } }] };
  assert.match(checkPublished(badProbe, noPub, null, null, "2026-08-04").errors[0], /not pages-typed/);
  // Config problems recorded by the fetch step itself surface as errors too.
  const withProblems = checkPublished(pubConfig, pubData(), null,
    { ...pubEvidence(), problems: ["\"x\" page has no url to fetch"] }, "2026-08-04");
  assert.ok(withProblems.errors.some(e => e.includes("config problem recorded by the fetch step")));
});

test("published staleness is the heartbeat's half, with its own fingerprint key", () => {
  const cfg = { ...config, requirements: [...config.requirements, pubConfig.requirements[0]] };
  const data = (published) => ({ ...freshData(), sources: [...freshData().sources, pubData(published).sources[0]] });
  // 2 days old at a 9-day threshold: quiet.
  const quiet = checkFreshness(cfg, goodManifest(), data("2026-07-12"), "2026-07-14");
  assert.ok(!quiet.violations.some(v => v.includes("page self-date")));
  assert.ok(quiet.report.some(r => r.includes("gated published: 2026-07-12 (2d, max 9d)")), "the sweep reports even when quiet");
  // 10 days old: alarm, keyed distinctly from the snapshot-based age.
  const stale = checkFreshness(cfg, goodManifest(), data("2026-07-04"), "2026-07-14");
  assert.ok(stale.violations.some(v => v.includes("page self-date 2026-07-04 is 10 days old")));
  assert.ok(stale.fingerprint.split(",").includes("gated-published"));
  // A configured gate with no published field anywhere is a violation here too.
  const none = checkFreshness(cfg, goodManifest(), data(null), "2026-07-14");
  assert.ok(none.violations.some(v => v.includes("no page carries a published date")));
});
