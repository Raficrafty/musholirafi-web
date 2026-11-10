/* =========================================================
   MESIN WEBSITE musholirafi.com
   Isi website (produk, harga, edisi musim, kontak) diubah di assets/js/data.js.
   File ini biasanya tidak perlu disentuh.
   ========================================================= */
(function () {
  "use strict";

  const r1 = (n) => Math.round(n * 10) / 10;

  /* ---------------------------------------------------------
     2. Alat bantu
     --------------------------------------------------------- */
  const S = window.SITE || {};
  const here = location.pathname + location.search;
  if (S.maintenance && !/pratinjau/.test(here) && !/maintenance\.html/.test(here)) {
    const src = (document.currentScript && document.currentScript.src) || "";
    location.replace(src ? src.replace(/assets\/js\/main\.js.*$/, "maintenance.html") : "maintenance.html");
    return;
  }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rupiah = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");
  const pad = (x) => String(x).padStart(2, "0");
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const store = {
    get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  };
  const sess = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* abaikan */ } }
  };
  const root = document.documentElement;
  /* Animasi selalu penuh untuk semua pengunjung, juga kalau perangkat meminta gerak dikurangi. Kelas calm dari <head> dibuang. */
  root.classList.remove("calm");
  const reduce = false;
  const isDraft = !!S.draft;
  const nick = S.nickname || "Rafi";
  const greet = S.waGreeting || `Halo ${S.name || nick}`; // salam pembuka pesan WhatsApp
  const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const isActive = (until) => !until || String(until) >= todayStr();
  const fmtDate = (s) => { try { return new Date(s + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" }); } catch (e) { return s; } };
  const initials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  /* Ikon */
  const IC = {
    linkedin: ["f", '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4z"/>'],
    substack: ["f", '<path d="M4 3.5h16v2.6H4zM4 8.4h16V11H4zM4 13.3h16v8.2l-8-4.4-8 4.4z"/>'],
    lynk: ["s", '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'],
    instagram: ["s", '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>'],
    tiktok: ["f", '<path d="M16.5 3c.3 2.2 1.7 3.8 4 4v3.2c-1.5 0-2.9-.4-4-1.2v6.3A5.7 5.7 0 1 1 10.8 9.6v3.3a2.5 2.5 0 1 0 2.4 2.5V3h3.3Z"/>'],
    youtube: ["f", '<path fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3Z"/>'],
    discord: ["f", '<path d="M19.3 5.3A16.5 16.5 0 0 0 15.2 4l-.5 1a15 15 0 0 0-5.4 0l-.5-1a16.5 16.5 0 0 0-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a16.6 16.6 0 0 0 5 2.6l1.1-1.7c-.6-.2-1.2-.5-1.7-.9l.4-.3a11.8 11.8 0 0 0 10.2 0l.4.3c-.5.4-1.1.7-1.7.9l1.1 1.7a16.6 16.6 0 0 0 5-2.6c.4-4.3-.6-8-2.4-11.4ZM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/>'],
    x: ["f", '<path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8Zm-1.1 16.2h1.7L7.4 4.7H5.6Z"/>'],
    facebook: ["f", '<path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3A22 22 0 0 0 14.6 2C12.2 2 10.6 3.5 10.6 6.1v2.4H8v3.6h2.6V22H14v-9.9h2.7l.4-3.6Z"/>'],
    whatsapp: ["f", '<path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.2-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/>'],
    email: ["s", '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'],
    gift: ["s", '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3.5-6-4-6-1.5S9.5 8 12 8Zm0 0c1.5-3.5 6-4 6-1.5S14.5 8 12 8Z"/>'],
    calendar: ["s", '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/>'],
    tag: ["s", '<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8Z"/><circle cx="8.5" cy="8.5" r="1.5"/>'],
    rain: ["s", '<path d="M7 15a4 4 0 0 1-.6-8A5.5 5.5 0 0 1 17 6.5 4 4 0 0 1 17 15H7Z"/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/>'],
    sun: ["s", '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'],
    leaf: ["s", '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/>'],
    snow: ["s", '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>'],
    moon: ["s", '<path d="M19 15.5A8 8 0 0 1 8.5 5a8 8 0 1 0 10.5 10.5Z"/><path d="M17 3.5v3M15.5 5h3"/>'],
    star: ["s", '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6-4.5-4.1 6-.7Z"/>'],
    flag: ["s", '<path d="M5 21V4"/><path d="M5 4h13l-2.5 4L18 12H5"/>'],
    spark: ["s", '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'],
    star5: ["f", '<path d="m12 2.5 2.9 6 6.6.8-4.9 4.6 1.2 6.6L12 17.3l-5.8 3.2 1.2-6.6-4.9-4.6 6.6-.8Z"/>']
  };
  function icon(name, cls) {
    const d = IC[name] || IC.spark;
    const attrs = d[0] === "f" ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    return `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" ${attrs} aria-hidden="true">${d[1]}</svg>`;
  }

  /* Gambar sampul buku dan thumbnail karya */
  const ART = {
    ruler: '<rect x="6" y="20" width="88" height="18" rx="2"/><path d="M16 20v7M26 20v10M36 20v7M46 20v10M56 20v7M66 20v10M76 20v7M86 20v10"/>',
    chat: '<path d="M8 8h50v24H30l-12 9v-9H8Z"/><path d="M42 22h50v22h-8v8l-10-8H42" opacity=".7"/>',
    cube: '<path d="M50 4 24 17v22l26 13 26-13V17Z"/><path d="M24 17l26 13 26-13M50 30v22"/>',
    chair: '<path d="M38 4v28M38 32h28v6H34v-6M38 38v14M62 38v14M34 46h32"/>',
    plan: '<path d="M8 6h84v42H8ZM8 26h34v22M42 6v10M58 26h34M58 26v8"/>',
    lines: '<path d="M14 12h72M14 22h72M14 32h72M14 42h46"/>',
    grid: '<path d="M10 6h80v42H10ZM10 20h80M10 34h80M37 6v42M63 6v42"/>'
  };
  const art = (k) => `<svg class="f-art" viewBox="0 0 100 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ART[k] || ART.lines}</svg>`;
  const THUMB = {
    chair: '<svg viewBox="0 0 160 120" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M58 18v54M58 72h48v8H52v-8M58 80v26M100 80v26M52 94h52"/><path d="M30 106h104" opacity=".5"/><path d="M128 72v34M124 72h8M124 106h8" opacity=".6"/><text x="134" y="92" font-size="9" fill="currentColor" stroke="none" font-family="monospace">45</text></svg>',
    plan: '<svg viewBox="0 0 160 120" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M24 18h112v84H24Z"/><path d="M24 62h48v40M72 18v22M96 62h40" opacity=".8"/><rect x="34" y="70" width="28" height="18" rx="2" opacity=".6"/><path d="M104 28h24v20h-24Z" opacity=".6"/><path d="M72 40a22 22 0 0 1 22 22" stroke-dasharray="3 4"/></svg>',
    board: '<svg viewBox="0 0 160 120" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="18" y="20" width="124" height="80" rx="4"/><rect x="28" y="30" width="54" height="40" rx="2" opacity=".7"/><path d="M92 32h40M92 42h32M92 52h36M28 82h60M28 90h40"/><circle cx="118" cy="80" r="10" opacity=".7"/></svg>',
    book: '<svg viewBox="0 0 160 120" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M44 22h64a6 6 0 0 1 6 6v70H50a6 6 0 0 1-6-6Z"/><path d="M44 92a6 6 0 0 1 6-6h64M58 40h40M58 50h30"/><path d="M60 66h36" opacity=".6"/></svg>'
  };

  /* WhatsApp dan Discord */
  const waNumber = () => String((S.contact && S.contact.whatsapp) || "").replace(/\D/g, "");
  const waLink = (text) => `https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`;
  const normPhone = (raw) => {
    let d = String(raw || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = "62" + d.slice(1);
    else if (d.startsWith("8")) d = "62" + d;
    return /^628\d{7,12}$/.test(d) ? d : null;
  };
  const discordInvite = () => (S.links && S.links.discordInvite) || ((S.socials || []).find((s) => s.icon === "discord" && s.url) || {}).url || "";
  const discordHref = () => discordInvite() || waLink(`${greet}, aku mau gabung server Discord-mu.`);
  const discordBtn = (cls, label) => `<a class="${cls}" href="${esc(discordHref())}" target="_blank" rel="noopener">${icon("discord")}${esc(discordInvite() ? label : "Minta undangan Discord")}</a>`;

  /* Toast */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ---------------------------------------------------------
     3. Tema, header, menu, progres
     --------------------------------------------------------- */
  const themeBtn = $("#theme-toggle");
  const currentTheme = () => root.getAttribute("data-theme") || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function syncTheme() {
    if (!themeBtn) return;
    const dark = currentTheme() === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.setAttribute("aria-label", dark ? "Ganti ke mode terang" : "Ganti ke mode gelap");
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      const apply = () => {
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("mr-theme", next); } catch (e) { /* abaikan */ }
        syncTheme();
      };
      if (reduce || !document.startViewTransition) {
        root.classList.add("theme-fade"); apply();
        setTimeout(() => root.classList.remove("theme-fade"), 600);
        return;
      }
      /* Lingkaran tema baru melebar dari tombol */
      const r = themeBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(apply).ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 750, easing: "cubic-bezier(.22,.8,.24,1)", pseudoElement: "::view-transition-new(root)" });
      }).catch(() => { /* abaikan */ });
    });
    syncTheme();
  }

  const header = $(".site-header"), bar = $("#progress-bar"), toTop = $("#to-top"), ttRing = $("#to-top-ring");
  const scrollFns = [];
  let ticking = false;
  function runScroll() { ticking = false; scrollFns.forEach((f) => f()); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  scrollFns.push(() => {
    const y = scrollY, h = root.scrollHeight - innerHeight, p = h > 0 ? clamp(y / h) : 0;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (toTop) { toTop.classList.toggle("show", y > innerHeight * 0.9); if (ttRing) ttRing.style.strokeDashoffset = String(1 - p); }
  });
  if (toTop) toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  const nav = $("#nav"), menuBtn = $("#menu-btn");
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle("open", open);
    if (header) header.classList.toggle("menu-open", open);
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu"); }
  }
  if (menuBtn && nav) menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  if (nav) nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav && nav.classList.contains("open")) { setMenu(false); if (menuBtn) menuBtn.focus(); } });

  /* Penanda menu yang bergeser halus (layar lebar) */
  const pill = $(".nav-pill");
  let pillTarget = null;
  function movePill(a) {
    if (!pill) return;
    if (!a || innerWidth <= 960) { pill.style.opacity = "0"; return; }
    pill.style.opacity = "1";
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  if (nav && pill) {
    $$("a", nav).forEach((a) => a.addEventListener("pointerenter", () => movePill(a)));
    nav.addEventListener("pointerleave", () => movePill(pillTarget));
    addEventListener("resize", () => movePill(pillTarget));
  }

  /* Penanda bagian saat scroll, hanya kalau menu berisi tautan #bagian di halaman yang sama */
  if (nav && "IntersectionObserver" in window && $$('a[href^="#"]', nav).length) {
    const links = $$('a[href^="#"]', nav), map = new Map();
    links.forEach((a) => { const sec = document.getElementById(a.getAttribute("href").slice(1)); if (sec) map.set(sec, a); });
    const navIO = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.removeAttribute("aria-current"));
      const a = map.get(en.target);
      if (a) a.setAttribute("aria-current", "true");
      pillTarget = a || null; movePill(pillTarget);
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id], main > div.found").forEach((sec) => navIO.observe(sec));
  }
  /* Menu halaman yang sedang dibuka */
  const curPage = nav && $('a[aria-current="page"]', nav);
  if (curPage) { pillTarget = curPage; requestAnimationFrame(() => movePill(curPage)); }

  /* Website dibagi per halaman. Tautan #bagian (misal dari data.js) yang bagiannya ada di halaman lain dibuka di halaman itu.
     Menambah bagian baru yang dirujuk dari halaman lain: tambahkan id dan halamannya di sini. */
  const PAGE_OF = {"atur-finansial":"belajar.html#atur-finansial","bantu":"belajar.html","belajar":"belajar.html#belajar","belajar-ai":"belajar.html#belajar-ai","belajar-efektif":"belajar.html#belajar-efektif","beranda":"./","bimbel":"bimbel.html","buku":"toko.html#buku","cara-pesan":"toko.html#cara-pesan","cocok":"toko.html#cocok","catatan-singkat":"belajar.html#catatan-singkat","edisi":"./#edisi","faq":"toko.html#faq","ilmu":"tentang.html#ilmu","jasa-website":"jasa-website.html","paket-website":"jasa-website.html#paket-website","karya":"karya.html","maba":"toko.html#maba","mini-kritis":"belajar.html#mini-kritis","mini-tujuan":"belajar.html#mini-tujuan","mulai":"./#mulai","newsletter":"./#newsletter","posisi":"belajar.html#posisi","sekarang":"tentang.html#sekarang","tentang":"tentang.html","testimoni":"bimbel.html#testimoni","toko":"toko.html#toko","tools":"tentang.html#tools","works":"karya.html#works"};
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute("href").slice(1);
    if (!id || document.getElementById(id) || !PAGE_OF[id]) return;
    e.preventDefault();
    location.href = PAGE_OF[id];
  });

  /* ---------------------------------------------------------
     4. Muncul saat di-scroll
     --------------------------------------------------------- */
  const inCallbacks = new WeakMap();
  const hasIO = "IntersectionObserver" in window;
  const revealIO = hasIO ? new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add(el.classList.contains("squig") ? "drawn" : "is-in");
    const fns = inCallbacks.get(el);
    if (fns) { fns.forEach((f) => f(el)); inCallbacks.delete(el); }
    revealIO.unobserve(el);
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;
  function watch(el) {
    if (!el) return;
    if (revealIO) revealIO.observe(el);
    else { el.classList.add(el.classList.contains("squig") ? "drawn" : "is-in"); const fns = inCallbacks.get(el); if (fns) fns.forEach((f) => f(el)); }
  }
  function whenIn(el, fn) {
    if (!el) return;
    if (el.classList.contains("is-in")) { fn(el); return; }
    const list = inCallbacks.get(el) || [];
    list.push(fn); inCallbacks.set(el, list);
    watch(el);
  }
  function observeAll(scope = document) {
    $$("[data-stagger]", scope).forEach((box) => Array.from(box.children).forEach((ch, i) => {
      if (!ch.hasAttribute("data-reveal")) ch.setAttribute("data-reveal", "");
      ch.style.setProperty("--i", i % 8);
    }));
    $$("[data-reveal]:not(.is-in), .squig:not(.drawn), .guide:not(.is-in)", scope).forEach(watch);
  }

  /* ---------------------------------------------------------
     5. Katalog, harga, diskon, edisi musim
     --------------------------------------------------------- */
  const products = S.products || [];
  const programs = (S.programs || []).map((p) => Object.assign({ cat: "bimbel" }, p));
  const catalog = {};
  products.forEach((p) => { catalog[p.id] = p; });
  programs.forEach((p) => { catalog[p.id] = p; });
  const catLabel = (c) => (S.categories && S.categories[c]) || (c === "bimbel" ? "Bimbel" : c);
  const catsText = (cats) => {
    const n = (cats || []).map((c) => catLabel(c).toLowerCase());
    if (n.length < 2) return (n[0] || "produk") ;
    return n.slice(0, -1).join(", ") + " dan " + n[n.length - 1];
  };
  const SEASON_ICON = { hujan: "rain", kemarau: "sun", gugur: "leaf", salju: "snow", ramadan: "moon", idulfitri: "moon", iduladha: "star", kemerdekaan: "flag" };

  function resolveSeason() {
    const seasons = S.seasons || {};
    const keys = Object.keys(seasons);
    if (!keys.length) return "";
    let q = null;
    try { q = new URLSearchParams(location.search).get("edisi"); } catch (e) { /* abaikan */ }
    if (q && seasons[q]) return q;
    const pv = sess.get("mr-season-preview");
    if (pv && seasons[pv]) return pv;
    if (S.season && S.season !== "auto" && seasons[S.season]) return S.season;
    const t = todayStr();
    const ev = (S.events || []).find((e) => e.start <= t && t <= e.end && seasons[e.season]);
    if (ev) return ev.season;
    const m = new Date().getMonth() + 1;
    return keys.find((k) => (seasons[k].months || []).includes(m)) || keys[0];
  }
  let seasonKey = resolveSeason();
  let season = (S.seasons || {})[seasonKey] || {};

  function discountFor(p) {
    if (!p || !p.price || p.soon) return null;
    let best = null;
    if (p.discount && p.discount.percent > 0 && isActive(p.discount.until)) best = { percent: p.discount.percent, until: p.discount.until, season: false };
    const sd = season.discount;
    if (sd && sd.percent > 0 && isActive(sd.until) && (sd.cats || []).includes(p.cat) && (!best || sd.percent > best.percent)) best = { percent: sd.percent, until: sd.until, season: true };
    return best;
  }
  function priceOf(p) {
    const d = discountFor(p);
    return d ? Math.round((p.price * (100 - d.percent)) / 100 / 100) * 100 : (p.price || 0);
  }
  function dealText(d) {
    if (!d) return "";
    return d.season ? `Diskon ${(season.label || "edisi").toLowerCase()} sampai ${fmtDate(d.until)}` : `Diskon ${d.percent}% sampai ${fmtDate(d.until)}`;
  }
  function countdownText(until) {
    const ms = new Date(until + "T23:59:59") - new Date();
    if (!(ms > 0)) return "Sudah berakhir";
    const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
    if (d >= 2) return `Berakhir dalam ${d} hari, sampai ${fmtDate(until)}`;
    if (d === 1) return `Berakhir dalam 1 hari ${h} jam`;
    return `Berakhir dalam ${h} jam ${m} menit`;
  }
  function tickCountdowns() { $$("[data-until]").forEach((el) => { el.textContent = countdownText(el.dataset.until); }); }
  setInterval(tickCountdowns, 30000);

  function freeHref(p) {
    if (p.free && p.free.via === "link" && p.free.url) return p.free.url;
    return waLink(`${greet}, aku mau ambil "${p.title}" yang gratis. Namaku `);
  }
  const freeButton = (p, cls, label) => `<a class="${cls}" href="${esc(freeHref(p))}" target="_blank" rel="noopener">${esc(label)}</a>`;

  function renderSeason() {
    if (seasonKey) root.setAttribute("data-season", seasonKey);
    const fb = season.freebie && catalog[season.freebie];
    const dc = season.discount && season.discount.percent > 0 && isActive(season.discount.until) ? season.discount : null;
    const ev = season.event;
    const perks = [];
    if (fb) perks.push("materi gratis");
    if (ev) perks.push("kelas bareng");
    if (dc) perks.push(`diskon ${dc.percent}%`);
    const pill = $("#season-pill");
    if (pill && season.label) {
      pill.innerHTML = `<span class="sp-icon">${icon(SEASON_ICON[seasonKey])}</span><span>${esc(season.label)}${perks.length ? ": " + esc(perks.join(", ")) : ""}</span><span class="arr" aria-hidden="true">→</span>`;
      pill.hidden = false;
    }
    const box = $("#fs-inner");
    if (!box) return;
    if (!season.label) { const c = box.closest(".feature-season"); if (c) c.hidden = true; return; }
    const items = [];
    if (fb) items.push(`<div class="fs-item"><span class="ic">${icon("gift")}</span><div><b>Gratis: ${esc(fb.title)}</b><span>${esc(fb.format)}. ${fb.free && fb.free.via === "link" ? "Langsung unduh, tanpa daftar." : "Tinggal minta lewat WhatsApp."}</span></div></div>`);
    if (ev) items.push(`<div class="fs-item"><span class="ic">${icon("calendar")}</span><div><b>${esc(ev.title)}</b><span>${esc(ev.when)} di Discord. Terbuka untuk semua.</span></div></div>`);
    if (dc) items.push(`<div class="fs-item"><span class="ic">${icon("tag")}</span><div><b>Diskon ${dc.percent}% untuk ${esc(catsText(dc.cats))}</b><span class="countdown" data-until="${esc(dc.until)}"></span></div></div>`);
    box.innerHTML = `<div class="fs-copy">
        <span class="fs-badge">${icon(SEASON_ICON[seasonKey])}${esc(season.label)}</span>
        <h2>${esc(season.title || season.label)}</h2>
        <p>${esc(season.desc || "")}</p>
        <div class="fs-actions">${fb ? freeButton(fb, "btn primary shine", "Ambil gratis") : ""}<a class="btn soft" href="#toko">${dc ? "Lihat produk diskon" : "Lihat toko"}</a></div>
      </div>
      <div class="fs-list">${items.join("")}</div>`;
    tickCountdowns();
  }

  /* Partikel edisi musim */
  const particles = (function () {
    const cv = $("#fs-canvas");
    if (!cv || reduce || !cv.getContext) return { setKind() {} };
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, parts = [], kind = "mote", visible = false, raf = 0, colA = "#9BDCFC", colB = "#4FA9E3";
    const TYPE = { hujan: "rain", kemarau: "mote", gugur: "leaf", salju: "snow", ramadan: "star", idulfitri: "star", iduladha: "mote", kemerdekaan: "confetti" };
    function readCols() {
      const cs = getComputedStyle(root);
      colA = cs.getPropertyValue("--season-a").trim() || colA;
      colB = cs.getPropertyValue("--season-b").trim() || colB;
    }
    function size() {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(init) {
      const p = { x: Math.random() * W, y: init ? Math.random() * H : -20, a: Math.random() * 6.28, c: Math.random() < 0.5 ? colA : colB };
      if (kind === "rain") { p.len = 10 + Math.random() * 18; p.s = 6 + Math.random() * 6; }
      else if (kind === "snow") { p.r = 1.5 + Math.random() * 3.2; p.s = 0.35 + Math.random() * 0.9; }
      else if (kind === "leaf") { p.r = 6 + Math.random() * 7; p.s = 0.7 + Math.random() * 1.1; p.w = (Math.random() - 0.5) * 0.05; }
      else if (kind === "confetti") { p.r = 3 + Math.random() * 4; p.s = 0.9 + Math.random() * 1.6; p.w = (Math.random() - 0.5) * 0.2; p.c = Math.random() < 0.55 ? "#E2394A" : "#FFFFFF"; }
      else if (kind === "star") { p.r = 0.8 + Math.random() * 2.2; p.s = 0; p.tw = 0.01 + Math.random() * 0.03; }
      else { p.r = 2 + Math.random() * 6; p.s = -(0.15 + Math.random() * 0.45); if (!init) p.y = H + 20; }
      return p;
    }
    function populate() {
      const dens = { rain: 4200, star: 3200, snow: 6000, confetti: 7000, leaf: 14000, mote: 9000 }[kind] || 9000;
      parts = Array.from({ length: Math.round(Math.min(150, (W * H) / dens)) }, () => make(true));
    }
    function step() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        if (kind === "rain") {
          p.y += p.s; p.x -= p.s * 0.25;
          ctx.globalAlpha = 0.5; ctx.strokeStyle = p.c; ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.len * 0.25, p.y - p.len); ctx.stroke();
          if (p.y > H + 24 || p.x < -24) Object.assign(p, make(false), { x: Math.random() * (W + 80) });
        } else if (kind === "snow") {
          p.y += p.s; p.a += 0.012; p.x += Math.sin(p.a) * 0.4;
          ctx.globalAlpha = 0.85; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          if (p.y > H + 10) Object.assign(p, make(false));
        } else if (kind === "leaf" || kind === "confetti") {
          p.y += p.s; p.a += p.w; p.x += Math.sin(p.y / 38) * 0.7;
          ctx.globalAlpha = kind === "leaf" ? 0.7 : 0.9; ctx.fillStyle = p.c;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
          if (kind === "leaf") { ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.42, 0, 0, 6.283); ctx.fill(); }
          else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
          ctx.restore();
          if (p.y > H + 16) Object.assign(p, make(false));
        } else if (kind === "star") {
          p.a += p.tw;
          ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(p.a)); ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.moveTo(p.x, p.y - p.r * 2.4); ctx.lineTo(p.x + p.r * 0.6, p.y); ctx.lineTo(p.x, p.y + p.r * 2.4); ctx.lineTo(p.x - p.r * 0.6, p.y); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.7, 0, 6.283); ctx.fill();
        } else {
          p.y += p.s; p.a += 0.01; p.x += Math.sin(p.a) * 0.3;
          ctx.globalAlpha = 0.35; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          if (p.y < -20) Object.assign(p, make(false));
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(step); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    if (hasIO) new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) start(); else stop(); }).observe(cv);
    else { visible = true; }
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { size(); populate(); }, 200); });
    return {
      setKind(k) { kind = TYPE[k] || "mote"; readCols(); size(); populate(); start(); }
    };
  })();

  /* ---------------------------------------------------------
     6. Isi dari data.js
     --------------------------------------------------------- */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  $$("[data-updated]").forEach((el) => { el.textContent = S.updated || ""; });
  $$("[data-site]").forEach((el) => { el.textContent = S.domain || ""; });

  if (S.photo) {
    const who = $("#hero-who");
    if (who) { who.classList.add("photo"); who.innerHTML = `<img src="${esc(S.photo)}" width="640" height="640" alt="Foto ${esc(S.name)}">`; }
  }

  /* Pita draf dan pratinjau edisi */
  const draftBar = $("#draft-bar");
  if (draftBar && isDraft && sess.get("mr-draft-hidden") !== "1") draftBar.hidden = false;
  const draftClose = $("#draft-close");
  if (draftClose) draftClose.addEventListener("click", () => { draftBar.hidden = true; sess.set("mr-draft-hidden", "1"); });
  const seasonSel = $("#season-preview");
  if (seasonSel && S.seasons) {
    const pv = sess.get("mr-season-preview") || "";
    seasonSel.innerHTML = `<option value="">Otomatis, sesuai tanggal</option>` + Object.keys(S.seasons).map((k) => `<option value="${esc(k)}"${k === pv ? " selected" : ""}>${esc(S.seasons[k].label || k)}</option>`).join("");
    seasonSel.addEventListener("change", () => { sess.set("mr-season-preview", seasonSel.value || null); applySeason(resolveSeason()); toast(`Pratinjau ${season.label || "edisi"}`); });
  }

  /* Sosial media dan kontak */
  const socials = S.socials || [];
  const foundRow = $("#found-row");
  if (foundRow) {
    foundRow.innerHTML = socials.filter((s) => s.url || isDraft).map((s) => s.url
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${icon(s.icon)}${esc(s.label)}</a>`
      : `<span title="Tautan belum diisi">${icon(s.icon)}${esc(s.label)}</span>`).join("");
  }
  $$("[data-social-icons]").forEach((box) => {
    box.innerHTML = socials.filter((s) => s.url || isDraft).map((s) => s.url
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)} ${esc(s.handle)}">${icon(s.icon)}</a>`
      : `<span title="${esc(s.label)}: tautan belum diisi">${icon(s.icon)}</span>`).join("");
  });
  const contactList = $("#contact-list");
  if (contactList) {
    const n = waNumber(), c = S.contact || {};
    const waDisplay = n ? "0" + n.slice(2).replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3") : "";
    const rows = [
      ["WhatsApp", n ? `<a href="${esc(waLink(`${greet}, aku mau tanya.`))}" target="_blank" rel="noopener">${esc(waDisplay)}</a>` : ""],
      ["Email", c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""],
      ["Discord", discordInvite() ? `<a href="${esc(discordInvite())}" target="_blank" rel="noopener">${esc(c.discordHandle || "Gabung server")}</a>` : (c.discordHandle ? `<b>${esc(c.discordHandle)}</b>` : "")],
      ["Jam admin", c.hours ? `<b>${esc(c.hours)}</b>` : ""]
    ];
    contactList.innerHTML = rows.filter(([, v]) => v || isDraft).map(([k, v]) => `<div class="contact-row"><span>${k}</span>${v || '<span class="empty">belum diisi</span>'}</div>`).join("");
  }
  $$("[data-discord]").forEach((a) => { a.href = discordHref(); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa]").forEach((a) => { a.href = waLink(a.dataset.wa.replace("{greet}", greet).replace("{nick}", nick)); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-link]").forEach((a) => { const u = (S.links || {})[a.dataset.link]; if (u) { a.href = u; a.target = "_blank"; a.rel = "noopener"; } });

  /* Data mesin pencari */
  const ld = $("#ld-main");
  if (ld) {
    try {
      const data = JSON.parse(ld.textContent);
      const person = (data["@graph"] || []).find((n) => n["@type"] === "Person");
      if (person) person.sameAs = socials.filter((s) => s.url).map((s) => s.url);
      if (!isDraft && products.length && $("#products")) {
        data["@graph"].push({
          "@type": "ItemList", "@id": (S.url || "") + "#produk", name: "Modul, buku, dan jurnal",
          itemListElement: products.filter((p) => p.price > 0 && !p.soon).map((p, i) => ({
            "@type": "ListItem", position: i + 1,
            item: { "@type": "Product", name: p.title, sku: p.sku, description: p.desc, brand: { "@type": "Person", name: S.name },
              // Google mewajibkan gambar untuk listingan penjual. shortcut: produk tanpa field image memakai og-image, isi image di data.js kalau sudah ada foto sampulnya
              image: new URL(p.image || "assets/img/og-image.png", S.url || location.href).href,
              offers: { "@type": "Offer", priceCurrency: "IDR", price: priceOf(p), availability: "https://schema.org/InStock", url: new URL("toko.html#toko", S.url || location.href).href } }
          }))
        });
      }
      ld.textContent = JSON.stringify(data);
    } catch (e) { /* biarkan apa adanya */ }
  }

  /* Sedang dikerjakan */
  const ringHTML = (p) => `<div class="ring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="r-bg" cx="32" cy="32" r="27"/><circle class="r-fg" cx="32" cy="32" r="27" pathLength="100" data-p="${Number(p.progress) || 0}"/></svg><div><b><span data-to="${Number(p.progress) || 0}">0</span>%</b><small>${esc(p.progressLabel || "")}</small></div></div>`;
  const nowGrid = $("#now-grid");
  if (nowGrid) {
    nowGrid.innerHTML = (S.projects || []).map((p, i) => `
      <article class="now-card" data-reveal style="--i:${i}">
        <div class="now-top"><span class="now-kind">${esc(p.kind)}</span><span class="pill">${esc(p.status)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p>
        ${typeof p.progress === "number" ? ringHTML(p) : ""}
        ${p.steps ? `<ul class="steps-mini">${p.steps.map((s) => `<li${s[1] ? ' class="ok"' : ""}>${esc(s[0])}</li>`).join("")}</ul>` : ""}
        ${p.url ? `<a class="link-arrow" href="${esc(p.url)}">${esc(p.urlLabel || "Lihat")} <span class="arr" aria-hidden="true">→</span></a>` : ""}
      </article>`).join("");
  }
  const bookRing = $("#book-ring");
  if (bookRing) {
    const bp = (S.projects || []).find((p) => typeof p.progress === "number");
    if (bp) bookRing.innerHTML = ringHTML(bp); else bookRing.hidden = true;
  }

  /* Karya */
  const worksBox = $("#works");
  if (worksBox) {
    worksBox.innerHTML = (S.works || []).map((w, i) => `
      <article class="work" data-reveal style="--i:${i}">
        <div class="work-thumb">${w.image ? `<img src="${esc(w.image)}" alt="${esc(w.title)}" loading="lazy">` : (THUMB[w.thumb] || THUMB.board)}</div>
        <div class="work-body">
          <div class="work-meta"><span>${esc(w.type)}</span><span>${esc(w.year)}</span></div>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.desc)}</p>
          ${w.url ? `<a href="${esc(w.url)}">${esc(w.urlLabel || "Lihat detail")} →</a>` : ""}
        </div>
      </article>`).join("");
  }

  /* Proyek residensial: gambar berganti otomatis */
  const resShow = $("#res-show");
  if (resShow) {
    const imgs = ((S.residential || {}).images || []).filter((m) => m && m.src);
    const feat = resShow.closest(".feature"), cap = $("#res-cap"), dotsBox = $("#res-dots"), ctrl = $("#res-ctrl");
    if (!imgs.length) { if (feat) feat.hidden = true; }
    else {
      resShow.innerHTML = imgs.map((m, i) => `<a class="res-slide${i ? "" : " on"}${m.fit === "cover" ? " cover" : ""}" href="${esc(m.src)}" target="_blank" rel="noopener" aria-hidden="${i ? "true" : "false"}"${i ? ' tabindex="-1"' : ""}><img src="${esc(m.src)}" alt="${esc(m.alt || m.caption || "")}" loading="${i ? "lazy" : "eager"}" decoding="async"></a>`).join("") + '<span class="res-bar" aria-hidden="true"><i></i></span>';
      const slides = $$(".res-slide", resShow);
      if (dotsBox) dotsBox.innerHTML = imgs.map((m, i) => `<button type="button" aria-label="Gambar ${i + 1}: ${esc(m.caption || "")}"${i ? "" : ' aria-current="true"'}></button>`).join("");
      if (ctrl && imgs.length < 2) ctrl.hidden = true;
      const slideMs = Math.max(2, Number((S.residential || {}).seconds) || 4) * 1000;
      resShow.style.setProperty("--res-ms", slideMs + "ms");
      let cur = 0, timer = 0, hold = false, seen = false;
      const restart = () => {
        clearTimeout(timer); resShow.classList.remove("run");
        if (hold || !seen || slides.length < 2 || reduce) return;
        void resShow.offsetWidth; resShow.classList.add("run");
        timer = setTimeout(() => go(cur + 1), slideMs);
      };
      function go(n) {
        cur = (n + slides.length) % slides.length;
        slides.forEach((sl, i) => { const on = i === cur; sl.classList.toggle("on", on); sl.setAttribute("aria-hidden", String(!on)); sl.tabIndex = on ? 0 : -1; });
        if (dotsBox) $$("button", dotsBox).forEach((b, i) => { if (i === cur) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
        if (cap) cap.textContent = imgs[cur].caption || "";
        restart();
      }
      if (cap) cap.textContent = imgs[0].caption || "";
      if (ctrl) ctrl.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.res) go(cur + Number(b.dataset.res));
        else if (dotsBox && dotsBox.contains(b)) go($$("button", dotsBox).indexOf(b));
      });
      const media = resShow.closest(".feature-media") || resShow;
      media.addEventListener("pointerenter", () => { hold = true; restart(); });
      media.addEventListener("pointerleave", () => { hold = false; restart(); });
      if (hasIO) new IntersectionObserver((en) => { seen = en[0].isIntersecting; restart(); }, { threshold: 0.35 }).observe(resShow);
      else { seen = true; restart(); }
      document.addEventListener("visibilitychange", () => { hold = document.hidden; restart(); });
    }
  }

  /* Denah ilmu: ruang bisa dimasuki */
  const roomDlg = $("#room-dialog"), roomEls = $$(".plan .room[data-room]");
  const roomKeys = roomEls.map((r) => r.dataset.room).filter((k) => (S.rooms || {})[k]);
  function openRoom(key, from) {
    const d = (S.rooms || {})[key];
    if (!d || !roomDlg) return;
    const href = (u) => (S.links || {})[u] || u;
    const list = (t, arr) => (arr && arr.length ? `<div class="room-col"><h3>${t}</h3><ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "");
    $("#room-no").textContent = d.no || "";
    $("#room-title").textContent = d.title || "";
    $("#room-body").innerHTML = `<p class="room-learn">${esc(d.learn || "")}</p>
      <div class="room-cols">${list("Hasilnya", d.did)}${list("Nyambung dengan ilmu lain", d.joins)}</div>
      ${(d.links || []).length ? `<div class="room-links">${d.links.map(([l, u], i) => { const h = href(u), ext = /^https?:/.test(h); return `<a class="btn ${i ? "soft" : "primary"} small" href="${esc(h)}"${ext ? ' target="_blank" rel="noopener"' : ""}>${esc(l)}</a>`; }).join("")}</div>` : ""}`;
    roomDlg.dataset.room = key;
    if (!roomDlg.open) { if (typeof roomDlg.showModal === "function") roomDlg.showModal(); else roomDlg.setAttribute("open", ""); }
    else { roomDlg.classList.remove("swap"); void roomDlg.offsetWidth; roomDlg.classList.add("swap"); }
    if (from) {
      const a = from.getBoundingClientRect(), b = roomDlg.getBoundingClientRect();
      roomDlg.style.transformOrigin = `${Math.round(a.left + a.width / 2 - b.left)}px ${Math.round(a.top + a.height / 2 - b.top)}px`;
    }
  }
  const closeRoom = () => { if (!roomDlg) return; if (typeof roomDlg.close === "function") roomDlg.close(); else roomDlg.removeAttribute("open"); };
  roomEls.forEach((room) => {
    const btn = $(".room-open", room), h = $("h3", room);
    if (!btn) return;
    if (!roomKeys.includes(room.dataset.room)) { btn.remove(); return; }
    btn.setAttribute("aria-label", `Masuk ke ruang ${h ? h.textContent : ""}`);
    btn.addEventListener("click", () => openRoom(room.dataset.room, room));
  });
  if (roomDlg) roomDlg.addEventListener("click", (e) => {
    if (e.target === roomDlg || e.target.closest("#room-close")) { closeRoom(); return; }
    const step = e.target.closest("[data-room-step]");
    if (step) { const i = roomKeys.indexOf(roomDlg.dataset.room); openRoom(roomKeys[(i + Number(step.dataset.roomStep) + roomKeys.length) % roomKeys.length]); return; }
    if (e.target.closest('a[href^="#"]')) closeRoom();
  });

  /* Bimbel */
  function renderPrograms() {
    $$("[data-offer]").forEach((el) => {
      const p = catalog[el.dataset.offer];
      if (!p) { el.innerHTML = ""; return; }
      const card = el.closest(".class");
      if (card) card.classList.toggle("is-soon", !!p.soon);
      if (p.soon) {
        el.innerHTML = `<div class="class-price soon">Coming soon<small>rencana ${rupiah(p.price)} / ${esc(p.unit || "sesi")}</small></div>
        <div class="class-actions"><a class="btn soft small" href="${esc(waLink(`${greet}, kabari aku kalau ${p.title} sudah dibuka ya.`))}" target="_blank" rel="noopener">Kabari aku</a></div>`;
        return;
      }
      const d = discountFor(p);
      el.innerHTML = `<div class="class-price">${d ? `<small><s>${rupiah(p.price)}</s></small>` : ""}${rupiah(priceOf(p))}<small>/ ${esc(p.unit || "sesi")}</small></div>
        <div class="class-actions"><button class="btn primary small" type="button" data-add="${esc(p.id)}">Daftar</button><a class="btn soft small" href="${esc(waLink(`${greet}, aku mau tanya soal ${p.title}.`))}" target="_blank" rel="noopener">Tanya dulu</a></div>`;
    });
  }
  function renderEventStrip() {
    const el = $("#event-strip");
    if (!el) return;
    const ev = season.event;
    if (!ev) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `<span class="live"><i></i>Event gratis</span><p><b>${esc(ev.title)}</b> untuk ${esc((season.label || "edisi ini").toLowerCase())}. ${esc(ev.when)} di Discord, terbuka untuk siapa pun.</p>${discordBtn("btn sky small", "Gabung Discord")}`;
  }

  /* Toko. Produk kategori MABA_CAT tampil di bagian #maba (dikelompokkan per subject), bukan di toko utama. */
  const MABA_CAT = "catatan";
  const shopProducts = $("#maba-groups") ? products.filter((p) => p.cat !== MABA_CAT) : products;
  let activeCat = store.get("mr-cat", "semua");
  if (activeCat !== "semua" && (!(S.categories || {})[activeCat] || !shopProducts.some((p) => p.cat === activeCat))) activeCat = "semua";
  function renderFilters() {
    const box = $("#filters");
    if (!box) return;
    const counts = {};
    shopProducts.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    const chips = [["semua", "Semua", shopProducts.length]].concat(Object.entries(S.categories || {}).filter(([k]) => counts[k]).map(([k, v]) => [k, v, counts[k]]));
    box.innerHTML = chips.map(([k, v, c]) => `<button type="button" class="chip" data-cat="${esc(k)}" aria-pressed="${k === activeCat}">${esc(v)}<small>${c}</small></button>`).join("");
  }
  function productCard(p, i) {
    const d = discountFor(p), free = !p.price;
    if (p.soon) return `<article class="product enter is-soon" style="--i:${i}">
      <div class="book-stage"><span class="p-badge soon">Coming soon</span><span class="p-sku">${esc(p.sku)}</span>
        <div class="book cover-${esc(p.cat)}"><div class="face"><div class="f-top"><span>${esc(catLabel(p.cat))}</span><span>${esc(String(p.sku || "").split("-").pop())}</span></div>${art(p.art)}<div class="f-title">${esc(p.title)}</div><div class="f-author">${esc(S.name || "")}</div></div><span class="spine"></span><span class="pages"></span></div>
      </div>
      <div class="product-body"><p class="product-cat">${esc(catLabel(p.cat))}</p><h3>${esc(p.title)}</h3><p class="desc">${esc(p.desc)}</p><p class="format">${esc(p.format)}</p></div>
      <div class="product-foot"><span class="price soon">Coming soon<small>sedang kusiapkan</small></span><div class="p-actions"><a class="btn soft small" href="${esc(waLink(`${greet}, kabari aku kalau "${p.title}" sudah siap ya.`))}" target="_blank" rel="noopener">Kabari aku</a></div></div>
    </article>`;
    const badge = free ? '<span class="p-badge free">Gratis</span>' : d ? `<span class="p-badge sale">Hemat ${d.percent}%</span>` : p.badge ? `<span class="p-badge">${esc(p.badge)}</span>` : "";
    const price = free ? '<span class="price">Gratis<small>untuk semua</small></span>' : `<span class="price">${d ? `<s>${rupiah(p.price)}</s>` : ""}${rupiah(priceOf(p))}</span>`;
    const action = free ? freeButton(p, "btn sky small", "Ambil gratis") : `<button class="btn primary small" type="button" data-add="${esc(p.id)}">Tambah</button>`;
    return `<article class="product enter" style="--i:${i}">
      <div class="book-stage">${badge}<span class="p-sku">${esc(p.sku)}</span>
        <div class="book cover-${esc(p.cat)}"><div class="face"><div class="f-top"><span>${esc(catLabel(p.cat))}</span><span>${esc(String(p.sku || "").split("-").pop())}</span></div>${art(p.art)}<div class="f-title">${esc(p.title)}</div><div class="f-author">${esc(S.name || "")}</div></div><span class="spine"></span><span class="pages"></span></div>
      </div>
      <div class="product-body"><p class="product-cat">${esc(catLabel(p.cat))}</p><h3>${esc(p.title)}</h3><p class="desc">${esc(p.desc)}</p><p class="format">${esc(p.format)}</p>${d ? `<p class="deal">${esc(dealText(d))}</p>` : ""}</div>
      <div class="product-foot">${price}<div class="p-actions">${action}</div></div>
      ${p.lynk ? `<a class="lynk-btn" href="${esc(p.lynk)}" target="_blank" rel="noopener">Atau beli di Lynk</a>` : ""}
    </article>`;
  }
  function renderProducts() {
    const box = $("#products");
    if (!box) return;
    const list = shopProducts.filter((p) => activeCat === "semua" || p.cat === activeCat).sort((a, b) => !!a.soon - !!b.soon);
    box.innerHTML = list.map(productCard).join("");
    bindTilt(box);
  }
  function renderMaba() {
    const box = $("#maba-groups");
    if (!box) return;
    const groups = {};
    products.filter((p) => p.cat === MABA_CAT).forEach((p) => { const k = p.subject || "Lainnya"; (groups[k] = groups[k] || []).push(p); });
    const slug = (t) => "maba-" + String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const entries = Object.entries(groups);
    box.innerHTML = (entries.length > 1 ? `<nav class="filters" aria-label="Mata kuliah">${entries.map(([subject, list]) => `<a class="chip" href="#${slug(subject)}">${esc(subject)}<small>${list.length}</small></a>`).join("")}</nav>` : "")
      + entries.map(([subject, list]) => `<div class="maba-group" id="${slug(subject)}"><h3 class="maba-subject">${esc(subject)}<small>${list.length} catatan</small></h3><div class="products">${list.map(productCard).join("")}</div></div>`).join("");
    bindTilt(box);
  }
  function setCat(c) { activeCat = c; store.set("mr-cat", c); renderFilters(); renderProducts(); }
  const filtersBox = $("#filters");
  if (filtersBox) filtersBox.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) setCat(b.dataset.cat); });
  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-filter]");
    if (f && (S.categories || {})[f.dataset.filter]) setCat(f.dataset.filter);
  });

  function bindTilt(scope) {
    if (reduce || !(window.matchMedia && matchMedia("(hover: hover)").matches)) return;
    $$(".book-stage", scope).forEach((st) => {
      const book = $(".book", st);
      if (!book || st.dataset.tilt) return;
      st.dataset.tilt = "1";
      const baseY = st.closest(".book-spot") ? -24 : -18;
      st.addEventListener("pointermove", (e) => {
        const r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        book.style.setProperty("--ry", `${baseY + x * 34}deg`);
        book.style.setProperty("--rx", `${-y * 16}deg`);
      });
      st.addEventListener("pointerleave", () => { book.style.removeProperty("--ry"); book.style.removeProperty("--rx"); });
    });
  }

  /* Buku sorotan */
  function renderBookSpot() {
    const el = $("#book-price"), id = el && el.dataset.product, p = id && catalog[id];
    if (!el || !p) return;
    const d = discountFor(p);
    el.innerHTML = `${d ? `<s>${rupiah(p.price)}</s> ` : ""}<b>${rupiah(priceOf(p))}</b>`;
  }

  /* Testimoni: hanya yang asli. Kosong = bagian disembunyikan. */
  const testiSec = $("#testimoni"), testiBox = $("#testis");
  if (testiSec && testiBox) {
    const list = (S.testimonials || []).filter((t) => t && t.text && t.name);
    if (!list.length) testiSec.hidden = true;
    else testiBox.innerHTML = list.map((t, i) => {
      const n = clamp(Math.round(Number(t.stars) || 5), 1, 5);
      return `<article class="testi" data-reveal style="--i:${i}">
          <div class="stars" role="img" aria-label="${n} dari 5 bintang">${icon("star5").repeat(n)}</div>
          <blockquote>${esc(t.text)}</blockquote>
          <div class="who"><span class="av">${esc(initials(t.name))}</span><span><b>${esc(t.name)}</b><span>${esc(t.role || "")}</span></span></div>
        </article>`;
    }).join("");
  }

  /* FAQ */
  const faqBox = $("#faq-list");
  if (faqBox) faqBox.innerHTML = (S.faq || []).map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(String(f.a).replace("{hours}", (S.contact && S.contact.hours) || ""))}</p></details>`).join("");

  /* Newsletter: email masuk ke Google Sheet lewat Apps Script (newsletterEndpoint di data.js). Kalau kosong, kembali ke Substack. */
  $$("[data-newsletter]").forEach((form) => {
    const ep = S.newsletterEndpoint || "", sub = (S.links && S.links.substack) || "", note = $(".nl-note", form);
    if (!ep && sub) form.action = sub.replace(/\/$/, "") + "/subscribe";
    if (ep && note) note.textContent = "Emailmu hanya kupakai untuk newsletter, info diskon, dan kode promo. Tanpa spam, berhenti kapan saja.";
    form.addEventListener("submit", async (e) => {
      const input = $("input[type=email]", form), btn = $("button[type=submit]", form), email = input ? input.value.trim() : "";
      if (!email) { e.preventDefault(); if (input) input.focus(); return; }
      if (!ep) {
        if (!sub) { e.preventDefault(); toast("Alamat newsletter belum diisi di data.js"); return; }
        toast("Lanjutkan konfirmasi di tab Substack yang baru terbuka");
        return;
      }
      e.preventDefault();
      if (btn) btn.disabled = true;
      try {
        // no-cors: Apps Script tetap menerima datanya, hanya balasannya yang tidak bisa dibaca browser
        await fetch(ep, { method: "POST", mode: "no-cors", body: new URLSearchParams({ email, sumber: location.pathname, website: form.elements.website ? form.elements.website.value : "" }) });
        form.reset();
        if (note) note.textContent = "Terima kasih, emailmu sudah terdaftar. Catatan berikutnya langsung masuk ke inbox-mu.";
        toast("Emailmu sudah terdaftar");
      } catch (err) {
        toast("Gagal mengirim. Cek internetmu lalu coba lagi.");
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });
  $$("[data-newsletter-name]").forEach((el) => { el.textContent = S.newsletterName || "Newsletter"; });

  /* Angka statistik dari isi website */
  const statVal = {
    rooms: $$(".plan .room").length,
    tools: $$(".tool-tab").length,
    programs: programs.length,
    free: products.filter((p) => !p.price).length + $$(".stack .guide").length + $$("#minis .mini").length
  };
  $$("[data-stat]").forEach((el) => { const v = statVal[el.dataset.stat]; if (typeof v === "number") el.dataset.to = v; el.textContent = "0"; });

  /* Penomoran bagian */
  let num = 0;
  $$("[data-num]").forEach((el) => { const sec = el.closest("section"); if (sec && sec.hidden) return; el.textContent = pad(++num); });

  /* ---------------------------------------------------------
     7. Animasi tiap bagian
     --------------------------------------------------------- */
  /* Angka naik dari 0. data-to (angka biasa) atau data-count dengan data-prefix / data-suffix. */
  function countUp(el, dur = 1400) {
    const to = Number(el.dataset.to != null ? el.dataset.to : el.dataset.count) || 0;
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    const show = (v) => { el.textContent = pre + Math.round(v).toLocaleString("id-ID") + suf; };
    const t0 = performance.now();
    (function tick(t) {
      const p = clamp((t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      show(to * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  $$("[data-count]").forEach((el) => {
    const host = el.closest(".guide, [data-reveal]") || el;
    el.textContent = (el.dataset.prefix || "") + "0" + (el.dataset.suffix || "");
    whenIn(host, () => setTimeout(() => countUp(el, 1500), 250));
  });
  $$(".stat").forEach((st) => whenIn(st, () => $$("[data-to]", st).forEach((el) => countUp(el))));
  $$(".ring").forEach((rg) => {
    const host = rg.closest("[data-reveal]") || rg.parentElement;
    if (!host.hasAttribute("data-reveal")) host.setAttribute("data-reveal", "");
    whenIn(host, () => {
      const fg = $(".r-fg", rg);
      if (fg) fg.style.strokeDashoffset = String(100 - (Number(fg.dataset.p) || 0));
      $$("[data-to]", rg).forEach((el) => countUp(el, 1600));
    });
  });

  /* Potret mengambang */
  const who = $("#hero-who");
  if (who && !reduce) scrollFns.push(() => { if (scrollY < innerHeight * 1.2) who.style.transform = `translateX(-50%) translateY(${scrollY * 0.06}px)`; });

  /* Manifesto: kata menyala satu per satu */
  const mani = $("[data-words]");
  if (mani) {
    mani.innerHTML = mani.textContent.trim().split(/\s+/).map((w) => {
      const m = w.match(/^\[(.+?)\]([.,!]*)$/);
      return m ? `<span class="mw key">${esc(m[1] + m[2])}</span>` : `<span class="mw">${esc(w)}</span>`;
    }).join(" ");
    const words = $$(".mw", mani);
    if (reduce) words.forEach((w) => w.classList.add("on"));
    else scrollFns.push(() => {
      const r = mani.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.3));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < lit));
    });
  }

  /* Garis waktu cerita */
  const tl = $(".timeline");
  if (tl) {
    const items = $$("li", tl);
    if (reduce) { tl.style.setProperty("--tl", 1); items.forEach((li) => li.classList.add("on")); }
    else scrollFns.push(() => {
      const r = tl.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const p = clamp((innerHeight * 0.62 - r.top) / r.height);
      tl.style.setProperty("--tl", p.toFixed(3));
      items.forEach((li) => li.classList.toggle("on", li.offsetTop + 12 <= p * r.height + 2));
    });
  }

  /* Cerita di balik foto: di layar lebar kartu bergeser ke samping mengikuti scroll, di HP digeser jari */
  const pf = $("#cerita-foto");
  if (pf) {
    const pin = $(".pf-pin", pf), sticky = $(".pf-sticky", pf), track = $(".pf-track", pf), ui = $(".pf-ui", pf);
    const cards = $$(".pf-card", pf), num = $(".pf-count b", pf), fill = $(".pf-bar i", pf);
    const wideMq = matchMedia("(min-width: 760px) and (min-height: 560px)");
    let shift = 0, stickTop = 0, cur = -1, started = false;
    const mark = (view, p) => {
      if (fill) fill.style.transform = `scaleX(${p.toFixed(3)})`;
      if (!started) return;
      const w = track.clientWidth, mid = view + w * (pinned() ? 0.2 + 0.6 * p : 0.5); // titik acuan bergeser supaya kartu pertama dan terakhir ikut terhitung
      let best = 0, bd = Infinity;
      cards.forEach((c, i) => {
        const left = c.offsetLeft, d = Math.abs(left + c.offsetWidth / 2 - mid);
        if (d < bd) { bd = d; best = i; }
        if (left < view + w * 0.9) c.classList.add("on");
      });
      if (best !== cur) {
        cur = best;
        cards.forEach((c, i) => c.classList.toggle("now", i === best));
        if (num) num.textContent = pad(best + 1);
      }
    };
    const pinned = () => pf.classList.contains("pf-pinned");
    const onPinScroll = () => {
      if (!pinned()) return;
      const r = pin.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      if (!started && r.top < innerHeight * 0.55) started = true;
      const p = shift > 0 ? clamp((stickTop - r.top) / shift) : 0;
      track.style.transform = `translate3d(${(-p * shift).toFixed(1)}px,0,0)`;
      if (p > 0.02 && ui) ui.classList.add("used");
      mark(p * shift, p);
    };
    const layout = () => {
      const on = wideMq.matches;
      pf.classList.toggle("pf-pinned", on);
      track.tabIndex = on ? -1 : 0;
      if (on) {
        stickTop = parseFloat(getComputedStyle(sticky).top) || 0;
        const last = track.lastElementChild;
        shift = Math.max(0, last.offsetLeft + last.offsetWidth + (parseFloat(getComputedStyle(track).paddingRight) || 0) - track.clientWidth);
        pin.style.height = `${sticky.offsetHeight + shift}px`;
        onPinScroll();
      } else {
        pin.style.height = ""; track.style.transform = ""; shift = 0;
        const max = track.scrollWidth - track.clientWidth;
        mark(track.scrollLeft, max > 0 ? clamp(track.scrollLeft / max) : 0);
      }
    };
    scrollFns.push(onPinScroll);
    let tRaf = 0;
    track.addEventListener("scroll", () => {
      if (pinned() || tRaf) return;
      tRaf = requestAnimationFrame(() => {
        tRaf = 0;
        const max = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft > 8 && ui) ui.classList.add("used");
        mark(track.scrollLeft, max > 0 ? clamp(track.scrollLeft / max) : 0);
      });
    }, { passive: true });
    whenIn(track, () => { started = true; layout(); });
    if (wideMq.addEventListener) wideMq.addEventListener("change", layout);
    addEventListener("resize", layout);
    addEventListener("load", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    layout();
  }

  /* Halaman cerita lengkap: garis perjalanan terisi mengikuti scroll */
  const jy = $(".journey");
  if (jy) {
    const steps = $$(".jy", jy);
    scrollFns.push(() => {
      const r = jy.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const line = innerHeight * 0.6;
      jy.style.setProperty("--jp", clamp((line - r.top) / r.height).toFixed(3));
      steps.forEach((s) => s.classList.toggle("on", s.getBoundingClientRect().top < line));
    });
    onScroll();
  }

  /* Lembar A-01: geser antara rasa dan data */
  const rdStage = $("#rd-stage"), rdRange = $("#rd-range"), rdCap = $("#rd-cap");
  if (rdStage && rdRange) {
    const CAPS = [
      [30, "<b>Data.</b> Cahaya 300 lux, suhu 22,8 sampai 25,8 °C, dan bukaan ventilasi minimal 5% luas lantai. Angka inilah yang membuat rasa nyaman bisa dijelaskan."],
      [70, "<b>Rasa dan data.</b> Keduanya melihat ruang yang sama. Rasa memberi arah, data memberi alasan."],
      [101, "<b>Rasa.</b> Dinding hangat, cahaya kuning, dan tanaman membuat orang betah. Tapi kata betah saja belum cukup saat asistensi."]
    ];
    let touched = false, raf = 0, dragging = false;
    const set = (v) => {
      v = clamp(v, 0, 100);
      rdStage.style.setProperty("--x", v.toFixed(2) + "%");
      if (Number(rdRange.value) !== Math.round(v)) rdRange.value = Math.round(v);
      const c = CAPS.find(([lim]) => v < lim);
      if (rdCap && c && rdCap.dataset.k !== String(c[0])) { rdCap.dataset.k = String(c[0]); rdCap.innerHTML = c[1]; }
    };
    const fromPointer = (e) => { const r = rdStage.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
    rdRange.addEventListener("input", () => { touched = true; cancelAnimationFrame(raf); set(Number(rdRange.value)); });
    rdStage.addEventListener("pointerdown", (e) => { touched = true; dragging = true; cancelAnimationFrame(raf); rdStage.classList.add("drag"); fromPointer(e); try { rdStage.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ } });
    rdStage.addEventListener("pointermove", (e) => { if (dragging) fromPointer(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => rdStage.addEventListener(t, () => { dragging = false; rdStage.classList.remove("drag"); }));
    set(Number(rdRange.value) || 50);
    const sheet = rdStage.closest(".sheet") || rdStage;
    if (!reduce) whenIn(sheet, () => {
      /* Sapuan otomatis sekali supaya orang tahu garisnya bisa digeser */
      const keys = [[0, 50], [1300, 18], [2900, 82], [4300, 50]], t0 = performance.now() + 700;
      (function frame(t) {
        if (touched) return;
        const el = t - t0;
        if (el >= 0) {
          let k = 1; while (k < keys.length - 1 && el > keys[k][0]) k++;
          const [ta, va] = keys[k - 1], [tb, vb] = keys[k], p = clamp((el - ta) / (tb - ta)), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          set(va + (vb - va) * e);
          if (el >= keys[keys.length - 1][0]) return;
        }
        raf = requestAnimationFrame(frame);
      })(performance.now());
    });
  }

  /* Panduan bertumpuk */
  const guides = $$(".stack .guide");
  if (guides.length > 1 && !reduce) scrollFns.push(() => {
    const wide = innerWidth > 760;
    guides.forEach((g, i) => {
      const next = guides[i + 1];
      if (!wide || !next) { g.style.transform = ""; return; }
      const gr = g.getBoundingClientRect(), nr = next.getBoundingClientRect();
      const o = clamp((gr.bottom - nr.top) / gr.height);
      g.style.transform = o > 0 ? `scale(${(1 - o * 0.06).toFixed(4)})` : "";
    });
  });

  /* Balasan AI mengetik sendiri */
  const aiReply = $("#ai-reply");
  if (aiReply) {
    const full = aiReply.textContent.trim();
    const guide = aiReply.closest(".guide");
    if (!reduce && guide) {
      aiReply.textContent = "";
      const caret = document.createElement("span"); caret.className = "caret"; aiReply.after(caret);
      whenIn(guide, () => {
        let i = 0;
        setTimeout(function type() {
          i += 2; aiReply.textContent = full.slice(0, i);
          if (i < full.length) setTimeout(type, 28);
        }, 1400);
      });
    }
  }

  /* Kurva lupa Ebbinghaus */
  const FORGET = [["20 menit", 1 / 3, 58.2], ["1 jam", 1, 44.2], ["9 jam", 8.8, 35.8], ["1 hari", 24, 33.7], ["2 hari", 48, 27.8], ["6 hari", 144, 25.4], ["31 hari", 744, 21.1]];
  const chartBox = $("#forget-chart");
  if (chartBox) {
    const W = 320, H = 170, L = 34, R = 12, T = 10, B = 26;
    const lx = (h) => L + ((Math.log10(h) - Math.log10(0.25)) / (Math.log10(1000) - Math.log10(0.25))) * (W - L - R);
    const ly = (v) => T + (1 - v / 60) * (H - T - B);
    const pts = FORGET.map((d) => [lx(d[1]), ly(d[2])]);
    const line = pts.map((p, i) => (i ? "L" : "M") + r1(p[0]) + " " + r1(p[1])).join("");
    const area = line + `L${r1(pts[pts.length - 1][0])} ${ly(0)}L${r1(pts[0][0])} ${ly(0)}Z`;
    const grid = [0, 20, 40, 60].map((v) => `<path class="ch-grid" d="M${L} ${r1(ly(v))}H${W - R}"/><text class="ch-tick" x="${L - 6}" y="${r1(ly(v)) + 3}" text-anchor="end">${v}%</text>`).join("");
    const xt = [[1, "1 jam"], [24, "1 hari"], [720, "1 bulan"]].map(([h, t]) => `<text class="ch-tick" x="${r1(lx(h))}" y="${H - 8}" text-anchor="middle">${t}</text>`).join("");
    chartBox.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik kurva lupa. Savings turun dari 58,2 persen setelah 20 menit menjadi 21,1 persen setelah 31 hari.">${grid}<path class="ch-axis" d="M${L} ${ly(0)}H${W - R}"/>${xt}<path class="ch-area" d="${area}"/><path class="ch-line" d="${line}" pathLength="1"/>${pts.map((p, i) => `<circle class="ch-dot" style="--i:${i}" cx="${r1(p[0])}" cy="${r1(p[1])}" r="4" tabindex="0" data-i="${i}" aria-label="${FORGET[i][0]}: ${String(FORGET[i][2]).replace(".", ",")} persen"/>`).join("")}<g class="ch-mark" id="ch-mark"><path class="ch-mline" d="M0 ${T}V${ly(0)}"/><g class="ch-mpt"><circle class="ch-mdot" r="6"/><text class="ch-mtext" y="-11" text-anchor="middle"></text></g></g></svg><div class="ch-tip" aria-hidden="true"></div>`;
    const tip = $(".ch-tip", chartBox), svg = $("svg", chartBox);
    const showTip = (dot) => {
      const d = FORGET[dot.dataset.i], sr = svg.getBoundingClientRect(), br = chartBox.getBoundingClientRect();
      tip.textContent = `${d[0]}: ${String(d[2]).replace(".", ",")}%`;
      tip.style.left = (sr.left - br.left + (dot.cx.baseVal.value / W) * sr.width) + "px";
      tip.style.top = (sr.top - br.top + (dot.cy.baseVal.value / H) * sr.height) + "px";
      tip.classList.add("show");
    };
    $$(".ch-dot", chartBox).forEach((dot) => {
      dot.addEventListener("pointerenter", () => showTip(dot));
      dot.addEventListener("focus", () => showTip(dot));
      dot.addEventListener("pointerleave", () => tip.classList.remove("show"));
      dot.addEventListener("blur", () => tip.classList.remove("show"));
    });
    /* Tombol H+1, H+3, dan seterusnya menunjuk titik di kurva */
    const NOTES = {
      24: "H+1. Tanpa diulang, sisa hasil belajar tinggal sekitar sepertiga. Ulangan pertama ini paling penting, cukup 15 menit.",
      72: "H+3. Ingatan masih menurun pelan. Coba jawab pertanyaan tanpa membuka catatan, lalu tandai bagian yang lupa.",
      168: "H+7. Seminggu kemudian, ulang bagian yang ditandai saja. Biasanya terasa jauh lebih cepat.",
      336: "H+14. Ingatan makin stabil. Jelaskan materinya dengan bahasamu sendiri, seolah mengajari adik tingkat.",
      720: "H+30. Tanpa diulang sama sekali, yang tersisa tinggal sekitar seperlima. Dengan ulangan berkala, materi siap dipakai saat ujian."
    };
    const valAt = (h) => {
      for (let i = 1; i < FORGET.length; i++) {
        const a = FORGET[i - 1], b = FORGET[i];
        if (h <= b[1]) return a[2] + (b[2] - a[2]) * ((Math.log(h) - Math.log(a[1])) / (Math.log(b[1]) - Math.log(a[1])));
      }
      return FORGET[FORGET.length - 1][2];
    };
    const mark = $("#ch-mark", chartBox), mpt = mark && $(".ch-mpt", mark), mtext = mark && $(".ch-mtext", mark);
    const daysBox = $("#review-days"), note = $("#review-note");
    let dayTouched = false;
    function pickDay(btn) {
      if (!btn || !mark) return;
      const h = Number(btn.dataset.h), v = valAt(h), exact = FORGET.find((d) => d[1] === h);
      const x = lx(h), y = ly(v);
      mark.classList.add("on");
      mark.style.transform = `translate(${r1(x)}px,0px)`;
      mpt.style.transform = `translate(0px,${r1(y)}px)`;
      mtext.textContent = `${btn.textContent} · ${exact ? String(exact[2]).replace(".", ",") : "±" + Math.round(v)}%`;
      mtext.setAttribute("text-anchor", x > W - 70 ? "end" : x < L + 40 ? "start" : "middle");
      if (daysBox) $$("button", daysBox).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      if (note && NOTES[h]) { note.classList.remove("swap"); void note.offsetWidth; note.textContent = NOTES[h]; note.classList.add("swap"); }
    }
    if (daysBox) daysBox.addEventListener("click", (e) => { const b = e.target.closest("button[data-h]"); if (b) { dayTouched = true; pickDay(b); } });
    const card = chartBox.closest(".guide") || chartBox;
    whenIn(card, () => setTimeout(() => { if (!dayTouched && daysBox) pickDay($("button[data-h]", daysBox)); }, reduce ? 0 : 2600));
    const tb = $("#forget-table");
    if (tb) tb.innerHTML = FORGET.map((d) => `<tr><td>${d[0]}</td><td>${String(d[2]).replace(".", ",")}%</td></tr>`).join("");
  }

  /* Jadwal mingguan */
  const week = $("#week");
  if (week) {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"], times = ["08", "10", "13", "16", "19"];
    const lab = { k1: "Kuliah", k2: "Studio", k3: "Ulang", k4: "Libur" };
    const plan = [
      ["k1", "k1", "k2", "k1", "k1", "k3", "k4"],
      ["k2", "k1", "k2", "k2", "k1", "k2", "k4"],
      ["k1", "k2", "k1", "k1", "k2", "", ""],
      ["k3", "k3", "k3", "k3", "k3", "k4", "k3"],
      ["", "k2", "", "k2", "", "k4", ""]
    ];
    let html = '<span></span>' + days.map((d) => `<span class="wh">${d}</span>`).join(""), n = 0;
    plan.forEach((row, r) => {
      html += `<span class="wt">${times[r]}</span>`;
      row.forEach((k) => { html += k ? `<span class="slot blk ${k}" style="--i:${n++}">${lab[k]}</span>` : '<span class="slot"></span>'; });
    });
    week.innerHTML = html;
  }

  /* Catatan singkat */
  const minis = $("#minis");
  $$("[data-minis]").forEach((b) => b.addEventListener("click", () => {
    if (!minis || !minis.firstElementChild) return;
    minis.scrollBy({ left: (b.dataset.minis === "next" ? 1 : -1) * (minis.firstElementChild.offsetWidth + 16), behavior: reduce ? "auto" : "smooth" });
  }));

  /* Tab software */
  const tabs = $$(".tool-tab");
  function selectTab(t, focus) {
    tabs.forEach((x) => {
      const on = x === t, panel = document.getElementById(x.getAttribute("aria-controls"));
      x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
      if (panel) { panel.hidden = !on; if (on) { panel.classList.remove("enter"); void panel.offsetWidth; panel.classList.add("enter"); } }
    });
    if (focus) t.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      let n = -1;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n < 0) return;
      e.preventDefault(); selectTab(tabs[n], true);
    });
  });

  /* Gambaran Discord: nama server dari data.js, obrolan berganti tiap edisi */
  const SPEAKER = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7l-1-1a3.6 3.6 0 0 0 0-5l1-1Z"/></svg>';
  const dcMsgs = $("#dc-msgs"), dcHost = dcMsgs && dcMsgs.closest(".discord");
  let dcTimers = [];
  function renderDiscord() {
    const D = S.discord || {}, side = $("#dc-side"), txt = D.text || [], room = txt[txt.length - 1];
    if (side && D.server) {
      side.innerHTML = `<div class="dc-server">${esc(D.server)}</div><span class="dc-group">Teks</span>${txt.map((c) => `<span class="dc-ch${c === room ? " on" : ""}"><span class="h">#</span>${esc(c)}</span>`).join("")}${D.voice ? `<span class="dc-group">Suara</span><span class="dc-ch">${SPEAKER}${esc(D.voice)}</span><span class="dc-voice"><span class="dc-av talk">MR</span>${esc(nick)}</span><span class="dc-voice"><span class="dc-av b">KM</span>Kamu</span>` : ""}`;
      const tt = $("#dc-title"), inp = $("#dc-input");
      if (room && tt) tt.innerHTML = `<span style="opacity:.6">#</span>${esc(room)}`;
      if (room && inp) inp.textContent = `Kirim pesan ke #${room}`;
    }
    if (!dcMsgs) return;
    const chat = season.chat || [];
    if (chat.length) dcMsgs.innerHTML = chat.map(([who, time, text]) => {
      const me = who === nick;
      return `<div class="dc-msg"><span class="dc-av${me ? "" : " b"}">${me ? "MR" : who === "Kamu" ? "KM" : esc(initials(who))}</span><div><b>${esc(who)} <small>${esc(time)}</small></b><p>${esc(text)}</p></div></div>`;
    }).join("");
    dcTimers.forEach(clearTimeout); dcTimers = [];
    if (dcHost) whenIn(dcHost, () => $$(".dc-msg", dcMsgs).forEach((m, i) => dcTimers.push(setTimeout(() => m.classList.add("show"), reduce ? 0 : 500 + i * 1200))));
  }

  /* Buku terbuka pelan saat di-scroll */
  const bookOpen = $("#book-open");
  if (bookOpen) {
    const spot = bookOpen.closest(".book-spot") || bookOpen;
    if (reduce) bookOpen.style.setProperty("--open", ".6");
    else scrollFns.push(() => {
      const r = spot.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50) return;
      const o = clamp(((innerHeight - r.top) / (innerHeight + r.height) - 0.22) / 0.36);
      bookOpen.style.setProperty("--open", (o * o * (3 - 2 * o)).toFixed(3));
    });
  }

  /* Cara pesan: struk mengikuti langkah */
  const receipt = $("#receipt"), osSteps = $$(".os-step"), osDots = $$("#os-dots i");
  if (receipt && osSteps.length) {
    const setStep = (s) => {
      receipt.dataset.s = s;
      osSteps.forEach((st) => st.classList.toggle("active", st.dataset.s === s));
      osDots.forEach((d, i) => d.classList.toggle("on", i < Number(s)));
    };
    if (hasIO) {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) setStep(en.target.dataset.s); }), { rootMargin: "-42% 0px -48% 0px" });
      osSteps.forEach((st) => io.observe(st));
    } else setStep("4");
  }
  const qr = $("#rc-qr");
  if (qr) {
    const N = 25, cells = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const finder = (x, y) => (x >= 0 && x < 7 && y >= 0 && y < 7) ? (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) : null;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let f = finder(x, y); if (f === null) f = finder(x - (N - 7), y); if (f === null) f = finder(x, y - (N - 7));
      const inZone = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
      const on = f !== null ? f : !inZone && rnd() > 0.52;
      if (on) cells.push(`M${x} ${y}h1v1h-1z`);
    }
    qr.innerHTML = `<path fill="currentColor" d="${cells.join("")}"/>`;
  }

  /* ---------------------------------------------------------
     8. Keranjang dan checkout (QRIS + konfirmasi WhatsApp)
     --------------------------------------------------------- */
  const sheetEl = $("#sheet");
  let cart = store.get("mr-cart", []).filter((i) => i && catalog[i.id] && catalog[i.id].price > 0 && !catalog[i.id].soon && i.qty > 0);
  let currentOrder = null;
  const subtotal = () => cart.reduce((a, i) => a + priceOf(catalog[i.id]) * i.qty, 0);
  /* Kode promo dari data.js (promoCodes). Kodenya terbaca di sumber halaman, jadi cek lagi kodenya di pesan WhatsApp. */
  const promos = (S.promoCodes || []).filter((c) => c && c.code && c.percent > 0);
  let promoEl = null;
  function promoFor(raw) {
    const k = String(raw || "").trim().toUpperCase();
    if (!k) return null;
    const c = promos.find((x) => String(x.code).toUpperCase() === k && (!x.from || String(x.from) <= todayStr()) && isActive(x.until));
    return c ? { code: k, percent: Math.min(100, c.percent) } : false;
  }
  const promoCut = (sub, p) => (p ? Math.round((sub * p.percent) / 100 / 100) * 100 : 0);
  function formSummary() {
    const fs = $("#form-summary");
    if (!fs) return;
    const p = promoEl ? promoFor(promoEl.value) : null, sub = subtotal(), cut = promoCut(sub, p);
    fs.innerHTML = `<div class="summary">${cart.map(lineHTML).join("")}${totalRow()}${p ? `<div class="summary-row"><span>Kode promo ${esc(p.code)} (${p.percent}%)</span><span>-${rupiah(cut)}</span></div><div class="summary-row total"><span>Setelah promo</span><span>${rupiah(sub - cut)}</span></div>` : ""}</div>`;
  }
  function saveCart(bump) {
    store.set("mr-cart", cart);
    const c = $("#cart-count");
    if (c) {
      c.textContent = cart.reduce((a, i) => a + i.qty, 0);
      if (bump) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    }
  }
  /* Produk terbang ke keranjang: sampul mini melayang ke tombol Keranjang di header, lalu angkanya memantul saat mendarat. */
  function flyToCart(from, done) {
    const target = $("#cart-btn");
    const calm = reduce || root.classList.contains("calm");
    if (calm || !from || !target || typeof document.body.animate !== "function") { done(); return; }
    const book = from.closest(".product") ? $(".book", from.closest(".product")) : null;
    const src = book || from;
    const a = src.getBoundingClientRect(), b = target.getBoundingClientRect();
    if (!a.width || !b.width || b.bottom < 0 || b.top > innerHeight || a.bottom < 0 || a.top > innerHeight) { done(); return; }
    const w = book ? Math.min(a.width, 150) : 46, h = book ? w * 1.5 : 46;
    const x0 = a.left + a.width / 2 - w / 2, y0 = a.top + a.height / 2 - h / 2;
    const dx = b.left + b.width / 2 - (x0 + w / 2), dy = b.top + b.height / 2 - (y0 + h / 2);
    const outer = document.createElement("div"), inner = document.createElement("div");
    outer.className = "fly-item";
    outer.setAttribute("aria-hidden", "true");
    outer.style.cssText = `left:${x0}px;top:${y0}px;width:${w}px;height:${h}px`;
    inner.className = "fly-inner" + (book ? "" : " fly-chip");
    if (book) { const c = book.cloneNode(true); c.removeAttribute("style"); inner.appendChild(c); }
    else inner.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17l9-10"/></svg>';
    outer.appendChild(inner);
    document.body.appendChild(outer);
    const dur = Math.min(900, 560 + Math.hypot(dx, dy) * 0.35), end = Math.max(0.16, 30 / w);
    // Gerak mendatar dan tegak dipisah supaya lintasannya melengkung seperti dilempar
    outer.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], { duration: dur, easing: "cubic-bezier(.35,0,.6,1)", fill: "forwards" });
    const anim = inner.animate([
      { transform: "translateY(0) scale(1) rotate(0)", opacity: 1 },
      { transform: `translateY(${Math.max(40, h * 0.25)}px) scale(.82) rotate(-10deg)`, opacity: 1, offset: 0.18 },
      { transform: `translateY(${dy}px) scale(${end}) rotate(14deg)`, opacity: 0.35 }
    ], { duration: dur, easing: "cubic-bezier(.55,0,.75,.45)", fill: "forwards" });
    let finished = false;
    const finish = () => { if (finished) return; finished = true; outer.remove(); target.classList.remove("catch"); void target.offsetWidth; target.classList.add("catch"); done(); };
    anim.onfinish = finish;
    setTimeout(finish, dur + 300);
  }
  function addToCart(id, from) {
    const p = catalog[id];
    if (!p || !p.price) return;
    if (p.soon) { toast(`${p.title} masih coming soon`); return; }
    const item = cart.find((i) => i.id === id);
    if (item) {
      if (p.unit === "program") { toast("Program ini sudah ada di keranjang"); return; }
      item.qty += 1;
    } else cart.push({ id, qty: 1 });
    currentOrder = null;
    store.set("mr-cart", cart); renderCart();
    flyToCart(from, () => { saveCart(true); toast(`${p.title} masuk keranjang`); });
  }
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { e.preventDefault(); addToCart(add.dataset.add, add); }
  });

  function lineHTML(i) {
    const p = catalog[i.id], d = discountFor(p);
    return `<div class="summary-row"><span>${esc(p.title)}${i.qty > 1 ? " × " + i.qty : ""}${d ? ` <small>(hemat ${d.percent}%)</small>` : ""}</span><span>${rupiah(priceOf(p) * i.qty)}</span></div>`;
  }
  const totalRow = () => `<div class="summary-row total"><span>Subtotal</span><span>${rupiah(subtotal())}</span></div>`;
  function renderCart() {
    const box = $("#cart-content");
    if (!box) return;
    if (!cart.length) {
      box.innerHTML = '<div class="empty-cart"><b>Keranjangmu masih kosong</b><span>Mulai dari yang gratis dulu juga boleh. Kalau ada yang cocok, tinggal tekan Tambah.</span><button class="btn primary small" type="button" data-close-to="#toko">Lihat toko</button></div>';
      return;
    }
    box.innerHTML = `<ul class="cart-list">${cart.map((i) => {
      const p = catalog[i.id], d = discountFor(p);
      return `<li class="cart-item">
        <div><h3>${esc(p.title)}</h3><span class="sku">${esc(p.sku)}${d ? ` · hemat ${d.percent}%` : ""}</span></div>
        <div class="line-price">${rupiah(priceOf(p) * i.qty)}</div>
        ${p.unit === "program" ? '<span class="small-note">1 program</span>' : `<div class="qty" aria-label="Jumlah"><button type="button" data-dec="${esc(i.id)}" aria-label="Kurangi">−</button><output>${i.qty}</output><button type="button" data-inc="${esc(i.id)}" aria-label="Tambah">+</button></div>`}
        <button class="remove" type="button" data-remove="${esc(i.id)}">Hapus</button>
      </li>`;
    }).join("")}</ul>
    <div class="summary">${totalRow()}<p class="small-note">Kode unik ditambahkan saat pesanan dibuat.</p></div>
    <button class="btn primary block" type="button" data-go="form" style="margin-top:14px">Lanjut isi data</button>`;
  }
  const cartContent = $("#cart-content");
  if (cartContent) cartContent.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const id = t.dataset.inc || t.dataset.dec || t.dataset.remove;
    if (t.dataset.inc) cart.find((i) => i.id === id).qty += 1;
    else if (t.dataset.dec) { const it = cart.find((i) => i.id === id); it.qty -= 1; if (it.qty < 1) cart = cart.filter((i) => i.id !== id); }
    else if (t.dataset.remove) cart = cart.filter((i) => i.id !== id);
    else if (t.dataset.closeTo) { const to = t.dataset.closeTo; closeSheet(); if (!document.getElementById(to) && PAGE_OF[to]) location.href = PAGE_OF[to]; else location.hash = to; return; }
    else return;
    currentOrder = null;
    saveCart(); renderCart();
  });

  const titles = { cart: "Keranjang", form: "Data pemesan", pay: "Bayar dengan QRIS" };
  function showStep(step) {
    if (!sheetEl) return;
    $$("[data-step]", sheetEl).forEach((s) => { s.hidden = s.dataset.step !== step; });
    const idx = ["cart", "form", "pay"].indexOf(step);
    $$(".stepper span", sheetEl).forEach((s, i) => s.classList.toggle("on", i <= idx));
    const t = $("#sheet-title"); if (t) t.textContent = titles[step];
    if (step === "form") formSummary();
    const body = $(".sheet-body", sheetEl); if (body) body.scrollTop = 0;
  }
  function openSheet(step) {
    if (!sheetEl) return;
    renderCart(); showStep(step || "cart");
    if (!sheetEl.open) { if (typeof sheetEl.showModal === "function") sheetEl.showModal(); else sheetEl.setAttribute("open", ""); }
  }
  function closeSheet() { if (!sheetEl) return; if (typeof sheetEl.close === "function") sheetEl.close(); else sheetEl.removeAttribute("open"); }
  const cartBtn = $("#cart-btn");
  if (cartBtn) cartBtn.addEventListener("click", () => openSheet(currentOrder ? "pay" : "cart"));
  const sheetClose = $("#sheet-close");
  if (sheetClose) sheetClose.addEventListener("click", closeSheet);
  if (sheetEl) sheetEl.addEventListener("click", (e) => {
    if (e.target === sheetEl) { closeSheet(); return; }
    const go = e.target.closest("[data-go]");
    if (go) { if (go.dataset.go === "form" && !cart.length) return; showStep(go.dataset.go); }
  });

  function setErr(input, errEl, bad) { if (errEl) errEl.hidden = !bad; if (bad) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
  function makeOrderId() { const d = new Date(); return `MR-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`; }
  const orderForm = $("#order-form");
  /* Pesanan masuk ke tab Pesanan di Google Sheet lewat Apps Script (orderEndpoint di data.js).
     Script TIDAK mengirim email saat pesanan dibuat. File baru terkirim setelah pemilik mencentang Lunas di Sheet. */
  const orderEp = S.orderEndpoint || "";
  const emailRe = /^[^\s@=+\-][^\s@]*@[^\s@]+\.[^\s@]{2,}$/;
  const emailEl = $("#o-email");
  if (emailEl) {
    const opt = emailEl.parentNode.querySelector(".opt");
    if (opt && orderEp) opt.textContent = "(isi supaya file terkirim otomatis)";
    const er = document.createElement("span");
    er.className = "err"; er.id = "o-email-err"; er.hidden = true;
    er.textContent = "Format email belum benar. Contoh: nama@gmail.com";
    emailEl.insertAdjacentElement("afterend", er);
    emailEl.addEventListener("input", () => setErr(emailEl, er, false));
  }
  function sendOrder(o) {
    if (!orderEp) return;
    const body = new URLSearchParams({
      id: o.id, nama: o.name, wa: o.wa, email: o.email,
      pesanan: o.items.map((it) => `${it.title}${it.qty > 1 ? " x" + it.qty : ""}`).join(", "),
      sku: o.items.map((it) => `${it.sku}${it.qty > 1 ? " x" + it.qty : ""}`).join(","),
      total: String(o.total), kode: String(o.code || ""), promo: o.promo ? o.promo.code : "", website: ""
    });
    // no-cors: Apps Script tetap menerima datanya, hanya balasannya yang tidak bisa dibaca browser
    try { fetch(orderEp, { method: "POST", mode: "no-cors", body, keepalive: true }).catch(() => {}); } catch (e) { /* abaikan, konfirmasi tetap lewat WhatsApp */ }
  }
  if (orderForm && promos.length) {
    const f = document.createElement("div");
    f.className = "field";
    f.innerHTML = '<label for="o-promo">Kode promo <span class="opt">(opsional)</span></label><input id="o-promo" name="o-promo" autocomplete="off" autocapitalize="characters" spellcheck="false"><span class="err" id="o-promo-err" hidden>Kode promo tidak dikenal atau sudah tidak berlaku.</span>';
    orderForm.insertBefore(f, $("#form-summary"));
    promoEl = $("#o-promo");
    promoEl.addEventListener("input", () => { setErr(promoEl, $("#o-promo-err"), false); formSummary(); });
  }
  if (orderForm) orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameEl = $("#o-name"), waEl = $("#o-wa");
    const name = nameEl.value.trim(), wa = normPhone(waEl.value);
    setErr(nameEl, $("#o-name-err"), !name);
    setErr(waEl, $("#o-wa-err"), !wa);
    if (!name) { nameEl.focus(); return; }
    if (!wa) { waEl.focus(); return; }
    const mail = emailEl ? emailEl.value.trim().toLowerCase() : "";
    if (emailEl) { setErr(emailEl, $("#o-email-err"), !!mail && !emailRe.test(mail)); if (mail && !emailRe.test(mail)) { emailEl.focus(); return; } }
    if (!cart.length) { showStep("cart"); return; }
    const promo = promoEl ? promoFor(promoEl.value) : null;
    if (promo === false) { setErr(promoEl, $("#o-promo-err"), true); promoEl.focus(); return; }
    const sub = subtotal(), cut = promoCut(sub, promo);
    const code = S.payment && S.payment.uniqueCode === false ? 0 : Math.floor(Math.random() * 199) + 1;
    currentOrder = {
      id: makeOrderId(), name, wa, email: mail, note: ($("#o-note") || {}).value ? $("#o-note").value.trim() : "",
      items: cart.map((i) => { const p = catalog[i.id], d = discountFor(p); return { sku: p.sku, title: p.title, qty: i.qty, price: priceOf(p), off: d ? d.percent : 0 }; }),
      subtotal: sub, promo: promo ? { code: promo.code, percent: promo.percent, cut } : null, code, total: sub - cut + code, createdAt: new Date().toISOString()
    };
    store.set("mr-last-order", currentOrder);
    sendOrder(currentOrder);
    renderPay(currentOrder); showStep("pay");
  });
  ["#o-name", "#o-wa"].forEach((s) => { const i = $(s); if (i) i.addEventListener("input", () => { i.removeAttribute("aria-invalid"); const er = $(s + "-err"); if (er) er.hidden = true; }); });

  function orderMessage(o) {
    const lines = o.items.map((it, i) => `${i + 1}. ${it.title} (${it.sku})${it.qty > 1 ? " x" + it.qty : ""}: ${rupiah(it.price * it.qty)}${it.off ? ` (hemat ${it.off}%)` : ""}`);
    return [
      `${greet}, aku mau konfirmasi pembayaran.`, "",
      `No. pesanan: ${o.id}`, `Nama: ${o.name}`, `WhatsApp: ${o.wa}`, o.email ? `Email: ${o.email}` : null, "",
      "Pesanan:", ...lines, "",
      `Subtotal: ${rupiah(o.subtotal)}`, o.promo ? `Kode promo: ${o.promo.code} (hemat ${o.promo.percent}%): -${rupiah(o.promo.cut)}` : null, o.code ? `Kode unik: ${o.code}` : null, `Total dibayar: ${rupiah(o.total)}`,
      o.note ? "" : null, o.note ? `Catatan: ${o.note}` : null, "",
      "Bukti bayar QRIS aku lampirkan di pesan berikutnya."
    ].filter((l) => l !== null).join("\n");
  }
  /* Nominal berputar seperti odometer, lalu tiga angka terakhir menyala supaya tidak lupa diketik. */
  let odoTimer = 0;
  function odometer(el, total, hot) {
    const txt = rupiah(total), lastDigits = [];
    txt.replace(/\d/g, (d, i) => { lastDigits.push(i); return d; });
    const hotFrom = hot ? lastDigits[Math.max(0, lastDigits.length - 3)] : Infinity;
    const plain = `<span class="odo-num">${txt.slice(0, hotFrom === Infinity ? txt.length : hotFrom)}</span>${hot ? `<span class="odo-hot">${txt.slice(hotFrom)}</span>` : ""}`;
    el.setAttribute("aria-label", txt);
    clearTimeout(odoTimer);
    if (reduce || root.classList.contains("calm")) { el.innerHTML = plain; el.classList.toggle("lit", !!hot); return; }
    let k = 0;
    const reel = "01234567890123456789".split("").join("<br>");
    const cells = (part) => part.split("").map((ch) => /\d/.test(ch) ? `<span class="odo-d"><span class="odo-reel" style="--n:${10 + Number(ch)};--j:${k++}">${reel}</span></span>` : `<span class="odo-sep">${ch}</span>`).join("");
    el.classList.remove("lit", "spin");
    const head = cells(txt.slice(0, hotFrom === Infinity ? txt.length : hotFrom));
    el.innerHTML = `<span class="odo-num" aria-hidden="true">${head}</span>${hot ? `<span class="odo-hot" aria-hidden="true">${cells(txt.slice(hotFrom))}</span>` : ""}`;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("spin")));
    odoTimer = setTimeout(() => { el.classList.remove("spin"); el.innerHTML = plain; el.classList.toggle("lit", !!hot); }, 1100 + k * 110 + 250);
  }
  function renderPay(o) {
    const set = (id, v) => { const n = $(id); if (n) n.textContent = v; };
    set("#pay-id", o.id);
    const totalEl = $("#pay-total");
    if (totalEl) {
      odometer(totalEl, o.total, !!o.code);
      let hint = $("#pay-hint");
      if (!hint) { hint = document.createElement("p"); hint.id = "pay-hint"; hint.className = "odo-hint"; totalEl.insertAdjacentElement("afterend", hint); }
      hint.hidden = !o.code;
      hint.textContent = "Tiga angka yang menyala ikut diketik";
    }
    const steps = $(".pay-steps", sheetEl || document);
    if (steps) {
      let mailNote = $("#pay-mail");
      if (!mailNote) { mailNote = document.createElement("p"); mailNote.id = "pay-mail"; mailNote.className = "pay-mail"; steps.insertAdjacentElement("beforebegin", mailNote); }
      mailNote.hidden = !orderEp;
      mailNote.textContent = o.email ? `File dikirim otomatis ke ${o.email} setelah pembayaranmu kucek. Kalau belum ada di kotak masuk, cek juga folder Spam.` : "File dikirim lewat WhatsApp setelah pembayaranmu kucek.";
    }
    const parts = [`Harga ${rupiah(o.subtotal)}`];
    if (o.promo) parts.push(`dikurangi promo ${o.promo.code} ${rupiah(o.promo.cut)}`);
    if (o.code) parts.push(`ditambah kode unik ${o.code}`);
    set("#pay-breakdown", parts.length > 1 ? `${parts.join(", ")}.${o.code ? " Kode unik membantu mencocokkan pembayaranmu." : ""}` : "Total sesuai pesanan.");
    const slot = $("#qris-slot");
    if (slot) slot.innerHTML = S.payment && S.payment.qrisImage
      ? `<img class="qris-img" src="${esc(S.payment.qrisImage)}" alt="Kode QRIS untuk pembayaran">`
      : '<div class="qris-placeholder"><b>QRIS</b><span>Gambar QRIS tampil di sini setelah payment.qrisImage diisi di data.js.</span></div>';
    set("#qris-merchant", S.payment && S.payment.merchantName ? `a.n. ${S.payment.merchantName}` : "");
    const msg = orderMessage(o);
    set("#msg-preview", msg);
    const wa = $("#wa-confirm"); if (wa) wa.href = waLink(msg);
    set("#wa-target", waNumber() ? "" : "Nomor WhatsApp admin belum diisi, jadi WhatsApp akan memintamu memilih kontak tujuan.");
  }
  async function copyText(text, btn, fallbackEl) {
    const label = btn.textContent;
    try { await navigator.clipboard.writeText(text); btn.textContent = "Tersalin"; }
    catch (e) {
      if (fallbackEl) { const r = document.createRange(); r.selectNodeContents(fallbackEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      btn.textContent = "Tandai lalu salin manual";
    }
    setTimeout(() => { btn.textContent = label; }, 1800);
  }
  const copyTotal = $("#copy-total"), copyMsg = $("#copy-msg"), finish = $("#finish");
  if (copyTotal) copyTotal.addEventListener("click", (e) => currentOrder && copyText(String(currentOrder.total), e.currentTarget, $("#pay-total")));
  if (copyMsg) copyMsg.addEventListener("click", (e) => currentOrder && copyText(orderMessage(currentOrder), e.currentTarget, $("#msg-preview")));
  if (finish) finish.addEventListener("click", () => {
    const id = currentOrder && currentOrder.id;
    cart = []; currentOrder = null; saveCart(); renderCart(); closeSheet();
    if (orderForm) orderForm.reset();
    toast(id ? `Terima kasih. Simpan nomor pesanan ${id}` : "Keranjang dikosongkan");
  });

  /* ---------------------------------------------------------
     8b. Pencari "cocok untukmu" (toko.html #cocok)
     Tiga pilihan singkat, lalu saran dari yang gratis dulu. Produk dicocokkan lewat kata di judul dan deskripsinya,
     jadi produk baru di data.js ikut tersaring tanpa mengubah file ini.
     --------------------------------------------------------- */
  const finderEl = $("#cocok");
  if (finderEl) {
    const FREE_PAGES = {
      efektif: ["Belajar efektif", "belajar.html#belajar-efektif", "Active recall dan jadwal ulang supaya materi kuliah tidak cepat hilang."],
      posisi: ["Lembar rasa dan data", "belajar.html#posisi", "Latihan menjawab pertanyaan kenapa dari dosen dengan data."],
      tools: ["Alat kerjaku", "tentang.html#tools", "Software yang kupakai dan urutan belajarnya."],
      ai: ["Belajar AI", "belajar.html#belajar-ai", "Memakai AI sebagai teman diskusi, bukan pengganti nalar."],
      gratis: ["Ilmu yang kubagikan gratis", "belajar.html#belajar", "Newsletter, Discord, dan catatan singkat untuk hidup kuliah."],
      discord: ["Kelas Sabtu di Discord", "belajar.html#belajar", "Kelas bareng gratis tiap Sabtu malam dan tanya jawab tugas."]
    };
    const NEEDS = {
      ujian: { label: "Ujian teori", re: /ujian|soal|sejarah|pancasila/i, free: ["efektif", "discord"], prog: /cara belajar|konsultasi/i },
      asistensi: { label: "Asistensi dan riset", re: /asistensi|metodologi|alasan desain|riset|logbook/i, free: ["posisi", "discord"], prog: /asistensi|ergonomi/i },
      ergonomi: { label: "Ergonomi dan ukuran", re: /ergonomi|antropometri|dimensi manusia/i, free: ["posisi", "discord"], prog: /ergonomi/i },
      software: { label: "Software desain", re: /sketchup|autocad|figma|software|\b3d\b/i, free: ["tools", "discord"], prog: /sketchup|autocad|software/i },
      waktu: { label: "Atur waktu dan belajar", re: /jadwal|tujuan|notion|kebiasaan|cara belajar/i, free: ["efektif", "gratis"], prog: /cara belajar|notion/i },
      ai: { label: "Pakai AI dengan benar", re: /\bai\b/i, free: ["ai", "discord"], prog: /\bai\b/i },
      dasar: { label: "Dasar desain interior", re: /basic|dasar desain|sistem bangunan|mebel berkelanjutan|sustainable/i, free: ["gratis", "discord"], prog: null }
    };
    const QS = [
      { key: "lvl", title: "Posisimu sekarang", opts: [["s12", "Semester 1 sampai 2"], ["s36", "Semester 3 sampai 6"], ["s7", "Semester 7 ke atas"], ["umum", "Dosen atau umum"]] },
      { key: "need", title: "Yang sedang terasa berat", opts: Object.entries(NEEDS).map(([k, v]) => [k, v.label]) },
      { key: "mode", title: "Cara yang kamu mau", opts: [["gratis", "Yang gratis dulu"], ["dukung", "Beli sekalian dukung"], ["bimbing", "Dibimbing langsung"]] }
    ];
    const body = $("#fd-body", finderEl), startBtn = $("#fd-start", finderEl);
    let ans = {}, qi = 0;
    const text = (p) => [p.title, p.desc, p.subject, p.format].join(" ");
    function pick() {
      const need = NEEDS[ans.need] || NEEDS.dasar, out = [];
      const okLvl = (p) => ans.lvl === "s12" || p.cat !== MABA_CAT;
      const matches = products.filter((p) => okLvl(p) && need.re.test(text(p)));
      const freeProds = matches.filter((p) => !p.price && !p.soon);
      const paid = matches.filter((p) => p.price > 0).sort((a, b) => (!!a.soon - !!b.soon) || priceOf(a) - priceOf(b));
      const prog = need.prog ? programs.filter((p) => need.prog.test(p.title)).sort((a, b) => !!a.soon - !!b.soon)[0] : null;
      const freeList = freeProds.map((p) => ({ kind: "free", p })).concat(need.free.map((k) => ({ kind: "page", page: FREE_PAGES[k] })));
      if (ans.mode === "gratis") out.push(...freeList.slice(0, 3));
      else if (ans.mode === "dukung") { out.push(freeList[0]); paid.slice(0, 2).forEach((p) => out.push({ kind: "paid", p })); }
      else { out.push(freeList[0]); if (prog) out.push({ kind: "prog", p: prog }); else out.push({ kind: "ask" }); if (paid[0]) out.push({ kind: "paid", p: paid[0] }); }
      if (out.length < 2) out.push(...freeList.slice(1, 3 - out.length + 1));
      return out.filter(Boolean).slice(0, 3);
    }
    function cardHTML(r, i) {
      const wrap = (tag, cls, title, desc, act) => `<article class="fd-card enter" style="--i:${i}"><span class="fd-tag ${cls}">${tag}</span><h4>${esc(title)}</h4><p>${esc(desc)}</p><div class="fd-act">${act}</div></article>`;
      if (r.kind === "page") return wrap("Gratis", "free", r.page[0], r.page[2], `<a class="btn sky small" href="${esc(r.page[1])}">Buka</a>`);
      if (r.kind === "ask") return wrap("Tanya dulu", "prog", "Ngobrol singkat lewat WhatsApp", "Ceritakan kesulitanmu dulu. Nanti kita cari jalan keluar yang paling pas.", `<a class="btn soft small" href="${esc(waLink(`${greet}, aku mau tanya soal ${NEEDS[ans.need].label.toLowerCase()}.`))}" target="_blank" rel="noopener">Chat aku</a>`);
      const p = r.p, d = discountFor(p);
      if (r.kind === "free") return wrap("Gratis", "free", p.title, p.desc, freeButton(p, "btn sky small", "Ambil gratis"));
      if (p.soon) return wrap("Coming soon", "soon", p.title, p.desc, `<a class="btn soft small" href="${esc(waLink(`${greet}, kabari aku kalau "${p.title}" sudah siap ya.`))}" target="_blank" rel="noopener">Kabari aku</a>`);
      const tag = r.kind === "prog" ? `Bimbel · ${rupiah(priceOf(p))}` : `${d ? `Hemat ${d.percent}% · ` : ""}${rupiah(priceOf(p))}`;
      return wrap(tag, r.kind === "prog" ? "prog" : "paid", p.title, p.desc || (r.kind === "prog" ? "Dibimbing langsung lewat Discord, jadwalnya kita atur bareng." : ""), `<button class="btn primary small" type="button" data-add="${esc(p.id)}">${r.kind === "prog" ? "Daftar" : "Tambah"}</button>`);
    }
    function render() {
      if (qi < QS.length) {
        const q = QS[qi];
        body.innerHTML = `<div class="fd-q" role="group" aria-labelledby="fd-qt"><div class="fd-prog" aria-hidden="true">${QS.map((_, i) => `<i class="${i <= qi ? "on" : ""}"></i>`).join("")}</div>
          <p class="fd-step">Langkah ${qi + 1} dari ${QS.length}</p><h3 id="fd-qt">${esc(q.title)}</h3>
          <div class="fd-opts">${q.opts.map(([k, v], i) => `<button type="button" class="chip enter" style="--i:${i}" data-fd="${esc(k)}" aria-pressed="${ans[q.key] === k}">${esc(v)}</button>`).join("")}</div>
          ${qi ? '<button type="button" class="link-btn" data-fd-back>Kembali</button>' : ""}</div>`;
        const first = $("[data-fd]", body); if (first && body.dataset.focus) first.focus();
        return;
      }
      body.innerHTML = `<div class="fd-res"><p class="fd-step">Saran untukmu</p><div class="fd-grid">${pick().map(cardHTML).join("")}</div>
        <p class="fd-note">Sengaja dimulai dari yang gratis. Beli kalau memang terasa butuh, bukan karena ikut-ikutan.</p>
        <button type="button" class="link-btn" data-fd-again>Ulangi dari awal</button></div>`;
    }
    if (startBtn && body) startBtn.addEventListener("click", () => {
      ans = {}; qi = 0; body.hidden = false; body.dataset.focus = "1"; startBtn.hidden = true; render();
    });
    if (body) body.addEventListener("click", (e) => {
      const b = e.target.closest("[data-fd]");
      if (b) { ans[QS[qi].key] = b.dataset.fd; b.setAttribute("aria-pressed", "true"); qi += 1; setTimeout(render, 160); return; }
      if (e.target.closest("[data-fd-back]")) { qi = Math.max(0, qi - 1); render(); return; }
      if (e.target.closest("[data-fd-again]")) { ans = {}; qi = 0; render(); }
    });
  }

  /* ---------------------------------------------------------
     9. Mulai
     --------------------------------------------------------- */
  function applySeason(key) {
    seasonKey = key;
    season = (S.seasons || {})[key] || {};
    renderSeason(); renderPrograms(); renderEventStrip(); renderFilters(); renderProducts(); renderMaba(); renderBookSpot(); renderDiscord();
    if (sheetEl && sheetEl.open) renderCart();
    particles.setKind(key);
  }
  applySeason(seasonKey);
  saveCart(); renderCart();
  bindTilt(document);
  observeAll();
  runScroll();
})();
