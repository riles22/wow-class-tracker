/* Sync the fields gearing COPIES from the tracker, without running the full harvest.
 *
 * WHY THIS EXISTS (2026-08-08). `tierSet` is not gearing's own data — harvest-specs.mjs
 * copies it verbatim from the tracker's data/specs.json (see its `tierSet: s.tierSet ?? null`).
 * But that harvest is all-or-nothing across 40 live Icy Veins fetches and is gated on a
 * hardcoded live-patch constant, so when the gate is shut — as it is today, with Icy Veins
 * still publishing 12.0.7 stat priorities — a stale COPY cannot be corrected either. That is
 * how the gearing page came to publish Preservation Evoker's 2-piece as "150% effectiveness"
 * for weeks after the tracker corrected it to 100% (blue post, 2026-07-16): a wrong number on
 * a published page, held hostage by an unrelated network gate.
 *
 * This script is network-free and touches only the copied fields, so the correctness fix is
 * unconditional. It is NOT a harvest: it invents nothing, fetches nothing, and refuses on any
 * roster mismatch rather than guessing.
 *
 * It also DROPS the `ratings` copy. Nothing in gearing reads it — not the app, not the
 * validator, not a test — while 27 of 40 specs' copies had drifted from the tracker. A
 * silently-wrong payload field that no surface renders is not harmless: it is a lie waiting
 * for someone to start reading it. The tracker is the place to read ratings.
 *
 *   node gearing/src/sync-tracker-fields.mjs [--check]
 *
 * --check exits 1 on any drift without writing, for use as a gate.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TRACKER = process.env.WOW_CLASS_TRACKER_SPECS
  || join(ROOT, "..", "data", "specs.json");
const TARGET = join(ROOT, "data", "specs.json");

const key = s => `${s.class}|${s.spec}`;
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export async function syncTrackerFields({ check = false } = {}) {
  const tracker = JSON.parse(await readFile(TRACKER, "utf8"));
  const doc = JSON.parse(await readFile(TARGET, "utf8"));
  const byKey = new Map(tracker.map(s => [key(s), s]));

  /* Refuse on ANY roster mismatch. A spec present on one side only means the two files are
     describing different rosters, and quietly syncing the intersection would hide that. */
  const missing = doc.specs.filter(s => !byKey.has(key(s))).map(key);
  if (missing.length) {
    throw new Error(`refusing to sync: ${missing.length} gearing spec(s) absent from the tracker roster:\n  ${missing.join("\n  ")}`);
  }
  if (byKey.size !== doc.specs.length) {
    throw new Error(`refusing to sync: tracker has ${byKey.size} specs, gearing has ${doc.specs.length}`);
  }

  const changes = [];
  for (const s of doc.specs) {
    const t = byKey.get(key(s));
    if (!same(s.tierSet, t.tierSet)) {
      const textChanged = (s.tierSet?.set2 ?? null) !== (t.tierSet?.set2 ?? null)
        || (s.tierSet?.set4 ?? null) !== (t.tierSet?.set4 ?? null);
      changes.push({ spec: key(s), field: "tierSet", textChanged,
        from: s.tierSet?.asOf ?? null, to: t.tierSet?.asOf ?? null });
      if (!check) s.tierSet = t.tierSet ?? null;
    }
    if ("ratings" in s) {
      changes.push({ spec: key(s), field: "ratings", textChanged: false, from: "present", to: "removed" });
      if (!check) delete s.ratings;
    }
  }

  if (!check && changes.length) {
    doc.source = "WoW Class Tracker data/specs.json (class, spec, role, tier set) + Icy Veins stat-priority pages";
    doc.trackerFieldsSyncedAt = new Date().toISOString().slice(0, 10);
    await writeFile(TARGET, JSON.stringify(doc, null, 2), "utf8");
  }
  return changes;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const check = process.argv.includes("--check");
  const changes = await syncTrackerFields({ check });
  const text = changes.filter(c => c.textChanged);
  if (!changes.length) { console.log("✓ gearing's copied tracker fields are already in sync"); process.exit(0); }
  for (const c of changes) {
    if (c.field === "ratings") continue;
    console.log(`  ${c.textChanged ? "TEXT" : "date"}  ${c.spec.replace("|", " ")}  ${c.from} → ${c.to}`);
  }
  const dropped = changes.filter(c => c.field === "ratings").length;
  if (dropped) console.log(`  dropped the dead ratings copy from ${dropped} specs`);
  if (check) {
    console.error(`\n✗ ${changes.length} field(s) drifted from the tracker (${text.length} with changed TEXT). Run without --check to sync.`);
    process.exit(1);
  }
  console.log(`\n✓ synced ${changes.length} field(s) — ${text.length} with changed text. Rebuild: node gearing/src/build.mjs`);
}
