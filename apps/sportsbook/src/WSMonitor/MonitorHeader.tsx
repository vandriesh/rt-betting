import React from 'react';
import { ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import type { MonitorHeaderProps } from './types';

export const MonitorHeader: React.FC<MonitorHeaderProps> = ({
    isExpanded,
    setIsExpanded,
    isConnected,
    activeTab,
    totalChannels,
}) => {
    return (
        <div
            className='bg-white border-b flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50'
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className='flex items-center gap-2'>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className='text-sm font-medium text-gray-700'>Subscriptions ({totalChannels})</span>
                {activeTab && (
                    <span
                        className={`flex items-center text-xs px-1.5 py-0.5 rounded ${
                            activeTab === 'live' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                        }`}
                    >
                        {activeTab === 'live' ? (
                            <>
                                <Clock className='w-3 h-3 mr-1' />
                                Live
                            </>
                        ) : (
                            <>
                                <Calendar className='w-3 h-3 mr-1' />
                                Upcoming
                            </>
                        )}
                    </span>
                )}
            </div>
            {isExpanded ? (
                <ChevronUp className='w-4 h-4 text-gray-400' />
            ) : (
                <ChevronDown className='w-4 h-4 text-gray-400' />
            )}
        </div>
    );
};
