# Handover Jitra2Stay

Website kekal brochure statik + WhatsApp. Mulakan dengan README dan IMPLEMENTATION-2026-09-11.md; AUDIT-2026-09-11.md ialah rekod baseline sebelum pembaikan.

- Node 22+, npm ci, npm run build, npm run preview.
- Source data: site.config.cjs; HTML: templates; interaksi: app.js; visual: style.css.
- dist ialah satu-satunya output publish; jangan edit atau upload root.
- Vercel Git integration dan GitHub Pages Actions menggunakan source repo sama; Netlify/cPanel juga mesti guna dist.
- Sebelum merge: static/unit/browser tests dan semakan visual. Selepas production: URL public/404/metadata/private-files dan phone manual.
- Masih perlukan owner: gambar bilik air, labelkatil/parking/kemudahan, peak season, booking payment dan refund final.

Jangan hidupkan semula kalendar, admin, payment atau analytics tanpa keperluan produk baharu. Jangan masukkan rekod pelanggan ke config public.
