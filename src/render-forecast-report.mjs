/* A static, reproducible grade of the declared forecast. The artifact supplies both
   the forecast and its carry-forward prior; settled history supplies only the outcome. */
import { gradeSnapshot, launchPair, SETTLE_DAYS, carryForward, reportWarnings } from "./report-card.mjs";
import { createSourcePredictionReport, ledgerFromArtifact } from "./source-predictions.mjs";

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

export function createForecastReport({ frozenForecast: artifact, historySnapshots = [], scales, sourcePredictions = null }) {
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
    const gradingScales = pair.actual.sourceReceipts?.scales
      ?? sourcePredictions?.outcomes?.find(o => o.date === pair.actual.date)?.sourceReceipts?.scales
      ?? artifact.sourceReceipts?.scales ?? scales;
    return { settleDays, launchDate: pair.launchDate, settleBy: pair.settleBy, actual: pair.actual,
      grade: gradeSnapshot(forecast, pair.actual, gradingScales, options),
      baseline: gradeSnapshot(carryForward(forecast), pair.actual, gradingScales, options),
      sourcePredictions: createSourcePredictionReport({ ledger: sourcePredictions ?? ledgerFromArtifact(artifact, { launchDate: pair.launchDate }), checkpoint: pair.actual,
        forecast, scales, specs: roles }) };
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
const table = (caption, heads, rows, { cards = false } = {}) => {
  const labeled = cards ? rows.map(r => { let i = 0; return r.replaceAll("<td>", () => `<td data-label="${esc(heads[i++])}">`); }) : rows;
  return `<div class="tablewrap${cards ? " cellcards" : ""}" tabindex="0" role="region" aria-label="${esc(caption)}"><table><caption>${esc(caption)}</caption><thead><tr>${heads.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${labeled.join("\n")}</tbody></table></div>`;
};
const row = cells => `<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
const fraction = value => value == null ? "—" : esc(Number.isFinite(value) ? Math.round(value * 1000) / 1000 : value);
const topOverlap = metric => !metric?.topK ? "—" : metric.topK.informative === false
  ? "— (whole group)" : `${fraction(metric.topK.overlap)}/${esc(metric.topK.of)}`;

function checkpointSummaryHTML(checkpoint) {
  const heading = `<h2 id="checkpoint-${checkpoint.settleDays}">+${esc(checkpoint.settleDays)} days</h2>`;
  if (!checkpoint.grade) return `<section class="checkpoint-summary">${heading}<p class="pending"><b>Pending.</b> ${esc(checkpoint.reason)}</p></section>`;
  const { grade: g, baseline: b } = checkpoint;
  const c = g.coverage;
  const comparable = g.consensusVersion?.comparable === true;
  const baselineComparable = b?.consensusVersion?.comparable === true && b.overall;
  const accuracy = !comparable
    ? `<p class="notice"><b>Ungradeable checkpoint.</b> The frozen prior and settled outcome cannot be compared reliably. Accuracy, ordering, and band differences are withheld; the recorded cells remain available for inspection.</p>`
    : g.overall ? `<p class="result"><b>${esc(g.overall.exactPct)}% exact letters</b> · <b>${esc(g.overall.withinOnePct)}% within one band</b></p>
    ${baselineComparable ? `<p class="baseline"><b>Carry-forward: ${esc(b.overall.exactPct)}% exact · ${esc(b.overall.withinOnePct)}% within one band.</b> This baseline simply kept the pre-launch live tiers.</p>`
      : `<p class="notice"><b>Carry-forward comparison unavailable.</b> The prior's source composition cannot be compared reliably with this outcome; baseline accuracy and any advantage over it are withheld.</p>`}`
    : `<p>No forecast cells could be graded at this checkpoint.</p>`;
  return `<section class="checkpoint-summary">${heading}<p class="endpoint">Frozen ${esc(g.forecastDate)} → settled <b>${esc(g.actualDate)}</b></p>
    <p class="coverage"><b>Coverage: ${esc(c.graded)}/${esc(c.obtainable)} ${comparable ? "gradeable" : "paired"} cells (${esc(c.coveragePct)}%).</b>
    ${esc(c.declined)} declined · ${esc(c.ungradeable)} without an outcome · ${esc(c.rosterGap)} roster gaps.
    ${c.sufficient ? "" : `<strong>Partial coverage${comparable ? ": this grades a subset, not the model" : ""}.</strong>`}</p>
    ${accuracy}</section>`;
}

function checkpointDetailsHTML(checkpoint, forecast) {
  if (!checkpoint.grade) return "";
  const { grade: g, baseline: b, actual } = checkpoint;
  const comparable = g.consensusVersion?.comparable === true;
  const baselineComparable = b?.consensusVersion?.comparable === true;
  const warningLines = reportWarnings(g).map(w => `<p class="notice">${esc(w)}</p>`).join("");
  const rankingRows = Object.entries(g.ranking).filter(([key]) => !key.endsWith("/top-tier")).map(([key, metric]) => {
    const base = baselineComparable ? b.ranking[key] : null;
    return row([esc(key), esc(metric.n), fraction(metric.spearman), fraction(base?.spearman),
      fraction(metric.ndcg), fraction(base?.ndcg), topOverlap(metric), topOverlap(base)]);
  });
  const recall = Object.entries(g.ranking).filter(([key]) => key.endsWith("/top-tier")).map(([key, metric]) =>
    `${esc(bracketName(key.split("/")[0]))}: ${esc(metric.hit)}/${esc(metric.of)} settled S/A+ cells predicted S/A+`).join(" · ");
  const ranking = comparable ? `<details><summary>Ordering within each role</summary><p>Higher is better for all ranking measures. A dash means insufficient evidence or an unavailable comparison.
    Top-k selects 5 DPS or 3 tanks/healers; whole-group overlap is uninformative, while NDCG and rank correlation can still distinguish ordering.</p>
    <p>Grading method ${esc(g.gradingVersion ?? 1)}: tied scores share their places at the cutoff, so overlap may be fractional. Ranking quality averages equally placed ties; spec names never break a scoring tie.</p>
    ${table("Forecast versus carry-forward ordering", ["Bracket / role", "Cells", "Forecast Spearman", "Carry-forward Spearman", "Forecast NDCG@k", "Carry-forward NDCG@k", "Forecast top-k overlap", "Carry-forward top-k overlap"], rankingRows, { cards: true })}
    <p>${recall}</p></details>` : "";
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
  return `<section class="checkpoint-details"><h2>+${esc(checkpoint.settleDays)} days · evidence</h2>
    ${sourcePredictionsHTML(checkpoint.sourcePredictions)}
    ${ranking}
    <details class="cells-detail"><summary>Every declared cell · ${esc(cells.length)} forecast/outcome pairs</summary><p>Scores keep their original snapshot precision; letters were assigned before rounding.${comparable ? " A positive band difference means the settled letter is worse than the forecast." : ""} Open this section and use your browser's Find command to locate a spec.</p>
    ${table(`All forecast cells at +${checkpoint.settleDays} days`, ["Spec", "Bracket", "Forecast", "Forecast score", "Confidence", "Carry-forward", "Settled", "Settled score", comparable ? "Difference / status" : "Status"], cells, { cards: true })}</details>
    <details class="methods"><summary>Checkpoint methods and source composition</summary>
    <p>Launch ${esc(checkpoint.launchDate)}; first eligible date ${esc(checkpoint.settleBy)}.
    Outcome record: <code>data/history/${esc(g.actualDate)}.json</code> (phase ${esc(g.actualPhase)}, consensus v${esc(g.consensusVersion.actual)}).</p>
    <p>Settlement means the first saved consensus at least ${esc(checkpoint.settleDays)} days after launch. It does not certify that every publisher refreshed that day. Publisher-specific outcome dates may be unrecorded in historical snapshots.</p>
    ${table("Consensus source composition", ["Bracket", "Frozen prior contributors", "Settled contributors"], compositionRows)}
    ${warningLines}
    ${comparable && g.overall ? `<p>Mean absolute error: ${esc(g.overall.meanAbsBands)} bands; signed bias: ${esc(g.overall.biasBands)} bands. Positive bias means the forecast was too optimistic.</p>` : ""}
    ${!baselineComparable ? `<p class="notice">Carry-forward source comparison: not comparable. Its accuracy and ordering are withheld independently of the forecast grade.</p>` : ""}
    </details>
  </section>`;
}

// Source comparisons are supplied by the durable historical receipt module.
function sourcePredictionsHTML(report) {
  if (!report) return "";
  const groups = [
    ["same-cutoff", `Sites available at our ${report.forecastDate ?? "frozen"} cutoff`, "These predictions use the same information cutoff as our frozen forecast."],
    ["older-season", "Older-season site benchmarks", "These were earlier live-season rankings, not explicit predictions for the new season. They measure how well carrying an older list forward happened to work."],
    ["later-prelaunch", "Later pre-launch site lists", "These lists had more pre-launch information than our frozen forecast. Keep this comparison separate from the same-cutoff results."],
    ["creator", "Dated creator panels", "Only explicit, scoped ranks are compared. Creator tiers describe ordering within that panel; they are not converted into our consensus letters. Missing or unranked specs stay unknown."]
  ];
  const cohorts = report.cohorts ?? [];
  return `<section class="source-predictions"><h3>Other pre-launch predictions</h3>
    <p>Each comparison uses the same matched specs and checkpoint. Site accuracy uses the saved outlet scale and common consensus bands; creator panels measure ordering only. These small, overlapping samples do not establish a reliable winner.</p>
    ${(report.warnings ?? []).map(w => `<p class="notice">${esc(w)}</p>`).join("")}
    ${report.status !== "ready" ? `<p class="notice">Source comparison unavailable for this checkpoint. Historical evidence is missing; no current ranks are substituted.</p>` : ""}
    ${groups.map(([id, label, description]) => {
      const group = cohorts.filter(c => c.comparisonGroup === id || (id === "creator" && c.kind === "creator"));
      return `<details class="source-group"><summary>${esc(label)} · ${group.length} ${id === "creator" ? "panels" : "lists"}</summary><p>${esc(description)}</p>
        ${group.length ? group.map(sourceCohortHTML).join("\n") : `<p>No gradeable historical prediction receipts were retained for this group. Accuracy is unknown.</p>`}</details>`;
    }).join("\n")}</section>`;
}

function sourceLink(url, label = "Source") {
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) return esc(label);
    return `<a href="${esc(parsed.href)}" rel="noopener noreferrer">${esc(label)}</a>`;
  } catch { return esc(label); }
}

function comparisonMetricsHTML(comparison, caption, kind) {
  if (!comparison) return `<p>Comparison unavailable; the necessary historical evidence was not retained.</p>`;
  const reads = [["Source", comparison.source], ["Our frozen forecast", comparison.ours], ["Carry-forward", comparison.baseline]];
  const summaryRows = reads.map(([label, g]) => {
    const comparable = g && g.consensusVersion?.comparable !== false;
    const count = g?.coverage?.graded ?? g?.coverage?.matched ?? g?.coverage?.rated ?? "—";
    return row([esc(label), esc(count),
      kind === "creator" ? "Order only" : comparable && g.overall ? `${esc(g.overall.exactPct)}%` : "Unavailable",
      kind === "creator" ? "Order only" : comparable && g.overall ? `${esc(g.overall.withinOnePct)}%` : "Unavailable",
      kind === "creator" ? "Order only" : comparable && g.overall ? fraction(g.overall.meanAbsBands) : "Unavailable"]);
  });
  const keys = [...new Set(reads.flatMap(([, g]) => Object.keys(g?.ranking ?? {})))].filter(key => !key.endsWith("/top-tier"));
  const orderingRows = keys.map(key => row([esc(key), ...reads.map(([, g]) => {
    const metric = g?.consensusVersion?.comparable === false ? null : g?.ranking?.[key];
    return metric ? `${fraction(metric.spearman)} · ${topOverlap(metric)} <span class="muted">(n=${esc(metric.n)})</span>` : "—";
  })]));
  return `${table(caption, ["Prediction", "Matched cells", "Exact letters", "Within one band", "Mean error (bands)"], summaryRows, { cards: true })}
    ${orderingRows.length ? `<p>Ordering below: rank correlation · top-k overlap (matched specs). Ties share cutoff places, so overlap can be fractional; a whole-group cutoff has no useful top-k comparison.</p>
    ${table(`${caption} · ordering`, ["Bracket / role", "Source", "Our frozen forecast", "Carry-forward"], orderingRows, { cards: true })}` : `<p>Ordering unavailable: insufficient matched ranks.</p>`}`;
}

function sourceCohortHTML(cohort) {
  const c = cohort.coverage ?? {};
  const scope = [...(cohort.scope?.brackets ?? []).map(bracketName), ...(cohort.scope?.roles ?? [])].join(" · ") || "Scope unrecorded";
  const pages = (cohort.pages ?? []).map(p => `<li>${sourceLink(p.url, [p.bracket ? bracketName(p.bracket) : null, p.role, "source page"].filter(Boolean).join(" · "))} — snapshot ${esc(p.snapshot)}; published ${esc(p.published ?? "unrecorded")}</li>`).join("");
  const exclusions = (cohort.exclusions ?? []).map(e => row([esc(e.key?.replace("|", " ")), esc(e.bracket ? bracketName(e.bracket) : "—"), esc(e.reason)]));
  const receipts = (cohort.rawRows ?? cohort.rows ?? []).map(r => row([esc(r.key?.replace("|", " ") ?? r.spec), esc(r.bracket ? bracketName(r.bracket) : "—"),
    esc(r.nativeTier ?? r.tier ?? r.rank ?? "Unknown"), esc(r.date ?? cohort.date), esc([r.context, r.text, r.reason].filter(Boolean).join(" · ") || "—"),
    esc(cohort.kind !== "creator" ? "Not applicable" : r.supersededAtFreeze ? "Superseded at cutoff" : "Retained at cutoff"), sourceLink(r.url, "Receipt source")]));
  const holdout = cohort.holdout;
  return `<details class="source-cohort"><summary>${esc(cohort.label)} · ${esc(cohort.date)} · ${esc(scope)} · ${esc(c.matched ?? 0)}/${esc(c.eligible ?? c.rated ?? "—")} matched</summary>
    <p>Source date ${esc(cohort.date)} · cutoff ${esc(cohort.cutoffDate ?? cohort.date)}</p>
    <p>Coverage: ${esc(c.rated ?? "—")} rated; ${esc(c.matched ?? "—")} matched. Missing prediction: ${esc(c.missingPrediction ?? "—")} · missing outcome: ${esc(c.missingOutcome ?? "—")} · missing carry-forward: ${esc(c.missingBaseline ?? "—")}.</p>
    ${(cohort.warnings ?? []).map(w => `<p class="notice">${esc(w)}</p>`).join("")}
    ${holdout?.status === "ready" ? `<h4>Outcome excludes ${esc(holdout.excludedPublisher ?? cohort.publisher)}</h4><p>The source being tested is removed from the outcome consensus. All three predictions use the same remaining publisher outcome and matched cells.</p>${comparisonMetricsHTML(holdout, "Publisher-excluded comparison", cohort.kind)}`
      : `<p class="notice"><b>Publisher-excluded comparison ${holdout?.status === "not-applicable" ? "not applicable" : "unavailable"}.</b> ${esc(holdout?.reason ?? "The checkpoint lacks publisher-level historical outcome receipts. No independence claim can be made.")}</p>`}
    <details><summary>Agreement with full publisher consensus</summary><p>This descriptive comparison may share a publisher or other input with the outcome and is not independent validation.</p>
      ${comparisonMetricsHTML(cohort.fullConsensus, "Full-consensus agreement", cohort.kind)}</details>
    <details><summary>Prediction provenance and exclusions</summary><p>Original outlet labels and attributed statements are retained below. Links open the source's current page; the saved historical record is identified by its commit and file hash.</p>
    <dl><dt>Historical Git SHA</dt><dd><code>${esc(cohort.gitSha)}</code></dd><dt>Historical source file</dt><dd>${esc(cohort.sourcePath)}</dd><dt>${cohort.sourceEncoding === "canonical-json" ? "Canonical JSON SHA-256" : "Source file SHA-256"}</dt><dd><code>${esc(cohort.sourceBlobSha256)}</code></dd></dl>
    ${pages ? `<ul>${pages}</ul>` : `<p>Source page receipt unavailable.</p>`}
    ${exclusions.length ? table("Excluded or missing predictions", ["Spec", "Bracket", "Reason"], exclusions) : `<p>No additional per-cell exclusions recorded.</p>`}
    ${receipts.length ? table("Dated prediction receipts", ["Spec", "Bracket", "Native rank/tier", "Date", "Context", "Supersession", "Source"], receipts, { cards: true }) : ""}</details>
    </details>`;
}

function provenanceHTML(artifact) {
  const sourceDates = Object.entries(artifact.sourceDates ?? {}).sort(([a], [b]) => a.localeCompare(b))
    .map(([source, date]) => row([esc(source), esc(date)]));
  const priorReceipts = Object.entries(artifact.cells).sort(([a], [b]) => a.localeCompare(b)).flatMap(([key, cell]) =>
    BRACKETS.map(bracket => row([esc(key.replace("|", " ")), esc(bracketName(bracket)),
      esc((cell.consensus?.[bracket]?.perSource ?? []).map(p => `${p.source}: ${p.tier}${p.lane === "frozen" ? ` (frozen ${p.frozenAsOf ?? "date unrecorded"})` : ""}`).join(" · "))])));
  return `<section><details class="provenance"><summary>Original forecast provenance and receipts</summary><p>The artifact and its explicit history declaration agree on every forecast and prior cell. Forecast values and carry-forward priors come from the immutable artifact, never a new model run.</p>
    <dl><dt>Artifact</dt><dd>data/forecasts/frozen-${esc(artifact.date)}.json</dd>
    <dt>Declared history</dt><dd>data/history/${esc(artifact.date)}.json</dd>
    <dt>Phase</dt><dd>${esc(artifact.phase)}</dd><dt>Versions</dt><dd>Projection ${esc(artifact.projectionVersion)} · consensus ${esc(artifact.consensusVersion)} · rank ${esc(artifact.rankVersion)}</dd>
    <dt>Original Git SHA</dt><dd><code>${esc(artifact.gitSha)}</code></dd><dt>Original data SHA-256</dt><dd><code>${esc(artifact.dataSha256)}</code></dd></dl>
    <details><summary>Source dates recorded at freeze</summary><p>These are each registry source's newest page date at freeze. An outlet that had moved ahead could contribute older frozen prior letters; those dates are disclosed separately below.</p>
    ${table("Registry receipts at freeze", ["Source", "Newest page snapshot"], sourceDates)}</details>
    <details><summary>Prior letters and frozen-source receipts for every cell</summary>${table("Prior source receipts", ["Spec", "Bracket", "Contributors and stored letters"], priorReceipts)}</details></details></section>`;
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
.checkpoint-summaries{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:28px}.checkpoint-summary{min-width:0}.checkpoint-summary h2{margin:0 0 14px}.endpoint{margin:0 0 14px}.checkpoint-details{border-top:1px solid var(--line);padding-top:26px}.result{margin:14px 0 8px}.baseline{margin-top:8px}summary{font-weight:650;padding:7px 0}.source-cohort{border:1px solid var(--line);border-radius:8px;padding:10px 16px}.muted{color:var(--muted)}
@media(max-width:800px){.checkpoint-summaries{grid-template-columns:1fr;gap:0}}
@media(max-width:600px){.cellcards{overflow-x:visible}.cellcards table,.cellcards tbody,.cellcards tr,.cellcards td{display:block;width:100%;white-space:normal}.cellcards caption{display:block}.cellcards thead{display:none}.cellcards tr{padding:12px;border-top:1px solid var(--line)}.cellcards td{display:grid;grid-template-columns:minmax(115px,1fr) minmax(0,1fr);gap:12px;border:0;padding:4px 0;overflow-wrap:anywhere}.cellcards td::before{content:attr(data-label);color:var(--muted)}.cellcards td:first-child{display:block;font-weight:700;font-size:15px;color:var(--gold);padding-bottom:8px}.cellcards td:first-child::before{display:none}.cellcards td:nth-child(2){padding-bottom:8px}.source-cohort{padding:8px 12px}}
</style></head><body><main>
<header><a href="index.html">← Spec Tracker</a><p class="eyebrow">SPEC TRACKER / FORECAST ACCOUNTABILITY</p><h1>Forecast report card</h1>
<p class="lede">Our ${esc(report.artifact.date)} forecast, checked at two fixed checkpoints.</p>
<p>Accuracy means agreement with <b>publisher tier-list consensus</b>. Shared publisher blind spots and objective game performance remain ungraded.</p>
<nav aria-label="Report checkpoints">${report.checkpoints.map(c => `<a href="#checkpoint-${c.settleDays}">+${c.settleDays} days${c.grade ? ` · ${esc(c.grade.actualDate)}` : " · pending"}</a>`).join(" &nbsp;·&nbsp; ")}</nav></header>
<div class="checkpoint-summaries">${report.checkpoints.map(checkpointSummaryHTML).join("\n")}</div>
${report.checkpoints.map(c => checkpointDetailsHTML(c, report.forecast)).join("\n")}
${provenanceHTML(report.artifact)}
<footer>Each completed checkpoint keeps its first eligible historical outcome. Later refreshes do not replace it. <a href="index.html">Return to the tracker</a>.</footer>
</main></body></html>\n`.replace(/[ \t]+\n/g, "\n");
}
