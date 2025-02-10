import { Request, Response } from 'express';
import { mockEvents } from '../__fixtures__/mock_data';


// Keep a copy of the initial state
const initialEvents = JSON.parse(JSON.stringify(mockEvents));
let currentEvents = JSON.parse(JSON.stringify(mockEvents));

export const getEvents = (_req: Request, res: Response) => {
  console.log('📦 [API] Sending events:');
  console.dir(currentEvents, { depth: null });
  res.json(currentEvents);
};

export const resetEvents = (_req: Request, res: Response) => {
  console.log('🔄 [API] Resetting events to initial state');
  currentEvents = JSON.parse(JSON.stringify(initialEvents));
  res.json({ message: 'Events reset successfully' });
};

export const updateEvents = (events: typeof mockEvents) => {
  currentEvents = events;
};