/* Write a comparable-state snapshot to data/history/<date>.json.
   Run AFTER a refresh + build — the next build shows movement (tier ▲▼, rank deltas)
   against the latest snapshot on disk. Usage: node src/snapshot.mjs [YYYY-MM-DD] */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData } from "./validate.mjs";
import { buildPayload } from "./render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function snapshot(root = ROOT, date = new Date().toISOString().slice(0, 10)) {
  const payload = buildPayload(await loadData(root));
  const snap = { date, specs: {} };
  for (const s of payload.specs) {
    snap.specs[`${s.class}|${s.spec}`] = {
      consensus: {
        raid: s.consensus?.raid?.tier ?? null,
        mplus: s.consensus?.mplus?.tier ?? null
      },
      ranks: Object.fromEntries(
        // Key includes source so two same-(bracket,name) metrics don't collide (must
        // match the movement lookup key in render.mjs movementFor).
        (s.metrics ?? []).filter(m => m.rank != null).map(m => [`${m.source}|${m.bracket}|${m.name}`, m.rank])
      )
    };
  }
  const dir = path.join(root, "data", "history");
  await mkdir(dir, { recursive: true });
  const outPath = path.join(dir, `${date}.json`);
  await writeFile(outPath, JSON.stringify(snap, null, 2) + "\n");
  return { outPath, specs: Object.keys(snap.specs).length };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const result = await snapshot(ROOT, process.argv[2] || undefined);
  console.log(`✓ snapshot → ${result.outPath} (${result.specs} specs)`);
}
