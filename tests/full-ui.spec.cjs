"use strict";

const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ context, page }) => {
  await context.route(url => url.origin === "https://www.google.com" && url.pathname === "/maps/embed", async route => {
    if (!route.request().isNavigationRequest() || !route.request().frame().parentFrame()) return route.continue();
    await route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="en"><title>Map fixture</title><main>Map verified separately.</main></html>' });
  });
  await context.route("https://wa.me/**", route => route.abort());
  await page.addInitScript(() => { window.__openedEnquiries = []; window.open = url => { window.__openedEnquiries.push(url); return null; }; });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function settleLayout(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function centerIsUncovered(locator) {
  return locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return Boolean(hit && (hit === element || element.contains(hit)));
  });
}

for (const width of [390, 768]) {
  test(`natural keyboard browsing keeps page controls clear of the bottom action bar at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    let checked = 0;
    let reachedEnquiry = false;
    for (let step = 0; step < 100; step++) {
      await page.keyboard.press("Tab");
      await settleLayout(page);
      const focused = await page.evaluate(() => {
        const element = document.activeElement;
        return { id: element.id, tag: element.tagName, inMain: Boolean(element.closest("main")), name: element.textContent.trim().slice(0,80) };
      });
      if (focused.id === "checkin") { reachedEnquiry = true; break; }
      if (!focused.inMain || focused.tag === "IFRAME") continue;
      expect(await centerIsUncovered(page.locator(":focus")), focused.name).toBe(true);
      checked++;
    }
    expect(checked).toBeGreaterThan(20);
    expect(reachedEnquiry).toBe(true);
  });
}

test("supporting-page footer focus remains visible and the focused mobile shortcut never disappears", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/homestay-dekat-hospital-jitra-en.html");
  const phone = page.locator('footer a[href^="tel:"]').first();
  await phone.focus();
  const rect = await phone.boundingBox();
  await page.mouse.move(10, 200);
  await page.mouse.wheel(0, rect.y - (844 - rect.height - 5));
  await settleLayout(page);
  await expect(phone).toBeFocused();
  await expect(page.locator(".mobile-action-bar")).toBeHidden();
  expect(await centerIsUncovered(phone)).toBe(true);
  await page.keyboard.press("Tab");
  await settleLayout(page);
  expect(await centerIsUncovered(page.locator(":focus"))).toBe(true);
  await page.locator("#mainContent").focus();
  await expect(page.locator(".mobile-action-bar")).toBeVisible();
  const shortcut = page.locator(".mobile-action-bar .rate-shortcut");
  await shortcut.focus();
  await page.mouse.wheel(0, 500);
  await settleLayout(page);
  await expect(shortcut).toBeFocused();
  await expect(shortcut).toBeVisible();
});

test("policy language switching preserves a valid section while discarding unknown fragments", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/policies.html#cancellation");
  await page.locator("#menuToggle").click();
  await page.locator('nav a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/policies-en\.html#cancellation$/);
  await expect(page.locator("#cancellation")).toBeInViewport();
  await page.locator("#menuToggle").click();
  await page.locator('nav a[hreflang="ms"]').click();
  await expect(page).toHaveURL(/\/policies\.html#cancellation$/);
  await page.goto("/policies.html#not-a-section");
  await page.locator("#menuToggle").click();
  await page.locator('nav a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/policies-en\.html$/);
});

test("an invalid enquiry brings its first error and input into view for keyboard correction", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('#dateForm [type="submit"]').click();
  const first = page.locator('#dateForm [name="checkin"]');
  await expect(first).toBeFocused();
  await expect(page.locator("#checkinError")).toBeVisible();
  await settleLayout(page);
  expect(await centerIsUncovered(first)).toBe(true);
  await expect(first).toHaveAttribute("aria-invalid", "true");
  expect(await page.evaluate(() => window.__openedEnquiries)).toEqual([]);
});

test("generic WhatsApp actions reuse the prepared enquiry and restore their defaults when it becomes invalid", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const selectors = ['#mainNav > a[href^="https://wa.me"]', '#heroPrimaryCta', '.enquiry-section .button-light'];
  for (const route of ["/", "/en.html"]) {
    await page.goto(route);
    const clear = page.locator("#clearEnquiryDraft");
    if (await clear.isVisible()) await clear.click();
    await expect(clear).toBeHidden();
    const defaults = await Promise.all(selectors.map(selector => page.locator(selector).getAttribute("href")));
    await page.locator('#dateForm [name="checkin"]').fill("2027-12-20");
    await page.locator('#dateForm [name="checkout"]').fill("2027-12-22");
    await page.locator('#dateForm [name="rooms"]').selectOption("4");
    await page.locator('#dateForm [name="notes"]').fill("Family enquiry & accessible arrival");
    const prepared = await page.locator("#enquiryLink").getAttribute("href");
    expect(new URL(prepared).searchParams.get("text")).toContain("Family enquiry & accessible arrival");
    for (const selector of selectors) await expect(page.locator(selector)).toHaveAttribute("href", prepared);
    await page.locator('#dateForm [name="guests"]').fill("21");
    for (const [index, selector] of selectors.entries()) await expect(page.locator(selector)).toHaveAttribute("href", defaults[index]);
    expect(await page.evaluate(() => window.__openedEnquiries)).toEqual([]);
  }
});
