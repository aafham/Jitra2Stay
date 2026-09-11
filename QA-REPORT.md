# Laporan QA — UI/UX seluruh website 12 September 2026

Baseline audit asal lulus 76 pemeriksaan statik tetapi mempunyai bug pengguna. Selepas implementasi, semakan sekarang berdasarkan output dist dan browser sebenar.

| Semakan | Keputusan |
| --- | --- |
| Build | 16 halaman HTML penuh |
| Static output QA | 464 / 464 lulus |
| Unit tarikh, draf dan perkongsian | 11 / 11 lulus |
| Playwright Chromium 153 | 53 / 53 lulus |
| Axe pada homepage light/dark, polisi EN, menu dan dialog | Tiada pelanggaran dalam rules/state yang diuji |
| JavaScript runtime | Tiada uncaught page error dalam aliran diuji |

Browser menguji lebar 320/390/768/1440, menu/fokus, no-JS BM/EN, roundtrip bahasa, package preset, dialog keyboard, form tidak sah/valid, anggaran, encoding, popup diblok dan metadata/aset. Unit cases termasuk leap day, hujung tahun dan timezone negatif. Static QA juga membuat HTTP requests terhadap output server dan menguji 404/private-path boundary.

Penambahbaikan galeri/pakej/pertanyaan menambah semakan penapis dan lihat lagi, subset dialog, gambar gagal/cuba lagi, swipe mendatar berbanding gerakan menegak, pintasan malam merentas tahun, deposit berasingan, pratonton yang sama dengan mesej WhatsApp, ralat ruangan, kad pilihan dan bar mobile yang menghormati fokus. Pertukaran bahasa mengekalkan seksyen selepas galeri berkembang; Tab pada header juga tidak lagi menatal halaman tanpa sengaja. Semakan visual BM/EN, desktop/mobile dan tema gelap dibuat pada kad pakej serta borang; harga didahulukan daripada nota deposit pada telefon.

Pemulihan kandungan menggunakan maklumat owner dalam repo asal `18a274d`, dengan rujukan fail/baris di `RESTORED-CONTENT.md`. Semakan merangkumi butiran bilik berfoto, parking, TV/WiFi, akses bilik air, bayaran, pembatalan, nombor kedua dan tempat berdekatan dalam BM/EN. Penambahan draf dan perkongsian turut memerlukan pemeriksaan pertukaran bahasa/reload, reset, tamat tempoh, storage tidak tersedia serta menu kongsi/salin pautan. Pautan perkongsian menggunakan URL homepage, tanpa butiran pertanyaan.

Pusingan seterusnya menguji FAQ mengikut topik tanpa mengubah 15 jawapan asal, salin alamat lengkap serta fallback manual yang boleh dipilih, dan thumbnail galeri yang mengikuti kategori/gambar/penerangan semasa. Tiada gambar thumbnail dimasukkan sebelum dialog dibuka. Semakan menu telefon meliputi fokus keluar dan sentuhan luar pada 390×844 serta 568×320; elemen yang difokus tidak ditutup menu. Semakan visual galeri termasuk paparan melintang yang mengekalkan gambar dan thumbnail pilihan dalam skrin. Semua maklumat owner dalam config dibandingkan dengan versi terdahulu dan kekal sama selepas metadata topik dikecualikan.

Tiada mesej WhatsApp, pembayaran atau booking dihantar. Maklumat rumah mengikut sumber asal owner; ini bukan pemeriksaan fizikal baharu. Peranti fizikal/Safari/mobile data, pin lapangan dan Search Console belum diperiksa dalam pusingan ini. Lihat PRE-LIVE-QA.md.

Semakan seluruh halaman mendapati bar mobile menutup kawalan semasa Tab, validasi browser meletakkan input pertama di bawah header, pertukaran bahasa polisi kehilangan topik dan butang WhatsApp umum tidak menggunakan draf sah. Enam kes tambahan dalam `tests/full-ui.spec.cjs` menguji pembaikan ini pada 390/768px serta BM/EN, tanpa mengubah 47 kes terdahulu. Perbandingan pakej, galeri, kemudahan, FAQ, borang, footer, polisi dan panduan turut diperiksa melalui screenshot desktop/tablet/telefon. Konflik specificity footer pada telefon ditemui melalui pemeriksaan visual dan dibetulkan. `site.config.cjs` tidak berubah dalam pusingan ini. Lihat `UI-UX-REVIEW-2026-09-12.md` untuk semakan mengikut bahagian.

Selepas pembaikan background dan peta: Google iframe sebenar menunjukkan pin Jitra2Stay pada desktop/mobile dan halaman English. Butang Google Maps membuka place sedia ada dan Waze membuka destinasi `6.2805462,100.4151952`. Kedua-dua pautan membuka tab/aplikasi navigasi tanpa mengubah borang. Dalam suite automatik, kandungan iframe Google menggunakan fixture bagi mengelakkan kebergantungan pada rangkaian pihak ketiga; semakan peta sebenar dibuat berasingan.

Ulang semakan menggunakan arahan dalam README. Angka ini ialah snapshot suite semasa, bukan jaminan kualiti mutlak atau keputusan semua browser.
