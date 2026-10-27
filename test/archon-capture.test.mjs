import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, readFile, writeFile, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData } from "../src/validate.mjs";
import { probeDate, probeRows } from "../src/check-refresh.mjs";
import { applyMetrics } from "../src/apply-metrics.mjs";
import { SNIPPET, ARCHON_SERIES, fnv1a, captureText, popularityTolerance, checkArchonCapture, reportLines } from "../src/archon-capture.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const live = await loadData(ROOT);
const config = JSON.parse(await readFile(path.join(ROOT, "data", "required-sources.json"), "utf8"));

/* The checker is tested against a pinned copy of the stored Archon state: every family
   complete and dated STORED, so a lane run that refreshes data/ moves no expectation here
   (on 2026-10-27 the live rows were dated 2026-08-24/25 and Fire Mage had no Mythic rows).
   The CLI and apply tests use the live data, with a capture dated no earlier than it. */
const STORED = "2026-08-25";
const FILLER = { "%": 0.1, score: 3000, DPS: 150000, HPS: 150000 };
const data = {
  ...live,
  specs: live.specs.map(s => {
    const metrics = (s.metrics ?? []).map(m => (m.source === "archon" ? { ...m, asOf: STORED } : m));
    for (const def of ARCHON_SERIES) {
      if (!def.roles.includes(s.role) || metrics.some(m => m.source === "archon" && m.bracket === def.bracket && m.name === def.name)) continue;
      metrics.push({ source: "archon", bracket: def.bracket, name: def.name, value: FILLER[def.unit], unit: def.unit, n: 40, asOf: STORED });
    }
    return { ...s, metrics, survivability: { ...s.survivability, asOf: STORED } };
  })
};
const scale = data.scales.scales.archon.tiers;
const iconOf = s => `${s.class.replace(/\s+/g, "")}-${s.spec.replace(/\s+/g, "")}`;
const archonPages = data.sources.find(s => s.id === "archon").pages;
const letterPages = archonPages.filter(p => !p.label);
const mythicPages = archonPages.filter(p => /^Mythic rankings/.test(p.label ?? ""));
const lanePages = [...letterPages, ...mythicPages];
const roleSpecs = role => data.specs.filter(s => s.role === role);
const roleCount = role => roleSpecs(role).length;
const stored = (spec, bracket, name) => spec.metrics?.find(m => m.source === "archon" && m.bracket === bracket && m.name === name);
const isMythic = p => p.url.includes("/raid/mythic/");
const familyOf = p => (p.bracket === "mplus" ? "M+ score (95th pct)" : `95th pct ${p.role === "Healer" ? "HPS" : "DPS"} (${isMythic(p) ? "Mythic" : "Heroic"})`);
const LAST_UPDATED = "2026-10-27T12:00:00Z", AS_OF = "2026-10-27";
const liveDates = live.specs.flatMap(s => [...(s.metrics ?? []).filter(m => m.source === "archon").map(m => m.asOf), s.survivability?.asOf]);
const LIVE_AS_OF = [AS_OF, ...liveDates.filter(Boolean)].sort().at(-1);
const FIRE = data.specs.find(s => s.class === "Mage" && s.spec === "Fire");
const withoutRow = (spec, bracket, name) => ({ ...data, specs: data.specs.map(s => (s !== spec ? s
  : { ...s, metrics: s.metrics.filter(m => !(m.source === "archon" && m.bracket === bracket && m.name === name)) })) });

// Tier lists as the page's __NEXT_DATA__ carries them (entries nested one level).
const listBy = (metric, role, letterOf) => ({
  metric,
  tiers: scale.map(tier => ({ tier, entries: [roleSpecs(role).filter(s => letterOf(s) === tier).map(s => ({ icon: iconOf(s) }))] }))
});
const storedList = (metric, bracket, role) => listBy(metric, role, s => s.ratings?.[bracket]?.archon);
const storedSurvivability = role => listBy("survivability", role, s => s.survivability?.tier);
const flatList = (metric, role, tier) => ({ metric, tiers: [{ tier, entries: [roleSpecs(role).map(s => ({ icon: iconOf(s) }))] }] });
const linesOf = list => list.tiers.map(t => `${t.tier}: ${t.entries.flat().map(e => e.icon).join(" ")}`);
// Raid pages list popularity first (measured 2026-10-27); M+ pages carry only score. The
// Mythic pages' throughput list puts every spec on "C", so a letter read off a labeled
// page would show up as moves.
const listsFor = p => (p.bracket === "mplus" ? [storedList("score", "mplus", p.role)]
  : isMythic(p) ? [flatList("popularity", p.role, "S"), flatList("throughput", p.role, "C"), storedSurvivability(p.role)]
    : [flatList("popularity", p.role, "S"), storedList("throughput", "raid", p.role), flatList("survivability", p.role, "A")]);

/* specRankingsSection.table.data as a page carries it: dps/hps as floats, popularity as a
   fraction (a page's rows sum to 1), parses as an integer. Values are the stored row
   × grow (+0.37, so rounding shows) and parses the stored n + more; grow 1 and more 0
   reproduce the stored rows exactly. Heroic pages carry an even popularity split, unlike
   the stored (Mythic) shares, so a Heroic merge would be visible. */
function tableRows(p, { grow = 1.1, more = 100 } = {}) {
  const specs = roleSpecs(p.role);
  const exact = grow === 1 && more === 0;
  const heroic = p.bracket === "raid" && !isMythic(p);
  const shares = specs.map(s => (heroic ? 1 : stored(s, p.bracket, "Popularity")?.value ?? 1));
  const total = shares.reduce((a, b) => a + b, 0);
  return specs.map((s, i) => {
    const was = stored(s, p.bracket, familyOf(p));
    const value = (was?.value ?? 150000) * grow + (exact ? 0 : 0.37);
    const row = { item: `<ActorIcon type='${iconOf(s)}'>${s.spec} ${s.class}</ActorIcon>`, itemPath: `/wow/builds/${iconOf(s)}`,
      popularity: exact ? shares[i] / 100 : shares[i] / total, parses: (was?.n ?? 40) + more };
    if (p.bracket === "mplus") Object.assign(row, { maxKey: 18, dps: 987654.3, score: Math.round(value) });
    else if (p.role === "Healer") Object.assign(row, { hps: value, dps: value / 4, survivability: 61.5 });
    else Object.assign(row, { dps: value, survivability: 87.25 });
    return row;
  });
}

// Runs the in-page snippet against a fake page, the way the browser tool evaluates it.
function runSnippet(url, { tierLists = [], rows = [], lastUpdated = LAST_UPDATED, nextData = true, bodyText = "All Bosses · Season 2" } = {}) {
  const { origin, pathname } = new URL(url);
  const page = { lastUpdated, specTierListSection: { tierLists }, specRankingsSection: { table: { columns: [], data: rows, sorting: {}, footer: {} } } };
  const document = {
    title: "Midnight Rankings and Tier List | Archon (WoW - Midnight)",
    body: { innerText: bodyText },
    getElementById: id => (id === "__NEXT_DATA__" && nextData ? { textContent: JSON.stringify({ props: { pageProps: { page } } }) } : null)
  };
  return new Function("document", "location", `return ${SNIPPET}`)(document, { origin, pathname });
}
const pageFor = (p, opts = {}) => runSnippet(p.url, { tierLists: listsFor(p), rows: tableRows(p, opts), lastUpdated: opts.lastUpdated ?? LAST_UPDATED });
const fullCapture = (opts = {}) => ({ capturedAt: "2026-10-27T16:00:00Z", transport: "test", pages: lanePages.map(p => pageFor(p, opts)) });
const rehash = page => ({ ...page, hash: fnv1a(captureText(page)) });
const withPage = (capture, i, page) => ({ ...capture, pages: capture.pages.map((p, j) => (j === i ? page : p)) });
const indexOf = (bracket, role, labeled = false) => lanePages.findIndex(p => p.bracket === bracket && p.role === role && !!p.label === labeled);
const check = (capture, d = data) => checkArchonCapture(capture, d, { config });
const seriesOf = (result, label) => result.series.find(s => s.label === label);
const problemsOf = (result, label) => seriesOf(result, label).problems.join("\n");
const moveIcon = (tiers, icon, to) => tiers.map(line => {
  const [tier, rest = ""] = line.split(": ");
  const icons = rest.split(" ").filter(x => x && x !== icon);
  if (tier === to) icons.push(icon);
  return `${tier}: ${icons.join(" ")}`;
});
const NUMERIC = ["raid 95th pct DPS (Mythic)", "raid 95th pct HPS (Mythic)", "raid 95th pct DPS (Heroic)", "raid 95th pct HPS (Heroic)",
  "mplus M+ score (95th pct)", "raid Popularity", "mplus Popularity"];

test("the registry gives the lane six letter pages and three Mythic pages, the Mythic DPS url registered twice", () => {
  assert.deepEqual(letterPages.map(p => `${p.bracket} ${p.role}`).sort(),
    ["mplus DPS", "mplus Healer", "mplus Tank", "raid DPS", "raid Healer", "raid Tank"]);
  assert.deepEqual(mythicPages.map(p => `${p.bracket} ${p.role}`).sort(), ["raid DPS", "raid Healer", "raid Tank"]);
  assert.ok(mythicPages.every(isMythic) && letterPages.every(p => !isMythic(p)));
  const dps = mythicPages.find(p => p.role === "DPS");
  assert.deepEqual(archonPages.filter(p => p.url === dps.url).map(p => p.label.split(" ")[0]).sort(), ["Mythic", "Survivability"]);
  assert.ok(archonPages.some(p => p.label?.startsWith("Per-boss")) && archonPages.some(p => p.label?.startsWith("Per-dungeon")));
  // Every family the lane writes is the one its run-manifest requirement probes.
  for (const series of ARCHON_SERIES) {
    const req = config.requirements.find(r => r.key === series.key);
    assert.ok(req, series.key);
    assert.match(series.name, new RegExp(req.date.namePattern), series.key);
  }
});

test("the snippet stays one expression with no template interpolation", async () => {
  const source = await readFile(path.join(ROOT, "src", "archon-capture.mjs"), "utf8");
  const start = source.indexOf("export const SNIPPET = `") + "export const SNIPPET = `".length;
  const body = source.slice(start, source.indexOf("})()`;", start) + 4);
  assert.ok(body.startsWith("(() => {") && body.endsWith("})()"));
  assert.equal(body.includes("${"), false);
  assert.ok(SNIPPET.startsWith("(() => {") && SNIPPET.endsWith("})()"));
});

test("the snippet reads the throughput list on a raid page although popularity comes first, and hashes what it read", () => {
  const p = lanePages[indexOf("raid", "DPS")];
  const lists = listsFor(p);
  const out = pageFor(p);
  assert.equal(out.url, p.url);
  assert.equal(out.metric, "throughput");
  assert.deepEqual(out.metrics, ["popularity", "throughput", "survivability"]);
  assert.deepEqual(out.tiers, linesOf(lists[1]));
  assert.deepEqual(out.survivability, linesOf(lists[2]));
  assert.equal(out.column, "dps");
  assert.equal(out.numbers.length, roleCount("DPS"));
  assert.equal(out.lastUpdated, LAST_UPDATED);
  assert.equal(out.hash, fnv1a(captureText(out)));
  assert.match(out.agreement.popularity, new RegExp(`^\\d+/${roleCount("DPS")}$`));
  assert.equal(out.season, "Season 2");
  assert.match(out.title, /Archon/);
});

test("number lines keep stored precision: whole numbers, popularity × 100 at 0.1, parses as read", () => {
  const p = mythicPages.find(x => x.role === "Healer");
  const [a, b, c] = roleSpecs("Healer");
  const item = s => `<ActorIcon type='${iconOf(s)}'>${s.spec} ${s.class}</ActorIcon>`;
  const out = runSnippet(p.url, { tierLists: listsFor(p), rows: [
    { item: item(a), hps: 175006.94183143, dps: 51234.5, survivability: 61.5, popularity: 0.12149, parses: 316 },
    { item: item(b), hps: 289917.5, dps: 1, survivability: 12, popularity: 0.00049, parses: 54 },
    { item: `<span>${c.spec}</span>`, hps: 100, popularity: 1, parses: 3 },
    { item: item(c), dps: 5, popularity: 0.5, parses: 2.5 }
  ] });
  assert.equal(out.column, "hps", "a healer page reads hps, never its dps column");
  assert.deepEqual(out.numbers, [`${iconOf(a)} 175007 12.1 316`, `${iconOf(b)} 289918 0.0 54`, "? 100 100.0 3", `${iconOf(c)} ? 50.0 2.5`]);
  // The page's numeric survivability column is a percentage, never the tier.
  assert.deepEqual(out.survivability, linesOf(storedSurvivability("Healer")));
  assert.equal(out.hash, fnv1a(captureText(out)));
  const result = check({ pages: [out] });
  assert.match(problemsOf(result, "raid 95th pct HPS (Mythic)"), /a rankings row without an ActorIcon[\s\S]*hps "\?" is not a positive whole number/);
  assert.match(problemsOf(result, "raid Popularity"), /parses "2\.5" is not a positive whole number/);
});

test("the snippet stops the lane on a page without __NEXT_DATA__ (a verification page)", () => {
  assert.throws(() => runSnippet(lanePages[0].url, { nextData: false }), /no __NEXT_DATA__.*stop the lane/);
});

test("a raid page without a throughput list gives no letters, never another list, and its numbers still read", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "Tank");
  const page = runSnippet(lanePages[i].url, { tierLists: [flatList("popularity", "Tank", "S"), flatList("survivability", "Tank", "A")], rows: tableRows(lanePages[i]) });
  assert.equal(page.metric, null);
  assert.deepEqual(page.tiers, []);
  assert.equal(page.numbers.length, roleCount("Tank"));
  const result = check(withPage(capture, i, page));
  assert.equal(seriesOf(result, "letters raid Tank").status, "refused");
  assert.match(problemsOf(result, "letters raid Tank"), /no "throughput" tier list \(lists: popularity, survivability\); letters refused, never fall back/);
  assert.equal(seriesOf(result, "raid 95th pct DPS (Heroic)").status, "written");
  assert.equal(result.ratings.length, data.specs.length * 2 - roleCount("Tank"));
});

test("the snippet reads the score list and the score column on an M+ page", () => {
  const p = lanePages[indexOf("mplus", "Tank")];
  const out = runSnippet(p.url, { tierLists: listsFor(p), rows: tableRows(p), bodyText: "" });
  assert.equal(out.metric, "score");
  assert.deepEqual(out.metrics, ["score"]);
  assert.deepEqual(out.agreement, {});
  assert.equal(out.season, null, "no season cue on the page is reported, not guessed");
  assert.equal(out.column, "score");
  assert.equal(out.survivability, null);
  const tank = roleSpecs("Tank")[0];
  const score = Math.round(stored(tank, "mplus", "M+ score (95th pct)").value * 1.1 + 0.37);
  assert.match(out.numbers[0], new RegExp(`^${iconOf(tank)} ${score} \\d+\\.\\d ${stored(tank, "mplus", "M+ score (95th pct)").n + 100}$`));
});

test("a full capture writes every series: letters, Mythic and Heroic numbers, popularity and survivability", () => {
  const result = check(fullCapture());
  assert.equal(result.refused, false);
  assert.deepEqual(result.series.filter(s => s.status !== "written").map(s => s.label), []);
  assert.equal(result.ratings.length, data.specs.length * 2);
  assert.deepEqual(result.moves, []);
  const rows = (bracket, name) => result.metrics.metrics.filter(m => m.bracket === bracket && m.name === name);
  for (const series of ARCHON_SERIES) {
    const want = series.roles.reduce((n, role) => n + roleCount(role), 0);
    assert.equal(rows(series.bracket, series.name).length, want, `${series.bracket} ${series.name}`);
    assert.ok(rows(series.bracket, series.name).every(m => m.unit === series.unit && m.source === "archon" && m.asOf === AS_OF));
  }
  // n = parses; numbers rounded to whole; asOf = lastUpdated's date.
  for (const spec of [data.specs.find(s => s.class === "Mage" && s.spec === "Arcane"), roleSpecs("Tank")[0]]) {
    const was = stored(spec, "raid", "95th pct DPS (Mythic)");
    assert.deepEqual(rows("raid", "95th pct DPS (Mythic)").find(m => m.spec === spec.spec && m.class === spec.class),
      { class: spec.class, spec: spec.spec, bracket: "raid", source: "archon", name: "95th pct DPS (Mythic)", value: Math.round(was.value * 1.1 + 0.37), unit: "DPS", n: was.n + 100, asOf: AS_OF });
  }
  // Survivability comes from the Mythic pages' lists, not the Heroic pages' (all "A" here).
  assert.equal(result.metrics.survivability.length, data.specs.length);
  for (const row of result.metrics.survivability) {
    assert.equal(row.tier, data.specs.find(s => s.class === row.class && s.spec === row.spec).survivability.tier);
    assert.equal(row.asOf, AS_OF);
  }
  assert.deepEqual(result.stamps.map(e => e.label ?? `${e.bracket} ${e.role}`).map(l => l.split(" (")[0]).sort(), [
    "Mythic rankings — DPS", "Mythic rankings — Healer", "Mythic rankings — Tank", "Survivability tiers",
    "mplus DPS", "mplus Healer", "mplus Tank", "raid DPS", "raid Healer", "raid Tank"]);
  const lines = reportLines(result);
  assert.ok(lines.includes("✓ raid 95th pct HPS (Mythic) [archon-hps]: " + seriesOf(result, "raid 95th pct HPS (Mythic)").summary));
});

test("the labeled Mythic pages never produce letters", () => {
  const capture = fullCapture();
  const result = check({ ...capture, pages: capture.pages.filter((_, i) => lanePages[i].label) });
  assert.deepEqual(result.ratings, []);
  assert.deepEqual(result.moves, []);
  assert.ok(result.series.filter(s => s.kind === "letters").every(s => s.status === "absent"));
  assert.equal(seriesOf(result, "raid 95th pct DPS (Mythic)").status, "written");
  assert.equal(seriesOf(result, "raid Popularity").status, "written");
  assert.equal(seriesOf(result, "mplus Popularity").status, "absent");
  assert.ok(result.stamps.length && result.stamps.every(e => e.label));
});

test("Heroic popularity is never merged: raid Popularity is the Mythic cut", () => {
  const capture = fullCapture();
  const result = check(capture);
  const token = new Map(capture.pages.filter((_, i) => lanePages[i].label)
    .flatMap(page => page.numbers.map(line => line.split(" "))).map(([icon, , pop]) => [icon, Number(pop)]));
  const heroicToken = new Map(capture.pages.filter((_, i) => !lanePages[i].label && lanePages[i].bracket === "raid")
    .flatMap(page => page.numbers.map(line => line.split(" "))).map(([icon, , pop]) => [icon, Number(pop)]));
  const raidPopularity = result.metrics.metrics.filter(m => m.bracket === "raid" && m.name === "Popularity");
  assert.equal(raidPopularity.length, data.specs.length);
  assert.ok(raidPopularity.every(m => m.value === token.get(iconOf(m))));
  assert.ok(raidPopularity.some(m => m.value !== heroicToken.get(iconOf(m))), "the fixture's Heroic shares differ");
  const heroic = check({ ...capture, pages: capture.pages.filter((_, i) => !lanePages[i].label && lanePages[i].bracket === "raid") });
  assert.equal(seriesOf(heroic, "raid Popularity").status, "absent");
  assert.equal(heroic.metrics.metrics.some(m => m.name === "Popularity"), false);
  assert.deepEqual(heroic.metrics.survivability, []);
});

test("the healer page refuses dps as HPS", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "Healer", true);
  const numbers = tableRows(lanePages[i]).map(r => `${/type='([^']+)'/.exec(r.item)[1]} ${Math.round(r.dps)} ${(Math.round(r.popularity * 1000) / 10).toFixed(1)} ${r.parses}`);
  const result = check(withPage(capture, i, rehash({ ...capture.pages[i], column: "dps", numbers })));
  assert.equal(seriesOf(result, "raid 95th pct HPS (Mythic)").status, "refused");
  assert.match(problemsOf(result, "raid 95th pct HPS (Mythic)"), /recorded the "dps" column; Archon raid Healer numbers come from "hps"/);
  assert.equal(result.metrics.metrics.some(m => m.name === "95th pct HPS (Mythic)"), false);
  for (const label of ["raid 95th pct DPS (Mythic)", "raid Popularity", "survivability (Mythic raid)"]) assert.equal(seriesOf(result, label).status, "written", label);
  assert.equal(result.stamps.some(e => e.label?.startsWith("Mythic rankings") && e.role === "Healer"), false);
  assert.equal(result.refused, true);
});

test("an empty survivability list writes nothing and says so; a missing one is refused", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "DPS", true);
  const p = lanePages[i];
  const emptied = { metric: "survivability", tiers: scale.map(tier => ({ tier, entries: [[]] })) };
  const page = runSnippet(p.url, { tierLists: [flatList("popularity", "DPS", "S"), flatList("throughput", "DPS", "C"), emptied], rows: tableRows(p) });
  assert.deepEqual(page.survivability, scale.map(t => `${t}: `));
  const result = check(withPage(capture, i, page));
  const surv = seriesOf(result, "survivability (Mythic raid)");
  assert.equal(surv.status, "empty");
  assert.match(surv.summary, /published the survivability list empty on the raid DPS Mythic page .*nothing written, the stored tiers stand/);
  assert.deepEqual(result.metrics.survivability, []);
  assert.equal(result.refused, false);
  assert.equal(result.stamps.some(e => e.label?.startsWith("Survivability")), false);
  assert.ok(result.stamps.some(e => e.label?.startsWith("Mythic rankings") && e.role === "DPS"));
  const none = runSnippet(p.url, { tierLists: [flatList("throughput", "DPS", "C")], rows: tableRows(p) });
  assert.equal(none.survivability, null);
  const missing = check(withPage(capture, i, none));
  assert.equal(seriesOf(missing, "survivability (Mythic raid)").status, "refused");
  assert.match(problemsOf(missing, "survivability (Mythic raid)"), /no survivability tier list on the page/);
});

test("survivability tiers must be on Archon's scale and cover every spec", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "Tank", true);
  const page = capture.pages[i];
  const tank = iconOf(roleSpecs("Tank")[0]);
  const offScale = check(withPage(capture, i, rehash({ ...page, survivability: [...page.survivability, `D: ${tank}`] })));
  assert.match(problemsOf(offScale, "survivability (Mythic raid)"), /"D" is not on Archon's scale[\s\S]*listed twice/);
  const gap = check(withPage(capture, i, rehash({ ...page, survivability: page.survivability.map(l => l.replace(` ${tank}`, "")) })));
  assert.match(problemsOf(gap, "survivability (Mythic raid)"), new RegExp(`missing ${tank}`));
  assert.deepEqual(gap.metrics.survivability, []);
});

test("lines that no longer hash are refused as mistyped, and only that page's series fall", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "Healer", true);
  const page = capture.pages[i];
  const typo = { ...page, numbers: page.numbers.map((line, j) => (j === 0 ? line.replace(/ (\d)/, " 9$1") : line)) };
  const result = check(withPage(capture, i, typo));
  assert.match(result.pages[i].problems.join(), /do not hash to the snippet's [0-9a-f]{8}; the capture was mistyped/);
  for (const label of ["raid 95th pct HPS (Mythic)", "raid Popularity", "survivability (Mythic raid)"]) assert.equal(seriesOf(result, label).status, "refused", label);
  for (const label of ["raid 95th pct DPS (Mythic)", "raid 95th pct HPS (Heroic)", "letters raid Healer"]) assert.equal(seriesOf(result, label).status, "written", label);
  // A reading pasted under another page's url, or letters edited by hand, fail the same way.
  const swapped = check(withPage(capture, indexOf("raid", "Tank", true), { ...capture.pages[indexOf("raid", "Tank", true)], url: mythicPages.find(p => p.role === "DPS").url }));
  assert.match(swapped.pages[indexOf("raid", "Tank", true)].problems.join(), /captured 2 times|do not hash/);
  const j = indexOf("raid", "DPS");
  const spec = roleSpecs("DPS")[0];
  const to = scale.find(t => t !== spec.ratings.raid.archon);
  const letters = check(withPage(capture, j, { ...capture.pages[j], tiers: moveIcon(capture.pages[j].tiers, iconOf(spec), to) }));
  assert.equal(seriesOf(letters, "letters raid DPS").status, "refused");
  assert.match(problemsOf(letters, "letters raid DPS"), /do not hash to the snippet's .*mistyped/);
});

test("the Mythic DPS url, registered twice, is read once and feeds both of its entries", () => {
  const capture = fullCapture();
  const url = mythicPages.find(p => p.role === "DPS").url;
  const result = check(capture);
  assert.equal(result.pages.filter(r => r.url === url).length, 1);
  assert.equal(result.pages.find(r => r.url === url).labels.length, 2);
  assert.deepEqual(result.stamps.filter(e => e.url === url).map(e => e.label.split(" ")[0]).sort(), ["Mythic", "Survivability"]);
  const i = indexOf("raid", "DPS", true);
  const twice = check({ ...capture, pages: [...capture.pages, capture.pages[i]] });
  assert.match(twice.pages[i].problems.join(), /captured 2 times; keep one reading per page/);
  for (const label of ["raid 95th pct DPS (Mythic)", "raid Popularity", "survivability (Mythic raid)"]) assert.equal(seriesOf(twice, label).status, "refused", label);
});

test("popularity must be a plausible percentage whose role group sums to 100 within rows × 0.05", () => {
  assert.equal(Math.round(popularityTolerance(27) * 100) / 100, 1.35);
  assert.equal(Math.round(popularityTolerance(6) * 100) / 100, 0.3);
  const capture = fullCapture();
  const i = indexOf("mplus", "DPS");
  const page = capture.pages[i];
  const edit = f => check(withPage(capture, i, rehash({ ...page, numbers: page.numbers.map(f) })));
  const field = (line, k, v) => line.split(" ").map((x, j) => (j === k ? v : x)).join(" ");
  // An honest page: the fixture's rounded shares land within the bound.
  assert.equal(seriesOf(check(capture), "mplus Popularity").status, "written");
  // Fractions left unscaled sum to about 1.
  const unscaled = edit(line => field(line, 2, (Number(line.split(" ")[2]) / 100).toFixed(1)));
  const dps = roleCount("DPS");
  assert.match(problemsOf(unscaled, "mplus Popularity"), new RegExp(`popularity sums to \\d(\\.\\d+)?, not 100 within ${String(Math.round(popularityTolerance(dps) * 100) / 100).replace(".", "\\.")} \\(${dps} rows, each rounded to 0\\.1\\)`));
  // One share two points high is outside what rounding can explain.
  const high = edit((line, j) => (j === 0 ? field(line, 2, (Number(line.split(" ")[2]) + 2).toFixed(1)) : line));
  assert.match(problemsOf(high, "mplus Popularity"), /popularity sums to 10[12](\.\d+)?, not 100/);
  // Off the scale, or a number column read as popularity.
  assert.match(problemsOf(edit((line, j) => (j === 0 ? field(line, 2, "120.5") : line)), "mplus Popularity"), /popularity "120\.5" is not a percentage/);
  const echoed = edit((line, j) => (j === 0 ? field(field(line, 1, "42"), 2, "42.0") : line));
  assert.match(problemsOf(echoed, "mplus Popularity"), /popularity 42 equals its score value: a number column read as popularity/);
  // Popularity problems leave the page's score series alone, and zero parses void both.
  assert.equal(seriesOf(high, "mplus M+ score (95th pct)").status, "written");
  const zero = edit((line, j) => (j === 0 ? field(line, 3, "0") : line));
  assert.match(problemsOf(zero, "mplus M+ score (95th pct)"), /parses "0" is not a positive whole number/);
  assert.equal(seriesOf(zero, "mplus Popularity").status, "refused");
});

test("asOf is the date part of lastUpdated; a missing or backwards date refuses the numbers", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "Tank");
  const p = lanePages[i];
  const at = lastUpdated => check(withPage(capture, i, runSnippet(p.url, { tierLists: listsFor(p), rows: tableRows(p), lastUpdated })));
  const late = at("2026-10-26T23:59:59Z");
  const heroicDps = late.metrics.metrics.filter(m => m.name === "95th pct DPS (Heroic)");
  assert.ok(heroicDps.filter(m => roleSpecs("Tank").some(s => s.spec === m.spec && s.class === m.class)).every(m => m.asOf === "2026-10-26"));
  assert.ok(heroicDps.filter(m => roleSpecs("DPS").some(s => s.spec === m.spec && s.class === m.class)).every(m => m.asOf === AS_OF));
  assert.match(seriesOf(late, "raid 95th pct DPS (Heroic)").notes.join(), /rows carry their own page's date: DPS 2026-10-27, Tank 2026-10-26/);
  const none = at(null);
  assert.equal(seriesOf(none, "raid 95th pct DPS (Heroic)").status, "refused");
  assert.match(problemsOf(none, "raid 95th pct DPS (Heroic)"), /lastUpdated null is not an ISO date, so its rows have no asOf/);
  assert.equal(seriesOf(none, "letters raid Tank").status, "written", "letters carry no date of their own");
  const old = at("2026-08-20T12:00:00Z");
  assert.match(problemsOf(old, "raid 95th pct DPS (Heroic)"), new RegExp(`lastUpdated 2026-08-20 is older than the stored rows' ${STORED} \\(${roleCount("Tank")} rows\\): a backwards date is refused`));
});

test("a spec missing upstream refuses its series with a clear message; the other series still land", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "DPS", true);
  const p = lanePages[i];
  const page = runSnippet(p.url, { tierLists: listsFor(p), rows: tableRows(p).filter(r => !r.item.includes("'Mage-Fire'")) });
  const result = check(withPage(capture, i, page));
  for (const label of ["raid 95th pct DPS (Mythic)", "raid Popularity"]) {
    assert.equal(seriesOf(result, label).status, "refused", label);
    assert.match(problemsOf(result, label), new RegExp(`Mage-Fire missing upstream \\(${roleCount("DPS") - 1} of ${roleCount("DPS")} DPS specs\\)\\. A series is written whole or not at all and apply-metrics has no archon retire path, so the stored rows stand`));
  }
  assert.equal(result.metrics.metrics.some(m => m.name === "95th pct DPS (Mythic)" || (m.bracket === "raid" && m.name === "Popularity")), false);
  for (const label of ["survivability (Mythic raid)", "raid 95th pct DPS (Heroic)", "raid 95th pct HPS (Mythic)"]) assert.equal(seriesOf(result, label).status, "written", label);
  assert.deepEqual(result.stamps.filter(e => e.label?.startsWith("Mythic rankings")).map(e => e.role), ["Healer"]);
  // A role page missing from the capture is the same gap.
  const noTank = check({ ...capture, pages: capture.pages.filter((_, j) => j !== indexOf("raid", "Tank", true)) });
  assert.match(problemsOf(noTank, "raid 95th pct DPS (Mythic)"), /no Tank page in this capture \(a series is written whole or not at all\)/);
  assert.equal(seriesOf(noTank, "raid 95th pct HPS (Mythic)").status, "written");
});

test("a series whose values and parse counts all equal the stored rows is unchanged and not re-dated", () => {
  const capture = fullCapture({ grow: 1, more: 0 });
  const result = check(capture);
  for (const label of NUMERIC) {
    const s = seriesOf(result, label);
    assert.equal(s.status, "unchanged", label);
    assert.equal(s.summary, `unchanged since ${STORED}: every value and parse count equals the stored row, so Archon has not re-cut it (lastUpdated ${AS_OF} is a page date, not a data date); nothing written`);
  }
  // Nothing on the Mythic pages moved, so survivability is not re-dated either; only the
  // letter pages, whose letters are rewritten on every read, get a stamp.
  const surv = seriesOf(result, "survivability (Mythic raid)");
  assert.equal(surv.status, "unchanged");
  assert.match(surv.summary, /no Mythic page shows new parses/);
  assert.equal(result.refused, false);
  assert.deepEqual(result.metrics, { metrics: [], survivability: [] });
  assert.ok(result.stamps.length === letterPages.length && result.stamps.every(e => !e.label));
});

test("a spec with no stored row arrives as new, and its arrival re-cuts the Mythic page", () => {
  const result = check(fullCapture({ grow: 1, more: 0 }), withoutRow(FIRE, "raid", "95th pct DPS (Mythic)"));
  const s = seriesOf(result, "raid 95th pct DPS (Mythic)");
  assert.equal(s.status, "written");
  assert.equal(s.summary, `${roleCount("DPS") + roleCount("Tank")} rows asOf ${AS_OF} (stored ${STORED}): 0 changed; new: Fire Mage; parses changed on 0`);
  assert.equal(result.metrics.metrics.find(m => m.class === "Mage" && m.spec === "Fire" && m.name === "95th pct DPS (Mythic)").value,
    stored(FIRE, "raid", "95th pct DPS (Mythic)").value);
  assert.equal(seriesOf(result, "survivability (Mythic raid)").status, "written");
  // The family spans the DPS and Tank pages and is written whole, so both are stamped.
  assert.deepEqual(result.stamps.filter(e => e.label).map(e => e.label.split(" (")[0]).sort(),
    ["Mythic rankings — DPS", "Mythic rankings — Tank", "Survivability tiers"]);
});

test("value moves are reported against the stored rows, with what the value-move gate will flag", () => {
  const quiet = check(fullCapture());
  const mythicDps = seriesOf(quiet, "raid 95th pct DPS (Mythic)");
  const dpsRows = roleCount("DPS") + roleCount("Tank");
  assert.match(mythicDps.summary, new RegExp(`^${dpsRows} rows asOf ${AS_OF} \\(stored ${STORED}\\): ${dpsRows} changed, median \\+10\\.0%, largest \\+10\\.0% \\(.+ -> \\d+\\); parses changed on ${dpsRows}$`));
  assert.match(seriesOf(quiet, "raid Popularity").summary,
    new RegExp(`^${data.specs.length} rows asOf ${AS_OF} \\(stored ${STORED}\\): \\d+ changed(, largest [\\d.]+ points \\(.+\\))?; group sums DPS [\\d.]+, Healer [\\d.]+, Tank [\\d.]+; parses changed on ${data.specs.length}$`));
  for (const label of NUMERIC) assert.deepEqual(seriesOf(quiet, label).gate, [], label);
  const loud = check(fullCapture({ grow: 2 }));
  const s = seriesOf(loud, "raid 95th pct DPS (Mythic)");
  assert.equal(s.status, "written", "the checker reports; the gate and the owner decide");
  assert.ok(s.gate.some(g => g.startsWith('family median move: "archon|raid|95th pct DPS (Mythic)" median went')));
  const arcane = stored(data.specs.find(x => x.class === "Mage" && x.spec === "Arcane"), "raid", "95th pct DPS (Mythic)").value;
  assert.ok(s.gate.some(g => g.startsWith(`value move: "Mage|Arcane|archon|raid|95th pct DPS (Mythic)" went ${arcane} → ${Math.round(arcane * 2 + 0.37)}`)));
  assert.ok(reportLines(loud).some(line => line.startsWith("    check-refresh --manifest will flag: family median move")));
});

test("moved letters are listed, two-step moves marked", () => {
  const capture = fullCapture();
  const i = indexOf("mplus", "Tank");
  const spec = roleSpecs("Tank")[0];
  const was = spec.ratings.mplus.archon;
  const to = scale[(scale.indexOf(was) + 2) % scale.length];
  const result = check(withPage(capture, i, rehash({ ...capture.pages[i], tiers: moveIcon(capture.pages[i].tiers, iconOf(spec), to) })));
  assert.deepEqual(result.moves, [`mplus ${spec.spec} ${spec.class}: ${was} -> ${to} (two-step)`]);
});

test("letters from any list but the bracket's are refused (popularity comes first on raid pages)", () => {
  const capture = fullCapture();
  const raid = indexOf("raid", "DPS"), mplus = indexOf("mplus", "DPS");
  const r1 = check(withPage(capture, raid, rehash({ ...capture.pages[raid], metric: "popularity" })));
  assert.match(problemsOf(r1, "letters raid DPS"), /captured the "popularity" list; Archon raid letters come from "throughput" only/);
  assert.equal(seriesOf(r1, "raid 95th pct DPS (Heroic)").status, "written");
  const r2 = check(withPage(capture, mplus, rehash({ ...capture.pages[mplus], metric: "throughput" })));
  assert.match(problemsOf(r2, "letters mplus DPS"), /Archon mplus letters come from "score" only/);
});

test("off-scale letters, unknown or wrong-role icons, duplicates and missing specs refuse that page's letters only", () => {
  const capture = fullCapture();
  const i = indexOf("raid", "DPS");
  const healer = iconOf(roleSpecs("Healer")[0]);
  const dps = iconOf(roleSpecs("DPS")[0]);
  const cases = [
    [t => [...t, "A+: "], /"A\+" is not on Archon's scale/],
    [t => [...t.slice(0, -1), `${t.at(-1)} Warrior-Gladiator`], /unknown spec token Warrior-Gladiator/],
    [t => [...t.slice(0, -1), `${t.at(-1)} ${healer}`], new RegExp(`${healer} is a Healer spec`)],
    [t => [...t.slice(0, -1), `${t.at(-1)} ${dps}`], new RegExp(`${dps} listed twice`)],
    [t => t.map(line => line.split(" ").filter(x => x !== dps).join(" ")), new RegExp(`missing ${dps}`)]
  ];
  for (const [edit, message] of cases) {
    const result = check(withPage(capture, i, rehash({ ...capture.pages[i], tiers: edit(capture.pages[i].tiers) })));
    assert.equal(seriesOf(result, "letters raid DPS").status, "refused");
    assert.match(problemsOf(result, "letters raid DPS"), message);
    assert.equal(seriesOf(result, "letters raid Healer").status, "written");
    assert.equal(result.ratings.length, data.specs.length * 2 - roleCount("DPS"));
  }
});

test("unregistered, per-boss, per-dungeon and old-snippet pages are refused; an empty capture is an error", () => {
  const capture = fullCapture();
  const at = url => check({ pages: [rehash({ ...capture.pages[0], url })] }).pages[0].problems.join();
  assert.match(at(archonPages.find(p => p.label?.startsWith("Per-boss")).url), /per-boss and per-dungeon pages stay out of the browser lane/);
  assert.match(at(archonPages.find(p => p.label?.startsWith("Per-dungeon")).url), /per-boss and per-dungeon pages stay out of the browser lane/);
  assert.match(at("https://www.archon.gg/wow/tier-list/dps-rankings/raid/normal/all-bosses"), /not a registered Archon page/);
  const { numbers, column, ...old } = capture.pages[0];
  const result = check({ pages: [old] });
  assert.match(result.pages[0].problems.join(), /not the current snippet's output/);
  assert.equal(result.written, false);
  assert.equal(result.refused, true);
  assert.throws(() => check({ pages: [] }), /no pages/);
});

test("the CLI prints the snippet, writes both files, and exits 0, 2 or 1", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "archon-capture-"));
  try {
    const cli = path.join(ROOT, "src", "archon-capture.mjs");
    const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
    const save = async (name, capture) => { const file = path.join(dir, name); await writeFile(file, JSON.stringify(capture)); return file; };
    const rows = path.join(dir, "rows.json"), metrics = path.join(dir, "metrics.json");
    assert.equal(run("--snippet").stdout.trim(), SNIPPET.trim());
    // The CLI reads the live data, so the capture is dated no earlier than it.
    const capture = fullCapture({ lastUpdated: `${LIVE_AS_OF}T12:00:00Z` });
    const bad = run(await save("bad.json", { ...capture, pages: capture.pages.map(p => ({ ...p, hash: "00000000" })) }), rows, metrics);
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /do not hash/);
    await assert.rejects(readFile(rows), { code: "ENOENT" });
    await assert.rejects(readFile(metrics), { code: "ENOENT" });
    const good = await save("good.json", capture);
    assert.equal(run(good, rows).status, 1, "the two-file form would drop the numbers, so it is refused");
    const ok = run(good, rows, metrics);
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(JSON.parse(await readFile(rows, "utf8")).length, data.specs.length * 2);
    const out = JSON.parse(await readFile(metrics, "utf8"));
    assert.deepEqual(Object.keys(out), ["metrics", "survivability"]);
    assert.equal(out.survivability.length, data.specs.length);
    assert.match(ok.stdout, /next: node src\/apply-ratings\.mjs[\s\S]*next: node src\/apply-metrics\.mjs/);
    const i = indexOf("raid", "Healer", true);
    const partial = run(await save("partial.json", withPage(capture, i, { ...capture.pages[i], hash: "00000000" })), rows, metrics);
    assert.equal(partial.status, 2, partial.stderr);
    assert.match(partial.stdout, /✗ raid 95th pct HPS \(Mythic\) \[archon-hps\]: refused/);
    assert.match(partial.stderr, /the files hold only the series marked ✓/);
    const kept = JSON.parse(await readFile(metrics, "utf8"));
    assert.equal(kept.metrics.some(m => m.name === "95th pct HPS (Mythic)" || (m.bracket === "raid" && m.name === "Popularity")), false);
    assert.deepEqual(kept.survivability, []);
    assert.equal(JSON.parse(await readFile(rows, "utf8")).length, data.specs.length * 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the metrics file applies to a copy of the data and freshens every Archon numeric requirement", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "archon-capture-apply-"));
  try {
    await cp(path.join(ROOT, "data"), path.join(root, "data"), { recursive: true });
    const result = check(fullCapture({ lastUpdated: `${LIVE_AS_OF}T12:00:00Z` }), live);
    assert.equal(result.refused, false);
    const input = path.join(root, "metrics.json");
    await writeFile(input, JSON.stringify(result.metrics));
    const applied = await applyMetrics(input, root);
    assert.equal(applied.metricsApplied, result.metrics.metrics.length);
    assert.equal(applied.survivabilityApplied, data.specs.length);
    const after = await loadData(root);
    for (const req of config.requirements.filter(r => ARCHON_SERIES.some(s => s.key === r.key))) {
      assert.equal(probeDate(req, after), LIVE_AS_OF, req.key);
      assert.ok(probeRows(req, after) >= req.rows.min, req.key);
    }
    for (const def of ARCHON_SERIES) {
      assert.ok(after.specs.filter(s => def.roles.includes(s.role)).every(s => stored(s, def.bracket, def.name)?.asOf === LIVE_AS_OF), def.name);
    }
    assert.ok(after.specs.every(s => s.survivability.asOf === LIVE_AS_OF && s.survivability.source === "archon"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
