import { IGame, IPlayer, IQuestion } from '@shared/types/game.js';

export interface IPlayerAnswer {
  playerId: IPlayer['index'];
  optionsIndex: IQuestion['correctIndex'];
  timestamp: number;
}

export interface IRound {
  gameId: IGame['id'];
  questionIndex: IGame['currentQuestion'];
  startedAt: number;
  playerAnswers: Record<IPlayer['index'], IPlayerAnswer>;
  timer: NodeJS.Timeout;
}

const rounds = new Map<IGame['id'], IRound>();

export const roundsRepository = {
  createRound: (
    gameId: IGame['id'],
    questionIndex: IGame['currentQuestion'],
    timer: NodeJS.Timeout
  ) => {
    const newRound: IRound = {
      gameId,
      questionIndex,
      timer,
      startedAt: Date.now(),
      playerAnswers: {},
    };

    rounds.set(gameId, newRound);

    return newRound;
  },
  deleteRound: (gameId: IGame['id']) => rounds.delete(gameId),
  getRoundByGameId: (gameId: IGame['id']) => rounds.get(gameId),
};
