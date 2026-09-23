// Owner-provided property facts and policy copy shared by every generated page.
// Restored from the original repository at 18a274d; see RESTORED-CONTENT.md.
module.exports = {
  business: {
    name: 'Jitra2Stay',
    siteUrl: 'https://jitra2stay.vercel.app',
    phone: '60194410666',
    phoneDisplay: '+60 19-441 0666',
    secondaryPhone: '60194420666',
    secondaryPhoneDisplay: '+60 19-442 0666',
    email: 'jitra2stay@gmail.com',
    facebookUrl: 'https://www.facebook.com/media/set/?set=a.2393864657563587&type=3',
    address: { street: '49, Taman Jitra Indah, Jalan Hospital Daerah', city: 'Jitra', region: 'Kedah', postalCode: '06000', country: 'MY' },
    mapUrl: 'https://goo.gl/maps/pjnMbwm5Pk2QqPeP8',
    // Coordinates verified against the existing Google Maps place pin on 2026-09-11.
    coordinates: { latitude: 6.2805462, longitude: 100.4151952 },
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8720554542947!2d100.4151952!3d6.2805462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304b592244adad0b%3A0x5a66d4c44467c0f6!2sJitra2Stay!5e0!3m2!1sen!2sus!4v1770206439318!5m2!1sen!2sus',
    bedrooms: 5, bathrooms: 3, maxGuests: 20,
    typicalGuests: { min: 6, max: 10 },
    fullHousePrivacy: true, selfCheckIn: true,
    parkingCars: { min: 3, max: 4 },
    securityDeposit: 100, earlyLateFee: 20, extraGuestFee: 10,
    cancellationNoticeDays: 7,
    paymentMethods: ['Bank transfer', 'DuitNow QR', 'Cash'],
    checkInTime: '15:00', checkOutTime: '12:00'
  },
  rates: [
    // exampleGuests reproduces the original price-sharing examples, not a
    // package occupancy cap or the threshold for an extra-guest charge.
    { rooms: 2, bathrooms: 2, price: 180, exampleGuests: 6 },
    { rooms: 3, bathrooms: 3, price: 230, exampleGuests: 8 },
    { rooms: 4, bathrooms: 3, price: 280, exampleGuests: 9 },
    { rooms: 5, bathrooms: 3, price: 330, exampleGuests: 10 }
  ],
  rooms: [
    { image: 'bilik-tidur', ms: ['Bilik tidur utama', 'Bilik tidur utama dengan penyaman udara, kipas siling dan rak pakaian.'], en: ['Main bedroom', 'The main bedroom has air conditioning, a ceiling fan and a clothes rack.'] },
    { image: 'bilik-keluarga', ms: ['Bilik keluarga', 'Bilik keluarga dengan dua katil, penyaman udara dan kipas.'], en: ['Family bedroom', 'A family bedroom with two beds, air conditioning and a fan.'] },
    { image: 'bilik-besar', ms: ['Bilik besar', 'Ruang tidur yang luas dengan beberapa katil untuk penginapan keluarga.'], en: ['Large bedroom', 'A spacious sleeping area with several beds for a family stay.'] },
    { image: 'bilik-dua-katil', ms: ['Bilik dengan dua katil', 'Dua katil berasingan, kipas siling dan rak pakaian di dalam bilik.'], en: ['Bedroom with two beds', 'Two separate beds, a ceiling fan and a clothes rack.'] },
    { image: 'bilik-kusyen-biru', ms: ['Bilik dengan kusyen biru', 'Katil bersebelahan dengan kusyen biru, penyaman udara dan kipas siling.'], en: ['Bedroom with blue cushions', 'Beds arranged side by side with blue cushions, air conditioning and a ceiling fan.'] }
  ],
  // The original trust section contained property highlights, not guest reviews.
  reviews: [],
  staySummary: [
    { key: 'privacy', ms: ['Privasi satu rumah', 'Privasi satu rumah dengan pilihan pakej 2 hingga 5 bilik dan kemudahan self check-in.'], en: ['Full-house privacy', 'Full-house privacy with a choice of 2 to 5-room packages and self check-in.'] },
    { key: 'times', ms: ['Waktu penginapan', 'Check-in {{checkInTime}}; check-out {{checkOutTime}}. Awal atau lewat: RM{{earlyLateFee}} sejam jika diluluskan.'], en: ['Arrival and departure', 'Check-in {{checkInTime}}; check-out {{checkOutTime}}. Early or late stays: RM{{earlyLateFee}} per hour if approved.'] },
    { key: 'deposit', ms: ['Deposit keselamatan', 'RM{{securityDeposit}} berasingan daripada sewaan, dipulangkan selepas check-out jika tiada kerosakan atau pelanggaran house rules.'], en: ['Security deposit', 'RM{{securityDeposit}}, separate from accommodation, returned after check-out if there is no damage or house-rule breach.'] },
    { key: 'payment', ms: ['Bayaran dan pengesahan', 'Selepas tarikh disahkan, maklumat bank/DuitNow diberi melalui WhatsApp. Hantar bukti bayaran untuk pengesahan tempahan.'], en: ['Payment and confirmation', 'After dates are confirmed, bank/DuitNow details are shared on WhatsApp. Send payment proof to confirm your booking.'] },
    { key: 'cancellation', ms: ['Pembatalan', 'Kurang {{cancellationNoticeDays}} hari sebelum check-in: deposit booking tidak dipulangkan. Pembatalan lebih awal: tukar tarikh tertakluk kepada ketersediaan.'], en: ['Cancellation', 'Less than {{cancellationNoticeDays}} days before check-in: the booking deposit is non-refundable. Earlier cancellation: date changes are subject to availability.'] }
  ],
  gallery: [
    { image: 'halaman', category: 'outside', ms: 'Hadapan rumah', en: 'House exterior' },
    { image: 'ruang-tamu', category: 'shared', ms: 'Ruang tamu', en: 'Living room' },
    { image: 'ruang-makan', category: 'shared', ms: 'Ruang makan', en: 'Dining area' },
    { image: 'bilik-besar', category: 'bedrooms', ms: 'Bilik besar', en: 'Large bedroom' },
    { image: 'bilik-keluarga', category: 'bedrooms', ms: 'Bilik keluarga', en: 'Family bedroom' },
    { image: 'bilik-tidur', category: 'bedrooms', ms: 'Bilik tidur utama', en: 'Main bedroom' },
    { image: 'bilik-dua-katil', category: 'bedrooms', ms: 'Bilik dengan dua katil', en: 'Bedroom with two beds' },
    { image: 'bilik-kusyen-biru', category: 'bedrooms', ms: 'Bilik dengan kusyen biru', en: 'Bedroom with blue cushions' },
    { image: 'dapur', category: 'shared', ms: 'Pantry dan dapur', en: 'Pantry and kitchen' },
    { image: 'parking', category: 'outside', ms: 'Kawasan parking', en: 'Parking area' },
    { image: 'porch-parking', category: 'outside', ms: 'Porch dan tempat duduk luar', en: 'Porch and outdoor seating' },
    // Owner-supplied amenity photos, September 2026. Portrait framing retains the full equipment.
    { image: 'mesin-basuh', category: 'amenities', portrait: true, ms: 'Mesin basuh', en: 'Washing machine', alt: { ms: 'Mesin basuh bukaan atas untuk kegunaan tetamu', en: 'Top-loading washing machine for guests' } },
    { image: 'penapis-air-air-fryer', category: 'amenities', portrait: true, ms: 'Penapis air dan air fryer', en: 'Water dispenser and air fryer', alt: { ms: 'Penapis air Coway dan air fryer di ruang pantry', en: 'Coway water dispenser and air fryer in the pantry' } },
    { image: 'peti-sejuk-microwave', category: 'amenities', portrait: true, ms: 'Peti sejuk dan microwave', en: 'Fridge and microwave', alt: { ms: 'Peti sejuk dengan microwave di atasnya', en: 'Fridge with a microwave above it' } },
    { image: 'tv-wifi', category: 'amenities', portrait: true, ms: 'TV dan WiFi', en: 'TV and WiFi', alt: { ms: 'TV pada dinding dan penghala WiFi di atas meja', en: 'Wall-mounted TV and WiFi router on a table' } },
    { image: 'seterika-papan', category: 'amenities', portrait: true, ms: 'Seterika dan papan seterika', en: 'Iron and ironing board', alt: { ms: 'Seterika di atas papan seterika untuk kegunaan tetamu', en: 'Iron resting on an ironing board for guests' } },
    { image: 'tv-peti-sejuk', category: 'amenities', portrait: true, ms: 'Sudut TV dan peti sejuk', en: 'TV and fridge area', alt: { ms: 'TV pada dinding, kabinet dan peti sejuk di ruang rumah', en: 'Wall-mounted TV, cabinet and fridge inside the house' } },
    { image: 'sudut-seterika', category: 'amenities', portrait: true, ms: 'Sudut menggosok pakaian', en: 'Ironing area', alt: { ms: 'Papan seterika dan seterika yang disimpan pada dinding', en: 'Ironing board and an iron stored in a wall holder' } },
    { image: 'pemanas-air', category: 'bathrooms', portrait: true, ms: 'Pancuran dan water heater', en: 'Shower and water heater', alt: { ms: 'Pemanas air dan kepala pancuran di bilik air', en: 'Water heater and shower head in the bathroom' } },
    { image: 'kotak-kunci', category: 'amenities', portrait: true, ms: 'Kotak kunci self check-in', en: 'Self check-in key box', alt: { ms: 'Kotak simpanan kunci untuk self check-in', en: 'Key storage box for self check-in' } },
    { image: 'bilik-air', category: 'bathrooms', portrait: true, ms: 'Bilik air', en: 'Bathroom', alt: { ms: 'Bilik air dengan tandas duduk, sinki dan cermin', en: 'Bathroom with a seated toilet, basin and mirror' } }
  ],
  facilities: [
    { icon: 'bed', photos: ['bilik-tidur'], ms: ['Keselesaan dan tidur tambahan', 'Bilik berhawa dingin dengan kipas setiap bilik. Tilam, bantal dan comforter tambahan disediakan untuk keluarga atau rombongan.'], en: ['Comfort and extra bedding', 'Air-conditioned bedrooms with fans in every room. Extra mattresses, pillows and comforters are provided for families and groups.'] },
    { icon: 'wifi', photos: ['tv-wifi', 'tv-peti-sejuk'], ms: ['WiFi percuma dan TV', 'WiFi percuma dan TV disediakan untuk kegunaan tetamu sepanjang penginapan.'], en: ['Free WiFi and TV', 'Free WiFi and TV are provided for guests throughout their stay.'] },
    { icon: 'bath', photos: ['bilik-air', 'pemanas-air'], ms: ['Bilik air dengan water heater', 'Pakej 2 bilik menggunakan 2 bilik air dengan water heater. Pakej 3 hingga 5 bilik menggunakan 3 bilik air dengan water heater.'], en: ['Bathrooms with water heaters', 'The 2-room package includes 2 bathrooms with water heaters. The 3 to 5-room packages include 3 bathrooms with water heaters.'] },
    { icon: 'kitchen', photos: ['dapur', 'peti-sejuk-microwave', 'penapis-air-air-fryer'], ms: ['Pantry dan peralatan dapur', 'Peti sejuk, microwave, air fryer dan penapis air Coway disediakan untuk penyediaan makanan dan minuman ringkas. Makan dan minum di ruang makan.'], en: ['Pantry and kitchen appliances', 'A fridge, microwave, air fryer and Coway water dispenser are provided for simple meals and drinks. Use the dining area for meals and drinks.'] },
    { icon: 'washer', photos: ['mesin-basuh'], ms: ['Mesin basuh', 'Mesin basuh disediakan untuk mencuci pakaian sepanjang penginapan.'], en: ['Washing machine', 'A washing machine is available for your laundry during the stay.'] },
    { icon: 'iron', photos: ['seterika-papan', 'sudut-seterika'], ms: ['Seterika dan papan seterika', 'Kemudahan menggosok pakaian disediakan untuk persiapan sebelum keluar atau menghadiri majlis.'], en: ['Iron and ironing board', 'Ironing facilities are available to help you get ready for outings or events.'] },
    { icon: 'car', photos: ['parking'], ms: ['Parking 3 hingga 4 kereta', 'Kawasan rumah biasanya muat 3 hingga 4 kereta. Untuk van atau bas, WhatsApp awal bagi pilihan parking yang sesuai.'], en: ['Parking for 3 to 4 cars', 'The house compound usually fits 3 to 4 cars. For vans or coaches, WhatsApp ahead for suitable parking options.'] },
    { icon: 'home', photos: ['ruang-tamu'], ms: ['Privasi satu rumah', 'Rumah Semi-D dua tingkat dengan privasi satu rumah, ruang tamu dan ruang makan untuk keluarga atau rombongan.'], en: ['Full-house privacy', 'A two-storey semi-detached house with full-house privacy, a living room and dining area for families or groups.'] },
    { icon: 'key', photos: ['kotak-kunci'], ms: ['Self check-in', 'Kotak simpanan kunci disediakan untuk kemudahan self check-in.'], en: ['Self check-in', 'A key storage box is provided for self check-in.'] }
  ],
  policies: [
    { key: 'confirmation', ms: ['Tempahan dan pengesahan', 'Semak tarikh, pakej dan jumlah tetamu melalui WhatsApp. Tempahan dianggap sah selepas tarikh disahkan dan bayaran deposit/booking diterima. Hantar bukti bayaran melalui WhatsApp untuk pengesahan tempahan. Website ini tidak menyimpan slot atau memproses bayaran.'], en: ['Bookings and confirmation', 'Check dates, room packages and guest count on WhatsApp. A booking is confirmed after the dates are confirmed and the required deposit/booking payment is received. Send payment proof on WhatsApp for booking confirmation. This website does not reserve dates or process payments.'] },
    { key: 'packages', ms: ['Pakej bilik dan privasi rumah', 'Pakej 2, 3, 4 atau 5 bilik tersedia dengan privasi satu rumah. Pakej 2 bilik termasuk 2 bilik air dengan water heater; pakej 3 hingga 5 bilik termasuk 3 bilik air dengan water heater. WiFi disediakan. Untuk penginapan 2 malam ke atas, semak kadar terbaik melalui WhatsApp.'], en: ['Room packages and house privacy', 'Choose 2, 3, 4 or 5-room packages with full-house privacy. The 2-room package includes 2 bathrooms with water heaters; the 3 to 5-room packages include 3 bathrooms with water heaters. WiFi is provided. For stays of 2 nights or more, ask about the best available rate on WhatsApp.'] },
    { key: 'payment', ms: ['Kaedah bayaran', 'Bayaran dibuat secara manual selepas tarikh disahkan. Pindahan bank, DuitNow QR dan tunai diterima. Maklumat bank/DuitNow diberi melalui WhatsApp; bukti bayaran perlu dihantar melalui WhatsApp untuk pengesahan booking.'], en: ['Payment methods', 'Payments are handled manually after dates are confirmed. Bank transfer, DuitNow QR and cash are accepted. Bank/DuitNow details are shared on WhatsApp; payment proof must be sent on WhatsApp to confirm the booking.'] },
    { key: 'deposit', ms: ['Deposit keselamatan', 'Deposit keselamatan RM{{securityDeposit}} adalah berasingan daripada kadar sewaan. Deposit dipulangkan selepas check-out jika tiada kerosakan atau pelanggaran house rules. Potongan boleh dibuat jika berlaku kerosakan atau ketidakpatuhan peraturan.'], en: ['Security deposit', 'The RM{{securityDeposit}} security deposit is separate from the accommodation rate. It is returned after check-out if there is no damage or house-rule breach. Deductions may be made for damage or non-compliance.'] },
    { key: 'cancellation', ms: ['Pembatalan dan tukar tarikh', 'Pembatalan kurang {{cancellationNoticeDays}} hari sebelum check-in: deposit booking tidak dipulangkan. Pembatalan lebih awal: pertukaran tarikh tertakluk kepada ketersediaan.'], en: ['Cancellation and date changes', 'Cancellation less than {{cancellationNoticeDays}} days before check-in: the booking deposit is non-refundable. Earlier cancellation: date changes are subject to availability.'] },
    { key: 'capacity', ms: ['Jumlah tetamu', 'Rumah sesuai untuk keluarga atau rombongan 6 hingga 10 orang, dengan tilam, bantal dan comforter tambahan disediakan. Had maksimum ialah {{maxGuests}} orang termasuk kanak-kanak. Caj tetamu tambahan ialah RM{{extraGuestFee}} seorang; had maksimum kekal {{maxGuests}} orang. Maklumkan jumlah sebenar tetamu semasa tempahan.'], en: ['Guest count', 'The house suits families or groups of 6 to 10 people, with extra mattresses, pillows and comforters provided. The maximum is {{maxGuests}} guests including children. Extra guests are charged RM{{extraGuestFee}} per person; the maximum remains {{maxGuests}} guests. Provide your full guest count when booking.'] },
    { key: 'times', ms: ['Waktu menginap', 'Check-in bermula {{checkInTime}} dan check-out sebelum {{checkOutTime}}. Check-in awal atau check-out lewat hanya dengan kelulusan owner, pada kadar RM{{earlyLateFee}} sejam.'], en: ['Arrival and departure', 'Check-in starts at {{checkInTime}} and check-out is before {{checkOutTime}}. Early check-in or late check-out requires the owner’s approval and costs RM{{earlyLateFee}} per hour.'] },
    { key: 'conduct', ms: ['Keselesaan bersama', 'Hormati jiran dan elakkan bunyi bising. Haiwan peliharaan tidak dibenarkan. Merokok hanya di kawasan yang disediakan di luar rumah. Makan dan minum di ruang makan, bukan dalam bilik tidur.'], en: ['A considerate stay', 'Respect the neighbours and keep noise down. Pets are not allowed. Smoking is only permitted in the area provided outside. Use the dining area for food and drinks, rather than the bedrooms.'] },
    { key: 'events', ms: ['Majlis dan rombongan', 'Reunion, hari jadi, aqiqah, pertunangan, akad nikah, perkahwinan atau acara lain mesti mendapat izin semasa booking kerana caj berbeza. Untuk van atau bas, WhatsApp awal bagi pilihan parking yang sesuai.'], en: ['Events and groups', 'Reunions, birthdays, aqiqah, engagements, solemnizations, weddings and other events need approval during booking because charges differ. For vans or coaches, WhatsApp ahead for suitable parking options.'] },
    { key: 'checkout', ms: ['Sebelum pulang', 'Kembalikan kedudukan katil, perabot dan peralatan seperti semasa check-in. Tutup semua punca elektrik kecuali modem WiFi, buang sampah ke tong hijau, letakkan tuala yang digunakan dalam bakul dan pulangkan kunci ke security box. Selepas memasukkan kunci, putar nombor pada kotak kepada 0000.'], en: ['Before leaving', 'Return beds, furniture and equipment to their check-in positions. Switch off all electrical points except the WiFi modem, put rubbish in the green bin, place used towels in the basket and return the key to the security box. After returning the key, turn the box dials to 0000.'] }
  ],
  faqTopics: [
    {key:'house',ms:'Rumah & kemudahan',en:'House & amenities'},
    {key:'booking',ms:'Harga & tempahan',en:'Rates & booking'},
    {key:'arrival',ms:'Ketibaan & peraturan',en:'Arrival & rules'}
  ],
  faq: [
    { key: 'packages', topic: 'house', policy: 'packages', ms: ['Boleh sewa ikut bilangan bilik?'], en: ['Can we book by room count?'] },
    { key: 'capacity', topic: 'house', policy: 'capacity', ms: ['Berapa orang boleh menginap?'], en: ['How many guests can stay?'] },
    { key: 'deposit', topic: 'booking', policy: 'deposit', ms: ['Adakah deposit diperlukan?'], en: ['Is a deposit required?'] },
    { key: 'cancellation', topic: 'booking', policy: 'cancellation', ms: ['Bagaimana polisi pembatalan dan tukar tarikh?'], en: ['What are the cancellation and date-change terms?'] },
    { key: 'parking', topic: 'house', ms: ['Berapa banyak parking tersedia?', 'Kawasan rumah biasanya muat 3 hingga 4 kereta. Untuk van atau bas, WhatsApp awal untuk nasihat pilihan parking yang sesuai.'], en: ['How much parking is available?', 'The house compound usually fits 3 to 4 cars. For vans or coaches, WhatsApp ahead for advice on suitable parking options.'] },
    { key: 'kitchen', topic: 'house', ms: ['Boleh masak?', 'Ya, pantry dengan peti sejuk, microwave, air fryer dan penapis air Coway disediakan untuk penyediaan makanan dan minuman ringkas. Makan dan minum di ruang makan, bukan dalam bilik tidur. Bawa bahan makanan anda sendiri jika mahu masak.'], en: ['Can we cook?', 'Yes, the pantry has a fridge, microwave, air fryer and Coway water dispenser for simple meals and drinks. Eat and drink in the dining area, rather than the bedrooms. Bring your own groceries if you plan to cook.'] },
    { key: 'bedding', topic: 'house', ms: ['Apa yang disediakan untuk tidur?', 'Tilam, bantal dan comforter tambahan disediakan. Letakkan tuala yang telah digunakan dalam bakul ketika check-out. Bawa barangan mandi peribadi anda.'], en: ['What bedding is provided?', 'Extra mattresses, pillows and comforters are provided. Place used towels in the basket at check-out. Bring your personal toiletries.'] },
    { key: 'wifi-tv', topic: 'house', ms: ['Ada WiFi dan TV?', 'Ya, WiFi percuma dan TV disediakan untuk tetamu.'], en: ['Are WiFi and TV available?', 'Yes, free WiFi and TV are provided for guests.'] },
    { key: 'bathrooms', topic: 'house', ms: ['Ada water heater?', 'Ya. Pakej 2 bilik menggunakan 2 bilik air dengan water heater. Pakej 3 hingga 5 bilik menggunakan 3 bilik air dengan water heater.'], en: ['Are water heaters available?', 'Yes. The 2-room package includes 2 bathrooms with water heaters. The 3 to 5-room packages include 3 bathrooms with water heaters.'] },
    { key: 'payment', topic: 'booking', policy: 'payment', ms: ['Bagaimana cara bayaran?'], en: ['How does payment work?'] },
    { key: 'times', topic: 'arrival', policy: 'times', ms: ['Pukul berapa check-in dan check-out?'], en: ['What time are check-in and check-out?'] },
    { key: 'events', topic: 'arrival', policy: 'events', ms: ['Boleh buat majlis atau acara?'], en: ['Can we host a gathering or event?'] },
    { key: 'pets', topic: 'arrival', ms: ['Boleh bawa haiwan peliharaan?', 'Tidak. Haiwan peliharaan tidak dibenarkan masuk ke dalam homestay.'], en: ['Are pets allowed?', 'No. Pets are not allowed inside the homestay.'] },
    { key: 'last-minute', topic: 'booking', ms: ['Boleh booking last minute?', 'WhatsApp untuk semak tarikh terdekat. Jika masih tersedia, maklumat bayaran dan arahan seterusnya akan diberikan.'], en: ['Can we book last minute?', 'WhatsApp to check the nearest available dates. If they are available, payment details and next steps will be shared.'] },
    { key: 'checkout', topic: 'arrival', policy: 'checkout', ms: ['Apa perlu dibuat semasa check-out?'], en: ['What should we do at check-out?'] }
  ],
  nearby: [
    { ms: ['Berhampiran', 'Hospital Jitra', 'Di sebelah pagar sisi Hospital Jitra, sesuai untuk urusan hospital dan lawatan keluarga.'], en: ['Nearby', 'Jitra Hospital', 'Beside the side fence of Jitra Hospital, convenient for hospital visits and accompanying family.'] },
    { ms: ['Bandar & kemudahan', 'Bandar Jitra dan kemudahan utama', 'Pusat Giat Mara, Dewan Jitra, Masjid Sharifah Fatimah, IKBN Jitra, MRSM Kubang Pasu, Dewan Tunku Anum, Dewan Wawasan, MPKP, IPD Kubang Pasu, Hotel Bustani, Lotus Jitra dan Bandar Jitra.'], en: ['Town & amenities', 'Jitra town and key amenities', 'Pusat Giat Mara, Dewan Jitra, Masjid Sharifah Fatimah, IKBN Jitra, MRSM Kubang Pasu, Dewan Tunku Anum, Dewan Wawasan, MPKP, Kubang Pasu Police HQ, Hotel Bustani, Lotus Jitra and Jitra town.'] },
    { ms: ['Pendidikan & institusi', 'Institusi dan kawasan Darulaman', 'Bandar Darulaman, ILP Jitra, POLIMAS, IPG Darulaman, IAB Cawangan Utara, C-Mart BDI, Yawata, Masjid Muttaqin, Hotel Darulaman, Kem Kelubi, Kem Askar Melayu dan SMSAH/Jenan.'], en: ['Education & institutions', 'Institutions and the Darulaman area', 'Bandar Darulaman, ILP Jitra, POLIMAS, IPG Darulaman, Northern Branch IAB, C-Mart BDI, Yawata, Masjid Muttaqin, Hotel Darulaman, Kem Kelubi, Malay Army Camp and SMSAH/Jenan.'] },
    { ms: ['Rekreasi & penginapan', 'Rekreasi dan penginapan sekitar', 'Masjid Al Muhsinin, Tasik Darulaman, Hotel Regency, Darulaman Golf Club dan Darulaman Fantasia Aquapark.'], en: ['Recreation & stays', 'Recreation and nearby hotels', 'Masjid Al Muhsinin, Tasik Darulaman, Hotel Regency, Darulaman Golf Club and Darulaman Fantasia Aquapark.'] },
    { ms: ['Pengangkutan & bandar', 'Airport dan Alor Setar', 'Masjid As Syabab Kepala Batas, Kolej Tentera Udara, Airport Kepala Batas, Bandar Anak Bukit, Istana Anak Bukit, Masjid Zahir dan Bandar Alor Setar.'], en: ['Transport & towns', 'Airport and Alor Setar', 'Masjid As Syabab Kepala Batas, Air Force College, Kepala Batas Airport, Anak Bukit town, Anak Bukit Palace, Zahir Mosque and Alor Setar town.'] },
    { ms: ['Kedah Utara & Perlis', 'Changlun, UUM, Arau dan Bukit Kayu Hitam', 'Pekan Changlun, Matrikulasi Kubang Pasu Changlun, UniMAP, UUM, Kolej Pertanian, MARDI, ABM, EDC-UUM Hotel, SBPI Bukit Kayu Hitam, Bandar Bukit Kayu Hitam, PoliPauh, Matrikulasi Arau dan UiTM Arau.'], en: ['Northern Kedah & Perlis', 'Changlun, UUM, Arau and Bukit Kayu Hitam', 'Changlun town, Kubang Pasu Matriculation College Changlun, UniMAP, UUM, Agriculture College, MARDI, ABM, EDC-UUM Hotel, SBPI Bukit Kayu Hitam, Bukit Kayu Hitam town, PoliPauh, Arau Matriculation College and UiTM Arau.'] }
  ],
  guides: [
    { slug: 'homestay-dekat-hospital-jitra', ms: ['Menginap dekat Hospital Jitra', 'Penginapan untuk urusan hospital', 'Jitra2Stay terletak di Taman Jitra Indah, di sebelah pagar sisi Hospital Jitra. Rumah Semi-D dua tingkat ini menyediakan ruang untuk keluarga berehat ketika urusan hospital.', 'Pilih pakej 2 hingga 5 bilik dengan privasi satu rumah, WiFi percuma dan pantry. Parking di kawasan rumah biasanya muat 3 hingga 4 kereta. Gunakan pin rumah untuk merancang laluan ke pintu masuk hospital yang diperlukan.'], en: ['Stay near Jitra Hospital', 'A base for hospital visits', 'Jitra2Stay is in Taman Jitra Indah, beside the side fence of Jitra Hospital. This two-storey semi-detached house gives families room to rest during hospital visits.', 'Choose 2 to 5-room packages with full-house privacy, free WiFi and a pantry. Parking in the compound usually fits 3 to 4 cars. Use the house pin to plan your route to the hospital entrance you need.'] },
    { slug: 'homestay-keluarga-besar-jitra', ms: ['Homestay keluarga besar di Jitra', 'Ruang untuk berkumpul', 'Rumah Semi-D dua tingkat dengan lima bilik tidur, tiga bilik air dan privasi satu rumah untuk keluarga atau rombongan.', 'Bilik berhawa dingin, kipas setiap bilik, tilam tambahan, bantal dan comforter disediakan. Penginapan sesuai untuk rombongan 6 hingga 10 orang dengan had maksimum 20 orang termasuk kanak-kanak. Pilih pakej 2, 3, 4 atau 5 bilik mengikut jumlah tetamu dan bajet.'], en: ['A Jitra homestay for larger families', 'Space to gather', 'A two-storey semi-detached house with five bedrooms, three bathrooms and full-house privacy for families or groups.', 'Air-conditioned bedrooms, fans in every room, extra mattresses, pillows and comforters are provided. The house suits groups of 6 to 10 people, with a maximum of 20 including children. Choose 2, 3, 4 or 5-room packages to suit your guest count and budget.'] },
    { slug: 'homestay-konvokesyen-uum-jitra', ms: ['Penginapan untuk konvokesyen UUM', 'Bermalam di Jitra untuk urusan kampus', 'Jitra2Stay menyediakan penginapan untuk keluarga dan rombongan yang datang bagi konvokesyen atau urusan institusi sekitar Kedah Utara.', 'Pakej 2 hingga 5 bilik membolehkan keluarga memilih mengikut jumlah tetamu. Anggaran pemanduan dari homestay: UUM {{route:uum}} dan Pekan Changlun {{route:changlun}}. Rancang masa tambahan untuk trafik konvokesyen.'], en: ['Accommodation for UUM convocation', 'Stay in Jitra for your campus visit', 'Jitra2Stay provides accommodation for families and groups attending convocation or visiting institutions around northern Kedah.', 'Packages from 2 to 5 rooms let families choose for their guest count. Estimated drives from the homestay: UUM {{route:uum}} and Changlun town {{route:changlun}}. Allow extra time for convocation traffic.'] },
    { slug: 'tempat-menarik-sekitar-jitra', journeyStops: [
      { id: 'bandar-jitra', ms: 'Bandar Jitra', en: 'Jitra town' },
      { id: 'polimas', ms: 'POLIMAS', en: 'POLIMAS' },
      { id: 'ipg-darulaman', ms: 'IPG Darulaman', en: 'IPG Darulaman' },
      { id: 'tasik-darulaman', ms: 'Tasik Darulaman', en: 'Tasik Darulaman' },
      { id: 'airport', ms: 'Lapangan Terbang Sultan Abdul Halim', en: 'Sultan Abdul Halim Airport' },
      { id: 'bandar-alor-setar', ms: 'Bandar Alor Setar', en: 'Alor Setar town' },
      { id: 'changlun', ms: 'Pekan Changlun', en: 'Changlun town' },
      { id: 'uum', ms: 'UUM', en: 'UUM' },
      { id: 'bukit-kayu-hitam', ms: 'Bukit Kayu Hitam', en: 'Bukit Kayu Hitam' },
      { id: 'uitm-arau', ms: 'UiTM Arau', en: 'UiTM Arau' }
    ], ms: ['Di sekitar Jitra', 'Rancang perjalanan anda', 'Hospital Jitra berada di sebelah kawasan homestay. Bandar Jitra, institusi pendidikan, Tasik Darulaman, Airport Kepala Batas dan destinasi Kedah Utara boleh dirancang dari sini.', 'Anggaran pemanduan dari homestay ke destinasi berikut. Pilih destinasi untuk membuka laluan Google Maps.'], en: ['Around Jitra', 'Plan your visit', 'Jitra Hospital is beside the homestay area. Jitra town, educational institutions, Tasik Darulaman, Kepala Batas Airport and northern Kedah destinations can be reached from here.', 'Estimated drives from the homestay to the destinations below. Select a destination to open its Google Maps route.'] }
  ]
};
