import createReducer from '../store/createReducer';
import { ExperimentDataState, FecthDatarunsByExperimentIDAction } from '../types';

const initialState: ExperimentDataState = {
  isExperimentDataLoading: true,
  data: null,
};

function FETCH_DATARUNS_BY_EXPERIMENT_ID_REQUEST(nextState: ExperimentDataState) {
  nextState.isExperimentDataLoading = true;
  nextState.data = null;
}

function FETCH_DATARUNS_BY_EXPERIMENT_ID_SUCCESS(
  nextState: ExperimentDataState,
  action: FecthDatarunsByExperimentIDAction,
) {
  nextState.isExperimentDataLoading = false;
  nextState.data = action.result;
}

function FETCH_DATARUNS_BY_EXPERIMENT_ID_FAILURE(nextState: ExperimentDataState) {
  nextState.isExperimentDataLoading = false;
  nextState.data = null;
}

export default createReducer<ExperimentDataState>(initialState, {
  FETCH_DATARUNS_BY_EXPERIMENT_ID_REQUEST,
  FETCH_DATARUNS_BY_EXPERIMENT_ID_SUCCESS,
  FETCH_DATARUNS_BY_EXPERIMENT_ID_FAILURE,
});
