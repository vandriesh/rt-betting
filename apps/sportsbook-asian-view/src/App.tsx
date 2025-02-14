import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ConnectionStatus, WSLogger } from '@my-org/feature-ws-logger';
import { WSMonitor, useSportsbookConnection } from '@my-org/feature-ws-monitor';

import { EventTable } from '@my-org/feature-event-list';
import { Betslip } from '@my-org/feature-betlsip';
import './index.css';
// import { useSportsbookConnection } from './useSportsbookConnection';

const queryClient = new QueryClient();

function App() {
    const { isConnected, lastPing, reconnectAttempts, subscriptions, toggleConnection } = useSportsbookConnection();

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-gray-100">
                <ConnectionStatus
                    isConnected={isConnected}
                    lastPing={lastPing}
                    reconnectAttempts={reconnectAttempts}
                    subscriptions={subscriptions}
                    onToggleConnection={toggleConnection}
                />

                <nav className="bg-white shadow-lg mb-8">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex h-16 items-center">
                            <h1 className="text-xl font-bold">Sportsbook</h1>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 flex gap-8">
                    <div className="w-96 bg-white rounded-lg shadow-lg">
                        <Betslip />
                    </div>
                    <div className="flex-1">
                        <EventTable />
                    </div>
                </div>
                <WSMonitor isConnected={isConnected} position="bottom-left" />

                <WSLogger title="Sportsbook" />
            </div>
        </QueryClientProvider>
    );
}

export default App;
