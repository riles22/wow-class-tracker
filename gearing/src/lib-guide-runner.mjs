// Stage guide attempts until every requested spec is verified. Failures leave the
// published source intact; retries resume verified staging observations.
import { readFile, writeFile, mkdir, rename, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
import { validateEnhancements } from "./lib-guides.mjs";

const hash = (bytes) => createHash("sha256").update(bytes || "").digest("hex");
const readOptional = async (path) => {
  try { return await readFile(path, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
};
async function writeAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path + ".tmp", JSON.stringify(value, null, 2) + "\n");
  await rename(path + ".tmp", path);
}
function validateRecord(record, key) {
  if (!Array.isArray(record.priorities) || !Array.isArray(record.bis)
    || (!record.priorities.length && !record.bis.length))
    throw new Error(`${key}: guide has no parsed priorities or BiS`);
  for (const p of record.priorities) {
    if (!Array.isArray(p.secondaries) || p.secondaries.length < 2)
      throw new Error(`${key}: malformed priority "${p.label}"`);
  }
  for (const row of record.bis) {
    if (!/^\d+$/.test(String(row.itemId)) || !row.slot || !row.list)
      throw new Error(`${key}: malformed BiS row`);
  }
  validateEnhancements(record.enhancements, key);
}

export async function runGuideHarvest({ sourceId, sourceName, dated, harvestSpec,
  root = ROOT, trackerPath = process.env.WOW_CLASS_TRACKER_SPECS || join(root, "..", "data", "specs.json"),
  args = process.argv.slice(2), today = new Date().toISOString().slice(0, 10) }) {
  if (!/^[a-z0-9-]+$/.test(sourceId)) throw new Error("invalid guide source id");
  const outPath = join(root, "data", "guides", `${sourceId}.json`);
  const stagePath = join(root, ".guide-work", `${sourceId}.json`);
  const force = args.includes("--force");
  const only = args.includes("--spec") ? args[args.indexOf("--spec") + 1] : null;

  const tracker = JSON.parse(await readFile(trackerPath, "utf8"));
  const keys = tracker.map(s => `${s.spec} ${s.class}`);
  if (args.includes("--spec") && !keys.includes(only)) throw new Error("--spec must name a roster spec");
  const priorBytes = await readOptional(outPath);
  const prior = priorBytes == null ? null : JSON.parse(priorBytes);
  if (prior && (prior.schemaVersion !== 1 || prior.sourceId !== sourceId))
    throw new Error(`${sourceId}: incompatible existing guide source`);
  const out = prior ? structuredClone(prior)
    : { schemaVersion: 1, source: sourceName, sourceId, dated, harvestedAt: null, specs: {}, coverage: null };
  const absent = new Map((prior?.coverage?.specsAbsent || [])
    .filter(a => a.verifiedAt).map(a => [a.spec, a]));
  // Old runners mixed retrieval errors and verified absence in specsAbsent without
  // a per-spec receipt. Keep those reasons, but never count them as verification.
  const pending = new Map([...(prior?.coverage?.specsPending || []),
    ...(prior?.coverage?.specsAbsent || []).filter(a => !a.verifiedAt)]
    .map(a => [a.spec, a]));
  const targets = tracker.filter((s, i) => only ? keys[i] === only
    : force || (!out.specs[keys[i]] && !absent.has(keys[i])));
  if (!targets.length) {
    console.log(`${sourceName}: nothing to fetch; published bytes and dates unchanged`);
    return out;
  }
  const targetKeys = targets.map(s => `${s.spec} ${s.class}`);
  const priorHash = hash(priorBytes);
  const stageBytes = await readOptional(stagePath);
  const stage = stageBytes == null ? { sourceId, priorHash, targetKeys, verified: {}, failures: {} }
    : JSON.parse(stageBytes);
  if (stage.sourceId !== sourceId || stage.priorHash !== priorHash
    || JSON.stringify(stage.targetKeys) !== JSON.stringify(targetKeys))
    throw new Error(`staging differs from the source or requested specs; remove ${stagePath} to start a new refresh`);
  const raid = JSON.parse(await readFile(join(root, "data", "raid-items.json"), "utf8"));
  const dungeons = JSON.parse(await readFile(join(root, "data", "dungeon-items.json"), "utf8"));
  let consecutiveTransportFailures = 0;
  for (const spec of targets) {
    const key = `${spec.spec} ${spec.class}`;
    if (stage.verified[key]) { console.log(`  = ${key} (staged verification kept)`); continue; }
    try {
      const record = await harvestSpec(spec, { raid, dungeons });
      if (record !== null) validateRecord(record, key);
      stage.verified[key] = { verifiedAt: today, record };
      delete stage.failures[key];
      consecutiveTransportFailures = 0;
      console.log(`  + ${key}: ${record === null ? "verified absence" : `${record.priorities.length} priorities · ${record.bis.length} BiS rows`}`);
    } catch (error) {
      stage.failures[key] = { attemptedAt: today, reason: String(error.message || error).slice(0, 300) };
      consecutiveTransportFailures = /HTTP (?:403|429|5\d\d)|timeout|timed out|fetch failed|verification|challenge/i.test(stage.failures[key].reason)
        ? consecutiveTransportFailures + 1 : 0;
      console.error(`  ! ${key}: ${stage.failures[key].reason}`);
    }
    await writeAtomic(stagePath, stage);
    if (consecutiveTransportFailures >= 3)
      throw new Error(`${sourceName}: stopped after three consecutive transport failures; published source unchanged; retry when access recovers`);
  }
  const failures = targetKeys.filter(key => !stage.verified[key]);
  if (failures.length)
    throw new Error(`${sourceName}: ${failures.length} spec retrievals failed; published source unchanged; retry the same command to resume ${stagePath}`);

  // Legacy source dates are the best verification receipt those records have.
  // Carry them onto retained records before deriving the source-wide date.
  for (const record of Object.values(out.specs)) record.verifiedAt ??= prior?.harvestedAt ?? null;
  for (const key of targetKeys) {
    const { record, verifiedAt } = stage.verified[key];
    if (record === null) {
      delete out.specs[key];
      absent.set(key, { spec: key, reason: "source publishes no guide for this spec (verified fetch)", verifiedAt });
    } else {
      validateRecord(record, key);
      out.specs[key] = { ...record, verifiedAt };
      absent.delete(key);
    }
    pending.delete(key);
  }
  for (const key of keys) {
    if (!out.specs[key] && !absent.has(key) && !pending.has(key))
      pending.set(key, { spec: key, reason: "guide has not been verified yet" });
  }
  const dates = keys.map(key => out.specs[key]?.verifiedAt || absent.get(key)?.verifiedAt);
  out.harvestedAt = dates.every(Boolean) ? dates.slice().sort()[0] : null;
  out.coverage = { specsHarvested: Object.keys(out.specs).length, specsAbsent: [...absent.values()],
    ...(pending.size ? { specsPending: [...pending.values()] } : {}) };
  if (hash(await readOptional(outPath)) !== priorHash)
    throw new Error(`${sourceName}: source changed during harvest; refusing to replace it`);
  await writeAtomic(outPath, out);
  await unlink(stagePath);
  console.log(`${sourceName}: ${out.coverage.specsHarvested}/${keys.length} specs, ${absent.size} verified absent -> ${outPath}`);
  return out;
}
