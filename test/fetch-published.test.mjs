import { test } from "node:test";
import assert from "node:assert/strict";
import { extractDateModified, extractLastUpdated, resolvePage, evidenceTargets } from "../src/fetch-published.mjs";

/* The two page idioms the deterministic step reads, as fixtures. Both parsers are the
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

test("the repo's real contract yields exactly the icyveins-ptr pages as evidence targets", async () => {
  const { readFile } = await import("node:fs/promises");
  const config = JSON.parse(await readFile(new URL("../data/required-sources.json", import.meta.url), "utf8"));
  const raw = JSON.parse(await readFile(new URL("../data/sources.json", import.meta.url), "utf8"));
  const { targets, problems } = evidenceTargets(config, raw.sources ?? raw);
  assert.deepEqual(problems, [], "the committed contract must not carry published-gate config problems");
  assert.equal(targets.length, 3, "the three icyveins-ptr role pages");
  assert.ok(targets.every(t => t.key === "icyveins-ptr" && t.url.startsWith("https://")));
});
