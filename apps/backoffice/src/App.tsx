import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { WSLogger } from '@my-org/feature-ws-logger';

import { EventList } from './events/EventList';
import { BackOfficeConnection } from './components/BackOfficeConnection';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 p-8">
        <BackOfficeConnection />
        <EventList />
        <WSLogger title="Back Office" />
      </div>
    </QueryClientProvider>
  );
}

export default App;