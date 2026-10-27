/* Archon letters read in a real browser (the local run's browser lane, owner decision
   2026-10-27), checked here before anything reaches apply-ratings.
   Usage: node src/archon-capture.mjs --snippet
            prints the expression to run in each registered Archon letter page
            (Claude in Chrome's javascript_tool), one page load at a time
          node src/archon-capture.mjs <capture.json> <ratings-out.json>
            checks a capture and writes apply-ratings rows (source "archon")

   The capture file is { capturedAt, transport, pages: [<the snippet's output>, ...] }.

   Why this exists. Archon's raid pages carry THREE tier lists, and the first one, the
   page's default view, is POPULARITY: how often a spec is played, not how well it does.
   The tracker's Archon letters are the THROUGHPUT list on raid pages and the SCORE list on
   M+ pages (CLAUDE.md hard rule 3). Measured 2026-10-27 on the three Heroic raid pages:
   list order popularity, throughput, survivability, and popularity gave the same letter as
   throughput for only 15 of 40 specs. A read that takes the first list therefore looks like
   a big upstream rebuild, not like an error; only the metric name tells them apart. So the
   snippet selects by metric name and throws when that list is missing, and this file
   refuses any page whose recorded metric is not its bracket's.

   The browser tool's output is copied into the capture by hand, so the snippet also returns
   an FNV-1a hash of the exact tier lines it read. Lines that do not hash to it were
   mistyped, and the capture is refused. */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData } from "./validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const EXPECTED_METRIC = { raid: "throughput", mplus: "score" };
const LETTER_ROLES = new Set(["DPS", "Healer", "Tank"]);

export function fnv1a(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

/* One expression, run in the page. It must stay self-contained (no imports, no template
   interpolation) and must keep the same hash as fnv1a above, which the tests check. */
export const SNIPPET = `(() => {
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };
  const nd = document.getElementById("__NEXT_DATA__");
  if (!nd) throw new Error("no __NEXT_DATA__ on " + location.pathname + " (a verification page?): stop the lane, do not retry or wait it out");
  const page = JSON.parse(nd.textContent).props.pageProps.page;
  const lists = (page.specTierListSection && page.specTierListSection.tierLists) || [];
  const metric = location.pathname.includes("/raid/") ? "throughput" : "score";
  const chosen = lists.find(tl => tl.metric === metric);
  if (!chosen) throw new Error("no " + metric + " tier list on " + location.pathname + " (lists: " + lists.map(tl => tl.metric).join(", ") + "): refuse the page, never fall back to another list");
  const entries = t => (t.entries || []).flat();
  const letters = tl => Object.fromEntries(tl.tiers.flatMap(t => entries(t).map(e => [e.icon, t.tier])));
  const tiers = chosen.tiers.map(t => t.tier + ": " + entries(t).map(e => e.icon).join(" "));
  const mine = letters(chosen), keys = Object.keys(mine);
  const agreement = Object.fromEntries(lists.filter(tl => tl !== chosen).map(tl => {
    const other = letters(tl);
    return [tl.metric, keys.filter(k => other[k] === mine[k]).length + "/" + keys.length];
  }));
  const text = (document.body && document.body.innerText) || "";
  return { url: location.origin + location.pathname, title: document.title || null, season: (text.match(/Season \\d+/) || [null])[0], lastUpdated: page.lastUpdated || null, metric: chosen.metric, metrics: lists.map(tl => tl.metric), tiers, hash: fnv(tiers.join("\\n")), agreement };
})()`;

/* Icons are "Class-Spec" in CamelCase (DeathKnight-Frost, DemonHunter-Devourer,
   Hunter-BeastMastery). Resolve from them, never from the display name. */
const iconOf = spec => `${spec.class.replace(/\s+/g, "")}-${spec.spec.replace(/\s+/g, "")}`;

export function archonCaptureRows(capture, { specs, sources, scales }) {
  const archon = (sources ?? []).find(s => s.id === "archon");
  if (!archon) throw new Error("data/sources.json has no archon source");
  const order = scales?.scales?.[archon.scale]?.tiers ?? [];
  const scale = new Set(order);
  const pages = new Map((archon.pages ?? []).map(p => [p.url, p]));
  const byIcon = new Map(specs.map(s => [iconOf(s), s]));
  const errors = [], rows = [], report = [], moves = [], seenPages = new Set();

  for (const page of capture?.pages ?? []) {
    const reg = pages.get(page.url);
    if (!reg) { errors.push(`${page.url}: not a registered Archon page`); continue; }
    if (reg.label || !LETTER_ROLES.has(reg.role)) {
      errors.push(`${page.url}: registered as "${reg.label ?? reg.role}", which feeds a numeric family, not letters`);
      continue;
    }
    if (seenPages.has(page.url)) { errors.push(`${page.url}: captured twice`); continue; }
    seenPages.add(page.url);
    const where = `${reg.bracket} ${reg.role}`;
    const want = EXPECTED_METRIC[reg.bracket];
    if (page.metric !== want) {
      errors.push(`${where}: captured the "${page.metric}" list; Archon ${reg.bracket} letters come from "${want}" only (the first list on a raid page is popularity)`);
      continue;
    }
    if (!Array.isArray(page.metrics) || !page.metrics.includes(want)) errors.push(`${where}: the page's list of metrics does not include "${want}"`);
    const tiers = Array.isArray(page.tiers) ? page.tiers : [];
    if (fnv1a(tiers.join("\n")) !== page.hash) {
      errors.push(`${where}: the tier lines do not hash to the snippet's ${page.hash}; the capture was mistyped`);
      continue;
    }
    const seen = new Set();
    for (const line of tiers) {
      const m = /^(\S+): ?(.*)$/.exec(line);
      if (!m) { errors.push(`${where}: unreadable tier line "${line}"`); continue; }
      const [, tier, rest] = m;
      if (!scale.has(tier)) errors.push(`${where}: "${tier}" is not on Archon's scale`);
      for (const icon of rest.split(/\s+/).filter(Boolean)) {
        const spec = byIcon.get(icon);
        if (!spec) { errors.push(`${where}: unknown spec token ${icon}`); continue; }
        if (spec.role !== reg.role) { errors.push(`${where}: ${icon} is a ${spec.role} spec`); continue; }
        if (seen.has(icon)) { errors.push(`${where}: ${icon} listed twice`); continue; }
        seen.add(icon);
        rows.push({ class: spec.class, spec: spec.spec, bracket: reg.bracket, source: "archon", tier });
        const was = spec.ratings?.[reg.bracket]?.archon ?? null;
        if (was !== tier) {
          const twoStep = was !== null && Math.abs(order.indexOf(was) - order.indexOf(tier)) >= 2;
          moves.push(`${reg.bracket} ${spec.spec} ${spec.class}: ${was} -> ${tier}${twoStep ? " (two-step)" : ""}`);
        }
      }
    }
    const missing = specs.filter(s => s.role === reg.role && !seen.has(iconOf(s))).map(iconOf);
    if (missing.length) errors.push(`${where}: missing ${missing.join(", ")}`);
    report.push({ bracket: reg.bracket, role: reg.role, metric: page.metric, count: seen.size, title: page.title ?? null, season: page.season ?? null, lastUpdated: page.lastUpdated ?? null, agreement: page.agreement ?? {} });
  }
  if (!seenPages.size && !errors.length) errors.push("the capture has no pages");
  if (errors.length) throw new Error(`${errors.length} problem(s) in the Archon capture, nothing written:\n  - ${errors.join("\n  - ")}`);
  return { rows, pages: report, moves };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const [first, second] = process.argv.slice(2);
  if (first === "--snippet") {
    console.log(SNIPPET);
  } else if (first && second) {
    try {
      const capture = JSON.parse(await readFile(path.resolve(first), "utf8"));
      const result = archonCaptureRows(capture, await loadData(ROOT));
      for (const p of result.pages) {
        const others = Object.entries(p.agreement).map(([m, a]) => `${m} ${a}`).join(", ") || "no other list compared";
        console.log(`✓ ${p.bracket} ${p.role}: ${p.metric} list, ${p.count} specs, lastUpdated ${p.lastUpdated}, season cue ${p.season}; same letter as ${others}`);
        console.log(`  title: ${p.title}`);
      }
      for (const m of result.moves) console.log("  " + m);
      await writeFile(path.resolve(second), JSON.stringify(result.rows, null, 2) + "\n");
      console.log(`✓ ${result.rows.length} archon row(s), ${result.moves.length} changed → ${second}; next: node src/apply-ratings.mjs ${second}`);
    } catch (error) {
      console.error("✗ " + error.message);
      process.exit(1);
    }
  } else {
    console.error("Usage: node src/archon-capture.mjs --snippet\n       node src/archon-capture.mjs <capture.json> <ratings-out.json>");
    process.exit(1);
  }
}
