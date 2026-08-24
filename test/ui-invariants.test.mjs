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
   every push.

   Run locally with:
     npm run build && npm i --no-save playwright && npx playwright install chromium && npm test
   The `playwright` package ships no postinstall browser download, so omitting the third
   command leaves node_modules complete but no browser on disk — and these tests then FAIL
   (11 red) rather than skip, because a browser that will not launch is deliberately not a
   skip condition: treating it as one would let a broken CI browser produce a green run
   with 11 invariants silently dropped. If a browser is already present under a build
   number this playwright does not expect (sandboxes and CI images pin their own), point
   at it instead: PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome npm test */
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
const ensureBrowser = async () => {
  if (!browser) browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {});
  return browser;
};
const newPage = async (hash = "") => {
  await ensureBrowser();
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

/* Drive the View control for any source id. The rebrand replaced the per-source
   buttons with a select (consensus and projection keep buttons), so tests select tier
   sources the way a user now does — through the dropdown, firing the same change event. */
const pickSource = (page, id) => page.evaluate(id => {
  const btn = document.querySelector(`#srcseg button[data-source="${id}"]`);
  if (btn) { btn.click(); return; }
  const sel = document.getElementById("srcsel");
  sel.value = id;
  sel.dispatchEvent(new Event("change", { bubbles: true }));
}, id);

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
  // Post-flip (phases.ptr null) the era pin makes an era:"ptr" product unreachable by
  // design — its option is disabled and any selection falls back to consensus, which is
  // asserted in the PTR-list invariant below — so its own-letters check only applies
  // while a PTR cycle is open.
  const sources = data.sources.filter(s => s.kind === "tier-list" &&
    (data.meta.phases.ptr || (s.era ?? "live") === "live")).map(s => s.id);
  assert.ok(sources.length >= 3, "expected several tier-list sources");

  let checked = 0;
  for (const id of sources) {
    await pickSource(page, id);
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

  // SEASON GATE (2026-08-19): prior-season encounter tiers must never mix into the live
  // grid — when the data's season stamp is not the live season the Fight control hides
  // entirely and that IS the invariant; the override machinery below re-tests itself
  // automatically once Archon's live-season encounter data lands.
  if (data.encounterTiers?.season !== data.phases?.liveSeason) {
    const gate = await page.evaluate(() => ({
      hidden: document.getElementById("fightctl")?.style.display === "none",
      fightState: !!document.querySelector(".segoverride"),
    }));
    assert.ok(gate.hidden, "prior-season fight data must hide the Fight control");
    assert.ok(!gate.fightState, "no fight override may be active while the control is hidden");
    return;
  }

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
    const host = document.getElementById("changes");
    const strip = host?.textContent ?? "";
    const up = /▲\s*(\d+)/.exec(strip), down = /▼\s*(\d+)/.exec(strip);
    const drawn = [...document.querySelectorAll("#matrix .mv")];
    return {
      shown: !!host && !host.hidden && strip.trim().length > 0,
      stripUp: up ? +up[1] : 0, stripDown: down ? +down[1] : 0,
      drawnUp: drawn.filter(e => e.dataset.d === "up").length,
      drawnDown: drawn.filter(e => e.dataset.d === "down").length,
      label: (document.querySelector("#changes summary")?.textContent ?? ""),
    };
  });

  /* Agreement has TWO honest shapes, and asserting only the first is how this test broke:
     it required the strip to be present in the projection lane, which was only true while
     the payload carried 11 phantom forecast arrows from the v1→v2 recompute. With those
     correctly gone, the strip hides — and hiding is right, because zero movement means
     nothing moved. So: when the strip is up, its counts and lane label must match the grid;
     when it is hidden, the grid must draw nothing. Both directions are checked, so an
     empty strip can never be a free pass for a grid that IS drawing arrows. */
  const agrees = (v, lane, labelRe) => {
    /* A THIRD honest shape (2026-08-15): the strip is shown but is narrating a version
       BOUNDARY rather than a lane — "Season N baseline established". No comparison was
       possible, so it names no lane and draws no arrows, and the right check is the same one
       the hidden branch makes. The flip guarantees this state via its mandatory
       CONSENSUS_VERSION bump; before the message existed the strip hid and this test red on
       the sanity line instead. */
    if (v.shown && /baseline established/i.test(v.label)) {
      assert.equal(v.stripUp + v.stripDown, 0, `${lane}: a baseline-established strip must claim no arrows`);
      assert.equal(v.drawnUp + v.drawnDown, 0,
        `${lane}: the strip says the baseline is incomparable but the grid draws ${v.drawnUp + v.drawnDown} arrows`);
      return;
    }
    if (v.shown) {
      assert.equal(v.drawnUp, v.stripUp, `${lane}: strip ▲${v.stripUp}, grid ${v.drawnUp}`);
      assert.equal(v.drawnDown, v.stripDown, `${lane}: strip ▼${v.stripDown}, grid ${v.drawnDown}`);
      assert.match(v.label, labelRe, `${lane}: the strip must name the lane it is narrating`);
    } else {
      assert.equal(v.drawnUp + v.drawnDown, 0,
        `${lane}: the strip is hidden but the grid draws ${v.drawnUp + v.drawnDown} arrows — the page contradicts itself`);
    }
  };

  agrees(await read(), "consensus", /Consensus/);

  // …and the same must hold in the projection view, which had NO arrows at all while the
  // strip went on printing consensus letters over it (audit 2026-07-24, C3).
  await page.evaluate(() => document.querySelector('#srcseg button[data-source="projection"]').click());
  await page.waitForTimeout(200);
  agrees(await read(), "projection", /Ours: 12\.1/);

  // The lane really does switch when there IS something to narrate — otherwise the whole
  // test could pass on a payload with no movement anywhere, which is the state that broke it.
  const labelled = await page.evaluate(() => {
    const out = {};
    for (const src of ["consensus", "projection"]) {
      document.querySelector(`#srcseg button[data-source="${src}"]`).click();
      const host = document.getElementById("changes");
      out[src] = (!host.hidden && host.textContent.trim()) ? (document.querySelector("#changes summary")?.textContent ?? "") : null;
    }
    return out;
  });
  const shownLanes = Object.entries(labelled).filter(([, v]) => v);
  /* The BASELINE-ESTABLISHED state is a third possibility, not a failure (2026-08-15). When
     the movement baseline sits across a version boundary — which the flip's mandatory
     CONSENSUS_VERSION bump guarantees — no lane can be compared, and the strip deliberately
     renders an explanation instead of arrows. It names no lane because it is not narrating
     one, so the lane-name assertion below must not apply to it. Before the strip had that
     message it hid entirely and this test red at the flip state on the sanity line. */
  const boundaryOnly = shownLanes.length > 0 &&
    shownLanes.every(([, label]) => /baseline established/i.test(label));
  /* A FOURTH honest shape (2026-08-19): the payload really has no movement in EITHER lane,
     so both strips are correctly hidden and there is nothing for either to narrate.
     Demanding movement here asserted the DATASET rather than the code — the same mistake
     already corrected in the drill-through test below — and went red on the first night
     that legitimately moved nothing (nightly a2ef039, "0 consensus moves"). Note the two
     lanes carry SEPARATE fields: consensus movement lands on `spec.movement`, the forecast's
     on `spec.projMovement` (they are computed by different passes, movementFor and
     projectionMovementFor), so a check reading only one of them would go blind to the other.
     The guard now runs in BOTH directions, which is strictly stronger than the assertion it
     replaces: with movement present a lane must narrate it, and with none present no lane
     may claim any. `agrees()` above has already tied each strip to the arrows the grid
     actually draws, so a hidden strip still cannot mask a grid that IS drawing. */
  const payloadMoved = payload().specs.some(sp =>
    Object.values(sp.movement ?? {}).some(Boolean) ||
    Object.values(sp.projMovement ?? {}).some(Boolean));
  if (!boundaryOnly) {
    if (payloadMoved) {
      assert.ok(shownLanes.length > 0, "sanity: at least one lane must have movement to narrate");
    } else {
      assert.equal(shownLanes.length, 0,
        `the payload has no movement in either lane, but ${shownLanes.length} strip(s) claim some`);
    }
    for (const [src, label] of shownLanes) {
      assert.match(label, src === "consensus" ? /Consensus/ : /Ours: 12\.1/,
        `the ${src} strip must name its own lane, not the other one`);
    }
  }
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
  // Post-flip there is no PTR era: the era param is an inert no-op (dropped, the rest
  // of the link still applies — the same rule as a removed overlay's view=) and the
  // view is pinned live; the projection view itself stays reachable through the
  // frozen-forecast lane (B6), which is what keeps src=projection restorable at all.
  assert.equal(s.era, payload().meta.phases.ptr ? "ptr" : "live");
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

ui("the Into-12.1 movers strip is era-gated, ranked, and drills through", async page => {
  const data = payload();
  const expected = [];
  for (const s of data.specs) for (const b of ["raid", "mplus"]) {
    const p = s.projection?.[b], c = s.consensus?.[b];
    if (p?.score != null && c?.score != null && p.tier && c.tier && p.tier !== c.tier) {
      expected.push({ cls: s.class, spec: s.spec, delta: p.score - c.score });
    }
  }
  assert.ok(expected.length > 0, "expected the forecast to disagree with the consensus somewhere");

  await page.evaluate(() => document.querySelector("#movers details").open = true);
  await page.waitForTimeout(150);
  const shown = await page.evaluate(() => [...document.querySelectorAll("#movers .mvr")].map(b => ({
    cls: b.dataset.cls, spec: b.dataset.spec,
    delta: +(/(-?\d+) pts/.exec(b.textContent)?.[1] ?? NaN),
  })));
  assert.ok(shown.length > 0, "expected movers rows");

  // every rendered row must be a real consensus→forecast tier change with the right delta
  for (const row of shown) {
    const match = expected.find(e => e.cls === row.cls && e.spec === row.spec && e.delta === row.delta);
    assert.ok(match, `movers row ${row.cls} ${row.spec} ${row.delta} is not a real forecast-vs-consensus change`);
  }
  // Both lists lead with the BIGGEST move: risers descending (+28 first), fallers
  // ascending (-40 first). Sorting fallers descending would bury the headline drop.
  const risers = shown.filter(r => r.delta > 0), fallers = shown.filter(r => r.delta < 0);
  assert.deepEqual(risers, [...risers].sort((a, b) => b.delta - a.delta), "risers must lead with the biggest gain");
  assert.deepEqual(fallers, [...fallers].sort((a, b) => a.delta - b.delta), "fallers must lead with the biggest drop");
  // it must NOT borrow the movement glyphs — those mean a different axis
  const glyphs = await page.evaluate(() => document.querySelector("#movers").textContent);
  assert.ok(!/[▲▼]/.test(glyphs), "the forecast lane must not reuse the ▲▼ history-movement glyphs");

  // These rows are the ones driven hardest by tiny-n PTR cuts, so they must not headline
  // above their own caveat. renderMovers()'s comment asserted this placement while the
  // markup had it backwards for the strip's whole life (audit 2026-07-25) — assert the DOM,
  // not the comment.
  const order = await page.evaluate(() => {
    const m = document.getElementById("movers"), c = document.getElementById("ptrcaveat");
    return !!(m && c) && (c.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  });
  assert.equal(order, true, "the movers strip must render BELOW the PTR caveat");

  // The summary counts SPECS, not (spec, bracket) pairs — it published "43 specs change
  // tier" on a 40-spec roster.
  const summary = await page.evaluate(() => document.querySelector("#movers summary").textContent);
  const claimed = +(/(\d+) of (\d+) specs change tier/.exec(summary)?.[1] ?? NaN);
  const realSpecs = new Set(expected.map(e => `${e.cls}|${e.spec}`)).size;
  assert.equal(claimed, realSpecs, `summary says ${claimed} specs, real count is ${realSpecs}: "${summary.trim()}"`);
  assert.ok(claimed <= data.specs.length, "a spec count can never exceed the roster");

  if (data.meta.frozenForecast) {
    // B6: post-flip everything IS the live view and the frozen record renders in it —
    // hiding the strip would hide exactly the record the report card grades.
    assert.equal(await page.evaluate(() => document.getElementById("movers").hidden), false,
      "the movers strip stays visible for the frozen record");
  } else {
    // a 12.0.7-only view has no forecast, so the strip must disappear
    await page.evaluate(() => document.querySelector('#eraseg button[data-era="live"]').click());
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => document.getElementById("movers").hidden), true,
      "the movers strip must be era-gated out of a 12.0.7-only view");
  }
});

ui("a change-strip row drills through even when a filter is hiding that spec", async page => {
  // openRowFor only searches the CURRENT view and returns false when a filter hides the
  // row, so a naive wiring silently did nothing — the fallback clears filters first.
  await page.evaluate(() => document.querySelector('#roleseg button[data-role="Healer"]').click());
  await page.waitForTimeout(200);
  await page.evaluate(() => { const d = document.querySelector("#changes details"); if (d) d.open = true; });
  await page.waitForTimeout(150);

  const target = await page.evaluate(() => {
    const b = [...document.querySelectorAll("#changes .chjump")]
      .find(x => !x.closest(".chfresh"));
    if (!b) return null;
    b.click();
    return { cls: b.dataset.cls, spec: b.dataset.spec };
  });
  /* A genuinely empty strip is a legitimate state, not a failure: movement tracks
     consensus tiers and metric ranks, so a refresh that only moved projections or
     confidence honestly produces zero rows ("zero movement means nothing actually moved").
     Asserting a non-empty strip tested the DATASET, not the code, and went red the first
     time a real change happened to move nothing movement watches (2026-08-03). Assert the
     invariant instead — rows drill through — and require the empty case to agree with the
     payload rather than be waved through. */
  if (!target) {
    const moved = payload().specs.reduce((n, sp) =>
      n + Object.values(sp.movement ?? {}).filter(Boolean).length, 0);
    assert.equal(moved, 0, "an empty change strip must mean the payload really has no movement");
    return;
  }
  await page.waitForTimeout(1200);
  const open = await page.evaluate(() => [...document.querySelectorAll(".row.open .spec-txt")].map(e => e.textContent.trim()));
  assert.deepEqual(open, [target.spec], `jumping to ${target.cls} ${target.spec} must open it whatever filter was active`);
});

ui("the Ladder shows every name AND every number without panning, at any width", async page => {
  // It used to be a fixed 1000-unit canvas with min-width:780px and values at x=992, so
  // below ~828px you got names or numbers but never both, with no cue that it panned.
  for (const width of [1440, 1024, 768, 560, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.getElementById("ladderbtn").click());
    await page.waitForTimeout(450);
    const r = await page.evaluate(() => {
      const host = document.querySelector("#ladder-chart");
      const h = host.getBoundingClientRect();
      const inView = el => { const b = el.getBoundingClientRect(); return b.left >= h.left - 1 && b.right <= h.right + 1; };
      const vals = [...document.querySelectorAll(".ladderval")], names = [...document.querySelectorAll(".laddername")];
      let overlaps = 0;
      document.querySelectorAll(".ladderrow").forEach(g => {
        const v = g.querySelector(".ladderval"), b = g.querySelector(".ladderbar");
        if (!v || !b) return;
        const vr = v.getBoundingClientRect(), br = b.getBoundingClientRect();
        if (vr.left < br.right && vr.right > br.left && vr.top < br.bottom && vr.bottom > br.top) overlaps++;
      });
      return {
        n: vals.length, valsOut: vals.filter(e => !inView(e)).length, namesOut: names.filter(e => !inView(e)).length,
        pans: host.scrollWidth > host.clientWidth, overlaps,
        dated: /\d{4}-\d{2}-\d{2}/.test(document.querySelector(".ladder-cap")?.textContent ?? ""),
      };
    });
    assert.ok(r.n > 5, `${width}px: expected a populated ladder`);
    assert.equal(r.valsOut, 0, `${width}px: ${r.valsOut} value labels outside the visible area`);
    assert.equal(r.namesOut, 0, `${width}px: ${r.namesOut} spec names outside the visible area`);
    assert.equal(r.pans, false, `${width}px: the chart must not require horizontal panning`);
    assert.equal(r.overlaps, 0, `${width}px: ${r.overlaps} value labels collide with their own bar`);
    assert.ok(r.dated, `${width}px: every ladder caption must state its own date`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
  }
});

/* Rendered XSS probe. The escaping boundary is the artifact's one load-bearing security
   property, and it can only be checked where the interpolation actually happens: in the
   browser. A static scan of dist/index.html cannot see it — verified by mutation, where
   removing esc() from the take-claim sink left a static check green.

   The fixture deliberately poisons only fields that still PASS validation (build() runs
   the full validator). That is the realistic threat model: an agent distilling a hostile
   creator post writes data that satisfies every schema rule. Identity fields that
   participate in cross-checks — a take's creator/class/spec — are left alone, because
   corrupting those is caught upstream and would make this test prove the wrong thing. */
test("no agent-writable field can inject markup or a handler into the rendered page", skipOpts, async () => {
  const { mkdtemp, rm, cp, readFile, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const MARK = "XSSPROBE";
  const TEXT_BREAK = `${MARK}</` + `script><img src=x onerror="window.__pwned=1">`;
  const ATTR_BREAK = `${MARK}" onmouseover="window.__pwned=1" x="`;

  const root = await mkdtemp(path.join(tmpdir(), "tracker-xss-"));
  try {
    await cp(path.join(ROOT, "data"), path.join(root, "data"), { recursive: true });
    await cp(path.join(ROOT, "src"), path.join(root, "src"), { recursive: true });
    const dp = f => path.join(root, "data", f);
    const load = async f => JSON.parse(await readFile(dp(f), "utf8"));
    const save = (f, v) => writeFile(dp(f), JSON.stringify(v, null, 2) + "\n");

    // Poison the prose of a spec that already HAS a creator take, so every sink in one
    // drawer renders at once.
    const takes = await load("creator-takes.json");
    const victim = takes.takes.find(x => !x.superseded) ?? takes.takes[0];
    const specs = await load("specs.json");
    const s = specs.find(x => x.class === victim.class && x.spec === victim.spec) ?? specs[0];

    // asOf is required on any writeup this fixture SYNTHESISES (the victim spec may not
    // have had one), and it is itself a rendered field — so poison-adjacent values must
    // still be valid data, or the hostile build fails validation before it can be probed.
    /* DERIVE the date, never hard-code it (2026-08-19). The tier-set upkeep gate compares
       tierSet.asOf against the newest build whose notes touch that spec's set, so a literal
       here is a time bomb with a fuse the length of the next set change. It went off: the
       Season-2 launch hotfix advanced Elemental Shaman's tierSet to 2026-08-18, the frozen
       "2026-07-24" fell behind it, and this test died inside build() — before probing a
       single sink — on a fixture fault that looked exactly like a data fault. Reading the
       date off the same feed the gate reads keeps the fixture valid for every future build. */
    const feed = await load("ptr-builds.json");
    const PROBE_DATE = (feed.builds ?? feed).reduce((max, b) => (b.date > max ? b.date : max), "2026-07-24");
    s.ptr = { verdict: "Mixed", theme: TEXT_BREAK, summary: ATTR_BREAK,
      changes: [TEXT_BREAK, ATTR_BREAK], set2: TEXT_BREAK, set4: ATTR_BREAK,
      watch: TEXT_BREAK, source: "https://www.wowhead.com/news/probe", asOf: PROBE_DATE };
    s.tierSet = { set2: TEXT_BREAK, set4: ATTR_BREAK, asOf: PROBE_DATE, source: "https://www.wowhead.com/probe" };
    s.metrics = [...(s.metrics ?? []), { source: "warcraftlogs", bracket: "raid",
      name: `Median rDPS ${TEXT_BREAK}`, value: 1, unit: ATTR_BREAK, asOf: PROBE_DATE }];
    await save("specs.json", specs);

    victim.claim = TEXT_BREAK;                 // creator/class/spec left intact on purpose
    const note = takes.metaNotes?.[0];
    if (note) note.note = ATTR_BREAK;
    await save("creator-takes.json", takes);

    const community = await load("community.json");
    const cls = (community.classes ?? []).find(c => c.class === s.class);
    if (cls?.creators?.[0]) cls.creators[0].credential = TEXT_BREAK;   // name is cross-checked
    if (cls?.sites?.[0]) cls.sites[0].name = ATTR_BREAK;
    await save("community.json", community);

    const enc = await load("encounter-tiers.json");
    const firstRaid = Object.keys(enc.raid ?? {})[0];
    if (firstRaid) enc.raid[firstRaid].name = TEXT_BREAK;
    await save("encounter-tiers.json", enc);

    /* ptr-builds.json is the most agent-written file in the repo: the nightly ptr-watch
       skill copies `highlights[]` verbatim out of a fetched Discourse thread. It was the
       one sink this fixture never poisoned, and the omission was load-bearing — mutating
       the "Official PTR tuning" list's `esc()` away left this test green (audit 2026-07-25).
       The highlight needs the "<Spec> <Class> " prefix or specBuildChanges drops it and the
       section never renders, which would make a poisoned fixture pass for the wrong reason. */
    const builds = await load("ptr-builds.json");
    const b0 = builds.builds?.[0];
    if (b0) {
      b0.specsAffected = [...new Set([...(b0.specsAffected ?? []), `${s.spec} ${s.class}`])];
      b0.highlights = [`${s.spec} ${s.class} ${TEXT_BREAK}`, ...(b0.highlights ?? [])];
      b0.label = ATTR_BREAK;
      await save("ptr-builds.json", builds);
    }

    const { build } = await import("../src/build.mjs");
    await build(root);   // real pipeline, including validation
    const hostile = path.join(root, "dist", "index.html");

    const page = await (await ensureBrowser()).newPage({ viewport: { width: 1440, height: 1000 } });
    try {
      await page.goto("file://" + hostile);
      await page.waitForFunction(() => document.querySelectorAll(".row").length > 0, { timeout: 15000 });
      await page.evaluate(spec => {
        [...document.querySelectorAll(".row.clickable")]
          .find(r => r.querySelector(".spec-txt")?.textContent.trim() === spec)?.click();
      }, s.spec);
      await page.waitForTimeout(700);

      const found = await page.evaluate(mark => ({
        pwned: !!window.__pwned,
        injectedImgs: document.querySelectorAll("img[onerror], img[src='x']").length,
        handlers: [...document.querySelectorAll("*")]
          .filter(e => [...e.attributes].some(a => /^on/i.test(a.name))).length,
        badHrefs: [...document.querySelectorAll("[href]")]
          // The hand-authored brand links are the only sanctioned icon hrefs. Match each
          // exact rel/type/size/path shape; arbitrary relative or data: URLs still fail.
          .filter(e => {
            if(e.tagName !== "LINK") return true;
            const href = e.getAttribute("href") ?? "";
            if(e.rel === "icon" && /^data:image\/svg\+xml,/.test(href)) return false;
            if(e.rel === "icon" && e.type === "image/png" && e.sizes.value === "192x192" && href === "/wow-class-tracker/favicon-192.png") return false;
            if(e.rel === "apple-touch-icon" && e.type === "image/png" && e.sizes.value === "180x180" && href === "/wow-class-tracker/apple-touch-icon.png") return false;
            return true;
          })
          // The pages this build publishes are the ONLY sanctioned relative hrefs. Both
          // appear because the masthead tab strip links the pair in both directions
          // (2026-08-05) — index.html is the tracker's own tab, gearing.html its sibling.
          // gearing.html may carry a fragment: the drawer deep-links a spec into the
          // explorer as gearing.html#spec=<slug> (2026-08-07). The fragment charset is
          // pinned to [a-z0-9=&-] because slugOf() lowercases and collapses everything
          // else to "-", so no roster value can widen it — a scheme or path cannot be
          // smuggled through. s1.html is the frozen Season-1 archive's footer link
          // (2026-08-12) — a deliberate one-name addition, not a pattern; the 12.2 cycle
          // adds s2 here as its own reviewed edit. Anchored both ends; any other relative
          // href, or a path prefix wrapped around one of these, is still a finding.
          .filter(e => !/^(?:index|gearing|s1)\.html(?:#[a-z0-9=&-]*)?$/.test(e.getAttribute("href") ?? ""))
          .filter(e => !/^(https:|#|$)/.test(e.getAttribute("href") ?? "")).length,
        markVisible: document.body.innerText.includes(mark),
        // Count the sinks the probe actually reached. A poisoned field whose section never
        // renders proves nothing, and this fixture has already shipped one of those.
        markedSinks: [...document.querySelectorAll(".drawer *")]
          .filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.includes(mark))).length,
      }), MARK);

      assert.equal(found.pwned, false, "an injected handler executed");
      assert.equal(found.injectedImgs, 0, "injected <img> reached the DOM");
      assert.equal(found.handlers, 0, "an inline on* handler reached the DOM");
      assert.equal(found.badHrefs, 0, "a non-https href reached the DOM");
      assert.equal(found.markVisible, true, "sanity: the probe must render as inert TEXT");
      assert.ok(found.markedSinks >= 4,
        `sanity: the probe must reach several drawer sinks, saw ${found.markedSinks} — a fixture that renders nothing cannot detect anything`);
    } finally {
      await page.close();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

ui("an era-gated PTR tier list shows its own 12.1 letters and is unreachable in the 12.0.7 view", async page => {
  const data = payload();
  const ptr = data.sources.find(s => s.kind === "tier-list" && s.era === "ptr");
  /* DERIVED, not asserted into existence (2026-08-15). This used to hard-assert that an
     era-gated tier list exists, which is true for the whole of a PTR cycle and false the
     moment flip step 5 retires `icyveins-ptr` — so it red at the flip state for a registry
     decision rather than a defect. Skipping when the lane is empty also makes it re-arm by
     itself at 12.2, when the next PTR list appears; naming a literal id here is the same
     pin-to-live-registry trap `f02caec` had to undo in four other fixtures. Same
     `if (!x) return` shape the frozen-archive test already uses for an absent lane. */
  if (!ptr) return;
  const subject = data.specs.find(s => s.ratings?.mplus?.[ptr.id] != null);
  assert.ok(subject, "expected at least one spec rated by the PTR list");

  if (!data.meta.phases.ptr) {
    // Post-flip the era pin makes the PTR product unreachable EVERYWHERE (DECISION 3 as
    // amended 2026-08-12: the sunset happens AT the flip — the receipts live on in the
    // frozen basis strings and the immutable artifact, not as a pickable column).
    // Selecting it must land somewhere honest, exactly like the old 12.0.7-only gate.
    await pickSource(page, ptr.id);
    await page.waitForTimeout(150);
    const gate = await page.evaluate(id => ({
      disabled: document.querySelector(`#srcsel option[value="${id}"]`).disabled,
      pressedSource: document.querySelector('#srcseg button[aria-pressed="true"]')?.dataset.source ?? null,
      selValue: document.getElementById("srcsel").value
    }), ptr.id);
    assert.equal(gate.disabled, true, "the PTR source OPTION is disabled post-flip");
    assert.equal(gate.pressedSource, "consensus", "the view falls back to consensus, not a blank grid");
    assert.equal(gate.selValue, "", "…and the select resets to its placeholder");
    const [, mplusTier] = await tiersOf(page, subject.class, subject.spec);
    assert.equal(mplusTier, subject.consensus.mplus.tier, "the grid shows the live consensus");
    // The "N tier lists feed a computed consensus" blurb counts what ACTUALLY feeds it —
    // mid-transition that is the season-current outlets only (DECISION 1: the consensus
    // honestly shrinks), so derive the expectation from perSource, same as the page does.
    const feeding = Math.max(0, ...data.specs.map(sp => Math.max(
      sp.consensus?.raid?.perSource?.length ?? 0, sp.consensus?.mplus?.perSource?.length ?? 0)));
    const words = ["No","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];
    const shown = await page.evaluate(() => document.getElementById("tlcount")?.textContent ?? "");
    assert.equal(shown, words[feeding], "the derived tier-list count matches the consensus composition");
    return;
  }

  // 1. In the default (Both) era it behaves like any other source view: its OWN letters.
  await pickSource(page, ptr.id);
  await page.waitForTimeout(120);
  const [raid, mplus] = await tiersOf(page, subject.class, subject.spec);
  assert.equal(mplus, subject.ratings.mplus[ptr.id], "M+ column shows the PTR list's letter");
  // Icy Veins publishes no PTR raid list, so the raid column must be an honest dash —
  // never the live letter or the consensus quietly standing in for a source that is absent.
  assert.equal(raid, "—", "no PTR raid list exists, so the raid column is a dash");

  // 2. The letters are 12.1, so the view note must not describe them as 12.0.7 tiers.
  const note = await page.evaluate(() => {
    const n = document.getElementById("viewnote");
    return n && !n.hidden ? n.textContent : "";
  });
  assert.match(note, /12\.1 PTR/, "the view note names the era of the letters on screen");
  assert.doesNotMatch(note, /12\.0\.7 tiers/, "PTR letters must never be labelled 12.0.7");

  // 3. Switching to the 12.0.7-only era must take the view away — a 12.1 opinion has no
  //    place in a live-only read — and land somewhere honest rather than a blank grid.
  await page.evaluate(() => document.querySelector('#eraseg button[data-era="live"]').click());
  await page.waitForTimeout(150);
  const gate = await page.evaluate(id => ({
    disabled: document.querySelector(`#srcsel option[value="${id}"]`).disabled,
    pressedSource: document.querySelector('#srcseg button[aria-pressed="true"]')?.dataset.source ?? null,
    selValue: document.getElementById("srcsel").value
  }), ptr.id);
  assert.equal(gate.disabled, true, "the PTR source OPTION is disabled in the 12.0.7 view");
  assert.equal(gate.pressedSource, "consensus", "the view falls back to consensus, not a blank grid");
  assert.equal(gate.selValue, "", "…and the select resets to its placeholder");
  const [, backToConsensus] = await tiersOf(page, subject.class, subject.spec);
  assert.equal(backToConsensus, subject.consensus.mplus.tier, "the grid now shows the live consensus");

  /* 4. The "N tier lists feed a computed consensus" blurb must count what ACTUALLY feeds it.
     Derived from perSource, the same quantity the page uses — not from an era filter. Era is
     only ONE of the two reasons a tier list leaves the consensus; the other is being
     season-ahead with no frozen record, which an era filter cannot see. Measured 2026-08-14:
     with Method's pages on s2 and freeze-season not yet run, the page says "Three" while the
     era count says "Four", and the suite reds on a state that is entirely correct. The
     nightly hides this because its publish job runs freeze-season BEFORE Gate 1, restoring
     the contributor — but freezing is allowed to decline ("Refusing to guess"), and a local
     run can reach Gate 1 without it. The pre-staged flip patch already adopts exactly this
     derivation for the post-flip branch; this is the same rule applied to the pre-flip path. */
  const feeding = Math.max(0, ...data.specs.map(sp => Math.max(
    sp.consensus?.raid?.perSource?.length ?? 0, sp.consensus?.mplus?.perSource?.length ?? 0)));
  const words = ["No","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];
  const shown = await page.evaluate(() => document.getElementById("tlcount")?.textContent ?? "");
  assert.equal(shown, words[feeding], "the derived tier-list count matches the consensus composition");
});

ui("the 12.1 forecast column shows its evidence strength, and only there", async page => {
  const data = payload();
  // Projection view, Both era — the only place confidence describes what is on screen.
  await page.evaluate(() => document.querySelector('#srcseg button[data-source="projection"]').click());
  await page.waitForTimeout(150);

  const shown = await page.evaluate(() => [...document.querySelectorAll(".row.clickable")].map(r => ({
    spec: r.querySelector(".spec-txt")?.textContent.trim(),
    cls: r.querySelector(".cls")?.textContent.trim(),
    conf: [...r.querySelectorAll(".conf")].map(c => c.dataset.c)
  })));
  assert.ok(shown.length > 0);

  // Every rendered marker must match the payload's confidence for that spec+bracket —
  // the grid may not claim more (or less) evidence than the projection actually has.
  let checked = 0;
  for (const row of shown) {
    const spec = data.specs.find(s => s.spec === row.spec && s.class === row.cls);
    if (!spec?.projection) continue;
    const expected = ["raid", "mplus"]
      .map(b => spec.projection[b]?.confidence)
      .filter(Boolean);
    assert.deepEqual(row.conf, expected, `${row.cls} ${row.spec}: grid confidence must equal payload confidence`);
    checked += expected.length;
  }
  assert.ok(checked >= 40, `expected to verify many cells, saw ${checked}`);

  // The audit's P4a case must be visible, not merely encoded: low/prior-only cells exist
  // and are distinguishable from high ones.
  const weak = shown.flatMap(r => r.conf).filter(c => c === "low" || c === "prior-only").length;
  assert.ok(weak > 0, "expected some thinly-evidenced forecasts to be marked");

  // A fetched source's letters are NOT ours to caveat — no marker outside the forecast.
  await pickSource(page, "icyveins");
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => document.querySelectorAll("#matrix .conf").length), 0,
    "confidence must not appear over a source's own ratings");
  await page.evaluate(() => document.querySelector('#srcseg button[data-source="consensus"]').click());
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => document.querySelectorAll("#matrix .conf").length), 0,
    "consensus is measured, not forecast — no confidence marker");
});

/* ---------- Compare all: the full-roster matrix ---------- */

ui("Compare all shows each source's OWN letters and each role's OWN ranks", async page => {
  const data = payload();
  await page.click("#allbtn");
  await page.waitForSelector("table.alltab tbody tr");

  // Every tier cell must equal that source's stored rating for that spec+bracket. This is
  // the guarantee that caught source-view bleed on the main grid; a second surface drawing
  // the same letters needs it independently or it can drift on its own.
  const seen = await page.$$eval("table.alltab tbody tr", rows => {
    const heads = [...document.querySelectorAll("table.alltab thead tr:first-child th")]
      .map(th => th.dataset.k || "nm");
    return rows.map(r => {
      const out = { spec: r.dataset.spec, cls: r.dataset.cls, tiers: {}, ranks: {} };
      [...r.children].forEach((td, i) => {
        const k = heads[i]; if (!k || k === "nm") return;
        const t = td.querySelector(".all-t");
        if (t) out.tiers[k] = t.textContent.trim();
        else if (td.classList.contains("all-rk")) out.ranks[k] = td.textContent.trim();
      });
      return out;
    });
  });
  assert.equal(seen.length, data.specs.length, "every spec gets a row");

  let checked = 0;
  for (const row of seen) {
    const spec = data.specs.find(s => s.spec === row.spec && s.class === row.cls);
    for (const [key, shownTier] of Object.entries(row.tiers)) {
      const expected = key === "consensus" ? spec.consensus?.raid?.tier
        : key === "projection" ? spec.projection?.raid?.tier
        : spec.ratings?.raid?.[key];
      assert.equal(shownTier, expected, `${row.cls} ${row.spec} ${key}: matrix letter must equal the payload's`);
      checked++;
    }
  }
  assert.ok(checked > 100, `expected many tier cells verified, saw ${checked}`);

  // A rank shown against a spec must be that spec's rank in the family matching its ROLE.
  const wcl = { DPS: "Median rDPS (Mythic, all bosses)", Tank: "Median rDPS (Mythic, all bosses, tank)",
                Healer: "Median HPS (Mythic, all bosses)" };
  let rk = 0;
  for (const row of seen) {
    const shown = row.ranks["m:wcl"];
    if (!shown || shown === "—" || shown === "·") continue;
    const spec = data.specs.find(s => s.spec === row.spec && s.class === row.cls);
    const m = spec.metrics.find(x => x.bracket === "raid" && x.name === wcl[spec.role]);
    assert.equal(shown.replace("#", ""), String(m.rank),
      `${row.cls} ${row.spec}: WCL rank must come from the ${spec.role} family`);
    rk++;
  }
  assert.ok(rk > 20, `expected many rank cells verified, saw ${rk}`);
});

ui("Compare all distinguishes 'no such measurement' from 'not fetched', and era-gates", async page => {
  await page.click("#allbtn");
  await page.waitForSelector("table.alltab tbody tr");

  // A healer has no SimC sim by construction (·); that is not the same claim as a metric
  // family that exists for the role but has no row yet (—). Conflating them would let the
  // page imply a fetch is pending for a number that can never exist.
  const marks = await page.$$eval("table.alltab tbody tr", rows => {
    const heads = [...document.querySelectorAll("table.alltab thead tr:first-child th")].map(th => th.dataset.k || "nm");
    const col = heads.indexOf("m:simc");
    return rows.map(r => ({ role: r.querySelector(".all-role").textContent, txt: r.children[col].textContent.trim() }));
  });
  const healers = marks.filter(m => /Healer/.test(m.role));
  assert.ok(healers.length > 0 && healers.every(m => m.txt === "·"),
    "healers must read '·' (no sim basis), never '—' (pending)");
  assert.ok(marks.some(m => /DPS/.test(m.role) && m.txt.startsWith("#")), "DPS specs do have sim ranks");

  // Era gate: the PTR list, our forecast and the PTR-testing column must be ABSENT in the
  // 12.0.7-only view, not merely blank — same rule every other surface follows.
  const cols = () => page.$$eval("table.alltab thead tr:first-child th", th => th.map(x => x.dataset.k || "nm"));
  assert.ok((await cols()).includes("projection"), "the forecast column shows in the default (both) era");
  const meta = payload().meta;
  if (meta.frozenForecast) {
    // B6: post-flip the default (and only) view IS live. The frozen forecast is the one
    // projection surface exempt from the era gate — the PTR receipts still sunset with
    // the flip (DECISION 3 as amended), so their columns must stay absent.
    const live = await cols();
    assert.ok(live.includes("projection"), "the FROZEN forecast column survives in the live view");
    assert.ok(!live.includes("m:ptr"), "PTR testing ranks are sunset at the flip");
    assert.ok(!live.some(k => k === "icyveins-ptr"), "the PTR tier list is sunset at the flip");
    assert.ok(live.includes("consensus") && live.includes("icyveins"), "live-era columns remain");
    return;
  }
  await page.click("#all-close");
  await page.evaluate(() => document.querySelector('#eraseg button[data-era="live"]').click());
  await page.click("#allbtn");
  await page.waitForSelector("table.alltab tbody tr");
  const live = await cols();
  assert.ok(!live.includes("projection"), "our 12.1 forecast is era-gated out of the 12.0.7 view");
  assert.ok(!live.includes("m:ptr"), "PTR testing ranks are era-gated out");
  assert.ok(!live.some(k => k === "icyveins-ptr"), "the PTR tier list is era-gated out");
  assert.ok(live.includes("consensus") && live.includes("icyveins"), "live-era columns remain");
});

ui("Compare all sorts tiers by scale score, not alphabetically", async page => {
  await page.click("#allbtn");
  await page.waitForSelector("table.alltab tbody tr");
  await page.click('thead th[data-k="consensus"]');   // already the default key; this toggles
  await page.click('thead th[data-k="consensus"]');   // …back to descending
  // Locate the consensus column by its header key — a positional selector silently reads
  // whichever column the era gate happens to have left in that slot.
  const order = await page.$$eval("table.alltab tbody tr", rows => {
    const heads = [...document.querySelectorAll("table.alltab thead tr:first-child th")].map(th => th.dataset.k || "nm");
    const col = heads.indexOf("consensus");
    return rows.map(r => { const t = r.children[col].querySelector(".all-t"); return t ? t.textContent.trim() : null; });
  });
  const data = payload();
  const rank = t => data.scales.consensus.bands.findIndex(b => b.tier === t);
  const seen = order.filter(Boolean).map(rank);
  // Alphabetically "A+" sorts before "A" and "B+" before "B"; by score the opposite holds.
  // Asserting monotonic band order catches either mistake.
  for (let i = 1; i < seen.length; i++) {
    assert.ok(seen[i] >= seen[i - 1], `tier order must follow the scale, not the alphabet (position ${i})`);
  }
});

/* ---------- overlay deep-linking (UI/UX pass) ---------- */

ui("an overlay deep link restores the view and its state; open state round-trips the URL", async page => {
  // Opening an overlay and changing its state must mirror into the hash…
  await page.click("#allbtn");
  await page.waitForSelector("#all-ov.open");
  await page.click('#all-bkt button[data-bkt="mplus"]');
  let hash = await page.evaluate(() => location.hash);
  assert.match(hash, /view=all/, "the open overlay is in the URL");
  assert.match(hash, /ab=mplus/, "…with its non-default state");
  // …and closing must clear it, or every later link silently reopens a dead overlay.
  await page.click("#all-close");
  hash = await page.evaluate(() => location.hash || "");
  assert.ok(!/view=/.test(hash), "closing removes the view from the URL");
}, "");

ui("a shared overlay link opens on the linked bracket, role and sort", async page => {
  await page.waitForSelector("#all-ov.open table.alltab tbody tr");
  assert.equal(await page.$eval('#all-bkt button[aria-pressed="true"]', e => e.dataset.bkt), "mplus");
  assert.equal(await page.$eval('#all-role button[aria-pressed="true"]', e => e.dataset.ar), "Healer");
  const rows = await page.$$eval("table.alltab tbody tr", r => r.length);
  assert.equal(rows, 7, "seven healers");
  // An invalid sort key in a link must fall back, never draw a sort the table lacks.
}, "#view=all&ab=mplus&ar=Healer&ak=m:nonsense");

ui("a spec with takes but no writeup says what IS known, not 'pending'", async page => {
  const data = payload();
  const takes = data.creatorTakes?.takes ?? [];
  // The fixture must follow the era vocabulary, not outlive it. Pre-flip every live take
  // said "PTR" in its patchContext, so filtering on that picked an era-relevant take. Since
  // the 2026-08-18 launch, watch-creators writes post-launch takes as "Season 2 live — …"
  // by rule, so that filter goes empty the moment the last PTR-era take on the writeup-less
  // spec is superseded — which is exactly what a correct supersede does. It happened on
  // 2026-08-22, when Kalamazi's 08-17 Demonology reads (the only writeup-less spec's only
  // live takes) were replaced by his live-era August 25 tuning reads. Requiring "PTR" while
  // a cycle is open keeps the original selection; requiring only a LIVE take between cycles
  // keeps the invariant testable instead of quietly asserting a stale era.
  const eraOk = data.meta.phases.ptr
    ? t => (t.patchContext || "").includes("PTR")
    : () => true;
  const bare = data.specs.find(s => !s.ptr &&
    takes.some(t => t.class === s.class && t.spec === s.spec && !t.superseded && eraOk(t)));
  assert.ok(bare, "expected a writeup-less spec that carries takes");
  const text = await page.evaluate(([cls, spec]) => {
    const row = [...document.querySelectorAll(".row.clickable")].find(r =>
      r.querySelector(".spec-txt")?.textContent.trim() === spec &&
      r.querySelector(".cls")?.textContent.trim() === cls);
    row.click();
    return row.querySelector(".d-summary")?.textContent ?? "";
  }, [bare.class, bare.spec]);
  if (data.meta.phases.ptr) {
    assert.match(text, /cited creator take/, "the slot points at the takes");
  } else {
    // Post-flip the writeup lane sunsets with the rest of the PTR surfaces (DECISION 3
    // as amended): the drawer shows the live-season baseline slot instead. It must
    // still never apologise with "pending" — that claim was false pre-flip and would
    // be meaningless now.
    assert.match(text, new RegExp(`${data.meta.phases.liveLabel.replace(/\./g, "\\.")} baseline view`),
      "the slot names the live-season baseline");
    assert.match(text, /Live-season data\./);
  }
  assert.doesNotMatch(text, /pending/i, "and never implies nothing is known");
});

ui("the legend remembers the user's toggle across reloads — and only the user's", async page => {
  // Hermetic start: clear any leaked state and reload so this IS a first visit.
  await page.evaluate(() => localStorage.removeItem("wct-legend"));
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll(".row").length > 0);
  // Wide viewport (harness default): the width heuristic opens it, and the DEFAULT is
  // never written to storage — only a real user toggle is.
  assert.equal(await page.$eval("#legendwrap", el => el.open), true, "wide first visit starts open");
  assert.equal(await page.evaluate(() => localStorage.getItem("wct-legend")), null,
    "the width default must not freeze itself into storage");
  await page.click("#legendwrap > summary");
  await page.waitForFunction(() => localStorage.getItem("wct-legend") === "closed");
  assert.equal(await page.evaluate(() => localStorage.getItem("wct-legend")), "closed");
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll(".row").length > 0);
  assert.equal(await page.$eval("#legendwrap", el => el.open), false, "closed survives a reload");
  await page.click("#legendwrap > summary");
  await page.waitForFunction(() => localStorage.getItem("wct-legend") === "open");
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll(".row").length > 0);
  assert.equal(await page.$eval("#legendwrap", el => el.open), true, "…and reopened survives too");
});

ui("motion defaults on, marks real entrances, and persists the site reduction control", async page => {
  // The reference site animates even when the OS asks for less motion. This site now does
  // the same by default, with an explicit persisted control for people who want it quiet.
  await page.evaluate(() => localStorage.removeItem("wct-reduce-motion"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll(".row").length > 0);
  /* .rule and the #stars canvas were retired with the tall masthead (2026-08-22), so the
     ambient probes are gone. The .switch and .chev transitions replace them: both are
     motion surfaces the control governs, and both survive every layout this page has. */

  const defaultOn = await page.evaluate(() => ({
    rootReduced: document.documentElement.dataset.reduceMotion ?? null,
    stored: localStorage.getItem("wct-reduce-motion"),
    checked: document.getElementById("reduce-motion").checked,
    switchTransition: getComputedStyle(document.querySelector(".switch")).transitionDuration,
    chevTransition: getComputedStyle(document.querySelector(".chev")).transitionDuration,
    topScroll: (() => {
      let behavior = null;
      const prior = window.scrollTo;
      window.scrollTo = opts => { behavior = opts.behavior; };
      document.getElementById("toTop").click();
      window.scrollTo = prior;
      return behavior;
    })(),
  }));
  assert.deepEqual(defaultOn, {
    rootReduced: null, stored: null, checked: false,
    switchTransition: "0.15s", chevTransition: "0.18s, 0.15s", topScroll: "smooth",
  });

  // Opening the Ladder animates its shell and its bars together.
  await page.evaluate(() => document.getElementById("ladderbtn").click());
  const opening = await page.evaluate(() => ({
    overlayClass: document.getElementById("ladder-ov").classList.contains("motion-enter"),
    chartClass: document.getElementById("ladder-chart").classList.contains("motion-enter"),
    panelAnimation: getComputedStyle(document.querySelector("#ladder-ov .finder-panel")).animationName,
    barAnimation: getComputedStyle(document.querySelector("#ladder-chart .ladderbar")).animationName,
  }));
  assert.deepEqual(opening, {
    overlayClass: true, chartClass: true, panelAnimation: "ov-rise", barAnimation: "bar-grow",
  });

  // A series swap should animate the new chart, never replay the whole open panel.
  await page.waitForTimeout(500);
  await page.click('.lgrp .fopt[aria-pressed="false"]');
  const swapped = await page.evaluate(() => ({
    overlayClass: document.getElementById("ladder-ov").classList.contains("motion-enter"),
    chartClass: document.getElementById("ladder-chart").classList.contains("motion-enter"),
    panelAnimation: getComputedStyle(document.querySelector("#ladder-ov .finder-panel")).animationName,
    barAnimation: getComputedStyle(document.querySelector("#ladder-chart .ladderbar")).animationName,
  }));
  assert.deepEqual(swapped, {
    overlayClass: false, chartClass: true, panelAnimation: "none", barAnimation: "bar-grow",
  });

  // The site control stops an in-flight entrance immediately and persists across reloads.
  await page.evaluate(() => document.getElementById("reduce-motion").click());
  await page.waitForTimeout(80);
  const reducedNow = await page.evaluate(() => ({
    rootReduced: document.documentElement.dataset.reduceMotion,
    stored: localStorage.getItem("wct-reduce-motion"),
    checked: document.getElementById("reduce-motion").checked,
    overlayClass: document.getElementById("ladder-ov").classList.contains("motion-enter"),
    chartClass: document.getElementById("ladder-chart").classList.contains("motion-enter"),
    panelAnimation: getComputedStyle(document.querySelector("#ladder-ov .finder-panel")).animationName,
    barAnimation: getComputedStyle(document.querySelector("#ladder-chart .ladderbar")).animationName,
    switchTransition: getComputedStyle(document.querySelector(".switch")).transitionDuration,
    chevTransition: getComputedStyle(document.querySelector(".chev")).transitionDuration,
    topScroll: (() => {
      let behavior = null;
      const prior = window.scrollTo;
      window.scrollTo = opts => { behavior = opts.behavior; };
      document.getElementById("toTop").click();
      window.scrollTo = prior;
      return behavior;
    })(),
  }));
  assert.deepEqual(reducedNow, {
    rootReduced: "true", stored: "reduce", checked: true,
    overlayClass: false, chartClass: false, panelAnimation: "none", barAnimation: "none",
    switchTransition: "0s", chevTransition: "0s", topScroll: "auto",
  });

  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll(".row").length > 0);
  const persisted = await page.evaluate(() => ({
    rootReduced: document.documentElement.dataset.reduceMotion,
    stored: localStorage.getItem("wct-reduce-motion"),
    checked: document.getElementById("reduce-motion").checked,
    switchTransition: getComputedStyle(document.querySelector(".switch")).transitionDuration,
    chevTransition: getComputedStyle(document.querySelector(".chev")).transitionDuration,
  }));
  assert.deepEqual(persisted, {
    rootReduced: "true", stored: "reduce", checked: true,
    switchTransition: "0s", chevTransition: "0s",
  });

  // Re-enabling motion restores transitions and future entrances without a reload.
  await page.evaluate(() => document.getElementById("reduce-motion").click());
  await page.evaluate(() => document.getElementById("ladderbtn").click());
  await page.waitForFunction(() =>
    getComputedStyle(document.querySelector(".switch")).transitionDuration !== "0s");
  const resumed = await page.evaluate(() => ({
    rootReduced: document.documentElement.dataset.reduceMotion ?? null,
    stored: localStorage.getItem("wct-reduce-motion"),
    checked: document.getElementById("reduce-motion").checked,
    overlayClass: document.getElementById("ladder-ov").classList.contains("motion-enter"),
    chartClass: document.getElementById("ladder-chart").classList.contains("motion-enter"),
    panelAnimation: getComputedStyle(document.querySelector("#ladder-ov .finder-panel")).animationName,
    barAnimation: getComputedStyle(document.querySelector("#ladder-chart .ladderbar")).animationName,
    switchTransition: getComputedStyle(document.querySelector(".switch")).transitionDuration,
  }));
  assert.deepEqual(resumed, {
    rootReduced: null, stored: null, checked: false,
    overlayClass: true, chartClass: true, panelAnimation: "ov-rise", barAnimation: "bar-grow",
    switchTransition: "0.15s",
  });
});

/* THE INVARIANT WHOSE ABSENCE LET A CONTRADICTION SHIP GREEN (2026-08-09).
   The toolbar used to re-derive "which sources count" client-side from the registry —
   a second copy of consensusFor's eligibility rule. The frozen lane broke that copy
   silently: an outlet that has moved to the next season still contributes its final
   live-season letters, so every cell averaged 4 sources while the page said 3, on 79 of
   80 rows, with all 338 tests passing. Nothing compared the sentence to the cells.
   So: assert the visible counts against what the payload's cells actually averaged. */
ui("every visible consensus count equals the number of sources the cells actually averaged", async page => {
  const data = payload();
  /* PER BRACKET (2026-08-19, C1 landing): a transition can split the brackets — Archon's
     M+ pages verified S2 while its raid pages were still rebuilding, so M+ cells honestly
     averaged 4 sources against raid's 3. When they differ the page must say BOTH numbers;
     a single figure would overstate one bracket, which is the exact contradiction this
     invariant exists to catch. */
  const bracketMax = b => {
    const counts = data.specs.map(s => (s.consensus?.[b]?.perSource ?? []).length).filter(n => n > 0);
    return counts.length ? Math.max(...counts) : 0;
  };
  const nRaid = bracketMax("raid"), nMplus = bracketMax("mplus");
  const averaged = Math.max(nRaid, nMplus);
  const split = nRaid > 0 && nMplus > 0 && nRaid !== nMplus;

  const shown = await page.evaluate(() => ({
    toolstatus: document.getElementById("toolstatus")?.textContent ?? "",
    notestamp: document.getElementById("notestamp")?.textContent ?? "",
    tlcount: document.getElementById("tlcount")?.textContent ?? ""
  }));

  const words = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  if (split) {
    assert.match(shown.toolstatus, new RegExp(`consensus of ${nRaid} \\(raid\\) · ${nMplus} \\(M\\+\\) sources`),
      `#toolstatus must state both bracket counts (${nRaid} raid / ${nMplus} M+), got "${shown.toolstatus}"`);
    assert.match(shown.notestamp, new RegExp(`\\b${nRaid}-source \\(raid\\) / ${nMplus}-source \\(M\\+\\) consensus`),
      `#notestamp must agree with #toolstatus, got "${shown.notestamp}"`);
  } else {
    assert.match(shown.toolstatus, new RegExp(`consensus of ${averaged} sources?\\b`),
      `#toolstatus must state the ${averaged} sources the cells averaged, got "${shown.toolstatus}"`);
    assert.match(shown.notestamp, new RegExp(`\\b${averaged}-source consensus`),
      `#notestamp must agree with #toolstatus, got "${shown.notestamp}"`);
  }
  /* The split case: this invariant already argues in the comment above that BOTH numbers
     must be shown when the brackets differ — "a single figure would overstate one bracket,
     which is the exact contradiction this invariant exists to catch" — and enforces that
     for #toolstatus and #notestamp. The blurb was the one place still pinned to the max,
     i.e. the contradiction the comment describes. Widened 2026-08-22 so the assertion
     matches its own reasoning. */
  const expectedBlurb = split
    ? `${words[Math.min(nRaid, nMplus)]} to ${words[Math.max(nRaid, nMplus)].toLowerCase()}`
    : words[averaged];
  assert.equal(shown.tlcount, expectedBlurb,
    `the "N tier lists feed a computed consensus" blurb must agree too, and must say BOTH
     counts when the brackets are split, got "${shown.tlcount}"`);

  /* DIRECTION. A frozen source is AHEAD — it has already published the next season — so
     it must never be described with the lag vocabulary ("updating"), which asserts the
     opposite of what happened. Nine such chips shipped reading "updating for 12.0.7" on
     pages that were all ahead and none behind. */
  const frozen = new Set();
  for (const s of data.specs) for (const b of ["raid", "mplus"])
    for (const p of (s.consensus?.[b]?.perSource ?? [])) if (p.lane === "frozen") frozen.add(p.source);
  if (frozen.size) {
    const names = [...frozen].map(id => data.sources.find(x => x.id === id)?.name ?? id);
    for (const name of names) {
      assert.ok(shown.toolstatus.includes(name),
        `a frozen contributor must be named where the count is stated, got "${shown.toolstatus}"`);
    }
    assert.doesNotMatch(shown.toolstatus, /updating/i,
      "a source that is AHEAD of the live season must never be described as 'updating'");
    assert.doesNotMatch(shown.notestamp, /updating/i,
      "…and the same in the always-visible note above the grid");
  }

  /* The footer chips, both directions. Expected: one chip per page of a live-era source
     that is out of step, none at all for an era:"ptr" list (describing the next patch is
     what it IS), none for an ANCILLARY page, and no lag vocabulary on a page that is ahead. */
  const liveSources = data.sources.filter(s => s.kind === "tier-list" && (s.era ?? "live") === "live");
  const liveSeason = data.meta.phases.liveSeason;
  const order = data.meta.phases.seasonOrder ?? ["s1", "s2"];
  /* `!p.ancillary` mirrors sourceSeasonOk/aheadSeasonFor (2026-08-19 audit, C1). Ancillary
     pages are encounter-tier and drawer-metric inputs, never letter inputs, so they are
     outside the season gate entirely and a lag chip on one is a category error — its
     tooltip claims exclusion "from the consensus until it updates" about a page that is
     never in the consensus. This expectation omitted the predicate and so pinned the bug:
     it required the 3 chips Archon's retired S1 per-boss/per-dungeon/survivability pages
     were wrongly rendering. */
  const chipPages = s => (s.pages ?? []).filter(p =>
    !p.ancillary && p.seasonVerified != null && p.seasonVerified !== liveSeason);
  const expectedChips = liveSources.reduce((n, s) => n + chipPages(s).length, 0);
  const chips = await page.evaluate(() => [...document.querySelectorAll(".lagchip")]
    .map(c => ({ text: c.textContent, title: c.getAttribute("title") ?? "" })));
  assert.equal(chips.length, expectedChips,
    "one season chip per out-of-step page of a LIVE-era source, and none for an era:'ptr' list or an ancillary page");
  /* Pin the C1 rule from the other side: no chip may sit on an ancillary page's row. The
     count above can be satisfied by the right TOTAL landing on the wrong rows, which is
     precisely what a label-keyed lookup would do if the chip moved. */
  const ancillaryLabels = liveSources.flatMap(s => (s.pages ?? [])
    .filter(p => p.ancillary && p.label).map(p => p.label));
  if (ancillaryLabels.length) {
    const rows = await page.evaluate(() => [...document.querySelectorAll(".srcitem")]
      .map(e => ({ text: e.textContent ?? "", chip: !!e.querySelector(".lagchip") })));
    for (const label of ancillaryLabels) {
      const row = rows.find(r => r.text.includes(label));
      if (row) assert.equal(row.chip, false,
        `an ancillary page is outside the season gate and must carry no lag chip — "${label}" has one`);
    }
  }
  for (const chip of chips) {
    const ahead = liveSources.some(s => (s.pages ?? []).some(p =>
      p.seasonVerified != null && order.indexOf(p.seasonVerified) > order.indexOf(liveSeason)));
    if (!ahead) continue;
    assert.doesNotMatch(chip.text, /updating/i,
      `a page that is AHEAD must not read as behind — got "${chip.text}"`);
    assert.doesNotMatch(chip.title, /previous season/i,
      `…nor claim it describes the PREVIOUS season — got "${chip.title}"`);
    if (frozen.size) {
      assert.doesNotMatch(chip.title, /excluded from the consensus/i,
        "a frozen source's letters ARE in the consensus — saying otherwise contradicts the toolbar on the same page");
    }
  }
});

/* THE COLUMN QUALIFIER NAMES THE SEASON ITS LETTERS DESCRIBE (2026-08-09).
   The qualifier exists so a screenshot cannot misattribute a column, and it was a flat
   "12.0.7" for every source view — which stamped the live patch on Wowhead's Season-2
   letters, in the default view and on the mobile .mtag where .head is display:none.
   Generalises the era:"ptr" check: ANY source whose pages describe a season other than
   the live one must be labelled with ITS patch, not the live one. */
ui("a source's column qualifier names the season that source's letters describe", async page => {
  const data = payload();
  const phases = data.meta.phases;
  const order = phases.seasonOrder ?? ["s1", "s2"];
  const labelOf = s => phases.seasonLabels?.[s] ?? phases.liveLabel;

  const qualsFor = async id => page.evaluate(sourceId => {
    const sel = document.getElementById("srcsel");
    sel.value = sourceId;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    return [...document.querySelectorAll(".head .hqual")].map(e => e.textContent);
  }, id);

  for (const src of data.sources.filter(s => s.kind === "tier-list")) {
    // Post-flip an era:"ptr" product's option redirects to consensus (its column is
    // sunset), so the qualifiers on screen would not be ITS column's — skip it here;
    // the redirect itself is pinned in the PTR-list invariant.
    if (!phases.ptr && (src.era ?? "live") !== "live") continue;
    const quals = await qualsFor(src.id);
    assert.equal(quals.length, 2, `${src.id}: expected a raid and an M+ qualifier`);
    for (const [i, bracket] of ["raid", "mplus"].entries()) {
      const seasons = [...new Set((src.pages ?? []).filter(p => p.bracket === bracket)
        .map(p => p.seasonVerified).filter(Boolean))];
      // Only assert where the source unambiguously describes ONE season for this bracket.
      if (seasons.length !== 1) continue;
      const expected = labelOf(seasons[0]);
      assert.equal(quals[i], expected,
        `${src.id} ${bracket}: column shows ${seasons[0]} letters but is labelled "${quals[i]}", expected "${expected}"`);
      if (seasons[0] !== phases.liveSeason) {
        assert.notEqual(quals[i], phases.liveLabel,
          `${src.id} ${bracket}: letters describing ${seasons[0]} must never carry the live patch label`);
      }
    }
  }

  // The forecast column names the patch it forecasts, not the live one.
  const projQuals = await page.evaluate(() => {
    document.querySelector('#srcseg button[data-source="projection"]').click();
    return [...document.querySelectorAll(".head .hqual")].map(e => e.textContent);
  });
  const nextLabel = labelOf(order[order.indexOf(phases.liveSeason) + 1]);
  const ff = data.meta.frozenForecast;
  for (const q of projQuals) {
    if (ff) {
      // B6: the column is a RECORD, and the qualifier — the anti-misattribution
      // surface — must date the freeze so a screenshot cannot read it as a live opinion.
      assert.equal(q, `12.1 forecast — frozen ${ff.date}`,
        `the frozen forecast column must be dated, got "${q}"`);
    } else {
      assert.match(q, /forecast$/, `the forecast column must say so, got "${q}"`);
      assert.ok(q.startsWith(nextLabel), `the forecast column names ${nextLabel}, got "${q}"`);
    }
  }
});

/* ---- the frozen-forecast mode (DECISION 2, 2026-08-12) -------------------------------
   Post-flip the era toggle is gone (ptr null pins era "live"), and before this lane the
   live view hid every projection surface — so the flip would have silently removed the
   forecast column exactly when it becomes the record the report card grades. This fixture
   doctors the built page's payload into the post-flip state (META.frozenForecast set,
   phases.ptr null) and asserts the frozen record renders, labelled as a record. The CSP
   meta is stripped from the fixture: the doctored inline script no longer matches the
   built hash, and a page whose script cannot run would assert nothing. */
test("the FROZEN forecast column renders in the post-flip live view, labelled as a record", skipOpts, async () => {
  const { mkdtemp, rm, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const dir = await mkdtemp(path.join(tmpdir(), "tracker-frozen-"));
  try {
    const html = readFileSync(DIST, "utf8");
    const i = html.indexOf("const DATA = ");
    const j = html.indexOf("\n", i);
    const data = JSON.parse(html.slice(i + 13, j).replace(/;\s*$/, ""));

    data.meta.frozenForecast = { date: "2026-08-11", declaredPhase: "12.1-ptr", projectionVersion: 13, gitSha: null };
    data.meta.phases = { ...data.meta.phases, ptr: null };   // post-flip: no PTR era exists

    const json = JSON.stringify(data).replace(/</g, "\u003c");
    const doctored = (html.slice(0, i) + "const DATA = " + json + ";" + html.slice(j))
      .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/, "");
    const fixture = path.join(dir, "frozen.html");
    await writeFile(fixture, doctored);

    await ensureBrowser();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", e => errors.push(String(e.message)));
    try {
      await page.goto("file://" + fixture);
      await page.waitForFunction(() => document.querySelectorAll(".row").length > 0, { timeout: 15000 });

      // the era toggle is gone and the view pinned live — the post-flip reality
      assert.equal(await page.evaluate(() => document.getElementById("eraseg")?.hidden ?? true), true,
        "post-flip there is no era toggle");

      // the forecast button is USABLE in the live view — the whole point of the lane —
      // and says it is a record, not a computation
      const pb = await page.evaluate(() => {
        const b = document.querySelector(".projbtn");
        return { disabled: b?.disabled, title: b?.title ?? "" };
      });
      assert.equal(pb.disabled, false, "the frozen forecast must be viewable in the live view");
      assert.match(pb.title, /FROZEN pre-launch/, "the button must say it is the frozen record");

      // select it: the column qualifier (.hqual — the anti-misattribution surface) must
      // date the freeze, so a screenshot cannot read the record as a live opinion
      await page.evaluate(() => { document.querySelector(".projbtn").click(); });
      await page.waitForTimeout(200);
      const qual = await page.evaluate(() =>
        [...document.querySelectorAll(".head .hqual")].map(e => e.textContent).join(" | "));
      assert.match(qual, /frozen 2026-08-11/, `the projection column must be dated as frozen, got: ${qual}`);

      // the movers strip — a projection surface — is visible in the live view under FROZEN_FC
      const movers = await page.evaluate(() => document.getElementById("movers")?.hidden ?? null);
      if (movers != null) assert.equal(movers, false, "the movers strip must render for the frozen record");

      // the ALWAYS-VISIBLE viewnote (the touch-legibility surface — title attributes do
      // not exist on a phone) must describe the record as a record, never as a live
      // computation. This was the review's finding #2: every other relabel landed, and
      // the one surface everyone can see still said "live consensus blended with…".
      const viewnote = await page.evaluate(() => document.getElementById("viewnote")?.textContent ?? "");
      assert.match(viewnote, /FROZEN pre-launch 12\.1 forecast/, "the visible caption must name the record");
      assert.doesNotMatch(viewnote, /live consensus blended/, "the visible caption must not describe a live computation");

      // a drawer shows the frozen provenance line
      await page.evaluate(() => document.querySelectorAll(".row.clickable")[0].click());
      await page.waitForTimeout(400);
      const drawer = await page.evaluate(() => document.querySelector(".row.open .projbreak")?.textContent ?? "");
      assert.match(drawer, /FROZEN pre-launch record, declared 2026-08-11/,
        "the drawer's forecast block must carry the declaration");

      assert.deepEqual(errors, [], `page errors: ${errors.join(" | ")}`);
    } finally { await page.close(); }
  } finally { await rm(dir, { recursive: true, force: true }); }
});

/* THE INVARIANT WHOSE ABSENCE LET THE FLIP HIDE LIVE CONTENT (2026-08-19 audit, A1/A2).
   The drawer's tuning lane and tier-set box were gated on the era VIEW (state.era !==
   "live"), which the flip pinned permanently false — so the launch notes, the live
   Aug-18 hotfix rounds and the S2 set bonuses rendered NOWHERE while the masthead
   promised "patch changes" on every row, and invariants 324/325 stayed green because
   hiding PTR surfaces in live view is exactly what they pin. This is the missing third
   assertion: between cycles, CURRENT-cycle content must be reachable in the live view. */
ui("between cycles, a post-launch hotfix and the tier set are reachable in the live drawer", async page => {
  const data = payload();
  // Only meaningful between cycles — during a PTR cycle the live view hides the lane by
  // design and the era toggle offers the way in (the mirror of the guard two tests down).
  if (data.meta.phases.ptr) return;
  const liveSince = data.meta.phases.liveSince ?? "";
  const target = data.specs.find(s =>
    (s.buildChanges ?? []).some(b => b.kind === "hotfix" && (!liveSince || b.date >= liveSince)) &&
    s.tierSet && s.ptr);
  assert.ok(target, "fixture must hold a spec with a post-launch hotfix entry, a tierSet and a writeup — if none exists the invariant is vacuous");

  const seen = await page.evaluate(([cls, spec]) => {
    const row = [...document.querySelectorAll(".row.clickable")].find(r =>
      r.querySelector(".spec-txt")?.textContent.trim() === spec &&
      r.querySelector(".cls")?.textContent.trim() === cls);
    if (!row) return null;
    row.click();
    const drawer = row.querySelector(".drawer");
    const txt = drawer?.textContent ?? "";
    return {
      hotfixBlock: /Live .* tuning/.test(txt) && txt.includes("hotfix"),
      shippedBlock: /Shipped in/.test(txt) || /Shipping in/.test(txt),
      tierSetBox: /tier set/i.test(txt),
      // A4 guard: the writeup lane must NOT have resurrected with the cycle lane — the
      // decided flip consequence is the baseline placeholder, not the PTR-era read.
      baselinePlaceholder: /baseline view/.test(txt),
    };
  }, [target.class, target.spec]);
  assert.ok(seen, "target row not found in the grid");
  assert.ok(seen.hotfixBlock, "the live hotfix block must render in the between-cycles live drawer");
  assert.ok(seen.shippedBlock, "the launch-notes block must render in the between-cycles live drawer");
  assert.ok(seen.tierSetBox, "the tier-set box must render in the between-cycles live drawer");
  assert.ok(seen.baselinePlaceholder, "the ptr writeup lane must stay retired (A4) — cycle content only");
});

/* Era-gating of the PTR-derived summary surfaces (audit 2026-08-14). The projection lane was
   already gated; the NEW badge and three parts of the "What changed" strip were not, so a
   12.0.7-only view still advertised next-patch activity it had otherwise hidden. Appended at
   the END of this file: the pre-staged flip patch carries hunks through ~:1080 and inserting
   near them breaks `git apply`. */
ui("a 12.0.7-only view hides every PTR-derived summary surface", async page => {
  /* Cycle-gated. Post-flip `phases.ptr` is null, the Era toggle is not rendered at all
     (template boot), and there is no PTR-derived content left to hide — so the control this
     test clicks does not exist and the whole premise is gone. Caught in the 08-15 flip
     simulation; same guard the pre-staged flip patch applies to every other era-dependent
     invariant in this file. */
  if (!payload().meta.phases.ptr) return;

  // Both-era baseline: at least one of these must actually be present, or the test proves
  // nothing about gating — it would pass on an empty page.
  const both = await page.evaluate(() => ({
    // Scoped OUT of .legend: that block carries a static NEW swatch explaining the badge,
    // which is legend chrome rather than a claim about any spec.
    badges: [...document.querySelectorAll(".newbadge")].filter(el => !el.closest(".legend")).length,
    summary: document.querySelector("#changes summary")?.textContent ?? "",
  }));
  const hasSomething = both.badges > 0
    || /Dummy Dome shifts|specs with fresh info|latest PTR build/.test(both.summary);
  assert.ok(hasSomething,
    "fixture has no PTR-derived surfaces in the both-era view — nothing to gate, test is vacuous");

  await page.evaluate(() => document.querySelector('#eraseg button[data-era="live"]').click());
  await page.waitForTimeout(200);

  const live = await page.evaluate(() => ({
    // Scoped OUT of .legend: that block carries a static NEW swatch explaining the badge,
    // which is legend chrome rather than a claim about any spec.
    badges: [...document.querySelectorAll(".newbadge")].filter(el => !el.closest(".legend")).length,
    summary: document.querySelector("#changes summary")?.textContent ?? "",
  }));
  assert.equal(live.badges, 0,
    "the NEW badge is fed by creator takes and the PTR build feed — it must not render in a 12.0.7-only view");
  assert.ok(!/Dummy Dome shifts/.test(live.summary),
    `"What changed" leaked Dummy Dome (zone-52 PTR data) into the live-only view: "${live.summary.trim()}"`);
  assert.ok(!/specs with fresh info/.test(live.summary),
    `"What changed" leaked PTR take/build freshness into the live-only view: "${live.summary.trim()}"`);
  assert.ok(!/latest PTR build/.test(live.summary),
    `"What changed" leaked the PTR build date into the live-only view: "${live.summary.trim()}"`);
});

/* The spark column header must state the window it actually shows. It was the literal
   "30d" while SPARK_POINTS is a point COUNT, so the two only agree at a daily cadence —
   at the real one the window is ~11 days, and the true span was reachable only through a
   per-row title=, on a column that renders at >=980px where touch cannot read it. */
test("the spark header states the real window, not a hard-coded duration", skipOpts, async () => {
  const { page } = await newPage();
  const head = (await page.textContent(".head .sparkcell"))?.trim() ?? "";
  await page.close();

  assert.notEqual(head, "30d", "the header must not be the old hard-coded literal");
  assert.match(head, /^(\d+d|Trend)$/, `header should be "<n>d" or "Trend", got "${head}"`);

  if (head === "Trend") return;   // no enriched history in this artifact — nothing to check
  const { history } = payload();
  const dates = history?.dates ?? [];
  const start = (history?.enriched ?? []).findIndex(Boolean);
  const n = Math.min(12, dates.length - start);
  const days = Math.round((Date.parse(dates.at(-1)) - Date.parse(dates[dates.length - n])) / 86400000);
  assert.equal(head, days + "d",
    `header "${head}" disagrees with the payload's own dates (${days}d over the last ${n} snapshots)`);
});
