# Jitra2Stay

Website homestay statik dalam Bahasa Melayu dan English: lihat rumah, gambar, harga, kemudahan dan lokasi, kemudian bertanya kepada owner melalui WhatsApp.

**Website ini untuk paparan dan pertanyaan.** Tiada akaun, database booking, kalendar ketersediaan atau pembayaran dalam website. Hanya owner boleh mengesahkan tarikh, harga akhir dan tempahan.

- [Website production](https://jitra2stay.vercel.app/)
- [English](https://jitra2stay.vercel.app/en.html)
- [Pembaikan audit dan pengesahan](IMPLEMENTATION-2026-09-11.md)
- [Audit baseline sebelum pembaikan](AUDIT-2026-09-11.md)

## Apa yang berubah

- Homepage disusun: hero → fakta rumah → galeri → harga → kemudahan → lokasi → FAQ → pertanyaan.
- Background foto rumah dengan tona hijau dikembalikan, bersama permukaan cream/sage untuk paparan yang lebih berisi.
- Lokasi memaparkan Google Maps interaktif terus dalam halaman, serta butang Google Maps dan Waze ke pin rumah yang sama.
- Halaman BM/EN lengkap dijana sebagai HTML statik; kandungan tetap terlihat tanpa JavaScript.
- Galeri 11 foto mempunyai pautan gambar biasa dan native dialog dengan akses keyboard. Dua foto bilik sebenar ditambah daripada arkib owner.
- Harga, contact dan polisi berkongsi satu sumber dalam `site.config.cjs`.
- Form pilihan menyediakan anggaran kadar asas dan mesej WhatsApp. Form kekal selepas dibuka; pautan cuba semula dan salin mesej tersedia.
- Kalendar lapuk, parser ICS, tracking lokal, CTA rawak dan redirect thank-you automatik telah dibuang.
- Gambar responsif menggunakan saiz yang sesuai; foto asal tidak diterbitkan bersama website.
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
| `site.config.cjs` | Business, kadar, fakta, polisi, kemudahan, kapsyen dan panduan BM/EN |
| `templates/shared.cjs` | Layout, header/footer, metadata, schema dan gambar |
| `templates/home.cjs` | Homepage dan form pertanyaan |
| `templates/location.cjs` | Peta Google terbenam, butang Google Maps/Waze dan panduan lokasi |
| `templates/pages.cjs` | Polisi, panduan setempat, halaman legacy thank-you dan 404 |
| `app.js` | Menu, tema, dialog galeri dan pembina mesej; fungsi date-only boleh diuji |
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

Edit `site.config.cjs` kemudian build semula. Harga pakej dijana dalam kad/jadual, form, mesej anggaran dan schema daripada `rates`; telefon serta domain daripada `business`. Polisi menggunakan token seperti `{{securityDeposit}}` dan `{{maxGuests}}` supaya nilai selari.

Maklumat sedia ada: 5 bilik, 3 bilik air, maksimum 20 tetamu termasuk kanak-kanak; kadar 2/3/4/5 bilik RM180/RM230/RM280/RM330 semalam; security deposit RM100; check-in 3 petang, check-out 12 tengah hari.

**Masih perlukan owner:** foto tiga bilik air, nombor/nama bilik dan susunan katil, bilangan parking sebenar, skop kemudahan tambahan, peak-season/minimum stay, booking payment, refund/tukar tarikh, serta asas caj lebihan tetamu. Website tidak meneka cutoff refund, jumlah booking deposit atau caj tambahan yang belum jelas. Lihat [checklist owner](OWNER-DATA-CHECKLIST.md).

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

Pengesahan 11 September 2026: **430 semakan statik, 5 unit dan 24 browser tests lulus** pada versi implementasi ini. Browser meliputi saiz 320/390/768/1440, BM/EN, menu, keyboard/dialog, no-JS, form, fallback WhatsApp serta axe pada state/tema utama. Peta Google sebenar dan pembukaan Google Maps/Waze turut diperiksa secara berasingan. Suite automatik menggunakan fixture peta supaya ujian website tidak bergantung pada rangkaian atau UI Google. Angka ujian boleh bertambah apabila suite dikemas.

Tiada mesej WhatsApp atau pembayaran sebenar dihantar oleh tests. Telefon fizikal, mobile data, Safari sebenar, terma owner dan akaun Search Console masih memerlukan semakan manual. Axe lulus tidak menggantikan semua penilaian aksesibiliti manusia.

## Deploy

Vercel menggunakan `vercel.json`: `npm ci` → `npm run build` → output `dist`. Netlify disediakan dengan `netlify.toml`. GitHub Pages memerlukan build type **GitHub Actions** dan job deploy hanya pada `main` selepas QA lulus. Untuk cPanel, muat naik **kandungan dist sahaja**. Jangan upload root repo.

Polisi, panduan EN, gambar, header keselamatan dan output 404 termasuk dalam proses yang sama. Raw JPG, dokumen operasi, tools, config source, manifest asal foto dan tests tidak berada dalam output awam. Lihat [panduan deploy](DEPLOYMENT.md).

## Dokumentasi

- [Pelaksanaan audit](IMPLEMENTATION-2026-09-11.md), [QA](QA-REPORT.md), [changelog](CHANGELOG.md).
- [Data owner](OWNER-DATA-CHECKLIST.md), [semakan kandungan](CONTENT-REVIEW.md), [semakan telefon/live](PRE-LIVE-QA.md).
- [Penyelenggaraan](MAINTENANCE.md), [deploy](DEPLOYMENT.md), [SEO](SEO-SUBMISSION.md), [gambar](IMAGE-AUDIT.md).
- [Handover](HANDOVER.md), [templat WhatsApp owner](WHATSAPP-TEMPLATES.md).
