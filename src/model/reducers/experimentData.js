import createReducer from '../store/createReducer';

function GET_EXPERIMENTDATA_REQUEST(nextState) {
    nextState.isExperimentDataLoading = true;
    nextState.data = {};
}

function GET_EXPERIMENTDATA_SUCCESS(nextState, { result }) {
    nextState.isExperimentDataLoading = false;
    nextState.data = result;
}

function GET_EXPERIMENTDATA_FAILURE(nextState) {
    nextState.isExperimentDataLoading = false;
    nextState.experimentData = {};
}


export default createReducer({
    isExperimentDataLoading: true,
    data: {},
}, {
    GET_EXPERIMENTDATA_REQUEST,
    GET_EXPERIMENTDATA_SUCCESS,
    GET_EXPERIMENTDATA_FAILURE,
});
