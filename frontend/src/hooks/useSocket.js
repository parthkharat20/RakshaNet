/**
 * WebSocket Hook for RakshaNet Command Center.
 * Connects to /ws/alerts and receives real-time push events from the backend.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

const WS_BASE = `ws://${window.location.hostname}:8000/ws/alerts`;
const RECONNECT_DELAY_MS = 3000;
const PING_INTERVAL_MS = 25000;

export const useSocket = (onEvent) => {
  const wsRef = useRef(null);
  const pingTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const onEventRef = useRef(onEvent);

  // Keep the callback ref fresh
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    // Don't create multiple connections
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to RakshaNet real-time feed');
        setIsConnected(true);

        // Start heartbeat ping
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event_type === 'pong') return; // Ignore pong responses
          if (onEventRef.current) {
            onEventRef.current(data);
          }
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[WS] Connection closed:', event.code, event.reason);
        setIsConnected(false);
        cleanup();

        // Auto-reconnect after delay
        reconnectTimerRef.current = setTimeout(() => {
          console.log('[WS] Attempting reconnection...');
          connect();
        }, RECONNECT_DELAY_MS);
      };

      ws.onerror = (error) => {
        console.error('[WS] WebSocket error:', error);
        ws.close();
      };
    } catch (err) {
      console.error('[WS] Failed to create WebSocket:', err);
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      cleanup();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, cleanup]);

  return { isConnected };
};

export default useSocket;
