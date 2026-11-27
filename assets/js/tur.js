/* =========================================================
   Mesin tur 3D AURANDA (dipakai tur-auranda.html)
   Isi ruang, foto, dan titik pindah ada di tur-data.js. Geometri denah ada di tur-model.js.
   File ini hanya mesinnya. Urutan bagian:
   1. Alat bantu dan indeks data     5. Panorama 360 (WebGL) dan ukur di panorama
   2. Gambar denah (mini dan besar)  6. Kartu keterangan, daftar ruang, dialog
   3. Penampil foto                  7. Denah besar: geser, zoom, pilih, ukur jarak
   4. Pindah ruang dan kendali       8. Mode edit (?edit) dan start
   ========================================================= */
(function () {
  "use strict";
  var D = window.TUR_DATA, MODEL = window.TUR_MODEL;
  var root = document.getElementById("tur");
  if (!root) return;
  /* Animasi selalu penuh untuk semua pengunjung, juga kalau perangkat meminta gerak dikurangi. Kelas calm dari <head> dibuang (halaman ini tidak memakai main.js). */
  document.documentElement.classList.remove("calm");

  /* ---------------------------------------------------------
     1. Alat bantu dan indeks data
     --------------------------------------------------------- */
  const NS = "http://www.w3.org/2000/svg";
  const EDIT = /[?&]edit(=|&|$)/.test(location.search);
  const g = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rad = (d) => d * Math.PI / 180;
  const deg = (r) => r * 180 / Math.PI;
  const norm360 = (a) => ((a % 360) + 360) % 360;
  const nf = (n, d) => { const f = Math.pow(10, d); return (Math.round(n * f) / f).toFixed(d).replace(".", ","); };
  const thou = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const fmtM = (cm) => nf(cm / 100, 2) + " m";
  const WIND = ["Utara", "Timur laut", "Timur", "Tenggara", "Selatan", "Barat daya", "Barat", "Barat laut"];
  const compass = (a) => WIND[Math.round(norm360(a) / 45) % 8];
  const isNarrow = () => window.matchMedia("(max-width:720px)").matches;

  function S(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function H(tag, cls, parent) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function toast(msg, ms) {
    const t = el.toast; if (!t) return;
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("on"), ms || 3200);
  }
  function fail(msg) {
    const p = document.createElement("p");
    p.className = "tur-toast on"; p.textContent = msg; root.appendChild(p);
  }
  if (!D || !MODEL || !D.scenes || !D.scenes.length) { fail("Data tur belum termuat. Muat ulang halaman ini."); return; }

  /* Indeks ruang dan foto */
  const scenes = D.scenes.slice();
  const byId = {};
  scenes.forEach((s, i) => {
    s.i = i;
    s.type = s.type === "pano" ? "pano" : "photo";
    s.keys = Object.keys(s.v || {});
    s.fov = s.fov || 112;
    byId[s.id] = s;
  });
  const roomInfo = D.rooms || {};
  const mRooms = {};
  MODEL.rooms.forEach((r) => { mRooms[r.id] = r; });
  const NO_CEIL = { "ruang-tamu-luar": 1, "teras-depan": 1, "garasi": 1 };
  const TONE = { "ruang-tamu-luar": "out", "teras-depan": "out", "garasi": "out", "km-umum": "wet", "km-dalam-k1": "wet", "m-cuci": "wet", "dapur-2": "wet" };
  const toneOf = (id) => TONE[id] || "dry";

  /* Posisi di gambar bisa berupa larik, atau objek per suasana (siang, malam) */
  function pAt(p, variant) {
    if (Array.isArray(p)) return p;
    if (p && typeof p === "object") return p[variant] || p.siang || p[Object.keys(p)[0]] || null;
    return null;
  }
  function variantFor(s, want) {
    if (want && s.v[want]) return want;
    return s.v.siang ? "siang" : s.keys[0];
  }
  function fileInfo(s, variant) {
    const v = s.v[variant], f = v.f, base = D.base || "";
    const hasExt = /\.[a-z0-9]{3,4}$/i.test(f);
    const stem = hasExt ? f.replace(/\.[a-z0-9]+$/i, "") : f;
    return { full: base + (hasExt ? f : f + ".webp"), thumb: v.s ? base + v.s : base + stem + "-s.webp", ar: v.ar || 0 };
  }

  /* Model denah: ruang, perabot, sanitair */
  function rectPath(x0, y0, x1, y1) {
    return "M" + x0 + " " + (-y1) + "h" + (x1 - x0) + "v" + (y1 - y0) + "h" + (x0 - x1) + "z";
  }
  function roomAt(x, y) {
    for (let i = 0; i < MODEL.rooms.length; i++) {
      const r = MODEL.rooms[i];
      for (let j = 0; j < r.r.length; j++) {
        const q = r.r[j];
        if (x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3]) return r;
      }
    }
    return null;
  }
  function bigRect(r) {
    let best = r.r[0], a = 0;
    r.r.forEach((q) => { const s = (q[2] - q[0]) * (q[3] - q[1]); if (s > a) { a = s; best = q; } });
    return best;
  }
  const items = [];
  MODEL.furn.forEach((f) => items.push({ id: items.length, san: false, code: f[0], name: f[1], dim: f[2] || "", x0: f[3], y0: f[4], x1: f[5], y1: f[6], z0: f[7], z1: f[8] }));
  MODEL.sanit.forEach((f) => items.push({ id: items.length, san: true, code: f[0], name: f[1], dim: "", x0: f[2], y0: f[3], x1: f[4], y1: f[5], z0: f[6], z1: f[7] }));
  items.forEach((it) => { const r = roomAt((it.x0 + it.x1) / 2, (it.y0 + it.y1) / 2); it.room = r ? r.id : ""; });
  function prettyDim(s) {
    let t = String(s || "").replace(/\bt(\d+)\b/g, "tinggi $1");
    if (t && !/cm/.test(t)) t = t.replace(/^([^,]*?\d)(,|$)/, "$1 cm$2").replace(/(tinggi \d+)(?! cm)/g, "$1 cm");
    return t;
  }
  function itemSize(it) {
    return thou(Math.abs(it.x1 - it.x0)) + " × " + thou(Math.abs(it.y1 - it.y0)) + " × " + thou(it.z1 - it.z0) + " cm";
  }
  function fmtFFL(v) { return v === 0 ? "±0,00 m" : (v < 0 ? "−" : "+") + nf(Math.abs(v), 2) + " m"; }
  const OPKIND = { d: "Pintu", w: "Jendela", g: "Celah tanpa daun", t: "Gerbang" };

  /* Elemen halaman */
  const el = {
    stage: g("tur-stage"), la: g("tur-la"), lb: g("tur-lb"), gl: g("tur-gl"), pano: g("tur-pano"), ms: g("tur-ms"),
    load: g("tur-load"), where: g("tur-where"), quick: g("tur-quick"), title: $q(".tur-title"),
    mini: g("tur-mini"), miniSvg: g("tur-mini-svg"), head: g("tur-head"), day: g("tur-day"), read: g("tur-read"),
    info: g("tur-info"), handle: g("tur-handle"), iKick: g("tur-i-kick"), iTitle: g("tur-i-title"), iType: g("tur-i-type"),
    iFacts: g("tur-i-facts"), iText: g("tur-i-text"), iLists: g("tur-i-lists"), iMap: g("tur-i-map"), iNote: g("tur-i-note"),
    strip: g("tur-strip"), stripList: g("tur-strip-list"), more: g("tur-more"), toast: g("tur-toast"), live: g("tur-live"),
    intro: g("tur-intro"), start: g("tur-start"), mapd: g("tur-mapd"), mapView: g("tur-mapd-view"), mapSvg: g("tur-map-svg"), mapSide: g("tur-mapd-side"),
    help: g("tur-help"), helpNote: g("tur-help-note"), share: g("tur-share"), url: g("tur-url"), qrImg: g("tur-qr-img"), here: g("tur-here"),
    copy: g("tur-copy"), native: g("tur-native"),
    bPrev: g("b-prev"), bNext: g("b-next"), bRoom: g("b-room"), bMap: g("b-map"), bMeasure: g("b-measure"), bInfo: g("b-info"),
    bShare: g("b-share"), bHelp: g("b-help"), bFull: g("b-full"), bMore: g("b-more")
  };
  function $q(s) { return document.querySelector(s); }

  /* Keadaan tur */
  const st = {
    scene: null, variant: "siang", front: null, token: 0,
    vw: 0, vh: 0,
    view: { u: .5, v: .5, z: 1 },
    cam: { yaw: 0, pitch: 0, fov: 76 },
    pins: false, measure: false, infoOpen: true, mapOpen: false,
    seen: {}, hintT: 0, pinsHint: false
  };

  /* ---------------------------------------------------------
     2. Gambar denah (dipakai denah mini dan denah besar)
     Sumbu: x ke timur, y ke utara. Di SVG utara berada di atas, jadi y dibalik (sy = -y).
     Satuan gambar = cm. Variabel --k = jumlah cm per piksel layar, supaya garis dan huruf tetap rapi.
     --------------------------------------------------------- */
  const C = { x: MODEL.bounds[0], y: -MODEL.bounds[3], w: MODEL.bounds[2] - MODEL.bounds[0], h: MODEL.bounds[3] - MODEL.bounds[1] };

  function buildMap(svg, o) {
    const full = !!o.full, P = o.prefix;
    svg.textContent = "";
    const pad = full ? 80 : 14;
    const ctl = { svg: svg, full: full, k: 1, vb: [C.x - pad, C.y - pad, C.w + pad * 2, C.h + pad * 2], rooms: {}, items: {}, ops: [], marks: {}, labels: [], curId: null, heading: 0, span: 70 };
    svg.setAttribute("viewBox", ctl.vb.join(" "));
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const defs = S("defs", null, svg);
    const grad = (id, x1, y1, x2, y2, stops) => {
      const gr = S("linearGradient", { id: P + id, x1: x1, y1: y1, x2: x2, y2: y2 }, defs);
      stops.forEach((s) => S("stop", { offset: s[0], style: "stop-color:var(" + s[1] + ");stop-opacity:" + (s[2] == null ? 1 : s[2]) }, gr));
    };
    grad("dry", 0, 0, 1, 1, [[0, "--sky-soft"], [1, "--sun-soft"]]);
    grad("wet", 0, 0, 1, 1, [[0, "--sky-soft"], [1, "--sky", .75]]);
    grad("out", 0, 0, 1, 1, [[0, "--sun-soft"], [1, "--peach-soft"]]);
    grad("warm", 0, 0, 1, 1, [[0, "--sun"], [1, "--peach"]]);
    grad("dr", 0, 0, 1, 1, [[0, "--sky"], [1, "--accent-2"]]);
    grad("wn", 0, 0, 1, 1, [[0, "--sun-soft"], [1, "--sun"]]);
    grad("cone", 0, 1, 0, 0, [[0, "--sky", .95], [1, "--sky", .12]]);

    /* Pagar dan batas lahan: satu path saja supaya ringan */
    let d = "";
    MODEL.fence.forEach((r) => { d += rectPath(r[0], r[1], r[2], r[3]); });
    S("path", { "class": "m-fence", d: d }, svg);

    MODEL.rooms.forEach((r) => {
      let dd = "";
      r.r.forEach((q) => { dd += rectPath(q[0], q[1], q[2], q[3]); });
      ctl.rooms[r.id] = S("path", { "class": "m-room", d: dd, fill: "url(#" + P + toneOf(r.id) + ")", "data-room": r.id }, svg);
    });

    if (full) {
      const gFu = S("g", { "class": "m-furn" }, svg);
      items.forEach((it) => {
        const r = S("rect", { x: it.x0, y: -it.y1, width: it.x1 - it.x0, height: it.y1 - it.y0, "data-item": it.id }, gFu);
        if (it.san) r.setAttribute("class", "san");
        ctl.items[it.id] = r;
      });
      ctl.gFurn = gFu;
    }

    MODEL.sky.forEach((s) => S("rect", { "class": "m-sky", x: s[2], y: -s[5], width: s[4] - s[2], height: s[5] - s[3] }, svg));

    d = "";
    MODEL.walls.forEach((w) => { d += rectPath(w[0], w[1], w[2], w[3]); });
    S("path", { "class": "m-wall", d: d }, svg);

    MODEL.open.forEach((op, i) => {
      const kind = op[1];
      const a = { "class": "m-op " + kind, x: op[2], y: -op[5], width: op[4] - op[2], height: op[5] - op[3], "data-op": i };
      if (kind === "d") a.fill = "url(#" + P + "dr)"; else if (kind === "w") a.fill = "url(#" + P + "wn)"; else if (kind === "t") a.fill = "url(#" + P + "warm)";
      ctl.ops.push(S("rect", a, svg));
    });

    if (full) {
      const gL = S("g", { "class": "m-labels" }, svg);
      MODEL.rooms.forEach((r) => {
        const info = roomInfo[r.id] || {};
        const q = bigRect(r);
        const c = info.label || [(q[0] + q[2]) / 2, (q[1] + q[3]) / 2];
        const t = S("text", { "class": "m-lab", x: c[0], y: -c[1], dy: "-.2em" }, gL);
        const sub = S("text", { "class": "m-lab sub", x: c[0], y: -c[1], dy: "1.25em" }, gL);
        sub.textContent = nf(r.area, 2) + " m²";
        ctl.labels.push({ room: r, t: t, sub: sub, ab: info.ab || "", box: q });
      });
    }

    ctl.gCone = S("g", { "class": "m-cone-g" }, svg);
    ctl.cone = S("path", { "class": "m-cone", fill: "url(#" + P + "cone)" }, ctl.gCone);
    const gM = S("g", { "class": "m-scenes" }, svg);
    scenes.forEach((s) => {
      const mk = S("g", { "class": "m-mk", "data-scene": s.id }, gM);
      S("circle", { "class": "hit", r: 15 }, mk);
      S("circle", { "class": "pulse", r: 9 }, mk);
      S("circle", { "class": "d", r: 5, fill: "url(#" + P + "warm)" }, mk);
      ctl.marks[s.id] = mk;
    });
    ctl.gMeas = S("g", { "class": "m-meas" }, svg);

    /* Ukuran layar berubah atau denah di-zoom: hitung ulang cm per piksel */
    ctl.layout = function () {
      const w = svg.clientWidth || svg.getBoundingClientRect().width;
      if (!w) return false;
      ctl.k = ctl.vb[2] / w;
      svg.style.setProperty("--k", ctl.k.toFixed(5));
      scenes.forEach((s) => { ctl.marks[s.id].setAttribute("transform", "translate(" + s.pos[0] + " " + (-s.pos[1]) + ") scale(" + ctl.k.toFixed(5) + ")"); });
      ctl.setCone();
      if (full) ctl.labelFit();
      if (ctl.onLayout) ctl.onLayout();
      return true;
    };
    ctl.setVB = function (vb) {
      ctl.vb = vb;
      svg.setAttribute("viewBox", vb.map((n) => Math.round(n * 100) / 100).join(" "));
      ctl.layout();
    };
    ctl.fit = function () {
      const cw = svg.clientWidth, ch = svg.clientHeight;
      if (!cw || !ch) return;
      const m = Math.min(cw, ch) > 520 ? 44 : 16;
      const s = Math.min((cw - m * 2) / C.w, (ch - m * 2) / C.h);
      const w = cw / s, h = ch / s;
      ctl.fitW = w;
      ctl.setVB([C.x + C.w / 2 - w / 2, C.y + C.h / 2 - h / 2, w, h]);
    };
    ctl.setCone = function (h, span) {
      if (h != null) ctl.heading = h;
      if (span != null) ctl.span = span;
      const s = byId[ctl.curId];
      if (!s) return;
      const R = full ? 66 : 34;
      const a = rad(clamp(ctl.span, 18, 170) / 2);
      const x = R * Math.sin(a), y = -R * Math.cos(a);
      ctl.cone.setAttribute("d", "M0 0L" + (-x).toFixed(2) + " " + y.toFixed(2) + "A" + R + " " + R + " 0 0 1 " + x.toFixed(2) + " " + y.toFixed(2) + "Z");
      ctl.cone.setAttribute("transform", "rotate(" + ctl.heading.toFixed(2) + ")");
      ctl.gCone.setAttribute("transform", "translate(" + s.pos[0] + " " + (-s.pos[1]) + ") scale(" + ctl.k.toFixed(5) + ")");
    };
    ctl.setCurrent = function (id) {
      ctl.curId = id;
      Object.keys(ctl.marks).forEach((k) => {
        const on = k === id, mk = ctl.marks[k];
        mk.classList.toggle("cur", on);
        mk.querySelector(".d").setAttribute("r", on ? 7.5 : 5);
        if (on) mk.parentNode.appendChild(mk);
      });
      ctl.setCone();
    };
    ctl.labelFit = function () {
      ctl.labels.forEach((L) => {
        const wpx = (L.box[2] - L.box[0]) / ctl.k, hpx = (L.box[3] - L.box[1]) / ctl.k;
        const fullW = L.room.n.length * 6.8 + 10;
        const text = fullW <= wpx ? L.room.n : L.ab;
        L.t.textContent = text;
        const ok = !!text && hpx > 18 && wpx > 26;
        L.t.style.display = ok ? "" : "none";
        L.sub.style.display = ok && hpx > 40 && wpx > 54 ? "" : "none";
      });
    };
    return ctl;
  }

  const maps = { mini: buildMap(el.miniSvg, { prefix: "mi-", full: false }), full: null };

  /* ---------------------------------------------------------
     3. Penampil foto
     Gambar memenuhi layar (cover). Keadaan tampilan: titik tengah (u, v) dalam pecahan gambar dan zoom z.
     Peta dan penanda memakai posisi persen di dalam kotak gambar, jadi ikut bergeser dan zoom bersama gambar.
     --------------------------------------------------------- */
  st.pref = "siang";
  const ZMAX = 3.6;
  const HS_MAXV = .85; /* titik pindah tidak diletakkan lebih rendah dari ini, supaya tidak tertutup bilah tombol di HP */
  const layers = [mkLayer(el.la), mkLayer(el.lb)];
  function mkLayer(node) { return { node: node, pan: null, thumb: null, full: null, bw: 0, bh: 0, ar: 0, scene: null, variant: "", timer: 0 }; }

  function measureStage() { st.vw = el.stage.clientWidth; st.vh = el.stage.clientHeight; }
  function sizeLayer(L) {
    const ar = L.ar || 16 / 9;
    const bh = Math.max(st.vh, st.vw / ar), bw = bh * ar;
    L.bw = bw; L.bh = bh;
    L.pan.style.width = bw.toFixed(1) + "px";
    L.pan.style.height = bh.toFixed(1) + "px";
  }

  function mkHotspot(h, p, pano) {
    const b = H("button", "tur-hs");
    b.type = "button";
    if (!pano) { b.style.left = (p[0] * 100).toFixed(2) + "%"; b.style.top = (Math.min(p[1], HS_MAXV) * 100).toFixed(2) + "%"; }
    b.dataset.ke = h.ke;
    b.setAttribute("aria-label", h.t || "Pindah ruang");
    b.innerHTML = '<span class="ring"></span><span class="disc"><svg class="ic" aria-hidden="true"><use href="#i-up"/></svg></span><span class="lab"></span>';
    b.querySelector(".lab").textContent = h.t || "";
    b.addEventListener("click", (e) => { e.stopPropagation(); go(h.ke); });
    return b;
  }
  function mkPin(pin, p, i) {
    const b = H("button", "tur-pin");
    b.type = "button";
    b.style.left = (p[0] * 100).toFixed(2) + "%";
    b.style.top = (p[1] * 100).toFixed(2) + "%";
    b.style.setProperty("--i", i);
    if (p[0] > .78) b.classList.add("flip");
    b.dataset.i = i;
    b.setAttribute("aria-label", pin.t + ", " + pin.u);
    b.innerHTML = '<span class="dot"></span><span class="tag"><b></b><i></i></span>';
    b.querySelector("b").textContent = pin.t;
    b.querySelector("i").textContent = pin.u;
    b.addEventListener("click", (e) => { e.stopPropagation(); flashPin(b); });
    return b;
  }
  function flashPin(b) {
    b.classList.remove("is-focus"); void b.offsetWidth; b.classList.add("is-focus");
    clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove("is-focus"), 1600);
  }

  function buildLayer(L, s, variant) {
    clearTimeout(L.timer);
    L.node.textContent = "";
    const f = fileInfo(s, variant);
    const pan = H("div", "tur-pan", L.node);
    const th = H("img", "thumb", pan), full = H("img", "full", pan);
    th.alt = ""; th.decoding = "async"; th.draggable = false;
    full.alt = s.nama + (variant === "malam" ? ", suasana malam" : "") + ". " + (s.cat || ""); full.decoding = "async"; full.draggable = false;
    L.hsl = [];
    (s.hs || []).forEach((h) => {
      const p = pAt(h.p, variant);
      if (!p || !byId[h.ke]) return;
      pan.appendChild(mkHotspot(h, p, false));
      L.hsl.push({ ke: h.ke, t: h.t || "Pindah ruang", u: p[0], v: Math.min(p[1], HS_MAXV) });
    });
    (s.pins || []).forEach((pin, i) => { const p = pAt(pin.p, variant); if (p) pan.appendChild(mkPin(pin, p, i)); });
    L.pan = pan; L.thumb = th; L.full = full; L.ar = f.ar; L.scene = s; L.variant = variant;
    return f;
  }

  function showLoader(on) { el.load.hidden = !on; }

  function showPhoto(s, variant, o) {
    o = o || {};
    const my = ++st.token;
    const prev = st.front;
    const back = prev === layers[0] ? layers[1] : layers[0];
    const f = buildLayer(back, s, variant);
    measureStage();
    sizeLayer(back);
    return new Promise((resolve) => {
      let done = false;
      const reveal = () => {
        if (done || my !== st.token) return;
        done = true; showLoader(false);
        commitPhoto(back, prev, s, variant, o);
        resolve(true);
      };
      back.thumb.onload = back.thumb.onerror = reveal;
      back.full.onload = () => {
        if (my !== st.token) return;
        if (!f.ar && back.full.naturalWidth) { back.ar = back.full.naturalWidth / back.full.naturalHeight; sizeLayer(back); if (st.front === back) applyPhoto(); }
        requestAnimationFrame(() => back.full.classList.add("on"));
        showLoader(false); reveal();
      };
      back.full.onerror = () => { if (my !== st.token) return; showLoader(false); toast("Gambar ruang ini belum bisa dimuat. Coba muat ulang halaman."); reveal(); };
      back.thumb.src = f.thumb;
      back.full.src = f.full;
      if (back.thumb.complete && back.thumb.naturalWidth) reveal();
      if (back.full.complete && back.full.naturalWidth) back.full.onload();
      setTimeout(reveal, 2400);
      setTimeout(() => { if (my === st.token && !back.full.classList.contains("on")) showLoader(true); }, 500);
    });
  }

  function commitPhoto(back, prev, s, variant, o) {
    const leavingPano = root.dataset.mode === "pano";
    const sameView = o.keepView && prev && prev.scene === s && Math.abs(prev.ar - back.ar) < .02;
    setMode("photo");
    if (!sameView) { st.view.u = .5; st.view.v = .5; st.view.z = 1; }
    st.front = back; st.scene = s; st.variant = variant;
    back.node.classList.remove("out");
    back.node.classList.toggle("quick", !!o.quick || leavingPano);
    back.node.removeAttribute("aria-hidden"); back.node.inert = false;
    applyPhoto();
    void back.node.offsetWidth;
    back.node.classList.add("on");
    if (prev && prev !== back) retire(prev);
    if (leavingPano) Pano.leave();
    afterScene(s, variant, o);
  }
  function retire(L) {
    L.node.classList.remove("on"); L.node.classList.add("out");
    L.node.setAttribute("aria-hidden", "true"); L.node.inert = true;
    clearTimeout(L.timer);
    L.timer = setTimeout(() => { L.node.classList.remove("out"); L.node.textContent = ""; L.pan = null; L.scene = null; }, 1000);
  }

  function metrics() {
    const L = st.front;
    if (!L || !L.pan) return null;
    return { L: L, dw: L.bw * st.view.z, dh: L.bh * st.view.z };
  }
  function applyPhoto() {
    const m = metrics();
    if (!m) return;
    const v = st.view;
    const mu = Math.min(.5, st.vw / (2 * m.dw)), mv = Math.min(.5, st.vh / (2 * m.dh));
    v.u = clamp(v.u, mu, 1 - mu); v.v = clamp(v.v, mv, 1 - mv);
    const tx = st.vw / 2 - v.u * m.dw, ty = st.vh / 2 - v.v * m.dh;
    m.L.pan.style.transform = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0) scale(" + v.z.toFixed(4) + ")";
    m.L.pan.style.setProperty("--inv", (1 / v.z).toFixed(4));
    edgeUpdate();
    hudDirty();
  }

  /* Penunjuk di tepi layar: titik pindah yang belum terlihat (biasanya di HP tegak, yang hanya menampilkan sepertiga lebar gambar)
     ditandai di tepi kiri atau kanan. Ketuk untuk menggeser gambar sampai titiknya ada di tengah. */
  const edges = { box: H("div", "tur-edges", root), list: [] };
  edges.box.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 4; i++) {
    const side = i < 2 ? "l" : "r";
    const b = H("button", "tur-edge " + side, edges.box);
    b.type = "button"; b.tabIndex = -1; b.hidden = true;
    b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-' + (side === "l" ? "prev" : "next") + '"/></svg><span></span>';
    b.addEventListener("click", () => { if (b._h) edgeGo(b._h); });
    edges.list.push(b);
  }
  function edgeGo(h) {
    animatePhoto({ u: h.u, v: st.view.v, z: st.view.z }, 560);
    root.dataset.hint = "1";
    clearTimeout(st.hintT);
    st.hintT = setTimeout(() => { root.dataset.hint = "0"; }, 4200);
  }
  function edgeUpdate() {
    const m = metrics(), side = { l: [], r: [] };
    if (m && root.dataset.mode === "photo" && st.front && st.front.hsl && !(isNarrow() && st.infoOpen)) {
      const mg = 24;
      st.front.hsl.forEach((h) => {
        const x = st.vw / 2 + (h.u - st.view.u) * m.dw, y = st.vh / 2 + (h.v - st.view.v) * m.dh;
        if (x < mg) side.l.push({ h: h, d: mg - x, y: y });
        else if (x > st.vw - mg) side.r.push({ h: h, d: x - (st.vw - mg), y: y });
      });
    }
    const lo = st.vh * .3, hi = st.vh * .68;
    ["l", "r"].forEach((k, n) => {
      const arr = side[k].sort((a, b) => a.d - b.d).slice(0, 2).sort((a, b) => a.y - b.y);
      let prev = -1e9;
      for (let i = 0; i < 2; i++) {
        const b = edges.list[n * 2 + i], it = arr[i];
        if (!it) { if (!b.hidden) b.hidden = true; continue; }
        const top = Math.max(clamp(it.y, lo, hi), prev + 54);
        prev = top;
        if (b._h !== it.h) { b._h = it.h; b.lastChild.textContent = it.h.t; }
        b.style.top = top.toFixed(0) + "px";
        if (b.hidden) b.hidden = false;
      }
    });
    if (!isNarrow() && st.infoOpen) { edges.box.style.setProperty("--tur-edge-l", (el.info.getBoundingClientRect().right + 8).toFixed(0) + "px"); edges.box.dataset.off = "1"; }
    else { edges.box.style.removeProperty("--tur-edge-l"); edges.box.dataset.off = "0"; }
  }
  function lookPhoto(dx, dy) {
    const m = metrics();
    if (!m) return;
    st.view.u -= dx / m.dw; st.view.v -= dy / m.dh;
    applyPhoto();
  }
  function zoomPhoto(factor, cx, cy) {
    const m = metrics();
    if (!m) return;
    const v = st.view, z2 = clamp(v.z * factor, 1, ZMAX);
    if (z2 === v.z) return;
    const iu = v.u + (cx - st.vw / 2) / m.dw, iv = v.v + (cy - st.vh / 2) / m.dh;
    const dw2 = m.L.bw * z2, dh2 = m.L.bh * z2;
    v.z = z2; v.u = iu - (cx - st.vw / 2) / dw2; v.v = iv - (cy - st.vh / 2) / dh2;
    applyPhoto();
  }

  /* Gerak halus untuk pindah fokus (tombol zoom, ketuk dua kali, pilih penanda) */
  let tween = 0;
  function cancelTween() { if (tween) { cancelAnimationFrame(tween); tween = 0; } }
  function animate(from, to, ms, apply) {
    cancelTween();
    const t0 = performance.now();
    const step = (now) => {
      const t = clamp((now - t0) / (ms || 600), 0, 1), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const cur = {};
      for (const k in to) cur[k] = from[k] + (to[k] - from[k]) * e;
      apply(cur);
      tween = t < 1 ? requestAnimationFrame(step) : 0;
    };
    tween = requestAnimationFrame(step);
  }
  function animatePhoto(to, ms) {
    animate({ u: st.view.u, v: st.view.v, z: st.view.z }, to, ms, (c) => { st.view.u = c.u; st.view.v = c.v; st.view.z = c.z; applyPhoto(); });
  }

  /* ---------------------------------------------------------
     4. Pindah ruang, arah pandang, dan kendali
     --------------------------------------------------------- */
  function go(id, o) {
    const s = byId[id];
    if (!s) return Promise.resolve(false);
    o = o || {};
    const variant = variantFor(s, o.variant || st.pref);
    return s.type === "pano" ? showPano(s, variant, o) : showPhoto(s, variant, o);
  }
  function step(dir) {
    const s = st.scene;
    if (!s) return;
    go(scenes[(s.i + dir + scenes.length) % scenes.length].id);
  }
  function setMode(m) {
    if (root.dataset.mode === m) return;
    root.dataset.mode = m;
    el.pano.hidden = m !== "pano";
    resetMeasure();
    edgeUpdate();
  }

  function curHeading() {
    const s = st.scene;
    if (!s) return 0;
    return s.type === "pano" ? norm360(st.cam.yaw) : norm360(s.arah + (st.view.u - .5) * s.fov);
  }
  function curSpan() {
    const s = st.scene;
    if (!s) return 60;
    if (s.type === "pano") return 2 * deg(Math.atan(Math.tan(rad(st.cam.fov) / 2) * (st.vw / Math.max(1, st.vh))));
    const m = metrics();
    return m ? s.fov * Math.min(1, st.vw / m.dw) : s.fov;
  }
  let hudQ = 0;
  function hudDirty() { if (!hudQ) hudQ = requestAnimationFrame(hudFlush); }
  function hudFlush() {
    hudQ = 0;
    if (!st.scene) return;
    const h = curHeading(), span = curSpan();
    maps.mini.setCone(h, span);
    if (maps.full && st.mapOpen) maps.full.setCone(h, span);
    el.head.textContent = compass(h) + " · " + Math.round(h) + "°";
  }

  function setHash(s, variant) {
    try { history.replaceState(null, "", "#" + s.id + (variant === "malam" ? "/malam" : "")); } catch (e) { /* tidak apa-apa */ }
  }
  function parseHash() {
    let h = location.hash.slice(1);
    if (!h) return null;
    try { h = decodeURIComponent(h); } catch (e) { return null; }
    const parts = h.split("/"), s = byId[parts[0]];
    return s ? { s: s, v: parts[1] === "malam" || parts[1] === "siang" ? parts[1] : null } : null;
  }
  const preloaded = {};
  function preloadNear(s) {
    if (navigator.connection && navigator.connection.saveData) return;
    const ids = (s.hs || []).map((h) => h.ke);
    ids.push(scenes[(s.i + 1) % scenes.length].id);
    const run = () => ids.slice(0, 4).forEach((id) => {
      const t = byId[id];
      if (!t || t === s || t.type !== "photo") return;
      const v = variantFor(t, st.pref), key = t.id + v;
      if (preloaded[key]) return;
      preloaded[key] = 1;
      const im = new Image(); im.decoding = "async"; im.src = fileInfo(t, v).full;
    });
    (window.requestIdleCallback || ((fn) => setTimeout(fn, 700)))(run);
  }
  function flashHint(s) {
    if (st.seen[s.id]) return;
    st.seen[s.id] = 1;
    root.dataset.hint = "1";
    clearTimeout(st.hintT);
    st.hintT = setTimeout(() => { root.dataset.hint = "0"; }, 5200);
  }

  /* Dipanggil setiap kali ruang baru tampil */
  function afterScene(s, variant, o) {
    const M = mRooms[s.room];
    el.where.textContent = s.nama;
    const R = roomInfo[s.room] || {};
    const pl = R.plafon || (NO_CEIL[s.room] ? "" : "3,00 m");
    const quick = [], pm1 = /(\d+,\d+)\s*m/.exec(pl || "");
    if (pm1) quick.push((/^kanopi/i.test(pl) ? "Kanopi " : "Plafon ") + pm1[1] + " m");
    if (M) quick.push(nf(M.area, 2) + " m²");
    el.quick.textContent = quick.join(" · ");
    renderInfo(s);
    updateDay(s);
    maps.mini.setCurrent(s.id);
    if (maps.full) { maps.full.setCurrent(s.id); mapSceneChanged(); }
    hudDirty();
    markStrip(s);
    if (!o.noHash) setHash(s, variant);
    el.live.textContent = "Sekarang di " + s.nama + (variant === "malam" ? ", suasana malam" : "") + ". " + (s.cat || "");
    if (s.type === "photo") flashHint(s);
    preloadNear(s);
    root.dataset.ready = "1";
  }

  function updateDay(s) {
    const two = s.keys.length > 1;
    el.day.hidden = !two;
    $$q("button", el.day).forEach((b) => {
      const v = b.dataset.v;
      b.disabled = !s.v[v];
      b.setAttribute("aria-pressed", st.variant === v ? "true" : "false");
    });
  }
  function $$q(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }

  /* ----- Kendali pointer: geser, cubit, gulir, ketuk dua kali ----- */
  const ptrs = new Map();
  let gest = null, samples = [], inertia = 0, lastTap = { t: 0, x: 0, y: 0 };
  function cancelInertia() { if (inertia) { cancelAnimationFrame(inertia); inertia = 0; } }
  const isPano = () => !!st.scene && st.scene.type === "pano";
  const look = (dx, dy) => (isPano() ? Pano.look(dx, dy) : lookPhoto(dx, dy));
  const zoomAt = (f, x, y) => (isPano() ? Pano.zoom(f) : zoomPhoto(f, x, y));
  function stageXY(e) { const r = el.stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function pairInfo() {
    const a = Array.from(ptrs.values());
    return { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 };
  }

  function onDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest && e.target.closest(".tur-hs,.tur-pin")) return;
    cancelInertia(); cancelTween();
    try { el.stage.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) {
      gest = { moved: 0, t0: performance.now(), alt: e.altKey, pinch: 0 };
      samples = [];
      el.stage.classList.add("drag");
    } else if (ptrs.size === 2 && gest) {
      gest.pinch = pairInfo().d; gest.moved = 99;
    }
    closeTransient();
  }
  function onMove(e) {
    const p = ptrs.get(e.pointerId);
    if (!p || !gest) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 1) {
      gest.moved += Math.abs(dx) + Math.abs(dy);
      const now = performance.now();
      samples.push({ t: now, dx: dx, dy: dy });
      while (samples.length && now - samples[0].t > 100) samples.shift();
      look(dx, dy);
    } else if (ptrs.size === 2) {
      const pi = pairInfo(), r = el.stage.getBoundingClientRect();
      if (gest.pinch) zoomAt(pi.d / gest.pinch, pi.x - r.left, pi.y - r.top);
      gest.pinch = pi.d;
      look(dx / 2, dy / 2);
    }
  }
  function onUp(e) {
    if (!ptrs.delete(e.pointerId)) return;
    try { el.stage.releasePointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
    if (ptrs.size === 0) {
      el.stage.classList.remove("drag");
      const gs = gest; gest = null;
      if (!gs || e.type !== "pointerup") return;
      if (gs.moved < 8 && performance.now() - gs.t0 < 450) onTap(e, gs); else startInertia();
    } else if (gest) gest.pinch = 0;
  }
  function startInertia() {
    if (samples.length < 2) return;
    let sx = 0, sy = 0;
    samples.forEach((s) => { sx += s.dx; sy += s.dy; });
    const span = Math.max(24, samples[samples.length - 1].t - samples[0].t);
    let vx = sx / span, vy = sy / span;
    if (Math.hypot(vx, vy) < .15) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(48, now - last); last = now;
      look(vx * dt, vy * dt);
      const f = Math.exp(-dt / 320); vx *= f; vy *= f;
      inertia = Math.hypot(vx, vy) > .02 ? requestAnimationFrame(tick) : 0;
    };
    inertia = requestAnimationFrame(tick);
  }
  function onTap(e, gs) {
    const p = stageXY(e), now = performance.now();
    if (EDIT && gs.alt) { editPick(p.x, p.y); return; }
    if (isPano() && st.measure) { panoMeasureTap(p.x, p.y); return; }
    if (now - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 36) { lastTap.t = 0; dblTap(p.x, p.y); return; }
    lastTap = { t: now, x: p.x, y: p.y };
  }
  function dblTap(x, y) {
    if (isPano()) { Pano.zoomTo(st.cam.fov > 55 ? st.cam.fov * .62 : 76); return; }
    const m = metrics();
    if (!m) return;
    if (st.view.z > 1.3) { animatePhoto({ u: .5, v: st.view.v, z: 1 }, 520); return; }
    const z2 = 2.3, iu = st.view.u + (x - st.vw / 2) / m.dw, iv = st.view.v + (y - st.vh / 2) / m.dh;
    animatePhoto({ u: iu - (x - st.vw / 2) / (m.L.bw * z2), v: iv - (y - st.vh / 2) / (m.L.bh * z2), z: z2 }, 520);
  }
  function onWheel(e) {
    e.preventDefault();
    cancelTween();
    const k = e.deltaMode === 1 ? .05 : e.deltaMode === 2 ? .5 : .0016;
    const p = stageXY(e);
    if (isPano()) Pano.zoom(Math.exp(-e.deltaY * k)); else zoomPhoto(Math.exp(-e.deltaY * k), p.x, p.y);
  }
  function zoomButton(dir) {
    if (isPano()) { Pano.zoomTo(st.cam.fov * (dir > 0 ? .8 : 1.25)); return; }
    const f = dir > 0 ? 1.5 : 1 / 1.5, z2 = clamp(st.view.z * f, 1, ZMAX);
    animatePhoto({ u: st.view.u, v: st.view.v, z: z2 }, 280);
  }

  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    const k = e.key;
    let used = true;
    const stepPx = Math.max(60, st.vw * .09);
    if (k === "ArrowLeft") look(stepPx, 0);
    else if (k === "ArrowRight") look(-stepPx, 0);
    else if (k === "ArrowUp") look(0, stepPx);
    else if (k === "ArrowDown") look(0, -stepPx);
    else if (k === "+" || k === "=") zoomButton(1);
    else if (k === "-" || k === "_") zoomButton(-1);
    else if (k === "PageUp" || k === "[" || k === ",") step(-1);
    else if (k === "PageDown" || k === "]" || k === ".") step(1);
    else if (k === "m" || k === "M") openMap();
    else if (k === "u" || k === "U") setMeasure(!st.measure);
    else if (k === "i" || k === "I") setInfo(!st.infoOpen);
    else if (k === "f" || k === "F") toggleFull();
    else if (k === "?" || k === "h" || k === "H") openDialog(el.help);
    else if (k === "Escape") { if (!el.strip.hidden || el.more.dataset.open === "1") closeTransient(); else used = false; }
    else used = false;
    if (used) e.preventDefault();
  }

  el.stage.addEventListener("pointerdown", onDown);
  el.stage.addEventListener("pointermove", onMove);
  el.stage.addEventListener("pointerup", onUp);
  el.stage.addEventListener("pointercancel", onUp);
  el.stage.addEventListener("wheel", onWheel, { passive: false });
  el.stage.addEventListener("contextmenu", (e) => { if (e.pointerType === "touch") e.preventDefault(); });
  document.addEventListener("keydown", onKey);

  function onResize() {
    measureStage();
    layers.forEach((L) => { if (L.pan) sizeLayer(L); });
    if (st.front) applyPhoto();
    if (Pano.on) Pano.resize();
    maps.mini.layout();
    if (maps.full && st.mapOpen) maps.full.layout();
    hudDirty();
  }
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(el.stage); else window.addEventListener("resize", onResize);

  /* ---------------------------------------------------------
     5. Panorama 360 derajat (WebGL) dan ukur di panorama
     Foto equirectangular dipetakan lewat shader. Titik pindah memakai arah kompas (az) dan naik turun (el).
     Mode ini dipakai kalau ada scene bertipe "pano" di tur-data.js (lihat contoh di bagian bawah file itu).
     --------------------------------------------------------- */
  const VS = "attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.0,1.0);}";
  const FS = "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n" +
    "varying vec2 v;uniform sampler2D t;uniform float yaw,pitch,th,asp,c0;" +
    "void main(){vec3 d=normalize(vec3(v.x*th*asp,v.y*th,1.0));" +
    "float cp=cos(pitch),sp=sin(pitch);d=vec3(d.x,d.y*cp+d.z*sp,-d.y*sp+d.z*cp);" +
    "float cy=cos(yaw),sy=sin(yaw);d=vec3(d.x*cy+d.z*sy,d.y,-d.x*sy+d.z*cy);" +
    "float lon=atan(d.x,d.z)-c0;float lat=asin(clamp(d.y,-1.0,1.0));" +
    "float u=fract(lon/6.28318530718+0.5);" +
    "gl_FragColor=vec4(texture2D(t,vec2(u,0.5-lat/3.14159265359)).rgb,1.0);}";

  const Pano = {
    on: false, ready: false, failed: false, gl: null, tex: null, loc: {}, maxTex: 4096,
    scene: null, img: null, texReady: false, hs: [], raf: 0, dirty: false,

    init() {
      if (Pano.ready) return true;
      if (Pano.failed) return false;
      const c = el.gl;
      let gl = null;
      try { gl = c.getContext("webgl", { antialias: false, alpha: false }) || c.getContext("experimental-webgl"); } catch (e) { gl = null; }
      if (!gl) { Pano.failed = true; return false; }
      try {
        const sh = (type, src) => {
          const s = gl.createShader(type);
          gl.shaderSource(s, src); gl.compileShader(s);
          if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
          return s;
        };
        const pr = gl.createProgram();
        gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
        gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(pr);
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error("link");
        gl.useProgram(pr);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const a = gl.getAttribLocation(pr, "p");
        gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        ["yaw", "pitch", "th", "asp", "c0", "t"].forEach((n) => { Pano.loc[n] = gl.getUniformLocation(pr, n); });
        Pano.tex = gl.createTexture();
        Pano.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
      } catch (e) { Pano.failed = true; return false; }
      Pano.gl = gl; Pano.ready = true;
      c.addEventListener("webglcontextlost", (ev) => { ev.preventDefault(); Pano.ready = false; Pano.texReady = false; });
      c.addEventListener("webglcontextrestored", () => {
        Pano.failed = false;
        if (Pano.init() && Pano.img) { Pano.setTexture(Pano.img); Pano.draw(); }
      });
      return true;
    },

    setTexture(img) {
      const gl = Pano.gl;
      const cap = Math.min(Pano.maxTex, window.matchMedia("(pointer:coarse)").matches ? 4096 : 8192);
      let src = img;
      if (img.naturalWidth > cap) {
        const cv = document.createElement("canvas");
        cv.width = cap; cv.height = Math.round(cap * img.naturalHeight / img.naturalWidth);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        src = cv;
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, Pano.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(Pano.loc.t, 0);
      Pano.texReady = true;
    },

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(st.vw * dpr)), h = Math.max(2, Math.round(st.vh * dpr));
      if (el.gl.width !== w || el.gl.height !== h) { el.gl.width = w; el.gl.height = h; }
      Pano.draw();
    },
    draw() {
      if (!Pano.on || !Pano.ready || !Pano.texReady) return;
      Pano.dirty = true;
      if (!Pano.raf) Pano.raf = requestAnimationFrame(Pano.frame);
    },
    frame() {
      Pano.raf = 0;
      if (!Pano.dirty || !Pano.on) return;
      Pano.dirty = false;
      const gl = Pano.gl, c = st.cam;
      gl.viewport(0, 0, el.gl.width, el.gl.height);
      gl.uniform1f(Pano.loc.yaw, rad(c.yaw));
      gl.uniform1f(Pano.loc.pitch, rad(c.pitch));
      gl.uniform1f(Pano.loc.th, Math.tan(rad(c.fov) / 2));
      gl.uniform1f(Pano.loc.asp, st.vw / Math.max(1, st.vh));
      gl.uniform1f(Pano.loc.c0, rad(Pano.scene.arah || 0));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      Pano.placeUI();
    },

    look(dx, dy) {
      const c = st.cam, k = c.fov / Math.max(1, st.vh);
      c.yaw = norm360(c.yaw - dx * k);
      c.pitch = clamp(c.pitch + dy * k, -88, 88);
      Pano.draw(); hudDirty();
    },
    zoom(f) { Pano.zoomTo(st.cam.fov / f); },
    zoomTo(fov) {
      cancelTween();
      animate({ f: st.cam.fov }, { f: clamp(fov, 26, 100) }, 240, (c) => { st.cam.fov = c.f; Pano.draw(); hudDirty(); });
    },

    /* Arah dunia (kompas, naik) ke piksel layar, dan sebaliknya. Rumusnya sama dengan di shader. */
    project(az, elv) {
      const a = rad(az), e = rad(elv), cam = st.cam;
      const x = Math.cos(e) * Math.sin(a), y = Math.sin(e), z = Math.cos(e) * Math.cos(a);
      const cy = Math.cos(rad(cam.yaw)), sy = Math.sin(rad(cam.yaw));
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      const cp = Math.cos(rad(cam.pitch)), sp = Math.sin(rad(cam.pitch));
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      if (z2 <= .02) return { vis: false, x: 0, y: 0 };
      const th = Math.tan(rad(cam.fov) / 2), asp = st.vw / Math.max(1, st.vh);
      const nx = (x1 / z2) / (th * asp), ny = (y2 / z2) / th;
      return { vis: Math.abs(nx) < 1.2 && Math.abs(ny) < 1.2, x: (nx * .5 + .5) * st.vw, y: (.5 - ny * .5) * st.vh };
    },
    unproject(px, py) {
      const cam = st.cam, th = Math.tan(rad(cam.fov) / 2), asp = st.vw / Math.max(1, st.vh);
      let x = ((px / st.vw) * 2 - 1) * th * asp, y = (1 - (py / st.vh) * 2) * th, z = 1;
      const n = Math.hypot(x, y, z); x /= n; y /= n; z /= n;
      const cp = Math.cos(rad(cam.pitch)), sp = Math.sin(rad(cam.pitch));
      const y1 = y * cp + z * sp, z1 = -y * sp + z * cp;
      const cy = Math.cos(rad(cam.yaw)), sy = Math.sin(rad(cam.yaw));
      const x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
      return { az: norm360(deg(Math.atan2(x2, z2))), el: deg(Math.asin(clamp(y1, -1, 1))) };
    },
    placeUI() {
      Pano.hs.forEach((h) => {
        const p = Pano.project(h.az, h.el);
        h.node.style.visibility = p.vis ? "visible" : "hidden";
        if (p.vis) { h.node.style.setProperty("--x", p.x.toFixed(1) + "px"); h.node.style.setProperty("--y", p.y.toFixed(1) + "px"); }
      });
      if (st.measure) drawPanoMeasure();
    },

    commit(s, variant, img, o) {
      const same = Pano.scene === s && o.keepView;
      layers.forEach((L) => { if (L.pan) retire(L); });
      st.front = null;
      setMode("pano");
      el.gl.hidden = false;
      Pano.on = true; Pano.scene = s; Pano.img = img;
      measureStage(); Pano.resize();
      Pano.setTexture(img);
      if (!same) { st.cam.yaw = norm360(s.arah || 0); st.cam.pitch = 0; st.cam.fov = 76; }
      el.pano.textContent = ""; Pano.hs = [];
      (s.hs || []).forEach((h) => {
        if (typeof h.az !== "number" || !byId[h.ke]) return;
        const node = mkHotspot(h, null, true);
        el.pano.appendChild(node);
        Pano.hs.push({ node: node, az: h.az, el: h.el || 0 });
      });
      st.scene = s; st.variant = variant;
      pm.pts = [];
      Pano.draw();
      afterScene(s, variant, o);
      if (st.measure) { updatePanoReadout(); drawPanoMeasure(); }
    },
    leave() {
      Pano.on = false;
      if (Pano.raf) { cancelAnimationFrame(Pano.raf); Pano.raf = 0; }
      el.pano.textContent = ""; Pano.hs = [];
      setTimeout(() => { if (root.dataset.mode !== "pano") el.gl.hidden = true; }, 600);
    }
  };

  function showPano(s, variant, o) {
    o = o || {};
    const my = ++st.token;
    if (!Pano.init()) { toast("Browser ini belum mendukung mode 360 derajat."); return Promise.resolve(false); }
    const f = fileInfo(s, variant);
    showLoader(true);
    return new Promise((resolve) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        if (my !== st.token) return;
        showLoader(false);
        try { Pano.commit(s, variant, im, o); resolve(true); } catch (e) { toast("Panorama ini belum bisa ditampilkan."); resolve(false); }
      };
      im.onerror = () => { if (my !== st.token) return; showLoader(false); toast("Gambar panorama belum bisa dimuat."); resolve(false); };
      im.src = f.full;
    });
  }

  /* Ukur di panorama: sinar dari titik kamera lewat piksel yang diketuk, dipotongkan dengan kotak-kotak model 3D */
  let BOXES = null;
  function boxes() {
    if (BOXES) return BOXES;
    BOXES = [];
    MODEL.solids.forEach((b) => BOXES.push([b[0], b[1], b[4], b[2], b[3], b[5], "Dinding"]));
    items.forEach((it) => BOXES.push([Math.min(it.x0, it.x1), Math.min(it.y0, it.y1), it.z0, Math.max(it.x0, it.x1), Math.max(it.y0, it.y1), it.z1, it.name]));
    return BOXES;
  }
  function castRay(O, d) {
    const B = boxes();
    let best = 1e9, name = "";
    for (let i = 0; i < B.length; i++) {
      const b = B[i];
      let t0 = .01, t1 = 1e9, ok = true;
      for (let a = 0; a < 3; a++) {
        const o = O[a], dd = d[a], lo = b[a], hi = b[a + 3];
        if (Math.abs(dd) < 1e-9) { if (o < lo || o > hi) { ok = false; break; } continue; }
        let ta = (lo - o) / dd, tb = (hi - o) / dd;
        if (ta > tb) { const x = ta; ta = tb; tb = x; }
        if (ta > t0) t0 = ta;
        if (tb < t1) t1 = tb;
        if (t0 > t1) { ok = false; break; }
      }
      if (ok && t0 < best) { best = t0; name = b[6]; }
    }
    const bd = MODEL.bounds;
    if (d[2] < -1e-6) {
      const t = -O[2] / d[2];
      if (t > .01 && t < best) {
        const x = O[0] + d[0] * t, y = O[1] + d[1] * t;
        if (x >= bd[0] && x <= bd[2] && y >= bd[1] && y <= bd[3]) { best = t; name = "Lantai"; }
      }
    }
    if (d[2] > 1e-6) {
      const t = (300 - O[2]) / d[2];
      if (t > .01 && t < best) {
        const r = roomAt(O[0] + d[0] * t, O[1] + d[1] * t);
        if (r && !NO_CEIL[r.id]) { best = t; name = "Plafon"; }
      }
    }
    if (best > 6000) return null;
    return { x: O[0] + d[0] * best, y: O[1] + d[1] * best, z: O[2] + d[2] * best, name: name };
  }
  function rayFrom(s, az, elv) {
    const a = rad(az), e = rad(elv);
    return { O: [s.pos[0], s.pos[1], s.tinggi || D.tinggiMata || 150], d: [Math.sin(a) * Math.cos(e), Math.cos(a) * Math.cos(e), Math.sin(e)] };
  }

  const pm = { pts: [] };
  function showRead(big, small) {
    el.read.textContent = "";
    if (big) { H("b", "", el.read).textContent = big; H("span", "", el.read).textContent = small || ""; } else el.read.textContent = small || "";
    el.read.hidden = false;
  }
  function hideRead() { el.read.hidden = true; }
  function updatePanoReadout() {
    const p = pm.pts;
    if (!p.length) { showRead(null, "Ketuk titik pertama di gambar untuk mulai mengukur."); return; }
    if (p.length === 1) { showRead(null, "Titik 1 di " + p[0].name.toLowerCase() + ". Ketuk titik kedua."); return; }
    const dx = p[1].x - p[0].x, dy = p[1].y - p[0].y, dz = p[1].z - p[0].z;
    const dist = Math.hypot(dx, dy, dz), hz = Math.hypot(dx, dy);
    showRead(fmtM(dist), thou(dist) + " cm · mendatar " + thou(hz) + " cm · selisih tinggi " + thou(Math.abs(dz)) + " cm");
  }
  function panoMeasureTap(px, py) {
    const s = st.scene, dir = Pano.unproject(px, py), r = rayFrom(s, dir.az, dir.el);
    const hit = castRay(r.O, r.d);
    if (!hit) { toast("Titik itu tidak mengenai permukaan di model. Coba ketuk dinding, lantai, atau perabot."); return; }
    if (pm.pts.length >= 2) pm.pts = [];
    pm.pts.push(hit);
    updatePanoReadout();
    drawPanoMeasure();
  }
  /* Titik dunia ke layar: arah dari kamera ke titik itu */
  function worldToScreen(s, P) {
    const O = [s.pos[0], s.pos[1], s.tinggi || D.tinggiMata || 150];
    const dx = P.x - O[0], dy = P.y - O[1], dz = P.z - O[2];
    return Pano.project(norm360(deg(Math.atan2(dx, dy))), deg(Math.atan2(dz, Math.hypot(dx, dy))));
  }
  function drawPanoMeasure() {
    const svg = el.ms, s = st.scene;
    svg.textContent = "";
    if (!s || s.type !== "pano" || !st.measure) return;
    svg.setAttribute("viewBox", "0 0 " + st.vw + " " + st.vh);
    const df = S("defs", null, svg), gr = S("linearGradient", { id: "ms-warm", x1: 0, y1: 0, x2: 1, y2: 1 }, df);
    S("stop", { offset: 0, style: "stop-color:var(--sun)" }, gr); S("stop", { offset: 1, style: "stop-color:var(--peach)" }, gr);
    const sp = pm.pts.map((p) => worldToScreen(s, p));
    if (sp.length === 2 && sp[0].vis && sp[1].vis) {
      S("line", { "class": "ms-ln", x1: sp[0].x, y1: sp[0].y, x2: sp[1].x, y2: sp[1].y }, svg);
      const d = Math.hypot(pm.pts[1].x - pm.pts[0].x, pm.pts[1].y - pm.pts[0].y, pm.pts[1].z - pm.pts[0].z);
      const t = S("text", { "class": "ms-tx", x: (sp[0].x + sp[1].x) / 2, y: (sp[0].y + sp[1].y) / 2 - 12, "text-anchor": "middle" }, svg);
      t.textContent = fmtM(d);
    }
    sp.forEach((p) => { if (p.vis) S("circle", { "class": "ms-pt", cx: p.x, cy: p.y, r: 6, fill: "url(#ms-warm)" }, svg); });
  }

  /* ---------------------------------------------------------
     6. Kartu keterangan, daftar ruang, tombol, dan dialog
     --------------------------------------------------------- */
  function resetMeasure() {
    st.measure = false;
    root.dataset.measure = "0";
    el.bMeasure.setAttribute("aria-pressed", "false");
    setPins(false);
    pm.pts = [];
    msShow(false); el.ms.textContent = "";
    hideRead();
  }
  /* Lapisan ukur adalah SVG, jadi atribut hidden harus diatur lewat setAttribute (properti .hidden hanya ada di elemen HTML) */
  function msShow(on) { if (on) el.ms.removeAttribute("hidden"); else el.ms.setAttribute("hidden", ""); }
  function setPins(on) { st.pins = !!on; root.dataset.pins = on ? "1" : "0"; }
  function setMeasure(on) {
    st.measure = !!on;
    el.bMeasure.setAttribute("aria-pressed", on ? "true" : "false");
    root.dataset.measure = on ? "1" : "0";
    if (isPano()) {
      pm.pts = [];
      msShow(on);
      if (on) { updatePanoReadout(); drawPanoMeasure(); } else { hideRead(); el.ms.textContent = ""; }
    } else {
      setPins(on);
      if (on && !st.pinsHint) { st.pinsHint = true; toast("Penanda ukuran muncul di foto. Untuk mengukur jarak bebas, buka Denah lalu pilih Ukur jarak.", 5600); }
    }
  }
  function setInfo(open) {
    st.infoOpen = !!open;
    el.info.dataset.open = open ? "1" : "0";
    el.bInfo.setAttribute("aria-pressed", open ? "true" : "false");
    el.handle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && isNarrow() && !el.strip.hidden) setStrip(false);
    edgeUpdate();
  }
  function setStrip(open) {
    el.strip.hidden = !open;
    el.bRoom.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open) return;
    loadStripThumbs();
    if (isNarrow()) setInfo(false);
    const cur = el.stripList.querySelector('[aria-current="true"]');
    if (cur) requestAnimationFrame(() => { el.stripList.scrollLeft = cur.offsetLeft - (el.stripList.clientWidth - cur.clientWidth) / 2; });
  }
  function setMore(open) {
    el.more.dataset.open = open ? "1" : "0";
    el.bMore.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function closeTransient() {
    if (!el.strip.hidden) setStrip(false);
    if (el.more.dataset.open === "1") setMore(false);
  }
  function openDialog(d) {
    if (d.open) return;
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  function closeDialog(d) {
    if (d.close) d.close(); else d.removeAttribute("open");
  }

  /* Kartu keterangan */
  function fact(parent, label, value, wide) {
    const d = H("div", "tur-f" + (wide ? " wide" : ""), parent);
    H("dt", "", d).textContent = label;
    H("dd", "", d).textContent = value;
  }
  function roomFacts(parent, id) {
    const R = roomInfo[id] || {}, M = mRooms[id];
    if (!M) return;
    fact(parent, "Luas", nf(M.area, 2) + " m²");
    const pl = R.plafon || (NO_CEIL[id] ? "" : "3,00 m");
    if (pl) fact(parent, /^kanopi/i.test(pl) ? "Atap" : "Tinggi plafon", pl, pl.length > 14);
    if (M.r.length === 1) { const q = M.r[0]; fact(parent, "Ukuran ruang", nf((q[2] - q[0]) / 100, 2) + " × " + nf((q[3] - q[1]) / 100, 2) + " m"); }
    fact(parent, "Elevasi lantai", fmtFFL(M.ffl));
    if (D.lantai && D.lantai[M.mat]) fact(parent, "Lantai", D.lantai[M.mat], true);
  }
  function mkDet(title, rows, open) {
    const d = H("details", "tur-det");
    if (open) d.open = true;
    const sm = H("summary", "", d);
    H("span", "", sm).textContent = title;
    H("b", "", sm).textContent = rows.length;
    const ul = H("ul", "", d);
    rows.forEach((r) => {
      const b = H("button", "tur-li", H("li", "", ul));
      b.type = "button";
      H("span", "n", b).textContent = r.n;
      H("span", "s", b).textContent = r.s;
      b.addEventListener("click", r.fn);
    });
    return d;
  }
  function renderInfo(s) {
    const R = roomInfo[s.room] || {}, M = mRooms[s.room];
    el.iKick.textContent = "Titik " + (s.i + 1) + " dari " + scenes.length;
    el.iTitle.textContent = M ? M.n : s.nama;
    el.iType.textContent = R.jenis || "";
    el.iFacts.textContent = "";
    roomFacts(el.iFacts, s.room);
    el.iText.textContent = R.ringkas || "";
    el.iLists.textContent = "";
    if (s.cat) {
      const p = H("p", "tur-i-text", el.iLists);
      H("b", "", p).textContent = "Sudut pandang. ";
      p.appendChild(document.createTextNode(s.cat));
    }
    if (s.pins && s.pins.length) {
      el.iLists.appendChild(mkDet("Ukuran di foto ini", s.pins.map((pin, i) => ({ n: pin.t, s: pin.u, fn: () => focusPin(i) })), true));
    }
    const its = items.filter((it) => it.room === s.room);
    if (its.length) {
      el.iLists.appendChild(mkDet("Isi ruangan menurut model", its.map((it) => ({ n: it.name, s: prettyDim(it.dim) || itemSize(it), fn: () => openMap({ item: it.id }) })), false));
    }
    el.iNote.textContent = D.catatan || "";
    el.iNote.hidden = !D.catatan;
  }
  function focusPin(i) {
    if (isPano()) return;
    const L = st.front, s = st.scene;
    if (!L || !L.pan || !s || !s.pins[i]) return;
    const p = pAt(s.pins[i].p, st.variant);
    if (!p) return;
    if (!st.pins) setMeasure(true);
    if (isNarrow()) setInfo(false);
    animatePhoto({ u: p[0], v: p[1], z: Math.max(st.view.z, 1.5) }, 650);
    const node = L.pan.querySelector('.tur-pin[data-i="' + i + '"]');
    if (node) setTimeout(() => flashPin(node), 450);
  }

  /* Daftar ruang */
  function buildStrip() {
    scenes.forEach((s) => {
      const b = H("button", "tur-st", H("li", "", el.stripList));
      b.type = "button"; b.dataset.id = s.id;
      const ph = H("span", "ph", b), im = H("img", "", ph);
      im.alt = ""; im.decoding = "async"; im.draggable = false;
      im.addEventListener("error", () => { im.style.visibility = "hidden"; });
      im.dataset.src = fileInfo(s, variantFor(s, "siang")).thumb;
      if (s.keys.length > 1) H("i", "b", ph).innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-sun"/></svg><svg class="ic" aria-hidden="true"><use href="#i-moon"/></svg>';
      else if (s.type === "pano") H("i", "b", ph).textContent = "360°";
      H("span", "t", b).textContent = s.nama;
      b.addEventListener("click", () => { setStrip(false); go(s.id); });
    });
  }
  function loadStripThumbs() {
    $$q("img[data-src]", el.stripList).forEach((im) => { im.src = im.dataset.src; im.removeAttribute("data-src"); });
  }
  function markStrip(s) {
    $$q(".tur-st", el.stripList).forEach((b) => b.setAttribute("aria-current", b.dataset.id === s.id ? "true" : "false"));
  }

  /* Bagikan, salin, layar penuh */
  function shareUrl() {
    const base = D.url || (location.origin + location.pathname);
    return base + (el.here.checked && st.scene ? "#" + st.scene.id + (st.variant === "malam" ? "/malam" : "") : "");
  }
  function copyText(t, msg) {
    const done = () => toast(msg || "Tautan disalin.");
    const legacy = () => {
      const ta = H("textarea", "", document.body);
      ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-999px;top:0";
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Salin manual dari kolom yang tampil."); }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, legacy); else legacy();
  }
  function openShare() {
    if (D.qr) el.qrImg.src = D.qr;
    el.url.value = shareUrl();
    openDialog(el.share);
  }
  const canFs = !!(root.requestFullscreen || root.webkitRequestFullscreen);
  function toggleFull() {
    if (!canFs) { toast("Browser ini belum mendukung layar penuh."); return; }
    const on = document.fullscreenElement || document.webkitFullscreenElement;
    if (on) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else {
      const p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
      if (p && p.catch) p.catch(() => toast("Browser menolak layar penuh."));
    }
  }
  function syncFull() {
    const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
    el.bFull.querySelector("use").setAttribute("href", on ? "#i-fullx" : "#i-full");
    el.bFull.querySelector("span").textContent = on ? "Keluar layar penuh" : "Layar penuh";
  }

  /* ---------------------------------------------------------
     7. Denah besar: geser, zoom, pilih ruang atau perabot, ukur jarak
     --------------------------------------------------------- */
  const MapUI = { sel: null, measure: false, pts: [], hover: null, ptr: new Map(), g: null, snaps: null, fsnaps: null, furnOn: true };

  function snapList() {
    if (MapUI.snaps) return MapUI.snaps;
    const seen = {}, out = [];
    const add = (x, y) => { const k = Math.round(x * 2) + "," + Math.round(y * 2); if (!seen[k]) { seen[k] = 1; out.push([x, y]); } };
    const rect = (x0, y0, x1, y1) => { add(x0, y0); add(x1, y0); add(x0, y1); add(x1, y1); };
    MODEL.walls.forEach((w) => rect(w[0], w[1], w[2], w[3]));
    MODEL.rooms.forEach((r) => r.r.forEach((q) => rect(q[0], q[1], q[2], q[3])));
    MODEL.open.forEach((o) => rect(o[2], o[3], o[4], o[5]));
    MapUI.snaps = out;
    return out;
  }
  function furnSnapList() {
    if (MapUI.fsnaps) return MapUI.fsnaps;
    const out = [];
    items.forEach((it) => { out.push([it.x0, it.y0], [it.x1, it.y0], [it.x0, it.y1], [it.x1, it.y1]); });
    MapUI.fsnaps = out;
    return out;
  }
  function snapTo(x, y) {
    const tol = 14 * maps.full.k;
    let best = null, bd = tol * tol;
    const test = (list) => {
      for (let i = 0; i < list.length; i++) {
        const dx = list[i][0] - x, dy = list[i][1] - y, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = list[i]; }
      }
    };
    test(snapList());
    if (MapUI.furnOn) test(furnSnapList());
    return best ? { x: best[0], y: best[1], snapped: true } : { x: x, y: y, snapped: false };
  }
  function mapPoint(cx, cy) {
    const f = maps.full, r = el.mapSvg.getBoundingClientRect();
    return { x: f.vb[0] + (cx - r.left) * f.k, y: -(f.vb[1] + (cy - r.top) * f.k) };
  }

  function initFullMap() {
    if (maps.full) return;
    const f = maps.full = buildMap(el.mapSvg, { prefix: "fu-", full: true });
    f.onLayout = drawMapMeasure;
    f.setCurrent(st.scene ? st.scene.id : scenes[0].id);
    bindMapPointer();
    new ResizeObserver(() => {
      if (!st.mapOpen) return;
      const w = el.mapSvg.clientWidth, h = el.mapSvg.clientHeight;
      if (!w || !h) return;
      if (!f.fitted) { f.fit(); f.fitted = true; return; }
      f.setVB([f.vb[0], f.vb[1], f.vb[2], h * (f.vb[2] / w)]);
    }).observe(el.mapView);
  }
  function openMap(o) {
    o = o || {};
    if (st.mapOpen && el.mapd.open) return;
    initFullMap();
    st.mapOpen = true;
    openDialog(el.mapd);
    requestAnimationFrame(() => {
      const f = maps.full;
      if (!f.fitted) { f.fit(); f.fitted = true; } else f.layout();
      f.setCurrent(st.scene.id);
      setMapMeasure(!!o.measure);
      if (o.item != null) selectItem(o.item, true);
      else if (!MapUI.sel || o.reset) selectRoom(st.scene.room, false);
      else renderSide();
      hudDirty();
    });
  }
  function mapSceneChanged() { if (st.mapOpen) renderSide(); }

  function setVBFast(vb) {
    const f = maps.full;
    const cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2;
    const nx = clamp(cx, C.x, C.x + C.w), ny = clamp(cy, C.y, C.y + C.h);
    vb[0] += nx - cx; vb[1] += ny - cy;
    f.vb = vb;
    f.svg.setAttribute("viewBox", vb.map((n) => Math.round(n * 100) / 100).join(" "));
  }
  function mapZoom(factor, cx, cy) {
    const f = maps.full, r = el.mapSvg.getBoundingClientRect();
    if (!r.width) return;
    const px = cx - r.left, py = cy - r.top, w1 = f.vb[2];
    const w2 = clamp(w1 / factor, 150, (f.fitW || w1) * 1.5);
    if (w2 === w1) return;
    const ux = f.vb[0] + px * f.k, uy = f.vb[1] + py * f.k, k2 = w2 / r.width;
    f.vb = [ux - px * k2, uy - py * k2, w2, r.height * k2];
    setVBFast(f.vb);
    f.layout();
  }
  function mapZoomBox(x0, y0, x1, y1) {
    const f = maps.full, r = el.mapSvg.getBoundingClientRect();
    if (!r.width) return;
    const bw = Math.abs(x1 - x0), bh = Math.abs(y1 - y0);
    const w = clamp(Math.max(bw * 3, bh * 3 * r.width / r.height, 380), 150, f.fitW || 2000);
    const k2 = w / r.width, cx = (x0 + x1) / 2, cy = -(y0 + y1) / 2;
    f.setVB([cx - w / 2, cy - r.height * k2 / 2, w, r.height * k2]);
  }
  function mapPair() {
    const a = Array.from(MapUI.ptr.values());
    return { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 };
  }
  function bindMapPointer() {
    const v = el.mapView;
    v.addEventListener("pointerdown", (e) => {
      if (e.target.closest && e.target.closest(".tur-zoombar")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { v.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
      MapUI.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (MapUI.ptr.size === 1) { MapUI.g = { moved: 0, t0: performance.now(), alt: e.altKey, pinch: 0 }; v.classList.add("drag"); }
      else if (MapUI.ptr.size === 2 && MapUI.g) { MapUI.g.pinch = mapPair().d; MapUI.g.moved = 99; }
    });
    v.addEventListener("pointermove", (e) => {
      const p = MapUI.ptr.get(e.pointerId);
      if (!p || !MapUI.g) { if (MapUI.measure && e.pointerType === "mouse") mapHover(e); return; }
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      const f = maps.full;
      if (MapUI.ptr.size === 1) {
        MapUI.g.moved += Math.abs(dx) + Math.abs(dy);
        if (MapUI.g.moved > 6) setVBFast([f.vb[0] - dx * f.k, f.vb[1] - dy * f.k, f.vb[2], f.vb[3]]);
      } else if (MapUI.ptr.size === 2) {
        const pi = mapPair();
        if (MapUI.g.pinch) mapZoom(pi.d / MapUI.g.pinch, pi.x, pi.y);
        MapUI.g.pinch = pi.d;
        setVBFast([f.vb[0] - dx / 2 * f.k, f.vb[1] - dy / 2 * f.k, f.vb[2], f.vb[3]]);
      }
    });
    const up = (e) => {
      if (!MapUI.ptr.delete(e.pointerId)) return;
      try { v.releasePointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
      if (MapUI.ptr.size === 0) {
        v.classList.remove("drag");
        const gs = MapUI.g; MapUI.g = null;
        if (gs && e.type === "pointerup" && gs.moved < 8 && performance.now() - gs.t0 < 500) mapTap(e, gs);
      } else if (MapUI.g) MapUI.g.pinch = 0;
    };
    v.addEventListener("pointerup", up);
    v.addEventListener("pointercancel", up);
    v.addEventListener("wheel", (e) => { e.preventDefault(); mapZoom(Math.exp(-e.deltaY * (e.deltaMode === 1 ? .05 : .0016)), e.clientX, e.clientY); }, { passive: false });
    g("m-zin").addEventListener("click", () => { const r = v.getBoundingClientRect(); mapZoom(1.5, r.left + r.width / 2, r.top + r.height / 2); });
    g("m-zout").addEventListener("click", () => { const r = v.getBoundingClientRect(); mapZoom(1 / 1.5, r.left + r.width / 2, r.top + r.height / 2); });
    g("m-fit").addEventListener("click", () => maps.full.fit());
  }

  /* Pilih ruang, perabot, bukaan, atau titik pandang */
  function clearSel() {
    const s = MapUI.sel, f = maps.full;
    if (!s || !f) return;
    if (s.t === "room" && f.rooms[s.id]) f.rooms[s.id].classList.remove("sel");
    if (s.t === "item" && f.items[s.id]) f.items[s.id].classList.remove("sel");
    if (s.t === "op" && f.ops[s.id]) f.ops[s.id].classList.remove("sel");
    MapUI.sel = null;
  }
  function selectRoom(id, zoom) {
    if (!mRooms[id]) return;
    clearSel();
    MapUI.sel = { t: "room", id: id };
    maps.full.rooms[id].classList.add("sel");
    if (zoom) { const q = bigRect(mRooms[id]); mapZoomBox(q[0], q[1], q[2], q[3]); }
    renderSide();
  }
  function selectItem(id, zoom) {
    const it = items[id];
    if (!it) return;
    if (!MapUI.furnOn) setFurn(true);
    clearSel();
    MapUI.sel = { t: "item", id: id };
    maps.full.items[id].classList.add("sel");
    if (zoom) mapZoomBox(it.x0, it.y0, it.x1, it.y1);
    renderSide();
  }
  function selectOp(i) {
    clearSel();
    MapUI.sel = { t: "op", id: i };
    renderSide();
  }
  function selectScene(id) {
    clearSel();
    MapUI.sel = { t: "scene", id: id };
    renderSide();
  }
  function mapTap(e, gs) {
    const f = maps.full;
    if (EDIT && gs.alt) { const m = mapPoint(e.clientX, e.clientY); editMapPos(m.x, m.y); return; }
    if (MapUI.measure) { measureTap(e); return; }
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const t = hit && hit.closest ? hit.closest("[data-scene],[data-item],[data-op],[data-room]") : null;
    if (t && t.dataset.scene) return selectScene(t.dataset.scene);
    if (t && t.dataset.item != null) return selectItem(+t.dataset.item, false);
    if (t && t.dataset.op != null) return selectOp(+t.dataset.op);
    if (t && t.dataset.room) return selectRoom(t.dataset.room, false);
    const m = mapPoint(e.clientX, e.clientY), r = roomAt(m.x, m.y);
    if (r) selectRoom(r.id, false); else { clearSel(); renderSide(); }
    void f;
  }

  /* Ukur jarak di denah */
  function setMapMeasure(on) {
    MapUI.measure = !!on; MapUI.pts = []; MapUI.hover = null;
    g("m-measure").setAttribute("aria-pressed", on ? "true" : "false");
    el.mapView.dataset.measure = on ? "1" : "0";
    drawMapMeasure();
    renderSide();
  }
  function setFurn(on) {
    MapUI.furnOn = !!on;
    g("m-furn").setAttribute("aria-pressed", on ? "true" : "false");
    if (maps.full) maps.full.gFurn.style.display = on ? "" : "none";
  }
  function measureTap(e) {
    const m = mapPoint(e.clientX, e.clientY), s = snapTo(m.x, m.y);
    if (MapUI.pts.length >= 2) MapUI.pts = [];
    MapUI.pts.push({ x: s.x, y: s.y });
    MapUI.hover = null;
    drawMapMeasure();
    renderSide();
  }
  function mapHover(e) {
    const m = mapPoint(e.clientX, e.clientY), s = snapTo(m.x, m.y);
    MapUI.hover = s.snapped ? s : null;
    drawMapMeasure();
  }
  function drawMapMeasure() {
    const f = maps.full;
    if (!f) return;
    const gm = f.gMeas, k = f.k, p = MapUI.pts;
    gm.textContent = "";
    if (!MapUI.measure) return;
    if (p.length === 2) {
      S("line", { "class": "m-ms-ln", x1: p[0].x, y1: -p[0].y, x2: p[1].x, y2: -p[1].y }, gm);
      const t = S("text", { "class": "m-ms-tx", x: (p[0].x + p[1].x) / 2, y: -(p[0].y + p[1].y) / 2 - 11 * k }, gm);
      t.textContent = fmtM(Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y));
    }
    p.forEach((q) => S("circle", { "class": "m-ms-pt", cx: q.x, cy: -q.y, r: 5 * k, fill: "url(#fu-warm)" }, gm));
    if (MapUI.hover) S("circle", { "class": "m-snap", cx: MapUI.hover.x, cy: -MapUI.hover.y, r: 8 * k }, gm);
  }

  /* Panel samping denah */
  function cardBtn(parent, label, fn, cls) {
    const b = H("button", cls || "btn soft small", parent);
    b.type = "button"; b.textContent = label;
    b.addEventListener("click", fn);
    return b;
  }
  function selCard(sel) {
    const c = H("div", "tur-sel");
    if (sel.t === "room") {
      const M = mRooms[sel.id], R = roomInfo[sel.id] || {};
      H("p", "tur-kick mono", c).textContent = "Ruang";
      H("h3", "", c).textContent = M.n;
      if (R.jenis) H("p", "", c).textContent = R.jenis;
      roomFacts(H("dl", "tur-facts", c), sel.id);
      if (R.ringkas) H("p", "", c).textContent = R.ringkas;
      const n = items.filter((it) => it.room === sel.id).length;
      if (n) H("p", "", c).textContent = n + " perabot dan sanitair tercatat di model untuk ruang ini. Ketuk salah satunya di denah untuk melihat ukurannya.";
      const sc = scenes.filter((s) => s.room === sel.id)[0];
      if (sc) cardBtn(c, "Lihat dari ruang ini", () => { closeDialog(el.mapd); go(sc.id); });
    } else if (sel.t === "item") {
      const it = items[sel.id], r = mRooms[it.room];
      H("p", "tur-kick mono", c).textContent = it.san ? "Sanitair" : "Perabot";
      H("h3", "", c).textContent = it.name;
      const dl = H("dl", "tur-facts", c);
      if (it.dim) fact(dl, "Ukuran", prettyDim(it.dim), true);
      fact(dl, "Kotak terluar", itemSize(it), true);
      fact(dl, "Tinggi atas", nf(it.z1 / 100, 2) + " m");
      if (r) fact(dl, "Ruang", r.n);
      const sc = scenes.filter((s) => s.room === it.room)[0];
      if (sc) cardBtn(c, "Lihat ruangnya", () => { closeDialog(el.mapd); go(sc.id); });
    } else if (sel.t === "op") {
      const o = MODEL.open[sel.id];
      H("p", "tur-kick mono", c).textContent = OPKIND[o[1]] || "Bukaan";
      H("h3", "", c).textContent = o[8] || OPKIND[o[1]];
      const dl = H("dl", "tur-facts", c);
      fact(dl, "Lebar", thou(Math.max(o[4] - o[2], o[5] - o[3])) + " cm");
      fact(dl, "Tinggi", thou(o[7] - o[6]) + " cm");
      if (o[6] > 1) fact(dl, "Ambang bawah", thou(o[6]) + " cm");
      fact(dl, "Kode", o[0]);
    } else if (sel.t === "scene") {
      const s = byId[sel.id];
      H("p", "tur-kick mono", c).textContent = "Titik pandang " + (s.i + 1);
      H("h3", "", c).textContent = s.nama;
      if (s.cat) H("p", "", c).textContent = s.cat;
      cardBtn(c, "Lihat dari sini", () => { closeDialog(el.mapd); go(s.id); }, "btn primary small");
    }
    return c;
  }
  function measureCard() {
    const c = H("div", "tur-res"), p = MapUI.pts;
    if (p.length < 2) {
      H("p", "", c).textContent = (p.length ? "Ketuk titik kedua." : "Ketuk titik pertama di denah.") + " Titik menempel ke sudut dinding, bukaan, atau perabot yang dekat dengan jarimu.";
      if (p.length) cardBtn(c, "Ulangi", () => { MapUI.pts = []; drawMapMeasure(); renderSide(); });
      return c;
    }
    const dx = Math.abs(p[1].x - p[0].x), dy = Math.abs(p[1].y - p[0].y), d = Math.hypot(dx, dy);
    H("b", "", c).textContent = fmtM(d);
    H("span", "", c).textContent = thou(d) + " cm";
    H("span", "", c).textContent = "Timur-barat " + thou(dx) + " cm, utara-selatan " + thou(dy) + " cm";
    const row = H("div", "tur-row", c);
    cardBtn(row, "Ukur lagi", () => { MapUI.pts = []; drawMapMeasure(); renderSide(); });
    return c;
  }
  function renderSide() {
    const sd = el.mapSide;
    sd.textContent = "";
    if (MapUI.measure) sd.appendChild(measureCard());
    else if (MapUI.sel) sd.appendChild(selCard(MapUI.sel));
    else { const c = H("div", "tur-sel", sd); H("p", "", c).textContent = "Ketuk ruang, perabot, pintu, atau titik pandang di denah untuk melihat keterangannya. Geser untuk menggeser denah, cubit atau gulir untuk zoom."; }
    H("h3", "tur-side-h", sd).textContent = "Titik pandang";
    const ul = H("ul", "tur-vp", sd);
    scenes.forEach((s) => {
      const b = H("button", "", H("li", "", ul));
      b.type = "button";
      b.setAttribute("aria-current", st.scene && st.scene.id === s.id ? "true" : "false");
      H("i", "", b);
      b.appendChild(document.createTextNode(s.nama));
      b.addEventListener("click", () => { closeDialog(el.mapd); go(s.id); });
    });
    H("h3", "tur-side-h", sd).textContent = "Keterangan warna";
    const lg = H("ul", "tur-legend", sd);
    [["k-dry", "Ruang dalam"], ["k-wet", "Kamar mandi, dapur 2, dan area cuci"], ["k-out", "Deck, teras, dan garasi"], ["k-wall", "Dinding"]].forEach((r) => {
      const li = H("li", "", lg);
      H("i", r[0], li);
      li.appendChild(document.createTextNode(r[1]));
    });
  }

  /* ---------------------------------------------------------
     8. Mode edit (tambahkan ?edit di alamat tur) dan start
     --------------------------------------------------------- */
  const edit = { pick: "", box: null, pre: null };
  function editText() {
    const s = st.scene;
    if (!s) return "";
    return "id: " + s.id + " (" + st.variant + ")\npos: [" + s.pos[0] + ", " + s.pos[1] + "]\narah: " + s.arah + "\narah pandang sekarang: " + Math.round(curHeading()) + "\ntitik terakhir: " + (edit.pick || "belum ada");
  }
  function editRefresh() { if (edit.pre) edit.pre.textContent = editText(); }
  function editPick(x, y) {
    if (isPano()) {
      const d = Pano.unproject(x, y);
      edit.pick = "az: " + Math.round(d.az) + ", el: " + Math.round(d.el);
    } else {
      const m = metrics();
      if (!m) return;
      edit.pick = "[" + (st.view.u + (x - st.vw / 2) / m.dw).toFixed(3) + ", " + (st.view.v + (y - st.vh / 2) / m.dh).toFixed(3) + "]";
    }
    editRefresh();
    copyText(edit.pick, "Titik disalin: " + edit.pick);
  }
  function editMapPos(x, y) {
    const s = st.scene;
    if (!s) return;
    s.pos = [Math.round(x), Math.round(y)];
    maps.mini.layout(); if (maps.full) maps.full.layout();
    editRefresh();
    toast("Posisi kamera ruang ini: [" + s.pos[0] + ", " + s.pos[1] + "]");
  }
  function initEdit() {
    const box = H("aside", "tur-edit", root);
    box.setAttribute("aria-label", "Mode edit");
    H("h3", "", box).textContent = "Mode edit";
    edit.box = box;
    edit.pre = H("pre", "", box);
    H("p", "", box).textContent = "Alt + klik di gambar mencatat posisi titik dan menyalinnya. Di HP, geser sampai titik yang dimaksud ada di tengah lalu tekan Titik tengah. Di denah besar, Alt + klik memindahkan posisi kamera ruang ini. Tombol arah mengubah arah kamera, lihat kipas biru di denah mini.";
    const row = H("div", "tur-row", box);
    cardBtn(row, "Titik tengah", () => editPick(st.vw / 2, st.vh / 2));
    [-5, -1, 1, 5].forEach((n) => cardBtn(row, (n > 0 ? "+" : "") + n + "°", () => { if (st.scene) { st.scene.arah = Math.round(norm360(st.scene.arah + n)); hudDirty(); editRefresh(); } }));
    cardBtn(row, "Salin blok", () => { const s = st.scene; copyText("pos: [" + s.pos[0] + ", " + s.pos[1] + "], arah: " + s.arah + ",", "Disalin. Tempel di tur-data.js."); });
    editRefresh();
    setInterval(editRefresh, 500);
  }

  /* ---------------------------------------------------------
     Pasang semua tombol dan mulai
     --------------------------------------------------------- */
  function afterIntro() {
    root.dataset.hint = "1";
    clearTimeout(st.hintT);
    st.hintT = setTimeout(() => { root.dataset.hint = "0"; }, 5200);
    try { el.stage.focus({ preventScroll: true }); } catch (e) { /* abaikan */ }
  }
  function boot() {
    measureStage();
    buildStrip();
    el.helpNote.textContent = D.catatan || "";
    el.bFull.hidden = !canFs;
    if (navigator.share) el.native.hidden = false;

    el.bPrev.addEventListener("click", () => step(-1));
    el.bNext.addEventListener("click", () => step(1));
    el.bRoom.addEventListener("click", () => setStrip(el.strip.hidden));
    el.bMap.addEventListener("click", () => openMap());
    el.mini.addEventListener("click", () => openMap());
    el.bMeasure.addEventListener("click", () => setMeasure(!st.measure));
    el.bInfo.addEventListener("click", () => { setInfo(!st.infoOpen); setMore(false); });
    el.handle.addEventListener("click", () => setInfo(!st.infoOpen));
    el.title.addEventListener("click", () => { if (isNarrow()) setInfo(!st.infoOpen); });
    el.iMap.addEventListener("click", () => { if (isNarrow()) setInfo(false); openMap({ measure: true }); });
    el.bShare.addEventListener("click", () => { setMore(false); openShare(); });
    el.bHelp.addEventListener("click", () => { setMore(false); openDialog(el.help); });
    el.bFull.addEventListener("click", () => { setMore(false); toggleFull(); });
    el.bMore.addEventListener("click", () => setMore(el.more.dataset.open !== "1"));
    document.addEventListener("click", (e) => { if (el.more.dataset.open === "1" && !el.more.contains(e.target)) setMore(false); });
    document.addEventListener("fullscreenchange", syncFull);
    document.addEventListener("webkitfullscreenchange", syncFull);

    $$q("button", el.day).forEach((b) => b.addEventListener("click", () => {
      if (!st.scene || b.dataset.v === st.variant) return;
      st.pref = b.dataset.v;
      go(st.scene.id, { variant: b.dataset.v, keepView: true, quick: true });
    }));

    g("m-measure").addEventListener("click", () => setMapMeasure(!MapUI.measure));
    g("m-furn").addEventListener("click", () => setFurn(!MapUI.furnOn));
    g("m-close").addEventListener("click", () => closeDialog(el.mapd));
    el.mapd.addEventListener("close", () => { st.mapOpen = false; if (maps.full) setMapMeasure(false); });

    $$q("dialog").forEach((d) => {
      $$q("[data-close]", d).forEach((b) => b.addEventListener("click", () => closeDialog(d)));
      if (d === el.intro) return;
      d.addEventListener("click", (e) => {
        const r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(d);
      });
    });
    el.start.addEventListener("click", () => closeDialog(el.intro));
    el.intro.addEventListener("close", afterIntro);
    el.here.addEventListener("change", () => { el.url.value = shareUrl(); });
    el.copy.addEventListener("click", () => copyText(el.url.value));
    el.native.addEventListener("click", () => {
      if (navigator.share) navigator.share({ title: "Tur 3D AURANDA", text: "Jalan-jalan di dalam rumah AURANDA.", url: el.url.value }).catch(() => { /* dibatalkan */ });
    });

    setInfo(!isNarrow());
    maps.mini.layout();
    const start = parseHash();
    if (start && start.v) st.pref = start.v;
    const first = start ? start.s : (byId[D.mulai] || scenes[0]);
    go(first.id, { variant: start && start.v }).then(() => {
      if (EDIT) initEdit(); else if (!start) openDialog(el.intro);
      requestAnimationFrame(() => maps.mini.layout());
    });
    window.addEventListener("hashchange", () => {
      const h = parseHash();
      if (!h) return;
      if (h.v) st.pref = h.v;
      if (!st.scene || h.s !== st.scene || (h.v && h.v !== st.variant)) go(h.s.id, { variant: h.v, noHash: true });
    });
  }
  boot();
})();
