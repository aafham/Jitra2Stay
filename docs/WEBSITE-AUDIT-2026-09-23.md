# Audit menyeluruh website — 23 September 2026

> Rekod bertarikh: penemuan, angka ujian dan path di bawah merujuk keadaan ketika audit. Source kini disusun dalam `src/`; lihat [struktur semasa](../README.md#struktur-repo) dan [indeks dokumentasi](README.md).

Skop: homepage dari header hingga footer, BM/EN, semua 16 halaman output, desktop, tablet, telefon dan keadaan fungsi yang gagal atau lambat. Audit bermula daripada `7878a04`. Semua fakta rumah, kadar, background, 21 foto, sembilan kad kemudahan dan 50 destinasi dikekalkan.

## Penemuan dan pembaikan

| Masalah yang direproduksi | Pembaikan |
| --- | --- |
| Menu HTML mobile kelihatan seketika sebelum JS menyorokkannya; kedudukan main berubah daripada 467px kepada 73px, CLS 0.428 dalam muatan yang diperiksa | Tetapkan susunan awal header sebelum CSS dilukis, kemudian serahkan kepada menu interaktif. Tema simpanan/sistem turut digunakan sebelum paparan pertama. |
| Desktop memuatkan 18 foto galeri sebelum JS mengehadkan grid kepada enam; 12 daripadanya kemudian tersembunyi | Sembunyikan kad selepas enam secara sementara sebelum galeri diaktifkan; foto selebihnya dimuat apabila diperlukan. |
| Fallback berdasarkan `load` melambatkan pemulihan menu apabila skrip gagal dan gambar masih dimuat | Pulihkan HTML pada `DOMContentLoaded`, selepas skrip deferred selesai/gagal, tanpa menunggu aset gambar atau iframe. |
| Penolakan clipboard tertunda menarik fokus daripada ruangan nota kembali ke pautan/alamat/FAQ/pelan keluarga | Paparkan fallback tanpa mengubah fokus jika pengguna telah berpindah. Tindakan serta fallback segera juga diuji pada WebKit. |
| Keputusan salinan FAQ boleh muncul selepas soalan ditutup/ditapis; butang kongsi kehilangan fokus apabila disabled | Abaikan respons untuk jawapan tersembunyi; gunakan status busy dan guard pengaktifan berulang sambil mengekalkan fokus. |
| Teks 200% pada telefon memecahkan nilai harga dan melimpahkan label pakej, fakta, penapis, pilihan malam serta unit harga hero | Gunakan minimum kolum berdasarkan saiz teks dan benarkan susunan/wrapping menyesuaikan ruang. Harga asas kekal satu nombor yang lengkap. |
| Tajuk halaman susulan BM/EN terkeluar viewport apabila teks dibesarkan | Benarkan perkataan panjang dibalut dalam lebar halaman. |
| Panduan mengandungi julat perjalanan lama yang bercanggah dengan snapshot laluan sedia ada | Jana minit/km/pautan/tarikh daripada sumber yang sama. Sepuluh destinasi panduan sekitar Jitra disusun sebagai senarai. |
| Panel kawasan homepage juga mengumpulkan tempat di bawah julat lama, contohnya Changlun dalam 30+ minit sedangkan kad laluannya 20 minit | Ganti label julat dengan label kawasan/jenis tempat; kekalkan enam kumpulan dan semua penerangan/nama asal, lalu rujuk masa pada kad laluan bertarikh. |

## Liputan pemeriksaan

- Header, tema, menu animasi, navigasi seksyen, pertukaran bahasa, hero/background dan fakta rumah.
- Semua kategori foto, pautan kad kemudahan, dialog, gambar menegak, thumbnail, keyboard, Escape, leretan dan fallback gambar.
- Empat pakej, pilihan malam, deposit berasingan, draf, validasi, anggaran, perkongsian keluarga dan penyediaan mesej WhatsApp.
- Google Maps sebenar, pin rumah, pautan Google Maps/Waze, salin alamat, carian/kategori destinasi serta nota perjalanan.
- FAQ, footer, polisi, empat pasangan panduan, halaman susulan dan 404.
- Pautan dalaman, anchor, rujukan ARIA, metadata, canonical/hreflang, skema serta sempadan fail awam.

Matriks awal mengandungi 104 semakan Chromium/WebKit bagi viewport biasa 320–900px dan halaman sokongan, serta 18 interaksi galeri. Screenshot desktop 901/1024/1440px dan telefon/tablet diperiksa mengikut bahagian. Teks 200% diuji pada 320/390/600px; susunan biasa tetap diperiksa untuk mengelakkan regresi.

Empat muatan selepas pembaikan pada 390px dan 1440px, termasuk skrip yang dilambatkan 600ms, merekodkan **CLS 0.000**, **enam foto galeri dimuatkan** dan **sifar foto tersembunyi dimuatkan**. Ini ukuran bagi keadaan tersebut, bukan skor semua rangkaian/peranti.

Keputusan suite release dan batas semakan direkodkan dalam [QA-REPORT.md](QA-REPORT.md). Bukti tempatan, JSON dan screenshot berada dalam folder kerja `outputs/full-audit-2026-09-23/` di luar output website.

## Batas pengesahan

Chromium dan WebKit dijalankan dengan emulasi viewport/sentuhan; telefon Android/iPhone fizikal dan papan kekunci peranti tidak diuji. Suite menggunakan fixture iframe Maps, dengan peta sebenar diperiksa berasingan. Mesej WhatsApp tidak dihantar dan tiada bayaran dibuat. Anggaran perjalanan kekal snapshot 19–20 September, bukannya trafik masa nyata.
