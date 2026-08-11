/* Write a comparable-state snapshot to data/history/<date>.json.
   Run AFTER a refresh + build — the next build shows movement (tier ▲▼, rank deltas)
   against the latest snapshot on disk. Usage: node src/snapshot.mjs [YYYY-MM-DD] */

import { writeFile, mkdir, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadData } from "./validate.mjs";
import { buildPayload, snapshotStateOf, PROJECTION_VERSION, RANK_VERSION, CONSENSUS_VERSION, SNAPSHOT_PHASE } from "./render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function snapshot(root = ROOT, date = new Date().toISOString().slice(0, 10), { frozen = false } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`snapshot date must be YYYY-MM-DD, got "${date}"`);
  const payload = buildPayload(await loadData(root));

  /* CARRY AN EXISTING FREEZE DECLARATION FORWARD (2026-08-11).
     Snapshots are named by UTC date and rewritten in place, so every run on the same UTC
     day overwrites the last. That is fine for the state — it is a fresh read either way —
     but `frozen` is not state, it is a one-shot DECLARATION of which forecast the report
     card grades, and it was being silently dropped by the next writer.
     It actually happened: `--frozen` ran 2026-08-10 19:52 PT = 2026-08-11T02:52Z and wrote
     2026-08-11.json; that day's nightly (10:37Z) then overwrote the same path and the flag
     was gone from all 36 history files, with `launchPair` quietly falling back to inferring
     the freeze point from recency. The flag is cheap to preserve and impossible to
     reconstruct later, so preserve it.
     Deliberately NOT a blanket hard error on same-date rewrite: routine re-snapshots are
     legitimate (a local run after a nightly, a rebuild), and erroring on those would turn a
     publishable night red at the snapshot step for no data reason.

     But the flag is carried ONLY when the state is unchanged. Re-stamping `frozen: true`
     onto a freshly-read state would be worse than dropping it: the declaration would survive
     while silently pointing at a different forecast, and the report card would then grade
     post-launch data as the pre-launch answer with no "INFERRED" warning to give it away.
     When the state has moved we refuse the write instead — the daily state can be
     regenerated at any time, the one-shot declaration cannot, so the declaration wins. */
  const outPathEarly = path.join(root, "data", "history", `${date}.json`);
  const prior = await readFile(outPathEarly, "utf8").then(JSON.parse).catch(() => null);
  const nextState = snapshotStateOf(payload.specs);
  const stateMoved = prior != null && JSON.stringify(prior.specs) !== JSON.stringify(nextState);
  const carriedFrozen = prior?.frozen === true;
  if (carriedFrozen && stateMoved && !frozen) {
    throw new Error(
      `snapshot: data/history/${date}.json carries frozen: true — it is the declared pre-launch forecast the report card grades — ` +
      `and this run's state differs from it. Refusing to overwrite the declaration with a different forecast. ` +
      `Snapshot under a different date, or delete the declaration deliberately if the freeze is being redone.`);
  }
  if (carriedFrozen && !frozen) {
    console.warn(`! ${date}.json already carries frozen: true and the state is unchanged — preserving the freeze declaration`);
  }
  // snapshotStateOf is shared with the movement reader (render.mjs pickBaseline/movementFor)
  // so the stored key format can never drift from the lookup. projectionVersion pins which
  // formula produced the stored projections — the report card must never grade a v1
  // forecast against v2 semantics.
  // consensusVersion pins WHICH tier-list sources composed the stored consensus, so a
  // later registry change cannot be narrated as spec movement.
  /* `frozen` DECLARES this snapshot as the pre-launch forecast the report card grades
     (2026-08-03, external audit). It is separate from the phase flip on purpose: the flip
     says "12.1 is live", which is not the same event as "stop forecasting, this is our
     final answer", and one boolean cannot honestly encode both. Without it launchPair has
     to infer the freeze point from recency, so a late pre-launch refresh silently moves
     the forecast being graded. Set with `node src/snapshot.mjs --frozen`, once, on the
     last snapshot before 12.1 goes live. */
  const snap = { date, phase: SNAPSHOT_PHASE, projectionVersion: PROJECTION_VERSION,
    rankVersion: RANK_VERSION, consensusVersion: CONSENSUS_VERSION,
    ...(frozen || carriedFrozen ? { frozen: true } : {}),
    specs: nextState };
  const dir = path.join(root, "data", "history");
  await mkdir(dir, { recursive: true });
  const outPath = path.join(dir, `${date}.json`);

  /* The IMMUTABLE FORECAST ARTIFACT (2026-08-03, external audit). The history snapshot
     above is deliberately slim — movement and timelines read it daily. This file is the
     opposite: written once, at freeze, with everything a post-launch audit needs to
     re-derive or dispute the grade — every cell's component values and eligibility flags
     (projection.parts), the exact code identity (git SHA + versions), a hash of the data
     that produced it, and each source's own snapshot date. Nothing downstream reads it on
     a schedule; its only consumer is the report card and whoever argues with it. */
  let frozenPath = null, frozenBody = null;
  if (frozen) {
    const sha = (() => { try { return execSync("git rev-parse HEAD", { cwd: root }).toString().trim(); } catch { return null; } })();
    const dataDir = path.join(root, "data");
    const hash = createHash("sha256");
    for (const f of (await readdir(dataDir)).filter(f => f.endsWith(".json")).sort()) {
      hash.update(f); hash.update(await readFile(path.join(dataDir, f)));
    }
    const sources = JSON.parse(await readFile(path.join(dataDir, "sources.json"), "utf8"));
    const cells = {};
    for (const sp of payload.specs) {
      cells[`${sp.class}|${sp.spec}`] = {
        role: sp.role,
        raid: sp.projection?.raid ?? null,
        mplus: sp.projection?.mplus ?? null,
        /* The consensus this forecast was built on, cell by cell, INCLUDING which
           contributors were frozen (2026-08-09). `sourceDates` below records each source's
           NEWEST page snapshot, which for an outlet that has moved to the next season is
           the date it published the season we are NOT running — so on its own it states a
           provenance the letters do not have. Without this block a post-launch auditor
           cannot tell which sources composed the prior, nor that Wowhead contributed its
           final Season-1 letters rather than the Season-2 ones sitting in the same file. */
        consensus: Object.fromEntries(["raid", "mplus"].map(b => {
          const c = sp.consensus?.[b];
          return [b, c ? {
            tier: c.tier, score: c.score, spread: c.spread,
            sourceCount: c.perSource.length, frozenCount: c.frozenCount ?? 0,
            perSource: c.perSource.map(p => ({ source: p.source, tier: p.tier, score: p.score,
              lane: p.lane ?? "live", ...(p.frozenAsOf ? { frozenAsOf: p.frozenAsOf } : {}) }))
          } : null];
        })),
        outlook: sp.outlook ? { direction: sp.outlook.direction, source: sp.outlook.source ?? null,
          buffs: sp.outlook.buffs, nerfs: sp.outlook.nerfs } : null
      };
    }
    const artifact = {
      kind: "frozen-forecast", date, phase: SNAPSHOT_PHASE,
      projectionVersion: PROJECTION_VERSION, rankVersion: RANK_VERSION,
      consensusVersion: CONSENSUS_VERSION,
      gitSha: sha, dataSha256: hash.digest("hex"),
      /* Registry-level composition at freeze time: who was live, who was frozen, and what
         season each page actually described. The per-cell block above answers "what fed
         this letter"; this answers "what state was the registry in when we froze". */
      consensus: {
        liveSeason: payload.meta?.phases?.liveSeason ?? null,
        consensusVersion: CONSENSUS_VERSION,
        seasonFinal: payload.meta?.seasonFinal ?? null,
        sources: (sources ?? []).filter(x => x.kind === "tier-list").map(x => ({
          id: x.id, era: x.era ?? "live",
          brackets: Object.fromEntries([...new Set((x.pages ?? []).map(p => p.bracket))].filter(Boolean).map(b => {
            const pages = (x.pages ?? []).filter(p => p.bracket === b);
            return [b, {
              seasonVerified: [...new Set(pages.map(p => p.seasonVerified ?? null))],
              snapshot: pages.map(p => p.snapshot).filter(Boolean).sort().at(-1) ?? null,
              published: pages.map(p => p.published).filter(Boolean).sort()
            }];
          }))
        }))
      },
      sourceDates: Object.fromEntries((sources ?? [])
        .filter(x => x.pages?.length)
        .map(x => [x.id, x.pages.map(pg => pg.snapshot).sort().at(-1) ?? null])),
      cells
    };
    const fDir = path.join(root, "data", "forecasts");
    await mkdir(fDir, { recursive: true });
    frozenPath = path.join(fDir, `frozen-${date}.json`);
    frozenBody = JSON.stringify(artifact, null, 2) + "\n";
    /* The artifact is the record a post-launch audit re-derives the grade from, so a second
       `--frozen` over the same date must never silently redefine it.

       Compare on SUBSTANCE, not bytes. `gitSha` moves on any commit and `dataSha256` covers
       every data/*.json — including run-manifest.json, which every run rewrites — so a byte
       comparison would fire on benign re-runs and train the operator to ignore it. What makes
       two freezes the same forecast is the cells and the code identity that produced them.

       This check runs BEFORE the history file is written, further down, so a refusal is a
       genuine no-op on disk. Throwing after that write would clobber the very declaration the
       guard exists to protect — the exact failure this change set was written to repair. */
    const substanceOf = a => JSON.stringify({
      kind: a.kind, date: a.date, phase: a.phase,
      projectionVersion: a.projectionVersion, rankVersion: a.rankVersion,
      consensusVersion: a.consensusVersion, cells: a.cells });
    const existing = await readFile(frozenPath, "utf8").then(JSON.parse).catch(() => null);
    if (existing != null && substanceOf(existing) !== substanceOf(artifact)) {
      throw new Error(
        `snapshot --frozen: data/forecasts/frozen-${date}.json already exists and describes a DIFFERENT forecast. ` +
        `That file is the immutable record the report card grades — refusing to redefine it. ` +
        `Freeze under a different date, or delete it deliberately if the freeze is genuinely being redone.`);
    }
  }
  /* Both writes happen only after every guard above has passed, so a refused freeze leaves
     the disk exactly as it was. */
  await writeFile(outPath, JSON.stringify(snap, null, 2) + "\n");
  if (frozenPath) await writeFile(frozenPath, frozenBody);
  return { outPath, frozenPath, specs: Object.keys(snap.specs).length };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const frozen = process.argv.includes("--frozen");
    const dateArg = process.argv.slice(2).find(a => !a.startsWith("--"));
    const result = await snapshot(ROOT, dateArg || undefined, { frozen });
    console.log(`✓ snapshot → ${result.outPath} (${result.specs} specs)` +
      (frozen ? " — FROZEN: this is the forecast the report card will grade" : ""));
    if (result.frozenPath) console.log(`✓ immutable forecast artifact → ${result.frozenPath}`);
  } catch (error) {
    console.error("✗ " + error.message);
    process.exit(1);
  }
}
