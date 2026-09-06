import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OFFICIAL_NOTE_SOURCES, sectionsForPost, postReceipt, pendingLedger, validateOfficialNotes, officialNotesView, noteHash } from "../src/official-notes.mjs";
import { fetchOfficialNotes, fetchNoteJSON } from "../src/fetch-official-notes.mjs";
import { checkOfficialNotes } from "../src/check-official-notes.mjs";
import { buildPayload, PHASES } from "../src/render.mjs";
import { loadData } from "../src/validate.mjs";

const NOW = new Date("2026-09-05T12:00:00Z");
const roster = [{ class: "Mage", spec: "Fire" }, { class: "Mage", spec: "Frost" }, { class: "Warrior", spec: "Protection" }];
const classHTML = `<p><strong>September 4, 2026</strong></p><p><strong>Classes</strong></p><ul><li><strong>Mage</strong><ul><li><strong>Fire</strong><ul><li>Damage increased by 5%.</li></ul></li></ul></li></ul>`;
function post(source, html = classHTML, number = 1) {
  return { id: source.topicId + number, topic_id: source.topicId, post_number: number, staff: true, version: 3,
    created_at: "2026-09-03T16:00:00Z", updated_at: "2026-09-05T01:00:00Z", cooked: html };
}
function evidence() {
  return { schemaVersion: 1, checkedAt: NOW.toISOString(), sources: Object.fromEntries(OFFICIAL_NOTE_SOURCES.map(s => [s.id, {
    topicId: s.topicId, patch: s.patch, era: s.era, status: "success", posts: [postReceipt(post(s), s, roster)] }])) };
}
const ptrBuilds = { builds: [{ date: "2026-09-04", kind: "hotfix", label: "Official compilation: https://us.forums.blizzard.com/en/wow/t/hotfixes/2336376/1.", specsAffected: ["Fire Mage"], highlights: ["Fire Mage — Damage increased by 5%."] }] };
function resolved(e = evidence()) {
  const ledger = pendingLedger(e);
  for (const source of Object.values(ledger.sources)) for (const p of source.posts) for (const section of p.sections) {
    section.resolution = source.era === "live" ? { disposition: "applied", reason: "Verified exact feed entry.", references: [{ kind: "build", date: "2026-09-04", highlight: ptrBuilds.builds[0].highlights[0] }] }
      : { disposition: "applied", reason: "Notes-only review.", notes: [{ specKey: "Mage|Fire", summary: "The proposed change raises damage." }] };
  }
  return ledger;
}
const check = (ledger, e = evidence(), baseLedger = ledger) => checkOfficialNotes({ ledger, evidence: e, baseLedger, specs: roster, ptrBuilds, now: NOW });

test("official notes preserve class/spec/hero nesting, dates, entities, and category boundaries", () => {
  const html = classHTML.replace("Damage increased by 5%.", "Flames &amp; sparks.<ul><li>Hero talent</li></ul>") + `<p><strong>Player versus Player</strong></p><ul><li><strong>Warrior</strong><ul><li><strong>Protection</strong><ul><li>Shield changes.</li></ul></li></ul></li></ul><p><strong>Items</strong></p><ul><li>Other changes.</li></ul>`;
  const sections = sectionsForPost(post(OFFICIAL_NOTE_SOURCES[0], html), OFFICIAL_NOTE_SOURCES[0], roster);
  assert.equal(sections.length, 2);
  assert.deepEqual(sections[0].specKeys, ["Mage|Fire"]);
  assert.match(sections[0].text, /Flames & sparks\.\n      - Hero talent/);
  assert.equal(sections[1].date, "2026-09-04");
  assert.equal(sections[1].category, "Player versus Player");
  assert.notEqual(sections[0].sha256, sections[1].sha256);
});

test("unknown Classes items are reviewable; layout loss and non-staff posts fail closed", () => {
  const source = OFFICIAL_NOTE_SOURCES[0];
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
  const pending = pendingLedger(next, old);
  assert.equal(pending.sources["live-hotfixes"].posts[0].sections[0].resolution.disposition, "unresolved");
  assert.deepEqual(pending.sources["ptr-preview"].posts[0].sections[0].resolution, old.sources["ptr-preview"].posts[0].sections[0].resolution);
  assert.ok(check(pending, next, old).errors.some(e => e.includes("unresolved")));
});

test("removed sections leave tombstones and cannot disappear from the review gate", () => {
  const e = evidence(), old = resolved(e);
  e.sources["live-hotfixes"].posts[0].sections = [];
  const pending = pendingLedger(e, old), source = pending.sources["live-hotfixes"];
  assert.equal(source.removedSections.length, 1);
  assert.equal(source.removedSections[0].resolution.disposition, "unresolved");
  assert.equal(officialNotesView(pending).unresolved.length, 1);
  source.removedSections = [];
  assert.ok(check(pending, e, old).errors.some(e => e.includes("removed-section")));
  source.removedSections = pendingLedger(e, old).sources["live-hotfixes"].removedSections;
  source.removedSections[0].resolution = { disposition: "irrelevant", reason: "Reviewed removal; the original feed is a dated historical receipt." };
  assert.deepEqual(check(pending, e, old).errors, []);
  assert.deepEqual(pendingLedger(e, pending).sources["live-hotfixes"].removedSections, source.removedSections);
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
  const pending = pendingLedger(e, old);
  assert.deepEqual(pending.sources["live-hotfixes"], old.sources["live-hotfixes"]);
  assert.equal(check(pending, e, old).warnings.length, 1);
  assert.deepEqual(check(pending, e, old).errors, []);
  pending.sources["live-hotfixes"].checkedAt = "2026-09-05T12:01:00Z";
  assert.ok(check(pending, e, old).errors.some(e => e.includes("unchanged")));
});

test("applied sections require complete spec coverage and references that still exist", () => {
  const ledger = resolved(), source = ledger.sources["live-hotfixes"].posts[0].sections[0];
  source.resolution.references[0].highlight = "Fire Mage — Not actually in the feed.";
  assert.ok(validateOfficialNotes(ledger, { specs: roster, ptrBuilds, now: NOW }).some(e => e.includes("applied reference missing")));
  const preview = resolved(); preview.sources["ptr-preview"].posts[0].sections[0].specKeys.push("Mage|Frost");
  assert.ok(validateOfficialNotes(preview, { specs: roster, ptrBuilds, now: NOW }).some(e => e.includes("preview omitted Mage|Frost")));
});

test("preview and live dispositions cannot cross lanes; exclusions are visibly separate", () => {
  const ledger = resolved();
  ledger.sources["ptr-preview"].posts[0].sections[0].resolution.references = [{ kind: "build" }];
  assert.ok(validateOfficialNotes(ledger, { specs: roster, ptrBuilds, now: NOW }).some(e => e.includes("preview may not reference live")));
  const excluded = resolved(); excluded.sources["live-hotfixes"].posts[0].sections[0].resolution = { disposition: "irrelevant", reason: "Historical baseline; no backfill claim." };
  const view = officialNotesView(excluded);
  assert.equal(view.irrelevant, 1); assert.equal(view.applied, 1); assert.equal(view.previews.length, 1);
});

test("old PTR lines and same-day unrelated topics cannot resolve current live sections", () => {
  const ledger = resolved(), old = structuredClone(ptrBuilds);
  old.builds[0].date = "2026-06-18"; old.builds[0].kind = "build";
  ledger.sources["live-hotfixes"].posts[0].sections[0].resolution.references[0].date = "2026-06-18";
  assert.ok(validateOfficialNotes(ledger, { specs: roster, ptrBuilds: old, requireResolved: true, now: NOW }).some(e => e.includes("applied reference missing")));
  const wrong = structuredClone(ptrBuilds); wrong.builds[0].label = "Unrelated: https://us.forums.blizzard.com/en/wow/t/hotfixes/2344395/1";
  assert.ok(validateOfficialNotes(resolved(), { specs: roster, ptrBuilds: wrong, requireResolved: true, now: NOW }).some(e => e.includes("official topic")));
});

test("notes-only preview leaves all 80 consensus/frozen forecast cells and model inputs identical", async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const data = await loadData(root);
  const without = buildPayload({ ...data, officialNotes: null });
  const withNotes = buildPayload({ ...data, officialNotes: resolved() });
  assert.equal(PHASES.ptr, null, "12.1.5 notes preview must not reopen the old forecast cycle");
  assert.deepEqual(withNotes.specs, without.specs);
  assert.deepEqual(withNotes.meta, without.meta);
  assert.deepEqual(withNotes.ptrBuilds, without.ptrBuilds);
  assert.equal(withNotes.officialNotes.previews.length, 1);
});

test("collector checks all staff PTR pages while ignoring public replies and duplicate live replies", async () => {
  const seen = [];
  const fetchJSON = async url => {
    seen.push(url); const source = OFFICIAL_NOTE_SOURCES.find(s => url.includes(String(s.topicId)));
    if (url.includes("/posts.json?")) return { post_stream: { posts: [{ ...post(source, classHTML, 2), id: source.topicId + 2 }, { ...post(source, classHTML, 3), staff: false, id: source.topicId + 3 }] } };
    return { id: source.topicId, title: source.era === "ptr" ? "Midnight: 12.1.5 PTR Development Notes" : "World of Warcraft: Midnight Hotfixes - September 4",
      post_stream: { posts: [post(source)], stream: [source.topicId + 1, source.topicId + 2, source.topicId + 3] } };
  };
  const result = await fetchOfficialNotes({ specs: roster, fetchJSON, now: NOW });
  assert.equal(result.evidence.sources["live-hotfixes"].posts.length, 1);
  assert.equal(result.evidence.sources["ptr-preview"].posts.length, 2);
  assert.equal(seen.length, 3);
});

test("a changed patch title or failed source does not rewrite its existing ledger", async () => {
  const previous = resolved();
  const result = await fetchOfficialNotes({ specs: roster, previous, now: NOW, fetchJSON: async url => {
    if (url.includes("2336376")) throw Error("HTTP 403");
    return { id: 2344395, title: "Midnight: 12.2 PTR Development Notes", post_stream: { posts: [post(OFFICIAL_NOTE_SOURCES[1])], stream: [] } };
  } });
  assert.deepEqual(result.pending, previous);
  assert.match(result.evidence.sources["ptr-preview"].details, /title/);
  assert.equal(result.evidence.sources["ptr-preview"].status, "invalid");
  assert.ok(check(result.pending, result.evidence, previous).errors.some(e => e.includes("needs review")));
});

test("HTTP failure halfway through a staff-post inventory is an outage, not a parser error", async () => {
  const result = await fetchOfficialNotes({ specs: roster, previous: resolved(), now: NOW, fetchJSON: async url => {
    if (url.includes("/posts.json?")) throw Error("HTTP 503");
    const source = OFFICIAL_NOTE_SOURCES.find(s => url.includes(String(s.topicId)));
    return { id: source.topicId, title: source.era === "ptr" ? "Midnight: 12.1.5 PTR Development Notes" : "World of Warcraft: Midnight Hotfixes",
      post_stream: { posts: [post(source)], stream: [source.topicId + 1, source.topicId + 2] } };
  } });
  assert.equal(result.evidence.sources["ptr-preview"].status, "unreachable");
  assert.deepEqual(check(result.pending, result.evidence, resolved()).errors, []);
});

test("HTTP transport rejects challenge HTML, wrong origin and oversized JSON", async () => {
  await assert.rejects(fetchNoteJSON("https://us.forums.blizzard.com/test", async () => new Response("challenge", { status: 403 })), /HTTP 403/);
  await assert.rejects(fetchNoteJSON("https://us.forums.blizzard.com/test", async () => new Response("challenge", { headers: { "content-type": "text/html" } })), /Discourse JSON/);
  await assert.rejects(fetchNoteJSON("https://us.forums.blizzard.com/test", async () => {
    const r = new Response("{}", { headers: { "content-type": "application/json" } }); Object.defineProperty(r, "url", { value: "https://example.com/" }); return r;
  }), /redirect origin/);
  await assert.rejects(fetchNoteJSON("https://us.forums.blizzard.com/test", async () => new Response(" ".repeat(4_000_001), { headers: { "content-type": "application/json" } })), /4 MB/);
});
