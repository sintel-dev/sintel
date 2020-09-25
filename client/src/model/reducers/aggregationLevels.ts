import createReducer from '../store/createReducer';
import { AggregationLevelsType } from '../types';

const initialState: AggregationLevelsType = {
  isAggregationModalOpen: false,
  aggregationTimeLevel: {
    selectedLevel: '30 hours',
    timeInMiliseconds: 108000000,
  },
  periodLevel: 1,
  isSignalRawLoading: true,
  singalRawData: [],
  eventInterval: [],
  contextValue: 1,
  aggZoomValue: 1,
};

function TOGGLE_AGGREGATION_MODAL(nextState, { isAggregationModalOpen }) {
  nextState.isAggregationModalOpen = isAggregationModalOpen;
}

function SET_AGGREGATION_TIME_LEVEL(nextState, { aggregationTimeLevel }) {
  nextState.aggregationTimeLevel = aggregationTimeLevel;
}
function FETCH_SIGNAL_RAW_REQUEST(nextState) {
  nextState.isSignalRawLoading = true;
}

function FETCH_SIGNAL_RAW_SUCCESS(nextState, action) {
  nextState.singalRawData = action.result.data;
  nextState.isSignalRawLoading = false;
}

function FETCH_SIGNAL_RAW_FAILURE(nextState) {
  nextState.singalRawData = [];
  nextState.isSignalRawLoading = false;
}

function SET_EVENT_INTERVAL(nextState, { eventInterval }) {
  nextState.eventInterval = eventInterval;
}

function SET_CONTEXT_VALUE(nextState, { contextValue }) {
  nextState.contextValue = contextValue;
}

function UPDATE_AGGREGATION_ZOOM(nextState, { zoomValue }) {
  nextState.aggZoomValue = zoomValue;
}

export default createReducer(initialState, {
  TOGGLE_AGGREGATION_MODAL,
  SET_AGGREGATION_TIME_LEVEL,
  FETCH_SIGNAL_RAW_REQUEST,
  FETCH_SIGNAL_RAW_SUCCESS,
  FETCH_SIGNAL_RAW_FAILURE,
  SET_EVENT_INTERVAL,
  SET_CONTEXT_VALUE,
  UPDATE_AGGREGATION_ZOOM,
});
