'use strict';

const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const config=require('../src/data/site.config.cjs');

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
    const facilityPhotos=config.facilities.flatMap(facility=>facility.photos||[]);
    await expect(page.locator('.amenity-photo')).toHaveCount(facilityPhotos.length);
    for(const image of facilityPhotos) {
      const photo=config.gallery.find(item=>item.image===image);
      const link=page.locator(`.amenity-photo[data-gallery-photo="${image}"]`);
      const card=page.locator(`.gallery-trigger[data-gallery-photo="${image}"]`);
      await expect(link).toHaveAttribute('href',await card.getAttribute('href'));
      await link.click();
      await expect(page.locator('#galleryDialog')).toHaveAttribute('open','');
      await expect(page.locator('#galleryCaption')).toHaveText(photo[lang]);
      await expect(page.locator('#galleryImageStage')).toHaveAttribute('data-state','ready');
      await expect(page.locator('#galleryImage')).toHaveAttribute('src',new URL(await card.getAttribute('href'),page.url()).href);
      const categoryPhotos=config.gallery.filter(item=>item.category===photo.category);
      await expect(page.locator('#galleryThumbnails button')).toHaveCount(categoryPhotos.length);
      const nextPhoto=categoryPhotos[(categoryPhotos.findIndex(item=>item.image===image)+1)%categoryPhotos.length];
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#galleryCaption')).toHaveText(nextPhoto[lang]);
      await expect(page.locator('#galleryImageStage')).toHaveAttribute('data-state','ready');
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator('#galleryCaption')).toHaveText(photo[lang]);
      await page.keyboard.press('Escape');
      await expect(link).toBeFocused();
      await expect(page.locator('[data-gallery-filter="outside"]')).toHaveAttribute('aria-pressed','true');
      await expect(page.locator('#galleryGrid .gallery-card:visible')).toHaveCount(config.gallery.filter(item=>item.category==='outside').length);
    }
    const photoLink=page.locator('.amenity-photo[data-gallery-photo="dapur"]');
    const imageUrl=new URL(await photoLink.getAttribute('href'),page.url()).href;
    const openerUrl=page.url();
    // Verify the site's modifier guard with a real trusted click. Observe it at
    // document level, after the application's link handlers, then prevent only
    // the browser default. Native image-tab startup is flaky in headless CI;
    // the real href's navigation and image decoding are verified separately.
    await photoLink.evaluate(link=>{
      const observe=event=>{
        if(!link.contains(event.target)) return;
        window.__modifiedPhotoClick={defaultPrevented:event.defaultPrevented,ctrlKey:event.ctrlKey,shiftKey:event.shiftKey,button:event.button,isTrusted:event.isTrusted,href:link.href};
        event.preventDefault();
        document.removeEventListener('click',observe);
      };
      document.addEventListener('click',observe);
    });
    await photoLink.click({modifiers:['Control','Shift']});
    expect(await page.evaluate(()=>window.__modifiedPhotoClick)).toEqual({defaultPrevented:false,ctrlKey:true,shiftKey:true,button:0,isTrusted:true,href:imageUrl});
    await expect(page).toHaveURL(openerUrl);
    await expect(page.locator('#galleryDialog')).not.toHaveAttribute('open','');
    // Starting from an initialized page tests the fallback content without
    // depending on Chromium's native new-tab initialization/event ordering.
    const popup=await context.newPage();
    await popup.bringToFront();
    const imageResponse=await popup.goto(imageUrl);
    expect(imageResponse).not.toBeNull();
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

  test(`${lang} FAQ focus survives a delayed final script on arrival and language switching`,async({page})=>{
    let release;
    let gate;
    const pauseLastScript=()=>{gate=new Promise(resolve=>{release=resolve;});};
    pauseLastScript();
    await page.route('**/nearby.js',async route=>{await gate;await route.continue();});
    const finishNavigation=async()=>{
      await expect(page.locator('#faqControls')).toBeVisible();
      // Let FAQ's initial rendering run while the final defer script still
      // prevents DOMContentLoaded and the browser's initial fragment handling.
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      expect(await page.evaluate(()=>performance.getEntriesByType('navigation')[0].domContentLoadedEventStart)).toBe(0);
      release();
      await page.waitForLoadState('load');
      await expect(page.locator('#faq-payment')).toHaveAttribute('open','');
      await expect(page.locator('#faq-payment summary')).toBeFocused();
      expect(await page.locator('#faq-payment').evaluate(question=>question.getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom+12)).toBe(true);
    };
    try {
      await page.goto(`${home}#faq-payment`,{waitUntil:'commit'});
      await finishNavigation();
      pauseLastScript();
      await page.locator('#menuToggle').click();
      const other=lang==='en'?'ms':'en';
      await page.locator(`.language-links a[hreflang="${other}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${other==='en'?'/en\\.html':'/'}#faq-payment$`));
      await finishNavigation();
    } finally { release(); }
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
    await expect(page.locator('.amenity-photo')).toHaveCount(config.facilities.flatMap(facility=>facility.photos||[]).length);
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
