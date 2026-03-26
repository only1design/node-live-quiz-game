import { useEffect, useRef, useState, useCallback } from 'react';
import type { WSMessage } from '../types';

const RECONNECT_DELAY = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

export const useWebSocket = (url: string, onMessage: (message: WSMessage) => void) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const onMessageRef = useRef(onMessage);
  const [isConnected, setIsConnected] = useState(false);

  onMessageRef.current = onMessage;

  useEffect(() => {
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      const socket = new WebSocket(url);

      socket.onopen = () => {
        if (cancelled) return;
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        if (cancelled) return;
        try {
          const message = JSON.parse(event.data) as WSMessage;
          console.log('Received message:', message);
          onMessageRef.current(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      socket.onerror = () => {
        if (cancelled) return;
        // onerror is always followed by onclose, reconnect logic is there
      };

      socket.onclose = () => {
        if (cancelled) return;
        console.log('WebSocket disconnected');
        setIsConnected(false);

        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          console.log(`Reconnecting (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      ws.current = socket;
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        type,
        data,
        id: 0,
      };
      console.log('Sending message:', message);
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  return {
    isConnected,
    sendMessage,
  };
};
