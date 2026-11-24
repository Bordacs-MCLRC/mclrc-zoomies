// =====================================================================
//  CLUB LEADERBOARD
//  Edit this list to update the scores everyone sees in the game.
//
//  1. Players press "Share my time" after an act and post the message
//     on the club Facebook page.
//  2. Paste a message into Leaderboard > "Check a shared time" to make
//     sure it is genuine.
//  3. Add it below in the format  ['Name', 'minutes:seconds', score],
//     for example:  '1-1': [['Sam B', '0:31', 2450], ['Bramble', '0:35', 2210]],
//
//  Tip: for children, use a first name and initial, or their dog's name.
//  The board sorts itself by fastest time, so the order you type doesn't matter.
// =====================================================================
const CLUB_BOARD = {
  '1-1': [],  // Back Garden
  '1-2': [],  // Village Green
  '1-B': [],  // Robo-Mower
  '2-1': [],  // Towpath
  '2-2': [],  // Lock Flight
  '2-B': [],  // Magpie on the Narrowboat
  '3-1': [],  // Lakeside
  '3-2': [],  // St John's Harbour
  '3-B': [],  // Magpie in a Speedboat
  '4-1': [],  // The Stubble Field
  '4-2': [],  // Woodland Drive
  '4-B': [],  // Runaway Clay Trap
  '5-1': [],  // Benching Tent
  '5-2': [],  // The Big Ring
  '5-B': [],  // Marquee Rooftops
  'X-1': []   // Christmas Walk
};
// ===================== end of leaderboard =====================

const Board = {
  secs(t) { if (typeof t === 'number') return t; const m = String(t).trim().match(/^(\d+):(\d{1,2})$/); return m ? (+m[1]) * 60 + (+m[2]) : 9999; },
  list(id) {
    return (CLUB_BOARD[id] || []).filter(e => Array.isArray(e) && e[0])
      .map(e => ({ name: String(e[0]).slice(0, 24), secs: Board.secs(e[1]), score: Math.max(0, parseInt(e[2], 10) || 0) }))
      .sort((a, b) => a.secs - b.secs || b.score - a.score);
  },
  code(id, secs, score) {
    let h = 2166136261; const s = id + '|' + secs + '|' + score + '|mclrc-1946';
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36).toUpperCase().slice(-5);
  },
  shareText(st, secs, score) {
    return 'I ran ' + st.name + ' (' + st.id + ') in ' + fmtTime(secs) + ' with ' + score.toLocaleString('en-GB') + ' points on Zoomies! Code ' + Board.code(st.id, secs, score);
  },
  check(text) {
    const m = String(text).match(/\(([0-9X]-[0-9B])\)\s+in\s+(\d+):(\d{2})\s+with\s+([\d,]+)\s+points.*?Code\s+([A-Z0-9]+)/i);
    if (!m) return null;
    const id = m[1].toUpperCase(), secs = (+m[2]) * 60 + (+m[3]), score = parseInt(m[4].replace(/,/g, ''), 10);
    return { id, secs, score, ok: Board.code(id, secs, score) === m[5].toUpperCase() };
  },
  rankFor(id, secs) { const l = Board.list(id); return { rank: 1 + l.filter(e => e.secs < secs).length, of: l.length }; }
};
