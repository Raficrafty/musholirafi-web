/* Halaman belajar-inggris.html: edisi UTS, contoh soal, dan pembuka kode akses.
   Materi berbayar tersimpan terenkripsi di assets/data/inggris.enc.json dan hanya terbuka dengan kode. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var p2 = function (n) { return (n < 10 ? "0" : "") + n; };
  var d = new Date(), today = d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());

  all("[data-edisi-sampai]").forEach(function (el) { el.hidden = today > el.getAttribute("data-edisi-sampai"); });
  all("[data-edisi-selesai]").forEach(function (el) { el.hidden = !(today > el.getAttribute("data-edisi-selesai")); });
  var hours = window.SITE && window.SITE.contact && window.SITE.contact.hours;
  if (hours) all("[data-jam]").forEach(function (el) { el.textContent = hours; });

  var q = $("#eng-q");
  if (q) {
    var fb = $(".eng-q-fb", q), btns = all("button", q);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var ok = b.hasAttribute("data-ok");
        btns.forEach(function (x) { x.disabled = true; if (x.hasAttribute("data-ok")) x.classList.add("ok"); });
        if (!ok) b.classList.add("bad");
        fb.hidden = false;
        fb.textContent = (ok ? "Tepat. " : "Belum tepat. ") + "Has diikuti V3. Write berubah menjadi wrote lalu written, jadi jawabannya written.";
      });
    });
  }

  var form = $("#eng-form"), input = $("#eng-code"), go = $("#eng-go"), msg = $("#eng-msg"),
      box = $("#eng-lockbox"), stage = $("#eng-stage"), blob = null;
  if (!form) return;
  var say = function (t, c) { msg.textContent = t; msg.className = "eng-msg" + (c ? " " + c : ""); };
  var b64 = function (s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  var norm = function (s) { return String(s || "").normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]/g, ""); };

  async function unlock(code) {
    if (!window.crypto || !window.crypto.subtle) throw new Error("nocrypto");
    if (!blob) {
      var r = await fetch("assets/data/inggris.enc.json", { cache: "no-store" });
      if (!r.ok) throw new Error("fetch");
      blob = await r.json();
    }
    var km = await crypto.subtle.importKey("raw", new TextEncoder().encode(norm(code)), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(blob.s), iterations: blob.i, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(blob.n) }, key, b64(blob.c)));
  }

  function show(html) {
    stage.innerHTML = '<div class="eng-stage-bar"><b>Materi belajar</b><button type="button" class="btn soft small" id="eng-close">Tutup materi</button></div>';
    var f = document.createElement("iframe");
    f.className = "eng-frame";
    f.title = "Materi belajar Tense dan Parts of Speech";
    f.setAttribute("sandbox", "allow-scripts allow-popups allow-popups-to-escape-sandbox");
    f.srcdoc = html;
    stage.appendChild(f);
    box.hidden = true;
    stage.hidden = false;
    $("#eng-close").addEventListener("click", function () {
      stage.hidden = true; stage.innerHTML = ""; box.hidden = false; input.value = ""; say("");
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    stage.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!norm(input.value)) { say("Isi kodenya dulu.", "err"); input.focus(); return; }
    go.disabled = true; go.textContent = "Membuka..."; say("");
    try {
      show(await unlock(input.value));
    } catch (err) {
      var m = String(err && err.message);
      say(m === "nocrypto" ? "Browser ini belum mendukung pembuka kode. Coba Chrome atau Safari versi terbaru."
        : m === "fetch" ? "Materi belum bisa dimuat. Cek koneksi internetmu lalu coba lagi."
        : "Kode belum cocok. Cek lagi huruf dan angkanya, atau minta ke WhatsApp.", "err");
    }
    go.disabled = false; go.textContent = "Buka materi";
  });
})();
