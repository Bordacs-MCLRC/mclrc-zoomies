// ===================== levels =====================
const DECOR = {
  1: { back: ['flowers', 'bush', 'tree', 'sunflower', 'gnome', 'birdbath', 'flowers', 'bush'], front: ['tuft', 'daisy', 'tuft'] },
  2: { back: ['lamp', 'bench', 'bollard', 'tree', 'milepost', 'lifebuoy', 'bush', 'tree'], front: ['tuft', 'tuft', 'daisy'] },
  3: { back: ['pine', 'bush', 'reeds', 'heron', 'pine', 'bench', 'tree'], front: ['tuft', 'daisy', 'tuft'] },
  4: { back: ['roundbale', 'gate', 'peg', 'tree', 'bush', 'roundbale', 'tree'], front: ['tuft', 'tuft'] },
  5: { back: ['bunting', 'bale', 'flag', 'cone', 'flag', 'bale'], front: ['tuft', 'daisy', 'tuft'] },
  6: { back: ['snowman', 'pine', 'xtree', 'presents', 'lamp', 'bench', 'pine'], front: ['tuft'] },
  7: { back: ['lobsterpots', 'crate', 'nets', 'anchor', 'bollard', 'lamp', 'crate'], front: ['tuft'] }
};
function finishDecor(L, seed) {
  const D = DECOR[L.world];
  L.scatter(D.back, seed, [170, 380]); L.frontScatter(D.front, seed + 1);
  // reeds at canal edges
  if (L.world === 2 || L.world === 3) for (const w of L.water) { L.dec('reeds', w.x0 - 18, { y: L.g(w.x0 - 18) + 4, s: 0.9 }); L.dec('reeds', w.x1 + 18, { y: L.g(w.x1 + 18) + 4, s: 0.9 }); }
}
const pool = (L, i) => L.water[i];
const boat = (L, w, off = 0, wdt = 260, sp = 0.007) => { const p = L.plat(w.x0 + 20, w.top - 34, wdt, 'boat', { type: 'h', x0: w.x0 + 20, x1: w.x1 - wdt - 30, speed: sp }); p.t = off; return p; };

// ---------- World 1 ----------
function lvl11(def) {
  const b = new Builder(440), m = {};
  b.flat(1000); m.hill = b.x; b.hill(700, 70); m.f2 = b.x; b.flat(560); m.dip = b.x; b.dip(700, 90);
  m.wall = b.x; b.flat(160); b.cliff(-70); m.top = b.x; b.flat(820); m.down = b.x; b.curve(820, -170);
  m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(900); m.preP = b.x; b.flat(220); m.pool = b.x; b.pool(560, 130);
  m.post = b.x; b.flat(420); m.waves = b.x; b.waves(1260, 52, 3); m.net = b.x; b.flat(360); m.ramp = b.x; b.ramp(320, 90); b.cliff(90);
  m.land = b.x; b.flat(900); m.swoop = b.x; b.dip(1100, 210); m.dsp = b.x; b.flat(1500);
  const L = new Level(def, b.end(1400), b.water);
  L.sign(220, 'run'); L.sign(560, 'sniff'); L.sign(880, 'jump');
  L.row(300, 6); L.arc(m.hill + 50, 9, 600, 70, 50); L.row(m.f2 + 40, 5);
  L.enemy('hoover', m.f2 + 360, { x0: m.f2 + 120, x1: m.f2 + 520 }); L.sign(m.f2 + 60, 'bounce');
  L.row(m.dip + 40, 12, 52, 36); L.sign(m.wall + 40, 'jumpup');
  L.sign(m.top + 50, 'trampoline'); L.spring(m.top + 170, 'up', 16);
  L.lineB(m.top + 170, L.g(m.top) - 90, m.top + 170, L.g(m.top) - 250, 5);
  const shed = L.platG(m.top + 300, 150, 300, 'shed');
  L.lineB(shed.x + 30, shed.y - 40, shed.x + 230, shed.y - 40, 5); L.rosette(shed.x + 272, shed.y - 44, 0);
  L.row(m.down + 40, 14, 56, 40); L.pad(m.pad + 40); L.row(m.pad + 120, 3);
  L.chase = { x0: m.down + 80, x1: m.pool + 10, state: 'idle', wtop: L.g(m.pool) + 14 };
  L.loop(m.loopF + 260, 120); L.circleB(m.loopF + 260, L.g(m.loopF + 260) - 120, 92, 12); L.row(m.loopF + 460, 6); L.check(m.loopF + 760);
  L.sign(m.preP + 70, 'swim');
  const w = pool(L, 0); L.lineB(w.x0 + 70, w.top + 88, w.x1 - 150, w.top + 88, 6); L.rosette(w.x1 - 60, w.top + 86, 1);
  L.row(m.post + 60, 6); L.enemy('hoover', m.post + 250, { x0: m.post + 120, x1: m.post + 400 });
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 420 + 60, 5, 300, 40, 50);
  L.enemy('goose', m.waves + 500, { x0: m.waves + 380, x1: m.waves + 760 }); L.enemy('goose', m.waves + 960, { x0: m.waves + 820, x1: m.waves + 1200 });
  L.sign(m.net + 50, 'nettles'); L.enemy('nettles', m.net + 230, { w: 70, y: L.g(m.net + 230) }); L.arc(m.net + 160, 5, 140, 70, 50);
  L.row(m.ramp + 40, 4, 60, 40); L.lineB(m.ramp + 380, L.g(m.ramp) - 170, m.ramp + 640, L.g(m.ramp) - 120, 6);
  L.enemy('nettles', m.land + 360, { w: 80, y: L.g(m.land + 360) }); L.arc(m.land + 300, 4, 120, 60, 50);
  L.dec('tree', m.land + 560, { s: 1.1 }); L.enemy('squirrel', m.land + 560, { y: L.g(m.land + 560) - 90 });
  L.row(m.land + 300, 4); L.check(m.land + 800);
  L.row(m.swoop + 40, 19, 54, 36);
  L.sign(m.dsp + 40, 'spring'); L.spring(m.dsp + 110, 'right', 18);
  const up = L.g(m.dsp + 500) - 170;
  L.plat(m.dsp + 320, up, 480, 'plank'); L.plat(m.dsp + 880, up - 20, 300, 'plank'); L.plat(m.dsp + 1260, up - 40, 260, 'plank');
  L.lineB(m.dsp + 360, up - 40, m.dsp + 760, up - 40, 7); L.lineB(m.dsp + 920, up - 60, m.dsp + 1140, up - 60, 4);
  L.rosette(m.dsp + 1470, up - 90, 2);
  L.enemy('hoover', m.dsp + 500, { x0: m.dsp + 300, x1: m.dsp + 800 }); L.enemy('hoover', m.dsp + 1100, { x0: m.dsp + 900, x1: m.dsp + 1400 });
  L.row(m.dsp + 300, 10, 80, 40);
  L.fin(m.dsp + 1800);
  finishDecor(L, 11); return L;
}
function lvl12(def) {
  const b = new Builder(440), m = {};
  b.flat(800); m.hill = b.x; b.hill(500, 60); m.f1 = b.x; b.flat(400); m.ramp = b.x; b.ramp(420, 130); m.green = b.x; b.flat(600);
  m.down = b.x; b.curve(600, -130); m.pad = b.x; b.flat(260); m.loopF = b.x; b.flat(800); b.flat(200); m.pond = b.x; b.pool(760, 130);
  m.post = b.x; b.flat(400); m.waves = b.x; b.waves(1500, 70, 4); m.pre = b.x; b.flat(300);
  b.cliff(-90); m.s1 = b.x; b.flat(320); b.cliff(-90); m.pav = b.x; b.flat(900);
  m.desc = b.x; b.curve(1000, -300); m.pad2 = b.x; b.flat(300); m.loop2 = b.x; b.flat(800); m.dip = b.x; b.dip(1200, 220);
  m.trees = b.x; b.flat(400); m.lines = b.x; b.flat(1500);
  const L = new Level(def, b.end(1400), b.water);
  L.row(260, 8); L.arc(m.hill + 40, 7, 420, 60, 50);
  L.enemy('hoover', m.f1 + 220, { x0: m.f1 + 60, x1: m.f1 + 360 });
  L.row(m.ramp + 60, 5, 70, 40); L.lineB(m.ramp + 470, L.g(m.green) - 130, m.ramp + 700, L.g(m.green) - 90, 5);
  L.dec('bunting', m.green + 60); L.dec('bunting', m.green + 320); L.sign(m.green + 40, 'fete');
  L.spring(m.green + 170, 'castle', 15); L.spring(m.green + 470, 'castle', 15);
  const fy = L.g(m.green) - 230; L.plat(m.green + 250, fy, 150, 'plank'); L.lineB(m.green + 170, fy - 40, m.green + 470, fy - 40, 7);
  L.row(m.down + 40, 10, 56, 40); L.pad(m.pad + 40); L.loop(m.loopF + 220, 120); L.circleB(m.loopF + 220, L.g(m.loopF + 220) - 120, 92, 12); L.check(m.loopF + 700);
  const w = pool(L, 0);
  L.plat(w.x0 + 200, w.top - 40, 90, 'plank'); L.plat(w.x0 + 460, w.top - 40, 90, 'plank');
  L.enemy('swan', w.x0 + 400, { x0: w.x0 + 80, x1: w.x1 - 80, wy: w.top, y: w.top + 6 });
  L.rosette(w.x0 + 70, w.top + 86, 0); L.lineB(w.x0 + 150, w.top + 86, w.x1 - 100, w.top + 86, 6);
  L.row(m.post + 40, 6);
  for (let i = 0; i < 4; i++) L.arc(m.waves + i * 375 + 40, 5, 290, 50, 50);
  L.enemy('goose', m.waves + 500, { x0: m.waves + 380, x1: m.waves + 700 }); L.enemy('hoover', m.waves + 1000, { x0: m.waves + 760, x1: m.waves + 1100 });
  L.enemy('goose', m.waves + 1300, { x0: m.waves + 1150, x1: m.waves + 1460 });
  L.sign(m.pre + 60, 'jumpup'); L.row(m.s1 + 60, 4);
  // cricket pavilion
  L.spring(m.pav + 130, 'up', 16); L.lineB(m.pav + 130, L.g(m.pav) - 90, m.pav + 130, L.g(m.pav) - 250, 5);
  const pav = L.platG(m.pav + 260, 170, 360, 'shed'); L.lineB(pav.x + 30, pav.y - 40, pav.x + 300, pav.y - 40, 7); L.rosette(pav.x + 330, pav.y - 46, 1);
  L.check(m.pav + 820);
  L.row(m.desc + 40, 16, 58, 40); L.pad(m.pad2 + 40); L.loop(m.loop2 + 240, 120); L.circleB(m.loop2 + 240, L.g(m.loop2 + 240) - 120, 92, 12);
  L.row(m.loop2 + 480, 5); L.row(m.dip + 40, 21, 54, 36); L.check(m.dip + 1150);
  L.dec('tree', m.trees + 180, { s: 1.1 }); L.enemy('squirrel', m.trees + 180, { y: L.g(m.trees + 180) - 90 });
  L.enemy('nettles', m.trees + 340, { w: 70, y: L.g(m.trees + 340) });
  // washing lines over nettle beds
  L.sign(m.lines + 30, 'lines');
  const lw = [[140, 300], [520, 300], [900, 300]];
  for (const [ox, wd] of lw) { const p = L.platG(m.lines + ox, 110, wd, 'line'); L.lineB(p.x + 40, p.y - 40, p.x + wd - 40, p.y - 40, 4); }
  L.enemy('nettles', m.lines + 470, { w: 90, y: L.g(m.lines + 470) }); L.enemy('nettles', m.lines + 850, { w: 90, y: L.g(m.lines + 850) });
  L.rosette(m.lines + 670, L.g(m.lines + 670) - 250, 2);
  L.fin(m.lines + 1350);
  finishDecor(L, 12); return L;
}
function lvl1B(def) {
  const b = new Builder(440); b.flat(1000); b.cliff(110); const x0 = b.x; b.flat(1150); const x1 = b.x; b.cliff(-520); b.flat(400);
  const L = new Level(def, b.end(600), b.water);
  L.row(200, 10); L.check(700); L.sign(860, 'boss');
  L.row(x0 + 100, 5, 50, 40); L.row(x1 - 340, 5, 50, 40);
  L.boss = { type: 'mower', hp: 4, x0, x1, name: 'Robo-Mower' };
  L.maxX = x1 + 200; finishDecor(L, 13); L.decor = L.decor.filter(d => d.x < x0 - 40 || d.x > x0 + 40); return L;
}
// ---------- World 2 ----------
function lvl21(def) {
  const b = new Builder(440), m = {};
  b.flat(800); m.br = b.x; b.hill(560, 70); m.f1 = b.x; b.flat(500); m.c1 = b.x; b.pool(1000, 120); m.f2 = b.x; b.flat(500);
  m.ramp = b.x; b.ramp(360, 100); b.cliff(100); m.f3 = b.x; b.flat(500); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(800);
  m.c2 = b.x; b.pool(1500, 140); m.f4 = b.x; b.flat(400); m.waves = b.x; b.waves(1400, 60, 3); m.f5 = b.x; b.flat(300);
  b.cliff(-80); m.wharf = b.x; b.flat(900); b.cliff(80); m.f6 = b.x; b.flat(300); m.dip = b.x; b.dip(1000, 160);
  m.trees = b.x; b.flat(600); m.c3 = b.x; b.pool(700, 110); m.end = b.x; b.flat(1400);
  const L = new Level(def, b.end(1400), b.water);
  L.row(260, 8); L.arc(m.br + 40, 8, 480, 70, 50); L.dec('milepost', 640);
  L.enemy('goose', m.f1 + 300, { x0: m.f1 + 120, x1: m.f1 + 460 });
  L.sign(m.f1 + 60, 'boat');
  const w1 = pool(L, 0); boat(L, w1, 1.2); L.enemy('swan', w1.x0 + 600, { x0: w1.x0 + 60, x1: w1.x1 - 60, wy: w1.top, y: w1.top + 6 });
  L.lineB(w1.x0 + 80, w1.top - 80, w1.x1 - 80, w1.top - 80, 10);
  L.check(m.f2 + 420); L.row(m.f2 + 40, 6);
  L.row(m.ramp + 40, 4, 70, 40); L.lineB(m.ramp + 420, L.g(m.ramp) - 200, m.ramp + 700, L.g(m.ramp) - 120, 6);
  L.enemy('hoover', m.f3 + 260, { x0: m.f3 + 80, x1: m.f3 + 440 });
  L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12); L.check(m.loopF + 700);
  const w2 = pool(L, 1); L.sign(w2.x0 - 120, 'tunnel');
  L.plat(w2.x0 + 20, w2.top - 34, 240, 'boat', { type: 'ride', x0: w2.x0 + 20, x1: w2.x1 - 270, speed: 3 });
  L.tunnel = { x0: w2.x0 - 30, x1: w2.x1 + 30, gy: L.g(w2.x0 - 30), top: w2.top };
  L.rosette(w2.x0 + 760, w2.top + 96, 1); L.lineB(w2.x0 + 500, w2.top + 96, w2.x0 + 700, w2.top + 96, 4); L.lineB(w2.x0 + 100, w2.top - 70, w2.x1 - 100, w2.top - 70, 14);
  L.row(m.f4 + 40, 6);
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 466 + 60, 5, 330, 50, 50);
  L.enemy('goose', m.waves + 400, { x0: m.waves + 300, x1: m.waves + 640 }); L.enemy('goose', m.waves + 1000, { x0: m.waves + 860, x1: m.waves + 1260 });
  L.sign(m.f5 + 40, 'jumpup');
  // wharf and warehouse ledges
  L.spring(m.wharf + 90, 'up', 16); L.lineB(m.wharf + 90, L.g(m.wharf) - 90, m.wharf + 90, L.g(m.wharf) - 250, 5);
  const ly = L.g(m.wharf) - 190; L.plat(m.wharf + 180, ly, 300, 'ledge'); L.plat(m.wharf + 560, ly - 30, 300, 'ledge');
  L.lineB(m.wharf + 220, ly - 40, m.wharf + 440, ly - 40, 5); L.rosette(m.wharf + 820, ly - 76, 0);
  L.enemy('hoover', m.wharf + 400, { x0: m.wharf + 200, x1: m.wharf + 780 }); L.check(m.wharf + 840);
  L.row(m.f6 + 40, 5); L.row(m.dip + 40, 18, 54, 36);
  L.dec('tree', m.trees + 160, { s: 1.1 }); L.enemy('squirrel', m.trees + 160, { y: L.g(m.trees + 160) - 90 });
  L.dec('tree', m.trees + 460, { s: 1.15 }); L.enemy('squirrel', m.trees + 460, { y: L.g(m.trees + 460) - 92 });
  const w3 = pool(L, 2); boat(L, w3, 2); L.enemy('swan', w3.x0 + 300, { x0: w3.x0 + 60, x1: w3.x1 - 60, wy: w3.top, y: w3.top + 6 });
  L.enemy('nettles', m.end + 180, { w: 80, y: L.g(m.end + 180) });
  L.spring(m.end + 480, 'right', 18); L.sign(m.end + 400, 'spring');
  const gy = L.g(m.end + 900) - 170; L.plat(m.end + 720, gy, 600, 'girder'); L.lineB(m.end + 760, gy - 40, m.end + 1200, gy - 40, 7);
  L.rosette(m.end + 1290, gy - 50, 2);
  L.fin(m.end + 1500);
  finishDecor(L, 21); return L;
}
function lvl22(def) {
  const b = new Builder(440), m = {};
  b.flat(700); m.h = b.x; b.hill(500, 50); m.f1 = b.x; b.flat(300);
  m.locks = []; for (let i = 0; i < 4; i++) { const s = b.x; b.pool(320, 110); b.flat(220); const g = b.x; b.cliff(-90); b.flat(260); m.locks.push({ s, g }); }
  m.top = b.x; b.flat(700); m.desc = b.x; b.curve(1600, -360); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(800);
  m.c = b.x; b.pool(1100, 130); m.f2 = b.x; b.flat(400); m.waves = b.x; b.waves(1200, 80, 3); m.f3 = b.x; b.flat(300);
  m.ramp = b.x; b.ramp(400, 130); b.cliff(130); m.land = b.x; b.flat(700); m.dip = b.x; b.dip(900, 150); m.end = b.x; b.flat(1300);
  const L = new Level(def, b.end(1400), b.water);
  L.row(260, 8); L.arc(m.h + 40, 7, 420, 50, 50); L.sign(m.f1 + 60, 'locks');
  m.locks.forEach((lk, i) => {
    const w = L.water[i]; L.dec('lockgate', lk.g - 4, { y: L.g(lk.g - 30) }); L.lineB(w.x0 + 60, w.top - 60, w.x1 - 60, w.top - 60, 4);
    L.arc(lk.g - 140, 4, 160, 70, 40); L.row(lk.g + 40, 4, 50, 40);
  });
  L.enemy('hoover', m.locks[1].g + 140, { x0: m.locks[1].g + 40, x1: m.locks[1].g + 230 });
  L.enemy('swan', L.water[3].x0 + 160, { x0: L.water[3].x0 + 40, x1: L.water[3].x1 - 40, wy: L.water[3].top, y: L.water[3].top + 6 });
  L.rosette(L.water[2].x0 + 260, L.water[2].top + 76, 0);
  L.check(m.top + 120); L.dec('bench', m.top + 300); L.dec('lamp', m.top + 420);
  L.spring(m.top + 520, 'up', 16);
  const gy = L.g(m.top) - 220; L.plat(m.top + 620, gy, 420, 'girder'); L.lineB(m.top + 660, gy - 40, m.top + 920, gy - 40, 5); L.rosette(m.top + 1000, gy - 50, 1);
  L.row(m.desc + 40, 26, 58, 40); L.enemy('hoover', m.desc + 900, { x0: m.desc + 700, x1: m.desc + 1100 });
  L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12); L.check(m.loopF + 700);
  const w = L.water[4]; boat(L, w, 1); L.enemy('swan', w.x0 + 500, { x0: w.x0 + 60, x1: w.x1 - 60, wy: w.top, y: w.top + 6 }); L.lineB(w.x0 + 100, w.top - 70, w.x1 - 100, w.top - 70, 10);
  L.row(m.f2 + 40, 6);
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 400 + 50, 5, 300, 60, 50);
  L.enemy('goose', m.waves + 420, { x0: m.waves + 320, x1: m.waves + 600 }); L.enemy('goose', m.waves + 820, { x0: m.waves + 720, x1: m.waves + 1000 });
  L.row(m.ramp + 40, 5, 70, 40); L.lineB(m.ramp + 460, L.g(m.ramp) - 230, m.ramp + 760, L.g(m.ramp) - 150, 6);
  L.enemy('nettles', m.land + 360, { w: 80, y: L.g(m.land + 360) }); L.arc(m.land + 300, 4, 120, 60, 50);
  L.dec('tree', m.land + 520, { s: 1.1 }); L.enemy('squirrel', m.land + 520, { y: L.g(m.land + 520) - 90 }); L.check(m.land + 660);
  L.row(m.dip + 40, 16, 54, 36);
  L.spring(m.end + 200, 'up', 16); L.lineB(m.end + 200, L.g(m.end) - 90, m.end + 200, L.g(m.end) - 250, 5);
  const ly = L.g(m.end) - 200; L.plat(m.end + 300, ly, 300, 'ledge'); L.plat(m.end + 680, ly - 30, 280, 'ledge'); L.rosette(m.end + 920, ly - 76, 2);
  L.enemy('hoover', m.end + 600, { x0: m.end + 340, x1: m.end + 900 });
  L.fin(m.end + 1250);
  finishDecor(L, 22); return L;
}
function lvl2B(def) {
  const b = new Builder(440); b.flat(900); const x0 = b.x; b.flat(200); b.pool(1000, 120); b.flat(240); const x1 = b.x; b.cliff(-520); b.flat(400);
  const L = new Level(def, b.end(600), b.water);
  L.row(200, 10); L.check(640); L.sign(800, 'boss2');
  const w = L.water[0]; const bt = L.plat(w.x0 + 20, w.top - 34, 280, 'boat', { type: 'h', x0: w.x0 + 20, x1: w.x1 - 300, speed: 0.0065 }); bt.t = 0;
  L.row(x0 + 30, 4, 40, 40); L.row(x1 - 200, 4, 40, 40);
  L.boss = { type: 'boatpie', hp: 4, x0, x1, name: 'Magpie on the Narrowboat', boat: true, camY: 440 - 400, camFollow: 0.15 };
  L.maxX = x1 + 200; finishDecor(L, 23); L.decor = L.decor.filter(d => d.x < x0 - 30); return L;
}
// ---------- World 3 ----------
function lvl51(def) {
  const b = new Builder(440), m = {};
  b.flat(800); m.h = b.x; b.hill(600, 60); m.f1 = b.x; b.flat(600); m.f2 = b.x; b.flat(400); m.af = b.x; b.hill(400, 120);
  m.f3 = b.x; b.flat(300); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(800); m.pp = b.x; b.pool(600, 110); m.f4 = b.x; b.flat(500);
  m.waves = b.x; b.waves(1500, 60, 3); m.f5 = b.x; b.flat(400); m.ramp = b.x; b.ramp(380, 110); m.up = b.x; b.flat(500);
  m.down = b.x; b.curve(700, -110); m.dip = b.x; b.dip(1000, 180); m.end = b.x; b.flat(1400);
  const L = new Level(def, b.end(1400), b.water);
  L.row(240, 6); L.plat(560, L.g(560) - 34, 70, 'bale'); L.plat(610, L.g(610) - 68, 70, 'bale'); L.lineB(560, L.g(560) - 110, 680, L.g(680) - 110, 3);
  L.arc(m.h + 40, 8, 520, 60, 50);
  L.enemy('hoover', m.f1 + 300, { x0: m.f1 + 80, x1: m.f1 + 520 }); L.enemy('dryer', m.f1 + 300, { x0: m.f1 + 120, x1: m.f1 + 480, by: L.g(m.f1) - 150 });
  L.sign(m.f2 + 20, 'awning'); L.spring(m.f2 + 110, 'up', 16);
  const cy = L.g(m.f2) - 200; L.plat(m.f2 + 220, cy, 420, 'canvas'); L.lineB(m.f2 + 260, cy - 40, m.f2 + 520, cy - 40, 5); L.rosette(m.f2 + 600, cy - 46, 0);
  L.arc(m.af + 20, 7, 360, 140, 40); L.dec('weave', m.f3 + 150); L.check(m.f3 + 260);
  L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12);
  L.agility = { x0: m.af - 160, x1: m.loopF + 760, state: 'idle' };
  L.dec('startgate', m.af - 160); L.dec('finishgate', m.loopF + 760);
  L.hurdle(m.af - 60); L.hurdle(m.f3 + 70); L.hurdle(m.loopF + 520); L.hurdle(m.loopF + 660);
  const w = L.water[0]; L.plat(w.x0 + 160, w.top - 40, 100, 'plank'); L.plat(w.x0 + 360, w.top - 40, 100, 'plank');
  L.rosette(w.x1 - 70, w.top + 76, 1); L.lineB(w.x0 + 60, w.top + 76, w.x1 - 150, w.top + 76, 6);
  L.row(m.f4 + 40, 6); L.enemy('dryer', m.f4 + 250, { x0: m.f4 + 60, x1: m.f4 + 460, by: L.g(m.f4) - 110 });
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 500 + 60, 6, 380, 50, 50);
  L.enemy('hoover', m.waves + 500, { x0: m.waves + 400, x1: m.waves + 700 }); L.enemy('hoover', m.waves + 1000, { x0: m.waves + 900, x1: m.waves + 1200 });
  L.check(m.f5 + 300); L.row(m.ramp + 40, 4, 70, 40);
  L.plat(m.up + 160, L.g(m.up) - 34, 80, 'bale'); L.plat(m.up + 330, L.g(m.up) - 70, 80, 'bale');
  L.enemy('dryer', m.up + 260, { x0: m.up + 60, x1: m.up + 460, by: L.g(m.up) - 140 });
  L.row(m.down + 40, 10, 58, 40); L.row(m.dip + 40, 18, 54, 36);
  L.plat(m.end + 120, L.g(m.end) - 90, 200, 'stall', { label: 'Leads & collars' }); L.plat(m.end + 420, L.g(m.end) - 90, 200, 'stall');
  L.plats[L.plats.length - 1].label = 'Dog biscuits';
  for (let i = 0; i < 4; i++) L.plat(m.end + 760 + i * 40, L.g(m.end) - 34 * (i + 1), 70, 'bale');
  L.rosette(m.end + 920, L.g(m.end) - 190, 2); L.enemy('hoover', m.end + 400, { x0: m.end + 100, x1: m.end + 700 });
  L.fin(m.end + 1300);
  finishDecor(L, 31); return L;
}
function lvl52(def) {
  const b = new Builder(440), m = {};
  b.flat(700); m.h = b.x; b.hill(500, 50); m.f1 = b.x; b.flat(500); m.ramp = b.x; b.ramp(300, 80); b.cliff(80); m.pre = b.x; b.flat(400);
  m.ring = b.x; b.flat(2800); m.post = b.x; b.flat(300); m.desc = b.x; b.curve(900, -200); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(900);
  m.pp = b.x; b.pool(700, 120); m.f2 = b.x; b.flat(500); m.waves = b.x; b.waves(1500, 70, 3); m.end = b.x; b.flat(1600);
  const L = new Level(def, b.end(1400), b.water);
  L.row(240, 8); L.arc(m.h + 40, 7, 420, 50, 50);
  L.enemy('hoover', m.f1 + 260, { x0: m.f1 + 80, x1: m.f1 + 440 }); L.enemy('dryer', m.f1 + 240, { x0: m.f1 + 100, x1: m.f1 + 420, by: L.g(m.f1) - 150 });
  L.lineB(m.ramp + 340, L.g(m.ramp) - 170, m.ramp + 560, L.g(m.ramp) - 110, 5);
  L.check(m.pre + 120); L.sign(m.pre + 300, 'ring');
  const rx0 = m.ring + 100, rx1 = m.ring + 2600;
  L.ring = { x0: rx0, x1: rx1, idx: 2 };
  L.dec('ringfence', rx0 - 40, { w: rx1 - rx0 + 80, s: 1, y: L.g(rx0) - 40 });
  for (let x = rx0 + 60; x < rx1 - 100; x += 170) L.dec('crowdbench', x, { y: L.g(x) - 46, s: 0.9, cheer: true });
  L.dec('judge', rx1 - 120, { y: L.g(rx1) - 6, flip: true });
  L.row(rx0 + 120, 4, 60, 40); L.row(rx1 - 600, 4, 60, 40);
  L.check(m.post + 120);
  L.row(m.desc + 40, 14, 58, 40); L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12);
  L.dec('weave', m.loopF + 600); L.check(m.loopF + 800);
  const w = L.water[0]; L.plat(w.x0 + 200, w.top - 40, 100, 'plank'); L.plat(w.x0 + 430, w.top - 40, 100, 'plank'); L.rosette(w.x0 + 330, w.top + 86, 0);
  L.lineB(w.x0 + 70, w.top + 86, w.x0 + 260, w.top + 86, 4);
  L.row(m.f2 + 40, 6); L.enemy('dryer', m.f2 + 260, { x0: m.f2 + 60, x1: m.f2 + 460, by: L.g(m.f2) - 120 });
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 500 + 60, 6, 380, 60, 50);
  L.enemy('hoover', m.waves + 520, { x0: m.waves + 420, x1: m.waves + 700 }); L.enemy('dryer', m.waves + 1000, { x0: m.waves + 860, x1: m.waves + 1200, by: L.g(m.waves + 1000) - 160 });
  L.sign(m.end + 40, 'awning'); L.spring(m.end + 140, 'up', 16);
  const cy = L.g(m.end) - 200; L.plat(m.end + 250, cy, 380, 'canvas'); L.plat(m.end + 700, cy - 30, 380, 'canvas');
  L.lineB(m.end + 290, cy - 40, m.end + 560, cy - 40, 5); L.lineB(m.end + 740, cy - 70, m.end + 1000, cy - 70, 5); L.rosette(m.end + 1050, cy - 76, 1);
  L.enemy('hoover', m.end + 600, { x0: m.end + 300, x1: m.end + 1000 });
  L.fin(m.end + 1450);
  finishDecor(L, 32);
  L.decor = L.decor.filter(d => d.kind === 'ringfence' || d.kind === 'crowdbench' || d.kind === 'judge' || d.x < rx0 - 60 || d.x > rx1 + 60);
  return L;
}
function lvl5B(def) {
  const b = new Builder(440); b.flat(900); b.cliff(80); const x0 = b.x; b.flat(1100); const x1 = b.x; b.cliff(-560); b.flat(400);
  const L = new Level(def, b.end(600), b.water);
  const F = L.g(x0 + 100);
  L.row(200, 10); L.check(660); L.sign(820, 'boss5');
  L.plat(x0 + 70, F - 130, 170, 'canvas'); L.plat(x1 - 240, F - 130, 170, 'canvas');
  L.plat(x0 + 290, F - 235, 160, 'canvas'); L.plat(x1 - 450, F - 235, 160, 'canvas');
  const nest = L.plat(x0 + 440, F - 335, 220, 'canvas'); L.dec('nest', x0 + 550, { y: F - 335, s: 1 });
  L.spring(x0 + 420, 'up', 15); L.spring(x1 - 420, 'up', 15);
  L.row(x0 + 100, 3, 40, 160); L.row(x1 - 210, 3, 40, 160); L.row(x0 + 320, 3, 40, 270);
  L.boss = { type: 'nestpie', hp: 5, x0, x1, name: 'The Magpie', nest: { x: x0 + 550, y: F - 335 }, prize: 'trophy', camY: F - 470, camFollow: 0 };
  L.maxX = x1 + 200; finishDecor(L, 33); L.decor = L.decor.filter(d => d.x < x0 - 30 || d.kind === 'nest');
  for (let x = x0 + 40; x < x1 - 200; x += 260) L.dec('bunting', x, { y: F, s: 1.3 });
  return L;
}

// ---------- World 3: Lakeside & Newfoundland ----------
function lvl31(def) {
  const b = new Builder(440), m = {};
  b.flat(700); m.h = b.x; b.hill(500, 50); m.j = b.x; b.flat(300); m.bay = b.x; b.pool(900, 130); m.shore = b.x; b.flat(500);
  m.ramp = b.x; b.ramp(300, 90); b.cliff(90); m.bh = b.x; b.flat(400); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(800);
  m.swim = b.x; b.pool(2200, 150); m.s2 = b.x; b.flat(500); m.waves = b.x; b.waves(1200, 60, 3); m.f3 = b.x; b.flat(300);
  m.dip = b.x; b.dip(900, 160); m.end = b.x; b.flat(1300);
  const L = new Level(def, b.end(1400), b.water);
  L.row(240, 8); L.arc(m.h + 40, 7, 420, 50, 50); L.sign(m.j + 40, 'swim2');
  const w1 = L.water[0]; L.plat(w1.x0 + 160, w1.top - 40, 140, 'raft'); L.plat(w1.x0 + 520, w1.top - 40, 140, 'raft');
  L.enemy('roboduck', w1.x0 + 450, { x0: w1.x0 + 60, x1: w1.x1 - 60, wy: w1.top, y: w1.top + 6 }); L.lineB(w1.x0 + 80, w1.top - 80, w1.x1 - 80, w1.top - 80, 9);
  L.dec('rowboat', w1.x0 + 700, { y: w1.top + 4 });
  L.row(m.shore + 40, 5); L.enemy('gull', m.shore + 250, { x0: m.shore + 40, x1: m.shore + 460, by: L.g(m.shore) - 130 }); L.check(m.shore + 400);
  L.row(m.ramp + 40, 4, 60, 40); L.lineB(m.ramp + 360, L.g(m.ramp) - 170, m.ramp + 600, L.g(m.ramp) - 120, 5);
  L.spring(m.bh + 90, 'up', 16); L.lineB(m.bh + 90, L.g(m.bh) - 90, m.bh + 90, L.g(m.bh) - 250, 5);
  const bhs = L.platG(m.bh + 200, 160, 300, 'shed'); L.lineB(bhs.x + 30, bhs.y - 40, bhs.x + 220, bhs.y - 40, 5); L.rosette(bhs.x + 272, bhs.y - 44, 0);
  L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12); L.check(m.loopF + 700);
  // the big swim
  const w2 = L.water[1]; L.sign(m.swim - 60, 'current');
  L.currents.push({ x0: w2.x0 + 600, x1: w2.x0 + 1600, vx: -0.9 });
  for (const ox of [380, 980, 1580]) { L.plat(w2.x0 + ox, w2.top - 40, 150, 'raft'); L.lineB(w2.x0 + ox + 20, w2.top - 80, w2.x0 + ox + 130, w2.top - 80, 3); }
  for (let x = w2.x0 + 120; x < w2.x1 - 60; x += 220) L.dec('buoy', x, { y: w2.top + 2 });
  L.lineB(w2.x0 + 60, w2.top + 20, w2.x1 - 80, w2.top + 20, 18);
  L.rosette(w2.x0 + 1250, w2.top + 106, 1);
  L.enemy('roboduck', w2.x0 + 500, { x0: w2.x0 + 200, x1: w2.x0 + 900, wy: w2.top, y: w2.top + 6 }); L.enemy('roboduck', w2.x0 + 1700, { x0: w2.x0 + 1400, x1: w2.x1 - 100, wy: w2.top, y: w2.top + 6 });
  L.check(m.s2 + 120); L.row(m.s2 + 200, 5);
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 400 + 50, 5, 300, 60, 50);
  L.enemy('gull', m.waves + 600, { x0: m.waves + 200, x1: m.waves + 1000, by: L.g(m.waves) - 160 }); L.enemy('nettles', m.f3 + 160, { w: 80, y: L.g(m.f3 + 160) });
  L.row(m.dip + 40, 16, 54, 36);
  L.sign(m.end + 40, 'spring'); L.spring(m.end + 110, 'right', 18);
  const jy = L.g(m.end + 500) - 170; L.plat(m.end + 320, jy, 600, 'plank'); L.lineB(m.end + 360, jy - 40, m.end + 820, jy - 40, 8); L.rosette(m.end + 880, jy - 50, 2);
  L.enemy('gull', m.end + 600, { x0: m.end + 300, x1: m.end + 1000, by: L.g(m.end) - 60 });
  L.fin(m.end + 1200);
  finishDecor(L, 41); return L;
}
function lvl32(def) {
  const b = new Builder(440), m = {};
  b.flat(800); m.b1 = b.x; b.pool(700, 140); m.w1 = b.x; b.flat(400); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(800);
  m.net = b.x; b.pool(1600, 150); m.w2 = b.x; b.flat(700); b.cliff(-90); m.quay = b.x; b.flat(600); b.cliff(90); m.w3 = b.x; b.flat(300);
  m.b3 = b.x; b.pool(900, 140); m.w4 = b.x; b.flat(400); m.waves = b.x; b.waves(1200, 60, 3); m.end = b.x; b.flat(1200);
  const L = new Level(def, b.end(1400), b.water);
  L.row(240, 8); L.sign(600, 'boat');
  const w1 = L.water[0]; boat(L, w1, 1, 240, 0.008); L.lineB(w1.x0 + 80, w1.top - 70, w1.x1 - 80, w1.top - 70, 7);
  L.enemy('crab', m.w1 + 200, { x0: m.w1 + 40, x1: m.w1 + 360 }); L.check(m.w1 + 380);
  L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12); L.check(m.loopF + 700);
  // haul the net float back to the fisherman
  const w2 = L.water[1]; L.sign(m.net - 70, 'net');
  L.retrieve(w2.x0 + 1100, m.w2 + 300, 'float', 0, true);
  boat(L, w2, 0.5, 240, 0.006);
  L.enemy('gull', w2.x0 + 700, { x0: w2.x0 + 100, x1: w2.x1 - 100, by: w2.top - 150 });
  L.lineB(w2.x0 + 80, w2.top - 70, w2.x0 + 900, w2.top - 70, 10);
  L.enemy('crab', m.w2 + 520, { x0: m.w2 + 420, x1: m.w2 + 660 }); L.check(m.w2 + 640);
  L.spring(m.quay + 100, 'up', 16); L.lineB(m.quay + 100, L.g(m.quay) - 90, m.quay + 100, L.g(m.quay) - 250, 5);
  const cy = L.g(m.quay) - 200; L.plat(m.quay + 200, cy, 380, 'girder'); L.lineB(m.quay + 240, cy - 40, m.quay + 480, cy - 40, 5); L.rosette(m.quay + 550, cy - 50, 2);
  L.dec('crate', m.quay + 300); L.dec('crate', m.quay + 340);
  const w3 = L.water[2]; L.currents.push({ x0: w3.x0 + 100, x1: w3.x1 - 100, vx: -0.7 }); L.rosette(w3.x0 + 700, w3.top + 96, 1);
  L.lineB(w3.x0 + 100, w3.top + 96, w3.x0 + 600, w3.top + 96, 5); L.plat(w3.x0 + 350, w3.top - 40, 140, 'raft');
  L.row(m.w4 + 40, 6);
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 400 + 50, 5, 300, 60, 50);
  L.enemy('crab', m.waves + 420, { x0: m.waves + 330, x1: m.waves + 560 }); L.enemy('crab', m.waves + 830, { x0: m.waves + 730, x1: m.waves + 960 });
  L.enemy('gull', m.end + 400, { x0: m.end + 100, x1: m.end + 800, by: L.g(m.end) - 120 });
  L.row(m.end + 60, 10, 60, 40);
  L.fin(m.end + 1000);
  finishDecor(L, 42); return L;
}
function lvl3B(def) {
  const b = new Builder(440); b.flat(900); const x0 = b.x; b.flat(260); b.pool(1100, 150); b.flat(260); const x1 = b.x; b.cliff(-520); b.flat(400);
  const L = new Level(def, b.end(600), b.water);
  L.row(200, 10); L.check(650); L.sign(800, 'boss3');
  const w = L.water[0]; L.plat(w.x0 + 250, w.top - 56, 150, 'raft'); L.plat(w.x0 + 700, w.top - 56, 150, 'raft');
  L.row(x0 + 40, 4, 44, 40); L.row(x1 - 220, 4, 44, 40);
  L.boss = { type: 'speedboat', hp: 4, x0, x1, name: 'Magpie in a Speedboat' };
  L.maxX = x1 + 200; finishDecor(L, 43); L.decor = L.decor.filter(d => d.x < x0 - 30); return L;
}
// ---------- World 4: Shooting Field ----------
function lvl41(def) {
  const b = new Builder(440), m = {};
  b.flat(800); m.h = b.x; b.hill(600, 60); m.w = b.x; b.flat(700); m.dip = b.x; b.dip(600, 80); m.r1 = b.x; b.flat(600);
  m.ramp = b.x; b.ramp(300, 90); b.cliff(90); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(800); m.st = b.x; b.pool(500, 110);
  m.f5 = b.x; b.flat(700); m.waves = b.x; b.waves(1400, 60, 3); m.f6 = b.x; b.flat(400); m.end = b.x; b.flat(1300);
  const L = new Level(def, b.end(1400), b.water);
  L.row(240, 8); L.sign(560, 'whistle');
  L.arc(m.h + 40, 8, 520, 60, 50); L.enemy('pheasant', m.h + 300, { x0: m.h + 200, x1: m.h + 420 });
  L.whistle(m.w + 200); L.enemy('brambles', m.w + 600, { w: 80, y: L.g(m.w + 600) }); L.row(m.w + 360, 3);
  L.row(m.dip + 40, 10, 56, 36);
  // marked retrieve: the handler is behind you
  L.sign(m.r1 + 60, 'retrieve'); L.retrieve(m.r1 + 470, m.r1 + 150, 'dummy', 0); L.check(m.r1 + 560);
  L.row(m.ramp + 40, 4, 60, 40); L.lineB(m.ramp + 360, L.g(m.ramp) - 170, m.ramp + 600, L.g(m.ramp) - 120, 5);
  L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12); L.check(m.loopF + 700);
  // water retrieve across the stream
  const w = L.water[0]; L.retrieve(w.x0 + 300, m.f5 + 260, 'dummy', 1, true); L.lineB(w.x0 + 80, w.top - 70, w.x1 - 80, w.top - 70, 5);
  L.whistle(m.f5 + 420); L.enemy('drone', m.f5 + 500, { x0: m.f5 + 300, x1: m.f5 + 680, by: L.g(m.f5) - 140 });
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 466 + 60, 5, 330, 60, 50);
  L.enemy('pheasant', m.waves + 500, { x0: m.waves + 400, x1: m.waves + 620 }); L.enemy('brambles', m.waves + 940, { w: 90, y: L.g(m.waves + 940) });
  L.dec('tree', m.waves + 1200, { s: 1.1 }); L.enemy('squirrel', m.waves + 1200, { y: L.g(m.waves + 1200) - 90 });
  L.check(m.f6 + 200);
  for (let i = 0; i < 5; i++) L.plat(m.end + 300 + i * 44, L.g(m.end) - 34 * (i + 1), 76, 'bale');
  L.rosette(m.end + 520, L.g(m.end) - 220, 2); L.enemy('drone', m.end + 800, { x0: m.end + 600, x1: m.end + 1100, by: L.g(m.end) - 110 });
  L.enemy('pheasant', m.end + 900, { x0: m.end + 820, x1: m.end + 1000 });
  L.fin(m.end + 1200);
  finishDecor(L, 51); return L;
}
function lvl42(def) {
  const b = new Builder(440), m = {};
  b.flat(700); m.h = b.x; b.hill(500, 70); m.f1 = b.x; b.flat(500); m.st = b.x; b.pool(400, 100); m.f2 = b.x; b.flat(500);
  b.cliff(-90); m.bank = b.x; b.flat(500); b.cliff(90); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(800); m.dip = b.x; b.dip(800, 140);
  m.blind = b.x; b.flat(1000); m.waves = b.x; b.waves(1200, 70, 3); m.f3 = b.x; b.flat(400); m.pond = b.x; b.pool(600, 120); m.end = b.x; b.flat(1300);
  const L = new Level(def, b.end(1400), b.water);
  L.row(240, 8); L.arc(m.h + 40, 7, 420, 70, 50);
  L.whistle(m.f1 + 120); L.dec('tree', m.f1 + 380, { s: 1.1 }); L.enemy('squirrel', m.f1 + 380, { y: L.g(m.f1 + 380) - 90 });
  const w = L.water[0]; L.plat(w.x0 + 60, w.top - 34, 280, 'log'); L.row(w.x0 + 80, 5, 50, 70);
  L.enemy('brambles', m.f2 + 240, { w: 90, y: L.g(m.f2 + 240) }); L.enemy('drone', m.f2 + 300, { x0: m.f2 + 100, x1: m.f2 + 460, by: L.g(m.f2) - 150 }); L.check(m.f2 + 420);
  L.plat(m.bank + 100, L.g(m.bank) - 90, 140, 'log'); L.plat(m.bank + 300, L.g(m.bank) - 150, 140, 'log'); L.lineB(m.bank + 300, L.g(m.bank) - 190, m.bank + 430, L.g(m.bank) - 190, 3);
  L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12); L.check(m.loopF + 700);
  L.row(m.dip + 40, 14, 54, 36);
  // blind retrieve: the dummy is hidden in the long grass
  L.sign(m.blind + 40, 'blind'); L.retrieve(m.blind + 760, m.blind + 160, 'dummy', 0);
  for (const ox of [700, 740, 790, 830]) L.fr('bush', m.blind + ox, { s: 0.75 });
  L.enemy('pheasant', m.blind + 450, { x0: m.blind + 380, x1: m.blind + 560 });
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 400 + 50, 5, 300, 70, 50);
  L.enemy('brambles', m.waves + 420, { w: 80, y: L.g(m.waves + 420) }); L.enemy('drone', m.waves + 800, { x0: m.waves + 600, x1: m.waves + 1100, by: L.g(m.waves) - 160 });
  L.whistle(m.f3 + 100); L.check(m.f3 + 360);
  const w2 = L.water[1]; L.rosette(w2.x0 + 480, w2.top + 86, 1); L.lineB(w2.x0 + 80, w2.top + 86, w2.x0 + 400, w2.top + 86, 5);
  L.spring(m.end + 140, 'up', 16); L.lineB(m.end + 140, L.g(m.end) - 90, m.end + 140, L.g(m.end) - 250, 5);
  const ly = L.g(m.end) - 200; L.plat(m.end + 240, ly, 260, 'log'); L.plat(m.end + 580, ly - 30, 260, 'log'); L.rosette(m.end + 800, ly - 76, 2);
  L.enemy('pheasant', m.end + 700, { x0: m.end + 600, x1: m.end + 900 });
  L.fin(m.end + 1150);
  finishDecor(L, 52); return L;
}
function lvl4B(def) {
  const b = new Builder(440); b.flat(900); const x0 = b.x; b.flat(1100); const x1 = b.x; b.cliff(-520); b.flat(400);
  const L = new Level(def, b.end(600), b.water);
  L.row(200, 10); L.check(650); L.sign(800, 'boss4');
  L.plat(x0 + 300, L.g(x0) - 34, 90, 'bale'); L.plat(x1 - 390, L.g(x0) - 34, 90, 'bale');
  L.row(x0 + 60, 4, 44, 40); L.row(x1 - 240, 4, 44, 40);
  L.boss = { type: 'claytrap', hp: 4, x0, x1, name: 'Runaway Clay Trap' };
  L.maxX = x1 + 200; finishDecor(L, 53); L.decor = L.decor.filter(d => d.x < x0 - 30); return L;
}
// ---------- Christmas special ----------
function lvlX1(def) {
  const b = new Builder(440), m = {};
  b.flat(800); m.h = b.x; b.hill(500, 60); m.f1 = b.x; b.flat(500); m.ice1 = b.x; b.flat(900); m.f2 = b.x; b.flat(300);
  m.sled = b.x; b.curve(1200, -260); m.pad = b.x; b.flat(300); m.loopF = b.x; b.flat(800); m.ice2 = b.x; b.flat(1000);
  m.waves = b.x; b.waves(1200, 60, 3); m.f3 = b.x; b.flat(400); m.ramp = b.x; b.ramp(300, 100); b.cliff(100); m.end = b.x; b.flat(1300);
  const L = new Level(def, b.end(1400), b.water);
  L.row(240, 6); L.sign(520, 'xmas'); L.present(640, L.g(640) - 60);
  L.arc(m.h + 40, 7, 420, 60, 50); L.present(m.h + 250, L.g(m.h + 250) - 130);
  L.enemy('snowbot', m.f1 + 300, {}); L.present(m.f1 + 420, L.g(m.f1) - 50);
  L.ice.push({ x0: m.ice1, x1: m.ice1 + 900 }); L.sign(m.ice1 - 60, 'ice'); L.present(m.ice1 + 450, L.g(m.ice1) - 50); L.row(m.ice1 + 100, 8, 90, 40);
  L.dec('xtree', m.f2 + 150, { s: 1.1 }); L.check(m.f2 + 240);
  L.row(m.sled + 40, 18, 60, 40); L.present(m.sled + 700, L.g(m.sled + 700) - 120);
  L.pad(m.pad + 40); L.loop(m.loopF + 240, 120); L.circleB(m.loopF + 240, L.g(m.loopF + 240) - 120, 92, 12); L.present(m.loopF + 240, L.g(m.loopF + 240) - 240); L.check(m.loopF + 700);
  L.ice.push({ x0: m.ice2, x1: m.ice2 + 1000 }); L.enemy('snowbot', m.ice2 + 500, {}); L.present(m.ice2 + 250, L.g(m.ice2) - 50); L.present(m.ice2 + 800, L.g(m.ice2) - 50);
  for (let i = 0; i < 3; i++) L.arc(m.waves + i * 400 + 50, 5, 300, 60, 50);
  L.enemy('hoover', m.waves + 600, { x0: m.waves + 450, x1: m.waves + 760 }); L.present(m.waves + 1000, L.g(m.waves + 1000) - 150);
  L.check(m.f3 + 200); L.row(m.ramp + 40, 4, 60, 40); L.present(m.ramp + 520, L.g(m.ramp) - 200);
  L.spring(m.end + 160, 'up', 16);
  const ry = L.g(m.end) - 190; L.plat(m.end + 260, ry, 300, 'shed'); L.present(m.end + 520, ry - 40); L.lineB(m.end + 290, ry - 40, m.end + 470, ry - 40, 4);
  L.enemy('snowbot', m.end + 760, {}); L.present(m.end + 950, L.g(m.end) - 50);
  L.dec('xtree', m.end + 1100, { s: 1.4 });
  L.fin(m.end + 1200);
  finishDecor(L, 61); return L;
}

const STAGES = [
  { id: '1-1', world: 1, act: 'Act 1', name: 'Back Garden', build: () => lvl11({ id: '1-1', world: 1 }) },
  { id: '1-2', world: 1, act: 'Act 2', name: 'Village Green', build: () => lvl12({ id: '1-2', world: 1 }) },
  { id: '1-B', world: 1, act: 'Boss', name: 'Robo-Mower', boss: true, build: () => lvl1B({ id: '1-B', world: 1 }) },
  { id: '2-1', world: 2, act: 'Act 1', name: 'Towpath', build: () => lvl21({ id: '2-1', world: 2 }) },
  { id: '2-2', world: 2, act: 'Act 2', name: 'Lock Flight', build: () => lvl22({ id: '2-2', world: 2 }) },
  { id: '2-B', world: 2, act: 'Boss', name: 'Magpie on the Narrowboat', boss: true, build: () => lvl2B({ id: '2-B', world: 2 }) },
  { id: '3-1', world: 3, act: 'Act 1', name: 'Lakeside', build: () => lvl31({ id: '3-1', world: 3 }) },
  { id: '3-2', world: 3, act: 'Act 2', name: 'St John’s Harbour', build: () => lvl32({ id: '3-2', world: 7 }) },
  { id: '3-B', world: 3, act: 'Boss', name: 'Magpie in a Speedboat', boss: true, build: () => lvl3B({ id: '3-B', world: 3 }) },
  { id: '4-1', world: 4, act: 'Act 1', name: 'The Stubble Field', build: () => lvl41({ id: '4-1', world: 4 }) },
  { id: '4-2', world: 4, act: 'Act 2', name: 'Woodland Drive', build: () => lvl42({ id: '4-2', world: 4 }) },
  { id: '4-B', world: 4, act: 'Boss', name: 'Runaway Clay Trap', boss: true, build: () => lvl4B({ id: '4-B', world: 4 }) },
  { id: '5-1', world: 5, act: 'Act 1', name: 'Benching Tent', build: () => lvl51({ id: '5-1', world: 5 }) },
  { id: '5-2', world: 5, act: 'Act 2', name: 'The Big Ring', build: () => lvl52({ id: '5-2', world: 5 }) },
  { id: '5-B', world: 5, act: 'Boss', name: 'Marquee Rooftops', boss: true, build: () => lvl5B({ id: '5-B', world: 5 }) },
  { id: 'X-1', world: 6, act: 'Special', name: 'Christmas Walk', special: true, build: () => lvlX1({ id: 'X-1', world: 6 }) }
];
const MAIN_STAGES = STAGES.filter(s => !s.special);

// Club target times in seconds. To run "Beat the committee", add entries such as ['Your name', 31].
const CLUB_TIMES = {
  '1-1': [['Club target', 34]], '1-2': [['Club target', 42]], '1-B': [['Club target', 30]],
  '2-1': [['Club target', 50]], '2-2': [['Club target', 50]], '2-B': [['Club target', 75]],
  '3-1': [['Club target', 40]], '3-2': [['Club target', 36]], '3-B': [['Club target', 45]],
  '4-1': [['Club target', 40]], '4-2': [['Club target', 40]], '4-B': [['Club target', 35]],
  '5-1': [['Club target', 36]], '5-2': [['Club target', 45]], '5-B': [['Club target', 80]],
  'X-1': [['Club target', 32]]
};

const FACTS = {
  '1-1-0': ['Where Labradors began', 'Labradors trace back to Newfoundland in Canada, where their ancestors, the St John’s water dogs, helped fishermen haul in nets and fish.'],
  '1-1-1': ['Made in Britain', 'In the 1800s, British breeders, including the Earls of Malmesbury, developed those water dogs into the Labrador Retriever we know today.'],
  '1-1-2': ['Officially a breed', 'The Kennel Club recognised the Labrador Retriever as a breed in its own right in 1903.'],
  '1-2-0': ['Three colours', 'Labradors come in black, yellow and chocolate (also called liver). Yellows range from pale cream to fox red.'],
  '1-2-1': ['The otter tail', 'A Labrador’s thick, tapering “otter” tail works like a rudder, helping it steer when swimming.'],
  '1-2-2': ['Built for water', 'A short, dense coat over a weather-resistant undercoat helps keep a Labrador warm and dry in cold water.'],
  '2-1-0': ['Webbed feet', 'Labradors have webbing between their toes, which helps them paddle strongly.'],
  '2-1-1': ['A soft mouth', 'Labradors are gundogs, bred to retrieve on land and water and carry game gently without damaging it. This is called a “soft mouth”.'],
  '2-1-2': ['Field trials', 'At field trials, gundogs are judged on how well they mark, find and retrieve, and on how steady and obedient they are.'],
  '2-2-0': ['Yellow genes', 'Two yellow Labradors normally have only yellow puppies, because the gene for yellow is recessive.'],
  '2-2-1': ['A chocolate puzzle', 'Two chocolate Labradors can have chocolate or yellow puppies, but never black ones.'],
  '2-2-2': ['Always hungry?', 'Scientists at the University of Cambridge found some Labradors carry a gene change linked to feeling hungrier. Keep an eye on those biscuits!'],
  '3-1-0': ['Blue-green algae', 'Keep dogs out of water with blue-green algae. It can be very poisonous to dogs, so look out for warning signs at lakes and ponds.'],
  '3-1-1': ['Ear care', 'After a swim, dry your Labrador’s ears well. Floppy ears can trap moisture, which can lead to ear infections.'],
  '3-1-2': ['Healthy hips', 'Responsible breeders have their Labradors’ hips and elbows X-rayed and scored before breeding, to help reduce inherited joint problems.'],
  '3-2-0': ['Newfoundland, not Labrador', 'Despite the name, Labradors’ ancestors came from the island of Newfoundland. Today it shares a Canadian province with the Labrador region.'],
  '3-2-1': ['A water dog family', 'The St John’s water dog, now extinct, was also an ancestor of other retrievers, including the Flat-coated and Golden Retriever.'],
  '3-2-2': ['Eye tests', 'Breeders also eye-test their Labradors for inherited conditions such as progressive retinal atrophy (PRA).'],
  '4-1-0': ['Delivered to hand', 'A well-trained retriever brings game straight back and gives it gently into the handler’s hand, rather than dropping it.'],
  '4-1-1': ['Marking', 'Marking means watching where a bird falls and remembering the spot, so the dog can go straight to it.'],
  '4-1-2': ['Steady!', 'A steady gundog waits calmly beside its handler until it is sent, even when birds are flying and guns are firing.'],
  '4-2-0': ['Blind retrieves', 'On a blind retrieve the dog did not see the fall, so the handler guides it with whistle and hand signals.'],
  '4-2-1': ['The stop whistle', 'Many handlers use a single blast on the whistle to tell their gundog to stop, sit and look back for directions.'],
  '4-2-2': ['Champion or Show Champion?', 'A gundog with three Challenge Certificates under three different judges becomes a Show Champion. To be a full Champion it also needs a working qualification.'],
  '5-1-0': ['Helping hands', 'Labradors are among the most popular breeds for guide dogs and other assistance dogs, thanks to their gentle, willing nature.'],
  '5-1-1': ['Super sniffers', 'Their keen noses make Labradors excellent detection dogs, working with police, customs and search teams.'],
  '5-1-2': ['Microchips', 'In Great Britain, puppies must be microchipped by the time they are eight weeks old.'],
  '5-2-0': ['The Breed Standard', 'Show judges assess each dog against the Breed Standard, a written description of the ideal Labrador.'],
  '5-2-1': ['Ideal height', 'The Kennel Club Breed Standard gives an ideal height at the withers of 56–57 cm for dogs and 55–56 cm for bitches.'],
  '5-2-2': ['Showing movement', 'In the ring, a handler stands the dog to show its outline, then moves it so the judge can see its free, powerful movement.'],
  'club': ['Est. 1946', 'The Midland Counties Labrador Retriever Club was founded in 1946 to champion the breed in the Midlands. Thank you for playing!']
};
