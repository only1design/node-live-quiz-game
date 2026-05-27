import type { WebSocket } from 'ws';
import { UnexpectedError } from '../errors/unexpectedError.js';
import { usersRepository } from '../repository/users.js';
import { User } from '../types';

export const createUser = (name: string, password: string, connection: WebSocket) => {
  const user = usersRepository.createUser({
    name,
    password,
    ws: connection,
  });

  connection.on('close', () => {
    delete user.ws;
  });

  return user;
};

export const getUserByIndex = (index: User['index']) => {
  const user = usersRepository.getUserByIndex(index);

  if (!user) {
    throw new UnexpectedError('User not found');
  }

  return user;
};
