const {routes}=require('../data/mobile-routes.cjs');

// Helpers receive shared render functions to avoid a circular template import.
function mobileNavigation(lang,view,{t,icon,pageHref,homeHref}) {
  const current=['home','gambar','harga','kalendar'].includes(view)?view:'maklumat';
  const tabs=[['home','Utama','Home','home'],['gambar','Gambar','Photos','photos'],['harga','Harga','Rates','bed'],['kalendar','Kalendar','Calendar','calendar'],['maklumat','Lagi','More','grid']];
  return `<nav class="mobile-bottom-nav" aria-label="${t(lang,'Navigasi bawah','Bottom navigation')}">${tabs.map(([key,ms,en,symbol])=>`<a href="${key==='home'?homeHref(lang):pageHref(key,lang)}"${key===current?' aria-current="page"':''}>${icon(symbol)}<span>${t(lang,ms,en)}</span></a>`).join('')}</nav>`;
}
function mobileHome(lang,{t,icon,pageHref}) {
  return `<section class="mobile-home wrap" aria-labelledby="mobileExploreTitle"><h2 id="mobileExploreTitle">${t(lang,'Rancang penginapan anda','Plan your stay')}</h2><div class="mobile-quick-links">${['kalendar','harga','kemudahan','lokasi'].map(key=>`<a href="${pageHref(key,lang)}">${icon(routes[key].icon)}<span>${routes[key][lang]}</span>${icon('arrow')}</a>`).join('')}</div><a class="mobile-house-link" href="${pageHref('rumah',lang)}">${t(lang,'Kenali rumah & kapasiti tetamu','See the house & guest capacity')} ${icon('arrow')}</a></section>`;
}
module.exports={mobileNavigation,mobileHome};
