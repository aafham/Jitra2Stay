# Jitra2Stay

Website homestay statik untuk melihat rumah, gambar, kemudahan, kadar, lokasi dan polisi sebelum menghubungi owner melalui WhatsApp.

**Skop: paparan maklumat + pertanyaan WhatsApp.** Website tidak menyimpan tempahan, mengesahkan slot sebenar atau memproses bayaran. Tarikh, harga akhir, bayaran dan arahan check-in disahkan oleh owner.

- [Website yang boleh dicapai semasa audit](https://jitra2stay.vercel.app/)
- [Audit menyeluruh: UI/UX, fungsi, kandungan dan teknikal](AUDIT-2026-09-11.md)
- [Checklist data owner](OWNER-DATA-CHECKLIST.md)

## Status audit 11 September 2026

Baseline: [`18a274d`](https://github.com/aafham/Jitra2Stay/commit/18a274d67ba26944de3295d4446646c68aca2599). Kemas kini dokumentasi ini merekodkan penemuan dan cadangan; pembaikan aplikasi dalam roadmap masih belum dilaksanakan.

| Semakan | Keputusan |
| --- | --- |
| `node tools/qa-check.js` | 76 semakan lulus |
| Sintaks `app.js` dan `app.config.js` | Lulus `node --check` |
| Chrome, lebar 320 / 390 / 768 / 1440 px | Homepage dipaparkan; tiada overflow mendatar selepas scroll |
| Browser dan aksesibiliti | Isu menu mobile, galeri papan kekunci, kontras dan paparan tanpa JS disahkan |
| Domain metadata | `jitra2stay.com` tidak resolve semasa audit; metadata masih menggunakan domain tersebut |
| Kalendar | Hanya blok 1–3 Mei 2026, tanpa feed ICS; bukan bukti slot semasa |
| WhatsApp/peranti sebenar dan maklumat owner | Perlu pengesahan manual; audit tidak menghantar mesej sebenar |

**Lulus QA statik bukan pengesahan semua aliran pengguna atau maklumat perniagaan.** Ujian browser menemui masalah yang tidak diperiksa oleh skrip QA.

## Fungsi semasa

- Homepage, empat pakej kadar, galeri, kemudahan, lokasi, FAQ dan CTA WhatsApp.
- Borang praisi mesej WhatsApp serta anggaran kadar asas mengikut bilik dan malam.
- BM/EN pada homepage; terjemahan belum lengkap sepanjang aliran pengguna.
- Mod terang/gelap, menu mobile, lightbox dan peta yang dimuatkan atas permintaan.
- Kalendar rujukan dua bulan dan integrasi ICS pilihan yang masih memerlukan pembaikan.
- Halaman polisi, thank-you, 404 dan empat panduan carian setempat.

Klik WhatsApp hanya membuka teks praisi. Pengunjung masih perlu menekan **Send/Hantar dalam WhatsApp**; klik tersebut bukan bukti mesej dihantar atau booking disahkan.

## Maklumat dalam kod

Inventori ini menerangkan kandungan semasa, bukan pengesahan bebas keadaan rumah atau terma owner.

| Maklumat | Kandungan semasa |
| --- | --- |
| Rumah | Semi-D dua tingkat, 5 bilik tidur, 3 bilik air |
| Harga asas semalam | 2 bilik RM180 · 3 bilik RM230 · 4 bilik RM280 · 5 bilik RM330 |
| Security deposit | RM100 |
| Check-in / check-out | 3 petang / 12 tengah hari |
| Alamat | 49, Taman Jitra Indah, Jalan Hospital Daerah, 06000 Jitra, Kedah |
| Hubungan utama | +60 19-441 0666 · jitra2stay@gmail.com |

Owner perlu menyelaraskan kapasiti selesa berbanding maksimum 20 orang, asas caj lebihan RM10, katil/parking, kadar musim puncak, booking deposit, pembatalan, pertukaran tarikh dan kelengkapan sebenar. FAQ dan halaman polisi kini mempunyai maklumat yang tidak lengkap atau tidak selari. Jangan menambah syarat berdasarkan andaian.

## Jalankan secara local

HTML, CSS dan JavaScript biasa; tiada framework, database, build wajib atau dependency npm untuk menjalankan laman.

```sh
git clone https://github.com/aafham/Jitra2Stay.git
cd Jitra2Stay
python -m http.server 5500 --bind 127.0.0.1
```

Buka [http://127.0.0.1:5500](http://127.0.0.1:5500). Contoh ini memerlukan Python 3; server HTTP statik lain juga boleh digunakan. Gunakan server HTTP untuk ujian, kerana `file://` boleh memberi tingkah laku fetch, storage dan URL yang berbeza.

Semakan dengan Node.js:

```sh
node --check app.js
node --check app.config.js
node tools/qa-check.js
```

QA memeriksa fail, corak kandungan, pautan tertentu, gambar, metadata dan HTTP local. Ia **tidak mengawal browser**, mengesahkan logik kalendar, DNS, WhatsApp telefon, aksesibiliti penuh atau polisi owner. Angka 76 menggantikan angka sejarah 55 dalam dokumentasi lama.

## Struktur repo

| Fail / folder | Tujuan |
| --- | --- |
| `index.html` | Kandungan homepage, atribut BM/EN, form dan galeri |
| `style.css` | Layout, responsive, tema dan animasi |
| `app.js` | Interaksi, anggaran, kalendar, WhatsApp, bahasa, analytics dan schema |
| `app.config.js` | Metadata business, nombor form, integrasi dan blocked ranges |
| `images/` | Aset JPG/WebP website |
| `source-images/latest-raw/` | Arkib gambar asal; bukan aset untuk diterbitkan bersama website |
| `policies.html`, `thank-you.html`, `404.html` | Halaman sokongan |
| `ms.html`, `en.html` | Redirect bahasa; bukan halaman terjemahan statik penuh |
| `homestay-*.html`, `tempat-menarik-sekitar-jitra.html`, `seo-page.css` | Empat panduan setempat dan styling |
| `robots.txt`, `sitemap.xml` | Maklumat crawler dan senarai URL |
| `tools/qa-check.js` | QA statik dan HTTP local |
| `AUDIT-2026-09-11.md` | Penemuan, bukti, keutamaan dan kriteria penerimaan semasa |

## Kemas kini kandungan dan konfigurasi

**`app.config.js` belum menjadi satu-satunya sumber data.** Mengubahnya sahaja tidak menyelaraskan semua teks, harga atau pautan yang dilihat pelawat.

| Perubahan | Tempat yang perlu diperiksa bersama |
| --- | --- |
| Telefon / WhatsApp | `app.config.js`, semua pautan HTML, mesej BM/EN dan CTA A/B |
| Harga | `roomRates` dalam `app.js`, kad harga, FAQ/schema, panduan dan polisi berkaitan |
| Domain | `business.siteUrl`/`image`, canonical, OG, Twitter, hreflang, sitemap, robots, halaman sokongan dan `siteOrigin` dalam `tools/qa-check.js` |
| Alamat / Maps / kapasiti / polisi | Homepage, polisi, panduan, schema dan checklist owner |
| Gambar | Aset, `<picture>`, `data-full`, alt/label BM/EN, hero CSS, preload dan gambar perkongsian |

Pilihan semasa:

- `bookingCalendarIcsUrl`: kosong. Baiki parser, zon waktu, ralat feed dan pengendalian label sebelum mengaktifkannya.
- `unavailableRanges`: data statik; ketiadaan blok bukan pengesahan tarikh kosong.
- `enableThankYouRedirect`: kini `true`; audit mencadangkan `false` untuk mengekalkan konteks laman/form.
- `walkthroughVideoUrl`: kosong; JavaScript menyembunyikan section video.
- `analytics.gaMeasurementId` / `analytics.plausibleDomain`: kosong. Kod masih merekod event localStorage dan menggunakan variasi CTA tanpa penyedia analytics.

## Roadmap disyorkan

Semua item di bawah ialah **cadangan belum dilaksanakan**.

### P1 — Sebelum promosi lebih luas

- [ ] Tetapkan domain yang berfungsi dan selaraskan metadata serta URL.
- [ ] Ganti isyarat slot tersedia daripada kalendar lapuk dengan arahan semak WhatsApp atau status tidak diketahui.
- [ ] Pastikan harga, gambar dan lokasi terlihat jika JavaScript gagal.
- [ ] Baiki menu mobile yang memotong pautan dan butang bahasa.
- [ ] Sahkan dan selaraskan polisi wang, kapasiti serta kemudahan dengan owner.

### P2 — Pengalaman pelawat dan fungsi

- [ ] Susun homepage: hero → fakta rumah → galeri → harga → kemudahan → lokasi → FAQ/polisi → WhatsApp.
- [ ] Ringkaskan penerangan booking berulang; jadikan form pertanyaan pilihan.
- [ ] Matikan redirect thank-you automatik; gunakan satu CTA konsisten.
- [ ] Baiki fokus menu/lightbox, akses galeri papan kekunci, teks kecil dan kontras butang.
- [ ] Lengkapkan foto bilik/bilik air, label katil dan parking yang disahkan.
- [ ] Jika kalendar dikekalkan, baiki check-out eksklusif, zon waktu dan state ralat/sync.
- [ ] Lengkapkan EN dan tentukan URL bahasa yang konsisten jika mahu diindeks.
- [ ] Padankan hero preload dengan gambar sebenar dan sediakan resolusi mengikut viewport.
- [ ] Hadkan fail deploy kepada aset website; keluarkan arkib mentah, tools dan dokumen operasi daripada output awam.

### P3 — Penyelenggaraan

- [ ] Satukan kadar, contact dan polisi melalui sumber data bersama yang menjana HTML statik, atau checklist penyelarasan yang jelas.
- [ ] Gabungkan CSS override berulang dengan semakan visual bagi setiap breakpoint/tema.
- [ ] Buang eksperimen A/B dan log lokal jika owner tidak menggunakannya.
- [ ] Tambah regression tests untuk kegagalan disahkan dan jalankan QA dalam CI.
- [ ] Selaraskan dokumentasi sejarah dengan status semasa.

Stack statik ini memadai. Login, dashboard, payment gateway dan booking engine tidak diperlukan untuk skop paparan homestay.

## Deploy dan semakan release

Sediakan folder output khusus dengan **10 fail HTML awam**, `style.css`, `seo-page.css`, `app.js`, `app.config.js`, `robots.txt`, `sitemap.xml` dan aset `images/` yang diperlukan. Konfigurasi host mesti menunjuk ke output itu. Jangan menerbitkan keseluruhan root repo secara automatik.

Audit mengesahkan satu gambar asal boleh dicapai melalui laman Vercel dengan HTTP 200. Arahan README tidak menyekat penerbitan; pengasingan output/pengecualian host masih perlu dilaksanakan. Arkib owner dan sejarah Git tidak perlu dipadam untuk membaiki output deploy.

Sebelum release:

- Uji semua halaman/aset melalui HTTPS serta status HTTP 404 untuk URL tidak wujud.
- Semak canonical, sitemap, URL bahasa dan gambar perkongsian pada domain sebenar.
- Pastikan arkib, tools dan dokumen operasi tidak boleh dicapai dari website.
- Uji menu, galeri, FAQ, peta, tema, bahasa dan form di desktop/mobile serta papan kekunci.
- Pastikan mesej WhatsApp praisi tepat, tanpa menganggap klik sebagai booking sah.
- Uji pembukaan WhatsApp pada Android/iPhone sebenar dan sediakan laluan cuba semula jika gagal.
- Semak kandungan teras masih terlihat tanpa JavaScript.
- Dapatkan pengesahan owner terhadap kadar, polisi, kemudahan, foto dan pin lokasi.

## Dokumen rujukan

- [Audit semasa](AUDIT-2026-09-11.md): titik mula untuk pembaikan.
- [Data owner](OWNER-DATA-CHECKLIST.md), [semakan kandungan](CONTENT-REVIEW.md), [QA sebelum live](PRE-LIVE-QA.md).
- [Penyelenggaraan](MAINTENANCE.md), [deploy](DEPLOYMENT.md), [SEO submission](SEO-SUBMISSION.md), [templat WhatsApp](WHATSAPP-TEMPLATES.md).
- [QA sejarah](QA-REPORT.md), [audit gambar sejarah](IMAGE-AUDIT.md), [handover](HANDOVER.md), [changelog](CHANGELOG.md).

Dokumen sejarah masih mengandungi checklist dan keputusan Mei 2026. Rujuk tarikh setiap dokumen; tanda siap lama bukan pengesahan semasa. Percanggahan yang belum dikemas kini diterangkan dalam laporan audit.
