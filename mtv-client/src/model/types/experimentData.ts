import { DatarunsResponse } from './datarun';

export const FETCH_DATARUNS_BY_EXPERIMENT_ID = 'FETCH_DATARUNS_BY_EXPERIMENT_ID';

export type FecthDatarunsByExperimentIDAction = {
  type: typeof FETCH_DATARUNS_BY_EXPERIMENT_ID;
  promise: Promise<DatarunsResponse>;
  result?: DatarunsResponse; // only exist when promise gets resolved
  error?: string; // only exist when promise gets rejected
};

/**
 * ExperimentData State format
 */
export type ExperimentDataState = {
  isExperimentDataLoading: boolean;
  data: DatarunsResponse;
};
