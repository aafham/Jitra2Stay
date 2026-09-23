const {config,e,t,icon,policyText}=require('./shared.cjs');
function renderStaySummary(lang) {
  const items=config.staySummary.filter(item=>item.key!=='privacy');
  return `<aside class="stay-summary" aria-labelledby="staySummaryTitle"><h3 id="staySummaryTitle">${t(lang,'Sebelum menginap','Before your stay')}</h3><dl>${items.map(item=>{const [title,description]=policyText(item,lang);return `<div data-stay-info="${e(item.key)}"><dt>${e(title)}</dt><dd>${e(description)}</dd></div>`;}).join('')}</dl></aside>`;
}
function renderPropertyLinks(lang) {
  const b=config.business, shareUrl=`${b.siteUrl.replace(/\/$/,'')}/${lang==='en'?'en.html':''}`;
  return `<div class="property-tools"><div class="property-profiles"><a class="text-link" href="${e(b.mapUrl)}" target="_blank" rel="noopener">${t(lang,'Profil & ulasan Google','Google profile & reviews')} ${icon('arrow')}</a><a class="text-link" href="${e(b.facebookUrl)}" target="_blank" rel="noopener">${t(lang,'Foto di Facebook','Photos on Facebook')} ${icon('arrow')}</a></div><div class="share-controls"><button id="shareStay" class="share-button" type="button" data-share-url="${e(shareUrl)}" hidden>${icon('share')}${t(lang,'Kongsi homestay','Share this homestay')}</button><p id="shareFeedback" role="status" aria-live="polite"></p><input id="shareFallback" type="text" readonly hidden aria-label="${t(lang,'Pautan homestay untuk disalin','Homestay link to copy')}"></div></div>`;
}
function renderNearby(lang) {
  return `<div class="nearby-places"><h3>${t(lang,'Tempat berdekatan','Nearby places')}</h3><p class="nearby-note">${t(lang,'Terokai tempat mengikut kawasan dan jenis urusan anda.','Explore places by area and the purpose of your visit.')}</p><div class="nearby-grid">${config.nearby.map(place=>`<details><summary><span class="nearby-time">${e(place[lang][0])}</span><span>${e(place[lang][1])}</span>${icon('arrow')}</summary><p>${e(place[lang][2])}</p></details>`).join('')}</div></div>`;
}
module.exports={renderStaySummary,renderPropertyLinks,renderNearby};
