"use strict";

const { test, expect } = require("@playwright/test");
const config = require("../site.config.cjs");

// These are the owner's September upload, rather than a count that could pass
// after one supplied photo silently replaces another.
const suppliedPhotos = [
  "mesin-basuh", "penapis-air-air-fryer", "peti-sejuk-microwave", "tv-wifi",
  "seterika-papan", "tv-peti-sejuk", "sudut-seterika", "pemanas-air",
  "kotak-kunci", "bilik-air"
];
const existingPhotos = [
  "halaman", "ruang-tamu", "ruang-makan", "bilik-besar", "bilik-keluarga",
  "bilik-tidur", "bilik-dua-katil", "bilik-kusyen-biru", "dapur", "parking", "porch-parking"
];

async function isolateExternalServices(context) {
  await context.route("https://www.google.com/maps/embed**", route => route.fulfill({
    contentType: "text/html", body: "<!doctype html><title>Map fixture</title>"
  }));
  await context.route("https://wa.me/**", route => route.abort());
}

test.beforeEach(async ({ context, page }) => {
  await isolateExternalServices(context);
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const lang of ["ms", "en"]) {
  test(`${lang} all ten supplied amenities photos are discoverable while the eleven existing photos remain`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lang === "en" ? "/en.html" : "/");
    const actualNames = await page.locator(".gallery-trigger").evaluateAll(links => links.map(link => link.dataset.galleryPhoto));
    expect(actualNames.slice(0, existingPhotos.length)).toEqual(existingPhotos);
    expect(actualNames.slice(existingPhotos.length).sort()).toEqual([...suppliedPhotos].sort());
    expect(new Set(actualNames).size).toBe(actualNames.length);
    const categoryKeys = ["all", "bedrooms", "shared", "amenities", "bathrooms", "outside"];
    expect(await page.locator("[data-gallery-filter]").evaluateAll(buttons => buttons.map(button => button.dataset.galleryFilter)))
      .toEqual(categoryKeys);
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(6);
    await expect(page.locator("#galleryMore")).toContainText(String(suppliedPhotos.length + existingPhotos.length - 6));

    for (const category of ["amenities", "bathrooms"]) {
      const photos = config.gallery.filter(photo => photo.category === category);
      expect(photos.map(photo => photo.image).sort()).toEqual(suppliedPhotos.filter(name =>
        category === "bathrooms" ? ["bilik-air", "pemanas-air"].includes(name) : !["bilik-air", "pemanas-air"].includes(name)
      ).sort());
      await page.locator(`[data-gallery-filter="${category}"]`).click();
      if (photos.length > 6) await page.locator("#galleryMore").click();
      await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(photos.length);
      for (const photo of photos) {
        const opener = page.locator(`.gallery-trigger[data-gallery-photo="${photo.image}"]`);
        await expect(opener).toBeVisible();
        await expect(opener.locator("img")).toHaveAttribute("alt", photo.alt[lang]);
        await expect(page.locator(`.amenity-photo[data-gallery-photo="${photo.image}"]`)).toHaveCount(1);
      }
      const opener = page.locator(`.gallery-trigger[data-gallery-photo="${photos[0].image}"]`);
      await opener.click();
      await expect(page.locator("#galleryThumbnails button")).toHaveCount(photos.length);
      for (const [index, photo] of photos.entries()) {
        await expect(page.locator("#galleryCaption")).toHaveText(photo[lang]);
        await expect(page.locator("#galleryCount")).toHaveText(`${index + 1} / ${photos.length}`);
        await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "ready");
        await expect(page.locator("#galleryOriginalLink")).toHaveAttribute("href", `images/${photo.image}.jpg`);
        await expect.poll(() => page.locator("#galleryImage").evaluate(image => image.complete && image.naturalHeight > image.naturalWidth)).toBe(true);
        await page.locator("#galleryNext").click();
      }
      await expect(page.locator("#galleryCaption")).toHaveText(photos[0][lang]);
      await page.keyboard.press("Escape");
      await expect(opener).toBeFocused();
    }
  });
}

test("portrait amenity photos stay uncropped on phones and desktop, including the short-screen viewer", async ({ page }) => {
  for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/en.html");
    await page.locator("#galleryMore").click();
    for (const name of suppliedPhotos) {
      const picture = page.locator(`.gallery-trigger[data-gallery-photo="${name}"] img`);
      const rendered = await picture.evaluate(image => {
        const box = image.getBoundingClientRect();
        return { width: box.width, height: box.height, fit: getComputedStyle(image).objectFit };
      });
      expect(rendered.fit, `${viewport.width}px ${name}`).toBe("contain");
      expect(rendered.width / rendered.height, `${viewport.width}px ${name}`).toBeCloseTo(3 / 4, 2);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 568, height: 320 });
  await page.locator('.amenity-photo[data-gallery-photo="bilik-air"]').click();
  await expect(page.locator("#galleryImageStage")).toHaveAttribute("data-state", "ready");
  const viewer = await page.locator("#galleryImage").evaluate(image => {
    const box = image.getBoundingClientRect();
    return { fit: getComputedStyle(image).objectFit, top: box.top, bottom: box.bottom, left: box.left, right: box.right };
  });
  expect(viewer.fit).toBe("contain");
  expect(viewer.top).toBeGreaterThanOrEqual(0);
  expect(viewer.bottom).toBeLessThanOrEqual(320);
  expect(viewer.left).toBeGreaterThanOrEqual(0);
  expect(viewer.right).toBeLessThanOrEqual(568);
  await page.keyboard.press("Escape");
  await expect(page.locator('.amenity-photo[data-gallery-photo="bilik-air"]')).toBeFocused();
});

test("without JavaScript every supplied photo remains visible with a working bathroom image link in both languages", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
  await isolateExternalServices(context);
  const page = await context.newPage();
  for (const lang of ["ms", "en"]) {
    await page.goto(test.info().project.use.baseURL + (lang === "en" ? "/en.html" : "/"));
    await expect(page.locator("#galleryGrid .gallery-card:visible")).toHaveCount(existingPhotos.length + suppliedPhotos.length);
    await expect(page.locator("#galleryControls")).toBeHidden();
    for (const name of suppliedPhotos) {
      const photo = config.gallery.find(item => item.image === name);
      const gallery = page.locator(`.gallery-trigger[data-gallery-photo="${name}"]`);
      const facility = page.locator(`.amenity-photo[data-gallery-photo="${name}"]`);
      await expect(gallery).toBeVisible();
      await expect(gallery.locator("img")).toHaveAttribute("alt", photo.alt[lang]);
      await expect(facility).toHaveAttribute("href", await gallery.getAttribute("href"));
      await expect(facility).toHaveAccessibleName(/.+/);
    }
    await page.locator('.amenity-photo[data-gallery-photo="bilik-air"]').click();
    await expect(page).toHaveURL(/\/images\/responsive\/bilik-air-\d+\.webp$/);
    await page.locator("img").evaluate(image => image.decode());
    expect(await page.locator("img").evaluate(image => image.naturalHeight > image.naturalWidth)).toBe(true);
  }
  await context.close();
});
