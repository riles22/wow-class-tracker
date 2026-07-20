import { test } from "node:test";
import assert from "node:assert/strict";
import { tierMoves, newEntries, verdictChanges, videoActivity, digestMarkdown } from "../src/digest.mjs";

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

test("videoActivity classifies cleared queue entries by whether new takes/notes cite them", () => {
  const oldPending = { videos: [{ id: "aaa111", creator: "Obli", title: "DK in 12.1" }, { id: "bbb222", creator: "Supatease", title: "PvP tuning" }] };
  const newPending = { videos: [{ id: "ccc333", creator: "Kalamazi", title: "Warlock buffs?", published: "2026-07-20" }, { id: "ddd444", creator: "Held", title: "Old queued vid" }] };
  const oldPendingWithD = { videos: [...oldPending.videos, { id: "ddd444", creator: "Held", title: "Old queued vid" }] };
  const takes = [{ url: "https://youtu.be/aaa111?t=60" }];
  const act = videoActivity(oldPendingWithD, newPending, takes, []);
  assert.deepEqual(act.distilled.map(v => v.id), ["aaa111"]);
  assert.deepEqual(act.skipped.map(v => v.id), ["bbb222"]);
  assert.deepEqual(act.queued.map(v => v.id), ["ccc333"]);
  assert.deepEqual(act.waiting.map(v => v.id), ["ddd444"]);
});

test("videoActivity tolerates missing queue files (revs predating the lane)", () => {
  const act = videoActivity(null, { videos: [{ id: "x", creator: "C", title: "T" }] }, [], []);
  assert.deepEqual(act.queued.map(v => v.id), ["x"]);
  assert.deepEqual(videoActivity(null, null, [], []), { distilled: [], skipped: [], queued: [], waiting: [] });
});

test("digestMarkdown renders the Creator videos section and it suppresses the quiet-run line", () => {
  const p = payload([]);
  const md = digestMarkdown({ oldPayload: p, newPayload: p, manifest: null, runUrl: null,
    oldPending: { videos: [{ id: "bbb222", creator: "Supatease", title: "PvP tuning" }] },
    newPending: { videos: [{ id: "ccc333", creator: "Kalamazi", title: "Warlock buffs?", published: "2026-07-20" }] } });
  assert.ok(md.includes("**Creator videos:**"));
  assert.ok(md.includes("Checked & skipped — transcript verified out of scope, no PvE tier/meta content: **Supatease** — “PvP tuning” ([watch](https://youtu.be/bbb222))"));
  assert.ok(md.includes("Queued for the next transcript run: **Kalamazi** — “Warlock buffs?” (published 2026-07-20, [watch](https://youtu.be/ccc333))"));
  assert.ok(!md.includes("Quiet run"));
});

test("digestMarkdown marks a cleared video distilled when its takes landed; unchanged waiting queue keeps the quiet line", () => {
  const oldP = payload([]);
  const newP = payload([], { creatorTakes: { takes: [
    { creator: "Obli", class: "Death Knight", spec: "Unholy", sentiment: "nerf", claim: "less rDPS", url: "https://youtu.be/aaa111?t=60", superseded: false },
  ], metaNotes: [] } });
  const md = digestMarkdown({ oldPayload: oldP, newPayload: newP, manifest: null, runUrl: null,
    oldPending: { videos: [{ id: "aaa111", creator: "Obli", title: "DK in 12.1" }] },
    newPending: { videos: [] } });
  assert.ok(md.includes("Distilled — takes below: **Obli** — “DK in 12.1” ([watch](https://youtu.be/aaa111))"));
  // a queue that merely carries over is visible but does not make the run non-quiet
  const carry = { videos: [{ id: "eee555", creator: "C", title: "Waiting vid" }] };
  const quiet = digestMarkdown({ oldPayload: oldP, newPayload: oldP, manifest: null, runUrl: null, oldPending: carry, newPending: carry });
  assert.ok(quiet.includes("Still waiting in the queue: **C** “Waiting vid”"));
  assert.ok(quiet.includes("Quiet run"));
});

test("videoActivity recognizes every validator-allowed YouTube URL shape as a citation", () => {
  const pendingWith = ids => ({ videos: ids.map(id => ({ id, creator: "C", title: "T" })) });
  const cleared4 = pendingWith(["idAAA", "idBBB", "idCCC", "idDDD"]);
  const takes = [
    { url: "https://youtu.be/idAAA?t=60" },
    { url: "https://www.youtube.com/watch?v=idBBB&t=60s" },
    { url: "https://m.youtube.com/watch?app=m&v=idCCC" },
    { url: "https://www.youtube.com/shorts/idDDD" },
  ];
  const act = videoActivity(cleared4, { videos: [] }, takes, []);
  assert.deepEqual(act.distilled.map(v => v.id).sort(), ["idAAA", "idBBB", "idCCC", "idDDD"]);
  assert.deepEqual(act.skipped, []);
});

test("a video whose takes land already-superseded in the same run still counts as distilled", () => {
  const oldP = payload([]);
  // backlog catch-up: two videos from the same creator/spec distilled in ONE run —
  // the older video's take is born superseded, but its video was still distilled
  const newP = payload([], { creatorTakes: { takes: [
    { creator: "Supatease", class: "Shaman", spec: "Restoration", sentiment: "buff", claim: "older read", url: "https://youtu.be/oldVID111?t=60", superseded: true },
    { creator: "Supatease", class: "Shaman", spec: "Restoration", sentiment: "buff", claim: "newer read", url: "https://youtu.be/newVID222?t=90", superseded: false },
  ], metaNotes: [] } });
  const md = digestMarkdown({ oldPayload: oldP, newPayload: newP, manifest: null, runUrl: null,
    oldPending: { videos: [{ id: "oldVID111", creator: "Supatease", title: "Older video" }, { id: "newVID222", creator: "Supatease", title: "Newer video" }] },
    newPending: { videos: [] } });
  assert.ok(md.includes("Distilled — takes below: **Supatease** — “Older video”"));
  assert.ok(md.includes("Distilled — takes below: **Supatease** — “Newer video”"));
  assert.ok(!md.includes("Checked & skipped"));
  // display sections still hide the superseded take itself
  assert.ok(md.includes("New creator takes (1)"));
  assert.ok(!md.includes("older read"));
});

test("digestMarkdown omits the Creator videos section when no queue data is passed (back-compat)", () => {
  const p = payload([]);
  const md = digestMarkdown({ oldPayload: p, newPayload: p, manifest: null, runUrl: null });
  assert.ok(!md.includes("Creator videos"));
  assert.ok(md.includes("Quiet run"));
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
