import createReducer from '../store/createReducer';
import { DatasetsState, FetchDatasetAction } from '../types/dataset';

const initialState: DatasetsState = {
  isDatasetLoading: true,
  dataSetsList: [],
};

/**
 * Initialize state when send GET_DATASETS_REQUEST
 */
function GET_DATASETS_REQUEST(nextState) {
  nextState.isDatasetLoading = true;
  nextState.dataSetsList = [];
}

/**
 * Update state when send GET_DATASETS_REQUEST and receive response successfully
 */
function GET_DATASETS_SUCCESS(nextState, action: FetchDatasetAction) {
  nextState.isDatasetLoading = false;
  if (action.result) {
    nextState.dataSetsList = action.result.datasets;
  }
}

/**
 * Update state when send GET_DATASETS_REQUEST but failed to receive response
 */
function GET_DATASETS_FAILURE(nextState) {
  nextState.isDatasetLoading = false;
  nextState.dataSetsList = [];
}

export default createReducer<DatasetsState>(initialState, {
  GET_DATASETS_REQUEST,
  GET_DATASETS_SUCCESS,
  GET_DATASETS_FAILURE,
});
