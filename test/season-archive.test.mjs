import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, mkdir, rm, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { freezeSeasonArchive } from "../src/freeze-season-archive.mjs";
import { renderSeasonArchive } from "../src/render-season-archive.mjs";
import { loadData } from "../src/validate.mjs";
import { decorateSpecs } from "../src/render.mjs";
import { PHASES } from "../src/normalize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* A minimal, self-contained archive record for renderer tests — including a HOSTILE
   spec name, because the renderer must never be the one place that trusts its input. */
const MARK = "ZZARCHPROBE";
const hostileArchive = () => ({
  kind: "season-archive",
  season: "s1",
  seasonName: "Season 1",
  label: "12.0.7",
  frozenAt: "2026-08-18",
  gitSha: "0123456789abcdef0123456789abcdef01234567",
  consensusVersion: 3,
  bands: [{ tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "C", min: 0 }],
  spreadThreshold: 22,
  sources: [
    { id: "alpha", name: `Alpha <img src=x onerror="window.__pwned=1">${MARK}`,
      raid: { lane: "live", snapshot: "2026-08-10" }, mplus: { lane: "frozen", frozenAt: "2026-08-09", fromCommit: "deadbeefcafe", snapshot: "2026-08-08" } },
    { id: "beta", name: "Beta", raid: { lane: "excluded", snapshot: null }, mplus: { lane: "live", snapshot: "2026-08-10" } },
  ],
  brackets: {
    raid: [
      { class: "Rogue", spec: `Outlaw <script>bad()</script>${MARK}`, role: "DPS", tier: "S", score: 91, spread: 8, diverges: false,
        perSource: [{ source: "alpha", label: "Alpha", tier: "S" }] },
      { class: "Mage", spec: "Frost", role: "DPS", tier: null, score: null, spread: null, diverges: false, perSource: [] },
    ],
    mplus: [
      { class: "Rogue", spec: "Outlaw", role: "DPS", tier: "A", score: 60, spread: 30, diverges: true,
        perSource: [{ source: "alpha", label: "Alpha", tier: "A", lane: "frozen", frozenAsOf: "2026-08-09" }, { source: "beta", label: "Beta", tier: "A" }] },
    ],
  },
});

test("renderer escapes hostile data, ships zero script, and keeps hrefs on the allowlist", async () => {
  const html = await renderSeasonArchive(hostileArchive(), { root: ROOT });

  // The probe text must survive as inert text while its markup dies.
  assert.ok(html.includes(MARK), "sanity: the probe fields must actually render");
  assert.ok(!/<img\s/i.test(html), "an injected <img> reached the archive page");
  assert.ok(!/<script[\s>]/i.test(html), "a <script> reached the script-free archive page");
  // Escaped probe text may legally CONTAIN "onerror=" as inert text — the finding is an
  // on* attribute in TAG position, which [^>]+ cannot reach across a closed tag.
  assert.ok(!/<[^>]+onerror/i.test(html), "an inline handler reached tag position unescaped");

  // CSP: no script-src at all — default-src 'none' refuses script outright.
  assert.match(html, /Content-Security-Policy[^>]*default-src 'none'/);
  assert.ok(!html.includes("script-src"), "the archive CSP should not need a script-src");

  // Every href is https, a fragment, or one of the published pages.
  const hrefs = [...html.matchAll(/href=(?:"([^"]*)"|'([^']*)')/g)].map(m => m[1] ?? m[2]);
  assert.ok(hrefs.length > 5, "sanity: the page must carry its chrome links");
  for (const href of hrefs) {
    assert.match(href, /^(?:https:|#|data:image\/|\/wow-class-tracker\/|(?:index|gearing|s1)\.html$)/,
      `unsanctioned href on the archive page: ${href}`);
  }

  // Frozen provenance is disclosed on the page, not just stored in the record.
  assert.ok(html.includes("frozen 2026-08-09"), "a frozen source's column must disclose its freeze date");
  assert.ok(html.includes("excluded from the final mean"), "an excluded source must be disclosed in provenance");
  assert.ok(html.includes("This is a frozen record"), "the archive banner must render");
});

test("renderer refuses a wrong-shape record instead of rendering a half-page", async () => {
  await assert.rejects(() => renderSeasonArchive({ kind: "nope" }, { root: ROOT }), /kind mismatch/);
  const noBrackets = { ...hostileArchive(), brackets: null };
  await assert.rejects(() => renderSeasonArchive(noBrackets, { root: ROOT }), /missing "brackets"/);
});

test("freeze derives exactly what the live page publishes, and refuses to overwrite", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "s1-archive-"));
  try {
    const out = path.join(dir, "s1.json");
    const { archive } = await freezeSeasonArchive(ROOT, { out, today: "2026-08-12" });

    assert.equal(archive.kind, "season-archive");
    assert.equal(archive.season, PHASES.liveSeason);
    assert.match(archive.gitSha, /^[0-9a-f]{40}$/);

    // Full roster in both brackets, sorted by score with unrated rows at the tail.
    for (const bracket of ["raid", "mplus"]) {
      const rows = archive.brackets[bracket];
      assert.equal(rows.length, 40, `${bracket} must carry the full 40-spec roster`);
      const scores = rows.map(r => r.score ?? -1);
      assert.deepEqual(scores, [...scores].sort((a, b) => b - a), `${bracket} rows must be score-sorted`);
    }

    // The archive's letters are the SAME consensus the built page renders — including
    // the frozen lane. Re-derive independently and compare every cell.
    const data = await loadData(ROOT);
    const decorated = decorateSpecs(data.specs, data.sources, data.scales, data.seasonFinal);
    const byKey = new Map(decorated.map(s => [`${s.class}|${s.spec}`, s]));
    for (const bracket of ["raid", "mplus"]) {
      for (const row of archive.brackets[bracket]) {
        const live = byKey.get(`${row.class}|${row.spec}`)?.consensus?.[bracket] ?? null;
        assert.equal(row.tier, live?.tier ?? null, `${row.class}|${row.spec} ${bracket}: archive letter diverges from the live consensus`);
        assert.equal(row.score, live?.score ?? null, `${row.class}|${row.spec} ${bracket}: archive score diverges from the live consensus`);
      }
    }

    // Provenance covers every live-era tier list, with a valid lane per bracket.
    const liveTierLists = data.sources.filter(s => s.kind === "tier-list" && (s.era ?? "live") === "live");
    assert.equal(archive.sources.length, liveTierLists.length);
    for (const s of archive.sources) {
      for (const bracket of ["raid", "mplus"]) {
        assert.ok(["live", "frozen", "excluded"].includes(s[bracket].lane), `${s.id}/${bracket}: bad lane "${s[bracket].lane}"`);
      }
    }

    // Append-only: a second run against the same path refuses.
    await assert.rejects(() => freezeSeasonArchive(ROOT, { out, today: "2026-08-12" }), /already exists/);

    // The record renders — the full end-to-end lane the build will take. Assert the
    // archive's OWN season name, not a literal: this test must pass on both sides of
    // a season flip (the freeze honestly derives whatever season the tree describes).
    const html = await renderSeasonArchive(archive, { root: ROOT });
    assert.ok(html.includes(archive.seasonName), "rendered archive must name its season");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("freeze refuses a season the tree does not currently describe", async () => {
  await assert.rejects(
    () => freezeSeasonArchive(ROOT, { out: path.join(tmpdir(), "never-written.json"), season: "s99" }),
    /not the tree's current liveSeason/);
});

test("build wiring: an archive record emits its page and the footer link together", async () => {
  // Same temp-root pattern as the injection invariant: a full real build against a copy
  // of the repo, plus a synthetic archive record — never the shared dist/, which other
  // test files write concurrently.
  const root = await mkdtemp(path.join(tmpdir(), "s1-build-"));
  try {
    await cp(path.join(ROOT, "data"), path.join(root, "data"), { recursive: true });
    await cp(path.join(ROOT, "src"), path.join(root, "src"), { recursive: true });
    await mkdir(path.join(root, "data", "season-archive"), { recursive: true });
    await writeFile(path.join(root, "data", "season-archive", "s1.json"),
      JSON.stringify(hostileArchive(), null, 2) + "\n");

    const { build } = await import("../src/build.mjs");
    await build(root);

    const index = await readFile(path.join(root, "dist", "index.html"), "utf8");
    assert.ok(!index.includes("__ARCHIVE_LINKS__"), "the archive-links token must never survive into dist/");
    assert.ok(index.includes('href="s1.html"'), "the footer must link the archived season");
    assert.ok(index.includes("frozen records"), "the footer link must disclose the archive is frozen");

    const page = await readFile(path.join(root, "dist", "s1.html"), "utf8");
    assert.ok(page.includes("Season 1"), "dist/s1.html must render the archived season");
    assert.ok(!/<script[\s>]/i.test(page), "the emitted archive page must stay script-free");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
