/**
 * Penampung email newsletter musholirafi.my.id
 * Tempel seluruh isi file ini di Google Sheet: Ekstensi, Apps Script.
 * Lalu Terapkan, Deployment baru, Aplikasi web, Jalankan sebagai: Saya, Akses: Siapa saja.
 * Salin URL aplikasi web (berakhiran /exec) ke newsletterEndpoint di assets/js/data.js.
 *
 * Kolom: Waktu | Email | Status | Sumber. Kalau pelanggan minta berhenti, hapus barisnya (kebijakan privasi menjanjikan itu).
 * Sel F2 berisi semua email berstatus aktif, siap disalin ke kolom BCC Gmail.
 *
 * @OnlyCurrentDoc
 */
const SHEET = 'Pelanggan';

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return out('ok'); // kolom jebakan bot terisi, abaikan diam-diam
  const email = String(p.email || '').trim().toLowerCase();
  if (email.length > 120 || !/^[^\s@=+\-][^\s@]*@[^\s@]+\.[^\s@]{2,}$/.test(email)) return out('invalid');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet();
    const rows = Math.max(sh.getLastRow() - 1, 1);
    const emails = sh.getRange(2, 2, rows, 1).getValues().map(function (r) { return String(r[0]).toLowerCase(); });
    if (emails.indexOf(email) === -1) sh.appendRow([new Date(), email, 'aktif', safe(p.sumber)]);
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(['Waktu', 'Email', 'Status', 'Sumber']);
    sh.setFrozenRows(1);
    sh.getRange('F1').setValue('Salin ke BCC (email aktif)');
    sh.getRange('F2').setFormula('=IFERROR(TEXTJOIN(", ", TRUE, FILTER(B2:B, C2:C="aktif")), "")');
  }
  return sh;
}

// Cegah teks yang diawali = + - @ dibaca sebagai rumus oleh Sheets
function safe(v) {
  return String(v || '').slice(0, 60).replace(/^[=+\-@]/, "'$&");
}

function out(status) {
  return ContentService.createTextOutput(JSON.stringify({ status: status })).setMimeType(ContentService.MimeType.JSON);
}

// Jalankan sekali dari editor untuk membuat tab Pelanggan dan rumus F2 tanpa menunggu pelanggan pertama
function siapkan() {
  sheet();
}
