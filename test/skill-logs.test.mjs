import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkSkillLogs, checkoutBytes, oversizedLogsAt, LOG_WARN_BYTES, READ_GATE_BYTES } from "../src/check-skill-logs.mjs";

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

test("a log past the size line warns as a Windows checkout would measure it, changed or not (audit 2026-10-04, F11)", t => {
  assert.ok(LOG_WARN_BYTES < READ_GATE_BYTES);
  assert.equal(checkoutBytes("a\nb\n"), 6);
  assert.equal(checkoutBytes("a\r\nb\r\n"), 6, "a CRLF working tree is not counted twice");
  // Distinct 199-byte LF lines (200 with CRLF), so the retention check sees real lines.
  const entries = (from, count) => Array.from({ length: count }, (_, i) => String(from + i).padStart(6, "0") + "x".repeat(192) + "\n").join("");
  const atLine = entries(0, 1000);
  assert.equal(Buffer.byteLength(atLine), 199_000);
  assert.equal(checkoutBytes(atLine), LOG_WARN_BYTES);
  const f = fixture(t);
  f.put(f.logs[0], atLine); // exactly on the line: quiet
  f.git(["add", "."]); f.git(["commit", "-qm", "at the line"]);
  assert.deepEqual(checkSkillLogs(f.root).warnings, []);
  assert.deepEqual(oversizedLogsAt("HEAD", f.root), []);

  // One more line pushes it over, though the LF blob is still 199,199 bytes. Committed
  // and untouched by this run, it warns from HEAD.
  f.put(f.logs[0], atLine + entries(1000, 1));
  f.git(["add", "."]); f.git(["commit", "-qm", "over"]);
  const warnings = checkSkillLogs(f.root).warnings;
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /^"\.claude\/skills\/ptr-watch\/log\.md" is 200,200 bytes in a Windows checkout, past the 200,000-byte warning line \(a Read returns nothing over 262,144\)/);
  assert.match(warnings[0], /prune to the newest ~20$/);
  assert.deepEqual(oversizedLogsAt("HEAD", f.root), [{ file: f.logs[0], bytes: 200_200 }]);

  // This run's own text decides for a log it changed: a prune that keeps the newest 30%
  // clears the warning before HEAD knows about it, and growth in the other log is caught.
  f.put(f.logs[0], entries(701, 300));
  f.put(f.logs[1], "header\n" + entries(0, 1200) + "old 1\nold 2\nold 3\nold 4\n");
  const after = checkSkillLogs(f.root).warnings;
  assert.equal(after.length, 1, after.join("\n"));
  assert.match(after[0], /^"\.claude\/skills\/a \$\(literal\) \[name\] 'é'\/log\.md" is 240,036 bytes/);
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
