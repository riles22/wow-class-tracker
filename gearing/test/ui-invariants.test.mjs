// Same optional-browser contract as test/ui-invariants.test.mjs: CI installs
// Playwright separately; a missing package skips, an installed broken browser fails.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const artifact = new URL("../wow-s2-gearing.html", import.meta.url);
const engine = process.env.PLAYWRIGHT_BROWSER || "chromium";
if (!["chromium", "firefox", "webkit"].includes(engine)) throw new Error(`Invalid PLAYWRIGHT_BROWSER: ${engine}; choose chromium, firefox, or webkit.`);
let browserType;
try { browserType = (await import("playwright"))[engine]; } catch { /* optional dependency */ }
const reason = !browserType ? "Playwright not installed" : !existsSync(fileURLToPath(artifact)) ? "gearing artifact not built" : null;

test("gearing: every phone disclosure stays within the page and wide loot tables scroll locally",
  reason ? { skip: reason } : {}, async () => {
    const executablePath = engine === "chromium" && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
    const browser = await browserType.launch(executablePath ? { executablePath } : {});
    try {
      for (const width of [320, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 844 } });
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        await page.goto(artifact.href + "#spec=paladin-holy");
        await page.waitForFunction(() => document.querySelector("#spec").value === "Paladin|Holy");
        for (const panel of ["tier", "enh", "up", "src", "paths"]) {
          await page.locator(`#tab-${panel}`).click();
          assert.equal(await page.locator(`#tab-${panel}`).getAttribute("aria-expanded"), "true");
          assert.equal(await page.locator(`#p-${panel}`).isVisible(), true);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${panel} overflows the ${width}px page`);
          if (panel === "src") {
            const tables = await page.locator("#src table").evaluateAll(tables => tables.map(table => {
              const container = table.closest(".table-scroll");
              return { contained: !!container, client: container?.clientWidth, scroll: container?.scrollWidth,
                overflow: container && getComputedStyle(container).overflowX };
            }));
            assert.ok(tables.length >= 3);
            assert.ok(tables.every(table => table.contained && table.overflow === "auto"));
            assert.ok(tables.some(table => table.scroll > table.client), "wide source tables remain available by local scrolling");
          }
          await page.locator(`#tab-${panel}`).click();
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
    } finally { await browser.close(); }
  });
