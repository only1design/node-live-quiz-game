import { UnexpectedError } from '../errors/unexpectedError.js';
import { Game, User } from '../types';

export const requireNotAnswered = (user: User, game: Game) => {
  if (game?.playerAnswers?.get(user.index)) {
    throw new UnexpectedError('User already answered this question');
  }
};
