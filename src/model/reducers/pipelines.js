import createReducer from '../store/createReducer';

function GET_PIPELINES_REQUEST(nextState) {
    nextState.isPipelinesLoading = true;
    nextState.pipelineList = [];
    nextState.pipelineName = null;
}

function GET_PIPELINES_SUCCESS(nextState, { result }) {
    nextState.isPipelinesLoading = false;
    nextState.pipelineList = result.pipelines;
    nextState.pipelineName = null;
}

function GET_PIPELINES_FAILURE(nextState) {
    nextState.isPipelinesLoading = false;
    nextState.pipelineList = [];
    nextState.pipelineName = null;
}

function SELECT_PIPELINE(nextState, { pipelineName }) {
    nextState.pipelineName = pipelineName;
}

export default createReducer({
    isPipelinesLoading: true,
    pipelineList: [],
    pipelineName: null,
}, {
    GET_PIPELINES_REQUEST,
    GET_PIPELINES_SUCCESS,
    GET_PIPELINES_FAILURE,
    SELECT_PIPELINE,
});
