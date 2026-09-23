"use strict";

const { test, expect } = require("@playwright/test");

async function settleStyles(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].every(link => link.sheet));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

test.beforeEach(async ({ context }) => {
  await context.route("https://www.google.com/maps/embed**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Map fixture</title>" }));
});

for (const item of [
  { width: 320, path: "/", preference: "dark", saved: null, theme: "dark" },
  { width: 390, path: "/en.html", preference: "dark", saved: "light", theme: "light" },
  { width: 1440, path: "/policies-en.html", preference: "light", saved: "dark", theme: "dark" }
]) test(`header and theme stay stable while scripts load: ${item.width}px ${item.path}`, async ({ page, context }) => {
  await page.setViewportSize({ width: item.width, height: 900 });
  await page.emulateMedia({ colorScheme: item.preference });
  await context.addInitScript(saved => {
    if (saved) localStorage.setItem("theme", saved);
    else localStorage.removeItem("theme");
  }, item.saved);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("**/app.js", async route => { await gate; await route.continue(); });
  try {
    await page.goto(item.path, { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveClass(/nav-pending/);
    await settleStyles(page);
    const measure = () => page.evaluate(() => ({
      mainTop: document.querySelector("main").getBoundingClientRect().top,
      brandTop: document.querySelector(".brand").getBoundingClientRect().top,
      theme: document.documentElement.dataset.theme,
      background: getComputedStyle(document.body).backgroundColor
    }));
    const before = await measure();
    expect(before.theme).toBe(item.theme);
    if (item.width < 901) {
      await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
      await expect(page.locator(".mobile-bottom-nav a")).toHaveCount(5);
      await expect(page.locator("#menuToggle")).toBeHidden();
    }
    release();
    await page.waitForLoadState("load");
    await expect(page.locator("html")).not.toHaveClass(/nav-pending/);
    const after = await measure();
    expect(after.theme).toBe(before.theme);
    expect(after.background).toBe(before.background);
    expect(Math.abs(after.mainTop - before.mainTop)).toBeLessThan(1);
    expect(Math.abs(after.brandTop - before.brandTop)).toBeLessThan(1);
    if (item.width < 901) {
      await expect(page.locator("#menuToggle")).toBeHidden();
      await expect(page.locator("#mainNav")).toBeHidden();
      await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
      await expect(page.locator(".mobile-home")).toBeVisible();
    } else {
      await expect(page.locator("#mainNav")).toBeVisible();
    }
  } finally { release(); }
});

test("collapsed gallery photos do not load while the gallery script is delayed", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  const images = [];
  page.on("request", request => { if (request.resourceType() === "image") images.push(new URL(request.url()).pathname); });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("**/gallery.js", async route => { await gate; await route.continue(); });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await settleStyles(page);
    await expect(page.locator("html")).toHaveClass(/gallery-pending/);
    await page.locator("#galeri").scrollIntoViewIfNeeded();
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(6);
    await expect(page.locator("#galleryGrid .gallery-card:visible img").first()).toHaveJSProperty("complete", true);
    // Newly supplied facility photos are all beyond the preview and are not hero assets.
    const hiddenSources = await page.locator("#galleryGrid .gallery-card--portrait source").evaluateAll(sources => sources.flatMap(source => source.srcset.split(",").map(entry => new URL(entry.trim().split(" ")[0], location.href).pathname)));
    expect(hiddenSources.length).toBeGreaterThan(0);
    expect(images.filter(path => hiddenSources.includes(path))).toEqual([]);
    release();
    await page.waitForLoadState("load");
    await expect(page.locator("html")).not.toHaveClass(/gallery-pending/);
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(6);
    await page.locator("#galleryMore").click();
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(21);
  } finally { release(); }
});

test("failed scripts restore navigation and every photo before slow images finish", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/app.js", route => route.abort());
  await page.route("**/gallery.js", route => route.abort());
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("**/images/**", async route => { await gate; await route.continue(); });
  try {
    await page.goto("/gambar.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).not.toHaveClass(/pending/);
    await expect(page.locator("#mainNav")).toBeHidden();
    await expect(page.locator("#menuToggle")).toBeHidden();
    await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
    await expect(page.locator(".mobile-bottom-nav a")).toHaveCount(5);
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(21);
    // Every focused-gallery image is lazy, so it need not delay window.load.
    // Hold their responses and verify the usable fallback before a photo loads.
    const firstPhoto = page.locator("#galleryGrid .gallery-card img").first();
    await firstPhoto.scrollIntoViewIfNeeded();
    await expect(firstPhoto).toHaveJSProperty("complete", false);
    await expect(page.locator("#galleryControls")).toBeHidden();
    await expect(page.locator('.mobile-bottom-nav a[href="gambar.html"]')).toHaveAttribute("aria-current", "page");
    await expect(page.locator('.mobile-bottom-nav a[href="harga.html"]')).toBeVisible();
  } finally { release(); await page.waitForLoadState("load"); }
});
