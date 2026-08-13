/* Wowhead URL namespacing, in one place (Phase E, docs/gearing-s2-scope.md G25).

   THE PROBLEM THIS SOLVES. Wowhead serves unreleased content from a `/ptr/` namespace and
   drops it at launch. The loot harvesters hardcoded that segment in six URL builders, so the
   08-18 flip meant editing every one of them by hand — the exact class of one-shot
   `season.mjs` exists to abolish. The namespace now comes from `SEASON.wowheadNamespace`, so
   the flip is a config edit there and nothing else.

   ACCEPT BOTH, EMIT ONE. A link recorded before the flip outlives it: `dungeon-items.json`
   stores the guide URL that actually answered, and those all carry `/ptr/`. So every reader
   here accepts either spelling (`sameWowheadPage`, `stripWowheadNamespace`, `WOWHEAD_ITEM_HREF`)
   while every WRITER emits exactly what the config says (`wowheadUrl`). `wowheadCandidates`
   is the bridge for a fetch: try the configured spelling first, fall back to the others, and
   record the one that answered rather than the one we hoped for.

   Nothing here reads the clock or the season beyond the injected `season` argument, which is
   what makes it testable against both sides of the flip without moving a date. */

import { SEASON } from "./season.mjs";

/* The namespaces Wowhead has actually served this project's content from. A closed list on
   purpose: a regex like `/[a-z-]+\//` would strip `/guide/` out of a live URL and silently
   turn a page path into a different page. */
export const WOWHEAD_NAMESPACES = ["ptr", "ptr-2", "beta"];

const HOST = /^(https:\/\/(?:www\.|nether\.)?wowhead\.com)\/(.*)$/;
const trimPath = (path) => String(path ?? "").replace(/^\/+/, "");

/* "https://www.wowhead.com/ptr/guide/x" -> "https://www.wowhead.com/guide/x".
   A URL with no namespace, or one this project has never seen, comes back untouched. */
export function stripWowheadNamespace(url) {
  const parts = HOST.exec(String(url ?? ""));
  if (!parts) return String(url ?? "");
  const [, host, rest] = parts;
  const segment = rest.split("/")[0];
  return WOWHEAD_NAMESPACES.includes(segment)
    ? `${host}/${rest.slice(segment.length + 1)}`
    : `${host}/${rest}`;
}

/* Do two links point at the same page, whichever namespace each was written in? This is the
   comparison every stored-URL check must use — a `/ptr/` link and its live twin are the same
   page, and treating them as different is how a stale record reads as a moved page. */
export const sameWowheadPage = (left, right) =>
  stripWowheadNamespace(left) === stripWowheadNamespace(right);

/* The one WRITER. `path` is namespace-free ("guide/midnight/..."); the season decides the
   prefix, and a null namespace (post-flip) emits the live URL. */
export const wowheadUrl = (path, season = SEASON) =>
  `https://www.wowhead.com/${season?.wowheadNamespace ? `${season.wowheadNamespace}/` : ""}${trimPath(path)}`;

/* Every spelling of one page, configured first. A harvester walks this so a page that has
   already gone live is found on the run BEFORE the config catches up, and a page that has not
   is still found after — without either case being written into the data as a surprise. */
export function wowheadCandidates(path, season = SEASON) {
  const clean = trimPath(path);
  const ordered = [wowheadUrl(clean, season), `https://www.wowhead.com/${clean}`,
    ...WOWHEAD_NAMESPACES.map((namespace) => `https://www.wowhead.com/${namespace}/${clean}`)];
  return [...new Set(ordered)];
}

/* Item links in guide HTML. Measured trap, recorded in the scope: dungeon guide item links
   live in the PTR namespace while raid links are live, and the ids are identical — so any
   href-level reader must accept both or lose half the pool. */
export const WOWHEAD_ITEM_HREF = new RegExp(
  `wowhead\\.com/(?:(?:${WOWHEAD_NAMESPACES.join("|")})/)?item=(\\d+)`, "g");

export const itemIdsFromHrefs = (html) =>
  [...new Set([...String(html ?? "").matchAll(WOWHEAD_ITEM_HREF)].map((match) => match[1]))];

/* The tooltip endpoint, exported so `lib-wowhead.mjs`'s TOOLTIP becomes a one-line adoption
   rather than a seventh hardcoded namespace. It is NOT used here — the tooltip fetch lives in
   lib-wowhead — and `test/lair-source.test.mjs` pins the two against each other so the day
   they disagree is announced rather than discovered in a harvest. */
export const netherTooltipUrl = (id, season = SEASON) =>
  `https://nether.wowhead.com/${season?.wowheadNamespace ? `${season.wowheadNamespace}/` : ""}tooltip/item/${id}?locale=0`;
