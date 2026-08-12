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
import { PHASES, isLiveEra, sourceSeasonOk, aheadSeasonFor, seasonRank } from "./normalize.mjs";

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

/* EXPLICITLY verified at `liveSeason`: every page of the bracket carries
   seasonVerified === liveSeason. Deliberately stricter than `sourceSeasonOk`, which is
   vacuously TRUE wherever the field is absent — "never checked" reads as current, which is
   the right call for the consensus but the wrong one for a freeze point. `seasonVerified`
   only entered the registry on 2026-08-05 (e65332a), so the loose test matches every commit
   before that date for every source; a walk using it lands on the commit that ADDED the
   field and lifts letters from a tree that never made the claim. Measured at liveSeason
   "s2": method/archon resolve to e65332a, whose sources.json holds zero seasonVerified
   entries. Requiring the explicit label makes the walk throw "Refusing to guess" instead —
   and the archive is append-only, so a wrong record there is permanent. */
const explicitlyVerifiedAt = (source, bracket, liveSeason) => {
  const pages = (source.pages ?? []).filter(p => p.bracket === bracket);
  return pages.length > 0 && pages.every(p => p.seasonVerified === liveSeason);
};

/* The newest commit whose data/sources.json explicitly verifies `liveSeason` for this
   source+bracket. Returns HEAD when HEAD itself still does — i.e. nothing to freeze. */
export function lastSeasonVerifiedCommit(sourceId, bracket, { cwd = ROOT, liveSeason = PHASES.liveSeason, max = MAX_WALK } = {}) {
  /* --first-parent: walk the MAINLINE only. rev-list orders by commit date across all
     parents, so merging a PR branch cut from an older master injects a recent-DATED
     commit carrying a stale data snapshot — measured 2026-08-12, when merging
     Dependabot #54 made this walk resolve icyveins/mplus to the bump commit (its base
     predated Icy Veins' s2 flip, so its sources.json still said s1) instead of the
     mainline freeze point. The freeze must lift letters from states the site actually
     published, and those live on first-parent master. */
  const shas = git(["rev-list", "--first-parent", `--max-count=${max}`, "HEAD"], cwd).trim().split("\n").filter(Boolean);
  for (const sha of shas) {
    const raw = gitShow(sha, "data/sources.json", cwd);
    if (!raw) continue;
    let registry;
    try { registry = JSON.parse(raw); } catch { continue; }
    const source = registry.find(s => s.id === sourceId);
    if (!source) continue;
    if (explicitlyVerifiedAt(source, bracket, liveSeason)) return { sha, source };
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

  const added = [], kept = [], live = [], behind = [], split = [];
  for (const source of registry) {
    if (source.kind !== "tier-list" || !isLiveEra(source)) continue;
    for (const bracket of [...new Set((source.pages ?? []).map(p => p.bracket))].filter(Boolean)) {
      if (sourceSeasonOk(source, bracket, liveSeason)) { live.push(`${source.id}/${bracket}`); continue; }
      /* Not describing the live season — and the REASON decides everything, because
         `sourceSeasonOk` is a bare inequality that is equally false in three different
         situations. Only the outlet that is LEAVING has final letters worth preserving.

         · AHEAD — every page has moved to a later season. Freeze: these are its last words
           about the season we are running.
         · SPLIT — the bracket's pages disagree, some already on the later season (an outlet
           mid-rebuild). `aheadSeasonFor` returns null here by design, because mixing two
           seasons in one FORECAST term is never allowed. But that is a different question
           from whether to preserve the outlet's last single-season letters, and the answer
           there is yes: consensusFor has already dropped it (sourceSeasonOk is false), so
           without a frozen record the mean silently recomposes. Measured on a staged Archon
           raid flip: 40 cells lose a contributor and 9 published letters move with no spec
           data change — the exact "registry decision narrated as spec movement" this lane
           exists to prevent.
         · BEHIND — every page is on an EARLIER season (a lagging outlet at a flip). Do NOT
           freeze: its newest letters are still its live opinion, and DECISION 1 already says
           the consensus should honestly shrink until it catches up. Freezing it resurrects
           stale letters permanently — measured at the 12.1 flip, method and archon would each
           gain raid+mplus records lifted from e65332a (a commit where no page carried
           `seasonVerified` at all): 159 letters, moving 36 of 80 consensus letters, into an
           append-only archive that can never be corrected.

         Splitting ahead from behind is the same fix `aheadSeasonFor` brought to the consensus
         and forecast lanes on 2026-08-09; freeze-season was written the same day and never
         consulted it. Keep the `aheadSeasonFor` call: its throw on a half-LABELLED bracket
         (some pages carrying seasonVerified, some not) is a guard we want to propagate. */
      const ahead = aheadSeasonFor(source, bracket, liveSeason);
      if (ahead == null) {
        const liveRank = seasonRank(liveSeason);
        const seasons = pagesFor(source, bracket).map(p => p.seasonVerified).filter(Boolean);
        const leaving = seasons.some(s => { const r = seasonRank(s); return r != null && liveRank != null && r > liveRank; });
        if (!leaving) { behind.push(`${source.id}/${bracket}`); continue; }
        split.push(`${source.id}/${bracket}`);
      }
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

  /* Stable key order so a re-run is a no-op diff. Empty season objects are dropped: the
     `archive[liveSeason] ??= {}` above creates one on every run, so at the flip an untouched
     archive would gain a bare `"s2": {}` and the publish notice — which reads the git diff —
     would announce a freeze that never happened. */
  const sorted = {};
  for (const season of Object.keys(archive).sort()) {
    if (!Object.keys(archive[season] ?? {}).length) continue;
    sorted[season] = {};
    for (const id of Object.keys(archive[season]).sort()) {
      sorted[season][id] = {};
      for (const bracket of Object.keys(archive[season][id]).sort()) sorted[season][id][bracket] = archive[season][id][bracket];
    }
  }
  /* Only touch the file when the archive actually changed. A no-op run that still rewrites
     it makes `git diff` claim a freeze happened on every nightly — and the publish job's
     notice reads that diff. */
  const body = JSON.stringify(sorted, null, 2) + "\n";
  const before = await readFile(archivePath, "utf8").catch(() => null);
  if (before !== body) await writeFile(archivePath, body);
  return { added, kept, live, behind, split, archive: sorted, wrote: before !== body };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("freeze-season.mjs")) {
  const result = await freezeSeason();
  for (const a of result.added) console.log(`✓ froze ${a.source}/${a.bracket} — ${a.letters} letters from ${a.sha.slice(0, 7)}`);
  for (const k of result.kept) console.log(`· ${k} already frozen (append-only, left alone)`);
  for (const s of result.split) console.log(`⚠ ${s} is MID-FLIP (pages split across seasons) — frozen so the consensus keeps its composition while it rebuilds`);
  for (const b of result.behind) console.log(`· ${b} is BEHIND the live season, not ahead — it stays out of the consensus until it catches up, and is deliberately NOT frozen`);
  console.log(`${result.live.length} source/bracket pairs still describe the live season — nothing to freeze there.`);
  if (!result.wrote) console.log("· archive unchanged — file not rewritten");
}
