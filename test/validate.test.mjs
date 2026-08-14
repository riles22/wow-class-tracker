import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
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

test("host allowlists pin every agent-writable URL field, not just creator takes", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  // Each value is a well-formed https URL — only the HOST is wrong, so any error
  // below comes from hostOk, not the https check.
  broken.specs.find(s => s.ptr?.source).ptr.source = "https://evil.example.com/writeup";
  const cls = broken.community.classes.find(c => (c.creators ?? []).length);
  cls.creators[0].url = "https://evil.example.com/channel";
  cls.discord.url = "https://evil.example.com/invite";
  broken.ptrBuilds.thread = "https://evil.example.com/thread.json";
  broken.ptrBuilds.builds[0].forumUrl = "https://evil.example.com/post/19";
  broken.ptrBuilds.builds[0].wowheadUrl = "https://evil.example.com/news";
  const errors = validateData(broken);
  const pinned = errors.filter(e => e.includes('host "evil.example.com" is not in the approved host allowlist'));
  assert.equal(pinned.length, 6);
  assert.ok(pinned.some(e => e.includes("ptr.source")));
  assert.ok(pinned.some(e => e.includes("creator")));
  assert.ok(pinned.some(e => e.includes("discord url")));
  assert.ok(pinned.some(e => e.includes("ptr-builds.json: thread")));
  assert.ok(pinned.some(e => e.includes("forumUrl")));
  assert.ok(pinned.some(e => e.includes("wowheadUrl")));
  // A malformed URL still reports exactly once (urlOk), never a second hostOk error.
  const single = structuredClone(data);
  single.ptrBuilds.builds[0].forumUrl = "http://us.forums.blizzard.com/x";
  const singleErrors = validateData(single).filter(e => e.includes("forumUrl"));
  assert.equal(singleErrors.length, 1);
  assert.ok(singleErrors[0].includes("must be a valid https:// URL"));
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

test("pending transcript queue: skipped[] is durable and cannot overlap the queue", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.pendingTranscripts = {
    videos: [{ id: "Rmkxzb1QQSQ", creator: "AutomaticJak", title: "t", published: "2026-07-17", queuedAt: "2026-07-17" }],
    skipped: [
      // same id in both lanes — the exact ambiguity that let a skipped video be re-queued
      { id: "Rmkxzb1QQSQ", creator: "AutomaticJak", title: "t", reason: "a sufficiently long reason", verifiedAt: "2026-07-17" },
      { id: "Z8Jygl_NpF4", creator: "Shadarek", title: "t", reason: "short", verifiedAt: "2026-07-17" },
      { id: "vK-qyvXOVYM", creator: "izen", title: "t", reason: "a sufficiently long reason", verifiedAt: "2099-01-01" },
      { id: "vK-qyvXOVYM", creator: "izen", title: "dup", reason: "a sufficiently long reason", verifiedAt: "2026-07-17" },
    ],
  };
  const errors = validateData(broken, { now: "2026-07-17" });
  assert.ok(errors.some(e => e.includes("both queued and skipped")), "an id in both lanes is rejected");
  assert.ok(errors.some(e => e.includes("needs a reason")), "a bare/short reason is rejected");
  assert.ok(errors.some(e => e.includes("listed twice")), "duplicate skipped id rejected");
  assert.ok(errors.some(e => e.includes("future-dated")), "future verifiedAt rejected");
  // the lane is optional, and the committed file must itself be clean
  const noSkip = structuredClone(data);
  delete noSkip.pendingTranscripts.skipped;
  assert.ok(!validateData(noSkip, { now: "2026-07-17" }).some(e => e.includes("skipped")));
  assert.deepEqual(validateData(data).filter(e => e.includes("skipped")), []);
});

test("tier-set upkeep gate: a build highlight naming a spec + set keyword forces tierSet.asOf forward", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  // Plant a new build whose highlight touches Outlaw Rogue's tier set.
  broken.ptrBuilds.builds.unshift({
    date: "2026-07-19", label: "test build", forumPostNumber: 99,
    forumUrl: "https://us.forums.blizzard.com/en/wow/t/x/1/99",
    specsAffected: ["Outlaw Rogue"],
    highlights: ["Outlaw Rogue — The Venomous Abyss 4-set bonus chance increased to 25%."],
  });
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes("Outlaw Rogue tierSet.asOf") && e.includes("2026-07-19")));
  // Bumping asOf to the build date satisfies the gate.
  const fixed = structuredClone(broken);
  fixed.specs.find(s => s.class === "Rogue" && s.spec === "Outlaw").tierSet.asOf = "2026-07-19";
  assert.ok(!validateData(fixed).some(e => e.includes("Outlaw Rogue tierSet.asOf")));
});

test("tier-set upkeep gate: ignores highlights without a set keyword or naming no spec", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.ptrBuilds.builds.unshift({
    date: "2026-07-19", label: "test build", forumPostNumber: 99,
    forumUrl: "https://us.forums.blizzard.com/en/wow/t/x/1/99",
    specsAffected: ["Outlaw Rogue"],
    highlights: [
      "Outlaw Rogue — Dispatch damage increased by 10%.",          // no set keyword
      "Season 2 tier sets unlock at renown 12 for all classes.",   // set keyword, no spec name
    ],
  });
  assert.ok(!validateData(broken).some(e => e.includes("tierSet.asOf") && e.includes("2026-07-19")));
});

test("tier-set upkeep gate: matches the '(Class — Spec)' suffix form and the piece idiom", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  broken.ptrBuilds.builds.unshift({
    date: "2026-07-19", label: "test build", forumPostNumber: 99,
    forumUrl: "https://us.forums.blizzard.com/en/wow/t/x/1/99",
    specsAffected: ["Outlaw Rogue"],
    highlights: ["The Venomous Abyss 4-piece bonus chance increased to 25% (Rogue — Outlaw)"],
  });
  assert.ok(validateData(broken).some(e => e.includes("Outlaw Rogue tierSet.asOf") && e.includes("2026-07-19")));
});

test("a new writeup must carry ptr.asOf; the pre-2026-07-26 ones are grandfathered", async () => {
  /* Without a date, a read from three weeks ago is presented exactly like last night's,
     and nothing on the page can age it — dataHealth() reads metric/sim/dummy dates and
     never sees writeups. It matters most for the unlinkable ones: a Discord post has no
     page to date, so whoever pastes it is the only possible source of the date, and once
     the writeup lands the chance to record it is gone. The 29 existing writeups predate
     the rule and their dates are genuinely unrecoverable (14 cite an undated Wowhead
     preview, 3 cite Discord), so they are grandfathered rather than back-dated with a
     guess — hard rule 1. */
  const data = await loadData(ROOT);
  assert.deepEqual(validateData(data).filter(e => /asOf/.test(e)), [],
    "the committed data must pass as-is — the grandfather list has to match reality");

  // A spec that has no writeup today gets one, undated: rejected.
  const added = structuredClone(data);
  const fresh = added.specs.find(s => !s.ptr);
  assert.ok(fresh, "expected at least one untracked spec to use as the fixture");
  fresh.ptr = { verdict: "Mixed", summary: "s", changes: ["c"], sourceLabel: "Someone (Server) — Discord" };
  assert.ok(validateData(added).some(e => e.includes(`${fresh.class} / ${fresh.spec} writeup needs ptr.asOf`)),
    "a NEW undated writeup is exactly what this gate exists to stop");

  // …and accepted once dated.
  fresh.ptr.asOf = "2026-07-26";
  assert.deepEqual(validateData(added).filter(e => /asOf/.test(e)), []);

  // A grandfathered writeup may omit the date, but anything it DOES carry is checked —
  // the exemption is from having a date, not from having an honest one.
  const bad = structuredClone(data);
  const old = bad.specs.find(s => s.ptr && !s.ptr.asOf);
  assert.ok(old, "expected grandfathered writeups to still exist");
  old.ptr.asOf = "July 2026";
  assert.ok(validateData(bad).some(e => e.includes("ptr.asOf must be YYYY-MM-DD")));
  old.ptr.asOf = "2027-01-01";
  assert.ok(validateData(bad).some(e => /ptr\.asOf is future-dated/.test(e)),
    "a writeup cannot be dated after the data it describes");

  // The list is keyed "Class|Spec" while the error prefix is "Class / Spec" — a mismatch
  // there would silently exempt nobody (or everybody), so pin the key format.
  const src = await readFile(new URL("../src/validate.mjs", import.meta.url), "utf8");
  assert.match(src, /UNDATED_WRITEUPS\.has\(`\$\{spec\.class\}\|\$\{spec\.spec\}`\)/,
    "the grandfather lookup must use the pipe key the list is written in");
});

test("validateData rejects an unknown era rather than defaulting it to live", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  // A typo here is the one mistake the era lane cannot survive quietly: defaulting it to
  // "live" would average a 12.1 tier list into the 12.0.7 consensus with no visible sign.
  broken.sources.find(s => s.kind === "tier-list").era = "PTR";
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('unknown era "PTR"')), errors.join("\n"));
});

test("validateData accepts the two legal era values", async () => {
  const data = await loadData(ROOT);
  /* Subject DERIVED, never a literal id — and its frozen records dropped. This read
     `find(s => s.id === "method")` until 2026-08-14, when Method rebuilt for Season 2 and
     freeze-season wrote it into season-final.json. Marking a frozen source era:"ptr" then
     correctly raises `"method" is era:"ptr" — a PTR list never fed the live consensus`, so a
     test about ERA VALUES went red on the FROZEN LANE, an invariant it is not measuring and
     which "validateData gates the frozen final-season archive" already covers directly.

     Picking a different literal id would only move the trap to whichever outlet flips next
     (see the same lesson in test/freeze-season.test.mjs, twice). Selecting an unfrozen source
     would go vacuous once every outlet has flipped — the S2 transition, which is precisely
     when this must still work. So take any live-era tier list and strip its frozen records
     from the copy, isolating era handling from the frozen lane. */
  const subject = data.sources.find(s => s.kind === "tier-list" && (s.era ?? "live") === "live");
  assert.ok(subject, "the registry must carry at least one live-era tier list");
  for (const era of ["live", "ptr"]) {
    const copy = structuredClone(data);
    copy.sources.find(s => s.id === subject.id).era = era;
    for (const bySource of Object.values(copy.seasonFinal ?? {})) delete bySource[subject.id];
    assert.deepEqual(validateData(copy).filter(e => e.includes("era")), [],
      `era "${era}" must be accepted on ${subject.id}`);
  }
});

test("validateData rejects a registry whose tier lists are ALL era-gated", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  // Consensus averages live sources only, so a registry of nothing but PTR lists would
  // render 80 empty consensus cells under toggles that still promise a consensus.
  for (const s of broken.sources) if (s.kind === "tier-list") s.era = "ptr";
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes("no LIVE-era tier-list sources")), errors.join("\n"));
});

test("the PTR tier list is registered as era-gated and M+ only", async () => {
  const { sources, specs } = await loadData(ROOT);
  const ptr = sources.find(s => s.id === "icyveins-ptr");
  assert.ok(ptr, "icyveins-ptr is in the registry");
  assert.equal(ptr.era, "ptr");
  assert.equal(ptr.kind, "tier-list");
  // Icy Veins publishes no PTR raid list; claiming one would invent a source.
  assert.deepEqual([...new Set(ptr.pages.map(p => p.bracket))], ["mplus"]);
  assert.equal(specs.filter(s => s.ratings?.raid?.["icyveins-ptr"] !== undefined).length, 0);
  // Full roster coverage, with any upstream TBD stored as an EXPLICIT null. The guarantee
  // being tested is the shape — a spec the authors have not placed is written as null and
  // never omitted and never guessed — not the tally of how many are currently unplaced.
  // The COUNT is upstream state that legitimately moves: the 02 Aug. 2026 rebuild
  // ("Update #4") placed both of the two specs that had been TBD since this source was
  // added, taking the count 2 -> 0. Asserting a fixed count turns an ordinary upstream
  // update into a red suite, so assert presence-of-key instead.
  const present = specs.filter(s => s.ratings?.mplus && "icyveins-ptr" in s.ratings.mplus);
  assert.equal(present.length, 40, "every roster spec carries an icyveins-ptr M+ key");
  const rated = specs.filter(s => s.ratings?.mplus?.["icyveins-ptr"] != null).length;
  const tbd = specs.filter(s => s.ratings?.mplus?.["icyveins-ptr"] === null).length;
  assert.equal(rated + tbd, 40);
});

test("build coverage gate: a spec in specsAffected with no line that reaches it fails", async () => {
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  const build = broken.ptrBuilds.builds.find(b => b.highlights.length > 3);
  // Name a spec as affected without giving it any line — the exact shape of the 2026-06-18
  // defect, where 39 specs were listed against 6 highlight lines.
  build.specsAffected.push("Subtlety Rogue");
  build.highlights = build.highlights.filter(h => !h.startsWith("Subtlety Rogue") && !h.startsWith("Rogue ("));
  const errors = validateData(broken, { fullRoster: true });
  assert.ok(errors.some(e => e.includes("no highlight line") && e.includes("Subtlety Rogue")), errors.join("\n"));
});

test("build coverage gate: a class-wide line counts as reaching its build's specs", async () => {
  const data = await loadData(ROOT);
  const copy = structuredClone(data);
  const build = copy.ptrBuilds.builds.find(b => b.date === "2026-07-08" && b.forumPostNumber === 11);
  // Preservation Evoker is covered by its own line; swap it for class-wide-only coverage
  // and the gate must still pass — reachability is specBuildChanges' rule, not a copy.
  build.highlights = build.highlights.filter(h => !h.startsWith("Preservation Evoker"));
  assert.ok(build.specsAffected.includes("Preservation Evoker"));
  assert.ok(build.highlights.some(h => h.startsWith("Evoker (class-wide)")), "fixture needs the class-wide line");
  const errors = validateData(copy, { fullRoster: true }).filter(e => e.includes("Preservation Evoker"));
  assert.deepEqual(errors, []);
});

test("build coverage gate: a no-tuning post with zero highlights is legitimate", async () => {
  const data = await loadData(ROOT);
  const copy = structuredClone(data);
  const build = copy.ptrBuilds.builds.find(b => b.forumPostNumber === 11);
  build.highlights = [];
  const errors = validateData(copy, { fullRoster: true }).filter(e => e.includes("no highlight line"));
  assert.deepEqual(errors, []);
});

test("ptr-builds: a hotfix entry is valid without a forum post", async () => {
  const data = await loadData(ROOT);
  const copy = structuredClone(data);
  // PTR hotfixes are pushed between builds and the forum thread never carries them, so
  // requiring forumUrl on every entry made them unaddable — a real coverage hole that
  // every gate reported as green (2026-08-02).
  copy.ptrBuilds.builds.unshift({
    date: "2026-07-31", kind: "hotfix",
    label: "PTR hotfixes pushed overnight",
    wowheadUrl: "https://www.wowhead.com/news=382321",
    specsAffected: ["Shaman (class-wide)"],
    highlights: ["Shaman (class-wide) Ride the Lightning damage increased by 59%."]
  });
  assert.deepEqual(validateData(copy, { fullRoster: true }), []);
});

test("ptr-builds: each entry kind must carry the citation it actually has", async () => {
  const data = await loadData(ROOT);
  const base = {
    date: "2026-07-31", label: "x", specsAffected: [],
    highlights: ["Shaman (class-wide) something happened."]
  };
  const errs = entry => {
    const c = structuredClone(data); c.ptrBuilds.builds.unshift(entry);
    return validateData(c, { fullRoster: true });
  };
  // a hotfix with no Wowhead round-up has no citation at all
  assert.ok(errs({ ...base, kind: "hotfix" }).some(e => e.includes("missing wowheadUrl")));
  // …and must never be dressed up as a forum build post
  assert.ok(errs({ ...base, kind: "hotfix", wowheadUrl: "https://www.wowhead.com/news=1",
    forumUrl: "https://us.forums.blizzard.com/en/wow/t/x/1" }).some(e => e.includes("carries a forumUrl")));
  assert.ok(errs({ ...base, kind: "hotfix", wowheadUrl: "https://www.wowhead.com/news=1",
    forumPostNumber: 19 }).some(e => e.includes("carries a forumPostNumber")));
  // a build still requires its forum post
  assert.ok(errs({ ...base, kind: "build" }).some(e => e.includes("missing forumUrl")));
  // and an unknown kind fails rather than defaulting
  assert.ok(errs({ ...base, kind: "datamine", forumUrl: "https://us.forums.blizzard.com/en/wow/t/x/1" })
    .some(e => e.includes('unknown kind "datamine"')));
});

test("ptr-builds: entries without an explicit kind are still builds", async () => {
  const data = await loadData(ROOT);
  // `kind` is optional and was added after every entry then on file. An entry that omits
  // it must still be read as a build — i.e. still held to the forum-post citation.
  // Asserting the file carried NO kind at all was a fixture assumption about the data,
  // not about the behaviour: it broke the moment the first real hotfix was logged
  // (2026-08-02, the 07-31 round-up). Assert the behaviour instead.
  const implicit = data.ptrBuilds.builds.filter(b => b.kind === undefined);
  assert.ok(implicit.length);
  assert.ok(implicit.every(b => b.forumUrl));
  assert.deepEqual(validateData(data, { fullRoster: true }), []);
});

test("validateData gates the take fields the expert model reads", async () => {
  // Since PROJECTION_VERSION v7 the take lane feeds the projection, and the 2026-08-04
  // audit showed a single-field sentiment mutation crossing tier boundaries with nothing
  // failing red. Every field expertRead() consumes is now schema-gated.
  const data = await loadData(ROOT);
  const broken = structuredClone(data);
  const [t1, t2, t3, t4, t5] = broken.creatorTakes.takes;
  t1.sentiment = "bullish";
  delete t2.patchContext;
  t3.bracket = "arena";
  t4.superseded = "yes";
  delete t5.date;
  const errors = validateData(broken);
  assert.ok(errors.some(e => e.includes('sentiment "bullish"')), "sentiment enum");
  assert.ok(errors.some(e => e.includes("needs a patchContext")), "patchContext required");
  assert.ok(errors.some(e => e.includes('bracket "arena"')), "bracket enum when present");
  assert.ok(errors.some(e => e.includes("superseded must be a boolean")), "superseded type");
  assert.ok(errors.some(e => e.includes("needs a date")), "date required");
  // An explicit, valid bracket scope passes.
  const ok = structuredClone(data);
  ok.creatorTakes.takes[0].bracket = "mplus";
  assert.deepEqual(validateData(ok).filter(e => e.includes("bracket")), []);
});

/* ---- season-final.json: the frozen final-season letters (2026-08-09) ----------------
   These letters go straight into the published consensus, rendering as ordinary tiers, so
   a bad record here is invisible on the page. Same gates the live ratings get. */

test("validateData gates the frozen final-season archive", async () => {
  const data = await loadData(ROOT);
  const rec = () => structuredClone(data.seasonFinal.s1.wowhead.raid);

  const badSpec = structuredClone(data);
  badSpec.seasonFinal.s1.wowhead.raid.letters["Not A|Spec"] = "A";
  assert.ok(validateData(badSpec).some(e => /"Not A\|Spec" is not a roster spec/.test(e)));

  const badTier = structuredClone(data);
  badTier.seasonFinal.s1.wowhead.raid.letters["Death Knight|Blood"] = "ZZ";
  assert.ok(validateData(badTier).some(e => /tier "ZZ"/.test(e)));

  const badSource = structuredClone(data);
  badSource.seasonFinal.s1["not-a-source"] = { raid: rec() };
  assert.ok(validateData(badSource).some(e => /is not a tier-list source/.test(e)));

  // A PTR list never fed the live consensus, so it has no final-season letters to freeze;
  // admitting one would inject contributors that were never in the mean.
  const ptrFrozen = structuredClone(data);
  ptrFrozen.seasonFinal.s1["icyveins-ptr"] = { mplus: rec() };
  assert.ok(validateData(ptrFrozen).some(e => /era:"ptr"/.test(e)));

  const badSeason = structuredClone(data);
  badSeason.seasonFinal.s9 = { wowhead: { raid: rec() } };
  assert.ok(validateData(badSeason).some(e => /unknown season "s9"/.test(e)));

  const noCommit = structuredClone(data);
  noCommit.seasonFinal.s1.wowhead.raid.fromCommit = "abc123";
  assert.ok(validateData(noCommit).some(e => /fromCommit must be a full 40-hex/.test(e)));

  // An empty freeze is the dangerous one: it looks successful and silently drops the
  // source from the consensus.
  const empty = structuredClone(data);
  empty.seasonFinal.s1.wowhead.raid.letters = {};
  assert.ok(validateData(empty).some(e => /has no letters/.test(e)));

  // A record cannot be frozen before the letters it froze were published.
  const backwards = structuredClone(data);
  backwards.seasonFinal.s1.wowhead.raid.lastSeasonVerifiedSnapshot = "2099-01-01";
  assert.ok(validateData(backwards).some(e => /is after frozenAt/.test(e)));

  // Absent archive is valid — it is the pre-2026-08-09 state.
  const none = structuredClone(data);
  none.seasonFinal = null;
  assert.deepEqual(validateData(none), []);
});

test("the committed archive only holds sources that have actually moved ahead", async () => {
  const data = await loadData(ROOT);
  if (!data.seasonFinal) return;
  const { sourceSeasonOk, seasonRank, PHASES } = await import("../src/normalize.mjs");
  for (const [season, bySource] of Object.entries(data.seasonFinal)) {
    if (season !== PHASES.liveSeason) continue;
    const liveRank = seasonRank(season);
    for (const [id, brackets] of Object.entries(bySource)) {
      const source = data.sources.find(s => s.id === id);
      for (const bracket of Object.keys(brackets)) {
        assert.equal(sourceSeasonOk(source, bracket, season), false,
          `${id}/${bracket} still describes the live season — freezing it would outrank its own live letters`);
        /* The other direction, which asserting only the line above missed: `sourceSeasonOk`
           is false for a LAGGING outlet too, and freezing one writes stale letters into an
           append-only archive permanently. A frozen record is only legitimate when a page
           has moved PAST the live season. */
        const moved = (source?.pages ?? [])
          .filter(p => p.bracket === bracket)
          .some(p => { const r = seasonRank(p.seasonVerified); return r != null && r > liveRank; });
        assert.ok(moved,
          `${id}/${bracket} is frozen but no page has moved past ${season} — a lagging outlet must drop out of the consensus, never be frozen`);
      }
    }
  }
});
