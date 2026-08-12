/* Freeze the tracker's FINAL published picture of the live season into a permanent,
   render-ready archive record — the data behind the visitor-facing "Season N final
   standings" page (dist/<season>.html).

   WHY THIS EXISTS. At the season flip every Season-1 surface disappears by design: the
   consensus recomposes onto S2-verified sources, the Era toggle loses its 12.0.7
   position, and the frozen consensus lane goes cold (its lookup is keyed by the NEW
   liveSeason). All of that is correct for the live page — but it leaves the finished
   season readable only in raw JSON and git history. This record is the one owner-run
   snapshot that keeps a human-readable final standing on the site (Riley, 2026-08-12).

   WHAT IT CAPTURES: exactly what the site publishes on the day it runs — the same
   `decorateSpecs` consensus the built page renders, INCLUDING the frozen lane, so an
   outlet that flipped early contributes its last Season-1 letters with the frozen tag
   preserved. Sources that are behind/split (excluded from the mean) are recorded as
   excluded, not silently dropped.

   WHEN IT RUNS: once, in flip week, BEFORE the flip commit touches PHASES — the script
   refuses any season that is not the tree's current liveSeason, so running it after the
   flip errors instead of archiving a season that never happened. It is append-only:
   an existing archive file is never overwritten (--force exists for a same-week redo
   before the flip lands, e.g. after one more data refresh).

   The output is Gate-0 immutable (data/season-archive/), like season-final.json and
   data/forecasts/: agents can never write history. */

import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadData } from "./validate.mjs";
import { decorateSpecs, CONSENSUS_VERSION } from "./render.mjs";
import { PHASES, isLiveEra, sourceSeasonOk, seasonRank } from "./normalize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ARCHIVE_DIR = path.join("data", "season-archive");

const BRACKETS = ["raid", "mplus"];

/* Per-bracket lane of a live-era tier-list source at freeze time. Mirrors the exact
   branch consensusFor takes, so the archive's provenance can never disagree with the
   letters it stores alongside. */
const laneOf = (source, bracket, season, seasonFinal) => {
  if (sourceSeasonOk(source, bracket, season)) return { lane: "live" };
  const rec = seasonFinal?.[season]?.[source.id]?.[bracket];
  if (rec) return { lane: "frozen", frozenAt: rec.frozenAt ?? null, fromCommit: rec.fromCommit ?? null };
  return { lane: "excluded" };   // behind or mid-rebuild: out of the mean, honestly
};

export async function freezeSeasonArchive(root = ROOT, {
  season = PHASES.liveSeason,
  out = null,
  force = false,
  today = new Date().toISOString().slice(0, 10),
} = {}) {
  if (season !== PHASES.liveSeason) {
    throw new Error(
      `freeze-season-archive: season "${season}" is not the tree's current liveSeason ` +
      `("${PHASES.liveSeason}"). The archive freezes the season the tracker currently ` +
      `describes — run this BEFORE the flip commit, not after.`);
  }
  if (seasonRank(season) == null) {
    throw new Error(`freeze-season-archive: unknown season "${season}" — not in PHASES.seasonOrder`);
  }

  const outPath = out ?? path.join(root, ARCHIVE_DIR, `${season}.json`);
  if (!force) {
    const exists = await access(outPath).then(() => true, () => false);
    if (exists) {
      throw new Error(`freeze-season-archive: ${outPath} already exists — the archive is a final record. Use --force only for a pre-flip redo.`);
    }
  }

  const data = await loadData(root);
  const decorated = decorateSpecs(data.specs, data.sources, data.scales, data.seasonFinal);

  const tierLists = data.sources.filter(s => s.kind === "tier-list" && isLiveEra(s));
  const sources = tierLists.map(s => {
    const entry = { id: s.id, name: s.name };
    for (const bracket of BRACKETS) {
      const pages = (s.pages ?? []).filter(p => p.bracket === bracket);
      entry[bracket] = {
        ...laneOf(s, bracket, season, data.seasonFinal),
        snapshot: pages.map(p => p.snapshot).filter(Boolean).sort().at(-1) ?? null,
      };
    }
    return entry;
  });

  const brackets = {};
  for (const bracket of BRACKETS) {
    const rows = decorated.map(spec => {
      const c = spec.consensus?.[bracket] ?? null;
      return {
        class: spec.class, spec: spec.spec, role: spec.role,
        tier: c?.tier ?? null, score: c?.score ?? null,
        spread: c?.spread ?? null, diverges: c?.diverges ?? false,
        perSource: c?.perSource ?? [],
      };
    });
    // Score-ranked, unrated last; ties and the tail stay in roster order for stability.
    rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) ||
      a.class.localeCompare(b.class) || a.spec.localeCompare(b.spec));
    brackets[bracket] = rows;
  }

  const gitSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const archive = {
    kind: "season-archive",
    season,
    seasonName: `Season ${seasonRank(season) + 1}`,
    label: PHASES.seasonLabels[season] ?? season,
    frozenAt: today,
    gitSha,
    consensusVersion: CONSENSUS_VERSION,
    bands: data.scales.consensus.bands,
    spreadThreshold: data.scales.consensus.spreadThreshold,
    sources,
    brackets,
  };

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(archive, null, 2) + "\n");
  return { archive, outPath };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const flag = name => { const i = args.indexOf(name); return i === -1 ? null : (args[i + 1] ?? null); };
  try {
    const { archive, outPath } = await freezeSeasonArchive(ROOT, {
      season: flag("--season") ?? PHASES.liveSeason,
      out: flag("--out"),
      force: args.includes("--force"),
    });
    const n = Object.values(archive.brackets).reduce((s, rows) => s + rows.filter(r => r.tier).length, 0);
    console.log(`✓ froze ${archive.seasonName} (${archive.label}) → ${outPath} — ${n} rated cells across ${Object.keys(archive.brackets).length} brackets, from ${archive.gitSha.slice(0, 7)}`);
    console.log(`  next \`npm run build\` emits dist/${archive.season}.html and the footer link.`);
  } catch (error) {
    console.error("✗ " + error.message);
    process.exit(1);
  }
}
