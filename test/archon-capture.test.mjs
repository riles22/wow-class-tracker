import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData } from "../src/validate.mjs";
import { SNIPPET, EXPECTED_METRIC, fnv1a, archonCaptureRows } from "../src/archon-capture.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = await loadData(ROOT);
const scale = data.scales.scales.archon.tiers;
const iconOf = s => `${s.class.replace(/\s+/g, "")}-${s.spec.replace(/\s+/g, "")}`;
const archonPages = data.sources.find(s => s.id === "archon").pages;
const letterPages = archonPages.filter(p => !p.label);
const roleCount = role => data.specs.filter(s => s.role === role).length;

// A tier list as the page's __NEXT_DATA__ carries it, every spec on its stored letter.
const storedList = (metric, bracket, role) => ({
  metric,
  tiers: scale.map(tier => ({
    tier,
    entries: [data.specs.filter(s => s.role === role && s.ratings?.[bracket]?.archon === tier).map(s => ({ icon: iconOf(s) }))]
  }))
});
// Every spec on one letter, so it disagrees with the stored letters.
const flatList = (metric, role, tier) => ({
  metric,
  tiers: [{ tier, entries: [data.specs.filter(s => s.role === role).map(s => ({ icon: iconOf(s) }))] }]
});
// Raid pages list popularity first (measured 2026-10-27); M+ pages carry only score.
const liveLists = page => page.bracket === "raid"
  ? [flatList("popularity", page.role, "S"), storedList("throughput", "raid", page.role), flatList("survivability", page.role, "A")]
  : [storedList("score", "mplus", page.role)];

// Runs the in-page snippet against a fake page, the way the browser tool evaluates it.
function runSnippet(url, tierLists, { nextData = true, bodyText = "Heroic · All Bosses · Season 2" } = {}) {
  const { origin, pathname } = new URL(url);
  const page = { lastUpdated: "2026-10-26T12:00:00Z", specTierListSection: { tierLists } };
  const document = {
    title: "Midnight Rankings and Tier List | Archon (WoW - Midnight)",
    body: { innerText: bodyText },
    getElementById: id => (id === "__NEXT_DATA__" && nextData ? { textContent: JSON.stringify({ props: { pageProps: { page } } }) } : null)
  };
  return new Function("document", "location", `return ${SNIPPET}`)(document, { origin, pathname });
}
const fullCapture = () => ({ capturedAt: "2026-10-27T16:00:00Z", transport: "test", pages: letterPages.map(p => runSnippet(p.url, liveLists(p))) });
const rehash = (page, tiers) => ({ ...page, tiers, hash: fnv1a(tiers.join("\n")) });
const withPage = (capture, i, page) => ({ ...capture, pages: capture.pages.map((p, j) => (j === i ? page : p)) });
const indexOf = (bracket, role) => letterPages.findIndex(p => p.bracket === bracket && p.role === role);
const moveIcon = (tiers, icon, to) => tiers.map(line => {
  const [tier, rest = ""] = line.split(": ");
  const icons = rest.split(" ").filter(x => x && x !== icon);
  if (tier === to) icons.push(icon);
  return `${tier}: ${icons.join(" ")}`;
});

test("the registry has the six letter pages the browser lane reads", () => {
  assert.deepEqual(letterPages.map(p => `${p.bracket} ${p.role}`).sort(),
    ["mplus DPS", "mplus Healer", "mplus Tank", "raid DPS", "raid Healer", "raid Tank"]);
});

test("the snippet reads the throughput list on a raid page although popularity comes first", () => {
  const page = letterPages[indexOf("raid", "DPS")];
  const lists = liveLists(page);
  const out = runSnippet(page.url, lists);
  assert.equal(out.url, page.url);
  assert.equal(out.metric, "throughput");
  assert.deepEqual(out.metrics, ["popularity", "throughput", "survivability"]);
  assert.deepEqual(out.tiers, lists[1].tiers.map(t => `${t.tier}: ${t.entries.flat().map(e => e.icon).join(" ")}`));
  assert.equal(out.hash, fnv1a(out.tiers.join("\n")));
  assert.match(out.agreement.popularity, new RegExp(`^\\d+/${roleCount("DPS")}$`));
  assert.equal(out.season, "Season 2");
  assert.match(out.title, /Archon/);
});

test("the snippet refuses a raid page without a throughput list instead of falling back", () => {
  const page = letterPages[indexOf("raid", "Tank")];
  assert.throws(() => runSnippet(page.url, [flatList("popularity", "Tank", "S")]), /no throughput tier list.*never fall back/);
});

test("the snippet stops the lane on a page without __NEXT_DATA__ (a verification page)", () => {
  assert.throws(() => runSnippet(letterPages[0].url, [], { nextData: false }), /no __NEXT_DATA__.*stop the lane/);
});

test("the snippet reads the score list on an M+ page", () => {
  const page = letterPages[indexOf("mplus", "Healer")];
  const out = runSnippet(page.url, liveLists(page), { bodyText: "" });
  assert.equal(out.metric, "score");
  assert.deepEqual(out.metrics, ["score"]);
  assert.deepEqual(out.agreement, {});
  assert.equal(out.season, null, "no season cue on the page is reported, not guessed");
});

test("a full capture gives one row per spec and bracket, and no moves when nothing changed", () => {
  const result = archonCaptureRows(fullCapture(), data);
  assert.equal(result.rows.length, data.specs.length * 2);
  assert.deepEqual(result.moves, []);
  assert.deepEqual(result.pages.map(p => p.metric), letterPages.map(p => EXPECTED_METRIC[p.bracket]));
  for (const [cls, spec] of [["Death Knight", "Frost"], ["Demon Hunter", "Devourer"], ["Hunter", "Beast Mastery"]]) {
    assert.ok(result.rows.some(r => r.class === cls && r.spec === spec && r.bracket === "raid" && r.source === "archon"), `${spec} ${cls}`);
  }
});

test("moved letters are listed, two-step moves marked", () => {
  const capture = fullCapture();
  const i = indexOf("mplus", "Tank");
  const spec = data.specs.find(s => s.role === "Tank");
  const was = spec.ratings.mplus.archon;
  const to = scale[(scale.indexOf(was) + 2) % scale.length];
  const result = archonCaptureRows(withPage(capture, i, rehash(capture.pages[i], moveIcon(capture.pages[i].tiers, iconOf(spec), to))), data);
  assert.deepEqual(result.moves, [`mplus ${spec.spec} ${spec.class}: ${was} -> ${to} (two-step)`]);
});

test("a page captured from a list other than its bracket's is refused (popularity comes first on raid pages)", () => {
  const capture = fullCapture();
  const raid = indexOf("raid", "DPS"), mplus = indexOf("mplus", "DPS");
  assert.throws(() => archonCaptureRows(withPage(capture, raid, { ...capture.pages[raid], metric: "popularity" }), data),
    /captured the "popularity" list; Archon raid letters come from "throughput" only/);
  assert.throws(() => archonCaptureRows(withPage(capture, mplus, { ...capture.pages[mplus], metric: "throughput" }), data),
    /Archon mplus letters come from "score" only/);
});

test("tier lines that no longer match the snippet's hash are refused as mistyped", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "Healer");
  const spec = data.specs.find(s => s.role === "Healer");
  const to = scale.find(t => t !== spec.ratings.raid.archon);
  const page = { ...capture.pages[i], tiers: moveIcon(capture.pages[i].tiers, iconOf(spec), to) };
  assert.throws(() => archonCaptureRows(withPage(capture, i, page), data), /do not hash to the snippet's .*mistyped/);
});

test("off-scale letters, unknown or wrong-role icons, duplicates and missing specs are refused", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "DPS");
  const healer = iconOf(data.specs.find(s => s.role === "Healer"));
  const dps = iconOf(data.specs.find(s => s.role === "DPS"));
  const cases = [
    [t => [...t, "A+: "], /"A\+" is not on Archon's scale/],
    [t => [...t.slice(0, -1), `${t.at(-1)} Warrior-Gladiator`], /unknown spec token Warrior-Gladiator/],
    [t => [...t.slice(0, -1), `${t.at(-1)} ${healer}`], new RegExp(`${healer} is a Healer spec`)],
    [t => [...t.slice(0, -1), `${t.at(-1)} ${dps}`], new RegExp(`${dps} listed twice`)],
    [t => t.map(line => line.split(" ").filter(x => x !== dps).join(" ")), new RegExp(`missing ${dps}`)]
  ];
  for (const [edit, message] of cases) {
    assert.throws(() => archonCaptureRows(withPage(capture, i, rehash(capture.pages[i], edit(capture.pages[i].tiers))), data), message);
  }
});

test("ancillary, unregistered, repeated and empty captures are refused", () => {
  const capture = fullCapture();
  const ancillary = archonPages.find(p => p.label && ["DPS", "Healer", "Tank"].includes(p.role));
  assert.ok(ancillary, "the registry has a labeled per-role Archon page");
  assert.throws(() => archonCaptureRows({ pages: [{ ...capture.pages[0], url: ancillary.url }] }, data), /feeds a numeric family, not letters/);
  assert.throws(() => archonCaptureRows({ pages: [{ ...capture.pages[0], url: "https://www.archon.gg/wow/tier-list/dps-rankings/raid/normal/all-bosses" }] }, data),
    /not a registered Archon page/);
  assert.throws(() => archonCaptureRows({ pages: [...capture.pages, capture.pages[0]] }, data), /captured twice/);
  assert.throws(() => archonCaptureRows({ pages: [] }, data), /no pages/);
});

test("the CLI prints the snippet and writes rows only from a clean capture", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "archon-capture-"));
  try {
    const cli = path.join(ROOT, "src", "archon-capture.mjs");
    const good = path.join(dir, "good.json"), bad = path.join(dir, "bad.json"), out = path.join(dir, "rows.json");
    const capture = fullCapture();
    await writeFile(good, JSON.stringify(capture));
    await writeFile(bad, JSON.stringify({ ...capture, pages: capture.pages.map(p => (p.metric === "throughput" ? { ...p, metric: "popularity" } : p)) }));
    const refused = spawnSync(process.execPath, [cli, bad, out], { encoding: "utf8" });
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /popularity/);
    await assert.rejects(readFile(out), { code: "ENOENT" });
    const ok = spawnSync(process.execPath, [cli, good, out], { encoding: "utf8" });
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(JSON.parse(await readFile(out, "utf8")).length, data.specs.length * 2);
    assert.equal(spawnSync(process.execPath, [cli, "--snippet"], { encoding: "utf8" }).stdout.trim(), SNIPPET.trim());
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
