'use strict';

// Searchable names from the owner's six original nearby-area descriptions.
// These queries are navigation aids, not claims of a verified location/distance.
const locationNotes = {
  'hotel-regency': {ms:'Semak nama hotel yang dituju dalam Google Maps.',en:'Check the intended hotel name in Google Maps.'},
  'unimap': {ms:'Pilih kampus UniMAP yang dituju dalam Google Maps.',en:'Choose your intended UniMAP campus in Google Maps.'},
  'kem-askar-melayu': {ms:'Pilih kem yang dituju dalam Google Maps.',en:'Choose your intended army camp in Google Maps.'},
  'mardi': {ms:'Pilih cawangan MARDI yang dituju dalam Google Maps.',en:'Choose your intended MARDI branch in Google Maps.'}
};
// Curated shortcuts reuse the existing destinations and their verified routes.
const placesToVisit = new Set(['tasik-darulaman', 'darulaman-fantasia', 'darulaman-golf', 'masjid-zahir']);
const destinations = [
  ['hospital-jitra', 'Hospital Jitra', 'Jitra Hospital', 'Hospital Jitra Kedah', 'hospital klinik'],
  ['uum', 'Universiti Utara Malaysia (UUM)', 'Universiti Utara Malaysia (UUM)', 'Universiti Utara Malaysia Sintok Kedah', 'uum universiti konvokesyen university'],
  ['airport', 'Lapangan Terbang Sultan Abdul Halim', 'Sultan Abdul Halim Airport', 'Sultan Abdul Halim Airport Alor Setar Kedah', 'airport kepala batas lapangan terbang'],
  ['polimas', 'POLIMAS', 'POLIMAS', 'Politeknik Sultan Abdul Halim Muadzam Shah Jitra Kedah', 'polimas politeknik'],
  ['ipg-darulaman', 'IPG Darulaman', 'IPG Darulaman', 'Institut Pendidikan Guru Kampus Darulaman Jitra Kedah', 'ipg institut pendidikan guru'],
  ['lotus-jitra', 'Lotus Jitra', 'Lotus Jitra', 'Lotus Jitra Kedah', 'lotus tesco pasar raya supermarket'],
  ['ikbn-jitra', 'IKBN Jitra', 'IKBN Jitra', 'Institut Kemahiran Belia Negara Jitra Kedah', 'ikbn'],
  ['mrsm-kubang-pasu', 'MRSM Kubang Pasu', 'MRSM Kubang Pasu', 'MRSM Kubang Pasu Kedah', 'mrsm maktab'],
  ['tasik-darulaman', 'Tasik Darulaman', 'Darulaman Lake', 'Tasik Darulaman Jitra Kedah', 'tasik taman lake park rekreasi'],
  ['darulaman-fantasia', 'Darulaman Fantasia Aquapark', 'Darulaman Fantasia Aquapark', 'Darulaman Fantasia Aquapark Jitra Kedah', 'waterpark taman air rekreasi'],
  ['masjid-zahir', 'Masjid Zahir', 'Zahir Mosque', 'Masjid Zahir Alor Setar Kedah', 'masjid mosque'],
  ['bukit-kayu-hitam', 'Bandar Bukit Kayu Hitam', 'Bukit Kayu Hitam town', 'Bukit Kayu Hitam Kedah', 'bukit kayu hitam town bandar'],
  ['giat-mara', 'Pusat Giat Mara', 'Pusat Giat Mara', 'Giatmara Jitra Kedah', 'giatmara'],
  ['dewan-jitra', 'Dewan Jitra', 'Dewan Jitra', 'Dewan Jitra Kedah', 'dewan hall'],
  ['masjid-sharifah-fatimah', 'Masjid Sharifah Fatimah', 'Masjid Sharifah Fatimah', 'Masjid Sharifah Fatimah Jitra Kedah', 'masjid mosque'],
  ['dewan-tunku-anum', 'Dewan Tunku Anum', 'Dewan Tunku Anum', 'Dewan Tunku Anum Jitra Kedah', 'dewan hall'],
  ['dewan-wawasan', 'Dewan Wawasan', 'Dewan Wawasan', 'Dewan Wawasan Jitra Kedah', 'dewan hall'],
  ['mpkp', 'MPKP', 'MPKP', 'Majlis Perbandaran Kubang Pasu Jitra Kedah', 'mpkp majlis perbandaran'],
  ['ipd-kubang-pasu', 'IPD Kubang Pasu', 'Kubang Pasu Police HQ', 'Ibu Pejabat Polis Daerah Kubang Pasu Jitra Kedah', 'ipd polis police'],
  ['hotel-bustani', 'Hotel Bustani', 'Hotel Bustani', 'Hotel Bustani Jitra Kedah', 'hotel'],
  ['bandar-jitra', 'Bandar Jitra', 'Jitra town', 'Jitra Kedah', 'bandar town'],
  ['bandar-darulaman', 'Bandar Darulaman', 'Bandar Darulaman', 'Bandar Darulaman Jitra Kedah', 'bandar town'],
  ['ilp-jitra', 'ILP Jitra', 'ILP Jitra', 'Institut Latihan Perindustrian Jitra Kedah', 'ilp institut latihan perindustrian'],
  ['iab-utara', 'IAB Cawangan Utara', 'Northern Branch IAB', 'Institut Aminuddin Baki Cawangan Utara Jitra Kedah', 'iab institut aminuddin baki'],
  ['c-mart-bdi', 'C-Mart BDI', 'C-Mart BDI', 'C Mart Bandar Darulaman Jitra Kedah', 'cmart c-mart bdi pasar raya supermarket'],
  ['yawata', 'Yawata', 'Yawata', 'Yawata Jitra Kedah', 'pasar raya supermarket'],
  ['masjid-muttaqin', 'Masjid Muttaqin', 'Masjid Muttaqin', 'Masjid Muttaqin Bandar Darulaman Jitra Kedah', 'masjid mosque'],
  ['hotel-darulaman', 'Hotel Darulaman', 'Hotel Darulaman', 'Hotel Darulaman Jitra Kedah', 'hotel'],
  ['kem-kelubi', 'Kem Kelubi', 'Kem Kelubi', 'Kem Kelubi Jitra Kedah', 'kem camp'],
  ['kem-askar-melayu', 'Kem Askar Melayu', 'Malay Army Camp', 'Kem Askar Melayu Jitra Kedah', 'kem camp askar army'],
  ['smsah-jenan', 'SMSAH / Jenan', 'SMSAH / Jenan', 'Sekolah Menengah Sultan Abdul Halim Jitra Kedah', 'smsah jenan sekolah school'],
  ['masjid-al-muhsinin', 'Masjid Al Muhsinin', 'Masjid Al Muhsinin', 'Masjid Al Muhsinin Jitra Kedah', 'masjid mosque'],
  ['hotel-regency', 'Hotel Regency', 'Hotel Regency', 'Hotel Regency Jitra Kedah', 'hotel'],
  ['darulaman-golf', 'Darulaman Golf Club', 'Darulaman Golf Club', 'Darulaman Golf Club Jitra Kedah', 'golf rekreasi'],
  ['masjid-as-syabab', 'Masjid As Syabab Kepala Batas', 'Masjid As Syabab Kepala Batas', 'Masjid As Syabab Kepala Batas Kedah', 'masjid mosque'],
  ['kolej-tentera-udara', 'Kolej Tentera Udara', 'Air Force College', 'Kolej Tentera Udara Kepala Batas Kedah', 'kolej tentera udara air force'],
  ['bandar-anak-bukit', 'Bandar Anak Bukit', 'Anak Bukit town', 'Anak Bukit Alor Setar Kedah', 'bandar town'],
  ['istana-anak-bukit', 'Istana Anak Bukit', 'Anak Bukit Palace', 'Istana Anak Bukit Kedah', 'istana palace'],
  ['bandar-alor-setar', 'Bandar Alor Setar', 'Alor Setar town', 'Alor Setar Kedah', 'bandar town'],
  ['changlun', 'Pekan Changlun', 'Changlun town', 'Changlun Kedah', 'pekan bandar town'],
  ['matrikulasi-kubang-pasu', 'Matrikulasi Kubang Pasu Changlun', 'Kubang Pasu Matriculation College', 'Kolej Matrikulasi Kedah Changlun Kedah', 'matrikulasi kolej college'],
  ['unimap', 'UniMAP', 'UniMAP', 'Universiti Malaysia Perlis', 'unimap universiti university'],
  ['kolej-pertanian', 'Kolej Pertanian', 'Agriculture College', 'Kolej Pertanian Kedah', 'kolej pertanian agriculture college'],
  ['mardi', 'MARDI', 'MARDI', 'MARDI Kedah', 'mardi'],
  ['abm', 'ABM', 'ABM', 'Akademi Binaan Malaysia Kedah', 'abm akademi binaan malaysia'],
  ['edc-uum', 'EDC-UUM Hotel', 'EDC-UUM Hotel', 'EDC UUM Hotel Sintok Kedah', 'edc hotel uum'],
  ['sbpi-bukit-kayu-hitam', 'SBPI Bukit Kayu Hitam', 'SBPI Bukit Kayu Hitam', 'SBPI Kubang Pasu Bukit Kayu Hitam Kedah', 'sbpi sekolah school'],
  ['polipauh', 'PoliPauh', 'PoliPauh', 'Politeknik Tuanku Syed Sirajuddin Pauh Perlis', 'polipauh politeknik pauh'],
  ['matrikulasi-arau', 'Matrikulasi Arau', 'Arau Matriculation College', 'Kolej Matrikulasi Perlis Arau', 'matrikulasi kolej college'],
  ['uitm-arau', 'UiTM Arau', 'UiTM Arau', 'UiTM Arau Perlis', 'uitm universiti university']
].map(([id, ms, en, query, aliases]) => ({ id, ms, en, query, aliases: `${aliases}${placesToVisit.has(id) ? ' tempat menarik places to visit attractions' : ''}`, locationNote:locationNotes[id] }));

module.exports = destinations;
