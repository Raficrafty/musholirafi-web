# Generator halaman Pameran

Empat halaman pameran (`pameran.html`, `kursi-selonjor.html`, `kursi-pinarak.html`, `kursi-srawung.html`) dan `assets/js/pameran-data.js` dibuat oleh skrip di folder ini. Situsnya sendiri tetap statis dan tidak punya build step. Skrip ini hanya dijalankan kalau isi pameran berubah.

## Berkas

- `chairs.py`: semua isi kursi (nama, filosofi, material, sambungan, anyaman, gambar kerja, rincian biaya, gambar suasana, sketsa). Ubah teks dan angka di sini.
- `gen_site.py`: merangkai HTML dari `chairs.py`. Header, footer, dan dialog diambil dari `karya.html`, jadi hasilnya selalu sama dengan situs.

## Cara menjalankan

Dari akar repo (butuh Python 3, tanpa paket tambahan):

```
python3 tools/pameran/gen_site.py
```

Kalau berhasil, skrip mencetak `selesai` dan menimpa lima berkas hasil. Jangan mengedit kelima berkas itu langsung, karena akan tertimpa saat generator dijalankan lagi. Kalau header atau footer di `karya.html` berubah, jalankan ulang generatornya supaya keempat halaman ikut berubah.

## Aturan isi

- Label bukti: UKUR GK (diambil dari gambar kerja), UKUR 3D (diukur dari model), REFERENSI, ESTIMASI, HIPOTESIS, dan VISUALISASI AI.
- Tidak ada nama dosen, NIM, atau wajah pemilik di halaman pameran.
- Gambar suasana adalah visualisasi AI dan tidak boleh diberi label lain.
- Kursi masih rancangan. Jangan menulis "sudah dibuat" sebelum ada foto kursi jadi.

## Menambah gambar suasana

1. Simpan dua berkas WebP di `assets/img/`: `pameran-suasana-<kunci>-m.webp` (lebar 1100 px, untuk galeri) dan `pameran-suasana-<kunci>-l.webp` (lebar 1900 px, untuk layar penuh).
2. Tambah satu entri di `SUASANA` pada `chairs.py` (lebar dan tinggi berkas besar, keterangan pendek, teks alternatif) dan masukkan kuncinya ke `SUASANA_URUT`.
3. Kalau gambarnya mau tampil di halaman kursi tertentu, masukkan kuncinya ke daftar `suasana` kursi itu.
4. Jalankan generatornya.
