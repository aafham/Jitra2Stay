"use strict";
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ context, page }) => {
  await context.route("https://www.google.com/maps/embed*", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Map fixture</title>" }));
  await page.addInitScript(() => {
    window.__openedEnquiries = [];
    window.open = url => { window.__openedEnquiries.push(url); return null; };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function prepareEnquiry(page) {
  await page.locator("#checkin").fill("2027-12-31");
  await page.locator("#checkout").fill("2028-01-03");
  await page.locator("#rooms").selectOption("4");
  await page.locator("#guests").fill("9");
  await page.locator("#notes").fill('<img src=x onerror="window.__copyExecuted=true"> & family + luggage');
}

for (const language of ["ms", "en"]) {
  test(`${language} enquiry has selected manual text when clipboard is denied or unavailable, and clears it after edits and reset`, async ({ page }) => {
    await page.setViewportSize({ width: language === "ms" ? 320 : 390, height: 844 });
    await page.addInitScript(lang => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: lang === "en" ? undefined : {
        writeText: async () => { throw new DOMException("Denied", "NotAllowedError"); }
      } });
    }, language);
    await page.goto(language === "en" ? "/hubungi-en.html" : "/hubungi.html");
    await prepareEnquiry(page);
    const copyButton = page.locator("#enquiryCopyMessage");
    const fallback = page.locator("#enquiryCopyFallback");
    const textarea = page.locator("#enquiryCopyText");
    await copyButton.click();
    const expected = new URL(await page.locator("#enquiryLink").getAttribute("href")).searchParams.get("text");
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeFocused();
    await expect(textarea).toHaveValue(expected);
    await expect(page.locator("#enquiryPreviewText")).toHaveText(expected);
    expect(await textarea.evaluate(el => el.readOnly && el.selectionStart === 0 && el.selectionEnd === el.value.length)).toBe(true);
    await expect(page.locator("#enquiryCopyFeedback")).toContainText(language === "en" ? "Copy the enquiry" : "Salin mesej pertanyaan");
    await expect(page.locator("#enquiryCopyFeedback")).not.toContainText(language === "en" ? "copied" : "telah disalin");
    expect(await page.evaluate(() => window.__copyExecuted)).toBeUndefined();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.locator("#notes").fill("Updated arrival note");
    await expect(fallback).toBeHidden();
    await expect(textarea).toHaveValue("");
    await expect(page.locator("#enquiryCopyFeedback")).toBeEmpty();
    await copyButton.click();
    await expect(textarea).toHaveValue(await page.locator("#enquiryPreviewText").textContent());
    await expect(textarea).toHaveValue(/Updated arrival note/);
    await page.locator("#clearEnquiryDraft").click();
    await expect(fallback).toBeHidden();
    await expect(textarea).toHaveValue("");
    await expect(page.locator("#enquiryCopyFeedback")).toBeEmpty();
    expect(await page.evaluate(() => window.__openedEnquiries)).toEqual([]);
  });
}

test("copy uses the current enquiry once and ignores stale success or failure after edits and reset", async ({ page }) => {
  await page.addInitScript(() => {
    window.__copiedEnquiries = [];
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: text => {
      window.__copiedEnquiries.push(text);
      return new Promise((resolve, reject) => {
        window.__finishEnquiryCopy = resolve;
        window.__failEnquiryCopy = () => reject(new DOMException("Denied", "NotAllowedError"));
      });
    } } });
  });
  await page.goto("/en.html");
  await prepareEnquiry(page);
  const button = page.locator("#enquiryCopyMessage");
  const feedback = page.locator("#enquiryCopyFeedback");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(button).toBeFocused();
  await page.keyboard.press("Space");
  expect(await page.evaluate(() => window.__copiedEnquiries)).toEqual([await page.locator("#enquiryPreviewText").textContent()]);
  // Even restoring identical text must invalidate the older clipboard request.
  await page.locator("#checkout").fill("2028-01-04");
  await page.locator("#checkout").fill("2028-01-03");
  await page.evaluate(() => window.__finishEnquiryCopy());
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  await expect(feedback).toBeEmpty();
  await expect(page.locator("#checkout")).toBeFocused();

  await button.click();
  await page.locator("#clearEnquiryDraft").click();
  await page.locator("#checkin").focus();
  await page.evaluate(() => window.__failEnquiryCopy());
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#enquiryCopyFallback")).toBeHidden();
  await expect(page.locator("#enquiryCopyText")).toHaveValue("");
  await expect(feedback).toBeEmpty();
  await expect(page.locator("#checkin")).toBeFocused();

  await prepareEnquiry(page);
  await button.click();
  await page.evaluate(() => window.__finishEnquiryCopy());
  await expect(feedback).toHaveText("Enquiry message copied.");
  await expect(page.locator("#enquiryCopyFallback")).toBeHidden();
  expect(await page.evaluate(() => window.__openedEnquiries)).toEqual([]);
});

test("delayed clipboard denial offers manual text without taking focus from another field", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => new Promise((resolve, reject) => {
      window.__failEnquiryCopy = () => reject(new DOMException("Denied", "NotAllowedError"));
    }) } });
  });
  await page.goto("/en.html");
  await prepareEnquiry(page);
  await page.locator("#enquiryCopyMessage").click();
  await page.locator("#notes").focus();
  await page.evaluate(() => window.__failEnquiryCopy());
  await expect(page.locator("#enquiryCopyText")).toBeVisible();
  await expect(page.locator("#enquiryCopyText")).toHaveValue(await page.locator("#enquiryPreviewText").textContent());
  await expect(page.locator("#notes")).toBeFocused();
});
