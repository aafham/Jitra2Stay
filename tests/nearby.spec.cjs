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

const categoryIds=['all','education','attractions','halls','shopping','health','mosques','hotels','transport','agencies','towns'];
const visibleCards=page=>page.locator('#destinationsList .destination-card:visible');
const visibleIds=page=>visibleCards(page).evaluateAll(cards=>cards.map(card=>card.dataset.destinationId));
const categoryButton=(page,id)=>page.locator('[data-destination-category="'+id+'"]');

for(const lang of ['ms','en']) test(`${lang} categories retain search terms, filter their intersection and reset both filters`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(lang==='en'?'/en.html':'/');
  const input=page.locator('#destinationSearch');
  const clear=page.locator('#destinationClear');
  const more=page.locator('#destinationsMore');
  const results=page.locator('#destinationResults');
  await expect(page.locator('#destinationsList .destination-card')).toHaveCount(50);
  await expect(visibleCards(page)).toHaveCount(6);
  await expect(categoryButton(page,'all')).toHaveAttribute('aria-pressed','true');
  await expect(clear).toBeHidden();
  const education=categoryButton(page,'education');
  await education.click();
  await expect(education).toBeFocused();
  await expect(education).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.destination-categories [aria-pressed="true"]')).toHaveCount(1);
  await expect(results).toContainText(lang==='en'?'6 of 18':'6 daripada 18');
  await expect(results).toContainText((await education.textContent()).trim());
  await expect(clear).toHaveText(lang==='en'?'Reset filters':'Set semula');
  await expect(clear).toBeVisible();
  await more.click();
  await expect(visibleCards(page)).toHaveCount(18);
  await expect(more).toHaveAttribute('aria-expanded','true');
  for(const id of ['uum','polimas','ipg-darulaman']) await expect(page.locator('[data-destination-id="'+id+'"]')).toBeVisible();
  await expect(page.locator('[data-destination-id="edc-uum"]')).toBeHidden();
  await more.click();
  await expect(visibleCards(page)).toHaveCount(6);
  await expect(more).toHaveAttribute('aria-expanded','false');
  await input.fill(lang==='en'?'education':'pendidikan');
  await expect(visibleCards(page)).toHaveCount(18);
  await expect(more).toBeHidden();
  for(const [query,id] of [['POLIMAS','polimas'],['IPG','ipg-darulaman'],['  uUm  ','uum']]){
    await input.fill(query);
    expect(await visibleIds(page)).toEqual([id]);
    await expect(more).toBeHidden();
    await expect(education).toHaveAttribute('aria-pressed','true');
    await expect(results).toContainText((await education.textContent()).trim());
    await expect(results).toContainText(lang==='en'?/1 destinations? found/:'1 destinasi dijumpai');
  }
  const hotels=categoryButton(page,'hotels');
  await hotels.click();
  await expect(hotels).toBeFocused();
  await expect(input).toHaveValue('  uUm  ');
  expect(await visibleIds(page)).toEqual(['edc-uum']);
  await expect(results).toContainText((await hotels.textContent()).trim());
  await expect(page.locator('.destination-categories [aria-pressed="true"]')).toHaveCount(1);
  await input.fill('destination-that-does-not-exist <script>');
  await expect(hotels).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#destinationEmpty')).toBeVisible();
  await expect(visibleCards(page)).toHaveCount(0);
  await expect(more).toBeHidden();
  await clear.click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(categoryButton(page,'all')).toHaveAttribute('aria-pressed','true');
  await expect(clear).toBeHidden();
  await expect(page.locator('#destinationEmpty')).toBeHidden();
  await expect(visibleCards(page)).toHaveCount(6);
  await input.fill('airport');
  expect(await visibleIds(page)).toEqual(['airport']);
  await clear.click();
  await more.click();
  await expect(visibleCards(page)).toHaveCount(50);
  await more.click();
  await expect(visibleCards(page)).toHaveCount(6);
  await page.locator('.nearby-original > summary').click();
  await page.locator('.nearby-grid details').filter({hasText:'POLIMAS'}).locator('summary').click();
  await expect(page.locator('.nearby-grid')).toContainText('IPG Darulaman');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('every destination category has useful membership and their union preserves all 50 unique places',async({page})=>{
  await page.goto('/en.html');
  const allIds=await page.locator('#destinationsList .destination-card').evaluateAll(cards=>cards.map(card=>card.dataset.destinationId));
  expect(allIds).toHaveLength(50);
  expect(new Set(allIds).size).toBe(50);
  expect(await page.locator('.destination-categories button').evaluateAll(buttons=>buttons.map(button=>button.dataset.destinationCategory))).toEqual(categoryIds);
  const keyMembers={education:['uum','polimas','ipg-darulaman'],attractions:['tasik-darulaman','masjid-zahir'],halls:['dewan-jitra','dewan-tunku-anum','dewan-wawasan'],shopping:['lotus-jitra','c-mart-bdi','yawata'],health:['hospital-jitra'],mosques:['masjid-zahir','masjid-sharifah-fatimah'],hotels:['edc-uum','hotel-bustani'],transport:['airport'],agencies:['mpkp','ipd-kubang-pasu'],towns:['bandar-jitra','bukit-kayu-hitam']};
  const membership=new Map();
  for(const id of categoryIds.slice(1)){
    const button=categoryButton(page,id);
    await button.click();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.destination-categories [aria-pressed="true"]')).toHaveCount(1);
    expect(await visibleCards(page).count()).toBeLessThanOrEqual(6);
    if(await page.locator('#destinationsMore').isVisible()) await page.locator('#destinationsMore').click();
    const ids=await visibleIds(page);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(keyMembers[id]));
    if(id==='education') expect(ids).toHaveLength(18);
    for(const destinationId of ids){
      const categories=await page.locator('[data-destination-id="'+destinationId+'"]').getAttribute('data-destination-categories');
      expect(categories.split(/\s+/)).toContain(id);
      membership.set(destinationId,[...(membership.get(destinationId)||[]),id]);
    }
  }
  expect([...membership.keys()].sort()).toEqual([...allIds].sort());
  expect([...membership.entries()].filter(([,ids])=>ids.length>1)).toEqual([['masjid-zahir',['attractions','mosques']]]);
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

test('every category chip stays fully visible during keyboard browsing on narrow dark screens',async({page})=>{
  await page.emulateMedia({colorScheme:'dark'});
  for(const [width,height,lang] of [[320,568,'en'],[390,844,'ms']]){
    await page.setViewportSize({width,height});
    await page.goto(lang==='en'?'/en.html':'/');
    const group=page.locator('.destination-categories');
    expect(await group.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
    async function expectChipVisible(id){
      const button=categoryButton(page,id);
      await expect(button).toBeFocused();
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const visible=await button.evaluate(el=>{
        const rect=el.getBoundingClientRect();
        const scroller=el.closest('.destination-categories').getBoundingClientRect();
        const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
        return {
          insideScroller:rect.left>=scroller.left-1&&rect.right<=scroller.right+1,
          insideViewport:rect.left>=0&&rect.right<=innerWidth,
          centerUncovered:Boolean(hit&&(hit===el||el.contains(hit)))
        };
      });
      expect(visible.insideScroller,width+'px '+lang+' '+id+' fits its scroller').toBe(true);
      expect(visible.insideViewport,width+'px '+lang+' '+id+' fits the viewport').toBe(true);
      expect(visible.centerUncovered,width+'px '+lang+' '+id+' center is unobstructed').toBe(true);
    }
    await categoryButton(page,'all').focus();
    await expectChipVisible('all');
    for(const id of categoryIds.slice(1)){
      await page.keyboard.press('Tab');
      await expectChipVisible(id);
    }
    await page.keyboard.press('Enter');
    await expect(categoryButton(page,'towns')).toHaveAttribute('aria-pressed','true');
    await expect(categoryButton(page,'towns')).toBeFocused();
    expect(await group.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
    const halls=categoryButton(page,'halls');
    await halls.focus();
    await expectChipVisible('halls');
    await page.keyboard.press('Space');
    await expect(halls).toBeFocused();
    await expect(halls).toHaveAttribute('aria-pressed','true');
    await expect(visibleCards(page)).toHaveCount(3);
    await expect(page.locator('#destinationResults')).toContainText(lang==='en'?'3 of 3':'3 daripada 3');
    await expect(page.locator('#destinationResults')).toContainText((await halls.textContent()).trim());
    await page.locator('#destinationSearch').fill('dewan');
    await expect(page.locator('#destinationResults')).toContainText(lang==='en'?'3 destinations found':'3 destinasi dijumpai');
    expect(await group.locator('button').evaluateAll(buttons=>buttons.every(button=>button.getBoundingClientRect().height>=44))).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).include('.destination-finder').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  }
});

test('all destinations and ordinary driving links remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',viewport:{width:390,height:844}});
  await context.route('https://www.google.com/maps/embed**',route=>route.fulfill({contentType:'text/html',body:'<main>Map fixture</main>'}));
  const page=await context.newPage();
  for(const route of ['/','/en.html']){
    await page.goto(test.info().project.use.baseURL+route);
    await expect(page.locator('#destinationControls')).toBeHidden();
    await expect(page.locator('#destinationsList .destination-card:visible')).toHaveCount(50);
    await expect(page.locator('#destinationsList .destination-kind:visible')).toHaveCount(50);
    expect(await page.locator('#destinationsList .destination-kind').evaluateAll(labels=>labels.every(label=>label.textContent.trim().length>0))).toBe(true);
    await expect(page.locator('[data-destination-id="uum"] .destination-kind')).toContainText(/pendidikan|education/i);
    await expect(page.locator('#destinationsList a')).toHaveCount(50);
    await expect(page.locator('#destinationsMore')).toBeHidden();
  }
  await context.close();
});
