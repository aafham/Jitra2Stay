# Jitra2Stay Maintenance Guide

Guide ini untuk update website selepas live.

## QA Setiap Kali Lepas Edit

Jalankan:

```powershell
node tools/qa-check.js
```

Jika QA gagal, jangan deploy dulu. Baca mesej `FAIL` dan betulkan item yang disebut.

## Update Nombor Telefon / WhatsApp

Fail yang perlu semak:

- `app.config.js`
- `index.html`
- `policies.html`
- `thank-you.html`
- `404.html`

Lepas update, run:

```powershell
node tools/qa-check.js
```

## Update Harga

Fail utama:

- `index.html` untuk text harga/card harga.
- `app.js` untuk `roomRates`.
- `README.md` dan `OWNER-DATA-CHECKLIST.md` jika checklist perlu selari.

Pastikan:

- [ ] Harga card sama dengan `roomRates`.
- [ ] Anggaran harga form masih betul.
- [ ] WhatsApp message masih bawa anggaran harga.

## Update Tarikh Tidak Tersedia

Fail:

- `app.config.js`

Cari:

```js
unavailableRanges
```

Tambah tarikh dengan format:

```js
{
  start: "2026-06-01",
  end: "2026-06-03",
  labelBm: "Ditempah",
  labelEn: "Booked"
}
```

Jika mahu sync calendar kemudian, isi `bookingCalendarIcsUrl`.

## Update Gambar

Fail/folder:

- Folder `images/`
- `index.html` untuk `src`, `alt`, width/height dan caption.
- `IMAGE-AUDIT.md` untuk catatan audit.

Cadangan:

- Compress gambar sebelum masuk website.
- Hero bawah 350 KB jika boleh.
- Gambar biasa bawah 250 KB jika boleh.
- Pastikan nama fail ringkas, contoh `bilik-utama.jpg`.
- Jangan letak gambar blur/gelap.

Lepas update gambar:

```powershell
node tools/qa-check.js
```

## Update Polisi / FAQ

Fail:

- `index.html` untuk FAQ homepage dan ringkasan rules.
- `policies.html` untuk polisi penuh.
- `CONTENT-REVIEW.md` untuk approval owner.

Pastikan:

- [ ] Polisi homepage dan `policies.html` tidak bercanggah.
- [ ] Tiada data sensitif seperti password WiFi atau nombor akaun bank.
- [ ] BM dan EN sama maksud.

## Update SEO

Fail:

- `index.html` untuk meta title/description/OG.
- `sitemap.xml` untuk URL dan `lastmod`.
- `robots.txt` jika domain berubah.
- `SEO-SUBMISSION.md` untuk proses submit.

Selepas deploy:

- [ ] Submit sitemap di Google Search Console.
- [ ] Test share preview WhatsApp/Facebook.
- [ ] Semak Google Business Profile.

## Update Dokumentasi

Jika perubahan besar dibuat:

- Update `CHANGELOG.md`.
- Update `README.md` checklist jika item sudah siap.
- Update `OWNER-DATA-CHECKLIST.md` jika data owner sudah final.
- Update `PRE-LIVE-QA.md` jika ada step baru.
