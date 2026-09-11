# Changelog

## 2026-09-11 — Galeri, pilihan pakej dan pertanyaan

- Tambah penapis galeri Semua/Bilik tidur/Ruang bersama/Luar rumah, kiraan foto dan butang lihat lagi/ringkaskan. Semua 11 foto tetap tersedia tanpa JavaScript.
- Dialog mengikuti kategori aktif, menyokong leretan mendatar dan keyboard, serta menyediakan status muatan, cuba lagi dan pautan JPG web apabila gambar gagal dimuatkan.
- Gantikan jadual kadar dengan kad pakej yang menyelaraskan pilihan ke borang pertanyaan.
- Tambah pintasan 1–3 malam, pecahan sewaan/deposit, ralat ruangan BM/EN dan pratonton mesej sebelum membuka WhatsApp. Tarikh dan harga akhir masih disahkan oleh owner.
- Tambah penanda navigasi aktif dan kekalkan bahagian homepage semasa menukar bahasa. Bar mobile Harga/WhatsApp menyorok ketika mengisi borang atau apabila kawalan pertanyaan sudah terlihat.
- Pecahkan bahagian kepada `templates/gallery.cjs`, `templates/rates.cjs` dan `templates/enquiry.cjs`, dengan aset `gallery.js`/`gallery.css` serta `navigation.js`/`navigation.css`. Background rumah dan peta Google/Google Maps/Waze daripada perubahan terdahulu dikekalkan.

## 2026-09-11 — Background dan navigasi peta

- Kembalikan foto rumah sebagai background hero dengan overlay hijau dan warna cream/sage, termasuk mobile serta tema gelap.
- Paparkan Google Maps interaktif terus dalam bahagian lokasi BM/EN; tiada butang tambahan untuk memuatkan peta.
- Tambah butang berasingan Google Maps dan Waze. Waze menggunakan koordinat yang disemak terhadap pin Google sedia ada.
- Dokumentasi penyelenggaraan dan privasi menerangkan peta terbenam. Ujian imej membezakan penggunaan foreground, galeri dan background; Google iframe digantikan fixture hanya dalam suite automatik, dengan peta sebenar diperiksa berasingan.

## 2026-09-11 — Website paparan homestay v2

- Susunan UI/UX baharu, gambar awal dan harga padat.
- Halaman statik BM/EN, polisi/panduan berpasangan dan metadata domain aktif.
- Menu/no-JS/keyboard/dialog/kontras diperbaiki; enquiry date-only tanpa kalendar/tracking/redirect.
- Dua foto bilik sebenar serta 52 varian responsif; output dist mengecualikan raw dan dokumen.
- 427 static checks, 5 unit, 24 browser tests dan CI/Pages pipeline.
- Source/template/build/documentation diselaraskan. Terma owner dan gambar bilik air masih memerlukan pengesahan.

## Rekod perubahan terdahulu

Ringkasan perubahan penting website Jitra2Stay.

## 2026-05-18

- Review gambar latest dalam folder `images/`.
- Optimize dan rename gambar pilihan untuk website: hero, ruang tamu, ruang makan, pantry, bilik, parking, exterior dan porch.
- Update gallery homepage daripada 4 gambar kepada 8 gambar latest.
- Tukar hero background kepada gambar exterior rumah sebenar.
- Pindahkan raw `IMG_*.JPG` dan `.MOV` besar ke `source-images/latest-raw/` supaya folder public `images/` kekal ringan.
- Video walkthrough diskip dahulu sehingga owner beri versi kecil.
- Kemas semula `OWNER-DATA-CHECKLIST.md` ikut status siap, test wajib sebelum live, data masih perlu confirm dan optional kemudian.
- Update `README.md`, `OWNER-DATA-CHECKLIST.md`, `IMAGE-AUDIT.md`, dan `QA-REPORT.md`.
- Run QA automatik dan semua 55 checks lulus.
- Kemas kini section Tempat Berdekatan ikut kategori masa perjalanan.
- Tambah copywriting promosi siap pakai untuk Facebook, WhatsApp dan listing website.
- Audit semula checklist dalam `README.md` dan tick item yang memang sudah settle dalam website.
- Ringkaskan checklist data owner dalam `README.md` supaya selari dengan `OWNER-DATA-CHECKLIST.md`.
- Tambah 4 halaman SEO: Hospital Jitra, konvokesyen UUM, keluarga besar dan tempat sekitar Jitra.
- Generate versi WebP untuk gambar semasa dan update homepage dengan JPG fallback.
- Tambah flow "cara semak tarikh" supaya tetamu faham tarikh website ialah rujukan awal.
- Tambah `WHATSAPP-TEMPLATES.md` untuk operasi owner.
- Kemas `PRE-LIVE-QA.md` dan `MAINTENANCE.md`.

## 2026-05-05

- Buang scope admin/login/user account supaya website kekal view-only dan direct WhatsApp.
- Kemas kini harga flexy 2, 3, 4 dan 5 bilik berdasarkan rate sebenar.
- Tambah house rules, security deposit, extra guest, early/late check-in charge dan payment manual daripada dokumen owner.
- Polish UI homepage untuk hero, pricing, cara tempah, form tarikh, about, facilities, location, FAQ, final CTA dan footer.
- Betulkan dark mode dan light mode supaya text/card/chip lebih konsisten.
- Tambah anggaran harga automatik dalam form WhatsApp.
- Tambah availability board dan calendar preview sebagai rujukan awal.
- Tambah SEO asas: canonical, Open Graph, Twitter image, sitemap, robots dan JSON-LD.
- Tambah structured data offer catalog untuk pakej bilik.
- Betulkan heading structure supaya hero menjadi `h1` utama.
- Polish `policies.html` dan `thank-you.html`.
- Tambah `OWNER-DATA-CHECKLIST.md` dan `PRE-LIVE-QA.md`.
- Tambah local SEO intent section untuk carian seperti Hospital Jitra, keluarga besar, kenduri dan konvokesyen.
- Tambah FAQ search-intent untuk Hospital Jitra, konvokesyen, sewa ikut bilik dan last-minute booking.

## Belum Final

- Gambar bilik air dan label semua 5 bilik masih perlu diberi owner jika mahu lengkap satu per satu.
- Video walkthrough kecil masih perlu diberi owner jika mahu aktifkan section video.
- Harga peak season, cuti sekolah, cuti umum dan konvokesyen masih perlu disahkan owner.
- Parking sebenar untuk kereta/van/bas masih perlu disahkan owner.
- Test WhatsApp dan QA akhir perlu dibuat dari phone sebenar sebelum live.
