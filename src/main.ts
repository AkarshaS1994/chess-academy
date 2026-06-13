import './style.css';

// ── CONSTANTS MISSING FROM ORIGINAL ─────────────────────────────
const LOCK = '🔒';

// ── PIECE UNICODE MAP ─────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var UNI: Record<string, string>;
  // eslint-disable-next-line no-var
  var ST: any;
  // eslint-disable-next-line no-var
  var MODS: any[];
  // eslint-disable-next-line no-var
  var BOTS: any[];
  // eslint-disable-next-line no-var
  var OPS: Record<string, any>;
  // eslint-disable-next-line no-var
  var TACTS: any[];
  // eslint-disable-next-line no-var
  var ENDGAMES: any[];
  // eslint-disable-next-line no-var
  var EG_DRILLS: any[];
  // eslint-disable-next-line no-var
  var ALL_PUZZLES: any[];
  // eslint-disable-next-line no-var
  var MATES: any[];
  // eslint-disable-next-line no-var
  var QS: Record<number, any[]>;
  // eslint-disable-next-line no-var
  var OPTIPS: Record<string, any>;
  // eslint-disable-next-line no-var
  var SKILL_DATA: Record<string, any>;
  // eslint-disable-next-line no-var
  var ACHIEVEMENTS: any[];
  // eslint-disable-next-line no-var
  var FL: string;
  // eslint-disable-next-line no-var
  var VALS: Record<string, number>;
  // eslint-disable-next-line no-var
  var PST: Record<string, number[][]>;
  // eslint-disable-next-line no-var
  var LEVEL_TITLES: string[];
  // eslint-disable-next-line no-var
  var XPT_NEW: number[];
}

// Chess Academy — Module Map
// § DATA      : MODS, OPS, TACTS, ENDGAMES, EG_DRILLS, etc.
// § ENGINE    : fi,ri,mkState,legalMoves,applyMove,minimax
// § STATE     : ST (single state object), save/load
// § ROUTER    : switchView(v) — all navigation goes here
// § VIEWS     : renderHome|Openings|Tactics|Endgames|...
// § BOARDS    : renderBoard|drawEvalBoard|drawTac|drawEg
// § PRACTICE  : loadTac|loadDrill|loadMate — all use ST.*
// § PERSIST   : saveProgress|loadProgress|export|import
// RULE: Each section reads/writes ONLY its own DOM elements
// ═══════════════════════════════════════════════════════════


function expandOpList(){/* no longer used — openings use card grid */}

// ═══════════════════════════════════════════════════════════════════
// CHESS ENGINE — minimax, full legal move gen, PST evaluation
// No API. No tokens. Works offline. Powers bot + endgame drills.
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// CHESS ENGINE — Full legal move generation + minimax + evaluation
// No API. No tokens. Deterministic. Works offline forever.
// ═══════════════════════════════════════════════════════════════════

const FL = 'abcdefgh';
const VALS = {P:100,N:320,B:330,R:500,Q:900,K:20000};

// Piece-square tables (white POV, 8 rows top=rank8 → bottom=rank1)
const PST = {
  P:[[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
  N:[[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
  B:[[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
  R:[[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
  Q:[[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
  K:[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]],
  KE:[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]]
};

function fi(sq){return FL.indexOf(sq[0]);}
function ri(sq){return 8-parseInt(sq[1]);}  // 0=rank8, 7=rank1
function sq(f,r){return FL[f]+(8-r);}
function ok(f,r){return f>=0&&f<8&&r>=0&&r<8;}

// ── STATE ──────────────────────────────────────────────────────
function startPos(){return{a8:'bR',b8:'bN',c8:'bB',d8:'bQ',e8:'bK',f8:'bB',g8:'bN',h8:'bR',a7:'bP',b7:'bP',c7:'bP',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',a2:'wP',b2:'wP',c2:'wP',d2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP',a1:'wR',b1:'wN',c1:'wB',d1:'wQ',e1:'wK',f1:'wB',g1:'wN',h1:'wR'};}
function mkState(board,turn='w',cast={wK:true,wQ:true,bK:true,bQ:true},ep=null,half=0){
  return {board:{...board},turn,cast:{...cast},ep,half};
}
function clone(st){return mkState({...st.board},st.turn,{...st.cast},st.ep,st.half);}
function kingPos(st,c){const e=Object.entries(st.board).find(([s,p])=>p===c+'K');return e?e[0]:null;}
function pieces(st,c){return Object.entries(st.board).filter(([s,p])=>p[0]===c);}

// ── MOVE GENERATION ────────────────────────────────────────────
function genAll(st,c,capOnly=false){
  const mvs=[];const opp=c==='w'?'b':'w';
  for(const [s,p] of pieces(st,c)){
    const f=fi(s),r=ri(s),t=p[1];
    if(t==='P') pawnMoves(st,s,f,r,c,opp,mvs,capOnly);
    else if(t==='N') jumpMoves(st,s,f,r,c,opp,mvs,[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],capOnly);
    else if(t==='B') slideMoves(st,s,f,r,c,opp,mvs,[[-1,-1],[-1,1],[1,-1],[1,1]],capOnly);
    else if(t==='R') slideMoves(st,s,f,r,c,opp,mvs,[[-1,0],[1,0],[0,-1],[0,1]],capOnly);
    else if(t==='Q') slideMoves(st,s,f,r,c,opp,mvs,[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]],capOnly);
    else if(t==='K') kingMoves(st,s,f,r,c,opp,mvs,capOnly);
  }
  return mvs;
}

function pawnMoves(st,s,f,r,c,opp,mvs,capOnly){
  const dir=c==='w'?-1:1, sr=c==='w'?6:1, pr=c==='w'?0:7;
  if(!capOnly){
    const ts=sq(f,r+dir);
    if(ok(f,r+dir)&&!st.board[ts]){
      if(r+dir===pr){for(const pp of['Q','R','B','N'])mvs.push({from:s,to:ts,promo:c+pp});}
      else{mvs.push({from:s,to:ts});if(r===sr){const ts2=sq(f,r+2*dir);if(!st.board[ts2])mvs.push({from:s,to:ts2,dbl:true});}}
    }
  }
  for(const df of[-1,1]){
    if(!ok(f+df,r+dir)) continue;
    const cs=sq(f+df,r+dir);
    if((st.board[cs]&&st.board[cs][0]===opp)||(cs===st.ep)){
      if(r+dir===pr){for(const pp of['Q','R','B','N'])mvs.push({from:s,to:cs,promo:c+pp,cap:true});}
      else mvs.push({from:s,to:cs,cap:true,ep:cs===st.ep});
    }
  }
}

function jumpMoves(st,s,f,r,c,opp,mvs,deltas,capOnly){
  for(const [df,dr] of deltas){
    if(!ok(f+df,r+dr)) continue;
    const ts=sq(f+df,r+dr),occ=st.board[ts];
    if(!occ||occ[0]===opp){if(!capOnly||occ)mvs.push({from:s,to:ts,cap:!!occ});}
  }
}

function slideMoves(st,s,f,r,c,opp,mvs,dirs,capOnly){
  for(const [df,dr] of dirs){
    let cf=f+df,cr=r+dr;
    while(ok(cf,cr)){
      const ts=sq(cf,cr),occ=st.board[ts];
      if(occ){if(occ[0]===opp)mvs.push({from:s,to:ts,cap:true});break;}
      if(!capOnly)mvs.push({from:s,to:ts});cf+=df;cr+=dr;
    }
  }
}

function kingMoves(st,s,f,r,c,opp,mvs,capOnly){
  for(const [df,dr] of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){
    if(!ok(f+df,r+dr)) continue;
    const ts=sq(f+df,r+dr),occ=st.board[ts];
    if(!occ||occ[0]===opp){if(!capOnly||occ)mvs.push({from:s,to:ts,cap:!!occ});}
  }
  if(capOnly||isCheck(st,c)) return;
  const rk=c==='w'?'1':'8';
  if(st.cast[c+'K']&&!st.board['f'+rk]&&!st.board['g'+rk]&&st.board['h'+rk]===c+'R'&&!attacked(st,'f'+rk,opp)&&!attacked(st,'g'+rk,opp))
    mvs.push({from:s,to:'g'+rk,castle:'K'});
  if(st.cast[c+'Q']&&!st.board['d'+rk]&&!st.board['c'+rk]&&!st.board['b'+rk]&&st.board['a'+rk]===c+'R'&&!attacked(st,'d'+rk,opp)&&!attacked(st,'c'+rk,opp))
    mvs.push({from:s,to:'c'+rk,castle:'Q'});
}

// ── APPLY MOVE ────────────────────────────────────────────────
function applyMove(st,m){
  const ns=clone(st);const pc=ns.board[m.from];const c=pc[0];const rk=c==='w'?'1':'8';
  if(m.ep){const epCap=m.to[0]+(c==='w'?parseInt(m.to[1])-1:parseInt(m.to[1])+1);delete ns.board[epCap];}
  ns.board[m.to]=m.promo||pc; delete ns.board[m.from];
  if(m.castle==='K'){ns.board['f'+rk]=c+'R';delete ns.board['h'+rk];}
  if(m.castle==='Q'){ns.board['d'+rk]=c+'R';delete ns.board['a'+rk];}
  if(pc===c+'K'){ns.cast[c+'K']=ns.cast[c+'Q']=false;}
  if(pc===c+'R'){if(m.from==='a'+rk)ns.cast[c+'Q']=false;if(m.from==='h'+rk)ns.cast[c+'K']=false;}
  if(m.to==='a1'||m.to==='h1'){ns.cast['w'+(m.to[0]==='a'?'Q':'K')]=false;}
  if(m.to==='a8'||m.to==='h8'){ns.cast['b'+(m.to[0]==='a'?'Q':'K')]=false;}
  ns.ep=m.dbl?(c==='w'?m.to[0]+(parseInt(m.to[1])-1):m.to[0]+(parseInt(m.to[1])+1)):null;
  ns.turn=c==='w'?'b':'w';
  ns.half=(m.cap||pc[1]==='P')?0:ns.half+1;
  return ns;
}

// ── LEGAL MOVES (filter illegal) ──────────────────────────────
function legalMoves(st,c){
  c=c||st.turn;
  return genAll(st,c).filter(m=>{const ns=applyMove(st,m);return !isCheck(ns,c);});
}

// ── CHECK / MATE DETECTION ────────────────────────────────────
function attacked(st,s,byC){
  const [tf,tr]=[fi(s),ri(s)];
  const dir=byC==='w'?1:-1;
  for(const df of[-1,1]){const as=ok(tf+df,tr+dir)?sq(tf+df,tr+dir):null;if(as&&st.board[as]===byC+'P')return true;}
  for(const [df,dr] of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){
    if(!ok(tf+df,tr+dr))continue;if(st.board[sq(tf+df,tr+dr)]===byC+'N')return true;
  }
  for(const [df,dr] of[[-1,-1],[-1,1],[1,-1],[1,1]]){
    let cf=tf+df,cr=tr+dr;
    while(ok(cf,cr)){const p=st.board[sq(cf,cr)];if(p){if(p[0]===byC&&(p[1]==='B'||p[1]==='Q'))return true;break;}cf+=df;cr+=dr;}
  }
  for(const [df,dr] of[[-1,0],[1,0],[0,-1],[0,1]]){
    let cf=tf+df,cr=tr+dr;
    while(ok(cf,cr)){const p=st.board[sq(cf,cr)];if(p){if(p[0]===byC&&(p[1]==='R'||p[1]==='Q'))return true;break;}cf+=df;cr+=dr;}
  }
  for(const [df,dr] of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){
    if(!ok(tf+df,tr+dr))continue;if(st.board[sq(tf+df,tr+dr)]===byC+'K')return true;
  }
  return false;
}

function isCheck(st,c){const kp=kingPos(st,c);return kp?attacked(st,kp,c==='w'?'b':'w'):true;}
function isMate(st){return isCheck(st,st.turn)&&legalMoves(st).length===0;}
function isStale(st){return !isCheck(st,st.turn)&&legalMoves(st).length===0;}
function isDraw(st){
  if(isStale(st)||st.half>=100) return true;
  const ps=Object.values(st.board);
  if(ps.length===2) return true;
  if(ps.length===3&&ps.some(p=>p[1]==='B'||p[1]==='N')) return true;
  return false;
}

// ── EVALUATION ────────────────────────────────────────────────
function evalPos(st){
  let score=0;
  const endgame=isEndgame(st);
  for(const [s,p] of Object.entries(st.board)){
    const c=p[0],t=p[1];const f=fi(s),r=ri(s);
    let v=VALS[t]||0;
    const pstk=t==='K'&&endgame?'KE':t;
    const prow=PST[pstk];
    if(prow){const row=c==='w'?r:7-r;const col=c==='w'?f:7-f;v+=prow[row][col];}
    score+=c==='w'?v:-v;
  }
  score+=(genAll(st,'w').length-genAll(st,'b').length)*5;
  if(isCheck(st,'w'))score-=50;
  if(isCheck(st,'b'))score+=50;
  return score;
}

function isEndgame(st){
  let q=0,m=0;
  for(const p of Object.values(st.board)){if(p[1]==='Q')q++;if('RNB'.includes(p[1]))m++;}
  return q===0||(q<=2&&m<=4);
}

// ── MINIMAX WITH ALPHA-BETA ───────────────────────────────────
function minimax(st,depth,alpha,beta,maxing){
  if(isMate(st)) return {score:maxing?-99999:99999,move:null};
  if(isDraw(st)) return {score:0,move:null};
  if(depth===0) return {score:evalPos(st),move:null};
  const mvs=legalMoves(st);
  mvs.sort((a,b)=>(b.cap?1:0)-(a.cap?1:0)+(b.castle?0.5:0)-(a.castle?0.5:0));
  let best={score:maxing?-Infinity:Infinity,move:mvs[0]};
  for(const m of mvs){
    const ns=applyMove(st,m);
    const {score}=minimax(ns,depth-1,alpha,beta,!maxing);
    if(maxing){if(score>best.score){best={score,move:m};}alpha=Math.max(alpha,score);}
    else{if(score<best.score){best={score,move:m};}beta=Math.min(beta,score);}
    if(beta<=alpha) break;
  }
  return best;
}

// ── STOCKFISH 18 WASM ENGINE ──────────────────────────────────
let _sfW=null,_sfR=false,_sfQ=[],_sfRes=null;
function _sfInit(){return new Promise((resolve,reject)=>{
  try{
    _sfW=new Worker('/stockfish.worker.js#./stockfish.js,worker');
    _sfW.onmessage=e=>{
      const l=String(e.data);
      if(l==='readyok'){_sfR=true;while(_sfQ.length)_sfW.postMessage(_sfQ.shift());resolve();}
      if(_sfRes&&l.startsWith('bestmove')){const u=l.split(' ')[1];_sfRes(u&&u!=='(none)'?u:null);_sfRes=null;}
    };
    _sfW.onerror=e=>{console.warn('Stockfish init error',e);reject(e);};
    _sfW.postMessage('uci');_sfW.postMessage('isready');
  }catch(e){reject(e);}
});}
function _sfSend(cmd){if(_sfW&&_sfR)_sfW.postMessage(cmd);else _sfQ.push(cmd);}
function boardToFen(st){
  const F='abcdefgh';let fen='';
  for(let r=8;r>=1;r--){let e=0;
    for(let f=0;f<8;f++){const p=st.board[F[f]+r];
      if(!p){e++;continue;}if(e){fen+=e;e=0;}
      const ch={K:'K',Q:'Q',R:'R',B:'B',N:'N',P:'P'}[p[1]];
      fen+=p[0]==='w'?ch:ch.toLowerCase();}
    if(e)fen+=e;if(r>1)fen+='/';
  }
  const c=st.cast,cs=(c.wK?'K':'')+(c.wQ?'Q':'')+(c.bK?'k':'')+(c.bQ?'q':'')||'-';
  return fen+' '+st.turn+' '+cs+' '+(st.ep||'-')+' '+(st.half||0)+' 1';
}
async function _sfMove(st,elo,mt){
  if(!_sfW){try{await _sfInit();}catch{return null;}}
  const fen=boardToFen(st);
  return new Promise(res=>{
    _sfRes=uci=>{
      if(!uci){res(null);return;}
      const from=uci.slice(0,2),to=uci.slice(2,4);
      const promo=uci[4]?(st.board[from]?.[0]||'w')+uci[4].toUpperCase():null;
      const legal=legalMoves(st,st.turn);
      res(legal.find(m=>m.from===from&&m.to===to&&(!promo||m.promo===promo))||null);
    };
    _sfSend('ucinewgame');
    _sfSend('setoption name UCI_LimitStrength value true');
    _sfSend('setoption name UCI_Elo value '+elo);
    _sfSend('position fen '+fen);
    _sfSend('go movetime '+mt);
  });
}
function _mmFallback(st,depth){
  return new Promise(res=>setTimeout(()=>{
    try{const{move}=minimax(st,depth,-Infinity,Infinity,st.turn==='w');res(move);}
    catch(e){const ms=legalMoves(st);res(ms.length?ms[0]:null);}
  },10));
}
function getBotMove(st,depth){
  const eloMap={1:300,2:600,3:900,4:1300};
  const elo=eloMap[depth]||600;
  if(elo>=600){
    const mt=depth>=4?1500:800;
    return _sfMove(st,elo,mt).then(mv=>mv||_mmFallback(st,depth)).catch(()=>_mmFallback(st,depth));
  }
  return _mmFallback(st,depth);
}
async function getBotMoveForBot(st:any,bot:any):Promise<any>{
  const legal=legalMoves(st);if(!legal.length)return null;
  // Opening preference: bot plays a preferred first move if still in early game
  const sp=startPos();
  const moved=Object.keys(sp).filter(sq=>st.board[sq]!==sp[sq]).length;
  if(bot.openings?.length&&moved<8&&st.turn==='b'){
    for(const [from,to] of bot.openings){
      const m=legal.find((mv:any)=>mv.from===from&&mv.to===to);
      if(m)return m;
    }
  }
  // Blunder: pick a random legal move (beginner-style error)
  if(bot.blunderRate&&Math.random()<bot.blunderRate){
    const safe=legal.filter((m:any)=>{const ns=applyMove(st,m);return!isMate(ns);});
    const pool=safe.length?safe:legal;
    return pool[Math.floor(Math.random()*pool.length)];
  }
  return getBotMove(st,bot.depth);
}

// ── RULE-BASED COACH ─────────────────────────────────────────
function coachMove(stBefore,stAfter,move,moveNum,c,history){
  const notes=[];const opp=c==='w'?'b':'w';const pc=stAfter.board[move.to];

  // 1. Hanging piece left behind
  for(const m of genAll(stAfter,opp)){
    if(m.cap){
      const capd=stAfter.board[m.to];if(!capd)continue;
      const capV=VALS[capd[1]]||0,atkV=VALS[stAfter.board[m.from]?.[1]]||0;
      if(capV>atkV+50) notes.push({t:'warn',msg:`⚠️ Move ${moveNum}: You left ${capd} on ${m.to} undefended — opponent can take it for free!`});
    }
  }

  // 2. Development reminder early game
  if(moveNum<=10){
    const backRankPieces=pieces(stAfter,c).filter(([s,p])=>{
      const rk=parseInt(s[1]);return (c==='w'?rk===1:rk===8)&&!'KQP'.includes(p[1]);
    }).length;
    if(backRankPieces>=4) notes.push({t:'tip',msg:`Tip: ${backRankPieces} pieces still on the back rank. Develop knights and bishops before attacking.`});
  }

  // 3. Castling
  if(move.castle) notes.push({t:'good',msg:`✓ Move ${moveNum}: Castled — king is safe and rook activated. Good habit!`});

  // 4. Missed castling at move 12
  if(moveNum===12&&!history.some(m=>m.castle)){
    const kp=kingPos(stAfter,c);
    if(kp&&(c==='w'?kp==='e1':kp==='e8'))
      notes.push({t:'warn',msg:`⚠️ Move 12: King still uncastled in the centre. Castle now before it becomes dangerous.`});
  }

  // 5. Capture feedback
  if(move.cap&&stBefore.board[move.to]){
    const capd=stBefore.board[move.to];
    const capV=VALS[capd[1]]||0,myV=VALS[(pc?.[1])||'P']||0;
    if(capV>=myV) notes.push({t:'good',msg:`✓ Move ${moveNum}: Captured ${capd} (${capV} pts). ${capV>myV?'Won material!':'Fair trade.'}`});
    else notes.push({t:'warn',msg:`⚠️ Move ${moveNum}: Traded ${myV}pt piece for ${capV}pt piece — you lost material in this exchange.`});
  }

  // 6. Check
  if(isCheck(stAfter,opp)) notes.push({t:'good',msg:`✓ Move ${moveNum}: Gave check! Opponent must react.`});

  // 7. Doubled pawns
  for(const f of FL){
    let cnt=0;for(let r=1;r<=8;r++)if(stAfter.board[f+r]===c+'P')cnt++;
    if(cnt>=2){notes.push({t:'tip',msg:`Tip: Doubled pawns on ${f}-file — a structural weakness. Avoid creating more.`});break;}
  }

  // 8. HP Wizard flavor quip (appended, chess note always comes first)
  const HP_QUIPS=[
    'Even Ron knows: a hanging piece is like an unguarded Horcrux — doomed!',
    'As Dumbledore said: "It is our choices that show what we truly are." Choose your moves wisely.',
    'McGonagall: "Five points from your position for leaving that piece undefended."',
    'Hermione: "I read about this in Magical Theory of Chess — always watch your back rank!"',
    'The Sorting Hat has spoken: this move reveals your true chess character.',
    'Accio initiative! Develop your pieces and seize the centre.',
    'Like casting Expecto Patronum — a good plan drives away all threats.',
    'Even Dobby could see that piece was hanging. Dobby is free — and so is your opponent to take it!',
    'The chess clock is like an hourglass — every second counts in the endgame.',
  ];
  if(moveNum%4===0&&notes.length===0){
    notes.push({t:'tip',msg:'',hp:HP_QUIPS[moveNum%HP_QUIPS.length]});
  }

  return notes;
}

function gameAnalysis(history,states,playerC){
  const pc=playerC;
  const pmoves=history.filter(m=>m.color===pc);
  const castled=pmoves.some(m=>m.castle);
  const caps=pmoves.filter(m=>m.cap).length;
  const total=pmoves.length;
  const lines=[];
  lines.push(`📊 Game: ${total} moves played as ${pc==='w'?'White':'Black'}.`);
  lines.push(castled?`✅ Castling: You castled — good king safety.`:`⚠️ Castling: You never castled. Always castle within the first 10-12 moves.`);
  const finalSt=states[states.length-1];
  if(finalSt){
    const undev=pieces(finalSt,pc).filter(([s,p])=>{const rk=parseInt(s[1]);return (pc==='w'?rk===1:rk===8)&&!'KQP'.includes(p[1]);});
    lines.push(undev.length===0?`✅ Development: All pieces developed.`:`⚠️ Development: ${undev.map(([s,p])=>p).join(', ')} never left the back rank.`);
  }
  lines.push(`📈 Captures: ${caps} captures made.`);
  const issues=[];if(!castled)issues.push('castling early');
  lines.push(`\n🎯 Focus: ${issues.length?'Work on '+issues.join(' & '):'Tactics puzzles and endgames are your next priority.'}`);
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// DATA — Puzzles, Mates, Endgames, Bots
// ═══════════════════════════════════════════════════════════════
const ALL_PUZZLES=[

  // ── FORK PUZZLES ──────────────────────────────────────────────
  {id:'f1',type:'Fork',diff:'easy',title:'Knight Fork — King and Rook',
   desc:'The knight can attack two pieces at once.',
   hint:'Move the knight to f7 — it attacks both the king on d8 AND the rook on h6.',
   pos:{e1:'wK',e5:'wN',d8:'bK',h6:'bR',d6:'bP',g7:'bP',b7:'bP'},side:'w',
   solution:{from:'e5',to:'f7'},
   explain:'Nf7+! The knight on f7 attacks the Black king (d8) and rook (h6) simultaneously. Black must escape the check — White captures the rook next move. Knight forks are most powerful when one of the attacked pieces is the king.',
   xp:20},

  {id:'f2',type:'Fork',diff:'easy',title:'Queen Fork — Win the Rook',
   desc:'The queen attacks two pieces at once.',
   hint:'Play Qd5 — the queen attacks both the rook on a8 and the knight on g8.',
   pos:{g1:'wK',d1:'wQ',a8:'bR',g8:'bN',e8:'bK',d7:'bP',f7:'bP'},side:'w',
   solution:{from:'d1',to:'d5'},
   explain:'Qd5! The queen forks the rook on a8 and the knight on g8. Black cannot defend both pieces at once. After Black saves one, White takes the other.',
   xp:20},

  {id:'f3',type:'Fork',diff:'medium',title:'Knight Fork — Two Rooks',
   desc:'A knight in the right square can attack both rooks.',
   hint:'The knight jumps to e5 — attacking both rooks on c4 and g4.',
   pos:{e1:'wK',d3:'wN',c4:'bR',g4:'bR',e8:'bK',b7:'bP'},side:'w',
   solution:{from:'d3',to:'e5'},
   explain:'Ne5! The knight on e5 attacks the rooks on c4 and g4 simultaneously (knights attack squares two away diagonally). Black can only save one rook — White wins the other.',
   xp:30},

  {id:'f4',type:'Fork',diff:'medium',title:'Pawn Fork — Wins a Piece',
   desc:'Even a pawn can fork two pieces.',
   hint:'Advance the pawn to d5 — it attacks both the knight on c6 and bishop on e6.',
   pos:{e1:'wK',d4:'wP',c6:'bN',e6:'bB',e8:'bK',d7:'bP',g7:'bP'},side:'w',
   solution:{from:'d4',to:'d5'},
   explain:'d5! The pawn on d5 attacks two pieces: the knight on c6 and the bishop on e6. Since pawns are worth less than both, White wins a piece for free.',
   xp:25},

  // ── PIN PUZZLES ────────────────────────────────────────────────
  {id:'p1',type:'Pin',diff:'easy',title:'Absolute Pin — Win the Knight',
   desc:'A pinned piece cannot move. Attack it with a cheaper piece.',
   hint:'The bishop on b3 pins the knight on f7 to the king on h5. Play g5!',
   pos:{a1:'wK',b3:'wB',g4:'wP',f7:'bN',h5:'bK',g6:'bP',h6:'bP'},side:'w',
   solution:{from:'g4',to:'g5'},
   explain:'g5! The pawn attacks the pinned knight on f7. The knight cannot move — if it did, the king on h5 would be exposed to the bishop. White wins the knight for a pawn.',
   xp:25},

  {id:'p2',type:'Pin',diff:'easy',title:'Pin the Knight — Then Attack',
   desc:'Pin a piece to the king, then pile on the pressure.',
   hint:'Rb1 pins the knight on b4 to the king on b8.',
   pos:{e1:'wK',a1:'wR',b4:'bN',b8:'bK',a7:'bP',c7:'bP',d5:'bP'},side:'w',
   solution:{from:'a1',to:'b1'},
   explain:'Rb1! The rook pins the knight on b4 to the king on b8. The knight cannot move legally. Now White can pile on with Ra1–a4 or simply play Rxb4 winning the pinned knight.',
   xp:20},

  {id:'p3',type:'Pin',diff:'medium',title:'Relative Pin — Fork the Pinned Piece',
   desc:'A pinned piece is a weak target. Win it by attacking with a pawn.',
   hint:'The bishop on d5 pins the rook on f7 against the queen on g8. Play e6!',
   pos:{e1:'wK',d5:'wB',e5:'wP',f7:'bR',g8:'bQ',e8:'bK',g7:'bP'},side:'w',
   solution:{from:'e5',to:'e6'},
   explain:'e6! The pawn forks the pinned rook (f7) and attacks toward g8. The rook on f7 is pinned to the queen — if Rxd5, then White plays exf7+ winning the queen. Black is lost.',
   xp:30},

  // ── SKEWER PUZZLES ─────────────────────────────────────────────
  {id:'s1',type:'Skewer',diff:'easy',title:'Rook Skewer — Win the Rook',
   desc:'Check the king — when it moves, capture the piece behind it.',
   hint:'Play Rh5+ checking the king. When the king flees, capture the rook on h8.',
   pos:{e1:'wK',h1:'wR',h5:'bK',h8:'bR',g7:'bP',f7:'bP'},side:'w',
   solution:{from:'h1',to:'h5'},
   explain:'Rh5+! The rook checks the king on h5. The king must move (Kg6 or Kh4). The rook on h8 is left undefended — White plays Rxh8 winning the rook. The skewer is the reverse of a pin: the valuable piece is in front.',
   xp:20},

  {id:'s2',type:'Skewer',diff:'easy',title:'Bishop Skewer — Win the Queen',
   desc:'The bishop skewers the king — behind it sits the queen.',
   hint:'Bishop on a1 checks the king on d4 — the diagonal continues to the queen on g7.',
   pos:{e1:'wK',a1:'wB',d4:'bK',g7:'bQ',c6:'bP',e6:'bP'},side:'w',
   solution:{from:'a1',to:'d4'},
   explain:'Bd4+! The bishop checks the king on d4. The king must step aside — White then plays Bxg7 winning the queen. The skewer uses the long diagonal a1-h8. Always look for pieces lined up on the same diagonal.',
   xp:20},

  {id:'s3',type:'Skewer',diff:'medium',title:'Queen Skewer — Fork and Win',
   desc:'The queen skewers the king and wins material.',
   hint:'Qa4+ checks the king. After it moves, White captures the rook on a8.',
   pos:{e1:'wK',e4:'wQ',e6:'bK',a8:'bR',d7:'bP',f7:'bP'},side:'w',
   solution:{from:'e4',to:'a4'},
   explain:'Qa4+! The queen checks the king on e6. The king must flee. White then plays Qxa8 winning the rook. Always look for skewers when your piece has a clear line through the enemy king.',
   xp:30},

  // ── DISCOVERED ATTACK PUZZLES ──────────────────────────────────
  {id:'d1',type:'Discovered',diff:'medium',title:'Discovered Attack — Win the Queen',
   desc:'Moving one piece reveals a devastating attack from the piece behind it.',
   hint:'Move the knight — it reveals the bishop attacking the queen on d8.',
   pos:{e1:'wK',c4:'wB',e5:'wN',e8:'bK',d8:'bQ',g6:'bP',h7:'bP'},side:'w',
   solution:{from:'e5',to:'f7'},
   explain:'Nf7+! The knight jumps to f7, giving check AND revealing the bishop on c4 which now attacks the queen on d8. Black must escape the check — White wins the queen next move. Two threats at once!',
   xp:30},

  {id:'d2',type:'Discovered',diff:'medium',title:'Discovered Check — Double Threat',
   desc:'Moving a piece reveals check from a piece behind. The opponent cannot handle both threats.',
   hint:'Move the bishop on d3 — it reveals a check from the rook on d1.',
   pos:{g1:'wK',d1:'wR',d3:'wB',d8:'bK',e7:'bQ',f6:'bN',g7:'bP'},side:'w',
   solution:{from:'d3',to:'g6'},
   explain:'Bg6! The bishop moves, revealing a discovered check from the rook on d1 against the king on d8. At the same time, the bishop attacks the queen on e7. Black must deal with the check — White captures the queen next move.',
   xp:35},

  {id:'d3',type:'Discovered',diff:'hard',title:'Double Check — Forced Mate',
   desc:'A double check forces the king to move — no interposition works.',
   hint:'Nd7+ gives double check. The king can only go to c8. Then Nb6#.',
   pos:{e1:'wK',b5:'wN',c1:'wR',e8:'bK',d6:'bP',f6:'bP'},side:'w',
   solution:{from:'b5',to:'d6'},
   explain:'Nd6+! The knight gives check AND reveals a rook check (double check). The king must move — the only square is f8 or d8. Then White delivers checkmate. Double check is the most forcing move in chess — it cannot be blocked or interposed.',
   xp:40},

  // ── HANGING PIECE PUZZLES ──────────────────────────────────────
  {id:'h1',type:'Hanging',diff:'easy',title:'Spot the Hanging Piece',
   desc:'A hanging piece is undefended — take it for free.',
   hint:'The knight on c5 is undefended. Capture it with the queen (diagonal from g1).',
   pos:{e1:'wK',g1:'wQ',c5:'bN',e8:'bK',d7:'bP',f7:'bP'},side:'w',
   solution:{from:'g1',to:'c5'},
   explain:'Qxc5! The knight on c5 is completely undefended. Always check if enemy pieces are hanging (undefended) before making your move. A piece is hanging when it can be captured without losing material.',
   xp:15},

  {id:'h2',type:'Hanging',diff:'easy',title:'Free Rook',
   desc:'The rook is left undefended after the opponent moved the wrong piece.',
   hint:'The rook on f4 is hanging. Capture it with the bishop.',
   pos:{e1:'wK',c1:'wB',f4:'bR',e8:'bK',d5:'bP',g6:'bP'},side:'w',
   solution:{from:'c1',to:'f4'},
   explain:'Bxf4! The rook on f4 is undefended. Bishops on long diagonals can reach hanging pieces from far away. Before every move, scan the board: are any enemy pieces undefended?',
   xp:15},

  {id:'h3',type:'Hanging',diff:'medium',title:'Overloaded Defender',
   desc:'The defender is doing two jobs — overload it to win a piece.',
   hint:'The queen on d7 defends both rook on a4 and bishop on f5. Play Rxa4!',
   pos:{e1:'wK',a1:'wR',c3:'wB',a4:'bR',d7:'bQ',f5:'bB',e8:'bK'},side:'w',
   solution:{from:'a1',to:'a4'},
   explain:'Rxa4! The black queen defends both the rook (a4) and bishop (f5). By taking on a4, White forces Black to recapture with the queen — then Bxf5 wins the bishop. An overloaded piece cannot defend everything.',
   xp:30},

  // ── BACK-RANK PUZZLES ──────────────────────────────────────────
  {id:'b1',type:'Back-Rank',diff:'easy',title:'Back-Rank Checkmate',
   desc:'The king is trapped by its own pawns. Deliver the final blow.',
   hint:'Slide the rook to a8. The king has no escape — its own pawns block every square.',
   pos:{g1:'wK',a1:'wR',g8:'bK',f7:'bP',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'a1',to:'a8'},
   explain:'Ra8#! Checkmate — the Black king on g8 is completely trapped by its own pawns on f7, g7, h7. Prevent this in your games: play h6 or g6 to give the king an escape square. This is called making luft (German for air).',
   xp:20},

  {id:'b2',type:'Back-Rank',diff:'medium',title:'Deflect the Defender',
   desc:'The rook defends the back rank. Remove it — then checkmate.',
   hint:'Sacrifice the rook on c8 to deflect the defender. Then Ra8#.',
   pos:{g1:'wK',a1:'wR',c1:'wR',c8:'bR',g8:'bK',f7:'bP',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'c1',to:'c8'},
   explain:'Rxc8+! Black must recapture with Rxc8. Now the back-rank defender is gone. White plays Ra8! with Rxa8# next (Ra8 Rxc8 is already checkmate since Black cannot interpose). Deflection removes a key defender.',
   xp:30},

  // ── DOUBLE CHECK PUZZLES ───────────────────────────────────────
  {id:'k1',type:'Rook Invasion',diff:'medium',title:'7th Rank Invasion',
   desc:'A rook on the 7th rank terrorises the enemy pawns and king.',
   hint:'Move the rook from e1 to e7 — it attacks every pawn on the 7th rank.',
   pos:{g1:'wK',e1:'wR',e8:'bK',a7:'bP',b7:'bP',c7:'bP',d7:'bP',f7:'bP'},side:'w',
   solution:{from:'e1',to:'e7'},
   explain:'Re7! The rook on the 7th rank attacks pawns on a7, b7, c7, d7, f7 simultaneously. The Black king is also restricted. Rooks on the 7th rank are one of the most powerful positional advantages.',
   xp:25}
,
  // Back-rank #3
  {id:'b3',type:'Back-Rank',diff:'medium',title:'Queen Sacrifice — Back-Rank Mate',
   desc:'Sacrifice the queen to force a back-rank checkmate.',
   hint:'Sacrifice the queen on d8 — the rook follows for checkmate.',
   pos:{g1:'wK',d1:'wQ',d8:'bR',g8:'bK',f7:'bP',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'d1',to:'d8'},
   explain:'Qxd8+! Rxd8 forced, then the back rank is open. A beautiful queen sacrifice that forces checkmate because the Black king is trapped by its own pawns.',xp:35},

  // Rook Invasion #2
  {id:'k2',type:'Rook Invasion',diff:'medium',title:'Double Rooks on 7th',
   desc:'Two rooks on the 7th rank are devastating.',
   hint:'Move the second rook to d7 — double rooks on the 7th.',
   pos:{g1:'wK',d1:'wR',d7:'wR',g8:'bK',a7:'bP',b7:'bP',c7:'bP'},side:'w',
   solution:{from:'d1',to:'e7'},
   explain:'Re7! Now both rooks occupy the 7th rank. This creates a "pig" formation — the rooks devour pawns and create mating threats simultaneously. Extremely powerful in endgames.',xp:30},

  // Rook Invasion #3  
  {id:'k3',type:'Rook Invasion',diff:'hard',title:'Rook and King Coordinate',
   desc:'Activate the king to support the rook invasion.',
   hint:'Play Kg6 — your king supports the rook and cuts off the enemy king.',
   pos:{f6:'wK',e7:'wR',e8:'bK',f7:'bP',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'e7',to:'e6'},
   explain:'Re6+! The king is cut off on the back rank. Now the rook and king coordinate to win all the pawns. Active king + rook on the 6th/7th is a winning endgame technique.',xp:35}


  // ── PIN ─────────────────────────────────────────────
  ,{id:'p4',type:'Pin',diff:'medium',title:'Absolute Pin on King File',
   desc:'A rook pins an enemy piece that cannot legally move.',
   hint:'Play Rd1 — the rook pins the queen to the king on d8.',
   pos:{e1:'wK',a1:'wR',d5:'bQ',d8:'bK',e8:'bR',g8:'bN',f7:'bP',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'a1',to:'d1'},
   explain:'Rd1! The queen on d5 is absolutely pinned — moving it exposes the king on d8 to check. White wins the queen.',xp:30}
  ,{id:'p5',type:'Pin',diff:'hard',title:'Pin and Win the Exchange',
   desc:'Pin a rook to the king, then exploit the pin.',
   hint:'Play Bb5 — the rook on c6 is pinned to the king on e8.',
   pos:{e1:'wK',f1:'wR',c1:'wB',e8:'bK',c6:'bR',d7:'bP',e7:'bP',f7:'bP'},side:'w',
   solution:{from:'c1',to:'b5'},
   explain:'Bb5! The rook on c6 cannot move without exposing the king. White can now take the rook for free or build up pressure on the pin.',xp:35}

  // ── SKEWER ───────────────────────────────────────────
  ,{id:'s4',type:'Skewer',diff:'easy',title:'Bishop Skewer — Win the Rook',
   desc:'Attack the king, which must move, exposing the rook behind it.',
   hint:'Play Bb3+ — the king must move, leaving the rook on f7 unprotected.',
   pos:{g1:'wK',c2:'wB',e8:'bK',f7:'bR',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'c2',to:'b3'},
   explain:'Bb3+! The king is in check and must move. After Kd8 or Ke7, White captures the rook on f7. Classic bishop skewer.',xp:25}
  ,{id:'s5',type:'Skewer',diff:'medium',title:'Queen Skewer on Open Diagonal',
   desc:'The queen attacks the king through to a rook behind it.',
   hint:'Play Qh5+ — skewering the king to the rook on e8.',
   pos:{g1:'wK',d1:'wQ',e8:'bR',g8:'bK',f7:'bP',g7:'bP'},side:'w',
   solution:{from:'d1',to:'h5'},
   explain:'Qh5+! The king on g8 must move. After Kf8, Qxe8+! wins the rook. The skewer forces material gain.',xp:30}

  // ── DISCOVERED ATTACK ─────────────────────────────────
  ,{id:'d4',type:'Discovered',diff:'medium',title:'Discovered Check — Gain Material',
   desc:'Moving one piece reveals a check from another, winning material.',
   hint:'Move the knight from e5 — it reveals a check from the bishop on b2.',
   pos:{g1:'wK',b2:'wB',e5:'wN',e8:'bK',d8:'bQ',h6:'bR'},side:'w',
   solution:{from:'e5',to:'f7'},
   explain:'Nxf7! The knight move reveals a discovered check from the bishop on b2. After the king moves, the knight forks the king and the queen, winning the queen.',xp:35}
  ,{id:'d5',type:'Discovered',diff:'hard',title:'Discovered Attack with Two Threats',
   desc:'Reveal an attack while creating a second unrelated threat.',
   hint:'Move the knight from d4 — reveals the rook on d1 attacking the queen, AND the knight attacks the bishop.',
   pos:{g1:'wK',d1:'wR',d4:'wN',d7:'bQ',f5:'bB',g8:'bK',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'d4',to:'f5'},
   explain:'Nxf5! Two threats at once — the rook on d1 now attacks the queen on d7, AND the knight has captured the bishop. Black cannot defend both.',xp:40}

  // ── HANGING PIECE ─────────────────────────────────────
  ,{id:'h4',type:'Hanging',diff:'easy',title:'Two Hanging Pieces — Pick the Best',
   desc:'Black has two undefended pieces. Pick the one that wins most material.',
   hint:'Capture the queen on d6 — it is completely undefended.',
   pos:{e1:'wK',e4:'wQ',d6:'bQ',b7:'bB',g8:'bK',f7:'bP',g7:'bP'},side:'w',
   solution:{from:'e4',to:'d6'},
   explain:'Qxd6! The queen is undefended. The bishop on b7 is also loose but the queen is worth more. Always win the most valuable hanging piece first.',xp:20}
  ,{id:'h5',type:'Hanging',diff:'medium',title:'Hanging Knight — Deflect the Guard',
   desc:'Win a hanging piece after removing its only defender.',
   hint:'Play Re8+! — deflects the rook from defending the knight on f6.',
   pos:{g1:'wK',e1:'wR',e4:'wQ',f6:'bN',e8:'bR',g8:'bK',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'e1',to:'e8'},
   explain:'Re8+! The rook on e8 defends the knight on f6. After Rxe8, the knight is hanging. Qxf6 follows winning a piece. Deflection is a key tactical tool.',xp:30}

  // ── BACK-RANK ─────────────────────────────────────────
  ,{id:'b4',type:'Back-Rank',diff:'medium',title:'Rook Back-Rank Checkmate',
   desc:'The rook delivers checkmate on the back rank when the king is trapped.',
   hint:'Play Re8# — the king on g8 cannot escape because pawns block g7 and h7.',
   pos:{g1:'wK',a1:'wR',g8:'bK',g7:'bP',h7:'bP',f7:'bP'},side:'w',
   solution:{from:'a1',to:'e8'},
   explain:'Re8#! The pawns on f7, g7, h7 act as a prison for their own king. This is the classic back-rank mate pattern — keep your king safe with a luft (escape square).',xp:30}
  ,{id:'b5',type:'Back-Rank',diff:'hard',title:'Deflection to Open the Back Rank',
   desc:'Force the back-rank defender away, then deliver checkmate.',
   hint:'Play Qd8+! — forces the rook to capture, opening the e-file for your rook.',
   pos:{g1:'wK',e1:'wR',d5:'wQ',e8:'bR',g8:'bK',g7:'bP',h7:'bP',d7:'bP'},side:'w',
   solution:{from:'d5',to:'d8'},
   explain:'Qd8+! The rook must capture (Rxd8) to stop checkmate. But now Re8# is unstoppable. The queen sacrifice deflects the only back-rank defender.',xp:40}

  // ── FORK ──────────────────────────────────────────────
  ,{id:'f5',type:'Fork',diff:'hard',title:'Queen Fork — Three Pieces',
   desc:'The queen simultaneously attacks three enemy pieces.',
   hint:'Play Qd5+ — the queen forks king on e6, rook on a8, and bishop on h1.',
   pos:{g1:'wK',e4:'wQ',a8:'bR',e6:'bK',h1:'bB',g7:'bP'},side:'w',
   solution:{from:'e4',to:'d5'},
   explain:'Qd5+! The king must move, then White wins either the rook or the bishop. When the queen attacks three pieces at once, the opponent can only save one of the other two.',xp:40}

  // ── ROOK INVASION ─────────────────────────────────────
  ,{id:'k4',type:'Rook Invasion',diff:'medium',title:'Rook to 7th — Win All Pawns',
   desc:'A rook on the 7th rank devours pawns while the enemy king is passive.',
   hint:'Play Ra7 — your rook enters the 7th rank and wins the pawns.',
   pos:{g1:'wK',a1:'wR',a7:'bP',b7:'bP',c7:'bP',g8:'bK'},side:'w',
   solution:{from:'a1',to:'a7'},
   explain:'Ra7! The rook on the 7th rank attacks all three pawns. This is the "pig" — a rook that devours material while the enemy king cannot come close enough to challenge it.',xp:30}
  ,{id:'k5',type:'Rook Invasion',diff:'hard',title:'Rook Lift — Open File Attack',
   desc:'Lift the rook to the 3rd rank, swing to the open file, and invade.',
   hint:'Play Rh3 — lift the rook to the 3rd rank to swing to h7.',
   pos:{g1:'wK',h1:'wR',h8:'bK',g7:'bP',f7:'bP',e7:'bP'},side:'w',
   solution:{from:'h1',to:'h7'},
   explain:'Rh7+! The rook invades on the 7th rank with check. After Kg8, the rook wins all three pawns. The rook lift is a key technique — activate via the 3rd or 4th rank.',xp:35}

  // ── BACK-RANK THREATS ───────────────────────────────────────────
 ,{id:'br1',type:'Back-Rank',diff:'easy',title:'Back-Rank Mate Threat',
   desc:'The black king is stuck on the back rank. Deliver checkmate!',
   hint:'Move the rook to e8 — the black king has no escape.',
   pos:{g1:'wK',e1:'wR',g8:'bK',g7:'bP',h7:'bP',f7:'bP'},side:'w',
   solution:{from:'e1',to:'e8'},
   explain:'Re8#! The rook slides to e8 giving checkmate. Black\'s own pawns seal off the escape squares. Back-rank mate is one of the most common tactical patterns in chess.',xp:20}

 ,{id:'br2',type:'Back-Rank',diff:'medium',title:'Queen Sacrifice — Back Rank',
   desc:'Sacrifice the queen to force a back-rank checkmate!',
   hint:'Qxd8! The rook recaptures — then Rxd8 is checkmate.',
   pos:{e1:'wK',a1:'wR',d1:'wQ',e8:'bK',a8:'bR',d8:'bR',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'d1',to:'d8'},
   explain:'Qxd8+! After Rxd8, play Rxd8# — the second rook delivers checkmate. The queen sacrifice forces Black to weaken their own back rank defence.',xp:30}

  // ── DISCOVERED ATTACKS ──────────────────────────────────────────
 ,{id:'da1',type:'Discovered Attack',diff:'medium',title:'Discovered Attack — Double Threat',
   desc:'Move the knight to reveal a bishop attack AND threaten the queen!',
   hint:'Move the knight away to uncover the bishop\'s diagonal and attack the queen.',
   pos:{e1:'wK',c3:'wN',f3:'wB',e8:'bK',h5:'bQ',a7:'bP'},side:'w',
   solution:{from:'c3',to:'e4'},
   explain:'Ne4! The knight moves away, uncovering the bishop on f3 which now attacks the queen on h5. Black must deal with the queen being attacked — a discovered attack creates two threats at once.',xp:30}

 ,{id:'da2',type:'Discovered Attack',diff:'hard',title:'Discovered Check — Win the Queen',
   desc:'Move the bishop to give discovered check AND attack the queen!',
   hint:'The rook on the e-file gives check when the bishop moves — and the bishop attacks the queen.',
   pos:{e1:'wK',e4:'wR',d3:'wB',e8:'bK',h7:'bQ',c4:'bP'},side:'w',
   solution:{from:'d3',to:'f5'},
   explain:'Bf5+! The bishop moves to f5 giving discovered check via the rook on e4. While Black deals with the check, White wins the queen on h7 next. Discovered checks are among the most powerful tactics.',xp:35}

  // ── DEFLECTION ──────────────────────────────────────────────────
 ,{id:'de1',type:'Deflection',diff:'medium',title:'Deflect the Defender',
   desc:'Sacrifice to remove the piece guarding against checkmate!',
   hint:'The rook on f8 is the only defender. Deflect it!',
   pos:{g1:'wK',h1:'wR',h7:'wQ',g8:'bK',f8:'bR',g7:'bP',h8:'bP'},side:'w',
   solution:{from:'h1',to:'h8'},
   explain:'Rxh8+! The rook sacrifice deflects the black rook from f8. After Kxh8 (or Rxh8), Qxg7# delivers checkmate. Deflection removes a key defender to open the mating net.',xp:30}

  // ── DECOY ───────────────────────────────────────────────────────
 ,{id:'dc1',type:'Decoy',diff:'medium',title:'Decoy the King',
   desc:'Lure the king to a square where it gets forked!',
   hint:'Sacrifice the rook to drag the king to h8, then fork with the knight.',
   pos:{g1:'wK',a1:'wR',g3:'wN',h8:'bK',g8:'bR',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'a1',to:'h1'},
   explain:'Rh1+! The rook sacrifices itself to lure the king. After Kxh1... wait — actually look: Rh1+ forces Rxh1, then Nf5+ and Nxh1 wins the rook back with interest. Decoy tactics force pieces to bad squares.',xp:30}

  // ── ZWISCHENZUG ─────────────────────────────────────────────────
 ,{id:'zw1',type:'Zwischenzug',diff:'hard',title:'In-Between Move',
   desc:'Before recapturing, find the zwischenzug — the check that wins material!',
   hint:'Instead of recapturing immediately, give check first to win the queen.',
   pos:{e1:'wK',d4:'wN',a1:'wR',d8:'bK',d6:'bQ',e5:'bP'},side:'w',
   solution:{from:'d4',to:'e6'},
   explain:'Ne6+! Before recapturing on d6, check the king first. After the king moves, you capture the queen with a net gain. The zwischenzug (in-between move) changes the material calculation entirely.',xp:35}

  // ── PINS ────────────────────────────────────────────────────────
 ,{id:'p3',type:'Pin',diff:'medium',title:'Absolute Pin — Win Material',
   desc:'The pinned piece cannot move — now exploit it!',
   hint:'The knight on f6 is pinned to the king. Attack it with the pawn!',
   pos:{e1:'wK',e4:'wP',g5:'wB',e8:'bK',f6:'bN',g7:'bP',h7:'bP'},side:'w',
   solution:{from:'e4',to:'e5'},
   explain:'e5! The pawn attacks the pinned knight on f6. The knight cannot move because it is pinned to the king by the bishop on g5. If the knight moves, the king is in check. White wins the knight for free.',xp:25}

  // ── SKEWERS ─────────────────────────────────────────────────────
 ,{id:'sk2',type:'Skewer',diff:'medium',title:'Skewer — King and Rook',
   desc:'Attack the king, force it to move, then take the rook behind it!',
   hint:'Give check with the bishop — the king must move, exposing the rook.',
   pos:{e1:'wK',c4:'wB',e8:'bK',e5:'bR',a7:'bP'},side:'w',
   solution:{from:'c4',to:'f7'},
   explain:'Bf7+! The bishop gives check, skewering the king in front of the rook on e5. After the king moves, the bishop captures the rook. A skewer is like a backwards pin — the more valuable piece is attacked first.',xp:25}

  // ── KING HUNT ────────────────────────────────────────────────────
 ,{id:'kh1',type:'King Hunt',diff:'hard',title:'Drive the King Out',
   desc:'Sacrifice to expose the king, then chase it across the board!',
   hint:'Qxh7+! Sacrifice the queen to drag the king into the open.',
   pos:{g1:'wK',d1:'wR',h5:'wQ',f3:'wN',g8:'bK',h7:'bP',g7:'bP',f7:'bP',h8:'bR'},side:'w',
   solution:{from:'h5',to:'h7'},
   explain:'Qxh7+! The queen sacrifice drags the king into the open. After Kxh7, Ng5+ Kg6, Rh1 and the king hunt begins. King hunts require precise calculation but are the most brilliant chess combinations.',xp:40}

  // ── INTERFERENCE ─────────────────────────────────────────────────
 ,{id:'if1',type:'Interference',diff:'hard',title:'Interference — Cut the Defence',
   desc:'Place a piece on a square that cuts the connection between two black pieces!',
   hint:'The rook on d5 cuts the diagonal and the file — Black cannot defend both.',
   pos:{e1:'wK',d1:'wR',e4:'wQ',e8:'bK',c8:'bB',d8:'bR',e7:'bP',d7:'bP'},side:'w',
   solution:{from:'d1',to:'d5'},
   explain:'Rd5! The rook on d5 interferes — it blocks the bishop on c8 from defending d8 while cutting the rook\'s lateral movement. Now Qxe7# follows. Interference is a subtle but powerful tactical motif.',xp:35}

  // ── OVERLOAD ─────────────────────────────────────────────────────
 ,{id:'ol1',type:'Overload',diff:'medium',title:'Overloaded Defender',
   desc:'The black queen defends both the rook and the mating square. Overload it!',
   hint:'Attack the queen\'s defensive duties by threatening checkmate AND the rook.',
   pos:{g1:'wK',g4:'wQ',a1:'wR',g8:'bK',g7:'bQ',h7:'bP',a7:'bR'},side:'w',
   solution:{from:'g4',to:'d4'},
   explain:'Qd4+! The queen gives check and threatens Ra8#. The black queen is overloaded — it cannot both block the check AND defend the back rank. An overloaded piece cannot fulfil all its defensive duties simultaneously.',xp:30}

  // ── CLEARANCE ────────────────────────────────────────────────────
 ,{id:'cl1',type:'Clearance',diff:'hard',title:'Clearance Sacrifice',
   desc:'Sacrifice a piece to clear a square for your more powerful piece!',
   hint:'Sacrifice the knight to clear d5 for the bishop — then it delivers checkmate.',
   pos:{e1:'wK',d5:'wN',f3:'wB',h1:'wR',e8:'bK',d8:'bR',e7:'bP',d7:'bP',f7:'bP'},side:'w',
   solution:{from:'d5',to:'e7'},
   explain:'Nxe7+! The knight sacrifices itself on e7 to clear d5 for the bishop. After Rxe7 (forced), Bd5+ — the bishop delivers check with devastating effect. Clearance removes your own pieces from key squares.',xp:35}

  // ── X-RAY ─────────────────────────────────────────────────────────
 ,{id:'xr1',type:'X-Ray',diff:'hard',title:'X-Ray Attack',
   desc:'Your queen attacks through the enemy queen — an x-ray tactic!',
   hint:'Move the queen to d8. It x-rays through the black queen to hit the rook.',
   pos:{e1:'wK',d1:'wQ',e8:'bK',d7:'bQ',d8:'bR'},side:'w',
   solution:{from:'d1',to:'d8'},
   explain:'Qxd8+! The white queen captures on d8, x-raying through the black queen. After Qxd8 (Kxd8 is also met by Qxd8+), White wins decisive material. X-ray tactics see through intervening pieces.',xp:35}

  // ── ZUGZWANG TRICK ──────────────────────────────────────────────
 ,{id:'zg1',type:'Zugzwang',diff:'hard',title:'Force Zugzwang',
   desc:'Every black move loses material. Find the move that puts Black in zugzwang!',
   hint:'The king move to b6 puts Black in zugzwang — any pawn move loses.',
   pos:{g1:'wK',b6:'wP',c5:'wK',b8:'bK',a7:'bP',c7:'bP'},side:'w',
   solution:{from:'c5',to:'c6'},
   explain:'Kc6! Black is now in zugzwang. The black pawns are stuck — advancing either one loses it to the white pawn or king. Zugzwang is when it is your turn but every move makes your position worse.',xp:40}

];

const MATES=[
  {id:"m1a",n:1,type:"Back-Rank",title:"Mate in 1 — Back Rank",req:"White to play · Checkmate in 1 move",
   info:"The rook delivers checkmate because the Black king is trapped by its own pawns on f7, g7, h7.",
   pos:{g1:"wK",a1:"wR",g8:"bK",f7:"bP",g7:"bP",h7:"bP"},side:"w",
   moves:[{from:"a1",to:"a8"}],
   explain:"Ra8# — Checkmate! The Black king on g8 is trapped by its own pawns. This is the most common checkmate pattern in beginner games. Prevent it by playing h6 to give your king an escape square.",xp:20},

  {id:"m1b",n:1,type:"Scholar Pattern",title:"Mate in 1 — f7 Attack",req:"White to play · Deliver checkmate",
   info:"f7 is the weakest square in the opening — defended only by the king.",
   pos:{e1:"wK",c4:"wB",e3:"wQ",e8:"bK",e7:"bP",d7:"bP",f7:"bP",g7:"bP"},side:"w",
   moves:[{from:"e3",to:"f3"}],
   explain:"Qf3! threatens Qxf7#. The f7 pawn is defended only by the king — if the king moves or cannot defend it, checkmate follows. The bishop on c4 aims at f7. This is the Scholar's Mate idea — always defend f7 as Black.",xp:20},

  {id:"m1c",n:1,type:"Knight Mate",title:"Mate in 1 — Smothered",req:"White to play · Knight delivers checkmate",
   info:"The knight delivers checkmate with the king smothered by its own pieces.",
   pos:{e1:"wK",g5:"wN",g4:"wB",g8:"bK",g7:"bP",h7:"bP",f8:"bR"},side:"w",
   moves:[{from:"g5",to:"f7"}],
   explain:"Nf7# — Checkmate! The knight on f7 gives check, covered by the bishop on g4. The Black king on g8 cannot escape: f8 has its own rook, g7 pawn blocks g7, h8 is unreachable. Smothered by its own pieces!",xp:25},

  {id:"m1d",n:1,type:"Queen Mate",title:"Mate in 1 — Corner",req:"White to play · Force checkmate",
   info:"Queen and king work together to corner the enemy king.",
   pos:{f6:"wK",g4:"wQ",h8:"bK",g7:"bP"},side:"w",
   moves:[{from:"g4",to:"h5"}],
   explain:"Qh5# — Checkmate! The queen on h5 covers g6 and h5 simultaneously while checking the king. The Black king on h8 has no moves: g8 is covered by the queen on h5, g7 pawn exists, h7 covered by queen. A well-placed queen and king are enough.",xp:20},

  {id:"m2a",n:2,type:"Ladder Mate",title:"Mate in 2 — Two Rooks",req:"White to play · Checkmate in 2 moves",
   info:"Use both rooks alternately to push the king to the edge — the lawnmower.",
   pos:{e1:"wK",a1:"wR",b2:"wR",a8:"bK",c7:"bP",b7:"bP"},side:"w",
   moves:[{from:"b2",to:"b8"},{from:"a1",to:"a8"}],
   explain:"1.Rb8+ Ka7 2.Ra8# — Checkmate! Step 1: Rb8+ forces the king to a7. Step 2: Ra8# is checkmate. This is the two-rook ladder (lawnmower) — alternate rooks to push the king to the edge, then deliver the final check. Never let the rooks interfere with each other.",xp:30},

  {id:"m2b",n:2,type:"Queen Box",title:"Mate in 2 — Queen Box",req:"White to play · Box then deliver",
   info:"Shrink the box with the queen, then deliver checkmate.",
   pos:{e6:"wK",d4:"wQ",h8:"bK",g7:"bP"},side:"w",
   moves:[{from:"d4",to:"g7"},{from:"g7",to:"h7"}],
   explain:"1.Qxg7+! Kh8 (forced — the pawn was the last escape route) 2.Qh7# Checkmate! The queen+king box: work methodically, take away escape squares one by one. Never create stalemate — always verify the king has at least one legal move before the final check.",xp:30},

  {id:"m3a",n:3,type:"Forced Combination",title:"Mate in 3",req:"White to play · Three-move forced checkmate",
   info:"A forced sequence of checks leads inevitably to checkmate.",
   pos:{g1:"wK",h1:"wR",d4:"wQ",h8:"bK",g7:"bP",h7:"bP",f8:"bR"},side:"w",
   moves:[{from:"d4",to:"d8"},{from:"h1",to:"h7"},{from:"d8",to:"h4"}],
   explain:"1.Qd8! Rxd8 2.Rxh7+ Kg8 3.Rh8# — A queen sacrifice to set up the rook checkmate. Sacrificing the queen opens lines and forces a mating sequence. These combinations work because every Black response is forced. Calculate all forced sequences before sacrificing.",xp:40},
];

const EG_DRILLS=[
  {id:'kqk',title:'K+Q vs K',type:'Basic Mate',diff:'medium',
   desc:'Checkmate the lone king using the box method. Engine defends optimally.',
   limit:12,xp:50,pos:{e4:'wK',d1:'wQ',h8:'bK'},playerSide:'w',
   hint:'Step 1: Qd7 — cuts off the 7th rank, shrinks the box. Never stalemate: keep the king one escape square until delivering the final check. Optimal: 7 moves.',
   optimal:7},

  {id:'krk',title:'K+R vs K',type:'Basic Mate',diff:'medium',
   desc:'Checkmate with king and rook using the barrier method.',
   limit:18,xp:50,pos:{e4:'wK',a1:'wR',h8:'bK'},playerSide:'w',
   hint:'Step 1: Ra4 — barrier on the 4th rank divides the board. Advance your king while the rook holds the line. Bring the king to the 6th rank, then push to the edge. Optimal: 12 moves.',
   optimal:12},

  {id:'kpk',title:'K+P vs K — Promote',type:'Pawn Ending',diff:'medium',
   desc:'Reach the key square to promote the pawn. King must lead the pawn.',
   limit:14,xp:40,pos:{e1:'wK',e3:'wP',e8:'bK'},playerSide:'w',
   hint:'Key squares for e-pawn: d6, e6, f6. King must reach one of these BEFORE the pawn promotes. King BESIDE the pawn (e.g. Kd4-Kd5-Kd6) leads to promotion. King BEHIND the pawn loses.',
   optimal:10},

  {id:'lucena',title:'Lucena — Build the Bridge',type:'Rook Ending',diff:'hard',
   desc:'Classic winning technique. Shelter your king from checks to promote.',
   limit:15,xp:60,pos:{f7:'wK',f6:'wP',g1:'wR',f1:'bK',a3:'bR'},playerSide:'w',
   hint:'Step 1: Rg4. The rook moves to g4 to build the bridge — it will shelter the king from side checks when it steps out on the g-file. Then king steps to g7, pawn promotes. Optimal: 8 moves.',
   optimal:8},

  ,{id:'philidor',title:'Philidor Position',playerSide:'b',
   pos:{e1:'wK',e4:'wR',e6:'bK',e7:'bP',b6:'bP'},
   goal:'Hold the draw by keeping your rook on the 6th rank.',
   hint:'Keep rook on 6th rank — only check from behind when king advances.',xp:50,diff:'medium',
   checkFn:function(st){return false;}},
  {id:'oppcolbish',title:'Opposite Colour Bishops',playerSide:'w',
   pos:{e4:'wK',d3:'wB',e7:'bK',f6:'bB',d6:'bP',f5:'wP'},
   goal:'Understand opposite-colour bishop draws — try to promote your pawn.',
   hint:'Your bishop cannot help your pawn if they are opposite colours.',xp:40,diff:'medium',
   checkFn:function(st){return false;}},
  {id:'rookbehind',title:'Rook Behind Passed Pawn',playerSide:'w',
   pos:{g1:'wK',a1:'wR',a5:'wP',g8:'bK',h7:'bR'},
   goal:'Place your rook behind the passed pawn, then advance.',
   hint:'Rook goes BEHIND the passed pawn — always.',xp:45,diff:'medium',
   checkFn:function(st){return false;}},
  {id:'zugzwang',title:'Zugzwang',playerSide:'w',
   pos:{e4:'wK',e3:'wP',e6:'bK'},
   goal:'Gain opposition and put Black in zugzwang to promote.',
   hint:'Use triangulation — reach e5 with your king.',xp:50,diff:'hard',
   checkFn:function(st){return false;}},
  {id:'squarerule',title:'The Square Rule',playerSide:'b',
   pos:{g1:'wK',a5:'wP',h8:'bK'},
   goal:'Can the Black king catch the pawn? Enter the square!',
   hint:'Draw the imaginary square from pawn to promotion rank.',xp:35,diff:'easy',
   checkFn:function(st){return false;}},
  {id:'qvsr',title:'Queen vs Rook',playerSide:'w',
   pos:{a1:'wK',d4:'wQ',e6:'bK',e5:'bR'},
   goal:'Win the rook using skewers and forcing moves.',
   hint:'Skewer the king to win the rook.',xp:55,diff:'hard',
   checkFn:function(st){return false;}},
  {id:'rvb',title:'Rook vs Bishop',playerSide:'w',
   pos:{a1:'wK',d4:'wR',e6:'bK',d6:'bB'},
   goal:'Restrict and win the bishop.',
   hint:'Cut the bishop off from its key diagonal.',xp:55,diff:'hard',
   checkFn:function(st){return false;}},
  {id:'tripopp',title:'Triangulation',playerSide:'w',
   pos:{e1:'wK',e6:'bK',e4:'wP'},
   goal:'Use triangulation to gain the opposition and promote.',
   hint:'Use a 3-move king route to lose a tempo — then gain opposition.',xp:50,diff:'hard',
   checkFn:function(st){return false;}},

  // KQK variant 2 — queen further from king
  {id:'kqk2',title:'K+Q vs K (Queen Offside)',playerSide:'w',
   pos:{a1:'wK',h5:'wQ',d8:'bK'},
   goal:'Checkmate with king and queen. Bring your king in first.',
   hint:'King to b2, centralise before checkmating.',xp:50,diff:'easy',
   checkFn:function(st){return false;}},

  // KRK variant 2
  {id:'krk2',title:'K+R vs K (Starting Position)',playerSide:'w',
   pos:{a1:'wK',d5:'wR',h8:'bK'},
   goal:'Force the king to the edge, then deliver checkmate.',
   hint:'Use your rook to cut the king off — reduce its available squares.',xp:50,diff:'medium',
   checkFn:function(st){return false;}},

  // KPK variant 2 — draw position  
  {id:'kpk2',title:'K+P vs K (Can You Draw?)',playerSide:'b',
   pos:{e5:'wK',e4:'wP',e7:'bK'},
   goal:'The Black king must reach key squares to draw. Can you do it?',
   hint:'Black needs the opposition — e6 blocks the key square.',xp:40,diff:'hard',
   checkFn:function(st){return false;}}

];

const BOTS=[
  {id:'b300',name:'Ron Weasley',rating:300,ava:'🧡',depth:1,
   blunderRate:0.42,openings:[],
   desc:'Ron is enthusiastic but moves impulsively — misses hanging pieces and blunders often. Perfect for learning piece safety and basic tactics.',
   hp:'Ron charges in without a plan, just like his wizard chess style. Watch for hanging pieces — he misses them constantly.'},
  {id:'b600',name:'Neville Longbottom',rating:600,ava:'🌿',depth:2,
   blunderRate:0.16,openings:[['e2','e4'],['d2','d4'],['g1','f3']],
   desc:'Neville develops his pieces and sometimes castles, but loses track of threats. Good for practising opening principles.',
   hp:'Neville has improved enormously — he develops and defends, but coordination still eludes him. He forgets about your threats.'},
  {id:'b900',name:'Viktor Krum',rating:900,ava:'🦅',depth:3,
   blunderRate:0.06,openings:[['e2','e4'],['d2','d4'],['c2','c4']],
   desc:'Krum plays tactically — spots forks and pins reliably. Tests whether you keep your pieces defended.',
   hp:'The Durmstrang champion plays sharp, aggressive chess. Watch your hanging pieces.'},
  {id:'b1200',name:'Professor McGonagall',rating:1200,ava:'🎓',depth:4,
   blunderRate:0.02,openings:[['d2','d4'],['g1','f3'],['c2','c4']],
   desc:'McGonagall controls the centre and builds patiently. Tests your positional understanding and long-term planning.',
   hp:'Transfiguration demands precision. The Professor will punish every structural weakness.'},
  {id:'b1500',name:'Albus Dumbledore',rating:1500,ava:'🌟',depth:4,
   blunderRate:0,openings:[],
   desc:'Dumbledore is the strongest opponent — deep calculation, no inaccuracy goes unpunished. Excellent preparation for online play.',
   hp:'The greatest wizard of the age. Defeating Dumbledore earns you a place in chess history.'},
];

// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// ACADEMY — Curriculum, openings, quiz, XP, achievements, skill system
// ═══════════════════════════════════════════════════════════════════

// ── PIECE SYMBOLS ─────────────────────────────────────────────
const UNI={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};

// ── CURRICULUM DATA ───────────────────────────────────────────
const MODS=[
  {k:"pieces",icon:"♟",name:"Piece Movement",desc:"How every piece moves — the foundation of chess.",level:1,xp:25,type:"concepts",data:[
    {i:"♙",n:"Pawns",t:"Move forward 1 square (2 from start). Capture diagonally. Never move back. Reach the last rank → promote (always pick queen!). En passant: capture a pawn that just moved 2 squares as if it moved 1 — only immediately after."},
    {i:"♞",n:"Knights",t:"L-shape: 2 squares one direction + 1 perpendicular. Only piece that jumps over others. Always lands on opposite colour. Best in closed, locked positions where bishops are useless."},
    {i:"♝",n:"Bishops",t:"Move diagonally any number of squares. Stay on their starting colour forever. A bishop with no pawns blocking its diagonal is a long-range monster."},
    {i:"♜",n:"Rooks",t:"Move horizontally or vertically any number of squares. Most powerful on open files. Two rooks on the 7th rank is nearly always winning."},
    {i:"♛",n:"Queen",t:"Combines rook + bishop — any direction, any distance. Most powerful piece. Develop it late — it gets chased by minor pieces and loses tempo."},
    {i:"♚",n:"King",t:"Moves 1 square any direction. In endgames: centralise it — it becomes a powerful attacker! Castling: king moves 2 squares toward a rook; rook jumps to the other side."},
    {i:"✨",n:"Special Moves",t:"Castling (king safety + rook activation), En passant (pawn capture timing trick), Promotion (pawn reaches rank 8 → become any piece, almost always a queen)."}
  ]},
  {k:"values",icon:"⚖️",name:"Piece Values & Trades",desc:"Know when to exchange — and when never to.",level:1,xp:25,type:"rules",data:[
    {n:"01",s:"The Point Count",t:"Pawn=1, Knight=3, Bishop=3, Rook=5, Queen=9. Never give up more points than you gain without a concrete reason."},
    {n:"02",s:"The Bishop Pair",t:"Having both bishops vs one bishop is worth ~0.5 extra points in open positions. Two bishops cover all 64 squares together — never give them up cheaply."},
    {n:"03",s:"Knight vs Bishop",t:"Knights shine in CLOSED positions (they jump over the locked pawn wall). Bishops shine in OPEN positions (long diagonals). Know which you want before choosing pawn breaks."},
    {n:"04",s:"Every Trade Needs a Reason",t:"Random exchanges help the player with the better position. Always ask: \"Why am I trading? What do I gain?\" Trading your active bishop for a passive knight is usually losing even if equal on points."},
    {n:"05",s:"Activate Your Rooks",t:"A rook stuck behind pawns on a closed file is worth less than a bishop. Open files are everything. Create open files by exchanging pawns, then double rooks on them."}
  ]},
  {k:"opprinciples",icon:"🏁",name:"Opening Principles",desc:"5 golden rules every beginner must follow.",level:1,xp:25,type:"rules",data:[
    {n:"01",s:"Control the Centre",t:"Put pawns on e4/d4. Central pawns control the most squares and give your pieces maximum mobility. Every good opening move either controls centre or develops a piece toward it."},
    {n:"02",s:"Develop Every Piece",t:"Get ALL pieces off the back rank within 10 moves. An undeveloped piece does nothing. Develop knights before bishops — you know the knight belongs on f3 before you know the bishop's best diagonal."},
    {n:"03",s:"Never Move the Same Piece Twice",t:"Each extra move on one piece = one less developing move. The player who develops faster almost always wins the opening. Exception: only when the piece is attacked and must move."},
    {n:"04",s:"Castle Within 10 Moves",t:"Your king in the centre is a target on every open file and diagonal. Castling in one move: (1) protects the king, (2) connects your rooks. Delaying castling is the #1 beginner mistake."},
    {n:"05",s:"Don't Queen-Rush",t:"Early Qh5 and Qf3 lose tempo to …g6 or …Nc6. After Scholar's Mate (Qf3+Bc4→Qxf7) fails, the queen is just a liability. Develop minor pieces first, always."}
  ]},
  {k:"tempo",icon:"⏱️",name:"Time & Tempo",desc:"Every move costs time — learn to gain and spend wisely.",level:1,xp:25,type:"rules",data:[
    {n:"01",s:"What is Tempo?",t:"A \"tempo\" is one move. Gaining a tempo means forcing your opponent to waste a move. In the opening, one wasted tempo can mean being a whole piece behind in development."},
    {n:"02",s:"The Gambit Idea",t:"Gambits offer material for TIME. The Queen's Gambit, King's Gambit, Evans Gambit all work on this principle: a tempo lead is worth a pawn in the opening."},
    {n:"03",s:"Development Counts",t:"Count developed pieces after each opening move. Being 5 developed vs opponent's 3 is like having an extra piece. 'A lead in development should be exploited immediately.' — Tarrasch"},
    {n:"04",s:"Zugzwang",t:"In endgames, having to move can be a DISADVANTAGE — any move worsens your position. This is called zugzwang. King opposition and triangulation use this principle to force wins."},
    {n:"05",s:"Gambit Psychology",t:"A gambit offers material for time (tempo). Accepting feels like winning — but each pawn collected costs a development move. After 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.b4 (Evans Gambit), Black takes the pawn but White gets 2 free development tempos. Before accepting any gambit, ask: what activity does my opponent get for this pawn?"},
    {n:"06",s:"Triangulation — Wasting a Tempo",t:"In king endgames you sometimes need to WASTE a tempo to put the opponent in zugzwang. Triangulation: move the king in a 3-square triangle (3 moves) instead of a direct 2-move path, arriving at the same square but now the OPPONENT must move. This transfers the \"obligation to move\" — forcing them to yield key squares. An essential technique in all king-pawn endgames."}
  ]},
  {k:"repwhite",icon:"♔",name:"White Repertoire",desc:"Handle every Black reply when playing 1.d4.",level:1,xp:25,type:"rules",data:[
    {n:"01",s:"After 1.d4, if 1…d5",t:"Play 2.c4 (Queen's Gambit). If declined 2…e6 → QGD Classical. If 2…c6 → Slav. If 2…dxc4 → QGA (play 3.e4). You now cover every d5 response."},
    {n:"02",s:"After 1.d4, if 1…Nf6",t:"Play 2.c4 then 3.Nc3. If g6+Bg7+d6 → King's Indian (play 4.e4). If e6+Bb4 → Nimzo-Indian (play 4.e3). If e6+d5 → QGD territory."},
    {n:"03",s:"After 1.d4, if 1…f5",t:"Dutch Defence — play 2.g3 (fianchetto). Your Bg2 fights the Dutch bishop. Safe and solid."},
    {n:"04",s:"After 1.d4, if 1…c5",t:"Benoni territory — play 2.d5. For beginners, just play 2.c4 and get a normal London/QGD-type structure."},
    {n:"05",s:"Anything else after 1.d4",t:"Play 2.c4 and build the normal Queen's Gambit centre. The d4+c4 setup is flexible against virtually everything Black can try."}
  ]},
  {k:"repblack",icon:"♚",name:"Black Repertoire",desc:"Solid responses against everything White plays.",level:1,xp:25,type:"rules",data:[
    {n:"01",s:"Against 1.e4: Caro-Kann",t:"1…c6 then 2…d5. After 3.Nc3 dxe4 4.Nxe4 Bf5 — bishop out before the pawns close. No \"bad bishop\". Used by Karpov to win the world championship."},
    {n:"02",s:"Against 1.d4: King's Indian",t:"1…Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6. Allow the big centre, counterattack with …e5. Kasparov and Fischer's favourite — always fighting for a win."},
    {n:"03",s:"Against 1.c4 (English): Mirror it",t:"Play 1…c5! Symmetric reversed Sicilian. Both sides fianchetto. Equal, comfortable, easy. Symmetry guarantees no early disasters."},
    {n:"04",s:"Against 1.Nf3",t:"Play 1…d5. After 2.d4 → QGD territory. After 2.g3 → play d5 and develop solidly. Stay flexible until you know White's plan."},
    {n:"05",s:"Against unusual openings",t:"Don't panic. Play 1…d5, develop all pieces, castle early. Sound classical chess defeats irregular openings — irregular moves are irregular because they're objectively inferior."}
  ]},
  {k:"tactics_m",icon:"⚔️",name:"Basic Tactics",desc:"6 patterns that win material or deliver checkmate.",level:2,xp:25,type:"concepts",data:[
    {i:"🍴",n:"Fork",t:"One piece attacks two enemy pieces simultaneously. Opponent has one move, can only save one — you win the other for free. Knights create forks most often: Nd7+, Nf7+, Nc7+ are the classic patterns."},
    {i:"📌",n:"Pin",t:"A piece cannot move without exposing something more valuable behind it. Absolute pin: king is behind (illegal to move). Relative pin: queen is behind (should not move). Pile attackers on pinned pieces!"},
    {i:"🔫",n:"Skewer",t:"The reverse pin — attack a valuable piece, it must move, you win what's behind it. Rook skewer: Re8+ forces king to move, winning the queen behind it. Always check for king-queen alignments."},
    {i:"💥",n:"Discovered Attack",t:"Moving one piece reveals an attack from a piece behind it. The moving piece can ALSO attack something — two threats in one move. Discovered CHECK is the most powerful: opponent must deal with check first."},
    {i:"⚡",n:"Double Check",t:"Two pieces check simultaneously. Cannot be blocked or captured — MUST move the king. King has very few escape squares. Almost always leads to forced checkmate in 1-2 moves."},
    {i:"🎯",n:"Hanging Pieces",t:"An undefended piece can be captured for free. Before every move scan: are all YOUR pieces defended? Are any of your opponent's pieces undefended? The 5-second blunder check saves hundreds of games."}
  ]},
  {k:"mates",icon:"👑",name:"Checkmate Patterns",desc:"7 essential mating patterns every player must know.",level:2,xp:25,type:"concepts",data:[
    {i:"📚",n:"Scholar's Mate",t:"1.e4 e5 2.Bc4 Nc6 3.Qh5 Nf6?? 4.Qxf7#. Defend: play 3…g6 when you see Qh5 — drives the queen back and gains tempo. Know this pattern; never fall for it again."},
    {i:"🏠",n:"Back-Rank Mate",t:"Rook or queen delivers checkmate on rank 1/8 because the king is trapped by its own pawns. Prevent with \"luft\": play h3/g3 to give the king an escape square. Essential endgame knowledge."},
    {i:"🌀",n:"Smothered Mate",t:"A knight delivers checkmate when the king is surrounded by its own pieces. Classic: sacrifice the queen (Qg8+! Rxg8 Nf7#) to force the king into the corner. The most elegant mate in chess."},
    {i:"🪜",n:"Ladder Mate",t:"Two rooks (or rook+queen) checkmate on alternating ranks — R1 checks, king moves, R2 checks — pushing the king to the edge. Most common winning checkmate at beginner level."},
    {i:"🔒",n:"Anastasia's Mate",t:"Knight on g6 + rook on h-file delivers checkmate. The knight covers king escape squares while the rook delivers the final check. Requires open h-file and active knight."},
    {i:"📦",n:"K+Q Box Mate",t:"Queen shrinks a box around the enemy king, forcing it to the edge. Then king approaches to help deliver mate. NEVER stalemate — always keep one escape square until the king helps."},
    {i:"⭕",n:"Arabian Mate",t:"Knight on f6 + rook on h8 delivers checkmate. The knight covers g8 and h7; the rook delivers check. Classic corner pattern when opponent's king is trapped."}
  ]},
  // ── MIDDLEGAME MODULES ─────────────────────────────────────
  {k:"middle_basics",icon:"🧠",name:"Middlegame: The Basics",desc:"What to do after the opening ends — the most important phase of the game.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"What is the Middlegame?",t:"The middlegame begins when development is complete (roughly moves 10-20) and ends when most pieces are traded off. It is where games are truly decided — the opening sets the stage, but the middlegame is where you WIN or LOSE. At 200-800 ELO, most games end here by blunder or tactic, not by deep strategy."},
    {n:"02",s:"The 60-Second Position Check",t:"Before every middlegame move, ask these 4 questions: (1) What is my opponent threatening RIGHT NOW — can they take something or give check? (2) Is my king safe? (3) Which of my pieces is doing nothing — can I improve it? (4) Can I create a threat? In that order. This habit alone is worth 200 ELO rating points."},
    {n:"03",s:"Active Pieces Win Games",t:"The most important middlegame principle: ACTIVE pieces win games. An active piece controls many squares and threatens things. A passive piece sits behind its own pawns doing nothing. Every move, ask: \"Am I making a piece MORE active or LESS active?\" If less active — find a better move."},
    {n:"04",s:"Who is Attacking Whom?",t:"Before you attack, count: do you have MORE pieces near the enemy king than your opponent has defenders? More attackers than defenders = attack. Fewer attackers = defend or redirect. Beginners launch attacks with 1-2 pieces against 3-4 defenders and wonder why they fail. Piece count near the king decides whether an attack works."},
    {n:"05",s:"One Plan at a Time",t:"Don't try to do everything at once. Choose ONE plan and execute it. Is the kingside weak? Attack there. Is there a passed pawn? Push it. Is an enemy piece badly placed? Attack it. Trying to simultaneously attack the kingside, push a queenside pawn, AND build an outpost leads to doing nothing well. Pick one target."},
    {n:"06",s:"The Initiative",t:"The player who makes threats forces the other to react. Forcing your opponent to react = you have the INITIATIVE. With initiative: keep making threats, don't let them breathe. Without initiative: make a threat or improve a piece to seize it back. Never spend several moves making non-threatening moves when behind — you will fall further behind."}
  ]},
  {k:"middle_threats",icon:"⚡",name:"Middlegame: Threats & Forcing Moves",desc:"Checks, captures, and threats — the CCT method for finding winning moves.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"Forcing Moves First",t:"In complex positions, ALWAYS look at forcing moves first: checks, captures, and threats (CCT). Forcing moves limit your opponent's options. A check forces the king to move. A capture forces a recapture decision. A threat forces a response. Looking at non-forcing moves first leads to missing wins constantly."},
    {n:"02",s:"Check Every Check",t:"Even if a check looks silly, look at it. Sometimes the \"silly\" check leads to a fork, a checkmate, or wins material. Beginners often overlook strong checks because they seem too obvious or too aggressive. \"Checks are free — always look at every check.\" — GothamChess"},
    {n:"03",s:"Capture Sequences",t:"When pieces are being traded, calculate the full sequence before starting. Who captures last? Use the simple rule: if you take last AND the piece you end on is worth more than the pieces you gave away, the trade is good. Example: exchange your 3-point bishop for a 5-point rook = winning. 5-point rook for 3-point bishop = losing."},
    {n:"04",s:"The Double Attack",t:"A double attack creates two threats at once — the opponent can only answer one. Double attacks win material every time. Types: fork (one piece attacks two), discovered attack (one piece moves, reveals another), check + capture (force the king to move, then take the undefended piece). ALWAYS look for double attack opportunities."},
    {n:"05",s:"Removing the Defender",t:"If your opponent's piece is defending something valuable, attack the DEFENDER first. Example: Black's knight on f6 defends the h7 pawn. If you can capture or chase away the knight, h7 becomes weak. \"Remove the defender\" is one of the most important tactical motifs — used in every master game."},
    {n:"06",s:"Deflection vs Decoy",t:"Deflection: force a defending piece AWAY from its defensive duty (usually by attacking it or sacrificing to it). Decoy: lure an enemy piece TO a square where it can be exploited. Both are powerful because they disrupt your opponent's coordination. Example: Qxh7+! lures (decoys) the king to h7 where the bishop and knight finish it off."}
  ]},
  {k:"middle_planning",icon:"📋",name:"Middlegame: How to Make a Plan",desc:"From position assessment to concrete plan — the professional thinking method.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"The 4-Step Planning Method",t:"Every 5-10 moves, do a full position check: (1) MATERIAL — who has more? Even one pawn matters. (2) KING SAFETY — is either king exposed? (3) PIECE ACTIVITY — whose pieces are better placed? (4) PAWN STRUCTURE — who has weaknesses? The side with more advantages should attack. The side with fewer should defend and improve."},
    {n:"02",s:"Find the Weakness",t:"Every position has a weakness — an exploitable target. It might be: a weak pawn (isolated, doubled, backward), a weak square (can't be defended by pawns), a weak king (castled on a file you can open), or a passive piece (can't help with anything). Find the weakness, then build your plan around attacking it."},
    {n:"03",s:"Attack on the Side Where You Have Space",t:"Silman's key teaching: attack WHERE your pawns point. If your pawns point kingside (e4, f4), attack on the kingside. If your pawns point queenside (c4, b4), attack on the queenside. Never attack on the side where you're cramped — your pieces have no room. This simple rule tells you where to play 90% of the time."},
    {n:"04",s:"Improve Your Worst Piece",t:"Karpov's method: always improve the least active piece before attacking. A harmonious army where all pieces cooperate beats a scattered army every time. Ask: \"Which of my pieces is doing the least?\" Then find it the best square. Often this is a bishop blocked by its own pawns, or a rook still sitting on its starting square."},
    {n:"05",s:"Two Weaknesses Principle",t:"Advanced but learnable: create ONE weakness, the opponent defends it. Create a SECOND weakness on the other side — now they can't defend both. Example: tie down the opponent's rook defending a weak d-pawn, then open the kingside for an attack. With their rook stuck, the king has no support. Nimzowitsch and Capablanca used this constantly."},
    {n:"06",s:"When to Trade Pieces",t:"Trade pieces when: you're material ahead (fewer pieces = your advantage shows), the traded piece was your opponent's best piece, you enter a winning endgame. KEEP pieces when: you're attacking, when your pieces are more active, when trading gives opponent relief from a losing position. \"The threat is stronger than its execution\" — Nimzowitsch."}
  ]},
  {k:"middle_attack",icon:"⚔️",name:"Middlegame: Attacking the King",desc:"Kingside attacks, sacrifices, and creating mating nets — the exciting part.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"Conditions for a Successful Attack",t:"Before attacking, check: (1) Is the enemy king castled on a side where you have more pawns/pieces? (2) Have you completed development? (3) Is YOUR king safe? If all three: yes → attack! If any: no → develop or defend first. Premature attacks fail because the opponent has too many defenders. Patience builds winning attacks."},
    {n:"02",s:"The Pawn Storm",t:"Advancing pawns toward the castled king (g4-g5 or h4-h5) is the most powerful attacking tool when kings castle on opposite sides. The pawn storm opens lines for rooks and bishops. Key: advance the pawn AWAY from your own king (if you castle queenside, advance the kingside pawns). Don't weaken your own king to attack."},
    {n:"03",s:"The Classic Greek Gift (Bxh7+)",t:"If you have a bishop on d3/c4, knight on f3 able to jump to g5, and queen on d1/e2 able to reach h5: Bxh7+! Kxh7, Ng5+ Kg8 (or Kh6 → Qh5#), Qh5 → unstoppable mate. Before playing it, verify: (1) after Kh6, can you play Qh5+? (2) After Kg8, is Qh5 threat enough? Calculate all king moves before committing."},
    {n:"04",s:"Piece Sacrifices to Open the King",t:"Sacrificing material to rip open the enemy king's shelter is one of the most exciting and powerful attacking methods. Classic sacrifices: Rxh7+ (clearing the h-file), Bxg7 (destroying the fianchetto), Nxf7 (knight fork of king and rook). These only work when you have MORE attacking pieces than they have defenders. Count before sacrificing!"},
    {n:"05",s:"The Mating Attack Checklist",t:"Before any mating combination: (1) How many pieces are attacking the king? (2) How many are defending? (3) Can the king escape? (4) Can they block the decisive check? A properly calculated mating attack leaves ZERO escape routes. If you can't calculate it fully — don't sacrifice. Improve a piece instead."},
    {n:"06",s:"Defense Against Attacks",t:"When you're being attacked: (1) Look for COUNTERPLAY — your own threats force the attacker to react. (2) Trade the most dangerous attacking piece. (3) Give material to defuse the attack — a pawn or exchange to eliminate their key attacker. (4) Use perpeutual check as a last resort. Active defense — creating threats while defending — is harder to beat than passive defense."}
  ]},
  {k:"middle_defense",icon:"🛡️",name:"Middlegame: Defense & Counterplay",desc:"Defense is a skill, not a weakness — Petrosian's method.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"Defense is Active, Not Passive",t:"Passive defense (just blocking threats) almost always loses. Active defense creates COUNTER-THREATS while defending, forcing the attacker to divide their attention. Example: instead of just blocking a check, counter-attack the queen threatening it. Your opponent must now defend AND continue the attack — much harder."},
    {n:"02",s:"Petrosian — Stop the Threat Before It Starts",t:"Tigran Petrosian (World Champion 1963-69) was the master of PROPHYLAXIS: stopping the opponent's plan BEFORE they execute it. Ask every move: \"What does my opponent want to do in the next 2-3 moves?\" If the answer is dangerous — stop it now. Many great defensive moves are quiet, non-threatening moves that quietly defuse an attack."},
    {n:"03",s:"The Exchange Sacrifice as Defense",t:"Sacrificing a rook for a bishop or knight (losing 2 points) to eliminate the opponent's most dangerous attacking piece is often correct and practical. Karpov and Petrosian used this constantly. A rook for a knight is a 2-point loss — but if that knight was on an outpost threatening your king, removing it may save the game."},
    {n:"04",s:"Perpetual Check — The Drawing Weapon",t:"If you're losing, look for perpetual check: checking the enemy king endlessly so it can never escape. Two conditions: (1) you can give check on at least two squares that the king must alternate between, (2) the king cannot escape the checking pattern. Perpetual check turns a loss into a draw. Always look for it when behind."},
    {n:"05",s:"Fortress Construction",t:"A fortress is a defensive formation where the attacking side cannot make progress even with material advantage. Typical: king in the corner with a wrong-colour bishop on a1 rook pawn. The defender just shuffles pieces and the attacker makes no progress. Recognising fortress possibilities saves many lost positions."},
    {n:"06",s:"Never Give Up — The Comeback",t:"Chess players who never give up win far more games than those who resign at the first difficulty. Magnus Carlsen famously plays on in positions that would lead others to resign — and wins because opponents relax. In complex positions, keep defending. In a lost endgame, look for stalemate traps. In any position, make your opponent PROVE the win."}
  ]},
  {k:"middle_200",icon:"🎯",name:"At 200 ELO: Your Priority List",desc:"What YOU specifically need to go from 200 → 600 → 1000. Honest and direct.",level:1,xp:30,type:"rules",data:[
    {n:"01",s:"The Hard Truth About 200 ELO",t:"At 200 ELO, almost every game is decided by a simple blunder — not openings, not strategy, not endgame theory. You are leaving pieces where they can be taken. Your opponent is too. The player who stops doing this first wins. Deep middlegame strategy is irrelevant until you reach ~800 ELO. Fix blundering first. Everything else is secondary."},
    {n:"02",s:"Your #1 Priority: See One Move Ahead",t:"Before EVERY move, ask: \"Can my opponent take any of my pieces for free after I play this?\" One question. Consistently. That is it. Players who do this single thing every single move will reach 600-700 ELO quickly. Players who skip it stay at 200-300 forever. This is not about strategy — it is about board vision."},
    {n:"03",s:"Your #2 Priority: Spot Their Threats",t:"After your opponent moves, ask: \"What did they just threaten?\" Did they attack one of your pieces? Did they set up a fork? Are they about to checkmate you? Most 200-rated games are lost because the loser did not see what was coming — not because they played bad strategy. Defensive awareness matters more than attack."},
    {n:"04",s:"Your #3 Priority: Basic Mating Patterns",t:"Learn 5 mating patterns cold: Scholar's Mate defence, Back-rank mate, Two-rook ladder, Queen + King box, Knight fork of king and rook. You don't need 20 patterns — just these 5. Recognising them (both to deliver AND to prevent) will win and save you many games per week at 200 ELO."},
    {n:"05",s:"Your #4 Priority: Control the Centre",t:"Play e4 or d4 as White. Play e5 or d5 as Black. Develop all your pieces within 10 moves. Castle. These three instructions describe 90% of correct opening play below 800 ELO. You do not need to memorise the Najdorf Sicilian. You need to not leave your king in the center while your pieces sit on the back rank."},
    {n:"06",s:"Your Path: 200 → 1000 ELO",t:"Month 1: Do 20 puzzles daily (mate in 1, then mate in 2). Play 15-minute rapid games only. Month 2-3: Learn K+Q vs K and K+R vs K endgames. Keep doing puzzles. Month 4-5: Study the 6 tactics patterns. Learn one opening with White (London or Italian). Month 6+: Study master games. At this point you will be 800-1000 ELO and ready for deeper strategy."}
  ]},
  {k:"pawns",icon:"🏗️",name:"Pawn Structure",desc:"Passed, isolated, doubled, backward pawns. Philidor's soul.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"Passed Pawns",t:"A passed pawn has no enemy pawn that can stop or capture it. PUSH IT. Ruy López: \"passed pawns must be pushed.\" In endgames, a passed pawn is almost always decisive."},
    {n:"02",s:"Isolated Pawn (IQP)",t:"No friendly pawns on adjacent files. Weakness in endgames (pieces tied to defending it). But in middlegames, the IQP gives active piece play and strong central squares. Classic Silman imbalance."},
    {n:"03",s:"Doubled Pawns",t:"Two pawns on the same file — can't defend each other. Usually weak, but the open file next to them can be major compensation. Sicilian Dragon has doubled c-pawns but wins with the c-file."},
    {n:"04",s:"Backward Pawn",t:"Can't advance: adjacent pawns are ahead of it. The square in front is a permanent outpost for the opponent. Always plant a piece in front of the enemy's backward pawn — it can never be dislodged!"},
    {n:"05",s:"Pawn Chains",t:"Pawns on a diagonal form a chain. ATTACK THE BASE, not the head. White chain e4-d5-c6: attack c6's base at e4. Attacking the head (most advanced pawn) achieves nothing — it's defended by d5."},
    {n:"06",s:"Pawn Majority",t:"More pawns on one flank = pawn majority. Queenside majority → create a passed pawn in endgames. Kingside majority → pawn storm attack. Converting majority to a passer is a critical endgame technique."}
  ]},
  {k:"kingsafe",icon:"🛡️",name:"King Safety",desc:"Castle early, luft, attacking castled kings.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"Castle Within 10 Moves",t:"King safety is worth more than any single pawn. A king in the centre is a target on every open file and diagonal. Castle and activate both rooks at once — the best of both worlds."},
    {n:"02",s:"Don't Weaken Pawn Shelter",t:"After castling kingside, the g2, h2, f2 pawns are your king's shield. Pushing them without a plan creates permanent weaknesses. Only advance them as part of a specific attacking plan."},
    {n:"03",s:"Make Luft (Give Air)",t:"Play h3 (or h6 for Black) to give the castled king an escape square from back-rank mate. A 30-second investment that saves games in endgames constantly. Grandmasters do this routinely."},
    {n:"04",s:"Opposite-Side Castling = Race",t:"When kings castle on opposite wings, both players launch pawn storms toward the enemy king. Open files = checkmate threats. Speed is everything — who creates mating threats first wins."},
    {n:"05",s:"Greek Gift Sacrifice (Bxh7+)",t:"Classic: Bxh7+ Kxh7, Ng5+ Kg8, Qh5 → unstoppable mating attack. Works when you have Ng5 available, Qh5 ready, and Black's pawn shelter is compromised. Calculate before sacrificing!"},
    {n:"06",s:"Active King in Endgames",t:"Once queens are off the board, centralise your king immediately — it becomes a powerful attacking piece. King on e4/d4 dominates king on g8/h8. King opposition and key squares become critical."}
  ]},
  {k:"calc",icon:"🔢",name:"Calculation",desc:"Kotov's candidate moves, CCT method, visualisation.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"Candidate Moves (Kotov)",t:"List ALL reasonable moves before calculating any one. Typically 2-4 candidates. Then calculate each fully without jumping back and forth. \"Hope chess\" (playing the first thing you see) is the biggest beginner mistake."},
    {n:"02",s:"Checks, Captures, Threats",t:"When looking for tactics, always examine checks first, then captures, then threats (CCT). This order finds the most forcing moves. \"Checks are free — always look at every check.\""},
    {n:"03",s:"Calculate to Quiescence",t:"Don't stop calculating in the middle of a sequence of captures. Always continue until the position is quiet. Beginners stop too early and completely miscalculate material outcomes."},
    {n:"04",s:"Visualise the Board",t:"Practice moving pieces in your head without touching them. Start with 2-3 moves deep, work up to 5-6. This is the single skill that most separates club players from strong players."},
    {n:"05",s:"The 5-Second Check",t:"Before every move: (1) Is my piece going to a safe square? (2) Am I leaving anything undefended? (3) Does this allow any opponent tactics? (4) What does my opponent do after this? Takes 5 seconds. Saves games constantly."},
    {n:"06",s:"The Zwischenzug (In-Between Move)",t:"A zwischenzug is an unexpected move inserted into an apparently forced sequence. Example: you expect the opponent to recapture after you take a piece — but instead they play an intermediate check first. Always scan for zwischenzugs when calculating: after each move in a sequence, ask \"does my opponent have an unexpected check or threat BEFORE recapturing?\" Missing zwischenzugs causes more calculation errors than any other oversight."}
  ]},
  {k:"endgames_m",icon:"🏆",name:"Essential Endgames",desc:"K+Q, K+R, K+P, Lucena, Philidor, and more.",level:3,xp:25,type:"rules",data:[
    {n:"01",s:"K+Q vs K: Box Method",t:"Queen makes a shrinking box forcing the enemy king to the edge. Then bring YOUR king to help deliver mate. Queen alone cannot mate — stalemate danger is constant. Keep the enemy king with at least one square at all times."},
    {n:"02",s:"K+R vs K: Barrier Method",t:"Rook on 4th rank cuts the enemy king to one half of the board. Advance your king while the rook holds the barrier. Then push the barrier forward rank by rank until checkmate on the edge."},
    {n:"03",s:"K+P vs K: Key Squares",t:"Key squares: the three squares two ranks ahead of the pawn. If your king reaches ANY of them, the pawn promotes regardless. Opposition determines if you can reach the key squares."},
    {n:"04",s:"Opposition",t:"Kings face each other with one square between them. The side NOT to move has the opposition — the other king must yield. Having opposition = controlling key squares = promoting the pawn."},
    {n:"05",s:"Lucena Position (Winning)",t:"The canonical winning rook + pawn endgame. \"Building a bridge\": play Rg4 (shelter rook), advance king, then Rge4 to interpose when the defending rook checks. The pawn promotes. Every player must know this."},
    {n:"06",s:"Philidor Position (Drawing)",t:"Keep the rook on the 6th rank (barrier) while the attacking king is on rank 4-5. IMMEDIATELY switch to back-rank checks (Ra1) the moment the attacking king advances to the 6th rank. Check forever = draw."},
    {n:"07",s:"Opposite Colour Bishops",t:"Each bishop can't control the squares the other covers. Usually drawn even with an extra pawn — the defender just keeps pieces on the \"wrong colour\" for the attacker's bishop. Classic drawing technique."},
    {n:"08",s:"Rook Behind the Passed Pawn",t:"Tarrasch's Rule: always place the rook BEHIND passed pawns — both yours (gains power as pawn advances) and your opponent's (restrains it from all squares). Never put the rook in front of the pawn!"}
  ]},
  {k:"planning",icon:"📋",name:"Planning & Thinking",desc:"Silman, Karpov, Kotov — how the greats think.",level:3,xp:25,type:"rules",data:[
    {n:"01",s:"Silman's Four Imbalances",t:"Pawn structure, Piece Activity, Space, King Safety. Assess all four before planning. If you have better structure but passive pieces → activate the pieces first. Plan based on what you actually have."},
    {n:"02",s:"Evaluate Before Calculating",t:"Spend 30 seconds evaluating before calculating 10 minutes. If clearly better → find simplest winning plan. If worse → find best defensive resource. Calculation without evaluation = wasted effort."},
    {n:"03",s:"Improve Your Worst Piece (Karpov)",t:"Find the least active piece in your position and give it the best available square. A position where all pieces coordinate well beats one with three great pieces and one terrible one."},
    {n:"04",s:"Attack Where You Have Strength",t:"Your plan must match your advantages. Space advantage on the kingside? Attack there. Passed queenside pawn? Push it. Don't play a kingside attack when your queenside is your real strength."},
    {n:"05",s:"When to Simplify",t:"Trade pieces when: you're ahead in material, opponent has dangerous attacking pieces, you're converting a won endgame. Keep tension when: you have the attack, trading gives opponent equality."},
    {n:"06",s:"The Pre-Move Ritual",t:"Before every move: (1) What's my opponent's threat? (2) Is my piece safe? (3) Am I leaving anything hanging? (4) Can I do better? This 10-second ritual is the difference between 600 ELO and 1200 ELO."}
  ]},
  {k:"psychology",icon:"🎭",name:"Psychology & OTB Play",desc:"Never resign early, clock management, learning from losses.",level:3,xp:25,type:"rules",data:[
    {n:"01",s:"Never Resign Too Early",t:"Beginners resign in positions that are still winnable or even drawn. Never resign until checkmate is forced or position is completely lost with no play left. Opponents blunder even in winning positions — play on!"},
    {n:"02",s:"Don't Rush Under Pressure",t:"Under time pressure or nervousness, beginners speed up — this causes blunders. When you feel rushed: slow down. Use your clock. The 5-second check is most important in the most complex moments."},
    {n:"03",s:"Play the Position, Not the Rating",t:"Rating is history. The game in front of you is the present. A 600-rated player can play a brilliant move. Overlooking threats because \"they won't see it\" is how games are lost."},
    {n:"04",s:"Learn From Every Game",t:"After every loss (and wins), review the game. When did the position turn? What was the key mistake? Use Stockfish on Lichess (free) to analyse. Players who analyse games improve 3× faster than those who don\'t."},
    {n:"05",s:"Habits That Work",t:"20 minutes of focused tactics daily. Play 15+5 minute games for planning practice. Analyse 1 annotated master game per week. These three habits consistently will take you from 600 to 1200 ELO."},
    {n:"06",s:"Tilt and Emotional Control",t:"'Tilt' means playing emotionally after a loss — rushing moves, sacrificing without calculation, ignoring defence. Signs of tilt: playing faster than normal, wanting to \"punish\" the game. Tilting destroys chess performance instantly. Recovery protocol: stop playing immediately. Do 10 easy puzzles instead. Walk away for 10 minutes. Never play more than 2 rapid games back-to-back when losing. One bad game does not define your level."}
  ]}
,
  // ── LEVEL 0: ABSOLUTE BASICS (before Level 1) ──────────────
  {k:"setup",icon:"♟",name:"Board Setup & Notation",desc:"Set up the board correctly and read/write chess moves.",level:1,xp:15,type:"concepts",data:[
    {i:"🎯",n:"Board Setup",t:"White square on the right (h1). Queens on their own colour: white queen on d1 (light), black queen on d8 (dark). Ranks = rows 1-8 (1 nearest White). Files = columns a-h (a on White\'s left). The board has 64 squares, alternating light and dark."},
    {i:"📝",n:"Algebraic Notation",t:"Every square has a unique name: file letter + rank number. e4 = e-file, 4th rank. Moves: piece letter + destination. Pawn moves just show the square (e4). Knight = N, Bishop = B, Rook = R, Queen = Q, King = K. Capture = x (Nxe4). Check = +. Checkmate = #."},
    {i:"🔄",n:"Special Notation",t:"Castling kingside = 0-0. Castling queenside = 0-0-0. En passant: write the capture square. Promotion: e8=Q (pawn to e8 becomes queen). Disambiguation: if two rooks can go to e4, write Rfe4 (rook from f-file) or R1e4 (from rank 1)."},
    {i:"📖",n:"Reading a Game Score",t:"Games are written in pairs: 1.e4 e5 2.Nf3 Nc6 means White played e4, Black played e5, White Nf3, Black Nc6. \"!\" = brilliant move. \"?\" = mistake. \"!?\" = interesting. \"?!\" = dubious. Being able to replay master games from notation is how you study chess."},
    {i:"⚖️",n:"Rules of the Game",t:"You must move on your turn. You cannot move into check. If you have no legal move: checkmate (you lose) or stalemate (draw). Touched piece must be moved (touch-move rule). Say \"j\'adoube\" before adjusting pieces without intent to move."},
    {i:"🏁",n:"How Games End",t:"Checkmate: king is in check with no escape. Resignation: a player gives up. Draw by: stalemate, threefold repetition, 50-move rule (no capture or pawn move for 50 moves), insufficient material (e.g. K vs K, K+B vs K), mutual agreement."}
  ]},
  {k:"stalemate",icon:"🤝",name:"Draws & Stalemate",desc:"The most important traps when converting winning positions — costing beginners hundreds of games.",level:1,xp:20,type:"concepts",data:[
    {i:"⚠️",n:"What is Stalemate?",t:"Stalemate = the player to move has NO legal moves AND their king is NOT in check. Result: immediate draw. This is the #1 way beginners throw away won games. You can be up a queen and still draw if you stalemated your opponent!"},
    {i:"♚",n:"The Classic Stalemate Trap",t:"K+Q vs K: you have queen on g6, enemy king on h8, your king on f6. You play Qh6?? — stalemate! The king has no legal move. ALWAYS check: does the enemy king have at least one legal move? If not, choose a different queen square."},
    {i:"🔄",n:"Threefold Repetition",t:"If the SAME position occurs 3 times (with the same player to move and same castling/en passant rights), either player can claim a draw. Used as a defensive weapon: repeat moves to force a draw when losing. Perpetual check is the most common method."},
    {i:"📏",n:"50-Move Rule",t:"If 50 consecutive moves pass with no pawn move and no capture, either player can claim a draw. This prevents endless shuffling in clearly drawn endgames. Rarely relevant for beginners, but good to know."},
    {i:"💎",n:"Insufficient Material",t:"Automatic draw when neither side can possibly checkmate: K vs K, K+B vs K, K+N vs K, K+B vs K+B (same colour). Note: K+N vs K+N is technically drawable but not automatic — avoid trading into it if you want a result."},
    {i:"✅",n:"How to Avoid Stalemate",t:"Before every move in a winning endgame, ask: \"Does the enemy king have at least one legal move after my move?\" Keep ONE escape square available until you\'re ready to deliver checkmate. Use the \"shrinking box\" method — never cut off ALL squares at once."}
  ]},
  {k:"blundercheck",icon:"🔍",name:"Blunder Prevention",desc:"The single biggest skill gap below 1000 ELO — based on analysis of millions of beginner games.",level:1,xp:25,type:"rules",data:[
    {n:"01",s:"Why Beginners Lose",t:"Analysis of games at 400-800 ELO: over 60% of decisive results are decided by a simple one-move blunder — leaving a piece undefended, moving into a fork, or missing an opponent\'s threat. Tactics and openings matter less than blunder prevention at this level."},
    {n:"02",s:"The Pre-Move Checklist",t:"Before EVERY move: (1) What is my opponent threatening RIGHT NOW? (2) Is the square I\'m moving to safe? (3) Am I leaving any piece undefended? (4) Does my move allow a fork, pin, or skewer? These 4 questions take 10 seconds and will add 200+ ELO."},
    {n:"03",s:"Check Every Check",t:"Before moving, always ask: does my opponent have any checks available? A check forces a specific response and can completely change the game. Many beginners play moves without noticing the opponent can give a devastating check next move."},
    {n:"04",s:"The Hanging Piece Scan",t:"After your opponent moves, IMMEDIATELY scan: did anything become undefended? Did any piece move away from defending something else? Capturing a free piece is always legal. Never pass up free material — the \"desperado\" who misses a free queen loses games they should win."},
    {n:"05",s:"Piece Safety",t:"Count attackers and defenders on every contested square before moving there. If a square has 2 attackers and 1 defender — your piece will be captured! This basic counting stops the most common tactical oversights in beginner games."},
    {n:"06",s:"One-Move Threats",t:"Always look one move ahead for your opponent. \"If I do this, can they do THAT?\" This sounds obvious but most games below 1000 ELO are won by simply spotting one-move threats the opponent missed. The player who consistently does this will rise quickly."}
  ]},
  {k:"coordination",icon:"🤝",name:"Piece Coordination",desc:"Pieces that work together are stronger than the sum of their parts — Capablanca.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"What is Coordination?",t:"Pieces coordinate when they support each other and work toward the same plan. A knight defending a bishop that defends a rook on an open file is coordinated. Pieces pointing at random squares, doing nothing together, are not. This is why \"develop all your pieces\" matters."},
    {n:"02",s:"Connecting the Rooks",t:"After castling and developing all pieces, connect the rooks: clear the back rank so both rooks can see each other. Connected rooks defend each other and can double on an open file instantly. \"Connect your rooks\" is the 5th opening principle after the classic four."},
    {n:"03",s:"The Bishop Pair Working Together",t:"Two bishops on opposite colour squares cover every square on the board together. In open positions, place them on long open diagonals pointing at the enemy king or covering critical central squares. Never block your own bishops with pawns."},
    {n:"04",s:"Good Bishop vs Bad Bishop",t:"A \"good\" bishop is NOT blocked by its own pawns. A \"bad\" bishop IS blocked — its pawns are on the same colour as the bishop, blocking its diagonals. In endgames, the side with the \"good\" bishop almost always wins. Place pawns on the OPPOSITE colour from your bishop!"},
    {n:"05",s:"Rook Lifts",t:"A rook lift is moving a rook from the back rank to the 3rd rank (or a file) to attack. Example: Rf1-f3-g3 threatens Rxg7+ when the g-file is open. Rook lifts are one of the most effective attacking techniques in club chess — beginners rarely see them coming."},
    {n:"06",s:"Knight Outposts vs Bishop Diagonals",t:"Knights and bishops have opposite strengths. In locked positions: knight to the outpost wins. In open positions: bishop on the long diagonal wins. Recognise which piece is better in the current pawn structure and try to exchange the opponent\'s \"good\" piece for your \"bad\" one."}
  ]},
  {k:"converting",icon:"🏁",name:"Converting Won Positions",desc:"How to win games you are already winning — the most neglected beginner skill.",level:2,xp:25,type:"rules",data:[
    {n:"01",s:"Simplify When Ahead",t:"When you have a material advantage, trade pieces (not pawns). Every exchange brings you closer to a technically winning endgame. A rook up in the endgame wins easily. A rook up in a complex middlegame with counterplay is still unclear. Trade towards simplicity."},
    {n:"02",s:"Don\'t Rush — Improve First",t:"The biggest converting mistake: trying to checkmate immediately from a winning position and blundering. Instead: improve the worst-placed piece first. Activate the rook. Centralise the king. Only then look for the knockout blow."},
    {n:"03",s:"Avoid Stalemate (Again!)",t:"When ahead by a lot: slow down. Think before every move. \"Does the enemy king have a legal move?\" This one question prevents the most heartbreaking draws. Better to take 20 extra moves to win cleanly than to rush and stalemate."},
    {n:"04",s:"The Outside Passed Pawn",t:"An outside passed pawn (far from the main action) is a powerful winning weapon. It forces the opponent\'s king to chase it, allowing your king to gobble up pawns on the other side. Create it, then use it as a decoy to invade on the opposite wing."},
    {n:"05",s:"Pawn Breakthrough",t:"When both sides have passed pawns, calculate who promotes first. The key: count the number of moves to promotion (including any captures needed). A pawn 2 squares closer to promotion with equal pieces wins the race. Pawn breakthroughs with 3 vs 2 (a4-b4-c4 vs a5-b5) are decisive tactics."},
    {n:"06",s:"When NOT to Attack",t:"Don\'t attack when: your own king is unsafe, you have undeveloped pieces, the opponent has more pieces defending. A premature attack often leads to a losing counterattack. First: castle, develop, connect rooks. THEN attack. Capablanca called this \"first improve, then attack.\""}
  ]},
  {k:"notation_games",icon:"📚",name:"Famous Games & Study",desc:"Learn by studying the immortal games of Morphy, Fischer, and Kasparov.",level:2,xp:20,type:"concepts",data:[
    {i:"🎩",n:"Paul Morphy — The Opera Game (1858)",t:"Morphy vs Duke of Brunswick: 1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5! cxb5 11.Bxb5+ Nbd7 12.0-0-0! Rd8 13.Rxd7! Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+! Nxb8 17.Rd8#. The perfect game of development and sacrifice. Morphy never wasted a tempo."},
    {i:"⚡",n:"Bobby Fischer — Game of the Century (1956)",t:"Fischer (13 years old!) vs Donald Byrne: After the opening, Fischer sacrificed his queen (13...Nxe4! 14.Bxe4 Qb6! 15.Qb3? Na4!! 16.Qa4 Nxc3) — then won material back with interest through a brilliant series of tactics. Shows that chess is about IDEAS, not memorised moves."},
    {i:"♛",n:"Kasparov vs Topalov (1999)",t:"Kasparov\'s Immortal: includes the famous Rd1!! sacrifice — a rook left en prise for several moves while Kasparov built an unstoppable attack. The game demonstrates that calculation depth, not just tactics, separates great players. Every move had purpose 10 moves ahead."},
    {i:"📖",n:"How to Study Master Games",t:"(1) Play through the game with the notation, making each move on the board. (2) After each move, pause and ask: \"Why was this move played? What plan does it serve?\" (3) At key moments, calculate alternatives before reading the notes. (4) Review the endgame technique carefully — that\'s where most instructive content is."},
    {i:"🎯",n:"What to Look for in Master Games",t:"In the opening: how they develop AND how they build plans from move 1. In the middlegame: the turning point — the moment one player gained the decisive advantage. In the endgame: the technique — how they converted the advantage without blundering. Every master game teaches all three phases simultaneously."},
    {i:"📺",n:"Modern Resources",t:"YouTube: GothamChess (Levy Rozman) for entertaining explanations. Daniel Naroditsky (\"Danya\") for technical depth. John Bartholomew (\"Chess Fundamentals\" series) for structured beginner content. Lichess: free game analysis with Stockfish. Chess.com: daily puzzles and lessons. Chessable: spaced-repetition opening courses."}
  ]},
  {k:"ratings",icon:"📊",name:"Rating System & Improvement",desc:"Understand ELO ratings and build a realistic improvement plan.",level:1,xp:15,type:"concepts",data:[
    {i:"📊",n:"ELO Rating Explained",t:"The ELO system (named after Arpad Elo) measures relative skill. Win vs a stronger player: gain more points. Lose to a weaker player: lose more points. Online ratings vary by platform: Chess.com ratings are typically 100-200 higher than FIDE OTB ratings for the same player."},
    {i:"🎯",n:"Rating Milestones",t:"0-400: learning the rules. 400-800: novice (missing basic tactics). 800-1000: beginner (knows tactics, makes structural mistakes). 1000-1200: improver (solid basics, weak endgames). 1200-1400: club player. 1600+: strong club. 2000+: expert. 2200+: Master. 2500+: Grandmaster."},
    {i:"📈",n:"How to Improve Fastest",t:"Priority order for improvement: (1) Stop blundering — do 20 puzzles daily. (2) Learn basic endgames — K+Q, K+R, K+P vs K. (3) Understand opening principles — not memorisation. (4) Study 1 annotated master game per week. Research shows this order gives the fastest rating improvement for beginners."},
    {i:"⏱️",n:"Time Controls Explained",t:"Bullet: 1-2 min. Blitz: 3-5 min. Rapid: 10-30 min. Classical: 60+ min. For learning: play Rapid (15+10 or 30 min). Bullet and Blitz reinforce bad habits and prevent calculation. Most improvement comes from Rapid games where you have time to think properly."},
    {i:"🔄",n:"The Improvement Cycle",t:"Play → Analyse → Learn → Repeat. After each game, identify the moment things went wrong. Was it a blunder? A positional mistake? An endgame error? Address that specific weakness. Players who analyse consistently improve 3× faster than those who just play."},
    {i:"🏆",n:"Realistic Timeline",t:"With consistent daily practice (30 min): reach 1000 ELO in 3-6 months. Reach 1200 in 6-12 months. Reach 1400 in 1-2 years. These are achievable milestones with focused study. The key: fix blundering first, then tactics, then endgames, then openings — in that exact order."}
  ]},
  {k:"advanced_mates",icon:"⚔️",name:"Advanced Mating Techniques",desc:"K+2B vs K, K+B+N vs K, mating nets — from 100 Endgames You Must Know.",level:3,xp:30,type:"concepts",data:[
    {i:"🎯",n:"Two Bishops vs Lone King",t:"K+2B vs K is a forced win — but requires technique. Drive the king to the corner with the bishops working together. Key: the bishops must never be separated. The mating pattern always ends with the king in the corner — h8 or a1 (or equivalent). Takes 10-20 moves to force from any position."},
    {i:"🐴",n:"Bishop + Knight vs Lone King",t:"K+B+N vs K is the hardest basic mate — but forced! It requires driving the king to the corner that MATCHES the bishop\'s colour. If the bishop is light-squared, mate occurs in the light-squared corner (a8 or h1). The \"W maneuver\" (knight triangle) is the key technique. Takes up to 33 moves."},
    {i:"🔒",n:"The Mating Net",t:"A mating net is a position where the opponent\'s king has very few escape squares and checkmate cannot be avoided even with the best defence. Creating a mating net requires: (1) cut off the king\'s escape routes, (2) bring all your pieces to attacking squares, (3) then deliver the final blow."},
    {i:"⚡",n:"Smothered Mate Setup",t:"The smothered mate requires: enemy king in the corner (g8 or h8), king surrounded by its own pieces (rook on f8, pawns on f7 and g7 or h7). Then: Ng6+ Kh8, Nxf8+ (wait) Kg8, Nd7+ Kh8, Qg8+! Rxg8, Nf7# — knight delivers checkmate with the king smothered. One of chess\'s most beautiful combinations."},
    {i:"🪜",n:"Lawnmower Mate",t:"Two rooks (or rook + queen) cut off the king rank by rank until it\'s pushed to the edge. R1 checks → king moves → R2 cuts off escape → repeat. This \"lawnmower\" approach is the cleanest way to execute K+2R vs K. Never let the rooks interfere with each other — keep them a safe distance apart."},
    {i:"📌",n:"Rook + Bishop Mate",t:"Rook and bishop can force checkmate together against a lone king. Drive the king to a corner matching the bishop\'s colour. The bishop covers key flight squares while the rook delivers check. Example: king on h8, bishop on c3 (covers g7), rook on h1# — checkmate!"}
  ]},
  {k:"advanced_endings",icon:"♜",name:"Advanced Endgame Concepts",desc:"Beyond the basics — rook endings, minor piece endings, pawn races.",level:3,xp:30,type:"rules",data:[
    {n:"01",s:"Rook + Minor Piece vs Rook",t:"Rook + bishop vs rook: usually drawn with correct defence (Philidor-like technique). Rook + knight vs rook: also drawn, but harder to hold. Key for defender: keep the rook active, don\'t let it become passive. A passive rook in these endings loses almost always."},
    {n:"02",s:"Pawn Race: Who Promotes First?",t:"Count moves to promotion for both pawns. If equal, the player NOT to move wins (zugzwang advantage). Factor in: captures needed, en passant possibilities, and whether promotion leads to a winning K+Q vs K+Q endgame (complex!) or a clean win. Queen vs queen after promotion is often drawn!"},
    {n:"03",s:"Bishop vs Knight Endgame",t:"Open position with pawns on both sides: bishop wins. Closed position with all pawns on one side: knight may draw or win. Key technique with bishop: place pawns on OPPOSITE colour to your bishop (bishop covers one colour, pawns control the other — together they cover everything). With knight: put it on an outpost near the key pawns."},
    {n:"04",s:"The Fortress Draw",t:"A player down material can sometimes build a \"fortress\" — a position where the opponent cannot make progress despite the material advantage. Classic: king stuck in the corner with a bishop on the wrong colour for the rook pawn (a8 + wrong-colour bishop = stalemate threat = draw). Recognise fortress patterns!"},
    {n:"05",s:"Rook Endgame: Active vs Passive",t:"Most important rook endgame principle after Tarrasch\'s Rule: an ACTIVE rook (giving checks, attacking pawns) beats a PASSIVE rook (defending) almost always. Even when objectively the defender should draw, passivity usually loses. In rook endgames: keep your rook ACTIVE at all costs."},
    {n:"06",s:"The Swindle",t:"A swindle is saving a lost position through a clever trick the opponent overlooks. Classic swindles: stalemate trap, perpetual check, fortress construction. Learning swindle patterns makes you hard to beat even in lost positions. Korchnoi, the great defender, was the master of swindles in practical play."}
  ]},
  {k:"improvement_plan",icon:"🗓️",name:"Your Study Plan",desc:"A week-by-week plan from 400 to 1200 ELO based on top chess coaches.",level:1,xp:20,type:"rules",data:[
    {n:"W1-4",s:"Weeks 1-4: Stop the Bleeding",t:"Priority: blunder prevention. Do 20 mate-in-1 puzzles EVERY day (chess.com or lichess — free). After each game, find your worst move using the computer analysis. Just ask: \"Where did things go wrong?\" Don\'t study openings yet. Goal: stop hanging pieces."},
    {n:"W5-8",s:"Weeks 5-8: Basic Endgames",t:"Learn K+Q vs K (box method) until you can do it in under 10 moves. Learn K+R vs K (barrier method). Learn K+P vs K (key squares). These 3 endings appear in almost every game. Play 15+10 rapid games — slow enough to think, fast enough to get games in."},
    {n:"W9-12",s:"Weeks 9-12: Tactics Patterns",t:"Work through all 6 tactics patterns in this app. Do 10-20 puzzles daily focussed on forks and pins specifically — these two patterns win the most games at beginner level. Start recognising patterns automatically — this is the core skill. Play and analyse 1 game per day."},
    {n:"W13-16",s:"Weeks 13-16: Opening Structure",t:"Learn 1 white opening (London or Italian — both are in this app). Learn 1 black defence against e4 (Caro-Kann) and 1 against d4 (King\'s Indian). Know the first 6-8 moves cold. Focus on understanding the IDEAS behind the moves, not just memorising sequences."},
    {n:"W17-20",s:"Weeks 17-20: Middlegame Thinking",t:"Study 5 annotated master games (Morphy\'s Opera Game is essential). For each game, pause at every move and ask: \"What is White\'s plan? What is Black\'s plan?\" Start applying Silman\'s imbalances: before each game, identify who has better structure, pieces, space, and king safety."},
    {n:"W21+",s:"Week 21 Onwards: Systematic Improvement",t:"The improvement cycle: Play (15+10 rapid) → Analyse with computer → Identify the type of mistake → Study that specific weakness → Repeat. Most players who follow this system reach 1000 ELO in 4-5 months and 1200 in 8-12 months from a beginner starting point."}
  ]}

,
  // ═══════════════════════════════════════════════════════════════
  // MIDDLEGAME PART 2 — POSITIONAL PLAY (Level 2, 800-1200 ELO)
  // Source: Silman\'s Reassess, Nimzowitsch\'s My System, Simple Chess
  // ═══════════════════════════════════════════════════════════════
  {k:"mid_position",icon:"🏛️",name:"Positional Play",desc:"Silman\'s imbalances, weak squares, color complexes — chess beyond tactics.",level:2,xp:30,type:"rules",data:[
    {n:"01",s:"The 6 Imbalances (Silman)",t:"Jeremy Silman\'s framework from \"How to Reassess Your Chess\": every position contains imbalances that favor one side. The 6 imbalances: (1) Superior minor piece, (2) Pawn structure, (3) Space, (4) Material, (5) Development/Initiative, (6) King safety. Identify which imbalances favor you — your plan exploits them. Identify which favor your opponent — neutralize them first."},
    {n:"02",s:"Weak Squares & Color Complexes",t:"A weak square is one that can no longer be defended by a pawn. If White plays e4 and f4, the d4 and g4 squares become permanently weak — no White pawn can ever recapture there. A color complex is a whole diagonal of weak squares. Place your knights and bishops on the opponent\'s weak squares. Avoid creating your own."},
    {n:"03",s:"Space Advantage — Use It and Fight It",t:"The side with more space has more room for pieces to maneuver. With a space advantage: restrict the opponent\'s pieces, prevent counterplay, slowly improve all pieces. Fighting a space disadvantage: trade pieces (cramped positions get worse with more pieces), find the key pawn break to release the position, exchange the opponent\'s most powerful piece."},
    {n:"04",s:"Open File Domination",t:"Control of an open file is not enough — you must INVADE with it. Rooks on an open file are powerful only when they can reach the 7th rank or attack a backward pawn. The method: (1) Place rook on the open file, (2) If opponent contests it, double rooks, (3) Invade to the 7th rank, (4) Use the 7th-rank rook to attack unmoved pawns or cage the enemy king."},
    {n:"05",s:"The Exchange Sacrifice",t:"Sacrificing a rook for a minor piece (losing 2 points on paper) to gain positional compensation is called an exchange sacrifice. When is it worth it? When: you eliminate the opponent\'s dominant knight on an outpost, you get a powerful dark/light-squared bishop in return, you gain a passed pawn, or you defuse a mating attack. Petrosian was the master — he sacrificed the exchange casually when position demanded it."},
    {n:"06",s:"Piece Restriction — Nimzowitsch",t:"'My System' by Nimzowitsch: sometimes the best plan is simply to RESTRICT the opponent\'s pieces, not to attack. Blockade a passed pawn with a knight (the knight can\'t be driven away by another pawn). Prevent a bishop from getting to a key diagonal. Limit the opponent\'s rook to a passive role. A restricted army cannot generate counterplay. Restriction before attack."}
  ]},

  // ═══════════════════════════════════════════════════════════════
  // MIDDLEGAME PART 3 — STRATEGIC WEAPONS (Level 2, 1000-1400 ELO)
  // Source: Nimzowitsch, Silman, Advanced Chess Ideas
  // ═══════════════════════════════════════════════════════════════
  {k:"mid_strategy",icon:"⚙️",name:"Strategic Weapons",desc:"Blockade, overprotection, pawn levers, and the transition to endgame.",level:2,xp:30,type:"rules",data:[
    {n:"01",s:"Blockade — Nimzowitsch",t:"Nimzowitsch\'s most original idea: place a piece (ideally a knight) directly in front of a passed pawn to blockade it. The blockading piece is perfectly safe — the pawn can never capture it. A knight on d5 blockading a pawn on d4 is one of the strongest squares a piece can occupy. Blockading your opponent\'s passed pawn takes away their winning weapon without a single exchange."},
    {n:"02",s:"Overprotection",t:"Overprotect your KEY pieces and squares beyond what seems necessary. Nimzowitsch: \"Overprotection is the anticipation of future tactical threats.\" If a knight on d5 is doing great work, defend it with 3 pieces even if only 1 is needed. Why? Because when tactics arise, extra defenders make combinations fail. Beginners defend reactively; strong players protect prophylactically."},
    {n:"03",s:"Pawn Levers and Pawn Breaks",t:"A pawn lever is a pawn advance that attacks an opponent\'s pawn, forcing a structural change. Common levers: e4-e5 (breaks open the center in Italian/Ruy), d4-d5 (space grab in QGD), f4-f5 (King\'s Indian attack), c4-c5 (queenside expansion). Plan levers 5-10 moves in advance. Never play a lever that opens lines for the opponent\'s pieces more than yours."},
    {n:"04",s:"Transition to a Winning Endgame",t:"One of the most important positional skills: recognizing when to SIMPLIFY into a winning endgame rather than continue the middlegame. Trade into an endgame when: you have better pawn structure, a passed pawn, a good knight vs bad bishop, or your king is more active. Capablanca was a genius at this — he would reach equal-looking middlegames and steer them into technically won endgames."},
    {n:"05",s:"The Uncastled King as Target",t:"If your opponent\'s king is still in the center after move 10-12, immediately look to open lines against it. Methods: (1) Central pawn break (e4-e5 or d4-d5) to open files, (2) Piece sacrifice to expose the king, (3) Simply leaving the center open and developing faster. An uncastled king in an open game is almost always a decisive weakness — punish it before they castle."},
    {n:"06",s:"When to Simplify vs When to Complicate",t:"Simplify (trade pieces) when: you\'re a pawn up in an endgame, opponent has more active pieces but you have structural edge, you want to reach a technical win. Complicate (keep pieces on) when: you\'re behind in material, your pieces are more active, you have attacking chances, or your opponent is stronger technically. Playing with the wrong approach in either direction loses many games."}
  ]},

  // ═══════════════════════════════════════════════════════════════
  // MIDDLEGAME PART 4 — DEEP CALCULATION (Level 3, 1200-1600 ELO)
  // Source: Kotov\'s Think Like a Grandmaster, Dvoretsky
  // ═══════════════════════════════════════════════════════════════
  {k:"mid_calculation",icon:"🔢",name:"Deep Calculation",desc:"Kotov\'s system, tree of analysis, and calculation under pressure.",level:3,xp:35,type:"rules",data:[
    {n:"01",s:"Kotov\'s Candidate Moves System",t:"From \"Think Like a Grandmaster\": never start calculating without first listing ALL candidate moves. Typically 2-4 moves. Then calculate each ONE fully without switching between them. The \"tree of analysis\" branches from each candidate. Switching between branches mid-calculation causes errors. List candidates → calculate branch 1 fully → branch 2 → choose."},
    {n:"02",s:"Horizon Effect",t:"The horizon effect: stopping calculation just before a key move that changes everything. Always extend your calculation until the position is \"quiet\" — no checks, captures, or major threats available. Beginners stop at 3 moves deep when the crucial move is 4 moves deep. In tactical positions, calculate to quiescence — even if it means calculating 8-10 moves deep."},
    {n:"03",s:"Forcing Lines and Checking for Ghosts",t:"After calculating a long forced line, always double-check your conclusion. Ask: did I miss a defence? This is called checking for ghosts."},
    {n:"04",s:"Pattern Recognition vs Calculation",t:"Expert players calculate LESS than beginners — not more. They recognize patterns instantly (this is a Greek Gift position, this is a back-rank mate pattern) and calculate only the specific details. Build your pattern library through puzzles. When you recognize a pattern, calculation confirms it. When you don\'t recognize a pattern, calculation finds it. Both skills are essential."},
    {n:"05",s:"Calculation Under Time Pressure",t:"When low on time: (1) Stop calculating — trust pattern recognition instead. (2) Look for FORCING moves only — checks, captures, threats. (3) Apply the pre-move checklist fast. (4) Never make a move without at least a 3-second safety check: \"Am I hanging anything? Does my opponent have an immediate tactic?\" Time trouble is when most games are lost — stay disciplined."},
    {n:"06",s:"Visualization Training",t:"The ability to see 6+ moves ahead without moving pieces is a SKILL you can train. Daily practice: (1) Set up a position, close your eyes, calculate 4 moves deep and \"see\" the resulting position. (2) Blindfold chess (even just 5-10 moves) builds board vision dramatically. (3) When solving puzzles, try to see the solution before touching any piece. Visualization separates club players from experts."}
  ]},

  // ═══════════════════════════════════════════════════════════════
  // MIDDLEGAME PART 5 — ADVANCED POSITIONAL (Level 3, 1400-1600+)
  // Source: Silman\'s Amateur\'s Mind, Dvoretsky, Shereshevsky
  // ═══════════════════════════════════════════════════════════════
  {k:"mid_advanced",icon:"♛",name:"Advanced Positional Concepts",desc:"Maneuvering, prophylaxis, piece trades, and grandmaster thinking.",level:3,xp:35,type:"rules",data:[
    {n:"01",s:"Maneuvering — The Long-Range Plan",t:"Maneuvering is moving pieces across the board over multiple moves to reach better squares — without immediate tactics. Example: Nd2-f1-e3-d5 over 4 moves to reach the ideal outpost. Grandmasters maneuver constantly when no immediate action exists. The key: every maneuver must have a DESTINATION. Ask \"where does this piece want to be in 5 moves?\" then route it there."},
    {n:"02",s:"The Principle of Two Weaknesses",t:"Capablanca\'s and Nimzowitsch\'s key strategic principle: attack one weakness, the opponent defends it. Then create a SECOND weakness on the other side of the board. The opponent cannot defend both simultaneously. Classic method: tie down their rook defending a weak d-pawn, then open the h-file on the kingside. Their rook can\'t be in two places at once."},
    {n:"03",s:"Strategic Piece Trades",t:"Trading pieces is a STRATEGIC decision, not just a tactical one. Trade when: your piece is worse than your opponent\'s equivalent (your bad bishop for their good knight), trading eliminates the opponent\'s key defender, trading reaches a winning endgame, or the traded pieces benefit your position structure more than theirs. Never trade automatically — always ask \"who benefits from this trade?\""},
    {n:"04",s:"Prophylaxis — Petrosian and Karpov",t:"Prophylaxis at its highest level: see the opponent\'s best plan 5-10 moves ahead and stop it before it starts. Tigran Petrosian (1963-1969 World Champion) would make quiet moves that seemed to accomplish nothing — but each one prevented a specific threat 6 moves in the future. Karpov refined this further. Ask every move: \"What is my opponent's IDEAL plan? How do I prevent it?\""},
    {n:"05",s:"Assessing a Position Objectively",t:"Strong players assess positions like scientists, not lawyers. Don't look for reasons why your position is good — evaluate it truthfully. Questions: Is my king safer? Are my pieces more active? Is my pawn structure better? Do I have more space? Who has the better long-term plan? A truthful assessment prevents you from pursuing wrong plans out of wishful thinking — one of the most common mistakes at all levels."},
    {n:"06",s:"The Amateur vs Master Mindset",t:"From Silman's \"The Amateur's Mind\": amateurs ask \"what tactic is available?\" Masters ask \"who stands better and why?\" Amateurs react move-by-move. Masters plan 10 moves ahead. Amateurs want to checkmate — masters want to create superior structure. Amateurs attack with 2 pieces — masters bring all pieces before attacking. The shift from amateur to master thinking is the most important improvement you can make."}
  ]}

];

// ── PRACTICE EXERCISES (one per lesson module) ─────────────────
const PRACTICE_DATA: Record<string, Array<{title:string;desc:string;board:Record<string,string>;turn:'w'|'b';solution:string[];hint:string;}>> = {
  pieces:[{title:"Knight Fork!",desc:"Move the white knight to attack both black rooks at once.",board:{e1:'wK',d2:'wN',e8:'bK',a5:'bR',b6:'bR'},turn:'w',solution:['d2c4'],hint:"Look for the square where a knight attacks BOTH enemy rooks simultaneously."}],
  values:[{title:"Win the Exchange",desc:"Your bishop can capture a much more valuable piece. Find it!",board:{e1:'wK',c5:'wB',e8:'bK',a7:'bR',d6:'bN'},turn:'w',solution:['c5a7'],hint:"Bishops move diagonally. Can you reach the black rook in one move?"}],
  opprinciples:[{title:"Best Opening Move",desc:"After 1.e4 e5 — develop a piece that attacks the e5 pawn!",board:{e1:'wK',d1:'wQ',a1:'wR',h1:'wR',c1:'wB',f1:'wB',b1:'wN',g1:'wN',a2:'wP',b2:'wP',c2:'wP',d2:'wP',f2:'wP',g2:'wP',h2:'wP',e4:'wP',e8:'bK',d8:'bQ',a8:'bR',h8:'bR',c8:'bB',f8:'bB',b8:'bN',g8:'bN',a7:'bP',b7:'bP',c7:'bP',d7:'bP',f7:'bP',g7:'bP',h7:'bP',e5:'bP'},turn:'w',solution:['g1f3'],hint:"Develop a knight toward the center. Which knight attacks the e5 pawn?"}],
  tempo:[{title:"Gain a Tempo",desc:"Capture a pawn AND give check at the same time — gaining a free move!",board:{e1:'wK',h1:'wR',c4:'wB',e8:'bK',d6:'bQ',e5:'bP',f7:'bP'},turn:'w',solution:['c4f7'],hint:"Your bishop can take a pawn and deliver check simultaneously."}],
  repwhite:[{title:"Play the Queen's Gambit",desc:"After 1.d4 d5 — offer the Queen's Gambit pawn!",board:{e1:'wK',d1:'wQ',a1:'wR',h1:'wR',c1:'wB',f1:'wB',b1:'wN',g1:'wN',a2:'wP',b2:'wP',c2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP',d4:'wP',e8:'bK',d8:'bQ',a8:'bR',h8:'bR',c8:'bB',f8:'bB',b8:'bN',g8:'bN',a7:'bP',b7:'bP',c7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',d5:'bP'},turn:'w',solution:['c2c4'],hint:"Offer a pawn to fight for the center. The Queen's Gambit move is classic!"}],
  repblack:[{title:"Caro-Kann Defence",desc:"White played 1.e4 — respond with the solid Caro-Kann!",board:{e1:'wK',d1:'wQ',a1:'wR',h1:'wR',c1:'wB',f1:'wB',b1:'wN',g1:'wN',a2:'wP',b2:'wP',c2:'wP',d2:'wP',f2:'wP',g2:'wP',h2:'wP',e4:'wP',e8:'bK',d8:'bQ',a8:'bR',h8:'bR',c8:'bB',f8:'bB',b8:'bN',g8:'bN',a7:'bP',b7:'bP',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP'},turn:'b',solution:['c7c6'],hint:"Prepare ...d5 next move. Which pawn move prepares to fight for the centre?"}],
  tactics_m:[{title:"Spot the Fork",desc:"Move the white knight to attack two black pieces at once!",board:{e1:'wK',f3:'wN',e8:'bK',d6:'bQ',f6:'bR'},turn:'w',solution:['f3e5'],hint:"The knight can jump to a square that attacks the queen AND creates a fork."}],
  mates:[{title:"Back-Rank Checkmate",desc:"The black king is trapped by its own pawns. Deliver checkmate!",board:{g1:'wK',e1:'wR',g8:'bK',g7:'bP',h7:'bP',f7:'bP',e8:'bR'},turn:'w',solution:['e1e8'],hint:"Your rook can land on a square where the black king has no escape — its own pawns block it!"}],
  middle_basics:[{title:"Activate Your Worst Piece",desc:"Your rook on a1 is doing nothing. Find the move to make it active!",board:{g1:'wK',a1:'wR',f3:'wN',g2:'wP',h2:'wP',g8:'bK',g7:'bP',h7:'bP',d7:'bP',d4:'bP'},turn:'w',solution:['a1d1'],hint:"Put the rook on an open file where it has maximum influence!"}],
  middle_threats:[{title:"Double Attack!",desc:"Find the move that attacks the black king AND wins the rook!",board:{e1:'wK',d5:'wQ',a1:'wR',e8:'bK',h8:'bR',g7:'bP',h7:'bP'},turn:'w',solution:['d5g8'],hint:"Your queen can move to a square that checks the king AND attacks the rook."}],
  middle_planning:[{title:"Improve the Worst Piece",desc:"Your bishop on c1 is completely blocked. Find the best square for it!",board:{g1:'wK',c1:'wB',f3:'wN',g2:'wP',h2:'wP',d3:'wP',e4:'wP',g8:'bK',g7:'bP',h7:'bP',d6:'bP',e5:'bP'},turn:'w',solution:['c1g5'],hint:"Develop the bishop to where it is active and eyes the opponent's position."}],
  middle_attack:[{title:"Greek Gift Sacrifice",desc:"Sacrifice the bishop to open the king — Bxh7+ is the classic attack!",board:{e1:'wK',d1:'wQ',c4:'wB',f3:'wN',e4:'wP',g8:'bK',g7:'bP',f7:'bP',h7:'bP',f6:'bN',d5:'bP'},turn:'w',solution:['c4h7'],hint:"The bishop sacrifice on h7 draws out the king. Is the king exposed enough?"}],
  middle_defense:[{title:"Perpetual Check!",desc:"You are losing — but you can draw by checking the king forever. Find it!",board:{h1:'wK',g3:'wQ',h8:'bK',h7:'bP',g7:'bP',a1:'bQ'},turn:'w',solution:['g3h4'],hint:"Find a check the king cannot escape from — you can repeat this forever for a draw."}],
  middle_200:[{title:"Spot the Hanging Piece",desc:"One of Black's pieces is completely undefended. Capture it for free!",board:{e1:'wK',e4:'wN',a1:'wR',e8:'bK',d6:'bQ',g5:'bB',h7:'bP',g7:'bP'},turn:'w',solution:['e4g5'],hint:"Scan the board: which black piece has no defenders? Take it!"}],
  pawns:[{title:"Push the Passed Pawn",desc:"Your passed pawn is unstoppable. Push it toward promotion!",board:{e1:'wK',e6:'wP',e8:'bK'},turn:'w',solution:['e6e7'],hint:"A passed pawn with no enemy pawns in front of it must be pushed forward!"}],
  kingsafe:[{title:"Castle to Safety",desc:"Your king is in the centre — castle to safety before it's too late!",board:{e1:'wK',a1:'wR',h1:'wR',f1:'wB',g1:'wN',d2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP',e8:'bK',a8:'bR',h8:'bR',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',c6:'bB',f6:'bN'},turn:'w',solution:['e1g1'],hint:"Castle kingside! The king moves 2 squares toward the h-rook."}],
  calc:[{title:"Calculate the Combination",desc:"Find the move that wins material by force — calculate 2 moves ahead!",board:{e1:'wK',e4:'wR',d3:'wB',e8:'bK',e7:'bR',f6:'bN'},turn:'w',solution:['e4e7'],hint:"What happens if you take the rook? Calculate the full sequence before moving!"}],
  endgames_m:[{title:"Box the King",desc:"Use your queen to cut off the black king — start the box method!",board:{e1:'wK',d4:'wQ',h8:'bK'},turn:'w',solution:['d4d7'],hint:"Place the queen to cut off the king's movement. Shrink the box step by step!"}],
  planning:[{title:"Rook to the Open File",desc:"The d-file is completely open. Centralise your rook!",board:{g1:'wK',a1:'wR',g2:'wP',h2:'wP',c3:'wP',e3:'wP',g8:'bK',g7:'bP',h7:'bP',c6:'bP',e6:'bP'},turn:'w',solution:['a1d1'],hint:"Open files are highways for rooks. Which file has no pawns on it?"}],
  psychology:[{title:"Find the Draw",desc:"You are losing badly, but a perpetual check saves the game. Find it!",board:{h1:'wK',e4:'wQ',h8:'bK',g7:'bP',h7:'bP',a8:'bQ',a1:'bR'},turn:'w',solution:['e4h7'],hint:"Give check and see if the king can escape. If not, keep checking — it's a draw!"}],
  setup:[{title:"Make the First Move",desc:"White always moves first. Play the classical opening pawn move!",board:{e1:'wK',d1:'wQ',a1:'wR',h1:'wR',c1:'wB',f1:'wB',b1:'wN',g1:'wN',a2:'wP',b2:'wP',c2:'wP',d2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP',e8:'bK',d8:'bQ',a8:'bR',h8:'bR',c8:'bB',f8:'bB',b8:'bN',g8:'bN',a7:'bP',b7:'bP',c7:'bP',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP'},turn:'w',solution:['e2e4'],hint:"The most popular first move in chess — controls the center with a pawn!"}],
  stalemate:[{title:"Win Without Stalemate",desc:"You have a queen advantage — but ONE wrong move stalemates Black. Find the safe winning move!",board:{g1:'wK',b6:'wQ',h8:'bK'},turn:'w',solution:['b6b7'],hint:"The black king must keep at least one legal move. Which queen move gives the king space to move but still forces it to the edge?"}],
  blundercheck:[{title:"Don't Hang Your Queen!",desc:"One of your moves loses the queen immediately. Find the SAFE move instead!",board:{e1:'wK',d1:'wQ',e8:'bK',c2:'bR',g5:'bB'},turn:'w',solution:['d1e2'],hint:"Before moving, check: is your queen safe from the bishop AND the rook on c2?"}],
  coordination:[{title:"Connect the Rooks",desc:"Your rooks are disconnected. Play the move that connects them!",board:{e1:'wK',a1:'wR',h1:'wR',e2:'wP',f2:'wP',g2:'wP',h2:'wP',b1:'wN',g1:'wN',f1:'wB',c1:'wB',d1:'wQ',e8:'bK',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',a7:'bP',b7:'bP',c7:'bP',a8:'bR',h8:'bR',b8:'bN',g8:'bN',c8:'bB',f8:'bB',d8:'bQ'},turn:'w',solution:['f1e2'],hint:"To connect rooks, clear the back rank. Which piece blocks them?"}],
  converting:[{title:"Trade Into a Won Endgame",desc:"You are a rook up. Simplify by exchanging queens — then it's a simple technical win!",board:{e1:'wK',e4:'wR',d3:'wQ',a1:'wR',e8:'bK',d6:'bQ',h7:'bP',g7:'bP'},turn:'w',solution:['d3d6'],hint:"Trade queens when you have a large material advantage — the endgame is easier to win!"}],
  notation_games:[{title:"Morphy's Key Move",desc:"Re-create the key sacrifice from Morphy's Opera Game — take the rook on d7!",board:{e1:'wK',d1:'wR',g5:'wB',e8:'bK',d7:'bR',d8:'bR',c6:'bN'},turn:'w',solution:['d1d7'],hint:"Morphy sacrificed the exchange to destroy coordination. Take the rook on d7!"}],
  ratings:[{title:"Win Material",desc:"A simple tactic to test your awareness — win the undefended piece!",board:{e1:'wK',c3:'wN',e8:'bK',e5:'bB',h7:'bP',g7:'bP'},turn:'w',solution:['c3e4'],hint:"Which square can your knight move to where it attacks the undefended bishop?"}],
  advanced_mates:[{title:"Two Bishops Attack",desc:"Drive the lone king to the corner using both bishops!",board:{e1:'wK',d5:'wB',e5:'wB',h8:'bK'},turn:'w',solution:['d5f7'],hint:"Use the bishops to cut off the king's escape routes. Push it toward the corner!"}],
  advanced_endings:[{title:"Lucena — Build the Bridge",desc:"Play the Lucena winning technique — shelter your king with the rook!",board:{e1:'wK',e7:'wP',g7:'wR',g8:'bK',a8:'bR'},turn:'w',solution:['g7g4'],hint:"The Lucena method: move the rook to the 4th rank to shelter the advancing king!"}],
  improvement_plan:[{title:"Daily Tactic",desc:"A classic puzzle to sharpen your tactical vision — find the best move!",board:{e1:'wK',f5:'wN',a1:'wR',e8:'bK',d8:'bQ',g7:'bP',h7:'bP'},turn:'w',solution:['f5e7'],hint:"The knight can jump to a square that forks the king and queen!"}],
  mid_position:[{title:"Occupy the Weak Square",desc:"The d5 square cannot be defended by any black pawn. Occupy it with your knight!",board:{e1:'wK',c3:'wN',g2:'wP',h2:'wP',e4:'wP',e8:'bK',g7:'bP',h7:'bP',e6:'bP',c6:'bP',f6:'bN'},turn:'w',solution:['c3d5'],hint:"A weak square is one no enemy pawn can attack. Centralise your knight there!"}],
  mid_strategy:[{title:"Blockade the Passer",desc:"Black has a dangerous passed pawn on d4. Blockade it with your knight!",board:{e1:'wK',e4:'wN',g2:'wP',h2:'wP',e8:'bK',g7:'bP',h7:'bP',d4:'bP'},turn:'w',solution:['e4d2'],hint:"Put the knight directly in front of the passer — it can never be driven away by a pawn!"}],
  mid_calculation:[{title:"Calculate the Forced Mate",desc:"Calculate 3 moves ahead — there is a forced checkmate sequence here!",board:{h1:'wK',g3:'wR',h3:'wR',h7:'bK',g7:'bP',f7:'bP'},turn:'w',solution:['g3g7'],hint:"Look for checks that limit the king's escape. Calculate every king move."}],
  mid_advanced:[{title:"Strategic Knight Maneuver",desc:"Your knight wants to reach d5 — the ideal outpost. Route it there!",board:{e1:'wK',b1:'wN',g2:'wP',h2:'wP',c3:'wP',e4:'wP',e8:'bK',g7:'bP',h7:'bP',c6:'bP',e6:'bP'},turn:'w',solution:['b1c3'],hint:"Maneuver: knight goes b1-c3-d5 over two moves. Take the first step!"}],
};

const OPS={
qgd:{n:"Queen's Gambit",vars:{
  qgd_dec:{name:"QGD — Classical (2…e6)",desc:"Most solid reply — Black builds a strong centre.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Stake a claim in the centre.'},
    {f:'d7',t:'d5',s:'b',l:'1…d5',c:'Black fights for equal central space.'},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:"The Queen's Gambit! Offering the pawn to gain a huge centre."},
    {f:'e7',t:'e6',s:'b',l:'2…e6',c:'Declined! Solid — supports d5, opens the dark bishop.'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Develop and reinforce the centre.'},
    {f:'g8',t:'f6',s:'b',l:'3…Nf6',c:'Develop and attack e4 — prepares castling.'},
    {f:'c1',t:'g5',s:'w',l:'4.Bg5',c:"Pin Black's knight — classic QGD pressure!"},
    {f:'f8',t:'e7',s:'b',l:'4…Be7',c:'Unpin and prepare to castle. Very solid.'}
  ]},
  qga:{name:"QGA — Accepted (2…dxc4)",desc:"Black takes the pawn — White gets a dominant centre.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Queen pawn.'},
    {f:'d7',t:'d5',s:'b',l:'1…d5',c:'Contests the centre.'},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:'Gambit offer.'},
    {f:'d5',t:'c4',s:'b',l:'2…dxc4',c:'Accepted! Surrenders central control for the pawn.'},
    {f:'e2',t:'e4',s:'w',l:'3.e4',c:'Massive centre — the reward for the gambit!'},
    {f:'g8',t:'f6',s:'b',l:'3…Nf6',c:'Attack the centre with pieces.'},
    {f:'g1',t:'f3',s:'w',l:'4.Nf3',c:'Develop and defend e4. White is better!'}
  ]},
  slav:{name:"Slav Defence (2…c6)",desc:"Supports d5 keeping the c8 bishop free.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Queen pawn.'},
    {f:'d7',t:'d5',s:'b',l:'1…d5',c:'Central fight.'},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:'Gambit.'},
    {f:'c7',t:'c6',s:'b',l:'2…c6',c:"Slav! Supports d5, bishop stays free — no 'bad French bishop'."},
    {f:'g1',t:'f3',s:'w',l:'3.Nf3',c:'Natural development.'},
    {f:'g8',t:'f6',s:'b',l:'3…Nf6',c:'Both knights out.'},
    {f:'b1',t:'c3',s:'w',l:'4.Nc3',c:'Reinforce d4. Solid strategic battle ahead.'}
  ]}
}},
london:{n:"London System",vars:{
  main:{name:"vs 1…d5 (Main Line)",desc:"London triangle: d4 + Bf4 + e3. Solid against everything.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'London always starts here.'},
    {f:'d7',t:'d5',s:'b',l:'1…d5',c:'Central fight.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop the knight first.'},
    {f:'g8',t:'f6',s:'b',l:'2…Nf6',c:'Both knights develop.'},
    {f:'c1',t:'f4',s:'w',l:'3.Bf4',c:"London bishop — placed BEFORE e3 so it's never locked in!"},
    {f:'e7',t:'e6',s:'b',l:'3…e6',c:'Solid. Prepares to develop f8 bishop.'},
    {f:'e2',t:'e3',s:'w',l:'4.e3',c:'Complete the triangle. White is solid.'},
    {f:'c7',t:'c5',s:'b',l:'4…c5',c:'Black attacks d4. White calmly maintains with c3 or Nbd2.'}
  ]},
  vs_nf6:{name:"vs 1…Nf6 g6 (King's Indian)",desc:"London works just as well against the fianchetto.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'London start.'},
    {f:'g8',t:'f6',s:'b',l:'1…Nf6',c:"King's Indian move order."},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop — London adapts to anything.'},
    {f:'g7',t:'g6',s:'b',l:'2…g6',c:'Fianchetto prep.'},
    {f:'c1',t:'f4',s:'w',l:'3.Bf4',c:'London bishop — same plan regardless!'},
    {f:'f8',t:'g7',s:'b',l:'3…Bg7',c:"King's Indian bishop. Powerful on g7."},
    {f:'e2',t:'e3',s:'w',l:'4.e3',c:"London triangle complete. White is solid against Black's setup."}
  ]}
}},
italian:{n:"Italian Game",vars:{
  giuoco:{name:"Giuoco Piano (3…Bc5)",desc:"Classical — both sides mirror bishops.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Most popular first move.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Equal centre — open game!'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Attack e5 and develop.'},
    {f:'b8',t:'c6',s:'b',l:'2…Nc6',c:'Defend e5 with a piece, not a pawn.'},
    {f:'f1',t:'c4',s:'w',l:'3.Bc4',c:'Italian bishop — eyes the f7 weakness!'},
    {f:'f8',t:'c5',s:'b',l:'3…Bc5',c:'Giuoco Piano — equal and classical.'},
    {f:'c2',t:'c3',s:'w',l:'4.c3',c:'Prepare d4 — Italian plan.'},
    {f:'g8',t:'f6',s:'b',l:'4…Nf6',c:'Attack e4 and prepare to castle.'}
  ]},
  two_knights:{name:"Two Knights (3…Nf6)",desc:"More aggressive — Black counterattacks e4.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open game.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Equal centre.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Attack e5.'},
    {f:'b8',t:'c6',s:'b',l:'2…Nc6',c:'Defend e5.'},
    {f:'f1',t:'c4',s:'w',l:'3.Bc4',c:'Italian bishop.'},
    {f:'g8',t:'f6',s:'b',l:'3…Nf6',c:'Two Knights! Counterattacks e4 directly.'},
    {f:'d2',t:'d3',s:'w',l:'4.d3',c:'Solid. White defends e4 and prepares slow buildup.'},
    {f:'f8',t:'c5',s:'b',l:'4…Bc5',c:'Natural development. Balanced game ahead.'}
  ]}
}},
ruy:{n:"Ruy López",vars:{
  morphy:{name:"Morphy Defence (3…a6)",desc:"Most popular — challenges the bishop immediately.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open game.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Equal centre.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Attack e5.'},
    {f:'b8',t:'c6',s:'b',l:'2…Nc6',c:'Defend e5.'},
    {f:'f1',t:'b5',s:'w',l:'3.Bb5',c:'The Ruy López! Pin the knight — e5 is indirectly threatened.'},
    {f:'a7',t:'a6',s:'b',l:'3…a6',c:"Challenge the bishop! Morphy's move and most popular for 150 years."},
    {f:'b5',t:'a4',s:'w',l:'4.Ba4',c:'Retreat but keep the pin. Ba4 is stronger than taking on c6.'},
    {f:'g8',t:'f6',s:'b',l:'4…Nf6',c:'Attack e4! Both sides ready for the main battle.'}
  ]},
  berlin:{name:"Berlin Defence (3…Nf6)",desc:"Ultra-solid — the drawing weapon Kramnik used to beat Kasparov.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Equal.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop.'},
    {f:'b8',t:'c6',s:'b',l:'2…Nc6',c:'Defend.'},
    {f:'f1',t:'b5',s:'w',l:'3.Bb5',c:'Ruy López.'},
    {f:'g8',t:'f6',s:'b',l:'3…Nf6',c:"Berlin! Ignores the pin and attacks e4 — ultra-solid."},
    {f:'e1',t:'g1',s:'w',l:'4.0-0',c:'Castle early. White will play Re1 to defend e4.'},
    {f:'f6',t:'e4',s:'b',l:'4…Nxe4',c:'Black takes e4! The Berlin endgame — solid and drawish for Black.'}
  ]},
  exchange:{name:"Exchange Variation (4.Bxc6)",desc:"White doubles Black's pawns — structural imbalance.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Equal.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop.'},
    {f:'b8',t:'c6',s:'b',l:'2…Nc6',c:'Defend.'},
    {f:'f1',t:'b5',s:'w',l:'3.Bb5',c:'Ruy López.'},
    {f:'a7',t:'a6',s:'b',l:'3…a6',c:'Challenge.'},
    {f:'b5',t:'c6',s:'w',l:'4.Bxc6',c:"Exchange! White gives up the bishop to double Black's c-pawns."},
    {f:'d7',t:'c6',s:'b',l:'4…dxc6',c:'Doubled c-pawns are weak but Black gets the bishop pair and open d-file.'}
  ]}
}},
kid:{n:"King's Indian Defence",vars:{
  classical:{name:"Classical Variation",desc:"Black allows the big centre, then counterattacks with …e5.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'White opens with the queen pawn.'},
    {f:'g8',t:'f6',s:'b',l:'1…Nf6',c:"King's Indian begins — knight controls e4."},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:'White builds a massive centre.'},
    {f:'g7',t:'g6',s:'b',l:'2…g6',c:'Fianchetto preparation.'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Develop and support e4.'},
    {f:'f8',t:'g7',s:'b',l:'3…Bg7',c:'The KID bishop — a long-range weapon!'},
    {f:'e2',t:'e4',s:'w',l:'4.e4',c:"White's huge centre: c4+d4+e4. But it can become a target!"},
    {f:'d7',t:'d6',s:'b',l:'4…d6',c:'Prepare …e5 — the defining KID counterattack.'}
  ]},
  four_pawns:{name:"Four Pawns Attack",desc:"White grabs all four centre pawns — aggressive and ambitious.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Queen pawn.'},
    {f:'g8',t:'f6',s:'b',l:'1…Nf6',c:"KID."},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:'Centre.'},
    {f:'g7',t:'g6',s:'b',l:'2…g6',c:'Fianchetto.'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Develop.'},
    {f:'f8',t:'g7',s:'b',l:'3…Bg7',c:'KID bishop.'},
    {f:'e2',t:'e4',s:'w',l:'4.e4',c:'Big centre.'},
    {f:'d7',t:'d6',s:'b',l:'4…d6',c:'Prepare …e5.'},
    {f:'f2',t:'f4',s:'w',l:'5.f4',c:'Four Pawns Attack! White grabs all four centre pawns — very aggressive but overextended.'}
  ]}
}},
sicilian:{n:"Sicilian Defence",vars:{
  najdorf:{name:"Najdorf (5…a6)",desc:"Most popular opening in the world. Kasparov's lifelong weapon.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open game.'},
    {f:'c7',t:'c5',s:'b',l:'1…c5',c:"Sicilian! Black fights for d4 asymmetrically."},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop and prepare d4.'},
    {f:'d7',t:'d6',s:'b',l:'2…d6',c:'Support e5 and prepare Nf6.'},
    {f:'d2',t:'d4',s:'w',l:'3.d4',c:'Open the centre — White gets space, Black gets counterplay.'},
    {f:'c5',t:'d4',s:'b',l:'3…cxd4',c:'Capture — opens the c-file for Black!'},
    {f:'f3',t:'d4',s:'w',l:'4.Nxd4',c:'Recapture. White has space, Black has the c-file.'},
    {f:'g8',t:'f6',s:'b',l:'4…Nf6',c:'Develop and attack e4.'},
    {f:'b1',t:'c3',s:'w',l:'5.Nc3',c:'Defend e4.'},
    {f:'a7',t:'a6',s:'b',l:'5…a6',c:"Najdorf! Stops Bb5 and prepares …b5. World champions' choice."}
  ]},
  dragon:{name:"Dragon Variation (5…g6)",desc:"Black fianchettoes — the dragon bishop on g7 is legendary.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open.'},
    {f:'c7',t:'c5',s:'b',l:'1…c5',c:'Sicilian.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop.'},
    {f:'d7',t:'d6',s:'b',l:'2…d6',c:'Prepare Nf6.'},
    {f:'d2',t:'d4',s:'w',l:'3.d4',c:'Centre.'},
    {f:'c5',t:'d4',s:'b',l:'3…cxd4',c:'Capture.'},
    {f:'f3',t:'d4',s:'w',l:'4.Nxd4',c:'Recapture.'},
    {f:'g8',t:'f6',s:'b',l:'4…Nf6',c:'Develop.'},
    {f:'b1',t:'c3',s:'w',l:'5.Nc3',c:'Develop.'},
    {f:'g7',t:'g6',s:'b',l:'5…g6',c:'Dragon! The g7 bishop will be a monster on the long diagonal.'}
  ]},
  kan:{name:"Kan/Taimanov (5…a6/5…Nc6)",desc:"Flexible Sicilian — Black keeps options open.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open.'},
    {f:'c7',t:'c5',s:'b',l:'1…c5',c:'Sicilian.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop.'},
    {f:'e7',t:'e6',s:'b',l:'2…e6',c:'Flexible — keeps options open.'},
    {f:'d2',t:'d4',s:'w',l:'3.d4',c:'Centre.'},
    {f:'c5',t:'d4',s:'b',l:'3…cxd4',c:'Capture.'},
    {f:'f3',t:'d4',s:'w',l:'4.Nxd4',c:'Recapture.'},
    {f:'b8',t:'c6',s:'b',l:'4…Nc6',c:'Develop the knight — Taimanov variation.'},
    {f:'b1',t:'c3',s:'w',l:'5.Nc3',c:'Develop.'},
    {f:'d8',t:'c7',s:'b',l:'5…Qc7',c:'Taimanov! Flexible, solid, avoids sharp theory.'}
  ]}
}},
french:{n:"French Defence",vars:{
  classical:{name:"Classical (3.Nc3)",desc:"Most common — knight defends e4.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open game.'},
    {f:'e7',t:'e6',s:'b',l:'1…e6',c:'French Defence! Prepares d5 — solid but slightly passive.'},
    {f:'d2',t:'d4',s:'w',l:'2.d4',c:'White builds a big centre.'},
    {f:'d7',t:'d5',s:'b',l:'2…d5',c:'Challenge the centre immediately!'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Classical — defend e4 with the knight.'},
    {f:'g8',t:'f6',s:'b',l:'3…Nf6',c:'Attack e4 again.'},
    {f:'c1',t:'g5',s:'w',l:'4.Bg5',c:"Pin the knight — pressure on d5. Key French idea."},
    {f:'f8',t:'e7',s:'b',l:'4…Be7',c:'Unpin and prepare to castle. Solid French structure.'}
  ]},
  advance:{name:"Advance (3.e5)",desc:"White grabs space — Black attacks the chain base d4.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open.'},
    {f:'e7',t:'e6',s:'b',l:'1…e6',c:'French.'},
    {f:'d2',t:'d4',s:'w',l:'2.d4',c:'Centre.'},
    {f:'d7',t:'d5',s:'b',l:'2…d5',c:'Challenge.'},
    {f:'e4',t:'e5',s:'w',l:'3.e5',c:'Advance! White grabs space — Black attacks the chain base at d4.'},
    {f:'c7',t:'c5',s:'b',l:'3…c5',c:'Attack d4! Undermine the chain base — correct plan!'},
    {f:'c2',t:'c3',s:'w',l:'4.c3',c:'Defend d4. White will play Nf3 and Bd3.'},
    {f:'b8',t:'c6',s:'b',l:'4…Nc6',c:'Develop and pressure d4. French is alive!'}
  ]},
  tarrasch:{name:"Tarrasch (3.Nd2)",desc:"Solid — avoids the pin on c3, targets the IQP.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open.'},
    {f:'e7',t:'e6',s:'b',l:'1…e6',c:'French.'},
    {f:'d2',t:'d4',s:'w',l:'2.d4',c:'Centre.'},
    {f:'d7',t:'d5',s:'b',l:'2…d5',c:'Challenge.'},
    {f:'b1',t:'d2',s:'w',l:'3.Nd2',c:'Tarrasch! Avoids the Nimzo-pin on c3. Solid and positional.'},
    {f:'c7',t:'c5',s:'b',l:'3…c5',c:'Attack the centre. Black will often get an IQP but active play.'},
    {f:'e4',t:'d5',s:'w',l:'4.exd5',c:'Exchange — White aims for a positional game targeting the IQP.'},
    {f:'e6',t:'d5',s:'b',l:'4…exd5',c:'Recapture. Black has the IQP — dynamic equality.'}
  ]}
}},
caro:{n:"Caro-Kann Defence",vars:{
  classical:{name:"Classical (4…Bf5)",desc:"Bishop out before the pawns close — no bad bishop!",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open.'},
    {f:'c7',t:'c6',s:'b',l:'1…c6',c:'Caro-Kann! Prepare d5 with pawn support.'},
    {f:'d2',t:'d4',s:'w',l:'2.d4',c:'Centre.'},
    {f:'d7',t:'d5',s:'b',l:'2…d5',c:"Challenge e4 — that was the whole point of c6."},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Defend e4.'},
    {f:'d5',t:'e4',s:'b',l:'3…dxe4',c:'Exchange — opens the c8 bishop diagonal.'},
    {f:'c3',t:'e4',s:'w',l:'4.Nxe4',c:'Recapture with the knight.'},
    {f:'c8',t:'f5',s:'b',l:'4…Bf5',c:"Classical! Bishop comes out BEFORE e6 — it'll never be locked in. Better than French!"}
  ]},
  advance:{name:"Advance (3.e5)",desc:"Same structure as French Advance but bishop is outside.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open.'},
    {f:'c7',t:'c6',s:'b',l:'1…c6',c:'Caro-Kann.'},
    {f:'d2',t:'d4',s:'w',l:'2.d4',c:'Centre.'},
    {f:'d7',t:'d5',s:'b',l:'2…d5',c:'Challenge.'},
    {f:'e4',t:'e5',s:'w',l:'3.e5',c:'Advance! Space grab.'},
    {f:'c8',t:'f5',s:'b',l:'3…Bf5',c:'The key Caro difference — bishop out before the pawn chain closes!'},
    {f:'g1',t:'f3',s:'w',l:'4.Nf3',c:'Develop. White will challenge d5 with c4 later.'},
    {f:'e7',t:'e6',s:'b',l:'4…e6',c:'Solid. Black has the bishop outside the chain — excellent.'}
  ]}
}},
scandinavian:{n:"Scandinavian Defence",vars:{
  main:{name:"Main Line (2…Qxd5)",desc:"Black immediately develops the queen to reclaim the pawn — simple and solid.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'White opens the game.'},
    {f:'d7',t:'d5',s:'b',l:'1…d5',c:'Scandinavian! Black immediately challenges the centre.'},
    {f:'e4',t:'d5',s:'w',l:'2.exd5',c:'White captures — the only sensible response.'},
    {f:'d8',t:'xd5',s:'b',l:'2…Qxd5',c:'Black recaptures with the queen. Brings the queen out early — but the position is semi-open and manageable.'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Attack the queen and develop — the queen must retreat, giving White a tempo.'},
    {f:'d5',t:'a5',s:'b',l:'3…Qa5',c:'Best queen retreat — eyes the e1-a5 diagonal and stays active.'},
    {f:'d2',t:'d4',s:'w',l:'4.d4',c:'Build the centre. White has a tempo advantage but Black is solid.'},
    {f:'g8',t:'f6',s:'b',l:'4…Nf6',c:'Develop and attack e4. Black will follow with …c6, …Bf5, and …e6 — solid Scandinavian structure.'}
  ]},
  modern:{name:"Modern Variation (2…Nf6)",desc:"Black sacrifices the pawn and develops instead — more dynamic.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open game.'},
    {f:'d7',t:'d5',s:'b',l:'1…d5',c:'Scandinavian challenge.'},
    {f:'e4',t:'d5',s:'w',l:'2.exd5',c:'Capture.'},
    {f:'g8',t:'f6',s:'b',l:'2…Nf6',c:'Modern Scandinavian! Black develops instead of recapturing — gambits the pawn for activity.'},
    {f:'d2',t:'d4',s:'w',l:'3.d4',c:'White keeps the pawn and builds the centre.'},
    {f:'f6',t:'d5',s:'b',l:'3…Nxd5',c:'Recapture with the knight. Black has active piece play.'},
    {f:'g1',t:'f3',s:'w',l:'4.Nf3',c:'Develop naturally. White has a solid centre, Black has good piece play.'}
  ]}
}},

pirc:{n:"Pirc Defence",vars:{
  classical:{name:"Classical System",desc:"Black allows big centre and undermines from the flanks.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'White opens.'},
    {f:'d7',t:'d6',s:'b',l:'1…d6',c:'Pirc! Prepares to fianchetto and counterattack.'},
    {f:'d2',t:'d4',s:'w',l:'2.d4',c:'Build the centre.'},
    {f:'g8',t:'f6',s:'b',l:'2…Nf6',c:'Attack e4 with the knight.'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Reinforce e4.'},
    {f:'g7',t:'g6',s:'b',l:'3…g6',c:'Fianchetto preparation.'},
    {f:'c1',t:'e3',s:'w',l:'4.Be3',c:'Classical system — prepares Qd2 and long castle or kingside attack.'},
    {f:'f8',t:'g7',s:'b',l:'4…Bg7',c:"Pirc bishop — x-rays the centre. Black will castle and counterattack."}
  ]}
}},
dutch:{n:"Dutch Defence",vars:{
  stonewall:{name:"Stonewall Dutch",desc:"Black builds a fortress — f5+e6+d5 pawn chain.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Queen pawn.'},
    {f:'f7',t:'f5',s:'b',l:'1…f5',c:'Dutch! Black grabs e4 control and prepares kingside activity.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop naturally.'},
    {f:'g8',t:'f6',s:'b',l:'2…Nf6',c:'Develop.'},
    {f:'g2',t:'g3',s:'w',l:'3.g3',c:"Fianchetto — White's bishop will fight the Dutch bishop."},
    {f:'e7',t:'e6',s:'b',l:'3…e6',c:'Prepare the Stonewall structure.'},
    {f:'f1',t:'g2',s:'w',l:'4.Bg2',c:'Fianchetto complete.'},
    {f:'d7',t:'d5',s:'b',l:'4…d5',c:'Stonewall! e6+f5+d5 — a fortress. Black will play Bd6 and castle.'}
  ]}
}},
nimzo:{n:"Nimzo-Indian Defence",vars:{
  classical:{name:"Classical Variation (4.Qc2)",desc:"Avoid doubled pawns — Kasparov's recommendation.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Queen pawn.'},
    {f:'g8',t:'f6',s:'b',l:'1…Nf6',c:'Hypermodern — control centre with pieces first.'},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:'Space.'},
    {f:'e7',t:'e6',s:'b',l:'2…e6',c:'Solid. Opens dark bishop diagonal.'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Reinforce centre.'},
    {f:'f8',t:'b4',s:'b',l:'3…Bb4',c:'Nimzo-Indian! Pins the knight — forces White to choose.'},
    {f:'d1',t:'c2',s:'w',l:'4.Qc2',c:'Classical — avoids doubled pawns after Bxc3+.'},
    {f:'e8',t:'g8',s:'b',l:'4…0-0',c:'Castle immediately — king safety first in Nimzo lines.'}
  ]},
  rubinstein:{name:"Rubinstein Variation (4.e3)",desc:"Solid, strategic — White accepts structure over activity.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Queen pawn.'},
    {f:'g8',t:'f6',s:'b',l:'1…Nf6',c:'Nimzo move order.'},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:'Space.'},
    {f:'e7',t:'e6',s:'b',l:'2…e6',c:'Solid.'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Reinforce.'},
    {f:'f8',t:'b4',s:'b',l:'3…Bb4',c:'Nimzo pin!'},
    {f:'e2',t:'e3',s:'w',l:'4.e3',c:'Rubinstein — solid. White accepts the bishop pair to keep structure.'},
    {f:'d7',t:'d5',s:'b',l:'4…d5',c:'Central fight. Balanced strategic game.'}
  ]}
}},
english:{n:"English Opening",vars:{
  symmetrical:{name:"Symmetrical English (1…c5)",desc:"Black mirrors — reversed Sicilian, strategic.",moves:[
    {f:'c2',t:'c4',s:'w',l:'1.c4',c:'English Opening — controls d5, flank start.'},
    {f:'c7',t:'c5',s:'b',l:'1…c5',c:'Symmetrical! Both sides fight for d4/d5. Reversed Sicilian.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Develop naturally.'},
    {f:'g8',t:'f6',s:'b',l:'2…Nf6',c:'Mirror.'},
    {f:'g2',t:'g3',s:'w',l:'3.g3',c:'Fianchetto — standard English plan.'},
    {f:'g7',t:'g6',s:'b',l:'3…g6',c:'Mirror fianchetto! Equal and solid.'},
    {f:'f1',t:'g2',s:'w',l:'4.Bg2',c:'English bishop — controls the long diagonal.'},
    {f:'f8',t:'g7',s:'b',l:'4…Bg7',c:'Both fianchettos complete. Deep strategic battle ahead.'}
  ]},
  reversed_sicilian:{name:"vs 1…e5 (Reversed Sicilian)",desc:"Transpose to reversed Sicilian structures.",moves:[
    {f:'c2',t:'c4',s:'w',l:'1.c4',c:'English.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Aggressive! Black fights for the centre.'},
    {f:'b1',t:'c3',s:'w',l:'2.Nc3',c:'Develop, prepare for central play.'},
    {f:'g8',t:'f6',s:'b',l:'2…Nf6',c:'Develop, attack e4 square.'},
    {f:'g1',t:'f3',s:'w',l:'3.Nf3',c:'Balanced development.'},
    {f:'b8',t:'c6',s:'b',l:'3…Nc6',c:'Both sides developed. Open strategic game.'}
  ]}
}},
kings_gambit:{n:"King's Gambit",vars:{
  accepted:{name:"King's Gambit Accepted",desc:"Romantic chess — White sacrifices f-pawn for rapid development.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open game.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Equal centre.'},
    {f:'f2',t:'f4',s:'w',l:'2.f4',c:"King's Gambit! The most romantic opening — pawn for an open f-file and tempo!"},
    {f:'e5',t:'f4',s:'b',l:'2…exf4',c:"Accepted! Black takes the pawn — now White gets a massive centre."},
    {f:'g1',t:'f3',s:'w',l:'3.Nf3',c:'Develop, attack the pawn on f4.'},
    {f:'g7',t:'g5',s:'b',l:'3…g5',c:'Black defends the pawn aggressively — the main line!'},
    {f:'f1',t:'c4',s:'w',l:'4.Bc4',c:'Attack f7 — the classic Bishop\'s Gambit plan.'}
  ]},
  declined:{name:"King's Gambit Declined (2…Bc5)",desc:"Black keeps material, aims for solid counter-play.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open game.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Equal centre.'},
    {f:'f2',t:'f4',s:'w',l:'2.f4',c:"King's Gambit."},
    {f:'f8',t:'c5',s:'b',l:'2…Bc5',c:"Declined! Falkbeer: keeps material, aims the bishop at f2."},
    {f:'g1',t:'f3',s:'w',l:'3.Nf3',c:'Develop the knight.'},
    {f:'d7',t:'d6',s:'b',l:'3…d6',c:'Solid. Black has the bishop pair and solid centre.'}
  ]}
}},
scotch:{n:"Scotch Game",vars:{
  classical:{name:"Scotch Game (Classical)",desc:"Fights for the centre early — Fischer's favourite.",moves:[
    {f:'e2',t:'e4',s:'w',l:'1.e4',c:'Open game.'},
    {f:'e7',t:'e5',s:'b',l:'1…e5',c:'Open game reply.'},
    {f:'g1',t:'f3',s:'w',l:'2.Nf3',c:'Attack e5.'},
    {f:'b8',t:'c6',s:'b',l:'2…Nc6',c:'Defend e5.'},
    {f:'d2',t:'d4',s:'w',l:'3.d4',c:"Scotch! Open the centre immediately — unlike Italian's slow build."},
    {f:'e5',t:'d4',s:'b',l:'3…exd4',c:'Must take — central tension resolved.'},
    {f:'f3',t:'d4',s:'w',l:'4.Nxd4',c:'Knight recaptures. White has open centre and d4 knight.'},
    {f:'g8',t:'f6',s:'b',l:'4…Nf6',c:"Attack the d4 knight — Kasparov's favourite Scotch line."}
  ]}
}},
queens_indian:{n:"Queen's Indian Defence",vars:{
  main:{name:"Queen's Indian (4.g3)",desc:"Hypermodern — control d4 with bishop fianchetto.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Queen pawn.'},
    {f:'g8',t:'f6',s:'b',l:'1…Nf6',c:'Hypermodern.'},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:'Space.'},
    {f:'e7',t:'e6',s:'b',l:'2…e6',c:'Solid.'},
    {f:'g1',t:'f3',s:'w',l:'3.Nf3',c:'Prevent Ng4, develop.'},
    {f:'b7',t:'b6',s:'b',l:'3…b6',c:"Queen's Indian! Prepares Bb7 to control e4 diagonally."},
    {f:'g2',t:'g3',s:'w',l:'4.g3',c:"Fianchetto plan — White's bishop fights Black's."},
    {f:'c8',t:'b7',s:'b',l:'4…Bb7',c:"Queen's Indian bishop! Controls the long diagonal. Hypermodern masterpiece."}
  ]}
}},
grunfeld:{n:"Grünfeld Defence",vars:{
  exchange:{name:"Grünfeld Exchange Variation",desc:"Black sacrifices the centre — counterattacks with pieces.",moves:[
    {f:'d2',t:'d4',s:'w',l:'1.d4',c:'Queen pawn.'},
    {f:'g8',t:'f6',s:'b',l:'1…Nf6',c:'Hypermodern.'},
    {f:'c2',t:'c4',s:'w',l:'2.c4',c:'Space.'},
    {f:'g7',t:'g6',s:'b',l:'2…g6',c:'Grünfeld/King\'s Indian setup.'},
    {f:'b1',t:'c3',s:'w',l:'3.Nc3',c:'Reinforce centre.'},
    {f:'d7',t:'d5',s:'b',l:'3…d5',c:"Grünfeld! Central challenge — gives White a big centre to attack."},
    {f:'c4',t:'d5',s:'w',l:'4.cxd5',c:'Take the centre!'},
    {f:'f6',t:'d5',s:'b',l:'4…Nxd5',c:'Knight recaptures. Black will attack White\'s centre with c5.'},
    {f:'e2',t:'e4',s:'w',l:'5.e4',c:'Big centre! White takes all space — Black will counterattack.'},
    {f:'d5',t:'c3',s:'b',l:'5…Nxc3',c:"Knight exchange — destroys White's defence of d4."},
    {f:'b2',t:'c3',s:'w',l:'6.bxc3',c:'Must recapture.'},
    {f:'f8',t:'g7',s:'b',l:'6…Bg7',c:"Grünfeld bishop — x-rays the centre. Classic hypermodern counterplay."}
  ]}
}}
};

const ENDGAMES=[
{id:'kqk',type:'Basic Mate',title:'K+Q vs K: Box Method',tag:'must',
 learn:`<div class="rlist">
  <div class="ritem"><div class="rnum">STEP1</div><div class="rtxt"><strong>Use queen to make a box</strong><span>The queen restricts the enemy king to a shrinking area — like building a wall. Example: if the king is on e5, play Qd4 or Qf4 to cut it off. The box gets smaller each move.</span></div></div>
  <div class="ritem"><div class="rnum">STEP2</div><div class="rtxt"><strong>March your king toward the enemy king</strong><span>The queen alone cannot give checkmate — your king must help. Advance it toward the centre while the queen maintains the box restriction.</span></div></div>
  <div class="ritem"><div class="rnum">STEP3</div><div class="rtxt"><strong>Drive to the edge, then checkmate</strong><span>Force the enemy king to the edge of the board. Then with king on d6 and queen on e4 (for example), a queen check on e8 delivers checkmate. Usually takes 7-10 moves from any position.</span></div></div>
  <div class="ritem"><div class="rnum">WARN</div><div class="rtxt"><strong>Beware of stalemate!</strong><span>If the enemy king has no legal moves but is NOT in check — it\'s stalemate (a draw!). Keep ONE escape square available at all times. The most common mistake in this endgame.</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 The Knight\'s Move Rule</h4><p>Keep your queen a knight\'s move away from the enemy king. This prevents stalemate traps. E.g., if the king is on h8, your queen should never be on f8, h6, g6 — only on squares a knight\'s jump away like f7, g7 etc.</p></div>
<div class="tbox" style="margin-top:10px"><h4>✅ Key Positions</h4><p><b>Checkmate patterns:</b> Queen on f7, King on h8, your King on f6 = Qh7# or Qg8#. Queen on d8, King on h8, your King on f7 = Qd7# or Qg8#. Learn 3-4 mating patterns and work backward from them.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Stalemate — the #1 Mistake</h4><p>Queen chases king to h8, plays Qg6?? — stalemate! The king has no legal move. ALWAYS check: does the king have at least one legal move? If not, choose a different square for your queen.</p></div>
<div class="mbox" style="margin-top:8px"><h4>⚠️ Using only the queen</h4><p>Without your king\'s help, you\'ll chase the enemy king in circles. Bring your king to d6/e6 area to help corner the enemy king. The king is your most important helper in this endgame.</p></div>`
},
{id:'krk',type:'Basic Mate',title:'K+R vs K: Barrier Method',tag:'must',
 learn:`<div class="rlist">
  <div class="ritem"><div class="rnum">STEP1</div><div class="rtxt"><strong>Create a barrier with the rook</strong><span>Place the rook on the 4th rank — Rd4. This cuts the enemy king to one half of the board (ranks 5-8). The enemy king cannot cross the barrier as long as your rook is defended.</span></div></div>
  <div class="ritem"><div class="rnum">STEP2</div><div class="rtxt"><strong>Advance your king</strong><span>March your king toward the enemy king while the rook holds the barrier. Aim for the 5th rank. The enemy king is restricted to its half; your king advances freely.</span></div></div>
  <div class="ritem"><div class="rnum">STEP3</div><div class="rtxt"><strong>Push the enemy king to the edge</strong><span>Once your king reaches the 5th rank, push the rook barrier to the 6th rank (Re6). Now the enemy king is restricted to ranks 7-8. Continue shrinking the barrier.</span></div></div>
  <div class="ritem"><div class="rnum">STEP4</div><div class="rtxt"><strong>Deliver checkmate on the edge</strong><span>With the enemy king on the 8th rank, your king on the 6th rank, and rook on the 8th rank = Rook checkmate! Typical position: Re8#, with enemy king on h8 and your king on f6.</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 The Waiting Move</h4><p>When the enemy king and your king face each other with one square between (opposition), use the rook to "lose a move" — e.g. Ra8-a1-a8. This forces the enemy king to move away and lets you gain the opposition.</p></div>
<div class="tbox" style="margin-top:10px"><h4>✅ Checkmate Pattern</h4><p>Final position: your King on f6, Rook on e8, enemy King on h8. Play Re8# — checkmate! The king is on the edge, the rook delivers check, your king controls g7 and f7 escape squares.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Rook check without purpose</h4><p>Don\'t give random checks — each check should advance your position. Checks without purpose just push the king to a better square. Make a plan first: restrict, march, then mate.</p></div>
<div class="mbox" style="margin-top:8px"><h4>⚠️ Forgetting the barrier</h4><p>Don\'t let the enemy king cross the barrier you set up. If the king threatens to cross, defend your rook or reposition it to maintain the cut-off.</p></div>`
},
{id:'kpk',type:'Pawn Ending',title:'K+P vs K: Key Squares & Opposition',tag:'must',
 learn:`<div class="rlist">
  <div class="ritem"><div class="rnum">KEY</div><div class="rtxt"><strong>The Key Square Rule</strong><span>Every pawn has "key squares" — if your king reaches them, the pawn promotes regardless. For a pawn on e4, the key squares are d6, e6, f6. Get your king there = you win. Your opponent\'s king on those squares = draw.</span></div></div>
  <div class="ritem"><div class="rnum">OPP</div><div class="rtxt"><strong>Opposition decides everything</strong><span>Kings face each other with one square between. The side NOT to move has the "opposition" — the other king must retreat. Use opposition to force your king to the key squares.</span></div></div>
  <div class="ritem"><div class="rnum">RULE</div><div class="rtxt"><strong>King in FRONT of the pawn wins</strong><span>King on e5 with pawn on e4 = winning. King beside the pawn (d5) with pawn on e4 = often a draw! The key principle: the attacking king must be TWO squares ahead of the pawn to guarantee a win.</span></div></div>
  <div class="ritem"><div class="rnum">EDGE</div><div class="rtxt"><strong>Rook pawns (a/h) are special</strong><span>A rook pawn + king never wins if the defending king reaches the corner (a8/h8). The attacking king can\'t cover all three sides. The infamous stalemate trap: Kh8, pawn on h7, Kh6 = stalemate!</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 Direct Opposition</h4><p>Kings face each other directly: White Ke4 vs Black Ke6. It\'s White to move — White does NOT have the opposition, so must give way. It\'s Black to move — Black does NOT have the opposition, must give way. The side NOT to move has it.</p></div>
<div class="tbox" style="margin-top:10px"><h4>✅ Winning with e4 pawn</h4><p>White King on e5, pawn on e4, Black King on e7. White has direct opposition. White plays d6! (or f6!) — the opposition forces the black king aside. Then King advances to e6 and d7, promoting.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ King beside the pawn loses!</h4><p>King on d5, pawn on e5, Black King on e7. White pushes e6? — Black plays Ke6 and captures! White\'s king was beside the pawn, not in front. The pawn advanced without king protection.</p></div>
<div class="mbox" style="margin-top:8px"><h4>⚠️ Rook pawn stalemate</h4><p>Never push the h-pawn to h7 with the black king on h8 unless you can give check to dislodge it. h7+ Kh8 and now Kh6 is immediate stalemate. One of the most common tragic draws.</p></div>`
},
{id:'lucena',type:'Rook Ending',title:'Lucena Position: Building a Bridge',tag:'must',
 learn:`<div class="rlist">
  <div class="ritem"><div class="rnum">POS</div><div class="rtxt"><strong>What is the Lucena Position?</strong><span>The attacking side has rook + pawn on the 7th rank with the king on f7 (or equivalent). The defending rook checks from behind (Rf1+, Re1+, etc). This is THE winning rook endgame position — every club player must know the technique.</span></div></div>
  <div class="ritem"><div class="rnum">STEP1</div><div class="rtxt"><strong>Step 1: Move the rook to the 4th rank</strong><span>Play Rg1-g4 (or Rf4, Re4 depending on the file). This rook will be used to shelter the king from checks — "building the bridge."</span></div></div>
  <div class="ritem"><div class="rnum">STEP2</div><div class="rtxt"><strong>Step 2: Advance the king to e7/d7</strong><span>The king needs to escape the checks. With the rook on g4, play Kf8-e7 (or whichever square is away from the pawn file). Rg4 will intercept the defending checks.</span></div></div>
  <div class="ritem"><div class="rnum">STEP3</div><div class="rtxt"><strong>Step 3: Interpose the rook to stop checks</strong><span>When the defending rook gives check (Re1+), play Rge4 — interpose the rook. The king is now sheltered. After Re4, the pawn promotes. This is "the bridge." Simple once you see it!</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 Why it always works</h4><p>The bridge works because the defender\'s rook must check from a distance. Once the attacker\'s rook interposes on the 4th file, the defending rook is cut off. The pawn promotes with the king safely sheltered behind the "bridge rook."</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Moving the rook to g1 too early</h4><p>If you move the blocking rook before the king is ready to advance, the defending rook gets back in position. Set up the bridge AFTER driving the defending king away with checks.</p></div>`
},
{id:'philidor',type:'Rook Ending',title:'Philidor Position: The Draw Technique',tag:'must',
 learn:`<div class="rlist">
  <div class="ritem"><div class="rnum">POS</div><div class="rtxt"><strong>What is the Philidor Position?</strong><span>Defender has only a rook vs rook + pawn. The defending rook can draw by correct technique. Critical: the defending king must be on the 6th rank (if pawn on 5th) ready to check from behind.</span></div></div>
  <div class="ritem"><div class="rnum">RULE1</div><div class="rtxt"><strong>Rook on the 6th rank (barrier method)</strong><span>Place the defending rook on the 6th rank (Ra6 for a kingside pawn). This cuts off the attacking king. As long as the rook stays there, the pawn cannot advance without creating stalemate threats.</span></div></div>
  <div class="ritem"><div class="rnum">RULE2</div><div class="rtxt"><strong>When king advances, switch to checks</strong><span>CRITICAL MOMENT: when the attacking king advances to e6 (past the Philidor barrier), immediately switch the rook to the back rank (Ra1) and check the attacking king from behind (Re1+, Rf1+, Rg1+). Never stop checking!</span></div></div>
  <div class="ritem"><div class="rnum">RULE3</div><div class="rtxt"><strong>Keep checking from the back</strong><span>The defending rook checks endlessly from behind the pawn. The attacking king cannot escape the checks forever — the position is a draw. Stop checking = lose!</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 The Critical Moment</h4><p>Philidor position: White Ke5, Re1, pawn e5. Black Ka8, Rd6 (Philidor position). White plays e6 — Black must immediately play Rd1! (go to back rank). Then Rxd1+ checking the white king endlessly = draw.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Staying on the 6th rank too long</h4><p>Once the attacking king crosses to the 6th rank (e6), if you stay on the 6th rank your rook gets trapped behind the pawn. Switch to the back rank IMMEDIATELY when the king crosses!</p></div>`
},
{id:'oppcolbish',type:'Bishop Ending',title:'Opposite Colour Bishops',tag:'imp',
 learn:`<div class="rlist">
  <div class="ritem"><div class="rnum">RULE</div><div class="rtxt"><strong>Usually a Draw Even with Extra Pawns</strong><span>If White has a dark-squared bishop and Black has a light-squared bishop, White\'s bishop can never attack Black\'s bishop — and cannot attack the squares Black\'s bishop defends. One extra pawn is usually drawn, sometimes even two!</span></div></div>
  <div class="ritem"><div class="rnum">DEF</div><div class="rtxt"><strong>Defensive technique</strong><span>Place all your pawns on the colour your opponent\'s bishop attacks. The defender\'s bishop is irrelevant to those squares. Place the king centrally. The position is almost always drawn.</span></div></div>
  <div class="ritem"><div class="rnum">ATK</div><div class="rtxt"><strong>When does it win?</strong><span>Two or more connected passed pawns, or a pawn storm where the bishop drives the enemy king away, can sometimes win. But these are exceptions requiring highly active play — basic technique is usually to hold the draw as defender.</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 The Fortress Idea</h4><p>Place the defending king on a square the opponent\'s bishop can attack, but where it cannot be driven away. E.g., Black bishop is dark-squared: put the White king on a LIGHT square corner (a1, h1) where the bishop can\'t reach. Virtually impossible to break down.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Passive defence with the king</h4><p>Don\'t hide the king in the corner passively if you\'re the attacker. The attacker must be aggressive — use the bishop + king actively to create passed pawns, not just push one pawn hoping for the best.</p></div>`
},
{id:'rookbehind',type:'Rook Ending',title:"Rook Behind the Passed Pawn",tag:'must',
 learn:`<div class="rlist">
  <div class="ritem"><div class="rnum">RULE</div><div class="rtxt"><strong>The Single Most Important Rook Principle</strong><span>From Silman\'s Complete Endgame Course: place your rook BEHIND your passed pawn (it gains power as the pawn advances) and BEHIND your opponent\'s passed pawn (it restrains it from all squares on the file).</span></div></div>
  <div class="ritem"><div class="rnum">WHY</div><div class="rtxt"><strong>Why behind?</strong><span>Your rook behind YOUR pawn: as the pawn advances to e5, e6, e7, the rook on e1 gains space automatically. Your rook behind the OPPONENT\'S pawn: the rook on e1 attacks the pawn on e5 from the same square that also attacks e6, e7, e8.</span></div></div>
  <div class="ritem"><div class="rnum">NEVER</div><div class="rtxt"><strong>Never in front of the pawn</strong><span>Rook in FRONT of your own passed pawn (e.g., Re6 with pawn on e4) blocks its advance. As the pawn moves forward, the rook must retreat — wasting moves. Never put the rook in front of a pawn you want to promote!</span></div></div>
 </div>`,
 key:`<div class="tbox"><h4>✅ Tarrasch\'s Rule (1920)</h4><p>Grandmaster Tarrasch formulated this rule over 100 years ago. It is still the single most useful rook endgame guideline. Any deviation requires a specific concrete reason. "In rook endings, the rook belongs behind the passed pawn" — Tarrasch.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Passive rook on the side</h4><p>A rook on a2 watching a passer on e5 is nearly useless. Even if it can\'t immediately go behind the pawn, look for the first opportunity to get it there. A passive rook is the most common endgame mistake after basic blunders.</p></div>`
},
{id:'zugzwang',type:'Advanced Concept',title:'Zugzwang & Tempo',tag:'adv',
 learn:`<div class="rlist">
  <div class="ritem"><div class="rnum">DEF</div><div class="rtxt"><strong>What is Zugzwang?</strong><span>German for "compulsion to move." A position where having to make a move puts you at a disadvantage — any move worsens your position. Most common in king-pawn endgames and occasionally in piece endgames.</span></div></div>
  <div class="ritem"><div class="rnum">EX</div><div class="rtxt"><strong>Classic Zugzwang Example</strong><span>White King on e5, pawn on e4, Black King on e7 — and it\'s BLACK\'s turn to move. Black is in zugzwang! Any king move lets White advance. If it\'s White\'s turn, White must lose the opposition and may draw.</span></div></div>
  <div class="ritem"><div class="rnum">TEMPO</div><div class="rtxt"><strong>Losing a Tempo to Win</strong><span>Sometimes you want to waste a move to put the opponent in zugzwang. In king-pawn endings, "triangulation" — moving the king in a triangle (3 moves instead of 2) to lose a tempo — forces the opponent into zugzwang.</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 Triangulation</h4><p>White King on e3, Black King on e5 — White wants the opposition but it\'s White\'s move. Solution: triangulate — Ke3-d3-d4-e4. This takes 3 moves instead of 2, transferring the "move" to Black. Now Black is in zugzwang.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Forgetting it\'s a weapon</h4><p>Zugzwang isn\'t just something that happens to you — it\'s a weapon you CREATE. In any blocked position, think: can I create a zugzwang? Am I already in zugzwang? Recognising these positions is half the battle.</p></div>`
}
,
{id:'squarerule',type:'Pawn Ending',title:'The Square Rule',tag:'must',
 learn:`<div class="rl">
  <div class="ri"><div class="rn">WHAT</div><div class="rt"><strong>Can the King Catch the Pawn?</strong><span>The square rule lets you instantly decide — without calculation — whether a lone king can catch a passed pawn before it promotes. Draw a diagonal square from the pawn to the promotion square. If the enemy king can step INTO that square on their next move, they catch the pawn. If not, the pawn promotes.</span></div></div>
  <div class="ri"><div class="rn">HOW</div><div class="rt"><strong>Drawing the Square</strong><span>Pawn on e5, promoting at e8. The square has corners e5-e8-h8-h5. If the Black king can reach any square inside that box (h5, g5, f5, g6, g7, h6, h7, h8) on their move, they catch the pawn. If the king is on a1 — outside the square — the pawn promotes without calculation needed.</span></div></div>
  <div class="ri"><div class="rn">USE</div><div class="rt"><strong>Practical Application</strong><span>In any raced pawn ending, draw the square mentally. Instantly know: do I need my king or can I just push? Do I need to stop the opponent\'s pawn? Saves enormous calculation time. Every club player must know this — it comes up in nearly every pawn endgame.</span></div></div>
  <div class="ri"><div class="rn">NOTE</div><div class="rt"><strong>It\'s White to Move</strong><span>If the pawn moves next, draw the square from its NEXT square, not current. If the pawn is on e5 and it\'s White\'s move: the pawn goes to e6, so draw the square from e6. The rule shifts based on who moves next.</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 Quick Test</h4><p>Pawn on d4, it\'s White\'s move. Promotion square d8. Square corners: d4-d8-h8-h4. Black king on h6 — inside the square! Black catches the pawn if White just pushes. White needs their king to help.</p></div>
<div class="tbox" style="margin-top:8px"><h4>✅ Memory Trick</h4><p>Count the squares to promotion. Count how many moves the king needs to intercept. If king moves ≤ pawn moves to promotion, king catches it. The square rule makes this visual and instant.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Forgetting who moves next</h4><p>If it\'s the defending king\'s move, they get a 'free step' into the square. Always check whose turn it is before applying the rule — this one mistake causes the most errors.</p></div>`
},
{id:'qvsr',type:'Queen Ending',title:'Queen vs Rook (Philidor\'s Legacy)',tag:'imp',
 learn:`<div class="rl">
  <div class="ri"><div class="rn">RESULT</div><div class="rt"><strong>Forced Win — But Requires Technique</strong><span>Queen vs rook (with no pawns) is a forced win for the queen, but it takes 10-35 moves and requires specific technique. The defender\'s drawing attempts: perpetual rook checks, stalemate traps, and 'Philidor\'s Position' where rook + king defend a corner together.</span></div></div>
  <div class="ri"><div class="rn">METHOD</div><div class="rt"><strong>Drive to the Corner</strong><span>Force the enemy king to a corner (a1, h1, a8, h8). The king and rook defend together in the corner — the queen must use the king to help break the fortress. Key technique: skewer the rook away from the king, then close in for checkmate.</span></div></div>
  <div class="ri"><div class="rn">TRAP</div><div class="rt"><strong>The Stalemate Defense</strong><span>The defender\'s main trick: maneuver into stalemate when you\'re winning. Example: Black king on a1, rook on a2 — if White queen goes to b1, it\'s stalemate! Always verify the king has at least one legal move before giving the decisive check.</span></div></div>
  <div class="ri"><div class="rn">PRACT</div><div class="rt"><strong>Practical Importance</strong><span>Queen vs rook endings arise when one side promotes with only a rook remaining. Not uncommon in practical play. Knowing the technique prevents accidentally drawing a won position through careless queen moves.</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 The Skewer Technique</h4><p>Use the queen to give check along the file or diagonal separating the rook from the king. When the rook interposes to block the check, the queen skewers through it, winning the rook. This is the key winning method in most positions.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Stalemate on the corner square</h4><p>Black king on a1, nothing else nearby — Qa2?? is stalemate. Always make sure the defending king has a legal move. In corner positions, approach the king from the side, not directly in front of it.</p></div>`
},
{id:'rvb',type:'Minor Piece Ending',title:'Rook vs Bishop',tag:'imp',
 learn:`<div class="rl">
  <div class="ri"><div class="rn">RESULT</div><div class="rt"><strong>Usually a Draw — But Defensive Technique Required</strong><span>Rook vs bishop (no pawns) is theoretically drawn, but the defender must know the technique. Without correct play, the rook can force checkmate in certain corner positions where the bishop doesn\'t cover the corner colour.</span></div></div>
  <div class="ri"><div class="rn">DRAW</div><div class="rt"><strong>The Defender\'s Method</strong><span>Keep the king AWAY from the corners. The defender loses only when the king is trapped in a corner that the bishop doesn\'t cover. Dark-squared bishop: avoid a1, a8, h1, h8 (all dark squares? No — corners alternate). Specifically, avoid corners of the colour your bishop DOESN\'T cover.</span></div></div>
  <div class="ri"><div class="rn">WIN</div><div class="rt"><strong>When the Attacker Wins</strong><span>The attacker wins if the defending king is trapped in a 'wrong corner' — a corner the bishop can\'t protect. Force the king to that corner with rook checks, then use the rook to take away escape squares while the king approaches for checkmate.</span></div></div>
  <div class="ri"><div class="rn">PRACT</div><div class="rt"><strong>Practical Rule</strong><span>If you have rook vs bishop: always try to force the king to the wrong corner. If you HAVE the bishop: always keep the king near the centre or 'right' corners. This ending appears when trades leave bishop vs rook on the board.</span></div></div>
 </div>`,
 key:`<div class="tbox"><h4>✅ The Safe Corner Rule</h4><p>With a dark-squared bishop: the 'safe' corners are h8 and a1 (dark squares — your bishop covers them). The 'wrong' corners are a8 and h1 (light squares — your bishop can\'t reach them). Keep your king near the safe corners.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Drifting to the wrong corner</h4><p>Defenders lose because they don\'t know which corners are safe. Before playing rook vs bishop endgames, identify your bishop\'s colour and which corners it covers — that\'s your safe zone. Never let your king drift to the unprotected corner.</p></div>`
},
{id:'tripopp',type:'Pawn Ending',title:'Triangulation & Remote Opposition',tag:'adv',
 learn:`<div class="rl">
  <div class="ri"><div class="rn">BASIC</div><div class="rt"><strong>Direct Opposition vs Distant Opposition</strong><span>Direct opposition: kings face each other one square apart. Distant opposition: kings face each other three or five squares apart on the same rank, file, or diagonal. With distant opposition, the player NOT to move still has the advantage — and can manoeuvre into direct opposition on their terms.</span></div></div>
  <div class="ri"><div class="rn">TRI</div><div class="rt"><strong>Triangulation Explained</strong><span>If your king needs to reach square X but doing so directly would give YOUR opponent the opposition — triangulate. Find a 3-square path (triangle) that uses one extra move, arriving at X with the OPPONENT to move. The extra move transfers the 'turn' to the opponent.</span></div></div>
  <div class="ri"><div class="rn">WHEN</div><div class="rt"><strong>When Is Triangulation Needed?</strong><span>When a king-pawn endgame is drawn with correct defence but you need to zugzwang the opponent. The defending king mirrors your king\'s moves (maintaining opposition). Triangulation breaks the mirror — by using 3 moves to do what the opponent can do in 2, you eventually arrive with them to move.</span></div></div>
  <div class="ri"><div class="rn">EXAM</div><div class="rt"><strong>Classic Example</strong><span>White king on e3, Black king on e5 (direct opposition). White wants e4 but can\'t take it with Black king on e5. White triangulates: Ke3→d3→d4→e4 (3 moves), forcing Black to react on each move. After Kd4, Black must move away, giving White the opposition and the win.</span></div></div>
 </div>`,
 key:`<div class="ibox"><h4>📐 The Mirror Test</h4><p>If the defending king is perfectly mirroring your moves (maintaining opposition), you need triangulation. Find a square your king can visit in 3 moves instead of 2 — the extra move breaks the mirror and transfers the opposition to you.</p></div>`,
 mistakes:`<div class="mbox"><h4>⚠️ Not all positions allow triangulation</h4><p>Triangulation only works when your king has a 'waiting square' — a square it can visit without losing ground. If the position is too cramped or the triangle would cross into losing territory, the draw holds. Triangulation is a weapon, not a guarantee.</p></div>`
}
]

const TACTS=[
{id:"fork",icon:"🍴",nm:"Fork",ds:"Attack two pieces at once",
 learn:`<div class="rlist"><div class="ritem"><div class="rnum">WHY</div><div class="rtxt"><strong>One threat, two targets</strong><span>A fork creates two threats simultaneously. Your opponent has one move, can only address one threat — you win the other piece for free.</span></div></div><div class="ritem"><div class="rnum">WHO</div><div class="rtxt"><strong>Knights fork best</strong><span>Knights move in the hardest pattern to visualise. Classic forks: Nd7+ (king + rook), Nf7+ (king + rook), Nc7+ (king + rook queenside). Always scan for these knight fork squares.</span></div></div><div class="ritem"><div class="rnum">HOW</div><div class="rtxt"><strong>How to find forks</strong><span>After your opponent moves, scan: can any of your pieces land on a square that attacks two enemy pieces? Work backward — find the fork square first, then see if you can reach it (even with a sacrifice).</span></div></div></div><div class="tbox"><h4>✅ Practice habit</h4><p>Every game, before moving, scan: "Can my knight reach any square where it attacks two pieces?" This takes 5 seconds and will win you dozens of games per year.</p></div>`,
 example:`<div class="ibox"><h4>🍴 Knight Fork Pattern</h4><p><b>Position:</b> White knight goes to d5 — simultaneously attacks queen on c7 and rook on e7. Black can only save one. White wins the exchange or the queen.</p></div><div class="ibox" style="margin-top:8px"><h4>🍴 King Fork Pattern</h4><p><b>Nf7+:</b> Knight checks the king and attacks the rook on h8. Since the king must escape check, White wins the rook. This pattern appears hundreds of times in beginner games.</p></div>`
},
{id:"pin",icon:"📌",nm:"Pin",ds:"Piece cannot move without exposing something valuable",
 learn:`<div class="rlist"><div class="ritem"><div class="rnum">ABS</div><div class="rtxt"><strong>Absolute Pin (vs King)</strong><span>The pinned piece CANNOT legally move — moving it would expose the king to check. Pile attackers onto an absolutely pinned piece — it can never escape!</span></div></div><div class="ritem"><div class="rnum">REL</div><div class="rtxt"><strong>Relative Pin (vs Queen/Rook)</strong><span>The piece CAN move but would lose something valuable behind it. The opponent is morally compelled to keep the pin — exploit it before they break it with a discovered attack or interposition.</span></div></div><div class="ritem"><div class="rnum">USE</div><div class="rtxt"><strong>Attack the pinned piece with pawns</strong><span>A pinned knight on f6 can be advanced against with g4-g5. Since the knight can\'t move (king is behind it on g7 or the queen behind it on d8), you win the knight for just a pawn.</span></div></div></div><div class="mbox"><h4>⚠️ Your own pins</h4><p>Always check if your own pieces are pinned. A knight pinned to the king cannot save a piece it seems to be defending. Beginner games are full of "I forgot my knight was pinned."</p></div>`,
 example:`<div class="ibox"><h4>📌 Classic Pin: Bg5 pinning Nf6</h4><p>White plays Bg5, pinning Black\'s Nf6 to the queen on d8. Black cannot move the knight without losing the queen. White piles on with h3-h4-g4-g5, winning the knight eventually.</p></div><div class="ibox" style="margin-top:8px"><h4>📌 Absolute pin: Rb1 pinning Nb5</h4><p>White rook on b1 pins Black\'s knight on b5 to the king on b8. The knight cannot move — pile up attackers on it with a2-a4-a5-axb5 or simply play Rxb5.</p></div>`
},
{id:"skewer",icon:"🔫",nm:"Skewer",ds:"Attack a valuable piece — win what is behind it",
 learn:`<div class="rlist"><div class="ritem"><div class="rnum">DEF</div><div class="rtxt"><strong>The Reverse Pin</strong><span>In a pin, the valuable piece is behind. In a skewer, the valuable piece is in front — it must move to escape the attack, exposing a lesser piece behind it.</span></div></div><div class="ritem"><div class="rnum">HOW</div><div class="rtxt"><strong>Rooks, bishops, queens</strong><span>Line pieces create skewers along open files, ranks, and diagonals. A rook skewer: Re8+ forces Kf7 (or Kxe8) — if Kf7, win the queen on e4 or rook on e1 behind the king.</span></div></div><div class="ritem"><div class="rnum">KING</div><div class="rtxt"><strong>King+Queen skewer is the most common</strong><span>Bishop on a2 attacks king on g8 — king must move, and the queen on f3 is now captured. Always look for alignments: is the king on the same diagonal/file as the queen, rook, or other piece?</span></div></div></div>`,
 example:`<div class="ibox"><h4>🔫 Classic Rook Skewer</h4><p><b>Re8+!</b> The rook attacks the king on g8. King must move (e.g., Kf7). Now the queen on e3 (which was behind the king) is captured by Re3. White wins the queen for free!</p></div>`
},
{id:"discovered",icon:"💥",nm:"Discovered Attack",ds:"Moving one piece reveals a hidden attack",
 learn:`<div class="rlist"><div class="ritem"><div class="rnum">WHY</div><div class="rtxt"><strong>Two threats in one move</strong><span>The moving piece attacks one thing. The piece revealed behind it attacks another. Two threats, one move — almost impossible to handle.</span></div></div><div class="ritem"><div class="rnum">CHECK</div><div class="rtxt"><strong>Discovered CHECK is devastating</strong><span>When the revealed piece gives check, the opponent must deal with check — they cannot stop the moving piece\'s attack. "The most powerful weapon in chess" — Tartakower.</span></div></div><div class="ritem"><div class="rnum">FIND</div><div class="rtxt"><strong>Look for batteries</strong><span>A bishop behind a knight, a rook behind a queen — potential discovered attacks. Ask: if I move the front piece, what does the back piece suddenly attack?</span></div></div></div>`,
 example:`<div class="ibox"><h4>💥 Classic Discovered Attack</h4><p>White: bishop on c4, knight on e4. Black: queen on d6, king on e8. White plays <b>Nf6+!!</b> — knight gives check (king must respond), and the bishop on c4 now attacks the queen on d6 (or whichever square is on the a2-g8 diagonal).</p></div>`
},
{id:"dblcheck",icon:"⚡",nm:"Double Check",ds:"Two pieces check simultaneously — king MUST move",
 learn:`<div class="rlist"><div class="ritem"><div class="rnum">RULE</div><div class="rtxt"><strong>Cannot Block or Capture</strong><span>Against a single check, you can block, capture the checking piece, or move the king. Against a DOUBLE check, you MUST move the king — no blocking or capturing is possible.</span></div></div><div class="ritem"><div class="rnum">HOW</div><div class="rtxt"><strong>Always from a discovered check</strong><span>A discovered check becomes a double check when the moving piece ALSO gives check. Now both the moving piece AND the revealed piece are checking — the king has very few legal moves.</span></div></div><div class="ritem"><div class="rnum">RESULT</div><div class="rtxt"><strong>Often leads to forced mate</strong><span>With so few king moves available (often just 1 or 2), double checks frequently force checkmate in 1-2 moves. The smothered mate always involves a double check as its key move.</span></div></div></div>`,
 example:`<div class="ibox"><h4>⚡ Double Check Pattern</h4><p>Knight on f5 moves to d6++ — giving check itself (knight) AND revealing a bishop check on b3-g8 diagonal. The king on g8 has only one square. Next move is checkmate. Spectacular and decisive.</p></div>`
},
{id:"hanging",icon:"🎯",nm:"Hanging Pieces",ds:"Undefended pieces are free to take",
 learn:`<div class="rlist"><div class="ritem"><div class="rnum">DEF</div><div class="rtxt"><strong>What is a hanging piece?</strong><span>Any piece that can be captured without your opponent winning material back. Before every move: are all YOUR pieces defended? Are any of your opponent\'s pieces undefended? Take them!</span></div></div><div class="ritem"><div class="rnum">SCAN</div><div class="rtxt"><strong>The 5-second scan</strong><span>After your opponent moves: (1) What did that move undefend? (2) Does any of my pieces now attack something undefended? This scan, done every move, wins hundreds of free pieces per year.</span></div></div><div class="ritem"><div class="rnum">TRAP</div><div class="rtxt"><strong>The Desperado</strong><span>A piece that will be captured no matter what = a "desperado." Don\'t just let it die — have it capture the most valuable enemy piece it can reach first!</span></div></div></div><div class="tbox"><h4>✅ The Blunder Check</h4><p>Before every move: (1) Is my piece going to a safe square? (2) Am I leaving anything undefended? (3) Does my move allow any opponent tactics? This takes 10 seconds and is the #1 habit separating 600 ELO from 1000 ELO.</p></div>`,
 example:`<div class="ibox"><h4>🎯 Classic Hanging Piece</h4><p>After 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nxd4?? — Black\'s knight on d4 is now undefended! White plays 5.Qxd4 — free knight! Black forgot that after Nxd4, the knight was no longer defended by the original e5 pawn.</p></div>`
}
];

const QS={
1:[
  {q:"What is the value of a rook?",os:["3 points","5 points","7 points","9 points"],a:1,e:"Rook = 5 points. Pawn=1, Knight=3, Bishop=3, Rook=5, Queen=9."},
  {q:"What is the FIRST opening principle?",os:["Bring the queen out early","Control the centre","Castle immediately","Move the same piece twice"],a:1,e:"Control the centre with pawns (e4/d4) and pieces in the opening."},
  {q:"What is a fork?",os:["Trapping a piece","Attacking two pieces at once","Blocking a check","Pinning a piece"],a:1,e:"A fork attacks two pieces simultaneously, winning material."},
  {q:"When should you castle?",os:["As late as possible","Never if you are winning","Early to protect the king","Only if you are losing"],a:2,e:"Castle early to protect your king and connect your rooks."},
  {q:"What is a pin?",os:["A piece that cannot move without exposing a more valuable piece","Attacking two pieces at once","A pawn that cannot advance","A piece blocking a file"],a:0,e:"A pin restricts a piece because moving it would expose a more valuable piece behind it."},
  {q:"What is stalemate?",os:["Checkmate","A draw where the player to move has no legal moves","A draw by repetition","When the king is in check"],a:1,e:"Stalemate is a draw — the player to move has no legal moves but is NOT in check."},
  {q:"Which piece is worth the most?",os:["Rook","Knight","Bishop","Queen"],a:3,e:"Queen = 9 points, the most powerful piece."},
  {q:"What does 'development' mean?",os:["Moving pawns forward","Moving pieces from their starting squares","Castling","Taking pieces"],a:1,e:"Development means moving your pieces off the back rank to active squares."},
  {q:"What is a discovered attack?",os:["A check delivered by moving a piece away","Finding a tactic","Capturing a defended piece","Moving the king"],a:0,e:"A discovered attack happens when you move one piece to reveal an attack by another piece behind it."},
  {q:"What is the 'exchange'?",os:["Trading any two pieces","Trading rook for bishop/knight (winning 2 points)","Trading queens","Trading bishops"],a:1,e:"Winning the exchange = trading rook (5pts) for knight or bishop (3pts), gaining 2 points."}
],
2:[
  {q:"What is the Lucena position?",os:["A rook ending where the stronger side wins","A drawn king+pawn endgame","A queen vs rook ending","A pawn structure"],a:0,e:"The Lucena position is a key rook ending technique: the stronger side builds a bridge to shelter the king."},
  {q:"What is a pawn majority?",os:["Having more pawns on one side of the board","Having passed pawns","Doubled pawns","A pawn chain"],a:0,e:"A pawn majority means more pawns on one side — use it to create a passed pawn."},
  {q:"What is prophylaxis?",os:["An attacking move","Preventing the opponent's plan before it starts","A tactical pattern","A type of pawn structure"],a:1,e:"Prophylaxis is thinking about what your opponent wants to do and stopping it first."},
  {q:"What is an outpost?",os:["A weak square you control that the opponent cannot attack with pawns","A passed pawn","The centre squares","A rook on the 7th rank"],a:0,e:"An outpost is a strong square that the opponent cannot attack with pawns — perfect for knights."},
  {q:"What is a zwischenzug?",os:["A type of endgame","An in-between move before the expected response","A German opening","A pawn sacrifice"],a:1,e:"Zwischenzug is an in-between move that disrupts the expected sequence, often changing the evaluation."},
  {q:"What is the 'square rule' in pawn endings?",os:["Determining if the king can catch a passed pawn","The key squares of a pawn","The opposition","The Lucena position"],a:0,e:"The square rule: draw a diagonal from the pawn to the promotion square — if the king can enter this square, it catches the pawn."},
  {q:"What is a discovered check?",os:["A normal check","A check revealed by moving a piece that was blocking","Checkmate","A double check"],a:1,e:"Discovered check: moving one piece reveals a check from a piece behind it."},
  {q:"What is king safety?",os:["Having the king in the centre","Keeping the king protected, usually by castling","Moving the king forward","Having many pawns around the king"],a:1,e:"King safety means keeping the king protected from attacks, especially by castling and keeping pawn cover."},
  {q:"What is piece coordination?",os:["Moving pieces to the same square","Having pieces work together to control key squares","Trading pieces","A type of attack"],a:1,e:"Piece coordination means having your pieces work together harmoniously, often targeting the same weaknesses."},
  {q:"What is a tempo in chess?",os:["Time on the clock","A move that improves your position while forcing the opponent to waste a move","The first move advantage","Rapid chess"],a:1,e:"A tempo is a unit of time. Gaining a tempo means making a useful move while forcing the opponent to waste their move."}
],
3:[
  {q:"What is the Philidor position?",os:["A rook ending drawing technique","A winning attack","An opening system","A pawn structure"],a:0,e:"The Philidor position: place the rook on the 6th rank, then only check from behind when the king advances. This draws the rook ending."},
  {q:"What is triangulation?",os:["A pawn formation","A king manoeuvre to lose a tempo and gain opposition","An attack pattern","A type of fork"],a:1,e:"Triangulation: the king takes three moves where the opponent takes two, gaining the opposition in king+pawn endings."},
  {q:"What is a zugzwang?",os:["A type of attack","A position where any move worsens your position","A drawing technique","A pawn sacrifice"],a:1,e:"Zugzwang: you are in zugzwang when any move you make worsens your position — common in endgames."},
  {q:"What is the key square of a pawn?",os:["The square directly in front of the pawn","The squares the king must reach to guarantee promotion","The promotion square","The starting square"],a:1,e:"Key squares: if the king reaches these squares, the pawn always promotes regardless of where the opponent's king is."},
  {q:"What is a pawn break?",os:["Capturing a pawn","An advance that opens files and changes the pawn structure","A pawn sacrifice","A passed pawn"],a:1,e:"A pawn break is a pawn advance that opens lines, creates counterplay, or changes the structure."}
  ,

  {q:"What is the 'outside passed pawn' technique in endgames?",os:["A passed pawn on the queenside used as a decoy — it pulls the opponent's king away, allowing your king to invade on the other side","A pawn that has passed the midpoint of the board","A pawn with no opposing pawns on its file","Any pawn that reaches the 6th rank"],a:0,e:"The outside passed pawn is one of the most powerful endgame weapons. By creating a passed pawn far from the main action (usually on the a or h file), you force the opponent's king to chase it. While their king is distracted, yours marches in on the opposite side to capture pawns and promote. Classic winning technique taught in every endgame course."}
  ,
  {q:"What is the 'initiative' in chess?",os:["Having more material than your opponent","Making threats that force the opponent to react — the player with initiative dictates the game","Being the first player to castle","Having pawns in the centre"],a:1,e:"Initiative means you're making threats that your opponent MUST respond to — they're reacting to you, not you to them. With initiative you control the game's direction. Maintaining initiative (keeping threats flowing) is how attacking players win games. Losing initiative means your opponent starts making the threats and you spend moves just reacting."},
  {q:"What does 'removing the defender' mean as a tactic?",os:["Exchanging the opponent's best attacking piece","Capturing or chasing away a piece that is defending something valuable, making the defended piece vulnerable","Sacrificing material to open the king","Moving your own defending piece to a better square"],a:1,e:"'Remove the defender' is one of the most important tactical motifs. Example: Black's knight on f6 defends the h7 pawn. You capture the knight (Bxf6), removing the defender of h7. Now Qxh7+ or Bxh7+ is available. Always ask: 'What is this piece defending? If I remove it, what becomes vulnerable?' This thought process finds countless tactical opportunities."},
  {q:"When should you trade pieces according to middlegame strategy?",os:["Always trade when pieces are equal in value","Trade when you're ahead in material, when trading eliminates the opponent's best piece, or when it leads to a winning endgame","Never trade — keep all pieces on the board","Trade whenever you're under attack"],a:1,e:"Trading is most effective when: (1) you already have more material — trading simplifies toward a technical win, (2) the traded piece is your opponent's most dangerous attacker, (3) you enter a technically won endgame. Avoid trading when you're attacking (you need pieces for the attack), or when the trade gives the opponent relief from a difficult position. 'The threat is stronger than its execution.'"},
  {q:"What are the conditions for a successful kingside attack?",os:["Always attack the kingside — it's where the king castles","You need: more pieces aimed at the king than the opponent has defenders, completed development, and your own king must be safe","You need: a passed pawn, an active bishop, and a queen on the 4th rank","Attack whenever you see the opponent has castled kingside"],a:1,e:"Three conditions must be met for a successful attack: (1) MORE attacking pieces aimed at the king than the opponent has defenders — piece count near the king is decisive, (2) YOUR development complete — you need all pieces available, (3) YOUR king safe — a counterattack while your king is exposed loses. Check all three before sacrificing material. Meeting 2 of 3 often leads to a losing attack."}
  ,
  {q:"What is the 'exchange sacrifice' in chess?",os:["Sacrificing a queen for two minor pieces","Sacrificing a rook for a bishop or knight (giving up 2 points) to gain positional compensation — eliminating a dominant piece, gaining a passed pawn, or defusing an attack","Trading equal pieces to simplify","Giving up a pawn to open a file"],a:1,e:"The exchange sacrifice (Rxb1 type, losing rook for bishop/knight) is one of the deepest positional weapons. Petrosian used it constantly. It's correct when: eliminating the opponent's best piece (e.g. a dominant knight on d5), gaining a powerful bishop pair, creating a passed pawn, or defusing a mating attack. The point value (-2) is irrelevant when the positional gain is large enough."},
  {q:"What is Nimzowitsch's 'blockade' concept?",os:["Blocking all your own pieces to defend","Placing a piece (ideally a knight) directly in front of an enemy passed pawn to stop it — the blockading piece is perfectly safe","Blocking the opponent's king from escaping","Using pawns to block the opponent's pieces"],a:1,e:"Nimzowitsch's blockade: a knight placed on the square directly in front of a passed pawn neutralises it completely and permanently — the pawn can never capture the knight. A knight on d5 blockading a pawn on d4 is one of the best squares any piece can occupy. The blocked pawn becomes weak, and all of the opponent's pieces are tied to defending it."},
  {q:"What does 'open file domination' mean strategically?",os:["Having a pawn on an open file","Placing a rook on an open file and using it to invade the 7th rank or attack a backward pawn — controlling means INVADING, not just occupying","Clearing all pawns from one side of the board","Having both rooks on open files simultaneously"],a:1,e:"Placing a rook on an open file is step 1. Step 2 — and the strategic goal — is INVASION. The rook must reach the 7th rank (attacking unmoved pawns and caging the king) or pressure a backward pawn on the open file. A rook that sits on an open file without ever penetrating is doing less than it should. 'Rooks belong on open files; open files are highways into the opponent's position.'"}
  ],
3:[
  {q:"In the Lucena position, what is 'building a bridge'?",os:["Moving the pawn forward as fast as possible","Using the rook to interpose on the 4th rank, sheltering the king from back-rank checks so the pawn can promote","Castling in the endgame","Using the king to block the defending rook"],a:1,e:"Building a bridge: after reaching the Lucena position (king on 7th rank beside the pawn, rook behind), you play Rg4 (bridge rook), then advance the king, and when the defending rook checks, interpose with Rge4. The rook 'bridges' the gap, sheltering the king from checks. Simple and elegant — always works!"},
  {q:"What is the 'key square' of the e4 pawn?",os:["e5 (one square ahead)","d6, e6, and f6 (two ranks ahead on all three files)","e8 (the promotion square)","d4 and f4 (the squares beside it)"],a:1,e:"Key squares are the three squares two ranks ahead of the pawn on the same and adjacent files. For the e4 pawn: d6, e6, f6. If your king reaches ANY of these squares, the pawn promotes regardless of where the enemy king is. If the enemy king holds ALL of these squares, the position may be drawn."},
  {q:"From Kotov's 'Think Like a Grandmaster', what is the candidate moves system?",os:["Always play the first good move you see to save time","Calculate every possible variation before deciding","List 2-4 reasonable candidate moves first, then calculate each one completely before deciding","Ask what your opponent wants and stop it first"],a:2,e:"Kotov's system: BEFORE calculating, list your candidates (typically 2-4). Then calculate each one to its conclusion WITHOUT switching between variations mid-calculation. This prevents 'hope chess' (playing the first attractive move) and 'if-he-goes-there-I-go-there' shallow thinking."},
  {q:"What does it mean to 'improve your worst piece' (Karpov's principle)?",os:["Exchange your weakest piece for an equal piece","Find the least active piece in your position and give it the best possible square — harmony over sparkle","Sacrifice the worst piece for an attack","Move the worst piece to defend the king"],a:1,e:"Karpov's method: a position where all pieces coordinate well beats one with three great pieces and one terrible one. Always ask: which of my pieces is contributing the least? Then find it the best square. This principle alone separates positional players from tactical-only players."},
  {q:"What is 'zugzwang' and when does it occur?",os:["A German opening where White grabs the centre quickly","A position where having to move is a disadvantage — any move worsens your position","A type of discovered check","A standard pawn endgame draw technique"],a:1,e:"Zugzwang: the player to move would prefer to 'pass' but must make a move that worsens their position. Most common in king-pawn endgames where whoever moves their king first must yield the key squares. The classic zugzwang: king must move away from defending a pawn that then falls."},
  {q:"Why does opposite-coloured bishop material advantage often not win?",os:["The stronger side always makes a mistake","Each bishop cannot attack or control the squares its own colour doesn't cover — the defender places pieces on the colour the attacker's bishop can't reach","The defending king always reaches the corner","Bishops can't give checkmate in these positions"],a:1,e:"Each bishop is colour-blind — it only controls half the board. The defending side simply places the king and pawns on the squares the attacking bishop can't touch. On those squares, the attacking bishop has no power. Hence the famous rule: 'with opposite-coloured bishops, the defender has an extra piece.'"},
  {q:"What is the Tarrasch Rule for rook endgames?",os:["Always trade rooks when ahead in material","Place your rook BEHIND passed pawns — both yours and your opponent's","Never let the rook leave the back rank","Double rooks before pushing pawns"],a:1,e:"Tarrasch's Rule: rooks belong behind passed pawns. Behind your own pawn, the rook gains freedom as the pawn advances. Behind the opponent's pawn, the rook restrains it from all squares simultaneously. This is the single most practically important endgame rule for club players."},
  {q:"When is it correct to sacrifice material for piece activity?",os:["Never — always keep the material","When your pieces become radically more active and can create unstoppable threats that more than compensate for the material","Only when you're already losing","When you have equal material"],a:1,e:"Material is worth less than piece activity when the activity creates concrete winning threats. Capablanca, Tal, and Mikhail Botvinnik sacrificed material regularly for 'activity compensation.' The test: after the sacrifice, can you force something concrete? If yes — sacrifice! Abstract activity without concrete threats rarely compensates for material."},
  {q:"What does Silman mean by 'playing to the imbalances'?",os:["Always making the most forcing move","Identifying what makes your position uniquely better or worse (structure, activity, space, king safety) and making a plan based on YOUR specific advantages","Keeping the position equal and symmetric","Avoiding pawn structure weaknesses at all costs"],a:1,e:"Silman's core teaching: every position has unique characteristics (imbalances) that differ from a 'normal' position. Find what's uniquely good about YOUR position and exploit it. If you have better structure, trade pieces. If you have more active pieces, attack. Fighting the position rather than playing your advantages is the central strategic mistake."},
  {q:"What is 'the Lucena position' and why is it important?",os:["A defensive drawing technique with king and pawn","A king + rook + pawn vs king + rook position with the pawn on the 7th rank — the key WINNING endgame position that every player must know how to convert","A drawn opposite-coloured bishops position","The key position in king and pawn vs king endgames"],a:1,e:"The Lucena position is the canonical winning rook + pawn endgame. If you reach it, you win — but ONLY if you know 'building a bridge.' Without this technique, the defending rook's checks will prevent the king from aiding promotion. Every competitive player from club to grandmaster must know this technique cold."},
  {q:"What is the correct king placement in a K+Q vs K endgame?",os:["Keep the king away from the action — only use the queen","The king must advance toward the enemy king to help deliver checkmate — never mate without the king's help","Place the king on the back rank to avoid stalemate","The king should stay near the promotion square only"],a:1,e:"In K+Q vs K, the king is your most important helper. The queen alone cannot force checkmate without risking stalemate. The king advances toward the enemy king to cut off escape squares, while the queen restricts the area the enemy king can access. The typical mating net requires your king on the 6th rank."}
,
  {q:"What is K+B+N vs K and why is it notable?",os:["It's always a draw — insufficient material","It's a forced checkmate but requires precise technique: drive the king to the corner matching the bishop's colour","It's an easy win — just like K+Q vs K","It's a draw only if the defender plays correctly"],a:1,e:"K+B+N vs K is the hardest basic endgame — it IS a forced win but requires very precise technique. The key: you must drive the king to the corner that matches your bishop's colour (light-squared bishop → light-squared corner). The 'W maneuver' triangulates the knight to force the king to the correct corner. Takes up to 33 moves to force mate from any position."},
  {q:"What is the 'swindle' and why should every beginner know it?",os:["A brilliant attacking combination from a winning position","A defensive trick — saving a lost position through stalemate, perpetual check, or other drawing resources the opponent overlooks","Trading pieces when ahead in material","An opening trap that wins quickly"],a:1,e:"A swindle is pulling off a save in a lost position through cleverness — stalemate trap, perpetual check, fortress construction, or a tactic the winning player overlooks. Korchnoi (a world championship finalist) specialised in swindles. Learning swindle patterns makes you psychologically harder to beat and wins half-points you'd otherwise lose."},
  {q:"What is the 'concentric circles' principle in chess improvement?",os:["Play games in circles — attacking from all sides simultaneously","Revisit key concepts at progressively deeper levels as your understanding grows — tactics, then positional, then endgame applications of the same ideas","Always study openings, middlegames, and endgames equally","Start with endgames and work backwards to the opening"],a:1,e:"The best chess learning is spiral: you learn about pawn structure at a basic level, then revisit it at a deeper level as you improve, then again at an even deeper level. Each pass through a concept reveals more. This is why Silman's books are structured this way — 'Reassess Your Chess' and the 'Amateur's Mind' cover similar ideas at different depths for different rating levels."}
  ,
  {q:"What is 'perpetual check' and when should you look for it?",os:["Checking the king three times in a row to win the game","Giving check endlessly on alternating squares so the king can never escape — used as a drawing weapon when losing","A check that forces checkmate within 3 moves","Checking the king to force it into a corner"],a:1,e:"Perpetual check = checking the king endlessly with no escape. It forces a draw by threefold repetition or the 50-move rule. Crucially, you should look for it when you're LOSING — it turns a loss into a draw. Two conditions: (1) you can check the king on at least two alternating squares, (2) the king cannot escape the checking pattern. This is the most common practical 'swindle' in chess."},
  {q:"What is 'active defense' and why is it better than passive defense?",os:["Defending with your queen and rooks only, not pawns","Creating counter-threats while defending — forcing the attacker to also defend, rather than just blocking threats passively","Moving all pieces back to the first rank to defend","Trading as many pieces as possible when attacked"],a:1,e:"Active defense creates COUNTER-THREATS while defending. Instead of just blocking an attack, you also threaten something that forces your opponent to divert attention. Passive defense gives the attacker all decisions — they can continue improving their position while you just react. Active defense forces them to also react, often blunting attacks that would otherwise be decisive. Petrosian made this into an art form."}
  ,
  {q:"What is Kotov's key rule about calculating variations?",os:["Always calculate every possible move before deciding","List candidate moves first, then calculate each branch FULLY without switching between variations mid-calculation","Always play the first good move you see to save time","Calculate only forcing moves (checks and captures)"],a:1,e:"Kotov's system from 'Think Like a Grandmaster': (1) List all candidate moves before calculating any. (2) Calculate each candidate fully — to quiescence — without jumping to another branch mid-way. (3) 'Don't abandon a branch halfway — finish it or don't start it.' Players who switch between variations constantly make errors because they lose track of which branch they're evaluating."},
  {q:"What is the 'principle of two weaknesses' in positional chess?",os:["Never create more than two weaknesses in your own position","Create one weakness, the opponent defends it. Create a SECOND weakness on the other side — the opponent cannot defend both simultaneously","Always attack two pieces at once with every move","Place two pieces on weak squares to dominate the position"],a:1,e:"Capablanca and Nimzowitsch's key technique: attack weakness #1 until the opponent commits all defenders to it. Then open a SECOND front on the other side of the board. The opponent's pieces are tied to defending the first weakness — they can't handle both. Classic execution: tie down the enemy rook defending a weak d-pawn, then open the h-file for a kingside attack. Their rook can't be in two places."},
  {q:"What separates a master's thinking from an amateur's (Silman's 'Amateur's Mind')?",os:["Masters calculate more moves ahead than amateurs","Amateurs ask 'what tactic is available?' — Masters ask 'who stands better and why?' then plan based on imbalances","Masters only play attacking chess; amateurs only defend","Masters memorise more opening theory than amateurs"],a:1,e:"Silman's 'The Amateur's Mind' identifies the key difference: amateurs react tactically (what can I take?), masters think positionally first (who has the advantage and why?). Masters assess the imbalances, identify advantages, then create a plan. Amateurs jump to the first attractive move. This shift — from reactive to strategic thinking — is the most important transformation in chess improvement from club level to expert."}
  ]};

const OPTIPS={
qgd:{ideas:"White's plan: minority attack — push b4-b5-bxc6, creating a backward c6-pawn. Black's plan: central break ...c5 or ...e5 to free the position. The QGD leads to rich positional battles where small advantages decide. From Karpov's games — the absolute model for QGD technique.",
mistakes:"Don't play Bg5 before Nc3 and Nf3 are out. Avoid locking the bishop in with e3 before it's developed. White should not push d5 prematurely without concrete compensation.",
book:"See Nimzowitsch's 'My System' for the minority attack concept. Karpov's collected games show perfect QGD technique. 'Winning with the Queen's Gambit' by Bogdan Lalic covers all variations."},
london:{ideas:"The London triangle (d4+Bf4+e3) is unbreakable. Against anything Black plays, White builds the same structure. White's plan: Nbd2, Bd3, 0-0, Ne5, then f4-f5 or h4-h5 depending on Black's setup. Very safe and reliable for beginners.",
mistakes:"Never play e3 before Bf4 — you lock the bishop in. Don't play Bb5+ without a clear reason (it wastes time). Avoid h3 too early in positions where you haven't castled.",
book:"'The London System with 2.Bf4' by Simon Williams (Grandmaster Repertoire series) is the definitive work. For general ideas, Silman's structure analysis in 'Reassess Your Chess' applies."},
italian:{ideas:"White's plan: build with c3-d4 to grab the full centre. Then choose between kingside (f4-f5 after 0-0) or central (d4-d5) pawn breaks. The Italian bishop on c4 is the key piece — keep it there as long as possible.",
mistakes:"Don't move the c4 bishop unless forced. Don't play d4 before c3 prepares it — you'll get a weak isolated pawn. Avoid early piece exchanges that give Black comfortable equality.",
book:"Capablanca's 'Chess Fundamentals' (1921) extensively covers Italian Game principles. Chernev's 'Logical Chess: Move by Move' includes many illustrative Italian games with full explanations."},
ruy:{ideas:"The Ruy López is subtle and strategic. Bb5 doesn't immediately win anything — it creates long-term pressure. White's plan: 0-0, Re1, Nf1-g3 (the typical Ruy reroute), d4, then expand. The Spanish is about slow, grinding pressure — not sharp tactics.",
mistakes:"Don't trade the bishop for the knight too early in the Morphy Defence (Ba4 is usually better than Bxc6). Don't rush the d4 push without completing development first (Re1 comes before d4).",
book:"Every major chess book covers the Ruy López. Fischer's 'My 60 Memorable Games' includes many Ruy López games with annotations. Spassky's games with the White pieces are model Ruy López technique."},
kid:{ideas:"Black's plan: castle kingside, then launch ...e5 (or ...c5 against the Sämisch). After White plays d5, Black attacks on the kingside with ...f5-f4. The KID is the most fighting of all defences — always playing for a win. The g7 bishop becomes unstoppable when lines open.",
mistakes:"Don't play ...e5 before castling and completing development. Never trade the g7 bishop without major compensation. Don't play ...e5 AND ...c5 — choose one counterattack based on White's setup.",
book:"Kasparov's 'My Great Predecessors Vol. II' covers the King's Indian brilliantly. 'Beating the Classical King's Indian' by Nunn & Gallagher is the theoretical standard."},
sicilian:{ideas:"Black's plan: counterattack with ...b5, ...a5, ...Rb8-b4 on the queenside while White attacks on the kingside. The c-file is Black's highway. After ...cxd4, Black controls d4 and uses the c-file for active rook play. In the Najdorf, ...a6 is multi-purpose: stops Bb5, prepares ...b5.",
mistakes:"Don't play ...e5 too early — it blocks the g7 bishop (in Dragon) and gives White d5. In the Najdorf, don't rush ...b5 without calculating if White can exploit the weakened queenside.",
book:"Kasparov's Najdorf games are the gold standard. 'The Sicilian Defence' by Everyman Chess covers all major variations. For the Dragon, 'The Dragon Variation' by Neil McDonald."},
french:{ideas:"Black's plan: attack the chain base d4 with ...c5. ALWAYS play ...c5 at the earliest opportunity — this is the soul of the French. After White plays e5, Black's counterplay MUST come from ...c5 undermining the chain.",
mistakes:"Don't forget to free the 'French bishop' on c8 — play ...b6 and ...Bb7, or trade it on d3. Never play ...f6 in the French Advance without careful calculation — it often weakens too much.",
book:"'How to Play the French Defence' by Soltis is beginner-friendly. Uhlmann's collected games are classics of French strategy. Nimzowitsch himself played the French — see 'My System' for his strategic insights."},
caro:{ideas:"The Caro-Kann's key advantage: the c8 bishop is NEVER the 'French bad bishop' — it develops to f5 or g4 BEFORE the pawn closes. Black's plan: 0-0, ...Nd7, ...Ngf6-e4 or similar, centralising the pieces. Very solid and reliable.",
mistakes:"In the classical (4…Bf5), don't exchange the bishop for the knight on e4 unless you gain a concrete advantage. Don't play ...e6 before the bishop is developed in the classical — it locks the bishop in.",
book:"Karpov wrote 'The Caro-Kann Defence' from personal experience — he used it to win the world championship twice. An essential book for any Caro-Kann player."},
pirc:{ideas:"Black's plan: castle, play ...e5 or ...c5 depending on White's setup, then use the g7 bishop as a long-range weapon. The Pirc is highly flexible — you can adopt different setups. The 'Austrian Attack' (f4-f5) is White's most aggressive try.",
mistakes:"Don't play ...e5 before the bishop is on g7 — White gets an outpost on d5 immediately. Against the Austrian Attack (f4), play ...e5! immediately to prevent f4-f5.",
book:"'The Pirc in Black and White' by James Vigus is the definitive modern treatment. Spassky and Larsen used the Pirc to great effect — their games are worth studying."},
dutch:{ideas:"Stonewall plan: ...Bd6 (best square for the bishop), ...Ne4, castle kingside, then support the knight on e4 with ...f5-f4 ideas. The ...Ne4 knight is the cornerstone of the Stonewall — defend it or use it to trade for White's strong pieces.",
mistakes:"Don't play ...g5?? — it weakens the king and is a typical beginner mistake in the Dutch. Don't exchange the d5 pawn for e4 unless you get clear compensation.",
book:"'The Dutch Defence' by Nesis and 'Play the Dutch' by Simon Williams cover the Stonewall in depth. Botvinnik and Petrosian's Stonewall games are the classical models."}
,
scandinavian:{
  ideas:"The Scandinavian is one of the most direct openings — Black immediately challenges the centre. After 2…Qxd5, White gains a tempo with Nc3, but Black's queen retreats to a5 (active) or d6. Plan: ...c6, ...Bf5, ...e6, castle short. Very solid and easy to learn for beginners.",
  mistakes:"Don't bring the queen to d6 in the main line — it blocks the bishop. Don't neglect development after picking up the d5 pawn. The queen on a5 is active but needs support from ...c6 and ...Nc6 before launching any action.",
  book:"The Scandinavian is covered in 'Play the Scandinavian' by Christian Bauer (Everyman Chess). For beginners, it's easier to learn than the Sicilian since the ideas are simpler. Many 1200-1600 players use it as their main weapon against 1.e4."
}};

// ── STATE ─────────────────────────────────────────────────────
const ST:any={xp:0,lv:1,streak:0,skillLevel:null,done:new Set(),qzRes:{},varsDone:{},opsDone:new Set(),
  // ── Eval mastery state ──
  practiceDone:new Set<string>(),
  evalTacSolved:new Set(),evalMateSolved:0,evalMateStreak:0,evalEgPassed:new Set(),
  evalTac:{st:null,sel:null,puz:null,attempts:0},
  evalMate:{st:null,sel:null,puz:null,step:0},
  evalEg:{st:null,sel:null,drill:null,moves:0,log:[],over:false},
  evalBot:{st:null,sel:null,bot:null,history:[],states:[],coach:[],stats:{cap:0,chk:0},over:false},
  curOp:'qgd',curVar:'qgd_dec',board:{},step:0,sel:null,hint:false,
  qlv:1,qstep:0,qans:[],curMod:null,totalCorrect:0,totalQ:0,
  // ── New v3 fields ──
  botWins:{} as Record<string,number>,
  gameHistory:[] as any[],
  eloHistory:[] as number[],
  eloPeak:400,
  weaknesses:{} as Record<string,number>,
  srData:{} as Record<string,any>,
  frogs:[] as string[],
  achievements:[] as string[],
  _dailyPuzzleKey:null as string|null,
  _dailyPuzzleIdx:-1 as number,
};

const XPT=[0,120,300,560,900,1400];
function pos0(){return{a8:'bR',b8:'bN',c8:'bB',d8:'bQ',e8:'bK',f8:'bB',g8:'bN',h8:'bR',a7:'bP',b7:'bP',c7:'bP',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',a1:'wR',b1:'wN',c1:'wB',d1:'wQ',e1:'wK',f1:'wB',g1:'wN',h1:'wR',a2:'wP',b2:'wP',c2:'wP',d2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP'};}

// ── XP SYSTEM ─────────────────────────────────────────────────
function addXP(n,label=''){
  ST.xp+=n;
  let lv=1;for(let i=1;i<XPT.length;i++){if(ST.xp>=XPT[i])lv=i+1;}
  const lvUp=lv>ST.lv;if(lvUp){ST.lv=lv;confetti();toast('🎉 Level Up! You are now Level '+lv,'t-gld');}
  const lo=XPT[Math.min(ST.lv-1,XPT.length-1)],hi=XPT[Math.min(ST.lv,XPT.length-1)]||ST.xp+1;
  document.getElementById('xp-num').textContent=ST.xp+' XP';
  document.getElementById('lv-pill').textContent='Level '+ST.lv;
  if(label&&!lvUp) toast(label,'t-gld');
  updateHomeStats();
  saveProgress();
}

// ── CONFETTI ──────────────────────────────────────────────────
function confetti(){
  const colors=['#c8a95a','#e8cc88','#4a9e6a','#88ccaa','#fff8e8'];
  for(let i=0;i<50;i++){
    const p=document.createElement('div');p.className='confetti-piece';
    p.style.cssText=`left:${Math.random()*100}vw;top:0;width:${6+Math.random()*6}px;height:${6+Math.random()*6}px;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${.8+Math.random()*.8}s;animation-delay:${Math.random()*.4}s`;
    document.body.appendChild(p);setTimeout(()=>p.remove(),1600);
  }
}

// ── TOAST ─────────────────────────────────────────────────────
let toastTimer;
function toast(msg,cls=''){
  const el=document.getElementById('toast');el.textContent=msg;el.className='toast show '+cls;
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
}

// ── VIEW SWITCHING ─────────────────────────────────────────────
function switchView(v){
  try {
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('act'));
    const t=document.getElementById('view-'+v);if(t)t.classList.add('act');
    document.querySelectorAll('.nav-item').forEach(x=>{x.classList.toggle('act',x.dataset.v===v);x.setAttribute('aria-current',x.dataset.v===v?'page':'false');});
    // close mobile nav when navigating
    document.querySelector('.leftnav')?.classList.remove('open');
    document.getElementById('nav-overlay')?.classList.remove('open');
    document.getElementById('hamburger')?.setAttribute('aria-expanded','false');
    if(v==='home')renderHome();
    if(v==='learn')renderLearnPath();
    if(v==='openings'){
      const _panel=document.getElementById('op-board-panel');
      const _grid=document.getElementById('op-grid');
      const _sh=document.querySelector('#view-openings .section-head');
      if(_panel)_panel.style.display='none';
      if(_grid)_grid.style.display='grid';
      if(_sh)_sh.style.display='block';
      renderOpGrid();
    }
    if(v==='eval-puzzles')buildTacGrid();
    if(v==='eval-mates')buildMateGrid();
    if(v==='eval-endgame')buildEgGrid();
    if(v==='eval-bot')buildBotGrid();
    if(v==='eval-progress')buildProgress();
    if(v==='tactics')renderTactics();
    if(v==='endgames')renderEndgames();
    if(v==='tournament')buildTournament();
    if(v==='game-history')buildGameHistory();
    if(v==='elo-tracker'){setTimeout(buildEloTracker,50);}
    if(v==='glossary')buildGlossary();
    if(v==='chocolate-frogs')buildFrogs();
    if(v==='guess-the-move')initGTM();
    if(v==='chess960')chess960Shuffle();
  } catch(err) {
    console.error('View render error in "'+v+'":', err);
    const el=document.getElementById('view-'+v);
    if(el) el.innerHTML='<div style="padding:40px;color:#c0392b;font-family:monospace;font-size:.85rem">⚠️ Something went wrong loading this view.<br><br><button onclick="location.reload()" style="margin-top:10px;padding:6px 14px;cursor:pointer;border-radius:6px;border:1px solid #c0392b;background:none;color:#c0392b">Reload page</button></div>';
  }
}

// ── HOME VIEW ─────────────────────────────────────────────────
// ── DAILY PUZZLE / HOUSE CUP ────────────────────────────────────
function getDailyPuzzleIdx(): number {
  const d = new Date();
  const seed = d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
  return seed % ALL_PUZZLES.length;
}

function injectDailyCard(wrap: Element) {
  if(document.getElementById('daily-card'))return;
  const idx=getDailyPuzzleIdx();
  const puzz=ALL_PUZZLES[idx];
  const todayKey='daily_'+new Date().toDateString();
  const done=!!localStorage.getItem(todayKey);
  const card=document.createElement('div');
  card.className='daily-card'+(done?' done':'');
  card.id='daily-card';
  card.innerHTML=`<div class="dc-icon">🎩</div>
    <div class="dc-body">
      <div class="dc-label">Daily Challenge — Wizard's Puzzle</div>
      <div class="dc-title">${puzz.title||puzz.type||'Tactics Puzzle'}</div>
      <div class="dc-status">${done?'✅ Completed today':'Solve to earn +25 XP & 🔥 streak bonus'}</div>
    </div>
    <div class="dc-streak">🔥 ${ST.streak}</div>`;
  card.addEventListener('click',()=>{
    if(done){toast('✅ Already solved today — come back tomorrow!','tok');return;}
    ST._dailyPuzzleKey=todayKey;
    ST._dailyPuzzleIdx=idx;
    switchView('eval-puzzles');
    setTimeout(()=>loadTac(ALL_PUZZLES[idx]),200);
  });
  const cc=document.getElementById('continue-card');
  if(cc)cc.parentElement!.insertBefore(card,cc);
  // House cup
  if(!document.getElementById('house-cup-bar')){
    const cup=document.createElement('div');cup.className='house-cup';cup.id='house-cup-bar';
    const house=ST.xp>=1000?'Gryffindor':ST.xp>=500?'Ravenclaw':ST.xp>=200?'Hufflepuff':'Slytherin';
    const houseIcon={Gryffindor:'🦁',Ravenclaw:'🦅',Hufflepuff:'🦡',Slytherin:'🐍'}[house];
    cup.innerHTML=`<div class="house-cup-icon">${houseIcon}</div>
      <div class="house-cup-pts">${ST.xp} pts</div>
      <div style="flex:1;font-size:.75rem;color:var(--txt)">${house} — House Cup rank by XP</div>`;
    if(cc)cc.parentElement!.insertBefore(cup,card);
  }
}

function renderHome(){
  const _s=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  _s('stat-xp',ST.xp);
  _s('stat-lessons',ST.done.size+'/'+MODS.length);
  _s('stat-correct',ST.totalQ>0?Math.round(ST.totalCorrect/ST.totalQ*100)+'%':'--');
  _s('stat-openings',ST.opsDone?ST.opsDone.size:0);
  _s('streak-num',ST.streak);
  const next=(typeof getNextLesson==='function'?getNextLesson():null)||(MODS.find(m=>!ST.done.has(m.k))||MODS[MODS.length-1]);
  _s('cc-title',next.name);_s('cc-desc',next.desc);
  const pct=Math.round(ST.done.size/MODS.length*100);
  const ccf=document.getElementById('cc-fill');if(ccf)ccf.style.width=pct+'%';
  _s('cc-pct',pct+'% complete');
  const cc=document.getElementById('continue-card');if(cc)cc.onclick=()=>openLesson(next.k);
  const hw=document.querySelector('.home-wrap');if(hw)injectDailyCard(hw);
  const ql=document.getElementById('quick-lessons');
  if(ql){ql.innerHTML='';MODS.slice(0,5).forEach(m=>{
    const done=ST.done.has(m.k);const d=document.createElement('div');d.className='ql-item';
    d.innerHTML='<div class="ql-ico lv'+m.level+'">'+m.icon+'</div>'
     +'<div class="ql-body"><span class="ql-name">'+m.name+'</span>'
     +'<span class="ql-meta">Stage '+m.level+' · +'+m.xp+' XP</span></div>'
     +'<span class="ql-status">'+(done?'✅':'→')+'</span>';
    d.addEventListener('click',()=>openLesson(m.k));ql.appendChild(d);
  });}
  const pp=document.getElementById('path-preview');
  if(pp){pp.innerHTML='';MODS.slice(0,6).forEach((m,i)=>{
    const done=ST.done.has(m.k);
    const act=!done&&(i===0||ST.done.has(MODS[i-1]&&MODS[i-1].k));
    const d=document.createElement('div');d.className='path-node';
    d.innerHTML='<div class="pn-dot '+(done?'done':act?'act':'lock')+'">'
     +(done?'✓':act?'→':m.icon)+'</div>'
     +'<div class="pn-txt"><span class="pn-name">'+m.name+'</span>'
     +'<span class="pn-sub">'+(done?'Completed':act?'Up next':'Locked')+'</span></div>';
    if(act||done)d.addEventListener('click',()=>openLesson(m.k));
    pp.appendChild(d);
  });}
  const es=document.getElementById('home-eval-section');
  if(!es)return;
  es.innerHTML='';
  const s1=typeof isStageUnlocked==='function'?isStageUnlocked(1):true;
  const s2=typeof isStageUnlocked==='function'?isStageUnlocked(2):false;
  [
    {ico:'🏁',t:'Openings Lab',s:(ST.opsDone?ST.opsDone.size:0)+' mastered',v:'openings',lk:!s1},
    {ico:'⚔️',t:'Tactics Puzzles',s:(ST.evalTacSolved?ST.evalTacSolved.size:0)+' solved',v:'eval-puzzles',lk:!s1},
    {ico:'♟',t:'Tactics Lab',s:'6 patterns',v:'tactics',lk:!s1},
    {ico:'♚',t:'Endgame Lab',s:'12 endings',v:'endgames',lk:!s1},
    {ico:'👑',t:'Checkmate Drills',s:(ST.evalMateSolved||0)+' solved',v:'eval-mates',lk:!s2},
    {ico:'🤖',t:'Play vs Bot',s:'5 levels',v:'eval-bot',lk:!s2}
  ].forEach(mc=>{
    const d=document.createElement('div');
    d.className='eval-mc'+(mc.lk?' eval-locked':'');
    d.innerHTML='<div class="emc-ico">'+mc.ico+'</div>'
     +'<div class="emc-body"><div class="emc-title">'+mc.t+'</div>'
     +'<div class="emc-sub">'+(mc.lk?'🔒 Pass Stage 1 quiz':mc.s)+'</div></div>'
     +'<div class="emc-arrow">'+(mc.lk?'':'›')+'</div>';
    d.addEventListener('click',()=>mc.lk?toast('🔒 Pass Stage 1 quiz to unlock','t-bad'):switchView(mc.v));
    es.appendChild(d);
  });
}
const LEVEL_NAMES={1:'Level 1 · Foundations',2:'Level 2 · Combat',3:'Level 3 · Mastery'};
const LEVEL_BAD={1:'lbg-1',2:'lbg-2',3:'lbg-3'};
const LEVEL_ICO={1:'ico-lv1',2:'ico-lv2',3:'ico-lv3'};

function renderLearnPath(){
  const el=document.getElementById('lesson-path');el.innerHTML='';
  [1,2,3].forEach(lv=>{
    const lvLocked=lv>1&&!ST.qzRes?.[lv-1];
    const mods=MODS.filter(m=>m.level===lv);
    const grp=document.createElement('div');grp.className='level-group';
    grp.innerHTML=`<div class="level-header"><span class="level-badge-large ${LEVEL_BAD[lv]}">${LEVEL_NAMES[lv]}</span><div class="level-line"></div>${lvLocked?`<span class="lv-lock-tag">🔒 Pass Level ${lv-1} quiz to unlock</span>`:''}</div><div class="lesson-nodes" id="ln-${lv}"></div>`;
    el.appendChild(grp);
    const nodesEl=grp.querySelector('#ln-'+lv);
    mods.forEach(m=>{
      const done=ST.done.has(m.k);
      const nd=document.createElement('div');
      nd.className='lnode '+(lvLocked?'lk':done?'done':'act');
      if(lvLocked){
        nd.innerHTML=`
          <div class="lnode-ico ${LEVEL_ICO[lv]}" style="opacity:.35">${m.icon}</div>
          <div class="lnode-body">
            <span class="lnode-name" style="opacity:.45">${m.name}</span>
            <span class="lnode-desc" style="opacity:.35">${m.desc}</span>
            <div class="lnode-meta"><span class="lmeta-tag lmeta-lk">🔒 Locked</span></div>
          </div>
          <div class="lnode-right"><span class="lnode-xp" style="opacity:.3">+${m.xp} XP</span></div>`;
        nd.addEventListener('click',()=>toast('🔒 Pass the Level '+(lv-1)+' quiz to unlock Level '+lv,'t-bad'));
      }else{
        nd.innerHTML=`
          <div class="lnode-ico ${LEVEL_ICO[lv]}">${m.icon}</div>
          <div class="lnode-body">
            <span class="lnode-name">${m.name}</span>
            <span class="lnode-desc">${m.desc}</span>
            <div class="lnode-meta"><span class="lmeta-tag ${done?'lmeta-done':'lmeta-open'}">${done?'✓ Complete':'Open'}</span></div>
          </div>
          <div class="lnode-right">
            <span class="lnode-xp">+${m.xp} XP</span>
            <span class="lnode-arrow">›</span>
          </div>`;
        nd.addEventListener('click',()=>openLesson(m.k));
      }
      nodesEl.appendChild(nd);
    });
  });
}

// ── LESSON MODAL ──────────────────────────────────────────────
function openLesson(k){
  const m=MODS.find(x=>x.k===k);if(!m)return;
  ST.curMod=k;
  document.getElementById('lm-ico').textContent=m.icon;
  document.getElementById('lm-bc').textContent='Level '+m.level+' · '+(m.level===1?'Foundations':m.level===2?'Combat':'Mastery');
  document.getElementById('lm-title').textContent=m.name;
  document.getElementById('lm-desc').textContent=m.desc;
  const done=ST.done.has(k);
  document.getElementById('lm-mark-btn').textContent=done?'✓ Already Learned':'✓ Mark as Learned (+'+m.xp+' XP)';
  document.getElementById('lm-mark-btn').disabled=done;
  document.getElementById('lm-mark-btn').className='btn '+(done?'':'btn-grn');

  // Build tabs and content
  const tabsEl=document.getElementById('lm-tabs');
  const bodyEl=document.getElementById('lm-body');
  tabsEl.innerHTML='';bodyEl.innerHTML='';

  if(m.type==='concepts'){
    addLMTab(tabsEl,bodyEl,'Learn','lm-learn',buildConceptsHTML(m.data),true);
    addLMTab(tabsEl,bodyEl,'Key Tips','lm-tips',buildTipsHTML(m),false);
  }else{
    addLMTab(tabsEl,bodyEl,'Rules','lm-rules',buildRulesHTML(m.data),true);
    addLMTab(tabsEl,bodyEl,'Summary','lm-sum',buildSummaryHTML(m),false);
  }
  // Practice tab — always add if we have exercises
  const pracExs=PRACTICE_DATA[k];
  if(pracExs&&pracExs.length){
    const done=ST.practiceDone.has(k);
    addLMTab(tabsEl,bodyEl,'⚡ Practice','lm-practice',buildPracticeHTML(k,pracExs[0],done),false);
    // Init board when tab is clicked
    tabsEl.querySelectorAll('.lm-tab').forEach((t,i)=>{
      if(t.textContent==='⚡ Practice'){
        t.addEventListener('click',()=>{
          // slight delay so DOM is visible
          setTimeout(()=>initPracticeBoard(k,pracExs[0]),80);
        });
      }
    });
  }

  document.getElementById('lesson-overlay').classList.add('show');
}

function addLMTab(tabsEl,bodyEl,name,id,html,active){
  const t=document.createElement('div');t.className='lm-tab '+(active?'on':'');t.textContent=name;
  t.addEventListener('click',()=>{
    tabsEl.querySelectorAll('.lm-tab').forEach(x=>x.classList.remove('on'));
    bodyEl.querySelectorAll('.lm-content').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');document.getElementById(id).classList.add('on');
  });
  tabsEl.appendChild(t);
  const c=document.createElement('div');c.className='lm-content '+(active?'on':'');c.id=id;c.innerHTML=html;
  bodyEl.appendChild(c);
}

function buildConceptsHTML(data){
  return `<div class="cg">${data.map(c=>`<div class="cc"><div class="cc-h"><span class="cc-ic">${c.i||''}</span><span class="cc-nm">${c.n}</span></div><div class="cc-tx">${c.t}</div></div>`).join('')}</div>`;
}
function buildRulesHTML(data){
  return `<div class="rl">${data.map(r=>`<div class="ri"><div class="rn">${r.n}</div><div class="rt"><strong>${r.s}</strong><span>${r.t}</span></div></div>`).join('')}</div>`;
}
function buildTipsHTML(m){
  return `<div class="tip-box"><h4>✅ Key Insight</h4><p>Understanding ${m.name.toLowerCase()} is one of the most important steps in your chess development. Study each concept until it becomes second nature.</p></div>
<div class="info-box" style="margin-top:10px"><h4>📖 Study Recommendation</h4><p>For deeper study of ${m.name.toLowerCase()}, see: <em>Chess Fundamentals</em> by Capablanca, <em>How to Reassess Your Chess</em> by Silman, and <em>My System</em> by Nimzowitsch.</p></div>`;
}
function buildSummaryHTML(m){
  return `<div class="rl"><div class="ri"><div class="rn">📌</div><div class="rt"><strong>Core Principle</strong><span>${m.desc}</span></div></div></div>
<div class="book-card" style="margin-top:10px"><div class="bc-ic">📚</div><div><div class="bc-title">Recommended Reading</div><div class="bc-body">For in-depth study: <em>My System</em> (Nimzowitsch), <em>Reassess Your Chess</em> (Silman), <em>Think Like a Grandmaster</em> (Kotov), <em>Complete Endgame Course</em> (Silman).</div></div></div>`;
}

// ── PRACTICE BOARD ───────────────────────────────────────────
let _prac: {st:any;sel:string|null;ex:any;modKey:string;solved:boolean}|null=null;

function buildPracticeHTML(modKey:string,ex:any,alreadyDone:boolean):string{
  const badge=alreadyDone?'<span style="color:var(--grnl);font-size:.75rem;font-weight:600">✓ Already solved</span>':'';
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0;width:100%">
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:700;color:var(--cream);text-align:center">${ex.title} ${badge}</div>
    <div style="font-size:.8rem;color:var(--mute);text-align:center;max-width:320px;line-height:1.5">${ex.desc}</div>
    <div style="width:100%;display:flex;justify-content:center;overflow:hidden">
      <div id="prac-board" style="border-radius:4px;overflow:hidden;box-shadow:0 0 0 3px var(--s4),0 0 0 4px var(--gold),0 8px 24px rgba(0,0,0,.6)"></div>
    </div>
    <div id="prac-fb" class="fb" style="width:100%;box-sizing:border-box;min-height:32px;text-align:center;padding:8px 14px;border-radius:8px;font-size:.82rem">👆 Click a piece, then its destination square.</div>
    <div style="display:flex;gap:10px">
      <button class="btn" onclick="pracHint()">💡 Hint</button>
      <button class="btn" onclick="pracReset()">↺ Reset</button>
    </div>
    <div id="prac-success" style="display:none;background:var(--grnl);color:#fff;border-radius:8px;padding:12px 20px;font-weight:700;text-align:center;width:100%;box-sizing:border-box">✓ Correct! +10 XP 🎉</div>
  </div>`;
}

function calcPracSz():number{
  // Modal width minus lm-body padding (24px each side = 48px)
  const modal=document.getElementById('lesson-modal');
  const mw=modal?modal.getBoundingClientRect().width:0;
  // Clamp to actual viewport so we never overflow on mobile
  const vw=window.innerWidth||360;
  const avail=Math.min(mw>60?mw:vw*0.96,680)-56;
  return Math.max(32,Math.min(52,Math.floor(avail/8)));
}

function initPracticeBoard(modKey:string,ex:any){
  _prac={st:mkState({...ex.board},ex.turn),sel:null,ex,modKey,solved:false};
  drawPrac([],null,calcPracSz());
}

function drawPrac(hints:string[]=[],showSel:string|null=null,sz=0){
  if(!_prac)return;
  const s=sz||calcPracSz();
  drawEvalBoard('prac-board',_prac.st,{sel:showSel||_prac.sel,hints,sz:s});
  wireEvalBoard('prac-board',onPracClick);
  addDragSupport('prac-board',onPracClick);
}

function onPracClick(s:string){
  if(!_prac||_prac.solved)return;
  const {st,ex}=_prac;
  if(!_prac.sel){
    if(st.board[s]&&st.board[s][0]===ex.turn){
      _prac.sel=s;
      const lm=legalMoves(st,ex.turn).filter((m:any)=>m.from===s).map((m:any)=>m.to);
      drawPrac(lm,s);
    }
    return;
  }
  // Already have selection — try move
  if(s===_prac.sel){_prac.sel=null;drawPrac();return;}
  const target=ex.solution[0]; // e.g. 'd2c4'
  const moveFrom=target.slice(0,2),moveTo=target.slice(2,4);
  const legal=legalMoves(st,ex.turn);
  const mv=legal.find((m:any)=>m.from===_prac!.sel&&m.to===s);
  if(!mv){
    // Clicked own piece — reselect
    if(st.board[s]&&st.board[s][0]===ex.turn){
      _prac.sel=s;
      const lm=legal.filter((m:any)=>m.from===s).map((m:any)=>m.to);
      drawPrac(lm,s);
      return;
    }
    _prac.sel=null;drawPrac();
    const fb=document.getElementById('prac-fb');if(fb){fb.className='fb finf';fb.textContent='✗ Illegal move — try again.';}
    return;
  }
  if(_prac.sel===moveFrom&&s===moveTo){
    // Correct!
    _prac.solved=true;_prac.sel=null;
    _prac.st=applyMove(st,mv);
    drawPrac();
    const fb=document.getElementById('prac-fb');if(fb){fb.className='fb fpos';fb.textContent='✓ Correct! Well played!';}
    const suc=document.getElementById('prac-success');if(suc)suc.style.display='block';
    confetti();
    if(!ST.practiceDone.has(ex.title+_prac.modKey)){
      ST.practiceDone.add(ex.title+_prac.modKey);
      addXP(10,'⚡ Practice solved! +10 XP');
    }
  }else{
    _prac.sel=null;drawPrac();
    const fb=document.getElementById('prac-fb');if(fb){fb.className='fb fneg';fb.textContent='✗ Not the best move — try again!';}
  }
}

function pracHint(){
  if(!_prac)return;
  const fb=document.getElementById('prac-fb');
  if(fb){fb.className='fb finf';fb.textContent='💡 '+_prac.ex.hint;}
  const moveFrom=_prac.ex.solution[0].slice(0,2);
  _prac.sel=moveFrom;
  const lm=legalMoves(_prac.st,_prac.ex.turn).filter((m:any)=>m.from===moveFrom).map((m:any)=>m.to);
  drawPrac(lm,moveFrom);
}

function pracReset(){
  if(!_prac)return;
  _prac.st=mkState({..._prac.ex.board},_prac.ex.turn);
  _prac.sel=null;_prac.solved=false;
  const fb=document.getElementById('prac-fb');if(fb){fb.className='fb';fb.textContent='👆 Click a piece, then its destination square.';}
  const suc=document.getElementById('prac-success');if(suc)suc.style.display='none';
  drawPrac();
}

function closeLesson(){document.getElementById('lesson-overlay').classList.remove('show');}
function markLessonDone(){
  if(!ST.curMod)return;
  const m=MODS.find(x=>x.k===ST.curMod);
  if(!ST.done.has(ST.curMod)){
    ST.done.add(ST.curMod);ST.streak++;
    addXP(m.xp,'✓ Lesson complete! +'+m.xp+' XP');
    document.getElementById('streak-num').textContent=ST.streak;
    const btn=document.getElementById('lm-mark-btn');
    btn.textContent='✓ Already Learned';btn.disabled=true;btn.className='btn';
  }
  setTimeout(closeLesson,600);
  renderLearnPath();
  updateHomeStats();
  // Refresh the "continue" card so it advances to the next lesson
  const nxt=MODS.find(m2=>!ST.done.has(m2.k))||MODS[MODS.length-1];
  const ccTitle=document.getElementById('cc-title');const ccDesc=document.getElementById('cc-desc');
  if(ccTitle)ccTitle.textContent=nxt.name;if(ccDesc)ccDesc.textContent=nxt.desc;
  const ccFill=document.getElementById('cc-fill');const pct2=Math.round(ST.done.size/MODS.length*100);
  if(ccFill)ccFill.style.width=pct2+'%';
  const ccPct=document.getElementById('cc-pct');if(ccPct)ccPct.textContent=pct2+'% complete';
  const cc2=document.getElementById('continue-card');if(cc2)cc2.onclick=()=>openLesson(nxt.k);
  saveProgress(); // auto-save on lesson completion
}

// ── OPENING BOARD ─────────────────────────────────────────────
function renderBoard(){
  const op=OPS[ST.curOp],vr=op&&op.vars[ST.curVar];if(!vr)return;
  const mvs=vr.moves,cm=ST.step<mvs.length?mvs[ST.step]:null;
  // Map opening-lab state to drawEvalBoard params so all boards share identical rendering
  const sel=ST.hint&&cm?cm.f:(ST.sel||null);
  const hints:string[]=cm&&(ST.hint||(ST.sel&&ST.sel===cm.f))?[cm.t]:[];
  drawEvalBoard('board',ST.board,{sel,hints});
  wireEvalBoard('board',onSq);
  addDragSupport('board',onSq);
}

function onSq(sq){
  const op=OPS[ST.curOp],vr=op&&op.vars[ST.curVar];
  if(!vr)return;
  const mvs=vr.moves;
  if(ST.step>=mvs.length)return;
  const cm=mvs[ST.step];
  if(!ST.sel){
    if(ST.board[sq]&&ST.board[sq][0]===cm.s){ST.sel=sq;ST.hint=false;renderBoard();}
    else if(ST.board[sq]){setFB('fb-err',"It's "+(cm.s==='w'?'White':'Black')+"'s turn!");}
    return;
  }
  if(sq===ST.sel){ST.sel=null;renderBoard();return;}
  if(sq===cm.t&&ST.sel===cm.f){
    ST.board[sq]=ST.board[ST.sel];delete ST.board[ST.sel];
    const _mp=ST.board[sq];
    if(_mp==='wK'&&ST.sel==='e1'){if(sq==='g1'){ST.board['f1']=ST.board['h1'];delete ST.board['h1'];}else if(sq==='c1'){ST.board['d1']=ST.board['a1'];delete ST.board['a1'];}}
    if(_mp==='bK'&&ST.sel==='e8'){if(sq==='g8'){ST.board['f8']=ST.board['h8'];delete ST.board['h8'];}else if(sq==='c8'){ST.board['d8']=ST.board['a8'];delete ST.board['a8'];}}
    ST.sel=null;ST.hint=false;
    setFB('fb-ok','<strong>✓ Correct!</strong> '+(cm.c||''));
    toast('✓ Correct!','t-ok');
    ST.step++;updateSeq();updateProg();
    const vkey=ST.curOp+'_'+ST.curVar;
    if(ST.step>=mvs.length){
      if(!ST.varsDone[vkey]){ST.varsDone[vkey]=true;addXP(30,'🏁 Variation mastered! +30 XP');}
      setFB('fb-gld','🏆 <strong>Variation complete!</strong> All moves learned. Try the next variation!');
      checkOpComplete();
    } else {
      // Brief pause showing ✓, then show next move instruction
      setTimeout(showMoveInstruction, 900);
    }
    renderBoard();
  }else{
    setFB('fb-err','❌ <strong>Wrong move.</strong> '+(cm.c||'')+' — play <strong>'+cm.l+'</strong>');
    toast('✗ Wrong — try again','t-bad');
    const b=document.getElementById('board');b.style.animation='none';b.offsetHeight;b.style.animation='shake .3s ease';
    ST.sel=null;renderBoard();
  }
}

function setFB(idOrCls: string, clsOrMsg: string, msg?: string) {
  if (msg !== undefined) {
    const el = document.getElementById(idOrCls); if(!el) return;
    el.className = 'fb ' + clsOrMsg; el.innerHTML = msg;
  } else {
    const el = document.getElementById('fb-box'); if(!el) return;
    el.className = 'fb-box ' + idOrCls; el.innerHTML = clsOrMsg;
  }
}
function setEvalFB(id: string, cls: string, msg: string){const el=document.getElementById(id);if(el){el.className='fb '+cls;el.innerHTML=msg;}}
function updateSeq(){
  const mvs=OPS[ST.curOp].vars[ST.curVar].moves,el=document.getElementById('seq-pills');el.innerHTML='';
  mvs.forEach((m,i)=>{const p=document.createElement('span');p.className='spill'+(i<ST.step?' sd':(i===ST.step?' sc':''));p.textContent=m.l;el.appendChild(p);});
}
function updateProg(){
  const mvs=OPS[ST.curOp].vars[ST.curVar].moves,pct=(ST.step/mvs.length)*100;
  document.getElementById('pb-fill').style.width=pct+'%';
  document.getElementById('pb-pct').textContent=ST.step+' / '+mvs.length+' moves';
}
function checkOpComplete(){
  const op=OPS[ST.curOp];
  const all=Object.keys(op.vars).every(vk=>ST.varsDone[ST.curOp+'_'+vk]);
  if(all&&!ST.opsDone.has(ST.curOp)){
    ST.opsDone.add(ST.curOp);addXP(50,'🏆 Opening mastered! +50 XP');confetti();
    document.getElementById('op-complete').classList.add('show');
    renderOpList();
  }
}

function loadVar(opk,vk,fromUser=false){
  ST.curOp=opk;ST.curVar=vk;ST.board=pos0();ST.step=0;ST.sel=null;ST.hint=false;
  // Show the board panel (hide card grid)
  const _panel=document.getElementById('op-board-panel');
  const _grid=document.getElementById('op-grid');
  const _catTitles=document.querySelectorAll('.op-cat-title');
  const _sh=document.querySelector('#view-openings .section-head');
  if(_panel)_panel.style.display='block';
  if(_grid)_grid.style.display='none';
  _catTitles.forEach(x=>x.style.display='none');
  if(_sh)_sh.style.display='none';
  const op=OPS[opk],vr=op.vars[vk];
  document.getElementById('op-h2').textContent=op.n;
  document.getElementById('op-p').textContent='Practice this opening — play each move in order.';
  document.getElementById('iz-vname').textContent=vr.name||'';
  document.getElementById('iz-vdesc').textContent=vr.desc||'';
  // Show variation name + desc above board
  const _ovd=document.getElementById('op-var-desc');
  if(_ovd){
    _ovd.innerHTML=`<span class="ovd-name">${vr.name||''}</span><span class="ovd-sep">·</span><span class="ovd-desc">${vr.desc||''}</span><button class="btn ovd-btn" onclick="document.querySelector('.info-zone')?.scrollIntoView({behavior:'smooth',block:'nearest'})">📖 Theory</button>`;
    _ovd.style.display='flex';
  }
  document.getElementById('op-complete').classList.remove('show');
  showMoveInstruction(); // show current move instruction proactively
  renderVarTabs();updateSeq();updateProg();updateOpTips();
  // Render board after panel is visible and laid out
  requestAnimationFrame(()=>requestAnimationFrame(renderBoard));
  document.querySelectorAll('.op-card').forEach(c=>c.classList.toggle('on',c.dataset.opk===opk));
}

function renderOpList(){
  // Renamed renderOpList but kept for compatibility — calls renderOpGrid
  renderOpGrid();
}

const OP_THEORY:{[k:string]:{suited:string,why:string}}={
  qgd:{suited:'All levels',why:'Controls the centre with d4+c4, forcing Black into strategic decisions from move 2. White aims for long-term space and queenside play.'},
  london:{suited:'Beginners & positional players',why:'The London triangle (d4+Bf4+e3) is rock-solid. Play the same structure against anything Black does — learn one plan and use it forever.'},
  italian:{suited:'Beginners & attacking players',why:'Open games develop fast and the Italian bishop eyes the f7 weakness from move 3. Leads to rich tactical battles.'},
  ruy:{suited:'Intermediate & advanced',why:'Most analysed opening in history. Pins the c6 knight to put indirect pressure on e5. Long-term positional superiority for White — Kasparov\'s weapon.'},
  kid:{suited:'Tactical & dynamic players',why:'Black allows White a big centre, then counterattacks violently with …e5. Fischer and Kasparov\'s signature weapon. Enormous counterplay.'},
  sicilian:{suited:'Aggressive & ambitious players',why:'The most played response to 1.e4 at all levels. Fights for the centre unsymmetrically — leads to the sharpest positions in chess.'},
  french:{suited:'Positional & solid players',why:'Black cedes the centre temporarily and builds a rock-solid structure. Reliable and consistent — used by Korchnoi and Bareev for decades.'},
  caro:{suited:'Solid & positional players',why:'Most solid reply to 1.e4. No structural weaknesses, low theoretical load. Gets the dark bishop out (unlike the French) before closing the position.'},
  scandinavian:{suited:'Club players & simplification seekers',why:'1…d5 immediately contests the centre. After 2.exd5 Qxd5 Black is well-coordinated. Practical and easy to learn for club level.'},
  pirc:{suited:'Hypermodern & counterattacking players',why:'Black allows the big centre and attacks it from the flanks with the g7 bishop. Unorthodox but very hard to refute at club level.'},
  dutch:{suited:'Aggressive & unbalancing players',why:'1…f5 grabs e4 and signals kingside attack immediately. Extremely imbalanced — Black is playing for a win, not a draw.'},
};

function renderOpGrid(){
  const el=document.getElementById('op-grid');if(!el)return;el.innerHTML='';
  const xp=ST.xp||0;
  const _opGate={'qgd':0,'london':0,'italian':0,'ruy':120,'kid':120,'sicilian':120,
    'french':380,'caro':380,'scandinavian':380,'pirc':380,'dutch':380};
  const _diff={'qgd':'beginner','london':'beginner','italian':'beginner',
    'ruy':'intermediate','kid':'intermediate','sicilian':'intermediate',
    'french':'beginner','caro':'beginner','scandinavian':'beginner',
    'pirc':'intermediate','dutch':'intermediate'};
  const _eco={'qgd':'D06–D69','london':'D02–D10','italian':'C50–C59','ruy':'C60–C99',
    'kid':'E60–E99','sicilian':'B20–B99','french':'C00–C19','caro':'B10–B19',
    'scandinavian':'B01','pirc':'B07–B09','dutch':'A80–A99'};

  const cats=[
    {label:'White Openings',keys:['qgd','london','italian','ruy']},
    {label:'Black Openings',keys:['kid','sicilian','french','caro','scandinavian','pirc','dutch']}
  ];

  cats.forEach(cat=>{
    // Category title
    const title=document.createElement('div');
    title.className='op-cat-title';title.textContent=cat.label;el.appendChild(title);

    cat.keys.forEach(k=>{
      const op=OPS[k];if(!op)return;
      const req=_opGate[k]||0;
      const unlocked=xp>=req;
      const done=ST.opsDone&&ST.opsDone.has(k);
      const diff=_diff[k]||'beginner';
      const th=OP_THEORY[k];

      const c=document.createElement('div');
      c.className='op-card2'+(done?' op-done':'')+(unlocked?'':' op-locked2');

      if(!unlocked){
        c.innerHTML=
          '<div class="op2-name" style="color:var(--mute)">'+op.n+'</div>'+
          '<div class="op2-eco">ECO '+(_eco[k]||'–')+'</div>'+
          '<span class="op2-badge tag-'+diff+'">🔒 Unlocks at '+req+' XP</span>';
        c.addEventListener('click',()=>toast('🔒 Reach '+req+' XP to unlock '+op.n,'t-bad'));
      } else {
        c.innerHTML=
          '<div class="op2-name">'+op.n+'</div>'+
          '<div class="op2-eco">ECO '+(_eco[k]||'–')+'</div>'+
          '<span class="op2-badge tag-'+diff+'">'+diff+'</span>'+
          (th?'<div class="op2-theory"><span class="op2-suited">Suited for: '+th.suited+'</span><p class="op2-why">'+th.why+'</p></div>':'')+
          (done?'<div class="op2-done">✅ Mastered</div>':'');
        c.addEventListener('click',()=>{
          const firstVar=Object.keys(op.vars)[0];
          loadVar(k,firstVar,true);
        });
      }
      el.appendChild(c);
    });
  });
}

function renderVarTabs(){
  const op=OPS[ST.curOp],el=document.getElementById('var-tabs');el.innerHTML='';
  Object.entries(op.vars).forEach(([vk,vr])=>{
    const done=ST.varsDone[ST.curOp+'_'+vk];
    const t=document.createElement('div');t.className='vtab'+(vk===ST.curVar?' on':'')+(done?' done-v':'');
    t.textContent=(vr.name||'Variation')+(done?' ✓':'');
    t.addEventListener('click',()=>loadVar(ST.curOp,vk));el.appendChild(t);
  });
}

function updateOpTips(){
  const d=OPTIPS[ST.curOp]||{ideas:'Learn the moves, then the strategic ideas.',mistakes:'Avoid moving pieces twice in the opening.',book:'Study the classics for opening understanding.'};
  if(!d.ideas||!d.mistakes||!d.book)return;
  document.getElementById('it-ideas').innerHTML='<p>'+(d.ideas||'—')+'</p>';
  document.getElementById('it-mistakes').innerHTML='<p>⚠️ '+(d.mistakes||'—')+'</p>';
  document.getElementById('it-book').innerHTML='<p>📚 '+(d.book||'—')+'</p>';
}

document.querySelectorAll('.iz-tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.iz-tab').forEach(x=>x.classList.remove('on'));
    document.querySelectorAll('.iz-panel').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');const p=document.getElementById('it-'+t.dataset.it);if(p)p.classList.add('on');
  });
});
document.getElementById('b-hint').addEventListener('click',()=>{
  const op=OPS[ST.curOp],vr=op&&op.vars[ST.curVar];
  if(!vr||ST.step>=vr.moves.length)return;
  const m=vr.moves[ST.step];
  ST.hint=true;ST.sel=null;
  setFB('fb-inf','💡 <b>Hint:</b> Play <strong>'+(m.l||m.f+'→'+m.t)+'</strong>'+(m.c?' — '+m.c:''));
  renderBoard();
});
document.getElementById('b-reset').addEventListener('click',()=>loadVar(ST.curOp,ST.curVar));
document.getElementById('b-nextv').addEventListener('click',()=>{
  const op=OPS[ST.curOp],vks=Object.keys(op.vars),idx=vks.indexOf(ST.curVar);
  loadVar(ST.curOp,vks[(idx+1)%vks.length]);
});

// ── TACTICS ───────────────────────────────────────────────────
function renderTactics(){
  const el=document.getElementById('tact-grid');if(!el)return;el.innerHTML='';
  const xp=ST.xp||0;
  const xpFor={fork:0,pin:0,hanging:0,skewer:120,discovered:120,dblcheck:380};
  if(!ST.tacticsLearned)ST.tacticsLearned={};
  TACTS.forEach(t=>{
    const req=xpFor[t.id]||0;
    const unlocked=xp>=req;
    const learned=!!ST.tacticsLearned[t.id];
    const c=document.createElement('div');
    c.className='tact-card'+(learned?' tact-done':'');
    if(!unlocked){
      c.style.cssText='opacity:0.45;cursor:not-allowed';
      c.innerHTML='<span class="tc-icon" style="opacity:.35">'+t.icon+'</span>'+
        '<div class="tc-name" style="color:var(--mute)">'+t.nm+'</div>'+
        '<div class="tc-desc" style="color:var(--mute)">Unlocks at '+req+' XP</div>'+
        '<span class="tc-badge" style="background:var(--s4);color:var(--mute)">' + LOCK + ' Locked</span>';
      c.addEventListener('click',()=>toast('Reach '+req+' XP to unlock','t-bad'));
    }else{
      const badge=learned?
        '<span class="tc-badge" style="background:var(--grn);color:#fff">✓ Learned</span>':
        '<span class="tc-badge">Click to learn</span>';
      c.innerHTML='<span class="tc-icon">'+t.icon+'</span>'+
        '<div class="tc-name">'+t.nm+'</div>'+
        '<div class="tc-desc">'+t.ds+'</div>'+badge;
      c.addEventListener('click',()=>showTactic(t.id,c));
    }
    el.appendChild(c);
  });
}
function showTactic(id,card){
  document.querySelectorAll('.tact-card').forEach(c=>c.classList.remove('on'));
  card.classList.add('on');
  const t=TACTS.find(x=>x.id===id);if(!t)return;
  if(!ST.tacticsLearned)ST.tacticsLearned={};
  const _lrnd=!!ST.tacticsLearned[id];
  const _pb='<button class="btn btn-gold" onclick="startTacticPractice(\''+id+'\')">♯ Practice on Board</button>';
  const _lb=_lrnd?'<span style="color:var(--grnl);font-size:.8rem;padding:6px">✓ Learned</span>':'<button class="btn btn-grn" onclick="markTacticLearned(\''+id+'\')">✓ Mark as Learned (+20 XP)</button>';
  const _row='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'+_pb+_lb+'</div>';
  const det=document.getElementById('tact-detail');det.style.display='block';
  det.innerHTML=_row+`<div class="tact-detail"><div class="td-header"><div class="td-icon">${t.icon}</div><div><div class="td-title">${t.nm}</div><div class="td-sub">${t.ds}</div></div></div><div class="td-tabs"><div class="td-tab on" data-tt="tl">Learn the Pattern</div><div class="td-tab" data-tt="te">Examples & Usage</div></div><div class="td-body"><div class="td-content on" id="td-tl">${t.learn}</div><div class="td-content" id="td-te">${t.example}</div></div></div>`;
  det.querySelectorAll('.td-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      det.querySelectorAll('.td-tab').forEach(x=>x.classList.remove('on'));
      det.querySelectorAll('.td-content').forEach(x=>x.classList.remove('on'));
      tab.classList.add('on');const c=det.querySelector('#td-'+tab.dataset.tt);if(c)c.classList.add('on');
    });
  });
  det.scrollIntoView({behavior:'smooth',block:'nearest'});
}

// ── ENDGAMES ──────────────────────────────────────────────────
function renderEndgames(){
  const el=document.getElementById('eg-grid');if(!el)return;el.innerHTML='';
  const xp=ST.xp||0;
  const xpFor={must:0,imp:120,adv:380};
  const tagClass={must:'must-tag',imp:'imp-tag',adv:'adv-tag'};
  const tagText={must:'MUST KNOW',imp:'IMPORTANT',adv:'ADVANCED'};
  if(!ST.endgamesLearned)ST.endgamesLearned={};
  ENDGAMES.forEach(e=>{
    const req=xpFor[e.tag]||0;
    const unlocked=xp>=req;
    const learned=!!ST.endgamesLearned[e.id];
    const c=document.createElement('div');
    c.className='eg-card'+(learned?' eg-done':'');
    if(!unlocked){
      c.style.cssText='opacity:0.45;cursor:not-allowed';
      c.innerHTML='<div class="eg-type">'+e.type+'</div>'+
        '<div class="eg-title" style="color:var(--mute)">'+e.title+'</div>'+
        '<div class="eg-desc" style="font-size:.68rem;color:var(--mute)">Unlocks at '+req+' XP</div>'+
        '<span class="eg-must '+tagClass[e.tag]+'" style="opacity:.5">'+tagText[e.tag]+' ' + LOCK + '</span>';
      c.addEventListener('click',()=>toast('Reach '+req+' XP to unlock','t-bad'));
    }else{
      c.innerHTML='<div class="eg-type">'+e.type+'</div>'+
        '<div class="eg-title">'+e.title+'</div>'+
        '<div class="eg-desc">'+e.learn.replace(/<[^>]+>/g,'').substring(0,90)+'...</div>'+
        '<span class="eg-must '+tagClass[e.tag]+'">'+tagText[e.tag]+'</span>'+
        (learned?'<div class="eg-done-badge">✅ Learned +25 XP</div>':'');
      c.addEventListener('click',()=>showEndgame(e.id,c));
    }
    el.appendChild(c);
  });
}
function showEndgame(id,card){
  document.querySelectorAll('.eg-card').forEach(c=>c.classList.remove('on'));
  card.classList.add('on');
  const e=ENDGAMES.find(x=>x.id===id);if(!e)return;
  const det=document.getElementById('eg-detail');det.style.display='block';
  if(!ST.endgamesLearned)ST.endgamesLearned={};
  const _d=typeof EG_DRILLS!=='undefined'&&EG_DRILLS.find(d=>d.id===e.id);
  const _l=!!ST.endgamesLearned[e.id];
  const _pb=_d?'<button class="btn btn-gold" style="margin:0 0 10px" onclick="loadDrill(\''+_d.id+'\')">♯ Practice</button>':'';
  const _lb=_l?'<span style="color:var(--grnl)">✓ Learned</span>':'<button class="btn btn-grn" style="margin:0 0 10px" onclick="markEndgameLearned(\''+e.id+'\')">✓ Mark Learned (+25 XP)</button>';
  const _btns='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">'+_pb+_lb+'</div>';
  det.innerHTML=_btns+`<div class="eg-detail"><div class="ed-header"><div class="ed-label">${e.type}</div><div class="ed-title">${e.title}</div></div><div class="ed-tabs"><div class="ed-tab on" data-et="el">Method</div><div class="ed-tab" data-et="ek">Key Positions</div><div class="ed-tab" data-et="em">Mistakes to Avoid</div></div><div class="ed-body"><div class="ed-content on" id="ed-el">${e.learn}</div><div class="ed-content" id="ed-ek">${e.key}</div><div class="ed-content" id="ed-em">${e.mistakes}</div></div></div>`;
  det.querySelectorAll('.ed-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      det.querySelectorAll('.ed-tab').forEach(x=>x.classList.remove('on'));
      det.querySelectorAll('.ed-content').forEach(x=>x.classList.remove('on'));
      tab.classList.add('on');const c=det.querySelector('#ed-'+tab.dataset.et);if(c)c.classList.add('on');
    });
  });
  det.scrollIntoView({behavior:'smooth',block:'nearest'});
}

// ── QUIZ ──────────────────────────────────────────────────────
function startQuiz(lv){
  ST.qlv=lv;ST.qstep=0;ST.qans=[];
  document.getElementById('result-card').classList.remove('show');
  document.getElementById('quiz-card').style.display='block';
  document.getElementById('qc-title').textContent='Level '+lv+': '+(lv===1?'Foundations':lv===2?'Combat':'Mastery');
  document.querySelectorAll('.qlv-btn').forEach(b=>b.classList.toggle('on',parseInt(b.dataset.ql)===lv));
  renderQ();
}
function renderQ(){
  const qs=QS[ST.qlv],q=qs[ST.qstep];
  document.getElementById('q-num').textContent='Question '+(ST.qstep+1)+' of '+qs.length;
  document.getElementById('q-question').textContent=q.q;
  document.getElementById('qcp-fill').style.width=(ST.qstep/qs.length*100)+'%';
  document.getElementById('qc-score').textContent=ST.qans.filter(a=>a===true).length+' correct';
  const opts=document.getElementById('q-opts');opts.innerHTML='';
  const letters=['A','B','C','D'];
  q.os.forEach((o,i)=>{
    const d=document.createElement('div');d.className='q-opt';
    d.innerHTML=`<span class="q-opt-letter">${letters[i]}</span>${o}`;
    d.addEventListener('click',()=>ansQ(i));opts.appendChild(d);
  });
  document.getElementById('q-explain').className='q-explain';
  document.getElementById('q-explain').textContent='';
  document.getElementById('b-nextq').style.display='none';
  const dots=document.getElementById('q-dots');dots.innerHTML='';
  qs.forEach((_,i)=>{
    const d=document.createElement('div');const a=ST.qans[i];
    d.className='qdot'+(i===ST.qstep?' cur':(a===true?' ok':(a===false?' bad':'')));
    dots.appendChild(d);
  });
}
function ansQ(ch){
  const q=QS[ST.qlv][ST.qstep],ok=ch===q.a;
  ST.qans[ST.qstep]=ok;ST.totalQ++;if(ok)ST.totalCorrect++;
  document.querySelectorAll('.q-opt').forEach((o,i)=>{
    o.classList.add('dis');
    if(i===q.a)o.classList.add('cor');
    else if(i===ch&&!ok)o.classList.add('wrg');
  });
  const ex=document.getElementById('q-explain');ex.textContent=q.e;ex.classList.add('show');
  if(ok){addXP(10);toast('✓ Correct! +10 XP','t-ok');}else{toast('✗ Incorrect','t-bad');}
  const nb=document.getElementById('b-nextq');nb.style.display='inline-block';
  const qs=QS[ST.qlv];
  if(ST.qstep<qs.length-1){nb.textContent='Next Question →';nb.onclick=()=>{ST.qstep++;renderQ()};}
  else{nb.textContent='See Results →';nb.onclick=()=>showResults();}
  // redraw dots
  const dots=document.getElementById('q-dots');dots.innerHTML='';
  qs.forEach((_,i)=>{const d=document.createElement('div');const a=ST.qans[i];d.className='qdot'+(i===ST.qstep?' cur':(a===true?' ok':(a===false?' bad':'')));dots.appendChild(d);});
}
function showResults(){
  const qs=QS[ST.qlv],sc=ST.qans.filter(a=>a===true).length,pass=sc>=Math.ceil(qs.length*.7);
  document.getElementById('quiz-card').style.display='none';
  const rc=document.getElementById('result-card');rc.classList.add('show');
  document.getElementById('r-stars').textContent=sc>=qs.length?'⭐⭐⭐':sc>=Math.ceil(qs.length*.8)?'⭐⭐':'⭐';
  document.getElementById('r-score').textContent=sc+'/'+qs.length;
  document.getElementById('r-title').textContent=pass?'Level '+ST.qlv+' Passed! 🎉':'Keep Practicing!';
  document.getElementById('r-msg').textContent=pass?`You scored ${sc}/${qs.length}! ${ST.qlv<3?'Level '+(ST.qlv+1)+' is now unlocked!':'You have mastered all three levels! You\'re no longer a beginner. 🏆'}`:`You scored ${sc}/${qs.length}. You need ${Math.ceil(qs.length*.7)} correct to pass. Review the lessons and try again — you\'ve got this!`;
  if(pass){
    ST.qzRes[ST.qlv]=true;addXP(100,'🎓 Level '+ST.qlv+' passed! +100 XP');
    if(sc>=qs.length)confetti();
    const ub=document.getElementById('b-unlock');
    ub.style.display=ST.qlv<3?'inline-block':'none';
    ub.onclick=()=>{document.getElementById('result-card').classList.remove('show');document.getElementById('quiz-card').style.display='block';startQuiz(ST.qlv+1);};
  }else{
    document.getElementById('b-unlock').style.display='none';
  }
}

// ── NAV WIRING ────────────────────────────────────────────────
// Use (window as any).switchView at click time to pick up the wrapped version (which builds new view content)
document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>{const sv=(window as any).switchView||switchView;sv(n.dataset.v);}));
document.querySelectorAll('[data-ql]').forEach(b=>b.addEventListener('click',()=>startQuiz(parseInt(b.dataset.ql))));
document.querySelectorAll('.qlv-btn').forEach(b=>b.addEventListener('click',()=>startQuiz(parseInt(b.dataset.ql))));
document.getElementById('lesson-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeLesson();});
// Belt-and-suspenders: wire modal buttons via addEventListener as well as onclick attribute
document.getElementById('lm-mark-btn')?.addEventListener('click',markLessonDone);
document.querySelector('#lesson-modal .btn:not(#lm-mark-btn)')?.addEventListener('click',closeLesson);
document.querySelector('.lm-close')?.addEventListener('click',closeLesson);

function updateHomeStats(){
  document.getElementById('stat-xp').textContent=ST.xp;
  document.getElementById('stat-lessons').textContent=ST.done.size+'/'+MODS.length;
  document.getElementById('stat-openings').textContent=ST.opsDone.size;
  document.getElementById('stat-correct').textContent=ST.totalQ>0?Math.round(ST.totalCorrect/ST.totalQ*100)+'%':'—';
}


// ══════════════════════════════════════════════════════════════
// SKILL LEVEL SYSTEM
// ══════════════════════════════════════════════════════════════
const SKILL_DATA = {
  absolute: {
    name: 'Complete Beginner',
    range: '0 – 300',
    icon: '🐣',
    badgeClass: 'sk-absolute',
    color: '#80a8e8',
    greeting: "Welcome! Let\'s start from zero.",
    tagline: "You\'re in the right place. Every grandmaster started exactly where you are.",
    priorities: ['setup','pieces','stalemate','blundercheck','middle_200'],
    pathMessage: "Start with Board Setup, then Piece Movement. Don\'t skip these — they\'re the foundation of everything.",
    dailyHabits: ['Learn 1 new concept daily','Do 10 puzzles (mate in 1)','Play 1 slow game (15+ min)','Review: what went wrong?'],
    studyPlan: [
      {week:'Week 1-2', task:'Board Setup + Piece Movement + Special Moves. Play only against a computer on easy mode.'},
      {week:'Week 3-4', task:'Opening Principles + Stalemate rules. Start doing daily puzzles (mate in 1).'},
      {week:'Week 5-8', task:'Basic Tactics: fork, pin, hanging pieces. This is your #1 priority now.'},
      {week:'Week 9-12', task:'Basic Checkmates: ladder mate, K+Q vs K. Play 15-min rapid games online.'},
      {week:'Month 4+', task:'Blunder prevention habit. You should reach 400-600 ELO with consistent practice.'}
    ],
    focusModules: ['setup','pieces','values','stalemate','blundercheck','middle_200','opprinciples','tactics_m','mates'],
    quizLevel: 1,
    boardMessage: "🎯 Focus: Learn how pieces move first. Don\'t worry about openings yet."
  },
  beginner: {
    name: 'Beginner',
    range: '300 – 600',
    icon: '🌱',
    badgeClass: 'sk-beginner',
    color: '#52cc88',
    greeting: "You know the rules. Now let\'s build real skills.",
    tagline: "Most games at your level are decided by simple blunders and missed tactics. Fix that first.",
    priorities: ['blundercheck','middle_200','tactics_m','mates','opprinciples'],
    pathMessage: "Your #1 priority: stop leaving pieces where they can be taken. Do 20 puzzles daily — no exceptions.",
    dailyHabits: ['20 puzzles daily (non-negotiable)','1 rapid game (15+10 min)','After each loss: find the blunder','Study 1 concept per week'],
    studyPlan: [
      {week:'Month 1', task:'Blunder prevention + Tactics (fork, pin, skewer). 20 puzzles every day.'},
      {week:'Month 2', task:'Basic checkmates: K+Q vs K, K+R vs K, ladder mate. Learn 1 opening (London or Italian).'},
      {week:'Month 3', task:'Opening principles deeply. Middlegame basics: the 4 questions. King safety.'},
      {week:'Month 4', task:'Pawn structure basics. Converting won positions. You should be 600-800 ELO now.'},
      {week:'Month 5+', task:'Tactics daily + start studying endgames. Analyse every loss with an engine.'}
    ],
    focusModules: ['blundercheck','middle_200','tactics_m','mates','opprinciples','kingsafe','middle_basics','coordination'],
    quizLevel: 1,
    boardMessage: "🎯 Focus: Tactics and blunder prevention. This is what wins games at 300-600."
  },
  improving: {
    name: 'Improving Player',
    range: '600 – 1000',
    icon: '📈',
    badgeClass: 'sk-improving',
    color: '#c8a95a',
    greeting: "You\'re past the basics. Time to think like a chess player.",
    tagline: "At 600-1000, games are decided by tactical patterns you don\'t see yet and endgames you can\'t convert.",
    priorities: ['tactics_m','middle_basics','middle_threats','endgames_m','kingsafe'],
    pathMessage: "Master all 6 tactics patterns, then work through the middlegame modules. Endgame basics next.",
    dailyHabits: ['30 tactics puzzles daily','1 slow game + full analysis','1 endgame drill per week','Study 1 master game/week'],
    studyPlan: [
      {week:'Month 1', task:'All 6 tactics patterns cold. Middlegame: the basics + threats & forcing moves.'},
      {week:'Month 2', task:'Endgame: K+Q, K+R, K+P endings. Lucena + Philidor. Play rapid games.'},
      {week:'Month 3', task:'Middlegame: planning, attacking the king. Pawn structure fundamentals.'},
      {week:'Month 4', task:'Opening repertoire: 1 white system, 1 black system. Know 8-10 moves.'},
      {week:'Month 5+', task:'Piece coordination, calculation methods. Aim for 1000-1200 ELO.'}
    ],
    focusModules: ['tactics_m','mates','middle_basics','middle_threats','middle_planning','middle_attack','middle_defense','mid_position','endgames_m','kingsafe','pawns'],
    quizLevel: 2,
    boardMessage: "🎯 Focus: Tactics patterns + basic endgames. The gaps that keep you under 1000."
  },
  intermediate: {
    name: 'Intermediate',
    range: '1000 – 1400',
    icon: '⚔️',
    badgeClass: 'sk-intermediate',
    color: '#e86060',
    greeting: "You know the game. Now learn to think deeper.",
    tagline: "At 1000-1400, the gap is positional understanding, calculation depth, and endgame technique.",
    priorities: ['middle_planning','middle_attack','middle_defense','planning','endgames_m'],
    pathMessage: "The middlegame planning modules + endgames are your core focus. Deepen your calculation.",
    dailyHabits: ['40 puzzles daily (tactic + positional)','Analyse every game (wins too!)','Study 1 annotated master game/week','1 endgame technique drill/week'],
    studyPlan: [
      {week:'Month 1', task:'All 5 middlegame modules deeply. Silman\'s imbalance method. Make plans in every game.'},
      {week:'Month 2', task:'Advanced endgames: Lucena, Philidor, rook endings. Opposite-colour bishops.'},
      {week:'Month 3', task:'Pawn structure mastery: IQP, passed pawns, majority. Coordination deep dive.'},
      {week:'Month 4', task:'Deeper opening preparation: know 12-15 moves in your main lines with ideas.'},
      {week:'Month 5+', task:'Calculation training: Kotov\'s method. Prophylaxis. Aim for 1400-1600.'}
    ],
    focusModules: ['middle_basics','middle_threats','middle_planning','middle_attack','middle_defense','mid_position','mid_strategy','mid_calculation','planning','endgames_m','advanced_endings','pawns','calc'],
    quizLevel: 2,
    boardMessage: "🎯 Focus: Middlegame planning + endgame technique. These decide your games now."
  },
  advanced: {
    name: 'Advanced Beginner',
    range: '1400 – 1600+',
    icon: '🏆',
    badgeClass: 'sk-advanced',
    color: '#b090e0',
    greeting: "You\'re a real chess player. Let\'s get you to master level.",
    tagline: "At 1400+, consistency and depth of understanding separate you from the next level.",
    priorities: ['planning','advanced_endings','advanced_mates','calc','psychology'],
    pathMessage: "Deep calculation, advanced endgames, and mental consistency are your focus areas.",
    dailyHabits: ['60 puzzles (mixed difficulty)','Analyse 2+ games per week deeply','1 full annotated game study/week','Specific endgame technique drilling'],
    studyPlan: [
      {week:'Month 1', task:'Advanced endgames: all rook endings, minor piece endings, pawn races. Drill them.'},
      {week:'Month 2', task:'Calculation depth: Kotov\'s system. Candidate moves in complex positions.'},
      {week:'Month 3', task:'Advanced mating techniques, mating nets, complex sacrificial attacks.'},
      {week:'Month 4', task:'Opening repertoire depth: know plans and middlegames after each line.'},
      {week:'Month 5+', task:'Psychology, clock management, tournament preparation. Breaking 1600.'}
    ],
    focusModules: ['mid_calculation','mid_advanced','mid_strategy','planning','advanced_endings','advanced_mates','calc','psychology','notation_games','middle_defense','middle_attack'],
    quizLevel: 3,
    boardMessage: "🎯 Focus: Advanced endgames + deep calculation. The final frontier before expert level."
  }
};

let selectedSkill = null;

function selectSkill(el) {
  document.querySelectorAll('.ob-level').forEach(x => x.classList.remove('selected'));
  el.classList.add('selected');
  selectedSkill = el.dataset.skill;
  const btn = document.getElementById('ob-start-btn');
  btn.classList.add('ready');
  btn.textContent = '🎩 The Hat Has Spoken — Begin!';
  // Show Sorting Hat speech
  const speech = document.getElementById('hat-speech');
  if(speech && el.dataset.hat) speech.textContent = el.dataset.hat;
}

function startWithSkill(mode) {
  // If called with a saved skill level, restore it; only default to absolute when no skill known
  if (mode && mode !== 'skip' && SKILL_DATA[mode]) selectedSkill = mode;
  if (!selectedSkill) selectedSkill = 'absolute';
  ST.skillLevel = selectedSkill;
  const sd = SKILL_DATA[selectedSkill];

  // Update topbar
  const badge = document.getElementById('skill-badge');
  badge.textContent = sd.icon + ' ' + sd.name;
  badge.className = 'skill-badge ' + sd.badgeClass;

  // Hide onboarding
  const overlay = document.getElementById('onboard-overlay');
  overlay.style.animation = 'fadeOut .3s ease forwards';
  setTimeout(() => overlay.style.display = 'none', 300);

  // Update start quiz level
  ST.qlv = sd.quizLevel;
  startQuiz(sd.quizLevel);

  // Render home with skill-aware content
  renderHome();
  renderLearnPath();
  toast('Welcome, ' + sd.name + '! Your personalised path is ready. 🎯', 't-gld');
}

function showSkillChange() {
  const overlay = document.getElementById('onboard-overlay');
  overlay.style.display = 'flex';
  overlay.style.animation = 'overlayIn .2s ease';
  if (ST.skillLevel) {
    const el = document.querySelector('[data-skill="'+ST.skillLevel+'"]');
    if (el) { selectSkill(el); }
  }
}

// ── SKILL-AWARE HOME ──────────────────────────────────────────
const _origRenderHome = renderHome;
renderHome = function() {
  _origRenderHome();

  if (!ST.skillLevel) return;
  const sd = SKILL_DATA[ST.skillLevel];

  // Update greeting
  const h1 = document.getElementById('home-h1');
  const p = document.getElementById('home-p');
  if (h1) h1.innerHTML = sd.greeting.replace(',', ',<br><em>').replace('!', '!</em>');
  if (p) p.textContent = sd.tagline;

  // Inject skill path card into home
  const hw = document.querySelector('.home-wrap');
  const existing = document.getElementById('skill-path-card');
  if (existing) existing.remove();

  const card = document.createElement('div');
  card.id = 'skill-path-card';
  card.className = 'skill-path-card';
  card.innerHTML = `
    <div class="spc-label">${sd.icon} Your Personalised Path · ${sd.range}</div>
    <div class="spc-title">${sd.name} Roadmap</div>
    <div class="spc-desc">${sd.pathMessage}</div>
    <div class="spc-steps">
      ${sd.studyPlan.map(s=>`<div class="spc-step"><span class="spc-step-num">${s.week}</span><span>${s.task}</span></div>`).join('')}
    </div>
    <div class="habit-strip">
      ${sd.dailyHabits.map((h,i)=>`<span class="habit-chip ${i<2?'active':''}">${h}</span>`).join('')}
    </div>
  `;
  // Insert after greeting
  const greeting = document.querySelector('.home-greeting');
  greeting.after(card);
};

// ── SKILL-AWARE LEARN PATH ────────────────────────────────────
const _origRenderLearnPath = renderLearnPath;
renderLearnPath = function() {
  _origRenderLearnPath();
  if (!ST.skillLevel) return;
  const sd = SKILL_DATA[ST.skillLevel];

  // Highlight priority modules and show a "start here" banner
  sd.focusModules.forEach(k => {
    const nodes = document.querySelectorAll('.lnode');
    nodes.forEach(n => {
      // Find node by checking if its click handler opens this module
      const onclick = n.getAttribute('onclick') || '';
      if (n.dataset && n.dataset.mod === k) n.classList.add('priority');
    });
  });

  // Add skill filter tabs above the path
  const pw = document.querySelector('.path-wrap');
  const existing = document.getElementById('skill-filter-bar');
  if (existing) existing.remove();

  const bar = document.createElement('div');
  bar.id = 'skill-filter-bar';
  bar.style.cssText = 'background:var(--s2);border:1px solid var(--bord);border-radius:10px;padding:14px 16px;margin-bottom:16px';
  bar.innerHTML = `
    <div style="font-family:'IBM Plex Mono',monospace;font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:8px">
      ${sd.icon} ${sd.name} Priority Focus
    </div>
    <div style="font-size:.78rem;color:var(--mute);line-height:1.55;margin-bottom:10px">${sd.boardMessage}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn" style="font-size:.63rem;padding:4px 10px" onclick="filterModules('all')">All Modules</button>
      <button class="btn btn-gold" style="font-size:.63rem;padding:4px 10px" onclick="filterModules('priority')">🎯 My Priority</button>
    </div>
  `;
  const pathHeader = document.querySelector('.path-header');
  if (pathHeader) pathHeader.after(bar);
};

function filterModules(type) {
  const nodes = document.querySelectorAll('.lnode');
  if (type === 'all') {
    nodes.forEach(n => n.style.display = 'flex');
    return;
  }
  if (!ST.skillLevel) return;
  const sd = SKILL_DATA[ST.skillLevel];
  nodes.forEach((n, i) => {
    const k = n.dataset.mod || (MODS[i] ? MODS[i].k : '');
    n.style.display = (sd.focusModules.includes(k)) ? 'flex' : 'none';
  });
}

// Attach data-mod to lesson nodes (patch renderLearnPath to add data attribute)
const _origRenderLearnPath2 = renderLearnPath;
renderLearnPath = function() {
  _origRenderLearnPath2();
  // Add data-mod to each node after render
  const allNodes = document.querySelectorAll('.lnode');
  // Nodes are in MODS order
  allNodes.forEach((n, i) => {
    if (MODS[i]) n.dataset.mod = MODS[i].k;
    // Re-add priority class based on skill
    if (ST.skillLevel) {
      const sd = SKILL_DATA[ST.skillLevel];
      if (MODS[i] && sd.focusModules.includes(MODS[i].k)) n.classList.add('priority');
    }
  });
};

// ── SKILL-AWARE QUIZ BUTTON ───────────────────────────────────
const _origStartQuiz = startQuiz;
startQuiz = function(lv) {
  // If skill level is set and user clicks quiz tab for first time, default to their level
  if (!lv && ST.skillLevel) lv = SKILL_DATA[ST.skillLevel].quizLevel;
  _origStartQuiz(lv || 1);
};

// ── CSS ANIMATION FOR FADEOUT ─────────────────────────────────
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = '@keyframes fadeOut{from{opacity:1}to{opacity:0;pointer-events:none}}';
document.head.appendChild(fadeOutStyle);



// ══════════════════════════════════════════════════════════════
// PERSISTENCE — Save/Load progress via localStorage
// ══════════════════════════════════════════════════════════════
const SAVE_KEY = 'chess_master_v1';

function _buildSaveData(){
  return {
    v:3,
    xp:ST.xp,lv:ST.lv,streak:ST.streak,skillLevel:ST.skillLevel,
    done:[...ST.done],qzRes:ST.qzRes,varsDone:ST.varsDone,
    opsDone:[...ST.opsDone],totalCorrect:ST.totalCorrect,totalQ:ST.totalQ,
    lastVisit:Date.now(),achievements:ST.achievements||[],
    practiceDone:[...(ST.practiceDone||[])],
    evalTacSolved:[...(ST.evalTacSolved||[])],
    evalMateSolved:ST.evalMateSolved||0,evalMateStreak:ST.evalMateStreak||0,
    evalEgPassed:[...(ST.evalEgPassed||[])],
    tacticsLearned:ST.tacticsLearned||{},endgamesLearned:ST.endgamesLearned||{},
    stageUnlocked:ST.stageUnlocked||{1:true,2:false,3:false},
    qzWrong:ST.qzWrong||{},
    // New fields v3
    botWins:ST.botWins||{},
    gameHistory:ST.gameHistory||[],
    eloHistory:ST.eloHistory||[],
    eloPeak:ST.eloPeak||400,
    weaknesses:ST.weaknesses||{},
    srData:ST.srData||{},
    frogs:ST.frogs||[],
    qlv:ST.qlv||1,
  };
}

function _applySaveData(d){
  if(!d)return false;
  ST.xp=d.xp||0;ST.lv=d.lv||1;ST.streak=d.streak||0;
  ST.skillLevel=d.skillLevel||null;
  ST.done=new Set(d.done||[]);ST.qzRes=d.qzRes||{};
  ST.varsDone=d.varsDone||{};ST.opsDone=new Set(d.opsDone||[]);
  ST.totalCorrect=d.totalCorrect||0;ST.totalQ=d.totalQ||0;
  ST.achievements=d.achievements||[];
  ST.practiceDone=new Set(d.practiceDone||[]);
  ST.evalTacSolved=new Set(d.evalTacSolved||[]);
  ST.evalMateSolved=d.evalMateSolved||0;ST.evalMateStreak=d.evalMateStreak||0;
  ST.evalEgPassed=new Set(d.evalEgPassed||[]);
  ST.tacticsLearned=d.tacticsLearned||{};ST.endgamesLearned=d.endgamesLearned||{};
  ST.stageUnlocked=d.stageUnlocked||{1:true,2:false,3:false};
  ST.qzWrong=d.qzWrong||{};
  // New fields v3
  ST.botWins=d.botWins||{};
  ST.gameHistory=d.gameHistory||[];
  ST.eloHistory=d.eloHistory||[];
  ST.eloPeak=d.eloPeak||400;
  ST.weaknesses=d.weaknesses||{};
  ST.srData=d.srData||{};
  ST.frogs=d.frogs||[];
  if(d.qlv)ST.qlv=d.qlv;
  const daysSince=(Date.now()-(d.lastVisit||0))/86400000;
  if(daysSince>2)ST.streak=0;
  return true;
}

function saveProgress(){
  const raw=JSON.stringify(_buildSaveData());
  // Layer 1: localStorage
  try{localStorage.setItem(SAVE_KEY,raw);}catch(e){}
  // Layer 2: sessionStorage (survives tab refresh)
  try{sessionStorage.setItem(SAVE_KEY,raw);}catch(e){}
  // Layer 3: store in document title trick (survives some Android re-opens)
  try{document.title='Chess Academy ['+btoa(raw.substring(0,200))+']';}catch(e){}
}

function loadProgress(){
  let raw=null;
  // Try each layer in order
  try{raw=localStorage.getItem(SAVE_KEY);}catch(e){}
  if(!raw){try{raw=sessionStorage.getItem(SAVE_KEY);}catch(e){}}
  // Layer 4: check URL hash for exported save
  if(!raw && location.hash && location.hash.length>10){
    try{raw=atob(location.hash.slice(1));}catch(e){}
  }
  if(!raw)return false;
  try{return _applySaveData(JSON.parse(raw));}catch(e){return false;}
}

function exportSave(){
  const raw=JSON.stringify(_buildSaveData());
  const code=btoa(raw);
  // Copy to clipboard
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(code).then(()=>{
      toast('\u2714 Save code copied! Paste it in \'Import Save\' to restore.','t-ok');
    }).catch(()=>_showSaveCode(code));
  } else {
    _showSaveCode(code);
  }
}

function _showSaveCode(code){
  const msg=`Your save code (copy it all):\n\n${code}`;
  // Show in a modal-style prompt
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML=`<div style="background:var(--s2);border:1px solid var(--bord);border-radius:12px;padding:20px;max-width:480px;width:100%">
    <div style="font-family:IBM Plex Mono,monospace;font-size:.75rem;color:var(--gold);margin-bottom:10px">\u2714 Save Code — copy all of it</div>
    <textarea id="save-code-ta" style="width:100%;height:120px;background:var(--s1);border:1px solid var(--bord);color:var(--cream);border-radius:6px;padding:8px;font-family:IBM Plex Mono,monospace;font-size:.65rem;resize:none">${code}</textarea>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn btn-gold" onclick="document.getElementById('save-code-ta').select();document.execCommand('copy');toast('Copied!','t-ok')">Copy</button>
      <button class="btn" onclick="this.closest('div[style]').parentElement.remove()">Close</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

function importSave(){
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML=`<div style="background:var(--s2);border:1px solid var(--bord);border-radius:12px;padding:20px;max-width:480px;width:100%">
    <div style="font-family:IBM Plex Mono,monospace;font-size:.75rem;color:var(--gold);margin-bottom:10px">\u2191 Paste your save code below</div>
    <textarea id="import-ta" placeholder="Paste save code here..." style="width:100%;height:120px;background:var(--s1);border:1px solid var(--bord);color:var(--cream);border-radius:6px;padding:8px;font-family:IBM Plex Mono,monospace;font-size:.65rem;resize:none"></textarea>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn btn-grn" onclick="_doImport(document.getElementById('import-ta').value.trim())">Restore Progress</button>
      <button class="btn" onclick="this.closest('div[style]').parentElement.remove()">Cancel</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

function _doImport(code){
  if(!code){toast('Paste a save code first','t-bad');return;}
  try{
    const raw=atob(code);
    const d=JSON.parse(raw);
    if(_applySaveData(d)){
      saveProgress();
      document.querySelectorAll('.modal-overlay, div[style*="inset:0"]').forEach(e=>e.remove());
      renderHome();
      toast('\u2714 Progress restored! Welcome back.','t-ok');
    } else {toast('Invalid save code','t-bad');}
  }catch(e){toast('Could not read save code: '+e.message,'t-bad');}
}

// Auto-save on any state change
/* addXP consolidated */


// ── ACHIEVEMENT SYSTEM ────────────────────────────────────────
const ACHIEVEMENTS = [
  {id:'first_lesson', icon:'🎓', name:'First Step', desc:'Complete your first lesson', hp:'You received your Hogwarts letter — the journey begins!', check:()=>ST.done.size>=1},
  {id:'five_lessons', icon:'📚', name:'Wizard Student', desc:'Complete 5 lessons', hp:'Five subjects mastered — Hermione would be impressed.', check:()=>ST.done.size>=5},
  {id:'all_l1', icon:'🌱', name:'First Year Honours', desc:'Complete all Level 1 modules', hp:'You passed your First Year with flying colours — Dumbledore nods approvingly.', check:()=>MODS.filter(m=>m.level===1).every(m=>ST.done.has(m.k))},
  {id:'quiz_l1', icon:'✅', name:'OWL Passed', desc:'Pass the Level 1 quiz', hp:'Your Ordinary Wizarding Level in Chess is certified!', check:()=>ST.qzRes[1]===true},
  {id:'quiz_l2', icon:'⚔️', name:'N.E.W.T. Achieved', desc:'Pass the Level 2 quiz', hp:'Nastily Exhausting Wizarding Test — conquered! Even McGonagall smiles.', check:()=>ST.qzRes[2]===true},
  {id:'quiz_l3', icon:'👑', name:'Hogwarts Champion', desc:'Pass the Level 3 quiz', hp:'You have won the Triwizard Chess Tournament. Eternal glory awaits.', check:()=>ST.qzRes[3]===true},
  {id:'first_opening', icon:'🏁', name:'Opening Spell Cast', desc:'Master your first opening', hp:'Incendio! Your first opening blazes a trail on the board.', check:()=>ST.opsDone.size>=1},
  {id:'all_openings', icon:'📖', name:'Marauder\'s Map Mastered', desc:'Master 5 openings', hp:'I solemnly swear I am up to no good — and crushing openings.', check:()=>ST.opsDone.size>=5},
  {id:'xp_500', icon:'⚡', name:'500 House Points', desc:'Earn 500 XP', hp:'500 points to Gryffindor! The house cup is within reach.', check:()=>ST.xp>=500},
  {id:'xp_1000', icon:'🔥', name:'Fiendfyre Master', desc:'Earn 1000 XP', hp:'1000 points — the entire common room erupts in celebration!', check:()=>ST.xp>=1000},
  {id:'streak_7', icon:'🔥', name:'Daily Prophet Feature', desc:'7-day learning streak', hp:'Seven consecutive days — the Daily Prophet wants an interview.', check:()=>ST.streak>=7},
  {id:'beat_ron', icon:'🧡', name:'Defeated Ron', desc:'Win a game vs Ron Weasley', hp:'Ron stares at the board, confused. "How did you do that?"', check:()=>(ST.botWins?.b300||0)>=1},
  {id:'beat_dumbledore', icon:'🌟', name:'Defeated Dumbledore', desc:'Win a game vs Dumbledore', hp:'Dumbledore closes his eyes and smiles. "Remarkable. Truly remarkable."', check:()=>(ST.botWins?.b1500||0)>=1},
  {id:'all_done', icon:'🏆', name:'Chess Academy Graduate', desc:'Complete all modules', hp:'You have mastered Wizard\'s Chess. A new hero of Hogwarts is born.', check:()=>ST.done.size>=34},
];

function checkAchievements() {
  if (!ST.achievements) ST.achievements = [];
  ACHIEVEMENTS.forEach(a => {
    if (!ST.achievements.includes(a.id) && a.check()) {
      ST.achievements.push(a.id);
      confetti();
      const msg = a.hp
        ? `${a.icon} ${a.name}\n<span class="hp-quip">${a.hp}</span>`
        : `🏆 Achievement: ${a.icon} ${a.name}!`;
      toast(msg, 't-gld');
      saveProgress();
    }
  });
}

// Hook achievement checking into XP gain and module completion
/* addXP consolidated */

// ── XP SYSTEM UPGRADE ────────────────────────────────────────
// Extend to 10 levels with better thresholds
const XPT_NEW = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2300, 3000];
const LEVEL_TITLES = [
  'First Year',        // Lv 1 — just arrived at Hogwarts (Novice)
  'Second Year',       // Lv 2 — learning spells (Apprentice)
  'Third Year',        // Lv 3 — elective subjects (Student)
  'Fourth Year',       // Lv 4 — Triwizard year (Learner)
  'Fifth Year',        // Lv 5 — OWLs preparation (Improving)
  'Sixth Year',        // Lv 6 — N.E.W.T. advanced (Club Player)
  'Head Boy/Girl',     // Lv 7 — strategic leader (Tactician)
  'Prefect Champion',  // Lv 8 — recognised talent (Strategist)
  'Order Member',      // Lv 9 — trusted expert (Expert)
  'Hogwarts Champion', // Lv 10 — near master level
  'Chess Master'       // Lv 11 — graduated with honours
];

// Override addXP to use new thresholds
addXP = function(n, label='') {
  ST.xp += n;
  let lv = 1;
  for (let i = 1; i < XPT_NEW.length; i++) { if (ST.xp >= XPT_NEW[i]) lv = i + 1; }
  const lvUp = lv > ST.lv;
  if (lvUp) {
    ST.lv = lv;
    confetti();
    const title = LEVEL_TITLES[Math.min(lv, LEVEL_TITLES.length-1)];
    toast('🎉 Level ' + lv + ' — ' + title + '!', 't-gld');
  }
  const lo = XPT_NEW[Math.min(ST.lv-1, XPT_NEW.length-1)];
  const hi = XPT_NEW[Math.min(ST.lv, XPT_NEW.length-1)] || ST.xp + 1;
  const pct = Math.min(100, ((ST.xp - lo) / (hi - lo)) * 100);
  document.getElementById('xp-num').textContent = ST.xp + ' XP';
  document.getElementById('lv-pill').textContent = 'Lv ' + ST.lv + ' · ' + LEVEL_TITLES[Math.min(ST.lv, LEVEL_TITLES.length-1)];
  if (label && !lvUp) toast(label, 't-gld');
  updateHomeStats();
  saveProgress();
  setTimeout(checkAchievements, 300);
};

// ── STREAK SYSTEM ─────────────────────────────────────────────
// ── HP FLOATING CANDLES ────────────────────────────────────────
function initCandles(){
  const bg=document.createElement('div');bg.className='candles-bg';bg.id='candles-bg';
  document.body.prepend(bg);
  for(let i=0;i<18;i++){
    const c=document.createElement('div');c.className='candle';
    const drift=(Math.random()-0.5)*80;
    const left=Math.random()*98;
    const dur=8+Math.random()*10;
    const delay=Math.random()*4;
    c.style.cssText=`left:${left}%;--drift:${drift}px;animation-duration:${dur}s;animation-delay:${delay}s`;
    c.innerHTML='<div class="candle-flame"></div><div class="candle-body"></div>';
    bg.appendChild(c);
  }
}

function recordDailyVisit() {
  const today = new Date().toDateString();
  const lastDay = localStorage.getItem('chess_last_day');
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastDay === today) return; // already counted today
  if (lastDay === yesterday) {
    ST.streak++; // consecutive day
  } else if (!lastDay) {
    ST.streak = 1; // first time
  } else {
    ST.streak = 1; // streak broken, restart
  }
  localStorage.setItem('chess_last_day', today);
  document.getElementById('streak-num').textContent = ST.streak;
  saveProgress();
}



// ── MASTERY LINKS: eval completion → academy module status ──────
function markModuleTested(moduleKey) {
  // When a mastery test is passed, mark the corresponding academy module as tested
  const el = document.querySelector(`.lnode[data-mod="${moduleKey}"]`);
  if(el) { el.classList.add('mastery-tested'); }
  // Show XP flash
  const flash = document.createElement('div');
  flash.className = 'xp-flash';
  flash.textContent = '✓ Mastery verified!';
  document.body.appendChild(flash);
  setTimeout(()=>flash.remove(), 900);
}

// Called when tactics puzzle solved
function onEvalTacSolved(puzzleId, xpEarned) {
  addXP(xpEarned, '⚔️ Tactics puzzle solved! +'+xpEarned+' XP');
  updateEvalTopStats();
  // If enough puzzles solved, mark tactics module tested
  if(ST.evalTacSolved.size >= 6) markModuleTested('tactics_m');
  if(ST.evalTacSolved.size >= 7) markModuleTested('middle_threats');
  saveProgress();
}

// Called when endgame drill passed
function onEvalEgPassed(drillId, xpEarned) {
  addXP(xpEarned, '♔ Endgame drill passed! +'+xpEarned+' XP');
  updateEvalTopStats();
  if(drillId==='kqk') markModuleTested('endgames_m');
  if(drillId==='krk') markModuleTested('endgames_m');
  if(ST.evalEgPassed.size >= 3) markModuleTested('advanced_endings');
  saveProgress();
}

// Called when mate puzzle solved
function onEvalMateSolved(xpEarned) {
  addXP(xpEarned, '♛ Checkmate solved! +'+xpEarned+' XP');
  updateEvalTopStats();
  if(ST.evalMateSolved >= 4) markModuleTested('mates');
  if(ST.evalMateSolved >= 7) markModuleTested('advanced_mates');
  saveProgress();
}

// Called when bot game won
function onBotGameWon(botRating) {
  const xp = Math.round(botRating / 10);
  addXP(xp, '🤖 Bot defeated! +'+xp+' XP');
  updateEvalTopStats();
  if(botRating >= 600) markModuleTested('opprinciples');
  if(botRating >= 900) markModuleTested('tactics_m');
  if(botRating >= 1200) markModuleTested('middle_basics');
  saveProgress();
}

function updateEvalTopStats() {
  const el = document.getElementById('eval-stat-bar');
  if(!el) return;
  el.textContent = '⚔️ '+ST.evalTacSolved.size+'/8  ♔ '+ST.evalEgPassed.size+'/4  🤖 Bots';
}

function buildEvalProgress(){
  const el=document.getElementById('view-eval-progress');if(!el)return;
  el.innerHTML=`
    <div style="padding:18px 22px">
      <div style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;color:var(--cream);margin-bottom:5px">📊 Mastery Dashboard</div>
      <div style="font-size:.78rem;color:var(--mute);margin-bottom:18px;line-height:1.5">Every result is measured by the chess engine — deterministic, accurate, no API required.</div>
      <div id="eval-prog-cards"></div>
    </div>`;
  const cards=document.getElementById('eval-prog-cards');if(!cards)return;
  const secs=[
    {t:'⚔️ Tactics Puzzles',mastered:ST.evalTacSolved.size>=7,how:'Solve 7 of 8 board puzzles',
     stats:[{l:'Solved',v:ST.evalTacSolved.size+'/8',pct:ST.evalTacSolved.size/8,c:'var(--gold)'},{l:'Streak',v:ST.streak}]},
    {t:'👑 Checkmate Drills',mastered:ST.evalMateSolved>=7,how:'Solve all 7 checkmate challenges',
     stats:[{l:'Solved',v:ST.evalMateSolved+'/7',pct:ST.evalMateSolved/7,c:'var(--grnl)'},{l:'Streak',v:ST.evalMateStreak}]},
    {t:'♔ Endgame Drills',mastered:ST.evalEgPassed.size>=4,how:'Pass all 4 endgame drills within move limits',
     stats:[{l:'Passed',v:ST.evalEgPassed.size+'/4',pct:ST.evalEgPassed.size/4,c:'var(--redl)'}]},
    {t:'📚 Curriculum',mastered:ST.done.size>=20,how:'Complete 20+ lessons across all 3 levels',
     stats:[{l:'Lessons Done',v:ST.done.size+'/34',pct:ST.done.size/34,c:'var(--gold)'},{l:'XP',v:ST.xp},{l:'Level',v:'Lv '+ST.lv}]},
  ];
  secs.forEach(s=>{
    const c=document.createElement('div');
    c.style.cssText='background:var(--s2);border:1px solid var(--bord);border-radius:10px;padding:14px 16px;margin-bottom:11px';
    c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px"><div style="font-family:Cormorant Garamond,serif;font-size:1.02rem;font-weight:700;color:var(--cream)">${s.t}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:.63rem;color:${s.mastered?'var(--grnl)':'var(--mute)'}">${s.mastered?'✅ MASTERED':'In Progress'}</div></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:6px;margin-bottom:8px">${s.stats.map(st=>`<div style="background:var(--s3);border-radius:6px;padding:7px;text-align:center"><div style="font-family:Cormorant Garamond,serif;font-size:1.3rem;font-weight:700;color:var(--cream)">${st.v}</div><div style="font-size:.58rem;font-family:'IBM Plex Mono',monospace;color:var(--mute)">${st.l}</div>${st.pct!=null?`<div style="height:4px;background:var(--s4);border-radius:2px;overflow:hidden;margin-top:4px"><div style="height:100%;border-radius:2px;background:${st.c};width:${Math.round(st.pct*100)}%"></div></div>`:``}</div>`).join('')}</div><div style="font-size:.71rem;font-family:'IBM Plex Mono',monospace;color:${s.mastered?'var(--grnl)':'var(--mute)'}">How to master: ${s.how}</div>`;
    cards.appendChild(c);
  });
}

function markTacticLearned(id){
  if(!ST.tacticsLearned)ST.tacticsLearned={};
  if(ST.tacticsLearned[id])return;
  ST.tacticsLearned[id]=true;
  addXP(20,'Tactic learned +20 XP');
  saveProgress();renderTactics();
  toast('✓ Tactic learned! +20 XP','t-ok');
}
function markEndgameLearned(id){
  if(!ST.endgamesLearned)ST.endgamesLearned={};
  if(ST.endgamesLearned[id])return;
  ST.endgamesLearned[id]=true;
  addXP(25,'Endgame concept learned +25 XP');
  saveProgress();renderEndgames();
  toast('✓ Endgame concept learned! +25 XP','t-ok');
}
function startTacticPractice(tacticId){
  // Find puzzles matching this tactic
  const typeMap={fork:'Fork',pin:'Pin',hanging:'Hanging',skewer:'Skewer',
    discovered:'Discovered',dblcheck:'Discovered'};
  const typeName=typeMap[tacticId]||tacticId;
  const pool=ALL_PUZZLES.filter(p=>(p.type||'').toLowerCase().includes(typeName.toLowerCase()));
  const puzzles=pool.length>0?pool:ALL_PUZZLES;
  // Switch to eval-puzzles and filter the grid
  switchView('eval-puzzles');
  setTimeout(()=>{
    const el=document.getElementById('tac-grid');
    if(!el)return;
    el.innerHTML='';
    // Header
    const hdr=document.createElement('div');
    hdr.style.cssText='grid-column:1/-1;padding:8px 4px 4px;font-family:IBM Plex Mono,monospace;font-size:.65rem;color:var(--mute)';
    hdr.textContent=(pool.length>0?puzzles.length+' puzzles for '+typeName:'All puzzles')+'  — click to practice';
    el.appendChild(hdr);
    puzzles.forEach(p=>{
      const done=ST.evalTacSolved&&ST.evalTacSolved.has(p.id);
      const c=document.createElement('div');
      c.className='gc'+(done?' done':'');
      const diff=(p.diff||'easy').toLowerCase();
      c.innerHTML='<div class="gc-d d'+diff[0]+'">'+diff.toUpperCase()+' +'+p.xp+'XP</div>'+
        '<div class="gc-t">'+p.title+'</div>'+
        '<div class="gc-s">'+(p.desc||'')+'</div>'+
        '<div class="gc-st">'+(done?'✓ Solved':'Unsolved')+'</div>';
      c.addEventListener('click',()=>loadTac(p));
      el.appendChild(c);
    });
  },100);
}

function _wireBoardButtons(hintId, resetId, hintFn, resetFn) {
  const h = document.getElementById(hintId);
  const r = document.getElementById(resetId);
  if (h) h.onclick = hintFn;
  if (r) r.onclick = resetFn;
}

function closeOpBoard(){
  const _panel=document.getElementById('op-board-panel');
  const _grid=document.getElementById('op-grid');
  const _sh=document.querySelector('#view-openings .section-head');
  if(_panel)_panel.style.display='none';
  if(_grid)_grid.style.display='grid';
  if(_sh)_sh.style.display='block';
  // Re-render cards in case XP changed
  renderOpGrid();
}


function showMoveInstruction(){
  const op=OPS[ST.curOp],vr=op&&op.vars[ST.curVar];if(!vr)return;
  if(ST.step>=vr.moves.length){setFB('fb-gld','🏆 Variation complete! Try the next tab.');return;}
  const m=vr.moves[ST.step];
  const side=m.s==='w'?'White':'Black';
  const mv=m.l||(m.f+' → '+m.t);
  const comment=m.c||'';
  setFB('fb-box','<span style="opacity:.6;font-size:.68rem;text-transform:uppercase;letter-spacing:.08em">Move '+(ST.step+1)+'</span><br>'
    +'<strong>'+side+' plays '+mv+'</strong>'
    +(comment?'<br><span style="opacity:.75">'+comment+'</span>':''));
}
// ── INIT ──────────────────────────────────────────────────────
const hasData = loadProgress();
// Sync UI after loading
if(hasData){
  document.getElementById('xp-num').textContent=ST.xp+' XP';
  document.getElementById('lv-pill').textContent='Lv '+ST.lv+' · '+(LEVEL_TITLES[Math.min(ST.lv,LEVEL_TITLES.length-1)]||'Novice');
  document.getElementById('streak-num').textContent=ST.streak;
  // Sync module completion status badges in sidebar
  ST.done.forEach(k=>{const el=document.getElementById('s-'+k);if(el){el.className='si-st done';el.textContent='✓';}});
}
recordDailyVisit();
initCandles();
if (hasData && ST.skillLevel) {
  // Returning user — skip onboarding
  document.getElementById('onboard-overlay').style.display = 'none';
  if(ST.skillLevel) startWithSkill(ST.skillLevel); else renderHome();
} else if (hasData) {
  document.getElementById('onboard-overlay').style.display = 'none';
}
renderHome();
startQuiz(ST.qlv || 1);
document.getElementById('streak-num').textContent = ST.streak;
document.querySelectorAll('.nav-item[data-v="tactics"]').forEach(n=>n.addEventListener('click',renderTactics));


// ═══════════════════════════════════════════════════════════════
// BOARD RENDERING
// ═══════════════════════════════════════════════════════════════
// UNI provided by academy

function mkPieceSVG(piece:string,sz:number):string{
  const isW=piece[0]==='w';const t=piece[1];
  // White: bright white fill + thick dark outline (max contrast on tan/gold light squares)
  // Black: near-black fill + thick light ivory outline (max contrast on brown dark squares)
  const f=isW?'#ffffff':'#141008';const s=isW?'#1a0e04':'#ede4c8';const sw=Math.max(2.5,sz/18);
  const shapes:Record<string,string>={
    P:`<circle cx="22.5" cy="9" r="4.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<path d="M19 14.5 C17.5 17 16.5 21 16.5 25.5 L28.5 25.5 C28.5 21 27.5 17 26 14.5 C24.5 16 20.5 16 19 14.5Z" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="12" y="25.5" width="21" height="4" rx="1.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="10" y="29.5" width="25" height="4" rx="2" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
    N:`<path d="M22 10 C19 8 15.5 10 15.5 14 C15.5 18 18 20 19.5 21.5 L15 32 L30 32 L30 26 C32.5 24.5 34 21 33 17 C32 13.5 27.5 11 25 10.5 C24 10 23 10 22 10Z" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<circle cx="20.5" cy="15.5" r="1.8" fill="${s}"/>
<path d="M19.5 21 C18 20 17 18.5 18 16.5" stroke="${s}" stroke-width="1" fill="none" stroke-linecap="round"/>
<rect x="12" y="32" width="21" height="3.5" rx="1.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="10" y="35.5" width="25" height="4" rx="2" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
    B:`<circle cx="22.5" cy="6" r="2.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<path d="M22.5 9 C19.5 11 17 15 17 20 C17 25 19.5 27 22.5 27.5 C25.5 27 28 25 28 20 C28 15 25.5 11 22.5 9Z" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<path d="M19.5 17 L25.5 17" stroke="${s}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<rect x="12" y="27.5" width="21" height="3.5" rx="1.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="10" y="31" width="25" height="4" rx="2" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
    R:`<path d="M13 8 L13 13 L16.5 13 L16.5 10.5 L20 10.5 L20 13 L25 13 L25 10.5 L28.5 10.5 L28.5 13 L32 13 L32 8Z" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="14.5" y="13" width="16" height="13" rx="1" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="12" y="26" width="21" height="4" rx="1.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="10" y="30" width="25" height="4" rx="2" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
    Q:`<circle cx="22.5" cy="7" r="3" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<circle cx="11.5" cy="11.5" r="2.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<circle cx="33.5" cy="11.5" r="2.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<path d="M8.5 13 L15.5 24 L22.5 17 L29.5 24 L36.5 13 L31 26 L14 26Z" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="12" y="26" width="21" height="4" rx="1.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="10" y="30" width="25" height="4" rx="2" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
    K:`<path d="M21.5 5 L23.5 5 L23.5 9 L27.5 9 L27.5 11 L23.5 11 L23.5 15 L21.5 15 L21.5 11 L17.5 11 L17.5 9 L21.5 9Z" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<path d="M15.5 15 L29.5 15 L31 26 L14 26Z" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="12" y="26" width="21" height="4" rx="1.5" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
<rect x="10" y="30" width="25" height="4" rx="2" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="${sz}" height="${sz}" style="display:block;pointer-events:none">${shapes[t]||''}</svg>`;
}
function drawEvalBoard(id,st,{sel=null,last=null,hints=[],sz=0}={}){
  const el=document.getElementById(id);if(!el)return;el.innerHTML='';
  if(!sz){
    // Walk up to find a container with real width
    let bz=el.parentElement;
    let bw=0;
    while(bz&&bw<40){bw=bz.getBoundingClientRect().width;bz=bz.parentElement;}
    // Hard fallback: 90% of screen width
    if(!bw||bw<40)bw=Math.floor((window.innerWidth||360)*0.85);
    // On mobile, board can't be wider than screen minus padding
    const maxW=window.innerWidth>640?400:window.innerWidth-40;
    bw=Math.min(bw,maxW);
    sz=Math.max(36,Math.min(54,Math.floor((bw-8)/8)));
  }
  el.style.width=(sz*8)+'px';el.style.height=(sz*8)+'px';el.style.display='flex';el.style.flexWrap='wrap';
  const pos=st.board||st;
  const _ranks=_boardFlipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];
  const _files=_boardFlipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
  for(const r of _ranks){
    for(const f of _files){
      const s=FL[f]+r,lt=(f+r)%2===1;
      const d=document.createElement('div');
      d.className='sq '+(lt?'lt':'dk');d.style.cssText=`width:${sz}px;height:${sz}px`;d.dataset.sq=s;
      if(pos[s]){const sp=document.createElement('div');sp.className='piece '+(pos[s][0]==='w'?'pw':'pb');sp.dataset.piece=pos[s];sp.innerHTML=mkPieceSVG(pos[s],Math.round(sz*.9));d.appendChild(sp);}
      if((!_boardFlipped&&r===1)||(_boardFlipped&&r===8)){const c=document.createElement('span');c.className='cf';c.textContent=FL[f];d.appendChild(c);}
      if((!_boardFlipped&&f===0)||(_boardFlipped&&f===7)){const c=document.createElement('span');c.className='cr';c.textContent=r;d.appendChild(c);}
      if(s===sel)d.classList.add('sel');
      if(last&&(s===last.from||s===last.to))d.classList.add('last');
      if(hints.includes(s))d.classList.add('hnt');
      el.appendChild(d);
    }
  }
}
function wireEvalBoard(id,fn){document.getElementById(id)?.querySelectorAll('.sq').forEach(sq=>sq.addEventListener('click',()=>fn(sq.dataset.sq)));}

// ═══════════════════════════════════════════════════════════════
// TACTICS
// ═══════════════════════════════════════════════════════════════
function buildTacGrid(){
  const el=document.getElementById('tac-grid');el.innerHTML='';
  ALL_PUZZLES.forEach(p=>{
    const done=ST.evalTacSolved.has(p.id);
    const c=document.createElement('div');c.className='gc'+(done?' done':'');
    c.innerHTML=`<div class="gc-d d${p.diff[0]}">${p.diff.toUpperCase()} +${p.xp}XP</div><div class="gc-t">${p.title}</div><div class="gc-s">${p.desc}</div><div class="gc-tags"><span class="gct">${p.type}</span>${done?'<span class="gct" style="color:var(--grnl)">✓</span>':''}</div>`;
    c.onclick=()=>loadTac(p.id);el.appendChild(c);
  });
}

function loadTac(arg){
  const p=(typeof arg==='object'&&arg)?arg:ALL_PUZZLES.find(x=>x.id===arg);if(!p)return;
  const freshTac:any={st:mkState({...p.pos},p.side),sel:null,puz:p,attempts:0,history:[]};
  ST.evalTac=freshTac;
  document.getElementById('t-lbl').textContent=p.type.toUpperCase();
  document.getElementById('t-title').textContent=p.title;
  document.getElementById('t-req').textContent=(p.side==='w'?'White':'Black')+' to play — '+p.desc;
  document.getElementById('t-pat').textContent=p.type;
  document.getElementById('t-pdesc').textContent=p.desc;
  setEvalFB('t-fb','','👆 Click a piece then its destination square.');
  document.getElementById('t-res').classList.remove('show');
  document.getElementById('btn-tnext').style.display='none';
  _wireBoardButtons('btn-thint','btn-treset',
    ()=>{const p=ST.evalTac.puz;if(!p)return;
      setEvalFB('t-fb','finf','💡 '+p.hint);
      ST.evalTac.sel=p.solution.from;
      drawTac(legalMoves(ST.evalTac.st,p.side).filter(m=>m.from===p.solution.from).map(m=>m.to));
    },
    ()=>{if(ST.evalTac.puz)loadTac(ST.evalTac.puz);}
  );
  const undoBtn=document.getElementById('btn-tundo');
  if(undoBtn)undoBtn.onclick=undoTac;
  switchView('eval-tboard');requestAnimationFrame(()=>requestAnimationFrame(()=>drawTac()));
}

function drawTac(hints=[]){
  drawEvalBoard('t-board',ST.evalTac.st,{sel:ST.evalTac.sel,hints});
  wireEvalBoard('t-board',onTacClick);
  addDragSupport('t-board', onTacClick);
}

function onTacClick(s){
  const {st,puz,sel}=ST.evalTac;if(!st||!puz)return;
  if(!sel){
    if(st.board[s]&&st.board[s][0]===puz.side){
      ST.evalTac.sel=s;
      const lm=legalMoves(st,puz.side).filter(m=>m.from===s).map(m=>m.to);
      drawTac(lm);
    }
    return;
  }
  if(s===sel){ST.evalTac.sel=null;drawTac();return;}
  ST.evalTac.attempts++;
  const lm=legalMoves(st,puz.side);
  const chosen=lm.find(m=>m.from===sel&&m.to===s);
  if(chosen&&chosen.from===puz.solution.from&&chosen.to===puz.solution.to){
    (ST.evalTac as any).history?.push(st);
    playSound(chosen.cap?'capture':'move');
    ST.evalTac.st=applyMove(st,chosen);ST.evalTac.sel=null;drawTac();
    trackPuzzleResult(puz,true);updateSR(puz.id,true);
    if(!ST.evalTacSolved.has(puz.id)){ST.evalTacSolved.add(puz.id);ST.streak++;onEvalTacSolved(puz.id,puz.xp);}
    // Mark daily puzzle done if this was the daily challenge
    if(ST._dailyPuzzleKey&&ALL_PUZZLES.indexOf(puz)===ST._dailyPuzzleIdx){
      localStorage.setItem(ST._dailyPuzzleKey,'1');
      ST._dailyPuzzleKey=null;
      addXP(25,'🎩 +25 XP Daily Wizard Challenge!');
      const dc=document.getElementById('daily-card');
      if(dc){dc.className='daily-card done';dc.querySelector('.dc-status')!.textContent='✅ Completed today';}
    }
    setFB('t-fb','fgld','🏆 '+puz.explain);
    const stars=ST.evalTac.attempts<=1?'⭐⭐⭐':ST.evalTac.attempts<=3?'⭐⭐':'⭐';
    document.getElementById('t-stars').textContent=stars;
    document.getElementById('t-rt').textContent='Correct! '+stars;
    document.getElementById('t-rm').textContent=puz.explain;
    document.getElementById('t-res').classList.add('show');
    const nxt=ALL_PUZZLES.find(x=>!ST.evalTacSolved.has(x.id));
    const nb=document.getElementById('btn-tnext');nb.style.display='inline-flex';
    nb.onclick=nxt?()=>loadTac(nxt.id):()=>switchView('eval-puzzles');nb.textContent=nxt?'Next →':'All Puzzles';
    confetti();toast('✓ Correct! +'+puz.xp+' XP','tgld');
    updateEvalTopStats();buildTacGrid();
  } else if(chosen){
    (ST.evalTac as any).history?.push(st);
    playSound('lose');
    trackPuzzleResult(puz,false);updateSR(puz.id,false);
    ST.evalTac.sel=null;ST.streak=0;drawTac();
    setEvalFB('t-fb','ferr','❌ Legal move but not the winning tactic. Think: can you attack two pieces at once? Look for checks, captures, threats.');
    shake('t-board');updateEvalTopStats();
  } else {
    ST.evalTac.sel=null;drawTac();
    setEvalFB('t-fb','ferr','❌ Illegal move — select a valid piece and destination.');
    shake('t-board');
  }
}







function updateTacStats(){
  const n=ST.evalTacSolved.size,t=ALL_PUZZLES.length;
  document.getElementById('t-ns').textContent=n;
  document.getElementById('t-na').textContent=ST.evalTac.attempts;
  document.getElementById('t-ac').textContent=ST.evalTac.attempts>0?Math.round(n/ST.evalTac.attempts*100)+'%':'—';
  const pct=Math.round(n/t*100);
  document.getElementById('t-mbar').style.width=pct+'%';
  const needed=Math.ceil(t*.875);
  document.getElementById('t-mpct').textContent=n>=needed?'✅ Tactics MASTERED!':n+'/'+needed+' needed to master';
  document.getElementById('ts-p').textContent=n+'/'+t;
  document.getElementById('ts-s').textContent=ST.streak;
}

// ═══════════════════════════════════════════════════════════════
// CHECKMATE
// ═══════════════════════════════════════════════════════════════
function buildMateGrid(){
  const el=document.getElementById('mate-grid');el.innerHTML='';
  MATES.forEach(m=>{
    const c=document.createElement('div');c.className='gc';
    c.innerHTML=`<div class="gc-d d${m.n<=1?'e':'m'}">MATE IN ${m.n} +${m.xp}XP</div><div class="gc-t">${m.title}</div><div class="gc-s">${m.req}</div><div class="gc-tags"><span class="gct">${m.type}</span></div>`;
    c.onclick=()=>loadMate(m.id);el.appendChild(c);
  });
}

function loadMate(id){
  const p=MATES.find(x=>x.id===id);if(!p)return;
  ST.evalMate={st:mkState({...p.pos},p.side),sel:null,puz:p,step:0};
  document.getElementById('mn').textContent=p.n;
  document.getElementById('m-title').textContent=p.title;
  document.getElementById('m-req').textContent=p.req;
  document.getElementById('m-ptype').textContent=p.type;
  document.getElementById('m-pdesc').textContent=p.info;
  setFB('m-fb','','Find and play checkmate in '+p.n+(p.n===1?' move':' moves')+'.');
  document.getElementById('m-res').classList.remove('show');
  document.getElementById('btn-mnext').style.display='none';
  switchView('eval-mboard');requestAnimationFrame(()=>requestAnimationFrame(()=>drawMate()));
}

function drawMate(hints=[]){
  drawEvalBoard('m-board',ST.evalMate.st,{sel:ST.evalMate.sel,hints});
  wireEvalBoard('m-board',onMateClick);
  addDragSupport('m-board', onMateClick);
}

function onMateClick(s){
  const {st,puz,sel,step}=ST.evalMate;if(!st||!puz||step>=puz.moves.length)return;
  if(!sel){
    if(st.board[s]&&st.board[s][0]===puz.side){
      ST.evalMate.sel=s;
      const hints=legalMoves(st,puz.side).filter(m=>m.from===s).map(m=>m.to);
      drawMate(hints);
    }
    return;
  }
  if(s===sel){ST.evalMate.sel=null;drawMate();return;}
  const lm=legalMoves(st,puz.side);
  const chosen=lm.find(m=>m.from===sel&&m.to===s);
  if(!chosen){ST.evalMate.sel=null;drawMate();setFB('m-fb','ferr','❌ Illegal move.');return;}
  const ns=applyMove(st,chosen);
  ST.evalMate.st=ns;ST.evalMate.sel=null;ST.evalMate.step++;
  drawMate();
  if(isMate(ns)){
    playSound('win');
    ST.evalMateSolved++;ST.evalMateStreak++;onEvalMateSolved(puz.xp);
    setFB('m-fb','fgld','♛ Checkmate! '+puz.explain);
    document.getElementById('m-rt').textContent='Checkmate! ♛';
    document.getElementById('m-rm').textContent=puz.explain;
    document.getElementById('m-res').classList.add('show');
    document.getElementById('m-sol').textContent=ST.evalMateSolved;
    document.getElementById('m-str').textContent=ST.evalMateStreak;
    document.getElementById('m-tot').textContent=ST.evalMateSolved+'/'+MATES.length;
    const idx=MATES.findIndex(x=>x.id===puz.id);
    const nb=document.getElementById('btn-mnext');nb.style.display='inline-flex';
    if(MATES[idx+1]){nb.onclick=()=>loadMate(MATES[idx+1].id);nb.textContent='Next →';}
    else{nb.onclick=()=>switchView('eval-mates');nb.textContent='All Challenges';}
    confetti();toast('♛ Checkmate! +'+puz.xp+' XP','tgld');saveProgress();
  } else if(isCheck(ns,ns.turn)){
    playSound('check');
    setFB('m-fb','fok','✓ Check! Keep going — find the next forcing move.');
  } else if(ST.evalMate.step>=puz.moves.length){
    playSound('lose');
    setFB('m-fb','ferr','❌ Not checkmate yet — the king escaped. The sequence must deliver forced mate. Try again.');
    ST.evalMateStreak=0;shake('m-board');
  } else {
    setFB('m-fb','','Move played. Find the next step towards checkmate.');
  }
}

document.getElementById('btn-mhint').onclick=()=>{
  const p=ST.evalMate.puz;if(!p)return;
  const cm=p.moves[ST.evalMate.step];
  setFB('m-fb','finf','💡 Move the piece on '+cm.from.toUpperCase()+' to '+cm.to.toUpperCase()+'.');
  ST.evalMate.sel=cm.from;drawMate([cm.to]);
};

// ═══════════════════════════════════════════════════════════════
// ENDGAME DRILLS
// ═══════════════════════════════════════════════════════════════
function buildEgGrid(){
  const el=document.getElementById('eval-eg-grid');if(!el)return;el.innerHTML='';
  EG_DRILLS.forEach(d=>{
    const done=ST.evalEgPassed.has(d.id);
    const c=document.createElement('div');c.className='gc'+(done?' done':'');
    c.innerHTML='<div class="gc-d d'+(d.diff||'easy')[0]+'>'+(d.type||d.title||'ENDGAME').toUpperCase()+'</div>'+
        '<div class="gc-t">'+d.title+'</div>'+
        '<div class="gc-s">'+(d.goal||d.desc||'')+'</div>'+
        '<div class="gc-tags"><span class="gct">≤'+(d.limit||30)+' moves</span><span class="gct">+'+d.xp+'XP</span>'+(done?'<span class="gct" style="color:var(--grnl)">✓ Passed</span>':'')+'</div>';
    c.onclick=()=>loadDrill(d.id);el.appendChild(c);
  });
}

function loadDrill(id){
  const d=EG_DRILLS.find(x=>x.id===id);if(!d)return;
  ST.evalEg={st:mkState({...d.pos},d.playerSide),sel:null,drill:d,moves:0,log:[],over:false};
  const _dtype=(d.type||d.title||'ENDGAME').toUpperCase();
  const _dlimit=d.limit||30;
  document.getElementById('eg-lbl').textContent=_dtype;
  document.getElementById('eg-title').textContent=d.title;
  document.getElementById('eg-req').textContent=(d.goal||('You play '+(d.playerSide==='w'?'White':'Black')));
  document.getElementById('eg-it').textContent=d.title;
  document.getElementById('eg-id').textContent=d.desc;
  document.getElementById('eg-lm').textContent=d.limit||30;
  document.getElementById('eg-mv').textContent=0;
  document.getElementById('eg-ps').textContent=ST.evalEgPassed.size;
  document.getElementById('eg-log').textContent='—';
  document.getElementById('eg-res').classList.remove('show');
  setEvalFB('eg-fb','','Make your move. Engine defends at full strength. '+(d.hint||''));
  _wireBoardButtons('btn-egh','btn-egr',
    ()=>{if(ST.evalEg.drill)setEvalFB('eg-fb','finf','💡 '+ST.evalEg.drill.hint);},
    ()=>{if(ST.evalEg.drill)loadDrill(ST.evalEg.drill.id);}
  );
  switchView('eval-egboard');requestAnimationFrame(()=>requestAnimationFrame(drawEg));
}

function drawEg(hints=[]){
  drawEvalBoard('eg-board',ST.evalEg.st,{sel:ST.evalEg.sel,hints});
  if(!ST.evalEg.over){wireEvalBoard('eg-board',onEgClick);addDragSupport('eg-board',onEgClick);}
}

async function onEgClick(s){
  const {st,drill,sel}=ST.evalEg;if(!st||!drill||ST.evalEg.over)return;
  if(!sel){
    if(st.board[s]&&st.board[s][0]===drill.playerSide){
      ST.evalEg.sel=s;
      const hints=legalMoves(st,drill.playerSide).filter(m=>m.from===s).map(m=>m.to);
      drawEg(hints);
    }
    return;
  }
  if(s===sel){ST.evalEg.sel=null;drawEg();return;}
  const lm=legalMoves(st,drill.playerSide);
  const chosen=lm.find(m=>m.from===sel&&m.to===s);
  if(!chosen){ST.evalEg.sel=null;drawEg();setEvalFB('eg-fb','ferr','❌ Illegal move.');return;}
  const ns=applyMove(st,chosen);
  ST.evalEg.moves++;ST.evalEg.log.push({from:sel,to:s,piece:st.board[sel],n:ST.evalEg.moves});
  ST.evalEg.st=ns;ST.evalEg.sel=null;
  document.getElementById('eg-mv').textContent=ST.evalEg.moves;
  updateEgLog();drawEg();
  if(isMate(ns)){egPass();return;}
  if(isStale(ns)){egFail('Stalemate! You drew a won position. Always verify the enemy king has a legal move before delivering the final check.');return;}
  if(isDraw(ns)){egFail('Draw — be careful of the 50-move rule and insufficient material.');return;}
  if(ST.evalEg.moves>=drill.limit){egFail('Move limit reached without checkmate. Try again — aim for the optimal '+drill.optimal+' moves.');return;}
  // Engine defends
  setEvalFB('eg-fb','finf','⏳ Engine thinking...');
  setEng(true);
  const botSide=drill.playerSide==='w'?'b':'w';
  const depth=2; // Strong defensive engine
  const bm=await getBotMove(ns,depth);
  setEng(false);
  if(bm){
    const ns2=applyMove(ns,bm);ST.evalEg.st=ns2;
    ST.evalEg.log.push({from:bm.from,to:bm.to,piece:ns.board[bm.from],n:ST.evalEg.moves+0.5,bot:true});
    updateEgLog();drawEg();
    if(isMate(ns2)){egFail('The engine checkmated you! Avoid leaving your king exposed.');ST.evalEg.over=true;return;}
  }
  setEvalFB('eg-fb','','Move '+ST.evalEg.moves+'/'+(drill.limit||30)+'. '+(drill.hint||''));
}

function egPass(){
  ST.evalEg.over=true;
  if(typeof markEndgameLearned==="function"&&ST.evalEg&&ST.evalEg.drill)markEndgameLearned(ST.evalEg.drill.id);const d=ST.evalEg.drill;
  if(!ST.evalEgPassed.has(d.id)){ST.evalEgPassed.add(d.id);onEvalEgPassed(d.id,d.xp);}
  document.getElementById('eg-ps').textContent=ST.evalEgPassed.size;
  const eff=ST.evalEg.moves<=d.optimal?'⭐⭐⭐':ST.evalEg.moves<=Math.ceil(d.limit*.7)?'⭐⭐':'⭐';
  document.getElementById('eg-stars').textContent=eff;
  document.getElementById('eg-rt').textContent='Drill Passed! ♔';
  document.getElementById('eg-rm').textContent='Checkmate in '+ST.evalEg.moves+' moves!'+(ST.evalEg.moves<=d.optimal?' Perfect — optimal technique!':' Optimal is '+d.optimal+' moves — practice for efficiency.');
  document.getElementById('eg-res').classList.add('show');
  document.getElementById('btn-egretry').onclick=()=>loadDrill(d.id);
  setEvalFB('eg-fb','fgld','♔ Checkmate! Drill passed.');
  confetti();toast('♔ Endgame mastered! +'+d.xp+' XP','tgld');saveProgress();buildEgGrid();
}
function egFail(msg){
  ST.evalEg.over=true;
  document.getElementById('eg-stars').textContent='⭐';
  document.getElementById('eg-rt').textContent='Not yet — try again';
  document.getElementById('eg-rm').textContent=msg;
  document.getElementById('eg-res').classList.add('show');
  document.getElementById('btn-egretry').onclick=()=>loadDrill(ST.evalEg.drill.id);
  setEvalFB('eg-fb','ferr','❌ '+msg);
}
function updateEgLog(){
  const el=document.getElementById('eg-log');
  el.innerHTML=ST.evalEg.log.map(m=>`<span class="${m.bot?'mb':'mw'}">${Math.ceil(m.n)}. ${m.bot?'Engine':'You'}: ${m.piece} ${m.from}→${m.to}</span><br>`).join('');
  el.scrollTop=el.scrollHeight;
}
/* btn-egh wired in loadDrill *//* btn-egr wired in loadDrill */
// ═══════════════════════════════════════════════════════════════
// BOT GAME
// ═══════════════════════════════════════════════════════════════
function buildBotGrid(){
  const el=document.getElementById('bot-grid');el.innerHTML='';
  // Add engine note
  const note=document.createElement('div');
  note.style.cssText='font-size:.7rem;color:var(--mute);padding:8px 14px 0;font-family:IBM Plex Mono,monospace';
  note.textContent='♞ Built-in chess engine · Choose your opponent strength';
  el.appendChild(note);
  BOTS.forEach(b=>{
    const wins=(ST.botWins||{})[b.id]||0;
    const winsLabel=wins>0?`<span style="color:var(--grnl);font-size:.63rem;margin-left:6px">✓ ${wins}W</span>`:'';
    const c=document.createElement('div');c.className='bcrd';
    c.innerHTML=`<span class="bav">${b.ava}</span>
      <div class="bnm">${b.name}${winsLabel}</div>
      <div class="brt">~${b.rating} ELO · depth ${b.depth}</div>
      <div class="bds">${b.desc}</div>
      ${b.hp?`<div class="hp-quip" style="margin-top:4px">${b.hp}</div>`:''}
      <div style="margin-top:8px;font-family:'IBM Plex Mono',monospace;font-size:.59rem;padding:2px 8px;border-radius:9px;background:var(--goldd);color:var(--gold);border:1px solid rgba(200,169,90,.28);display:inline-block">🎩 Wizard's Chess</div>`;
    c.onclick=()=>startBot(b.id);el.appendChild(c);
  });
}

function startBot(id){
  const b=BOTS.find(x=>x.id===id);if(!b)return;
  const initPos={a8:'bR',b8:'bN',c8:'bB',d8:'bQ',e8:'bK',f8:'bB',g8:'bN',h8:'bR',a7:'bP',b7:'bP',c7:'bP',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',a2:'wP',b2:'wP',c2:'wP',d2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP',a1:'wR',b1:'wN',c1:'wB',d1:'wQ',e1:'wK',f1:'wB',g1:'wN',h1:'wR'};
  ST.evalBot={st:mkState(initPos,'w'),sel:null,bot:b,history:[],states:[],coach:[],stats:{cap:0,chk:0},over:false};
  document.getElementById('bg-lbl').textContent='VS '+b.name.toUpperCase();
  document.getElementById('bg-title').textContent='You vs '+b.name;
  document.getElementById('bg-req').textContent='You play White · '+b.name+' ('+b.rating+' ELO, depth '+b.depth+') plays Black';
  document.getElementById('bg-mv').textContent=0;
  document.getElementById('bg-cap').textContent=0;
  document.getElementById('bg-chk').textContent=0;
  document.getElementById('bg-log').innerHTML='Game started.';
  document.getElementById('coach-panel').innerHTML='';
  document.getElementById('bg-res').classList.remove('show');
  document.getElementById('bg-analysis').style.display='none';
  setFB('bg-fb','','Make your first move — you play White.');
  resetClock();
  switchView('eval-bgame');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{drawBot();startClock('w');}));
}

function drawBot(hints=[],last=null){
  drawEvalBoard('bg-board',ST.evalBot.st,{sel:ST.evalBot.sel,hints,last});
  if(!ST.evalBot.over){wireEvalBoard('bg-board', (ST.evalBot as any).analysisMode ? onAnalysisClick : onBotClick);addDragSupport('bg-board', (ST.evalBot as any).analysisMode ? onAnalysisClick : onBotClick);}
}

async function onBotClick(s){
  if(ST.evalBot.over||ST.evalBot.st.turn!=='w')return;
  const {st,sel}=ST.evalBot;
  if(!sel){
    if(st.board[s]&&st.board[s][0]==='w'){
      ST.evalBot.sel=s;
      const hints=legalMoves(st,'w').filter(m=>m.from===s).map(m=>m.to);
      drawBot(hints);
    }
    return;
  }
  if(s===sel){ST.evalBot.sel=null;drawBot();return;}
  const lm=legalMoves(st,'w');
  const chosen=lm.find(m=>m.from===sel&&m.to===s);
  if(!chosen){ST.evalBot.sel=null;drawBot();setFB('bg-fb','ferr','❌ Illegal move.');return;}
  const stB=st;
  const ns=applyMove(st,chosen);
  if(chosen.cap)ST.evalBot.stats.cap++;
  playSound(chosen.cap?'capture':'move');
  if(isCheck(ns,'b')){ST.evalBot.stats.chk++;document.getElementById('bg-chk').textContent=ST.evalBot.stats.chk;playSound('check');}
  const mn=Math.ceil((ST.evalBot.history.length+1)/2);
  ST.evalBot.history.push({...chosen,color:'w',n:mn});
  ST.evalBot.states.push(ns);ST.evalBot.st=ns;ST.evalBot.sel=null;
  document.getElementById('bg-mv').textContent=Math.ceil(ST.evalBot.history.length/2);
  document.getElementById('bg-cap').textContent=ST.evalBot.stats.cap;
  updateBotLog();drawBot([],chosen);
  // Rule-based coaching
  const notes=coachMove(stB,ns,chosen,mn,'w',ST.evalBot.history);
  notes.forEach(n=>addCoachNote(n));
  updateEvalBarFromMaterial(ns.board);haptic(8);
  if(isMate(ns)){endBot('w','You won! Checkmate! ♛','Excellent — you checkmated '+ST.evalBot.bot.name+'!');return;}
  if(isDraw(ns)){endBot('d','Draw!','The game ended in a draw.');return;}
  setFB('bg-fb','finf',ST.evalBot.bot.ava+' '+ST.evalBot.bot.name+' thinking (depth '+ST.evalBot.bot.depth+')...');
  startClock('b');
  setEng(true);
  const bm=await getBotMoveForBot(ns,ST.evalBot.bot);
  setEng(false);
  if(!bm){endBot('w','You won!','No legal moves for the bot.');return;}
  const ns2=applyMove(ns,bm);
  ST.evalBot.history.push({...bm,color:'b',n:mn});ST.evalBot.states.push(ns2);ST.evalBot.st=ns2;
  const _botPieceGlyph=(UNI as any)[ns.board[bm.from]]||'';
  if(_botPieceGlyph)animatePiece('bg-board',bm.from,bm.to,_botPieceGlyph,()=>{});
  updateBotLog();drawBot([],bm);
  if(isMate(ns2)){endBot('b',ST.evalBot.bot.name+' won!','You were checkmated. Review the game log and identify where things went wrong.');return;}
  if(isDraw(ns2)){endBot('d','Draw!','');return;}
  // Material evaluation
  startClock('w');
  let wmat=0,bmat=0;Object.values(ns2.board).forEach(p=>{const v=VALS[p[1]]||0;p[0]==='w'?wmat+=v:bmat+=v;});
  const diff=wmat-bmat;
  const matStr=Math.abs(diff)<50?'Equal position':diff>0?'You are +'+Math.round(diff/100)+' pawns ahead':'You are '+Math.round(-diff/100)+' pawns behind';
  setFB('bg-fb','',matStr+' · Your move.');
  updateEvalBarFromMaterial(ns2.board);
  haptic(8);
}

function endBot(winner,title,msg){
  ST.evalBot.over=true;
  stopClock();
  const analysis=gameAnalysis(ST.evalBot.history,ST.evalBot.states,'w');
  const stars=winner==='w'?'⭐⭐⭐':winner==='d'?'⭐⭐':'⭐';
  document.getElementById('bg-stars').textContent=stars;
  document.getElementById('bg-rt').textContent=title;
  document.getElementById('bg-rm').textContent=msg;
  const ael=document.getElementById('bg-analysis');ael.textContent=analysis;ael.style.display='block';
  document.getElementById('bg-res').classList.add('show');
  document.getElementById('btn-newgame').onclick=()=>startBot(ST.evalBot.bot.id);
  setFB('bg-fb',winner==='w'?'fgld':winner==='d'?'finf':'ferr',title);
  if(winner==='w'){
    confetti();
    onBotGameWon(ST.evalBot.bot?ST.evalBot.bot.rating:300);
    playSound('win');
    if(ST.evalBot.bot){
      if(!ST.botWins)ST.botWins={};
      ST.botWins[ST.evalBot.bot.id]=(ST.botWins[ST.evalBot.bot.id]||0)+1;
    }
    setTimeout(checkAchievements,400);
  } else if(winner==='b'){playSound('lose');}
  const ab = document.getElementById('btn-analyse');
  if (ab) ab.style.display = 'inline-flex';
  // Save to game history
  if(ST.evalBot?.bot&&ST.evalBot?.history){
    saveGameToHistory(winner as any,ST.evalBot.bot.name,ST.evalBot.bot.rating,ST.evalBot.history,ST.evalBot.states||[]);
  }
  // Refresh tournament & frogs
  setTimeout(()=>{buildTournament();buildFrogs();},300);
  // Update eval bar with final position
  if(ST.evalBot?.st?.board)updateEvalBarFromMaterial(ST.evalBot.st.board);
  saveProgress();
}

function addCoachNote(n){
  ST.evalBot.coach.push(n);
  const el=document.getElementById('coach-panel');
  const d=document.createElement('div');d.className='cnote';
  const icon=n.t==='warn'?'⚠️':n.t==='good'?'✓':n.t==='tip'?'💡':'📌';
  const hpHtml=n.hp?`<span class="hp-quip">${n.hp}</span>`:'';
  const body=n.msg?`${n.msg}${hpHtml}`:hpHtml;
  d.innerHTML=`<div class="cnlbl">${icon} ${n.t==='warn'?'Warning':n.t==='good'?'Good':n.t==='tip'?'Tip':'Note'}</div>${body}`;
  el.prepend(d);while(el.children.length>6)el.removeChild(el.lastChild);
}

function updateBotLog(){
  const el=document.getElementById('bg-log');
  const pairs=[];
  const states=ST.evalBot.states;
  for(let i=0;i<ST.evalBot.history.length;i+=2){
    const w=ST.evalBot.history[i],b=ST.evalBot.history[i+1];
    const wBoard=states[i]?states[i].board:ST.evalBot.st.board;
    const bBoard=states[i+1]?states[i+1].board:ST.evalBot.st.board;
    const wAN=moveToAN(wBoard,w);
    const bAN=b?moveToAN(bBoard,b):'';
    pairs.push(`<span class="mw">${Math.ceil((i+2)/2)}. ${wAN}</span>${bAN?` <span class="mb">${bAN}</span>`:''}`);
  }
  el.innerHTML=pairs.join('<br>');el.scrollTop=el.scrollHeight;
}

document.getElementById('btn-resign').onclick=()=>{
  if(!ST.evalBot.over)endBot('b','You resigned.',gameAnalysis(ST.evalBot.history,ST.evalBot.states,'w'));
};
document.getElementById('btn-undo').onclick=()=>{
  if(ST.evalBot.over||ST.evalBot.history.length<2)return;
  ST.evalBot.history.splice(-2);ST.evalBot.states.splice(-2);
  ST.evalBot.st=ST.evalBot.states.length>0?ST.evalBot.states[ST.evalBot.states.length-1]:mkState({a8:'bR',b8:'bN',c8:'bB',d8:'bQ',e8:'bK',f8:'bB',g8:'bN',h8:'bR',a7:'bP',b7:'bP',c7:'bP',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',a2:'wP',b2:'wP',c2:'wP',d2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP',a1:'wR',b1:'wN',c1:'wB',d1:'wQ',e1:'wK',f1:'wB',g1:'wN',h1:'wR'},'w');
  ST.evalBot.sel=null;drawBot();setFB('bg-fb','','Take-back done. Your move.');toast('↩ Take-back','tok');
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS
// ═══════════════════════════════════════════════════════════════
function buildProgress(){
  const el=document.getElementById('prog-body');if(!el)return;el.innerHTML='';
  const secs=[
    {t:'⚔️ Tactics Puzzles',mastered:ST.evalTacSolved.size>=Math.ceil(ALL_PUZZLES.length*.875),how:'Solve 7 of 8 puzzles (87.5%)',
     stats:[{l:'Solved',v:ST.evalTacSolved.size+'/'+ALL_PUZZLES.length,pct:ST.evalTacSolved.size/ALL_PUZZLES.length,col:'var(--gold)'},{l:'Streak',v:ST.streak},{l:'XP',v:ST.xp}]},
    {t:'👑 Checkmate',mastered:ST.evalMateSolved>=MATES.length,how:'Solve all 7 checkmate challenges',
     stats:[{l:'Solved',v:ST.evalMateSolved+'/'+MATES.length,pct:ST.evalMateSolved/MATES.length,col:'var(--grnl)'},{l:'Streak',v:ST.evalMateStreak}]},
    {t:'♔ Endgame Drills',mastered:ST.evalEgPassed.size>=EG_DRILLS.length,how:'Pass all 4 drills within move limits',
     stats:[{l:'Passed',v:ST.evalEgPassed.size+'/'+EG_DRILLS.length,pct:ST.evalEgPassed.size/EG_DRILLS.length,col:'var(--redl)'}]},
  ];
  secs.forEach(sec=>{
    const c=document.createElement('div');
    c.style.cssText='background:var(--s2);border:1px solid var(--bord);border-radius:10px;padding:14px 16px;margin-bottom:11px';
    c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px"><div style="font-family:Cormorant Garamond,serif;font-size:1.02rem;font-weight:700;color:var(--cream)">${sec.t}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:.63rem;color:${sec.mastered?'var(--grnl)':'var(--mute)'}">${sec.mastered?'✅ MASTERED':'IN PROGRESS'}</div></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:6px;margin-bottom:8px">${sec.stats.map(s=>`<div style="background:var(--s3);border-radius:6px;padding:7px;text-align:center"><div style="font-family:Cormorant Garamond,serif;font-size:1.3rem;font-weight:700;color:var(--cream)">${s.v}</div><div style="font-size:.58rem;font-family:'IBM Plex Mono',monospace;color:var(--mute)">${s.l}</div>${s.pct!=null?`<div class="pbar" style="margin-top:4px"><div class="pbf" style="width:${Math.round(s.pct*100)}%;background:${s.col}"></div></div>`:''}</div>`).join('')}</div><div style="font-size:.71rem;font-family:'IBM Plex Mono',monospace;color:${sec.mastered?'var(--grnl)':'var(--mute)'}">How to master: ${sec.how}</div>`;
    el.appendChild(c);
  });
  // Weakness radar
  const wr=document.createElement('div');
  wr.innerHTML=buildWeaknessReport();
  el.appendChild(wr);
  // ELO estimate
  const eloDiv=document.createElement('div');
  eloDiv.style.cssText='background:var(--s2);border:1px solid var(--bord);border-radius:10px;padding:14px 16px;margin-bottom:11px;display:flex;align-items:center;gap:16px';
  eloDiv.innerHTML=`<div><div style="font-family:'IBM Plex Mono',monospace;font-size:.62rem;color:var(--mute);letter-spacing:.1em">ESTIMATED ELO</div><div style="font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--gold)">${estimateElo()}</div></div><div style="font-size:.73rem;color:var(--mute);flex:1">Based on bot wins, puzzles solved, and modules completed. <span style="color:var(--gold);cursor:pointer" onclick="switchView('elo-tracker')">See full tracker →</span></div>`;
  el.appendChild(eloDiv);
  // Engine explanation
  const info=document.createElement('div');
  info.style.cssText='background:var(--s2);border:1px solid rgba(200,169,90,.2);border-radius:10px;padding:14px 16px;font-size:.75rem;color:var(--mute);line-height:1.65';
  info.innerHTML=`<div style="font-family:'IBM Plex Mono',monospace;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:7px">🔧 How Evaluation Works</div><b style="color:var(--cream)">No API · No tokens · Works offline · 100% deterministic</b><br><br>Bot moves use <b style="color:var(--cream)">minimax with alpha-beta pruning</b> — the same algorithm used in every chess engine including Stockfish. Depth 1=~300 ELO, depth 2=~600, depth 3=~900, depth 4=~1200 ELO.<br><br>Coaching feedback is <b style="color:var(--cream)">rule-based and exact</b>: hanging pieces are detected by scanning all opponent replies, castling is tracked move-by-move, doubled pawns are counted per file.`;
  el.appendChild(info);
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR + NAVIGATION
// ═══════════════════════════════════════════════════════════════
// buildSidebar handled by academy

// ntab listeners handled by academy switchView

// ── UTILS ────────────────────────────────────────────────────
// toast() provided by academy
// setFB unified above
function shake(id){const el=document.getElementById(id);if(!el)return;el.style.animation='none';el.offsetHeight;el.style.animation='shake .3s ease';}
function setEng(thinking){
  const dot=document.getElementById('edot'),txt=document.getElementById('etxt');
  if(!dot||!txt)return;
  if(thinking){dot.classList.add('spin');txt.textContent='Engine thinking...';}
  else{dot.classList.remove('spin');txt.textContent='Engine ready';}
}
// confetti() provided by academy

// ── EVAL INIT (called from academy's switchView) ──────────────
function initEvalViews(){
  buildTacGrid(); buildMateGrid(); buildEgGrid(); buildBotGrid();
  updateEvalTopStats();
}
function collapseOpList(){/* no longer used — openings use card grid */}

// ── THEME TOGGLE ──────────────────────────────────────────────────
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isLight ? '☀️' : '🕯️';
  if (isLight) toast('☀️ Lumos! Light mode activated.','tok');
  else toast('🕯️ Nox. The candles are lit.','tok');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// ── SOUND EFFECTS ─────────────────────────────────────────────────
let _audioCtx: AudioContext | null = null;
let _muted = localStorage.getItem('muted') === '1';
function _getAudio(): AudioContext {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _audioCtx;
}
function playSound(type: 'move' | 'capture' | 'check' | 'win' | 'lose') {
  if (_muted) return;
  try {
    const ctx = _getAudio();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    const configs: Record<string, [number, number, number, string]> = {
      move:    [440, 0.07, 0.09, 'sine'],
      capture: [260, 0.13, 0.14, 'sawtooth'],
      check:   [660, 0.11, 0.18, 'square'],
      win:     [523, 0.18, 0.5,  'sine'],
      lose:    [196, 0.13, 0.4,  'sine'],
    };
    const [freq, vol, dur, wave] = configs[type] || configs.move;
    o.type = wave as OscillatorType;
    if (type === 'win') {
      o.frequency.setValueAtTime(523, t);
      o.frequency.setValueAtTime(659, t + 0.13);
      o.frequency.setValueAtTime(784, t + 0.26);
    } else {
      o.frequency.setValueAtTime(freq, t);
    }
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch { /* audio unavailable */ }
}
function toggleMute() {
  _muted = !_muted;
  const btn = document.getElementById('mute-btn');
  if (btn) btn.textContent = _muted ? '🔇' : '🔊';
  localStorage.setItem('muted', _muted ? '1' : '0');
}

// ── DRAG SUPPORT ──────────────────────────────────────────────────
function addDragSupport(boardId: string, clickHandler: (sq: string) => void) {
  const el = document.getElementById(boardId);
  if (!el) return;
  // Ensure touch-action:none on every board so browser never tries to scroll during drag
  el.style.touchAction = 'none';
  let dragSrc: string | null = null;
  let ghost: HTMLElement | null = null;
  let srcEl: HTMLElement | null = null;
  let isDragging = false;
  let startX = 0, startY = 0;
  let hoveredSq: HTMLElement | null = null;

  el.addEventListener('pointerdown', (e: PointerEvent) => {
    const target = (e.target as HTMLElement).closest('[data-sq]') as HTMLElement;
    if (!target) return;
    const piece = target.querySelector('.piece') as HTMLElement;
    if (!piece || !piece.dataset.piece) return;
    dragSrc = target.dataset.sq!;
    srcEl = target;
    startX = e.clientX; startY = e.clientY;
    isDragging = false;
  }, { passive: true });

  el.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragSrc || !srcEl) return;
    // Prevent any residual scroll the moment we start tracking a potential drag
    e.preventDefault();
    const piece = srcEl.querySelector('.piece') as HTMLElement;
    if (!piece?.dataset.piece) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;

    // Only start drag after 8px movement to allow normal taps/clicks
    if (!isDragging && Math.sqrt(dx * dx + dy * dy) > 8) {
      isDragging = true;
      const svg = piece.querySelector('svg');
      const sz = svg ? parseInt(svg.getAttribute('width') || '40') : 40;
      const ghostSz = Math.max(52, Math.round(sz * 1.3));
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.innerHTML = mkPieceSVG(piece.dataset.piece, ghostSz);
      // Position ghost with piece centre slightly above cursor — natural pickup feel
      ghost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;transform:translate(-50%,-62%);left:${e.clientX}px;top:${e.clientY}px;opacity:0.95;filter:drop-shadow(0 8px 20px rgba(0,0,0,.85)) drop-shadow(0 0 8px rgba(200,169,90,.4))`;
      document.body.appendChild(ghost);
      srcEl.style.opacity = '0.18';
    }

    if (isDragging && ghost) {
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';

      // Highlight the square the piece is hovering over
      el.style.pointerEvents = 'none';
      const overEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-sq]') as HTMLElement | null;
      el.style.pointerEvents = '';
      if (overEl !== hoveredSq) {
        hoveredSq?.classList.remove('ssel');
        hoveredSq = null;
        if (overEl && overEl !== srcEl) { overEl.classList.add('ssel'); hoveredSq = overEl; }
      }
    }
  }, { passive: false });

  el.addEventListener('pointerup', (e: PointerEvent) => {
    hoveredSq?.classList.remove('ssel'); hoveredSq = null;
    if (ghost) { ghost.remove(); ghost = null; }
    if (srcEl) { srcEl.style.opacity = ''; }
    const src = dragSrc;
    srcEl = null; dragSrc = null;
    if (!isDragging || !src) { isDragging = false; return; }
    isDragging = false;
    el.style.pointerEvents = 'none';
    const dropEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-sq]') as HTMLElement | null;
    el.style.pointerEvents = '';
    const dropSq = dropEl?.dataset.sq;
    if (dropSq && dropSq !== src) {
      clickHandler(src);
      setTimeout(() => clickHandler(dropSq), 10);
    }
  });

  el.addEventListener('pointercancel', () => {
    hoveredSq?.classList.remove('ssel'); hoveredSq = null;
    if (ghost) { ghost.remove(); ghost = null; }
    if (srcEl) { srcEl.style.opacity = ''; srcEl = null; }
    dragSrc = null; isDragging = false;
  });
}

// ── BOARD FLIP ────────────────────────────────────────────────────
let _boardFlipped = false;
function flipBoard() {
  _boardFlipped = !_boardFlipped;
  if (ST.evalBot) drawBot([], (ST.evalBot as any).lastMove || null);
}

// ── MOVE TO ALGEBRAIC NOTATION ────────────────────────────────────
function moveToAN(board: Record<string,string>, m: any): string {
  if (m.castle === 'K') return 'O-O';
  if (m.castle === 'Q') return 'O-O-O';
  const pc = board[m.from];
  if (!pc) return m.from + m.to;
  const t = pc[1];
  const pieceChar = t === 'P' ? '' : t;
  const cap = m.cap ? 'x' : '';
  const fromFile = t === 'P' && m.cap ? m.from[0] : '';
  const promo = m.promo ? '=' + m.promo[1] : '';
  return pieceChar + fromFile + cap + m.to + promo;
}

// ── ANALYSIS MODE ─────────────────────────────────────────────────
function startAnalysis() {
  if (!ST.evalBot) return;
  ST.evalBot.over = false;
  (ST.evalBot as any).analysisMode = true;
  const ab = document.getElementById('btn-analyse');
  if (ab) ab.style.display = 'none';
  document.getElementById('bg-res')?.classList.remove('show');
  setFB('bg-fb', 'finf', '📖 Analysis mode — play both sides freely. Use Undo to go back.');
  drawBot();
  // Override bot click to allow both colors
  const el = document.getElementById('bg-board');
  if (el) {
    el.querySelectorAll('.sq').forEach(sq => {
      sq.addEventListener('click', () => {
        const s = (sq as HTMLElement).dataset.sq;
        if (s) onAnalysisClick(s);
      });
    });
  }
  wireEvalBoard('bg-board', onAnalysisClick);
}

function onAnalysisClick(s: string) {
  const {st, sel} = ST.evalBot;
  if (!sel) {
    if (st.board[s]) {
      ST.evalBot.sel = s;
      const hints = legalMoves(st, st.turn).filter((m: any) => m.from === s).map((m: any) => m.to);
      drawBot(hints);
    }
    return;
  }
  if (s === sel) { ST.evalBot.sel = null; drawBot(); return; }
  const lm = legalMoves(st, st.turn);
  const chosen = lm.find((m: any) => m.from === sel && m.to === s);
  if (!chosen) { ST.evalBot.sel = null; drawBot(); return; }
  const ns = applyMove(st, chosen);
  ST.evalBot.st = ns; ST.evalBot.sel = null;
  playSound(chosen.cap ? 'capture' : 'move');
  drawBot([], chosen);
  updateBotLog();
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeLesson();
  if (e.key === 't' && !e.ctrlKey && !e.metaKey && !(e.target as HTMLElement).matches('input,textarea')) toggleTheme();
  if (e.key === 'm' && !e.ctrlKey && !e.metaKey && !(e.target as HTMLElement).matches('input,textarea')) toggleMute();
});

// ── SERVICE WORKER ────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── MOBILE NAV ────────────────────────────────────────────────────
function toggleNav() {
  const nav = document.querySelector('.leftnav')!;
  const overlay = document.getElementById('nav-overlay')!;
  const btn = document.getElementById('hamburger')!;
  const open = nav.classList.toggle('open');
  overlay.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
}

// ── PUZZLE UNDO ───────────────────────────────────────────────────
function undoTac() {
  const et = ST.evalTac as any;
  if (!et || !et.history?.length) return;
  et.st = et.history.pop();
  et.moveIdx = Math.max(0, (et.moveIdx || 1) - 1);
  drawTac();
  const fb = document.getElementById('t-fb');
  if (fb) { fb.className = 'fb'; fb.textContent = '↩ Move taken back — try again.'; }
}

// ── CHESS CLOCK ───────────────────────────────────────────────────
let _clockInterval: ReturnType<typeof setInterval> | null = null;
let _clockW = 600;
let _clockB = 600;
let _clockTurn: 'w' | 'b' = 'w';

function _fmtClock(s: number): string {
  const m = Math.floor(Math.abs(s) / 60);
  const sec = Math.abs(s) % 60;
  return (s < 0 ? '-' : '') + m + ':' + String(sec).padStart(2, '0');
}

function _updateClockDisplay() {
  const wEl = document.getElementById('clock-w-time');
  const bEl = document.getElementById('clock-b-time');
  if (wEl) { wEl.textContent = _fmtClock(_clockW); wEl.classList.toggle('low', _clockW < 30); }
  if (bEl) { bEl.textContent = _fmtClock(_clockB); bEl.classList.toggle('low', _clockB < 30); }
}

function startClock(turn: 'w' | 'b') {
  if (_clockInterval) clearInterval(_clockInterval);
  _clockTurn = turn;
  const row = document.getElementById('clock-row');
  if (row) row.style.display = 'flex';
  document.getElementById('clock-w')?.classList.toggle('active', turn === 'w');
  document.getElementById('clock-b')?.classList.toggle('active', turn === 'b');
  _clockInterval = setInterval(() => {
    if (_clockTurn === 'w') _clockW--; else _clockB--;
    _updateClockDisplay();
    const remaining = _clockTurn === 'w' ? _clockW : _clockB;
    if (remaining <= 0) {
      clearInterval(_clockInterval!); _clockInterval = null;
      const loser = _clockTurn === 'w' ? 'You' : ST.evalBot?.bot?.name || 'Bot';
      setFB('bg-fb', 'ferr', `⏰ ${loser} ran out of time!`);
      if (_clockTurn === 'w') playSound('lose'); else playSound('win');
      ST.evalBot.over = true;
    }
  }, 1000);
}

function stopClock() {
  if (_clockInterval) { clearInterval(_clockInterval); _clockInterval = null; }
}

function resetClock() {
  stopClock();
  _clockW = 600; _clockB = 600;
  _updateClockDisplay();
  const row = document.getElementById('clock-row');
  if (row) row.style.display = 'none';
}

// ── ACCESSIBILITY: board aria-current on nav ───────────────────────
// (switchView already sets act class; aria-current added inline below)

// ── EXPOSE GLOBALS FOR onclick= HANDLERS IN index.html ───────────
// ES modules don't leak to window — wire up manually
(window as any).pracHint       = pracHint;
(window as any).pracReset      = pracReset;
(window as any).selectSkill    = selectSkill;
(window as any).startWithSkill = startWithSkill;
(window as any).mkPieceSVG     = mkPieceSVG;
(window as any).getBotMoveForBot=getBotMoveForBot;
(window as any).showSkillChange= showSkillChange;
(window as any).exportSave     = exportSave;
(window as any).importSave     = importSave;
(window as any).switchView     = switchView;
(window as any).closeOpBoard   = closeOpBoard;
(window as any).startQuiz      = startQuiz;
(window as any).closeLesson    = closeLesson;
(window as any).markLessonDone = markLessonDone;
(window as any).toggleTheme    = toggleTheme;
(window as any).toggleMute     = toggleMute;
(window as any).flipBoard      = flipBoard;
(window as any).chess960Shuffle= chess960Shuffle;
(window as any).chess960Start  = chess960Start;
(window as any).startAnalysis  = startAnalysis;
(window as any).toggleNav      = toggleNav;
(window as any).undoTac        = undoTac;
(window as any).ST             = ST;

// ── LOAD PERSISTED PREFERENCES ───────────────────────────────────
if (localStorage.getItem('theme') === 'light') {
  document.documentElement.classList.add('light');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = '☀️'; // Lumos — light mode
}
if (_muted) {
  const btn = document.getElementById('mute-btn');
  if (btn) btn.textContent = '🔇';
}

// ═══════════════════════════════════════════════════════════════
// ── ANIMATED PIECE MOVEMENT ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function animatePiece(boardId:string, fromSq:string, toSq:string, piece:string, cb:()=>void){
  const board=document.getElementById(boardId);if(!board){cb();return;}
  const fromEl=board.querySelector(`[data-sq="${fromSq}"]`) as HTMLElement;
  const toEl=board.querySelector(`[data-sq="${toSq}"]`) as HTMLElement;
  if(!fromEl||!toEl){cb();return;}
  const fromR=fromEl.getBoundingClientRect();const toR=toEl.getBoundingClientRect();
  const fly=document.createElement('div');
  fly.className='piece flying';fly.textContent=piece;
  fly.style.left=fromR.left+'px';fly.style.top=fromR.top+'px';fly.style.fontSize=(fromR.width*.65)+'px';
  document.body.appendChild(fly);
  requestAnimationFrame(()=>{requestAnimationFrame(()=>{
    fly.style.left=toR.left+'px';fly.style.top=toR.top+'px';
  });});
  setTimeout(()=>{fly.remove();cb();},220);
}

// ═══════════════════════════════════════════════════════════════
// ── EVALUATION BAR ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function updateEvalBar(scoreCP:number){
  const fill=document.getElementById('eval-bar-fill');
  const score=document.getElementById('eval-score');
  if(!fill||!score)return;
  const clamped=Math.max(-800,Math.min(800,scoreCP));
  const pct=50+clamped/16;
  fill.style.height=pct+'%';
  const disp=Math.abs(scoreCP)>800?'M':(scoreCP/100).toFixed(1);
  score.textContent=scoreCP>0?'+'+disp:disp;
  score.style.color=scoreCP>50?'var(--grnl)':scoreCP<-50?'var(--redl)':'var(--mute)';
}

// ═══════════════════════════════════════════════════════════════
// ── SHARE RESULT ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function shareResult(){
  const bot=ST.evalBot?.bot;const over=ST.evalBot?.over;
  if(!over){toast('Finish the game first!','t-bad');return;}
  const rt=document.getElementById('bg-rt')?.textContent||'';
  const moves=ST.evalBot?.history?.length||0;
  const text=`♟ Chess Academy — Hogwarts Wizard's Chess\n${rt}\nOpponent: ${bot?.name||'Bot'} (~${bot?.rating||'?'} ELO)\nMoves: ${moves}\n🏰 chess-academy-pi.vercel.app`;
  if(navigator.share){
    navigator.share({title:'Chess Academy',text,url:'https://chess-academy-pi.vercel.app'}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(text).then(()=>toast('📋 Result copied to clipboard!','tok'));
  }
}

// ═══════════════════════════════════════════════════════════════
// ── HAPTIC FEEDBACK ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
let _hapticEnabled=localStorage.getItem('haptic')!=='0';
function haptic(pattern:number|number[]=10){
  if(!_hapticEnabled)return;
  if('vibrate' in navigator)navigator.vibrate(pattern);
}
function toggleHaptic(){
  _hapticEnabled=!_hapticEnabled;
  localStorage.setItem('haptic',_hapticEnabled?'1':'0');
  const btn=document.getElementById('haptic-toggle');
  if(btn){btn.textContent=_hapticEnabled?'On':'Off';btn.classList.toggle('on',_hapticEnabled);}
  haptic(20);
}

// ═══════════════════════════════════════════════════════════════
// ── SETTINGS FAB ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
let _settingsOpen=false;
function toggleSettings(){
  _settingsOpen=!_settingsOpen;
  const p=document.getElementById('settings-panel');if(p)p.style.display=_settingsOpen?'block':'none';
}
document.addEventListener('click',(e)=>{
  if(_settingsOpen){
    const fab=document.getElementById('settings-fab');const panel=document.getElementById('settings-panel');
    if(fab&&panel&&!fab.contains(e.target as Node)&&!panel.contains(e.target as Node)){
      _settingsOpen=false;panel.style.display='none';
    }
  }
});
// Init haptic button
const _hBtn=document.getElementById('haptic-toggle');
if(_hBtn){_hBtn.textContent=_hapticEnabled?'On':'Off';_hBtn.classList.toggle('on',_hapticEnabled);}

// ═══════════════════════════════════════════════════════════════
// ── BOARD SIZE SLIDER ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function setBoardSize(val:string){
  const sz=parseInt(val);
  const boards=['bg-board','t-board','m-board','eg-board','bg-board','prac-board','gtm-board'];
  boards.forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.style.width=sz+'px';el.style.height=sz+'px';}
  });
  localStorage.setItem('boardSize',val);
}
const _savedSz=localStorage.getItem('boardSize');
if(_savedSz){
  setBoardSize(_savedSz);
  const sl=document.getElementById('board-size-slider') as HTMLInputElement;
  if(sl)sl.value=_savedSz;
}

// ═══════════════════════════════════════════════════════════════
// ── COLORBLIND MODE ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
let _colorblind=localStorage.getItem('colorblind')==='1';
function toggleColorblind(){
  _colorblind=!_colorblind;
  document.documentElement.classList.toggle('colorblind',_colorblind);
  localStorage.setItem('colorblind',_colorblind?'1':'0');
  const btn=document.getElementById('cb-toggle');
  if(btn){btn.textContent=_colorblind?'On':'Off';btn.classList.toggle('on',_colorblind);}
  toast(_colorblind?'♿ Colorblind mode on':'Colorblind mode off','tok');
}
if(_colorblind){
  document.documentElement.classList.add('colorblind');
  const btn=document.getElementById('cb-toggle');if(btn){btn.textContent='On';btn.classList.add('on');}
}

// ═══════════════════════════════════════════════════════════════
// ── BLITZ MODE ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
let _blitzTimer:ReturnType<typeof setInterval>|null=null;
let _blitzSec=180;let _blitzIdx=0;let _blitzScore=0;let _blitzPool:any[]=[];

function startBlitz(){
  // Close settings
  _settingsOpen=false;const sp=document.getElementById('settings-panel');if(sp)sp.style.display='none';
  // Pick 5 random puzzles
  const all=[...ALL_PUZZLES];for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]];}
  _blitzPool=all.slice(0,5);_blitzIdx=0;_blitzScore=0;_blitzSec=180;
  const ov=document.getElementById('blitz-overlay');if(ov)ov.style.display='flex';
  _blitzTick();
  if(_blitzTimer)clearInterval(_blitzTimer);
  _blitzTimer=setInterval(()=>{
    _blitzSec--;_blitzTick();
    if(_blitzSec<=0)endBlitz();
  },1000);
  loadBlitzPuzzle();
}
function _blitzTick(){
  const m=Math.floor(_blitzSec/60);const s=_blitzSec%60;
  const el=document.getElementById('blitz-timer');
  if(el){el.textContent=m+':'+(s<10?'0':'')+s;el.classList.toggle('urgent',_blitzSec<=30);}
  const pf=document.getElementById('blitz-pfill');
  if(pf)pf.style.width=Math.round((_blitzIdx/5)*100)+'%';
  const pr=document.getElementById('blitz-progress');
  if(pr)pr.textContent='Puzzle '+(_blitzIdx+1)+' of 5 · Score: '+_blitzScore;
}
function loadBlitzPuzzle(){
  const puz=_blitzPool[_blitzIdx];if(!puz){endBlitz();return;}
  const fb=document.getElementById('blitz-fb');if(fb)fb.textContent='';
  const blitzSt=mkState({...puz.pos},puz.side||'w');
  drawEvalBoard('blitz-board',blitzSt);
  wireEvalBoard('blitz-board',(sq)=>{
    const fb2=document.getElementById('blitz-fb');
    const curSt=mkState({...puz.pos},puz.side||'w');
    if(curSt.board[sq]&&curSt.board[sq][0]===(puz.side||'w')){
      (window as any)._blitzSel=sq;
    } else if((window as any)._blitzSel){
      const from=(window as any)._blitzSel;
      (window as any)._blitzSel=null;
      const m=legalMoves(curSt).find(mv=>mv.from===from&&mv.to===sq);
      if(m&&from===puz.solution.from&&sq===puz.solution.to){
        _blitzScore+=10;haptic([10,50,10]);playSound('win');
        if(fb2)fb2.textContent='✓ Correct! +10';
        _blitzIdx++;setTimeout(()=>_blitzIdx<5?loadBlitzPuzzle():endBlitz(),600);
      } else if(m){
        haptic([200]);playSound('lose');
        if(fb2)fb2.textContent='✗ Not the tactic — next puzzle.';
        _blitzIdx++;setTimeout(()=>_blitzIdx<5?loadBlitzPuzzle():endBlitz(),800);
      }
    }
  });
}
function endBlitz(){
  if(_blitzTimer){clearInterval(_blitzTimer);_blitzTimer=null;}
  const ov=document.getElementById('blitz-overlay');if(ov)ov.style.display='none';
  const bonus=_blitzScore;
  if(bonus>0)addXP(bonus,'🎩 Blitz bonus: +'+bonus+' XP!');
  confetti();
  toast('🎩 Blitz done! Score: '+_blitzScore+'/50','t-gld');
}

// ═══════════════════════════════════════════════════════════════
// ── TOURNAMENT MODE ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function buildTournament(){
  const el=document.getElementById('tournament-bracket');if(!el)return;
  if(!ST.tournamentProgress)ST.tournamentProgress={};
  el.innerHTML='';
  BOTS.forEach((b,i)=>{
    const beaten=(ST.botWins||{})[b.id]>=1;
    const prevBeaten=i===0||(ST.botWins||{})[BOTS[i-1].id]>=1;
    const locked=!prevBeaten&&!beaten;
    const d=document.createElement('div');
    d.className='t-round'+(beaten?' beaten':locked?' locked':'');
    d.innerHTML=`<div class="t-round-ico">${b.ava}</div>
      <div style="flex:1"><div class="t-round-name">${b.name}</div>
      <div class="t-round-sub">~${b.rating} ELO${beaten?' · Defeated ✓':locked?' · Locked 🔒':' · Challenge now'}</div></div>
      <span class="t-round-badge">${beaten?'✓':i+1}</span>`;
    if(!locked)d.onclick=()=>{startBot(b.id);switchView('eval-bgame');};
    el.appendChild(d);
  });
  // Check if all beaten
  const allBeaten=BOTS.every(b=>(ST.botWins||{})[b.id]>=1);
  if(allBeaten){
    const win=document.createElement('div');win.className='t-trophy-screen';
    win.innerHTML='<span class="big-trophy">🏆</span><div style="font-family:Cormorant Garamond,serif;font-size:1.6rem;color:var(--gold)">Hogwarts Chess Champion!</div><div style="font-size:.8rem;color:var(--mute);margin-top:8px">You have defeated all 5 wizard opponents. Dumbledore himself applauds your triumph.</div>';
    el.appendChild(win);
  }
}

// ═══════════════════════════════════════════════════════════════
// ── GAME HISTORY ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function saveGameToHistory(result:'w'|'b'|'d', botName:string, botRating:number, history:any[], states:any[]){
  if(!ST.gameHistory)ST.gameHistory=[];
  const movePgn=history.map((m,i)=>{
    const st=states[i]||{board:{}};
    return (i%2===0?Math.ceil((i+2)/2)+'. ':'')+moveToAN(st.board,m);
  }).join(' ');
  ST.gameHistory.unshift({result,bot:botName,rating:botRating,date:new Date().toLocaleDateString(),moves:history.length,pgn:movePgn});
  if(ST.gameHistory.length>30)ST.gameHistory=ST.gameHistory.slice(0,30);
  saveProgress();
}
function buildGameHistory(){
  const el=document.getElementById('history-list');if(!el)return;
  el.innerHTML='';
  if(!ST.gameHistory||!ST.gameHistory.length){el.innerHTML='<div style="color:var(--mute);font-size:.8rem;padding:16px">No games recorded yet — play a bot game!</div>';return;}
  ST.gameHistory.forEach((g,i)=>{
    const d=document.createElement('div');d.className='history-game';
    const rIcon=g.result==='w'?'W':g.result==='d'?'½':'L';
    const rCls=g.result==='w'?'win':g.result==='d'?'draw':'loss';
    d.innerHTML=`<div class="hg-header"><span class="hg-result ${rCls}">${rIcon}</span><span class="hg-bot">vs ${g.bot} (~${g.rating} ELO)</span><span class="hg-date">${g.date} · ${g.moves} moves</span></div><div class="hg-moves">${g.pgn||'—'}</div>`;
    el.appendChild(d);
  });
}

// ═══════════════════════════════════════════════════════════════
// ── ELO TRACKER ───────────────────────────────────════════════
// ═══════════════════════════════════════════════════════════════
function estimateElo():number{
  let elo=400;
  if(!ST.botWins)return elo;
  const ratings=[300,600,900,1200,1500];
  BOTS.forEach((b,i)=>{const w=(ST.botWins||{})[b.id]||0;if(w>=1)elo=Math.max(elo,ratings[i]+100);});
  const tac=ST.evalTacSolved?.size||0;
  elo+=tac*15;
  elo+=((ST.done?.size||0))*8;
  return Math.min(1800,elo);
}
function buildEloTracker(){
  const cur=estimateElo();
  const peak=ST.eloPeak=Math.max(ST.eloPeak||400,cur);
  const el=document.getElementById('elo-current');if(el)el.textContent=String(cur);
  const pe=document.getElementById('elo-peak');if(pe)pe.textContent=String(peak);
  // Build table from game history
  const tbody=document.getElementById('elo-table-body');
  if(tbody&&ST.gameHistory){
    tbody.innerHTML='';
    ST.gameHistory.slice(0,10).forEach(g=>{
      const delta=g.result==='w'?+30:g.result==='d'?0:-20;
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${g.bot}</td><td>${g.result==='w'?'Win':g.result==='d'?'Draw':'Loss'}</td><td class="elo-delta ${delta>0?'pos':delta<0?'neg':''}">${delta>0?'+':''}${delta}</td><td>${cur}</td>`;
      tbody.appendChild(tr);
    });
  }
  // Simple canvas chart
  const canvas=document.getElementById('elo-canvas') as HTMLCanvasElement;
  if(!canvas)return;
  const hist=ST.eloHistory||[];
  if(!hist.includes(cur)){hist.push(cur);ST.eloHistory=hist.slice(-30);saveProgress();}
  const ctx=canvas.getContext('2d');if(!ctx)return;
  canvas.width=canvas.offsetWidth||400;canvas.height=120;
  if(hist.length<2)return;
  const mn=Math.min(...hist)-50,mx=Math.max(...hist)+50;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#d4a017';ctx.lineWidth=2;ctx.beginPath();
  hist.forEach((v,i)=>{
    const x=i/(hist.length-1)*canvas.width;
    const y=canvas.height-(v-mn)/(mx-mn)*canvas.height;
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.stroke();
  ctx.fillStyle='rgba(212,160,23,.1)';ctx.lineTo(canvas.width,canvas.height);ctx.lineTo(0,canvas.height);ctx.fill();
}

// ═══════════════════════════════════════════════════════════════
// ── WEAKNESS DETECTION ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
// Track wrong puzzle types in ST.weaknesses = {[type]:wrong, [type+'_total']:total}
function trackPuzzleResult(puz:any, correct:boolean){
  if(!ST.weaknesses)ST.weaknesses={};
  const type=puz.type||'general';
  ST.weaknesses[type+'_total']=(ST.weaknesses[type+'_total']||0)+1;
  if(!correct)ST.weaknesses[type]=(ST.weaknesses[type]||0)+1;
}
function buildWeaknessReport():string{
  if(!ST.weaknesses)return'<div style="color:var(--mute);font-size:.8rem;padding:16px">Solve more puzzles to see weakness analysis.</div>';
  const types=Object.keys(ST.weaknesses).filter(k=>!k.endsWith('_total'));
  if(!types.length)return'<div style="color:var(--mute);font-size:.8rem;padding:16px">No data yet.</div>';
  let html='<div class="weakness-wrap"><div style="font-family:Cormorant Garamond,serif;font-size:1.1rem;color:var(--gold);margin-bottom:16px">Tactical Weakness Radar</div>';
  types.forEach(t=>{
    const wrong=ST.weaknesses[t]||0;const total=ST.weaknesses[t+'_total']||1;
    const pct=Math.round(wrong/total*100);const acc=100-pct;
    const cls=acc>=80?'good':acc>=50?'ok':'bad';
    html+=`<div class="weakness-item"><div class="weakness-name">${t}</div><div class="weakness-bar-bg"><div class="weakness-bar-fill ${cls}" style="width:${acc}%"></div></div><div class="weakness-pct">${acc}%</div></div>`;
  });
  html+='</div>';return html;
}

// ═══════════════════════════════════════════════════════════════
// ── CHESS GLOSSARY ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const GLOSSARY=[
  {t:'En Passant',d:'A special pawn capture that can only occur immediately after a pawn moves two squares from its starting position. The capturing pawn moves diagonally to the square the enemy pawn passed through, removing it.',r:'Pawn, Special Moves'},
  {t:'Castling',d:'A special move where the king moves two squares toward a rook, and the rook jumps to the other side of the king. Requires: neither piece has moved, no pieces between them, king not in check.',r:'King Safety, Rook'},
  {t:'Fork',d:'A tactic where one piece attacks two or more enemy pieces simultaneously, forcing the opponent to lose material. The knight is the best forking piece due to its unusual movement.',r:'Knight, Tactics'},
  {t:'Pin',d:'A situation where a piece cannot move because doing so would expose a more valuable piece behind it to attack. An absolute pin is against the king (illegal to move); a relative pin threatens a valuable piece.',r:'Tactics, X-Ray'},
  {t:'Skewer',d:'Like a reverse pin — a valuable piece is attacked, and when it moves, a less valuable piece behind it is captured. "Skewering" the king forces it to move, then the piece behind is taken.',r:'Tactics, Pin'},
  {t:'Discovered Check',d:'A check delivered not by the moving piece, but by a piece that was behind it. The moving piece uncovers an attack by another piece on the king. Can be combined with a threat from the moving piece.',r:'Tactics, Check'},
  {t:'Double Check',d:'Both the moving piece and the piece it uncovers give check simultaneously. Only escape is to move the king — blocking or capturing is impossible. The most forcing tactic in chess.',r:'Discovered Check'},
  {t:'Zwischenzug',d:'German for "in-between move." Instead of responding as expected, a player makes a surprising intermediate move (often a check or threat) that changes the position before completing the expected sequence.',r:'Tactics, Tempo'},
  {t:'Tempo',d:'A "tempo" is one move. "Gaining a tempo" means forcing your opponent to waste a move. In the opening, a tempo lead means better development. "Losing a tempo" means making an extra move that achieves nothing.',r:'Opening, Time'},
  {t:'Gambit',d:'An opening where material (usually a pawn) is sacrificed for compensation, typically development lead, open lines, or structural advantage. Examples: Queen\'s Gambit, King\'s Gambit, Evans Gambit.',r:'Opening, Sacrifice'},
  {t:'Fianchetto',d:'The development of a bishop to g2 (or b2 for White, g7/b7 for Black) after advancing the g- or b-pawn. Creates a long diagonal battery. Common in King\'s Indian, Grünfeld, and Catalan openings.',r:'Bishop, Opening'},
  {t:'Zugzwang',d:'A situation where any move a player makes worsens their position. The player is "obligated to move" but would prefer to pass. Common in king-pawn endgames — the key concept in king opposition.',r:'Endgame, Tempo'},
  {t:'Opposition',d:'When two kings face each other on the same file, rank, or diagonal with an odd number of squares between them. The player who does NOT have to move has the "opposition" — a key endgame concept.',r:'King, Endgame, Zugzwang'},
  {t:'Luft',d:'German for "air." Creating a luft means pushing a pawn in front of your castled king to prevent back-rank mate threats. For example, h3 gives the king an escape square.',r:'King Safety'},
  {t:'Outpost',d:'A square that cannot be attacked by enemy pawns, where a piece (especially a knight) can be permanently stationed. An outpost on d5 or e6 for White is often a decisive positional advantage.',r:'Knight, Pawn Structure'},
  {t:'Isolated Pawn',d:'A pawn with no friendly pawns on adjacent files. It cannot be defended by pawns, making it a static weakness. But it gives the owner an open file and piece activity.',r:'Pawn Structure'},
  {t:'Backward Pawn',d:'A pawn that cannot advance because it would be captured, and cannot be defended by other pawns. It sits on a half-open file, making it a chronic target — especially on d6 in the French Defence.',r:'Pawn Structure'},
  {t:'Passed Pawn',d:'A pawn with no enemy pawns in front of it on its own file or adjacent files. "A passed pawn must be pushed!" (Nimzowitsch). In endgames, a remote passed pawn is often decisive.',r:'Pawn, Endgame'},
  {t:'Rook on 7th',d:'A rook placed on the opponent\'s 7th rank attacks unmoved pawns and traps the enemy king on the back rank. Two rooks on the 7th rank ("pigs on the 7th") are nearly always winning.',r:'Rook, Endgame'},
  {t:'Battery',d:'Two (or more) pieces of the same type (or queen+rook, queen+bishop) lined up on the same file, rank, or diagonal to double their power. Example: two rooks on an open file double-control it.',r:'Coordination'},
  {t:'X-Ray Attack',d:'An attack that works through an intervening piece. The attacker "X-rays" through a piece to threaten what is behind it. Also called a "transparency" — crucial in calculation.',r:'Tactics, Pin'},
  {t:'Triangulation',d:'A king manoeuvre in 3 moves to reach the same square in an even number of moves, transferring the obligation to move to the opponent. Used to achieve zugzwang in king-pawn endgames.',r:'Zugzwang, King, Endgame'},
  {t:'Liquidation',d:'Exchanging pieces to simplify into a winning endgame, or to eliminate the opponent\'s attacking pieces. "When you\'re winning, trade everything" is an oversimplification, but the principle holds.',r:'Endgame, Exchange'},
  {t:'Initiative',d:'The ability to make threats that force the opponent to react. The player with the initiative dictates the pace. "The threat is stronger than the execution" — Nimzowitsch.',r:'Tempo, Attack'},
  {t:'Prophylaxis',d:'Preventing the opponent\'s plan before it happens. Tigran Petrosian was the master of prophylaxis — making neutral-looking moves that preemptively neutralise threats.',r:'Strategy, Defence'},
];

function buildGlossary(filter=''){
  const el=document.getElementById('glossary-list');if(!el)return;
  el.innerHTML='';
  const terms=filter?GLOSSARY.filter(g=>g.t.toLowerCase().includes(filter.toLowerCase())||g.d.toLowerCase().includes(filter.toLowerCase())):GLOSSARY;
  terms.forEach(g=>{
    const d=document.createElement('div');d.className='glossary-term';
    d.innerHTML=`<h4>${g.t}</h4><p>${g.d}</p><div class="gt-related">See also: ${g.r}</div>`;
    el.appendChild(d);
  });
  if(!terms.length)el.innerHTML='<div style="color:var(--mute);font-size:.8rem;padding:12px">No terms found.</div>';
}

// ═══════════════════════════════════════════════════════════════
// ── GUESS THE MOVE ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const MASTER_GAMES=[
  {
    title:"Morphy's Opera Game (1858)",
    players:"Paul Morphy vs Duke of Brunswick",
    info:"The most famous attacking game ever played. Morphy sacrifices material relentlessly to develop pieces.",
    moves:[
      {from:'e2',to:'e4'},{from:'e7',to:'e5'},{from:'g1',to:'f3'},{from:'d7',to:'d6'},
      {from:'d2',to:'d4'},{from:'c8',to:'g4'},{from:'d4',to:'e5'},{from:'g4',to:'f3'},
      {from:'d1',to:'f3'},{from:'d6',to:'e5'},{from:'f1',to:'c4'},{from:'g8',to:'f6'},
      {from:'f3',to:'b3'},{from:'d8',to:'e7'},{from:'b1',to:'c3'},{from:'c7',to:'c6'},
      {from:'c1',to:'g5'},{from:'b7',to:'b5'},{from:'c3',to:'b5'},{from:'c6',to:'b5'},
      {from:'c4',to:'b5'},{from:'b8',to:'d7'},{from:'e1',to:'c1'},{from:'a8',to:'d8'},
      {from:'d1',to:'d7'},{from:'d8',to:'d7'},{from:'h1',to:'d1'},{from:'e7',to:'e6'},
      {from:'b5',to:'d7'},{from:'f6',to:'d7'},{from:'b3',to:'b8',cap:true},{from:'d7',to:'b8'},
      {from:'d1',to:'d8'}
    ],
    annotations:[
      "Morphy opens 1.e4 — central control.","e5 — Black mirrors.","Knight to f3 — develop, attack e5.",
      "d6 defends pawn.","d4 — Open Game!","Bg4 — pins the knight.",
      "dxe5 — exchange."," Bxf3 — Black takes.","Qxf3 — recapture with tempo.",
      "dxe5.","Bc4 — aims at f7.","Nf6 — develops, defends.","Qb3 — double threat!",
      "Qe7 — defends f7.","Nc3 — development.","c6.","Bg5 — pin!","b5 — attack bishop.",
      "Nxb5!! — sacrifice!","cxb5.","Bxb5+ — check!","Nbd7.","0-0-0 — castle queenside!",
      "Rd8.","Rxd7!! — sacrifice!","Rxd7.","Rd1 — all rooks active.",
      "Qe6.","Bxd7+ — tempo.","Nxd7.","Rxb8+!! — final rook sacrifice!","Nxb8.",
      "Rd8# — CHECKMATE! A masterpiece."
    ]
  },
  {
    title:"Fischer's Game of the Century (1956)",
    players:"Donald Byrne vs Robert James Fischer (age 13)",
    info:"13-year-old Bobby Fischer stuns the chess world with a queen sacrifice on move 17.",
    moves:[
      {from:'g1',to:'f3'},{from:'g8',to:'f6'},{from:'c2',to:'c4'},{from:'g7',to:'g6'},
      {from:'b1',to:'c3'},{from:'f8',to:'g7'},{from:'d2',to:'d4'},{from:'e8',to:'g8'},
      {from:'c1',to:'f4'},{from:'d7',to:'d5'},{from:'d1',to:'b3'},{from:'d5',to:'c4'},
      {from:'b3',to:'c4'},{from:'c7',to:'c6'},{from:'e2',to:'e4'},{from:'b8',to:'d7'},
      {from:'a1',to:'d1'},{from:'d7',to:'b6'},{from:'c4',to:'c5'},{from:'b6',to:'g4'},
      {from:'f4',to:'g5'},{from:'f6',to:'a1',cap:true},{from:'e1',to:'g1'},
      {from:'a1',to:'c2',cap:true},{from:'d8',to:'c8'},{from:'g4',to:'e6'},
      {from:'c5',to:'c1'},{from:'e6',to:'g4'},{from:'c1',to:'d1'},{from:'g4',to:'f2'},
      {from:'d1',to:'e1'},{from:'c8',to:'c2'},{from:'c3',to:'d1'},{from:'f2',to:'d3'},
      {from:'e1',to:'e7'},{from:'g8',to:'h8'},{from:'e7',to:'f7'},{from:'c2',to:'e4'}
    ],
    annotations:[
      "Nf3.","Nf6.","c4 — English Opening.","g6 — King's Indian setup.",
      "Nc3.","Bg7.","d4.","0-0 — castled.","Bf4.","d5 — central challenge.",
      "Qb3.","dxc4 — takes gambit.","Qxc4.","c6.","e4 — space.","Nbd7.",
      "Rd1 — development.","Nb6 — repositioning.","Qc5.","Bg4 — pin!",
      "Bg5 — counter-pin.","Nxa1!! — QUEEN SACRIFICE! Fischer takes the rook.",
      "0-0.","Nxc2!! — takes another piece!","Qd8? — Byrne confused.",
      "Bxe6.","Qc1+.","Bg4+.","Qd1+!","Bf2? — forced retreat.",
      "Qe1+!","Rxc2.","Nd1.","Bxd3.",
      "Re7.","Kh8.","Qxf7.","Rxe4 — winning material advantage."
    ]
  },
  {
    title:"Kasparov's Immortal (2000)",
    players:"Garry Kasparov vs Veselin Topalov",
    info:"Called the 'greatest chess game ever played' — Kasparov's Rh1 sacrifice on move 24 is legendary.",
    moves:[
      {from:'e2',to:'e4'},{from:'d7',to:'d6'},{from:'d2',to:'d4'},{from:'g8',to:'f6'},
      {from:'b1',to:'c3'},{from:'g7',to:'g6'},{from:'c1',to:'e3'},{from:'f8',to:'g7'},
      {from:'d1',to:'d2'},{from:'c7',to:'c6'},{from:'f2',to:'f3'},{from:'b7',to:'b5'},
      {from:'g1',to:'e2'},{from:'b8',to:'d7'},{from:'e3',to:'h6'},{from:'g7',to:'h6'},
      {from:'d2',to:'h6'},{from:'c8',to:'b7'},{from:'a2',to:'a3'},{from:'e7',to:'e5'},
      {from:'e1',to:'c1'},{from:'d8',to:'e7'},{from:'c1',to:'b1'},{from:'a7',to:'a6'},
      {from:'e2',to:'c1'},{from:'e8',to:'c8'},{from:'c1',to:'b3'},{from:'e5',to:'d4'},
      {from:'h1',to:'d1'},{from:'d7',to:'b6'}
    ],
    annotations:[
      "e4.","d6 — Pirc defence.","d4.","Nf6.","Nc3.","g6.",
      "Be3.","Bg7 — fianchetto.","Qd2.","c6.","f3 — space.","b5 — counterplay.",
      "Nge2.","Nbd7.","Bxh6!! — piece sacrifice!","Bxh6.","Qxh6 — queen on h6!",
      "Bb7.","a3.","e5 — attack!","0-0-0!! — pawn castle under fire.",
      "Qe7.","Kb1.","a6.","Nc1.","0-0-0.","Nb3.","exd4.",
      "Rxd4!! — rook sacrifice (Topalov accepts).","Nb6."
    ]
  }
];

let _gtmGameIdx=0;let _gtmMoveIdx=0;let _gtmScore=0;let _gtmSt:any=null;let _gtmWaiting=true;
const {mkState:_mk,startPos:_sp,applyMove:_am,legalMoves:_lm}={mkState,startPos,applyMove,legalMoves};

function initGTM(){
  _gtmGameIdx=0;_gtmMoveIdx=0;_gtmScore=0;
  requestAnimationFrame(()=>requestAnimationFrame(()=>renderGTMGame()));
}
function renderGTMGame(){
  const game=MASTER_GAMES[_gtmGameIdx];
  const el=document.getElementById('gtm-title');if(el)el.textContent=game.title;
  const li=document.getElementById('gtm-game-list');
  if(li)li.textContent=MASTER_GAMES.map((g,i)=>(i===_gtmGameIdx?'▶ ':'  ')+g.title).join(' | ');
  // Replay to current move
  _gtmSt=mkState(startPos());
  for(let i=0;i<_gtmMoveIdx;i++){
    const mv=game.moves[i];if(!mv)break;
    const legal=legalMoves(_gtmSt).find(m=>m.from===mv.from&&m.to===mv.to);
    if(legal)_gtmSt=applyMove(_gtmSt,legal);
  }
  drawEvalBoard('gtm-board',_gtmSt);
  wireEvalBoard('gtm-board',onGTMClick);
  addDragSupport('gtm-board',onGTMClick);
  const mn=document.getElementById('gtm-move-num');
  if(mn)mn.textContent=Math.ceil((_gtmMoveIdx+1)/2)+'.'+((_gtmMoveIdx%2===0)?'':', ');
  const sc=document.getElementById('gtm-score');if(sc)sc.textContent=String(_gtmScore);
  const fb=document.getElementById('gtm-fb');
  const ann=game.annotations[_gtmMoveIdx]||'';
  if(fb){fb.textContent='🎯 '+((_gtmMoveIdx===game.moves.length)?'Game complete! '+ann:'Your turn — play the master\'s move. '+(_gtmMoveIdx%2===0?'(White to move)':'(Black to move)'));fb.className='gtm-fb info';}
  _gtmWaiting=_gtmMoveIdx<game.moves.length;
}
function onGTMClick(sq:string){
  if(!_gtmWaiting||!_gtmSt)return;
  const game=MASTER_GAMES[_gtmGameIdx];
  const expected=game.moves[_gtmMoveIdx];if(!expected)return;
  const sel=(window as any)._gtmSel;
  if(!sel){
    if(_gtmSt.board[sq]&&_gtmSt.board[sq][0]===_gtmSt.turn)(window as any)._gtmSel=sq;
    return;
  }
  (window as any)._gtmSel=null;
  const legal=legalMoves(_gtmSt).find(m=>m.from===sel&&m.to===sq);
  const fb=document.getElementById('gtm-fb');
  if(legal&&sel===expected.from&&sq===expected.to){
    _gtmScore+=10;haptic([10,50,10]);playSound('move');
    _gtmSt=applyMove(_gtmSt,legal);_gtmMoveIdx++;
    drawEvalBoard('gtm-board',_gtmSt);
    const ann=game.annotations[_gtmMoveIdx-1]||'Correct!';
    if(fb){fb.textContent='✓ Correct! '+ann;fb.className='gtm-fb correct';}
    const sc=document.getElementById('gtm-score');if(sc)sc.textContent=String(_gtmScore);
    wireEvalBoard('gtm-board',onGTMClick);addDragSupport('gtm-board',onGTMClick);
    if(_gtmMoveIdx>=game.moves.length){
      _gtmWaiting=false;
      if(fb){fb.textContent='🏆 Game complete! Score: '+_gtmScore+'. '+game.info;fb.className='gtm-fb correct';}
      addXP(_gtmScore,'🎯 Guess the Move: +'+_gtmScore+' XP!');
    }
  } else if(legal){
    haptic([200]);playSound('lose');
    if(fb){fb.textContent='✗ Not the master\'s move. The move was '+expected.from+'→'+expected.to+'. '+( game.annotations[_gtmMoveIdx]||'');fb.className='gtm-fb wrong';}
    // Auto-play correct move
    const correct=legalMoves(_gtmSt).find(m=>m.from===expected.from&&m.to===expected.to);
    if(correct){_gtmSt=applyMove(_gtmSt,correct);_gtmMoveIdx++;setTimeout(()=>{drawEvalBoard('gtm-board',_gtmSt);wireEvalBoard('gtm-board',onGTMClick);addDragSupport('gtm-board',onGTMClick);},600);}
  } else {
    if(fb){fb.textContent='Select one of your pieces first.';fb.className='gtm-fb info';}
  }
}
function gtmPrev(){
  if(_gtmMoveIdx<=0)return;_gtmMoveIdx--;renderGTMGame();
}
function gtmSkip(){
  const game=MASTER_GAMES[_gtmGameIdx];const mv=game.moves[_gtmMoveIdx];if(!mv)return;
  const legal=legalMoves(_gtmSt).find(m=>m.from===mv.from&&m.to===mv.to);
  if(legal){_gtmSt=applyMove(_gtmSt,legal);_gtmMoveIdx++;}
  const fb=document.getElementById('gtm-fb');
  const ann=game.annotations[_gtmMoveIdx-1]||'';
  if(fb){fb.textContent='Skipped: '+mv.from+'→'+mv.to+'. '+ann;fb.className='gtm-fb wrong';}
  drawEvalBoard('gtm-board',_gtmSt);wireEvalBoard('gtm-board',onGTMClick);addDragSupport('gtm-board',onGTMClick);
}
function gtmNextGame(){
  _gtmGameIdx=(_gtmGameIdx+1)%MASTER_GAMES.length;_gtmMoveIdx=0;_gtmScore=0;renderGTMGame();
}

// ═══════════════════════════════════════════════════════════════
// ── CHESS 960 ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
let _chess960backRank:string[]=[];
function chess960Generate():string[]{
  const pieces=['R','B','N','Q','K','N','B','R'];
  // Fischer Random: bishops on opposite colours, king between rooks
  let rank:string[]=['','','','','','','',''];
  // Place bishops on opposite color squares
  const b1=Math.floor(Math.random()*4)*2;rank[b1]='B';// dark
  const b2=Math.floor(Math.random()*4)*2+1;rank[b2]='B';// light
  // Place queen on any remaining
  const empty=rank.map((_,i)=>i).filter(i=>!rank[i]);
  const qPos=empty[Math.floor(Math.random()*empty.length)];rank[qPos]='Q';
  // Place knights on 2 of remaining
  const e2=empty.filter(i=>i!==qPos);
  const n1=e2[Math.floor(Math.random()*e2.length)];rank[n1]='N';
  const e3=e2.filter(i=>i!==n1);
  const n2=e3[Math.floor(Math.random()*e3.length)];rank[n2]='N';
  // Remaining 3 squares: R K R (in order)
  const e4=e3.filter(i=>i!==n2).sort((a,b)=>a-b);
  rank[e4[0]]='R';rank[e4[1]]='K';rank[e4[2]]='R';
  return rank;
}
function chess960Preview(rank:string[]){
  const el=document.getElementById('chess960-preview');if(!el)return;
  el.innerHTML='';
  rank.forEach((p,i)=>{
    const sq=document.createElement('div');sq.className='chess960-sq';
    const light=(i+0)%2===1;sq.style.background=light?'var(--lsq)':'var(--dsq)';
    const sym:{[k:string]:string}={R:'♜',B:'♝',N:'♞',Q:'♛',K:'♚',P:'♟'};
    sq.textContent=sym[p]||'';sq.style.color='#1a0a00';
    el.appendChild(sq);
  });
}
function chess960Shuffle(){
  _chess960backRank=chess960Generate();chess960Preview(_chess960backRank);
}
function chess960Start(){
  if(!_chess960backRank.length)_chess960backRank=chess960Generate();
  const rank=_chess960backRank;
  const board:Record<string,string>={};
  const files=['a','b','c','d','e','f','g','h'];
  // Black pieces on rank 8, white on rank 1
  rank.forEach((p,i)=>{board[files[i]+'8']='b'+p;board[files[i]+'1']='w'+p;});
  // Pawns
  files.forEach(f=>{board[f+'7']='bP';board[f+'2']='wP';});
  // Castling disabled in Chess960 — engine assumes a1/h1 rooks (standard only)
  const cast={wK:false,wQ:false,bK:false,bQ:false};
  ST.evalBot={st:mkState(board,'w',cast),sel:null,bot:BOTS[2],history:[],states:[],coach:[],stats:{cap:0,chk:0},over:false};
  ST.evalBot.chess960=true;
  const b=BOTS[2];
  document.getElementById('bg-lbl')!.textContent='CHESS 960';
  document.getElementById('bg-title')!.textContent='Chess960 — Fischer Random';
  document.getElementById('bg-req')!.textContent='Random position · You play White vs '+b.name;
  document.getElementById('bg-log')!.innerHTML='Chess960 started.';
  document.getElementById('coach-panel')!.innerHTML='';
  document.getElementById('bg-res')!.classList.remove('show');
  document.getElementById('bg-analysis')!.style.display='none';
  setFB('bg-fb','','Chess960! Same rules — different starting position. Make your first move.');
  resetClock();drawBot([]);
  switchView('eval-bgame');
}

// ═══════════════════════════════════════════════════════════════
// ── CHOCOLATE FROG CARDS ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const FROG_CARDS=[
  {id:'morphy',icon:'♟',name:'Paul Morphy',fact:'Opera Game genius. Defeated two nobles while they watched opera. Retired at 21.',unlock:'complete 5 lessons'},
  {id:'fischer',icon:'♔',name:'Bobby Fischer',fact:'11th World Champion. 6-0 Candidates matches. Chess960 inventor.',unlock:'pass Level 1 quiz'},
  {id:'kasparov',icon:'⚡',name:'Garry Kasparov',fact:'13th World Champion. Greatest player of all time. Defeated Deep Blue (then lost).',unlock:'earn 500 XP'},
  {id:'tal',icon:'🔥',name:'Mikhail Tal',fact:'The Magician from Riga. World Champion 1960. Known for unsound sacrifices that worked.',unlock:'complete 10 lessons'},
  {id:'capablanca',icon:'♜',name:'José Capablanca',fact:'Cuban prodigy. World Champion 1921-27. Lost only 34 games in his career.',unlock:'master 3 openings'},
  {id:'karpov',icon:'🛡',name:'Anatoly Karpov',fact:'12th World Champion. Master of positional squeeze. Won over 160 tournaments.',unlock:'pass Level 2 quiz'},
  {id:'kramnik',icon:'🏰',name:'Vladimir Kramnik',fact:'14th World Champion. Drew match vs Fritz. Solved the Berlin Defence.',unlock:'earn 1000 XP'},
  {id:'polgar',icon:'👑',name:'Judit Polgár',fact:'Strongest female player ever. Beat Kasparov, Karpov, and Kramnik. Retired 2014.',unlock:'complete 20 lessons'},
  {id:'anand',icon:'⚡',name:'Viswanathan Anand',fact:'15th World Champion. 5-time champion. Fastest calculation in chess history.',unlock:'beat Ron Weasley'},
  {id:'carlsen',icon:'🌟',name:'Magnus Carlsen',fact:'16th World Champion. Peak ELO 2882 — highest ever. Chess Olympiad gold medalist.',unlock:'beat Neville Longbottom'},
  {id:'steinitz',icon:'♗',name:'Wilhelm Steinitz',fact:'1st World Champion 1886. Father of positional chess. Invented the concept of accumulated advantage.',unlock:'complete 15 openings'},
  {id:'lasker',icon:'⚔️',name:'Emanuel Lasker',fact:'2nd World Champion. Held the title 27 years — longest reign in history.',unlock:'beat Viktor Krum'},
  {id:'petrosian',icon:'🛡',name:'Tigran Petrosian',fact:'9th World Champion. Master of prophylaxis — preventing opponent\'s plans before they form.',unlock:'7-day streak'},
  {id:'bronstein',icon:'♞',name:'David Bronstein',fact:'Lost World Championship match by 0.5 points in 1951. Inventor of increment clock.',unlock:'solve 50 puzzles (half)'},
  {id:'nimzowitsch',icon:'📖',name:'Aron Nimzowitsch',fact:'"My System" author. Invented hypermodern opening theory. The Nimzo-Indian bears his name.',unlock:'complete all Level 1 modules'},
  {id:'alekhine',icon:'🐱',name:'Alexander Alekhine',fact:'4th World Champion. Never lost his title. Calculating genius. Owned a cat named Chess.',unlock:'beat McGonagall'},
  {id:'rubinstein',icon:'♜',name:'Akiba Rubinstein',fact:'Never became champion despite deserving it. Rook endgame mastery is legendary.',unlock:'pass Level 3 quiz'},
  {id:'reshevsky',icon:'⏰',name:'Samuel Reshevsky',fact:'Child prodigy who played exhibitions at age 8. Became a top American GM.',unlock:'complete endgame drills'},
  {id:'spassky',icon:'🏅',name:'Boris Spassky',fact:'10th World Champion. Lost to Fischer 1972 in the Match of the Century.',unlock:'beat Dumbledore'},
  {id:'topalov',icon:'🎭',name:'Veselin Topalov',fact:'Victim of Kasparov\'s Immortal. Former world #1. Known for aggressive style.',unlock:'complete all modules'},
];

function checkFrogUnlocks():string[]{
  const unlocked:string[]=[];
  const bw=ST.botWins||{};
  FROG_CARDS.forEach(f=>{
    const u=f.unlock;
    let earned=false;
    if(u.includes('5 lessons'))earned=ST.done?.size>=5;
    else if(u.includes('10 lessons'))earned=ST.done?.size>=10;
    else if(u.includes('15 lessons'))earned=(ST.opsDone?.size||0)>=5;
    else if(u.includes('20 lessons'))earned=ST.done?.size>=20;
    else if(u.includes('all modules'))earned=ST.done?.size>=30;
    else if(u.includes('all Level 1'))earned=MODS.filter(m=>m.level===1).every(m=>ST.done?.has(m.k));
    else if(u.includes('Level 1 quiz'))earned=ST.qzRes?.[1]===true;
    else if(u.includes('Level 2 quiz'))earned=ST.qzRes?.[2]===true;
    else if(u.includes('Level 3 quiz'))earned=ST.qzRes?.[3]===true;
    else if(u.includes('500 XP'))earned=ST.xp>=500;
    else if(u.includes('1000 XP'))earned=ST.xp>=1000;
    else if(u.includes('3 openings'))earned=(ST.opsDone?.size||0)>=3;
    else if(u.includes('Ron'))earned=(bw['b300']||0)>=1;
    else if(u.includes('Neville'))earned=(bw['b600']||0)>=1;
    else if(u.includes('Krum'))earned=(bw['b900']||0)>=1;
    else if(u.includes('McGonagall'))earned=(bw['b1200']||0)>=1;
    else if(u.includes('Dumbledore'))earned=(bw['b1500']||0)>=1;
    else if(u.includes('7-day'))earned=ST.streak>=7;
    else if(u.includes('50 puzzles'))earned=(ST.evalTacSolved?.size||0)>=4;
    else if(u.includes('endgame'))earned=(ST.evalEGSolved||0)>=2;
    if(earned)unlocked.push(f.id);
  });
  return unlocked;
}
function buildFrogs(){
  const el=document.getElementById('frogs-grid');if(!el)return;
  const unlocked=checkFrogUnlocks();
  if(!ST.frogs)ST.frogs=[];
  // Update ST.frogs with newly unlocked (and toast if new)
  unlocked.forEach(id=>{
    if(!ST.frogs.includes(id)){
      ST.frogs.push(id);
      const card=FROG_CARDS.find(f=>f.id===id);
      if(card){toast('🐸 Chocolate Frog! '+card.name+' card collected!','t-gld');confetti();}
      saveProgress();
    }
  });
  const cnt=document.getElementById('frogs-count');
  if(cnt)cnt.textContent=ST.frogs.length+' / '+FROG_CARDS.length+' collected';
  el.innerHTML='';
  FROG_CARDS.forEach(f=>{
    const owned=ST.frogs.includes(f.id);
    const d=document.createElement('div');
    d.className='frog-card'+(owned?' unlocked':' locked');
    if(owned)d.innerHTML=`<span class="frog-icon">${f.icon}</span><div class="frog-name">${f.name}</div><div class="frog-fact">${f.fact}</div><div class="frog-badge">✓</div>`;
    else d.innerHTML=`<span class="frog-icon">🎴</span><div class="frog-name">???</div><div class="frog-fact">${f.unlock}</div>`;
    el.appendChild(d);
  });
}

// ═══════════════════════════════════════════════════════════════
// ── SPACED REPETITION FOR PUZZLES ─────────────────────────────
// ═══════════════════════════════════════════════════════════════
function getNextSRPuzzle():any{
  if(!ST.srData)ST.srData={};
  const now=Date.now();
  // Find puzzles due for review (solved before, interval expired)
  const duePuzzle=ALL_PUZZLES.find(p=>{
    const sr=ST.srData[p.id];
    return sr&&sr.due<=now;
  });
  if(duePuzzle)return duePuzzle;
  // Otherwise return a new unsolved puzzle
  return ALL_PUZZLES.find(p=>!ST.evalTacSolved?.has(p.id));
}
function updateSR(puzzleId:string, correct:boolean){
  if(!ST.srData)ST.srData={};
  const now=Date.now();
  const sr=ST.srData[puzzleId]||{interval:1,ease:2.5,due:0};
  if(correct){
    sr.interval=Math.round(sr.interval*sr.ease);
    sr.ease=Math.min(2.8,sr.ease+0.1);
  } else {
    sr.interval=1;sr.ease=Math.max(1.3,sr.ease-0.2);
  }
  sr.due=now+sr.interval*86400000;
  ST.srData[puzzleId]=sr;
  saveProgress();
}

// ═══════════════════════════════════════════════════════════════
// ── KEYBOARD NAV ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
document.addEventListener('keydown',(e)=>{
  const v=document.querySelector('.view.act');if(!v)return;
  const vid=v.id;
  // Arrow keys in bot game log
  if(vid==='view-eval-bgame'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){
    e.preventDefault();
    const hist=ST.evalBot?.history||[];const states=ST.evalBot?.states||[];
    if(!hist.length)return;
    if(!(ST.evalBot as any).reviewIdx){(ST.evalBot as any).reviewIdx=states.length-1;}
    if(e.key==='ArrowLeft'&&(ST.evalBot as any).reviewIdx>0)(ST.evalBot as any).reviewIdx--;
    else if(e.key==='ArrowRight'&&(ST.evalBot as any).reviewIdx<states.length-1)(ST.evalBot as any).reviewIdx++;
    const idx=(ST.evalBot as any).reviewIdx;
    if(states[idx])drawEvalBoard('bg-board',states[idx],{last:hist[idx]||null});
    const mn=document.getElementById('bg-mv');if(mn)mn.textContent=String(idx);
  }
});

// ═══════════════════════════════════════════════════════════════
// ── SWITCHVIEW: render new views on switch ────────────────────
// ═══════════════════════════════════════════════════════════════
const _origSwitchView=(window as any).switchView;
(window as any).switchView=function(v:string){
  _origSwitchView(v);
  if(v==='tournament')buildTournament();
  if(v==='game-history')buildGameHistory();
  if(v==='elo-tracker'){setTimeout(buildEloTracker,50);}// delay so canvas has layout
  if(v==='glossary')buildGlossary();
  if(v==='chocolate-frogs')buildFrogs();
  if(v==='guess-the-move')initGTM();
  if(v==='chess960')chess960Shuffle();
  if(v==='eval-progress')buildProgress();
};

// ═══════════════════════════════════════════════════════════════
// ── WIRE NEW GLOBALS ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
(window as any).shareResult    = shareResult;
(window as any).toggleSettings = toggleSettings;
(window as any).setBoardSize   = setBoardSize;
(window as any).toggleColorblind= toggleColorblind;
(window as any).toggleHaptic   = toggleHaptic;
(window as any).startBlitz     = startBlitz;
(window as any).endBlitz       = endBlitz;
(window as any).chess960Shuffle= chess960Shuffle;
(window as any).chess960Start  = chess960Start;
(window as any).filterGlossary = buildGlossary;
(window as any).gtmPrev        = gtmPrev;
(window as any).gtmNextGame    = gtmNextGame;
(window as any).gtmSkip        = gtmSkip;

// ═══════════════════════════════════════════════════════════════
// ── HOOK EVAL BAR INTO BOT GAME ───────────────────────────────
// ═══════════════════════════════════════════════════════════════
// After each bot move, evaluate position (fast depth-2 for display)
const _origGetBotMove=getBotMove;
// Update eval bar whenever bot move completes — we use material count as proxy
// (Stockfish eval would need extra UCI comms; material diff is instant & accurate for learning)
function updateEvalBarFromMaterial(board:Record<string,string>){
  let w=0,b=0;
  Object.values(board).forEach(p=>{
    const v=VALS[p[1]]||0;p[0]==='w'?w+=v:b+=v;
  });
  updateEvalBar(w-b);
}

// ═══════════════════════════════════════════════════════════════
// ── SAVE GAME HISTORY ON END ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const _origEndBot=(window as any)._endBotOrig||null;
// Patch endBot to also save game history + eval bar
const _patchedEndBot=function(winner:string,title:string,msg:string){
  if(ST.evalBot?.bot&&ST.evalBot?.history){
    saveGameToHistory(winner as any,ST.evalBot.bot.name,ST.evalBot.bot.rating,ST.evalBot.history,ST.evalBot.states||[]);
    buildTournament(); // refresh tournament progress
    buildFrogs(); // check for new cards
  }
  updateEvalBarFromMaterial(ST.evalBot?.st?.board||{});
};
// We call _patchedEndBot from within endBot — but endBot is already defined.
// We hook it via a separate call in the win tracking block already added.
// Instead, rebuild tournament/frogs whenever we save:
const _origSaveProgress=(window as any)._origSaveProgress||saveProgress;
