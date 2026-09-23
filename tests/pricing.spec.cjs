'use strict';
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ context, page }) => {
  await context.route('https://www.google.com/maps/embed**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Map fixture</title>' }));
  await context.route('**/functions/v1/guest-calendar**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ stays: [], guests: [] }) }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-09-23T04:00:00Z'));
});

for (const [path, language] of [['/', 'ms'], ['/en.html', 'en']]) {
  test(`${language} one-night example, deposit selector and payable total stay consistent with WhatsApp`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await expect(page.locator('.hero-rate')).toContainText('RM170');
    await expect(page.locator('.payment-example')).toContainText('RM270');
    const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
    expect(graph.find(item => item['@type'] === 'LodgingBusiness').priceRange).toBe('RM170–RM330');
    await page.locator('#checkin').fill('2027-01-01');
    await page.locator('#checkout').fill('2027-01-02');
    await page.locator('#rooms').selectOption('2');
    await expect(page.locator('#estimateTotal')).toHaveText('RM170');
    await expect(page.locator('#estimateDeposit')).toHaveText('RM100');
    await expect(page.locator('#estimatePayable')).toHaveText('RM270');
    await expect(page.locator('#estimateEquation')).toHaveText('RM170 + RM100 = RM270');
    await page.locator('#guests').fill('20');
    await expect(page.locator('#depositCategory')).toHaveValue('standard');
    await expect(page.locator('#estimateDeposit')).toHaveText('RM100');
    await page.locator('#depositCategory').selectOption('large');
    await expect(page.locator('#estimateDeposit')).toHaveText('RM200');
    await expect(page.locator('#estimatePayable')).toHaveText('RM370');
    await page.locator('#familyPlan summary').click();
    await expect(page.locator('#familyPlanText')).toContainText('RM370');
    const message = new URL(await page.locator('#enquiryLink').getAttribute('href')).searchParams.get('text');
    expect(message).toContain('RM170');
    expect(message).toContain('RM200');
    expect(message).toContain('RM370');
    expect(message).toContain(language === 'ms' ? 'rombongan / majlis besar' : 'large group / major event');
    await page.locator('#checkout').fill('2027-01-03');
    await page.locator('#depositCategory').selectOption('standard');
    await expect(page.locator('#estimateTotal')).toHaveText('RM340');
    await expect(page.locator('#estimatePayable')).toHaveText('RM440');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
}

test('deposit selection survives reload and language switching; clear form returns it to the standard category', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.locator('#depositCategory').selectOption('large');
  await expect(page.locator('#clearEnquiryDraft')).toBeVisible();
  await page.reload();
  await expect(page.locator('#depositCategory')).toHaveValue('large');
  await page.locator('.language-links [hreflang="en"]').click();
  await expect(page.locator('#depositCategory')).toHaveValue('large');
  await page.locator('#clearEnquiryDraft').click();
  await expect(page.locator('#depositCategory')).toHaveValue('standard');
  expect(await page.evaluate(() => sessionStorage.getItem('jitra2stay.enquiry-draft.v1'))).toBeNull();
});
