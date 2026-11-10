const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const out = process.env.OUT || "docs/next-action/edges";
  fs.mkdirSync(out, { recursive: true });
  try {
    for (const width of [390, 1320]) {
      const page = await browser.newPage({
        viewport: { width, height: 844 },
        reducedMotion: "reduce",
      });
      await page.addInitScript(() => {
        localStorage.setItem("esp32:done", "[0,1,9]");
        localStorage.setItem(
          "esp32:settings",
          JSON.stringify({ reduceMotion: true, lang: "ta" }),
        );
      });
      await page.goto(process.env.BASE_URL || "http://127.0.0.1:8796");
      await page.waitForSelector("#app[aria-hidden=false]");
      await page.locator(".lesson-card").nth(1).click();
      assert.equal(
        await page.locator("#blinkGuide").getAttribute("lang"),
        "en",
      );
      const before = await page.evaluate(() =>
        localStorage.getItem("esp32:done"),
      );
      await page.locator("#guideNext").focus();
      await page.keyboard.down("Enter");
      await page.keyboard.down("Enter");
      await page.keyboard.down("Enter");
      await page.keyboard.up("Enter");
      await page.waitForFunction(
        () =>
          document.querySelector("#guideNext").getAttribute("aria-disabled") ===
          "false",
      );
      assert.equal(await page.locator("#guideProgress").innerText(), "1 / 5");
      await page.locator("#guideReset").click();
      assert.equal(await page.locator("#guideProgress").innerText(), "0 / 5");
      await page.locator("#guideNext").dblclick({ delay: 15 });
      await page.waitForFunction(
        () =>
          document.querySelector("#guideNext").getAttribute("aria-disabled") ===
          "false",
      );
      assert.equal(await page.locator("#guideProgress").innerText(), "1 / 5");
      await page.locator(".tab[data-tab=pinout]").click();
      assert.equal(await page.locator("#guideProgress").innerText(), "1 / 5");
      await page.locator(".tab[data-tab=overview]").click();
      for (let i = 1; i < 5; i++) {
        await page.locator("#guideNext").click();
        await page.waitForFunction(
          () =>
            document
              .querySelector("#guideNext")
              .getAttribute("aria-disabled") === "false",
        );
      }
      assert.equal(await page.locator("#guideNext").innerText(), "Next lesson");
      await page.locator("#guideContinuous").click();
      assert.equal(
        await page.locator("#btnRun").getAttribute("class"),
        "icon-btn primary is-running",
      );
      await page.locator("#btnRun").click();
      await page.locator("#guideReset").click();
      assert.equal(await page.locator("#guideProgress").innerText(), "0 / 5");
      for (let i = 0; i < 5; i++) {
        await page.locator("#guideNext").click();
        await page.waitForFunction(
          () =>
            document
              .querySelector("#guideNext")
              .getAttribute("aria-disabled") === "false",
        );
      }
      await page.locator("#guideNext").press("Space");
      await page.waitForFunction(
        () => document.querySelector(".lesson-card.on").dataset.i === "2",
      );
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "stageWrap",
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem("esp32:done")),
        before,
      );
      await page.screenshot({ path: `${out}/continued-tamil-${width}.png` });
      await page.close();
    }
    fs.writeFileSync(
      `${out}/results.json`,
      JSON.stringify(
        {
          pass: true,
          widths: [390, 1320],
          checks: [
            "restored completion unchanged",
            "Tamil shell with explicit English guide",
            "held Enter",
            "rapid double click",
            "Replay",
            "tab switching",
            "continuous and stop",
            "Space continuation and focus",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
