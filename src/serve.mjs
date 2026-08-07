/* Tiny static server for dist/ — preview only, no dependencies. */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8317);

/* The site publishes two pages plus fetchable launcher icons. Allowlisted names only:
   a path taken from the request must never reach the filesystem unfiltered. Unknown
   paths keep the historical index.html fallback used by the preview. */
const FILES = new Map([
  ["/", { name: "index.html", type: "text/html; charset=utf-8" }],
  ["/index.html", { name: "index.html", type: "text/html; charset=utf-8" }],
  ["/gearing.html", { name: "gearing.html", type: "text/html; charset=utf-8" }],
  ["/favicon-192.png", { name: "favicon-192.png", type: "image/png" }],
  ["/apple-touch-icon.png", { name: "apple-touch-icon.png", type: "image/png" }],
]);

createServer(async (req, res) => {
  const file = FILES.get(new URL(req.url, "http://localhost").pathname) ?? FILES.get("/");
  try {
    const body = await readFile(path.join(ROOT, "dist", file.name));
    res.writeHead(200, { "Content-Type": file.type });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`dist/${file.name} not found — run \`npm run build\` first`);
  }
}).listen(PORT, () => console.log(`serving dist/ at http://localhost:${PORT}`));
