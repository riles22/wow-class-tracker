import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { runManifestProvenanceGate } from "../src/check-manifest-provenance.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("nightly publish validates manifest provenance against committed HEAD", {
  skip: process.env.GITHUB_JOB !== "publish"
}, async () => {
  const errors = await runManifestProvenanceGate(root, "HEAD");
  assert.deepEqual(errors, [], errors.join("\n"));
});
