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
          // The active Build's own guide page, never its bare source key (href="icyveins" until 2026-09-22).
          assert.match(await page.locator("#bis-note a", { hasText: "View the source" }).getAttribute("href"),
            /^https:\/\/www\.(?:icy-veins\.com|wowhead\.com|method\.gg)\//);
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

/* The Venomstone "pre-launch est." label (owner decision 2026-09-26) must be readable TEXT,
   not a tooltip. project.test.mjs pins its markup, and a CSS change such as display:none,
   font-size:0 or a transparent colour would hide it without touching that markup, so this
   checks what the browser actually paints at a phone width and a desktop width. */
test("gearing: the pre-launch estimate labels render as readable text at phone and desktop widths",
  reason ? { skip: reason } : {}, async () => {
    const executablePath = engine === "chromium" && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
    const browser = await browserType.launch(executablePath ? { executablePath } : {});
    try {
      for (const [width, height] of [[375, 812], [1440, 900]]) {
        const page = await browser.newPage({ viewport: { width, height } });
        try {
          await page.goto(artifact.href + "#spec=mage-frost");
          await page.evaluate(() => document.fonts.ready);
          await page.locator("#tab-paths").click();
          const labels = await page.locator("#p-paths .ilvl-est").evaluateAll(els => els.map(el => {
            const rgba = color => { const [r, g, b, a = 1] = color.match(/[\d.]+/g).map(Number); return { r, g, b, a }; };
            const luminance = ({ r, g, b }) => [r, g, b].map(n => {
              const s = n / 255;
              return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            }).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
            let bgEl = el;
            while (bgEl && rgba(getComputedStyle(bgEl).backgroundColor).a < 1) bgEl = bgEl.parentElement;
            const bg = rgba(getComputedStyle(bgEl || document.body).backgroundColor);
            const fg = rgba(getComputedStyle(el).color);
            // a translucent colour is painted over the background, so blend before measuring
            const seen = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
            const [l1, l2] = [luminance(seen), luminance(bg)];
            const rect = el.getBoundingClientRect();
            const box = el.closest(".ceil, td, #paths-note");
            const outer = box.getBoundingClientRect();
            return {
              where: box.id || box.className || box.tagName.toLowerCase(),
              text: el.innerText.trim(),
              painted: el.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
              fontSize: parseFloat(getComputedStyle(el).fontSize),
              height: rect.height,
              contrast: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05),
              inside: rect.left >= outer.left - 0.5 && rect.right <= outer.right + 0.5
                && rect.top >= outer.top - 0.5 && rect.bottom <= outer.bottom + 0.5,
            };
          }));
          for (const where of ["paths-note", "ceil", "td"])
            assert.ok(labels.some(label => label.where === where), `${width}px: a label renders in ${where}`);
          for (const label of labels) {
            const at = `${width}px ${label.where}: ${JSON.stringify(label)}`;
            assert.match(label.text, /^pre-launch est\.$/i, at);
            assert.equal(label.painted, true, at);
            assert.ok(label.fontSize >= 9 && label.height >= 10, at);
            assert.ok(label.contrast >= 4.5, at);
            assert.equal(label.inside, true, at);
          }
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `the Item levels panel overflows the ${width}px page`);
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

/* Tooltip markup is Wowhead's, captured at harvest: third-party HTML. showTip copies an
   allowlist out of an inert DOMParser document instead of assigning innerHTML (CodeQL
   triage 2026-09-22). Two halves: every harvested tooltip must survive the copy with its
   text, elements and classes intact, and a hostile one must lose everything else. */
test("gearing: item tooltips copy only allowlisted markup out of captured third-party HTML",
  reason ? { skip: reason } : {}, async () => {
    const executablePath = engine === "chromium" && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
    const browser = await browserType.launch(executablePath ? { executablePath } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(artifact.href + "#spec=mage-frost");
      await page.waitForFunction(() => document.querySelector("#spec").value === "Mage|Frost");

      const fidelity = await page.evaluate(() => {
        const shape = root => [...root.querySelectorAll("*")]
          .filter(el => TIP_TAGS.has(el.tagName.toLowerCase()))
          .map(el => [el.tagName.toLowerCase(), ...el.classList].join("."));
        const lost = [];
        let checked = 0;
        for (const it of Object.values(BY_ID)) {
          if (!it.html) continue;
          checked++;
          const ref = new DOMParser().parseFromString(it.html, "text/html").body;
          const box = document.createElement("div");
          box.appendChild(safeTooltip(it.html));
          if (box.textContent !== ref.textContent || shape(box).join() !== shape(ref).join()) lost.push(it.id);
        }
        return { checked, lost };
      });
      assert.ok(fidelity.checked >= 50, `expected the harvested tooltip corpus, checked ${fidelity.checked}`);
      assert.deepEqual(fidelity.lost, [], "a harvested tooltip lost text, elements or classes in the copy");

      const hostile = '<table width="100%"><tr><td><b class="q4">Probe Blade</b><br>'
        + '<span style="color: #00FF00">Equip: kept colour</span><br>'
        + '<a href="javascript:window.__pwned=1" target="_blank" class="q2 finder-ov" style="position:fixed;inset:0">Click me</a>'
        + '<img src="x" onerror="window.__pwned=1"><script>window.__pwned=1</script><style>body{display:none}</style>'
        + '<div class="whtt-extra" onclick="window.__pwned=1" id="spoof"><!-- note -->Visible stat line</div>'
        + '<span style="position:fixed;inset:0;background:red">Overlay text</span>'
        + '<svg><script>window.__pwned=1</script><a href="javascript:void 0">svg link</a></svg>'
        + '<form action="https://example.invalid/"><input name="password"></form></td></tr></table>';
      const shown = await page.evaluate(async html => {
        const row = [...document.querySelectorAll(".row[data-id]")].find(r => BY_ID[r.getAttribute("data-id")]?.html);
        BY_ID[row.getAttribute("data-id")].html = html;
        showTip(row, null);
        await new Promise(resolve => setTimeout(resolve, 300));   // time for an onerror to fire, if one could
        const tip = document.getElementById("tip");
        const els = [...tip.querySelectorAll("*")];
        const result = {
          pwned: window.__pwned ?? null,
          visible: getComputedStyle(tip).display,
          tags: [...new Set(els.map(el => el.tagName.toLowerCase()))].sort(),
          attrs: els.flatMap(el => [...el.attributes].map(a => `${el.tagName.toLowerCase()}@${a.name}=${a.value}`)).sort(),
          comments: document.createTreeWalker(tip, NodeFilter.SHOW_COMMENT).nextNode() ? 1 : 0,
          text: tip.textContent,
          source: document.getElementById("tip-src")?.textContent ?? null,
        };
        hideTip();
        return result;
      }, hostile);
      assert.equal(shown.pwned, null, "no handler or script from tooltip markup may run");
      assert.equal(shown.visible, "block");
      assert.deepEqual(shown.tags, ["a", "b", "br", "div", "span", "table", "tbody", "td", "tr"]);
      assert.deepEqual(shown.attrs, ["a@class=q2", "b@class=q4", "div@class=whtt-extra", "div@id=tip-src",
        "span@style=color: #00FF00", "table@width=100%"]);
      assert.equal(shown.comments, 0);
      for (const kept of ["Probe Blade", "Equip: kept colour", "Click me", "Visible stat line", "Overlay text", "svg link"])
        assert.ok(shown.text.includes(kept), `tooltip text lost: ${kept}`);
      assert.ok(!shown.text.includes("__pwned") && !shown.text.includes("display:none"),
        "script and style bodies must not become visible text");
      assert.match(shown.source, / · /);
      assert.doesNotMatch(shown.source, /&[a-z]+;/, "the source line is plain text, so it carries no entities");
      assert.deepEqual(errors, []);
    } finally { await browser.close(); }
  });
