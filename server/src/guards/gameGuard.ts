import { UnexpectedError } from '../errors/unexpectedError.js';
import { Game, GameStatus, User } from '../types';

export const requireHost = (user: User, game: Game) => {
  if (user.index !== game.hostId) {
    throw new UnexpectedError('User is not the host of this game');
  }
};

export const requireNotHost = (user: User, game: Game) => {
  if (user.index === game.hostId) {
    throw new UnexpectedError('User is the host of this game');
  }
};

export const requireNotJoined = (user: User, game: Game) => {
  if (game.players.map((player) => player.index).includes(user.index)) {
    throw new UnexpectedError('User is already a player of this game');
  }
};

export const requirePlayer = (user: User, game: Game) => {
  if (!game.players.map((player) => player.index).includes(user.index)) {
    throw new UnexpectedError('User is not a player of this game');
  }
};

export const requireNotStarted = (game: Game) => {
  if (game.status !== GameStatus.WAITING) {
    throw new UnexpectedError('Game is not in waiting');
  }
};

export const requireInProgress = (game: Game) => {
  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new UnexpectedError('Game is not in progress');
  }
};

export const requireCurrentQuestion = (game: Game, questionIndex: Game['currentQuestion']) => {
  if (game.currentQuestion !== questionIndex) {
    throw new UnexpectedError('Invalid question index');
  }
};

export const requirePlayersJoined = (game: Game, min: number) => {
  if (game.players.length < min) {
    throw new UnexpectedError('Not enough players joined');
  }
};
