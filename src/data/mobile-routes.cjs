// Public static pages; relative URLs also work on GitHub Pages subdirectories.
const routes = {
  rumah: {section:'tentang', ms:'Rumah', en:'The house', icon:'home'},
  gambar: {section:'galeri', ms:'Gambar rumah', en:'House photos', icon:'photos'},
  harga: {section:'kadar', ms:'Harga & pakej', en:'Rates & packages', icon:'bed'},
  kalendar: {section:'kalendar', ms:'Kalendar & tetamu', en:'Calendar & guests', icon:'calendar'},
  kemudahan: {section:'kemudahan', ms:'Kemudahan', en:'Amenities', icon:'wifi'},
  lokasi: {section:'lokasi', ms:'Lokasi & sekitar', en:'Location & nearby', icon:'pin'},
  faq: {section:'faq', ms:'Soalan lazim', en:'Common questions', icon:'help'},
  hubungi: {section:'semak-tarikh', ms:'Tanya owner', en:'Ask the owner', icon:'phone'},
  maklumat: {section:null, ms:'Maklumat lain', en:'More information', icon:'grid'}
};
const sectionRoutes=Object.fromEntries(Object.entries(routes).filter(([,r])=>r.section).map(([key,r])=>[r.section,key]));
module.exports={routes,sectionRoutes};
