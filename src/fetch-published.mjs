/* Deterministic page self-date evidence (docs/published-gate-scope.md, 2026-08-04).

   `snapshot` says when WE fetched a page; `published` says what the page states about
   ITSELF (JSON-LD dateModified / a "Last UPDATED" body line). The manifest gate
   cross-checks the first; the second was written by the refresh agent and gated by
   nothing — which is how the 02 Aug icyveins-ptr rebuild went unseen for two days while
   the nightly manifest claimed success and repeated a stale published date.

   This step is the fetch-wcl pattern applied to that field: it runs BEFORE any agent,
   reads every published-bearing registry page (requirements carrying a `published` block
   in data/required-sources.json), extracts the page's own update date deterministically,
   and writes published-evidence/evidence.json — uploaded as an artifact before the
   agents start, so the publish gate cross-checks stored `published` against a copy no
   agent had a window to touch (src/check-refresh.mjs, checkPublished).

   No credentials. Exit code is 0 whenever evidence was written — including upstream
   failure, because the evidence IS the product: an unreachable page or a parser miss is
   a recorded degradation (`resolved: null` + note) that the gate reports aloud and
   works around (regression ratchet + staleness threshold), never a red night caused by
   our own fetch. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const dateOf = v => String(v ?? "").slice(0, 10);
const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* Newest JSON-LD dateModified anywhere on the page. Pages can carry several ld+json
   blocks (Article, breadcrumbs, org); any object in any of them may hold the field, so
   walk everything and take the newest — "the page says it was last modified then". A
   block that fails to parse is skipped, never fatal. */
export function extractDateModified(html) {
  const found = [];
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(String(html ?? "")))) {
    let parsed;
    try { parsed = JSON.parse(m[1]); } catch { continue; }
    const stack = [parsed];
    while (stack.length) {
      const node = stack.pop();
      if (Array.isArray(node)) stack.push(...node);
      else if (node && typeof node === "object") {
        if (typeof node.dateModified === "string" && /^\d{4}-\d{2}-\d{2}/.test(node.dateModified)) {
          found.push(node.dateModified.slice(0, 10));
        }
        stack.push(...Object.values(node));
      }
    }
  }
  return found.sort().reverse()[0] ?? null;
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july",
  "august", "september", "october", "november", "december"];

/* The Icy Veins body idiom: "Last UPDATED - 2nd of August." (year usually absent, an
   optional trailing year tolerated). Year inference when absent: the latest occurrence
   of that day+month that is not after the reference (fetch) date — "2nd of August" read
   on 2026-08-04 is 2026-08-02; "31st of December" read on 2026-01-02 is 2025-12-31. */
export function extractLastUpdated(html, ref) {
  const m = /last\s+updated\s*(?:[-–—:]|\bon\b)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+of\s+([a-z]+)\.?,?\s*(\d{4})?/i
    .exec(String(html ?? ""));
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTHS.indexOf(m[2].toLowerCase()) + 1;
  if (!month || day < 1 || day > 31) return null;
  if (m[3]) return iso(Number(m[3]), month, day);
  const refDate = dateOf(ref);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(refDate)) return null;
  let year = Number(refDate.slice(0, 4));
  if (iso(year, month, day) > refDate) year -= 1;
  return iso(year, month, day);
}

/* Canonical resolution, matching the refresh-tiers recipe's own precedence: JSON-LD
   dateModified wins; the body line is the fallback; disagreement records both and says
   so rather than silently picking. */
export function resolvePage(html, ref) {
  const dateModified = extractDateModified(html);
  const lastUpdated = extractLastUpdated(html, ref);
  const resolved = dateModified ?? lastUpdated ?? null;
  const note = dateModified && lastUpdated && dateModified !== lastUpdated
    ? `JSON-LD dateModified ${dateModified} and the "Last UPDATED" line ${lastUpdated} disagree — using dateModified (refresh-tiers precedence)`
    : (resolved == null ? "neither JSON-LD dateModified nor a \"Last UPDATED\" line found — page layout may have changed" : null);
  return { dateModified, lastUpdated, resolved, ...(note ? { note } : {}) };
}

/* The published-bearing pages this run owes evidence for: every requirement carrying a
   `published` block, resolved through its pages-typed date probe. Config problems are
   RETURNED (the gate turns them red); this step never throws on them. */
export function evidenceTargets(config, sources) {
  const targets = [], problems = [];
  for (const req of config.requirements ?? []) {
    if (!req.published) continue;
    if (req.date?.type !== "pages") { problems.push(`"${req.key}" has a published block but no pages-typed date probe`); continue; }
    const pages = (sources.find(s => s.id === req.date.sourceId)?.pages ?? [])
      .filter(p => req.date.bracket == null || p.bracket === req.date.bracket);
    for (const p of pages) {
      if (!p.url) { problems.push(`"${req.key}" page (${p.bracket ?? "?"}/${p.role ?? "?"}) has no url to fetch`); continue; }
      targets.push({ key: req.key, sourceId: req.date.sourceId, bracket: p.bracket ?? null, role: p.role ?? null, url: p.url });
    }
  }
  return { targets, problems };
}

/* The full browser header set, not UA-only: wowhead.com answers a UA-only fetch with
   403 (the same recipe every wowhead fetch in this repo uses — see refresh-tiers), and
   with icyveins/wowhead now under the published gate a UA-only fetcher would record
   every wowhead page as permanently unresolved, silently reducing its cross-check to
   the ratchet + threshold. Icy Veins accepts both forms (verified 2026-08-05). */
export const HEADERS = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "sec-ch-ua": '"Chromium";v="126", "Not;A=Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

async function fetchPage(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 20000);
      const res = await fetch(url, { headers: HEADERS, signal: ctl.signal });
      clearTimeout(timer);
      const body = res.ok ? await res.text() : null;
      if (res.ok) return { httpStatus: res.status, body };
      if (attempt === 0) { await new Promise(r => setTimeout(r, 2000)); continue; }
      return { httpStatus: res.status, body: null, error: `http ${res.status}` };
    } catch (err) {
      if (attempt === 0) { await new Promise(r => setTimeout(r, 2000)); continue; }
      return { httpStatus: null, body: null, error: String(err?.message ?? err) };
    }
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const readJson = async p => JSON.parse(await readFile(path.resolve(root, p), "utf8"));
  const config = await readJson("data/required-sources.json");
  const sourcesRaw = await readJson("data/sources.json");
  const sources = sourcesRaw.sources ?? sourcesRaw;

  const attemptedAt = new Date().toISOString();
  const { targets, problems } = evidenceTargets(config, sources);
  const pages = [];
  for (const t of targets) {
    const r = await fetchPage(t.url);
    const read = r.body != null ? resolvePage(r.body, attemptedAt)
      : { dateModified: null, lastUpdated: null, resolved: null, note: r.error ?? "unreachable" };
    pages.push({ ...t, httpStatus: r.httpStatus ?? null, ...read });
    console.log(`  ${t.key} ${t.url} → ${read.resolved ?? "unresolved"}${read.note ? ` (${read.note})` : ""}`);
  }

  const evidence = { attemptedAt, pages, ...(problems.length ? { problems } : {}) };
  await mkdir(path.resolve(root, "published-evidence"), { recursive: true });
  await writeFile(path.resolve(root, "published-evidence/evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
  const resolved = pages.filter(p => p.resolved).length;
  console.log(`✓ published-evidence/evidence.json written — ${resolved}/${pages.length} pages resolved${problems.length ? `, ${problems.length} config problem(s) recorded` : ""}`);
}
