# Jitra2Stay QA Report

Tarikh QA: 2026-05-08

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
- [x] Semua gambar semasa bawah 350 KB.
- [x] Local static server load required paths.

## Saiz Gambar Semasa

| Gambar | Saiz |
| --- | ---: |
| `halaman.jpg` | 179 KB |
| `parking.jpg` | 76 KB |
| `luar-rumah.jpg` | 76 KB |
| `dapur.jpg` | 71 KB |
| `bilik-tidur.jpg` | 62 KB |
| `ruang-tamu.jpg` | 55 KB |

Semua gambar semasa masih ringan untuk static website.

## Masih Perlu Test Manual

- [ ] Test semua WhatsApp CTA dari phone sebenar.
- [ ] Submit form booking dari phone sebenar.
- [ ] Test dark/light mode di phone sebenar.
- [ ] Test gallery lightbox di phone sebenar.
- [ ] Test Google Maps link dari phone sebenar.
- [ ] Test share preview WhatsApp/Facebook selepas domain live.
- [ ] Test website menggunakan mobile data.

## Masih Perlu Data Owner

- [ ] Gambar latest semua ruang/bilik/bilik air/parking/exterior.
- [ ] Harga peak season, cuti sekolah, cuti umum, konvokesyen.
- [ ] Parking sebenar muat berapa kereta/van/bas.
- [ ] Polisi refund dan tukar tarikh final.
- [ ] Kemudahan tambahan final seperti TV, peti ais, mesin basuh, iron, rice cooker, toiletries.
- [ ] Tarikh unavailable terkini.
- [ ] Review/testimoni/rating sebenar jika mahu dipaparkan.

## Nota

Website ini kekal static, view-only, dan direct WhatsApp. Tiada login admin, tiada login user, tiada dashboard, dan tiada payment gateway dalam website.
