import { IGame, GameStatus } from '@shared/types/game.js';
import { UnexpectedError } from '../errors/unexpectedError.js';
import { IUser } from '../repository/users.js';

export const requireHost = (user: IUser, game: IGame) => {
  if (user.index !== game.hostId) {
    throw new UnexpectedError('User is not the host of this game');
  }
};

export const requireNotHost = (user: IUser, game: IGame) => {
  if (user.index === game.hostId) {
    throw new UnexpectedError('User is the host of this game');
  }
};

export const requireNotJoined = (user: IUser, game: IGame) => {
  if (game.players.map((player) => player.index).includes(user.index)) {
    throw new UnexpectedError('User is already a player of this game');
  }
};

export const requirePlayer = (user: IUser, game: IGame) => {
  if (!game.players.map((player) => player.index).includes(user.index)) {
    throw new UnexpectedError('User is not a player of this game');
  }
};

export const requireNotStarted = (game: IGame) => {
  if (game.status !== GameStatus.WAITING) {
    throw new UnexpectedError('Game is not in waiting');
  }
};

export const requireInProgress = (game: IGame) => {
  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new UnexpectedError('Game is not in progress');
  }
};

export const requireCurrentQuestion = (game: IGame, questionIndex: IGame['currentQuestion']) => {
  if (game.currentQuestion !== questionIndex) {
    throw new UnexpectedError('Invalid question index');
  }
};

export const requirePlayersJoined = (game: IGame, min: number) => {
  if (game.players.length < min) {
    throw new UnexpectedError('Not enough players joined');
  }
};
