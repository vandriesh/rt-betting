import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createEventsSlice, type EventsSlice } from '../store/createEventsSlice';
import type { SelectionPriceChangePayload, EventUpdatePayload } from '../types';

interface BetslipBet {
    eventId: number;
    selectionId: number;
    stake?: number;
}

interface SportsBookState extends EventsSlice {
    activeTab: 'live' | 'upcoming';
    setActiveTab: (tab: 'live' | 'upcoming') => void;

    priceChanges: Record<string, 'up' | 'down'>;
    setPriceChange: (id: string, direction: 'up' | 'down') => void;
    clearPriceChange: (id: string) => void;

    bets: BetslipBet[];
    addBet: (eventId: number, selectionId: number) => void;
    removeBet: (selectionId: number) => void;
    removeBetsByEventId: (eventId: number) => void;
    updateStake: (selectionId: number, stake: number) => void;
    clearBetslip: () => void;

    handlePriceChange: (eventId: number, payload: SelectionPriceChangePayload) => void;
    handleEventUpdate: (payload: EventUpdatePayload) => void;
}

export const useSportsBookStore = create<SportsBookState>()(
    devtools(
        persist(
            (set, get) => ({
                ...createEventsSlice(set, 'sportsbook'),

                activeTab: 'live',
                setActiveTab: (tab) => set({ activeTab: tab }, false, 'sportsbook/setActiveTab'),

                priceChanges: {},
                setPriceChange: (id, direction) =>
                    set(state => ({ priceChanges: { ...state.priceChanges, [id]: direction } }), false, 'sportsbook/setPriceChange'),
                clearPriceChange: (id) =>
                    set(state => {
                        const { [id]: _, ...rest } = state.priceChanges;
                        return { priceChanges: rest };
                    }, false, 'sportsbook/clearPriceChange'),

                bets: [],
                addBet: (eventId, selectionId) =>
                    set(state => ({
                        bets: state.bets.some(bet => bet.selectionId === selectionId)
                            ? state.bets
                            : [...state.bets, { eventId, selectionId }]
                    }), false, 'sportsbook/addBet'),
                removeBet: (selectionId) =>
                    set(state => ({
                        bets: state.bets.filter(bet => bet.selectionId !== selectionId)
                    }), false, 'sportsbook/removeBet'),
                removeBetsByEventId: (eventId) =>
                    set(state => ({
                        bets: state.bets.filter(bet => bet.eventId !== eventId)
                    }), false, 'sportsbook/removeBetsByEventId'),
                updateStake: (selectionId, stake) =>
                    set(state => ({
                        bets: state.bets.map(bet =>
                            bet.selectionId === selectionId ? { ...bet, stake } : bet
                        )
                    }), false, 'sportsbook/updateStake'),
                clearBetslip: () => set({ bets: [] }, false, 'sportsbook/clear'),

                handlePriceChange: (eventId, payload) => {
                    const { marketId, selectionId, price } = payload;
                    const event = get().events.find(e => e.id === eventId);
                    const currentPrice = event?.markets
                        .find(m => m.id === marketId)
                        ?.selections
                        .find(s => s.id === selectionId)
                        ?.price;

                    if (currentPrice !== undefined && price !== currentPrice) {
                        const direction = price > currentPrice ? 'up' : 'down';
                        get().setPriceChange(selectionId.toString(), direction);

                        set(state => ({
                            events: state.events.map(event =>
                                event.id === eventId
                                    ? {
                                        ...event,
                                        markets: event.markets.map(market =>
                                            market.id === marketId
                                                ? {
                                                    ...market,
                                                    selections: market.selections.map(selection =>
                                                        selection.id === selectionId
                                                            ? { ...selection, price }
                                                            : selection
                                                    )
                                                }
                                                : market
                                        )
                                    }
                                    : event
                            )
                        }), false, 'sportsbook/handlePriceChange');

                        setTimeout(() => {
                            get().clearPriceChange(selectionId.toString());
                        }, 2000);
                    }
                },

                handleEventUpdate: (payload) => {
                    const { id, suspended } = payload;
                    set(state => ({
                        events: state.events.map(event =>
                            event.id === id ? { ...event, suspended } : event
                        )
                    }), false, 'sportsbook/handleEventUpdate');
                }
            }),
            {
                name: 'sportsbook-storage',
                partialize: (state) => ({
                    bets: state.bets,
                    activeTab: state.activeTab
                })
            }
        ),
        {
            name: 'Sportsbook Store',
            enabled: true
        }
    )
);