'use strict';

const {test,expect}=require('@playwright/test');
const {gallery}=require('../src/data/site.config.cjs');

test('desktop gallery features the house while filters retain a compact reading order',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/gambar.html');
  await expect(page.locator('#galleryControls')).toBeVisible();
  const cards=page.locator('#galleryGrid .gallery-card:visible');
  await expect(cards).toHaveCount(6);
  const [feature,sideTop,sideBottom,nextRow]=await Promise.all([0,1,2,3].map(index=>cards.nth(index).boundingBox()));
  expect(feature.width).toBeGreaterThan(sideTop.width*1.8);
  expect(feature.height).toBeGreaterThan(sideTop.height*1.8);
  expect(Math.abs(feature.y-sideTop.y)).toBeLessThan(2);
  expect(sideBottom.y).toBeGreaterThanOrEqual(sideTop.y+sideTop.height);
  expect(nextRow.y).toBeGreaterThanOrEqual(feature.y+feature.height);

  await page.locator('[data-gallery-filter="outside"]').click();
  await expect(cards).toHaveCount(gallery.filter(photo=>photo.category==='outside').length);
  const [outsideA,outsideB]=await Promise.all([0,1].map(index=>cards.nth(index).boundingBox()));
  expect(Math.abs(outsideA.width-outsideB.width)).toBeLessThan(2);
  expect(Math.abs(outsideA.y-outsideB.y)).toBeLessThan(2);

  await page.locator('[data-gallery-filter="all"]').click();
  await page.locator('#galleryMore').click();
  await expect(cards).toHaveCount(gallery.length);
  const frames=await page.locator('.gallery-card:not(.gallery-card--feature) .gallery-trigger img').evaluateAll(images=>images.map(image=>{
    const rect=image.getBoundingClientRect();
    return {width:rect.width,height:rect.height};
  }));
  // Mixed landscape/equipment rows must not reserve a second portrait-sized gap.
  expect(Math.max(...frames.map(frame=>frame.height))-Math.min(...frames.map(frame=>frame.height))).toBeLessThan(2);
  for(const frame of frames) expect(frame.width/frame.height).toBeCloseTo(4/3,2);
  const opener=page.locator('.gallery-trigger[data-gallery-photo="halaman"]');
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#galleryDialog')).toBeVisible();
  await expect(page.locator('#galleryCount')).toHaveText(`1 / ${gallery.length}`);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});

test('mobile gallery retains normal image order and full portrait equipment framing',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/gambar-en.html');
  await expect(page.locator('#galleryControls')).toBeVisible();
  const cards=page.locator('#galleryGrid .gallery-card:visible');
  const [first,second]=await Promise.all([0,1].map(index=>cards.nth(index).boundingBox()));
  expect(Math.abs(first.width-second.width)).toBeLessThan(2);
  expect(second.y).toBeGreaterThanOrEqual(first.y+first.height);
  await page.locator('[data-gallery-filter="amenities"]').click();
  if(await page.locator('#galleryMore').isVisible())await page.locator('#galleryMore').click();
  for(const image of await page.locator('.gallery-card--portrait:visible .gallery-trigger img').all()) {
    expect(await image.evaluate(element=>getComputedStyle(element).objectFit)).toBe('contain');
    const frame=await image.boundingBox();
    expect(frame.width/frame.height).toBeCloseTo(4/3,2);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});

test('the complete desktop gallery remains available without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  await page.goto('/gambar.html');
  await expect(page.locator('#galleryGrid .gallery-card:visible')).toHaveCount(gallery.length);
  await expect(page.locator('#galleryControls')).toBeHidden();
  const photo=page.locator('.gallery-trigger[data-gallery-photo="halaman"]');
  await expect(photo).toHaveAttribute('href',/halaman-\d+\.webp$/);
  const rect=await photo.boundingBox();
  expect(rect.width).toBeGreaterThan(600);
  expect(rect.height).toBeGreaterThan(300);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await context.close();
});
