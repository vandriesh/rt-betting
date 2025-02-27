import React from 'react';
import { enhancedSocket } from '@my-org/common';
import { WsMessageType, type SelectionPriceChangePayload } from '@my-org/common';

import { useEventsStore } from './useEventsStore';

export const usePriceUpdate = (eventId: number) => {
    const { updateSelectionPrice } = useEventsStore();
    const [updating, setUpdating] = React.useState<number | null>(null);
    const [updateDirection, setUpdateDirection] = React.useState<'up' | 'down' | null>(null);
    const pendingUpdateRef = React.useRef<{
        marketId: number;
        selectionId: number;
        price: number;
        direction: 'up' | 'down';
    } | null>(null);
    const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        // Subscribe to market updates for this event to handle confirmations
        const cleanups = new Set<() => void>();

        const event = useEventsStore.getState().events.find((e) => e.id === eventId);
        if (event) {
            event.markets.forEach((market) => {
                const cleanup = enhancedSocket.subscribeToMarket(market.id, (message) => {
                    if (message.type === WsMessageType.SelectionPriceChange) {
                        const payload = message.payload as SelectionPriceChangePayload;
                        if (pendingUpdateRef.current?.selectionId === payload.selectionId) {
                            // Clear updating state when we receive confirmation
                            setUpdating(null);
                            setUpdateDirection(null);
                            pendingUpdateRef.current = null;
                        }
                    }
                });
                cleanups.add(cleanup);
            });
        }

        return () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    }, [eventId]);

    const handlePriceUpdate = React.useCallback(
        (marketId: number, selectionId: number, newPrice: number, direction: 'up' | 'down') => {
            updateSelectionPrice(eventId, marketId, selectionId, newPrice);
            pendingUpdateRef.current = { marketId, selectionId, price: newPrice, direction };

            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                if (pendingUpdateRef.current) {
                    const { marketId, selectionId, price, direction } = pendingUpdateRef.current;
                    setUpdating(selectionId);
                    setUpdateDirection(direction);

                    const payload: SelectionPriceChangePayload = {
                        marketId,
                        selectionId: Number(selectionId),
                        eventId,
                        price,
                    };

                    // Use market-based channel for price updates
                    enhancedSocket.emitPriceUpdate(marketId, {
                        type: WsMessageType.SelectionPriceChange,
                        payload,
                    });

                    // Set a safety timeout to clear the spinner if we don't get a response
                    setTimeout(() => {
                        if (pendingUpdateRef.current?.selectionId === selectionId) {
                            setUpdating(null);
                            setUpdateDirection(null);
                            pendingUpdateRef.current = null;
                        }
                    }, 3000);
                }
            }, 300);
        },
        [eventId, updateSelectionPrice],
    );

    React.useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return {
        updating,
        updateDirection,
        handlePriceUpdate,
    };
};
