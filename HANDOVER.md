# Jitra2Stay Handover

Dokumen ini ringkasan untuk owner atau developer lain sambung kerja website.

## Tujuan Website

Jitra2Stay ialah static brochure website untuk homestay di Jitra.

Flow utama:

1. Visitor tengok detail rumah, harga, kemudahan, gambar, lokasi dan polisi.
2. Visitor semak anggaran harga dan tarikh melalui form.
3. Visitor terus WhatsApp owner.
4. Owner confirm slot, harga dan bayaran secara manual melalui WhatsApp.

Website ini tidak ada:

- Login admin.
- Login user.
- Dashboard.
- Payment gateway.
- Database.

## Fail Penting

- `index.html` - homepage dan semua public sections utama.
- `style.css` - semua styling, responsive UI, dark/light mode.
- `app.js` - interaksi website, form WhatsApp, calendar, FAQ accordion, language/theme toggle.
- `app.config.js` - business config, unavailable dates, analytics optional, video optional.
- `policies.html` - polisi dan house rules.
- `thank-you.html` - page selepas WhatsApp.
- `404.html` - page fallback jika URL salah.
- `sitemap.xml` / `robots.txt` - SEO crawler.
- `images/` - gambar homestay.

## Dokumen Sokongan

- `README.md` - dokumentasi utama dan checklist besar.
- `OWNER-DATA-CHECKLIST.md` - data owner yang masih perlu diberi.
- `CONTENT-REVIEW.md` - approval ayat public oleh owner.
- `PRE-LIVE-QA.md` - checklist ringkas sebelum live.
- `DEPLOYMENT.md` - cara deploy.
- `SEO-SUBMISSION.md` - Google Search Console dan SEO selepas live.
- `IMAGE-AUDIT.md` - audit gambar.
- `MAINTENANCE.md` - cara maintain/update selepas live.
- `QA-REPORT.md` - laporan QA terakhir.
- `CHANGELOG.md` - ringkasan perubahan.

## Cara Run Local

```powershell
python -m http.server 5500
```

Buka:

```text
http://localhost:5500
```

## Cara Run QA

```powershell
node tools/qa-check.js
```

Jangan deploy jika QA gagal.

## Cara Update Harga

Update:

- `index.html` untuk card/text harga.
- `app.js` untuk `roomRates`.
- `README.md` / checklist jika perlu.

Lepas update:

```powershell
node tools/qa-check.js
```

## Cara Update Gambar

1. Masukkan gambar ke folder `images/`.
2. Update `src`, `alt`, width/height dan caption dalam `index.html`.
3. Compress gambar sebelum deploy.
4. Update `IMAGE-AUDIT.md` jika perlu.
5. Run QA.

## Cara Update Tarikh Tidak Tersedia

Edit `app.config.js`, bahagian `unavailableRanges`.

Format:

```js
{
  start: "2026-06-01",
  end: "2026-06-03",
  labelBm: "Ditempah",
  labelEn: "Booked"
}
```

## Jangan Buat

- Jangan tambah login/admin dalam website public.
- Jangan letak password WiFi public.
- Jangan letak nombor akaun bank public.
- Jangan letak IC/customer private info.
- Jangan letak testimoni palsu.
- Jangan ubah nombor WhatsApp di satu tempat sahaja; semak semua CTA.

## Status Akhir Semasa

QA automatik terakhir lulus 55 checks pada 2026-05-08.

Yang masih perlu sebelum live:

- Owner data final.
- Gambar latest.
- Phone test.
- Deploy.
- Submit sitemap ke Google Search Console.
