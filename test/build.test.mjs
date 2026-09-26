import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "../src/build.mjs";
import { buildPayload } from "../src/render.mjs";
import { loadData } from "../src/validate.mjs";
import { leaderboardPartitions } from "../src/wcl-live.mjs";

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
  const published = JSON.parse(payloadLine.match(/const DATA = (.*);$/)[1]);
  assert.ok(Array.isArray(published.creatorCredits), "publication must carry credits from the complete archive");
  assert.ok(published.creatorTakes.takes.every(t => !t.superseded) && published.creatorTakes.metaNotes.every(n => !n.superseded),
    "HTML serialization must use the compact publication payload");
  // The drawer's partition names come from the reviewed recipe, not from the template.
  assert.deepEqual(published.meta.wclPartitions, leaderboardPartitions());

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

  /* Era tokens (2026-08-11): the masthead/footer era prose is substituted at build time
     from PHASES, so the launch-day label flip and the season flip need no template edits.
     Expectations are COMPUTED from PHASES rather than written as literals, so this test
     follows every flip instead of going stale — what it pins is the WIRING: each token
     replaced (build throws on a missing one), none left unsubstituted, and the era the
     page announces always matching the era vocabulary that governs the data. */
  const { PHASES } = await import("../src/normalize.mjs");
  const seasonName = s => `Season ${PHASES.seasonOrder.indexOf(s) + 1}`;
  const eraDisplay = PHASES.ptr ? PHASES.ptr.label : (PHASES.livePatch?.label ?? PHASES.liveLabel);
  // the chip carries a full and a short form since the 2026-08-22 bar compression
  assert.ok(html.includes(`<span class="pc-full">${eraDisplay} — ${PHASES.patchName.toUpperCase()}</span>`),
    "masthead chip must carry the PHASES-derived era");
  assert.ok(html.includes(`<span class="pc-short">${eraDisplay}</span>`),
    "…and its phone form must carry the era too, so attribution survives a mobile screenshot");
  assert.ok(html.includes(`${PHASES.liveLabel} / ${seasonName(PHASES.liveSeason)}`), "baseline line must carry liveLabel + season");
  /* The feed heading: an open PTR cycle's build feed carries its patch label; between
     cycles it is named for the SEASON (2026-09-25), because the list is the season's feed
     and 12.1.5's entries join 12.1's in it after launch. This expectation changed with that
     decision. */
  const feedHeading = PHASES.ptr ? `${eraDisplay} build feed` : `${seasonName(PHASES.liveSeason)} patch feed`;
  assert.ok(html.includes(`>${feedHeading}<`), `patch-feed heading must read "${feedHeading}"`);
  assert.ok(!/__ERA_[A-Z_]+__/.test(html), "no era token may survive substitution");
});

test("a mid-season livePatch moves the chip, its phone form and the Live: stamp, nothing else", async () => {
  /* PHASES.livePatch is dormant (null) until 12.1.5 ships; this is the launch state, built
     now so the launch edit is a known quantity. `since` is a FIXTURE date, not a release
     date: the build never reads it.
     Both sides are fixtures with ptr AND livePatch forced, never the real PHASES as-is.
     Built from the real object, "dormant" and "launched" become the same thing once the
     launch commit sets livePatch (nothing would move, 2026-09-25 review), and a later PTR
     cycle's ptr would outrank the fixture. Forced, this proves the same thing before the
     launch commit, after it and during a PTR cycle, so this test needs no edit at launch
     (the launch commit's deliberate edits are listed beside livePatch in CLAUDE.md). */
  const { PHASES } = await import("../src/normalize.mjs");
  const { eraTokensFor } = await import("../src/build.mjs");
  const livePatch = { label: "12.1.5", since: "2026-12-01" };
  const between = { ...PHASES, ptr: null, livePatch: null };
  const dormant = eraTokensFor(between);
  const launched = eraTokensFor({ ...between, livePatch });

  assert.equal(launched.__ERA_CHIP__, `12.1.5 — ${PHASES.patchName.toUpperCase()}`);
  assert.equal(launched.__ERA_SHORT__, "12.1.5");
  assert.equal(launched.__ERA_TRACKED_STAMP__, `<b>Live:</b> 12.1.5 “${PHASES.patchName}”`);
  // The baseline names the consensus SEASON, which a mid-season patch does not restart.
  assert.equal(launched.__ERA_BASELINE__, `${PHASES.liveLabel} / Season ${PHASES.seasonOrder.indexOf(PHASES.liveSeason) + 1}`);
  assert.ok(!launched.__ERA_BASELINE__.includes(livePatch.label), "the baseline must stay on liveLabel");
  const moved = Object.keys(launched).filter(k => launched[k] !== dormant[k]).sort();
  assert.deepEqual(moved, ["__ERA_CHIP__", "__ERA_SHORT__", "__ERA_TRACKED_STAMP__"],
    "only the three patch-naming tokens may read livePatch");
  // An open PTR cycle still outranks it, exactly as before livePatch existed.
  const ptr = { marker: "12.2 PTR", label: "12.2 PTR" };
  assert.deepEqual(eraTokensFor({ ...between, ptr, livePatch }), eraTokensFor({ ...between, ptr }));

  /* The whole page. Build into a temp root, never the shared dist/, twice: with the REAL
     PHASES.livePatch forced to null, then set to the fixture (the launch edit's exact
     effect: the payload builder sees it too). PHASES.ptr stays as it really is, so the
     expected swaps come from the real ptr state: the three tokens between cycles, none at
     all while a PTR cycle is open (it outranks livePatch, so the page must not move). With
     those swapped back, the page must be byte-identical to the dormant build: same
     payload, so the same column qualifiers, drawer headings and frozen-forecast qualifier
     ("12.1 forecast — frozen <date>", computed client-side from the payload), and the same
     CSP hashes. */
  const pageDormant = eraTokensFor({ ...PHASES, livePatch: null });
  const pageLaunched = eraTokensFor({ ...PHASES, livePatch });
  const pageMoved = Object.keys(pageLaunched).filter(k => pageLaunched[k] !== pageDormant[k]).sort();
  assert.deepEqual(pageMoved, PHASES.ptr ? [] : moved);
  const markup = {
    __ERA_CHIP__: v => `<span class="pc-full">${v}</span>`,
    __ERA_SHORT__: v => `<span class="pc-short">${v}</span>`,
    __ERA_TRACKED_STAMP__: v => `<span>${v}</span>`,
  };
  const { mkdtemp, cp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const root = await mkdtemp(path.join(tmpdir(), "tracker-livepatch-"));
  const saved = PHASES.livePatch;
  try {
    await cp(path.join(ROOT, "data"), path.join(root, "data"), { recursive: true });
    await cp(path.join(ROOT, "src"), path.join(root, "src"), { recursive: true });
    PHASES.livePatch = null;
    const before = await readFile((await build(root)).outPath, "utf8");
    PHASES.livePatch = livePatch;
    const after = await readFile((await build(root)).outPath, "utf8");
    PHASES.livePatch = saved;

    const swaps = pageMoved.map(k => [markup[k](pageLaunched[k]), markup[k](pageDormant[k])]);
    let restored = after;
    for (const [from, to] of swaps) {
      assert.equal(after.split(from).length - 1, 1, `the launched page must carry ${from} exactly once`);
      restored = restored.replace(from, to);
    }
    if (restored !== before) {
      let i = 0;
      while (i < before.length && restored[i] === before[i]) i++;
      assert.fail(`with livePatch set, nothing but the three patch-naming surfaces may change; first difference at ` +
        `${i}: ${JSON.stringify(before.slice(Math.max(0, i - 80), i + 80))} vs ${JSON.stringify(restored.slice(Math.max(0, i - 80), i + 80))}`);
    }
    const payloadOf = h => JSON.parse(h.split("\n").find(l => l.includes("const DATA =")).match(/const DATA = (.*);$/)[1]);
    const published = payloadOf(after);
    assert.ok(!("livePatch" in published.meta.phases), "livePatch is display-only and never ships to the page");
    assert.equal(published.meta.phases.liveLabel, PHASES.liveLabel);
    // Spelled out for the frozen-forecast qualifier: its inputs are the payload's frozen
    // date and a template literal, and both are what the dormant page carries.
    assert.deepEqual(published.meta.frozenForecast, payloadOf(before).meta.frozenForecast);
    if (published.meta.frozenForecast) {
      assert.ok(after.includes("`12.1 forecast — frozen ${FROZEN_FC.date}`"), "the frozen qualifier's expression must be unchanged");
    }
  } finally {
    PHASES.livePatch = saved;
    await rm(root, { recursive: true, force: true });
  }
});

test("the build feed's live-patch ceiling is the patch the Live: stamp names", async () => {
  /* validate.mjs bounds live feed entries by normalize.mjs displayedLivePatch; the page
     says which patch is live in build.mjs's "Live:" stamp. They are separate code, so this
     holds them in step in every state the stamp reads "Live:" — between cycles, with a
     mid-season livePatch, and a cycle whose label dropped " PTR" at launch (24532b5 ran
     label "12.1" beside liveLabel "12.0.7" for seven days). While the label carries " PTR"
     the stamp reads "PTR:" and the live patch stays livePatch, else liveLabel. */
  const { PHASES, displayedLivePatch } = await import("../src/normalize.mjs");
  const { eraTokensFor } = await import("../src/build.mjs");
  const livePatch = { label: "12.1.5", since: "2026-12-01" };
  const states = [
    { ...PHASES, ptr: null, livePatch: null },
    { ...PHASES, ptr: null, livePatch },
    { ...PHASES, ptr: { marker: "12.2 PTR", label: "12.2" }, livePatch: null },
    { ...PHASES, ptr: { marker: "12.2 PTR", label: "12.2" }, livePatch },
  ];
  for (const s of states) {
    const stamp = /^<b>Live:<\/b> (\S+) /.exec(eraTokensFor(s).__ERA_TRACKED_STAMP__);
    assert.ok(stamp, `the stamp reads "Live:" in ${JSON.stringify({ ptr: s.ptr, livePatch: s.livePatch })}`);
    assert.equal(displayedLivePatch(s), stamp[1]);
  }
  for (const p of [null, livePatch]) {
    const open = { ...PHASES, ptr: { marker: "12.2 PTR", label: "12.2 PTR" }, livePatch: p };
    assert.match(eraTokensFor(open).__ERA_TRACKED_STAMP__, /^<b>PTR:<\/b> 12\.2 /);
    assert.equal(displayedLivePatch(open), p?.label ?? PHASES.liveLabel);
  }
});

test("the gearing page's chip names the same live patch as the tracker", async () => {
  /* The two pages' bars mirror each other BY HAND (CLAUDE.md, "Gearing carries the same
     bar"), and gearing's chip is a literal in its own template, so setting PHASES.livePatch
     does not move it. Without this, the launch commit would leave the two site tabs naming
     different patches (2026-09-25 review). Compared with the LIVE patch (livePatch, else
     liveLabel), not with the tracker's chip, because an open PTR cycle takes the tracker's
     chip over while gearing stays about the live season's gear. The launch commit that sets
     livePatch edits gearing's chip too and runs `npm run gearing:build`, or reds here. */
  const { PHASES } = await import("../src/normalize.mjs");
  const tpl = await readFile(path.join(ROOT, "gearing", "src", "app.template.html"), "utf8");
  const chip = /<span class="patchchip"><span class="pc-full">([^<]*)<\/span><span class="pc-short">([^<]*)<\/span><\/span>/.exec(tpl);
  assert.ok(chip, "gearing's patch chip markup must be findable");
  const live = PHASES.livePatch?.label ?? PHASES.liveLabel;
  assert.equal(chip[2], live, "gearing's phone chip must name the live patch");
  assert.equal(chip[1].replaceAll("&mdash;", "—"), `${live} — ${PHASES.patchName.toUpperCase()}`,
    "gearing's full chip must name the live patch and the patch name");
});

test("the frozen forecast artifact loads, and a phase-MATCHED artifact is INERT", async () => {
  /* The inertness guarantee, stated so it holds at EVERY phase — the first version of this
     test asserted the ON-DISK artifact is inert, which is only true before the flip: the
     moment SNAPSHOT_PHASE moves, that assertion becomes 08-18's first red test (the review
     measured 31 flip-state failures, and this was the only one B6 itself added). What the
     lane actually guarantees is conditional: an artifact whose phase IS the running phase
     changes nothing. Synthesize that state instead of borrowing it from the calendar. */
  const { SNAPSHOT_PHASE } = await import("../src/render.mjs");
  const data = await loadData(ROOT);
  assert.ok(data.frozenForecast, "the 2026-08-11 artifact should load (data/forecasts/)");
  assert.equal(data.frozenForecast.kind, "frozen-forecast");

  const matched = { ...data.frozenForecast, phase: SNAPSHOT_PHASE };   // "pre-flip", whatever today is
  const withArtifact = buildPayload({ ...data, frozenForecast: matched });
  const without = buildPayload({ ...data, frozenForecast: null });
  assert.equal(withArtifact.meta.frozenForecast, null, "a phase-matched artifact must send no frozen-mode signal to the page");
  assert.equal(JSON.stringify(withArtifact.specs), JSON.stringify(without.specs),
    "a phase-matched artifact must not alter a single spec");

  /* And the activation side, same synthesis: a phase-MISMATCHED artifact (with no PTR
     cycle open) substitutes every covered cell. Guarded on PHASES.ptr because activation
     requires no open cycle — pre-flip (ptr non-null) this leg would be vacuously inert. */
  const { PHASES } = await import("../src/normalize.mjs");
  if (!PHASES.ptr) {
    const moved = { ...data.frozenForecast, phase: `${SNAPSHOT_PHASE}-ended` };
    const active = buildPayload({ ...data, frozenForecast: moved });
    assert.ok(active.meta.frozenForecast, "a phase-mismatched artifact must activate the frozen lane");
    const covered = active.specs.find(s => moved.cells[`${s.class}|${s.spec}`]?.raid);
    assert.match(covered.projection.raid.basis, /^Frozen pre-launch forecast/);
  }
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
  /* Between cycles (PHASES.ptr null — post-flip, pre-12.2-thread) there is no marker to
     derive keys from, and the honest payload value is null: the page has no PTR series
     to look up, and shipping stale keys would be the exact drift this test exists to
     catch. The resolution walk below reactivates by itself when the next cycle opens. */
  const { PHASES } = await import("../src/normalize.mjs");
  if (!PHASES.ptr) {
    assert.equal(names, null, "no PTR phase → meta.ptrMetricNames must be null, not stale keys");
    return;
  }
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

test("meta.latestBuildRealm is the newest feed entry's resolved realm (recorded, else the kind default)", async () => {
  const data = await loadData(ROOT);
  const meta = newest => buildPayload({ ...data, ptrBuilds: { ...data.ptrBuilds, builds: [newest, ...data.ptrBuilds.builds] } }).meta;
  const at = { date: "2099-01-01", label: "x", specsAffected: [], highlights: [] };
  // recorded realm wins over the kind default, both directions
  const pair = m => [m.latestBuildKind, m.latestBuildRealm];
  assert.deepEqual(pair(meta({ ...at, kind: "build", realm: "live" })), ["build", "live"]);
  assert.deepEqual(pair(meta({ ...at, kind: "hotfix", realm: "ptr" })), ["hotfix", "ptr"]);
  // no realm: the kind default (build → ptr, hotfix → live)
  assert.equal(meta({ ...at, kind: "build" }).latestBuildRealm, "ptr");
  assert.equal(meta({ ...at, kind: "hotfix" }).latestBuildRealm, "live");
  assert.equal(buildPayload({ ...data, ptrBuilds: { ...data.ptrBuilds, builds: [] } }).meta.latestBuildRealm, null);
});
