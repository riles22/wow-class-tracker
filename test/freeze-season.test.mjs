import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lastSeasonVerifiedCommit, ARCHIVE } from "../src/freeze-season.mjs";
import { PHASES, sourceSeasonOk } from "../src/normalize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* These tests read real git history. The nightly's publish job checks out at fetch-depth 0
   (which is why freeze-season lives there and not agent-side), but a shallow CI checkout
   cannot answer the question at all — so probe once and skip rather than fail red on an
   environment fact that says nothing about the code. */
const deepHistory = (() => {
  try {
    const n = execFileSync("git", ["rev-list", "--count", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
    return Number(n) > 5;
  } catch { return false; }
})();

const archive = JSON.parse(await readFile(path.join(ROOT, ARCHIVE), "utf8").catch(() => "null"));
const registry = JSON.parse(await readFile(path.join(ROOT, "data/sources.json"), "utf8"));

test("every frozen record re-derives byte-identically from the commit it names", { skip: !deepHistory || !archive }, () => {
  // The record's whole claim is "these are the letters this outlet published at this
  // commit". If the letters and the sha ever disagree, the consensus is quietly serving
  // numbers with a false receipt — and nothing on the page would look wrong.
  let checked = 0;
  for (const [season, bySource] of Object.entries(archive)) {
    for (const [sourceId, brackets] of Object.entries(bySource)) {
      for (const [bracket, rec] of Object.entries(brackets)) {
        const specs = JSON.parse(execFileSync("git", ["show", `${rec.fromCommit}:data/specs.json`],
          { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }));
        const rederived = {};
        for (const spec of specs) {
          const tier = spec.ratings?.[bracket]?.[sourceId];
          if (tier !== undefined) rederived[`${spec.class}|${spec.spec}`] = tier;
        }
        assert.deepEqual(rec.letters, rederived,
          `${season}/${sourceId}/${bracket} does not match its own commit ${rec.fromCommit.slice(0, 7)}`);
        checked++;
      }
    }
  }
  assert.ok(checked > 0, "the archive exists but holds no records to verify");
});

test("a frozen record's commit really is the newest one still describing the live season", { skip: !deepHistory || !archive }, () => {
  // Guards against freezing too early (losing the outlet's last real update) or too late
  // (freezing letters that already describe the next season).
  for (const [season, bySource] of Object.entries(archive)) {
    if (season !== PHASES.liveSeason) continue;
    for (const [sourceId, brackets] of Object.entries(bySource)) {
      for (const [bracket, rec] of Object.entries(brackets)) {
        const found = lastSeasonVerifiedCommit(sourceId, bracket, { cwd: ROOT, liveSeason: season });
        assert.equal(found.sha, rec.fromCommit,
          `${sourceId}/${bracket}: archive names ${rec.fromCommit.slice(0, 7)}, derivation finds ${found.sha.slice(0, 7)}`);
      }
    }
  }
});

test("only a source that has actually moved ahead is frozen", () => {
  // An outlet still describing the live season must NOT have a frozen record: its live
  // letters are the truth, and a stale record would silently outrank them the day it flips.
  if (!archive) return;
  for (const [season, bySource] of Object.entries(archive)) {
    if (season !== PHASES.liveSeason) continue;
    for (const [sourceId, brackets] of Object.entries(bySource)) {
      const source = registry.find(s => s.id === sourceId);
      assert.ok(source, `${sourceId} is frozen but not in the registry`);
      for (const bracket of Object.keys(brackets)) {
        assert.equal(sourceSeasonOk(source, bracket, season), false,
          `${sourceId}/${bracket} still describes ${season} — it must not carry a frozen record`);
      }
    }
  }
});

test("the walk refuses to guess when no commit describes the season", { skip: !deepHistory }, () => {
  // No commit has ever described a season "s3", so there is no honest freeze point. The
  // failure mode this guards against is writing an EMPTY record, which would drop the
  // source from the consensus while looking like a successful freeze.
  assert.throws(
    () => lastSeasonVerifiedCommit("wowhead", "raid", { cwd: ROOT, liveSeason: "s3", max: 50 }),
    /Refusing to guess/);
  // An unknown source id is the same class of error, never a silent empty.
  assert.throws(
    () => lastSeasonVerifiedCommit("not-a-source", "raid", { cwd: ROOT, max: 50 }),
    /Refusing to guess/);
});

test("a source that never left the live season needs no freeze", { skip: !deepHistory }, () => {
  // icyveins/method/archon are all still s1: the newest qualifying commit is HEAD itself.
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  for (const id of ["icyveins", "method", "archon"]) {
    const found = lastSeasonVerifiedCommit(id, "raid", { cwd: ROOT, liveSeason: PHASES.liveSeason });
    assert.equal(found.sha, head, `${id} has not flipped, so HEAD must already qualify`);
  }
});
