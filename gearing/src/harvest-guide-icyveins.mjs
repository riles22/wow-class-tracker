// Icy Veins guide harvester (Phase B, gearing-s2-scope G4).
//
//   node src/harvest-guide-icyveins.mjs [--force] [--spec "Frost Mage"]
//
// Three pages per spec, patterns verified live 2026-08-18:
//   stat priority: https://www.icy-veins.com/wow/<spec>-<class>-pve-<role>-stat-priority
//   BiS:           https://www.icy-veins.com/wow/<spec>-<class>-pve-<role>-gear-best-in-slot
//   enhancements:  https://www.icy-veins.com/wow/<spec>-<class>-pve-<role>-gems-enchants-consumables
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
//   - The enhancements page (gems / enchants / consumables) has its own recipe — see
//     the block comment above parseIcyVeinsEnhancements.
import { runGuideHarvest } from "./lib-guide-runner.mjs";
import { canonicalRosters, canonicalSlot, fetchText, normApostrophes, resolveDropSource,
  normalizeStatRun, parseSoftCaps, ENHANCEMENT_CONSUMABLE_KEYS, validateEnhancements }
  from "./lib-guides.mjs";

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
    .map((m) => ({ index: m.index, level: Number(m[1]), id: m[2], text: textOnly(m[3]) }));
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

/** The per-spec trinket letter rankings (G8). Lives in a collapsed block after
 *  <h2 id="trinkets">: rows of "<Letter> Tier" label cells followed by item spans.
 *  Icy Veins defines a tier as ~0.5% DPS on the page itself; we keep the LETTERS
 *  per source and never merge scales (DECISION G8). Absent section -> empty array
 *  (healers/tanks may not publish one). */
export function parseIcyVeinsTrinketTiers(html) {
  const start = html.search(/<h2[^>]*id="trinkets"/i);
  if (start < 0) return [];
  const next = html.slice(start + 10).search(/<h2[^>]*id="(?!trinkets)/i);
  const section = html.slice(start, next > 0 ? start + 10 + next : start + 30000);
  const tiers = [];
  const matches = [...section.matchAll(/([SABCDF]) Tier([\s\S]*?)(?=[SABCDF] Tier|$)/g)];
  for (const m of matches) {
    const ids = [...new Set([...m[2].matchAll(/data-wowhead="item=(\d+)/g)].map((x) => x[1]))];
    if (ids.length) tiers.push({ tier: m[1], itemIds: ids });
  }
  return tiers;
}

/* ---- Enhancements page (gems / enchants / consumables) ----------------------------
   Recon 2026-08-18. The load-bearing shapes:
   - Stable heading ids scope everything: h2#recommended-gems,
     h2#best-enchants-and-weapon-augments, h2#optimal-consumables (with h3#flask /
     h3#potions / h3#food-buff / OPTIONAL h3#augment-rune), h2#changelog terminates.
     A section or subsection the page lacks is an OMITTED category (Holy Paladin has
     no augment rune) — absence is honest, never an error.
   - The only real table is <table class="enchants"> (th Slot|Enchantment). Cells hold
     spell_icon_span items — sometimes <ul><li>-wrapped (Holy Paladin), sometimes bare
     (Frost Mage) — and a cell can hold TWO enchants (HPal Rings): kept as ordered
     candidates, with the leftover cell prose (parenthetical scopes, "or sim it"
     hedges) as the note. Slot names go through canonicalSlot like the BiS grid.
   - The weapon OIL is NOT in the table — it lives in the <p>s between the enchants h2
     and the table, and normalizes into consumables.weaponBuff (shared contract, so
     cross-source consensus can join). HPal's oil paragraph carries a hero-talent
     exception as a SPELL ref (Rite of Sanctification) — spell refs become
     { spellId, name } candidates; the conditionality prose rides in the note.
   - Potions classify by NAME ("Mana" -> manaPotion, "Health Potion" -> healthPotion,
     else combatPotion); the Warlock Healthstone (item 5512) is a handout, not a
     consumable you stock — note-only, never a candidate.
   - faq-block__wrapper / cta-block__wrapper-new are stripped BEFORE extraction:
     Frost Mage's FAQ dropdown holds data-wowhead refs that would pollute the lists. */
const CONSUMABLE_SECTION_KEYS = { flask: "flask", potions: "potions", "food-buff": "food",
  "augment-rune": "augmentRune", tea: "tea" };

/** Balanced-div removal of boilerplate blocks whose innards carry stray refs. */
function stripBoilerplate(html) {
  for (const marker of ['<div class="faq-block__wrapper"', '<div class="cta-block__wrapper-new"']) {
    let at;
    while ((at = html.indexOf(marker)) !== -1) {
      const tag = /<\/?div\b[^>]*>/gi;
      tag.lastIndex = at + 1;
      let depth = 1, end = html.length, t;
      while ((t = tag.exec(html))) {
        depth += t[0][1] === "/" ? -1 : 1;
        if (!depth) { end = t.index + t[0].length; break; }
      }
      html = html.slice(0, at) + html.slice(end);
    }
  }
  return html;
}

/** Every spell_icon_span element in a chunk, as { el, cand }. The data-wowhead ref may
 *  sit on the OUTER span or the INNER name span (both occur live), so it is matched
 *  anywhere within the element, like the BiS parser. Ref-less chips (the inline
 *  hero-talent icons) are skipped. */
function iconCands(chunk) {
  const out = [];
  const open = /<span class="spell_icon_span[^"]*"[^>]*>/gi;
  let m;
  while ((m = open.exec(chunk))) {
    const tag = /<\/?span\b[^>]*>/gi; // balanced scan — the outer span nests the name span
    tag.lastIndex = open.lastIndex;
    let depth = 1, end = chunk.length, t;
    while ((t = tag.exec(chunk))) {
      depth += t[0][1] === "/" ? -1 : 1;
      if (!depth) { end = t.index + t[0].length; break; }
    }
    const el = chunk.slice(m.index, end);
    open.lastIndex = end;
    const ref = el.match(/data-wowhead="(item|spell)=(\d+)/i);
    if (!ref) continue;
    let name = (el.match(/<span[^>]*class="(?:q\d|spell)"[^>]*>([\s\S]*?)<\/span>/i) || [])[1];
    name = name ? textOnly(name) : "";
    // "+29 Mastery"-style stat strings: the img alt (minus trailing " Icon") is the name
    if (!name || /^[+-]?\d/.test(name)) {
      const alt = (el.match(/\balt="([^"]*)"/i) || [])[1];
      const fromAlt = alt ? textOnly(alt.replace(/\s*Icon\s*$/i, "")) : "";
      if (fromAlt) name = fromAlt;
    }
    if (!name) continue;
    out.push({ el, cand: ref[1].toLowerCase() === "spell"
      ? { spellId: ref[2], name } : { id: ref[2], name } });
  }
  return out;
}

const dedupeCands = (cands) => {
  const seen = new Set();
  return cands.filter((c) => {
    const key = c.id ? `item:${c.id}` : `spell:${c.spellId}`;
    return seen.has(key) ? false : (seen.add(key), true);
  });
};

const proseOf = (chunk) => [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
  .map((m) => textOnly(m[1])).filter(Boolean).join(" ");

/** The section from one id'd h2 to the next h2 (or EOF), as { start, end, html }. */
function h2Section(html, heads, id) {
  const i = heads.findIndex((h) => h.level === 2 && h.id === id);
  if (i < 0) return null;
  const next = heads.slice(i + 1).find((h) => h.level === 2);
  const end = next ? next.index : html.length;
  return { start: heads[i].index, end, html: html.slice(heads[i].index, end) };
}

/* A prose section MENTIONS far more refs than it RECOMMENDS — ability spells
   (Bloodlust, Metamorphosis), trinkets, cross-linked enchants. The 2026-08-18
   adversarial review measured ~14 polluted specs (worst: Holy Priest's page has no
   enchants table, so all 14 of its per-slot enchants shipped as weapon oils). A
   candidate must LOOK like its category; anything else stays in the prose note —
   transcription without misclassification. */
const CATEGORY_GATES = {
  flask: /flask/i,
  // The potion FAMILY is wider than the word "potion": Light's Potential is the
  // melee combat potion of S2 and appeared only in 20 specs' notes until this gate
  // widened (invariant catch, 2026-08-18). Ability spells are rejected before the
  // name gate ever runs — Bloodlust can never pass however the names drift.
  potion: /potion|draught|elixir|philter|brew\b|potential\b|concoction/i,
  // Food is EXCLUSION-gated: food names are whimsical ("Harandar Celebration") so an
  // inclusion list drops real feasts; the observed pollution vectors are the other lanes.
  food: { test: (name) => !/enchant |flask|potion|\brune\b|\boil\b|stone\b|reliquary|puzzle box/i.test(name) },
  augmentRune: /\brune\b/i,
  weaponBuff: /\boil\b|imbue|whetstone|sharpening|weightstone|rite of|sanctification/i,
};

export function parseIcyVeinsEnhancements(html) {
  const clean = stripBoilerplate(html);
  const heads = headings(clean);
  const enh = {};
  const consumables = {};
  const noteParts = []; // page-order prose — the honest carrier for conditionality

  const gemsSec = h2Section(clean, heads, "recommended-gems");
  if (gemsSec) {
    const cands = dedupeCands(iconCands(gemsSec.html).map((c) => c.cand));
    if (cands.length) {
      // the meta-style gem is the "Diamond"; everything else fills sockets, prose order
      const unique = cands.filter((c) => /diamond/i.test(c.name));
      const filler = cands.filter((c) => !/diamond/i.test(c.name));
      const note = proseOf(gemsSec.html);
      enh.gems = { ...(unique.length ? { unique } : {}), ...(filler.length ? { filler } : {}),
        ...(note ? { note } : {}) };
    }
  }

  const enchSec = h2Section(clean, heads, "best-enchants-and-weapon-augments");
  if (enchSec) {
    const tableM = enchSec.html.match(/<table class="enchants">[\s\S]*?<\/table>/i);
    // the weapon oil paragraph(s) sit between the h2 and the table
    const pre = tableM ? enchSec.html.slice(0, tableM.index) : enchSec.html;
    const oil = dedupeCands(iconCands(pre).map((c) => c.cand))
      .filter((c) => CATEGORY_GATES.weaponBuff.test(c.name));
    if (oil.length) {
      consumables.weaponBuff = oil;
      const p = proseOf(pre);
      if (p) noteParts.push(p);
    }
    const enchants = [];
    for (const row of tableM ? [...tableM[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)] : []) {
      if (/<th[\s>]/i.test(row[1])) continue; // Slot|Enchantment header
      const tds = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((x) => x[1]);
      if (tds.length < 2) continue;
      const slot = canonicalSlot(textOnly(tds[0]));
      if (!slot) continue;
      const found = iconCands(tds[1]);
      const candidates = dedupeCands(found.map((c) => c.cand));
      if (!candidates.length) continue;
      let residue = tds[1]; // cell prose minus the item elements = the row's note
      for (const f of found) residue = residue.replace(f.el, " ");
      const note = textOnly(residue);
      enchants.push({ slot, candidates, ...(note ? { note } : {}) });
    }
    if (enchants.length) enh.enchants = enchants;
  }

  const consSec = h2Section(clean, heads, "optimal-consumables");
  if (consSec) {
    const inner = heads.filter((h) => h.level === 3 && h.index > consSec.start && h.index < consSec.end);
    for (let i = 0; i < inner.length; i++) {
      const key = CONSUMABLE_SECTION_KEYS[inner[i].id];
      if (!key) continue; // an h3 we don't recognize — leave it out rather than guess
      const chunk = clean.slice(inner[i].index, i + 1 < inner.length ? inner[i + 1].index : consSec.end);
      const cands = dedupeCands(iconCands(chunk).map((c) => c.cand));
      if (!cands.length) continue;
      if (key === "potions") {
        for (const c of cands) {
          if (c.spellId) continue; // ability mention (Bloodlust et al.) → note only
          if (!CATEGORY_GATES.potion.test(c.name)) continue; // trinket/cross-link → note only
          if (c.id === "5512" || /healthstone/i.test(c.name)) continue; // note-only
          const bucket = /mana/i.test(c.name) ? "manaPotion"
            : /health potion/i.test(c.name) ? "healthPotion" : "combatPotion";
          (consumables[bucket] ??= []).push(c);
        }
      } else {
        const gate = CATEGORY_GATES[key];
        // flask/rune candidates must be items (their lanes have no legitimate spells);
        // food and weaponBuff legitimately carry spells (feasts, Rite of Sanctification)
        const itemsOnly = key === "flask" || key === "augmentRune";
        const kept = cands.filter((c) => (!itemsOnly || !c.spellId) && (!gate || gate.test(c.name)));
        if (kept.length) consumables[key] = kept;
      }
      const p = proseOf(chunk);
      if (p) noteParts.push(p);
    }
  }

  // recipe sanity: only contract keys may land here (guards the section-id map above)
  for (const key of Object.keys(consumables))
    if (!ENHANCEMENT_CONSUMABLE_KEYS.includes(key))
      throw new Error(`enhancements recipe produced unknown consumable key "${key}"`);
  if (Object.keys(consumables).length) {
    const note = noteParts.join(" ").trim();
    enh.consumables = { ...consumables, ...(note ? { note } : {}) };
  }
  return Object.keys(enh).length ? enh : null;
}

async function harvestSpec(spec) {
  const base = `https://www.icy-veins.com/wow/${slug(spec.spec)}-${slug(spec.class)}-pve-${roleSlug(spec.role)}`;
  const statHtml = await fetchText(`${base}-stat-priority`);
  const bisHtml = await fetchText(`${base}-gear-best-in-slot`);
  if (!statHtml && !bisHtml) return null; // no guide published for this spec (recorded)
  const enhHtml = await fetchText(`${base}-gems-enchants-consumables`);
  const priorities = statHtml ? parseIcyVeinsPriorities(statHtml) : [];
  const bis = bisHtml ? parseIcyVeinsBis(bisHtml, harvestSpec.rosters) : [];
  if (!priorities.length && !bis.length)
    throw new Error("pages fetched but neither priorities nor BiS parsed — recipe drift?");
  const record = {
    guideUrl: `${base}-gear-best-in-slot`,
    published: articleDate(bisHtml || statHtml),
    priorities, bis,
    trinketTiers: bisHtml ? parseIcyVeinsTrinketTiers(bisHtml) : [],
  };
  // Enhancements are a bonus lane — a missing/unparseable page never fails the spec,
  // it just leaves the field off with a recorded note (absence is data, never silent).
  const enh = enhHtml ? parseIcyVeinsEnhancements(enhHtml) : null;
  validateEnhancements(enh, `${spec.spec} ${spec.class}`);
  if (enh) record.enhancements = enh;
  else record.notes = [enhHtml
    ? "enhancements page fetched but nothing parsed — recipe drift? gems/enchants/consumables not harvested"
    : "enhancements page absent (404/unreachable) — gems/enchants/consumables not harvested"];
  return record;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  await runGuideHarvest({ sourceId: "icyveins", sourceName: "Icy Veins", dated: true,
    harvestSpec: async (spec, { raid, dungeons }) => {
      harvestSpec.rosters = harvestSpec.rosters || canonicalRosters(raid, dungeons);
      return harvestSpec(spec);
    } });
}
