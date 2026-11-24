// ===================== terrain + level builder =====================
class Piece {
  constructor(pts) { this.pts = pts; this.x0 = pts[0][0]; this.x1 = pts[pts.length - 1][0]; }
  y(x) {
    const p = this.pts, n = p.length;
    if (x <= p[0][0]) return p[0][1];
    if (x >= p[n - 1][0]) return p[n - 1][1];
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p[m][0] <= x) lo = m; else hi = m; }
    const a = p[lo], b = p[hi], dx = b[0] - a[0];
    return dx <= 0 ? a[1] : a[1] + (b[1] - a[1]) * (x - a[0]) / dx;
  }
  angle(x) {
    const w = 7, xa = Math.max(this.x0, x - w), xb = Math.min(this.x1, x + w);
    if (xb - xa < 0.5) return 0;
    return Math.atan2(this.y(xb) - this.y(xa), xb - xa);
  }
}
class Terrain {
  constructor(pieces) { this.pieces = pieces; this.minX = pieces[0].x0; this.maxX = pieces[pieces.length - 1].x1;
    let mx = -1e9; for (const p of pieces) for (const q of p.pts) mx = Math.max(mx, q[1]); this.maxY = mx; }
  idx(x) {
    const ps = this.pieces; let lo = 0, hi = ps.length - 1;
    if (x < ps[0].x0) return 0;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ps[m].x0 <= x) lo = m; else hi = m - 1; }
    return lo;
  }
  at(x) { return this.pieces[this.idx(x)]; }
  y(x) { return this.at(x).y(x); }
  angle(x) { return this.at(x).angle(x); }
}

class Builder {
  constructor(y0) { this.pieces = []; this.cur = [[-800, y0], [0, y0]]; this.x = 0; this.y = y0; this.water = []; }
  pt(x, y) { this.cur.push([x, y]); this.x = x; this.y = y; return this; }
  flat(len) { return this.pt(this.x + len, this.y); }
  line(len, rise) { return this.pt(this.x + len, this.y - rise); }
  curve(len, rise, ease = smooth) {
    const n = Math.max(4, Math.ceil(len / 22)), x0 = this.x, y0 = this.y;
    for (let i = 1; i <= n; i++) { const t = i / n; this.pt(x0 + len * t, y0 - rise * ease(t)); }
    return this;
  }
  hill(len, h) {
    const n = Math.max(6, Math.ceil(len / 20)), x0 = this.x, y0 = this.y;
    for (let i = 1; i <= n; i++) { const t = i / n; this.pt(x0 + len * t, y0 - h * (1 - Math.cos(TAU * t)) / 2); }
    return this;
  }
  dip(len, d) { return this.hill(len, -d); }
  waves(len, h, k) { for (let i = 0; i < k; i++) this.hill(len / k, h); return this; }
  ramp(len, h) { return this.curve(len, h, easeIn); }
  cliff(dy) { this.pieces.push(new Piece(this.cur)); this.y += dy; this.cur = [[this.x, this.y]]; return this; }
  pool(len, depth, gap = 14) {
    const x0 = this.x, top = this.y + gap; this.cliff(depth).flat(len).cliff(-depth);
    this.water.push({ x0, x1: x0 + len, top }); return this;
  }
  end(extra = 1400) { this.flat(extra); this.pieces.push(new Piece(this.cur)); return new Terrain(this.pieces); }
}

// level container with placement helpers
class Level {
  constructor(def, terrain, water) {
    this.def = def; this.id = def.id; this.world = def.world; this.t = terrain; this.water = water || [];
    this.plats = []; this.loops = []; this.springs = []; this.pads = []; this.biscuits = []; this.rosettes = [];
    this.enemies = []; this.checks = []; this.signs = []; this.decor = []; this.front = []; this.trees = [];
    this.finish = null; this.boss = null; this.ring = null; this.startX = 120; this.projectiles = [];
    this.maxX = terrain.maxX - 400;
    levelExtras(this);
  }
  g(x) { return this.t.y(x); }
  bis(x, y) { this.biscuits.push({ x, y, got: false, ph: Math.random() * TAU }); }
  row(x, n, gap = 44, h = 44) { for (let i = 0; i < n; i++) { const xx = x + i * gap; this.bis(xx, this.g(xx) - h); } }
  arc(x, n, w, h, base = 40) { for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); const xx = x + w * t; this.bis(xx, this.g(xx) - base - h * Math.sin(Math.PI * t)); } }
  lineB(x0, y0, x1, y1, n) { for (let i = 0; i < n; i++) { const t = n === 1 ? 0 : i / (n - 1); this.bis(lerp(x0, x1, t), lerp(y0, y1, t)); } }
  circleB(cx, cy, r, n) { for (let i = 0; i < n; i++) { const a = i / n * TAU; this.bis(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } }
  spring(x, kind = 'up', power, y) { const yy = y == null ? this.g(x) : y; this.springs.push({ x, y: yy, kind, power: power || (kind === 'up' ? 16 : 14), anim: 0 }); }
  pad(x) { this.pads.push({ x, y: this.g(x) }); }
  loop(x, r = 120) { const gy = this.g(x); this.loops.push({ x, r, cy: gy - r, gy }); }
  plat(x, y, w, kind = 'plank', move = null) {
    const p = { x, y, w, kind, move, bx: x, by: y, dx: 0, dy: 0, px: x, py: y, t: Math.random() * 10 };
    this.plats.push(p); return p;
  }
  platG(x, h, w, kind, move) { return this.plat(x, this.g(x + w / 2) - h, w, kind, move); }
  enemy(type, x, o = {}) { const e = Object.assign({ type, x, y: 0, alive: true, t: Math.random() * 100, dir: -1 }, o); e.hx = x; this.enemies.push(e); return e; }
  rosette(x, y, idx) { this.rosettes.push({ x, y, idx, got: false, ph: Math.random() * TAU }); }
  rosetteG(x, h, idx) { this.rosette(x, this.g(x) - h, idx); }
  check(x) { this.checks.push({ x, y: this.g(x), on: false, t: 0 }); }
  sign(x, key) { this.signs.push({ x, y: this.g(x), key }); }
  dec(kind, x, o = {}) { this.decor.push(Object.assign({ kind, x, y: o.y == null ? this.g(x) : o.y, s: 1, seed: Math.random() }, o)); }
  fr(kind, x, o = {}) { this.front.push(Object.assign({ kind, x, y: o.y == null ? this.g(x) : o.y, s: 1, seed: Math.random() }, o)); }
  fin(x) { this.finish = { x, y: this.g(x) }; this.maxX = x + 1100; }
  waterAt(x, y) { for (const w of this.water) if (x >= w.x0 && x <= w.x1 && y > w.top) return w; return null; }
  // auto-scatter decoration along the ground
  scatter(kinds, seed, every = [140, 320], from = 0, to = null) {
    const r = mkRng(seed); let x = from + 60; const end = to == null ? this.maxX : to;
    while (x < end) {
      const inWater = this.water.some(w => x > w.x0 - 30 && x < w.x1 + 30);
      const nearLoop = this.loops.some(l => Math.abs(x - l.x) < l.r + 40);
      if (!inWater && !nearLoop) {
        const k = kinds[Math.floor(r() * kinds.length)];
        const a = Math.abs(this.t.angle(x));
        if (a < 0.35) this.dec(k, x, { s: 0.8 + r() * 0.45, seed: r(), flip: r() < 0.5 });
      }
      x += every[0] + r() * (every[1] - every[0]);
    }
  }
  frontScatter(kinds, seed, every = [90, 240]) {
    const r = mkRng(seed); let x = 80;
    while (x < this.maxX) {
      const inWater = this.water.some(w => x > w.x0 - 20 && x < w.x1 + 20);
      if (!inWater && Math.abs(this.t.angle(x)) < 0.5) this.fr(kinds[Math.floor(r() * kinds.length)], x, { s: 0.7 + r() * 0.5, seed: r() });
      x += every[0] + r() * (every[1] - every[0]);
    }
  }
}
