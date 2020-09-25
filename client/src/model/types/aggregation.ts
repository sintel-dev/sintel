export const TOGGLE_AGGREGATION_MODAL = 'TOGGLE_AGGREGATION_MODAL';
export const SET_AGGREGATION_TIME_LEVEL = 'SET_AGGREGATION_TIME_LEVEL';
export const FETCH_SIGNAL_RAW = 'FETCH_SIGNAL_RAW';
// export const SET_AGGREGATION_PERIOD_LEVEL = 'SET_AGGREGATION_PERIOD_LEVEL';

export type AggregationLevelsType = {
  isAggregationModalOpen: boolean;
  aggregationTimeLevel: {
    selectedLevel: string | null;
    timeInMiliseconds: number | null;
  };
  // setZoomLevel: Function;
  periodLevel: any;
  isSignalRawLoading: boolean;
  singalRawData: Array<any>;
  eventInterval: Array<any>;
  contextValue: number;
  aggZoomValue: object | number;
};
