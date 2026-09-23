(function () {
  'use strict';
  const dayMs = 86400000;
  function dateValue(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value ? date : null;
  }
  const iso = date => date.toISOString().slice(0, 10);
  function malaysiaToday(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kuala_Lumpur', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }
  function monthGrid(year, month) {
    const first = new Date(Date.UTC(year, month, 1));
    const start = +first - ((first.getUTCDay() + 6) % 7) * dayMs;
    return Array.from({length:42}, (_, index) => iso(new Date(start + index * dayMs)));
  }
  function occupiedDates(stays, dates) {
    if (!Array.isArray(stays) || stays.length > 1000) throw new Error('Invalid calendar response');
    const occupied = new Set();
    for (const stay of stays) {
      if (!stay || !dateValue(stay.check_in) || !dateValue(stay.check_out) || stay.check_out <= stay.check_in) throw new Error('Invalid stay dates');
      for (const date of dates) if (date >= stay.check_in && date < stay.check_out) occupied.add(date);
    }
    return occupied;
  }
  if (typeof module === 'object' && module.exports) module.exports = {dateValue, malaysiaToday, monthGrid, occupiedDates};
  if (typeof document === 'undefined') return;
  const calendar = document.querySelector('[data-guest-calendar]');
  if (!calendar) return;
  const en = document.documentElement.lang.startsWith('en');
  const say = (ms, english) => en ? english : ms;
  const locale = en ? 'en-GB' : 'ms-MY';
  const grid = document.getElementById('calendarGrid');
  const heading = document.getElementById('calendarMonth');
  const status = document.getElementById('calendarStatus');
  const previous = calendar.querySelector('[data-calendar-prev]');
  const next = calendar.querySelector('[data-calendar-next]');
  const retry = calendar.querySelector('[data-calendar-retry]');
  const today = malaysiaToday();
  const current = dateValue(today);
  const initialMonth = current.getUTCFullYear() * 12 + current.getUTCMonth();
  let selectedMonth = initialMonth;
  let selectedStay = null;
  const selection = document.getElementById('calendarSelection');
  const monthOf = date => {const value=dateValue(date);return value.getUTCFullYear()*12+value.getUTCMonth();};
  const firstMonth = () => Math.min(initialMonth-12,selectedStay ? monthOf(selectedStay.check_in) : initialMonth);
  const lastMonth = () => Math.max(initialMonth+12,selectedStay ? monthOf(iso(new Date(+dateValue(selectedStay.check_out)-dayMs))) : initialMonth);
  let controller;
  let sequence = 0;
  let started = false;
  const format = (date, options) => new Intl.DateTimeFormat(locale, {...options, timeZone:'UTC'}).format(dateValue(date));

  function render(dates, occupied, known) {
    const table = document.createElement('table');
    table.setAttribute('aria-labelledby', 'calendarMonth');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const labels = en ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Isn','Sel','Rab','Kha','Jum','Sab','Ahd'];
    labels.forEach((label, i) => {
      const th = document.createElement('th');
      th.scope = 'col'; th.textContent = label;
      th.setAttribute('aria-label', format(iso(new Date(Date.UTC(2026,8,21+i))), {weekday:'long'}));
      headerRow.append(th);
    });
    thead.append(headerRow); table.append(thead);
    const body = document.createElement('tbody');
    for (let row = 0; row < 6; row++) {
      const tr = document.createElement('tr');
      for (const date of dates.slice(row*7,row*7+7)) {
        const td = document.createElement('td');
        const item = dateValue(date);
        const inMonth = item.getUTCFullYear()*12+item.getUTCMonth() === selectedMonth;
        const busy = occupied.has(date);
        const selected = selectedStay && date >= selectedStay.check_in && date < selectedStay.check_out;
        td.dataset.calendarDay = date;
        td.dataset.state = known ? busy ? 'occupied' : 'unrecorded' : 'unknown';
        td.className = [inMonth ? '' : 'is-other-month', busy ? 'is-occupied' : '', known ? '' : 'is-unknown', date===today ? 'is-today' : ''].filter(Boolean).join(' ');
        if (selected) td.classList.add('is-selected-stay');
        if (selected && date===selectedStay.check_in) td.classList.add('is-stay-start');
        const number = document.createElement('span'); number.textContent = String(item.getUTCDate()); number.setAttribute('aria-hidden','true'); td.append(number);
        if (busy) {const mark=document.createElement('span');mark.className='calendar-occupied-mark';mark.textContent='●';mark.setAttribute('aria-hidden','true');td.append(mark);}
        const accessible = document.createElement('span'); accessible.className='sr-only';
        accessible.textContent = `${format(date,{day:'numeric',month:'long',year:'numeric'})}${date===today?say(', hari ini',', today'):''}: ${!known?say('status belum disemak','status not checked'):busy?say('ada tetamu menginap','occupied overnight'):say('masih tersedia','available')}`;
        if (selected) accessible.textContent += say(', penginapan dipilih',', selected stay');
        td.append(accessible); tr.append(td);
      }
      body.append(tr);
    }
    table.append(body); grid.replaceChildren(table);
  }
  async function load() {
    started = true;
    const thisRequest = ++sequence;
    controller?.abort(); controller = new AbortController();
    const thisController = controller;
    const dates = monthGrid(Math.floor(selectedMonth / 12), selectedMonth % 12);
    const monthDate = iso(new Date(Date.UTC(Math.floor(selectedMonth/12), selectedMonth%12,1)));
    heading.textContent = format(monthDate, {month:'long',year:'numeric'});
    previous.disabled = selectedMonth <= firstMonth();
    next.disabled = selectedMonth >= lastMonth();
    grid.setAttribute('aria-busy','true');
    render(dates,new Set(),false); retry.hidden=true;
    status.textContent = say('Memuatkan rekod penginapan…','Loading stay records…');
    const timer = setTimeout(() => thisController.abort(),12000);
    try {
      const endpoint = window.GUEST_CONFIG?.apiUrl;
      if (!endpoint) throw new Error('Not configured');
      const url = new URL(endpoint);
      url.searchParams.set('action','calendar'); url.searchParams.set('from',dates[0]);
      url.searchParams.set('to',iso(new Date(+dateValue(dates.at(-1))+dayMs)));
      const response = await fetch(url, {signal:thisController.signal, cache:'no-store', credentials:'omit'});
      if (!response.ok) throw new Error('Calendar unavailable');
      const payload = await response.json();
      const occupied = occupiedDates(payload.stays, dates);
      if (thisRequest !== sequence) return;
      render(dates,occupied,true);
      status.textContent = say('Rekod terkini telah dimuatkan.','Current records loaded.');
    } catch {
      if (thisRequest !== sequence) return;
      status.textContent = say('Kalendar belum dapat dimuatkan. Cuba lagi atau tanya owner melalui WhatsApp.','The calendar could not be loaded. Try again or ask the owner on WhatsApp.');
      retry.hidden=false;
    } finally {
      clearTimeout(timer);
      if (thisRequest === sequence) grid.setAttribute('aria-busy','false');
    }
  }
  function showStay(guest) {
    selectedStay = guest;
    selectedMonth = monthOf(guest.check_in);
    const name = document.createElement('strong'); name.textContent = guest.guest_name;
    const dates = document.createElement('span');
    dates.textContent = `Check-in: ${format(guest.check_in,{day:'numeric',month:'short',year:'numeric'})} · Check-out: ${format(guest.check_out,{day:'numeric',month:'short',year:'numeric'})}`;
    const hint = document.createElement('span');hint.className='calendar-selection-hint';
    hint.textContent=say('Bingkai menandakan malam penginapan dipilih.','Outlined dates mark the selected stay’s nights.');
    selection.replaceChildren(name,dates,hint); selection.hidden=false;
    load();
    heading.focus({preventScroll:true});
    calendar.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  previous.addEventListener('click',()=>{if(selectedMonth>firstMonth()){selectedMonth--;load();}});
  next.addEventListener('click',()=>{if(selectedMonth<lastMonth()){selectedMonth++;load();}});
  calendar.querySelector('[data-calendar-today]').addEventListener('click',()=>{selectedStay=null;selection.hidden=true;selection.replaceChildren();selectedMonth=initialMonth;load();});
  calendar.querySelector('[data-calendar-refresh]').addEventListener('click',()=>{load();loadUpcoming();});
  retry.addEventListener('click',load);
  window.addEventListener('pageshow',event=>{if(event.persisted&&started){load();loadUpcoming();}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&started){load();loadUpcoming();}});
  const publicList = document.getElementById('publicGuestList');
  const publicStatus = document.getElementById('publicGuestStatus');
  const more = document.querySelector('[data-guests-more]');
  const publicRetry = document.querySelector('[data-guests-retry]');
  let publicController;
  let publicSequence = 0;
  let publicGuests = [];
  let expanded = false;
  function renderUpcoming() {
    const records = expanded ? publicGuests : publicGuests.slice(0,6);
    publicList.replaceChildren();
    records.forEach(guest=>{
      const card=document.createElement('article');card.className='public-guest-card';
      const title=document.createElement(document.getElementById('calendarHelpTitle')?.tagName==='H2'?'h3':'h4');title.textContent=guest.guest_name;
      const dates=document.createElement('p');dates.className='public-guest-dates';
      dates.textContent=`${format(guest.check_in,{day:'numeric',month:'short',year:'numeric'})} – ${format(guest.check_out,{day:'numeric',month:'short',year:'numeric'})}`;
      card.append(title,dates);
      if(Number.isInteger(guest.guest_count)) {
        const count=document.createElement('p');count.className='public-guest-count';
        count.textContent=`${guest.guest_count} ${say('orang',guest.guest_count===1?'guest':'guests')}`;
        card.append(count);
      }
      if(guest.check_in<=today) {
        const staying=document.createElement('p');staying.className='public-guest-current';staying.textContent=say('Sedang menginap','Currently staying');card.append(staying);
      }
      const jump=document.createElement('button');jump.type='button';jump.className='public-guest-jump';
      jump.textContent=say('Lihat di kalendar ↑','View in calendar ↑');
      jump.setAttribute('aria-label',`${say('Lihat di kalendar','View in calendar')}: ${guest.guest_name}, ${dates.textContent}`);
      jump.setAttribute('aria-controls','calendarGrid');
      jump.addEventListener('click',()=>showStay(guest));
      card.append(jump);
      publicList.append(card);
    });
    publicStatus.textContent=publicGuests.length?`${publicGuests.length} ${say('penginapan direkodkan','recorded stays')}`:say('Belum ada tetamu akan datang direkodkan.','No upcoming guests have been recorded yet.');
    more.hidden=publicGuests.length<=6;
    more.textContent=expanded?say('Ringkaskan senarai','Show fewer'):say('Lihat semua tetamu','Show all guests');
    more.setAttribute('aria-expanded',String(expanded));
  }
  async function loadUpcoming() {
    const request=++publicSequence;
    publicController?.abort();publicController=new AbortController();
    const active=publicController;
    publicStatus.textContent=say('Memuatkan senarai tetamu…','Loading upcoming guests…');
    publicRetry.hidden=true;more.hidden=true;publicList.replaceChildren();
    const timer=setTimeout(()=>active.abort(),12000);
    try {
      if(!window.GUEST_CONFIG?.apiUrl)throw new Error('Not configured');
      const url=new URL(window.GUEST_CONFIG.apiUrl);url.searchParams.set('action','upcoming');
      const response=await fetch(url,{signal:active.signal,cache:'no-store',credentials:'omit'});
      if(!response.ok)throw new Error('Unavailable');
      const payload=await response.json();
      if(!Array.isArray(payload.guests)||payload.guests.length>1000||payload.guests.some(guest=>!guest||typeof guest.guest_name!=='string'||!guest.guest_name.trim()||guest.guest_name.length>120||(guest.guest_count!=null&&(!Number.isInteger(guest.guest_count)||guest.guest_count<1||guest.guest_count>20))||!dateValue(guest.check_in)||!dateValue(guest.check_out)||guest.check_out<=guest.check_in))throw new Error('Invalid upcoming records');
      if(request!==publicSequence)return;
      publicGuests=payload.guests.filter(guest=>guest.check_out>today).sort((a,b)=>a.check_in.localeCompare(b.check_in));renderUpcoming();
    } catch {
      if(request!==publicSequence)return;
      publicStatus.textContent=say('Senarai belum dapat dimuatkan. Sila cuba lagi.','The guest list could not be loaded. Please try again.');publicRetry.hidden=false;
    } finally {clearTimeout(timer);}
  }
  publicRetry.addEventListener('click',loadUpcoming);
  more.addEventListener('click',()=>{expanded=!expanded;renderUpcoming();});
  const notice = document.getElementById('guestSaveNotice');
  try {
    const saved = JSON.parse(sessionStorage.getItem('guest-save-success') || 'null');
    sessionStorage.removeItem('guest-save-success');
    if (['created','updated','cancelled'].includes(saved?.action)) {
      notice.textContent = saved.action==='cancelled' ? say('Rekod tetamu telah dibatalkan. Kalendar dikemas kini.','Guest record cancelled. The calendar has been updated.') : say('Rekod tetamu berjaya disimpan. Kalendar dikemas kini.','Guest record saved. The calendar has been updated.');
      notice.hidden=false;
    }
  } catch {}
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries=>{
      if (!entries.some(entry=>entry.isIntersecting)) return;
      observer.disconnect();
      // A keyboard or pointer action can start the calendar before this
      // callback runs. The adjacent guest list has its own loading lifecycle.
      if (!started) load();
      if (publicSequence===0) loadUpcoming();
    },{rootMargin:'240px'});
    observer.observe(calendar);
  } else {load();loadUpcoming();}
})();
