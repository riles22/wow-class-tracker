import { test } from "node:test";
import assert from "node:assert/strict";
import { verdictFor, spacedName, medianOf, buildDummyRawRows } from "../src/fetch-wcl.mjs";

/* The deterministic WCL fetch stage's verdict mapping — the publish gate and the
   nightly agent both key off these verdicts, so the branches are pinned here.
   (Transport itself is network-bound and exercised by the dispatch-only probe
   workflow, not unit tests.) */

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
