/**
 * Pesanan toko musholirafi.my.id + kirim file otomatis lewat email
 * Pasang di spreadsheet BARU (misal "Pesanan Toko Rafi"), terpisah dari spreadsheet Pelanggan newsletter.
 * Langkah lengkapnya di PANDUAN.md bagian 12.
 *
 * Cara kerja:
 * 1. Pembeli menekan Buat pesanan. Website mengirim pesanan ke sini, lalu skrip menulis satu baris di tab Pesanan.
 *    Skrip TIDAK mengirim email apa pun di tahap ini. Alamat skrip terlihat di sumber halaman,
 *    jadi kalau langsung mengirim email, orang iseng bisa memakainya untuk menyepam atas namamu.
 * 2. Kamu cek mutasi QRIS. Kalau nominal dan kode uniknya cocok, centang kolom Lunas.
 * 3. Skrip mengirim email berisi tautan file dari tab Produk ke email pembeli, lalu menulis Terkirim di kolom Status.
 *
 * Tab Produk: SKU | Nama produk | Tautan file | Harga normal. Isi Tautan file dengan link Google Drive
 * (Bagikan, Akses umum: Siapa saja yang memiliki link, Pelihat). Tautan hanya ada di Sheet ini, tidak di website.
 *
 * @OnlyCurrentDoc
 */
const TAB_PESANAN = 'Pesanan';
const TAB_PRODUK = 'Produk';
const NAMA_PENGIRIM = 'Musholi Rafi';
const SITUS = 'musholirafi.my.id';
const BATAS_PER_JAM = 60; // pesanan baru per jam, penahan kalau ada yang iseng mengirim terus-menerus
const KOLOM = ['Waktu', 'No. pesanan', 'Nama', 'WhatsApp', 'Email', 'Pesanan', 'SKU', 'Total dibayar', 'Kode unik', 'Promo', 'Harga normal', 'Lunas', 'Status'];
const K_LUNAS = 12;
const K_STATUS = 13;

// Isi awal tab Produk (diambil dari data.js November 2026). Hanya dipakai sekali saat tab Produk dibuat.
const PRODUK_AWAL = [
  ["MR-BK-03", "Sistem Bangunan untuk Desain Interior", 21999],
  ["MR-BK-04", "Sustainable Design: Desain Mebel Berkelanjutan", 21000],
  ["MR-BK-05", "Basic Desain Interior", 15999],
  ["MR-MOD-01", "Dimensi Manusia dan Ruang Interior", 15000],
  ["MR-SM1-01", "Paket Ujian: Paket Full Materi", 19999],
  ["MR-SM1-02", "Paket Lengkap #1 Sejarah Desain", 15999],
  ["MR-SM1-03", "Catatan Sejarah Desain Akhir #2: Apa dan Mengapa Stapler Ingin Terbang?", 14999],
  ["MR-SM1-04", "#1 Streamline Moderne: Memaknai Harapan di Tengah Krisis", 4000],
  ["MR-SM1-05", "Catatan Sejarah Desain (11): Art Deco", 2000],
  ["MR-SM1-06", "Catatan Sejarah Desain ke-10", 1999],
  ["MR-SM1-07", "Latihan Soal Sejarah Desain", 499],
  ["MR-SM1-08", "Paket Belajar Sejarah Desain dengan Soal Opsi", 100],
  ["MR-SM1-09", "Pancasila dan Demokrasi", 9999],
  ["MR-SM1-10", "Pancasila dan Sistem Hukum", 4999],
  ["MR-SM1-11", "Pancasila dan Hak Asasi Manusia", 4999],
  ["MR-SM1-12", "Kekerasan pada Anak dan Perempuan", 4999],
  ["MR-SM1-13", "Pancasila dan Pendidikan Karakter", 4500],
  ["MR-SM1-14", "Pancasila dan Korupsi", 3999],
  ["MR-TPL-01", "Template Notion Jadwal Kuliah", 2000],
  ["MR-MOD-02", "Metodologi Desain untuk Asistensi", 45000],
  ["MR-MOD-03", "Dari Denah ke Model 3D dengan SketchUp", 45000],
  ["MR-MOD-04", "Gambar Kerja Mebel dengan AutoCAD", 45000],
  ["MR-KRS-01", "Kursus Jadwal Belajar Mingguan", 29000],
  ["MR-BK-01", "Pas di Badan", 10000],
  ["MR-BK-02", "Kuliah Desain Itu Proyek", 49000],
  ["MR-JR-01", "Logbook Riset Desain", 35000],
  ["MR-BIM-01", "Bisa Notion dalam 30 Hari", 150000],
  ["MR-BIM-02", "Dasar Figma dalam 1 Bulan", 200000],
  ["MR-BIM-03", "Ergonomi untuk Asistensi", 85000],
  ["MR-BIM-04", "SketchUp dan AutoCAD", 85000],
  ["MR-BIM-05", "AI untuk Belajar dan Desain", 75000],
  ["MR-BIM-06", "Konsultasi Cara Belajar", 50000]
];

/* ---------- 1. Menerima pesanan dari website ---------- */
function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return out('ok'); // kolom jebakan bot terisi, abaikan diam-diam
  const id = String(p.id || '').trim();
  if (!/^MR-\d{6}-\d{4}$/.test(id)) return out('invalid');
  const email = String(p.email || '').trim().toLowerCase();
  if (email && (email.length > 120 || !/^[^\s@=+\-][^\s@]*@[^\s@]+\.[^\s@]{2,}$/.test(email))) return out('invalid');
  const total = Math.round(Number(p.total));
  if (!(total > 0 && total < 100000000)) return out('invalid');
  const items = bacaSku(p.sku);
  if (!items.length) return out('invalid');
  const kode = Math.round(Number(p.kode)) || '';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cache = CacheService.getScriptCache();
    const jam = 'n' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMddHH');
    const n = Number(cache.get(jam) || 0);
    if (n >= BATAS_PER_JAM) return out('busy');
    cache.put(jam, String(n + 1), 3700);

    const sh = tabPesanan();
    const last = sh.getLastRow();
    if (last > 1) {
      const ids = sh.getRange(2, 2, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
      if (ids.indexOf(id) !== -1) return out('ok'); // pesanan yang sama terkirim dua kali
    }
    const normal = hargaNormal(items);
    sh.appendRow([
      new Date(), id, aman(p.nama, 80), aman(p.wa, 20), email, aman(p.pesanan, 500),
      items.map(function (it) { return it.sku + (it.qty > 1 ? ' x' + it.qty : ''); }).join(', '),
      total, kode, aman(p.promo, 30), normal === null ? '' : normal, false,
      email ? 'Menunggu bayar' : 'Menunggu bayar, tanpa email'
    ]);
    sh.getRange(sh.getLastRow(), K_LUNAS).insertCheckboxes();
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

/* ---------- 2. Saat kolom Lunas dicentang ---------- */
// Dipasang sebagai pemicu (trigger) oleh fungsi siapkan. Pemicu biasa onEdit tidak boleh mengirim email.
function saatDicentang(e) {
  if (!e || !e.range) return;
  const r = e.range, sh = r.getSheet();
  if (sh.getName() !== TAB_PESANAN) return;
  if (r.getColumn() > K_LUNAS || r.getLastColumn() < K_LUNAS) return;
  for (let row = Math.max(2, r.getRow()); row <= r.getLastRow(); row++) {
    if (sh.getRange(row, K_LUNAS).getValue() === true) kirim(sh, row);
  }
}

function kirim(sh, row) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const v = sh.getRange(row, 1, 1, KOLOM.length).getValues()[0];
    const id = String(v[1]), nama = String(v[2]).replace(/^'/, ''), email = String(v[4]).trim();
    if (v[K_LUNAS - 1] !== true || /^Terkirim/.test(String(v[K_STATUS - 1]))) return;
    if (!email) { status(sh, row, 'Lunas. Tanpa email, kirim lewat WhatsApp'); return; }
    if (MailApp.getRemainingDailyQuota() < 1) { status(sh, row, 'Kuota email hari ini habis. Centang ulang besok'); return; }

    const peta = petaProduk();
    const isi = bacaSku(String(v[6])).map(function (it) {
      const pr = peta[it.sku] || {};
      return { nama: (pr.nama || it.sku) + (it.qty > 1 ? ' x' + it.qty : ''), link: pr.link || '' };
    });
    if (!isi.some(function (x) { return x.link; })) { status(sh, row, 'Lunas. Belum ada tautan file di tab Produk, kirim manual'); return; }

    const sapa = nama ? 'Halo ' + nama + ',' : 'Halo,';
    const baris = isi.map(function (x, i) { return (i + 1) + '. ' + x.nama + ': ' + (x.link || 'yang ini kukirim lewat WhatsApp'); });
    const teks = [
      sapa, '',
      'Pembayaran untuk pesanan ' + id + ' sudah kuterima. Terima kasih sudah mendukungku terus berbagi.', '',
      'Ini file pesananmu:', baris.join('\n'), '',
      'Tautan ini khusus untukmu, jadi mohon tidak dibagikan ke orang lain. Kalau ada file yang tidak bisa dibuka, balas saja email ini.', '',
      'Salam,', 'Rafi', SITUS
    ].join('\n');
    const html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1C1A2B">' +
      '<p>' + h(sapa) + '</p>' +
      '<p>Pembayaran untuk pesanan <b>' + h(id) + '</b> sudah kuterima. Terima kasih sudah mendukungku terus berbagi.</p>' +
      '<p>Ini file pesananmu:</p><ol>' +
      isi.map(function (x) {
        return '<li>' + h(x.nama) + ': ' + (x.link ? '<a href="' + h(x.link) + '">Buka file</a>' : 'yang ini kukirim lewat WhatsApp') + '</li>';
      }).join('') + '</ol>' +
      '<p>Tautan ini khusus untukmu, jadi mohon tidak dibagikan ke orang lain. Kalau ada file yang tidak bisa dibuka, balas saja email ini.</p>' +
      '<p>Salam,<br>Rafi<br><a href="https://' + SITUS + '">' + SITUS + '</a></p></div>';

    MailApp.sendEmail({ to: email, subject: 'File pesanan ' + id + ' dari ' + NAMA_PENGIRIM, body: teks, htmlBody: html, name: NAMA_PENGIRIM });
    status(sh, row, 'Terkirim ' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH.mm'));
  } catch (err) {
    status(sh, row, 'Gagal: ' + String(err && err.message || err).slice(0, 90));
  } finally {
    lock.releaseLock();
  }
}

/* ---------- 3. Menu Toko di Sheet: kirim ulang ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Toko')
    .addItem('Kirim ulang file untuk baris terpilih', 'kirimUlang')
    .addToUi();
}

function kirimUlang() {
  const sh = SpreadsheetApp.getActiveSheet();
  const row = sh.getActiveRange().getRow();
  if (sh.getName() !== TAB_PESANAN || row < 2) { SpreadsheetApp.getUi().alert('Klik dulu salah satu baris pesanan di tab Pesanan.'); return; }
  if (sh.getRange(row, K_LUNAS).getValue() !== true) { SpreadsheetApp.getUi().alert('Centang Lunas dulu di baris itu.'); return; }
  status(sh, row, 'Kirim ulang');
  kirim(sh, row);
}

/* ---------- 4. Pasang sekali ---------- */
// Jalankan dari editor: membuat tab Pesanan, tab Produk, dan pemicu saat Lunas dicentang.
function siapkan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  tabPesanan();
  tabProduk();
  const ada = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'saatDicentang'; });
  if (!ada) ScriptApp.newTrigger('saatDicentang').forSpreadsheet(ss).onEdit().create();
}

/* ---------- Alat bantu ---------- */
function tabPesanan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TAB_PESANAN);
  if (!sh) {
    sh = ss.insertSheet(TAB_PESANAN, 0);
    sh.appendRow(KOLOM);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, KOLOM.length).setFontWeight('bold');
    sh.getRange('H:H').setNumberFormat('#,##0');
    sh.getRange('K:K').setNumberFormat('#,##0');
  }
  return sh;
}

function tabProduk() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TAB_PRODUK);
  if (!sh) {
    sh = ss.insertSheet(TAB_PRODUK);
    sh.appendRow(['SKU', 'Nama produk', 'Tautan file', 'Harga normal']);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 4).setFontWeight('bold');
    if (PRODUK_AWAL.length) {
      sh.getRange(2, 1, PRODUK_AWAL.length, 4).setValues(PRODUK_AWAL.map(function (r) { return [r[0], r[1], '', r[2]]; }));
    }
    sh.setColumnWidth(2, 280);
    sh.setColumnWidth(3, 320);
  }
  return sh;
}

function petaProduk() {
  const sh = tabProduk(), last = sh.getLastRow(), peta = {};
  if (last < 2) return peta;
  sh.getRange(2, 1, last - 1, 4).getValues().forEach(function (r) {
    const sku = String(r[0]).trim();
    if (sku) peta[sku] = { nama: String(r[1]).trim(), link: /^https:\/\//.test(String(r[2]).trim()) ? String(r[2]).trim() : '', harga: Number(r[3]) || 0 };
  });
  return peta;
}

function hargaNormal(items) {
  const peta = petaProduk();
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    const pr = peta[items[i].sku];
    if (!pr || !pr.harga) return null;
    sum += pr.harga * items[i].qty;
  }
  return sum;
}

// "MR-BK-03, MR-MOD-01 x2" menjadi [{sku, qty}]
function bacaSku(raw) {
  return String(raw || '').split(',').slice(0, 30).map(function (s) {
    const m = s.trim().match(/^([A-Za-z0-9-]{2,40})(?: x(\d{1,2}))?$/);
    return m ? { sku: m[1], qty: Number(m[2] || 1) } : null;
  }).filter(Boolean);
}

function status(sh, row, teks) {
  sh.getRange(row, K_STATUS).setValue(teks);
}

// Cegah teks yang diawali = + - @ dibaca sebagai rumus oleh Sheets
function aman(v, max) {
  return String(v || '').slice(0, max || 60).replace(/^[=+\-@]/, "'$&");
}

function h(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}

function out(status) {
  return ContentService.createTextOutput(JSON.stringify({ status: status })).setMimeType(ContentService.MimeType.JSON);
}
