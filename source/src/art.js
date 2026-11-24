// ===================== art: everything is drawn in code =====================
const NAVY = '#14254a', NAVY2 = '#1d3366', GOLD = '#d9a93a', GOLD2 = '#f2cf6b';
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); }
function fillStroke(c, f, s, w) { if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = w || 2; c.stroke(); } }

// ---------------- the Labrador ----------------
const DOGCOL = {
  black: { base: '#2c2c33', dark: '#1a1a1f', light: '#50505c', line: '#09090b', nose: '#0d0d10', eye: '#7a4a22', ear: '#232329', brow: '#6a6a78' },
  yellow: { base: '#ecc985', dark: '#d2a965', light: '#fbe8bf', line: '#8a6532', nose: '#4a3428', eye: '#4a2a12', ear: '#ddb26c', brow: '#b88a4a' },
  chocolate: { base: '#734731', dark: '#583424', light: '#9d6c50', line: '#2a170c', nose: '#3a2218', eye: '#3a1e0c', ear: '#623c28', brow: '#a8785a' }
};
function limb(c, ax, ay, fx, fy, bend, w, col, line) {
  const dx = fx - ax, dy = fy - ay, L = Math.hypot(dx, dy) || 1, px = -dy / L, py = dx / L;
  const kx = (ax + fx) / 2 + px * bend, ky = (ay + fy) / 2 + py * bend;
  c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(kx, ky, fx, fy);
  c.strokeStyle = line; c.lineWidth = w + 3.2; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
  ell(c, fx + 1.8, fy - 1.6, 5.4, 3.7); fillStroke(c, col, line, 1.7);
}
function legFeet(pose, ph, sp) {
  // returns [fn, ff, bn, bf] foot positions; anchors fixed in drawDog
  const st = (ax, p, amp, lift) => [ax + amp * Math.sin(p), -lift * Math.max(0, Math.cos(p))];
  switch (pose) {
    case 'run': {
      const s = Math.min(sp, 16), amp = 6 + s * 0.65, lift = 4 + s * 0.5;
      if (s < 3.2) return [st(15, ph, amp, lift), st(10, ph + Math.PI, amp, lift), st(-14, ph + Math.PI * 0.5, amp, lift), st(-19, ph + Math.PI * 1.5, amp, lift)];
      return [st(16, ph, amp, lift), st(11, ph + 0.55, amp, lift), st(-14, ph + Math.PI, amp, lift), st(-19, ph + Math.PI + 0.55, amp, lift)];
    }
    case 'trot': return [st(16, ph, 10, 9), st(11, ph + Math.PI, 10, 9), st(-14, ph + Math.PI, 10, 7), st(-19, ph, 10, 7)];
    case 'jump': return [[31, -17], [27, -12], [-31, -12], [-27, -8]];
    case 'spring': return [[18, 4], [13, 6], [-12, 6], [-17, 4]];
    case 'fall': return [[23, 1], [18, 3], [-12, 3], [-18, 1]];
    case 'skid': return [[33, 0], [29, 0], [-5, 0], [-10, 0]];
    case 'hurt': return [[31, -7], [25, -2], [-31, -5], [-25, 0]];
    case 'swim': return [[17 + 8 * Math.cos(ph), -6 + 7 * Math.sin(ph)], [12 + 8 * Math.cos(ph + Math.PI), -6 + 7 * Math.sin(ph + Math.PI)], [-14 + 7 * Math.cos(ph + 1.6), -6 + 6 * Math.sin(ph + 1.6)], [-19 + 7 * Math.cos(ph + 4.7), -6 + 6 * Math.sin(ph + 4.7)]];
    default: return [[16, 0], [11, 0], [-14, 0], [-19, 0]];
  }
}
function drawDog(c, o) {
  const P = DOGCOL[o.col] || DOGCOL.black, pose = o.pose || 'idle', ph = o.ph || 0, t = o.t || 0, sp = o.sp || 0;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  let bodyY = 0, rot = 0, headRot = 0, headDY = 0, earA = 0, tailA = Math.PI + 0.45, wag = 0.3 * Math.sin(o.tail || 0), mouth = 0, eye = 'open';
  if (pose === 'idle') { bodyY = Math.sin(t * 0.07) * 0.7; wag = 0.45 * Math.sin((o.tail || 0) * 1.4); }
  if (pose === 'run') { const s = Math.min(sp, 16); bodyY = -Math.abs(Math.sin(ph)) * (1 + s * 0.15); rot = 0.05 * Math.sin(ph * 2) * (s > 3 ? 1 : 0.3); earA = -Math.min(0.9, s * 0.07) + 0.12 * Math.sin(ph * 2); tailA = Math.PI + 0.25 - s * 0.012; wag = 0.12 * Math.sin(ph * 2); mouth = s > 6 ? 1 : 0; }
  if (pose === 'trot') { bodyY = -Math.abs(Math.sin(ph)) * 1.4; headRot = -0.12; earA = -0.15; tailA = Math.PI + 0.3; wag = 0.2 * Math.sin(ph * 2); mouth = 0.5; }
  if (pose === 'jump') { rot = -0.08; earA = -0.95; tailA = Math.PI + 0.2; mouth = 1; }
  if (pose === 'spring') { rot = -0.18; earA = -1.2; tailA = Math.PI - 0.3; mouth = 1; }
  if (pose === 'fall') { rot = 0.06; earA = -1.1; tailA = Math.PI + 0.6; mouth = 0.5; }
  if (pose === 'skid') { rot = -0.14; earA = 0.35; headRot = 0.08; tailA = Math.PI + 0.8; eye = 'squint'; }
  if (pose === 'hurt') { rot = -0.2; earA = -1.3; tailA = Math.PI + 0.9; eye = 'hurt'; mouth = 0.7; }
  if (pose === 'sniff') { headRot = 0.62; headDY = 7; tailA = Math.PI + 0.75; wag = 0.5 * Math.sin((o.tail || 0) * 3); earA = 0.25; }
  if (pose === 'swim') { rot = -0.1; headRot = -0.22; headDY = -2; earA = 0.1 + 0.08 * Math.sin(ph); tailA = Math.PI + 0.05; wag = 0.25 * Math.sin(ph); mouth = 0.6; }
  if (pose === 'sit') { mouth = 1; eye = 'happy'; wag = 0.6 * Math.sin((o.tail || 0) * 2.2); }
  if (o.blink && eye === 'open') eye = 'blink';
  const feet = legFeet(pose, ph, sp);
  const FN = [15, -26], FF = [10, -26], BN = [-14, -26], BF = [-19, -26];
  if (pose === 'sit') { drawDogSit(c, P, o, wag, mouth, eye); c.restore(); return; }
  c.translate(0, bodyY); c.rotate(rot);
  // far legs
  limb(c, FF[0], FF[1], feet[1][0], feet[1][1] - bodyY, -3, 7.5, P.dark, P.line);
  limb(c, BF[0], BF[1], feet[3][0], feet[3][1] - bodyY, 6, 8, P.dark, P.line);
  // tail
  drawTail(c, P, tailA + wag);
  // body
  c.beginPath(); c.moveTo(-26, -34);
  c.bezierCurveTo(-24, -45, -6, -45, 6, -44); c.bezierCurveTo(15, -44, 23, -43, 27, -35);
  c.bezierCurveTo(31, -27, 27, -18, 16, -17); c.bezierCurveTo(6, -16, -4, -21, -12, -21);
  c.bezierCurveTo(-22, -21, -30, -24, -26, -34); c.closePath();
  const g = c.createLinearGradient(0, -46, 0, -16); g.addColorStop(0, P.light); g.addColorStop(0.42, P.base); g.addColorStop(1, P.dark);
  fillStroke(c, g, P.line, 2.4);
  c.beginPath(); c.moveTo(-22, -40); c.bezierCurveTo(-14, -43.5, -2, -43.5, 6, -42.5); c.bezierCurveTo(13, -42.5, 19, -41.5, 22, -38); c.strokeStyle = P.light; c.globalAlpha = 0.5; c.lineWidth = 2.2; c.stroke(); c.globalAlpha = 1;
  // near legs
  limb(c, BN[0], BN[1], feet[2][0], feet[2][1] - bodyY, 6, 8.5, P.base, P.line);
  limb(c, FN[0], FN[1], feet[0][0], feet[0][1] - bodyY, -3, 8, P.base, P.line);
  // haunch hint
  c.beginPath(); c.arc(-15, -29, 8, -2.4, -0.3); c.strokeStyle = P.dark; c.lineWidth = 1.6; c.globalAlpha = 0.5; c.stroke(); c.globalAlpha = 1;
  // head
  c.save(); c.translate(17, -40 + headDY); c.rotate(headRot); c.scale(1.12, 1.12); c.translate(-17, 40);
  drawDogHead(c, P, earA, mouth, eye, t, o);
  c.restore();
  c.restore();
}
function drawTail(c, P, ang) {
  const pts = []; let x = -24, y = -35, a = ang;
  for (let i = 0; i <= 7; i++) { pts.push([x, y, 5.2 - i * 0.5]); a += 0.05; x += Math.cos(a) * 3.6; y += Math.sin(a) * 3.6; }
  for (const p of pts) { circ(c, p[0], p[1], p[2] + 1.7); c.fillStyle = P.line; c.fill(); }
  for (const p of pts) { circ(c, p[0], p[1], p[2]); c.fillStyle = P.base; c.fill(); }
}
function drawDogHead(c, P, earA, mouth, eye, t, o) {
  o = o || {};
  // neck
  c.beginPath(); c.moveTo(5, -41); c.quadraticCurveTo(13, -53, 24, -58); c.lineTo(35, -47); c.quadraticCurveTo(29, -33, 21, -28); c.closePath();
  fillStroke(c, P.base, P.line, 2.4);
  // collar (club navy and gold)
  drawCollar(c, o.collar);
  if (o.hat === 'bandana') drawHatOn(c, 'bandana');
  if (o.hat === 'rosette') { c.save(); c.translate(28, -33); c.scale(0.42, 0.42); drawRosette(c, 0, 0); c.restore(); }
  // skull
  ell(c, 29, -55, 11.5, 10.2); fillStroke(c, P.base, P.line, 2.4);
  // muzzle
  c.beginPath(); c.moveTo(31, -61); c.bezierCurveTo(37, -62, 44, -61, 46, -57); c.bezierCurveTo(49, -53, 48, -48, 44, -46);
  c.bezierCurveTo(40, -44.5, 35, -45, 31, -47); c.closePath(); fillStroke(c, P.base, P.line, 2.4);
  // cover the joint
  ell(c, 30, -54, 8, 7); c.fillStyle = P.base; c.fill();
  // highlight
  ell(c, 27, -61, 6, 2.6, -0.2); c.fillStyle = P.light; c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1;
  ell(c, 40, -56, 5, 2.4, -0.1); c.fillStyle = P.light; c.globalAlpha = 0.3; c.fill(); c.globalAlpha = 1;
  c.fillStyle = P.dark; for (const [wx, wy] of [[38, -51.5], [41, -52.5], [40, -49.8]]) { circ(c, wx, wy, 0.8); c.fill(); }
  // mouth
  if (mouth > 0.5) {
    c.beginPath(); c.moveTo(36, -48); c.quadraticCurveTo(42, -46.5, 46.5, -48.5); c.quadraticCurveTo(44, -41.5, 39, -42); c.closePath(); fillStroke(c, '#5a1f22', P.line, 1.4);
    ell(c, 41, -41.5, 3.4, 4.6, 0.15); fillStroke(c, '#ef7d8c', '#a5404e', 1.2);
  } else {
    c.beginPath(); c.moveTo(36.5, -48); c.quadraticCurveTo(42, -46.8, 46, -48.8); c.strokeStyle = P.line; c.lineWidth = 1.6; c.stroke();
  }
  // nose
  ell(c, 46.4, -57.4, 3.9, 3.2, 0.2); fillStroke(c, P.nose, P.line, 1.2);
  ell(c, 45.6, -58.6, 1.3, 0.8); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
  ell(c, 48.6, -56.4, 1, 1.4, 0.3); c.fillStyle = 'rgba(0,0,0,.6)'; c.fill();
  // eye
  c.lineWidth = 1.8; c.strokeStyle = P.line;
  if (eye === 'blink') { c.beginPath(); c.moveTo(31.5, -59); c.quadraticCurveTo(34, -57.6, 36.5, -59); c.stroke(); }
  else if (eye === 'happy') { c.beginPath(); c.moveTo(31.5, -58); c.quadraticCurveTo(34, -61.5, 36.5, -58); c.stroke(); }
  else if (eye === 'hurt') { c.beginPath(); c.moveTo(31.8, -61); c.lineTo(36, -58.5); c.lineTo(31.8, -56.5); c.stroke(); }
  else if (eye === 'squint') { c.beginPath(); c.moveTo(31.5, -59.5); c.lineTo(36.5, -58.8); c.stroke(); }
  else {
    if (P === DOGCOL.black) { ell(c, 34, -59, 3.9, 4.2); c.fillStyle = 'rgba(120,120,140,.35)'; c.fill(); }
    ell(c, 34, -59, 2.9, 3.3); c.fillStyle = '#120a05'; c.fill();
    ell(c, 34, -58.6, 2.1, 2.5); c.fillStyle = P.eye; c.fill();
    circ(c, 34.9, -60.3, 1.15); c.fillStyle = '#fff'; c.fill();
  }
  // brow
  c.beginPath(); c.moveTo(31, -63.5); c.quadraticCurveTo(34, -65.5, 37.5, -63.6); c.strokeStyle = P.brow; c.lineWidth = 1.5; c.stroke();
  // ear
  c.save(); c.translate(24, -62); c.rotate(earA);
  c.beginPath(); c.moveTo(-2, -1); c.bezierCurveTo(-9, 1, -11, 11, -6, 17); c.bezierCurveTo(-3, 20, 2, 19, 3, 15);
  c.bezierCurveTo(4, 9, 4, 3, 2, -1); c.closePath(); fillStroke(c, P.ear, P.line, 2.2);
  c.beginPath(); c.moveTo(-1, 2); c.quadraticCurveTo(-6, 8, -4, 14); c.strokeStyle = P.dark; c.globalAlpha = 0.6; c.lineWidth = 1.4; c.stroke(); c.globalAlpha = 1;
  c.restore();
  if (o.hat && o.hat !== 'bandana') drawHatOn(c, o.hat);
}
function drawDogSit(c, P, o, wag, mouth, eye) {
  // sitting proudly
  limb(c, 9, -30, 11, 0, -2, 7.5, P.dark, P.line);
  drawTail(c, P, Math.PI + 0.1 + wag * 0.3);
  c.save(); c.translate(-6, -8); c.rotate(-0.55); c.translate(6, 8);
  c.beginPath(); c.moveTo(-26, -34);
  c.bezierCurveTo(-24, -45, -6, -45, 6, -44); c.bezierCurveTo(15, -44, 23, -43, 27, -35);
  c.bezierCurveTo(31, -27, 27, -18, 16, -17); c.bezierCurveTo(6, -16, -4, -21, -12, -21);
  c.bezierCurveTo(-22, -21, -30, -24, -26, -34); c.closePath();
  const g = c.createLinearGradient(0, -46, 0, -16); g.addColorStop(0, P.light); g.addColorStop(0.42, P.base); g.addColorStop(1, P.dark);
  fillStroke(c, g, P.line, 2.4);
  c.restore();
  // haunch and folded back leg
  ell(c, -14, -13, 13, 11); fillStroke(c, P.base, P.line, 2.4);
  limb(c, -10, -6, 2, 0, 2, 8, P.base, P.line);
  limb(c, 14, -30, 15, 0, -2, 8, P.base, P.line);
  c.save(); c.translate(18, -18); c.translate(-17, 40); c.translate(-6, -22);
  drawDogHead(c, P, 0.05, mouth, eye, o.t || 0, o);
  c.restore();
}

// ---------------- characters & hazards ----------------
function drawMagpie(c, t, o = {}) {
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  const flap = o.perch ? 0.15 * Math.sin(t * 0.1) : Math.sin(t * 0.45);
  // tail
  c.beginPath(); c.moveTo(-10, -2); c.lineTo(-52, 4 + flap * 2); c.lineTo(-50, 11 + flap * 2); c.lineTo(-8, 6); c.closePath();
  const tg = c.createLinearGradient(-50, 0, -8, 0); tg.addColorStop(0, '#1b5a5a'); tg.addColorStop(0.5, '#2a3f7a'); tg.addColorStop(1, '#111');
  fillStroke(c, tg, '#050505', 1.6);
  // legs
  if (o.perch) { c.strokeStyle = '#222'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-2, 9); c.lineTo(-4, 18); c.moveTo(4, 9); c.lineTo(5, 18); c.stroke(); }
  // body
  ell(c, 0, 0, 17, 11.5, -0.1); fillStroke(c, '#121214', '#000', 1.6);
  ell(c, 3, 5, 10, 5.5, -0.1); c.fillStyle = '#f6f6f2'; c.fill();
  // wing
  c.save(); c.translate(-2, -4); c.rotate(-0.25 - flap * 0.7);
  c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-8, -6, -26, -4, -30, 2); c.bezierCurveTo(-22, 8, -8, 7, 4, 4); c.closePath();
  const wg = c.createLinearGradient(-30, 0, 4, 0); wg.addColorStop(0, '#20407a'); wg.addColorStop(0.6, '#1a1a1e'); wg.addColorStop(1, '#111');
  fillStroke(c, wg, '#000', 1.4);
  ell(c, -6, 1.5, 7, 2.6, 0.05); c.fillStyle = '#f2f2ee'; c.fill();
  c.restore();
  // head
  circ(c, 15, -8, 8.2); fillStroke(c, '#121214', '#000', 1.6);
  c.beginPath(); c.moveTo(21, -10.5); c.lineTo(32, -7.5); c.lineTo(21, -5); c.closePath(); fillStroke(c, '#3a3a40', '#111', 1.2);
  circ(c, 17.5, -10, 2.7); c.fillStyle = '#fff'; c.fill(); circ(c, 18.3, -10, 1.5); c.fillStyle = '#000'; c.fill();
  c.beginPath(); c.moveTo(14, -14.5); c.lineTo(20.5, -13); c.strokeStyle = '#eee'; c.lineWidth = 1.4; c.stroke();
  if (o.holding) { c.save(); c.translate(31, -4); c.scale(0.55, 0.55); drawRosette(c, t, 0); c.restore(); }
  if (o.hit) { c.globalAlpha = 0.6; ell(c, 0, -2, 22, 16); c.fillStyle = '#fff'; c.fill(); }
  c.restore();
}
function drawHoover(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round';
  ell(c, 0, -1, 26, 4); c.fillStyle = 'rgba(0,0,0,.18)'; c.fill();
  circ(c, -13, -4, 4); c.fillStyle = '#222'; c.fill(); circ(c, 13, -4, 4); c.fill();
  // brush
  c.save(); c.translate(24, -4); c.rotate(t * 0.5); c.strokeStyle = '#9aa'; c.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.stroke(); } c.restore();
  rr(c, -25, -20, 50, 15, 7); const g = c.createLinearGradient(0, -20, 0, -5); g.addColorStop(0, '#d9dde4'); g.addColorStop(1, '#8a919c'); fillStroke(c, g, '#3a3f48', 2);
  c.fillStyle = '#c8362c'; c.fillRect(-24, -12, 48, 3.2);
  ell(c, 0, -21, 14, 5.5); fillStroke(c, '#eef0f4', '#3a3f48', 1.8);
  const on = Math.sin(t * 0.25) > 0;
  circ(c, 6, -21.5, 2.6); c.fillStyle = on ? '#ff4a3a' : '#7a1c16'; c.fill();
  circ(c, 12, -20.5, 2.2); c.fillStyle = on ? '#ff4a3a' : '#7a1c16'; c.fill();
  c.beginPath(); c.moveTo(3, -25); c.lineTo(8.5, -23.5); c.moveTo(10, -23.5); c.lineTo(14.5, -24.8); c.strokeStyle = '#3a3f48'; c.lineWidth = 1.4; c.stroke();
  c.restore();
}
function drawGoose(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round'; c.lineCap = 'round';
  const step = Math.sin(t * 0.2) * (o.walking ? 1 : 0);
  c.strokeStyle = '#e08a1c'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-3, -12); c.lineTo(-3 + step * 4, 0); c.lineTo(2 + step * 4, 0); c.moveTo(4, -12); c.lineTo(4 - step * 4, 0); c.lineTo(9 - step * 4, 0); c.stroke();
  c.beginPath(); c.moveTo(-20, -24); c.quadraticCurveTo(-26, -30, -24, -20); c.quadraticCurveTo(-10, -6, 8, -10); c.quadraticCurveTo(20, -14, 16, -26); c.quadraticCurveTo(4, -34, -20, -24); c.closePath(); fillStroke(c, '#f7f7f2', '#7b7f86', 1.8);
  c.beginPath(); c.moveTo(-12, -22); c.quadraticCurveTo(0, -27, 10, -20); c.strokeStyle = '#b6bac2'; c.lineWidth = 2; c.stroke();
  const nk = o.flee ? -6 : 0;
  c.beginPath(); c.moveTo(9, -24); c.quadraticCurveTo(14, -36, 12 + nk, -46); c.strokeStyle = '#7b7f86'; c.lineWidth = 9.5; c.stroke(); c.strokeStyle = '#f7f7f2'; c.lineWidth = 7; c.stroke();
  circ(c, 13 + nk, -48, 6); fillStroke(c, '#f7f7f2', '#7b7f86', 1.6);
  const open = o.honk ? 3 : 0;
  c.beginPath(); c.moveTo(17 + nk, -50); c.lineTo(27 + nk, -48 - open * 0.3); c.lineTo(17 + nk, -46); c.closePath(); fillStroke(c, '#f09a2a', '#a25c10', 1.2);
  if (open) { c.beginPath(); c.moveTo(17 + nk, -46); c.lineTo(26 + nk, -43); c.lineTo(17 + nk, -44); c.closePath(); fillStroke(c, '#f09a2a', '#a25c10', 1.2); }
  circ(c, 14.5 + nk, -50, 1.4); c.fillStyle = '#111'; c.fill();
  c.beginPath(); c.moveTo(12 + nk, -53.5); c.lineTo(17 + nk, -52); c.strokeStyle = '#333'; c.lineWidth = 1.6; c.stroke();
  c.restore();
}
function drawSwan(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-26, -6); c.quadraticCurveTo(-34, -22, -18, -20); c.quadraticCurveTo(0, -26, 16, -14); c.quadraticCurveTo(20, -4, 10, 2); c.lineTo(-20, 2); c.closePath(); fillStroke(c, '#fbfbf7', '#7b7f86', 1.8);
  c.beginPath(); c.moveTo(-18, -14); c.quadraticCurveTo(-4, -22, 8, -12); c.strokeStyle = '#c5c8cf'; c.lineWidth = 2; c.stroke();
  c.beginPath(); c.moveTo(10, -14); c.bezierCurveTo(26, -26, 6, -40, 14, -52); c.strokeStyle = '#7b7f86'; c.lineWidth = 8.5; c.stroke(); c.strokeStyle = '#fbfbf7'; c.lineWidth = 6; c.stroke();
  circ(c, 16, -53, 5.5); fillStroke(c, '#fbfbf7', '#7b7f86', 1.5);
  c.beginPath(); c.moveTo(20, -55); c.lineTo(30, -51); c.lineTo(20, -50); c.closePath(); fillStroke(c, '#f07a1a', '#9a4a10', 1.2);
  c.beginPath(); c.moveTo(19, -56); c.lineTo(22, -51); c.strokeStyle = '#111'; c.lineWidth = 3; c.stroke();
  circ(c, 17.5, -54.5, 1.2); c.fillStyle = '#111'; c.fill();
  c.restore();
}
function drawSquirrel(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round';
  const tw = Math.sin(t * 0.15) * 0.1;
  c.save(); c.rotate(tw);
  c.beginPath(); c.moveTo(-6, -4); c.bezierCurveTo(-30, -6, -30, -40, -12, -40); c.bezierCurveTo(-2, -40, -4, -30, -10, -28); c.bezierCurveTo(-20, -26, -16, -10, -2, -8); c.closePath(); fillStroke(c, '#9a9aa2', '#4a4a52', 1.8);
  c.restore();
  ell(c, 2, -12, 9, 11); fillStroke(c, '#a6a6ae', '#4a4a52', 1.8);
  ell(c, 5, -9, 5, 7); c.fillStyle = '#e8e4dc'; c.fill();
  circ(c, 7, -27, 7); fillStroke(c, '#a6a6ae', '#4a4a52', 1.8);
  c.beginPath(); c.moveTo(3, -32); c.lineTo(4, -39); c.lineTo(8, -33); c.closePath(); fillStroke(c, '#a6a6ae', '#4a4a52', 1.4);
  circ(c, 10, -28, 1.6); c.fillStyle = '#111'; c.fill(); circ(c, 13.5, -25.5, 1.3); c.fill();
  if (o.throwing) { c.save(); c.translate(12, -16); drawAcorn(c, 0); c.restore(); }
  c.restore();
}
function drawAcorn(c, r) {
  c.save(); c.rotate(r || 0); ell(c, 0, 1.5, 4.5, 5.5); fillStroke(c, '#b5712e', '#5c3412', 1.3);
  c.beginPath(); c.arc(0, -1.5, 5, Math.PI, 0); c.closePath(); fillStroke(c, '#6b4a2a', '#3a2412', 1.3);
  c.beginPath(); c.moveTo(0, -6.5); c.lineTo(1, -9); c.strokeStyle = '#3a2412'; c.lineWidth = 1.5; c.stroke(); c.restore();
}
function drawNettles(c, w, t) {
  c.save(); c.lineJoin = 'miter';
  const n = Math.max(3, Math.round(w / 14));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i + 0.5) * w / n, h = 18 + ((i * 7) % 3) * 4, sway = Math.sin(t * 0.05 + i) * 1.5;
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x + sway, -h); c.strokeStyle = '#2f6a2a'; c.lineWidth = 2; c.stroke();
    for (const side of [-1, 1]) for (let k = 0; k < 2; k++) {
      const ly = -h * (0.45 + k * 0.35), lx = x + sway * (0.5 + k * 0.4);
      c.beginPath(); c.moveTo(lx, ly);
      for (let s = 1; s <= 5; s++) { const tt = s / 5; c.lineTo(lx + side * (tt * 12), ly - 4 + Math.sin(tt * Math.PI) * -4 + (s % 2 ? -2 : 2)); }
      c.lineTo(lx + side * 12, ly - 4); c.quadraticCurveTo(lx + side * 6, ly + 4, lx, ly); c.closePath();
      fillStroke(c, k ? '#4c9a3c' : '#3f8a34', '#1f4d1c', 1.2);
    }
  }
  c.fillStyle = 'rgba(255,255,255,.7)';
  for (let i = 0; i < n * 3; i++) { const x = -w / 2 + ((i * 37) % w), y = -6 - ((i * 13) % 20); c.fillRect(x, y, 1.2, 1.2); }
  c.restore();
}
function drawDryer(c, t, face) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round';
  // propeller
  const pw = Math.abs(Math.cos(t * 0.8)) * 18 + 2;
  c.fillStyle = '#c9ced8'; ell(c, -2, -24, pw, 2.5); c.fill();
  c.fillStyle = '#555'; c.fillRect(-3, -24, 2, 7);
  rr(c, -18, -18, 34, 18, 9); const g = c.createLinearGradient(0, -18, 0, 0); g.addColorStop(0, '#f08ab8'); g.addColorStop(1, '#b04d82'); fillStroke(c, g, '#5a1f40', 2);
  rr(c, 14, -14, 10, 10, 2); fillStroke(c, '#7a7f8a', '#333', 1.6);
  rr(c, -9, -2, 8, 14, 3); fillStroke(c, '#7a7f8a', '#333', 1.6);
  circ(c, -2, -10, 3); c.fillStyle = '#fff'; c.fill(); circ(c, 6, -10, 3); c.fill();
  circ(c, -1, -10, 1.6); c.fillStyle = '#111'; c.fill(); circ(c, 7, -10, 1.6); c.fill();
  c.restore();
}
function drawMower(c, t, face, o = {}) {
  c.save(); c.scale(face, 1); c.lineJoin = 'round'; c.lineCap = 'round';
  ell(c, 0, 0, 70, 6); c.fillStyle = 'rgba(0,0,0,.2)'; c.fill();
  // handle
  c.strokeStyle = '#333'; c.lineWidth = 6; c.beginPath(); c.moveTo(-50, -40); c.lineTo(-78, -104); c.stroke();
  c.strokeStyle = '#777'; c.lineWidth = 3.5; c.stroke();
  c.strokeStyle = '#333'; c.lineWidth = 7; c.beginPath(); c.moveTo(-86, -106); c.lineTo(-68, -110); c.stroke();
  // blades
  c.save(); c.translate(44, -8);
  for (let i = 0; i < 3; i++) { c.beginPath(); const a = t * 0.6 + i * 2.1; c.moveTo(Math.cos(a) * 22, Math.sin(a) * 4); c.lineTo(-Math.cos(a) * 22, -Math.sin(a) * 4); c.strokeStyle = '#c8ccd4'; c.lineWidth = 3; c.stroke(); }
  c.restore();
  // body
  c.beginPath(); c.moveTo(-60, -20); c.lineTo(-58, -58); c.quadraticCurveTo(-56, -66, -46, -66); c.lineTo(40, -66); c.quadraticCurveTo(60, -64, 64, -40); c.lineTo(66, -20); c.closePath();
  const g = c.createLinearGradient(0, -66, 0, -20); g.addColorStop(0, o.flash ? '#fff' : '#e8513f'); g.addColorStop(1, o.flash ? '#fdd' : '#a72c22'); fillStroke(c, g, '#4a120c', 3);
  rr(c, -26, -86, 48, 22, 8); fillStroke(c, '#9aa0aa', '#3a3f48', 2.5);
  rr(c, -20, -92, 10, 8, 2); fillStroke(c, '#5a5f68', '#2a2f38', 2);
  c.fillStyle = '#2a2f38'; for (let i = 0; i < 4; i++) c.fillRect(-14 + i * 9, -80, 4, 12);
  c.fillStyle = '#f2cf6b'; c.fillRect(-56, -40, 118, 5);
  // eyes (headlights)
  circ(c, 50, -50, 8); fillStroke(c, '#fff8c8', '#4a120c', 2.4);
  circ(c, 32, -50, 7); fillStroke(c, '#fff8c8', '#4a120c', 2.4);
  circ(c, 52, -48, 3); c.fillStyle = '#111'; c.fill(); circ(c, 34, -48, 2.8); c.fill();
  c.beginPath(); c.moveTo(24, -62); c.lineTo(40, -56); c.moveTo(44, -56); c.lineTo(58, -61); c.strokeStyle = '#2a0a06'; c.lineWidth = 3.5; c.stroke();
  // wheels
  for (const [wx, wr] of [[-38, 20], [46, 14]]) { c.save(); c.translate(wx, -wr); c.rotate(t * 0.2 * (o.moving ? 1 : 0)); circ(c, 0, 0, wr); fillStroke(c, '#222', '#000', 2); circ(c, 0, 0, wr * 0.45); c.fillStyle = '#c9ced8'; c.fill(); c.fillStyle = '#555'; c.fillRect(-1.5, -wr * 0.45, 3, wr * 0.9); c.restore(); }
  c.restore();
}
function drawTinCan(c, r) { c.save(); c.rotate(r); rr(c, -6, -8, 12, 16, 2); fillStroke(c, '#b9bfc8', '#4a4f58', 1.4); c.fillStyle = '#c8362c'; c.fillRect(-6, -3, 12, 6); c.restore(); }
function drawJudge(c, t, o = {}) {
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  c.strokeStyle = '#2a2a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-5, -30); c.lineTo(-6, 0); c.moveTo(5, -30); c.lineTo(6, 0); c.stroke();
  rr(c, -15, -66, 30, 40, 9); fillStroke(c, '#6b5a3a', '#2e2412', 2);
  c.beginPath(); c.moveTo(0, -66); c.lineTo(-5, -50); c.lineTo(0, -46); c.lineTo(5, -50); c.closePath(); c.fillStyle = '#e8e2d4'; c.fill();
  c.strokeStyle = '#6b5a3a'; c.lineWidth = 7; c.beginPath(); c.moveTo(12, -60); c.lineTo(22, -44 + (o.write ? Math.sin(t * 0.3) * 2 : 0)); c.stroke();
  rr(c, 16, -54, 13, 17, 2); fillStroke(c, '#f6f0e0', '#555', 1.5);
  circ(c, 0, -76, 10); fillStroke(c, '#f1c9a5', '#8a5a3a', 1.8);
  c.beginPath(); c.moveTo(-14, -82); c.lineTo(14, -82); c.strokeStyle = '#3a3428'; c.lineWidth = 3.5; c.stroke();
  rr(c, -9, -95, 18, 13, 4); fillStroke(c, '#4a4234', '#2a2418', 1.5);
  circ(c, 3, -77, 1.4); c.fillStyle = '#222'; c.fill();
  c.beginPath(); c.arc(1, -73, 3.2, 0.2, Math.PI - 0.2); c.strokeStyle = '#8a4a3a'; c.lineWidth = 1.4; c.stroke();
  c.restore();
}

// ---------------- items ----------------
function drawBone(c, spin) {
  const sx = Math.max(0.22, Math.abs(Math.cos(spin)));
  c.save(); c.scale(sx, 1);
  c.fillStyle = '#9a6630'; circ(c, -9.5, -3.4, 5); c.fill(); circ(c, -9.5, 3.4, 5); c.fill(); circ(c, 9.5, -3.4, 5); c.fill(); circ(c, 9.5, 3.4, 5); c.fill();
  c.fillRect(-10, -5.2, 20, 10.4);
  c.fillStyle = '#dca35c'; circ(c, -9.5, -3.4, 3.7); c.fill(); circ(c, -9.5, 3.4, 3.7); c.fill(); circ(c, 9.5, -3.4, 3.7); c.fill(); circ(c, 9.5, 3.4, 3.7); c.fill();
  c.fillRect(-10, -3.9, 20, 7.8);
  c.fillStyle = '#f2c98a'; c.fillRect(-7, -2.8, 13, 2);
  c.fillStyle = '#a86e34'; c.fillRect(-4, 0.6, 1.6, 1.6); c.fillRect(2, 0.2, 1.6, 1.6);
  c.restore();
}
function drawRosette(c, t, bob) {
  c.save(); c.translate(0, Math.sin(t * 0.06) * (bob == null ? 3 : bob));
  c.lineJoin = 'round';
  for (const [dx, col] of [[-5, NAVY2], [5, GOLD]]) { const tl = dx > 0 ? 4 : -4; c.beginPath(); c.moveTo(dx - 5, 6); c.lineTo(dx + 5, 6); c.lineTo(dx + 5 + tl, 34); c.lineTo(dx + tl, 28); c.lineTo(dx - 5 + tl, 34); c.closePath(); fillStroke(c, col, '#3a2a08', 1.4); }
  c.beginPath(); const n = 22;
  for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, r = i % 2 ? 15 : 18.5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  c.closePath(); fillStroke(c, '#efc24a', '#8a6614', 1.6);
  circ(c, 0, 0, 11.5); fillStroke(c, NAVY2, '#0c1630', 1.4);
  // paw
  c.fillStyle = GOLD2; ell(c, 0, 3, 4.4, 3.6); c.fill();
  for (const [px, py] of [[-5, -2.5], [-1.8, -5.8], [1.8, -5.8], [5, -2.5]]) { ell(c, px, py, 1.8, 2.2); c.fill(); }
  // shine
  const sh = (t * 0.03) % 3;
  if (sh < 1) { c.globalAlpha = 0.8 * Math.sin(sh * Math.PI); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-14, -14); c.lineTo(-6, -16); c.lineTo(14, 8); c.lineTo(6, 12); c.closePath(); c.save(); circ(c, 0, 0, 18.5); c.clip(); c.beginPath(); c.moveTo(-18 + sh * 36, -20); c.lineTo(-10 + sh * 36, -20); c.lineTo(-22 + sh * 36, 20); c.lineTo(-30 + sh * 36, 20); c.closePath(); c.fill(); c.restore(); c.globalAlpha = 1; }
  c.restore();
}
function drawTrophy(c, t) {
  c.save(); c.lineJoin = 'round';
  rr(c, -16, -10, 32, 10, 2); fillStroke(c, '#3a2a18', '#1a1208', 1.5);
  rr(c, -10, -18, 20, 8, 2); fillStroke(c, '#e5b53e', '#7a5a10', 1.5);
  c.fillRect(-3, -32, 6, 14); c.fillStyle = '#d4a432'; c.fillRect(-3, -32, 6, 14);
  c.beginPath(); c.moveTo(-18, -62); c.lineTo(18, -62); c.quadraticCurveTo(18, -34, 0, -32); c.quadraticCurveTo(-18, -34, -18, -62); c.closePath();
  const g = c.createLinearGradient(-18, 0, 18, 0); g.addColorStop(0, '#b8871e'); g.addColorStop(0.4, '#ffe08a'); g.addColorStop(1, '#c8962a'); fillStroke(c, g, '#7a5a10', 2);
  c.beginPath(); c.arc(-20, -52, 7, Math.PI * 0.5, Math.PI * 1.5); c.moveTo(20, -59); c.arc(20, -52, 7, -Math.PI * 0.5, Math.PI * 0.5); c.strokeStyle = '#c8962a'; c.lineWidth = 3.5; c.stroke();
  c.restore();
}
function drawSpring(c, s, world) {
  const k = s.anim > 0 ? 1 - s.anim / 12 * 0.6 : 1;
  c.save(); c.lineJoin = 'round';
  if (s.kind === 'left' || s.kind === 'right') { c.translate(0, -4); c.rotate(s.kind === 'left' ? -0.6 : 0.6); }
  if (world === 1 && s.kind === 'up') { // trampoline
    c.strokeStyle = '#1d3366'; c.lineWidth = 4; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-24, -22); c.moveTo(30, 0); c.lineTo(24, -22); c.stroke();
    rr(c, -34, -26, 68, 7, 3); fillStroke(c, '#2a5fae', '#13284f', 2);
    c.beginPath(); c.moveTo(-28, -22); c.quadraticCurveTo(0, -22 + (1 - k) * 18, 28, -22); c.strokeStyle = '#111'; c.lineWidth = 4; c.stroke();
    c.restore(); return;
  }
  if (s.kind === 'castle') { drawCastle(c, k); c.restore(); return; }
  if (world === 5 && s.kind === 'up') { // striped awning bouncer
    c.fillStyle = '#6b4a2a'; c.fillRect(-26, -24 * k, 4, 24 * k); c.fillRect(22, -24 * k, 4, 24 * k);
    for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#fff' : '#c8362c'; c.beginPath(); c.moveTo(-30 + i * 10, -24 * k); c.lineTo(-20 + i * 10, -24 * k); c.lineTo(-20 + i * 10, -32 * k); c.lineTo(-30 + i * 10, -32 * k); c.fill(); }
    rr(c, -30, -32 * k, 60, 8, 3); c.strokeStyle = '#6a1a14'; c.lineWidth = 2; c.stroke();
    c.restore(); return;
  }
  const h = 22 * k;
  rr(c, -16, -5, 32, 5, 2); fillStroke(c, '#5a5f68', '#2a2f38', 1.5);
  c.beginPath(); for (let i = 0; i <= 6; i++) c.lineTo(i % 2 ? 10 : -10, -5 - h * i / 6); c.strokeStyle = '#9aa0aa'; c.lineWidth = 3; c.stroke();
  rr(c, -17, -9 - h, 34, 7, 3); fillStroke(c, '#e8513f', '#6a1a14', 2);
  c.restore();
}
function drawPad(c, t) {
  rr(c, -36, -6, 72, 8, 4); fillStroke(c, NAVY2, '#0c1630', 1.6);
  for (let i = 0; i < 3; i++) {
    const a = ((t * 0.08 + i / 3) % 1); c.globalAlpha = 0.35 + 0.65 * Math.sin(a * Math.PI);
    const x = -22 + i * 16; c.beginPath(); c.moveTo(x, -5); c.lineTo(x + 8, -2); c.lineTo(x, 1); c.strokeStyle = GOLD2; c.lineWidth = 2.6; c.stroke();
  }
  c.globalAlpha = 1;
}
function drawCheck(c, ch, t) {
  c.save(); c.lineJoin = 'round';
  c.fillStyle = '#5a5f68'; c.fillRect(-3, -96, 6, 96); circ(c, 0, -98, 5); c.fillStyle = GOLD2; c.fill();
  const fy = ch.on ? -94 : -36, wave = Math.sin(t * 0.15) * 3;
  c.beginPath(); c.moveTo(3, fy); c.quadraticCurveTo(22, fy + 4 + wave, 42, fy + 12 + wave); c.quadraticCurveTo(22, fy + 18 - wave, 3, fy + 26); c.closePath();
  fillStroke(c, ch.on ? NAVY2 : '#8a8f98', '#0c1630', 1.6);
  if (ch.on) { c.fillStyle = GOLD2; ell(c, 17, fy + 15, 3.2, 2.6); c.fill(); for (const [px, py] of [[13, fy + 10], [16, fy + 8], [19.5, fy + 8], [22, fy + 10.5]]) { ell(c, px, py, 1.3, 1.6); c.fill(); } }
  c.restore();
}
function drawFinish(c, t, w = 220) {
  c.save(); c.lineJoin = 'round';
  for (const x of [-w / 2, w / 2 - 14]) { rr(c, x, -190, 14, 190, 4); fillStroke(c, NAVY2, '#0c1630', 2); c.fillStyle = GOLD; c.fillRect(x + 4, -190, 3, 190); }
  rr(c, -w / 2 - 10, -214, w + 20, 52, 12); fillStroke(c, NAVY, GOLD, 3.5);
  c.fillStyle = GOLD2; c.font = '700 30px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Finish', 0, -187);
  circ(c, -w / 2 + 20, -188, 15); fillStroke(c, GOLD, '#8a6414', 2); circ(c, w / 2 - 20, -188, 15); fillStroke(c, GOLD, '#8a6414', 2);
  for (const bx of [-w / 2 + 20, w / 2 - 20]) { c.fillStyle = NAVY; ell(c, bx, -184, 4.5, 3.6); c.fill(); for (const [px, py] of [[-5, -4], [-2, -8], [2, -8], [5, -4]]) { ell(c, bx + px, -184 + py, 1.7, 2.1); c.fill(); } }
  // bunting
  c.strokeStyle = '#ddd'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-w / 2 + 7, -150); c.quadraticCurveTo(0, -128, w / 2 - 7, -150); c.stroke();
  for (let i = 1; i < 9; i++) { const tt = i / 9, x = lerp(-w / 2 + 7, w / 2 - 7, tt), y = -150 + Math.sin(tt * Math.PI) * 11; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x + 7, y); c.lineTo(x, y + 13 + Math.sin(t * 0.1 + i) * 1.5); c.closePath(); c.fillStyle = i % 2 ? GOLD : NAVY2; c.fill(); }
  c.restore();
}
function drawSign(c, text, t) {
  c.save(); c.lineJoin = 'round';
  c.fillStyle = '#7a5230'; c.fillRect(-4, -58, 8, 58);
  c.font = '600 15px Fredoka, system-ui, sans-serif';
  const lines = text.split('\n'); const w = Math.max(...lines.map(l => c.measureText(l).width)) + 26, h = 18 * lines.length + 16;
  rr(c, -w / 2, -58 - h, w, h, 9); fillStroke(c, '#f5e6c4', '#7a5230', 3);
  c.fillStyle = NAVY; c.textAlign = 'center'; c.textBaseline = 'middle';
  lines.forEach((l, i) => c.fillText(l, 0, -58 - h + 17 + i * 18));
  c.restore();
}

// ---------------- platforms, loops ----------------
function drawPlat(c, p, L, t) {
  const x = p.x, y = p.y, w = p.w;
  c.save(); c.lineJoin = 'round';
  switch (p.kind) {
    case 'shed': {
      const gy = L.g(x + w / 2); const h = gy - y;
      rr(c, x + 10, y + 8, w - 20, h - 8, 2); fillStroke(c, '#8a6440', '#4a3020', 2);
      c.strokeStyle = 'rgba(60,35,15,.45)'; c.lineWidth = 1.5; for (let i = x + 22; i < x + w - 12; i += 12) { c.beginPath(); c.moveTo(i, y + 10); c.lineTo(i, gy); c.stroke(); }
      rr(c, x + w * 0.5 - 18, gy - 64, 36, 64, 2); fillStroke(c, '#6e4a2c', '#3a2414', 2);
      rr(c, x + 22, y + 26, 30, 22, 2); fillStroke(c, '#bfe3f5', '#4a3020', 2);
      rr(c, x, y, w, 12, 3); fillStroke(c, '#4a505a', '#22262c', 2);
      break;
    }
    case 'line': {
      c.fillStyle = '#6a6f78'; c.fillRect(x - 3, y - 4, 5, L.g(x) - y + 4); c.fillRect(x + w - 2, y - 4, 5, L.g(x + w) - y + 4);
      c.strokeStyle = '#ddd'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.stroke();
      const cols = ['#e85a7a', '#4aa3df', '#f2cf6b', '#7ac25a', '#fff'];
      for (let i = 0, cx = x + 20; cx < x + w - 30; cx += 46, i++) {
        const sw = Math.sin(t * 0.05 + i) * 2; c.fillStyle = cols[i % 5];
        if (i % 2) { c.beginPath(); c.moveTo(cx, y); c.lineTo(cx + 26, y); c.lineTo(cx + 24 + sw, y + 30); c.lineTo(cx + 2 + sw, y + 30); c.closePath(); c.fill(); }
        else { c.beginPath(); c.moveTo(cx, y); c.lineTo(cx + 30, y); c.lineTo(cx + 36, y + 9); c.lineTo(cx + 26, y + 12); c.lineTo(cx + 26 + sw, y + 32); c.lineTo(cx + 4 + sw, y + 32); c.lineTo(cx + 4, y + 12); c.lineTo(cx - 6, y + 9); c.closePath(); c.fill(); }
        c.fillStyle = '#8a6440'; c.fillRect(cx + 4, y - 3, 3, 6); c.fillRect(cx + 20, y - 3, 3, 6);
      }
      break;
    }
    case 'bale': {
      rr(c, x, y, w, 34, 5); fillStroke(c, '#e6c25c', '#9a7a24', 2);
      c.strokeStyle = 'rgba(150,110,30,.55)'; c.lineWidth = 1.3;
      for (let i = x + 6; i < x + w - 4; i += 7) { c.beginPath(); c.moveTo(i, y + 4); c.lineTo(i + 3, y + 30); c.stroke(); }
      c.strokeStyle = '#b5532a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 11); c.lineTo(x + w, y + 11); c.moveTo(x, y + 24); c.lineTo(x + w, y + 24); c.stroke();
      break;
    }
    case 'boat': {
      const hullTop = y + 26;
      c.beginPath(); c.moveTo(x - 6, hullTop); c.lineTo(x + w + 18, hullTop); c.quadraticCurveTo(x + w + 30, hullTop + 4, x + w + 10, hullTop + 40); c.lineTo(x + 6, hullTop + 40); c.quadraticCurveTo(x - 10, hullTop + 20, x - 6, hullTop); c.closePath();
      fillStroke(c, '#1f3d2a', '#0c1a10', 2.4);
      c.fillStyle = '#e8c04a'; c.fillRect(x - 4, hullTop + 4, w + 24, 3);
      rr(c, x + 10, y, w - 20, 27, 3); fillStroke(c, '#a8302a', '#4a100c', 2.2);
      for (let wx = x + 26; wx < x + w - 36; wx += 34) { circ(c, wx + 8, y + 14, 6); fillStroke(c, '#fbe9b8', '#4a100c', 1.6); }
      c.fillStyle = '#2e6a3e'; c.fillRect(x + w - 30, y + 4, 14, 22);
      c.fillStyle = '#e8c04a'; c.font = '600 9px Fredoka, sans-serif'; c.textAlign = 'center';
      rr(c, x + 6, y - 3, w - 12, 6, 2); fillStroke(c, '#1f3d2a', '#0c1a10', 1.4);
      if (p.move && p.move.type === 'ride') { c.fillStyle = '#2a2a2a'; c.fillRect(x + w - 26, y - 22, 3, 22); const lg = c.createRadialGradient(x + w - 24, y - 26, 2, x + w - 24, y - 26, 60); lg.addColorStop(0, 'rgba(255,220,120,.9)'); lg.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = lg; c.fillRect(x + w - 84, y - 86, 120, 120); rr(c, x + w - 30, y - 34, 12, 14, 3); fillStroke(c, '#ffd26a', '#2a2a2a', 1.5); }
      // flower pots on roof
      for (const fx of [x + 30, x + w - 40]) { rr(c, fx - 6, y - 12, 12, 9, 2); fillStroke(c, '#b5532a', '#5a2410', 1.2); circ(c, fx - 3, y - 15, 3); c.fillStyle = '#e85a7a'; c.fill(); circ(c, fx + 3, y - 16, 3); c.fillStyle = '#f2cf6b'; c.fill(); }
      break;
    }
    case 'ledge': {
      rr(c, x, y, w, 20, 2); fillStroke(c, '#a24b33', '#5a2416', 2);
      c.strokeStyle = 'rgba(240,210,180,.45)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y + 10); c.lineTo(x + w, y + 10); c.stroke();
      for (let i = x + 12; i < x + w; i += 24) { c.beginPath(); c.moveTo(i, y); c.lineTo(i, y + 10); c.moveTo(i + 12, y + 10); c.lineTo(i + 12, y + 20); c.stroke(); }
      c.fillStyle = '#c9b48a'; c.fillRect(x - 3, y - 4, w + 6, 6);
      break;
    }
    case 'stall': {
      const gy = L.g(x + w / 2);
      c.fillStyle = '#6b4a2a'; c.fillRect(x + 6, y, 6, gy - y); c.fillRect(x + w - 12, y, 6, gy - y);
      rr(c, x + 4, y + 10, w - 8, Math.min(40, gy - y - 10), 3); fillStroke(c, NAVY2, '#0c1630', 1.8);
      c.fillStyle = GOLD2; c.font = '600 13px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.label || 'Leads & collars', x + w / 2, y + 26);
      rr(c, x, y, w, 10, 3); fillStroke(c, '#a07040', '#4a3020', 1.8);
      break;
    }
    case 'canvas': {
      rr(c, x, y, w, 14, 5); fillStroke(c, '#fbfbf7', '#8a8f98', 2);
      for (let i = x + 8; i < x + w - 8; i += 24) { c.fillStyle = NAVY2; c.fillRect(i, y + 2, 12, 10); }
      break;
    }
    case 'raft': {
      for (const bx of [x + 18, x + w - 18]) { ell(c, bx, y + 18, 14, 9); fillStroke(c, '#3a6ab0', '#13284f', 1.6); }
      for (let i = x; i < x + w - 4; i += 22) { rr(c, i, y, 20, 12, 3); fillStroke(c, '#b9844c', '#5a3a1c', 1.6); }
      c.strokeStyle = '#c9b48a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x + w, y + 6); c.stroke();
      break;
    }
    case 'log': {
      rr(c, x, y, w, 22, 11); fillStroke(c, '#7a5230', '#3a2412', 2);
      c.strokeStyle = 'rgba(40,24,10,.45)'; c.lineWidth = 1.4; for (let i = x + 16; i < x + w - 10; i += 26) { c.beginPath(); c.moveTo(i, y + 4); c.quadraticCurveTo(i + 8, y + 11, i, y + 18); c.stroke(); }
      ell(c, x + w - 4, y + 11, 6, 10); fillStroke(c, '#c9a070', '#3a2412', 1.6); c.beginPath(); c.arc(x + w - 4, y + 11, 3.5, 0, TAU); c.strokeStyle = '#8a6440'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#4f8a3a'; ell(c, x + 30, y + 1, 10, 3); c.fill();
      break;
    }
    case 'girder': {
      rr(c, x, y, w, 14, 2); fillStroke(c, '#7a3a26', '#3a1a10', 2);
      c.fillStyle = '#3a1a10'; for (let i = x + 8; i < x + w - 4; i += 16) { circ(c, i, y + 7, 1.8); c.fill(); }
      break;
    }
    default: { // plank
      rr(c, x, y, w, 14, 4); fillStroke(c, '#b9844c', '#5a3a1c', 2);
      c.strokeStyle = 'rgba(90,58,28,.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 6, y + 7); c.lineTo(x + w - 6, y + 7); c.stroke();
      c.fillStyle = '#5a3a1c'; circ(c, x + 7, y + 7, 1.6); c.fill(); circ(c, x + w - 7, y + 7, 1.6); c.fill();
    }
  }
  c.restore();
}
function drawLoopRing(c, l, world, t, part) {
  const R = l.r + 14;
  c.save(); c.lineCap = 'butt';
  const a0 = part === 'front' ? 0.15 * Math.PI : 0, a1 = part === 'front' ? 0.85 * Math.PI : TAU;
  if (part === 'front' && world !== 5) { c.restore(); return; }
  // supports
  if (part !== 'front') {
    c.fillStyle = 'rgba(0,0,0,.15)'; ell(c, l.x, l.gy + 2, R, 8); c.fill();
  }
  if (world === 1) {
    c.beginPath(); c.arc(l.x, l.cy, R, a0, a1); c.strokeStyle = '#1f6a2a'; c.lineWidth = 30; c.stroke();
    c.strokeStyle = '#3aa64a'; c.lineWidth = 24; c.stroke();
    c.setLineDash([10, 22]); c.lineDashOffset = -t; c.strokeStyle = '#f2cf6b'; c.lineWidth = 6; c.stroke(); c.setLineDash([]);
    c.beginPath(); c.arc(l.x, l.cy, R - 8, a0, a1); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.stroke();
    // nozzle
    rr(c, l.x - 22, l.gy - 14, 44, 14, 6); fillStroke(c, '#f2cf6b', '#8a6414', 2);
  } else if (world === 2) {
    c.beginPath(); c.arc(l.x, l.cy, R, a0, a1); c.strokeStyle = '#3a1a10'; c.lineWidth = 30; c.stroke();
    c.strokeStyle = '#8a4a2e'; c.lineWidth = 24; c.stroke();
    c.strokeStyle = '#3a1a10'; c.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; c.beginPath(); c.moveTo(l.x + Math.cos(a) * (R - 12), l.cy + Math.sin(a) * (R - 12)); c.lineTo(l.x + Math.cos(a) * (R + 12), l.cy + Math.sin(a) * (R + 12)); c.stroke(); }
    c.fillStyle = '#5a2a18'; c.fillRect(l.x - R - 14, l.gy - 10, 28, 10); c.fillRect(l.x + R - 14, l.gy - 10, 28, 10);
  } else {
    const cols = world === 5 ? [NAVY2, GOLD, '#c8362c', '#fff'] : world === 4 ? ['#4f8a3a', '#6aa84a', '#5a9a40', '#7ab85a'] : world === 6 ? ['#d8362c', '#fff'] : ['#e8513f', '#fff'];
    const n = 28;
    for (let i = 0; i < n; i++) {
      const s = a0 + (a1 - a0) * i / n, e = a0 + (a1 - a0) * (i + 1) / n;
      if (part === 'front' && (i < 2 || i > n - 3)) continue;
      c.beginPath(); c.arc(l.x, l.cy, R, s, e + 0.01); c.strokeStyle = cols[i % cols.length]; c.lineWidth = 28; c.stroke();
    }
    c.beginPath(); c.arc(l.x, l.cy, R + 14, a0, a1); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.arc(l.x, l.cy, R - 14, a0, a1); c.stroke();
  }
  c.restore();
}

// ---------------- decor ----------------
function drawDecor(c, d, t, world) {
  c.save(); c.translate(d.x, d.y); c.scale(d.s * (d.flip ? -1 : 1), d.s); c.lineJoin = 'round'; c.lineCap = 'round';
  const r = d.seed;
  switch (d.kind) {
    case 'flowers': {
      const cols = ['#e85a7a', '#f2cf6b', '#b06ad6', '#ff8a4a', '#fff'];
      for (let i = 0; i < 6; i++) { const x = -22 + i * 9, h = 14 + ((i * 5 + r * 10) % 10); c.strokeStyle = '#3a8a34'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 1, -h); c.stroke();
        c.fillStyle = cols[(i + Math.floor(r * 5)) % 5]; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; ell(c, x + 1 + Math.cos(a) * 3.2, -h + Math.sin(a) * 3.2, 2.6, 2.6); c.fill(); } circ(c, x + 1, -h, 2); c.fillStyle = '#f2cf6b'; c.fill(); }
      break;
    }
    case 'bush': { for (const [x, y, rr2] of [[-18, -14, 16], [0, -22, 20], [18, -14, 16]]) { circ(c, x, y, rr2); fillStroke(c, world === 2 ? '#3f6e36' : world === 4 ? '#8a7a2a' : world === 6 ? '#3e6a4a' : '#4f9a40', '#2a5a22', 2); } if (world === 6) { c.fillStyle = '#fff'; for (const [x, y] of [[-18, -26], [0, -38], [18, -26]]) { ell(c, x, y, 12, 5); c.fill(); } } c.fillStyle = 'rgba(255,255,255,.18)'; circ(c, -4, -30, 8); c.fill(); break; }
    case 'tree': {
      c.fillStyle = '#6b4a2a'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-6, -80); c.lineTo(6, -80); c.lineTo(9, 0); c.closePath(); c.fill();
      const g1 = world === 2 ? '#3f6e36' : world === 4 ? '#c2702a' : world === 6 ? '#3e6a4a' : '#4a9a3c', g2 = world === 2 ? '#548a46' : world === 4 ? '#e0a03a' : world === 6 ? '#f4f8ff' : '#62b24e';
      for (const [x, y, rr2, col] of [[-30, -92, 30, g1], [28, -96, 32, g1], [0, -128, 38, g1], [-14, -108, 28, g2], [18, -120, 24, g2]]) { circ(c, x, y, rr2); fillStroke(c, col, '#24501e', 2); }
      break;
    }
    case 'gnome': {
      rr(c, -8, -20, 16, 18, 5); fillStroke(c, '#2a6ad0', '#13284f', 1.6);
      c.fillStyle = '#6b4a2a'; c.fillRect(-7, -3, 6, 3); c.fillRect(1, -3, 6, 3);
      c.beginPath(); c.moveTo(-8, -18); c.quadraticCurveTo(0, -8, 8, -18); c.lineTo(0, -10); c.closePath(); c.fillStyle = '#fff'; c.fill();
      circ(c, 0, -24, 6); fillStroke(c, '#f1c9a5', '#8a5a3a', 1.4);
      c.beginPath(); c.moveTo(-7, -26); c.lineTo(0, -44); c.lineTo(7, -26); c.closePath(); fillStroke(c, '#d8362c', '#6a1a14', 1.6);
      c.beginPath(); c.moveTo(-6, -22); c.quadraticCurveTo(0, -8, 6, -22); c.fillStyle = '#fff'; c.fill();
      break;
    }
    case 'sunflower': { c.strokeStyle = '#3a8a34'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(4, -40, 0, -78); c.stroke(); ell(c, 8, -40, 9, 4, -0.5); c.fillStyle = '#4a9a3c'; c.fill();
      for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + Math.sin(t * 0.02) * 0.05; ell(c, Math.cos(a) * 12, -80 + Math.sin(a) * 12, 7, 3.4, a); c.fillStyle = '#f2c12e'; c.fill(); }
      circ(c, 0, -80, 8.5); fillStroke(c, '#6b3a1a', '#3a1a08', 1.5); break; }
    case 'birdbath': { c.fillStyle = '#b9b4a8'; c.fillRect(-4, -34, 8, 34); rr(c, -12, -4, 24, 4, 2); c.fill(); c.beginPath(); c.ellipse(0, -36, 22, 7, 0, 0, Math.PI); c.fillStyle = '#a8a294'; c.fill(); ell(c, 0, -37, 19, 4); c.fillStyle = '#7ec8f0'; c.fill(); break; }
    case 'tuft': { if (world === 6) break; c.strokeStyle = world === 2 ? '#7a8a4a' : world === 4 ? '#a8863a' : world === 7 ? '#7a8a4a' : '#3f9a34'; c.lineWidth = 2.2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 3, 2); c.quadraticCurveTo(i * 4, -6, i * 6 + Math.sin(t * 0.05 + i) * 1.5, -12 + Math.abs(i) * 2); c.stroke(); } break; }
    case 'daisy': { c.strokeStyle = '#3f9a34'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 2); c.lineTo(0, -10); c.stroke(); c.fillStyle = '#fff'; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ell(c, Math.cos(a) * 3, -10 + Math.sin(a) * 3, 2.2, 1.4, a); c.fill(); } circ(c, 0, -10, 1.6); c.fillStyle = '#f2cf6b'; c.fill(); break; }
    case 'lamp': { c.fillStyle = '#1e2a22'; c.fillRect(-3, -110, 6, 110); rr(c, -8, -6, 16, 6, 2); c.fill(); c.fillRect(-9, -116, 18, 4);
      c.beginPath(); c.moveTo(-9, -116); c.lineTo(-12, -136); c.lineTo(12, -136); c.lineTo(9, -116); c.closePath(); fillStroke(c, '#fbe8a8', '#1e2a22', 2.5); c.beginPath(); c.moveTo(-14, -136); c.lineTo(0, -146); c.lineTo(14, -136); c.closePath(); c.fillStyle = '#1e2a22'; c.fill(); break; }
    case 'bench': { c.fillStyle = '#2a3a2e'; c.fillRect(-30, -22, 4, 22); c.fillRect(26, -22, 4, 22); c.fillStyle = '#9a6a3a'; for (let i = 0; i < 2; i++) c.fillRect(-34, -24 + i * 6, 68, 4); for (let i = 0; i < 3; i++) c.fillRect(-34, -48 + i * 7, 68, 4); c.fillStyle = '#2a3a2e'; c.fillRect(-30, -50, 4, 30); c.fillRect(26, -50, 4, 30); break; }
    case 'bollard': { rr(c, -9, -26, 18, 26, 4); fillStroke(c, '#22262c', '#000', 1.5); rr(c, -12, -30, 24, 6, 3); fillStroke(c, '#22262c', '#000', 1.5); c.fillStyle = '#fff'; c.fillRect(-9, -18, 18, 4); break; }
    case 'reeds': { for (let i = 0; i < 7; i++) { const x = -18 + i * 6, h = 40 + ((i * 13) % 20); c.strokeStyle = '#6a8a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 4); c.quadraticCurveTo(x + 2, -h / 2, x + Math.sin(t * 0.03 + i) * 3, -h); c.stroke(); if (i % 2) { rr(c, x - 2.5 + Math.sin(t * 0.03 + i) * 3, -h - 2, 5, 14, 2.5); c.fillStyle = '#6b4a2a'; c.fill(); } } break; }
    case 'milepost': { rr(c, -8, -44, 16, 44, 2); fillStroke(c, '#e8e2d0', '#5a5448', 1.6); c.fillStyle = '#1e2a22'; c.font = '600 8px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText('BHAM', 0, -32); c.fillText('4½', 0, -22); break; }
    case 'lifebuoy': { c.fillStyle = '#3a3a3a'; c.fillRect(-3, -70, 6, 70); c.fillRect(-14, -70, 28, 4); circ(c, 0, -48, 14); c.strokeStyle = '#e8513f'; c.lineWidth = 8; c.stroke(); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(0, -48, 14, k * Math.PI / 2, k * Math.PI / 2 + 0.4); c.strokeStyle = '#fff'; c.stroke(); } break; }
    case 'lockgate': { c.fillStyle = '#1e1e1e'; c.fillRect(-6, -60, 12, 60); c.save(); c.translate(0, -56); c.rotate(-0.08); rr(c, -110, -6, 120, 12, 3); fillStroke(c, '#1e1e1e', '#000', 1); c.fillStyle = '#fff'; c.fillRect(-106, -4, 30, 8); c.fillRect(-60, -4, 30, 8); c.restore(); break; }
    case 'bunting': {
      c.fillStyle = '#e8e2d0'; c.fillRect(-2.5, -120, 5, 120); c.fillRect(197.5, -120, 5, 120);
      c.strokeStyle = '#ccc'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, -116); c.quadraticCurveTo(100, -90, 200, -116); c.stroke();
      for (let i = 1; i < 12; i++) { const tt = i / 12, x = 200 * tt, y = -116 + Math.sin(tt * Math.PI) * 13; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x + 7, y); c.lineTo(x + Math.sin(t * 0.08 + i), y + 15); c.closePath(); c.fillStyle = i % 2 ? GOLD : NAVY2; c.fill(); }
      break;
    }
    case 'bale': { rr(c, -30, -34, 60, 34, 5); fillStroke(c, '#e6c25c', '#9a7a24', 2); c.strokeStyle = '#b5532a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, -23); c.lineTo(30, -23); c.moveTo(-30, -10); c.lineTo(30, -10); c.stroke(); break; }
    case 'hurdle': { c.fillStyle = '#fff'; c.fillRect(-30, -50, 5, 50); c.fillRect(25, -50, 5, 50); for (let i = 0; i < 2; i++) { c.fillStyle = i ? NAVY2 : GOLD; c.fillRect(-28, -42 + i * 16, 56, 5); } break; }
    case 'flag': { c.fillStyle = '#ccc'; c.fillRect(-2, -130, 4, 130); const w2 = Math.sin(t * 0.08 + r * 6) * 4; c.beginPath(); c.moveTo(2, -128); c.quadraticCurveTo(24, -124 + w2, 46, -120); c.lineTo(46, -96); c.quadraticCurveTo(24, -100 - w2, 2, -104); c.closePath(); c.fillStyle = r < 0.5 ? NAVY2 : GOLD; c.fill(); break; }
    case 'weave': { for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#fff' : GOLD; c.fillRect(-40 + i * 16, -56, 4, 56); c.fillStyle = NAVY2; c.fillRect(-40 + i * 16, -40, 4, 6); } c.fillStyle = '#555'; c.fillRect(-44, -3, 88, 3); break; }
    case 'cone': { c.beginPath(); c.moveTo(-9, 0); c.lineTo(0, -24); c.lineTo(9, 0); c.closePath(); fillStroke(c, '#ff7a2a', '#8a3a10', 1.4); c.fillStyle = '#fff'; c.fillRect(-5, -12, 10, 3); break; }
    case 'ringfence': { c.fillStyle = '#fff'; for (let x = 0; x <= d.w; x += 60) c.fillRect(x - 2, -34, 4, 34); c.fillRect(0, -32, d.w, 4); c.fillRect(0, -18, d.w, 4); break; }
    case 'judge': { c.scale(d.flip ? -1 : 1, 1); drawJudge(c, t, { write: true }); break; }
    case 'crowdbench': {
      const cols = ['#c8362c', '#2a6ad0', '#7ac25a', '#f2cf6b', '#b06ad6', '#555', '#e88a4a'];
      for (let i = 0; i < 6; i++) { const x = -60 + i * 24, col = cols[(i + Math.floor(r * 7)) % 7], bob = Math.sin(t * 0.1 + i) * (d.cheer ? 2 : 0.5);
        rr(c, x - 9, -34 + bob, 18, 24, 7); c.fillStyle = col; c.fill(); circ(c, x, -42 + bob, 7); c.fillStyle = ['#f1c9a5', '#c99a72', '#8a5a3a', '#f6d8bc'][i % 4]; c.fill(); }
      c.fillStyle = '#8a6440'; c.fillRect(-72, -14, 144, 6); c.fillRect(-66, -8, 5, 8); c.fillRect(61, -8, 5, 8);
      break;
    }
    case 'nest': {
      c.strokeStyle = '#6b4a2a'; c.lineWidth = 3;
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI; c.beginPath(); c.moveTo(-60 + i * 5, 0); c.quadraticCurveTo(-30 + Math.cos(a) * 30, -20, 60 - i * 4, -4 - (i % 3) * 4); c.stroke(); }
      ell(c, 0, -6, 62, 14); c.strokeStyle = '#4a3018'; c.lineWidth = 5; c.stroke();
      for (const [x, col] of [[-30, '#efc24a'], [-6, '#c9ced8'], [20, '#efc24a'], [38, '#e8513f']]) { circ(c, x, -16, 7); c.fillStyle = col; c.fill(); }
      break;
    }
    default: drawDecor2(c, d, t, world, r);
  }
  c.restore();
}

// ---------------- world styles + backgrounds ----------------
const WORLDS = {
  1: { name: 'Home & Garden', sky: ['#6fbde9', '#bfe5fa', '#e6f6ff'], grass: '#57ad44', grass2: '#8fd46a', soil: '#8b5a35', soil2: '#6e4429', soil3: '#a8754a', water: 'rgba(80,175,225,.55)', waterTop: '#d8f2ff', music: 'w1', edge: '#3d7d2f' },
  2: { name: 'Canal Towpath', sky: ['#5f93c8', '#f0c491', '#fbe2bc'], grass: '#c9b07a', grass2: '#e2d0a0', soil: '#9c4630', soil2: '#7a3322', soil3: '#b85a40', water: 'rgba(48,110,104,.72)', waterTop: '#9fd3c8', music: 'w2', edge: '#8a7448', brick: true },
  3: { name: 'Lakeside & Newfoundland', sky: ['#6db6e8', '#bfe2f6', '#eaf6fc'], grass: '#5aa848', grass2: '#8fd06a', soil: '#7a6a52', soil2: '#5e5040', soil3: '#958468', water: 'rgba(60,135,190,.6)', waterTop: '#cfeaf8', music: 'w3', edge: '#3a7a2e' },
  4: { name: 'Shooting Field', sky: ['#8ab8dc', '#e8dcc0', '#f6ecd6'], grass: '#c9a54a', grass2: '#ead07c', soil: '#7a5030', soil2: '#5e3a22', soil3: '#946440', water: 'rgba(70,130,150,.62)', waterTop: '#cfe6ea', music: 'w4', edge: '#8a6a24' },
  5: { name: 'Championship Show', sky: ['#7cc6f5', '#c8ebff', '#f0faff'], grass: '#62b34a', grass2: '#9ad870', soil: '#7b5232', soil2: '#5e3e24', soil3: '#94653e', water: 'rgba(80,175,225,.55)', waterTop: '#d8f2ff', music: 'w5', edge: '#3d7d2f' },
  6: { name: 'Christmas Special', sky: ['#0f1c3e', '#2a3a72', '#5a5a96'], grass: '#f4f8ff', grass2: '#ffffff', soil: '#5a4030', soil2: '#46301f', soil3: '#6e5038', water: 'rgba(150,200,235,.6)', waterTop: '#eef8ff', music: 'xmas', edge: '#a9bcd8', snow: true },
  7: { name: 'Lakeside & Newfoundland', sky: ['#78b4dc', '#cfe4ee', '#eef6f8'], grass: '#8a6a44', grass2: '#b8925e', soil: '#6f7378', soil2: '#55595e', soil3: '#8a8e93', water: 'rgba(36,86,128,.72)', waterTop: '#bcdcee', music: 'w3', edge: '#4e3820' }
};
const BG_W = 1800, BG_H = 760;
function makeCanvas(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function soilPattern(ctx, W, scale) {
  const S = 96, cv = makeCanvas(S * scale, S * scale), c = cv.getContext('2d'); c.scale(scale, scale);
  c.fillStyle = W.soil; c.fillRect(0, 0, S, S);
  if (W.brick) {
    c.strokeStyle = 'rgba(240,200,170,.28)'; c.lineWidth = 2;
    for (let y = 0; y < S; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(S, y); c.stroke(); const off = (y / 16) % 2 ? 24 : 0; for (let x = off; x < S; x += 48) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 16); c.stroke(); } }
    c.fillStyle = 'rgba(60,20,10,.18)'; for (let y = 0; y < S; y += 16) { const off = (y / 16) % 2 ? 24 : 0; for (let x = off; x < S; x += 48) if (((x * 7 + y * 3) % 5) === 0) c.fillRect(x + 2, y + 2, 44, 12); }
  } else {
    const r = mkRng(7);
    for (let i = 0; i < 16; i++) { const x = r() * S, y = r() * S, rx = 4 + r() * 9, ry = 3 + r() * 5; for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { ell(c, x + ox, y + oy, rx, ry, r()); c.fillStyle = i % 3 ? W.soil2 : W.soil3; c.fill(); } }
    for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(r() * S, r() * S, 2, 2); }
  }
  return ctx.createPattern(cv, 'repeat');
}
function buildLayers(world, scale) {
  const layers = [];
  let li = 0; const OFFS = [-70, -112, -200];
  const mk = (f, fy, draw) => { const cv = makeCanvas(Math.ceil(BG_W * scale), Math.ceil(BG_H * scale)); const c = cv.getContext('2d'); c.scale(scale, scale); c.lineJoin = 'round'; draw(c); layers.push({ cv, f, fy, off: OFFS[li++] }); };
  const wrapX = (x, w, fn) => { fn(x); if (x - w < 0) fn(x + BG_W); if (x + w > BG_W) fn(x - BG_W); };
  const R = mkRng(world * 101);
  const ridge = (c, base, amp, col, seed, freqs) => {
    c.beginPath(); c.moveTo(0, BG_H);
    for (let x = 0; x <= BG_W; x += 12) { let y = base; freqs.forEach((f, i) => { y += Math.sin(x / BG_W * TAU * f + seed * (i + 1)) * amp / (i + 1); }); c.lineTo(x, y); }
    c.lineTo(BG_W, BG_H); c.closePath(); c.fillStyle = col; c.fill();
  };
  if (world === 1) {
    mk(0.1, 0.12, c => {
      ridge(c, 300, 34, '#a9d6a0', 1.3, [2, 5, 9]);
      for (let i = 0; i < 40; i++) { const x = R() * BG_W, y = 300 + Math.sin(x / BG_W * TAU * 2 + 1.3) * 34 + Math.sin(x / BG_W * TAU * 5 + 2.6) * 17 + 8; wrapX(x, 14, xx => { circ(c, xx, y - 6, 7 + R() * 5); c.fillStyle = '#86bf7c'; c.fill(); }); }
      ridge(c, 352, 26, '#92c788', 4.1, [3, 7, 11]);
      c.strokeStyle = 'rgba(60,110,50,.5)'; c.lineWidth = 3;
      for (let k = 0; k < 3; k++) { c.beginPath(); for (let x = 0; x <= BG_W; x += 16) { const y = 372 + k * 26 + Math.sin(x / BG_W * TAU * 3 + k) * 10; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
      // church
      wrapX(1700, 40, x => { c.fillStyle = '#c9c2ae'; c.fillRect(x, 300, 26, 50); c.beginPath(); c.moveTo(x - 2, 300); c.lineTo(x + 13, 250); c.lineTo(x + 28, 300); c.fill(); c.fillRect(x + 26, 318, 40, 32); });
    });
    mk(0.3, 0.25, c => {
      ridge(c, 470, 6, '#6fae5c', 0.2, [4]);
      let x = 20;
      while (x < BG_W - 40) {
        const w = 150 + R() * 50, h = 110 + R() * 30, base = 440, brick = ['#b5573d', '#a94f38', '#c06446'][Math.floor(R() * 3)];
        c.fillStyle = brick; c.fillRect(x, base - h, w, h);
        c.fillStyle = '#5f6470'; c.beginPath(); c.moveTo(x - 10, base - h); c.lineTo(x + w / 2, base - h - 50); c.lineTo(x + w + 10, base - h); c.closePath(); c.fill();
        c.fillStyle = '#7a3a28'; c.fillRect(x + w * 0.7, base - h - 50, 14, 32);
        for (let wy = base - h + 18; wy < base - 30; wy += 44) for (let wx = x + 16; wx < x + w - 30; wx += 44) { c.fillStyle = '#f6f0e0'; c.fillRect(wx, wy, 26, 24); c.fillStyle = '#9fc7e0'; c.fillRect(wx + 3, wy + 3, 20, 18); c.fillStyle = '#f6f0e0'; c.fillRect(wx + 12, wy + 3, 2, 18); }
        x += w + 20 + R() * 40;
        if (R() < 0.6) { const tx = x - 10; for (const [ox, oy, rr2] of [[0, -40, 30], [-18, -20, 22], [18, -24, 24]]) { circ(c, tx + ox, base - 60 + oy, rr2); c.fillStyle = '#5a9e4a'; c.fill(); } c.fillStyle = '#6b4a2a'; c.fillRect(tx - 5, base - 60, 10, 60); }
      }
      c.fillStyle = '#5f9e4f'; c.fillRect(0, 438, BG_W, BG_H);
    });
    mk(0.55, 0.42, c => {
      for (let x = 0; x < BG_W; x += 120) {
        c.fillStyle = '#a3713f'; c.fillRect(x, 470, 116, 140); c.strokeStyle = '#7a5230'; c.lineWidth = 2;
        for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(x + 6 + i * 14.5, 470); c.lineTo(x + 6 + i * 14.5, 610); c.stroke(); }
        c.fillStyle = '#7a5230'; c.fillRect(x + 114, 460, 8, 160);
        c.fillStyle = '#8a5a30'; c.fillRect(x, 488, 116, 6); c.fillRect(x, 570, 116, 6);
      }
      for (let i = 0; i < 26; i++) { const x = R() * BG_W; wrapX(x, 40, xx => { for (let k = 0; k < 4; k++) { circ(c, xx + k * 14 - 20, 474 - R() * 10, 12 + R() * 6); c.fillStyle = k % 2 ? '#4f9a40' : '#5fae4c'; c.fill(); } }); }
      c.fillStyle = '#4a8a3a'; c.fillRect(0, 600, BG_W, BG_H);
    });
  } else if (world === 2) {
    mk(0.1, 0.12, c => {
      ridge(c, 360, 14, '#d8a897', 2.2, [3, 8]);
      let x = 0;
      while (x < BG_W) { const w = 90 + R() * 120, h = 50 + R() * 70; c.fillStyle = '#c79a8c'; c.fillRect(x, 380 - h, w, h + 400);
        if (R() < 0.5) { c.beginPath(); for (let k = 0; k < Math.floor(w / 30); k++) { c.moveTo(x + k * 30, 380 - h); c.lineTo(x + k * 30 + 30, 380 - h - 18); c.lineTo(x + k * 30 + 30, 380 - h); } c.fill(); }
        if (R() < 0.45) { c.fillRect(x + w * 0.5, 380 - h - 120 - R() * 40, 14, 140); }
        x += w + R() * 30; }
      c.fillStyle = '#c79a8c'; c.fillRect(0, 378, BG_W, BG_H);
    });
    mk(0.3, 0.25, c => {
      let x = 10;
      while (x < BG_W - 60) {
        const w = 200 + R() * 120, h = 140 + R() * 80, base = 450;
        c.fillStyle = ['#a3533c', '#954a35', '#b05c42'][Math.floor(R() * 3)]; c.fillRect(x, base - h, w, h + 400);
        c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x, base - h, w, 10);
        for (let wy = base - h + 26; wy < base - 30; wy += 46) for (let wx = x + 18; wx < x + w - 30; wx += 40) { c.fillStyle = '#5b2c22'; c.beginPath(); c.moveTo(wx, wy + 30); c.lineTo(wx, wy + 10); c.arc(wx + 11, wy + 10, 11, Math.PI, 0); c.lineTo(wx + 22, wy + 30); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,220,150,.25)'; c.fillRect(wx + 3, wy + 14, 7, 14); }
        if (R() < 0.4) { c.fillStyle = '#efe2c4'; c.font = '700 16px Fredoka, sans-serif'; c.fillText(['MILL', 'WHARF', 'BREWERY', 'WORKS'][Math.floor(R() * 4)], x + 20, base - h + 18); }
        x += w + 10 + R() * 50;
      }
      c.fillStyle = '#6b3a2c'; c.fillRect(0, 446, BG_W, BG_H);
    });
    mk(0.55, 0.42, c => {
      for (let i = 0; i < 40; i++) { const x = R() * BG_W, h = 60 + R() * 100; wrapX(x, 60, xx => { c.fillStyle = '#5a3a24'; c.fillRect(xx - 5, 520 - h * 0.4, 10, h); for (let k = 0; k < 5; k++) { circ(c, xx + (R() - 0.5) * 60, 520 - h * 0.6 - R() * 50, 18 + R() * 18); c.fillStyle = k % 2 ? '#4a7340' : '#5a8a48'; c.fill(); } }); }
      c.fillStyle = '#4a7340'; c.fillRect(0, 520, BG_W, BG_H);
      c.strokeStyle = '#2a2a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 528); c.lineTo(BG_W, 528); c.moveTo(0, 552); c.lineTo(BG_W, 552); c.stroke();
      for (let x = 0; x < BG_W; x += 30) { c.beginPath(); c.moveTo(x, 520); c.lineTo(x, 570); c.stroke(); }
    });
  } else if (world === 5) {
    mk(0.1, 0.12, c => {
      ridge(c, 360, 16, '#a6d49a', 0.7, [3, 7]);
      for (let i = 0; i < 70; i++) { const x = R() * BG_W; wrapX(x, 20, xx => { circ(c, xx, 362 - R() * 16, 10 + R() * 10); c.fillStyle = '#8cc380'; c.fill(); }); }
      for (let x = 60; x < BG_W; x += 220 + R() * 160) { const w = 90 + R() * 60; c.fillStyle = '#f4f4ee'; c.beginPath(); c.moveTo(x, 380); c.lineTo(x + w * 0.15, 348); c.lineTo(x + w * 0.5, 330); c.lineTo(x + w * 0.85, 348); c.lineTo(x + w, 380); c.closePath(); c.fill(); c.fillStyle = '#ccc'; c.fillRect(x + w * 0.5 - 1, 312, 2, 20); c.fillStyle = R() < 0.5 ? NAVY2 : GOLD; c.fillRect(x + w * 0.5 + 1, 312, 12, 8); }
      c.fillStyle = '#92c788'; c.fillRect(0, 378, BG_W, BG_H);
    });
    mk(0.3, 0.25, c => {
      let x = 0;
      while (x < BG_W - 80) {
        const w = 260 + R() * 120, h = 110, base = 430;
        c.fillStyle = '#fbfbf7'; c.fillRect(x, base - h * 0.55, w, h * 0.55 + 300);
        for (let sx = x + 10; sx < x + w - 10; sx += 36) { c.fillStyle = 'rgba(29,51,102,.85)'; c.fillRect(sx, base - h * 0.55, 18, h * 0.55); }
        c.fillStyle = '#fbfbf7'; c.beginPath(); c.moveTo(x - 8, base - h * 0.55); c.quadraticCurveTo(x + w * 0.25, base - h * 0.75, x + w * 0.5, base - h - 16); c.quadraticCurveTo(x + w * 0.75, base - h * 0.75, x + w + 8, base - h * 0.55); c.closePath(); c.fill();
        c.strokeStyle = '#c9ced8'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#bbb'; c.fillRect(x + w * 0.5 - 1.5, base - h - 44, 3, 30); c.fillStyle = R() < 0.5 ? NAVY2 : GOLD; c.beginPath(); c.moveTo(x + w * 0.5 + 1, base - h - 44); c.lineTo(x + w * 0.5 + 24, base - h - 38); c.lineTo(x + w * 0.5 + 1, base - h - 32); c.fill();
        c.fillStyle = '#1d3366'; c.fillRect(x + w * 0.5 - 30, base - h * 0.55 + 6, 60, 20); c.fillStyle = GOLD2; c.font = '600 12px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText(['Ring 1', 'Ring 2', 'Benching', 'Refreshments', 'Secretary'][Math.floor(R() * 5)], x + w * 0.5, base - h * 0.55 + 20);
        x += w + 40 + R() * 60;
      }
      c.fillStyle = '#6fae5c'; c.fillRect(0, 430, BG_W, BG_H);
      const cols = ['#c8362c', '#2a6ad0', '#7ac25a', '#f2cf6b', '#b06ad6', '#666', '#e88a4a', '#fff'];
      for (let i = 0; i < 160; i++) { const xx = (i / 160) * BG_W + R() * 8, y = 452 + (i % 3) * 7; c.fillStyle = cols[Math.floor(R() * 8)]; rr(c, xx - 6, y - 10, 12, 20, 5); c.fill(); c.fillStyle = ['#f1c9a5', '#c99a72', '#8a5a3a', '#f6d8bc'][i % 4]; circ(c, xx, y - 15, 5); c.fill(); }
    });
    mk(0.55, 0.42, c => {
      c.fillStyle = '#fff'; for (let x = 0; x < BG_W; x += 60) c.fillRect(x, 500, 5, 60); c.fillRect(0, 504, BG_W, 6); c.fillRect(0, 526, BG_W, 6);
      for (let x = 30; x < BG_W; x += 300) { c.strokeStyle = '#ddd'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 470); c.quadraticCurveTo(x + 150, 500, x + 300, 470); c.stroke(); for (let i = 1; i < 14; i++) { const tt = i / 14, xx = x + 300 * tt, y = 470 + Math.sin(tt * Math.PI) * 26; c.beginPath(); c.moveTo(xx - 7, y); c.lineTo(xx + 7, y); c.lineTo(xx, y + 14); c.closePath(); c.fillStyle = i % 2 ? GOLD : NAVY2; c.fill(); } c.fillStyle = '#e8e2d0'; c.fillRect(x - 3, 460, 6, 140); }
      c.fillStyle = '#5fa64c'; c.fillRect(0, 556, BG_W, BG_H);
    });
  } else extraLayers(world, mk, R, ridge, wrapX);
  return layers;
}
function drawSky(c, W, VW, VH, t, world) {
  const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, W.sky[0]); g.addColorStop(0.6, W.sky[1]); g.addColorStop(1, W.sky[2]);
  c.fillStyle = g; c.fillRect(0, 0, VW, VH);
  if (world === 6) { c.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { c.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.02 + i)); c.fillRect((i * 173) % VW, (i * 97) % (VH * 0.6), 2, 2); } c.globalAlpha = 1;
    circ(c, VW * 0.8, VH * 0.17, 30); c.fillStyle = '#fbf3d0'; c.fill(); circ(c, VW * 0.8 + 12, VH * 0.17 - 6, 27); c.fillStyle = W.sky[0]; c.fill(); return; }
  const sx = world === 2 ? VW * 0.72 : VW * 0.82, sy = world === 2 ? VH * 0.5 : VH * 0.16, sr = world === 2 ? 56 : 40;
  const sg = c.createRadialGradient(sx, sy, sr * 0.3, sx, sy, sr * 3.2); sg.addColorStop(0, world === 2 ? 'rgba(255,220,150,.9)' : 'rgba(255,255,230,.9)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = sg; c.fillRect(sx - sr * 3.2, sy - sr * 3.2, sr * 6.4, sr * 6.4);
  circ(c, sx, sy, sr); c.fillStyle = world === 2 ? '#ffe2a0' : '#fffbe6'; c.fill();
}
function drawClouds(c, camX, VW, t, world) {
  if (world === 6) return;
  const n = 7; c.fillStyle = world === 2 ? 'rgba(255,240,225,.85)' : 'rgba(255,255,255,.92)';
  for (let i = 0; i < n; i++) {
    const span = VW + 400, x = ((i * 433 + t * 0.15 - camX * 0.05) % span + span) % span - 200, y = 40 + (i * 71) % 130, s = 0.7 + (i % 3) * 0.25;
    for (const [ox, oy, r] of [[0, 0, 26], [26, -10, 30], [54, 0, 24], [28, 8, 24]]) { circ(c, x + ox * s, y + oy * s, r * s); c.fill(); }
  }
}
