# Handover Jitra2Stay

Website kekal laman paparan homestay dan pertanyaan WhatsApp. Mulakan dengan [README projek](../README.md) dan [indeks docs](README.md). Laporan bertarikh merekod keadaan ketika audit, termasuk bilangan gambar/ujian pada waktu itu.

- Node 22+, npm ci, npm run build, npm run preview.
- Source data: `src/data/site.config.cjs`; HTML: `src/templates/`; interaksi: `src/scripts/`; visual: `src/styles/`; foto: `src/images/`.
- dist ialah satu-satunya output publish; jangan edit atau upload root.
- Vercel Git integration dan GitHub Pages Actions menggunakan source repo sama; Netlify/cPanel juga mesti guna dist.
- Sebelum merge: static/unit/browser tests dan semakan visual. Selepas production: URL public/404/metadata/private-files dan phone manual.
- Config Playwright: `tests/playwright.config.cjs`; jalankan melalui `npm test`. Laporan/debug dijana dalam `artifacts/` dan tidak dikomit.
- Semua 21 foto, termasuk foto bilik air serta kelengkapan rumah baharu, tersedia. Parking, kemudahan dan polisi berpandukan data owner sedia ada; jangan meminta semula fakta yang sudah direkodkan. Bahan tambahan yang belum ada disenaraikan dalam [status data owner](OWNER-DATA-CHECKLIST.md).

Jangan hidupkan semula kalendar, admin, payment atau analytics tanpa keperluan produk baharu. Jangan masukkan rekod pelanggan ke config public.
