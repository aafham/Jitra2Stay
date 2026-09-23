"use strict";

const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const config = require("../site.config.cjs");
const englishPages = ["en.html", "policies-en.html", "thank-you-en.html", ...config.guides.map(guide => `${guide.slug}-en.html`)];

async function stubGoogleMap(context) {
  // Check our iframe and page layout without depending on Google's live UI/network.
  // The real embedded pin and navigation destinations are verified separately.
  await context.route(url => url.origin === "https://www.google.com" && url.pathname === "/maps/embed", async route => {
    if (!route.request().isNavigationRequest() || !route.request().frame().parentFrame()) return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: '<!doctype html><html lang="en"><head><title>Map fixture</title></head><body><main><p>Map content is verified separately.</p></main></body></html>'
    });
  });
}

test.beforeEach(async ({ context }) => { await stubGoogleMap(context); });

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
    await stubGoogleMap(context);
    const page = await context.newPage();
    await page.goto(test.info().project.use.baseURL + (language === "en" ? "/en.html" : "/"));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const gallery = page.locator(".gallery-trigger");
    await expect(gallery).toHaveCount(config.gallery.length);
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(config.gallery.length);
    await expect(page.locator("#galleryControls")).toBeHidden();
    await expect(page.locator("#galleryMore")).toBeHidden();
    await expect(page.locator(".room-description:visible")).toHaveCount(5);
    await expect(page.locator("#shareStay")).toBeHidden();
    await expect(page.locator("#clearEnquiryDraft")).toBeHidden();
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

for (const language of ["ms", "en"]) {
  test(`${language} restored owner facts remain available on home and policies`, async ({ page }) => {
    const en = language === "en";
    await page.goto(en ? "/en.html" : "/");
    await expect(page.locator('footer a[href="tel:+60194420666"]')).toBeVisible();
    await expect(page.locator('a[href="https://www.facebook.com/media/set/?set=a.2393864657563587&type=3"]').first()).toBeVisible();
    await expect(page.locator("#kemudahan")).toContainText(/WiFi.*TV/s);
    await expect(page.locator(".extra-guest-note")).toContainText("RM10");
    await expect(page.locator(".extra-guest-note")).toContainText("20");
    const parking = page.locator("#faq details").filter({ has: page.locator("summary", { hasText: /parking/i }) });
    await parking.locator("summary").click();
    await expect(parking.locator("p")).toHaveText(en ? /3 to 4 cars/ : /3 hingga 4 kereta/);
    await expect(page.locator(".stay-summary")).toContainText("DuitNow");
    await page.locator('[data-gallery-filter="bedrooms"]').click();
    await expect(page.locator(".room-description:visible")).toHaveCount(5);
    await expect(page.locator("#galleryGrid .gallery-card")).toHaveCount(config.gallery.length);
    await page.locator(".nearby-original > summary").click();
    const institutions = page.locator(".nearby-grid details").filter({ hasText: "POLIMAS" });
    await institutions.locator("summary").click();
    await expect(institutions).toContainText("IPG Darulaman");
    await expect(page.locator(".nearby-grid details")).toHaveCount(6);
    await page.goto(en ? "/policies-en.html" : "/policies.html");
    await expect(page.locator("#cancellation")).toContainText(en ? /Less than 7 days/i : /Kurang 7 hari/i);
    await expect(page.locator("#cancellation")).toContainText(en ? /non-refundable/ : /tidak dipulangkan/);
    await expect(page.locator("#payment")).toContainText("DuitNow");
    await expect(page.locator("#payment")).toContainText(en ? /payment proof|proof of payment/i : /bukti bayaran/i);
    await expect(page.locator("#capacity")).toContainText("RM10");
    await expect(page.locator("#checkout")).toContainText("0000");
    await expect(page.locator("#checkout")).toContainText(en ? /green bin/ : /tong hijau/);
  });
}

test("an editable enquiry draft survives language changes and reload, then clears completely", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await mockWhatsApp(page);
  await fillEnquiry(page);
  const values = { checkin: "2026-12-31", checkout: "2027-01-02", guests: "7", rooms: "3", notes: "A&B + C? #keluarga / ibu’s wheelchair 😊" };
  async function expectFields(expected) {
    for (const [name, value] of Object.entries(expected)) await expect(page.locator(`#dateForm [name=${name}]`)).toHaveValue(value);
    expect(new URL(page.url()).search).toBe("");
    expect(page.url()).not.toContain("2026-12-31");
    expect(page.url()).not.toContain("keluarga");
  }
  await page.locator('nav a[hreflang="en"]').click();
  await expectFields(values);
  await expect(page.locator("#enquiryPreviewText")).toContainText("Guests: 7");
  await page.locator('nav a[hreflang="ms"]').click();
  await page.reload();
  await expectFields(values);
  await expect(page.locator("#enquiryPreviewText")).toContainText("Tetamu: 7");
  await page.locator('#dateForm [name=checkout]').fill("2026-12-30");
  await page.locator('#dateForm [name=guests]').fill("21");
  await page.locator('nav a[hreflang="en"]').click();
  await page.reload();
  await expectFields({ ...values, checkout: "2026-12-30", guests: "21" });
  await expect(page.locator("#checkoutError")).toBeVisible();
  await expect(page.locator("#guestsError")).toBeVisible();
  await expect(page.locator("#enquiryLink")).toBeHidden();
  await page.locator("#clearEnquiryDraft").click();
  await page.reload();
  await expectFields({ checkin: "", checkout: "", guests: "6", rooms: "2", notes: "" });
  expect(await page.evaluate(() => sessionStorage.getItem("jitra2stay.enquiry-draft.v1"))).toBeNull();
  expect(await page.evaluate(() => window.__openedEnquiries)).toHaveLength(0);
});

test("unavailable browser storage leaves the enquiry usable and explains unsaved changes", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem", "removeItem"]) Storage.prototype[method] = () => { throw new DOMException("Storage disabled", "SecurityError"); };
  });
  await mockWhatsApp(page);
  await fillEnquiry(page);
  await expect(page.locator("#draftFeedback")).toContainText("tidak dapat menyimpan");
  await expect(page.locator("#priceEstimate")).toContainText("460");
  await page.locator('#dateForm [type="submit"]').click();
  expect(await page.evaluate(() => window.__openedEnquiries)).toHaveLength(1);
  await expect(page.locator('#dateForm [name=notes]')).toHaveValue("A&B + C? #keluarga / ibu’s wheelchair 😊");
  expect(errors).toEqual([]);
});

test("native sharing uses only the public homestay URL and cancellation has no clipboard side effect", async ({ page }) => {
  await page.addInitScript(() => {
    window.__shareCalls = [];
    window.__copiedLinks = [];
    Object.defineProperty(navigator, "share", { configurable: true, value: async data => {
      window.__shareCalls.push(data);
      if (window.__cancelShare) throw new DOMException("Cancelled", "AbortError");
    } });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => window.__copiedLinks.push(text) } });
  });
  await page.goto("/en.html?notes=private-draft#semak-tarikh");
  await page.locator('#dateForm [name=notes]').fill("Do not share these enquiry notes");
  await page.locator("#shareStay").click();
  await expect.poll(() => page.evaluate(() => window.__shareCalls.length)).toBe(1);
  expect(await page.evaluate(() => window.__shareCalls[0])).toEqual({ title: "Jitra2Stay", url: `${config.business.siteUrl}/en.html` });
  await expect(page.locator("#shareStay")).toBeEnabled();
  await page.evaluate(() => { window.__cancelShare = true; });
  await page.locator("#shareStay").click();
  await expect(page.locator("#shareStay")).toBeEnabled();
  expect(await page.evaluate(() => window.__copiedLinks)).toEqual([]);
  await expect(page.locator("#shareFallback")).toBeHidden();
});

test("sharing falls back to copying and then a selected public URL when clipboard is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    window.__copiedLinks = [];
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => {
      if (window.__clipboardBlocked) throw new DOMException("Clipboard disabled", "NotAllowedError");
      window.__copiedLinks.push(text);
    } } });
  });
  await page.goto("/?notes=private-draft#semak-tarikh");
  await page.locator("#shareStay").click();
  await expect.poll(() => page.evaluate(() => window.__copiedLinks)).toEqual([`${config.business.siteUrl}/`]);
  await expect(page.locator("#shareFallback")).toBeHidden();
  await page.evaluate(() => {
    window.__clipboardBlocked = true;
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("Sharing unavailable", "NotAllowedError"); } });
  });
  await page.locator("#shareStay").click();
  const fallback = page.locator("#shareFallback");
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveValue(`${config.business.siteUrl}/`);
  await expect(fallback).toBeFocused();
  expect(await fallback.evaluate(input => input.readOnly && input.selectionStart === 0 && input.selectionEnd === input.value.length)).toBe(true);
  expect(await page.evaluate(() => window.__copiedLinks)).toHaveLength(1);
});

for (const width of [320, 390]) {
  test(`mobile hero shows property essentials, rate and enquiry action within the first screen at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 568 });
    for (const route of ["/", "/en.html"]) {
      await page.goto(route);
      const hero = page.locator("#home");
      await expect(hero.locator(".hero-details")).toContainText("5");
      await expect(hero.locator(".hero-details")).toContainText("3");
      for (const locator of [hero.locator(".hero-details"), hero.locator(".hero-rate"), page.locator("#heroPrimaryCta")]) {
        const rect = await locator.boundingBox();
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.y + rect.height).toBeLessThanOrEqual(568);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
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
  await form.locator("[name=notes]").focus();
  await expect(page.locator("#checkoutError")).toBeVisible();
  await expect(checkout).toHaveAttribute("aria-invalid", "true");
  await submit.click();
  expect(await checkout.evaluate(element => element.validity.valid)).toBe(false);
  await checkout.fill("2027-01-02");
  await expect(page.locator("#checkoutError")).toBeHidden();
  await expect(checkout).not.toHaveAttribute("aria-invalid", "true");
  const guests = form.locator("[name=guests]");
  await guests.fill(String(config.business.maxGuests + 1));
  await submit.click();
  expect(await guests.evaluate(element => element.validity.valid)).toBe(false);
  await expect(page.locator("#guestsError")).toBeVisible();
  await expect(guests).toHaveAttribute("aria-invalid", "true");
  await guests.fill("7");
  await expect(page.locator("#guestsError")).toBeHidden();
  const checkin = form.locator("[name=checkin]");
  await checkin.fill("2020-01-01");
  await submit.click();
  expect(await checkin.evaluate(element => element.validity.valid)).toBe(false);
  await expect(page.locator("#checkinError")).toBeVisible();
  await expect(checkin).toHaveAttribute("aria-invalid", "true");
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
    await expect(page.locator('.package-card[data-selected="true"]')).toHaveCount(1);
    const selectedCard = page.locator(`.package-card[data-package="${rate.rooms}"]`);
    await expect(selectedCard).toHaveAttribute("data-selected", "true");
    await expect(selectedCard.locator(".package-selected")).toBeVisible();
    expect(new URL(page.url()).hash).toBe("#semak-tarikh");
  }
  await page.locator('#dateForm [name="rooms"]').selectOption(String(config.rates[0].rooms));
  await expect(page.locator('.package-card[data-selected="true"]')).toHaveAttribute("data-package", String(config.rates[0].rooms));
});

test("gallery expansion and filters keep counts, visible photos and modal navigation in sync", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const visibleCards = page.locator("#galleryGrid .gallery-card:visible");
  const more = page.locator("#galleryMore");
  await expect(visibleCards).toHaveCount(6);
  await more.click();
  await expect(visibleCards).toHaveCount(config.gallery.length);
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await more.click();
  await expect(visibleCards).toHaveCount(6);
  for (const category of [...new Set(config.gallery.map(photo => photo.category))]) {
    const count = config.gallery.filter(photo => photo.category === category).length;
    const button = page.locator(`[data-gallery-filter="${category}"]`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('#galleryControls [aria-pressed="true"]')).toHaveCount(1);
    await expect(visibleCards).toHaveCount(Math.min(6, count));
    await expect(page.locator(`#galleryGrid .gallery-card:visible:not([data-gallery-category="${category}"])`)).toHaveCount(0);
    await expect(page.locator("#galleryResults")).toContainText(`${Math.min(6, count)} daripada ${count}`);
    if (count > 6) {
      await expect(more).toBeVisible();
      await more.click();
      await expect(visibleCards).toHaveCount(count);
      await expect(page.locator("#galleryResults")).toContainText(`${count} daripada ${count}`);
      await expect(more).toHaveAttribute("aria-expanded", "true");
    } else await expect(more).toBeHidden();
  }
  const triggers = visibleCards.locator(".gallery-trigger");
  const captions = await triggers.evaluateAll(anchors => anchors.map(anchor => anchor.dataset.caption));
  const opener = triggers.first();
  await opener.click();
  await expect(page.locator("#galleryCount")).toHaveText(`1 / ${captions.length}`);
  for (let step = 1; step <= captions.length; step += 1) {
    await page.locator("#galleryNext").click();
    await expect(page.locator("#galleryCaption")).toHaveText(captions[step % captions.length]);
    await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "ready");
  }
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.locator('[data-gallery-filter="all"]').click();
  await expect(visibleCards).toHaveCount(6);
  await expect(page.locator("#galleryResults")).toContainText(`6 daripada ${config.gallery.length}`);
});

test("a failed gallery photo offers its original JPEG and can be retried without losing keyboard focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.locator(".gallery-trigger").nth(3);
  await trigger.scrollIntoViewIfNeeded();
  await expect.poll(() => trigger.locator("img").evaluate(image => image.complete)).toBe(true);
  const fullUrl = new URL(await trigger.getAttribute("data-full"), page.url()).href;
  const originalUrl = new URL(await trigger.getAttribute("data-original"), page.url()).href;
  let attempts = 0;
  await page.route(fullUrl, route => ++attempts === 1 ? route.abort("failed") : route.continue());
  await trigger.click();
  await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "error");
  await expect(page.locator("#galleryImageStage")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("#galleryImageStatus")).not.toHaveText("");
  await expect(page.locator("#galleryOriginalLink")).toHaveJSProperty("href", originalUrl);
  expect(new URL(originalUrl).pathname).toMatch(/\.jpg$/i);
  await page.locator("#galleryRetry").click();
  await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "ready");
  await expect(page.locator("#galleryImage")).toBeVisible();
  await expect(page.locator("#galleryRetry")).toBeHidden();
  await expect(page.locator("#galleryClose")).toBeFocused();
  expect(attempts).toBe(2);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test.describe("touch gallery", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test("horizontal swipes move to the next filtered photo while vertical movement preserves it", async ({ page, context }) => {
    await page.goto("/");
    await page.locator('[data-gallery-filter="bedrooms"]').click();
    const visiblePhotos = page.locator('#galleryGrid .gallery-card:visible .gallery-trigger');
    const captions = await visiblePhotos.evaluateAll(anchors => anchors.map(anchor => anchor.dataset.caption));
    await visiblePhotos.first().click();
    await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "ready");
    const box = await page.locator("#galleryImageStage").boundingBox();
    const cdp = await context.newCDPSession(page);
    const swipe = async (from, to) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [to] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await swipe({ x: x + 65, y }, { x: x - 65, y });
    await expect(page.locator("#galleryCaption")).toHaveText(captions[1]);
    await expect(page.locator("#galleryCount")).toHaveText(`2 / ${captions.length}`);
    await swipe({ x, y: y - 50 }, { x, y: y + 60 });
    await expect(page.locator("#galleryCaption")).toHaveText(captions[1]);
    await cdp.detach();
  });
});

test("stay shortcuts update rent, separate deposit and a safe preview matching both WhatsApp links", async ({ page }) => {
  await mockWhatsApp(page);
  const form = await fillEnquiry(page, "en");
  const nightlyRate = config.rates.find(rate => rate.rooms === 3).price;
  for (const nights of [1, 2, 3]) {
    const shortcut = page.locator(`#stayShortcuts [data-nights="${nights}"]`);
    await shortcut.click();
    await expect(shortcut).toHaveAttribute("aria-pressed", "true");
    await expect(form.locator("[name=checkin]")).toHaveValue("2026-12-31");
    await expect(form.locator("[name=checkout]")).toHaveValue(`2027-01-0${nights}`);
    await expect(page.locator("#estimateTotal")).toHaveText(`RM${nightlyRate * nights}`);
  }
  await expect(page.locator("#estimateBreakdown")).toContainText("Separate deposit");
  await expect(page.locator("#estimateBreakdown")).toContainText(`RM${config.business.securityDeposit}`);
  const notes = '<img src=x onerror="window.__previewExecuted=true"> & family + wheelchair';
  await form.locator("[name=notes]").fill(notes);
  await page.locator("#enquiryPreview summary").click();
  const draftUrl = new URL(await page.locator("#enquiryLink").getAttribute("href"));
  await expect(page.locator("#enquiryPreviewText")).toHaveText(draftUrl.searchParams.get("text"));
  await expect(page.locator("#enquiryPreviewText")).toContainText(notes);
  await expect(page.locator("#enquiryPreviewText img")).toHaveCount(0);
  expect(await page.evaluate(() => window.__previewExecuted)).toBeUndefined();
  await expect(page.locator(".mobile-whatsapp")).toHaveAttribute("href", draftUrl.href);
  await form.locator("[name=checkout]").fill("2027-01-10");
  await expect(page.locator('#stayShortcuts [aria-pressed="true"]')).toHaveCount(0);
  const revisedUrl = new URL(await page.locator("#enquiryLink").getAttribute("href"));
  await expect(page.locator("#enquiryPreviewText")).toHaveText(revisedUrl.searchParams.get("text"));
  await expect(page.locator(".mobile-whatsapp")).toHaveAttribute("href", revisedUrl.href);
  expect(await page.evaluate(() => window.__openedEnquiries)).toHaveLength(0);
});

test("reading-section navigation survives gallery expansion and preserves the section when switching language", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#galeri");
  await expect(page.locator('#mainNav > a[href="#galeri"]')).toHaveAttribute("aria-current", "location");
  await page.locator("#galleryMore").click();
  await expect(page.locator('#mainNav > a[href="#galeri"]')).toHaveAttribute("aria-current", "location");
  await page.locator('#mainNav > a[href="#kadar"]').click();
  await expect(page.locator('#mainNav > a[href="#kadar"]')).toHaveAttribute("aria-current", "location");
  await expect(page.locator('#mainNav > a[aria-current="location"]')).toHaveCount(1);
  const englishLink = page.locator('nav a[hreflang="en"]');
  const readingScroll = await page.evaluate(() => scrollY);
  // Tabbing across the already-visible sticky header must not move the reader
  // away from the selected section before they activate a language link.
  // Native hash navigation moves sequential focus to its destination, so start
  // this header-keyboard journey by focusing the visible Rates link again.
  await page.locator('#mainNav > a[href="#kadar"]').focus();
  for (let step = 0; step < 8 && !await englishLink.evaluate(link => link === document.activeElement); step += 1) await page.keyboard.press("Tab");
  await expect(englishLink).toBeFocused();
  expect(Math.abs(await page.evaluate(() => scrollY) - readingScroll)).toBeLessThanOrEqual(1);
  await expect(page.locator('#mainNav > a[href="#kadar"]')).toHaveAttribute("aria-current", "location");
  await englishLink.click();
  await expect(page).toHaveURL(/\/en\.html#kadar$/);
  await expect(page.locator('#mainNav > a[href="#kadar"]')).toHaveAttribute("aria-current", "location");
  await page.locator('nav a[hreflang="ms"]').click();
  await expect(page).toHaveURL(/\/#kadar$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ms");
});

test("opening the mobile menu near a section boundary preserves reading context for language links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Read the final part of the gallery: expanding the sticky menu must not
  // incorrectly replace this context with the Rates section underneath it.
  await page.locator("#galeri").evaluate(section => {
    const header = document.querySelector(".site-header");
    scrollTo(0, section.getBoundingClientRect().bottom + scrollY - header.getBoundingClientRect().bottom - 54);
  });
  await expect(page.locator('#mainNav > a[href="#galeri"]')).toHaveAttribute("aria-current", "location");
  await page.locator("#menuToggle").click();
  await expect(page.locator("#menuToggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator('#mainNav > a[href="#galeri"]')).toHaveAttribute("aria-current", "location");
  await page.locator('nav a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/en\.html#galeri$/);
  await page.locator("#menuToggle").click();
  await page.locator('#mainNav > a[href="#kadar"]').click();
  await expect(page.locator("#menuToggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('#mainNav > a[href="#kadar"]')).toHaveAttribute("aria-current", "location");
  await page.locator("#menuToggle").click();
  await page.locator('nav a[hreflang="ms"]').click();
  await expect(page).toHaveURL(/\/#kadar$/);
});

test("mobile actions stay reachable when focused and hide while the enquiry is being edited", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const bar = page.locator(".mobile-action-bar");
  const rateShortcut = bar.locator(".rate-shortcut");
  await expect(bar).toBeVisible();
  await expect(bar.locator("a")).toHaveCount(2);
  await rateShortcut.focus();
  await page.locator('#dateForm [type="submit"]').scrollIntoViewIfNeeded();
  await expect(rateShortcut).toBeFocused();
  await expect(bar).toBeVisible();
  await page.locator('#dateForm [name="checkin"]').focus();
  await expect(bar).toBeHidden();
  await page.locator('#dateForm [type="submit"]').focus();
  await expect(bar).toBeHidden();
  await page.locator("#galeri").scrollIntoViewIfNeeded();
  await expect(bar).toBeVisible();
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
      // An unused image-format preload must still be caught, even if omitted from <picture>.
      for (const preload of document.querySelectorAll('link[rel="preload"][as="image"]')) {
        if (preload.href) candidates.add(preload.href);
        for (const candidate of preload.imageSrcset.split(",").filter(Boolean)) candidates.add(new URL(candidate.trim().split(/\s+/)[0], location.href).href);
      }
      // The exterior is also used by the gallery and intentional hero backdrop.
      const separateUses = new Set([...document.images].filter(other => other !== image).map(other => other.currentSrc));
      const section = image.closest(".hero");
      if (section) {
        for (const pseudo of [null, "::before"]) {
          const background = getComputedStyle(section, pseudo).backgroundImage;
          for (const match of background.matchAll(/url\(["']?([^"')]+)["']?\)/g)) separateUses.add(new URL(match[1], location.href).href);
        }
      }
      return performance.getEntriesByType("resource").filter(entry => candidates.has(entry.name) && (entry.name === image.currentSrc || !separateUses.has(entry.name))).map(entry => entry.name);
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
  // Audit the fully opened menu; animation behavior is verified separately.
  await expect(page.locator("#mainNav")).toHaveCSS("opacity", "1");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator("#mainNav")).toBeHidden();
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
