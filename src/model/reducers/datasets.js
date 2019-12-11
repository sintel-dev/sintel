import createReducer from '../store/createReducer';

function GET_DATASETS_REQUEST(nextState) {
    nextState.isDatasetLoading = true;
    nextState.dataSetsList = [];
}

function GET_DATASETS_SUCCESS(nextState, { result }) {
    nextState.isDatasetLoading = false;
    nextState.dataSetsList = result.datasets;
}

function GET_DATASETS_FAILURE(nextState) {
    nextState.isDatasetLoading = false;
    nextState.dataSetsList = [];
}

export default createReducer({
    isDatasetLoading: true,
    dataSetsList: [],
}, {
    GET_DATASETS_REQUEST,
    GET_DATASETS_SUCCESS,
    GET_DATASETS_FAILURE,
});
