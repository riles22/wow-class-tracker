import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const template = await readFile(new URL("../src/template.html", import.meta.url), "utf8");
const functions = template.slice(template.indexOf("function leaderboardExplanation()"), template.indexOf("function profileHTML(s)"));
const esc = text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const render = new Function("SOURCES", "META", "PHASE", "esc", "eraOk", "metricEra", "seasonChip", `${functions}; return metricsHTML;`)(
  [{ id: "warcraftlogs", name: "Warcraft Logs" }], {}, { liveLabel: "live patch" }, esc, () => true, m => m.era ?? "live", () => "");
const metric = (extra = {}) => ({ source: "warcraftlogs", bracket: "raid", name: "Leaderboard median DPS (S2 Mythic: example, top 100)", value: 120,
  unit: "DPS", n: 17, asOf: "2026-08-20", sample: { kind: "leaderboard-entries", cap: 100, partition: 2,
    oldestRun: "2026-08-19T03:00:00Z", newestRun: "2026-08-20T04:00:00Z", observedAt: "2026-09-05T10:00:00Z",
    zoneId: 55, encounterId: 123, difficulty: 5, size: 20, metric: "dps", hasMorePages: true }, ...extra });

test("leaderboard samples visibly disclose scope, repeated players, log dates, fetch dates and source", () => {
  const html = render({ role: "Tank", metrics: [metric()] });
  const visible = html.replace(/<[^>]*>/g, " ");
  assert.match(visible, /n=17 leaderboard entries/);
  assert.match(visible, /Top ≤100 entries per spec; partition 2 bests, mixed dates 2026-08-19–2026-08-20; checked 2026-09-05 \(UTC\)/);
  assert.match(visible, /latest included log\s+2026-08-20/);
  assert.match(visible, /Further entries omitted/);
  assert.match(visible, /Entries may repeat players/);
  assert.match(visible, /not the player population/);
  assert.match(visible, /Tank DPS does not measure defense/);
  assert.match(visible, /HPS does not measure overall healer strength/);
  assert.match(visible, /never become letter grades/);
  assert.match(html, /href="https:\/\/www\.warcraftlogs\.com\/zone\/rankings\/55#boss=123"/);
});

test("sample disclosures distinguish complete returned pages and escape data-derived text", () => {
  const m = metric();
  m.sample.hasMorePages = false;
  m.sample.partition = '<img src=x onerror="evil()">';
  m.sample.zoneId = '55" onclick="evil()';
  const html = render({ role: "Healer", metrics: [m] });
  assert.match(html, /No further entries returned/);
  assert.doesNotMatch(html, /Further entries omitted|<img|" onclick=/);
  assert.match(html, /&lt;img/);
});

test("older leaderboard samples are dated neutrally; ordinary metrics gain no leaderboard claims", () => {
  const old = metric(), fresh = metric({ sample: null, name: "A separate measurement", asOf: "2026-09-05" });
  const html = render({ role: "DPS", metrics: [old, fresh] });
  assert.match(html, /older sample — latest included log 2026-08-20/);
  assert.doesNotMatch(html, /upstream rDPS outage/);
  const plain = render({ role: "DPS", metrics: [fresh] });
  assert.doesNotMatch(plain, /leaderboard entries|partition bests|Source leaderboard|capped top sample/);
  assert.match(plain, /n=17/);
});
