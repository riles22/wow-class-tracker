// Icy Veins guide harvester (Phase B, gearing-s2-scope G4).
//
//   node src/harvest-guide-icyveins.mjs [--force] [--spec "Frost Mage"]
//
// Two pages per spec, patterns verified live 2026-08-18:
//   stat priority: https://www.icy-veins.com/wow/<spec>-<class>-pve-<role>-stat-priority
//   BiS:           https://www.icy-veins.com/wow/<spec>-<class>-pve-<role>-gear-best-in-slot
//
// Parse recipes come from the 2026-08-18 recon (raw pages in the session scratchpad;
// excerpted fixtures in test/fixtures/guides/). The load-bearing shapes:
//   - Priorities are <div class="stat-priority-widget"> blocks of ordered
//     <div class="stat-container ..."><div class="stat-name">X</div></div>, scoped by the
//     nearest PRECEDING h2/h3 heading (Holy Paladin: Herald of the Sun / Lightsmith /
//     Mythic+ — hero-talent AND bracket axes mixed on one page, the G7 ragged case).
//   - BiS lists are h3-anchored PAIRS of grids (main 16-slot + --weapons 2-slot); the h3
//     id (overall-best-in-slot / best-gear-from-raid / best-gear-from-mythic) names the
//     list, and BOTH grids after one h3 belong to it (the off-by-one trap: anchor the h3
//     immediately preceding each grid, never positional walking).
//   - Item identity lives in data-wowhead="item=NNN&bonus=..." attributes (NOT hrefs —
//     changed since the 08-12 recon); bonus= runs 1-6 segments, never assume triplets.
//     Scope the item parse to the FIRST spell_icon_span per block or gems/enchants from
//     bis_item_extras leak in as gear.
//   - Drop source is <span class="bis_item_drop">, now usually an anchor to Icy Veins'
//     own boss/dungeon guide — the href suffix (-raid-guide / -dungeon-guide) is a
//     stronger kind signal than the free text, which still exists ("Crafted by …").
import { runGuideHarvest } from "./lib-guide-runner.mjs";
import { canonicalRosters, canonicalSlot, fetchText, normApostrophes, resolveDropSource,
  normalizeStatRun, parseSoftCaps } from "./lib-guides.mjs";

const slug = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const roleSlug = (r) => (/tank/i.test(r) ? "tank" : /heal/i.test(r) ? "healing" : "dps");
const LIST_IDS = { "overall-best-in-slot": "overall", "best-gear-from-raid": "raid",
  "best-gear-from-mythic": "mplus" };

export function articleDate(html) {
  // JSON-LD dateModified is canonical; datePublished is the article's 2012-era creation.
  const m = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})T/);
  return m ? m[1] : null;
}

const textOnly = (h) => normApostrophes(h.replace(/<[^>]+>/g, " "));

/** All h2/h3 headings with their byte offsets, for nearest-preceding-heading scoping. */
function headings(html) {
  return [...html.matchAll(/<h([23])[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => ({ index: m.index, id: m[2], text: textOnly(m[3]) }));
}
const headingBefore = (all, index) => {
  let best = null;
  for (const h of all) { if (h.index < index) best = h; else break; }
  return best;
};

/** Scoped stat-priority widgets. */
export function parseIcyVeinsPriorities(html) {
  const heads = headings(html);
  const out = [];
  const widgets = [...html.matchAll(/<div class="stat-priority-widget"[\s\S]*?(?=<div class="stat-priority-widget"|<h[23]|<div class="bis_items_grid|$)/gi)];
  for (const w of widgets) {
    const names = [...w[0].matchAll(/<div class="stat-name">([\s\S]*?)<\/div>/gi)].map((m) => textOnly(m[1]));
    if (!names.length) continue;
    const h = headingBefore(heads, w.index);
    const label = h ? h.text.replace(/\s*stat priority\s*$/i, "").trim() || "General" : "General";
    const run = normalizeStatRun(names);
    out.push({ label, scopeHeadingId: h ? h.id : null,
      primary: run.primary, secondaries: run.secondaries,
      leadsWithItemLevel: run.leadsWithItemLevel,
      softCaps: parseSoftCaps(names.join(" > ")), raw: names.join(" > ") });
  }
  return out;
}

/** h3-anchored BiS grids -> per-slot rows. */
export function parseIcyVeinsBis(html, rosters) {
  const heads = headings(html);
  const rows = [];
  const grids = [...html.matchAll(/<div class="bis_items_grid[^"]*">[\s\S]*?(?=<div class="bis_items_grid|<h[23]|<div class="heading_container|$)/gi)];
  for (const g of grids) {
    const h = headingBefore(heads, g.index);
    const list = h ? LIST_IDS[h.id] : null;
    if (!list) continue; // trinket fieldsets / unrelated grids
    const blocks = [...g[0].matchAll(/<div class="bis_item(?:\s[^"]*)?">([\s\S]*?)(?=<div class="bis_item(?:\s|")|$)/gi)];
    for (const b of blocks) {
      const block = b[1];
      if (/bis_item--empty/.test(b[0])) continue; // Shirt / Tabard
      const slotText = (block.match(/<(?:span|div) class="bis_item_slot"[^>]*>([\s\S]*?)<\/(?:span|div)>/i) || [])[1];
      const slot = slotText ? canonicalSlot(textOnly(slotText)) : null;
      if (!slot) continue; // Shirt/Tabard fall out here too when not --empty-flagged
      // FIRST spell_icon_span only — extras (gems/enchants) come after bis_item_extras.
      const head = block.split(/bis_item_extras|bis_item_enchant/)[0];
      const item = head.match(/data-wowhead="item=(\d+)(?:&(?:amp;)?bonus=([0-9:]*))?[^"]*"[^>]*>[\s\S]*?<span[^>]*class="q\d[^"]*"[^>]*>([\s\S]*?)<\/span>/i)
        || head.match(/data-wowhead="item=(\d+)(?:&(?:amp;)?bonus=([0-9:]*))?[^"]*"/i);
      if (!item) continue;
      const itemId = item[1];
      const itemName = item[3] ? textOnly(item[3]) : null;
      const dropHtml = (block.match(/<span class="bis_item_drop"[^>]*>([\s\S]*?)<\/span>/i) || [])[1] || "";
      const dropText = textOnly(dropHtml);
      // The anchor HREF is a stronger kind signal than the free text (recon 2026-08-18):
      // -raid-guide / -dungeon-guide join the roster; the world-bosses guide classifies
      // Nymrissa Wavecaller AND Tidebound Grotto drops as world loot without a join.
      const instanceAnchor = dropHtml.match(/href="[^"]*\/wow\/[a-z0-9-]+?-(raid|dungeon)-guide[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
      const worldAnchor = /href="[^"]*world-bosses-guide[^"]*"/i.test(dropHtml);
      const source = worldAnchor
        ? { sourceKind: "world", boss: null, dungeon: null, droppedBy: textOnly(dropHtml) || null }
        : instanceAnchor
          ? resolveDropSource(textOnly(instanceAnchor[2]), itemId, rosters)
          : resolveDropSource(dropText, itemId, rosters);
      rows.push({ list, slot, itemId, itemName, sourceText: dropText, ...source });
    }
  }
  return rows;
}

async function harvestSpec(spec) {
  const base = `https://www.icy-veins.com/wow/${slug(spec.spec)}-${slug(spec.class)}-pve-${roleSlug(spec.role)}`;
  const statHtml = await fetchText(`${base}-stat-priority`);
  const bisHtml = await fetchText(`${base}-gear-best-in-slot`);
  if (!statHtml && !bisHtml) return null; // no guide published for this spec (recorded)
  const priorities = statHtml ? parseIcyVeinsPriorities(statHtml) : [];
  const bis = bisHtml ? parseIcyVeinsBis(bisHtml, harvestSpec.rosters) : [];
  if (!priorities.length && !bis.length)
    throw new Error("pages fetched but neither priorities nor BiS parsed — recipe drift?");
  return {
    guideUrl: `${base}-gear-best-in-slot`,
    published: articleDate(bisHtml || statHtml),
    priorities, bis,
  };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  await runGuideHarvest({ sourceId: "icyveins", sourceName: "Icy Veins", dated: true,
    harvestSpec: async (spec, { raid, dungeons }) => {
      harvestSpec.rosters = harvestSpec.rosters || canonicalRosters(raid, dungeons);
      return harvestSpec(spec);
    } });
}
