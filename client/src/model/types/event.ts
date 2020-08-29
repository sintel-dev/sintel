import { CommentDataType } from './comment';

export const FETCH_EVENT_HISTORY = 'FETCH_EVENT_HISTORY';
/**
 * The data fetched from server with RESTAPI
 */
export type EventDataType = {
  id: string;
  score: number;
  tag: string;
  start_time: number;
  stop_time: number;
  insert_time?: string;
  datarun?: string;
  comments?: CommentDataType[];
  source?: string;
};

export type EventsResponse = {
  events: EventDataType[];
};

export type EventInteractions = {
  id: string;
  event: string;
  action: string;
  tag: string;
  annotation: string | null;
  start_time: string | null;
  stop_time: string | null;
  insert_time: string | null;
  created_by: string | null;
};
