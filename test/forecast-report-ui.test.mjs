/* The report is static HTML: these checks exercise its native disclosures, links,
   keyboard navigation and responsive tables without requiring a shared dist build. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadData } from "../src/validate.mjs";
import { loadSnapshots } from "../src/report-card.mjs";
import { createForecastReport, renderForecastReport } from "../src/render-forecast-report.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENGINE = process.env.PLAYWRIGHT_BROWSER || "chromium";
if (!["chromium", "firefox", "webkit"].includes(ENGINE)) throw new Error(`Unknown browser: ${ENGINE}`);
let playwright;
try { playwright = await import("playwright"); } catch { /* Optional browser dependency. */ }
let browser;
const dir = mkdtempSync(path.join(tmpdir(), "forecast-report-ui-"));
const data = await loadData(ROOT);
data.historySnapshots = await loadSnapshots(ROOT);
const report = createForecastReport(data);
const artifact = path.join(dir, "forecast-report.html");
writeFileSync(artifact, renderForecastReport(report));
writeFileSync(path.join(dir, "index.html"), '<!doctype html><title>Tracker return target</title><h1>Tracker</h1>');

after(async () => {
  await browser?.close();
  assert.ok(path.resolve(dir).startsWith(path.resolve(tmpdir()) + path.sep));
  rmSync(dir, { recursive: true, force: true });
});

const ui = (name, fn) => test(name, { skip: !playwright ? "playwright not installed — forecast report UI invariants skipped" : false }, async () => {
  browser ??= await playwright[ENGINE].launch(ENGINE === "chromium" && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {});
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [], requests = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("request", r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
  try {
    await page.goto(pathToFileURL(artifact).href);
    await fn(page);
    assert.deepEqual(errors, [], "report has no runtime errors");
    assert.deepEqual(requests, [], "source citations do not request external content on load or disclosure");
    assert.equal(await page.locator("script").count(), 0);
  } finally { await page.close(); }
});

ui("forecast report shows both summaries and the grade before detailed evidence", async page => {
  const layout = await page.evaluate(() => {
    const rect = selector => document.querySelector(selector).getBoundingClientRect();
    return { result: rect(".result").bottom, coverage: rect(".coverage").bottom,
      pending: rect("#checkpoint-28").top, details: rect(".checkpoint-details").top,
      width: document.documentElement.scrollWidth, viewport: innerWidth };
  });
  assert.ok(layout.result < 900, "headline grade fits in the first desktop viewport");
  assert.ok(layout.result > layout.coverage);
  assert.ok(layout.pending < layout.details, "+28 summary is not buried under 80 rows");
  assert.equal(layout.width, layout.viewport);
  assert.equal(await page.locator(".cells-detail").first().evaluate(e => e.open), false);
});

ui("forecast report mobile rows retain spec, forecast, outcome and difference together", async page => {
  for (const width of [320, 375, 390]) {
    await page.setViewportSize({ width, height: 812 });
    await page.locator(".cells-detail").first().evaluate(e => { e.open = true; });
    const measurement = await page.locator(".cells-detail .cellcards").first().evaluate(el => {
      const row = el.querySelector("tbody tr");
      return { documentWidth: document.documentElement.scrollWidth, viewport: innerWidth,
        regionWidth: el.clientWidth, scrollWidth: el.scrollWidth,
        cells: [...row.children].map(td => ({ text: td.innerText, label: td.dataset.label,
          left: td.getBoundingClientRect().left, right: td.getBoundingClientRect().right,
          display: getComputedStyle(td).display })) };
    });
    assert.equal(measurement.documentWidth, width);
    assert.ok(measurement.scrollWidth <= measurement.regionWidth + 1, "per-spec evidence needs no horizontal scrolling");
    assert.equal(measurement.cells.length, 9);
    for (const label of ["Spec", "Forecast", "Settled", "Difference / status"]) {
      const cell = measurement.cells.find(c => c.label === label);
      assert.ok(cell && cell.text.trim());
      assert.ok(cell.left >= 0 && cell.right <= width, `${label} remains on screen at ${width}px`);
    }
  }
});

ui("forecast report keyboard reaches checkpoints, opens disclosures and returns to tracker", async page => {
  // WebKit follows the host preference that skips links in ordinary Tab navigation.
  // Explicit focus still verifies keyboard activation and its visible focus indicator.
  if (ENGINE === "webkit") await page.locator('header > a[href="index.html"]').focus();
  else await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.textContent), "← Spec Tracker");
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  assert.equal(outline, "solid");
  await page.locator('a[href="#checkpoint-28"]').focus();
  await page.keyboard.press("Enter");
  assert.ok(page.url().endsWith("#checkpoint-28"));
  const summary = page.locator(".cells-detail > summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  assert.equal(await summary.evaluate(e => e.parentElement.open), true);
  await page.keyboard.press("Enter");
  assert.equal(await summary.evaluate(e => e.parentElement.open), false);
  await page.locator('header > a[href="index.html"]').click();
  assert.equal(await page.title(), "Tracker return target");
});

ui("all source and provenance disclosures stay inside a phone viewport", async page => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => { for (const details of document.querySelectorAll("details")) details.open = true; });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 375);
  assert.ok(await page.locator(".source-group").count() >= 4);
  assert.ok(await page.locator(".source-cohort").count() >= 1);
  const ids = await page.locator("[id]").evaluateAll(els => els.map(el => el.id));
  assert.equal(ids.length, new Set(ids).size);
  const sourceLinks = await page.locator('.source-predictions a[href^="https:"]').count();
  assert.ok(sourceLinks > 0, "historical source citations remain available offline");
  const comparison = page.locator('.source-predictions [aria-label="Publisher-excluded comparison"]').first();
  const metrics = await comparison.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth,
    cells: [...el.querySelector('tbody tr').children].map(td => ({ label: td.dataset.label,
      left: td.getBoundingClientRect().left, right: td.getBoundingClientRect().right })) }));
  assert.ok(metrics.scroll <= metrics.width + 1, "source prediction and all accuracy columns stay together");
  assert.ok(metrics.cells.some(c => c.label === "Mean error (bands)"));
  assert.ok(metrics.cells.every(c => c.left >= 0 && c.right <= 375));
  const ordering = await page.locator('.source-predictions [aria-label="Publisher-excluded comparison · ordering"]').first()
    .evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
  assert.ok(ordering.scroll <= ordering.width + 1, "source ranking comparisons also need no horizontal scrolling");
});
