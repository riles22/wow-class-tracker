import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build, applyEraText } from "../src/build.mjs";
import { buildPayload } from "../src/render.mjs";
import { loadData } from "../src/validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("build produces the tracker and fetchable launcher icons", async () => {
  const result = await build(ROOT);
  const html = await readFile(result.outPath, "utf8");

  assert.equal(result.specCount, 40);
  assert.ok(html.includes("Curse of Ula'tek"));
  assert.ok(!html.includes("__DATA_JSON__"), "placeholder must be replaced");
  // Spot-check that data made it in:
  for (const name of ["Outlaw", "Devourer", "Mistweaver", "Beast Mastery"]) {
    assert.ok(html.includes(name), `missing spec ${name}`);
  }
  // Script-injection safety: the payload must not contain a raw "<".
  const payloadLine = html.split("\n").find(l => l.includes("const DATA ="));
  assert.ok(payloadLine, "DATA constant missing");
  assert.ok(!payloadLine.slice(payloadLine.indexOf("=")).includes("</"), "payload must escape < characters");

  const icons = [
    { name: "favicon-192.png", rel: "icon", width: 192, height: 192 },
    { name: "apple-touch-icon.png", rel: "apple-touch-icon", width: 180, height: 180 },
  ];
  for (const icon of icons) {
    const href = `/wow-class-tracker/${icon.name}`;
    const link = `<link rel="${icon.rel}" type="image/png" sizes="${icon.width}x${icon.height}" href="${href}">`;
    assert.ok(html.includes(link), `missing exact ${icon.name} link`);
    const liveUrl = new URL(href, "https://riles22.github.io/wow-class-tracker/index.html");
    assert.equal(liveUrl.pathname, href, `${icon.name} must use the Pages project path explicitly`);

    const source = await readFile(path.join(ROOT, "src", "assets", icon.name));
    const built = await readFile(path.join(ROOT, "dist", icon.name));
    assert.deepEqual(built, source, `${icon.name} must be copied byte-for-byte`);
    assert.deepEqual([...built.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${icon.name} must be a PNG`);
    assert.equal(built.readUInt32BE(16), icon.width, `${icon.name} width mismatch`);
    assert.equal(built.readUInt32BE(20), icon.height, `${icon.name} height mismatch`);
  }

  const csp = /<meta[^>]+Content-Security-Policy[^>]+content="([^"]*)"/i.exec(html)?.[1] ?? "";
  assert.match(csp, /(?:^|;)\s*default-src 'none'\s*(?:;|$)/, "CSP must retain default-src 'none'");
  assert.match(csp, /(?:^|;)\s*img-src 'self' data:\s*(?:;|$)/, "CSP must allow only same-origin and inline icons");
});

test("era prose follows PHASES, including when the PTR goes away (2026-08-08)", () => {
  /* The template hardcoded 36 "12.1 PTR" and 30 "12.0.7" literals, so on the day 12.1 shipped
     the masthead and footer would have told every visitor it was still on the PTR while the
     Era toggle beside them said otherwise. The hard part is not the labels: PHASES.ptr goes
     NULL at launch, so several strings need a different SHAPE — an arrow with nothing on its
     right, advice to switch to an era whose toggle has been hidden. */
  const tpl = "[__ERA_PATCH_CHIP__][__ERA_LIVE_LABEL__ / __ERA_LIVE_SEASON__][__ERA_BUILD_FEED_HEAD__][__ERA_COVERAGE_LINE__][__ERA_ERA_SWITCH_HINT__]";
  const ptrNow = applyEraText(tpl, { liveSeason: "s1", liveLabel: "12.0.7", ptr: { marker: "12.1 PTR", label: "12.1 PTR" } });
  assert.match(ptrNow, /12\.1 PTR — CURSE OF ULA'TEK/);
  assert.match(ptrNow, /12\.0\.7 \/ Season 1/);
  assert.match(ptrNow, /→ 12\.1 PTR/, "while a PTR exists the coverage line points at it");
  assert.match(ptrNow, /switch Era to Both or 12\.1 PTR/);

  const launched = applyEraText(tpl, { liveSeason: "s1", liveLabel: "12.1", ptr: null });
  assert.doesNotMatch(launched, /PTR/, "with no PTR phase the word must not appear anywhere");
  assert.doesNotMatch(launched, /→/, "the coverage arrow has nothing on its right and must collapse");
  assert.match(launched, /12\.1 patch notes/, "the build feed becomes the patch notes");

  const s2 = applyEraText(tpl, { liveSeason: "s2", liveLabel: "12.1", ptr: null });
  assert.match(s2, /12\.1 \/ Season 2/, "the season moves independently of the label");

  // The 12.2 cycle must need no code change — only a PHASES edit.
  const next = applyEraText(tpl, { liveSeason: "s2", liveLabel: "12.1", ptr: { marker: "12.2 PTR", label: "12.2 PTR" } });
  assert.match(next, /12\.2 PTR build feed/);
  assert.match(next, /12\.1 \/ Season 2 → 12\.2 PTR/);

  // A typo'd placeholder must fail the BUILD, not ship as literal text on the page.
  assert.throws(() => applyEraText("__ERA_NOPE__", { liveLabel: "12.1", ptr: null }), /unknown era placeholders/);
});

test("every PTR metric-name key resolves against real data (2026-08-08)", async () => {
  /* These strings are LOOKUP KEYS, not labels: a mismatch against data/specs.json renders an
     empty series with no error, no empty state, nothing. The template used to hand-type its own
     second copy of all eight, so the contract lived in two files nothing compared — renaming a
     metric, or flipping PHASES.ptr at launch, would update one and quietly break the other.
     They are derived in one place now (PTR_METRIC_NAMES) and shipped as meta.ptrMetricNames;
     this test is what makes the drift loud instead of silent. */
  const data = await loadData(ROOT);
  const payload = buildPayload(data);
  const names = payload.meta.ptrMetricNames;
  assert.ok(names, "meta.ptrMetricNames must ship while a PTR phase exists");

  const known = new Set();
  for (const spec of data.specs) for (const m of spec.metrics ?? []) known.add(m.name);

  // Every non-null key must name a series that actually exists in the data.
  const unresolved = [];
  for (const [series, byRole] of Object.entries(names)) {
    for (const [role, name] of Object.entries(byRole)) {
      if (name == null) continue;
      if (!known.has(name)) unresolved.push(`${series}.${role} → ${JSON.stringify(name)}`);
    }
  }
  assert.deepEqual(unresolved, [], "PTR series keys that match no metric in data/specs.json");

  // And they must carry the current phase's marker — the launch flip has to move them.
  const marker = payload.meta.phases?.ptr?.marker;
  if (marker) {
    for (const byRole of Object.values(names)) {
      for (const name of Object.values(byRole)) {
        if (name != null) assert.ok(name.includes(marker), `${name} does not carry the phase marker ${marker}`);
      }
    }
  }
});

test("payload decorates every spec with consensus for both brackets", async () => {
  const data = await loadData(ROOT);
  const payload = buildPayload(data);
  assert.equal(payload.specs.length, data.specs.length);
  for (const spec of payload.specs) {
    assert.ok("raid" in spec.consensus && "mplus" in spec.consensus, `${spec.spec}: consensus missing`);
    // Rated brackets produce a consensus object; fully unrated ones produce null.
    const rated = Object.values(spec.ratings?.raid ?? {}).some(t => t != null);
    assert.equal(spec.consensus.raid !== null, rated, `${spec.class} ${spec.spec} raid consensus mismatch`);
  }
  assert.equal(payload.meta.specCount, 40);
  assert.equal(payload.meta.trackedCount, data.specs.filter(s => s.ptr).length);
  assert.ok(payload.meta.latestSnapshot >= "2026-06-15");
  assert.ok(Number.isInteger(payload.meta.projectionVersion) && payload.meta.projectionVersion >= 1);
});
