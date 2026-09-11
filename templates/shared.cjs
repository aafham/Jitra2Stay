const config = require('../site.config.cjs');
const manifest = require('../images/responsive/manifest.json');
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t = (lang, ms, en) => lang === 'en' ? en : ms;
const homeHref = lang => lang === 'en' ? 'en.html' : './';
const pageHref = (slug, lang) => `${slug}${lang === 'en' ? '-en' : ''}.html`;
const money = number => `RM${Number(number).toLocaleString('en-MY')}`;
const address = `${config.business.address.street}, ${config.business.address.postalCode} ${config.business.address.city}, ${config.business.address.region}`;
const wa = (lang, message) => `https://wa.me/${config.business.phone}?text=${encodeURIComponent(message || t(lang, 'Hai Jitra2Stay, saya nak tanya tarikh dan pakej homestay.', 'Hi Jitra2Stay, I would like to ask about dates and room packages.'))}`;
function icon(name) {
  const shapes = {
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 11 6-4m-6 6 6 4"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    bed: '<path d="M3 18V8m18 10V8M3 14h18M3 18v3m18-3v3M5 14V6h14v8M7 10h3m4 0h3"/>',
    bath: '<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3ZM6 12V5a3 3 0 0 1 6 0M6 20v2m12-2v2"/>',
    wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r="1"/>',
    home: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
    car: '<path d="m4 9 2-6h12l2 6M3 9h18v9H3V9Zm2 9v3m14-3v3M6 13h2m8 0h2"/>',
    kitchen: '<path d="M5 3v7m3-7v7M2 3v7a3 3 0 0 0 6 0M5 13v8M18 3c-3 4-3 8 0 9V3Zm0 9v9"/>',
    people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M16 4a3 3 0 0 1 0 6m3 11v-4a5 5 0 0 0-3-4"/>',
    phone: '<path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c0 3-2 5-5 4C8 19 4 15 3 7c-1-3 1-4 4-4Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.home}</svg>`;
}
function imageInfo(name) {
  const item = manifest.images.find(i => i.source === `images/${name}.jpg`);
  if (!item) throw new Error(`Missing image manifest: ${name}`);
  return item;
}
function picture(name, alt, {hero=false, sizes='(max-width: 600px) calc((100vw - 48px) / 2), (max-width: 900px) calc((100vw - 80px) / 2), 360px', className=''}={}) {
  const info=imageInfo(name);
  const srcset=info.variants.map(v=>`${v.src} ${v.width}w`).join(', ');
  return `<picture${className?` class="${e(className)}"`:''}><source type="image/webp" srcset="${srcset}" sizes="${e(sizes)}"><img src="${e(info.source)}" width="${info.width}" height="${info.height}" alt="${e(alt)}" loading="${hero?'eager':'lazy'}" decoding="async"${hero?' fetchpriority="high"':''}></picture>`;
}
function timeText(value, lang) {
  const [h,m]=value.split(':').map(Number), hour=h%12||12;
  return lang==='en' ? `${hour}${m?':'+String(m).padStart(2,'0'):''} ${h<12?'am':'pm'}` : `${hour}${m?'.'+String(m).padStart(2,'0'):''} ${h<12?'pagi':h===12?'tengah hari':h<19?'petang':'malam'}`;
}
function policyText(item, lang) {
  const values={...config.business, checkInTime:timeText(config.business.checkInTime,lang), checkOutTime:timeText(config.business.checkOutTime,lang)};
  return item[lang].map(text=>text.replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(values[key]===undefined)throw new Error(`Unknown content token ${key}`);return values[key];}));
}
const policy = (key, lang) => policyText(config.policies.find(p=>p.key===key),lang);
function header(lang, pairedPath, isHome) {
  pairedPath = pairedPath || './';
  const home=homeHref(lang), target=id=>isHome?`#${id}`:`${home}#${id}`;
  return `<header class="site-header"><div class="header-inner wrap">
    <a class="brand" href="${isHome?'#home':home}" aria-label="Jitra2Stay ${t(lang,'laman utama','home')}">${icon('home')}<span>Jitra2Stay<span class="brand-place">JITRA, KEDAH</span></span></a>
    <div class="header-controls"><button id="themeToggle" class="icon-button" type="button" hidden aria-label="${t(lang,'Tukar tema','Change theme')}" aria-pressed="false">${icon('sun')}</button><button id="menuToggle" class="icon-button" type="button" hidden aria-label="${t(lang,'Buka menu','Open menu')}" aria-controls="mainNav" aria-expanded="false">${icon('menu')}</button></div>
    <nav id="mainNav" aria-label="${t(lang,'Navigasi utama','Main navigation')}">
      <a href="${target('tentang')}">${t(lang,'Rumah','The house')}</a><a href="${target('galeri')}">${t(lang,'Gambar','Photos')}</a><a href="${target('kadar')}">${t(lang,'Harga','Rates')}</a><a href="${target('kemudahan')}">${t(lang,'Kemudahan','Amenities')}</a><a href="${target('lokasi')}">${t(lang,'Lokasi','Location')}</a>
      <div class="language-links" aria-label="${t(lang,'Bahasa','Language')}"><a href="${lang==='ms'?(isHome?'./':'#mainContent'):pairedPath}" lang="ms" hreflang="ms"${lang==='ms'?' aria-current="page"':''}>BM</a><a href="${lang==='en'?(isHome?'en.html':'#mainContent'):pairedPath}" lang="en" hreflang="en"${lang==='en'?' aria-current="page"':''}>EN</a></div>
      <a class="button button-small" href="${wa(lang)}" target="_blank" rel="noopener">WhatsApp ${icon('arrow')}</a>
    </nav></div></header>`;
}
function footer(lang, isHome=false) {
  return `<footer class="site-footer">
    <div class="wrap footer-grid">
      <div class="footer-intro"><a class="footer-brand" href="${homeHref(lang)}">Jitra2Stay</a><p>${t(lang,'Rumah untuk keluarga.<br>Di Jitra, Kedah.','A home for your family.<br>In Jitra, Kedah.')}</p></div>
      <div class="footer-contact"><h2>${t(lang,'Hubungi owner','Contact the owner')}</h2><ul class="footer-links"><li><a href="tel:+${config.business.phone}">${e(config.business.phoneDisplay)}</a></li><li><a class="footer-secondary-phone" href="tel:+${config.business.secondaryPhone}"><span>${e(config.business.secondaryPhoneDisplay)}</span><span class="footer-link-note">${t(lang,'(panggilan)','(calls)')}</span></a></li><li><a href="mailto:${e(config.business.email)}">${e(config.business.email)}</a></li></ul></div>
      <nav class="footer-stay" aria-labelledby="footerStayTitle"><h2 id="footerStayTitle">${t(lang,'Penginapan','Your stay')}</h2><ul class="footer-links"><li><a href="${pageHref('policies',lang)}">${t(lang,'Polisi & house rules','Policies & house rules')}</a></li><li><a href="${homeHref(lang)}#faq">${t(lang,'Soalan lazim','Common questions')}</a></li><li><a href="${config.business.mapUrl}" target="_blank" rel="noopener">Google Maps ${icon('arrow')}</a></li><li><a href="${homeHref(lang)}#semak-tarikh">${t(lang,'Tanya tarikh','Ask about dates')}</a></li></ul></nav>
    </div>
    <div class="wrap footer-bottom"><div class="footer-legal"><span>© ${new Date().getUTCFullYear()} Jitra2Stay</span><span>${t(lang,'Tarikh dan tempahan disahkan oleh owner.','Dates and bookings are confirmed by the owner.')}</span></div><a class="footer-back-top" href="#mainContent">${t(lang,'Kembali ke atas','Back to top')} ${icon('arrow')}</a></div>
  </footer>
    <div class="mobile-action-bar"><a class="rate-shortcut" href="${isHome?'':homeHref(lang)}#kadar">${icon('bed')}<span>${t(lang,'Lihat harga','View rates')}</span></a><a class="mobile-whatsapp" href="${wa(lang)}" target="_blank" rel="noopener"><span class="mobile-wa-label">WhatsApp</span> ${icon('arrow')}</a></div>`;
}
function layout({lang='ms', title, description, path='', pairedPath='en.html', body, isHome=false, noindex=false}) {
  const origin=config.business.siteUrl.replace(/\/$/,'');
  const canonical=`${origin}/${path}`;
  const msPath=lang==='ms'?path:pairedPath, enPath=lang==='en'?path:pairedPath;
  const b=config.business;
  const graph=[{'@type':'WebSite','@id':`${origin}/#website`,url:`${origin}/`,name:b.name,inLanguage:['ms','en']},{'@type':'WebPage','@id':`${canonical}#page`,url:canonical,name:title,description,inLanguage:lang,isPartOf:{'@id':`${origin}/#website`}}];
  if(isHome) graph.push({'@type':'LodgingBusiness','@id':`${origin}/#homestay`,name:b.name,url:`${origin}/`,description,image:`${origin}/images/halaman.jpg`,telephone:`+${b.phone}`,email:b.email,priceRange:`RM${config.rates[0].price}–RM${config.rates.at(-1).price}`,address:{'@type':'PostalAddress',streetAddress:b.address.street,addressLocality:b.address.city,addressRegion:b.address.region,postalCode:b.address.postalCode,addressCountry:b.address.country},checkinTime:b.checkInTime,checkoutTime:b.checkOutTime,hasOfferCatalog:{'@type':'OfferCatalog',name:t(lang,'Pakej bilik','Room packages'),itemListElement:config.rates.map(rate=>({'@type':'Offer',price:rate.price,priceCurrency:'MYR',description:t(lang,`Kadar asas semalam; ${rate.rooms} bilik. Sahkan tarikh dan harga akhir dengan owner.`,`Base nightly rate for ${rate.rooms} rooms. Confirm dates and final price with the owner.`),itemOffered:{'@type':'Service',name:t(lang,`${rate.rooms} bilik`,`${rate.rooms} rooms`)}}))}});
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(title)}</title><meta name="description" content="${e(description)}"><meta name="robots" content="${noindex?'noindex,follow':'index,follow'}"><meta name="referrer" content="strict-origin-when-cross-origin"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#174b3a"><meta name="format-detection" content="telephone=no"><link rel="canonical" href="${e(canonical)}">
${noindex?'':`<link rel="alternate" hreflang="ms" href="${origin}/${e(msPath)}"><link rel="alternate" hreflang="en" href="${origin}/${e(enPath)}"><link rel="alternate" hreflang="x-default" href="${origin}/${e(msPath)}">`}
<meta property="og:type" content="website"><meta property="og:site_name" content="Jitra2Stay"><meta property="og:locale" content="${lang==='en'?'en_MY':'ms_MY'}"><meta property="og:url" content="${e(canonical)}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:image" content="${origin}/images/halaman.jpg"><meta property="og:image:alt" content="${t(lang,'Hadapan rumah Jitra2Stay','Jitra2Stay house exterior')}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(description)}"><meta name="twitter:image" content="${origin}/images/halaman.jpg"><meta name="twitter:image:alt" content="${t(lang,'Hadapan rumah Jitra2Stay','Jitra2Stay house exterior')}"><link rel="icon" href="images/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="navigation.css"><link rel="stylesheet" href="documents.css">${isHome?'<link rel="stylesheet" href="gallery.css"><link rel="stylesheet" href="rates.css"><link rel="stylesheet" href="faq.css"><link rel="stylesheet" href="location.css">':''}<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script><script defer src="app.config.js"></script><script defer src="app.js"></script><script defer src="navigation.js"></script>${isHome?'<script defer src="gallery.js"></script><script defer src="share.js"></script><script defer src="faq.js"></script><script defer src="location.js"></script>':''}</head>
<body><a class="skip-link" href="#mainContent">${t(lang,'Terus ke kandungan','Skip to content')}</a>${header(lang,pairedPath,isHome)}<main id="mainContent" tabindex="-1">${body}</main>${footer(lang,isHome)}</body></html>`;
}
module.exports={config,e,t,homeHref,pageHref,money,address,wa,icon,picture,imageInfo,timeText,policy,policyText,layout};
