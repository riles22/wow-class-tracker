import { test } from "node:test";
import assert from "node:assert/strict";
import { verdictFor } from "../src/fetch-wcl.mjs";

/* The deterministic WCL fetch stage's verdict mapping — the publish gate and the
   nightly agent both key off these verdicts, so the branches are pinned here.
   (Transport itself is network-bound and exercised by the dispatch-only probe
   workflow, not unit tests.) */

test("verdictFor: missing credentials", () => {
  const r = verdictFor({ hasCreds: false, oauth: null, transportOk: false, probe: null });
  assert.equal(r.verdict, "no-credentials");
  assert.match(r.detail, /WCL_CLIENT_ID/);
});

test("verdictFor: OAuth rejection", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: false, status: 401 }, transportOk: false, probe: null });
  assert.equal(r.verdict, "oauth-failed");
  assert.match(r.detail, /401/);
});

test("verdictFor: transport failure after retry", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: false, probe: null });
  assert.equal(r.verdict, "network-failed");
});

test("verdictFor: the standing rdps-family 500 maps to rdps-broken with the upstream error named", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: true,
    probe: { encounterId: 3176, httpStatus: 200, errors: ["Internal server error"], rankings: 0 } });
  assert.equal(r.verdict, "rdps-broken");
  assert.match(r.detail, /3176/);
  assert.match(r.detail, /Internal server error/);
});

test("verdictFor: working rdps maps to rdps-restored (owner decision, still nothing landed)", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: true,
    probe: { encounterId: 3176, httpStatus: 200, errors: [], rankings: 57 } });
  assert.equal(r.verdict, "rdps-restored");
  assert.match(r.detail, /owner decision/);
});

test("verdictFor: no errors and no rankings is inconclusive, treated as transport failure", () => {
  const r = verdictFor({ hasCreds: true, oauth: { ok: true }, transportOk: true,
    probe: { encounterId: 3176, httpStatus: 200, errors: [], rankings: 0 } });
  assert.equal(r.verdict, "network-failed");
});
