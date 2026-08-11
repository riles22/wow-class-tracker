import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdtemp, cp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lastSeasonVerifiedCommit, freezeSeason, ARCHIVE } from "../src/freeze-season.mjs";
import { PHASES, sourceSeasonOk, seasonRank } from "../src/normalize.mjs";

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
  /* Two failure directions, and asserting only the first is what let the BEHIND bug ship.
     `sourceSeasonOk === false` says "not describing the live season", which is equally true
     of an outlet that has moved ON and one that is LAGGING. Freezing a laggard writes its
     stale letters as a permanent record in an append-only archive (measured at the 12.1
     flip: 159 letters, 36 of 80 consensus letters moved). So assert the real invariant —
     at least one page of the bracket has moved PAST the live season. That covers a fully
     flipped outlet and a mid-rebuild split alike, and excludes a laggard. */
  if (!archive) return;
  const liveRank = seasonRank(PHASES.liveSeason);
  for (const [season, bySource] of Object.entries(archive)) {
    if (season !== PHASES.liveSeason) continue;
    for (const [sourceId, brackets] of Object.entries(bySource)) {
      const source = registry.find(s => s.id === sourceId);
      assert.ok(source, `${sourceId} is frozen but not in the registry`);
      for (const bracket of Object.keys(brackets)) {
        assert.equal(sourceSeasonOk(source, bracket, season), false,
          `${sourceId}/${bracket} still describes ${season} — it must not carry a frozen record`);
        const moved = (source.pages ?? [])
          .filter(p => p.bracket === bracket)
          .some(p => { const r = seasonRank(p.seasonVerified); return r != null && r > liveRank; });
        assert.ok(moved,
          `${sourceId}/${bracket} carries a frozen record but no page has moved past ${season} — a LAGGING outlet must never be frozen, it must drop out of the consensus until it catches up`);
      }
    }
  }
});

test("freezeSeason refuses to freeze an outlet that is merely BEHIND", { skip: !deepHistory }, async () => {
  /* The regression test for the headline fix. At the 12.1 flip (liveSeason s2) method and
     archon are still s1 — behind, not ahead. The pre-fix code froze them from e65332a, the
     commit that ADDED `seasonVerified` and where no page carried it, because `sourceSeasonOk`
     is vacuously true wherever the field is absent. Reverting either half of the fix must
     turn this red. Runs against a throwaway copy so the real archive is untouched. */
  const dir = await mkdtemp(path.join(tmpdir(), "freeze-test-"));
  try {
    await cp(path.join(ROOT, "data"), path.join(dir, "data"), { recursive: true });
    await cp(path.join(ROOT, ".git"), path.join(dir, ".git"), { recursive: true });
    const res = await freezeSeason(dir, { liveSeason: "s2", today: "2026-08-18" });
    assert.deepEqual(res.added, [], "a lagging outlet must not be frozen at the flip");
    for (const pair of ["method/raid", "method/mplus", "archon/raid", "archon/mplus"]) {
      assert.ok(res.behind.includes(pair), `${pair} is behind at s2 and must be reported as such`);
    }
    const written = JSON.parse(await readFile(path.join(dir, ARCHIVE), "utf8"));
    assert.equal(written.s2, undefined, "no s2 records may be written while every outlet is behind");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("freezeSeason DOES freeze a bracket whose pages are split mid-rebuild", { skip: !deepHistory }, async () => {
  /* `aheadSeasonFor` returns null for a split bracket (never mix two seasons in one forecast
     term) — but that is a different question from whether to preserve the outlet's last
     single-season letters. consensusFor has already dropped it, so skipping the freeze would
     recompose the mean and publish a registry decision as spec movement (measured on a staged
     Archon raid flip: 40 cells lose a contributor, 9 published letters move). */
  const dir = await mkdtemp(path.join(tmpdir(), "freeze-split-"));
  try {
    await cp(path.join(ROOT, "data"), path.join(dir, "data"), { recursive: true });
    await cp(path.join(ROOT, ".git"), path.join(dir, ".git"), { recursive: true });
    const srcPath = path.join(dir, "data", "sources.json");
    const reg = JSON.parse(await readFile(srcPath, "utf8"));
    const archon = reg.find(s => s.id === "archon");
    const raidPages = archon.pages.filter(p => p.bracket === "raid");
    assert.ok(raidPages.length > 1, "fixture needs a multi-page bracket to split");
    raidPages[0].seasonVerified = "s2";           // one page moves on, the rest stay s1
    await writeFile(srcPath, JSON.stringify(reg, null, 2) + "\n");

    const res = await freezeSeason(dir, { liveSeason: "s1", today: "2026-08-12" });
    assert.ok(res.split.includes("archon/raid"), "a split bracket must be reported as split, not behind");
    assert.ok(!res.behind.includes("archon/raid"), "a split bracket is leaving, not lagging");
    assert.ok(res.added.some(a => a.source === "archon" && a.bracket === "raid"),
      "a split bracket must be frozen so the consensus keeps its composition while it rebuilds");
  } finally { await rm(dir, { recursive: true, force: true }); }
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

test("a source that never left the live season needs no freeze", { skip: !deepHistory }, t => {
  /* The still-live set is DERIVED, never hardcoded. It was a literal ["icyveins","method",
     "archon"] until 2026-08-11, when the nightly correctly flipped Icy Veins to s2 and this
     assertion went red on a stale premise — a failure that only surfaces AFTER the flipping
     commit lands, and only in a deep checkout, so the publish gate is the first thing to see
     it. Deleting the flipped id would just re-arm the same trap for method and archon.

     Read the registry from `git show HEAD:` rather than the working tree: in the publish job
     the tree is the refresh agent's artifact overlay and can disagree with the commit whose
     history `lastSeasonVerifiedCommit` walks, which would make this spuriously red (or
     vacuously green) for reasons that say nothing about the code. */
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  const atHead = JSON.parse(execFileSync("git", ["show", `${head}:data/sources.json`],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }));

  let checked = 0;
  for (const source of atHead.filter(s => s.kind === "tier-list" && (s.era ?? "live") === "live")) {
    for (const bracket of [...new Set((source.pages ?? []).map(p => p.bracket))].filter(Boolean)) {
      /* Select with the predicate PRODUCTION uses, not the looser `sourceSeasonOk`. The walk
         requires an explicit `seasonVerified === liveSeason`; selecting on sourceSeasonOk —
         which is vacuously true where the field is absent — would pull in a source that has
         simply never been era-verified (a newly registered outlet, before its first
         refresh-tiers run) and turn a legitimate publish red with "Refusing to guess". */
      const pages = (source.pages ?? []).filter(p => p.bracket === bracket);
      if (!pages.every(p => p.seasonVerified === PHASES.liveSeason)) continue;
      const found = lastSeasonVerifiedCommit(source.id, bracket, { cwd: ROOT, liveSeason: PHASES.liveSeason });
      assert.equal(found.sha, head,
        `${source.id}/${bracket} still describes ${PHASES.liveSeason}, so HEAD must already qualify`);
      checked++;
    }
  }
  /* Once every outlet has flipped there is nothing left to check. That is a REAL event with a
     date — the Season-2 transition — not a defect, so it must not fail the publish gate:
     Gate 1 runs this suite, and a hard failure here would block every night between the last
     outlet flipping and the owner flipping PHASES.liveSeason. Skipping reports the expiry
     just as loudly without costing a publishable night. */
  if (checked === 0) {
    t.skip("no live-season source/bracket pairs remain — every outlet has moved ahead, so this assertion has expired and should be retired with the season transition");
  }
});
