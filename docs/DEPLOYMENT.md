# Deployment Jitra2Stay

Semua host mesti menerbitkan **dist/**, bukan root repository. HTML dijana daripada `src/templates/` dan `src/data/site.config.cjs`. Arahan dijalankan dari root repo; lihat [README](../README.md).

## Build

```sh
npm ci
npm run build
npm run qa
```

Build membersihkan hanya folder dist yang dimiliki projek. Aset foto kamera asal dan sejarah Git kekal. Output mengandungi 16 HTML, style.css, app.js, public app.config.js, robots, sitemap, favicon dan JPG/WebP yang digunakan. Raw, tools, tests, docs dan manifest provenance tidak disalin.

`src/scripts/` dan `src/styles/` dipetakan terus ke root output; gambar daripada `src/images/` diterbitkan sebagai `dist/images/`. Oleh itu URL awam seperti `/app.js` dan `/images/…` kekal sama selepas susunan repo berubah. `artifacts/` hanya menyimpan laporan ujian tempatan dan tidak diterbitkan.

## Vercel

Import repo sedia ada. vercel.json menetapkan install npm ci, build npm run build, framework null dan outputDirectory dist. Push branch menghasilkan preview melalui Git integration; production mengikuti main. Semak preview sebelum merge. Jangan cipta projek Vercel kedua jika integration sedia ada sudah berfungsi.

Header nosniff/referrer/permissions dan cache aset ditetapkan dalam config. app.config.js yang dipublish hanya data yang memang public; jangan tambah secret.

## GitHub Pages

Dalam Settings → Pages, gunakan Source **GitHub Actions**. Job deploy dalam .github/workflows/qa.yml hanya berjalan pada main selepas unit/static/browser checks lulus, membina output dan upload artifact dari dist sahaja. Job PR tidak deploy ke Pages. URL mirror menggunakan path /Jitra2Stay/; pautan/aset relatif kekal berfungsi, canonical production tetap Vercel.

## Netlify

netlify.toml menetapkan npm run build dan publish dist serta fallback 404. Jalankan npm ci mengikut lockfile. Jangan ubah publish directory kepada root.

## cPanel / hosting statik

Jalankan build local dan upload semua kandungan dist, termasuk halaman English, empat pasang panduan, favicon dan folder images. Tetapkan custom error document kepada 404.html dengan status HTTP 404. Jangan muat naik repository, node_modules atau raw archive. Pastikan fail output lama yang sudah tidak digunakan tidak kekal dalam folder public hosting.

## Pengesahan selepas deploy

- Homepage BM/EN, polisi, panduan dan gambar memberi 200.
- URL tidak wujud memberi 404 sebenar.
- `/src/data/site.config.cjs`, `/src/images/responsive/manifest.json`, `/docs/OWNER-DATA-CHECKLIST.md`, `/tools/qa-check.js` dan `/source-images/latest-raw/IMG_8012.JPG` tidak boleh dicapai. URL dokumen lama `/OWNER-DATA-CHECKLIST.md` juga mesti kekal 404.
- Canonical, hreflang, OG dan sitemap menggunakan business.siteUrl yang aktif.
- WhatsApp membuka nombor yang betul; pautan fallback mengekalkan input.
- Test pada telefon sebenar sebelum menganggap phone flow selesai.

Rollback menggunakan release/commit terakhir yang lulus. Jangan rollback dengan menerbitkan root sumber yang mengandungi arkib.
