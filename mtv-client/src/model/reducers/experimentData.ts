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
  // debugger;
  nextState.isExperimentDataLoading = false;
  nextState.data = action.result;
}

function FETCH_DATARUNS_BY_EXPERIMENT_ID_FAILURE(nextState: ExperimentDataState) {
  nextState.isExperimentDataLoading = false;
  nextState.data = null;
}

function EVENT_RANGE_EDITING_DONESS(nextState, { eventDetails, timeSeries }) {
  // debugger;
  // nextState.data = eventDetails;
  // nextState.data.datarun

  const { dataruns } = nextState.data;

  // const { timeSeries } = dataruns;

  const datarunIndex = dataruns.findIndex(datarun => datarun.id === eventDetails.datarun);
  const eventIndex = dataruns[datarunIndex].events.findIndex(event => event.id === eventDetails.id);
  debugger;
  // const startIndex = timeSeries.findIndex(element => eventDetails.start_time - element[0] < 0) - 1;
  // const stopIndex = timeSeries.findIndex(element => eventDetails.stop_time - element[0] < 0);

  nextState.data.dataruns[datarunIndex].events[eventIndex] = {
    ...nextState.data.dataruns[datarunIndex].events[eventIndex],
    ...eventDetails,
    start_time: eventDetails.start_time,
    stop_time: eventDetails.stop_time,
    // start_time: timeSeries[startIndex][0],
    // stop_time: timeSeries[stopIndex][0],
  };
}

function SAVE_EVENT_DETAILS(nextState, { eventDetails }) {
  const { dataruns } = nextState.data;
  const datarunIndex = dataruns.findIndex(datarun => datarun.id === eventDetails.datarun);
  const eventIndex = dataruns[datarunIndex].events.findIndex(event => event.id === eventDetails.id);

  nextState.data.dataruns[datarunIndex].events[eventIndex] = {
    ...nextState.data.dataruns[datarunIndex].events[eventIndex],
    start_time: eventDetails.start_time,
    stop_time: eventDetails.stop_time,
    score: eventDetails.score,
    tag: eventDetails.tag,
  };
  debugger;
  // console.log('datarun reducer', eventDetails);
}

export default createReducer<ExperimentDataState>(initialState, {
  FETCH_DATARUNS_BY_EXPERIMENT_ID_REQUEST,
  FETCH_DATARUNS_BY_EXPERIMENT_ID_SUCCESS,
  FETCH_DATARUNS_BY_EXPERIMENT_ID_FAILURE,
  EVENT_RANGE_EDITING_DONESS,
  SAVE_EVENT_DETAILS,
});
