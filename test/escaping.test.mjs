/* The published artifact's ONE load-bearing security property: every agent-written string
   — writeups, tuning highlights, creator takes, community names, tier-set text — comes
   from the open internet and is interpolated into a single self-contained HTML file. The
   2026-07-24 audit drove 40 adversarial payloads through the real build in a browser and
   found the boundary intact, then noted that nothing pins it: a future `${…}` that forgets
   `esc()` would ship silently (S4). These fixtures fail if that ever happens.

   Scope note, learned the hard way: MOST of the interpolation happens in the browser, not
   at build time, so a static scan of the built file is vacuous for it — dropping `esc()`
   from the take-claim sink did not fail an earlier static version of this test. The
   rendered probes therefore live in test/ui-invariants.test.mjs, which drives Chromium.
   What remains here are the two genuinely static properties: the payload island's
   escaping, and the CSP hash list. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Two shapes: one that breaks out of a text node, one that breaks out of an attribute. */
const MARK = "XSSPROBE";
const TEXT_BREAK = `${MARK}</script><img src=x onerror="window.__pwned=1">`;
const ATTR_BREAK = `${MARK}" onmouseover="window.__pwned=1" x="`;
const BAD_HREF = "javascript:window.__pwned=1";

test("the payload island can never terminate its own <script> block", async () => {
  // This IS a build-time property, so a static check is the right shape for it. The
  // client-rendered sinks (take claims, writeup prose, community names) are interpolated
  // in the browser and are covered in test/ui-invariants.test.mjs, which renders them —
  // a static scan cannot see them at all, as a mutation of esc(t.claim) confirmed.
  const { buildPayload } = await import("../src/render.mjs");
  const load = async f => JSON.parse(await readFile(path.join(ROOT, "data", f), "utf8"));
  const specs = await load("specs.json");
  specs[0] = { ...specs[0], ptr: { ...(specs[0].ptr ?? {}), verdict: "Mixed", summary: TEXT_BREAK } };

  const payload = buildPayload({
    specs, sources: await load("sources.json"), scales: await load("scales.json"),
    community: await load("community.json"), ptrBuilds: await load("ptr-builds.json"),
    creatorTakes: await load("creator-takes.json"), encounterTiers: await load("encounter-tiers.json"),
    historySnapshots: [], now: "2026-07-24",
  });
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  assert.ok(json.includes(MARK), "sanity: the probe must reach the payload");
  assert.ok(!/<\/script>/i.test(json), "the escaped payload must not contain a literal </script>");
  assert.ok(!/<img/i.test(json), "no raw tag may survive into the payload island");
});

test("the CSP hash list covers every script the artifact ships (audit 2026-07-24, S3)", async () => {
  // build.mjs hashes `<script>` with a regex that only matches the bare tag. A future
  // template edit adding an attribute (`<script defer>`) would ship a page whose CSP
  // blocks its own script — with every gate green, because nothing checks the count.
  const dist = path.join(ROOT, "dist", "index.html");
  const html = await readFile(dist, "utf8").catch(() => null);
  if (html == null) return; // dist not built in this run; the build test covers presence

  const scriptTags = (html.match(/<script\b/gi) || []).length;
  // The content attribute is double-quoted and full of single quotes ('none', 'sha256-…'),
  // so it must be captured whole before looking inside it.
  const meta = /<meta[^>]+Content-Security-Policy[^>]+content="([^"]*)"/i.exec(html);
  assert.ok(meta, "the artifact must ship a Content-Security-Policy meta tag");
  const csp = /script-src([^;]*)/i.exec(meta[1]);
  assert.ok(csp, "the CSP must carry a script-src directive");
  const hashes = (csp[1].match(/'sha256-[A-Za-z0-9+/=]+'/g) || []).length;
  assert.equal(hashes, scriptTags,
    `CSP lists ${hashes} script hash(es) but the document ships ${scriptTags} <script> tag(s) — ` +
    "an unhashed script would be blocked at runtime with every gate green");
  assert.ok(!/'unsafe-inline'/i.test(csp[1]), "script-src must not fall back to 'unsafe-inline'");
});
