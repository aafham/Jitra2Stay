'use strict';

const {test,expect}=require('@playwright/test');
const config=require('../src/data/site.config.cjs');

test('amenity previews keep the real photo accessible and the complete facilities readable on mobile and desktop',async({page,context})=>{
  await context.route('https://www.google.com/maps/embed**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Map fixture</title></html>'}));
  await context.route('**/functions/v1/guest-calendar**',route=>{
    const action=new URL(route.request().url()).searchParams.get('action');
    return route.fulfill({contentType:'application/json',body:JSON.stringify(action==='calendar'?{stays:[]}:{guests:[]})});
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,lang] of [[320,'ms'],[390,'en'],[1280,'ms']]) {
    await page.setViewportSize({width,height:900});
    await page.goto(width<=900?`/kemudahan${lang==='en'?'-en':''}.html`:'/#kemudahan');
    await expect(page.locator('#kemudahan .amenity')).toHaveCount(config.facilities.length);
    await expect(page.locator('#kemudahan .amenity-photo')).toHaveCount(config.facilities.flatMap(facility=>facility.photos).length);
    for(const facility of config.facilities) {
      await expect(page.locator('#kemudahan').getByRole('heading',{name:facility[lang][0],exact:true})).toBeVisible();
      await expect(page.locator('#kemudahan').getByText(facility[lang][1],{exact:true})).toBeVisible();
    }
    const washer=page.locator('.amenity-photo[data-gallery-photo="mesin-basuh"]');
    await washer.scrollIntoViewIfNeeded();
    await expect(washer.locator('img')).toBeVisible();
    await expect(washer.locator('img')).toHaveCSS('object-fit','contain');
    await expect(washer.locator('img')).toHaveAttribute('loading','lazy');
    const dimensions=await washer.evaluate(link=>{
      const rect=link.getBoundingClientRect(),image=link.querySelector('img').getBoundingClientRect();
      return {linkWidth:rect.width,imageWidth:image.width,imageHeight:image.height,overflow:document.documentElement.scrollWidth-innerWidth};
    });
    expect(dimensions.linkWidth).toBeGreaterThan(200);
    expect(dimensions.imageWidth).toBeGreaterThan(200);
    expect(dimensions.imageHeight).toBeGreaterThan(130);
    expect(dimensions.overflow).toBeLessThanOrEqual(1);
    await washer.focus();
    await page.keyboard.press('Enter');
    if(width<=900) await expect(page).toHaveURL(/gambar(?:-en)?\.html\?photo=mesin-basuh/);
    await expect(page.locator('#galleryDialog')).toHaveAttribute('open','');
    await expect(page.locator('#galleryCaption')).toHaveText(lang==='en'?'Washing machine':'Mesin basuh');
    await page.keyboard.press('Escape');
  }
});
