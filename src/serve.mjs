/* Tiny static server for dist/ — preview only, no dependencies. */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8317);

/* The site publishes two pages and the masthead tab strip links between them, so the
   preview has to honour the path — serving index.html for every request made clicking
   "S2 Gearing" locally look like a no-op. Allowlisted names only: this is a dev server,
   and a path taken from the request must never reach the filesystem unfiltered. */
const PAGES = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/gearing.html", "gearing.html"],
]);

createServer(async (req, res) => {
  const name = PAGES.get(new URL(req.url, "http://localhost").pathname) ?? "index.html";
  try {
    const html = await readFile(path.join(ROOT, "dist", name));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`dist/${name} not found — run \`npm run build\` first`);
  }
}).listen(PORT, () => console.log(`serving dist/ at http://localhost:${PORT}`));
