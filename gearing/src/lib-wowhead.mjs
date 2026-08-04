// Shared Wowhead PTR helpers: fetch a guide page, pull its item IDs, and read each
// item's own tooltip. Every harvester uses this so the parsing rules live in one place.
//
// Nothing is inferred. Fields absent from the tooltip stay null.

export const TOOLTIP = (id) => `https://nether.wowhead.com/ptr/tooltip/item/${id}?locale=0`;

const UA = { "user-agent": "Mozilla/5.0 (wow-s2-gearing harvester)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const ARMOR = ["Cloth", "Leather", "Mail", "Plate"];
export const WEAPON = ["Dagger", "Sword", "Axe", "Mace", "Staff", "Bow", "Gun", "Crossbow",
  "Fist Weapon", "Polearm", "Warglaive", "Warglaives", "Wand", "Shield", "Miscellaneous"];
export const SLOTS = ["Head", "Shoulder", "Chest", "Hands", "Legs", "Waist", "Feet", "Wrist",
  "Back", "Neck", "Finger", "Trinket", "Main Hand", "One-Hand", "Two-Hand",
  "Off Hand", "Held In Off-hand", "Ranged"];

function primaryLabel(stats) {
  const values = ["Agi", "Str", "Int"].filter((stat) => stats.has(stat));
  return values.length === 3 ? "Any" : values.join("/") || null;
}

export async function getText(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
    } catch { /* retry */ }
    await sleep(400 * (i + 1));
  }
  return null;
}

export function itemIdsFrom(html) {
  return [...new Set([...html.matchAll(/\/ptr\/item=(\d+)\//g)].map((m) => m[1]))];
}

// Wowhead guide pages contain the rendered guide, navigation, recommendation cards,
// class-specific bonus-roll tables, and Gatherer metadata. Scanning every link therefore
// assigns unrelated items to the guide's boss or dungeon. Read the JSON-encoded guide body
// and select only the semantic loot tables instead.
function guideMarkupFrom(html) {
  const match = /WH\.markup\.printHtml\(\s*("(?:\\.|[^"\\])*")\s*,\s*"guide-body"/.exec(html);
  if (!match) throw new Error("guide-body markup not found");
  return JSON.parse(match[1]);
}

function markupBlocks(source, tag) {
  const token = new RegExp(`\\[(/?)${tag}(?:\\s[^\\]]*)?\\]`, "gi");
  const out = [];
  let depth = 0;
  let start = -1;
  for (let match; (match = token.exec(source));) {
    if (!match[1]) {
      if (depth++ === 0) start = match.index;
    } else if (depth && --depth === 0) {
      out.push({ start, raw: source.slice(start, token.lastIndex) });
    }
  }
  return out;
}

const plainMarkup = (value) => value.replace(/\[\/?[^\]]+\]/g, " ").replace(/\s+/g, " ").trim();
const markupItemIds = (value) => [...new Set(
  [...value.matchAll(/\[item=(\d+)(?=[\s\]])/gi)].map((m) => m[1]),
)];

function markupHeadings(markup) {
  return [...markup.matchAll(/\[h([1-6])(?:\s[^\]]*)?\]([\s\S]*?)\[\/h\1\]/gi)]
    .map((m) => ({ start: m.index, text: plainMarkup(m[2]) }));
}

function tableHeaderRows(table) {
  return markupBlocks(table, "tr")
    .map((row) => markupBlocks(row.raw, "td").map((cell) => plainMarkup(cell.raw)))
    .filter((row) => row.includes("Item"));
}

function nearestHeading(headings, position) {
  return [...headings].reverse().find((heading) => heading.start < position)?.text ?? "";
}

export function dungeonLootIdsFrom(html) {
  const markup = guideMarkupFrom(html);
  const headings = markupHeadings(markup);
  const tables = markupBlocks(markup, "table").filter((table) => {
    const section = nearestHeading(headings, table.start);
    const headers = tableHeaderRows(table.raw);
    return /loot table|gear drops/i.test(section)
      && headers.some((row) => row.some((cell) => /^(Boss(?: Drop)?|Dropped By|Source)$/i.test(cell)));
  });
  if (!tables.length) throw new Error("dungeon loot table not found");
  const ids = markupItemIds(tables.map((table) => table.raw).join("\n"));
  if (!ids.length) throw new Error("dungeon loot table contains no items");
  return ids;
}

export function raidBossLootIdsFrom(html) {
  const markup = guideMarkupFrom(html);
  const headings = markupHeadings(markup);
  const tables = markupBlocks(markup, "table").filter((table) => {
    const section = nearestHeading(headings, table.start);
    const headers = tableHeaderRows(table.raw);
    return /^Gear$/i.test(section)
      && headers.some((row) => row.includes("Item") && row.includes("Slot"));
  });
  if (!tables.length) throw new Error("raid boss loot table not found");
  const ids = markupItemIds(tables.map((table) => table.raw).join("\n"));
  if (!ids.length) throw new Error("raid boss loot table contains no items");
  return ids;
}

function tooltipLines(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    // Wowhead sometimes starts a block immediately after a stat without a <br>
    // (for example, "+98 Mastery<div ...>Classes:"). Split opening block tags
    // too so the final stat and class restriction remain independently parseable.
    .replace(/<(tr|td|table|div|p|th)\b[^>]*>/gi, "\n")
    .replace(/<\/(tr|td|table|div|p|th)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .split("\n").map((s) => s.trim()).filter(Boolean);
}

export function parseItem(json, id) {
  const lines = tooltipLines(json.tooltip);
  const primaryStats = new Set();
  const it = {
    id, name: json.name, quality: json.quality, icon: json.icon || null,
    slot: null, type: null, primary: null, secondaries: [], secondaryRatings: {},
    tertiaries: [], tertiaryRatings: {}, sockets: [],
    ilvl: null, track: null, effect: null, effectKind: null, effects: [],
    classes: null, droppedBy: null, uniqueEquipped: false,
    // Wowhead's own tooltip markup, kept verbatim so the app can render a real
    // tooltip offline instead of calling out to their script at view time.
    html: json.tooltip,
  };

  for (const raw of lines) {
    // slot / class-list / "Unique-Equipped" are glued onto the binding line
    if (/Unique-Equipped/i.test(raw)) it.uniqueEquipped = true;
    const L = raw.replace(/^(Binds when picked up|Binds when equipped|Unique-Equipped|Unique)\s*/g, "").trim();
    let m;
    if ((m = raw.match(/^Item Level\s*(\d+)/))) { it.ilvl = +m[1]; continue; }
    if ((m = raw.match(/^Upgrade Level:\s*(\w+)\s*(\d+\/\d+)/))) { it.track = `${m[1]} ${m[2]}`; continue; }
    if ((m = raw.match(/^Dropped by:\s*(.+)$/))) { it.droppedBy = m[1]; continue; }
    if ((m = L.match(/^Classes:\s*(.+)$/))) { it.classes = m[1].split(",").map((s) => s.trim()); continue; }
    if (!it.slot && SLOTS.includes(L)) { it.slot = L; continue; }
    if (!it.type && (ARMOR.includes(L) || WEAPON.includes(L))) { it.type = L; continue; }
    if ((m = L.match(/^\+\s*([\d,]+)\s+\[?([A-Za-z, ]+?)\]?$/))) {
      const amount = Number(m[1].replace(/,/g, ""));
      const v = m[2].trim();
      if (/Intellect|Agility|Strength/.test(v)) {
        if (/Agility/.test(v)) primaryStats.add("Agi");
        if (/Strength/.test(v)) primaryStats.add("Str");
        if (/Intellect/.test(v)) primaryStats.add("Int");
        it.primary = primaryLabel(primaryStats);
        continue;
      }
      if (/Critical Strike|Haste|Mastery|Versatility/.test(v)) {
        const stat = v.replace("Critical Strike", "Crit")
          .replace("Versatility", "Vers").replace("Mastery", "Mast");
        it.secondaries.push(stat);
        it.secondaryRatings[stat] = (it.secondaryRatings[stat] || 0) + amount;
        continue;
      }
      if (/^(Leech|Avoidance|Speed)$/.test(v)) {
        it.tertiaries.push(v);
        it.tertiaryRatings[v] = (it.tertiaryRatings[v] || 0) + amount;
      }
    }
    if (L === "Indestructible" && !it.tertiaries.includes(L)) it.tertiaries.push(L);
    if ((m = L.match(/^(?:Empty\s+)?(?:(Prismatic|Tinker|Cogwheel|Meta)\s+)?Socket$/i)))
      it.sockets.push(m[1] ? `${m[1]} Socket` : "Socket");
  }

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(Use|Equip):/);
    if (!m) continue;
    const buf = [lines[i]];
    for (let z = i + 1; z < lines.length; z++) {
      if (/^(Requires Level|Sell Price|Dropped by|Durability|"|Use:|Equip:)/.test(lines[z])) break;
      buf.push(lines[z]);
    }
    // Wowhead leaves the spell's scaling expression in the text, e.g. "(353491 * 1)" or
    // "(874 * 6 * 1)". Drop the meaningless "* 1" factors and unwrap parentheses that then
    // hold a single number. Anything genuinely compound is left alone rather than "simplified"
    // into a number we would be inventing.
    const effect = buf.join(" ")
      .replace(/^(Use|Equip):\s*/, "")
      .replace(/\s*\*\s*1\s*(?=[)\/])/g, "")        // "874 * 6 * 1)" -> "874 * 6)"
      .replace(/\(\s*1\s*\*\s*/g, "(")               // "(1 * 3200)"   -> "(3200)"
      .replace(/\(\s*([\d,]+(?:\.\d+)?)\s*\)/g, "$1") // "(353491)"     -> "353491"
      .replace(/(\d)\s*\/\s*(\d)/g, "$1 / $2")        // tidy spacing left by the above
      .replace(/\s+/g, " ").trim();
    it.effects.push({ kind: m[1], text: effect });
    if (!it.effect) {
      it.effectKind = m[1];
      it.effect = effect;
    }
  }
  return it;
}

const PARSED_SECONDARIES = new Set(["Crit", "Haste", "Mast", "Vers"]);
const PARSED_TERTIARIES = new Set(["Leech", "Avoidance", "Speed", "Indestructible"]);
const PARSED_PRIMARIES = new Set(["Agi", "Int", "Str", "Agi/Int", "Agi/Str", "Str/Int", "Any"]);
const PARSED_ARMOR_SLOTS = new Set(["Head", "Shoulder", "Chest", "Wrist", "Hands", "Waist", "Legs", "Feet"]);
const PARSED_NEUTRAL_SLOTS = new Set(["Neck", "Finger", "Back", "Trinket"]);
const PARSED_WEAPON_SLOTS = new Set(["Main Hand", "One-Hand", "Two-Hand", "Off Hand", "Held In Off-hand", "Ranged"]);
const PARSED_ARMOR_PRIMARY = { Cloth: "Int", Leather: "Agi/Int", Mail: "Agi/Int", Plate: "Str/Int" };

// Parser-level guard used by harvesters before they replace a known-good dataset.
export function parsedItemIssues(item) {
  const issues = [];
  const secondaries = item.secondaries || [];
  const ratings = item.secondaryRatings || {};
  if (secondaries.some((stat) => !PARSED_SECONDARIES.has(stat))
    || new Set(secondaries).size !== secondaries.length)
    issues.push("invalid secondary list");
  if (Object.keys(ratings).some((stat) => !secondaries.includes(stat) || !PARSED_SECONDARIES.has(stat))
    || secondaries.some((stat) => !Number.isFinite(ratings[stat]) || ratings[stat] <= 0))
    issues.push("secondary ratings do not match the list");
  const tertiaries = item.tertiaries || [];
  const tertiaryRatings = item.tertiaryRatings || {};
  if (tertiaries.some((stat) => !PARSED_TERTIARIES.has(stat))
    || new Set(tertiaries).size !== tertiaries.length
    || Object.keys(tertiaryRatings).some((stat) => !tertiaries.includes(stat)
      || !PARSED_TERTIARIES.has(stat) || stat === "Indestructible")
    || tertiaries.some((stat) => stat !== "Indestructible"
      && (!Number.isFinite(tertiaryRatings[stat]) || tertiaryRatings[stat] <= 0)))
    issues.push("tertiary ratings do not match the list");
  if (!Array.isArray(item.sockets) || item.sockets.some((socket) => typeof socket !== "string" || !socket))
    issues.push("malformed socket metadata");
  if (item.primary != null && !PARSED_PRIMARIES.has(item.primary)) issues.push("invalid primary label");
  if (item.primary === "Any" && !PARSED_NEUTRAL_SLOTS.has(item.slot))
    issues.push("Any primary outside a neutral slot");
  if (PARSED_ARMOR_SLOTS.has(item.slot) && !ARMOR.includes(item.type)) issues.push("missing armor type");
  if (ARMOR.includes(item.type) && item.primary !== PARSED_ARMOR_PRIMARY[item.type])
    issues.push("wrong armor primary policy");
  if (PARSED_WEAPON_SLOTS.has(item.slot) && !item.primary) issues.push("weapon lacks primary policy");
  if (item.slot && !PARSED_NEUTRAL_SLOTS.has(item.slot) && item.slot !== "Held In Off-hand" && !item.primary)
    issues.push("equippable item lacks primary policy");
  if (typeof item.uniqueEquipped !== "boolean") issues.push("missing unique-equipped flag");
  if (!Array.isArray(item.effects)
    || item.effects.some((effect) => !["Use", "Equip"].includes(effect.kind) || !effect.text))
    issues.push("malformed effects");
  return issues;
}

export async function fetchItems(ids, { concurrency = 6, pause = 120 } = {}) {
  const out = [];
  for (let i = 0; i < ids.length; i += concurrency) {
    const chunk = await Promise.all(ids.slice(i, i + concurrency).map(async (id) => {
      const t = await getText(TOOLTIP(id));
      if (!t) return null;
      try { return parseItem(JSON.parse(t), id); } catch { return null; }
    }));
    out.push(...chunk.filter(Boolean));
    await sleep(pause);
  }
  return out;
}
