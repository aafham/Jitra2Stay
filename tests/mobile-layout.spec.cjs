"use strict";

const { test, expect } = require("@playwright/test");
const config = require("../src/data/site.config.cjs");

test.beforeEach(async ({ context, page }) => {
  await context.route("https://www.google.com/maps/embed**", route => route.fulfill({
    contentType: "text/html", body: "<!doctype html><title>Map fixture</title>"
  }));
  await context.route("https://wa.me/**", route => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function noPageOverflow(page, label) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), label).toBeLessThanOrEqual(1);
}

test("phone facility photo links remain aligned with their descriptions and usable as touch targets", async ({ page }) => {
  for (const width of [320, 390]) for (const path of ["/", "/en.html"]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(path);
    const links = page.locator(".amenity .amenity-photo");
    await expect(links).toHaveCount(config.facilities.flatMap(facility => facility.photos || []).length);
    const measurements = await links.evaluateAll(elements => elements.map(link => {
      const description = link.parentElement.querySelector("p").getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      return { text: link.textContent, left: rect.left, right: rect.right, width: rect.width,
        height: rect.height, descriptionLeft: description.left, descriptionRight: description.right };
    }));
    for (const item of measurements) {
      const label = `${width}px ${path} ${item.text}`;
      expect(Math.abs(item.left - item.descriptionLeft), label).toBeLessThanOrEqual(2);
      expect(item.right, label).toBeLessThanOrEqual(item.descriptionRight + 1);
      expect(item.width, label).toBeGreaterThan(120);
      expect(item.height, label).toBeGreaterThanOrEqual(44);
    }
    await noPageOverflow(page, `${width}px ${path} facilities`);
  }
});

test("narrow-phone gallery gives photos readable full-width cards and retains every supplied photo and room description", async ({ page }) => {
  for (const width of [320, 390, 430, 480]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/en.html");
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(6);
    await page.locator("#galleryMore").click();
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(config.gallery.length);
    expect(await page.locator("#galleryGrid .gallery-trigger").evaluateAll(links => links.map(link => link.dataset.galleryPhoto)))
      .toEqual(config.gallery.map(photo => photo.image));
    for (const room of config.rooms) {
      await expect(page.locator(`.gallery-card:has([data-gallery-photo="${room.image}"]) .room-description`)).toHaveText(room.en[1]);
    }
    const measurements = await page.locator("#galleryGrid").evaluate(grid => {
      const available = grid.getBoundingClientRect().width;
      return [...grid.querySelectorAll(".gallery-card")].map(card => {
        const image = card.querySelector("img").getBoundingClientRect();
        const caption = card.querySelector("figcaption");
        const description = card.querySelector(".room-description");
        return { available, imageWidth: image.width, imageHeight: image.height,
          captionWidth: caption.clientWidth, captionFont: parseFloat(getComputedStyle(caption).fontSize),
          clipped: caption.scrollHeight > caption.clientHeight + 1,
          descriptionFont: description ? parseFloat(getComputedStyle(description).fontSize) : null };
      });
    });
    for (const item of measurements) {
      expect(item.imageWidth, `${width}px photo width`).toBeGreaterThanOrEqual(item.available - 4);
      expect(item.imageHeight, `${width}px photo height`).toBeGreaterThan(150);
      expect(item.captionWidth, `${width}px caption width`).toBeGreaterThanOrEqual(item.available - 4);
      expect(item.captionFont).toBeGreaterThanOrEqual(15);
      if (item.descriptionFont !== null) expect(item.descriptionFont).toBeGreaterThanOrEqual(15);
      expect(item.clipped).toBe(false);
    }
    await noPageOverflow(page, `${width}px expanded gallery`);
  }
});

test("phone enquiry and real manual-copy fallbacks keep input text readable without shrinking below 16px", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(width === 320 ? "/" : "/en.html");
    await page.locator("#shareStay").click();
    await expect(page.locator("#shareFallback")).toBeVisible();
    await page.locator("#copyAddress").click();
    await expect(page.locator("#addressCopyText")).toBeVisible();
    const answer = page.locator("#faqList details").first();
    await answer.locator("summary").click();
    await answer.locator(".faq-copy-link").click();
    await expect(answer.locator(".faq-copy-fallback")).toBeVisible();
    await page.locator("#checkin").fill("2027-12-31");
    await page.locator("#checkout").fill("2028-01-03");
    await page.locator("#rooms").selectOption("5");
    await page.locator("#familyPlan summary").click();
    await page.locator("#familyPlanShare").click();
    await expect(page.locator("#familyPlanCopyText")).toBeVisible();
    await page.locator("#enquiryCopyMessage").click();
    await expect(page.locator("#enquiryCopyText")).toBeVisible();
    const fields = await page.locator("input:visible,select:visible,textarea:visible").evaluateAll(elements => elements.map(field => ({
      id: field.id || field.className, fontSize: parseFloat(getComputedStyle(field).fontSize),
      width: field.getBoundingClientRect().width, parentWidth: field.parentElement.getBoundingClientRect().width
    })));
    expect(fields.length).toBeGreaterThanOrEqual(11);
    for (const field of fields) {
      expect(field.fontSize, `${width}px ${field.id}`).toBeGreaterThanOrEqual(16);
      expect(field.width, `${width}px ${field.id}`).toBeLessThanOrEqual(field.parentWidth + 1);
    }
    // Native dates and the package label need a full field instead of a squeezed half-column.
    const formWidth = await page.locator("#dateForm").evaluate(form => form.clientWidth);
    for (const selector of ["#checkin", "#checkout", "#rooms"]) {
      expect((await page.locator(selector).boundingBox()).width, `${width}px ${selector}`).toBeGreaterThanOrEqual(formWidth - 2);
    }
    await noPageOverflow(page, `${width}px manual copy fields`);
  }
});

test("phone destination results use the available width and group route evidence without excessive empty gaps", async ({ page }) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/en.html");
    await page.locator("#destinationSearch").fill("Hospital Jitra");
    const card = page.locator(".destination-card:visible");
    await expect(card).toHaveCount(1);
    const measurement = await card.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const finder = element.closest(".destination-finder").getBoundingClientRect();
      return { cardWidth: rect.width, finderWidth: finder.width, cardLeft: rect.left, finderLeft: finder.left,
        routeGap: parseFloat(getComputedStyle(element.querySelector(".destination-route")).marginTop),
        sourceGap: parseFloat(getComputedStyle(element.querySelector(".destination-source")).marginTop),
        paragraphs: [...element.querySelectorAll("p")].map(p => ({width: p.clientWidth, scrollWidth: p.scrollWidth})) };
    });
    expect(measurement.cardWidth, `${width}px nested gutters`).toBeGreaterThanOrEqual(measurement.finderWidth - 2);
    expect(Math.abs(measurement.cardLeft - measurement.finderLeft)).toBeLessThanOrEqual(1);
    expect(measurement.routeGap).toBeGreaterThanOrEqual(4);
    expect(measurement.routeGap).toBeLessThanOrEqual(10);
    expect(measurement.sourceGap).toBeGreaterThanOrEqual(4);
    expect(measurement.sourceGap).toBeLessThanOrEqual(10);
    for (const paragraph of measurement.paragraphs) expect(paragraph.scrollWidth).toBeLessThanOrEqual(paragraph.width + 1);
    await noPageOverflow(page, `${width}px destination result`);
  }
});

test("home and supporting pages stay within phone and tablet widths with readable policy and footer links", async ({ page }) => {
  test.setTimeout(45000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const paths = ["/", "/en.html", "/policies-en.html", "/homestay-dekat-hospital-jitra-en.html"];
  for (const width of [320, 390, 430, 768]) for (const path of paths) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(path);
    await expect(page.locator("#menuToggle")).toBeVisible();
    await noPageOverflow(page, `${width}px ${path}`);
    const links = await page.locator(".policy-toc a,.site-footer .footer-links a").evaluateAll(elements => elements.map(link => ({
      label: link.textContent.trim(), fontSize: parseFloat(getComputedStyle(link).fontSize),
      height: link.getBoundingClientRect().height
    })));
    for (const link of links) {
      expect(link.fontSize, `${width}px ${path} ${link.label}`).toBeGreaterThanOrEqual(14);
      expect(link.height, `${width}px ${path} ${link.label}`).toBeGreaterThanOrEqual(44);
    }
    if (width <= 480 && path === "/policies-en.html") {
      const topics = await page.locator(".policy-toc a").evaluateAll(elements => elements.map(link => ({
        left: link.getBoundingClientRect().left, width: link.getBoundingClientRect().width
      })));
      expect(topics.length).toBeGreaterThan(5);
      expect(topics.every(topic => Math.abs(topic.left - topics[0].left) <= 1)).toBe(true);
      expect(topics[0].width).toBeGreaterThan(width * .7);
    }
  }
  expect(errors).toEqual([]);
});
