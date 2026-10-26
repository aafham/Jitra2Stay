'use strict';
const {test,expect}=require('@playwright/test');

test('arrival photos open the matching gallery photo while maps and directions remain available',async({page,context})=>{
  await context.route('https://www.google.com/maps/embed**',route=>route.fulfill({contentType:'text/html',body:'<title>Map fixture</title>'}));
  for(const [width,lang] of [[320,'ms'],[390,'en'],[1440,'ms']]) {
    const suffix=lang==='en'?'-en':'';
    await page.setViewportSize({width,height:900});
    await page.goto(`/lokasi${suffix}.html`);
    await expect(page.locator('#locationMapFrame')).toBeVisible();
    await expect(page.locator('[data-navigation="google"]')).toHaveAttribute('href',/^https:\/\/goo\.gl\/maps\//);
    await expect(page.locator('[data-navigation="waze"]')).toHaveAttribute('href',/navigate=yes/);
    await expect(page.locator('.arrival-photo')).toHaveCount(2);
    await expect(page.locator('.arrival-preview')).toContainText(lang==='en'?'3 to 4 cars':'3 hingga 4 kereta');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await page.locator('.arrival-photo[href*="photo=parking"]').click();
    await expect(page).toHaveURL(new RegExp(`gambar${suffix}\\.html\\?photo=parking`));
    await expect(page.locator('#galleryDialog')).toHaveAttribute('open','');
    await expect(page.locator('#galleryCaption')).toHaveText(lang==='en'?'Parking area':'Kawasan parking');
    await page.keyboard.press('Escape');
  }
});

test('the local heading font loads once and a failed font keeps mobile essentials readable',async({page,browser})=>{
  await page.setViewportSize({width:320,height:568});
  const fontRequests=[];
  page.on('request',request=>{if(request.resourceType()==='font')fontRequests.push(request.url())});
  await page.goto('/');
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.fonts.check('400 36px Lora'))).toBe(true);
  expect(fontRequests).toHaveLength(1);
  expect(new URL(fontRequests[0]).pathname).toBe('/fonts/lora-latin-400.woff2');
  expect(new URL(fontRequests[0]).origin).toBe(new URL(page.url()).origin);
  // A fresh context avoids WebKit's in-memory font reuse across navigations.
  const fallbackContext=await browser.newContext({baseURL:new URL(page.url()).origin,viewport:{width:320,height:568}});
  try {
    const fallback=await fallbackContext.newPage();
    await fallbackContext.route('**/fonts/*.woff2',route=>route.abort());
    await fallback.goto('/en.html');
    await fallback.evaluate(()=>document.fonts.load('400 36px Lora').catch(()=>[]));
    await fallback.evaluate(()=>document.fonts.ready);
    expect(await fallback.evaluate(()=>[...document.fonts].find(face=>face.family==='Lora').status)).toBe('error');
    for(const selector of ['#heroTitle','.hero-details','.hero-rate','#heroPrimaryCta']) {
      const item=fallback.locator(selector);
      await expect(item).toBeVisible();
      const box=await item.boundingBox();
      expect(box.y+box.height).toBeLessThanOrEqual(568);
    }
    expect(await fallback.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  } finally {
    await fallbackContext.close();
  }
});
