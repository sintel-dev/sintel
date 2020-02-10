import { SelectDatarunAction, SetTimeseriesPeriodAction, DatarunState } from '../types';
import createReducer from '../store/createReducer';

const initialState: DatarunState = {
  selectedDatarunID: '',
  selectedPeriodRange: {
    zoomValue: 1,
    eventRange: [0, 0],
  },
  eventIndex: null,
  isEventCommentsLoading: true,
  eventComments: [],
  isPredictionEnabled: false,
  eventDetails: {},
  isEditingEventRange: false,
  isEditingEventRangeDone: false,
};

/**
 * update the currently selected datarunID to state
 */
function SELECT_DATARUN(nextState: DatarunState, action: SelectDatarunAction) {
  nextState.selectedDatarunID = action.datarunID;
}

/**
 * set the selectedPeriodRange
 */
function SET_TIMESERIES_PERIOD(nextState: DatarunState, action: SetTimeseriesPeriodAction) {
  nextState.selectedPeriodRange = action.eventRange;
}

function SET_CURRENT_EVENT(nextState, { eventIndex }) {
  nextState.eventIndex = eventIndex;
}

function UPDATE_EVENT_DETAILS(nextState, { eventDetails }) {
  nextState.eventDetails = eventDetails;
}

function GET_EVENT_COMMENTS_SUCCESS(nextState, { eventComments }) {
  nextState.eventComments = eventComments;
  nextState.isEventCommentsLoading = false;
}

function TOGGLE_PREDICTION_MODE(nextState, { isPredictionEnabled }) {
  nextState.isPredictionEnabled = isPredictionEnabled;
}

function IS_CHANGING_EVENT_RANGE(nextState, { isEditingEventRange }) {
  nextState.isEditingEventRange = isEditingEventRange;
}

function EVENT_RANGE_EDITING_DONE(nextState, { isEditingEventRangeDone }) {
  nextState.isEditingEventRangeDone = isEditingEventRangeDone;
}

export default createReducer<DatarunState>(initialState, {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
  SET_CURRENT_EVENT,
  UPDATE_EVENT_DETAILS,
  TOGGLE_PREDICTION_MODE,
  GET_EVENT_COMMENTS_SUCCESS,
  IS_CHANGING_EVENT_RANGE,
  EVENT_RANGE_EDITING_DONE,
});
