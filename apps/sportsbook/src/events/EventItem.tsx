import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, Clock, Lock } from 'lucide-react';

import type { Selection } from '@my-org/common';
import { useSubscriptionStore } from '@my-org/common';

import { useSportsBookStore } from '@my-org/common';

interface EventItemProps {
    id: number;
    source: 'event_list' | 'event_betslip';
}

export const EventItem = React.memo(({ id, source }: EventItemProps) => {
    const event = useSportsBookStore(React.useCallback((state) => state.events.find((e) => e.id === id), [id]));
    const priceChanges = useSportsBookStore((state) => state.priceChanges);
    const bets = useSportsBookStore((state) => state.bets);
    const { addBet, removeBet } = useSportsBookStore();
    const { addSubscription, removeSubscription } = useSubscriptionStore();

    // Subscribe to event updates with source
    React.useEffect(() => {
        console.log(`📡 [${source}] Setting up subscriptions for event ${event?.id}`);

        // Subscribe to event status updates
        const eventChannel = `*:Event:${event?.id}`;
        addSubscription(eventChannel, source);

        // Subscribe to all markets for this event
        const marketCleanups = event?.markets.map((market) => {
            const marketChannel = `*:Market:${market.id}`;
            addSubscription(marketChannel, source);
            return () => removeSubscription(marketChannel, source);
        });

        // Cleanup subscriptions
        return () => {
            console.log(`📡 [${source}] Cleaning up subscriptions for event ${event?.id}`);
            removeSubscription(eventChannel, source);
            marketCleanups?.forEach((cleanup) => cleanup());
        };
    }, [event?.id, source, addSubscription, removeSubscription]);

    const handleSelectionClick = React.useCallback(
        (selection: Selection) => {
            const isSelected = bets.some((bet) => bet.selectionId === selection.id);
            if (isSelected) {
                removeBet(selection.id);
            } else if (event?.id) {
                addBet(event?.id, selection.id);
            }
        },
        [event?.id, bets, addBet, removeBet],
    );

    const formatTime = React.useCallback((date: string) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    // We know we always have at least one market with three selections
    if (!event) return null;

    const mainMarket = event.markets[0];

    return (
        <div className="grid grid-cols-[1fr,repeat(3,120px)] gap-4 p-4 items-center" data-testid="event-item">
            <div>
                <Link to={`/${event.id}`} className="font-medium hover:text-blue-600">
                    <span className="text-gray-500 mr-2">[{event.id}]</span>
                    {event.name}
                </Link>

                <div className="flex items-center gap-2 mt-1">
                    {event.status === 'live' ? (
                        <>
                            <span className="inline-flex items-center text-red-500 text-sm">
                                <Clock className="w-3 h-3 mr-1" />
                                {event.timeElapsed}'
                            </span>
                            <span className="text-sm font-semibold">
                                {event.score?.home} - {event.score?.away}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500">{formatTime(event.startTime)}</span>
                    )}

                    {event.suspended && (
                        <span
                            className="inline-flex items-center text-red-500 text-sm"
                            data-testid="suspended-indicator"
                        >
                            <Lock className="w-3 h-3 mr-1" />
                            Suspended
                        </span>
                    )}
                </div>
            </div>

            {mainMarket.selections.map((selection) => {
                const isSelected = bets.some((bet) => bet.selectionId === selection.id);
                return (
                    <button
                        key={selection.id}
                        onClick={() => handleSelectionClick(selection)}
                        disabled={event.suspended}
                        data-testid="selection-button"
                        className={`flex items-center justify-center p-2 rounded transition-colors ${
                            isSelected
                                ? 'bg-blue-100 text-blue-700'
                                : event.suspended
                                  ? 'bg-gray-100 text-gray-500'
                                  : 'hover:bg-gray-100'
                        }`}
                    >
                        {!event.suspended && (
                            <>
                                {priceChanges[selection.id] === 'up' && (
                                    <ArrowUpCircle className="mr-1 w-4 h-4 text-green-500" />
                                )}
                                {priceChanges[selection.id] === 'down' && (
                                    <ArrowDownCircle className="mr-1 w-4 h-4 text-red-500" />
                                )}
                            </>
                        )}
                        {event.suspended && <Lock className="mr-1 w-4 h-4" />}
                        <span
                            className={`px-2 py-1 rounded font-bold ${
                                event.suspended
                                    ? 'text-gray-500'
                                    : priceChanges[selection.id] === 'up'
                                      ? 'text-green-500 animate-price-up'
                                      : priceChanges[selection.id] === 'down'
                                        ? 'text-red-500 animate-price-down'
                                        : ''
                            }`}
                            data-testid="selection-price"
                        >
                            {selection.price.toFixed(2)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
});

EventItem.displayName = 'EventItem';
