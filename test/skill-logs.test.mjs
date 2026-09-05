import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkSkillLogs } from "../src/check-skill-logs.mjs";

function fixture(t, names = ["ptr-watch", "a $(literal) [name] 'é'"]) {
  const root = mkdtempSync(path.join(tmpdir(), "tracker-skill-logs-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  git(["init", "-q"]);
  git(["config", "user.email", "fixture@example.invalid"]);
  git(["config", "user.name", "Fixture"]);
  const logs = names.map(name => `.claude/skills/${name}/log.md`);
  const put = (file, content) => { mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); writeFileSync(path.join(root, file), content); };
  for (const file of logs) put(file, "header\nold 1\nold 2\nold 3\nold 4\n");
  put("data/fixture.json", "{}\n"); put("dist/fixture.html", "initial\n");
  git(["add", "."]); git(["commit", "-qm", "fixture"]);
  return { root, git, logs, put };
}

test("skill log content remains warning-only; unusual trusted filenames stay literal through staging", t => {
  const f = fixture(t);
  assert.deepEqual(checkSkillLogs(f.root).warnings, []);
  f.put(f.logs[0], "newest\nold 4\nold 3\nheader\n");
  f.put(f.logs[1], "complete rewrite\n");
  f.put("data/fixture.json", '{"updated":true}\n');
  const result = checkSkillLogs(f.root, { stage: true });
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /retained only 0%/);
  const staged = f.git(["diff", "--cached", "--name-only", "-z"]).split("\0").filter(Boolean);
  assert.deepEqual(staged.sort(), [...f.logs, "data/fixture.json"].sort());
  assert.equal(readFileSync(path.join(f.root, f.logs[1]), "utf8"), "complete rewrite\n");
});

test("unknown skill logs are refused whether ignored, untracked, or already staged", t => {
  for (const kind of ["untracked", "staged", "staged-then-removed", "ignored"]) {
    const f = fixture(t);
    const extra = ".claude/skills/unapproved $(literal)/log.md";
    if (kind === "ignored") f.put(".gitignore", ".claude/skills/unapproved*/\n");
    f.put(extra, "new\n");
    if (kind.startsWith("staged")) f.git(["add", "--", `:(literal)${extra}`]);
    if (kind === "staged-then-removed") rmSync(path.join(f.root, extra));
    assert.throws(() => checkSkillLogs(f.root, { stage: true }), /Unapproved skill paths/);
    assert.equal(f.git(["diff", "--cached", "--name-only", "-z"]).includes("data/fixture"), false);
  }
});

test("skill log admission is checked again at staging, and removals or renamed logs fail", t => {
  const f = fixture(t);
  checkSkillLogs(f.root);
  f.put(".claude/skills/new/log.md", "late arrival\n");
  assert.throws(() => checkSkillLogs(f.root, { stage: true }), /Unapproved/);
  const deleted = fixture(t);
  rmSync(path.join(deleted.root, deleted.logs[0]));
  assert.throws(() => checkSkillLogs(deleted.root));
  const renamed = fixture(t);
  renameSync(path.join(renamed.root, renamed.logs[0]), path.join(renamed.root, ".claude/skills/ptr-watch/notlog.md"));
  assert.throws(() => checkSkillLogs(renamed.root));
});

test("missing HEAD and nonregular log replacements fail closed", t => {
  const f = fixture(t);
  rmSync(path.join(f.root, f.logs[0]));
  mkdirSync(path.join(f.root, f.logs[0]));
  assert.throws(() => checkSkillLogs(f.root), /regular file/);
  rmSync(path.join(f.root, ".git"), { recursive: true, force: true });
  assert.throws(() => checkSkillLogs(f.root));
});

test("nightly admits and stages skill logs through the checked helper and forwards both approvals", () => {
  const wf = readFileSync(new URL("../.github/workflows/nightly.yml", import.meta.url), "utf8");
  assert.match(wf, /node src\/check-skill-logs\.mjs\s/);
  assert.match(wf, /node src\/check-skill-logs\.mjs --stage/);
  assert.doesNotMatch(wf, /git add data\/ dist\/ "\.claude\/skills\/\*\/log\.md"/);
  for (const name of ["Check primary agent completion", "Final deterministic completion gate", '"Gate 3: refresh contract']) {
    const start = wf.indexOf(`- name: ${name}`);
    assert.ok(start >= 0);
    const next = wf.indexOf("\n      - name:", start + 1);
    const step = wf.slice(start, next < 0 ? undefined : next);
    assert.match(step, /VALUE_MOVE_ACK: \$\{\{ inputs\.value_move_ack \}\}/);
    assert.match(step, /ANOMALY_ACK: \$\{\{ inputs\.anomaly_ack \}\}/);
  }
});
