import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { WSLogger } from '@my-org/feature-ws-logger';

import { EventList } from './events/EventList';
import { EventDetails } from './events/EventDetails';
import { Betslip } from './betslip/Betslip';
import { SportsbookConnection } from './components/SportsbookConnection';
import './index.css';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className='min-h-screen bg-gray-100'>
                    <SportsbookConnection />
                    <nav className='bg-white shadow-lg mb-8'>
                        <div className='max-w-7xl mx-auto px-4'>
                            <div className='flex h-16 items-center'>
                                <h1 className='text-xl font-bold'>Sportsbook</h1>
                            </div>
                        </div>
                    </nav>

                    <div className='max-w-7xl mx-auto px-4 flex gap-8'>
                        <div className='flex-1'>
                            <Routes>
                                <Route path='/' element={<EventList />} />
                                <Route path='/:id' element={<EventDetails />} />
                            </Routes>
                        </div>
                        <div className='w-96 bg-white rounded-lg shadow-lg'>
                            <Betslip />
                        </div>
                    </div>
                    <WSLogger title='Sportsbook' />
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
