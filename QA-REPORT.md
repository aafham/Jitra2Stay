# Laporan QA — implementasi 11 September 2026

Baseline audit asal lulus 76 pemeriksaan statik tetapi mempunyai bug pengguna. Selepas implementasi, semakan sekarang berdasarkan output dist dan browser sebenar.

| Semakan | Keputusan |
| --- | --- |
| Build | 16 halaman HTML penuh |
| Static output QA | 427 / 427 lulus |
| Unit date-only / enquiry helpers | 5 / 5 lulus |
| Playwright Chrome | 23 / 23 lulus |
| Axe pada homepage light/dark, polisi EN, menu dan dialog | Tiada pelanggaran dalam rules/state yang diuji |
| JavaScript runtime | Tiada uncaught page error dalam aliran diuji |

Browser menguji lebar 320/390/768/1440, menu/fokus, no-JS BM/EN, roundtrip bahasa, package preset, dialog keyboard, form tidak sah/valid, anggaran, encoding, popup diblok dan metadata/aset. Unit cases termasuk leap day, hujung tahun dan timezone negatif. Static QA juga membuat HTTP requests terhadap output server dan menguji 404/private-path boundary.

Tiada mesej WhatsApp, pembayaran atau booking dihantar. Peranti fizikal/Safari/mobile data, ketepatan data owner, pin lapangan dan Search Console belum disahkan. Lihat PRE-LIVE-QA.md.

Ulang semakan menggunakan arahan dalam README. Angka ini ialah snapshot suite semasa, bukan jaminan kualiti mutlak atau keputusan semua browser.
