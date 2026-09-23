const shared=require('./shared.cjs');
const {config,e,t,icon,layout,pageHref,homeHref}=shared;
const {routes,sectionRoutes}=require('../data/mobile-routes.cjs');
const {renderFacts,renderAmenities}=require('./home.cjs');
const {renderGallery}=require('./gallery.cjs');
const {renderRates}=require('./rates.cjs');
const {renderEnquiry}=require('./enquiry.cjs');
const {renderLocation}=require('./location.cjs');
const {renderFaq}=require('./faq.cjs');
const {renderGuestCalendar}=require('./guest-calendar.cjs');

function heading(body,id,title) {
  return body.replace(new RegExp(`<h2 id="${id}">[\\s\\S]*?</h2>`),`<h1 id="${id}">${title}</h1>`);
}
function focusedLinks(body,key,lang) {
  body=body.replace(/href="(?:\.\/|en\.html)?#([\w-]+)"/g,(match,hash)=>{
    const section=hash.startsWith('faq-')?'faq':hash;
    const route=Object.hasOwn(sectionRoutes,section)?sectionRoutes[section]:null;
    return route&&route!==key?`href="${pageHref(route,lang)}"`:match;
  });
  body=body.replace(/class="package-link" href="[^"]+" data-rooms="(\d+)"/g,(_,rooms)=>`class="package-link" href="${pageHref('hubungi',lang)}?rooms=${rooms}" data-rooms="${rooms}"`);
  body=body.replace(/class="amenity-photo" href="[^"]+" data-gallery-photo="([\w-]+)"/g,(_,photo)=>`class="amenity-photo" href="${pageHref('gambar',lang)}?photo=${photo}" data-gallery-photo="${photo}"`);
  return body;
}
function directory(lang) {
  const hints={rumah:t(lang,'Bilik, bilik air & kapasiti','Rooms, bathrooms & capacity'),kemudahan:t(lang,'WiFi, dapur & kemudahan rumah','WiFi, kitchen & home facilities'),lokasi:t(lang,'Google Maps, Waze & tempat berdekatan','Google Maps, Waze & nearby places'),faq:t(lang,'Jawapan sebelum menginap','Answers before your stay'),hubungi:t(lang,'Semak anggaran & WhatsApp owner','Estimate your stay & WhatsApp the owner')};
  return `<section class="section wrap browse-directory"><p class="eyebrow">JITRA2STAY</p><h1>${routes.maklumat[lang]}</h1><p class="browse-lead">${t(lang,'Pilih perkara yang anda nak tahu.','Choose what you would like to know.')}</p><div class="browse-links">${Object.entries(hints).map(([key,hint])=>`<a href="${pageHref(key,lang)}">${icon(routes[key].icon)}<span><strong>${routes[key][lang]}</strong><small>${hint}</small></span>${icon('arrow')}</a>`).join('')}<a href="${pageHref('policies',lang)}">${icon('help')}<span><strong>${t(lang,'Polisi & peraturan rumah','Policies & house rules')}</strong><small>${t(lang,'Deposit, check-in & panduan penginapan','Deposit, check-in & stay guidance')}</small></span>${icon('arrow')}</a></div><details class="browse-details browse-contacts"><summary>${t(lang,'Telefon & e-mel','Phone & email')}</summary><a href="tel:+${config.business.phone}">${e(config.business.phoneDisplay)}</a><a href="tel:+${config.business.secondaryPhone}">${e(config.business.secondaryPhoneDisplay)} · ${t(lang,'panggilan','calls')}</a><a href="mailto:${e(config.business.email)}">${e(config.business.email)}</a></details><div class="browse-owner"><span>${t(lang,'Pengurusan homestay','Homestay management')}</span><a class="text-link" href="${pageHref('guest-admin',lang)}">${icon('key')}${t(lang,'Urus tetamu','Manage guests')}</a></div></section>`;
}
function renderMobilePage(key,lang) {
  const title=routes[key][lang];
  let body;
  switch(key){
    case 'rumah':body=`<div class="wrap browse-heading"><p class="eyebrow">JITRA2STAY</p><h1>${t(lang,'Kenali rumah kami','Get to know the house')}</h1><p class="browse-lead">${t(lang,'Privasi satu rumah. Pilih bilik ikut keperluan.','Full-house privacy. Choose the rooms you need.')}</p></div>${renderFacts(lang)}<div class="wrap browse-next"><a class="button" href="${pageHref('gambar',lang)}">${t(lang,'Lihat gambar rumah','See house photos')} ${icon('arrow')}</a><a class="text-link" href="${pageHref('harga',lang)}">${t(lang,'Lihat pakej bilik','View room packages')} ${icon('arrow')}</a></div>`;break;
    case 'gambar':body=heading(renderGallery(lang),'galleryTitle',title);break;
    case 'harga':{
      body=heading(renderRates(lang),'ratesTitle',title);
      // Keep the payment example visible; longer policies open on demand.
      const start=body.indexOf('<div class="rates-support">');
      const end=body.lastIndexOf('</div></section>');
      body=body.slice(0,start)+`<details class="browse-details rates-more"><summary>${t(lang,'Deposit, caj tambahan & polisi','Deposit, extra charges & policies')}</summary>`+body.slice(start,end)+'</details>'+body.slice(end);
      break;
    }
    case 'kalendar':{
      body=heading(renderGuestCalendar(lang),'guestCalendarTitle',title);
      body=body.replace(/(<\/h1><\/div><p>)[\s\S]*?(<\/p><\/div>)/,`$1${t(lang,'Pilih bulan untuk semak kekosongan.','Choose a month to check availability.')}$2`);
      const legend=body.match(/<div class="calendar-legend">[\s\S]*?<\/div>/)?.[0];
      if(legend)body=body.replace(legend,'').replace('<div id="calendarGrid"',legend+'<div id="calendarGrid"');
      break;
    }
    case 'kemudahan':body=heading(renderAmenities(lang),'amenitiesTitle',title);break;
    case 'lokasi':body=heading(renderLocation(lang),'locationTitle',title);break;
    case 'faq':body=heading(renderFaq(lang,pageHref('faq',lang)),'faqTitle',title);break;
    case 'hubungi':body=heading(renderEnquiry(lang),'enquiryTitle',t(lang,'Tanya tarikh & harga','Ask about dates & rates'));break;
    case 'maklumat':body=directory(lang);break;
    default:throw Error('Unknown mobile page '+key);
  }
  // Sections are standalone documents here: card headings sit directly below
  // the page's h1 instead of the homepage's section h2.
  body=focusedLinks(body,key,lang).replace(/<h3\b/g,'<h2').replace(/<\/h3>/g,'</h2>');
  const back=`<div class="wrap browse-back"><a href="${homeHref(lang)}">← ${t(lang,'Utama','Home')}</a>${key!=='maklumat'?`<a href="${pageHref('maklumat',lang)}">${t(lang,'Semua maklumat','All information')} ${icon('grid')}</a>`:''}</div>`;
  return layout({lang,title:`${title} | Jitra2Stay`,description:t(lang,`${title} Jitra2Stay di Jitra, Kedah. Lihat maklumat penginapan dan hubungi owner untuk mengesahkan tarikh serta tempahan.`,`${title} at Jitra2Stay in Jitra, Kedah. Explore the homestay and contact the owner to confirm your dates and booking.`),path:pageHref(key,lang),pairedPath:pageHref(key,lang==='en'?'ms':'en'),body:back+body,mobilePage:key});
}
module.exports={renderMobilePage};
