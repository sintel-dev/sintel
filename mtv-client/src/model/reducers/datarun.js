import createReducer from '../store/createReducer';

function SELECT_DATARUN(nextState, { datarunID }) {
  nextState.selectedDatarunID = datarunID;
}

function SET_TIMESERIES_PERIOD(nextState, { eventRange }) {
  nextState.selectedPeriodRange = eventRange;
}

function SET_CURRENT_EVENT(nextState, { eventIndex }) {
  nextState.eventIndex = eventIndex;
}
function UPDATE_EVENT_DETAILS(nextState, { eventDetails }) {
  nextState.eventDetails = eventDetails;
}

function GET_EVENT_COMMENT_SUCCESS(nextState, { evtComments }) {
  nextState.eventComments = evtComments;
  nextState.isEventCommentsLoading = false;
}

function TOGGLE_PREDICTION_MODE(nextState, { isPredictionEnabled }) {
  nextState.isPredictionEnabled = isPredictionEnabled;
}

export default createReducer(
  {
    selectedDatarunID: null,
    selectedTimePeriod: [],
    selectedPeriodRange: {},
    eventIndex: null,
    isEventCommentsLoading: true,
    eventComments: [],
    isPredictionEnabled: false,
  },
  {
    SELECT_DATARUN,
    SET_TIMESERIES_PERIOD,
    SET_CURRENT_EVENT,
    UPDATE_EVENT_DETAILS,
    GET_EVENT_COMMENT_SUCCESS,
    TOGGLE_PREDICTION_MODE,
  },
);
