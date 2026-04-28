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
- [x] SEO asas: canonical, sitemap, robots, meta description, Open Graph, Twitter image, dan JSON-LD LodgingBusiness.
- [x] Tiada admin/login/user account dalam flow website.
- [x] Fail `admin.html` dibuang.
- [x] Owner editor, password, dan admin update logic dibuang daripada public website.

Yang masih perlu dibuat sebelum live:
- [ ] Sahkan semua data rumah, harga, polisi, dan lokasi dengan owner.
- [ ] Masukkan gambar sebenar yang cukup untuk semua bilik, bilik air, dapur, ruang tamu, parking, dan exterior.
- [ ] Compress gambar untuk prestasi mobile.
- [ ] Test di phone sebenar dan mobile data.
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
- [x] Semak `unavailableRanges` dan buang data contoh lama.

Fail lain yang perlu selari dengan domain:
- [x] `index.html` canonical dan hreflang.
- [x] `sitemap.xml`.
- [x] `robots.txt`.
- [x] Open Graph image absolute URL.
- [x] Semua WhatsApp link guna nombor sama.

## Checklist P0 - Wajib Sebelum Website Diguna Tetamu

### 1. Kandungan Homestay

- [x] Sahkan nama rasmi dalam website: `Jitra2Stay`.
- [ ] Sahkan alamat penuh dan pin Google Maps tepat.
- [x] Sahkan nombor WhatsApp/Call dalam website: `+60 19-441 0666`.
- [x] Sahkan email dalam website: `jitra2stay@gmail.com`.
- [x] Nyatakan jenis rumah: Semi-D 2 tingkat.
- [x] Nyatakan jumlah bilik tidur: 5.
- [x] Nyatakan jumlah bilik air: 3.
- [ ] Sahkan kapasiti sebenar: 6-10 atau 6-12 tetamu.
- [ ] Nyatakan caj jika lebih had tetamu.
- [ ] Sahkan parking muat berapa kereta.
- [ ] Sahkan semua kemudahan betul: WiFi, aircond, kipas, TV, dapur, parking.
- [ ] Tambah kemudahan yang belum disebut jika ada: mesin basuh, peti ais, penapis air, iron, towel, toiletries, rice cooker, microwave, water heater.
- [x] Buang ayat placeholder seperti "video akan ditambah".
- [x] Pastikan BM dan EN utama sama maksud.

### 2. Harga dan Polisi

- [x] Nyatakan harga 2 bilik: RM170/malam.
- [x] Nyatakan harga 3 bilik: RM220/malam.
- [x] Nyatakan harga 4 bilik: RM280/malam.
- [x] Nyatakan harga 5 bilik: RM330/malam.
- [x] Nyatakan deposit keselamatan RM100.
- [x] Bezakan deposit keselamatan dan deposit booking jika kedua-duanya berbeza.
- [ ] Nyatakan sama ada harga berubah pada cuti sekolah, cuti umum, konvokesyen, atau peak season.
- [ ] Nyatakan caj extra guest jika ada.
- [ ] Nyatakan caj lewat checkout jika ada.
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
- [ ] Test di iPhone/Android viewport kecil.
- [ ] Pastikan date form input selesa di phone sebenar.
- [ ] Pastikan pricing cards mudah dibaca tanpa horizontal scroll.
- [ ] Pastikan gallery image tidak terlalu tinggi atau crop pelik.

### 7. SEO dan Share Preview

- [x] Semak title page: `Jitra2Stay | Homestay di Jitra`.
- [x] Semak meta description tidak terlalu panjang.
- [x] Gunakan absolute URL untuk `og:image`.
- [x] Update `sitemap.xml` dengan URL domain sebenar.
- [x] Update `robots.txt` dengan sitemap domain sebenar.
- [ ] Test WhatsApp/Facebook preview dengan URL live.
- [ ] Submit sitemap ke Google Search Console.
- [ ] Daftar/kemas kini Google Business Profile.
- [ ] Pastikan nama, alamat, dan telefon konsisten antara website dan Google Business Profile.

### 8. Prestasi Gambar

- [ ] Compress semua gambar dalam `images/`.
- [ ] Sediakan versi WebP untuk gambar besar.
- [ ] Pastikan hero image tidak terlalu berat.
- [ ] Pastikan width/height gambar sepadan dengan saiz sebenar.
- [ ] Tambah gambar setiap bilik tidur, bilik air, dapur, ruang tamu, parking, exterior, dan kawasan sekitar.
- [ ] Elakkan gambar gelap atau blur.
- [ ] Pastikan gambar menunjukkan keadaan sebenar rumah.

## Checklist P1 - Improve Conversion Lepas P0

- [x] Tukar claim "Pilihan Popular Keluarga di Jitra" kepada claim yang lebih selamat.
- [x] Tukar respon "5-15 minit" kepada "biasanya respon pantas".
- [x] Jangan guna testimoni contoh sebagai review sebenar.
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
- [ ] Tambah auto price estimate ikut bilik dan malam.
- [ ] Tambah minimum stay rule jika ada.
- [ ] Tambah peak season surcharge jika ada.
- [ ] Tambah DuitNow QR sebagai info selepas owner confirm, jika mahu.
- [ ] Tambah halaman SEO: Homestay dekat Hospital Jitra.
- [ ] Tambah halaman SEO: Homestay untuk Konvokesyen UUM.
- [ ] Tambah halaman SEO: Homestay untuk keluarga besar di Jitra.
- [ ] Tambah halaman SEO: Tempat menarik sekitar Jitra.

## Checklist Data Yang Owner Perlu Bagi Untuk Final Update

Guna checklist ini bila nak bagi data sebenar nanti. Mana yang belum pasti boleh tulis "belum confirm".

### A. Maklumat Asas Rumah

- [ ] Nama rasmi homestay yang final.
- [ ] Alamat penuh final.
- [ ] Google Maps link/pin yang final.
- [ ] Nombor WhatsApp final.
- [ ] Nombor call final jika berbeza.
- [ ] Email final.
- [ ] Jenis rumah final: Semi-D / teres / banglo / lain-lain.
- [ ] Jumlah tingkat.
- [ ] Jumlah bilik tidur.
- [ ] Jumlah bilik air.
- [ ] Kapasiti selesa.
- [ ] Kapasiti maksimum.
- [ ] Caj extra guest jika lebih had.
- [ ] Parking muat berapa kereta.
- [ ] Boleh parking van atau tidak.
- [ ] Boleh parking bas atau tidak.

### B. Harga & Bayaran

- [ ] Harga 2 bilik.
- [ ] Harga 3 bilik.
- [ ] Harga 4 bilik.
- [ ] Harga 5 bilik.
- [ ] Harga weekday/weekend jika berbeza.
- [ ] Harga cuti sekolah.
- [ ] Harga cuti umum.
- [ ] Harga peak season / konvokesyen jika ada.
- [ ] Minimum stay jika ada.
- [ ] Security deposit amount.
- [ ] Booking deposit amount.
- [ ] Deposit dipulangkan bila.
- [ ] Kaedah bayaran: bank transfer / DuitNow QR / cash / lain-lain.
- [ ] Nama bank atau cara owner mahu beritahu payment detail.
- [ ] Perlu hantar proof payment melalui WhatsApp atau tidak.
- [ ] Bila booking dianggap confirmed.

### C. Polisi

- [ ] Check-in time final.
- [ ] Check-out time final.
- [ ] Early check-in boleh atau tidak.
- [ ] Late checkout boleh atau tidak.
- [ ] Caj late checkout jika ada.
- [ ] Refund policy final.
- [ ] Polisi tukar tarikh.
- [ ] Polisi kerosakan/barang hilang.
- [ ] Quiet hours.
- [ ] Boleh merokok di luar rumah atau tidak.
- [ ] Boleh buat majlis kecil atau tidak.
- [ ] Had tetamu untuk majlis kecil.
- [ ] Boleh bawa haiwan peliharaan atau tidak.
- [ ] Syarat tambahan untuk van/bas/rombongan besar.

### D. Kemudahan Rumah

- [ ] WiFi ada atau tidak.
- [ ] WiFi speed jika tahu.
- [ ] Aircond di bilik mana.
- [ ] Aircond di ruang tamu ada atau tidak.
- [ ] Kipas di bilik/ruang mana.
- [ ] TV ada atau tidak.
- [ ] Peti ais ada atau tidak.
- [ ] Dapur masak ada atau tidak.
- [ ] Gas dapur disediakan atau tidak.
- [ ] Rice cooker ada atau tidak.
- [ ] Microwave ada atau tidak.
- [ ] Cerek elektrik ada atau tidak.
- [ ] Penapis air/Coway ada atau tidak.
- [ ] Mesin basuh ada atau tidak.
- [ ] Iron/iron board ada atau tidak.
- [ ] Water heater ada atau tidak.
- [ ] Towel disediakan atau tidak.
- [ ] Toiletries disediakan atau tidak.
- [ ] Tilam tambahan ada atau tidak.
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
- [x] `app.js` lulus syntax check.
- [x] `app.config.js` lulus syntax check.
- [x] Internal anchor link semakan asas lulus.
- [x] Semua WhatsApp link semakan asas guna nombor sama.
- [x] Semua `target="_blank"` semakan asas ada `rel="noopener"`.
- [x] Screenshot mobile headless semakan asas dibuat.
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
- [ ] Compress gambar.
- [ ] Tambah gambar yang belum cukup.
- [ ] Pilih hero image terbaik.

Hari 3:
- [ ] Test semua WhatsApp CTA dan form.
- [x] Polish mobile hero/header overflow.
- [x] Betulkan copy BM/EN utama.

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
