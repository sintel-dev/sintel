import { DatarunDataType } from './datarun';

export const GET_EXPERIMENTDATA = 'GET_EXPERIMENTDATA';

export type FetchExperimentAction = {
  type: typeof GET_EXPERIMENTDATA;
  promise: Promise<ExperimentDataType>;
};

/**
 * The data fetched from server with RESTAPI
 */
export type ExperimentDataType = {
  id: string;
  project: string;
  dataset: string;
  date_creation: string;
  created_by: string;
  pipeline: string;
  dataruns: DatarunDataType[];
};
