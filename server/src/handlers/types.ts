import { IncomingDataMap, IncomingType } from '@shared/types/ws.js';
import type WebSocket from 'ws';

export interface IHandlerArgs<T extends IncomingType> {
  data: IncomingDataMap[T];
  connection: WebSocket;
}
