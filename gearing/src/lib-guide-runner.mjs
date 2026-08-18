// Common runner for the three guide harvesters (Phase B). Each harvester supplies a
// per-spec fetch+parse function; this owns the roster loop, resumability, coverage
// accounting, and the output contract, so the three files stay thin and identical
// in shape.
//
// Resumability: the output file is written after EVERY spec, and an existing file's
// specs are skipped unless --force (or --spec "<Spec Class>" to redo one). A failed
// spec is recorded in coverage.specsAbsent with its reason — absence is data, never
// silent.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TRACKER = process.env.WOW_CLASS_TRACKER_SPECS || join(ROOT, "..", "data", "specs.json");

export async function runGuideHarvest({ sourceId, sourceName, dated, harvestSpec }) {
  const outPath = join(ROOT, "data", "guides", `${sourceId}.json`);
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.includes("--spec") ? args[args.indexOf("--spec") + 1] : null;

  const tracker = JSON.parse(await readFile(TRACKER, "utf8"));
  const raid = JSON.parse(await readFile(join(ROOT, "data", "raid-items.json"), "utf8"));
  const dungeons = JSON.parse(await readFile(join(ROOT, "data", "dungeon-items.json"), "utf8"));

  let out = { schemaVersion: 1, source: sourceName, sourceId, dated,
    harvestedAt: new Date().toISOString().slice(0, 10), specs: {}, coverage: null };
  try {
    const prior = JSON.parse(await readFile(outPath, "utf8"));
    if (prior.schemaVersion === 1 && prior.sourceId === sourceId && !force) out.specs = prior.specs || {};
  } catch { /* first run */ }
  await mkdir(dirname(outPath), { recursive: true });

  const absent = [];
  for (const spec of tracker) {
    const key = `${spec.spec} ${spec.class}`;
    if (only && key !== only) continue;
    if (!only && !force && out.specs[key]) { console.log(`  = ${key} (kept)`); continue; }
    try {
      const record = await harvestSpec(spec, { raid, dungeons });
      if (!record) { absent.push({ spec: key, reason: "source publishes no guide for this spec (verified fetch)" }); continue; }
      out.specs[key] = record;
      console.log(`  + ${key}: ${record.priorities.length} priorities · ${record.bis.length} BiS rows`
        + (record.published ? ` · published ${record.published}` : dated ? " · NO DATE FOUND" : " · undated source"));
    } catch (error) {
      absent.push({ spec: key, reason: String(error.message || error).slice(0, 300) });
      console.error(`  ! ${key}: ${error.message}`);
    }
    out.coverage = { specsHarvested: Object.keys(out.specs).length, specsAbsent: absent };
    await writeFile(outPath, JSON.stringify(out, null, 2) + "\n");
  }
  out.coverage = { specsHarvested: Object.keys(out.specs).length, specsAbsent: absent };
  await writeFile(outPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`${sourceName}: ${out.coverage.specsHarvested}/40 specs harvested, ${absent.length} absent/failed -> ${outPath}`);
  if (absent.length) for (const a of absent) console.log(`   absent: ${a.spec} — ${a.reason.slice(0, 120)}`);
  return out;
}
