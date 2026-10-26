const {config,e,t,icon,layout,imageInfo,picture}=require('./shared.cjs');
const {renderFaq}=require('./faq.cjs');
const {renderPropertyLinks}=require('./stay-info.cjs');
const {renderHero}=require('./hero.cjs');
const {renderGallery}=require('./gallery.cjs');
const {renderRates}=require('./rates.cjs');
const {renderEnquiry}=require('./enquiry.cjs');
const {renderLocation}=require('./location.cjs');
const {renderGuestCalendar}=require('./guest-calendar.cjs');
const {renderReviews}=require('./reviews.cjs');
function facilityPhotoLink(facility, lang, {preview=false,skipFirst=false}={}) {
  const images=skipFirst?(facility.photos||[]).slice(1):(facility.photos||[]);
  return images.map((image,index)=>{
    const photo=config.gallery.find(item=>item.image===image);
    if(!photo) throw new Error(`Missing amenity gallery photo: ${image}`);
    const href=imageInfo(photo.image).variants.at(-1).src;
    const label=t(lang,`Lihat foto: ${photo.ms}`,`View photo: ${photo.en}`);
    if(preview&&index===0) return `<a class="amenity-photo" href="${e(href)}" data-gallery-photo="${e(photo.image)}" data-amenity-preview${photo.portrait?' data-portrait="true"':''} aria-label="${e(label)}">${picture(photo.image,photo.alt?.[lang]||photo[lang],{sizes:'(max-width: 600px) calc(100vw - 72px), (max-width: 900px) calc((100vw - 98px) / 2.2), (max-width: 1280px) calc((100vw - 168px) / 3), 336px'})}<span class="amenity-photo-caption">${e(label)} ${icon('arrow')}</span></a>`;
    return `<a class="amenity-photo" href="${e(href)}" data-gallery-photo="${e(photo.image)}">${e(label)} ${icon('arrow')}</a>`;
  }).join('');
}
function renderFacts(lang) { const b=config.business; return `<section class="facts-section" id="tentang" aria-label="${t(lang,'Ringkasan rumah','House at a glance')}"><div class="wrap facts-grid"><div class="fact">${icon('home')}<div><strong>${t(lang,'Semi-D','Semi-detached')}</strong><span>${t(lang,'Rumah dua tingkat','Two-storey house')}</span></div></div><div class="fact">${icon('bed')}<div><strong>${b.bedrooms} ${t(lang,'bilik tidur','bedrooms')}</strong><span>${t(lang,'Pakej 2 hingga 5 bilik','Packages from 2 to 5 rooms')}</span></div></div><div class="fact">${icon('bath')}<div><strong>${b.bathrooms} ${t(lang,'bilik air','bathrooms')}</strong><span>${t(lang,'Akses mengikut pakej','Access by room package')}</span></div></div><div class="fact">${icon('people')}<div><strong>${t(lang,'Maksimum','Up to')} ${b.maxGuests} ${t(lang,'tetamu','guests')}</strong><span>${t(lang,'Termasuk kanak-kanak','Including children')}</span></div></div></div><p class="wrap facts-note">${t(lang,`Sesuai untuk keluarga atau rombongan ${b.typicalGuests.min}–${b.typicalGuests.max} orang. Tilam, bantal dan comforter tambahan disediakan; maksimum ${b.maxGuests} orang termasuk kanak-kanak.`,`Suitable for families or groups of ${b.typicalGuests.min}–${b.typicalGuests.max}. Extra mattresses, pillows and comforters are provided; maximum ${b.maxGuests} guests including children.`)}</p><div class="wrap">${renderPropertyLinks(lang)}</div></section>`; }
function renderAmenities(lang) {
  const featuredIcons=['home','kitchen','washer'];
  const featured=featuredIcons.map(icon=>config.facilities.find(facility=>facility.icon===icon)).filter(Boolean);
  const remaining=config.facilities.filter(facility=>!featured.includes(facility));
  const card=(facility,isFeatured)=>{
    const copy=`<h3>${e(facility[lang][0])}</h3><p>${e(facility[lang][1])}</p>${facilityPhotoLink(facility,lang,{skipFirst:isFeatured})}`;
    return `<article class="amenity${isFeatured?' amenity--featured':''}">${isFeatured?`${facilityPhotoLink({...facility,photos:facility.photos.slice(0,1)},lang,{preview:true})}<div class="amenity-copy">${copy}</div>`:`${icon(facility.icon)}${copy}`}</article>`;
  };
  return `<section class="section wrap" id="kemudahan" aria-labelledby="amenitiesTitle"><div class="section-heading"><div><p class="eyebrow">${t(lang,'UNTUK PENGINAPAN ANDA','FOR YOUR STAY')}</p><h2 id="amenitiesTitle">${t(lang,'Keperluan untuk rasa selesa.','The essentials for settling in.')}</h2></div><p>${t(lang,'Dari peralatan dapur hingga mesin basuh dan seterika. Lihat foto sebenar kemudahan yang tersedia di rumah.','From kitchen appliances to laundry and ironing facilities. See real photos of the amenities available in the house.')}</p></div><div class="amenities-grid"><div class="amenities-featured">${featured.map(facility=>card(facility,true)).join('')}</div><div class="amenities-details">${remaining.map(facility=>card(facility,false)).join('')}</div></div></section>`;
}
function renderHome(lang) {
  const b=config.business, isEn=lang==='en', min=config.rates[0].price;
  const body=`
  ${renderHero(lang)}
  ${require('./mobile-navigation.cjs').mobileHome(lang,require('./shared.cjs'))}
  ${renderFacts(lang)}
  ${renderGallery(lang)}
  ${renderRates(lang)}
  ${renderGuestCalendar(lang)}
  ${renderAmenities(lang)}
  ${renderReviews(lang)}
  ${renderLocation(lang)}
  ${renderFaq(lang)}
  ${renderEnquiry(lang)}
`;
  return layout({lang,title:t(lang,'Jitra2Stay | Homestay keluarga di Jitra, Kedah','Jitra2Stay | Family homestay in Jitra, Kedah'),description:t(lang,`Homestay Semi-D di Jitra dengan ${b.bedrooms} bilik dan ${b.bathrooms} bilik air. Lihat foto, pakej dari RM${min}/malam dan lokasi. Tanya tarikh melalui WhatsApp.`,`A semi-detached homestay in Jitra with ${b.bedrooms} bedrooms and ${b.bathrooms} bathrooms. Explore photos, packages from RM${min}/night and the location. Enquire on WhatsApp.`),path:isEn?'en.html':'',pairedPath:isEn?'':'en.html',body,isHome:true});
}
module.exports={renderHome,renderFacts,renderAmenities};
