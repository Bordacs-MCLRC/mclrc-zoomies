// ===================== extra mechanics: retrieve, whistle, agility, chase, tunnel, ice, currents, presents =====================
function levelExtras(L) {
  L.ice = []; L.currents = []; L.dummies = []; L.handlers = []; L.whistles = []; L.hurdles = [];
  L.agility = null; L.chase = null; L.tunnel = null; L.presents = [];
  L.retrieve = (dx, hx, kind = 'dummy', idx = null, inWater = false) => {
    const w = inWater ? L.water.find(w => dx > w.x0 && dx < w.x1) : null;
    const d = { x: dx, y: w ? w.top - 2 : L.g(dx) - 7, ox: dx, oy: 0, kind, idx, state: 'wait', vy: 0 }; d.oy = d.y;
    const h = { x: hx, y: L.g(hx), kind: kind === 'float' ? 'fisher' : 'handler', dummy: d, face: dx < hx ? -1 : 1 };
    L.dummies.push(d); L.handlers.push(h); return d;
  };
  L.whistle = x => { L.whistles.push({ x, state: 'idle', t: 0 }); L.handlers.push({ x: x + 150, y: L.g(x + 150), kind: 'handler', whistle: true, face: -1 }); };
  L.hurdle = x => L.hurdles.push({ x, y: L.g(x), state: 'up' });
  L.present = (x, y, col) => L.presents.push({ x, y, col: col || ['#c8362c', '#2a6ad0', '#3a9a4a', '#b06ad6', '#e8882a'][L.presents.length % 5], got: false });
}
function updExtras(G, L, P) {
  // retrieves
  for (const d of L.dummies) {
    if (d.state === 'done') continue;
    if (d.state === 'carried') continue;
    const w = L.waterAt(d.x, d.y + 4);
    if (w) { d.vy = 0; d.y = lerp(d.y, w.top - 2 + Math.sin(G.t * 0.05 + d.x) * 2, 0.2); }
    else {
      d.vy += 0.4; d.y += d.vy; let gy = L.g(d.x) - 7;
      for (const p of L.plats) if (d.x > p.x && d.x < p.x + p.w && d.y - d.vy <= p.y - 6 && d.y >= p.y - 7) gy = Math.min(gy, p.y - 7);
      if (d.y >= gy) { d.y = gy; d.vy = 0; }
    }
    if (!P.carrying && !P.done && P.hurtT <= 0 && Math.hypot(P.x + P.face * 20 - d.x, P.y - 20 - d.y) < 46) {
      P.carrying = d; d.state = 'carried'; Sound.play('biscuit');
      G.popup(P.x, P.y - 90, d.kind === 'float' ? 'Bring the net float to the fisherman!' : 'Gently! Bring it to the handler', GOLD2, 120);
    }
  }
  if (P.carrying) {
    const d = P.carrying, h = L.handlers.find(h => h.dummy === d);
    if (h && Math.abs(P.x - h.x) < 60 && Math.abs(P.y - h.y) < 80) {
      d.state = 'done'; P.carrying = null; Sound.play('pippip'); Sound.play('bark');
      G.popup(h.x, h.y - 130, d.kind === 'float' ? 'Just like the St John’s water dogs!' : 'Good dog! Delivered to hand', GOLD2, 140, 24);
      if (d.idx != null) G.collectRosette({ x: h.x, y: h.y - 100, idx: d.idx, got: false });
      else { P.biscuits += 10; G.score += 300; }
      for (let i = 0; i < 12; i++) G.fx('spark', h.x + 20, h.y - 60, {});
    }
  }
  // whistle stops
  for (const w of L.whistles) {
    if (w.state === 'done') continue;
    if (w.state === 'idle') { if (P.x > w.x && !P.done && !P.swim) { w.state = 'blow'; w.t = 0; Sound.play('whistle'); G.popup(P.x + 60, P.y - 100, 'Peep! Stop and sit!', GOLD2, 100, 28); G.whistleHold = true; } }
    else if (w.state === 'blow') {
      w.t++;
      if (P.ground && Math.abs(P.gsp) < 0.7 && !P.swim) { w.state = 'sit'; w.t = 0; P.sitting = true; P.lock = 999; P.gsp = 0; }
      else if (w.t > 170) { w.state = 'done'; G.whistleHold = false; G.popup(P.x, P.y - 90, 'Missed the stop. Keep going!', '#fff'); }
    } else if (w.state === 'sit') {
      w.t++; P.gsp = 0;
      if (w.t === 70) Sound.play('pippip');
      if (w.t > 80) { w.state = 'done'; P.sitting = false; P.lock = 0; G.whistleHold = false; P.biscuits += 10; P.meter = Math.min(100, P.meter + 40); G.score += 200; G.popup(P.x, P.y - 90, 'Good stop! +10 biscuits', GOLD2); }
    }
  }
  // agility course
  const A = L.agility;
  if (A) {
    if (A.state === 'idle' && P.x > A.x0) { A.state = 'run'; A.t0 = G.time; A.faults = 0; Sound.play('judge'); G.popup(P.x + 80, P.y - 110, 'Agility course!\nJump every hurdle', GOLD2, 140, 26); }
    for (const h of L.hurdles) {
      if (h.state !== 'up' || P.x < h.x) continue;
      if (P.ground && P.y > h.y - 30) { h.state = 'knocked'; Sound.play('pole'); P.gsp *= 0.5; if (A.state === 'run') A.faults += 4; G.popup(h.x, h.y - 70, 'Pole down!', '#fff'); }
      else { h.state = 'clear'; G.popup(h.x, h.y - 80, 'Clear!', GOLD2, 50, 18); }
    }
    if (A.state === 'run' && P.x > A.x1) {
      A.state = 'done'; const secs = ((G.time - A.t0) / 60).toFixed(1);
      if (A.faults === 0) { G.popup(P.x, P.y - 110, 'Clear round! ' + secs + 's  +20 biscuits', GOLD2, 160, 26); P.biscuits += 20; G.score += 500; Sound.play('rosette'); for (let i = 0; i < 30; i++) G.fx('confetti', P.x + (Math.random() - 0.5) * 300, P.y - 250, {}); }
      else G.popup(P.x, P.y - 110, A.faults + ' faults in ' + secs + 's', '#fff', 140, 24);
    }
  }
  // mower chase
  const C = L.chase;
  if (C) {
    if (C.state === 'idle' && P.x > C.x0) { C.state = 'run'; C.mx = P.x - 560; C.my = L.g(C.mx); C.t = 0; Sound.play('squawk'); G.popup(P.x + 100, P.y - 120, 'Run! The Robo-Mower\nis after you!', '#fff', 150, 28); }
    if (C.state === 'run') {
      C.t++; const d = P.x - C.mx, ps = Math.abs(P.ground ? P.gsp : P.vx);
      let v = Game.easy ? 3.4 : 5.0; if (d > 640) v = Math.max(v, ps + 0.8); if (P.loop || P.swim || P.done) v = Math.min(v, 1.5);
      C.mx += v; C.my = L.g(C.mx); if (C.t % 18 === 0) Sound.play('engine');
      if (!P.loop && P.inv <= 0 && Math.abs(P.x - C.mx) < 56 && Math.abs(P.y - C.my) < 70) P.hurt(C.mx - 200);
      if (C.t % 5 === 0 && !G.reduced) G.fx('grass', C.mx + 50, C.my - 4, { vx: 2 });
      if (C.mx >= C.x1) { C.state = 'sink'; C.t = 0; Sound.play('splash'); for (let i = 0; i < 16; i++) G.fx('splash', C.x1 + 40 + Math.random() * 80, C.wtop || C.my, {}); G.popup(C.x1 + 80, C.my - 120, 'Splash! The mower\nhad a bath', GOLD2, 140, 24); }
    }
    if (C.state === 'sink') { C.t++; C.mx += 1.5; C.my += 2.4; if (C.t > 50) C.state = 'done'; }
  }
  // presents
  for (const pr of L.presents) if (!pr.got && Math.hypot(P.x - pr.x, P.y - 22 - pr.y) < 46) { pr.got = true; G.presentsGot = (G.presentsGot || 0) + 1; Sound.play('present'); G.score += 200; G.popup(pr.x, pr.y - 30, G.presentsGot + ' of ' + L.presents.length, GOLD2, 60, 20); for (let i = 0; i < 8; i++) G.fx('spark', pr.x, pr.y, {}); }
}
function drawExtrasBack(c, G, L) {
  const T = L.tunnel;
  if (T) {
    c.fillStyle = '#2c1712'; c.fillRect(T.x0, T.top - 250, T.x1 - T.x0, 600);
    c.strokeStyle = 'rgba(120,60,40,.35)'; c.lineWidth = 1.2;
    for (let y = T.top - 250; y < T.top + 300; y += 16) { c.beginPath(); c.moveTo(T.x0, y); c.lineTo(T.x1, y); c.stroke(); }
  }
}
function drawExtrasMid(c, G, L, t) {
  const vis = x => x > G.cam.x - 200 && x < G.cam.x + G.VW + 200;
  for (const z of L.ice) {
    const x0 = Math.max(z.x0, G.cam.x - 40), x1 = Math.min(z.x1, G.cam.x + G.VW + 40); if (x1 <= x0) continue;
    const y = L.g(x0); c.fillStyle = 'rgba(200,235,255,.85)'; c.fillRect(x0, y - 3, x1 - x0, 14);
    c.fillStyle = 'rgba(255,255,255,.9)'; for (let x = Math.ceil(x0 / 90) * 90; x < x1; x += 90) { c.save(); c.translate(x, y + 2); c.rotate(-0.4); c.fillRect(0, 0, 22, 2); c.restore(); }
  }
  const T = L.tunnel;
  if (T) {
    c.fillStyle = '#5a2a1c'; c.fillRect(T.x0, T.top - 290, T.x1 - T.x0, 60);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(T.x0, T.top - 232, T.x1 - T.x0, 8);
    drawTunnelPortal(c, T.x0, T.gy, T.top, t); drawTunnelPortal(c, T.x1, T.gy, T.top, t);
  }
  for (const h of L.hurdles) if (vis(h.x)) { c.save(); c.translate(h.x, h.y); drawHurdleObj(c, h, t); c.restore(); }
  for (const h of L.handlers) if (vis(h.x)) {
    c.save(); c.translate(h.x, h.y); c.scale(h.face, 1);
    const near = G.P.carrying && G.P.carrying === h.dummy && Math.abs(G.P.x - h.x) < 260;
    drawPerson(c, t, { kind: h.kind, reach: near, whistle: h.whistle }); c.restore();
    if (h.dummy && h.dummy.state !== 'done' && Math.abs(G.P.x - h.x) < 700 && !G.P.carrying) { c.save(); c.font = '700 16px Fredoka, sans-serif'; c.textAlign = 'center'; rr(c, h.x - 34, h.y - 128, 68, 26, 10); c.fillStyle = '#fff'; c.fill(); c.fillStyle = NAVY; c.fillText(h.kind === 'fisher' ? 'Fetch it!' : 'Fetch!', h.x, h.y - 110); c.restore(); }
  }
  for (const d of L.dummies) if (d.state !== 'carried' && d.state !== 'done' && vis(d.x)) { c.save(); c.translate(d.x, d.y); drawDummy(c, d.kind, t); c.restore(); }
  for (const pr of L.presents) if (!pr.got && vis(pr.x)) { c.save(); c.translate(pr.x, pr.y); drawPresent(c, t + pr.x, pr.col); c.restore(); }
  const C = L.chase;
  if (C && C.state !== 'idle') { c.save(); c.translate(C.mx, C.my); c.scale(0.72, 0.72); if (C.state === 'done') { c.globalAlpha = 0.9; } drawMower(c, G.t, 1, { moving: C.state === 'run' }); c.save(); c.translate(-74, -124); drawMagpie(c, G.t, { perch: true }); c.restore(); c.restore();
    if (C.state === 'done' && G.t % 20 < 10) { circ(c, C.mx + 10, C.my - 70 - (G.t % 20) * 2, 4); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; c.stroke(); } }
}
function drawCarry(c, P, t) {
  if (!P.carrying) return;
  c.save(); c.translate(P.x, P.y); c.rotate(P.ang); c.scale(P.face, 1); c.translate(45, -45); c.rotate(0.15); c.scale(0.85, 0.85); drawDummy(c, P.carrying.kind, t); c.restore();
}
function drawCarryArrow(c, G, L) {
  const P = G.P; if (!P.carrying) return;
  const h = L.handlers.find(h => h.dummy === P.carrying); if (!h || Math.abs(h.x - P.x) < 200) return;
  const d = sign(h.x - P.x); c.save(); c.translate(P.x + d * 10, P.y - 100 + Math.sin(G.t * 0.15) * 4);
  c.beginPath(); c.moveTo(d * 18, 0); c.lineTo(-d * 6, -12); c.lineTo(-d * 6, 12); c.closePath(); fillStroke(c, GOLD2, NAVY, 2.5); c.restore();
}
function drawCurrents(c, G, L) {
  for (const cu of L.currents) {
    const w = L.water.find(w => cu.x0 >= w.x0 - 1 && cu.x1 <= w.x1 + 1); if (!w) continue;
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const span = cu.x1 - cu.x0, x = cu.x0 + (((i * 157) + G.t * cu.vx * 1.5) % span + span) % span, y = w.top + 18 + (i * 23) % 90;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + sign(cu.vx) * 16, y); c.lineTo(x + sign(cu.vx) * 10, y - 4); c.stroke();
    }
  }
}
function drawDarkness(c, G, L) {
  const T = L.tunnel, P = G.P; if (!T) return;
  const inside = Math.min(P.x - T.x0, T.x1 - P.x);
  if (inside <= -40) return;
  const a = clamp((inside + 40) / 160, 0, 1) * 0.78;
  const px = P.x - G.cam.x, py = P.y - 30 - G.cam.y;
  const g = c.createRadialGradient(px, py, 50, px, py, 280);
  g.addColorStop(0, 'rgba(6,8,20,0)'); g.addColorStop(1, `rgba(6,8,20,${a})`);
  c.fillStyle = g; c.fillRect(0, 0, G.VW, G.VH);
}
