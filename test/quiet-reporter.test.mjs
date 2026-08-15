import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";

/* src/quiet-reporter.mjs had NO test at all, and it is what both nightly agent prompts run
   (`npm run test:quiet`, 2 sites) plus every interactive session. A reporter that misreports
   is worse than a verbose one: the whole point of the compact lane is that an agent trusts
   its counts without a second tool call.
 *
 * Found the hour this file was written, by running the reporter against a deliberately
 * failing fixture: it CRASHED on a parent test that failed only because a subtest did. Node
 * sets the wrapper's `cause` to the bare string "N subtests failed", and `"actual" in error`
 * throws a TypeError on a primitive. It printed the first two failures, then died inside
 * node's stream machinery — losing every later failure and the summary counts. The repo has
 * subtests in ui-invariants and three gearing files, so this was reachable on any red run.
 *
 * THE INVARIANT THAT MATTERS: the quiet lane must agree with the default lane on the COUNTS
 * and the EXIT CODE. Everything else is presentation. */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORTER = "./src/quiet-reporter.mjs";

/* The fixture is written to a temp dir, NEVER under test/: a *.test.mjs file there would be
   discovered by `node --test` and fail the real suite forever. */
const FIXTURE = `
import { test } from "node:test";
import assert from "node:assert/strict";
test("passes", () => { assert.equal(1, 1); });
test("fails with a message", () => { assert.equal(2 + 2, 5, "arithmetic is broken"); });
test("parent with a failing subtest", async t => {
  await t.test("child ok", () => assert.ok(true));
  await t.test("child bad", () => assert.deepEqual({ a: 1 }, { a: 2 }));
});
test("throws rather than asserting", () => { JSON.parse("{ not json"); });
test.skip("skipped on purpose", () => {});
test.todo("todo on purpose");
`;

/* NODE_TEST_CONTEXT must be stripped from the child's env. `node --test` sets it to
   "child-v8" in every test process, and a nested `node --test` that inherits it switches from
   TAP to the v8-serialized child protocol — the spawned run then reports nothing on stdout and
   exits 0 even on a failing fixture, so every assertion below silently passed against empty
   output. Cost an hour of confusion the first time; the guard is one line. */
function run(args, file) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  try {
    const stdout = execFileSync(process.execPath, [...args, file], { cwd: ROOT, encoding: "utf8", env });
    return { code: 0, out: stdout };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
}

/* Both formats put their totals on lines beginning with "#" — the default reporter one key
   per line ("# pass 2"), the quiet one pipe-joined ("# tests 8 | pass 2 | fail 4"). Restrict
   to those lines first so a failure DIAGNOSTIC containing the word "fail" cannot be scraped
   as a count, then read each key the same way from either shape. */
const counts = out => {
  const summary = out.split("\n").filter(l => l.trimStart().startsWith("#")).join("\n");
  const grab = key => {
    const m = summary.match(new RegExp(`\\b${key}\\s+(\\d+)`));
    return m ? Number(m[1]) : null;
  };
  return { tests: grab("tests"), pass: grab("pass"), fail: grab("fail"), skipped: grab("skipped") };
};

test("quiet reporter: agrees with the default reporter on counts and exit code, on a RED suite", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "quiet-rep-"));
  const file = path.join(dir, "fixture.test.mjs");
  await writeFile(file, FIXTURE, "utf8");
  try {
    const plain = run(["--test"], file);
    const quiet = run(["--test", `--test-reporter=${REPORTER}`], file);

    assert.equal(quiet.code, plain.code,
      `exit codes must match — default ${plain.code}, quiet ${quiet.code}. A quiet lane that ` +
      `exits 0 on a red suite would silently mislead every agent run.`);
    assert.equal(quiet.code, 1, "a failing fixture must exit non-zero");

    const p = counts(plain.out), q = counts(quiet.out);
    for (const key of ["tests", "pass", "fail", "skipped"]) {
      assert.equal(q[key], p[key], `${key}: quiet says ${q[key]}, default says ${p[key]}\n${quiet.out}`);
    }
    assert.equal(q.fail, 4, "fixture is meant to produce 4 failures — update it or the count");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("quiet reporter: a parent failing only via a subtest does not crash it", async () => {
  /* The exact regression. `cause` is the STRING "1 subtest failed" here, not an Error. */
  const dir = await mkdtemp(path.join(tmpdir(), "quiet-sub-"));
  const file = path.join(dir, "fixture.test.mjs");
  await writeFile(file, `
import { test } from "node:test";
import assert from "node:assert/strict";
test("parent", async t => { await t.test("child bad", () => assert.equal(1, 2)); });
test("later failure that must still be reported", () => assert.equal("a", "b"));
`, "utf8");
  try {
    const quiet = run(["--test", `--test-reporter=${REPORTER}`], file);
    assert.ok(!/TypeError: Cannot use 'in' operator/.test(quiet.out),
      `reporter crashed on a string cause:\n${quiet.out}`);
    assert.ok(!/node:internal\/streams/.test(quiet.out),
      `reporter died inside node's stream machinery:\n${quiet.out}`);
    // Both the subtest-parent AND the failure AFTER it must survive to the output.
    assert.match(quiet.out, /subtest failed/, "the parent's own failure line is missing");
    assert.match(quiet.out, /later failure that must still be reported/,
      "a failure after the crash point was swallowed");
    assert.match(quiet.out, /# tests \d+ \| pass \d+ \| fail \d+/, "the summary counts were lost");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("quiet reporter: a GREEN suite stays terse and exits 0", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "quiet-green-"));
  const file = path.join(dir, "fixture.test.mjs");
  await writeFile(file, `
import { test } from "node:test";
import assert from "node:assert/strict";
test("a", () => assert.ok(true));
test("b", () => assert.ok(true));
`, "utf8");
  try {
    const quiet = run(["--test", `--test-reporter=${REPORTER}`], file);
    assert.equal(quiet.code, 0);
    assert.match(quiet.out, /# tests 2 \| pass 2 \| fail 0/);
    assert.ok(!/✖/.test(quiet.out), "a green run must print no failure markers");
    /* The terseness claim CLAUDE.md makes for this lane. Generous bound — the point is that
       it is tens of bytes, not the ~84KB of TAP. */
    assert.ok(quiet.out.trim().length < 400,
      `green output should be terse, got ${quiet.out.trim().length} bytes:\n${quiet.out}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
