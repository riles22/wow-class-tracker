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

  // a 12.0.7-only view has no forecast, so the strip must disappear
  await page.evaluate(() => document.querySelector('#eraseg button[data-era="live"]').click());
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => document.getElementById("movers").hidden), true,
    "the movers strip must be era-gated out of a 12.0.7-only view");
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
  assert.ok(target, "expected at least one change row to jump from");
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

    s.ptr = { verdict: "Mixed", theme: TEXT_BREAK, summary: ATTR_BREAK,
      changes: [TEXT_BREAK, ATTR_BREAK], set2: TEXT_BREAK, set4: ATTR_BREAK,
      watch: TEXT_BREAK, source: "https://www.wowhead.com/news/probe" };
    s.tierSet = { set2: TEXT_BREAK, set4: ATTR_BREAK, asOf: "2026-07-24", source: "https://www.wowhead.com/probe" };
    s.metrics = [...(s.metrics ?? []), { source: "warcraftlogs", bracket: "raid",
      name: `Median rDPS ${TEXT_BREAK}`, value: 1, unit: ATTR_BREAK, asOf: "2026-07-24" }];
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
          .filter(e => !/^(https:|#|$)/.test(e.getAttribute("href") ?? "")).length,
        markVisible: document.body.innerText.includes(mark),
      }), MARK);

      assert.equal(found.pwned, false, "an injected handler executed");
      assert.equal(found.injectedImgs, 0, "injected <img> reached the DOM");
      assert.equal(found.handlers, 0, "an inline on* handler reached the DOM");
      assert.equal(found.badHrefs, 0, "a non-https href reached the DOM");
      assert.equal(found.markVisible, true, "sanity: the probe must render as inert TEXT");
    } finally {
      await page.close();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
