(function () {
'use strict';

var W = 1080, H = 1920, KEY = 'ppt-status-studio-v1';
var CONTACT = '065 197 0461', EMAIL = 'pixelprotechsolutions@proton.me';
var FONT = '"Segoe UI","Helvetica Neue","DejaVu Sans",Arial,sans-serif';
var MONO = 'ui-monospace,"DejaVu Sans Mono",Consolas,monospace';
var C = { bg: '#07060d', pu: '#8b5cf6', pu2: '#7c3aed', pu3: '#a66bff', te: '#2dd4bf', te2: '#08d3a6',
  ink: '#efecfa', mute: '#9d99b8', warn: '#ff6b81', dark: '#0e0d16' };

var THEMES = {
  LAB: { name: 'Lab Check',     hero: 'UNIT HEALTH SCAN', glow: ['#7c3aed', '#08d3a6'] },
  TIP: { name: '60-Second Tip', hero: '60 SECONDS',       glow: ['#08d3a6', '#7c3aed'] },
  PRF: { name: 'Proof',         hero: 'REAL JOB',         glow: ['#7c3aed', '#2dd4bf'] },
  TOL: { name: 'Free Tool',     hero: 'FREE TOOL',        glow: ['#8b5cf6', '#08d3a6'] },
  OFR: { name: 'Offer',         hero: 'FREE CHECK',       glow: ['#08d3a6', '#8b5cf6'] },
  BLT: { name: 'Built Here',    hero: 'BUILT IN-HOUSE',   glow: ['#6d28d9', '#2dd4bf'] }
};
var ORDER = ['LAB', 'TIP', 'PRF', 'TOL', 'OFR', 'BLT'];
// Sun..Sat
var DOW = ['TIP', 'LAB', 'TIP', 'PRF', 'TOL', 'OFR', 'BLT'];

// [headline (15 words max), support line, call to action]
var BANK = {
  LAB: [
    ['30 PCs booting slowly means 30 lessons starting late.', 'Most slow lab PCs need a clean-up, not replacing.', 'Reply LAB for a free lab check'],
    ['One admin PC, no backup. One dead drive away from lost records.', 'A backup takes an afternoon. Recovery takes weeks.', 'Reply LAB for a free lab check'],
    ['Half the lab runs fine. The other half is why classes run late.', 'We find which half, and tell you straight.', 'Reply LAB for a free lab check']
  ],
  TIP: [
    ['Slow PC? Check Startup apps before blaming the hardware.', 'Task Manager, Startup tab, switch off what you never use.', 'Reply TIP for more like this'],
    ['A nearly full drive makes a slow PC. Keep 15% free.', 'Windows needs room to work.', 'Reply TIP for more like this'],
    ['Printer offline? Restart the print spooler before buying a new one.', 'Services, Print Spooler, Restart.', 'Reply TIP for more like this']
  ],
  PRF: [
    ['Fixed. Tested. Documented.', 'A real job on a real machine. No stock photos.', 'Reply FIX for a repair quote'],
    ['Before and after. Same machine.', 'Every job gets a record, so nothing is a guess.', 'Reply FIX for a repair quote']
  ],
  TOL: [
    ['Pixel Typing Machine. Free for school computer labs.', 'Built in-house by PixelProTech.', 'Reply TYPE and we send it'],
    ['Pixel Office. Free for schools and community offices.', 'Built in-house by PixelProTech.', 'Reply OFFICE and we send it']
  ],
  OFR: [
    ['Free lab health check for schools and offices.', 'We look, we report, you decide. No obligation.', 'Reply LAB to book yours'],
    ['Dead laptop or drive? Get a repair quote first.', 'Gauteng-based. Honest diagnosis before any work.', 'Reply FIX for a quote']
  ],
  BLT: [
    ['Built here. Not bought, not copied.', 'Every PixelProTech app is written in-house.', 'Reply BUILD to see one'],
    ['No templates. No middlemen. Just built.', 'Software for offices, schools and communities.', 'Reply BUILD to see one']
  ]
};

/* ---------- helpers ---------- */
function $(id) { return document.getElementById(id); }
function p2(n) { return n < 10 ? '0' + n : '' + n; }
function ds(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
function pd(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
function add(s, n) { var d = pd(s); d.setDate(d.getDate() + n); return ds(d); }
function pid(dateStr, th) { var a = dateStr.split('-'); return 'PPT-' + a[0].slice(2) + a[1] + a[2] + '-' + th; }
function dmy(s) { var a = s.split('-'); return a[2] + '.' + a[1] + '.' + a[0]; }
var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mk(seed) {
  var a = seed;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hexA(hex, a) {
  var n = parseInt(hex.slice(1), 16);
  return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
}
function words(t) { t = (t || '').trim(); return t ? t.split(/\s+/).length : 0; }

/* ---------- state ---------- */
function todayStr() { return ds(new Date()); }
function fresh(dateStr, occ) {
  var th = DOW[pd(dateStr).getDay()], b = BANK[th], e = b[(occ || 0) % b.length];
  return { theme: th, h: e[0], s: e[1], c: e[2], label: THEMES[th].hero, done: false, views: '', replies: '', dms: '' };
}
var S = load() || { start: todayStr(), posts: {}, current: todayStr() };
var imgA = null, imgB = null;

function load() { try { var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

function gen(start, force) {
  var occ = {};
  for (var i = 0; i < 14; i++) {
    var d = add(start, i), th = DOW[pd(d).getDay()];
    occ[th] = occ[th] || 0;
    if (!S.posts[d] || (force && !S.posts[d].done)) S.posts[d] = fresh(d, occ[th]);
    occ[th]++;
  }
}
function cur() {
  if (!S.posts[S.current]) {
    var n = 0, th = DOW[pd(S.current).getDay()];
    Object.keys(S.posts).forEach(function (k) { if (S.posts[k].theme === th) n++; });
    S.posts[S.current] = fresh(S.current, n);
  }
  return S.posts[S.current];
}

/* ---------- canvas primitives ---------- */
function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function lg(c, x0, y0, x1, y1, a, b) { var g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function spacing(c, px) { if ('letterSpacing' in c) c.letterSpacing = px + 'px'; }
function wrap(c, text, maxW) {
  var ws = (text || '').split(/\s+/).filter(Boolean), lines = [], line = '';
  ws.forEach(function (w) {
    var t = line ? line + ' ' + w : w;
    if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  });
  if (line) lines.push(line);
  return lines;
}
function cover(c, img, x, y, w, h) {
  var k = Math.max(w / img.width, h / img.height), iw = img.width * k, ih = img.height * k;
  c.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function ph(c, x, y, w, h, msg) {
  c.save();
  c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 3; c.setLineDash([14, 12]);
  rr(c, x + 14, y + 14, w - 28, h - 28, 24); c.stroke(); c.setLineDash([]);
  c.fillStyle = C.mute; c.font = '700 30px ' + MONO; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(msg, x + w / 2, y + h / 2);
  c.restore();
}

/* ---------- the mark (redrawn from the supplied logo) ---------- */
function drawMark(c, cx, cy, d, o) {
  o = o || {};
  var k = d / 338;
  c.save(); c.translate(cx, cy); c.scale(k, k); c.translate(-320, -320);
  c.lineWidth = 2.2; c.strokeStyle = 'rgba(255,255,255,' + (o.draft ? 0.32 : 0.15) + ')';
  if (o.draft) c.setLineDash([8, 8]);
  c.beginPath(); c.arc(320, 320, 169, 0, 6.2832); c.stroke(); c.setLineDash([]);
  c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(320, 205); c.lineTo(320, 243); c.moveTo(205, 320); c.lineTo(243, 320); c.stroke();
  c.fillStyle = C.te2;
  [[320, 205], [205, 320]].forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], 6, 0, 6.2832); c.fill(); });
  // top-left solid purple
  rr(c, 243, 243, 97, 97, 23); c.fillStyle = lg(c, 243, 243, 340, 340, C.pu3, '#7a2fff'); c.fill();
  // top-right teal outline
  rr(c, 360, 243, 98, 98, 25);
  if (!o.draft) { c.fillStyle = C.dark; c.fill(); }
  c.lineWidth = 4.5; c.strokeStyle = C.te; c.stroke();
  c.fillStyle = C.te2; c.beginPath(); c.arc(435, 320, 6, 0, 6.2832); c.fill();
  // bottom-left purple outline
  rr(c, 242, 359, 99, 99, 25);
  if (o.draft) { c.setLineDash([10, 8]); c.lineWidth = 4; c.strokeStyle = 'rgba(139,60,255,.8)'; c.stroke(); c.setLineDash([]); }
  else { c.fillStyle = C.dark; c.fill(); c.lineWidth = 4.5; c.strokeStyle = '#8b3cff'; c.stroke(); }
  c.fillStyle = C.te2; c.beginPath(); c.arc(320, 435, 6, 0, 6.2832); c.fill();
  // bottom-right solid teal
  rr(c, 360, 360, 97, 97, 23);
  if (o.draft) { c.fillStyle = 'rgba(8,211,166,.14)'; c.fill(); c.setLineDash([10, 8]); c.lineWidth = 3; c.strokeStyle = 'rgba(45,212,191,.6)'; c.stroke(); c.setLineDash([]); }
  else { c.fillStyle = lg(c, 360, 360, 457, 457, '#3fe6c8', '#08d3a6'); c.fill(); }
  c.restore();
}

/* ---------- layers ---------- */
function drawBg(c, R, T) {
  c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
  var g1 = c.createRadialGradient(W * (.1 + R() * .3), H * (.05 + R() * .2), 0, W * .3, H * .2, 1100);
  g1.addColorStop(0, hexA(T.glow[0], .38)); g1.addColorStop(1, hexA(T.glow[0], 0));
  c.fillStyle = g1; c.fillRect(0, 0, W, H);
  var g2 = c.createRadialGradient(W * (.6 + R() * .35), H * (.7 + R() * .25), 0, W * .8, H * .85, 1000);
  g2.addColorStop(0, hexA(T.glow[1], .22)); g2.addColorStop(1, hexA(T.glow[1], 0));
  c.fillStyle = g2; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,255,255,.07)';
  for (var i = 0; i < 160; i++) c.fillRect(R() * W, R() * H, 2, 2);
  c.strokeStyle = 'rgba(255,255,255,.035)'; c.lineWidth = 2;
  for (var j = 0; j < 3; j++) { var y = H * (.15 + R() * .7); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y + (R() - .5) * 300); c.stroke(); }
}

function drawHeader(c, T) {
  drawMark(c, 150, 335, 124);
  c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  c.fillStyle = C.ink; c.font = '800 44px ' + FONT; spacing(c, 5); c.fillText('PIXELPROTECH', 232, 330);
  c.fillStyle = C.mute; c.font = '600 24px ' + MONO; spacing(c, 3); c.fillText('SOLUTIONS (PTY) LTD', 234, 368); spacing(c, 0);
  c.font = '700 24px ' + MONO; spacing(c, 3);
  var t = T.name.toUpperCase(), w = c.measureText(t).width + 44, x = W - 90 - w;
  rr(c, x, 306, w, 58, 29); c.fillStyle = 'rgba(45,212,191,.12)'; c.fill();
  c.lineWidth = 2; c.strokeStyle = 'rgba(45,212,191,.7)'; c.stroke();
  c.fillStyle = C.te; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x + w / 2 + 1, 336);
  spacing(c, 0);
}

function drawCopy(c, p) {
  c.textAlign = 'left'; c.textBaseline = 'top';
  rr(c, 90, 975, 110, 10, 5); c.fillStyle = lg(c, 90, 0, 200, 0, C.pu, C.te2); c.fill();
  var size = 96, lines;
  for (; size >= 56; size -= 4) {
    c.font = '800 ' + size + 'px ' + FONT;
    lines = wrap(c, p.h, 900);
    if (lines.length <= 3) break;
  }
  c.fillStyle = C.ink; c.font = '800 ' + size + 'px ' + FONT;
  var y = 1008, lh = Math.round(size * 1.1);
  lines.slice(0, 3).forEach(function (l) { c.fillText(l, 90, y); y += lh; });
  y += 14;
  c.font = '400 40px ' + FONT; c.fillStyle = C.mute;
  wrap(c, p.s, 900).slice(0, 2).forEach(function (l) { c.fillText(l, 90, y); y += 54; });
  // CTA pill (fixed position so layout never drifts)
  c.font = '800 38px ' + FONT;
  var txt = p.c || '', tw = c.measureText(txt).width + 160;
  tw = Math.min(tw, 900);
  rr(c, 90, 1465, tw, 84, 42); c.fillStyle = lg(c, 90, 1465, 90 + tw, 1549, C.te, C.te2); c.fill();
  c.fillStyle = '#07110f'; c.textBaseline = 'middle'; c.fillText(txt, 90 + 36, 1508);
  c.font = '800 40px ' + FONT; c.textAlign = 'right'; c.fillText('→', 90 + tw - 34, 1507); c.textAlign = 'left';
}

function drawFooter(c, id) {
  c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(90, 1576); c.lineTo(990, 1576); c.stroke();
  c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  c.fillStyle = C.te; c.font = '800 42px ' + FONT; c.fillText(CONTACT, 90, 1628);
  c.textAlign = 'right'; c.fillStyle = C.mute; c.font = '600 26px ' + MONO; c.fillText(id, 990, 1626);
  c.textAlign = 'left'; c.font = '500 24px ' + FONT; c.fillStyle = C.mute;
  c.fillText(EMAIL + '  ·  Gauteng, South Africa', 90, 1664);
}

// tiled micro-mark across the whole image (hard to crop or erase)
function drawTile(c, id) {
  c.save();
  c.globalAlpha = 0.055; c.translate(W / 2, H / 2); c.rotate(-0.38); c.translate(-W / 2, -H / 2);
  c.fillStyle = '#ffffff'; c.font = '700 22px ' + MONO; c.textBaseline = 'middle'; c.textAlign = 'left';
  var label = 'PIXELPROTECH SOLUTIONS · ' + CONTACT + ' · ' + id;
  var step = 150, row = 0;
  for (var y = -700; y < H + 700; y += step, row++) {
    for (var x = -900 + (row % 2) * 300; x < W + 900; x += 880) {
      drawMarkMono(c, x + 20, y, 40);
      c.fillText(label, x + 56, y);
    }
  }
  c.restore();
}
function drawMarkMono(c, cx, cy, d) {
  var k = d / 338; c.save(); c.translate(cx, cy); c.scale(k, k); c.translate(-320, -320);
  c.fillStyle = '#fff'; c.strokeStyle = '#fff'; c.lineWidth = 12;
  rr(c, 243, 243, 97, 97, 23); c.fill();
  rr(c, 360, 243, 98, 98, 25); c.stroke();
  rr(c, 242, 359, 99, 99, 25); c.stroke();
  rr(c, 360, 360, 97, 97, 23); c.fill();
  c.restore();
}

/* ---------- hero art, one distinct visual per theme ---------- */
var HERO = {};

HERO.LAB = function (c, b, R, p) {
  var cols = 8, rows = 5, gap = 14, s = Math.floor(Math.min((b.w - gap * (cols - 1)) / cols, (b.h - 90 - gap * (rows - 1)) / rows));
  var gw = cols * s + (cols - 1) * gap, x0 = b.x + (b.w - gw) / 2, y0 = b.y + 90;
  var total = cols * rows, nf = 3 + Math.floor(R() * 3), faults = {}, k = 0;
  while (k < nf) { var q = Math.floor(R() * total); if (!faults[q]) { faults[q] = 1; k++; } }
  var scanRow = Math.floor(R() * rows);
  c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  c.font = '700 28px ' + MONO; spacing(c, 3); c.fillStyle = C.mute; c.fillText((p.label || '').toUpperCase(), b.x, b.y + 36);
  c.textAlign = 'right'; c.fillStyle = C.te; c.fillText(total + ' UNITS · ' + nf + ' FAULTS', b.x + b.w, b.y + 36); spacing(c, 0);
  // scan band
  var by = y0 + scanRow * (s + gap) - 8;
  c.fillStyle = lg(c, 0, by, 0, by + s + 16, 'rgba(45,212,191,0)', 'rgba(45,212,191,.16)'); c.fillRect(b.x, by, b.w, s + 16);
  for (var i = 0; i < total; i++) {
    var cx = x0 + (i % cols) * (s + gap), cy = y0 + Math.floor(i / cols) * (s + gap), r = s * 0.24;
    rr(c, cx, cy, s, s, r);
    if (faults[i]) {
      c.fillStyle = C.dark; c.fill(); c.lineWidth = 4; c.strokeStyle = C.warn; c.stroke();
      c.strokeStyle = C.warn; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(cx + s * .32, cy + s * .32); c.lineTo(cx + s * .68, cy + s * .68); c.moveTo(cx + s * .68, cy + s * .32); c.lineTo(cx + s * .32, cy + s * .68); c.stroke();
    } else if (R() < 0.16) {
      c.fillStyle = lg(c, cx, cy, cx + s, cy + s, '#3fe6c8', C.te2); c.fill();
    } else {
      c.fillStyle = lg(c, cx, cy, cx + s, cy + s, C.pu3, '#7a2fff'); c.globalAlpha = 0.9; c.fill(); c.globalAlpha = 1;
    }
  }
};

HERO.TIP = function (c, b, R, p) {
  var cx = b.x + b.w / 2, cy = b.y + b.h / 2 + 20, r = 190, frac = 0.55 + R() * 0.35, a0 = -Math.PI / 2, a1 = a0 + frac * Math.PI * 2;
  c.lineCap = 'round';
  c.lineWidth = 26; c.strokeStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.stroke();
  c.strokeStyle = lg(c, cx - r, cy - r, cx + r, cy + r, C.pu, C.te2); c.beginPath(); c.arc(cx, cy, r, a0, a1); c.stroke();
  for (var i = 0; i < 60; i++) {
    var a = a0 + i / 60 * Math.PI * 2, big = i % 5 === 0, r1 = 232, r2 = big ? 266 : 250;
    c.lineWidth = big ? 5 : 3; c.strokeStyle = (i / 60 <= frac) ? (big ? C.te : 'rgba(45,212,191,.55)') : 'rgba(255,255,255,.16)';
    c.beginPath(); c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); c.stroke();
  }
  var ex = cx + Math.cos(a1) * r, ey = cy + Math.sin(a1) * r;
  c.save(); c.shadowColor = C.te; c.shadowBlur = 40; c.fillStyle = C.te; c.beginPath(); c.arc(ex, ey, 17, 0, 6.2832); c.fill(); c.restore();
  c.fillStyle = C.ink; c.font = '900 190px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('60', cx, cy - 12);
  c.font = '700 30px ' + MONO; spacing(c, 8); c.fillStyle = C.mute; c.fillText('SECONDS', cx + 4, cy + 100); spacing(c, 0);
  c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.font = '700 26px ' + MONO; spacing(c, 3); c.fillStyle = C.te; c.fillText((p.label || '').toUpperCase(), b.x, b.y + 30); spacing(c, 0);
};

function brackets(c, x, y, w, h, col) {
  var L = 70, m = 22; c.strokeStyle = col; c.lineWidth = 8; c.lineCap = 'round';
  [[x + m, y + m, 1, 1], [x + w - m, y + m, -1, 1], [x + m, y + h - m, 1, -1], [x + w - m, y + h - m, -1, -1]].forEach(function (q) {
    c.beginPath(); c.moveTo(q[0], q[1] + q[3] * L); c.lineTo(q[0], q[1]); c.lineTo(q[0] + q[2] * L, q[1]); c.stroke();
  });
}
function chip(c, x, y, text, col) {
  c.font = '700 24px ' + MONO; spacing(c, 2);
  var w = c.measureText(text).width + 36;
  rr(c, x, y, w, 48, 24); c.fillStyle = 'rgba(7,6,13,.78)'; c.fill(); c.lineWidth = 2; c.strokeStyle = col; c.stroke();
  c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(text, x + 18, y + 25); spacing(c, 0);
  return w;
}

HERO.PRF = function (c, b, R, p, dateStr) {
  c.save(); rr(c, b.x, b.y, b.w, b.h, 36); c.clip();
  c.fillStyle = C.dark; c.fillRect(b.x, b.y, b.w, b.h);
  if (imgA && imgB) {
    var hw = b.w / 2;
    c.save(); c.beginPath(); c.rect(b.x, b.y, hw, b.h); c.clip(); cover(c, imgA, b.x, b.y, hw, b.h); c.restore();
    c.save(); c.beginPath(); c.rect(b.x + hw, b.y, hw, b.h); c.clip(); cover(c, imgB, b.x + hw, b.y, hw, b.h); c.restore();
    c.fillStyle = C.te; c.fillRect(b.x + hw - 2, b.y, 4, b.h);
  } else if (imgA) cover(c, imgA, b.x, b.y, b.w, b.h);
  else ph(c, b.x, b.y, b.w, b.h, 'ADD YOUR OWN JOB PHOTO (IMAGE A)');
  var sy = b.y + b.h * (0.25 + R() * 0.5);
  c.fillStyle = lg(c, 0, sy - 40, 0, sy + 4, 'rgba(45,212,191,0)', 'rgba(45,212,191,.28)'); c.fillRect(b.x, sy - 40, b.w, 44);
  c.fillStyle = C.te; c.fillRect(b.x, sy, b.w, 3);
  c.restore();
  c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.16)'; rr(c, b.x, b.y, b.w, b.h, 36); c.stroke();
  brackets(c, b.x, b.y, b.w, b.h, C.te);
  chip(c, b.x + 40, b.y + b.h - 88, (p.label || 'REAL JOB').toUpperCase() + ' · ' + dmy(dateStr), C.te);
  if (imgA && imgB) { chip(c, b.x + 40, b.y + 40, 'BEFORE', C.warn); chip(c, b.x + b.w / 2 + 40, b.y + 40, 'AFTER', C.te); }
};

HERO.TOL = function (c, b, R, p) {
  var x = b.x + 10, y = b.y + 10, w = b.w - 20, h = b.h - 20;
  c.save(); c.shadowColor = hexA(C.pu2, .7); c.shadowBlur = 70; rr(c, x, y, w, h, 32); c.fillStyle = C.dark; c.fill(); c.restore();
  c.save(); rr(c, x, y, w, h, 32); c.clip();
  c.fillStyle = C.dark; c.fillRect(x, y, w, h);
  var cy0 = y + 60;
  if (imgA) { c.save(); c.beginPath(); c.rect(x, cy0, w, h - 60); c.clip(); cover(c, imgA, x, cy0, w, h - 60); c.restore(); }
  else ph(c, x, cy0, w, h - 60, 'ADD YOUR OWN SCREENSHOT (IMAGE A)');
  c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(x, y, w, 60);
  c.restore();
  [[C.pu, 0], [C.te, 1], [C.mute, 2]].forEach(function (q) { c.fillStyle = q[0]; c.beginPath(); c.arc(x + 38 + q[1] * 30, y + 30, 8, 0, 6.2832); c.fill(); });
  c.fillStyle = C.mute; c.font = '700 22px ' + MONO; spacing(c, 3); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText((p.label || '').toUpperCase(), x + w / 2, y + 31); spacing(c, 0);
  rr(c, x, y, w, h, 32); c.lineWidth = 5; c.strokeStyle = lg(c, x, y, x + w, y + h, C.pu, C.te); c.stroke();
};

HERO.OFR = function (c, b, R, p) {
  var cx = b.x + b.w / 2, cy = b.y + 215;
  c.lineWidth = 3;
  [330, 275, 220].forEach(function (r, i) {
    c.setLineDash(i === 1 ? [4, 14] : [22, 14]); c.strokeStyle = 'rgba(255,255,255,' + (0.16 - i * 0.03) + ')';
    c.beginPath(); c.arc(cx, cy, r, R() * 6, R() * 6 + 6.2832); c.stroke();
  });
  c.setLineDash([]);
  c.save(); c.shadowColor = hexA(C.pu2, .6); c.shadowBlur = 80; drawMark(c, cx, cy, 340); c.restore();
  var tw = 600, th = 84, tx = cx - tw / 2, ty = b.y + b.h - 92;
  rr(c, tx, ty, tw, th, 18); c.fillStyle = lg(c, tx, ty, tx + tw, ty, C.pu2, C.te2); c.fill();
  c.fillStyle = C.bg; c.beginPath(); c.arc(tx, ty + th / 2, 16, 0, 6.2832); c.arc(tx + tw, ty + th / 2, 16, 0, 6.2832); c.fill();
  c.setLineDash([6, 8]); c.strokeStyle = 'rgba(7,6,13,.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(tx + 90, ty + 12); c.lineTo(tx + 90, ty + th - 12); c.stroke(); c.setLineDash([]);
  c.fillStyle = '#07060d'; c.font = '800 34px ' + MONO; spacing(c, 4); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText((p.label || '').toUpperCase(), cx + 45, ty + th / 2 + 2); spacing(c, 0);
};

HERO.BLT = function (c, b, R, p) {
  c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 2;
  for (var gx = b.x; gx <= b.x + b.w; gx += 60) { c.beginPath(); c.moveTo(gx, b.y); c.lineTo(gx, b.y + b.h); c.stroke(); }
  for (var gy = b.y; gy <= b.y + b.h; gy += 60) { c.beginPath(); c.moveTo(b.x, gy); c.lineTo(b.x + b.w, gy); c.stroke(); }
  var cx = b.x + b.w / 2, cy = b.y + b.h / 2 + 10, d = 400;
  drawMark(c, cx, cy, d, { draft: true });
  // dimension lines
  var k = d / 338, left = cx + (243 - 320) * k, right = cx + (458 - 320) * k, top = cy + (243 - 320) * k, bot = cy + (458 - 320) * k;
  c.strokeStyle = C.te; c.lineWidth = 2; c.fillStyle = C.te; c.font = '700 22px ' + MONO; c.textAlign = 'center'; c.textBaseline = 'middle';
  var ay = top - 56;
  c.beginPath(); c.moveTo(left, ay); c.lineTo(right, ay); c.moveTo(left, ay - 12); c.lineTo(left, ay + 12); c.moveTo(right, ay - 12); c.lineTo(right, ay + 12); c.stroke();
  c.fillText('2 x 2 GRID', cx + (left + right) / 2 - cx, ay - 24);
  var ax = left - 70;
  c.beginPath(); c.moveTo(ax, top); c.lineTo(ax, bot); c.moveTo(ax - 12, top); c.lineTo(ax + 12, top); c.moveTo(ax - 12, bot); c.lineTo(ax + 12, bot); c.stroke();
  // crosshair
  c.strokeStyle = 'rgba(255,255,255,.3)'; c.setLineDash([6, 8]);
  c.beginPath(); c.moveTo(cx, b.y + 20); c.lineTo(cx, b.y + b.h - 20); c.moveTo(b.x + 20, cy); c.lineTo(b.x + b.w - 20, cy); c.stroke(); c.setLineDash([]);
  c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.font = '700 26px ' + MONO; spacing(c, 3); c.fillStyle = C.te;
  c.fillText((p.label || '').toUpperCase(), b.x, b.y + 30);
  c.textAlign = 'right'; c.fillStyle = C.mute; c.fillText('REV ' + (10 + Math.floor(R() * 89)), b.x + b.w, b.y + 30); spacing(c, 0);
};

/* ---------- render ---------- */
var cv, queued = false;
function render() {
  var p = cur(); if (!p) return;
  var c = cv.getContext('2d'), id = pid(S.current, p.theme), R = mk(hash(id)), T = THEMES[p.theme];
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  c.lineCap = 'butt'; c.setLineDash([]); c.globalAlpha = 1; spacing(c, 0);
  drawBg(c, R, T);
  drawHeader(c, T);
  HERO[p.theme](c, { x: 90, y: 450, w: 900, h: 490 }, R, p, S.current);
  drawCopy(c, p);
  drawFooter(c, id);
  drawTile(c, id);
}
function schedule() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; render(); }); }

/* ---------- Studio UI ---------- */
function say(t) { $('msg').textContent = t || ''; }
function syncStudio() {
  var p = cur();
  $('dt').value = S.current; $('th').value = p.theme; $('hl').value = p.h; $('sb').value = p.s; $('ct').value = p.c; $('lb').value = p.label;
  $('postId').textContent = pid(S.current, p.theme);
  var n = words(p.h), wc = $('wc'); wc.textContent = n + '/15'; wc.className = 'count' + (n > 15 ? ' bad' : '');
}
function setCurrent(d) { S.current = d; save(); syncStudio(); schedule(); renderQueue(); }

function bindStudio() {
  var th = $('th');
  ORDER.forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = THEMES[k].name; th.appendChild(o); });

  $('dt').addEventListener('change', function () { if (this.value) setCurrent(this.value); });
  $('today').addEventListener('click', function () { setCurrent(todayStr()); });
  th.addEventListener('change', function () {
    var p = cur(), oldDef = THEMES[p.theme].hero, wasDefault = p.label === oldDef;
    // Post ID is built from date + theme, so move the post to match
    p.theme = th.value; if (wasDefault) p.label = THEMES[p.theme].hero;
    save(); syncStudio(); schedule(); renderQueue();
  });
  function field(id, key) {
    $(id).addEventListener('input', function () { cur()[key] = this.value; save(); syncStudio_counts(); schedule(); });
  }
  function syncStudio_counts() { var n = words(cur().h), wc = $('wc'); wc.textContent = n + '/15'; wc.className = 'count' + (n > 15 ? ' bad' : ''); renderQueue(); }
  field('hl', 'h'); field('sb', 's'); field('ct', 'c'); field('lb', 'label');

  function pick(id, which) {
    $(id).addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) { if (which === 'A') imgA = null; else imgB = null; schedule(); return; }
      var im = new Image(), u = URL.createObjectURL(f);
      im.onload = function () { if (which === 'A') imgA = im; else imgB = im; schedule(); };
      im.onerror = function () { say('That image could not be read. Try a PNG or JPG.'); };
      im.src = u;
    });
  }
  pick('fa', 'A'); pick('fb', 'B');

  $('reset').addEventListener('click', function () {
    var n = 0, th2 = cur().theme, bank = BANK[th2];
    Object.keys(S.posts).forEach(function (k) { if (k < S.current && S.posts[k].theme === th2) n++; });
    var e = bank[n % bank.length], p = cur();
    p.h = e[0]; p.s = e[1]; p.c = e[2]; p.label = THEMES[th2].hero; save(); syncStudio(); schedule(); say('Copy reset to the suggested text.');
  });

  $('dl').addEventListener('click', function () { exportPng(false); });
  $('dlsrc').addEventListener('click', function () { exportPng(true); });
  if (!(navigator.canShare && navigator.share)) $('share').style.display = 'none';
  $('share').addEventListener('click', shareFile);
}

function download(blob, name) {
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
}
function sha256(blob) {
  if (!(window.crypto && crypto.subtle && blob.arrayBuffer)) return Promise.resolve('unavailable');
  return blob.arrayBuffer().then(function (buf) { return crypto.subtle.digest('SHA-256', buf); }).then(function (d) {
    return Array.prototype.map.call(new Uint8Array(d), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }).catch(function () { return 'unavailable'; });
}
function exportPng(withSource) {
  render();
  var p = cur(), id = pid(S.current, p.theme);
  if (words(p.h) > 15) say('Headline is over 15 words. Exported anyway, but shorter posts get read.');
  cv.toBlob(function (blob) {
    if (!blob) { say('Export failed. Try again.'); return; }
    download(blob, id + '.png');
    if (withSource) {
      sha256(blob).then(function (hx) {
        var src = { postId: id, company: 'PixelProTech Solutions (Pty) Ltd', contact: CONTACT, date: S.current, theme: THEMES[p.theme].name,
          headline: p.h, support: p.s, cta: p.c, visualLabel: p.label, canvas: W + 'x' + H, pngSha256: hx, exportedAt: new Date().toISOString(),
          tool: 'PixelProTech Status Studio v1' };
        download(new Blob([JSON.stringify(src, null, 2)], { type: 'application/json' }), id + '.json');
        say('Saved ' + id + '.png and ' + id + '.json. Keep both in your dated post folder and back it up.');
      });
    } else say('Saved ' + id + '.png');
  }, 'image/png');
}
function shareFile() {
  render();
  var p = cur(), id = pid(S.current, p.theme);
  cv.toBlob(function (blob) {
    if (!blob) return;
    var f = new File([blob], id + '.png', { type: 'image/png' });
    if (navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: id }).catch(function () {});
    else say('Sharing files is not supported here. Use Download PNG.');
  }, 'image/png');
}

/* ---------- Queue ---------- */
function renderQueue() {
  var ul = $('qlist'); if (!ul) return;
  ul.textContent = '';
  var keys = Object.keys(S.posts).sort();
  keys.forEach(function (d) {
    var p = S.posts[d], li = document.createElement('li');
    li.className = 'qi' + (p.done ? ' done' : '') + (d === S.current ? ' cur' : '');
    var qd = document.createElement('div'); qd.className = 'qd';
    var b = document.createElement('b'); b.textContent = DN[pd(d).getDay()] + ' ' + dmy(d).slice(0, 5); qd.appendChild(b);
    qd.appendChild(document.createTextNode(pid(d, p.theme).slice(-3)));
    var mid = document.createElement('div');
    var qt = document.createElement('div'); qt.className = 'qt'; qt.textContent = THEMES[p.theme].name;
    var qh = document.createElement('div'); qh.className = 'qh'; qh.textContent = p.h;
    mid.appendChild(qt); mid.appendChild(qh);
    var qa = document.createElement('div'); qa.className = 'qa';
    var open = document.createElement('button'); open.type = 'button'; open.textContent = 'Open';
    open.addEventListener('click', function () { setCurrent(d); switchTab('studio'); window.scrollTo(0, 0); });
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!p.done; cb.title = 'Posted';
    cb.addEventListener('change', function () { p.done = cb.checked; save(); renderQueue(); renderLog(); });
    qa.appendChild(open); qa.appendChild(cb);
    li.appendChild(qd); li.appendChild(mid); li.appendChild(qa);
    ul.appendChild(li);
  });
}

/* ---------- Results log ---------- */
function num(v) { var n = parseInt(v, 10); return isNaN(n) ? null : n; }
function renderLog() {
  var ul = $('llist'), sum = $('sum'); if (!ul) return;
  ul.textContent = '';
  var keys = Object.keys(S.posts).sort().filter(function (d) { return S.posts[d].done; });
  var tv = 0, tn = 0, tr = 0, byTheme = {};
  keys.forEach(function (d) {
    var p = S.posts[d], li = document.createElement('li'); li.className = 'li';
    var h = document.createElement('div'); h.className = 'qt'; h.textContent = pid(d, p.theme) + '  ·  ' + p.h; li.appendChild(h);
    var nums = document.createElement('div'); nums.className = 'nums';
    [['views', 'School/office views'], ['replies', 'Replies'], ['dms', 'Real conversations']].forEach(function (f) {
      var lb = document.createElement('label'); lb.textContent = f[1];
      var inp = document.createElement('input'); inp.type = 'number'; inp.min = '0'; inp.value = p[f[0]];
      inp.addEventListener('input', function () { p[f[0]] = inp.value; save(); renderSummary(); });
      lb.appendChild(inp); nums.appendChild(lb);
    });
    li.appendChild(nums); ul.appendChild(li);
  });
  if (!keys.length) { var e = document.createElement('li'); e.className = 'hint'; e.textContent = 'Tick a post as posted in the 14-Day Queue and it shows up here.'; ul.appendChild(e); }
  renderSummary();
}
function renderSummary() {
  var sum = $('sum'), posts = Object.keys(S.posts).map(function (d) { return S.posts[d]; }).filter(function (p) { return p.done; });
  var withViews = posts.filter(function (p) { return num(p.views) !== null; });
  var v = 0, r = 0, m = 0, byT = {};
  withViews.forEach(function (p) {
    var a = num(p.views) || 0, b = num(p.replies) || 0, cc = num(p.dms) || 0; v += a; r += b; m += cc;
    var t = byT[p.theme] = byT[p.theme] || { v: 0, r: 0, n: 0 }; t.v += a; t.r += b; t.n++;
  });
  sum.textContent = '';
  var l1 = document.createElement('div');
  l1.innerHTML = '';
  var avg = withViews.length ? (v / withViews.length) : 0;
  l1.appendChild(document.createTextNode('Posted: ' + posts.length + '  ·  with numbers: ' + withViews.length + '  ·  avg school/office views: '));
  var bb = document.createElement('b'); bb.textContent = withViews.length ? avg.toFixed(1) : '-'; l1.appendChild(bb);
  l1.appendChild(document.createTextNode('  ·  replies: ' + r + '  ·  conversations: ' + m));
  sum.appendChild(l1);
  var best = Object.keys(byT).sort(function (a, b) { return (byT[b].r + byT[b].v / 100) / byT[b].n - (byT[a].r + byT[a].v / 100) / byT[a].n; })[0];
  if (best && withViews.length >= 4) {
    var l2 = document.createElement('div'); l2.textContent = 'Best theme so far: ' + THEMES[best].name + '. Keep it. Cut the weakest after 14 days.'; sum.appendChild(l2);
  }
  if (withViews.length >= 7 && avg < 5) {
    var l3 = document.createElement('div'); l3.className = 'warn';
    l3.textContent = 'Fewer than 5 school/office viewers per post after 7 posts. Status is not your main channel. Move to Plan B: a WhatsApp Channel plus one-to-one follow-ups.';
    sum.appendChild(l3);
  }
}
function csv() {
  var rows = [['post_id', 'date', 'theme', 'headline', 'school_office_views', 'replies', 'conversations']];
  Object.keys(S.posts).sort().forEach(function (d) {
    var p = S.posts[d]; if (!p.done) return;
    rows.push([pid(d, p.theme), d, THEMES[p.theme].name, p.h, p.views, p.replies, p.dms]);
  });
  var t = rows.map(function (r) { return r.map(function (x) { return '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
  download(new Blob([t], { type: 'text/csv' }), 'ppt-status-results.csv');
}

/* ---------- tabs + boot ---------- */
function switchTab(name) {
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === name); });
  Array.prototype.forEach.call(document.querySelectorAll('.pane'), function (s) { s.classList.toggle('on', s.id === name); });
  if (name === 'queue') renderQueue();
  if (name === 'log') renderLog();
}

function boot() {
  cv = $('cv');
  gen(S.start, false);
  cur();
  bindStudio();
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) { b.addEventListener('click', function () { switchTab(b.getAttribute('data-tab')); }); });
  $('qstart').value = S.start;
  $('qstart').addEventListener('change', function () { if (this.value) { S.start = this.value; gen(S.start, false); save(); renderQueue(); } });
  $('qgen').addEventListener('click', function () { gen(S.start, false); save(); renderQueue(); });
  $('qrebuild').addEventListener('click', function () { if (confirm('Rebuild every day in the 14-day window that is not ticked as posted? Your edits to those days are replaced with the suggested copy.')) { gen(S.start, true); save(); syncStudio(); schedule(); renderQueue(); } });
  $('csv').addEventListener('click', csv);
  syncStudio(); renderQueue(); renderLog();
  var go = function () { render(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(function () {});
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
