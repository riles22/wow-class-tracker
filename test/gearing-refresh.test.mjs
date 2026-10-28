import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { checkGearingGuides, GEARING_GUIDE_SOURCES } from "../src/check-gearing-guides.mjs";
import { surfaceGuideRefresh, workflowCommand } from "../src/surface-guide-refresh.mjs";

const roster = ["A Fixture", "B Fixture", "C Fixture", "D Fixture"];
const options = { roster, nowDate: "2026-09-05" };
const clone = (value) => structuredClone(value);
function documents({ legacy = false } = {}) {
  return Object.fromEntries(Object.entries(GEARING_GUIDE_SOURCES).map(([sourceId, source]) => [sourceId, {
    schemaVersion: 1, sourceId, source, dated: true, harvestedAt: "2026-09-01",
    specs: Object.fromEntries(roster.map((key) => [key, {
      guideUrl: "https://example.com/fixture", published: "2026-08-30",
      ...(!legacy ? { verifiedAt: "2026-09-01" } : {}),
      priorities: Array.from({ length: 2 }, () => ({ secondaries: ["Crit", "Haste", "Mast", "Vers"] })),
      bis: Array.from({ length: 4 }, (_, i) => ({ itemId: String(i + 1), slot: "Head", list: "overall" })),
      trinketTiers: [{ tier: "S", itemIds: ["11", "12"] }, { tier: "A", itemIds: ["13", "14"] }],
      enhancements: {
        enchants: [{ slot: "Head", candidates: [{ id: "21", name: "Fixture Enchant" }] }],
        gems: { unique: [{ id: "22", name: "Fixture Diamond" }], filler: [{ id: "23", name: "Fixture Garnet" }] },
        consumables: { flask: [{ id: "24", name: "Fixture Flask" }], note: "prose is never a candidate" },
      },
    }])), coverage: { specsHarvested: roster.length, specsAbsent: [] },
  }]));
}
function refreshed(previous = documents()) {
  const next = clone(previous);
  for (const doc of Object.values(next)) {
    doc.harvestedAt = "2026-09-05";
    for (const record of Object.values(doc.specs)) record.verifiedAt = "2026-09-05";
  }
  return next;
}
function absent(doc, keys) {
  for (const key of keys) {
    delete doc.specs[key];
    doc.coverage.specsAbsent.push({ spec: key, reason: "HTTP 404 confirmed: no guide", verifiedAt: doc.harvestedAt });
  }
  doc.coverage.specsHarvested = Object.keys(doc.specs).length;
}

test("guide gate permits unchanged legacy receipts and fully migrated successful refreshes", () => {
  const prior = documents({ legacy: true });
  assert.deepEqual(checkGearingGuides(prior, clone(prior), options).changedSources, []);
  const result = checkGearingGuides(prior, refreshed(prior), options);
  assert.deepEqual(result.changedSources, Object.keys(GEARING_GUIDE_SOURCES));
  assert.deepEqual(result.sources[0].after,
    { specs: 4, priorities: 8, bis: 16, enhancements: 16, trinketTiers: 16 });
  const onlyOne = clone(prior);
  onlyOne.icyveins = refreshed(prior).icyveins;
  assert.deepEqual(checkGearingGuides(prior, onlyOne, options).changedSources, ["icyveins"]);
});

test("guide gate independently rejects large drops in spec, priority, BiS, enhancement and trinket-tier coverage", () => {
  const prior = documents();
  const boundary = refreshed();
  absent(boundary.icyveins, roster.slice(0, 1));
  assert.equal(checkGearingGuides(prior, boundary, options).sources[0].after.specs, 3,
    "a precisely 25% drop does not exceed the bound");
  const wipe = refreshed();
  absent(wipe.icyveins, roster);
  assert.throws(() => checkGearingGuides(prior, wipe, options), /specs dropped by more than 25%/);
  const fewerPriorities = refreshed();
  for (const record of Object.values(fewerPriorities.wowhead.specs)) record.priorities.pop();
  assert.throws(() => checkGearingGuides(prior, fewerPriorities, options), /priorities dropped by more than 25%/);
  const fewerItems = refreshed();
  for (const record of Object.values(fewerItems.method.specs)) record.bis.splice(2);
  assert.throws(() => checkGearingGuides(prior, fewerItems, options), /bis dropped by more than 25%/);
  // the 2026-10-14 shape: BiS and priorities intact, the two side lanes parsed to nothing
  const noEnhancements = refreshed();
  for (const record of Object.values(noEnhancements.icyveins.specs)) delete record.enhancements;
  assert.throws(() => checkGearingGuides(prior, noEnhancements, options), /enhancements dropped by more than 25%/);
  const noTiers = refreshed();
  for (const record of Object.values(noTiers.icyveins.specs)) record.trinketTiers = [];
  assert.throws(() => checkGearingGuides(prior, noTiers, options), /trinketTiers dropped by more than 25%/);
});

test("guide gate rejects malformed enhancement and trinket-tier blocks", () => {
  const prior = documents();
  for (const enhancements of ["gems", { enchants: {} }, { gems: { unique: "x" } }, { consumables: { flask: 1 } }]) {
    const next = refreshed();
    next.icyveins.specs[roster[0]].enhancements = enhancements;
    assert.throws(() => checkGearingGuides(prior, next, options), /malformed enhancements block/);
  }
  for (const trinketTiers of [{}, [null], [{ tier: "S" }], [{ tier: "S", itemIds: ["item=1"] }]]) {
    const next = refreshed();
    next.icyveins.specs[roster[0]].trinketTiers = trinketTiers;
    assert.throws(() => checkGearingGuides(prior, next, options), /malformed trinket tier row/);
  }
});

test("guide gate rejects identity/schema mutation and incomplete or conflicting roster coverage", () => {
  const prior = documents();
  for (const field of ["schemaVersion", "source", "sourceId", "dated"]) {
    const current = refreshed();
    current.icyveins[field] = field === "schemaVersion" ? 2 : "changed";
    assert.throws(() => checkGearingGuides(prior, current, options), /identity or schema/);
  }
  const sourceSet = refreshed();
  delete sourceSet.method;
  assert.throws(() => checkGearingGuides(prior, sourceSet, options), /source set changed/);
  const unknown = refreshed();
  unknown.icyveins.specs.Unknown = unknown.icyveins.specs[roster[0]];
  unknown.icyveins.coverage.specsHarvested++;
  assert.throws(() => checkGearingGuides(prior, unknown, options), /unknown roster/);
  const missing = refreshed();
  delete missing.icyveins.specs[roster[0]];
  missing.icyveins.coverage.specsHarvested--;
  assert.throws(() => checkGearingGuides(prior, missing, options), /complete trusted roster/);
  const duplicate = refreshed();
  duplicate.icyveins.coverage.specsAbsent.push({ spec: roster[0], reason: "HTTP 404", verifiedAt: "2026-09-05" });
  assert.throws(() => checkGearingGuides(prior, duplicate, options), /duplicate\/conflicting/);
});

test("guide gate rejects missing/invalid/regressed verification and disguised fetch failures", () => {
  const prior = documents({ legacy: true });
  for (const date of [undefined, null, "", "2026-02-30", "2026-09-06"]) {
    const next = refreshed(prior);
    next.icyveins.specs[roster[0]].verifiedAt = date;
    assert.throws(() => checkGearingGuides(prior, next, options), /verification date/);
  }
  const regress = refreshed(prior);
  regress.icyveins.harvestedAt = regress.icyveins.specs[roster[0]].verifiedAt = "2026-08-31";
  assert.throws(() => checkGearingGuides(prior, regress, options), /regressed/);
  const falseFresh = refreshed(prior);
  falseFresh.icyveins.specs[roster[0]].verifiedAt = "2026-09-01";
  assert.throws(() => checkGearingGuides(prior, falseFresh, options), /oldest verification/);
  const pending = refreshed(prior);
  pending.icyveins.coverage.specsPending = [{ spec: roster[0], reason: "HTTP 403" }];
  assert.throws(() => checkGearingGuides(prior, pending, options), /pending or failed retrievals/);
  const error = refreshed(prior);
  absent(error.icyveins, roster.slice(0, 1));
  error.icyveins.coverage.specsAbsent[0].reason = "HTTP 403 blocked";
  assert.throws(() => checkGearingGuides(prior, error, options), /failure was recorded as verified absence/);
  delete error.icyveins.coverage.specsAbsent[0].verifiedAt;
  error.icyveins.coverage.specsAbsent[0].reason = "HTTP 404";
  assert.throws(() => checkGearingGuides(prior, error, options), /verification date/);
});

test("a harvest stopped by transport failures warns; every other unsuccessful harvest fails the run", () => {
  const ok = { icyveins: "success", wowhead: "success", method: "success" };
  assert.deepEqual(surfaceGuideRefresh(ok), {
    summary: ["Icy Veins: verified", "Wowhead: verified", "Method: verified"], warnings: [], errors: [] });
  // the 2026-10-27 run: Icy Veins behind Cloudflare, Wowhead behind the AWS WAF challenge
  const stage = (sourceId, reason) => ({ sourceId, blocked: { at: "2026-10-27", reason } });
  const walled = surfaceGuideRefresh({ ...ok, icyveins: "failure", wowhead: "failure" }, {
    icyveins: stage("icyveins", "fetch failed for https://example.com/a: HTTP 403"),
    wowhead: stage("wowhead", "curl fetch failed for https://example.com/b: HTTP 202"),
  }, { icyveins: "2026-09-22", wowhead: "2026-09-30" });
  assert.deepEqual(walled.errors, []);
  assert.deepEqual(walled.warnings, [
    "Icy Veins: blocked (fetch failed for https://example.com/a: HTTP 403); published guide unchanged, verified through 2026-09-22",
    "Wowhead: blocked (curl fetch failed for https://example.com/b: HTTP 202); published guide unchanged, verified through 2026-09-30",
  ]);
  // no block marker (a parse failure, recipe drift, scattered failures), a marker without a
  // reason, or another source's staging: the failure stays red
  for (const staged of [undefined, null, { sourceId: "method", failures: { "Frost Mage": { reason: "markup missing" } } },
    { sourceId: "method", blocked: {} }, { sourceId: "method", blocked: { reason: "" } }, stage("wowhead", "HTTP 403")]) {
    const result = surfaceGuideRefresh({ ...ok, method: "failure" }, { method: staged });
    assert.deepEqual(result.warnings, []);
    assert.match(result.errors.join("\n"), /^Method: harvest failure and not a transport block; published guide unchanged\./);
  }
  // an outcome that is not a plain failure fails closed, block marker or not
  for (const outcome of [undefined, "", "cancelled", "skipped"]) {
    const result = surfaceGuideRefresh({ ...ok, wowhead: outcome }, { wowhead: stage("wowhead", "HTTP 403") });
    assert.equal(result.warnings.length, 0);
    assert.equal(result.errors.length, 1, String(outcome));
  }
});

test("a surfaced message stays on its workflow command's line", () => {
  assert.equal(workflowCommand("warning", "a\r\n::error::b 100%"), "::warning::a%0D%0A::error::b 100%25");
});

test("guide gate accepts the current complete three-source roster without changing its evidence", async () => {
  const read = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
  const tracker = await read("data/specs.json");
  const docs = Object.fromEntries(await Promise.all(Object.keys(GEARING_GUIDE_SOURCES).map(async (id) =>
    [id, await read(`gearing/data/guides/${id}.json`)])));
  const result = checkGearingGuides(docs, clone(docs), {
    roster: tracker.map((s) => `${s.spec} ${s.class}`), nowDate: new Date().toISOString().slice(0, 10),
  });
  assert.deepEqual(result.changedSources, []);
  assert.ok(result.sources.every((source) => source.after.specs === 40));
  assert.ok(result.sources.every((source) => source.after.priorities > 0 && source.after.bis > 0));
});
