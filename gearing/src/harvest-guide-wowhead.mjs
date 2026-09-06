// Wowhead guide harvester (Phase B, gearing-s2-scope G4).
//
//   node src/harvest-guide-wowhead.mjs [--force] [--spec "Frost Mage"]
//
// Three pages per spec, patterns verified live 2026-08-18:
//   BiS:      https://www.wowhead.com/guide/classes/<class>/<spec>/bis-gear   (role-less!
//             the scope brief's bis-gear-pve-<role> 404s)
//   priority: https://www.wowhead.com/guide/classes/<class>/<spec>/stat-priority-pve-<role>
//             with role = dps | healer | tank
//   enhance:  https://www.wowhead.com/guide/classes/<class>/<spec>/enchants-gems-pve-<role>
//             (enchants / gems / consumables — the shared enhancements lane, see
//             parseWowheadEnhancements below). The sibling page carries its OWN
//             dateModified/author distinct from the BiS page's; the record has no
//             per-page date slot, so `published` deliberately stays the BiS/stat
//             page's date and the sibling's is not recorded.
//
// The guide body is NOT rendered HTML in this transport: it is Wowhead's own guide markup
// embedded as the first JS string argument of WH.markup.printHtml("...") — structured,
// ad-free, JSON-parseable. Items are [item=ID], optionally with original-item= (catalyzed;
// a MARKUP attribute, not a URL query — changed shape vs the 08-12 recon) and bonus=
// segments; boss sources are [url guide=<numericId>]<Name>[/url]; professions appear as
// bare [skill=NNN]. Item names resolve from the page's own WH.Gatherer.addData(3,...)
// blocks. Only the "Overall BiS" tab is a real Slot|Item|Source table — the raid/M+
// sections are icon-badge strips with no slot and no source, and are deliberately not
// harvested (a candidate without a slot cannot join the model).
// Direct fetch worked from a residential IP on 2026-08-18; r.jina.ai with
// "x-return-format: html" is the documented fallback (never trust a bare 403 as absence).
import { runGuideHarvest } from "./lib-guide-runner.mjs";
import { canonicalRosters, fetchText, fetchTextCurl, canonicalSlot, normApostrophes, resolveDropSource,
  normalizeStatRun, parseSoftCaps, ENHANCEMENT_CONSUMABLE_KEYS, validateEnhancements }
  from "./lib-guides.mjs";

const kebab = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const roleSlug = (r) => (/tank/i.test(r) ? "tank" : /heal/i.test(r) ? "healer" : "dps");

async function fetchWowhead(url) {
  // curl FIRST: Wowhead 403s Node fetch by TLS fingerprint but serves curl (2026-08-18).
  let direct;
  try { direct = await fetchTextCurl(url); }
  catch { /* the documented HTML proxy is the fallback transport */ }
  if (direct === null) return null; // origin HTTP 404, verified absence
  if (direct && direct.includes("WH.markup.printHtml")) return direct;
  const proxied = await fetchText(`https://r.jina.ai/${url}`, { headers: { "x-return-format": "html" } });
  if (proxied && proxied.includes("WH.markup.printHtml")) return proxied;
  throw new Error(`Wowhead guide unavailable or markup missing: ${url}`);
}

/** The inline printHtml body (the call whose first arg is a string literal, not getPageData). */
export function guideBody(html) {
  for (const m of html.matchAll(/WH\.markup\.printHtml\(\s*("(?:\\.|[^"\\])*")/g)) {
    const body = JSON.parse(m[1]);
    if (body.length > 500) return body; // the sidebar call carries a short literal or none
  }
  return null;
}

/** Item names from the page's Gatherer payloads: WH.Gatherer.addData(3, <env>, {...}). */
export function gathererNames(html) {
  const names = new Map();
  for (const m of html.matchAll(/WH\.Gatherer\.addData\(3,\s*\d+,\s*(\{[\s\S]*?\})\);/g)) {
    try {
      const data = JSON.parse(m[1]);
      for (const [id, entry] of Object.entries(data))
        if (entry && entry.name_enus) names.set(id, normApostrophes(entry.name_enus));
    } catch { /* non-item Gatherer block */ }
  }
  return names;
}

/** Spell names (weapon imbues) from the page's Gatherer payloads:
 *  WH.Gatherer.addData(6, <env>, {...}) — same name_enus shape as the item payloads
 *  (verified 2026-08-18: 433568 = "Rite of Sanctification" on the HPal enchants page). */
export function gathererSpellNames(html) {
  const names = new Map();
  for (const m of html.matchAll(/WH\.Gatherer\.addData\(6,\s*\d+,\s*(\{[\s\S]*?\})\);/g)) {
    try {
      const data = JSON.parse(m[1]);
      for (const [id, entry] of Object.entries(data))
        if (entry && entry.name_enus) names.set(id, normApostrophes(entry.name_enus));
    } catch { /* non-spell Gatherer block */ }
  }
  return names;
}

export function guideDate(html) {
  const m = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})T/);
  if (m) return m[1];
  const visible = html.match(/guide-content-byline-changed[^>]*>Updated:\s*<span[^>]*>(\d{4})\/(\d{2})\/(\d{2})/);
  return visible ? `${visible[1]}-${visible[2]}-${visible[3]}` : null;
}
export function guideAuthor(html) {
  return (html.match(/<a href="\/author\/([^"]+)">/) || [])[1] || null;
}

/** The Overall BiS [table class=grid] rows out of the markup body. */
export function parseWowheadBis(body, names, rosters) {
  const tabs = body.match(/\[tabs[^\]]*name=bis_items\]([\s\S]*?)\[\/tabs\]/i);
  const scopeText = tabs ? tabs[1] : body;
  const rows = [];
  for (const tr of scopeText.matchAll(/\[tr\]([\s\S]*?)\[\/tr\]/gi)) {
    const tds = [...tr[1].matchAll(/\[td[^\]]*\]([\s\S]*?)\[\/td\]/gi)].map((m) => m[1]);
    if (tds.length < 3) continue;
    if (/\[b\]\s*Slot\s*\[\/b\]/i.test(tds[0])) continue; // header row
    const slot = canonicalSlot(normApostrophes(tds[0].replace(/\[[^\]]*\]/g, " ")));
    const item = tds[1].match(/\[item=(\d+)(?:\s+original-item=(\d+))?(?:\s+bonus=[0-9:]+)?\s*\]/i);
    if (!slot || !item) continue;
    const catalyzedFrom = item[2] || null;
    // A catalyzed [item=X original-item=Y] names the CATALYZED result X built from base Y;
    // the base item is what actually drops, so the candidate identity is the base.
    const itemId = catalyzedFrom || item[1];
    const sourceCell = tds[2];
    const urlText = (sourceCell.match(/\[url[^\]]*\]([\s\S]*?)\[\/url\]/i) || [])[1];
    const skill = sourceCell.match(/\[skill=(\d+)\]/i);
    // A cell whose only content is entity markup ([npc=ID] / [zone=ID]) strips to
    // nothing — keep the raw markup verbatim so the reference survives in the data.
    const strippedText = normApostrophes((urlText ?? sourceCell).replace(/\[[^\]]*\]/g, " "));
    const sourceText = strippedText || sourceCell.trim();
    const source = skill && !urlText
      ? { sourceKind: "crafted", boss: null, dungeon: null, droppedBy: null }
      : resolveDropSource(sourceText, itemId, rosters);
    rows.push({ list: "overall", slot, itemId,
      itemName: names.get(itemId) || null,
      catalyzedResultId: catalyzedFrom ? item[1] : undefined,
      sourceText, ...source });
  }
  return rows;
}

/** Scoped priorities from the stat-priority sub-guide's markup: [ol] lists anchored to the
 *  nearest preceding hero-talent symbol and bold label. Container markup varies per spec —
 *  anchor on the [ol], never the container (recon 2026-08-18). */
export function parseWowheadPriorities(body) {
  const out = [];
  for (const ol of body.matchAll(/\[ol\]([\s\S]*?)\[\/ol\]/gi)) {
    const items = [...ol[1].matchAll(/\[li[^\]]*\]([\s\S]*?)\[\/li\]/gi)]
      .map((m) => normApostrophes(m[1].replace(/\[[^\]]*\]/g, " ")));
    const run = normalizeStatRun(items);
    if (run.secondaries.length < 2) continue; // not a stat list
    const before = body.slice(Math.max(0, ol.index - 900), ol.index);
    // LAST preceding hero symbol/name wins — the previous section's header can still sit
    // inside the window (BM Hunter: ol#2's window holds both pack-leader and dark-ranger).
    const heroMatches = [...before.matchAll(/\[symbol=wow-hero-talent-([a-z0-9-]+)\]/gi)];
    const hero = heroMatches.length ? heroMatches[heroMatches.length - 1][1] : null;
    const afterHero = heroMatches.length
      ? before.slice(heroMatches[heroMatches.length - 1].index) : before;
    const heroName = hero ? ((afterHero.match(/\[color=[^\]]+\]([^[]+)\[\/color\]/i) || [])[1] || null) : null;
    // A profile label ("All Situations:" / "Single-Target:") only counts when it sits
    // AFTER the hero header — otherwise prose bolds masquerade as scopes (Holy Paladin).
    const afterHeader = afterHero.replace(/^[\s\S]*?stat priority\[\/b\]\[\/center\]/i, "");
    const boldLabels = [...afterHeader.matchAll(/\[b\]([^[]{2,40}?):\s*\[\/b\]/gi)].map((m) => m[1].trim());
    const profile = boldLabels.length ? boldLabels[boldLabels.length - 1] : null;
    const label = [heroName && normApostrophes(heroName), profile && normApostrophes(profile)]
      .filter(Boolean).join(" · ") || "General";
    out.push({ label, heroTalentSlug: hero, primary: run.primary,
      secondaries: run.secondaries, leadsWithItemLevel: run.leadsWithItemLevel,
      softCaps: parseSoftCaps(items.join(" > ")), raw: items.join(" > ") });
  }
  // De-duplicate identical (label, order) pairs — repeated sections restate lists.
  const seen = new Set();
  return out.filter((p) => {
    const k = p.label + "|" + p.secondaries.join(">");
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

// ---- Enhancements lane (enchants / gems / consumables) --------------------------------
// The sibling page's markup body holds TWO [table class=grid] tables, each anchored under
// a stable [h2]: under [h2 toc="Gems & Enchants"] a Slot|Best grid whose rows are per-slot
// enchants PLUS two gem rows — the metagem row's SLOT CELL is the gem's own name (match
// /Diamond$/, never a fixed name list) and an "Other Gems" row of filler gems — and under
// [h2 toc=Consumables] a Type|Best grid (Flask, Combat/Stats Potion, Mana Potion, Health
// Potion, Weapon Buff, Augment Rune, Food, Tea). Live-markup traps (2026-08-18): doubled
// [/td][/td] closes (parse leniently), slot vocabulary drift ("Helmet", "Ring " with a
// trailing space), and Best cells holding MULTIPLE alternatives across three separators
// (/, +, raw newline) with hero-talent conditionals in [color=] tags ("[item=X] as Herald
// / [spell=Y] as Lightsmith") — every alternative becomes an ordered candidate and the
// conditional text becomes the note; a first-item-only parse silently drops real
// recommendations. [h3 toc=...] prose subsections below each table carry alternatives and
// caveats; a subsection joins the note ONLY when it names an id absent from its lane's
// table candidates (cheaper augment runes, an alternative metagem — real added
// information), so restating prose never bloats the notes.

const CONSUMABLE_TYPES = [
  [/^flasks?$/i, "flask"],
  [/^(?:combat|stats?|dps) potions?$/i, "combatPotion"], // "Combat Potion" and "Stats Potion" are one lane
  [/^mana potions?$/i, "manaPotion"],
  [/^health potions?$/i, "healthPotion"],
  [/^(?:weapon (?:buff|oil|imbue)s?|oils?)$/i, "weaponBuff"], // buffs/imbues normalize into weaponBuff
  [/^(?:augment )?runes?$/i, "augmentRune"],
  [/^food$/i, "food"],
  [/^teas?$/i, "tea"],
];

/** [tr]/[td] rows of the FIRST [table class=grid] in a section, header row dropped.
 *  Non-greedy matching tolerates the live doubled [/td][/td] closes: the cell ends at
 *  the first close and the stray extra never matches a [td opener. */
function gridRows(sectionText) {
  const table = sectionText.match(/\[table[^\]]*\]([\s\S]*?)\[\/table\]/i);
  if (!table) return [];
  const rows = [];
  for (const tr of table[1].matchAll(/\[tr\]([\s\S]*?)\[\/tr\]/gi)) {
    const tds = [...tr[1].matchAll(/\[td[^\]]*\]([\s\S]*?)\[\/td\]/gi)].map((m) => m[1]);
    if (tds.length < 2) continue;
    if (/\[b\]\s*(?:Slot|Type)\s*\[\/b\]/i.test(tds[0])) continue;
    rows.push(tds);
  }
  return rows;
}

const cellText = (td) => normApostrophes(td.replace(/\[[^\]]*\]/g, " "));

/** Every [item=]/[spell=] ref in a cell, in the page's published order. Names are the
 *  contract's requirement, and the Gatherer resolves 100% of refs on a healthy page —
 *  a miss is recipe drift and throws rather than shipping a nameless candidate. */
function cellCandidates(cell, names, spellNames) {
  const out = [];
  for (const m of cell.matchAll(/\[(item|spell)=(\d+)[^\]]*\]/gi)) {
    const kind = m[1].toLowerCase();
    const id = m[2];
    const name = (kind === "item" ? names : spellNames).get(id);
    if (!name) throw new Error(`enhancements: no Gatherer name for ${kind} ${id} — recipe drift?`);
    out.push(kind === "item" ? { id, name } : { spellId: id, name });
  }
  return out;
}

/** Cell text left once refs, markup, and the alternative separators (/, +) are gone —
 *  non-empty means the cell carries conditional prose ("as Herald … as Lightsmith"). */
const cellResidual = (cell) => cell
  .replace(/\[(?:item|spell)=\d+[^\]]*\]/gi, " ")
  .replace(/\[[^\]]*\]/g, " ")
  .replace(/[/+\s]+/g, " ")
  .trim();

/** Readable rendering for notes: refs become their resolved names, markup drops, [li]
 *  items separate with ";". Cell mode turns raw newlines into " / " so multi-line
 *  alternative cells keep their separation ("… as Herald / … as Lightsmith"). */
function renderMarkup(text, names, spellNames, { cell = false } = {}) {
  let t = String(text ?? "");
  if (cell) t = t.replace(/\s*\r?\n\s*/g, " / ");
  t = t
    .replace(/\[item=(\d+)[^\]]*\]/gi, (_, id) => names.get(id) || `item ${id}`)
    .replace(/\[spell=(\d+)[^\]]*\]/gi, (_, id) => spellNames.get(id) || `spell ${id}`)
    .replace(/\[\/li\]/gi, "; ")
    .replace(/\[[^\]]*\]/g, " ");
  return normApostrophes(t).replace(/(\s*;)+\s*$/, "");
}

/** [h3 toc=...] subsections of a section: { label: <toc anchor>, text: <body up to the
 *  next h3/h2/hr> }. The toc anchors are the stable vocabulary — identical across specs
 *  while the visible headings and Type cells drift. */
function subSections(sectionText) {
  const out = [];
  const re = /\[h3[^\]]*?toc=(?:"([^"]+)"|([^\s\]]+))[^\]]*\][\s\S]*?\[\/h3\]([\s\S]*?)(?=\[h3|\[h2|\[hr\]|$)/gi;
  for (const m of sectionText.matchAll(re)) out.push({ label: m[1] ?? m[2], text: m[3] });
  return out;
}

const addsNewIds = (text, known) => {
  for (const m of text.matchAll(/\[(?:item|spell)=(\d+)/gi)) if (!known.has(m[1])) return true;
  return false;
};

/**
 * The enhancements block out of the sibling page's markup body — shared contract in
 * lib-guides.mjs ("Enhancements lane"). Returns null for a body that fails the era
 * gate (must self-identify "[b]Midnight Season 2[/b]") or parses nothing — a recorded
 * absence, never a spec failure; the caller simply omits the block. Structural drift
 * (an unrecognizable slot, an unresolvable ref) still throws loudly.
 */
export function parseWowheadEnhancements(body, names, spellNames) {
  if (!body || !/\[b\]Midnight Season 2\[\/b\]/.test(body)) return null;
  const consumIdx = body.search(/\[h2[^\]]*?toc=["']?Consumables/i);
  const enchIdx = body.search(/\[h2[^\]]*?toc=["']?Gems/i); // toc="Gems & Enchants"
  const enchSection = enchIdx >= 0
    ? body.slice(enchIdx, consumIdx > enchIdx ? consumIdx : undefined) : "";
  const consumSection = consumIdx >= 0 ? body.slice(consumIdx) : "";

  const enchants = [];
  const gems = {};
  const gemNotes = [];
  for (const tds of gridRows(enchSection)) {
    const label = cellText(tds[0]);
    const candidates = cellCandidates(tds[1], names, spellNames);
    if (!candidates.length) continue;
    const note = cellResidual(tds[1]) ? renderMarkup(tds[1], names, spellNames, { cell: true }) : null;
    if (/diamond$/i.test(label)) { // metagem row: the slot cell is the gem's own name
      gems.unique = [...(gems.unique ?? []), ...candidates];
      if (note) gemNotes.push(note);
    } else if (/^(other )?gems?$/i.test(label)) {
      // Some authors label a socket-gem row bare "Gems" (Fire Mage, full harvest
      // 2026-08-18) — and such a row can HOLD the unique-equipped meta diamond, which
      // must never land in the socket-everywhere Filler lane (adversarial review:
      // 4 specs displayed an Eversong Diamond as filler). Classify per candidate.
      const uni = candidates.filter((c) => /diamond$/i.test(c.name));
      const fil = candidates.filter((c) => !/diamond$/i.test(c.name));
      if (uni.length) gems.unique = [...(gems.unique ?? []), ...uni];
      if (fil.length) gems.filler = [...(gems.filler ?? []), ...fil];
      if (note) gemNotes.push(note);
    } else {
      // Author slot vocabulary drifts well beyond the two sampled fixtures (full-harvest
      // finds, 2026-08-18): "Helmet", "Weapons (2h & Dual-Wield)", "Weapon - Main Hand".
      // Normalize locally — lib-guides stays untouched: strip parentheticals, then a
      // "Weapon[s] - X"/"Weapon[s]" family collapses to its hand (default Main Hand).
      let slotLabel = label.replace(/\s*\([^)]*\)\s*/g, " ").trim()
        .replace(/^helmets?$/i, "Helm");
      const weaponish = slotLabel.match(/^weapons?(?:\s*[-–—]\s*(.+))?$/i);
      if (weaponish) slotLabel = weaponish[1] ? weaponish[1].trim() : "Weapon";
      const slot = canonicalSlot(slotLabel);
      if (!slot) {
        // Transcribe, never die: an unmappable slot row survives as a verbatim note.
        // The old hard throw here cost SIX SPECS their entire gear records (the error
        // escaped into the runner's absent-with-reason lane) — drift must stay visible
        // without costing data.
        gemNotes.push(`Unmapped enchant row "${label}": ` + renderMarkup(tds[1], names, spellNames, { cell: true }));
        continue;
      }
      const existing = enchants.find((e) => e.slot === slot);
      if (existing) {
        existing.candidates.push(...candidates);
        if (note) existing.note = [existing.note, note].filter(Boolean).join(" · ");
      } else {
        enchants.push({ slot, candidates, ...(note ? { note } : {}) });
      }
    }
  }

  const consumables = {};
  const consumNotes = [];
  for (const tds of gridRows(consumSection)) {
    const label = cellText(tds[0]);
    const candidates = cellCandidates(tds[1], names, spellNames);
    if (!candidates.length) continue;
    const key = (CONSUMABLE_TYPES.find(([re]) => re.test(label)) ?? [])[1];
    if (!key || !ENHANCEMENT_CONSUMABLE_KEYS.includes(key)) {
      // A Type row outside the contract vocabulary cannot be keyed honestly — keep it
      // verbatim in the note rather than guessing a key or dropping the row.
      consumNotes.push(`${label}: ${renderMarkup(tds[1], names, spellNames, { cell: true })}`);
      continue;
    }
    consumables[key] = [...(consumables[key] ?? []), ...candidates];
    if (cellResidual(tds[1]))
      consumNotes.push(`${label}: ${renderMarkup(tds[1], names, spellNames, { cell: true })}`);
  }

  // Prose subsections that ADD ids join the notes (see the lane comment above).
  const idsOf = (cands) => new Set((cands ?? []).map((c) => c.id ?? c.spellId));
  const gemIds = new Set([...idsOf(gems.unique), ...idsOf(gems.filler)]);
  const consumIds = new Set(Object.values(consumables).flatMap((c) => [...idsOf(c)]));
  for (const { label, text } of subSections(enchSection)) {
    if (/^gems$/i.test(label)) {
      if ((gems.unique || gems.filler) && addsNewIds(text, gemIds))
        gemNotes.push(renderMarkup(text, names, spellNames));
    } else if (/^weapon$/i.test(label)) {
      const mh = enchants.find((e) => e.slot === "Main Hand");
      if (mh && addsNewIds(text, idsOf(mh.candidates)))
        mh.note = [mh.note, renderMarkup(text, names, spellNames)].filter(Boolean).join(" · ");
    }
  }
  for (const { label, text } of subSections(consumSection))
    if (addsNewIds(text, consumIds))
      consumNotes.push(`${label}: ${renderMarkup(text, names, spellNames)}`);

  const enh = {};
  if (enchants.length) enh.enchants = enchants;
  if (gems.unique || gems.filler) {
    if (gemNotes.length) gems.note = gemNotes.join(" · ");
    enh.gems = gems;
  }
  if (Object.keys(consumables).length) {
    if (consumNotes.length) consumables.note = consumNotes.join(" · ");
    enh.consumables = consumables;
  }
  return Object.keys(enh).length ? enh : null;
}

async function harvestSpec(spec, rosters) {
  const cls = kebab(spec.class), sp = kebab(spec.spec);
  const bisUrl = `https://www.wowhead.com/guide/classes/${cls}/${sp}/bis-gear`;
  const statUrl = `https://www.wowhead.com/guide/classes/${cls}/${sp}/stat-priority-pve-${roleSlug(spec.role)}`;
  const enhUrl = `https://www.wowhead.com/guide/classes/${cls}/${sp}/enchants-gems-pve-${roleSlug(spec.role)}`;
  const bisHtml = await fetchWowhead(bisUrl);
  const statHtml = await fetchWowhead(statUrl);
  if (!bisHtml && !statHtml) return null;
  const priorities = statHtml ? parseWowheadPriorities(guideBody(statHtml) || "") : [];
  const bisBody = bisHtml ? guideBody(bisHtml) : null;
  const bis = bisBody ? parseWowheadBis(bisBody, gathererNames(bisHtml), rosters) : [];
  if (!priorities.length && !bis.length)
    throw new Error("pages fetched but neither priorities nor BiS parsed — recipe drift?");
  // Enhancements sibling page: a 404'd fetch or a failed era-verify yields null and the
  // block is simply absent from the record — the file's absence pattern, never a spec
  // failure. Validation runs BEFORE attaching, so a malformed block can never ship.
  const enhHtml = await fetchWowhead(enhUrl);
  let enhancements = null;
  let enhancementsError = null;
  try {
    enhancements = enhHtml
      ? parseWowheadEnhancements(guideBody(enhHtml) || "", gathererNames(enhHtml),
        gathererSpellNames(enhHtml))
      : null;
    if (enhancements) validateEnhancements(enhancements, `wowhead/${spec.spec} ${spec.class}`);
  } catch (error) {
    // An enhancements failure may cost ONLY the enhancements block, never the spec's
    // gear record — the unguarded version of this call let a slot-vocabulary throw
    // escape into the runner's absent lane and dropped six specs' BiS data
    // (2026-08-18 full harvest). The error is recorded, not swallowed.
    enhancements = null;
    enhancementsError = error.message;
    console.warn(`   enhancements failed for ${spec.spec} ${spec.class} (gear record kept): ${error.message}`);
  }
  return {
    guideUrl: bisUrl,
    published: guideDate(bisHtml || statHtml),
    author: guideAuthor(bisHtml || statHtml),
    priorities, bis,
    ...(enhancements ? { enhancements } : {}),
    ...(enhancementsError ? { enhancementsError } : {}),
  };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  let rosters = null;
  await runGuideHarvest({ sourceId: "wowhead", sourceName: "Wowhead", dated: true,
    harvestSpec: async (spec, { raid, dungeons }) => {
      rosters = rosters || canonicalRosters(raid, dungeons);
      return harvestSpec(spec, rosters);
    } });
}
