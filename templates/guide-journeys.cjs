const {e,t}=require('./shared.cjs');
const routes=require('../destination-routes.cjs');

// Guide travel estimates use the same dated driving snapshots as the finder.
// Other owner copy is escaped as text; only verified route tokens become links.
function renderGuideJourney(text,lang,stops=[]) {
  const dates=new Set();
  function routeInfo(id) {
    const route=routes[id];
    if(!route||!Number.isFinite(route.durationMinutes)||!Number.isFinite(route.distanceKm)||!route.checkedAt||!route.mapsUrl) throw new Error(`Missing verified guide route: ${id}`);
    dates.add(route.checkedAt);
    return {href:e(route.mapsUrl),estimate:`≈ ${e(route.durationMinutes)} ${t(lang,'minit','min')} (${e(route.distanceKm)} km)`};
  }
  const content=e(text).replace(/\{\{route:([a-z0-9-]+)\}\}/g,(_,id)=>{
    const route=routeInfo(id);
    return `<a href="${route.href}" target="_blank" rel="noopener noreferrer">${route.estimate}</a>`;
  });
  const list=stops.length?`<ul class="guide-journeys">${stops.map(stop=>{
    const route=routeInfo(stop.id);
    return `<li><a href="${route.href}" target="_blank" rel="noopener noreferrer"><span>${e(stop[lang])}</span><span class="guide-journeys-estimate">${route.estimate}</span></a></li>`;
  }).join('')}</ul>`:'';
  const checked=[...dates].sort().map(date=>`<time datetime="${e(date)}">${e(date.split('-').reverse().join('/'))}</time>`).join(t(lang,' dan ',' and '));
  const note=checked?`<p class="small-note guide-route-source">${t(lang,'Anggaran laluan kereta daripada semakan Google Maps pada','Driving-route estimates checked in Google Maps on')} ${checked}. ${t(lang,'Laluan, pintu masuk dan trafik boleh mengubah masa perjalanan. Tekan anggaran untuk semak laluan semasa.','Routes, entrances and traffic can change journey times. Select an estimate to check the current route.')}</p>`:'';
  return `<p>${content}</p>${list}${note}`;
}

module.exports={renderGuideJourney};
