import { io } from 'socket.io-client';
import type { WebSocketMessage } from '../types';
import { WsMessageType } from '../types';

// Track active subscriptions
const activeSubscriptions = new Map<string, () => void>();

// Track last seen revision per channel
const lastSeenRevisions = new Map<string, number>();

// Helper to log messages to the appropriate logger
const logMessage = (source: 'bo' | 'sb', direction: 'in' | 'out', event: string, data: any) => {
  const key = `ws-logger-${source === 'bo' ? 'back-office' : 'sportsbook'}`;
  // @ts-expect-error TODO add description
  if ((window as any)[key]?.addMessage) {
    // @ts-expect-error TODO add description
    (window as any)[key].addMessage(direction, event, data);
  }
};

// Type guard for WebSocket messages
const isValidMessage = (data: any): data is WebSocketMessage<any> => {
  return (
    data &&
    typeof data === 'object' &&
    'type' in data &&
    'payload' in data &&
    Object.values(WsMessageType).includes(data.type as WsMessageType)
  );
};

// Create socket with improved configuration
const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
  autoConnect: true,
  forceNew: true,
  reconnection: true
});

// Enhanced socket wrapper with better connection handling
export const enhancedSocket = {
  socket,
  
  subscribeToMarket: (marketId: number, callback: (data: WebSocketMessage<any>) => void) => {
    const channel = `*:Market:${marketId}`;
    
    if (!channel.match(/^\*:Market:\d+$/)) {
      console.error('Invalid market channel format:', channel);
      return () => {
        //
      };
    }
    
    logMessage('sb', 'out', 'subscribe', { channel });

    // Get last seen revision for this channel
    const lastRevision = lastSeenRevisions.get(channel) || 0;
    
    // Send subscription request with last seen revision
    socket.emit('subscribe', { channel, lastRevision });
    
    const handler = (data: any) => {
      console.log('DEBUG', data);
      try {
        if (!isValidMessage(data)) {
          console.warn(`Invalid message format received on channel ${channel}:`, data);
          return;
        }

        // Update last seen revision
        lastSeenRevisions.set(channel, data?.revision ?? 0);

        logMessage('sb', 'in', channel, data);
        callback(data);
      } catch (error) {
        console.error('Error in market subscription callback:', error);
      }
    };

    socket.on(channel, handler);
    
    const cleanup = () => {
      socket.off(channel, handler);
      activeSubscriptions.delete(channel);
    };
    activeSubscriptions.set(channel, cleanup);

    return cleanup;
  },

  subscribeToEvent: (eventId: number, callback: (data: WebSocketMessage<any>) => void) => {
    const channel = `*:Event:${eventId}`;
    
    if (!channel.match(/^\*:Event:\d+$/)) {
      console.error('Invalid event channel format:', channel);
      return () => {
        //
      };
    }
    
    logMessage('sb', 'out', 'subscribe', { channel });

    // Get last seen revision for this channel
    const lastRevision = lastSeenRevisions.get(channel) || 0;
    
    // Send subscription request with last seen revision
    socket.emit('subscribe', { channel, lastRevision });
    
    const handler = (data: any) => {
      try {
        if (!isValidMessage(data)) {
          console.warn(`Invalid message format received on channel ${channel}:`, data);
          return;
        }

        // Update last seen revision
        lastSeenRevisions.set(channel, data?.revision ?? 0);

        logMessage('sb', 'in', channel, data);
        callback(data);
      } catch (error) {
        console.error('Error in event subscription callback:', error);
      }
    };

    socket.on(channel, handler);
    
    const cleanup = () => {
      socket.off(channel, handler);
      activeSubscriptions.delete(channel);
    };
    activeSubscriptions.set(channel, cleanup);

    return cleanup;
  },
  
  emitPriceUpdate: (marketId: number, data: WebSocketMessage<any>) => {
    try {
      const channel = `*:Market:${marketId}`;
      
      if (!channel.match(/^\*:Market:\d+$/)) {
        throw new Error('Invalid market channel format');
      }
      
      if (!isValidMessage(data)) {
        throw new Error('Invalid message format for price update');
      }
      
      logMessage('bo', 'out', channel, data);
      socket.emit('market:update', channel, data);
    } catch (error) {
      console.error('Error emitting price update:', error);
      throw error;
    }
  },

  emitEventUpdate: (eventId: number, data: WebSocketMessage<any>) => {
    try {
      const channel = `*:Event:${eventId}`;
      
      if (!channel.match(/^\*:Event:\d+$/)) {
        throw new Error('Invalid event channel format');
      }
      
      if (!isValidMessage(data)) {
        throw new Error('Invalid message format for event update');
      }
      
      logMessage('bo', 'out', channel, data);
      socket.emit('event:update', channel, data);
    } catch (error) {
      console.error('Error emitting event update:', error);
      throw error;
    }
  },

  getActiveSubscriptions: () => Array.from(activeSubscriptions.keys()),

  cleanupAllSubscriptions: () => {
    activeSubscriptions.forEach(cleanup => cleanup());
    activeSubscriptions.clear();
  }
};

// Connection lifecycle events
socket.on('connect', () => {
  console.log('Connected to WebSocket server with ID:', socket.id);
  logMessage('bo', 'in', 'connect', { id: socket.id });
  logMessage('sb', 'in', 'connect', { id: socket.id });
});

socket.on('connect_error', (error) => {
  console.warn('WebSocket connection error:', error.message);
  logMessage('bo', 'in', 'connect_error', { error: error.message });
  logMessage('sb', 'in', 'connect_error', { error: error.message });
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from WebSocket server:', reason);
  logMessage('bo', 'in', 'disconnect', { reason });
  logMessage('sb', 'in', 'disconnect', { reason });
  enhancedSocket.cleanupAllSubscriptions();
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  logMessage('bo', 'in', 'error', { error: error.message });
  logMessage('sb', 'in', 'error', { error: error.message });
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected to WebSocket server after', attemptNumber, 'attempts');
  logMessage('bo', 'in', 'reconnect', { attemptNumber });
  logMessage('sb', 'in', 'reconnect', { attemptNumber });
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Attempting to reconnect:', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.warn('WebSocket reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('WebSocket reconnection failed');
  enhancedSocket.cleanupAllSubscriptions();
});

export { socket };