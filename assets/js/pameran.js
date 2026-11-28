/* =========================================================
   PAMERAN. Pengendali halaman kursi.
   Panggung 3D (putar, zoom, titik info, bongkar), animasi rakit, animasi sambungan,
   animasi anyaman rotan, penampil gambar kerja, dan hitungan biaya.
   Data tiap kursi ada di pameran-data.js (dibuat dari chairs.py oleh gen_site.py).
   ========================================================= */
(function () {
  "use strict";
  const main = document.querySelector("main.kursi");
  const D = window.PAMERAN;
  if (!main || !D) return;
  const C = D.chairs[main.dataset.chair];
  if (!C) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const KV = window.KursiViewer;
  const GL = !!(KV && window.THREE);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const safe = (nama, fn) => { try { fn(); } catch (e) { console.error("pameran " + nama, e); } };
  const pressed = (b, on) => { if (b) b.setAttribute("aria-pressed", on ? "true" : "false"); };
  const setLbl = (b, t) => { const l = b && $(".lbl", b); if (l) l.textContent = t; };
  const num = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const rp = (n) => "Rp " + num(n);
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < (window.innerHeight || 800); };

  /* jalankan fungsi saat elemen mendekati layar (untuk memuat 3D hanya saat dibutuhkan) */
  function near(el, cb, margin) {
    if (!("IntersectionObserver" in window)) { cb(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); cb(); } }, { rootMargin: margin || "500px 0px" });
    io.observe(el);
  }
  /* jalankan fungsi sekali saat elemen cukup terlihat */
  function seen(el, cb, th) {
    if (!("IntersectionObserver" in window)) { cb(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); cb(); } }, { threshold: th || 0.55 });
    io.observe(el);
  }

  const MAT = {
    jati: "Kayu jati", jati_ujung: "Kayu jati (penampang ujung)", sonokeling: "Kayu sonokeling", cane: "Cane (anyaman rotan)",
    kepar: "Rotan anyaman kepar", pitrit: "Pitrit (inti rotan)", lurik: "Kain lurik", lurik_tali: "Tali lurik",
    kanvas_abu: "Kanvas abu", kanvas_putih: "Kanvas putih", felt: "Felt pelindung lantai", cekungan: "Cekungan gelas (kayu jati)"
  };
  const mm = (x) => { const r = Math.round(x * 10) / 10; return (r % 1 === 0 ? String(r) : String(r).replace(".", ",")); };

  /* =========================================================
     Bab: penanda bagian yang sedang dibaca
     ========================================================= */
  function bab() {
    const nav = $("#chapters"); if (!nav) return;
    const links = $$("a", nav), ul = $("ul", nav);
    const secs = links.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
    let cur = null, tick = false;
    function set(i) {
      if (i === cur) return;
      cur = i;
      links.forEach((a, k) => { if (k === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      if (i != null && ul && ul.scrollWidth > ul.clientWidth) {
        const a = links[i];
        ul.scrollTo({ left: a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2, behavior: "smooth" });
      }
    }
    function calc() {
      tick = false;
      const line = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76) + 120;
      let found = null;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) found = i; });
      const last = secs[secs.length - 1];
      if (last && last.getBoundingClientRect().bottom < line) found = null;
      set(found);
    }
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(calc); } };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    calc();
  }

  /* =========================================================
     Panggung 3D
     ========================================================= */
  function hero() {
    const view = $("#stage-view"), host = $("#hero3d"), layer = $("#hs-layer"), load = $("#stage-load"), hud = $("#hud"), card = $("#part-card");
    if (!view || !host) return;
    const fail = () => {
      if (load) load.textContent = "Model 3D tidak bisa dimuat di perangkat ini. Gambar di atas adalah tampilan modelnya.";
      if (hud) hud.hidden = true;
      view.classList.add("is-failed");
    };
    if (!GL) { fail(); return; }
    let v = null, spots = [], forced = null, occAt = 0, ray = null, listCache = null;
    const autoBtn = $('[data-do="auto"]', hud);
    const tip = document.createElement("div");
    tip.className = "hover-tip"; tip.hidden = true; host.appendChild(tip);

    v = new KV(host, {
      model: C.model, autoRotate: true,
      onReady: () => safe("hero.ready", ready),
      onFail: fail,
      onPick: (m) => safe("hero.pick", () => pick(m)),
      onHover: (m, e) => safe("hero.hover", () => hover(m, e)),
      onFrame: () => safe("hero.frame", frame),
      onInteract: () => { pressed(autoBtn, false); }
    });
    if (v.failed) return;

    function ready() {
      const cv = v.stage.canvas;
      cv.removeAttribute("aria-hidden");
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", "Model 3D " + C.nama + ". Seret untuk memutar. Tombol panah memutar, tombol plus dan minus memperbesar dan memperkecil.");
      host.appendChild(layer);
      C.aksi.forEach((a) => v.defineAction({ id: a.id, group: a.group || undefined, codes: a.codes || undefined, move: a.move, ms: a.ms }));
      ray = new window.THREE.Raycaster();
      C.hotspots.forEach((h, i) => {
        const ms = v.byCode(h.code, h.side, h.re);
        if (!ms.length) return;
        const b = document.createElement("button");
        b.type = "button"; b.className = "hs"; b.tabIndex = -1;
        b.setAttribute("aria-label", "Lihat bagian: " + h.judul);
        b.setAttribute("aria-expanded", "false");
        b.innerHTML = "<i></i><span></span>";
        b.lastChild.textContent = h.judul;
        b.addEventListener("click", () => safe("hero.spot", () => openSpot(i)));
        layer.appendChild(b);
        spots.push({ i, h, ms, set: new Set(ms), el: b, occ: false, on: false, pos: new window.THREE.Vector3() });
      });
      setTimeout(() => view.classList.add("is-ready"), 260);
    }

    /* titik info mengikuti bagian kursi */
    function frame() {
      if (!spots.length) return;
      const now = performance.now(), doOcc = now - occAt > 170;
      if (doOcc) { occAt = now; listCache = v.meshes.filter((m) => m.visible && m.material.visible); }
      const cam = v.stage.camera, w = v.stage.w, h = v.stage.h;
      spots.forEach((s) => {
        s.pos.set(0, 0, 0);
        s.ms.forEach((m) => s.pos.add(v.partWorld(m)));
        s.pos.multiplyScalar(1 / s.ms.length);
        const p = v.project(s.pos);
        if (doOcc) {
          const dir = s.pos.clone().sub(cam.position), dist = dir.length();
          ray.set(cam.position, dir.normalize());
          ray.far = dist;
          const hit = ray.intersectObjects(listCache, false)[0];
          s.occ = !!hit && !s.set.has(hit.object) && hit.distance < dist - 0.05;
        }
        const on = p.z < 1 && p.x > 12 && p.x < w - 12 && p.y > 12 && p.y < h - 12 && !s.occ;
        s.el.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px)";
        if (on !== s.on) { s.on = on; s.el.classList.toggle("on", on); s.el.tabIndex = on ? 0 : -1; }
      });
    }

    function spotFor(m) { return spots.find((s) => s.set.has(m)) || null; }

    function openSpot(i) {
      const s = spots.find((x) => x.i === i); if (!s) return;
      if (v.selected && s.set.has(v.selected) && !card.hidden) { closeCard(); return; }
      forced = s;
      v.select(s.ms[0]);
      forced = null;
      aim(s);
    }
    function aim(s) {
      const w = v.partWorld(s.ms[0]), sg = w.x >= 0 ? 1 : -1, vw = s.h.view;
      const th = vw === "depan" ? 0 : vw === "belakang" ? Math.PI : vw === "samping" ? sg * Math.PI / 2 : vw === "serong" ? sg * 0.75 : vw === "atas" ? 0 : v.home.theta;
      const ph = vw === "atas" ? 0.4 : vw === "samping" ? 1.36 : vw === "belakang" ? 1.3 : 1.2;
      v.orbit.auto = 0; pressed(autoBtn, false);
      v.orbit.flyTo({ theta: th, phi: ph, radius: Math.max(v.orbit.min * 1.12, v.home.r * 0.58), x: w.x, y: w.y, z: w.z }, 950);
      v.userMoved = true; v.stage.invalidate();
    }

    function pick(m) {
      if (!m) { closeCard(true); return; }
      const s = forced || spotFor(m);
      showCard(m, s);
      spots.forEach((x) => x.el.setAttribute("aria-expanded", x === s ? "true" : "false"));
    }
    function showCard(m, s) {
      const p = m.userData.part, n = v.meshes.filter((x) => x.userData.part.code === p.code && x.userData.gid === m.userData.gid).length;
      $("#pc-code").textContent = p.code;
      $("#pc-name").textContent = s ? s.h.judul : p.name;
      $("#pc-text").textContent = s ? s.h.teks : "";
      const rows = [];
      if (s) rows.push(["Bagian", p.name]);
      rows.push(["Bahan", MAT[p.m] || p.m], ["Ukuran", p.d.map(mm).join(" × ") + " mm"], ["Jumlah", n + " buah"]);
      const dl = $("#pc-dl"); dl.textContent = "";
      rows.forEach(([a, b]) => { const d = document.createElement("div"), t = document.createElement("dt"), e = document.createElement("dd"); t.textContent = a; e.textContent = b; d.append(t, e); dl.appendChild(d); });
      $("#pc-ev").innerHTML = '<span class="ev ukur" title="Ukuran diukur dari model 3D SketchUp">Ukur 3D</span>';
      card.hidden = false;
      card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
    }
    function closeCard(fromViewer) {
      card.hidden = true;
      spots.forEach((x) => x.el.setAttribute("aria-expanded", "false"));
      if (!fromViewer && v.selected) v.select(null);
    }
    $("#pc-x").addEventListener("click", () => closeCard());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !card.hidden) closeCard(); });

    function hover(m, e) {
      if (!m || !e || e.pointerType === "touch") { tip.hidden = true; return; }
      const p = m.userData.part, r = host.getBoundingClientRect();
      tip.textContent = p.code + "  " + p.name;
      tip.hidden = false;
      const x = clamp(e.clientX - r.left + 16, 8, r.width - tip.offsetWidth - 8), y = clamp(e.clientY - r.top + 18, 8, r.height - 40);
      tip.style.transform = "translate(" + x + "px," + y + "px)";
    }

    /* kendali di panel */
    const tabs = $$("[data-tab]", hud), panels = $$("[data-panel]", hud);
    tabs.forEach((b) => b.addEventListener("click", () => {
      tabs.forEach((x) => pressed(x, x === b));
      panels.forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.tab; });
    }));
    const only = (sel, fn, group) => $$(sel, hud).forEach((b) => b.addEventListener("click", () => {
      $$(sel, hud).forEach((x) => pressed(x, x === b));
      fn(b);
    }));
    only("[data-mode]", (b) => v.setMode(b.dataset.mode));
    $$("[data-view]", hud).forEach((b) => b.addEventListener("click", () => { v.view(b.dataset.view); pressed(autoBtn, false); }));
    $$("[data-layer]", hud).forEach((b) => b.addEventListener("click", () => { const on = b.getAttribute("aria-pressed") !== "true"; pressed(b, on); v.setLayer(b.dataset.layer, on); }));
    $$("[data-group]", hud).forEach((b) => b.addEventListener("click", () => { const on = b.getAttribute("aria-pressed") !== "true"; pressed(b, on); v.setGroupVisible(b.dataset.group, on); }));
    $$("[data-act]", hud).forEach((b) => b.addEventListener("click", () => { const on = b.getAttribute("aria-pressed") !== "true"; pressed(b, on); v.setAction(b.dataset.act, on); }));

    const ex = $("#explode");
    let exRaf = 0;
    ex.addEventListener("input", () => { cancelAnimationFrame(exRaf); v.setExplode(ex.value / 100); });
    function tweenExplode(to) {
      cancelAnimationFrame(exRaf);
      const from = ex.value / 100, t0 = performance.now();
      const step = (now) => {
        const k = ease((now - t0) / 650), val = lerp(from, to, k);
        ex.value = Math.round(val * 100); v.setExplode(val);
        if (k < 1) exRaf = requestAnimationFrame(step);
      };
      exRaf = requestAnimationFrame(step);
    }
    const go = {
      auto: (b) => { const on = b.getAttribute("aria-pressed") !== "true"; pressed(b, on); v.setAuto(on); },
      in: () => v.zoom(0.8),
      out: () => v.zoom(1.25),
      free: (b) => { const on = b.getAttribute("aria-pressed") !== "true"; pressed(b, on); v.orbit.setFree(on); },
      reset: () => { v.view("home"); closeCard(); pressed(autoBtn, false); },
      rapat: () => tweenExplode(0)
    };
    $$("[data-do]", hud).forEach((b) => b.addEventListener("click", () => { const f = go[b.dataset.do]; if (f) f(b); }));
  }

  /* =========================================================
     Animasi rakit
     ========================================================= */
  function rakit() {
    const host = $("#asm-host"); if (!host) return;
    const total = C.steps.length;
    const btn = $("#asm-play"), rg = $("#asm-range"), timeEl = $("#asm-time"), cap = $("#asm-cap"), list = $$("#asm-steps .step");
    let av = null, stopAt = null, ready = false, wantAuto = false, autoDone = false, t = total;

    const fallback = () => {
      const w = $(".asm-wait", host);
      if (w) w.textContent = "Animasi 3D tidak bisa dimuat di perangkat ini. Urutan rakit tetap bisa dibaca di daftar langkah.";
      btn.disabled = true; rg.disabled = true;
    };
    if (!GL) { fallback(); return; }

    function capText(i) {
      const s = C.steps[i];
      cap.textContent = "";
      const b = document.createElement("b"), x = document.createElement("span");
      b.textContent = "Langkah " + (i + 1) + ". " + s.judul + ". "; x.className = "t"; x.textContent = s.teks;
      cap.append(b, x);
    }
    function ui(tt) {
      t = tt;
      rg.value = Math.round(tt * 100);
      if (tt >= total - 0.02) {
        timeEl.textContent = "Selesai, " + total + " langkah";
        list.forEach((li) => { li.classList.add("done"); li.classList.remove("on"); });
        cap.textContent = "";
        const b = document.createElement("b"), x = document.createElement("span");
        b.textContent = "Kursi sudah utuh. "; x.className = "t"; x.textContent = "Tekan Putar atau geser penggeser untuk melihat urutan rakitnya lagi.";
        cap.append(b, x);
        return;
      }
      const i = clamp(Math.floor(tt + 1e-6), 0, total - 1);
      timeEl.textContent = "Langkah " + (i + 1) + " dari " + total;
      list.forEach((li, k) => { li.classList.toggle("on", k === i); li.classList.toggle("done", k < i); });
      capText(i);
    }
    function setPlaying(on) { pressed(btn, on); setLbl(btn, on ? "Jeda" : "Putar"); }
    function play(from, until) {
      if (!av || !ready) return;
      stopAt = until == null ? null : until;
      setPlaying(true);
      av.playAssembly(from, 0.62, () => { setPlaying(false); ui(total); });
    }
    function pause() { if (av) av.pauseAssembly(); setPlaying(false); }

    near(host, () => safe("rakit.init", () => {
      av = new KV(host, {
        model: C.model, autoRotate: false, noPick: true,
        onFail: () => { fallback(); },
        onReady: () => safe("rakit.ready", () => {
          const cv = av.stage.canvas;
          cv.removeAttribute("aria-hidden"); cv.setAttribute("role", "img");
          cv.setAttribute("aria-label", "Animasi 3D rakit " + C.nama + ". Seret untuk memutar.");
          av.setupAssembly(C.steps.map((s) => ({ parts: s.parts, from: s.dari, park: s.park, join: s.join, stag: s.stag })));
          av.home.r *= 1.22; av.orbit.radius = av.home.r; av.orbit.target.y += 0.1; av.orbit.apply();
          av.setAssemblyTime(total);
          host.classList.add("is-ready");
          ready = true;
          ui(total);
          if (wantAuto && !autoDone) { autoDone = true; play(0); }
        }),
        onAssemblyTime: (tt) => {
          if (stopAt != null && tt >= stopAt) {
            const to = stopAt; stopAt = null;
            av.pauseAssembly(); setPlaying(false);
            requestAnimationFrame(() => { av.setAssemblyTime(to); ui(to); });
            return;
          }
          ui(tt);
        }
      });
      if (av.failed) return;
    }));
    seen(host, () => { wantAuto = true; if (ready && !autoDone) { autoDone = true; play(0); } }, 0.6);

    btn.addEventListener("click", () => {
      if (!ready) return;
      if (av.playing) { pause(); return; }
      play(t >= total - 0.02 ? 0 : t);
    });
    rg.addEventListener("input", () => {
      if (!ready) return;
      pause(); stopAt = null;
      const tt = rg.value / 100;
      av.setAssemblyTime(tt); ui(tt);
    });
    list.forEach((li, i) => $(".step-btn", li).addEventListener("click", () => {
      if (!ready) return;
      pause();
      av.setAssemblyTime(i); ui(i);
      play(i, i + 0.995);
    }));
  }

  /* =========================================================
     Animasi sambungan
     ========================================================= */
  function sambungan() {
    const sec = $("#sambungan"); if (!sec) return;
    const host = $("#jnt-host"), play = $("#jnt-play"), xr = $("#jnt-xray"), rg = $("#jnt-range"), cap = $("#jnt-cap");
    const tabs = $$('[role="tab"]', sec), items = $$(".jnt-item", sec);
    let jv = null, cur = C.joints[0], autoDone = false, seenOnce = false;
    const setPlaying = (on) => { pressed(play, on); setLbl(play, on ? "Jeda" : "Rakit"); };
    const fallback = () => {
      const w = $(".asm-wait", host);
      if (w) w.textContent = "Animasi 3D tidak bisa dimuat di perangkat ini. Penjelasan sambungan ada di sebelah.";
      [play, xr, rg].forEach((x) => { x.disabled = true; });
    };
    function choose(id, focus) {
      cur = C.joints.find((j) => j.id === id) || C.joints[0];
      tabs.forEach((t) => { const on = t.dataset.joint === cur.id; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      items.forEach((it) => { it.hidden = it.dataset.joint !== cur.id; });
      if (jv && !jv.failed) {
        jv.show(cur);
        setTimeout(() => { if (jv && inView(host)) { jv.play(); setPlaying(true); } }, 380);
      }
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => choose(t.dataset.joint));
      t.addEventListener("keydown", (e) => {
        let k = null;
        if (e.key === "ArrowRight") k = (i + 1) % tabs.length; else if (e.key === "ArrowLeft") k = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") k = 0; else if (e.key === "End") k = tabs.length - 1;
        if (k != null) { e.preventDefault(); choose(tabs[k].dataset.joint, true); }
      });
    });
    if (!GL || !window.KursiJoint) { fallback(); return; }
    near(host, () => safe("sambungan.init", () => {
      jv = new window.KursiJoint(host, {
        onFail: fallback,
        onCaption: (t) => { cap.textContent = t; },
        onTime: (t) => { rg.value = Math.round(t * 100); },
        onEnd: () => { setPlaying(false); },
        onShow: (def, c) => { rg.value = 0; setPlaying(false); xr.hidden = !!c.noXray; pressed(xr, jv.xray); }
      });
      if (jv.failed) return;
      jv.show(cur);
      if (seenOnce && !autoDone) { autoDone = true; jv.play(); setPlaying(true); }
    }));
    seen(host, () => { seenOnce = true; if (jv && !jv.failed && !autoDone) { autoDone = true; jv.play(); setPlaying(true); } }, 0.6);
    play.addEventListener("click", () => {
      if (!jv || jv.failed) return;
      if (jv.playing) { jv.pause(); setPlaying(false); } else { jv.play(); setPlaying(true); }
    });
    xr.addEventListener("click", () => { if (!jv || jv.failed) return; const on = !jv.xray; jv.setXray(on); pressed(xr, on); });
    rg.addEventListener("input", () => { if (!jv || jv.failed) return; jv.setTime(rg.value / 100); setPlaying(false); });
  }

  /* =========================================================
     Animasi anyaman (kanvas 2D). Pola cane mengikuti tekstur cane.webp:
     pasangan serat tipis tegak dan mendatar di batas kotak, dua arah serat diagonal lebar
     yang memotong tiap kotak sehingga lubangnya berbentuk segi delapan.
     ========================================================= */
  function anyaman() {
    const sec = $("#anyaman"); if (!sec) return;
    const cv = $("#weave-cv"), play = $("#weave-play"), rg = $("#weave-range"), cap = $("#weave-cap");
    const ctx = cv.getContext && cv.getContext("2d"); if (!ctx) return;
    const tabs = $$('[role="tab"]', sec), items = $$(".weave-item", sec);
    const W = 720, H = 540, RX = 60, RY = 70, RW = 600, RH = 400;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);

    const PAL = {
      v: [[0, "#8B5F2A"], [0.2, "#C99C58"], [0.5, "#EBCB8C"], [0.8, "#C99C58"], [1, "#8B5F2A"]],
      h: [[0, "#85592A"], [0.2, "#C19250"], [0.5, "#E2C080"], [0.8, "#C19250"], [1, "#85592A"]],
      d1: [[0, "#8F6430"], [0.2, "#D0A25F"], [0.5, "#F0D497"], [0.8, "#D0A25F"], [1, "#8F6430"]],
      d2: [[0, "#8A5E2C"], [0.2, "#CB9D59"], [0.5, "#EACB8D"], [0.8, "#CB9D59"], [1, "#8A5E2C"]],
      warp: [[0, "#8A5F2C"], [0.16, "#C99B57"], [0.5, "#E9C98A"], [0.84, "#C99B57"], [1, "#8A5F2C"]],
      weft: [[0, "#7E5528"], [0.16, "#BE8F4E"], [0.5, "#DDB979"], [0.84, "#BE8F4E"], [1, "#7E5528"]],
      round: [[0, "#6F4D24"], [0.28, "#C79C5A"], [0.46, "#F2DAA3"], [0.7, "#C39A58"], [1, "#6C4A22"]]
    };

    function rr(c, x, y, w, h, r) {
      c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    }
    function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

    /* bingkai kayu jati sebagai latar */
    const frame = (() => {
      const f = document.createElement("canvas"); f.width = cv.width; f.height = cv.height;
      const c = f.getContext("2d"); c.scale(dpr, dpr);
      c.save(); c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 28; c.shadowOffsetY = 12;
      rr(c, RX - 30, RY - 30, RW + 60, RH + 60, 16); c.fillStyle = "#8A5D35"; c.fill(); c.restore();
      const g = c.createLinearGradient(0, RY - 30, 0, RY + RH + 30);
      g.addColorStop(0, "#C69864"); g.addColorStop(0.5, "#A8774A"); g.addColorStop(1, "#86592F");
      rr(c, RX - 30, RY - 30, RW + 60, RH + 60, 16); c.fillStyle = g; c.fill();
      c.save(); rr(c, RX - 30, RY - 30, RW + 60, RH + 60, 16); c.clip();
      const rnd = mulberry(7);
      for (let i = 0; i < 70; i++) {
        const y = RY - 30 + rnd() * (RH + 60), x0 = RX - 30 + rnd() * 120, x1 = x0 + 140 + rnd() * 380;
        c.strokeStyle = "rgba(70,38,12," + (0.05 + rnd() * 0.12).toFixed(3) + ")"; c.lineWidth = 0.6 + rnd() * 1.4;
        c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + (rnd() - 0.5) * 8, x1, y + (rnd() - 0.5) * 4); c.stroke();
      }
      c.restore();
      rr(c, RX - 9, RY - 9, RW + 18, RH + 18, 6); c.fillStyle = "#3A2413"; c.fill();
      c.fillStyle = "#130F29"; c.fillRect(RX, RY, RW, RH);
      const ig = c.createLinearGradient(0, RY, 0, RY + 30); ig.addColorStop(0, "rgba(0,0,0,.6)"); ig.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = ig; c.fillRect(RX, RY, RW, 30);
      const il = c.createLinearGradient(RX, 0, RX + 30, 0); il.addColorStop(0, "rgba(0,0,0,.5)"); il.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = il; c.fillRect(RX, RY, 30, RH);
      return f;
    })();

    /* satu serat: pita dengan gradasi gelap-terang-gelap dan bayangan kecil di bawahnya */
    function ribbon(c, x0, y0, x1, y1, w, pal, noShadow) {
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
      if (len < 0.3) return;
      const a = Math.atan2(dy, dx), ca = Math.cos(a), sa = Math.sin(a);
      c.save();
      c.translate((x0 + x1) / 2, (y0 + y1) / 2); c.rotate(a);
      if (!noShadow) { c.fillStyle = "rgba(14,6,0,.34)"; c.fillRect(-len / 2 + 1.3 * ca + 2 * sa, -w / 2 - 1.3 * sa + 2 * ca, len, w); }
      const g = c.createLinearGradient(0, -w / 2, 0, w / 2);
      for (let i = 0; i < pal.length; i++) g.addColorStop(pal[i][0], pal[i][1]);
      c.fillStyle = g; c.fillRect(-len / 2, -w / 2, len, w);
      c.restore();
    }
    function head(c, x, y) {
      const g = c.createRadialGradient(x, y, 0, x, y, 13);
      g.addColorStop(0, "rgba(255,236,190,.95)"); g.addColorStop(1, "rgba(255,200,120,0)");
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 13, 0, Math.PI * 2); c.fill();
    }
    const stag = (p, i, n, spread) => ease((p - spread * (i / Math.max(1, n - 1))) / (1 - spread));

    /* ---------- cane segi delapan ---------- */
    const cane = (() => {
      const P = 100, sw = 12, off = 7.5, dw = 13.5, S = [];
      const add = (o) => { o.dx = o.x1 - o.x0; o.dy = o.y1 - o.y0; o.len = Math.hypot(o.dx, o.dy); o.ux = o.dx / o.len; o.uy = o.dy / o.len; o.cross = []; S.push(o); return o; };
      for (let i = 0; i <= 6; i++) for (const s of [-1, 1]) add({ k: "V", step: 0, n: i, w: sw, pal: PAL.v, x0: i * P + s * off, y0: -8, x1: i * P + s * off, y1: RH + 8 });
      for (let j = 0; j <= 4; j++) for (const s of [-1, 1]) add({ k: "H", step: 1, n: j, w: sw, pal: PAL.h, x0: -8, y0: j * P + s * off, x1: RW + 8, y1: j * P + s * off });
      const e = 8 / Math.SQRT2;
      for (let m = 0; m <= 9; m++) {   /* "/" : x + y = c */
        const c0 = 50 + 100 * m, xs = Math.max(0, c0 - RH), xe = Math.min(RW, c0);
        add({ k: "/", step: 2, n: m, w: dw, pal: PAL.d1, x0: xs - e, y0: c0 - xs + e, x1: xe + e, y1: c0 - xe - e });
      }
      for (let m = -4; m <= 5; m++) {  /* "\" : x - y = c */
        const c0 = 50 + 100 * m, ys = Math.max(0, -c0), ye = Math.min(RH, RW - c0);
        add({ k: "\\", step: 3, n: m, w: dw, pal: PAL.d2, x0: c0 + ys - e, y0: ys - e, x1: c0 + ye + e, y1: ye + e });
      }
      /* titik silang: yang lebih akhir ada di atas atau di bawah, bergantian */
      for (const B of S) for (const A of S) {
        if (A.step >= B.step) continue;
        const den = A.ux * B.uy - A.uy * B.ux;
        if (Math.abs(den) < 1e-6) continue;
        const sx = B.x0 - A.x0, sy = B.y0 - A.y0;
        const ta = (sx * B.uy - sy * B.ux) / den, tb = (sx * A.uy - sy * A.ux) / den;
        if (ta < 0 || ta > A.len || tb < 0 || tb > B.len) continue;
        const x = A.x0 + A.ux * ta, y = A.y0 + A.uy * ta;
        if (x < -1 || x > RW + 1 || y < -1 || y > RH + 1) continue;
        B.cross.push({ A, x, y, sB: tb, over: (((A.n + B.n) % 2) + 2) % 2 === 0 ? "B" : "A", L: B.w / Math.abs(den) + 3 });
      }
      const by = [0, 1, 2, 3].map((s) => S.filter((o) => o.step === s));
      return {
        n: 4, dur: 13,
        draw(c, k, p) {
          for (let s = 0; s <= k; s++) {
            const pr = s < k ? 1 : p, list = by[s];
            list.forEach((B, idx) => {
              const lp = pr >= 1 ? 1 : stag(pr, idx, list.length, 0.55);
              if (lp <= 0) return;
              const ex = B.x0 + B.dx * lp, ey = B.y0 + B.dy * lp;
              ribbon(c, B.x0, B.y0, ex, ey, B.w, B.pal);
              B.cross.forEach((cr) => {
                if (cr.over !== "A" || cr.sB > B.len * lp) return;
                const A = cr.A;
                ribbon(c, cr.x - A.ux * cr.L / 2, cr.y - A.uy * cr.L / 2, cr.x + A.ux * cr.L / 2, cr.y + A.uy * cr.L / 2, A.w, A.pal);
              });
              if (lp < 1) head(c, ex, ey);
            });
          }
        }
      };
    })();

    /* ---------- anyaman tegak-mendatar: kepar dan pitrit ---------- */
    function grid(cfg) {
      const P = cfg.pitch, Cn = Math.floor(RW / P), Rn = Math.floor(RH / P), mid = Math.floor(Cn / 2);
      return {
        n: 3, dur: cfg.dur,
        draw(c, k, p) {
          const wd = cfg.width(k, p), flip = cfg.flip && k === 2 ? p : 0;
          const cx = (i) => i * P + P / 2, cy = (r) => r * P + P / 2;
          const wp = k === 0 ? p : 1;
          for (let i = 0; i < Cn; i++) {
            const lp = wp >= 1 ? 1 : stag(wp, i, Cn, 0.6);
            if (lp > 0) { ribbon(c, cx(i), 0, cx(i), Rn * P * lp, wd, PAL[cfg.warp]); if (lp < 1) head(c, cx(i), Rn * P * lp); }
          }
          if (k < 1) return;
          const rev = k === 1 ? p * Rn : Rn;
          for (let r = 0; r < Rn; r++) {
            const lr = clamp(rev - r, 0, 1);
            if (lr > 0) { const ex = Cn * P * ease(lr); ribbon(c, 0, cy(r), ex, cy(r), wd, PAL[cfg.weft]); if (lr < 1) head(c, ex, cy(r)); }
          }
          const fl = (i) => cfg.flip && i >= mid && (i - mid) < flip * (Cn - mid);
          for (let i = 0; i < Cn; i++) {
            let r0 = -1;
            const close = (r1) => { if (r0 >= 0) { ribbon(c, cx(i), r0 * P, cx(i), (r1 + 1) * P, wd, PAL[cfg.warp]); r0 = -1; } };
            for (let r = 0; r < Rn; r++) {
              const lr = clamp(rev - r, 0, 1), woven = lr > 0 && (i + 1) * P <= Cn * P * ease(lr) + 0.5;
              if (woven && cfg.over(r, i, fl(i), Cn)) { if (r0 < 0) r0 = r; } else close(r - 1);
            }
            close(Rn - 1);
          }
          if (cfg.flip && k === 2) {
            c.save(); c.strokeStyle = "rgba(255,214,150," + (0.7 * Math.sin(Math.PI * p)).toFixed(3) + ")"; c.lineWidth = 2; c.setLineDash([6, 6]);
            c.beginPath(); c.moveTo(mid * P, -10); c.lineTo(mid * P, Rn * P + 10); c.stroke(); c.restore();
          }
        }
      };
    }
    const kepar = grid({ pitch: 20, dur: 11, warp: "warp", weft: "weft", flip: true,
      width: () => 18.2,
      over: (r, i, f, Cn) => ((((f ? Cn - 1 - i : i) + r) % 4) + 4) % 4 < 2 });
    const pitrit = grid({ pitch: 20, dur: 10, warp: "round", weft: "round", flip: false,
      width: (k, p) => (k < 2 ? 11 : lerp(11, 18.4, ease(p))),
      over: (r, i) => (r + i) % 2 === 0 });
    const MODEL = { cane8: cane, kepar, pitrit };

    /* ---------- pemutar ---------- */
    let kind = tabs.length ? tabs[0].dataset.weave : "cane8";
    let t = 1, playing = false, stopAt = null, raf = 0, last = 0, autoDone = false;
    const nOf = () => (D.weaves[kind] || { langkah: [] }).langkah.length || MODEL[kind].n;
    const panel = () => items.find((it) => it.dataset.weave === kind);

    function render() {
      const M = MODEL[kind], n = nOf();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(frame, 0, 0, W, H);
      const u = t * n, k = Math.min(n - 1, Math.floor(u + 1e-9)), p = t >= 1 ? 1 : u - k;
      ctx.save(); ctx.beginPath(); ctx.rect(RX, RY, RW, RH); ctx.clip(); ctx.translate(RX, RY);
      M.draw(ctx, k, p);
      ctx.restore();
      rg.value = Math.round(t * 100);
      const info = D.weaves[kind], pn = panel();
      const lis = pn ? $$(".weave-steps li", pn) : [];
      lis.forEach((li, i) => li.classList.toggle("on", t > 0 && i === k));
      cap.textContent = "";
      const b = document.createElement("b"), x = document.createElement("span");
      if (t <= 0) { b.textContent = "Siap dianyam. "; x.className = "t"; x.textContent = "Tekan Putar untuk melihat urutannya."; }
      else { b.textContent = "Langkah " + (k + 1) + " dari " + n + ". "; x.className = "t"; x.textContent = info.langkah[k] || ""; }
      cap.append(b, x);
    }
    function setPlaying(on) { playing = on; pressed(play, on); setLbl(play, on ? "Jeda" : "Putar"); }
    function loop(ts) {
      if (!playing) return;
      const dt = Math.min(0.06, (ts - last) / 1000); last = ts;
      t = Math.min(1, t + dt / MODEL[kind].dur);
      let end = t >= 1;
      if (stopAt != null && t >= stopAt) { t = stopAt; end = true; }
      render();
      if (end) { stopAt = null; setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    }
    function start(from, until) {
      cancelAnimationFrame(raf);
      t = from; stopAt = until == null ? null : until;
      setPlaying(true); last = performance.now(); render();
      raf = requestAnimationFrame(loop);
    }
    function stop() { cancelAnimationFrame(raf); setPlaying(false); }

    function choose(id, focus) {
      kind = MODEL[id] ? id : kind;
      tabs.forEach((x) => { const on = x.dataset.weave === kind; x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1; if (on && focus) x.focus(); });
      items.forEach((it) => { it.hidden = it.dataset.weave !== kind; });
      stop(); t = 0; render();
      if (inView(cv)) setTimeout(() => { if (!playing && t === 0) start(0); }, 320);
    }
    tabs.forEach((x, i) => {
      x.addEventListener("click", () => choose(x.dataset.weave));
      x.addEventListener("keydown", (e) => {
        let k = null;
        if (e.key === "ArrowRight") k = (i + 1) % tabs.length; else if (e.key === "ArrowLeft") k = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") k = 0; else if (e.key === "End") k = tabs.length - 1;
        if (k != null) { e.preventDefault(); choose(tabs[k].dataset.weave, true); }
      });
    });
    items.forEach((it) => $$(".weave-steps li", it).forEach((li, i) => $("button", li).addEventListener("click", () => { const n = nOf(); start(i / n, (i + 1) / n - 0.0004); })));
    play.addEventListener("click", () => { if (playing) stop(); else start(t >= 1 ? 0 : t); });
    rg.addEventListener("input", () => { stop(); t = rg.value / 100; render(); });
    render();
    seen(cv, () => { if (!autoDone && !playing) { autoDone = true; start(0); } }, 0.6);
  }

  /* =========================================================
     Penampil gambar kerja
     ========================================================= */
  function gambar() {
    const stage = $("#dw-stage"), img = $("#dw-img"); if (!stage || !img) return;
    const th = $("#dw-thumbs"), open = $("#dw-open"), cap = $("#dw-cap");
    let sheets = []; try { sheets = JSON.parse(th.getAttribute("data-sheets") || "[]"); } catch (e) { sheets = []; }
    let s = 1, tx = 0, ty = 0;
    const MAXZ = 6;
    const apply = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      tx = clamp(tx, w - w * s, 0); ty = clamp(ty, h - h * s, 0);
      img.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + s.toFixed(3) + ")";
      stage.classList.toggle("zoomed", s > 1.001);
    };
    function zoomAt(f, cx, cy) {
      const ns = clamp(s * f, 1, MAXZ), k = ns / s;
      tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; s = ns; apply();
    }
    const center = () => [stage.clientWidth / 2, stage.clientHeight / 2];
    const fit = () => { s = 1; tx = 0; ty = 0; apply(); };
    $$("[data-dw]").forEach((b) => b.addEventListener("click", () => {
      const m = b.dataset.dw; if (m === "fit") return fit();
      const c = center(); zoomAt(m === "in" ? 1.5 : 1 / 1.5, c[0], c[1]);
    }));
    const pts = new Map(); let pinch = 0, moved = 0;
    stage.addEventListener("pointerdown", (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); stage.setPointerCapture(e.pointerId); moved = 0; if (pts.size === 2) { const a = [...pts.values()]; pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1; } });
    stage.addEventListener("pointermove", (e) => {
      const p = pts.get(e.pointerId); if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y; moved += Math.abs(dx) + Math.abs(dy);
      if (pts.size === 1 && s > 1.001) { tx += dx; ty += dy; apply(); }
      else if (pts.size === 2) {
        const o = [...pts.entries()].find(([id]) => id !== e.pointerId)[1], now = Math.hypot(e.clientX - o.x, e.clientY - o.y) || 1;
        const r = stage.getBoundingClientRect(); zoomAt(now / pinch, (e.clientX + o.x) / 2 - r.left, (e.clientY + o.y) / 2 - r.top); pinch = now;
      }
      p.x = e.clientX; p.y = e.clientY;
    });
    const up = (e) => { pts.delete(e.pointerId); pinch = 0; };
    stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
    stage.addEventListener("wheel", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault(); const r = stage.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * 0.0025), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    stage.addEventListener("dblclick", (e) => { const r = stage.getBoundingClientRect(); if (s > 1.001) fit(); else zoomAt(2.5, e.clientX - r.left, e.clientY - r.top); });
    stage.addEventListener("keydown", (e) => {
      const c = center(), st = 60;
      if (e.key === "+" || e.key === "=") zoomAt(1.4, c[0], c[1]);
      else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.4, c[0], c[1]);
      else if (e.key === "0") fit();
      else if (s > 1.001 && e.key === "ArrowLeft") { tx += st; apply(); }
      else if (s > 1.001 && e.key === "ArrowRight") { tx -= st; apply(); }
      else if (s > 1.001 && e.key === "ArrowUp") { ty += st; apply(); }
      else if (s > 1.001 && e.key === "ArrowDown") { ty -= st; apply(); }
      else return;
      e.preventDefault();
    });
    window.addEventListener("resize", apply);
    const btns = $$("button[data-i]", th);
    btns.forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.i, sh = sheets[i]; if (!sh) return;
      btns.forEach((x) => pressed(x, x === b));
      img.src = sh[0]; img.alt = "Lembar " + sh[1] + ": " + sh[2];
      open.href = sh[0];
      cap.textContent = "";
      const bb = document.createElement("b"); bb.textContent = sh[1];
      cap.append(bb, " " + sh[2] + ", skala " + sh[3] + ". " + sh[4]);
      fit();
    }));
  }

  /* =========================================================
     Hitungan biaya
     ========================================================= */
  function biaya() {
    const root = $("#rab-root"); if (!root) return;
    const R = C.rab;
    const GRP = { "Kayu": "c1", "Anyaman rotan": "c2", "Kain dan isi bantal": "c3", "Perlengkapan": "c4", "Finishing": "c5" };
    const parse = (s) => { const x = parseFloat(String(s).replace(/[^\d,]/g, "").replace(",", ".")); return isFinite(x) ? x : 0; };
    const st = { price: {}, jam: R.jam.slice(), waste: D.waste, rate: R.rate, margin: D.margin };
    R.lines.forEach((l) => { st.price[l[0]] = l[4]; });
    const inWaste = $("#in-waste"), inRate = $("#in-rate"), inMargin = $("#in-margin");
    const bars = {}; $$("#rab-bars li").forEach((li) => { bars[li.dataset.k] = li; });

    function calc() {
      let bahan = 0; const cat = { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 };
      R.lines.forEach((l) => {
        const sub = l[2] * (l[5] ? 1 + st.waste : 1) * st.price[l[0]];
        bahan += sub; cat[GRP[l[6]] || "c4"] += sub;
        const tr = root.querySelector('tr[data-line="' + l[0] + '"] .sub'); if (tr) tr.textContent = rp(sub);
      });
      let upah = 0;
      st.jam.forEach((j, i) => {
        const sub = j * st.rate; upah += sub;
        const tr = root.querySelector('tr[data-jam="' + i + '"]');
        if (tr) { $(".sub", tr).textContent = rp(sub); const r = $(".rate", tr); if (r) r.textContent = num(st.rate); }
      });
      const hpp = bahan + upah, harga = Math.round(hpp * (1 + st.margin) / 100) * 100, margin = hpp * st.margin;
      const vals = { c1: cat.c1, c2: cat.c2, c3: cat.c3, c4: cat.c4, c5: cat.c5, c6: upah, c7: margin };
      const tot = Object.values(vals).reduce((a, b) => a + b, 0) || 1;
      const mx = Math.max.apply(null, Object.values(vals)) || 1;
      Object.keys(vals).forEach((k) => {
        const li = bars[k]; if (!li) return;
        const pct = vals[k] / tot * 100;
        $("[data-v]", li).textContent = rp(vals[k]);
        $("[data-p]", li).textContent = Math.round(pct) + "%";
        $(".trk i", li).style.setProperty("--w", (vals[k] / mx * 100).toFixed(2) + "%");
        li.title = $(".nm", li).textContent + ": " + rp(vals[k]) + " (" + Math.round(pct) + " persen)";
      });
      $("#rab-total").textContent = rp(harga);
      $("#rab-sub").textContent = "Bahan " + rp(bahan) + " + upah " + rp(upah) + " + margin " + String(Math.round(st.margin * 1000) / 10).replace(".", ",") + " persen";
    }
    root.addEventListener("input", (e) => {
      const el = e.target;
      if (el.classList.contains("in-price")) st.price[el.dataset.id] = parse(el.value);
      else if (el.classList.contains("in-jam")) st.jam[+el.dataset.i] = parse(el.value);
      else if (el === inWaste) st.waste = clamp(parse(el.value), 0, 300) / 100;
      else if (el === inRate) st.rate = parse(el.value);
      else if (el === inMargin) st.margin = clamp(parse(el.value), 0, 300) / 100;
      else return;
      calc();
    });
    root.addEventListener("focusout", (e) => {
      const el = e.target;
      if (el.classList.contains("in-price")) el.value = num(st.price[el.dataset.id]);
      else if (el.classList.contains("in-jam")) el.value = String(st.jam[+el.dataset.i]).replace(".", ",");
      else if (el === inRate) el.value = num(st.rate);
      else if (el === inWaste) el.value = String(Math.round(st.waste * 100));
      else if (el === inMargin) el.value = String(Math.round(st.margin * 100));
    });
    $("#rab-reset").addEventListener("click", () => {
      R.lines.forEach((l) => { st.price[l[0]] = l[4]; const i = root.querySelector('.in-price[data-id="' + l[0] + '"]'); if (i) i.value = num(l[4]); });
      st.jam = R.jam.slice(); $$(".in-jam", root).forEach((i) => { i.value = String(R.jam[+i.dataset.i]); });
      st.waste = D.waste; st.rate = R.rate; st.margin = D.margin;
      inWaste.value = String(Math.round(D.waste * 100)); inRate.value = num(R.rate); inMargin.value = String(Math.round(D.margin * 100));
      calc();
    });
    calc();
  }

  safe("bab", bab);
  safe("hero", hero);
  safe("rakit", rakit);
  safe("sambungan", sambungan);
  safe("anyaman", anyaman);
  safe("gambar", gambar);
  safe("biaya", biaya);
})();
