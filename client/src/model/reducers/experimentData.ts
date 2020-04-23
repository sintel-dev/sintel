import createReducer from '../store/createReducer';
import { ExperimentDataState, FecthDatarunsByExperimentIDAction } from '../types';

const initialState: ExperimentDataState = {
  isExperimentDataLoading: true,
  // @ts-ignore
  data: null,
};

function FETCH_DATARUNS_BY_EXPERIMENT_ID_REQUEST(nextState: ExperimentDataState) {
  nextState.isExperimentDataLoading = true;
  // @ts-ignore
  nextState.data = null;
}

function FETCH_DATARUNS_BY_EXPERIMENT_ID_SUCCESS(
  nextState: ExperimentDataState,
  action: FecthDatarunsByExperimentIDAction,
) {
  nextState.isExperimentDataLoading = false;
  // @ts-ignore
  nextState.data = action.result;
}

function FETCH_DATARUNS_BY_EXPERIMENT_ID_FAILURE(nextState: ExperimentDataState) {
  nextState.isExperimentDataLoading = false;
  // @ts-ignore
  nextState.data = null;
}

// @ts-ignore
function UPDATE_DATARUN_EVENTS(nextState, { newDatarunEvents, datarunIndex }) {
  nextState.data.dataruns[datarunIndex].events = newDatarunEvents;
}

export default createReducer<ExperimentDataState>(initialState, {
  FETCH_DATARUNS_BY_EXPERIMENT_ID_REQUEST,
  FETCH_DATARUNS_BY_EXPERIMENT_ID_SUCCESS,
  FETCH_DATARUNS_BY_EXPERIMENT_ID_FAILURE,
  UPDATE_DATARUN_EVENTS,
});
