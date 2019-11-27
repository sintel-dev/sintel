import createReducer from '../store/createReducer';

function GET_EXPERIMENTS_REQUEST(nextState) {
    nextState.isExperimentsLoading = true;
}
function GET_EXPERIMENTS_SUCCESS(nextState, { experiments }) {
    nextState.isExperimentsLoading = false;
    nextState.experiments = experiments;
}
function GET_EXPERIMENTS_ERROR(nextState) {
    nextState.isExperimentsLoading = false;
    nextState.experiments = {};
}

export default createReducer({
    experiments: {},
    isExperimentsLoading: true
}, {
    GET_EXPERIMENTS_REQUEST,
    GET_EXPERIMENTS_SUCCESS,
    GET_EXPERIMENTS_ERROR
});
