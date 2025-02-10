import { enhancedSocket, useSportsBookStore, WsMessageType } from '@my-org/common';

let marketSubscriptions: (() => void)[] = [];
let eventSubscriptions: (() => void)[] = [];

export const setupSocketSubscriptions = () => {
    const store = useSportsBookStore.getState();
    const { events, handlePriceChange, handleEventUpdate } = store;

    // Cleanup existing subscriptions first
    cleanupSocketListeners();

    // Subscribe to all unique markets
    const uniqueMarkets = new Set(events.flatMap((event) => event.markets.map((market) => market.id)));

    console.log('🎮 [SB] Setting up market subscriptions:', Array.from(uniqueMarkets));
    uniqueMarkets.forEach((marketId) => {
        const unsubscribe = enhancedSocket.subscribeToMarket(marketId, (message: any) => {
            console.log(`🎮 [SB] Received update for market ${marketId}:`, message);

            if (message.type === WsMessageType.SelectionPriceChange) {
                handlePriceChange(message.payload.eventId, message.payload);
            }
        });
        marketSubscriptions.push(unsubscribe);
    });

    // Subscribe to all events for status updates
    console.log(
        '🎮 [SB] Setting up event subscriptions:',
        events.map((e) => e.id),
    );
    events.forEach((event) => {
        const unsubscribe = enhancedSocket.subscribeToEvent(event.id, (message: any) => {
            console.log(`🎮 [SB] Received update for event ${event.id}:`, message);

            if (message.type === WsMessageType.EventStatusUpdate) {
                handleEventUpdate(message.payload);
            }
        });
        eventSubscriptions.push(unsubscribe);
    });
};

export const initializeSocketListeners = () => {
    setupSocketSubscriptions();
};

export const cleanupSocketListeners = () => {
    console.log('🎮 [SB] Cleaning up socket listeners');
    marketSubscriptions.forEach((unsubscribe) => unsubscribe());
    eventSubscriptions.forEach((unsubscribe) => unsubscribe());
    marketSubscriptions = [];
    eventSubscriptions = [];
};
