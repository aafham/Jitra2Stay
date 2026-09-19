# Changelog

## 2026-09-20 — Rancang penginapan dan perjalanan

- Bandingkan jumlah semua pakej untuk 1–3 malam; tempoh pilihan diselaraskan dengan tarikh borang, termasuk tempoh manual lebih panjang.
- Tambah pratonton dan perkongsian ringkasan keluarga melalui menu peranti, clipboard atau salinan manual; nota/jumlah tetamu tidak dimasukkan.
- Pautan kemudahan membuka foto sebenar yang berkaitan sambil mengekalkan penapis galeri dan fokus asal.
- Tambah pautan terus setiap jawapan FAQ, salin pautan dan sokongan BM/EN/keyboard.
- Jadikan semua 50 nama destinasi asal boleh dicari. Google Maps diperiksa untuk semua nama: 46 laluan disahkan dan 4 lokasi/cawangan belum pasti; hanya angka yang disahkan dipaparkan, bersama tarikh serta nota tol.
- Panduan enam kawasan dan semua fakta owner asal dikekalkan. Website terus statik untuk paparan/pertanyaan, tanpa kalendar kekosongan atau pembayaran.

## 2026-09-12 — Kemasan UI/UX seluruh website

- Susun empat pakej sebaris pada desktop, bezakan harga daripada deposit/caj dan kemaskan ringkasan penginapan.
- Dahulukan foto galeri, tingkatkan ruang kapsyen, jadikan kemudahan satu kolum pada telefon dan kemaskan jarak FAQ/borang.
- Baiki bar mobile yang menutup kawalan berfokus pada homepage dan halaman sokongan; pautan bar yang difokus kekal terlihat.
- Bawa input tidak sah pertama ke tengah skrin dan selaraskan butang WhatsApp umum dengan pertanyaan sah yang sudah disediakan.
- Tambah indeks 11 topik polisi, kekalkan topik sah ketika bertukar bahasa, dan dahulukan alamat/Google Maps/Waze dalam panduan.
- Susun footer mengikut contact/penginapan dan tambah pintasan kembali ke atas; baiki konflik CSS yang menyebabkan teks bertindih pada telefon.
- Kekalkan semua data owner dalam `site.config.cjs`, foto/background, kadar, kemudahan, polisi dan destinasi peta. QA: 464 statik, 11 unit, 53 browser.

## 2026-09-12 — Carian maklumat dan navigasi gambar

- Tambah pilihan topik FAQ dan kiraan soalan, dengan semua 15 jawapan asal tetap tersedia tanpa JavaScript.
- Tambah salin alamat penuh, maklum balas BM/EN dan salinan manual apabila clipboard tidak tersedia.
- Tambah thumbnail dalam dialog galeri serta penerangan bilik daripada rekod asal; navigasi mengikut kategori kekal diselaraskan.
- Tutup menu telefon apabila fokus atau sentuhan meninggalkan header; baiki outline keyboard pada kad tempat berdekatan.
- Kekalkan maklumat owner, background rumah, harga, draf pertanyaan, Google Maps dan Waze.

## 2026-09-12 — Kandungan owner, draf dan perkongsian

- Pulihkan maklumat owner daripada repo asal `18a274d`: penerangan bilik, parking 3–4 kereta, privasi satu rumah, self check-in, WiFi/TV, kemudahan dan senarai tempat berdekatan.
- Pulihkan kaedah bank/DuitNow QR/tunai, aliran pengesahan manual, pembatalan kurang 7 hari, deposit keselamatan RM100 dan caj tetamu tambahan RM10. Jejak sumber berada dalam `RESTORED-CONTENT.md`; tiada dakwaan pemeriksaan fizikal baharu.
- Ringkaskan hero dan tambah pautan Google Maps/album Facebook asal. Ulasan atau rating tetamu tidak direka.
- Draf borang dipulihkan merentas BM/EN dan reload dalam sesi tab sehingga 2 jam, dengan validasi rekod serta butang kosongkan draf. Membuka WhatsApp tidak memadam draf.
- Tambah perkongsian URL homepage melalui menu peranti, clipboard atau salinan manual; tiada butiran tetamu dalam URL yang dikongsi.
- Selaraskan dokumentasi semasa supaya fakta owner yang tersedia tidak lagi disenaraikan sebagai maklumat yang perlu diminta semula. Rekod audit terdahulu kekal sebagai sejarah.

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

## Bahan tambahan yang belum ada dalam sumber

- Foto bilik air, tingkat setiap bilik dan ukuran/jenis katil terperinci.
- Petikan ulasan tetamu beserta atribusi/izin penggunaan; `reviews` kekal kosong.
- Perincian ini tidak direka dan tidak menghalang website paparan yang menggunakan fakta owner sedia ada.
