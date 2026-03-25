import { RawData } from 'ws';
import { IncomingType, OutgoingType, WsIncomingMessage } from '@shared/types/ws.js';
import { handlersMap } from './handlers';
import { WebSocket } from 'ws';
import { send } from './services/connectionService.js';

export const route = (connection: WebSocket, data: RawData) => {
  const request = JSON.parse(data.toString()) as WsIncomingMessage<IncomingType>;
  const handler = handlersMap[request.type];

  if (!handler) {
    send(connection, OutgoingType.ERROR, { error: true, message: 'Unknown request type' });
    return
  }

  try {
    handler({ connection, data: request.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error(error);
    send(connection, OutgoingType.ERROR, { error: true, message: message });
  }
};
