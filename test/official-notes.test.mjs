import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OFFICIAL_NOTE_SOURCES, sectionsForPost, postReceipt, pendingLedger, validateOfficialNotes, officialNotesView, noteHash } from "../src/official-notes.mjs";
import { fetchOfficialNotes, fetchNoteJSON } from "../src/fetch-official-notes.mjs";
import { checkOfficialNotes } from "../src/check-official-notes.mjs";
import { buildPayload, PHASES } from "../src/render.mjs";
import { loadData } from "../src/validate.mjs";

const NOW = new Date("2026-09-05T12:00:00Z");
/* The 12.1.5 notes-only preview was retired at the 12.1.5 launch (its config row, ledger
   block and contract entry left together). The era "ptr" staff-posts lane stays in the
   code for the next patch's preview, so these tests exercise it through a fixture source
   with the retired row's exact shape, injected wherever the real config would be read.
   The real config is pinned separately at the end of this file. */
const LIVE = OFFICIAL_NOTE_SOURCES.find(s => s.id === "live-hotfixes");
const LIVE_1215 = OFFICIAL_NOTE_SOURCES.find(s => s.id === "live-hotfixes-1215");
const PREVIEW = Object.freeze({ id: "ptr-preview", topicId: 2344395, slug: "midnight-1215-ptr-development-notes", patch: "12.1.5", era: "ptr", mode: "staff-posts" });
const SOURCES = Object.freeze([LIVE, PREVIEW]);
const roster = [{ class: "Mage", spec: "Fire" }, { class: "Mage", spec: "Frost" }, { class: "Warrior", spec: "Protection" }];
const classHTML = `<p><strong>September 4, 2026</strong></p><p><strong>Classes</strong></p><ul><li><strong>Mage</strong><ul><li><strong>Fire</strong><ul><li>Damage increased by 5%.</li></ul></li></ul></li></ul>`;
/* The 12.1.5 compilation's fixture post is dated inside its own window (since 2026-10-13)
   and cited by its own feed entry below. NOW gates receipt times only, not section dates. */
const defaultHTML = source => source.topicId === LIVE_1215.topicId ? classHTML.replace("September 4, 2026", "October 23, 2026") : classHTML;
function post(source, html = defaultHTML(source), number = 1) {
  return { id: source.topicId + number, topic_id: source.topicId, post_number: number, staff: true, version: 3,
    created_at: "2026-09-03T16:00:00Z", updated_at: "2026-09-05T01:00:00Z", cooked: html };
}
function evidence(sources = SOURCES) {
  return { schemaVersion: 1, checkedAt: NOW.toISOString(), sources: Object.fromEntries(sources.map(s => [s.id, {
    topicId: s.topicId, patch: s.patch, era: s.era, status: "success", posts: [postReceipt(post(s), s, roster)] }])) };
}
const ptrBuilds = { builds: [{ date: "2026-09-04", kind: "hotfix", label: "Official compilation: https://us.forums.blizzard.com/en/wow/t/hotfixes/2336376/1.", specsAffected: ["Fire Mage"], highlights: ["Fire Mage — Damage increased by 5%."] },
  { date: "2026-10-23", kind: "hotfix", realm: "live", label: "Official compilation: https://us.forums.blizzard.com/en/wow/t/hotfixes/2382684/1.", specsAffected: ["Fire Mage"], highlights: ["Fire Mage — Damage increased by 5%."] }] };
function resolved(e = evidence(), sources = SOURCES) {
  const ledger = pendingLedger(e, undefined, sources);
  for (const source of Object.values(ledger.sources)) for (const p of source.posts) for (const section of p.sections) {
    section.resolution = source.era === "live" ? { disposition: "applied", reason: "Verified exact feed entry.", references: [{ kind: "build", date: section.date, highlight: ptrBuilds.builds[0].highlights[0] }] }
      : { disposition: "applied", reason: "Notes-only review.", notes: [{ specKey: "Mage|Fire", summary: "The proposed change raises damage." }] };
  }
  return ledger;
}
const check = (ledger, e = evidence(), baseLedger = ledger) => checkOfficialNotes({ ledger, evidence: e, baseLedger, specs: roster, ptrBuilds, now: NOW, sources: SOURCES });
const validate = (ledger, options = {}) => validateOfficialNotes(ledger, { specs: roster, ptrBuilds, now: NOW, ...options, sources: SOURCES });
const pending = (e, previous) => pendingLedger(e, previous, SOURCES);

test("official notes preserve class/spec/hero nesting, dates, entities, and category boundaries", () => {
  const html = classHTML.replace("Damage increased by 5%.", "Flames &amp; sparks.<ul><li>Hero talent</li></ul>") + `<p><strong>Player versus Player</strong></p><ul><li><strong>Warrior</strong><ul><li><strong>Protection</strong><ul><li>Shield changes.</li></ul></li></ul></li></ul><p><strong>Items</strong></p><ul><li>Other changes.</li></ul>`;
  const sections = sectionsForPost(post(LIVE, html), LIVE, roster);
  assert.equal(sections.length, 2);
  assert.deepEqual(sections[0].specKeys, ["Mage|Fire"]);
  assert.match(sections[0].text, /Flames & sparks\.\n      - Hero talent/);
  assert.equal(sections[1].date, "2026-09-04");
  assert.equal(sections[1].category, "Player versus Player");
  assert.notEqual(sections[0].sha256, sections[1].sha256);
});

// Verbatim Warrior block of topic 2344395 post 4 (version 1, 2026-09-15): two of the
// 09-03 Execute lines are struck through as withdrawn and only the +30% line stands.
const struckWarriorHTML = `<h2><strong>CLASSES</strong></h2>
<ul>
<li><strong>WARRIOR</strong>
<ul>
<li><strong>Protection</strong>
<ul>
<li><em>Developers’ notes: Last week’s changes to Execute were not sufficient to accomplish our goals, and we believe that the scope of changes necessary for those goals are better suited to a major update, so we’re restoring Execute to it’s previous functionality with a damage boost in 12.1.5, and are refocusing on 12.2 and 13.0 for further Protection changes.</em></li>
<li><s>Execute no longer consumes additional Rage for additional damage.</s></li>
<li><s>Execute damage increased by 100%.</s></li>
<li>Execute damage increased by 30%.</li>
</ul>
</li>
</ul>
</li>
</ul>`;

test("struck-through lines are marked reverted, never read as current; live lines are unchanged", () => {
  const source = PREVIEW, [section] = sectionsForPost(post(source, struckWarriorHTML, 4), source, roster);
  const struck = ["Execute no longer consumes additional Rage for additional damage.", "Execute damage increased by 100%."];
  assert.deepEqual(section.specKeys, ["Warrior|Protection"]);
  assert.equal(section.text, [
    "- WARRIOR",
    "  - Protection",
    "    - Developers’ notes: Last week’s changes to Execute were not sufficient to accomplish our goals, and we believe that the scope of changes necessary for those goals are better suited to a major update, so we’re restoring Execute to it’s previous functionality with a damage boost in 12.1.5, and are refocusing on 12.2 and 13.0 for further Protection changes.",
    `    - [reverted: ${struck[0]}]`,
    `    - [reverted: ${struck[1]}]`,
    "    - Execute damage increased by 30%.",
  ].join("\n"));
  // Each withdrawn line occurs exactly once, and only inside its marker.
  for (const line of struck) assert.equal(section.text.split(line).length - 1, 1);
  // Removing the struck items leaves every live line byte-identical.
  const live = sectionsForPost(post(source, struckWarriorHTML.replace(/<li><s>.*?<\/s><\/li>\n/g, ""), 4), source, roster)[0].text;
  assert.equal(live, section.text.split("\n").filter(l => !l.includes("[reverted: ")).join("\n"));
  assert.doesNotMatch(live, /reverted/);
  // <del>/<strike> read the same way; an inline strike is delimited so the kept value stays readable.
  const inline = `<p><strong>Classes</strong></p><ul><li><strong>Mage</strong><ul><li><strong>Fire</strong><ul><li>Damage increased by <del>10%</del> 15%.</li><li><strike>Old line.</strike></li><li>Kept<s> </s> line.</li></ul></li></ul></li></ul>`;
  assert.match(sectionsForPost(post(source, inline), source, roster)[0].text, /- Damage increased by \[reverted: 10%\] 15%\.\n\s+- \[reverted: Old line\.\]\n\s+- Kept line\.$/);
});

test("a struck heading keeps the section's identity; the marker lives only in the hashed text", () => {
  // Headings are identity (id, date, category, class, spec scope) and must match on the
  // unmarked text: marking them once widened a struck spec to its whole class, renamed a
  // struck class to "[reverted: Warrior]", and dropped a struck class outside Classes.
  const source = LIVE, wide = [...roster, { class: "Warrior", spec: "Arms" }, { class: "Warrior", spec: "Fury" }];
  const identity = html => sectionsForPost(post(source, html), source, wide).map(s => [s.id, s.date, s.category, s.class, s.specKeys.join(",")]);
  const strike = (html, text) => html.replace(`<strong>${text}</strong>`, `<strong><s>${text}</s></strong>`);
  for (const category of ["Classes", "Player versus Player"]) {
    const base = `<p><strong>September 4, 2026</strong></p><p><strong>${category}</strong></p><ul><li><strong>Warrior</strong><ul><li><strong>Protection</strong><ul><li>Shield changes.</li></ul></li></ul></li></ul>`;
    assert.deepEqual(identity(base), [[`2336376:1:2026-09-04:${category.toLowerCase().replace(/ /g, "-")}:warrior:1`, "2026-09-04", category, "Warrior", "Warrior|Protection"]]);
    for (const heading of ["September 4, 2026", category, "Warrior", "Protection"]) assert.deepEqual(identity(strike(base, heading)), identity(base), `${category}: struck ${heading}`);
    for (const heading of ["Warrior", "Protection"]) assert.match(sectionsForPost(post(source, strike(base, heading)), source, wide)[0].text, new RegExp(`- \\[reverted: ${heading}\\]\\n`));
  }
});

test("unknown Classes items are reviewable; layout loss and non-staff posts fail closed", () => {
  const source = LIVE;
  const unknown = sectionsForPost(post(source, `<h3>Classes</h3><ul><li>Unexpected new category<ul><li>A change</li></ul></li></ul>`), source, roster);
  assert.equal(unknown.length, 1); assert.deepEqual(unknown[0].specKeys, []);
  assert.throws(() => sectionsForPost(post(source, `<h3>Classes</h3><div>Unrecognized structure</div>`), source, roster), /no class sections/);
  assert.throws(() => sectionsForPost({ ...post(source), staff: false }, source, roster), /identity/);
});

test("unchanged section receipts retain review; edited old dated sections reopen it", () => {
  const e = evidence(), old = resolved(e), next = structuredClone(e);
  next.checkedAt = "2026-09-05T13:00:00Z";
  next.sources["live-hotfixes"].posts[0].version++;
  next.sources["live-hotfixes"].posts[0].sections[0].sha256 = noteHash("changed old note");
  const ledger = pending(next, old);
  assert.equal(ledger.sources["live-hotfixes"].posts[0].sections[0].resolution.disposition, "unresolved");
  assert.deepEqual(ledger.sources["ptr-preview"].posts[0].sections[0].resolution, old.sources["ptr-preview"].posts[0].sections[0].resolution);
  assert.ok(check(ledger, next, old).errors.some(e => e.includes("unresolved")));
});

test("removed sections leave tombstones and cannot disappear from the review gate", () => {
  const e = evidence(), old = resolved(e);
  e.sources["live-hotfixes"].posts[0].sections = [];
  const ledger = pending(e, old), source = ledger.sources["live-hotfixes"];
  assert.equal(source.removedSections.length, 1);
  assert.equal(source.removedSections[0].resolution.disposition, "unresolved");
  assert.equal(officialNotesView(ledger, SOURCES).unresolved.length, 1);
  source.removedSections = [];
  assert.ok(check(ledger, e, old).errors.some(e => e.includes("removed-section")));
  source.removedSections = pending(e, old).sources["live-hotfixes"].removedSections;
  source.removedSections[0].resolution = { disposition: "irrelevant", reason: "Reviewed removal; the original feed is a dated historical receipt." };
  assert.deepEqual(check(ledger, e, old).errors, []);
  assert.deepEqual(pending(e, ledger).sources["live-hotfixes"].removedSections, source.removedSections);
});

test("new class sections, stale receipts and source identity edits cannot pass", () => {
  const e = evidence(), ledger = resolved(e);
  assert.deepEqual(check(ledger, e).errors, []);
  const extra = structuredClone(e.sources["ptr-preview"].posts[0].sections[0]); extra.id += ":new";
  e.sources["ptr-preview"].posts[0].sections.push(extra);
  assert.ok(check(ledger, e).errors.some(e => e.includes("inventory")));
  e.checkedAt = "2026-08-01T00:00:00Z";
  assert.ok(check(ledger, e).errors.some(e => e.includes("stale")));
  const wrong = evidence(); wrong.sources["ptr-preview"].topicId++;
  assert.ok(check(ledger, wrong).errors.some(e => e.includes("identity")));
});

test("unreachable sources retain committed evidence without advancing their dates", () => {
  const e = evidence(), old = resolved(e);
  e.sources["live-hotfixes"] = { ...e.sources["live-hotfixes"], status: "unreachable", details: "HTTP 403", posts: [] };
  const ledger = pending(e, old);
  assert.deepEqual(ledger.sources["live-hotfixes"], old.sources["live-hotfixes"]);
  assert.equal(check(ledger, e, old).warnings.length, 1);
  assert.deepEqual(check(ledger, e, old).errors, []);
  ledger.sources["live-hotfixes"].checkedAt = "2026-09-05T12:01:00Z";
  assert.ok(check(ledger, e, old).errors.some(e => e.includes("unchanged")));
});

test("applied sections require complete spec coverage and references that still exist", () => {
  const ledger = resolved(), source = ledger.sources["live-hotfixes"].posts[0].sections[0];
  source.resolution.references[0].highlight = "Fire Mage — Not actually in the feed.";
  assert.ok(validate(ledger).some(e => e.includes("applied reference missing")));
  const preview = resolved(); preview.sources["ptr-preview"].posts[0].sections[0].specKeys.push("Mage|Frost");
  assert.ok(validate(preview).some(e => e.includes("preview omitted Mage|Frost")));
});

test("preview and live dispositions cannot cross lanes; exclusions are visibly separate", () => {
  const ledger = resolved();
  ledger.sources["ptr-preview"].posts[0].sections[0].resolution.references = [{ kind: "build" }];
  assert.ok(validate(ledger).some(e => e.includes("preview may not reference live")));
  const excluded = resolved(); excluded.sources["live-hotfixes"].posts[0].sections[0].resolution = { disposition: "irrelevant", reason: "Historical baseline; no backfill claim." };
  const view = officialNotesView(excluded, SOURCES);
  assert.equal(view.irrelevant, 1); assert.equal(view.applied, 1); assert.equal(view.previews.length, 1);
});

test("old PTR lines and same-day unrelated topics cannot resolve current live sections", () => {
  const ledger = resolved(), old = structuredClone(ptrBuilds);
  old.builds[0].date = "2026-06-18"; old.builds[0].kind = "build";
  ledger.sources["live-hotfixes"].posts[0].sections[0].resolution.references[0].date = "2026-06-18";
  assert.ok(validate(ledger, { ptrBuilds: old, requireResolved: true }).some(e => e.includes("applied reference missing")));
  const wrong = structuredClone(ptrBuilds); wrong.builds[0].label = "Unrelated: https://us.forums.blizzard.com/en/wow/t/hotfixes/2344395/1";
  assert.ok(validate(resolved(), { ptrBuilds: wrong, requireResolved: true }).some(e => e.includes("official topic")));
});

test("the notes lane leaves all 80 consensus/frozen forecast cells and model inputs identical", async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const data = await loadData(root);
  const without = buildPayload({ ...data, officialNotes: null });
  const withNotes = buildPayload({ ...data, officialNotes: resolved(evidence(OFFICIAL_NOTE_SOURCES), OFFICIAL_NOTE_SOURCES) });
  assert.equal(PHASES.ptr, null, "12.1.5 going live must not reopen the old forecast cycle");
  assert.deepEqual(withNotes.specs, without.specs);
  assert.deepEqual(withNotes.meta, without.meta);
  assert.deepEqual(withNotes.ptrBuilds, without.ptrBuilds);
  assert.equal(withNotes.officialNotes.previews.length, 0);
  // A ledger that still carried the retired preview block would render no preview either:
  // the view reads configured sources only (validation refuses such a ledger outright).
  assert.equal(buildPayload({ ...data, officialNotes: resolved() }).officialNotes.previews.length, 0);
});

test("collector checks all staff PTR pages while ignoring public replies and duplicate live replies", async () => {
  const seen = [];
  const fetchJSON = async url => {
    seen.push(url); const source = SOURCES.find(s => url.includes(String(s.topicId)));
    if (url.includes("/posts.json?")) return { post_stream: { posts: [{ ...post(source, classHTML, 2), id: source.topicId + 2 }, { ...post(source, classHTML, 3), staff: false, id: source.topicId + 3 }] } };
    return { id: source.topicId, title: source.era === "ptr" ? "Midnight: 12.1.5 PTR Development Notes" : "World of Warcraft: Midnight Hotfixes - September 4",
      post_stream: { posts: [post(source)], stream: [source.topicId + 1, source.topicId + 2, source.topicId + 3] } };
  };
  const result = await fetchOfficialNotes({ specs: roster, fetchJSON, now: NOW, sources: SOURCES });
  assert.equal(result.evidence.sources["live-hotfixes"].posts.length, 1);
  assert.equal(result.evidence.sources["ptr-preview"].posts.length, 2);
  assert.equal(seen.length, 3);
});

test("a changed patch title or failed source does not rewrite its existing ledger", async () => {
  const previous = resolved();
  const result = await fetchOfficialNotes({ specs: roster, previous, now: NOW, sources: SOURCES, fetchJSON: async url => {
    if (url.includes("2336376")) throw Error("HTTP 403");
    return { id: 2344395, title: "Midnight: 12.2 PTR Development Notes", post_stream: { posts: [post(PREVIEW)], stream: [] } };
  } });
  assert.deepEqual(result.pending, previous);
  assert.match(result.evidence.sources["ptr-preview"].details, /title/);
  assert.equal(result.evidence.sources["ptr-preview"].status, "invalid");
  assert.ok(check(result.pending, result.evidence, previous).errors.some(e => e.includes("needs review")));
});

test("HTTP failure halfway through a staff-post inventory is an outage, not a parser error", async () => {
  const result = await fetchOfficialNotes({ specs: roster, previous: resolved(), now: NOW, sources: SOURCES, fetchJSON: async url => {
    if (url.includes("/posts.json?")) throw Error("HTTP 503");
    const source = SOURCES.find(s => url.includes(String(s.topicId)));
    return { id: source.topicId, title: source.era === "ptr" ? "Midnight: 12.1.5 PTR Development Notes" : "World of Warcraft: Midnight Hotfixes",
      post_stream: { posts: [post(source)], stream: [source.topicId + 1, source.topicId + 2] } };
  } });
  assert.equal(result.evidence.sources["ptr-preview"].status, "unreachable");
  assert.deepEqual(check(result.pending, result.evidence, resolved()).errors, []);
});

/* The real configuration: the 12.1 live compilation, joined after the 12.1.5 launch by the
   compilation Blizzard opened for 12.1.5 (topic 2382684, 2026-10-15; runbook Phase C1).
   The preview stays retired. */
test("live config: both hotfix compilations are configured, the preview stays retired, and the refresh contract names exactly them", async () => {
  assert.deepEqual(OFFICIAL_NOTE_SOURCES.map(s => s.id), ["live-hotfixes", "live-hotfixes-1215"]);
  assert.ok(!OFFICIAL_NOTE_SOURCES.some(s => s.topicId === PREVIEW.topicId), "the retired 12.1.5 PTR notes thread must not return");
  // `since` is the 12.1.5 launch date (PHASES.livePatch.since), the floor for applied references.
  assert.deepEqual({ ...LIVE_1215 }, { id: "live-hotfixes-1215", topicId: 2382684, slug: "world-of-warcraft-midnight-hotfixes", patch: "12.1.5", era: "live", mode: "compilation", since: "2026-10-13" });
  // Both edits are one owner change: a contract entry with no config row would read as a
  // missing receipt in the freshness heartbeat, and a config row with no contract entry
  // would never age.
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const contract = JSON.parse(await readFile(path.join(root, "data/required-sources.json"), "utf8"));
  assert.deepEqual(contract.officialNotes.sources, OFFICIAL_NOTE_SOURCES.map(s => s.id));
});

test("12.1.5 launch: a current ledger may not keep the retired block, while a base ledger that does is ignored", () => {
  const live = evidence(OFFICIAL_NOTE_SOURCES), current = resolved(live, OFFICIAL_NOTE_SOURCES);
  const stale = structuredClone(current); stale.sources["ptr-preview"] = resolved().sources["ptr-preview"];
  assert.ok(validateOfficialNotes(stale, { specs: roster, ptrBuilds, now: NOW }).includes("official-notes.json: unknown source ptr-preview"));
  // The launch-morning gate: HEAD's ledger still carries the block, the edited one does not.
  const gate = checkOfficialNotes({ ledger: current, evidence: live, baseLedger: stale, specs: roster, ptrBuilds, now: NOW });
  assert.deepEqual(gate, { errors: [], warnings: [] });
  // Evidence from an older collector is refused rather than half-read: the pre-launch one
  // (live + preview) has no receipt for the 12.1.5 compilation, and the launch-day one
  // (live only) has the wrong source inventory.
  const older = e => checkOfficialNotes({ ledger: current, evidence: e, baseLedger: stale, specs: roster, ptrBuilds, now: NOW }).errors;
  assert.ok(older(evidence()).includes("live-hotfixes-1215: evidence identity/status invalid"));
  assert.ok(older(evidence([LIVE])).includes("Official-note evidence source inventory differs"));
});

test("12.1.5 compilation: its first ledger block passes the gate only once every section is reviewed", () => {
  const live = evidence(OFFICIAL_NOTE_SOURCES), current = resolved(live, OFFICIAL_NOTE_SOURCES);
  const base = structuredClone(current); delete base.sources["live-hotfixes-1215"];
  assert.ok(validateOfficialNotes(base, { specs: roster, ptrBuilds, now: NOW }).includes("official-notes.json: missing live-hotfixes-1215"));
  const gate = ledger => checkOfficialNotes({ ledger, evidence: live, baseLedger: base, specs: roster, ptrBuilds, now: NOW });
  assert.deepEqual(gate(current), { errors: [], warnings: [] });
  // The collector's block for a source the base ledger lacks marks every section unresolved,
  // so configuring the row without reviewing its sections cannot publish.
  const unreviewed = pendingLedger(live, base);
  assert.equal(unreviewed.sources["live-hotfixes-1215"].posts[0].sections[0].resolution.disposition, "unresolved");
  assert.ok(gate(unreviewed).errors.some(e => e.includes("unresolved")));
});

test("live config: the collector requests both compilation topics and nothing else", async () => {
  const seen = [];
  const result = await fetchOfficialNotes({ specs: roster, now: NOW, fetchJSON: async url => {
    seen.push(url);
    const source = OFFICIAL_NOTE_SOURCES.find(s => url === `https://us.forums.blizzard.com/en/wow/t/${s.topicId}.json`);
    return { id: source.topicId, title: "World of Warcraft: Midnight Hotfixes - October 23", post_stream: { posts: [post(source)], stream: [source.topicId + 1] } };
  } });
  assert.deepEqual(seen, [2336376, 2382684].map(id => `https://us.forums.blizzard.com/en/wow/t/${id}.json`));
  assert.deepEqual(Object.values(result.evidence.sources).map(s => s.status), ["success", "success"]);
  assert.deepEqual(Object.keys(result.pending.sources), ["live-hotfixes", "live-hotfixes-1215"]);
});

test("HTTP transport rejects challenge HTML, wrong origin and oversized JSON", async () => {
  await assert.rejects(fetchNoteJSON("https://us.forums.blizzard.com/test", async () => new Response("challenge", { status: 403 })), /HTTP 403/);
  await assert.rejects(fetchNoteJSON("https://us.forums.blizzard.com/test", async () => new Response("challenge", { headers: { "content-type": "text/html" } })), /Discourse JSON/);
  await assert.rejects(fetchNoteJSON("https://us.forums.blizzard.com/test", async () => {
    const r = new Response("{}", { headers: { "content-type": "application/json" } }); Object.defineProperty(r, "url", { value: "https://example.com/" }); return r;
  }), /redirect origin/);
  await assert.rejects(fetchNoteJSON("https://us.forums.blizzard.com/test", async () => new Response(" ".repeat(4_000_001), { headers: { "content-type": "application/json" } })), /4 MB/);
});
