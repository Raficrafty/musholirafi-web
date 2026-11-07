# CLAUDE.md · Website musholirafi.com (v3)

File ini dibaca otomatis oleh Claude Code setiap kali sesi dibuka di repo ini. Isinya konteks permanen, jadi pemilik tidak perlu menjelaskan ulang dari nol.

## Pemilik
- Musholi Rafi (nama lengkap Musholi Rafi Nurtova, panggilan Rafi), mahasiswa Program Studi Desain Interior ISI Yogyakarta.
- Mimpi: menjadi dosen lalu profesor. Khawatir teknologi dan AI membuat orang malas berpikir.
- Kekuatan: berpikir kritis, rasional, dan berbasis data di lingkungan kampus seni yang banyak berangkat dari rasa.
- Menjual ilmu: modul, buku (penulis pemula, terbit mandiri, belum di penerbit besar), jurnal, dan bimbel privat lewat Discord (ergonomi, software desain, AI, cara belajar).
- Toko lama di Lynk (lynk.id/catatankuliah.di). Newsletter di Substack (musholirafi.substack.com). LinkedIn: linkedin.com/in/musholirafi.

## Pasar dan pesan utama
- Target 90 persen mahasiswa Desain Interior ISI Yogyakarta (semua angkatan) dan dosennya, 10 persen publik.
- Pesan utama: "Desain pakai rasa. Jelaskan pakai data."
- Sistem nilai: beri manfaat dulu (catatan dan modul gratis), lalu orang membeli sebagai bentuk dukungan.
- Strategi lengkap (SWOT, segmentasi, saluran) ada di `STRATEGI-SWOT.md` di luar folder situs.

## Struktur repo
- `index.html`: halaman utama. Teks penting ditulis langsung di HTML supaya terbaca mesin pencari.
- `cerita.html`: cerita lengkap. `kebijakan-privasi.html`, `404.html`, `maintenance.html` (tidak diindeks, tidak masuk sitemap).
- `assets/files/`: file gratis yang bisa langsung diunduh (misal `lembar-tujuan-3-bulan.pdf`).
- `assets/css/style.css`: semua gaya. Token warna di `:root`, versi gelap di `@media (prefers-color-scheme:dark)` dan `:root[data-theme="dark"]`.
- `assets/js/data.js`: SEMUA isi yang sering berubah (produk, harga, diskon, edisi musim, event, bimbel, kontak, FAQ, testimoni). Ubah data di sini, jangan menulis ulang HTML.
- `assets/js/main.js`: mesin website (animasi scroll, edisi musim, partikel, diskon, toko, keranjang, checkout, lembar rasa dan data, slideshow residensial, denah ilmu yang bisa dibuka, grafik, buku yang terbuka saat di-scroll). Semua fitur dicek dulu keberadaan elemennya, jadi aman dipakai di halaman turunan.
- `assets/img/`: maskot, gambar kerja residensial, ikon, `og-image.png` (1200 × 630).
- `favicon.ico` (16, 32, 48 px) dan `assets/img/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png`: ikon maskot untuk tab browser dan hasil pencarian Google. `favicon.svg` hanya cadangan berisi gambar maskot yang sama. Lalu `site.webmanifest`, `robots.txt`, `sitemap.xml`.
- Tidak ada build step.

## Cara mengubah isi (di `data.js`)
- Produk `cat: "catatan"` (Catatan Semester 1) tidak tampil di toko utama. Mereka tampil di bagian "Khusus mahasiswa baru" (`#maba` di index.html), dikelompokkan per `subject` (nama mata kuliah). Diatur lewat `MABA_CAT` di main.js.
- Tidak ada lagi label "contoh". Yang belum siap diberi `soon: true` (tampil "Coming soon", tombol Kabari aku, tidak bisa masuk keranjang).
- `draft: true` hanya menampilkan bilah draf dan pemilih pratinjau edisi. `maintenance: true` mengarahkan semua pengunjung ke `maintenance.html` (pemilik tetap bisa melihat situs dengan menambahkan `?pratinjau` di alamat).
- Proyek residensial: gambar di `residential.images` (`fit: "contain"` untuk gambar kerja, `"cover"` untuk render). Gambar berganti otomatis tiap 6 detik.
- Isi ruang di Denah ilmu: `rooms` (kunci sama dengan `data-room` di `index.html`).
- Obrolan gambaran Discord: `seasons.<nama>.chat`, berganti tiap edisi. Nama server dan channel di `discord`.
- Produk baru: tambah objek di `products` dengan `id` unik, `sku` berformat `MR-<KODE>-<NO>`, `cat` salah satu kunci `categories`, `price` dalam rupiah tanpa titik, `art` salah satu pola sampul (ruler, chat, cube, chair, plan, lines, grid, gift, book, spark).
- Diskon produk: `discount: { percent: 10, until: "2026-12-15" }`. Diskon edisi: `seasons.<nama>.discount` dengan `cats`. Yang dipakai adalah diskon terbesar. Harga dibulatkan ke Rp100.
- Edisi musim: `season: "auto"` memilih dari bulan, lalu `events` menimpa saat tanggalnya aktif. Bisa dipaksa dengan nama edisi. Pratinjau di browser: tambahkan `?edisi=salju` di alamat.
- Testimoni: hanya yang ASLI, format `{ name, role, text, stars }`. Kosong berarti bagian testimoni disembunyikan.
- Setelah tautan media sosial diisi di `socials`, JSON-LD `sameAs` terisi otomatis.

## Aturan gaya
- Bahasa Indonesia santai, memakai "aku" dan "kamu".
- Jangan memakai tanda pisah panjang (em dash) dan titik koma di teks yang tampil.
- Hindari kalimat tanya di teks yang tampil. FAQ ditulis sebagai topik.
- Jangan mengarang prestasi, testimoni, jumlah pembeli, atau jumlah pengikut. Tanyakan ke pemilik.
- Angka riset harus punya sumber. Pakai label bukti UKUR, REFERENSI, ESTIMASI, atau HIPOTESIS.
- Bahasa sesederhana mungkin, untuk orang awam. Hindari istilah teknis tanpa penjelasan.
- Pandangan pemilik yang boleh muncul: beli karena butuh, bukan ikut-ikutan; AI dipakai dengan berpikir kritis; tujuan per 3 bulan; kuliah bukan cuma soal IPK; pikir besar, mulai kecil.
- Nama dan NIM teman satu kelompok tidak ditampilkan tanpa izin mereka.
- Warna tidak pernah solid: biru muda, kuning ke oranye, dan oranye selalu sebagai gradien. Warna dan font hanya lewat token CSS di `:root` (ada versi terang dan gelap).
- Setiap bagian baru diberi animasi masuk (`data-reveal`, `data-stagger`). Gerak besar yang baru (geser, putar, berulang terus) wajib dimatikan di bawah kelas `.calm` di bagian "Gerak tenang" di `style.css`.
- Pemilik minta animasi SELALU penuh untuk semua pengunjung (November 2026). Tombol "Animasi penuh" di footer sudah dihapus, dan `main.js` membuang kelas `.calm` lalu memakai `const reduce = false`. Aturan `.calm` di CSS dibiarkan supaya gampang dinyalakan lagi. Jangan menambah tombol animasi lagi tanpa izin pemilik.
- Script kecil di `<head>` harus sama di semua halaman (tema dan mode animasi).
- Tampilan HP (lebar 360 sampai 420 px) harus tetap rapi tanpa scroll ke samping.

## Pembayaran (tahap sekarang)
- QRIS statis, ditambah kode unik 1 sampai 199 rupiah, lalu konfirmasi lewat WhatsApp. Belum ada backend.
- Nomor WA admin di `contact.whatsapp` (format 628...). Gambar QRIS di `payment.qrisImage`.
- Jangan pernah menaruh API key, password, token, atau server key payment gateway di repo ini. Isi `index.html` bisa dilihat siapa saja lewat browser.

## Penyimpanan di browser
`mr-theme`, `mr-cart`, `mr-cat`, `mr-last-order` (localStorage), `mr-season-preview`, `mr-draft-hidden` (sessionStorage). Kalau menambah kunci baru, perbarui juga tabel di `kebijakan-privasi.html`.

## Deploy
- Alamat aktif sekarang: https://musholirafi.netlify.app (Netlify, terhubung ke repo GitHub `Raficrafty/musholirafi-web`). Domain musholirafi.com belum dibeli. Alamat `*.workers.dev` diblokir sebagian besar internet Indonesia, jadi jangan dipakai. Saat domain sendiri sudah dibeli, ganti semua `https://musholirafi.netlify.app` (canonical, og, JSON-LD, sitemap, robots, `domain` dan `url` di data.js) ke alamat baru.
- Situs statis. Bisa di Netlify, Cloudflare Pages, atau GitHub Pages. Setiap perubahan di branch `main` tayang otomatis.
- Untuk perubahan besar, kerjakan di branch baru lalu buat pull request supaya pemilik bisa cek pratinjaunya dulu.
- Halaman baru wajib masuk `sitemap.xml`.

## Sebelum menyatakan selesai
- Buka halaman di lebar 1280, 390, dan 360 px, mode terang dan gelap. Pastikan tidak ada error di console dan tidak ada scroll ke samping.
- Uji alur: tambah produk, isi data, muncul nominal plus kode unik, tautan WhatsApp berisi pesan yang benar.
- Uji `?edisi=hujan`, `?edisi=salju`, dan `?edisi=idulfitri`.
- Animasi harus tetap penuh walaupun "reduce motion" di perangkat menyala.
- Tulis ringkasan perubahan dengan bahasa sederhana untuk pemilik.

## Rencana berikutnya
1. Isi semua baris GANTI di `data.js`, lalu `draft: false`.
2. Domain musholirafi.com, Google Search Console, kirim sitemap.
3. Halaman catatan baru per topik (belajar efektif, belajar AI, metodologi) untuk SEO.
4. Payment gateway (Midtrans atau Xendit) dengan QRIS dinamis lewat serverless function. Kunci disimpan di environment variable hosting.
