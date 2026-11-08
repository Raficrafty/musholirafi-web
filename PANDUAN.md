# Panduan Website musholirafi.com (v3)

Panduan ini untuk kamu, bukan untuk Claude. Ikuti dari atas ke bawah. Hampir semua yang perlu kamu ubah ada di satu file: `assets/js/data.js`.

## 1. Isi data wajib (15 menit)
Buka `assets/js/data.js` dengan editor teks apa saja (Notepad, VS Code, atau editor di GitHub). Cari tulisan `GANTI`, lalu isi:
- `contact.whatsapp`: nomor admin, format `628xxxxxxxxxx` tanpa spasi.
- `contact.email` dan `contact.discordHandle`.
- `links.discordInvite`: tautan undangan server Discord, misal `https://discord.gg/xxxx`.
- `payment.qrisImage`: taruh gambar QRIS merchant-mu di `assets/img/qris.png`, lalu tulis `"assets/img/qris.png"`. Isi juga `payment.merchantName`.
- `socials`: isi `url` Instagram, TikTok, YouTube, dan Discord. Yang kosong tampil redup dan tidak bisa diklik.
- `photo` (opsional): foto asli untuk bagian atas, misal `"assets/img/foto.webp"`. Kosong berarti memakai maskot.

Lalu cek baris bertanda `CEK` (nama newsletter, nama lengkap, tanggal event).

## 2. Produk, coming soon, dan gambar karya
Label "contoh" sudah tidak ada. Produk yang belum siap diberi `soon: true`, jadi tampil "Coming soon" dengan tombol Kabari aku. Kalau sudah siap, hapus `soon: true` dan produk langsung bisa dibeli.
- Ubah judul, deskripsi, dan harga produk di `products` sesuai yang benar-benar kamu jual.
- Produk gratis (`price: 0`) diambil lewat WhatsApp. Kalau mau langsung unduh, pakai `free: { via: "link", url: "https://drive.google.com/..." }`.
- Render rumah: simpan gambarnya di `assets/img/` (disarankan .webp, lebar 1400 px), lalu tambahkan di `residential.images` dengan `fit: "cover"`. Gambar berganti otomatis dengan animasi.
- Isi tiap ruang di Denah ilmu ada di `rooms`. Obrolan contoh di gambaran Discord ada di `seasons.<nama>.chat` dan berganti tiap edisi.
- Kelas bimbel ada di dua tempat: harga di `programs` (data.js), teks kartunya di `bimbel.html` bagian `id="bimbel"`. `id` di `programs` harus sama dengan `data-offer` di kartu.
- Testimoni: isi `testimonials` HANYA dengan testimoni asli, lengkap dengan izin orangnya. Kosong berarti bagian testimoni disembunyikan otomatis.
- Mau merapikan website tanpa dilihat pengunjung: ubah `maintenance: false` menjadi `true`. Semua pengunjung melihat halaman "sedang direnovasi". Kamu sendiri tetap bisa membuka situsnya dengan menambahkan `?pratinjau` di belakang alamat.

## 3. Diskon
- Diskon satu produk: tambahkan `discount: { percent: 15, until: "2026-12-31" }` di produk itu.
- Diskon edisi musim: ubah `discount` di `seasons.<nama>`, misal `{ percent: 20, until: "2026-11-30", cats: ["modul"] }`. `cats` boleh berisi `modul`, `buku`, `jurnal`, atau `bimbel`.
- Kalau dua diskon berlaku bersamaan, yang dipakai yang terbesar. Setelah tanggal `until` lewat, diskon hilang sendiri dan hitung mundurnya juga.

## 4. Edisi musim dan event
- `season: "auto"` memilih edisi dari bulan (hujan November sampai Maret, kemarau April sampai Oktober). Event di `events` menimpanya selama tanggalnya aktif (Ramadan, Idul Fitri, Idul Adha, Kemerdekaan).
- Perbarui tanggal di `events` setiap tahun. Tanggal Ramadan dan hari raya bergeser sekitar 11 hari tiap tahun, jadi cek kalender resmi.
- Mau memaksa satu edisi: tulis namanya, misal `season: "salju"`.
- Setiap edisi boleh punya modul gratis (`freebie` berisi `id` produk), event gratis di Discord (`event`), dan diskon.
- Untuk melihat edisi lain tanpa mengubah apa pun, buka alamat dengan `?edisi=idulfitri`, `?edisi=gugur`, atau `?edisi=salju`.

## 5. Tayang hari ini juga (gratis)
Pilihan paling mudah, Netlify Drop:
1. Buat akun di https://app.netlify.com dulu supaya situsnya tidak hilang.
2. Buka https://app.netlify.com/drop lalu seret folder `musholirafi-website-v2` ke halaman itu.
3. Kamu langsung dapat alamat seperti `nama-acak.netlify.app`. Ganti namanya di Site configuration.

Pilihan lain yang juga gratis untuk website jualan: Cloudflare Pages. Hindari paket gratis Vercel (Hobby) karena khusus pemakaian non-komersial. GitHub Pages bisa dipakai, tapi aturannya melarang situs yang tujuan utamanya transaksi jual beli, jadi lebih aman Netlify atau Cloudflare Pages.

## 6. Pakai domain musholirafi.com
1. Beli domain di registrar (atau `.my.id` yang lebih murah).
2. Di Netlify: Domain management, Add a domain, lalu ikuti instruksi DNS yang muncul.
3. Tunggu DNS aktif. Biasanya beberapa menit sampai beberapa jam. HTTPS aktif otomatis.

Kalau memakai alamat lain selain musholirafi.com, ganti `https://musholirafi.com` di `<head>` setiap halaman, `sitemap.xml`, dan `robots.txt`.

## 7. Supaya bisa diupdate lewat Claude
Simpan kode di GitHub, bukan di ingatan Claude.
1. Buat akun GitHub, aktifkan verifikasi dua langkah.
2. Buat repository baru (boleh private), misalnya `musholirafi-web`, lalu unggah seluruh isi folder `musholirafi-website-v2`.
3. Di Netlify: Add new site, Import an existing project, pilih repo tadi. Mulai sekarang setiap perubahan di GitHub otomatis tayang.
4. Buka https://claude.ai/code, hubungkan GitHub sekali saja, lalu pilih repo. Claude membaca `CLAUDE.md` otomatis.

Jangan pernah mengirim password GitHub atau kunci rahasia di chat. Koneksinya lewat tombol resmi GitHub.

## 8. Contoh perintah ke Claude
- "Tambahkan produk baru: Modul Warna dan Material, Rp45.000, kategori modul."
- "Buat edisi Natal dan Tahun Baru dari 20 Desember sampai 2 Januari, diskon 25 persen semua buku."
- "Tambahkan testimoni asli dari Dinda, Desain Interior ISI 2024: ..."
- "Buat halaman catatan baru tentang cara belajar efektif, gaya sama seperti halaman cerita."
- "Tambahkan render ruang tamu dari assets/img/render-ruang-tamu.webp ke slideshow residensial."
- "Ganti maskot di bagian atas dengan fotoku di assets/img/foto.webp."

## 9. Supaya ketemu di Google saat orang mencari "Musholi Rafi"
1. Daftarkan domain di Google Search Console: https://search.google.com/search-console
2. Kirim `https://musholirafi.com/sitemap.xml` di menu Sitemaps.
3. Taruh link website di bio Instagram, TikTok, YouTube, LinkedIn, Substack, dan Lynk. Pakai nama yang persis sama di semua akun.
4. Isi `url` media sosial di `data.js`. Data mesin pencari (`sameAs`) ikut terisi otomatis.

## 10. Hal teknis kecil
- Ganti gambar bagikan (yang muncul saat link dikirim di WhatsApp): `assets/img/og-image.png`, ukuran 1200 × 630.
- Website menyimpan beberapa pengaturan kecil di browser pengunjung. Daftarnya ada di `kebijakan-privasi.html`. Kalau menambah fitur yang menyimpan data, perbarui halaman itu.
- Animasi selalu penuh untuk semua pengunjung, termasuk yang mematikan "Animation effects" di Windows atau menyalakan "Reduce motion" di Mac. Tombol animasi di footer sudah dihapus.
