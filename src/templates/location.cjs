const {config,e,t,icon,timeText,pageHref,address,picture}=require('./shared.cjs');

const {renderNearby}=require('./stay-info.cjs');
const {renderDestinationFinder}=require('./nearby.cjs');

function renderLocation(lang) {
  const b=config.business;
  const waze=new URL('https://www.waze.com/ul');
  waze.searchParams.set('ll',`${b.coordinates.latitude},${b.coordinates.longitude}`);
  waze.searchParams.set('navigate','yes');
  return `<section class="section section-tint" id="lokasi" aria-labelledby="locationTitle">
    <div class="wrap location-layout">
      <div class="location-copy">
        <p class="eyebrow">${icon('pin')} JITRA, KEDAH</p>
        <h2 id="locationTitle">${t(lang,'Jumpa kami<br>di Jitra.','Find us<br>in Jitra.')}</h2>
        <div class="location-address"><address id="stayAddress">${e(b.address.street)}<br>${e(b.address.postalCode)} ${e(b.address.city)}, ${e(b.address.region)}</address><button class="copy-address-button" id="copyAddress" type="button" data-copy-address="${e(address)}" hidden>${t(lang,'Salin alamat','Copy address')}</button></div>
        <p class="copy-address-feedback" id="copyAddressFeedback" role="status" aria-live="polite" aria-atomic="true"></p>
        <div class="address-copy-fallback" id="addressCopyFallback" hidden><label for="addressCopyText">${t(lang,'Alamat untuk disalin','Address to copy')}</label><textarea id="addressCopyText" readonly rows="3" spellcheck="false" aria-describedby="copyAddressFeedback">${e(address)}</textarea></div>
        <p>${t(lang,'Di sebelah pagar sisi Hospital Jitra. Lihat kawasan rumah pada peta, kemudian buka aplikasi pilihan anda untuk panduan perjalanan.','Beside the side fence of Jitra Hospital. Explore the house location on the map, then open your preferred app for directions.')}</p>
        <div class="location-actions" aria-label="${t(lang,'Pilihan navigasi','Navigation options')}">
          <a class="button" data-navigation="google" href="${e(b.mapUrl)}" target="_blank" rel="noopener noreferrer">${icon('pin')} Google Maps ${icon('arrow')}</a>
          <a class="button button-waze" data-navigation="waze" href="${e(waze.href)}" target="_blank" rel="noopener noreferrer">${icon('car')} Waze ${icon('arrow')}</a>
        </div>
        <div class="arrival-times"><div><span>Check-in</span><strong>${timeText(b.checkInTime,lang)}</strong></div><div><span>Check-out</span><strong>${timeText(b.checkOutTime,lang)}</strong></div></div>
      </div>
      <div class="location-map-card">
        <iframe id="locationMapFrame" src="${e(b.mapEmbedUrl)}" title="${t(lang,'Google Maps: lokasi Jitra2Stay','Google Maps: Jitra2Stay location')}" width="600" height="430" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        <div class="map-caption"><span>${icon('pin')} <strong>Jitra2Stay</strong></span><p>${t(lang,'Zum dan gerakkan peta untuk lihat kawasan sekitar.','Zoom and move the map to explore the neighbourhood.')}</p></div>
        <div class="arrival-preview" aria-labelledby="arrivalPreviewTitle">
          <h3 id="arrivalPreviewTitle">${t(lang,'Kenali rumah sebelum tiba','Recognise the house before arrival')}</h3>
          <p>${t(lang,`Kawasan rumah biasanya muat ${b.parkingCars.min} hingga ${b.parkingCars.max} kereta.`,`The house compound usually fits ${b.parkingCars.min} to ${b.parkingCars.max} cars.`)}</p>
          <div class="arrival-photo-grid">${['halaman','parking'].map(image=>{
            const photo=config.gallery.find(item=>item.image===image);
            const label=photo[lang];
            return `<a class="arrival-photo" href="${pageHref('gambar',lang)}?photo=${image}" aria-label="${e(t(lang,`Lihat foto: ${label}`,`View photo: ${label}`))}">${picture(image,photo.alt?.[lang]||label,{sizes:'(max-width: 600px) calc((100vw - 90px) / 2), (max-width: 900px) calc((100vw - 120px) / 2), (max-width: 1280px) calc((100vw - 240px) / 4), 240px'})}<span>${e(label)} ${icon('arrow')}</span></a>`;
          }).join('')}</div>
        </div>
      </div>
      <div class="location-guides">${renderDestinationFinder(lang)}<details class="nearby-original"><summary>${t(lang,'Panduan kawasan','Area guide')}</summary><p class="nearby-note">${t(lang,'Untuk jarak, masa pemanduan dan tarikh semakan destinasi tertentu, rujuk kad laluan di atas.','For a specific destination’s driving distance, time and check date, refer to the route cards above.')}</p>${renderNearby(lang)}</details><h3>${t(lang,'Panduan untuk perjalanan anda','Plan your visit')}</h3><div class="guide-links">${config.guides.map(g=>`<a href="${pageHref(g.slug,lang)}"><span>${e(g[lang][0])}</span>${icon('arrow')}</a>`).join('')}</div></div>
    </div>
  </section>`;
}

module.exports={renderLocation};
