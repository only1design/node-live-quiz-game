import { UnexpectedError } from '../errors/unexpectedError.js';
import { usersRepository } from '../repository/users.js';
import { User } from '../types';

export const getUserByIndex = (index: User['index']) => {
  const user = usersRepository.getUserByIndex(index);

  if (!user) {
    throw new UnexpectedError('User not found');
  }

  return user;
};
