/* Build: data/*.json + src/template.html → dist/index.html
   The application remains self-contained; companion icons give shortcut launchers a
   fetchable image while the inline SVG keeps a standalone file's tab icon working. */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "./validate.mjs";
import { buildPayload, PHASES } from "./render.mjs";
import { renderSeasonArchive } from "./render-season-archive.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ICON_ASSETS = ["favicon-192.png", "apple-touch-icon.png"];

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
  // Escape "<" so the payload can never terminate the surrounding <script> block.
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  let html = template.replace("__DATA_JSON__", () => json);

  /* ERA TOKENS (2026-08-11, docs/era-prose-scope.md item 1). The static masthead/footer
     prose used to hardcode "12.1 PTR" and "12.0.7 / Season 1" — era literals, which are
     DATA, in a template CLAUDE.md rule 4 says holds none. Substituting them at build time
     from PHASES means the 22:00 UTC launch flip is one edit to `ptr.label` and the 08-18
     season flip needs no template edit at all. Client-side JS prose reads PHASE directly;
     these tokens exist for the static HTML that renders before boot. */
  const seasonName = s => `Season ${PHASES.seasonOrder.indexOf(s) + 1}`;
  const eraDisplay = PHASES.ptr ? PHASES.ptr.label : PHASES.liveLabel;
  const eraTokens = {
    // masthead chip: "12.1 PTR — CURSE OF ULA'TEK" now, "12.1 — …" once the patch ships,
    // and identical off liveLabel after the ptr lane sunsets.
    __ERA_CHIP__: `${eraDisplay} — ${PHASES.patchName.toUpperCase()}`,
    __ERA_BASELINE__: `${PHASES.liveLabel} / ${seasonName(PHASES.liveSeason)}`,
    // static fallback only — boot overwrites it from PHASE.ptr.label (template ~:1239)
    __ERA_PTR_BTN__: PHASES.ptr?.label ?? "",
    // "build feed" is PTR vocabulary. Between cycles the same list is mostly live
    // hotfixes and class-tuning posts, so it is a patch feed (audit 2026-08-22).
    __ERA_FEED_HEADING__: PHASES.ptr ? `${eraDisplay} build feed` : `${eraDisplay} patch feed`,
    // __ERA_FOOTCOVER__ retired 2026-08-18: the footer identity block it fed was
    // removed at Riley's request; the masthead chip + baseline carry the same era info.
    __ERA_LIVE_LABEL__: PHASES.liveLabel,
    // the masthead stamp: which patch this tracker is ABOUT and whether it has shipped.
    // The label itself is the tell — it carries " PTR" only while the patch is on the PTR.
    __ERA_TRACKED_STAMP__: PHASES.ptr
      ? (PHASES.ptr.label.includes("PTR")
        ? `<b>PTR:</b> ${PHASES.ptr.label.replace(/\s*PTR$/, "")} “${PHASES.patchName}”`
        : `<b>Live:</b> ${PHASES.ptr.label} “${PHASES.patchName}”`)
      : `<b>Live:</b> ${PHASES.liveLabel} “${PHASES.patchName}”`,
  };
  for (const [token, value] of Object.entries(eraTokens)) {
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
      links.push(`<a href="${archive.season}.html">${archive.seasonName} (${archive.label}) — final standings</a>`);
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
  // build produced can execute — a smuggled <script> (e.g. via poisoned nightly data that
  // slipped past validation + esc()) is refused by the browser. Style stays 'unsafe-inline'
  // (the page uses inline style attributes throughout); fonts are the only external origin.
  const scriptHashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => "'sha256-" + createHash("sha256").update(m[1], "utf8").digest("base64") + "'");
  // The brand mark has an inline data: fallback plus same-origin PNGs for shortcut and
  // touch launchers. Network images remain refused; the masthead copy is inline SVG DOM.
  const csp = `default-src 'none'; script-src ${scriptHashes.join(" ")}; ` +
    "style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; " +
    "img-src 'self' data:; base-uri 'none'; form-action 'none'";
  html = html.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">`);

  await mkdir(path.join(root, "dist"), { recursive: true });
  const outPath = path.join(root, "dist", "index.html");
  await writeFile(outPath, html);
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
