export const FETCH_DATASETS = 'FETCH_DATASETS';

export type FetchDatasetsAction = {
    type: typeof FETCH_DATASETS;
    promise: Promise<DatasetsResponse>;
    result?: DatasetsResponse; // only exist when promise gets resolved
    error?: string; // only exist when promise gets rejected
};

/**
 * Dataset State format
 */
export type DatasetsState = {
    isDatasetLoading: boolean;
    dataSetsList: DatasetDataType[];
};

/**
 * The single dataset item fetched from server with RESTAPI
 * API: find | delete | create | update
 */
export type DatasetDataType = {
    id: string;
    insert_time: string;
    name: string;
    entity_id?: string;
};

/**
 * The array of dataset items fetched from server with RESTAPI
 * API: all
 */
export type DatasetsResponse = {
    datasets: DatasetDataType[];
};
