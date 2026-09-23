# Penyelenggaraan

Semua path source di bawah relatif kepada root repo. Data, template, skrip, gaya dan foto berada dalam `src/`; build mengekalkan URL awam sedia ada dalam `dist/`. Jalankan arahan npm dari root, bukan dari folder docs.

## Layout mobile

Grid pakej menggunakan minimum `rem` dalam `src/styles/rates.css`; fakta, penapis galeri/FAQ dan pilihan malam turut mengecilkan jumlah kolum apabila teks dibesarkan. Kekalkan dua kolum pakej pada telefon biasa dan empat pada desktop yang cukup lebar, tetapi uji juga root font 200% pada 320/390px. Jangan paksa harga pecah baris atau sembunyikan overflow untuk menutup masalah.

`src/styles/mobile.css` dimuat selepas stylesheet komponen halaman awam. Halaman pengurusan memuat `guest-admin.css` selepasnya untuk borang dan empat kotak PIN. Breakpoint 900px mengurus gutter/safe area dan input 16px; 600px mengemas jarak/kad; 480px menyusun galeri, borang, indeks polisi dan footer satu kolum. CSS ini tidak memotong overflow dokumen untuk menutup masalah susunan. Apabila menukar kolum galeri, kemas kini `sizes` dalam `src/templates/gallery.cjs` supaya foto tidak kabur pada telefon.

Kad kemudahan mobile menggunakan grid ikon dan kandungan: pastikan `.amenity-photo` kekal dalam kolum 2 bersama penerangan. Margin destinasi mesti menggunakan selector cukup khusus untuk mengatasi `.location-layout p:not(.eyebrow)`; jangan kembalikan margin 16px kepada setiap baris kad.

Panel menu dalam `src/styles/navigation.css` berada di luar aliran dokumen, tetapi kekal disclosure biasa. `src/scripts/app.js` mengurus `hidden`/`inert`, animasi boleh diterbalikkan ketika tap berulang, fokus dan ruang viewport sebenar. Tanpa JS menu asal tetap tersedia; reduced motion mematikan animasi. Uji skrin melintang, Tab semua pautan, Escape, klik luar serta pertukaran ke desktop apabila mengubah menu.

`src/templates/appearance.cjs` dimasukkan sebelum stylesheet untuk menetapkan tema serta kelas sementara `nav-pending`/`gallery-pending`. `src/scripts/app.js` dan `src/scripts/gallery.js` masing-masing membuang kelas selepas siap. `DOMContentLoaded` memulihkan kandungan asal jika skrip gagal; jangan tukar fallback ini kepada `load`, kerana gambar/peta perlahan boleh menyekat navigasi. `tests/initial-render.spec.cjs` menahan skrip/gambar untuk menguji sempadan ini.

## Background dan navigasi peta

Background hero menggunakan foto asal rumah melalui WebP responsif dalam `src/styles/style.css`. Gambar foreground, galeri dan background ialah penggunaan berbeza; elakkan menambah preload JPG yang tidak dirender.

Bahagian lokasi dijana dalam `src/templates/location.cjs`. `business.mapUrl` membuka Google Maps, `business.mapEmbedUrl` ialah embed Google daripada pin sedia ada, dan `business.coordinates` membina pautan Waze. Koordinat `6.2805462,100.4151952` disemak terhadap pin Google Jitra2Stay pada 11 September 2026. Jika pin berpindah, selaraskan ketiga-tiga nilai dan semak destinasi kedua-dua aplikasi. Peta dimuat secara lazy apabila menghampiri bahagian lokasi; butang navigasi ialah pautan biasa yang berfungsi tanpa JavaScript.

## Kandungan dan kadar

FAQ dijana oleh `src/templates/faq.cjs`. Tetapkan `topic` setiap item `faq` kepada key dalam `faqTopics`; labels topik mempunyai BM/EN. `src/scripts/faq.js` hanya menapis paparan, tanpa membuang soalan atau menukar jawapan. Tanpa JavaScript, semua soalan tersedia melalui `details` biasa.

Salin alamat dalam `src/scripts/location.js` menggunakan alamat owner yang dijana oleh template, tanpa menyimpan butiran tetamu. Uji kedua-dua keadaan clipboard dibenarkan dan disekat; pilihan salinan manual mesti kekal boleh dipilih. `src/styles/location.css` mengurus layout kawalan ini.

Semua tindakan salin/kongsi menetapkan fokus pada butang ketika diaktifkan, termasuk WebKit yang tidak berbuat demikian secara automatik. Selepas operasi async, pilih ruangan manual hanya jika fokus masih pada butang itu. Jangan tarik pengguna kembali daripada borang yang sudah mereka fokus. Kekalkan kawalan pending dengan `aria-busy` dan guard permintaan berganda; keputusan FAQ yang tidak lagi terlihat diabaikan.

Anggaran dalam panduan dijana oleh `src/templates/guide-journeys.cjs` daripada `src/data/destination-routes.cjs`. Token `{{route:ID}}` digunakan dalam ayat ringkas, manakala `journeyStops` menyenaraikan destinasi dalam panduan sekitar Jitra. Ubah snapshot laluan sekali sahaja; minit, km, pautan dan tarikh panduan akan dikemas ketika build.

`nearby[]` mengekalkan enam kumpulan kawasan dan penerangan asal. Elemen pertama BM/EN kini label kawasan/jenis, bukan anggaran masa; jangan masukkan semula julat lama yang boleh bercanggah dengan kad laluan khusus.

`src/data/site.config.cjs` ialah sumber semasa. Fakta owner yang tersedia dalam repo `18a274d` telah dipulihkan, termasuk parking 3–4 kereta, privasi rumah, self check-in, TV, bayaran manual dan polisi pembatalan 7 hari. Rujuk `RESTORED-CONTENT.md` sebelum mengganti maklumat ini dengan ayat umum meminta pengesahan; pemulihan sumber bukan pemeriksaan fizikal baharu.

Edit `business` untuk nombor/domain/fakta, `rates` untuk kadar, `policies` untuk copy BM/EN, dan `rooms`, `staySummary`, `facilities`, `gallery`, `nearby`, `guides` untuk kandungan. Harga dan metadata dijana bersama. Gunakan token seperti `{{securityDeposit}}`, `{{largeGroupSecurityDeposit}}`, `{{maxGuests}}`, `{{earlyLateFee}}`, `{{extraGuestFee}}` dan `{{cancellationNoticeDays}}`; jangan salin nombor ke beberapa template.

Jalankan npm run build, npm run qa, npm run test:unit dan npm test. Jangan edit dist kerana build akan menggantikannya. npm run dev bukan hot reload; build semula selepas perubahan.

## Galeri dan navigasi

Pautan foto kemudahan dalam `src/templates/home.cjs` dijana daripada `facilities[].photos`, menggunakan nama `image` yang wujud dalam `gallery`. Setiap pautan mempunyai `data-gallery-photo` dan href gambar sebenar sebagai fallback. `src/scripts/gallery.js` membuka kategori foto yang dirujuk tanpa menukar penapis grid, lalu memulangkan fokus kepada pautan asal. Satu kemudahan boleh mempunyai beberapa pautan, contohnya pantry, peti sejuk/microwave dan penapis air/air fryer. Foto bilik air dan water heater daripada owner kini turut dipautkan. Jangan padankan kemudahan dengan foto ruang lain.

FAQ mempunyai ID stabil `faq-{key}` daripada config. `src/scripts/faq.js` membuka jawapan untuk hash sah, menjadikannya terlihat walaupun topik berbeza, dan menyediakan pautan awam bersih tanpa query atau butiran borang. `src/scripts/navigation.js` mengekalkan jawapan sah apabila bertukar bahasa. Jangan ubah key FAQ tanpa menyediakan pengalihan pautan lama.

`src/templates/gallery.cjs` menjana satu grid foto dan dialog; `src/scripts/gallery.js` serta `src/styles/gallery.css` mengurus penapis, lihat lagi/ringkaskan, keyboard dan leretan mendatar. Semua foto tersedia tanpa JavaScript. Dengan JavaScript, paparan Semua bermula dengan 6 foto, tetapi dialog boleh melayari kesemua foto kategori aktif.

Thumbnail dialog dijana hanya apabila dialog dibuka, menggunakan foto kecil sedia ada dan subset kategori aktif. Pilihan semasa dikemas apabila menggunakan thumbnail, anak panah atau leretan. Penerangan bilik bersumber daripada rekod `rooms` yang sama dengan galeri; kekalkan hubungan `image` apabila menukar rekod.

Setiap item `gallery` dalam `src/data/site.config.cjs` mesti mempunyai `category`: `bedrooms`, `shared`, `amenities`, `bathrooms` atau `outside`. Gunakan kategori berdasarkan ruang atau peralatan dalam foto. `portrait: true` menggunakan bingkai 3:4 dan `object-fit: contain` supaya foto peralatan menegak tidak terpotong. Kapsyen `ms`/`en` mengenal pasti subjek, manakala `alt.ms`/`alt.en` boleh memberi penerangan visual yang lebih khusus. Kekalkan pautan JPG web apabila menukar gambar; pautan ini menjadi pilihan alternatif jika versi dialog gagal dimuatkan. Semak butang cuba lagi, penutupan Escape, gambar menegak serta fokus kembali ke gambar asal selepas perubahan galeri.

`src/scripts/navigation.js` dan `src/styles/navigation.css` menandakan bahagian homepage aktif serta menambah bahagian semasa pada pautan bahasa. Bar mobile Harga/WhatsApp menyorok ketika input borang difokus atau kawalan pertanyaan sudah kelihatan. Kekalkan ID bahagian serta pautan HTML biasa supaya navigasi tanpa JavaScript terus berfungsi. Draf borang dipulihkan secara berasingan melalui `src/scripts/app.js`.

Bar mobile juga digunakan pada halaman sokongan. Jika kawalan berfokus bertindih dengan kawasan bar, bar menyorok sehingga kawalan itu jelas; pautan bar yang sedang difokus tidak disembunyikan. Ketinggian terakhir bar disimpan untuk mengelakkan kitaran sorok/papar. Selepas perubahan layout, uji Tab semula jadi dari header hingga borang serta pautan footer.

Panduan bilik berada selepas grid galeri supaya foto muncul dahulu. Jangan buang penerangan bilik apabila menyusun semula galeri; data datang daripada `rooms` yang sama.

Menu telefon dalam `src/scripts/app.js` menutup apabila fokus atau sentuhan bergerak keluar daripada header, selain klik pautan, toggle dan Escape. Semak dengan keyboard supaya menu terbuka tidak menutup elemen yang sedang difokus. Fokus pada ringkasan tempat berdekatan dilukis di dalam sempadan kad supaya tidak terpotong.

## Pakej dan borang pertanyaan

Klik biasa pada kad pakej mengekalkan URL `#semak-tarikh` tetapi membawa viewport ke tajuk borang sebenar, di bawah header melekat. Fokus pergi ke check-in/check-out yang belum sah, atau tajuk apabila kedua-duanya sah. Klik dengan modifier dan pautan tanpa JS kekal sebagai pautan biasa. Tukar pakej memulangkan fokus ke kad pakej semasa tanpa menetapkan semula draf.

Ringkasan pakej borang membaca kadar daripada `APP_CONFIG.roomRates` dan bilangan bilik air daripada `data-bathrooms` pada option yang dijana terus daripada `rates`. Semak pemilihan kad, dropdown, pemulihan draf dan reset supaya semuanya selari.

Salin mesej pertanyaan menyediakan textarea baca sahaja apabila clipboard tiada/disekat. Hasil async hanya digunakan untuk mesej semasa; pengeditan/reset membuang teks lama. Uji clipboard gagal, kejayaan, operasi tertunda serta fokus supaya respons lewat tidak mengganggu pengguna yang sudah bergerak ke ruangan lain.

Pilihan 1–3 malam dalam `#stayComparison` mengemas kini semua jumlah pakej; harga semalam masih terlihat. `plannedNights` hanya ditetapkan apabila pengguna memilih tempoh. Selepas check-in sah, check-out mengikuti tempoh tersebut; pengeditan check-out secara langsung membatalkan pilihan tempoh automatik. Tarikh sah menentukan perbandingan termasuk penginapan melebihi tiga malam. Tarikh tidak sah yang sedang dibetulkan tidak ditulis semula ketika memulihkan draf.

`src/templates/rates.cjs` menjana kad perbandingan pakej; `src/templates/enquiry.cjs` menjana borang, ralat ruangan, pecahan anggaran dan pratonton mesej. `src/scripts/app.js` menyelaraskan pilihan pakej dan butiran WhatsApp. Jangan menambah kadar berasingan dalam template atau JavaScript; gunakan `rates`, `business.securityDeposit` dan `business.largeGroupSecurityDeposit` dalam config. Build menyalin kedua-dua kadar deposit kepada `APP_CONFIG` untuk pengiraan browser.

`src/styles/rates.css` mengurus empat kolum pakej pada desktop dan dua kolum di bawah 1100px. Kad, contoh pembahagian harga, deposit, caj tambahan dan ringkasan masih dijana daripada config. Semak 320px dan English selepas mengubah label.

Pintasan 1–3 malam mengisi check-out berdasarkan check-in yang sah. Anggaran sewaan ialah kadar semalam × bilangan malam, dan jumlah bayaran awal ialah sewaan + deposit kategori dipilih. Deposit RM100 untuk kumpulan kecil/biasa atau RM200 untuk kumpulan besar/acara besar seperti kenduri; tiada ambang bilangan orang direka, dan owner mengesahkan kategori. Caj tambahan RM10 seorang kekal dinyatakan dalam polisi tetapi tidak dianggarkan; contoh pembahagian harga dalam `rates.exampleGuests` bukan had pakej atau formula menentukan siapa dikenakan caj. Anggaran tidak menyemak kekosongan atau menggantikan pengesahan owner melalui WhatsApp.

Kadar semasa 2/3/4/5 bilik ialah RM170/RM230/RM280/RM330 semalam. Untuk 2 bilik satu malam dengan deposit biasa, bayaran awal ialah RM270 (RM170 + RM100). Deposit dipulangkan selepas pemeriksaan rumah memuaskan; deposit hangus jika berlaku kerosakan atau perkara tidak diingini mengikut polisi owner. Semak pilihan kategori deposit, jumlah awal dan maksud polisi bersama dalam BM/EN, mesej WhatsApp serta ringkasan perkongsian.

Selepas perubahan, semak ralat BM/EN, tarikh akhir bulan/tahun, pilihan kad dan dropdown, serta kesamaan mesej pratonton dengan pautan WhatsApp. Membuka WhatsApp mesti mengekalkan borang, draf dan pautan alternatif.

Apabila JavaScript aktif, validasi menggunakan constraint HTML serta ralat inline; submit tidak sah memfokus input pertama di tengah skrin supaya header tidak menutupnya. Butang WhatsApp umum pada header, hero, bahagian pertanyaan dan bar mobile menggunakan pertanyaan yang disediakan hanya apabila sah, dan kembali kepada URL asal apabila tidak sah/dikosongkan. Pautan pertanyaan khusus polisi/panduan kekal mengikut konteks halaman.

## Polisi, panduan dan footer

`src/styles/documents.css` dimuat selepas CSS asas pada semua halaman. Indeks polisi dijana daripada `policies` serta privasi; kekalkan ID bahagian dan `tabindex="-1"` untuk pautan/fokus. `src/scripts/navigation.js` hanya membawa hash ke bahasa lain jika ia merujuk bahagian dokumen sebenar. Indeks berfungsi sebagai pautan HTML tanpa JavaScript.

Panduan menyusun kandungan, alamat/Google Maps/Waze, kemudian panduan berkaitan dalam DOM. Destinasi menggunakan config peta yang sama dengan homepage. Footer dalam `src/templates/shared.cjs` berkongsi layout untuk semua halaman; semak 320/390/768/1440px kerana CSS asas turut mempunyai aturan footer. Elakkan selector yang kurang khusus daripada aturan asas sehingga kolum intro gagal merentasi baris telefon.

## Draf dan perkongsian

Envelope draf versi 1 menerima medan pilihan `plannedNights` bernilai 1, 2 atau 3. Draf lama tanpa medan itu kekal sah; field asing dan nilai tidak sah ditolak. Tempoh luput 2 jam/key sedia ada tidak berubah. Reset juga membuang pilihan malam.

Perkongsian keluarga dalam `src/scripts/app.js` ialah tindakan berasingan daripada `src/scripts/share.js`. Pengguna membuka pratonton kemudian menekan kongsi; hanya pakej, tarikh, bilangan malam, anggaran sewaan, kategori/nilai deposit, jumlah bayaran awal dan pautan awam dimasukkan. Jangan menambah nota peribadi/jumlah tetamu secara senyap. Uji pembatalan menu native, clipboard ditolak, perubahan tarikh/kategori deposit semasa proses kongsi dan pemulihan fokus. Perkongsian tidak menghantar mesej automatik kepada owner atau keluarga.

`src/scripts/app.js` menyimpan check-in, check-out, jumlah tetamu, pakej, kategori deposit, nota dan status pilihan pakej dalam `sessionStorage` dengan key `jitra2stay.enquiry-draft.v1`. Draf terhad kepada sesi tab dan sah sehingga 2 jam sejak simpanan terakhir. Input/perubahan dan klik bahasa menyimpan draf; pemulihan sahaja tidak melanjutkan tempohnya. Draf rosak atau tamat tempoh tidak dipulihkan. Ralat yang boleh dibetulkan, seperti check-out lebih awal atau tetamu melebihi had, dikekalkan untuk pembetulan. Draf lama tanpa pilihan kategori menggunakan deposit biasa; uji reset dan tukar bahasa supaya pilihan deposit tidak berubah tanpa sebab.

Butang kosongkan draf membuang rekod itu dan menetapkan semula borang. Menghantar pertanyaan tidak memadamkannya. Jika simpanan tamat ketika halaman masih terbuka, rekod simpanan dibuang sementara butiran yang sedang dilihat kekal. Jika browser menyekat storage, borang masih berfungsi dan memaklumkan bahawa draf tidak dapat disimpan. Pilihan tema menggunakan `localStorage`; butiran draf pertanyaan tidak dimasukkan ke URL website atau dihantar ke Supabase. Borang pengurusan tetamu ialah aliran berasingan yang menyimpan rekod ke Supabase selepas pengesahan PIN.

`src/scripts/share.js` menggunakan URL homepage awam daripada markup, tanpa query/hash atau butiran borang. Menu perkongsian peranti digunakan dahulu; jika tidak tersedia, pautan disalin atau dipaparkan untuk salinan manual. Pembatalan menu kongsi tidak dianggap ralat. Kekalkan pautan Google Maps dan album Facebook berdasarkan `business.mapUrl` serta `business.facebookUrl`; pautan tersebut bukan bukti rating atau petikan ulasan.

## Destinasi dan laluan

`src/data/destinations.cjs` menyenaraikan 50 nama daripada panduan kawasan asal. Alias membantu carian BM/EN. `src/data/destination-routes.cjs` hanya mengandungi 46 laluan yang disahkan dalam Google Maps pada 19–20 September 2026; ia tidak dihantar sebagai fail source awam. Template menjana teks/URL HTML sahaja, tanpa API berbayar atau permintaan lokasi peranti.

Untuk mengemas kini jarak, buka laluan kereta dengan origin pin Jitra2Stay, semak destinasi/cawangan sebenar, dan catat `distanceKm`, `durationMinutes`, `routeLabel`, `checkedAt`, `mapsUrl` serta `tollsWarningDisplayed`. Masa ialah snapshot trafik ketika semakan. Tiada amaran tol tidak bermaksud jalan bebas tol. Jangan guna jarak garis lurus, menukar pin rumah atau menganggarkan angka untuk nama yang belum jelas.

Hotel Regency, kampus UniMAP, Kem Askar Melayu dan cawangan MARDI belum dapat dikenal pasti secara pasti daripada nama asal. Katalog mengekalkan nama/pautan Maps dan arahan memilih lokasi; tiada nombor jarak untuk empat item ini. Rujuk [rekod laluan](NEARBY-ROUTES-2026-09-20.md) sebelum menambah rekod. Enam kumpulan kawasan asal kekal dalam panel berasingan dengan label kawasan/jenis; masa dirujuk pada kad laluan bertarikh.

`src/data/destination-categories.cjs` menyimpan 10 kategori, label BM/EN dan ID destinasi yang termasuk dalam setiap kategori. Semua destinasi mesti mempunyai kategori; ID yang tidak wujud atau destinasi tanpa kategori menggagalkan build. Sesuatu tempat boleh mempunyai lebih daripada satu kategori (contohnya Masjid Zahir), tetapi template tetap menjana satu kad. Kategori tidak mengesahkan kemasukan awam, waktu operasi atau akses ke institusi/kem.

Tanpa JavaScript semua kad/pautan dan label kategori tersedia. Dengan JavaScript, enam kad dalam kategori dipaparkan dahulu dan butang lihat semua mengembangkan kategori itu. Carian nama ditapis bersama kategori, mengekalkan teks apabila kategori ditukar. Semua menghilangkan penapis kategori sahaja; Set semula mengosongkan teks dan kategori. Uji pertindihan carian/kategori, hasil kosong, reset, pagination, Tab pada kategori yang perlu dileret, nota tol serta origin semua pautan selepas mengubah katalog.

## Gambar

Tambah JPG web yang sudah dipilih dalam `src/images/`, bukan foto kamera besar dalam output public. Daftar kategori, kapsyen dan alt BM/EN yang benar dalam config. Jalankan `npm run optimize:images`; commit JPG web, versi responsif dan manifest. Saiz asal kecil tidak di-upscale. Build memilih hanya foto digunakan dan mengecualikan manifest serta raw.

Set 23 September 2026 menambah 10 foto owner. Salinan asal baharu disimpan di folder workspace `work/owner-photo-originals-2026-09-23`, di luar repo; `tools/owner-photo-sources.json` merekod label asal, tarikh, hash dan suntingan privasi. Arkib kamera terdahulu dalam `source-images/latest-raw/` masih sebahagian repo, tetapi tidak termasuk output website. Jangan kelirukan pengecualian daripada deploy dengan pengecualian daripada Git.

`tv-wifi.jpg` dan `kotak-kunci.jpg` ialah salinan yang sudah menutup notis/QR WiFi dan paparan dail kunci. Varian WebP mesti dijana daripada JPG yang sudah ditutup maklumat aksesnya, termasuk fallback JPG dan gambar dialog. Jangan menggantikannya dengan fail asal chat. Lapan foto baharu yang lain hanya diorientasi, dikecilkan secara berkadar dan dibuang metadata. Tiada kelengkapan atau keadaan rumah baharu direka.

Foto bilik air dan pancuran kini tersedia daripada owner. Jangan menjana imej yang mendakwa menggambarkan bilik air sebenar atau menyimpulkan tingkat/jumlah peralatan daripada sudut foto. Rujuk [IMAGE-AUDIT.md](IMAGE-AUDIT.md) bagi pemetaan semua fail baharu dan rekod pemprosesan.

## Domain

Aktifkan domain/SSL di host dahulu. Tukar business.siteUrl dan build. QA menggunakan config sama; canonical/hreflang/OG/schema/robots/sitemap ikut berubah. Semak preview perkongsian dan Search Console secara manual selepas production siap.

## Operasi

`npm test` membaca config `tests/playwright.config.cjs`. Laporan HTML berada dalam `artifacts/playwright-report/` dan hasil/debug dalam `artifacts/test-results/`. Folder `artifacts/`, `dist/` dan `node_modules/` ialah hasil tempatan yang diabaikan Git.

Owner mengurus pertanyaan, kadar akhir, bayaran dan pengesahan booking melalui aliran manual sedia ada. Selepas booking disahkan, masukkan tarikh/nama/bilangan orang melalui **Urus tetamu**; kemas kini juga perubahan atau pembatalan daripada WhatsApp dan saluran lain. Kalendar memaparkan rekod Supabase, bukan inventori booking yang diselaraskan automatik dengan platform luar. Jangan masukkan rekod pelanggan ke public config atau Git.

Selepas setiap perubahan harga/polisi, pastikan BM dan EN membawa maksud sama. Selepas perubahan CSS/JS, semak menu, keyboard, dialog dan no-JS pada mobile. Rekod semakan telefon sebenar dalam `PRE-LIVE-QA.md`; status bahan sumber berada dalam `OWNER-DATA-CHECKLIST.md`.

## Kalendar dan rekod tetamu

[Panduan urus tetamu](GUEST-GUIDE.md) menerangkan penggunaan harian. Nama, tarikh masuk/keluar dan bilangan orang ditunjukkan dalam senarai upcoming awam mengikut pilihan owner. Tujuan ialah nota pilihan yang hanya dikembalikan kepada pengurusan selepas PIN disahkan. Semua pengunjung boleh membaca kalendar tanpa PIN; tambah, ubah dan batal memerlukan sesi server yang sah.

| Bahagian | Source |
| --- | --- |
| Endpoint awam | `src/data/guest.config.cjs`, dijana sebagai `guest.config.js` |
| Kalendar dan senarai upcoming | `src/templates/guest-calendar.cjs`, `src/scripts/guest-calendar.js`, `src/styles/guest-calendar.css` |
| Halaman pengurusan BM/EN | `src/templates/guest-admin.cjs`, `src/scripts/guest-admin.js`, `src/styles/guest-admin.css` |
| Database dan server | `supabase/migrations/`, `supabase/functions/guest-calendar/` |

PIN diperiksa oleh Edge Function; jangan pindahkan pengesahan PIN ke JavaScript awam. Sesi rawak sah sehingga 8 jam, hash token disimpan di database, dan token browser hanya dalam sesi tab. Draf borang pengurusan tidak ditulis ke storage; apabila sesi tamat dalam tab yang masih terbuka, draf disimpan sementara dalam memori untuk dipulihkan selepas PIN dimasukkan semula. Reload atau meninggalkan halaman boleh menghilangkan draf belum disimpan.

Tarikh menggunakan hari Malaysia. Tarikh keluar mesti selepas tarikh masuk; malam check-out tidak ditanda berpenghuni untuk membolehkan ketibaan berikutnya selepas 3 petang. Database menolak tempahan bertindih dan edit berdasarkan versi lama. Kekalkan UUID `request_id` yang sama untuk cubaan semula create apabila respons rangkaian tidak pasti. Selepas save berjaya, halaman kembali ke kalendar; jangan redirect pada kegagalan.

Semasa muatan atau ralat API, kalendar mesti menyatakan status belum diketahui, bukannya menunjukkan semua tarikh kosong. Butang cuba lagi, muat semula, rekod kosong, tarikh bertindih, sesi tamat, PIN salah dan lockout perlu kekal boleh difahami dalam BM/EN. Ujian handler berada dalam `tests/guest-api.test.cjs`; ujian UI dalam `tests/guest-ui.spec.cjs`. SQL di `supabase/tests/` hanya untuk database baharu atau ujian seperti diterangkan dalam [panduan backend](../supabase/README.md).

Deployment frontend tidak mengemas kini Edge Function atau migration. Ikut [Deployment](DEPLOYMENT.md) untuk kedua-dua bahagian, dan jalankan security advisors selepas perubahan database. Tiga jadual service-only sengaja menggunakan RLS tanpa polisi awam; jangan tambah akses `anon` untuk menghilangkan notis INFO.
