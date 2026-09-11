# Laporan QA — implementasi 11 September 2026

Baseline audit asal lulus 76 pemeriksaan statik tetapi mempunyai bug pengguna. Selepas implementasi, semakan sekarang berdasarkan output dist dan browser sebenar.

| Semakan | Keputusan |
| --- | --- |
| Build | 16 halaman HTML penuh |
| Static output QA | 443 / 443 lulus |
| Unit date-only / enquiry helpers | 5 / 5 lulus |
| Playwright Chromium 153 | 31 / 31 lulus |
| Axe pada homepage light/dark, polisi EN, menu dan dialog | Tiada pelanggaran dalam rules/state yang diuji |
| JavaScript runtime | Tiada uncaught page error dalam aliran diuji |

Browser menguji lebar 320/390/768/1440, menu/fokus, no-JS BM/EN, roundtrip bahasa, package preset, dialog keyboard, form tidak sah/valid, anggaran, encoding, popup diblok dan metadata/aset. Unit cases termasuk leap day, hujung tahun dan timezone negatif. Static QA juga membuat HTTP requests terhadap output server dan menguji 404/private-path boundary.

Penambahbaikan galeri/pakej/pertanyaan menambah semakan penapis dan lihat lagi, subset dialog, gambar gagal/cuba lagi, swipe mendatar berbanding gerakan menegak, pintasan malam merentas tahun, deposit berasingan, pratonton yang sama dengan mesej WhatsApp, ralat ruangan, kad pilihan dan bar mobile yang menghormati fokus. Pertukaran bahasa mengekalkan seksyen selepas galeri berkembang; Tab pada header juga tidak lagi menatal halaman tanpa sengaja. Semakan visual BM/EN, desktop/mobile dan tema gelap dibuat pada kad pakej serta borang; harga didahulukan daripada nota deposit pada telefon.

Tiada mesej WhatsApp, pembayaran atau booking dihantar. Peranti fizikal/Safari/mobile data, ketepatan data owner, pin lapangan dan Search Console belum disahkan. Lihat PRE-LIVE-QA.md.

Selepas pembaikan background dan peta: Google iframe sebenar menunjukkan pin Jitra2Stay pada desktop/mobile dan halaman English. Butang Google Maps membuka place sedia ada dan Waze membuka destinasi `6.2805462,100.4151952`. Kedua-dua pautan membuka tab/aplikasi navigasi tanpa mengubah borang. Dalam suite automatik, kandungan iframe Google menggunakan fixture bagi mengelakkan kebergantungan pada rangkaian pihak ketiga; semakan peta sebenar dibuat berasingan.

Ulang semakan menggunakan arahan dalam README. Angka ini ialah snapshot suite semasa, bukan jaminan kualiti mutlak atau keputusan semua browser.
