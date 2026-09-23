'use strict';

const {test,expect}=require('@playwright/test');

const fixtureStay={guest_name:'Keluarga Ujian',guest_count:null,check_in:'2026-11-30',check_out:'2026-12-03'};
const nextStay={guest_name:'Tetamu Seterusnya',guest_count:4,check_in:'2026-12-03',check_out:'2026-12-05'};

async function mockCalendar(context,guests=[fixtureStay,nextStay]) {
  const fixture={requests:[],failCalendar:false,calendarGate:null};
  await context.route('**/functions/v1/guest-calendar**',async route=>{
    const request=route.request();
    const url=new URL(request.url());
    const action=url.searchParams.get('action');
    fixture.requests.push({action,method:request.method(),from:url.searchParams.get('from'),to:url.searchParams.get('to')});
    if(action==='calendar'&&fixture.calendarGate) await fixture.calendarGate;
    if(action==='calendar'&&fixture.failCalendar) return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'unavailable'})});
    return route.fulfill({contentType:'application/json',body:JSON.stringify(action==='calendar'?{
      stays:guests.map(({check_in,check_out})=>({check_in,check_out}))
    }:{guests})});
  });
  return fixture;
}

async function openCalendar(page,path='/kalendar.html') {
  await page.goto(path);
  await page.locator('#kalendar').scrollIntoViewIfNeeded();
  await expect(page.locator('#calendarGrid')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('.public-guest-jump')).toHaveCount(2);
}

const guestCard=(page,name)=>page.locator('.public-guest-card').filter({has:page.getByRole('heading',{name,exact:true})});
const day=(page,date)=>page.locator(`[data-calendar-day="${date}"]`);

async function assertSelectedStay(page) {
  await expect(page.locator('#calendarMonth')).toContainText('November 2026');
  await expect(page.locator('#calendarMonth')).toBeFocused();
  await expect(page.locator('#calendarMonth')).toBeInViewport();
  await expect(page.locator('#calendarSelection')).toBeVisible();
  await expect(page.locator('#calendarSelection')).toContainText(fixtureStay.guest_name);
  await expect(page.locator('#calendarGrid .is-selected-stay')).toHaveCount(3);
  await expect(day(page,'2026-11-30')).toHaveClass(/is-stay-start/);
  for(const date of ['2026-11-30','2026-12-01','2026-12-02']) {
    await expect(day(page,date)).toHaveClass(/is-selected-stay/);
    await expect(day(page,date)).toHaveAttribute('data-state','occupied');
  }
  // Another guest checks in on departure day: it is occupied, but is not part
  // of the selected stay. This guards against conflating red and selection.
  await expect(day(page,'2026-12-03')).toHaveAttribute('data-state','occupied');
  await expect(day(page,'2026-12-03')).not.toHaveClass(/is-selected-stay/);
}

test.beforeEach(async({context,page})=>{
  await context.route('https://www.google.com/maps/embed**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Map fixture</title></html>'}));
  await page.clock.setFixedTime(new Date('2026-09-23T04:00:00Z'));
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
});

for(const {width,path,buttonText} of [
  {width:1280,path:'/#kalendar',buttonText:'Lihat di kalendar'},
  {width:390,path:'/kalendar-en.html',buttonText:'View in calendar'}
]) {
  test(`${width}px upcoming guest name jumps to that stay in the calendar`,async({context,page})=>{
    const fixture=await mockCalendar(context);
    await page.setViewportSize({width,height:900});
    await openCalendar(page,path);
    const before=page.url();
    const card=guestCard(page,fixtureStay.guest_name);
    await expect(card.getByRole('button',{name:new RegExp(fixtureStay.guest_name)})).toContainText(buttonText);
    await card.scrollIntoViewIfNeeded();
    const name=await card.getByRole('heading').boundingBox();
    // A real pointer click on the person's name must activate the card, even
    // though the accessible control is a stretched native button.
    await page.mouse.click(name.x+Math.min(20,name.width/2),name.y+name.height/2);
    await assertSelectedStay(page);
    expect(page.url()).toBe(before);
    expect(fixture.requests.some(request=>request.action==='calendar'&&request.from==='2026-10-26')).toBe(true);
    expect(fixture.requests.every(request=>request.method==='GET')).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  });
}

test('keyboard activation selects a stay, month navigation preserves it, and this month clears it',async({context,page})=>{
  await mockCalendar(context);
  await openCalendar(page);
  const button=guestCard(page,fixtureStay.guest_name).getByRole('button',{name:new RegExp(fixtureStay.guest_name)});
  await button.focus();
  await page.keyboard.press('Enter');
  await assertSelectedStay(page);
  await page.locator('[data-calendar-next]').click();
  await expect(page.locator('#calendarMonth')).toContainText('Disember 2026');
  await expect(page.locator('#calendarSelection')).toContainText(fixtureStay.guest_name);
  await expect(page.locator('#calendarGrid .is-selected-stay')).toHaveCount(3);
  await expect(day(page,'2026-12-03')).not.toHaveClass(/is-selected-stay/);
  await page.locator('[data-calendar-prev]').click();
  await expect(page.locator('#calendarMonth')).toContainText('November 2026');
  await expect(day(page,'2026-11-30')).toHaveClass(/is-stay-start/);
  await page.locator('[data-calendar-today]').click();
  await expect(page.locator('#calendarMonth')).toContainText('September 2026');
  await expect(page.locator('#calendarSelection')).toBeHidden();
  await expect(page.locator('#calendarGrid .is-selected-stay')).toHaveCount(0);
  await button.focus();
  await page.keyboard.press('Space');
  await assertSelectedStay(page);
});

test('selecting a different upcoming person replaces the highlighted stay',async({context,page})=>{
  await mockCalendar(context);
  await openCalendar(page);
  await guestCard(page,fixtureStay.guest_name).locator('.public-guest-jump').click();
  await assertSelectedStay(page);
  await guestCard(page,nextStay.guest_name).locator('.public-guest-jump').click();
  await expect(page.locator('#calendarMonth')).toContainText('Disember 2026');
  await expect(page.locator('#calendarMonth')).toBeFocused();
  await expect(page.locator('#calendarSelection')).toContainText(nextStay.guest_name);
  await expect(page.locator('#calendarSelection')).not.toContainText(fixtureStay.guest_name);
  await expect(page.locator('#calendarGrid .is-selected-stay')).toHaveCount(2);
  await expect(day(page,'2026-11-30')).not.toHaveClass(/is-selected-stay/);
  await expect(day(page,'2026-12-03')).toHaveClass(/is-stay-start/);
  await expect(day(page,'2026-12-05')).not.toHaveClass(/is-selected-stay/);
});

test('a failed calendar request keeps selected dates unknown until retry confirms occupancy',async({context,page})=>{
  const fixture=await mockCalendar(context);
  await openCalendar(page);
  fixture.failCalendar=true;
  await guestCard(page,fixtureStay.guest_name).locator('.public-guest-jump').click();
  await expect(page.locator('#calendarMonth')).toContainText('November 2026');
  await expect(page.locator('#calendarMonth')).toBeFocused();
  await expect(page.locator('#calendarSelection')).toContainText(fixtureStay.guest_name);
  await expect(page.locator('[data-calendar-retry]')).toBeVisible();
  await expect(page.locator('#calendarGrid [data-state="unknown"]')).toHaveCount(42);
  await expect(page.locator('#calendarGrid .is-occupied')).toHaveCount(0);
  await expect(page.locator('#calendarGrid [data-state="unrecorded"]')).toHaveCount(0);
  await expect(page.locator('#calendarGrid .is-selected-stay')).toHaveCount(3);
  fixture.failCalendar=false;
  await page.locator('[data-calendar-retry]').click();
  await expect(page.locator('#calendarGrid [data-state="unknown"]')).toHaveCount(0);
  await expect(day(page,'2026-11-30')).toHaveAttribute('data-state','occupied');
  await expect(day(page,'2026-12-03')).not.toHaveClass(/is-selected-stay/);
});

test('a slow calendar response does not take focus back after the guest jump',async({context,page})=>{
  const fixture=await mockCalendar(context);
  await openCalendar(page);
  let release;
  fixture.calendarGate=new Promise(resolve=>{release=resolve;});
  try {
    await guestCard(page,fixtureStay.guest_name).locator('.public-guest-jump').click();
    await expect(page.locator('#calendarMonth')).toBeFocused();
    await expect(page.locator('#calendarGrid')).toHaveAttribute('aria-busy','true');
    await page.keyboard.press('Tab');
    await expect(page.locator('#calendarMonth')).not.toBeFocused();
    const focused=await page.evaluateHandle(()=>document.activeElement);
    release();
    await expect(page.locator('#calendarGrid')).toHaveAttribute('aria-busy','false');
    expect(await focused.evaluate(element=>element===document.activeElement)).toBe(true);
    await expect(page.locator('#calendarSelection')).toContainText(fixtureStay.guest_name);
  } finally {release();}
});

test('a stay beyond the normal year range opens its month and can be followed across New Year',async({context,page})=>{
  const future={guest_name:'Tetamu Tahun Baharu',guest_count:2,check_in:'2027-12-30',check_out:'2028-01-03'};
  await mockCalendar(context,[fixtureStay,future]);
  await openCalendar(page);
  await guestCard(page,future.guest_name).locator('.public-guest-jump').click();
  await expect(page.locator('#calendarMonth')).toContainText('Disember 2027');
  await expect(page.locator('#calendarMonth')).toBeFocused();
  await expect(day(page,'2027-12-30')).toHaveClass(/is-stay-start/);
  await expect(page.locator('#calendarGrid .is-selected-stay')).toHaveCount(4);
  await expect(day(page,'2028-01-03')).not.toHaveClass(/is-selected-stay/);
  await expect(page.locator('[data-calendar-next]')).toBeEnabled();
  await page.locator('[data-calendar-next]').click();
  await expect(page.locator('#calendarMonth')).toContainText('Januari 2028');
  await expect(page.locator('#calendarSelection')).toContainText(future.guest_name);
  await expect(day(page,'2028-01-02')).toHaveClass(/is-selected-stay/);
  await expect(day(page,'2028-01-03')).not.toHaveClass(/is-selected-stay/);
  await expect(page.locator('[data-calendar-prev]')).toBeEnabled();
  await page.locator('[data-calendar-prev]').click();
  await expect(page.locator('#calendarMonth')).toContainText('Disember 2027');
});
