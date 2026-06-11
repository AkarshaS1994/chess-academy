import { XPT, LEVEL_TITLES } from './constants.js';

export const ST = {
  xp: 0, lv: 1, streak: 0, lastDate: null,
  skill: null, startedAt: null,
  lessonsD: [], openingsD: {}, tacticsD: [], endgamesD: [],
  quizLv: 0, quizBest: {1:0, 2:0, 3:0},
  evalPuz: {}, evalMates: {}, evalEG: {}, evalBot: 0,
  achievements: [],
};

export function addXP(n, label = '') {
  ST.xp += n;
  const oldLv = ST.lv;
  while (ST.lv < XPT.length && ST.xp >= XPT[ST.lv]) ST.lv++;
  updateTopbar();
  const flash = document.createElement('div');
  flash.className = 'xp-flash';
  flash.textContent = '+' + n + ' XP' + (label ? ' · ' + label : '');
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 950);
  if (ST.lv > oldLv) {
    confetti();
    toast(`Level ${ST.lv} — ${LEVEL_TITLES[ST.lv-1] || 'Master'}!`, 'gld');
  }
  saveProgress();
}

export function updateTopbar() {
  const xpEl = document.getElementById('xp-num');
  const lvEl = document.getElementById('lv-pill');
  const strEl = document.getElementById('streak-num');
  if (xpEl) xpEl.textContent = ST.xp + ' XP';
  if (lvEl) lvEl.textContent = 'Level ' + ST.lv;
  if (strEl) strEl.textContent = ST.streak;
}

export function checkStreak() {
  const today = new Date().toDateString();
  if (ST.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  ST.streak = ST.lastDate === yesterday ? ST.streak + 1 : 1;
  ST.lastDate = today;
  saveProgress();
}

export function saveProgress() {
  try {
    localStorage.setItem('chessAcademy_v3', JSON.stringify(ST));
  } catch (e) { /* storage full */ }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem('chessAcademy_v3');
    if (!raw) return false;
    const data = JSON.parse(raw);
    Object.assign(ST, data);
    updateTopbar();
    return true;
  } catch (e) {
    return false;
  }
}

export function exportSave() {
  const encoded = btoa(JSON.stringify(ST));
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(encoded);
  a.download = 'chess-academy-save.txt';
  a.click();
}

export function importSave() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.txt';
  inp.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(atob(ev.target.result.trim()));
        Object.assign(ST, data);
        saveProgress();
        updateTopbar();
        toast('Save imported!', 'ok');
        location.reload();
      } catch {
        toast('Invalid save file', 'bad');
      }
    };
    reader.readAsText(f);
  };
  inp.click();
}

export function confetti() {
  const colors = ['#c8a95a','#e8cc88','#52cc88','#80a8e8','#e86060','#b090e0'];
  for (let i = 0; i < 55; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left:${Math.random()*100}vw;
      top:-10px;
      width:${6+Math.random()*6}px;
      height:${6+Math.random()*6}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${Math.random()*.5}s;
      animation-duration:${1+Math.random()*.8}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

export function toast(msg, cls = '') {
  const t = document.getElementById('toast') || (() => {
    const el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
    return el;
  })();
  t.textContent = msg;
  t.className = 'toast show' + (cls ? ' t-' + cls : '');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => { t.className = 'toast'; }, 2400);
}
