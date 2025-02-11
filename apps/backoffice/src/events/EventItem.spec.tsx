import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EventItem } from './EventItem';
import { type Event } from '@my-org/common'; // Adjust the import based on your actual setup

// Mock event data (copy from your server mock setup)
const mockEvent: Event = {
  id: 1,
  revision: 3,
  name: 'Manchester United vs Liverpool',
  markets: [
    {
      id: 1000,
      revision: 3,
      name: 'Match Result',
      selections: [
        { id: 10001, revision: 3, name: 'Manchester United (1)', price: 2.5 },
        { id: 10002, revision: 3, name: 'Draw (X)', price: 3.4 },
        { id: 10003, revision: 3, name: 'Liverpool (2)', price: 2.8 },
      ],
    },
  ],
  timestamp: Date.now(),
  suspended: false,
  status: 'live',
  startTime: '2024-03-10T15:00:00Z',
  score: { home: 2, away: 1 },
  timeElapsed: 67,
};

// Mock SportsBookProvider
const MockSportsBookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//  const sportsBookStore = useSportsBookStore();
  return <div>{children}</div>;
};

test.skip('locks the event on user click', async () => {
  render(
    <MockSportsBookProvider>
      <EventItem event={mockEvent} />
    </MockSportsBookProvider>
  );

  // Simulate user clicking on the suspend toggle button
  const suspendToggle = screen.getByTestId('suspend-toggle');
  await userEvent.click(suspendToggle);

  // Check if the event becomes locked
  expect(screen.getByTestId('suspended-indicator')).toBeInTheDocument();
}); 