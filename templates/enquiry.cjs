const {config,e,t,wa,money,icon}=require('./shared.cjs');

function renderEnquiry(lang) {
  const b=config.business;
  return `<section class="section enquiry-section" id="semak-tarikh" aria-labelledby="enquiryTitle"><div class="wrap enquiry-layout">
    <div><p class="eyebrow">${t(lang,'BINCANG DENGAN OWNER','LET’S PLAN YOUR STAY')}</p><h2 id="enquiryTitle">${t(lang,'Dah ada tarikh<br>dalam fikiran?','Have a date<br>in mind?')}</h2><p>${t(lang,'Tanya terus melalui WhatsApp, atau sediakan butiran di sini. Anda boleh semak anggaran dan mesej sebelum membukanya di WhatsApp.','Ask directly on WhatsApp, or prepare the details here. Review the estimate and your message before opening it in WhatsApp.')}</p><a class="button button-light" href="${wa(lang)}" target="_blank" rel="noopener">WhatsApp ${icon('arrow')}</a><a class="enquiry-phone" href="tel:+${b.phone}">${icon('phone')}${e(b.phoneDisplay)}</a><p class="enquiry-note">${t(lang,'Owner akan sahkan tarikh dan harga akhir. Tiada tempahan atau bayaran dibuat di website.','The owner confirms dates and the final price. No booking or payment is made on this website.')}</p></div>
    <div class="enquiry-panel"><noscript><p>${t(lang,'Gunakan pautan WhatsApp atau telefon untuk bertanya tentang tarikh, bilik dan jumlah tetamu.','Use the WhatsApp or phone link to discuss dates, room packages and guest count.')}</p></noscript>
    <form id="dateForm" hidden><h3>${t(lang,'Sediakan pertanyaan anda','Prepare your enquiry')}</h3>
      <div class="form-grid">
        <div><label for="checkin">Check-in</label><input id="checkin" name="checkin" type="date" required aria-describedby="checkinError"><p class="field-error" id="checkinError" hidden></p></div>
        <div><label for="checkout">Check-out</label><input id="checkout" name="checkout" type="date" required aria-describedby="checkoutError"><p class="field-error" id="checkoutError" hidden></p></div>
      </div>
      <div id="stayShortcuts" class="stay-shortcuts" hidden><span>${t(lang,'Isi check-out untuk','Set check-out for')}</span><div>${[1,2,3].map(n=>`<button type="button" data-nights="${n}" aria-pressed="false">${n} ${t(lang,'malam',n===1?'night':'nights')}</button>`).join('')}</div></div>
      <div class="form-grid guest-fields">
        <div><label for="guests">${t(lang,'Jumlah tetamu','Guest count')}</label><input id="guests" name="guests" type="number" inputmode="numeric" min="1" max="${b.maxGuests}" step="1" value="6" required aria-describedby="guestHint guestsError"><p class="field-error" id="guestsError" hidden></p></div>
        <div><label for="rooms">${t(lang,'Pakej bilik','Room package')}</label><select id="rooms" name="rooms" required aria-describedby="roomsError">${config.rates.map(rate=>`<option value="${rate.rooms}">${rate.rooms} ${t(lang,'bilik','rooms')} · ${money(rate.price)}</option>`).join('')}</select><p class="field-error" id="roomsError" hidden></p></div>
      </div>
      <p id="guestHint" class="field-note">${t(lang,`Maksimum ${b.maxGuests} orang termasuk kanak-kanak.`, `Maximum ${b.maxGuests} guests, including children.`)}</p>
      <label for="notes">${t(lang,'Nota tambahan','Additional notes')} <span class="optional">(${t(lang,'pilihan','optional')})</span></label><textarea id="notes" name="notes" rows="2" maxlength="1000" placeholder="${t(lang,'Contoh: keperluan bilik di tingkat bawah','For example: a downstairs bedroom request')}"></textarea>
      <div id="priceEstimate" class="price-estimate" role="status" aria-live="polite"><p id="estimatePrompt">${t(lang,'Pilih tarikh dan pakej untuk lihat anggaran sewaan.','Choose dates and a package to see the accommodation estimate.')}</p><div id="estimateBreakdown" hidden><div class="estimate-total"><span>${t(lang,'Anggaran sewaan','Accommodation estimate')}</span><strong id="estimateTotal"></strong></div><dl><div><dt id="estimateStay"></dt><dd id="estimateRate"></dd></div><div><dt>${t(lang,'Deposit berasingan','Separate deposit')}</dt><dd>${money(b.securityDeposit)}</dd></div></dl></div><p class="estimate-caveat">${t(lang,'Sewaan tidak termasuk deposit atau caj tambahan. Owner mengesahkan kekosongan, harga akhir dan bayaran booking.','Accommodation excludes the deposit and extra charges. The owner confirms availability, the final price and booking payments.')}</p></div>
      <details id="enquiryPreview" class="enquiry-preview" hidden><summary>${t(lang,'Semak mesej pertanyaan','Review your enquiry message')} <span aria-hidden="true">+</span></summary><pre id="enquiryPreviewText"></pre></details>
      <button class="button form-submit" type="submit">${t(lang,'Buka pertanyaan di WhatsApp','Open enquiry in WhatsApp')} ${icon('arrow')}</button><p id="formFeedback" class="form-feedback" role="status" aria-live="polite"></p>
      <div class="enquiry-fallback"><a id="enquiryLink" class="text-link" hidden target="_blank" rel="noopener">${t(lang,'Buka semula mesej WhatsApp','Open the WhatsApp message again')}</a><button id="enquiryCopyMessage" class="text-button" type="button" hidden>${t(lang,'Salin mesej','Copy message')}</button></div>
    <div class="draft-controls"><button id="clearEnquiryDraft" class="text-button" type="button" hidden>${t(lang,'Kosongkan borang','Clear form')}</button><p id="draftFeedback" class="field-note" role="status" aria-live="polite"></p></div></form></div>
  </div></section>`;
}

module.exports={renderEnquiry};
