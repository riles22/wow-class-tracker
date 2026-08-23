import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { dungeonLootIdsFrom, parseItem, parsedItemIssues, raidBossLootIdsFrom } from "../src/lib-wowhead.mjs";
import { extractPriority } from "../src/lib-icy-veins.mjs";
import { validateData } from "../src/validate-data.mjs";
import { buildGuidePayload } from "../src/lib-guides.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const rootPath = fileURLToPath(new URL("..", import.meta.url));
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
async function allValidatedData() {
  const [raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency, itemEligibility,
    tier, catalyst, catalystAllocations] = await Promise.all([
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/stat-priority-overrides.json"),
    json("data/stat-priority-baseline.json"), json("data/weapon-proficiency.json"),
    json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"),
  ]);
  return { raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency,
    itemEligibility, tier, catalyst, catalystAllocations };
}

async function loadGuidePayload(raid, dungeons, tier, specs) {
  const [ivGuide, whGuide, meGuide] = await Promise.all([
    json("data/guides/icyveins.json"), json("data/guides/wowhead.json"), json("data/guides/method.json"),
  ]);
  const itemSlots = new Map();
  for (const b of raid.bosses) for (const it of b.items) if (it.slot) itemSlots.set(String(it.id), it.slot);
  for (const d of dungeons.dungeons) for (const it of d.items) if (it.slot) itemSlots.set(String(it.id), it.slot);
  for (const set of tier.sets) for (const it of set.items) if (it.slot) itemSlots.set(String(it.id), it.slot);
  return buildGuidePayload({ icyveins: ivGuide, wowhead: whGuide, method: meGuide },
    specs.specs, { itemSlots, sourceNames: { icyveins: "Icy Veins", wowhead: "Wowhead", method: "Method" } });
}

function guidePage(markup) {
  return `<script>WH.markup.printHtml(${JSON.stringify(markup)}, "guide-body", {});</script>`;
}

function handMatches(hand, item) {
  return !!hand && !hand.mustBeEmpty
    && hand.inventorySlots.includes(item.slot)
    && hand.itemTypes.some((type) => type === (item.type == null ? null : item.type));
}

function weaponMatches(spec, item, handName = null) {
  const short = spec.statPriority.primary.slice(0, 3);
  const primary = item.primary === "Any" || String(item.primary).split("/").includes(short);
  return primary && spec.weaponLoadouts.some((loadout) => {
    const hands = handName ? [handName] : ["mainHand", "offHand"];
    return hands.some((hand) => handMatches(loadout.hands[hand], item));
  });
}

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.listeners = {};
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.value = "";
    this.disabled = false;
    this.hidden = false;
    this.tabIndex = 0;
    this.textContent = "";
    this.classList = { add() {}, remove() {} };
    this._innerHTML = "";
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(value) {
    this._innerHTML = String(value);
    if (value === "") {
      this.children = [];
      if (this.tagName === "SELECT") this.value = "";
    }
  }
  appendChild(child) {
    this.children.push(child);
    if (this.tagName === "SELECT" && !this.value) {
      const option = child.tagName === "OPTION" ? child
        : child.children.find((candidate) => candidate.tagName === "OPTION");
      if (option) this.value = option.value;
    }
    return child;
  }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "tabindex") this.tabIndex = Number(value);
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  focus() {}
  contains() { return false; }
  getBoundingClientRect() { return {right: 0, bottom: 0}; }
}

function fakeDocument(data) {
  const ids = new Map();
  for (const id of ["spec", "profile", "scoring-mode", "spec-info", "scoring-summary", "weight-editor",
    "weight-crit", "weight-haste", "weight-mast", "weight-vers", "weight-reset", "bis-note", "bis",
    "tier-note", "tier", "enh-note", "enh", "src", "paths-note", "paths", "up", "simc", "curilvl", "up-hint",
    "p-items", "p-specs", "foot", "parse"])
    ids.set(id, new FakeElement(["spec", "profile", "scoring-mode"].includes(id) ? "select"
      : id.startsWith("weight-") && id !== "weight-reset" ? "input" : "div"));
  ids.get("scoring-mode").value = "priority";
  ids.get("weight-editor").hidden = true;
  ids.get("curilvl").value = "292";
  const dataElement = new FakeElement("script");
  dataElement.textContent = JSON.stringify(data);
  ids.set("data", dataElement);
  return {
    ids,
    body: new FakeElement("body"),
    createElement: (tag) => new FakeElement(tag),
    getElementById: (id) => ids.get(id) || null,
    querySelector: (selector) => selector.startsWith("#") ? ids.get(selector.slice(1)) || null : null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
}

test("tooltip parsing preserves rating amounts and hybrid primary stats", () => {
  const item = parseItem({
    name: "Hybrid Shield", quality: 4, icon: "shield",
    tooltip: "Item Level 300<br>Binds when picked up<br>Unique-Equipped<br>Off Hand<br>Shield<br>+1,250 Strength<br>+1,250 Intellect<br>+700 Critical Strike<br>+350 Mastery<div>Classes: Priest</div><br>+125 Leech<br>+90 Avoidance<br>+80 Speed<br>Indestructible<br>Prismatic Socket",
  }, "1");
  assert.equal(item.primary, "Str/Int");
  assert.deepEqual(item.secondaries, ["Crit", "Mast"]);
  assert.deepEqual(item.secondaryRatings, { Crit: 700, Mast: 350 });
  assert.deepEqual(item.tertiaries, ["Leech", "Avoidance", "Speed", "Indestructible"]);
  assert.deepEqual(item.tertiaryRatings, { Leech: 125, Avoidance: 90, Speed: 80 });
  assert.deepEqual(item.sockets, ["Prismatic Socket"]);
  assert.deepEqual(item.classes, ["Priest"]);
  assert.equal(item.uniqueEquipped, true);
  assert.deepEqual(parsedItemIssues(item), []);
});

test("tooltip parsing preserves every Use and Equip effect", () => {
  const item = parseItem({
    name: "Two-effect Trinket", quality: 4, icon: "trinket",
    tooltip: "Item Level 300<br>Trinket<br>Use: Gain 500 Intellect for 20 sec.<br>Equip: Harmful spells grant 100 Haste.<br>Requires Level 90",
  }, "2");
  assert.deepEqual(item.effects, [
    { kind: "Use", text: "Gain 500 Intellect for 20 sec." },
    { kind: "Equip", text: "Harmful spells grant 100 Haste." },
  ]);
  assert.equal(item.effectKind, "Use");
  assert.equal(item.effect, "Gain 500 Intellect for 20 sec.");
  assert.deepEqual(parsedItemIssues(item), []);
});

test("guide parsers select semantic loot tables and ignore unrelated links", () => {
  const dungeon = guidePage([
    "[h2]Gear Drops[/h2]",
    "[table][tr][td]Armor[/td][/tr][tr][td]Item[/td][td]Boss Drop[/td][/tr]",
    "[tr][td][item=101 bonus=1][/td][td]Boss One[/td][/tr][/table]",
    "[h2]Class Bonus Rolls[/h2][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=999][/td][td]Weapon[/td][/tr][/table]",
  ].join(""));
  const raid = guidePage([
    "[h3]Gear[/h3][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=201][/td][td]Head[/td][/tr][/table]",
    "[h3]More Rewards[/h3][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=998][/td][td]Mount[/td][/tr][/table]",
  ].join(""));
  assert.deepEqual(dungeonLootIdsFrom(dungeon), ["101"]);
  assert.deepEqual(raidBossLootIdsFrom(raid), ["201"]);
  assert.throws(() => dungeonLootIdsFrom(guidePage("[h2>Overview[/h2]")), /loot table/);
});

test("Icy Veins parser uses the article patch and preserves the ordered stat run", () => {
  const preferred = [
    "<title>Navigation mentions Patch 12.0.5</title>",
    "<h1>Shadow Priest Stat Priority — 12.0.7</h1>",
    "<p>A good guideline for stats is:</p>",
    "<div>Intellect</div><div>Haste</div><div>Mastery</div><div>Critical Strike</div><div>Versatility</div>",
  ].join("");
  assert.deepEqual(extractPriority(preferred), {
    patch: "12.0.7",
    priority: { primary: "Intellect", secondaries: ["Haste", "Mast", "Crit", "Vers"] },
  });

  const fallback = "<h1>Example Guide - 12.0.7</h1><p>Haste</p><p>Mastery</p><p>Critical Strike</p><p>Versatility</p>";
  assert.deepEqual(extractPriority(fallback).priority, {
    primary: null, secondaries: ["Haste", "Mast", "Crit", "Vers"],
  });
  assert.equal(extractPriority("<h1>Broken - 12.0.7</h1><p>Haste</p>").priority, null);
});

test("generated datasets satisfy all build invariants", async () => {
  const data = await allValidatedData();
  const { raid, dungeons } = data;
  const retiredDelves = await json("data/delve-items.json");
  assert.deepEqual(validateData(data), {
    specs: 40, raidBosses: 8, dungeons: 8,
  });
  const kingsRest = dungeons.dungeons.find((dungeon) => dungeon.name === "Kings' Rest");
  const temple = dungeons.dungeons.find((dungeon) => dungeon.name === "Temple of Sethraliss");
  assert.ok(kingsRest.items.some((item) => item.id === "159645"));
  assert.equal(temple.items.some((item) => item.id === "159645"), false);
  // 268231 flipped owners at launch: Wowhead's live guide resolved the PTR duplicate
  // listing to The Coiled Altar (boss 7), retiring the Nek'zali override (2026-08-18).
  assert.ok(raid.bosses.find((boss) => boss.boss === 7).items.some((item) => item.id === "268231"));
  assert.equal(raid.bosses.find((boss) => boss.boss === 1).items.some((item) => item.id === "268231"), false);
  assert.equal(raid.counts.tokens, 21);
  assert.ok(raid.bosses.find((boss) => boss.boss === 8).items.some((item) => item.id === "270909"));
  const hexIdol = raid.bosses.flatMap((boss) => boss.items).find((item) => item.id === "270169");
  assert.deepEqual(hexIdol.effects.map((effect) => effect.kind), ["Equip", "Use"]);
  assert.deepEqual({status: retiredDelves.status, consumedByBuild: retiredDelves.consumedByBuild,
    items: retiredDelves.items}, {status: "retired", consumedByBuild: false, items: []});
  const catalystBases = [...raid.bosses, ...dungeons.dungeons].flatMap((group) => group.items)
    .filter((item) => ["Head", "Shoulder", "Chest", "Hands", "Legs"].includes(item.slot));
  assert.equal(catalystBases.length, 94);
  assert.deepEqual(data.catalyst.mappedVenomcursedItemIds,
    ["271874", "271875", "271876", "271878"]);
  const directTier = data.tier.sets.flatMap((set) => set.items);
  assert.equal(data.tier.sets.length, 13);
  assert.equal(directTier.length, 65);
  assert.ok(directTier.every((item) => item.secondaries.length === 2));
  assert.deepEqual(data.catalystAllocations.counts,
    { catalystBases: 94, otherRanked: 157, directTier: 65, items: 316 });
  assert.equal(data.catalystAllocations.schemaVersion, 4);
  assert.deepEqual(data.catalyst.chargeSystem.catalystUnbound,
    { requirement: "first 4-piece class-set bonus", scope: "character", unlocksBonusDrops: true });
  assert.equal(data.catalyst.chargeSystem.serpentScion.bonusCharges, 1);
  assert.equal(Object.keys(data.catalystAllocations.items).length, 316);
  assert.ok(Object.values(data.catalystAllocations.items).every((item) =>
    Object.values(item.allocations).reduce((sum, value) => sum + value, 0) === 7000));
});

test("validation rejects incomplete data and curated-source drift", async () => {
  const valid = await allValidatedData();
  const mutations = [
    ["missing sheet", /item-level sheet/, (data) => { data.sheet = null; }],
    ["missing armor", /invalid armor type/, (data) => { data.specs.specs[0].armor = null; }],
    ["wrong but valid armor", /invalid armor type/, (data) => {
      data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Blood Death Knight").armor = "Cloth";
    }],
    ["stat profile drift", /generated stat profile drifted/, (data) => {
      const shadow = data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Shadow Priest");
      shadow.statPriority.secondaries = ["Vers", "Crit", "Haste", "Mast"];
    }],
    ["weapon source drift", /generated weapon loadouts drifted/, (data) => {
      data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Arms Warrior").weaponLoadouts = [];
    }],
    ["deleted contextual profile source", /contextual-profile roster/, (data) => {
      delete data.statOverrides.overrides["Shadow Priest"];
    }],
    ["reviewed flat-priority drift", /reviewed baseline/, (data) => {
      data.statBaseline.priorities["Frost Mage"].secondaries = ["Vers", "Haste", "Crit", "Mast"];
    }],
    ["missing trinket eligibility", /lacks explicit eligibility/, (data) => {
      delete data.itemEligibility.items["193762"];
    }],
    ["missing primary-bearing trinket rule", /trinket-eligibility roster/, (data) => {
      delete data.itemEligibility.items["158368"];
    }],
    ["missing unique metadata", /lacks unique-equipped metadata/, (data) => {
      delete data.raid.bosses[0].items[0].uniqueEquipped;
    }],
    ["empty dungeon", /no dungeon items/, (data) => { data.dungeons.dungeons[0].items = []; }],
    ["key-level ladder drift", /key-level ladder changed/, (data) => {
      data.dungeons.keyLevels[0].end = 999;
    }],
    ["reduced sheet checks", /sheet validation is incomplete/, (data) => {
      data.sheet.validation.total = 1;
      data.sheet.validation.confirmed = 1;
    }],
    ["lost provisional marker", /provisional-source markers/, (data) => {
      data.sheet.sheetOnlyKeys = data.sheet.sheetOnlyKeys.filter((key) => key !== "raidVault");
    }],
    ["leftover rating keys", /unexpected rating keys/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items).find((candidate) => candidate.secondaries.length);
      item.secondaries = [];
    }],
    ["missing armor item type", /lacks the armor type/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items).find((candidate) => candidate.slot === "Head");
      item.type = null;
    }],
    ["invalid item primary", /invalid primary-stat label/, (data) => {
      data.raid.bosses[0].items.find((item) => item.slot).primary = "Spirit";
    }],
    ["unexplained slotless raid item", /unexplained slotless raid item/, (data) => {
      data.raid.bosses[0].items.find((item) => item.slot).slot = null;
    }],
    ["catalyst slot drift", /catalyst slot policy/, (data) => {
      data.catalyst.setBonusSlots = data.catalyst.setBonusSlots.filter((slot) => slot !== "Head");
    }],
    ["direct tier stat loss", /invalid direct-tier stats/, (data) => {
      data.tier.sets[0].items[0].secondaries.pop();
    }],
    ["direct tier valid-pair drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.tier.sets[0].items[0];
      item.secondaries = ["Haste", "Vers"];
      item.secondaryRatings = { Haste: 80, Vers: 121 };
    }],
    ["direct tier rating drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.tier.sets[0].items[0];
      item.secondaryRatings = { ...item.secondaryRatings, Crit: 1, Mast: 999 };
    }],
    ["catalyst base slot swap", /Catalyst fingerprint/, (data) => {
      const items = data.raid.bosses.flatMap((boss) => boss.items);
      items.find((item) => item.id === "268236").slot = "Waist";
      items.find((item) => item.id === "268257").slot = "Legs";
    }],
    ["catalyst effect drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items)
        .find((candidate) => candidate.id === "271874");
      item.effect = "Unrelated effect.";
    }],
    ["catalyst secondary effect drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items)
        .find((candidate) => candidate.id === "271874");
      item.effects.push({ kind: "Equip", text: "Unreviewed second effect." });
    }],
    ["catalyst source substitution", /direct sources/, (data) => {
      data.catalyst.sources.blizzardPatchNotes = "https://example.com/not-authoritative";
    }],
    ["catalyst preservation drift", /preservation policy/, (data) => {
      data.catalyst.preservation.sockets = "guaranteed";
    }],
    ["catalyst charge unlock drift", /charge policy/, (data) => {
      data.catalyst.chargeSystem.catalystUnbound.scope = "account";
    }],
    ["stable allocation drift", /invalid stable secondary allocation/, (data) => {
      const entry = data.catalystAllocations.items["271555"];
      entry.allocations.Crit = 1;
    }],
    ["balanced allocation drift", /allocation values drifted/, (data) => {
      const entry = data.catalystAllocations.items["271555"];
      entry.allocations.Crit += 100;
      entry.allocations.Mast -= 100;
    }],
  ];
  for (const [label, expected, mutate] of mutations) {
    const data = clone(valid);
    mutate(data);
    assert.throws(() => validateData(data), expected, label);
  }
});

test("stat profiles and explicit weapon edge cases remain correct", async () => {
  const [specDoc, raid, dungeons] = await Promise.all([
    json("data/specs.json"), json("data/raid-items.json"), json("data/dungeon-items.json"),
  ]);
  const findSpec = (key) => specDoc.specs.find((spec) => `${spec.spec} ${spec.class}` === key);
  const items = [...raid.bosses, ...dungeons.dungeons].flatMap((group) => group.items);
  const weapons = items.filter((item) => [
    "Main Hand", "One-Hand", "Two-Hand", "Off Hand", "Held In Off-hand", "Ranged",
  ].includes(item.slot));

  const shadow = findSpec("Shadow Priest");
  assert.deepEqual(shadow.statPriorityVariants.map((profile) => profile.secondaries), [
    ["Haste", "Mast", "Crit", "Vers"],
    ["Mast", "Crit", "Haste", "Vers"],
  ]);

  const frost = findSpec("Frost Death Knight");
  const spiritcudgel = items.find((item) => item.name === "Malevolent Spiritcudgel");
  assert.ok(spiritcudgel);
  assert.equal(weaponMatches(frost, spiritcudgel), false);

  for (const key of ["Havoc Demon Hunter", "Vengeance Demon Hunter"])
    assert.equal(findSpec(key).weaponLoadouts.some((loadout) =>
      Object.values(loadout.hands).some((hand) => (hand.itemTypes || []).includes("Dagger"))), false);

  const devourer = findSpec("Devourer Demon Hunter");
  assert.ok(weapons.some((item) => item.type === "Dagger" && weaponMatches(devourer, item)));

  const survival = findSpec("Survival Hunter");
  assert.equal(survival.weaponLoadouts.some((loadout) =>
    Object.values(loadout.hands).some((hand) => (hand.itemTypes || []).includes("Fist Weapon"))), false);

  const assassination = findSpec("Assassination Rogue").weaponLoadouts[0];
  assert.deepEqual(assassination.hands.mainHand.itemTypes, ["Dagger"]);
  assert.deepEqual(assassination.hands.offHand.itemTypes, ["Dagger"]);

  const outlaw = findSpec("Outlaw Rogue").weaponLoadouts[0];
  assert.equal(outlaw.hands.mainHand.itemTypes.includes("Dagger"), false);
  assert.equal(outlaw.hands.offHand.itemTypes.includes("Dagger"), true);

  const subtlety = findSpec("Subtlety Rogue").weaponLoadouts[0];
  assert.deepEqual(subtlety.hands.mainHand.itemTypes, ["Dagger"]);
  assert.ok(subtlety.hands.offHand.itemTypes.length > 1);

  const enhancement = findSpec("Enhancement Shaman");
  assert.equal(enhancement.weaponLoadouts[0].hands.mainHand.itemTypes.includes("Dagger"), false);

  const windwalkerTwoHand = findSpec("Windwalker Monk").weaponLoadouts
    .find((loadout) => loadout.id === "two-hand-staff-polearm");
  assert.deepEqual(windwalkerTwoHand.hands.mainHand.itemTypes, ["Staff", "Polearm"]);

  const mistweaver = findSpec("Mistweaver Monk");
  assert.ok(weapons.some((item) => item.slot === "Held In Off-hand"
    && weaponMatches(mistweaver, item, "offHand")));

  const fury = findSpec("Fury Warrior").weaponLoadouts[0];
  assert.deepEqual(fury.hands.mainHand.inventorySlots, ["Two-Hand"]);
  assert.deepEqual(fury.hands.offHand.inventorySlots, ["Two-Hand"]);
});

test("self-contained output embeds current data and valid browser JavaScript", async () => {
  const [html, template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, icons] = await Promise.all([
    readFile(fromRoot("wow-s2-gearing.html"), "utf8"),
    readFile(fromRoot("src/app.template.html"), "utf8"),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"),
    json("data/icons.json"),
  ]);
  const embedded = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(embedded);
  const payload = JSON.parse(embedded[1]);
  // guides is PRECOMPUTED by build.mjs from data/guides/*.json (Phase C) — assert its
  // shape and provenance here, and byte-equality for every directly-embedded dataset.
  const { guides, ...direct } = payload;
  assert.deepEqual(direct, {
    raid, specs, dungeons, sheet, itemEligibility, tier, catalyst, catalystAllocations,
    icons: icons.icons,
  });
  assert.deepEqual(Object.keys(guides.sources).sort(), ["icyveins", "method", "wowhead"]);
  assert.equal(Object.keys(guides.specs).length, 40);
  assert.ok(Object.values(guides.specs).every((s) => s.builds.length >= 1),
    "every spec carries at least one published Build option");
  // The seam is live, not just shaped (adversarial review): a real 3/3 candidate and a
  // real per-source trinket-letter set exist in the SHIPPED payload.
  const frost = guides.specs["Frost Mage"];
  assert.ok(frost.candidates.Neck.some((c) => c.itemId === "268265" && c.consensus === 3),
    "Frost Mage Neck 268265 must ship as a 3/3 candidate");
  assert.ok(frost.trinketTiers.icyveins?.length >= 3,
    "Frost Mage ships Icy Veins trinket letter tiers");
  // No spec ships two Build options with the same id (G7 disambiguation).
  for (const [key, s] of Object.entries(guides.specs)) {
    const ids = s.builds.map((b) => b.id);
    assert.equal(new Set(ids).size, ids.length, `${key}: duplicate Build ids`);
  }

  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.doesNotThrow(() => new Function(scripts.at(-1)[1]));
  assert.match(template, /filter\(it => maxAttainable\(it\) > threshold\)/);
  assert.match(template, /Trinket upgrades are listed by item level, not ranked/);
  /* The reference row stopped being a tablist at Option A stage 3 (2026-08-22): the sheet
     is the page and these five are independent reference views, none of which needs to be
     open. The pin follows the pattern — the affordance must still carry correct ARIA. */
  assert.doesNotMatch(template, /role="tablist"/);
  assert.match(template, /<nav class="refrow" aria-label="Reference">/);
  for (const p of ["tier", "enh", "up", "src", "paths"]) {
    assert.match(template, new RegExp('id="tab-' + p + '"[^>]*aria-expanded="false"'),
      `reference button ${p} must be a disclosure`);
    assert.match(template, new RegExp('id="p-' + p + '"[^>]*role="region"'),
      `reference panel ${p} must be a labelled region`);
  }
  // the sheet is not one of them — it is the page, and cannot be closed
  assert.doesNotMatch(template, /id="tab-bis"/);
  assert.match(template, /id="p-bis" aria-label="Gear recommendations"/);
  /* Three placement pins, each one a defect that was MEASURED rather than noticed:
     the reference row must follow the sheet in the DOM (it kept the old tab strip's
     position and so was still the first thing under the setup card); the sheet must be
     emitted before the weapon cards (they pushed the first slot row to 1,785px); and it
     must span the whole of #bis, because boxed into one 623px grid column the desktop
     row template overflowed all 13 rows and no media query could help — a media query
     measures the viewport, not the column. */
  assert.ok(template.indexOf('<nav class="refrow"') > template.indexOf('id="p-bis"'),
    "the reference row must come after the slot sheet");
  assert.ok(/customBanner\(\)\s*\+\s*.<div class="sheet">/.test(template)
    && template.indexOf("weaponLoadoutCards(weaponItems)", template.indexOf("customBanner()"))
       > template.indexOf('<div class="sheet">'),
    "the sheet must be emitted before the weapon loadout cards");
  assert.match(template, /#bis \.sheet\{grid-column:1\/-1\}/);
  assert.match(template, /<label for="spec">Specialization<\/label>/);
  assert.match(template, /<label for="profile">Build<\/label>/);
  assert.doesNotMatch(template, /<label for="scenario">/);
  assert.match(template, /class="skip-link" href="#main-content"/);
  assert.doesNotMatch(template, /Validated reference model/);
  assert.doesNotMatch(template, /Guide order \(rough\)/);
  assert.match(template, /Guide consensus \(default\)/);
  assert.match(template, /Custom decimal weights/);
  assert.doesNotMatch(template, /Questionably Epic|questionablyepic\.com/);
  assert.match(template, /@media \(max-width:640px\)/);
  assert.doesNotMatch(template, /main_hand:'One-Hand'/);
});

/* The artifact is verified against data/ but was never verified against its own TEMPLATE
   (audit 2026-08-14). Proven before this test existed: inserting a new element into
   src/app.template.html and NOT rebuilding left the committed artifact without it while the
   whole suite stayed green — a template-only edit published nothing and nothing said so.
   This closes it by reversing the build's two markup transformations (data injection, then
   CSP insertion) and requiring what is left to be the template byte-for-byte. It therefore
   also catches a hand-edited artifact, which is the same failure from the other side. */
test("the built artifact is the current template — a template edit without a rebuild fails", async () => {
  const [html, templateRaw] = await Promise.all([
    readFile(fromRoot("wow-s2-gearing.html"), "utf8"),
    readFile(fromRoot("src/app.template.html"), "utf8"),
  ]);
  // build.mjs normalizes CRLF->LF before hashing; do the same so a Windows checkout of the
  // template cannot fail this on line endings alone.
  const template = templateRaw.replace(/\r\n?/g, "\n");

  // Undo CSP injection: build.mjs inserts exactly one meta immediately after the charset meta.
  const withoutCsp = html.replace(
    /(<meta charset="utf-8">)\n<meta http-equiv="Content-Security-Policy" content="[^"]*">/,
    "$1");
  assert.notEqual(withoutCsp, html, "artifact must carry the build-injected CSP meta");

  // Undo data injection: put the placeholder back.
  const restored = withoutCsp.replace(
    /(<script id="data" type="application\/json">)[\s\S]*?(<\/script>)/,
    "$1__DATA__$2");
  assert.ok(restored.includes("__DATA__"), "artifact must carry the data script block");

  assert.equal(restored, template,
    "wow-s2-gearing.html does not match src/app.template.html — run `node gearing/src/build.mjs`");
});

test("client app: consensus-first ranking, source-labeled Builds, custom override announces", async () => {
  const [template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, icons] = await Promise.all([
    readFile(fromRoot("src/app.template.html"), "utf8"),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"), json("data/icons.json"),
  ]);
  const guides = await loadGuidePayload(raid, dungeons, tier, specs);
  const data = { raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, guides, icons: icons.icons };
  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const appSource = `${scripts.at(-1)[1]}\nreturn { current: () => CUR, scoreFor: id => scoreItem(CUR, BY_ID[id]), weights: () => activeWeights(CUR), consensusOf: id => consensusCount(BY_ID[id]) };`;
  const startClient = (clientData) => {
    const document = fakeDocument(clientData);
    const app = new Function("document", "innerWidth", "innerHeight", appSource)(document, 1600, 900);
    return { document, app };
  };
  const { document, app } = startClient(data);
  const specSelect = document.ids.get("spec");
  const scoringMode = document.ids.get("scoring-mode");
  const profileSelect = document.ids.get("profile");

  /* Boot: consensus mode and the G1 headline facts, on Frost Mage. The default spec used
     to be hardcoded to Frost Mage, so this read it for free; since 2026-08-22 the page
     opens on your last spec (then the top of the list), and a test should name the
     fixture it needs rather than lean on an app default. */
  specSelect.value = "Mage|Frost";
  specSelect.listeners.change();
  assert.equal(app.current().spec, "Frost");
  assert.equal(scoringMode.value, "consensus");
  assert.match(document.ids.get("scoring-summary").innerHTML, /Guide consensus ranks first/);
  assert.match(document.ids.get("bis-note").innerHTML, /Ranked by guide consensus/);
  assert.match(document.ids.get("bis-note").innerHTML, /never summed/);
  // A 3/3-consensus item leads its slot. Neck is probed because Aqirbane Reliquary
  // 268265 is named by all three guides for Frost Mage. (Head would work too since the
  // 2026-08-22 sheet merged tier slots back in, but Neck keeps this pin stable.)
  assert.equal(app.consensusOf("268265"), 3);
  const bisHtml = document.ids.get("bis").innerHTML;
  assert.match(bisHtml, /3\/3 guides/);
  assert.match(bisHtml, /data-ilvl-ceiling>up to \d+/); // the G2 named ilvl term
  const neckCard = bisHtml.slice(bisHtml.indexOf('<span class="sname">Neck</span>'));
  const firstRow = neckCard.indexOf('data-id="');
  assert.ok(firstRow >= 0 && neckCard.slice(firstRow, firstRow + 24).includes("268265"),
    "the 3/3-consensus Neck item leads its slot");
  /* The sheet is the whole character: every slot gets a row, tier slots included and
     marked rather than moved to another tab (audit 2026-08-22). */
  for (const slot of ["Head", "Shoulder", "Chest", "Hands", "Legs"])
    assert.match(bisHtml, new RegExp('<span class="sname">' + slot + '</span>'),
      `tier slot ${slot} must appear on the sheet, not only under the Catalyst tab`);
  assert.match(bisHtml, /class="stier"/, "tier slots are marked with a badge on the sheet");
  assert.doesNotMatch(bisHtml, /Tier slots &mdash; guide picks without drop data/,
    "the leftover tier card is gone — those picks fold into their own slot rows");
  // G8 (revised 2026-08-18): trinkets rank by guide-consensus COUNT with ties shared;
  // per-source letters still never merge, and stat fit is never computed for them.
  assert.match(bisHtml, /Icy Veins: S/);
  assert.match(bisHtml, /rank by guide-consensus count alone/);
  assert.match(bisHtml, /Stat fit is never computed/);
  // The ranked trinket rows carry rank spans; ties share a number (dense ranking).
  const trinketCardHtml = bisHtml.slice(bisHtml.indexOf("<h3>Trinkets<"));
  const trinketRanks = [...trinketCardHtml.matchAll(/Guide-consensus rank[^>]*>(\d+)</g)].map(m => Number(m[1]));
  assert.ok(trinketRanks.length >= 2, "at least two guide-named trinkets carry rank numbers");
  assert.equal(trinketRanks[0], 1, "the ranked trinket list starts at rank 1");
  for (let i = 1; i < trinketRanks.length; i++)
    assert.ok(trinketRanks[i] === trinketRanks[i-1] || trinketRanks[i] === trinketRanks[i-1] + 1,
      "dense ranking: each rank repeats (tie) or increments by exactly one");

  // Adversarial-review pins (2026-08-18, wf_3b2d327a-5ee — each was a shipped-state HIGH):
  // (1) Weapon-slot guide-only picks render: Frost Mage's crafted off-hand pick appears
  //     in the Weapons guide-picks card (74/265 picks previously rendered NOWHERE).
  assert.match(document.ids.get("bis").innerHTML, /Aln'hara Lantern/);
  assert.match(document.ids.get("bis").innerHTML, /Weapons &mdash; guide picks without drop data/);
  // (2) Guide-only trinkets RANK: Wavecaller's Seastone (3/3 world) must carry a rank
  //     number, sharing rank 1 with the 3/3 catalog trinket — not dangle unranked.
  {
    const bisNow2 = document.ids.get("bis").innerHTML;
    const seastone = bisNow2.match(/<div class="row" data-guide-only="true" data-id="270167">[\s\S]*?<\/span>/);
    assert.ok(seastone, "Wavecaller's Seastone renders as a guide-only trinket row");
    assert.match(seastone[0], /Guide-consensus rank[^>]*>1</,
      "the 3/3 world trinket shares rank 1, never unranked below ranked rows");
  }
  // (3) The unknown/stale-id lanes never surface: no named candidate in the payload may
  //     carry a kind outside crafted/world (Method's 63 sourceTextUnmatched rows hold
  //     WotLK-era item ids and must stay data-only).
  for (const spec of Object.values(guides.specs))
    for (const cell of Object.values(spec.candidates))
      for (const c of cell)
        if (c.name) assert.ok(c.kind === "crafted" || c.kind === "world",
          `named candidate ${c.itemId} has non-presentable kind ${c.kind}`);
  // (4) Eligibility conflicts are DISCLOSED, not hidden: Restoration Druid's guides name
  //     Lightspire Core (250214) but the curated eligibility list excludes it.
  specSelect.value = "Druid|Restoration";
  specSelect.listeners.change();
  {
    const rdruBis = document.ids.get("bis").innerHTML;
    const filtered = rdruBis.match(/data-eligibility-filtered="true" data-id="250214"[\s\S]*?<\/div>/);
    assert.ok(filtered, "the guides-named-but-eligibility-excluded trinket renders as a disclosed row");
    assert.match(rdruBis, /Excluded by recommendation eligibility/);
  }

  // Enhancements tab (Riley, 2026-08-18): consensus-ranked enchants/gems/consumables.
  {
    const enhHtml = document.ids.get("enh").innerHTML;
    const enhNote = document.ids.get("enh-note").innerHTML;
    if (/No enhancement recommendations harvested/.test(enhHtml)) {
      // Pre-harvest state: the pane must say so honestly and render nothing else.
      assert.equal(enhNote, "");
    } else {
      assert.match(enhNote, /Ranked by guide consensus/);
      assert.match(enhNote, /Covered by <b>\d of 3<\/b> guides/);
      assert.match(enhHtml, /<h3>Enchants<span>/);
      assert.match(enhHtml, /Main Hand/);
      assert.match(enhHtml, /<h3>Consumables<span>/);
      // Every candidate row carries a consensus chip; ranks start at 1 per group.
      assert.match(enhHtml, /data-enh-cand="true"/);
      assert.match(enhHtml, /\d\/3 guides: /);
      assert.doesNotMatch(enhHtml, /undefined/);
    }
  }

  // G7: the Build selector lists exactly the published combinations, source-labeled.
  specSelect.value = "Priest|Shadow";
  specSelect.listeners.change();
  assert.deepEqual(profileSelect.children.map((o) => o.value),
    ["icyveins:Shadow Priest", "wowhead:Archon", "wowhead:Voidweaver"]);
  assert.ok(profileSelect.children.every((o) => / — /.test(o.textContent)),
    "every Build option names its source");

  // Switching Builds switches the fit order (BM Hunter's published orders differ).
  specSelect.value = "Hunter|Beast Mastery";
  specSelect.listeners.change();
  const GUIDE = [1, 0.75, 0.5, 0.25];
  const bmBuilds = guides.specs["Beast Mastery Hunter"].builds;
  const packLeader = bmBuilds.find((b) => /Pack Leader/.test(b.label));
  const darkRangerSt = bmBuilds.find((b) => /Dark Ranger .*Single/.test(b.label));
  profileSelect.value = packLeader.id;
  profileSelect.listeners.change();
  assert.deepEqual(app.weights(),
    Object.fromEntries(packLeader.secondaries.map((s, i) => [s, GUIDE[i]])));
  profileSelect.value = darkRangerSt.id;
  profileSelect.listeners.change();
  assert.deepEqual(app.weights(),
    Object.fromEntries(darkRangerSt.secondaries.map((s, i) => [s, GUIDE[i]])));

  // G6: custom mode is a FULL override and announces itself on every ranked surface.
  scoringMode.value = "custom";
  scoringMode.listeners.change();
  assert.match(document.ids.get("scoring-summary").innerHTML, /waiting for all four/);
  document.ids.get("weight-crit").value = "1.12";
  document.ids.get("weight-haste").value = "0.99";
  document.ids.get("weight-mast").value = "1.25";
  document.ids.get("weight-vers").value = "0.40";
  document.ids.get("weight-mast").listeners.input();
  assert.match(document.ids.get("scoring-summary").innerHTML, /Custom weights supplied by you/);
  for (const surface of ["bis", "tier"])
    assert.match(document.ids.get(surface).innerHTML, /Ranked by your custom weights/,
      `custom announcement missing on #${surface}`);
  // Ranked-row consensus chips carry data-consensus=; the trinket card's informational
  // "named by N/3 guides" chips deliberately STAY (trinkets are never consensus-ranked,
  // so the custom override changes nothing about them).
  assert.doesNotMatch(document.ids.get("bis").innerHTML, /data-consensus=/,
    "ranked-row consensus chips leave under the full custom override");
  // G6 TOTALITY, behaviorally: under custom the Neck card's row order must equal pure
  // descending fit — consensus must not influence it (mutation-proof: a compareItems
  // that still consults consensus under custom breaks this on real data).
  {
    const bh = document.ids.get("bis").innerHTML;
    // bounded by the Neck sheet row rather than the old <h3> card (sheet, 2026-08-22)
    /* Bound by the NEXT slot row, not by </details>: each candidate row contains its own
       item-details disclosure, so the first </details> closes inside row 1. */
    const start = bh.indexOf('<span class="sname">Neck</span>');
    const next = bh.indexOf('<span class="sname">', start + 1);
    const card = bh.slice(start, next < 0 ? undefined : next);
    const ids = [...card.matchAll(/data-id="(\d+)"/g)].map((m) => m[1]);
    assert.ok(ids.length >= 2, "the Neck slot renders multiple candidate rows");
    const scores = ids.map((id) => app.scoreFor(id));
    for (let i = 1; i < scores.length; i++)
      assert.ok(scores[i - 1] >= scores[i] - 1e-12,
        "custom-mode Neck order must be non-increasing fit: " + ids.join(",") + " -> " + scores.join(","));
  }

  // Weapon-card edge cases survive.
  specSelect.value = "Demon Hunter|Devourer";
  specSelect.listeners.change();
  assert.match(document.ids.get("bis").innerHTML, /Allowed types:/);
  const uniqueWeaponData = clone(data);
  for (const group of [...uniqueWeaponData.raid.bosses, ...uniqueWeaponData.dungeons.dungeons])
    for (const item of group.items)
      if (["Main Hand", "One-Hand"].includes(item.slot)) item.uniqueEquipped = true;
  const uniqueWeaponClient = startClient(uniqueWeaponData);
  uniqueWeaponClient.document.ids.get("spec").value = "Demon Hunter|Devourer";
  uniqueWeaponClient.document.ids.get("spec").listeners.change();
  assert.match(uniqueWeaponClient.document.ids.get("bis").innerHTML, /Alternative hand only:/);
});

test("weapon consensus merges hand vocabularies in BOTH directions", async () => {
  // Guides file weapons by worn hand ("Main Hand"); the catalog stores the item's own
  // slot type ("One-Hand"). 271092 (Jan'thrazet, the Soul Fang) is Frost Mage's
  // 3/3-consensus weapon and must resolve through the equivalence.
  const [template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, icons] = await Promise.all([
    readFile(fromRoot("src/app.template.html"), "utf8"),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"), json("data/icons.json"),
  ]);
  const guides = await loadGuidePayload(raid, dungeons, tier, specs);
  const data = { raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, guides, icons: icons.icons };
  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const appSource = `${scripts.at(-1)[1]}\nreturn { consensusOf: id => consensusCount(BY_ID[id]), setSpec: v => { const s = document.getElementById("spec"); s.value = v; s.listeners.change(); } };`;
  const document = fakeDocument(data);
  const app = new Function("document", "innerWidth", "innerHeight", appSource)(document, 1600, 900);
  // Main-hand direction: guides say "Main Hand", catalog says "One-Hand". Selected
  // explicitly — this used to ride on Frost Mage being the hardcoded default spec.
  app.setSpec("Mage|Frost");
  assert.equal(app.consensusOf("271092"), 3);
  // Off-hand direction (the adversarial-review high): Devourer's Baleful Hexblade is the
  // unanimous OFF-hand pick of all three guides; its catalog slot is "One-Hand".
  app.setSpec("Demon Hunter|Devourer");
  assert.equal(app.consensusOf("268211"), 3);
});

test("the game plan shows two named components and lights potential up after a paste", async () => {
  const [template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, icons] = await Promise.all([
    readFile(fromRoot("src/app.template.html"), "utf8"),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"), json("data/icons.json"),
  ]);
  const guides = await loadGuidePayload(raid, dungeons, tier, specs);
  const data = { raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, guides, icons: icons.icons };
  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const appSource = `${scripts.at(-1)[1]}\nreturn {};`;
  const document = fakeDocument(data);
  new Function("document", "innerWidth", "innerHeight", appSource)(document, 1600, 900);

  // Every dungeon now carries a full droppedBy attribution (the Phase D fill).
  for (const d of dungeons.dungeons)
    for (const it of d.items)
      assert.ok(it.droppedBy, `${d.name} ${it.id} lacks droppedBy after the Phase D fill`);

  // (a) Coverage renders without any paste; (b) potential explicitly says how to get it.
  const before = document.ids.get("src").innerHTML;
  assert.match(before, /two separate signals and never adds them together/);
  assert.match(before, /Guide-named/);
  assert.match(before, /paste your <code>\/simc<\/code> export in the Upgrade checker/);
  assert.match(before, /drops at 279\/292\/305\/318/); // boss 1 ladder shown
  assert.match(before, /\d+\/3<\/span>/); // consensus chips with guide counts
  assert.doesNotMatch(before, /<b>\+\d+<\/b>/,
    "no potential numbers may render before a paste");
  assert.match(before, /does not change with custom weights/);

  // The Crafted section (Riley, 2026-08-18): guide-named crafted pieces render with
  // counts only — no fit, no potential — and the sheet's crafted ceiling is cited.
  assert.match(before, /<h3>Crafted<span>/);
  assert.match(before, /guide-named pieces/);
  assert.match(before, /no fit score and no potential/);

  // Guide-only picks in the slot cards: out-of-catalog items (crafted/world) render as
  // clearly-marked rows with consensus chips and never a fit score or drop ladder.
  const bisNow = document.ids.get("bis").innerHTML;
  assert.match(bisNow, /data-guide-only="true"/);
  assert.match(bisNow, /No harvested item data/);
  const guideOnlyBlocks = [...bisNow.matchAll(/data-guide-only="true"[\s\S]*?<\/div><\/div>/g)];
  assert.ok(guideOnlyBlocks.length >= 1, "at least one guide-only pick renders");
  for (const m of guideOnlyBlocks)
    assert.ok(!/Fit \d/.test(m[0]), "guide-only picks must never show a fit score");

  // A paste with NO readable item levels must keep the dash — never claim "+0"
  // (the adversarial review's high finding: an uncomputed quantity shown as computed).
  document.ids.get("simc").value = "head=x,id=1\nneck=x,id=1";
  document.ids.get("parse").listeners.click();
  const noIlvls = document.ids.get("src").innerHTML;
  assert.doesNotMatch(noIlvls, /<b>\+\d+<\/b>/, "unreadable paste must not fabricate potential");
  assert.match(noIlvls, /&mdash;/);

  // Paste a deliberately low-ilvl kit: every named source should now show positive gain.
  const simcLines = ["head=x,id=1,ilevel=280", "neck=x,id=1,ilevel=280", "back=x,id=1,ilevel=280",
    "chest=x,id=1,ilevel=280", "wrist=x,id=1,ilevel=280", "hands=x,id=1,ilevel=280",
    "waist=x,id=1,ilevel=280", "legs=x,id=1,ilevel=280", "feet=x,id=1,ilevel=280",
    "finger1=x,id=1,ilevel=280", "finger2=x,id=1,ilevel=280",
    "trinket1=x,id=1,ilevel=280", "trinket2=x,id=1,ilevel=280", "main_hand=x,id=1,ilevel=280"];
  document.ids.get("simc").value = simcLines.join("\n");
  document.ids.get("parse").listeners.click();
  const after = document.ids.get("src").innerHTML;
  assert.match(after, /<b>\+\d+<\/b>/, "potential column lights up after the paste");
  // The two components stay separate: the potential cell never absorbs the named count.
  assert.match(after, /Guide-named<\/th>/);
  // Token bosses surface guide-named TIER pieces as labeled coverage.
  assert.match(after, /\/3 \(tier\)<\/span>/, "tier coverage chips render on token bosses");
  assert.match(after, /Your potential<\/th>/);
});
