# -*- coding: utf-8 -*-
"""Membuat pameran.html, kursi-*.html, dan assets/js/pameran-data.js dari chairs.py.
Header, footer, dan dialog diambil dari karya.html supaya selalu sama dengan situs."""
import html, json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from chairs import CHAIRS, BY_SLUG, PRICE, WASTE, MARGIN, WEAVES, rab_baris, SUASANA, SUASANA_URUT  # noqa

# Akar repo: dua tingkat di atas folder ini (tools/pameran/). Bisa ditimpa dengan variabel lingkungan REPO.
REPO = os.environ.get("REPO") or os.path.abspath(os.path.join(HERE, "..", ".."))
if not os.path.exists(os.path.join(REPO, "karya.html")):
    REPO = "/home/claude/raficrafty/musholirafi-web"
SITE = "https://musholirafi.my.id"

def E(s):
    return html.escape(str(s), quote=True)

def fmt(n, d=0):
    s = f"{n:,.{d}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")

def rp(n):
    return "Rp " + fmt(round(n))

def exists(rel):
    return os.path.exists(os.path.join(REPO, rel))

# ------------------------------------------------------------------ cetakan dari karya.html
SRC = open(os.path.join(REPO, "karya.html"), encoding="utf-8").read()
HEAD_SCRIPT = re.search(r"<script>\(function\(d\).*?</script>", SRC, re.S).group(0)
BODY_TOP = SRC[SRC.index("<body>"):SRC.index('<main id="konten">')]
BODY_BOTTOM = SRC[SRC.index("</main>") + len("</main>"):].replace('<a href="#karya">Karya dan riset</a>', '<a href="karya.html">Karya dan riset</a>')
FONTS = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..800,0..100,0..1&family=Martian+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"

def head(title, desc, path, og, scripts):
    t, d = E(title), E(desc)
    url = f"{SITE}/{path}"
    img = f"{SITE}/{og}"
    return f"""<!doctype html>
<html lang="id" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{t}</title>
<meta name="description" content="{d}">
<meta name="author" content="Musholi Rafi">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#FBF7F1" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#13111B" media="(prefers-color-scheme: dark)">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="icon" href="assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:locale" content="id_ID">
<meta property="og:site_name" content="Musholi Rafi">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{img}">
{HEAD_SCRIPT}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/pameran.css">
<script src="assets/js/data.js" defer></script>
<script src="assets/js/main.js" defer></script>
{scripts}
</head>
"""

CHAIR_SCRIPTS = "\n".join(f'<script src="{s}" defer></script>' for s in [
    "assets/js/pameran-data.js", "assets/vendor/three.min.js", "assets/js/pameran-3d.js", "assets/js/pameran-sambungan.js", "assets/js/pameran.js", "assets/js/pameran-suasana.js"])

def page(headhtml, main):
    return headhtml + BODY_TOP + main + "\n" + BODY_BOTTOM

# ------------------------------------------------------------------ potongan kecil
EV = {
    "GK": ("ukur", "Ukur GK", "Ukur GK: diambil dari lembar gambar kerja."),
    "MD": ("ukur", "Ukur 3D", "Ukur 3D: diukur dari model 3D rancangan."),
    "RF": ("ref", "Referensi", "Referensi: dari rujukan umum dan teknik yang sudah dikenal."),
    "ES": ("est", "Estimasi", "Estimasi: perkiraan yang belum dicek ke penjual atau pengrajin."),
    "HP": ("hip", "Hipotesis", "Hipotesis: dugaan perancang yang menunggu gambar kerja."),
    "VS": ("vis", "Visualisasi AI", "Visualisasi AI: gambar suasana dibuat dengan AI mengikuti rancangan, bukan foto kursi jadi."),
}

def ev(k):
    c, a, t = EV[k]
    return f'<span class="ev {c}" title="{E(t)}">{a}</span>'

SVG = lambda body, extra="": f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"{extra}>{body}</svg>'
ICON = {
    "auto": SVG('<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>'),
    "plus": SVG('<path d="M12 5v14M5 12h14"/>'),
    "minus": SVG('<path d="M5 12h14"/>'),
    "free": SVG('<path d="M9 11V6a1.6 1.6 0 0 1 3.2 0v4.2m0-.7a1.6 1.6 0 0 1 3.2 0v1m0-.2a1.6 1.6 0 0 1 3.2 0V15a6 6 0 0 1-6 6h-1.4a6 6 0 0 1-4.8-2.4L4 15.4a1.6 1.6 0 0 1 2.5-2L9 15.5"/>'),
    "reset": SVG('<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4.5h4.5"/>'),
    "play": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.6v12.8a.6.6 0 0 0 .9.5l10-6.4a.6.6 0 0 0 0-1L8.9 5.1a.6.6 0 0 0-.9.5Z"/></svg>',
    "pause": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7.5 5h3.2v14H7.5zM13.3 5h3.2v14h-3.2z"/></svg>',
    "xray": SVG('<path d="M3 12s3.6-6.5 9-6.5S21 12 21 12s-3.6 6.5-9 6.5S3 12 3 12Z"/><circle cx="12" cy="12" r="2.6"/>'),
    "left": SVG('<path d="M15 6l-6 6 6 6"/>'),
    "right": SVG('<path d="M9 6l6 6-6 6"/>'),
}

def paras(lst):
    return "".join(f"<p>{E(t)}</p>" for t in lst)

def slug_url(s):
    return f"kursi-{s}.html"

CHAPTERS = [("filosofi", "Filosofi"), ("suasana", "Suasana"), ("material", "Material"), ("rakit", "Rakit"), ("sambungan", "Sambungan"), ("anyaman", "Anyaman"), ("gambar", "Gambar kerja"), ("rab", "Biaya")]

def sec_head(kicker, h2, lede):
    return f"""<header class="sec-head" data-reveal>
        <p class="kicker"><span data-num></span><span class="dim" aria-hidden="true"></span>{E(kicker)}</p>
        <h2>{E(h2)}</h2>
        <p class="sec-lede">{E(lede)}</p>
      </header>"""

# ------------------------------------------------------------------ panggung (hero)
TOGGLE = {"selonjor": [("dingklik", "Dingklik")], "srawung": [("ottoman", "Ottoman")]}
ALT_POSTER = {
    "selonjor": "Kursi Selonjor dalam model 3D, tampak serong. Rangka jati, anyaman cane, bantal lurik, dan dingklik di depannya.",
    "pinarak": "Kursi Pinarak dalam model 3D, tampak serong. Kursi tamu jati dengan papan lengan lebar dan dudukan cane.",
    "srawung": "Sofa Srawung dalam model 3D, tampak serong. Sofa dua dudukan dengan lengan kisi dan ottoman di depannya.",
}

def stage(c):
    n = c["nama"]
    tg = "".join(f'<button type="button" class="chip" data-group="{g}" aria-pressed="true">{E(l)}</button>' for g, l in TOGGLE.get(c["slug"], []))
    acts = "".join(f'<button type="button" class="chip" data-act="{a["id"]}" aria-pressed="false">{E(a["label"])}</button>' for a in c["aksi"])
    return f"""<section class="stage" id="atas" aria-labelledby="k-judul">
    <div class="stage-bg" aria-hidden="true"></div>
    <h1 class="stage-name" id="k-judul"><span>{E(n)}</span></h1>
    <div class="stage-view" id="stage-view" role="group" aria-label="Model 3D {E(c['judul_halaman'])}">
      <img class="stage-poster" id="stage-poster" src="{c['poster']}" alt="{E(ALT_POSTER[c['slug']])}" width="1200" height="900" decoding="async" fetchpriority="high">
      <div class="k3d-host" id="hero3d"></div>
      <div class="hs-layer" id="hs-layer"></div>
      <p class="stage-load" id="stage-load" role="status">Memuat model 3D</p>
      <aside class="part-card" id="part-card" hidden aria-live="polite">
        <button class="pc-x" type="button" id="pc-x" aria-label="Tutup keterangan">{SVG('<path d="M6 6l12 12M18 6L6 18"/>')}</button>
        <p class="pc-code num" id="pc-code"></p>
        <h2 class="pc-name" id="pc-name"></h2>
        <p class="pc-text" id="pc-text"></p>
        <dl class="pc-dl" id="pc-dl"></dl>
        <p class="pc-ev" id="pc-ev"></p>
      </aside>
      <div class="hud" id="hud">
        <div class="hud-dock">
          <div class="hud-tabs" role="group" aria-label="Menu kendali model">
            <button type="button" data-tab="lihat" aria-pressed="true" aria-controls="hp-lihat">Lihat</button>
            <button type="button" data-tab="gerak" aria-pressed="false" aria-controls="hp-gerak">Gerak</button>
            <button type="button" data-tab="bongkar" aria-pressed="false" aria-controls="hp-bongkar">Bongkar</button>
          </div>
          <div class="hud-panel" id="hp-lihat" data-panel="lihat">
            <div class="seg" role="group" aria-label="Mode tampilan">
              <button type="button" data-mode="solid" aria-pressed="true">Utuh</button>
              <button type="button" data-mode="xray" aria-pressed="false">Tembus</button>
              <button type="button" data-mode="lines" aria-pressed="false">Garis</button>
            </div>
            <div class="seg" role="group" aria-label="Sudut pandang">
              <button type="button" data-view="home">Serong</button>
              <button type="button" data-view="depan">Depan</button>
              <button type="button" data-view="samping">Samping</button>
              <button type="button" data-view="belakang">Belakang</button>
              <button type="button" data-view="atas">Atas</button>
            </div>
            <div class="chips" role="group" aria-label="Bagian yang tampil">
              <button type="button" class="chip" data-layer="kayu" aria-pressed="true">Rangka</button>
              <button type="button" class="chip" data-layer="anyam" aria-pressed="true">Anyaman</button>
              <button type="button" class="chip" data-layer="bantal" aria-pressed="true">Bantal</button>
              <button type="button" class="chip" data-layer="lain" aria-pressed="true">Pelengkap</button>
              {tg}
            </div>
          </div>
          <div class="hud-panel" id="hp-gerak" data-panel="gerak" hidden>
            <div class="chips" role="group" aria-label="Gerakan bagian kursi">{acts}</div>
          </div>
          <div class="hud-panel" id="hp-bongkar" data-panel="bongkar" hidden>
            <label class="range"><span>Bongkar</span><input type="range" id="explode" min="0" max="100" value="0" aria-label="Seberapa jauh bagian kursi dibongkar"></label>
            <button type="button" class="chip" data-do="rapat">Rapatkan</button>
          </div>
        </div>
        <div class="hud-side" role="group" aria-label="Kamera">
          <button type="button" class="hud-btn" data-do="auto" aria-pressed="true" aria-label="Putar otomatis" title="Putar otomatis">{ICON['auto']}</button>
          <button type="button" class="hud-btn" data-do="in" aria-label="Perbesar" title="Perbesar">{ICON['plus']}</button>
          <button type="button" class="hud-btn" data-do="out" aria-label="Perkecil" title="Perkecil">{ICON['minus']}</button>
          <button type="button" class="hud-btn hud-free" data-do="free" aria-pressed="false" aria-label="Putar bebas dengan satu jari" title="Putar bebas">{ICON['free']}</button>
          <button type="button" class="hud-btn" data-do="reset" aria-label="Kembali ke sudut awal" title="Sudut awal">{ICON['reset']}</button>
        </div>
      </div>
    </div>
    <div class="wrap stage-top">
      <nav class="crumbs" aria-label="Jejak halaman"><a href="karya.html">Karya</a><span aria-hidden="true">/</span><a href="pameran.html">Pameran</a><span aria-hidden="true">/</span><span aria-current="page">{E(n)}</span></nav>
      <span class="status-chip">Rancangan 2026</span>
    </div>
    <p class="stage-hint"><span class="hint-fine">Seret untuk memutar. Klik model lalu gulir untuk zoom. Klik bagian kursi untuk melihat namanya.</span><span class="hint-coarse">Geser untuk memutar, cubit untuk zoom. Ketuk bagian kursi untuk melihat namanya.</span></p>
  </section>"""

# ------------------------------------------------------------------ isi halaman kursi
def intro(c):
    fk = "".join(
        f'<li><span class="num"><b>{E(v)}</b>{(" " + E(u)) if u else ""}</span><span class="lbl">{E(l)}</span>{ev(e)}</li>'
        for l, v, u, e in c["fakta"])
    up = lambda t: t[:1].upper() + t[1:]
    legend = "".join(f'<li>{ev(k)}<span>{E(up(EV[k][2].split(": ", 1)[1]))}</span></li>' for k in ["GK", "MD", "RF", "ES", "HP", "VS"])
    return f"""<section class="k-intro">
    <div class="wrap k-intro-grid">
      <div class="k-copy" data-reveal>
        <p class="k-tag">{E(c['tagline'])}</p>
        <dl class="k-def"><dt>{E(c['arti_kata'])}</dt><dd>{E(c['arti'])}</dd></dl>
        <p class="k-lede">{E(c['lede'])}</p>
        <p class="k-status-note"><b>{E(c['jenis'])}.</b> Kursi ini masih rancangan. Gambar di halaman ini adalah model 3D dari SketchUp dan visualisasi suasana dari AI, bukan foto kursi jadi.</p>
      </div>
      <div class="k-data" data-reveal>
        <ul class="k-facts">{fk}</ul>
        <p class="k-note">{E(c['fakta_catatan'])}</p>
        <details class="ev-legend"><summary>Arti label bukti</summary><ul class="ev-list">{legend}</ul></details>
      </div>
    </div>
  </section>"""

def chapters(c):
    li = "".join(f'<li><a href="#{i}">{E(l)}</a></li>' for i, l in CHAPTERS)
    return f'<nav class="chapters" id="chapters" aria-label="Bagian halaman"><div class="wrap"><ul>{li}</ul></div></nav>'

def filosofi(c):
    pr = "".join(f'<li><h3>{E(t)}</h3><p>{E(x)}</p>{ev(e)}</li>' for t, x, e in c["prinsip"])
    extra = ""
    if c["arti_lain"]:
        extra += f'<aside class="callout k-callout" data-reveal><b>Nama konsep</b><p>{E(c["arti_lain"])}</p></aside>'
    if c["cek_struktur"]:
        cs = c["cek_struktur"]
        extra += f'<aside class="callout k-callout" data-reveal><b>{E(cs["judul"])}</b><p>{E(cs["teks"])}</p>{ev(cs["label"])}</aside>'
    sk = ""
    if c.get("sketsa"):
        s = c["sketsa"]
        sk = (f'<figure class="k-sketch" data-reveal><a class="k-sketch-link" href="{s["src"]}" target="_blank" rel="noopener" aria-label="Buka sketsa ukuran penuh di tab baru">'
              f'<img src="{s["src"]}" alt="{E(s["alt"])}" width="{s["w"]}" height="{s["h"]}" loading="lazy" decoding="async"></a>'
              f'<figcaption><b>{E(s["judul"])}</b><span>{E(s["cap"])}</span></figcaption></figure>')
    return f"""<section class="section k-sec" id="filosofi">
    <div class="wrap">
      {sec_head("Filosofi", "Gagasan di balik " + c["nama"], c["lede"])}
      <div class="phil">
        <div class="phil-text" data-reveal>{paras(c['filosofi'])}</div>
        <ul class="principles" data-stagger>{pr}</ul>
      </div>
      {sk}
      {extra}
    </div>
  </section>"""

# ------------------------------------------------------------------ suasana ruang (visualisasi AI)
def sw_tile(key):
    s = SUASANA[key]
    base = f"assets/img/pameran-suasana-{key}"
    h = round(1100 * s["h"] / s["w"])
    return (f'<li class="sw"><a class="sw-btn" href="{base}-l.webp" data-w="{s["w"]}" data-h="{s["h"]}" data-cap="{E(s["cap"])}" aria-label="Perbesar gambar: {E(s["cap"])}">'
            f'<img src="{base}-m.webp" alt="{E(s["alt"])}" width="1100" height="{h}" loading="lazy" decoding="async">'
            f'<span class="sw-cap">{E(s["cap"])}</span></a></li>')

SW_NOTE = "Gambar ini dibuat dengan AI (Gemini) mengikuti rancangan, bukan foto kursi jadi. Bentuk dan detailnya bisa berbeda dari model 3D dan gambar kerja. Ukuran dan bahan yang berlaku ada di halaman tiap kursi."

def suasana(c):
    keys = c["suasana"]
    tiles = "".join(sw_tile(k) for k in keys)
    return f"""<section class="section k-sec" id="suasana">
    <div class="wrap">
      {sec_head("Suasana", "Kursi di dalam ruang", c["suasana_lede"])}
      <ul class="sw-grid sw-n{len(keys)}" data-lightbox data-stagger>{tiles}</ul>
      <p class="sw-note" data-reveal>{ev("VS")} <span>{E(SW_NOTE)}</span></p>
    </div>
  </section>"""

def material(c):
    cards = "".join(f"""<li class="mat">
          <div class="mat-sw sw-{m['key']}" aria-hidden="true"></div>
          <div class="mat-body"><h3>{E(m['nama'])}</h3><p class="mat-use">Dipakai di: {E(m['pakai'])}</p><p>{E(m['teks'])}</p><p class="mat-care"><b>Perawatan.</b> {E(m['rawat'])}</p>{ev(m['label'])}</div>
        </li>""" for m in c["material"])
    return f"""<section class="section k-sec" id="material">
    <div class="wrap">
      {sec_head("Material", "Bahan dan tugasnya", "Tiap bahan punya tugas sendiri. Kotak kecil di tiap kartu adalah ilustrasi tekstur yang dipakai pada model 3D, bukan foto bahannya.")}
      <ul class="mats" data-stagger>{cards}</ul>
    </div>
  </section>"""

def rakit(c):
    n = len(c["langkah"])
    li = ""
    for i, s in enumerate(c["langkah"]):
        chips = "".join(f"<span>{E(x)}</span>" for x in s["chip"])
        li += f"""<li class="step" data-step="{i}"><button type="button" class="step-btn" aria-label="Lompat ke langkah {i + 1}: {E(s['judul'])}"><span class="step-no num">{i + 1}</span><span class="step-body"><b>{E(s['judul'])}</b><span class="step-text">{E(s['teks'])}</span><span class="step-chips">{chips}</span></span></button></li>"""
    note = ("Urutan mengikuti lembar GK-A04 dan GK-A05, lalu dilengkapi dingklik dari model 3D." if c["slug"] == "selonjor"
            else "Urutan ini hipotesis dari struktur model 3D. Nanti dicocokkan dengan gambar kerja seri " + c["gk"] + ".")
    return f"""<section class="section k-sec" id="rakit">
    <div class="wrap">
      {sec_head("Rakit", "Cara " + ("sofa" if c["slug"] == "srawung" else "kursi") + " dirakit", "Putar animasinya lalu ikuti urutannya. Bagian yang sedang masuk menyala hangat. Kamu juga bisa menggeser penggeser waktunya sendiri.")}
      <div class="asm">
        <div class="asm-view">
          <div class="asm-host" id="asm-host"><p class="asm-wait">Animasi dimuat saat bagian ini terlihat.</p></div>
          <div class="asm-ctrl">
            <button type="button" class="btn primary small" id="asm-play" aria-pressed="false"><span class="ic-play">{ICON['play']}</span><span class="ic-pause">{ICON['pause']}</span><span class="lbl">Putar</span></button>
            <input type="range" id="asm-range" min="0" max="{n * 100}" value="0" aria-label="Posisi animasi rakit">
            <span class="asm-time num" id="asm-time">Langkah 1 dari {n}</span>
          </div>
          <p class="asm-cap" id="asm-cap" aria-live="polite"></p>
        </div>
        <ol class="asm-steps" id="asm-steps">{li}</ol>
      </div>
      <p class="k-note" data-reveal>{ev('GK' if c['slug'] == 'selonjor' else 'HP')} {E(note)}</p>
    </div>
  </section>"""

def sambungan(c):
    tabs, items = "", ""
    for i, j in enumerate(c["sambungan"]):
        tabs += f'<button type="button" role="tab" id="jt-{j["id"]}" data-joint="{j["id"]}" aria-selected="{"true" if i == 0 else "false"}" aria-controls="jp-{j["id"]}" tabindex="{0 if i == 0 else -1}">{E(j["judul"])}</button>'
        spec = "".join(f'<div><dt>{E(a)}</dt><dd>{E(b)}{ev(e)}</dd></div>' for a, b, e in j["spek"])
        items += f"""<article class="jnt-item" id="jp-{j['id']}" role="tabpanel" aria-labelledby="jt-{j['id']}" data-joint="{j['id']}"{'' if i == 0 else ' hidden'}>
            <h3>{E(j['judul'])}</h3>
            <p class="jnt-sum">{E(j['ringkas'])}</p>
            <dl class="spec">{spec}</dl>
            <div class="prose">{paras(j['teks'])}</div>
            <p>{ev(j['label'])}</p>
          </article>"""
    return f"""<section class="section k-sec" id="sambungan">
    <div class="wrap">
      {sec_head("Sambungan", "Sambungan di dalam kayu", "Pilih satu sambungan, tekan Rakit, lalu nyalakan Lihat dalam untuk melihat bagian yang tersembunyi di dalam kayu.")}
      <div class="jnt">
        <div class="jnt-tabs" role="tablist" aria-label="Pilih sambungan">{tabs}</div>
        <div class="jnt-grid">
          <div class="jnt-view">
            <div class="jnt-host" id="jnt-host"><p class="asm-wait">Sambungan dimuat saat bagian ini terlihat.</p></div>
            <div class="jnt-ctrl">
              <button type="button" class="btn primary small" id="jnt-play" aria-pressed="false"><span class="ic-play">{ICON['play']}</span><span class="ic-pause">{ICON['pause']}</span><span class="lbl">Rakit</span></button>
              <button type="button" class="btn soft small" id="jnt-xray" aria-pressed="false">{ICON['xray']}<span>Lihat dalam</span></button>
              <input type="range" id="jnt-range" min="0" max="100" value="0" aria-label="Posisi animasi sambungan">
            </div>
            <p class="asm-cap" id="jnt-cap" aria-live="polite"></p>
          </div>
          <div class="jnt-info">{items}</div>
        </div>
      </div>
    </div>
  </section>"""

def anyaman(c):
    tabs, items = "", ""
    for i, k in enumerate(c["anyaman"]):
        w = WEAVES[k]
        tabs += f'<button type="button" role="tab" id="wt-{k}" data-weave="{k}" aria-selected="{"true" if i == 0 else "false"}" aria-controls="wp-{k}" tabindex="{0 if i == 0 else -1}">{E(w["nama"])}</button>'
        steps = "".join(f'<li data-w="{si}"><button type="button">{E(t)}</button></li>' for si, t in enumerate(w["langkah"]))
        items += f"""<article class="weave-item" id="wp-{k}" role="tabpanel" aria-labelledby="wt-{k}" data-weave="{k}"{'' if i == 0 else ' hidden'}>
            <h3>{E(w['nama'])}</h3>
            <p class="jnt-sum">{E(w['ringkas'])}</p>
            <p class="weave-use"><b>Dipakai di:</b> {E(c['anyaman_pakai'][k])}</p>
            <div class="prose">{paras(w['teks'])}</div>
            <ol class="weave-steps">{steps}</ol>
            <p>{ev(w['label'])}</p>
          </article>"""
    return f"""<section class="section k-sec" id="anyaman">
    <div class="wrap">
      {sec_head("Anyaman", "Cara rotan dianyam", "Anyaman di kursi ini dibuat selapis demi selapis. Putar animasinya atau pilih langkah di sebelah kanan.")}
      <div class="weave">
        <div class="jnt-tabs" role="tablist" aria-label="Pilih anyaman">{tabs}</div>
        <div class="weave-grid">
          <figure class="weave-view">
            <canvas id="weave-cv" width="720" height="540" role="img" aria-label="Animasi anyaman rotan"></canvas>
            <div class="jnt-ctrl">
              <button type="button" class="btn primary small" id="weave-play" aria-pressed="false"><span class="ic-play">{ICON['play']}</span><span class="ic-pause">{ICON['pause']}</span><span class="lbl">Putar</span></button>
              <input type="range" id="weave-range" min="0" max="100" value="0" aria-label="Posisi animasi anyaman">
            </div>
            <figcaption class="asm-cap" id="weave-cap" aria-live="polite"></figcaption>
          </figure>
          <div class="jnt-info">{items}</div>
        </div>
      </div>
    </div>
  </section>"""

def gambar(c):
    sheets = list(c["lembar"])
    gen = f"assets/img/pameran-tampak-{c['slug']}.webp"
    if not sheets and exists(gen):
        sheets = [dict(src=gen, no="TM-" + c["seri"] + "01", judul="Tampak dari model 3D", skala=c.get("tampak_skala", "1 : 10"), ket="Enam tampak dengan ukuran keseluruhan, yaitu depan, samping kanan, belakang, atas, samping kiri, dan isometri. Dibuat otomatis dari model 3D, bukan gambar kerja resmi.")]
    if sheets:
        thumbs = "".join(f'<li><button type="button" data-i="{i}" aria-label="Buka lembar {E(s["no"])}: {E(s["judul"])}" aria-pressed="{"true" if i == 0 else "false"}"><img src="{s["src"]}" alt="" width="160" height="113" loading="lazy" decoding="async"><span><b>{E(s["no"])}</b>{E(s["judul"])}</span></button></li>' for i, s in enumerate(sheets))
        s0 = sheets[0]
        viewer = f"""<div class="dw-view">
          <div class="dw-stage" id="dw-stage" tabindex="0" role="group" aria-label="Lembar gambar kerja. Saat diperbesar, seret untuk menggeser.">
            <img id="dw-img" src="{s0['src']}" alt="Lembar {E(s0['no'])}: {E(s0['judul'])}" width="1985" height="1404" decoding="async">
          </div>
          <div class="dw-ctrl">
            <button type="button" class="hud-btn dark" data-dw="in" aria-label="Perbesar gambar">{ICON['plus']}</button>
            <button type="button" class="hud-btn dark" data-dw="out" aria-label="Perkecil gambar">{ICON['minus']}</button>
            <button type="button" class="btn soft small" data-dw="fit">Pas layar</button>
            <a class="btn soft small" id="dw-open" href="{s0['src']}" target="_blank" rel="noopener">Buka gambar penuh</a>
          </div>
          <p class="dw-cap" id="dw-cap"><b>{E(s0['no'])}</b> {E(s0['judul'])}, skala {E(s0['skala'])}. {E(s0['ket'])}</p>
        </div>
        <ul class="dw-thumbs" id="dw-thumbs" data-sheets='{E(json.dumps([[s["src"], s["no"], s["judul"], s["skala"], s["ket"]] for s in sheets], ensure_ascii=False))}'>{thumbs}</ul>"""
        note = c["lembar_catatan"] or ("Gambar tampak ini dibuat otomatis dari model 3D. Lembar gambar kerja resmi seri " + c["gk"] + " akan dipasang di sini kalau sudah siap.")
        mnote = f" {c['model_catatan']}" if c["model_catatan"] else ""
        notehtml = f'<p class="k-note">{E(note)}{E(mnote)}</p>'
    else:
        viewer = f'<div class="dw-empty"><b>Gambar kerja seri {E(c["gk"])} belum dipasang.</b><p>Ukuran di halaman ini diambil dari model 3D rancangan. Lembar gambar kerja resmi akan ditambahkan di bagian ini kalau sudah selesai digambar.</p></div>'
        notehtml = ""
    rows = ""
    src_ev = "GK" if c["slug"] == "selonjor" else "MD"
    for kode, nama, q, t, w, L, bahan, kind, ket in c["komponen"]:
        ukuran = f"{fmt(t, 0)} × {fmt(w, 0)} × {fmt(L, 0)}"
        rows += f'<tr><th scope="row" class="num">{E(kode)}</th><td>{E(nama)}</td><td class="r num">{q}</td><td class="num">{ukuran}</td><td>{E(bahan)}</td><td>{E(ket)}</td></tr>'
    cut = f"""<div class="cut" data-reveal>
        <h3>Daftar komponen</h3>
        <p class="k-note">Ukuran jadi dalam milimeter, tebal × lebar × panjang. Untuk kayu kasar tambahkan sekitar 5 mm tebal dan 20 mm panjang. {ev(src_ev)}</p>
        <div class="tbl-wrap"><table class="tbl cut-table"><caption class="sr-only">Daftar komponen {E(c['nama'])}</caption>
          <thead><tr><th scope="col">Kode</th><th scope="col">Bagian</th><th scope="col" class="r">Jml</th><th scope="col">Ukuran jadi</th><th scope="col">Bahan</th><th scope="col">Catatan</th></tr></thead>
          <tbody>{rows}</tbody></table></div>
      </div>"""
    lede = ("Lembar gambar kerja asli. Perbesar untuk membaca ukuran dan detail sambungannya." if c["lembar"]
            else "Tampak dari model 3D dengan ukuran keseluruhan. Ukuran tiap bagian ada di daftar komponen, dan gambar kerja resmi menyusul." if sheets
            else "Ukuran lengkap bagian-bagiannya ada di daftar komponen. Gambar kerja resmi menyusul.")
    return f"""<section class="section k-sec" id="gambar">
    <div class="wrap">
      {sec_head("Gambar kerja", "Gambar kerja dan daftar komponen", lede)}
      <div class="dw">{viewer}</div>
      {notehtml}
      {cut}
    </div>
  </section>"""

def rab_rows(c):
    baris, h = rab_baris(c)
    out, groups = "", []
    total_bahan = 0.0
    cat_sum = {}
    last = None
    for g, i, u, q, s, p, w, k, l in baris:
        if g != last:
            out += f'<tr class="grp"><th scope="colgroup" colspan="5">{E(g)}</th></tr>'
            last = g
        sub = q * (1 + WASTE if w else 1) * p
        total_bahan += sub
        cat_sum[g] = cat_sum.get(g, 0) + sub
        qs = fmt(q, 4 if q < 1 else 3 if q < 10 and q != int(q) else 2 if q != int(q) else 0)
        note = f"<small>{E(k)}</small>" if k else ""
        out += (f'<tr data-line="{E(i)}"><th scope="row">{E(u)}{note}</th><td class="r num">{qs}</td><td>{E(s)}</td>'
                f'<td class="r"><input class="in-price" type="text" inputmode="numeric" value="{fmt(p)}" aria-label="Harga satuan {E(u)}" data-id="{E(i)}"></td>'
                f'<td class="r num sub">{rp(sub)}</td></tr>')
    out += '<tr class="grp"><th scope="colgroup" colspan="5">Upah pengrajin</th></tr>'
    jam_total = 0
    for idx, (u, j) in enumerate(c["jam"]):
        sub = j * PRICE["upah_jam"]
        jam_total += sub
        out += (f'<tr data-jam="{idx}"><th scope="row">{E(u)}</th><td class="r"><input class="in-jam" type="text" inputmode="numeric" value="{j}" aria-label="Jam kerja {E(u)}" data-i="{idx}"></td><td>jam</td>'
                f'<td class="r num rate">{fmt(PRICE["upah_jam"])}</td><td class="r num sub">{rp(sub)}</td></tr>')
    hpp = total_bahan + jam_total
    harga = round(hpp * (1 + MARGIN) / 100) * 100
    return out, dict(bahan=total_bahan, upah=jam_total, hpp=hpp, harga=harga, cat=cat_sum)

def rab(c):
    rows, t = rab_rows(c)
    cats = [("Kayu", "c1"), ("Anyaman rotan", "c2"), ("Kain dan isi bantal", "c3"), ("Perlengkapan", "c4"), ("Finishing", "c5")]
    vals = [(n, k, t["cat"].get(n, 0)) for n, k in cats] + [("Upah pengrajin", "c6", t["upah"]), ("Margin dan cadangan", "c7", t["hpp"] * MARGIN)]
    tot = sum(v for _, _, v in vals) or 1
    mx = max(v for _, _, v in vals) or 1
    bars = "".join(
        f'<li data-k="{k}" title="{E(n)}: {rp(v)} ({v / tot * 100:.0f} persen)"><span class="nm">{E(n)}</span><b class="num" data-v>{rp(v)}</b><span class="trk" aria-hidden="true"><i style="--w:{v / mx * 100:.2f}%"></i></span><small class="num" data-p>{v / tot * 100:.0f}%</small></li>'
        for n, k, v in vals)
    return f"""<section class="section k-sec" id="rab">
    <div class="wrap">
      {sec_head("Biaya", "Perkiraan biaya", "Hitungan kasar biaya bahan dan upah untuk satu set. Semua harga satuan adalah estimasi dan bisa kamu ubah langsung di tabel.")}
      <div class="rab" id="rab-root" data-slug="{c['slug']}">
        <div class="rab-main" data-reveal>
          <div class="tbl-wrap"><table class="tbl rab-table">
            <caption class="sr-only">Rincian perkiraan biaya {E(c['nama'])}</caption>
            <thead><tr><th scope="col">Uraian</th><th scope="col" class="r">Jumlah</th><th scope="col">Satuan</th><th scope="col" class="r">Harga satuan (Rp)</th><th scope="col" class="r">Subtotal</th></tr></thead>
            <tbody>{rows}</tbody>
          </table></div>
        </div>
        <aside class="rab-side" data-reveal>
          <div class="rab-total"><span>Harga perkiraan satu set</span><b class="num" id="rab-total">{rp(t['harga'])}</b><small id="rab-sub">Bahan {rp(t['bahan'])} + upah {rp(t['upah'])} + margin {int(MARGIN * 100)} persen</small></div>
          <h3 class="rab-h">Ke mana uangnya pergi</h3>
          <ul class="rab-bars" id="rab-bars">{bars}</ul>
          <div class="rab-in">
            <label class="fld"><span>Susut potong kayu</span><span class="fld-in"><input type="text" inputmode="numeric" id="in-waste" value="{int(WASTE * 100)}" aria-label="Susut potong kayu dalam persen"><i>%</i></span></label>
            <label class="fld"><span>Upah per jam</span><span class="fld-in"><i>Rp</i><input type="text" inputmode="numeric" id="in-rate" value="{fmt(PRICE['upah_jam'])}" aria-label="Upah per jam dalam rupiah"></span></label>
            <label class="fld"><span>Margin dan cadangan</span><span class="fld-in"><input type="text" inputmode="numeric" id="in-margin" value="{int(MARGIN * 100)}" aria-label="Margin dalam persen"><i>%</i></span></label>
            <button type="button" class="btn soft small" id="rab-reset">Kembalikan angka awal</button>
          </div>
        </aside>
      </div>
      <p class="k-note" data-reveal>{ev('ES')} Volume kayu dihitung dari daftar komponen. Harga satuan dan jam kerja adalah perkiraan awal yang belum dicek ke penjual atau pengrajin, jadi ini bukan penawaran harga. Harga bahan berbeda tiap daerah dan musim.</p>
    </div>
  </section>"""

def lanjut(c):
    i = c["urut"] - 1
    prev, nxt = CHAIRS[(i - 1) % 3], CHAIRS[(i + 1) % 3]
    def card(x, side):
        arrow = ICON["left"] if side == "prev" else ICON["right"]
        lab = "Kursi sebelumnya" if side == "prev" else "Kursi berikutnya"
        return f'<a class="k-nav k-nav-{side}" href="{slug_url(x["slug"])}"><span class="lbl">{lab}</span><b>{E(x["nama"])}</b><span class="sub">{E(x["tagline"])}</span><span class="ar">{arrow}</span></a>'
    return f"""<section class="section k-sec k-end">
    <div class="wrap">
      <div class="k-navs" data-reveal>{card(prev, "prev")}{card(nxt, "next")}</div>
      <p class="k-back" data-reveal><a class="btn soft" href="pameran.html">Kembali ke Pameran</a></p>
    </div>
  </section>"""

def chair_page(c):
    main = f"""<main id="konten" class="kursi" data-chair="{c['slug']}">
  {stage(c)}
  {intro(c)}
  {chapters(c)}
  {filosofi(c)}
  {suasana(c)}
  {material(c)}
  {rakit(c)}
  {sambungan(c)}
  {anyaman(c)}
  {gambar(c)}
  {rab(c)}
  {lanjut(c)}
</main>"""
    og = f"assets/img/pameran-og-{c['slug']}.jpg" if exists(f"assets/img/pameran-og-{c['slug']}.jpg") else "assets/img/og-image.png"
    h = head(f"{c['judul_halaman']} | Pameran | Musholi Rafi", c["meta"], slug_url(c["slug"]), og, CHAIR_SCRIPTS)
    return page(h, main)

# ------------------------------------------------------------------ denah ruang
PLACES = [("A", "Selonjor", 660, 860, -110, 2388.8, 1337.17, "selonjor"), ("A2", "Dingklik", 420, 540, -110, 1858.11, 1394.68, "selonjor"),
          ("B", "Pinarak", 680, 660, 110, 896.37, 943.36, "pinarak"), ("C", "Srawung", 1400, 780, 0, 800.0, 2040.0, "srawung"), ("C2", "Ottoman", 600, 600, 0, 1080.0, 950.0, "srawung")]

def plan_svg():
    W, H, WALL = 3200, 2850, 120
    top = H + WALL
    def Y(y):
        return top - y
    out = [f'<svg class="plan" viewBox="-260 -120 3900 3470" role="img" aria-labelledby="plan-t plan-d" focusable="false">',
           '<title id="plan-t">Denah ruang keluarga 3,20 × 2,85 m</title>',
           '<desc id="plan-d">Selonjor dengan dingklik di sisi timur menghadap ke barat. Pinarak di sisi barat menghadap ke timur. Srawung di dinding utara menghadap ke selatan dengan ottoman di depannya.</desc>',
           f'<rect class="p-floor" x="0" y="{Y(H)}" width="{W}" height="{H}"/>',
           f'<rect class="p-rug" x="650" y="{Y(2250)}" width="1700" height="1350" rx="30"/>',
           f'<rect class="p-wall" x="-{WALL}" y="0" width="{W + WALL}" height="{WALL}"/>',
           f'<rect class="p-wall" x="-{WALL}" y="{WALL}" width="{WALL}" height="{H}"/>']
    for code, name, w, d, ang, tx, ty, slug in PLACES:
        a = math.radians(ang)
        ca, sa = math.cos(a), math.sin(a)
        pts = [(x * ca - y * sa + tx, y * ca + x * sa + ty) for x, y in [(0, 0), (w, 0), (w, d), (0, d)]]
        poly = " ".join(f"{px:.1f},{Y(py):.1f}" for px, py in pts)
        cx = sum(p[0] for p in pts) / 4
        cy = sum(p[1] for p in pts) / 4
        f0, f1 = pts[0], pts[1]
        out.append(f'<g class="p-chair p-{slug}"><polygon points="{poly}"/><line class="p-front" x1="{f0[0]:.1f}" y1="{Y(f0[1]):.1f}" x2="{f1[0]:.1f}" y2="{Y(f1[1]):.1f}"/><text x="{cx:.1f}" y="{Y(cy):.1f}" text-anchor="middle" dominant-baseline="central">{E(name)}</text></g>')
    out.append(f'<g class="p-dim"><line x1="0" y1="{Y(0) + 150}" x2="{W}" y2="{Y(0) + 150}"/><line x1="0" y1="{Y(0) + 110}" x2="0" y2="{Y(0) + 190}"/><line x1="{W}" y1="{Y(0) + 110}" x2="{W}" y2="{Y(0) + 190}"/><text x="{W / 2}" y="{Y(0) + 300}" text-anchor="middle">3.200 mm</text>')
    out.append(f'<line x1="{W + 150}" y1="{Y(H)}" x2="{W + 150}" y2="{Y(0)}"/><line x1="{W + 110}" y1="{Y(H)}" x2="{W + 190}" y2="{Y(H)}"/><line x1="{W + 110}" y1="{Y(0)}" x2="{W + 190}" y2="{Y(0)}"/><text x="{W + 290}" y="{Y(H / 2)}" text-anchor="middle" transform="rotate(90 {W + 290} {Y(H / 2)})">2.850 mm</text></g>')
    out.append("</svg>")
    return "".join(out)

# ------------------------------------------------------------------ halaman Pameran
def pameran_page():
    posters = ""
    for c in CHAIRS:
        facts = " · ".join(c["fakta_kartu"][:1]) if False else c["fakta_kartu"][0]
        posters += f"""<li class="poster" data-chair="{c['slug']}">
          <a class="poster-link" href="{slug_url(c['slug'])}" aria-labelledby="po-{c['slug']}">
            <span class="poster-art"><img src="{c['poster']}" alt="{E(ALT_POSTER[c['slug']])}" width="1200" height="900" loading="lazy" decoding="async"></span>
            <span class="poster-body">
              <span class="poster-type">{E(c['jenis'])}</span>
              <b class="poster-name" id="po-{c['slug']}">{E(c['nama'])}</b>
              <span class="poster-line">{E(c['tagline'])}</span>
              <span class="poster-facts num">{E(facts)}</span>
              <span class="poster-cta">Masuki kursi {ICON['right']}</span>
            </span>
          </a>
        </li>"""
    peran = "".join(f"""<li class="p-role" data-chair="{c['slug']}"><b>{E(c['nama'])}</b><span>{E(t)}</span></li>""" for c, t in [
        (CHAIRS[0], "Pojok istirahat di sisi timur. Menghadap ke barat, dingklik di depannya."),
        (CHAIRS[1], "Kursi tamu di sisi barat. Menghadap ke timur, berhadapan dengan Selonjor."),
        (CHAIRS[2], "Tempat berkumpul di dinding utara. Ottoman menjembatani sofa dengan dua kursi lainnya.")])
    sw_tiles = "".join(sw_tile(k) for k in SUASANA_URUT)
    sw_all = f"""<section class="section k-sec" id="suasana" aria-labelledby="sw-h">
    <div class="wrap">
      <header class="sec-head" data-reveal>
        <p class="kicker"><span data-num></span><span class="dim" aria-hidden="true"></span>Suasana</p>
        <h2 id="sw-h">Kursi di dalam ruang</h2>
        <p class="sec-lede">Sepuluh gambar suasana untuk membayangkan ketiga kursi dipakai sehari-hari, di ruang tamu, pojok baca, dan teras. Ketuk atau klik gambar untuk melihatnya lebih besar.</p>
      </header>
      <ul class="sw-grid sw-n{len(SUASANA_URUT)}" data-lightbox data-stagger>{sw_tiles}</ul>
      <p class="sw-note" data-reveal>{ev("VS")} <span>{E(SW_NOTE)}</span></p>
    </div>
  </section>"""
    main = f"""<main id="konten" class="pameran">
  <section class="gal" aria-labelledby="g-judul">
    <div class="stage-bg" aria-hidden="true"></div>
    <div class="wrap gal-top">
      <nav class="crumbs" aria-label="Jejak halaman"><a href="karya.html">Karya</a><span aria-hidden="true">/</span><span aria-current="page">Pameran</span></nav>
      <span class="status-chip">Rancangan 2026</span>
    </div>
    <div class="wrap gal-head">
      <h1 id="g-judul" class="gal-title"><span>Pameran</span></h1>
      <p class="gal-lede">Tiga kursi untuk satu ruang tamu. Selonjor untuk melambat, Pinarak untuk menyambut, Srawung untuk berkumpul. Pilih satu kursi untuk memutarnya dalam 3D dan melihat cara membuatnya.</p>
    </div>
    <ul class="wrap posters" id="posters">{posters}</ul>
  </section>
  <section class="section k-sec" id="ruang">
    <div class="wrap">
      <header class="sec-head" data-reveal>
        <p class="kicker"><span data-num></span><span class="dim" aria-hidden="true"></span>Ruang</p>
        <h2>Satu ruang, tiga suasana</h2>
        <p class="sec-lede">Ketiga kursi disusun dalam satu ruang keluarga berukuran 3,20 × 2,85 m. Denah ini diambil dari penempatan di model SketchUp. Garis tebal di tiap kursi adalah sisi depannya.</p>
      </header>
      <div class="plan-grid">
        <figure class="plan-fig" data-reveal>{plan_svg()}<figcaption>Denah ruang keluarga. Utara di atas. Karpet anyaman pandan di tengah. {ev('MD')}</figcaption></figure>
        <ul class="roles" data-stagger>{peran}</ul>
      </div>
    </div>
  </section>
  {sw_all}
  <section class="section k-sec" id="status">
    <div class="wrap">
      <header class="sec-head" data-reveal>
        <p class="kicker"><span data-num></span><span class="dim" aria-hidden="true"></span>Tentang pameran ini</p>
        <h2>Rancangan yang masih berjalan</h2>
        <p class="sec-lede">Ketiga kursi dirancang dari nol di SketchUp, lengkap dengan bahan, sambungan, dan rotannya. Belum ada yang dibuat jadi, jadi semua gambar di sini adalah model 3D atau visualisasi.</p>
      </header>
      <div class="notes" data-stagger>
        <div class="callout"><b>Selonjor</b><p>Sudah punya gambar kerja lengkap. Ukuran, sambungan, dan urutan rakit di halamannya diambil dari lembar gambar tersebut.</p></div>
        <div class="callout"><b>Pinarak dan Srawung</b><p>Ukurannya diukur dari model 3D. Urutan rakit dan detail sambungannya masih hipotesis dan akan dicocokkan dengan gambar kerja nanti.</p></div>
        <div class="callout"><b>Biaya</b><p>Perkiraan biaya memakai harga satuan estimasi yang belum dicek ke penjual. Semua angkanya bisa kamu ubah di halaman tiap kursi.</p></div>
      </div>
      <p class="k-back" data-reveal><a class="btn soft" href="karya.html">Kembali ke Karya</a></p>
    </div>
  </section>
</main>"""
    og = "assets/img/pameran-og.jpg" if exists("assets/img/pameran-og.jpg") else "assets/img/og-image.png"
    h = head("Pameran tiga kursi | Karya | Musholi Rafi",
             "Pameran Selonjor, Pinarak, dan Srawung. Tiga kursi rotan dan jati rancangan Musholi Rafi dengan model 3D, gambar kerja, animasi sambungan, dan perkiraan biaya.",
             "pameran.html", og, '<script src="assets/js/pameran-suasana.js" defer></script>')
    return page(h, main)

# ------------------------------------------------------------------ data untuk skrip
def data_js():
    out = {"price": PRICE, "waste": WASTE, "margin": MARGIN, "weaves": WEAVES, "order": [c["slug"] for c in CHAIRS], "chairs": {}}
    for c in CHAIRS:
        baris, h = rab_baris(c)
        out["chairs"][c["slug"]] = dict(
            slug=c["slug"], nama=c["nama"], model=c["model"], poster=c["poster"],
            hotspots=[dict(code=x["code"], side=x.get("side"), re=x.get("re"), judul=x["judul"], teks=x["teks"], view=x["view"]) for x in c["hotspots"]],
            aksi=[dict(id=a["id"], group=a.get("group"), codes=a.get("codes"), move=a["move"], ms=a["ms"]) for a in c["aksi"]],
            steps=[dict(judul=s["judul"], teks=s["teks"], parts=s["parts"], dari=s["dari"], park=s.get("park"), join=s.get("join"), stag=s.get("stag")) for s in c["langkah"]],
            joints=[dict(id=j["id"], builder=j["builder"], params=j["params"], judul=j["judul"]) for j in c["sambungan"]],
            anyaman=c["anyaman"],
            rab=dict(lines=[[i, u, q, s, p, 1 if w else 0, g] for g, i, u, q, s, p, w, k, l in baris], jam=[j for _, j in c["jam"]], rate=PRICE["upah_jam"]),
        )
    return "/* Dibuat otomatis oleh gen_site.py dari chairs.py. Jangan diedit langsung. */\nwindow.PAMERAN=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"

def main():
    for c in CHAIRS:
        with open(os.path.join(REPO, slug_url(c["slug"])), "w", encoding="utf-8") as f:
            f.write(chair_page(c))
    with open(os.path.join(REPO, "pameran.html"), "w", encoding="utf-8") as f:
        f.write(pameran_page())
    with open(os.path.join(REPO, "assets/js/pameran-data.js"), "w", encoding="utf-8") as f:
        f.write(data_js())
    print("selesai")

if __name__ == "__main__":
    main()
