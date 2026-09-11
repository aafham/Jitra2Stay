"use strict";

const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const config = require("../site.config.cjs");
const address = `${config.business.address.street}, ${config.business.address.postalCode} ${config.business.address.city}, ${config.business.address.region}`;

async function isolateExternalServices(context) {
  await context.route(url => url.origin === "https://www.google.com" && url.pathname === "/maps/embed", async route => {
    if (!route.request().isNavigationRequest() || !route.request().frame().parentFrame()) return route.continue();
    await route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="en"><title>Map fixture</title><main>Map verified separately.</main></html>' });
  });
  await context.route("https://wa.me/**", route => route.abort());
}

test.beforeEach(async ({ context, page }) => {
  await isolateExternalServices(context);
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const language of ["ms", "en"]) {
  test(`${language} FAQ topics preserve every answer and an opened question when switching topics`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(language === "en" ? "/en.html" : "/");
    const allAnswers = await page.locator("#faqList details > p").allTextContents();
    expect(allAnswers).toHaveLength(15);
    const booking = page.locator('[data-faq-topic="booking"]');
    await booking.focus();
    await page.keyboard.press("Enter");
    await expect(booking).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('#faqControls [aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator("#faqList details:visible")).toHaveCount(4);
    const opened = page.locator('#faqList details[data-faq-category="booking"]').first();
    await opened.locator("summary").click();
    await expect(opened.locator("p")).toBeVisible();
    for (const [topic, count] of [["house", 7], ["arrival", 4], ["booking", 4], ["all", 15]]) {
      await page.locator(`[data-faq-topic="${topic}"]`).click();
      await expect(page.locator("#faqList details:visible")).toHaveCount(count);
      await expect(page.locator("#faqResults")).toContainText(`${count} ${language === "en" ? "questions" : "soalan"}`);
    }
    await expect(opened).toHaveAttribute("open", "");
    await expect(opened.locator("p")).toBeVisible();
    expect(await page.locator("#faqList details > p").allTextContents()).toEqual(allAnswers);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`${language} location copies the complete address and offers a selected manual fallback`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.addInitScript(() => {
      window.__addressCopies = [];
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => window.__addressCopies.push(text) } });
    });
    await page.goto(language === "en" ? "/en.html?notes=private#lokasi" : "/?notes=private#lokasi");
    const initialUrl = page.url();
    await page.locator("#copyAddress").click();
    expect(await page.evaluate(() => window.__addressCopies)).toEqual([address]);
    await expect(page.locator("#copyAddressFeedback")).toContainText(language === "en" ? "Address copied" : "Alamat disalin");
    await expect(page.locator("#addressCopyFallback")).toBeHidden();
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }));
    await page.locator("#copyAddress").click();
    const manual = page.locator("#addressCopyText");
    await expect(manual).toBeVisible();
    await expect(manual).toBeFocused();
    await expect(manual).toHaveValue(address);
    expect(await manual.evaluate(input => input.readOnly && input.selectionStart === 0 && input.selectionEnd === input.value.length)).toBe(true);
    expect(page.url()).toBe(initialUrl);
    await expect(page.locator('[data-navigation="google"]')).toHaveAttribute("href", config.business.mapUrl);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("gallery thumbnails select the filtered photo and its room description without losing focus", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await expect(page.locator("#galleryThumbnails button")).toHaveCount(0);
  await page.locator('[data-gallery-filter="bedrooms"]').click();
  const cards = page.locator('#galleryGrid .gallery-card:visible');
  const captions = await cards.locator(".gallery-trigger").evaluateAll(anchors => anchors.map(a => a.dataset.caption));
  const descriptions = await cards.locator(".room-description").allTextContents();
  const opener = cards.first().locator(".gallery-trigger");
  await opener.click();
  const thumbs = page.locator("#galleryThumbnails button");
  await expect(thumbs).toHaveCount(5);
  await thumbs.nth(4).click();
  await expect(thumbs.nth(4)).toBeFocused();
  await expect(thumbs.nth(4)).toHaveAttribute("aria-current", "true");
  await expect(page.locator('#galleryThumbnails [aria-current="true"]')).toHaveCount(1);
  await expect(page.locator("#galleryCaption")).toHaveText(captions[4]);
  await expect(page.locator("#galleryDescription")).toHaveText(descriptions[4]);
  await expect(page.locator("#galleryDescription")).toBeVisible();
  await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "ready");
  await page.keyboard.press("ArrowLeft");
  await expect(thumbs.nth(3)).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#galleryCaption")).toHaveText(captions[3]);
  await expect(page.locator("#galleryDescription")).toHaveText(descriptions[3]);
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.locator('[data-gallery-filter="outside"]').click();
  await page.locator('#galleryGrid .gallery-card:visible .gallery-trigger').first().click();
  await expect(thumbs).toHaveCount(3);
  await expect(page.locator("#galleryDescription")).toBeHidden();
  await expect(page.locator("#galleryClose")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 568, height: 320 });
  await page.locator('[data-gallery-filter="bedrooms"]').click();
  await page.locator('#galleryGrid .gallery-card:visible .gallery-trigger').first().click();
  await thumbs.nth(4).click();
  await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "ready");
  // Selecting a thumbnail on a short landscape screen must leave the selected
  // photo visible as well as the thumbnail, rather than scrolling it away.
  for (const control of [page.locator("#galleryImage"), thumbs.nth(4)]) {
    expect(await control.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return rect.top >= 0 && rect.bottom <= innerHeight && (hit === element || element.contains(hit));
    })).toBe(true);
  }
});

test("without JavaScript all questions, photos and the address remain available in both languages", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await isolateExternalServices(context);
  const page = await context.newPage();
  for (const route of ["/", "/en.html"]) {
    await page.goto(test.info().project.use.baseURL + route);
    await expect(page.locator("#faqControls")).toBeHidden();
    await expect(page.locator("#faqList details:visible")).toHaveCount(15);
    await page.locator("#faqList summary").last().click();
    await expect(page.locator("#faqList details").last().locator("p")).toBeVisible();
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(11);
    await expect(page.locator("#copyAddress")).toBeHidden();
    await expect(page.locator("#lokasi address")).toContainText(config.business.address.street);
  }
  await context.close();
});

test("mobile menu dismisses outside taps and keyboard exit so focused page controls stay uncovered", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 568, height: 320 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const toggle = page.locator("#menuToggle");
    await toggle.click();
    await page.locator("#mainNav > .button").focus();
    await page.keyboard.press("Tab");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#heroPrimaryCta")).toBeFocused();
    expect(await page.locator("#heroPrimaryCta").evaluate(link => {
      const rect = link.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return hit === link || link.contains(hit);
    })).toBe(true);
    await toggle.click();
    const beforeDismiss = page.url();
    const headerBottom = await page.locator(".site-header").evaluate(header => header.getBoundingClientRect().bottom);
    await page.mouse.click(viewport.width - 2, Math.min(headerBottom + 10, viewport.height - 3));
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(page.url()).toBe(beforeDismiss);
  }
});

test("filtered FAQ, manual address fallback and gallery thumbnails pass accessibility checks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Clipboard unavailable"); } } }));
  await page.goto("/en.html");
  await page.locator('[data-faq-topic="arrival"]').click();
  await page.locator("#faqList details:visible summary").first().click();
  await page.locator("#copyAddress").click();
  await expect(page.locator("#addressCopyText")).toBeVisible();
  const pageResult = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(pageResult.violations).toEqual([]);
  await page.locator('[data-gallery-filter="bedrooms"]').click();
  await page.locator('#galleryGrid .gallery-card:visible .gallery-trigger').first().click();
  await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "ready");
  const dialogResult = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(dialogResult.violations).toEqual([]);
});
