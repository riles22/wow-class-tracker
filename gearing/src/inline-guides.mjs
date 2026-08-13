/* Inline the shared guide contract into the single-file app at BUILD time.

   WHY THIS EXISTS. The page is one self-contained HTML file with no module loader, so the
   client cannot `import` from `lib-guides.mjs` — yet the ordering rules (G15), the consensus
   counting (G9/G10) and the default-build choice (G17) must have exactly ONE definition. The
   first attempt kept a byte-for-byte copy of the library inside the template, guarded by a
   drift test. That works, but it is the same "two mechanisms doing one job" this project
   rejects elsewhere: the copy CAN diverge, and a test that notices is strictly weaker than a
   build that makes divergence impossible.

   So the template carries a placeholder and the build substitutes the real library source.
   Zero copies, zero drift, and the CSP hash is computed after substitution, so the injected
   code is covered by the same hash as everything else.

   `lib-guides.mjs` is deliberately import-free and side-effect-free, which is what makes this
   safe — stripping `export ` yields a plain script. A future import in that file would break
   the page silently, so `guideLibSource` refuses one. */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const LIB_PLACEHOLDER = "__LIB_GUIDES__";

export async function guideLibSource(root) {
  const source = await readFile(join(root, "src", "lib-guides.mjs"), "utf8");
  if (/^\s*import\s/m.test(source)) {
    throw new Error("lib-guides.mjs gained an import — it is inlined into the browser bundle "
      + "as a plain script and cannot resolve modules. Keep it import-free, or teach "
      + "inline-guides.mjs to bundle.");
  }
  if (/\brequire\s*\(/.test(source)) {
    throw new Error("lib-guides.mjs uses require() — it must stay browser-safe (see above).");
  }
  // `export const X` -> `const X`, `export function f` -> `function f`. Nothing else changes,
  // so a stack trace in the browser still matches the library line for line.
  return source.replace(/^export /gm, "");
}

/* Used by build.mjs and by the client tests, so the page under test is assembled exactly the
   way the shipped page is. */
/* The library's PRIVATE names are not private once inlined — `CATALYST` collided with the
   template's own `const CATALYST = DB.catalyst` on the first attempt, and the page died with
   "Identifier 'CATALYST' has already been declared". Wrapping the source in an IIFE keeps
   every internal name inside it and surfaces only what the library exports, so the library
   can add or rename privates forever without ever touching the page's namespace. */
const exportedNames = (source) => [...new Set(
  [...source.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)]
    .map((match) => match[1]))];

export async function injectGuideLib(template, root) {
  if (!template.includes(LIB_PLACEHOLDER)) {
    throw new Error(`template is missing the ${LIB_PLACEHOLDER} placeholder`);
  }
  const raw = await readFile(join(root, "src", "lib-guides.mjs"), "utf8");
  const names = exportedNames(raw);
  if (!names.length) throw new Error("lib-guides.mjs exported nothing to inline");
  const source = await guideLibSource(root);

  /* Bind only the exports the page actually mentions. Pulling in all of them would put
     names like SLOTS into the page's scope for no reason and invite the very collision the
     IIFE exists to prevent. The body is the template minus the placeholder line, so a name
     used ONLY inside the library never counts as a page reference. */
  const body = template.replace(LIB_PLACEHOLDER, "");
  const used = names.filter((name) => new RegExp(`\\b${name}\\b`).test(body));
  const block = [
    "const __guideLib = (() => {",
    source,
    `return { ${names.join(", ")} };`,
    "})();",
    used.length ? `const { ${used.join(", ")} } = __guideLib;` : "",
  ].join("\n");
  // Arrow form so a `$&` or `$1` in the library source is not read as a replacement pattern.
  return template.replace(LIB_PLACEHOLDER, () => block);
}
