/* Build: data/*.json + src/template.html → dist/index.html
   The output is a single self-contained file — open it directly in a browser. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "./validate.mjs";
import { buildPayload } from "./render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
  const csp = `default-src 'none'; script-src ${scriptHashes.join(" ")}; ` +
    "style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; " +
    "base-uri 'none'; form-action 'none'";
  html = html.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">`);

  await mkdir(path.join(root, "dist"), { recursive: true });
  const outPath = path.join(root, "dist", "index.html");
  await writeFile(outPath, html);
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
