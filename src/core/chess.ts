// Pure chess engine — no DOM dependencies, fully testable
export const FL = 'abcdefgh';

export function fi(sq: string): number { return FL.indexOf(sq[0]); }
export function ri(sq: string): number { return 8 - parseInt(sq[1]); }
export function sq(f: number, r: number): string { return FL[f] + (8 - r); }
export function ok(f: number, r: number): boolean { return f >= 0 && f < 8 && r >= 0 && r < 8; }

export function mkState(board: Record<string,string>, turn: string='w', cast: any={wK:true,wQ:true,bK:true,bQ:true}, ep: string|null=null, half: number=0) {
  return {board:{...board},turn,cast:{...cast},ep,half};
}
export function clone(st: any) { return mkState({...st.board},st.turn,{...st.cast},st.ep,st.half); }
export function kingPos(st: any, c: string): string|null {
  const e = Object.entries(st.board).find(([,p]:any) => p === c+'K');
  return e ? e[0] : null;
}
export function pieces(st: any, c: string): [string,string][] {
  return (Object.entries(st.board) as [string,string][]).filter(([,p]) => p[0] === c);
}

function pawnMoves(st: any, s: string, f: number, r: number, c: string, opp: string, mvs: any[], capOnly: boolean) {
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
function jumpMoves(st: any, s: string, f: number, r: number, c: string, opp: string, mvs: any[], deltas: number[][], capOnly: boolean) {
  for(const [df,dr] of deltas){
    if(!ok(f+df,r+dr)) continue;
    const ts=sq(f+df,r+dr),occ=st.board[ts];
    if(!occ||occ[0]===opp){if(!capOnly||occ)mvs.push({from:s,to:ts,cap:!!occ});}
  }
}
function slideMoves(st: any, s: string, f: number, r: number, c: string, opp: string, mvs: any[], dirs: number[][], capOnly: boolean) {
  for(const [df,dr] of dirs){
    let cf=f+df,cr=r+dr;
    while(ok(cf,cr)){
      const ts=sq(cf,cr),occ=st.board[ts];
      if(occ){if(occ[0]===opp)mvs.push({from:s,to:ts,cap:true});break;}
      if(!capOnly)mvs.push({from:s,to:ts});cf+=df;cr+=dr;
    }
  }
}
function kingMoves(st: any, s: string, f: number, r: number, c: string, opp: string, mvs: any[], capOnly: boolean) {
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

function genAll(st: any, c: string, capOnly=false): any[] {
  const mvs: any[]=[], opp=c==='w'?'b':'w';
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

export function applyMove(st: any, m: any): any {
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

export function attacked(st: any, s: string, byC: string): boolean {
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

export function isCheck(st: any, c: string): boolean { const kp=kingPos(st,c);return kp?attacked(st,kp,c==='w'?'b':'w'):true; }
export function isMate(st: any): boolean { return isCheck(st,st.turn)&&legalMoves(st).length===0; }
export function isStale(st: any): boolean { return !isCheck(st,st.turn)&&legalMoves(st).length===0; }
export function isDraw(st: any): boolean {
  if(isStale(st)||(st.half||0)>=100) return true;
  const ps=Object.values(st.board) as string[];
  if(ps.length===2) return true;
  if(ps.length===3&&ps.some(p=>p[1]==='B'||p[1]==='N')) return true;
  return false;
}
export function legalMoves(st: any, c?: string): any[] {
  const col=c||st.turn;
  return genAll(st,col).filter((m:any)=>{const ns=applyMove(st,m);return !isCheck(ns,col);});
}

export function startPos(): Record<string,string> {
  return {
    a8:'bR',b8:'bN',c8:'bB',d8:'bQ',e8:'bK',f8:'bB',g8:'bN',h8:'bR',
    a7:'bP',b7:'bP',c7:'bP',d7:'bP',e7:'bP',f7:'bP',g7:'bP',h7:'bP',
    a2:'wP',b2:'wP',c2:'wP',d2:'wP',e2:'wP',f2:'wP',g2:'wP',h2:'wP',
    a1:'wR',b1:'wN',c1:'wB',d1:'wQ',e1:'wK',f1:'wB',g1:'wN',h1:'wR'
  };
}
