import type { WebSocket } from 'ws';
import { User } from '../types';

let userIndex = 0;
const getUniqueUserIndex = () => String(userIndex++);

const users: User[] = [];

export const usersRepository = {
  getUserByName: (name: string) => users.find((user) => user.name === name),
  getUserByIndex: (index: string) => users.find((user) => user.index === index),
  getUserByWs: (ws: WebSocket) => users.find((user) => user.ws === ws),
  createUser: (user: Omit<User, 'index'>) => {
    const newUser: User = { ...user, index: getUniqueUserIndex() };
    users.push(newUser);
    return newUser;
  },
};
