/* Archon pages read in a real browser (the local run's browser lane, owner decisions
   2026-10-27), checked here before anything reaches apply-ratings or apply-metrics.
   Usage: node src/archon-capture.mjs --snippet
            prints the expression to run in each lane page (Claude in Chrome's
            javascript_tool), one page load at a time
          node src/archon-capture.mjs <capture.json> <ratings-out.json> <metrics-out.json>
            checks a capture and writes the series that pass: letter rows for
            apply-ratings, and { metrics, survivability } for apply-metrics

   The capture file is { capturedAt, transport, pages: [<the snippet's output>, ...] }.
   Exit 0: every series in the capture was written, or is unchanged or empty upstream.
   Exit 2: a page or series was refused; both files were written and hold only the series
   marked ✓. Exit 1: nothing passed (or bad usage); nothing written.

   The page list is the registry (data/sources.json, source "archon"):
   - the six pages WITHOUT a label give letters, plus "95th pct DPS/HPS (Heroic)" on the
     raid pages, or "M+ score (95th pct)" and M+ "Popularity" on the M+ pages;
   - the three labeled "Mythic rankings" pages give "95th pct DPS/HPS (Mythic)", raid
     "Popularity" (the stored raid Popularity is the Mythic cut) and the survivability
     tiers. They never give letters;
   - per-boss and per-dungeon pages stay out of the lane and are refused.
   The Mythic DPS url is registered twice (its "Mythic rankings" and "Survivability tiers"
   entries), so pages are matched to every entry at their url, never to one.

   Letters are chosen by NAME. Archon's raid pages carry three tier lists and the first,
   the page's default view, is POPULARITY: how often a spec is played, not how well it
   does. The tracker's letters are the THROUGHPUT list on raid pages and the SCORE list on
   M+ pages (CLAUDE.md hard rule 3). Measured 2026-10-27 on the Heroic raid pages:
   popularity gave the same letter as throughput for only 15 of 40 specs, so a first-list
   read looks like an upstream rebuild, not like an error. The snippet takes the list by
   name and records none when it is missing; the checker refuses letters from any other
   list and never falls back.

   Numbers come from specRankingsSection.table.data[], one line per row at stored
   precision: "<icon> <number> <popularity> <parses>". The number is the page's column by
   role (dps on DPS and tank pages, hps on healer pages, score on M+), rounded; popularity
   is the page's fraction × 100 at 0.1; parses is each row's n. asOf is the date part of
   the page's lastUpdated (the stored convention since the Heroic lane, 2026-08-25).

   The browser tool's output is copied into the capture by hand, so the snippet returns an
   FNV-1a hash of everything this file reads from it (url, lastUpdated, letter lines,
   number lines, survivability lines); a page that does not hash was mistyped and is
   refused. The title, season cue and list agreement are diagnostics outside the hash.

   Each series is written whole or not at all, and refusing one never blocks another.
   apply-metrics has no archon retire path, so a spec missing upstream refuses its series
   rather than leaving that spec's stored row from an older cut inside a refreshed family. */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData } from "./validate.mjs";
import { checkValueMove } from "./check-refresh.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const EXPECTED_METRIC = { raid: "throughput", mplus: "score" };
// The number a page ranks by: damage on DPS and tank pages, healing on healer pages.
export const NUMBER_COLUMN = {
  raid: { DPS: "dps", Tank: "dps", Healer: "hps" },
  mplus: { DPS: "score", Healer: "score", Tank: "score" }
};
const ROLES = ["DPS", "Healer", "Tank"];

/* The families the lane writes and the run-manifest requirement each one answers. */
export const ARCHON_SERIES = [
  { key: "archon-metrics", bracket: "raid", name: "95th pct DPS (Mythic)", unit: "DPS", roles: ["DPS", "Tank"] },
  { key: "archon-hps", bracket: "raid", name: "95th pct HPS (Mythic)", unit: "HPS", roles: ["Healer"] },
  { key: "archon-heroic-dps", bracket: "raid", name: "95th pct DPS (Heroic)", unit: "DPS", roles: ["DPS", "Tank"] },
  { key: "archon-heroic-hps", bracket: "raid", name: "95th pct HPS (Heroic)", unit: "HPS", roles: ["Healer"] },
  { key: "archon-mplus-score", bracket: "mplus", name: "M+ score (95th pct)", unit: "score", roles: ROLES },
  { key: "archon-popularity", bracket: "raid", name: "Popularity", unit: "%", roles: ROLES },
  { key: "archon-popularity", bracket: "mplus", name: "Popularity", unit: "%", roles: ROLES }
];

/* Each Popularity value is rounded to 0.1, so it is off by at most 0.05, and a page's
   fractions sum to 1. An honest role group therefore misses 100 by at most rows × 0.05
   (1.35 for 27 DPS, 0.35 for 7 healers, 0.3 for 6 tanks): the bound never refuses a real
   page. The failures it exists for sit far outside it: fractions left unscaled sum to
   about 1, a number column read as popularity to six figures, a doubled × 100 to about
   10,000, and a stale extra share (Fire Mage, 2026-08-25) made 101.5. */
export const popularityTolerance = rows => rows * 0.05 + 1e-9;

export function fnv1a(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

/* The text the snippet hashes, rebuilt from its output. The snippet builds the same lines
   in the same order; the tests check both against fnv1a. */
export function captureText(page) {
  const list = v => (Array.isArray(v) ? v : []);
  const survivability = Array.isArray(page?.survivability) ? page.survivability : null;
  return [page?.url, page?.lastUpdated || "", "letters " + (page?.metric || "none"), ...list(page?.tiers),
    "numbers " + page?.column, ...list(page?.numbers),
    survivability ? "survivability" : "survivability none", ...list(survivability)].join("\n");
}

/* One expression, run in the page. It must stay self-contained (no imports, no template
   interpolation) and must hash exactly as captureText + fnv1a above, which the tests check. */
export const SNIPPET = `(() => {
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };
  const nd = document.getElementById("__NEXT_DATA__");
  if (!nd) throw new Error("no __NEXT_DATA__ on " + location.pathname + " (a verification page?): stop the lane, do not retry or wait it out");
  const page = JSON.parse(nd.textContent).props.pageProps.page;
  const url = location.origin + location.pathname, raid = location.pathname.includes("/raid/");
  const lists = (page.specTierListSection && page.specTierListSection.tierLists) || [];
  const entries = t => (t.entries || []).flat();
  const lines = tl => tl.tiers.map(t => t.tier + ": " + entries(t).map(e => e.icon).join(" "));
  const letters = tl => Object.fromEntries(tl.tiers.flatMap(t => entries(t).map(e => [e.icon, t.tier])));
  const chosen = lists.find(tl => tl.metric === (raid ? "throughput" : "score")) || null;
  const surv = lists.find(tl => tl.metric === "survivability") || null;
  const column = raid ? (location.pathname.includes("/healer-rankings/") ? "hps" : "dps") : "score";
  const table = (page.specRankingsSection && page.specRankingsSection.table) || {};
  const num = (v, f) => (typeof v === "number" && isFinite(v) ? f(v) : "?");
  const numbers = (table.data || []).map(r => [(/<ActorIcon\\b[^>]*\\btype\\s*=\\s*["']([A-Za-z0-9-]+)["']/.exec(String(r.item)) || [null, "?"])[1], num(r[column], v => String(Math.round(v))), num(r.popularity, v => (Math.round(v * 1000) / 10).toFixed(1)), num(r.parses, v => String(v))].join(" "));
  const tiers = chosen ? lines(chosen) : [], survivability = surv ? lines(surv) : null;
  const mine = chosen ? letters(chosen) : {}, keys = Object.keys(mine);
  const agreement = Object.fromEntries(lists.filter(tl => chosen && tl !== chosen).map(tl => {
    const other = letters(tl);
    return [tl.metric, keys.filter(k => other[k] === mine[k]).length + "/" + keys.length];
  }));
  const text = (document.body && document.body.innerText) || "";
  const lastUpdated = page.lastUpdated || null, metric = chosen ? chosen.metric : null;
  const hash = fnv([url, lastUpdated || "", "letters " + (metric || "none")].concat(tiers, ["numbers " + column], numbers, [survivability ? "survivability" : "survivability none"], survivability || []).join("\\n"));
  return { url, title: document.title || null, season: (text.match(/Season \\d+/) || [null])[0], lastUpdated, metric, metrics: lists.map(tl => tl.metric), tiers, column, numbers, survivability, hash, agreement };
})()`;

/* Icons are "Class-Spec" in CamelCase (DeathKnight-Frost, DemonHunter-Devourer,
   Hunter-BeastMastery). Resolve from them, never from the display name. */
const iconOf = spec => `${spec.class.replace(/\s+/g, "")}-${spec.spec.replace(/\s+/g, "")}`;
const nameOf = spec => `${spec.spec} ${spec.class}`;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const pathOf = url => { try { return new URL(url).pathname; } catch { return ""; } };
const pathBracket = url => (pathOf(url).includes("/raid/") ? "raid" : pathOf(url).includes("/mythic-plus/") ? "mplus" : null);
const pathRole = url => ({ "dps-rankings": "DPS", "healer-rankings": "Healer", "tank-rankings": "Tank" })[(/\/tier-list\/([a-z-]+)\//.exec(pathOf(url)) ?? [])[1]] ?? null;
const raidDifficulty = url => (/\/raid\/([a-z]+)\//.exec(pathOf(url)) ?? [])[1] ?? null;
const asOfFrom = v => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v) && Number.isFinite(Date.parse(v)) ? v.slice(0, 10) : null);
const pct = x => `${x >= 0 ? "+" : ""}${(x * 100).toFixed(1)}%`;
const MYTHIC_NUMBERS = /^Mythic rankings\b/, SURVIVABILITY = /^Survivability tiers\b/;

export function checkArchonCapture(capture, { specs, sources, scales }, { config = null } = {}) {
  const archon = (sources ?? []).find(s => s.id === "archon");
  if (!archon) throw new Error("data/sources.json has no archon source");
  const order = scales?.scales?.[archon.scale]?.tiers ?? [];
  const scale = new Set(order);
  const byIcon = new Map(specs.map(s => [iconOf(s), s]));
  const roster = role => specs.filter(s => s.role === role);
  const storedRow = (spec, bracket, name) => (spec.metrics ?? []).find(m => m.source === "archon" && m.bracket === bracket && m.name === name);
  const registry = new Map();
  for (const entry of archon.pages ?? []) {
    if (!registry.has(entry.url)) registry.set(entry.url, []);
    registry.get(entry.url).push(entry);
  }
  const captured = Array.isArray(capture?.pages) ? capture.pages : [];
  if (!captured.length) throw new Error("the capture has no pages");
  const times = new Map();
  for (const page of captured) times.set(page?.url, (times.get(page?.url) ?? 0) + 1);

  function readTiers(lines, role) {
    const tiers = new Map(), problems = [];
    for (const line of lines) {
      const m = /^(\S+): ?(.*)$/.exec(line);
      if (!m) { problems.push(`unreadable tier line "${line}"`); continue; }
      const [, tier, rest] = m;
      if (!scale.has(tier)) problems.push(`"${tier}" is not on Archon's scale`);
      for (const icon of rest.split(/\s+/).filter(Boolean)) {
        const spec = byIcon.get(icon);
        if (!spec) { problems.push(`unknown spec token ${icon}`); continue; }
        if (spec.role !== role) { problems.push(`${icon} is a ${spec.role} spec`); continue; }
        if (tiers.has(icon)) { problems.push(`${icon} listed twice`); continue; }
        tiers.set(icon, tier);
      }
    }
    return { tiers, problems, missing: roster(role).map(iconOf).filter(icon => !tiers.has(icon)) };
  }

  // Problems in `shared` void every series the row feeds; `value` and `pop` void one each.
  function readNumbers(page, r) {
    const rows = new Map(), shared = [], value = [], pop = [];
    const want = NUMBER_COLUMN[r.bracket][r.role];
    if (page.column !== want) {
      value.push(`recorded the "${page.column}" column; Archon ${r.bracket} ${r.role} numbers come from "${want}" (dps on DPS and tank pages, hps on healer pages, score on M+)`);
    }
    for (const line of page.numbers) {
      const m = /^(\S+) (\S+) (\S+) (\S+)$/.exec(line);
      if (!m) { shared.push(`unreadable number line "${line}"`); continue; }
      const [, icon, v, p, n] = m;
      const spec = byIcon.get(icon);
      if (!spec) { shared.push(icon === "?" ? `a rankings row without an ActorIcon ("${line}")` : `unknown spec token ${icon}`); continue; }
      if (spec.role !== r.role) { shared.push(`${icon} is a ${spec.role} spec`); continue; }
      if (rows.has(icon)) { shared.push(`${icon} listed twice`); continue; }
      const row = { spec, icon, value: null, pop: null, n: null };
      if (/^[1-9]\d*$/.test(n)) row.n = Number(n); else shared.push(`${icon}: parses "${n}" is not a positive whole number`);
      if (/^[1-9]\d*$/.test(v)) row.value = Number(v); else value.push(`${icon}: ${page.column} "${v}" is not a positive whole number`);
      if (/^\d{1,3}\.\d$/.test(p) && Number(p) <= 100) row.pop = Number(p);
      else pop.push(`${icon}: popularity "${p}" is not a percentage between 0 and 100 at 0.1`);
      rows.set(icon, row);
    }
    return { column: page.column, rows, shared, value, pop, missing: roster(r.role).map(iconOf).filter(icon => !rows.has(icon)) };
  }

  function readPage(page) {
    const url = page?.url;
    const r = { url, bracket: null, role: null, difficulty: null, family: null, labels: [], letters: false,
      title: page?.title ?? null, season: page?.season ?? null, lastUpdated: page?.lastUpdated ?? null,
      asOf: asOfFrom(page?.lastUpdated), agreement: page?.agreement ?? {}, problems: [],
      letterEntry: null, numbersEntry: null, survivabilityEntry: null };
    const refuse = message => { r.problems.push(message); return r; };
    const entries = registry.get(url);
    if (!entries) return refuse("not a registered Archon page");
    r.labels = entries.map(e => e.label ?? null);
    const perPage = entries.find(e => (e.label ?? "").includes("Per-"));
    if (perPage) return refuse(`registered as "${perPage.label}": per-boss and per-dungeon pages stay out of the browser lane`);
    const odd = entries.find(e => e.label && !MYTHIC_NUMBERS.test(e.label) && !SURVIVABILITY.test(e.label));
    if (odd) return refuse(`registered as "${odd.label}", which is not a browser-lane page`);
    const roleEntries = entries.filter(e => ROLES.includes(e.role));
    if (!roleEntries.length) return refuse("no per-role registry entry at this url");
    const { bracket, role } = roleEntries[0];
    if (roleEntries.some(e => e.bracket !== bracket || e.role !== role)) return refuse("its registry entries disagree on bracket or role");
    if (pathBracket(url) !== bracket || pathRole(url) !== role) {
      return refuse(`registered as ${bracket} ${role}, but the path ranks ${pathBracket(url) ?? "?"} ${pathRole(url) ?? "?"}`);
    }
    r.bracket = bracket; r.role = role;
    r.difficulty = bracket === "raid" ? raidDifficulty(url) : null;
    r.family = bracket === "mplus" ? "M+ score (95th pct)"
      : ["heroic", "mythic"].includes(r.difficulty) ? `95th pct ${role === "Healer" ? "HPS" : "DPS"} (${cap(r.difficulty)})` : null;
    r.letterEntry = roleEntries.find(e => !e.label) ?? null;
    r.numbersEntry = roleEntries.find(e => e.label && MYTHIC_NUMBERS.test(e.label)) ?? null;
    r.survivabilityEntry = entries.find(e => e.label && SURVIVABILITY.test(e.label)) ?? null;
    r.letters = r.letterEntry != null;
    const labeled = entries.find(e => e.label);
    if (labeled && r.difficulty !== "mythic") return refuse(`registered as "${labeled.label}", but the path is not a Mythic raid page`);
    if (!r.family) return refuse(`no stored number family for the "${r.difficulty}" difficulty in the path`);
    if (times.get(url) > 1) return refuse(`captured ${times.get(url)} times; keep one reading per page`);
    if (!Array.isArray(page.tiers) || !Array.isArray(page.numbers) || typeof page.column !== "string"
      || !(page.survivability === null || Array.isArray(page.survivability)) || typeof page.hash !== "string") {
      return refuse("not the current snippet's output (no number lines); run `node src/archon-capture.mjs --snippet` in the page again");
    }
    if (fnv1a(captureText(page)) !== page.hash) return refuse(`the captured lines do not hash to the snippet's ${page.hash}; the capture was mistyped`);

    if (r.letters) {
      const want = EXPECTED_METRIC[bracket];
      if (page.metric == null) {
        r.letterProblem = `the page has no "${want}" tier list (lists: ${(page.metrics ?? []).join(", ") || "none"}); letters refused, never fall back to another list`;
      } else if (page.metric !== want) {
        r.letterProblem = `captured the "${page.metric}" list; Archon ${bracket} letters come from "${want}" only (the first list on a raid page is popularity)`;
      } else if (!Array.isArray(page.metrics) || !page.metrics.includes(want)) {
        r.letterProblem = `the page's list of metrics does not include "${want}"`;
      } else {
        r.letterRead = readTiers(page.tiers, role);
      }
    }
    r.table = readNumbers(page, r);
    if (bracket === "raid" && r.difficulty === "mythic") {
      const lines = page.survivability;
      r.survRead = lines === null ? { absent: true }
        : lines.every(line => /^\S+: ?$/.test(line)) ? { empty: true } : readTiers(lines, role);
    }
    return r;
  }

  const pages = captured.map(readPage);
  const where = r => `${r.bracket} ${r.role}${r.difficulty ? " " + cap(r.difficulty) : ""} page`;

  const series = [];
  const add = fields => { series.push({ status: "absent", summary: "not in this capture", problems: [], notes: [], moves: [], gate: [], pages: [], rows: [], ...fields }); return series.at(-1); };
  const letterSeries = new Map();
  for (const entry of archon.pages ?? []) {
    if (entry.label || !ROLES.includes(entry.role)) continue;
    letterSeries.set(entry.url, add({ kind: "letters", key: "archon-tiers", bracket: entry.bracket, roles: [entry.role], label: `letters ${entry.bracket} ${entry.role}`, entry }));
  }
  const numberSeries = new Map(ARCHON_SERIES.map(def => [`${def.bracket}|${def.name}`,
    add({ ...def, kind: def.name === "Popularity" ? "popularity" : "number", label: `${def.bracket} ${def.name}` })]));
  const survSeries = add({ kind: "survivability", key: "archon-survivability", roles: ROLES, label: "survivability (Mythic raid)" });
  for (const r of pages) {
    if (!r.role) continue; // unregistered or unresolved: a page problem only
    if (r.letterEntry) letterSeries.get(r.url)?.pages.push(r);
    if (r.family) numberSeries.get(`${r.bracket}|${r.family}`)?.pages.push(r);
    // Heroic popularity and survivability are read but never merged: the stored raid
    // Popularity and survivability tiers are the Mythic cut.
    if (r.bracket === "mplus" || r.difficulty === "mythic") numberSeries.get(`${r.bracket}|Popularity`).pages.push(r);
    if (r.bracket === "raid" && r.difficulty === "mythic") survSeries.pages.push(r);
  }

  const twoStep = (was, now) => was != null && Math.abs(order.indexOf(was) - order.indexOf(now)) >= 2;
  const recut = r => [...(r.table?.rows.values() ?? [])].some(x => x.n != null && x.n !== storedRow(x.spec, r.bracket, r.family)?.n);

  function letters(s, ok) {
    for (const r of ok) {
      if (r.letterProblem) { s.problems.push(`${where(r)}: ${r.letterProblem}`); continue; }
      const read = r.letterRead;
      for (const p of read.problems) s.problems.push(`${where(r)}: ${p}`);
      if (read.missing.length) s.problems.push(`${where(r)}: missing ${read.missing.join(", ")}`);
      for (const [icon, tier] of read.tiers) {
        const spec = byIcon.get(icon);
        s.rows.push({ class: spec.class, spec: spec.spec, bracket: s.bracket, source: "archon", tier });
        const was = spec.ratings?.[s.bracket]?.archon ?? null;
        if (was !== tier) s.moves.push(`${s.bracket} ${nameOf(spec)}: ${was} -> ${tier}${twoStep(was, tier) ? " (two-step)" : ""}`);
      }
    }
    if (!s.problems.length) { s.status = "written"; s.summary = `${s.rows.length} specs, ${s.moves.length} changed`; }
  }

  function numbers(s, ok) {
    const isPop = s.kind === "popularity";
    for (const r of ok) {
      const t = r.table, at = where(r);
      for (const p of [...t.shared, ...(isPop ? t.pop : t.value)]) s.problems.push(`${at}: ${p}`);
      if (t.missing.length) {
        s.problems.push(`${at}: ${t.missing.join(", ")} missing upstream (${t.rows.size} of ${roster(r.role).length} ${r.role} specs). `
          + `A series is written whole or not at all and apply-metrics has no archon retire path, so the stored rows stand; `
          + `dropping or holding a spec is an owner decision (Fire Mage precedent, 2026-08-25)`);
      }
      if (!r.asOf) s.problems.push(`${at}: lastUpdated ${JSON.stringify(r.lastUpdated)} is not an ISO date, so its rows have no asOf`);
      if (isPop) {
        const values = [...t.rows.values()].map(x => x.pop).filter(v => v != null);
        const sum = values.reduce((a, b) => a + b, 0);
        if (values.length && Math.abs(sum - 100) > popularityTolerance(values.length)) {
          s.problems.push(`${at}: popularity sums to ${Math.round(sum * 100) / 100}, not 100 within ${Math.round(popularityTolerance(values.length) * 100) / 100} (${values.length} rows, each rounded to 0.1)`);
        }
        for (const x of t.rows.values()) {
          if (x.pop == null) continue;
          const mythicDps = storedRow(x.spec, "raid", "95th pct DPS (Mythic)")?.value;
          if (x.pop === x.value || x.pop === mythicDps) {
            s.problems.push(`${at}: ${x.icon} popularity ${x.pop} equals its ${x.pop === x.value ? t.column : "stored 95th pct DPS (Mythic)"} value: a number column read as popularity`);
          }
        }
      }
      for (const x of t.rows.values()) {
        const value = isPop ? x.pop : x.value;
        if (value == null || x.n == null || !r.asOf) continue;
        s.rows.push({ class: x.spec.class, spec: x.spec.spec, bracket: s.bracket, source: "archon", name: s.name, value, unit: s.unit, n: x.n, asOf: r.asOf });
      }
    }
    const pairs = s.rows.map(row => [row, storedRow(byIcon.get(iconOf(row)), s.bracket, s.name)]);
    const backwards = pairs.filter(([row, was]) => was?.asOf && row.asOf < was.asOf);
    if (backwards.length) {
      s.problems.push(`lastUpdated ${[...new Set(backwards.map(([row]) => row.asOf))].join("/")} is older than the stored rows' ${[...new Set(backwards.map(([, was]) => was.asOf))].join("/")} (${backwards.length} rows): a backwards date is refused`);
    }
    if (s.problems.length) return;
    const asOfs = [...new Set(s.rows.map(row => row.asOf))].join("/");
    const storedAsOfs = [...new Set(pairs.map(([, was]) => was?.asOf).filter(Boolean))].join("/") || "none";
    if (pairs.every(([row, was]) => was && was.value === row.value && was.n === row.n)) {
      s.status = "unchanged";
      s.summary = `unchanged since ${storedAsOfs}: every value and parse count equals the stored row, so Archon has not re-cut it `
        + `(lastUpdated ${asOfs} is a page date, not a data date); nothing written`;
      return;
    }
    s.status = "written";
    if (new Set(s.rows.map(row => row.asOf)).size > 1) s.notes.push(`rows carry their own page's date: ${ok.map(r => `${r.role} ${r.asOf}`).join(", ")}`);
    const moved = pairs.filter(([row, was]) => was && was.value !== row.value);
    const added = pairs.filter(([, was]) => !was).map(([row]) => `${row.spec} ${row.class}`);
    const parsesMoved = pairs.filter(([row, was]) => was && was.n !== row.n).length;
    let detail;
    if (isPop) {
      const big = moved.map(([row, was]) => ({ row, was, d: row.value - was.value })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d))[0];
      const sums = ok.map(r => `${r.role} ${Math.round([...r.table.rows.values()].reduce((a, x) => a + x.pop, 0) * 10) / 10}`).join(", ");
      detail = `${moved.length} changed${big ? `, largest ${Math.round(Math.abs(big.d) * 10) / 10} points (${big.row.spec} ${big.row.class} ${big.was.value} -> ${big.row.value})` : ""}; group sums ${sums}`;
    } else {
      const rel = pairs.filter(([, was]) => was).map(([row, was]) => ({ row, was, d: (row.value - was.value) / was.value }));
      const sorted = rel.map(x => x.d).sort((a, b) => a - b);
      const big = [...rel].sort((a, b) => Math.abs(b.d) - Math.abs(a.d))[0];
      detail = `${moved.length} changed${moved.length ? `, median ${pct(sorted[Math.floor(sorted.length / 2)])}, largest ${pct(big.d)} (${big.row.spec} ${big.row.class} ${big.was.value} -> ${big.row.value})` : ""}`;
    }
    s.summary = `${s.rows.length} rows asOf ${asOfs} (stored ${storedAsOfs}): ${detail}${added.length ? `; new: ${added.join(", ")}` : ""}; parses changed on ${parsesMoved}`;
    if (config) {
      const merged = specs.map(spec => {
        const row = s.rows.find(x => x.class === spec.class && x.spec === spec.spec);
        if (!row) return spec;
        const { class: _c, spec: _s, ...entry } = row;
        return { ...spec, metrics: [...(spec.metrics ?? []).filter(m => !(m.source === "archon" && m.bracket === s.bracket && m.name === s.name)), entry] };
      });
      s.gate = checkValueMove(config, { specs: merged }, { specs }).errors;
    }
  }

  function survivability(s, ok) {
    const empty = [];
    for (const r of ok) {
      const read = r.survRead, at = where(r);
      if (read.absent) { s.problems.push(`${at}: no survivability tier list on the page`); continue; }
      if (read.empty) { empty.push(at); continue; }
      for (const p of read.problems) s.problems.push(`${at}: ${p}`);
      if (read.missing.length) s.problems.push(`${at}: missing ${read.missing.join(", ")} (a series is written whole or not at all)`);
      if (!r.asOf) { s.problems.push(`${at}: lastUpdated ${JSON.stringify(r.lastUpdated)} is not an ISO date, so its tiers have no asOf`); continue; }
      for (const [icon, tier] of read.tiers) {
        const spec = byIcon.get(icon);
        s.rows.push({ class: spec.class, spec: spec.spec, source: "archon", tier, asOf: r.asOf });
        const was = spec.survivability?.tier ?? null;
        if (was !== tier) s.moves.push(`survivability ${nameOf(spec)}: ${was} -> ${tier}${twoStep(was, tier) ? " (two-step)" : ""}`);
      }
    }
    const emptyNote = `Archon published the survivability list empty on the ${empty.join(", ")} (as it did 2026-08-16..21): nothing written, the stored tiers stand; never source them from a per-boss page (refresh-metrics)`;
    if (empty.length && s.problems.length) s.problems.push(emptyNote);
    if (s.problems.length) return;
    if (empty.length) { s.status = "empty"; s.summary = emptyNote; s.rows = []; s.moves = []; return; }
    const asOfs = [...new Set(s.rows.map(row => row.asOf))].join("/");
    if (!s.moves.length && !ok.some(recut)) {
      s.status = "unchanged";
      s.summary = `unchanged: every tier equals the stored one and no Mythic page shows new parses, so Archon has not re-cut it (lastUpdated ${asOfs}); nothing written`;
      s.rows = [];
      return;
    }
    s.status = "written";
    s.summary = `${s.rows.length} tiers asOf ${asOfs}: ${s.moves.length} changed`;
  }

  for (const s of series) {
    if (!s.pages.length) continue;
    for (const role of s.roles) {
      const count = s.pages.filter(r => r.role === role).length;
      if (count === 0) s.problems.push(`no ${role} page in this capture (a series is written whole or not at all)`);
      if (count > 1) s.problems.push(`${count} pages give ${role} rows`);
    }
    for (const r of s.pages) for (const p of r.problems) s.problems.push(`${where(r)} refused: ${p}`);
    const ok = s.pages.filter(r => !r.problems.length);
    if (s.kind === "letters") letters(s, ok);
    else if (s.kind === "survivability") survivability(s, ok);
    else numbers(s, ok);
    if (s.problems.length) {
      s.status = "refused"; s.summary = "refused; nothing written for this series"; s.rows = []; s.moves = []; s.gate = [];
    }
  }

  // Registry entries whose snapshot the lane stamps with the run date: a letter page when
  // its letters merged, a "Mythic rankings" page when its Mythic number family merged, the
  // "Survivability tiers" entry only when all survivability tiers merged. Never `published`:
  // Archon publishes no page date of its own (lastUpdated is not one).
  const stamps = [];
  const stamp = entry => { if (entry && !stamps.includes(entry)) stamps.push(entry); };
  for (const s of series.filter(x => x.status === "written")) {
    if (s.kind === "letters") stamp(s.entry);
    if (s.kind === "number" && s.name.endsWith("(Mythic)")) for (const r of s.pages) stamp(r.numbersEntry);
    if (s.kind === "survivability") for (const r of s.pages) stamp(r.survivabilityEntry);
  }
  const written = series.filter(s => s.status === "written");
  return {
    pages, series, moves: written.filter(s => s.kind === "letters").flatMap(s => s.moves),
    ratings: written.filter(s => s.kind === "letters").flatMap(s => s.rows),
    metrics: {
      metrics: written.filter(s => s.kind === "number" || s.kind === "popularity").flatMap(s => s.rows),
      survivability: written.filter(s => s.kind === "survivability").flatMap(s => s.rows)
    },
    stamps: stamps.map(e => ({ url: e.url, label: e.label ?? null, bracket: e.bracket, role: e.role })),
    refused: pages.some(r => r.problems.length) || series.some(s => s.status === "refused"),
    written: written.length > 0
  };
}

const MARK = { written: "✓", unchanged: "=", empty: "–", absent: "·", refused: "✗" };

export function reportLines(result) {
  const out = ["pages:"];
  for (const r of result.pages) {
    const what = r.role ? `${r.bracket} ${r.role}${r.difficulty ? " " + cap(r.difficulty) : ""}` : r.url;
    if (r.problems.length) { out.push(`✗ ${what}: ${r.problems.join("; ")}${r.role ? ` (${r.url})` : ""}`); continue; }
    const feeds = [r.letters ? "letters" : null, ...r.labels.filter(Boolean).map(l => `"${l}"`)].filter(Boolean).join(", ");
    const same = Object.entries(r.agreement ?? {}).map(([m, a]) => `${m} ${a}`).join(", ");
    out.push(`✓ ${what} (${feeds}): lastUpdated ${r.lastUpdated}, season cue ${r.season}${r.letters && same ? `; same letter as ${same}` : ""}`);
    out.push(`    title: ${r.title}`);
  }
  out.push("series:");
  for (const s of result.series) {
    out.push(`${MARK[s.status]} ${s.label} [${s.key}]: ${s.summary}`);
    for (const p of s.problems) out.push(`    - ${p}`);
    for (const m of s.moves) out.push(`    ${m}`);
    for (const g of s.gate) out.push(`    check-refresh --manifest will flag: ${g}`);
    for (const n of s.notes) out.push(`    note: ${n}`);
  }
  if (result.stamps.length) {
    out.push("stamp `snapshot` with the run date on these data/sources.json archon entries:");
    for (const e of result.stamps) out.push(`    ${e.bracket} ${e.role} ${e.label ? `"${e.label}"` : "(no label)"} ${e.url}`);
  }
  return out;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--snippet") {
    console.log(SNIPPET);
  } else if (args.length === 3 && !args.some(a => a.startsWith("-"))) {
    const [capturePath, ratingsOut, metricsOut] = args;
    try {
      const capture = JSON.parse(await readFile(path.resolve(capturePath), "utf8"));
      const config = JSON.parse(await readFile(path.join(ROOT, "data", "required-sources.json"), "utf8"));
      const result = checkArchonCapture(capture, await loadData(ROOT), { config });
      for (const line of reportLines(result)) console.log(line);
      if (result.refused && !result.written) {
        console.error("✗ nothing passed; nothing written");
        process.exitCode = 1;
      } else {
        await writeFile(path.resolve(ratingsOut), JSON.stringify(result.ratings, null, 2) + "\n");
        await writeFile(path.resolve(metricsOut), JSON.stringify(result.metrics, null, 2) + "\n");
        const { metrics, survivability } = result.metrics;
        console.log(`✓ ${result.ratings.length} letter row(s), ${result.moves.length} changed → ${ratingsOut}; next: node src/apply-ratings.mjs ${ratingsOut}`);
        console.log(`✓ ${metrics.length} metric row(s), ${survivability.length} survivability tier(s) → ${metricsOut}; next: node src/apply-metrics.mjs ${metricsOut}`);
        if (result.refused) {
          console.error("✗ some pages or series were refused (✗ above); the files hold only the series marked ✓");
          process.exitCode = 2;
        }
      }
    } catch (error) {
      console.error("✗ " + error.message);
      process.exitCode = 1;
    }
  } else {
    console.error("Usage: node src/archon-capture.mjs --snippet\n       node src/archon-capture.mjs <capture.json> <ratings-out.json> <metrics-out.json>");
    process.exitCode = 1;
  }
}
