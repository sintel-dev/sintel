import createReducer from '../store/createReducer';

function GET_DATASETS_REQUEST(nextState) {
    nextState.isDatasetLoading = true;
    nextState.dataSetsList = {};
}
function GET_DATASETS_SUCCESS(nextState, { dataSets }) {
    nextState.isDatasetLoading = false;
    nextState.dataSetsList = dataSets;
}
function GET_DATASETS_ERROR(nextState) {
    nextState.isDatasetLoading = false;
    nextState.dataSetsList = {};
}

export default createReducer({
    isDatasetLoading: true,
    dataSetsList: {},
}, {
    GET_DATASETS_REQUEST,
    GET_DATASETS_SUCCESS,
    GET_DATASETS_ERROR,
});
