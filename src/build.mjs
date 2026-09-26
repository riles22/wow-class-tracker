/* Build: data/*.json + src/template.html → dist/index.html
   The application remains self-contained; companion icons give shortcut launchers a
   fetchable image while the inline SVG keeps a standalone file's tab icon working. */

import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "./validate.mjs";
import { buildPayload, publicationPayload, PHASES } from "./render.mjs";
import { renderSeasonArchive } from "./render-season-archive.mjs";
import { loadSnapshots } from "./report-card.mjs";
import { createForecastReport, renderForecastReport } from "./render-forecast-report.mjs";
import { esc, inlineScripts, scriptTagCount } from "./html-safety.mjs";
import { leaderboardPartitions } from "./wcl-live.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ICON_ASSETS = ["favicon-192.png", "apple-touch-icon.png"];

/* ERA TOKENS (2026-08-11, docs/era-prose-scope.md item 1). The static masthead/footer
   prose used to hardcode "12.1 PTR" and "12.0.7 / Season 1" — era literals, which are
   DATA, in a template CLAUDE.md rule 4 says holds none. Substituting them at build time
   from PHASES means the 22:00 UTC launch flip is one edit to `ptr.label` and the 08-18
   season flip needs no template edit at all. Client-side JS prose reads PHASE directly;
   these tokens exist for the static HTML that renders before boot.
   A pure function of the phases object (2026-09-25) so a test can hand it a launch-state
   fixture instead of editing the real PHASES. */
export function eraTokensFor(phases) {
  const seasonName = s => `Season ${phases.seasonOrder.indexOf(s) + 1}`;
  /* The PATCH a visitor is on, as opposed to the SEASON the data describes. A mid-season
     patch (PHASES.livePatch, e.g. 12.1.5 inside Season 2) moves only the three surfaces
     that name the patch: the chip, its phone form and the "Live:" stamp. The baseline
     names the consensus season and stays on liveLabel, as does every client-side data
     label (the payload never carries livePatch). An open PTR cycle still wins. */
  const eraDisplay = phases.ptr ? phases.ptr.label : (phases.livePatch?.label ?? phases.liveLabel);
  return {
    // masthead chip: "12.1 PTR — CURSE OF ULA'TEK" while a cycle's PTR was open, "12.1 — …"
    // off liveLabel once the ptr lane sunset, and the in-season patch once livePatch is set.
    __ERA_CHIP__: `${eraDisplay} — ${phases.patchName.toUpperCase()}`,
    // the phone form of the same chip: the era without the patch name, which is 192px wide
    // and forced its own row in the compressed bar (2026-08-22)
    __ERA_SHORT__: eraDisplay,
    __ERA_BASELINE__: `${phases.liveLabel} / ${seasonName(phases.liveSeason)}`,
    // static fallback only — boot overwrites it from PHASE.ptr.label (template ~:1239)
    __ERA_PTR_BTN__: phases.ptr?.label ?? "",
    // "build feed" is PTR vocabulary. Between cycles the same list is mostly live
    // hotfixes and class-tuning posts, so it is a patch feed (audit 2026-08-22). Named for
    // the SEASON since 2026-09-25: within a season the list spans more than one patch
    // (12.1, then 12.1.5), so a patch label would misattribute half of it.
    __ERA_FEED_HEADING__: phases.ptr ? `${eraDisplay} build feed` : `${seasonName(phases.liveSeason)} patch feed`,
    // __ERA_FOOTCOVER__ retired 2026-08-18: the footer identity block it fed was
    // removed at Riley's request; the masthead chip + baseline carry the same era info.
    __ERA_LIVE_LABEL__: phases.liveLabel,
    // the masthead stamp: which patch this tracker is ABOUT and whether it has shipped.
    // The label itself is the tell — it carries " PTR" only while the patch is on the PTR.
    __ERA_TRACKED_STAMP__: phases.ptr
      ? (phases.ptr.label.includes("PTR")
        ? `<b>PTR:</b> ${phases.ptr.label.replace(/\s*PTR$/, "")} “${phases.patchName}”`
        : `<b>Live:</b> ${phases.ptr.label} “${phases.patchName}”`)
      : `<b>Live:</b> ${eraDisplay} “${phases.patchName}”`,
  };
}

export async function build(root = ROOT) {
  const data = await loadData(root);
  const errors = validateData(data, { fullRoster: true });
  if (errors.length) {
    throw new Error("Data validation failed:\n" + errors.map(e => "  - " + e).join("\n"));
  }

  const template = await readFile(path.join(root, "src", "template.html"), "utf8");
  if (!template.includes("__DATA_JSON__")) {
    throw new Error("src/template.html is missing the __DATA_JSON__ placeholder");
  }

  const payload = buildPayload(data);
  // Report checkpoints outlive loadData's rolling 120-snapshot timeline window.
  const forecastReport = createForecastReport({ ...data,
    historySnapshots: data.frozenForecast ? await loadSnapshots(root) : [] });
  if (forecastReport?.summary) payload.meta.forecastReport = forecastReport.summary;
  // The drawer names a leaderboard's WCL partition ("12.1") instead of its bare id. Only
  // reviewed partitions have names; any other id renders as its number.
  payload.meta.wclPartitions = leaderboardPartitions();
  const forecastReportHTML = renderForecastReport(forecastReport);
  // Escape "<" so the payload can never terminate the surrounding <script> block.
  const json = JSON.stringify(publicationPayload(payload)).replace(/</g, "\\u003c");
  let html = template.replace("__DATA_JSON__", () => json);

  for (const [token, value] of Object.entries(eraTokensFor(PHASES))) {
    if (!html.includes(token)) throw new Error(`src/template.html is missing the ${token} placeholder`);
    html = html.replaceAll(token, value);
  }

  /* SEASON ARCHIVES (2026-08-12, Riley — the S1 historical record). Each
     data/season-archive/<season>.json (written once by src/freeze-season-archive.mjs,
     Gate-0 immutable) becomes its own static page at dist/<season>.html, and the footer
     gains one "Past seasons" line linking them. Absent directory → no pages, no link,
     and the token renders empty — which is every build until the first freeze, and every
     fixture root the tests synthesize. */
  const archivePages = [];
  let archiveLinks = "";
  try {
    const archiveDir = path.join(root, "data", "season-archive");
    const archiveFiles = (await readdir(archiveDir)).filter(f => /^s\d+\.json$/.test(f)).sort();
    const links = [];
    for (const file of archiveFiles) {
      const archive = JSON.parse(await readFile(path.join(archiveDir, file), "utf8"));
      const page = await renderSeasonArchive(archive, { root });
      archivePages.push({ name: file.replace(/\.json$/, ".html"), page });
      links.push(`<a href="${esc(archive.season)}.html">${esc(archive.seasonName)} (${esc(archive.label)}) — final standings</a>`);
    }
    if (links.length) {
      archiveLinks = `<p class="fine" style="margin-top:10px">Past seasons: ${links.join(" · ")} <span style="opacity:.75">(frozen records — no longer updated)</span></p>`;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  if (!html.includes("__ARCHIVE_LINKS__")) throw new Error("src/template.html is missing the __ARCHIVE_LINKS__ placeholder");
  html = html.replaceAll("__ARCHIVE_LINKS__", () => archiveLinks);
  // Normalize to LF: the HTML parser normalizes CRLF→LF before the browser hashes inline
  // scripts (a CRLF artifact from a Windows checkout would make the CSP hash unmatchable),
  // and it keeps local (Windows) and CI (Linux) builds byte-identical.
  html = html.replace(/\r\n?/g, "\n");

  // Content-Security-Policy, hashed at build time so only the exact inline script(s) this
  // build produced can execute. Style stays 'unsafe-inline' (the page uses inline style
  // attributes throughout); fonts are the only external origin. Only the script blocks the
  // template authored are hashed: hashing every <script> in the output would also bless one
  // smuggled in by poisoned data that slipped past validation + esc(), so the build refuses
  // an output with more script start tags, in any case or attribute form, than the template
  // has (CodeQL triage 2026-09-22; see src/html-safety.mjs for why this is regex-free).
  const scripts = inlineScripts(html);
  if (scriptTagCount(html) !== scriptTagCount(template) || scripts.length !== scriptTagCount(html)) {
    throw new Error(`dist/index.html has ${scriptTagCount(html)} script start tag(s) and ${scripts.length} bare inline ` +
      `script block(s), but src/template.html authors ${scriptTagCount(template)}; refusing to hash an unexpected script`);
  }
  const scriptHashes = scripts
    .map(body => "'sha256-" + createHash("sha256").update(body, "utf8").digest("base64") + "'");
  // The brand mark has an inline data: fallback plus same-origin PNGs for shortcut and
  // touch launchers. Network images remain refused; the masthead copy is inline SVG DOM.
  const csp = `default-src 'none'; script-src ${scriptHashes.join(" ")}; ` +
    "style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; " +
    "img-src 'self' data:; base-uri 'none'; form-action 'none'";
  html = html.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">`);

  await mkdir(path.join(root, "dist"), { recursive: true });
  const outPath = path.join(root, "dist", "index.html");
  await writeFile(outPath, html);
  if (forecastReportHTML) await writeFile(path.join(root, "dist", "forecast-report.html"), forecastReportHTML);
  else await rm(path.join(root, "dist", "forecast-report.html"), { force: true });
  await Promise.all(ICON_ASSETS.map(async name => {
    const icon = await readFile(path.join(root, "src", "assets", name));
    await writeFile(path.join(root, "dist", name), icon);
  }));
  // The gearing subproject builds its own self-contained page (gearing/README.md);
  // publishing means copying that artifact alongside index.html so Pages serves it at
  // /gearing.html. Copy-if-present: a checkout without gearing/ still builds the tracker.
  try {
    const gearing = await readFile(path.join(root, "gearing", "wow-s2-gearing.html"));
    await writeFile(path.join(root, "dist", "gearing.html"), gearing);
  } catch (error) {
    /* ENOENT only — a checkout without gearing/ still builds the tracker. Any OTHER error
       (unreadable, partial write, a directory in its place) must be LOUD: dist/gearing.html is
       committed, so swallowing it would leave the previous build's page in the tree while the
       masthead tab links to it unconditionally — a silently stale second published page with
       nothing anywhere reporting it. Same discipline the season-archive read above already
       uses. (audit 2026-08-14) */
    if (error?.code !== "ENOENT") throw error;
  }
  // Season-archive pages, regenerated from their frozen records every build.
  for (const { name, page } of archivePages) {
    await writeFile(path.join(root, "dist", name), page);
  }
  return {
    outPath,
    specCount: payload.meta.specCount,
    trackedCount: payload.meta.trackedCount,
    bytes: Buffer.byteLength(html)
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const result = await build();
    console.log(`✓ built dist/index.html — ${result.specCount} specs, ${result.trackedCount} PTR-tracked, ${(result.bytes / 1024).toFixed(1)} KB`);
  } catch (error) {
    console.error("✗ " + error.message);
    process.exit(1);
  }
}
