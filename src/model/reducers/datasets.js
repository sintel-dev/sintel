import createReducer from '../store/createReducer';

function GET_DATASET_REQUEST(nextState) {
    nextState.isDatasetLoading = true;
}
function GET_DATASET_SUCCESS(nextState, { dataSets }) {
    nextState.isDatasetLoading = false;
    nextState.dataSetsList = dataSets;
}
function GET_DATASET_ERROR(nextState) {
    nextState.isDatasetLoading = false;
    nextState.dataSetsList = {};
}

export default createReducer({
    isDatasetLoading: true,
    dataSetsList: {},
}, {
    GET_DATASET_REQUEST,
    GET_DATASET_SUCCESS,
    GET_DATASET_ERROR,
});
