# Jitra2Stay Website

Website static untuk promosi homestay Jitra2Stay di Jitra, Kedah.

Tujuan website ini sangat direct:
- Visitor view detail rumah, harga, kemudahan, gambar bilik/ruang, lokasi, polisi, dan tarikh rujukan.
- Visitor isi borang ringkas atau tekan CTA untuk terus WhatsApp.
- Owner semak pertanyaan, confirm tarikh, beri arahan bayaran, dan urus payment secara manual melalui WhatsApp.
- Website ini **tiada login admin, tiada login user, tiada dashboard, dan tiada payment gateway dalam website**.

## Status Semasa

Yang sudah ada:
- [x] Homepage lengkap dengan hero, harga, cara tempah, form semak tarikh, galeri, lokasi, FAQ, dan CTA WhatsApp.
- [x] BM/EN toggle.
- [x] Dark/light mode.
- [x] Dark/light mode contrast dikemaskan supaya tulisan dan card boleh dibaca.
- [x] Availability board sebagai rujukan tarikh tidak tersedia.
- [x] Calendar preview 2 bulan.
- [x] Halaman polisi.
- [x] Halaman thank-you selepas klik WhatsApp.
- [x] SEO asas: canonical, sitemap, robots, meta description, Open Graph, Twitter image, dan JSON-LD LodgingBusiness/WebSite/WebPage/FAQPage.
- [x] Copy utama dipolish untuk flow view-only + direct WhatsApp.
- [x] Semakan mobile headless dibuat untuk hero, highlight, harga, lokasi, FAQ, dan sticky WhatsApp.
- [x] Tiada admin/login/user account dalam flow website.
- [x] Fail `admin.html` dibuang.
- [x] Owner editor, password, dan admin update logic dibuang daripada public website.
- [x] Anggaran harga automatik dalam form ikut bilangan malam dan pakej bilik.

Yang masih perlu dibuat sebelum live:
- [ ] Sahkan semua data rumah, harga, polisi, dan lokasi dengan owner.
- [ ] Masukkan gambar sebenar yang cukup untuk semua bilik, bilik air, dapur, ruang tamu, parking, dan exterior.
- [x] Compress gambar sedia ada untuk prestasi mobile.
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
- `ms.html` / `en.html` - redirect/landing bahasa.
- `robots.txt` / `sitemap.xml` - SEO crawler.
- `images/` - gambar homestay.

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
- [ ] Sahkan parking muat berapa kereta.
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
- [x] Form warn jika tarikh bertindih dengan unavailable dates.
- [x] Tambah arahan selepas WhatsApp: owner akan semak slot dan reply secepat mungkin.
- [x] Thank-you page beri arahan sambung WhatsApp.
- [x] Audit automatik local untuk CTA WhatsApp, form validation, lightbox, map, BM/EN, dan dark/light.
- [ ] Test semua CTA WhatsApp di phone sebenar.
- [ ] Test submit form dari phone sebenar.
- [ ] Tambah butang "Open Maps" atau "Copy alamat" selepas alamat final disahkan.

### 4. Tarikh Tidak Tersedia

- [x] Buang label "(Contoh)" pada availability board.
- [x] Paparkan tarikh sebagai rujukan sahaja dan minta pengesahan akhir melalui WhatsApp.
- [x] Buang owner/admin edit tarikh daripada website.
- [ ] Update `unavailableRanges` dengan tarikh sebenar bila owner beri tarikh.
- [ ] Sambung `bookingCalendarIcsUrl` kepada Google Calendar/OTA calendar jika mahu paparan rujukan lebih mudah.
- [ ] Tetapkan proses operasi manual: bila booking confirm, owner update rekod sendiri dan maklum pelanggan melalui WhatsApp.

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
- [ ] Pastikan gallery image nampak baik dengan gambar latest sebenar.

### 7. SEO dan Share Preview

- [x] Semak title page: `Jitra2Stay | Homestay Semi-D 2 Tingkat di Jitra`.
- [x] Semak meta description tidak terlalu panjang.
- [x] Gunakan absolute URL untuk `og:image`.
- [x] Tambah `og:url`, `og:site_name`, `og:image:alt`, `twitter:image:alt`.
- [x] Tambah JSON-LD `WebSite`, `WebPage`, dan `FAQPage`.
- [x] Update `sitemap.xml` dengan URL domain sebenar.
- [x] Update `robots.txt` dengan sitemap domain sebenar.
- [x] Update `lastmod` sitemap kepada `2026-05-04`.
- [ ] Test WhatsApp/Facebook preview dengan URL live.
- [ ] Submit sitemap ke Google Search Console.
- [ ] Daftar/kemas kini Google Business Profile.
- [ ] Pastikan nama, alamat, dan telefon konsisten antara website dan Google Business Profile.

### 8. Prestasi Gambar

- [x] Compress semua gambar sedia ada dalam `images/`.
- [ ] Sediakan versi WebP untuk gambar besar bila tool/build pipeline sesuai tersedia.
- [x] Pastikan hero image tidak terlalu berat untuk versi gambar semasa.
- [x] Pastikan width/height gambar sedia ada sepadan dengan saiz sebenar.
- [ ] Tambah gambar setiap bilik tidur, bilik air, dapur, ruang tamu, parking, exterior, dan kawasan sekitar.
- [ ] Elakkan gambar gelap atau blur.
- [ ] Pastikan gambar menunjukkan keadaan sebenar rumah.

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
- [x] Kemas kini UI final CTA dan footer supaya lebih ringkas, fokus, dan tidak terlalu berat.
- [ ] Tambah testimoni sebenar jika ada izin.
- [ ] Tambah screenshot review jika ada izin.
- [ ] Tambah rating Google/Facebook jika ada.
- [ ] Tambah copy untuk pelanggan kenduri, konvo, hospital, cuti sekolah, dan rombongan sukan.
- [x] Tambah "Apa perlu bawa": IC, deposit, barang peribadi, makanan sendiri jika masak.
- [x] Tambah FAQ: boleh bawa haiwan peliharaan atau tidak.
- [x] Tambah FAQ: ada water heater atau tidak.
- [x] Tambah FAQ: boleh buat majlis kecil atau tidak.
- [x] Tambah FAQ: ada towel/toiletries atau tidak.
- [x] Tambah FAQ: boleh parking van/bas atau tidak.
- [x] Tambah section ringkas arahan payment manual selepas owner confirm.

## Checklist P2 - Upgrade Besar Jika Perlu Kemudian

Ini bukan scope sekarang, sebab website diminta view-only dan direct WhatsApp.

- [ ] Sambung Google Calendar/ICS untuk tarikh rujukan.
- [x] Tambah auto price estimate ikut bilik dan malam.
- [ ] Tambah minimum stay rule jika ada.
- [ ] Tambah peak season surcharge jika ada.
- [ ] Tambah DuitNow QR sebagai info selepas owner confirm, jika mahu.
- [ ] Tambah halaman SEO: Homestay dekat Hospital Jitra.
- [ ] Tambah halaman SEO: Homestay untuk Konvokesyen UUM.
- [ ] Tambah halaman SEO: Homestay untuk keluarga besar di Jitra.
- [ ] Tambah halaman SEO: Tempat menarik sekitar Jitra.

## Checklist Data Yang Owner Perlu Bagi Untuk Final Update

Guna checklist ini bila nak bagi data sebenar nanti. Mana yang belum pasti boleh tulis "belum confirm".

Nota: PDF house rules ada password WiFi, tapi password itu tidak dipaparkan dalam website public. Beri password kepada tetamu selepas booking/check-in sahaja.

### Ringkasan Paling Penting Untuk Saya Update Nanti

- [ ] Gambar latest: exterior, parking, ruang tamu, dapur, setiap bilik, setiap bilik air, kemudahan penting.
- [x] Harga final asas: 2 bilik RM180, 3 bilik RM230, 4 bilik RM280, 5 bilik RM330.
- [ ] Harga tambahan: weekend, cuti sekolah, cuti umum, konvokesyen, peak season, dan diskaun 2 malam ke atas.
- [x] Polisi final asas daripada PDF: deposit keselamatan, late checkout/early check-in RM20/jam, extra guest RM10/seorang, pets tidak dibenarkan, merokok luar sahaja.
- [ ] Polisi tambahan: deposit booking, refund, tukar tarikh, dan caj majlis/event.
- [x] Kemudahan final asas daripada PDF: WiFi, fully aircond, pantry/basic facilities, water heater, extra tilam, bantal, comforter.
- [ ] Kemudahan tambahan: TV, parking, peti ais, mesin basuh, iron, toiletries, rice cooker, microwave.
- [x] Kapasiti maksimum final: 20 tetamu termasuk kanak-kanak.
- [ ] Kapasiti selesa, had majlis kecil, parking kereta/van/bas.
- [x] Lokasi final: Google Maps pin dan alamat penuh.
- [ ] Jarak/minit ke tempat penting sekitar Jitra.
- [ ] Trust sebenar: testimoni/review/rating yang boleh dipaparkan dengan izin.
- [ ] Tarikh unavailable terkini atau link Google Calendar/ICS jika mahu sync.

### A. Maklumat Asas Rumah

- [ ] Nama rasmi homestay yang final.
- [ ] Alamat penuh final.
- [x] Google Maps link/pin yang final.
- [x] Nombor WhatsApp final.
- [x] Nombor call final jika berbeza.
- [ ] Email final.
- [ ] Jenis rumah final: Semi-D / teres / banglo / lain-lain.
- [ ] Jumlah tingkat.
- [ ] Jumlah bilik tidur.
- [ ] Jumlah bilik air.
- [ ] Kapasiti selesa.
- [x] Kapasiti maksimum: 20 orang termasuk kanak-kanak.
- [x] Caj extra guest jika lebih had: RM10 seorang.
- [ ] Parking muat berapa kereta.
- [ ] Boleh parking van atau tidak.
- [ ] Boleh parking bas atau tidak.

### B. Harga & Bayaran

- [x] Harga 2 bilik: RM180/malam.
- [x] Harga 3 bilik: RM230/malam.
- [x] Harga 4 bilik: RM280/malam.
- [x] Harga 5 bilik: RM330/malam.
- [ ] Harga weekday/weekend jika berbeza.
- [ ] Harga cuti sekolah.
- [ ] Harga cuti umum.
- [ ] Harga peak season / konvokesyen jika ada.
- [ ] Detail diskaun/minimum stay 2 malam ke atas.
- [x] Security deposit amount: RM100.
- [ ] Booking deposit amount.
- [x] Deposit dipulangkan selepas check-out jika tiada kerosakan/ketidakpatuhan rules.
- [ ] Kaedah bayaran: bank transfer / DuitNow QR / cash / lain-lain.
- [ ] Nama bank atau cara owner mahu beritahu payment detail.
- [ ] Perlu hantar proof payment melalui WhatsApp atau tidak.
- [ ] Bila booking dianggap confirmed.

### C. Polisi

- [x] Check-in time final: 3:00 PM.
- [x] Check-out time final: 12:00 PM.
- [x] Early check-in boleh jika diluluskan.
- [x] Late checkout boleh jika diluluskan.
- [x] Caj early/late time: RM20/jam.
- [ ] Refund policy final.
- [ ] Polisi tukar tarikh.
- [x] Polisi kerosakan/ketidakpatuhan rules: deposit security boleh ditolak.
- [x] Quiet/neighbour rule: elakkan bising dan hormati privacy kejiranan.
- [x] Boleh merokok di luar rumah sahaja.
- [x] Majlis/event boleh dipertimbang dengan izin semasa booking dan caj berbeza.
- [x] Had maksimum kemasukan tetamu: 20 orang termasuk kanak-kanak.
- [x] Binatang peliharaan tidak dibenarkan.
- [ ] Syarat tambahan untuk van/bas/rombongan besar.

### D. Kemudahan Rumah

- [x] WiFi ada.
- [ ] WiFi speed jika tahu.
- [x] Fully aircond untuk bilik yang digunakan mengikut pakej.
- [ ] Aircond di ruang tamu ada atau tidak.
- [ ] Kipas di bilik/ruang mana.
- [ ] TV ada atau tidak.
- [ ] Peti ais ada atau tidak.
- [x] Pantry/basic facilities ada.
- [ ] Gas dapur disediakan atau tidak.
- [ ] Rice cooker ada atau tidak.
- [ ] Microwave ada atau tidak.
- [ ] Cerek elektrik ada atau tidak.
- [ ] Penapis air/Coway ada atau tidak.
- [ ] Mesin basuh ada atau tidak.
- [ ] Iron/iron board ada atau tidak.
- [x] Water heater ada: 2 bilik air untuk pakej 2 bilik, 3 bilik air untuk pakej 3-5 bilik.
- [x] Tuala digunakan perlu dimasukkan ke bakul semasa check-out.
- [ ] Toiletries disediakan atau tidak.
- [x] Extra tilam, bantal dan comforter ada.
- [ ] Katil setiap bilik: queen/single/double/decker.
- [ ] Keperluan bayi jika ada.

### E. Gambar Yang Perlu Diberi Nanti

- [ ] Gambar exterior depan rumah siang.
- [ ] Gambar exterior depan rumah malam jika ada.
- [ ] Gambar parking.
- [ ] Gambar ruang tamu wide angle.
- [ ] Gambar ruang makan jika ada.
- [ ] Gambar dapur.
- [ ] Gambar bilik tidur 1.
- [ ] Gambar bilik tidur 2.
- [ ] Gambar bilik tidur 3.
- [ ] Gambar bilik tidur 4.
- [ ] Gambar bilik tidur 5.
- [ ] Gambar bilik air 1.
- [ ] Gambar bilik air 2.
- [ ] Gambar bilik air 3.
- [ ] Gambar kemudahan penting: TV, dapur, peti ais, mesin basuh, iron, water heater jika ada.
- [ ] Gambar landmark sekitar jika sesuai.
- [ ] Gambar yang owner mahu jadikan hero utama.
- [ ] Gambar untuk share preview/thumbnail.

### F. Lokasi & Nearby Places

- [ ] Jarak/minit ke Hospital Jitra.
- [ ] Jarak/minit ke bandar Jitra.
- [ ] Jarak/minit ke UUM jika target konvokesyen.
- [ ] Jarak/minit ke IPDA jika relevan.
- [ ] Jarak/minit ke POLIMAS jika relevan.
- [ ] Jarak/minit ke Kolej Matrikulasi jika relevan.
- [ ] Pasaraya terdekat.
- [ ] Kedai makan popular terdekat.
- [ ] Klinik/farmasi terdekat.
- [ ] Masjid/surau terdekat jika mahu letak.

### G. Trust / Marketing

- [ ] Testimoni sebenar pelanggan jika ada.
- [ ] Nama/label testimoni yang boleh dipaparkan.
- [ ] Screenshot review dengan izin jika ada.
- [ ] Google/Facebook rating jika ada.
- [ ] Link Facebook/TikTok/Instagram jika mahu.
- [ ] Google Business Profile link jika ada.
- [ ] Ayat promosi yang owner suka.
- [ ] Ayat/claim yang tidak mahu digunakan.

### H. Tarikh & Operasi

- [ ] Senarai tarikh unavailable terkini.
- [ ] Cara owner rekod booking sekarang: WhatsApp / Google Calendar / notebook / Google Sheet.
- [ ] Nak sync Google Calendar/ICS ke website atau tidak.
- [ ] Nak paparkan "tarikh tidak tersedia" atau hanya minta WhatsApp sahaja.
- [ ] Template mesej WhatsApp yang owner mahu.
- [ ] Arahan check-in yang boleh dipaparkan public atau hanya selepas bayaran.

## Manual Test Sebelum Live

- [x] Homepage boleh load melalui local server.
- [x] Thank-you page boleh load melalui local server.
- [x] Policies page boleh load melalui local server.
- [x] Sitemap boleh load melalui local server.
- [x] `app.js` lulus syntax check.
- [x] `app.config.js` lulus syntax check.
- [x] Internal anchor link semakan asas lulus.
- [x] Semua WhatsApp link semakan asas guna nombor sama.
- [x] Semua `target="_blank"` semakan asas ada `rel="noopener"`.
- [x] Semua gambar yang dirujuk dalam homepage wujud dalam folder `images/`.
- [x] Semakan kod confirm `admin.html`, owner password, dan owner editor tiada dalam public flow.
- [x] Semakan kod confirm anggaran harga form wujud dalam HTML dan JS.
- [x] Screenshot mobile headless semakan asas dibuat.
- [x] Audit automatik local: CTA WhatsApp, form valid, form invalid, unavailable date, BM/EN, dark/light, gallery lightbox, Google Maps, dan page load.
- [ ] Playwright browser smoke test terbaru belum lulus di environment ini kerana runner npx gagal resolve module `@playwright/test`; perlu ulang selepas dependency test dipasang dengan betul.
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
- [ ] Finalkan harga, polisi, kapasiti, kemudahan, nombor contact, dan alamat.
- [x] Buang admin/login/user flow.
- [x] Update `app.config.js`.

Hari 2:
- [x] Compress gambar.
- [ ] Tambah gambar yang belum cukup.
- [ ] Pilih hero image terbaik.

Hari 3:
- [ ] Test semua WhatsApp CTA dan form.
- [x] Polish mobile hero/header overflow.
- [x] Betulkan copy BM/EN utama.
- [x] Tambah anggaran harga automatik dalam form.

Hari 4:
- [x] Setup domain, sitemap, robots, canonical, Open Graph.
- [ ] Submit Google Search Console.

Hari 5:
- [ ] Setup Google Analytics/Plausible jika mahu.
- [ ] Test event tracking.
- [ ] Test thank-you flow dari phone sebenar.

Hari 6:
- [ ] Tambah gambar semua bilik/ruang.
- [x] Tambah FAQ payment/manual booking.

Hari 7:
- [ ] Final QA di phone sebenar.
- [ ] Deploy live.

## Nota Penting

Website ini sekarang memang direka sebagai brochure + WhatsApp enquiry sahaja. Semua urusan bayaran, confirmation, refund, dan bukti pembayaran berlaku secara manual antara pelanggan dan owner melalui WhatsApp.
