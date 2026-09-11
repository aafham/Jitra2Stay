"use strict";

const { config, e, t, icon, picture, imageInfo } = require("./shared.cjs");

const categories = [
  { key: "all", ms: "Semua", en: "All photos" },
  { key: "bedrooms", ms: "Bilik tidur", en: "Bedrooms" },
  { key: "shared", ms: "Ruang bersama", en: "Shared spaces" },
  { key: "outside", ms: "Luar rumah", en: "Outside" }
];

function galleryCard(photo, lang) {
  const info = imageInfo(photo.image);
  const full = info.variants.at(-1).src;
  const room=config.rooms.find(item=>item.image===photo.image);
  return `<figure class="gallery-card" data-gallery-category="${e(photo.category)}"><a class="gallery-trigger" href="${e(full)}" data-full="${e(full)}" data-original="${e(info.source)}" data-caption="${e(photo[lang])}" aria-label="${e(t(lang, `Buka gambar: ${photo.ms}`, `Open photo: ${photo.en}`))}">${picture(photo.image, photo[lang])}<span class="photo-expand" aria-hidden="true">↗</span></a><figcaption>${e(room?room[lang][0]:photo[lang])}${room?`<p class="room-description">${e(room[lang][1])}</p>`:''}</figcaption></figure>`;
}

function renderGallery(lang) {
  return `<section class="section wrap" id="galeri" aria-labelledby="galleryTitle">
  <div class="section-heading"><div><p class="eyebrow">${t(lang, "KENALI RUANGNYA", "GET TO KNOW THE SPACE")}</p><h2 id="galleryTitle">${t(lang, "Lihat sebelum menginap.", "A look inside your stay.")}</h2></div><p>${t(lang, "Gambar sebenar rumah, bilik dan ruang bersama. Buka gambar untuk lihat dengan lebih dekat.", "Real photos of the house, bedrooms and shared spaces. Open a photo for a closer look.")}</p></div>
  <div class="room-guide"><h3>${config.business.bedrooms} ${t(lang,'bilik tidur · Rumah dua tingkat','bedrooms · Two-storey house')}</h3><p>${t(lang,'Privasi satu rumah dan self check-in. Pakej 2 bilik menggunakan 2 bilik air; pakej 3–5 bilik menggunakan 3 bilik air, semuanya dengan water heater.','Full-house privacy and self check-in. The 2-room package uses 2 bathrooms; 3–5-room packages use 3 bathrooms, all with water heaters.')}</p></div>
  <div class="gallery-tools" id="galleryControls" hidden><div class="gallery-filters" role="group" aria-label="${t(lang, "Tapis gambar mengikut ruang", "Filter photos by space")}">${categories.map(category => `<button class="gallery-filter" type="button" data-gallery-filter="${category.key}" aria-pressed="${category.key === "all"}" aria-controls="galleryGrid">${e(category[lang])}</button>`).join("")}</div><p class="gallery-results" id="galleryResults" role="status" aria-live="polite" aria-atomic="true"></p></div>
  <div class="gallery-grid" id="galleryGrid">${config.gallery.map(photo => galleryCard(photo, lang)).join("")}</div>
  <div class="gallery-more-control"><button class="gallery-more-button" id="galleryMore" type="button" aria-controls="galleryGrid" aria-expanded="false" hidden>${t(lang, "Lihat lebih banyak gambar", "Show more photos")}</button></div>
  <p class="section-footnote">${t(lang, "Foto sebenar rumah, bilik dan kemudahan Jitra2Stay.", "Real photos of Jitra2Stay’s house, bedrooms and facilities.")}</p>
  </section>
  <dialog id="galleryDialog" class="gallery-dialog" aria-labelledby="galleryCaption">
  <div class="dialog-top"><span id="galleryCount" aria-live="polite" aria-atomic="true"></span><button id="galleryClose" class="icon-button" type="button" aria-label="${t(lang, "Tutup gambar", "Close photo")}">${icon("close")}</button></div>
  <div class="dialog-image" id="galleryImageStage" aria-busy="false"><img id="galleryImage" alt="" width="1600" height="1200" decoding="async" draggable="false" hidden></div>
  <div class="gallery-image-feedback"><p id="galleryImageStatus" class="gallery-image-status" role="status" aria-live="polite" aria-atomic="true"></p><button id="galleryRetry" class="text-button" type="button" hidden>${t(lang, "Cuba lagi", "Try again")}</button></div>
  <div class="dialog-bottom"><button id="galleryPrev" class="icon-button previous" type="button" aria-label="${t(lang, "Gambar sebelumnya", "Previous photo")}">${icon("arrow")}</button><p id="galleryCaption" aria-live="polite"></p><button id="galleryNext" class="icon-button" type="button" aria-label="${t(lang, "Gambar seterusnya", "Next photo")}">${icon("arrow")}</button></div>
  <div class="gallery-dialog-footer"><a id="galleryOriginalLink" class="text-link" href="${e(imageInfo(config.gallery[0].image).source)}" target="_blank" rel="noopener">${t(lang, "Buka gambar asal", "Open original photo")} ${icon("arrow")}</a><p>${t(lang, "Guna anak panah atau leret kiri dan kanan untuk gambar seterusnya.", "Use the arrows or swipe left and right to browse photos.")}</p></div>
  </dialog>`;
}

module.exports = { renderGallery };
