# Gambar website — dikemas kini 23 September 2026

Galeri semasa mempunyai **21 foto**: 11 foto rumah/bilik sedia ada dan semua 10 foto kemudahan yang dihantar owner pada 23 September 2026. Kategori ialah 5 bilik tidur, 3 ruang bersama, 8 kemudahan, 2 bilik air dan 3 luar rumah. Foto menegak menggunakan bingkai penuh supaya peralatan tidak terpotong.

## Set tambahan owner

| Fail yang dihantar | JPG web | Kapsyen awam BM / EN |
| --- | --- | --- |
| Photo 1.jpg | `mesin-basuh.jpg` | Mesin basuh / Washing machine |
| Photo 2.jpg | `penapis-air-air-fryer.jpg` | Penapis air dan air fryer / Water dispenser and air fryer |
| Photo 3.jpg | `peti-sejuk-microwave.jpg` | Peti sejuk dan microwave / Fridge and microwave |
| Photo 4.jpg | `tv-wifi.jpg` | TV dan WiFi / TV and WiFi |
| Photo 5.jpg | `seterika-papan.jpg` | Seterika dan papan seterika / Iron and ironing board |
| Photo 6.jpg | `tv-peti-sejuk.jpg` | Sudut TV dan peti sejuk / TV and fridge area |
| Photo 7.jpg | `sudut-seterika.jpg` | Sudut menggosok pakaian / Ironing area |
| Photo 8.jpg | `pemanas-air.jpg` | Pancuran dan water heater / Shower and water heater |
| Photo 9.jpg | `kotak-kunci.jpg` | Kotak kunci self check-in / Self check-in key box |
| Photo 10.jpg | `bilik-air.jpg` | Bilik air / Bathroom |

Foto mengesahkan subjek yang terlihat dan dibekalkan sendiri oleh owner. Kapsyen tidak menyimpulkan tingkat, nombor bilik air atau jumlah unit setiap peralatan. Foto bilik air dan pancuran kini tersedia, tetapi set ini tidak mendokumenkan ketiga-tiga bilik air secara berasingan. Tiada dakwaan baharu tentang saiz TV, kelajuan WiFi, langganan penstriman atau pemeriksaan fizikal.

Lapan foto tanpa maklumat akses dikecilkan secara berkadar daripada 2880×3840 kepada **1200×1600**, dengan orientasi dibetulkan dan metadata dibuang. Kandungan rumah tidak disunting.

Photo 4 dan Photo 9 diproses dengan imagegen untuk menutup maklumat akses menggunakan penutup legap: notis WiFi serta pelekat QR pada penghala, dan paparan dail kotak kunci. JPG web akhirnya bersaiz **1086×1448** dengan metadata dibuang. Penutupan ini turut kekal pada setiap WebP, thumbnail, gambar dialog dan fallback JPG. Salinan asal yang mendedahkan maklumat tersebut tidak dikomit atau dihantar ke output website.

Semua 10 fail asal baharu disimpan di folder workspace `work/owner-photo-originals-2026-09-23`, di luar repo. `tools/owner-photo-sources.json` merekod label upload, tarikh diterima, SHA-256 fail asal dan `privacyEdits`. Rekod ini dibawa ke `ownerUpload` dalam manifest; kedua-dua fail rekod dikecualikan daripada output website. Rekod provenance tidak mengandungi nilai kod akses.

## Varian dan penerbitan

Repo mempunyai **23 JPG web dan 82 WebP responsif**. Build menerbitkan hanya **21 JPG galeri yang digunakan serta 74 variannya**. `luar-rumah.jpg` dan `tangga-ruang-makan.jpg` beserta varian tidak digunakan tidak termasuk output.

- Foto terdahulu mempunyai varian 480, 800, 1200 dan saiz penuh, tanpa upscaling.
- Setiap foto baharu mempunyai tiga varian: 480, 800 dan lebar penuh JPG web (1200 atau 1086px).
- Dimensi, saiz, hash dan provenance berada dalam `images/responsive/manifest.json`; manifest bukan output website.
- Hero asal kekal: calon 480px ialah 30,970 bait dan 800px ialah 89,434 bait. Pelayar memilih foto melalui `picture`/`srcset`/`sizes`.
- Sembilan kad kemudahan menggunakan `facilities[].photos` untuk menjana 14 pautan kepada foto sebenar. Galeri awal tetap enam foto; kategori, lihat lagi, dialog dan kandungan tanpa JavaScript memberi akses kepada seluruh set.

Regenerasi: `npm ci`, kemudian `npm run optimize:images`. Script membaca JPG web yang dikomit dan rekod provenance; fail upload baharu atau arkib kamera lama tidak diperlukan. Oleh sebab JPG TV/WiFi dan kotak kunci sudah ditutup maklumat aksesnya, regenerasi tidak mendedahkan semula butiran tersebut. Jangan mengganti JPG web ini dengan upload asal.

## Rekod semakan arkib — 11 September 2026

Semua **51 JPG kamera terdahulu** diperiksa pada audit asal. Lima kumpulan bilik yang berbeza dikenali; dua kumpulan yang belum digunakan ditambah sebagai foto web. Set terdahulu tidak mempunyai foto bilik air, exterior malam atau close-up mesin basuh; foto bilik air dan mesin basuh kini hadir dalam set 23 September.

| Tambahan terdahulu | Asal | Kapsyen awam |
| --- | --- | --- |
| `bilik-dua-katil.jpg` | IMG_7973.JPG | Bilik dengan dua katil / Bedroom with two beds |
| `bilik-kusyen-biru.jpg` | IMG_7977.JPG | Bilik dengan kusyen biru / Bedroom with blue cushions |

Kedua-duanya diorientasi mengikut EXIF, dikecilkan secara berkadar maksimum 1600px dan dibuang metadata. Tiada objek, warna atau kelengkapan ditambah atau dipadam. Label tidak mendakwa nombor bilik atau ukuran katil rasmi. Semua 52 varian terdahulu disahkan dimensi, metadata kosong dan repeat-run hash sama pada runtime audit asal.

Arkib kamera terdahulu sekitar 315.5 MiB masih berada dalam `source-images/latest-raw/` di repo; build dan unggahan Vercel mengecualikannya daripada website. Pengecualian daripada output website tidak menjadikan arkib yang sudah dikomit itu peribadi. Dasar menyimpan fail di luar repo digunakan untuk **10 upload baharu**.
