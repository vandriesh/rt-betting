import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ConnectionStatus, WSLogger } from '@my-org/feature-ws-logger';
import { WSMonitor, useSportsbookConnection } from '@my-org/feature-ws-monitor';
import { EventList } from '@my-org/feature-event-list';
import { Betslip } from '@my-org/feature-betlsip';

import { SportsList } from './left-hand-nav/SportsList';
import { EventDetails } from './events/EventDetails';
import './index.css';

const queryClient = new QueryClient();

function App() {
    const { isConnected, lastPing, reconnectAttempts, subscriptions, toggleConnection } = useSportsbookConnection();

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
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
                        <div className="w-64 bg-white rounded-lg shadow-lg p-4">
                            <SportsList />
                        </div>
                        <div className="flex-1">
                            <Routes>
                                <Route path="/" element={<EventList />} />
                                <Route path="/:id" element={<EventDetails />} />
                            </Routes>
                        </div>
                        <div className="w-96 bg-white rounded-lg shadow-lg">
                            <Betslip />
                        </div>
                    </div>
                    <WSMonitor isConnected={isConnected} position="bottom-left" />

                    <WSLogger title="Sportsbook" />
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
