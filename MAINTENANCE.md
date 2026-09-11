# Penyelenggaraan

## Background dan navigasi peta

Background hero menggunakan foto asal rumah melalui WebP responsif dalam `style.css`. Gambar foreground, galeri dan background ialah penggunaan berbeza; elakkan menambah preload JPG yang tidak dirender.

Bahagian lokasi dijana dalam `templates/location.cjs`. `business.mapUrl` membuka Google Maps, `business.mapEmbedUrl` ialah embed Google daripada pin sedia ada, dan `business.coordinates` membina pautan Waze. Koordinat `6.2805462,100.4151952` disemak terhadap pin Google Jitra2Stay pada 11 September 2026. Jika pin berpindah, selaraskan ketiga-tiga nilai dan semak destinasi kedua-dua aplikasi. Peta dimuat secara lazy apabila menghampiri bahagian lokasi; butang navigasi ialah pautan biasa yang berfungsi tanpa JavaScript.

## Kandungan dan kadar

FAQ dijana oleh `templates/faq.cjs`. Tetapkan `topic` setiap item `faq` kepada key dalam `faqTopics`; labels topik mempunyai BM/EN. `faq.js` hanya menapis paparan, tanpa membuang soalan atau menukar jawapan. Tanpa JavaScript, semua soalan tersedia melalui `details` biasa.

Salin alamat dalam `location.js` menggunakan alamat owner yang dijana oleh template, tanpa menyimpan butiran tetamu. Uji kedua-dua keadaan clipboard dibenarkan dan disekat; pilihan salinan manual mesti kekal boleh dipilih. `location.css` mengurus layout kawalan ini.

`site.config.cjs` ialah sumber semasa. Fakta owner yang tersedia dalam repo `18a274d` telah dipulihkan, termasuk parking 3–4 kereta, privasi rumah, self check-in, TV, bayaran manual dan polisi pembatalan 7 hari. Rujuk `RESTORED-CONTENT.md` sebelum mengganti maklumat ini dengan ayat umum meminta pengesahan; pemulihan sumber bukan pemeriksaan fizikal baharu.

Edit `business` untuk nombor/domain/fakta, `rates` untuk kadar, `policies` untuk copy BM/EN, dan `rooms`, `staySummary`, `facilities`, `gallery`, `nearby`, `guides` untuk kandungan. Harga dan metadata dijana bersama. Gunakan token seperti `{{securityDeposit}}`, `{{maxGuests}}`, `{{earlyLateFee}}`, `{{extraGuestFee}}` dan `{{cancellationNoticeDays}}`; jangan salin nombor ke beberapa template.

Jalankan npm run build, npm run qa, npm run test:unit dan npm test. Jangan edit dist kerana build akan menggantikannya. npm run dev bukan hot reload; build semula selepas perubahan.

## Galeri dan navigasi

`templates/gallery.cjs` menjana satu grid foto dan dialog; `gallery.js` serta `gallery.css` mengurus penapis, lihat lagi/ringkaskan, keyboard dan leretan mendatar. Semua foto tersedia tanpa JavaScript. Dengan JavaScript, paparan Semua bermula dengan 6 foto, tetapi dialog boleh melayari kesemua foto kategori aktif.

Thumbnail dialog dijana hanya apabila dialog dibuka, menggunakan foto kecil sedia ada dan subset kategori aktif. Pilihan semasa dikemas apabila menggunakan thumbnail, anak panah atau leretan. Penerangan bilik bersumber daripada rekod `rooms` yang sama dengan galeri; kekalkan hubungan `image` apabila menukar rekod.

Setiap item `gallery` dalam `site.config.cjs` mesti mempunyai `category`: `bedrooms`, `shared` atau `outside`. Gunakan kategori berdasarkan ruang dalam foto. Kekalkan kapsyen BM/EN dan pautan JPG web apabila menukar gambar; pautan ini menjadi pilihan alternatif jika versi dialog gagal dimuatkan. Semak butang cuba lagi, penutupan Escape dan fokus kembali ke gambar asal selepas perubahan galeri.

`navigation.js` dan `navigation.css` menandakan bahagian homepage aktif serta menambah bahagian semasa pada pautan bahasa. Bar mobile Harga/WhatsApp menyorok ketika input borang difokus atau kawalan pertanyaan sudah kelihatan. Kekalkan ID bahagian serta pautan HTML biasa supaya navigasi tanpa JavaScript terus berfungsi. Draf borang dipulihkan secara berasingan melalui `app.js`.

Bar mobile juga digunakan pada halaman sokongan. Jika kawalan berfokus bertindih dengan kawasan bar, bar menyorok sehingga kawalan itu jelas; pautan bar yang sedang difokus tidak disembunyikan. Ketinggian terakhir bar disimpan untuk mengelakkan kitaran sorok/papar. Selepas perubahan layout, uji Tab semula jadi dari header hingga borang serta pautan footer.

Panduan bilik berada selepas grid galeri supaya foto muncul dahulu. Jangan buang penerangan bilik apabila menyusun semula galeri; data datang daripada `rooms` yang sama.

Menu telefon dalam `app.js` menutup apabila fokus atau sentuhan bergerak keluar daripada header, selain klik pautan, toggle dan Escape. Semak dengan keyboard supaya menu terbuka tidak menutup elemen yang sedang difokus. Fokus pada ringkasan tempat berdekatan dilukis di dalam sempadan kad supaya tidak terpotong.

## Pakej dan borang pertanyaan

`templates/rates.cjs` menjana kad perbandingan pakej; `templates/enquiry.cjs` menjana borang, ralat ruangan, pecahan anggaran dan pratonton mesej. `app.js` menyelaraskan pilihan pakej dan butiran WhatsApp. Jangan menambah kadar berasingan dalam template atau JavaScript; gunakan `rates` dan `business.securityDeposit` dalam config.

`rates.css` mengurus empat kolum pakej pada desktop dan dua kolum di bawah 1100px. Kad, contoh pembahagian harga, deposit, caj tambahan dan ringkasan masih dijana daripada config. Semak 320px dan English selepas mengubah label.

Pintasan 1–3 malam mengisi check-out berdasarkan check-in yang sah. Anggaran sewaan ialah kadar semalam × bilangan malam; deposit dipaparkan berasingan dan caj tambahan tidak dianggarkan. Caj tambahan RM10 seorang kekal dinyatakan dalam polisi; contoh pembahagian harga dalam `rates.exampleGuests` bukan had pakej atau formula menentukan siapa dikenakan caj. Anggaran tidak menyemak kekosongan atau menggantikan pengesahan owner melalui WhatsApp.

Selepas perubahan, semak ralat BM/EN, tarikh akhir bulan/tahun, pilihan kad dan dropdown, serta kesamaan mesej pratonton dengan pautan WhatsApp. Membuka WhatsApp mesti mengekalkan borang, draf dan pautan alternatif.

Apabila JavaScript aktif, validasi menggunakan constraint HTML serta ralat inline; submit tidak sah memfokus input pertama di tengah skrin supaya header tidak menutupnya. Butang WhatsApp umum pada header, hero, bahagian pertanyaan dan bar mobile menggunakan pertanyaan yang disediakan hanya apabila sah, dan kembali kepada URL asal apabila tidak sah/dikosongkan. Pautan pertanyaan khusus polisi/panduan kekal mengikut konteks halaman.

## Polisi, panduan dan footer

`documents.css` dimuat selepas CSS asas pada semua halaman. Indeks polisi dijana daripada `policies` serta privasi; kekalkan ID bahagian dan `tabindex="-1"` untuk pautan/fokus. `navigation.js` hanya membawa hash ke bahasa lain jika ia merujuk bahagian dokumen sebenar. Indeks berfungsi sebagai pautan HTML tanpa JavaScript.

Panduan menyusun kandungan, alamat/Google Maps/Waze, kemudian panduan berkaitan dalam DOM. Destinasi menggunakan config peta yang sama dengan homepage. Footer dalam `templates/shared.cjs` berkongsi layout untuk semua halaman; semak 320/390/768/1440px kerana CSS asas turut mempunyai aturan footer. Elakkan selector yang kurang khusus daripada aturan asas sehingga kolum intro gagal merentasi baris telefon.

## Draf dan perkongsian

`app.js` menyimpan check-in, check-out, jumlah tetamu, pakej, nota dan status pilihan pakej dalam `sessionStorage` dengan key `jitra2stay.enquiry-draft.v1`. Draf terhad kepada sesi tab dan sah sehingga 2 jam sejak simpanan terakhir. Input/perubahan dan klik bahasa menyimpan draf; pemulihan sahaja tidak melanjutkan tempohnya. Draf rosak atau tamat tempoh tidak dipulihkan. Ralat yang boleh dibetulkan, seperti check-out lebih awal atau tetamu melebihi had, dikekalkan untuk pembetulan.

Butang kosongkan draf membuang rekod itu dan menetapkan semula borang. Menghantar pertanyaan tidak memadamkannya. Jika simpanan tamat ketika halaman masih terbuka, rekod simpanan dibuang sementara butiran yang sedang dilihat kekal. Jika browser menyekat storage, borang masih berfungsi dan memaklumkan bahawa draf tidak dapat disimpan. Pilihan tema menggunakan `localStorage`; butiran tetamu tidak dimasukkan ke URL atau dihantar ke server website.

`share.js` menggunakan URL homepage awam daripada markup, tanpa query/hash atau butiran borang. Menu perkongsian peranti digunakan dahulu; jika tidak tersedia, pautan disalin atau dipaparkan untuk salinan manual. Pembatalan menu kongsi tidak dianggap ralat. Kekalkan pautan Google Maps dan album Facebook berdasarkan `business.mapUrl` serta `business.facebookUrl`; pautan tersebut bukan bukti rating atau petikan ulasan.

## Gambar

Tambah JPG web yang sudah dipilih dalam images, bukan foto kamera besar dalam output public. Daftar kategori dan kapsyen BM/EN yang benar dalam config. Jalankan npm run optimize:images; commit versi responsive dan manifest. Saiz asal kecil tidak di-upscale. Build memilih hanya foto digunakan dan mengecualikan manifest serta raw. Foto bilik air mesti datang daripada owner; jangan menjana imej yang menggambarkan bilik air sebenar.

## Domain

Aktifkan domain/SSL di host dahulu. Tukar business.siteUrl dan build. QA menggunakan config sama; canonical/hreflang/OG/schema/robots/sitemap ikut berubah. Semak preview perkongsian dan Search Console secara manual selepas production siap.

## Operasi

Owner mengurus pertanyaan, tarikh, kadar akhir, bayaran dan rekod booking sendiri melalui aliran manual sedia ada. Website tiada kalendar yang perlu di-sync. Jangan menambah tarikh booking atau data pelanggan ke public config.

Selepas setiap perubahan harga/polisi, pastikan BM dan EN membawa maksud sama. Selepas perubahan CSS/JS, semak menu, keyboard, dialog dan no-JS pada mobile. Rekod semakan telefon sebenar dalam `PRE-LIVE-QA.md`; status bahan sumber berada dalam `OWNER-DATA-CHECKLIST.md`.
