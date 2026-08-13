/* Phase C — the client's scoring model v2 (docs/gearing-s2-scope.md G6, G8, G12–G17).
 *
 * TWO STATES HAVE TO BE RIGHT AT ONCE, and only one of them exists in the repo.
 * The PENDING state is the shipping state: no guide can honestly be harvested before the
 * 2026-08-18 flip, so `guide-picks.json`, `guide-priorities.json` and `archon-usage.json`
 * all ship empty and the page has to be both correct and honest that way. The HARVESTED
 * state has no committed instance, so it is exercised through fixtures built out of the
 * REAL roster and the REAL item ids the client will actually join against — a fixture with
 * invented ids could not catch the join failure that matters most.
 *
 * Everything here boots the real app script out of src/app.template.html through
 * `new Function`, exactly as test/project.test.mjs does: no `location` and no `history` in
 * that scope, so any URL touch in the client must stay typeof-guarded.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { injectGuideLib } from "../src/inline-guides.mjs";
import { harvestedFile } from "../src/harvest-archon-gear.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const GEARING_ROOT = fileURLToPath(new URL("../", import.meta.url));
/* The template carries a __LIB_GUIDES__ placeholder the build substitutes with
   src/lib-guides.mjs (src/inline-guides.mjs). Booting the raw template would run a page
   the browser never sees, so the tests assemble it exactly the way the build does. */
const appTemplate = async () =>
  injectGuideLib(await readFile(fromRoot("src/app.template.html"), "utf8"), GEARING_ROOT);
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));

/* ---------- the client harness (mirrors test/project.test.mjs) ---------- */

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
  getBoundingClientRect() { return { right: 0, bottom: 0 }; }
}

function fakeDocument(data) {
  const ids = new Map();
  for (const id of ["spec", "build", "scoring-mode", "spec-info", "scoring-summary", "weight-editor",
    "weight-crit", "weight-haste", "weight-mast", "weight-vers", "weight-reset", "bis-note", "bis",
    "tier-note", "tier", "src", "paths-note", "paths", "up", "simc", "curilvl", "up-hint",
    "p-items", "p-specs", "foot", "parse"])
    ids.set(id, new FakeElement(["spec", "build", "scoring-mode"].includes(id) ? "select"
      : id.startsWith("weight-") && id !== "weight-reset" ? "input" : "div"));
  ids.get("scoring-mode").value = "consensus";
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

async function clientFixture() {
  const [template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, guidePicks, guidePriorities, archonUsage, icons] = await Promise.all([
    appTemplate(),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"),
    json("data/guide-picks.json"), json("data/guide-priorities.json"), json("data/archon-usage.json"),
    json("data/icons.json"),
  ]);
  const data = { raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, guidePicks, guidePriorities, archonUsage, icons: icons.icons };
  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const appSource = `${scripts.at(-1)[1]}\nreturn { current: () => CUR, `
    + "builds: () => buildsFor(CUR), build: () => activeBuild(), priority: () => activePriority(), "
    + "consensus: id => consensusFor(BY_ID[id]) };";
  const startClient = (clientData = data, spec = "Priest|Shadow") => {
    const document = fakeDocument(clientData);
    const app = new Function("document", "innerWidth", "innerHeight", appSource)(document, 1600, 900);
    if (spec) {
      document.ids.get("spec").value = spec;
      document.ids.get("spec").listeners.change();
    }
    return { document, app };
  };
  return { template, data, startClient };
}

/* Ordered item ids per card, in the order the page actually renders them. The card title is
   the slot, so "Back" is the Back slot card; `.card wide` sections (Trinkets, the Catalyst
   plan) split the same way and keep their own titles. */
function cardsOf(html) {
  const out = new Map();
  // Split on `class="card` without the closing quote: the wide cards (Trinkets, the Catalyst
  // plan) are `class="card wide"` and are otherwise swallowed by the card before them.
  for (const part of String(html).split('<div class="card').slice(1)) {
    const title = /<h3>([^<]*)</.exec(part)?.[1];
    if (!title) continue;
    out.set(title, [...part.matchAll(/data-id="(\d+)"/g)].map((match) => match[1]));
  }
  return out;
}

const rowOf = (html, id) => {
  const at = String(html).indexOf(`data-id="${id}"`);
  if (at < 0) return "";
  const start = String(html).lastIndexOf('<div class="row', at);
  const end = String(html).indexOf('<div class="row', at);
  return String(html).slice(start, end < 0 ? undefined : end);
};

const GUIDE_SOURCES = {
  icyveins: { label: "Icy Veins", published: "2026-08-18" },
  wowhead: { label: "Wowhead class guides", published: "2026-08-18" },
  method: { label: "Method", published: "2026-08-17" },
};

const picksDoc = (specKey, picks, trinketTiers = []) => ({
  source: "Icy Veins + Wowhead + Method (docs/gearing-s2-scope.md G4)",
  quantity: "picks", note: "Guide-authored endorsements (G9/G10).",
  status: "harvested", season: "s2", harvestedAt: "2026-08-19",
  sources: clone(GUIDE_SOURCES), pending: null,
  specs: { [specKey]: { picks, trinketTiers } },
});

/* A pick is only counted when the list that cast it matches the ITEM's own bracket, or is
   the "overall" fallback (G10) — so the fixture has to know which bracket each real id is. */
const bracketOfId = (data, id) =>
  data.raid.bosses.some((boss) => boss.items.some((item) => String(item.id) === String(id)))
    ? "raid" : "mplus";

/* ------------------------------------------------------- the injected contract */

/* The client cannot import lib-guides.mjs — this page is one self-contained file with no
   module loader. It used to carry a byte-for-byte COPY guarded by a drift test; that was
   replaced (2026-08-13) by build-time injection, so divergence is impossible rather than
   merely detected. What is worth testing now is that the injection actually happened, that
   it produced ONE definition, and that the library body is scoped so it cannot collide with
   the page — it DID collide, on CATALYST, the first time it was inlined whole. */
test("the ranking contract is injected from lib-guides.mjs, once, and scoped", async () => {
  const template = (await appTemplate()).replace(/\r\n/g, "\n");
  const lib = (await readFile(fromRoot("src/lib-guides.mjs"), "utf8")).replace(/\r\n/g, "\n");

  assert.doesNotMatch(template, /__LIB_GUIDES__/, "the placeholder must be substituted");
  assert.doesNotMatch(template, /MIRROR-BEGIN/, "the old copied mirror must not come back");

  // Exactly one definition of each ordering rule reaches the page.
  for (const name of ["rankCandidates", "consensusForItem", "defaultBuildFor", "bandOf"]) {
    const defs = template.match(new RegExp("^(?:function|const) " + name + "\\b", "gm")) ?? [];
    assert.equal(defs.length, 1, name + " must be defined exactly once in the page");
  }

  // The injected body is the library's own, verbatim apart from the export keyword.
  const rank = /function rankCandidates\(entries\) \{[\s\S]*?\n\}/.exec(template);
  assert.ok(rank, "rankCandidates must reach the page");
  assert.ok(lib.replace(/^export /gm, "").includes(rank[0]),
    "the injected rankCandidates must be the library body, unedited");

  // Scoping: privates stay inside the IIFE, so the page keeps its own CATALYST.
  const iife = /const __guideLib = \(\(\) => \{[\s\S]*?\n\}\)\(\);/.exec(template);
  assert.ok(iife, "the library must be wrapped so its privates cannot reach page scope");
  // CATALYST is the name that actually collided when the library was inlined bare.
  assert.match(iife[0], /const CATALYST = \/catalyst\//, "the private lives inside the wrapper");
  assert.doesNotMatch(template.replace(iife[0], ""), /const CATALYST = \/catalyst\//,
    "…and nowhere else");
  // The page declares it alongside TIER in one statement, so there is no leading `const`
  // immediately before the name.
  assert.match(template.replace(iife[0], ""), /CATALYST = DB\.catalyst/,
    "…while the page keeps its own CATALYST");
});

/* ---------------------------------------------------------------- pending */

test("with no harvest the page ranks on stat fit alone and says so in visible text", async () => {
  const { data, startClient } = await clientFixture();
  const { document } = startClient();
  const note = document.ids.get("bis-note").innerHTML;

  // The panel note, not a tooltip: a title= does not exist on touch.
  assert.match(note, /No guide harvest has run yet, so every list below is ordered by equal-item-level secondary-stat fit alone/);
  assert.match(note, /No guide picks are counted and no row carries a guide count/);
  assert.ok(note.includes(data.guidePicks.pending.gate), "the note must carry the recorded gate verbatim");
  assert.doesNotMatch(note, /title="[^"]*guide harvest/i);
  assert.match(note, /data-guide-state="pending"/);

  // G14: the usage column states its recorded reason rather than going blank or disappearing.
  assert.match(note, /data-archon-state="pending"/);
  const escaped = (value) => value.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  assert.ok(note.includes(escaped(data.archonUsage.pending.reason)),
    "the Archon column must state the reason recorded in the pending file");
  assert.match(note, /never votes, never ranks and never breaks a tie/);

  const bis = document.ids.get("bis").innerHTML;
  // Every row carries the two non-ordering columns; none carries a guide count.
  assert.match(bis, /<span class="lab">Max item level<\/span>/);
  assert.match(bis, /<span class="lab">Worn by \(Archon\)<\/span>/);
  assert.doesNotMatch(bis, /guides pick this|guide picks this|lists it as an option/);
  assert.doesNotMatch(bis, /<span class="lab">Guide picks<\/span>/);

  // The same two states are stated on the other ranked panels.
  assert.match(document.ids.get("tier-note").innerHTML, /data-guide-state="pending"/);
  assert.match(document.ids.get("tier-note").innerHTML, /data-archon-state="pending"/);
  document.ids.get("simc").value = "back=current_cloak,id=999998,ilevel=250";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /data-guide-state="pending"/);

  // Pending must also mean UNCHANGED ordering: the Build list still comes off specs.json.
  assert.deepEqual(document.ids.get("build").children.map((option) => option.value),
    ["Voidweaver (single- and multi-target)", "Archon (single- and multi-target)"]);
});

/* ---------------------------------------------------------------- G15 */

test("a harvested pick outranks every unnamed item, and an alternative only breaks ties", async () => {
  const { data, startClient } = await clientFixture();
  const baseline = cardsOf(startClient().document.ids.get("bis").innerHTML).get("Back");
  assert.ok(baseline.length >= 4, "expected a Back card deep enough to test promotion");
  const target = baseline[3];          // a mid-table item no stat-fit sort would ever lift
  const bracket = bracketOfId(data, target);

  // Endorsed as a BiS pick: straight to the top (G15 band 1), everything else in place.
  const picked = clone(data);
  picked.guidePicks = picksDoc("Shadow Priest",
    [{ source: "method", bracket, slot: "Back", itemId: target, endorsement: "bis" }]);
  const pickedHtml = startClient(picked).document.ids.get("bis").innerHTML;
  const pickedOrder = cardsOf(pickedHtml).get("Back");
  assert.equal(pickedOrder[0], target);
  assert.deepEqual(pickedOrder.filter((id) => id !== target),
    baseline.filter((id) => id !== target),
    "promoting one item must not disturb the relative order of the rest");

  // The SAME endorsement at "alternative" strength does not promote (G15 band 2): a single
  // passing mention may not bury a materially better-statted item.
  const listed = clone(data);
  listed.guidePicks = picksDoc("Shadow Priest",
    [{ source: "method", bracket, slot: "Back", itemId: target, endorsement: "alternative" }]);
  const listedHtml = startClient(listed).document.ids.get("bis").innerHTML;
  assert.deepEqual(cardsOf(listedHtml).get("Back"), baseline);
  assert.match(rowOf(listedHtml, target), /1<\/b> guide lists it as an option/);

  // Two picks outrank one pick; the third item is endorsed only as an option and stays put.
  const contested = clone(data);
  contested.guidePicks = picksDoc("Shadow Priest", [
    { source: "method", bracket, slot: "Back", itemId: target, endorsement: "bis" },
    { source: "icyveins", bracket, slot: "Back", itemId: baseline[4], endorsement: "bis" },
    { source: "wowhead", bracket, slot: "Back", itemId: baseline[4], endorsement: "bis" },
  ]);
  const contestedOrder = cardsOf(startClient(contested).document.ids.get("bis").innerHTML).get("Back");
  assert.deepEqual(contestedOrder.slice(0, 2), [baseline[4], target]);
});

test("the two counts are shown separately, name their sources, and are never summed", async () => {
  const { data, startClient } = await clientFixture();
  const baseline = cardsOf(startClient().document.ids.get("bis").innerHTML).get("Back");
  const target = baseline[0];
  const bracket = bracketOfId(data, target);
  const both = clone(data);
  both.guidePicks = picksDoc("Shadow Priest", [
    { source: "icyveins", bracket, slot: "Back", itemId: target, endorsement: "bis" },
    { source: "method", bracket, slot: "Back", itemId: target, endorsement: "bis" },
    { source: "wowhead", bracket, slot: "Back", itemId: target, endorsement: "alternative" },
  ]);
  const { document, app } = startClient(both);
  const row = rowOf(document.ids.get("bis").innerHTML, target);

  assert.match(row, /<b>2<\/b> guides pick this/);
  assert.match(row, /Icy Veins · Method/);
  assert.match(row, /<b>1<\/b> guide lists it as an option/);
  assert.match(row, /Wowhead class guides/);
  // G9: 2 and 1 never become 3, and never become an average.
  assert.doesNotMatch(row, /<b>3<\/b> guides/);
  assert.deepEqual(app.consensus(target),
    { picks: 2, alternatives: 1, picksBy: ["icyveins", "method"], alternativesBy: ["wowhead"] });
  assert.match(document.ids.get("bis-note").innerHTML, /data-guide-state="harvested"/);
  assert.match(document.ids.get("bis-note").innerHTML, /never added together/);
});

/* ---------------------------------------------------------------- G6 */

test("custom weights still override the ordering and still disclose themselves", async () => {
  const { data, startClient } = await clientFixture();
  const baseline = cardsOf(startClient().document.ids.get("bis").innerHTML).get("Back");
  const target = baseline[0];
  const harvested = clone(data);
  harvested.guidePicks = picksDoc("Shadow Priest", [{ source: "icyveins",
    bracket: bracketOfId(data, target), slot: "Back", itemId: target, endorsement: "bis" }]);

  const { document } = startClient(harvested);
  document.ids.get("scoring-mode").value = "custom";
  document.ids.get("scoring-mode").listeners.change();
  for (const [stat, value] of [["crit", "0.10"], ["haste", "0.10"], ["mast", "2.50"], ["vers", "0.10"]])
    document.ids.get(`weight-${stat}`).value = value;
  document.ids.get("weight-mast").listeners.input();

  const order = cardsOf(document.ids.get("bis").innerHTML).get("Back");
  // The custom numbers really are driving the sort: the unnamed items reorder under them.
  const unnamed = order.filter((id) => id !== target);
  assert.notDeepEqual(unnamed, baseline.filter((id) => id !== target),
    "custom weights must change the ordering of the items no guide named");
  assert.equal(order[0], target, "a guide's pick still leads its band under custom weights");

  // The disclosure is VISIBLE text on the ranked surfaces, never a title= (touch legibility).
  document.ids.get("simc").value = "back=current_cloak,id=999998,ilevel=250";
  document.ids.get("parse").listeners.click();
  const upgrade = document.ids.get("up").innerHTML;
  assert.ok(upgrade.includes("<b>Ordered by your custom weights</b>, not by the guide stat order."));
  assert.doesNotMatch(upgrade, /title="[^"]*custom weights/i);
  assert.match(upgrade, /your numbers order everything else/);
  assert.match(document.ids.get("bis-note").innerHTML,
    /Using your custom decimal weights instead of guide order/);
  assert.match(document.ids.get("scoring-summary").innerHTML, /Custom weights supplied by you/);
});

/* ---------------------------------------------------------------- G16 */

test("the item level column renders as its own labeled column and never reorders anything", async () => {
  const { data, startClient } = await clientFixture();
  const baseline = cardsOf(startClient().document.ids.get("bis").innerHTML).get("Back");
  const bottom = baseline[baseline.length - 1];

  const raised = clone(data);
  let touched = false;
  for (const boss of raised.raid.bosses)
    if (boss.items.some((item) => String(item.id) === String(bottom))) {
      boss.dropLevels = boss.dropLevels.map((step) => ({ ...step, ilvl: 999 }));
      touched = true;
    }
  if (!touched)   // an M+ item: raise the key ladder instead
    raised.dungeons.keyLevels = raised.dungeons.keyLevels.map((row) => ({ ...row, end: 999, vault: 999 }));

  const html = startClient(raised).document.ids.get("bis").innerHTML;
  assert.deepEqual(cardsOf(html).get("Back"), baseline,
    "item level is a column, never an ordering term (G16)");
  assert.match(rowOf(html, bottom), /<span class="lab">Max item level<\/span>/);
  assert.match(rowOf(html, bottom), /<b>999<\/b>/);

  // M+ items carry ilvl: null and direct-tier items reach no modeled ladder — neither may
  // print an invented number.
  const tierHtml = startClient().document.ids.get("tier").innerHTML;
  const directId = /data-id="(\d+)" data-direct-tier="true"/.exec(tierHtml)?.[1];
  assert.ok(directId, "expected a direct-tier row");
  assert.match(rowOf(tierHtml, directId), /not modeled for this source/);
  assert.doesNotMatch(rowOf(tierHtml, directId), /<b>\d+<\/b> /);
});

/* ---------------------------------------------------------------- G13 */

test("the Archon usage column shows a share, and reaches no ordering path", async () => {
  const { data, startClient } = await clientFixture();
  const baseline = cardsOf(startClient().document.ids.get("bis").innerHTML).get("Back");
  const bottom = baseline[baseline.length - 1];
  const bracket = bracketOfId(data, bottom);
  const item = [...data.raid.bosses, ...data.dungeons.dungeons]
    .flatMap((group) => group.items).find((candidate) => String(candidate.id) === String(bottom));

  const worn = clone(data);
  worn.archonUsage = harvestedFile({
    season: "s2", harvestedAt: "2026-08-20",
    specs: [{ class: "Priest", spec: "Shadow", brackets: { [bracket]: {
      url: "https://www.archon.gg/wow/builds/shadow/priest/raid/gear-and-tier-set/mythic/all-bosses",
      lastUpdated: "2026-08-20T12:00:00Z", totalParses: 4210,
      sampleDescription: "Top 100 Mythic parses per boss",
      slots: [{ slot: "Back", sourceLabel: "Back",
        items: [{ itemId: String(bottom), name: item.name, usagePct: 99.4 }] }],
      crafted: [], missives: [], embellishments: [],
    } } }],
  });

  const { document } = startClient(worn);
  const html = document.ids.get("bis").innerHTML;
  // Near-universal usage on the WORST-fitting item moves it precisely nowhere (G13).
  assert.deepEqual(cardsOf(html).get("Back"), baseline);
  assert.match(rowOf(html, bottom), /<b>99\.4%<\/b>/);
  assert.match(rowOf(html, bottom), /Top 100 Mythic parses per boss/);
  assert.match(document.ids.get("bis-note").innerHTML, /data-archon-state="harvested"/);

  /* Structural, not just behavioural: usage must not be reachable from the comparators at
     all. The ordering functions are the injected contract plus rankedCandidates, and neither
     may name the usage lane — a tiebreak added later would pass the behavioural test above
     whenever the fit values happen to differ. */
  const template = (await appTemplate()).replace(/\r\n/g, "\n");
  const ordering = /function rankedCandidates\(list\) \{[\s\S]*?\n\}/.exec(template)[0]
    + /const __guideLib = \(\(\) => \{[\s\S]*?\n\}\)\(\);/.exec(template)[0];
  assert.doesNotMatch(ordering, /ARCHON_USAGE|usageFor|usagePct|usageCell/);
  assert.doesNotMatch(ordering, /maxAttainable|ilvlCell|dropLevels/);
  /* …and usage is read in exactly one place and rendered in exactly one place: the
     non-ordering column strip. Definitions are masked out so what remains is call sites. */
  const calls = template.replace(/function (usageFor|usageCell)\(/g, "function masked(");
  assert.equal([...calls.matchAll(/\busageFor\(/g)].length, 1);
  assert.equal([...calls.matchAll(/\busageCell\(/g)].length, 1);
  assert.match(/function rowFacts\([\s\S]*?\n\}/.exec(template)[0], /usageCell\(it\)/);
});

/* ---------------------------------------------------------------- G8 */

test("trinket letter tiers render per source, unmerged, and order nothing", async () => {
  const { data, startClient } = await clientFixture();
  const trinkets = cardsOf(startClient().document.ids.get("bis").innerHTML).get("Trinkets");
  assert.ok(trinkets.length >= 2, "expected usable trinkets for Shadow Priest");

  const lettered = clone(data);
  lettered.guidePicks = picksDoc("Shadow Priest", [], [
    { source: "icyveins", itemId: trinkets[1], tier: "S" },
    { source: "wowhead", itemId: trinkets[1], tier: "A" },
  ]);
  const { document } = startClient(lettered);
  const html = document.ids.get("bis").innerHTML;
  const row = rowOf(html, trinkets[1]);

  assert.match(row, /Icy Veins<\/span><b>S<\/b>/);
  assert.match(row, /Wowhead class guides<\/span><b>A<\/b>/);
  // Never merged into one grade, and never averaged into a letter nobody published.
  assert.doesNotMatch(row, /\bS\/A\b|\bA\/S\b|average/i);
  assert.match(html, /1 of these carry a guide letter tier/);
  assert.match(html, /never merged into one grade/);
  assert.match(html, /presentation convention .*not a ranking claim/);
  // The letters must not reorder the card, and trinkets must stay out of the ranking.
  assert.deepEqual(cardsOf(html).get("Trinkets"), trinkets);
  assert.match(html, /Trinkets are not ranked here/);
});

/* ---------------------------------------------------------------- G12 / G17 */

test("the Build list becomes the union across sources, defaulting to the corroborated scoping", async () => {
  const { data, startClient } = await clientFixture();
  const harvested = clone(data);
  harvested.guidePriorities = {
    source: "Icy Veins + Wowhead + Method (docs/gearing-s2-scope.md G4)",
    quantity: "priorities", note: "Published stat orders, never weights (G1/G12).",
    status: "harvested", season: "s2", harvestedAt: "2026-08-19",
    sources: clone(GUIDE_SOURCES), pending: null,
    specs: { "Shadow Priest": { builds: [
      /* FIRST in document order and scoped by nobody else — "first published" would default
         here, which is exactly what G17 rejects. */
      { id: "wowhead:archon-single-target", source: "wowhead", label: "Archon, Single-Target",
        heroTalent: "Archon", bracket: null, fightProfile: "Single-Target",
        secondaries: ["Crit", "Vers", "Haste", "Mast"] },
      // Two outlets publishing the same SCOPING (hero talent + bracket) — the corroborated one.
      { id: "icyveins:voidweaver-raid", source: "icyveins", label: "Voidweaver",
        heroTalent: "Voidweaver", bracket: "raid", fightProfile: null,
        secondaries: ["Haste", "Mast", "Crit", "Vers"],
        softCaps: [{ stat: "Haste", value: 1800, unit: "rating", text: "Haste (until 1800 rating)" }] },
      { id: "method:voidweaver-raiding", source: "method", label: "Voidweaver raiding",
        heroTalent: "Voidweaver", bracket: "raid", fightProfile: null,
        secondaries: ["Haste", "Crit"] },
    ] } },
  };

  const { document, app } = startClient(harvested);
  const buildSelect = document.ids.get("build");
  // G12: every published variant survives, keyed by its synthetic id and labeled with WHO
  // published it — two outlets can publish the same variant name.
  assert.deepEqual(buildSelect.children.map((option) => option.value),
    ["wowhead:archon-single-target", "icyveins:voidweaver-raid", "method:voidweaver-raiding"]);
  assert.deepEqual(buildSelect.children.map((option) => option.textContent), [
    "Archon, Single-Target — Wowhead class guides",
    "Voidweaver — Icy Veins",
    "Voidweaver raiding — Method",
  ]);
  // G17: the default is the scoping more than one source publishes, not the first listed.
  assert.equal(buildSelect.value, "icyveins:voidweaver-raid");
  assert.equal(app.build().id, "icyveins:voidweaver-raid");
  assert.deepEqual(app.priority().secondaries, ["Haste", "Mast", "Crit", "Vers"]);
  // The soft cap is data the guide published, so it renders beside the priority, with the
  // unit it was published in — a rating cap is not a percentage cap.
  assert.match(document.ids.get("spec-info").innerHTML, /Haste <span class="cap">to 1800 rating<\/span>/);
  assert.match(document.ids.get("bis-note").innerHTML, /published by <b>Icy Veins<\/b>/);

  // Switching build switches the stat order, by id and not by name.
  buildSelect.value = "method:voidweaver-raiding";
  buildSelect.listeners.change();
  assert.deepEqual(app.priority().secondaries, ["Haste", "Crit"]);
  assert.match(document.ids.get("bis-note").innerHTML, /Voidweaver raiding — Method/);
});
