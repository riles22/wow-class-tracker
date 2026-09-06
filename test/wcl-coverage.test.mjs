import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createWclCoverage, validateWclCoverage } from "../src/wcl-coverage.mjs";
import { LIVE_LEADERBOARDS } from "../src/wcl-live.mjs";

const specs = JSON.parse(await readFile(new URL("../data/specs.json", import.meta.url)));
const stamp = "2026-09-05T10:00:00.000Z";
function receipt() {
  return { schemaVersion: 2, liveSeason: "s2", attemptedAt: stamp, verdict: "success",
    privateToken: "NEVER-PUBLISH-THIS", brackets: Object.fromEntries(LIVE_LEADERBOARDS.brackets.map(cfg => [cfg.key, {
      cuts: cfg.encounters.flatMap(e => specs.map(s => ({ class: s.class, spec: s.spec, encounterId: e.id,
        status: "success", samples: 100, observedAt: stamp, detail: "NEVER-PUBLISH-THIS" }))),
    }])) };
}
test("public coverage includes empty encounters without copying private/error payloads", () => {
  const e = receipt(), raid = e.brackets["wcl-leaderboard-raid"].cuts;
  for (const c of raid.filter(c => c.encounterId === 3492)) Object.assign(c, { status: "sparse", samples: 0 });
  raid[0].status = "unreachable";
  const coverage = createWclCoverage(e, specs);
  assert.equal(coverage.cuts.length, 640);
  assert.equal(coverage.encounters.raid.length, 8);
  assert.equal(coverage.cuts.filter(c => c.status === "insufficient").length, 40);
  assert.equal(coverage.cuts[0].status, "failed");
  assert.equal(coverage.cuts[0].checkedAt, null);
  assert.equal(Object.hasOwn(coverage.cuts[0], "entries"), false);
  assert.ok(!JSON.stringify(coverage).includes("NEVER-PUBLISH-THIS"));
  assert.deepEqual(validateWclCoverage(coverage, { specs }), []);
});
test("authentication failure records all cuts as unverified, never empty or successful", () => {
  const coverage = createWclCoverage({ ...receipt(), brackets: {}, verdict: "oauth-failed" }, specs);
  assert.ok(coverage.cuts.every(c => c.status === "failed" && c.checkedAt === null));
  assert.throws(() => createWclCoverage({ ...receipt(), brackets: {} }, specs), /missing coverage/);
});
test("coverage rejects duplicate, missing and unknown spec/encounter receipts", () => {
  for (const change of [cuts => cuts.pop(), cuts => { cuts[1] = cuts[0]; }, cuts => { cuts[0].encounterId = 3379; }]) {
    const e = receipt(); change(e.brackets["wcl-leaderboard-raid"].cuts);
    assert.throws(() => createWclCoverage(e, specs), /coverage/);
  }
});
test("coverage validates sparse counts, future dates, failed verification claims and unexpected data", () => {
  for (const change of [
    c => { c.cuts[0].status = "insufficient"; c.cuts[0].reason = "Fewer than 10 ranked entries"; },
    c => { c.cuts[0].checkedAt = "2999-01-01T00:00:00.000Z"; },
    c => { c.encounters.raid[0].name = "Wrong encounter"; },
    c => { c.cuts[0].playerName = "Private"; },
    c => { c.privateToken = "Private"; },
    c => { c.cuts[1] = structuredClone(c.cuts[0]); },
  ]) {
    const c = createWclCoverage(receipt(), specs); change(c);
    assert.ok(validateWclCoverage(c, { specs }).length);
  }
});
test("a merge failure cannot present collected values as published coverage", () => {
  const coverage = createWclCoverage({ ...receipt(), verdict: "merge-failed" }, specs);
  assert.ok(coverage.cuts.every(c => c.status === "failed"));
});
