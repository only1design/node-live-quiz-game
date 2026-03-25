import { OutgoingDataMap, OutgoingType } from '@shared/types/ws.js';
import type WebSocket from 'ws';
import { UnexpectedError } from '../errors/unexpectedError.js';
import { IUser } from '../repository/users.js';

const connectionToUserMap = new Map<WebSocket, IUser>();
const userToConnectionMap = new Map<IUser, WebSocket>();

export const associateUserWithConnection = (ws: WebSocket, user: IUser) => {
  connectionToUserMap.set(ws, user);
  userToConnectionMap.set(user, ws);
};

export const onUserDisconnect = (ws: WebSocket) => {
  const user = connectionToUserMap.get(ws);

  if (user) {
    connectionToUserMap.delete(ws);
    userToConnectionMap.delete(user);
  }
};

export const attachHeartbeat = (ws: WebSocket) => {
  let isAlive = true;

  const pingInterval = setInterval(() => {
    if (!isAlive) {
      return ws.terminate();
    }

    isAlive = false;
    ws.ping();
  }, 30_000);

  ws.on('pong', () => {
    isAlive = true;
  });

  ws.on('close', () => clearInterval(pingInterval));
};

export const getUserByConnection = (ws: WebSocket) => {
  const user = connectionToUserMap.get(ws);

  if (user === undefined) {
    throw new UnexpectedError('User is not logged in');
  }

  return user;
};

export const getConnectionByUser = (user: IUser) => {
  return userToConnectionMap.get(user);
};

export const send = <T extends OutgoingType>(ws: WebSocket, type: T, data: OutgoingDataMap[T]) => {
  const response = JSON.stringify({ type, data, id: 0 });
  ws.send(response);
};

export const broadcast = <T extends OutgoingType>(
  connections: WebSocket[],
  type: T,
  data: OutgoingDataMap[T]
) => {
  connections.forEach((connection) => send(connection, type, data));
};

export const addDisposableListener = (
  ws: WebSocket,
  event: string,
  listener: () => void,
  controller: AbortController
) => {
  ws.on(event, listener);
  controller.signal.addEventListener('abort', () => ws.off(event, listener));
};
