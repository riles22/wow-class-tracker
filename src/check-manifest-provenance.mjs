import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { promisify } from "node:util";
import { loadData } from "./validate.mjs";
import { probeDate } from "./check-refresh.mjs";

const execFileAsync = promisify(execFile);
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const MAX_RUN_AGE_MS = 3 * 60 * 60 * 1000;
const FUTURE_SKEW_MS = 5 * 60 * 1000;
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);
const shown = value => value == null ? "null" : JSON.stringify(value);

export function validateStartedAt(manifest, nowInstant = new Date()) {
  const errors = [];
  const raw = manifest?.startedAt;
  if (typeof raw !== "string" || !ISO_INSTANT.test(raw)) {
    return ["run-manifest: startedAt must be a full UTC ISO 8601 instant (YYYY-MM-DDTHH:mm:ss[.sss]Z)"];
  }
  const started = new Date(raw);
  if (Number.isNaN(started.getTime())) {
    return [`run-manifest: startedAt is not a real instant (${JSON.stringify(raw)})`];
  }
  if (manifest?.run !== raw.slice(0, 10)) {
    errors.push(`run-manifest: startedAt date ${raw.slice(0, 10)} does not match run ${shown(manifest?.run)}`);
  }
  const age = nowInstant.getTime() - started.getTime();
  if (age < -FUTURE_SKEW_MS) {
    errors.push(`run-manifest: startedAt ${raw} is in the future`);
  } else if (age > MAX_RUN_AGE_MS) {
    errors.push(`run-manifest: startedAt ${raw} is outside the 3-hour workflow window`);
  }
  return errors;
}

export function validateManifestProvenance(config, manifest, currentData, baselineData, nowInstant = new Date()) {
  const errors = [...validateStartedAt(manifest, nowInstant)];
  if (own(manifest, "anomalyAck")) {
    errors.push("run-manifest: anomalyAck is agent-controlled and is not permitted; movement anomalies require human review");
  }

  const rows = new Map((manifest?.sources ?? []).map(row => [row.source, row]));
  for (const req of config.requirements ?? []) {
    const row = rows.get(req.key);
    if (!row) continue; // completeness is enforced by check-refresh.mjs

    if (!own(row, "previousAsOf")) errors.push(`run-manifest: "${req.key}" must include previousAsOf`);
    if (!own(row, "newAsOf")) errors.push(`run-manifest: "${req.key}" must include newAsOf`);

    const expectedPrevious = req.date ? probeDate(req, baselineData) : null;
    const expectedNew = req.date ? probeDate(req, currentData) : null;
    if (row.previousAsOf !== expectedPrevious) {
      errors.push(`run-manifest: "${req.key}" previousAsOf ${shown(row.previousAsOf)} does not match committed baseline ${shown(expectedPrevious)}`);
    }
    if (row.newAsOf !== expectedNew) {
      errors.push(`run-manifest: "${req.key}" newAsOf ${shown(row.newAsOf)} does not match final stored data ${shown(expectedNew)}`);
    }
    if (expectedPrevious && expectedNew && expectedNew < expectedPrevious) {
      errors.push(`run-manifest: "${req.key}" data date regressed from ${expectedPrevious} to ${expectedNew}`);
    }
  }
  return errors;
}

async function gitJson(root, ref, file) {
  const { stdout } = await execFileAsync("git", ["-C", root, "show", `${ref}:data/${file}`], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });
  return JSON.parse(stdout);
}

export async function loadBaselineData(root, ref) {
  const [specs, sources, encounterTiers] = await Promise.all([
    gitJson(root, ref, "specs.json"),
    gitJson(root, ref, "sources.json"),
    gitJson(root, ref, "encounter-tiers.json")
  ]);
  return { specs, sources, encounterTiers };
}

export async function runManifestProvenanceGate(root, baselineRef = "HEAD", nowInstant = new Date()) {
  const readJson = async file => JSON.parse(await readFile(path.join(root, file), "utf8"));
  const [config, manifest, currentData, baselineData] = await Promise.all([
    readJson("data/required-sources.json"),
    readJson("data/run-manifest.json"),
    loadData(root),
    loadBaselineData(root, baselineRef)
  ]);
  return validateManifestProvenance(config, manifest, currentData, baselineData, nowInstant);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const baselineRef = args.find(arg => arg.startsWith("--baseline-ref="))?.slice(15) ?? "HEAD";
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const errors = await runManifestProvenanceGate(root, baselineRef);
  if (errors.length) {
    console.error(`✗ manifest provenance: ${errors.length} failure(s):`);
    for (const error of errors) console.error("  - " + error);
    process.exit(1);
  }
  console.log(`✓ manifest provenance passed against ${baselineRef}`);
}
