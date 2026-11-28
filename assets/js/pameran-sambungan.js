/* =========================================================
   PAMERAN SAMBUNGAN
   Penampil sambungan kayu. Bagian dibuat dari kotak dan silinder berukuran asli (milimeter),
   lalu dirakit lewat animasi. "Lihat dalam" membuat kayu tembus pandang supaya pasak,
   baut, mur, dan purus yang tersembunyi terlihat. Memakai Stage dan Orbit dari pameran-3d.js.
   ========================================================= */
(function () {
  "use strict";
  const KV = window.KursiViewer, T = window.THREE;
  if (!KV || !T) { window.KursiJoint = null; return; }
  const V3 = T.Vector3;
  const { Stage, Orbit, baseMat, easeInOut, clamp } = KV.core;
  const S = 0.004;   // 1 mm di kenyataan = 0,004 satuan di layar

  /* ---------- bahan ---------- */
  const wood = (k) => baseMat(k || "jati", 4).clone();
  const peg = () => new T.MeshStandardMaterial({ color: 0x8b5a34, roughness: 0.55, envMapIntensity: 0.4 });
  const steel = () => new T.MeshStandardMaterial({ color: 0xd2d6df, metalness: 0.88, roughness: 0.3, envMapIntensity: 1.4 });
  const hole = () => new T.MeshStandardMaterial({ color: 0x120d22, roughness: 1 });

  /* ---------- bentuk dasar (satuan milimeter) ---------- */
  const AXU = [["z", "y"], ["z", "y"], ["x", "z"], ["x", "z"], ["x", "y"], ["x", "y"]];
  function box(x0, x1, y0, y1, z0, z1, mat, grain) {
    const w = x1 - x0, h = y1 - y0, d = z1 - z0;
    const g = new T.BoxGeometry(w * S, h * S, d * S);
    const uv = g.attributes.uv;
    const F = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    const long = grain || (w >= h && w >= d ? "x" : h >= d ? "y" : "z");
    for (let f = 0; f < 6; f++) {
      const a = F[f][0], b = F[f][1], swap = AXU[f][1] === long && AXU[f][0] !== long;
      for (let k = 0; k < 4; k++) {
        const i = f * 4 + k, u = uv.getX(i), v = uv.getY(i);
        if (swap) uv.setXY(i, v * b / 160, u * a / 160); else uv.setXY(i, u * a / 160, v * b / 160);
      }
    }
    const m = new T.Mesh(g, mat);
    m.position.set((x0 + x1) / 2 * S, (y0 + y1) / 2 * S, (z0 + z1) / 2 * S);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  function cyl(r, len, axis, x, y, z, mat) {
    const g = new T.CylinderGeometry(r * S, r * S, len * S, 28);
    if (axis === "x") g.rotateZ(Math.PI / 2); else if (axis === "z") g.rotateX(Math.PI / 2);
    const m = new T.Mesh(g, mat);
    m.position.set(x * S, y * S, z * S);
    m.castShadow = true;
    return m;
  }
  function clip(poly, keep) {   /* Sutherland-Hodgman untuk satu setengah bidang */
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ka = keep(a), kb = keep(b);
      if (ka) out.push(a);
      if (ka !== kb) {
        const da = keep(a, true), db = keep(b, true), t = da / (da - db);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  }
  function extrude(poly, depth, mat) {
    const sh = new T.Shape(poly.map((p) => new T.Vector2(p[0], p[1])));
    const g = new T.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 160, uv.getY(i) / 160);
    g.scale(S, S, S);
    const m = new T.Mesh(g, mat);
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  /* ---------- konteks susunan ---------- */
  function ctx() {
    const c = { root: new T.Group(), parts: [], labels: [], caps: [], view: { theta: -0.7, phi: 1.0 }, xray: true, noXray: false, dur: 7 };
    c.add = (mesh, o, parent) => {
      o = o || {};
      mesh.userData.j = { base: mesh.position.clone(), from: new V3(...(o.from || [0, 0, 0])).multiplyScalar(S), t0: o.t ? o.t[0] : 0, t1: o.t ? o.t[1] : 1, shell: !!o.shell, spin: o.spin || null, hideAt: o.hideAt != null ? o.hideAt : null };
      (parent || c.root).add(mesh);
      c.parts.push(mesh);
      return mesh;
    };
    c.group = (o, parent) => { const g = new T.Group(); return c.add(g, o, parent); };
    c.label = (p, text, show) => c.labels.push({ p: new V3(p[0] * S, p[1] * S, p[2] * S), text, show: show || [0.9, 1] });
    return c;
  }
  const fmt = (n) => String(n).replace(".", ",");

  /* ---------- susunan ---------- */
  const B = {};

  /* purus dan pasak bor-tarik: anggota berpurus (post) berdiri di atas anggota berlubang (rail) */
  B["tenon-peg"] = (p) => {
    const c = ctx();
    const pz = p.post[0], px = p.post[1], rz = p.rail[0], H = p.rail[1];
    const tz = p.tenon[0], tw = p.tenon[1], td = p.tenon[2], pd = p.peg;
    const L = Math.max(150, H * 3), off = p.offset || 0, xm = off > 0 ? off + tw / 2 : L / 2;
    const sh = { shell: true };
    c.add(box(0, L, 0, H - td, -rz / 2, rz / 2, wood(), "x"), sh);
    c.add(box(0, xm - tw / 2, H - td, H, -rz / 2, rz / 2, wood(), "x"), sh);
    c.add(box(xm + tw / 2, L, H - td, H, -rz / 2, rz / 2, wood(), "x"), sh);
    c.add(box(xm - tw / 2, xm + tw / 2, H - td, H, tz / 2, rz / 2, wood(), "x"), sh);
    c.add(box(xm - tw / 2, xm + tw / 2, H - td, H, -rz / 2, -tz / 2, wood(), "x"), sh);
    const up = { from: [0, 95, 0], t: [0, 0.5] };
    c.add(box(xm - px / 2, xm + px / 2, H, H + 110, -pz / 2, pz / 2, wood(), "y"), { ...up, shell: true });
    c.add(box(xm - tw / 2, xm + tw / 2, H - td, H, -tz / 2, tz / 2, wood(), "y"), up);
    const py = H - Math.min(13, td * 0.5);
    c.add(cyl(pd / 2, rz + 10, "z", xm, py, 0, peg()), { from: [0, 0, 70], t: [0.55, 0.9] });
    c.label([xm, H + 4, rz / 2], "Lubang purus", [0, 0.3]);
    c.label([xm + tw / 2, H - td / 2, tz / 2], `Purus ${tz} × ${tw} × ${td}`, [0.55, 1]);
    c.label([xm, py, rz / 2 + 5], `Pasak Ø${pd}`, [0.9, 1]);
    c.caps = [[0, "Purus di ujung bagian atas siap masuk ke lubang di bagian bawah."],
      [0.5, "Pasak dipukul masuk dari samping. Lubang di purus digeser sedikit ke arah bahu, jadi pasak menarik sambungan rapat."],
      [0.92, "Terkunci. Bidang sambungan dilem, lalu ujung pasak dipotong rata."]];
    c.view = { theta: -0.75, phi: 1.0 };
    return c;
  };

  /* diagonal berujung miring dikunci pen ke tiang dan lengan */
  B.pens = (p) => {
    const c = ctx();
    const pd = p.pen[0], pl = p.pen[1];
    const T0 = 30, ang = Math.PI / 6, u = [Math.cos(ang), -Math.sin(ang)], n = [Math.sin(ang), Math.cos(ang)];
    const C = [0, 200], w = 40;
    const band = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([a, b]) => [C[0] + u[0] * (a > 0 ? 300 : -60) + n[0] * w / 2 * b, C[1] + u[1] * (a > 0 ? 300 : -60) + n[1] * w / 2 * b]);
    let poly = clip(band, (q, d) => (d ? q[0] : q[0] >= 0));
    poly = clip(poly, (q, d) => (d ? 200 - q[1] : q[1] <= 200));
    const sh = { shell: true };
    c.add(box(-50, 0, 0, 200, -T0 / 2, T0 / 2, wood(), "y"), sh);
    c.add(box(-50, 240, 200, 250, -T0 / 2, T0 / 2, wood(), "x"), sh);
    const g = c.group({ from: [90, -52, 0], t: [0.32, 0.85] });
    g.add(extrude(poly, T0, wood()));
    g.children[0].userData.j = { base: new V3(), from: new V3(), t0: 0, t1: 1, shell: true, spin: null };
    c.parts.push(g.children[0]);
    const pa = cyl(pd / 2, pl, "y", 20, 200, 0, peg());
    const pb = cyl(pd / 2, pl, "x", 0, 188, 0, peg());
    c.add(pa, { from: [0, -34, 0], t: [0, 0.3] }, g);
    c.add(pb, { from: [34, 0, 0], t: [0, 0.3] }, g);
    c.label([20, 220, 0], `Pen Ø${pd} × ${pl} ke lengan`, [0.88, 1]);
    c.label([-20, 188, 0], `Pen Ø${pd} × ${pl} ke tiang`, [0.88, 1]);
    c.caps = [[0, "Dua pen dimasukkan ke ujung diagonal. Ujungnya dipotong mengikuti sudut tiang dan lengan."],
      [0.35, "Diagonal naik sampai rapat ke tiang dan ke bawah lengan."],
      [0.88, "Pen mengunci ujung atas. Di ujung bawah ada satu pen lagi ke alas, jadi seluruhnya tiga pen."]];
    c.view = { theta: 0.9, phi: 1.1 };
    return c;
  };

  /* baut dengan mur silang (palang) dan baut dengan mur tanam (sandaran) */
  function bolt(p, cross) {
    const c = ctx();
    const post = p.post, other = cross ? p.rail : p.arm, bd = p.bolt[0], bl = p.bolt[1], nd = p.nut[0], nl = p.nut[1];
    const headD = bd + 5, csD = cross ? 16 : 18, hy = 85, sh = { shell: true };
    // anggota luar (tiang atau lengan) di x -30..0
    const outerW = cross ? post[1] : other[1];
    c.add(box(-30, 0, 0, 170, -outerW / 2, outerW / 2, wood(), "y"), sh);
    c.add(cyl(csD / 2, 0.6, "x", -29.7, hy, 0, hole()));
    if (cross) {
      const rh = other[1], rz = other[0];
      const grp = c.group({ from: [90, 0, 0], t: [0.12, 0.58] });
      const rail = box(0, 170, hy - rh / 2, hy + rh / 2, -rz / 2, rz / 2, wood(), "x");
      rail.userData.j = { base: rail.position.clone(), from: new V3(), t0: 0, t1: 1, shell: true, spin: null };
      grp.add(rail); c.parts.push(rail);
      const pens = [hy - 17, hy + 17].map((y) => { const m = cyl(p.pen[0] / 2, p.pen[1], "x", 0, y, 0, peg()); c.add(m, {}, grp); return m; });
      const nut = cyl(nd / 2, nl, "y", 45, hy, 0, steel()); c.add(nut, {}, grp);
      c.label([45, hy - nl / 2 - 2, 0], `Mur silang Ø${nd}`, [0.9, 1]);
      c.label([0, hy + 17, rz / 2], `Pen Ø${p.pen[0]} × ${p.pen[1]}`, [0.9, 1]);
      void pens;
    } else {
      const bw = post[1];
      const grp = c.group({ from: [90, 0, 0], t: [0.05, 0.5] });
      const bp = box(0, 30, 0, 170, -bw / 2, bw / 2, wood(), "y");
      bp.userData.j = { base: bp.position.clone(), from: new V3(), t0: 0, t1: 1, shell: true, spin: null };
      grp.add(bp); c.parts.push(bp);
      const nut = cyl(nd / 2, nl, "x", 28 - nl / 2, hy, 0, steel()); c.add(nut, {}, grp);
      c.label([28 - nl / 2, hy + nd / 2, 0], `Mur tanam M${bd} × ${nl}`, [0.9, 1]);
    }
    // baut: kepala, ring, batang
    const bg = c.group({ from: [-80, 0, 0], t: [0.55, 0.88], spin: { axis: "x", turns: 3 } });
    const washT = 1.6, headT = 4.5, seat = -22;
    bg.add(cyl(bd / 2, bl, "x", seat + bl / 2, hy, 0, steel()));
    bg.add(cyl((headD + 2) / 2, washT, "x", seat - washT / 2, hy, 0, steel()));
    bg.add(cyl(headD / 2, headT, "x", seat - washT - headT / 2, hy, 0, steel()));
    c.label([seat - washT - headT, hy + headD / 2, 0], `Baut M${bd} × ${bl}`, [0.9, 1]);
    c.add(cyl(csD / 2 - 0.3, 3, "x", -28.5, hy, 0, wood()), { from: [-30, 0, 0], t: [0.88, 1] });
    c.label([-30, hy - csD / 2, 0], "Sumbat kayu", [0.96, 1]);
    c.caps = cross
      ? [[0, "Dua pen sudah dilem di ujung palang. Mur silang tertanam di dalam palang, lubangnya dibor dari sisi bawah."],
        [0.15, "Palang didorong rapat ke tiang. Dua pen menjaga palang tidak berputar."],
        [0.55, "Baut masuk dari muka luar, menembus tiang, lalu mengait mur silang di dalam palang."],
        [0.9, "Kepala baut tenggelam di lubang benam dan ditutup sumbat kayu. Tanpa lem, jadi palang bisa dilepas lagi."]]
      : [[0, "Mur tanam sudah terpasang di dalam tiang sandaran, searah dengan lubang baut."],
        [0.05, "Tiang sandaran menempel ke sisi dalam lengan."],
        [0.55, "Baut menembus lengan lalu berputar masuk ke mur tanam."],
        [0.9, "Kepala baut tenggelam di lubang benam dan ditutup sumbat kayu. Sandaran bisa dilepas dengan membuka empat baut."]];
    c.view = { theta: -0.9, phi: 1.05 };
    return c;
  }
  B["bolt-cross"] = (p) => bolt(p, true);
  B["bolt-nut"] = (p) => bolt(p, false);

  /* purus tembus dengan baji (Pinarak) */
  B.wedge = (p) => {
    const c = ctx();
    const lw = p.leg[0], bz = p.arm[1], bt = p.arm[0], tz = p.tenon[0], tx = p.tenon[1];
    const ww = p.wedge[0], wl = p.wedge[2], L = 150, sh = { shell: true };
    const x0 = -L / 2, x1 = L / 2;
    c.add(box(x0, -tx / 2, 0, bt, -bz / 2, bz / 2, wood(), "x"), sh);
    c.add(box(tx / 2, x1, 0, bt, -bz / 2, bz / 2, wood(), "x"), sh);
    c.add(box(-tx / 2, tx / 2, 0, bt, tz / 2, bz / 2, wood(), "x"), sh);
    c.add(box(-tx / 2, tx / 2, 0, bt, -bz / 2, -tz / 2, wood(), "x"), sh);
    const up = { from: [0, -90, 0], t: [0, 0.5] };
    const top = bt + 5;
    c.add(box(-lw / 2, lw / 2, -120, 0, -lw / 2, lw / 2, wood(), "y"), { ...up, shell: true });
    c.add(box(-tx / 2, tx / 2, 0, top, -tz / 2, tz / 2, wood("jati_ujung"), "y"), up);
    const kerf = box(-tx / 2 + 0.3, tx / 2 - 0.3, top - wl, top + 0.05, -ww / 2 + 0.6, ww / 2 - 0.6, hole(), "y");
    c.add(kerf, { from: [0, -90, 0], t: [0, 0.5], hideAt: 0.62 });
    c.add(box(-tx / 2, tx / 2, top - wl + 1, top + 1, -ww / 2, ww / 2, wood("sonokeling"), "y"), { from: [0, 48, 0], t: [0.62, 0.95] });
    c.label([tx / 2, top, tz / 2], `Purus tembus ${tz} × ${tx}`, [0.5, 1]);
    c.label([0, top + 2, 0], `Baji sonokeling ${ww} × ${tx} × ${wl}`, [0.95, 1]);
    c.caps = [[0, "Kaki depan naik dari bawah. Ujung purusnya akan menembus lubang di papan lengan."],
      [0.5, "Purus muncul di atas papan. Sebuah belahan kecil dibuat di ujungnya."],
      [0.62, "Baji sonokeling dipukul masuk ke belahan."],
      [0.95, "Purus melebar dan terkunci rapat tanpa paku. Ujung gelap baji menjadi hiasan di atas papan."]];
    c.xray = false; c.dur = 6;
    c.view = { theta: -0.8, phi: 0.95 };
    return c;
  };

  /* panel kisi: bilah tegak jatuh satu per satu di antara dua rel */
  B.slats = (p) => {
    const c = ctx();
    const n = p.count, st = p.slat, pitch = p.pitch, rb = p.rail;
    const RL = 690, sh = { shell: true };
    c.add(box(0, RL, 0, 60, -rb[0] / 2, rb[0] / 2, wood(), "x"), sh);
    const x0 = 19;
    for (let k = 0; k < n; k++) {
      const a = x0 + k * pitch, t0 = 0.02 + k * 0.032;
      c.add(box(a, a + st[0], 60, 60 + st[2], -st[1] / 2, st[1] / 2, wood(), "y"), { from: [0, 170, 0], t: [t0, t0 + 0.22] });
    }
    c.add(box(0, RL, 60 + st[2], 60 + st[2] + 40, -rb[0] / 2, rb[0] / 2, wood(), "x"), { from: [0, 120, 0], t: [0.74, 0.98], shell: true });
    c.label([x0 + st[0] / 2, 60 + st[2], st[1] / 2], `Bilah ${st[0]} × ${st[1]} × ${st[2]}`, [0.96, 1]);
    c.label([x0 + st[0] + pitch / 2 - st[0] / 2, 60 + st[2] / 2, st[1] / 2], `Jarak ${fmt(pitch)}`, [0.96, 1]);
    c.caps = [[0, "Rel bawah panel lengan sudah terpasang. Bilah kisi akan masuk satu per satu."],
      [0.1, "Tujuh belas bilah tegak berdiri dengan jarak sama. Rongga di antaranya hampir selebar bilahnya."],
      [0.76, "Rel atas turun menutup ujung bilah dan mengikat semuanya jadi satu panel."]];
    c.noXray = true; c.xray = false; c.dur = 8;
    c.view = { theta: 0.35, phi: 1.25 };
    return c;
  };

  /* =========================================================
     Penampil
     ========================================================= */
  class KursiJoint {
    constructor(host, opt) {
      this.host = host; this.opt = opt || {};
      this.stage = new Stage(host, { exposure: 0.62, shadows: true });
      if (this.stage.failed) { this.failed = true; if (this.opt.onFail) this.opt.onFail(); return; }
      this.orbit = new Orbit(this.stage.canvas, this.stage.camera, this.stage, {
        onInteract: () => { this.orbit.auto = 0; this.userMoved = true; if (this.opt.onInteract) this.opt.onInteract(); },
        onReset: () => this.resetView()
      });
      this.stage.canvas.removeAttribute("aria-hidden");
      this.stage.canvas.setAttribute("role", "img");
      this.stage.canvas.setAttribute("aria-label", "Model 3D sambungan kayu. Gunakan tombol panah untuk memutar.");
      this.labelBox = document.createElement("div");
      this.labelBox.className = "jnt-labels";
      this.labelBox.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden";
      host.appendChild(this.labelBox);
      this.t = 0; this.playing = false; this.xray = false; this.c = null; this.capIdx = -1;
      this.stage.tickers.push((dt) => this.tick(dt));
      this.stage.onFrame = () => this.placeLabels();
      this.stage.onResize = () => { if (this.fitR) this.refit(); };
      host.classList.add("is-ready");
    }

    show(def) {
      if (this.failed) return;
      this.clear();
      const make = B[def.builder];
      if (!make) return;
      const c = make(def.params);
      this.c = c;
      this.stage.scene.add(c.root);
      c.root.updateMatrixWorld(true);
      // tempatkan di tengah, sedikit di atas lantai
      c.parts.forEach((m) => { m.position.copy(m.userData.j.base); });
      const box3 = new T.Box3().setFromObject(c.root);
      const ctr = box3.getCenter(new V3());
      c.root.position.set(-ctr.x, 0.07 - box3.min.y, -ctr.z);
      // bingkai kamera memuat seluruh gerakan: keadaan rakit dan keadaan awal saat bagian masih terpisah
      const done = new T.Box3().setFromObject(c.root);
      c.parts.forEach((m) => { const j = m.userData.j; m.position.copy(j.base).add(j.from); });
      const start = new T.Box3().setFromObject(c.root);
      c.parts.forEach((m) => { m.position.copy(m.userData.j.base); });
      const all = done.clone().union(start);
      const size = all.getSize(new V3());
      this.size = size;
      this.tgt = all.getCenter(new V3());
      this.fitR = size.length() * 0.5;
      this.orbit.target.copy(this.tgt);
      this.orbit.panLimit = Math.max(size.x, size.z) * 1.2;
      this.userMoved = false;
      this.labelBox.innerHTML = "";
      c.labels.forEach((l) => { const e = document.createElement("span"); e.className = "jnt-label"; e.textContent = l.text; l.el = e; this.labelBox.appendChild(e); });
      this.xray = !!c.xray;
      this.setXrayInternal(this.xray);
      this.t = 0; this.playing = false; this.capIdx = -1;
      this.refit(true);
      this.resetView(true);
      this.apply();
      if (this.opt.onShow) this.opt.onShow(def, c);
    }

    clear() {
      if (!this.c) return;
      this.stage.scene.remove(this.c.root);
      this.c.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); });
      this.c = null;
    }

    refit() {
      const r = this.stage.fitRadius(this.fitR) * 1.12;
      this.homeR = r;
      this.orbit.min = r * 0.35; this.orbit.max = r * 2.4;
      if (!this.userMoved) this.orbit.radius = r;
      this.orbit.apply(); this.stage.invalidate();
    }
    resetView(instant) {
      if (!this.c) return;
      const v = this.c.view, o = this.orbit, g = this.tgt;
      this.userMoved = false;
      if (instant) { o.theta = v.theta; o.phi = v.phi; o.radius = this.homeR; o.target.copy(g); o.apply(); this.stage.invalidate(); }
      else o.flyTo({ theta: v.theta, phi: v.phi, radius: this.homeR, x: g.x, y: g.y, z: g.z }, 800);
    }
    setAuto(on) { this.orbit.auto = on ? 0.2 : 0; this.stage.invalidate(); }
    zoom(f) { this.orbit.zoomBy(f); this.userMoved = true; }

    setXray(on) { if (this.c && this.c.noXray) return; this.xray = on; this.setXrayInternal(on); this.stage.invalidate(); }
    setXrayInternal(on) {
      if (!this.c) return;
      this.c.parts.forEach((m) => {
        if (!m.isMesh || !m.userData.j.shell) return;
        const mat = m.material;
        mat.transparent = on; mat.opacity = on ? 0.15 : 1; mat.depthWrite = !on;
        if (!m.userData.edges) {
          const e = new T.LineSegments(new T.EdgesGeometry(m.geometry, 20), new T.LineBasicMaterial({ color: 0xffe3b8, transparent: true, opacity: 0.85 }));
          e.renderOrder = 3; m.add(e); m.userData.edges = e;
        }
        m.userData.edges.visible = on;
        m.castShadow = !on;
      });
    }

    setTime(t) { this.playing = false; this.t = clamp(t, 0, 1); this.apply(); }
    play() {
      if (!this.c) return;
      if (this.t >= 1) this.t = 0;
      this.playing = true; this.stage.invalidate();
    }
    pause() { this.playing = false; }

    apply() {
      const c = this.c; if (!c) return;
      const t = this.t;
      c.parts.forEach((m) => {
        const j = m.userData.j, k = clamp((t - j.t0) / (j.t1 - j.t0 || 1), 0, 1), e = easeInOut(k);
        m.position.copy(j.base).addScaledVector(j.from, 1 - e);
        if (j.spin) m.rotation[j.spin.axis] = j.spin.turns * Math.PI * 2 * (1 - e);
        if (j.hideAt != null) m.visible = t < j.hideAt;
      });
      let idx = 0;
      c.caps.forEach((cp, i) => { if (t >= cp[0] - 1e-6) idx = i; });
      if (idx !== this.capIdx) { this.capIdx = idx; if (this.opt.onCaption && c.caps[idx]) this.opt.onCaption(c.caps[idx][1]); }
      this.stage.invalidate();
    }
    tick(dt) {
      let ch = this.orbit.update(dt);
      if (this.playing && this.c) {
        this.t = Math.min(1, this.t + dt / this.c.dur);
        this.apply(); ch = true;
        if (this.opt.onTime) this.opt.onTime(this.t);
        if (this.t >= 1) { this.playing = false; if (this.opt.onEnd) this.opt.onEnd(); }
      }
      return ch;
    }
    placeLabels() {
      const c = this.c; if (!c) return;
      const cam = this.stage.camera, w = this.stage.w, h = this.stage.h, t = this.t, v = new V3();
      const shown = [];
      c.labels.forEach((l) => {
        const on = t >= l.show[0] - 1e-6 && t <= l.show[1] + 1e-6;
        l.el.classList.toggle("on", on);
        if (!on) return;
        v.copy(l.p).add(c.root.position).project(cam);
        const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
        const bw = l.el.offsetWidth || 120;
        shown.push({ l, x: x + bw + 30 > w ? x - bw - 22 : x + 16, y: y - 13 });
      });
      /* label yang saling menimpa digeser ke bawah */
      shown.sort((a, b) => a.y - b.y);
      for (let i = 1; i < shown.length; i++) { if (shown[i].y - shown[i - 1].y < 26) shown[i].y = shown[i - 1].y + 26; }
      shown.forEach((s) => { s.l.el.style.transform = `translate(${s.x}px,${s.y}px)`; });
    }
    dispose() { this.clear(); if (this.stage) this.stage.dispose(); }
  }
  window.KursiJoint = KursiJoint;
})();
