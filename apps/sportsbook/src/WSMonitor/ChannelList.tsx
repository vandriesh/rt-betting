import React from 'react';
import type { ChannelListProps } from '../types';

const SourceBadge = ({ source }: { source: string }) => {
  const colors = {
    event_list: 'bg-blue-50 text-blue-600 ring-blue-500/10',
    event_details: 'bg-purple-50 text-purple-600 ring-purple-500/10',
    event_betslip: 'bg-pink-50 text-pink-600 ring-pink-500/10',
    market_list: 'bg-green-50 text-green-600 ring-green-500/10',
    market_details: 'bg-indigo-50 text-indigo-600 ring-indigo-500/10',
    market_betslip: 'bg-orange-50 text-orange-600 ring-orange-500/10'
  } as const;

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
      colors[source as keyof typeof colors] || 'bg-gray-50 text-gray-600 ring-gray-500/10'
    }`}>
      {source.replace('_', ' ')}
    </span>
  );
};

export const ChannelList: React.FC<ChannelListProps> = ({
  eventChannels,
  marketChannels
}) => {
  return (
    <div className="space-y-4">
      {eventChannels.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-500">Events</h4>
            <span className="text-xs text-gray-400">{eventChannels.length}</span>
          </div>
          <div className="space-y-2">
            {eventChannels.map(({ channel, sources }) => {
              const id = channel.split(':')[2];
              return (
                <div key={channel} className="bg-white rounded-md shadow-sm border p-2">
                  <div className="text-xs font-medium text-gray-900">
                    Event #{id}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {sources.map(source => (
                      <SourceBadge key={source} source={source} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {marketChannels.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-500">Markets</h4>
            <span className="text-xs text-gray-400">{marketChannels.length}</span>
          </div>
          <div className="space-y-2">
            {marketChannels.map(({ channel, sources }) => {
              const id = channel.split(':')[2];
              return (
                <div key={channel} className="bg-white rounded-md shadow-sm border p-2">
                  <div className="text-xs font-medium text-gray-900">
                    Market #{id}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {sources.map(source => (
                      <SourceBadge key={source} source={source} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};