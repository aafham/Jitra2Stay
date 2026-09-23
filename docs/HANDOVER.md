# Handover Jitra2Stay

Website menggabungkan paparan homestay, pertanyaan WhatsApp dan rekod tetamu yang dikemas kini pengurusan. Frontend kekal statik; Supabase menyimpan rekod dan mengesahkan akses PIN. Mulakan dengan [README projek](../README.md), [panduan urus tetamu](GUEST-GUIDE.md) dan [indeks docs](README.md). Laporan bertarikh merekod keadaan ketika audit, termasuk bilangan gambar/ujian pada waktu itu.

- Node 22+, npm ci, npm run build, npm run preview.
- Source data: `src/data/site.config.cjs`; HTML: `src/templates/`; interaksi: `src/scripts/`; visual: `src/styles/`; foto: `src/images/`.
- dist ialah satu-satunya output publish; jangan edit atau upload root.
- Vercel Git integration dan GitHub Pages Actions menggunakan source repo sama; Netlify/cPanel juga mesti guna dist.
- Backend Supabase dalam `supabase/` mempunyai deployment berasingan. Endpoint awam sahaja dalam `src/data/guest.config.cjs`; PIN/hash/token/kunci server tidak boleh berada dalam Git atau output website.
- Sebelum merge: static/unit/browser tests dan semakan visual. Selepas production: URL public/404/metadata/private-files dan phone manual.
- Config Playwright: `tests/playwright.config.cjs`; jalankan melalui `npm test`. Laporan/debug dijana dalam `artifacts/` dan tidak dikomit.
- Semua 21 foto, termasuk foto bilik air serta kelengkapan rumah baharu, tersedia. Parking, kemudahan dan polisi berpandukan data owner sedia ada; jangan meminta semula fakta yang sudah direkodkan. Bahan tambahan yang belum ada disenaraikan dalam [status data owner](OWNER-DATA-CHECKLIST.md).

Kalendar dan upcoming terbuka kepada semua. Owner memilih untuk memaparkan nama, tarikh dan bilangan tetamu; tujuan pilihan kekal untuk pengurusan. **Urus tetamu** membuka empat kotak PIN, kemudian borang tambah/ubah/batal. Simpanan berjaya membawa pengguna kembali ke homepage. Rekod booking dari WhatsApp atau saluran luar perlu dimasukkan sendiri; tiada pendaftaran akaun tetamu, pembayaran online atau integrasi platform booking luar.

Database menghalang overlap, menerima checkout/check-in hari sama dan menolak edit versi lama. Sesi tamat selepas 8 jam; lima PIN salah dalam 15 minit mencetuskan tempoh menunggu. Jadual dan RPC hanya boleh dicapai service role dari Edge Function, walaupun `verify_jwt=false` kerana pengesahan sesi dibuat sendiri. Rujuk [panduan backend](../supabase/README.md) untuk pemulihan akses dan [Deployment](DEPLOYMENT.md) untuk release. Jangan masukkan rekod pelanggan sebenar ke config, fixtures atau laporan awam.
