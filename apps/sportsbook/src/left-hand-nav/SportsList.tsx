import React from 'react';
import {useSportsBookStore} from "@my-org/common";

import { SportIcon } from './SportIcons';

interface Sport {
    id: string;
    name: string;
}

const sports: Sport[] = [
    { id: 'football', name: 'Football' },
    { id: 'baseball', name: 'Baseball' },
    { id: 'tennis', name: 'Tennis' }
];

export const SportsList = () => {
    const [selectedSport, setSelectedSport] = React.useState('football');
    const events = useSportsBookStore(state => state.events);

    // Count events per sport (for now all events are football)
    const eventCounts = React.useMemo(() => {
        return sports.reduce((acc, sport) => ({
            ...acc,
            [sport.id]: sport.id === 'football' ? events.length : 0
        }), {} as Record<string, number>);
    }, [events.length]);

    return (
        <>
            <h2 className="text-lg font-semibold mb-4 px-2">Sports</h2>
            <div className="space-y-1">
                {sports.map((sport) => (
                    <button
                        key={sport.id}
                        onClick={() => setSelectedSport(sport.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                            selectedSport === sport.id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <SportIcon
                                name={sport.id}
                                className={`w-5 h-5 ${
                                    selectedSport === sport.id
                                        ? 'text-blue-600'
                                        : 'text-gray-400'
                                }`}
                            />
                            <span className="font-medium">{sport.name}</span>
                        </div>
                        <span className={`text-sm ${
                            selectedSport === sport.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                        } px-2 py-0.5 rounded-full`}>
              {eventCounts[sport.id]}
            </span>
                    </button>
                ))}
            </div>
        </>
    );
};