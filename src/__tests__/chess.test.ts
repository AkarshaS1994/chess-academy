import { describe, it, expect } from 'vitest';
import {
  mkState, applyMove, legalMoves, isCheck, isMate, isStale, isDraw, startPos
} from '../core/chess';

function pos(board: Record<string,string>, turn: 'w'|'b' = 'w') {
  return mkState(board, turn, { wK: false, wQ: false, bK: false, bQ: false });
}

// ── STARTING POSITION ────────────────────────────────────────────
describe('starting position', () => {
  it('white has exactly 20 legal moves', () => {
    const st = mkState(startPos());
    expect(legalMoves(st)).toHaveLength(20);
  });

  it('no check at start', () => {
    const st = mkState(startPos());
    expect(isCheck(st, 'w')).toBe(false);
    expect(isCheck(st, 'b')).toBe(false);
  });
});

// ── PAWN MOVES ───────────────────────────────────────────────────
describe('pawn moves', () => {
  it('single and double push from start', () => {
    const st = pos({ e1: 'wK', e8: 'bK', e2: 'wP' });
    const mvs = legalMoves(st).filter(m => m.from === 'e2');
    const tos = mvs.map(m => m.to).sort();
    expect(tos).toEqual(['e3', 'e4']);
  });

  it('pawn cannot double-push if blocked', () => {
    const st = pos({ e1: 'wK', e8: 'bK', e2: 'wP', e3: 'bP' });
    const mvs = legalMoves(st).filter(m => m.from === 'e2');
    expect(mvs).toHaveLength(0);
  });

  it('pawn captures diagonally', () => {
    const st = pos({ e1: 'wK', e8: 'bK', e4: 'wP', d5: 'bP', f5: 'bP' });
    const mvs = legalMoves(st).filter(m => m.from === 'e4');
    const tos = mvs.map(m => m.to).sort();
    expect(tos).toContain('d5');
    expect(tos).toContain('f5');
  });

  it('en passant capture', () => {
    const st = mkState(
      { e1: 'wK', e8: 'bK', e5: 'wP', d5: 'bP' },
      'w',
      { wK: false, wQ: false, bK: false, bQ: false },
      'd6'
    );
    const mvs = legalMoves(st).filter(m => m.from === 'e5' && m.to === 'd6');
    expect(mvs).toHaveLength(1);
    expect(mvs[0].ep).toBe(true);
    const ns = applyMove(st, mvs[0]);
    expect(ns.board['d5']).toBeUndefined();
    expect(ns.board['d6']).toBe('wP');
  });

  it('pawn promotes to all 4 pieces', () => {
    const st = pos({ e1: 'wK', a8: 'bK', e7: 'wP' }); // bK on a8, e8 clear for promotion
    const promos = legalMoves(st)
      .filter(m => m.from === 'e7' && m.to === 'e8' && m.promo)
      .map(m => m.promo![1]);
    expect(promos.sort()).toEqual(['B', 'N', 'Q', 'R']);
  });
});

// ── APPLY MOVE ───────────────────────────────────────────────────
describe('applyMove', () => {
  it('moves piece from source to dest', () => {
    const st = mkState(startPos());
    const m = { from: 'e2', to: 'e4', dbl: true };
    const ns = applyMove(st, m);
    expect(ns.board['e2']).toBeUndefined();
    expect(ns.board['e4']).toBe('wP');
    expect(ns.turn).toBe('b');
  });

  it('sets ep square after double push', () => {
    const st = mkState(startPos());
    const ns = applyMove(st, { from: 'e2', to: 'e4', dbl: true });
    expect(ns.ep).toBe('e3');
  });

  it('clears ep after non-double move', () => {
    const st = mkState(startPos());
    const s1 = applyMove(st, { from: 'e2', to: 'e4', dbl: true });
    const s2 = applyMove(s1, { from: 'e7', to: 'e5', dbl: true });
    const s3 = applyMove(s2, { from: 'g1', to: 'f3' });
    expect(s3.ep).toBeNull();
  });
});

// ── CASTLING ─────────────────────────────────────────────────────
describe('castling', () => {
  it('white can castle kingside', () => {
    const st = mkState(
      { e1: 'wK', h1: 'wR', e8: 'bK' },
      'w',
      { wK: true, wQ: false, bK: false, bQ: false }
    );
    const castle = legalMoves(st).find(m => m.castle === 'K');
    expect(castle).toBeDefined();
    const ns = applyMove(st, castle!);
    expect(ns.board['g1']).toBe('wK');
    expect(ns.board['f1']).toBe('wR');
    expect(ns.board['h1']).toBeUndefined();
  });

  it('white can castle queenside', () => {
    const st = mkState(
      { e1: 'wK', a1: 'wR', e8: 'bK' },
      'w',
      { wK: false, wQ: true, bK: false, bQ: false }
    );
    const castle = legalMoves(st).find(m => m.castle === 'Q');
    expect(castle).toBeDefined();
    const ns = applyMove(st, castle!);
    expect(ns.board['c1']).toBe('wK');
    expect(ns.board['d1']).toBe('wR');
  });

  it('cannot castle through check', () => {
    const st = mkState(
      { e1: 'wK', h1: 'wR', e8: 'bK', f8: 'bR' },
      'w',
      { wK: true, wQ: false, bK: false, bQ: false }
    );
    const castle = legalMoves(st).find(m => m.castle === 'K');
    expect(castle).toBeUndefined();
  });

  it('castling rights lost after king moves', () => {
    const st = mkState(
      { e1: 'wK', a1: 'wR', h1: 'wR', e8: 'bK' },
      'w',
      { wK: true, wQ: true, bK: false, bQ: false }
    );
    const ns = applyMove(st, { from: 'e1', to: 'e2' });
    expect(ns.cast.wK).toBe(false);
    expect(ns.cast.wQ).toBe(false);
  });
});

// ── CHECK / MATE / STALE ─────────────────────────────────────────
describe('check detection', () => {
  it('detects check from rook', () => {
    const st = pos({ e1: 'wK', e8: 'bK', e4: 'bR' });
    expect(isCheck(st, 'w')).toBe(true);
  });

  it('detects check from bishop', () => {
    const st = pos({ a1: 'wK', e8: 'bK', d4: 'bB' });
    expect(isCheck(st, 'w')).toBe(true);
  });

  it('no check when piece blocks', () => {
    const st = pos({ e1: 'wK', e8: 'bK', e4: 'bR', e3: 'wP' });
    expect(isCheck(st, 'w')).toBe(false);
  });
});

describe('checkmate', () => {
  it('detects scholars mate (4-move mate)', () => {
    // Qxf7# position
    const st = mkState(
      { e1: 'wK', f3: 'wN', c4: 'wB', h5: 'wQ',
        e8: 'bK', d8: 'bQ', a8: 'bR', h8: 'bR',
        c8: 'bB', f8: 'bB', b8: 'bN', g8: 'bN',
        a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
        e5: 'bP' },
      'w'
    );
    const ns = applyMove(st, { from: 'h5', to: 'f7', cap: true });
    expect(isMate(ns)).toBe(true);
  });

  it('back-rank mate', () => {
    const st = pos({ g1: 'wK', e1: 'wR', g8: 'bK', g7: 'bP', h7: 'bP', f7: 'bP' }, 'w');
    const ns = applyMove(st, { from: 'e1', to: 'e8' });
    expect(isMate(ns)).toBe(true);
  });
});

describe('stalemate', () => {
  it('detects stalemate', () => {
    // Classic stalemate: wK on f6, wQ on g6, bK on h8 — all bK moves attacked
    const st = pos({ f6: 'wK', g6: 'wQ', h8: 'bK' }, 'b');
    expect(isStale(st)).toBe(true);
  });
});

describe('draw by insufficient material', () => {
  it('K vs K is draw', () => {
    const st = pos({ e1: 'wK', e8: 'bK' });
    expect(isDraw(st)).toBe(true);
  });

  it('K+N vs K is draw', () => {
    const st = pos({ e1: 'wK', d4: 'wN', e8: 'bK' });
    expect(isDraw(st)).toBe(true);
  });

  it('K+Q vs K is not draw', () => {
    const st = pos({ e1: 'wK', d4: 'wQ', e8: 'bK' });
    expect(isDraw(st)).toBe(false);
  });
});
