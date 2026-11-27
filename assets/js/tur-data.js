/* =========================================================
   Isi tur 3D AURANDA. File ini aman diedit tangan.
   Ukuran dalam cm. Denah: x ke timur, y ke utara (selatan = negatif), titik 0,0 di sudut barat laut.
   Geometri model (dinding, bukaan, perabot) ada di tur-model.js, dibuat otomatis dari model SketchUp.

   CARA MENAMBAH FOTO BIASA
   1. Simpan gambar di assets/img/tur/ (webp, lebar sekitar 2400 px) dan versi kecilnya (lebar 480 px) dengan akhiran -s.webp.
   2. Salin satu blok di "scenes", ganti id, nama, room, pos (titik kamera di denah), arah (derajat kompas, 0 = utara, 90 = timur).
   3. Titik pindah (hs) dan penanda ukuran (pins) memakai posisi [kiri, atas] dalam pecahan gambar, 0 sampai 1.
      Tambahkan ?edit di alamat tur, lalu Alt + klik di gambar untuk membaca posisinya.

   CARA MENAMBAH PANORAMA 360 DERAJAT (Street View sungguhan)
   Ekspor panorama dari Enscape (gambar equirectangular, perbandingan 2 banding 1, lebar 4096 px sudah cukup).
   Simpan di assets/img/tur/pano/ lalu isi blok scene dengan type: "pano". Contoh ada di bagian paling bawah file ini.
   Buat juga versi kecil (lebar 480 px) berakhiran -s.webp untuk daftar Ruang, misal pano/keluarga-siang-s.webp.
   Lingkaran pindah di panorama memakai az (arah kompas, 0 = utara) dan el (naik turun, dalam derajat). Tambahkan ?edit di alamat tur, lalu Alt + klik di panorama untuk membaca az dan el-nya.
   Di mode panorama, tombol Ukur bisa mengukur jarak antara dua titik langsung di gambar, dihitung dari model 3D.
   ========================================================= */
window.TUR_DATA = {
  judul: "AURANDA",
  base: "assets/img/tur/",
  mulai: "deck",
  kembali: "pameran-semester-3.html",
  url: "https://musholirafi.my.id/tur-auranda.html",
  qr: "assets/img/qr-tur-auranda.svg",
  tinggiMata: 150,
  catatan: "Visualisasi AI dari render Enscape. Ukuran resmi ada di gambar kerja dan model SketchUp.",

  lantai: {
    L1: "Granit 60 × 60 warna pasir, doff",
    L2: "Keramik anti-slip 30 × 30",
    L3: "Kayu bengkirai berminyak",
    L4: "Keramik teras 40 × 40 anti-slip",
    L5: "Beton"
  },

  /* Info tiap ruang. Kunci sama dengan id ruang di tur-model.js. */
  rooms: {
    "ruang-tamu-luar": {
      jenis: "Teras kayu setengah terbuka",
      plafon: "Kanopi kayu, puncak +3,18 m",
      label: [289, -606],
      ringkas: "Deck kayu bengkirai bergaya engawa di bawah kanopi kayu beratap polikarbonat opal. Tempat duduk santai yang menyambung taman dan ruang tamu dalam."
    },
    "ruang-tamu-dalam": {
      jenis: "Ruang tamu formal",
      label: [520, -585],
      ringkas: "Ruang tamu yang ringkas dengan sofa dua dudukan bersarung lepas, kursi kayu berlengan, dan dinding foto keluarga. Pintu geser kaca buram dan jalusi kaca membukanya ke deck."
    },
    "vestibul-k2": {
      jenis: "Ruang peralihan",
      label: [635, -462],
      ab: "Vestibul",
      ringkas: "Ruang kecil di depan pintu Kamar 2, supaya kamar terasa lebih tertutup dari ruang tamu."
    },
    "ruang-tengah": {
      jenis: "Ruang penghubung",
      label: [830, -450],
      ringkas: "Jantung rumah yang menghubungkan hampir semua ruang. Ada dapur 1 yang ringkas, lemari jati warisan, dan rak partisi dua sisi. Skylight B1 di atasnya memasukkan cahaya dan mengalirkan udara panas naik ke lantern di atap."
    },
    "ruang-keluarga": {
      jenis: "Ruang berkumpul",
      plafon: "3,00 m, lis turun 2,75 m",
      label: [1128, -707],
      ringkas: "Ruang berkumpul yang nyaman dipakai lesehan. Sofa bed menghadap TV 43 inci, ada meja kopi rendah, karpet tipis, dan kipas plafon. Lis plafon turun ke 2,75 m dengan lampu LED hangat."
    },
    "dapur-2": {
      jenis: "Dapur servis",
      label: [1345, -240],
      ringkas: "Dapur servis dan area cuci. Ada pawon dengan kompor satu tungku, rak besi untuk perlengkapan servis, freezer, dan tangga putar besi menuju dek jemur. Sumur cahaya B8 membawa cahaya dari atas."
    },
    "m-cuci": {
      jenis: "Area cuci",
      label: [1060, -60],
      ab: "Cuci",
      ringkas: "Sudut mesin cuci top loading dengan keranjang cucian, bersebelahan dengan dapur 2."
    },
    "km-umum": {
      jenis: "Kamar mandi",
      label: [1052, -210],
      ab: "KM",
      ringkas: "Kamar mandi bersama dengan kloset duduk berjet washer, wastafel, dan area shower."
    },
    "kamar-1": {
      jenis: "Kamar utama",
      label: [800, -818],
      ringkas: "Kamar utama dengan tempat tidur 200 × 160 cm, nakas, dan lemari tanam setinggi plafon. Punya kamar mandi di dalam."
    },
    "km-dalam-k1": {
      jenis: "Kamar mandi",
      label: [530, -785],
      ab: "KM",
      ringkas: "Kamar mandi di dalam Kamar 1 dengan kloset duduk, wastafel, shower, dan pegangan di samping kloset dan di area shower."
    },
    "kamar-2": {
      jenis: "Kamar tidur",
      label: [545, -262],
      ringkas: "Kamar dengan tempat tidur 200 × 90 cm, meja kerja dan gaming 120 × 60 cm, serta panel akustik di dinding. Jendelanya menghadap barat."
    },
    "kamar-3": {
      jenis: "Kamar tidur",
      label: [828, -158],
      ringkas: "Kamar dengan tempat tidur 200 × 120 cm, lemari tanam, dan vitrine kaca berkunci 160 × 40 × 200 cm untuk koleksi model kit."
    },
    "teras-depan": {
      jenis: "Teras",
      label: [1128, -944],
      ringkas: "Teras depan dengan rak sepatu keluarga dan bangku untuk melepas sepatu. Lantainya keramik anti-slip."
    },
    "garasi": {
      jenis: "Carport",
      label: [1421, -730],
      ringkas: "Carport untuk mobil dengan lemari garasi 170 × 80 × 240 cm dan rak gantung di atas kap mobil. Lantainya beton."
    }
  },

  /* Urutan di sini dipakai tombol Sebelumnya dan Berikutnya. */
  scenes: [
    {
      id: "deck",
      nama: "Ruang tamu luar (deck)",
      room: "ruang-tamu-luar",
      pos: [70, -610], arah: 90, fov: 112,
      cat: "Dari ujung barat deck, menghadap pintu geser ke ruang tamu dalam.",
      v: {
        siang: { f: "deck-siang", ar: 2.1254 },
        malam: { f: "deck-malam", ar: 1.7914 }
      },
      hs: [
        { ke: "tamu-dalam", t: "Masuk ke ruang tamu dalam", p: { siang: [0.47, 0.5], malam: [0.465, 0.52] } }
      ],
      pins: [
        { t: "Bangku jati bersandaran", u: "125 × 55 cm, dudukan 42 cm", p: { siang: [0.585, 0.8], malam: [0.615, 0.85] } },
        { t: "Kursi teras", u: "55 × 55 cm, dudukan 42 cm", p: { siang: [0.36, 0.66], malam: [0.355, 0.73] } },
        { t: "Meja kopi rendah", u: "90 × 45 × 40 cm", p: { siang: [0.485, 0.75], malam: [0.485, 0.8] } },
        { t: "Rak sepatu tamu", u: "75 × 30 × 45 cm", p: { siang: [0.255, 0.635], malam: [0.215, 0.69] } },
        { t: "Keran taman dan bak cuci kaki", u: "30 × 30 cm", p: { siang: [0.215, 0.82], malam: [0.195, 0.84] } },
        { t: "Pintu geser teras", u: "lebar 140 cm, tinggi 255 cm", p: { siang: [0.47, 0.33], malam: [0.465, 0.36] } },
        { t: "Kanopi kayu", u: "puncak +3,18 m dari lantai", p: { siang: [0.4, 0.07], malam: [0.43, 0.09] } }
      ]
    },
    {
      id: "tamu-dalam",
      nama: "Ruang tamu dalam",
      room: "ruang-tamu-dalam",
      pos: [452, -468], arah: 124, fov: 112,
      cat: "Dari sudut barat laut ruang, menghadap sofa dan dinding foto.",
      v: { siang: { f: "tamu-dalam", ar: 2.1413 } },
      hs: [
        { ke: "deck", t: "Keluar ke deck", p: [0.69, 0.8] },
        { ke: "tengah-barat", t: "Ke ruang tengah", p: [0.15, 0.4] }
      ],
      pins: [
        { t: "Sofa 2 dudukan", u: "140 × 75 cm, dudukan 42 cm", p: [0.575, 0.64] },
        { t: "Meja tamu", u: "80 × 45 × 40 cm", p: [0.5, 0.86] },
        { t: "Kursi kayu berlengan", u: "52 × 50 cm, dudukan 42 cm", p: [0.385, 0.74] },
        { t: "Dinding foto keluarga", u: "lebar sekitar 130 cm", p: [0.6, 0.3] },
        { t: "Rak partisi dua sisi", u: "140 × 35 × 210 cm", p: [0.3, 0.4] },
        { t: "Kisi geser kayu", u: "geser 85 cm dan tetap 100 cm, tinggi 210 cm", p: [0.2, 0.76] }
      ]
    },
    {
      id: "tengah-barat",
      nama: "Ruang tengah, ke arah barat",
      room: "ruang-tengah",
      pos: [1012, -468], arah: 272, fov: 112,
      cat: "Dari dekat dapur 1, menghadap ke barat. Lubang cahaya B1 terlihat di plafon.",
      v: { siang: { f: "tengah-barat", ar: 2.1467 } },
      hs: [
        { ke: "tamu-dalam", t: "Ke ruang tamu dalam", p: [0.6, 0.88] },
        { ke: "dapur-1", t: "Berbalik ke dapur 1", p: [0.165, 0.93] }
      ],
      pins: [
        { t: "Lemari jati warisan", u: "130 × 40 × 180 cm", p: [0.4, 0.56] },
        { t: "Rak partisi dua sisi", u: "140 × 35 × 210 cm", p: [0.515, 0.58] },
        { t: "Kulkas 2 pintu", u: "57 × 62 × 170 cm", p: [0.06, 0.74] },
        { t: "Lemari tanam A", u: "115 × 45 × 300 cm", p: [0.75, 0.42] },
        { t: "Skylight B1", u: "180 × 170 cm, atap opal di +3,85 m", p: [0.5, 0.12] },
        { t: "Pintu Kamar 1", u: "85 × 210 cm", p: [0.265, 0.62] }
      ]
    },
    {
      id: "dapur-1",
      nama: "Dapur 1 di ruang tengah",
      room: "ruang-tengah",
      pos: [990, -392], arah: 117, fov: 112,
      cat: "Dari sisi utara ruang tengah, menghadap dapur kecil di ujung timur.",
      v: { siang: { f: "dapur-1", ar: 2.1307 } },
      hs: [
        { ke: "dapur-2-pawon", t: "Ke dapur 2", p: [0.41, 0.47] },
        { ke: "keluarga-2", t: "Ke ruang keluarga", p: [0.95, 0.62] },
        { ke: "tengah-barat", t: "Berbalik ke arah barat", p: [0.5, 0.92] }
      ],
      pins: [
        { t: "Kulkas 2 pintu", u: "57 × 62 × 170 cm", p: [0.76, 0.72] },
        { t: "Kitchen set L", u: "200 × 62 cm dan 63 × 86 cm, tinggi 85 cm", p: [0.6, 0.82] },
        { t: "Sink", u: "60 × 45 cm", p: [0.645, 0.62] },
        { t: "Kompor 2 tungku dan hood", u: "sekitar 60 × 45 cm, hood sampai plafon", p: [0.555, 0.48] },
        { t: "Lemari jati warisan", u: "130 × 40 × 180 cm", p: [0.47, 0.74] }
      ]
    },
    {
      id: "dapur-2-pawon",
      nama: "Dapur 2, pawon",
      room: "dapur-2",
      pos: [1425, -228], arah: 289, fov: 112,
      cat: "Dari sisi timur dapur 2, menghadap pawon dan dua pintu.",
      v: { siang: { f: "dapur-2-pawon", ar: 2.136 } },
      hs: [
        { ke: "dapur-1", t: "Ke ruang tengah", p: [0.37, 0.66] },
        { ke: "dapur-2-servis", t: "Ke tangga dan rak servis", p: [0.035, 0.75] }
      ],
      pins: [
        { t: "Counter pawon", u: "120 × 60 × 85 cm", p: [0.54, 0.8] },
        { t: "Troli saji", u: "60 × 40 × 80 cm", p: [0.455, 0.74] },
        { t: "Pintu ke garasi", u: "90 × 210 cm", p: [0.18, 0.52] },
        { t: "Pintu ke ruang tengah", u: "80 × 210 cm", p: [0.37, 0.45] }
      ]
    },
    {
      id: "dapur-2-servis",
      nama: "Dapur 2, servis dan tangga",
      room: "dapur-2",
      pos: [1168, -46], arah: 126, fov: 112,
      cat: "Dari sudut barat laut dapur 2, menghadap rak servis dan tangga putar ke dek jemur.",
      v: { siang: { f: "dapur-2-servis", ar: 2.1413 } },
      hs: [
        { ke: "dapur-1", t: "Ke ruang tengah", p: [0.8, 0.78] },
        { ke: "dapur-2-pawon", t: "Ke pawon", p: [0.9, 0.9] }
      ],
      pins: [
        { t: "Rak servis besi", u: "175 × 40 × 200 cm", p: [0.3, 0.55] },
        { t: "Tangga putar besi", u: "diameter sekitar 140 cm, naik ke dek jemur +3,35 m", p: [0.535, 0.36] },
        { t: "Freezer box", u: "85 × 60 cm, tinggi 86 cm", p: [0.09, 0.84] },
        { t: "Sumur cahaya B8", u: "115 × 115 cm, atap opal di +4,66 m", p: [0.3, 0.07] },
        { t: "Pintu ke ruang tengah", u: "80 × 210 cm", p: [0.82, 0.5] }
      ]
    },
    {
      id: "keluarga-2",
      nama: "Ruang keluarga, sudut timur laut",
      room: "ruang-keluarga",
      pos: [1255, -590], arah: 215, fov: 112,
      cat: "Dari sudut timur laut, menghadap jendela dan sofa bed.",
      v: { siang: { f: "keluarga-2", ar: 2.1254 } },
      hs: [
        { ke: "tengah-barat", t: "Ke ruang tengah", p: [0.665, 0.55] },
        { ke: "keluarga-1", t: "Ke sudut pintu depan", p: [0.55, 0.88] }
      ],
      pins: [
        { t: "Sofa bed", u: "150 × 80 cm", p: [0.4, 0.84] },
        { t: "Meja kopi rendah", u: "80 × 45 × 35 cm", p: [0.525, 0.8] },
        { t: "TV 43 inci dan konsol", u: "konsol 120 × 30 × 45 cm", p: [0.775, 0.66] },
        { t: "Kipas plafon", u: "diameter 120 cm", p: [0.56, 0.22] },
        { t: "Jendela ruang keluarga", u: "154 × 172 cm, ambang 38 cm", p: [0.28, 0.56] },
        { t: "Lis plafon", u: "turun ke 2,75 m, lampu LED hangat", p: [0.18, 0.16] }
      ]
    },
    {
      id: "keluarga-1",
      nama: "Ruang keluarga, sudut pintu depan",
      room: "ruang-keluarga",
      pos: [1250, -835], arah: 288, fov: 112,
      cat: "Dari sudut tenggara, menghadap sofa bed, TV, dan pintu ke ruang tengah.",
      v: {
        siang: { f: "keluarga-1-siang", ar: 2.1413 },
        malam: { f: "keluarga-1-malam", ar: 2.1413 }
      },
      hs: [
        { ke: "tengah-barat", t: "Ke ruang tengah", p: { siang: [0.62, 0.38], malam: [0.625, 0.48] } },
        { ke: "keluarga-2", t: "Ke sudut timur laut", p: { siang: [0.8, 0.88], malam: [0.8, 0.9] } }
      ],
      pins: [
        { t: "Sofa bed", u: "150 × 80 cm", p: { siang: [0.45, 0.74], malam: [0.4, 0.84] } },
        { t: "Meja kopi rendah", u: "80 × 45 × 35 cm", p: { siang: [0.585, 0.64], malam: [0.56, 0.8] } },
        { t: "Konsol TV", u: "120 × 30 × 45 cm", p: { siang: [0.76, 0.58], malam: [0.77, 0.76] } },
        { t: "TV 43 inci", u: "dipasang di dinding", p: { siang: [0.8, 0.3], malam: [0.8, 0.43] } },
        { t: "Karpet tipis", u: "190 × 140 cm, tebal maksimal 1 cm", p: { siang: [0.7, 0.84], malam: [0.66, 0.88] } }
      ]
    }
  ]

  /* CONTOH BLOK PANORAMA 360 DERAJAT (hapus tanda komentar dan taruh di dalam "scenes" setelah gambarnya ada)
  ,{
    id: "keluarga-360",
    type: "pano",
    nama: "Ruang keluarga (360)",
    room: "ruang-keluarga",
    pos: [1128, -707],      // titik kamera di denah, cm
    tinggi: 150,            // tinggi kamera dari lantai, cm
    arah: 270,              // arah kompas yang tepat di tengah gambar panorama (0 = utara, 90 = timur)
    v: { siang: { f: "pano/keluarga-siang.webp" } },
    hs: [
      { ke: "tengah-barat", t: "Ke ruang tengah", az: 270, el: -8 }   // az = arah kompas, el = naik turun (derajat)
    ]
  }
  */
};
