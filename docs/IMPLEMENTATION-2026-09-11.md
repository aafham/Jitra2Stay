# Pelaksanaan audit — 11 September 2026

> Rekod bertarikh: penemuan, angka ujian dan path di bawah merujuk keadaan ketika audit. Source kini disusun dalam `src/`; lihat [struktur semasa](../README.md#struktur-repo) dan [indeks dokumentasi](README.md).

Skop: semua pembaikan kod, UI/UX dan operasi yang boleh dilaksanakan daripada audit baseline `18a274d`. Produk kekal laman paparan homestay dan pertanyaan WhatsApp.

## Penutupan penemuan

| Audit | Pelaksanaan |
| --- | --- |
| A01 domain | Satu `business.siteUrl` menggunakan host Vercel aktif; metadata, canonical, hreflang, sitemap dan robots dijana daripadanya |
| A02 slot lapuk | Kalendar dan status ketersediaan dibuang; hanya owner mengesahkan tarikh |
| A03 menu mobile | Menu mengikut viewport, scroll bila perlu, semua bahasa/pautan terlihat; `hidden` dan `inert` selari |
| A04 tanpa JS | HTML penuh terlihat; nav statik, pautan foto, native FAQ, Maps/WhatsApp berfungsi tanpa JS |
| A05 polisi | FAQ/polisi BM/EN menggunakan sumber sama; deposit/kapasiti konsisten; cutoff refund/parking/caj tambahan tidak diteka |
| A06 redirect | Tiada redirect selepas WhatsApp; form, teks praisi, pautan cuba semula dan salin mesej dikekalkan |
| A07 keyboard | Gallery anchor boleh dicapai, native dialog berlabel, Tab dibungkus, Escape/fokus kembali; closed nav dikeluarkan dari fokus |
| A08 kontras | Token tema disusun semula; butang hijau gelap dan teks lulus axe pada state yang diuji |
| A09 checkout | Pengiraan malam menggunakan `[check-in, check-out)`; tiada blocked-date gate pada pertanyaan |
| A10 timezone | Operasi date-only UTC konsisten, termasuk leap day/hujung tahun dan zon negatif |
| A11 ICS | Parser/integrasi dibuang daripada scope; tiada feed pelanggan atau kebocoran summary |
| A12 English | Homepage, polisi dan empat panduan mempunyai HTML/metadata/URL EN sendiri; pilihan pakej dan semua CTA mengikut bahasa |
| A13 gambar | Responsif 480/800/1200/full; hero memilih sumber yang dirender tanpa preload JPG/WebP berganda |
| A14 deploy | Manifest build menyalin hanya fail website ke dist; Vercel/Netlify/Pages menggunakan output sama |
| A15 hierarki | Fakta dan gambar naik ke atas, harga boleh dibanding, kandungan berulang dikurangkan, form pilihan di hujung |
| A16 maintainability | Satu sumber data, template ringan, CSS disusun, tracking/A-B dibuang, unit/browser/static tests dan CI ditambah; docs diperbaharui |

## UI/UX dan gambar

Identiti hijau dikekalkan. Foto rumah kini terlihat tanpa panel gelap yang menutupinya. Pada telefon, foto muncul selepas tajuk. Galeri mengandungi 11 gambar termasuk lima kumpulan bilik yang berbeza; foto tambahan datang daripada arkib owner, bukan imej rekaan. Foto bilik air masih tiada.

Dalam sesi Chrome 390×844, halaman utama sekitar 8,000px berbanding sekitar 24,862px baseline dengan state galeri biasa; tinggi berubah mengikut viewport, font dan bahagian terbuka. Ini perbandingan layout, bukan ukuran Core Web Vitals. Hero 800px ialah 89,434 bait, 480px 30,970 bait. Thumbnail dan hero boleh meminta dua resolusi berbeza untuk penggunaan yang berbeza; tiada lagi preload format yang tidak dirender sebagai hero.

## Pengesahan

- Build: 16 halaman HTML penuh, 12 URL dalam sitemap; utiliti thank-you/404 noindex dan alias BM tidak dimasukkan sitemap.
- QA: 427/427 statik, 5/5 unit, 24/24 Playwright Chromium 153.
- Keyboard, menu, no-JS BM/EN, dialog, form valid/invalid, negative timezone helpers, roundtrip bahasa, pilihan pakej dan popup diblok diuji.
- Axe: homepage light/dark pada mobile/desktop, polisi EN, menu terbuka dan dialog lulus untuk rules yang diuji.
- Permintaan source raw, tools, docs, dotfiles dan traversal ditolak oleh server dist; pautan/aset metadata disemak.
- CI dan output deployment disediakan; status release/commit sebenar boleh disemak pada GitHub PR dan deployment, bukan daripada tanda checklist lama.

## Batas yang masih memerlukan owner/peranti

Data fizikal dan keputusan polisi tidak boleh disahkan daripada kod. Owner masih perlu memberi foto bilik air, label/susunan katil final, kapasiti parking, kelengkapan tambahan, kadar musim puncak dan terma pembayaran/refund. Copy awam merujuk perkara yang belum jelas kepada owner sebelum bayaran. Tiada syarat baharu direka.

WhatsApp sebenar pada Android/iPhone, Safari sebenar, mobile data, pin lapangan, masa perjalanan dan Search Console belum disahkan. Ujian tidak menghantar mesej atau memproses bayaran. Kalendar/ICS bukan kerja tertangguh: ia sengaja dikeluarkan kerana produk ini view-only.
