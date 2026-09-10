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

test("gearing: phone starts with a complete recommendation and readable contextual labels",
  reason ? { skip: reason } : {}, async () => {
    const executablePath = engine === "chromium" && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
    const browser = await browserType.launch(executablePath ? { executablePath } : {});
    try {
      for (const spec of ["death-knight-blood", "mage-frost", "paladin-holy"]) {
        // A fragment-only navigation preserves the previous page's open disclosures.
        // A separate page/context gives every engine a fresh initial spec and state.
        const page = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
        try {
          await page.goto(artifact.href + "#spec=" + spec);
          await page.evaluate(() => document.fonts.ready);
          const first = page.locator(".sslot > summary").first();
          const bounds = await first.boundingBox();
          assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 812,
            `${spec}: first complete recommendation should appear in the opening viewport (${JSON.stringify(bounds)})`);
          assert.match(await first.locator(".scons").innerText(), /(?:\d\/3|—) guides/);
          assert.equal(await page.locator("#bis-note details").getAttribute("open"), null);
          assert.match(await page.locator("#bis-note").innerText(), /Not a character simulation/);
          await page.locator("#bis-note summary").click();
          assert.match(await page.locator("#bis-note").innerText(), /never summed/);
          assert.match(await page.locator("#bis-note").innerText(), /View the source/);
          const contrast = await page.locator(".sname").first().evaluate(el => {
            const luminance = color => {
              const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(n => {
                const s = n / 255;
                return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
              });
              return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
            };
            const fg = luminance(getComputedStyle(el).color);
            const bg = luminance(getComputedStyle(el.closest(".sheet")).backgroundColor);
            return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
          });
          assert.ok(contrast >= 4.5, `slot-label contrast: ${contrast}`);
        } finally { await page.close(); }
      }
    } finally { await browser.close(); }
  });

test("gearing: custom weights keep controls contained and remove inapplicable guide columns",
  reason ? { skip: reason } : {}, async () => {
    const executablePath = engine === "chromium" && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
    const browser = await browserType.launch(executablePath ? { executablePath } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 641, height: 900 } });
      await page.goto(artifact.href + "#spec=mage-frost");
      await page.locator("#scoring-mode").selectOption("custom");
      // Empty custom mode must retain the actual, still-active guide ranking.
      assert.match(await page.locator(".shead").textContent(), /Guide pick/);
      for (const filled of [false, true]) {
        if (filled) {
          for (const stat of ["crit", "haste", "mast", "vers"])
            await page.locator("#weight-" + stat).fill("1.25");
        }
        for (const width of [375, 640, 641, 700, 900, 901, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          const layout = await page.locator("#weight-editor").evaluate(editor => {
            const outer = editor.getBoundingClientRect();
            return [...editor.querySelectorAll("input,button")].map(el => {
              const rect = el.getBoundingClientRect();
              return { left: rect.left, right: rect.right, outerLeft: outer.left, outerRight: outer.right };
            });
          });
          assert.ok(layout.every(r => r.left >= r.outerLeft && r.right <= r.outerRight),
            `${width}px, filled=${filled}: every weight control stays inside its editor`);
          if (filled) {
            assert.match(await page.locator(".shead").textContent(), /Custom pick/);
            assert.doesNotMatch(await page.locator(".shead").textContent(), /Guide pick|Guides/);
            assert.equal(await page.locator(".sslot > summary .scons").count(), 0);
          }
        }
      }
    } finally { await browser.close(); }
  });

test("gearing: parsed and fallback-updated item rows retain keyboard tooltip access",
  reason ? { skip: reason } : {}, async () => {
    const executablePath = engine === "chromium" && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
    const browser = await browserType.launch(executablePath ? { executablePath } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(artifact.href + "#spec=mage-frost");
      await page.locator("#tab-up").click();
      // Synthetic UI fixture with deliberately unknown item ID; no game fact is asserted.
      await page.locator("#simc").fill("head=audit_sample,id=1");
      await page.locator("#parse").click();
      for (const fallback of [null, "301"]) {
        if (fallback) await page.locator("#curilvl").fill(fallback);
        const rows = page.locator("#up .row[data-id]");
        assert.ok(await rows.count() > 0);
        assert.deepEqual(await rows.evaluateAll(els => [...new Set(els.map(el => el.tabIndex))]), [0]);
        await page.locator("#curilvl").focus();
        await page.keyboard.press("Tab");
        assert.equal(await rows.first().evaluate(el => document.activeElement === el), true);
        assert.equal(await rows.first().getAttribute("aria-describedby"), "tip");
        assert.equal(await page.locator("#tip").isVisible(), true);
        assert.ok((await page.locator("#tip").textContent()).length > 10);
        const focusedTooltip = await page.locator("#tip").textContent();
        await rows.nth(1).hover();
        assert.equal(await rows.first().getAttribute("aria-describedby"), "tip",
          "hovering another item must not steal the keyboard-focused item's tooltip");
        assert.equal(await page.locator("#tip").textContent(), focusedTooltip);
        await page.keyboard.press("Escape");
        assert.equal(await page.locator("#tip").isVisible(), false);
        assert.equal(await rows.first().getAttribute("aria-describedby"), null);
      }
    } finally { await browser.close(); }
  });
