import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const workflow = name => readFileSync(new URL(`../.github/workflows/${name}.yml`,import.meta.url),"utf8");

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

test("nightly binds metric and note checks to artifacts created before the agent", () => {
  const text = workflow("nightly");
  const agent = text.indexOf("- name: Primary full refresh");
  const overlay = text.indexOf("- name: Download refresh output");
  const publishChecks = text.indexOf("- name: Verify collected metrics and complete official note intake");
  assert.ok(agent > 0 && overlay > agent && publishChecks > overlay);
  for (const [fetcher, download, checker] of [
    ["fetch-stable-metrics", "Download trusted stable metric receipts", "check-stable-metrics"],
    ["fetch-official-notes", "Download trusted official note receipts", "check-official-notes"],
  ]) {
    assert.ok(text.indexOf(`run: node src/${fetcher}.mjs`) < agent);
    const trusted = text.indexOf(`- name: ${download}`);
    assert.ok(trusted > overlay && trusted < publishChecks);
    assert.ok(text.indexOf(`node src/${checker}.mjs`, publishChecks) < text.indexOf("- name: Commit and push explicit paths"));
  }
});
