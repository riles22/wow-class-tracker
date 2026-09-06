import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildPayload, publicationPayload } from "../src/render.mjs";
import { loadData } from "../src/validate.mjs";

test("publication omits superseded prose without mutating archives or computed outputs", async () => {
  const data = await loadData(fileURLToPath(new URL("..", import.meta.url)));
  const archiveBefore = JSON.stringify(data.creatorTakes);
  const analytical = buildPayload(data);
  const before = JSON.stringify(analytical);
  const published = publicationPayload(analytical);
  assert.equal(JSON.stringify(data.creatorTakes), archiveBefore);
  assert.equal(JSON.stringify(analytical), before, "publication must not mutate its analytical input");
  assert.deepEqual(published.creatorTakes.takes, data.creatorTakes.takes.filter(t => !t.superseded));
  assert.deepEqual(published.creatorTakes.metaNotes, data.creatorTakes.metaNotes.filter(t => !t.superseded));
  for (const key of Object.keys(analytical).filter(k => k !== "creatorTakes")) {
    assert.deepEqual(published[key], analytical[key], `${key} must retain every value, including computed forecasts and history`);
  }
  assert.ok(Buffer.byteLength(JSON.stringify(published)) < Buffer.byteLength(before));
});

test("credits preserve superseded-only contributors and original first-URL precedence", () => {
  const payload = { community: { classes: [{ creators: [{ name: "Registered", url: "https://example.com/channel" }] }],
    generalCreators: [{ name: "General", url: "https://example.com/general" }] },
    creatorTakes: { takes: [
      { creator: "Registered", url: "https://youtu.be/registered", superseded: true, claim: "ARCHIVE ONLY" },
      { creator: "Take only", url: "https://youtu.be/old", superseded: true, claim: "ARCHIVE ONLY" },
      { creator: "Take only", url: "https://youtu.be/current", claim: "VISIBLE" },
      { creator: "Archived author", url: "https://youtu.be/archive", superseded: true, claim: "ARCHIVE ONLY" },
    ], metaNotes: [
      { creator: "General", url: "https://youtu.be/general", superseded: true, note: "ARCHIVE ONLY" },
      { creator: "Meta only", url: "https://youtu.be/meta", superseded: true, note: "ARCHIVE ONLY" },
    ] } };
  const result = publicationPayload(payload);
  assert.deepEqual(result.creatorCredits, [
    { name: "Registered", url: "https://example.com/channel" },
    { name: "Take only", url: "https://youtu.be/old" },
    { name: "Archived author", url: "https://youtu.be/archive" },
    { name: "General", url: "https://example.com/general" },
    { name: "Meta only", url: "https://youtu.be/meta" },
  ]);
  assert.doesNotMatch(JSON.stringify(result), /ARCHIVE ONLY/);
  assert.match(JSON.stringify(result), /VISIBLE/);
});

test("the footer renders compact credits, escapes them and keeps earlier full payloads compatible", async () => {
  const template = await readFile(new URL("../src/template.html", import.meta.url), "utf8");
  const footer = template.split("/* ---------- footer: collective creator credit")[1].split("/* ---------- per-fight selector")[0];
  const body = footer.slice(footer.indexOf("(function(){"));
  const creditElement = { innerHTML: "" };
  const render = new Function("DATA", "COMMUNITY", "CREATOR_TAKES", "document", "esc", "safeHref", body);
  const esc = text => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const run = payload => {
    render(payload, payload.community ?? {}, payload.creatorTakes?.takes ?? [], { getElementById: () => creditElement }, esc, href => /^https:\/\//.test(href) ? href : "#");
    return creditElement.innerHTML;
  };
  const full = { community: { classes: [{ creators: [{ name: "Registry", url: "https://example.com/registry" }] }] },
    creatorTakes: { takes: [{ creator: "<Archived>", url: "javascript:alert(1)", superseded: true }], metaNotes: [] } };
  const oldHTML = run(full), compactHTML = run(publicationPayload(full));
  assert.equal(compactHTML, oldHTML, "the compact payload must retain exactly the previous visible credits");
  assert.match(compactHTML, /&lt;Archived>/);
  assert.doesNotMatch(compactHTML, /javascript:|<Archived>/);
});
