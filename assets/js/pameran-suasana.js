/* =========================================================
   PAMERAN. Penampil gambar suasana ruang (layar penuh).
   Dipakai di pameran.html dan tiga halaman kursi. Kontainer galeri bertanda [data-lightbox],
   isinya tautan a.sw-btn ke gambar besar. Tanpa JS, tautan itu tetap membuka gambar besar.
   Kendali: klik atau ketuk gambar, panah kiri dan kanan, geser jari, Esc untuk menutup.
   ========================================================= */
(function () {
  "use strict";
  const groups = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (!groups.length || typeof HTMLDialogElement === "undefined") return;

  const svg = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + "</svg>";
  const IC = { x: svg('<path d="M6 6l12 12M18 6L6 18"/>'), l: svg('<path d="M15 6l-6 6 6 6"/>'), r: svg('<path d="M9 6l6 6-6 6"/>') };

  let dlg = null, wrap = null, frame = null, img = null, cap = null, count = null, prevB = null, nextB = null;
  let list = [], cur = 0, opener = null, token = 0;

  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.className = "lb";
    dlg.setAttribute("aria-label", "Penampil gambar suasana ruang");
    dlg.innerHTML =
      '<div class="lb-in">' +
        '<button type="button" class="lb-btn lb-x" aria-label="Tutup penampil gambar">' + IC.x + "</button>" +
        '<figure class="lb-fig">' +
          '<div class="lb-frame"><img class="lb-img" alt="" decoding="async"></div>' +
          '<figcaption class="lb-bar"><span class="lb-cap"></span><span class="ev vis" title="Gambar dibuat dengan AI mengikuti rancangan, bukan foto kursi jadi.">Visualisasi AI</span><span class="lb-count num" aria-live="polite"></span></figcaption>' +
        "</figure>" +
        '<button type="button" class="lb-btn lb-nav lb-prev" aria-label="Gambar sebelumnya">' + IC.l + "</button>" +
        '<button type="button" class="lb-btn lb-nav lb-next" aria-label="Gambar berikutnya">' + IC.r + "</button>" +
      "</div>";
    document.body.appendChild(dlg);
    wrap = dlg.querySelector(".lb-in");
    frame = dlg.querySelector(".lb-frame");
    img = dlg.querySelector(".lb-img");
    cap = dlg.querySelector(".lb-cap");
    count = dlg.querySelector(".lb-count");
    prevB = dlg.querySelector(".lb-prev");
    nextB = dlg.querySelector(".lb-next");

    dlg.querySelector(".lb-x").addEventListener("click", () => dlg.close());
    prevB.addEventListener("click", () => show(cur - 1));
    nextB.addEventListener("click", () => show(cur + 1));
    /* klik di area gelap di luar gambar menutup penampil */
    wrap.addEventListener("click", (e) => { if (e.target === wrap) dlg.close(); });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", (e) => {
      if (list.length < 2) return;
      if (e.key === "ArrowRight") { show(cur + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { show(cur - 1); e.preventDefault(); }
      else if (e.key === "Home") { show(0); e.preventDefault(); }
      else if (e.key === "End") { show(list.length - 1); e.preventDefault(); }
    });
    dlg.addEventListener("close", () => {
      document.documentElement.classList.remove("lb-open");
      token++;
      if (opener && document.contains(opener)) { try { opener.focus({ preventScroll: true }); } catch (e) { /* abaikan */ } }
    });

    /* geser jari ke kiri atau kanan untuk pindah gambar */
    let sx = 0, sy = 0, sid = null, st = 0;
    frame.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      sid = e.pointerId; sx = e.clientX; sy = e.clientY; st = Date.now();
    });
    frame.addEventListener("pointerup", (e) => {
      if (e.pointerId !== sid) return;
      sid = null;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (list.length > 1 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - st < 900) show(cur + (dx < 0 ? 1 : -1));
    });
    frame.addEventListener("pointercancel", () => { sid = null; });
  }

  function preload(a) {
    if (!a) return;
    const p = new Image();
    p.decoding = "async";
    p.src = a.href;
  }

  function show(i) {
    const n = list.length;
    cur = ((i % n) + n) % n;
    const a = list[cur], t = a.querySelector("img"), my = ++token;
    const w = +a.dataset.w || 1900, h = +a.dataset.h || 1061;
    img.style.setProperty("--ar", String(w / h));
    img.alt = t ? t.alt : "";
    /* versi kecil yang sudah ada di halaman tampil dulu, lalu diganti versi besar saat siap */
    if (t && t.currentSrc) img.src = t.currentSrc;
    const big = new Image();
    big.decoding = "async";
    big.onload = () => { if (my === token) img.src = big.src; };
    big.src = a.href;
    cap.textContent = a.dataset.cap || "";
    count.textContent = (cur + 1) + " / " + n;
    prevB.hidden = nextB.hidden = n < 2;
    preload(list[(cur + 1) % n]);
    preload(list[(cur - 1 + n) % n]);
  }

  function open(group, a) {
    build();
    list = Array.from(group.querySelectorAll("a.sw-btn"));
    const i = list.indexOf(a);
    if (i < 0) return;
    opener = a;
    if (!dlg.open) dlg.showModal();
    document.documentElement.classList.add("lb-open");
    show(i);
  }

  groups.forEach((g) => {
    g.addEventListener("click", (e) => {
      const a = e.target.closest("a.sw-btn");
      if (!a || !g.contains(a)) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      try { open(g, a); } catch (err) { console.error("pameran suasana", err); window.location.href = a.href; }
    });
  });
})();
