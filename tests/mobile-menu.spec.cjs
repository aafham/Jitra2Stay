"use strict";

const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ context }) => {
  await context.route(url => url.origin === "https://www.google.com" && url.pathname === "/maps/embed", async route => {
    if (!route.request().isNavigationRequest() || !route.request().frame().parentFrame()) return route.continue();
    await route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="en"><title>Map fixture</title><main>Map verified separately.</main></html>' });
  });
  await context.route("https://wa.me/**", route => route.abort());
});

test("mobile navigation stays fixed while browsing prices and focusing its links does not shift content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/harga.html");
  const nav = page.locator(".mobile-bottom-nav");
  await expect(nav).toBeVisible();
  await expect(page.locator("#menuToggle")).toBeHidden();
  await expect(page.locator("#mainNav")).toBeHidden();
  await expect(page.locator(".mobile-action-bar")).toBeHidden();
  const before = await nav.boundingBox();
  await page.locator(".package-card").last().scrollIntoViewIfNeeded();
  await expect.poll(() => nav.boundingBox()).toEqual(before);
  const position = () => page.evaluate(() => ({
    scroll: scrollY,
    header: document.querySelector(".site-header").getBoundingClientRect().height,
    section: document.querySelector("#kadar").getBoundingClientRect().top
  }));
  const reading = await position();
  await nav.locator("a").first().focus();
  for (let index = 1; index < 5; index++) await page.keyboard.press("Tab");
  await expect(nav.locator("a").last()).toBeFocused();
  expect(await position()).toEqual(reading);
  await page.keyboard.press("Escape");
  await expect(nav).toBeVisible();
  await expect(nav.locator("a").last()).toBeFocused();
});

for (const [width, height, language] of [[320, 568, "ms"], [390, 844, "en"], [568, 320, "ms"], [844, 390, "en"]]) {
  test(`${language} five mobile tabs stay within ${width}×${height} and work by keyboard`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(language === "en" ? "/en.html" : "/");
    const nav = page.locator(".mobile-bottom-nav");
    const links = nav.locator("a");
    await expect(nav).toBeVisible();
    await expect(links).toHaveCount(5);
    await expect(page.locator("#menuToggle")).toBeHidden();
    await expect(page.locator("#mainNav")).toBeHidden();
    const bounds = await nav.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(height + 1);
    await links.first().focus();
    for (let index = 0; index < 5; index++) {
      if (index) await page.keyboard.press("Tab");
      const link = links.nth(index);
      await expect(link).toBeFocused();
      expect(await link.evaluate(element => {
        const box = element.getBoundingClientRect();
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return box.width >= 44 && box.height >= 44 && box.top >= 0 && box.bottom <= innerHeight + 1 && (hit === element || element.contains(hit));
      })).toBe(true);
    }
    await page.keyboard.press("Enter");
    const suffix = language === "en" ? "-en" : "";
    await expect(page).toHaveURL(new RegExp(`/maklumat${suffix}\\.html$`));
    await expect(page.locator('.mobile-bottom-nav a[aria-current="page"]')).toHaveText(language === "en" ? "More" : "Lagi");
    await page.locator(`.browse-links a[href="lokasi${suffix}.html"]`).click();
    await expect(page).toHaveURL(new RegExp(`/lokasi${suffix}\\.html$`));
    await expect(page.locator("#lokasi")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("supporting pages switch between mobile tabs and desktop navigation at the breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/policies-en.html");
  const nav = page.locator("#mainNav");
  const tabs = page.locator(".mobile-bottom-nav");
  await expect(tabs).toBeVisible();
  await expect(nav).toBeHidden();
  await expect(page.locator("#menuToggle")).toBeHidden();
  await expect(page.locator('.mobile-language a[hreflang="ms"]')).toBeVisible();
  await page.setViewportSize({ width: 1100, height: 700 });
  await expect(tabs).toBeHidden();
  await expect(nav).toBeVisible();
  await expect(page.locator("#menuToggle")).toBeHidden();
  expect(await nav.evaluate(element => !element.inert && !element.hasAttribute("aria-hidden"))).toBe(true);
  await nav.locator("a").first().focus();
  await expect(nav.locator("a").first()).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(tabs).toBeVisible();
  await expect(nav).toBeHidden();
  await tabs.locator("a").first().focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/en\.html$/);
  await expect(page.locator(".mobile-home")).toBeVisible();
});
