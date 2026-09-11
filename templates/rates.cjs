const {config,t,wa,money,icon,pageHref}=require('./shared.cjs');

function renderRates(lang) {
  return `<section class="section section-tint" id="kadar" aria-labelledby="ratesTitle"><div class="wrap rates-layout">
    <div class="rates-intro"><p class="eyebrow">${t(lang,'PILIH IKUT KEPERLUAN','CHOOSE WHAT YOU NEED')}</p><h2 id="ratesTitle">${t(lang,'Ruang yang sesuai.<br>Kadar yang jelas.','The right space.<br>A clear starting rate.')}</h2><p>${t(lang,'Bandingkan bilangan bilik dan bilik air, kemudian pilih pakej untuk pertanyaan anda. Semua harga ialah kadar asas satu malam.','Compare the bedrooms and bathrooms, then choose a package for your enquiry. All prices are base rates for one night.')}</p>
    </div>
    <div class="package-options"><div class="package-grid">${config.rates.map(rate=>`<article class="package-card" data-package="${rate.rooms}" aria-labelledby="packageTitle${rate.rooms}"><div class="package-heading">${icon('bed')}<h3 id="packageTitle${rate.rooms}">${rate.rooms} ${t(lang,'bilik','rooms')}</h3></div><p class="package-bathrooms">${rate.bathrooms} ${t(lang,'bilik air','bathrooms')}</p><p class="package-price"><strong>${money(rate.price)}</strong><span>/ ${t(lang,'malam','night')}</span></p><a class="package-link" href="#semak-tarikh" data-rooms="${rate.rooms}" aria-label="${t(lang,`Pilih pakej ${rate.rooms} bilik`,`Choose the ${rate.rooms}-room package`)}">${t(lang,'Pilih','Choose')} ${icon('arrow')}</a><span class="package-selected" hidden>${icon('check')}${t(lang,'Pilihan anda','Your selection')}</span></article>`).join('')}</div>
    <p class="rate-note" id="rateNote">${t(lang,'Sahkan susunan bilik, harga untuk tarikh pilihan dan sebarang caj tambahan dengan owner. Deposit tidak termasuk dalam kadar sewaan.','Confirm room arrangements, rates for your dates and any extra charges with the owner. The deposit is not included in the accommodation rate.')}</p></div>
    <div class="rates-meta"><div class="deposit-note">${icon('check')}<div><strong>${t(lang,'Deposit keselamatan','Security deposit')} ${money(config.business.securityDeposit)}</strong><p>${t(lang,'Berasingan daripada sewaan. Syarat pemulangan dan bayaran booking disahkan sebelum membayar.','Separate from the room rate. Confirm return conditions and booking payments before paying.')}</p></div></div>
      <a class="text-link" href="${pageHref('policies',lang)}">${t(lang,'Baca polisi penginapan','Read the stay policies')} ${icon('arrow')}</a>
      <p class="package-help">${t(lang,'Belum pasti pakej yang sesuai?','Unsure which package fits?')} <a href="${wa(lang,t(lang,'Hai Jitra2Stay, boleh bantu saya pilih pakej bilik mengikut jumlah tetamu dan keperluan tidur?','Hi Jitra2Stay, could you help me choose a room package for my guest count and sleeping needs?'))}" target="_blank" rel="noopener">${t(lang,'Minta bantuan owner','Ask the owner')}</a>.</p>
    </div>
  </div></section>`;
}

module.exports={renderRates};
