// ===================== UI: DOM screens =====================
const UI = {
  cur: null,
  init() {
    $('#btnPlay').onclick = () => { Sound.init(); Sound.play('click'); this.afterPlay(); };
    $('#btnBook').onclick = () => { Sound.init(); this.book('title'); };
    $('#btnOpts').onclick = () => { Sound.init(); this.options('title'); };
    $('#btnHelp').onclick = () => { Sound.init(); this.help('title'); };
    $('#btnFull').onclick = () => { const el = document.documentElement; try { if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); } catch (e) {} };
    $('#btnPause').onclick = () => { if (Game.state === 'play') this.pause(); };
    $$('[data-back]').forEach(b => b.onclick = () => { Sound.play('click'); this.back(); });
    // colour picker
    $$('.dogpick').forEach(btn => {
      const cv = btn.querySelector('canvas'); const c = cv.getContext('2d'); const col = btn.dataset.col;
      btn.onclick = () => { Save.data.colour = col; Save.store(); this.syncPick(); Sound.init(); Sound.play('bark'); };
    });
    this.syncPick();
    // easy-mode chooser
    $('#easyYes').onclick = () => { Save.data.easy = true; Save.store(); this.map(); };
    $('#easyNo').onclick = () => { Save.data.easy = false; Save.store(); this.map(); };
    $('#storyGo').onclick = () => { Save.data.seenIntro = true; Save.store(); Sound.play('bark'); this.afterIntro(); };
    $('#pResume').onclick = () => this.resume();
    $('#pRestart').onclick = () => { Game.startStage(Game.stage.id); };
    $('#pOpts').onclick = () => this.options('pause');
    $('#pMap').onclick = () => { this.toMap(); };
    $('#rNext').onclick = () => { const i = MAIN_STAGES.indexOf(Game.stage); if (Game.stage.id === '5-B') { this.ending(); return; } if (i >= 0 && i < MAIN_STAGES.length - 1) Game.startStage(MAIN_STAGES[i + 1].id); else this.toMap(); };
    $('#rAgain').onclick = () => Game.startStage(Game.stage.id, { trial: Game.trial });
    $('#btnWard').onclick = () => { Sound.init(); this.wardrobe('title'); };
    $('#btnBoard').onclick = () => { Sound.init(); this.leaderboard('title'); };
    $('#rBoard').onclick = () => this.leaderboard('results', Game.stage.id);
    $('#boardStage').onchange = () => this.renderBoard($('#boardStage').value);
    $('#boardCheck').onclick = () => {
      const r = Board.check($('#boardPaste').value), out = $('#boardResult'), st = r && STAGES.find(s => s.id === r.id);
      if (!r || !st) { out.textContent = 'That doesn\u2019t look like a Zoomies share message. Paste the whole message.'; out.className = 'bad'; return; }
      out.textContent = r.ok ? 'Genuine: ' + st.name + ' (' + st.id + ') in ' + fmtTime(r.secs) + ', ' + r.score.toLocaleString('en-GB') + ' points. Add it as  [\'Name\', \'' + fmtTime(r.secs) + '\', ' + r.score + ']  under \'' + r.id + '\'.' : 'The code doesn\u2019t match. This time may have been changed.';
      out.className = r.ok ? 'good' : 'bad';
    };
    $('#rShare').onclick = () => {
      const txt = this.shareMsg || '', box = $('#resShare'), note = $('#resShareNote');
      box.value = txt; box.hidden = false; box.focus(); box.select();
      const done = ok => { note.textContent = ok ? 'Copied! Paste it on the club Facebook page to get on the leaderboard.' : 'Select the message above and copy it, then post it on the club Facebook page.'; };
      try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (e) { done(false); }
    };
    $('#rMap').onclick = () => this.toMap();
    $('#endBook').onclick = () => this.book('end');
    $('#endMap').onclick = () => this.toMap();
    $('#mapBack').onclick = () => this.toTitle();
    addEventListener('keydown', e => {
      if (e.code === 'Escape' && this.cur && this.cur !== 'scrPause' && Game.state !== 'play') { const b = $('#' + this.cur + ' [data-back]'); if (b) b.click(); }
    });
  },
  syncPick() {
    $$('.dogpick').forEach(b => {
      b.classList.toggle('on', b.dataset.col === Save.data.colour);
      const cv = b.querySelector('canvas'), c = cv.getContext('2d'), s2 = 2; cv.width = 120 * s2; cv.height = 84 * s2; c.setTransform(s2, 0, 0, s2, 0, 0); c.translate(52, 78); c.scale(1.1, 1.1);
      drawDog(c, { col: b.dataset.col, pose: 'sit', t: 0, tail: 0, collar: Save.data.collar, hat: Save.data.hat });
    });
  },
  show(id) {
    $$('.screen').forEach(s => s.classList.toggle('on', s.id === id)); this.cur = id;
    $('#btnPause').style.display = id === null && Game.state === 'play' ? 'flex' : 'none';
    this.syncTouch();
    if (id) { const f = $('#' + id + ' button:not([disabled])'); if (f && Input.mode !== 'touch') setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (e) {} }, 30); }
  },
  syncTouch() {
    const on = Game.state === 'play' && this.cur === null && Input.mode === 'touch';
    const t = $('#touch'); t.classList.toggle('on', on); t.classList.toggle('easy', !!Save.data.easy && !(Game.L && Game.L.boss));
  },
  toTitle() { Game.state = 'title'; Sound.music('title'); if (!Game.attract) Game.startAttract(); this.show('scrTitle'); },
  afterPlay() {
    if (!Save.data.seenIntro) { this.story(); return; }
    this.afterIntro();
  },
  afterIntro() { if (Save.data.easy === null) { this.show('scrEasy'); $('#easyRec').textContent = Input.mode === 'touch' ? 'Easy mode is recommended on phones and tablets.' : 'You can change this any time in Options.'; return; } this.map(); },
  story() {
    this.show('scrStory');
    const cv = $('#storyCv'), c = cv.getContext('2d'), s = 2; cv.width = 560 * s; cv.height = 240 * s; c.setTransform(s, 0, 0, s, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, 240); g.addColorStop(0, '#0d1a36'); g.addColorStop(1, '#2a3f6e'); c.fillStyle = g; c.fillRect(0, 0, 560, 240);
    c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { c.globalAlpha = 0.3 + (i % 3) * 0.2; c.fillRect((i * 137) % 560, (i * 61) % 140, 2, 2); } c.globalAlpha = 1;
    circ(c, 470, 50, 26); c.fillStyle = '#fbf1c8'; c.fill(); circ(c, 482, 44, 24); c.fillStyle = '#1a2a50'; c.fill();
    c.fillStyle = '#e9e9e2'; c.beginPath(); c.moveTo(60, 220); c.lineTo(110, 130); c.lineTo(250, 110); c.lineTo(390, 130); c.lineTo(440, 220); c.closePath(); c.fill();
    for (let x = 80; x < 430; x += 40) { c.fillStyle = 'rgba(29,51,102,.8)'; c.fillRect(x, 170, 20, 50); }
    c.fillStyle = '#1d3366'; c.fillRect(190, 150, 120, 26); c.fillStyle = '#f2cf6b'; c.font = '600 13px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText('Club tent', 250, 168);
    c.fillStyle = '#3d6e34'; c.fillRect(0, 216, 560, 24);
    c.save(); c.translate(360, 80); c.scale(-1.6, 1.6); drawMagpie(c, 10, { holding: true }); c.restore();
    for (let i = 0; i < 3; i++) { c.save(); c.translate(300 + i * 26, 100 + i * 12); c.scale(0.5, 0.5); drawRosette(c, i * 20, 0); c.restore(); }
    c.save(); c.translate(120, 232); c.scale(1.1, 1.1); drawDog(c, { col: Save.data.colour, pose: 'idle', t: 0 }); c.restore();
  },
  map() {
    Game.state = 'menu'; if (!Game.attract) Game.startAttract(); Sound.music('title');
    const wrap = $('#worlds'); wrap.innerHTML = '';
    let unlockedUntil = 0; for (let i = 0; i < MAIN_STAGES.length; i++) { if (i === 0 || Save.stage(MAIN_STAGES[i - 1].id).done) unlockedUntil = i; else break; }
    [1, 2, 3, 4, 5, 6].forEach(wn => {
      const card = document.createElement('section'); card.className = 'world w' + wn;
      const h = document.createElement('h3'); h.textContent = wn === 6 ? 'Christmas special' : 'World ' + wn + ': ' + WORLDS[wn].name; card.appendChild(h);
      STAGES.filter(s => s.world === wn).forEach(st => {
        const i = MAIN_STAGES.indexOf(st), sv = Save.data.stages[st.id] || {}, locked = !st.special && i > unlockedUntil;
        const row = document.createElement('div'); row.className = 'stagerow';
        const b = document.createElement('button'); b.className = 'stage' + (locked ? ' locked' : '') + (sv.done ? ' done' : ''); b.disabled = locked;
        const top = document.createElement('span'); top.className = 'st-name'; top.textContent = st.act + ': ' + st.name; b.appendChild(top);
        const meta = document.createElement('span'); meta.className = 'st-meta';
        if (locked) meta.textContent = 'Locked';
        else {
          if (!st.boss && !st.special) { const r = sv.rosettes || [0, 0, 0]; const ro = document.createElement('span'); ro.className = 'ros'; [0, 1, 2].forEach(k => { const d = document.createElement('i'); if (r[k]) d.className = 'got'; ro.appendChild(d); }); meta.appendChild(ro); }
          const tx = document.createElement('span'); tx.textContent = sv.done ? ('Best ' + fmtTime(sv.best)) : st.special ? 'Festive bonus level' : 'New'; meta.appendChild(tx);
        }
        b.appendChild(meta);
        b.onclick = () => { Sound.init(); Sound.play('click'); Game.startStage(st.id); };
        row.appendChild(b);
        if (sv.done) { const tb = document.createElement('button'); tb.className = 'trial'; tb.textContent = 'Time trial'; tb.setAttribute('aria-label', 'Time trial: ' + st.name); tb.onclick = () => { Sound.init(); Sound.play('click'); Game.startStage(st.id, { trial: true }); }; row.appendChild(tb); }
        card.appendChild(row);
      });
      wrap.appendChild(card);
    });
    this.show('scrMap');
  },
  toMap() { Game.state = 'menu'; Game.startAttract(); this.map(); },
  pause() { if (Game.state !== 'play') return; Game.state = 'pause'; Input.clear(); Sound.suspend(true); this.show('scrPause'); },
  resume() { Game.state = 'play'; Sound.suspend(false); Input.clear(); this.show(null); },
  results() {
    const r = Game.result, st = Game.stage;
    $('#resTitle').textContent = st.boss ? (st.id === '3-B' ? 'Best in Show!' : 'Boss beaten!') : 'Act clear!';
    $('#resStage').textContent = 'World ' + st.world + ' · ' + st.act + ': ' + st.name;
    const rows = [[r.trial ? 'Time trial' : 'Time', fmtTime(r.secs)], ['Biscuits', String(r.biscuits)]];
    if (r.presents) rows.push(['Presents found', r.presents]);
    else if (r.hasRosettes && !st.special) rows.push(['Gold rosettes found', r.found + ' of 3']);
    for (const [who, t] of (CLUB_TIMES[st.id] || [])) rows.push([who, fmtTime(t) + (r.secs <= t ? '  beaten!' : '  (' + (r.secs - t) + 's to go)')]);
    const rk = Board.rankFor(st.id, r.secs);
    rows.push(['Club leaderboard', rk.of === 0 ? 'Be the first!' : rk.rank <= rk.of ? 'You\u2019d be ' + ordinal(rk.rank) + ' of ' + (rk.of + 1) : 'You\u2019d be ' + ordinal(rk.rank)]);
    this.shareMsg = Board.shareText(st, r.secs, r.runScore); $('#resShare').hidden = true; $('#resShareNote').textContent = '';
    rows.push(['Score', r.total.toLocaleString('en-GB') + (r.newBest ? '  (new best!)' : '')]);
    const tb = $('#resRows'); tb.innerHTML = '';
    rows.forEach(([a, b]) => { const tr = document.createElement('div'); tr.className = 'row'; const x = document.createElement('span'); x.textContent = a; const y = document.createElement('b'); y.textContent = b; tr.append(x, y); tb.appendChild(tr); });
    const i = MAIN_STAGES.indexOf(st); $('#rNext').textContent = st.id === '5-B' ? 'Continue' : 'Next stage';
    $('#rNext').style.display = st.special ? 'none' : '';
    const fresh = Wardrobe.fresh(); $('#resNew').textContent = fresh.length ? 'New in the Wardrobe: ' + fresh.join(', ') : '';
    Game.state = 'results'; this.show('scrResults');
  },
  ending() {
    Save.data.facts.club = 1; Save.store(); Sound.music('win');
    this.show('scrEnd'); Game.state = 'menu';
    const cv = $('#endCv'), c = cv.getContext('2d'), s = 2; cv.width = 420 * s; cv.height = 230 * s; c.setTransform(s, 0, 0, s, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, 230); g.addColorStop(0, '#2a4a8a'); g.addColorStop(1, '#14254a'); c.fillStyle = g; c.fillRect(0, 0, 420, 230);
    for (let i = 0; i < 60; i++) { c.fillStyle = [GOLD, '#fff', '#e85a7a', '#4aa3df'][i % 4]; c.save(); c.translate((i * 97) % 420, (i * 53) % 200); c.rotate(i); c.fillRect(-4, -2, 8, 4); c.restore(); }
    rr(c, 150, 170, 120, 60, 6); c.fillStyle = GOLD; c.fill(); c.fillStyle = NAVY; c.font = '700 28px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText('1', 210, 210);
    c.save(); c.translate(205, 170); c.scale(1.5, 1.5); drawDog(c, { col: Save.data.colour, pose: 'sit', t: 0, tail: 0, collar: Save.data.collar, hat: Save.data.hat }); c.restore();
    c.save(); c.translate(262, 170); c.scale(0.9, 0.9); drawTrophy(c, 0); c.restore();
    c.save(); c.translate(112, 120); drawRosette(c, 0, 0); c.restore(); c.save(); c.translate(312, 110); drawRosette(c, 30, 0); c.restore();
    let got = 0; for (const k in FACTS) if (Save.data.facts[k]) got++;
    $('#endStats').textContent = 'Kennel Book pages found: ' + got + ' of ' + Object.keys(FACTS).length + '.';
  },
  book(from) {
    this.from = from; const g = $('#bookGrid'); g.innerHTML = ''; let got = 0;
    Object.keys(FACTS).forEach(k => {
      const [title, text] = FACTS[k], has = !!Save.data.facts[k]; if (has) got++;
      const card = document.createElement('article'); card.className = 'page' + (has ? '' : ' lock');
      const h = document.createElement('h4'), p = document.createElement('p');
      if (has) { h.textContent = title; p.textContent = text; }
      else if (k === 'club') { h.textContent = 'Final page'; p.textContent = 'Win Best in Show to unlock.'; }
      else { const [w, a, i] = k.split('-'); const dk = DELIVER_KEYS[k]; h.textContent = 'Page ' + (Object.keys(FACTS).indexOf(k) + 1); p.textContent = (k === '5-2-2' ? 'Win the judge over in the Big Ring' : dk || 'Find a gold rosette') + ' in World ' + w + ', Act ' + a + '.'; }
      card.append(h, p); g.appendChild(card);
    });
    $('#bookCount').textContent = got + ' of ' + Object.keys(FACTS).length + ' pages found';
    this.show('scrBook');
  },
  options(from) {
    this.from = from; const d = Save.data;
    const opts = [['easy', 'Easy mode', 'Your Lab runs by itself. Just jump.'], ['gentle', 'Gentle bumps', 'Bumps never cost biscuits.'], ['slow', 'Even slower', 'Everything moves at three-quarter speed.'],
      ['reduced', 'Reduced motion', 'No screen shake and fewer effects.'], ['music', 'Music', ''], ['sfx', 'Sound effects', '']];
    const box = $('#optList'); box.innerHTML = '';
    opts.forEach(([k, label, sub]) => {
      const row = document.createElement('label'); row.className = 'opt';
      const txt = document.createElement('span'); const b = document.createElement('b'); b.textContent = label; txt.appendChild(b); if (sub) { const s = document.createElement('small'); s.textContent = sub; txt.appendChild(s); }
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!d[k];
      cb.onchange = () => { d[k] = cb.checked; Save.store(); Game.applySettings(); Sound.apply(); Sound.play('click'); this.syncTouch(); };
      const sw = document.createElement('i'); sw.className = 'sw';
      row.append(txt, cb, sw); box.appendChild(row);
    });
    const rs = $('#optReset'); rs.textContent = 'Reset progress'; rs.dataset.armed = '';
    rs.onclick = () => { if (!rs.dataset.armed) { rs.dataset.armed = '1'; rs.textContent = 'Tap again to wipe all progress'; return; } Save.reset(); rs.textContent = 'Progress reset'; rs.dataset.armed = ''; };
    this.show('scrOpts');
  },
  help(from) { this.from = from; this.show('scrHelp'); },
  leaderboard(from, id) {
    this.from = from; const sel = $('#boardStage');
    if (!sel.options.length) STAGES.forEach(st => { const o = document.createElement('option'); o.value = st.id; o.textContent = (st.special ? 'Christmas' : 'World ' + st.world) + ' \u00b7 ' + st.act + ': ' + st.name; sel.appendChild(o); });
    const pick = id || (Game.stage && Game.stage.id) || (STAGES.find(s => Board.list(s.id).length) || STAGES[0]).id;
    sel.value = pick; this.renderBoard(pick); $('#boardResult').textContent = ''; this.show('scrBoard');
  },
  renderBoard(id) {
    const list = Board.list(id), box = $('#boardRows'); box.innerHTML = '';
    const me = Save.data.stages[id], rows = list.map(e => ({ ...e, kind: 'club' }));
    for (const [who, t] of (CLUB_TIMES[id] || [])) rows.push({ name: who, secs: t, score: null, kind: 'target' });
    if (me && me.done && me.best) rows.push({ name: 'You (this device)', secs: me.best, score: me.score || null, kind: 'me' });
    rows.sort((a, b) => a.secs - b.secs);
    let rank = 0;
    rows.forEach(e => {
      const tr = document.createElement('div'); tr.className = 'brow ' + e.kind;
      const a = document.createElement('span'); a.className = 'rk'; a.textContent = e.kind === 'club' ? String(++rank) : '';
      const b = document.createElement('span'); b.className = 'nm'; b.textContent = e.name;
      const c2 = document.createElement('b'); c2.textContent = fmtTime(e.secs);
      const d = document.createElement('span'); d.className = 'sc'; d.textContent = e.score != null ? e.score.toLocaleString('en-GB') : '';
      tr.append(a, b, c2, d); box.appendChild(tr);
    });
    $('#boardEmpty').hidden = list.length > 0;
  },
  wardrobe(from) {
    this.from = from; const d = Save.data;
    const draw = () => {
      const cv = $('#wardCv'), c = cv.getContext('2d'), s2 = 2; cv.width = 260 * s2; cv.height = 170 * s2; c.setTransform(s2, 0, 0, s2, 0, 0); c.clearRect(0, 0, 260, 170);
      c.translate(120, 158); c.scale(1.9, 1.9); drawDog(c, { col: d.colour, pose: 'sit', t: 0, tail: 0, collar: d.collar, hat: d.hat });
    };
    const build = (kind, box, list) => {
      box.innerHTML = '';
      for (const [k, label] of list) {
        const ok = Wardrobe.has(kind, k), b = document.createElement('button'); b.className = 'chip' + ((kind === 'collar' ? d.collar : d.hat) === k ? ' on' : '') + (ok ? '' : ' locked');
        const t1 = document.createElement('b'); t1.textContent = label; b.appendChild(t1);
        if (kind === 'collar') { const sw = document.createElement('i'); sw.style.background = COLLARS[k].b ? `repeating-linear-gradient(90deg, ${COLLARS[k].a} 0 6px, ${COLLARS[k].b} 6px 9px)` : COLLARS[k].a; b.prepend(sw); }
        if (!ok) { const t2 = document.createElement('small'); t2.textContent = Wardrobe.why(kind, k); b.appendChild(t2); b.disabled = true; }
        b.onclick = () => { if (kind === 'collar') d.collar = k; else d.hat = k; Save.store(); Sound.play('bark'); build(kind, box, list); draw(); this.syncPick(); };
        box.appendChild(b);
      }
    };
    build('collar', $('#wardCollars'), Object.keys(COLLARS).map(k => [k, COLLARS[k].name]));
    build('hat', $('#wardHats'), Object.keys(HATS).map(k => [k, HATS[k]]));
    draw(); Wardrobe.fresh(); this.show('scrWard');
  },
  back() {
    const f = this.from;
    if (this.cur === 'scrStory' || this.cur === 'scrEasy') return this.toTitle();
    if (f === 'pause') { this.show('scrPause'); return; }
    if (f === 'end') { this.ending(); return; }
    if (f === 'results') { this.show('scrResults'); return; }
    this.toTitle();
  },
  hint(key) {
    const m = Input.mode, easy = !!Save.data.easy, T = m === 'touch', Pd = m === 'pad';
    const J = easy ? (T ? 'Tap anywhere' : 'Press Space') : T ? 'Tap Jump' : Pd ? 'Press A' : 'Press Space';
    switch (key) {
      case 'run': return easy ? 'Your Lab runs by itself!\n' + J + ' to jump' : T ? 'Hold ▶ to run' : Pd ? 'Push right to run' : 'Hold → to run';
      case 'jump': return J + ' to jump.\nHold it for a bigger jump';
      case 'sniff': return easy ? 'Look out for\nhidden gold rosettes!' : (T ? 'Stop and hold the nose' : Pd ? 'Stop and hold down' : 'Stop and hold ↓') + '\nto sniff out gold rosettes';
      case 'bounce': return 'Jump on robot hoovers\nto stop them';
      case 'jumpup': return 'Jump up the step!';
      case 'trampoline': return 'Bounce on the\ntrampoline!';
      case 'swim': return 'Labs love water!\n' + (easy ? '' : (T ? 'Hold the nose to dive\n' : Pd ? 'Hold down to dive\n' : 'Hold ↓ to dive\n')) + J + ' to leap out';
      case 'nettles': return 'Ouch, nettles!\nJump over them';
      case 'spring': return 'Springs launch\nyou up high!';
      case 'boat': return 'Hop onto the\nnarrowboats';
      case 'locks': return 'Climb the lock flight!';
      case 'lines': return 'Run along the\nwashing lines';
      case 'awning': return 'Bounce on the\nstripy awnings!';
      case 'ring': return 'The Big Ring is next.\nTrot steadily for the judge';
      case 'boss': return (easy ? 'Use the arrows here!\n' : '') + 'A runaway mower!\nJump on top of it';
      case 'boss2': return (easy ? 'Use the arrows here!\n' : '') + 'Tag the magpie when\nit lands on the boat';
      case 'boss3': return (easy ? 'Use the arrows here!\n' : '') + 'Climb up and tag the\nmagpie on its nest';
      case 'fete': return 'Village fete!\nBounce on the castles';
      case 'tunnel': return 'Canal tunnel!\nRide the narrowboat';
      case 'swim2': return 'Labs love lakes!\nHop across the rafts';
      case 'current': return 'The big swim!\nThe current pulls you back';
      case 'net': return 'A net float has drifted off.\nFetch it for the fisherman';
      case 'whistle': return 'Peep! means stop.\n' + (easy ? 'Your Lab stops by itself' : 'Let go and sit when you hear it');
      case 'retrieve': return 'Marked retrieve!\nFetch the dummy back to hand';
      case 'blind': return 'Blind retrieve! The dummy\nis hidden in the long grass';
      case 'xmas': return 'Merry Christmas!\nFind all 12 presents';
      case 'ice': return 'Frozen pond!\nIt\u2019s slippery';
      case 'boss3': return (easy ? 'Use the arrows here!\n' : '') + 'Jump on the speedboat when\nit stops by the jetty';
      case 'boss4': return (easy ? 'Use the arrows here!\n' : '') + 'Dodge the clays and\njump on the trap';
      case 'boss5': return (easy ? 'Use the arrows here!\n' : '') + 'Climb up and tag the\nmagpie on its nest';
      case 'zoom': return easy ? 'Zoomies!' : T ? 'Zoomies ready!\nTap the lightning' : Pd ? 'Zoomies ready!\nPress B' : 'Zoomies ready!\nPress Shift';
    }
    return '';
  }
};

const DELIVER_KEYS = { '3-2-0': 'Bring the net float to the fisherman', '4-1-0': 'Deliver the dummy to hand', '4-1-1': 'Fetch the dummy from the water', '4-2-0': 'Find the hidden dummy' };
const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const fmtTime = secs => Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
const Wardrobe = {
  pages() { return Object.keys(Save.data.facts).filter(k => k !== 'club' && FACTS[k]).length; },
  done(id) { return !!(Save.data.stages[id] && Save.data.stages[id].done); },
  rules: {
    'collar:navy': [() => true, ''], 'collar:red': [() => Wardrobe.pages() >= 3, 'Find 3 Kennel Book pages'],
    'collar:green': [() => Wardrobe.pages() >= 6, 'Find 6 pages'], 'collar:tartan': [() => Wardrobe.pages() >= 10, 'Find 10 pages'],
    'collar:pink': [() => Wardrobe.pages() >= 15, 'Find 15 pages'], 'collar:purple': [() => Wardrobe.pages() >= 22, 'Find 22 pages'],
    'collar:gold': [() => Wardrobe.pages() >= Object.keys(FACTS).length - 1, 'Find every rosette page'],
    'hat:none': [() => true, ''], 'hat:bandana': [() => Wardrobe.done('2-B'), 'Beat World 2'], 'hat:cap': [() => Wardrobe.done('4-B'), 'Beat World 4'],
    'hat:santa': [() => Wardrobe.done('X-1'), 'Finish the Christmas Walk'], 'hat:rosette': [() => !!Save.data.finished, 'Win Best in Show']
  },
  has(kind, k) { const r = this.rules[kind + ':' + k]; return !!(r && r[0]()); },
  why(kind, k) { const r = this.rules[kind + ':' + k]; return r ? r[1] : ''; },
  fresh() {
    const seen = Save.data.seenUnlocks || (Save.data.seenUnlocks = ['collar:navy', 'hat:none']); const out = [];
    for (const key in this.rules) if (this.rules[key][0]() && !seen.includes(key)) { seen.push(key); const [kind, k] = key.split(':'); out.push(kind === 'collar' ? COLLARS[k].name + ' collar' : HATS[k]); }
    if (out.length) Save.store(); return out;
  }
};

// ===================== boot =====================
function boot() {
  window.drawDog = drawDog; window.drawMagpie = drawMagpie;
  Save.load(); if (!COLLARS[Save.data.collar]) Save.data.collar = 'navy'; if (!HATS[Save.data.hat]) Save.data.hat = 'none';
  Game.applySettings(); Input.init(); UI.init(); Game.init();
  try { Game.startAttract(); } catch (e) { try { console.error(e); } catch (e2) {} }
  Game.state = 'title'; UI.show('scrTitle'); Sound.music('title');
  // debug / test hooks
  window.__Z = {
    Game, Save, Input, STAGES,
    start(id) { Game.startStage(id); },
    step(n, inp, draw) { Input.override = inp || null; for (let i = 0; i < n; i++) Game.tick(); if (draw !== false) Game.render(); },
    manual(on) { Game.manual = on; },
    st() { const P = Game.P; return { x: Math.round(P.x), y: Math.round(P.y), gsp: +P.gsp.toFixed(2), vx: +P.vx.toFixed(2), vy: +P.vy.toFixed(2), ground: P.ground, swim: P.swim, pose: P.pose, biscuits: P.biscuits, done: P.done, state: Game.state, boss: Game.boss ? Game.boss.hp : null, time: Game.time }; }
  };
}
if (document.fonts && document.fonts.load) { Promise.race([document.fonts.load('700 20px Fredoka'), new Promise(r => setTimeout(r, 1500))]).then(boot, boot); }
else boot();
