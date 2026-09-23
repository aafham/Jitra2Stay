"use strict";

const { test, expect } = require("@playwright/test");

test("room packages and mobile controls remain readable with enlarged text on phones", async ({ page, context }) => {
  await context.route("https://www.google.com/maps/embed**", route => route.fulfill({
    contentType: "text/html", body: "<!doctype html><title>Map fixture</title>"
  }));
  await context.route("https://wa.me/**", route => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of [320, 390]) for (const suffix of ["", "-en"]) {
    const url = `/harga${suffix}.html`;
    await page.setViewportSize({ width, height: 844 });
    await page.goto(url);
    // Simulate a guest's larger default font, keeping the phone viewport fixed.
    await page.addStyleTag({ content: ":root { font-size: 200% !important; }" });
    await expect(page.locator(".package-price strong").first()).toHaveText("RM170");
    const measurements = await page.locator(".package-card").evaluateAll(cards => cards.map(card => {
      const bounds = card.getBoundingClientRect();
      const price = card.querySelector(".package-price strong");
      const range = document.createRange();
      range.selectNodeContents(price);
      const lines = Array.from(range.getClientRects()).filter(rect => rect.width > 0);
      const facilities = card.querySelector(".package-bathrooms");
      return {
        price: price.textContent, priceLines: lines.length,
        priceInsideCard: lines.every(rect => rect.left >= bounds.left && rect.right <= bounds.right),
        facilityWidth: facilities.clientWidth, facilityScrollWidth: facilities.scrollWidth,
        cardLeft: bounds.left, cardRight: bounds.right
      };
    }));
    expect(measurements).toHaveLength(4);
    for (const item of measurements) {
      const label = `${width}px ${url} ${item.price}`;
      expect(item.priceLines, `${label}: amount must read as one number`).toBe(1);
      expect(item.priceInsideCard, `${label}: amount stays within its card`).toBe(true);
      expect(item.facilityScrollWidth, `${label}: bathroom and heater labels fit`).toBeLessThanOrEqual(item.facilityWidth + 1);
      expect(item.cardLeft, label).toBeGreaterThanOrEqual(0);
      expect(item.cardRight, label).toBeLessThanOrEqual(width);
    }
    for (const [slug, selector] of [["harga", ".package-link"], ["gambar", ".gallery-filter"], ["faq", ".faq-filter"]]) {
      const route = `/${slug}${suffix}.html`;
      if (slug !== "harga") {
        await page.goto(route);
        await page.addStyleTag({ content: ":root { font-size: 200% !important; }" });
      }
      const controls = await page.locator(selector).evaluateAll(elements => elements.map(element => ({
        text: element.textContent, width: element.clientWidth, scrollWidth: element.scrollWidth
      })));
      expect(controls.length, `${width}px ${route}: controls are present`).toBeGreaterThan(0);
      for (const control of controls) {
        expect(control.scrollWidth, `${width}px ${route}: ${control.text}`).toBeLessThanOrEqual(control.width + 1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px ${route}`).toBeLessThanOrEqual(width);
    }
  }
});

test("follow-up page headings remain fully readable with enlarged text on phones", async ({ page }) => {
  for (const width of [320, 390]) for (const url of ["/thank-you.html", "/thank-you-en.html"]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(url);
    await page.addStyleTag({ content: ":root { font-size: 200% !important; }" });
    const heading = page.locator("h1");
    const size = await heading.evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(size.scrollWidth, `${width}px ${url}: whole heading fits`).toBeLessThanOrEqual(size.width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px ${url}`).toBeLessThanOrEqual(width);
  }
});
