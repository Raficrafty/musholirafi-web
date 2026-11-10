/* =========================================================
   ISI WEBSITE musholirafi.com (v3)
   Semua produk, harga, diskon, edisi musim, kelas bimbel, kontak, dan FAQ diubah di sini.
   Baris bertanda GANTI wajib diisi sebelum website dipromosikan.
   Baris bertanda CEK sudah diisi, tapi tolong pastikan benar.
   soon: true   = tampil dengan label "Coming soon" dan belum bisa dibeli.
   ========================================================= */
window.SITE = {
  draft: false,                        // true = tampilkan bilah draf dan pemilih pratinjau edisi musim
  maintenance: false,                  // true = semua pengunjung diarahkan ke maintenance.html (kecuali alamat berisi ?pratinjau)
  name: "Musholi Rafi",
  fullName: "Musholi Rafi Nurtova",
  nickname: "Rafi",
  domain: "musholirafi.my.id",
  url: "https://musholirafi.my.id/",
  updated: "November 2026",
  photo: "",                           // opsional: misal "assets/img/foto.webp". Kosong = pakai maskot.
  newsletterName: "Catatan Rafi",      // CEK: nama newsletter Substack-mu
  newsletterEndpoint: "https://script.google.com/macros/s/AKfycbxMSJc7ZSF7Or9yhMyJd5I2m-iEw970U67OPrcrPPqimjjFoH-87Cfs_ymJFy3kxZwO9Q/exec",
     orderEndpoint: "TEMPEL_URL_EXEC_DARI_SHEET_PESANAN",
     promoCodes: [ { code: "PELANGGAN10", percent: 10, from: "2026-11-09", until: "2026-12-07" } ],
   
  links: {
    substack: "https://musholirafi.substack.com",
    linkedin: "https://www.linkedin.com/in/musholirafi/",
    lynk: "https://lynk.id/catatankuliah.di",
    discordInvite: ""                  // GANTI: tautan undangan server, misal https://discord.gg/xxxx
  },

  contact: {
    whatsapp: "6287822111250",         // GANTI: format 628xxxxxxxxxx, tanpa + dan tanpa spasi
    email: "musholirafinurtova@gmail.com",   // GANTI: misal halo@musholirafi.com
    discordHandle: "raficrafty_42387", // GANTI: username Discord-mu
    hours: "08.00-21.00 WIB"
  },

  /* Gambaran server Discord di bagian Bimbel */
  discord: {
    server: "Ruang Belajar Rafi",
    text: ["pengumuman", "kelas-bareng", "kelas-kamu"],
    voice: "kelas-privat"
  },

  payment: {
    qrisImage: "assets/img/qris.jpg",   // GANTI: misal "assets/img/qris.png"
    merchantName: "MUSHOLI RAFI NURTOVA",   // GANTI: nama merchant yang tertera di QRIS
    uniqueCode: true                   // tambah 1 sampai 199 rupiah supaya pembayaran gampang dicocokkan
  },

  /* icon: linkedin | substack | lynk | instagram | tiktok | youtube | discord | x | facebook */
  socials: [
    { label: "LinkedIn",  handle: "musholirafi", url: "https://www.linkedin.com/in/musholirafi/", icon: "linkedin" },
    { label: "Substack",  handle: "musholirafi.substack.com", url: "https://musholirafi.substack.com", icon: "substack" },
    { label: "Lynk",      handle: "catatankuliah.di", url: "https://lynk.id/catatankuliah.di", icon: "lynk" },
    { label: "Instagram", handle: "@musholirafi", url: "", icon: "instagram" },     // GANTI url (kosong = tidak tampil)
    { label: "TikTok",    handle: "@musholirafi", url: "", icon: "tiktok" },        // GANTI url
    { label: "YouTube",   handle: "Musholi Rafi", url: "", icon: "youtube" },       // GANTI url
    { label: "Discord",   handle: "Ruang Belajar Rafi", url: "", icon: "discord" }  // GANTI url (boleh sama dengan links.discordInvite)
  ],

  /* ---------------------------------------------------------
     EDISI MUSIM DAN EVENT
     season: "auto" memilih musim dari bulan (hujan atau kemarau),
     lalu event di daftar events menimpanya selama tanggalnya aktif.
     Setiap edisi boleh punya: freebie (id produk gratis), event, diskon,
     dan chat (obrolan contoh di gambaran Discord, berganti tiap edisi).
     Format chat: [nama, jam, isi]. Nama "Rafi" tampil sebagai kamu.
     --------------------------------------------------------- */
  season: "auto",
  seasons: {
    hujan: {
      label: "Edisi Musim Hujan", months: [11, 12, 1, 2, 3],
      title: "Hujan di luar, tugas studio jalan terus",
      desc: "Selama musim hujan, Checklist Asistensi bisa kamu ambil gratis. Ada juga kelas bareng tiap Sabtu malam di Discord dan diskon untuk modul.",
      freebie: "gratis-checklist-asistensi",
      event: { title: "Kelas bareng gratis di Discord", when: "Setiap Sabtu, 19.00 sampai 20.00 WIB" },
      discount: { percent: 20, until: "2026-11-30", cats: ["modul"] },   // CEK
      chat: [
        ["Kamu", "19.02", "Kak, model SketchUp tugas residensialku berat banget. Laptopku sampai nge-lag."],
        ["Rafi", "19.03", "Biasanya karena komponen dan material yang sudah tidak dipakai masih tersimpan. Coba buka Window, Model Info, Statistics, lalu Purge Unused."],
        ["Rafi", "19.04", "Masuk voice yuk. Kita cek tag dan komponennya bareng sambil share screen."]
      ]
    },
    kemarau: {
      label: "Edisi Musim Kemarau", months: [4, 5, 6, 7, 8, 9, 10],
      title: "Musim kemarau, musim mengejar target",
      desc: "Lembar Tujuan 3 Bulan gratis untuk menyambut semester baru, plus tanya jawab software tiap Sabtu malam di Discord.",
      freebie: "gratis-tujuan-3-bulan",
      event: { title: "Tanya jawab SketchUp dan AutoCAD", when: "Setiap Sabtu, 19.00 sampai 20.00 WIB" },
      discount: { percent: 15, until: "2027-08-31", cats: ["modul", "buku"] },   // CEK
      chat: [
        ["Kamu", "19.02", "Tugas numpuk semua minggu ini. Aku bingung mulai dari mana."],
        ["Rafi", "19.03", "Tulis semua tugas di satu daftar dulu. Pilih satu yang tenggatnya paling dekat, lalu kerjakan 25 menit tanpa HP."],
        ["Rafi", "19.04", "Habis itu kita susun jadwal mingguanmu bareng di voice, biar kepala nggak penuh."]
      ]
    },
    gugur: {
      label: "Edisi Musim Gugur",
      title: "Saatnya merapikan catatan satu semester",
      desc: "Gugurkan kebiasaan lama, simpan yang berguna. Lembar Tujuan 3 Bulan gratis untuk merencanakan semester berikutnya.",
      freebie: "gratis-tujuan-3-bulan",
      event: { title: "Review semester bareng di Discord", when: "Sabtu, 19.00 sampai 20.00 WIB" },
      chat: [
        ["Kamu", "19.02", "IPK-ku turun semester ini. Rasanya kuliahku gagal."],
        ["Rafi", "19.03", "IPK itu penting, tapi kuliah bukan cuma soal IPK. Kita lihat dulu apa yang sudah berhasil dan apa yang mau diubah."],
        ["Rafi", "19.04", "Bawa jadwal semester lalu ke voice. Kita review pelan-pelan, bukan untuk menyalahkan diri."]
      ]
    },
    salju: {
      label: "Edisi Akhir Tahun",
      title: "Edisi akhir tahun, belajar sambil santai",
      desc: "Liburan boleh, tapi otak tetap hangat. Ada tantangan membaca 10 halaman sehari bareng di Discord.",
      freebie: "gratis-tujuan-3-bulan",
      event: { title: "Tantangan membaca 14 hari", when: "Mulai 20 Desember, cek-in tiap Sabtu 19.00 WIB" },
      discount: { percent: 25, until: "2026-12-31", cats: ["buku", "modul"] },   // CEK
      chat: [
        ["Kamu", "19.02", "Aku pengen mulai baca buku, tapi selalu berhenti di halaman 5."],
        ["Rafi", "19.03", "Mulai dari 10 halaman sehari saja. Baca sebelum buka media sosial, lalu tulis satu kalimat yang paling kamu ingat."],
        ["Rafi", "19.04", "Ikut tantangan membaca 14 hari bareng di sini yuk, biar ada teman."]
      ]
    },
    ramadan: {
      label: "Edisi Ramadan",
      title: "Ramadan produktif tanpa begadang",
      desc: "Jadwal belajar yang menyesuaikan sahur dan tarawih. Kelas bareng pindah ke jam setelah tarawih.",
      freebie: "gratis-tujuan-3-bulan",
      event: { title: "Kelas bareng setelah tarawih", when: "Setiap Sabtu, 20.30 sampai 21.30 WIB" },   // CEK jam
      discount: { percent: 30, until: "2027-03-09", cats: ["modul", "buku"] },   // CEK
      chat: [
        ["Kamu", "20.31", "Ramadan gini, tugas studio sama tarawih bentrok terus."],
        ["Rafi", "20.32", "Pindahkan tugas berat ke pagi setelah sahur, saat kepala masih segar. Malam cukup untuk tugas ringan."],
        ["Rafi", "20.33", "Kita atur blok waktunya bareng di Google Calendar ya."]
      ]
    },
    idulfitri: {
      label: "Edisi Idul Fitri",
      title: "Selamat Idul Fitri, mohon maaf lahir dan batin",
      desc: "Hadiah lebaran untuk teman-teman desain. Satu lembar kerja gratis dan diskon untuk semua buku.",
      freebie: "gratis-checklist-asistensi",
      discount: { percent: 25, until: "2027-03-20", cats: ["buku"] },
      chat: [
        ["Kamu", "19.02", "Libur lebaran, tapi aku nggak mau lupa materi kuliah."],
        ["Rafi", "19.03", "Cukup ulang 15 menit sehari. Tutup catatan, coba ingat, baru cek lagi."],
        ["Rafi", "19.04", "Selebihnya nikmati liburan. Istirahat juga bagian dari belajar."]
      ]
    },
    iduladha: {
      label: "Edisi Idul Adha",
      title: "Berbagi ilmu di Idul Adha",
      desc: "Semangat berbagi. Kelas gratis di Discord untuk mahasiswa baru Desain Interior.",
      freebie: "gratis-checklist-asistensi",
      event: { title: "Kelas gratis untuk mahasiswa baru", when: "Sabtu, 19.00 sampai 20.00 WIB" },
      chat: [
        ["Kamu", "19.02", "Aku maba, minggu depan asistensi pertama. Deg-degan banget."],
        ["Rafi", "19.03", "Wajar kok. Siapkan tiga alasan untuk keputusan desainmu, lalu latih jawabannya dengan suara keras."],
        ["Rafi", "19.04", "Masuk voice, kita simulasi tanya jawab asistensi bareng."]
      ]
    },
    kemerdekaan: {
      label: "Edisi Kemerdekaan",
      title: "Merdeka dari belajar kebut semalam",
      desc: "Diskon 17 persen untuk semua modul sampai akhir Agustus, plus kelas bareng soal AI untuk tugas kuliah.",
      freebie: "gratis-tujuan-3-bulan",
      event: { title: "Kelas bareng: AI untuk tugas kuliah", when: "Sabtu, 19.00 sampai 20.00 WIB" },
      discount: { percent: 17, until: "2027-08-31", cats: ["modul"] },
      chat: [
        ["Kamu", "19.02", "Aku masih ragu, pakai AI buat tugas itu curang atau nggak."],
        ["Rafi", "19.03", "Tergantung caranya. AI untuk diskusi, cari ide, dan cek pemahaman itu bagus. Keputusan desain dan isi tugas tetap harus dari kamu."],
        ["Rafi", "19.04", "Yuk coba bareng. Kita tulis prompt empat bagian untuk tugasmu."]
      ]
    }
  },
  events: [                             // CEK tanggal setiap tahun
    { season: "ramadan",     start: "2027-02-08", end: "2027-03-08" },
    { season: "idulfitri",   start: "2027-03-09", end: "2027-03-20" },
    { season: "iduladha",    start: "2027-05-15", end: "2027-05-20" },
    { season: "kemerdekaan", start: "2027-08-10", end: "2027-08-31" }
  ],

  /* Bagian "Sedang dikerjakan". progress (0-100) menampilkan cincin persen. steps menampilkan daftar tahap. */
  projects: [
    {
      kind: "Buku", status: "Sedang ditulis",
      title: "Pas di Badan (judul sementara)",
      desc: "Buku ergonomi untuk mahasiswa desain. Isinya dikembangkan dari modul Dimensi Manusia dan Ruang Interior serta catatan kuliahku.",
      progress: 30, progressLabel: "naskah selesai",   // CEK persen
      url: "#buku", urlLabel: "Pra-pesan Rp10.000"
    },
    {
      kind: "Problem solving", status: "Sedang diuji",
      title: "Diskusi kelas yang bukan formalitas",
      desc: "Banyak diskusi di kampus cuma formalitas, dan banyak yang ikut-ikutan pendapat mayoritas. Ideku: ruang diskusi di Discord dengan aturan beda pendapat yang sehat dan sesi rutin tiap Sabtu malam.",
      steps: [["Masalah teramati", true], ["Rancang server dan aturan diskusi", true], ["Uji coba bareng teman sekelas", false], ["Evaluasi dan perbaiki", false]],   // CEK
      url: "#bimbel", urlLabel: "Lihat ruang belajarnya"
    },
    {
      kind: "Modul", status: "Sedang dirapikan",
      title: "Catatan kuliah jadi modul yang enak dibaca",
      desc: "Catatan kuliahku sedang kususun ulang supaya lebih mudah dipahami, dari sistem bangunan sampai desain mebel berkelanjutan.",
      steps: [["Dimensi Manusia dan Ruang Interior", true], ["Metodologi Desain", true], ["Sistem Bangunan untuk Desain Interior", false], ["Desain Mebel Berkelanjutan", false]]   // CEK
    }
  ],

  /* Proyek residensial di bagian Karya. Tambahkan render di sini, gambar berganti otomatis dengan animasi.
     src: lokasi gambar (disarankan .webp, lebar 1400 px). fit: "contain" untuk gambar kerja, "cover" untuk render.
     seconds: lama tiap gambar tampil sebelum pindah (detik). Makin kecil makin cepat. */
  residential: {
    seconds: 4,
    images: [
      { src: "assets/img/residensial-denah-2-lantai.webp", alt: "Gambar kerja denah lantai 1 dan lantai 2 rumah tinggal 6 x 11,9 meter, skala 1:50", caption: "Denah lantai 1 dan 2, rumah 6 × 11,9 m", fit: "contain" },
      { src: "assets/img/residensial-denah-mebel.webp", alt: "Denah rumah satu lantai 11 x 15 meter lengkap dengan tata letak mebel, taman, dan carport", caption: "Denah rumah 11 × 15 m lengkap dengan tata letak mebel", fit: "contain" },
      { src: "assets/img/auranda-zoning-aktivitas.webp", alt: "Sketsa analisis zona publik, zona keluarga, dan alur aktivitas di atas denah AutoCAD rumah AURANDA", caption: "AURANDA: analisis zona dan alur aktivitas di layout baru", fit: "contain" },
      { src: "assets/img/auranda-layout-tahap-3.webp", alt: "Denah layout desain tahap 3 rumah AURANDA dengan mebel, tangga putar, dan carport", caption: "AURANDA: layout desain tahap 3", fit: "contain" },
      { src: "assets/img/auranda-layout-furnitur-cad.webp", alt: "Denah layout furnitur rumah AURANDA di AutoCAD dengan layer berwarna", caption: "AURANDA: denah layout furnitur di AutoCAD", fit: "contain" },
      { src: "assets/img/auranda-sketchup-atas.webp", alt: "Model SketchUp rumah AURANDA dilihat dari atas, lengkap dengan mebel dan taman", caption: "AURANDA: model SketchUp dilihat dari atas", fit: "contain" },
      { src: "assets/img/auranda-sketchup-3d.webp", alt: "Model 3D SketchUp rumah AURANDA dengan atap limasan, pagar kayu, dan dak jemur", caption: "AURANDA: model 3D di SketchUp", fit: "contain" },
      { src: "assets/img/auranda-visual-teras.webp", alt: "Teras kayu dengan pergola, kursi santai, dan taman di rumah AURANDA", caption: "AURANDA: suasana teras", fit: "cover" },
      { src: "assets/img/auranda-visual-ruang-keluarga.webp", alt: "Ruang keluarga rumah AURANDA dengan sofa, partisi kayu, dan lampu hangat", caption: "AURANDA: suasana ruang keluarga", fit: "cover" }
    ]
  },

  /* Isi tiap ruang di Denah ilmu, muncul saat ruang diketuk.
     links: [label, alamat]. Alamat boleh #bagian, https://..., atau nama kunci di links (misal "lynk"). */
  rooms: {
    int: { no: "R.01 · Ruang utama", title: "Desain interior",
      learn: "Merancang ruang dimulai dari siapa yang memakainya dan apa yang mereka lakukan di sana. Setelah itu baru ditentukan zoning, sirkulasi, cahaya, warna, dan material.",
      did: ["Gambar kerja rumah tinggal dua lantai, 6 × 11,9 m", "Denah rumah satu lantai 11 × 15 m lengkap dengan tata letak mebel"],
      joins: ["Psikologi: warna dan cahaya memengaruhi suasana hati", "Matematika: skala, proporsi, dan luas ruang"],
      links: [["Lihat karya residensial", "#karya"]] },
    erg: { no: "R.02", title: "Ergonomi desain",
      learn: "Ruang dan mebel dicocokkan dengan ukuran tubuh, juga dengan suhu, cahaya, bunyi, dan panas yang dipancarkan permukaan di sekitar kita. Semuanya punya standar dan data.",
      did: ["Modul Dimensi Manusia dan Ruang Interior", "Kajian ergonomi untuk tiga kursi living room dari rotan"],
      joins: ["Fisika dasar: perpindahan panas dan radiasi", "Biologi: cara tubuh menjaga suhunya", "Neurosains: kenyamanan dan fokus"],
      links: [["Lihat modulnya", "#toko"], ["Bimbel ergonomi", "#bimbel"]] },
    mbl: { no: "R.03", title: "Desain mebel",
      learn: "Dari sketsa ke gambar kerja, lalu memikirkan sambungan, material, biaya, dan berapa lama mebel itu bisa dipakai.",
      did: ["Tiga kursi living room dari rotan: Selonjor, Pinarak, dan Srawung", "Buku pegangan Desain Mebel Berkelanjutan, 227 halaman"],
      joins: ["Fisika dasar: gaya dan beban pada sambungan", "Ekonomi: biaya bahan dan harga jual", "Sustainability: material yang bisa tumbuh lagi"],
      links: [["Lihat karya mebel", "#works"], ["Lihat di Lynk", "lynk"]] },
    bgn: { no: "R.04", title: "Sistem bangunan",
      learn: "Struktur, listrik, air, udara, dan aturan bangunan. Desainer interior perlu paham ini supaya rancangannya aman dan benar-benar bisa dibangun.",
      did: ["Modul Sistem Bangunan untuk Desain Interior"],
      joins: ["Fisika dasar: listrik dan aliran udara", "Eco green design: hemat energi dan air", "Pengelolaan sampah bangunan"],
      links: [["Lihat di Lynk", "lynk"]] },
    res: { no: "R.05", title: "Metodologi penelitian",
      learn: "Cara mengumpulkan bukti yang jujur lewat observasi, pengukuran, dan wawancara, lalu menuliskannya dengan rapi dan bersumber.",
      did: ["Jurnal teori ruang keluarga", "Paper kajian kursi makan"],
      joins: ["Matematika dan statistik dasar", "Berpikir kritis: memisahkan fakta, pendapat, dan perasaan"],
      links: [["Logbook riset, coming soon", "#toko"]] },
    des: { no: "R.06", title: "Metodologi desain",
      learn: "Proses dari memahami masalah, memunculkan banyak ide, memilih, lalu menguji. Diulang sampai solusinya benar-benar cocok untuk penggunanya.",
      did: ["Modul Metodologi Desain untuk Asistensi", "Proses tiga kursi rotan, dari masalah sampai model 3D"],
      joins: ["Berpikir lateral: mencari jalan yang tidak biasa", "AI sebagai teman diskusi ide, bukan pengganti berpikir"],
      links: [["Lihat modulnya", "#toko"]] },
    sel: { no: "S.01 · Selasar penghubung", title: "Soft skill",
      learn: "Ide bagus perlu disampaikan. Public speaking, kerja tim, manajemen waktu, menulis, dan belajar mandiri membuat semua ilmu di ruang lain bisa dipakai.",
      did: ["Menulis newsletter di Substack", "Menyiapkan kelas bareng gratis tiap Sabtu malam di Discord"],
      joins: ["Psikologi: kebiasaan dan motivasi", "Mengenal diri: tujuan per 3 bulan"],
      links: [["Kelas bareng di Discord", "#bimbel"], ["Baca newsletter", "#newsletter"]] }
  },

  /* Karya lain. thumb: chair | plan | board | book, atau image: "assets/img/nama-file.webp" */
  works: [
    { type: "Buku pegangan", year: "2026", title: "Desain Mebel Berkelanjutan", desc: "Buku pegangan setebal 227 halaman. Dari masalah, proses, ergonomi, fisika, material, sambungan, ekonomi, sampai keberlanjutan.", image: "assets/img/karya-cover-mebel-berkelanjutan.webp", url: "#toko", urlLabel: "Lihat di toko" },
    { type: "Desain mebel", year: "2026", title: "Tiga kursi living room dari rotan", desc: "Kursi Selonjor, Pinarak, dan Srawung. Kajian ergonomi, rotan, dan sentuhan Jepang modern, lengkap dengan gambar kerja dan model 3D.", image: "assets/img/karya-sofa-rotan.webp" },
    { type: "Buku pegangan", year: "2026", title: "Sistem Bangunan untuk Desain Interior", desc: "Struktur, utilitas, dan aturan dasar bangunan yang perlu dipahami desainer interior, ditulis dengan bahasa sederhana.", image: "assets/img/karya-cover-sistem-bangunan.webp", url: "#toko", urlLabel: "Lihat di toko" },
    { type: "Desain mebel", year: "2026", title: "Kelir Chair", desc: "Tugas pertama Desain Mebel I. Kursi hasil analisis dengan sandaran bermotif truntum terawang, digambar tangan lengkap dengan ukurannya.", image: "assets/img/karya-kelir-chair.webp" },
    { type: "Modul", year: "2026", title: "Dimensi Manusia dan Ruang Interior", desc: "Modul belajar lengkap tentang ukuran tubuh manusia dan cara memakainya untuk ruang dan mebel.", thumb: "board", url: "#toko", urlLabel: "Lihat di toko" }
  ],

  categories: {
    gratis: "Gratis",
    catatan: "Catatan Semester 1",
    buku: "Buku",
    modul: "Modul",
    template: "Template",
    kursus: "Kursus",
    jurnal: "Jurnal"
  },

  /* Produk. id unik huruf kecil, sku MR-<KODE>-<NO>, cat salah satu kunci categories, price rupiah tanpa titik.
     soon: true untuk produk yang belum siap (tampil "Coming soon", tombol Kabari aku).
     discount: { percent: 20, until: "2026-11-30" } untuk diskon satu produk. Diskon musim diatur di seasons.
     lynk: tautan produk di lynk.id (opsional). Kalau diisi, muncul tombol "Atau beli di Lynk".
     Produk gratis (price: 0): free.via "wa" (minta lewat WhatsApp) atau "link" (isi free.url untuk unduh langsung). */
  products: [
    /* Dari Lynk, November 2026. Harga sama dengan Lynk. lynk: tautan produk yang sama di Lynk. */
    { id: "buku-sistem-bangunan", sku: "MR-BK-03", cat: "buku", art: "plan", title: "Sistem Bangunan untuk Desain Interior", desc: "Buku pegangan mata kuliah Sistem Bangunan. Struktur, air, listrik, udara, cahaya, sampai akustik dijelaskan dengan bahasa sederhana, lengkap dengan contoh gambar kerja renovasi rumah AURANDA. Setiap angka diberi tanda WAJIB, LAZIM, atau KEBIASAAN.", format: "E-book PDF, 29 bab dan lampiran A sampai G, sekitar 400 halaman", price: 21999, badge: "Terbaru", lynk: "https://lynk.id/catatankuliah.di/49o6j1kvjgwq" },
    { id: "buku-mebel-berkelanjutan", sku: "MR-BK-04", cat: "buku", art: "chair", title: "Sustainable Design: Desain Mebel Berkelanjutan", desc: "Buku pegangan merancang kursi dari semester pertama sampai tugas akhir. Ekonomi, fisika, biologi, kimia, psikologi, sampai urusan sampah dirangkai jadi satu alur metodologi desain.", format: "E-book PDF, 227 halaman", price: 21000, lynk: "https://lynk.id/catatankuliah.di/r4o58l496jvv" },
    { id: "buku-basic-desain-interior", sku: "MR-BK-05", cat: "buku", art: "book", title: "Basic Desain Interior", desc: "Rangkuman empat buku besar desain interior untuk pemula dan orang awam. Disusun dari buku Kilmer dan Kilmer, Mitton, Mitton dan Nystuen, serta Ronin.", format: "E-book PDF", price: 15999, badge: "Untuk pemula", lynk: "https://lynk.id/catatankuliah.di/3rdz7pgm0ww7" },
    { id: "modul-dimensi-manusia", sku: "MR-MOD-01", cat: "modul", art: "ruler", title: "Dimensi Manusia dan Ruang Interior", desc: "Modul belajar ergonomi dan antropometri. Pendamping berbahasa Indonesia untuk buku Human Dimension and Interior Space karya Julius Panero dan Martin Zelnik (1979).", format: "Modul PDF, edisi lengkap bagian A, B, dan C", price: 15000, badge: "Mulai dari sini", lynk: "https://lynk.id/catatankuliah.di/my27vn4kl1vv" },
    // DISEMBUNYIKAN DULU (hak cipta Neufert). Hapus tanda // di depan baris ini kalau sudah yakin aman ditampilkan.
    // { id: "buku-arsitek-data-residensial", sku: "MR-BK-06", cat: "buku", art: "grid", title: "Arsitek Data-nya Residensial (Edisi 1)", desc: "Panduan membaca Architects' Data karya Ernst Neufert untuk rumah tinggal, dengan bahasa Indonesia dan konteks lokal.", format: "E-book PDF", price: 66753, lynk: "https://lynk.id/catatankuliah.di/ypz8g8l334ky" },

    /* Catatan Semester 1. Tampil di bagian "Khusus mahasiswa baru" (#maba), bukan di toko utama.
       subject = nama mata kuliah, dipakai untuk mengelompokkan. Mata kuliah baru tinggal diberi subject baru.
       Semua tombol Lynk menuju halaman Semester 1 di Lynk. */
    { id: "s1-paket-ujian", sku: "MR-SM1-01", cat: "catatan", subject: "Sejarah Desain", art: "gift", title: "Paket Ujian: Paket Full Materi", desc: "Semua materi Sejarah Desain semester 1 dalam satu paket untuk persiapan ujian.", format: "Paket catatan PDF", price: 19999, badge: "Paket ujian", lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-paket-lengkap-1", sku: "MR-SM1-02", cat: "catatan", subject: "Sejarah Desain", art: "book", title: "Paket Lengkap #1 Sejarah Desain", desc: "Paket belajar mandiri Sejarah Desain dari pertemuan pertama sampai pertengahan semester.", format: "Paket catatan PDF", price: 15999, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-sejarah-akhir-2", sku: "MR-SM1-03", cat: "catatan", subject: "Sejarah Desain", art: "spark", title: "Catatan Sejarah Desain Akhir #2: Apa dan Mengapa Stapler Ingin Terbang?", desc: "Membongkar logika tersembunyi di balik desain modern. Materi akhir untuk ujian semester 1.", format: "Catatan PDF", price: 14999, badge: "Baru", lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-streamline-moderne", sku: "MR-SM1-04", cat: "catatan", subject: "Sejarah Desain", art: "lines", title: "#1 Streamline Moderne: Memaknai Harapan di Tengah Krisis", desc: "Materi Sejarah Desain pertemuan akhir sebelum ujian akhir.", format: "Catatan PDF", price: 4000, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-art-deco", sku: "MR-SM1-05", cat: "catatan", subject: "Sejarah Desain", art: "lines", title: "Catatan Sejarah Desain (11): Art Deco", desc: "Art Deco, dari mesin menuju kemewahan yang terukur.", format: "Catatan PDF", price: 2000, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-sejarah-10", sku: "MR-SM1-06", cat: "catatan", subject: "Sejarah Desain", art: "lines", title: "Catatan Sejarah Desain ke-10", desc: "Catatan pertemuan ke-10 mata kuliah Sejarah Desain.", format: "Catatan PDF", price: 1999, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-latihan-soal-sejarah", sku: "MR-SM1-07", cat: "catatan", subject: "Sejarah Desain", art: "chat", title: "Latihan Soal Sejarah Desain", desc: "Latihan soal untuk menguji pemahamanmu sebelum ujian Sejarah Desain.", format: "Soal latihan PDF", price: 499, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-soal-opsi-sejarah", sku: "MR-SM1-08", cat: "catatan", subject: "Sejarah Desain", art: "chat", title: "Paket Belajar Sejarah Desain dengan Soal Opsi", desc: "Belajar Sejarah Desain lewat soal opsi. Harganya hampir gratis, cocok untuk mencoba dulu.", format: "Paket soal PDF", price: 100, badge: "Coba dulu", lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-pancasila-demokrasi", sku: "MR-SM1-09", cat: "catatan", subject: "Pancasila", art: "grid", title: "Pancasila dan Demokrasi", desc: "Panduan lengkap demokrasi, dari teori dasar sampai dinamikanya di Indonesia.", format: "Catatan PDF", price: 9999, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-pancasila-hukum", sku: "MR-SM1-10", cat: "catatan", subject: "Pancasila", art: "grid", title: "Pancasila dan Sistem Hukum", desc: "Restorasi hukum dan penyenyawaan nilai Pancasila.", format: "Catatan PDF", price: 4999, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-pancasila-ham", sku: "MR-SM1-11", cat: "catatan", subject: "Pancasila", art: "grid", title: "Pancasila dan Hak Asasi Manusia", desc: "Menelusuri akar sejarah dan perkembangan hak asasi manusia.", format: "Catatan PDF", price: 4999, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-kekerasan-anak-perempuan", sku: "MR-SM1-12", cat: "catatan", subject: "Pancasila", art: "grid", title: "Kekerasan pada Anak dan Perempuan", desc: "Mengembalikan janji kemerdekaan ke ruang privat.", format: "Catatan PDF", price: 4999, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-pancasila-karakter", sku: "MR-SM1-13", cat: "catatan", subject: "Pancasila", art: "grid", title: "Pancasila dan Pendidikan Karakter", desc: "Catatan Pancasila tentang pendidikan karakter.", format: "Catatan PDF", price: 4500, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },
    { id: "s1-pancasila-korupsi", sku: "MR-SM1-14", cat: "catatan", subject: "Pancasila", art: "grid", title: "Pancasila dan Korupsi", desc: "Dari teori, modus operandi, sampai upaya pemberantasan.", format: "Catatan PDF", price: 3999, lynk: "https://lynk.id/catatankuliah.di/page/semester-1-di-isiyk2025" },

    /* Produk lama dari versi awal website. Hapus barisnya kalau tidak dijual. */
    { id: "gratis-tujuan-3-bulan", sku: "MR-FREE-01", cat: "gratis", art: "grid", title: "Lembar Tujuan 3 Bulan", desc: "Satu halaman untuk menulis arah besarmu, tujuan 3 bulan, dan kebiasaan kecil minggu ini. Pikir besar, mulai kecil.", format: "PDF 1 halaman, siap cetak", price: 0, free: { via: "link", url: "assets/files/lembar-tujuan-3-bulan.pdf" } },
    { id: "gratis-checklist-asistensi", sku: "MR-FREE-02", cat: "gratis", art: "ruler", title: "Checklist Asistensi", desc: "Hal yang paling sering ditanyakan dosen saat asistensi, dari ukuran mebel, sirkulasi, cahaya, sampai suhu ruang, plus cara menjelaskannya.", format: "PDF 1 halaman", price: 0, free: { via: "wa" } },   // CEK: pastikan file-nya sudah siap
    { id: "template-notion", sku: "MR-TPL-01", cat: "template", art: "grid", title: "Template Notion Jadwal Kuliah", desc: "Database tugas, jadwal studio, dan jadwal ulang materi yang tersambung ke kalender.", format: "Template Notion", price: 2000, badge: "Harga perkenalan" },
    { id: "modul-metodologi", sku: "MR-MOD-02", cat: "modul", art: "chat", title: "Metodologi Desain untuk Asistensi", desc: "Cara menyusun alasan desain dari masalah, data, sampai konsep, supaya pertanyaan kenapa dari dosen bisa kamu jawab.", format: "Modul PDF + lembar kerja", price: 45000 },   // CEK harga
    { id: "modul-sketchup", sku: "MR-MOD-03", cat: "modul", art: "cube", title: "Dari Denah ke Model 3D dengan SketchUp", desc: "Ubah denah 2D jadi model ruang 3D, susun komponen mebel, lalu buat scene presentasi.", format: "Modul PDF + file latihan", price: 45000, soon: true },
    { id: "modul-autocad-mebel", sku: "MR-MOD-04", cat: "modul", art: "ruler", title: "Gambar Kerja Mebel dengan AutoCAD", desc: "Tampak, potongan, detail sambungan, dan layout siap cetak untuk tugas mebel.", format: "Modul PDF + file latihan", price: 45000, soon: true },
    { id: "kursus-jadwal-mingguan", sku: "MR-KRS-01", cat: "kursus", art: "lines", title: "Kursus Jadwal Belajar Mingguan", desc: "Kita susun jadwal belajar mingguanmu bareng. Ceritakan masalahmu, nanti kita cari jalan keluarnya sama-sama.", format: "Kursus singkat + konsultasi lewat Discord", price: 29000, unit: "program" },
    { id: "buku-pas-di-badan", sku: "MR-BK-01", cat: "buku", art: "chair", title: "Pas di Badan", desc: "Buku ergonomi untuk mahasiswa desain. Terbit mandiri. Pesan sekarang dengan harga pra-pesan, e-book dikirim saat terbit.", format: "E-book PDF, pra-pesan", price: 10000, badge: "Pra-pesan" },
    { id: "buku-kuliah-desain", sku: "MR-BK-02", cat: "buku", art: "plan", title: "Kuliah Desain Itu Proyek", desc: "Cara mengelola satu semester kuliah desain seperti mengelola proyek. Ada target, jadwal studio, dan cadangan waktu untuk revisi.", format: "E-book PDF", price: 49000, soon: true },
    { id: "jurnal-riset", sku: "MR-JR-01", cat: "jurnal", art: "grid", title: "Logbook Riset Desain", desc: "Lembar observasi, pengukuran, foto berskala, dan refleksi harian untuk penelitian lapangan.", format: "PDF siap cetak", price: 35000, soon: true }
  ],

  /* Program bimbel privat lewat Discord. id harus sama dengan data-offer di index.html */
  programs: [
    { id: "bimbel-notion30", sku: "MR-BIM-01", title: "Bisa Notion dalam 30 Hari", price: 150000, unit: "program" },   // CEK harga
    { id: "bimbel-figma", sku: "MR-BIM-02", title: "Dasar Figma dalam 1 Bulan", price: 200000, unit: "program", soon: true },
    { id: "bimbel-ergonomi", sku: "MR-BIM-03", title: "Ergonomi untuk Asistensi", price: 85000, unit: "sesi" },   // CEK harga
    { id: "bimbel-software", sku: "MR-BIM-04", title: "SketchUp dan AutoCAD", price: 85000, unit: "sesi" },   // CEK harga
    { id: "bimbel-ai", sku: "MR-BIM-05", title: "AI untuk Belajar dan Desain", price: 75000, unit: "sesi" },   // CEK harga
    { id: "bimbel-belajar", sku: "MR-BIM-06", title: "Konsultasi Cara Belajar", price: 50000, unit: "sesi" }   // CEK harga
  ],

  /* Testimoni ASLI saja, dengan izin orangnya. Kosong = bagian testimoni disembunyikan.
     Boleh memakai inisial kalau orangnya tidak mau nama lengkap tampil.
     Format: { name: "D. A.", role: "Desain Interior ISI 2025", text: "Isi testimoni", stars: 5 } */
  testimonials: [],

  faq: [
    { q: "Metode pembayaran", a: "Semua pembayaran lewat QRIS. Kamu bisa scan dari GoPay, OVO, DANA, ShopeePay, LinkAja, atau aplikasi m-banking yang mendukung QRIS. Beberapa produk juga tersedia di Lynk." },
    { q: "Fungsi kode unik di nominal", a: "Angka kecil di ujung nominal (maksimal Rp199) membantu mencocokkan pembayaranmu dengan nomor pesanan. Jadi pastikan nominal yang kamu ketik persis sama." },
    { q: "Waktu pengiriman produk", a: "Setelah pembayaran kucek, file dikirim ke email yang kamu isi saat memesan. Kalau email dikosongkan, file kukirim lewat WhatsApp. Biasanya di hari yang sama selama jam admin {hours}." },
    { q: "Produk bertanda Coming soon", a: "Produk itu sedang kusiapkan dan belum bisa dibeli. Tekan Kabari aku, nanti aku kabari begitu sudah siap." },
    { q: "Pra-pesan buku Pas di Badan", a: "Kamu membayar harga pra-pesan sekarang, lalu e-book dikirim lewat WhatsApp atau email begitu terbit. Perkembangan naskahnya bisa kamu lihat di bagian Sedang dikerjakan." },
    { q: "Cara ikut bimbel di Discord", a: "Setelah pembayaran dicek, aku kirim undangan server Discord dan membuat channel pribadi untukmu. Kamu cukup punya akun Discord, mikrofon, dan koneksi internet yang stabil. Dari HP juga bisa." },
    { q: "Kelas bareng gratis tiap Sabtu", a: "Setiap Sabtu malam, 19.00 sampai 20.00 WIB, ada kelas bareng gratis di Discord. Topiknya berganti, dari software, cara belajar, sampai diskusi bebas. Siapa pun boleh ikut dan boleh beda pendapat." },
    { q: "Jadwal ulang sesi bimbel", a: "Sesi masih bisa dijadwal ulang paling lambat 12 jam sebelum mulai. Kabari saja lewat Discord atau WhatsApp." },
    { q: "Untuk siapa materi ini", a: "Terutama untuk teman-teman Desain Interior ISI Yogyakarta, dari mahasiswa baru sampai yang sedang skripsi. Mahasiswa desain dari kampus lain dan siapa pun yang ingin belajar juga boleh ikut." },
    { q: "Tidak perlu ikut-ikutan", a: "Beli karena kamu butuh, bukan karena teman-temanmu beli. Coba dulu yang gratis, baca catatannya, lalu putuskan sendiri. Itu juga bagian dari belajar berpikir kritis." },
    { q: "Aturan berbagi file", a: "Setiap produk untuk pemakaian pribadi. Tolong jangan disebar ulang, karena dari penjualan inilah aku bisa terus membuat materi baru dan konten gratis." }
  ]
};
