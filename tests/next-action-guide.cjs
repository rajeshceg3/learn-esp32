const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright"),
  assert = require("node:assert/strict"),
  fs = require("fs");
(async () => {
  const b = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  let results = [];
  const out = process.env.OUT || "docs/next-action/local";
  fs.mkdirSync(out, { recursive: true });
  try {
    for (const [w, h] of JSON.parse(process.env.VIEWPORTS || "[[390,844]]")) {
      let p = await b.newPage({
        viewport: { width: w, height: h },
        reducedMotion: process.env.MOTION || "reduce",
      });
      let errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(process.env.BASE_URL || "http://127.0.0.1:8796");
      await p.waitForSelector("#app[aria-hidden=false]");
      for (const [i, count] of JSON.parse(
        process.env.GUIDES ||
          "[[1,5],[9,7],[10,6],[11,4],[12,7],[13,7],[14,14],[15,9]]",
      )) {
        await p.locator(".lesson-card").nth(i).click();
        for (let n = 0; n < count; n++) {
          await p.locator("#guideNext").click();
          await p.waitForFunction(
            () =>
              document
                .querySelector("#guideNext")
                ?.getAttribute("aria-disabled") === "false",
          );
          assert.equal(
            await p.locator("#guideProgress").innerText(),
            `${n + 1} / ${count}`,
          );
        }
        assert.equal(
          await p.locator("#guideNext").innerText(),
          i === 15 ? "Choose a lesson" : "Next lesson",
        );
        await p.waitForTimeout(100);
        assert.equal(
          await p.locator(".lesson-card.on").getAttribute("data-i"),
          String(i),
        );
        if (i === 1 || i === 15)
          await p.screenshot({ path: `${out}/finished-${i}-${w}.png` });
        await p.locator("#guidePrevious").click();
        assert.equal(await p.locator("#guideNext").innerText(), "Next step");
        await p.locator("#guideNext").click();
        await p.waitForFunction(
          () =>
            document
              .querySelector("#guideNext")
              ?.getAttribute("aria-disabled") === "false",
        );
        await p.locator("#guideNext").press("Enter");
        if (i < 15) {
          await p.waitForFunction(
            (j) =>
              document.querySelector(".lesson-card.on")?.dataset.i ===
              String(j),
            i + 1,
          );
          assert.equal(
            await p.evaluate(() => document.activeElement.id),
            "stageWrap",
          );
          if (i >= 9) {
            assert.match(
              await p.locator("#guideProgress").innerText(),
              /^0 \/ /,
            );
            await p.keyboard.down("Enter");
            await p.keyboard.down("Enter");
            await p.keyboard.up("Enter");
            assert.match(
              await p.locator("#guideProgress").innerText(),
              /^0 \/ /,
            );
          }
        } else {
          assert.equal(
            await p.locator(".lesson-card.on").getAttribute("data-i"),
            "15",
          );
          assert.equal(
            await p.evaluate(() => document.activeElement.dataset.i),
            "15",
          );
        }
        results.push({
          w,
          i,
          completeHolds: true,
          backThenNext: true,
          explicitContinuation: true,
        });
      }
      await p.evaluate(() => scrollTo(0, 0));
      await p
        .locator((w >= 1024 ? "#sidebar" : "#bottomnav") + " [data-k=lessons]")
        .click();
      await p.waitForTimeout(600);
      assert.equal(
        await p.evaluate(() =>
          document.activeElement.classList.contains("lesson-card"),
        ),
        true,
      );
      let r = await p.locator(".lesson-card.on").boundingBox();
      assert.ok(
        r.y >= 0 && r.y + r.height < h - (w >= 1024 ? 0 : 55),
        JSON.stringify(r),
      );
      await p.screenshot({ path: `${out}/lesson-nav-${w}.png` });
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.deepEqual(errors, []);
      await p.close();
    }
    fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
    console.log(results);
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
