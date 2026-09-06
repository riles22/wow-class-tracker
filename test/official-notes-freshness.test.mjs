import test from "node:test";
import assert from "node:assert/strict";
import { checkFreshness } from "../src/check-refresh.mjs";

const now = "2026-09-05T18:00:00Z";
const config = { requirements: [], maxRunAgeHours: 28, minSuccessfulSources: 7,
  officialNotes: { maxAgeHours: 48, sources: ["live-hotfixes", "ptr-preview"] } };
const manifest = { startedAt: now };
const dataAt = (live, preview) => ({ officialNotes: { sources: {
  "live-hotfixes": { checkedAt: live }, "ptr-preview": { checkedAt: preview },
} } });

test("fresh refreshes elsewhere cannot hide a stalled official-note source", () => {
  const result = checkFreshness(config, manifest, dataAt(now, "2026-09-03T17:59:00Z"), now);
  assert.equal(result.fingerprint, "official-notes-ptr-preview");
  assert.match(result.violations[0], /has not been verified/);
});

test("note freshness accepts the boundary and rejects missing or future receipts", () => {
  assert.equal(checkFreshness(config, manifest, dataAt(now, "2026-09-03T18:00:00Z"), now).fingerprint, "");
  const result = checkFreshness(config, manifest, dataAt(undefined, "2026-09-05T18:06:00Z"), now);
  assert.deepEqual(result.violations.map(s => /future/.test(s)), [false, true]);
  assert.equal(result.fingerprint, "official-notes-live-hotfixes,official-notes-ptr-preview");
});

test("a recent receipt cannot hide unresolved official-note sections", () => {
  const data = dataAt(now, now);
  data.officialNotes.sources["ptr-preview"].posts = [{ sections: [{ resolution: { disposition: "unresolved" } }] }];
  data.officialNotes.sources["live-hotfixes"].removedSections = [{ resolution: { disposition: "unresolved" } }];
  assert.equal(checkFreshness(config, manifest, data, now).fingerprint, "official-notes-live-hotfixes-unresolved,official-notes-ptr-preview-unresolved");
});
