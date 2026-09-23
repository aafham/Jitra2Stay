# Jitra2Stay

Website homestay dalam Bahasa Melayu dan English untuk melihat rumah, gambar, harga, kemudahan, lokasi dan rekod penginapan, kemudian bertanya kepada owner melalui WhatsApp. Frontend statik disambungkan kepada Supabase untuk rekod tetamu.

**Tempahan dan bayaran masih disahkan sendiri oleh owner.** Pengurusan boleh mengemas kini rekod tetamu melalui borang ber-PIN. Kalendar mengikut rekod yang dimasukkan; tempahan daripada WhatsApp atau saluran lain perlu direkodkan secara manual. Tiada pendaftaran akaun tetamu atau pembayaran online.

[Website](https://jitra2stay.vercel.app/) · [English](https://jitra2stay.vercel.app/en.html) · [Dokumentasi](docs/README.md)

## Kandungan dan fungsi

- Rumah Semi-D dua tingkat, 5 bilik dan 3 bilik air; privasi satu rumah dan self check-in.
- Sesuai untuk 6–10 orang, maksimum 20 termasuk kanak-kanak; parking biasanya 3–4 kereta.
- Pakej 2/3/4/5 bilik: RM170/RM230/RM280/RM330 semalam. Deposit RM100 untuk kumpulan kecil/biasa, RM200 untuk kumpulan besar atau acara besar seperti kenduri; kategori disahkan owner.
- Check-in 3 petang dan check-out 12 tengah hari; polisi/caj lain tersedia dalam website.
- Galeri 21 foto sebenar dengan kategori, dialog dan pautan gambar daripada sembilan kad kemudahan.
- Perbandingan pakej, anggaran mengikut tarikh, draf pertanyaan dan pratonton mesej WhatsApp.
- Peta Google interaktif, butang Google Maps/Waze dan carian 50 destinasi mengikut kategori.
- Kalendar merah bagi malam berpenghuni dan senarai upcoming awam; borang PIN 4 kotak untuk tambah, ubah atau batalkan rekod. Hanya tarikh masuk, tarikh keluar dan nama wajib; bilangan/tujuan boleh dikosongkan. [Panduan urus tetamu](docs/GUEST-GUIDE.md).
- Mobile: homepage ringkas dan lima tab bawah — Utama, Gambar, Harga, Kalendar, Lagi. Rumah, kemudahan, lokasi, FAQ dan pertanyaan mempunyai halaman sendiri dalam BM/EN; desktop mengekalkan homepage penuh.
- Tema cerah/gelap dan navigasi halaman asas berfungsi tanpa JavaScript. Pautan lama ke bahagian homepage membuka halaman berkaitan pada mobile.

Fakta sedia ada berpandukan bahan owner. [Rekod kandungan](docs/RESTORED-CONTENT.md) dan [rekod foto](docs/IMAGE-AUDIT.md) menerangkan sumbernya. Anggaran perjalanan ialah snapshot bertarikh, bukan trafik masa nyata.

Contoh 2 bilik untuk 1 malam dengan deposit biasa: **RM170 + RM100 = RM270 bayaran awal**. Deposit dipulangkan selepas pemeriksaan rumah memuaskan; deposit hangus jika berlaku kerosakan atau perkara tidak diingini mengikut polisi owner.

## Jalankan projek

Gunakan **Node.js 22 atau lebih baharu**.

```sh
npm ci
npm run build
npm run preview
```

Buka [localhost:4173](http://127.0.0.1:4173). Preview hanya melayan output `dist/`. `npm run dev` membina dan membuka preview sekali; selepas mengubah source, jalankan build semula dan refresh.

## Struktur repo

```text
src/
  data/       Fakta owner, kadar, destinasi dan laluan
  templates/  Penjana HTML bagi halaman dan komponen
  scripts/    Interaksi browser
  styles/     CSS komponen dan paparan mobile
  images/     JPG web, WebP responsif dan manifest
docs/         Panduan operasi, laporan audit dan sejarah
tools/        Build, preview, QA dan pemprosesan gambar
tests/        Unit, browser, fixture dan config Playwright
supabase/     Migration database, Edge Function dan ujian backend
.github/      Workflow CI dan GitHub Pages
source-images/ Arkib kamera lama; tidak diterbitkan
dist/         Output website; dijana dan diabaikan Git
artifacts/    Laporan ujian; dijana dan diabaikan Git
```

Root menyimpan README, manifest npm dan konfigurasi hosting/Git sahaja. `source-images/` mungkin tidak ada dalam sparse checkout; arkib asal kekal dalam sejarah/repo. Jangan edit fail dalam `dist/`.

## Tempat untuk mengemas kini

| Keperluan | Fail source |
| --- | --- |
| Harga, telefon, domain, polisi, bilik, kemudahan, galeri dan copy BM/EN | [src/data/site.config.cjs](src/data/site.config.cjs) |
| Nama tempat, kategori dan snapshot laluan | `src/data/destinations.cjs`, `src/data/destination-categories.cjs`, `src/data/destination-routes.cjs` |
| Sambungan kalendar / borang tetamu | `src/data/guest.config.cjs` (URL awam sahaja); backend dalam `supabase/` |
| Susunan homepage, header/footer dan halaman lain | `src/templates/` |
| Halaman mobile, kategori dan navigasi bawah | `src/data/mobile-routes.cjs`, `src/templates/mobile-pages.cjs`, `src/templates/mobile-navigation.cjs` |
| Menu, borang, galeri, carian dan perkongsian | `src/scripts/` |
| Warna, layout dan paparan telefon | `src/styles/`; `mobile-pages.css` untuk navigasi/halaman mobile, `mobile.css` untuk komponen umum, `guest-admin.css` untuk borang pengurusan |
| Gambar website | `src/images/`; daftar gambar dalam config, kemudian `npm run optimize:images` |

Fail source berada dalam `src/`, tetapi URL website kekal seperti `/app.js`, `/style.css` dan `/images/…`. Build memetakan source kepada output awam. Maklumat akses pada foto WiFi/kotak kunci sudah ditutup; jangan gantikan salinan web dengan upload asal.

## Ujian

```sh
npm run build
npm run qa
npm run test:unit
npx playwright install chromium
npm test
```

`npm test` menggunakan `tests/playwright.config.cjs`. Laporan browser berada dalam `artifacts/playwright-report/` dan hasil/debug dalam `artifacts/test-results/`. Pada Windows dengan Chrome sedia ada, tetapkan `$env:TEST_BROWSER_CHANNEL = 'chrome'` sebelum `npm test`.

Ujian meliputi BM/EN, desktop/mobile, keyboard, tanpa JS, galeri, borang, clipboard, teks besar dan aliran rekod tetamu. Browser tests menggunakan fixture Maps/API dan memintas WhatsApp; tiada mesej atau bayaran dihantar. Ujian database berasingan diterangkan dalam [panduan backend](supabase/README.md). Keputusan: [laporan QA](docs/QA-REPORT.md); semakan telefon sebenar: [checklist peranti](docs/PRE-LIVE-QA.md).

## Deploy

**Terbitkan kandungan `dist/` sahaja.** Vercel menggunakan `vercel.json`, Netlify menggunakan `netlify.toml`, dan GitHub Pages menggunakan Actions selepas QA lulus pada `main`. Untuk cPanel, upload kandungan output build.

Migration dan Edge Function Supabase dideploy berasingan daripada frontend GitHub. `supabase/`, source, dokumen, tests dan foto kamera mentah tidak termasuk output website. Nama, tarikh dan bilangan tetamu dipaparkan kepada umum mengikut pilihan owner; tujuan hanya untuk pengurusan. Jangan simpan PIN, hash, token, kunci server atau rekod sebenar dalam repo. Arahan penuh: [Deployment](docs/DEPLOYMENT.md).

## Dokumentasi

Mulakan dengan [indeks docs](docs/README.md), [penyelenggaraan](docs/MAINTENANCE.md) atau [handover](docs/HANDOVER.md). Semua laporan audit terdahulu dan rekod perubahan dikekalkan dalam `docs/`.
