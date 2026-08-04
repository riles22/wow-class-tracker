import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { gunzip as gunzipCallback } from "node:zlib";

const gunzip = promisify(gunzipCallback);
const AUDIT_DIRECTORY = "data/simc-audit/229259b";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

export async function validateSimcAuditArtifacts(simcWeights, root) {
  if (simcWeights?.methodology?.auditArtifacts?.directory !== AUDIT_DIRECTORY)
    throw new Error("SimC audit artifact directory is not the reviewed path");

  const auditRoot = resolve(root, AUDIT_DIRECTORY);
  const expected = new Map();
  const failures = [];
  const addExpected = (relativePath, expectedHash) => {
    const fullPath = resolve(auditRoot, relativePath);
    if (!fullPath.startsWith(`${auditRoot}${sep}`)) {
      failures.push(`${relativePath}: path escapes the reviewed audit directory`);
      return;
    }
    if (!/^[a-f0-9]{64}$/.test(expectedHash || "")) {
      failures.push(`${relativePath}: invalid expected SHA-256`);
      return;
    }
    const prior = expected.get(fullPath);
    if (prior && prior.expectedHash !== expectedHash)
      failures.push(`${relativePath}: conflicting expected SHA-256 values`);
    else expected.set(fullPath, { relativePath, expectedHash });
  };
  for (const record of simcWeights.records?.filter((entry) => entry.status === "accepted") || []) {
    addExpected(join("profiles", `${record.profileFile}.gz`), record.profileSha256);
    for (const run of record.runs || [])
      addExpected(join("reports", `${run.reportId}.json.gz`), run.resultSha256);
  }

  const profileCount = [...expected.values()].filter(({ relativePath }) =>
    relativePath.startsWith(`profiles${sep}`)).length;
  const reportCount = [...expected.values()].filter(({ relativePath }) =>
    relativePath.startsWith(`reports${sep}`)).length;
  if (profileCount !== 2 || reportCount !== 8)
    failures.push(`expected 2 generated profiles and 8 accepted reports, found ${profileCount} and ${reportCount}`);

  await Promise.all([...expected].map(async ([fullPath, { relativePath, expectedHash }]) => {
    try {
      const compressed = await readFile(fullPath);
      const original = await gunzip(compressed);
      const actualHash = digest(original);
      if (actualHash !== expectedHash)
        failures.push(`${relativePath}: expected ${expectedHash}, found ${actualHash}`);
    } catch (error) {
      failures.push(`${relativePath}: ${error.message}`);
    }
  }));

  if (failures.length)
    throw new Error(`SimC audit artifact validation failed:\n- ${failures.sort().join("\n- ")}`);
  return { profiles: profileCount, reports: reportCount };
}
