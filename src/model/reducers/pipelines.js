import createReducer from '../store/createReducer';

function GET_PIPELINES_REQUEST(nextState) {
    nextState.isPipelinesLoading = true;
}
function GET_PIPELINES_SUCCESS(nextState, { pipelines }) {
    nextState.isPipelinesLoading = false;
    nextState.pipelines = pipelines;
}
function GET_PIPELINES_ERROR(nextState) {
    nextState.isPipelinesLoading = false;
    nextState.pipelines = {};
}

export default createReducer({
    pipelines: {},
    isPipelinesLoading: true
}, {
    GET_PIPELINES_REQUEST,
    GET_PIPELINES_SUCCESS,
    GET_PIPELINES_ERROR
});
