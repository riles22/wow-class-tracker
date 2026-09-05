/* Official-note receipts and revision ledger. This is a notes-only lane: neither
   preview summaries nor dispositions are inputs to consensus or projections. */
import { createHash } from "node:crypto";

export const OFFICIAL_NOTE_SOURCES = Object.freeze([
  { id: "live-hotfixes", topicId: 2336376, slug: "world-of-warcraft-midnight-hotfixes", patch: "12.1", era: "live", mode: "compilation", since: "2026-08-18" },
  { id: "ptr-preview", topicId: 2344395, slug: "midnight-1215-ptr-development-notes", patch: "12.1.5", era: "ptr", mode: "staff-posts" },
]);
export const noteHash = value => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
export const noteUrl = (source, postNumber = 1) => `https://us.forums.blizzard.com/en/wow/t/${source.slug}/${source.topicId}/${postNumber}`;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const HASH = /^[a-f0-9]{64}$/;
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const decode = value => value.replace(/&(?:#(x[\da-f]+|\d+)|([a-z]+));/gi, (all, code, name) => {
  if (code) { const n = code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : +code; return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : all; }
  return ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ndash: "–", mdash: "—" })[name.toLowerCase()] ?? all;
});
const textOf = node => typeof node === "string" ? decode(node) : node.children.map(textOf).join(" ").replace(/\s+/g, " ").trim();

// A small structural reader, not a sanitizer or general HTML parser. Discourse's
// cooked lists are balanced; preserving nesting prevents a class's nested spec or
// hero-talent list from being confused with the next class. Unknown Classes-list
// items become unresolved sections instead of disappearing behind a roster regex.
export function noteTree(html) {
  const root = { tag: "root", children: [] }, stack = [root];
  for (const token of html.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g) ?? []) {
    if (token.startsWith("<!--")) continue;
    if (token.startsWith("</")) {
      const tag = /^<\/([\w-]+)/.exec(token)?.[1]?.toLowerCase();
      const i = stack.findLastIndex(n => n.tag === tag);
      if (i > 0) stack.length = i;
    } else if (token.startsWith("<")) {
      const tag = /^<([\w-]+)/.exec(token)?.[1]?.toLowerCase();
      if (!tag) continue;
      const node = { tag, children: [] }; stack.at(-1).children.push(node);
      if (!["br", "hr", "img", "meta", "link", "input", "source", "wbr"].includes(tag) && !token.endsWith("/>")) stack.push(node);
    } else stack.at(-1).children.push(token);
  }
  return root;
}
const directText = node => node.children.filter(n => typeof n === "string" || !["ul", "ol"].includes(n.tag)).map(textOf).join(" ").replace(/\s+/g, " ").trim();
const children = (node, tag) => node.children.filter(n => typeof n !== "string" && n.tag === tag);
function dateHeading(text) {
  if (!/^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/i.test(text)) return null;
  const n = Date.parse(text + " 00:00:00 UTC"); return Number.isFinite(n) ? new Date(n).toISOString().slice(0, 10) : null;
}
function outline(node, depth = 0) {
  if (typeof node === "string") return "";
  if (node.tag === "li") return `${"  ".repeat(depth)}- ${directText(node)}\n` + node.children.filter(n => typeof n !== "string" && ["ul", "ol"].includes(n.tag)).map(n => outline(n, depth + 1)).join("");
  return node.children.map(n => outline(n, depth)).join("");
}

export function sectionsForPost(post, source, roster) {
  if (!post.staff || !Number.isSafeInteger(post.post_number) || !Number.isSafeInteger(post.version) || !Number.isFinite(Date.parse(post.updated_at))) throw new Error("Official post identity/revision is missing");
  const classByName = new Map(roster.map(s => [s.class.toLowerCase(), s.class]));
  let date = post.created_at?.slice(0, 10), category = "", sections = [];
  const counts = new Map();
  for (const node of noteTree(post.cooked).children) {
    if (typeof node === "string") continue;
    if (/^(h[1-6]|p)$/.test(node.tag)) {
      const title = textOf(node), dated = dateHeading(title);
      if (dated) date = dated;
      else if (node.tag !== "p" || children(node, "strong").length) category = title;
    }
    if (!["ul", "ol"].includes(node.tag)) continue;
    for (const item of children(node, "li")) {
      const heading = directText(item), cls = classByName.get(heading.toLowerCase());
      if (!cls && !/^classes$/i.test(category)) continue;
      if (!ISO.test(date ?? "")) throw new Error("Class section has no source date");
      const classRoster = roster.filter(s => s.class === cls);
      const nestedItems = item.children.filter(n => typeof n !== "string" && ["ul", "ol"].includes(n.tag)).flatMap(n => children(n, "li"));
      const explicit = nestedItems.map(n => classRoster.find(s => s.spec.toLowerCase() === directText(n).toLowerCase())).filter(Boolean);
      const classWide = !explicit.length || nestedItems.some(n => !explicit.some(s => s.spec.toLowerCase() === directText(n).toLowerCase()));
      const specKeys = (classWide ? classRoster : explicit).map(s => `${s.class}|${s.spec}`).sort();
      const base = `${source.topicId}:${post.post_number}:${date}:${slug(category)}:${slug(cls ?? heading)}`;
      const count = (counts.get(base) ?? 0) + 1; counts.set(base, count);
      const text = outline(item).trim();
      sections.push({ id: `${base}:${count}`, date, category, class: cls ?? heading, specKeys, sha256: noteHash(text), text });
    }
  }
  // A changed layout cannot turn a page explicitly advertising class changes into
  // a successful empty receipt. A reviewer must update the structural reader.
  if (/\bclasses\b/i.test(post.cooked) && !sections.length) throw new Error("Classes heading found but no class sections parsed");
  return sections;
}

export function postReceipt(post, source, roster) {
  return { id: post.id, postNumber: post.post_number, version: post.version, updatedAt: post.updated_at,
    bodySha256: noteHash(post.cooked), sections: sectionsForPost(post, source, roster) };
}
export const sectionIdentity = section => Object.fromEntries(["id", "date", "category", "class", "specKeys", "sha256"].map(k => [k, section[k]]));
export const postIdentity = post => ({ id: post.id, postNumber: post.postNumber, version: post.version, updatedAt: post.updatedAt, bodySha256: post.bodySha256, sections: post.sections.map(sectionIdentity) });

export function pendingLedger(evidence, previous = { schemaVersion: 1, sources: {} }) {
  const ledger = structuredClone(previous);
  ledger.schemaVersion = 1; ledger.sources ??= {};
  for (const config of OFFICIAL_NOTE_SOURCES) {
    const receipt = evidence.sources[config.id];
    if (receipt?.status !== "success") continue;
    const old = new Map((ledger.sources[config.id]?.posts ?? []).flatMap(p => p.sections).map(s => [s.id, s]));
    const currentIds = new Set(receipt.posts.flatMap(p => p.sections).map(s => s.id));
    const removedSections = (ledger.sources[config.id]?.removedSections ?? []).filter(s => !currentIds.has(s.id));
    for (const section of old.values()) if (!currentIds.has(section.id)) removedSections.push({ ...sectionIdentity(section), removedAt: evidence.checkedAt,
      resolution: { disposition: "unresolved", reason: "Section removed from the official source; review retained tracker facts and explain the disposition." } });
    ledger.sources[config.id] = { topicId: config.topicId, patch: config.patch, era: config.era, checkedAt: evidence.checkedAt,
      removedSections,
      posts: receipt.posts.map(post => ({ ...postIdentity(post), sections: post.sections.map(section => {
        const prior = old.get(section.id);
        return { ...sectionIdentity(section), resolution: prior?.sha256 === section.sha256 ? prior.resolution : { disposition: "unresolved", reason: prior ? "Official section changed; review this revision." : "New official section; review required." } };
      }) })) };
  }
  return ledger;
}

function buildRefCovers(ref, key, ptrBuilds, section, config) {
  // Source-scoped launch boundary: a future PHASES flip cannot invalidate this
  // historical cycle's properly cited applied resolutions.
  if (ref.date !== section.date || ref.date < config.since) return false;
  const [cls, spec] = key.split("|");
  const build = ptrBuilds?.builds?.find(b => b.date === ref.date && b.highlights?.includes(ref.highlight));
  if (!build || !["hotfix", "build", "patch-notes"].includes(build.kind)) return false;
  const urls = [build.forumUrl, ...(build.label?.match(/https:\/\/us\.forums\.blizzard\.com\/[^\s)\]]+/g) ?? [])].filter(Boolean);
  const cited = urls.some(value => {
    try { const u = new URL(value.replace(/[.,;]+$/, "")); return u.origin === "https://us.forums.blizzard.com" && new RegExp(`^/en/wow/t/(?:[^/]+/)?${config.topicId}(?:/\\d+)?/?$`).test(u.pathname); } catch { return false; }
  });
  if (!cited) return false;
  return ref.highlight.startsWith(`${spec} ${cls}`) || ref.highlight.includes(`(${cls} — ${spec})`)
    || (ref.highlight.startsWith(`${cls} (`) && build.specsAffected?.some(s => s === `${spec} ${cls}` || s.startsWith(`${cls} (`)));
}

export function validateOfficialNotes(ledger, { specs = [], ptrBuilds, requireResolved = false, now = Date.now() } = {}) {
  if (ledger == null) return [];
  const errors = [], roster = new Set(specs.map(s => `${s.class}|${s.spec}`)), ids = new Set();
  const error = message => errors.push(`official-notes.json: ${message}`);
  const validTime = value => typeof value === "string" && Number.isFinite(Date.parse(value)) && Date.parse(value) <= +now + 300000;
  if (ledger.schemaVersion !== 1 || !ledger.sources || Array.isArray(ledger.sources)) return ["official-notes.json: unsupported schema"];
  for (const key of Object.keys(ledger.sources)) if (!OFFICIAL_NOTE_SOURCES.some(s => s.id === key)) error(`unknown source ${key}`);
  for (const config of OFFICIAL_NOTE_SOURCES) {
    const source = ledger.sources[config.id];
    if (!source) { error(`missing ${config.id}`); continue; }
    if (source.topicId !== config.topicId || source.patch !== config.patch || source.era !== config.era) error(`${config.id} source identity changed`);
    if (!validTime(source.checkedAt)) error(`${config.id} invalid checkedAt`);
    if (!Array.isArray(source.posts) || !source.posts.length) { error(`${config.id} missing official posts`); continue; }
    if (source.removedSections != null && !Array.isArray(source.removedSections)) error(`${config.id} malformed removed-section inventory`);
    for (const section of Array.isArray(source.removedSections) ? source.removedSections : []) {
      if (!section?.id?.startsWith(`${config.topicId}:`) || ids.has(section.id) || !HASH.test(section.sha256 ?? "") || !validTime(section.removedAt)) error(`${config.id}: invalid removed section`);
      ids.add(section.id);
      const r = section.resolution;
      if (!r || !["unresolved", "irrelevant"].includes(r.disposition) || typeof r.reason !== "string" || !r.reason.trim() || r.notes?.length || r.references?.length) error(`${section.id}: removal requires review and an exclusion reason`);
      if (requireResolved && r?.disposition === "unresolved") error(`${section.id}: unresolved removal — ${r.reason}`);
    }
    const postIds = new Set();
    for (const post of source.posts) {
      if (!Number.isSafeInteger(post.id) || !Number.isSafeInteger(post.postNumber) || post.postNumber < 1 || !Number.isSafeInteger(post.version) || post.version < 1 || !HASH.test(post.bodySha256 ?? "") || !validTime(post.updatedAt) || Date.parse(post.updatedAt) > Date.parse(source.checkedAt) || postIds.has(post.id)) error(`${config.id} invalid/duplicate post revision`);
      postIds.add(post.id);
      if (!Array.isArray(post.sections)) { error(`${config.id} missing section inventory`); continue; }
      for (const section of post.sections) {
        const label = section.id;
        if (typeof label !== "string" || ids.has(label) || !label.startsWith(`${config.topicId}:${post.postNumber}:`) || !ISO.test(section.date ?? "") || !HASH.test(section.sha256 ?? "") || typeof section.class !== "string" || typeof section.category !== "string") error(`${label}: malformed/duplicate section`);
        ids.add(label);
        if (!Array.isArray(section.specKeys) || section.specKeys.some(k => !roster.has(k)) || new Set(section.specKeys).size !== section.specKeys?.length) error(`${label}: invalid spec scope`);
        const r = section.resolution;
        if (!r || !["applied", "irrelevant", "unresolved"].includes(r.disposition) || typeof r.reason !== "string" || !r.reason.trim()) { error(`${label}: disposition and reason required`); continue; }
        if (r.disposition === "unresolved") { if (requireResolved) error(`${label}: unresolved — ${r.reason}`); continue; }
        if (r.disposition === "irrelevant") {
          if (r.notes?.length || r.references?.length) error(`${label}: irrelevant section may not publish notes or claim applied references`);
          continue;
        }
        if (!section.specKeys?.length) error(`${label}: applied section has no recognized spec scope`);
        if (config.era === "ptr") {
          if (r.references?.length) error(`${label}: preview may not reference live builds`);
          if (!Array.isArray(r.notes) || !r.notes.length || r.notes.some(n => !section.specKeys.includes(n.specKey) || typeof n.summary !== "string" || !n.summary.trim() || n.summary.length > 2400)) error(`${label}: invalid preview notes`);
          for (const key of section.specKeys ?? []) if (!r.notes?.some(n => n.specKey === key)) error(`${label}: preview omitted ${key}`);
          if (new Set((r.notes ?? []).map(n => n.specKey)).size !== r.notes?.length) error(`${label}: duplicate preview note`);
        } else {
          if (r.notes?.length) error(`${label}: live section cannot publish preview notes`);
          if (!Array.isArray(r.references) || !r.references.length) error(`${label}: applied live section needs build references`);
          for (const key of section.specKeys ?? []) if (!r.references?.some(ref => ref.kind === "build" && buildRefCovers(ref, key, ptrBuilds, section, config))) error(`${label}: applied reference missing for ${key} (needs matching date, live kind and official topic citation)`);
        }
      }
    }
  }
  return errors;
}

export function officialNotesView(ledger) {
  if (!ledger) return null;
  const previews = [], unresolved = [], sources = [];
  let applied = 0, irrelevant = 0;
  for (const config of OFFICIAL_NOTE_SOURCES) {
    const source = ledger.sources?.[config.id]; if (!source) continue;
    sources.push({ id: config.id, patch: config.patch, era: config.era, checkedAt: source.checkedAt, url: noteUrl(config) });
    for (const section of source.removedSections ?? []) {
      if (section.resolution?.disposition === "unresolved") unresolved.push({ patch: config.patch, era: config.era, date: section.date, class: section.class,
        url: noteUrl(config), reason: section.resolution.reason });
      else irrelevant++;
    }
    for (const post of source.posts ?? []) for (const section of post.sections ?? []) {
      const common = { patch: config.patch, era: config.era, date: section.date, class: section.class, url: noteUrl(config, post.postNumber), revision: post.version };
      const r = section.resolution;
      if (r?.disposition === "unresolved") unresolved.push({ ...common, reason: r.reason });
      else if (r?.disposition === "irrelevant") irrelevant++;
      else if (r?.disposition === "applied") {
        applied++;
        if (config.era === "ptr") for (const note of r.notes ?? []) previews.push({ ...common, ...note });
      }
    }
  }
  return { sources, previews, unresolved, applied, irrelevant };
}
