// Chess engine — object-based board format matching data files
// Board: {squareName: 'wK'|'bP'|...}  e.g. {a1:'wR', e1:'wK', ...}
// Piece: 2-char string — color[0] + type[1]

const FL = 'abcdefgh';

export function fi(sq) { return FL.indexOf(sq[0]); }
export function ri(sq) { return 8 - parseInt(sq[1]); }  // 0=rank8, 7=rank1
export function sq(f, r) { return FL[f] + (8 - r); }
export function ok(f, r) { return f >= 0 && f < 8 && r >= 0 && r < 8; }

export function mkState(board, turn='w', cast={wK:true,wQ:true,bK:true,bQ:true}, ep=null, half=0) {
  return { board: {...board}, turn, cast: {...cast}, ep, half };
}

export function cloneState(st) {
  return mkState({...st.board}, st.turn, {...st.cast}, st.ep, st.half);
}

export function startPos() {
  return {
    a8:'bR',b8:'bN',c8:'bB',d8:'bQ',e8:'bK',f8:'bB',g8:'bN',h8:'bR',
    a7:'bP',b7:'bP',c7:'bP',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',
    a2:'wP',b2:'wP',c2:'wP',d2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP',
    a1:'wR',b1:'wN',c1:'wB',d1:'wQ',e1:'wK',f1:'wB',g1:'wN',h1:'wR'
  };
}

export function kingPos(st, c) {
  const e = Object.entries(st.board).find(([s,p]) => p === c+'K');
  return e ? e[0] : null;
}

export function pieces(st, c) {
  return Object.entries(st.board).filter(([s,p]) => p[0] === c);
}

function genAll(st, c, capOnly=false) {
  const mvs = [], opp = c === 'w' ? 'b' : 'w';
  for (const [s, p] of pieces(st, c)) {
    const f = fi(s), r = ri(s), t = p[1];
    if (t==='P') pawnMoves(st,s,f,r,c,opp,mvs,capOnly);
    else if (t==='N') jumpMoves(st,s,f,r,c,opp,mvs,[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],capOnly);
    else if (t==='B') slideMoves(st,s,f,r,c,opp,mvs,[[-1,-1],[-1,1],[1,-1],[1,1]],capOnly);
    else if (t==='R') slideMoves(st,s,f,r,c,opp,mvs,[[-1,0],[1,0],[0,-1],[0,1]],capOnly);
    else if (t==='Q') slideMoves(st,s,f,r,c,opp,mvs,[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]],capOnly);
    else if (t==='K') kingMoves(st,s,f,r,c,opp,mvs,capOnly);
  }
  return mvs;
}

function pawnMoves(st,s,f,r,c,opp,mvs,capOnly) {
  const dir=c==='w'?-1:1, sr=c==='w'?6:1, pr=c==='w'?0:7;
  if (!capOnly) {
    const ts=sq(f,r+dir);
    if (ok(f,r+dir) && !st.board[ts]) {
      if (r+dir===pr) { for (const pp of ['Q','R','B','N']) mvs.push({from:s,to:ts,promo:c+pp}); }
      else {
        mvs.push({from:s,to:ts});
        if (r===sr) { const ts2=sq(f,r+2*dir); if (!st.board[ts2]) mvs.push({from:s,to:ts2,dbl:true}); }
      }
    }
  }
  for (const df of [-1,1]) {
    if (!ok(f+df,r+dir)) continue;
    const cs = sq(f+df,r+dir);
    if ((st.board[cs] && st.board[cs][0]===opp) || (cs===st.ep)) {
      if (r+dir===pr) { for (const pp of ['Q','R','B','N']) mvs.push({from:s,to:cs,promo:c+pp,cap:true}); }
      else mvs.push({from:s,to:cs,cap:true,ep:cs===st.ep});
    }
  }
}

function jumpMoves(st,s,f,r,c,opp,mvs,deltas,capOnly) {
  for (const [df,dr] of deltas) {
    if (!ok(f+df,r+dr)) continue;
    const ts=sq(f+df,r+dr), occ=st.board[ts];
    if (!occ||occ[0]===opp) { if (!capOnly||occ) mvs.push({from:s,to:ts,cap:!!occ}); }
  }
}

function slideMoves(st,s,f,r,c,opp,mvs,dirs,capOnly) {
  for (const [df,dr] of dirs) {
    let cf=f+df, cr=r+dr;
    while (ok(cf,cr)) {
      const ts=sq(cf,cr), occ=st.board[ts];
      if (occ) { if (occ[0]===opp) mvs.push({from:s,to:ts,cap:true}); break; }
      if (!capOnly) mvs.push({from:s,to:ts});
      cf+=df; cr+=dr;
    }
  }
}

function kingMoves(st,s,f,r,c,opp,mvs,capOnly) {
  for (const [df,dr] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    if (!ok(f+df,r+dr)) continue;
    const ts=sq(f+df,r+dr), occ=st.board[ts];
    if (!occ||occ[0]===opp) { if (!capOnly||occ) mvs.push({from:s,to:ts,cap:!!occ}); }
  }
  if (capOnly || isCheck(st,c)) return;
  const rk = c==='w' ? '1' : '8';
  if (st.cast[c+'K'] && !st.board['f'+rk] && !st.board['g'+rk] && st.board['h'+rk]===c+'R' &&
      !attacked(st,'f'+rk,opp) && !attacked(st,'g'+rk,opp))
    mvs.push({from:s,to:'g'+rk,castle:'K'});
  if (st.cast[c+'Q'] && !st.board['d'+rk] && !st.board['c'+rk] && !st.board['b'+rk] && st.board['a'+rk]===c+'R' &&
      !attacked(st,'d'+rk,opp) && !attacked(st,'c'+rk,opp))
    mvs.push({from:s,to:'c'+rk,castle:'Q'});
}

export function applyMove(st, m) {
  const ns = cloneState(st);
  const pc = ns.board[m.from];
  const c = pc[0];
  const rk = c==='w' ? '1' : '8';
  if (m.ep) {
    const epCap = m.to[0] + (c==='w' ? parseInt(m.to[1])-1 : parseInt(m.to[1])+1);
    delete ns.board[epCap];
  }
  ns.board[m.to] = m.promo || pc;
  delete ns.board[m.from];
  if (m.castle==='K') { ns.board['f'+rk]=c+'R'; delete ns.board['h'+rk]; }
  if (m.castle==='Q') { ns.board['d'+rk]=c+'R'; delete ns.board['a'+rk]; }
  if (pc===c+'K') { ns.cast[c+'K']=false; ns.cast[c+'Q']=false; }
  if (pc===c+'R') { if (m.from==='a'+rk) ns.cast[c+'Q']=false; if (m.from==='h'+rk) ns.cast[c+'K']=false; }
  if (m.to==='a1'||m.to==='h1') { ns.cast['w'+(m.to[0]==='a'?'Q':'K')]=false; }
  if (m.to==='a8'||m.to==='h8') { ns.cast['b'+(m.to[0]==='a'?'Q':'K')]=false; }
  ns.ep = m.dbl ? (c==='w' ? m.to[0]+(parseInt(m.to[1])-1) : m.to[0]+(parseInt(m.to[1])+1)) : null;
  ns.turn = c==='w' ? 'b' : 'w';
  ns.half = (m.cap || pc[1]==='P') ? 0 : (ns.half||0)+1;
  return ns;
}

export function attacked(st, s, byC) {
  const [tf,tr] = [fi(s), ri(s)];
  const dir = byC==='w' ? 1 : -1;
  for (const df of [-1,1]) {
    const as = ok(tf+df,tr+dir) ? sq(tf+df,tr+dir) : null;
    if (as && st.board[as]===byC+'P') return true;
  }
  for (const [df,dr] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
    if (!ok(tf+df,tr+dr)) continue;
    if (st.board[sq(tf+df,tr+dr)]===byC+'N') return true;
  }
  for (const [df,dr] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
    let cf=tf+df, cr=tr+dr;
    while (ok(cf,cr)) {
      const p=st.board[sq(cf,cr)];
      if (p) { if (p[0]===byC && (p[1]==='B'||p[1]==='Q')) return true; break; }
      cf+=df; cr+=dr;
    }
  }
  for (const [df,dr] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    let cf=tf+df, cr=tr+dr;
    while (ok(cf,cr)) {
      const p=st.board[sq(cf,cr)];
      if (p) { if (p[0]===byC && (p[1]==='R'||p[1]==='Q')) return true; break; }
      cf+=df; cr+=dr;
    }
  }
  for (const [df,dr] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    if (!ok(tf+df,tr+dr)) continue;
    if (st.board[sq(tf+df,tr+dr)]===byC+'K') return true;
  }
  return false;
}

export function isCheck(st, c) {
  const kp = kingPos(st, c);
  return kp ? attacked(st, kp, c==='w'?'b':'w') : true;
}

export function legalMoves(st, c) {
  c = c || st.turn;
  return genAll(st, c).filter(m => {
    const ns = applyMove(st, m);
    return !isCheck(ns, c);
  });
}

export function isMate(st) {
  return isCheck(st, st.turn) && legalMoves(st).length === 0;
}

export function isStale(st) {
  return !isCheck(st, st.turn) && legalMoves(st).length === 0;
}

export function isDraw(st) {
  if (isStale(st) || (st.half||0) >= 100) return true;
  const ps = Object.values(st.board);
  if (ps.length === 2) return true;
  if (ps.length === 3 && ps.some(p => p[1]==='B'||p[1]==='N')) return true;
  return false;
}

export function isEndgame(st) {
  let q=0, m=0;
  for (const p of Object.values(st.board)) {
    if (p[1]==='Q') q++;
    if ('RNB'.includes(p[1])) m++;
  }
  return q===0 || (q<=2 && m<=4);
}

// Convert object board to FEN for Stockfish UCI
export function boardToFen(st) {
  const pieceChar = { K:'K',Q:'Q',R:'R',B:'B',N:'N',P:'P' };
  let fen = '';
  for (let r = 8; r >= 1; r--) {
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = st.board[FL[f]+r];
      if (!p) { empty++; continue; }
      if (empty) { fen += empty; empty = 0; }
      const ch = pieceChar[p[1]];
      fen += p[0]==='w' ? ch : ch.toLowerCase();
    }
    if (empty) fen += empty;
    if (r > 1) fen += '/';
  }
  const c = st.cast;
  const castStr = (c.wK?'K':'')+(c.wQ?'Q':'')+(c.bK?'k':'')+(c.bQ?'q':'') || '-';
  fen += ' ' + st.turn + ' ' + castStr + ' ' + (st.ep || '-') + ' ' + (st.half||0) + ' 1';
  return fen;
}
