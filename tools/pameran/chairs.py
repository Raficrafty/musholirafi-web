# -*- coding: utf-8 -*-
"""Isi tiga kursi untuk halaman Pameran. Satu sumber untuk HTML dan pameran-data.js.
Aturan teks: aku/kamu, tanpa tanda pisah panjang, tanpa titik koma, tanpa kalimat tanya.
Label bukti: GK (gambar kerja), MD (model 3D), RF (referensi), ES (estimasi), HP (hipotesis)."""

LABEL = {"GK": "Gambar kerja", "MD": "Model 3D", "RF": "Referensi", "ES": "Estimasi", "HP": "Hipotesis"}

# ---------------------------------------------------------------- harga satuan (ESTIMASI, bisa diubah di halaman)
PRICE = {
    "jati_m3": 9_000_000, "sonokeling": 15_000, "cane_m2": 120_000, "kepar_m2": 150_000, "pitrit_m2": 140_000,
    "lurik_m2": 95_000, "kanvas_m2": 45_000, "isi_m3": 1_000_000, "felt": 3_000, "baut": 7_000, "murSilang": 13_000,
    "pen": 500, "sekrup": 500, "finishing_m2": 22_000, "perlengkapan": 75_000, "upah_jam": 30_000,
}
WASTE = 0.30      # susut potong kayu
MARGIN = 0.20     # margin dan cadangan

# ---------------------------------------------------------------- SELONJOR
SELONJOR = dict(
    slug="selonjor", nama="Selonjor", seri="A", gk="GK-A", urut=1,
    jenis="Kursi santai dengan dingklik",
    judul_halaman="Kursi Selonjor",
    tagline="Kursi santai untuk melambat",
    kartu="Kursi santai dari jati dan rotan. Dengan dingklik kamu selonjor, tanpa dingklik kamu duduk tegak dan berbincang.",
    meta="Kursi Selonjor: kursi santai dari jati dan rotan dengan dingklik. Model 3D yang bisa diputar, animasi sambungan dan cara rakit, gambar kerja, material, dan RAB.",
    model="assets/model/selonjor.json", poster="assets/img/pameran-selonjor.webp",
    grad=("#F6C879", "#E9955A"), warna="jati dan cane",
    fakta=[("Lebar", "660", "mm", "GK"), ("Dalam", "860", "mm", "GK"), ("Tinggi", "1000", "mm", "GK"),
           ("Tinggi dudukan", "370", "mm", "GK"), ("Berat rangka", "11", "kg", "GK")],
    fakta_kartu=["660 × 860 × 1000 mm", "Rangka jati ±11 kg", "Cane dan kepar"],
    fakta_catatan="Tinggi dudukan 370 mm diukur di tepi depan bantal saat kosong. Saat diduduki turun jadi sekitar 355 mm. Sudut dudukan 8°, sandaran 26° dari tegak.",
    arti_kata="Selonjor", arti="Duduk dengan kaki lurus ke depan.",
    arti_lain="Konsepnya kuberi nama Divantara Yutori. Divan adalah tempat duduk percakapan dari tradisi Persia, Turki, dan Inggris. Antara berarti di antara budaya, generasi, dan ritme. Yutori adalah kata Jepang untuk ruang yang lega.",
    lede="Di zaman serba cepat, orang butuh tempat untuk melambat. Tempat itu harus bisa dipakai semua usia tanpa rasa sungkan.",
    filosofi=[
        "Selonjor kubuat ulang dari jenis kursi lounge dan ottoman yang sudah dikenal dunia, dengan bahan dan kriya lokal. Rangkanya kayu jati, anyamannya rotan, dan semuanya dirancang supaya bisa dirawat dan diperbaiki.",
        "Kursi ini punya dua suasana. Dengan dingklik, kamu selonjor dan beristirahat. Tanpa dingklik, kamu duduk tegak dan berbincang. Satu kursi yang ikut berubah mengikuti suasana ruang.",
    ],
    prinsip=[
        ("Dua suasana", "Dingklik bisa dipanggil dan disingkirkan. Duduk tegak untuk berbincang, atau selonjor untuk istirahat.", "GK"),
        ("Bisa dibongkar dan dipasang", "Sandaran dan palang dipasang dengan baut tanpa lem. Kalau ada bagian yang rusak, cukup bagian itu yang diganti.", "GK"),
        ("Rangka tertutup dengan satu diagonal", "Diagonal menahan goyang depan dan belakang, dan bekerja menekan saat kamu bersandar.", "GK"),
        ("Dua anyaman, dua tugas", "Cane segi delapan yang berlubang dipakai di dudukan dan sandaran bawah supaya udara mengalir. Kepar yang rapat dipakai di sandaran atas.", "GK"),
    ],
    cek_struktur=dict(
        judul="Cek struktur dari gambar kerja",
        teks="Perkiraan di lembar GK-A02 untuk pengguna 100 kg. Titik berat orang yang duduk jatuh di dalam tapak kursi 0 sampai 860 mm, jadi kursi tidak terguling ke depan atau belakang. Beban dudukan 1300 N ditahan palang depan dan empat baut M8 di belakang. Tiang sandaran 30 × 40 mm menerima tegangan lentur sekitar 12 MPa pada dorongan 450 N, sedangkan kuat lentur jati sekitar 70 MPa.",
        label="ES"),
    hotspots=[
        dict(code="A2", side="kiri", judul="Pasak bor-tarik", teks="Pasak Ø8 menembus kayu dan purus. Lubangnya di purus dibor 1,5 mm lebih dekat ke bahu, jadi tiang tertarik rapat ke alas saat pasak dipukul masuk.", view="serong"),
        dict(code="A5", side="kanan", judul="Diagonal penahan goyang", teks="Diagonal tidak berpurus. Ia menumpu rapat di sudut dan dikunci tiga pen Ø8 × 40.", view="samping"),
        dict(code="A15", side=None, judul="Bantal kepala geser", teks="Bantal kepala diikat dua tali dan bisa digeser naik turun mengikuti tinggi badanmu.", view="home"),
        dict(code="A12", side=None, judul="Cane dan kepar", teks="Cane segi delapan di sandaran bawah, kepar yang rapat di sandaran atas. Keduanya masuk ke alur 5 × 8 mm lalu dikunci rotan pengunci.", view="belakang"),
    ],
    aksi=[
        dict(id="dingklik", label="Singkirkan dingklik", group="dingklik", move=[0.8, 0, 0.3], ms=1100),
        dict(id="kepala", label="Naikkan bantal kepala", codes=["A15"], move=[0, 0.135, -0.066], ms=900),
        dict(id="bantal", label="Angkat bantal duduk", codes=["A14"], move=[0, 0.4, 0], ms=1000),
    ],
    langkah=[
        dict(judul="Rangka samping kiri dan kanan", dur=1,
             teks="Tiang depan dan diagonal turun ke alas lebih dulu. Pen diagonal masuk dari atas. Lalu tiang belakang, lengan, dan pasak bor-tarik. Semua dilem dan diklem 24 jam.",
             chip=["Lem PVAc D3 atau epoksi", "Klem 24 jam"],
             parts=["A1", "A2", "A5", "A4", "A3"], dari="sisi"),
        dict(judul="Bingkai sandaran", dur=1, park=[0, 0.55, -0.25],
             teks="Empat rel berpurus 10 × 25 × 25 masuk ke dua tiang sandaran. Lembar cane dan kepar masuk ke alur 5 × 8 mm, lalu dikunci rotan pengunci.",
             chip=["Purus 10 × 25 × 25", "Alur 5 × 8 mm"],
             parts=["A7", "A8", "A12", "A13"], dari="atas"),
        dict(judul="Bingkai dudukan", dur=1, park=[0, 0.5, 0.35],
             teks="Rel bingkai dudukan disambung purus 8 × 30 × 30. Setelah kering, lembar cane dipasang di alur dan klos penyangga ikut direkat.",
             chip=["Purus 8 × 30 × 30"],
             parts=["A9", "A10", "A11", "A16"], dari="atas"),
        dict(judul="Palang dibaut ke rangka samping", dur=1,
             teks="Palang dudukan depan dan palang alas belakang dibaut ke rangka samping kanan, lalu ke rangka samping kiri. Tanpa lem, jadi bisa dibongkar lagi.",
             chip=["Baut M6 × 80", "Mur silang Ø10", "Pen Ø8 × 30"],
             parts=["A6"], dari="depan"),
        dict(judul="Sandaran turun dan dibaut", dur=1, join=1,
             teks="Bingkai sandaran dimasukkan dari atas. Empat baut M8, dua di tiap sisi dengan jarak 281 mm, mengunci sandaran ke lengan dan diagonal.",
             chip=["Baut M8 × 50", "Mur tanam M8"],
             parts=[], dari="atas"),
        dict(judul="Bingkai dudukan diletakkan", dur=1, join=2,
             teks="Bingkai dudukan duduk di atas palang depan dengan dua pen penuntun dan ditopang klos. Dua sekrup dari bawah klos menahannya.",
             chip=["Pen penuntun", "Sekrup dari bawah"],
             parts=[], dari="atas"),
        dict(judul="Bantal dan alas felt", dur=1,
             teks="Bantal dudukan dan bantal kepala dipasang terakhir supaya kainnya tidak kena lem, pernis, atau debu serutan. Alas felt direkat di bawah alas.",
             chip=["Lurik nila", "Isi sabut dan kapuk", "Felt 3 mm"],
             parts=["A14", "A15", "A17"], dari="atas"),
        dict(judul="Dingklik: kaki dan rel", dur=1,
             teks="Empat kaki, rel apron, dan palang bawah dilem dengan purus, lalu diklem sampai kering.",
             chip=["Rangka jati"],
             parts=["B1", "B2", "B3", "B4"], dari="atas"),
        dict(judul="Dingklik: bingkai atas dan cane", dur=1,
             teks="Bingkai atas bisa dilepas. Lembar cane segi delapan masuk ke alurnya, lalu alas felt direkat di ujung kaki.",
             chip=["Cane segi delapan", "Felt"],
             parts=["B5", "B6", "B7"], dari="atas"),
    ],
    sambungan=[
        dict(id="s1", judul="Tiang depan ke alas", builder="tenon-peg", label="GK",
             ringkas="Purus 10 × 30 × 30 dan pasak bor-tarik Ø8",
             params=dict(post=[30, 50], rail=[30, 50], tenon=[10, 30, 30], peg=8, drawbore=1.5, offset=15),
             spek=[("Purus", "10 × 30 × 30 mm", "GK"), ("Geser dari ujung", "15 mm", "GK"), ("Pasak bor-tarik", "Ø8 mm", "GK"), ("Lem", "PVAc D3 atau epoksi", "GK")],
             teks=["Purus adalah lidah di ujung tiang. Tebalnya 10 mm, sepertiga dari tebal kayu 30 mm. Lubangnya dibuat di alas sedalam 30 mm. Lebar purus 30 mm dan digeser 15 mm dari ujung, supaya kayu di ujung alas masih tersisa dan tidak pecah.",
                   "Pasak Ø8 menembus kayu dan purus. Lubang di purus dibor 1,5 mm lebih dekat ke bahu daripada lubang di alas. Saat pasak dipukul masuk, tiang tertarik rapat ke alas. Itu yang disebut bor-tarik.",
                   "Bidang lem jati dilap thinner dulu, karena minyak alami jati melemahkan lem."]),
        dict(id="s2", judul="Diagonal dan pen", builder="pens", label="GK",
             ringkas="Tanpa purus, dikunci tiga pen Ø8 × 40",
             params=dict(post=[30, 50], pen=[8, 40]),
             spek=[("Pen", "3 buah Ø8 × 40 mm", "GK"), ("Titik pen", "tiang depan, lengan, alas", "GK"), ("Purus", "tidak ada", "GK")],
             teks=["Diagonal tidak diberi purus karena tidak bisa dirakit dari dua arah. Ia menumpu rapat di sudut dan dikunci tiga pen Ø8 × 40, satu ke tiang depan, satu ke lengan, dan satu ke alas.",
                   "Pen mendatar di ujung atas menahan beban turun dari baut sandaran."]),
        dict(id="s3", judul="Palang bongkar-pasang", builder="bolt-cross", label="GK",
             ringkas="Baut M6 × 80, mur silang Ø10, dua pen Ø8 × 30",
             params=dict(post=[30, 50], rail=[30, 54], bolt=[6, 80], nut=[10, 15], pen=[8, 30]),
             spek=[("Baut", "M6 × 80 dengan ring", "GK"), ("Mur silang", "Ø10 × 15 mm", "GK"), ("Pen penuntun", "2 buah Ø8 × 30 mm", "GK"), ("Lubang benam", "Ø16, dalam 8 mm, ditutup sumbat kayu", "GK")],
             teks=["Baut masuk dari muka luar rangka, menembus tiang, lalu masuk ke ujung palang dan mengait mur silang. Mur silang adalah silinder berulir yang ditanam melintang di palang, lubangnya dibor dari sisi bawah palang.",
                   "Dua pen Ø8 × 30 di atas dan bawah baut dilem ke palang dan masuk 15 mm ke tiang. Pen ini menjaga palang tidak berputar. Sambungan ini tanpa lem, jadi palang bisa dilepas lagi."]),
        dict(id="s4", judul="Sandaran bongkar-pasang", builder="bolt-nut", label="GK",
             ringkas="Baut M8 × 50 dan mur tanam M8, dua di tiap sisi",
             params=dict(post=[30, 40], arm=[30, 50], bolt=[8, 50], nut=[11, 15]),
             spek=[("Baut", "M8 × 50 dengan ring", "GK"), ("Mur tanam", "M8 × 15, bor Ø11", "GK"), ("Jarak dua baut", "281 mm", "GK"), ("Jumlah", "4 baut, 2 di tiap sisi", "GK")],
             teks=["Tiang sandaran menempel di sisi dalam lengan dan diagonal. Baut M8 menembus lengan atau diagonal lalu masuk ke mur tanam di tiang sandaran. Kepala baut tenggelam di lubang benam Ø18 sedalam 8 mm dan ditutup sumbat kayu.",
                   "Empat baut ini memikul separuh beban dudukan belakang dan dorongan punggung. Karena itu dipakai M8, bukan M6."]),
    ],
    anyaman=["cane8", "kepar"],
    anyaman_pakai={"cane8": "Dudukan (A11), sandaran bawah (A12), dan atas dingklik (B6)", "kepar": "Sandaran atas (A13)"},
    lembar=[
        dict(src="assets/img/pameran-gk-a01.webp", no="GK-A01", judul="Proyeksi ortogonal", skala="1 : 10", ket="Tampak depan, samping, atas, dan perspektif dengan ukuran kayu jadi."),
        dict(src="assets/img/pameran-gk-a02.webp", no="GK-A02", judul="Tampak samping kanan dan letak sambungan", skala="1 : 5", ket="Enam sambungan bernomor, posisi lubang baut, dan cek struktur."),
        dict(src="assets/img/pameran-gk-a04.webp", no="GK-A04", judul="Detail sambungan rangka", skala="1 : 2", ket="Potongan sambungan rangka samping beserta catatan material."),
        dict(src="assets/img/pameran-gk-a05.webp", no="GK-A05", judul="Detail sambungan bongkar-pasang dan urutan rakit", skala="1 : 2", ket="Detail baut, mur silang, dan urutan perakitan."),
        dict(src="assets/img/pameran-gk-a07.webp", no="GK-A07", judul="Daftar komponen", skala="tanpa skala", ket="Tabel komponen Selonjor dan dingklik dengan ukuran jadi."),
    ],
    lembar_catatan="Lembar bergambar ini dari revisi 02 (13 November 2026). Nama dosen dan NIM di kop gambar sengaja ditutup.",
    model_catatan="Model 3D mengikuti revisi 01 (4 November 2026). Revisi 02 menyesuaikan beberapa ukuran kecil, misalnya lebar alas 50 mm (di model 47 mm).",
    komponen=[  # (kode, nama, jumlah, tebal, lebar, panjang, bahan, kind, keterangan)
        ("A1", "Alas (runner) rangka samping", 2, 30, 50, 860, "Jati", "kayu", "Sudut luar R20"),
        ("A2", "Tiang depan (kaki)", 2, 30, 50, 440, "Jati", "kayu", "Purus 10 × 30 × 30 di dua ujung"),
        ("A3", "Lengan", 2, 30, 50, 740, "Jati", "kayu", "Sudut R20, lubang baut sandaran"),
        ("A4", "Tiang belakang (miring 15°)", 2, 30, 50, 456, "Jati", "kayu", "Ujung dipotong serong"),
        ("A5", "Diagonal", 2, 30, 40, 877, "Jati", "kayu", "Pen Ø8 × 40 di tiga titik"),
        ("A6a", "Palang dudukan depan", 1, 30, 54, 600, "Jati", "kayu", "Baut M6 dan mur silang"),
        ("A6b", "Palang alas belakang", 1, 30, 50, 600, "Jati", "kayu", "Baut M6 dan mur silang"),
        ("A7", "Tiang sandaran", 2, 30, 40, 887, "Jati", "kayu", "Alur cane dan kepar"),
        ("A8", "Rel sandaran (bawah, tengah, atas)", 3, 30, 40, 520, "Jati", "kayu", "Purus ke tiang sandaran"),
        ("A8b", "Rel pengunci cane", 1, 30, 25, 520, "Jati", "kayu", "Mengunci cane di alur"),
        ("A9", "Rel bingkai dudukan (samping, depan, belakang)", 4, 25, 45, 430, "Jati", "kayu", "Alur cane 5 × 8"),
        ("A16", "Klos penyangga dudukan", 1, 20, 44, 520, "Jati", "kayu", "Lem dan sekrup"),
        ("A11", "Cane lembaran dudukan", 1, 3, 340, 446, "Rotan", "cane", "Pola segi delapan"),
        ("A12", "Cane lembaran sandaran bawah", 1, 3, 261, 536, "Rotan", "cane", "Pola segi delapan"),
        ("A13", "Anyaman kepar sandaran atas", 1, 3, 448, 536, "Kulit rotan", "kepar", "Pola ajiro"),
        ("A14", "Bantal dudukan", 1, 40, 435, 516, "Lurik nila", "bantal", "Isi sabut 15 mm dan kapuk 25 mm"),
        ("A15", "Bantal kepala geser dan 2 tali", 1, 90, 150, 360, "Lurik nila", "bantal", "Isi kapuk"),
        ("A17", "Alas felt", 4, 3, 26, 80, "Felt abu", "felt", "Direkat"),
        ("B1", "Kaki dingklik", 4, 30, 30, 322, "Jati", "kayu", ""),
        ("B2", "Rel samping apron", 2, 25, 50, 480, "Jati", "kayu", "Purus ke kaki"),
        ("B3", "Rel depan dan belakang apron", 2, 25, 50, 360, "Jati", "kayu", ""),
        ("B4", "Palang bawah dan tengah", 3, 25, 30, 480, "Jati", "kayu", ""),
        ("B5", "Bingkai atas lepas", 4, 25, 45, 540, "Jati", "kayu", "Sudut R30, alur cane"),
        ("B6", "Cane lembaran atas dingklik", 1, 3, 346, 466, "Rotan", "cane", "Pola segi delapan"),
        ("B7", "Alas felt dingklik", 4, 3, 24, 24, "Felt abu", "felt", ""),
    ],
    perangkat=[  # (uraian, jumlah, satuan, kunci harga)
        ("Baut M8 × 50, ring, dan mur tanam M8 (sandaran)", 4, "set", "baut"),
        ("Baut M6 × 80, ring, dan mur silang Ø10 (palang)", 4, "set", "murSilang"),
        ("Pen dan pasak kayu Ø8 (8 pasak, 6 pen diagonal, 8 pen palang)", 22, "buah", "pen"),
        ("Sekrup 4 × 40 (klos dan bingkai)", 8, "buah", "sekrup"),
    ],
    jam=[("Pekerjaan kayu: potong, serut, purus, rakit, finishing", 30), ("Memasang cane dan kepar", 8), ("Menjahit dan mengisi bantal", 4)],
    material=[
        dict(key="jati", nama="Jati kering oven", pakai="Seluruh rangka kursi dan dingklik", label="GK",
             teks="Kadar air 12 sampai 14 persen dengan serat lurus searah panjang batang. Kayu kering mengurangi susut dan retak setelah dirakit. Permukaan diberi minyak supaya serat tetap terasa. Bidang lem dilap thinner dulu, karena minyak alami jati melemahkan lem.",
             rawat="Beri minyak jati tipis setiap beberapa bulan. Lap dengan kain lembap, hindari air menggenang."),
        dict(key="cane", nama="Cane lembaran segi delapan", pakai="Dudukan, sandaran bawah, dan atas dingklik", label="GK",
             teks="Lembar anyaman dari serat kulit rotan, tebal 3 mm, berlubang segi delapan. Berlubang artinya sejuk dan ringan. Dipasang di alur 5 × 8 mm lalu dikunci rotan pengunci.",
             rawat="Bersihkan dengan sikat lembut. Kalau kendur, lap dengan air hangat dan biarkan kering di tempat teduh."),
        dict(key="kepar", nama="Kulit rotan anyaman kepar", pakai="Sandaran atas", label="GK",
             teks="Anyaman pola ajiro dari kulit rotan, rapat dan berarah diagonal. Dipilih untuk bagian punggung atas yang tidak perlu berlubang.",
             rawat="Sama dengan cane. Hindari sinar matahari langsung berjam-jam supaya warnanya tidak pudar."),
        dict(key="lurik", nama="Lurik nila", pakai="Bantal dudukan dan bantal kepala", label="GK",
             teks="Kain tenun bergaris khas Jawa yang dicelup nila. Bantal dudukan diisi sabut kelapa berkaret setebal 15 mm dan kapuk 25 mm. Bantal kepala diisi kapuk.",
             rawat="Sarung bantal sebaiknya dicuci tangan dengan sabun lembut. Nila bisa luntur pada pencucian pertama."),
        dict(key="felt", nama="Felt abu", pakai="Alas kaki kursi dan dingklik", label="GK",
             teks="Lapis felt setebal 3 mm direkat di bawah alas. Ia melindungi lantai dari goresan dan menambah tinggi kursi 3 mm.", rawat="Ganti kalau sudah tipis atau lepas."),
        dict(key="besi", nama="Baut dan mur baja galvanis", pakai="Sandaran dan palang", label="GK",
             teks="Baut M8 untuk sandaran, baut M6 dan mur silang Ø10 untuk palang. Kepala baut tenggelam di lubang benam dan ditutup sumbat kayu supaya rapi.", rawat="Kencangkan lagi bila terasa longgar."),
    ],
)

# ---------------------------------------------------------------- PINARAK
PINARAK = dict(
    slug="pinarak", nama="Pinarak", seri="B", gk="GK-B", urut=2,
    jenis="Kursi tamu",
    judul_halaman="Kursi Pinarak",
    tagline="Kursi yang mempersilakan duduk",
    kartu="Kursi tamu yang ringkas. Papan lengannya lebar, ada cekungan gelas di sisi kanan, dan kaki depannya menembus lengan.",
    meta="Kursi Pinarak: kursi tamu dari jati dengan purus tembus dan baji sonokeling, dudukan cane, dan zabuton lurik. Model 3D, cara rakit, gambar, material, dan RAB.",
    model="assets/model/pinarak.json", poster="assets/img/pameran-pinarak.webp",
    grad=("#E8B77A", "#9C5B4C"), warna="jati dan sonokeling",
    fakta=[("Lebar", "680", "mm", "MD"), ("Dalam", "660", "mm", "MD"), ("Tinggi", "760", "mm", "MD"),
           ("Cekungan Ø × dalam", "80 × 5", "mm", "MD")],
    fakta_kartu=["680 × 660 × 760 mm", "Purus tembus dan baji sonokeling", "Cekungan gelas di lengan kanan"],
    fakta_catatan="Ukuran diukur dari model 3D rancangan. Kanan dan kiri dilihat dari depan kursi, sama seperti di gambar kerja. Lembar gambar kerja seri GK-B yang memuat ukuran resmi bisa dipasang di bagian gambar kerja.", tampak_skala="1 : 10",
    arti_kata="Pinarak", arti="Kata Jawa halus untuk mempersilakan orang duduk atau singgah. Seperti dalam ucapan mangga pinarak.",
    arti_lain="",
    lede="Kursi untuk tamu. Begitu melihatnya, orang tahu tempat itu disiapkan untuknya.",
    filosofi=[
        "Pinarak kecil, tegak, dan terbuka. Papan lengannya lebar dan datar supaya ada tempat menaruh tangan dan gelas. Cekungan gelas hanya ada di lengan kanan, jadi satu sisi sengaja dibuat untuk teh yang disuguhkan.",
        "Ujung kaki depan menembus papan lengan lalu dikunci baji sonokeling yang gelap. Cara kursi ini dibuat tidak disembunyikan, malah menjadi hiasannya. Dudukan cane dan zabuton lurik yang tipis dan diikat di belakang menjaga duduknya tetap ringan dan sejuk.",
    ],
    prinsip=[
        ("Kursi untuk tamu", "Ukurannya ringkas dan posturnya tegak, cocok di ruang tamu kecil yang sering kedatangan orang.", "MD"),
        ("Sambungan yang diperlihatkan", "Purus kaki depan menembus papan lengan dan dikunci baji sonokeling. Gelapnya sonokeling membuat sambungan terbaca dari jauh.", "MD"),
        ("Satu sisi untuk gelas", "Cekungan bundar Ø80 mm dengan kedalaman 5 mm hanya ada di lengan kanan.", "MD"),
        ("Sandaran cane yang bisa dilepas", "Panel cane berbingkai terpisah dari rangka, jadi bisa dilepas kalau anyamannya perlu diperbaiki.", "HP"),
        ("Zabuton tipis", "Bantal lurik setebal sekitar 37 mm diikat di belakang supaya tidak bergeser.", "MD"),
    ],
    cek_struktur=None,
    hotspots=[
        dict(code="C13", side="kanan", judul="Purus tembus dan baji", teks="Kaki depan menembus papan lengan. Ujungnya dikunci baji sonokeling yang gelap.", view="serong"),
        dict(code="C3", side=None, re="cekungan", judul="Cekungan gelas", teks="Cekungan bundar Ø80 mm dan dalam 5 mm di papan lengan kanan.", view="atas"),
        dict(code="C11", side=None, judul="Panel cane sandaran", teks="Cane segi delapan di dalam bingkai yang terpisah dari rangka.", view="belakang"),
        dict(code="C12", side=None, judul="Zabuton lurik", teks="Bantal tipis dengan dua tali yang diikat ke rangka di belakang.", view="home"),
    ],
    aksi=[
        dict(id="zabuton", label="Angkat zabuton", codes=["C12"], move=[0, 0.4, 0], ms=1000),
        dict(id="sandaran", label="Lepas panel sandaran", codes=["C9", "C11"], move=[0, 0.3, -0.2], ms=1100),
        dict(id="baji", label="Cabut baji", codes=["C13"], move=[0, 0.07, 0], ms=800),
    ],
    langkah=[
        dict(judul="Rangka samping kiri dan kanan", dur=1,
             teks="Kaki depan, kaki belakang yang menyatu dengan tiang sandaran, rel dudukan samping, dan palang bawah dirakit jadi dua rangka samping.",
             chip=["Purus dan lem"],
             parts=["C1", "C2", "C5", dict(code="C7", re="samping")], dari="sisi"),
        dict(judul="Dua sisi disambung", dur=1,
             teks="Rel depan dan belakang dudukan serta palang bawah depan dan belakang menyambung kedua rangka samping menjadi satu badan kursi.",
             chip=["Rel dudukan", "Palang bawah"],
             parts=["C4", dict(code="C7", re="depan|belakang")], dari="depan"),
        dict(judul="Bingkai dudukan dan cane", dur=1,
             teks="Empat rel membentuk bingkai dudukan. Lembar cane masuk ke alurnya, lalu bingkai diletakkan di atas rel.",
             chip=["Cane segi delapan"],
             parts=["C8", "C10"], dari="atas"),
        dict(judul="Rel sandaran", dur=1,
             teks="Rel atas dan bawah sandaran dipasang di antara dua tiang sandaran.",
             chip=["Rel sandaran"],
             parts=["C6"], dari="belakang"),
        dict(judul="Panel cane sandaran", dur=1,
             teks="Bingkai cane dan lembar cane terpasang di sela rel sandaran. Panel ini terpisah dari rangka sehingga bisa dilepas.",
             chip=["Bingkai terpisah"],
             parts=["C9", "C11"], dari="belakang"),
        dict(judul="Papan lengan dan baji sonokeling", dur=1,
             teks="Papan lengan diturunkan ke ujung kaki depan. Purus tembus muncul di permukaan, lalu baji sonokeling dipukul masuk untuk mengunci.",
             chip=["Purus tembus", "Baji sonokeling"],
             parts=["C3", dict(code="C1", re="^purus"), "C13"], dari="atas"),
        dict(judul="Zabuton dan alas felt", dur=1,
             teks="Zabuton lurik diikat di belakang. Alas felt direkat di ujung keempat kaki.",
             chip=["Lurik nila", "Felt"],
             parts=["C12", "C15"], dari="atas"),
    ],
    sambungan=[
        dict(id="p1", judul="Purus tembus dengan baji", builder="wedge", label="MD",
             ringkas="Kaki depan menembus papan lengan, dikunci baji sonokeling",
             params=dict(leg=[35, 35], arm=[25, 100], tenon=[25, 20], wedge=[4, 20, 21]),
             spek=[("Kaki depan", "35 × 35 mm", "MD"), ("Papan lengan", "25 × 100 mm", "MD"), ("Purus tembus", "25 × 20 mm", "MD"), ("Baji sonokeling", "4 × 20 × 21 mm", "MD")],
             teks=["Kaki depan terus naik dan menembus papan lengan. Ujungnya tampak di atas papan sebagai persegi kecil, lalu dibelah dan diisi baji sonokeling yang gelap.",
                   "Baji mendesak purus melebar di dalam lubang, jadi sambungan terkunci rapat tanpa paku. Ukuran diambil dari model 3D. Cara kerja baji adalah teknik umum purus tembus."]),
        dict(id="p2", judul="Rel dudukan ke kaki", builder="tenon-peg", label="HP",
             ringkas="Purus sepertiga tebal kayu dengan pasak bor-tarik",
             params=dict(post=[25, 61], rail=[35, 35], tenon=[8, 30, 30], peg=8, drawbore=1.5, offset=0),
             spek=[("Rel dudukan", "25 × 61 mm", "MD"), ("Kaki", "35 × 35 mm", "MD"), ("Tebal purus", "8 mm, sepertiga tebal rel", "HP"), ("Pasak", "Ø8 mm bor-tarik", "HP")],
             teks=["Ilustrasi sambungan rel dudukan ke kaki memakai aturan yang sama dengan Selonjor, yaitu tebal purus sepertiga tebal kayu dan pasak bor-tarik.",
                   "Ukuran purus di sini hipotesis. Ukuran final mengikuti gambar kerja seri GK-B."]),
    ],
    anyaman=["cane8"],
    anyaman_pakai={"cane8": "Dudukan (C10) dan panel sandaran (C11)"},
    lembar=[],
    lembar_catatan="",
    model_catatan="",
    komponen=[
        ("C1", "Kaki depan dengan purus tembus", 2, 35, 35, 567, "Jati", "kayu", "Menembus papan lengan"),
        ("C2", "Kaki belakang menyatu tiang sandaran", 2, 35, 92, 770, "Jati", "kayu", "Ukuran terluar, bentuk miring"),
        ("C3", "Papan lengan", 2, 25, 100, 568, "Jati", "kayu", "Kanan berisi cekungan gelas Ø80"),
        ("C4", "Rel depan dan belakang dudukan", 2, 26, 62, 545, "Jati", "kayu", ""),
        ("C5", "Rel samping dudukan", 2, 25, 61, 356, "Jati", "kayu", ""),
        ("C6", "Rel atas dan bawah sandaran", 2, 25, 55, 545, "Jati", "kayu", ""),
        ("C7", "Palang bawah (2 samping, 2 depan dan belakang)", 4, 25, 35, 450, "Jati", "kayu", "Panjang rata-rata"),
        ("C8", "Rel bingkai dudukan", 4, 25, 45, 436, "Jati", "kayu", "Alur cane"),
        ("C9", "Bingkai cane sandaran", 4, 20, 30, 342, "Jati", "kayu", "Panjang rata-rata"),
        ("C13", "Baji sonokeling", 2, 4, 20, 21, "Sonokeling", "baji", "Mengunci purus tembus"),
        ("C10", "Cane lembaran dudukan", 1, 3, 343, 471, "Rotan", "cane", "Pola segi delapan"),
        ("C11", "Cane lembaran sandaran", 1, 3, 160, 497, "Rotan", "cane", "Pola segi delapan"),
        ("C12", "Zabuton dan 2 tali", 1, 37, 400, 539, "Lurik nila", "bantal", "Isi kapuk"),
        ("C15", "Alas felt", 4, 3, 29, 29, "Felt abu", "felt", ""),
    ],
    perangkat=[("Pasak kayu Ø8 (sambungan rel dan kaki)", 8, "buah", "pen"), ("Sekrup 4 × 40 (bingkai dan klos)", 8, "buah", "sekrup")],
    jam=[("Pekerjaan kayu: potong, serut, purus, rakit, finishing", 22), ("Memasang cane", 4), ("Menjahit dan mengisi zabuton", 2)],
    material=[
        dict(key="jati", nama="Jati muda berminyak", pakai="Rangka, papan lengan, dan bingkai", label="MD",
             teks="Kayu rangka dengan warna madu hangat dan permukaan diberi minyak. Ujung purus tembus memakai potongan ujung serat supaya terlihat rapi di atas papan lengan.",
             rawat="Beri minyak jati tipis setiap beberapa bulan. Lap dengan kain lembap."),
        dict(key="sonokeling", nama="Sonokeling", pakai="Baji pengunci purus tembus", label="MD",
             teks="Kayu keras berwarna cokelat tua keunguan. Dipakai sedikit saja sebagai baji kecil supaya kontrasnya mencolok di atas jati yang terang.",
             rawat="Cukup dilap. Warnanya akan makin dalam seiring waktu."),
        dict(key="cane", nama="Cane lembaran segi delapan", pakai="Dudukan dan panel sandaran", label="MD",
             teks="Lembar anyaman rotan tipis 3 mm yang berlubang segi delapan. Dudukan cane dibuat sejuk dan ringan, lalu ditutup zabuton tipis.",
             rawat="Bersihkan dengan sikat lembut. Hindari duduk berdiri di atas dudukan tanpa bantal."),
        dict(key="lurik", nama="Lurik nila", pakai="Zabuton", label="MD",
             teks="Bantal duduk tipis dari kain tenun bergaris yang dicelup nila, diikat dengan dua tali di belakang.",
             rawat="Cuci tangan dengan sabun lembut. Nila bisa luntur pada pencucian pertama."),
        dict(key="felt", nama="Felt abu", pakai="Alas keempat kaki", label="MD",
             teks="Lapis tipis yang melindungi lantai dari goresan.", rawat="Ganti kalau tipis atau lepas."),
    ],
)

# ---------------------------------------------------------------- SRAWUNG
SRAWUNG = dict(
    slug="srawung", nama="Srawung", seri="C", gk="GK-C", urut=3,
    jenis="Sofa dua dudukan dengan ottoman",
    judul_halaman="Sofa Srawung",
    tagline="Sofa untuk bertemu dan berbincang",
    kartu="Sofa dua dudukan dengan lengan kisi seperti koshi, alas anyaman pitrit, dan ottoman yang papannya bisa diangkat.",
    meta="Sofa Srawung: sofa dua dudukan dari jati dengan lengan kisi 17 bilah, alas pitrit, dan ottoman. Model 3D, cara rakit, anyaman rotan, material, dan RAB.",
    model="assets/model/srawung.json", poster="assets/img/pameran-srawung.webp",
    grad=("#8FA6F2", "#E9C98A"), warna="jati, pitrit, dan lurik",
    fakta=[("Lebar", "1400", "mm", "MD"), ("Dalam", "780", "mm", "MD"), ("Tinggi", "763", "mm", "MD"),
           ("Alas ottoman", "600 × 600", "mm", "MD")],
    fakta_kartu=["1400 × 780 × 763 mm", "34 bilah kisi di lengan", "Ottoman 600 × 600 mm"],
    fakta_catatan="Ukuran diukur dari model 3D rancangan. Kanan dan kiri dilihat dari depan sofa, sama seperti di gambar kerja. Lembar gambar kerja seri GK-C yang memuat ukuran resmi bisa dipasang di bagian gambar kerja.", tampak_skala="1 : 20",
    arti_kata="Srawung", arti="Kata Jawa untuk bergaul, bertemu, dan berinteraksi dengan sesama.",
    arti_lain="",
    lede="Sofa untuk keluarga yang sering berkumpul. Ringan dilihat, lapang diduduki.",
    filosofi=[
        "Lengan Srawung memakai bilah kayu tegak seperti kisi koshi pada rumah Jepang. Kisi membuat sofa terasa ringan, tetap memberi sandaran samping, dan menyaring cahaya sore jadi garis-garis di lantai.",
        "Dudukannya beralas anyaman pitrit yang bernapas, ditutup bantal kanvas abu muda dan putih tulang supaya tenang dipandang. Satu bantal hias lurik dan bantal kepala jepit memberi pilihan duduk. Ottoman di depannya punya papan atas yang bisa diangkat, jadi bagian dalamnya terjangkau tanpa membongkar apa pun.",
    ],
    prinsip=[
        ("Kisi yang ringan", "Tiap lengan berisi 17 bilah tegak 20 × 40 × 315 mm dengan jarak 39,4 mm. Rongganya hampir sama lebar dengan bilahnya.", "MD"),
        ("Alas yang bernapas", "Anyaman pitrit di bawah bantal membiarkan udara lewat, jadi dudukan tidak pengap.", "MD"),
        ("Bantal yang bisa diatur", "Dua bantal dudukan, dua bantal sandaran, satu bantal kepala jepit, dan satu bantal hias lurik.", "MD"),
        ("Ottoman dua guna", "Dipakai sebagai sandaran kaki, dan papan atasnya bisa diangkat untuk menjangkau bagian dalam.", "MD"),
    ],
    cek_struktur=None,
    hotspots=[
        dict(code="D4", side="kanan", judul="Kisi 17 bilah", teks="Bilah tegak 20 × 40 × 315 mm, 17 buah di tiap lengan, berjarak 39,4 mm.", view="samping"),
        dict(code="D7", side=None, judul="Alas pitrit", teks="Anyaman rotan bulat di bawah bantal dudukan. Udara bisa lewat dan alasnya rata.", view="atas"),
        dict(code="D14", side=None, judul="Bantal kepala jepit", teks="Bantal silinder yang dijepit kain ke sandaran dan bisa digeser.", view="home"),
        dict(code="E3", side=None, judul="Papan ottoman", teks="Papan atas yang bisa diangkat.", view="serong"),
    ],
    aksi=[
        dict(id="ottoman", label="Rapatkan ottoman", group="ottoman", move=[-0.4, 0, -0.35], ms=1100),
        dict(id="papan", label="Angkat papan ottoman", codes=["E3", "E6"], move=[0, 0.3, 0], ms=1000),
        dict(id="bsandaran", label="Angkat bantal sandaran", codes=["D13"], move=[0, 0.28, 0.0], ms=1000),
        dict(id="kepalaS", label="Naikkan bantal kepala", codes=["D14"], move=[0, 0.12, 0], ms=800),
    ],
    langkah=[
        dict(judul="Kaki dan rel panel lengan", dur=1,
             teks="Dua kaki dan rel atas bawah dirangkai menjadi dua panel lengan, kiri dan kanan.",
             chip=["Rel bawah 45 × 60", "Rel atas 40 × 45"],
             parts=["D1", "D2"], dari="sisi"),
        dict(judul="Tujuh belas bilah kisi tiap lengan", dur=1, stag=0.5,
             teks="Bilah tegak 20 × 40 × 315 mm masuk satu per satu di antara rel atas dan bawah. Jaraknya 39,4 mm, jadi rongga di antaranya hampir sama lebar dengan bilah.",
             chip=["34 bilah", "Jarak 39,4 mm"],
             parts=["D4"], dari="atas"),
        dict(judul="Tutup lengan", dur=1,
             teks="Papan tutup lengan dipasang di atas kisi dan menyatukan bilah.",
             chip=["Papan 25 × 100"],
             parts=["D3"], dari="atas"),
        dict(judul="Rel dudukan dan bingkai alas", dur=1,
             teks="Rel depan dan belakang menyambung dua panel lengan. Bingkai alas dan lis penyangga dipasang di antaranya.",
             chip=["Rel 25 × 130"],
             parts=["D5", "D6"], dari="depan"),
        dict(judul="Anyaman pitrit alas", dur=1,
             teks="Dua lembar anyaman pitrit diletakkan di bingkai alas sebagai dasar bantal.",
             chip=["Pitrit"],
             parts=["D7"], dari="atas"),
        dict(judul="Sandaran dan panel cane", dur=1,
             teks="Tiang sandaran, rel, klos penghubung, dan dua panel cane dipasang di belakang.",
             chip=["Cane segi delapan"],
             parts=["D8", "D9", "D10", "D11"], dari="belakang"),
        dict(judul="Bantal", dur=1,
             teks="Bantal dudukan, bantal sandaran, bantal kepala jepit, dan bantal hias lurik dipasang terakhir.",
             chip=["Kanvas abu muda", "Kanvas putih tulang", "Lurik nila"],
             parts=["D12", "D13", "D14", "D15"], dari="atas"),
        dict(judul="Alas felt sofa", dur=1,
             teks="Alas felt direkat di bawah keempat kaki.",
             chip=["Felt"],
             parts=["D16"], dari="bawah"),
        dict(judul="Ottoman: rangka dan cane", dur=1,
             teks="Empat tiang dan rel bawah atas dirangkai, lalu empat panel cane dipasang di sisinya.",
             chip=["Cane segi delapan"],
             parts=["E1", "E2", "E4"], dari="atas"),
        dict(judul="Ottoman: papan dan bantal", dur=1,
             teks="Lis penyangga, papan atas yang bisa diangkat, bantal, dan alas felt dipasang paling akhir.",
             chip=["Papan lepas"],
             parts=["E5", "E3", "E6", "E7"], dari="atas"),
    ],
    sambungan=[
        dict(id="r1", judul="Panel kisi 17 bilah", builder="slats", label="MD",
             ringkas="Bilah 20 × 40 × 315 mm, jarak 39,4 mm",
             params=dict(count=17, slat=[20, 40, 315], pitch=39.4, rail=[45, 60]),
             spek=[("Bilah", "20 × 40 × 315 mm", "MD"), ("Jumlah", "17 per lengan", "MD"), ("Jarak antar bilah", "39,4 mm", "MD"), ("Cara sambung ke rel", "purus pendek, ukuran hipotesis", "HP")],
             teks=["Setiap lengan dibuat dari 17 bilah tegak yang diapit rel atas dan bawah. Rongga antar bilah sekitar 19 mm, hampir sama dengan lebar bilah 20 mm.",
                   "Ukuran bilah dan jaraknya diambil dari model 3D. Animasi memperlihatkan bilah masuk ke rel dengan purus pendek, dan detail purus menunggu gambar kerja seri GK-C."]),
        dict(id="r2", judul="Rel dan kaki lengan", builder="tenon-peg", label="HP",
             ringkas="Purus dengan pasak bor-tarik",
             params=dict(post=[45, 60], rail=[45, 45], tenon=[15, 35, 40], peg=8, drawbore=1.5, offset=0),
             spek=[("Kaki", "45 × 45 mm", "MD"), ("Rel bawah", "45 × 60 mm", "MD"), ("Tebal purus", "15 mm, sepertiga tebal rel", "HP"), ("Pasak", "Ø8 mm bor-tarik", "HP")],
             teks=["Ilustrasi sambungan rel ke kaki dengan aturan sepertiga tebal dan pasak bor-tarik, sama seperti pada Selonjor.",
                   "Ukuran purus hipotesis. Ukuran final mengikuti gambar kerja seri GK-C."]),
    ],
    anyaman=["pitrit", "cane8"],
    anyaman_pakai={"pitrit": "Alas dudukan sofa (D7)", "cane8": "Sandaran sofa (D10) dan empat sisi ottoman (E4)"},
    lembar=[],
    lembar_catatan="",
    model_catatan="",
    komponen=[
        ("D1", "Kaki panel lengan", 4, 45, 45, 552, "Jati", "kayu", ""),
        ("D2", "Rel bawah panel lengan", 2, 45, 60, 690, "Jati", "kayu", ""),
        ("D2b", "Rel atas panel lengan", 2, 40, 45, 690, "Jati", "kayu", ""),
        ("D3", "Papan tutup lengan", 2, 25, 100, 780, "Jati", "kayu", ""),
        ("D4", "Bilah kisi", 34, 20, 40, 315, "Jati", "kayu", "17 per lengan"),
        ("D5", "Rel depan dan belakang dudukan", 2, 25, 130, 1255, "Jati", "kayu", ""),
        ("D6", "Bingkai alas depan dan belakang", 2, 30, 40, 1200, "Jati", "kayu", ""),
        ("D6b", "Bingkai alas melintang", 3, 30, 40, 465, "Jati", "kayu", ""),
        ("D6c", "Lis penyangga bantal", 2, 20, 25, 1195, "Jati", "kayu", ""),
        ("D8", "Tiang sandaran", 3, 40, 40, 460, "Jati", "kayu", "2 tiang 487 dan 1 tiang tengah 407"),
        ("D9", "Rel sandaran", 2, 49, 49, 1120, "Jati", "kayu", ""),
        ("D11", "Klos penghubung sandaran", 2, 28, 40, 60, "Jati", "kayu", ""),
        ("D7", "Anyaman pitrit alas", 2, 8, 477, 567, "Rotan pitrit", "pitrit", "Dua lembar"),
        ("D10", "Cane lembaran sandaran", 2, 3, 423, 556, "Rotan", "cane", "Pola segi delapan"),
        ("D12", "Bantal dudukan", 2, 146, 540, 597, "Kanvas abu muda", "bantal", ""),
        ("D13", "Bantal sandaran", 2, 166, 300, 588, "Kanvas putih tulang", "bantal", ""),
        ("D14", "Bantal kepala jepit", 1, 130, 130, 360, "Kanvas abu muda", "bantal", "Dengan kain penjepit"),
        ("D15", "Bantal hias lurik", 1, 126, 290, 320, "Lurik nila", "bantal", ""),
        ("D16", "Alas felt sofa", 4, 3, 39, 39, "Felt abu", "felt", ""),
        ("E1", "Tiang ottoman", 4, 40, 40, 297, "Jati", "kayu", ""),
        ("E2", "Rel bawah dan atas ottoman", 8, 30, 40, 520, "Jati", "kayu", ""),
        ("E3", "Papan atas ottoman (bisa diangkat)", 1, 20, 524, 530, "Jati", "kayu", ""),
        ("E5", "Lis penyangga papan", 1, 20, 20, 530, "Jati", "kayu", ""),
        ("E4", "Cane lembaran sisi ottoman", 4, 3, 215, 530, "Rotan", "cane", "Pola segi delapan"),
        ("E6", "Bantal ottoman", 1, 96, 580, 580, "Kanvas abu muda", "bantal", ""),
        ("E7", "Alas felt ottoman", 4, 3, 39, 39, "Felt abu", "felt", ""),
    ],
    perangkat=[("Pen dan sekrup penyambung (kisi, sandaran, ottoman)", 60, "buah", "sekrup"), ("Pasak kayu Ø8 (rel dan kaki)", 16, "buah", "pen")],
    jam=[("Pekerjaan kayu: potong, serut, purus, 34 bilah, rakit, finishing", 46), ("Memasang cane dan menganyam pitrit", 12), ("Menjahit dan mengisi bantal", 10)],
    material=[
        dict(key="jati", nama="Jati muda berminyak", pakai="Rangka sofa, kisi lengan, dan ottoman", label="MD",
             teks="Rangka terbuka berwarna madu. Bilah kisi 20 × 40 mm dibuat dari kayu yang sama supaya warnanya menyatu dengan rangka.",
             rawat="Beri minyak jati tipis setiap beberapa bulan. Lap dengan kain lembap."),
        dict(key="pitrit", nama="Pitrit rotan", pakai="Alas dudukan sofa", label="MD",
             teks="Inti rotan bulat setebal sekitar 3,5 mm yang dianyam satu-satu. Hasilnya alas yang rata dan bernapas di bawah bantal.",
             rawat="Bersihkan debu dengan sikat lembut. Jangan menaruh beban sempit dan tajam langsung di alas."),
        dict(key="cane", nama="Cane lembaran segi delapan", pakai="Sandaran sofa dan sisi ottoman", label="MD",
             teks="Lembar anyaman rotan setebal 3 mm yang berlubang segi delapan. Dipakai di sandaran dan keempat sisi ottoman supaya terasa ringan.",
             rawat="Bersihkan dengan sikat lembut. Hindari benturan benda keras."),
        dict(key="kanvas_abu", nama="Kanvas katun abu muda", pakai="Bantal dudukan, bantal kepala, dan bantal ottoman", label="MD",
             teks="Kain polos yang tenang. Warna abu muda memberi latar netral bagi jati dan rotan.",
             rawat="Sarung bisa dilepas dan dicuci sesuai petunjuk kain."),
        dict(key="kanvas_putih", nama="Kanvas katun putih tulang", pakai="Bantal sandaran", label="MD",
             teks="Putih tulang yang hangat, sedikit lebih terang dari bantal dudukan supaya sandaran terbaca sebagai bidang tersendiri.",
             rawat="Cuci terpisah dan jemur di tempat teduh."),
        dict(key="lurik", nama="Lurik nila", pakai="Bantal hias", label="MD",
             teks="Satu-satunya bantal bermotif. Garis lurik nila memberi satu titik gelap di antara bantal yang terang.",
             rawat="Cuci tangan dengan sabun lembut. Nila bisa luntur pada pencucian pertama."),
        dict(key="felt", nama="Felt abu", pakai="Alas kaki sofa dan ottoman", label="MD",
             teks="Lapis tipis yang melindungi lantai dari goresan.", rawat="Ganti kalau tipis atau lepas."),
    ],
)

CHAIRS = [SELONJOR, PINARAK, SRAWUNG]
BY_SLUG = {c["slug"]: c for c in CHAIRS}

# ---------------------------------------------------------------- SUASANA RUANG (visualisasi AI, Gemini)
# Semua gambar ini dibuat dengan AI mengikuti rancangan. Bukan foto kursi jadi.
# Berkas: assets/img/pameran-suasana-<kunci>-m.webp (1100 px, kisi) dan -l.webp (1900 px, layar penuh).
SUASANA = {
    "teras-tiga": dict(w=1900, h=1061, cap="Tiga kursi di teras sore",
        alt="Visualisasi AI. Teras dengan cahaya sore. Selonjor dan dingkliknya di depan, Pinarak di belakang kanannya, dan sisi Srawung di tepi kanan. Semua dudukan berbantal lurik nila."),
    "ruang-malam": dict(w=1900, h=1061, cap="Ruang tamu, malam",
        alt="Visualisasi AI. Ruang tamu pada malam hari dengan lampu hangat. Sofa dua dudukan di kanan, Selonjor dan dingklik di depan sekat kisi kayu, rak buku, dan tiga bingkai di dinding."),
    "ruang-siang": dict(w=1900, h=1061, cap="Ruang tamu, siang",
        alt="Visualisasi AI. Ruang tamu yang sama pada siang hari. Sofa dua dudukan berbantal biru nila, Selonjor dengan dingklik, sekat kisi kayu, dan rak buku."),
    "teras-lengan": dict(w=1900, h=1061, cap="Teras, Selonjor dan kursi lengan",
        alt="Visualisasi AI. Teras menghadap taman. Selonjor dengan dingklik, kursi lengan berbantal krem di sebelah kirinya, meja bundar dengan set teh, dan kendi tanah liat."),
    "taman-sore": dict(w=1900, h=1061, cap="Teras taman, sore",
        alt="Visualisasi AI. Teras kayu menghadap taman pada sore hari. Selonjor dengan dingklik di atas karpet anyaman, meja bundar dengan set teh, dan meja kayu berisi kendi di sebelah kiri."),
    "taman-jendela": dict(w=1900, h=1061, cap="Teras taman, jendela kisi menyala",
        alt="Visualisasi AI. Selonjor dengan dingklik di teras. Jendela kisi kayu di belakangnya menyala hangat, di samping tanaman dalam pot beton dan kendi berisi ranting kering."),
    "taman-terang": dict(w=1900, h=1061, cap="Teras taman, senja",
        alt="Visualisasi AI. Suasana yang sama dengan cahaya senja yang lebih terang. Selonjor, dingklik, tanaman dalam pot beton, dan jendela kisi kayu."),
    "taman-siang": dict(w=1900, h=936, cap="Teras taman, siang",
        alt="Visualisasi AI. Teras taman pada siang hari. Selonjor dengan dingklik, meja bundar dengan set teh, meja kayu dengan kendi, dan pagar kayu di belakangnya."),
    "pojok-siang": dict(w=1900, h=932, cap="Pojok baca, siang",
        alt="Visualisasi AI. Pojok membaca dekat pintu kaca. Selonjor dengan dingklik, meja kecil dengan lampu dan buku, rak buku di belakang, dan tanaman dalam pot putih."),
    "pojok-malam": dict(w=1900, h=1061, cap="Pojok baca, malam",
        alt="Visualisasi AI. Pojok membaca yang sama pada malam hari. Lampu dinding dan lampu meja menyala."),
}
SUASANA_URUT = ["teras-tiga", "ruang-malam", "ruang-siang", "teras-lengan", "taman-sore", "taman-jendela", "taman-terang", "taman-siang", "pojok-siang", "pojok-malam"]

# gambar yang tampil di halaman tiap kursi (urutan = urutan tampil, yang pertama jadi gambar besar)
SELONJOR["suasana"] = ["teras-tiga", "pojok-siang", "pojok-malam", "taman-sore", "taman-jendela", "taman-siang"]
PINARAK["suasana"] = ["teras-tiga", "teras-lengan"]
SRAWUNG["suasana"] = ["ruang-malam", "ruang-siang"]
SELONJOR["suasana_lede"] = "Selonjor muncul di semua gambar suasana. Dengan dingklik ia jadi tempat istirahat di pojok baca atau teras."
PINARAK["suasana_lede"] = "Pinarak menyambut tamu dari sisi seberang Selonjor. Di teras sore ia duduk di tengah, di antara Selonjor dan sofa."
SRAWUNG["suasana_lede"] = "Srawung jadi tempat berkumpul di ruang tamu, dengan Selonjor di sisi lainnya."

# sketsa tangan (dari tugas Desain Mebel I). Kolom judul dengan NIM dan catatan dosen sudah dipotong dari gambar.
SELONJOR["sketsa"] = dict(
    src="assets/img/pameran-sketsa-selonjor.webp", w=1087, h=684,
    alt="Sketsa spidol Selonjor dengan dingklik. Catatan tulisan tangan menyebut rangka kayu solid, anyaman cane rotan, anyaman kepar kulit rotan, bantal kepala geser, bantal kapuk dan sabut kelapa, baut tanam M6, dan alas felt. Di kanan ada sketsa tampak samping dengan sudut 108 derajat.",
    judul="Sketsa awal",
    cap="Sketsa spidol sebagai titik awal, dikerjakan untuk tugas Desain Mebel I. Catatan di pinggir gambar sudah menyebut bahan dan sambungan yang kemudian dirinci di gambar kerja. Ukuran final ada di bagian Gambar kerja.")
PINARAK["sketsa"] = None
SRAWUNG["sketsa"] = None

# ---------------------------------------------------------------- anyaman (sama untuk semua kursi)
WEAVES = {
    "cane8": dict(nama="Cane segi delapan", label="RF",
        ringkas="Lembar anyaman berlubang segi delapan",
        teks=["Cane lembaran dibuat dari serat kulit rotan yang dibelah tipis. Dasarnya serat tegak dan serat mendatar berpasangan yang saling menyilang selang-seling. Lalu serat diagonal lebar dari dua arah berlawanan memotong sudut tiap lubang persegi, sehingga bentuk lubangnya segi delapan.",
              "Proses pengrajin sebenarnya lebih rinci. Animasi ini menyederhanakan urutan dasarnya."],
        langkah=["Serat tegak dibentangkan", "Serat mendatar menyilang selang-seling", "Serat diagonal dari kiri bawah ke kanan atas", "Serat diagonal dari arah lawan menutup sudut lubang"]),
    "kepar": dict(nama="Kepar (ajiro)", label="RF",
        ringkas="Anyaman diagonal loncat dua",
        teks=["Pada anyaman kepar, tiap serat naik di atas dua serat lalu turun di bawah dua serat. Loncatannya bergeser satu serat di tiap baris, jadi muncul garis diagonal yang rapat.",
              "Di tengah sandaran arah diagonalnya dibalik sehingga polanya membentuk panah, seperti pada gambar kerja Selonjor."],
        langkah=["Serat tegak dibentangkan", "Serat mendatar naik dua turun dua, bergeser satu serat tiap baris", "Arah diagonal dibalik di tengah menjadi panah"]),
    "pitrit": dict(nama="Pitrit", label="MD",
        ringkas="Inti rotan bulat dianyam satu-satu",
        teks=["Pitrit adalah inti rotan yang bulat. Pada alas sofa tebalnya sekitar 3,5 mm. Anyamannya sederhana, satu serat naik lalu satu serat turun, jadi permukaannya rata dan kuat menahan bantal.",
              "Celah di antara serat membiarkan udara lewat sehingga bantal di atasnya tidak pengap."],
        langkah=["Serat tegak dibentangkan", "Serat mendatar disilangkan satu naik satu turun", "Anyaman dirapatkan sampai rata"]),
}

# ---------------------------------------------------------------- hitung RAB dari daftar komponen
def hitung(c):
    kayu_m3 = baji = 0.0
    cane = kepar = pitrit = 0.0
    kain_lurik = kain_kanvas = isi_m3 = 0.0
    felt = 0
    luas_kayu = 0.0
    for kode, nama, q, t, w, L, bahan, kind, ket in c["komponen"]:
        if kind == "kayu":
            kayu_m3 += q * (t + 5) * w * (L + 20) / 1e9
            luas_kayu += q * 2 * (t * w + t * L + w * L) / 1e6
        elif kind == "baji":
            baji += q
        elif kind == "cane":
            cane += q * w * L / 1e6
        elif kind == "kepar":
            kepar += q * w * L / 1e6
        elif kind == "pitrit":
            pitrit += q * w * L / 1e6
        elif kind == "bantal":
            isi_m3 += q * t * w * L / 1e9
            luas = q * (2 * w * L + 2 * t * (w + L)) / 1e6 * 1.2
            if "Lurik" in bahan:
                kain_lurik += luas
            else:
                kain_kanvas += luas
        elif kind == "felt":
            felt += q
    return dict(kayu_m3=kayu_m3, baji=baji, cane=cane, kepar=kepar, pitrit=pitrit, lurik=kain_lurik, kanvas=kain_kanvas,
                isi_m3=isi_m3, felt=felt, luas_kayu=luas_kayu)


def rab_baris(c):
    h = hitung(c)
    P = PRICE
    baris = []   # (grup, id, uraian, qty, satuan, harga, tandaSusut, ket, label)
    baris.append(("Kayu", "kayu", "Jati kering oven, volume kasar (tebal + 5 mm, panjang + 20 mm)", round(h["kayu_m3"], 4), "m³", P["jati_m3"], True, "Ditambah susut potong yang bisa kamu atur", "ES"))
    if h["baji"]:
        baris.append(("Kayu", "baji", "Baji sonokeling", int(h["baji"]), "buah", P["sonokeling"], False, "Sisa potongan kecil", "ES"))
    if h["cane"]:
        baris.append(("Anyaman rotan", "cane", "Cane lembaran segi delapan", round(h["cane"] * 1.15, 3), "m²", P["cane_m2"], False, "Luas dari daftar komponen + 15 persen cadangan", "ES"))
    if h["kepar"]:
        baris.append(("Anyaman rotan", "kepar", "Kulit rotan anyaman kepar", round(h["kepar"] * 1.15, 3), "m²", P["kepar_m2"], False, "Luas + 15 persen cadangan", "ES"))
    if h["pitrit"]:
        baris.append(("Anyaman rotan", "pitrit", "Anyaman pitrit", round(h["pitrit"] * 1.15, 3), "m²", P["pitrit_m2"], False, "Luas + 15 persen cadangan", "ES"))
    if h["lurik"]:
        baris.append(("Kain dan isi bantal", "lurik", "Kain lurik nila", round(h["lurik"], 3), "m²", P["lurik_m2"], False, "Luas permukaan bantal + 20 persen jahitan", "ES"))
    if h["kanvas"]:
        baris.append(("Kain dan isi bantal", "kanvas", "Kanvas katun", round(h["kanvas"], 3), "m²", P["kanvas_m2"], False, "Luas permukaan bantal + 20 persen jahitan", "ES"))
    baris.append(("Kain dan isi bantal", "isi", "Isi bantal (sabut kelapa berkaret dan kapuk)", round(h["isi_m3"], 4), "m³", P["isi_m3"], False, "Isi sofa belum ditentukan, memakai hipotesis yang sama dengan Selonjor" if c["slug"] != "selonjor" else "Isi sabut 15 mm dan kapuk 25 mm", "ES"))
    for uraian, q, sat, key in c["perangkat"]:
        baris.append(("Perlengkapan", key + str(len(baris)), uraian, q, sat, P[key], False, "", "ES"))
    baris.append(("Perlengkapan", "felt", "Alas felt", h["felt"], "buah", P["felt"], False, "", "ES"))
    baris.append(("Perlengkapan", "kecil", "Lem PVAc dan epoksi, amplas, thinner", 1, "paket", P["perlengkapan"], False, "", "ES"))
    baris.append(("Finishing", "finishing", "Minyak finishing untuk seluruh permukaan kayu", round(h["luas_kayu"], 2), "m²", P["finishing_m2"], False, "Luas dari daftar komponen", "ES"))
    return baris, h


def upah_baris(c):
    return [(u, j) for u, j in c["jam"]]


if __name__ == "__main__":
    for c in CHAIRS:
        b, h = rab_baris(c)
        total = 0
        for g, i, u, q, s, hrg, sus, k, l in b:
            qq = q * (1 + WASTE) if sus else q
            total += qq * hrg
        jam = sum(j for _, j in c["jam"])
        upah = jam * PRICE["upah_jam"]
        hpp = total + upah
        print(c["slug"], "bahan %.0f upah %.0f hpp %.0f harga %.0f" % (total, upah, hpp, hpp * (1 + MARGIN)), "kayu m3 %.4f" % h["kayu_m3"], "jam", jam)
