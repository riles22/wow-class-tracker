import { test } from "node:test";
import assert from "node:assert/strict";
import { extractDateModified, extractLastUpdated, resolvePage, evidenceTargets } from "../src/fetch-published.mjs";
import { checkPublished, checkFreshness } from "../src/check-refresh.mjs";

/* The page date formats the deterministic step reads, as fixtures. Both parsers are the
   frozen deterministic forms of what the refresh-tiers recipe reads by hand; the gate's
   whole value is that these cannot "remember" a stale value. */

const ldPage = (date, extra = "") => `<html><head>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","datePublished":"2026-07-01T09:00:00+00:00","dateModified":"${date}T14:02:11+00:00"}</script>
${extra}</head><body>content</body></html>`;

test("extractDateModified: reads JSON-LD, nested @graph, and takes the newest of several", () => {
  assert.equal(extractDateModified(ldPage("2026-08-02")), "2026-08-02");
  const graph = `<script type="application/ld+json">{"@graph":[{"@type":"BreadcrumbList"},{"@type":"Article","dateModified":"2026-08-02"}]}</script>`;
  assert.equal(extractDateModified(`<head>${graph}</head>`), "2026-08-02");
  // Several blocks: the newest is what "the page says it was last modified".
  const two = ldPage("2026-07-26", `<script type="application/ld+json">{"dateModified":"2026-08-02"}</script>`);
  assert.equal(extractDateModified(two), "2026-08-02");
  // Malformed JSON is skipped, never fatal; a page with none returns null.
  assert.equal(extractDateModified(`<script type="application/ld+json">{broken</script>`), null);
  assert.equal(extractDateModified("<html>no ld+json at all</html>"), null);
});

test("extractLastUpdated: the Icy Veins body idiom, with year inference that cannot land in the future", () => {
  // The real incident string, read two days later.
  assert.equal(extractLastUpdated("Last UPDATED - 2nd of August.", "2026-08-04"), "2026-08-02");
  // Ordinals and separators vary; case does not matter.
  assert.equal(extractLastUpdated("last updated: 21st of July", "2026-08-04"), "2026-07-21");
  assert.equal(extractLastUpdated("Last Updated on 3rd of March", "2026-08-04"), "2026-03-03");
  // Year-wrap: "31st of December" read in early January is LAST year's December.
  assert.equal(extractLastUpdated("Last UPDATED - 31st of December.", "2026-01-02"), "2025-12-31");
  // An explicit year is honored verbatim.
  assert.equal(extractLastUpdated("Last UPDATED - 2nd of August, 2025", "2026-08-04"), "2025-08-02");
  // No match, or an impossible month, is null — never a guess.
  assert.equal(extractLastUpdated("no date line here", "2026-08-04"), null);
  assert.equal(extractLastUpdated("Last UPDATED - 5th of Smarch.", "2026-08-04"), null);
});

test("Method's publisher date resolves from its Last Updated body line without 'of'", () => {
  // Exact public page lines verified 2026-09-15; collection day must not replace them.
  for (const [day, expected] of [[10, "2026-08-10"], [13, "2026-08-13"]]) {
    const html = `<p class="last-updated">Last Updated ${day}th August 2026</p>`;
    assert.equal(extractLastUpdated(html, "2026-09-15"), expected);
    assert.deepEqual(resolvePage(html, "2026-09-15"), {
      dateModified: null, lastUpdated: expected, resolved: expected
    });
  }
  assert.equal(extractLastUpdated("Last Updated 31st December", "2026-01-02"), "2025-12-31");
  const disagreement = resolvePage(ldPage("2026-08-14") + "Last Updated 13th August 2026", "2026-09-15");
  assert.equal(disagreement.resolved, "2026-08-14", "JSON-LD retains its established precedence");
  assert.match(disagreement.note, /disagree/);
});

test("resolvePage: dateModified wins, disagreement is stated, nothing found is an honest null", () => {
  const agree = resolvePage(ldPage("2026-08-02") + "Last UPDATED - 2nd of August.", "2026-08-04");
  assert.equal(agree.resolved, "2026-08-02");
  assert.equal(agree.note, undefined, "agreement carries no note");
  const disagree = resolvePage(ldPage("2026-08-02") + "Last UPDATED - 26th of July.", "2026-08-04");
  assert.equal(disagree.resolved, "2026-08-02", "JSON-LD precedence, matching the refresh-tiers recipe");
  assert.match(disagree.note, /disagree/);
  const nothing = resolvePage("<html>a page with neither idiom</html>", "2026-08-04");
  assert.equal(nothing.resolved, null);
  assert.match(nothing.note, /layout may have changed/);
});

test("evidenceTargets: published-gated requirements resolve to fetchable pages; config problems are returned, not thrown", () => {
  const config = { requirements: [
    { key: "ok", published: { maxAgeDays: 9 }, date: { type: "pages", sourceId: "src" } },
    { key: "ungated", date: { type: "pages", sourceId: "src" } },
    { key: "bad-probe", published: { maxAgeDays: 9 }, date: { type: "metrics", source: "x" } },
    { key: "no-url", published: { maxAgeDays: 9 }, date: { type: "pages", sourceId: "bare" } }
  ] };
  const sources = [
    { id: "src", pages: [{ bracket: "mplus", role: "DPS", url: "https://example.com/a" },
                         { bracket: "mplus", role: "Healer", url: "https://example.com/b" }] },
    { id: "bare", pages: [{ bracket: "mplus" }] }
  ];
  const { targets, problems } = evidenceTargets(config, sources);
  assert.deepEqual(targets.map(t => t.url), ["https://example.com/a", "https://example.com/b"]);
  assert.equal(targets[0].key, "ok");
  assert.equal(problems.length, 2);
  assert.match(problems[0], /bad-probe/);
  assert.match(problems[1], /no url/);
});

test("the repo's real contract yields exactly the published-gated pages as evidence targets", async () => {
  // Pins the real contract's evidence-target set so a published block appearing or
  // vanishing is always a deliberate, reviewed change. icyveins-ptr since the gate
  // landed (2026-08-04); icyveins + wowhead added 2026-08-05 (owner-directed) with
  // their stored `published` seeded in the same commit — the gate treats a block
  // whose pages carry no published field as a config bug.
  const { readFile } = await import("node:fs/promises");
  const config = JSON.parse(await readFile(new URL("../data/required-sources.json", import.meta.url), "utf8"));
  const raw = JSON.parse(await readFile(new URL("../data/sources.json", import.meta.url), "utf8"));
  const { targets, problems } = evidenceTargets(config, raw.sources ?? raw);
  assert.deepEqual(problems, [], "the committed contract must not carry published-gate config problems");
  const byKey = {};
  for (const t of targets) byKey[t.key] = (byKey[t.key] ?? 0) + 1;
  // icyveins-ptr's 3 pages left this map at the 2026-08-18 flip (the source was removed
  // from the registry — runbook step 5). The pin stays deliberate: a published block
  // appearing or vanishing is always a reviewed change.
  // Method's two body-dated pages joined after the 2026-09-15 audit found that
  // new capture dates hid older publisher opinions from the same verification.
  assert.deepEqual(byKey, { icyveins: 6, method: 2, wowhead: 6 },
    "published-gated pages: icyveins 6 + method 2 + wowhead 6");
  assert.ok(targets.every(t => t.url.startsWith("https://")));
});

test("Method's real contract checks publisher dates independently of fresh captures", async () => {
  const { readFile } = await import("node:fs/promises");
  const config = JSON.parse(await readFile(new URL("../data/required-sources.json", import.meta.url), "utf8"));
  const sources = JSON.parse(await readFile(new URL("../data/sources.json", import.meta.url), "utf8"));
  const requirement = config.requirements.find(r => r.key === "method");
  const method = structuredClone(sources.find(s => s.id === "method"));
  assert.ok(method.pages.every(p => /^\d{4}-\d{2}-\d{2}$/.test(p.published)), "both real Method pages retain publisher dates");
  const cfg = { maxRunAgeHours: 36, requirements: [requirement] };
  // Fixed observed source text keeps this regression independent of future refreshes.
  for (const page of method.pages) {
    page.snapshot = "2026-09-15";
    page.published = page.bracket === "raid" ? "2026-08-10" : "2026-08-13";
  }
  const data = { sources: [method], specs: [] };
  const evidence = { attemptedAt: "2026-09-15T15:00:00Z", pages: method.pages.map(page => ({
    key: "method", url: page.url, httpStatus: 200,
    ...resolvePage(`Last Updated ${page.bracket === "raid" ? "10th" : "13th"} August 2026`, "2026-09-15")
  })) };
  assert.deepEqual(checkPublished(cfg, data, null, evidence, "2026-09-15").errors, []);
  const overclaim = structuredClone(data);
  overclaim.sources[0].pages.find(page => page.bracket === "mplus").published = "2026-09-15";
  assert.ok(checkPublished(cfg, overclaim, null, evidence, "2026-09-15").errors
    .some(error => error.includes("stores published 2026-09-15 but the page itself says 2026-08-13")));

  const dayAfterLimit = new Date(Date.parse("2026-08-10") + (requirement.published.maxAgeDays + 1) * 86400000)
    .toISOString().slice(0, 10);
  for (const page of method.pages) page.snapshot = dayAfterLimit;
  const health = checkFreshness(cfg, { run: dayAfterLimit }, data, dayAfterLimit);
  assert.deepEqual(health.fingerprint.split(","), ["method-published"],
    "fresh page captures cannot hide an expired publisher date");
});
