import { legalMoves, applyMove, isMate, isStale, isDraw, boardToFen, isEndgame } from './chess.js';
import { VALS, PST } from '../core/constants.js';

const FL = 'abcdefgh';

// ── EVALUATION ──────────────────────────────────────────────────
function fi(sq) { return FL.indexOf(sq[0]); }
function ri(sq) { return 8 - parseInt(sq[1]); }

function evalPos(st) {
  const eg = isEndgame(st);
  let score = 0;
  for (const [s, p] of Object.entries(st.board)) {
    const c = p[0], t = p[1];
    const f = fi(s), r = ri(s);
    let v = VALS[t] || 0;
    const pstk = (t==='K' && eg) ? 'KE' : t;
    const prow = PST[pstk];
    if (prow) {
      const row = c==='w' ? r : 7-r;
      const col = c==='w' ? f : 7-f;
      v += prow[row*8+col] || 0;
    }
    score += c==='w' ? v : -v;
  }
  return score;
}

// ── FALLBACK MINIMAX ────────────────────────────────────────────
function minimax(st, depth, alpha, beta, maxing) {
  if (isMate(st)) return { score: maxing ? -99999 : 99999, move: null };
  if (isDraw(st)) return { score: 0, move: null };
  if (depth === 0) return { score: evalPos(st), move: null };
  const mvs = legalMoves(st);
  mvs.sort((a,b) => (b.cap?1:0)-(a.cap?1:0) + (b.castle?0.5:0)-(a.castle?0.5:0));
  let best = { score: maxing ? -Infinity : Infinity, move: mvs[0] };
  for (const m of mvs) {
    const ns = applyMove(st, m);
    const { score } = minimax(ns, depth-1, alpha, beta, !maxing);
    if (maxing) {
      if (score > best.score) best = { score, move: m };
      alpha = Math.max(alpha, score);
    } else {
      if (score < best.score) best = { score, move: m };
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }
  return best;
}

// ── STOCKFISH WORKER ────────────────────────────────────────────
let sfWorker = null;
let sfReady = false;
let sfQueue = [];
let sfResolve = null;

function initStockfish() {
  return new Promise((resolve, reject) => {
    try {
      sfWorker = new Worker('./stockfish.worker.js#./stockfish.js,worker');
      sfWorker.onmessage = e => {
        const line = String(e.data);
        if (line === 'readyok') {
          sfReady = true;
          while (sfQueue.length) sfWorker.postMessage(sfQueue.shift());
          resolve(sfWorker);
        }
        if (sfResolve && line.startsWith('bestmove')) {
          const uci = line.split(' ')[1];
          sfResolve(uci && uci !== '(none)' ? uci : null);
          sfResolve = null;
        }
      };
      sfWorker.onerror = reject;
      sfWorker.postMessage('uci');
      sfWorker.postMessage('isready');
    } catch (err) {
      reject(err);
    }
  });
}

function sendSF(cmd) {
  if (sfWorker && sfReady) sfWorker.postMessage(cmd);
  else sfQueue.push(cmd);
}

function uciToMove(uci, st) {
  if (!uci || uci.length < 4) return null;
  const from = uci.slice(0, 2);
  const to   = uci.slice(2, 4);
  const promo = uci[4] ? (st.board[from]?.[0] || 'w') + uci[4].toUpperCase() : null;
  const legal = legalMoves(st, st.turn);
  return legal.find(m => m.from === from && m.to === to && (!promo || m.promo === promo)) || null;
}

async function sfMove(st, elo, movetime) {
  if (!sfWorker) {
    try { await initStockfish(); } catch { return null; }
  }
  const fen = boardToFen(st);
  return new Promise(resolve => {
    sfResolve = uci => resolve(uciToMove(uci, st));
    sendSF('ucinewgame');
    sendSF('setoption name UCI_LimitStrength value true');
    sendSF(`setoption name UCI_Elo value ${elo}`);
    sendSF(`position fen ${fen}`);
    sendSF(`go movetime ${movetime}`);
  });
}

// ── PUBLIC API ───────────────────────────────────────────────────
export async function getBotMove(st, depth = 3, elo = null) {
  if (elo !== null && elo > 400) {
    const movetime = depth > 4 ? 1500 : 800;
    const mv = await sfMove(st, elo, movetime).catch(() => null);
    if (mv) return mv;
  }
  return new Promise(resolve => {
    setTimeout(() => {
      try {
        const { move } = minimax(st, depth, -Infinity, Infinity, st.turn === 'w');
        resolve(move || legalMoves(st)[0] || null);
      } catch {
        resolve(legalMoves(st)[0] || null);
      }
    }, 10);
  });
}

export function preloadStockfish() {
  initStockfish().catch(() => {});
}
