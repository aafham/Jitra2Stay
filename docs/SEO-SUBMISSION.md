# SEO dan pengesahan selepas release

Domain production dalam `src/data/site.config.cjs` ialah https://jitra2stay.vercel.app. Domain .com lama tidak resolve semasa audit. Build menjana canonical, metadata OG/Twitter, schema, sitemap dan robots daripada sumber sama.

Halaman BM/EN sebenar mempunyai URL berasingan serta hreflang dua hala. Root / ialah BM, /en.html ialah EN; /ms.html menjadi alias BM dengan canonical root. Empat panduan dan polisi mempunyai pasangan -en.html. Thank-you dan 404 ialah noindex; sitemap mengandungi 12 URL yang dimaksudkan untuk diindeks.

Langkah yang memerlukan akaun/semakan owner:

- [ ] Sahkan property domain/URL dalam Google Search Console.
- [ ] Submit /sitemap.xml dan semak hasil URL Inspection selepas deploy.
- [ ] Uji preview WhatsApp/Facebook daripada URL production sebenar.
- [ ] Selaraskan nama, alamat dan nombor dengan profil business rasmi.
- [ ] Jika domain .com tersedia kemudian, aktifkan DNS/SSL, ubah config dan redirect host lama secara konsisten.

Jangan menjanjikan ranking, rating atau rich result daripada kewujudan JSON-LD. Tiada rating/review atau isyarat InStock tarikh ditambah. Kandungan panduan menerangkan perbezaan urusan hospital/keluarga/UUM dan merujuk Maps untuk laluan semasa.

Rujukan: [canonical Google](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [halaman pelbagai bahasa](https://developers.google.com/search/docs/specialty/international/localized-versions).
