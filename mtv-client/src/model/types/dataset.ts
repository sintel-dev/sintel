export const GET_DATASETS = 'GET_DATASETS';

export type FetchDatasetPromise = Promise<{ datasets: DatasetDataType[] }>;

export type FetchDatasetAction = {
  type: typeof GET_DATASETS;
  promise: FetchDatasetPromise;
  result?: { datasets: DatasetDataType[] };
  error?: string;
};

export type DatasetsState = {
  isDatasetLoading: boolean;
  dataSetsList: Array<DatasetDataType>;
};

/**
 * The data fetched from server with RESTAPI
 */
export type DatasetDataType = {
  id: string;
  insert_time: string;
  name: string;
  entity_id?: string;
};
