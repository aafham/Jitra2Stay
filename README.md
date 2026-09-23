# Jitra2Stay

Website homestay statik dalam Bahasa Melayu dan English untuk melihat rumah, gambar, harga, kemudahan dan lokasi, kemudian bertanya kepada owner melalui WhatsApp.

**Website ini untuk paparan dan pertanyaan.** Tarikh, harga akhir, bayaran dan tempahan disahkan sendiri oleh owner. Tiada akaun, database booking atau pembayaran dalam website.

[Website](https://jitra2stay.vercel.app/) · [English](https://jitra2stay.vercel.app/en.html) · [Dokumentasi](docs/README.md)

## Kandungan dan fungsi

- Rumah Semi-D dua tingkat, 5 bilik dan 3 bilik air; privasi satu rumah dan self check-in.
- Sesuai untuk 6–10 orang, maksimum 20 termasuk kanak-kanak; parking biasanya 3–4 kereta.
- Pakej 2/3/4/5 bilik: RM180/RM230/RM280/RM330 semalam. Deposit keselamatan RM100 berasingan.
- Check-in 3 petang dan check-out 12 tengah hari; polisi/caj lain tersedia dalam website.
- Galeri 21 foto sebenar dengan kategori, dialog dan pautan gambar daripada sembilan kad kemudahan.
- Perbandingan pakej, anggaran mengikut tarikh, draf pertanyaan dan pratonton mesej WhatsApp.
- Peta Google interaktif, butang Google Maps/Waze dan carian 50 destinasi mengikut kategori.
- Homepage, polisi dan panduan BM/EN; tema cerah/gelap, menu mobile serta kandungan asas tanpa JavaScript.

Fakta sedia ada berpandukan bahan owner. [Rekod kandungan](docs/RESTORED-CONTENT.md) dan [rekod foto](docs/IMAGE-AUDIT.md) menerangkan sumbernya. Anggaran perjalanan ialah snapshot bertarikh, bukan trafik masa nyata.

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
| Susunan homepage, header/footer dan halaman lain | `src/templates/` |
| Menu, borang, galeri, carian dan perkongsian | `src/scripts/` |
| Warna, layout dan paparan telefon | `src/styles/`; `src/styles/mobile.css` dimuat paling akhir |
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

Ujian meliputi BM/EN, desktop/mobile, keyboard, tanpa JS, galeri, borang, clipboard dan teks besar. Suite memintas WhatsApp dan menggunakan fixture Maps; tiada mesej atau bayaran dihantar. Semakan enjin browser tidak menggantikan ujian telefon fizikal. Lihat [laporan QA](docs/QA-REPORT.md) dan [checklist peranti](docs/PRE-LIVE-QA.md).

## Deploy

**Terbitkan kandungan `dist/` sahaja.** Vercel menggunakan `vercel.json`, Netlify menggunakan `netlify.toml`, dan GitHub Pages menggunakan Actions selepas QA lulus pada `main`. Untuk cPanel, upload kandungan output build.

Source, dokumen, tests, manifest provenance dan foto kamera mentah tidak termasuk output website. Pengecualian daripada deploy tidak menjadikan fail yang sudah dikomit ke repo awam peribadi. Arahan penuh: [Deployment](docs/DEPLOYMENT.md).

## Dokumentasi

Mulakan dengan [indeks docs](docs/README.md), [penyelenggaraan](docs/MAINTENANCE.md) atau [handover](docs/HANDOVER.md). Semua laporan audit terdahulu dan rekod perubahan dikekalkan dalam `docs/`.
