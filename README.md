# Jitra2Stay Website

Website static promosi dan tempahan awal untuk homestay Jitra2Stay di Jitra, Kedah.

Fokus utama website ini:
- Bagi tetamu cepat faham rumah, harga, lokasi, kemudahan, dan peraturan.
- Bawa tetamu terus ke WhatsApp dengan mesej tempahan yang lengkap.
- Mudahkan owner update tarikh tidak tersedia, testimoni, polisi, dan pantau funnel asas.
- Sediakan asas SEO supaya website boleh dijumpai melalui Google.

## Ringkasan Status Semasa

Website ini sudah ada asas yang kuat untuk homestay:
- Halaman utama lengkap dengan hero, harga, cara tempah, borang semak tarikh, galeri, lokasi, FAQ, dan CTA WhatsApp.
- BM/EN toggle sudah ada.
- Dark/light mode sudah ada.
- Availability board dan calendar preview sudah ada.
- Owner admin frontend sudah ada di `admin.html`.
- SEO asas sudah ada: canonical, sitemap, robots, meta description, Open Graph, dan JSON-LD LodgingBusiness.
- Halaman polisi dan thank-you sudah ada.

Tetapi sebelum betul-betul digunakan secara live, beberapa perkara wajib dikemaskan:
- Data sebenar tarikh tempahan belum disambung kepada backend/Google Calendar secara production.
- `ownerPassword` sudah ditetapkan dalam `app.config.js`, dan fallback `1234` di `admin.html` sudah dibuang.
- Admin panel sekarang simpan data di `localStorage`, jadi perubahan hanya kekal pada browser yang sama.
- Video walkthrough masih belum disambung kepada fail video sebenar, tetapi copy placeholder sudah digantikan dengan arahan galeri foto.
- Copy overclaim/testimoni contoh utama sudah dikemaskan.
- Perlu audit mobile UI, prestasi gambar, analytics, dan SEO domain sebelum publish.

## Stack Ringkas

- `index.html` - struktur halaman utama.
- `style.css` - semua styling, tema, responsive layout, dan mobile UI.
- `app.js` - interaksi menu, language/theme toggle, calendar, form, WhatsApp tracking, analytics, owner editor, lightbox.
- `app.config.js` - konfigurasi business, analytics, password owner, API endpoint, ICS calendar, video URL, tarikh unavailable.
- `admin.html` - panel owner frontend.
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

## Konfigurasi Wajib Sebelum Live

Edit `app.config.js`:

- [x] Set `business.phone` kepada nombor WhatsApp rasmi.
- [x] Set `business.siteUrl` kepada domain sebenar.
- [x] Set `business.image` kepada URL penuh gambar hero/thumbnail.
- [x] Set `business.description` dengan ayat final.
- [x] Set `ownerPassword` sekurang-kurangnya 8 aksara.
- [x] Jangan guna password `1234`.
- [ ] Set `ownerApiEndpoint` jika mahu update tarikh secara central/backend.
- [ ] Set `bookingCalendarIcsUrl` jika mahu sync Google Calendar/Airbnb/Booking.com ICS.
- [ ] Set `walkthroughVideoUrl` bila video siap.
- [ ] Set `gaMeasurementId` atau `plausibleDomain` jika mahu analytics production.
- [x] Semak `unavailableRanges` dan buang data contoh lama.

Fail lain yang perlu samakan domain:
- [x] `index.html` canonical dan hreflang.
- [x] `sitemap.xml`.
- [x] `robots.txt`.
- [x] Open Graph image.
- [x] WhatsApp link jika nombor bertukar.

## Checklist P0 - Wajib Sebelum Website Diguna Tetamu

P0 ialah perkara yang patut disiapkan sebelum website dikongsi kepada pelanggan.

### 1. Kandungan Homestay

- [ ] Sahkan nama rasmi: `Jitra2Stay`.
- [ ] Sahkan alamat penuh dan pin Google Maps tepat.
- [ ] Sahkan nombor WhatsApp/Call: `+60 19-441 0666`.
- [ ] Sahkan email: `jitra2stay@gmail.com`.
- [ ] Sahkan jenis rumah: Semi-D 2 tingkat.
- [ ] Sahkan jumlah bilik tidur: 5.
- [ ] Sahkan jumlah bilik air: 3.
- [ ] Sahkan kapasiti sebenar: 6-10 atau 6-12 tetamu.
- [ ] Nyatakan caj jika lebih had tetamu.
- [ ] Sahkan parking muat berapa kereta.
- [ ] Sahkan semua kemudahan betul: WiFi, aircond, kipas, TV, dapur, parking.
- [ ] Tambah kemudahan yang belum disebut jika ada: mesin basuh, peti ais, coway/penapis air, iron, towel, toiletries, rice cooker, microwave, water heater.
- [x] Buang atau ubah semua ayat placeholder seperti "video akan ditambah" bila sudah live.
- [ ] Pastikan BM dan EN sama maksud untuk semua kandungan penting.

### 2. Harga dan Polisi

- [ ] Sahkan harga 2 bilik: RM170/malam.
- [ ] Sahkan harga 3 bilik: RM220/malam.
- [ ] Sahkan harga 4 bilik: RM280/malam.
- [ ] Sahkan harga 5 bilik: RM330/malam.
- [ ] Sahkan deposit keselamatan RM100.
- [ ] Bezakan deposit keselamatan dan deposit booking jika kedua-duanya berbeza.
- [ ] Nyatakan sama ada harga berubah pada cuti sekolah, cuti umum, konvokesyen, atau peak season.
- [ ] Nyatakan caj extra guest jika ada.
- [ ] Nyatakan caj lewat checkout jika ada.
- [ ] Nyatakan refund policy dengan jelas.
- [ ] Nyatakan polisi tukar tarikh.
- [ ] Nyatakan kaedah bayaran: bank transfer, DuitNow QR, cash, atau lain-lain.
- [ ] Nyatakan bila tempahan dianggap sah.
- [ ] Nyatakan check-in 3:00 PM dan check-out 12:00 PM.

### 3. Booking Flow

- [ ] Test semua CTA WhatsApp di header, hero, form, booking summary, final CTA, floating CTA, footer, dan mobile sticky button.
- [x] Pastikan semua link WhatsApp guna nombor sama.
- [x] Pastikan mesej WhatsApp auto-filled cukup lengkap: check-in, check-out, guests, rooms, purpose, notes.
- [x] Pastikan form reject checkout sebelum checkin.
- [x] Pastikan form warn jika tarikh bertindih dengan unavailable dates.
- [ ] Pastikan thank-you redirect tidak mengganggu user di mobile.
- [x] Tambah arahan ringkas selepas WhatsApp: "Owner akan semak slot dan reply secepat mungkin."
- [ ] Pertimbangkan butang "Copy alamat" atau "Open Maps" untuk tetamu selepas confirm.

### 4. Tarikh Tidak Tersedia

- [x] Buang label "(Contoh)" pada availability board bila data sebenar sudah masuk.
- [ ] Update `unavailableRanges` dengan tarikh sebenar.
- [ ] Sambung `bookingCalendarIcsUrl` kepada Google Calendar/OTA calendar jika ada.
- [ ] Jika guna `admin.html`, faham bahawa data sekarang hanya tersimpan di browser owner.
- [ ] Untuk production, buat backend ringan supaya tarikh dikongsi kepada semua visitor.
- [ ] Paparkan "Last updated" yang real.
- [ ] Tetapkan proses operasi: owner update calendar setiap kali booking confirm.

### 5. Keselamatan Admin

- [x] Set `ownerPassword` dalam `app.config.js`.
- [x] Buang fallback `1234` dalam `admin.html` sebelum live.
- [ ] Jangan anggap frontend password sebagai security sebenar kerana kod boleh dibaca oleh user.
- [ ] Jika admin perlu production, pindahkan update tarikh/testimoni/polisi ke backend/API dengan authentication.
- [ ] Letak `admin.html` di URL yang tidak dipromosi atau lindungi melalui hosting/server rules.
- [x] Pastikan `admin.html` ada `noindex,nofollow` seperti sekarang.

### 6. Mobile UI

- [ ] Test di iPhone/Android viewport kecil.
- [ ] Pastikan header tidak terlalu tinggi dan tidak menutup hero.
- [ ] Pastikan menu mobile boleh buka/tutup dengan lancar.
- [ ] Pastikan mobile sticky WhatsApp tidak menutup footer/link penting.
- [ ] Pastikan date form input tidak terlalu sempit.
- [ ] Pastikan pricing cards mudah dibaca tanpa horizontal scroll.
- [ ] Pastikan gallery image tidak terlalu tinggi atau crop pelik.
- [ ] Pastikan floating WhatsApp dan back-to-top tidak bertindih.

### 7. SEO dan Share Preview

- [x] Semak title page: "Jitra2Stay | Homestay di Jitra".
- [x] Semak meta description tidak terlalu panjang.
- [x] Gunakan absolute URL untuk `og:image` selepas domain live.
- [ ] Test WhatsApp/Facebook preview dengan URL live.
- [x] Update `sitemap.xml` dengan URL domain sebenar.
- [x] Update `robots.txt` dengan sitemap domain sebenar.
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

## Checklist P1 - Sangat Disarankan Selepas P0

### UI/UX Yang Patut Dikemaskan

- [ ] Kurangkan rasa "terlalu banyak CTA" jika halaman terasa sesak.
- [ ] Jadikan CTA utama konsisten: "Semak Tarikh" atau "WhatsApp Untuk Tempahan".
- [ ] Tambah sticky mini booking bar desktop yang tidak mengganggu.
- [ ] Tambah "quick facts" dekat hero: 5 bilik, 3 bilik air, 10 tetamu, parking 3-4 kereta.
- [ ] Tambah section ringkas "Apa yang anda dapat" sebelum pricing.
- [ ] Bezakan visual antara package 2/3/4/5 bilik dengan lebih jelas.
- [ ] Tambah nota "1 rumah private, tidak berkongsi dengan tetamu lain".
- [ ] Letak "Paling Popular" pada pakej yang memang paling kerap ditempah.
- [ ] Tambah gambar dalam pricing/package jika mahu lebih premium.
- [ ] Pastikan warna tidak terlalu monotonous; sekarang tema hijau sesuai, cuma boleh tambah neutral warm/cream secara terkawal.
- [ ] Kurangkan emoji jika mahu nampak lebih premium dan hotel-like.
- [ ] Gantikan emoji pada icon penting dengan icon konsisten jika mahu polish tinggi.
- [ ] Pastikan spacing section mobile tidak terlalu panjang.
- [ ] Pastikan footer kemas dan tidak nampak seperti kad terlalu banyak.

### Copywriting Yang Boleh Improve

- [x] Tukar "Pilihan Popular Keluarga di Jitra" kepada claim yang boleh disokong, contohnya "Selesa untuk keluarga & rombongan di Jitra".
- [x] Jika tiada bukti respon 5-15 minit, ubah kepada "Biasanya respon pantas melalui WhatsApp".
- [ ] Tambah copy untuk masalah pelanggan: datang kenduri, konvo, hospital, cuti sekolah, rombongan sukan.
- [ ] Tambah "Kenapa lokasi ini mudah": dekat hospital, bandar, tempat makan, pasaraya.
- [ ] Tambah "Apa perlu bawa": IC, deposit, barang peribadi, makanan sendiri jika masak.
- [ ] Tambah "Self check-in details akan diberi selepas bayaran disahkan" jika benar.
- [ ] Tambah FAQ: boleh bawa haiwan peliharaan atau tidak.
- [ ] Tambah FAQ: ada water heater atau tidak.
- [ ] Tambah FAQ: boleh buat majlis kecil atau tidak.
- [ ] Tambah FAQ: ada towel/toiletries atau tidak.
- [ ] Tambah FAQ: boleh parking bas/van atau tidak.

### Trust dan Bukti Sosial

- [ ] Guna testimoni sebenar daripada tetamu.
- [x] Jangan guna testimoni contoh bila sudah live.
- [ ] Tambah screenshot review jika ada izin.
- [ ] Tambah rating Google/Facebook jika ada.
- [ ] Tambah gambar tetamu hanya jika ada consent.
- [ ] Tambah "telah menerima tetamu untuk kenduri/konvo/keluarga" jika benar.
- [ ] Tambah polisi kebersihan atau cleaning checklist.

### Lokasi dan Nearby Places

- [ ] Sahkan jarak/minit ke semua tempat berdekatan.
- [ ] Tambah UUM jika target convocation UUM.
- [ ] Tambah IPDA/Kolej Matrikulasi/POLIMAS jika relevan.
- [ ] Tambah tempat makan popular berdekatan.
- [ ] Tambah hospital/klinik/farmasi terdekat.
- [ ] Tambah link "Directions from your current location" melalui Google Maps.

### Analytics dan Conversion

- [ ] Aktifkan Google Analytics atau Plausible.
- [ ] Track event penting: page_view, WhatsApp click, date_form_start, date_form_submit, gallery open, map load.
- [ ] Bezakan sumber CTA: hero, header, form, sticky, footer.
- [ ] Semak conversion mobile vs desktop.
- [ ] Uji A/B CTA yang sudah ada dalam `app.js`.
- [ ] Tambah UTM jika link dibawa dari Facebook/TikTok/Instagram.
- [ ] Buat laporan bulanan: visitors, WhatsApp clicks, replied, confirmed bookings.

## Checklist P2 - Upgrade Besar Bila Website Sudah Stabil

### Backend dan Data

- [ ] Buat API untuk availability dates.
- [ ] Simpan booking inquiries ke database.
- [ ] Hantar notifikasi ke owner bila form dihantar.
- [ ] Sambung Google Sheets sebagai backend ringan.
- [ ] Sambung Google Calendar untuk blocked dates.
- [ ] Buat dashboard owner yang sebenar dengan login.
- [ ] Pisahkan admin daripada public static files.

### Booking System

- [ ] Tambah calendar picker yang lebih mesra mobile.
- [ ] Tambah auto price estimate ikut bilik dan malam.
- [ ] Tambah minimum stay rule jika ada.
- [ ] Tambah peak season surcharge.
- [ ] Tambah coupon/discount code jika perlu.
- [ ] Tambah booking request ID.
- [ ] Tambah email/SMS/WhatsApp confirmation template.
- [ ] Tambah deposit payment instructions selepas owner confirm.

### Payment

- [ ] Tambah DuitNow QR sebagai gambar/section selepas confirm.
- [ ] Tambah payment gateway jika mahu automasi penuh.
- [ ] Tambah resit automatik.
- [ ] Tambah status bayaran: pending, paid, refunded.
- [ ] Simpan proof-of-payment melalui WhatsApp buat sementara.

### Content Marketing

- [ ] Buat halaman blog/guide: "Homestay dekat Hospital Jitra".
- [ ] Buat halaman: "Homestay untuk Konvokesyen UUM".
- [ ] Buat halaman: "Homestay untuk keluarga besar di Jitra".
- [ ] Buat halaman: "Tempat menarik sekitar Jitra".
- [ ] Tambah gambar berkala dan update seasonal copy.
- [ ] Tambah TikTok/Instagram/Facebook link jika aktif.

### Advanced SEO

- [ ] Tambah LocalBusiness/LodgingBusiness schema dengan data final.
- [ ] Tambah FAQ schema jika FAQ final.
- [ ] Tambah breadcrumb schema jika ada halaman tambahan.
- [ ] Tambah image alt yang lebih descriptive.
- [ ] Tambah internal link antara halaman bahasa.
- [ ] Pantau Google Search Console untuk query sebenar.
- [ ] Optimasi keyword: homestay Jitra, homestay dekat Hospital Jitra, homestay Jitra untuk keluarga, homestay Kedah.

## Cadangan Aku Untuk Website Ini

### Keutamaan 1

Siapkan website supaya boleh dipakai untuk tempahan sebenar:
- Tukar semua data contoh kepada data sebenar.
- Betulkan security admin.
- Test semua WhatsApp flow.
- Compress gambar.
- Update domain/SEO.
- Buang ayat placeholder video jika belum ada video.

### Keutamaan 2

Naikkan conversion:
- Jadikan "Semak Tarikh" sebagai CTA utama di hero.
- Pastikan form WhatsApp generate mesej lengkap.
- Tambah auto price estimate.
- Tambah proof sebenar seperti review Google/Facebook.
- Tambah gambar bilik air, semua bilik tidur, parking, dan exterior siang/malam.

### Keutamaan 3

Mudahkan owner maintain:
- Jangan bergantung pada `localStorage` untuk admin production.
- Sambung availability kepada Google Calendar atau Google Sheets.
- Buat proses owner: setiap booking confirm, update calendar terus.
- Guna analytics untuk tahu section mana orang klik.

### Keutamaan 4

Bina authority Google:
- Claim/kemas kini Google Business Profile.
- Submit sitemap.
- Tambah page khusus untuk keyword tempatan.
- Kumpul review sebenar secara konsisten.

## Checklist UI Detail

### Header

- [ ] Pastikan logo dan subtitle tidak sempit di mobile.
- [ ] Pastikan menu mobile jelas dan mudah ditekan.
- [ ] Pertimbangkan sembunyikan Call button di header mobile jika terlalu padat.
- [ ] Pastikan BM/EN dan dark mode tidak mengganggu CTA utama.
- [ ] Gunakan label CTA yang konsisten.

### Hero

- [ ] Hero image mesti gambar terbaik homestay.
- [ ] Pastikan text hero masih readable atas gambar.
- [ ] Tambah 4 quick facts dekat hero.
- [ ] Letak CTA utama di atas fold mobile.
- [ ] Pastikan hero tidak terlalu tinggi sampai pricing/availability lambat nampak.

### Pricing

- [ ] Semak harga final.
- [ ] Nyatakan apa beza setiap pakej selain jumlah bilik.
- [ ] Nyatakan sama ada satu rumah tetap private walaupun sewa 2 bilik.
- [ ] Nyatakan bilik yang tidak digunakan akan dikunci atau tidak.
- [ ] Tambah nota peak season jika perlu.
- [ ] Tambah "tertakluk kepada ketersediaan".

### Date Check

- [x] Ubah title board daripada "Tarikh Tidak Tersedia (Contoh)" kepada final bila live.
- [ ] Papar unavailable dates sebenar sahaja.
- [x] Tambah info jika calendar belum final: "Sila WhatsApp untuk pengesahan akhir."
- [ ] Tambah price estimate berdasarkan bilik dan malam.
- [x] Pastikan error message BM/EN jelas.

### Gallery

- [ ] Tambah minimum 10-15 gambar.
- [ ] Masukkan semua bilik tidur.
- [ ] Masukkan semua bilik air.
- [ ] Masukkan dapur lengkap.
- [ ] Masukkan parking.
- [ ] Masukkan front house dan landmark sekitar.
- [ ] Compress gambar.
- [ ] Guna nama fail SEO-friendly seperti `bilik-tidur-utama-jitra2stay.webp`.

### Facilities

- [ ] Pecahkan kemudahan ikut kategori: bilik, dapur, ruang tamu, parking, keselamatan.
- [ ] Nyatakan WiFi speed jika tahu.
- [ ] Nyatakan bilangan aircond.
- [ ] Nyatakan bilangan katil dan konfigurasi katil.
- [ ] Nyatakan jika ada tilam tambahan.

### Policies

- [ ] Polisi booking perlu lebih tegas dan lengkap.
- [ ] House rules perlu nyatakan larangan party besar jika tidak dibenarkan.
- [ ] Nyatakan quiet hours.
- [ ] Nyatakan damage/lost item policy.
- [ ] Nyatakan early check-in/late checkout bergantung availability.
- [ ] Nyatakan privacy notice ringkas untuk data WhatsApp.

### Footer

- [ ] Pastikan contact info sama dengan header.
- [ ] Tambah social links jika ada.
- [ ] Tambah Google Maps link.
- [ ] Tambah copyright tahun semasa.
- [ ] Pastikan footer tidak terlalu tinggi di mobile.

## Checklist Technical

### HTML

- [x] Semak semua link dalaman berfungsi.
- [ ] Semak semua `alt` image.
- [ ] Semak semua button ada `type="button"` jika bukan submit.
- [ ] Semak semua language data BM/EN lengkap.
- [x] Semak canonical/hreflang domain final.
- [x] Semak `target="_blank"` ada `rel="noopener"`.

### CSS

- [ ] Buang duplicate responsive rules jika makin susah maintain.
- [ ] Audit mobile breakpoint `768px`.
- [ ] Pastikan tiada horizontal scroll.
- [ ] Pastikan text tidak overflow dalam button/card.
- [ ] Pastikan contrast cukup untuk dark mode.
- [ ] Pastikan reduced motion disokong.

### JavaScript

- [ ] Pastikan tiada console error.
- [ ] Pastikan date validation ikut timezone Malaysia.
- [x] Pastikan owner editor tidak muncul kepada tetamu jika admin belum secure.
- [ ] Pastikan analytics tidak crash jika blocked by browser.
- [ ] Pastikan WhatsApp redirect ke thank-you tidak terlalu cepat di mobile.
- [ ] Pastikan ICS parser boleh handle calendar sebenar.

### Security

- [ ] Jangan letak rahsia sebenar dalam frontend static files.
- [ ] Jangan guna frontend password untuk data penting.
- [ ] Jika guna API, validate password/server token di server.
- [ ] Rate limit API admin jika ada.
- [x] Pastikan admin tidak index oleh Google.

### Performance

- [ ] Compress CSS/JS jika deploy production.
- [ ] Compress gambar.
- [ ] Preload hero image sahaja.
- [ ] Lazy-load gambar bawah fold.
- [ ] Lazy-load Google Maps seperti sekarang.
- [ ] Uji Lighthouse mobile.
- [ ] Target Lighthouse Performance 80+ mobile.

## Manual Test Sebelum Live

- [ ] Buka homepage desktop Chrome.
- [ ] Buka homepage mobile Chrome.
- [ ] Buka homepage Safari/iPhone jika ada.
- [ ] Klik semua nav anchor.
- [ ] Klik semua WhatsApp CTA.
- [ ] Submit form dengan tarikh valid.
- [ ] Submit form dengan checkout sebelum checkin.
- [ ] Submit form dengan unavailable date.
- [ ] Tukar BM ke EN.
- [ ] Tukar dark/light mode.
- [ ] Buka gallery lightbox.
- [ ] Klik Google Maps.
- [ ] Buka policies page.
- [ ] Buka thank-you page.
- [ ] Buka admin page.
- [ ] Test password admin.
- [ ] Test update unavailable dates.
- [ ] Hard refresh selepas update.
- [ ] Test dari phone sebenar menggunakan mobile data.

## Owner Operation Checklist

Setiap kali ada booking baru:
- [ ] Confirm tarikh dengan pelanggan di WhatsApp.
- [ ] Confirm package bilik dan jumlah malam.
- [ ] Confirm jumlah tetamu.
- [ ] Collect deposit/booking payment.
- [ ] Update unavailable dates.
- [ ] Send house rules dan check-in instruction.
- [ ] Simpan bukti bayaran.
- [ ] Update status booking dalam tracker owner.

Setiap minggu:
- [ ] Semak semua tarikh unavailable.
- [ ] Semak WhatsApp link masih betul.
- [ ] Semak analytics/funnel.
- [ ] Tambah review/testimoni baru jika ada.
- [ ] Semak Google Business Profile.

Setiap bulan:
- [ ] Update gambar jika ada improvement rumah.
- [ ] Semak harga peak season.
- [ ] Semak SEO performance.
- [ ] Backup data booking.
- [ ] Review soalan pelanggan yang selalu ditanya dan tambah ke FAQ.

## Cadangan Roadmap 7 Hari

Hari 1:
- [ ] Finalkan harga, polisi, kapasiti, kemudahan, dan nombor contact.
- [x] Update `app.config.js`.
- [x] Buang data contoh.

Hari 2:
- [ ] Compress gambar.
- [ ] Tambah gambar yang belum cukup.
- [ ] Pilih hero image terbaik.

Hari 3:
- [ ] Test semua WhatsApp CTA dan form.
- [ ] Polish mobile layout.
- [x] Betulkan copy BM/EN.

Hari 4:
- [x] Setup domain, sitemap, robots, canonical, Open Graph.
- [ ] Submit Google Search Console.

Hari 5:
- [ ] Setup Google Analytics/Plausible.
- [ ] Test event tracking.
- [ ] Test thank-you flow.

Hari 6:
- [x] Secure admin atau disable owner editor public.
- [ ] Sambung Google Calendar/Sheets jika mahu data central.

Hari 7:
- [ ] Final QA di phone sebenar.
- [ ] Publish.
- [ ] Kongsi link kepada beberapa orang untuk feedback.

## Nota Penting

Website ini sudah boleh jadi landing page homestay yang baik, tetapi jangan terus anggap ia booking system penuh. Buat masa ini ia lebih sesuai sebagai:
- Website promosi.
- Funnel WhatsApp.
- Semakan tarikh awal.
- Manual booking support untuk owner.

Untuk production yang lebih serius, upgrade paling penting ialah backend availability dan admin yang secure.
