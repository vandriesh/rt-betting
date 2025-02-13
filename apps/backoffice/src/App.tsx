import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ConnectionStatus, WSLogger } from '@my-org/feature-ws-logger';

import { EventList } from './events/EventList';
import './index.css';
import { useBackOfficeConnection } from './useBackOfficeConnection';

const queryClient = new QueryClient();

function App() {
    const { isConnected, lastPing, reconnectAttempts, subscriptions, toggleConnection } = useBackOfficeConnection();

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
                            <h1 className="text-xl font-bold">Backoffice</h1>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 flex gap-8">
                    <div className="flex-1">
                        <EventList />
                    </div>
                </div>
                <WSLogger title="Back Office" />
            </div>
        </QueryClientProvider>
    );
}

export default App;
