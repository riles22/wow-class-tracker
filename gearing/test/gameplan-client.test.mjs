/* Phase D — the game plan on the Loot sources tab (docs/gearing-s2-scope.md G2, G18–G21).
 *
 * WHAT THIS GUARDS. The plan joins three things that already existed separately and never
 * touched: the ranked candidates the Gear recommendations tab shows, the `droppedBy` field the
 * client had never once read, and the difficulty / key-level ladders. Each join is a place the
 * page can quietly start telling two stories — a coverage count that means items rather than
 * slots, a delta with no basis, a sort that claims a key it did not use, or a "your ranked
 * slots" that disagrees with the tab those ranks came from. All four are asserted here.
 *
 * PENDING IS THE SHIPPING STATE, and so is NO PASTE. No guide can honestly be harvested before
 * the 2026-08-18 flip, and most readers arrive without a `/simc` paste, so the empty-handed
 * rendering is the one this tab has to get right first: it is tested before anything else.
 *
 * Everything boots the real app script out of src/app.template.html through `new Function`,
 * exactly as test/project.test.mjs and test/ranking-client.test.mjs do — no `location` and no
 * `history` in that scope, so every URL touch in the client stays typeof-guarded.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { injectGuideLib } from "../src/inline-guides.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const GEARING_ROOT = fileURLToPath(new URL("../", import.meta.url));
/* The template carries a __LIB_GUIDES__ placeholder the build substitutes with
   src/lib-guides.mjs. Booting the raw template would run a page the browser never sees, so the
   tests assemble it exactly the way build.mjs does. */
const appTemplate = async () =>
  injectGuideLib(await readFile(fromRoot("src/app.template.html"), "utf8"), GEARING_ROOT);
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));

/* ---------- the client harness (mirrors test/ranking-client.test.mjs) ---------- */

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
    "p-items", "p-specs", "foot", "parse",
    // Phase D's one new control. The two older harnesses do not stub it, which is exactly why
    // every touch of it in the client is guarded.
    "plan-sort", "plan-sort-state"])
    ids.set(id, new FakeElement(["spec", "build", "scoring-mode", "plan-sort"].includes(id) ? "select"
      : id.startsWith("weight-") && id !== "weight-reset" ? "input" : "div"));
  ids.get("scoring-mode").value = "consensus";
  ids.get("plan-sort").value = "coverage";
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
  /* Hooks onto the plan's own inputs, so a test can compare what the page RENDERED against
     what the planner actually returned rather than re-deriving either. */
  const appSource = `${scripts.at(-1)[1]}
    const __ranked = () => rankedGearBySlot();
    const __plans = kind => planForSources(planEntries(kind),
      {rankedBySlot: __ranked(), worn: wornBySlot(__ranked())});
    return { current: () => CUR, ranked: __ranked, plans: __plans,
      worn: () => wornBySlot(__ranked()),
      sorted: (kind, by) => sortPlans(__plans(kind), by).map(plan => plan.source.name) };`;
  const startClient = (spec = "Priest|Shadow") => {
    const document = fakeDocument(data);
    const app = new Function("document", "innerWidth", "innerHeight", appSource)(document, 1600, 900);
    if (spec) {
      document.ids.get("spec").value = spec;
      document.ids.get("spec").listeners.change();
    }
    return { document, app };
  };
  return { template, data, startClient };
}

/* ---------- reading what the tab rendered ---------- */

const RAID_CARD = "The Venomous Abyss";
const DUNGEON_CARD = "Mythic+ dungeon pool";

/* The plan table of one card. The Mythic+ card carries a SECOND src-tbl (the key-level table
   this phase had to keep), so the plan table is taken as the first one rather than by matching
   rows — otherwise the key rows read as dungeons with no coverage. */
function planRows(html, marker) {
  const card = String(html).split('<div class="card">').find((part) => part.includes(marker));
  assert.ok(card, `expected a "${marker}" card`);
  const table = card.split('<table class="src-tbl">')[1].split("</table>")[0];
  return table.split("<tr>").slice(1).filter((row) => !row.includes("<th>")).map((row) => {
    const cells = row.split(/<td[^>]*>/).slice(1);
    return {
      name: /^(?:<b>\d+<\/b><\/td>)?([^<]*)/.exec(cells[1])[1],
      detail: cells[1],
      coverage: Number(/<b>(\d+)<\/b>/.exec(cells[2])?.[1] ?? 0),
      depth: Number(/<b>(\d+)<\/b>/.exec(cells[3])?.[1] ?? 0),
      delta: cells[4],
      forYou: cells[5],
      slots: cells[6],
      raw: row,
    };
  });
}

/* Every row the Gear recommendations tab gave a NUMBERED rank to — its ranked candidate set.
   Special-effect rows ("S") and the reserved off-hand row ("U") are outside the ranking by
   construction and are excluded here for the same reason the plan excludes them. */
function numberedGearIds(html) {
  return [...String(html).matchAll(/data-id="(\d+)"><span class="rank"[^>]*>([^<]*)<\/span>/g)]
    .filter((match) => /^\d+$/.test(match[2])).map((match) => match[1]);
}

const SIMC_KEY = { Head: "head", Neck: "neck", Shoulder: "shoulder", Back: "back", Chest: "chest",
  Wrist: "wrist", Hands: "hands", Waist: "waist", Legs: "legs", Feet: "feet", Finger: "finger1",
  Trinket: "trinket1", "Main Hand": "main_hand", "One-Hand": "main_hand", "Two-Hand": "main_hand",
  Ranged: "main_hand", "Off Hand": "off_hand", "Held In Off-hand": "off_hand" };

/* A `/simc` paste carrying a chosen item level per slot. Ids are deliberately unknown to the
   page — the parser reads the id and the `ilevel=`, and the plan only needs the level. */
function simcPaste(levelBySlot, fallbackLevel) {
  const lines = new Map();
  for (const [slot, key] of Object.entries(SIMC_KEY)) {
    const level = levelBySlot[slot] ?? fallbackLevel;
    if (level == null) continue;
    // One simc slot can back several item slots; the LOWEST requested level wins, which is
    // what wearing one item in that slot means.
    lines.set(key, Math.min(lines.get(key) ?? level, level));
  }
  return [...lines].map(([key, level], index) =>
    `${key}=worn_${key},id=${900000 + index},ilevel=${level}`).join("\n");
}

function readGear(document, text) {
  document.ids.get("simc").value = text;
  document.ids.get("parse").listeners.click();
}

/* ------------------------------------------------- the empty-handed state */

test("with no gear pasted the plan renders, names both components, and explains the empty column",
  async () => {
    const { document } = await clientFixture().then((fixture) => fixture.startClient());
    const html = document.ids.get("src").innerHTML;

    // Both components exist as their own columns and are named as such.
    assert.match(html, /<th>Improves<\/th><th>More options<\/th><th>Upgrade<\/th>/);
    assert.match(html, /counts how many of your ranked SLOTS a source can fill/);
    assert.match(html, /never\s+added together/);
    // …and the page states the thing G19 exists to prevent, in words.
    assert.match(html, /slots, not items, because you can only wear one Back/);

    // G2: without a paste the delta is not computable, and the page SAYS SO in visible text
    // rather than printing a zero or an empty cell. Not a title= — a tooltip does not exist
    // on touch, and this is the column most likely to be asked about.
    assert.match(html, /data-plan-delta="unread"/);
    assert.match(html, /The upgrade column is empty because this page has not read your gear yet/);
    assert.match(html, /Paste your <code>\/simc<\/code> output/);
    assert.doesNotMatch(html, /title="[^"]*upgrade/i);

    const raid = planRows(html, RAID_CARD);
    assert.equal(raid.length, 8, "every raid boss keeps a row");
    for (const row of raid) {
      assert.match(row.delta, /needs your gear/);
      assert.doesNotMatch(row.delta, /\+\d/, "an unmeasured delta must never print a number");
    }
    // A row that improves nothing says so, instead of leaving the reader to read a blank.
    const bare = raid.concat(planRows(html, DUNGEON_CARD)).filter((row) => !row.coverage);
    for (const row of bare) assert.match(row.detail, /None of your ranked candidates drop here/);

    // The two slots the plan cannot count are named, so an absence is never mistaken for a zero.
    assert.match(html, /trinkets are not ranked anywhere on this page/);
    assert.match(html, /five tier-set slots are ranked on the Tier &amp; Catalyst tab/);

    // The ranking's own pending state is stated on this tab too: the plan is only as good as
    // the ranked set it joins to, and that set has had no guide harvest.
    assert.match(html, /data-guide-state="pending"/);

    // The sort key is named on screen before anything is touched.
    assert.match(document.ids.get("plan-sort-state").innerHTML,
      /Sorted by <b>ranked slots improved<\/b>/);
  });

test("the equippable-drop counts and the key-level table survive the upgrade", async () => {
  const { data, startClient } = await clientFixture();
  const html = startClient().document.ids.get("src").innerHTML;

  assert.match(html, /<th>For you<\/th><th>Slots it can fill<\/th>/);
  for (const row of planRows(html, RAID_CARD))
    assert.match(row.forYou, /<b>\d+<\/b> \/ \d+/, "the equippable-drop count stays on every row");
  // The key-level table is a second src-tbl inside the M+ card and keeps every rung.
  const dungeonCard = html.split('<div class="card">').find((p) => p.includes(DUNGEON_CARD));
  const tables = dungeonCard.split('<table class="src-tbl"');
  assert.equal(tables.length, 3, "the dungeon card keeps its plan table AND its key-level table");
  for (const key of data.dungeons.keyLevels) assert.ok(tables[2].includes(`>${key.key}<`),
    `key level ${key.key} still listed`);
});

/* ------------------------------------------------- G19: slots, not items */

/* WHERE DEPTH ACTUALLY LIVES, measured against the committed data across all 40 specs:
   raid depth is ZERO for every spec and every boss — a boss's loot table holds at most one
   item per slot per armour type, so it can never put two of your top five into one slot — and
   dungeon depth reaches 1 on 17 of the 40 specs. So the M+ grouping is the only place the
   slots-versus-items distinction is observable at all, and testing it on the raid side would
   have been vacuous while looking thorough. */
test("coverage counts slots and depth counts the extra options inside them", async () => {
  const { data, startClient } = await clientFixture();

  const withDepth = data.specs.specs.find((spec) => {
    const { app } = startClient(`${spec.class}|${spec.spec}`);
    return app.plans("mplus").some((plan) => plan.depth > 0);
  });
  assert.ok(withDepth, "expected at least one spec whose dungeon drops two ranked items into "
    + "one slot — without one this test cannot tell a slot count from an item count");

  const { document, app } = startClient(`${withDepth.class}|${withDepth.spec}`);
  const ranked = app.ranked();
  const html = document.ids.get("src").innerHTML;

  /* Recomputed straight off the committed data rather than off the planner, so the two can
     actually disagree. `matched` is ITEMS; `coverage` must be the distinct slot count. */
  const expected = new Map();
  for (const group of [...data.dungeons.dungeons, ...data.raid.bosses]) {
    const matched = group.items.filter((item) => item.slot
      && (ranked.get(item.slot) || []).includes(String(item.id)));
    expected.set(group.name, { matched: matched.length,
      slots: new Set(matched.map((item) => item.slot)).size });
  }

  for (const plan of app.plans("mplus").concat(app.plans("raid"))) {
    const want = expected.get(plan.source.name);
    assert.equal(plan.coverage, want.slots, `${plan.source.name}: coverage counts slots`);
    assert.equal(plan.depth, want.matched - want.slots, `${plan.source.name}: depth is the remainder`);
    assert.equal(plan.coveredSlots.length, plan.coverage);
  }

  // And the rendered numbers are the planner's, not a second count made for display.
  const rows = new Map(planRows(html, DUNGEON_CARD).map((row) => [row.name, row]));
  for (const plan of app.plans("mplus")) {
    assert.equal(rows.get(plan.source.name).coverage, plan.coverage);
    assert.equal(rows.get(plan.source.name).depth, plan.depth);
  }
  // The deeper row shows its extra options as a separate number, never folded into coverage.
  const deep = app.plans("mplus").find((plan) => plan.depth > 0);
  assert.ok(deep.coverage < expected.get(deep.source.name).matched,
    "the whole point: more ranked items than ranked slots, and coverage counts the slots");
  assert.match(rows.get(deep.source.name).raw,
    new RegExp(`<b>${deep.coverage}</b><span class="who">ranked slots?</span>`));
  assert.match(rows.get(deep.source.name).raw,
    new RegExp(`<b>${deep.depth}</b><span class="who">extra options?</span>`));
  // …and the slot carrying the extra option says so in words, rather than only in a number.
  assert.match(rows.get(deep.source.name).detail, /\+\d+ more here/);
});

/* ------------------------------------------------- G21: droppedBy on the row */

test("the specific encounter is named where droppedBy holds it, and nothing is guessed where it does not",
  async () => {
    const { data, startClient } = await clientFixture();
    const { document, app } = startClient();
    const ranked = app.ranked();
    const html = document.ids.get("src").innerHTML;
    const rows = new Map(planRows(html, DUNGEON_CARD).map((row) => [row.name, row]));

    let named = 0, silent = 0;
    for (const dungeon of data.dungeons.dungeons) {
      const row = rows.get(dungeon.name);
      assert.ok(row, `${dungeon.name} keeps a row`);
      for (const slot of (app.plans("mplus").find((p) => p.source.name === dungeon.name).coveredSlots)) {
        const ids = ranked.get(slot) || [];
        const best = dungeon.items.filter((item) => item.slot === slot && ids.includes(String(item.id)))
          .sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id)))[0];
        if (best.droppedBy) {
          assert.ok(row.detail.includes(best.droppedBy),
            `${dungeon.name}/${slot}: the encounter that drops it must be named on the row`);
          named++;
        } else {
          // No invention: an item with no recorded encounter contributes no encounter name.
          assert.ok(row.detail.includes(best.name), `${dungeon.name}/${slot}: the item is still named`);
          silent++;
        }
      }
    }
    assert.ok(named > 0, "droppedBy is populated on most dungeon items — expected some named");
    // Whichever side is empty, the assertion above still held; record that both paths ran when
    // the data offers both.
    assert.ok(named + silent > 0);

    /* A raid row whose droppedBy merely repeats the boss it is already filed under drops the
       duplicate; one that names a different NPC inside the encounter keeps it. Both are real
       in the committed data (25 repeat, 40 differ). */
    const raidRows = new Map(planRows(html, RAID_CARD).map((row) => [row.name, row]));
    for (const boss of data.raid.bosses) {
      const row = raidRows.get(boss.name);
      const inner = boss.items.filter((item) => item.slot && item.droppedBy
        && item.droppedBy !== boss.name
        && (ranked.get(item.slot) || []).includes(String(item.id)));
      for (const item of inner.slice(0, 1)) {
        const slotIds = ranked.get(item.slot);
        // Only the top-ranked item of a covered slot is described on the row.
        if (slotIds.indexOf(String(item.id)) === Math.min(...boss.items
          .filter((other) => other.slot === item.slot && slotIds.includes(String(other.id)))
          .map((other) => slotIds.indexOf(String(other.id)))))
          assert.ok(row.detail.includes(item.droppedBy),
            `${boss.name}: the NPC inside the encounter must be named`);
      }
    }
  });

/* ------------------------------------------------- G2 + G21: the delta */

test("a pasted gear set produces deltas, every one carrying the basis it was measured at",
  async () => {
    const { data, startClient } = await clientFixture();
    const { document, app } = startClient();
    readGear(document, simcPaste({}, 250));
    const html = document.ids.get("src").innerHTML;

    assert.match(html, /data-plan-delta="measured"/);
    assert.match(html, /measured against the gear you pasted/);

    const worn = app.worn();
    assert.ok(worn && Object.values(worn).every((level) => level === 250),
      "every ranked slot reads as the pasted item level");

    const maxOf = new Map(data.raid.bosses.map((boss) =>
      [boss.name, Math.max(...boss.dropLevels.map((step) => step.ilvl))]));
    const rows = new Map(planRows(html, RAID_CARD).map((row) => [row.name, row]));

    let measured = 0;
    for (const plan of app.plans("raid")) {
      // Every covered slot is worth exactly (this boss's Mythic item level - 250).
      assert.equal(plan.delta, plan.coverage * (maxOf.get(plan.source.name) - 250),
        `${plan.source.name}: the delta is the item level actually gained, slot by slot`);
      const cell = rows.get(plan.source.name).delta;
      if (plan.delta) {
        // G21: the number never travels without the basis. A bare "+68" reads as a promise
        // about the difficulty this reader runs.
        assert.match(cell, new RegExp(`<b>\\+${plan.delta}</b> ilvl`));
        assert.match(cell, /at Mythic/);
        measured++;
      }
    }
    assert.ok(measured > 0, "expected at least one boss to be an upgrade over item level 250");

    // The M+ basis is the key ladder's own top rung, and it says which one.
    for (const row of planRows(html, DUNGEON_CARD).filter((row) => row.coverage))
      assert.match(row.delta, /<b>\+\d+<\/b> ilvl<span class="who">at vault \+10 and above<\/span>/);

    // The two components stay in two cells. Nothing on the row is their sum.
    const example = rows.get(app.plans("raid").find((plan) => plan.delta > 0).source.name);
    assert.ok(!example.coverage || !/<b>\d+<\/b>/.test(example.delta.split("ilvl")[1] ?? ""));
    assert.notEqual(example.coverage, 0);
  });

test("null and zero are different answers: measured-but-no-gain never reads as unmeasured",
  async () => {
    const { startClient } = await clientFixture();
    const { document, app } = startClient();

    // Wearing more than anything in the game drops: measured, and worth nothing.
    readGear(document, simcPaste({}, 999));
    const html = document.ids.get("src").innerHTML;
    for (const plan of app.plans("raid")) assert.equal(plan.delta, 0);
    for (const row of planRows(html, RAID_CARD)) {
      assert.match(row.delta, /no gain/);
      assert.doesNotMatch(row.delta, /needs your gear/,
        "a measured zero must not read as an unread character");
    }
    assert.match(html, /data-plan-delta="measured"/);
  });

test("a partial paste cannot report an unmentioned slot as a whole item level of gain", async () => {
  const { data, startClient } = await clientFixture();
  const { document, app } = startClient();
  /* One line only. The failure mode this guards is subtle and silent: "nothing worn there" and
     "item level zero" are the same value to the planner, so an unmentioned slot would report
     its entire attainable item level as a gain and the boss covering most slots would run away
     with the delta sort. The stated fallback item level — which the parse step derives from
     this very paste — answers for those slots, exactly as the Upgrade checker does. */
  readGear(document, "back=only_this,id=999998,ilevel=250");
  assert.equal(document.ids.get("curilvl").value, 250, "the paste sets the fallback it derived");

  for (const [slot, level] of Object.entries(app.worn()))
    assert.equal(level, 250, `${slot}: an unmentioned slot must not compare against nothing`);
  const maxOf = new Map(data.raid.bosses.map((boss) =>
    [boss.name, Math.max(...boss.dropLevels.map((step) => step.ilvl))]));
  for (const plan of app.plans("raid"))
    assert.equal(plan.delta, plan.coverage * (maxOf.get(plan.source.name) - 250),
      `${plan.source.name}: every covered slot is worth exactly one ladder's gain, no more`);
});

test("clearing the fallback item level cannot leave an unmentioned slot comparing against zero",
  async () => {
    const { startClient } = await clientFixture();
    const { document, app } = startClient();
    readGear(document, "back=only_this,id=999998,ilevel=250");
    // The reader empties the fallback field the parse step filled in.
    document.ids.get("curilvl").value = "";
    document.ids.get("curilvl").listeners.input();

    for (const [slot, level] of Object.entries(app.worn()))
      assert.equal(level, 250, `${slot}: falls back to the lowest item level the paste reported`);
    for (const plan of app.plans("raid"))
      assert.ok(plan.delta < 400, `${plan.source.name}: delta ${plan.delta} implies a slot at zero`);
    // A paste carrying no item levels at all is a different answer: nothing to measure against.
    const bare = startClient();
    readGear(bare.document, "back=only_this,id=999998");
    bare.document.ids.get("curilvl").value = "";
    bare.document.ids.get("curilvl").listeners.input();
    assert.equal(bare.app.worn(), null);
    assert.match(bare.document.ids.get("src").innerHTML, /data-plan-delta="no-levels"/);
    assert.match(bare.document.ids.get("src").innerHTML,
      /Your paste carried no item levels, so no upgrade can be computed/);
  });

/* ------------------------------------------------- G18: the sort switch */

test("the sort switch reorders the plan and always names the key it actually used", async () => {
  const { startClient } = await clientFixture();
  const { document, app } = startClient();
  const control = document.ids.get("plan-sort");
  const state = () => document.ids.get("plan-sort-state").innerHTML;
  const rendered = (marker) => planRows(document.ids.get("src").innerHTML, marker).map((r) => r.name);

  // Default: coverage, named on screen, and the rendered order is the planner's coverage order.
  assert.deepEqual(rendered(RAID_CARD), app.sorted("raid", "coverage"));
  assert.match(state(), /Sorted by <b>ranked slots improved<\/b>/);

  /* Asking for delta with nothing pasted: the page does NOT silently pretend. sortPlans falls
     back to coverage and the page reports the key it used, plus the one that was asked for. */
  control.value = "delta";
  control.listeners.change();
  assert.deepEqual(rendered(RAID_CARD), app.sorted("raid", "coverage"),
    "with nothing measured the order cannot change");
  assert.match(state(), /Sorted by <b>ranked slots improved<\/b>/);
  assert.match(state(), /you asked for <b>item levels you would gain<\/b>, and nothing is measured yet/);
  assert.match(document.ids.get("src").innerHTML, /data-plan="sortkey"/);

  // Now paste gear. The delta becomes computable and the switch takes effect.
  readGear(document, simcPaste({}, 250));
  const byDelta = rendered(RAID_CARD);
  assert.deepEqual(byDelta, app.sorted("raid", "delta"));
  assert.match(state(), /Sorted by <b>item levels you would gain<\/b>/);
  assert.doesNotMatch(state(), /you asked for/);
  /* The switch has to MEAN something: the raid's per-boss item-level ladders differ, so the
     two keys genuinely disagree. If they ever stop disagreeing this test is telling you the
     control is decorative. */
  assert.notDeepEqual(byDelta, app.sorted("raid", "coverage"),
    "the two sort keys must be able to produce different orders");

  // And back again, on the same pasted gear.
  control.value = "coverage";
  control.listeners.change();
  assert.deepEqual(rendered(RAID_CARD), app.sorted("raid", "coverage"));
  assert.match(state(), /Sorted by <b>ranked slots improved<\/b>/);
});

/* ------------------------------------------------- the one hard coupling */

test("the plan and the Gear recommendations tab agree on the ranked set", async () => {
  const { data, startClient } = await clientFixture();
  const bySlot = new Map();
  for (const group of [...data.raid.bosses, ...data.dungeons.dungeons])
    for (const item of group.items) bySlot.set(String(item.id), item.slot);

  // Every spec, because the two paths diverge per spec: weapon loadouts, armour type and the
  // tier-set exclusions all differ, and one spec agreeing proves very little.
  for (const spec of data.specs.specs) {
    const { document, app } = startClient(`${spec.class}|${spec.spec}`);
    const shown = numberedGearIds(document.ids.get("bis").innerHTML);
    const planned = [...app.ranked().values()].flat();
    const label = `${spec.spec} ${spec.class}`;

    assert.deepEqual(new Set(planned), new Set(shown),
      `${label}: the plan must join to exactly the candidates that tab ranks`);
    // …and slot by slot, in the same order, so "#2 Back" means the same row on both tabs.
    for (const [slot, ids] of app.ranked()) {
      assert.ok(ids.length, `${label}/${slot}: an empty ranked slot should not be recorded`);
      for (const id of ids) assert.equal(bySlot.get(id), slot,
        `${label}: ${id} is filed under ${slot} but is a ${bySlot.get(id)}`);
    }
  }
});

test("trinkets and the tier-set slots stay out of the ranked set the plan counts", async () => {
  const { data, startClient } = await clientFixture();
  const tierSlots = new Set(data.catalyst.setBonusSlots || []);
  assert.ok(tierSlots.size, "expected the catalyst rules to name the tier-set slots");

  for (const spec of data.specs.specs.slice(0, 6)) {
    const { app } = startClient(`${spec.class}|${spec.spec}`);
    const slots = [...app.ranked().keys()];
    assert.ok(!slots.includes("Trinket"),
      `${spec.spec} ${spec.class}: trinkets are unranked (G8) and cannot be counted as coverage`);
    for (const slot of tierSlots) assert.ok(!slots.includes(slot),
      `${spec.spec} ${spec.class}: ${slot} is ranked on the Tier & Catalyst tab, not here`);
  }
});
