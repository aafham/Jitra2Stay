'use strict';

const {config,e,t,icon}=require('./shared.cjs');
const destinations=require('../destinations.cjs');
const categories=require('../destination-categories.cjs');
const routes=require('../destination-routes.cjs');

function directionsUrl(destination) {
  const route=routes[destination.id];
  if(route?.mapsUrl) return route.mapsUrl;
  if(destination.locationNote) {
    const search=new URL('https://www.google.com/maps/search/');
    search.searchParams.set('api','1');
    search.searchParams.set('query',destination.query);
    return search.href;
  }
  const url=new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api','1');
  url.searchParams.set('origin',`${config.business.coordinates.latitude},${config.business.coordinates.longitude}`);
  url.searchParams.set('destination',destination.query);
  url.searchParams.set('travelmode','driving');
  return url.href;
}

function renderDestinationFinder(lang) {
  const filters=[{id:'all',ms:'Semua',en:'All'},...categories];
  return `<div class="destination-finder" aria-labelledby="destinationsTitle">
    <h3 id="destinationsTitle">${t(lang,'Nak ke mana dari homestay?','Where are you heading from the homestay?')}</h3>
    <p class="destination-intro">${t(lang,'Terokai tempat mengikut kategori atau cari nama destinasi. Buka laluan pemanduan terus dari Jitra2Stay.','Explore places by category or search for a destination. Open driving directions straight from Jitra2Stay.')}</p>
    <div id="destinationControls" class="destination-controls" hidden>
      <label for="destinationSearch">${t(lang,'Cari destinasi','Find a destination')}</label>
      <div class="destination-search-row"><input type="search" id="destinationSearch" placeholder="${t(lang,'Contoh: UUM, POLIMAS, Dewan Jitra','Try: UUM, POLIMAS, Dewan Jitra')}" autocomplete="off" aria-controls="destinationsList" aria-describedby="destinationFilterHint destinationResults"><button id="destinationClear" class="text-button" type="button" hidden>${t(lang,'Set semula','Reset filters')}</button></div>
      <p id="destinationCategoryLabel" class="destination-category-label">${t(lang,'Kategori tempat','Place categories')}</p>
      <div class="destination-categories" role="group" aria-labelledby="destinationCategoryLabel">${filters.map(category=>`<button type="button" data-destination-category="${e(category.id)}" aria-controls="destinationsList" aria-pressed="${category.id==='all'}">${e(category[lang])}</button>`).join('')}</div>
      <p id="destinationFilterHint" class="destination-filter-hint">${t(lang,'Carian mengikut kategori yang dipilih.','Search within the selected category.')}</p>
    </div>
    <p id="destinationResults" class="destination-results" role="status" aria-live="polite" aria-atomic="true"></p>
    <div id="destinationsList" class="destinations-list">${destinations.map(destination=>{
      const route=routes[destination.id];
      const verified=Boolean(route&&Number.isFinite(route.distanceKm)&&Number.isFinite(route.durationMinutes));
      const kinds=categories.filter(category=>destination.categories.includes(category.id));
      const categorySearch=kinds.map(category=>`${category.id} ${category.ms} ${category.en}`).join(' ');
      return `<article class="destination-card" data-destination-id="${e(destination.id)}" data-destination-categories="${e(destination.categories.join(' '))}" data-destination-search="${e(`${destination.ms} ${destination.en} ${destination.aliases} ${route?.destination||''} ${categorySearch}`)}"><p class="destination-kind">${e(kinds.map(category=>category[lang]).join(' · '))}</p><h4>${e(destination[lang])}</h4>${verified?`<p class="destination-distance"><strong>${e(route.distanceKm)} km</strong><span>≈ ${e(route.durationMinutes)} ${t(lang,'minit memandu','min drive')}</span></p><p class="destination-route">${t(lang,'Melalui','Via')} ${e(route.routeLabel)}${route.tollsWarningDisplayed?` <span class="destination-toll">${t(lang,'Ada tol','Tolls')}</span>`:''}</p><p class="destination-source">Google Maps · <time datetime="${e(route.checkedAt)}">${e(route.checkedAt.split('-').reverse().join('/'))}</time></p>`:`<p class="destination-unchecked">${e(destination.locationNote?.[lang]||t(lang,'Lihat jarak dan masa semasa di Google Maps.','See current distance and travel time in Google Maps.'))}</p>`}<a class="text-link" href="${e(directionsUrl(destination))}" target="_blank" rel="noopener noreferrer" aria-label="${e(!verified&&destination.locationNote?t(lang,`Cari ${destination.ms} dalam Google Maps`,`Find ${destination.en} in Google Maps`):t(lang,`Laluan dari Jitra2Stay ke ${destination.ms}`,`Directions from Jitra2Stay to ${destination.en}`))}">${!verified&&destination.locationNote?t(lang,'Pilih lokasi di Maps','Choose a location in Maps'):t(lang,'Laluan dari homestay','Directions from homestay')} ${icon('arrow')}</a></article>`;
    }).join('')}</div>
    <p id="destinationEmpty" class="destination-empty" hidden>${t(lang,'Tiada padanan dalam senarai ini. Cuba nama ringkas atau padam carian untuk lihat semua tempat.','No matches in this list. Try a shorter name or clear the search to see every place.')}</p>
    <button id="destinationsMore" class="destination-more" type="button" aria-controls="destinationsList" aria-expanded="false" hidden>${t(lang,'Lihat semua destinasi','Show all destinations')}</button>
    <p class="destination-note">${t(lang,'Jarak dan masa yang dipaparkan ialah anggaran laluan kereta ketika semakan Google Maps, bukan jarak garis lurus. Laluan, pintu masuk dan trafik boleh mengubah perjalanan; semak destinasi dalam Maps sebelum bertolak.','Shown distances and times are driving-route estimates observed in Google Maps, not straight-line distances. Routes, entrances and traffic may change your journey; check the destination in Maps before leaving.')}</p>
  </div>`;
}
module.exports={renderDestinationFinder,directionsUrl};
