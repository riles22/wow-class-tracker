import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkRefreshBase } from "../src/check-refresh-base.mjs";

const SCRIPT = fileURLToPath(new URL("../src/check-refresh-base.mjs", import.meta.url));
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "tracker-refresh-base-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const put = (file, content) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
  };
  git(["init", "-q"]);
  git(["config", "user.email", "fixture@example.invalid"]);
  git(["config", "user.name", "Fixture"]);
  const commit = message => { git(["add", "."]); git(["commit", "-qm", message]); return git(["rev-parse", "HEAD"]).trim(); };
  put("data/specs.json", "[]\n");
  put(".claude/skills/refresh-metrics/log.md", "original log\n");
  put("src/fixture.mjs", "// initial code\n");
  const baseSha = commit("initial");
  return { root, git, put, commit, baseSha };
}

test("refresh base admits identical HEAD and code-only master advances without touching the worktree", t => {
  const f = fixture(t);
  assert.equal(checkRefreshBase(f.root, { baseSha: f.baseSha }).headSha, f.baseSha);
  f.put("src/fixture.mjs", "// reviewed code fix\n");
  f.put(".claude/skills/refresh-metrics/SKILL.md", "reviewed instructions\n");
  f.put(".claude/skills/refresh-metrics/log.md.bak", "not an artifact log\n");
  const current = f.commit("code and instructions only");
  f.put("src/uncommitted.mjs", "// owner work remains untouched\n");
  const before = f.git(["status", "--porcelain", "-z"]);
  assert.deepEqual(checkRefreshBase(f.root, { baseSha: f.baseSha }), { baseSha: f.baseSha, headSha: current });
  assert.equal(f.git(["status", "--porcelain", "-z"]), before);
});

test("refresh base rejects newer data additions, corrections, deletions and moves out of data", t => {
  for (const edit of ["addition", "correction", "deletion", "move"]) {
    const f = fixture(t);
    if (edit === "addition") f.put("data/nested/manual $(literal) [name].json", "{}\n");
    if (edit === "correction") f.put("data/specs.json", '[{"corrected":true}]\n');
    if (edit === "deletion") f.git(["rm", "--", "data/specs.json"]);
    if (edit === "move") f.git(["mv", "--", "data/specs.json", "specs-moved.json"]);
    f.commit(edit);
    assert.throws(() => checkRefreshBase(f.root, { baseSha: f.baseSha }), /newer data or skill-log edits/);
  }
});

test("refresh base protects exact skill log names, including nested paths and renames", t => {
  for (const file of [".claude/skills/refresh-metrics/log.md", ".claude/skills/outer/nested/log.md",
    ".claude/skills/a $(literal) [name]/log.md"]) {
    const f = fixture(t);
    f.put(file, "new owner evidence\n");
    f.commit("owner log update");
    assert.throws(() => checkRefreshBase(f.root, { baseSha: f.baseSha }), /newer data or skill-log edits/);
  }
  const f = fixture(t);
  f.git(["mv", "--", ".claude/skills/refresh-metrics/log.md", ".claude/skills/refresh-metrics/history.md"]);
  f.commit("move log");
  assert.throws(() => checkRefreshBase(f.root, { baseSha: f.baseSha }), /newer data or skill-log edits/);
});

test("refresh base rejects invalid, unavailable, noncommit and nonancestor baselines", t => {
  const f = fixture(t);
  for (const baseSha of [null, "", "HEAD", f.baseSha.slice(0, 12), `${f.baseSha}\n`, `--${f.baseSha}`, "z".repeat(40)])
    assert.throws(() => checkRefreshBase(f.root, { baseSha }), /full 40-character/);
  assert.throws(() => checkRefreshBase(f.root, { baseSha: "0".repeat(40) }), /missing.*not an ancestor/);
  const tree = f.git(["rev-parse", "HEAD^{tree}"]).trim();
  assert.throws(() => checkRefreshBase(f.root, { baseSha: tree }), /not a commit/);
  f.git(["checkout", "-qb", "side"]);
  f.put("src/side.mjs", "// side branch\n");
  const side = f.commit("side");
  f.git(["checkout", "-q", "--detach", f.baseSha]);
  f.put("src/other.mjs", "// other history\n");
  f.commit("other");
  assert.throws(() => checkRefreshBase(f.root, { baseSha: side }), /not an ancestor/);
});

test("refresh base CLI reads only its required environment SHA and fails closed before overlay", t => {
  const f = fixture(t);
  f.put("src/check-refresh-base.mjs", readFileSync(SCRIPT, "utf8"));
  f.commit("install checker");
  const run = (baseSha, args = []) => {
    const env = { ...process.env };
    delete env.REFRESH_BASE_SHA;
    if (baseSha !== undefined) env.REFRESH_BASE_SHA = baseSha;
    return spawnSync(process.execPath, [path.join(f.root, "src/check-refresh-base.mjs"), ...args], {
      cwd: f.root, env, encoding: "utf8", windowsHide: true });
  };
  assert.equal(run(f.baseSha).status, 0);
  assert.equal(run(undefined).status, 1);
  assert.equal(run(f.baseSha, ["--base=HEAD"]).status, 1);
  f.put("data/specs.json", '[{"ownerCorrection":true}]\n');
  f.commit("manual correction after refresh started");
  const refused = run(f.baseSha);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /refusing to overlay/);
  assert.equal(readFileSync(path.join(f.root, "data/specs.json"), "utf8"), '[{"ownerCorrection":true}]\n');
});
