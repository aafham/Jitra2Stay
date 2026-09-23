# Deployment Jitra2Stay

Semua host frontend mesti menerbitkan **dist/**, bukan root repository. HTML dijana daripada `src/templates/` dan data dalam `src/data/`. Kalendar dan rekod tetamu menggunakan backend Supabase yang dideploy berasingan. Arahan dijalankan dari root repo; lihat [README](../README.md).

## Build

```sh
npm ci
npm run build
npm run qa
```

Build membersihkan hanya folder dist yang dimiliki projek. Aset foto kamera asal dan sejarah Git kekal. Output mengandungi 18 HTML termasuk dua halaman pengurusan, CSS/JS browser, public `app.config.js` dan `guest.config.js`, robots, sitemap, favicon serta JPG/WebP yang digunakan. Raw, tools, tests, docs, `supabase/` dan manifest provenance tidak disalin. Halaman pengurusan menggunakan `noindex` dan tidak disenaraikan dalam sitemap; akses mengubah rekod tetap dilindungi server.

`src/scripts/` dan `src/styles/` dipetakan terus ke root output; gambar daripada `src/images/` diterbitkan sebagai `dist/images/`. Oleh itu URL awam seperti `/app.js` dan `/images/…` kekal sama selepas susunan repo berubah. `artifacts/` hanya menyimpan laporan ujian tempatan dan tidak diterbitkan.

## Vercel

Import repo sedia ada. vercel.json menetapkan install npm ci, build npm run build, framework null dan outputDirectory dist. Push branch menghasilkan preview melalui Git integration; production mengikuti main. Semak preview sebelum merge. Jangan cipta projek Vercel kedua jika integration sedia ada sudah berfungsi.

Header nosniff/referrer/permissions dan cache aset ditetapkan dalam config. `app.config.js` dan `guest.config.js` yang dipublish hanya data/endpoint yang memang public; jangan tambah secret.

## GitHub Pages

Dalam Settings → Pages, gunakan Source **GitHub Actions**. Job deploy dalam .github/workflows/qa.yml hanya berjalan pada main selepas unit/static/browser checks lulus, membina output dan upload artifact dari dist sahaja. Job PR tidak deploy ke Pages. URL mirror menggunakan path /Jitra2Stay/; pautan/aset relatif kekal berfungsi, canonical production tetap Vercel.

## Netlify

netlify.toml menetapkan npm run build dan publish dist serta fallback 404. Jalankan npm ci mengikut lockfile. Jangan ubah publish directory kepada root.

## cPanel / hosting statik

Jalankan build local dan upload semua kandungan dist, termasuk halaman English, empat pasang panduan, favicon dan folder images. Tetapkan custom error document kepada 404.html dengan status HTTP 404. Jangan muat naik repository, node_modules atau raw archive. Pastikan fail output lama yang sudah tidak digunakan tidak kekal dalam folder public hosting.

## Pengesahan selepas deploy

- Homepage BM/EN, polisi, panduan dan gambar memberi 200.
- URL tidak wujud memberi 404 sebenar.
- `/src/data/site.config.cjs`, `/src/images/responsive/manifest.json`, `/docs/OWNER-DATA-CHECKLIST.md`, `/tools/qa-check.js`, `/supabase/config.toml`, `/supabase/functions/guest-calendar/handler.mjs` dan `/source-images/latest-raw/IMG_8012.JPG` tidak boleh dicapai. URL dokumen lama `/OWNER-DATA-CHECKLIST.md` juga mesti kekal 404.
- Canonical, hreflang, OG dan sitemap menggunakan business.siteUrl yang aktif.
- WhatsApp membuka nombor yang betul; pautan fallback mengekalkan input.
- Kalendar/upcoming dapat dimuat pada Vercel dan GitHub Pages; muatan gagal mesti menyatakan ralat, bukannya semua tarikh kosong. PIN, simpan tanpa tujuan, edit, konflik tarikh, batal dan kembali ke homepage berfungsi. Gunakan rekod ujian terkawal dan bersihkan selepas pengesahan; jangan salin nama/nota sebenar ke laporan.
- Test pada telefon sebenar sebelum menganggap phone flow selesai.

Rollback menggunakan release/commit terakhir yang lulus. Jangan rollback dengan menerbitkan root sumber yang mengandungi arkib.

## Supabase: database dan Edge Function

Projek `jitra2stay` berada di Singapore, reference `mdijxatmqlmaigcdypqk`. URL function awam ialah `https://mdijxatmqlmaigcdypqk.supabase.co/functions/v1/guest-calendar`; nilainya dikawal dalam `src/data/guest.config.cjs`. Reference/URL ini bukan credential. Satu database digunakan oleh kedua-dua frontend production.

Frontend GitHub/Vercel/Pages tidak menjalankan migration atau deploy function secara automatik. Untuk perubahan backend:

1. Semak project sasaran dan migration sedia ada. Gunakan Supabase CLI/MCP dengan akses pentadbir; sahkan arahan CLI melalui `--help` sebelum menjalankannya. Migration awal berada dalam `supabase/migrations/20260923095301_guest_calendar.sql`; jangan apply semula jika sudah direkodkan.
2. Apply migration yang baharu dan semak security/performance advisors. Semua jadual mempunyai RLS, tanpa akses terus `anon`/`authenticated`; RPC hanya untuk `service_role` dan menggunakan `SECURITY INVOKER`.
3. Deploy `supabase/functions/guest-calendar/index.ts` bersama import `handler.mjs`, dengan `verify_jwt=false` seperti `supabase/config.toml`. Function mempunyai endpoint awam dan mengesahkan opaque Bearer token sendiri untuk tindakan pengurusan. Ia menggunakan `SUPABASE_URL` serta `SUPABASE_SERVICE_ROLE_KEY` yang tersedia pada server sahaja.
4. Jika projek baharu, sediakan hash PIN melalui sambungan pentadbir secara berasingan seperti [panduan backend](../supabase/README.md). Jangan letak nilai PIN, hash atau kunci di migration, Git, terminal history atau konfigurasi frontend. Pertukaran PIN perlu membatalkan semua sesi sedia ada.
5. Uji baca awam, login, session, save/edit/cancel dan logout. Ujian SQL rollback dalam `supabase/tests/` hanya untuk projek baharu atau database ujian, sebelum terdapat booking sebenar. Jangan gunakan suite tersebut sebagai health check production.
6. Build/deploy frontend jika kontrak atau URL awam berubah. CORS membenarkan origin tepat Vercel, GitHub Pages dan preview local port 4173; domain production baharu memerlukan kemas kini senarai origin pada server.

PIN login menggunakan had kongsi 5 kesilapan dalam 15 minit. Sesi sah 8 jam dan logout berjaya memadam sesi server. Panduan operasi/recovery berada dalam [backend README](../supabase/README.md). Notis advisor `rls_enabled_no_policy` ialah INFO yang dijangka untuk tiga jadual service-only; jangan membuka polisi awam untuk menghilangkannya.

Rollback frontend tidak memadam rekod database atau membatalkan migration. Kekalkan keserasian API ketika rollback dan gunakan perubahan schema pembetulan yang disemak; jangan menjatuhkan jadual booking untuk kembali ke UI lama.
