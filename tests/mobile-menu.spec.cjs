"use strict";

const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ context }) => {
  await context.route(url => url.origin === "https://www.google.com" && url.pathname === "/maps/embed", async route => {
    if (!route.request().isNavigationRequest() || !route.request().frame().parentFrame()) return route.continue();
    await route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="en"><title>Map fixture</title><main>Map verified separately.</main></html>' });
  });
  await context.route("https://wa.me/**", route => route.abort());
});

test("mobile menu animates in both directions without shifting the page and survives rapid toggles", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.locator("#kadar").scrollIntoViewIfNeeded();
  const toggle = page.locator("#menuToggle");
  const nav = page.locator("#mainNav");
  const position = () => page.evaluate(() => ({
    scroll: scrollY,
    header: document.querySelector(".site-header").getBoundingClientRect().height,
    section: document.querySelector("#kadar").getBoundingClientRect().top
  }));
  const before = await position();
  await toggle.click();
  const opening = await nav.evaluate(element => ({
    animations: element.getAnimations().map(animation => ({ state: animation.playState, duration: animation.effect.getTiming().duration })),
    inert: element.inert
  }));
  expect(opening.animations.some(animation => animation.state === "running" && animation.duration > 0 && animation.duration < 500)).toBe(true);
  expect(opening.inert).toBe(false);
  await expect(nav).toHaveCSS("opacity", "1");
  expect(await position()).toEqual(before);
  await toggle.click();
  expect(await nav.evaluate(element => element.inert && !element.hidden)).toBe(true);
  await expect(nav).toBeHidden();
  expect(await position()).toEqual(before);

  // Three genuine clicks overlap the closing transition: the last open wins.
  await toggle.click({ clickCount: 3, delay: 25 });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(nav).toHaveCSS("opacity", "1");
  await expect(nav).toBeVisible();
  expect(await nav.evaluate(element => !element.inert && element.getAttribute("aria-hidden") !== "true")).toBe(true);
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
});

for (const [width, height, language] of [[320, 568, "ms"], [390, 844, "en"], [568, 320, "ms"], [844, 390, "en"]]) {
  test(`${language} mobile menu stays within ${width}×${height} and all links remain reachable by keyboard`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(language === "en" ? "/en.html" : "/");
    const toggle = page.locator("#menuToggle");
    const nav = page.locator("#mainNav");
    await toggle.focus();
    await page.keyboard.press("Enter");
    const bounds = await nav.boundingBox();
    const header = await page.locator(".site-header").boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(8);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 8);
    expect(bounds.y).toBeGreaterThanOrEqual(header.y + header.height);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(height - 8);
    const links = nav.locator("a");
    for (const link of await links.all()) {
      await page.keyboard.press("Tab");
      await expect(link).toBeFocused();
      expect(await link.evaluate(element => {
        const box = element.getBoundingClientRect();
        const menu = element.closest("nav").getBoundingClientRect();
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return box.top >= menu.top && box.bottom <= menu.bottom && (hit === element || element.contains(hit));
      })).toBe(true);
    }
    await page.keyboard.press("Tab");
    await expect(nav).toBeHidden();
    await expect(page.locator("#heroPrimaryCta")).toBeFocused();
    await toggle.click();
    const target = nav.locator(`a[href="#lokasi"]`);
    await target.click();
    await expect(nav).toBeHidden();
    await expect(page).toHaveURL(/#lokasi$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("menu responds to reduced motion and keeps keyboard focus usable across the desktop breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/policies-en.html");
  const nav = page.locator("#mainNav");
  const toggle = page.locator("#menuToggle");
  await toggle.click();
  expect(await nav.evaluate(element => element.getAnimations().length)).toBe(0);
  await page.keyboard.press("Escape");
  expect(await nav.evaluate(element => element.hidden && element.inert)).toBe(true);
  await expect(toggle).toBeFocused();
  await page.setViewportSize({ width: 1100, height: 700 });
  await expect(toggle).toBeHidden();
  await expect(nav).toBeVisible();
  await expect(nav.locator("a").first()).toBeFocused();
  expect(await nav.evaluate(element => !element.inert && !element.hasAttribute("aria-hidden"))).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(toggle).toBeFocused();
  await expect(nav).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(nav).toBeVisible();
  await page.mouse.click(2, 200);
  await expect(nav).toBeHidden();
});
