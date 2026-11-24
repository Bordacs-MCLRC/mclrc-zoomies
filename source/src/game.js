// ===================== game: state, loop, camera, render, HUD =====================
const POSES = ['idle', 'run', 'trot', 'jump', 'fall', 'spring', 'skid', 'hurt', 'sniff', 'swim', 'sit'];
function loadGhost(id) { try { const g = JSON.parse(localStorage.getItem('zoomies-ghost-' + id) || 'null'); if (g && g.p && g.p.length) { g.n = Math.floor(g.p.length / 5); return g; } } catch (e) {} return null; }
function saveGhost(id, secs, rec) { try { localStorage.setItem('zoomies-ghost-' + id, JSON.stringify({ secs, p: rec })); } catch (e) {} }
const Game = {
  state: 'boot', VW: 960, VH: 540, scale: 1, offX: 0, offY: 0, cam: { x: 0, y: 0 }, lookX: 0, t: 0, time: 0,
  fxs: [], pops: [], loose: [], shakeT: 0, shakeA: 0, layers: null, layerKey: '', L: null, P: null, boss: null, goal: null,
  score: 0, stage: null, checkpoint: null, respawnT: 0, finishT: 0, ringActive: false, ring: null, attract: false,
  easy: false, gentle: false, reduced: false, slow: false, acc: 0, last: 0, paused: false, foundRun: [],

  init() {
    this.cv = $('#cv'); this.ctx = this.cv.getContext('2d');
    addEventListener('resize', () => this.resize()); this.resize();
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.state === 'play') UI.pause(); });
    requestAnimationFrame(ts => this.loop(ts));
  },
  applySettings() {
    const d = Save.data; this.easy = !!d.easy; this.gentle = !!d.gentle; this.reduced = !!d.reduced; this.slow = !!d.slow;
  },
  resize() {
    const w = Math.max(1, innerWidth), h = Math.max(1, innerHeight), dpr = Math.min(devicePixelRatio || 1, 2);
    this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
    const asp = w / h; this.VH = h < 500 ? 480 : 540; this.VW = clamp(Math.round(this.VH * asp), 720, 1280);
    const sx = this.cv.width / this.VW, sy = this.cv.height / this.VH; this.scale = Math.min(sx, sy);
    this.offX = (this.cv.width - this.VW * this.scale) / 2; this.offY = (this.cv.height - this.VH * this.scale) / 2;
    this.layerKey = '';
    // rebuild the painted backgrounds at the new size once resizing settles
    // (an embedded frame can start at 0x0 and only get its real size later)
    clearTimeout(this.relayT);
    this.relayT = setTimeout(() => { try { if (this.L) this.ensureLayers(this.L.world); } catch (e) {} }, 150);
  },
  ensureLayers(world) {
    const ls = clamp(this.scale || 1, 0.25, 1.5), ps = clamp(this.scale || 1, 0.25, 2);
    const key = world + '@' + ls.toFixed(2) + '/' + ps.toFixed(2);
    if (this.layerKey === key) return;
    this.layers = buildLayers(world, ls); this.layerKey = key;
    try { this.soilPat = soilPattern(this.ctx, WORLDS[world], ps); } catch (e) { this.soilPat = null; }
    try { this.soilPat.setTransform(new DOMMatrix().scale(1 / ps)); } catch (e) {}
  },
  // ---------------- stage lifecycle ----------------
  startStage(id, opts) {
    const st = STAGES.find(s => s.id === id); if (!st) return;
    this.trial = !!(opts && opts.trial); this.rec = []; this.ghost = this.trial ? loadGhost(id) : null;
    this.applySettings();
    this.stage = st; this.L = st.build(); this.L.def = st; this.P = new Player(this.L, this.L.startX);
    this.boss = null; this.goal = null; this.fxs = []; this.pops = []; this.loose = []; this.score = 0; this.time = 0; this.t = 0;
    this.checkpoint = { x: this.L.startX }; this.respawnT = 0; this.finishT = 0; this.ringActive = false; this.ring = null; this.foundRun = [];
    this.bossStarted = false; this.attract = false; this.whistleHold = false; this.presentsGot = 0;
    const s = Save.stage(id); this.foundBefore = (s.rosettes || [0, 0, 0]).slice();
    this.ensureLayers(this.L.world);
    this.cam.x = this.P.x - this.VW * 0.35; this.cam.y = this.P.y - this.VH * 0.66; this.lookX = 0; this.clampCam();
    Sound.music(st.boss ? 'boss' : WORLDS[this.L.world].music);
    this.state = 'play'; Input.clear(); UI.show(null); UI.syncTouch();
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    this.popup(this.P.x + 120, this.P.y - 120, st.name, GOLD2, 150, 34);
  },
  startAttract() {
    const b = new Builder(440); b.flat(60000); const L = new Level({ id: 'attract', world: 1 }, b.end(), b.water);
    L.world = 1; L.scatter(['flowers', 'bush', 'tree', 'sunflower', 'gnome', 'birdbath'], 3, [160, 360]); L.frontScatter(['tuft', 'daisy'], 4);
    for (let x = 400; x < 59000; x += 520) L.arc(x, 5, 160, 30, 40);
    this.L = L; this.P = new Player(L, 200); this.P.done = false; this.boss = null; this.goal = null; this.attract = true; this.fxs = []; this.pops = [];
    this.ensureLayers(1); this.cam.x = 0; this.cam.y = 440 - 540 * 0.66; this.stage = null;
  },
  checkpointRespawn() {
    const cp = this.checkpoint; const P = this.P;
    if (P.carrying) { const d = P.carrying; d.state = 'wait'; d.x = d.ox; d.y = d.oy; d.vy = 0; P.carrying = null; }
    P.sitting = false; this.whistleHold = false;
    P.reset(cp.x, cp.y); P.biscuits = 0; P.meter = 0; P.inv = 90; this.loose = [];
    this.lookX = 0;
  },
  oops(fell) {
    if (this.respawnT > 0 || this.P.done) return;
    this.respawnT = 70; Sound.play('oops'); this.popup(this.P.x, this.P.y - 70, 'Oops!', '#fff');
    this.P.lock = 999; this.P.vx = 0; this.P.gsp = 0;
  },
  finishAct() {
    const P = this.P; if (P.done) return; P.done = true; this.finishT = 1;
    Sound.play('clear'); setTimeout(() => Sound.play('bark'), 500);
    for (let i = 0; i < 40; i++) this.fx('confetti', P.x + (Math.random() - 0.5) * 200, P.y - 200 - Math.random() * 100, {});
    this.recordClear();
  },
  recordClear() {
    const st = this.stage, s = Save.stage(st.id);
    const secs = Math.floor(this.time / 60);
    const prevBest = s.best; s.done = true; if (!s.best || secs < s.best) s.best = secs;
    this.ghostBest = prevBest;
    const total = this.score + this.P.biscuits * 10 + Math.max(0, 240 - secs) * 10 + this.foundRun.length * 500;
    this.result = { secs, runScore: total, trial: this.trial, presents: this.L.presents.length ? (this.presentsGot || 0) + ' of ' + this.L.presents.length : null, biscuits: this.P.biscuits, found: (s.rosettes || []).filter(Boolean).length, total, newBest: !s.score || total > s.score, hasRosettes: !st.boss };
    if (!s.score || total > s.score) s.score = total;
    if (st.id === '5-B') Save.data.finished = true;
    if (!st.boss && (!prevBest || secs <= prevBest)) saveGhost(st.id, secs, this.rec);
    Save.store();
  },
  collectRosette(r) {
    r.got = true; Sound.play('rosette'); this.score += 500;
    const st = this.stage, s = Save.stage(st.id); s.rosettes = s.rosettes || [0, 0, 0]; s.rosettes[r.idx] = 1;
    const key = st.id + '-' + r.idx; const isNew = !Save.data.facts[key]; Save.data.facts[key] = 1; Save.store();
    this.foundRun.push(r.idx);
    for (let i = 0; i < 16; i++) this.fx('spark', r.x, r.y, { vx: Math.cos(i / 16 * TAU) * 4, vy: Math.sin(i / 16 * TAU) * 4 });
    this.popup(r.x, r.y - 40, isNew ? 'Gold Rosette! New Kennel Book page' : 'Gold Rosette!', GOLD2, 140);
  },
  scatter(x, y, n) {
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.32; this.loose.push({ x, y, vx: Math.cos(a) * 5 * (i % 2 ? 1 : 0.7), vy: Math.sin(a) * 6 - 2, life: 200, ph: Math.random() * 6 }); }
  },
  fx(kind, x, y, o) {
    if (this.reduced && (kind === 'dust' || kind === 'ripple') && Math.random() < 0.6) return;
    const p = Object.assign({ kind, x, y, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2, life: 30, max: 30, r: Math.random() * TAU, s: 1 }, o);
    switch (kind) {
      case 'dust': p.life = p.max = 26; p.vy = -0.4 - Math.random() * 0.6; p.vx += (Math.random() - 0.5); p.s = 4 + Math.random() * 4; break;
      case 'splash': p.vx = (Math.random() - 0.5) * 5; p.vy = -3 - Math.random() * 4; p.life = p.max = 36; break;
      case 'ripple': p.vx = 0; p.vy = 0; p.life = p.max = 40; break;
      case 'spark': p.life = p.max = 30; if (o.vx == null) { p.vx = (Math.random() - 0.5) * 5; p.vy = (Math.random() - 0.5) * 5; } break;
      case 'bolt': p.life = p.max = 60; break;
      case 'feather': p.life = p.max = 90; break;
      case 'confetti': p.life = p.max = 160; p.vx = (Math.random() - 0.5) * 3; p.vy = Math.random() * 2; p.col = [GOLD, NAVY2, '#e85a7a', '#fff', '#4aa3df'][Math.floor(Math.random() * 5)]; break;
      case 'grass': p.life = p.max = 30; p.vy = -2 - Math.random() * 2; break;
      case 'crumb': p.life = p.max = 24; break;
    }
    if (this.fxs.length < 400) this.fxs.push(p);
  },
  popup(x, y, text, col, life = 70, size = 22) { this.pops.push({ x, y, text, col: col || '#fff', life, max: life, size }); },
  shake(a) { if (this.reduced) return; this.shakeT = 14; this.shakeA = Math.max(this.shakeA, a); },
  // ---------------- main loop ----------------
  loop(ts) {
    requestAnimationFrame(t => this.loop(t));
    if (!this.last) this.last = ts;
    let dt = Math.min(0.1, (ts - this.last) / 1000); this.last = ts;
    if (this.manual) return;
    const spd = (this.state === 'play' && this.slow) ? 0.75 : 1;
    this.acc += dt * spd; let n = 0;
    while (this.acc >= 1 / 60 && n < 4) { this.tick(); this.acc -= 1 / 60; n++; }
    if (n >= 4) this.acc = 0;
    this.render();
  },
  tick() {
    Input.poll();
    if (this.state === 'play') {
      if (Input.pressed.pause) { UI.pause(); return; }
      this.update();
    } else if (this.state === 'title' || this.state === 'menu') {
      if (this.attract && this.L) { this.t++; this.P.update({ right: true }); this.updFx(); this.updCam(); for (const b of this.L.biscuits) if (!b.got && Math.hypot(this.P.x - b.x, this.P.y - 22 - b.y) < 40) b.got = true; }
    } else if (this.state === 'pause') {
      if (Input.pressed.pause) UI.resume();
    }
  },
  update() {
    const L = this.L, P = this.P; this.t++;
    if (!P.done && this.respawnT <= 0) { this.time++; if (this.time % 3 === 0 && this.rec.length < 12000) this.rec.push(Math.round(P.x), Math.round(P.y), P.face, Math.round(P.ang * 100), POSES.indexOf(P.pose)); }
    // moving platforms
    for (const p of L.plats) {
      p.px = p.x; p.py = p.y; p.t++;
      const m = p.move;
      if (m) {
        if (m.type === 'h') p.x = m.x0 + (m.x1 - m.x0) * (0.5 - 0.5 * Math.cos(p.t * m.speed));
        else if (m.type === 'v') p.y = m.y0 + (m.y1 - m.y0) * (0.5 - 0.5 * Math.cos(p.t * m.speed));
        else if (m.type === 'bob') p.y = p.by + Math.sin(p.t * 0.05) * 3;
        else if (m.type === 'ride') { const on = P.plat === p; if (on) { p.idle = 0; p.x = Math.min(m.x1, p.x + m.speed); } else { p.idle = (p.idle || 0) + 1; if (p.idle > 150 && p.x > m.x0) p.x = Math.max(m.x0, p.x - 1.6); } p.y = p.by + Math.sin(p.t * 0.05) * 2; }
      }
      p.dx = p.x - p.px; p.dy = p.y - p.py;
    }
    // respawn fade
    if (this.respawnT > 0) { this.respawnT--; if (this.respawnT === 35) this.checkpointRespawn(); }
    // ring (steady trot challenge)
    const R = L.ring;
    if (R && !P.done) {
      const inRing = P.x > R.x0 && P.x < R.x1;
      if (inRing && !this.ringActive && !R.over) { this.ringActive = true; this.ring = { frames: 0, good: 0, msgT: 0 }; this.popup(P.x + 140, P.y - 120, 'Show your Lab to the judge!\nKeep a steady trot', GOLD2, 170, 24); Sound.play('judge'); }
      if (this.ringActive) {
        const sp = Math.abs(P.ground ? P.gsp : P.vx); const rg = this.ring; rg.frames++;
        rg.sp = sp; const good = sp >= 2.4 && sp <= 5.6 && P.ground; if (good) rg.good++;
        rg.msgT--;
        if (rg.msgT <= 0 && rg.frames > 40) { if (sp > 5.6) { this.popup(P.x, P.y - 80, 'Steady!', '#fff'); rg.msgT = 70; } else if (sp < 1) { this.popup(P.x, P.y - 80, 'Keep moving!', '#fff'); rg.msgT = 90; } }
        if (P.x >= R.x1 || P.x <= R.x0 - 40) {
          this.ringActive = false; R.over = P.x >= R.x1;
          if (!R.over) { this.ring = null; }
          else {
            const ratio = rg.good / Math.max(1, rg.frames);
            if (ratio >= 0.55) { const r = { x: P.x + 60, y: P.y - 60, idx: R.idx, got: false, ph: 0 }; this.collectRosette(r); this.popup(P.x, P.y - 110, 'Lovely movement!', GOLD2, 140, 30); }
            else { this.popup(P.x, P.y - 100, 'Nice try! Trot more steadily for a rosette', '#fff', 150); }
          }
        }
      }
    }
    P.update({ left: Input.cur.left, right: Input.cur.right, down: Input.cur.down, jump: Input.cur.jump, jumpP: Input.pressed.jump, zoomP: Input.pressed.zoom });
    // springs and dash pads
    const pb = P.box();
    for (const s of L.springs) {
      if (s.anim > 0) s.anim--;
      const bw = s.kind === 'castle' ? 100 : 44, bx = { x: s.x - bw / 2, y: s.y - (s.kind === 'castle' ? 50 : 30), w: bw, h: s.kind === 'castle' ? 50 : 30 };
      if (overlap(pb, bx) && (P.vy >= 0 || P.ground || P.swim) && !P.loop && P.springT < 20) { P.spring(s); s.anim = 12; }
    }
    for (const d of L.pads) {
      if (P.ground && !P.plat && Math.abs(P.x - d.x) < 36 && Math.abs(P.y - d.y) < 12) { if (P.gsp < 10.5) { P.gsp = 11; Sound.play('dash'); } P.face = 1; }
    }
    // biscuits
    const pcx = P.x, pcy = P.y - 22;
    for (const b of L.biscuits) {
      if (b.got) continue;
      const dx = pcx - b.x, dy = pcy - b.y;
      if (dx * dx + dy * dy < 44 * 44) { b.got = true; this.getBiscuit(b.x, b.y); }
    }
    for (const b of this.loose) {
      b.life--; b.vy += 0.25; b.x += b.vx; b.y += b.vy; const gy = L.g(b.x); if (b.y > gy - 8) { b.y = gy - 8; b.vy *= -0.55; b.vx *= 0.8; }
      if (b.life < 175) { const dx = pcx - b.x, dy = pcy - b.y; if (dx * dx + dy * dy < 44 * 44) { b.life = 0; this.getBiscuit(b.x, b.y); } }
    }
    this.loose = this.loose.filter(b => b.life > 0);
    // rosettes
    for (const r of L.rosettes) { if (!r.got && Math.hypot(pcx - r.x, pcy - r.y) < 50) this.collectRosette(r); }
    // checkpoints
    for (const ch of L.checks) { ch.t++; if (!ch.on && P.x > ch.x && !P.done) { ch.on = true; this.checkpoint = { x: ch.x + 20 }; Sound.play('check'); this.popup(ch.x, ch.y - 120, 'Checkpoint', GOLD2); for (let i = 0; i < 10; i++) this.fx('spark', ch.x + 20, ch.y - 90, {}); } }
    updEnemies(this, L, P); updProjectiles(this, L, P); updExtras(this, L, P);
    // boss
    if (L.boss) {
      if (!this.boss && P.x > L.boss.x0 + 60) { this.boss = makeBoss(L); this.popup(P.x + 200, P.y - 160, L.boss.name, '#fff', 150, 30); Sound.play('squawk'); }
      if (this.boss) {
        updBoss(this, L, P); if (!P.done) P.x = clamp(P.x, L.boss.x0 + 30, L.boss.x1 - 30);
        if (!this.boss.dead && P.biscuits < 3 && this.t % 480 === 0 && L.biscuits.filter(b => !b.got && b.x > L.boss.x0).length < 4) {
          for (let i = 0; i < 4; i++) { const x = L.boss.x0 + 120 + Math.random() * (L.boss.x1 - L.boss.x0 - 240); L.bis(x, L.g(x) - 40); }
        }
      }
    }
    // goal prize (after a boss)
    const gl = this.goal;
    if (gl) {
      gl.t++;
      if (!gl.landed) { gl.vy += 0.3; gl.y += gl.vy; let fy = L.g(gl.x) - (gl.kind === 'trophy' ? 0 : 30); const gw = L.water.find(w => gl.x > w.x0 && gl.x < w.x1); if (gw) fy = Math.min(fy, gw.top - 28); for (const p of L.plats) if (gl.x > p.x && gl.x < p.x + p.w && gl.y - gl.vy <= p.y - 30 && gl.y >= p.y - 30) fy = Math.min(fy, p.y - 30); if (gl.y >= fy) { gl.y = fy; gl.landed = true; } }
      if (!P.done && Math.hypot(pcx - gl.x, pcy - (gl.y - 10)) < 56 && gl.t > 30) {
        this.goal = null; Sound.play('rosette');
        if (gl.kind === 'trophy') { P.carry = true; }
        this.finishAct();
      }
    }
    if (L.finish && !P.done && P.x > L.finish.x) this.finishAct();
    if (P.done) { this.finishT++; if (this.finishT === 170) UI.results(); }
    this.updFx(); this.updCam();
  },
  getBiscuit(x, y) {
    const P = this.P; P.biscuits++; P.meter = Math.min(100, P.meter + 4); this.score += 10; Sound.play('biscuit');
    if (!this.reduced) for (let i = 0; i < 3; i++) this.fx('crumb', x, y, {});
    if (P.meter >= 100 && !this.zoomHinted) { this.zoomHinted = true; this.popup(P.x, P.y - 90, Game.easy ? 'Zoomies!' : UI.hint('zoom'), GOLD2, 120); }
  },
  updFx() {
    for (const p of this.fxs) {
      p.life--; p.x += p.vx; p.y += p.vy; p.r += 0.1;
      if (p.kind === 'splash' || p.kind === 'bolt' || p.kind === 'grass' || p.kind === 'crumb') p.vy += 0.3;
      if (p.kind === 'feather') { p.vy = Math.min(1, p.vy + 0.05); p.vx *= 0.98; p.x += Math.sin(p.life * 0.1) * 0.6; }
      if (p.kind === 'confetti') { p.vy = Math.min(2, p.vy + 0.04); p.x += Math.sin(p.life * 0.12 + p.r) * 0.8; }
      if (p.kind === 'spark') { p.vx *= 0.92; p.vy *= 0.92; }
    }
    this.fxs = this.fxs.filter(p => p.life > 0);
    for (const p of this.pops) { p.life--; p.y -= 0.5; }
    this.pops = this.pops.filter(p => p.life > 0);
    if (this.shakeT > 0) { this.shakeT--; if (!this.shakeT) this.shakeA = 0; }
  },
  updCam(snap) {
    const P = this.P, L = this.L, VW = this.VW, VH = this.VH;
    const v = P.ground ? P.gsp : P.vx;
    this.lookX = lerp(this.lookX, clamp(v * 22, -VW * 0.22, VW * 0.22), 0.04);
    let tx = P.x - VW * (this.attract ? 0.7 : 0.45) + this.lookX, ty = P.y - VH * (this.attract ? 0.7 : 0.66);
    if (this.boss && L.boss) { const a = L.boss; const mid = (a.x0 + a.x1) / 2; tx = (a.x1 - a.x0 <= VW) ? mid - VW / 2 : clamp(tx, a.x0 - 20, a.x1 - VW + 20); ty = Math.min(ty, a.camY != null ? a.camY : ty); if (a.camY != null) ty = lerp(a.camY, ty, a.camFollow || 0); }
    this.cam.x = snap ? tx : lerp(this.cam.x, tx, 0.18);
    const dy = ty - this.cam.y; this.cam.y += Math.abs(dy) > 160 ? dy * 0.2 : dy * (P.ground ? 0.1 : 0.06);
    this.clampCam();
  },
  clampCam() {
    const L = this.L; if (!L) return;
    this.cam.x = clamp(this.cam.x, 0, Math.max(0, L.maxX - this.VW + 40));
    this.cam.y = Math.min(this.cam.y, L.t.maxY - this.VH + 140);
  },
  // ---------------- render ----------------
  render() {
    const c = this.ctx, cv = this.cv;
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0d1a36'; c.fillRect(0, 0, cv.width, cv.height);
    if (!this.L) return;
    c.setTransform(this.scale, 0, 0, this.scale, this.offX, this.offY);
    c.save(); c.beginPath(); c.rect(0, 0, this.VW, this.VH); c.clip();
    const L = this.L, W = WORLDS[L.world], VW = this.VW, VH = this.VH, t = this.t;
    let sx = 0, sy = 0; if (this.shakeT > 0) { sx = (Math.random() - 0.5) * this.shakeA; sy = (Math.random() - 0.5) * this.shakeA; }
    const cx = Math.round((this.cam.x + sx) * 4) / 4, cy = Math.round((this.cam.y + sy) * 4) / 4;
    drawSky(c, W, VW, VH, t, L.world);
    drawClouds(c, cx, VW, t, L.world);
    if (this.layers) for (const ly of this.layers) {
      let x = -((cx * ly.f) % BG_W); if (x > 0) x -= BG_W; const y = -(cy - 116) * ly.fy + ly.off;
      for (let xx = x; xx < VW; xx += BG_W) c.drawImage(ly.cv, xx, y, BG_W, BG_H);
    }
    c.save(); c.translate(-cx, -cy);
    const x0 = cx - 160, x1 = cx + VW + 160, vis = x => x > x0 && x < x1;
    for (const d of L.decor) if (vis(d.x)) drawDecor(c, d, t, L.world);
    for (const l of L.loops) if (vis(l.x - l.r) || vis(l.x + l.r)) drawLoopRing(c, l, L.world, t, 'back');
    drawExtrasBack(c, this, L);
    this.drawGround(c, cx, cy);
    for (const p of L.plats) if (vis(p.x) || vis(p.x + p.w)) drawPlat(c, p, L, t);
    for (const s of L.springs) if (vis(s.x)) { c.save(); c.translate(s.x, s.y); drawSpring(c, s, L.world); c.restore(); }
    for (const d of L.pads) if (vis(d.x)) { c.save(); c.translate(d.x, d.y); drawPad(c, t); c.restore(); }
    for (const sg of L.signs) if (vis(sg.x)) { c.save(); c.translate(sg.x, sg.y); drawSign(c, UI.hint(sg.key), t); c.restore(); }
    for (const ch of L.checks) if (vis(ch.x)) { c.save(); c.translate(ch.x, ch.y); drawCheck(c, ch, t); c.restore(); }
    if (L.finish && vis(L.finish.x)) { c.save(); c.translate(L.finish.x, L.finish.y); drawFinish(c, t); c.restore(); }
    if (L.ring) this.drawRing(c, L.ring);
    drawExtrasMid(c, this, L, t);
    for (const b of L.biscuits) if (!b.got && vis(b.x)) { c.save(); c.translate(b.x, b.y); drawBone(c, t * 0.06 + b.ph); c.restore(); }
    for (const b of this.loose) { if (b.life < 60 && Math.floor(b.life / 4) % 2) continue; c.save(); c.translate(b.x, b.y); drawBone(c, t * 0.12 + b.ph); c.restore(); }
    for (const r of L.rosettes) if (!r.got && vis(r.x)) { c.save(); c.translate(r.x, r.y); if (this.foundBefore && this.foundBefore[r.idx]) c.globalAlpha = 0.55; drawRosette(c, t + r.ph * 40); c.restore(); }
    for (const e of L.enemies) if (vis(e.x)) drawEnemy(c, e, t);
    drawBoss(c, this);
    if (this.goal) { const g = this.goal; c.save(); c.translate(g.x, g.y); if (g.kind === 'trophy') drawTrophy(c, t); else { c.scale(1.4, 1.4); drawRosette(c, t); } c.restore(); }
    this.drawSniff(c);
    this.drawGhost(c);
    this.drawPlayer(c); drawCarry(c, this.P, t); drawCarryArrow(c, this, L);
    for (const p of L.projectiles) drawProjectile(c, p);
    this.drawWater(c, cx, cy, W, t); drawCurrents(c, this, L);
    for (const l of L.loops) if (vis(l.x)) drawLoopRing(c, l, L.world, t, 'front');
    for (const d of L.front) if (vis(d.x)) drawDecor(c, d, t, L.world);
    this.drawFx(c);
    this.drawPops(c);
    c.restore();
    drawDarkness(c, this, L);
    if (W.snow) this.drawSnow(c, cx);
    if (this.state === 'play' || this.state === 'pause') this.drawHUD(c);
    if (this.respawnT > 0) { const a = this.respawnT > 35 ? (70 - this.respawnT) / 35 : this.respawnT / 35; c.fillStyle = `rgba(13,26,54,${clamp(a, 0, 1)})`; c.fillRect(0, 0, VW, VH); }
    c.restore();
  },
  drawGround(c, cx, cy) {
    const L = this.L, T = L.t, W = WORLDS[L.world], x0 = cx - 40, x1 = cx + this.VW + 40, bottom = cy + this.VH + 80;
    for (const p of T.pieces) {
      if (p.x1 < x0 || p.x0 > x1) continue;
      const a = Math.max(p.x0, x0), b = Math.min(p.x1, x1);
      const pts = [[a, p.y(a)]]; for (const q of p.pts) if (q[0] > a && q[0] < b) pts.push(q); pts.push([b, p.y(b)]);
      c.beginPath(); c.moveTo(a, bottom); for (const q of pts) c.lineTo(q[0], q[1]); c.lineTo(b, bottom); c.closePath();
      c.fillStyle = this.soilPat || W.soil; c.fill();
      // cliff shading
      if (p.x0 >= x0) { c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(p.x0, p.y(p.x0), 7, bottom - p.y(p.x0)); }
      if (p.x1 <= x1) { c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(p.x1 - 7, p.y(p.x1), 7, bottom - p.y(p.x1)); }
      c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1] + 4) : c.moveTo(q[0], q[1] + 4));
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.strokeStyle = W.edge; c.lineWidth = 18; c.stroke();
      c.strokeStyle = W.grass; c.lineWidth = 13; c.stroke();
      c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1] - 1) : c.moveTo(q[0], q[1] - 1));
      c.strokeStyle = W.grass2; c.lineWidth = 3; c.stroke();
      if (W.brick) { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1] + 13) : c.moveTo(q[0], q[1] + 13)); c.strokeStyle = '#d8c9a8'; c.lineWidth = 5; c.stroke(); }
    }
  },
  drawWater(c, cx, cy, W, t) {
    const L = this.L, bottom = cy + this.VH + 80;
    for (const w of L.water) {
      if (w.x1 < cx - 20 || w.x0 > cx + this.VW + 20) continue;
      c.fillStyle = W.water; c.fillRect(w.x0, w.top, w.x1 - w.x0, bottom - w.top);
      c.beginPath(); for (let x = w.x0; x <= w.x1; x += 12) { const y = w.top + Math.sin(x * 0.05 + t * 0.07) * 2; x === w.x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
      c.strokeStyle = W.waterTop; c.lineWidth = 3; c.globalAlpha = 0.85; c.stroke(); c.globalAlpha = 1;
      c.fillStyle = 'rgba(255,255,255,.35)';
      for (let x = w.x0 + 30; x < w.x1 - 20; x += 70) { const k = Math.sin(t * 0.04 + x); if (k > 0.3) c.fillRect(x, w.top + 10 + (x % 37), 14 * k, 2); }
    }
  },
  drawRing(c, R) {
    // white rails at the edge of the ring and a mown stripe
    const L = this.L;
    c.save(); c.globalAlpha = 0.25; c.fillStyle = '#fff';
    for (let x = R.x0; x < R.x1; x += 160) { c.beginPath(); c.moveTo(x, L.g(x) - 1); c.lineTo(x + 80, L.g(x + 80) - 1); c.lineTo(x + 80, L.g(x + 80) + 10); c.lineTo(x, L.g(x) + 10); c.fill(); }
    c.restore();
  },
  drawSniff(c) {
    const P = this.P; if (P.sniffT < 8) return;
    let best = null, bd = 1e9;
    for (const r of this.L.rosettes) if (!r.got) { const d = Math.hypot(r.x - P.x, r.y - P.y); if (d < bd) { bd = d; best = r; } }
    if (!best) { if (P.sniffT === 8) this.popup(P.x, P.y - 80, 'All rosettes found here!', '#fff'); return; }
    const ax = P.x + P.face * 40, ay = P.y - 8, dx = best.x - ax, dy = best.y - ay, d = Math.hypot(dx, dy), n = Math.min(16, Math.floor(d / 40));
    const show = Math.min(n, Math.floor(P.sniffT / 3));
    for (let i = 1; i <= show; i++) {
      const k = i / (n + 1), x = ax + dx * k + Math.sin(i * 1.7 + this.t * 0.1) * 6, y = ay + dy * k + Math.cos(i * 1.3 + this.t * 0.1) * 6;
      c.globalAlpha = 0.85 * (1 - k * 0.6); circ(c, x, y, 4 - k * 2); c.fillStyle = GOLD2; c.fill();
    }
    c.globalAlpha = 1;
    if (P.sniffT > 40) { const ang = Math.atan2(dy, dx); c.save(); c.translate(P.x + Math.cos(ang) * 70, P.y - 40 + Math.sin(ang) * 50); c.rotate(ang); c.beginPath(); c.moveTo(14, 0); c.lineTo(-8, -9); c.lineTo(-3, 0); c.lineTo(-8, 9); c.closePath(); fillStroke(c, GOLD2, NAVY, 2); c.restore(); }
  },
  drawPlayer(c) {
    const P = this.P, col = Save.data.colour;
    for (const tr of P.trail) { c.save(); c.translate(tr.x, tr.y); c.rotate(tr.ang); c.scale(tr.face, 1); c.globalAlpha = tr.life / 14 * 0.35; drawDog(c, { col, pose: tr.pose, ph: tr.ph, sp: 12, t: this.t, collar: Save.data.collar, hat: Save.data.hat }); c.restore(); }
    if (P.inv > 0 && P.inv < 110 && Math.floor(P.inv / 4) % 2 && !P.done) return;
    c.save(); c.translate(P.x, P.y); c.rotate(P.ang); c.scale(P.face, 1);
    if (P.zoomT > 0) { const g = c.createRadialGradient(5, -32, 10, 5, -32, 60); g.addColorStop(0, 'rgba(242,207,107,.5)'); g.addColorStop(1, 'rgba(242,207,107,0)'); c.fillStyle = g; c.fillRect(-60, -95, 130, 120); }
    const sp = P.ground ? Math.abs(P.gsp) : Math.abs(P.vx);
    drawDog(c, { col, pose: P.pose, ph: P.ph, sp: P.loop ? 14 : sp, t: this.t, tail: P.tail, blink: P.blink > 0, collar: Save.data.collar, hat: Save.data.hat });
    if (P.carry) { c.save(); c.translate(48, -40); c.scale(0.6, 0.6); drawTrophy(c, this.t); c.restore(); }
    c.restore();
    if (P.done && this.finishT > 40 && this.finishT < 140 && P.pose === 'sit') { c.save(); c.font = '700 20px Fredoka, sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = NAVY; c.strokeText('Woof!', P.x + P.face * 40, P.y - 80); c.fillStyle = '#fff'; c.fillText('Woof!', P.x + P.face * 40, P.y - 80); c.restore(); }
  },
  drawGhost(c) {
    const g = this.ghost; if (!g || !this.trial) return;
    const i = Math.min(Math.floor(this.time / 3), g.n - 1) * 5, p = g.p; if (i < 0 || i + 4 >= p.length) return;
    c.save(); c.globalAlpha = 0.35; c.translate(p[i], p[i + 1]); c.rotate(p[i + 3] / 100); c.scale(p[i + 2] || 1, 1);
    drawDog(c, { col: 'yellow', pose: POSES[p[i + 4]] || 'run', ph: this.time * 0.25, sp: 8, t: this.t });
    c.restore();
    c.save(); c.font = '600 12px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,.8)'; c.fillText('Best run', p[i], p[i + 1] - 78); c.restore();
  },
  drawSnow(c, cx) {
    c.fillStyle = 'rgba(255,255,255,.85)';
    const n = this.reduced ? 30 : 90;
    for (let i = 0; i < n; i++) {
      const sp = 0.5 + (i % 5) * 0.18, x = (((i * 137.3 + Math.sin(this.t * 0.01 + i) * 30 - cx * 0.3 * sp) % this.VW) + this.VW) % this.VW, y = ((i * 89.7 + this.t * sp) % this.VH);
      circ(c, x, y, 1.2 + (i % 3)); c.fill();
    }
  },
  drawFx(c) {
    for (const p of this.fxs) {
      const k = p.life / p.max; c.globalAlpha = Math.min(1, k * 1.4);
      switch (p.kind) {
        case 'dust': circ(c, p.x, p.y, p.s * (1.6 - k)); c.fillStyle = this.L.world === 2 ? 'rgba(220,200,160,.7)' : 'rgba(230,220,200,.7)'; c.fill(); break;
        case 'splash': circ(c, p.x, p.y, 3); c.fillStyle = '#dff4ff'; c.fill(); break;
        case 'ripple': ell(c, p.x, p.y, 8 + (1 - k) * 24, 2 + (1 - k) * 4); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.5; c.stroke(); break;
        case 'spark': c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = GOLD2; c.fillRect(-4, -1, 8, 2); c.fillRect(-1, -4, 2, 8); c.restore(); break;
        case 'bolt': c.save(); c.translate(p.x, p.y); c.rotate(p.r * 3); c.fillStyle = '#9aa0aa'; c.fillRect(-3, -3, 6, 6); c.fillStyle = '#555'; c.fillRect(-1, -1, 2, 2); c.restore(); break;
        case 'feather': c.save(); c.translate(p.x, p.y); c.rotate(Math.sin(p.life * 0.1)); ell(c, 0, 0, 7, 2.5); c.fillStyle = p.life % 2 ? '#fff' : '#222'; c.fill(); c.restore(); break;
        case 'confetti': c.save(); c.translate(p.x, p.y); c.rotate(p.r * 2); c.fillStyle = p.col; c.fillRect(-4, -2, 8, 4); c.restore(); break;
        case 'grass': c.fillStyle = '#4f9a40'; c.fillRect(p.x, p.y, 3, 5); break;
        case 'crumb': c.fillStyle = '#c98a44'; c.fillRect(p.x, p.y, 3, 3); break;
      }
    }
    c.globalAlpha = 1;
  },
  drawPops(c) {
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    for (const p of this.pops) {
      const k = p.life / p.max; c.globalAlpha = Math.min(1, k * 3);
      c.font = `700 ${p.size}px Fredoka, system-ui, sans-serif`;
      p.text.split('\n').forEach((ln, i) => { const y = p.y + i * (p.size + 4); c.lineWidth = 5; c.strokeStyle = NAVY; c.strokeText(ln, p.x, y); c.fillStyle = p.col; c.fillText(ln, p.x, y); });
    }
    c.globalAlpha = 1;
  },
  drawHUD(c) {
    const P = this.P, st = this.stage; if (!st) return;
    c.save();
    rr(c, 12, 12, 236, st.boss ? 62 : 86, 14); c.fillStyle = 'rgba(13,26,54,.82)'; c.fill(); c.strokeStyle = 'rgba(217,169,58,.85)'; c.lineWidth = 2; c.stroke();
    c.save(); c.translate(38, 36); c.scale(1.2, 1.2); drawBone(c, 0); c.restore();
    c.font = '700 24px Fredoka, system-ui, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText(String(P.biscuits), 60, 37);
    const secs = Math.floor(this.time / 60); c.font = '600 18px Fredoka, system-ui, sans-serif'; c.fillStyle = GOLD2; c.textAlign = 'right';
    c.fillText(Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'), 236, 37);
    // zoomies meter
    const mx = 26, my = 54, mw = 208, full = P.meter >= 100 || P.zoomT > 0;
    rr(c, mx, my, mw, 12, 6); c.fillStyle = '#0b1530'; c.fill();
    const fillW = P.zoomT > 0 ? mw * P.zoomT / 260 : mw * P.meter / 100;
    if (fillW > 1) { rr(c, mx, my, Math.max(12, fillW), 12, 6); const g = c.createLinearGradient(mx, 0, mx + mw, 0); g.addColorStop(0, '#d9a93a'); g.addColorStop(1, '#ffe48a'); c.fillStyle = g; c.fill(); }
    if (full && P.zoomT <= 0) { c.globalAlpha = 0.5 + 0.5 * Math.sin(this.t * 0.25); rr(c, mx - 2, my - 2, mw + 4, 16, 8); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); c.globalAlpha = 1; }
    c.font = '600 11px Fredoka, system-ui, sans-serif'; c.textAlign = 'left'; c.lineJoin = 'round'; const zl = P.zoomT > 0 ? 'Zoomies!' : full ? 'Zoomies ready' : 'Zoomies'; c.lineWidth = 3; c.strokeStyle = NAVY; c.strokeText(zl, mx + 6, my + 6.5); c.fillStyle = '#fff'; c.fillText(zl, mx + 6, my + 6.5);
    if (!st.boss && this.L.presents.length) {
      c.save(); c.translate(42, 86); c.scale(0.9, 0.9); drawPresent(c, 0, '#c8362c'); c.restore();
      c.font = '700 16px Fredoka, system-ui, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText((this.presentsGot || 0) + ' of ' + this.L.presents.length + ' presents', 62, 87);
    } else if (!st.boss) {
      const s = Save.stage(st.id), got = s.rosettes || [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        c.save(); c.translate(42 + i * 34, 86); c.scale(0.55, 0.55);
        const has = got[i] || this.L.rosettes.some(r => r.idx === i && r.got);
        if (!has) { c.globalAlpha = 0.28; } drawRosette(c, has ? this.t : 0, 0); c.restore();
      }
      c.font = '500 13px Fredoka, system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,.75)'; c.textAlign = 'left'; c.fillText(st.name, 140, 86);
    }
    // distance to the finish
    if (this.L.finish && !st.boss && !this.ringActive) {
      const w = Math.min(300, this.VW - 560), x = (this.VW - w) / 2, y = 24, L = this.L, span = L.finish.x - L.startX;
      if (w > 120) {
        const pos = v => x + w * clamp((v - L.startX) / span, 0, 1);
        rr(c, x - 12, y - 12, w + 24, 24, 12); c.fillStyle = 'rgba(13,26,54,.7)'; c.fill();
        rr(c, x, y - 3, w, 6, 3); c.fillStyle = '#33415f'; c.fill();
        rr(c, x, y - 3, Math.max(6, pos(P.x) - x), 6, 3); c.fillStyle = GOLD; c.fill();
        for (const ch of L.checks) { const cx2 = pos(ch.x); c.fillStyle = ch.on ? GOLD2 : '#8a93a8'; c.fillRect(cx2 - 1.5, y - 7, 3, 14); }
        c.fillStyle = '#fff'; c.fillRect(x + w + 2, y - 10, 2, 16); c.fillStyle = GOLD2; c.beginPath(); c.moveTo(x + w + 4, y - 10); c.lineTo(x + w + 14, y - 6); c.lineTo(x + w + 4, y - 2); c.fill();
        if (this.trial && this.ghost) { const gi = Math.min(Math.floor(this.time / 3), this.ghost.n - 1) * 5; circ(c, pos(this.ghost.p[gi] || 0), y, 5); c.fillStyle = 'rgba(236,201,133,.85)'; c.fill(); }
        circ(c, pos(P.x), y, 7); c.fillStyle = (DOGCOL[Save.data.colour] || DOGCOL.black).base; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      }
    }
    if (this.whistleHold) { c.save(); c.font = '700 40px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.lineWidth = 7; c.strokeStyle = NAVY; c.lineJoin = 'round'; const sy = 130 + Math.sin(this.t * 0.3) * 3; c.strokeText('Stop!', this.VW / 2, sy); c.fillStyle = GOLD2; c.fillText('Stop!', this.VW / 2, sy); c.restore(); }
    if (this.trial) { c.save(); c.font = '600 14px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('Time trial', this.VW / 2, 52); c.restore(); }
    // boss bar
    const B = this.boss;
    if (B && !B.dead) {
      const w = 260, x = (this.VW - w) / 2;
      rr(c, x, 14, w, 44, 12); c.fillStyle = 'rgba(13,26,54,.82)'; c.fill(); c.strokeStyle = 'rgba(217,169,58,.85)'; c.lineWidth = 2; c.stroke();
      c.font = '700 16px Fredoka, system-ui, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(B.name, this.VW / 2, 28);
      for (let i = 0; i < B.max; i++) { const px = this.VW / 2 + (i - (B.max - 1) / 2) * 24; circ(c, px, 45, 7); c.fillStyle = i < B.hp ? '#e8513f' : '#33415f'; c.fill(); c.strokeStyle = '#0b1530'; c.lineWidth = 2; c.stroke(); }
    }
    // trot meter
    if (this.ringActive && this.ring) {
      const w = 300, x = (this.VW - w) / 2, y = 18, sp = clamp(this.ring.sp || 0, 0, 8.5);
      rr(c, x - 10, y - 4, w + 20, 62, 12); c.fillStyle = 'rgba(13,26,54,.85)'; c.fill(); c.strokeStyle = 'rgba(217,169,58,.85)'; c.lineWidth = 2; c.stroke();
      c.font = '700 15px Fredoka, system-ui, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('Steady trot', this.VW / 2, y + 10);
      rr(c, x, y + 24, w, 14, 7); c.fillStyle = '#33415f'; c.fill();
      const b0 = x + w * 2.4 / 8.5, b1 = x + w * 5.6 / 8.5; rr(c, b0, y + 24, b1 - b0, 14, 7); c.fillStyle = '#5fbf5a'; c.fill();
      const nx = x + w * sp / 8.5; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(nx, y + 22); c.lineTo(nx - 6, y + 14); c.lineTo(nx + 6, y + 14); c.fill(); c.fillRect(nx - 1.5, y + 22, 3, 18);
      const pct = Math.round(100 * this.ring.good / Math.max(1, this.ring.frames)); c.font = '600 12px Fredoka, system-ui, sans-serif'; c.fillStyle = GOLD2; c.fillText('Judge is impressed: ' + pct + '%', this.VW / 2, y + 50);
    }
    c.restore();
  }
};
