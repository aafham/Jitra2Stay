"use strict";
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ context, page }) => {
  await context.route("https://www.google.com/maps/embed*", route => route.fulfill({ contentType: "text/html", body: "Map fixture" }));
  await context.route("https://wa.me/**", route => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: () => new Promise((resolve, reject) => {
        window.__rejectPendingCopy = () => reject(new DOMException("Denied", "NotAllowedError"));
      })
    } });
  });
});

for (const [width, language] of [[390, "ms"], [1440, "en"]]) {
  test(`${width}px ${language} delayed share and copy fallbacks preserve the guest's current field and scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const mobile = width <= 900;
    if (!mobile) {
      await page.goto("/en.html");
      await page.locator("#checkin").fill("2027-12-31");
      await page.locator("#checkout").fill("2028-01-03");
      await page.locator("#faq-deposit summary").click();
      await page.locator("#familyPlan summary").click();
    }
    for (const [button, fallback, mobilePage, mobileFocus] of [
      ["#shareStay", "#shareFallback", "/rumah.html", ".property-profiles a:first-child"],
      ["#copyAddress", "#addressCopyText", "/lokasi.html", "#destinationSearch"],
      ["#faq-deposit .faq-copy-link", "#faq-deposit .faq-copy-fallback", "/faq.html#faq-deposit", "#faq-cancellation summary"],
      ["#familyPlanShare", "#familyPlanCopyText", "/hubungi.html", "#notes"],
      ["#enquiryCopyMessage", "#enquiryCopyText", "/hubungi.html", "#notes"]
    ]) {
      if (mobile) {
        await page.goto(mobilePage);
        if (mobilePage === "/hubungi.html") {
          await page.locator("#checkin").fill("2027-12-31");
          await page.locator("#checkout").fill("2028-01-03");
          await page.locator("#familyPlan summary").click();
        }
      }
      const currentField = page.locator(mobile ? mobileFocus : "#notes");
      await page.locator(button).click();
      await currentField.focus();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const fieldTopBefore = await currentField.evaluate(field => field.getBoundingClientRect().top);
      await page.evaluate(() => window.__rejectPendingCopy());
      await expect(page.locator(fallback)).toBeVisible();
      await expect(currentField).toBeFocused();
      // Browser scroll anchoring may adjust scrollY when a fallback is inserted
      // above the field. Its position on the screen must remain unchanged.
      expect(Math.abs(await currentField.evaluate(field => field.getBoundingClientRect().top) - fieldTopBefore)).toBeLessThanOrEqual(1);
      expect(await page.locator(fallback).inputValue()).not.toBe("");

      // If the guest stays on the action, the fallback still selects the full
      // value so keyboard and touch users can copy it without extra steps.
      await page.locator(button).click();
      await page.evaluate(() => window.__rejectPendingCopy());
      await expect(page.locator(fallback)).toBeFocused();
      expect(await page.locator(fallback).evaluate(field => field.readOnly && field.selectionStart === 0 && field.selectionEnd === field.value.length)).toBe(true);
    }
  });
}

test("a pending FAQ copy cannot reopen its manual fallback after closing or filtering the answer", async ({ page }) => {
  await page.goto("/en.html#faq-deposit");
  const question = page.locator("#faq-deposit");
  await expect(question).toHaveAttribute("open", "");
  await question.locator(".faq-copy-link").click();
  await question.locator("summary").click();
  await page.evaluate(() => window.__rejectPendingCopy());
  await expect(question.locator(".faq-copy-link")).not.toHaveAttribute("aria-busy", "true");
  await expect(question.locator(".faq-copy-fallback")).toBeHidden();
  await expect(question.locator(".faq-copy-feedback")).toBeEmpty();
  await expect(question.locator("summary")).toBeFocused();

  await question.locator("summary").click();
  await question.locator(".faq-copy-link").click();
  const category = page.locator('[data-faq-topic="house"]');
  await category.focus();
  await page.keyboard.press("Enter");
  await page.evaluate(() => window.__rejectPendingCopy());
  await expect(question.locator(".faq-copy-link")).not.toHaveAttribute("aria-busy", "true");
  await expect(question.locator(".faq-copy-feedback")).toBeEmpty();
  await expect(category).toBeFocused();
  await page.locator('[data-faq-topic="all"]').click();
  await expect(question.locator(".faq-copy-fallback")).toBeHidden();
});

test("a pending homestay share retains keyboard focus, ignores repeated activation and cancels cleanly", async ({ page }) => {
  await page.addInitScript(() => {
    window.__shareCount = 0;
    window.__clipboardCount = 0;
    Object.defineProperty(navigator, "share", { configurable: true, value: () => {
      window.__shareCount++;
      return new Promise((resolve, reject) => {
        window.__cancelHomestayShare = () => reject(new DOMException("Cancelled", "AbortError"));
      });
    } });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async () => { window.__clipboardCount++; }
    } });
  });
  await page.goto("/en.html");
  const button = page.locator("#shareStay");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(button).toBeFocused();
  await page.keyboard.press("Space");
  expect(await page.evaluate(() => window.__shareCount)).toBe(1);
  await page.evaluate(() => window.__cancelHomestayShare());
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  await expect(button).toBeFocused();
  await expect(page.locator("#shareFeedback")).toBeEmpty();
  await expect(page.locator("#shareFallback")).toBeHidden();
  expect(await page.evaluate(() => window.__clipboardCount)).toBe(0);
});
