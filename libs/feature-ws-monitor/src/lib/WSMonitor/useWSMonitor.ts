import { useSubscriptionStore } from '@my-org/common';

export const useWSMonitor = () => {
  const { getSubscriptionSummary } = useSubscriptionStore();
  
  const summary = getSubscriptionSummary();

  // Split channels into events and markets
  const eventChannels = summary
    .filter(({ channel }) => channel.startsWith('*:Event:'))
    .map(({ channel, sources }) => ({
      channel,
      sources
    }));

  const marketChannels = summary
    .filter(({ channel }) => channel.startsWith('*:Market:'))
    .map(({ channel, sources }) => ({
      channel,
      sources
    }));

  return {
    summary: {
      events: eventChannels,
      markets: marketChannels
    }
  };
};