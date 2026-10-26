# Jitra2Stay

Website homestay keluarga di **Jitra, Kedah**, dalam Bahasa Melayu dan Inggeris. Lihat rumah, bandingkan pakej dan semak tarikh sebelum menghubungi owner melalui WhatsApp.

**[Buka website](https://jitra2stay.vercel.app/)** · [English](https://jitra2stay.vercel.app/en.html) · [Dokumentasi](docs/README.md)

## Apa yang ada

- **Rumah & kemudahan** — galeri foto sebenar mengikut kategori, kemudahan dan ringkasan ulasan tetamu.
- **Harga & pertanyaan** — pilihan pakej bilik, anggaran sewaan + deposit dan mesej WhatsApp yang siap diisi.
- **Kalendar penginapan** — malam yang sudah direkodkan ditanda merah. Tekan kad tetamu akan datang untuk melihat tarikhnya.
- **Lokasi & perjalanan** — peta dalam website, butang Google Maps/Waze, foto ketibaan dan carian tempat berdekatan.
- **Paparan fleksibel** — desktop, halaman khusus dengan navigasi bawah pada mobile, serta tema cerah/gelap.

**Tempahan dan bayaran disahkan oleh owner.** Website tidak menerima bayaran online; kalendar mengikut rekod yang dimasukkan oleh pengurusan.

## Pengurusan tetamu

Pengurusan boleh menambah, mengubah atau membatalkan rekod melalui **Urus tetamu**, dilindungi PIN. Tarikh masuk, tarikh keluar dan nama wajib; bilangan orang dan tujuan ialah pilihan.

Kalendar dan senarai tetamu boleh dilihat umum. Tujuan penginapan hanya untuk pengurusan. Rujuk [panduan urus tetamu](docs/GUEST-GUIDE.md).

## Jalankan projek

Perlu **Node.js 22 atau lebih baharu**. Dari folder repo:

```sh
npm ci
npm run dev
```

Buka [localhost:4173](http://127.0.0.1:4173). Selepas mengubah source, jalankan `npm run build` semula dan refresh browser.

Website menggunakan HTML, CSS dan JavaScript, dengan Node.js untuk build. Kalendar dan rekod tetamu menggunakan Supabase; untuk menyediakan backend sendiri, ikut [panduan Supabase](supabase/README.md).

## Struktur & kemas kini

| Folder | Kandungan |
| --- | --- |
| `src/` | Data homestay, template, gaya, skrip dan gambar |
| `supabase/` | Database dan API rekod tetamu |
| `tools/` | Build, server lokal dan semakan |
| `tests/` | Ujian automatik |
| `docs/` | Panduan, audit dan rekod perubahan |

- **Harga dan maklumat homestay:** edit [site.config.cjs](src/data/site.config.cjs).
- **Foto, reka bentuk dan fungsi:** rujuk [panduan penyelenggaraan](docs/MAINTENANCE.md).
- **Rekod tetamu:** kemas kini melalui borang Urus tetamu di website.

Edit fail dalam `src/`. Folder `dist/` dijana semasa build dan tidak perlu diedit secara manual.

## Semakan & penerbitan

```sh
npm run build
npm run qa
npm run test:unit
npx playwright install chromium
npm test
```

Branch **`main`** digunakan untuk production di Vercel. GitHub Pages menyediakan salinan website selepas semakan automatik lulus. Hanya kandungan **`dist/`** diterbitkan; backend Supabase dikemas kini berasingan.

Panduan lanjut: [Deployment](docs/DEPLOYMENT.md) · [Rekod perubahan](docs/CHANGELOG.md) · [Semua dokumentasi](docs/README.md)
