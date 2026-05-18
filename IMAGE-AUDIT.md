# Jitra2Stay Image Audit

Audit semasa untuk gambar dalam folder `images/`.

## Status 2026-05-18

- [x] Gambar latest telah direview.
- [x] Gambar pilihan telah dioptimize untuk website.
- [x] Raw gambar/video besar dipindahkan ke `source-images/latest-raw/` supaya folder public `images/` kekal ringan.
- [x] Video walkthrough diskip dahulu sehingga owner beri versi kecil.
- [x] Gallery homepage telah dikemas kini dengan gambar latest.
- [x] Versi WebP telah dibuat untuk semua gambar JPG semasa.
- [x] Homepage guna `<picture>` untuk WebP dengan JPG fallback.

## Saiz Gambar Website Semasa

| Gambar | Sumber raw | Kegunaan | Saiz |
| --- | --- | --- | ---: |
| `halaman.jpg` | `IMG_8012.JPG` | Hero, share preview, exterior depan | 328 KB |
| `ruang-tamu.jpg` | `IMG_7988.JPG` | Ruang tamu, CTA | 255 KB |
| `ruang-makan.jpg` | `IMG_7991.JPG` | Ruang makan dan pantry | 204 KB |
| `tangga-ruang-makan.jpg` | `IMG_7992.JPG` | Ruang makan + tangga 2 tingkat | 215 KB |
| `bilik-tidur.jpg` | `IMG_8001.JPG` | Bilik tidur utama | 249 KB |
| `bilik-keluarga.jpg` | `IMG_7997.JPG` | Bilik keluarga | 252 KB |
| `bilik-besar.jpg` | `IMG_7968.JPG` | Bilik besar / simpanan gallery | 267 KB |
| `dapur.jpg` | `IMG_8005.JPG` | Pantry dan kemudahan dapur | 243 KB |
| `luar-rumah.jpg` | `IMG_8008.JPG` | Exterior / halaman | 318 KB |
| `parking.jpg` | `IMG_8015.JPG` | Parking luas | 316 KB |
| `porch-parking.jpg` | `IMG_8021.JPG` | Porch dan kawasan luar | 243 KB |

Semua gambar website semasa berada bawah 350 KB setiap satu.

## Saiz WebP Semasa

| Gambar | Saiz WebP |
| --- | ---: |
| `halaman.webp` | 317 KB |
| `ruang-tamu.webp` | 154 KB |
| `ruang-makan.webp` | 100 KB |
| `tangga-ruang-makan.webp` | 103 KB |
| `bilik-tidur.webp` | 131 KB |
| `bilik-keluarga.webp` | 137 KB |
| `bilik-besar.webp` | 139 KB |
| `dapur.webp` | 148 KB |
| `luar-rumah.webp` | 211 KB |
| `parking.webp` | 209 KB |
| `porch-parking.webp` | 141 KB |

## Gambar Yang Sudah Cukup Untuk Website Semasa

- [x] Hero utama website.
- [x] Share preview / thumbnail.
- [x] Exterior depan rumah siang.
- [x] Parking jelas.
- [x] Ruang tamu wide angle.
- [x] Ruang makan.
- [x] Dapur / pantry.
- [x] Beberapa gambar bilik tidur untuk gallery.
- [x] Gambar porch / kawasan luar.

## Masih Elok Tambah Kemudian

- [ ] Gambar semua 5 bilik tidur yang owner mahu label satu per satu.
- [ ] Gambar semua 3 bilik air.
- [ ] Gambar exterior malam jika ada.
- [ ] Gambar kemudahan penting secara dekat: TV, peti ais, mesin basuh, iron, water heater.
- [ ] Video walkthrough kecil, contoh 15-40 saat dan saiz web-friendly.

## Nota

Raw files asal disimpan dalam `source-images/latest-raw/`. Jangan upload folder itu sebagai public website jika deploy manual, sebab ada fail besar termasuk video.
