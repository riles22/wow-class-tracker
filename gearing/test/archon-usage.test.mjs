/* Archon usage lane — parser, season gate, and BOTH shipping states (G13 + G14).

   The fixtures in test/fixtures/ are real bytes Archon served on 2026-08-13 and every one of
   them is SEASON 1 or PTR data. They exist to exercise the parser and the refusal; nothing in
   them may be promoted into gearing/data. Each file carries that warning in its own header. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { rosterFrom } from "../src/lib-guides.mjs";
import {
  archonUsageIssues, harvestedFile, itemCellEntries, laneUrl, nextDataFrom, MIN_PARSES,
  pageSeasonOf, parseGearPage, parseUsagePct, pendingFile, rosterAgreement, seasonVerdict,
  specCatalogFrom, stripMarkup,
} from "../src/harvest-archon-gear.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));
const fixture = (name) => readFile(fromRoot(`test/fixtures/${name}`), "utf8");

/* The tracker's era vocabulary, restated as literals rather than imported. The harvester
   imports PHASES lazily inside its CLI precisely so this module stays uncoupled; pinning the
   shape here means a change to that vocabulary shows up as a test edit, not a silent drift. */
const SEASON_LABELS = { s1: "12.0.7", s2: "12.1" };

const raidFixture = await fixture("archon-raid-frost-mage.html");
const mplusFixture = await fixture("archon-mplus-frost-mage.html");
const betaFixture = await fixture("archon-beta-mplus-frost-mage.html");
const raid = parseGearPage(raidFixture, { where: "fixture raid" });
const mplus = parseGearPage(mplusFixture, { where: "fixture mplus" });
const beta = parseGearPage(betaFixture, { where: "fixture beta" });

/* ---------- transport + markup ---------- */

test("the page is server-rendered JSON, and a missing __NEXT_DATA__ is a hard error", () => {
  // WebFetch-style markdown conversion drops the script tag; failing loudly is the only way
  // that shows up as anything other than "Archon published nothing today".
  assert.throws(() => nextDataFrom("<html><body>rendered markup only</body></html>"),
    /__NEXT_DATA__ script tag not found/);
  assert.ok(nextDataFrom(raidFixture).props.pageProps.page);
});

test("Archon's pseudo-JSX cells yield ids, names and usage shares", () => {
  const cell = "<ItemIcon id={258218} icon='x.jpg' type='3' isRtl={false}>Skybreaker's Blade</ItemIcon>";
  assert.deepEqual(itemCellEntries(cell), [{ itemId: "258218", name: "Skybreaker's Blade" }]);
  assert.equal(parseUsagePct("<Styled type='legendary'>29.6%</Styled>"), 29.6);
  assert.equal(stripMarkup("<Styled>Frost Mage</Styled> Gear &amp; Tier"), "Frost Mage Gear & Tier");
  // A cell with no percentage is null, never 0 — "not measured" and "measured at zero" differ.
  assert.equal(parseUsagePct("<Styled>—</Styled>"), null);
});

test("a row with no usage share is refused, not recorded as zero", () => {
  const page = { props: { pageProps: { page: { sections: [{
    component: "BuildsGearTablesSection",
    props: { tables: [{ columns: { item: { header: "Head" } },
      data: [{ item: "<ItemIcon id={1} >Thing</ItemIcon>", popularity: null }] }] },
  }] } } } };
  const html = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(page)}</script>`;
  assert.throws(() => parseGearPage(html), /carries no usage share/);
});

/* ---------- parsing the recorded page ---------- */

test("the raid fixture parses into canonical slots with per-item usage", () => {
  assert.equal(raid.slots.length, 14);
  for (const slot of raid.slots) {
    assert.ok(slot.items.length > 0, `${slot.slot} has no items`);
    for (const item of slot.items) {
      assert.match(item.itemId, /^\d+$/);
      assert.ok(item.name, `${slot.slot} item ${item.itemId} has no name`);
      assert.ok(item.usagePct > 0 && item.usagePct <= 100, `${item.name} usage ${item.usagePct}`);
    }
  }
  // Archon collapses the two equipped rings into one table and both trinkets into another.
  // The canonical slot folds; its own wording is kept so the collapse stays visible.
  const rings = raid.slots.find((slot) => slot.sourceLabel === "Rings");
  assert.equal(rings.slot, "Finger");
  const byLabel = Object.fromEntries(raid.slots.map((slot) => [slot.sourceLabel, slot.slot]));
  assert.deepEqual(
    { Gloves: byLabel.Gloves, Belt: byLabel.Belt, "Main-Hand": byLabel["Main-Hand"], "Off-Hand": byLabel["Off-Hand"] },
    { Gloves: "Hands", Belt: "Waist", "Main-Hand": "Main Hand", "Off-Hand": "Off Hand" });

  assert.equal(raid.lastUpdated, "2026-08-12T12:00:00Z");
  assert.equal(raid.totalParses, 10345);
  assert.equal(raid.sampleDescription, "Based on the top 50% of data in the last 14 days.");
});

test("the M+ fixture parses the same way, and its extra maxKey column is ignored", () => {
  assert.equal(mplus.slots.length, 14);
  assert.equal(mplus.sampleDescription, "Based on all keys 7 and above in the last 14 days.");
  const flat = JSON.stringify(mplus.slots);
  assert.equal(/maxKey/i.test(flat), false, "the key-level column is not part of the usage lane");
});

test("Wowhead's BiS badge is stripped, never recorded as an endorsement", () => {
  // Archon republishes Wowhead's BiS pick as a badge on some rows. Reading it would count
  // Wowhead twice — once from its own harvester, once second-hand through Archon.
  assert.ok(/BadgeLabel/.test(raidFixture), "the fixture must still contain the badge markup");
  const bindings = raid.crafted.find((item) => item.itemId === "239648");
  assert.equal(bindings.name, "Martyr's Bindings");
  const flat = JSON.stringify(raid);
  assert.equal(/BadgeLabel|Best in Slot for one or more setups|wowhead\.com/i.test(flat), false,
    "no trace of the republished Wowhead pick may survive into the parse");
});

test("the DPS / HPS columns are deliberately not harvested", () => {
  // Archon hides them by default and says they are not an isolated throughput delta. A number
  // nobody scoped is a number some future surface will sort by.
  assert.ok(/"dps"/.test(raidFixture), "the fixture must still contain the throughput column");
  const flat = JSON.stringify({ slots: raid.slots, crafted: raid.crafted,
    missives: raid.missives, embellishments: raid.embellishments });
  assert.equal(/dps|hps/i.test(flat), false, "usage is the only quantity this lane records");
});

test("embellishment rows stay combinations, because that is what Archon measured", () => {
  assert.ok(raid.embellishments.length > 0);
  const paired = raid.embellishments.find((row) => row.itemIds.length > 1);
  assert.ok(paired, "the fixture carries at least one two-embellishment row");
  assert.equal(paired.itemIds.length, paired.names.length);
  for (const row of raid.embellishments) assert.ok(row.usagePct > 0);
  // Crafted gear and missives are single items and keep the flat shape.
  assert.ok(raid.crafted.every((item) => item.itemId && item.usagePct > 0));
  assert.ok(raid.missives.every((item) => item.itemId && item.usagePct > 0));
});

test("the spec catalog comes from Archon's own picker and covers our 40 specs exactly", async () => {
  const catalog = specCatalogFrom(nextDataFrom(raidFixture).props.pageProps.page);
  assert.equal(catalog.length, 40);
  const ours = (await json("data/specs.json")).specs;
  const key = (entry) => `${entry.spec} ${entry.class}`;
  const theirs = new Set(catalog.map(key));
  assert.deepEqual(ours.filter((spec) => !theirs.has(key(spec))).map(key), [],
    "a spec Archon does not publish must surface as a join failure, not a 404");
  assert.deepEqual(catalog.filter((entry) => !ours.some((spec) => key(spec) === key(entry))).map(key), []);
});

test("both live lanes are derived from one spec path", () => {
  const path = "/wow/builds/frost/mage/raid/gear-and-tier-set/mythic/all-bosses";
  assert.equal(laneUrl(path, "raid"),
    "https://www.archon.gg/wow/builds/frost/mage/raid/gear-and-tier-set/mythic/all-bosses");
  assert.equal(laneUrl(path, "mythic-plus"),
    "https://www.archon.gg/wow/builds/frost/mage/mythic-plus/gear-and-tier-set/10/all-dungeons/this-week");
  assert.throws(() => laneUrl("/wow/tier-list/dps-rankings", "raid"), /unrecognised build path/);
});

/* ---------- the season gate (G14) ---------- */

test("a page's season comes from its own prose, dotted-prefix matched", () => {
  // The trailing period in "... in Midnight 12.0.7." defeats a naive [^\d.] boundary guard.
  assert.deepEqual(pageSeasonOf("Data-driven builds for VS / DR / MQD in Midnight 12.0.7.", SEASON_LABELS),
    { season: "s1", ptr: false, evidence: "12.0.7" });
  assert.equal(pageSeasonOf("builds for Mythic+ in Midnight Season 1.", SEASON_LABELS).season, "s1");
  assert.equal(pageSeasonOf("builds for Mythic+ in Midnight Season 2.", SEASON_LABELS).season, "s2");
  // A patch published as 12.1.0 is still the 12.1 season; 12.10 is not.
  assert.equal(pageSeasonOf("Midnight 12.1.0 tuning.", SEASON_LABELS).season, "s2");
  assert.equal(pageSeasonOf("Midnight 12.10 tuning.", SEASON_LABELS).season, null);
  // PTR/beta is not a season at all, whatever else the sentence says.
  assert.deepEqual(pageSeasonOf("builds for PTR M+ in Midnight PTR.", SEASON_LABELS).ptr, true);
});

test("the roster check joins Archon's abbreviated nav labels against our harvested data", async () => {
  const [raidItems, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raidItems, dungeons);
  // Archon's picker abbreviates ("Sethraliss" for "Temple of Sethraliss"), which neither the
  // exact nor the prefix join can see. A miss here is the expensive error, so containment is
  // allowed for nav labels — and only for nav labels; item attribution still uses the strict
  // join in lib-guides.mjs.
  const abbreviated = rosterAgreement(["Sethraliss", "The Blinding Vale", "Kings' Rest"], roster);
  assert.deepEqual(abbreviated.unmatched, []);
  // Season-1 content shares no names with our Season-2 roster, which is what makes this decisive.
  const seasonOne = rosterAgreement(["Magisters'", "Pit of Saron", "Skyreach"], roster);
  assert.equal(seasonOne.matched.length, 0);
  assert.equal(seasonOne.unmatched.length, 3);
});

test("a half-matching encounter list is refused, never averaged into a pass", async () => {
  // An outlet mid-rebuild can list both seasons' content at once. Requiring EVERY name to
  // join is what keeps a partial turnover out; "some matched" would let the older half in.
  const [raidItems, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raidItems, dungeons);
  assert.deepEqual(rosterAgreement(beta.encounters, roster).unmatched, [],
    "the beta lane's list matches our roster in full — that is the baseline this varies from");

  // Everything else about the page is made to pass, so only the roster can refuse it. Note
  // the title has to be cleared too: Archon labels its PTR lane in the title as well as the
  // description, and either one naming PTR is enough to disqualify the page.
  const mixed = { ...beta, zoneType: "mythic-plus", warning: null, totalParses: 50_000,
    title: "Frost Mage Mythic+ Gear & Tier",
    description: "builds for Mythic+ in Midnight Season 2.",
    encounters: [...beta.encounters, "Pit of Saron"] };
  const verdict = seasonVerdict(mixed, { liveSeason: "s2", seasonLabels: SEASON_LABELS, roster });
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.failed, ["roster"]);
  assert.match(verdict.reason, /unmatched: Pit of Saron/);
});

test("PENDING: the live raid page is refused against Season 2, and says why", async () => {
  const [raidItems, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raidItems, dungeons);
  const verdict = seasonVerdict(raid, { liveSeason: "s2", seasonLabels: SEASON_LABELS, roster });
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.failed.sort(), ["roster", "season"]);
  assert.equal(verdict.season, "s1");
  assert.match(verdict.reason, /live season is s2/);
  // The sample is fine and the lane is live — the refusal is about the season, not the fetch.
  assert.equal(verdict.checks.find((check) => check.name === "sample").ok, true);
  assert.equal(verdict.checks.find((check) => check.name === "lane").ok, true);
});

test("PENDING: the trap — Archon's beta lane carries the Season-2 roster off 16 parses", async () => {
  const [raidItems, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raidItems, dungeons);
  const verdict = seasonVerdict(beta, { liveSeason: "s2", seasonLabels: SEASON_LABELS, roster });

  // The roster check PASSES here. That is the whole reason the gate is a conjunction: a
  // roster-only test would ingest PTR analytics as Season-2 usage.
  assert.equal(verdict.checks.find((check) => check.name === "roster").ok, true);
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.failed.sort(), ["lane", "noBetaWarning", "sample", "season"]);
  assert.ok(beta.totalParses < MIN_PARSES, "the beta lane's sample is far under the floor");
  assert.match(beta.warning, /incorrect/i, "Archon's own warning is kept verbatim");
});

test("PENDING: the committed placeholder is a valid, self-explaining pending record", async () => {
  const doc = await json("data/archon-usage.json");
  assert.deepEqual(archonUsageIssues(doc), []);
  assert.equal(doc.status, "pending");
  assert.deepEqual(doc.specs, []);
  assert.equal(doc.season, null);
  assert.equal(doc.harvestedAt, null);
  assert.ok(doc.pending.reason && doc.pending.gate && doc.pending.checkedAt);
  assert.ok(doc.pending.evidence.length, "the refusal records the page it refused");

  // A pending record that quietly grew spec data, or lost its reason, is not pending.
  assert.ok(archonUsageIssues({ ...doc, specs: [{ class: "Mage", spec: "Frost" }] }).length);
  assert.ok(archonUsageIssues({ ...doc, pending: { ...doc.pending, reason: "" } }).length);
});

/* ---------- the harvested state ---------- */

test("HARVESTED: a page that passes the gate becomes a valid usage file", () => {
  /* Exercised against the SEASON-1 raid fixture with the season set to s1 — the state Archon
     is actually in — so the harvested path runs on real bytes with nothing fabricated. The
     roster here is built from the fixture's own encounter list, because this test is about the
     file the harvester writes once the gate opens; the gate itself is tested above. */
  const roster = raid.encounters.map((name) => ({ kind: "raid", canonical: name, names: [name] }));
  const verdict = seasonVerdict(raid, { liveSeason: "s1", seasonLabels: SEASON_LABELS, roster });
  assert.equal(verdict.ok, true, verdict.reason ?? "");

  const doc = harvestedFile({
    season: "s1", harvestedAt: "2026-08-13",
    specs: [{ class: "Mage", spec: "Frost", brackets: { raid: {
      url: "https://www.archon.gg/wow/builds/frost/mage/raid/gear-and-tier-set/mythic/all-bosses",
      lastUpdated: raid.lastUpdated, totalParses: raid.totalParses,
      sampleDescription: raid.sampleDescription, difficulty: raid.difficulty,
      encounter: raid.encounter, slots: raid.slots, crafted: raid.crafted,
      missives: raid.missives, embellishments: raid.embellishments,
    } } }],
  });
  assert.deepEqual(archonUsageIssues(doc), []);
  assert.equal(doc.status, "harvested");
  assert.equal(doc.pending, null);
  assert.equal(doc.specs[0].brackets.raid.slots.length, 14);

  // Archon's own date, parse count and sample description travel with every cut — a usage
  // share with no population behind it is not a fact anyone can read.
  const stripped = JSON.parse(JSON.stringify(doc));
  stripped.specs[0].brackets.raid.totalParses = null;
  assert.ok(archonUsageIssues(stripped).some((issue) => /parse count/.test(issue)));
});

test("G13: the usage file is structurally unable to impersonate a guide pick", () => {
  const base = harvestedFile({ season: "s2", harvestedAt: "2026-08-20",
    specs: [{ class: "Mage", spec: "Frost", brackets: { raid: {
      lastUpdated: "x", totalParses: 1, sampleDescription: "y",
      slots: [{ slot: "Head", sourceLabel: "Head", items: [{ itemId: "1", name: "n", usagePct: 5 }] }],
    } } }] });
  assert.deepEqual(archonUsageIssues(base), []);
  assert.ok(base.note.includes("NOT a guide recommendation"));

  // Every way this file could grow a vote is a finding, however it is spelled.
  for (const smuggled of [{ endorsement: "bis" }, { picks: 2 }, { consensus: 1 }, { rank: 1 }]) {
    const doc = JSON.parse(JSON.stringify(base));
    Object.assign(doc.specs[0].brackets.raid.slots[0].items[0], smuggled);
    const issues = archonUsageIssues(doc);
    assert.ok(issues.some((issue) => /guide-pick field/.test(issue)),
      `${Object.keys(smuggled)[0]} must be rejected: ${issues.join("; ")}`);
  }
  assert.ok(archonUsageIssues({ ...base, note: "usage data" }).some((i) => /disclaim endorsement/.test(i)));
});

test("a pending record can be rebuilt without losing when the wait started", () => {
  const first = pendingFile({ reason: "r", checkedAt: "2026-08-13", evidence: [{ url: "u" }] });
  const later = pendingFile({ reason: "r2", checkedAt: "2026-08-19", evidence: [{ url: "u" }], previous: first });
  assert.equal(later.pending.since, "2026-08-13");
  assert.equal(later.pending.checkedAt, "2026-08-19");
  assert.deepEqual(archonUsageIssues(later), []);
});
