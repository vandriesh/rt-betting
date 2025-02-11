import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSubscriptionStore } from '@my-org/common';
import type { SubscriptionSource } from '@my-org/common';
import '@testing-library/jest-dom';

import { WSMonitor } from '../WSMonitor';

describe.skip('WSMonitor Component', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({ subscriptions: new Map() });
  });

  test('should display no subscriptions message when empty', () => {
    render(<WSMonitor isConnected={true} position="bottom-left" />);
    expect(screen.getByText('No active subscriptions')).toBeInTheDocument();
  });

  test('should display active subscriptions', () => {
    const store = useSubscriptionStore.getState();
    const eventChannel = '*:Event:1';
    const marketChannel = '*:Market:1000';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(eventChannel, source);
    store.addSubscription(marketChannel, source);

    const { container } = render(<WSMonitor isConnected={true} position="bottom-left" />);

    // expect(screen.getByText(eventChannel)).toBeInTheDocument();
    // expect(screen.getByText(marketChannel)).toBeInTheDocument();
    expect(container).toHaveTextContent([
      'Active Subscriptions2 total',
      'Event Channels (1)',
      '*:Event:1event_list',
      'Market Channels (1)',
      '*:Market:1000event_list'
    ].join(''));
  });

  test('should display connection status', () => {
    render(<WSMonitor isConnected={true} position="bottom-left" />);
    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
  });

  test('should handle different positions', () => {
    const { container: bottomLeft } = render(
      <WSMonitor isConnected={true} position="bottom-left" />
    );
    expect(bottomLeft.firstChild).toHaveClass('bottom-4 left-4');

    const { container: topRight } = render(
      <WSMonitor isConnected={true} position="top-right" />
    );
    expect(topRight.firstChild).toHaveClass('top-4 right-4');
  });
});