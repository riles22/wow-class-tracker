import { test } from "node:test";
import assert from "node:assert/strict";
import { validateStartedAt, validateManifestProvenance } from "../src/check-manifest-provenance.mjs";

const config = {
  requirements: [
    { key: "alpha", date: { type: "pages", sourceId: "alpha" } },
    { key: "feed", date: null }
  ]
};

const data = date => ({
  sources: [{ id: "alpha", pages: [{ snapshot: date }] }],
  specs: [],
  encounterTiers: null
});

const manifest = () => ({
  run: "2026-07-16",
  startedAt: "2026-07-16T10:15:00Z",
  summary: "test",
  sources: [
    { source: "alpha", result: "success", previousAsOf: "2026-07-15", newAsOf: "2026-07-16" },
    { source: "feed", result: "success", previousAsOf: null, newAsOf: null }
  ]
});

const now = new Date("2026-07-16T11:00:00Z");

test("fresh manifest provenance matches the committed baseline and final data", () => {
  assert.deepEqual(validateManifestProvenance(config, manifest(), data("2026-07-16"), data("2026-07-15"), now), []);
});

test("startedAt must be current, UTC, and match the run date", () => {
  assert.deepEqual(validateStartedAt({ run: "2026-07-16", startedAt: "2026-07-16T10:15:00Z" }, now), []);
  assert.ok(validateStartedAt({ run: "2026-07-16", startedAt: "2026-07-15T10:15:00Z" }, now).some(e => e.includes("does not match run")));
  assert.ok(validateStartedAt({ run: "2026-07-16", startedAt: "2026-07-16 10:15:00" }, now).some(e => e.includes("full UTC")));
  assert.ok(validateStartedAt({ run: "2026-07-16", startedAt: "2026-07-16T07:00:00Z" }, now).some(e => e.includes("3-hour")));
});

test("manifest dates cannot disagree with either side of the git comparison", () => {
  const badPrevious = manifest();
  badPrevious.sources[0].previousAsOf = "2026-07-14";
  assert.ok(validateManifestProvenance(config, badPrevious, data("2026-07-16"), data("2026-07-15"), now).some(e => e.includes("committed baseline")));

  const badNew = manifest();
  badNew.sources[0].newAsOf = "2026-07-15";
  assert.ok(validateManifestProvenance(config, badNew, data("2026-07-16"), data("2026-07-15"), now).some(e => e.includes("final stored data")));
});

test("agent-authored anomaly acknowledgements are rejected", () => {
  const m = manifest();
  m.anomalyAck = "trust me";
  assert.ok(validateManifestProvenance(config, m, data("2026-07-16"), data("2026-07-15"), now).some(e => e.includes("not permitted")));
});

test("date regressions and non-null undated feed claims fail", () => {
  assert.ok(validateManifestProvenance(config, manifest(), data("2026-07-14"), data("2026-07-15"), now).some(e => e.includes("regressed")));
  const m = manifest();
  m.sources[1].newAsOf = "2026-07-16";
  assert.ok(validateManifestProvenance(config, m, data("2026-07-16"), data("2026-07-15"), now).some(e => e.includes('"feed" newAsOf')));
});
