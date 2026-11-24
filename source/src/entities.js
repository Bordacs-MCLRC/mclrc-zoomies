// ===================== enemies, projectiles, bosses =====================
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function enemyBox(e) {
  switch (e.type) {
    case 'hoover': return { x: e.x - 24, y: e.y - 26, w: 48, h: 24 };
    case 'goose': return { x: e.x - 18, y: e.y - 50, w: 36, h: 48 };
    case 'squirrel': return { x: e.x - 14, y: e.y - 40, w: 28, h: 40 };
    case 'nettles': return { x: e.x - e.w / 2 + 4, y: e.y - 20, w: e.w - 8, h: 20 };
    case 'swan': return { x: e.x - 26, y: e.y - 34, w: 52, h: 34 };
    case 'dryer': return { x: e.x - 20, y: e.y - 24, w: 40, h: 28 };
    case 'crab': return { x: e.x - 22, y: e.y - 26, w: 44, h: 24 };
    case 'gull': case 'drone': return { x: e.x - 20, y: e.y - 16, w: 40, h: 22 };
    case 'pheasant': return { x: e.x - 20, y: e.y - 40, w: 40, h: 38 };
    case 'brambles': return { x: e.x - e.w / 2 + 4, y: e.y - 22, w: e.w - 8, h: 22 };
    case 'roboduck': return { x: e.x - 24, y: e.y - 40, w: 48, h: 40 };
    case 'snowbot': return { x: e.x - 16, y: e.y - 60, w: 32, h: 58 };
  }
  return { x: e.x - 16, y: e.y - 32, w: 32, h: 32 };
}
function updEnemies(G, L, P) {
  for (const e of L.enemies) {
    e.t++;
    if (!e.alive) {
      if (e.flee) { e.x += e.vx; e.y += e.vy; e.vy -= 0.05; e.life--; }
      continue;
    }
    if (Math.abs(e.x - G.cam.x - G.VW / 2) > G.VW * 1.6 && e.type !== 'squirrel') continue;
    switch (e.type) {
      case 'hoover': {
        e.x += (e.speed || 1.4) * e.dir;
        if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; }
        e.y = L.g(e.x); break;
      }
      case 'goose': {
        const near = Math.abs(P.x - e.x) < 280 && Math.abs(P.y - e.y) < 140;
        if (near && !e.wasNear) Sound.play('honk');
        e.wasNear = near; e.honk = near && (e.t % 50) < 18;
        if (near && e.t % 50 === 0) Sound.play('honk');
        const sp = near ? 1.9 : 0.7; if (near) e.dir = P.x < e.x ? -1 : 1;
        e.x += sp * e.dir;
        if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; }
        e.y = L.g(e.x); break;
      }
      case 'squirrel': {
        e.dir = P.x < e.x ? -1 : 1;
        if (e.throwT > 0) e.throwT--;
        const dx = P.x - e.x;
        if (Math.abs(dx) < 560 && Math.abs(P.y - e.y) < 420) {
          e.cool = (e.cool == null ? 60 : e.cool) - 1;
          if (e.cool <= 0) {
            e.cool = 120; e.throwT = 16;
            const T = 54, tx = P.x + (P.ground ? P.gsp : P.vx) * 30, ty = P.y - 16, g = 0.3;
            const vx = (tx - e.x) / T, vy = (ty - (e.y - 20) - 0.5 * g * T * T) / T;
            L.projectiles.push({ kind: 'acorn', x: e.x + 12 * e.dir, y: e.y - 20, vx: clamp(vx, -9, 9), vy: clamp(vy, -12, 4), g, life: 240, r: 0 });
          }
        }
        break;
      }
      case 'swan': {
        e.x += 0.9 * e.dir; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; }
        e.y = e.wy + 6 + Math.sin(e.t * 0.05) * 1.5; break;
      }
      case 'dryer': {
        e.x += 1.5 * e.dir; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; }
        e.y = e.by + Math.sin(e.t * 0.05) * 22; break;
      }
      case 'nettles': case 'brambles': break;
      case 'crab': { e.x += 1.1 * e.dir; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; } e.y = L.g(e.x); break; }
      case 'gull': case 'drone': {
        e.x += (e.type === 'gull' ? 2 : 1.4) * e.dir; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; }
        e.y = e.by + Math.sin(e.t * 0.04) * (e.type === 'gull' ? 30 : 18); break;
      }
      case 'roboduck': { e.x += 0.9 * e.dir; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; } e.y = e.wy + 6 + Math.sin(e.t * 0.06) * 1.5; break; }
      case 'pheasant': {
        const d = P.x - e.x; e.walking = true;
        if (Math.abs(d) < 170 && Math.abs(P.y - e.y) < 120) { // flush!
          e.alive = false; e.flee = true; e.fly = true; e.vx = (d > 0 ? -1 : 1) * 2.5 + (P.ground ? P.gsp * 0.3 : 0); e.vy = -4.5; e.life = 120;
          Sound.play('squawk'); G.score += 50; G.popup(e.x, e.y - 60, 'Flushed! +50', '#fff', 60, 18); continue;
        }
        e.x += 0.5 * e.dir; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; } e.y = L.g(e.x); continue;
      }
      case 'snowbot': {
        e.dir = P.x < e.x ? -1 : 1; if (e.throwT > 0) e.throwT--;
        if (Math.abs(P.x - e.x) < 520 && Math.abs(P.y - e.y) < 300) {
          e.cool = (e.cool == null ? 50 : e.cool) - 1;
          if (e.cool <= 0) { e.cool = 130; e.throwT = 16; const T = 50, tx = P.x + (P.ground ? P.gsp : P.vx) * 24, ty = P.y - 16, g = 0.3;
            L.projectiles.push({ kind: 'snowball', x: e.x + 20 * e.dir, y: e.y - 40, vx: clamp((tx - e.x) / T, -8, 8), vy: clamp((ty - (e.y - 40) - 0.5 * g * T * T) / T, -11, 3), g, life: 220, r: 0 }); }
        }
        break;
      }
    }
    const b = enemyBox(e), pb = P.box();
    if (!P.done && overlap(pb, b)) {
      if (e.type === 'nettles' || e.type === 'brambles') { if (P.zoomT > 0) continue; P.hurt(e.x); continue; }
      const stomp = !P.ground && P.vy > 0 && P.prevY <= b.y + b.h * 0.65;
      if (P.zoomT > 0 || stomp) { defeatEnemy(G, e); if (stomp) P.bounce(); }
      else P.hurt(e.x);
    }
  }
}
function defeatEnemy(G, e) {
  e.alive = false; G.score += 100; G.popup(e.x, e.y - 50, '+100', '#fff');
  switch (e.type) {
    case 'hoover': case 'dryer': case 'drone': case 'roboduck': case 'snowbot':
      Sound.play('break'); Sound.play('bounce');
      for (let i = 0; i < 9; i++) G.fx('bolt', e.x, e.y - 14, { vx: (Math.random() - 0.5) * 7, vy: -2 - Math.random() * 5 });
      G.fx('spark', e.x, e.y - 14, {}); break;
    case 'goose': case 'swan':
      Sound.play('honk'); Sound.play('bounce'); e.flee = true; e.vx = (Math.random() < 0.5 ? -1 : 1) * 3; e.vy = -3.5; e.life = 120;
      for (let i = 0; i < 6; i++) G.fx('feather', e.x, e.y - 30, { vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 }); break;
    case 'squirrel':
      Sound.play('bounce'); e.flee = true; e.vx = 0; e.vy = -4; e.life = 80; break;
    case 'crab': Sound.play('bounce'); e.flee = true; e.vx = (Math.random() < 0.5 ? -1 : 1) * 3; e.vy = -3; e.life = 80; break;
    case 'gull': Sound.play('squawk'); Sound.play('bounce'); e.flee = true; e.vx = 3; e.vy = -3; e.life = 100; for (let i = 0; i < 5; i++) G.fx('feather', e.x, e.y, { vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 }); break;
  }
}
function drawEnemy(c, e, t) {
  if (!e.alive && !(e.flee && e.life > 0)) return;
  c.save(); c.translate(e.x, e.y);
  if (!e.alive) { c.globalAlpha = clamp(e.life / 60, 0, 1); }
  switch (e.type) {
    case 'hoover': drawHoover(c, e.t, e.dir); break;
    case 'goose': drawGoose(c, e.t, e.flee ? sign(e.vx) : e.dir, { walking: true, honk: e.honk, flee: e.flee }); break;
    case 'squirrel': drawSquirrel(c, e.t, e.dir, { throwing: e.throwT > 0 }); break;
    case 'nettles': drawNettles(c, e.w, t); break;
    case 'swan': drawSwan(c, e.t, e.flee ? sign(e.vx) : e.dir); break;
    case 'dryer': drawDryer(c, e.t, e.dir); break;
    case 'crab': drawCrab(c, e.t, e.dir); break;
    case 'gull': drawGull(c, e.t, e.flee ? 1 : e.dir); break;
    case 'drone': drawDrone(c, e.t, e.dir); break;
    case 'roboduck': drawRoboDuck(c, e.t, e.dir); break;
    case 'pheasant': drawPheasant(c, e.t, e.flee ? sign(e.vx) : e.dir, { walking: e.alive, fly: e.fly }); break;
    case 'brambles': drawBrambles(c, e.w, t); break;
    case 'snowbot': drawSnowbot(c, e.t, e.dir, { throwing: e.throwT > 0 }); break;
  }
  c.restore();
}
function updProjectiles(G, L, P) {
  for (const p of L.projectiles) {
    p.life--; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += 0.2;
    const gy = L.g(p.x);
    if (p.y > gy - 4) {
      if (p.kind === 'clay' || p.kind === 'snowball') { p.life = 0; for (let i = 0; i < 6; i++) G.fx(p.kind === 'clay' ? 'bolt' : 'dust', p.x, gy - 6, { vx: (Math.random() - 0.5) * 5, vy: -2 - Math.random() * 3 }); if (p.kind === 'clay') Sound.play('pole'); continue; }
      if (!p.bounced) { p.bounced = true; p.y = gy - 4; p.vy *= -0.4; p.vx *= 0.6; if (p.kind === 'can') Sound.play('can'); }
      else { p.life = Math.min(p.life, 20); p.y = gy - 4; p.vy = 0; p.vx *= 0.8; }
    }
    if (L.waterAt(p.x, p.y)) { p.vy *= 0.8; p.vx *= 0.9; p.life = Math.min(p.life, 30); }
    const pb = P.box();
    if (p.life > 20 && overlap(pb, { x: p.x - 8, y: p.y - 8, w: 16, h: 16 })) {
      if (P.zoomT > 0) { p.life = 0; G.fx('spark', p.x, p.y, {}); }
      else if (P.inv <= 0) { P.hurt(p.x); p.life = 0; }
    }
  }
  L.projectiles = L.projectiles.filter(p => p.life > 0);
}
function drawProjectile(c, p) {
  c.save(); c.translate(p.x, p.y); if (p.life < 20) c.globalAlpha = p.life / 20;
  if (p.kind === 'acorn') drawAcorn(c, p.r); else if (p.kind === 'clay') drawClay(c, p.r); else if (p.kind === 'snowball') drawSnowball(c); else drawTinCan(c, p.r);
  c.restore();
}

// ---------------- bosses ----------------
function makeBoss(L) {
  const a = L.boss;
  const B = { type: a.type, hp: a.hp, max: a.hp, t: 0, inv: 0, state: 'wait', st: 0, face: -1, x0: a.x0, x1: a.x1, floor: L.g((a.x0 + a.x1) / 2), dead: false, name: a.name };
  if (B.type === 'mower' || B.type === 'speedboat' || B.type === 'claytrap') {
    B.vehicle = true; B.lo = a.x0 + 140; B.hi = a.x1 - 140; B.speed = B.type === 'speedboat' ? 3 : B.type === 'claytrap' ? 1.3 : 2.2;
    if (B.type === 'speedboat') { const w = L.water[0]; B.floor = w.top + 6; B.lo = w.x0 + 72; B.hi = w.x1 - 72; }
    B.x = B.hi - 20; B.y = B.floor; B.vy = 0; B.target = B.lo; B.cool = 90;
  }
  else { B.x = (a.x0 + a.x1) / 2; B.y = B.floor - 300; B.vx = 0; B.vy = 0; B.dives = 0; }
  return B;
}
function bossBox(B) {
  if (B.type === 'mower') return { x: B.x - 62, y: B.y - 70, w: 124, h: 70 };
  if (B.type === 'speedboat') return { x: B.x - 60, y: B.y - 34, w: 120, h: 34 };
  if (B.type === 'claytrap') return { x: B.x - 58, y: B.y - 68, w: 116, h: 68 };
  if (B.state === 'perch') return { x: B.x - 32, y: B.y - 26, w: 64, h: 44 };
  return { x: B.x - 22, y: B.y - 18, w: 44, h: 34 };
}
function updBoss(G, L, P) {
  const B = G.boss; if (!B) return;
  B.t++; B.st++; if (B.inv > 0) B.inv--;
  const pb = P.box(), bb = bossBox(B);
  if (B.dead) { B.st++; if (!B.vehicle) { B.y -= 3; B.x += 4; } return; }
  if (B.vehicle) {
    if (B.state === 'wait') { if (B.st > 70) { B.state = 'drive'; B.st = 0; } }
    else if (B.state === 'drive') {
      const d = sign(B.target - B.x); B.face = d;
      B.x += d * B.speed;
      if (B.hp <= 2 && B.st % 110 === 60 && B.y >= B.floor) { B.vy = -9; Sound.play('spring'); }
      if (Math.abs(B.target - B.x) < B.speed + 1) { B.state = 'turn'; B.st = 0; }
      if (B.t % 6 === 0 && !G.reduced) G.fx(B.type === 'speedboat' ? 'splash' : 'grass', B.x - B.face * 55, B.floor - 4, { vx: -B.face * 2 });
    } else if (B.state === 'turn') {
      if (B.st > (B.type === 'claytrap' ? 70 : B.type === 'speedboat' ? 95 : 50)) { B.target = B.target < (B.lo + B.hi) / 2 ? B.hi : B.lo; B.state = 'drive'; B.st = 0; }
    }
    if (B.type === 'claytrap') {
      if (B.throwT > 0) B.throwT--;
      B.cool--; if (B.cool <= 0 && !P.done) { B.cool = B.hp <= 2 ? 70 : 100; B.throwT = 20; Sound.play('fire'); const T = 58, g = 0.25, tx = P.x + (P.ground ? P.gsp : P.vx) * 20, ty = P.y - 20;
        L.projectiles.push({ kind: 'clay', x: B.x + 20 * B.face, y: B.y - 80, vx: clamp((tx - B.x) / T, -9, 9), vy: clamp((ty - (B.y - 80) - 0.5 * g * T * T) / T, -13, 2), g, life: 300, r: 0 }); }
    }
    B.vy += 0.45; B.y += B.vy; if (B.y > B.floor) { if (B.vy > 4) G.shake(6); B.y = B.floor; B.vy = 0; }
    if (!P.done && overlap(pb, bb)) {
      const stomp = !P.ground && P.vy > 0 && P.prevY <= bb.y + 22;
      if ((stomp || P.zoomT > 0) && B.inv <= 0) {
        B.hp--; B.inv = 70; Sound.play('bosshit'); Sound.play('squawk'); G.shake(7);
        P.ground = false; P.vy = -10.5; P.vx = (P.x < B.x ? -1 : 1) * 6; P.jumping = false; P.inv = Math.max(P.inv, 40);
        B.speed += B.type === 'claytrap' ? 0.35 : 0.7;
        for (let i = 0; i < 6; i++) G.fx('bolt', B.x, B.y - 60, { vx: (Math.random() - 0.5) * 8, vy: -3 - Math.random() * 4 });
        if (B.hp <= 0) bossDefeated(G, B);
      } else if (!stomp && B.inv <= 0) P.hurt(B.x);
      else if (stomp) { P.bounce(); }
    }
  } else {
    // magpie (canal and show)
    const L2 = L, boat = L2.boss.boat ? L2.plats.find(p => p.kind === 'boat') : null;
    const cx = (B.x0 + B.x1) / 2, hw = (B.x1 - B.x0) / 2 - 120;
    const fast = 1 + (B.max - B.hp) * 0.12;
    if (B.state === 'wait') { B.x = cx + Math.cos(B.t * 0.02) * hw; B.y = B.floor - 330 + Math.sin(B.t * 0.05) * 20; if (B.st > 80) { B.state = 'fly'; B.st = 0; } }
    else if (B.state === 'fly') {
      const tx = cx + Math.cos(B.t * 0.018 * fast) * hw, ty = B.floor - 320 + Math.sin(B.t * 0.036 * fast) * 40;
      B.face = sign(tx - B.x) || B.face; B.x = lerp(B.x, tx, 0.05); B.y = lerp(B.y, ty, 0.05);
      if (B.type === 'boatpie' && B.st % Math.round(80 / fast) === 40) { L.projectiles.push({ kind: 'can', x: B.x, y: B.y + 10, vx: (Math.random() - 0.5) * 2, vy: 0, g: 0.25, life: 300, r: 0 }); Sound.play('squawk'); }
      const flyTime = B.type === 'boatpie' ? 260 : 150;
      if (B.st > flyTime) {
        if (B.type === 'boatpie') { B.state = 'swoop'; B.st = 0; }
        else if (B.dives >= (B.hp > 2 ? 1 : 2)) { B.state = 'toNest'; B.st = 0; B.dives = 0; }
        else { B.state = 'aim'; B.st = 0; B.tx = P.x; B.ty = P.y - 18; }
      }
    } else if (B.state === 'aim') {
      B.y = lerp(B.y, B.floor - 330, 0.05); B.face = sign(P.x - B.x) || B.face;
      if (B.st < 30) { B.tx = P.x; B.ty = P.y - 18; }
      if (B.st === 1) Sound.play('squawk');
      if (B.st > 44) { B.state = 'dive'; B.st = 0; B.sx = B.x; B.sy = B.y; }
    } else if (B.state === 'dive') {
      const k = Math.min(1, B.st / (34 / fast)); B.x = lerp(B.sx, B.tx, k); B.y = lerp(B.sy, B.ty, k * k);
      if (k >= 1) { B.state = 'fly'; B.st = 90; B.dives++; G.fx('dust', B.x, B.floor - 2, {}); }
      if (!P.done && overlap(pb, bb) && P.inv <= 0) P.hurt(B.x);
    } else if (B.state === 'swoop') {
      const k = Math.min(1, B.st / 60);
      if (boat) { const tx = boat.x + boat.w / 2, ty = boat.y - 24; B.face = sign(tx - B.x) || B.face; B.x = lerp(B.x, tx, 0.08 + k * 0.3); B.y = lerp(B.y, ty, 0.08 + k * 0.3); if (k >= 1) { B.state = 'perch'; B.st = 0; Sound.play('squawk'); } }
    } else if (B.state === 'toNest') {
      const tx = L.boss.nest.x, ty = L.boss.nest.y - 24; B.face = sign(tx - B.x) || B.face; B.x = lerp(B.x, tx, 0.06); B.y = lerp(B.y, ty, 0.06);
      if (Math.hypot(tx - B.x, ty - B.y) < 6) { B.state = 'perch'; B.st = 0; Sound.play('squawk'); }
    } else if (B.state === 'perch') {
      if (boat) { B.x = boat.x + boat.w / 2; B.y = boat.y - 24; }
      if (B.st % 50 === 0) Sound.play('squawk');
      const dur = B.type === 'boatpie' ? 220 : 200;
      if (B.st > dur) { B.state = 'fly'; B.st = 0; }
      if (!P.done && overlap(pb, bb)) {
        const stomp = !P.ground && P.vy > -1 && P.prevY <= bb.y + bb.h * 0.7;
        if ((stomp || P.zoomT > 0) && B.inv <= 0) {
          B.hp--; B.inv = 60; Sound.play('bosshit'); Sound.play('squawk'); G.shake(6);
          P.bounce(true); P.vx = (P.x < B.x ? -1 : 1) * 3;
          for (let i = 0; i < 8; i++) G.fx('feather', B.x, B.y, { vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 4 });
          G.popup(B.x, B.y - 40, ['Squawk!', 'Got you!', 'Tag!', 'Caught!'][B.hp % 4], GOLD2);
          B.state = 'fly'; B.st = 0;
          if (B.hp <= 0) bossDefeated(G, B);
        }
      }
    } else if (B.state === 'hurt') { B.state = 'fly'; }
  }
}
function bossDefeated(G, B) {
  B.dead = true; B.st = 0; Sound.play('clear'); G.shake(10); G.score += 1000;
  const L = G.L;
  if (B.vehicle) {
    for (let i = 0; i < 24; i++) G.fx('bolt', B.x, B.y - 40, { vx: (Math.random() - 0.5) * 10, vy: -4 - Math.random() * 6 });
    for (let i = 0; i < 10; i++) G.fx('dust', B.x + (Math.random() - 0.5) * 100, B.y - 20, {});
  }
  G.goal = { kind: L.boss.prize || 'rosette', x: clamp(B.x, B.x0 + 120, B.x1 - 120), y: B.y - 40, vy: -6, landed: false, t: 0 };
  G.popup(B.x, B.y - 90, L.boss.prize === 'trophy' ? 'The trophy!' : 'It dropped the rosettes!', GOLD2);
}
function drawBoss(c, G) {
  const B = G.boss; if (!B) return;
  if (B.vehicle) {
    const draw = (o) => B.type === 'speedboat' ? drawSpeedboat(c, B.t, B.face, o) : B.type === 'claytrap' ? drawClayTrap(c, B.t, B.face, Object.assign({ throwT: B.throwT }, o)) : drawMower(c, B.t, B.face, o);
    const mp = B.type === 'speedboat' ? [22 * B.face, -64] : B.type === 'claytrap' ? [-6 * B.face, -100] : [-74 * B.face, -124];
    if (B.dead) {
      if (B.st > 50) { c.save(); c.translate(B.x + mp[0] + (B.st - 50) * 5, B.y + mp[1] - 30 - (B.st - 50) * 3); drawMagpie(c, B.t, { holding: false }); c.restore(); return; }
      c.save(); c.translate(B.x, B.y); c.globalAlpha = 1 - B.st / 50; draw({}); c.restore(); return;
    }
    c.save(); c.translate(B.x, B.y);
    if (B.inv > 0 && Math.floor(B.inv / 4) % 2) c.globalAlpha = 0.55;
    draw({ moving: B.state === 'drive', flash: B.inv > 60 });
    c.restore();
    c.save(); c.translate(B.x + mp[0], B.y + mp[1]); c.scale(B.face, 1); drawMagpie(c, B.t, { perch: true, holding: true }); c.restore();
    return;
  }
  if (B.dead && B.st > 160) return;
  // telegraph
  if (B.state === 'aim') {
    c.save(); c.globalAlpha = 0.25 + 0.25 * Math.sin(B.t * 0.5); ell(c, B.tx, G.L.g(B.tx) - 2, 30, 7); c.fillStyle = '#c8362c'; c.fill(); c.restore();
    c.save(); c.fillStyle = '#c8362c'; c.font = '700 30px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText('!', B.x, B.y - 30); c.restore();
  }
  c.save(); c.translate(B.x, B.y); c.scale(B.face, 1);
  if (B.inv > 0 && Math.floor(B.inv / 4) % 2) c.globalAlpha = 0.5;
  const s = 1.35; c.scale(s, s);
  drawMagpie(c, B.t, { perch: B.state === 'perch', holding: !B.dead });
  c.restore();
}
