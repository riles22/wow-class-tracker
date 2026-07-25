/* Cross-cutting invariants of the CLIENT code in src/template.html.
   ~1,400 of that file's lines are JavaScript implementing ratingFor, the fight view, era
   gating, movement display, the Ladder, the Finder, Compare and hash routing — every
   surface both jobs-to-be-done touch — and before this file nothing executed a single
   line of it (audit 2026-07-24, N6). The bug that prompted it was three lines of branch
   ordering in `ratingFor` that published Season-1 Archon tiers under a lit "Ours: 12.1"
   button on a public site; no test in the suite could have caught it.

   These are INVARIANTS, not snapshots: each asserts that what the page renders agrees
   with what the payload says, so they survive data refreshes and stay meaningful.

   Dependency posture: `npm test` is deliberately dependency-free (zero npm deps, no
   lockfile to poison — see docs/security-audit-2026-07.md), and the nightly publish gate
   runs it on a tight clock. So Playwright is NOT a dependency of this repo: when it is
   absent, or dist/ has not been built, every test here skips cleanly. CI installs it in
   its own job (.github/workflows/ci.yml) so the invariants are actually exercised on
   every push. Run locally with: npm run build && npm i --no-save playwright && npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist", "index.html");

/* Chromium may be preinstalled at a pinned path (CI images, the Claude Code sandbox)
   under a build number that does not match the playwright package's expectation, which
   makes the default launch fail. Prefer an explicit executable when one is configured. */
const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || null;

async function loadPlaywright() {
  try {
    const { chromium } = await import("playwright");
    return chromium;
  } catch {
    return null;
  }
}

const chromium = await loadPlaywright();
const reason = !chromium
  ? "playwright not installed — UI invariants skipped (see the header of this file)"
  : !existsSync(DIST)
    ? "dist/index.html not built — run `npm run build` first"
    : null;

/* One browser for the whole file; each test gets a fresh page. */
let browser = null;
const newPage = async (hash = "") => {
  if (!browser) browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {});
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.message)));
  // The hash must ride the FIRST navigation: going to the bare file and then to
  // file+hash is a same-document change that only fires hashchange, so it never
  // exercises the boot-time applyHash path a shared link actually takes.
  await page.goto("file://" + DIST + hash);
  await page.waitForFunction(() => document.querySelectorAll(".row").length > 0, { timeout: 15000 });
  return { page, errors };
};

/* The payload the page itself is driving from — the source of truth every assertion
   compares against. Parsed out of the built artifact the same way the page gets it. */
const payload = () => {
  const html = readFileSync(DIST, "utf8");
  const i = html.indexOf("const DATA = ");
  const j = html.indexOf("\n", i);
  return JSON.parse(html.slice(i + 13, j).replace(/;\s*$/, ""));
};

/* NB: node:test treats the PRESENCE of a `skip` key as a skip, whatever its value —
   `{ skip: null }` silently skips the whole file. Only pass the option when skipping. */
const skipOpts = reason ? { skip: reason } : {};
const ui = (name, fn, hash = "") => test(name, skipOpts, async t => {
  const { page, errors } = await newPage(hash);
  try {
    await fn(page, t);
    assert.deepEqual(errors, [], `page errors: ${errors.join(" | ")}`);
  } finally {
    await page.close();
  }
});

test.after(async () => { if (browser) await browser.close(); });

/* Read the two tier letters of one spec's row, by spec name + class (names repeat:
   there are two Frosts). */
const tiersOf = (page, cls, spec) => page.evaluate(([cls, spec]) => {
  const row = [...document.querySelectorAll(".row.clickable")].find(r =>
    r.querySelector(".spec-txt")?.textContent.trim() === spec &&
    r.querySelector(".cls")?.textContent.trim() === cls);
  if (!row) return null;
  return [...row.querySelectorAll(".tier")].map(t => t.textContent.trim());
}, [cls, spec]);

ui("every source view renders that source's OWN ratings", async page => {
  const data = payload();
  const sources = data.sources.filter(s => s.kind === "tier-list").map(s => s.id);
  assert.ok(sources.length >= 3, "expected several tier-list sources");

  let checked = 0;
  for (const id of sources) {
    await page.evaluate(id => document.querySelector(`#srcseg button[data-source="${id}"]`).click(), id);
    await page.waitForTimeout(120);
    // Assert PER SOURCE, PER BRACKET, against whatever that source actually rates.
    // Sources legitimately differ in coverage — WoWMeta ranks M+ only (its raid pages
    // are registered "currently unranked — 0 records"), and a source mid-outage keeps
    // its previous rows. Demanding uniform coverage would make this fail for a data
    // reason instead of the UI reason it exists to catch.
    for (const [bracket, col] of [["raid", 0], ["mplus", 1]]) {
      const spec = data.specs.find(s => s.ratings?.[bracket]?.[id]);
      if (!spec) continue;
      const rendered = await tiersOf(page, spec.class, spec.spec);
      assert.equal(rendered[col], spec.ratings[bracket][id],
        `source "${id}" must render its own ${bracket} rating for ${spec.class} ${spec.spec}`);
      checked++;
    }
  }
  assert.ok(checked >= sources.length, `expected to check at least one bracket per source, checked ${checked}`);
});

ui("consensus and projection views render their own computed tiers", async page => {
  const data = payload();
  const spec = data.specs.find(s => s.consensus?.raid?.tier && s.projection?.raid?.tier);
  assert.ok(spec, "expected a spec with both a consensus and a projection");

  await page.evaluate(() => document.querySelector('#srcseg button[data-source="consensus"]').click());
  await page.waitForTimeout(120);
  assert.deepEqual(await tiersOf(page, spec.class, spec.spec),
    [spec.consensus.raid.tier, spec.consensus.mplus.tier]);

  await page.evaluate(() => document.querySelector('#srcseg button[data-source="projection"]').click());
  await page.waitForTimeout(120);
  assert.deepEqual(await tiersOf(page, spec.class, spec.spec),
    [spec.projection.raid.tier, spec.projection.mplus.tier],
    "the projection view must show the projection, not the consensus it derives from");
});

ui("a selected fight never leaves another view's button lit over Archon data", async page => {
  const data = payload();
  const [slug, enc] = Object.entries(data.encounterTiers?.raid ?? {})[0] ?? [];
  assert.ok(slug, "expected at least one raid encounter");

  // pick a non-consensus source first: the regression was that the fight branch ran
  // BEFORE state.source was ever consulted, so the lit button became a lie
  await page.evaluate(() => document.querySelector('#srcseg button[data-source="projection"]').click());
  await page.evaluate(v => {
    const sel = document.getElementById("fightsel");
    sel.value = v; sel.dispatchEvent(new Event("change"));
  }, `raid|${slug}`);
  await page.waitForTimeout(200);

  const state = await page.evaluate(() => ({
    pressed: [...document.querySelectorAll("#srcseg button")].filter(b => b.getAttribute("aria-pressed") === "true").length,
    allDisabled: [...document.querySelectorAll("#srcseg button")].every(b => b.disabled),
    override: !!document.querySelector(".segoverride"),
  }));
  assert.ok(state.allDisabled && state.pressed === 0 && state.override,
    `with a fight selected the source segment must be inert and labelled, got ${JSON.stringify(state)}`);

  // and the letters must actually be the encounter's
  const spec = data.specs.find(s => enc.tiers?.[`${s.class}|${s.spec}`]);
  assert.equal((await tiersOf(page, spec.class, spec.spec))[0], enc.tiers[`${spec.class}|${spec.spec}`]);
});

ui("era=12.1 PTR renders no live-only metric row", async page => {
  await page.evaluate(() => document.querySelector('#eraseg button[data-era="ptr"]').click());
  await page.waitForTimeout(150);
  // open a spec with numbers in both eras and read its metric section headers
  await page.evaluate(() => document.querySelectorAll(".row.clickable")[0].click());
  await page.waitForTimeout(400);
  const headings = await page.evaluate(() =>
    [...document.querySelectorAll(".row.open .metrics .d-h")].map(h => h.textContent.trim()));
  assert.ok(headings.length > 0, "expected the open drawer to render metric sections");
  assert.ok(!headings.some(h => /12\.0\.7/.test(h)),
    `a 12.1-PTR-only view must not render 12.0.7 metric sections, got ${JSON.stringify(headings)}`);
});

ui("the What-changed strip agrees with the arrows the grid actually draws", async page => {
  // The strip narrates the movement baseline; the grid draws ▲▼ per row. If these two
  // disagree the page is contradicting itself on one screen — which is exactly what it
  // did while the strip was consensus-only and the grid was showing another view.
  await page.evaluate(() => document.querySelector('#srcseg button[data-source="consensus"]').click());
  await page.waitForTimeout(150);
  const read = () => page.evaluate(() => {
    const strip = document.getElementById("changes")?.textContent ?? "";
    const up = /▲\s*(\d+)/.exec(strip), down = /▼\s*(\d+)/.exec(strip);
    const drawn = [...document.querySelectorAll("#matrix .mv")];
    return {
      stripUp: up ? +up[1] : 0, stripDown: down ? +down[1] : 0,
      drawnUp: drawn.filter(e => e.dataset.d === "up").length,
      drawnDown: drawn.filter(e => e.dataset.d === "down").length,
      label: (document.querySelector("#changes summary")?.textContent ?? ""),
    };
  });
  const consensus = await read();
  assert.equal(consensus.drawnUp, consensus.stripUp, `consensus: strip ▲${consensus.stripUp}, grid ${consensus.drawnUp}`);
  assert.equal(consensus.drawnDown, consensus.stripDown, `consensus: strip ▼${consensus.stripDown}, grid ${consensus.drawnDown}`);
  assert.match(consensus.label, /Consensus/, "the strip must name the lane it is narrating");

  // …and the same must hold in the projection view, which had NO arrows at all while the
  // strip went on printing consensus letters over it (audit 2026-07-24, C3).
  await page.evaluate(() => document.querySelector('#srcseg button[data-source="projection"]').click());
  await page.waitForTimeout(200);
  const proj = await read();
  assert.equal(proj.drawnUp, proj.stripUp, `projection: strip ▲${proj.stripUp}, grid ${proj.drawnUp}`);
  assert.equal(proj.drawnDown, proj.stripDown, `projection: strip ▼${proj.stripDown}, grid ${proj.drawnDown}`);
  assert.match(proj.label, /Ours: 12\.1/, "the strip must switch lanes with the view");
});

ui("a deep link restores view state and the named drawer", async page => {
  await page.waitForTimeout(700);
  const s = await page.evaluate(() => ({
    src: [...document.querySelectorAll("#srcseg button")].find(b => b.getAttribute("aria-pressed") === "true")?.dataset.source,
    era: [...document.querySelectorAll("#eraseg button")].find(b => b.getAttribute("aria-pressed") === "true")?.dataset.era,
    open: [...document.querySelectorAll(".row.open .spec-txt")].map(e => e.textContent.trim()),
    inert: [...document.querySelectorAll(".row.open .drawer")].every(d => d.inert === false),
  }));
  assert.equal(s.src, "projection");
  assert.equal(s.era, "ptr");
  assert.deepEqual(s.open, ["Destruction"]);
  assert.ok(s.inert, "an open drawer must not be inert");
}, "#src=projection&era=ptr&role=DPS&spec=warlock-destruction");

ui("closed drawers contribute no keyboard tab stops", async page => {
  for (const i of [0, 1, 2]) {
    await page.evaluate(i => document.querySelectorAll(".row.clickable")[i].click(), i);
    await page.waitForTimeout(200);
  }
  await page.evaluate(() => document.getElementById("closeAll").click());
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({
    open: document.querySelectorAll(".row.open").length,
    leaky: [...document.querySelectorAll(".row:not(.open) .drawer")].filter(d => d.inert !== true).length,
  }));
  assert.equal(state.open, 0);
  assert.equal(state.leaky, 0, "every closed drawer must be inert");
});
