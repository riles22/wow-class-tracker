import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_GEARING_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HEX = /^[a-f0-9]{64}$/;
const APPROVED_DATA_FILES = new Set([
  "raid-items.json",
  "dungeon-items.json",
  "tier-items.json",
  "catalyst-rules.json",
  "catalyst-stat-allocations.json",
  "item-eligibility-overrides.json",
  "specs.json",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sourcePath(root, declared, policyId) {
  assert(typeof declared === "string" && !isAbsolute(declared) && !declared.includes("\\"),
    `${policyId}: unsafe curation source path ${String(declared)}`);
  const parts = declared.split("/");
  assert(parts.length === 2 && parts[0] === "data" && APPROVED_DATA_FILES.has(parts[1])
    && declared === `data/${parts[1]}`,
  `${policyId}: unapproved curation source path ${declared}`);

  const dataRoot = resolve(root, "data");
  const path = resolve(root, declared);
  const fromDataRoot = relative(dataRoot, path);
  assert(fromDataRoot && !fromDataRoot.startsWith(`..${sep}`) && fromDataRoot !== ".."
    && !isAbsolute(fromDataRoot) && fromDataRoot === parts[1],
  `${policyId}: curation source path escapes the data directory: ${declared}`);
  return path;
}

/** Verify the raw bytes behind every admitted curated-gear source snapshot. */
export function verifyCurationSourceFiles(manifest, gearingRoot = DEFAULT_GEARING_ROOT) {
  const policies = manifest?.curationPolicies;
  if (policies === undefined || (Array.isArray(policies) && policies.length === 0))
    return { policies: 0, files: 0 };
  assert(Array.isArray(policies), "SimC curationPolicies must be an array");

  const root = resolve(gearingRoot);
  const verified = new Map();
  for (const policy of policies) {
    const policyId = typeof policy?.curationPolicyId === "string" && policy.curationPolicyId
      ? policy.curationPolicyId : "unknown-curation-policy";
    const hashes = policy?.gearDataHashes;
    assert(hashes && typeof hashes === "object" && !Array.isArray(hashes)
      && Object.keys(hashes).length > 0,
    `${policyId}: curation source hashes are missing`);
    for (const [declared, expected] of Object.entries(hashes)) {
      assert(HEX.test(expected || ""), `${policyId}: invalid curation source hash for ${declared}`);
      const path = sourcePath(root, declared, policyId);
      let bytes;
      try { bytes = readFileSync(path); }
      catch (error) {
        throw new Error(`${policyId}: curation source is missing or unreadable: ${declared} (${error.message})`);
      }
      const actual = createHash("sha256").update(bytes).digest("hex");
      assert(actual === expected,
        `${policyId}: curation source hash mismatch for ${declared}; expected ${expected}, found ${actual}`);
      verified.set(`${policyId}\0${declared}`, actual);
    }
  }
  return { policies: policies.length, files: verified.size };
}
