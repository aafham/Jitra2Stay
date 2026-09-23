"use strict";
const { test, expect } = require("@playwright/test");
const { rates, business } = require("../src/data/site.config.cjs");

test.beforeEach(async ({ context, page }) => {
  await context.route("https://www.google.com/maps/embed*", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Map fixture</title>" }));
  await page.addInitScript(() => {
    window.__sharedPlans = [];
    window.__copiedPlans = [];
    window.__opened = [];
    window.open = url => { window.__opened.push(url); return null; };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function dates(page, checkin = "2027-12-31", checkout = "2028-01-03") {
  await page.locator("#checkin").fill(checkin);
  await page.locator("#checkout").fill(checkout);
  await page.locator("#rooms").selectOption("4");
}

async function totals(page, nights) {
  for (const rate of rates) {
    const card = page.locator(`.package-card[data-package="${rate.rooms}"]`);
    await expect(card.locator(".package-price strong")).toHaveText(`RM${rate.price}`);
    await expect(card.locator(".package-total-value")).toHaveText(`RM${(rate.price * nights).toLocaleString("en-MY")}`);
    await expect(card.locator(".package-total-label")).toContainText(String(nights));
  }
}

test("all package totals follow deliberate stay length, changed arrival and manually entered longer dates", async ({ page }) => {
  await page.goto("/");
  await totals(page, 1);
  const three = page.locator('[data-compare-nights="3"]');
  await three.focus();
  await page.keyboard.press("Space");
  await totals(page, 3);
  await expect(page.locator("#checkin")).toHaveValue("");
  await expect(page.locator("#checkout")).toHaveValue("");
  await page.locator('.package-link[data-rooms="4"]').click();
  await page.locator("#checkin").fill("2027-12-31");
  await expect(page.locator("#checkout")).toHaveValue("2028-01-03");
  await expect(page.locator("#estimateTotal")).toHaveText("RM840");
  await page.locator("#checkin").fill("2028-02-28");
  await expect(page.locator("#checkout")).toHaveValue("2028-03-02");
  await page.locator("#checkout").fill("2028-03-06");
  await totals(page, 7);
  await expect(page.locator('#stayComparison [aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator("#estimateTotal")).toHaveText("RM1,960");
  await page.locator('#stayShortcuts [data-nights="2"]').click();
  await totals(page, 2);
  await expect(page.locator('[data-compare-nights="2"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#checkout")).toHaveValue("2028-03-01");
});

test("pending duration survives language changes while an invalid draft stays editable and reset clears intent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator('[data-compare-nights="2"]').click();
  await expect(page.locator("#clearEnquiryDraft")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("jitra2stay.enquiry-draft.v1")).plannedNights)).toBe(2);
  await page.locator('.language-links [hreflang="en"]').click();
  await totals(page, 2);
  await expect(page.locator("#comparisonStatus")).toContainText("2 nights selected");
  await page.locator("#checkin").fill("2027-12-31");
  await expect(page.locator("#checkout")).toHaveValue("2028-01-02");
  await page.locator("#checkout").fill("2027-12-30");
  await page.reload();
  await expect(page.locator("#checkout")).toHaveValue("2027-12-30");
  await expect(page.locator("#comparisonStatus")).toContainText("Complete or correct");
  await expect(page.locator("#familyPlan")).toBeHidden();
  await page.locator("#clearEnquiryDraft").click();
  await totals(page, 1);
  expect(await page.evaluate(() => sessionStorage.getItem("jitra2stay.enquiry-draft.v1"))).toBeNull();
  await expect(page.locator("#clearEnquiryDraft")).toBeHidden();
});

test("family sharing requires opening a current preview and excludes private enquiry details", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "share", { configurable: true, value: async payload => { window.__sharedPlans.push(payload); } }));
  await page.goto("/en.html");
  await dates(page);
  await page.locator("#guests").fill("19");
  await page.locator("#notes").fill("PRIVATE: cousin phone & mobility details");
  await expect(page.locator("#familyPlanShare")).toBeHidden();
  expect(await page.evaluate(() => window.__sharedPlans)).toEqual([]);
  await page.locator("#familyPlan summary").click();
  const summary = await page.locator("#familyPlanText").textContent();
  expect(summary).toContain("4 rooms");
  expect(summary).toContain("3 nights");
  expect(summary).toContain("RM840");
  expect(summary).toContain(`Separate security deposit: RM${business.securityDeposit}`);
  expect(summary).not.toContain("PRIVATE");
  expect(summary).not.toContain("19");
  expect(summary).toContain(`${business.siteUrl}/en.html`);
  await page.locator("#familyPlanShare").click();
  expect(await page.evaluate(() => window.__sharedPlans[0].text)).toBe(summary);
  expect(await page.evaluate(() => window.__opened)).toEqual([]);
  await page.locator("#checkout").fill("2028-01-04");
  await expect(page.locator("#familyPlanText")).toContainText("RM1,120");
  await expect(page.locator("#familyPlanFeedback")).toBeEmpty();
});

test("family summary copies when native share is unavailable and provides selected text if clipboard is denied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => {
      if (window.__denyClipboard) throw new DOMException("Denied", "NotAllowedError");
      window.__copiedPlans.push(text);
    } } });
  });
  await page.goto("/");
  await dates(page);
  await page.locator("#familyPlan summary").click();
  await page.locator("#familyPlanShare").click();
  const text = await page.locator("#familyPlanText").textContent();
  expect(await page.evaluate(() => window.__copiedPlans[0])).toBe(text);
  await expect(page.locator("#familyPlanFeedback")).toContainText("Ringkasan disalin");
  await page.evaluate(() => { window.__denyClipboard = true; });
  await page.locator("#familyPlanShare").click();
  await expect(page.locator("#familyPlanCopyText")).toBeVisible();
  await expect(page.locator("#familyPlanCopyText")).toBeFocused();
  await expect(page.locator("#familyPlanCopyText")).toHaveValue(text);
  expect(await page.locator("#familyPlanCopyText").evaluate(el => el.readOnly && el.selectionStart === 0 && el.selectionEnd === el.value.length)).toBe(true);
  await expect(page.locator("#familyPlanFeedback")).not.toContainText("disalin");
  expect(await page.evaluate(() => window.__opened)).toEqual([]);
});

test("pending native share preserves keyboard focus, ignores repeated activation and cancels without copying", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: payload => {
      window.__sharedPlans.push(payload);
      return new Promise((resolve, reject) => { window.__cancelShare = () => reject(new DOMException("Cancelled", "AbortError")); });
    } });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => window.__copiedPlans.push(text) } });
  });
  await page.goto("/en.html");
  await dates(page);
  await page.locator("#familyPlan summary").click();
  const button = page.locator("#familyPlanShare");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(button).toBeFocused();
  await page.keyboard.press("Space");
  expect(await page.evaluate(() => window.__sharedPlans.length)).toBe(1);
  await page.evaluate(() => window.__cancelShare());
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  await expect(button).toBeFocused();
  await expect(page.locator("#familyPlanFeedback")).toBeEmpty();
  await expect(page.locator("#familyPlanFallback")).toBeHidden();
  expect(await page.evaluate(() => window.__copiedPlans)).toEqual([]);
  expect(await page.evaluate(() => window.__opened)).toEqual([]);
});

test("native share completion cannot update an edited plan or copy a cleared plan", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: payload => {
      window.__sharedPlans.push(payload);
      return new Promise((resolve, reject) => { window.__finishShare = resolve; window.__failShare = () => reject(new DOMException("Unavailable", "NotAllowedError")); });
    } });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => window.__copiedPlans.push(text) } });
  });
  await page.goto("/en.html");
  await dates(page);
  await page.locator("#familyPlan summary").click();
  const button = page.locator("#familyPlanShare");
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "true");
  // Returning to identical text must not make an old operation current again.
  await page.locator("#checkout").fill("2028-01-04");
  await page.locator("#checkout").fill("2028-01-03");
  await page.evaluate(() => window.__finishShare());
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#familyPlanFeedback")).toBeEmpty();
  await expect(page.locator("#checkout")).toBeFocused();
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await page.locator("#clearEnquiryDraft").click();
  await page.locator("#checkin").focus();
  await page.evaluate(() => window.__failShare());
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#familyPlan")).toBeHidden();
  await expect(page.locator("#familyPlanFeedback")).toBeEmpty();
  await expect(page.locator("#familyPlanFallback")).toBeHidden();
  await expect(page.locator("#checkin")).toBeFocused();
  expect(await page.evaluate(() => window.__copiedPlans)).toEqual([]);
});

test("clipboard completion leaves edited or closed family previews and their focus untouched", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: text => {
      window.__copiedPlans.push(text);
      return new Promise((resolve, reject) => { window.__finishCopy = resolve; window.__failCopy = () => reject(new DOMException("Denied", "NotAllowedError")); });
    } } });
  });
  await page.goto("/en.html");
  await dates(page);
  const summary = page.locator("#familyPlan summary");
  await summary.click();
  const button = page.locator("#familyPlanShare");
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await page.locator("#checkout").fill("2028-01-04");
  await page.evaluate(() => window.__finishCopy());
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#familyPlanFeedback")).toBeEmpty();
  await expect(page.locator("#checkout")).toBeFocused();
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await summary.click();
  await page.evaluate(() => window.__failCopy());
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#familyPlanFeedback")).toBeEmpty();
  await expect(page.locator("#familyPlanFallback")).toBeHidden();
  await expect(summary).toBeFocused();
});

test("without JavaScript, the mobile prices page keeps all nightly packages and native enquiry links", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  const page = await context.newPage();
  await page.goto("/harga.html");
  await expect(page.locator("#stayComparison")).toBeHidden();
  await expect(page.locator("#familyPlan")).toBeHidden();
  for (const rate of rates) {
    const card = page.locator(`.package-card[data-package="${rate.rooms}"]`);
    await expect(card.locator(".package-price strong")).toHaveText(`RM${rate.price}`);
    await expect(card.locator(".package-link")).toHaveAttribute("href", `hubungi.html?rooms=${rate.rooms}`);
    await expect(card.locator(".package-total")).toBeHidden();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
