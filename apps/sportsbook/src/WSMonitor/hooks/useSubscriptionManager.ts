import { useCallback } from 'react';
import type { SubscriptionSource } from '@my-org/common';
import { enhancedSocket, useSubscriptionStore } from '@my-org/common';

import { useSportsBookStore } from '../../events/useEventsStore';

// Track active socket subscriptions
const activeSocketSubscriptions = new Set<string>();

export const useSubscriptionManager = () => {
    const store = useSportsBookStore.getState();
    const subscriptionStore = useSubscriptionStore();

    const addEventSubscription = useCallback((eventId: number, source: SubscriptionSource) => {
        const channel = `*:Event:${eventId}`;

        // Add source to store
        subscriptionStore.addSubscription(channel, source);

        // Only create socket subscription if it doesn't exist yet
        if (!activeSocketSubscriptions.has(channel)) {
            console.log(`📡 Creating new socket subscription for ${channel}`);
            activeSocketSubscriptions.add(channel);

            enhancedSocket.subscribeToEvent(eventId, (message) => {
                if (message.type === 'EventStatusUpdate') {
                    store.handleEventUpdate(message.payload);
                }
            });
        }

        return () => {
            subscriptionStore.removeSubscription(channel, source);

            // Only remove socket subscription if no sources left
            const remainingSources = subscriptionStore.getChannelSources(channel);
            if (remainingSources.size === 0) {
                console.log(`📡 Removing socket subscription for ${channel}`);
                activeSocketSubscriptions.delete(channel);
                enhancedSocket.socket.off(channel);
            }
        };
    }, []);

    const addMarketSubscription = useCallback((marketId: number, source: SubscriptionSource) => {
        const channel = `*:Market:${marketId}`;

        // Add source to store
        subscriptionStore.addSubscription(channel, source);

        // Only create socket subscription if it doesn't exist yet
        if (!activeSocketSubscriptions.has(channel)) {
            console.log(`📡 Creating new socket subscription for ${channel}`);
            activeSocketSubscriptions.add(channel);

            enhancedSocket.subscribeToMarket(marketId, (message) => {
                if (message.type === 'SelectionPriceChange') {
                    const event = store.events.find((e) => e.markets.some((m) => m.id === message.payload.marketId));
                    if (event) {
                        store.handlePriceChange(event.id, message.payload);
                    }
                }
            });
        }

        return () => {
            subscriptionStore.removeSubscription(channel, source);

            // Only remove socket subscription if no sources left
            const remainingSources = subscriptionStore.getChannelSources(channel);
            if (remainingSources.size === 0) {
                console.log(`📡 Removing socket subscription for ${channel}`);
                activeSocketSubscriptions.delete(channel);
                enhancedSocket.socket.off(channel);
            }
        };
    }, []);

    return {
        addEventSubscription,
        addMarketSubscription,
        getSubscriptionSummary: subscriptionStore.getSubscriptionSummary,
    };
};
