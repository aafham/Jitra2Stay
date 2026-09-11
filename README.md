# Jitra2Stay

Website homestay statik dalam Bahasa Melayu dan English: lihat rumah, gambar, harga, kemudahan dan lokasi, kemudian bertanya kepada owner melalui WhatsApp.

**Website ini untuk paparan dan pertanyaan.** Tiada akaun, database booking, kalendar ketersediaan atau pembayaran dalam website. Hanya owner boleh mengesahkan tarikh, harga akhir dan tempahan.

- [Website production](https://jitra2stay.vercel.app/)
- [English](https://jitra2stay.vercel.app/en.html)
- [Pembaikan audit dan pengesahan](IMPLEMENTATION-2026-09-11.md)
- [Audit baseline sebelum pembaikan](AUDIT-2026-09-11.md)
- [Semakan UI/UX seluruh website](UI-UX-REVIEW-2026-09-12.md)

## Apa yang berubah

- Hero diringkaskan dengan foto rumah, harga permulaan dan tindakan utama. Background hijau serta permukaan cream/sage dikekalkan.
- Foto dan penerangan lima bilik, kemudahan, tempat berdekatan serta ringkasan penginapan menggunakan semula maklumat owner dalam repo asal.
- Lokasi memaparkan Google Maps interaktif terus dalam halaman, serta butang Google Maps dan Waze ke pin rumah yang sama.
- Alamat penuh boleh disalin terus; jika clipboard tidak tersedia, ruangan salin manual dipaparkan dengan alamat dipilih.
- FAQ boleh ditapis mengikut Rumah & kemudahan, Harga & tempahan atau Ketibaan & peraturan. Semua 15 jawapan asal kekal dalam HTML dan tersedia tanpa JavaScript.
- Halaman BM/EN lengkap dijana sebagai HTML statik; kandungan tetap terlihat tanpa JavaScript.
- Galeri 11 foto boleh ditapis mengikut bilik tidur, ruang bersama dan luar rumah. Paparan awal menunjukkan 6 foto dengan butang lihat lagi/ringkaskan; tanpa JavaScript, semua foto terus tersedia.
- Dialog galeri menyokong keyboard, leretan kiri/kanan dan navigasi mengikut kategori. Jika gambar gagal dimuatkan, butang cuba lagi dan pautan JPG web tersedia. Dua foto bilik sebenar daripada arkib owner kekal digunakan.
- Thumbnail dalam dialog memudahkan pertukaran gambar; gambar semasa ditandakan dan penerangan bilik asal turut dipaparkan dalam paparan besar.
- Kad pakej memudahkan perbandingan bilik, bilik air dan kadar; pilihan kad terus diselaraskan dengan borang pertanyaan.
- Empat pakej disusun sebaris pada desktop, dua kolum pada skrin kecil; deposit, caj tambahan dan syarat penginapan dipisahkan supaya harga mudah dibandingkan.
- Foto galeri didahulukan sebelum panduan bilik. Kad kemudahan menggunakan satu kolum pada telefon, dan jarak FAQ/borang dikemaskan tanpa membuang kandungan.
- Harga, contact dan polisi berkongsi satu sumber dalam `site.config.cjs`.
- Borang pilihan mempunyai pintasan 1–3 malam, anggaran sewaan dengan deposit berasingan, ralat BM/EN di ruangan berkaitan dan pratonton mesej. Butiran kekal selepas membuka WhatsApp; pautan cuba semula dan salin mesej tersedia.
- Draf pertanyaan kekal ketika menukar BM/EN atau memuat semula tab, melalui `sessionStorage` sehingga 2 jam sejak simpanan terakhir. Butang kosongkan draf tersedia; butiran tetamu tidak dimasukkan ke URL.
- Butang WhatsApp umum pada header, hero, bahagian pertanyaan dan bar mobile menggunakan mesej borang yang sama apabila sah. Ralat pertama dibawa ke tengah skrin untuk dibetulkan; butang kosongkan borang hanya muncul selepas perubahan.
- Pautan Google Maps dan album Facebook asal tersedia. Butang Kongsi berkongsi pautan homepage sahaja melalui menu peranti, salin pautan atau pilihan salin manual.
- Navigasi menandakan bahagian yang sedang dibaca dan mengekalkan bahagian itu ketika menukar bahasa homepage. Bar mobile menyediakan Harga/WhatsApp dan menyorok semasa mengisi borang atau apabila kawalan borang sudah terlihat.
- Bar mobile turut menyorok apabila menutup kawalan yang sedang difokus, termasuk pada halaman panduan/polisi. Pautan dalam bar yang sedang difokus kekal terlihat.
- Polisi mempunyai indeks 11 topik dan mengekalkan topik sah ketika menukar BM/EN. Panduan mendahulukan alamat serta Google Maps/Waze sebelum pautan panduan lain. Footer mengumpulkan contact dan pautan penginapan, dengan pintasan kembali ke atas.
- Kalendar lapuk, parser ICS, tracking lokal, CTA rawak dan redirect thank-you automatik telah dibuang.
- Gambar responsif menggunakan saiz yang sesuai; fail kamera mentah tidak diterbitkan bersama website.
- Build menghasilkan 16 halaman HTML, metadata bahasa, sitemap dan robots yang konsisten pada domain Vercel aktif.
- CI menguji output, fungsi tarikh, browser, keyboard, tanpa JS dan kontras. GitHub Pages juga menerbitkan output yang sama selepas ujian lulus.

## Jalankan projek

Gunakan **Node.js 22 atau lebih baharu**. Tiada server aplikasi atau database diperlukan.

```sh
npm ci
npm run build
npm run preview
```

Buka [http://127.0.0.1:4173](http://127.0.0.1:4173). `npm run dev` membina dan memulakan preview sekali; selepas mengubah source, jalankan `npm run build` lagi dan refresh. Preview hanya melayan `dist/`, termasuk halaman 404 sebenar.

## Struktur

| Fail / folder | Fungsi |
| --- | --- |
| `site.config.cjs` | Fakta owner, kadar/polisi, bilik, kemudahan, galeri dan tempat berdekatan BM/EN |
| `templates/shared.cjs` | Layout, header/footer, metadata, schema dan gambar |
| `templates/home.cjs` | Susunan homepage dan gabungan template bahagian |
| `templates/hero.cjs` | Hero ringkas dengan foto rumah dan tindakan utama |
| `templates/stay-info.cjs` | Ringkasan penginapan, pautan profil/kongsi dan tempat berdekatan |
| `templates/gallery.cjs` | Galeri, penapis kategori dan dialog gambar |
| `templates/rates.cjs` | Kad pakej bilik dan maklumat kadar |
| `rates.css` | Susunan perbandingan pakej, caj dan ringkasan penginapan |
| `templates/enquiry.cjs` | Borang, pecahan anggaran dan pratonton mesej |
| `templates/location.cjs` | Peta Google terbenam, butang Google Maps/Waze dan panduan lokasi |
| `templates/faq.cjs`, `faq.js`, `faq.css` | Soalan asal BM/EN dan penapis topik dengan kiraan hasil |
| `location.js`, `location.css` | Salin alamat dan pilihan salinan manual |
| `templates/pages.cjs` | Polisi, panduan setempat, halaman legacy thank-you dan 404 |
| `documents.css` | Indeks polisi, susunan panduan dan footer semua halaman |
| `app.js` | Menu, tema, pakej, validasi, mesej dan draf pertanyaan dalam sesi tab |
| `share.js` | Perkongsian URL homepage tanpa butiran borang |
| `gallery.js`, `gallery.css` | Penapis, lihat lagi, dialog, leretan dan pemulihan gambar |
| `navigation.js`, `navigation.css` | Penanda bahagian aktif, pautan bahasa dan tingkah laku bar mobile |
| `style.css` | Token warna, layout, komponen, responsive dan print |
| `images/` | JPG sumber web dan aset responsif yang dikomit |
| `images/responsive/manifest.json` | Dimensi, saiz, hash dan provenance foto |
| `tools/build.cjs` | Jana HTML/config/SEO dan salin hanya aset yang diperlukan |
| `tools/serve.cjs` | Server preview untuk output sahaja |
| `tools/qa-check.js`, `tests/` | QA statik, unit dan Playwright |
| `dist/` | Output build, tidak dikomit; satu-satunya folder untuk deploy |
| `source-images/latest-raw/` | Arkib kamera owner; dikecualikan daripada output/unggahan Vercel |

Root HTML, `app.config.js`, robots dan sitemap lama telah diganti oleh template/build supaya source tidak bercanggah. Jangan edit fail dalam `dist/` secara manual.

## Data owner dan kemas kini

Edit `site.config.cjs` kemudian build semula. Harga pakej dijana dalam kad, borang, mesej anggaran dan schema daripada `rates`; telefon serta domain daripada `business`. Polisi menggunakan token seperti `{{securityDeposit}}` dan `{{maxGuests}}` supaya nilai selari. Kategori `gallery` menggunakan `bedrooms`, `shared` atau `outside` mengikut foto sebenar.

Maklumat owner daripada repo asal `18a274d` dipulihkan dalam config semasa; ini pemulihan sumber sedia ada, bukan pemeriksaan fizikal baharu. Jejak sumber direkodkan dalam [RESTORED-CONTENT.md](RESTORED-CONTENT.md).

- 5 bilik, 3 bilik air, privasi satu rumah dan self check-in; sesuai untuk 6–10 orang, maksimum 20 termasuk kanak-kanak.
- Pakej 2/3/4/5 bilik RM180/RM230/RM280/RM330 semalam; deposit keselamatan RM100, caj tetamu tambahan RM10 seorang dan awal/lewat RM20 sejam jika diluluskan.
- Parking biasanya 3–4 kereta, WiFi percuma, TV, aircond/kipas, water heater dan kelengkapan tidur tambahan.
- Check-in 3 petang, check-out 12 tengah hari. Pindahan bank, DuitNow QR dan tunai diterima; tarikh dan bayaran diurus melalui WhatsApp.
- Pembatalan kurang 7 hari sebelum check-in: deposit booking tidak dipulangkan. Pembatalan lebih awal: tukar tarikh tertakluk kepada ketersediaan.

Butiran yang memang tiada dalam sumber—seperti tingkat setiap bilik, ukuran katil, foto bilik air dan petikan ulasan tetamu—tidak direka atau dijadikan penghalang kepada website paparan ini. Lihat [status data owner](OWNER-DATA-CHECKLIST.md).

Domain `jitra2stay.com` tidak digunakan kerana tidak resolve semasa audit. Jika owner menyediakan domain itu kemudian, aktifkan DNS/domain terlebih dahulu, ubah `business.siteUrl` dan build/deploy. Tidak perlu menyunting URL berasingan dalam setiap halaman atau QA.

## Ujian

```sh
npm run build
npm run qa
npm run test:unit
npx playwright install chromium
npm test
```

Pada Windows yang sudah mempunyai Chrome, pilihan alternatif:

```powershell
$env:TEST_BROWSER_CHANNEL = 'chrome'
npm test
```

Pengesahan 12 September 2026: **464 semakan statik, 11 unit dan 53 browser tests lulus** pada versi implementasi ini. Browser meliputi saiz 320/390/768/1440 serta melintang 568×320, BM/EN, menu, keyboard/dialog, FAQ mengikut topik, salin alamat, no-JS, form, fallback WhatsApp serta axe pada state/tema utama. Semakan tambahan meliputi Tab semula jadi, fokus di atas bar mobile, ralat borang pertama, topik polisi merentas bahasa dan penggunaan semula pertanyaan oleh butang WhatsApp umum. Peta Google sebenar dan pembukaan Google Maps/Waze turut diperiksa secara berasingan. Suite automatik menggunakan fixture peta supaya ujian website tidak bergantung pada rangkaian atau UI Google. Angka ujian boleh bertambah apabila suite dikemas.

Tiada mesej WhatsApp atau pembayaran sebenar dihantar oleh tests. Semakan telefon fizikal, mobile data, Safari sebenar dan akaun Search Console kekal berasingan daripada ujian automatik. Axe lulus tidak menggantikan semua penilaian aksesibiliti manusia.

## Deploy

Vercel menggunakan `vercel.json`: `npm ci` → `npm run build` → output `dist`. Netlify disediakan dengan `netlify.toml`. GitHub Pages memerlukan build type **GitHub Actions** dan job deploy hanya pada `main` selepas QA lulus. Untuk cPanel, muat naik **kandungan dist sahaja**. Jangan upload root repo.

Polisi, panduan EN, gambar, header keselamatan dan output 404 termasuk dalam proses yang sama. Raw JPG, dokumen operasi, tools, config source, manifest asal foto dan tests tidak berada dalam output awam. Lihat [panduan deploy](DEPLOYMENT.md).

## Dokumentasi

- [Pelaksanaan audit](IMPLEMENTATION-2026-09-11.md), [QA](QA-REPORT.md), [changelog](CHANGELOG.md).
- [Data owner](OWNER-DATA-CHECKLIST.md), [semakan kandungan](CONTENT-REVIEW.md), [semakan telefon/live](PRE-LIVE-QA.md).
- [Penyelenggaraan](MAINTENANCE.md), [deploy](DEPLOYMENT.md), [SEO](SEO-SUBMISSION.md), [gambar](IMAGE-AUDIT.md).
- [Handover](HANDOVER.md), [templat WhatsApp owner](WHATSAPP-TEMPLATES.md).
