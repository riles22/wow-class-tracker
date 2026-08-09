/* Build: data/*.json + src/template.html → dist/index.html
   The application remains self-contained; companion icons give shortcut launchers a
   fetchable image while the inline SVG keeps a standalone file's tab icon working. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "./validate.mjs";
import { buildPayload } from "./render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ICON_ASSETS = ["favicon-192.png", "apple-touch-icon.png"];

/* ERA TEXT, resolved at build time from PHASES (2026-08-08, for the 12.1 launch).
 *
 * src/template.html hardcoded 36 occurrences of "12.1 PTR" and 30 of "12.0.7". The Era toggle
 * was already data-driven; the PROSE around it was not, so from the moment 12.1 ships the
 * masthead, footer and legend would all tell every visitor that 12.1 is on the PTR while the
 * control beside them said otherwise. CLAUDE.md rule 4 also says the template is presentation
 * only with zero data in it — an era literal IS data, so this closes a standing violation too.
 *
 * Build-time rather than client-side for two reasons: no flash of wrong content, and the
 * strings land in the artifact so a `grep` of dist/ tells you what the page actually says.
 *
 * The hard part is not the labels, it is that `PHASES.ptr` goes NULL at launch. Several of
 * these need a different SHAPE, not a different word — an arrow with nothing on its right,
 * advice to "switch Era to 12.1 PTR" when the toggle has been hidden. Each placeholder below
 * therefore resolves through the phase object rather than through a string swap.
 */
export function applyEraText(html, phases) {
  const live = phases?.liveLabel ?? "12.0.7";
  const ptr = phases?.ptr?.label ?? null;
  const season = phases?.liveSeason === "s2" ? "Season 2" : "Season 1";
  const sub = {
    LIVE_LABEL: live,
    PTR_LABEL: ptr ?? "",
    LIVE_SEASON: season,
    // The masthead chip: "12.1 PTR — CURSE OF ULA'TEK" while a PTR exists, the live patch after.
    PATCH_CHIP: ptr ? `${ptr} — CURSE OF ULA'TEK` : `${live} — CURSE OF ULA'TEK`,
    // "12.0.7 / Season 1 → 12.1 PTR" collapses to just the live era once there is no PTR.
    COVERAGE_LINE: ptr
      ? `Now covering: ${live} / ${season} → ${ptr} “Curse of Ula'tek”`
      : `Now covering: ${live} / ${season} “Curse of Ula'tek”`,
    // Build feed heading, and the "switch Era to X" advice that is unreachable with no toggle.
    BUILD_FEED_HEAD: ptr ? `${ptr} build feed` : `${live} patch notes`,
    ERA_SWITCH_HINT: ptr ? ` — switch Era to Both or ${ptr}` : "",
  };
  const unresolved = [];
  html = html.replace(/__ERA_([A-Z_]+)__/g, (m, key) => {
    if (!(key in sub)) { unresolved.push(m); return m; }
    return sub[key];
  });
  if (unresolved.length) {
    throw new Error(`template uses unknown era placeholders: ${[...new Set(unresolved)].join(", ")}`);
  }
  return html;
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
  // Escape "<" so the payload can never terminate the surrounding <script> block.
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  let html = template.replace("__DATA_JSON__", () => json);
  html = applyEraText(html, payload.meta.phases);
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
  } catch { /* no gearing artifact in this tree — tracker-only build */ }
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
