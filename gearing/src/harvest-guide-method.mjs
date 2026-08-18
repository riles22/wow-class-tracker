// Method guide harvester (Phase B, gearing-s2-scope G4).
//
//   node src/harvest-guide-method.mjs [--force] [--spec "Frost Mage"]
//
// Two pages per spec, patterns verified live 2026-08-18:
//   BiS:      https://www.method.gg/guides/<spec-class-kebab>/gearing
//   priority: https://www.method.gg/guides/<spec-class-kebab>/stats-races-and-consumables
// Direct fetch with a browser UA works (no 403, no proxy).
//
// The scope doc's "Method carries no update date" concession (G4) is STALE: every page now
// carries <span class="guide-update-date"><strong>Last Updated: </strong>11th Aug, 2026</span>
// plus a "Patch 12.1" chip — parsed here, so Method is dated like the other two.
//
// BiS lives in three tab panes (#overall_table / #raid_table / #dungeon_table), each one
// <table> with NO thead — the first row is bold header cells. A fourth table (Voidcore
// bonus-roll advice) has a different header and is skipped by the pane anchoring. Item IDs
// sit in wowhead hrefs whose namespace varies (/ptr/, bare, /beta/) — match item=(\d+),
// never the prefix. Source text is the messiest of the three: &rsquo; entities (no raw
// U+2019 anywhere), "(Catalyst)" / "(Tier Token)" suffixes and "… / Catalyst" slash forms,
// "Crafted" vs "Crafting" — all handled in lib-guides' normalizeDropSource.
//
// Stat priorities are UNSCOPED (one list per spec — Method never differentiates hero
// talents; the Build selector must not expect it to) but the MARKUP varies: an inline
// labeled paragraph, a label-paragraph followed by a bare run ("Crit"/"Versa"
// abbreviations), or an <ol>. All three shapes are parsed; the section is bounded by
// id="stat-prio" .. the next guide-section-title.
import { runGuideHarvest } from "./lib-guide-runner.mjs";
import { canonicalRosters, canonicalSlot, fetchText, normApostrophes, resolveDropSource,
  normalizeStatRun, parseSoftCaps } from "./lib-guides.mjs";

const kebab = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const PANE_LISTS = { overall_table: "overall", raid_table: "raid", dungeon_table: "mplus" };
const MONTHS = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };

export function methodDate(html) {
  const m = html.match(/guide-update-date[^>]*>\s*<strong>[^<]*<\/strong>\s*(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})[a-z]*,?\s+(\d{4})/i);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase().slice(0, 3)];
  return month ? `${m[3]}-${month}-${String(m[1]).padStart(2, "0")}` : null;
}

const textOnly = (h) => normApostrophes(h.replace(/<[^>]+>/g, " "));

export function parseMethodBis(html, rosters) {
  const rows = [];
  for (const pane of html.matchAll(/<div[^>]*class="tab-pane[^"]*"[^>]*id="(overall_table|raid_table|dungeon_table)"[^>]*>([\s\S]*?)(?=<div[^>]*class="tab-pane|$)/gi)) {
    const list = PANE_LISTS[pane[1]];
    const table = pane[2].match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!table) continue;
    for (const tr of table[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1]);
      if (tds.length < 3 || /<b>\s*Slot\s*<\/b>/i.test(tds[0])) continue;
      const slot = canonicalSlot(textOnly(tds[0]));
      const item = tds[1].match(/item=(\d+)/i);
      if (!slot || !item) continue;
      const itemName = textOnly((tds[1].match(/<a[^>]*>([\s\S]*?)<\/a>/i) || [])[1] || "") || null;
      const sourceText = textOnly(tds[2]);
      const source = resolveDropSource(sourceText, item[1], rosters);
      rows.push({ list, slot, itemId: item[1], itemName, sourceText, ...source });
    }
  }
  return rows;
}

export function parseMethodPriorities(html) {
  const section = (html.match(/id="stat-prio"[\s\S]*?(?=<div class="guide-section-title"[^>]*id="(?!stat-prio)|$)/i) || [])[0];
  if (!section) return [];
  const out = [];
  const push = (label, entries, raw) => {
    const run = normalizeStatRun(entries);
    if (run.secondaries.length < 2) return;
    out.push({ label: label || "General", primary: run.primary, secondaries: run.secondaries,
      leadsWithItemLevel: run.leadsWithItemLevel, softCaps: parseSoftCaps(raw), raw });
  };
  // Shape 3: <ol> list
  for (const ol of section.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi)) {
    const items = [...ol[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => textOnly(m[1]));
    push("General", items, items.join(" > "));
  }
  // Shapes 1+2: paragraph runs. An inline "<b>Label:</b> run" carries its own label;
  // a bare-run paragraph inherits the closest preceding "<b>Label:</b>" paragraph.
  let pendingLabel = null;
  for (const p of section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const labelMatch = p[1].match(/<b>\s*([^<:]{2,40}?)\s*:?\s*<\/b>/i);
    const text = textOnly(p[1].replace(/<b>[\s\S]*?<\/b>/i, ""));
    const isRun = /(?:>|=)/.test(text) && /(intellect|agility|strength|mastery|haste|crit|vers)/i.test(text);
    if (labelMatch && !isRun) { pendingLabel = normApostrophes(labelMatch[1]); continue; }
    if (!isRun) continue;
    const label = labelMatch ? normApostrophes(labelMatch[1]) : pendingLabel;
    push(/^stat priorit/i.test(label || "") ? "General" : label,
      text.split(/\s*(?:>=|=|>)\s*/), text);
    pendingLabel = null;
  }
  // De-duplicate — the <ol> and a summary paragraph can restate the same run.
  const seen = new Set();
  return out.filter((p) => {
    const k = p.label + "|" + p.secondaries.join(">");
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

async function harvestSpec(spec, rosters) {
  const base = `https://www.method.gg/guides/${kebab(spec.spec)}-${kebab(spec.class)}`;
  const bisHtml = await fetchText(`${base}/gearing`);
  const statHtml = await fetchText(`${base}/stats-races-and-consumables`);
  if (!bisHtml && !statHtml) return null;
  const priorities = statHtml ? parseMethodPriorities(statHtml) : [];
  const bis = bisHtml ? parseMethodBis(bisHtml, rosters) : [];
  if (!priorities.length && !bis.length)
    throw new Error("pages fetched but neither priorities nor BiS parsed — recipe drift?");
  return { guideUrl: `${base}/gearing`,
    published: methodDate(bisHtml || statHtml), priorities, bis };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  let rosters = null;
  await runGuideHarvest({ sourceId: "method", sourceName: "Method", dated: true,
    harvestSpec: async (spec, { raid, dungeons }) => {
      rosters = rosters || canonicalRosters(raid, dungeons);
      return harvestSpec(spec, rosters);
    } });
}
