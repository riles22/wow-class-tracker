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
  normalizeStatRun, parseSoftCaps, ENHANCEMENT_CONSUMABLE_KEYS, validateEnhancements }
  from "./lib-guides.mjs";

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

// Enhancements (enchants / gems / consumables) — the lib-guides shared contract. All
// three sections live on the SAME stats page harvestSpec already fetches (recon
// 2026-08-18: zero extra requests). Each section is bounded id-anchor .. next
// guide-section-title exactly like parseMethodPriorities — but consumables is the LAST
// section on the page, so every capture also stops at </article> (or the tail swallows
// the guide-next/footer markup). Item ids come from item=(\d+) ONLY: hrefs still carry
// stale /beta/ and /ptr/ namespaces and the SAME item flips namespace between specs,
// so the numeric id is the only stable key. A section or row the page lacks is real
// absence, never a parse failure — Holy Paladin genuinely publishes no augment rune.
const sectionOf = (html, id) => {
  const m = html.match(new RegExp(
    `id="${id}"[\\s\\S]*?(?=<div class="guide-section-title"|<\\/article>|$)`, "i"));
  return m ? m[0].replace(/^[^>]*>\s*<h2[^>]*>[\s\S]*?<\/h2>\s*<\/div>/i, "") : null;
};
const itemLinks = (frag) => {
  const raw = [...String(frag ?? "").matchAll(/<a\b[^>]*\bitem=(\d+)[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => ({ id: m[1], name: textOnly(m[2]) })).filter((c) => c.name);
  // Method sometimes splits one recommendation across two adjacent anchors sharing an
  // id (Prot Warrior's "…Ren'dore" + "i" — adversarial review 2026-08-18): keep one
  // candidate per id with the LONGEST name, and never emit fragment names (<4 chars).
  const byId = new Map();
  for (const c of raw) {
    const prev = byId.get(c.id);
    if (!prev || c.name.length > prev.name.length) byId.set(c.id, c);
  }
  return [...byId.values()].filter((c) => c.name.length >= 4);
};
// A labeled row is '<p><strong>Label:</strong> <a>…</a>…'. The bold element varies
// (<strong> mostly, <b> sometimes) and the colon sits inside or outside it.
function labeledRows(section) {
  const rows = [];
  for (const p of String(section ?? "").matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const label = p[1].match(/^\s*<(strong|b)\b[^>]*>\s*([^<:]{1,40}?)\s*(?::\s*<\/\1>|<\/\1>\s*:)/i);
    if (label) rows.push([normApostrophes(label[2]), p[1]]);
  }
  return rows;
}
// Leftover prose once the label and the links are gone is a real note — unless it is
// only the "or" / "/" joiner between alternative candidates.
const rowNote = (body) => {
  const t = textOnly(body.replace(/^\s*<(strong|b)\b[^>]*>[\s\S]*?<\/\1>/i, " ")
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, " "));
  return t && !/^(?:or|and|[/,+&\s.])+$/i.test(t) ? t : null;
};
const CONSUMABLE_LABELS = { food: "food", flask: "flask", "health potion": "healthPotion",
  "mana potion": "manaPotion", "combat potion": "combatPotion", "weapon oil": "weaponBuff",
  "weapon buff": "weaponBuff", rune: "augmentRune", "augment rune": "augmentRune", tea: "tea" };

export function parseMethodEnhancements(html) {
  const out = {};
  const enchants = [];
  for (const [label, body] of labeledRows(sectionOf(html, "enchants"))) {
    const slot = canonicalSlot(label);   // Shoulder(s)/Rings/Boots/Weapon variance
    const candidates = itemLinks(body);
    if (!slot || !candidates.length) continue;
    const note = rowNote(body);
    enchants.push({ slot, candidates, ...(note ? { note } : {}) });
  }
  if (enchants.length) out.enchants = enchants;

  // Gems markup is spec-inconsistent (pure unlabeled prose on some specs, bold-labeled
  // rows with the link nested INSIDE the <b> on others), so never key on labels — a
  // label-first parser silently misses the prose shape entirely. Collect every item
  // link in the section and classify by NAME: the once-per-character meta gem is
  // always an "… Eversong Diamond". The section's prose rides along as the note.
  const gemSection = sectionOf(html, "gems");
  const gemLinks = itemLinks(gemSection);
  if (gemLinks.length) {
    const isUnique = (c) => /eversong diamond/i.test(c.name) || /diamond\s*$/i.test(c.name);
    const unique = gemLinks.filter(isUnique);
    const filler = gemLinks.filter((c) => !isUnique(c));
    const note = textOnly(gemSection);
    out.gems = { ...(unique.length ? { unique } : {}), ...(filler.length ? { filler } : {}),
      ...(note ? { note } : {}) };
  }

  // Consumables: labeled rows like enchants. A bare "Potions" row is classified by the
  // ITEM NAME, never the label — the healer's Potions row holds a MANA potion.
  const buckets = new Map();
  const add = (key, cands) => {
    if (cands.length) buckets.set(key, [...(buckets.get(key) ?? []), ...cands]);
  };
  for (const [label, body] of labeledRows(sectionOf(html, "consumables"))) {
    const key = label.toLowerCase().trim().replace(/s$/, "");
    const cands = itemLinks(body);
    if (!cands.length) continue;
    if (key === "potion") {
      add("manaPotion", cands.filter((c) => /mana/i.test(c.name)));
      add("combatPotion", cands.filter((c) => !/mana/i.test(c.name)));
    } else if (CONSUMABLE_LABELS[key]) add(CONSUMABLE_LABELS[key], cands);
  }
  if (buckets.size) out.consumables = Object.fromEntries(
    ENHANCEMENT_CONSUMABLE_KEYS.filter((k) => buckets.has(k)).map((k) => [k, buckets.get(k)]));
  return Object.keys(out).length ? out : null;
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
  const enhancements = statHtml ? parseMethodEnhancements(statHtml) : null;
  validateEnhancements(enhancements, `${spec.spec} ${spec.class}`);
  return { guideUrl: `${base}/gearing`,
    published: methodDate(bisHtml || statHtml), priorities, bis,
    ...(enhancements ? { enhancements } : {}) };
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
