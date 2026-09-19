'use strict';
const {test,expect}=require('@playwright/test');
const destinations=require('../destinations.cjs');
const routes=require('../destination-routes.cjs');
const {business}=require('../site.config.cjs');
const AxeBuilder=require('@axe-core/playwright').default;

test.beforeEach(async({context,page})=>{
  await context.route('https://www.google.com/maps/embed**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Map</title><main>Map fixture</main></html>'}));
  await page.emulateMedia({reducedMotion:'reduce'});
});

for(const lang of ['ms','en']) test(`${lang} destination search finds aliases, restores all places and retains the original area guide`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(lang==='en'?'/en.html':'/');
  const cards=page.locator('#destinationsList .destination-card');
  await expect(cards).toHaveCount(destinations.length);
  await expect(page.locator('#destinationsList .destination-card:visible')).toHaveCount(6);
  await page.locator('#destinationSearch').fill('  uUm  ');
  await expect(page.locator('[data-destination-id="uum"]')).toBeVisible();
  await expect(page.locator('[data-destination-id="edc-uum"]')).toBeVisible();
  await expect(page.locator('[data-destination-id="hospital-jitra"]')).toBeHidden();
  await page.locator('[data-destination-query="airport"]').click();
  await expect(page.locator('#destinationsList .destination-card:visible')).toHaveCount(1);
  await expect(page.locator('[data-destination-id="airport"]')).toBeVisible();
  await expect(page.locator('#destinationSearch')).toBeFocused();
  await page.locator('#destinationSearch').fill('destination-that-does-not-exist <script>');
  await expect(page.locator('#destinationEmpty')).toBeVisible();
  await expect(page.locator('#destinationsList .destination-card:visible')).toHaveCount(0);
  await page.locator('#destinationClear').click();
  await expect(page.locator('#destinationSearch')).toHaveValue('');
  await expect(page.locator('#destinationEmpty')).toBeHidden();
  await page.locator('#destinationsMore').click();
  await expect(page.locator('#destinationsList .destination-card:visible')).toHaveCount(destinations.length);
  await page.locator('#destinationsMore').click();
  await expect(page.locator('#destinationsList .destination-card:visible')).toHaveCount(6);
  await page.locator('.nearby-original > summary').click();
  await page.locator('.nearby-grid details').filter({hasText:'POLIMAS'}).locator('summary').click();
  await expect(page.locator('.nearby-grid')).toContainText('IPG Darulaman');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('driving links start at the home pin and only evidenced routes display dated distance estimates',async({page})=>{
  await page.goto('/');
  const origin=`${business.coordinates.latitude},${business.coordinates.longitude}`;
  for(const destination of destinations){
    const card=page.locator(`[data-destination-id="${destination.id}"]`);
    const url=new URL(await card.locator('a').getAttribute('href'));
    expect(url.origin).toBe('https://www.google.com');
    const route=routes[destination.id];
    if(!route&&destination.locationNote){
      expect(url.pathname).toBe('/maps/search/');
      expect(url.searchParams.get('query')).toBe(destination.query);
      await expect(card.locator('.destination-distance')).toHaveCount(0);
      await expect(card.locator('.destination-unchecked')).toHaveText(destination.locationNote.ms);
      continue;
    }
    expect(url.pathname).toBe('/maps/dir/');
    expect(url.searchParams.get('origin')).toBe(origin);
    expect(url.searchParams.get('travelmode')).toBe('driving');
    expect(url.searchParams.get('destination')).toBeTruthy();
    if(route){
      expect(route.distanceKm).toBeGreaterThan(0);
      expect(route.durationMinutes).toBeGreaterThan(0);
      await expect(card.locator('time')).toHaveAttribute('datetime',route.checkedAt);
      await expect(card.locator('.destination-distance')).toContainText(`${route.distanceKm} km`);
      await expect(card.locator('.destination-toll')).toHaveCount(Number(route.tollsWarningDisplayed));
    } else {
      await expect(card.locator('.destination-distance')).toHaveCount(0);
      await expect(card.locator('.destination-unchecked')).toHaveCount(1);
    }
  }
});

test('destination search remains usable on a narrow dark screen and passes accessibility checks',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await page.emulateMedia({colorScheme:'dark'});
  await page.goto('/en.html');
  await page.locator('#destinationSearch').fill('hospital');
  await expect(page.locator('#destinationsList .destination-card:visible')).toHaveCount(1);
  await expect(page.locator('#destinationResults')).toContainText('1 destination found');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).include('.destination-finder').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

test('all destinations and ordinary driving links remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',viewport:{width:390,height:844}});
  await context.route('https://www.google.com/maps/embed**',route=>route.fulfill({contentType:'text/html',body:'<main>Map fixture</main>'}));
  const page=await context.newPage();
  for(const route of ['/','/en.html']){
    await page.goto(test.info().project.use.baseURL+route);
    await expect(page.locator('#destinationControls')).toBeHidden();
    await expect(page.locator('#destinationsList .destination-card:visible')).toHaveCount(destinations.length);
    await expect(page.locator('#destinationsList a')).toHaveCount(destinations.length);
    await expect(page.locator('#destinationsMore')).toBeHidden();
  }
  await context.close();
});
