import createReducer from '../store/createReducer';
import { ExperimentState, FetchExperimentsAction, SelectExperimentAction } from '../types';

const initialState: ExperimentState = {
  isExperimentsLoading: true,
  experimentsList: [],
  selectedExperimentID: null,
  isExperimentDataLoading: true,
  experimentDetails: [],
};

function FETCH_EXPERIMENTS_REQUEST(nextState: ExperimentState) {
  nextState.isExperimentsLoading = true;
  nextState.experimentsList = [];
}

function FETCH_EXPERIMENTS_SUCCESS(nextState: ExperimentState, action: FetchExperimentsAction) {
  nextState.isExperimentsLoading = false;
  nextState.experimentsList = action.result.experiments;
}

function FETCH_EXPERIMENTS_FAILURE(nextState: ExperimentState) {
  nextState.isExperimentsLoading = false;
  nextState.experimentsList = [];
}

function FETCH_EXPERIMENT_DATA_SUCCESS(nextState, action) {
  nextState.isExperimentDataLoading = false;
  nextState.experimentDetails = action.result;
}

function FETCH_EXPERIMENT_DATA_FAILURE(nextState) {
  nextState.isExperimentDataLoading = false;
  nextState.experimentDetails = [];
}

function SELECT_EXPERIMENT(nextState: ExperimentState, action: SelectExperimentAction) {
  nextState.selectedExperimentID = action.selectedExperimentID;
}

export default createReducer<ExperimentState>(initialState, {
  FETCH_EXPERIMENTS_REQUEST,
  FETCH_EXPERIMENTS_SUCCESS,
  FETCH_EXPERIMENTS_FAILURE,
  SELECT_EXPERIMENT,
  FETCH_EXPERIMENT_DATA_SUCCESS,
  FETCH_EXPERIMENT_DATA_FAILURE,
});
