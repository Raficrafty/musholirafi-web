/* =========================================================
   PAMERAN 3D
   Penampil kursi interaktif. Memakai three.js r149 (assets/vendor/three.min.js), tanpa pustaka lain.
   Model dibaca dari assets/model/*.json (hasil konversi model SketchUp, satuan posisi 0,1 mm).
   Fitur: putar, geser, zoom, mode tembus pandang dan garis, lapisan, bongkar, animasi rakit,
   gerak fungsi kursi, titik info, dan penunjuk bagian.
   ========================================================= */
(function () {
  "use strict";
  const T = window.THREE;
  if (!T) { window.KursiViewer = null; return; }

  const V3 = T.Vector3;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const BASE = "assets/tekstur/";

  /* ---------- Bahan ---------- */
  const MAT = {
    jati:        { tex: "jati.jpg", r: 0.6, env: 0.42 },
    jati_ujung:  { tex: "jati.jpg", r: 0.6, env: 0.42 },
    cekungan:    { tex: "jati.jpg", r: 0.6, env: 0.42, tint: 0x9b8566 },
    sonokeling:  { tex: "sonokeling.jpg", r: 0.45, env: 0.5 },
    cane:        { tex: "cane.webp", r: 0.7, env: 0.35, alpha: true },
    pitrit:      { tex: "pitrit.webp", r: 0.7, env: 0.35, alpha: true },
    kepar:       { tex: "kepar.jpg", r: 0.72, env: 0.35, double: true },
    lurik:       { tex: "lurik.jpg", r: 0.96, env: 0.22, cloth: true },
    lurik_tali:  { tex: "lurik.jpg", r: 0.96, env: 0.22, cloth: true },
    kanvas_abu:  { tex: "kanvas-abu.jpg", r: 0.96, env: 0.22, cloth: true },
    kanvas_putih:{ tex: "kanvas-putih.jpg", r: 0.96, env: 0.35, cloth: true },
    felt:        { tex: "felt.jpg", r: 1, env: 0.2 }
  };
  const CAT_LABEL = { kayu: "Rangka kayu", anyam: "Anyaman rotan", bantal: "Bantal dan kain", lain: "Pelengkap" };
  const CAT_EDGE = { kayu: 0xffe3b8, anyam: 0xffd36a, bantal: 0x9fb4ff, lain: 0xd6d2c8 };

  const texCache = new Map();
  const texWaiters = new Set();
  function loadTex(file, maxAniso) {
    if (texCache.has(file)) return texCache.get(file);
    const t = new T.TextureLoader().load(BASE + file, () => texWaiters.forEach((fn) => fn()));
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.encoding = T.sRGBEncoding;
    t.anisotropy = maxAniso || 4;
    texCache.set(file, t);
    return t;
  }
  const matCache = new Map();
  function baseMat(key, maxAniso) {
    if (matCache.has(key)) return matCache.get(key);
    const d = MAT[key] || MAT.jati;
    const P = d.cloth ? T.MeshPhysicalMaterial : T.MeshStandardMaterial;
    const m = new P({ color: 0xffffff, roughness: d.r, metalness: 0, envMapIntensity: d.env });
    m.map = loadTex(d.tex, maxAniso);
    if (d.tint) m.color.set(d.tint);
    if (d.bump) { m.bumpMap = m.map; m.bumpScale = d.bump; }
    if (d.alpha) { m.alphaTest = 0.45; m.side = T.DoubleSide; }
    if (d.double) m.side = T.DoubleSide;
    if (d.cloth) { m.sheen = 0.55; m.sheenRoughness = 0.8; m.sheenColor = new T.Color(0.2, 0.23, 0.38); }
    matCache.set(key, m);
    return m;
  }

  /* cocokkan bagian dengan kode, kata sisi (kiri, kanan, dst), dan pola nama */
  function partMatch(m, code, side, rx) {
    const p = m.userData.part;
    if (code && p.code !== code) return false;
    if (side && p.name.toLowerCase().indexOf(side) < 0) return false;
    if (rx && !rx.test(p.name)) return false;
    return true;
  }

  /* ---------- Lingkungan pantulan (studio kecil) ---------- */
  function makeEnv(renderer) {
    const pm = new T.PMREMGenerator(renderer);
    const s = new T.Scene();
    const g = new T.SphereGeometry(10, 32, 16);
    const pos = g.attributes.position, cols = new Float32Array(pos.count * 3);
    const top = new T.Color(1.0, 0.93, 0.82), bot = new T.Color(0.10, 0.11, 0.2), c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 10;
      const k = clamp((y + 0.25) / 1.05, 0, 1);
      c.copy(bot).lerp(top, k * k * (3 - 2 * k));
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new T.BufferAttribute(cols, 3));
    s.add(new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    const panel = (w, h, x, y, z, r, gg, b) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(r, gg, b), side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    };
    panel(6, 3.2, 4.5, 6.5, 5, 7, 6.2, 5.2);
    panel(3, 5, -7, 3.5, -2, 2.2, 2.4, 3.2);
    panel(5, 2, 0, 7, -6, 2.6, 2.2, 1.8);
    const rt = pm.fromScene(s, 0.04);
    pm.dispose();
    g.dispose();
    return rt.texture;
  }

  function radialTexture(stops, size) {
    const cv = document.createElement("canvas"); cv.width = cv.height = size || 256;
    const x = cv.getContext("2d"), r = cv.width / 2;
    const gr = x.createRadialGradient(r, r, 0, r, r, r);
    stops.forEach((s) => gr.addColorStop(s[0], s[1]));
    x.fillStyle = gr; x.fillRect(0, 0, cv.width, cv.height);
    const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; return t;
  }

  /* =========================================================
     Panggung: renderer, lampu, lantai bayangan, loop gambar
     ========================================================= */
  class Stage {
    constructor(host, opt) {
      opt = opt || {};
      this.host = host;
      this.opt = opt;
      const cv = document.createElement("canvas");
      cv.className = "k3d-canvas";
      cv.setAttribute("aria-hidden", "true");
      host.appendChild(cv);
      let r;
      try {
        r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!opt.keep });
      } catch (e) { this.failed = true; cv.remove(); return; }
      this.renderer = r;
      this.canvas = cv;
      r.outputEncoding = T.sRGBEncoding;
      r.toneMapping = T.ACESFilmicToneMapping;
      r.toneMappingExposure = opt.exposure || 1.0;
      r.shadowMap.enabled = opt.shadows !== false;
      r.shadowMap.type = T.PCFSoftShadowMap;
      r.setClearColor(0x000000, 0);
      this.maxAniso = Math.min(8, r.capabilities.getMaxAnisotropy());
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(opt.fov || 30, 1, 0.05, 60);
      this.scene.environment = makeEnv(r);
      this.dirty = true;
      this.visible = true;
      this.tickers = [];
      this.clock = new T.Clock();
      this.buildLights();
      this.buildFloor();
      this.onTex = () => { this.dirty = true; };
      texWaiters.add(this.onTex);
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(host);
      this.io = new IntersectionObserver((e) => { this.visible = e[0].isIntersecting; if (this.visible) { this.dirty = true; this.clock.getDelta(); } }, { rootMargin: "120px" });
      this.io.observe(host);
      this._onVis = () => { if (!document.hidden) { this.dirty = true; this.clock.getDelta(); } };
      document.addEventListener("visibilitychange", this._onVis);
      this.resize();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
    }
    buildLights() {
      const s = this.scene;
      this.hemi = new T.HemisphereLight(0xfff1dc, 0x2b2f58, 0.24);
      s.add(this.hemi);
      const key = new T.DirectionalLight(0xffe2b8, 0.86);
      key.position.set(2.2, 3.6, 2.6);
      key.castShadow = this.opt.shadows !== false;
      key.shadow.mapSize.set(2048, 2048);
      const sc = key.shadow.camera; sc.left = -1.6; sc.right = 1.6; sc.top = 1.6; sc.bottom = -1.6; sc.near = 0.5; sc.far = 9;
      key.shadow.bias = -0.0004; key.shadow.normalBias = 0.004; key.shadow.radius = 4;
      s.add(key); s.add(key.target);
      this.key = key;
      const rim = new T.DirectionalLight(0x8ea3ff, 0.5);
      rim.position.set(-3, 2.2, -2.6);
      s.add(rim);
      const fill = new T.DirectionalLight(0xffd9b0, 0.14);
      fill.position.set(-2.4, 1.2, 3);
      s.add(fill);
    }
    buildFloor() {
      const pool = new T.Mesh(new T.PlaneGeometry(4.4, 4.4), new T.MeshBasicMaterial({
        map: radialTexture([[0, "rgba(255,206,140,0.50)"], [0.35, "rgba(255,190,120,0.20)"], [0.7, "rgba(120,130,255,0.07)"], [1, "rgba(0,0,0,0)"]], 256),
        transparent: true, depthWrite: false, toneMapped: false
      }));
      pool.rotation.x = -Math.PI / 2; pool.position.y = 0.0004; pool.renderOrder = -3;
      this.scene.add(pool);
      this.pool = pool;
      const sh = new T.Mesh(new T.PlaneGeometry(6, 6), new T.ShadowMaterial({ opacity: 0.42 }));
      sh.rotation.x = -Math.PI / 2; sh.position.y = 0.0008; sh.receiveShadow = true; sh.renderOrder = -2;
      this.scene.add(sh);
      this.shadowPlane = sh;
    }
    resize() {
      if (!this.renderer) return;
      const w = Math.max(1, this.host.clientWidth), h = Math.max(1, this.host.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, w * h > 1.4e6 ? 1.5 : 2);
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.w = w; this.h = h;
      this.dirty = true;
      if (this.onResize) this.onResize(w, h);
    }
    fitRadius(radius) {
      const v = this.camera.fov * Math.PI / 180;
      const hf = 2 * Math.atan(Math.tan(v / 2) * this.camera.aspect);
      return radius / Math.sin(Math.min(v, hf) / 2);
    }
    loop() {
      this.raf = requestAnimationFrame(this.loop);
      if (!this.renderer || !this.visible || document.hidden) return;
      const dt = Math.min(0.05, this.clock.getDelta());
      let need = this.dirty;
      for (let i = 0; i < this.tickers.length; i++) { if (this.tickers[i](dt)) need = true; }
      if (need) {
        this.dirty = false;
        this.renderer.render(this.scene, this.camera);
        if (this.onFrame) this.onFrame();
      }
    }
    invalidate() { this.dirty = true; }
    dispose() {
      cancelAnimationFrame(this.raf);
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
      document.removeEventListener("visibilitychange", this._onVis);
      texWaiters.delete(this.onTex);
      if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss(); }
      if (this.canvas) this.canvas.remove();
    }
  }

  /* =========================================================
     Kendali orbit: putar, geser, zoom (mouse, sentuh, papan ketik)
     ========================================================= */
  class Orbit {
    constructor(dom, cam, stage, opt) {
      opt = opt || {};
      this.dom = dom; this.cam = cam; this.stage = stage;
      this.target = new V3(); this.theta = 0.7; this.phi = 1.18; this.radius = 3;
      this.min = 0.4; this.max = 8; this.phiMin = 0.06; this.phiMax = Math.PI / 2 - 0.02;
      this.vT = 0; this.vP = 0; this.tween = null; this.auto = 0; this.active = false;
      this.free = false;
      this.ptrs = new Map(); this.moved = 0; this.downAt = 0; this.pinch = 0;
      this.onInteract = opt.onInteract || (() => {});
      this.onTap = opt.onTap || null;
      this.onMove = opt.onMove || null;
      this.onReset = opt.onReset || null;
      this.panLimit = 1;
      dom.style.touchAction = "pan-y";
      dom.tabIndex = 0;
      dom.addEventListener("pointerdown", (e) => this.down(e));
      dom.addEventListener("pointermove", (e) => this.move(e));
      dom.addEventListener("pointerup", (e) => this.up(e));
      dom.addEventListener("pointercancel", (e) => this.up(e, true));
      dom.addEventListener("pointerleave", (e) => { if (!this.ptrs.size && this.onMove) this.onMove(null, e); });
      dom.addEventListener("wheel", (e) => this.wheel(e), { passive: false });
      dom.addEventListener("dblclick", () => { if (this.onReset) this.onReset(); });
      dom.addEventListener("contextmenu", (e) => e.preventDefault());
      dom.addEventListener("keydown", (e) => this.key(e));
      dom.addEventListener("blur", () => { this.active = false; dom.classList.remove("is-active"); });
      this.apply();
    }
    setFree(on) { this.free = on; this.dom.style.touchAction = on ? "none" : "pan-y"; }
    apply() {
      const sp = Math.sin(this.phi), r = this.radius;
      this.cam.position.set(this.target.x + r * sp * Math.sin(this.theta), this.target.y + r * Math.cos(this.phi), this.target.z + r * sp * Math.cos(this.theta));
      this.cam.lookAt(this.target);
    }
    down(e) {
      this.dom.setPointerCapture(e.pointerId);
      this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button, shift: e.shiftKey });
      if (this.ptrs.size === 1) { this.moved = 0; this.downAt = performance.now(); this.vT = this.vP = 0; this.tween = null; }
      if (this.ptrs.size === 2) { this.pinch = this.dist(); }
      this.active = true; this.dom.classList.add("is-active");
      this.onInteract();
    }
    dist() { const a = [...this.ptrs.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1; }
    move(e) {
      const p = this.ptrs.get(e.pointerId);
      if (!p) { if (this.onMove && e.pointerType === "mouse") this.onMove(e); return; }
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      this.moved += Math.abs(dx) + Math.abs(dy);
      const H = Math.max(240, this.dom.clientHeight);
      if (this.ptrs.size === 1) {
        if (p.b === 2 || p.shift || e.shiftKey) this.pan(dx, dy);
        else {
          const dT = -dx / H * Math.PI * 1.25, dP = -dy / H * Math.PI * 0.95;
          this.theta += dT; this.phi = clamp(this.phi + dP, this.phiMin, this.phiMax);
          const dtm = Math.max(8, e.timeStamp - (p.t || e.timeStamp - 16)) / 1000;
          this.vT = lerp(this.vT, dT / dtm, 0.5); this.vP = lerp(this.vP, dP / dtm, 0.5);
        }
      } else if (this.ptrs.size === 2) {
        const o = [...this.ptrs.entries()].find(([id]) => id !== e.pointerId)[1];
        const prev = Math.hypot(p.x - o.x, p.y - o.y) || 1, now = Math.hypot(e.clientX - o.x, e.clientY - o.y) || 1;
        this.radius = clamp(this.radius * prev / now, this.min, this.max);
        this.pan(dx / 2, dy / 2);
      }
      p.x = e.clientX; p.y = e.clientY; p.t = e.timeStamp;
      this.apply(); this.stage.invalidate();
    }
    pan(dx, dy) {
      const k = this.radius * Math.tan(this.cam.fov * Math.PI / 360) * 2 / Math.max(240, this.dom.clientHeight);
      const right = new V3().setFromMatrixColumn(this.cam.matrix, 0), up = new V3().setFromMatrixColumn(this.cam.matrix, 1);
      this.target.addScaledVector(right, -dx * k).addScaledVector(up, dy * k);
      this.target.x = clamp(this.target.x, -this.panLimit, this.panLimit);
      this.target.z = clamp(this.target.z, -this.panLimit, this.panLimit);
      this.target.y = clamp(this.target.y, 0, this.panLimit);
    }
    up(e, cancel) {
      if (!this.ptrs.has(e.pointerId)) return;
      const single = this.ptrs.size === 1;
      this.ptrs.delete(e.pointerId);
      try { this.dom.releasePointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
      if (single && !cancel && this.moved < 6 && performance.now() - this.downAt < 450 && this.onTap) this.onTap(e);
      if (this.ptrs.size === 0) { if (cancel || this.moved < 6) { this.vT = this.vP = 0; } this.stage.invalidate(); }
    }
    wheel(e) {
      if (!(this.active || e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      this.zoomBy(Math.exp(e.deltaY * 0.0014));
      this.onInteract();
    }
    zoomBy(f) {
      this.radius = clamp(this.radius * f, this.min, this.max);
      this.apply(); this.stage.invalidate();
    }
    key(e) {
      const st = 0.12; let used = true;
      if (e.key === "ArrowLeft") this.theta -= st;
      else if (e.key === "ArrowRight") this.theta += st;
      else if (e.key === "ArrowUp") this.phi = clamp(this.phi - st, this.phiMin, this.phiMax);
      else if (e.key === "ArrowDown") this.phi = clamp(this.phi + st, this.phiMin, this.phiMax);
      else if (e.key === "+" || e.key === "=") this.zoomBy(0.88);
      else if (e.key === "-" || e.key === "_") this.zoomBy(1.14);
      else if (e.key === "Home" && this.onReset) this.onReset();
      else used = false;
      if (used) { e.preventDefault(); this.onInteract(); this.apply(); this.stage.invalidate(); }
    }
    flyTo(v, ms) {
      const from = { t: this.theta, p: this.phi, r: this.radius, x: this.target.x, y: this.target.y, z: this.target.z };
      let t1 = v.theta != null ? v.theta : from.t;
      // ambil jalur putar terpendek
      const d = ((t1 - from.t + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      t1 = from.t + d;
      this.tween = { from, to: { t: t1, p: v.phi != null ? v.phi : from.p, r: v.radius != null ? v.radius : from.r, x: v.x != null ? v.x : from.x, y: v.y != null ? v.y : from.y, z: v.z != null ? v.z : from.z }, t: 0, ms: ms || 800 };
      this.vT = this.vP = 0;
    }
    update(dt) {
      let ch = false;
      if (this.tween) {
        const tw = this.tween; tw.t += dt * 1000;
        const k = easeInOut(tw.t / tw.ms), a = tw.from, b = tw.to;
        this.theta = lerp(a.t, b.t, k); this.phi = lerp(a.p, b.p, k); this.radius = lerp(a.r, b.r, k);
        this.target.set(lerp(a.x, b.x, k), lerp(a.y, b.y, k), lerp(a.z, b.z, k));
        if (tw.t >= tw.ms) this.tween = null;
        ch = true;
      } else if (!this.ptrs.size) {
        if (Math.abs(this.vT) > 0.01 || Math.abs(this.vP) > 0.01) {
          this.theta += this.vT * dt; this.phi = clamp(this.phi + this.vP * dt, this.phiMin, this.phiMax);
          const f = Math.pow(0.04, dt); this.vT *= f; this.vP *= f; ch = true;
        }
        if (this.auto) { this.theta += this.auto * dt; ch = true; }
      }
      if (ch) this.apply();
      return ch;
    }
  }

  /* =========================================================
     Penampil kursi
     ========================================================= */
  function makeGeo(pd) {
    const n = pd.p.length / 3;
    const pos = new Float32Array(pd.p.length), nor = new Float32Array(pd.nr.length), uv = new Float32Array(n * 2);
    for (let i = 0; i < pos.length; i++) { pos[i] = pd.p[i] * 1e-4; nor[i] = pd.nr[i] / 127; }
    for (let i = 0; i < uv.length; i++) uv[i] = pd.uv[i] / 1000;
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.BufferAttribute(nor, 3));
    g.setAttribute("uv", new T.BufferAttribute(uv, 2));
    g.setIndex(new T.BufferAttribute(n > 65535 ? new Uint32Array(pd.i) : new Uint16Array(pd.i), 1));
    g.computeBoundingSphere();
    return g;
  }

  class KursiViewer {
    /* host: elemen penampung. opt: { model, autoRotate, onReady, onHover, onPick, onFrame } */
    constructor(host, opt) {
      this.opt = opt || {};
      this.host = host;
      this.stage = new Stage(host, { exposure: this.opt.exposure || 0.6, keep: this.opt.keep, shadows: this.opt.shadows });
      if (this.stage.failed) { this.failed = true; if (this.opt.onFail) this.opt.onFail(); return; }
      this.scene = this.stage.scene;
      this.meshes = [];
      this.groups = {};
      this.mode = "solid";
      this.layers = { kayu: true, anyam: true, bantal: true, lain: true };
      this.explode = 0;
      this.asm = null;
      this.acts = {};
      this.hoverMesh = null; this.focusSet = null; this.selected = null;
      this.world = new T.Group();
      this.scene.add(this.world);
      this.home = { theta: 0.62, phi: 1.2, k: 1 };
      this.orbit = new Orbit(this.stage.canvas, this.stage.camera, this.stage, {
        onInteract: () => { this.orbit.auto = 0; if (this.opt.onInteract) this.opt.onInteract(); },
        onTap: (e) => this.tap(e),
        onMove: (e) => this.hover(e),
        onReset: () => this.view("home")
      });
      this.stage.tickers.push((dt) => this.tick(dt));
      this.stage.onFrame = () => { if (this.opt.onFrame) this.opt.onFrame(this); };
      this.stage.onResize = () => { if (this.size) this.fit(true); };
      this.ray = new T.Raycaster();
      if (this.opt.model) this.load(this.opt.model);
    }

    async load(url) {
      let doc;
      try { const r = await fetch(url); doc = await r.json(); } catch (e) { if (this.opt.onFail) this.opt.onFail(e); return; }
      this.build(doc);
      this.fit(false);
      if (this.opt.autoRotate) this.orbit.auto = 0.22;
      this.stage.invalidate();
      if (this.opt.onReady) this.opt.onReady(this);
    }

    build(doc) {
      const all = new T.Box3();
      doc.groups.forEach((gd) => {
        const g = new T.Group();
        g.name = gd.id;
        g.position.set(gd.off[0], gd.off[1], gd.off[2]);
        g.userData = { id: gd.id, name: gd.name, base: g.position.clone(), act: new V3(), box: new T.Box3() };
        gd.parts.forEach((pd, idx) => {
          const geo = makeGeo(pd);
          const mat = baseMat(pd.m, this.stage.maxAniso).clone();
          const mesh = new T.Mesh(geo, mat);
          mesh.castShadow = true; mesh.receiveShadow = pd.cat !== "anyam";
          mesh.userData = { part: pd, gid: gd.id, idx, cat: pd.cat, ev: new V3(), act: new V3(), asm: 1, from: new V3(), park: new V3(), join: -1, jn: 1, stag: 0.28, fr: 0, vis: true, emis: 0 };
          mesh.name = pd.code + " " + pd.name;
          g.add(mesh); this.meshes.push(mesh);
          g.userData.box.expandByPoint(new V3(pd.bb[0], pd.bb[1], pd.bb[2]));
          g.userData.box.expandByPoint(new V3(pd.bb[3], pd.bb[4], pd.bb[5]));
        });
        this.groups[gd.id] = g;
        this.world.add(g);
        const b = g.userData.box.clone(); b.min.add(g.position); b.max.add(g.position);
        all.union(b);
        const ctr = g.userData.box.getCenter(new V3());
        g.userData.ctr = ctr;
        g.children.forEach((m) => m.userData.ev.copy(this.explodeVec(m.userData.part, new V3(m.userData.part.c[0], m.userData.part.c[1], m.userData.part.c[2]).sub(ctr))));
      });
      this.size = all.getSize(new V3());
      const c = all.getCenter(new V3());
      this.center = c;
      // kursi utama tepat di tengah panggung, dingklik atau ottoman ikut di sampingnya
      this.world.position.set(-c.x, 0, -c.z);
      this.radius = this.size.length() * 0.5 * 0.9;
      this.orbit.target.set(0, this.size.y * 0.42, 0);
      this.orbit.panLimit = Math.max(this.size.x, this.size.z);
      this.orbit.min = this.radius * 0.5; this.orbit.max = this.radius * 4.2;
      this.shadowFit();
    }

    shadowFit() {
      const s = Math.max(this.size.x, this.size.z) * 0.95 + 0.25;
      const sc = this.stage.key.shadow.camera;
      sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s; sc.updateProjectionMatrix();
      this.stage.pool.scale.setScalar(Math.max(0.9, s / 1.1));
    }

    explodeVec(p, v) {
      if (p.cat === "bantal") return new V3(v.x * 0.45, 0.5 + Math.abs(v.y) * 0.2, v.z * 0.3);
      if (p.m === "felt") return new V3(v.x * 0.5, -0.17, v.z * 0.5);
      if (p.m === "cekungan") return new V3(0, 0.2, 0);
      const d = new V3(v.x * 1.25, v.y * 0.95, v.z * 1.05);
      const len = d.length() || 1;
      return d.multiplyScalar((0.14 + Math.min(len, 0.75) * 0.5) / len);
    }

    fit(keepAngles) {
      const o = this.orbit;
      const r = this.stage.fitRadius(this.radius) * 1.02;
      this.home.r = r;
      if (!keepAngles) { o.theta = this.home.theta; o.phi = this.home.phi; o.radius = r; o.target.set(0, this.size.y * 0.42, 0); }
      else if (!this.userMoved) { o.radius = r; }
      o.max = r * 2.4; o.min = r * 0.32;
      o.apply(); this.stage.invalidate();
    }

    /* ----- kamera ----- */
    view(name, ms) {
      const o = this.orbit, r = this.home.r * this.exZoom(), y = this.size.y * 0.42;
      const P = {
        home: { theta: this.home.theta, phi: this.home.phi, radius: r, x: 0, y, z: 0 },
        depan: { theta: 0, phi: 1.43, radius: r * 1.02, x: 0, y, z: 0 },
        samping: { theta: Math.PI / 2, phi: 1.43, radius: r * 1.02, x: 0, y, z: 0 },
        belakang: { theta: Math.PI, phi: 1.38, radius: r * 1.02, x: 0, y, z: 0 },
        atas: { theta: 0, phi: 0.07, radius: r * 1.05, x: 0, y: 0, z: 0 },
        serong: { theta: -0.75, phi: 1.1, radius: r, x: 0, y, z: 0 }
      };
      const v = P[name]; if (!v) return;
      o.auto = 0; o.flyTo(v, ms || 850); this.userMoved = true; this.stage.invalidate();
    }
    flyToPart(mesh, ms) {
      const w = this.partWorld(mesh);
      this.orbit.auto = 0;
      this.orbit.flyTo({ x: w.x, y: w.y, z: w.z, radius: Math.max(this.orbit.min * 1.1, this.home.r * 0.5) }, ms || 900);
      this.userMoved = true; this.stage.invalidate();
    }
    partWorld(mesh) {
      const p = mesh.userData.part, g = this.groups[mesh.userData.gid];
      return new V3(p.c[0], p.c[1], p.c[2]).add(mesh.position).add(g.position).add(this.world.position);
    }
    setAuto(on) { this.orbit.auto = on ? 0.22 : 0; this.stage.invalidate(); }
    zoom(f) { this.orbit.zoomBy(f); this.userMoved = true; }

    /* ----- pencarian bagian ----- */
    byCode(code, side, re) {
      const rx = re ? new RegExp(re, "i") : null;
      return this.meshes.filter((m) => partMatch(m, code, side, rx));
    }

    /* ----- mode tampilan ----- */
    setMode(mode) {
      this.mode = mode;
      this.meshes.forEach((m) => this.styleMesh(m));
      this.stage.invalidate();
    }
    edgesOf(m) {
      if (m.userData.edges) return m.userData.edges;
      const e = new T.LineSegments(new T.EdgesGeometry(m.geometry, 24), new T.LineBasicMaterial({ color: CAT_EDGE[m.userData.cat] || 0xffffff, transparent: true, opacity: 0.8 }));
      e.visible = false; e.renderOrder = 2;
      m.add(e); m.userData.edges = e; return e;
    }
    styleMesh(m) {
      const u = m.userData, mat = m.material, mode = this.mode;
      const ghost = this.asm && u.asm < 0.001;
      const focusDim = this.focusSet && !this.focusSet.has(m);
      mat.colorWrite = true; mat.polygonOffset = false;
      let op = 1, tr = false, dw = true, edges = false, eo = 0.8, cast = true;
      if (mode === "xray") { op = 0.13; tr = true; dw = false; edges = true; eo = 0.85; cast = false; }
      else if (mode === "lines") { mat.colorWrite = false; mat.polygonOffset = true; mat.polygonOffsetFactor = 1; mat.polygonOffsetUnits = 1; edges = true; eo = 0.95; cast = false; }
      if (focusDim) { op = Math.min(op, 0.1); tr = true; dw = false; eo = 0.18; }
      if (this.asm && u.asm < 1 && u.asm > 0.001) { tr = true; op = Math.min(op, 0.15 + 0.85 * clamp(u.asm * 1.6, 0, 1)); }
      mat.transparent = tr; mat.opacity = op; mat.depthWrite = dw;
      m.castShadow = cast && !ghost;
      mat.visible = !ghost;
      if (ghost) { edges = true; eo = 0.2; }
      if (edges) { const e = this.edgesOf(m); e.visible = true; e.material.opacity = eo; }
      else if (u.edges) u.edges.visible = false;
      const emis = u.emis || 0;
      if (mat.emissive) { mat.emissive.setRGB(1, 0.62, 0.22); mat.emissiveIntensity = emis; }
      m.visible = u.vis && this.layers[u.cat] !== false;
      mat.needsUpdate = false;
    }
    refreshAll() { this.meshes.forEach((m) => this.styleMesh(m)); this.stage.invalidate(); }
    setLayer(cat, on) { this.layers[cat] = on; this.refreshAll(); }
    setGroupVisible(id, on) {
      const g = this.groups[id]; if (!g) return;
      g.children.forEach((m) => { m.userData.vis = on; });
      this.refreshAll();
    }

    /* ----- bongkar ----- */
    exZoom(k) { return 1 + 0.5 * easeInOut(clamp(k == null ? this.explode : k, 0, 1)); }
    setExplode(k) {
      const before = this.exZoom();
      this.explode = clamp(k, 0, 1);
      this.applyOffsets();
      /* kamera ikut mundur saat dibongkar supaya semua bagian tetap terlihat, dan kembali saat dirapatkan */
      const o = this.orbit, f = this.exZoom() / before;
      if (o && f !== 1 && !this.asm) { o.radius = clamp(o.radius * f, o.min, o.max); o.apply(); }
    }
    applyOffsets() {
      const e = easeInOut(this.explode);
      Object.values(this.groups).forEach((g) => { g.position.copy(g.userData.base).addScaledVector(g.userData.act, 1); });
      this.meshes.forEach((m) => {
        const u = m.userData;
        m.position.copy(u.ev).multiplyScalar(e).add(u.act);
        if (this.asm && u.asm < 1) m.position.addScaledVector(u.from, 1 - easeOut(u.asm));
        if (this.asm && u.join >= 0 && u.jn < 1) m.position.addScaledVector(u.park, 1 - easeInOut(u.jn));
      });
      this.stage.invalidate();
    }

    /* ----- highlight dan fokus ----- */
    focus(meshes) {
      this.focusSet = meshes && meshes.length ? new Set(meshes) : null;
      this.meshes.forEach((m) => { m.userData.emis = this.focusSet && this.focusSet.has(m) ? 0.42 : 0; this.styleMesh(m); });
      this.stage.invalidate();
    }
    hover(e) {
      if (this.opt.noPick) return;
      if (!e) { if (this.hoverMesh) { this.hoverMesh = null; if (this.opt.onHover) this.opt.onHover(null); } return; }
      const now = performance.now();
      if (this._ht && now - this._ht < 50) return;
      this._ht = now;
      const m = this.pick(e);
      if (m !== this.hoverMesh) {
        this.hoverMesh = m;
        this.stage.canvas.style.cursor = m ? "pointer" : "grab";
        if (!this.selected) this.focus(m ? this.siblings(m) : null);
        if (this.opt.onHover) this.opt.onHover(m, e);
      } else if (m && this.opt.onHover) this.opt.onHover(m, e);
    }
    siblings(m) { return this.meshes.filter((x) => x.userData.part.code === m.userData.part.code && x.userData.gid === m.userData.gid); }
    tap(e) {
      if (this.opt.noPick) return;
      const m = this.pick(e);
      this.select(m, e);
    }
    select(m, e) {
      this.selected = m || null;
      this.focus(m ? this.siblings(m) : null);
      if (this.opt.onPick) this.opt.onPick(m, e);
    }
    pick(e) {
      const r = this.stage.canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1, y = -((e.clientY - r.top) / r.height) * 2 + 1;
      this.ray.setFromCamera({ x, y }, this.stage.camera);
      const list = this.meshes.filter((m) => m.visible && m.material.visible);
      const hit = this.ray.intersectObjects(list, false);
      for (const h of hit) {
        const mat = h.object.material;
        if (mat.alphaTest && h.uv && mat.map && mat.map.image) {
          // lubang anyaman tidak ikut terpilih
          const img = mat.map.image, cv = this._pc || (this._pc = document.createElement("canvas"));
          cv.width = cv.height = 1; const cx = cv.getContext("2d", { willReadFrequently: true });
          const u = ((h.uv.x % 1) + 1) % 1, v = ((h.uv.y % 1) + 1) % 1;
          try { cx.clearRect(0, 0, 1, 1); cx.drawImage(img, u * img.width - 0.5, (1 - v) * img.height - 0.5, 1, 1, 0, 0, 1, 1); if (cx.getImageData(0, 0, 1, 1).data[3] < 110) continue; } catch (err) { /* tetap terpilih */ }
        }
        return h.object;
      }
      return null;
    }
    project(v) {
      const p = v.clone().project(this.stage.camera);
      const w = this.stage.w, h = this.stage.h;
      return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h, z: p.z };
    }
    anchor(code, side, re) {
      const ms = this.byCode(code, side, re); if (!ms.length) return null;
      const v = new V3(); ms.forEach((m) => v.add(this.partWorld(m)));
      return v.multiplyScalar(1 / ms.length);
    }

    /* ----- gerak fungsi kursi ----- */
    /* def: { id, group?, codes?: [kode], move: [x,y,z] meter, ms } */
    defineAction(def) { this.acts[def.id] = { def, k: 0, to: 0 }; }
    setAction(id, on) {
      const a = this.acts[id]; if (!a) return;
      a.to = on ? 1 : 0; this.stage.invalidate();
    }
    actionOn(id) { return !!(this.acts[id] && this.acts[id].to); }
    stepActions(dt) {
      let ch = false;
      Object.values(this.acts).forEach((a) => {
        if (Math.abs(a.k - a.to) < 0.0005) { if (a.k !== a.to) { a.k = a.to; this.applyAct(a); ch = true; } return; }
        const sp = dt / ((a.def.ms || 900) / 1000);
        a.k = a.k < a.to ? Math.min(a.to, a.k + sp) : Math.max(a.to, a.k - sp);
        this.applyAct(a); ch = true;
      });
      return ch;
    }
    applyAct() {
      // gabungkan semua aksi: per kelompok dan per bagian
      this.meshes.forEach((m) => m.userData.act.set(0, 0, 0));
      Object.values(this.groups).forEach((g) => g.userData.act.set(0, 0, 0));
      Object.values(this.acts).forEach((b) => {
        const d = b.def, k = easeInOut(b.k);
        if (!k) return;
        const mv = new V3(d.move[0], d.move[1], d.move[2]).multiplyScalar(k);
        if (d.group) { const g = this.groups[d.group]; if (g) g.userData.act.add(mv); return; }
        const codes = new Set(d.codes), rx = d.re ? new RegExp(d.re, "i") : null;
        this.meshes.forEach((m) => { if (codes.has(m.userData.part.code) && partMatch(m, null, d.side, rx)) m.userData.act.add(mv); });
      });
      this.applyOffsets();
    }

    /* ----- animasi rakit ----- */
    /* steps: [{ parts: [kode | {code, side, re}], from: 'kiri|kanan|atas|bawah|depan|belakang|sisi|auto',
                 park?: [x,y,z] (bagian dirakit melayang di sini lalu dipindah oleh langkah join),
                 join?: nomor langkah (mulai 0) yang bagiannya dipindahkan ke tempat akhir oleh langkah ini,
                 stag?: sebaran waktu masuk antar bagian }] */
    setupAssembly(steps) {
      this.steps = steps || [];
      const FROM = { kiri: [-0.55, 0, 0], kanan: [0.55, 0, 0], atas: [0, 0.6, 0], bawah: [0, -0.3, 0], depan: [0, 0, 0.6], belakang: [0, 0, -0.6] };
      this.meshes.forEach((m) => { const u = m.userData; u.step = -1; u.join = -1; u.jn = 1; u.park.set(0, 0, 0); u.fr = 0; });
      this.steps.forEach((s, si) => {
        s._list = [];
        (s.parts || []).forEach((pr) => {
          const code = typeof pr === "string" ? pr : pr.code, side = typeof pr === "string" ? null : pr.side;
          const rx = typeof pr === "string" || !pr.re ? null : new RegExp(pr.re, "i");
          this.meshes.forEach((m) => {
            const u = m.userData;
            if (u.step >= 0 || !partMatch(m, code, side, rx)) return;
            const nm = u.part.name.toLowerCase();
            u.step = si; s._list.push(m);
            let f = s.from;
            if (!f || f === "auto") f = nm.indexOf("kiri") >= 0 ? "kiri" : nm.indexOf("kanan") >= 0 ? "kanan" : u.cat === "bantal" || u.cat === "anyam" ? "atas" : u.part.m === "felt" ? "bawah" : "atas";
            if (s.from === "sisi") f = nm.indexOf("kiri") >= 0 ? "kiri" : nm.indexOf("kanan") >= 0 ? "kanan" : "atas";
            const fv = FROM[f] || FROM.atas;
            u.from.set(fv[0], fv[1], fv[2]);
          });
        });
        const n = s._list.length;
        s._list.forEach((m, i) => { m.userData.stag = s.stag != null ? s.stag : 0.28; m.userData.fr = n > 1 ? i / (n - 1) : 0; if (s.park) m.userData.park.set(s.park[0], s.park[1], s.park[2]); });
      });
      this.steps.forEach((s, si) => {
        if (s.join != null && this.steps[s.join]) this.steps[s.join]._list.forEach((m) => { m.userData.join = si; });
      });
      this.asmTotal = this.steps.length;
    }
    /* t = posisi waktu dalam satuan langkah (0 sampai jumlah langkah). null = matikan animasi rakit */
    setAssemblyTime(t) {
      if (t == null) {
        this.asm = null;
        this.meshes.forEach((m) => { m.userData.asm = 1; m.userData.jn = 1; });
        this.refreshAll(); this.applyOffsets(); return;
      }
      this.asm = { t };
      const per = 0.7;  // lama satu bagian masuk, dalam satuan langkah
      this.meshes.forEach((m) => {
        const u = m.userData;
        if (u.step < 0) { u.asm = 1; u.jn = 1; return; }
        u.asm = clamp((t - u.step - u.stag * u.fr) / per, 0, 1);
        u.jn = u.join >= 0 ? clamp((t - u.join - 0.04) / per, 0, 1) : 1;
        const flying = u.asm > 0 && u.asm < 1, joining = u.join >= 0 && u.jn > 0 && u.jn < 1;
        u.emis = flying ? 0.5 * (1 - u.asm) : joining ? 0.5 * (1 - u.jn) : (this.focusSet && this.focusSet.has(m) ? 0.42 : 0);
      });
      this.meshes.forEach((m) => this.styleMesh(m));
      this.applyOffsets();
    }
    playAssembly(from, speed, onEnd) {
      this._play = { t: from || 0, speed: speed || 0.62, onEnd };
      this.orbit.auto = 0.14;
      this.stage.invalidate();
    }
    pauseAssembly() { this._play = null; }
    get playing() { return !!this._play; }
    tick(dt) {
      let ch = this.orbit.update(dt);
      if (this.stepActions(dt)) ch = true;
      if (this._play) {
        const p = this._play;
        p.t += dt * p.speed;
        const end = this.asmTotal + 0.35;
        if (this.opt.onAssemblyTime) this.opt.onAssemblyTime(Math.min(p.t, this.asmTotal));
        this.setAssemblyTime(Math.min(p.t, this.asmTotal + 0.3));
        if (p.t >= end) { const cb = p.onEnd; this._play = null; if (cb) cb(); }
        ch = true;
      }
      return ch;
    }

    snapshot(w, h) {
      const s = this.stage, r = s.renderer;
      const ow = s.w, oh = s.h;
      r.setPixelRatio(1); r.setSize(w, h, false);
      s.camera.aspect = w / h; s.camera.updateProjectionMatrix();
      this.orbit.apply();
      r.render(s.scene, s.camera);
      const url = s.canvas.toDataURL("image/png");
      s.resize();
      return url;
    }

    dispose() { if (this.stage) this.stage.dispose(); }
  }

  KursiViewer.core = { Stage, Orbit, loadTex, baseMat, makeEnv, easeOut, easeInOut, clamp, lerp, CAT_LABEL, CAT_EDGE };
  window.KursiViewer = KursiViewer;
})();
