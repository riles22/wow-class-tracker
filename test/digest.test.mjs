import { test } from "node:test";
import assert from "node:assert/strict";
import { tierMoves, newEntries, verdictChanges, digestMarkdown } from "../src/digest.mjs";

const spec = (cls, sp, over = {}) => ({ class: cls, spec: sp, ...over });
const payload = (specs, extra = {}) => ({
  specs,
  sources: [{ id: "icyveins", name: "Icy Veins", kind: "tier-list" }, { id: "wcl", name: "WCL", kind: "metrics" }],
  creatorTakes: { takes: [], metaNotes: [] }, ptrBuilds: { builds: [] }, ...extra,
});

test("tierMoves reports consensus, projection, and tier-list-source moves — never metrics sources", () => {
  const oldP = payload([spec("Rogue", "Outlaw", {
    consensus: { raid: { tier: "B" }, mplus: { tier: "A" } },
    projection: { raid: { tier: "A" }, mplus: { tier: "A" } },
    ratings: { raid: { icyveins: "B", wcl: "X" }, mplus: {} },
  })]);
  const newP = payload([spec("Rogue", "Outlaw", {
    consensus: { raid: { tier: "A" }, mplus: { tier: "A" } },
    projection: { raid: { tier: "A" }, mplus: { tier: "S" } },
    ratings: { raid: { icyveins: "A", wcl: "Y" }, mplus: {} },
  })]);
  const moves = tierMoves(oldP, newP);
  assert.equal(moves.length, 1);
  assert.equal(moves[0].spec, "Outlaw Rogue");
  assert.deepEqual(moves[0].parts, [
    "consensus Raid B → A",
    "Icy Veins Raid B → A",
    "our 12.1 M+ A → S",
  ]);
  // the metrics-kind "wcl" change must not appear (honest source typing)
  assert.ok(!moves[0].parts.some(p => p.includes("WCL")));
});

test("tierMoves is silent when nothing changed and for specs absent from the old state", () => {
  const a = payload([spec("Mage", "Frost", { consensus: { raid: { tier: "S" }, mplus: { tier: "S" } } })]);
  assert.deepEqual(tierMoves(a, a), []);
  const withNew = payload([...a.specs, spec("Mage", "Fire", { consensus: { raid: { tier: "A" }, mplus: {} } })]);
  assert.deepEqual(tierMoves(a, withNew), []); // brand-new spec = no "move"
});

test("newEntries diffs by identity", () => {
  const id = t => t.url;
  assert.deepEqual(newEntries([{ url: "a" }], [{ url: "a" }, { url: "b" }], id), [{ url: "b" }]);
  assert.deepEqual(newEntries(null, [{ url: "a" }], id), [{ url: "a" }]);
});

test("verdictChanges tracks writeup verdict transitions including appearing/disappearing", () => {
  const oldP = payload([spec("Monk", "Mistweaver", { ptr: { verdict: "Mixed" } }), spec("Monk", "Brewmaster", {})]);
  const newP = payload([spec("Monk", "Mistweaver", { ptr: { verdict: "Positive" } }), spec("Monk", "Brewmaster", { ptr: { verdict: "Negative" } })]);
  assert.deepEqual(verdictChanges(oldP, newP), [
    "Mistweaver Monk: Mixed → Positive",
    "Brewmaster Monk: no writeup → Negative",
  ]);
});

test("digestMarkdown: quiet run says so honestly; degraded sources footer appears", () => {
  const p = payload([spec("Rogue", "Outlaw", { consensus: { raid: { tier: "A" }, mplus: { tier: "A" } } })]);
  const md = digestMarkdown({ oldPayload: p, newPayload: p,
    manifest: { summary: "All fresh.", sources: [{ source: "wcl-ptr-raid", result: "unreachable" }, { source: "icyveins", result: "success" }] },
    runUrl: "https://example.com/run" });
  assert.ok(md.includes("Quiet run"));
  assert.ok(md.includes("> All fresh."));
  assert.ok(md.includes("[workflow run](https://example.com/run)"));
  assert.ok(md.includes("1 source degraded (wcl-ptr-raid)"));
});

test("digestMarkdown lists new takes with sentiment, truncation, and link", () => {
  const oldP = payload([]);
  const newP = payload([], { creatorTakes: { takes: [
    { creator: "Obli", class: "Death Knight", spec: "Unholy", sentiment: "nerf", claim: "x".repeat(200), url: "https://youtu.be/abc?t=60", superseded: false },
    { creator: "Old", class: "Mage", spec: "Frost", sentiment: "buff", claim: "already superseded", url: "https://youtu.be/zzz", superseded: true },
  ], metaNotes: [] } });
  const md = digestMarkdown({ oldPayload: oldP, newPayload: newP, manifest: null, runUrl: null });
  assert.ok(md.includes("New creator takes (1)"));
  assert.ok(md.includes("**Obli** on Unholy Death Knight (nerf)"));
  assert.ok(md.includes("[watch](https://youtu.be/abc?t=60)"));
  assert.ok(!md.includes("already superseded"));
});
