import { QuestionsSchemaVersion } from '../../server/src/services/gameService.js';
import { IPlayer, IQuestion } from './game.js';

export interface WsMessage {
  type: string;
  data: unknown;
  id: 0;
}

export interface WsIncomingMessage<T extends IncomingType> extends WsMessage {
  type: `${T}`;
  data: IncomingDataMap[T];
}

interface IQuestionsDTO {
  questions: IQuestion[];
}

interface ISchemedQuestionsDTO extends IQuestionsDTO {
  schemaVersion: QuestionsSchemaVersion;
}

interface IGameDTO {
  gameId: string;
}

interface IGameCodeDTO {
  code: string;
}

interface IErrorDTO {
  error: boolean;
  errorText: string;
}

interface IAskQuestionDTO extends Omit<IQuestion, 'correctIndex'> {
  questionNumber: number;
  totalQuestions: number;
}

export interface IPlayerResult {
  name: string;
  answered: boolean;
  correct: boolean;
  pointsEarned: number;
  totalScore: number;
}

export interface IScore {
  name: string;
  score: number;
  rank: number;
}

export interface IncomingDataMap {
  [IncomingType.REG]: { name: string; password: string };
  [IncomingType.CREATE_GAME]: IQuestionsDTO;
  [IncomingType.JOIN_GAME]: IGameCodeDTO;
  [IncomingType.EXPORT_QUESTIONS]: IGameDTO;
  [IncomingType.IMPORT_QUESTIONS]: ISchemedQuestionsDTO & IGameDTO;
  [IncomingType.START_GAME]: IGameDTO;
  [IncomingType.ANSWER]: { questionIndex: number; answerIndex: number } & IGameDTO;
}

export interface OutgoingDataMap {
  [OutgoingType.ERROR]: { error: true, message: string };
  [OutgoingType.REG]: { name: string; index: number | string } & IErrorDTO;
  [OutgoingType.GAME_CREATED]: IGameDTO & {
    code: string;
  };
  [OutgoingType.GAME_JOINED]: IGameDTO;
  [OutgoingType.PLAYER_JOINED]: {
    playerName: string;
    playerCount: number;
  };
  [OutgoingType.UPDATE_PLAYERS]: IPlayer[];
  [OutgoingType.QUESTIONS_EXPORTED]: ISchemedQuestionsDTO;
  [OutgoingType.QUESTIONS_IMPORTED]: IGameDTO & {
    totalQuestions: number;
  };
  [OutgoingType.QUESTION]: IAskQuestionDTO;
  [OutgoingType.ANSWER_ACCEPTED]: { questionIndex: number };
  [OutgoingType.QUESTION_RESULT]: {
    questionIndex: number;
    correctIndex: number;
    playerResults: IPlayerResult[];
  };
  [OutgoingType.GAME_FINISHED]: {
    scoreboard: IScore[];
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
