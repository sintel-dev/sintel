export const SELECT_DATARUN = 'SELECT_DATARUN';
export const SET_TIMESERIES_PERIOD = 'SET_TIMESERIES_PERIOD';

export type SelectDatarunAction = {
  type: typeof SELECT_DATARUN;
  datarunID: string;
};

export type SetTimeseriesPeriodAction = {
  type: typeof SET_TIMESERIES_PERIOD;
  eventRange: [number, number];
};

/**
 * Datarun State format
 */
export type DatarunState = {
  selectedDatarunID: string;
  selectedPeriodRange: [number, number];
};

/**
 * The data fetched from server with RESTAPI
 */
export type DatarunDataType = {
  id: string;
  signal: string;
  experiment: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  events?: Event[];
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
