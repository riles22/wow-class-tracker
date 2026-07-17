import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "../src/validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the repo's real data passes validation", async () => {
  const data = await loadData(ROOT);
  const errors = validateData(data);
  assert.deepEqual(errors, []);
});

test("the repo's data has all 40 Midnight specs across 13 classes", async () => {
  const { specs } = await loadData(ROOT);
  assert.equal(specs.length, 40);
  assert.equal(new Set(specs.map(s => s.class)).size, 13);
  // Midnight-era sanity marker: the third Demon Hunter spec exists.
  assert.ok(specs.some(s => s.class === "Demon Hunter" && s.spec === "Devourer"));
});

test("validateData catches bad tiers, roles, sources and duplicates", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  // find()-based (not positional): survives any reordering of specs.json
  broken.specs.find(s => s.role === "Tank").role = "Bard";
  broken.specs.find(s => s.ratings?.raid?.icyveins).ratings.raid.icyveins = "SS";
  broken.specs.find(s => s.ratings?.raid).ratings.raid.unknownsource = "A";
  broken.specs.push(structuredClone(broken.specs.find(s => s.role === "DPS")));
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('invalid role "Bard"')));
  assert.ok(errors.some(e => e.includes('tier "SS"')));
  assert.ok(errors.some(e => e.includes('unknown source "unknownsource"')));
  assert.ok(errors.some(e => e.includes("duplicate spec")));
});

test("validateData rejects impossible dates, future dates, and duplicate registry entries", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.specs.find(s => (s.metrics ?? []).some(m => m.asOf)).metrics.find(m => m.asOf).asOf = "2026-99-99";
  broken.sources.find(s => (s.pages ?? []).some(p => p.snapshot)).pages.find(p => p.snapshot).snapshot = "2199-01-01";
  broken.sources.push(structuredClone(broken.sources[0]));
  const cls = broken.community.classes.find(c => (c.creators ?? []).length);
  cls.creators.push(structuredClone(cls.creators[0]));
  broken.community.classes.push(structuredClone(broken.community.classes[0]));
  broken.community.generalCreators.push(structuredClone(broken.community.generalCreators[0]));
  const errors = validateData(broken, { now: "2026-07-14" });
  assert.ok(errors.some(e => e.includes('not a real calendar date, got "2026-99-99"')));
  assert.ok(errors.some(e => e.includes("future-dated") && e.includes("2199-01-01")));
  assert.ok(errors.some(e => e.includes("duplicate source id")));
  assert.ok(errors.some(e => e.includes("duplicate creator")));
  assert.ok(errors.some(e => e.includes("duplicate class entry")));
  assert.ok(errors.some(e => e.includes("duplicate general creator")));
});

test("validateData enforces https-only URLs and the take-host allowlist", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.creatorTakes.takes.find(t => t.url).url = "javascript:alert(1)";
  broken.creatorTakes.takes.filter(t => t.url)[1].url = "https://evil.example.com/x";
  broken.community.classes[0].discord.url = "http://discord.gg/x"; // http, not https
  broken.community.generalCreators = [{ name: "Sketchy", url: "javascript:alert(1)" }];
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes("must be https://") && e.includes("javascript:")));
  assert.ok(errors.some(e => e.includes("not in the citation allowlist")));
  assert.ok(errors.some(e => e.includes("discord url must be a valid https:// URL")));
  assert.ok(errors.some(e => e.includes('general creator "Sketchy" url')));
});

test("validateData rejects planted or malformed history snapshots (heartbeat-silencing guard)", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  // A future-dated snapshot would become historySnapshots[0]: the movement baseline
  // AND the freshness heartbeat's proof of life — the exact shape a prompt-injected
  // nightly agent could plant, since its whole data/ tree gets committed.
  broken.historySnapshots.unshift({ date: "2199-01-01", specs: {} });
  broken.historySnapshots.push({ specs: {} });
  broken.historySnapshots.push({ date: "2026-07-01" });
  const errors = validateData(broken, { now: "2026-07-14" });
  assert.ok(errors.some(e => e.includes("data/history") && e.includes("future-dated") && e.includes("2199-01-01")));
  assert.ok(errors.some(e => e.includes("data/history") && e.includes("missing its date")));
  assert.ok(errors.some(e => e.includes("data/history") && e.includes("no specs state")));
});

test("validateData enforces era↔name consistency, finite values, and metric uniqueness", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  const spec = broken.specs.find(s => (s.metrics ?? []).length >= 2);
  spec.metrics[0].value = -10;
  spec.metrics[1].era = "ptr"; // live-named series claiming ptr
  const dupSpec = broken.specs.find(s => s !== spec && (s.metrics ?? []).length >= 1);
  dupSpec.metrics.push(structuredClone(dupSpec.metrics[0]));
  const ptrSpec = broken.specs.find(s => (s.metrics ?? []).some(m => m.name.includes("12.1 PTR")));
  ptrSpec.metrics.find(m => m.name.includes("12.1 PTR")).era = "live"; // PTR-named series claiming live
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes("finite non-negative")));
  assert.ok(errors.some(e => e.includes("no PTR label")));
  assert.ok(errors.some(e => e.includes("duplicate metric")));
  assert.ok(errors.some(e => e.includes('named 12.1 PTR but tagged era "live"')));
});

test("validateData checks encounter-tiers, specsAffected, draft provenance, and full roster", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  const [slug, enc] = Object.entries(broken.encounterTiers.raid)[0];
  enc.tiers["Bard|Minstrel"] = "S";
  Object.values(enc.tiers)[0] = enc.tiers[Object.keys(enc.tiers)[1]]; // keep shape valid
  enc.tiers[Object.keys(broken.encounterTiers.raid[slug].tiers)[1]] = "SS";
  broken.ptrBuilds.builds[0].specsAffected.push("Swashbuckler Rogue");
  const writeup = broken.specs.find(s => s.ptr);
  delete writeup.ptr.source; delete writeup.ptr.sourceLabel;
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('unknown spec "Bard|Minstrel"')));
  assert.ok(errors.some(e => e.includes('tier "SS" not in the archon scale')));
  assert.ok(errors.some(e => e.includes('"Swashbuckler Rogue" matches no roster spec')));
  // auto-confirm policy: EVERY writeup must carry provenance (attribution is the honesty)
  assert.ok(errors.some(e => e.includes("writeup needs a source URL or sourceLabel")));
  // fullRoster opt: dropping a spec fails only when the option is on
  const short = structuredClone(data);
  short.specs = short.specs.slice(0, 39);
  assert.ok(!validateData(short).some(e => e.includes("exactly 40")));
  assert.ok(validateData(short, { fullRoster: true }).some(e => e.includes("exactly 40")));
});

test("validateData catches malformed ptr writeups", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  const tracked = broken.specs.find(s => s.ptr);
  tracked.ptr.verdict = "Amazing";
  tracked.ptr.changes = [];
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('ptr.verdict "Amazing"')));
  assert.ok(errors.some(e => e.includes("ptr.changes")));
});

test("validateData catches unsorted consensus bands", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.scales.consensus.bands = [{ tier: "C", min: 0 }, { tier: "S", min: 88 }];
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes("descending min")));
});

test("validateData requires every scale to declare tiers with numeric values", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  delete broken.scales.scales.method.tiers; // the client legend builder depends on tiers[]
  broken.scales.scales.icyveins.tiers.push("Z");
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('scale "method" must define a non-empty tiers array')));
  assert.ok(errors.some(e => e.includes('scale "icyveins" tier "Z" has no numeric value')));
});

test("a creator's specs scope must be real specs of that class", async () => {
  const data = await loadData(ROOT);
  const ok = structuredClone(data);
  const dk = ok.community.classes.find(c => c.class === "Death Knight");
  dk.creators[0].specs = ["Frost", "Unholy"]; // both valid DK specs
  assert.deepEqual(validateData(ok), []);

  const bad = structuredClone(data);
  const dk2 = bad.community.classes.find(c => c.class === "Death Knight");
  dk2.creators[0].specs = ["Shadow"]; // a Priest spec — not valid on DK
  const errors = validateData(bad);
  assert.ok(errors.some(e => e.includes('scoped to "Shadow"') && e.includes("not a Death Knight spec")));
});

test("every take's creator must be registered for that class, within their specs scope", async () => {
  const data = await loadData(ROOT);
  assert.deepEqual(validateData(data), [], "real data must satisfy the authority model");
  const broken = structuredClone(data);
  broken.creatorTakes.takes.push({ class: "Mage", spec: "Frost", creator: "TotallyUnregistered",
    date: "2026-07-06", claim: "x", url: "https://youtu.be/x" });
  // an existing scoped creator attributed outside their scope
  const scoped = broken.community.classes.flatMap(c => (c.creators ?? []).map(cr => ({ cls: c.class, cr })))
    .find(x => Array.isArray(x.cr.specs));
  const otherSpec = broken.specs.find(s => s.class === scoped.cls && !scoped.cr.specs.includes(s.spec));
  broken.creatorTakes.takes.push({ class: scoped.cls, spec: otherSpec.spec, creator: scoped.cr.name,
    date: "2026-07-06", claim: "x", url: "https://youtu.be/x" });
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('"TotallyUnregistered"') && e.includes("no Mage entry")));
  assert.ok(errors.some(e => e.includes("outside their declared specs scope")));
});

test("meta-outlook notes may only be authored by a generalCreators entry", async () => {
  const data = await loadData(ROOT);
  assert.deepEqual(validateData(data), [], "real data must satisfy the meta-note model");
  const broken = structuredClone(data);
  broken.creatorTakes.metaNotes = broken.creatorTakes.metaNotes ?? [];
  // a name that is NOT a generalCreators entry cannot author a metaNote (firewall: those
  // belong in takes[] under a class-scoped creator, not the general news lane)
  broken.creatorTakes.metaNotes.push({ class: "Mage", spec: "Frost", creator: "Not A General Creator",
    date: "2026-07-08", sentiment: "positive", note: "x", url: "https://youtu.be/x" });
  // a valid general creator but an invalid sentiment
  const gc = broken.community.generalCreators?.[0];
  if (gc) broken.creatorTakes.metaNotes.push({ class: "Mage", spec: "Fire", creator: gc.name,
    date: "2026-07-08", sentiment: "bullish", note: "x", url: "https://youtu.be/x" });
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes("must be a generalCreators entry")), "non-general creator rejected");
  if (gc) assert.ok(errors.some(e => e.includes("sentiment") && e.includes("invalid")), "bad sentiment rejected");
});

test("a spec with an omitted ptr key is valid (same as ptr: null)", async () => {
  const data = await loadData(ROOT);
  const clone = structuredClone(data);
  delete clone.specs.find(s => s.ptr === null).ptr;
  assert.deepEqual(validateData(clone), []);
});

test("pending transcript queue: id shape is a hard gate (ids reach fetch URLs)", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.pendingTranscripts = { videos: [
    { id: "https://evil", creator: "X", title: "t", published: "2026-07-17", queuedAt: "2026-07-17" },
    { id: "Rmkxzb1QQSQ", creator: "", title: "t", published: "2026-07-17", queuedAt: "2026-07-17" },
    { id: "Rmkxzb1QQSQ", creator: "AutomaticJak", title: "dup id", published: "2026-07-17", queuedAt: "2026-07-17" },
    { id: "vK-qyvXOVYM", creator: "izen", title: "ok", published: "2099-01-01", queuedAt: "2026-07-17" },
  ]};
  const errors = validateData(broken, { now: "2026-07-17" });
  assert.ok(errors.some(e => e.includes('"https://evil"') && e.includes("11-char")), "url-shaped id rejected");
  assert.ok(errors.some(e => e.includes("needs a creator")), "empty creator rejected");
  assert.ok(errors.some(e => e.includes("queued twice")), "duplicate id rejected");
  assert.ok(errors.some(e => e.includes("future-dated")), "future publish date rejected");
  // a missing queue file stays valid (lane is optional)
  const none = structuredClone(data);
  none.pendingTranscripts = null;
  assert.ok(!validateData(none, { now: "2026-07-17" }).some(e => e.includes("pending-transcripts")));
});
