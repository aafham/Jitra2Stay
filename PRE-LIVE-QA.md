# QA release dan peranti sebenar

## Automatik

- npm run build
- npm run qa
- npm run test:unit
- npm test

CI menjalankan semakan sama. Suite browser memintas pembukaan WhatsApp; ia tidak menghantar mesej sebenar. Keputusan implementasi 11 September 2026: 427 statik, 5 unit, 24 browser lulus.

## Selepas deploy

- [ ] Buka homepage BM/EN dan polisi pada Android serta iPhone sebenar.
- [ ] Buka/tutup menu, tukar bahasa/tema, scroll semua section dan zoom teks.
- [ ] Buka foto, next/previous, tutup dan semak fokus keyboard.
- [ ] Semak foto bilik/parking dan pin Maps tepat.
- [ ] Cuba semua CTA WhatsApp, termasuk fallback apabila popup/app tidak terbuka.
- [ ] Isi tarikh valid, checkout salah, tetamu 20/21 dan nota bersimbol; mesej praisi tepat.
- [ ] Ingat mesej hanya dihantar apabila pengguna menekan Send dalam WhatsApp.
- [ ] Semak pada mobile data sebenar dan tanpa JavaScript.
- [ ] Semak raw/tools/docs tidak boleh dicapai pada production dan Pages mirror.
- [ ] Semak URL 404, share preview, canonical, hreflang dan sitemap.
- [ ] Owner sahkan harga/polisi/kemudahan sebelum promosi.

Jangan menandakan ujian peranti/owner sebagai selesai berdasarkan ujian Chrome headless sahaja.
