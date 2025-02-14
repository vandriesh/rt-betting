import React from 'react';
import { useEvents } from './useEvents';
import { useSportsBookStore } from '@my-org/common';
import { EventRow } from './EventRow';

export const EventTable = () => {
    const { events, setEvents } = useSportsBookStore();
    const { data: initialEvents, isLoading } = useEvents();

    React.useEffect(() => {
        if (initialEvents) {
            setEvents(initialEvents);
        }
    }, [initialEvents, setEvents]);


    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8">
                <p className="text-gray-600">Loading events...</p>
            </div>
        );
    }
    const sortedEvents = events.sort((event) => event.status === 'live' ? -1 : 1);

    // return <h1>Loaded</h1>

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" data-testid="event-list">


            {/* Header */}
            <div className="grid grid-cols-[1fr,repeat(3,120px)] gap-4 p-4 bg-gray-50 border-b font-semibold">
                <div>Event</div>
                <div className="text-center">1</div>
                <div className="text-center">X</div>
                <div className="text-center">2</div>
            </div>

            {/* Event List */}
            <div className="divide-y">
                {sortedEvents.map((event) => (
                    <EventRow key={event.id} id={event.id} source="event_list" />
                ))}
            </div>
        </div>
    );
};
