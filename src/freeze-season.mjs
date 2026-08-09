/* Freeze each tier-list source's FINAL letters about the live season.

   WHY THIS EXISTS. `sourceSeasonOk` drops an outlet from the consensus the moment its
   pages stop describing the season we are running — correct, because averaging a 12.0.7
   opinion with a 12.1 opinion is the one lie that column must never tell. But the drop has
   two costs that are not about any spec:
     · the mean recomposes, and the ▲▼ engine narrates a registry decision as spec movement
       (measured: 16 cells the night Wowhead flipped to Season 2, the largest on record);
     · if every outlet flips before the phase flip, the column blanks entirely (measured on
       the committed registry: 80 of 80 cells null).
   So we keep the last letters that outlet DID publish about this season, tagged `frozen`
   so no surface can imply it re-rated anything. Measured staleness cost at Wowhead's own
   observed rate of Season-1 change: 0.24 letters of 80 over nine days.

   WHY IT IS A SCRIPT AND NOT A HAND EDIT. The freeze point is DERIVED — the newest commit
   whose own `data/sources.json` still verifies that page at the live season — so it cannot
   drift with whoever runs it, and the record names the commit it came from. It is
   append-only and idempotent: an existing (season, source, bracket) record is never
   rewritten, because the whole point is that it is the last word.

   Runs in the publish job between Gate 0 and Gate 1, where the checkout has full history
   (the refresh job is fetch-depth 1, which is why this cannot live agent-side), and as a
   mandatory pre-snapshot step in a local run. */

import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PHASES, isLiveEra, sourceSeasonOk } from "./normalize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ARCHIVE = "data/season-final.json";

/* How far back to look for a season-verified commit. The answer is normally 1-3 commits
   (an outlet flips, we freeze the same night), so this bound only ever fires on a genuine
   anomaly — a source that has been mislabelled for months, which must be a hard error
   rather than a silent "no letters". */
const MAX_WALK = 500;

const git = (args, cwd) =>
  execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const gitShow = (sha, file, cwd) => {
  try { return git(["show", `${sha}:${file}`], cwd); }
  catch { return null; }   // file absent at that commit
};

/* The newest commit whose data/sources.json still describes `liveSeason` for this
   source+bracket. Returns null when HEAD itself still does — i.e. nothing to freeze. */
export function lastSeasonVerifiedCommit(sourceId, bracket, { cwd = ROOT, liveSeason = PHASES.liveSeason, max = MAX_WALK } = {}) {
  const shas = git(["rev-list", `--max-count=${max}`, "HEAD"], cwd).trim().split("\n").filter(Boolean);
  for (const sha of shas) {
    const raw = gitShow(sha, "data/sources.json", cwd);
    if (!raw) continue;
    let registry;
    try { registry = JSON.parse(raw); } catch { continue; }
    const source = registry.find(s => s.id === sourceId);
    if (!source) continue;
    if (sourceSeasonOk(source, bracket, liveSeason)) return { sha, source };
  }
  throw new Error(
    `freeze-season: no commit in the last ${max} still verifies "${sourceId}" bracket "${bracket}" at season "${liveSeason}". ` +
    `Refusing to guess — widen the walk or confirm this source ever described that season.`);
}

const lettersAt = (sha, sourceId, bracket, cwd) => {
  const raw = gitShow(sha, "data/specs.json", cwd);
  if (!raw) throw new Error(`freeze-season: data/specs.json missing at ${sha}`);
  const letters = {};
  for (const spec of JSON.parse(raw)) {
    const tier = spec.ratings?.[bracket]?.[sourceId];
    if (tier !== undefined) letters[`${spec.class}|${spec.spec}`] = tier;
  }
  return letters;
};

const pagesFor = (source, bracket) => (source.pages ?? []).filter(p => p.bracket === bracket);
const rangeOf = (pages, key) => {
  const vals = pages.map(p => p[key]).filter(Boolean).sort();
  return vals.length ? { first: vals[0], last: vals.at(-1) } : null;
};

export async function freezeSeason(root = ROOT, { liveSeason = PHASES.liveSeason, today = new Date().toISOString().slice(0, 10) } = {}) {
  const registry = JSON.parse(await readFile(path.join(root, "data/sources.json"), "utf8"));
  const archivePath = path.join(root, ARCHIVE);
  let archive = {};
  try { archive = JSON.parse(await readFile(archivePath, "utf8")); } catch { /* first run */ }
  archive[liveSeason] ??= {};

  const added = [], kept = [], live = [];
  for (const source of registry) {
    if (source.kind !== "tier-list" || !isLiveEra(source)) continue;
    for (const bracket of [...new Set((source.pages ?? []).map(p => p.bracket))].filter(Boolean)) {
      if (sourceSeasonOk(source, bracket, liveSeason)) { live.push(`${source.id}/${bracket}`); continue; }
      if (archive[liveSeason]?.[source.id]?.[bracket]) { kept.push(`${source.id}/${bracket}`); continue; }

      const { sha, source: atFreeze } = lastSeasonVerifiedCommit(source.id, bracket, { cwd: root, liveSeason });
      const letters = lettersAt(sha, source.id, bracket, root);
      if (!Object.keys(letters).length) {
        throw new Error(`freeze-season: ${source.id}/${bracket} verified season "${liveSeason}" at ${sha} but published no letters there — refusing to write an empty record`);
      }
      const pages = pagesFor(atFreeze, bracket);
      archive[liveSeason][source.id] ??= {};
      archive[liveSeason][source.id][bracket] = {
        frozenAt: today,
        fromCommit: sha,
        lastSeasonVerifiedSnapshot: rangeOf(pages, "snapshot")?.last ?? null,
        publishedRange: rangeOf(pages, "published"),
        letters
      };
      added.push({ source: source.id, bracket, sha, letters: Object.keys(letters).length });
    }
  }

  // Stable key order so a re-run is a no-op diff.
  const sorted = {};
  for (const season of Object.keys(archive).sort()) {
    sorted[season] = {};
    for (const id of Object.keys(archive[season]).sort()) {
      sorted[season][id] = {};
      for (const bracket of Object.keys(archive[season][id]).sort()) sorted[season][id][bracket] = archive[season][id][bracket];
    }
  }
  await writeFile(archivePath, JSON.stringify(sorted, null, 2) + "\n");
  return { added, kept, live, archive: sorted };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("freeze-season.mjs")) {
  const result = await freezeSeason();
  for (const a of result.added) console.log(`✓ froze ${a.source}/${a.bracket} — ${a.letters} letters from ${a.sha.slice(0, 7)}`);
  for (const k of result.kept) console.log(`· ${k} already frozen (append-only, left alone)`);
  console.log(`${result.live.length} source/bracket pairs still describe the live season — nothing to freeze there.`);
}
