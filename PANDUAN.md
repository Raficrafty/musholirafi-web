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
- Kode promo untuk pelanggan newsletter: tambahkan di data.js, misalnya
  `promoCodes: [ { code: "PELANGGAN10", percent: 10, from: "2026-12-01", until: "2026-12-07" } ],`
  Kolom kode promo baru muncul di checkout kalau daftar ini berisi. `from` boleh dikosongkan. Potongannya dihitung dari subtotal setelah diskon produk. Kode tertulis di sumber halaman, jadi orang yang paham teknis bisa membacanya. Cek kodenya di pesan WhatsApp sebelum mengirim produk.

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

## 11. Newsletter lewat Google Sheet (pengganti Substack)
Email pelanggan masuk ke Google Sheet milikmu. Kamu yang mengirim newsletter dari Gmail.

Pasang sekali (10 menit):
1. Buka sheets.google.com, buat spreadsheet kosong, beri nama "Pelanggan Catatan Rafi".
2. Klik Ekstensi, lalu Apps Script. Hapus isi editor, tempel seluruh isi `tools/newsletter-apps-script.gs`, lalu klik ikon simpan.
3. Di menu fungsi pilih `siapkan`, klik Jalankan. Google meminta izin: pilih akunmu, klik Lanjutan, lalu "Buka ... (tidak aman)", lalu Izinkan. Peringatan ini muncul karena skripnya buatanmu sendiri dan belum diperiksa Google. Skrip hanya bisa membuka spreadsheet ini.
4. Klik Terapkan, Deployment baru. Ikon gerigi pilih Aplikasi web. Jalankan sebagai: Saya. Yang memiliki akses: Siapa saja. Klik Terapkan, lalu salin URL aplikasi web (berakhiran `/exec`).
5. Di data.js, di bawah `newsletterName`, tambahkan `newsletterEndpoint: "URL tadi",` lalu commit.
6. Tes: buka beranda, isi emailmu sendiri di bagian Newsletter. Dalam beberapa detik email itu muncul di tab Pelanggan.

Kalau skripnya diubah, klik Terapkan, Kelola deployment, ikon pensil, Versi: Versi baru, Terapkan. URL-nya tetap sama.

Mengirim newsletter:
1. Tulis isinya bareng Claude, lalu salin.
2. Di Google Sheet, salin sel G1 (semua email berstatus aktif).
3. Di Gmail klik Tulis. Kolom Kepada isi emailmu sendiri. Klik Bcc, tempel daftar email tadi. Dengan Bcc, pelanggan tidak bisa melihat email pelanggan lain.
4. Tempel isi newsletter. Tutup dengan kalimat: "Kamu menerima email ini karena berlangganan di musholirafi.my.id. Balas dengan kata BERHENTI kalau tidak mau menerima lagi."
5. Kirim ke dirimu sendiri dulu untuk mengecek tampilannya, baru kirim ke semua.

Catatan:
- Gmail biasa membatasi sekitar 500 penerima per hari. Kalau pelanggan sudah lebih dari itu, kirim bertahap atau pindah ke layanan email massal.
- Kalau ada yang membalas BERHENTI, hapus barisnya (klik kanan nomor baris, Hapus baris). Email itu otomatis hilang dari sel G1, dan kalau ia mendaftar lagi nanti, emailnya masuk lagi. Kebijakan privasi menjanjikan email itu dihapus, jadi jangan cuma disembunyikan.
- URL aplikasi web terlihat di sumber halaman, jadi siapa pun bisa mengirim email ke daftar ini. Skrip menolak format yang salah, mengabaikan bot, dan tidak menyimpan email yang sama dua kali. Kalau ada baris aneh, hapus saja.

## 12. Kirim file otomatis lewat email (tab Pesanan)
Setiap pesanan masuk ke Google Sheet. Setelah kamu cek pembayarannya di mutasi QRIS, cukup centang kolom Lunas. Email berisi tautan file langsung terkirim ke pembeli.

Pasang sekali (15 menit):
1. Buka sheets.google.com, buat spreadsheet kosong BARU, beri nama "Pesanan Toko Rafi". Sengaja dipisah dari spreadsheet Pelanggan newsletter, supaya newsletter yang sudah jalan tidak terganggu.
2. Klik Ekstensi, lalu Apps Script. Hapus isi editor, tempel seluruh isi `tools/pesanan-apps-script.gs`, lalu klik ikon simpan.
3. Di menu fungsi pilih `siapkan`, klik Jalankan. Google meminta izin, termasuk izin mengirim email atas namamu. Pilih akunmu, klik Lanjutan, lalu "Buka ... (tidak aman)", lalu Izinkan. Peringatan ini muncul karena skripnya buatanmu sendiri.
4. Sekarang ada tab Pesanan dan tab Produk. Tab Produk sudah berisi SKU, nama, dan harga produkmu. Kolom Tautan file masih kosong.
5. Isi Tautan file: unggah file produk ke Google Drive, klik kanan file, Bagikan. Di Akses umum pilih "Siapa saja yang memiliki link" dan peran Pelihat. Klik Salin link, lalu tempel di kolom Tautan file di baris SKU yang sama. Tautan ini hanya ada di Sheet-mu, tidak di website.
6. Kembali ke Apps Script. Klik Terapkan, Deployment baru. Ikon gerigi pilih Aplikasi web. Jalankan sebagai: Saya. Yang memiliki akses: Siapa saja. Klik Terapkan, lalu salin URL aplikasi web (berakhiran `/exec`).
7. Di data.js, di bawah baris `newsletterEndpoint`, tambahkan `orderEndpoint: "URL tadi",` lalu commit.
8. Tes: tunggu 2 menit, buka toko lewat jendela penyamaran, pesan produk termurah dengan emailmu sendiri sampai muncul layar QRIS (tidak perlu bayar). Dalam beberapa detik baris baru muncul di tab Pesanan. Centang Lunas di baris itu, lalu cek emailmu. Setelah itu hapus baris tes tadi.

Setiap ada pesanan:
1. Buka tab Pesanan (dari HP bisa lewat aplikasi Google Sheets).
2. Cek mutasi QRIS dan bukti bayar di WhatsApp. Cocokkan tiga hal: nominal persis sama dengan Total dibayar, kode unik sama, dan Total masuk akal dibanding Harga normal. Total sedikit lebih rendah itu wajar karena diskon atau kode promo. Kalau jauh lebih rendah, cek ulang sebelum mencentang.
3. Centang Lunas. Kolom Status berubah menjadi "Terkirim" beserta jam kirimnya.

Arti kolom Status:
- `Menunggu bayar`: pesanan dibuat, belum kamu centang.
- `Menunggu bayar, tanpa email`: pembeli tidak mengisi email. Kirim file lewat WhatsApp seperti biasa.
- `Lunas. Belum ada tautan file di tab Produk, kirim manual`: isi dulu Tautan file produk itu, lalu pakai menu Toko di bawah.
- `Gagal: ...` atau `Kuota email hari ini habis`: coba lagi lewat menu Toko.

Kirim ulang: klik baris pesanannya, lalu menu Toko (di samping menu Bantuan), Kirim ulang file untuk baris terpilih. Menu ini muncul setelah Sheet dibuka ulang.

Catatan:
- Bimbel tidak punya file. Di email tertulis "yang ini kukirim lewat WhatsApp", jadi undangan Discord tetap kamu kirim manual.
- Produk baru: tambahkan satu baris di tab Produk (SKU sama persis dengan di data.js, nama, tautan file, harga).
- Gmail biasa bisa mengirim sekitar 100 email per hari lewat Apps Script. Lampiran tidak dipakai, cukup tautan Drive.
- Skrip tidak pernah mengirim email saat pesanan baru dibuat. Email hanya keluar setelah kamu centang Lunas. Alamat skrip terlihat di sumber halaman, jadi aturan ini mencegah orang iseng memakai skripmu untuk menyepam.
- Orang yang sudah membeli tetap bisa membagikan tautan Drive-nya. Risiko ini sama seperti saat file dikirim lewat WhatsApp.
- Kebijakan privasi menjanjikan data pesanan dihapus paling lama satu tahun setelah pesanan selesai. Hapus baris lama secara berkala.
- Kalau skripnya diubah, klik Terapkan, Kelola deployment, ikon pensil, Versi: Versi baru, Terapkan. URL-nya tetap sama.
