const {config,e,t,wa,icon,policy,policyText,pageHref,layout}=require('./shared.cjs');
const {renderPropertyLinks}=require('./stay-info.cjs');
const {renderHero}=require('./hero.cjs');
const {renderGallery}=require('./gallery.cjs');
const {renderRates}=require('./rates.cjs');
const {renderEnquiry}=require('./enquiry.cjs');
const {renderLocation}=require('./location.cjs');
function renderHome(lang) {
  const b=config.business, isEn=lang==='en', min=config.rates[0].price;
  const faq=config.faq.map(item=>[item[lang][0],item.policy?policy(item.policy,lang)[1]:policyText(item,lang)[1]]);
  const body=`
  ${renderHero(lang)}
  <section class="facts-section" id="tentang" aria-label="${t(lang,'Ringkasan rumah','House at a glance')}"><div class="wrap facts-grid"><div class="fact">${icon('home')}<div><strong>${t(lang,'Semi-D','Semi-detached')}</strong><span>${t(lang,'Rumah dua tingkat','Two-storey house')}</span></div></div><div class="fact">${icon('bed')}<div><strong>${b.bedrooms} ${t(lang,'bilik tidur','bedrooms')}</strong><span>${t(lang,'Pakej 2 hingga 5 bilik','Packages from 2 to 5 rooms')}</span></div></div><div class="fact">${icon('bath')}<div><strong>${b.bathrooms} ${t(lang,'bilik air','bathrooms')}</strong><span>${t(lang,'Akses mengikut pakej','Access by room package')}</span></div></div><div class="fact">${icon('people')}<div><strong>${t(lang,'Maksimum','Up to')} ${b.maxGuests} ${t(lang,'tetamu','guests')}</strong><span>${t(lang,'Termasuk kanak-kanak','Including children')}</span></div></div></div><p class="wrap facts-note">${t(lang,`Sesuai untuk keluarga atau rombongan ${b.typicalGuests.min}–${b.typicalGuests.max} orang. Tilam, bantal dan comforter tambahan disediakan; maksimum ${b.maxGuests} orang termasuk kanak-kanak.`,`Suitable for families or groups of ${b.typicalGuests.min}–${b.typicalGuests.max}. Extra mattresses, pillows and comforters are provided; maximum ${b.maxGuests} guests including children.`)}</p><div class="wrap">${renderPropertyLinks(lang)}</div></section>
  ${renderGallery(lang)}
  ${renderRates(lang)}
  <section class="section wrap" id="kemudahan" aria-labelledby="amenitiesTitle"><div class="section-heading"><div><p class="eyebrow">${t(lang,'UNTUK PENGINAPAN ANDA','FOR YOUR STAY')}</p><h2 id="amenitiesTitle">${t(lang,'Keperluan untuk rasa selesa.','The essentials for settling in.')}</h2></div><p>${t(lang,'Ruang bersama dan kemudahan asas untuk keluarga. Sahkan keperluan khusus sebelum datang.','Shared spaces and everyday essentials for your family. Check any specific needs before arrival.')}</p></div><div class="amenities-grid">${config.facilities.map(f=>`<article class="amenity">${icon(f.icon)}<h3>${e(f[lang][0])}</h3><p>${e(f[lang][1])}</p></article>`).join('')}</div></section>
  ${renderLocation(lang)}
  <section class="section wrap faq-layout" id="faq" aria-labelledby="faqTitle"><div><p class="eyebrow">${t(lang,'SEBELUM ANDA DATANG','BEFORE YOU ARRIVE')}</p><h2 id="faqTitle">${t(lang,'Ada yang ingin<br>ditanya?','A few things<br>to know.')}</h2><p>${t(lang,'Semak perkara utama di sini, atau hubungi owner untuk keperluan penginapan anda.','Find the essentials here, or contact the owner about your particular stay.')}</p><a class="text-link" href="${pageHref('policies',lang)}">${t(lang,'Polisi & house rules penuh','Full policies & house rules')} ${icon('arrow')}</a></div><div class="faq-list">${faq.map(([question,answer])=>`<details><summary>${e(question)}<span aria-hidden="true">+</span></summary><p>${e(answer)}</p></details>`).join('')}</div></section>
  ${renderEnquiry(lang)}
`;
  return layout({lang,title:t(lang,'Jitra2Stay | Homestay keluarga di Jitra, Kedah','Jitra2Stay | Family homestay in Jitra, Kedah'),description:t(lang,`Homestay Semi-D di Jitra dengan ${b.bedrooms} bilik dan ${b.bathrooms} bilik air. Lihat foto, pakej dari RM${min}/malam dan lokasi. Tanya tarikh melalui WhatsApp.`,`A semi-detached homestay in Jitra with ${b.bedrooms} bedrooms and ${b.bathrooms} bathrooms. Explore photos, packages from RM${min}/night and the location. Enquire on WhatsApp.`),path:isEn?'en.html':'',pairedPath:isEn?'':'en.html',body,isHome:true});
}
module.exports={renderHome};
