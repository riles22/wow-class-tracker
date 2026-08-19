// Phase B guide-harvest parser tests (docs/gearing-s2-scope.md G1/G4/G7).
// Fixtures are byte excerpts of the live pages saved 2026-08-18 (recon run) — each test
// pins a recipe against the real markup, including the traps that were found the hard way:
// the possessive-apostrophe variance (King's/Kings' Rest), Method's &rsquo; entities and
// its "Temple of Sethrallis" typo, Wowhead's tie-in-one-li lists, and Icy Veins' paired
// grids with data-wowhead item identity.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { buildGuidePayload, canonicalRosters, canonicalSlot, decodeEntities, nameKey,
  normApostrophes, normalizeDropSource, normalizeStatRun, parseSoftCaps, resolveDropSource }
  from "../src/lib-guides.mjs";
import { articleDate, parseIcyVeinsBis, parseIcyVeinsPriorities }
  from "../src/harvest-guide-icyveins.mjs";
import { gathererNames, guideAuthor, guideBody, guideDate, parseWowheadBis,
  parseWowheadPriorities } from "../src/harvest-guide-wowhead.mjs";
import { methodDate, parseMethodBis, parseMethodPriorities }
  from "../src/harvest-guide-method.mjs";

const fixture = (name) => readFile(new URL(`./fixtures/guides/${name}`, import.meta.url), "utf8");
const json = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const rosters = canonicalRosters(await json("data/raid-items.json"), await json("data/dungeon-items.json"));

test("name joins absorb apostrophe placement, entities, and leading articles", () => {
  assert.equal(nameKey("King's Rest"), nameKey("Kings' Rest"));
  assert.equal(nameKey("Nek’zali the Soulcoiler"), nameKey("Nek'zali the Soulcoiler"));
  assert.equal(nameKey("Ula&rsquo;tek"), nameKey("Ula'tek"));
  assert.equal(nameKey("Blinding Vale"), nameKey("The Blinding Vale"));
  assert.equal(decodeEntities("Kings&rsquo; Rest"), "Kings' Rest");
  assert.equal(normApostrophes("Nek’zali"), "Nek'zali");
});

test("drop-source classification: joins, kinds, decorations, and the hard error", () => {
  assert.equal(normalizeDropSource("Ula’tek — The Venomous Abyss", rosters).boss, "Ula'tek");
  assert.equal(normalizeDropSource("King's Rest", rosters).dungeon, "Kings' Rest");
  assert.equal(normalizeDropSource("Crafted — Spark of Tides", rosters).sourceKind, "crafted");
  assert.equal(normalizeDropSource("Tier Set", rosters).sourceKind, "tier-token");
  assert.equal(normalizeDropSource("Nymrissa Wavecaller", rosters).sourceKind, "world");
  assert.equal(normalizeDropSource("Tidebound Grotto", rosters).sourceKind, "world");
  const catalyst = normalizeDropSource("Ula&rsquo;tek (Catalyst)", rosters);
  assert.equal(catalyst.boss, "Ula'tek");
  assert.equal(catalyst.viaCatalyst, true);
  assert.throws(() => normalizeDropSource("Zorax the Unknown", rosters), /unmatchable drop source/);
});

test("resolveDropSource: token pass absorbs typos, catalog join catches the rest", () => {
  // Method's real typo resolves BY TEXT now — the unique-token pass ("temple") lands it.
  const typo = resolveDropSource("Temple of Sethrallis", null, rosters);
  assert.equal(typo.dungeon, "Temple of Sethraliss");
  assert.equal(typo.sourceTextFuzzy, true);
  // A text no token can rescue falls to the item-ID catalog join, flagged.
  const anyRaidItemId = [...rosters.itemIndex.entries()].find(([, v]) => v.sourceKind === "raid")[0];
  const hit = resolveDropSource("Xyzzy Nonsense", anyRaidItemId, rosters);
  assert.equal(hit.sourceTextUnmatched, true);
  assert.equal(hit.sourceKind, "raid");
  // Both channels dead + an item id -> capped unknown, verbatim text kept, flagged.
  const unknown = resolveDropSource("Xyzzy Nonsense", "999999999", rosters);
  assert.equal(unknown.sourceKind, "unknown");
  assert.equal(unknown.sourceTextUnmatched, true);
  // No item id at all -> the hard error still guards the recipe.
  assert.throws(() => resolveDropSource("Xyzzy Nonsense", null, rosters), /unmatchable/);
});

test("normalizeStatRun: ties in one entry, abbreviations, Item Level lead, skip stats", () => {
  // Wowhead HPal shape: bold li entries with a tie in one li
  const hpal = normalizeStatRun(["Intellect", "Mastery", "Haste = Crit", "Versatility"]);
  assert.equal(hpal.primary, "Intellect");
  assert.deepEqual(hpal.secondaries, ["Mast", "Haste", "Crit", "Vers"]);
  // Method HPal shape: abbreviated names
  const method = normalizeStatRun("Intellect > Mastery > Haste = Crit > Versa".split(/\s*(?:>|=)\s*/));
  assert.deepEqual(method.secondaries, ["Mast", "Haste", "Crit", "Vers"]);
  // Icy Veins shape: Item Level leads, and BM's Weapon Damage is skipped
  const iv = normalizeStatRun(["Item Level", "Mastery", "Haste", "Critical Strike", "Versatility"]);
  assert.equal(iv.leadsWithItemLevel, true);
  assert.deepEqual(iv.secondaries, ["Mast", "Haste", "Crit", "Vers"]);
  assert.deepEqual(normalizeStatRun(["Weapon Damage", "Agility", "Mastery", "Crit"]).secondaries,
    ["Mast", "Crit"]);
});

test("soft caps and slots", () => {
  assert.deepEqual(parseSoftCaps("Haste to 18% > Critical Strike until 40%"),
    [{ stat: "Haste", value: 18, raw: "Haste to 18%" },
      { stat: "Crit", value: 40, raw: "Critical Strike until 40%" }]);
  assert.equal(canonicalSlot("Shoulders"), "Shoulder");
  assert.equal(canonicalSlot("Ring 1"), "Finger");
  assert.equal(canonicalSlot("Off-Hand"), "Off Hand");
  assert.equal(canonicalSlot("Tabard"), null);
});

test("Icy Veins: scoped stat widgets parse with hero-talent AND bracket labels", async () => {
  const priorities = parseIcyVeinsPriorities(await fixture("icyveins-hpal-stat-widgets.html"));
  assert.equal(priorities.length, 3);
  assert.deepEqual(priorities.map((p) => p.label),
    ["Herald of the Sun", "Lightsmith", "Mythic+"]);
  assert.ok(priorities.every((p) => p.leadsWithItemLevel));
  assert.deepEqual(priorities[0].secondaries, ["Mast", "Haste", "Crit", "Vers"]);
  assert.deepEqual(priorities[1].secondaries, ["Mast", "Crit", "Haste", "Vers"]);
});

test("Icy Veins: BiS grid pair parses items, names, and normalized sources", async () => {
  const html = await fixture("icyveins-frost-bis-overall.html");
  assert.equal(articleDate(html), "2026-08-15");
  const rows = parseIcyVeinsBis(html, rosters);
  const overall = rows.filter((r) => r.list === "overall");
  assert.equal(overall.length, 16); // 14 main-grid slots (minus Shirt/Tabard) + 2 weapon slots
  assert.ok(overall.every((r) => /^\d+$/.test(r.itemId) && r.itemName));
  const head = overall.find((r) => r.slot === "Head");
  assert.equal(head.itemId, "271874");
  assert.equal(head.itemName, "Venomkeeper's Horrific Cowl");
  assert.equal(head.boss, "Ula'tek");
  assert.ok(overall.some((r) => r.sourceKind === "world")); // Tidebound Grotto trinket
  assert.ok(overall.some((r) => r.sourceKind === "crafted"));
});

test("Wowhead: printHtml body, Gatherer names, markup BiS table", async () => {
  const html = await fixture("wowhead-frost-bis.html");
  assert.equal(guideDate(html), "2026-08-18");
  assert.equal(guideAuthor(html), "Dorovon");
  const body = guideBody(html);
  assert.ok(body && body.includes("[tabs"));
  const rows = parseWowheadBis(body, gathererNames(html), rosters);
  assert.equal(rows.length, 16);
  assert.ok(rows.every((r) => r.list === "overall")); // raid/M+ strips carry no slots — not harvested
  assert.ok(rows.every((r) => r.itemName), "every row resolves a Gatherer name");
  assert.ok(rows.some((r) => r.sourceKind === "world")); // Nymrissa Wavecaller
  assert.ok(rows.some((r) => r.sourceKind === "tier-token"));
  // catalyzed rows candidate the BASE item and keep the catalyzed result id
  const catalyzed = rows.filter((r) => r.catalyzedResultId);
  assert.ok(catalyzed.every((r) => r.itemId !== r.catalyzedResultId));
});

test("Wowhead: hero-talent × profile priority scoping (the last-symbol trap)", async () => {
  const body = guideBody(await fixture("wowhead-bm-stats-printhtml.html"));
  const priorities = parseWowheadPriorities(body);
  assert.deepEqual(priorities.map((p) => p.label),
    ["Pack Leader · All Situations", "Dark Ranger · Single-Target", "Dark Ranger · AoE"]);
  assert.ok(priorities.every((p) => p.primary === "Agility"));
  assert.deepEqual(priorities[1].secondaries, ["Crit", "Mast", "Haste", "Vers"]);
});

test("Method: ordinal self-date, tab-pane BiS, entity apostrophes, world text pass", async () => {
  const html = await fixture("method-hpal-gearing.html");
  assert.equal(methodDate(html), "2026-08-15"); // ordinal "15th Aug, 2026" on this page
  const rows = parseMethodBis(html, rosters);
  const byList = {};
  for (const r of rows) byList[r.list] = (byList[r.list] || 0) + 1;
  assert.deepEqual(Object.keys(byList).sort(), ["mplus", "overall", "raid"]);
  assert.ok(rows.length >= 45);
  assert.ok(rows.every((r) => /^\d+$/.test(r.itemId)));
  // &rsquo; boss names joined the canonical roster
  assert.ok(rows.some((r) => r.boss === "Ula'tek"));
  // Since the 2026-08-18 launch resolution the fixture's two "The Tidebound Grotto"
  // rows classify world at the TEXT pass — catalog-independent, so a live-catalog
  // refresh can no longer flag fixture rows here. The flagged item-ID fallback stays
  // covered by the resolveDropSource unit test above, which has no catalog coupling.
  assert.equal(rows.filter((r) => r.sourceTextUnmatched).length, 0);
  assert.ok(rows.some((r) => r.sourceKind === "world" && /tidebound grotto/i.test(r.sourceText)));
});

test("Method: all three priority markup shapes normalize", async () => {
  const hpal = parseMethodPriorities(await fixture("method-hpal-stats.html"));
  assert.equal(hpal.length, 1);
  assert.equal(hpal[0].label, "Overall");
  assert.equal(hpal[0].primary, "Intellect");
  assert.deepEqual(hpal[0].secondaries, ["Mast", "Haste", "Crit", "Vers"]); // "Crit"/"Versa" abbreviations
  const outlaw = parseMethodPriorities(await fixture("method-outlaw-stats.html"));
  assert.equal(outlaw.length, 1);
  assert.equal(outlaw[0].primary, "Agility");
  assert.deepEqual(outlaw[0].secondaries, ["Haste", "Crit", "Vers", "Mast"]); // <ol> shape
});

// ---------------------------------------------------------------------------
// Data-level invariants over the HARVESTED guide files (data/guides/*.json).
// These run against whatever the last harvest committed — the shape contract
// that Phase C's consensus model will consume.
const GUIDE_SOURCES = ["icyveins", "wowhead", "method"];
const VALID_LISTS = new Set(["overall", "raid", "mplus"]);
const VALID_KINDS = new Set(["raid", "dungeon", "crafted", "catalyst", "tier-token",
  "world", "pvp", "vendor", "delve", "vault", "boe", "unknown"]);

test("harvested guide files satisfy the Phase B shape contract", async () => {
  const tracker = await json("../data/specs.json");
  const rosterKeys = new Set(tracker.map((s) => `${s.spec} ${s.class}`));
  const bossNames = new Set([...rosters.bosses.values()]);
  const dungeonNames = new Set([...rosters.dungeonNames.values()]);
  for (const id of GUIDE_SOURCES) {
    const g = await json(`data/guides/${id}.json`);
    assert.equal(g.schemaVersion, 1, `${id}: schemaVersion`);
    assert.equal(g.sourceId, id);
    assert.match(g.harvestedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(typeof g.dated, "boolean");
    assert.ok(g.coverage && Number.isFinite(g.coverage.specsHarvested), `${id}: coverage`);
    for (const absent of g.coverage.specsAbsent)
      assert.ok(absent.spec && absent.reason, `${id}: absence must carry a reason`);
    for (const [key, spec] of Object.entries(g.specs)) {
      assert.ok(rosterKeys.has(key), `${id}: unknown spec key "${key}"`);
      assert.match(spec.guideUrl, /^https:\/\//);
      if (spec.published != null) assert.match(spec.published, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(spec.priorities.length || spec.bis.length, `${id}/${key}: empty record`);
      for (const p of spec.priorities) {
        assert.ok(p.label && typeof p.label === "string");
        assert.ok(Array.isArray(p.secondaries) && p.secondaries.length >= 2,
          `${id}/${key}: priority "${p.label}" has ${p.secondaries.length} secondaries`);
        assert.ok(p.secondaries.every((s) => ["Crit", "Haste", "Mast", "Vers"].includes(s)));
        assert.ok(typeof p.raw === "string" && p.raw.length);
      }
      for (const r of spec.bis) {
        assert.ok(VALID_LISTS.has(r.list), `${id}/${key}: list "${r.list}"`);
        assert.ok(canonicalSlot(r.slot) === r.slot, `${id}/${key}: slot "${r.slot}"`);
        assert.match(r.itemId, /^\d+$/);
        assert.ok(VALID_KINDS.has(r.sourceKind), `${id}/${key}: kind "${r.sourceKind}"`);
        if (r.boss != null) assert.ok(bossNames.has(r.boss), `${id}/${key}: boss "${r.boss}"`);
        if (r.dungeon != null) assert.ok(dungeonNames.has(r.dungeon), `${id}/${key}: dungeon "${r.dungeon}"`);
      }
    }
  }
});

test("enhancements data invariants: no ability/trinket pollution, no fragments, diamonds never filler", async () => {
  // Every class of pollution the 2026-08-18 adversarial review found in the shipped
  // payload, pinned against the harvested files so a future harvest cannot re-ship it:
  // abilities as potions (Bloodlust), trinkets as flasks, enchants as oils, anchor-split
  // fragment names, unique-equipped meta diamonds in the socket-everywhere filler lane.
  for (const src of ["icyveins", "wowhead", "method"]) {
    const g = await json(`data/guides/${src}.json`);
    for (const [key, rec] of Object.entries(g.specs)) {
      const enh = rec.enhancements;
      if (!enh) continue;
      const label = `${src}/${key}`;
      const names = (list) => (list ?? []).map((c) => c.name);
      for (const [cat, list] of Object.entries(enh.consumables ?? {})) {
        if (cat === "note") continue;
        for (const name of names(list)) {
          assert.ok(name.length >= 4, `${label} ${cat}: fragment name "${name}"`);
          // Wowhead and Method classify by their own authored labels (Type cells /
          // bold row labels), which outrank any name heuristic — "Light's Potential"
          // is a potion whose name says otherwise. Only the PROSE-classified source
          // (Icy Veins) must satisfy the name-family gates; every source must satisfy
          // cross-family exclusion (a potion candidate may never be a flask, etc.).
          if (src === "icyveins") {
            if (/Potion$/i.test(cat) || cat === "combatPotion")
              assert.match(name, /potion|draught|elixir|philter|brew\b|potential\b|concoction/i,
                `${label} ${cat}: non-potion-family candidate "${name}"`);
            if (cat === "flask")
              assert.match(name, /flask/i, `${label} flask: non-flask candidate "${name}"`);
            if (cat === "augmentRune")
              assert.match(name, /rune/i, `${label} augmentRune: non-rune candidate "${name}"`);
            if (cat === "weaponBuff")
              assert.match(name, /\boil\b|imbue|whetstone|sharpening|weightstone|rite of|sanctification/i,
                `${label} weaponBuff: non-oil candidate "${name}"`);
          }
          if (/Potion$/i.test(cat) || cat === "combatPotion")
            assert.doesNotMatch(name, /flask|\brune\b|enchant /i, `${label} ${cat}: cross-family "${name}"`);
          if (cat === "flask")
            assert.doesNotMatch(name, /potion|\brune\b|enchant /i, `${label} flask: cross-family "${name}"`);
          if (cat === "food")
            assert.doesNotMatch(name, /enchant |flask|potion|\brune\b/i, `${label} food: cross-family "${name}"`);
        }
      }
      const uniqueNames = new Set(names(enh.gems?.unique).map((n) => n.toLowerCase()));
      for (const name of names(enh.gems?.filler)) {
        assert.ok(!/diamond$/i.test(name),
          `${label}: meta diamond "${name}" in the filler lane (unique-equipped)`);
        assert.ok(!uniqueNames.has(name.toLowerCase()),
          `${label}: "${name}" in both gem lanes`);
      }
      for (const e of enh.enchants ?? [])
        for (const name of names(e.candidates))
          assert.ok(name.length >= 4, `${label} enchant ${e.slot}: fragment name "${name}"`);
    }
  }
});

test("unknown-kind rows stay capped — recipe drift trips loudly, never accumulates", async () => {
  for (const id of GUIDE_SOURCES) {
    const g = await json(`data/guides/${id}.json`);
    const unknown = Object.values(g.specs).flatMap((s) => s.bis.filter((r) => r.sourceKind === "unknown"));
    // Method legitimately sources old-expansion dungeons in its alternatives rows and
    // names NPCs outside every catalog we hold ("Vexhul") — real published content, kept
    // verbatim. The cap is calibrated above the 2026-08-18 measured counts (5/0/66) so
    // growth trips review without flagging what the guides actually say.
    assert.ok(unknown.length <= 80,
      `${id}: ${unknown.length} unknown-source rows (cap 80) — first: ${JSON.stringify(unknown[0]?.sourceText)}`);
    assert.ok(unknown.every((r) => r.sourceTextUnmatched && r.sourceText),
      `${id}: unknown rows must keep their verbatim sourceText and the unmatched flag`);
  }
});

test("guide coverage: every roster spec is either harvested or absent-with-reason, per source", async () => {
  const tracker = await json("../data/specs.json");
  const rosterKeys = tracker.map((s) => `${s.spec} ${s.class}`);
  for (const id of GUIDE_SOURCES) {
    const g = await json(`data/guides/${id}.json`);
    const covered = new Set([...Object.keys(g.specs), ...g.coverage.specsAbsent.map((a) => a.spec)]);
    const missing = rosterKeys.filter((k) => !covered.has(k));
    assert.deepEqual(missing, [], `${id}: specs with neither a record nor a recorded absence`);
  }
});

test("buildGuidePayload fails loudly and disambiguates colliding build labels", () => {
  const spec = [{ spec: "Frost", class: "Mage" }];
  const base = { harvestedAt: "2026-08-18", specs: { "Frost Mage": {
    published: "2026-08-18",
    priorities: [{ label: "General", secondaries: ["Mast", "Haste"] }],
    bis: [{ list: "overall", slot: "Neck", itemId: "1" }],
  } } };
  // zero builds for a spec -> throw
  assert.throws(() => buildGuidePayload({ icyveins: { harvestedAt: "2026-08-18", specs: {
    "Frost Mage": { priorities: [], bis: [] } } } }, spec), /zero guide builds/);
  // malformed priority -> throw
  assert.throws(() => buildGuidePayload({ icyveins: { harvestedAt: "2026-08-18", specs: {
    "Frost Mage": { priorities: [{ label: "Bad", secondaries: ["Mast"] }], bis: [] } } } }, spec),
  /malformed priority/);
  // one source, two different orders under ONE label -> unique ids, "(list N)" labels
  const dup = JSON.parse(JSON.stringify(base));
  dup.specs["Frost Mage"].priorities.push({ label: "General", secondaries: ["Haste", "Mast"] });
  const payload = buildGuidePayload({ wowhead: dup }, spec);
  const builds = payload.specs["Frost Mage"].builds;
  assert.equal(builds.length, 2);
  assert.notEqual(builds[0].id, builds[1].id);
  assert.deepEqual(builds.map((b) => b.label), ["General (list 1)", "General (list 2)"]);
  // catalog-slot re-bucketing heals a misfiled row
  const misfiled = JSON.parse(JSON.stringify(base));
  misfiled.specs["Frost Mage"].bis = [{ list: "overall", slot: "Finger", itemId: "42" }];
  const healed = buildGuidePayload({ icyveins: misfiled }, spec,
    { itemSlots: new Map([["42", "Neck"]]) });
  assert.ok(healed.specs["Frost Mage"].candidates.Neck.some((c) => c.itemId === "42"));
  assert.equal(healed.specs["Frost Mage"].candidates.Finger, undefined);
});
