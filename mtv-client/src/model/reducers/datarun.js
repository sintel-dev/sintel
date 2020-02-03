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
function CHANGE_EVENT_DETAILS(nextState, { newDetails }) {
  nextState.eventDetails = newDetails;
}

function GET_EVENT_COMMENT_SUCCESS(nextState, { evtComments }) {
  nextState.eventComments = evtComments;
  nextState.isEventCommentsLoading = false;
}

export default createReducer(
  {
    selectedDatarunID: null,
    selectedTimePeriod: [],
    selectedPeriodRange: {},
    eventIndex: null,
    isEventCommentsLoading: true,
    eventComments: [],
  },
  {
    SELECT_DATARUN,
    SET_TIMESERIES_PERIOD,
    SET_CURRENT_EVENT,
    CHANGE_EVENT_DETAILS,
    GET_EVENT_COMMENT_SUCCESS,
  },
);
