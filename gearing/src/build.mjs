// Bake data/*.json into one self-contained HTML file.
//
//   node src/build.mjs   ->   wow-s2-gearing.html
//
// The app markup lives in src/app.template.html; this only injects the data blob
// so the output works offline with no external requests.
//
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { absentFileStub, validateData } from "./validate-data.mjs";
import { injectGuideLib } from "./inline-guides.mjs";
import { SEASON, dataPredatesSeason, seasonHasOpened, stalenessNotice } from "./season.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const readData = async (f) => JSON.parse(await readFile(join(ROOT, "data", f), "utf8"));

/* ---------- the season vocabulary, injected into the page (Phase E, G23) ----------

   WHY INJECT AT ALL. The staleness banner has to compare the harvest date against the
   READER's date, so the rule runs in the browser; and src/season.mjs owns that rule for the
   harvesters and the validator already. The alternative — a second copy of the same three
   lines inside app.template.html — is exactly the drift src/inline-guides.mjs exists to make
   impossible for the guide contract. So the page gets the real thing.

   WHY toString() RATHER THAN A SOURCE REWRITE. inline-guides.mjs strips `export ` off a whole
   module and wraps it; that is the right shape for a 483-line library the page uses wholesale.
   Here the page needs three functions and one object, and serializing the LIVE bindings means
   what ships is definitionally the code this build imported — there is no regex between the
   module and the artifact that could mis-parse it, and no list of names to keep in step.

   WHAT IT CANNOT SURVIVE, and how that is caught: toString() carries a function's source but
   not its closure, so a season.mjs function that grew a reference to some new module-scope
   helper would ship as a ReferenceError in a browser with nothing on screen to say so. The
   probe below evaluates the exact block about to be written and makes it answer every state
   stalenessNotice has, so that failure is a red build here instead. */
const SEASON_MARKER = "//__SEASON__";
const SEASON_FUNCTIONS = [seasonHasOpened, dataPredatesSeason, stalenessNotice];
/* Pre-open, post-open-with-stale-data, post-open-with-fresh-data, and never-harvested — one
   probe per branch of the rule, which is what makes a dropped closure reference certain to
   show up rather than likely to. */
const SEASON_PROBES = [["2026-08-02", "2026-08-13"], ["2026-08-02", "2026-08-19"],
  ["2026-08-19", "2026-08-25"], [null, "2026-08-19"], ["2026-08-02", null]];

function injectSeason(html) {
  if (!html.includes(SEASON_MARKER)) {
    throw new Error(`template is missing the ${SEASON_MARKER} marker — the page would build `
      + "with its season facts and staleness banner silently absent (they are typeof-guarded "
      + "so three test harnesses can boot the raw template; that guard is not a shipping state)");
  }
  const block = [
    // The JSON gets the same </script> defusing as the data blob: it lands inside the page's
    // one inline <script>, where a literal closing tag would end the script early.
    `const SEASON = ${JSON.stringify(SEASON).replace(/<\/script>/gi, "<\\/script>")};`,
    ...SEASON_FUNCTIONS.map((fn) => `const ${fn.name} = ${fn.toString()};`),
  ].join("\n");

  const shipped = new Function(`${block}\nreturn { SEASON, stalenessNotice };`)();
  if (JSON.stringify(shipped.SEASON) !== JSON.stringify(SEASON)) {
    throw new Error("the injected SEASON does not round-trip src/season.mjs");
  }
  for (const [harvestedAt, today] of SEASON_PROBES) {
    const here = JSON.stringify(stalenessNotice(harvestedAt, today) ?? null);
    const there = JSON.stringify(shipped.stalenessNotice(harvestedAt, today) ?? null);
    if (here !== there) {
      throw new Error("the injected season block disagrees with src/season.mjs for "
        + `(harvestedAt=${harvestedAt}, today=${today}): ${there} vs ${here}. A function in `
        + "season.mjs probably gained a reference to a name that is not injected alongside it.");
    }
  }
  return html.replace(SEASON_MARKER, () => block);
}

/* The Phase-C guide layer. All three files ship PENDING and stay that way until the first
   post-flip harvest (docs/gearing-s2-scope.md, Phase B "machinery, not a harvest"), so this
   build must be correct with empty data and fill in when a harvest lands, with no code change.
   A MISSING file behaves exactly like a pending one: a checkout without a harvest still builds,
   and the page says the signal is absent rather than rendering an empty surface. Only ENOENT
   degrades — malformed JSON still fails the build red, because that is a broken harvest rather
   than an un-run one. */
const readPendable = async (file) => {
  try { return await readData(file); }
  catch (error) {
    if (error?.code !== "ENOENT") throw error;
    console.warn(`  (no data/${file} -- treating it as pending; run its harvester after the flip)`);
    return absentFileStub(file);
  }
};

const raid = await readData("raid-items.json");
const specs = await readData("specs.json");
const dungeons = await readData("dungeon-items.json");
const sheet = await readData("sheet-rewards.json");
const statOverrides = await readData("stat-priority-overrides.json");
const statBaseline = await readData("stat-priority-baseline.json");
const weaponProficiency = await readData("weapon-proficiency.json");
const itemEligibility = await readData("item-eligibility-overrides.json");
const tier = await readData("tier-items.json");
const catalyst = await readData("catalyst-rules.json");
const catalystAllocations = await readData("catalyst-stat-allocations.json");
const guidePicks = await readPendable("guide-picks.json");
const guidePriorities = await readPendable("guide-priorities.json");
const archonUsage = await readPendable("archon-usage.json");
let icons = { icons: {} };
try { icons = await readData("icons.json"); }
catch { console.warn("  (no data/icons.json -- run node src/harvest-icons.mjs for item icons)"); }
const template = await readFile(join(ROOT, "src", "app.template.html"), "utf8");

validateData({ raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency,
  itemEligibility, tier, catalyst, catalystAllocations, guidePicks, guidePriorities, archonUsage });

// </script> inside the JSON would close the host <script> tag early
const blob = JSON.stringify({ raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
  catalystAllocations, guidePicks, guidePriorities, archonUsage, icons: icons.icons })
  .replace(/<\/script>/gi, "<\\/script>");

if (!template.includes("__DATA__")) throw new Error("template is missing the __DATA__ placeholder");
// The shared guide contract is INJECTED from src/lib-guides.mjs, never copied into the
// template — one definition of the ordering rules, and drift is impossible rather than
// merely detected (src/inline-guides.mjs).
let out = await injectGuideLib(template, ROOT);
/* After the guide library, never before: injectGuideLib decides which of the library's exports
   to bind by scanning the template for their names, and season.mjs's own comments mention
   `resolveDropSource`. Injected first, that prose would read as a page reference. */
out = injectSeason(out);
out = out.replace("__DATA__", () => blob);

// Normalize to LF before hashing. The HTML parser normalizes CRLF->LF before the browser
// hashes an inline script, so a CRLF artifact from a Windows checkout would make the CSP
// hash unmatchable; it also keeps local and CI builds byte-identical.
out = out.replace(/\r\n?/g, "\n");

// Content-Security-Policy, hashed at build time so only the exact inline script this build
// produced can execute (parity with the tracker's build.mjs, 2026-08-07). This policy is
// STRICTER than the tracker's on purpose: that page loads webfonts from Google, whereas
// this one makes no network requests at all -- the fonts and every item icon are data:
// URIs -- so no external origin appears here and default-src stays 'none'.
// The template carries no inline event handlers and no <form>, so hash-only script-src
// and form-action 'none' hold. style-src needs 'unsafe-inline' for the <style> block and
// the inline style= attributes the renderer writes.
const appScripts = [...out.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const scriptHashes = appScripts
  .map((m) => "'sha256-" + createHash("sha256").update(m[1], "utf8").digest("base64") + "'");
// The <script id="data" type="application/json"> blob is not executable and is correctly
// skipped by the bare-<script> match above; exactly one app script should remain.
if (scriptHashes.length !== 1) {
  throw new Error(`expected exactly 1 inline app script to hash, found ${scriptHashes.length}`);
}

/* DID THE SUBSTITUTIONS ACTUALLY LAND, AND DOES THE RESULT PARSE (Phase E, 2026-08-13).
   Three placeholders now feed this one script, and each injector replaces the FIRST match of
   its token. Writing one of those tokens in a COMMENT above the real placeholder therefore
   captures the substitution and injects a library into the middle of a sentence — which is a
   syntax error a thousand lines away from anything that looks wrong, and until this check the
   build wrote it out and reported success. A residual token is the other half of the same
   accident: it means a placeholder never got substituted and the page dies at boot.
   `new Function` parses without executing, so this costs a millisecond and covers every
   template edit, not just the injected ones.
   Scoped to the APP SCRIPT rather than the whole document on purpose: harvested item text is
   arbitrary, and a document-wide search for these tokens would let a boss name red the build.
   The data blob has its own check below, which is stronger than a token search anyway. */
for (const token of ["__DATA__", "__LIB_GUIDES__", SEASON_MARKER]) {
  if (appScripts[0][1].includes(token)) {
    throw new Error(`the built page still contains ${token} — a placeholder was not substituted `
      + "(or a comment mentions one, which captures the substitution: see the note in "
      + "app.template.html's season section)");
  }
}
try { new Function(appScripts[0][1]); }
catch (error) {
  throw new Error(`the assembled inline script does not parse: ${error.message}`);
}
const dataScript = /<script id="data" type="application\/json">([\s\S]*?)<\/script>/.exec(out);
try { JSON.parse(dataScript[1]); }
catch (error) {
  throw new Error(`the embedded data blob is not valid JSON: ${error?.message ?? "no blob found"}`);
}
const csp = `default-src 'none'; script-src ${scriptHashes.join(" ")}; ` +
  "style-src 'unsafe-inline'; font-src data:; img-src data:; base-uri 'none'; form-action 'none'";
const withCsp = out.replace('<meta charset="utf-8">',
  `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">`);
if (withCsp === out) throw new Error("could not inject CSP: <meta charset=\"utf-8\"> not found");
out = withCsp;

await writeFile(join(ROOT, "wow-s2-gearing.html"), out, "utf8");

console.log(`wrote wow-s2-gearing.html  (${Math.round(out.length / 1024)} KB)`);
console.log(`  raid: ${raid.counts.gear} gear · ${raid.counts.withEffect} items with effects · ${raid.counts.tokens} tokens`);
console.log(`  m+:   ${dungeons.counts.gear} items across ${dungeons.counts.dungeonsHarvested}/${dungeons.counts.dungeonsInPool} dungeons`);
console.log(`  ${specs.counts.specs} specs · ${specs.counts.withPriority} with stat priority · ${specs.counts.withArmor} with armour type · ${specs.counts.withWeaponLoadouts} with weapon loadouts`);
console.log(`  ${tier.counts.items} direct tier items · catalyst rules ${catalyst.patchContext}`);

/* Say what the guide layer actually holds. A pending file reports pending AND WHY — a build log
   that printed "0 picks" for a lane nobody has harvested yet reads as breakage, and one that
   printed nothing at all would let a silently-emptied harvest ship unnoticed. */
const oneLine = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const rowsIn = (doc, key) => Object.values(doc.specs ?? {})
  .reduce((sum, entry) => sum + (entry?.[key]?.length ?? 0), 0);

function guideSummary(doc, key, noun) {
  if (doc.status !== "harvested")
    return `pending — ${oneLine(doc.pending?.reason) || "no reason recorded"}`;
  const sources = Object.keys(doc.sources ?? {}).sort().join(", ") || "no sources declared";
  return `harvested ${doc.harvestedAt} (${doc.season}) · ${Object.keys(doc.specs ?? {}).length} specs`
    + ` · ${rowsIn(doc, key)} ${noun} · ${sources}`;
}

console.log(`  guide picks:      ${guideSummary(guidePicks, "picks", "picks")}`);
console.log(`  guide priorities: ${guideSummary(guidePriorities, "builds", "builds")}`);
console.log(`  archon usage:     ${archonUsage.status === "harvested"
  ? `harvested ${archonUsage.harvestedAt} (${archonUsage.season}) · ${(archonUsage.specs ?? []).length} specs`
  : `pending — ${oneLine(archonUsage.pending?.reason) || "no reason recorded"}`}`);
