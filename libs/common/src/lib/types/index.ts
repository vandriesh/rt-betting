/**
 * Project-wide type definitions and conventions.
 * 
 * Conventions:
 * - Props should be defined inline with components
 * - Use discriminated unions for message types
 * - Prefer specific types over generics
 */

export interface BaseEntity {
  id: number;
  revision: number;
}

export interface Selection extends BaseEntity {
  name: string;
  price: number;
}

export interface Market extends BaseEntity {
  name: string;
  selections: Selection[];
}

export interface Event extends BaseEntity {
  name: string;
  markets: Market[];
  timestamp: number;
  suspended?: boolean;
  status: 'live' | 'upcoming';
  startTime: string;
  score?: {
    home: number;
    away: number;
  };
  timeElapsed?: number;
}

export enum WsMessageType {
  SelectionPriceChange = 'SelectionPriceChange',
  EventStatusUpdate = 'EventStatusUpdate',
  ScoreUpdate = 'ScoreUpdate'
}

export interface SelectionPriceChangePayload {
  marketId: number;
  selectionId: number;
  price: number;
}

export interface EventUpdatePayload {
  id: number;
  suspended: boolean;
}

/*
// TODO update score ws event
export interface ScoreUpdatePayload {
  id: number;
  score: {
    home: number;
    away: number;
  };
  timeElapsed: number;
}
*/

export interface WebSocketMessage<T> {
  type: WsMessageType;
  payload: T;
  revision?: number;
}

export interface SubscriptionRequest {
  channel: string;
  lastRevision: number;
}

export type SubscriptionSource = 
  | 'event_list'
  | 'market_list'
  | 'event_details'
  | 'market_details'
  | 'event_betslip'
  | 'market_betslip';

export interface SubscriptionTracker {
  sources: Set<SubscriptionSource>;
  unsubscribe: () => void;
}

export interface SubscriptionManager {
  events: Map<number, SubscriptionTracker>;
  markets: Map<number, SubscriptionTracker>;
}