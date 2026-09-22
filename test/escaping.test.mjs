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
   What remains here are the genuinely static properties: the payload island's escaping,
   the CSP hash list, and (CodeQL triage 2026-09-22) the one shared esc() both pages carry
   plus the regex-free script extraction the two builds hash. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { esc, ESC_SOURCE, inlineScripts, scriptTagCount } from "../src/html-safety.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Only the text-node shape is used here. The attribute-break and javascript:-href probes
   moved to test/ui-invariants.test.mjs when the client-rendered sinks did — a static scan
   cannot see them, so keeping unused copies here implied coverage this file does not have. */
const MARK = "XSSPROBE";
const TEXT_BREAK = `${MARK}</script><img src=x onerror="window.__pwned=1">`;

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
  // build.mjs hashes only the bare `<script>` blocks (html-safety.mjs inlineScripts). A future
  // template edit adding an attribute (`<script defer>`) would ship a page whose CSP
  // blocks its own script — with every gate green, unless something checks the count.
  // The build now refuses that itself; this checks the shipped artifact independently.
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

/* ---- the shared escape (CodeQL triage 2026-09-22) --------------------------------------
   Both pages are self-contained under a hashed CSP, so neither can import the helper at run
   time; each template carries a copy. These pin the copies to src/html-safety.mjs so a
   quote-less or null-unsafe variant cannot creep back into either page. */
test("both published templates define the shared esc() exactly once, byte-identical", async () => {
  for (const rel of ["src/template.html", "gearing/src/app.template.html"]) {
    const html = await readFile(path.join(ROOT, rel), "utf8");
    assert.ok(html.includes(ESC_SOURCE), `${rel} must define esc exactly as src/html-safety.mjs ESC_SOURCE`);
    assert.equal(html.split("const esc =").length - 1, 1, `${rel} must define esc once`);
  }
});

test("esc() covers & < > \" and ', so one call is safe in element text and in quoted attributes", () => {
  assert.equal(esc(`<a href="x" title='y'>&</a>`),
    "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
  assert.equal(esc(null), "");
  assert.equal(esc(undefined), "");
  assert.equal(esc(0), "0");
  assert.equal(esc(false), "false");
  assert.equal(esc("&amp;"), "&amp;amp;", "esc() escapes; it never guesses that input is already escaped");
});

test("CSP hash input is extracted without a regex and refuses script tags a template did not author", () => {
  assert.deepEqual(
    inlineScripts(`<p>x</p><script>a()</script><script id="d" type="application/json">{}</script><script>b()</script>`),
    ["a()", "b()"]);
  // The browser ends the first block at "</script >", so hashing up to the next exact
  // "</script>" would bless the second script. The extractor refuses instead.
  assert.throws(() => inlineScripts("<script>a()</script ><script>b()</script>"), /second script end tag/);
  assert.throws(() => inlineScripts("<script>a()</SCRIPT><script>b()</script>"), /second script end tag/);
  assert.throws(() => inlineScripts("<script>a()"), /unterminated/);
  // Every start tag counts, in any case and with any attributes; end tags do not.
  assert.equal(scriptTagCount(`<SCRIPT defer src=x></SCRIPT><script>a()</script><Script type=module>`), 3);
});
