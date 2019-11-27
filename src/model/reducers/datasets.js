import createReducer from '../store/createReducer';

function GET_DATASET_REQUEST(nextState) {
    nextState.isDatasetLoading = true;
}
function GET_DATASET_SUCCESS(nextState, { dataSets }) {
    nextState.isDatasetLoading = false;
    nextState.dataSets = dataSets;
}
function GET_DATASET_ERROR(nextState) {
    nextState.isDatasetLoading = false;
    nextState.dataSets = {};
}

export default createReducer({
    dataSets: {},
    isDatasetLoading: true
}, {
    GET_DATASET_REQUEST,
    GET_DATASET_SUCCESS,
    GET_DATASET_ERROR
});
