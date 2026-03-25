import { UnexpectedError } from '../errors/unexpectedError.js';
import { IRound } from '../repository/round.js';
import { IUser } from '../repository/users.js';

export const requireNotAnswered = (user: IUser, round: IRound) => {
  if (round.playerAnswers[user.index]) {
    throw new UnexpectedError('User already answered this question');
  }
};
