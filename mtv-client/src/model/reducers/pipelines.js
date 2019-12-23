import createReducer from '../store/createReducer';

function GET_PIPELINES_REQUEST(nextState) {
    nextState.isPipelinesLoading = true;
    nextState.pipelineList = [];
    nextState.selectedPipelineName = null;
}

function GET_PIPELINES_SUCCESS(nextState, { result }) {
    nextState.isPipelinesLoading = false;
    nextState.pipelineList = result.pipelines;
    nextState.selectedPipelineName = null;
}

function GET_PIPELINES_FAILURE(nextState) {
    nextState.isPipelinesLoading = false;
    nextState.pipelineList = [];
    nextState.selectedPipelineName = null;
}

function SELECT_PIPELINE(nextState, { selectedPipelineName }) {
    nextState.selectedPipelineName = selectedPipelineName;
}

export default createReducer({
    isPipelinesLoading: true,
    pipelineList: [],
    selectedPipelineName: null,
}, {
    GET_PIPELINES_REQUEST,
    GET_PIPELINES_SUCCESS,
    GET_PIPELINES_FAILURE,
    SELECT_PIPELINE,
});
