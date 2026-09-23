# Semakan UI/UX seluruh website — 12 September 2026

> Rekod bertarikh: penemuan, angka ujian dan path di bawah merujuk keadaan ketika audit. Source kini disusun dalam `src/`; lihat [struktur semasa](../README.md#struktur-repo) dan [indeks dokumentasi](README.md).

Pusingan ini menyemak perjalanan tetamu dari header hingga footer, kemudian polisi, panduan setempat dan halaman pemulihan. Tujuannya memudahkan orang melihat rumah, membandingkan pakej, mencari arah dan menyediakan pertanyaan. Website kekal statik untuk paparan dan pertanyaan WhatsApp.

## Keputusan mengikut bahagian

| Bahagian | Penemuan dan hasil |
| --- | --- |
| Header, hero dan background | Foto rumah, warna hijau/cream, tindakan utama dan pilihan BM/EN dikekalkan. Menu, fokus dan bar mobile disemak. |
| Ringkasan rumah | Fakta asal kekal; pembahagi fakta dan saiz teks dikemaskan supaya bilangan bilik/bilik air mudah diimbas. |
| Galeri dan bilik | Panduan bilik dipindah selepas grid supaya foto terlihat lebih awal. Kapsyen mendapat ruang dan kontras yang lebih jelas; 11 foto, penapis, thumbnail, swipe serta penerangan bilik dikekalkan. |
| Pakej dan caj | Empat kad sebaris pada desktop dan dua kolum pada skrin kecil. Harga didahulukan; deposit, caj tambahan, contoh pembahagian dan syarat penginapan dipisahkan dengan lebih jelas. |
| Kemudahan | Kad tiga kolum desktop, dua tablet dan satu telefon. Teks panjang tidak lagi dihimpit dalam dua kolum telefon. |
| Lokasi | Google Maps terbenam, alamat/salin alamat, Google Maps/Waze dan tempat berdekatan dikekalkan serta diuji bersama layout baharu. |
| FAQ | Ruang menegak dirapatkan sambil mengekalkan sasaran sentuh. Semua 15 jawapan dan penapis topik kekal. |
| Borang pertanyaan | Butang submit diberi ruang daripada anggaran. Butang kosongkan hanya muncul selepas perubahan. Input salah pertama difokus di tengah skrin, jelas daripada header. |
| WhatsApp | Butang umum menggunakan mesej borang yang sama apabila sah; jika borang tidak sah atau dikosongkan, mesej asal dipulihkan. Draf, pratonton, salin mesej dan fallback kekal. |
| Navigasi telefon/keyboard | Bar bawah menyorok apabila menghalang kawalan yang sedang difokus, termasuk footer halaman sokongan; pautan bar yang sedang difokus kekal terlihat. |
| Polisi | Indeks 11 topik dengan pautan terus. Pertukaran BM/EN mengekalkan topik dokumen yang sah; hash tidak dikenali dibuang. |
| Panduan setempat | Alamat serta Google Maps/Waze muncul sebelum panduan berkaitan. Pautan berkaitan menjadi kad yang mudah ditekan. |
| Footer | Contact dan pautan penginapan dikumpulkan, FAQ serta kembali ke atas ditambah. Konflik CSS telefon yang menyebabkan teks bertindih telah dibetulkan. |
| 404/halaman legacy | Pautan pemulihan dan layout bersama disemak; tiada aliran booking atau redirect automatik ditambah. |

## Kandungan yang dikekalkan

`site.config.cjs` sama dengan baseline `949681314165adf0f3c3780e08c4bfa3c5307839` sebelum pusingan ini. Tiada perubahan kepada nombor owner, harga RM180/RM230/RM280/RM330, 5 bilik/3 bilik air, kapasiti, deposit RM100, caj tambahan, waktu ketibaan, polisi, kemudahan, foto atau destinasi peta. Maklumat asal tidak diganti dengan permintaan mendapatkan data semula.

## Pengesahan

- Build: 16 halaman HTML; hanya `dist/` diterbitkan.
- 464/464 semakan output statik, 11/11 unit dan 53/53 browser tests lulus.
- Enam browser cases baharu menguji fokus/bar mobile, ralat pertama, polisi merentas bahasa dan mesej WhatsApp umum. Semua 47 kes terdahulu dikekalkan.
- Semakan visual homepage dari atas hingga bawah pada telefon 390px, tablet 768px dan desktop 1440px, bersama semakan polisi/panduan/footer dan tema gelap. Suite turut menguji 320px serta 568×320.
- Tiada overflow mendatar atau uncaught page error dalam aliran/saiz yang diperiksa. Axe diuji pada state/tema utama.
- Tiada mesej sebenar, bayaran atau tempahan dihantar. Peta pihak ketiga menggunakan fixture dalam suite; pin/Google Maps/Waze sebenar telah disemak berasingan.

Angka ini merekod suite Chromium dan pemeriksaan visual semasa. Telefon fizikal serta Safari sebenar tidak diuji dalam pusingan ini. Arahan mengulang ujian berada dalam README dan maklumat penyelenggaraan dalam MAINTENANCE.md.
