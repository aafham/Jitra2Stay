const { e, t, homeHref, pageHref, icon, layout } = require('./shared.cjs');

function renderGuestAdmin(lang = 'ms') {
  const text = (ms, en) => t(lang, ms, en);
  const home = `${homeHref(lang)}#kalendar`;
  const field = (id, label, input, hint = '') => `<div class="guest-field"><label for="${id}">${label}</label>${input}${hint ? `<p class="field-note" id="${id}Hint">${hint}</p>` : ''}<p class="guest-field-error" id="${id}Error" hidden></p></div>`;
  const body = `<div class="guest-admin wrap" data-guest-admin>
    <a class="text-link guest-home" href="${home}">${icon('home')}${text('Kembali ke laman utama', 'Back to home')}</a>
    <header class="guest-page-heading"><p class="eyebrow">${text('Urus penginapan', 'Manage stays')}</p><h1>${text('Rekod tetamu', 'Guest records')}</h1><p>${text('Tambah tarikh penginapan supaya kalendar sentiasa dikemas kini.', 'Add stay dates to keep the calendar up to date.')}</p></header>
    <noscript><p class="guest-notice">${text('Aktifkan JavaScript dalam pelayar untuk membuka borang dan menyimpan rekod tetamu.', 'Enable JavaScript in your browser to open the form and save guest records.')}</p></noscript>
    <p class="guest-notice" id="guestStorageNotice" role="status" hidden>${text('Pelayar tidak dapat menyimpan sesi. Anda masih boleh menggunakan borang ini, tetapi perlu masukkan PIN semula selepas meninggalkan halaman.', 'Your browser cannot remember this session. You can still use the form, but will need to enter the PIN again after leaving this page.')}</p>
    <section class="guest-panel guest-pin-panel" id="guestPinPanel" aria-labelledby="guestPinTitle">
      <span class="guest-lock" aria-hidden="true">${icon('key')}</span><h2 id="guestPinTitle">${text('Masukkan PIN', 'Enter your PIN')}</h2>
      <p id="guestPinHint">${text('Masukkan 4 digit. Borang akan terbuka sendiri apabila PIN betul.', 'Enter all 4 digits. The form opens automatically when the PIN is correct.')}</p>
      <form id="guestPinForm" novalidate><fieldset class="guest-pin-fieldset" aria-describedby="guestPinHint guestPinStatus"><legend class="sr-only">${text('PIN 4 digit', '4-digit PIN')}</legend><div class="guest-pin-digits">${Array.from({ length: 4 }, (_, i) => `<input class="guest-pin-digit" id="guestPin${i + 1}" type="password" inputmode="numeric" pattern="[0-9]" maxlength="1" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" aria-label="${e(text(`Digit PIN ${i + 1}`, `PIN digit ${i + 1}`))}" disabled>`).join('')}</div></fieldset></form>
      <p class="guest-pin-status" id="guestPinStatus" role="status" aria-live="polite">${text('Sedang menyediakan borang…', 'Preparing the form…')}</p>
      <button class="guest-button guest-button-secondary" id="guestSessionRetry" type="button" hidden>${text('Cuba sambung semula', 'Try connecting again')}</button>
      <p class="guest-private-note">${text('PIN diperlukan untuk menambah, mengubah atau membatalkan rekod. Nama, tarikh dan jumlah tetamu dipaparkan di laman utama. Tujuan hanya untuk pengurusan.', 'A PIN is required to add, edit or cancel records. Names, dates and guest counts appear on the home page. The purpose is only shown to management.')}</p>
    </section>
    <div id="guestWorkspace" hidden>
      <div class="guest-session-bar"><p>${icon('check')} ${text('Anda sudah masuk', 'You are signed in')}</p><button class="guest-button guest-button-secondary" id="guestLogout" type="button">${text('Keluar', 'Sign out')}</button></div>
      <div class="guest-workspace-grid">
        <section class="guest-panel guest-form-panel" aria-labelledby="guestFormTitle">
          <div class="guest-panel-heading"><h2 id="guestFormTitle" tabindex="-1">${text('Tambah tetamu', 'Add a guest')}</h2><button class="guest-button guest-button-secondary" id="guestCancelEdit" type="button" hidden>${text('Batal ubah', 'Cancel editing')}</button></div>
          <p class="guest-form-intro">${text('Isi 4 maklumat utama di bawah. Tujuan penginapan boleh dikosongkan.', 'Fill in the 4 main details below. The purpose of the stay is optional.')}</p>
          <form id="guestDetailsForm" novalidate autocomplete="off">
            <div class="guest-date-fields">
              ${field('guestCheckIn', text('Tarikh masuk', 'Check-in date'), '<input id="guestCheckIn" name="check_in" type="date" required aria-describedby="guestCheckInHint guestCheckInError">', text('Masuk mulai 3 petang.', 'Check in from 3 pm.'))}
              ${field('guestCheckOut', text('Tarikh keluar', 'Check-out date'), '<input id="guestCheckOut" name="check_out" type="date" required aria-describedby="guestCheckOutHint guestCheckOutError">', text('Keluar sebelum 12 tengah hari.', 'Check out by 12 noon.'))}
            </div>
            <p class="guest-night-summary" id="guestNights" role="status" aria-live="polite">${text('Pilih tarikh masuk dan keluar.', 'Choose check-in and check-out dates.')}</p>
            ${field('guestName', text('Nama tetamu', 'Guest name'), `<input id="guestName" name="guest_name" type="text" required maxlength="120" autocomplete="off" aria-describedby="guestNameHint guestNameError" placeholder="${text('Nama wakil tempahan', 'Booking contact name')}">`, text('Nama ini dipaparkan dalam senarai tetamu di laman utama.', 'This name appears in the guest list on the home page.'))}
            ${field('guestCount', text('Bilangan orang', 'Number of guests'), '<input id="guestCount" name="guest_count" type="number" inputmode="numeric" min="1" max="20" step="1" required aria-describedby="guestCountHint guestCountError">', text('Jumlah semua tetamu, termasuk kanak-kanak. Maksimum 20 orang.', 'Include everyone staying, including children. Maximum 20 guests.'))}
            ${field('guestPurpose', `${text('Tujuan', 'Purpose')} <span class="guest-optional">(${text('tak wajib', 'optional')})</span>`, `<textarea id="guestPurpose" name="purpose" rows="3" maxlength="500" aria-describedby="guestPurposeHint guestPurposeError" placeholder="${text('Contoh: kenduri, konvokesyen atau bercuti', 'For example: a wedding, graduation or holiday')}"></textarea>`, text('Catatan pengurusan sahaja. Boleh terus simpan tanpa mengisi bahagian ini.', 'A management note only. You can save without filling in this field.'))}
            <div class="guest-form-error guest-notice" id="guestFormError" role="alert" tabindex="-1" hidden></div>
            <button class="guest-button guest-save" id="guestSave" type="submit">${text('Simpan & kembali ke utama', 'Save & return home')} ${icon('arrow')}</button>
            <p class="guest-save-note">${text('Selepas berjaya disimpan, anda terus kembali ke kalendar di laman utama.', 'After saving, you will return straight to the calendar on the home page.')}</p>
          </form>
        </section>
        <section class="guest-panel guest-list-panel" aria-labelledby="guestListTitle">
          <div class="guest-panel-heading"><div><p class="eyebrow">${text('Senarai penginapan', 'Stay list')}</p><h2 id="guestListTitle">${text('Tetamu akan datang', 'Upcoming guests')}</h2></div><button class="guest-button guest-button-secondary" id="guestRefresh" type="button">${text('Muat semula', 'Refresh')}</button></div>
          <p class="guest-list-intro">${text('Semak, ubah atau batalkan rekod yang sudah dimasukkan.', 'Review, edit or cancel an existing record.')}</p>
          <label class="guest-history-toggle"><input id="guestShowHistory" type="checkbox"> <span>${text('Tunjuk juga rekod 90 hari lepas', 'Also show the past 90 days')}</span></label>
          <p id="guestListStatus" class="guest-list-status" role="status" aria-live="polite"></p><div id="guestList"></div>
        </section>
      </div>
    </div>
  </div>`;
  return layout({ lang, title: text('Urus tetamu | Jitra2Stay', 'Manage guests | Jitra2Stay'), description: text('Pengurusan rekod tetamu dan kalendar penginapan Jitra2Stay.', 'Manage guest records and the Jitra2Stay stay calendar.'), path: pageHref('guest-admin', lang), pairedPath: pageHref('guest-admin', lang === 'ms' ? 'en' : 'ms'), body, noindex: true, pageAssets: 'guest-admin', compact: true });
}

module.exports = { renderGuestAdmin };
