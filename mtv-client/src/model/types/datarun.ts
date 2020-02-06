import { EventDataType } from './event';

export const SELECT_DATARUN = 'SELECT_DATARUN';
export const SET_TIMESERIES_PERIOD = 'SET_TIMESERIES_PERIOD';
export const UPDATE_EVENT_DETAILS = 'UPDATE_EVENT_DETAILS';
export const IS_CHANGING_EVENT_RANGE = 'IS_CHANGING_EVENT_RANGE';
export const SET_CURRENT_EVENT = 'SET_CURRENT_EVENT';
export const TOGGLE_PREDICTION_MODE = 'TOGGLE_PREDICTION_MODE';

export type SelectDatarunAction = {
  type: typeof SELECT_DATARUN;
  datarunID: string;
};

export type SetTimeseriesPeriodAction = {
  type: typeof SET_TIMESERIES_PERIOD;
  eventRange: {
    eventRange: any;
    zoomValue: any;
  };
};

/**
 * Datarun State format
 */
export type DatarunState = {
  selectedDatarunID: string;
  // selectedPeriodRange: [number, number];
  selectedPeriodRange: {
    eventRange: any;
    zoomValue: any;
  };
  eventIndex: string | null;
  isEventCommentsLoading: boolean;
  eventComments: Array<any>;
  isPredictionEnabled: boolean;
  eventDetails: object;
  isEditingEventRange: boolean;
};

/**
 * The single datarun item fetched from server with RESTAPI
 * API: find | delete | create | update
 */
export type DatarunDataType = {
  id: string;
  signal: string;
  experiment: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  events?: EventDataType[];
  prediction?: {
    names: string[];
    data: number[][];
  };
  raw?: {
    year: number;
    timestamp: number;
    data: { means: number[]; counts: number[] }[][];
  }[];
};

/**
 * The array of datarun items fetched from server with RESTAPI
 * API: all
 */
export type DatarunsResponse = {
  dataruns: DatarunDataType[];
};
