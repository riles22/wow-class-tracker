import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { MIN_RANK_N, EXPERT_QUORUM, PROJECTION_VERSION } from "../src/render.mjs";

/* Pin the NUMERIC claims CLAUDE.md makes about values that live in code or data
   (2026-08-15 context audit).
 *
 * WHY. CLAUDE.md is loaded into every session and is the first thing any agent
 * believes about this project, but until now nothing checked it against reality —
 * `grep -rn "CLAUDE.md" test/` returned zero hits. The audit that added this file
 * found three live drifts by hand: it described the Icy Veins PTR scale as "6-band"
 * after commit 521ceaf widened it to seven, refresh-tiers/SKILL.md still called the
 * LIVE Icy Veins scale five-band when it is also seven, and the UI-invariant count
 * was wrong. All had been wrong for days in the file every run reads first.
 *
 * SCOPE — deliberately narrow. Only claims that are (a) written as a specific number
 * or tier list in CLAUDE.md and (b) mechanically owned by a file that can be read
 * here. Prose judgements are not pinnable and are not pinned.
 *
 * NOT PINNED ON PURPOSE: the test/skip COUNTS in the Layout section. Those move with
 * every added test — this very file moved the total from 392 to 398 the hour it was
 * written — and CLAUDE.md already tells the reader to "treat any pass/skip COUNT
 * written here as stale on sight and read it off the run instead". A disclaimer is the
 * honest handling for a genuinely volatile number; pinning it would red the suite every
 * time someone adds a test.
 *
 * WHEN THIS FAILS: the owning value moved and the prose did not. Fix the prose — do
 * NOT relax the assertion. That is the whole point of the file.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const claudeMd = await readFile(path.join(ROOT, "CLAUDE.md"), "utf8");
const scales = JSON.parse(await readFile(path.join(ROOT, "data/scales.json"), "utf8"));
const specs = JSON.parse(await readFile(path.join(ROOT, "data/specs.json"), "utf8"));
const required = JSON.parse(
  await readFile(path.join(ROOT, "data/required-sources.json"), "utf8"),
);

/* Locate a claim by a distinctive phrase and pull the number out of it, so the failure
   message can quote the actual sentence rather than just a line number. */
function claim(pattern, label) {
  const match = claudeMd.match(pattern);
  assert.ok(
    match,
    `CLAUDE.md no longer contains the ${label} claim (pattern ${pattern}). If the ` +
      `sentence was reworded, update this pattern; if the claim was deliberately ` +
      `removed, delete this assertion.`,
  );
  const line = claudeMd.slice(0, match.index).split("\n").length;
  return { value: Number(match[1]), text: match[0].replace(/\s+/g, " "), line };
}

test("CLAUDE.md: projection constants match src/render.mjs", () => {
  const quorum = claim(/`EXPERT_QUORUM` = (\d+)/, "EXPERT_QUORUM");
  assert.equal(
    quorum.value,
    EXPERT_QUORUM,
    `CLAUDE.md:${quorum.line} says "${quorum.text}" but render.mjs exports ` +
      `EXPERT_QUORUM = ${EXPERT_QUORUM}.`,
  );

  const minRank = claim(/`MIN_RANK_N` is (\d+)/, "MIN_RANK_N");
  assert.equal(
    minRank.value,
    MIN_RANK_N,
    `CLAUDE.md:${minRank.line} says "${minRank.text}" but render.mjs exports ` +
      `MIN_RANK_N = ${MIN_RANK_N}.`,
  );

  const version = claim(/PROJECTION_VERSION (\d+)/, "PROJECTION_VERSION");
  assert.equal(
    version.value,
    PROJECTION_VERSION,
    `CLAUDE.md:${version.line} says "${version.text}" but render.mjs exports ` +
      `PROJECTION_VERSION = ${PROJECTION_VERSION}. The version log beside the constant ` +
      `is authoritative; CLAUDE.md's prose is not.`,
  );
});

test("CLAUDE.md: the consensus S band threshold matches data/scales.json", () => {
  const sBand = scales.consensus.bands.find((b) => b.tier === "S");
  assert.ok(sBand, "data/scales.json has no S band in consensus.bands");

  /* This number is mirrored in prose in THREE places by design — CLAUDE.md, the
     always-visible note above the grid, and the legend's band line — because a visitor
     reading a stale threshold off the page is the misattribution problem the column
     qualifiers exist to prevent. */
  const stated = claim(/S from (\d+) up/, "consensus S band");
  assert.equal(
    stated.value,
    sBand.min,
    `CLAUDE.md:${stated.line} says "${stated.text}" but scales.json puts the S band at ` +
      `min ${sBand.min}. src/template.html mirrors this number twice more — fix all three.`,
  );
});

test("CLAUDE.md: the Icy Veins PTR scale band count matches data/scales.json", () => {
  const scale = scales.scales["icyveins-ptr"];
  assert.ok(scale, "data/scales.json has no icyveins-ptr scale");

  const stated = claim(/(\d+)-band scale including \*\*B\+\*\*/, "icyveins-ptr band count");
  assert.equal(
    stated.value,
    scale.tiers.length,
    `CLAUDE.md:${stated.line} says "${stated.text}" but scales.json gives icyveins-ptr ` +
      `${scale.tiers.length} bands (${scale.tiers.join("/")}). This exact drift is why ` +
      `this test exists: commit 521ceaf widened the scale and the prose was not updated.`,
  );
});

test("CLAUDE.md: the roster size matches data/specs.json", () => {
  const stated = claim(/The (\d+)-spec roster is Midnight-era/, "roster size");
  assert.equal(
    stated.value,
    specs.length,
    `CLAUDE.md:${stated.line} says "${stated.text}" but data/specs.json holds ` +
      `${specs.length} specs.`,
  );
});

test("CLAUDE.md: the heartbeat threshold matches data/required-sources.json", () => {
  /* CLAUDE.md names required-sources.json as "the single source of truth for the
     number", which is exactly the kind of claim that rots silently. */
  /* \s+ not a literal space: CLAUDE.md hard-wraps, and this claim happens to straddle
     a line break. Every pattern here must survive rewrapping. */
  const stated = claim(/\((\d+)h since\s+2026-07-25/, "maxRunAgeHours");
  assert.equal(
    stated.value,
    required.maxRunAgeHours,
    `CLAUDE.md:${stated.line} says "${stated.text}" but required-sources.json sets ` +
      `maxRunAgeHours = ${required.maxRunAgeHours}.`,
  );
});

test("CLAUDE.md: every tier-list scale it names still exists in data/scales.json", () => {
  /* Guards the other direction: a source removed from scales.json while CLAUDE.md
     still describes it as live. */
  const named = ["icyveins", "icyveins-ptr", "method", "archon", "wowhead"];
  for (const id of named) {
    assert.ok(
      scales.scales[id],
      `CLAUDE.md describes "${id}" as a scale but data/scales.json has no such entry. ` +
        `Either the source was removed and CLAUDE.md still names it, or the id changed.`,
    );
  }
});
