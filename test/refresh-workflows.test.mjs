import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
const workflow = name => readFileSync(new URL(`../.github/workflows/${name}.yml`,import.meta.url),"utf8").replace(/\r\n?/g, "\n");

test('all four page browser checks run in every browser job and historical receipts are immutable during refresh', () => {
  const ci = workflow('ci');
  assert.match(ci, /browser: \[chromium, firefox, webkit\]/);
  const browserCommand = ci.match(/run: node --test ([^\r\n]+)/)?.[1];
  assert.ok(browserCommand, 'CI runs the page browser suites');
  for (const file of ['test/ui-invariants.test.mjs', 'test/forecast-report-ui.test.mjs',
    'test/season-archive-ui.test.mjs', 'gearing/test/ui-invariants.test.mjs'])
    assert.ok(browserCommand.split(/\s+/).includes(file), `${file} runs in the browser matrix`);
  assert.match(workflow('nightly'), /git diff --quiet HEAD --[^\n]*data\/predictions\//);
});

test("nightly checks the trusted refresh base before overlay and gates gearing before publication",()=>{
  const text=workflow("nightly");
  assert.ok(text.indexOf("run: node src/check-refresh-base.mjs") < text.indexOf("- name: Download refresh output"));
  assert.match(text,/REFRESH_BASE_SHA: \$\{\{ github\.sha \}\}/);
  assert.ok(text.indexOf("run: node src/fetch-source-health.mjs") < text.indexOf("- name: Primary full refresh"));
  assert.ok(text.indexOf("node gearing/src/harvest-specs.mjs --check") < text.indexOf('- name: "Gate 1:'));
  assert.match(text,/git add -- gearing\/data\/specs\.json gearing\/wow-s2-gearing\.html/);
  assert.doesNotMatch(text,/git rebase|git push[^\n]*--force/);
});

test("the failed-publish report fences gate output with a fence the output cannot close (audit 2026-10-04, F23)", t => {
  const text = workflow("nightly");
  const step = text.slice(text.indexOf("- name: Report a failed publish to the pinned issue"));
  const run = step.slice(0, step.indexOf('gh issue comment "$num" --body-file "$RUNNER_TEMP/failure.md"'));
  assert.doesNotMatch(run, /echo '```'/, "no fixed fence");
  assert.ok(run.indexOf('} > "$gates"') < run.indexOf('echo "### ❌ Nightly publish failed"'), "gate output is collected before the fence is chosen");
  assert.equal(run.match(/echo "\$fence"/g)?.length, 2, "the computed fence opens and closes the block");
  assert.ok(run.indexOf('echo "$fence"') < run.indexOf('cat "$gates"'));
  const program = run.match(/fence="\$\(awk '([^']+)' "\$gates"\)"/)?.[1];
  assert.ok(program, "the fence is computed by awk from the gate output");
  if (spawnSync("awk", ["BEGIN { exit 0 }"]).error) return t.skip("awk is not on PATH");
  const fenceFor = body => spawnSync("awk", [program], { input: body, encoding: "utf8" }).stdout.trim();
  for (const [body, length] of [
    ["plain gate output\n", 3],
    ["inline `code` and ``two``\n", 3],
    ["```\n@someone **out of the fence**\n```\n", 4],
    ["x\n``````` seven\n``` three\n", 8],
    ["no trailing newline ````", 5],
  ]) assert.equal(fenceFor(body), "`".repeat(length), JSON.stringify(body));
});

test("weekly guide publication isolates failed sources and keeps explicit validation and paths",()=>{
  const text=workflow("gearing-refresh");
  assert.match(text,/group: nightly-refresh/);
  for(const source of ["icyveins","wowhead","method"]){
    assert.match(text,new RegExp(`id: ${source}\\s+continue-on-error: true\\s+timeout-minutes: 12\\s+run: node gearing/src/harvest-guide-${source}\\.mjs --force`));
  }
  assert.ok(text.indexOf("node src/check-gearing-guides.mjs") < text.indexOf("npm test"));
  assert.ok(text.indexOf("npm test") < text.indexOf("git commit"));
  assert.ok(text.indexOf("git push origin HEAD:master") < text.indexOf("gh workflow run deploy.yml"));
  assert.match(text,/git add -- gearing\/data\/guides\/icyveins\.json gearing\/data\/guides\/wowhead\.json gearing\/data\/guides\/method\.json gearing\/data\/specs\.json gearing\/wow-s2-gearing\.html dist\//);
  assert.match(text,/Surface incomplete source refreshes\s+if: always\(\)/);
  assert.doesNotMatch(text,/git add \.|git add -A|git rebase|git push[^\n]*--force/);
});

test("every job pins one explicit Ubuntu image, so the runner OS changes only by a reviewed commit", () => {
  /* GitHub moves ubuntu-latest to Ubuntu 26.04 in a rollout from 2026-10-19 to 11-19
     (actions/runner-images issue 14748), inside 12.1.5's first post-launch weeks. A job on
     ubuntu-latest switches when that rollout reaches it, not when a commit says so, and a mixed
     fleet would run collect, refresh and publish on different images. Moving to a newer image
     stays one reviewed commit that edits every runs-on line together. */
  const dir = new URL("../.github/workflows/", import.meta.url), images = new Map();
  for (const f of readdirSync(dir).filter(f => /\.ya?ml$/.test(f))) {
    for (const [, image] of readFileSync(new URL(f, dir), "utf8").matchAll(/^\s*runs-on:\s*(\S+)\s*$/gm)) {
      assert.match(image, /^ubuntu-\d{2}\.\d{2}$/, `${f}: runs-on ${image} is not an explicit Ubuntu image`);
      images.set(image, [...(images.get(image) ?? []), f]);
    }
  }
  assert.ok(images.size > 0, "no runs-on line found in .github/workflows");
  assert.equal(images.size, 1, `one image across every workflow: ${JSON.stringify(Object.fromEntries(images))}`);
});

const job = (text, name) => text.slice(text.indexOf(`  ${name}:\n`)).split(/\n  [a-z][a-z0-9_-]*:\n/)[0];

test("collectors, agents and publisher have separate jobs and provider credentials never enter agent execution", () => {
  const text = workflow('nightly'), collect = job(text, 'collect'), refresh = job(text, 'refresh'), publish = job(text, 'publish');
  assert.match(collect, /runs-on: ubuntu-\d{2}\.\d{2}\b/);
  assert.doesNotMatch(collect, /claude-code-action|CLAUDE_CODE_OAUTH_TOKEN|contents: write|actions: write/);
  assert.match(refresh, /needs: collect/);
  assert.match(refresh, /persist-credentials: false/);
  assert.match(refresh, /claude-code-action/);
  assert.doesNotMatch(refresh, /secrets\.WCL_CLIENT_|secrets\.TRANSCRIPT_API_KEY|secrets\.TRANSCRIPT_STATE_SIGNING_KEY|fetch-transcripts\.mjs --fetch|contents: write|actions: write/);
  assert.doesNotMatch(publish, /CLAUDE_CODE_OAUTH_TOKEN|TRANSCRIPT_API_KEY|TRANSCRIPT_HANDOFF_KEY|TRANSCRIPT_STATE_SIGNING_KEY|claude-code-action/);
  assert.match(publish, /needs: \[collect, refresh\]/);
  assert.match(publish, /!cancelled\(\) && needs\.collect\.result == 'success'/);
  const packed = collect.indexOf('run: node src/collector-receipts.mjs pack');
  for (const script of ['fetch-wcl', 'fetch-source-health', 'fetch-stable-metrics', 'fetch-official-notes', 'fetch-published']) {
    const at = collect.indexOf(`run: node src/${script}.mjs`);
    assert.ok(at >= 0 && at < packed, `${script} executes only on the trusted collector before sealing`);
    assert.doesNotMatch(refresh, new RegExp(`run: node src/${script}\\.mjs`));
  }
  assert.ok(collect.indexOf('run: node src/fetch-transcripts.mjs --fetch') < packed);
  assert.ok(collect.indexOf('collector-receipts.mjs check-key') < collect.indexOf('fetch-wcl.mjs'), 'missing handoff key fails before provider requests');
});

test("the refresh job outlasts a primary agent that uses its whole limit and then a full recovery pass (audit 2026-10-04, F57)", () => {
  const refresh = job(workflow("nightly"), "refresh");
  const step = name => {
    const at = refresh.indexOf(`- name: ${name}`);
    assert.ok(at >= 0, `${name} step present`);
    return Number(/\n        timeout-minutes: (\d+)\b/.exec(refresh.slice(at).split(/\n      - /)[0])?.[1]);
  };
  const jobLimit = Number(/\n    timeout-minutes: (\d+)\n/.exec(refresh)?.[1]);
  const primary = step("Primary full refresh"), recovery = step("Recovery pass");
  assert.ok(primary >= 80, `primary ${primary}: the 12.1 launch night's primary took 54m48s of the old 55`);
  assert.ok(recovery > 0);
  assert.ok(jobLimit >= primary + recovery + 10,
    `job ${jobLimit} must cover primary ${primary} + recovery ${recovery} + about 10 for setup and gates`);
});

test("agent and publisher inputs bind collector artifact ID, archive digest, manifest digest and exact file bytes", () => {
  const text = workflow('nightly'), collect = job(text, 'collect'), refresh = job(text, 'refresh'), publish = job(text, 'publish');
  for (const output of ['artifact_id: ${{ steps.receipts.outputs.artifact-id }}',
    'artifact_digest: ${{ steps.receipts.outputs.artifact-digest }}', 'manifest_sha256: ${{ steps.manifest.outputs.manifest_sha256 }}'])
    assert.ok(collect.includes(output));
  assert.match(collect, /name: collector-receipts-\$\{\{ github\.run_attempt \}\}/);
  for (const [consumer, mode] of [[refresh, 'agent'], [publish, 'publish']]) {
    assert.match(consumer, /artifact-ids: \$\{\{ needs\.collect\.outputs\.artifact_id \}\}/);
    for (const output of ['artifact_id', 'artifact_digest', 'manifest_sha256'])
      assert.ok(consumer.includes(`needs.collect.outputs.${output}`));
    assert.ok(consumer.includes(`run: node src/collector-receipts.mjs install-${mode}`));
    assert.match(consumer, /path: \$\{\{ runner\.temp \}\}\/collector-receipts/);
    assert.doesNotMatch(consumer, /name: (wcl-evidence|stable-metrics|official-notes|published-evidence)/);
  }
  const overlay = publish.indexOf('- name: Download refresh output');
  const safeOverlay = publish.indexOf('run: node src/install-refresh-output.mjs');
  const receiptCheck = publish.indexOf('run: node src/collector-receipts.mjs install-publish');
  const gates = publish.indexOf('- name: "Gate 0:');
  assert.ok(overlay >= 0 && overlay < safeOverlay && safeOverlay < receiptCheck && receiptCheck < gates);
  assert.match(publish, /name: nightly-refresh\s+path: \$\{\{ runner\.temp \}\}\/untrusted-refresh/);
  assert.doesNotMatch(publish, /name: nightly-refresh\s+path: \.\s/);
  for (const check of ['check-wcl-metrics', 'check-stable-metrics', 'check-official-notes'])
    assert.ok(publish.indexOf(`node src/${check}.mjs`) > receiptCheck);
});

test("caption artifacts contain encrypted handoff and durable state only, with reviewed reconciliation before reserving requests", () => {
  const collect = job(workflow('nightly'), 'collect');
  const reconcile = collect.indexOf('node src/reconcile-transcript-state.mjs');
  const restoreAuth = collect.indexOf('- name: Authenticate restored transcript state before use');
  const reconcileAuth = collect.indexOf('- name: Authenticate the reviewed completion before reconciliation');
  const reserve = collect.indexOf('run: node src/fetch-transcripts.mjs --prepare');
  assert.ok(restoreAuth > 0 && restoreAuth < reconcileAuth && reconcileAuth < reconcile);
  assert.match(collect, /--phase reserved/);
  assert.match(collect, /--phase complete/);
  const reservationUpload = collect.indexOf('name: transcript-state-reserved');
  const fetch = collect.indexOf('run: node src/fetch-transcripts.mjs --fetch');
  assert.ok(reconcile > 0 && reconcile < reserve && reserve < reservationUpload && reservationUpload < fetch);
  const reservedSign = collect.indexOf('- name: Sign the transcript reservation on the collector runner');
  const completeSign = collect.indexOf('- name: Sign transcript outcomes on the collector runner');
  const completeUpload = collect.indexOf('- name: Save transcript outcomes before the agents run');
  assert.ok(reserve < reservedSign && reservedSign < reservationUpload && fetch < completeSign && completeSign < completeUpload);
  for (const title of ['Authenticate restored transcript state before use', 'Authenticate the reviewed completion before reconciliation']) {
    const step = collect.slice(collect.indexOf(`- name: ${title}`)).split(/\n      - name:/)[0];
    assert.match(step, /GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
    assert.match(step, /TRANSCRIPT_STATE_SIGNING_KEY/);
    assert.match(step, /transcript-state-auth\.mjs verify/);
  }
  assert.match(collect, /TRANSCRIPT_RECONCILE_ARTIFACT_ID: \$\{\{ inputs\.transcript_reconcile_artifact_id \}\}/);
  assert.match(collect, /--receipt-artifact-id "\$RECEIPT_ARTIFACT_ID" --receipt-run-id "\$RECEIPT_RUN_ID"/);
  // Exact durable-state upload paths keep per-video plaintext out of public artifacts.
  for (const name of ['transcript-state-reserved', 'transcript-state-complete']) {
    const upload = collect.slice(collect.indexOf(`name: ${name}`)).split(/\n      - name:/)[0];
    assert.match(upload, /transcript-fetch\/state\.json/);
    assert.match(upload, /transcript-fetch\/authentication\.json/);
    assert.doesNotMatch(upload, /transcript-fetch\/\*|transcript-fetch\/\s*$/m);
  }
});

// The text of every `run:` (inline or block scalar), i.e. everything that reaches a shell.
const runBlocks = text => {
  const lines = text.split("\n"), blocks = [];
  lines.forEach((line, i) => {
    const m = /^(\s*)(- )?run:(.*)$/.exec(line);
    if (!m) return;
    const keyColumn = m[1].length + (m[2] ? 2 : 0), body = [m[3]];
    for (let j = i + 1; j < lines.length && (!lines[j].trim() || lines[j].search(/\S/) > keyColumn); j++) body.push(lines[j]);
    blocks.push(body.join("\n"));
  });
  return blocks;
};

test("a failed bot-started run comments on issue 15 from a final job, because workflow_run never fires for one", () => {
  const text = workflow("dispatched-run-alert");
  const on = text.slice(text.indexOf("\non:\n"), text.indexOf("\npermissions:"));
  assert.match(on, /^\non:\n  workflow_call:\n/);
  assert.doesNotMatch(on, /workflow_run|schedule|push|pull_request|workflow_dispatch/,
    "GitHub starts no workflow_run listener for a run whose actor is github-actions[bot]");
  assert.match(text, /\npermissions: \{\}\n/);
  assert.deepEqual(text.match(/^\s*[a-z-]+: write\s*$/gm).map(s => s.trim()), ["issues: write"]);
  assert.deepEqual([...text.matchAll(/runs-on: (\S+)/g)].map(m => m[1]), ["ubuntu-24.04"]);
  assert.match(text, /\n    timeout-minutes: \d+\n/);
  assert.doesNotMatch(text, /^\s*(- )?uses:/m, "no checkout and no third-party action");
  assert.doesNotMatch(text, /secrets\./);
  assert.match(text, /GH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(text, /ALERT_ISSUE: "15"/);
  const [script, ...others] = runBlocks(text);
  assert.equal(others.length, 0);
  assert.doesNotMatch(script, /\$\{\{/, "event and context values reach the shell only through env");
  // GitHub links an @name or a #number after rendering, so neither may reach the body.
  assert.doesNotMatch(/tr -cd '([^']+)'/.exec(script)[1], /[@#]/);
  assert.match(script, /workflow="\$\(clean "\$WORKFLOW_NAME"\)"/);
  assert.match(script, /event="\$\(clean "\$EVENT_NAME"\)"/);
  assert.match(script, /jobs="\$\(clean "\$jobs"\)"/);
  assert.match(script, /if \[\[ "\$COMMIT_SHA" =~ \^\[0-9a-f\]\{40\}\$ \]\]; then/);
  const body = script.slice(script.indexOf("{\n"), script.indexOf('} > "$body"'));
  assert.match(body, /Dispatched run failed: \$workflow/);
  assert.match(body, /- Run: \$RUN_URL/);
  assert.doesNotMatch(body, /@|#\d/);
  const guard = script.indexOf("grep -qE '@|#[0-9]' \"$body\"");
  assert.ok(guard > 0 && guard < script.indexOf('gh issue comment "$ALERT_ISSUE" --repo "$GITHUB_REPOSITORY" --body-file "$body"'));
});

test("every workflow the bot dispatches ends with the alert job, gated on a bot trigger and a failed job", () => {
  const files = readdirSync(new URL("../.github/workflows/", import.meta.url)).filter(f => f.endsWith(".yml"));
  const dispatched = new Set(files.flatMap(f =>
    [...workflow(f.slice(0, -4)).matchAll(/gh workflow run ([a-z0-9-]+)\.yml/g)].map(m => m[1])));
  assert.deepEqual([...dispatched].sort(), ["ci", "deploy", "nightly"]);
  for (const name of dispatched) {
    const text = workflow(name);
    const ids = [...text.slice(text.indexOf("\njobs:\n")).matchAll(/\n  ([a-z][a-z0-9_-]*):\n/g)].map(m => m[1]);
    assert.equal(ids.at(-1), "dispatched-run-alert", `${name}: the alert is the last job`);
    const alert = job(text, "dispatched-run-alert");
    assert.deepEqual(/\n    needs: \[([^\]]+)\]\n/.exec(alert)?.[1].split(", "), ids.slice(0, -1),
      `${name}: the alert waits for every other job`);
    const gate = /\n    if: \$\{\{ (.+) \}\}\n/.exec(alert)?.[1] ?? "";
    assert.ok(gate.startsWith("!cancelled() && github.triggering_actor == 'github-actions[bot]' && "), `${name}: ${gate}`);
    assert.ok(gate.endsWith("(contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled'))"), `${name}: ${gate}`);
    assert.match(alert, /\n    permissions:\n      issues: write\n    uses: \.\/\.github\/workflows\/dispatched-run-alert\.yml\n/);
    assert.match(alert, /\n      needs_json: \$\{\{ toJSON\(needs\) \}\}\n/);
    assert.doesNotMatch(alert, /runs-on:|secrets:/);
  }
  // A red publish job already posts its gate output through its own `if: failure()` step.
  assert.match(job(workflow("nightly"), "dispatched-run-alert"), / && needs\.publish\.result != 'failure' && /);
});

// The alert job above reports a run that exists and fails. A dispatch that creates no run
// never reaches it: on 2026-10-14 the nightly's Tests dispatch for 8ddbe61 returned HTTP 500
// and nothing alerted. So that step confirms the run itself and comments on issue 15.
const testsDispatch = () => {
  const publish = job(workflow("nightly"), "publish");
  const start = publish.indexOf("      - name: Run the UI invariants against what we just pushed\n");
  const step = publish.slice(start, publish.indexOf("\n      - name: ", start + 1));
  const lines = (runBlocks(step)[0] ?? "").split("\n").slice(1);
  const indent = lines.find(line => line.trim())?.search(/\S/) ?? 0;
  return { publish, start, step, script: lines.map(line => line.slice(indent)).join("\n") };
};

test("the nightly's Tests dispatch never fails the publish and alerts issue 15 when no Tests run appears", () => {
  const { publish, start, step, script } = testsDispatch();
  const commit = publish.indexOf("      - name: Commit and push explicit paths\n");
  const deploy = publish.indexOf("      - name: Trigger Pages deploy when site inputs changed\n");
  assert.ok(commit > 0 && commit < deploy && deploy < start, "after the push and the deploy dispatch");
  assert.ok(start < publish.indexOf("      - name: Post run digest to the pinned issue\n"));
  // It also runs after a failed deploy dispatch, so the Tests leg never depends on the deploy leg.
  assert.match(step, /\n        if: \$\{\{ !cancelled\(\) && steps\.commit\.outputs\.pushed == 'true' \}\}\n/);
  assert.match(step, /\n        continue-on-error: true\n/);
  assert.match(step, /\n        timeout-minutes: \d+\n/);
  assert.match(step, /\n          GH_TOKEN: \$\{\{ github\.token \}\}\n/);
  assert.match(step, /\n          ALERT_ISSUE: "15"\n/);
  assert.match(publish, /\n      actions: write\b/);
  assert.match(publish, /\n      issues: write\b/);
  assert.equal(runBlocks(step).length, 1);
  assert.doesNotMatch(script, /\$\{\{/, "context values reach the shell only through env");
  const kept = text => /tr -cd '([^']+)'/.exec(text)?.[1];
  assert.equal(kept(script), kept(workflow("dispatched-run-alert")), "the alert file's body filter");
  const guard = script.indexOf(`grep -qE '@|#[0-9]' "$body"`);
  assert.ok(guard > 0 && guard < script.indexOf(`gh issue comment "$ALERT_ISSUE" --repo "$GITHUB_REPOSITORY" --body-file "$body"`));
});

test("the Tests dispatch takes the run GitHub returns, retries until a run exists, never repeats one a failed call created, and alerts only when none appears", t => {
  const probe = spawnSync("bash", ["-c", "printf ok"], { encoding: "utf8" });
  if (probe.error || probe.stdout !== "ok") return t.skip("bash is not on PATH");
  const { step, script } = testsDispatch();
  const sha = "0123456789abcdef0123456789abcdef01234567";
  // The step's own script under `bash -e` (the runner's default), with git, gh, timeout and
  // sleep replaced by functions that write a trace. Each `gh workflow run` follows the plan:
  // ok = GitHub returns the created run, so gh prints its URL; moved = the same, but master
  // moved after the push, so the run's head is a newer commit and the lookup by commit never
  // sees it; 204 = accepted without run details, the run exists; accepted = accepted, no run;
  // 500 = fails, no run; 500+run = fails although GitHub created the run; hang = killed by
  // timeout (exit 124).
  const run = plan => {
    const stubs = `
export GITHUB_REPOSITORY=owner/repo ALERT_ISSUE=15 GH_TOKEN=unused
export REPO_URL=https://github.com/owner/repo RUN_URL=https://github.com/owner/repo/actions/runs/7
RUNNER_TEMP="$(mktemp -d)"; export RUNNER_TEMP
plan=(${plan.join(" ")}) n=0 runs=0 bounded=0
trace="$RUNNER_TEMP/trace"; : > "$trace"
trap 'echo "TRACE>"; cat "$trace"; echo "<TRACE"; rm -rf "$RUNNER_TEMP"' EXIT
git() { echo ${sha}; }
sleep() { echo "sleep $1" >> "$trace"; }
timeout() { echo "limit $1" >> "$trace"; shift; bounded=1 "$@"; }
gh() {
  [ "$bounded" = 1 ] || echo "unbounded gh $*" >> "$trace"
  local args=" $* " want
  case "$1 $2" in
    "workflow run")
      n=$((n + 1)); local r="\${plan[n-1]:-extra}"; echo "dispatch $r" >> "$trace"
      for want in " ci.yml " " --repo owner/repo " " --ref master " " commit_sha=${sha} "; do
        case "$args" in *"$want"*) ;; *) echo "bad dispatch:$args" >> "$trace"; return 2;; esac
      done
      case "$r" in
        ok) runs=1; echo "https://github.com/owner/repo/actions/runs/11";;
        moved) echo "https://github.com/owner/repo/actions/runs/11";;
        204) runs=1;;
        accepted) ;;
        hang) return 124;;
        500+run) runs=1; echo "could not create workflow dispatch event: HTTP 500" >&2; return 1;;
        500) echo "could not create workflow dispatch event: HTTP 500" >&2; return 1;;
        *) echo "bad plan $r" >> "$trace"; return 2;;
      esac;;
    "run list")
      echo "lookup" >> "$trace"
      for want in " --repo owner/repo " " --workflow ci.yml " " --commit ${sha} "; do
        case "$args" in *"$want"*) ;; *) echo "bad list:$args" >> "$trace"; return 2;; esac
      done
      if [ "$runs" = 1 ]; then echo "https://github.com/owner/repo/actions/runs/9"; fi;;
    "issue comment")
      echo "comment$args" >> "$trace"; echo "BODY>"; cat "\${@: -1}"; echo "<BODY";;
    *) echo "unexpected gh $*" >> "$trace"; return 2;;
  esac
}
`;
    const r = spawnSync("bash", ["-e", "-s"], { input: stubs + script, encoding: "utf8" });
    const between = (open, close) => r.stdout.includes(open)
      ? r.stdout.slice(r.stdout.indexOf(open) + open.length, r.stdout.indexOf(close)).trim() : null;
    const trace = (between("TRACE>", "<TRACE") ?? "").split("\n").map(line => line.trim());
    return {
      status: r.status, stdout: r.stdout, trace, body: between("BODY>", "<BODY"),
      dispatches: trace.filter(line => line.startsWith("dispatch ")).length,
      lookups: trace.filter(line => line === "lookup").length,
      comments: trace.filter(line => line.startsWith("comment ")),
      seconds: trace.filter(line => /^(sleep|limit) /.test(line)).reduce((sum, line) => sum + Number(line.split(" ")[1]), 0),
    };
  };
  // [plan, dispatches, lookups by commit, run in the notice]: run 11 is the one GitHub
  // returned, run 9 the one the lookup found.
  for (const [plan, dispatches, lookups, id] of [
    [["ok"], 1, 0, 11],
    [["moved"], 1, 0, 11],
    [["204"], 1, 1, 9],
    [["500+run"], 1, 1, 9],
    [["500", "500", "ok"], 3, 6, 11],
  ]) {
    const r = run(plan);
    assert.equal(r.status, 0, `${plan}: ${r.stdout}`);
    assert.equal(r.dispatches, dispatches, `${plan}: once a run exists the dispatch is not repeated`);
    assert.equal(r.lookups, lookups, `${plan}: the lookup by commit runs only when GitHub returned no run`);
    assert.deepEqual(r.comments, [], `${plan}: no alert while a run exists`);
    assert.match(r.stdout, new RegExp(`::notice::Tests run for 0123456: https://github\\.com/owner/repo/actions/runs/${id}\\n`));
    assert.doesNotMatch(r.trace.join("\n"), /^(unbounded|bad|unexpected) /m, `${plan}: ${r.trace}`);
  }
  const failed = run(["500", "hang", "accepted"]);
  assert.equal(failed.status, 1, "the step fails by itself; continue-on-error keeps the job green");
  assert.equal(failed.dispatches, 3);
  assert.equal(failed.lookups, 9);
  assert.match(failed.stdout, /::warning::No Tests run found for 0123456 after three dispatch attempts \(1: HTTP 500, 2: timed out, 3: accepted\)/);
  assert.equal(failed.comments.length, 1);
  assert.match(failed.comments[0], /^comment issue comment 15 --repo owner\/repo --body-file \S+\/tests-dispatch-alert\.md$/);
  assert.match(failed.body, /^### ❌ Tests dispatch failed: /);
  assert.match(failed.body, /\n- Attempts: 1: HTTP 500, 2: timed out, 3: accepted\n/);
  assert.match(failed.body, new RegExp(`\\n- Commit: \\[0123456\\]\\(https://github\\.com/owner/repo/commit/${sha}\\)\\n`));
  assert.match(failed.body, /\n- Run: https:\/\/github\.com\/owner\/repo\/actions\/runs\/7\n/);
  assert.doesNotMatch(failed.body, /@|#\d/);
  assert.doesNotMatch(failed.trace.join("\n"), /^(unbounded|bad|unexpected) /m, `${failed.trace}`);
  // Every gh call is bounded, so the worst case is the sum of the bounds and the waits.
  const budget = Number(/\n        timeout-minutes: (\d+)\n/.exec(step)?.[1]) * 60;
  assert.ok(failed.seconds < budget, `worst case ${failed.seconds}s must fit timeout-minutes (${budget}s)`);
});

// ci.yml's browser install. On 2026-10-26 the runner's apt mirror trickled the browsers'
// system packages (WebKit's 107 MB took 49m46s) and nothing bounded the step. Every download
// is now bounded and retried, and a kill can only land on a download: the attempts run apt in
// download-only mode, and the install runs once, after them.
const ciInstallStep = title => {
  const browserJob = job(workflow("ci"), "ui-invariants");
  const start = browserJob.indexOf(`      - name: ${title}\n`);
  assert.ok(start > 0, `ci.yml has the step "${title}"`);
  const step = browserJob.slice(start, browserJob.indexOf("\n      - name: ", start + 1));
  const lines = (runBlocks(step)[0] ?? "").split("\n").slice(1);
  const indent = lines.find(line => line.trim())?.search(/\S/) ?? 0;
  return { script: lines.map(line => line.slice(indent)).join("\n"),
    budget: Number(/\n        timeout-minutes: (\d+)\n/.exec(step)?.[1]) * 60 };
};
const SYSTEM_PACKAGES = "Install the browser's system packages (downloads bounded and retried)";
const BROWSER_DOWNLOAD = "Download the browser (bounded and retried)";

// The step's own script under `bash -e`, with timeout, sudo and npx replaced by functions
// that write a trace. Each npx call under timeout follows the plan: ok; slow = killed at the
// bound (exit 124); fail = apt gave up (exit 100).
const runInstall = (script, plan) => {
  const stubs = `
export PLAYWRIGHT_BROWSER=webkit
plan=(${plan.join(" ")}) n=0 bounded=0
trace="$(mktemp)"
trap 'echo "TRACE>"; cat "$trace"; echo "<TRACE"; rm -f "$trace"' EXIT
timeout() { local bounds=""; while [ "\${1#-}" != "$1" ]; do bounds="$bounds $1"; shift; done; echo "limit$bounds $1" >> "$trace"; shift; bounded=1 "$@"; }
sudo() { if [ "$1" = tee ]; then echo "sudo $* <<< $(cat)" >> "$trace"; else echo "sudo $*" >> "$trace"; fi; }
npx() {
  if [ "$bounded" = 0 ]; then echo "unbounded npx $*" >> "$trace"; return 0; fi
  n=$((n + 1)); local r="\${plan[n-1]:-extra}"; echo "npx $* ($r)" >> "$trace"
  case "$r" in ok) ;; slow) return 124;; fail) return 100;; *) return 2;; esac
}
`;
  const r = spawnSync("bash", ["-e", "-s"], { input: stubs + script, encoding: "utf8" });
  const trace = (r.stdout.split("TRACE>")[1] ?? "").split("<TRACE")[0].trim().split("\n").map(line => line.trim());
  const seconds = trace.filter(line => line.startsWith("limit ")).flatMap(line => line.split(" ").slice(1))
    .reduce((sum, bound) => {
      const [, n, unit] = /(\d+)([sm]?)$/.exec(bound);
      return sum + Number(n) * (unit === "m" ? 60 : 1);
    }, 0);
  return { status: r.status, stdout: r.stdout, trace, seconds };
};

test("ci.yml's browser job has a backstop timeout that covers its bounded install steps", () => {
  const ci = workflow("ci");
  const jobMinutes = name => Number(/\n    timeout-minutes: (\d+)\b/.exec(job(ci, name))?.[1]);
  assert.ok(jobMinutes("test") > 0, "the test job has a backstop too");
  assert.doesNotMatch(ci, /--with-deps/, "no apt download outside the bounded attempts");
  assert.match(ci, /\n        run: npm install --no-save playwright@\d+\.\d+\.\d+\n/);
  const steps = (ciInstallStep(SYSTEM_PACKAGES).budget + ciInstallStep(BROWSER_DOWNLOAD).budget) / 60;
  assert.ok(steps + 5 <= jobMinutes("ui-invariants"),
    `the install steps' ${steps} minutes, plus 5 for the build and the tests, must fit the job's timeout`);
});

test("ci.yml's apt downloads are bounded, retry without the Azure mirror, and leave dpkg to one install after them", t => {
  const probe = spawnSync("bash", ["-c", "printf ok"], { encoding: "utf8" });
  if (probe.error || probe.stdout !== "ok") return t.skip("bash is not on PATH");
  const { script, budget } = ciInstallStep(SYSTEM_PACKAGES);
  const on = 'sudo tee /etc/apt/apt.conf.d/zz-ci-download-only <<< APT::Get::Download-Only "true";';
  const off = "sudo rm /etc/apt/apt.conf.d/zz-ci-download-only";
  const drop = "sudo sed -i /azure\\.archive\\.ubuntu\\.com/d /etc/apt/apt-mirrors.txt";
  const install = "unbounded npx playwright install-deps webkit";
  for (const plan of [["ok"], ["slow", "ok"], ["fail", "slow", "ok"]]) {
    const r = runInstall(script, plan);
    assert.equal(r.status, 0, `${plan}: ${r.stdout}`);
    assert.equal(r.trace[0], on, `${plan}: download-only mode before the first attempt`);
    assert.deepEqual(r.trace.filter(line => line.startsWith("npx ")),
      plan.map(step => `npx playwright install-deps webkit (${step})`));
    assert.equal(r.trace.filter(line => line === drop).length, plan.length - 1, `${plan}: each retry drops the Azure mirror`);
    assert.deepEqual(r.trace.slice(-2), [off, install], `${plan}: dpkg runs once, after download-only mode is off`);
    assert.equal(r.stdout.match(/::warning::/g)?.length ?? 0, plan.length - 1);
  }
  const failed = runInstall(script, ["slow", "fail", "slow"]);
  assert.equal(failed.status, 1, failed.stdout);
  assert.match(failed.stdout, /::warning::Attempt 1 of 3 to download the webkit system packages ran past 3 minutes\./);
  assert.match(failed.stdout, /::warning::Attempt 2 of 3 to download the webkit system packages failed with exit 100\./);
  assert.match(failed.stdout, /::error::Could not download the webkit system packages in three attempts\./);
  assert.ok(!failed.trace.includes(install), "nothing installs after a failed download");
  assert.ok(failed.seconds + 120 <= budget,
    `worst case ${failed.seconds}s, plus 2 minutes for the install, must fit timeout-minutes (${budget}s)`);
  // The retry's edit removes only the Azure line from the mirror list that the runner image
  // writes (runner-images configure-apt-sources.sh).
  const expression = /sudo sed -i '([^']+)' \/etc\/apt\/apt-mirrors\.txt/.exec(script)?.[1];
  const mirrors = "http://azure.archive.ubuntu.com/ubuntu/\tpriority:1\n"
    + "https://archive.ubuntu.com/ubuntu/\tpriority:2\nhttps://security.ubuntu.com/ubuntu/\tpriority:3\n";
  const edited = spawnSync("bash", ["-c", 'sed "$1"', "-", expression], { input: mirrors, encoding: "utf8" });
  assert.equal(edited.stdout, mirrors.slice(mirrors.indexOf("https://archive")));
});

test("ci.yml's browser download is bounded and retried once", t => {
  const probe = spawnSync("bash", ["-c", "printf ok"], { encoding: "utf8" });
  if (probe.error || probe.stdout !== "ok") return t.skip("bash is not on PATH");
  const { script, budget } = ciInstallStep(BROWSER_DOWNLOAD);
  for (const plan of [["ok"], ["slow", "ok"]]) {
    const r = runInstall(script, plan);
    assert.equal(r.status, 0, `${plan}: ${r.stdout}`);
    assert.deepEqual(r.trace.filter(line => line.startsWith("npx ")), plan.map(step => `npx playwright install webkit (${step})`));
  }
  const failed = runInstall(script, ["slow", "fail"]);
  assert.equal(failed.status, 1, failed.stdout);
  assert.match(failed.stdout, /::warning::Attempt 1 of 2 to download webkit ran past 3 minutes\./);
  assert.match(failed.stdout, /::error::Could not download webkit in two attempts\./);
  assert.doesNotMatch(failed.trace.join("\n"), /^(unbounded|sudo) /m, "every download is bounded");
  assert.ok(failed.seconds <= budget, `worst case ${failed.seconds}s must fit timeout-minutes (${budget}s)`);
});
