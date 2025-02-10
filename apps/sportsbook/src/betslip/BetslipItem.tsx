import React from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Lock, Clock } from 'lucide-react';
import type { Event, Selection } from '@my-org/common';
import { useSubscriptionStore } from '@my-org/common';

interface BetslipItemProps {
    event: Event;
    selection: Selection;
    stake?: number;
    priceDirection?: 'up' | 'down';
    onRemove: (selectionId: number) => void;
    onStakeChange: (selectionId: number, stake: number) => void;
}

export const BetslipItem = React.memo(
    ({ event, selection, stake, priceDirection, onRemove, onStakeChange }: BetslipItemProps) => {
        const { addSubscription, removeSubscription } = useSubscriptionStore();

        // Subscribe to event updates
        React.useEffect(() => {
            console.log(`📡 [event_betslip] Setting up subscriptions for event ${event.id}`);

            // Subscribe to event status updates
            const eventChannel = `*:Event:${event.id}`;
            addSubscription(eventChannel, 'event_betslip');

            // Subscribe to all markets for this event
            const marketCleanups = event.markets.map((market) => {
                const marketChannel = `*:Market:${market.id}`;
                addSubscription(marketChannel, 'event_betslip');
                return () => removeSubscription(marketChannel, 'event_betslip');
            });

            // Cleanup subscriptions
            return () => {
                console.log(`📡 [event_betslip] Cleaning up subscriptions for event ${event.id}`);
                removeSubscription(eventChannel, 'event_betslip');
                marketCleanups.forEach((cleanup) => cleanup());
            };
        }, [event.id, addSubscription, removeSubscription]);

        const formatTime = React.useCallback((date: string) => {
            return new Date(date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        }, []);

        return (
            <div
                className={`p-4 border-b transition-all ${event.suspended ? 'bg-gray-50' : ''}`}
                data-testid="betslip-item"
            >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">[{event.id}]</span>
                            <p className="font-medium">{event.name}</p>
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
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{selection.name}</p>
                    </div>
                    <button onClick={() => onRemove(selection.id)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={stake || ''}
                        onChange={(e) => onStakeChange(selection.id, parseFloat(e.target.value) || 0)}
                        placeholder="Stake"
                        disabled={event.suspended}
                        data-testid="stake-input"
                        className={`w-24 px-2 py-1 border rounded text-right ${
                            event.suspended ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                        }`}
                    />
                    <div className="flex items-center">
                        {event.suspended ? (
                            <Lock className="w-4 h-4 text-gray-400 mr-2" />
                        ) : (
                            <>
                                {priceDirection === 'up' && <ArrowUpCircle className="mr-1 w-4 h-4 text-green-500" />}
                                {priceDirection === 'down' && <ArrowDownCircle className="mr-1 w-4 h-4 text-red-500" />}
                            </>
                        )}
                        <span
                            className={`px-2 py-1 rounded font-semibold ${
                                event.suspended
                                    ? 'text-gray-400'
                                    : priceDirection === 'up'
                                      ? 'text-green-500 animate-price-up'
                                      : priceDirection === 'down'
                                        ? 'text-red-500 animate-price-down'
                                        : ''
                            }`}
                            data-testid="selection-price"
                        >
                            {selection.price.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        );
    },
);

BetslipItem.displayName = 'BetslipItem';
