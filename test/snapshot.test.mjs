/* Snapshot writer tests.

   There were none until 2026-08-11, and the gap had a cost: `frozen: true` — the one-shot
   declaration naming the forecast the report card grades — was silently dropped whenever a
   second run wrote the same UTC date, which is exactly what happened on 12.1 launch day.
   These tests pin the carry-forward and the artifact's immutability. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, cp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { snapshot } from "../src/snapshot.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* A throwaway repo root holding only what loadData needs, so the real data/history is
   never written by a test run. */
async function sandbox() {
  const dir = await mkdtemp(path.join(tmpdir(), "snap-test-"));
  await mkdir(path.join(dir, "data"), { recursive: true });
  await cp(path.join(ROOT, "data"), path.join(dir, "data"), { recursive: true });
  await rm(path.join(dir, "data", "history"), { recursive: true, force: true });
  await rm(path.join(dir, "data", "forecasts"), { recursive: true, force: true });
  await mkdir(path.join(dir, "data", "history"), { recursive: true });
  return dir;
}

const readSnap = async (dir, date) =>
  JSON.parse(await readFile(path.join(dir, "data", "history", `${date}.json`), "utf8"));

test("a plain re-snapshot PRESERVES an existing freeze declaration", async () => {
  /* The 2026-08-11 regression, pinned. --frozen ran at 02:52Z and the 10:37Z nightly
     overwrote the same UTC-dated file; the flag vanished from all 36 history files and
     launchPair fell back to inferring the freeze point from recency. */
  const dir = await sandbox();
  try {
    await snapshot(dir, "2026-08-11", { frozen: true });
    assert.equal((await readSnap(dir, "2026-08-11")).frozen, true, "freeze declaration should be written");

    await snapshot(dir, "2026-08-11");                    // the nightly, no --frozen
    assert.equal((await readSnap(dir, "2026-08-11")).frozen, true,
      "a same-date rewrite must carry the freeze declaration forward, not drop it");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("a re-snapshot on a DIFFERENT date does not inherit the flag", async () => {
  // Carry-forward is per-file, not sticky: only the declared date is the frozen forecast.
  const dir = await sandbox();
  try {
    await snapshot(dir, "2026-08-11", { frozen: true });
    await snapshot(dir, "2026-08-12");
    assert.equal((await readSnap(dir, "2026-08-12")).frozen, undefined,
      "a later date must not inherit a freeze declaration");
    assert.equal((await readSnap(dir, "2026-08-11")).frozen, true);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("an ordinary snapshot writes no frozen key at all", async () => {
  const dir = await sandbox();
  try {
    await snapshot(dir, "2026-08-11");
    const snap = await readSnap(dir, "2026-08-11");
    assert.equal(snap.frozen, undefined);
    assert.equal(snap.date, "2026-08-11");
    assert.ok(Object.keys(snap.specs).length > 0, "a snapshot must carry spec state");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("--frozen writes the immutable artifact alongside the snapshot", async () => {
  const dir = await sandbox();
  try {
    const res = await snapshot(dir, "2026-08-11", { frozen: true });
    assert.ok(res.frozenPath, "an artifact path should be returned");
    const art = JSON.parse(await readFile(res.frozenPath, "utf8"));
    assert.equal(art.kind, "frozen-forecast");
    assert.equal(art.date, "2026-08-11");
    assert.ok(art.dataSha256, "the artifact must hash the data that produced it");
    assert.equal(Object.keys(art.cells).length, Object.keys((await readSnap(dir, "2026-08-11")).specs).length,
      "the artifact must cover every spec the snapshot does");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("re-freezing the same date is idempotent when nothing changed", async () => {
  const dir = await sandbox();
  try {
    const a = await snapshot(dir, "2026-08-11", { frozen: true });
    const first = await readFile(a.frozenPath, "utf8");
    await snapshot(dir, "2026-08-11", { frozen: true });   // must not throw
    assert.equal(await readFile(a.frozenPath, "utf8"), first, "an unchanged re-freeze rewrites identical bytes");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("re-freezing a date whose artifact would DIFFER is refused", async () => {
  /* The artifact is what a post-launch audit re-derives the grade from. Silently
     redefining it under the same date is the one corruption nothing downstream could
     notice, so it is the single case that hard-errors. */
  const dir = await sandbox();
  try {
    await snapshot(dir, "2026-08-11", { frozen: true });

    // Perturb the underlying data so the artifact's hash and cells would change.
    const specsPath = path.join(dir, "data", "specs.json");
    const specs = JSON.parse(await readFile(specsPath, "utf8"));
    const victim = specs.find(s => s.ptr && s.ptr.verdict);
    assert.ok(victim, "fixture needs a spec carrying a ptr verdict");
    victim.ptr.verdict = victim.ptr.verdict === "Positive" ? "Negative" : "Positive";
    await writeFile(specsPath, JSON.stringify(specs, null, 2) + "\n");

    const historyBefore = await readFile(path.join(dir, "data", "history", "2026-08-11.json"), "utf8");
    const artifactBefore = await readFile(path.join(dir, "data", "forecasts", "frozen-2026-08-11.json"), "utf8");

    await assert.rejects(
      () => snapshot(dir, "2026-08-11", { frozen: true }),
      /describes a DIFFERENT forecast/,
      "a second --frozen over changed data must refuse rather than redefine the record");

    /* A refusal must be a genuine no-op on disk. The guard originally ran AFTER the history
       file was written, so a refused re-freeze still clobbered the snapshot it existed to
       protect — the same destruction this change set was written to repair, reintroduced by
       its own guard. Both files must be untouched. */
    assert.equal(await readFile(path.join(dir, "data", "history", "2026-08-11.json"), "utf8"), historyBefore,
      "a refused freeze must not have rewritten the history snapshot");
    assert.equal(await readFile(path.join(dir, "data", "forecasts", "frozen-2026-08-11.json"), "utf8"), artifactBefore,
      "a refused freeze must not have rewritten the artifact");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("an ordinary re-snapshot SKIPS (exit clean) when a freeze declaration's state has moved", async () => {
  /* The counterpart to the carry-forward. All three write options are wrong on a frozen
     date: overwrite destroys the declaration, re-stamp mis-declares, and a hard error was
     tried first and killed the very next publish (the 2026-08-11 auto-kicked nightly died
     red at its snapshot step — the freeze date and launch day are the same UTC day by
     construction, so the collision is guaranteed, not exotic). The correct behaviour is a
     clean SKIP: nothing written, no error, the declaration untouched, and the moved state
     left for the next UTC date's snapshot. pickBaseline compares against the newest
     DIFFERING snapshot, so the frozen file still serves as that night's baseline. */
  const dir = await sandbox();
  try {
    await snapshot(dir, "2026-08-11", { frozen: true });
    const before = await readFile(path.join(dir, "data", "history", "2026-08-11.json"), "utf8");

    const specsPath = path.join(dir, "data", "specs.json");
    const specs = JSON.parse(await readFile(specsPath, "utf8"));
    const victim = specs.find(s => s.ptr && s.ptr.verdict);
    victim.ptr.verdict = victim.ptr.verdict === "Positive" ? "Negative" : "Positive";
    await writeFile(specsPath, JSON.stringify(specs, null, 2) + "\n");

    const res = await snapshot(dir, "2026-08-11");     // must NOT throw — publish runs this
    assert.equal(res.skippedFrozenDate, true, "the collision must be reported as a skip");
    assert.equal(res.outPath, null, "a skipped snapshot must write nothing");
    assert.equal(await readFile(path.join(dir, "data", "history", "2026-08-11.json"), "utf8"), before,
      "the declared snapshot must survive the skipped write untouched");
  } finally { await rm(dir, { recursive: true, force: true }); }
});
