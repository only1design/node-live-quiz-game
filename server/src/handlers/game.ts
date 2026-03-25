import {
  requireCurrentQuestion,
  requireHost,
  requireInProgress,
  requireNotHost,
  requireNotJoined,
  requireNotStarted,
  requirePlayer,
  requirePlayersJoined,
} from '../guards/gameGuard.js';
import { requireNotAnswered } from '../guards/roundGuard.js';
import { addDisposableListener, getUserByConnection, send } from '../services/connectionService.js';
import {
  createGame,
  getGameByCode,
  getGameById,
  getLifecycleController,
  importQuestions,
  joinUserToGame,
  lastQuestionsSchemaVersion,
  onPlayerListChange,
  startGame,
  terminateGame,
} from '../services/gameService.js';
import { saveQuestionAnswer, onPendingPlayersChange } from '../services/roundService.js';
import { IncomingType, OutgoingType } from '../types';
import { validateQuestions } from '../validation/gameValidation.js';
import { HandlerArgs } from './index';

export const createGameHandle = ({ data, connection }: HandlerArgs<IncomingType.CREATE_GAME>) => {
  const { questions } = data;

  const host = getUserByConnection(connection);

  validateQuestions(questions);

  const game = createGame(host.index, questions);

  send(connection, OutgoingType.GAME_CREATED, { gameId: game.id, code: game.code });
};

export const joinGame = ({ data, connection }: HandlerArgs<IncomingType.JOIN_GAME>) => {
  const { code } = data;

  const game = getGameByCode(code);
  const user = getUserByConnection(connection);
  const controller = getLifecycleController(game);

  requireNotStarted(game);
  requireNotJoined(user, game);
  requireNotHost(user, game);

  joinUserToGame(user, game);

  send(connection, OutgoingType.GAME_JOINED, { gameId: game.id });

  addDisposableListener(connection, 'close', () => onPlayerListChange(game), controller);
};

export const exportQuestions = ({
  data,
  connection,
}: HandlerArgs<IncomingType.EXPORT_QUESTIONS>) => {
  const { gameId } = data;

  const host = getUserByConnection(connection);
  const game = getGameById(gameId);

  requireHost(host, game);

  send(connection, OutgoingType.QUESTIONS_EXPORTED, {
    questions: game.questions,
    schemaVersion: lastQuestionsSchemaVersion,
  });
};

export const importQuestionsHandler = ({
  data,
  connection,
}: HandlerArgs<IncomingType.IMPORT_QUESTIONS>) => {
  const { gameId, schemaVersion, questions } = data;

  const host = getUserByConnection(connection);
  const game = getGameById(gameId);

  requireHost(host, game);
  requireNotStarted(game);
  validateQuestions(questions, schemaVersion);

  importQuestions(game, questions);

  send(connection, OutgoingType.QUESTIONS_IMPORTED, {
    gameId: game.id,
    totalQuestions: game.questions.length,
  });
};

export const startGameHandle = ({ data, connection }: HandlerArgs<IncomingType.START_GAME>) => {
  const { gameId } = data;

  const game = getGameById(gameId);
  const host = getUserByConnection(connection);
  const controller = getLifecycleController(game);

  requireHost(host, game);
  requireNotStarted(game);
  requirePlayersJoined(game, 2);

  startGame(game);

  addDisposableListener(connection, 'close', () => terminateGame(game), controller);
};

export const answerHandler = ({ data, connection }: HandlerArgs<IncomingType.ANSWER>) => {
  const { questionIndex, answerIndex, gameId } = data;

  const player = getUserByConnection(connection);
  const game = getGameById(gameId);

  requireInProgress(game);
  requirePlayer(player, game);
  requireCurrentQuestion(game, questionIndex);
  requireNotAnswered(player, game);

  saveQuestionAnswer(game, player.index, answerIndex);

  send(connection, OutgoingType.ANSWER_ACCEPTED, { questionIndex });

  onPendingPlayersChange(game);
};
