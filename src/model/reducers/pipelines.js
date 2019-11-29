import createReducer from '../store/createReducer';

function GET_PIPELINES_REQUEST(nextState) {
    nextState.pipelineData = {
        isPipelinesLoading: true
    };
}

function GET_PIPELINES_SUCCESS(nextState, { pipelines }) {
    nextState.pipelineData = {
        isPipelinesLoading: false,
        pipelineList: pipelines
    };
}

function GET_PIPELINES_ERROR(nextState) {
    nextState.pipelineData = {
        isPipelinesLoading: false,
        pipelineList: []
    };
}

export default createReducer({
    pipelineData: {
        isPipelinesLoading: true,
        pipelineList: []
    }
}, {
    GET_PIPELINES_REQUEST,
    GET_PIPELINES_SUCCESS,
    GET_PIPELINES_ERROR
});
