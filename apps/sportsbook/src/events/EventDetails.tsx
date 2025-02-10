import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, ArrowLeft, Lock, Clock } from 'lucide-react';
import { useSportsBookStore } from '@my-org/common';
import { useSubscriptionStore } from '@my-org/common';

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const event = useSportsBookStore(React.useCallback(
    state => state.events.find(e => e.id === Number(id)),
    [id]
  ));
  const priceChanges = useSportsBookStore(state => state.priceChanges);
  const bets = useSportsBookStore(state => state.bets);
  const { addBet, removeBet } = useSportsBookStore();
  const { addSubscription, removeSubscription } = useSubscriptionStore();

  // Single subscription setup
  React.useEffect(() => {
    if (!event) return;

    console.log(`📡 [event_details] Setting up subscriptions for event ${event.id}`);
    
    // Subscribe to event status updates
    const eventChannel = `*:Event:${event.id}`;
    addSubscription(eventChannel, 'event_details');

    // Subscribe to all markets for this event
    const marketCleanups = event.markets.map(market => {
      const marketChannel = `*:Market:${market.id}`;
      addSubscription(marketChannel, 'event_details');
      return () => removeSubscription(marketChannel, 'event_details');
    });

    // Cleanup subscriptions
    return () => {
      console.log(`📡 [event_details] Cleaning up subscriptions for event ${event.id}`);
      removeSubscription(eventChannel, 'event_details');
      marketCleanups.forEach(cleanup => cleanup());
    };
  }, [event?.id]); // Only re-run if event ID changes

  const handleSelectionClick = React.useCallback((selection: any) => {
    if (!event) return;
    
    const isSelected = bets.some(bet => bet.selectionId === selection.id);
    if (isSelected) {
      removeBet(selection.id);
    } else {
      addBet(event.id, selection.id);
    }
  }, [event, bets, addBet, removeBet]);

  const formatTime = React.useCallback((date: string) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  if (!event) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
        <div className="text-center py-8">
          <p className="text-gray-600">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Link>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-gray-500 mr-2">[{event.id}]</span>
            {event.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {event.status === 'live' ? (
              <>
                <span className="inline-flex items-center text-red-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {event.timeElapsed}'
                </span>
                <span className="font-semibold text-lg">
                  {event.score?.home} - {event.score?.away}
                </span>
              </>
            ) : (
              <span className="text-gray-500">
                {formatTime(event.startTime)}
              </span>
            )}
          </div>
        </div>
        {event.suspended && (
          <div className="flex items-center text-red-500">
            <Lock className="w-5 h-5 mr-2" />
            <span className="font-medium">Event Suspended</span>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {event.markets.map((market) => (
          <div key={market.id} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">{market.name}</h2>
            <div className="grid grid-cols-3 gap-4">
              {market.selections.map((selection) => {
                const isSelected = bets.some(bet => bet.selectionId === selection.id);
                return (
                  <button
                    key={selection.id}
                    onClick={() => handleSelectionClick(selection)}
                    className={`flex items-center justify-center p-4 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700' 
                        : event.suspended
                        ? 'bg-gray-100 text-gray-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">{selection.name}</div>
                      <div className="flex items-center justify-center">
                        {!event.suspended && (
                          <>
                            {priceChanges[selection.id] === 'up' && (
                              <ArrowUpCircle className="mr-2 text-green-500" />
                            )}
                            {priceChanges[selection.id] === 'down' && (
                              <ArrowDownCircle className="mr-2 text-red-500" />
                            )}
                          </>
                        )}
                        {event.suspended && <Lock className="mr-2 w-4 h-4" />}
                        <span className={`px-2 py-1 rounded text-2xl font-bold ${
                          event.suspended ? 'text-gray-500' :
                          priceChanges[selection.id] === 'up' ? 'text-green-500 animate-price-up' :
                          priceChanges[selection.id] === 'down' ? 'text-red-500 animate-price-down' : ''
                        }`}>
                          {selection.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};