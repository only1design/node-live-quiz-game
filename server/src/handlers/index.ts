import type WebSocket from 'ws';
import { IncomingDataMap, IncomingType } from '../types';
import {
  answerHandler,
  createGameHandle,
  exportQuestions,
  importQuestionsHandler,
  joinGame,
  startGameHandle,
} from './game.js';
import { register } from './register.js';

export interface HandlerArgs<T extends IncomingType> {
  data: IncomingDataMap[T];
  connection: WebSocket;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler = (args: { connection: WebSocket; data: any }) => void;

export const handlersMap: Record<IncomingType, Handler> = {
  [IncomingType.REG]: register,
  [IncomingType.CREATE_GAME]: createGameHandle,
  [IncomingType.JOIN_GAME]: joinGame,
  [IncomingType.EXPORT_QUESTIONS]: exportQuestions,
  [IncomingType.IMPORT_QUESTIONS]: importQuestionsHandler,
  [IncomingType.START_GAME]: startGameHandle,
  [IncomingType.ANSWER]: answerHandler,
};
