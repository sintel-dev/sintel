import createReducer from '../store/createReducer';

function GET_EXPERIMENTS_REQUEST(nextState) {
  nextState.isExperimentsLoading = true;
  nextState.experimentsList = [];
}

function GET_EXPERIMENTS_SUCCESS(nextState, { result }) {
  nextState.isExperimentsLoading = false;
  nextState.experimentsList = result.experiments;
}

function GET_EXPERIMENTS_FAILURE(nextState) {
  nextState.isExperimentsLoading = false;
  nextState.experimentsList = [];
}

function SELECT_EXPERIMENT(nextState, { selectedExperimentID }) {
  nextState.selectedExperimentID = selectedExperimentID;
}

export default createReducer(
  {
    isExperimentsLoading: true,
    experimentsList: [],
    selectedExperimentID: null,
  },
  {
    GET_EXPERIMENTS_REQUEST,
    GET_EXPERIMENTS_SUCCESS,
    GET_EXPERIMENTS_FAILURE,
    SELECT_EXPERIMENT,
  },
);
