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

function SAVE_EVENT_DETAILS(nextState, { eventDetails }) {
  const { dataruns } = nextState.data;
  const datarunIndex = dataruns.findIndex(datarun => datarun.id === eventDetails.datarun);
  const eventIndex = dataruns[datarunIndex].events.findIndex(event => event.id === eventDetails.id);

  nextState.data.dataruns[datarunIndex].events[eventIndex] = {
    ...nextState.data.dataruns[datarunIndex].events[eventIndex],
    start_time: eventDetails.start_time / 1000,
    stop_time: eventDetails.stop_time / 1000,
    score: eventDetails.score,
    tag: eventDetails.tag,
  };
}

export default createReducer<ExperimentDataState>(initialState, {
  FETCH_DATARUNS_BY_EXPERIMENT_ID_REQUEST,
  FETCH_DATARUNS_BY_EXPERIMENT_ID_SUCCESS,
  FETCH_DATARUNS_BY_EXPERIMENT_ID_FAILURE,
  SAVE_EVENT_DETAILS,
});
