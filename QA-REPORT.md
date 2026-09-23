# Laporan QA — audit menyeluruh 23 September 2026

Baseline audit asal lulus 76 pemeriksaan statik tetapi mempunyai bug pengguna. Selepas implementasi, semakan sekarang berdasarkan output dist dan browser sebenar.

| Semakan | Keputusan |
| --- | --- |
| Build | 16 halaman HTML penuh |
| Static output QA | 687 / 687 lulus |
| Unit tarikh, draf, perkongsian dan panduan | 15 / 15 lulus |
| Playwright Chromium 153 | 110 / 110 lulus; tiada retry |
| Regresi WebKit pada output sebenar | 11 / 11 lulus: 4 clipboard/kongsi, 2 teks besar, 5 muatan awal/fallback |
| Audit mobile/tablet tambahan | 104 semakan halaman/viewport/enjin dan 18 interaksi galeri lulus pada saiz biasa |
| Axe pada homepage light/dark, polisi EN, menu dan dialog | Tiada pelanggaran dalam rules/state yang diuji |
| JavaScript runtime | Tiada uncaught page error dalam aliran diuji |

Audit menyeluruh memeriksa desktop hingga 1440px, telefon 320/390px, tablet dan landscape, BM/EN, tema cerah/gelap, serta semua halaman sokongan. Pembaikan merangkumi header yang melompat pada muatan awal, galeri memuat foto tersembunyi, clipboard lambat yang merampas fokus, susunan teks 200% serta anggaran panduan yang bercanggah. Lihat [penemuan dan pembaikan](WEBSITE-AUDIT-2026-09-23.md).

Lima ujian baharu menahan skrip untuk membandingkan kedudukan header/main serta tema sebelum dan selepas JS siap, memastikan foto tersembunyi belum dimuat, dan mengesahkan navigasi/foto HTML pulih apabila skrip gagal walaupun gambar masih pending. Empat muatan terukur pada 390/1440px merekodkan CLS 0.000 selepas pembaikan, berbanding 0.428 pada kes mobile baseline; foto galeri desktop dimuat berkurang daripada 18 kepada enam dalam keadaan yang diperiksa. Ini bukan jaminan skor semua rangkaian.

Teks 200% diuji pada 320/390/600px dalam kedua-dua enjin. Harga/label pakej, fakta, galeri/FAQ, pilihan malam dan tajuk halaman susulan kekal terbaca tanpa overflow. Susunan biasa dua kad mobile dan empat kad desktop turut diperiksa. Kedua-dua panduan yang diubah mempunyai pautan laluan bertarikh; senarai sekitar Jitra diuji pada 320/610/901/1440px.

Ujian async meliputi lima tindakan: kongsi homestay, salin alamat, salin pautan FAQ, kongsi pelan keluarga dan salin pertanyaan. Penolakan lambat selepas pengguna beralih ke nota tidak menukar fokus/kedudukan ruangan; fallback segera tetap memilih teks penuh. FAQ tertutup/ditapis mengabaikan respons lama dan pembatalan native share tidak memulakan clipboard.

## Pengesahan foto pada awal 23 September

Pusingan 23 September mengesahkan 10 foto baharu dan kesemua 11 foto asal, penapis Kemudahan/Bilik air, 14 pautan foto pada sembilan kad kemudahan, navigasi dalam kategori, fokus kembali ke pembuka dan pautan imej tanpa JavaScript. Foto menegak diuji tanpa crop pada 320/390/1440px dan dialog melintang 568×320. Hash, saiz bait, dimensi, nisbah imej dan ketiadaan EXIF/XMP disemak terhadap manifest untuk semua imej terbitan; hanya foto yang digunakan disalin ke `dist/`.

Semakan visual tambahan meliputi Chromium 320px BM cerah, 390px EN gelap, 768px BM cerah, 1440px EN cerah, WebKit 390px BM cerah dan 568×320 EN gelap. Semua enam konteks memuatkan foto kategori baharu, mengekalkan 21 foto dan 14 pautan kemudahan, tanpa overflow atau ralat halaman/aset. Kawasan nombor peti kunci serta nota WiFi/QR dalam dua salinan awam ditutup dan diperiksa secara visual. Ujian ini menggunakan emulasi enjin desktop, bukan peranti fizikal.

## Pengesahan pusingan terdahulu

Pusingan mobile 21 September menambah 11 kes regresi untuk pautan kemudahan yang tersalah masuk kolum ikon, gambar/penerangan bilik penuh pada telefon, input dan semua fallback manual minimum 16px, ruang kad destinasi, polisi/footer, serta animasi menu, tap berulang, keyboard dan skrin melintang. Ujian kontras menu menunggu opacity penuh sebelum audit; ujian berasingan mengesahkan animasi masih berjalan ketika membuka/menutup. Semua assertion kontras asal dikekalkan.

Matriks berasingan menggunakan Chromium dan WebKit dengan viewport serta sentuhan emulasi: 320/360/390/430/768px portrait, 568×320 dan 844×390 landscape, BM/EN, serta semua halaman sokongan pada 320px. Pemeriksaan meliputi overflow, saiz input, menu, imej/dialog dan fokus pertanyaan. Ini ujian enjin desktop, bukan Safari/iPhone fizikal; papan kekunci peranti sebenar belum diperiksa. 404 tidak mempunyai footer bersama; harness diperbetul supaya memeriksa kandungan utama, dan kedua-dua enjin lulus.

Sembilan kes baharu meliputi pilihan pakej terus ke tarikh, ringkasan kadar/bilik air, Tukar pakej dengan fokus kembali ke kad, butiran draf yang kekal, dropdown/reload/reset, klik dengan modifier serta salin mesej manual. Fokus check-out yang terpotong pada skrin pendek ditemui dan dibetulkan, dengan semakan 568×320 dan 320×480. Clipboard tiada/disekat, operasi tertunda, pengeditan/reset dan pengguna yang sudah berpindah fokus turut diuji. Semakan visual BM/EN pada 320/390/768/1440px dalam tema cerah/gelap tidak menunjukkan overflow atau page error. Fakta owner dan data destinasi kekal sama.

Penapis destinasi kini mempunyai 10 kategori BM/EN dan pilihan Semua. Enam ujian destinasi meliputi gabungan kategori dengan carian, teks yang kekal ketika bertukar kategori, pagination dalam kategori, reset, liputan 50 kad unik, label tanpa JavaScript dan fokus pada setiap butang kategori yang perlu dileret. Pemeriksaan visual 320/390/768/1440px menemui dan membetulkan grid yang melebar; ujian Tab semula jadi turut mengesan butang kategori separa tersembunyi dan kini memastikan butang berfokus kelihatan sepenuhnya. Jarak dan pautan Maps sedia ada tidak berubah.

Browser menguji lebar 320/390/768/1440, menu/fokus, no-JS BM/EN, roundtrip bahasa, package preset, dialog keyboard, form tidak sah/valid, anggaran, encoding, popup diblok dan metadata/aset. Unit cases termasuk leap day, hujung tahun dan timezone negatif. Static QA juga membuat HTTP requests terhadap output server dan menguji 404/private-path boundary.

Pusingan 20 September menambah 21 kes browser dan 2 unit: perbandingan semua pakej mengikut malam, tempoh draf sebelum tarikh, tarikh manual, perkongsian keluarga dan async/fokus, pautan kemudahan-ke-foto, FAQ deep link/salin pautan, serta carian 50 destinasi. Semua 53 kes terdahulu masih dijalankan; satu langkah membuka panel panduan kawasan ditambah untuk susunan baharu. Tiada assertion kandungan atau fungsi dibuang. Screenshot 320/390/768/1440px serta EN tema gelap diperiksa; tiada overflow mendatar atau uncaught page error pada state yang diuji.

Google Maps diperiksa secara berasingan untuk kesemua 50 nama destinasi asal: 46 pin/laluan dapat dikenal pasti, 4 kekal tanpa angka jarak kerana nama/cawangan tidak pasti. 10 laluan terpilih menunjukkan amaran tol. Tarikh semakan setiap laluan ialah 19 atau 20 September 2026. Angka ialah laluan memandu yang dipaparkan ketika semakan, bukan jarak garis lurus atau trafik masa nyata. Pautan untuk empat nama belum pasti membuka carian Maps dan meminta pengguna memilih lokasi; ia tidak memulakan panduan ke pin yang tidak disahkan. Rujuk `NEARBY-ROUTES-2026-09-20.md`.

Penambahbaikan galeri/pakej/pertanyaan menambah semakan penapis dan lihat lagi, subset dialog, gambar gagal/cuba lagi, swipe mendatar berbanding gerakan menegak, pintasan malam merentas tahun, deposit berasingan, pratonton yang sama dengan mesej WhatsApp, ralat ruangan, kad pilihan dan bar mobile yang menghormati fokus. Pertukaran bahasa mengekalkan seksyen selepas galeri berkembang; Tab pada header juga tidak lagi menatal halaman tanpa sengaja. Semakan visual BM/EN, desktop/mobile dan tema gelap dibuat pada kad pakej serta borang; harga didahulukan daripada nota deposit pada telefon.

Pemulihan kandungan menggunakan maklumat owner dalam repo asal `18a274d`, dengan rujukan fail/baris di `RESTORED-CONTENT.md`. Semakan merangkumi butiran bilik berfoto, parking, TV/WiFi, akses bilik air, bayaran, pembatalan, nombor kedua dan tempat berdekatan dalam BM/EN. Penambahan draf dan perkongsian turut memerlukan pemeriksaan pertukaran bahasa/reload, reset, tamat tempoh, storage tidak tersedia serta menu kongsi/salin pautan. Pautan perkongsian menggunakan URL homepage, tanpa butiran pertanyaan.

Pusingan seterusnya menguji FAQ mengikut topik tanpa mengubah 15 jawapan asal, salin alamat lengkap serta fallback manual yang boleh dipilih, dan thumbnail galeri yang mengikuti kategori/gambar/penerangan semasa. Tiada gambar thumbnail dimasukkan sebelum dialog dibuka. Semakan menu telefon meliputi fokus keluar dan sentuhan luar pada 390×844 serta 568×320; elemen yang difokus tidak ditutup menu. Semakan visual galeri termasuk paparan melintang yang mengekalkan gambar dan thumbnail pilihan dalam skrin. Semua maklumat owner dalam config dibandingkan dengan versi terdahulu dan kekal sama selepas metadata topik dikecualikan.

Tiada mesej WhatsApp, pembayaran atau booking dihantar. Maklumat rumah mengikut sumber asal owner; ini bukan pemeriksaan fizikal baharu. Peranti fizikal/Safari/mobile data, pin lapangan dan Search Console belum diperiksa dalam pusingan ini. Lihat PRE-LIVE-QA.md.

Semakan seluruh halaman mendapati bar mobile menutup kawalan semasa Tab, validasi browser meletakkan input pertama di bawah header, pertukaran bahasa polisi kehilangan topik dan butang WhatsApp umum tidak menggunakan draf sah. Enam kes tambahan dalam `tests/full-ui.spec.cjs` menguji pembaikan ini pada 390/768px serta BM/EN, tanpa mengubah 47 kes terdahulu. Perbandingan pakej, galeri, kemudahan, FAQ, borang, footer, polisi dan panduan turut diperiksa melalui screenshot desktop/tablet/telefon. Konflik specificity footer pada telefon ditemui melalui pemeriksaan visual dan dibetulkan. `site.config.cjs` tidak berubah dalam pusingan ini. Lihat `UI-UX-REVIEW-2026-09-12.md` untuk semakan mengikut bahagian.

Selepas pembaikan background dan peta: Google iframe sebenar menunjukkan pin Jitra2Stay pada desktop/mobile dan halaman English. Butang Google Maps membuka place sedia ada dan Waze membuka destinasi `6.2805462,100.4151952`. Kedua-dua pautan membuka tab/aplikasi navigasi tanpa mengubah borang. Dalam suite automatik, kandungan iframe Google menggunakan fixture bagi mengelakkan kebergantungan pada rangkaian pihak ketiga; semakan peta sebenar dibuat berasingan.

Ulang semakan menggunakan arahan dalam README. Angka ini ialah snapshot suite semasa, bukan jaminan kualiti mutlak atau keputusan semua browser.
