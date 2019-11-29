import createReducer from '../store/createReducer';

function GET_EXPERIMENTS_REQUEST(nextState) {
    nextState.expData = {
        isExperimentsLoading: true
    };
}

function GET_EXPERIMENTS_SUCCESS(nextState, { experiments }) {
    nextState.expData = {
        isExperimentsLoading: false,
        experimentsList: experiments
    };
}

function GET_EXPERIMENTS_ERROR(nextState) {
    nextState.expData = {
        isExperimentsLoading: false,
        experimentsList: []
    };
}

export default createReducer({
    expData: {
        isExperimentsLoading: true,
        experimentsList: []
    },
}, {
    GET_EXPERIMENTS_REQUEST,
    GET_EXPERIMENTS_SUCCESS,
    GET_EXPERIMENTS_ERROR
});
