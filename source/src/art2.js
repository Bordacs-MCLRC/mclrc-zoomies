// ===================== art 2: new worlds, characters and props =====================
function extraLayers(world, mk, R, ridge, wrapX) {
  if (world === 3) { // English lakeside
    mk(0.1, 0.12, c => {
      ridge(c, 240, 70, '#b9cad8', 2.1, [2, 5, 9]); ridge(c, 280, 55, '#9fb5c6', 0.6, [3, 6]); ridge(c, 330, 26, '#8db29a', 4.2, [4, 9]);
      c.fillStyle = '#8db29a'; c.fillRect(0, 360, BG_W, BG_H);
    });
    mk(0.3, 0.25, c => {
      c.fillStyle = '#a9d2ea'; c.fillRect(0, 378, BG_W, 70);
      c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 60; i++) c.fillRect(R() * BG_W, 386 + R() * 54, 10 + R() * 18, 2);
      for (let i = 0; i < 90; i++) { const x = (i / 90) * BG_W + R() * 10, h = 30 + R() * 40; c.fillStyle = i % 3 ? '#3f6e4a' : '#4f7e56'; c.beginPath(); c.moveTo(x - 10, 380); c.lineTo(x, 380 - h); c.lineTo(x + 10, 380); c.fill(); }
      for (let k = 0; k < 4; k++) { const x = 200 + k * 430 + R() * 80; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x, 420); c.lineTo(x + 14, 392); c.lineTo(x + 16, 420); c.fill(); c.fillStyle = '#c8362c'; c.fillRect(x - 6, 420, 26, 5); }
      wrapX(900, 80, x => { c.fillStyle = '#8a5a3a'; c.fillRect(x, 352, 90, 40); c.fillStyle = '#b5532a'; c.beginPath(); c.moveTo(x - 8, 352); c.lineTo(x + 45, 326); c.lineTo(x + 98, 352); c.fill(); c.fillStyle = '#3a2412'; c.fillRect(x + 30, 366, 30, 26); });
      c.fillStyle = '#6fae5c'; c.fillRect(0, 446, BG_W, BG_H);
    });
    mk(0.55, 0.42, c => {
      for (let i = 0; i < 26; i++) { const x = R() * BG_W, h = 120 + R() * 90; wrapX(x, 40, xx => { c.fillStyle = '#5a3a24'; c.fillRect(xx - 4, 600 - h * 0.3, 8, h * 0.3 + 20); for (let k = 0; k < 4; k++) { const w = 46 - k * 9, y = 600 - h * 0.3 - k * h * 0.2; c.fillStyle = k % 2 ? '#2f5e3e' : '#3a6e48'; c.beginPath(); c.moveTo(xx - w, y); c.lineTo(xx, y - h * 0.32); c.lineTo(xx + w, y); c.fill(); } }); }
      c.fillStyle = '#3e7a3a'; c.fillRect(0, 590, BG_W, BG_H);
    });
  } else if (world === 7) { // Newfoundland harbour
    mk(0.1, 0.12, c => {
      ridge(c, 250, 60, '#a3ad9e', 1.7, [2, 4]);
      wrapX(1300, 40, x => { c.fillStyle = '#c9c2ae'; c.fillRect(x, 168, 34, 44); for (let i = 0; i < 4; i++) c.fillRect(x - 2 + i * 10, 160, 6, 10); c.fillStyle = '#7a7466'; c.fillRect(x + 12, 184, 8, 12); });
      ridge(c, 320, 30, '#8c9a8a', 3.3, [3, 7]); c.fillStyle = '#8c9a8a'; c.fillRect(0, 350, BG_W, BG_H);
    });
    mk(0.3, 0.25, c => {
      const cols = ['#e84a3a', '#f2c12e', '#3a8ad8', '#5ab04a', '#9a5ad8', '#f08a3a', '#e85a9a', '#3ab0b0'];
      for (const [base, sc] of [[372, 0.8], [440, 1]]) {
        let x = (base === 372 ? 40 : 0);
        while (x < BG_W - 40) { const w = 70 * sc + R() * 20, h = 80 * sc + R() * 20, col = cols[Math.floor(R() * cols.length)];
          c.fillStyle = col; c.fillRect(x, base - h, w, h + 300);
          c.fillStyle = 'rgba(0,0,0,.12)'; for (let ly = base - h + 6; ly < base; ly += 7) c.fillRect(x, ly, w, 1.5);
          c.fillStyle = '#2e3440'; c.beginPath(); c.moveTo(x - 4, base - h); c.lineTo(x + w / 2, base - h - 22 * sc); c.lineTo(x + w + 4, base - h); c.fill();
          for (let wy = base - h + 14; wy < base - 18; wy += 30 * sc) for (let wx = x + 10; wx < x + w - 16; wx += 24 * sc) { c.fillStyle = '#fff'; c.fillRect(wx - 2, wy - 2, 16 * sc + 4, 20 * sc + 4); c.fillStyle = '#9fc7e0'; c.fillRect(wx, wy, 16 * sc, 20 * sc); }
          x += w + 4; }
      }
      c.fillStyle = '#5e6670'; c.fillRect(0, 440, BG_W, BG_H);
    });
    mk(0.55, 0.42, c => {
      for (let x = 20; x < BG_W; x += 260 + R() * 120) { c.fillStyle = '#6b4a2a'; c.fillRect(x, 470, 10, 150); c.fillRect(x + 120, 470, 10, 150); c.fillStyle = '#8a6440'; c.fillRect(x - 10, 466, 150, 10);
        for (let k = 0; k < 3; k++) { const px = x + 20 + k * 34; c.strokeStyle = '#a07a4a'; c.lineWidth = 2; rr(c, px, 446 - (k % 2) * 4, 30, 20, 4); c.stroke(); c.beginPath(); c.moveTo(px, 456); c.lineTo(px + 30, 456); c.stroke(); } }
      for (let x = 160; x < BG_W; x += 520) { c.fillStyle = '#ddd'; c.fillRect(x, 330, 4, 160); c.strokeStyle = '#bbb'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 2, 330); c.lineTo(x + 60, 480); c.moveTo(x + 2, 340); c.lineTo(x - 50, 480); c.stroke(); }
      c.fillStyle = '#4e3820'; c.fillRect(0, 600, BG_W, BG_H);
    });
  } else if (world === 4) { // shooting field
    mk(0.1, 0.12, c => {
      ridge(c, 280, 40, '#c9c08a', 1.1, [2, 5]);
      const cols = ['#cbbf7a', '#a9b870', '#d8c48a', '#b8c07a', '#9ab066'];
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(0, BG_H); for (let x = 0; x <= BG_W; x += 12) c.lineTo(x, 300 + k * 18 + Math.sin(x / BG_W * TAU * (2 + k) + k) * 14); c.lineTo(BG_W, BG_H); c.fillStyle = cols[k]; c.fill();
        c.strokeStyle = 'rgba(70,90,40,.6)'; c.lineWidth = 3; c.stroke(); }
      for (let i = 0; i < 18; i++) { const x = R() * BG_W, y = 300 + R() * 50; wrapX(x, 30, xx => { for (let k = 0; k < 3; k++) { circ(c, xx + k * 12 - 12, y - R() * 6, 9 + R() * 5); c.fillStyle = ['#6a8a3a', '#b5832a', '#8a6a2a'][k]; c.fill(); } }); }
    });
    mk(0.3, 0.25, c => {
      for (let i = 0; i < 28; i++) { const x = (i / 28) * BG_W + R() * 40, h = 80 + R() * 60; wrapX(x, 70, xx => { c.fillStyle = '#5a3a24'; c.fillRect(xx - 6, 440 - h * 0.5, 12, h * 0.5 + 4); for (let k = 0; k < 6; k++) { circ(c, xx + (R() - 0.5) * 80, 440 - h * 0.55 - R() * h * 0.5, 20 + R() * 16); c.fillStyle = ['#c2702a', '#e0a03a', '#8a9a3a', '#a8582a', '#d8883a'][Math.floor(R() * 5)]; c.fill(); } }); }
      c.fillStyle = '#9a9488'; for (let x = 0; x < BG_W; x += 14) { rr(c, x, 428 + (x % 28 ? 0 : 3), 13, 10, 3); c.fill(); }
      c.fillStyle = '#b39a4a'; c.fillRect(0, 440, BG_W, BG_H);
    });
    mk(0.55, 0.42, c => {
      for (let x = 0; x < BG_W; x += 40) { circ(c, x, 520 + Math.sin(x) * 6, 30); c.fillStyle = x % 80 ? '#4a6a2a' : '#56782f'; c.fill(); }
      for (let i = 0; i < 80; i++) { circ(c, R() * BG_W, 500 + R() * 40, 2.5); c.fillStyle = i % 2 ? '#3a1a3a' : '#a8283a'; c.fill(); }
      c.fillStyle = '#6b4a2a'; for (let x = 30; x < BG_W; x += 90) c.fillRect(x, 520, 6, 80);
      c.fillStyle = '#4a6a2a'; c.fillRect(0, 560, BG_W, BG_H);
    });
  } else if (world === 6) { // snowy Christmas village
    mk(0.1, 0.12, c => {
      ridge(c, 270, 50, '#c8d6ec', 1.4, [2, 5]); ridge(c, 320, 30, '#dce6f4', 3.1, [3, 7]);
      for (let i = 0; i < 40; i++) { const x = R() * BG_W, y = 320 + R() * 40; c.fillStyle = '#ffd26a'; c.fillRect(x, y, 3, 3); }
      for (let i = 0; i < 50; i++) { const x = R() * BG_W, y = 330 + R() * 30; c.fillStyle = '#3a5a5a'; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x, y - 20); c.lineTo(x + 7, y); c.fill(); }
    });
    mk(0.3, 0.25, c => {
      let x = 20;
      while (x < BG_W - 40) {
        const w = 140 + R() * 50, h = 100 + R() * 30, base = 440;
        c.fillStyle = ['#8a4a3a', '#7a4032', '#94503e'][Math.floor(R() * 3)]; c.fillRect(x, base - h, w, h + 300);
        c.fillStyle = '#3e3a4a'; c.beginPath(); c.moveTo(x - 10, base - h); c.lineTo(x + w / 2, base - h - 46); c.lineTo(x + w + 10, base - h); c.closePath(); c.fill();
        c.fillStyle = '#f4f8ff'; c.beginPath(); c.moveTo(x - 12, base - h + 2); c.lineTo(x + w / 2, base - h - 48); c.lineTo(x + w + 12, base - h + 2); c.lineTo(x + w + 4, base - h + 8); c.lineTo(x + w / 2, base - h - 36); c.lineTo(x - 4, base - h + 8); c.closePath(); c.fill();
        for (let wy = base - h + 18; wy < base - 30; wy += 44) for (let wx = x + 16; wx < x + w - 30; wx += 44) { c.fillStyle = '#ffd26a'; c.fillRect(wx, wy, 26, 24); c.fillStyle = '#e0a83a'; c.fillRect(wx + 12, wy, 2, 24); c.fillRect(wx, wy + 11, 26, 2); }
        for (let k = 0; k < 9; k++) { circ(c, x + 6 + k * (w - 12) / 8, base - h + 4 + Math.sin(k) * 3, 3); c.fillStyle = ['#ff4a4a', '#4aff7a', '#4ab0ff', '#ffd24a'][k % 4]; c.fill(); }
        x += w + 30 + R() * 30;
        if (R() < 0.4) { const tx = x - 15; for (let k = 0; k < 4; k++) { c.fillStyle = '#2e5a3a'; c.beginPath(); c.moveTo(tx - 34 + k * 6, base - 10 - k * 26); c.lineTo(tx, base - 50 - k * 26); c.lineTo(tx + 34 - k * 6, base - 10 - k * 26); c.fill(); } }
      }
      c.fillStyle = '#e8eef8'; c.fillRect(0, 438, BG_W, BG_H);
    });
    mk(0.55, 0.42, c => {
      for (let x = 0; x < BG_W; x += 36) { circ(c, x, 524, 26); c.fillStyle = '#3e6a4a'; c.fill(); ell(c, x, 504, 22, 8); c.fillStyle = '#fff'; c.fill(); }
      c.strokeStyle = '#333'; c.lineWidth = 1.5; c.beginPath(); for (let x = 0; x <= BG_W; x += 10) c.lineTo(x, 486 + Math.sin(x / 60 * Math.PI) * 6); c.stroke();
      for (let x = 10; x < BG_W; x += 22) { circ(c, x, 490 + Math.sin(x / 60 * Math.PI) * 6, 3.5); c.fillStyle = ['#ff4a4a', '#4aff7a', '#4ab0ff', '#ffd24a'][(x / 22 | 0) % 4]; c.fill(); }
      c.fillStyle = '#dfe8f6'; c.fillRect(0, 540, BG_W, BG_H);
    });
  }
}

// ---------- characters ----------
function drawCastle(c, k) {
  const h = 46 * k;
  c.save(); c.lineJoin = 'round';
  rr(c, -54, -14, 108, 14, 5); fillStroke(c, '#2a6ad0', '#13284f', 2);
  rr(c, -48, -14 - h, 96, h, 8); fillStroke(c, '#e8513f', '#6a1a14', 2);
  for (const x of [-52, 40]) { rr(c, x, -32 - h, 14, h + 18, 6); fillStroke(c, '#f2c12e', '#8a6414', 2); circ(c, x + 7, -36 - h, 8); fillStroke(c, '#2a6ad0', '#13284f', 1.6); }
  c.fillStyle = '#fff'; c.font = '700 12px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Boing!', 0, -8 - h / 2);
  c.restore();
}
function drawCrab(c, t, face) {
  c.save(); c.scale(face, 1); c.lineCap = 'round';
  const w = Math.sin(t * 0.4) * 2;
  c.strokeStyle = '#a8281a'; c.lineWidth = 2.5;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(s * 8, -8); c.lineTo(s * (16 + i * 2), -4 + i * 2 + (i % 2 ? w : -w)); c.lineTo(s * (18 + i * 2), 0); c.stroke(); }
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 10, -12); c.lineTo(s * 18, -20); c.stroke(); circ(c, s * 20, -23, 5.5); fillStroke(c, '#e8513f', '#8a1a10', 1.4); c.beginPath(); c.moveTo(s * 20, -23); c.lineTo(s * 25, -27); c.strokeStyle = '#8a1a10'; c.lineWidth = 1.5; c.stroke(); c.strokeStyle = '#a8281a'; c.lineWidth = 2.5; }
  ell(c, 0, -11, 14, 8); fillStroke(c, '#e8513f', '#8a1a10', 1.8);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 4, -17); c.lineTo(s * 5, -23); c.strokeStyle = '#8a1a10'; c.lineWidth = 1.6; c.stroke(); circ(c, s * 5, -24, 2.4); c.fillStyle = '#fff'; c.fill(); circ(c, s * 5, -24, 1.2); c.fillStyle = '#111'; c.fill(); }
  c.restore();
}
function drawGull(c, t, face) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round';
  const f = Math.sin(t * 0.3);
  c.beginPath(); c.moveTo(-4, -2); c.quadraticCurveTo(-16, -14 - f * 12, -30, -8 - f * 16); c.quadraticCurveTo(-18, -4, -4, 2); c.closePath(); fillStroke(c, '#cfd4da', '#5a6068', 1.4);
  ell(c, 0, 0, 15, 7); fillStroke(c, '#fbfbf8', '#7a8088', 1.4);
  c.beginPath(); c.moveTo(-14, -1); c.lineTo(-24, -4); c.lineTo(-22, 3); c.closePath(); fillStroke(c, '#cfd4da', '#5a6068', 1.2);
  circ(c, 13, -4, 5.5); fillStroke(c, '#fbfbf8', '#7a8088', 1.2);
  c.beginPath(); c.moveTo(17, -5); c.lineTo(25, -3); c.lineTo(17, -1.5); c.closePath(); fillStroke(c, '#f2c12e', '#8a6414', 1);
  circ(c, 21, -3, 0.9); c.fillStyle = '#d8362c'; c.fill();
  circ(c, 14.5, -5.5, 1.2); c.fillStyle = '#111'; c.fill();
  c.beginPath(); c.moveTo(-6, -2); c.quadraticCurveTo(-12, -14 - f * 12, -22, -12 - f * 16); c.strokeStyle = '#5a6068'; c.lineWidth = 1.4; c.stroke();
  c.restore();
}
function drawPheasant(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round'; c.lineCap = 'round';
  const step = o.walking ? Math.sin(t * 0.25) : 0;
  if (o.fly) { const f = Math.sin(t * 0.6); c.beginPath(); c.moveTo(0, -18); c.quadraticCurveTo(-10, -36 - f * 10, -24, -30 - f * 14); c.quadraticCurveTo(-10, -22, 0, -14); fillStroke(c, '#a8683a', '#4a2a12', 1.4); }
  c.beginPath(); c.moveTo(-14, -18); c.lineTo(-48, -26 + step); c.lineTo(-46, -20 + step); c.lineTo(-12, -12); c.closePath(); fillStroke(c, '#b8844a', '#4a2a12', 1.3);
  c.strokeStyle = '#6a4a2a'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-18 - i * 7, -20 + i * 0.4); c.lineTo(-18 - i * 7, -15 + i * 0.4); c.stroke(); }
  if (!o.fly) { c.strokeStyle = '#8a6a4a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-2, -8); c.lineTo(-2 + step * 4, 0); c.moveTo(4, -8); c.lineTo(4 - step * 4, 0); c.stroke(); }
  ell(c, 0, -16, 15, 10); fillStroke(c, '#c26a2a', '#4a2a12', 1.6);
  c.fillStyle = 'rgba(60,30,10,.5)'; for (let i = 0; i < 6; i++) { ell(c, -8 + i * 3.5, -18 + (i % 2) * 4, 1.6, 1.2); c.fill(); }
  c.beginPath(); c.moveTo(8, -22); c.quadraticCurveTo(12, -30, 14, -34); c.strokeStyle = '#2a6a5a'; c.lineWidth = 7; c.stroke();
  c.beginPath(); c.moveTo(8, -21); c.lineTo(12, -23); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
  circ(c, 15, -35, 5.5); fillStroke(c, '#2a6a5a', '#123a30', 1.4);
  ell(c, 16, -35, 3.2, 2.6); c.fillStyle = '#d8362c'; c.fill();
  c.beginPath(); c.moveTo(19, -36); c.lineTo(24, -34); c.lineTo(19, -32.5); c.closePath(); c.fillStyle = '#e8d8a8'; c.fill();
  circ(c, 16, -36, 1); c.fillStyle = '#111'; c.fill();
  c.restore();
}
function drawBrambles(c, w, t) {
  c.save(); c.lineCap = 'round';
  const n = Math.max(3, Math.round(w / 18));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i + 0.5) * w / n, h = 20 + (i * 7) % 12, d = i % 2 ? 1 : -1;
    c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + d * 14, -h - 8, x + d * 22, -h + 4); c.strokeStyle = '#5a2a3a'; c.lineWidth = 3; c.stroke();
    for (let k = 1; k < 4; k++) { const tx = x + d * k * 6, ty = -h * k / 3.5; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + 3, ty - 4); c.strokeStyle = '#d8c8c8'; c.lineWidth = 1.2; c.stroke(); }
    ell(c, x + d * 8, -h * 0.6, 6, 3.5, d * 0.6); c.fillStyle = '#3f7a34'; c.fill();
    circ(c, x + d * 18, -h + 2, 3.4); c.fillStyle = i % 3 ? '#2a1030' : '#a8283a'; c.fill();
  }
  c.restore();
}
function drawDrone(c, t, face) {
  c.save(); c.scale(face, 1);
  for (const x of [-18, 18]) { c.fillStyle = '#555'; c.fillRect(x - 1.5, -18, 3, 8); const pw = Math.abs(Math.cos(t * 0.9 + x)) * 14 + 2; ell(c, x, -19, pw, 2); c.fillStyle = 'rgba(200,205,215,.9)'; c.fill(); }
  c.fillStyle = '#3a3f48'; c.fillRect(-18, -12, 36, 3);
  rr(c, -12, -12, 24, 13, 5); fillStroke(c, '#e8e8ec', '#3a3f48', 1.8);
  circ(c, 4, -6, 4); fillStroke(c, '#222', '#000', 1); circ(c, 5, -7, 1.4); c.fillStyle = Math.sin(t * 0.3) > 0 ? '#ff4a3a' : '#7a1c16'; c.fill();
  c.restore();
}
function drawRoboDuck(c, t, face) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-24, -6); c.quadraticCurveTo(-28, -18, -16, -18); c.lineTo(10, -18); c.quadraticCurveTo(22, -16, 20, -4); c.lineTo(-20, 0); c.closePath(); fillStroke(c, '#f2c12e', '#8a6414', 2);
  c.fillStyle = '#c9ced8'; c.fillRect(-14, -13, 18, 4); for (let i = 0; i < 3; i++) { circ(c, -10 + i * 7, -11, 1.3); c.fillStyle = '#555'; c.fill(); }
  c.beginPath(); c.moveTo(10, -16); c.lineTo(12, -30); c.strokeStyle = '#8a6414'; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#f2c12e'; c.lineWidth = 5; c.stroke();
  circ(c, 13, -33, 7); fillStroke(c, '#f2c12e', '#8a6414', 1.8);
  c.beginPath(); c.moveTo(19, -34); c.lineTo(29, -31); c.lineTo(19, -28); c.closePath(); fillStroke(c, '#f08a2a', '#8a4410', 1.2);
  circ(c, 15, -35, 2.4); c.fillStyle = Math.sin(t * 0.25) > 0 ? '#ff4a3a' : '#7a1c16'; c.fill();
  c.beginPath(); c.moveTo(12, -40); c.lineTo(12, -48); c.strokeStyle = '#555'; c.lineWidth = 1.5; c.stroke(); circ(c, 12, -49, 2); c.fillStyle = '#ff4a3a'; c.fill();
  c.restore();
}
function drawSnowbot(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round';
  circ(c, 0, -16, 16); fillStroke(c, '#fbfdff', '#9aaac4', 2); circ(c, 0, -40, 12); fillStroke(c, '#fbfdff', '#9aaac4', 2);
  for (let i = 0; i < 3; i++) { circ(c, 0, -22 + i * 7, 2); c.fillStyle = '#3a4a6a'; c.fill(); }
  c.fillStyle = '#c8362c'; c.fillRect(-12, -30, 24, 5); c.fillRect(6, -30, 5, 14);
  rr(c, -9, -46, 18, 6, 2); c.fillStyle = '#ff4a3a'; c.fill(); circ(c, -3, -43, 1.6); circ(c, 4, -43, 1.6); c.fillStyle = Math.sin(t * 0.3) > 0 ? '#fff' : '#ffd0d0'; c.fill();
  c.beginPath(); c.moveTo(8, -40); c.lineTo(18, -38); c.lineTo(8, -36); c.closePath(); c.fillStyle = '#f08a2a'; c.fill();
  c.beginPath(); c.moveTo(-10, -52); c.lineTo(10, -52); c.lineTo(6, -66); c.lineTo(-6, -66); c.closePath(); c.fillStyle = '#2a2a33'; c.fill(); c.fillRect(-13, -53, 26, 3);
  c.strokeStyle = '#6b4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(12, -20); c.lineTo(o.throwing ? 24 : 22, o.throwing ? -34 : -10); c.moveTo(-12, -20); c.lineTo(-22, -12); c.stroke();
  if (o.throwing) { circ(c, 25, -36, 6); fillStroke(c, '#fff', '#9aaac4', 1.2); }
  c.restore();
}
function drawSpeedboat(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round';
  if (o.moving) { c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 5; i++) { circ(c, -64 - i * 10 + Math.sin(t * 0.5 + i) * 3, -4 - (i % 2) * 5, 5 - i * 0.6); c.fill(); } }
  c.beginPath(); c.moveTo(-60, -30); c.lineTo(48, -30); c.quadraticCurveTo(70, -26, 66, -14); c.lineTo(52, 0); c.lineTo(-56, 0); c.closePath();
  const g = c.createLinearGradient(0, -30, 0, 0); g.addColorStop(0, o.flash ? '#fff' : '#fbfbf7'); g.addColorStop(1, o.flash ? '#fdd' : '#c9ced8'); fillStroke(c, g, '#3a3f48', 2.5);
  c.fillStyle = '#c8362c'; c.fillRect(-56, -16, 112, 6);
  c.beginPath(); c.moveTo(-10, -30); c.lineTo(10, -50); c.lineTo(34, -50); c.lineTo(40, -30); c.closePath(); fillStroke(c, 'rgba(160,210,240,.85)', '#3a3f48', 2);
  circ(c, 50, -22, 6); fillStroke(c, '#fff8c8', '#3a3f48', 2); circ(c, 51, -21, 2.4); c.fillStyle = '#111'; c.fill();
  c.beginPath(); c.moveTo(42, -30); c.lineTo(56, -27); c.strokeStyle = '#111'; c.lineWidth = 2.5; c.stroke();
  c.beginPath(); c.moveTo(-40, -30); c.lineTo(-40, -62); c.strokeStyle = '#555'; c.lineWidth = 2; c.stroke(); circ(c, -40, -64, 3); c.fillStyle = Math.sin(t * 0.3) > 0 ? '#ff4a3a' : '#7a1c16'; c.fill();
  c.restore();
}
function drawClayTrap(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round'; c.lineCap = 'round';
  for (const [wx, wr] of [[-36, 16], [36, 16]]) { c.save(); c.translate(wx, -wr); c.rotate(t * 0.15 * (o.moving ? 1 : 0)); circ(c, 0, 0, wr); fillStroke(c, '#222', '#000', 2); circ(c, 0, 0, 6); c.fillStyle = '#9aa0aa'; c.fill(); c.restore(); }
  rr(c, -56, -64, 112, 40, 8); const g = c.createLinearGradient(0, -64, 0, -24); g.addColorStop(0, o.flash ? '#fff' : '#5a8a4a'); g.addColorStop(1, o.flash ? '#dfd' : '#2e5a2a'); fillStroke(c, g, '#14280e', 2.5);
  c.fillStyle = '#f2cf6b'; c.fillRect(-52, -40, 104, 4);
  for (let i = 0; i < 5; i++) { ell(c, -30, -70 - i * 6, 14, 4); fillStroke(c, '#f07a2a', '#8a3a10', 1.4); }
  const arm = o.throwT > 0 ? -1.2 + (1 - o.throwT / 20) * 1.6 : 0.4;
  c.save(); c.translate(20, -66); c.rotate(-arm); c.fillStyle = '#3a3f48'; c.fillRect(0, -3, 44, 6); c.restore();
  circ(c, 44, -48, 7); fillStroke(c, '#fff8c8', '#14280e', 2); circ(c, 45, -47, 2.8); c.fillStyle = '#111'; c.fill();
  circ(c, 26, -48, 6.5); fillStroke(c, '#fff8c8', '#14280e', 2); circ(c, 27, -47, 2.6); c.fill();
  c.beginPath(); c.moveTo(18, -58); c.lineTo(32, -54); c.moveTo(38, -54); c.lineTo(52, -59); c.strokeStyle = '#0a1a06'; c.lineWidth = 3; c.stroke();
  c.restore();
}
function drawClay(c, r) { c.save(); c.rotate(r); ell(c, 0, 0, 9, 3.5); fillStroke(c, '#f07a2a', '#8a3a10', 1.3); c.restore(); }
function drawSnowball(c) { circ(c, 0, 0, 6); fillStroke(c, '#fff', '#9aaac4', 1.2); }
function drawDummy(c, kind, t) {
  c.save(); c.lineJoin = 'round';
  if (kind === 'float') { circ(c, 0, -2, 9); fillStroke(c, '#f07a2a', '#8a3a10', 1.6); c.fillStyle = '#fff'; c.fillRect(-9, -4, 18, 4); c.beginPath(); c.moveTo(8, -2); c.quadraticCurveTo(18, 4, 22, -4); c.strokeStyle = '#c9b48a'; c.lineWidth = 2; c.stroke(); }
  else { rr(c, -14, -7, 28, 14, 6); fillStroke(c, '#6b7a3a', '#2e3a14', 1.6); c.strokeStyle = 'rgba(30,40,10,.5)'; c.lineWidth = 1; for (let i = -8; i <= 8; i += 4) { c.beginPath(); c.moveTo(i, -6); c.lineTo(i, 6); c.stroke(); }
    c.beginPath(); c.moveTo(14, 0); c.quadraticCurveTo(22, -8, 26, -2); c.strokeStyle = '#c9b48a'; c.lineWidth = 2; c.stroke(); rr(c, 24, -5, 6, 6, 2); c.fillStyle = '#8a6440'; c.fill(); }
  c.restore();
}
function drawPerson(c, t, o = {}) {
  // a friendly handler: jacket and cap (field) or oilskins and sou'wester (harbour)
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  const fish = o.kind === 'fisher', coat = fish ? '#f2c12e' : '#4a5a3a', trim = fish ? '#8a6414' : '#23301a';
  c.strokeStyle = fish ? '#3a3a3a' : '#5a4a3a'; c.lineWidth = 7; c.beginPath(); c.moveTo(-6, -32); c.lineTo(-7, 0); c.moveTo(6, -32); c.lineTo(7, 0); c.stroke();
  rr(c, -10, -4, 9, 5, 2); c.fillStyle = '#222'; c.fill(); rr(c, 2, -4, 9, 5, 2); c.fill();
  rr(c, -16, -70, 32, 44, 10); fillStroke(c, coat, trim, 2);
  const reach = o.reach ? 1 : 0;
  c.strokeStyle = coat; c.lineWidth = 8; c.beginPath(); c.moveTo(12, -62); c.lineTo(22 + reach * 10, -46 + reach * 8); c.stroke(); circ(c, 23 + reach * 10, -45 + reach * 8, 4.5); c.fillStyle = '#f1c9a5'; c.fill();
  c.beginPath(); c.moveTo(-12, -62); c.lineTo(-18, -40); c.strokeStyle = coat; c.stroke();
  if (!fish) { c.strokeStyle = '#c9b48a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-4, -66); c.lineTo(2, -50); c.stroke(); rr(c, 0, -52, 4, 7, 1); c.fillStyle = '#d8d8d8'; c.fill(); }
  circ(c, 0, -80, 10.5); fillStroke(c, '#f1c9a5', '#8a5a3a', 1.6);
  if (fish) { c.beginPath(); c.moveTo(-16, -82); c.quadraticCurveTo(0, -100, 16, -82); c.lineTo(18, -78); c.quadraticCurveTo(0, -86, -18, -78); c.closePath(); fillStroke(c, '#f2c12e', '#8a6414', 1.6); }
  else { c.beginPath(); c.moveTo(-11, -84); c.quadraticCurveTo(0, -96, 12, -86); c.lineTo(20, -83); c.lineTo(11, -81); c.lineTo(-11, -81); c.closePath(); fillStroke(c, '#8a7a5a', '#4a3a20', 1.6); }
  circ(c, 4, -80, 1.4); c.fillStyle = '#222'; c.fill();
  c.beginPath(); c.arc(2, -76, 3.2, 0.2, Math.PI - 0.2); c.strokeStyle = '#8a4a3a'; c.lineWidth = 1.4; c.stroke();
  if (o.whistle) { c.save(); c.translate(10, -74); c.rotate(-0.3); rr(c, 0, -2, 10, 4, 1.5); c.fillStyle = '#d8d8d8'; c.fill(); c.restore(); }
  c.restore();
}
function drawHurdleObj(c, h, t) {
  c.save();
  c.fillStyle = '#fff'; c.fillRect(-26, -46, 6, 46); c.fillRect(20, -46, 6, 46);
  c.fillStyle = NAVY2; c.fillRect(-26, -46, 6, 10); c.fillRect(20, -46, 6, 10);
  if (h.state === 'knocked') { c.save(); c.translate(-20, -3); c.rotate(0.08); c.fillStyle = GOLD; c.fillRect(0, -3, 44, 6); c.restore(); }
  else { c.fillStyle = h.state === 'clear' ? '#7ac25a' : GOLD; c.fillRect(-20, -32, 40, 6); }
  c.restore();
}
function drawPresent(c, t, col) {
  c.save(); c.translate(0, Math.sin(t * 0.07) * 3);
  rr(c, -12, -10, 24, 20, 3); fillStroke(c, col, 'rgba(0,0,0,.35)', 1.5);
  c.fillStyle = '#ffd24a'; c.fillRect(-2.5, -10, 5, 20); c.fillRect(-12, -2.5, 24, 5);
  c.beginPath(); c.ellipse(-5, -13, 5, 3.5, -0.5, 0, TAU); c.ellipse(5, -13, 5, 3.5, 0.5, 0, TAU); c.fillStyle = '#ffd24a'; c.fill();
  c.restore();
}
function drawTunnelPortal(c, x, gy, top, t) {
  // brick tunnel mouth facing the towpath
  c.save();
  const w = 90, h = 260;
  c.fillStyle = '#8e4430'; c.fillRect(x - w / 2, gy - h, w, h - 0);
  c.strokeStyle = 'rgba(240,210,180,.35)'; c.lineWidth = 1.2;
  for (let y = gy - h; y < gy; y += 14) { c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.stroke(); }
  rr(c, x - w / 2 - 6, gy - h - 14, w + 12, 16, 3); c.fillStyle = '#c9b48a'; c.fill();
  c.fillStyle = NAVY; rr(c, x - 36, gy - h + 16, 72, 22, 4); c.fill(); c.fillStyle = GOLD2; c.font = '600 11px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Tunnel 1946', x, gy - h + 27);
  c.restore();
}

// ---------- extra decor kinds ----------
function drawDecor2(c, d, t, world, r) {
  switch (d.kind) {
    case 'pine': { c.fillStyle = '#5a3a24'; c.fillRect(-5, -30, 10, 30); for (let k = 0; k < 4; k++) { const w = 34 - k * 7, y = -24 - k * 26; c.beginPath(); c.moveTo(-w, y); c.lineTo(0, y - 40); c.lineTo(w, y); c.closePath(); fillStroke(c, k % 2 ? '#2f5e3e' : '#3a6e48', '#1e3a26', 1.6); if (world === 6) { c.beginPath(); c.moveTo(-w * 0.6, y - 10); c.lineTo(0, y - 38); c.lineTo(w * 0.6, y - 10); c.closePath(); c.fillStyle = '#f4f8ff'; c.fill(); } } break; }
    case 'buoy': { const b = Math.sin(t * 0.05 + r * 6) * 2; c.translate(0, b); ell(c, 0, 0, 10, 6); fillStroke(c, '#e8513f', '#6a1a14', 1.5); c.fillStyle = '#fff'; c.fillRect(-10, -2, 20, 3); c.fillStyle = '#555'; c.fillRect(-1, -18, 2, 14); circ(c, 0, -19, 3); c.fillStyle = '#ffd24a'; c.fill(); break; }
    case 'rowboat': { const b = Math.sin(t * 0.04 + r * 6) * 2; c.translate(0, b); c.beginPath(); c.moveTo(-46, -12); c.lineTo(46, -12); c.quadraticCurveTo(40, 6, 30, 8); c.lineTo(-30, 8); c.quadraticCurveTo(-40, 6, -46, -12); c.closePath(); fillStroke(c, r < 0.5 ? '#3a7ac8' : '#c8362c', '#1a2a4a', 2); c.fillStyle = '#f6f0e0'; c.fillRect(-44, -12, 88, 4); c.strokeStyle = '#8a6440'; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -10); c.lineTo(-40, 12); c.stroke(); break; }
    case 'heron': { c.strokeStyle = '#6a6a6a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-3, -26); c.moveTo(3, 0); c.lineTo(3, -26); c.stroke(); ell(c, 0, -36, 14, 10, -0.3); fillStroke(c, '#9aa4ae', '#4a525a', 1.5); c.beginPath(); c.moveTo(8, -42); c.quadraticCurveTo(18, -52, 12, -62); c.strokeStyle = '#c8ced4'; c.lineWidth = 5; c.stroke(); circ(c, 13, -64, 4.5); c.fillStyle = '#e8ecf0'; c.fill(); c.beginPath(); c.moveTo(16, -64); c.lineTo(30, -60); c.lineTo(16, -62); c.closePath(); c.fillStyle = '#e8b83a'; c.fill(); c.beginPath(); c.moveTo(10, -67); c.lineTo(2, -64); c.strokeStyle = '#222'; c.lineWidth = 1.5; c.stroke(); break; }
    case 'lobsterpots': { for (let i = 0; i < 3; i++) for (let k = 0; k < 2 - (i === 2 ? 1 : 0); k++) { const x = -34 + i * 24 + k * 12, y = -18 - k * 18; rr(c, x, y, 22, 18, 4); fillStroke(c, 'rgba(160,120,70,.25)', '#8a6440', 1.6); c.beginPath(); c.moveTo(x, y + 9); c.lineTo(x + 22, y + 9); c.moveTo(x + 11, y); c.lineTo(x + 11, y + 18); c.strokeStyle = '#8a6440'; c.lineWidth = 1; c.stroke(); } circ(c, 26, -8, 8); fillStroke(c, '#f07a2a', '#8a3a10', 1.4); break; }
    case 'crate': { rr(c, -20, -32, 40, 32, 2); fillStroke(c, '#b9844c', '#5a3a1c', 2); c.strokeStyle = '#5a3a1c'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, -32); c.lineTo(20, 0); c.stroke(); c.fillStyle = '#3a2412'; c.font = '600 8px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText('COD', 0, -20); break; }
    case 'nets': { c.strokeStyle = '#6b4a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-30, -70); c.moveTo(30, 0); c.lineTo(30, -70); c.stroke(); c.strokeStyle = 'rgba(60,90,80,.8)'; c.lineWidth = 1.2; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(-30 + i * 7.5, -66); c.quadraticCurveTo(-30 + i * 7.5 + 4, -30, -30 + i * 7.5, -6); c.stroke(); } for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-30, -60 + k * 10); c.quadraticCurveTo(0, -54 + k * 10, 30, -60 + k * 10); c.stroke(); } for (const x of [-18, 6, 22]) { circ(c, x, -62, 4); c.fillStyle = '#f07a2a'; c.fill(); } break; }
    case 'anchor': { c.strokeStyle = '#3a3f48'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -4); c.lineTo(0, -44); c.moveTo(-10, -36); c.lineTo(10, -36); c.moveTo(-18, -16); c.quadraticCurveTo(0, 4, 18, -16); c.stroke(); circ(c, 0, -48, 5); c.stroke(); break; }
    case 'roundbale': { circ(c, 0, -30, 30); fillStroke(c, '#d8b858', '#8a6a24', 2); c.strokeStyle = 'rgba(138,106,36,.6)'; c.lineWidth = 1.5; for (let k = 1; k < 4; k++) { c.beginPath(); c.arc(0, -30, k * 7, 0, TAU); c.stroke(); } break; }
    case 'gate': { c.fillStyle = '#8a6a4a'; c.fillRect(-46, -50, 7, 50); c.fillRect(40, -50, 7, 50); for (let k = 0; k < 5; k++) c.fillRect(-40, -46 + k * 10, 80, 4); c.save(); c.beginPath(); c.moveTo(-40, -6); c.lineTo(40, -46); c.lineWidth = 4; c.strokeStyle = '#8a6a4a'; c.stroke(); c.restore(); break; }
    case 'peg': { rr(c, -6, -40, 12, 40, 2); fillStroke(c, '#f6f0e0', '#5a5448', 1.4); c.fillStyle = NAVY; c.font = '700 11px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText(String(1 + Math.floor(r * 8)), 0, -26); break; }
    case 'snowman': { circ(c, 0, -18, 18); fillStroke(c, '#fbfdff', '#9aaac4', 2); circ(c, 0, -46, 13); fillStroke(c, '#fbfdff', '#9aaac4', 2); c.fillStyle = '#c8362c'; c.fillRect(-13, -36, 26, 5); c.fillRect(6, -36, 5, 14); c.beginPath(); c.moveTo(4, -46); c.lineTo(16, -44); c.lineTo(4, -42); c.fillStyle = '#f08a2a'; c.fill(); circ(c, -4, -50, 1.6); circ(c, 4, -50, 1.6); c.fillStyle = '#222'; c.fill(); c.fillRect(-10, -60, 20, 3); c.fillRect(-7, -72, 14, 12); break; }
    case 'xtree': { c.fillStyle = '#6b4a2a'; c.fillRect(-6, -18, 12, 18); for (let k = 0; k < 4; k++) { const w = 46 - k * 10, y = -14 - k * 30; c.beginPath(); c.moveTo(-w, y); c.lineTo(0, y - 46); c.lineTo(w, y); c.closePath(); fillStroke(c, '#2e6a3a', '#1a3a20', 1.6); }
      for (let i = 0; i < 16; i++) { const k = i % 4, w = 40 - k * 10; const x = Math.sin(i * 2.3) * w * 0.8, y = -22 - k * 30 - (i % 3) * 6; circ(c, x, y, 3); c.fillStyle = ['#ff4a4a', '#ffd24a', '#4ab0ff', '#ff8ad8'][i % 4]; c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 0.1 + i); c.fill(); c.globalAlpha = 1; }
      c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? 4 : 9; c.lineTo(Math.cos(a) * rr2, -142 + Math.sin(a) * rr2); } c.closePath(); c.fillStyle = '#ffd24a'; c.fill(); break; }
    case 'presents': { drawPresent(c, 0, '#c8362c'); c.translate(22, 4); drawPresent(c, 0, '#2a6ad0'); c.translate(-10, -18); drawPresent(c, 0, '#3a9a4a'); break; }
    case 'startgate': case 'finishgate': { c.fillStyle = NAVY2; c.fillRect(-60, -110, 8, 110); c.fillRect(52, -110, 8, 110); rr(c, -68, -130, 136, 30, 8); fillStroke(c, NAVY, GOLD, 2.5); c.fillStyle = GOLD2; c.font = '700 16px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(d.kind === 'startgate' ? 'Agility start' : 'Agility finish', 0, -115); break; }
  }
}

// ---------- wardrobe ----------
const COLLARS = {
  navy: { name: 'Club navy', a: '#1d3366', b: null, tag: '#e7b84a' },
  red: { name: 'Pillar-box red', a: '#c8362c', b: null, tag: '#e7b84a' },
  green: { name: 'Hunter green', a: '#2e6a3a', b: null, tag: '#e7b84a' },
  tartan: { name: 'Tartan', a: '#b8302a', b: '#1d3366', tag: '#e7b84a' },
  pink: { name: 'Rosy pink', a: '#e85a9a', b: null, tag: '#fff' },
  purple: { name: 'Heather purple', a: '#7a4ab0', b: null, tag: '#e7b84a' },
  gold: { name: 'Champion gold', a: '#e3b341', b: '#fff2b8', tag: '#1d3366' }
};
const HATS = { none: 'No hat', bandana: 'Club bandana', cap: 'Flat cap', santa: 'Santa hat', rosette: 'Best in Show rosette' };
function drawCollar(c, key) {
  const C = COLLARS[key] || COLLARS.navy;
  c.beginPath(); c.moveTo(18, -54); c.quadraticCurveTo(24, -46, 28, -39); c.strokeStyle = '#0c1630'; c.lineWidth = 7; c.stroke(); c.strokeStyle = C.a; c.lineWidth = 4.6; c.stroke();
  if (C.b) { c.setLineDash([2.5, 2.5]); c.strokeStyle = C.b; c.lineWidth = 2; c.stroke(); c.setLineDash([]); }
  circ(c, 28.5, -35.5, 3); fillStroke(c, C.tag, '#8a6420', 1.2);
}
function drawHatOn(c, hat) {
  if (!hat || hat === 'none' || hat === 'rosette') return;
  c.save(); c.lineJoin = 'round';
  if (hat === 'santa') {
    c.beginPath(); c.moveTo(19, -60); c.quadraticCurveTo(24, -74, 16, -79); c.quadraticCurveTo(10, -81, 7, -74); c.quadraticCurveTo(22, -72, 39, -60); c.closePath(); fillStroke(c, '#d8362c', '#6a1a14', 1.6);
    rr(c, 18, -63, 23, 6.5, 3.2); fillStroke(c, '#fff', '#b8c0cc', 1.2); circ(c, 7, -74, 4); fillStroke(c, '#fff', '#b8c0cc', 1.2);
  } else if (hat === 'cap') {
    c.beginPath(); c.moveTo(18, -60); c.quadraticCurveTo(28, -72, 40, -64); c.lineTo(46, -61); c.lineTo(38, -59); c.closePath(); fillStroke(c, '#8a7a5a', '#4a3a20', 1.6);
    c.strokeStyle = 'rgba(74,58,32,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(22, -64); c.lineTo(38, -64); c.stroke();
  } else if (hat === 'bandana') {
    c.beginPath(); c.moveTo(16, -52); c.lineTo(30, -38); c.lineTo(20, -26); c.closePath(); fillStroke(c, NAVY2, '#0c1630', 1.4);
    c.fillStyle = GOLD2; for (const [x, y] of [[21, -42], [25, -36], [21, -33]]) { circ(c, x, y, 1.4); c.fill(); }
  }
  c.restore();
}
