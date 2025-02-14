import { useQuery } from '@tanstack/react-query';
import type { Event } from '@my-org/common';

const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch('http://localhost:3001/api/events');
  if (!response.ok) throw new Error('Failed to fetch events');
  return await response.json() as Event[];
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
};