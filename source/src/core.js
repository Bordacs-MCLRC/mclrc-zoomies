// ===================== core: utils, save, input, sound =====================
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const sign = v => v < 0 ? -1 : v > 0 ? 1 : 0;
function mkRng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const smooth = t => t * t * (3 - 2 * t);
const easeIn = t => t * t;
const easeOut = t => 1 - (1 - t) * (1 - t);

// ---------- save ----------
const SAVE_KEY = 'zoomies-mclrc-v1';
const Save = {
  data: null,
  defaults() {
    let reduced = false;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    return { colour: 'black', easy: null, gentle: false, slow: false, reduced, music: true, sfx: true,
      stages: {}, facts: {}, seenIntro: false, finished: false };
  },
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { d = null; }
    this.data = Object.assign(this.defaults(), d && typeof d === 'object' ? d : {});
    if (!this.data.stages || typeof this.data.stages !== 'object') this.data.stages = {};
    if (!this.data.facts || typeof this.data.facts !== 'object') this.data.facts = {};
  },
  store() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) {} },
  stage(id) { return this.data.stages[id] || (this.data.stages[id] = { done: false, best: 0, score: 0 }); },
  reset() { const keep = { colour: this.data.colour, easy: this.data.easy, music: this.data.music, sfx: this.data.sfx };
    this.data = Object.assign(this.defaults(), keep); this.store(); }
};

// ---------- input ----------
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowDown: 'down', KeyS: 'down',
  Space: 'jump', KeyZ: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyK: 'jump',
  ShiftLeft: 'zoom', ShiftRight: 'zoom', KeyX: 'zoom', KeyJ: 'zoom',
  Escape: 'pause', KeyP: 'pause', Enter: 'confirm'
};
const Input = {
  k: {}, t: { left: 0, right: 0, down: 0, jump: 0, zoom: 0, tap: 0 }, prev: {}, cur: {}, pressed: {},
  mode: 'keys', override: null, padIdx: -1,
  init() {
    try { if (matchMedia('(pointer: coarse)').matches) this.mode = 'touch'; } catch (e) {}
    addEventListener('keydown', e => {
      const a = KEYMAP[e.code]; if (!a) return;
      if (Game.state === 'play' && a !== 'confirm') e.preventDefault();
      if (!e.repeat) { this.k[a] = 1; }
      if (this.mode !== 'keys') { this.mode = 'keys'; UI.syncTouch(); }
    });
    addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (a) this.k[a] = 0; });
    addEventListener('blur', () => { this.k = {}; for (const n in this.t) this.t[n] = 0; });
    addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && this.mode !== 'touch') { this.mode = 'touch'; UI.syncTouch(); } }, true);
    // touch buttons
    $$('[data-tb]').forEach(el => {
      const a = el.dataset.tb; const ids = new Set();
      const on = e => { e.preventDefault(); ids.add(e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (_) {} this.t[a] = 1; el.classList.add('dn'); Sound.init(); };
      const off = e => { ids.delete(e.pointerId); if (!ids.size) { this.t[a] = 0; el.classList.remove('dn'); } };
      el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off);
      el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
    });
    const tapLayer = $('#taplayer');
    tapLayer.addEventListener('pointerdown', e => { e.preventDefault(); this.t.tap = 1; Sound.init(); });
    const tapOff = () => { this.t.tap = 0; };
    tapLayer.addEventListener('pointerup', tapOff); tapLayer.addEventListener('pointercancel', tapOff);
  },
  poll() {
    const k = this.k, t = this.t;
    const c = { left: !!(k.left || t.left), right: !!(k.right || t.right), down: !!(k.down || t.down),
      jump: !!(k.jump || t.jump || t.tap), zoom: !!(k.zoom || t.zoom), pause: !!k.pause, confirm: !!k.confirm };
    let pads = [];
    try { pads = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { pads = []; }
    for (const p of pads) {
      if (!p || !p.connected) continue;
      const b = i => p.buttons[i] && p.buttons[i].pressed;
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      const any = b(0) || b(1) || b(2) || b(3) || b(9) || b(12) || b(13) || b(14) || b(15) || Math.abs(ax) > 0.5;
      if (any && this.mode !== 'pad') { this.mode = 'pad'; UI.syncTouch(); }
      if (ax < -0.4 || b(14)) c.left = true;
      if (ax > 0.4 || b(15)) c.right = true;
      if (ay > 0.6 || b(13)) c.down = true;
      if (b(0) || b(3)) c.jump = true;
      if (b(1) || b(2) || b(5) || b(7)) c.zoom = true;
      if (b(9)) c.pause = true;
      if (b(0)) c.confirm = true;
    }
    if (this.override) Object.assign(c, this.override);
    const pr = {};
    for (const n in c) pr[n] = c[n] && !this.prev[n];
    this.pressed = pr; this.prev = c; this.cur = c;
  },
  clear() { this.k = {}; for (const n in this.t) this.t[n] = 0; $$('[data-tb]').forEach(el => el.classList.remove('dn')); }
};

// ---------- sound (all synthesised, no audio files) ----------
const Sound = (() => {
  let ctx = null, master, sfxG, musG, noiseBuf = null, mus = null;
  const S = {};
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  S.init = () => {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
      sfxG = ctx.createGain(); sfxG.connect(master); musG = ctx.createGain(); musG.connect(master);
      const len = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      S.apply(); S.loadBark();
      if (S.pending) { const p = S.pending; S.pending = null; S.music(p); }
    } catch (e) { ctx = null; }
  };
  S.barkBuf = null;
  S.loadBark = () => {
    try { if (location.protocol === 'file:') return; fetch('bark.mp3').then(r => r.ok ? r.arrayBuffer() : Promise.reject(0)).then(b => new Promise((res, rej) => ctx.decodeAudioData(b, res, rej))).then(buf => { S.barkBuf = buf; }).catch(() => {}); } catch (e) {}
  };
  S.apply = () => { if (!ctx) return; sfxG.gain.value = Save.data.sfx ? 0.55 : 0; musG.gain.value = Save.data.music ? 0.26 : 0; };
  function tone(f, d, type, v, f2, t0, dest) {
    if (!ctx) return; const t = t0 == null ? ctx.currentTime : t0;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || sfxG); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(d, v, freq, ftype, t0, f2, dest) {
    if (!ctx) return; const t = t0 == null ? ctx.currentTime : t0;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = ftype || 'lowpass'; f.frequency.setValueAtTime(freq || 1000, t);
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + d);
    const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(dest || sfxG); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
  }
  const last = {};
  S.play = name => {
    if (!ctx || !Save.data.sfx) return;
    const now = ctx.currentTime;
    if (last[name] && now - last[name] < 0.035) return; last[name] = now;
    switch (name) {
      case 'jump': tone(330, 0.14, 'square', 0.12, 700); break;
      case 'biscuit': tone(1320, 0.06, 'square', 0.07); tone(1980, 0.12, 'square', 0.06, null, now + 0.05); noise(0.04, 0.05, 3000, 'highpass'); break;
      case 'rosette': [72, 76, 79, 84, 88].forEach((m, i) => tone(mtof(m), 0.25, 'triangle', 0.16, null, now + i * 0.07)); break;
      case 'bounce': tone(220, 0.18, 'square', 0.12, 520); break;
      case 'spring': tone(260, 0.32, 'sine', 0.2, 1100); tone(520, 0.2, 'square', 0.05, 1500); break;
      case 'hurt': tone(520, 0.35, 'sawtooth', 0.13, 140); break;
      case 'oops': tone(392, 0.18, 'triangle', 0.16); tone(311, 0.18, 'triangle', 0.16, null, now + 0.18); tone(262, 0.4, 'triangle', 0.16, null, now + 0.36); break;
      case 'splash': noise(0.45, 0.28, 1800, 'lowpass', null, 300); break;
      case 'plip': noise(0.12, 0.12, 2500, 'bandpass'); break;
      case 'bark':
        if (S.barkBuf) { const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = S.barkBuf; src.playbackRate.value = 0.95 + Math.random() * 0.1; g.gain.value = 0.9; src.connect(g); g.connect(sfxG); src.start(); break; }
        [0, 0.16].forEach(dt => { tone(240, 0.11, 'sawtooth', 0.12, 120, now + dt); noise(0.08, 0.1, 700, 'bandpass', now + dt); }); break;
      case 'whistle': tone(2600, 0.45, 'sine', 0.14, 2500); tone(2610, 0.45, 'sine', 0.06, 2480); break;
      case 'pippip': tone(2600, 0.1, 'sine', 0.14); tone(2600, 0.1, 'sine', 0.14, null, now + 0.16); break;
      case 'present': [79, 84, 88, 91].forEach((m, i) => tone(mtof(m), 0.18, 'triangle', 0.12, null, now + i * 0.05)); noise(0.2, 0.04, 9000, 'highpass'); break;
      case 'fire': noise(0.15, 0.2, 600, 'lowpass'); tone(160, 0.12, 'square', 0.1, 80); break;
      case 'engine': tone(90, 0.18, 'sawtooth', 0.05, 110); break;
      case 'pole': tone(700, 0.08, 'square', 0.07, 300); noise(0.1, 0.08, 2000, 'bandpass'); break;
      case 'zoom': tone(180, 0.55, 'sawtooth', 0.09, 1300); tone(360, 0.5, 'square', 0.05, 1800); break;
      case 'honk': tone(300, 0.22, 'square', 0.1, 260); tone(306, 0.22, 'sawtooth', 0.06, 250); break;
      case 'squawk': [0, 0.11].forEach(dt => { tone(1100, 0.08, 'sawtooth', 0.08, 700, now + dt); noise(0.06, 0.08, 2500, 'bandpass', now + dt); }); break;
      case 'check': tone(mtof(84), 0.15, 'triangle', 0.16); tone(mtof(91), 0.3, 'triangle', 0.16, null, now + 0.1); break;
      case 'dash': noise(0.25, 0.12, 600, 'bandpass', null, 3000); tone(400, 0.25, 'square', 0.06, 900); break;
      case 'break': noise(0.25, 0.2, 1200, 'lowpass', null, 200); tone(180, 0.2, 'square', 0.1, 60); break;
      case 'bosshit': noise(0.3, 0.25, 900, 'lowpass', null, 150); tone(140, 0.3, 'square', 0.14, 50); break;
      case 'skid': noise(0.18, 0.08, 4000, 'highpass'); break;
      case 'clear': [67, 72, 76, 79, 84].forEach((m, i) => { tone(mtof(m), 0.3, 'square', 0.08, null, now + i * 0.12); tone(mtof(m - 12), 0.3, 'triangle', 0.12, null, now + i * 0.12); }); break;
      case 'click': tone(880, 0.05, 'square', 0.05); break;
      case 'judge': [76, 79, 83].forEach((m, i) => tone(mtof(m), 0.2, 'triangle', 0.12, null, now + i * 0.08)); break;
      case 'can': tone(900, 0.1, 'square', 0.05, 600); noise(0.08, 0.08, 5000, 'highpass'); break;
    }
  };
  // ---- music ----
  const parse = s => s.trim().split(/\s+/).map(tok => {
    if (tok === '-') return 0; if (tok === '~') return -1;
    const m = tok.match(/^([A-G])(#|b)?(\d)$/); if (!m) return 0;
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    return 12 * (parseInt(m[3]) + 1) + base;
  });
  const chord = s => { const m = s.match(/^([A-G])(#|b)?(m?)$/); const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return { root: 48 + base, minor: !!m[3] }; };
  const TR = {
    title: { bpm: 104, chords: 'C Am F G', lead: 'E5 ~ G5 ~ C6 ~ ~ ~ B5 ~ G5 ~ E5 ~ ~ ~ C5 ~ E5 ~ A5 ~ ~ ~ G5 ~ E5 ~ C5 ~ ~ ~ A4 ~ C5 ~ F5 ~ ~ ~ E5 ~ C5 ~ A4 ~ ~ ~ B4 ~ D5 ~ G5 ~ ~ ~ F5 ~ D5 ~ B4 ~ ~ ~', bass: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], kick: [], snare: [], hat: 4, stab: [4, 12] },
    w1: { bpm: 140, chords: 'C Am F G C Am F G', lead: 'E5 - G5 - C6 - G5 - A5 G5 E5 - D5 - E5 - C5 - E5 - A5 - E5 - G5 E5 C5 - D5 ~ ~ - F5 - A5 - C6 - A5 - D6 C6 A5 - G5 - F5 - G5 - B5 - D6 - B5 - C6 - B5 - G5 ~ ~ - E5 - G5 - C6 - E6 - D6 C6 B5 - C6 - G5 - A5 - C6 - E6 - C6 - D6 ~ C6 - A5 ~ ~ - F5 - A5 - C6 - F6 - E6 - D6 - C6 - A5 - B5 - D6 - G5 - B5 - D6 - - - G6 ~ ~ ~', bass: [1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0], kick: [0, 8], snare: [4, 12], hat: 2, stab: [2, 6, 10, 14] },
    w2: { bpm: 118, chords: 'Dm Bb F C Dm Bb C C', lead: 'D5 - F5 - A5 ~ ~ - G5 - F5 - E5 - D5 - F5 ~ ~ - D5 - F5 - Bb5 - A5 - G5 ~ ~ - A5 - C6 - A5 - F5 - G5 - A5 - C6 ~ ~ - G5 - E5 - C5 - E5 - G5 ~ ~ ~ - - - - D5 - F5 - A5 - D6 ~ C6 - A5 - F5 - G5 - A5 ~ ~ - Bb5 - A5 - G5 - F5 ~ ~ - E5 - G5 - C6 ~ ~ - Bb5 - A5 - G5 - E5 - C5 - D5 - E5 - G5 - - - - - - - -', bass: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0], kick: [0, 7, 8], snare: [4, 12], hat: 2, stab: [4, 12] },
    w5: { bpm: 150, chords: 'G Em C D G Em C D', lead: 'D5 - G5 - B5 - D6 - B5 - G5 - B5 - D6 - E5 - G5 - B5 ~ ~ - A5 - G5 - E5 ~ ~ - C5 - E5 - G5 - C6 - B5 - A5 - G5 - E5 - F#5 - A5 - D6 ~ ~ - C6 - A5 - F#5 ~ ~ - G5 - B5 - D6 - G6 - F#6 - E6 - D6 - B5 - E6 - D6 - B5 - G5 - A5 - B5 - G5 ~ - C6 - E6 - G6 - E6 - D6 - C6 - B5 - A5 - D6 ~ ~ - F#6 ~ ~ - A6 ~ ~ ~ - - - -', bass: [1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0], kick: [0, 4, 8, 12], snare: [4, 12], hat: 2, stab: [2, 6, 10, 14] },
    w3: { bpm: 112, chords: 'D G A D Bm G A D', lead: 'A4 - D5 - D5 - F#5 - A5 ~ ~ - F#5 - D5 - B4 - D5 - G5 ~ ~ - F#5 - E5 - D5 - B4 - C#5 - E5 - A5 ~ ~ - G5 - F#5 - E5 - C#5 - D5 ~ ~ - F#5 ~ ~ - A5 ~ ~ ~ - - - - B4 - D5 - F#5 - B5 ~ ~ - A5 - F#5 - D5 - G4 - B4 - D5 - G5 ~ ~ - F#5 - E5 - D5 - E5 - F#5 - G5 - A5 - B5 - A5 - G5 - E5 - D5 ~ ~ ~ A4 ~ ~ ~ D5 ~ ~ ~ - - - -', bass: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0], kick: [0, 6, 8], snare: [4, 12], hat: 2, stab: [4, 12] },
    w4: { bpm: 128, chords: 'G C D G Em C D G', lead: 'G4 - B4 - D5 - G5 - F#5 - E5 - D5 - B4 - C5 - E5 - G5 ~ ~ - E5 - C5 - E5 - G5 - D5 - F#5 - A5 - F#5 - D5 - A4 - D5 - F#5 - G5 ~ ~ - D5 ~ ~ - B4 ~ ~ ~ - - - - E5 - G5 - B5 - G5 - E5 - B4 - E5 - G5 - C6 ~ ~ - B5 - A5 - G5 - E5 - C5 - E5 - D5 - E5 - F#5 - G5 - A5 - B5 - C6 - A5 - G5 ~ ~ ~ D5 ~ ~ ~ G4 ~ ~ ~ - - - -', bass: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], kick: [0, 8], snare: [4, 12], hat: 2, stab: [2, 6, 10, 14] },
    xmas: { bpm: 132, chords: 'C Am F G C F G C', lead: 'G5 - E5 - C5 - E5 - G5 ~ ~ - A5 - G5 - E5 - C5 - A4 - C5 - E5 ~ ~ ~ - - - - F5 - A5 - C6 - A5 - G5 - F5 - E5 - D5 - D5 - G5 - B5 ~ ~ - A5 - G5 ~ ~ ~ - - C6 - B5 - A5 - G5 - E5 - G5 - C6 ~ ~ - A5 - F5 - A5 - C6 - D6 ~ ~ - C6 - A5 - G5 - A5 - B5 - D6 - B5 - G5 - A5 - B5 - C6 ~ ~ ~ G5 ~ ~ ~ C6 ~ ~ ~ - - - -', bass: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], kick: [0, 8], snare: [4, 12], hat: 1, stab: [2, 6, 10, 14] },
    boss: { bpm: 160, chords: 'Am F G E Am F G E', lead: 'A4 A4 C5 A4 E5 - A4 - D5 C5 B4 C5 A4 - - - A4 A4 C5 A4 F5 - A4 - E5 D5 C5 D5 A4 - - - B4 B4 D5 B4 G5 - B4 - F5 E5 D5 E5 B4 - - - G#4 B4 E5 G#5 B5 ~ ~ - G#5 ~ E5 ~ B4 ~ ~ ~ A5 - E5 - C5 - E5 - A5 - G5 - F5 - E5 - F5 - C5 - A4 - C5 - F5 - E5 - D5 - C5 - D5 - B4 - G4 - B4 - D5 - F5 - E5 - D5 - E5 ~ ~ ~ G#5 ~ ~ ~ B5 ~ ~ ~ E6 ~ ~ ~', bass: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], kick: [0, 4, 8, 12], snare: [4, 12], hat: 1, stab: [] },
    win: { bpm: 132, chords: 'C F G C', lead: 'G5 ~ C6 ~ E6 ~ G6 ~ ~ ~ E6 ~ G6 ~ ~ ~ A5 ~ C6 ~ F6 ~ A6 ~ ~ ~ F6 ~ A6 ~ ~ ~ B5 ~ D6 ~ G6 ~ B6 ~ ~ ~ A6 ~ G6 ~ F6 ~ E6 ~ ~ ~ G6 ~ ~ ~ C7 ~ ~ ~ ~ ~ ~ ~', bass: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], kick: [0, 8], snare: [4, 12], hat: 2, stab: [2, 6, 10, 14] }
  };
  for (const k in TR) { const t = TR[k]; t.notes = parse(t.lead); t.ch = t.chords.split(' ').map(chord); t.len = Math.max(t.notes.length, t.ch.length * 16); }
  function step(tr, s, t, spb) {
    const bar = Math.floor(s / 16), b = s % 16; const ch = tr.ch[bar % tr.ch.length];
    if (tr.kick.includes(b)) tone(150, 0.14, 'sine', 0.45, 45, t, musG);
    if (tr.snare.includes(b)) { noise(0.12, 0.16, 1800, 'highpass', t, null, musG); tone(190, 0.07, 'triangle', 0.1, 120, t, musG); }
    if (tr.hat && b % tr.hat === 0) noise(0.03, 0.04, 8000, 'highpass', t, null, musG);
    if (tr.bass[b]) tone(mtof(ch.root - 12), spb * 1.8, 'triangle', 0.32, null, t, musG);
    if (tr.stab.includes(b)) { const iv = ch.minor ? [0, 3, 7] : [0, 4, 7]; iv.forEach(i => tone(mtof(ch.root + 12 + i), spb * 0.9, 'square', 0.025, null, t, musG)); }
    const n = tr.notes[s % tr.notes.length];
    if (n > 0) { let h = 1; while (tr.notes[(s + h) % tr.notes.length] === -1 && h < 16) h++; tone(mtof(n), spb * (h * 0.95 + 0.3), 'square', 0.055, null, t, musG); tone(mtof(n), spb * (h * 0.95 + 0.3), 'triangle', 0.08, null, t, musG); }
  }
  function sched() {
    if (!mus || !ctx) return; const tr = mus.tr, spb = 60 / tr.bpm / 4;
    if (mus.next < ctx.currentTime - 0.3) mus.next = ctx.currentTime + 0.05;
    while (mus.next < ctx.currentTime + 0.15) { if (Save.data.music) step(tr, mus.step, mus.next, spb); mus.step = (mus.step + 1) % tr.len; mus.next += spb; }
  }
  S.music = name => {
    if (!ctx) { S.pending = name; return; }
    if (mus && mus.name === name) return; S.stopMusic(); const tr = TR[name]; if (!tr) return;
    mus = { name, tr, step: 0, next: ctx.currentTime + 0.08 }; mus.timer = setInterval(sched, 25); sched();
  };
  S.stopMusic = () => { if (mus) { clearInterval(mus.timer); mus = null; } };
  S.suspend = on => { if (!ctx) return; try { on ? ctx.suspend() : ctx.resume(); } catch (e) {} };
  return S;
})();
