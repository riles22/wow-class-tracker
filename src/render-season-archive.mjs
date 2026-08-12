/* Render a season-archive record (data/season-archive/<season>.json, written once by
   src/freeze-season-archive.mjs) into the static archive page. Called from build.mjs on
   every build so the page is regenerated deterministically from the frozen record —
   the record is the source of truth, the HTML is derived.

   The page carries ZERO JavaScript by design (an archive that cannot run script cannot
   misreport its record), so its CSP needs no script hashes: default-src 'none' refuses
   scripts outright. Everything data-driven passes through esc() — the archive is
   owner-written and Gate-0 immutable, but the render path should not be the one place
   in the project that trusts its input. */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const esc = s => String(s)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;");

/* Tier letter → the template's colour-class suffix ("A+" → "aplus"). Unknown letters
   fall back to the plain chip rather than throwing: a scale can grow a band (B+ did,
   S+ did) and an archive must still render years later. */
const tierClass = tier => "t-" + String(tier).toLowerCase().replace(/\+/g, "plus").replace(/[^a-z]/g, "");

const tierChip = tier => tier
  ? `<span class="tier ${tierClass(tier)}">${esc(tier)}</span>`
  : `<span class="none">—</span>`;

const BRACKET_META = {
  raid: { title: "Raid", note: "Mythic raid consensus across the season's tier lists." },
  mplus: { title: "Mythic+", note: "Mythic+ consensus across the season's tier lists." },
};

function bracketTable(bracket, rows, sources, spreadThreshold) {
  const meta = BRACKET_META[bracket] ?? { title: bracket, note: "" };
  /* Source columns in registry order, but only sources that actually contributed a
     letter somewhere in this bracket — an excluded outlet earns a provenance line,
     not an empty column. */
  const cols = sources.filter(s =>
    rows.some(r => r.perSource.some(p => p.source === s.id)));
  const head =
    `<tr><th>#</th><th>Spec</th><th>Role</th><th>Consensus<span class="qual">final · 0–100 mean</span></th>` +
    cols.map(s => {
      const lane = s[bracket]?.lane;
      const qual = lane === "frozen"
        ? `frozen ${esc(s[bracket].frozenAt ?? "")}` : `snapshot ${esc(s[bracket]?.snapshot ?? "—")}`;
      return `<th>${esc(s.name)}<span class="qual">${qual}</span></th>`;
    }).join("");
  const body = rows.map((r, i) => {
    const by = Object.fromEntries(r.perSource.map(p => [p.source, p]));
    const cells = cols.map(s => {
      const p = by[s.id];
      if (!p) return `<td><span class="none">—</span></td>`;
      return `<td>${tierChip(p.tier)}</td>`;
    }).join("");
    const div = r.diverges
      ? `<span class="div" title="Sources diverge by ${esc(r.spread)} points (threshold ${esc(spreadThreshold)})">±</span>` : "";
    return `<tr><td class="rank">${r.tier ? i + 1 : ""}</td>` +
      `<td class="specname"><b>${esc(r.spec)}</b> <span class="cls">${esc(r.class)}</span></td>` +
      `<td class="role">${esc(r.role)}</td>` +
      `<td class="cons">${tierChip(r.tier)}${r.score != null ? `<span class="score">${esc(r.score)}</span>` : ""}${div}</td>` +
      cells + `</tr>`;
  }).join("\n");
  return `<h2>${esc(meta.title)}</h2>\n<p class="bracket-note">${esc(meta.note)}</p>\n` +
    `<div class="tablewrap"><table>\n<thead>${head}</thead>\n<tbody>\n${body}\n</tbody></table></div>`;
}

const bandsLegend = (bands, spreadThreshold) => {
  const parts = bands.map(b => `<b>${esc(b.tier)}</b> from ${esc(b.min)}`);
  return `<p class="legend">Consensus letter from the mean of each source's normalized score: ` +
    `${parts.join(" · ")}. <b>±</b> marks a spread of ≥ ${esc(spreadThreshold)} points between sources.</p>`;
};

export async function renderSeasonArchive(archive, { root = ROOT } = {}) {
  if (archive?.kind !== "season-archive") {
    throw new Error("render-season-archive: input is not a season-archive record (kind mismatch)");
  }
  for (const field of ["season", "seasonName", "label", "frozenAt", "gitSha", "bands", "sources", "brackets"]) {
    if (archive[field] == null) throw new Error(`render-season-archive: archive record is missing "${field}"`);
  }

  const template = await readFile(path.join(root, "src", "season-archive-template.html"), "utf8");

  const body = Object.entries(archive.brackets)
    .map(([bracket, rows]) => bracketTable(bracket, rows, archive.sources, archive.spreadThreshold))
    .join("\n\n") + "\n" + bandsLegend(archive.bands, archive.spreadThreshold);

  const provenance = archive.sources.map(s => {
    const lanes = Object.entries(s).filter(([k]) => k !== "id" && k !== "name").map(([bracket, v]) => {
      if (v.lane === "frozen") {
        return `${bracket}: frozen ${esc(v.frozenAt ?? "?")}${v.fromCommit ? ` (commit ${esc(String(v.fromCommit).slice(0, 7))})` : ""}`;
      }
      if (v.lane === "excluded") return `${bracket}: excluded from the final mean (no longer described this season)`;
      return `${bracket}: live, snapshot ${esc(v.snapshot ?? "—")}`;
    });
    return `<p class="prov"><b>${esc(s.name)}</b> — ${lanes.join(" · ")}</p>`;
  }).join("\n") +
    `\n<p class="prov" style="margin-top:10px">Archived <b>${esc(archive.frozenAt)}</b> from commit ` +
    `<b>${esc(String(archive.gitSha).slice(0, 7))}</b> (consensus v${esc(archive.consensusVersion ?? "?")}) by ` +
    `<b>src/freeze-season-archive.mjs</b> — a one-shot, append-only record; this page is regenerated from it verbatim and never refreshed.</p>`;

  const tokens = {
    __SEASON_ID__: esc(archive.season),
    __SEASON_NAME__: esc(archive.seasonName),
    __SEASON_NAME_UPPER__: esc(archive.seasonName.toUpperCase()),
    __SEASON_LABEL__: esc(archive.label),
    __FROZEN_AT__: esc(archive.frozenAt),
    __BODY__: body,
    __PROVENANCE__: provenance,
  };
  let html = template;
  for (const [token, value] of Object.entries(tokens)) {
    if (!html.includes(token)) throw new Error(`season-archive-template.html is missing the ${token} placeholder`);
    html = html.replaceAll(token, () => value);
  }
  // Same LF normalization as the main build: keeps Windows and CI byte-identical.
  html = html.replace(/\r\n?/g, "\n");
  // Script-free page → no hashes to compute; default-src 'none' refuses script outright.
  const csp = "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src https://fonts.gstatic.com; img-src 'self' data:; base-uri 'none'; form-action 'none'";
  html = html.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">`);
  if (/<script[\s>]/i.test(html)) {
    throw new Error("render-season-archive: a <script> reached the archive page — this page is script-free by contract");
  }
  return html;
}
