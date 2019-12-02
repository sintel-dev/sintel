import createReducer from '../store/createReducer';

function GET_EXPERIMENTS_REQUEST(nextState) {
    nextState.isExperimentsLoading = true;
}

function GET_EXPERIMENTS_SUCCESS(nextState, { experiments }) {
    nextState.isExperimentsLoading = false;
    nextState.experimentsList = experiments;
}

function GET_EXPERIMENTS_ERROR(nextState) {
    nextState.isExperimentsLoading = false;
    nextState.experimentsList = [];
}

export default createReducer({
    isExperimentsLoading: true,
    experimentsList: [],
}, {
    GET_EXPERIMENTS_REQUEST,
    GET_EXPERIMENTS_SUCCESS,
    GET_EXPERIMENTS_ERROR,
});
