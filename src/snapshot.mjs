/* Write a comparable-state snapshot to data/history/<date>.json.
   Run AFTER a refresh + build — the next build shows movement (tier ▲▼, rank deltas)
   against the latest snapshot on disk. Usage: node src/snapshot.mjs [YYYY-MM-DD] */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData } from "./validate.mjs";
import { buildPayload, snapshotStateOf, PROJECTION_VERSION, SNAPSHOT_PHASE } from "./render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function snapshot(root = ROOT, date = new Date().toISOString().slice(0, 10)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`snapshot date must be YYYY-MM-DD, got "${date}"`);
  const payload = buildPayload(await loadData(root));
  // snapshotStateOf is shared with the movement reader (render.mjs pickBaseline/movementFor)
  // so the stored key format can never drift from the lookup. projectionVersion pins which
  // formula produced the stored projections — the report card must never grade a v1
  // forecast against v2 semantics.
  const snap = { date, phase: SNAPSHOT_PHASE, projectionVersion: PROJECTION_VERSION, specs: snapshotStateOf(payload.specs) };
  const dir = path.join(root, "data", "history");
  await mkdir(dir, { recursive: true });
  const outPath = path.join(dir, `${date}.json`);
  await writeFile(outPath, JSON.stringify(snap, null, 2) + "\n");
  return { outPath, specs: Object.keys(snap.specs).length };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const result = await snapshot(ROOT, process.argv[2] || undefined);
    console.log(`✓ snapshot → ${result.outPath} (${result.specs} specs)`);
  } catch (error) {
    console.error("✗ " + error.message);
    process.exit(1);
  }
}
