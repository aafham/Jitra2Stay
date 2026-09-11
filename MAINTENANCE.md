# Penyelenggaraan

## Kandungan dan kadar

Edit site.config.cjs: business untuk nombor/domain/fakta, rates untuk kadar, policies untuk copy BM/EN, facilities/gallery/guides untuk kandungan. Harga dan metadata dijana bersama. Gunakan token {{securityDeposit}}, {{maxGuests}}, {{earlyLateFee}}, {{checkInTime}}, {{checkOutTime}} dalam copy polisi; jangan salin nombor ke beberapa template.

Jalankan npm run build, npm run qa, npm run test:unit dan npm test. Jangan edit dist kerana build akan menggantikannya. npm run dev bukan hot reload; build semula selepas perubahan.

## Gambar

Tambah JPG web yang sudah dipilih dalam images, bukan foto kamera besar dalam output public. Daftar kapsyen BM/EN yang benar dalam config. Jalankan npm run optimize:images; commit versi responsive dan manifest. Saiz asal kecil tidak di-upscale. Build memilih hanya foto digunakan dan mengecualikan manifest serta raw. Foto bilik air mesti datang daripada owner; jangan menjana imej yang menggambarkan bilik air sebenar.

## Domain

Aktifkan domain/SSL di host dahulu. Tukar business.siteUrl dan build. QA menggunakan config sama; canonical/hreflang/OG/schema/robots/sitemap ikut berubah. Semak preview perkongsian dan Search Console secara manual selepas production siap.

## Operasi

Owner mengurus pertanyaan, tarikh, kadar akhir, bayaran dan rekod booking sendiri. Website tiada kalendar yang perlu di-sync. Jangan menambah tarikh atau data pelanggan ke public config.

Selepas setiap perubahan harga/polisi, pastikan BM dan EN membawa maksud sama. Selepas perubahan CSS/JS, semak menu, keyboard, dialog dan no-JS pada mobile. Untuk phone/owner sign-off, gunakan PRE-LIVE-QA.md dan OWNER-DATA-CHECKLIST.md.
