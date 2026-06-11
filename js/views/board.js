// UNI is injected from app.js via window.UNI for cross-module compatibility
const UNI = window.UNI || {
  wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',
  bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'
};

const FL = 'abcdefgh';

export function drawBoard(id, boardMap, { sel = null, last = null, hints = [], sz = 0 } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';

  if (!sz) {
    let bz = el.parentElement, bw = 0;
    while (bz && bw < 40) { bw = bz.getBoundingClientRect().width; bz = bz.parentElement; }
    if (!bw || bw < 40) bw = Math.floor((window.innerWidth || 360) * 0.85);
    const maxW = window.innerWidth > 640 ? 400 : window.innerWidth - 40;
    bw = Math.min(bw, maxW);
    sz = Math.max(36, Math.min(54, Math.floor((bw - 8) / 8)));
  }

  el.style.width  = (sz * 8) + 'px';
  el.style.height = (sz * 8) + 'px';

  for (let r = 8; r >= 1; r--) {
    for (let f = 0; f < 8; f++) {
      const s  = FL[f] + r;
      const lt = (f + r) % 2 === 1;
      const d  = document.createElement('div');
      d.className = 'sq ' + (lt ? 'lt' : 'dk');
      d.style.cssText = `width:${sz}px;height:${sz}px`;
      d.dataset.sq = s;

      const piece = boardMap[s];
      if (piece) {
        const sp = document.createElement('span');
        sp.className = 'piece ' + (piece[0] === 'w' ? 'pw' : 'pb');
        sp.style.fontSize = Math.round(sz * 0.78) + 'px';
        sp.textContent = UNI[piece] || '';
        d.appendChild(sp);
      }

      if (r === 1) {
        const c = document.createElement('span');
        c.className = 'cf'; c.textContent = FL[f]; d.appendChild(c);
      }
      if (f === 0) {
        const c = document.createElement('span');
        c.className = 'cr'; c.textContent = r; d.appendChild(c);
      }

      if (s === sel) d.classList.add('sel');
      if (last && (s === last.from || s === last.to)) d.classList.add('last');
      if (hints.includes(s)) d.classList.add('hnt');

      el.appendChild(d);
    }
  }
}

export function wireBoard(id, fn) {
  document.getElementById(id)?.querySelectorAll('.sq').forEach(sq => {
    sq.addEventListener('click', () => fn(sq.dataset.sq));
  });
}

export function shake(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake .3s ease';
}

export function setFB(id, cls, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'fb ' + cls;
  el.innerHTML = msg;
}

export function setEng(on) {
  const els = document.querySelectorAll('.eng-thinking');
  els.forEach(e => { e.style.display = on ? 'inline' : 'none'; });
}
