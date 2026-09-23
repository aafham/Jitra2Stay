const {config,t,wa,money,icon,picture}=require('./shared.cjs');

function renderHero(lang) {
  const b=config.business;
  return `<section class="hero wrap" id="home" aria-labelledby="heroTitle">
    <div class="hero-copy"><p class="eyebrow">${icon('pin')}${t(lang,'SEBELAH HOSPITAL JITRA','BESIDE JITRA HOSPITAL')}</p>
      <h1 id="heroTitle">${t(lang,'Homestay keluarga.<br>Di Jitra.','Family stays.<br>Here in Jitra.')}</h1>
      <p class="hero-details"><span>${icon('bed')}${b.bedrooms} ${t(lang,'bilik tidur','bedrooms')}</span><span>${icon('bath')}${b.bathrooms} ${t(lang,'bilik air','bathrooms')}</span></p>
      <p class="hero-rate">${t(lang,'Dari','From')} <strong>${money(config.rates[0].price)}</strong><span> / ${t(lang,'malam','night')}</span></p>
      <div class="hero-actions"><a class="button" id="heroPrimaryCta" href="${wa(lang)}" target="_blank" rel="noopener">${t(lang,'Tanya tarikh di WhatsApp','Ask about dates')} ${icon('arrow')}</a><a class="text-link" href="#galeri">${t(lang,'Lihat gambar rumah','Explore the photos')}</a></div>
      <p class="hero-description">${t(lang,'Rumah Semi-D dua tingkat untuk keluarga dan rombongan. Pakej 2–5 bilik, WiFi percuma dan parking di rumah.','A two-storey semi-detached home for families and groups. Choose 2–5 bedrooms, with free WiFi and on-site parking.')}</p>
      <p class="hero-note">${t(lang,'Tarikh dan harga akhir disahkan melalui WhatsApp.','Confirm dates and the final price on WhatsApp.')}</p>
    </div>
    <figure class="hero-media">${picture('halaman',t(lang,'Hadapan rumah Jitra2Stay di Taman Jitra Indah','Jitra2Stay exterior in Taman Jitra Indah'),{hero:true,sizes:'(max-width: 900px) calc(100vw - 40px), (max-width: 1280px) 53vw, 660px'})}<figcaption><span>${icon('home')} Jitra2Stay</span><span>Taman Jitra Indah, Kedah</span></figcaption></figure>
  </section>`;
}
module.exports={renderHero};
