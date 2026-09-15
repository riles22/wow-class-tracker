import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

const job = (text, name) => text.slice(text.indexOf(`  ${name}:\n`)).split(/\n  [a-z][a-z0-9_-]*:\n/)[0];

test("collectors, agents and publisher have separate jobs and provider credentials never enter agent execution", () => {
  const text = workflow('nightly'), collect = job(text, 'collect'), refresh = job(text, 'refresh'), publish = job(text, 'publish');
  assert.match(collect, /runs-on: ubuntu-latest/);
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
