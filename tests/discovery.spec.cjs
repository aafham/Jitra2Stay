'use strict';

const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const config=require('../site.config.cjs');

async function isolateExternalServices(context) {
  await context.route(url=>url.origin==='https://www.google.com'&&url.pathname==='/maps/embed',async route=>{
    if(!route.request().isNavigationRequest()||!route.request().frame().parentFrame()) return route.continue();
    await route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Map fixture</title><main>Map verified separately.</main></html>'});
  });
  await context.route('https://wa.me/**',route=>route.abort());
}

test.beforeEach(async({context,page})=>{
  await isolateExternalServices(context);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
});

for(const lang of ['ms','en']) {
  const home=lang==='en'?'/en.html':'/';
  const publicHome=`${config.business.siteUrl.replace(/\/$/,'')}/${lang==='en'?'en.html':''}`;

  test(`${lang} amenity photos open their real category without changing the gallery filter and restore focus`,async({page,context})=>{
    await page.goto(home);
    await page.locator('[data-gallery-filter="outside"]').click();
    await expect(page.locator('.amenity-photo')).toHaveCount(4);
    for(const image of ['bilik-tidur','dapur','parking','ruang-tamu']) {
      const photo=config.gallery.find(item=>item.image===image);
      const link=page.locator(`.amenity-photo[data-gallery-photo="${image}"]`);
      const card=page.locator(`.gallery-trigger[data-gallery-photo="${image}"]`);
      await expect(link).toHaveAttribute('href',await card.getAttribute('href'));
      await link.click();
      await expect(page.locator('#galleryDialog')).toHaveAttribute('open','');
      await expect(page.locator('#galleryCaption')).toHaveText(photo[lang]);
      await expect(page.locator('#galleryImageStage')).toHaveAttribute('data-state','ready');
      await expect(page.locator('#galleryImage')).toHaveAttribute('src',new URL(await card.getAttribute('href'),page.url()).href);
      await expect(page.locator('#galleryThumbnails button')).toHaveCount(config.gallery.filter(item=>item.category===photo.category).length);
      await page.keyboard.press('Escape');
      await expect(link).toBeFocused();
      await expect(page.locator('[data-gallery-filter="outside"]')).toHaveAttribute('aria-pressed','true');
      await expect(page.locator('#galleryGrid .gallery-card:visible')).toHaveCount(3);
    }
    const photoLink=page.locator('.amenity-photo[data-gallery-photo="dapur"]');
    const imageUrl=new URL(await photoLink.getAttribute('href'),page.url()).href;
    const openerUrl=page.url();
    const imageResponsePromise=context.waitForEvent('response',response=>response.url()===imageUrl&&response.request().isNavigationRequest());
    const popupPromise=context.waitForEvent('page');
    // Ctrl+Shift keeps native modified-link navigation, but opens the image in
    // the foreground. A background image tab can defer its initial navigation
    // in headless Chromium on CI, before Playwright has a usable page event.
    await photoLink.click({modifiers:['Control','Shift']});
    const popup=await popupPromise;
    await popup.bringToFront();
    const imageResponse=await imageResponsePromise;
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()['content-type']).toMatch(/^image\/webp(?:;|$)/);
    await expect(popup).toHaveURL(imageUrl);
    const nativeImage=popup.locator('img');
    await expect(nativeImage).toHaveAttribute('src',imageUrl);
    await nativeImage.evaluate(image=>image.decode());
    expect(await nativeImage.evaluate(image=>image.complete&&image.naturalWidth>0&&image.naturalHeight>0)).toBe(true);
    await expect(page).toHaveURL(openerUrl);
    await expect(page.locator('#galleryDialog')).not.toHaveAttribute('open','');
    await popup.close();
  });

  test(`${lang} FAQ deep links reveal filtered answers, clear the header and survive language switching`,async({page})=>{
    await page.goto(`${home}#faq-cancellation`);
    const first=page.locator('#faq-cancellation');
    await expect(first).toHaveAttribute('open','');
    await expect(first.locator('summary')).toBeFocused();
    expect(await first.evaluate(question=>question.getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom+12)).toBe(true);
    await page.locator('[data-faq-topic="house"]').click();
    await expect(page.locator('#faq-payment')).toBeHidden();
    await page.evaluate(()=>{location.hash='faq-payment';});
    await expect(page.locator('#faq-payment')).toBeVisible();
    await expect(page.locator('#faq-payment')).toHaveAttribute('open','');
    await expect(page.locator('#faq-payment summary')).toBeFocused();
    await expect(page.locator('[data-faq-topic="booking"]')).toHaveAttribute('aria-pressed','true');
    await page.locator('#menuToggle').click();
    const other=lang==='en'?'ms':'en';
    await page.locator(`.language-links a[hreflang="${other}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${other==='en'?'/en\\.html':'/'}#faq-payment$`));
    await expect(page.locator('#faq-payment')).toHaveAttribute('open','');
    await expect(page.locator('#faq-payment summary')).toBeFocused();
    expect(await page.locator('#faq-payment').evaluate(question=>question.getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom+12)).toBe(true);
  });

  test(`${lang} answer links copy only the public FAQ URL and provide an accessible manual fallback`,async({page})=>{
    await page.addInitScript(()=>{
      window.__faqCopies=[];
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__faqCopies.push(text)}});
    });
    await page.goto(`${home}?notes=private&guests=8#faq-deposit`);
    const originalUrl=page.url();
    const question=page.locator('#faq-deposit');
    const expected=`${publicHome}#faq-deposit`;
    await expect(question.locator('.faq-answer-link')).toHaveAttribute('href',expected);
    await question.locator('.faq-copy-link').click();
    expect(await page.evaluate(()=>window.__faqCopies)).toEqual([expected]);
    await expect(question.locator('.faq-copy-feedback')).toHaveText(lang==='en'?'Answer link copied.':'Pautan jawapan disalin.');
    await expect(question.locator('.faq-copy-fallback')).toBeHidden();
    expect(page.url()).toBe(originalUrl);
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
    await question.locator('.faq-copy-link').click();
    const input=question.locator('.faq-copy-fallback');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue(expected);
    expect(await input.evaluate(element=>element.readOnly&&element.selectionStart===0&&element.selectionEnd===element.value.length)).toBe(true);
    expect(page.url()).toBe(originalUrl);
    const result=await new AxeBuilder({page}).include('#faq').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
    await question.locator('.faq-answer-link').click();
    await expect(question.locator('summary')).toBeFocused();
    await expect(question).toHaveAttribute('open','');
  });
}

test('unknown and malformed FAQ fragments do not open answers or propagate as language state',async({page})=>{
  for(const hash of ['faq-not-an-answer','faq-%E0%A4%A']) {
    await page.goto(`/#${hash}`);
    await expect(page.locator('#faqList details[open]')).toHaveCount(0);
    await page.locator('#menuToggle').click();
    await page.locator('.language-links a[hreflang="en"]').click();
    expect(new URL(page.url()).hash).not.toContain('faq-');
    await expect(page.locator('#faqList details[open]')).toHaveCount(0);
  }
});

test('without JavaScript contextual photos and every FAQ answer retain real link fallbacks',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',viewport:{width:390,height:844}});
  await isolateExternalServices(context);
  const page=await context.newPage();
  for(const lang of ['ms','en']) {
    const path=lang==='en'?'/en.html':'/';
    const publicHome=`${config.business.siteUrl.replace(/\/$/,'')}/${lang==='en'?'en.html':''}`;
    await page.goto(test.info().project.use.baseURL+path);
    await expect(page.locator('.amenity-photo')).toHaveCount(4);
    await page.locator('.amenity-photo[data-gallery-photo="dapur"]').click();
    await expect(page).toHaveURL(/\/images\/responsive\/dapur-\d+\.webp$/);
    await page.goto(test.info().project.use.baseURL+path+'#faq-deposit');
    await expect(page.locator('#faqList details')).toHaveCount(config.faq.length);
    await page.locator('#faq-deposit summary').click();
    await expect(page.locator('#faq-deposit > p')).toBeVisible();
    await expect(page.locator('#faq-deposit .faq-copy-link')).toBeHidden();
    await expect(page.locator('#faq-deposit .faq-answer-link')).toHaveAttribute('href',`${publicHome}#faq-deposit`);
  }
  await context.close();
});
