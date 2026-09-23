"use strict";
const { test, expect } = require("@playwright/test");
const { rates } = require("../src/data/site.config.cjs");
const AxeBuilder = require("@axe-core/playwright").default;

test.beforeEach(async ({ context, page }) => {
  await context.route("https://www.google.com/maps/embed*", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Map fixture</title>" }));
  await context.route("https://wa.me/**", route => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function unobscured(page, selector) {
  await expect.poll(() => page.locator(selector).evaluate(element => {
    const rect = element.getBoundingClientRect();
    const headerBottom = document.querySelector(".site-header").getBoundingClientRect().bottom;
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return rect.top >= headerBottom && rect.bottom <= innerHeight && !!hit && (hit === element || element.contains(hit));
  })).toBe(true);
}

for (const [width, lang, theme] of [[320, "ms", "light"], [390, "en", "dark"], [1440, "en", "light"]]) {
  test(`${width}px ${lang} package selection lands at dates with a visible summary and retains details when changing`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(lang === "en" ? "/en.html" : "/");
    for (const rate of rates) {
      await page.locator(`.package-link[data-rooms="${rate.rooms}"]`).click();
      await expect(page.locator("#checkin")).toBeFocused();
      await expect(page.locator("#rooms")).toHaveValue(String(rate.rooms));
      await expect(page.locator("#enquiryPackageName")).toHaveText(`${rate.rooms} ${lang === "en" ? "rooms" : "bilik"} · RM${rate.price} / ${lang === "en" ? "night" : "malam"}`);
      await expect(page.locator("#enquiryPackageMeta")).toContainText(`${rate.bathrooms} ${lang === "en" ? "bathrooms" : "bilik air"}`);
      await unobscured(page, "#enquiryFormTitle");
      await unobscured(page, "#checkin");
      await unobscured(page, "#enquiryPackageName");
    }
    await page.locator("#checkin").fill("2027-12-30");
    await page.locator("#checkout").fill("2028-01-01");
    await page.locator("#guests").fill("8");
    await page.locator("#notes").fill("Family arrival details");
    await page.locator("#changeEnquiryPackage").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator('.package-link[data-rooms="5"]')).toBeFocused();
    await unobscured(page, '.package-link[data-rooms="5"]');
    await page.locator('.package-link[data-rooms="3"]').click();
    await expect(page.locator("#enquiryFormTitle")).toBeFocused();
    await unobscured(page, "#enquiryFormTitle");
    await expect(page.locator("#checkin")).toHaveValue("2027-12-30");
    await expect(page.locator("#checkout")).toHaveValue("2028-01-01");
    await expect(page.locator("#guests")).toHaveValue("8");
    await expect(page.locator("#notes")).toHaveValue("Family arrival details");
    await expect(page.locator("#estimateTotal")).toHaveText("RM460");
    await page.locator("#rooms").selectOption("4");
    await expect(page.locator("#enquiryPackageName")).toContainText("RM280");
    await page.reload();
    await expect(page.locator("#enquiryPackageName")).toContainText("RM280");
    await expect(page.locator("#estimateTotal")).toHaveText("RM560");
    expect((await new AxeBuilder({page}).include(".enquiry-panel").analyze()).violations).toEqual([]);
    await page.locator("#clearEnquiryDraft").click();
    await expect(page.locator("#enquiryPackageName")).toContainText("RM170");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("package selection directs an incomplete stay to checkout and modified clicks leave the current form untouched", async ({ page }) => {
  await page.goto("/");
  await page.locator("#checkin").fill("2027-12-30");
  await page.locator('.package-link[data-rooms="3"]').click();
  await expect(page.locator("#checkout")).toBeFocused();
  await unobscured(page, "#checkout");
  // Observe the real trusted click after the product handler, suppressing only
  // the browser's tab action; this test checks interception, not tab creation.
  await page.evaluate(() => document.addEventListener("click", event => {
    if (!event.target.closest('.package-link[data-rooms="5"]')) return;
    window.__packageClick = { trusted: event.isTrusted, prevented: event.defaultPrevented };
    event.preventDefault();
  }));
  await page.locator('.package-link[data-rooms="5"]').click({ modifiers: ["Control", "Shift"] });
  expect(await page.evaluate(() => window.__packageClick)).toEqual({ trusted: true, prevented: false });
  await expect(page.locator("#rooms")).toHaveValue("3");
});

test("short and landscape viewports prioritise the incomplete date over the package summary", async ({ page }) => {
  for (const [width, height] of [[568, 320], [320, 480]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.locator("#checkin").fill("2027-12-30");
    await page.locator('.package-link[data-rooms="4"]').click();
    await expect(page.locator("#checkout")).toBeFocused();
    await unobscured(page, "#checkout");
  }
});
