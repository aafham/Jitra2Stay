'use strict';
const {e,t,icon,homeHref}=require('./shared.cjs');

function renderGuestCalendar(lang) {
  return `<section class="section wrap guest-section" id="kalendar" aria-labelledby="guestCalendarTitle">
    <div class="section-heading"><div><p class="eyebrow">${t(lang,'RANCANG TARIKH ANDA','PLAN YOUR STAY')}</p><h2 id="guestCalendarTitle">${t(lang,'Kalendar & tetamu akan datang.','Calendar & upcoming guests.')}</h2></div><p>${t(lang,'Lihat tarikh yang masih tersedia dan penginapan yang sudah direkodkan. Hubungi owner untuk membuat tempahan.','See available dates and recorded stays. Contact the owner to make a booking.')}</p></div>
    <p id="guestSaveNotice" class="guest-save-notice" role="status" tabindex="-1" hidden></p>
    <div class="guest-calendar-layout"><div class="guest-calendar" data-guest-calendar aria-labelledby="calendarMonth">
      <div class="calendar-toolbar"><button type="button" class="icon-button" data-calendar-prev aria-label="${t(lang,'Bulan sebelumnya','Previous month')}"><span aria-hidden="true">←</span></button><h3 id="calendarMonth">${t(lang,'Kalendar bulanan','Monthly calendar')}</h3><button type="button" class="icon-button" data-calendar-next aria-label="${t(lang,'Bulan seterusnya','Next month')}"><span aria-hidden="true">→</span></button></div>
      <div class="calendar-options"><button class="calendar-text-button" type="button" data-calendar-today>${t(lang,'Bulan ini','This month')}</button><button class="calendar-text-button" type="button" data-calendar-refresh>${t(lang,'Muat semula','Refresh')}</button></div>
      <div id="calendarGrid" class="calendar-grid" aria-busy="true"></div>
      <p id="calendarStatus" class="calendar-status" role="status">${t(lang,'Memuatkan rekod penginapan…','Loading stay records…')}</p>
      <button class="button" data-calendar-retry type="button" hidden>${t(lang,'Cuba lagi','Try again')}</button>
      <div class="calendar-legend"><span><i class="calendar-key calendar-key-busy" aria-hidden="true"></i>${t(lang,'Merah · Ada tetamu','Red · Occupied')}</span><span><i class="calendar-key" aria-hidden="true"></i>${t(lang,'Masih tersedia','Available')}</span></div>
      <p class="calendar-status">${t(lang,'Merah menandakan malam penginapan. Pada hari check-out, tetamu baharu boleh masuk selepas 3 petang.','Red marks occupied nights. On a check-out date, new guests can arrive after 3 pm.')}</p>
      <noscript><p>${t(lang,'Hidupkan JavaScript untuk melihat kalendar terkini, atau hubungi owner melalui WhatsApp.','Enable JavaScript to see the current calendar, or contact the owner on WhatsApp.')}</p></noscript>
    </div><aside class="calendar-help" aria-labelledby="calendarHelpTitle"><p class="eyebrow">${t(lang,'PENGINAPAN DIREKODKAN','RECORDED STAYS')}</p><h3 id="calendarHelpTitle">${t(lang,'Tetamu akan datang','Upcoming guests')}</h3><p id="publicGuestStatus" role="status">${t(lang,'Memuatkan senarai tetamu…','Loading upcoming guests…')}</p><div id="publicGuestList"></div><button class="calendar-text-button" data-guests-more type="button" hidden>${t(lang,'Lihat semua tetamu','Show all guests')}</button><button class="button" data-guests-retry type="button" hidden>${t(lang,'Cuba lagi','Try again')}</button><p>${t(lang,'Kalendar mengikut rekod terkini. Sahkan tarikh dan tempahan dengan owner.','The calendar follows the latest records. Confirm dates and bookings with the owner.')}</p><a class="text-link" href="${e(homeHref(lang))}#semak-tarikh">${t(lang,'Tanya tarikh penginapan','Ask about your dates')} ${icon('arrow')}</a><div class="calendar-owner"><span>${t(lang,'Untuk pengurusan homestay','For homestay management')}</span><a class="button calendar-owner-button" href="${lang==='en'?'guest-admin-en.html':'guest-admin.html'}">${icon('key')}${t(lang,'Urus tetamu','Manage guests')}</a></div></aside></div>
  </section>`;
}
module.exports={renderGuestCalendar};
