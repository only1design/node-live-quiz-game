export interface IPlayer {
  name: string;
  index: number | string; // unique player id
  score: number;
}

export interface IQuestion {
  text: string;
  options: string[]; // exactly 4 options
  correctIndex: number; // index of the correct option (0-3)
  timeLimitSec: number; // time limit for the question in seconds
}

export interface IGame {
  id: string;
  code: string; // 6-character alphanumeric code
  hostId: number | string;
  questions: IQuestion[];
  players: IPlayer[];
  currentQuestion: number; // index of current question (-1 before start)
  status: GameStatus;
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}
