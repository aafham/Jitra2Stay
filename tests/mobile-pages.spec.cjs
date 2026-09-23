'use strict';

const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const config=require('../src/data/site.config.cjs');

async function isolate(context) {
  await context.route('https://www.google.com/maps/embed**',route=>route.fulfill({
    contentType:'text/html',body:'<!doctype html><html lang="en"><title>Map fixture</title><main>Map</main></html>'
  }));
  await context.route('https://wa.me/**',route=>route.abort());
  await context.route('**/functions/v1/guest-calendar**',route=> {
    const action=new URL(route.request().url()).searchParams.get('action');
    return route.fulfill({contentType:'application/json',body:JSON.stringify(action==='calendar'?{stays:[]}:{guests:[]})});
  });
}

test.beforeEach(async({context,page})=>{
  await isolate(context);
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
});

const routeFor=(slug,lang='ms')=>slug==='home'?(lang==='en'?'/en.html':'/'):`/${slug}${lang==='en'?'-en':''}.html`;

async function noOverflow(page) {
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
}

async function usableBottomNav(page,activePath) {
  const nav=page.locator('.mobile-bottom-nav');
  await expect(nav).toBeVisible();
  await expect(nav.locator('a')).toHaveCount(5);
  await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
  expect(new URL(await nav.locator('a[aria-current="page"]').getAttribute('href'),page.url()).pathname).toBe(activePath);
  const geometry=await nav.evaluate(element=>{
    const rect=element.getBoundingClientRect();
    return {bottom:rect.bottom,width:rect.width,links:Array.from(element.querySelectorAll('a'),link=>{
      const box=link.getBoundingClientRect();
      const hit=document.elementFromPoint(box.x+box.width/2,box.y+box.height/2);
      return {height:box.height,width:box.width,hit:Boolean(hit&&(hit===link||link.contains(hit)))};
    })};
  });
  expect(geometry.bottom).toBeLessThanOrEqual((await page.viewportSize()).height+1);
  for(const link of geometry.links) {
    expect(link.height).toBeGreaterThanOrEqual(44);
    expect(link.width).toBeGreaterThanOrEqual(44);
    expect(link.hit).toBe(true);
  }
  await noOverflow(page);
}

for(const [width,lang,theme] of [[320,'ms','light'],[390,'en','dark']]) {
  test(`${width}px ${lang} compact home and five bottom tabs reach focused pages`,async({page})=>{
    await page.setViewportSize({width,height:844});
    await page.emulateMedia({colorScheme:theme});
    await page.goto(routeFor('home',lang));
    await expect(page.locator('body')).toHaveAttribute('data-view','home');
    await expect(page.locator('.mobile-home')).toBeVisible();
    await expect(page.locator('#menuToggle')).toBeHidden();
    await expect(page.locator('#galeri')).toBeHidden();
    await expect(page.locator('#semak-tarikh')).toBeHidden();
    await expect(page.locator('.mobile-action-bar')).toBeHidden();
    await usableBottomNav(page,routeFor('home',lang));
    for(const [index,slug,section] of [[1,'gambar','#galeri'],[2,'harga','#kadar'],[3,'kalendar','#kalendar'],[4,'maklumat',null],[0,'home','.mobile-home']]) {
      await page.locator('.mobile-bottom-nav a').nth(index).click();
      await expect(page).toHaveURL(new RegExp(`${routeFor(slug,lang).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`));
      await expect(page.locator('body')).toHaveAttribute('data-view',slug);
      if(section)await expect(page.locator(section)).toBeVisible();
      await usableBottomNav(page,routeFor(slug,lang));
    }
    expect((await new AxeBuilder({page}).include('.mobile-home').include('.mobile-bottom-nav').analyze()).violations).toEqual([]);
  });
}

test('desktop keeps the complete homepage and anchored navigation',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/#kadar');
  await expect(page).toHaveURL(/\/#kadar$/);
  await expect(page.locator('.mobile-home')).toBeHidden();
  await expect(page.locator('.mobile-bottom-nav')).toBeHidden();
  for(const id of ['home','tentang','galeri','kadar','kalendar','kemudahan','lokasi','faq','semak-tarikh']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await page.locator('#mainNav a[href="#galeri"]').click();
  await expect(page).toHaveURL(/\/#galeri$/);
  await noOverflow(page);
});

test('old mobile section and FAQ URLs open the corresponding focused pages',async({page})=>{
  for(const [lang,hash,slug] of [
    ['ms','tentang','rumah'],['en','galeri','gambar'],['ms','kadar','harga'],
    ['en','kalendar','kalendar'],['ms','kemudahan','kemudahan'],['en','lokasi','lokasi'],
    ['ms','semak-tarikh','hubungi'],['en',`faq-${config.faq[0].key}`,'faq']
  ]) {
    await page.goto(`${routeFor('home',lang)}#${hash}`);
    await expect(page).toHaveURL(new RegExp(`${routeFor(slug,lang).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}#${hash}$`));
    await expect(page.locator(`#${hash}`)).toBeVisible();
  }
  await expect(page.locator(`#faq-${config.faq[0].key}`)).toHaveAttribute('open','');
});

test('inherited object names are ignored as mobile routes on arrival and hash changes',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const hash of ['constructor','toString','__proto__','hasOwnProperty']) {
    await page.goto(`/#${hash}`);
    await expect(page.locator('.mobile-home')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
    expect(new URL(page.url()).hash).toBe(`#${hash}`);
  }
  await page.goto('/');
  for(const hash of ['constructor','toString','__proto__','hasOwnProperty']) {
    await page.evaluate(hash=>{
      location.hash=hash;
      return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    },hash);
    await expect(page.locator('.mobile-home')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
    expect(new URL(page.url()).hash).toBe(`#${hash}`);
  }
  expect(errors).toEqual([]);
});

for(const lang of ['ms','en']) {
  test(`${lang} changing room packages across pages preserves the enquiry draft`,async({page})=>{
    await page.goto(routeFor('harga',lang));
    const choose=page.locator('.package-link[data-rooms="2"]');
    const destination=new URL(await choose.getAttribute('href'),page.url());
    expect(destination.pathname).toBe(routeFor('hubungi',lang));
    expect(destination.searchParams.get('rooms')).toBe('2');
    await choose.click();
    await expect(page.locator('#rooms')).toHaveValue('2');
    await expect(page.locator('#enquiryPackageName')).toContainText('RM170');
    await page.locator('#checkin').fill('2027-12-30');
    await page.locator('#checkout').fill('2028-01-01');
    await page.locator('#guests').fill('8');
    await page.locator('#notes').fill('Private family arrival note');
    await page.locator('#depositCategory').selectOption('large');
    await page.locator('#changeEnquiryPackage').click();
    await expect(page).toHaveURL(new RegExp(`${routeFor('harga',lang).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`));
    await page.locator('.package-link[data-rooms="3"]').click();
    await expect(page.locator('#rooms')).toHaveValue('3');
    await expect(page.locator('#checkin')).toHaveValue('2027-12-30');
    await expect(page.locator('#checkout')).toHaveValue('2028-01-01');
    await expect(page.locator('#guests')).toHaveValue('8');
    await expect(page.locator('#notes')).toHaveValue('Private family arrival note');
    await expect(page.locator('#depositCategory')).toHaveValue('large');
    await expect(page.locator('#estimatePayable')).toHaveText('RM660');
    expect(page.url()).not.toContain('Private');
    const other=lang==='ms'?'en':'ms';
    await page.locator(`.mobile-language a[hreflang="${other}"]`).click();
    expect(new URL(page.url()).pathname).toBe(routeFor('hubungi',other));
    await expect(page.locator('#rooms')).toHaveValue('3');
    await expect(page.locator('#notes')).toHaveValue('Private family arrival note');
    await noOverflow(page);
  });
}

test('invalid package query cannot replace the saved choice or inject a new option',async({page})=>{
  await page.goto('/hubungi.html?rooms=4');
  await expect(page.locator('#rooms')).toHaveValue('4');
  await page.locator('#notes').fill('Keep this draft');
  await page.locator('#rooms').selectOption('5');
  await page.reload();
  await expect(page.locator('#rooms')).toHaveValue('5');
  await page.goto('/hubungi.html?rooms=999');
  await expect(page.locator('#rooms')).toHaveValue('5');
  await expect(page.locator('#notes')).toHaveValue('Keep this draft');
  expect(await page.locator('#rooms option').count()).toBe(config.rates.length);
});

test('amenity link opens its known photo on the gallery page and unknown photos are ignored',async({page})=>{
  await page.goto('/kemudahan.html');
  const photo=config.facilities.flatMap(facility=>facility.photos||[])[0];
  const link=page.locator(`.amenity-photo[data-gallery-photo="${photo}"]`);
  const target=new URL(await link.getAttribute('href'),page.url());
  expect(target.pathname).toBe('/gambar.html');
  expect(target.searchParams.get('photo')).toBe(photo);
  await link.click();
  await expect(page.locator('#galleryDialog')).toHaveAttribute('open','');
  await expect(page.locator('#galleryCaption')).toHaveText(config.gallery.find(item=>item.image===photo).ms);
  await expect(page.locator('#galleryImageStage')).toHaveAttribute('data-state','ready');
  await page.keyboard.press('Escape');
  await expect(page.locator('#galleryDialog')).not.toHaveAttribute('open','');
  await noOverflow(page);
  await page.goto('/gambar.html?photo=not-a-house-photo');
  await expect(page.locator('#galleryControls')).toBeVisible();
  await expect(page.locator('#galleryDialog')).not.toHaveAttribute('open','');
});

test('FAQ answer language switch retains the selected answer',async({page})=>{
  const id=`faq-${config.faq[0].key}`;
  await page.goto(`/faq.html#${id}`);
  await expect(page.locator(`#${id}`)).toHaveAttribute('open','');
  await page.locator('.mobile-language a[hreflang="en"]').click();
  await expect(page).toHaveURL(new RegExp(`/faq-en.html#${id}$`));
  await expect(page.locator(`#${id}`)).toHaveAttribute('open','');
  await expect(page.locator(`#${id} summary`)).toBeFocused();
});

test('location page keeps maps, directions and destination filtering independently usable',async({page})=>{
  await page.goto('/lokasi.html');
  await expect(page.locator('#locationMapFrame')).toBeVisible();
  await expect(page.locator('[data-navigation="google"]')).toHaveAttribute('href',config.business.mapUrl);
  await expect(page.locator('[data-navigation="waze"]')).toHaveAttribute('href',/^https:\/\/www\.waze\.com\/ul\?/);
  await page.locator('#destinationSearch').fill('POLIMAS');
  await expect(page.locator('#destinationsList [data-destination-id]:visible')).toHaveCount(1);
  await expect(page.locator('#destinationsList [data-destination-id]:visible')).toContainText('POLIMAS');
  await noOverflow(page);
});

test('bottom navigation clears the keyboard area while an enquiry input retains focus',async({page})=>{
  await page.goto('/hubungi.html');
  const input=page.locator('#checkin');
  await input.focus();
  await expect(input).toBeFocused();
  await expect(page.locator('.mobile-bottom-nav')).toBeHidden();
  await page.locator('#enquiryFormTitle').focus();
  await expect(page.locator('#enquiryFormTitle')).toBeFocused();
  await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
  await noOverflow(page);
});

test('mobile navigation, prices and contact fallbacks remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:740}});
  await isolate(context);
  const page=await context.newPage();
  try {
    await page.goto('/');
    await expect(page.locator('.mobile-home')).toBeVisible();
    await usableBottomNav(page,'/');
    await expect(page.locator('.hero-photo-mobile')).toBeVisible();
    await expect(page.locator('.hero-photo-mobile')).toHaveAttribute('href','gambar.html');
    await page.locator('.hero-photo-mobile').click();
    await expect(page).toHaveURL(/\/gambar\.html$/);
    await expect(page.locator('.gallery-trigger')).toHaveCount(config.gallery.length);
    await page.locator('.mobile-bottom-nav a').nth(2).click();
    await expect(page).toHaveURL(/\/harga\.html$/);
    await expect(page.locator('.package-card')).toHaveCount(config.rates.length);
    await page.locator('.package-link[data-rooms="2"]').click();
    await expect(page).toHaveURL(/\/hubungi\.html\?rooms=2$/);
    await expect(page.locator('.enquiry-panel noscript')).toBeVisible();
    await expect(page.locator('.enquiry-section a[href^="https://wa.me/"]').first()).toBeVisible();
    await page.goto('/gambar.html');
    await expect(page.locator('.gallery-trigger')).toHaveCount(config.gallery.length);
    expect(await page.locator('.gallery-trigger').first().getAttribute('href')).toMatch(/^images\//);
    await noOverflow(page);
  } finally {await context.close();}
});

test('without JavaScript FAQ links target their visible pages and the directory exposes all contact options',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:740}});
  await isolate(context);
  const page=await context.newPage();
  try {
    for(const lang of ['ms','en']) {
      await page.goto(routeFor('faq',lang));
      const answer=page.locator(`#faq-${config.faq[0].key}`);
      await answer.locator('summary').click();
      const link=answer.locator('.faq-answer-link');
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href',`${config.business.siteUrl.replace(/\/$/,'')}${routeFor('faq',lang)}#faq-${config.faq[0].key}`);
      await page.goto(routeFor('maklumat',lang));
      const contacts=page.locator('.browse-contacts');
      await contacts.locator('summary').click();
      for(const href of [`tel:+${config.business.phone}`,`tel:+${config.business.secondaryPhone}`,`mailto:${config.business.email}`]) {
        await expect(contacts.locator(`a[href="${href}"]`)).toBeVisible();
      }
      await expect(contacts.locator('a')).toHaveCount(3);
      await noOverflow(page);
    }
  } finally {await context.close();}
});
