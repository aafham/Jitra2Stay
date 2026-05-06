# Jitra2Stay Deployment Guide

Website ini ialah static site. Tiada backend, tiada login, tiada database, dan tiada payment gateway.

## Sebelum Deploy

Jalankan QA automatik:

```powershell
node tools/qa-check.js
```

Pastikan checklist ini selesai:

- [ ] `OWNER-DATA-CHECKLIST.md` sudah disemak untuk data final.
- [ ] `PRE-LIVE-QA.md` sudah dibuat untuk phone test.
- [ ] Gambar final sudah masuk folder `images/`.
- [ ] Nombor WhatsApp betul.
- [ ] Domain dalam `app.config.js`, `index.html`, `sitemap.xml`, dan `robots.txt` betul.
- [ ] Tiada password WiFi atau info sensitif dalam website public.

## Deploy Ke Vercel

Cara paling mudah:

1. Push repo ini ke GitHub.
2. Masuk Vercel.
3. Import GitHub repo `Jitra2Stay`.
4. Framework preset: pilih `Other` jika ditanya.
5. Build command: kosongkan.
6. Output directory: kosongkan atau root.
7. Deploy.
8. Set domain `jitra2stay.com` jika domain sudah tersedia.

Selepas deploy:

- [ ] Buka homepage live.
- [ ] Buka `https://jitra2stay.com/sitemap.xml`.
- [ ] Buka `https://jitra2stay.com/robots.txt`.
- [ ] Test WhatsApp CTA dari phone sebenar.
- [ ] Test Google Maps link.

## Deploy Ke Netlify

1. Push repo ini ke GitHub.
2. Masuk Netlify.
3. Add new site from Git.
4. Pilih repo.
5. Build command: kosongkan.
6. Publish directory: root repo.
7. Deploy.
8. Set custom domain jika perlu.

## Deploy Ke cPanel / Shared Hosting

Upload semua fail ini ke `public_html`:

- `index.html`
- `style.css`
- `app.js`
- `app.config.js`
- `policies.html`
- `thank-you.html`
- `ms.html`
- `en.html`
- `sitemap.xml`
- `robots.txt`
- folder `images/`

Fail dokumentasi seperti `README.md`, `CHANGELOG.md`, `OWNER-DATA-CHECKLIST.md`, dan `PRE-LIVE-QA.md` tidak wajib upload.

## Deploy Ke GitHub Pages

1. Push repo ke GitHub.
2. Buka Settings > Pages.
3. Source: Deploy from a branch.
4. Branch: `main`.
5. Folder: `/root`.
6. Save.

Nota: Untuk domain sendiri, tambah custom domain dalam GitHub Pages dan update DNS.

## Selepas Deploy

- [ ] Buka website live di desktop.
- [ ] Buka website live di phone.
- [ ] Semak dark/light mode.
- [ ] Submit sitemap ke Google Search Console.
- [ ] Test share preview WhatsApp/Facebook.
- [ ] Semak Google Business Profile.
