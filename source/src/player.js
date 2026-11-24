// ===================== player: Labrador physics =====================
const PH = { ACC: 0.12, DEC: 0.5, FRIC: 0.14, TOP: 7.5, MAX: 15, SLOPE: 0.24, GRAV: 0.45, JUMP: 11.4, JUMPCUT: -5,
  AIRACC: 0.24, MAXFALL: 15, ZTOP: 11, ZACC: 0.4, HW: 18, H: 42 };

class Player {
  constructor(L, x) {
    this.L = L; this.reset(x);
    this.biscuits = 0; this.meter = 0;
  }
  reset(x, y) {
    this.x = x; this.y = y == null ? this.L.g(x) : y; this.vx = 0; this.vy = 0; this.gsp = 0; this.ground = true; this.plat = null;
    this.ang = 0; this.face = 1; this.swim = false; this.loop = null; this.hurtT = 0; this.inv = 0; this.zoomT = 0;
    this.ph = 0; this.t = 0; this.sniffT = 0; this.lock = 0; this.jumping = false; this.skid = 0; this.pose = 'idle';
    this.done = false; this.springT = 0; this.blink = 0; this.trail = []; this.trotting = false; this.tail = 0; this.prevY = this.y;
  }
  get cx() { return this.x; }
  get cy() { return this.y - 22; }
  box() { return { x: this.x - 20, y: this.y - 42, w: 40, h: 40 }; }

  update(inp) {
    const P = this, L = P.L; P.t++;
    if (P.inv > 0) P.inv--; if (P.lock > 0) P.lock--; if (P.zoomT > 0) P.zoomT--; if (P.hurtT > 0) P.hurtT--;
    if (P.skid > 0) P.skid--; if (P.springT > 0) P.springT--;
    let dir = 0;
    if (P.lock <= 0 && !P.done) {
      if (inp.left) dir -= 1; if (inp.right) dir += 1;
      if (Game.easy && !inp.left && !L.boss) dir = 1;
      if (Game.easy && Game.whistleHold) dir = 0;
    }
    if (P.done) dir = 0;
    P.dir = dir;
    const zoom = P.zoomT > 0;
    const autoRun = Game.easy && !L.boss;
    let top = zoom ? (autoRun ? 8 : PH.ZTOP) : (autoRun ? 4.8 : Game.easy ? 6 : PH.TOP);
    if (Game.ringActive) top = Game.easy ? 4.2 : Math.min(top, 7.5);
    const acc = zoom ? PH.ZACC : PH.ACC;
    if (!P.done && P.meter >= 100 && !zoom && (inp.zoomP || autoRun)) {
      P.zoomT = 260; P.meter = 0; Sound.play('zoom'); Sound.play('bark'); Game.popup(P.x, P.y - 70, 'Zoomies!', '#f2cf6b');
      if (P.ground && P.gsp * P.face < 9) P.gsp = 9 * P.face;
      Game.shake(4);
    }
    P.prevY = P.y; const ox = P.x;
    if (P.loop) { P.updLoop(); }
    else {
      const w = L.waterAt(P.x, P.y - 20);
      if (w) P.updSwim(inp, dir, w);
      else { if (P.swim) { P.swim = false; } if (P.ground) P.updGround(inp, dir, top, acc, ox); else P.updAir(inp, dir, top); }
    }
    // sniff
    const canSniff = P.ground && !P.loop && Math.abs(P.gsp) < 1.2 && inp.down && !P.done;
    P.sniffT = canSniff ? P.sniffT + 1 : 0;
    // trail during zoomies
    if (zoom && P.t % 3 === 0) { P.trail.push({ x: P.x, y: P.y, ang: P.ang, face: P.face, ph: P.ph, pose: P.pose, life: 14 }); }
    for (const tr of P.trail) tr.life--; P.trail = P.trail.filter(tr => tr.life > 0);
    // fall out of world
    if (P.y > L.t.maxY + 500) Game.oops(true);
    P.anim();
  }

  anim() {
    const P = this; const sp = P.ground ? Math.abs(P.gsp) : Math.hypot(P.vx, P.vy);
    let pose = 'idle';
    if (P.loop) pose = 'run';
    else if (P.swim) pose = 'swim';
    else if (P.hurtT > 0 && !P.ground) pose = 'hurt';
    else if (!P.ground) pose = P.springT > 0 ? 'spring' : P.vy < 0 ? 'jump' : 'fall';
    else if (P.done || P.sitting) pose = Math.abs(P.gsp) > 0.5 ? 'run' : 'sit';
    else if (P.skid > 0 && Math.abs(P.gsp) > 2) pose = 'skid';
    else if (Math.abs(P.gsp) > 0.25) pose = (Game.ringActive && Math.abs(P.gsp) < 6) ? 'trot' : 'run';
    else if (P.sniffT > 0) pose = 'sniff';
    P.pose = pose;
    if (pose === 'run' || pose === 'trot') P.ph += Math.max(0.13, sp * 0.042);
    else if (pose === 'swim') P.ph += 0.16;
    else P.ph += 0.05;
    P.tail += (pose === 'idle' || pose === 'sit' || pose === 'sniff') ? 0.25 : 0.12;
    if (P.blink > 0) P.blink--; else if (Math.random() < 0.006) P.blink = 8;
  }

  updGround(inp, dir, top, acc, ox) {
    const P = this, L = P.L, T = L.t;
    if (P.plat) return P.updPlat(inp, dir, top, acc);
    const a = T.angle(P.x); P.ang = a;
    const idleOnGentle = dir === 0 && Math.abs(P.gsp) < 0.5 && Math.abs(a) < 0.45;
    if (!idleOnGentle) P.gsp += PH.SLOPE * Math.sin(a);
    P.applyInput(dir, top, acc);
    if (inp.jumpP && P.lock <= 0 && !P.done) { P.doJump(a); return; }
    P.moveGround(ox);
    // dust when fast
    if (Math.abs(P.gsp) > 8.5 && P.t % 4 === 0 && !Game.reduced) Game.fx('dust', P.x - P.face * 20, P.y - 3, { vx: -P.gsp * 0.1 });
  }
  applyInput(dir, top, acc) {
    const P = this;
    const ice = !P.plat && P.L.ice.length && P.L.ice.some(z => P.x > z.x0 && P.x < z.x1);
    if (ice) acc *= 0.4;
    if (dir !== 0) {
      if (sign(P.gsp) === -dir && Math.abs(P.gsp) > 0.4) {
        P.gsp += (ice ? 0.12 : PH.DEC) * dir;
        if (Math.abs(P.gsp) > 4 && P.skid <= 0) { P.skid = 10; Sound.play('skid'); }
        if (P.t % 3 === 0) Game.fx('dust', P.x + P.face * 16, P.y - 2, {});
      } else if (Math.abs(P.gsp) < top) { P.gsp += acc * dir; if (Math.abs(P.gsp) > top) P.gsp = top * dir; }
      if (P.skid <= 0 || sign(P.gsp) === dir) P.face = dir;
    } else {
      const f = ice ? 0.02 : PH.FRIC; if (Math.abs(P.gsp) <= f) P.gsp = 0; else P.gsp -= f * sign(P.gsp);
      if (ice && Math.abs(P.gsp) > 2 && P.t % 6 === 0) Game.fx('spark', P.x, P.y - 2, { vx: 0, vy: -0.5 });
    }
    if (Game.easy && !this.L.boss && Math.abs(P.gsp) > top) P.gsp -= 0.07 * sign(P.gsp);
    P.gsp = clamp(P.gsp, -PH.MAX, PH.MAX);
  }
  moveGround(ox) {
    const P = this, L = P.L, T = L.t;
    let remain = Math.abs(P.gsp); const d = sign(P.gsp); let a = T.angle(P.x);
    const startX = P.x;
    while (remain > 0.0001) {
      const s = Math.min(4, remain); remain -= s;
      const nx = P.x + d * s * Math.cos(a);
      const sx = nx + d * PH.HW; const pc = T.at(P.x), ps = T.at(sx);
      if (ps !== pc) {
        const bx = d > 0 ? ps.x0 : pc.x0; const wy = ps.y(bx);
        if (wy < P.y - 10) { P.x = bx - d * (PH.HW + 0.5); P.gsp = 0; P.y = T.y(P.x); P.ang = T.angle(P.x); return; }
      }
      if (nx < 30) { P.x = 30; P.gsp = 0; return; }
      if (nx > L.maxX) { P.x = L.maxX; P.gsp = 0; return; }
      const ny = T.y(nx), ey = P.y + (nx - P.x) * Math.tan(a), na = T.angle(nx);
      if (ny - ey > 6 + s * 0.5) { P.launch(a); P.x = nx; P.y = ey; return; }
      const conv = (na - a) * d;
      if (conv > 0 && P.gsp * P.gsp * conv / s > 3.0 * PH.GRAV * Math.max(0.25, Math.cos(a))) { P.x = nx; P.y = ny; P.launch(a); return; }
      P.x = nx; P.y = ny; a = na;
    }
    P.ang = a;
    // loops
    if (P.gsp >= 6) for (const l of L.loops) {
      if (startX < l.x && P.x >= l.x && Math.abs(P.y - l.gy) < 8) { P.loop = { l, t: 0 }; P.x = l.x; P.y = l.gy; Sound.play('dash'); break; }
    }
  }
  updPlat(inp, dir, top, acc) {
    const P = this, p = P.plat; P.ang = 0;
    P.applyInput(dir, top, acc);
    if (inp.jumpP && P.lock <= 0 && !P.done) { P.x += p.dx; P.doJump(0); P.vx += p.dx; P.vy += Math.min(0, p.dy); return; }
    P.x += P.gsp + p.dx; P.y = p.y;
    if (P.x < p.x - 4 || P.x > p.x + p.w + 4) { P.plat = null; P.ground = false; P.vx = P.gsp + p.dx; P.vy = Math.max(0, p.dy); }
    if (P.x < 30) { P.x = 30; P.gsp = 0; }
  }
  launch(a) { const P = this; P.ground = false; P.plat = null; P.vx = P.gsp * Math.cos(a); P.vy = P.gsp * Math.sin(a); P.jumping = false; }
  doJump(a) {
    const P = this; P.ground = false; P.plat = null;
    P.vx = P.gsp * Math.cos(a) + PH.JUMP * Math.sin(a);
    P.vy = P.gsp * Math.sin(a) - PH.JUMP * Math.cos(a);
    P.jumping = true; Sound.play('jump');
    if (!Game.reduced) for (let i = 0; i < 4; i++) Game.fx('dust', P.x + (i - 1.5) * 8, P.y - 2, {});
  }
  land(a, y) {
    const P = this; P.ground = true; P.y = y; P.ang = a; P.plat = null;
    P.gsp = P.vx * Math.cos(a) + P.vy * Math.sin(a);
    if (P.vy > 7 && !Game.reduced) for (let i = 0; i < 5; i++) Game.fx('dust', P.x + (i - 2) * 9, y - 2, {});
    P.vy = 0; P.jumping = false; P.springT = 0;
  }
  updAir(inp, dir, top) {
    const P = this, L = P.L, T = L.t;
    if (inp.jumpP && !P.done && P.vy > -6 && L.waterAt(P.x, P.y + 16)) { P.vy = -11.2; P.jumping = true; Sound.play('jump'); }
    if (P.jumping && !inp.jump && P.vy < PH.JUMPCUT) P.vy = PH.JUMPCUT;
    P.vy = Math.min(PH.MAXFALL, P.vy + PH.GRAV);
    if (dir !== 0) {
      const before = Math.abs(P.vx);
      if (sign(P.vx) !== dir || before < top) { P.vx += PH.AIRACC * dir; if (sign(P.vx) === dir && Math.abs(P.vx) > top && before <= top) P.vx = top * dir; }
      P.face = dir;
    } else if (P.vy < 0 && P.vy > -4) P.vx *= 0.985;
    P.ang *= 0.85;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(P.vx), Math.abs(P.vy)) / 5));
    for (let i = 0; i < steps; i++) {
      const oy = P.y;
      P.x += P.vx / steps; P.y += P.vy / steps;
      if (P.vx !== 0) {
        const d = sign(P.vx), sx = P.x + d * PH.HW, pc = T.at(P.x), ps = T.at(sx);
        if (ps !== pc) { const bx = d > 0 ? ps.x0 : pc.x0; if (ps.y(bx) < P.y - 8) { P.x = bx - d * (PH.HW + 0.5); P.vx = 0; } }
      }
      if (P.x < 30) { P.x = 30; P.vx = 0; }
      if (P.x > L.maxX) { P.x = L.maxX; P.vx = 0; }
      if (P.vy >= 0) {
        let hit = null;
        for (const p of L.plats) {
          if (P.x >= p.x - 6 && P.x <= p.x + p.w + 6 && oy <= p.py + 2 && P.y >= p.y) { if (!hit || p.y < hit.y) hit = p; }
        }
        if (hit) {
          P.y = hit.y; P.ground = true; P.plat = hit; P.gsp = P.vx - hit.dx; P.vy = 0; P.jumping = false; P.springT = 0; P.ang = 0;
          if (hit.kind === 'bale' || hit.kind === 'boat') Game.fx('dust', P.x, P.y - 2, {});
          return;
        }
      }
      const gy = T.y(P.x);
      if (P.y >= gy) { P.land(T.angle(P.x), gy); return; }
    }
  }
  updSwim(inp, dir, w) {
    const P = this, L = P.L, T = L.t;
    if (!P.swim) {
      P.swim = true; P.ground = false; P.plat = null; P.jumping = false;
      if (P.vy > 1.5) { Sound.play('splash'); for (let i = 0; i < 10; i++) Game.fx('splash', P.x + (Math.random() - 0.5) * 40, w.top, {}); }
      P.vy *= 0.35; P.vx *= 0.7;
    }
    const surf = w.top + 26;
    const maxs = P.zoomT > 0 ? 7 : (Game.easy ? 3.6 : 4.4);
    if (dir) { P.vx += 0.2 * dir; P.face = dir; } else P.vx *= 0.95;
    P.vx = clamp(P.vx, -maxs, maxs);
    if (inp.down) { P.vy = Math.min(3.2, P.vy + 0.22); }
    else { const off = P.y - surf; P.vy += clamp(-off * 0.02, -0.45, 0.45); P.vy *= 0.92; P.vy = Math.max(P.vy, -4.5); }
    const nearSurf = P.y < surf + 16;
    if (inp.jumpP && !P.done) {
      if (nearSurf) { P.vy = -11.2; P.jumping = true; Sound.play('jump'); Sound.play('splash'); for (let i = 0; i < 8; i++) Game.fx('splash', P.x + (Math.random() - 0.5) * 30, w.top, {}); }
      else { P.vy -= 3.4; Sound.play('plip'); }
    }
    if (P.lock > 0) { P.vx *= 0.9; }
    let drift = 0; for (const cu of L.currents) if (P.x > cu.x0 && P.x < cu.x1) drift += cu.vx * (Game.easy ? 0.6 : 1);
    P.x += P.vx + drift; P.y += P.vy;
    if (P.vx !== 0) {
      const d = sign(P.vx), sx = P.x + d * PH.HW, pc = T.at(P.x), ps = T.at(sx);
      if (ps !== pc) { const bx = d > 0 ? ps.x0 : pc.x0; if (ps.y(bx) < P.y - 8) { P.x = bx - d * (PH.HW + 0.5); P.vx = 0; } }
    }
    const gy = T.y(P.x); if (P.y > gy) { P.y = gy; if (P.vy > 0) P.vy = 0; }
    // swimming on top of platforms isn't possible; boats are landed on from the air
    P.ang = lerp(P.ang, clamp(P.vy * 0.05, -0.35, 0.35) * P.face, 0.15);
    if (Math.abs(P.vx) > 1 && P.t % 7 === 0 && P.y < surf + 8 && !Game.reduced) Game.fx('ripple', P.x - P.face * 26, w.top + 2, {});
  }
  updLoop() {
    const P = this, l = P.loop.l; const sp = Math.max(7.5, Math.abs(P.gsp));
    P.loop.t += sp / (TAU * l.r);
    if (P.loop.t >= 1) { P.x = l.x + 1; P.y = l.gy; P.loop = null; P.ground = true; P.ang = 0; P.gsp = sp; return; }
    const th = Math.PI / 2 - TAU * P.loop.t;
    P.x = l.x + l.r * Math.cos(th); P.y = l.cy + l.r * Math.sin(th);
    P.ang = Math.atan2(-Math.cos(th), Math.sin(th)); P.face = 1;
  }
  bounce(strong) {
    const P = this; P.ground = false; P.plat = null; P.vy = (strong || Input.cur.jump) ? -11 : -8; P.jumping = false;
  }
  spring(s) {
    const P = this; P.ground = false; P.plat = null; P.loop = null; P.jumping = false; P.springT = 30;
    if (s.kind === 'up' || s.kind === 'castle') { P.vy = -s.power; P.vx *= 0.6; }
    else { const d = s.kind === 'left' ? -1 : 1; P.vy = -s.power * 0.78; P.vx = d * s.power * 0.78; P.face = d; P.lock = 14; }
    P.y = Math.min(P.y, s.y - 8);
    Sound.play('spring');
  }
  hurt(srcX) {
    const P = this; if (P.inv > 0 || P.zoomT > 0 || P.done) return false;
    if (P.carrying) { const d = P.carrying; d.state = 'dropped'; d.vy = -4; d.x = P.x + P.face * 30; d.y = P.y - 40; P.carrying = null; Game.popup(P.x, P.y - 80, 'Dropped it! Pick it up again', '#fff'); }
    if (P.sitting) return false;
    if (!Game.gentle) {
      if (P.biscuits > 0) {
        const lose = Math.ceil(P.biscuits / 2); P.biscuits -= lose;
        Game.scatter(P.x, P.y - 24, Math.min(lose, 12));
      } else { Game.oops(); return true; }
    }
    P.ground = false; P.plat = null; P.loop = null; P.vy = -6.5; P.vx = (P.x < srcX ? -1 : 1) * 4.5; P.gsp = 0;
    P.lock = 36; P.inv = 120; P.hurtT = 40; P.jumping = false; Sound.play('hurt'); Game.shake(5);
    return true;
  }
}
