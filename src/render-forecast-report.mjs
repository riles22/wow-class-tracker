/* A static, reproducible grade of the declared forecast. The artifact supplies both
   the forecast and its carry-forward prior; settled history supplies only the outcome. */
import { gradeSnapshot, launchPair, SETTLE_DAYS, carryForward, reportWarnings } from "./report-card.mjs";

const BRACKETS = ["raid", "mplus"];
const esc = value => String(value ?? "—").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const bracketName = bracket => bracket === "mplus" ? "Mythic+" : "Raid";
const projectionOf = cell => cell == null ? null :
  { tier: cell.tier, score: cell.score, confidence: cell.confidence ?? null };

function artifactSnapshot(artifact) {
  return {
    date: artifact.date, phase: artifact.phase, frozen: true,
    projectionVersion: artifact.projectionVersion, rankVersion: artifact.rankVersion,
    consensusVersion: artifact.consensusVersion,
    specs: Object.fromEntries(Object.entries(artifact.cells).map(([key, cell]) => [key, {
      projection: Object.fromEntries(BRACKETS.map(b => [b, projectionOf(cell[b])])),
      consensus: Object.fromEntries(BRACKETS.map(b => [b, cell.consensus?.[b]?.tier ?? null])),
      scores: Object.fromEntries(BRACKETS.map(b => [b, cell.consensus?.[b]?.score ?? null])),
      consensusSources: Object.fromEntries(BRACKETS.filter(b => Array.isArray(cell.consensus?.[b]?.perSource))
        .map(b => [b, cell.consensus[b].perSource.map(p => p.source)]))
    }]))
  };
}

function verifyDeclaration(artifact, declared, forecast) {
  const refuse = detail => { throw new Error(`forecast report: ${detail} — refusing to grade a different freeze`); };
  if (!declared || !declared.frozen || declared.phase !== artifact.phase) {
    refuse(`artifact ${artifact.date} has no matching explicit frozen history declaration`);
  }
  for (const field of ["projectionVersion", "rankVersion", "consensusVersion"]) {
    if (declared[field] !== artifact[field]) refuse(`${field} differs between artifact and declared history`);
  }
  if (JSON.stringify(Object.keys(declared.specs).sort()) !== JSON.stringify(Object.keys(forecast.specs).sort())) {
    refuse("artifact and declared history cover different specs");
  }
  for (const [key, cell] of Object.entries(forecast.specs)) {
    for (const bracket of BRACKETS) {
      const saved = declared.specs[key];
      if (JSON.stringify(projectionOf(saved.projection?.[bracket])) !== JSON.stringify(cell.projection[bracket])) {
        refuse(`${key} ${bracket} forecast differs between artifact and declared history`);
      }
      if ((saved.consensus?.[bracket] ?? null) !== cell.consensus[bracket]
        || (saved.scores?.[bracket] ?? null) !== cell.scores[bracket]) {
        refuse(`${key} ${bracket} prior differs between artifact and declared history`);
      }
      const sourcesOf = ids => ids == null ? null : [...ids].sort();
      if (JSON.stringify(sourcesOf(saved.consensusSources?.[bracket]))
        !== JSON.stringify(sourcesOf(cell.consensusSources[bracket]))) {
        refuse(`${key} ${bracket} prior sources differ between artifact and declared history`);
      }
    }
  }
}

export function createForecastReport({ frozenForecast: artifact, historySnapshots = [], scales }) {
  if (!artifact) return null;
  if (artifact.kind !== "frozen-forecast" || !artifact.cells) throw new Error("forecast report: invalid frozen artifact");
  const snapshots = [...historySnapshots].sort((a, b) => a.date.localeCompare(b.date));
  const forecast = artifactSnapshot(artifact);
  verifyDeclaration(artifact, snapshots.find(s => s.date === artifact.date), forecast);
  // Keep earlier seasons out of launchPair's post-phase set when another cycle opens.
  const cycle = snapshots.filter(s => s.date >= artifact.date);
  const roles = Object.entries(artifact.cells).map(([key, cell]) => {
    const [className, spec] = key.split("|");
    return { class: className, spec, role: cell.role };
  });
  const checkpoints = SETTLE_DAYS.map(settleDays => {
    const pair = launchPair(cycle, artifact.phase, { settleDays });
    if (pair.forecast && (pair.forecast.date !== artifact.date || pair.frozenExplicit === false)) {
      throw new Error("forecast report: selected history freeze differs from the artifact — refusing to grade a different freeze");
    }
    if (!pair.actual) return { settleDays, launchDate: pair.launchDate ?? null,
      settleBy: pair.settleBy ?? null, reason: pair.reason };
    const options = { mode: "grade", specs: roles };
    return { settleDays, launchDate: pair.launchDate, settleBy: pair.settleBy, actual: pair.actual,
      grade: gradeSnapshot(forecast, pair.actual, scales, options),
      baseline: gradeSnapshot(carryForward(forecast), pair.actual, scales, options) };
  });
  const latest = checkpoints.filter(c => c.grade).at(-1);
  const summary = latest?.grade.consensusVersion.comparable && latest.grade.overall ? {
    href: "forecast-report.html", forecastDate: artifact.date, actualDate: latest.grade.actualDate,
    settleDays: latest.settleDays, coverage: latest.grade.coverage, overall: latest.grade.overall,
    comparable: true
  } : null;
  return { artifact, forecast, checkpoints, summary };
}

const tier = value => value == null ? "—" : `<b class="tier">${esc(value)}</b>`;
const table = (caption, heads, rows) => `<div class="tablewrap" tabindex="0" role="region" aria-label="${esc(caption)}"><table><caption>${esc(caption)}</caption><thead><tr>${heads.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("\n")}</tbody></table></div>`;
const row = cells => `<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
const fraction = value => value == null ? "—" : esc(value);

function checkpointHTML(checkpoint, forecast) {
  const heading = `<h2 id="checkpoint-${checkpoint.settleDays}">+${esc(checkpoint.settleDays)} days</h2>`;
  if (!checkpoint.grade) return `<section>${heading}<p class="pending"><b>Pending.</b> ${esc(checkpoint.reason)}</p></section>`;
  const { grade: g, baseline: b, actual } = checkpoint;
  const c = g.coverage;
  const comparable = g.consensusVersion?.comparable === true;
  const warningLines = reportWarnings(g).map(w => `<p class="notice">${esc(w)}</p>`).join("");
  const accuracy = !comparable
    ? `<p class="notice"><b>Ungradeable checkpoint.</b> The frozen prior and settled outcome cannot be compared reliably. Accuracy, ordering, and band differences are withheld; the recorded cells remain available for inspection.</p>`
    : g.overall ? `<p class="result"><b>${esc(g.overall.exactPct)}% exact letters</b> · <b>${esc(g.overall.withinOnePct)}% within one band</b></p>
    <p>Mean absolute error: ${esc(g.overall.meanAbsBands)} bands; signed bias: ${esc(g.overall.biasBands)} bands.
    Positive bias means the forecast was too optimistic. Carry-forward: ${esc(b.overall?.exactPct)}% exact, ${esc(b.overall?.withinOnePct)}% within one band.</p>`
    : `<p>No forecast cells could be graded at this checkpoint.</p>`;
  const rankingRows = Object.entries(g.ranking).filter(([key]) => !key.endsWith("/top-tier")).map(([key, metric]) => {
    const base = b.ranking[key];
    return row([esc(key), esc(metric.n), fraction(metric.spearman), fraction(base?.spearman),
      fraction(metric.ndcg), fraction(base?.ndcg), `${esc(metric.topK.overlap)}/${esc(metric.topK.of)}`,
      base ? `${esc(base.topK.overlap)}/${esc(base.topK.of)}` : "—"]);
  });
  const recall = Object.entries(g.ranking).filter(([key]) => key.endsWith("/top-tier")).map(([key, metric]) =>
    `${esc(bracketName(key.split("/")[0]))}: ${esc(metric.hit)}/${esc(metric.of)} settled S/A+ cells predicted S/A+`).join(" · ");
  const ranking = comparable ? `<h3>Ordering within each role</h3><p>Forecast and carry-forward use the same settled outcome. Higher is better for all ranking measures; a dash means insufficient evidence.
    Top-k is 5 for DPS and 3 for tanks/healers. Carry-forward copies the artifact's pre-launch live consensus.</p>
    ${table("Forecast versus carry-forward ordering", ["Bracket / role", "Cells", "Forecast Spearman", "Carry-forward Spearman", "Forecast NDCG@k", "Carry-forward NDCG@k", "Forecast top-k overlap", "Carry-forward top-k overlap"], rankingRows)}
    <p>${recall}</p>` : "";
  const compositionRows = BRACKETS.map(bracket => row([esc(bracketName(bracket)),
    esc(g.consensusComposition.forecast?.[bracket]?.join(", ")),
    esc(g.consensusComposition.actual?.[bracket]?.join(", "))]));
  const graded = new Map(g.rows.map(r => [`${r.spec}|${r.bracket}`, r]));
  const cells = Object.keys(forecast.specs).sort().flatMap(key => BRACKETS.map(bracket => {
    const f = forecast.specs[key], a = actual.specs?.[key], r = graded.get(`${key.replace("|", " ")}|${bracket}`);
    const status = r ? (comparable ? `${r.bandsOff > 0 ? "+" : ""}${r.bandsOff} bands` : "Not comparable")
      : !a ? "Roster gap" : a.consensus?.[bracket] == null ? "No settled outcome"
        : f.projection[bracket]?.tier == null ? "Forecast declined" : "Ungradeable tier";
    return row([esc(key.replace("|", " ")), esc(bracketName(bracket)), tier(f.projection[bracket]?.tier),
      fraction(f.projection[bracket]?.score), esc(f.projection[bracket]?.confidence), tier(f.consensus[bracket]),
      tier(a?.consensus?.[bracket]), fraction(a?.scores?.[bracket]), esc(status)]);
  }));
  return `<section>${heading}<p>Declared ${esc(g.forecastDate)} → settled snapshot <b>${esc(g.actualDate)}</b>.
    Launch ${esc(checkpoint.launchDate)}; first eligible date ${esc(checkpoint.settleBy)}.</p>
    <p>Outcome record: <code>data/history/${esc(g.actualDate)}.json</code> (phase ${esc(g.actualPhase)}, consensus v${esc(g.consensusVersion.actual)}).</p>
    <p class="coverage"><b>Coverage: ${esc(c.graded)}/${esc(c.obtainable)} ${comparable ? "gradeable" : "paired"} cells (${esc(c.coveragePct)}%).</b>
    ${esc(c.declined)} declined · ${esc(c.ungradeable)} without an outcome · ${esc(c.rosterGap)} roster gaps.
    ${c.sufficient ? "" : `<strong>Partial coverage${comparable ? ": this grades a subset, not the model" : ""}.</strong>`}</p>
    ${table("Consensus source composition", ["Bracket", "Frozen prior contributors", "Settled contributors"], compositionRows)}
    ${warningLines}${accuracy}
    ${ranking}
    <h3>Every declared cell</h3><p>Scores keep their original snapshot precision; letters were assigned before rounding.${comparable ? " A positive band difference means the settled letter is worse than the forecast." : ""}</p>
    ${table(`All forecast cells at +${checkpoint.settleDays} days`, ["Spec", "Bracket", "Forecast", "Recorded score", "Confidence", "Carry-forward", "Settled", "Recorded score", comparable ? "Difference / status" : "Status"], cells)}
  </section>`;
}

function provenanceHTML(artifact) {
  const sourceDates = Object.entries(artifact.sourceDates ?? {}).sort(([a], [b]) => a.localeCompare(b))
    .map(([source, date]) => row([esc(source), esc(date)]));
  const priorReceipts = Object.entries(artifact.cells).sort(([a], [b]) => a.localeCompare(b)).flatMap(([key, cell]) =>
    BRACKETS.map(bracket => row([esc(key.replace("|", " ")), esc(bracketName(bracket)),
      esc((cell.consensus?.[bracket]?.perSource ?? []).map(p => `${p.source}: ${p.tier}${p.lane === "frozen" ? ` (frozen ${p.frozenAsOf ?? "date unrecorded"})` : ""}`).join(" · "))])));
  return `<section><h2>Provenance</h2><p>The artifact and its explicit history declaration agree on every forecast and prior cell. Forecast values and carry-forward priors come from the immutable artifact, never a new model run.</p>
    <dl><dt>Artifact</dt><dd>data/forecasts/frozen-${esc(artifact.date)}.json</dd>
    <dt>Declared history</dt><dd>data/history/${esc(artifact.date)}.json</dd>
    <dt>Phase</dt><dd>${esc(artifact.phase)}</dd><dt>Versions</dt><dd>Projection ${esc(artifact.projectionVersion)} · consensus ${esc(artifact.consensusVersion)} · rank ${esc(artifact.rankVersion)}</dd>
    <dt>Original Git SHA</dt><dd><code>${esc(artifact.gitSha)}</code></dd><dt>Original data SHA-256</dt><dd><code>${esc(artifact.dataSha256)}</code></dd></dl>
    <details><summary>Source dates recorded at freeze</summary><p>These are each registry source's newest page date at freeze. An outlet that had moved ahead could contribute older frozen prior letters; those dates are disclosed separately below.</p>
    ${table("Registry receipts at freeze", ["Source", "Newest page snapshot"], sourceDates)}</details>
    <details><summary>Prior letters and frozen-source receipts for every cell</summary>${table("Prior source receipts", ["Spec", "Bracket", "Contributors and stored letters"], priorReceipts)}</details></section>`;
}

export function renderForecastReport(report) {
  if (!report) return null;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>Forecast report card — Spec Tracker</title>
<style>
:root{color-scheme:dark;--bg:#0c0913;--panel:#171020;--ink:#ede6f5;--muted:#b7a8c9;--gold:#e3c37b;--line:#463052}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,sans-serif}main{max-width:1240px;margin:auto;padding:32px 24px 72px}a{color:var(--gold)}a:focus-visible,summary:focus-visible,.tablewrap:focus-visible{outline:2px solid var(--gold);outline-offset:4px}header{border-bottom:1px solid var(--gold);padding-bottom:24px}h1,h2,h3{line-height:1.2}h1{font:700 clamp(28px,5vw,46px)/1.15 Georgia,serif;letter-spacing:.025em;color:var(--gold);margin:16px 0}h2{font:700 26px/1.2 Georgia,serif;color:var(--gold)}h3{font-size:19px;margin-top:28px}.eyebrow{font:12px ui-monospace,monospace;letter-spacing:.18em;color:var(--muted)}section{margin-top:36px;min-width:0}p{max-width:100ch}.lede{font-size:18px}.coverage,.notice,.pending{padding:14px 18px;border:1px solid var(--line);border-radius:8px;background:var(--panel)}.result{font-size:21px;color:var(--gold)}.tablewrap{width:100%;max-width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:8px;margin:16px 0}table{width:100%;border-collapse:collapse;white-space:nowrap;font-size:13px}caption{text-align:left;padding:12px;color:var(--gold);font-weight:700}th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line)}th{background:var(--panel);color:var(--muted)}tbody tr:last-child td{border:0}.tier{color:var(--gold)}details{margin-top:20px}summary{cursor:pointer;color:var(--gold)}dl{display:grid;grid-template-columns:180px minmax(0,1fr);gap:8px 16px}dt{color:var(--muted)}dd{margin:0;overflow-wrap:anywhere}code{font-size:13px}footer{margin-top:40px;border-top:1px solid var(--line);padding-top:20px;color:var(--muted)}@media(max-width:600px){main{padding:22px 14px 44px}dl{grid-template-columns:1fr;gap:3px}dd{margin-bottom:10px}.coverage,.notice,.pending{padding:12px}}
</style></head><body><main>
<header><a href="index.html">← Spec Tracker</a><p class="eyebrow">SPEC TRACKER / FORECAST ACCOUNTABILITY</p><h1>Forecast report card</h1>
<p class="lede">The forecast declared ${esc(report.artifact.date)}, checked at two fixed settlement checkpoints.</p>
<p>This measures agreement with <b>publisher tier-list consensus</b>, not objective game performance. Shared publisher blind spots remain ungraded. Settlement means the first saved consensus at least 14 or 28 days after launch; it does not certify that every publisher refreshed that day. Publisher-specific outcome dates are not recorded in these history snapshots.</p>
<nav aria-label="Report checkpoints">${report.checkpoints.map(c => `<a href="#checkpoint-${c.settleDays}">+${c.settleDays} days${c.grade ? ` · ${esc(c.grade.actualDate)}` : " · pending"}</a>`).join(" &nbsp;·&nbsp; ")}</nav></header>
${report.checkpoints.map(c => checkpointHTML(c, report.forecast)).join("\n")}
${provenanceHTML(report.artifact)}
<footer>Each completed checkpoint keeps its first eligible historical outcome. Later refreshes do not replace it. <a href="index.html">Return to the tracker</a>.</footer>
</main></body></html>\n`;
}
