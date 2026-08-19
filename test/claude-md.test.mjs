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

test("CLAUDE.md: the retired icyveins-ptr scale is retained in data/scales.json", () => {
  // The band-count prose pin retired with the source (post-flip routines pass,
  // 2026-08-18): CLAUDE.md no longer states a band count because the source left the
  // registry at the flip. The scale itself is DELIBERATELY kept as the template for the
  // next cycle's era-gated source — this assertion is what stops a cleanup pass from
  // deleting it, and CLAUDE.md's sources.json section documents the retention.
  const scale = scales.scales["icyveins-ptr"];
  assert.ok(scale, "data/scales.json has no icyveins-ptr scale — it is retained on purpose (see CLAUDE.md's sources.json section)");
  assert.ok(
    /scale deliberately REMAINS in\s*`data\/scales\.json`/.test(claudeMd.replace(/\r\n/g, "\n")),
    "CLAUDE.md no longer documents that the icyveins-ptr scale is deliberately retained",
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

test("CLAUDE.md: the take-coverage paragraph matches what expertRead actually returns", async () => {
  /* The one claim in this file with a track record of going stale — four times, most
     recently in commit a97e260, whose own message announced "the recomputation now returns
     an empty 'no raid take' list" while leaving the prose asserting Brewmaster Monk was
     still a gap. CLAUDE.md warns the reader to recompute, and that warning is doing real
     work, but a false specific claim is still false. Unlike the test/skip counts this file
     deliberately leaves unpinned, coverage is NOT volatile noise: it changes only when a
     writeup or a bracket-scoped take lands, which is exactly when the prose should be
     edited. Reds only when prose and data disagree; the fix is the prose. */
  /* Only meaningful while a PTR cycle is OPEN. expertRead filters takes on
     PHASES.ptr.marker, so the moment the flip sets `ptr: null` it returns null for all 40
     specs and the computed gap set becomes the whole roster — the prose would read "zero"
     against a computed 40 and this would red the flip commit for no reason. Caught in the
     08-15 flip simulation, which is the SECOND time a test of mine needed this guard; the
     rule is that anything reading the take lane must gate on PHASES.ptr, the same way the
     pre-staged flip patch gates every other take-lane assertion. */
  const { expertRead, PHASES } = await import("../src/render.mjs");
  if (!PHASES.ptr) return; // cycle closed: no take-era to scope against
  const takes = JSON.parse(
    await readFile(path.join(ROOT, "data/creator-takes.json"), "utf8"),
  ).takes ?? [];

  const gaps = bracket => specs.filter(s => !expertRead(s, takes, bracket))
    .map(s => `${s.spec} ${s.class}`);
  const noWriteup = specs.filter(s => !s.ptr).map(s => `${s.spec} ${s.class}`);
  const noRaid = gaps("raid");

  /* \s+ rather than a literal space throughout: CLAUDE.md is hard-wrapped, so any of these
     phrases can straddle a line break — the first draft of this test failed for exactly that
     reason, which is the claim() helper doing its job rather than passing vacuously. */
  const writeupClaim = claim(/\*\*(one|zero|two|three|\d+)\*\*\s+spec[s]?\s+(?:has|have)\s+no\s+writeup/, "writeup-coverage");
  const raidClaim = claim(/\*\*(one|zero|two|three|\d+)\*\*\s+spec[s]?\s+(?:has|have)\s+no\s+RAID-scoped\s+(?:take|one)/, "raid-coverage");
  const word = { zero: 0, one: 1, two: 2, three: 3 };
  const num = m => (word[m] !== undefined ? word[m] : Number(m));
  const stated = t => num((t.text.match(/\*\*(one|zero|two|three|\d+)\*\*/) ?? [])[1]);

  assert.equal(stated(writeupClaim), noWriteup.length,
    `CLAUDE.md:${writeupClaim.line} says "${writeupClaim.text}" but ${noWriteup.length} spec(s) have no ptr writeup: ${noWriteup.join(", ") || "(none)"}`);
  assert.equal(stated(raidClaim), noRaid.length,
    `CLAUDE.md:${raidClaim.line} says "${raidClaim.text}" but ${noRaid.length} spec(s) have no raid-scoped take: ${noRaid.join(", ") || "(none)"}`);

  /* If the prose NAMES a spec as the raid gap, it must actually be one. This is the half
     that would have caught a97e260 on its own: a count can be corrected while a stale NAME
     survives in the same sentence. Silent when the prose names nobody, which is the correct
     shape once the gap set is empty. */
  const namedAsRaidGap = /no RAID-scoped[^.]*?\(\*\*([^*]+)\*\*\)/.exec(claudeMd);
  if (namedAsRaidGap) {
    assert.ok(noRaid.includes(namedAsRaidGap[1].trim()),
      `CLAUDE.md names "${namedAsRaidGap[1].trim()}" as the raid-scoped gap, but the computed gap set is: ${noRaid.join(", ") || "(empty)"}`);
  }
});
