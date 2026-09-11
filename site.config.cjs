// Business facts and policy copy are shared by every generated page.
// Unconfirmed owner details are deliberately stated as questions to confirm.
module.exports = {
  business: {
    name: 'Jitra2Stay',
    siteUrl: 'https://jitra2stay.vercel.app',
    phone: '60194410666',
    phoneDisplay: '+60 19-441 0666',
    email: 'jitra2stay@gmail.com',
    address: { street: '49, Taman Jitra Indah, Jalan Hospital Daerah', city: 'Jitra', region: 'Kedah', postalCode: '06000', country: 'MY' },
    mapUrl: 'https://goo.gl/maps/pjnMbwm5Pk2QqPeP8',
    bedrooms: 5, bathrooms: 3, maxGuests: 20,
    securityDeposit: 100, earlyLateFee: 20,
    checkInTime: '15:00', checkOutTime: '12:00'
  },
  rates: [
    { rooms: 2, bathrooms: 2, price: 180 },
    { rooms: 3, bathrooms: 3, price: 230 },
    { rooms: 4, bathrooms: 3, price: 280 },
    { rooms: 5, bathrooms: 3, price: 330 }
  ],
  gallery: [
    { image: 'halaman', ms: 'Hadapan rumah', en: 'House exterior' },
    { image: 'ruang-tamu', ms: 'Ruang tamu', en: 'Living room' },
    { image: 'ruang-makan', ms: 'Ruang makan', en: 'Dining area' },
    { image: 'bilik-besar', ms: 'Bilik yang luas', en: 'Spacious bedroom' },
    { image: 'bilik-keluarga', ms: 'Bilik keluarga', en: 'Family bedroom' },
    { image: 'bilik-tidur', ms: 'Ruang bilik tidur', en: 'Bedroom interior' },
    { image: 'bilik-dua-katil', ms: 'Bilik dengan dua katil', en: 'Bedroom with two beds' },
    { image: 'bilik-kusyen-biru', ms: 'Bilik dengan kusyen biru', en: 'Bedroom with blue cushions' },
    { image: 'dapur', ms: 'Pantry dan dapur', en: 'Pantry and kitchen' },
    { image: 'parking', ms: 'Kawasan parking', en: 'Parking area' },
    { image: 'porch-parking', ms: 'Porch dan tempat duduk luar', en: 'Porch and outdoor seating' }
  ],
  facilities: [
    { icon: 'bed', ms: ['Ruang untuk berehat', 'Bilik berhawa dingin mengikut pakej, kipas serta tilam, bantal dan comforter tambahan.'], en: ['Room to rest', 'Air-conditioned bedrooms for your package, fans, and extra mattresses, pillows and comforters.'] },
    { icon: 'wifi', ms: ['WiFi', 'Sambungan WiFi disediakan untuk kegunaan tetamu.'], en: ['WiFi', 'WiFi is provided for guests during their stay.'] },
    { icon: 'bath', ms: ['Bilik air', 'Water heater disediakan. Akses bilik air mengikut pakej yang dipilih.'], en: ['Bathrooms', 'Water heaters are provided. Bathroom access follows the selected package.'] },
    { icon: 'kitchen', ms: ['Pantry dan ruang makan', 'Ruang untuk menyediakan makanan ringkas dan makan bersama. Sahkan kelengkapan khusus dengan owner.'], en: ['Pantry and dining', 'Space for simple food preparation and shared meals. Check specific kitchen equipment with the owner.'] },
    { icon: 'car', ms: ['Parking di rumah', 'Kawasan parking tersedia. Maklumkan jumlah kereta atau keperluan van/bas sebelum menginap.'], en: ['On-site parking', 'Parking space is available. Share your vehicle count or van/coach needs before your stay.'] },
    { icon: 'home', ms: ['Rumah dua tingkat', 'Ruang bersama untuk keluarga dan rombongan. Tanya susunan bilik jika membawa warga emas atau tetamu yang sukar menaiki tangga.'], en: ['A two-storey home', 'Shared spaces for families and groups. Ask about room arrangements for older guests or anyone who finds stairs difficult.'] }
  ],
  policies: [
    { key: 'confirmation', ms: ['Pertanyaan dan pengesahan', 'Semak tarikh, pakej dan jumlah tetamu dengan owner melalui WhatsApp. Tempahan hanya disahkan oleh owner selepas persetujuan harga dan bayaran yang diperlukan; website ini tidak menyimpan slot.'], en: ['Enquiries and confirmation', 'Ask the owner about dates, room packages and guest count on WhatsApp. Only the owner confirms a booking after the price and required payment are agreed; this website does not reserve dates.'] },
    { key: 'deposit', ms: ['Deposit keselamatan', 'Deposit keselamatan RM{{securityDeposit}} adalah berasingan daripada kadar sewaan. Deposit dipulangkan selepas check-out jika tiada kerosakan atau pelanggaran peraturan. Sahkan jumlah bayaran untuk mengunci tempahan dan masa pemulangan deposit dengan owner sebelum membayar.'], en: ['Security deposit', 'The RM{{securityDeposit}} security deposit is separate from the accommodation rate. It is returned after check-out if there is no damage or breach of house rules. Confirm the payment needed to secure a booking and the deposit return timing with the owner before paying.'] },
    { key: 'cancellation', ms: ['Pembatalan dan tukar tarikh', 'Minta owner mengesahkan syarat pembatalan, refund dan pertukaran tarikh melalui WhatsApp sebelum membuat bayaran. Syarat yang dipersetujui untuk tempahan anda perlu dinyatakan dalam pengesahan owner.'], en: ['Cancellation and date changes', 'Ask the owner to confirm cancellation, refund and date-change terms on WhatsApp before paying. The terms agreed for your booking should be included in the owner’s confirmation.'] },
    { key: 'capacity', ms: ['Jumlah tetamu', 'Had maksimum ialah {{maxGuests}} orang termasuk kanak-kanak. Kesesuaian pakej bergantung pada susunan bilik dan keperluan tidur. Maklumkan jumlah sebenar tetamu; sebarang caj tambahan perlu disahkan sebelum bayaran.'], en: ['Guest count', 'The maximum is {{maxGuests}} guests including children. Package suitability depends on the room layout and sleeping arrangements. Share your full guest count; any additional charges must be confirmed before payment.'] },
    { key: 'times', ms: ['Waktu menginap', 'Check-in bermula {{checkInTime}} dan check-out sebelum {{checkOutTime}}. Check-in awal atau check-out lewat hanya dengan kelulusan owner, pada kadar RM{{earlyLateFee}} sejam.'], en: ['Arrival and departure', 'Check-in starts at {{checkInTime}} and check-out is before {{checkOutTime}}. Early check-in or late check-out requires the owner’s approval and costs RM{{earlyLateFee}} per hour.'] },
    { key: 'conduct', ms: ['Keselesaan bersama', 'Hormati jiran dan elakkan bunyi bising. Haiwan peliharaan tidak dibenarkan. Merokok hanya di luar rumah. Makan dan minum di ruang makan, bukan dalam bilik tidur.'], en: ['A considerate stay', 'Respect the neighbours and keep noise down. Pets are not allowed. Smoking is only permitted outside. Use the dining area for food and drinks, rather than the bedrooms.'] },
    { key: 'events', ms: ['Majlis dan rombongan', 'Majlis atau acara memerlukan kebenaran owner semasa membuat pertanyaan. Jenis acara, jumlah tetamu, parking dan sebarang caj perlu dipersetujui terlebih dahulu.'], en: ['Events and groups', 'Events need the owner’s permission when you enquire. Agree on the event type, guest count, parking and any additional charges in advance.'] },
    { key: 'checkout', ms: ['Sebelum pulang', 'Tutup peralatan elektrik kecuali modem WiFi, buang sampah ke tong yang disediakan, letakkan tuala yang digunakan dalam bakul dan pulangkan kunci mengikut arahan owner.'], en: ['Before leaving', 'Switch off electrical appliances except the WiFi modem, use the designated rubbish bin, place used towels in the basket and return the keys following the owner’s instructions.'] }
  ],
  guides: [
    { slug: 'homestay-dekat-hospital-jitra', ms: ['Menginap dekat Hospital Jitra', 'Penginapan untuk urusan hospital', 'Jitra2Stay terletak di Taman Jitra Indah, di sebelah pagar sisi Hospital Jitra. Rumah boleh menjadi tempat keluarga berehat ketika urusan hospital.', 'Sahkan pintu masuk hospital yang hendak digunakan dan rancang perjalanan dari pin rumah. Tanya owner tentang susunan bilik jika ada tetamu yang sukar menaiki tangga.'], en: ['Stay near Jitra Hospital', 'A base for hospital visits', 'Jitra2Stay is in Taman Jitra Indah, beside the side fence of Jitra Hospital. The house offers space for families to rest around hospital visits.', 'Check which hospital entrance you need and plan your route from the house pin. Ask the owner about room arrangements if anyone has difficulty using stairs.'] },
    { slug: 'homestay-keluarga-besar-jitra', ms: ['Homestay keluarga besar di Jitra', 'Ruang untuk berkumpul', 'Rumah Semi-D dua tingkat dengan lima bilik tidur, tiga bilik air dan ruang bersama untuk keluarga atau rombongan.', 'Beritahu owner jumlah dewasa, kanak-kanak dan keperluan tidur sebelum memilih pakej. Had maksimum tidak semestinya sama dengan bilangan tempat tidur tetap.'], en: ['A Jitra homestay for larger families', 'Space to gather', 'A two-storey semi-detached house with five bedrooms, three bathrooms and shared spaces for families or groups.', 'Tell the owner how many adults and children are coming and discuss sleeping arrangements before choosing a package. Maximum guest count is not the same as the number of fixed beds.'] },
    { slug: 'homestay-konvokesyen-uum-jitra', ms: ['Penginapan untuk konvokesyen UUM', 'Bermalam di Jitra untuk urusan kampus', 'Keluarga yang menghadiri konvokesyen boleh memilih Jitra sebagai tempat menginap bersama. UUM berada di Sintok; rumah ini bukan penginapan dalam kampus.', 'Semak laluan dan masa perjalanan semasa ke dewan atau pintu kampus yang betul. Beri ruang masa untuk trafik konvokesyen, dan sahkan kadar serta tarikh dengan owner.'], en: ['Accommodation for UUM convocation', 'Stay in Jitra for your campus visit', 'Families attending convocation can choose Jitra as a shared base. UUM is in Sintok; this house is not on campus.', 'Check the current route and travel time to the correct hall or campus entrance. Allow for convocation traffic and confirm dates and rates with the owner.'] },
    { slug: 'tempat-menarik-sekitar-jitra', ms: ['Di sekitar Jitra', 'Rancang perjalanan anda', 'Hospital Jitra dan kemudahan bandar berada di sekitar kawasan penginapan. Tasik Darulaman, institusi pendidikan dan destinasi di Kedah Utara boleh dirancang mengikut urusan anda.', 'Gunakan Google Maps untuk laluan dan anggaran perjalanan semasa. Tanya owner tentang akses rumah dan parking; masa perjalanan bergantung pada destinasi, trafik dan keadaan semasa.'], en: ['Around Jitra', 'Plan your visit', 'Jitra Hospital and town amenities are around the accommodation area. You can plan visits to Tasik Darulaman, educational institutions and northern Kedah destinations around your trip.', 'Use Google Maps for current routes and travel estimates. Ask the owner about access and parking; journey times depend on your destination, traffic and current conditions.'] }
  ]
};
