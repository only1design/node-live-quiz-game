import { WebSocketServer } from 'ws';
import { route } from "./router";
import { attachHeartbeat, onUserDisconnect } from "./services/connectionService";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  console.log('Client connected');
  attachHeartbeat(ws);

  ws.on('message', (data) => {
    route(ws, data);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    onUserDisconnect(ws);
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
