// Wowhead guide harvester (Phase B, gearing-s2-scope G4).
//
//   node src/harvest-guide-wowhead.mjs [--force] [--spec "Frost Mage"]
//
// Two pages per spec, patterns verified live 2026-08-18:
//   BiS:      https://www.wowhead.com/guide/classes/<class>/<spec>/bis-gear   (role-less!
//             the scope brief's bis-gear-pve-<role> 404s)
//   priority: https://www.wowhead.com/guide/classes/<class>/<spec>/stat-priority-pve-<role>
//             with role = dps | healer | tank
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
  normalizeStatRun, parseSoftCaps } from "./lib-guides.mjs";

const kebab = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const roleSlug = (r) => (/tank/i.test(r) ? "tank" : /heal/i.test(r) ? "healer" : "dps");

async function fetchWowhead(url) {
  // curl FIRST: Wowhead 403s Node fetch by TLS fingerprint but serves curl (2026-08-18).
  const direct = await fetchTextCurl(url);
  if (direct && direct.includes("WH.markup.printHtml")) return direct;
  const proxied = await fetchText(`https://r.jina.ai/${url}`, { headers: { "x-return-format": "html" } });
  return proxied && proxied.includes("WH.markup.printHtml") ? proxied : null;
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

async function harvestSpec(spec, rosters) {
  const cls = kebab(spec.class), sp = kebab(spec.spec);
  const bisUrl = `https://www.wowhead.com/guide/classes/${cls}/${sp}/bis-gear`;
  const statUrl = `https://www.wowhead.com/guide/classes/${cls}/${sp}/stat-priority-pve-${roleSlug(spec.role)}`;
  const bisHtml = await fetchWowhead(bisUrl);
  const statHtml = await fetchWowhead(statUrl);
  if (!bisHtml && !statHtml) return null;
  const priorities = statHtml ? parseWowheadPriorities(guideBody(statHtml) || "") : [];
  const bisBody = bisHtml ? guideBody(bisHtml) : null;
  const bis = bisBody ? parseWowheadBis(bisBody, gathererNames(bisHtml), rosters) : [];
  if (!priorities.length && !bis.length)
    throw new Error("pages fetched but neither priorities nor BiS parsed — recipe drift?");
  return {
    guideUrl: bisUrl,
    published: guideDate(bisHtml || statHtml),
    author: guideAuthor(bisHtml || statHtml),
    priorities, bis,
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
