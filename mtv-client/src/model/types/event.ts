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
  comments?: Comment[];
};
