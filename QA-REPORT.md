# Jitra2Stay QA Report

Tarikh QA: 2026-05-18

## Status Ringkas

Build semasa: ready for owner data, phone test, dan deploy.

QA automatik terakhir:

```powershell
node tools/qa-check.js
```

Keputusan:

```text
All 55 QA checks passed.
```

## Checks Yang Lulus

- [x] Fail penting wujud.
- [x] Homepage ada tepat 1 `h1`.
- [x] ID penting homepage wujud.
- [x] Local SEO intent copy wujud.
- [x] FAQ search-intent wujud.
- [x] No-JS fallback wujud.
- [x] Public files tidak expose sensitive info yang biasa berlaku.
- [x] Pasangan attribute BM/EN lengkap.
- [x] Internal anchor homepage resolve.
- [x] Image references homepage wujud.
- [x] Semua `target="_blank"` ada `rel="noopener"`.
- [x] Semua WhatsApp link ada default text.
- [x] Sitemap ada URL public wajib.
- [x] Robots file point ke sitemap.
- [x] HTML pages ada title dan viewport.
- [x] Referrer policy ada pada page utama.
- [x] 404 page ada recovery actions.
- [x] Policies page ada print styles.
- [x] Semua gambar website dalam `images/` bawah 350 KB.
- [x] Local static server load required paths.

## Saiz Gambar Website Semasa

| Gambar | Saiz |
| --- | ---: |
| `halaman.jpg` | 328 KB |
| `parking.jpg` | 316 KB |
| `luar-rumah.jpg` | 318 KB |
| `dapur.jpg` | 243 KB |
| `bilik-tidur.jpg` | 249 KB |
| `ruang-tamu.jpg` | 255 KB |
| `ruang-makan.jpg` | 204 KB |
| `bilik-keluarga.jpg` | 252 KB |
| `bilik-besar.jpg` | 267 KB |
| `tangga-ruang-makan.jpg` | 215 KB |
| `porch-parking.jpg` | 243 KB |

Raw files asal disimpan di `source-images/latest-raw/` dan tidak digunakan sebagai public website assets.

## Masih Perlu Test Manual

- [ ] Test semua WhatsApp CTA dari phone sebenar.
- [ ] Submit form booking dari phone sebenar.
- [ ] Test dark/light mode di phone sebenar.
- [ ] Test gallery lightbox di phone sebenar.
- [ ] Test Google Maps link dari phone sebenar.
- [ ] Test share preview WhatsApp/Facebook selepas domain live.
- [ ] Test website menggunakan mobile data.

## Masih Perlu Data Owner

- [ ] Gambar semua 3 bilik air.
- [ ] Gambar semua 5 bilik tidur berlabel jika mahu pecahkan satu per satu.
- [ ] Video walkthrough kecil jika mahu aktifkan section video.
- [ ] Harga peak season, cuti sekolah, cuti umum, konvokesyen.
- [ ] Parking sebenar muat berapa kereta/van/bas.
- [ ] Polisi refund dan tukar tarikh final.
- [ ] Kemudahan tambahan final seperti TV, peti ais, mesin basuh, iron, rice cooker, toiletries.
- [ ] Tarikh unavailable terkini.
- [ ] Review/testimoni/rating sebenar jika mahu dipaparkan.

## Nota

Website ini kekal static, view-only, dan direct WhatsApp. Tiada login admin, tiada login user, tiada dashboard, dan tiada payment gateway dalam website.
