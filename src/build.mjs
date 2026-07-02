/* Build: data/*.json + src/template.html → dist/index.html
   The output is a single self-contained file (the SharePoint drop-in). */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "./validate.mjs";
import { buildPayload } from "./render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function build(root = ROOT) {
  const data = await loadData(root);
  const errors = validateData(data);
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
  const html = template.replace("__DATA_JSON__", () => json);

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
