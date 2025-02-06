import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createEventsSlice, type EventsSlice } from '../../common/store/createEventsSlice';
import { enhancedSocket } from '../../socket';
import { WsMessageType } from '../../types';

interface BOEventsState extends EventsSlice {
  updating: string | null;
  updateSelectionPrice: (eventId: number, marketId: number, selectionId: string, newPrice: number) => void;
  setUpdating: (id: string | null) => void;
  setSuspended: (eventId: number, suspended: boolean) => void;
}

export const useEventsStore = create<BOEventsState>()(
  devtools(
    (set) => ({
      ...createEventsSlice(set, 'boEvents', (state) => {
        console.log('📦 [BO] Store state changed:', state);
      }),
      updating: null,
      updateSelectionPrice: (eventId, marketId, selectionId, newPrice) => {
        console.log('📦 [BO] Updating selection price:', { eventId, marketId, selectionId, newPrice });
        set(
          (state) => ({
            events: state.events.map(event => {
              if (event.id === eventId) {
                return {
                  ...event,
                  markets: event.markets.map(market => {
                    if (market.id === marketId) {
                      return {
                        ...market,
                        selections: market.selections.map(selection => 
                          selection.id === selectionId 
                            ? { ...selection, price: newPrice }
                            : selection
                        )
                      };
                    }
                    return market;
                  })
                };
              }
              return event;
            })
          }),
          false,
          'boEvents/updateSelectionPrice'
        );
      },
      setUpdating: (id) => {
        console.log('📦 [BO] Setting updating:', id);
        set({ updating: id }, false, 'boEvents/setUpdating');
      },
      setSuspended: (eventId, suspended) => {
        console.log('📦 [BO] Setting suspended state:', { eventId, suspended });
        set(
          (state) => ({
            events: state.events.map(event =>
              event.id === eventId ? { ...event, suspended } : event
            )
          }),
          false,
          'boEvents/setSuspended'
        );
        
        enhancedSocket.emitEventUpdate(eventId, {
          type: WsMessageType.EventStatusUpdate,
          payload: {
            id: eventId,
            suspended
          }
        });
      }
    }),
    {
      name: 'Back Office Events Store',
      enabled: true
    }
  )
);