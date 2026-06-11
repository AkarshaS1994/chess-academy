export interface Board { [square: string]: string }

export interface CastleRights { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean }

export interface GameState {
  board: Board;
  turn: 'w' | 'b';
  cast: CastleRights;
  ep: string | null;
  half: number;
}

export interface Move {
  from: string;
  to: string;
  cap?: boolean;
  castle?: 'K' | 'Q';
  promo?: string;
  ep?: boolean;
  dbl?: boolean;
}

export interface Bot {
  id: string;
  name: string;
  elo: number;
  depth: number;
  desc: string;
  icon?: string;
}

export interface Puzzle {
  id: string;
  title: string;
  desc: string;
  type: string;
  diff: string;
  xp: number;
  pos: Board;
  side: 'w' | 'b';
  solution: { from: string; to: string };
  hint: string;
}

export interface ModTab {
  id: string;
  label: string;
  content: string;
}

export interface PracticeExercise {
  title: string;
  desc: string;
  board: Board;
  turn: 'w' | 'b';
  solution: string[];
  hint: string;
}

export interface Mod {
  k: string;
  name: string;
  desc: string;
  icon: string;
  level: number;
  xp: number;
  type: string;
  data: any[];
  practice?: PracticeExercise[];
}

export interface AppState {
  xp: number;
  lv: number;
  streak: number;
  skillLevel: string | null;
  done: Set<string>;
  qzRes: Record<string, any>;
  varsDone: Record<string, boolean>;
  opsDone: Set<string>;
  qlv: number;
  evalTacSolved: Set<string>;
  evalMateSolved: number;
  evalMateStreak: number;
  evalEgPassed: Set<string>;
  practiceDone: Set<string>;
  totalQ: number;
  totalCorrect: number;
  curOp: string;
  curVar: string;
  board: Board;
  step: number;
  sel: string | null;
  hint: boolean;
  qstep: number;
  qans: any[];
  curMod: string | null;
  evalTac: any;
  evalMate: any;
  evalEg: any;
  evalBot: any;
  achievements?: any[];
  tacticsLearned?: Record<string, boolean>;
  endgamesLearned?: Record<string, boolean>;
  stageUnlocked?: Record<number, boolean>;
  qzWrong?: Record<string, any>;
  lastSave?: number;
  streak_date?: string;
}
