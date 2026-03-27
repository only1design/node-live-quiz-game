import type { WebSocket } from 'ws';
import { QuestionsSchemaVersion } from './services/gameService';

export interface Player {
  name: string;
  index: string;
  score: number;
  ws?: WebSocket;
  hasAnswered?: boolean;
  answerTime?: number;
  answeredCorrectly?: boolean;
}

export interface PlayerResult {
  name: string;
  answered: boolean;
  correct: boolean;
  pointsEarned: number;
  totalScore: number;
}

export interface Score {
  name: string;
  score: number;
  rank: number;
}

export interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
}

export interface Game {
  id: string;
  code: string;
  hostId: string;
  questions: Question[];
  players: Player[];
  currentQuestion: number;
  status: GameStatus;
  questionStartTime?: number;
  questionTimer?: NodeJS.Timeout;
  playerAnswers?: Map<string, { answerIndex: number; timestamp: number }>;
}

export interface User {
  name: string;
  password: string;
  index: string;
  ws?: WebSocket;
}

export interface WSMessage {
  type: string;
  data: any;
  id: number;
}

export interface WsIncomingMessage<T extends IncomingType> extends WSMessage {
  type: `${T}`;
  data: IncomingDataMap[T];
}

export interface RegData {
  name: string;
  password: string;
}

export interface CreateGameData {
  questions: Question[];
}

export interface JoinGameData {
  code: string;
}

export interface ExportGameData {
  gameId: string;
}

export interface ImportGameData {
  gameId: string;
  schemaVersion: QuestionsSchemaVersion;
  questions: Question[];
}

export interface StartGameData {
  gameId: string;
}

export interface AnswerData {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
}

export interface IncomingDataMap {
  [IncomingType.REG]: RegData;
  [IncomingType.CREATE_GAME]: CreateGameData;
  [IncomingType.JOIN_GAME]: JoinGameData;
  [IncomingType.EXPORT_QUESTIONS]: ExportGameData;
  [IncomingType.IMPORT_QUESTIONS]: ImportGameData;
  [IncomingType.START_GAME]: StartGameData;
  [IncomingType.ANSWER]: AnswerData;
}

export interface OutgoingDataMap {
  [OutgoingType.ERROR]: { error: true; message: string };
  [OutgoingType.REG]: {
    name: string;
    index: number | string;
    error: boolean;
    errorText: string;
  };
  [OutgoingType.GAME_CREATED]: {
    gameId: string;
    code: string;
  };
  [OutgoingType.GAME_JOINED]: {
    gameId: string;
  };
  [OutgoingType.PLAYER_JOINED]: {
    playerName: string;
    playerCount: number;
  };
  [OutgoingType.UPDATE_PLAYERS]: Pick<Player, 'name' | 'index' | 'score'>[];
  [OutgoingType.QUESTIONS_EXPORTED]: {
    schemaVersion: QuestionsSchemaVersion;
    questions: Question[];
  };
  [OutgoingType.QUESTIONS_IMPORTED]: {
    gameId: string;
    totalQuestions: number;
  };
  [OutgoingType.QUESTION]: Omit<Question, 'correctIndex'> & {
    questionNumber: number;
    totalQuestions: number;
  };
  [OutgoingType.ANSWER_ACCEPTED]: { questionIndex: number };
  [OutgoingType.QUESTION_RESULT]: {
    questionIndex: number;
    correctIndex: number;
    playerResults: PlayerResult[];
  };
  [OutgoingType.GAME_FINISHED]: {
    scoreboard: Score[];
  };
}

export enum IncomingType {
  REG = 'reg',
  CREATE_GAME = 'create_game',
  JOIN_GAME = 'join_game',
  EXPORT_QUESTIONS = 'export_questions',
  IMPORT_QUESTIONS = 'import_questions',
  START_GAME = 'start_game',
  ANSWER = 'answer',
}

export enum OutgoingType {
  ERROR = 'error',
  REG = 'reg',
  GAME_CREATED = 'game_created',
  GAME_JOINED = 'game_joined',
  PLAYER_JOINED = 'player_joined',
  UPDATE_PLAYERS = 'update_players',
  QUESTIONS_EXPORTED = 'questions_exported',
  QUESTIONS_IMPORTED = 'questions_imported',
  QUESTION = 'question',
  ANSWER_ACCEPTED = 'answer_accepted',
  QUESTION_RESULT = 'question_result',
  GAME_FINISHED = 'game_finished',
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}
