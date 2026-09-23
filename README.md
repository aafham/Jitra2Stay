# Jitra2Stay

Website homestay keluarga di Jitra, Kedah, dalam Bahasa Melayu dan Inggeris. Pengunjung boleh melihat rumah, harga, kemudahan dan tarikh penginapan sebelum menghubungi owner melalui WhatsApp.

[Lihat website](https://jitra2stay.vercel.app/) · [English](https://jitra2stay.vercel.app/en.html) · [Dokumentasi](docs/README.md)

## Fungsi utama

- Galeri foto rumah dan kemudahan dengan kategori.
- Pilihan pakej bilik, anggaran sewaan, deposit dan jumlah bayaran awal.
- Kalendar dengan tarikh berpenghuni berwarna merah. Tekan kad tetamu akan datang untuk melihat tarikh penginapannya.
- Borang pengurusan tetamu dengan akses PIN.
- Google Maps, Waze dan carian tempat berdekatan.
- Paparan desktop dan mobile, navigasi bawah pada telefon serta tema cerah/gelap.

Tempahan dan bayaran disahkan oleh owner melalui WhatsApp. Kalendar mengikut rekod yang dimasukkan oleh pengurusan; website tidak menerima bayaran online.

## Teknologi

HTML, CSS dan JavaScript dengan build menggunakan Node.js. Supabase menyimpan rekod tetamu. Frontend diterbitkan melalui Vercel dan GitHub Pages.

## Jalankan projek

Perlu **Node.js 22 atau lebih baharu**. Dari folder repo:

```sh
npm ci
npm run build
npm run preview
```

Buka [localhost:4173](http://127.0.0.1:4173). Selepas mengubah source, jalankan build semula. Untuk menyediakan backend sendiri, rujuk [panduan Supabase](supabase/README.md).

## Semakan

Selepas build, jalankan:

```sh
npm run qa
npm run test:unit
npx playwright install chromium
npm test
```

## Struktur repo

```text
src/        Kandungan, template, gaya, skrip dan gambar website
supabase/   Database dan API rekod tetamu
tools/      Build, preview dan semakan
tests/      Ujian automatik
docs/       Panduan dan rekod perubahan
```

Edit fail dalam `src/`; `dist/` ialah output build untuk diterbitkan. Terbitkan kandungan `dist/` sahaja.

Untuk mengubah harga dan maklumat homestay, lihat [site.config.cjs](src/data/site.config.cjs). Panduan lanjut: [penyelenggaraan](docs/MAINTENANCE.md), [deployment](docs/DEPLOYMENT.md) dan [urus tetamu](docs/GUEST-GUIDE.md).
