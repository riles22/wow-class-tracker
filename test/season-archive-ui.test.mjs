/* Archive layout and keyboard checks use a temporary render, never shared dist/. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderSeasonArchive } from "../src/render-season-archive.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENGINE = process.env.PLAYWRIGHT_BROWSER || "chromium";
if (!["chromium", "firefox", "webkit"].includes(ENGINE)) throw new Error(`Unknown browser: ${ENGINE}`);
let playwright;
try { playwright = await import("playwright"); } catch { /* Optional browser dependency. */ }
let browser;
const dir = mkdtempSync(path.join(tmpdir(), "season-archive-ui-"));
const archive = JSON.parse(readFileSync(path.join(ROOT, "data/season-archive/s1.json"), "utf8"));
const artifact = path.join(dir, "s1.html");
writeFileSync(artifact, await renderSeasonArchive(archive, { root: ROOT }));

after(async () => {
  await browser?.close();
  assert.ok(path.resolve(dir).startsWith(path.resolve(tmpdir()) + path.sep));
  rmSync(dir, { recursive: true, force: true });
});

test("archive phone navigation stays visible and wide tables scroll by keyboard", {
  skip: !playwright ? "playwright not installed — season archive UI invariants skipped" : false
}, async () => {
  browser = await playwright[ENGINE].launch(ENGINE === "chromium" && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {});
  const page = await browser.newPage();
  try {
    await page.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(artifact).href);
    for (const width of [320, 375, 390, 1440]) {
      await page.setViewportSize({ width, height: 812 });
      const tabs = await page.locator(".sitetab").evaluateAll(els => els.map(el => {
        const box = el.getBoundingClientRect(), masthead = el.closest(".masthead").getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, mastheadBottom: masthead.bottom };
      }));
      assert.equal(tabs.length, 3);
      for (const tab of tabs) {
        assert.ok(tab.left >= 0 && tab.right <= width, `all archive tabs fit at ${width}px`);
        assert.ok(tab.bottom <= tab.mastheadBottom + 1, "wrapped tabs are not clipped by the masthead");
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    }
    await page.setViewportSize({ width: 375, height: 812 });
    for (const title of ["Raid", "Mythic+"]) {
      const region = page.getByRole("region", { name: `${title} final standings`, exact: true });
      await region.focus();
      assert.equal(await region.evaluate(el => document.activeElement === el), true);
      assert.equal(await region.evaluate(el => getComputedStyle(el).outlineStyle), "solid");
      assert.ok(await region.evaluate(el => el.scrollWidth > el.clientWidth));
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(() => document.activeElement.scrollLeft > 0);
    }
    assert.equal(await page.locator("script").count(), 0);
  } finally { await page.close(); }
});
