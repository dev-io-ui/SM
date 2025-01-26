import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface WebSocketContextType {
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  prices: Record<string, number>;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const subscribedSymbols = useRef<Set<string>>(new Set());
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const { token } = useSelector((state: RootState) => state.auth);

  const connect = () => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}?token=${token}`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Resubscribe to all symbols
      subscribedSymbols.current.forEach(symbol => {
        wsRef.current?.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      handleReconnect();
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'price') {
          setPrices(prev => ({
            ...prev,
            [data.symbol]: data.price
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  };

  const handleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current += 1;

    console.log(`Attempting to reconnect in ${backoffTime}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

    reconnectTimeout.current = setTimeout(() => {
      connect();
    }, backoffTime);
  };

  const subscribe = (symbol: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      subscribedSymbols.current.add(symbol);
      connect();
      return;
    }

    if (!subscribedSymbols.current.has(symbol)) {
      subscribedSymbols.current.add(symbol);
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  };

  const unsubscribe = (symbol: string) => {
    subscribedSymbols.current.delete(symbol);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token]);

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe, prices, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
