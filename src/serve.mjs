/* Tiny static server for dist/ — preview only, no dependencies. */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8317);

createServer(async (req, res) => {
  try {
    const html = await readFile(path.join(ROOT, "dist", "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("dist/index.html not found — run `npm run build` first");
  }
}).listen(PORT, () => console.log(`serving dist/index.html at http://localhost:${PORT}`));
