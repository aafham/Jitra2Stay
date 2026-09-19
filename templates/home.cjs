const {config,e,t,icon,layout,imageInfo}=require('./shared.cjs');
const {renderFaq}=require('./faq.cjs');
const {renderPropertyLinks}=require('./stay-info.cjs');
const {renderHero}=require('./hero.cjs');
const {renderGallery}=require('./gallery.cjs');
const {renderRates}=require('./rates.cjs');
const {renderEnquiry}=require('./enquiry.cjs');
const {renderLocation}=require('./location.cjs');
function facilityPhotoLink(facility, lang) {
  // Only spaces actually shown in the supplied photos are linked. There is no bathroom photo.
  const image={bed:'bilik-tidur',kitchen:'dapur',car:'parking',home:'ruang-tamu'}[facility.icon];
  const photo=config.gallery.find(item=>item.image===image);
  if(!photo) return '';
  const href=imageInfo(photo.image).variants.at(-1).src;
  return `<a class="amenity-photo" href="${e(href)}" data-gallery-photo="${e(photo.image)}">${e(t(lang,`Lihat foto: ${photo.ms}`,`View photo: ${photo.en}`))} ${icon('arrow')}</a>`;
}
function renderHome(lang) {
  const b=config.business, isEn=lang==='en', min=config.rates[0].price;
  const body=`
  ${renderHero(lang)}
  <section class="facts-section" id="tentang" aria-label="${t(lang,'Ringkasan rumah','House at a glance')}"><div class="wrap facts-grid"><div class="fact">${icon('home')}<div><strong>${t(lang,'Semi-D','Semi-detached')}</strong><span>${t(lang,'Rumah dua tingkat','Two-storey house')}</span></div></div><div class="fact">${icon('bed')}<div><strong>${b.bedrooms} ${t(lang,'bilik tidur','bedrooms')}</strong><span>${t(lang,'Pakej 2 hingga 5 bilik','Packages from 2 to 5 rooms')}</span></div></div><div class="fact">${icon('bath')}<div><strong>${b.bathrooms} ${t(lang,'bilik air','bathrooms')}</strong><span>${t(lang,'Akses mengikut pakej','Access by room package')}</span></div></div><div class="fact">${icon('people')}<div><strong>${t(lang,'Maksimum','Up to')} ${b.maxGuests} ${t(lang,'tetamu','guests')}</strong><span>${t(lang,'Termasuk kanak-kanak','Including children')}</span></div></div></div><p class="wrap facts-note">${t(lang,`Sesuai untuk keluarga atau rombongan ${b.typicalGuests.min}–${b.typicalGuests.max} orang. Tilam, bantal dan comforter tambahan disediakan; maksimum ${b.maxGuests} orang termasuk kanak-kanak.`,`Suitable for families or groups of ${b.typicalGuests.min}–${b.typicalGuests.max}. Extra mattresses, pillows and comforters are provided; maximum ${b.maxGuests} guests including children.`)}</p><div class="wrap">${renderPropertyLinks(lang)}</div></section>
  ${renderGallery(lang)}
  ${renderRates(lang)}
  <section class="section wrap" id="kemudahan" aria-labelledby="amenitiesTitle"><div class="section-heading"><div><p class="eyebrow">${t(lang,'UNTUK PENGINAPAN ANDA','FOR YOUR STAY')}</p><h2 id="amenitiesTitle">${t(lang,'Keperluan untuk rasa selesa.','The essentials for settling in.')}</h2></div><p>${t(lang,'Ruang bersama dan kemudahan asas untuk keluarga. Sahkan keperluan khusus sebelum datang.','Shared spaces and everyday essentials for your family. Check any specific needs before arrival.')}</p></div><div class="amenities-grid">${config.facilities.map(f=>`<article class="amenity">${icon(f.icon)}<h3>${e(f[lang][0])}</h3><p>${e(f[lang][1])}</p>${facilityPhotoLink(f,lang)}</article>`).join('')}</div></section>
  ${renderLocation(lang)}
  ${renderFaq(lang)}
  ${renderEnquiry(lang)}
`;
  return layout({lang,title:t(lang,'Jitra2Stay | Homestay keluarga di Jitra, Kedah','Jitra2Stay | Family homestay in Jitra, Kedah'),description:t(lang,`Homestay Semi-D di Jitra dengan ${b.bedrooms} bilik dan ${b.bathrooms} bilik air. Lihat foto, pakej dari RM${min}/malam dan lokasi. Tanya tarikh melalui WhatsApp.`,`A semi-detached homestay in Jitra with ${b.bedrooms} bedrooms and ${b.bathrooms} bathrooms. Explore photos, packages from RM${min}/night and the location. Enquire on WhatsApp.`),path:isEn?'en.html':'',pairedPath:isEn?'':'en.html',body,isHome:true});
}
module.exports={renderHome};
