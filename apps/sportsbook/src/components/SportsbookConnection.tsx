import { ConnectionStatus } from '@my-org/feature-ws-logger';

import { WSMonitor } from '../WSMonitor/WSMonitor';
import { useSportsbookConnection } from '../hooks/useSportsbookConnection';
import { useSportsBookStore } from '@my-org/common';

export const SportsbookConnection = () => {
  const { isConnected, lastPing, reconnectAttempts, subscriptions, toggleConnection } = useSportsbookConnection();
  const activeTab = useSportsBookStore(state => state.activeTab);

  return (
    <>
      <ConnectionStatus
        isConnected={isConnected}
        lastPing={lastPing}
        reconnectAttempts={reconnectAttempts}
        subscriptions={subscriptions}
        onToggleConnection={toggleConnection}
      />
      <WSMonitor 
        isConnected={isConnected}
        activeTab={activeTab}
        position="bottom-left"
      />
    </>
  );
};