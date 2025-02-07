import { create } from 'zustand';
import { enhancedSocket } from '../socket/socket';
import type { SubscriptionSource, WebSocketMessage, EventUpdatePayload, SelectionPriceChangePayload } from '../types';
import { WsMessageType } from '../types';
import { useSportsBookStore } from '../events/useEventsStore';

interface SubscriptionState {
  // Track sources per channel
  subscriptions: Map<string, Set<SubscriptionSource>>;
  // Track actual WebSocket subscriptions
  activeSubscriptions: Map<string, () => void>;
  
  addSubscription: (channel: string, source: SubscriptionSource) => void;
  removeSubscription: (channel: string, source: SubscriptionSource) => void;
  getChannelSources: (channel: string) => Set<SubscriptionSource>;
  getSubscriptionSummary: () => Array<{
    channel: string;
    sources: SubscriptionSource[];
  }>;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()((set, get) => ({
  subscriptions: new Map(),
  activeSubscriptions: new Map(),

  addSubscription: (channel, source) => {
    const store = useSportsBookStore.getState();
    
    set(state => {
      const newSubscriptions = new Map(state.subscriptions);
      const newActiveSubscriptions = new Map(state.activeSubscriptions);

      // Add source to tracking
      if (!newSubscriptions.has(channel)) {
        newSubscriptions.set(channel, new Set());
      }
      newSubscriptions.get(channel)!.add(source);
      
      // Create actual WebSocket subscription only if it doesn't exist
      if (!state.activeSubscriptions.has(channel)) {
        console.log(`📡 Creating new WebSocket subscription for ${channel} from ${source}`);
        
        if (channel.startsWith('*:Event:')) {
          const eventId = parseInt(channel.split(':')[2], 10);
          const cleanup = enhancedSocket.subscribeToEvent(eventId, (message: WebSocketMessage<EventUpdatePayload>) => {
            if (message.type === WsMessageType.EventStatusUpdate) {
              store.handleEventUpdate(message.payload);
            }
          });
          newActiveSubscriptions.set(channel, cleanup);
        } 
        else if (channel.startsWith('*:Market:')) {
          const marketId = parseInt(channel.split(':')[2], 10);
          const cleanup = enhancedSocket.subscribeToMarket(marketId, (message: WebSocketMessage<SelectionPriceChangePayload>) => {
            if (message.type === WsMessageType.SelectionPriceChange) {
              const event = store.events.find(e => 
                e.markets.some(m => m.id === message.payload.marketId)
              );
              if (event) {
                store.handlePriceChange(event.id, message.payload);
              }
            }
          });
          newActiveSubscriptions.set(channel, cleanup);
        }
      }

      return { 
        subscriptions: newSubscriptions,
        activeSubscriptions: newActiveSubscriptions
      };
    });
  },

  removeSubscription: (channel, source) => {
    set(state => {
      const newSubscriptions = new Map(state.subscriptions);
      const newActiveSubscriptions = new Map(state.activeSubscriptions);
      const sources = newSubscriptions.get(channel);
      
      if (sources) {
        sources.delete(source);
        console.log(`📡 Removed source ${source} from ${channel}, remaining sources:`, sources.size);
        
        // If no sources left, remove channel and cleanup WebSocket subscription
        if (sources.size === 0) {
          newSubscriptions.delete(channel);
          
          const cleanup = state.activeSubscriptions.get(channel);
          if (cleanup) {
            console.log(`📡 Cleaning up WebSocket subscription for ${channel}`);
            cleanup();
            newActiveSubscriptions.delete(channel);
          }
        }
      }
      
      return { 
        subscriptions: newSubscriptions,
        activeSubscriptions: newActiveSubscriptions
      };
    });
  },

  getChannelSources: (channel) => {
    return get().subscriptions.get(channel) || new Set();
  },

  getSubscriptionSummary: () => {
    const { subscriptions } = get();
    return Array.from(subscriptions.entries())
      .map(([channel, sources]) => ({
        channel,
        sources: Array.from(sources)
      }))
      .sort((a, b) => a.channel.localeCompare(b.channel));
  },

  clear: () => {
    const { activeSubscriptions } = get();
    // Cleanup all WebSocket subscriptions
    activeSubscriptions.forEach(cleanup => cleanup());
    set({ 
      subscriptions: new Map(),
      activeSubscriptions: new Map()
    });
  }
}));