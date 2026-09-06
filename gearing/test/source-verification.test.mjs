import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { catalystGuide, compareEvidence, currentVerification, digest, itemScope, tierBonuses,
  validateReport } from "../src/verify-sources.mjs";
import { getText } from "../src/lib-wowhead.mjs";
import { jsonForHtml } from "../src/lib-html.mjs";

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const stamp = "2026-09-06T00:00:00.000Z";
const receipt = (count) => Array.from({ length: count }, (_, i) => ({
  url: `https://nether.wowhead.com/tooltip/item/${i}`, observedAt: stamp, sha256: "a".repeat(64),
}));
function report() {
  const groups = {};
  for (const key of ["tierBonuses", "catalystRules", "raid", "dungeons", "tier", "allocations"])
    groups[key] = { status: "verified", reason: "Unchanged", inputDigest: "b".repeat(64),
      sourceDigest: "b".repeat(64), lastVerifiedAt: stamp,
      ...(key === "tierBonuses" || key === "catalystRules" ? { sources: receipt(key === "tierBonuses" ? 13 : 3) } : {}) };
  groups.rewardLadders = { status: "manual-review", reason: "Not covered by item fetches" };
  return { schemaVersion: 1, observedAt: stamp, baselineDigest: "c".repeat(64), groups };
}

test("tier parser covers exactly both bonuses for each current class specialization", async () => {
  const [tier, specs] = await Promise.all([read("../data/tier-items.json"), read("../../data/specs.json")]);
  const bonuses = tier.sets.flatMap((set) => tierBonuses(set.items[0].html, set.class, specs));
  assert.equal(bonuses.length, 80);
  assert.ok(bonuses.some((row) => row.class === "Demon Hunter" && row.spec === "Devourer"));
  assert.throws(() => tierBonuses("<html>Verify you are human</html>", "Mage", specs), /Incomplete/);
  const html = tier.sets[0].items[0].html;
  assert.throws(() => tierBonuses(html + html, tier.sets[0].class, specs), /Incomplete/);
  assert.throws(() => tierBonuses(html.replace("Set Blood:", "Set Invented:"), tier.sets[0].class, specs), /Unrecognized/);
});

test("Catalyst scope rejects challenges and ignores comments and cosmetic tables", () => {
  const body = "[h2]Obtaining Catalyst Charges[/h2]Every two weeks. [h2]How to Use[/h2]Veteran; not profession-crafted; secondary stats. "
    + "[h2]Midnight Season 2 Cosmetic Tier Set Armor List[/h2]IGNORE THIS";
  const html = `<script>WH.markup.printHtml(${JSON.stringify(body)}, "guide-body", {});</script>`;
  assert.ok(!catalystGuide(html + "Some comment").includes("IGNORE THIS"));
  assert.throws(() => catalystGuide("Please verify you are human"), /body absent/);
  assert.throws(() => catalystGuide(html.replace("Veteran", "unreadable")), /expected rule/);
});

test("source text and curated input edits require review; unchanged text can be verified", () => {
  const value = [{ url: "https://example.com/source", value: "two weeks" }];
  const reviewed = { inputDigest: "facts", digest: digest(value) };
  assert.equal(compareEvidence(value, reviewed, "facts").status, "verified");
  assert.equal(compareEvidence(value, reviewed, "new facts").status, "review-required");
  assert.equal(compareEvidence([{ value: "one week" }], reviewed, "facts").status, "review-required");
  assert.equal(compareEvidence(value, null, "facts").status, "review-required");
});

test("item verification ignores unverified reward tables and raw set prose but detects actual item changes", () => {
  const doc = { harvestedAt: "old", bosses: [{ boss: 1, name: "Fixture", dropLevels: [100],
    items: [{ id: "1", slot: "Head", secondaryRatings: { Crit: 123 }, html: "old tooltip" }] }] };
  const next = structuredClone(doc);
  next.harvestedAt = "new"; next.bosses[0].dropLevels = [999]; next.bosses[0].items[0].html = "new tooltip";
  assert.deepEqual(itemScope("raid", doc), itemScope("raid", next));
  next.bosses[0].items[0].secondaryRatings.Crit++;
  assert.notDeepEqual(itemScope("raid", doc), itemScope("raid", next));
});

test("report validation fails closed on future dates, missing coverage, forged statuses and source receipts", () => {
  assert.doesNotThrow(() => validateReport(report()));
  const changes = [
    (r) => { r.observedAt = "2999-01-01T00:00:00.000Z"; },
    (r) => { r.observedAt = "2026-02-30T00:00:00.000Z"; },
    (r) => { delete r.groups.raid; },
    (r) => { r.groups.raid.status = "green-enough"; },
    (r) => { r.groups.rewardLadders.status = "verified"; },
    (r) => { r.groups.tierBonuses.sources.pop(); },
    (r) => { r.groups.catalystRules.sources[0].url = "https://attacker.example/foo"; },
    (r) => { r.groups.raid.lastVerifiedAt = "2026-09-07T00:00:00.000Z"; },
    (r) => { r.groups.raid.sourceDigest = null; },
  ];
  for (const change of changes) { const r = report(); change(r); assert.throws(() => validateReport(r)); }
});

test("published receipts become unverified if the reviewed baseline or canonical input changes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "gearing-receipt-test-")), root = join(dir, "gearing");
  try {
    await mkdir(join(root, "data"), { recursive: true }); await mkdir(join(dir, "data"));
    await copyFile(new URL("../../data/specs.json", import.meta.url), join(dir, "data", "specs.json"));
    for (const file of ["catalyst-rules.json", "raid-items.json", "dungeon-items.json", "tier-items.json", "catalyst-stat-allocations.json"])
      await copyFile(new URL(`../data/${file}`, import.meta.url), join(root, "data", file));
    const baseline = { fixture: true }, r = report();
    r.baselineDigest = digest(baseline);
    await writeFile(join(root, "data", "source-review.json"), JSON.stringify(baseline));
    const raid = await read("../data/raid-items.json");
    r.groups.raid.inputDigest = r.groups.raid.sourceDigest = digest(itemScope("raid", raid));
    assert.equal((await currentVerification(r, root)).groups.raid.status, "verified");
    raid.bosses[0].items[0].name += " changed";
    await writeFile(join(root, "data", "raid-items.json"), JSON.stringify(raid));
    assert.equal((await currentVerification(r, root)).groups.raid.status, "review-required");
    await writeFile(join(root, "data", "source-review.json"), JSON.stringify({ fixture: false }));
    assert.equal((await currentVerification(r, root)).groups.raid.status, "review-required");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("Wowhead retrieval aborts an unresponsive request and preserves failure semantics", async () => {
  const previous = globalThis.fetch;
  const keepAlive = setTimeout(() => {}, 2000);
  let signal;
  globalThis.fetch = async (_url, options) => {
    signal = options.signal;
    return await new Promise((_, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason));
    });
  };
  try { assert.equal(await getText("https://example.com/stalled", 1, { timeoutMs: 10 }), null); }
  finally { globalThis.fetch = previous; clearTimeout(keepAlive); }
  assert.equal(signal.aborted, true);
});

test("embedded failed-source excerpts and tooltip HTML cannot close the JSON script", () => {
  const input = { reason: 'Unexpected token </script ><p id="injected">oops</p>',
    tooltip: '</script\t><script>alert(1)</script>' };
  const encoded = jsonForHtml(input);
  assert.doesNotMatch(encoded, /</);
  assert.deepEqual(JSON.parse(encoded), input);
});
