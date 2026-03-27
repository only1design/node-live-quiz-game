import type WebSocket from 'ws';
import { UnexpectedError } from '../errors/unexpectedError.js';
import { usersRepository } from '../repository/users';
import { OutgoingDataMap, OutgoingType } from '../types';

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
  const user = usersRepository.getUserByWs(ws);

  if (user === undefined) {
    throw new UnexpectedError('User is not logged in');
  }

  return user;
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
