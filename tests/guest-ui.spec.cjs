'use strict';

const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const fixturePin='2468';
const fixtureToken='test-only-guest-session-token-which-is-not-a-real-credential';
const now='2026-09-23T04:00:00Z';
const expiresAt='2026-09-23T12:00:00Z';
const sampleGuest={id:'00000000-0000-4000-8000-000000000001',check_in:'2026-09-25',check_out:'2026-09-28',guest_name:'Tetamu Ujian',guest_count:6,purpose:'Private fixture purpose',status:'confirmed',version:1};

function deferred() {
  let resolve;
  const promise=new Promise(done=>{resolve=done;});
  return {promise,resolve};
}

async function mockGuests(context,initial=[]) {
  const fixture={records:structuredClone(initial),requests:[],authenticated:false,next:{}};
  const json=(route,status,payload)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*','cache-control':'no-store'},body:JSON.stringify(payload)});
  await context.route('**/functions/v1/guest-calendar**',async route=>{
    const request=route.request();
    if(request.method()==='OPTIONS') return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,OPTIONS'}});
    const url=new URL(request.url());
    const body=request.method()==='POST'?request.postDataJSON():null;
    const action=body?.action||url.searchParams.get('action');
    fixture.requests.push({action,body,url,authorization:request.headers().authorization});
    const custom=fixture.next[action];
    if(custom) {
      delete fixture.next[action];
      return custom(route,{body,url,json});
    }
    const active=fixture.records.filter(guest=>guest.status!=='cancelled');
    if(action==='calendar') return json(route,200,{stays:active.map(({check_in,check_out})=>({check_in,check_out}))});
    if(action==='upcoming') return json(route,200,{guests:active.map(({guest_name,guest_count,check_in,check_out})=>({guest_name,guest_count,check_in,check_out}))});
    if(action==='login') {
      if(body.pin!==fixturePin) return json(route,401,{error:'invalid_pin'});
      fixture.authenticated=true;
      return json(route,200,{token:fixtureToken,expires_at:expiresAt});
    }
    if(!fixture.authenticated||request.headers().authorization!==`Bearer ${fixtureToken}`) return json(route,401,{error:'unauthorized'});
    if(action==='session') return json(route,200,{expires_at:expiresAt});
    if(action==='guests') return json(route,200,{guests:active});
    if(action==='logout') {fixture.authenticated=false;return json(route,200,{ok:true});}
    if(action==='save') {
      const existing=fixture.records.find(record=>record.id===body.id);
      const guest={...body,id:body.id||`00000000-0000-4000-8000-${String(fixture.records.length+1).padStart(12,'0')}`,status:'confirmed',version:existing?existing.version+1:1};
      if(existing) Object.assign(existing,guest); else fixture.records.push(guest);
      return json(route,200,{guest});
    }
    if(action==='cancel') {
      const guest=fixture.records.find(record=>record.id===body.id);
      guest.status='cancelled';guest.version++;
      return json(route,200,{guest});
    }
    return json(route,400,{error:'unknown_fixture_action'});
  });
  return fixture;
}

async function enterPin(page,value=fixturePin) {
  await expect(page.locator('#guestPin1')).toBeEnabled();
  await page.locator('#guestPin1').focus();
  await page.keyboard.type(value);
}

async function login(page,path='/guest-admin.html') {
  await page.goto(path);
  await enterPin(page);
  await expect(page.locator('#guestWorkspace')).toBeVisible();
}

async function fillGuest(page,values={}) {
  const guest={check_in:'2026-09-25',check_out:'2026-09-28',guest_name:'Tetamu Borang',guest_count:8,purpose:'',...values};
  for(const [selector,key] of [['#guestCheckIn','check_in'],['#guestCheckOut','check_out'],['#guestName','guest_name']]) await page.locator(selector).fill(String(guest[key]));
  if(!await page.locator('#guestOptionalDetails').evaluate(details=>details.open)) await page.locator('#guestOptionalDetails summary').click();
  for(const [selector,key] of [['#guestCount','guest_count'],['#guestPurpose','purpose']]) await page.locator(selector).fill(String(guest[key]??''));
  return guest;
}

async function openCalendar(page,path='/') {
  await page.goto(`${path}#kalendar`);
  await page.locator('#kalendar').scrollIntoViewIfNeeded();
  await expect(page.locator('#calendarGrid td[data-calendar-day]')).toHaveCount(42);
}

async function assertNoGuestStorage(page,names=[]) {
  const stored=await page.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage}}));
  for(const privateText of [...names,'Private fixture purpose',fixturePin]) expect(stored).not.toContain(privateText);
}

test.beforeEach(async({context,page})=>{
  await context.route('https://www.google.com/maps/embed**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Map fixture</title><main>Map fixture.</main></html>'}));
  await context.route('https://wa.me/**',route=>route.abort());
  await page.clock.setFixedTime(new Date(now));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
});

test('four PIN boxes reject an incorrect PIN in red and open automatically after a corrected paste',async({page,context})=>{
  const fixture=await mockGuests(context);
  await page.goto('/guest-admin.html');
  await expect(page.locator('.guest-pin-digit')).toHaveCount(4);
  await expect(page.locator('#guestPinForm button')).toHaveCount(0);
  await enterPin(page,'0000');
  await expect(page.locator('.guest-pin-digit[aria-invalid="true"]')).toHaveCount(4);
  await expect(page.locator('#guestPinStatus')).toHaveClass(/is-error/);
  await expect(page.locator('#guestWorkspace')).toBeHidden();
  await expect(page.locator('#guestPin1')).toBeEnabled();
  await page.locator('#guestPin1').evaluate((input,pin)=>{
    const clipboardData=new DataTransfer();clipboardData.setData('text/plain',pin);
    input.dispatchEvent(new ClipboardEvent('paste',{clipboardData,bubbles:true,cancelable:true}));
  },fixturePin);
  await expect(page.locator('#guestWorkspace')).toBeVisible();
  await expect(page.locator('#guestPinPanel')).toBeHidden();
  expect(fixture.requests.filter(request=>request.action==='login')).toHaveLength(2);
  await assertNoGuestStorage(page);
});

test('a restored session is checked on the server; logout and expiry hide all guest records',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await login(page);
  await expect(page.locator('#guestList')).toContainText(sampleGuest.guest_name);
  await assertNoGuestStorage(page,[sampleGuest.guest_name]);
  await page.reload();
  await expect(page.locator('#guestWorkspace')).toBeVisible();
  expect(fixture.requests.some(request=>request.action==='session'&&request.authorization===`Bearer ${fixtureToken}`)).toBe(true);
  await page.locator('#guestLogout').click();
  await expect(page.locator('#guestWorkspace')).toBeHidden();
  await expect(page.locator('#guestPin1')).toBeEnabled();
  expect(fixture.requests.filter(request=>request.action==='logout')).toHaveLength(1);
  await enterPin(page);
  await expect(page.locator('#guestWorkspace')).toBeVisible();
  fixture.authenticated=false;
  await page.reload();
  await expect(page.locator('#guestPin1')).toBeEnabled();
  await expect(page.locator('#guestWorkspace')).toBeHidden();
  await expect(page.locator('#guestList .guest-record')).toHaveCount(0);
  await assertNoGuestStorage(page,[sampleGuest.guest_name]);
});

for(const failure of ['network','server']) {
  test(`a ${failure} sign-out failure keeps the session and draft until a successful retry`,async({page,context})=>{
    const fixture=await mockGuests(context,[sampleGuest]);
    await login(page);
    await expect(page.locator('#guestList .guest-record')).toHaveCount(1);
    await fillGuest(page,{purpose:'Draft kept until sign-out succeeds'});
    const gate=deferred();
    fixture.next.logout=async(route,{json})=>{
      await gate.promise;
      return failure==='network'?route.abort('failed'):json(route,503,{error:'unavailable'});
    };
    try {
      await page.locator('#guestLogout').click();
      await expect.poll(()=>fixture.requests.filter(request=>request.action==='logout').length).toBe(1);
      await expect(page.locator('#guestWorkspace')).toBeVisible();
      for(const selector of ['#guestLogout','#guestSave','#guestName','#guestRefresh','[data-guest-edit]','[data-guest-cancel]']) await expect(page.locator(selector)).toBeDisabled();
      await page.locator('#guestDetailsForm').evaluate(form=>form.requestSubmit());
      await page.locator('#guestLogout').evaluate(button=>button.dispatchEvent(new MouseEvent('click',{bubbles:true})));
      expect(fixture.requests.filter(request=>request.action==='save')).toHaveLength(0);
      expect(fixture.requests.filter(request=>request.action==='logout')).toHaveLength(1);
    } finally {gate.resolve();}
    await expect(page.locator('#guestFormError')).toContainText('Sesi masih aktif');
    await expect(page.locator('#guestWorkspace')).toBeVisible();
    await expect(page.locator('#guestPinPanel')).toBeHidden();
    await expect(page.locator('#guestName')).toHaveValue('Tetamu Borang');
    await expect(page.locator('#guestPurpose')).toHaveValue('Draft kept until sign-out succeeds');
    expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('jitra2stay-guest-session')).token)).toBe(fixtureToken);
    await expect(page.locator('#guestLogout')).toBeEnabled();
    await page.locator('#guestLogout').click();
    await expect(page.locator('#guestWorkspace')).toBeHidden();
    await expect(page.locator('#guestPin1')).toBeEnabled();
    await expect(page.locator('#guestName')).toHaveValue('');
    await expect(page.locator('#guestList .guest-record')).toHaveCount(0);
    expect(await page.evaluate(()=>sessionStorage.getItem('jitra2stay-guest-session'))).toBeNull();
    expect(fixture.requests.filter(request=>request.action==='logout')).toHaveLength(2);
  });
}

test('signing out an already expired server session safely clears local guest data',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await login(page);
  await fillGuest(page);
  fixture.next.logout=(route,{json})=>{fixture.authenticated=false;return json(route,401,{error:'session_expired'});};
  await page.locator('#guestLogout').click();
  await expect(page.locator('#guestWorkspace')).toBeHidden();
  await expect(page.locator('#guestPin1')).toBeEnabled();
  await expect(page.locator('#guestName')).toHaveValue('');
  await expect(page.locator('#guestList .guest-record')).toHaveCount(0);
  expect(await page.evaluate(()=>sessionStorage.getItem('jitra2stay-guest-session'))).toBeNull();
});

test('restoring a cached page restarts interrupted session validation and ignores the old completion',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await login(page);
  const first=deferred(),firstDone=deferred(),second=deferred();
  fixture.next.session=async(route,{json})=>{
    await first.promise;
    try {await json(route,200,{expires_at:expiresAt});} catch {} finally {firstDone.resolve();}
  };
  try {
    await page.reload();
    await expect.poll(()=>fixture.requests.filter(request=>request.action==='session').length).toBe(1);
    await expect(page.locator('#guestPin1')).toBeDisabled();
    fixture.next.session=async(route,{json})=>{await second.promise;return json(route,200,{expires_at:expiresAt}).catch(()=>{});};
    // Exercise the actual pagehide/pageshow handlers deterministically: tracing
    // and request interception can prevent Chromium from using its real cache.
    await page.evaluate(()=>{
      dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
      dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
    });
    await expect.poll(()=>fixture.requests.filter(request=>request.action==='session').length).toBe(2);
    first.resolve();
    await firstDone.promise;
    await page.evaluate(()=>{
      dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
      return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    expect(fixture.requests.filter(request=>request.action==='session')).toHaveLength(2);
    second.resolve();
    await expect(page.locator('#guestWorkspace')).toBeVisible();
    await expect(page.locator('#guestList')).toContainText(sampleGuest.guest_name);
    await expect(page.locator('#guestPinPanel')).toBeHidden();
  } finally {first.resolve();second.resolve();}
});

test('server PIN rate limiting disables all four boxes until the retry period ends',async({page,context})=>{
  const fixture=await mockGuests(context);
  await page.clock.install({time:new Date(now)});
  fixture.next.login=(route,{json})=>json(route,429,{error:'rate_limited',retry_after:2});
  await page.goto('/guest-admin.html');
  await enterPin(page);
  await expect(page.locator('#guestPinStatus')).toContainText('saat');
  for(let digit=1;digit<=4;digit++) await expect(page.locator(`#guestPin${digit}`)).toBeDisabled();
  await page.clock.fastForward(2100);
  await enterPin(page);
  await expect(page.locator('#guestWorkspace')).toBeVisible();
  expect(fixture.requests.filter(request=>request.action==='login')).toHaveLength(2);
});

test('required guest fields validate before saving; purpose is optional and successful saving returns home',async({page,context})=>{
  const fixture=await mockGuests(context);
  await login(page);
  await page.locator('#guestSave').click();
  await expect(page.locator('#guestDetailsForm [aria-invalid="true"]').first()).toBeVisible();
  expect(fixture.requests.filter(request=>request.action==='save')).toHaveLength(0);
  const guest=await fillGuest(page);
  await expect(page.locator('#guestNights')).toContainText('3');
  await page.locator('#guestSave').click();
  await expect(page).toHaveURL(/\/kalendar\.html#kalendar$/);
  await expect(page.locator('#guestSaveNotice')).toBeVisible();
  const request=fixture.requests.find(request=>request.action==='save');
  expect(request.body).toMatchObject({...guest,guest_count:8});
  expect(request.body.request_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  await expect(page.locator('[data-calendar-day="2026-09-25"]')).toHaveAttribute('data-state','occupied');
  await expect(page.locator('[data-calendar-day="2026-09-27"]')).toHaveAttribute('data-state','occupied');
  await expect(page.locator('[data-calendar-day="2026-09-28"]')).toHaveAttribute('data-state','unrecorded');
  await assertNoGuestStorage(page,[guest.guest_name]);
});

test('only dates and name are required; blank optional details save a null count and stay omitted from the public list',async({page,context})=>{
  const fixture=await mockGuests(context);
  await login(page);
  await expect(page.locator('#guestDetailsForm [required]')).toHaveCount(3);
  await expect(page.locator('#guestOptionalDetails')).not.toHaveAttribute('open','');
  await expect(page.locator('#guestCount')).toBeHidden();
  await page.locator('#guestCheckIn').fill('2026-09-25');
  await page.locator('#guestCheckOut').fill('2026-09-28');
  await page.locator('#guestName').fill('Tetamu tanpa jumlah');
  await page.locator('#guestSave').click();
  await expect(page).toHaveURL(/\/kalendar\.html#kalendar$/);
  expect(fixture.requests.find(request=>request.action==='save').body).toMatchObject({guest_name:'Tetamu tanpa jumlah',guest_count:null,purpose:''});
  const card=page.locator('.public-guest-card').filter({has:page.getByRole('heading',{name:'Tetamu tanpa jumlah'})});
  await expect(card).toBeVisible();
  await expect(card.locator('.public-guest-count')).toHaveCount(0);
  await expect(card).not.toContainText(/null|0 orang|undefined/);
  await expect(page.locator('#calendarGrid [data-state="occupied"]')).toHaveCount(3);
});

test('editing can clear a known guest count without inventing a replacement count',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await login(page);
  await page.locator(`[data-guest-edit="${sampleGuest.id}"]`).click();
  await expect(page.locator('#guestOptionalDetails')).toHaveAttribute('open','');
  await expect(page.locator('#guestCount')).toHaveValue('6');
  await page.locator('#guestCount').fill('');
  await page.locator('#guestSave').click();
  await expect(page).toHaveURL(/\/kalendar\.html#kalendar$/);
  expect(fixture.requests.find(request=>request.action==='save').body).toMatchObject({id:sampleGuest.id,version:1,guest_count:null,purpose:sampleGuest.purpose});
  await expect(page.locator('.public-guest-count')).toHaveCount(0);
  await page.goto('/guest-admin.html');
  await expect(page.locator('#guestWorkspace')).toBeVisible();
  await expect(page.locator('.guest-record-count')).toHaveCount(0);
  await page.locator(`[data-guest-edit="${sampleGuest.id}"]`).click();
  await expect(page.locator('#guestCount')).toHaveValue('');
});

test('invalid date order and guest counts never send a save request',async({page,context})=>{
  const fixture=await mockGuests(context);
  await login(page);
  await fillGuest(page,{check_out:'2026-09-25'});
  await page.locator('#guestSave').click();
  await expect(page.locator('#guestCheckOut')).toHaveAttribute('aria-invalid','true');
  await page.locator('#guestCheckOut').fill('2026-09-24');
  await page.locator('#guestSave').click();
  await expect(page.locator('#guestCheckOut')).toHaveAttribute('aria-invalid','true');
  await page.locator('#guestCheckOut').fill('2026-09-28');
  for(const count of ['0','21','2.5']) {
    await page.locator('#guestCount').fill(count);
    await page.locator('#guestOptionalDetails summary').click();
    await expect(page.locator('#guestCount')).toBeHidden();
    await page.locator('#guestSave').click();
    await expect(page.locator('#guestCount')).toHaveAttribute('aria-invalid','true');
    await expect(page.locator('#guestCountError')).toBeVisible();
    await expect(page.locator('#guestCount')).toBeFocused();
  }
  expect(fixture.requests.filter(request=>request.action==='save')).toHaveLength(0);
  await expect(page.locator('#guestName')).toHaveValue('Tetamu Borang');
});

test('a failed save preserves the form and request identity; a pending retry cannot submit twice',async({page,context})=>{
  const fixture=await mockGuests(context);
  await login(page);
  await fillGuest(page,{purpose:'Majlis ujian'});
  fixture.next.save=route=>route.abort('failed');
  await page.locator('#guestSave').click();
  await expect(page.locator('#guestFormError')).toBeVisible();
  await expect(page.locator('#guestName')).toHaveValue('Tetamu Borang');
  await expect(page.locator('#guestPurpose')).toHaveValue('Majlis ujian');
  const gate=deferred();
  fixture.next.save=async(route,{body,json})=>{await gate.promise;return json(route,200,{guest:{...body,id:sampleGuest.id,status:'confirmed',version:1}});};
  try {
    await page.locator('#guestSave').click();
    await expect(page.locator('#guestSave')).toBeDisabled();
    await page.locator('#guestDetailsForm').evaluate(form=>form.requestSubmit());
    await expect.poll(()=>fixture.requests.filter(request=>request.action==='save').length).toBe(2);
    const saves=fixture.requests.filter(request=>request.action==='save');
    expect(saves[1].body.request_id).toBe(saves[0].body.request_id);
  } finally {gate.resolve();}
  await expect(page).toHaveURL(/\/kalendar\.html#kalendar$/);
});

test('editing sends the original version and English saving returns to the English home',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await login(page,'/guest-admin-en.html');
  await page.locator(`[data-guest-edit="${sampleGuest.id}"]`).click();
  await expect(page.locator('#guestName')).toHaveValue(sampleGuest.guest_name);
  await expect(page.locator('#guestPurpose')).toHaveValue(sampleGuest.purpose);
  await page.locator('#guestName').fill('Updated fixture guest');
  await page.locator('#guestSave').click();
  await expect(page).toHaveURL(/\/kalendar-en\.html#kalendar$/);
  expect(fixture.requests.find(request=>request.action==='save').body).toMatchObject({id:sampleGuest.id,version:1,guest_name:'Updated fixture guest'});
  await expect(page.locator('#guestSaveNotice')).toContainText('saved');
});

test('a version conflict keeps unsaved edits visible for review',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await login(page);
  await page.locator(`[data-guest-edit="${sampleGuest.id}"]`).click();
  await page.locator('#guestName').fill('Unsaved edited name');
  fixture.next.save=(route,{json})=>json(route,409,{error:'stale_version'});
  await page.locator('#guestSave').click();
  await expect(page.locator('#guestFormError')).toBeVisible();
  await expect(page.locator('#guestName')).toHaveValue('Unsaved edited name');
  await expect(page.locator('#guestWorkspace')).toBeVisible();
  await expect(page).toHaveURL(/\/guest-admin\.html$/);
  await page.locator('#guestCancelEdit').click();
  await expect(page.locator('#guestName')).toHaveValue('');
});

test('cancelling requires confirmation and releases its nights after returning home',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await login(page);
  await page.locator(`[data-guest-cancel="${sampleGuest.id}"]`).click();
  await expect(page.locator('.guest-cancel-confirm')).toBeVisible();
  expect(fixture.requests.filter(request=>request.action==='cancel')).toHaveLength(0);
  await page.locator('.guest-cancel-confirm').getByRole('button',{name:'Kekalkan rekod'}).click();
  await expect(page.locator('.guest-cancel-confirm')).toHaveCount(0);
  await page.locator(`[data-guest-cancel="${sampleGuest.id}"]`).click();
  await page.locator(`[data-guest-cancel-confirm="${sampleGuest.id}"]`).click();
  await expect(page).toHaveURL(/\/kalendar\.html#kalendar$/);
  expect(fixture.requests.find(request=>request.action==='cancel').body).toMatchObject({id:sampleGuest.id,version:1});
  await expect(page.locator('#guestSaveNotice')).toContainText('dibatalkan');
  await expect(page.locator('#calendarGrid [data-state="unknown"]')).toHaveCount(0);
  await expect(page.locator('#calendarGrid [data-state="occupied"]')).toHaveCount(0);
});

test('session expiry while saving locks the form and re-entering the PIN restores the unsaved draft',async({page,context})=>{
  const fixture=await mockGuests(context);
  await login(page);
  await fillGuest(page,{purpose:'Unsaved private purpose'});
  fixture.next.save=(route,{json})=>json(route,401,{error:'session_expired'});
  await page.locator('#guestSave').click();
  await expect(page.locator('#guestWorkspace')).toBeHidden();
  await expect(page.locator('#guestName')).toHaveValue('');
  await assertNoGuestStorage(page,['Tetamu Borang','Unsaved private purpose']);
  await enterPin(page);
  await expect(page.locator('#guestWorkspace')).toBeVisible();
  await expect(page.locator('#guestName')).toHaveValue('Tetamu Borang');
  await expect(page.locator('#guestPurpose')).toHaveValue('Unsaved private purpose');
  await expect(page.locator('#guestCheckIn')).toHaveValue('2026-09-25');
});

test('public calendar exposes occupied nights and upcoming guest summaries without private purposes',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await openCalendar(page);
  await expect(page.locator('#calendarGrid [data-state="unknown"]')).toHaveCount(0);
  await expect(page.locator('#calendarGrid [data-state="occupied"]')).toHaveCount(3);
  await expect(page.locator('[data-calendar-day="2026-09-28"]')).toHaveAttribute('data-state','unrecorded');
  await expect(page.locator('#publicGuestList')).toContainText(sampleGuest.guest_name);
  await expect(page.locator('#publicGuestList')).toContainText(String(sampleGuest.guest_count));
  await expect(page.locator('#kalendar')).not.toContainText(sampleGuest.purpose);
  expect(fixture.requests.every(request=>['calendar','upcoming'].includes(request.action))).toBe(true);
  expect(fixture.requests.every(request=>!request.authorization)).toBe(true);
  await expect(page.locator('.calendar-owner-button')).toHaveAttribute('href','guest-admin.html');
});

test('public upcoming guests can expand and a failed list request has a retry instead of an empty-list claim',async({page,context})=>{
  const records=Array.from({length:7},(_,index)=>({...sampleGuest,id:`fixture-${index}`,guest_name:`Tetamu ${index+1}`}));
  const fixture=await mockGuests(context,records);
  fixture.next.upcoming=(route,{json})=>json(route,503,{error:'unavailable'});
  await openCalendar(page);
  await expect(page.locator('[data-guests-retry]')).toBeVisible();
  await expect(page.locator('#publicGuestStatus')).not.toContainText('Belum ada tetamu');
  await page.locator('[data-guests-retry]').click();
  await expect(page.locator('.public-guest-card')).toHaveCount(6);
  await page.locator('[data-guests-more]').click();
  await expect(page.locator('.public-guest-card')).toHaveCount(7);
  await expect(page.locator('#publicGuestList')).not.toContainText(sampleGuest.purpose);
  await page.locator('[data-guests-more]').click();
  await expect(page.locator('.public-guest-card')).toHaveCount(6);
});

test('calendar loading and failures stay unknown until a successful retry, never falsely free',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  const gate=deferred();
  fixture.next.calendar=async(route,{json})=>{await gate.promise;return json(route,503,{error:'unavailable'});};
  try {
    await page.goto('/#kalendar',{waitUntil:'domcontentloaded'});
    await page.locator('#kalendar').scrollIntoViewIfNeeded();
    await expect(page.locator('#calendarGrid [data-state="unknown"]')).toHaveCount(42);
    await expect(page.locator('#calendarGrid')).toHaveAttribute('aria-busy','true');
    await expect(page.locator('#calendarGrid [data-state="unrecorded"]')).toHaveCount(0);
  } finally {gate.resolve();}
  await expect(page.locator('[data-calendar-retry]')).toBeVisible();
  await expect(page.locator('#calendarGrid [data-state="unknown"]')).toHaveCount(42);
  await page.locator('[data-calendar-retry]').click();
  await expect(page.locator('#calendarGrid [data-state="occupied"]')).toHaveCount(3);
  await expect(page.locator('[data-calendar-retry]')).toBeHidden();
});

test('rapid month navigation ignores a late response and this month restores the current calendar',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await openCalendar(page);
  await expect(page.locator('#calendarGrid [data-state="unknown"]')).toHaveCount(0);
  const gate=deferred();
  fixture.next.calendar=async(route,{json})=>{await gate.promise;return json(route,200,{stays:[{check_in:'2026-10-01',check_out:'2026-10-31'}]}).catch(()=>{});};
  try {
    await page.locator('[data-calendar-next]').click();
    await expect(page.locator('#calendarGrid')).toHaveAttribute('aria-busy','true');
    await page.locator('[data-calendar-next]').click();
    await expect(page.locator('#calendarMonth')).toContainText('November');
    await expect(page.locator('#calendarGrid [data-state="unknown"]')).toHaveCount(0);
  } finally {gate.resolve();}
  await expect(page.locator('#calendarMonth')).toContainText('November');
  await expect(page.locator('#calendarGrid [data-state="occupied"]')).toHaveCount(0);
  await page.locator('[data-calendar-today]').click();
  await expect(page.locator('#calendarMonth')).toContainText('September');
  await expect(page.locator('#calendarGrid [data-state="occupied"]')).toHaveCount(3);
});

test('using calendar controls before its visibility callback still starts the upcoming guest list once',async({page,context})=>{
  const fixture=await mockGuests(context,[sampleGuest]);
  await page.addInitScript(()=>{
    const NativeObserver=window.IntersectionObserver;
    window.IntersectionObserver=class extends NativeObserver {
      constructor(callback,options) {super(callback,options);this.callback=callback;}
      observe(element) {
        if(element.matches('[data-guest-calendar]')) {
          window.__showGuestCalendar=()=>this.callback([{isIntersecting:true,target:element}],this);
          return;
        }
        super.observe(element);
      }
    };
  });
  await page.goto('/#kalendar');
  await page.locator('[data-calendar-next]').click();
  await expect(page.locator('#calendarMonth')).toContainText('Oktober');
  await expect(page.locator('#calendarGrid')).toHaveAttribute('aria-busy','false');
  await page.evaluate(()=>window.__showGuestCalendar());
  await expect(page.locator('#publicGuestList')).toContainText(sampleGuest.guest_name);
  expect(fixture.requests.filter(request=>request.action==='upcoming')).toHaveLength(1);
  expect(fixture.requests.filter(request=>request.action==='calendar')).toHaveLength(1);
});

for(const {width,dark,english} of [{width:320,dark:false,english:false},{width:390,dark:true,english:false},{width:1280,dark:false,english:true}]) {
  test(`${width}px ${dark?'dark':'light'} guest PIN, form and calendar stay accessible without horizontal overflow`,async({page,context})=>{
    await mockGuests(context,[sampleGuest]);
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({colorScheme:dark?'dark':'light'});
    const admin=english?'/guest-admin-en.html':'/guest-admin.html';
    await page.goto(admin);
    await expect(page.locator('#guestPin1')).toBeEnabled();
    const verify=async selector=>{
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
      const result=await new AxeBuilder({page}).include(selector).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(result.violations).toEqual([]);
    };
    await verify('[data-guest-admin]');
    await enterPin(page);
    await expect(page.locator('#guestWorkspace')).toBeVisible();
    await expect(page.locator('#guestList .guest-record')).toHaveCount(1);
    await verify('[data-guest-admin]');
    await page.locator('#guestOptionalDetails summary').click();
    await verify('[data-guest-admin]');
    for(const control of ['#guestCheckIn','#guestCheckOut','#guestName','#guestCount','#guestPurpose','#guestSave']) {
      expect(await page.locator(control).evaluate(element=>element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    }
    await page.locator('.guest-home').click();
    await expect(page).toHaveURL(width<=900?(english?/\/kalendar-en\.html$/:/\/kalendar\.html$/):(english?/\/en\.html#kalendar$/:/\/#kalendar$/));
    await expect(page.locator('#calendarGrid [data-state="occupied"]')).toHaveCount(3);
    await expect(page.locator(`.public-guest-card ${width<=900?'h3':'h4'}`)).toHaveText(sampleGuest.guest_name);
    await verify('#kalendar');
  });
}
