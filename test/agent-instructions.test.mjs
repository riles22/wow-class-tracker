import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { syncAgentInstructions, WORKING_AGREEMENTS } from "../src/sync-agent-instructions.mjs";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "tracker-agent-instructions-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "CLAUDE.md"), "# Canonical project guide\n");
  mkdirSync(join(root, ".claude/skills/refresh-tiers"), { recursive: true });
  writeFileSync(join(root, ".claude/skills/refresh-tiers/SKILL.md"), "---\nname: refresh-tiers\ndescription: Refresh current tier lists.\n---\n\n# Authoritative steps\nDo not duplicate this body.\n");
  return root;
}

test("adapters resolve canonical guides, share discovery metadata, and regenerate without body copies", t => {
  const root = fixture(t);
  assert.deepEqual(syncAgentInstructions({ root }).changed, ["AGENTS.md", ".agents/skills/refresh-tiers/SKILL.md"]);
  assert.equal(syncAgentInstructions({ root, check: false }).ok, true);
  const adapter = readFileSync(join(root, ".agents/skills/refresh-tiers/SKILL.md"), "utf8");
  assert.match(adapter, /description: Refresh current tier lists\./);
  assert.match(adapter, /\.\.\/\.\.\/\.\.\/\.claude\/skills\/refresh-tiers\/SKILL\.md/);
  assert.doesNotMatch(adapter, /Do not duplicate this body/);
  assert.equal(syncAgentInstructions({ root }).ok, true);
  const canonical = join(root, ".claude/skills/refresh-tiers/SKILL.md");
  writeFileSync(canonical, readFileSync(canonical, "utf8").replace("current tier lists", "new season tier lists"));
  assert.deepEqual(syncAgentInstructions({ root }).changed, [".agents/skills/refresh-tiers/SKILL.md"]);
  syncAgentInstructions({ root, check: false });
  assert.equal(syncAgentInstructions({ root }).ok, true);
});

test("regeneration preserves personal instructions and all four working agreements", t => {
  const root = fixture(t);
  syncAgentInstructions({ root, check: false });
  const path = join(root, "AGENTS.md");
  writeFileSync(path, readFileSync(path, "utf8").replace("<!-- Generated agent adapter: start -->", "Use the existing feature branch.\n\n<!-- Generated agent adapter: start -->").replace("## Project instructions", "## Stale generated title"));
  assert.deepEqual(syncAgentInstructions({ root }).changed, ["AGENTS.md"]);
  syncAgentInstructions({ root, check: false });
  const output = readFileSync(path, "utf8");
  assert.match(output, /Use the existing feature branch/);
  for (const agreement of WORKING_AGREEMENTS) assert.ok(output.includes(agreement));
  assert.match(output, /## Project instructions/);
  writeFileSync(path, output.replace(WORKING_AGREEMENTS[0], ""));
  assert.throws(() => syncAgentInstructions({ root }), /must preserve this working agreement/);
});

test("migration refuses to overwrite unmarked local instructions or unknown adapters", t => {
  const root = fixture(t);
  writeFileSync(join(root, "AGENTS.md"), "# Existing personalized instructions\n");
  assert.throws(() => syncAgentInstructions({ root, check: false }), /Preserve its working agreements and personal instructions/);
  assert.equal(readFileSync(join(root, "AGENTS.md"), "utf8"), "# Existing personalized instructions\n");
  mkdirSync(join(root, ".agents/skills/old-skill"), { recursive: true });
  writeFileSync(join(root, ".agents/skills/old-skill/SKILL.md"), "Old procedure\n");
  assert.throws(() => syncAgentInstructions({ root }), /no canonical procedure.*old-skill.*no files were deleted/);
});

test("invalid metadata cannot partially update adapters or touch local secrets and logs", t => {
  const root = fixture(t);
  syncAgentInstructions({ root, check: false });
  const adapterPath = join(root, ".agents/skills/refresh-tiers/SKILL.md");
  const original = readFileSync(adapterPath, "utf8");
  writeFileSync(join(root, ".agents/skills/refresh-tiers/config.json"), "private local placeholder\n");
  writeFileSync(join(root, ".agents/skills/refresh-tiers/log.md"), "local history\n");
  writeFileSync(join(root, ".claude/skills/refresh-tiers/SKILL.md"), "---\nname: wrong\ndescription: Invalid discovery name.\n---\n");
  assert.throws(() => syncAgentInstructions({ root, check: false }), /needs name: refresh-tiers/);
  assert.equal(readFileSync(adapterPath, "utf8"), original);
  assert.equal(readFileSync(join(root, ".agents/skills/refresh-tiers/config.json"), "utf8"), "private local placeholder\n");
  assert.equal(readFileSync(join(root, ".agents/skills/refresh-tiers/log.md"), "utf8"), "local history\n");
});

test("Windows line endings do not create false adapter drift", t => {
  const root = fixture(t);
  syncAgentInstructions({ root, check: false });
  for (const path of ["AGENTS.md", ".agents/skills/refresh-tiers/SKILL.md", ".claude/skills/refresh-tiers/SKILL.md"]) {
    const fullPath = join(root, path);
    writeFileSync(fullPath, readFileSync(fullPath, "utf8").replaceAll("\n", "\r\n"));
  }
  assert.equal(syncAgentInstructions({ root }).ok, true);
});

test("tracked project adapters match their canonical procedures", () => {
  const result = syncAgentInstructions();
  assert.equal(result.ok, true, `Stale adapters: ${result.changed.join(", ")}. Run node src/sync-agent-instructions.mjs --write.`);
  assert.ok(result.skills >= 6);
});

test("tracking adapters keeps local credentials, logs, and scratch ignored", () => {
  const privatePaths = [
    ".agents/skills/refresh-metrics/config.json",
    ".agents/skills/refresh-metrics/log.md",
    ".agents/skills/refresh-metrics/config.json.example",
    ".agents/skills/refresh-metrics/scratch/output.json",
    ".agents/private.txt",
    ".claude/skills/refresh-metrics/config.json",
  ];
  const output = execFileSync("git", ["check-ignore", "--no-index", ...privatePaths, "AGENTS.md", ".agents/skills/refresh-metrics/SKILL.md"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)), encoding: "utf8",
  }).trim().split(/\r?\n/);
  assert.deepEqual(output, privatePaths);
});
