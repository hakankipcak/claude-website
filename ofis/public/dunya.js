// Sanal Ofis'in Minecraft tarzı 3B dünyası.
// Ofis planı 1000 × 640'lık mantıksal koordinatlardadır; 25 mantıksal birim = 1 blok.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const OLCEK = 25;
const bx = (x) => x / OLCEK;

// ================================================================ yardımcılar

function tohum(s) {
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function ton(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const k = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${k((n >> 16) & 255)},${k((n >> 8) & 255)},${k(n & 255)})`;
}

function doku(w, h, ciz) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const px = (x, y, renk) => {
    g.fillStyle = renk;
    g.fillRect(x, y, 1, 1);
  };
  ciz(px, g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Taban rengin üzerine hafif kumlanma serper.
function kumlu(px, w, h, renk, rnd, a = 0.86, b = 1.12) {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(x, y, ton(renk, a + rnd() * (b - a)));
}

const lambert = (map, ek = {}) => new THREE.MeshLambertMaterial({ map, ...ek });

// ================================================================ blok dokuları

function blokMalzemeleri() {
  const r = tohum(7);
  const t = {};
  t.cimUst = doku(16, 16, (px) => kumlu(px, 16, 16, '#6FA84A', r, 0.8, 1.15));
  t.toprak = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#8A6141', r, 0.8, 1.12);
    for (let i = 0; i < 10; i++) px((r() * 16) | 0, (r() * 16) | 0, '#6E4A30');
  });
  t.cimYan = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#8A6141', r, 0.8, 1.12);
    for (let x = 0; x < 16; x++) {
      const boy = 3 + ((r() * 3) | 0);
      for (let y = 0; y < boy; y++) px(x, y, ton('#6FA84A', 0.8 + r() * 0.3));
    }
  });
  t.tas = doku(16, 16, (px) => kumlu(px, 16, 16, '#8C8C8C', r, 0.82, 1.12));
  t.tasTugla = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#929292', r, 0.88, 1.1);
    for (let x = 0; x < 16; x++) { px(x, 7, '#5E5E5E'); px(x, 15, '#5E5E5E'); }
    for (let y = 0; y < 7; y++) px(15, y, '#5E5E5E');
    for (let y = 8; y < 15; y++) px(7, y, '#5E5E5E');
  });
  t.tahta = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#A9824E', r, 0.9, 1.08);
    for (let y = 3; y < 16; y += 4) for (let x = 0; x < 16; x++) px(x, y, '#7D5E36');
    [[4, 0], [12, 1], [2, 2], [9, 3]].forEach(([x, sira]) => { for (let y = sira * 4; y < sira * 4 + 3; y++) px(x, y, '#8C6A3E'); });
  });
  t.kutukYan = doku(16, 16, (px) => {
    for (let x = 0; x < 16; x++) {
      const c = r() < 0.3 ? '#4E3A24' : '#6B5034';
      for (let y = 0; y < 16; y++) px(x, y, ton(c, 0.85 + r() * 0.25));
    }
  });
  t.kutukUst = doku(16, 16, (px) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
      px(x, y, d > 6.5 ? '#6B5034' : ton(((d | 0) % 2) ? '#B8925C' : '#A07D4C', 0.95 + r() * 0.1));
    }
  });
  t.yaprak = doku(16, 16, (px, g) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (r() < 0.12) continue;
      px(x, y, ton('#4A8A30', 0.7 + r() * 0.45));
    }
  });
  t.cam = doku(16, 16, (px, g) => {
    g.fillStyle = 'rgba(200,230,245,0.18)';
    g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 16; i++) { px(i, 0, '#E8F4F8'); px(i, 15, '#E8F4F8'); px(0, i, '#E8F4F8'); px(15, i, '#E8F4F8'); }
    for (let i = 3; i < 7; i++) px(i, 9 - i, 'rgba(255,255,255,0.7)');
    for (let i = 6; i < 12; i++) px(i, 16 - i, 'rgba(255,255,255,0.55)');
  });
  t.kitaplik = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#A9824E', r, 0.9, 1.08);
    const renkler = ['#8E3B2E', '#3E5F8A', '#4F7A3A', '#C9A13E', '#6E4A8A', '#2F2F2F'];
    for (const y0 of [2, 9]) {
      for (let x = 1; x < 15; x++) {
        const c = renkler[(r() * renkler.length) | 0];
        const boy = 4 + ((r() * 2) | 0);
        for (let y = y0 + (5 - boy); y < y0 + 5; y++) px(x, y, ton(c, 0.85 + r() * 0.25));
      }
    }
  });
  t.cakil = doku(16, 16, (px) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, ['#8E8984', '#A39E98', '#6F6B66', '#B7B1AA'][(r() * 4) | 0]);
  });
  t.kum = doku(16, 16, (px) => kumlu(px, 16, 16, '#DCCF9C', r, 0.9, 1.08));
  t.su = doku(16, 16, (px) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, `rgba(${50 + r() * 20 | 0},${100 + r() * 30 | 0},${215 + r() * 30 | 0},0.78)`);
  });
  t.tezgahUst = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#B5B5B5', r, 0.93, 1.06);
    for (let i = 0; i < 16; i++) { px(i, 0, '#8E8E8E'); px(i, 15, '#8E8E8E'); px(0, i, '#8E8E8E'); px(15, i, '#8E8E8E'); }
  });
  t.dolapOn = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#B08A55', r, 0.92, 1.06);
    for (let i = 0; i < 16; i++) { px(i, 0, '#7D5E36'); px(i, 15, '#7D5E36'); px(0, i, '#7D5E36'); px(15, i, '#7D5E36'); px(7, i, '#7D5E36'); }
    px(5, 4, '#3A3A3A'); px(5, 5, '#3A3A3A'); px(9, 4, '#3A3A3A'); px(9, 5, '#3A3A3A');
  });
  t.demir = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#DADADA', r, 0.95, 1.04);
    for (let i = 0; i < 16; i++) { px(i, 0, '#B0B0B0'); px(i, 15, '#9A9A9A'); px(0, i, '#B0B0B0'); px(15, i, '#9A9A9A'); }
  });
  t.buzdolabi = doku(16, 16, (px) => {
    kumlu(px, 16, 16, '#E4E4E4', r, 0.96, 1.03);
    for (let i = 0; i < 16; i++) { px(i, 0, '#B9B9B9'); px(0, i, '#B9B9B9'); px(15, i, '#A8A8A8'); }
    for (let y = 4; y < 12; y++) px(12, y, '#7A7A7A');
  });
  t.isik = doku(16, 16, (px) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, ['#F8D877', '#E9B54A', '#FFF0A8', '#C98E2E'][(r() * 4) | 0]);
  });
  const yun = (renk) => doku(16, 16, (px) => {
    kumlu(px, 16, 16, renk, r, 0.92, 1.06);
    for (let i = 0; i < 18; i++) px((r() * 16) | 0, (r() * 16) | 0, ton(renk, 0.82));
  });
  t.yunKoltuk = yun('#A9473A');
  t.yunHali = yun('#C89B5C');
  t.yunBeyaz = yun('#ECE8E0');

  const m = {
    cim: [lambert(t.cimYan), lambert(t.cimYan), lambert(t.cimUst), lambert(t.toprak), lambert(t.cimYan), lambert(t.cimYan)],
    toprak: lambert(t.toprak),
    tas: lambert(t.tas),
    tasTugla: lambert(t.tasTugla),
    tahta: lambert(t.tahta),
    kutuk: [lambert(t.kutukYan), lambert(t.kutukYan), lambert(t.kutukUst), lambert(t.kutukUst), lambert(t.kutukYan), lambert(t.kutukYan)],
    yaprak: lambert(t.yaprak, { alphaTest: 0.5 }),
    cam: lambert(t.cam, { transparent: true, depthWrite: false }),
    kitaplik: [lambert(t.kitaplik), lambert(t.kitaplik), lambert(t.tahta), lambert(t.tahta), lambert(t.kitaplik), lambert(t.kitaplik)],
    cakil: lambert(t.cakil),
    kum: lambert(t.kum),
    su: lambert(t.su, { transparent: true, depthWrite: false }),
    dolap: [lambert(t.tahta), lambert(t.tahta), lambert(t.tezgahUst), lambert(t.tahta), lambert(t.dolapOn), lambert(t.tahta)],
    buzdolabi: [lambert(t.demir), lambert(t.demir), lambert(t.demir), lambert(t.demir), lambert(t.buzdolabi), lambert(t.demir)],
    demir: lambert(t.demir),
    isik: new THREE.MeshBasicMaterial({ map: t.isik }),
    yunKoltuk: lambert(t.yunKoltuk),
    yunHali: lambert(t.yunHali),
    yunBeyaz: lambert(t.yunBeyaz),
  };
  return { m, t };
}

// ================================================================ karakterler

const GORUNUM = {
  elif:   { deri: '#E8B894', sac: '#5A3A22', goz: '#3B6E3B', ust: '#C89B5C', alt: '#3A3833', ayakkabi: '#2A2420', sac2: 'uzun', desen: 'bluz', dudak: '#A5503F' },
  mert:   { deri: '#D29A70', sac: '#1E1A17', goz: '#3A2A1E', ust: '#4A6E91', alt: '#2F4A6B', ayakkabi: '#E8E8E8', sac2: 'kisa', desen: 'kapusonlu', gozluk: true },
  zeynep: { deri: '#F0C6A4', sac: '#9A3B1E', goz: '#4A6A8A', ust: '#B5654F', alt: '#2B2A28', ayakkabi: '#5A2A1A', sac2: 'uzun', desen: 'kolye', dudak: '#B04A40' },
  can:    { deri: '#C08458', sac: '#4A2F1B', goz: '#3A2A1E', ust: '#5E8B4E', alt: '#7A6A50', ayakkabi: '#3A2E26', sac2: 'kisa', desen: 'tisort', sakal: true, kisaKol: true },
  deniz:  { deri: '#E2B08C', sac: '#2A2320', goz: '#5A4030', ust: '#7A6A9B', alt: '#2E2C3A', ayakkabi: '#1E1E1E', sac2: 'kaküllü', desen: 'kazak', gozluk: true },
};

function karakterDokulari(g, rnd) {
  const deri = (px, w, h) => kumlu(px, w, h, g.deri, rnd, 0.97, 1.03);
  const uzun = g.sac2 === 'uzun';
  const orta = g.sac2 === 'kaküllü';

  const yuz = doku(8, 8, (px) => {
    deri(px, 8, 8);
    for (let x = 0; x < 8; x++) { px(x, 0, ton(g.sac, 0.95 + rnd() * 0.1)); px(x, 1, ton(g.sac, 0.95 + rnd() * 0.1)); }
    if (orta) for (let x = 0; x < 8; x++) if (x !== 3) px(x, 2, ton(g.sac, 0.95));
    if (uzun || orta) for (let y = 2; y < (uzun ? 8 : 6); y++) { px(0, y, ton(g.sac, 0.9)); px(7, y, ton(g.sac, 0.9)); }
    if (g.gozluk) {
      for (let x = 1; x < 7; x++) px(x, 3, '#222');
      [0, 3, 4, 7].forEach((x) => px(x, 4, '#222'));
    } else {
      [1, 2, 5, 6].forEach((x) => px(x, 3, ton(g.sac, 0.85)));
    }
    px(1, 4, '#FFFFFF'); px(2, 4, g.goz); px(5, 4, g.goz); px(6, 4, '#FFFFFF');
    px(3, 5, ton(g.deri, 0.85)); px(4, 5, ton(g.deri, 0.85));
    if (g.sakal) for (let x = 1; x < 7; x++) { px(x, 6, ton(g.sac, 1.05)); px(x, 7, ton(g.sac, 1.05)); }
    px(3, 6, g.dudak || ton(g.deri, 0.62)); px(4, 6, g.dudak || ton(g.deri, 0.62));
  });
  const sacDolu = doku(8, 8, (px) => kumlu(px, 8, 8, g.sac, rnd, 0.88, 1.1));
  const arka = doku(8, 8, (px) => {
    kumlu(px, 8, 8, g.sac, rnd, 0.88, 1.1);
    if (!uzun) for (let x = 0; x < 8; x++) { px(x, 7, ton(g.deri, 0.95)); if (!orta) px(x, 6, ton(g.deri, 0.95)); }
  });
  // Yan yüzlerde ön taraf bir yüzde 0. sütunda, öbüründe 7. sütundadır.
  const yan = (onSol) => doku(8, 8, (px) => {
    deri(px, 8, 8);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const on = onSol ? x : 7 - x; // ön kenara uzaklık
      const sac = y < 2 || (on >= 5 && y < (uzun ? 8 : orta ? 7 : 6)) || (uzun && on >= 2) || (orta && on >= 3 && y < 6);
      if (sac) px(x, y, ton(g.sac, 0.88 + rnd() * 0.2));
    }
    px(onSol ? 3 : 4, 4, ton(g.deri, 0.85));
  });
  const deriDoku = doku(8, 8, (px) => deri(px, 8, 8));

  const govdeOn = doku(8, 12, (px) => {
    kumlu(px, 8, 12, g.ust, rnd, 0.92, 1.06);
    for (let x = 0; x < 8; x++) px(x, 11, ton(g.ust, 0.8));
    if (g.desen === 'bluz') { px(3, 0, g.deri); px(4, 0, g.deri); px(3, 1, g.deri); px(4, 1, g.deri); [3, 6, 9].forEach((y) => px(4, y, ton(g.ust, 0.6))); }
    if (g.desen === 'kapusonlu') { px(3, 1, '#EEE'); px(3, 2, '#EEE'); px(3, 3, '#EEE'); px(4, 1, '#EEE'); px(4, 2, '#EEE'); for (let x = 2; x < 6; x++) { px(x, 7, ton(g.ust, 0.82)); px(x, 8, ton(g.ust, 0.82)); } }
    if (g.desen === 'kolye') { px(2, 0, g.deri); px(3, 0, g.deri); px(4, 0, g.deri); px(5, 0, g.deri); px(3, 1, g.deri); px(4, 1, g.deri); px(2, 1, '#E3C25A'); px(5, 1, '#E3C25A'); px(3, 2, '#E3C25A'); px(4, 2, '#F5DB78'); }
    if (g.desen === 'tisort') { px(3, 0, g.deri); px(4, 0, g.deri); px(2, 3, '#F3EFE7'); px(3, 3, '#F3EFE7'); px(2, 4, '#F3EFE7'); px(3, 4, '#C89B5C'); }
    if (g.desen === 'kazak') { for (let x = 0; x < 8; x++) { px(x, 4, ton(g.ust, 1.25)); px(x, 6, ton(g.ust, 1.25)); } px(3, 0, ton(g.ust, 0.75)); px(4, 0, ton(g.ust, 0.75)); }
  });
  const govdeArka = doku(8, 12, (px) => {
    kumlu(px, 8, 12, g.ust, rnd, 0.9, 1.04);
    if (g.sac2 === 'uzun') for (let y = 0; y < 3; y++) for (let x = 1; x < 7; x++) px(x, y, ton(g.sac, 0.9 + rnd() * 0.15));
  });
  const kumas = (renk) => doku(4, 4, (px) => kumlu(px, 4, 4, renk, rnd, 0.9, 1.05));
  const govdeYan = doku(4, 12, (px) => kumlu(px, 4, 12, g.ust, rnd, 0.88, 1.02));
  const kolYan = doku(4, 12, (px) => {
    kumlu(px, 4, 12, g.ust, rnd, 0.88, 1.05);
    for (let y = g.kisaKol ? 4 : 9; y < 12; y++) for (let x = 0; x < 4; x++) px(x, y, ton(g.deri, 0.96 + rnd() * 0.06));
  });
  const bacakYan = doku(4, 12, (px) => {
    kumlu(px, 4, 12, g.alt, rnd, 0.88, 1.06);
    for (let y = 10; y < 12; y++) for (let x = 0; x < 4; x++) px(x, y, ton(g.ayakkabi, 0.92 + rnd() * 0.1));
  });
  const L = (t) => lambert(t);
  return {
    // sıra: +x, -x, +y, -y, +z (ön), -z (arka)
    bas: [L(yan(false)), L(yan(true)), L(sacDolu), L(deriDoku), L(yuz), L(arka)],
    govde: [L(govdeYan), L(govdeYan), L(kumas(g.ust)), L(kumas(g.ust)), L(govdeOn), L(govdeArka)],
    kol: [L(kolYan), L(kolYan), L(kumas(g.ust)), L(kumas(g.kisaKol ? g.deri : g.deri)), L(kolYan), L(kolYan)],
    bacak: [L(bacakYan), L(bacakYan), L(kumas(g.alt)), L(kumas(g.ayakkabi)), L(bacakYan), L(bacakYan)],
  };
}

function kutu(w, h, d, malzeme, golge = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), malzeme);
  m.castShadow = golge;
  m.receiveShadow = true;
  return m;
}

function karakterKur(u, seed) {
  const g = GORUNUM[u.id];
  const mal = karakterDokulari(g, tohum(seed));
  const kok = new THREE.Group();
  const govdeKap = new THREE.Group(); // oturunca alçalan kısım
  kok.add(govdeKap);

  const bacaklar = [-1, 1].map((s) => {
    const pv = new THREE.Group();
    pv.position.set(s * 0.1, 0.6, 0);
    const m = kutu(0.2, 0.6, 0.2, mal.bacak);
    m.position.y = -0.3;
    pv.add(m);
    govdeKap.add(pv);
    return pv;
  });
  const govde = kutu(0.4, 0.6, 0.2, mal.govde);
  govde.position.y = 0.9;
  govdeKap.add(govde);
  const kollar = [-1, 1].map((s) => {
    const pv = new THREE.Group();
    pv.position.set(s * 0.3, 1.15, 0);
    const m = kutu(0.2, 0.6, 0.2, mal.kol);
    m.position.y = -0.25;
    pv.add(m);
    govdeKap.add(pv);
    return pv;
  });
  const basPv = new THREE.Group();
  basPv.position.y = 1.2;
  const bas = kutu(0.4, 0.4, 0.4, mal.bas);
  bas.position.y = 0.2;
  basPv.add(bas);
  govdeKap.add(basPv);

  // sağ eldeki bardaklar
  const el = new THREE.Group();
  el.position.set(0, -0.52, 0.13);
  kollar[0].add(el);
  const cay = new THREE.Group();
  const cayBardak = kutu(0.09, 0.13, 0.09, new THREE.MeshLambertMaterial({ color: '#B4462C', transparent: true, opacity: 0.85 }), false);
  cayBardak.position.y = 0.07;
  const tabak = kutu(0.16, 0.02, 0.16, new THREE.MeshLambertMaterial({ color: '#F2F2F2' }), false);
  cay.add(cayBardak, tabak);
  const kahve = new THREE.Group();
  const kupa = kutu(0.13, 0.14, 0.13, new THREE.MeshLambertMaterial({ color: '#F4F1EA' }), false);
  kupa.position.y = 0.07;
  const kahveUst = kutu(0.1, 0.01, 0.1, new THREE.MeshLambertMaterial({ color: '#5A3820' }), false);
  kahveUst.position.y = 0.145;
  const kulp = kutu(0.03, 0.07, 0.05, new THREE.MeshLambertMaterial({ color: '#F4F1EA' }), false);
  kulp.position.set(0.08, 0.07, 0);
  kahve.add(kupa, kahveUst, kulp);
  cay.visible = kahve.visible = false;
  el.add(cay, kahve);

  kok.traverse((o) => { o.userData.kisiId = u.id; });
  const yuzUrl = mal.bas[4].map.image.toDataURL();
  return { kok, govdeKap, bacaklar, kollar, basPv, cay, kahve, yuzUrl, yaw: 0, faz: seed * 1.7, yudum: 0 };
}

// ================================================================ dünya

export function dunyaKur({ kap, ekip, noktalar, onSec }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  kap.appendChild(renderer.domElement);

  const katman = document.createElement('div');
  katman.className = 'katman';
  kap.appendChild(katman);

  const sahne = new THREE.Scene();
  const gokGunduz = new THREE.Color('#8EC5FF');
  const gokGece = new THREE.Color('#0E1633');
  const gokAksam = new THREE.Color('#F2A66B');
  sahne.background = gokGunduz.clone();
  sahne.fog = new THREE.Fog(gokGunduz.clone(), 70, 140);

  const kamera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
  kamera.position.set(15, 21, 37);
  const kontrol = new OrbitControls(kamera, renderer.domElement);
  kontrol.target.set(19, 0, 12.5);
  kontrol.enableDamping = true;
  kontrol.dampingFactor = 0.08;
  kontrol.minDistance = 10;
  kontrol.maxDistance = 85;
  kontrol.maxPolarAngle = 1.3;
  kontrol.screenSpacePanning = false;
  kontrol.zoomToCursor = true;
  kontrol.update();

  const gok = new THREE.HemisphereLight(0xdcecff, 0x7a6544, 1.6);
  sahne.add(gok);
  const gunes = new THREE.DirectionalLight(0xfff1d6, 2.6);
  gunes.position.set(-10, 45, 30);
  gunes.target.position.set(20, 0, 13);
  gunes.castShadow = true;
  gunes.shadow.mapSize.set(2048, 2048);
  Object.assign(gunes.shadow.camera, { left: -45, right: 45, top: 40, bottom: -40, near: 1, far: 140 });
  gunes.shadow.bias = -0.0004;
  gunes.shadow.normalBias = 0.03;
  sahne.add(gunes, gunes.target);

  const { m: M, t: T } = blokMalzemeleri();

  // ---------------------------------------------------------------- bloklar
  const bloklar = new Map();
  const blok = (tip, x, y, z) => {
    if (!bloklar.has(tip)) bloklar.set(tip, []);
    bloklar.get(tip).push([x, y, z]);
  };

  const ADA = { x0: -14, x1: 55, z0: -12, z1: 41 };
  const ofisIci = (i, j) => i >= 0 && i <= 39 && j >= 0 && j <= 25;
  const ofisSinir = (i, j) => i >= -1 && i <= 40 && j >= -1 && j <= 26 && !ofisIci(i, j);
  const gol = (i, j) => i >= 45 && i <= 50 && j >= 3 && j <= 9;
  const golKenar = (i, j) => i >= 44 && i <= 51 && j >= 2 && j <= 10 && !gol(i, j);
  const patika = (i, j) => i >= 20 && i <= 22 && j >= 27;
  const disYol = (i, j) => (j === 28 && i >= 20 && i <= 44) || (i === 43 && j >= 6 && j <= 28);

  for (let i = ADA.x0; i < ADA.x1; i++) {
    for (let j = ADA.z0; j < ADA.z1; j++) {
      let tip = 'cim';
      if (ofisIci(i, j)) tip = 'tahta';
      else if (ofisSinir(i, j)) tip = 'tasTugla';
      else if (gol(i, j)) tip = 'su';
      else if (golKenar(i, j)) tip = 'kum';
      else if (patika(i, j) || disYol(i, j)) tip = 'cakil';
      blok(tip, i, -1, j);
      if (gol(i, j)) blok('kum', i, -2, j);
      const kenar = i === ADA.x0 || i === ADA.x1 - 1 || j === ADA.z0 || j === ADA.z1 - 1;
      if (kenar) { blok('toprak', i, -2, j); blok('toprak', i, -3, j); blok('tas', i, -4, j); }
    }
  }

  // duvarlar
  const PANO = { i0: 10, i1: 23 };
  for (let i = -1; i <= 40; i++) {
    for (let y = 0; y < 3; y++) {
      const direk = i === -1 || i === 40 || i === 7 || i === 15 || i === 26 || i === 33;
      if (direk) blok('kutuk', i, y, -1);
      else if (y === 0) blok('tasTugla', i, y, -1);
      else if (y === 1) blok(i >= PANO.i0 && i <= PANO.i1 ? 'tahta' : 'cam', i, y, -1);
      else blok('tahta', i, y, -1);
    }
    // ön duvar: alçak, kapı boşluklu
    if (i === -1 || i === 40) for (let y = 0; y < 3; y++) blok('kutuk', i, y, 26);
    else if (i < 20 || i > 22) blok('tasTugla', i, 0, 26);
  }
  for (const y of [3]) for (const i of [7, 15, 33]) blok('isik', i, y, -1);
  for (let j = 0; j <= 25; j++) {
    for (let y = 0; y < 3; y++) {
      const direk = j === 8 || j === 17;
      blok(direk ? 'kutuk' : y === 0 ? 'tasTugla' : y === 1 ? 'cam' : 'tahta', -1, y, j);
      blok(direk ? 'kutuk' : y === 0 ? 'tasTugla' : 'cam', 40, y, j);
    }
    // bölme: kitaplık + cam, koridorda kapı
    if (j <= 9 || j >= 14) { blok('kitaplik', 26, 0, j); blok('cam', 26, 1, j); }
  }
  blok('isik', 26, 2, 4); blok('isik', 26, 2, 20); blok('isik', -1, 3, 8); blok('isik', -1, 3, 17);

  // mutfak tezgâhı ve buzdolabı
  for (let i = 28; i <= 38; i++) { blok('dolap', i, 0, 0); }
  blok('buzdolabi', 39, 0, 0); blok('buzdolabi', 39, 1, 0);

  // koltuk: arkalık ve kolçaklar
  for (let i = 29; i <= 36; i++) blok('yunKoltuk', i, 0, 24);
  blok('yunKoltuk', 28, 0, 23); blok('yunKoltuk', 28, 0, 24); blok('yunKoltuk', 37, 0, 23); blok('yunKoltuk', 37, 0, 24);

  // ağaçlar
  const agaclar = [[-8, -6], [-10, 9], [-7, 21], [-9, 33], [5, -8], [19, -9], [33, -8], [47, -7], [51, 15], [49, 33], [31, 35], [9, 35], [-3, 37], [52, 24], [-12, -1]];
  const rnd = tohum(42);
  for (const [ai, aj] of agaclar) {
    const boy = 4 + ((rnd() * 2) | 0);
    for (let y = 0; y < boy; y++) blok('kutuk', ai, y, aj);
    for (let y = boy - 2; y <= boy + 1; y++) {
      const r = y >= boy ? 1 : 2;
      for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
        if (dx === 0 && dz === 0 && y < boy) continue;
        if (Math.abs(dx) === r && Math.abs(dz) === r && (y === boy + 1 || rnd() < 0.5)) continue;
        blok('yaprak', ai + dx, y, aj + dz);
      }
    }
  }

  const birimKutu = new THREE.BoxGeometry(1, 1, 1);
  const matris = new THREE.Matrix4();
  for (const [tip, liste] of bloklar) {
    const mesh = new THREE.InstancedMesh(birimKutu, M[tip], liste.length);
    liste.forEach(([x, y, z], n) => {
      matris.makeTranslation(x + 0.5, y + 0.5, z + 0.5);
      mesh.setMatrixAt(n, matris);
    });
    const saydam = tip === 'cam' || tip === 'su';
    mesh.castShadow = !saydam && tip !== 'isik';
    mesh.receiveShadow = !saydam;
    if (saydam) mesh.renderOrder = 2;
    sahne.add(mesh);
  }

  // çiçekler
  for (let n = 0; n < 70; n++) {
    const x = ADA.x0 + 1 + rnd() * (ADA.x1 - ADA.x0 - 2);
    const z = ADA.z0 + 1 + rnd() * (ADA.z1 - ADA.z0 - 2);
    const i = Math.floor(x), j = Math.floor(z);
    if (ofisIci(i, j) || ofisSinir(i, j) || gol(i, j) || golKenar(i, j) || patika(i, j) || disYol(i, j)) continue;
    if (agaclar.some(([a, b]) => Math.abs(a - i) <= 2 && Math.abs(b - j) <= 2)) continue;
    const sap = kutu(0.06, 0.35, 0.06, new THREE.MeshLambertMaterial({ color: '#3E7A2A' }), false);
    sap.position.set(x, 0.175, z);
    const cicek = kutu(0.18, 0.14, 0.18, new THREE.MeshLambertMaterial({ color: ['#E4483C', '#F2C230', '#F7F2E8', '#9B6BD6'][(rnd() * 4) | 0] }), false);
    cicek.position.set(x, 0.4, z);
    sahne.add(sap, cicek);
  }

  // bulutlar
  const bulutMal = new THREE.MeshLambertMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.92, emissive: '#FFFFFF', emissiveIntensity: 0.25 });
  const bulutlar = [];
  for (let n = 0; n < 7; n++) {
    const b = new THREE.Group();
    const parca = 2 + ((rnd() * 3) | 0);
    for (let p = 0; p < parca; p++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(4 + rnd() * 6, 1, 3 + rnd() * 4), bulutMal);
      m.position.set(p * 3.5 - parca, 0, (rnd() - 0.5) * 3);
      b.add(m);
    }
    b.position.set(-40 + rnd() * 110, 24 + rnd() * 4, -25 + rnd() * 70);
    sahne.add(b);
    bulutlar.push(b);
  }

  // ---------------------------------------------------------------- mobilyalar
  const renk = (c) => new THREE.MeshLambertMaterial({ color: c });
  const koyu = renk('#2B2B2E');
  const ekle = (m, x, y, z) => { m.position.set(x, y, z); sahne.add(m); return m; };

  const kodDoku = doku(32, 64, (px, g) => {
    g.fillStyle = '#0F1B2E';
    g.fillRect(0, 0, 32, 64);
    const kr = tohum(99);
    const renkler = ['#7FD1FF', '#C89B5C', '#9BE37C', '#F3EFE7', '#E58BD6'];
    for (let y = 1; y < 64; y += 2) {
      let x = 1 + ((kr() * 4) | 0) * 2;
      while (x < 30 && kr() < 0.85) {
        const l = 2 + ((kr() * 6) | 0);
        g.fillStyle = renkler[(kr() * renkler.length) | 0];
        g.fillRect(x, y, Math.min(l, 31 - x), 1);
        x += l + 1;
      }
    }
  });
  kodDoku.wrapT = THREE.RepeatWrapping;
  kodDoku.repeat.set(1, 0.4);
  const ekranPasif = new THREE.MeshLambertMaterial({ color: '#15181C' });
  const masalar = {};

  for (const u of ekip) {
    const ust = u.masa.y < 295;
    const x = bx(u.masa.x), z = bx(u.masa.y);
    const yon = ust ? 1 : -1; // kişinin masaya göre tarafı (+z / -z)
    const tabla = kutu(2.6, 0.1, 1.2, M.tahta);
    ekle(tabla, x, 0.78, z);
    for (const [dx, dz] of [[-1.2, -0.5], [1.2, -0.5], [-1.2, 0.5], [1.2, 0.5]]) ekle(kutu(0.1, 0.73, 0.1, M.tahta), x + dx, 0.365, z + dz);
    // monitör: kişinin karşı tarafında, ona dönük
    const mz = z - yon * 0.35;
    ekle(kutu(0.3, 0.03, 0.2, koyu), x, 0.845, mz);
    ekle(kutu(0.07, 0.2, 0.07, koyu), x, 0.95, mz);
    const ekranDoku = kodDoku.clone();
    ekranDoku.needsUpdate = true;
    const ekranAktif = new THREE.MeshBasicMaterial({ map: ekranDoku });
    const yuzler = [koyu, koyu, koyu, koyu, koyu, koyu];
    const yuzNo = ust ? 4 : 5;
    yuzler[yuzNo] = ekranPasif;
    const monitor = ekle(kutu(1.05, 0.62, 0.07, yuzler), x, 1.3, mz);
    masalar[u.id] = { monitor, yuzNo, ekranAktif, ekranDoku, aktif: false };
    ekle(kutu(0.62, 0.03, 0.2, renk('#3A3A3E')), x, 0.845, z + yon * 0.25);
    ekle(kutu(0.1, 0.03, 0.14, renk('#3A3A3E')), x + 0.5, 0.845, z + yon * 0.25);
    // kupa ve bitki
    ekle(kutu(0.13, 0.15, 0.13, M.yunBeyaz), x - 0.95, 0.905, z - yon * 0.1);
    ekle(kutu(0.22, 0.2, 0.22, renk('#9C5A3C')), x + 1.05, 0.93, z - yon * 0.35);
    ekle(kutu(0.3, 0.3, 0.3, M.yaprak), x + 1.05, 1.18, z - yon * 0.35);
    // kasa
    ekle(kutu(0.32, 0.62, 0.6, koyu), x - 1.0, 0.31, z - yon * 0.1);
    // sandalye: oturma yeri çalışanın renginde
    const sx = bx(u.koltuk.x), sz = bx(u.koltuk.y);
    ekle(kutu(0.42, 0.04, 0.42, koyu), sx, 0.03, sz);
    ekle(kutu(0.07, 0.42, 0.07, koyu), sx, 0.24, sz);
    ekle(kutu(0.62, 0.08, 0.6, renk(u.renk)), sx, 0.46, sz);
    ekle(kutu(0.62, 0.62, 0.08, renk(u.renk)), sx, 0.82, sz + yon * 0.3);
  }

  // mutfak tezgâhının üstü
  const cayMal = renk('#B87333');
  ekle(kutu(0.5, 0.45, 0.5, cayMal), 30.4, 1.225, 0.9);
  ekle(kutu(0.34, 0.28, 0.34, renk('#D08A4A')), 30.4, 1.59, 0.9);
  ekle(kutu(0.08, 0.06, 0.08, koyu), 30.4, 1.76, 0.9);
  ekle(kutu(0.75, 0.85, 0.65, M.demir), 35.2, 1.425, 0.7);
  ekle(kutu(0.5, 0.35, 0.02, koyu), 35.2, 1.55, 1.04);
  ekle(kutu(0.08, 0.08, 0.02, new THREE.MeshBasicMaterial({ color: '#FF4A3A' })), 35.4, 1.25, 1.04);
  ekle(kutu(0.36, 0.42, 0.36, M.cam), 32.8, 1.21, 0.9).renderOrder = 2;
  ekle(kutu(0.26, 0.2, 0.26, renk('#9A6A3A')), 32.8, 1.1, 0.9);
  ekle(kutu(0.28, 0.5, 0.28, M.yunBeyaz), 37.6, 1.25, 0.9);

  // ayak masası
  ekle(kutu(0.2, 0.95, 0.2, M.tahta), bx(845), 0.475, bx(285));
  ekle(kutu(1.15, 0.1, 1.15, M.tahta), bx(845), 1.0, bx(285));
  ekle(kutu(0.25, 0.2, 0.25, renk('#9C5A3C')), bx(845), 1.15, bx(285));
  ekle(kutu(0.16, 0.16, 0.16, renk('#F2C230')), bx(845), 1.33, bx(285));

  // dinlenme köşesi
  const hali = kutu(10, 0.06, 7, M.yunHali, false);
  ekle(hali, 33.2, 0.03, 20.7);
  for (let i = 29; i <= 36; i++) ekle(kutu(1, 0.5, 1, M.yunKoltuk), i + 0.5, 0.25, 23.5);
  ekle(kutu(3.6, 0.1, 1.6, M.tahta), bx(825), 0.45, bx(490));
  for (const [dx, dz] of [[-1.7, -0.7], [1.7, -0.7], [-1.7, 0.7], [1.7, 0.7]]) ekle(kutu(0.1, 0.4, 0.1, M.tahta), bx(825) + dx, 0.2, bx(490) + dz);
  ekle(kutu(0.5, 0.12, 0.35, renk('#3E5F8A')), bx(825) - 0.6, 0.56, bx(490));
  ekle(kutu(0.45, 0.1, 0.32, renk('#8E3B2E')), bx(825) - 0.55, 0.67, bx(490));
  ekle(kutu(0.14, 0.16, 0.14, M.yunBeyaz), bx(825) + 0.8, 0.58, bx(490) + 0.2);

  // saksılar, dolap
  for (const [x, z] of [[0.6, 24.6], [38.6, 3.2], [38.6, 24.6], [25.2, 0.7], [0.6, 0.7]]) {
    ekle(kutu(0.55, 0.5, 0.55, renk('#9C5A3C')), x, 0.25, z);
    ekle(kutu(0.7, 0.7, 0.7, M.yaprak), x, 0.85, z);
  }
  ekle(kutu(0.9, 1.4, 0.8, M.demir), 2.2, 0.7, 25.2);

  // toplantı köşesi: uzun masa, tabureler ve duvarda ekran
  ekle(kutu(6, 0.12, 1.8, M.tahta), 9, 0.78, 22.6);
  for (const dx of [-2.7, 2.7]) for (const dz of [-0.75, 0.75]) ekle(kutu(0.12, 0.72, 0.12, M.tahta), 9 + dx, 0.36, 22.6 + dz);
  for (const dx of [-2, 0, 2]) for (const dz of [-1.45, 1.45]) {
    ekle(kutu(0.5, 0.1, 0.5, M.yunHali), 9 + dx, 0.5, 22.6 + dz);
    ekle(kutu(0.08, 0.45, 0.08, koyu), 9 + dx, 0.225, 22.6 + dz);
  }
  ekle(kutu(0.5, 0.04, 0.35, M.yunBeyaz), 7.6, 0.86, 22.4);
  ekle(kutu(0.3, 0.2, 0.3, renk('#9C5A3C')), 10.4, 0.94, 22.6);
  ekle(kutu(0.32, 0.32, 0.32, M.yaprak), 10.4, 1.2, 22.6);
  ekle(kutu(0.08, 1.3, 2.3, [new THREE.MeshBasicMaterial({ color: '#2E5A8A' }), koyu, koyu, koyu, koyu, koyu]), 0.1, 1.6, 22.6);

  // kitaplıklar, yazıcı, su sebili
  for (const j of [2, 3, 4, 5, 11, 12, 13, 14]) {
    const kit = kutu(0.6, 2, 1, M.kitaplik);
    ekle(kit, 0.3, 1, j + 0.5);
  }
  ekle(kutu(0.8, 0.75, 0.6, M.tahta), 24.8, 0.375, 0.5);
  ekle(kutu(0.7, 0.35, 0.5, renk('#3A3A3E')), 24.8, 0.925, 0.5);
  ekle(kutu(0.45, 0.03, 0.3, M.yunBeyaz), 24.8, 1.115, 0.55);
  ekle(kutu(0.45, 1.0, 0.45, M.yunBeyaz), 25.3, 0.5, 24.9);
  ekle(kutu(0.4, 0.5, 0.4, new THREE.MeshLambertMaterial({ color: '#6FB3E8', transparent: true, opacity: 0.8 })), 25.3, 1.25, 24.9);

  // kapı fenerleri
  for (const x of [19.5, 23.5]) {
    ekle(kutu(0.15, 1.2, 0.15, M.tahta), x, 0.6, 27.3);
    ekle(kutu(0.35, 0.35, 0.35, M.isik), x, 1.35, 27.3);
  }

  // görev panosu
  const panoKanvas = document.createElement('canvas');
  panoKanvas.width = 768;
  panoKanvas.height = 128;
  const panoDoku = new THREE.CanvasTexture(panoKanvas);
  panoDoku.colorSpace = THREE.SRGBColorSpace;
  panoDoku.anisotropy = 4;
  const pano = new THREE.Mesh(new THREE.PlaneGeometry(13.4, 2.2), new THREE.MeshBasicMaterial({ map: panoDoku }));
  pano.position.set((PANO.i0 + PANO.i1 + 1) / 2, 1.55, 0.03);
  sahne.add(pano);
  let panoSon = [0, 0, 0];
  function panoCiz([b, s, t]) {
    panoSon = [b, s, t];
    const g = panoKanvas.getContext('2d');
    g.fillStyle = '#6B4E2E';
    g.fillRect(0, 0, 768, 128);
    g.fillStyle = '#244232';
    g.fillRect(10, 10, 748, 108);
    g.fillStyle = '#F3EFE7';
    g.font = '600 26px "Pixelify Sans", monospace';
    g.textBaseline = 'middle';
    g.fillText('GÖREV PANOSU', 32, 64);
    g.font = '500 30px "Pixelify Sans", monospace';
    const kalemler = [['Bekleyen', b, '#F2C230'], ['Süren', s, '#7FD1FF'], ['Biten', t, '#9BE37C']];
    kalemler.forEach(([ad, n, c], i) => {
      const x = 290 + i * 160;
      g.fillStyle = '#C9D6CC';
      g.fillText(ad, x, 46);
      g.fillStyle = c;
      g.font = '700 40px "Pixelify Sans", monospace';
      g.fillText(String(n), x, 86);
      g.font = '500 30px "Pixelify Sans", monospace';
    });
    panoDoku.needsUpdate = true;
  }
  panoCiz(panoSon);
  document.fonts?.ready.then(() => panoCiz(panoSon));

  // gece ışıkları
  const lambalar = [[8, 2.5, 8], [20, 2.5, 8], [8, 2.5, 18], [20, 2.5, 18], [33, 2.5, 6], [33, 2.5, 20], [21.5, 2, 28]].map(([x, y, z]) => {
    const l = new THREE.PointLight(0xffc477, 0, 14, 1.6);
    l.position.set(x, y, z);
    sahne.add(l);
    return l;
  });

  // ---------------------------------------------------------------- karakterler
  const karakterler = {};
  const tiklanabilir = [];
  ekip.forEach((u, n) => {
    const c = karakterKur(u, n + 3);
    sahne.add(c.kok);
    c.kok.traverse((o) => { if (o.isMesh) tiklanabilir.push(o); });
    const etiket = document.createElement('div');
    etiket.className = 'etiket3b';
    etiket.innerHTML = `<div class="balon"></div><div class="isim-etiket"><i style="background:${u.renk}"></i>${u.ad}</div>`;
    katman.appendChild(etiket);
    c.etiket = etiket;
    c.balonEl = etiket.querySelector('.balon');
    c.isimEl = etiket.querySelector('.isim-etiket');
    karakterler[u.id] = c;
  });

  // tıklayınca çalışan seçimi
  const isin = new THREE.Raycaster();
  const fare = new THREE.Vector2();
  let basis = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { basis = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!basis || Math.hypot(e.clientX - basis[0], e.clientY - basis[1]) > 5) return;
    const r = renderer.domElement.getBoundingClientRect();
    fare.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    isin.setFromCamera(fare, kamera);
    const vurus = isin.intersectObjects(tiklanabilir, false)[0];
    if (vurus) onSec(vurus.object.userData.kisiId);
  });

  // ---------------------------------------------------------------- boyut
  let gen = 1, yuk = 1;
  const boyutla = () => {
    gen = kap.clientWidth || 1;
    yuk = kap.clientHeight || 1;
    renderer.setSize(gen, yuk, false);
    kamera.aspect = gen / yuk;
    kamera.updateProjectionMatrix();
  };
  new ResizeObserver(boyutla).observe(kap);
  boyutla();

  // ---------------------------------------------------------------- gün döngüsü
  let zamanModu = 'oto';
  function gunIsigi() {
    if (zamanModu === 'gunduz') return 1;
    if (zamanModu === 'gece') return 0;
    const d = new Date();
    const s = d.getHours() + d.getMinutes() / 60;
    const sabah = (s - 5.5) / 1.5, aksam = (20.5 - s) / 1.5;
    return Math.max(0, Math.min(1, sabah, aksam));
  }
  function zamanUygula() {
    const g = gunIsigi();
    const alacakaranlik = 1 - Math.abs(g - 0.5) * 2; // 0.5'te en yüksek
    const renkG = gokGece.clone().lerp(gokGunduz, g).lerp(gokAksam, g > 0 && g < 1 ? alacakaranlik * 0.35 : 0);
    sahne.background.copy(renkG);
    sahne.fog.color.copy(renkG);
    gok.intensity = 0.35 + 1.25 * g;
    gunes.intensity = 0.25 + 2.35 * g;
    gunes.color.set(g > 0.15 ? 0xfff1d6 : 0x9fb4ff);
    for (const l of lambalar) l.intensity = (1 - g) * 18;
    bulutMal.emissiveIntensity = 0.05 + 0.2 * g;
  }
  zamanUygula();
  setInterval(zamanUygula, 60000);

  // ---------------------------------------------------------------- kare
  const v = new THREE.Vector3();
  let zaman = 0;
  const yaklas = (a, b, h) => a + (b - a) * Math.min(1, h);
  const acıFark = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

  function kare(dt, kisiler) {
    zaman += dt;
    kontrol.update();
    for (const b of bulutlar) { b.position.x += dt * 0.7; if (b.position.x > 75) b.position.x = -45; }
    for (const m of Object.values(masalar)) if (m.aktif) m.ekranDoku.offset.y -= dt * 0.12;

    for (const k of Object.values(kisiler)) {
      const c = karakterler[k.id];
      const x = bx(k.pos.x), z = bx(k.pos.y);
      const onceki = c.kok.position;
      const dx = x - onceki.x, dz = z - onceki.z;
      const yuruyor = k.yol.length > 0;
      c.kok.position.set(x, 0, z);
      let hedefYaw = c.yaw;
      if (yuruyor && Math.hypot(dx, dz) > 1e-4) hedefYaw = Math.atan2(dx, dz);
      else if (!yuruyor && k.bakis != null) hedefYaw = k.bakis;
      c.yaw += acıFark(c.yaw, hedefYaw) * Math.min(1, dt * 10);
      c.kok.rotation.y = c.yaw;

      const oturuyor = !yuruyor && (k.poz === 'otur' || k.poz === 'yaz');
      const t = zaman * 9 + c.faz;
      const salla = yuruyor ? Math.sin(t) : 0;
      const h = dt * 12;
      c.govdeKap.position.y = yaklas(c.govdeKap.position.y, oturuyor ? -0.12 : 0, h);
      for (const [n, bacak] of c.bacaklar.entries()) {
        const hedef = oturuyor ? -Math.PI / 2 : salla * 0.7 * (n ? -1 : 1);
        bacak.rotation.x = yaklas(bacak.rotation.x, hedef, h);
      }
      const bardakVar = Boolean(k.bardak);
      c.cay.visible = k.bardak === 'cay';
      c.kahve.visible = k.bardak === 'kahve';
      // yudum alma: arada bir bardağı ağza götürür
      if (bardakVar && !yuruyor) {
        c.yudum -= dt;
        if (c.yudum < -3 - (c.faz % 3)) c.yudum = 0.9;
      } else c.yudum = 0;
      const yudumda = c.yudum > 0;

      let sag, sol;
      if (k.poz === 'yaz' && !yuruyor) {
        sag = -1.25 + Math.sin(zaman * 22 + c.faz) * 0.12;
        sol = -1.25 + Math.sin(zaman * 22 + c.faz + 2) * 0.12;
      } else if (oturuyor) {
        sag = bardakVar ? (yudumda ? -1.9 : -0.9) : -0.35;
        sol = -0.35;
      } else {
        sag = bardakVar ? (yudumda ? -1.9 : -0.85) : salla * -0.6 + Math.sin(zaman * 1.5 + c.faz) * 0.04;
        sol = salla * 0.6 - Math.sin(zaman * 1.5 + c.faz) * 0.04;
        if (k.konusuyor && !yuruyor) sol = -0.5 + Math.sin(zaman * 5 + c.faz) * 0.35;
      }
      c.kollar[0].rotation.x = yaklas(c.kollar[0].rotation.x, sag, h);
      c.kollar[1].rotation.x = yaklas(c.kollar[1].rotation.x, sol, h);
      c.kollar[0].rotation.z = yaklas(c.kollar[0].rotation.z, 0, h);
      // baş: yudumda geriye, boşta etrafa bakınır, çalışırken ekrana bakar
      let basX = 0, basY = 0;
      if (yudumda) basX = -0.35;
      else if (k.poz === 'yaz' && !yuruyor) basX = 0.12;
      else if (!yuruyor) basY = Math.sin(zaman * 0.45 + c.faz) * 0.45;
      if (k.konusuyor && !yuruyor) basX = Math.sin(zaman * 6 + c.faz) * 0.08;
      c.basPv.rotation.x = yaklas(c.basPv.rotation.x, basX, dt * 6);
      c.basPv.rotation.y = yaklas(c.basPv.rotation.y, basY, dt * 3);

      // isim etiketi ve balon
      v.set(x, oturuyor ? 1.95 : 2.1, z).project(kamera);
      const gorunur = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2;
      c.etiket.style.display = gorunur ? '' : 'none';
      if (gorunur) {
        c.etiket.style.transform = `translate(${((v.x + 1) / 2) * gen}px, ${((1 - v.y) / 2) * yuk}px) translate(-50%, -100%)`;
        c.etiket.style.zIndex = String(1000 - Math.round(v.z * 500));
      }
      c.isimEl.classList.toggle('secili', Boolean(k.secili));
    }
    renderer.render(sahne, kamera);
  }

  return {
    kare,
    balonEl: (id) => karakterler[id].balonEl,
    yuzResmi: (id) => karakterler[id].yuzUrl,
    masaAktif(id, aktif) {
      const m = masalar[id];
      m.aktif = aktif;
      const yuzler = m.monitor.material.slice();
      yuzler[m.yuzNo] = aktif ? m.ekranAktif : ekranPasif;
      m.monitor.material = yuzler;
    },
    panoGuncelle: (b, s, t) => panoCiz([b, s, t]),
    zamanModu(mod) { zamanModu = mod; zamanUygula(); },
  };
}
