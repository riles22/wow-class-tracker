/* Phase E — the staleness banner and the un-pinned season facts (docs/gearing-s2-scope.md
 * G23, G25).
 *
 * WHAT THIS GUARDS. Two failures, and they are opposites.
 *
 * The first is the page lying by omission: from 2026-08-18 the data on this page describes a
 * season that has already started, while its own caveat still promises things "may change
 * before Aug 18 2026". G23 says state it plainly, in visible text, and clear it when the data
 * catches up — with no code change, because the code change is exactly what nobody will
 * remember to make in launch week.
 *
 * The second is the page lying by inertia: "season max 344 · season opens Aug 18, 2026" was
 * typed into the template, so every future season needed an editor to find it. Those facts now
 * live in src/season.mjs, and the test that matters is not "does it say 344" — it is "does it
 * say whatever season.mjs says", which is asserted by booting a page whose SEASON has been
 * changed and watching the masthead follow it.
 *
 * Everything boots the real app script out of src/app.template.html through `new Function`,
 * exactly as project.test.mjs, ranking-client.test.mjs and gameplan-client.test.mjs do — no
 * `location` and no `history` in that scope, so every browser touch in the client stays
 * typeof-guarded.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { injectGuideLib } from "../src/inline-guides.mjs";
import { SEASON, dataPredatesSeason, seasonHasOpened, stalenessNotice } from "../src/season.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const GEARING_ROOT = fileURLToPath(new URL("../", import.meta.url));
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));

/* The template carries TWO build-time substitutions: `__LIB_GUIDES__` (src/inline-guides.mjs)
   and the `//__SEASON__` marker src/build.mjs fills with season.mjs's live bindings. Booting
   the raw template would run a page the browser never sees, so the tests assemble it the way
   the build does. build.mjs is a script rather than a module — importing it would run a build
   and rewrite the artifact — so the season half is restated here, and
   "the shipped artifact carries exactly this season block" below pins the two together. */
const SEASON_MARKER = "//__SEASON__";
const seasonBlock = (season = SEASON) => [
  `const SEASON = ${JSON.stringify(season).replace(/<\/script>/gi, "<\\/script>")};`,
  ...[seasonHasOpened, dataPredatesSeason, stalenessNotice]
    .map((fn) => `const ${fn.name} = ${fn.toString()};`),
].join("\n");

const appTemplate = async (season) => {
  const withLib = await injectGuideLib(
    await readFile(fromRoot("src/app.template.html"), "utf8"), GEARING_ROOT);
  assert.ok(withLib.includes(SEASON_MARKER),
    `the template lost the ${SEASON_MARKER} marker — build.mjs would refuse to write an artifact`);
  return withLib.replace(SEASON_MARKER, () => seasonBlock(season));
};

/* ---------- the client harness (mirrors test/gameplan-client.test.mjs) ---------- */

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
    "p-items", "p-specs", "foot", "parse", "plan-sort", "plan-sort-state",
    // Phase E's two new surfaces.
    "staleness", "seasonfacts"])
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

/* The five dated datasets the page holds. Every one of them is 2026-08-02 in the repo today —
   pre-launch, which is the state the banner exists for. `harvests` overrides them so a test can
   put the page in a post-launch, a staggered, or an unharvested state without a harvest. */
const DATED = [["raid", "harvestedAt"], ["dungeons", "harvestedAt"], ["tier", "harvestedAt"],
  ["specs", "harvestedAt"], ["catalyst", "reviewedAt"]];

async function clientFixture(harvests = {}) {
  const [template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, guidePicks, guidePriorities, archonUsage, icons] = await Promise.all([
    appTemplate(harvests.season),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"),
    json("data/guide-picks.json"), json("data/guide-priorities.json"), json("data/archon-usage.json"),
    json("data/icons.json"),
  ]);
  const data = clone({ raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, guidePicks, guidePriorities, archonUsage, icons: icons.icons });
  for (const [key, field] of DATED) {
    if (Object.prototype.hasOwnProperty.call(harvests, key)) data[key][field] = harvests[key];
  }

  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const appSource = `${scripts.at(-1)[1]}
    return {
      staleness: (...args) => renderStaleness(...args),
      facts: (...args) => { renderSeasonFacts(...args); return document.getElementById('seasonfacts').innerHTML; },
      footer: () => { renderFooter(); return document.getElementById('foot').innerHTML; },
      dated: () => datedHarvests(),
    };`;
  const document = fakeDocument(data);
  const app = new Function("document", "innerWidth", "innerHeight", appSource)(document, 1600, 900);
  return { template, document, app, banner: () => document.ids.get("staleness") };
}

/* ------------------------------------------------- before the season opens */

test("before the open there is no banner, because the pre-launch caveat is still true", async () => {
  const { app, banner } = await clientFixture();
  assert.equal(app.staleness("2026-08-13"), null);
  assert.equal(banner().hidden, true);
  assert.equal(banner().innerHTML, "");
  // …right up to the last day before it opens.
  assert.equal(app.staleness("2026-08-17"), null);
  assert.equal(banner().hidden, true);
});

test("the masthead says the season OPENS before the date and OPENED after it", async () => {
  const { app } = await clientFixture();
  assert.match(app.facts("2026-08-13"), /season opens <b>Aug 18, 2026<\/b>/);
  assert.match(app.facts("2026-08-19"), /season opened <b>Aug 18, 2026<\/b>/);
  // The tense is the only thing that moves; the date is stated the same way either side of it.
  assert.doesNotMatch(app.facts("2026-08-19"), /season opens/);
});

/* ------------------------------------------------- after the open, with pre-launch data */

test("after the open, pre-launch data raises a visible banner naming both dates", async () => {
  const { app, banner } = await clientFixture();
  const notice = app.staleness("2026-08-19");

  assert.equal(notice.state, "predates-season");
  assert.equal(banner().hidden, false);
  const html = banner().innerHTML;
  // Both dates, because either one alone leaves the reader unable to judge the gap.
  assert.match(html, /2026-08-18/, "the banner must say when the season opened");
  assert.match(html, /2026-08-02/, "the banner must say when this data was harvested");
  assert.match(html, /item levels and drop assignments may have changed/);
  assert.match(html, /Season 2 opened 2026-08-18/);
  assert.match(html, /<b>Pre-launch data<\/b>/);
  // VISIBLE TEXT, not a tooltip: the tracker measured 262 of its 288 tooltips as unreachable
  // on touch, and this is the disclosure a reader must not be able to miss.
  assert.doesNotMatch(html, /title=/);
  // On day one every lane is behind and carries the same date the sentence already quotes, so
  // the per-lane list stays out of the way until a re-harvest has actually started.
  assert.doesNotMatch(html, /Still on pre-season data/);
});

test("the banner names the lanes still on pre-season data, so a staggered re-harvest shows", async () => {
  /* G25 re-harvests each lane as its source comes back: items on launch day, each guide when
     its pages verify as Season 2, Archon once it has a log sample. Keyed to the NEWEST date the
     banner would clear itself the moment one lane landed, with pre-launch item levels still on
     screen — so it is keyed to the oldest, and says which lanes are holding it up. */
  const { app, banner } = await clientFixture({ raid: "2026-08-19", dungeons: "2026-08-19" });
  assert.equal(app.staleness("2026-08-20").state, "predates-season");
  const html = banner().innerHTML;
  assert.match(html, /Still on pre-season data:/);
  for (const lane of ["Direct tier items", "Spec data", "Catalyst policy"]) {
    assert.ok(html.includes(lane), `expected the banner to name ${lane} as still pre-season`);
  }
  assert.ok(!html.includes("Raid items"), "a re-harvested lane must not be listed as stale");
  assert.ok(!html.includes("Dungeon items"), "a re-harvested lane must not be listed as stale");
});

/* ------------------------------------------------- the banner clearing itself */

test("a post-launch harvest clears the banner, with no code change", async () => {
  const harvested = Object.fromEntries(DATED.map(([key]) => [key, "2026-08-19"]));
  const { app, banner } = await clientFixture(harvested);
  assert.equal(app.staleness("2026-08-20"), null, "data harvested after the open is not stale");
  assert.equal(app.staleness("2026-09-30"), null, "and it does not become stale by ageing");
  assert.equal(banner().hidden, true);
  assert.equal(banner().innerHTML, "");
});

test("staleness is 'does it predate the season', never 'how old is it'", async () => {
  // Two days before the open is stale; five weeks after it is not. Plain age inverts this,
  // which is the specific mistake G23 rejects.
  const twoDaysBefore = Object.fromEntries(DATED.map(([key]) => [key, "2026-08-16"]));
  const dayAfter = Object.fromEntries(DATED.map(([key]) => [key, "2026-08-19"]));
  assert.equal((await clientFixture(twoDaysBefore)).app.staleness("2026-09-25").state,
    "predates-season");
  assert.equal((await clientFixture(dayAfter)).app.staleness("2026-09-25"), null);
});

/* ------------------------------------------------- degrading, not throwing */

test("with no readable date the page discloses nothing rather than throwing", async () => {
  /* The comparison date is the READER's, and the client-boot scope has no `location` and no
     `history`; a clock is no more guaranteed than they are. season.mjs answers "nothing to
     disclose" for a null today, so the guard is one typeof and a catch, not a second rule. */
  const { app, banner } = await clientFixture();
  assert.doesNotThrow(() => app.staleness(null));
  assert.equal(app.staleness(null), null);
  assert.equal(banner().hidden, true);
  // The masthead still states the facts it can state, in the neutral present tense.
  const facts = app.facts(null);
  assert.match(facts, /season max <b>344<\/b>/);
  assert.match(facts, /season opens <b>Aug 18, 2026<\/b>/);
});

test("a checkout with no harvest at all says so instead of showing an empty page", async () => {
  const none = Object.fromEntries(DATED.map(([key]) => [key, null]));
  const { app, banner } = await clientFixture(none);
  assert.equal(app.staleness("2026-08-13").state, "unharvested");
  assert.equal(banner().hidden, false);
  assert.match(banner().innerHTML, /No harvest has run for Season 2/);
});

/* ------------------------------------------------- the facts are config, not template */

test("the ceiling and the open date are gone from the template's markup", async () => {
  const raw = await readFile(fromRoot("src/app.template.html"), "utf8");
  // The rendered shape the two facts used to have, anywhere in the file.
  assert.doesNotMatch(raw, /season max\s*<b>\s*\d+/,
    "the item-level ceiling is SEASON.maxItemLevel's to state");

  /* And nothing of either fact left in the masthead itself. Comments are stripped first
     on purpose: the note recording what USED to be typed here ("season max 344 · season
     opens Aug 18, 2026") is the reason a later reader understands the indirection, and a
     grep that forbids quoting the old text would delete the record to protect it. */
  const header = /<header>[\s\S]*?<\/header>/.exec(raw);
  assert.ok(header, "expected a masthead");
  const markup = header[0].replace(/<!--[\s\S]*?-->/g, "");
  assert.doesNotMatch(markup, /344|Aug 18/, "no season fact may be typed into the masthead");
  assert.match(markup, /<span id="seasonfacts"><\/span>/);

  // The marker the build substitutes must survive; without it build.mjs refuses to write.
  assert.ok(raw.includes(SEASON_MARKER));
});

test("the masthead follows season.mjs, so launch day is a config edit and not a template edit",
  async () => {
    /* The strong form of the previous test. A page assembled with a DIFFERENT SEASON must
       render the different numbers — that is what "config, not template" means, and asserting
       "344 appears somewhere" would pass just as well against a hardcoded 344. */
    const next = { ...SEASON, id: "s3", label: "Season 3", opensAt: "2027-01-05",
      maxItemLevel: 372 };
    const { app } = await clientFixture({ season: next });
    const facts = app.facts("2026-12-01");
    assert.match(facts, /season max <b>372<\/b>/);
    assert.match(facts, /season opens <b>Jan 5, 2027<\/b>/);
    assert.doesNotMatch(facts, /344|Aug 18/);

    // …and the banner moves with it: data from 2026-08-02 predates s2 but not s3's open, so
    // on 2026-12-01 there is nothing to disclose, and after 2027-01-05 there is.
    assert.equal(app.staleness("2026-12-01"), null);
    const notice = app.staleness("2027-01-06");
    assert.equal(notice.state, "predates-season");
    assert.match(notice.detail, /Season 3 opened 2027-01-05/);
  });

test("the date renders without going through Date, so it does not slip a day west of GMT",
  async () => {
    // `new Date("2026-08-18")` is UTC midnight and formats as Aug 17 in every US timezone.
    const { app } = await clientFixture({ season: { ...SEASON, opensAt: "2026-01-01" } });
    assert.match(app.facts("2025-12-01"), /season opens <b>Jan 1, 2026<\/b>/);
  });

/* ------------------------------------------------- boot, and agreeing with the footer */

test("the page boots with no location and no history, and runs the banner on the way through",
  async () => {
    /* The harness supplies document/innerWidth/innerHeight and nothing else, so any unguarded
       `location` or `history` touch dies here. `hidden` starts false on a FakeElement and the
       banner sets it, which is how this asserts the boot actually reached renderStaleness
       rather than skipping it — today is 2026-08-13 in this repo, so the honest answer is
       no banner, and "no banner" and "never ran" look identical from the innerHTML alone. */
    const { document, banner } = await clientFixture();
    assert.equal(banner().hidden, true);
    assert.ok(document.ids.get("seasonfacts").innerHTML.includes("season max"),
      "the masthead facts should be filled at boot, not on first render");
    const client = await readFile(fromRoot("src/app.template.html"), "utf8");
    const seasonSection = client.slice(client.indexOf("season facts and the staleness banner"),
      client.indexOf("function renderSeasonFacts"));
    assert.doesNotMatch(seasonSection, /\b(?:location|history)\s*\./,
      "the banner must not reach for a browser global the boot scope does not have");
  });

test("the banner and the footer freshness line quote the same dates", async () => {
  /* Both answer "how old is this page". They read one list (datedHarvests) precisely so a
     reader cannot be told 2026-08-02 above the fold and something else in the footer. */
  const { app, banner } = await clientFixture({ raid: "2026-08-19" });
  app.staleness("2026-08-20");
  const footer = app.footer();
  const dates = app.dated().map((entry) => entry.at).sort();
  assert.deepEqual(dates, ["2026-08-02", "2026-08-02", "2026-08-02", "2026-08-02", "2026-08-19"]);
  assert.match(banner().innerHTML, /2026-08-02/);
  assert.match(footer, /last harvested <b>2026-08-19<\/b>/);
  assert.match(footer, /oldest dataset here dates from <b>2026-08-02<\/b>/);
});

/* ------------------------------------------------- the shipped artifact */

test("each build placeholder appears exactly once, because injectors take the first match",
  async () => {
    /* Three substitutions now feed one inline script, and every injector replaces the FIRST
       occurrence of its token. A second mention — including one inside a comment explaining
       the mechanism — captures the substitution and injects a library into the middle of a
       sentence, which is a syntax error a thousand lines from anything that looks wrong. This
       cost one build that wrote a broken page and reported success; build.mjs now parses the
       assembled script, and this states the rule where a template editor will meet it. */
    const raw = await readFile(fromRoot("src/app.template.html"), "utf8");
    for (const token of ["__DATA__", "__LIB_GUIDES__", SEASON_MARKER]) {
      const count = raw.split(token).length - 1;
      assert.equal(count, 1, `${token} appears ${count} times in app.template.html; `
        + "it may only appear at its real position, never in prose or a comment");
    }
    // …and the fully assembled script parses, which is the failure that mistake produced.
    const template = await appTemplate();
    const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
    assert.doesNotThrow(() => new Function(scripts.at(-1)[1]));
  });

test("the shipped artifact carries exactly this season block, one script and no external URL",
  async () => {
    /* The pin between build.mjs's assembly and this file's restatement of it. It also holds
       the two invariants the gearing CSP depends on: the page hashes ONE inline script, and it
       makes no network request — fonts and icons are data: URIs, so `url(http` is zero. */
    const html = await readFile(fromRoot("wow-s2-gearing.html"), "utf8");
    assert.ok(html.includes(seasonBlock()),
      "wow-s2-gearing.html does not carry the current season.mjs — rebuild it "
      + "(node src/build.mjs) after editing season.mjs");
    assert.ok(!html.includes(SEASON_MARKER), "the marker must be substituted, not shipped");
    assert.equal([...html.matchAll(/<script>/g)].length, 1);
    assert.equal([...html.matchAll(/url\(http/g)].length, 0);
  });
