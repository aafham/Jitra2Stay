# Gambar website — 11 September 2026

Semua 51 JPG kamera sedia ada diperiksa. Lima kumpulan bilik yang berbeza dikenali; dua kumpulan yang belum digunakan ditambah sebagai foto web. Tiada foto bilik air, exterior malam atau close-up mesin basuh dalam set tersebut.

| Tambahan | Asal | Kapsyen awam |
| --- | --- | --- |
| bilik-dua-katil.jpg | IMG_7973.JPG | Bilik dengan dua katil / Bedroom with two beds |
| bilik-kusyen-biru.jpg | IMG_7977.JPG | Bilik dengan kusyen biru / Bedroom with blue cushions |

Kedua-duanya diorientasi ikut EXIF, diresize secara berkadar maksimum 1600px dan dibuang metadata. Tiada objek/warna/kelengkapan ditambah atau dipadam. Label tidak mendakwa nombor bilik atau ukuran katil rasmi.

13 JPG web mempunyai 52 WebP responsif: 480, 800, 1200 dan saiz penuh. Halaman ialah 1500px, dapur 1400px; yang lain 1600px. Tiada upscaling. Saiz/sha/dimensi/provenance dalam images/responsive/manifest.json; file itu bukan output awam.

Hero 480px: 30,970 bait; 800px: 89,434 bait. Pelayar memilih calon melalui picture/srcset/sizes. Tiada preload format lain yang tidak menjadi hero. Foto galeri boleh menggunakan thumbnail berlainan daripada hero bagi subjek sama.

Regenerasi: npm ci, kemudian npm run optimize:images. Script membaca JPG web yang dikomit; raw 315.5 MiB tidak diperlukan. Semua 52 output disahkan dimensi, metadata kosong dan repeat-run hash sama pada runtime yang diuji.

Build hanya menyalin 11 foto galeri yang digunakan beserta varian dan fallback JPG. Arkib sumber dan foto web tidak digunakan tidak dipublish. Tambah foto tiga bilik air apabila owner beri gambar sebenar.
