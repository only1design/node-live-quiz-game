import { UnexpectedError } from '../errors/unexpectedError.js';
import { usersRepository } from '../repository/users.js';

export const getUserByIndex = (index: number | string) => {
  const user = usersRepository.getUserByIndex(Number(index));

  if (!user) {
    throw new UnexpectedError('User not found');
  }

  return user;
};
