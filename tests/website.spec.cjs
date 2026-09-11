"use strict";

const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const config = require("../site.config.cjs");
const englishPages = ["en.html", "policies-en.html", "thank-you-en.html", ...config.guides.map(guide => `${guide.slug}-en.html`)];

async function mockWhatsApp(page, blocked = false) {
  await page.addInitScript(({ blocked }) => {
    window.__openedEnquiries = [];
    window.open = (url, target, features) => {
      window.__openedEnquiries.push({ url, target, features });
      return blocked ? null : { opener: null };
    };
  }, { blocked });
  // Tests never contact WhatsApp or send messages to the owner.
  await page.route("https://wa.me/**", route => route.abort());
}

async function fillEnquiry(page, language = "ms") {
  await page.clock.setFixedTime(new Date("2026-09-11T04:00:00Z"));
  await page.goto(language === "en" ? "/en.html" : "/");
  const form = page.locator("#dateForm");
  await expect(form).toBeVisible();
  await form.locator("[name=checkin]").fill("2026-12-31");
  await form.locator("[name=checkout]").fill("2027-01-02");
  await form.locator("[name=guests]").fill("7");
  await form.locator("[name=rooms]").selectOption("3");
  await form.locator("[name=notes]").fill("A&B + C? #keluarga / ibu’s wheelchair 😊");
  return form;
}

for (const width of [320, 390, 768]) {
  test(`mobile menu exposes all controls and restores keyboard focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 568 });
    await page.goto("/");
    const toggle = page.locator("#menuToggle");
    // The tablet breakpoint may display ordinary navigation directly.
    if (!await toggle.isVisible()) {
      expect(width).toBeGreaterThanOrEqual(768);
      await expect(page.locator('a[href="en.html"], a[href="/en.html"]').first()).toBeVisible();
      return;
    }
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const nav = page.locator(`#${await toggle.getAttribute("aria-controls")}`);
    await expect(nav).toBeVisible();
    const controls = nav.locator("a, button");
    expect(await controls.count()).toBeGreaterThan(1);
    for (const control of await controls.all()) {
      await control.scrollIntoViewIfNeeded();
      await expect(control).toBeVisible();
      const rect = await control.boundingBox();
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(width + 1);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.y + rect.height).toBeLessThanOrEqual(569);
    }
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const language of ["ms", "en"]) {
  test(`${language} home remains complete and usable without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(test.info().project.use.baseURL + (language === "en" ? "/en.html" : "/"));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const gallery = page.locator(".gallery-trigger");
    expect(await gallery.count()).toBeGreaterThanOrEqual(6);
    await expect(gallery.first()).toBeVisible();
    for (const rate of config.rates) await expect(page.getByText(`RM${rate.price}`, { exact: false }).first()).toBeVisible();
    await expect(page.locator("#dateForm")).toBeHidden();
    await expect(page.locator("#menuToggle")).toBeHidden();
    await expect(page.locator('a[href^="https://wa.me/"]').first()).toBeVisible();
    await expect(page.locator("details").first()).toBeVisible();
    await page.locator("details summary").first().click();
    await expect(page.locator("details").first()).toHaveAttribute("open", "");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}

test("gallery traps focus, supports keyboard navigation and returns focus to the selected photo", async ({ page }) => {
  await page.goto("/");
  const trigger = page.locator(".gallery-trigger").nth(2);
  await trigger.click();
  const dialog = page.locator("#galleryDialog");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.matches(":modal"))).toBe(true);
  const firstCaption = await page.locator("#galleryCaption").innerText();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#galleryCaption")).not.toHaveText(firstCaption);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#galleryCaption")).toHaveText(firstCaption);
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press(index < 4 ? "Tab" : "Shift+Tab");
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.locator("#galleryClose").click();
  await expect(trigger).toBeFocused();
});

for (const language of ["ms", "en"]) {
  test(`${language} enquiry estimates configured rates and opens one encoded WhatsApp draft without leaving the form`, async ({ page }) => {
    await mockWhatsApp(page);
    const form = await fillEnquiry(page, language);
    const expectedTotal = config.rates.find(rate => rate.rooms === 3).price * 2;
    await expect(page.locator("#priceEstimate")).toContainText(String(expectedTotal));
    const initialUrl = page.url();
    await form.locator('[type="submit"]').click();
    const opened = await page.evaluate(() => window.__openedEnquiries);
    expect(opened).toHaveLength(1);
    const url = new URL(opened[0].url);
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe(`/${config.business.phone}`);
    expect([...url.searchParams.keys()]).toEqual(["text"]);
    const draft = url.searchParams.get("text");
    expect(draft).toContain("2026-12-31");
    expect(draft).toContain("2027-01-02");
    expect(draft).toContain(String(expectedTotal));
    expect(draft).toContain("A&B + C? #keluarga / ibu’s wheelchair 😊");
    expect(draft).toMatch(language === "en" ? /check|night|guest/i : /malam|tetamu/i);
    expect(opened[0].features).toContain("noopener");
    expect(page.url()).toBe(initialUrl);
    await expect(form.locator("[name=notes]")).toHaveValue("A&B + C? #keluarga / ibu’s wheelchair 😊");
    await expect(page.locator("#enquiryLink")).toHaveAttribute("href", opened[0].url);
  });
}

test("invalid checkout, past arrival and excessive guest count never open a WhatsApp enquiry", async ({ page }) => {
  await mockWhatsApp(page);
  const form = await fillEnquiry(page);
  const submit = form.locator('[type="submit"]');
  const checkout = form.locator("[name=checkout]");
  await checkout.fill("2026-12-31");
  await submit.click();
  expect(await checkout.evaluate(element => element.validity.valid)).toBe(false);
  await checkout.fill("2027-01-02");
  const guests = form.locator("[name=guests]");
  await guests.fill(String(config.business.maxGuests + 1));
  await submit.click();
  expect(await guests.evaluate(element => element.validity.valid)).toBe(false);
  await guests.fill("7");
  const checkin = form.locator("[name=checkin]");
  await checkin.fill("2020-01-01");
  await submit.click();
  expect(await checkin.evaluate(element => element.validity.valid)).toBe(false);
  expect(await page.evaluate(() => window.__openedEnquiries)).toHaveLength(0);
});

test("blocked popups leave a working draft link and keep all entered values", async ({ page }) => {
  await mockWhatsApp(page, true);
  const form = await fillEnquiry(page);
  await form.locator('[type="submit"]').click();
  const link = page.locator("#enquiryLink");
  await expect(link).toBeVisible();
  const url = new URL(await link.getAttribute("href"));
  expect(url.searchParams.get("text")).toContain("2026-12-31");
  await expect(form.locator("[name=guests]")).toHaveValue("7");
  await expect(form.locator("[name=checkout]")).toHaveValue("2027-01-02");
  await expect(page.locator("#enquiryCopyMessage")).toBeVisible();
});

test("changing check-in across New Year requires checkout on the following calendar day or later", async ({ page }) => {
  await mockWhatsApp(page);
  const form = await fillEnquiry(page);
  await form.locator("[name=checkin]").fill("2027-12-31");
  await expect(form.locator("[name=checkout]")).toHaveAttribute("min", "2028-01-01");
  await form.locator("[name=checkout]").fill("2028-01-01");
  await expect(page.locator("#priceEstimate")).toContainText(String(config.rates.find(rate => rate.rooms === 3).price));
});

test("English routes are fully rendered, including policy and guide copy", async ({ page }) => {
  for (const route of englishPages) {
    const response = await page.goto(`/${route}`);
    expect(response.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const text = await page.locator("main").innerText();
    expect(text.length).toBeGreaterThan(150);
    expect(text).not.toMatch(/Semak tarikh|Bilik tidur|Jumlah tetamu|Kemudahan|Tempahan hanya|Sahkan dengan owner/);
    if (route === "policies-en.html") for (const policy of config.policies) expect(text).toContain(policy.en[0]);
    const guide = config.guides.find(item => `${item.slug}-en.html` === route);
    if (guide) expect(text).toContain(guide.en[2]);
  }
});

test("legacy English query URLs land on the real English page and preserve anchors", async ({ page }) => {
  await page.goto("/?lang=en#gallery");
  await expect(page).toHaveURL(/\/en\.html#gallery$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("language links make a full English–Malay round trip on home and policies", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ["en.html", "policies-en.html"]) {
    await page.goto(`/${route}`);
    await page.locator('nav a[hreflang="ms"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ms");
    await expect(page).toHaveURL(route === "en.html" ? /\/$/ : /\/policies\.html$/);
    await page.locator('nav a[hreflang="en"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(new URL(page.url()).pathname).toBe(`/${route}`);
  }
});

test("choosing a room package carries the selected package into the enquiry form", async ({ page }) => {
  await page.goto("/");
  for (const rate of config.rates) {
    await page.locator(`.package-link[data-rooms="${rate.rooms}"]`).click();
    await expect(page.locator('#dateForm [name="rooms"]')).toHaveValue(String(rate.rooms));
    expect(new URL(page.url()).hash).toBe("#semak-tarikh");
  }
});

for (const width of [390, 1440]) {
  test(`hero downloads one selected responsive image at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const hero = page.locator('img[fetchpriority="high"]');
    await expect(hero).toHaveCount(1);
    await expect.poll(() => hero.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    const resources = await hero.evaluate(image => {
      const candidates = new Set([image.src, ...[...image.parentElement.querySelectorAll("source")].flatMap(source => source.srcset.split(",").map(candidate => new URL(candidate.trim().split(/\s+/)[0], location.href).href)), ...image.srcset.split(",").filter(Boolean).map(candidate => new URL(candidate.trim().split(/\s+/)[0], location.href).href)]);
      // The exterior also appears in the gallery at a smaller size; that is a separate image use.
      const otherImages = new Set([...document.images].filter(other => other !== image).map(other => other.currentSrc));
      return performance.getEntriesByType("resource").filter(entry => candidates.has(entry.name) && (entry.name === image.currentSrc || !otherImages.has(entry.name))).map(entry => entry.name);
    });
    expect([...new Set(resources)]).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const colorScheme of ["light", "dark"]) {
  for (const width of [390, 1440]) {
    test(`home passes WCAG AA automated checks in ${colorScheme} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test("English policy page, expanded mobile menu and gallery dialog pass accessibility checks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/policies-en.html");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
  await page.goto("/en.html");
  await page.locator("#menuToggle").click();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.locator(".gallery-trigger").first().click();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
});

test("published server excludes repository files and returns real 404s", async ({ request }) => {
  for (const route of ["/missing-page", "/site.config.cjs", "/README.md", "/tools/qa-check.js", "/OWNER-DATA-CHECKLIST.md"]) {
    const response = await request.get(route);
    expect(response.status()).toBe(404);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(await response.text()).toContain("404");
  }
});

test("nested unknown URLs show a working 404 page with a real home recovery link", async ({ page }) => {
  const brokenAssets = [];
  page.on("response", response => {
    if (["stylesheet", "script", "image"].includes(response.request().resourceType()) && response.status() >= 400) brokenAssets.push(response.url());
  });
  const response = await page.goto("/not-found/deep/page");
  expect(response.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const homeOrigins = [new URL(page.url()).origin, new URL(config.business.siteUrl).origin];
  const hrefs = await page.locator("a[href]").evaluateAll(links => links.map(link => link.href));
  expect(hrefs.some(href => { const url = new URL(href); return homeOrigins.includes(url.origin) && url.pathname === "/"; })).toBe(true);
  expect(brokenAssets).toEqual([]);
});
