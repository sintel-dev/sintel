import createReducer from '../store/createReducer';
import { DatasetsState, FetchDatasetsAction } from '../types';

const initialState: DatasetsState = {
    isDatasetLoading: true,
    dataSetsList: [],
};

/**
 * Initialize state when send FETCH_DATASETS_REQUEST
 */
function FETCH_DATASETS_REQUEST(nextState: DatasetsState) {
    nextState.isDatasetLoading = true;
    nextState.dataSetsList = [];
}

/**
 * Update state when send FETCH_DATASETS_REQUEST and receive response successfully
 */
function FETCH_DATASETS_SUCCESS(nextState: DatasetsState, action: FetchDatasetsAction) {
    nextState.isDatasetLoading = false;
    if (action.result) {
        nextState.dataSetsList = action.result.datasets;
    }
}

/**
 * Update state when send FETCH_DATASETS_REQUEST but failed to receive response
 */
function FETCH_DATASETS_FAILURE(nextState: DatasetsState) {
    nextState.isDatasetLoading = false;
    nextState.dataSetsList = [];
}

export default createReducer<DatasetsState>(initialState, {
    FETCH_DATASETS_REQUEST,
    FETCH_DATASETS_SUCCESS,
    FETCH_DATASETS_FAILURE,
});
