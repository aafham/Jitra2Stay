# Jitra2Stay Website

Website static untuk promosi homestay Jitra2Stay di Jitra, Kedah.

Tujuan website ini sangat direct:
- Visitor view detail rumah, harga, kemudahan, gambar bilik/ruang, lokasi, polisi, dan tarikh rujukan.
- Visitor isi borang ringkas atau tekan CTA untuk terus WhatsApp.
- Owner semak pertanyaan, confirm tarikh, beri arahan bayaran, dan urus payment secara manual melalui WhatsApp.
- Website ini **tiada login admin, tiada login user, tiada dashboard, dan tiada payment gateway dalam website**.

## Status Semasa

Current build status: **ready for owner data, phone test, and deploy**.

QA automatik terakhir: `node tools/qa-check.js` pass **55 checks** pada 2026-05-18.

Yang sudah ada:
- [x] Homepage lengkap dengan hero, harga, cara tempah, form semak tarikh, galeri, lokasi, FAQ, dan CTA WhatsApp.
- [x] Halaman SEO tambahan untuk Hospital Jitra, konvokesyen UUM, keluarga besar dan tempat sekitar Jitra.
- [x] BM/EN toggle.
- [x] Dark/light mode.
- [x] Dark/light mode contrast dikemaskan supaya tulisan dan card boleh dibaca.
- [x] Availability board sebagai rujukan tarikh tidak tersedia.
- [x] Calendar preview 2 bulan.
- [x] Halaman polisi.
- [x] Halaman thank-you selepas klik WhatsApp.
- [x] SEO asas: canonical, sitemap, robots, meta description, Open Graph, Twitter image, dan JSON-LD LodgingBusiness/WebSite/WebPage/FAQPage.
- [x] SEO teknikal diperkemas dengan color-scheme, theme-color dark/light, dan structured data pakej harga.
- [x] Copy utama dipolish untuk flow view-only + direct WhatsApp.
- [x] Semakan mobile headless dibuat untuk hero, highlight, harga, lokasi, FAQ, dan sticky WhatsApp.
- [x] Tiada admin/login/user account dalam flow website.
- [x] Fail `admin.html` dibuang.
- [x] Owner editor, password, dan admin update logic dibuang daripada public website.
- [x] Anggaran harga automatik dalam form ikut bilangan malam dan pakej bilik.

Yang masih perlu dibuat sebelum live:
- [x] Data asas rumah, harga, polisi PDF dan lokasi utama sudah dimasukkan.
- [x] Masukkan gambar latest pilihan untuk hero, gallery, ruang tamu, ruang makan, pantry, bilik, parking, dan exterior.
- [ ] Tambah gambar semua bilik air dan label semua 5 bilik satu per satu bila owner beri gambar final.
- [x] Compress gambar sedia ada untuk prestasi mobile.
- [x] Sediakan versi WebP untuk gambar semasa dan fallback JPG.
- [ ] Test akhir di phone sebenar dan mobile data.
- [ ] Test WhatsApp link dari phone sebenar.
- [ ] Submit sitemap ke Google Search Console selepas domain live.

## Stack Ringkas

- `index.html` - halaman utama dan semua section public.
- `style.css` - styling, tema, responsive layout, mobile UI.
- `app.js` - menu, language/theme toggle, calendar, form WhatsApp, analytics event ringan, gallery lightbox.
- `app.config.js` - konfigurasi business, analytics, ICS calendar optional, video URL optional, dan tarikh tidak tersedia.
- `policies.html` - polisi tempahan, house rules, dan privasi ringkas.
- `thank-you.html` - halaman selepas klik/submit WhatsApp.
- `404.html` - fallback page jika URL salah atau page tidak dijumpai.
- `ms.html` / `en.html` - redirect/landing bahasa.
- `robots.txt` / `sitemap.xml` - SEO crawler.
- `OWNER-DATA-CHECKLIST.md` - checklist data sebenar yang owner perlu beri untuk final update.
- `CONTENT-REVIEW.md` - checklist approval ayat public oleh owner.
- `PRE-LIVE-QA.md` - checklist ringkas sebelum upload/deploy live.
- `CHANGELOG.md` - ringkasan perubahan penting yang sudah dibuat.
- `MAINTENANCE.md` - guide update harga, gambar, polisi, tarikh dan SEO selepas live.
- `QA-REPORT.md` - laporan QA automatik terakhir dan baki manual test.
- `HANDOVER.md` - ringkasan handover untuk owner/developer lain.
- `DEPLOYMENT.md` - guide deploy static website.
- `SEO-SUBMISSION.md` - guide submit sitemap dan semak SEO selepas domain live.
- `IMAGE-AUDIT.md` - audit saiz gambar semasa dan checklist gambar latest.
- `tools/qa-check.js` - QA automatik untuk link, image, sitemap, metadata, dan page load.
- `images/` - gambar homestay yang sudah dioptimize untuk website.
- `source-images/latest-raw/` - raw gambar/video asal untuk simpanan, jangan upload sebagai public website.

## Jalankan Secara Local

Pilihan cepat:
- Buka `index.html` terus di browser.

Pilihan disarankan:

```powershell
python -m http.server 5500
```

Lepas itu buka:

```text
http://localhost:5500
```

QA automatik:

```powershell
node tools/qa-check.js
```

## Deploy

Boleh deploy sebagai static site di:
- Vercel
- Netlify
- cPanel/shared hosting
- GitHub Pages

Pastikan semua fail root dan folder `images/` ikut upload sekali.

## Konfigurasi Website Public

Edit `app.config.js`:

- [x] Set `business.phone` kepada nombor WhatsApp rasmi.
- [x] Set `business.siteUrl` kepada domain sebenar.
- [x] Set `business.image` kepada URL penuh gambar hero/thumbnail.
- [x] Set `business.description` dengan ayat final.
- [x] Buang `ownerPassword`.
- [x] Buang `ownerApiEndpoint`.
- [x] Pastikan tiada login/admin config dalam website.
- [ ] Set `bookingCalendarIcsUrl` jika mahu paparan tarikh rujukan sync daripada Google Calendar/OTA.
- [ ] Set `walkthroughVideoUrl` bila video siap.
- [ ] Set `gaMeasurementId` atau `plausibleDomain` jika mahu analytics production.
- [ ] Update `unavailableRanges` dengan tarikh sebenar bila owner beri senarai booking terkini.

Fail lain yang perlu selari dengan domain:
- [x] `index.html` canonical dan hreflang.
- [x] `sitemap.xml`.
- [x] `robots.txt`.
- [x] Open Graph image absolute URL.
- [x] Semua WhatsApp link guna nombor sama.

## Checklist P0 - Wajib Sebelum Website Diguna Tetamu

### 1. Kandungan Homestay

- [x] Sahkan nama rasmi dalam website: `Jitra2Stay`.
- [x] Sahkan alamat penuh dan pin Google Maps tepat.
- [x] Sahkan nombor WhatsApp/Call dalam website: `+60 19-441 0666`.
- [x] Sahkan email dalam website: `jitra2stay@gmail.com`.
- [x] Nyatakan jenis rumah: Semi-D 2 tingkat.
- [x] Nyatakan jumlah bilik tidur: 5.
- [x] Nyatakan jumlah bilik air: 3.
- [x] Sahkan kapasiti maksimum: 20 tetamu termasuk kanak-kanak.
- [x] Nyatakan caj lebih tetamu: RM10 seorang.
- [ ] Sahkan parking muat berapa kereta secara tepat.
- [x] Sahkan kemudahan daripada PDF: fully aircond, WiFi, pantry/basic facilities, water heater, extra tilam, bantal, comforter.
- [ ] Sahkan kemudahan tambahan jika ada: TV, parking, mesin basuh, peti ais, penapis air, iron, toiletries, rice cooker, microwave.
- [x] Tulis nota video dengan jelas: video sedang dikemas kini, galeri foto jadi rujukan sementara.
- [x] Pastikan BM dan EN utama sama maksud.

### 2. Harga dan Polisi

- [x] Nyatakan harga 2 bilik: RM180/malam.
- [x] Nyatakan harga 3 bilik: RM230/malam.
- [x] Nyatakan harga 4 bilik: RM280/malam.
- [x] Nyatakan harga 5 bilik: RM330/malam.
- [x] Nyatakan deposit keselamatan RM100.
- [x] Bezakan deposit keselamatan dan deposit booking jika kedua-duanya berbeza.
- [ ] Nyatakan sama ada harga berubah pada cuti sekolah, cuti umum, konvokesyen, atau peak season.
- [x] Nyatakan caj extra guest: RM10 seorang.
- [x] Nyatakan caj check-in awal/check-out lewat: RM20/jam jika diluluskan.
- [x] Nyatakan refund policy dengan lebih lengkap jika mahu lebih tegas.
- [x] Nyatakan polisi tukar tarikh.
- [x] Nyatakan kaedah bayaran: bank transfer, DuitNow QR, cash, atau lain-lain.
- [x] Nyatakan bila tempahan dianggap sah.
- [x] Nyatakan check-in 3:00 PM dan check-out 12:00 PM.

### 3. Booking / WhatsApp Flow

- [x] Semua CTA utama direct ke WhatsApp.
- [x] Semua link WhatsApp guna nombor sama.
- [x] Form WhatsApp auto-filled dengan check-in, check-out, guests, rooms, purpose, notes.
- [x] Form reject checkout sebelum check-in.
- [x] Form date lebih kemas: check-out minimum automatik sehari selepas check-in.
- [x] Form warn jika tarikh bertindih dengan unavailable dates.
- [x] Tambah arahan selepas WhatsApp: owner akan semak slot dan reply secepat mungkin.
- [x] Thank-you page beri arahan sambung WhatsApp.
- [x] Audit automatik local untuk CTA WhatsApp, form validation, lightbox, map, BM/EN, dan dark/light.
- [ ] Test semua CTA WhatsApp di phone sebenar.
- [ ] Test submit form dari phone sebenar.
- [x] Tambah butang "Open Maps" selepas alamat final disahkan.

### 4. Tarikh Tidak Tersedia

- [x] Buang label "(Contoh)" pada availability board.
- [x] Paparkan tarikh sebagai rujukan sahaja dan minta pengesahan akhir melalui WhatsApp.
- [x] Buang owner/admin edit tarikh daripada website.
- [ ] Update `unavailableRanges` dengan tarikh sebenar bila owner beri tarikh.
- [ ] Sambung `bookingCalendarIcsUrl` kepada Google Calendar/OTA calendar jika mahu paparan rujukan lebih mudah.
- [x] Tetapkan proses operasi manual: bila booking confirm, owner update rekod sendiri dan maklum pelanggan melalui WhatsApp.

### 5. Admin / Login

- [x] Tiada login admin.
- [x] Tiada login user.
- [x] Tiada frontend password.
- [x] Tiada owner editor dalam website public.
- [x] `admin.html` dibuang.
- [x] Checklist security admin lama tidak lagi relevan untuk scope website view-only.

### 6. Mobile UI

- [x] Betulkan overflow hero/header mobile.
- [x] Pastikan mobile sticky WhatsApp muncul.
- [x] Pastikan floating WhatsApp/back-to-top tidak bertindih di mobile.
- [x] Semak viewport mobile kecil secara headless.
- [x] Pastikan pricing cards mudah dibaca tanpa horizontal scroll dalam semakan headless.
- [x] Ringkaskan teks pricing cards supaya layout desktop/dark mode nampak kemas.
- [x] Pastikan highlight, harga, lokasi dan FAQ readable dalam dark mode.
- [x] Tambah final dark-mode override di hujung CSS supaya desktop styling tidak override warna dark mode.
- [ ] Test di iPhone/Android sebenar.
- [ ] Pastikan date form input selesa di phone sebenar.
- [x] Pastikan gallery image nampak baik dengan gambar latest sebenar.

### 7. SEO dan Share Preview

- [x] Semak title page: `Jitra2Stay | Homestay Semi-D 2 Tingkat di Jitra`.
- [x] Semak meta description tidak terlalu panjang.
- [x] Gunakan absolute URL untuk `og:image`.
- [x] Tambah `og:url`, `og:site_name`, `og:image:alt`, `twitter:image:alt`.
- [x] Tambah JSON-LD `WebSite`, `WebPage`, dan `FAQPage`.
- [x] Tambah JSON-LD offer catalog untuk pakej 2, 3, 4, dan 5 bilik.
- [x] Tambah meta `color-scheme`, theme color dark/light, dan format detection untuk UI browser yang lebih konsisten.
- [x] Update `sitemap.xml` dengan URL domain sebenar.
- [x] Update `robots.txt` dengan sitemap domain sebenar.
- [x] Update `lastmod` sitemap kepada `2026-05-18`.
- [ ] Test WhatsApp/Facebook preview dengan URL live.
- [ ] Submit sitemap ke Google Search Console.
- [ ] Daftar/kemas kini Google Business Profile.
- [ ] Pastikan nama, alamat, dan telefon konsisten antara website dan Google Business Profile.

### 8. Prestasi Gambar

- [x] Compress semua gambar sedia ada dalam `images/`.
- [x] Sediakan versi WebP untuk gambar semasa dan kekalkan JPG sebagai fallback.
- [x] Pastikan hero image tidak terlalu berat untuk versi gambar semasa.
- [x] Pastikan width/height gambar sedia ada sepadan dengan saiz sebenar.
- [x] Tambah gambar latest untuk hero, ruang tamu, ruang makan, pantry, bilik tidur, parking, exterior, dan kawasan luar.
- [x] Elakkan gambar gelap atau blur untuk gambar yang dipilih masuk website.
- [x] Pastikan gambar menunjukkan keadaan sebenar rumah.
- [ ] Tambah gambar semua 3 bilik air dan semua 5 bilik dengan label final.

## Checklist P1 - Improve Conversion Lepas P0

- [x] Tukar claim "Pilihan Popular Keluarga di Jitra" kepada claim yang lebih selamat.
- [x] Tukar respon "5-15 minit" kepada "biasanya respon pantas".
- [x] Jangan guna testimoni contoh sebagai review sebenar.
- [x] Tukar bahagian trust kepada selling points selamat sementara tunggu testimoni sebenar.
- [x] Polish ayat harga, deposit, booking manual, video note, dan trust section.
- [x] Sembunyikan section video daripada homepage sehingga video sebenar tersedia.
- [x] Tukar FAQ kepada accordion compact satu lajur supaya page lebih minimal dan mudah scan.
- [x] Kemas kini FAQ kepada layout desktop 2 kolum, item terbuka full-width, dan CTA WhatsApp ringkas.
- [x] Kemas kini UI section Tentang Homestay dengan overview card, highlight pills, stats ringkas, dan photo badge.
- [x] Kemas kini UI Semak Tarikh dengan booking panel, summary sticky, dan availability board lebih kemas.
- [x] Kemas kini UI Lokasi dengan alamat card, CTA Maps/WhatsApp, dan point lokasi ringkas.
- [x] Kemas kini UI Kemudahan kepada kategori mudah scan.
- [x] Betulkan layout Kemudahan supaya icon, tajuk dan teks tidak bertindih di desktop/dark mode.
- [x] Betulkan contrast badge/chip dark mode, termasuk badge "Paling Popular".
- [x] Kemas kini UI final CTA dan footer supaya lebih ringkas, fokus, dan tidak terlalu berat.
- [x] Buat QA statik light/dark/mobile, tambah mobile polish akhir, dan selaraskan semua WhatsApp CTA dengan mesej default.
- [x] Tambah ringkasan "Selepas WhatsApp" supaya flow semak slot, bayaran, dan confirmation lebih jelas.
- [x] Kemas kini aksesibiliti asas: nav label, skip target focus, FAQ aria-controls/hidden state, dan form described-by.
- [x] Cleanup CSS token `--border` supaya card/FAQ konsisten untuk light dan dark mode.
- [x] Betulkan SEO heading structure: hero menjadi `h1` utama dan logo bukan heading utama.
- [x] Polish micro-copy untuk harga, cara tempah, form tarikh, dan nota tambahan supaya lebih jelas untuk tetamu.
- [x] Tambah polish spacing mobile akhir untuk section, form, card grid, dan hero.
- [x] Polish UI `policies.html` supaya selari dengan homepage dan ada CTA WhatsApp.
- [x] Polish UI `thank-you.html` supaya flow selepas WhatsApp lebih jelas.
- [x] Tambah `OWNER-DATA-CHECKLIST.md`.
- [x] Tambah `PRE-LIVE-QA.md`.
- [x] Tambah local SEO intent section untuk Hospital Jitra, keluarga besar, kenduri dan konvokesyen.
- [x] Tambah FAQ search-intent: Hospital Jitra, konvokesyen, sewa ikut bilik, dan last-minute booking.
- [x] Tambah `CHANGELOG.md`.
- [x] Tambah `tools/qa-check.js` untuk QA teknikal automatik.
- [x] Tambah `DEPLOYMENT.md`.
- [x] Tambah `SEO-SUBMISSION.md`.
- [x] Tambah `IMAGE-AUDIT.md`.
- [x] Tambah `CONTENT-REVIEW.md`.
- [x] Tambah `MAINTENANCE.md`.
- [x] Tambah `QA-REPORT.md`.
- [x] Tambah `HANDOVER.md`.
- [x] Tambah current build status dalam README.
- [x] Tambah QA sensitive-info untuk public files.
- [x] Tambah QA consistency pasangan BM/EN attributes.
- [x] Tambah no-JS fallback dengan CTA WhatsApp.
- [x] Tambah `404.html`.
- [x] Tambah print-friendly style untuk `policies.html`.
- [x] Tambah referrer policy meta untuk page utama, polisi, thank-you dan 404.
- [x] Update `tools/qa-check.js` untuk check no-JS, 404, referrer policy dan print style.
- [ ] Tambah testimoni sebenar jika ada izin.
- [ ] Tambah screenshot review jika ada izin.
- [ ] Tambah rating Google/Facebook jika ada.
- [x] Tambah copy promosi untuk pelanggan keluarga, kenduri, konvo, hospital dan rombongan.
- [x] Tambah "Apa perlu bawa": IC, deposit, barang peribadi, makanan sendiri jika masak.
- [x] Tambah FAQ: boleh bawa haiwan peliharaan atau tidak.
- [x] Tambah FAQ: ada water heater atau tidak.
- [x] Tambah FAQ: boleh buat majlis kecil atau tidak.
- [x] Tambah FAQ: ada towel/toiletries atau tidak.
- [x] Tambah FAQ: boleh parking van/bas atau tidak.
- [x] Tambah section ringkas arahan payment manual selepas owner confirm.
- [x] Tambah penjelasan cara semak tarikh: pilih tarikh, lihat anggaran, WhatsApp owner, confirm dan bayar.
- [x] Tambah halaman SEO tambahan dan link dari homepage.
- [x] Tambah `WHATSAPP-TEMPLATES.md`.
- [x] Kemas `PRE-LIVE-QA.md` untuk phone/live test yang lebih jelas.
- [x] Kemas `MAINTENANCE.md` dengan cara update gambar WebP, calendar/ICS dan template WhatsApp.

## Checklist P2 - Upgrade Besar Jika Perlu Kemudian

Ini bukan scope sekarang, sebab website diminta view-only dan direct WhatsApp.

- [ ] Sambung Google Calendar/ICS untuk tarikh rujukan.
- [x] Tambah auto price estimate ikut bilik dan malam.
- [ ] Tambah minimum stay rule jika ada.
- [ ] Tambah peak season surcharge jika ada.
- [ ] Tambah DuitNow QR sebagai info selepas owner confirm, jika mahu.
- [x] Tambah halaman SEO: Homestay dekat Hospital Jitra.
- [x] Tambah halaman SEO: Homestay untuk Konvokesyen UUM.
- [x] Tambah halaman SEO: Homestay untuk keluarga besar di Jitra.
- [x] Tambah halaman SEO: Tempat menarik sekitar Jitra.

## Checklist Data Owner Ringkas

Checklist detail yang paling kemas sekarang ada dalam `OWNER-DATA-CHECKLIST.md`. README ini hanya simpan ringkasan supaya tidak duplicate terlalu banyak.

### Sudah Selesai / Sudah Masuk Website

- [x] Nama homestay, jenis rumah, alamat, Google Maps, nombor telefon dan email.
- [x] Harga asas 2, 3, 4 dan 5 bilik.
- [x] Security deposit RM100, extra guest RM10, early/late RM20/jam.
- [x] Polisi asas daripada PDF.
- [x] Kemudahan asas: WiFi, fully aircond, kipas, pantry/basic facilities, water heater, extra tilam, bantal dan comforter.
- [x] Kapasiti maksimum 20 tetamu termasuk kanak-kanak.
- [x] Gambar latest pilihan untuk hero, ruang tamu, ruang makan, pantry/dapur, bilik, parking, exterior dan porch.
- [x] WebP version untuk gambar semasa.
- [x] Lokasi dan tempat berdekatan ikut kategori masa perjalanan.
- [x] Halaman SEO tambahan untuk carian local.
- [x] Copywriting promosi untuk FB/WhatsApp/listing.
- [x] Template WhatsApp draft untuk operasi owner.
- [x] Website kekal view-only dan direct WhatsApp.

### Masih Perlu Owner Confirm / Beri Nanti

- [ ] Gambar semua 3 bilik air.
- [ ] Label semua 5 bilik tidur jika mahu gallery lebih lengkap.
- [ ] Parking muat berapa kereta, dan status van/bas.
- [ ] Harga tambahan: weekend, cuti sekolah, cuti umum, konvokesyen, peak season, diskaun 2 malam ke atas.
- [ ] Kemudahan tambahan yang nak dipaparkan: TV, peti ais, mesin basuh, iron, toiletries, rice cooker, microwave, Coway/penapis air.
- [ ] Polisi tambahan: booking deposit, refund, tukar tarikh, caj majlis/event.
- [ ] Tarikh unavailable terkini atau link Google Calendar/ICS.
- [ ] Video walkthrough kecil atau link YouTube unlisted jika mahu aktifkan section video.
- [ ] Testimoni/review/rating sebenar jika mahu dipaparkan.
- [ ] Final approval owner untuk ayat BM/EN sebelum live.

## Semakan Automatik & Manual Sebelum Live

Bahagian bertick ialah semakan yang sudah boleh disahkan melalui code/local QA. Bahagian belum tick ialah semakan yang memang perlu phone sebenar, URL live, atau tindakan owner.

- [x] Homepage boleh load melalui local server.
- [x] Thank-you page boleh load melalui local server.
- [x] Policies page boleh load melalui local server.
- [x] Policies page UI dipolish dan masih static.
- [x] 404 page boleh load melalui local server.
- [x] Sitemap boleh load melalui local server.
- [x] `app.js` lulus syntax check.
- [x] `app.config.js` lulus syntax check.
- [x] Internal anchor link semakan asas lulus.
- [x] Semua WhatsApp link semakan asas guna nombor sama.
- [x] Semua `target="_blank"` semakan asas ada `rel="noopener"`.
- [x] Semua gambar yang dirujuk dalam homepage wujud dalam folder `images/`.
- [x] Semakan kod confirm `admin.html`, owner password, dan owner editor tiada dalam public flow.
- [x] Semakan kod confirm anggaran harga form wujud dalam HTML dan JS.
- [x] Semakan kod confirm homepage ada satu `h1` utama pada hero.
- [x] QA automatik boleh dijalankan dengan `node tools/qa-check.js`.
- [x] QA automatik cover no-JS fallback, 404 page, referrer policy dan print style polisi.
- [x] QA automatik cover sensitive-info dan BM/EN translation attributes.
- [x] Audit saiz gambar semasa dibuat dalam `IMAGE-AUDIT.md`.
- [x] Screenshot mobile headless semakan asas dibuat.
- [x] Audit automatik local: CTA WhatsApp, form valid, form invalid, unavailable date, BM/EN, dark/light, gallery lightbox, Google Maps, dan page load.
- [ ] Browser smoke test manual di desktop dan mobile selepas deploy/live preview.
- [ ] Buka homepage desktop Chrome secara manual.
- [ ] Buka homepage mobile Chrome/Safari secara manual.
- [ ] Klik semua nav anchor secara manual.
- [ ] Klik semua WhatsApp CTA dari phone sebenar.
- [ ] Submit form dengan tarikh valid.
- [ ] Submit form dengan checkout sebelum check-in.
- [ ] Submit form dengan unavailable date.
- [ ] Tukar BM ke EN.
- [x] Tukar dark/light mode.
- [ ] Buka gallery lightbox.
- [ ] Klik Google Maps.
- [ ] Buka policies page.
- [ ] Buka thank-you page.
- [x] `OWNER-DATA-CHECKLIST.md` sudah dikemas untuk collect data final owner.
- [x] `PRE-LIVE-QA.md` tersedia untuk semakan ringkas sebelum live.
- [ ] Test dari phone sebenar menggunakan mobile data.

## Operasi Manual Owner

Setiap kali ada pertanyaan baru:
- [ ] Semak tarikh yang pelanggan tanya melalui WhatsApp.
- [ ] Confirm package bilik dan jumlah malam.
- [ ] Confirm jumlah tetamu.
- [ ] Beri jumlah bayaran/deposit.
- [ ] Minta bukti bayaran melalui WhatsApp.
- [ ] Send house rules dan check-in instruction selepas bayaran disahkan.
- [ ] Simpan rekod booking di tempat owner sendiri, contohnya WhatsApp label, notebook, Google Calendar, atau Google Sheet.

Setiap minggu:
- [ ] Semak WhatsApp link masih betul.
- [ ] Semak harga dan polisi masih betul.
- [ ] Semak gambar masih mewakili keadaan rumah sebenar.
- [ ] Tambah review/testimoni baru jika ada izin.
- [ ] Semak Google Business Profile.

Setiap bulan:
- [ ] Update gambar jika ada improvement rumah.
- [ ] Semak harga peak season.
- [ ] Semak SEO performance.
- [ ] Review soalan pelanggan yang selalu ditanya dan tambah ke FAQ.

## Cadangan Roadmap 7 Hari

Hari 1:
- [x] Data asas harga, polisi PDF, kapasiti, nombor contact, dan alamat sudah dimasukkan.
- [ ] Finalkan data tambahan owner: parking tepat, peak season, kemudahan tambahan dan polisi tambahan.
- [x] Buang admin/login/user flow.
- [x] Update `app.config.js`.

Hari 2:
- [x] Compress gambar.
- [x] Tambah gambar latest pilihan untuk website semasa.
- [x] Pilih hero image terbaik sementara.

Hari 3:
- [x] Audit automatik WhatsApp CTA dan form.
- [ ] Test semua WhatsApp CTA dan form dari phone sebenar.
- [x] Polish mobile hero/header overflow.
- [x] Betulkan copy BM/EN utama.
- [x] Tambah anggaran harga automatik dalam form.

Hari 4:
- [x] Setup metadata domain, sitemap, robots, canonical, dan Open Graph.
- [ ] Submit Google Search Console.

Hari 5:
- [ ] Setup Google Analytics/Plausible jika mahu.
- [ ] Test event tracking.
- [ ] Test thank-you flow dari phone sebenar.

Hari 6:
- [x] Tambah gambar utama untuk hero, ruang tamu, ruang makan, pantry, bilik, parking, exterior dan porch.
- [x] Tambah versi WebP untuk gambar semasa.
- [ ] Tambah gambar semua bilik air dan label semua 5 bilik jika mahu lebih lengkap.
- [x] Tambah FAQ payment/manual booking.

Hari 7:
- [ ] Final QA di phone sebenar.
- [ ] Deploy live.

## Nota Penting

Website ini sekarang memang direka sebagai brochure + WhatsApp enquiry sahaja. Semua urusan bayaran, confirmation, refund, dan bukti pembayaran berlaku secara manual antara pelanggan dan owner melalui WhatsApp.

## Copywriting Promosi Siap Pakai

### Versi Facebook / Marketplace

**Jitra2Stay Homestay Jitra**

Homestay Semi-D 2 tingkat yang luas dan selesa, sesuai untuk keluarga besar, rombongan, kenduri kecil, konvokesyen, urusan Hospital Jitra atau penginapan sementara di sekitar Jitra.

**Maklumat rumah**
- 5 bilik tidur
- 3 bilik air
- Fully air-conditioned + kipas
- WiFi
- Pantry & basic facilities
- Parking luas
- Extra tilam, bantal dan comforter

**Kadar sewa 1 malam**
Harga bergantung pada bilangan bilik yang ditempah:
- 2 bilik: RM180/malam
- 3 bilik: RM230/malam
- 4 bilik: RM280/malam
- 5 bilik: RM330/malam

Security deposit: RM100

**Lokasi**
49, Taman Jitra Indah, Jalan Hospital Daerah, 06000 Jitra, Kedah.
Sebelah pagar sisi Hospital Jitra.

Google Maps:
https://goo.gl/maps/pjnMbwm5Pk2QqPeP8

**Tempat berdekatan**
5 - 10 minit: Hospital Jitra, Bandar Jitra, Dewan Jitra, Lotus Jitra, MRSM Kubang Pasu, IKBN Jitra, Masjid Sharifah Fatimah, Dewan Tunku Anum, Dewan Wawasan, MPKP, IPD Kubang Pasu dan Hotel Bustani.

10 - 20 minit: Bandar Darulaman, ILP Jitra, POLIMAS, IPG Darulaman, IAB Cawangan Utara, C-Mart BDI, Yawata, Masjid Muttaqin, Hotel Darulaman, Kem Kelubi, Kem Askar Melayu, SMSAH/Jenan, Tasik Darulaman, Darulaman Golf Club dan Darulaman Fantasia Aquapark.

20 - 30 minit: Airport Kepala Batas, Kolej Tentera Udara, Bandar Anak Bukit, Istana Anak Bukit, Masjid Zahir dan Bandar Alor Setar.

30 minit ke atas: Changlun, UUM, UniMAP, Matrikulasi Kubang Pasu, Kolej Pertanian, MARDI, EDC-UUM Hotel, Bukit Kayu Hitam, UiTM Arau dan kawasan sekitar.

**Hubungi / WhatsApp**
019-441 0666
019-442 0666

Semak tarikh, harga dan ketersediaan melalui WhatsApp. Slot hujung minggu biasanya cepat penuh, jadi digalakkan booking awal.

### Versi WhatsApp Pendek

Jitra2Stay Homestay Jitra - Semi-D 2 tingkat, 5 bilik tidur, 3 bilik air, fully aircond + kipas, WiFi, pantry dan parking luas.

Kadar 1 malam:
2 bilik RM180
3 bilik RM230
4 bilik RM280
5 bilik RM330

Security deposit RM100.

Lokasi: 49, Taman Jitra Indah, Jalan Hospital Daerah, 06000 Jitra, Kedah. Sebelah pagar sisi Hospital Jitra.

Google Maps:
https://goo.gl/maps/pjnMbwm5Pk2QqPeP8

WhatsApp untuk semak tarikh dan slot:
019-441 0666 / 019-442 0666

### Versi Tajuk Posting

- Homestay Semi-D 2 Tingkat di Jitra, Sebelah Hospital Jitra
- Jitra2Stay Homestay, 5 Bilik 3 Bilik Air, Sesuai Untuk Keluarga & Rombongan
- Homestay Jitra Untuk Kenduri, Konvokesyen, Urusan Hospital & Family Trip
- Homestay Luas di Jitra Dengan Parking, WiFi dan Fully Aircond
