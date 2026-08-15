/* Quiet `node --test` reporter for AGENT sessions (2026-08-15 context audit).
 *
 * WHY THIS EXISTS. CLAUDE.md tells every agent to run `npm test && npm run build`
 * after each data edit, so the suite runs many times per session. The default TAP
 * output is ~84 KB / 2,379 lines, which the Bash harness truncates to a 2 KB preview
 * plus a persisted file — so the agent sees TAP's preamble, never the summary, and
 * must make a SECOND tool call to find out what failed. The output is simultaneously
 * too big to keep and too small to be useful.
 *
 * WHY NOT STOCK `--test-reporter=dot`. It emits 412 bytes and full failure
 * diagnostics, but NO counts at all, and it renders a skip identically to a pass.
 * The skill logs' standing convention records exact figures ("332 pass / 0 fail"),
 * and CLAUDE.md warns specifically against misreading the skip count (a checkout
 * without Playwright silently skips the UI invariants). A reporter that hides those
 * numbers in a project whose central failure mode is unverified numbers being
 * written down is an invitation to fabricate them.
 *
 * So: one summary line on green, full diagnostics on red, counts either way.
 *
 * THIS IS THE AGENT LANE ONLY. Every deterministic gate (ci.yml, deploy.yml,
 * nightly.yml's completion gate and publish Gate 1) keeps the default reporter —
 * they consume the exit code and their full log belongs in the Actions log, where
 * context costs nothing. `npm test` is deliberately NOT redefined; this is a
 * sibling script, so pointing the agent lane here cannot move a gate by accident.
 *
 * Usage: npm run test:quiet
 * The reporter path must stay RELATIVE (`./src/quiet-reporter.mjs`) — an absolute
 * Windows path fails with ERR_UNSUPPORTED_ESM_URL_SCHEME.
 *
 * The exit code comes from the test runner, not the reporter, so a red run still
 * exits 1 and still fails `&&` chains.
 *
 * MEASURED 2026-08-15 on the real suite: 84,423 bytes (tap) -> 63 bytes, counts intact.
 */

import path from "node:path";

/* `test:summary` is Node >= 22 (package.json allows >= 20), and a failing suite
   re-reports its children's failures, so counts are tallied from the events too and
   the summary is preferred only when it actually arrives. */
export default async function* quietReporter(source) {
  const failures = [];
  const tally = { tests: 0, passed: 0, failed: 0, skipped: 0, todo: 0 };
  let summary = null;
  let durationMs = null;

  for await (const event of source) {
    const d = event.data;

    if (event.type === "test:pass" || event.type === "test:fail") {
      /* A suite emits its own pass/fail carrying its children's result — counting it
         would double every nested test. */
      if (d?.details?.type === "suite") continue;
      tally.tests++;
      if (event.type === "test:fail") {
        tally.failed++;
        failures.push(d);
      } else if (d?.skip) tally.skipped++;
      else if (d?.todo) tally.todo++;
      else tally.passed++;
      continue;
    }

    /* Per-file summaries carry `.file`; the run-level one does not. */
    if (event.type === "test:summary" && !d?.file) {
      summary = d.counts ?? null;
      durationMs = d.duration_ms ?? null;
    }
  }

  for (const failure of failures) {
    yield `\n${formatFailure(failure)}`;
  }

  const counts = summary
    ? {
        tests: summary.tests,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        todo: summary.todo,
      }
    : tally;

  const parts = [
    `tests ${counts.tests}`,
    `pass ${counts.passed}`,
    `fail ${counts.failed}`,
    `skipped ${counts.skipped}`,
    `todo ${counts.todo}`,
  ];
  const took = durationMs == null ? "" : `  (${(durationMs / 1000).toFixed(1)}s)`;
  yield `\n# ${parts.join(" | ")}${took}\n`;

  /* Named explicitly because it is the number CLAUDE.md warns about misreading: a
     checkout without Playwright skips the UI invariants and still looks green. */
  if (counts.skipped > 0) {
    yield `# ${counts.skipped} skipped — check whether the UI invariants ran (they need Playwright)\n`;
  }
}

function formatFailure(failure) {
  const where = failure.file
    ? path.relative(process.cwd(), failure.file).replace(/\\/g, "/")
    : "unknown file";
  const lines = [`✖ ${failure.name}  (${where})`];

  /* details.error is node's ERR_TEST_FAILURE wrapper; the real assertion — and the
     stack frame naming the test's own line — is on its cause. */
  const wrapper = failure.details?.error;
  const error = wrapper?.cause ?? wrapper;

  if (!error) {
    lines.push("  (no error detail reported)");
    return lines.join("\n") + "\n";
  }

  const message = error.message ?? String(error);
  /* "TypeError" / "AssertionError" is often the fastest read on what broke, and
     error.message alone drops it. */
  const named =
    error.name && !message.startsWith(error.name) ? `${error.name}: ${message}` : message;
  lines.push(`  ${named.split("\n").join("\n  ")}`);

  /* `error` is not always an object. When a PARENT test fails only because a subtest did,
     node sets the wrapper's cause to the bare string "N subtests failed" — and `in` throws a
     TypeError on a primitive, which killed the whole reporter mid-stream: it printed the
     first two failures, then died inside node's event machinery with a stack that reads like
     a harness bug rather than a test failure, losing every later failure AND the summary
     counts that are this reporter's entire reason to exist. The repo has subtests in
     ui-invariants and three gearing files, and both nightly agent prompts run test:quiet, so
     this was reachable on any red run in the lane the reporter was written for.
     (Found 2026-08-15 by running it against a deliberately failing fixture; there was no
     test for this file at all.) */
  if (error && typeof error === "object" && ("actual" in error || "expected" in error)) {
    lines.push(`    actual:   ${format(error.actual)}`);
    lines.push(`    expected: ${format(error.expected)}`);
  }

  const frame = firstUserFrame(error.stack);
  if (frame) lines.push(`  at ${frame}`);

  return lines.join("\n") + "\n";
}

/* The test's own frame, not node's internal runner frames — that is the line an
   agent needs to open. */
function firstUserFrame(stack) {
  if (typeof stack !== "string") return null;
  for (const line of stack.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("at ")) continue;
    if (trimmed.includes("node:internal")) continue;
    return trimmed.slice(3);
  }
  return null;
}

function format(value) {
  if (typeof value === "string") return JSON.stringify(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
