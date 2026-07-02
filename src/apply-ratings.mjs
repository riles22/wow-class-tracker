/* Merge a fetched-ratings file into data/specs.json.
   Usage: node src/apply-ratings.mjs <ratings.json>

   The ratings file is an array of:
     { "class": "Rogue", "spec": "Outlaw", "bracket": "raid"|"mplus",
       "source": "<source id>", "tier": "S"|"A"|... }
   Matching is exact on class + spec; anything unmatched is reported and
   nothing is written unless every row matched a known spec. */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "./validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function applyRatings(ratingsPath, root = ROOT) {
  const rows = JSON.parse(await readFile(ratingsPath, "utf8"));
  const data = await loadData(root);

  const byKey = new Map(data.specs.map(spec => [`${spec.class}|${spec.spec}`, spec]));
  const unmatched = [];
  let applied = 0;

  for (const row of rows) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) {
      unmatched.push(`${row.class} / ${row.spec} (${row.source} ${row.bracket})`);
      continue;
    }
    spec.ratings ??= {};
    spec.ratings[row.bracket] ??= {};
    spec.ratings[row.bracket][row.source] = row.tier;
    applied++;
  }

  if (unmatched.length) {
    throw new Error(
      `${unmatched.length} row(s) did not match any spec — nothing written:\n` +
      unmatched.map(u => "  - " + u).join("\n")
    );
  }

  const errors = validateData(data);
  if (errors.length) {
    throw new Error("Merged data failed validation — nothing written:\n" + errors.map(e => "  - " + e).join("\n"));
  }

  await writeFile(path.join(root, "data", "specs.json"), JSON.stringify(data.specs, null, 2) + "\n");
  return { applied, specs: data.specs.length };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const ratingsPath = process.argv[2];
  if (!ratingsPath) {
    console.error("Usage: node src/apply-ratings.mjs <ratings.json>");
    process.exit(1);
  }
  try {
    const result = await applyRatings(path.resolve(ratingsPath));
    console.log(`✓ applied ${result.applied} rating(s) across ${result.specs} specs → data/specs.json`);
  } catch (error) {
    console.error("✗ " + error.message);
    process.exit(1);
  }
}
