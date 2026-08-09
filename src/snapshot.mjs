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
    ...(frozen ? { frozen: true } : {}),
    specs: snapshotStateOf(payload.specs) };
  const dir = path.join(root, "data", "history");
  await mkdir(dir, { recursive: true });
  const outPath = path.join(dir, `${date}.json`);
  await writeFile(outPath, JSON.stringify(snap, null, 2) + "\n");

  /* The IMMUTABLE FORECAST ARTIFACT (2026-08-03, external audit). The history snapshot
     above is deliberately slim — movement and timelines read it daily. This file is the
     opposite: written once, at freeze, with everything a post-launch audit needs to
     re-derive or dispute the grade — every cell's component values and eligibility flags
     (projection.parts), the exact code identity (git SHA + versions), a hash of the data
     that produced it, and each source's own snapshot date. Nothing downstream reads it on
     a schedule; its only consumer is the report card and whoever argues with it. */
  let frozenPath = null;
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
    await writeFile(frozenPath, JSON.stringify(artifact, null, 2) + "\n");
  }
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
