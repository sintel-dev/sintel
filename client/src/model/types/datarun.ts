import { EventDataType } from './event';

export const SELECT_DATARUN = 'SELECT_DATARUN';
export const SET_TIMESERIES_PERIOD = 'SET_TIMESERIES_PERIOD';
export const UPDATE_EVENT_DETAILS = 'UPDATE_EVENT_DETAILS';
export const IS_CHANGING_EVENT_RANGE = 'IS_CHANGING_EVENT_RANGE';
export const SET_ACTIVE_EVENT_ID = 'SET_ACTIVE_EVENT_ID';
export const TOGGLE_PREDICTION_MODE = 'TOGGLE_PREDICTION_MODE';
export const SAVE_EVENT_DETAILS = 'SAVE_EVENT_DETAILS';
export const IS_UPDATE_POPUP_OPEN = 'IS_UPDATE_POPUP_OPEN';
export const ADDING_NEW_EVENTS = 'ADDING_NEW_EVENTS';
export const NEW_EVENT_DETAILS = 'NEW_EVENT_DETAILS';
export const ADDING_NEW_EVENT_RESULT = 'ADDING_NEW_EVENT_RESULT';
export const UPDATE_DATARUN_EVENTS = 'UPDATE_DATARUN_EVENTS';
export const SET_FILTER_TAGS = 'SET_FILTER_TAGS';
export const ZOOM_ON_CLICK = 'ZOOM_ON_CLICK';
export const TOGGLE_ZOOM = 'TOGGLE_ZOOM';
export const SET_CURRENT_PERIOD_LEVEL = 'SET_CURRENT_PERIOD_LEVEL';
export const REVIEW_PERIOD_LEVEL = 'REVIEW_PERIOD_LEVEL';

export type SelectDatarunAction = {
  type: typeof SELECT_DATARUN;
  datarunID: string;
};

export type SetTimeseriesPeriodAction = {
  type: typeof SET_TIMESERIES_PERIOD;
  eventRange: {
    eventRange: Array<number>;
    zoomValue: object;
  };
};

/**
 * Datarun State format
 */
export type DatarunState = {
  selectedDatarunID: string;
  selectedPeriodRange: {
    eventRange: Array<number>;
    zoomValue: object;
  };
  activeEventID: string | null;
  isEventCommentsLoading: boolean;
  eventComments: Array<any>;
  isPredictionEnabled: boolean;
  eventDetails: object;
  isEditingEventRange: boolean;
  isEditingEventRangeDone: boolean;
  isPopupOpen: boolean;
  isAddingEvent: boolean;
  newEventDetails: object;
  filterTags: any;
  zoomDirection: '';
  zoomCounter: number;
  zoomMode: boolean;
  periodLevel: object;
  isPeriodLevelSelected: boolean;
  reviewPeriod: null | string;
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
  eventWindows?: any;
  timeSeries?: Array<number>;
  maxTimeSeries?: Array<number>;
};

/**
 * The array of datarun items fetched from server with RESTAPI
 * API: all
 */
export type DatarunsResponse = {
  dataruns: DatarunDataType[];
};
