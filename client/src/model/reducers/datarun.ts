import { SelectDatarunAction, SetTimeseriesPeriodAction, DatarunState } from '../types';
import createReducer from '../store/createReducer';

const initialState: DatarunState = {
  selectedDatarunID: '',
  selectedPeriodRange: {
    zoomValue: 1,
    eventRange: [0, 0],
    timeStamp: [0, 0],
  },
  activeEventID: null,
  isEventCommentsLoading: true,
  eventComments: [],
  isPredictionEnabled: false,
  eventDetails: {},
  isEditingEventRange: false,
  isEditingEventRangeDone: false,
  isPopupOpen: false,
  isAddingEvent: false,
  newEventDetails: null,
  filterTags: [],
  zoomDirection: '',
  zoomCounter: 0,
  zoomMode: true,
  periodLevel: {
    year: null,
    month: null,
    day: null,
    level: null,
  },
  isEventModeEnabled: true,
  uploadEventsStatus: null,
  eventUpdateStatus: null,
  isTranscriptSupported: false,
  isSpeechInProgress: false,
  isTimeSyncModeEnabled: true,
  scrollHistory: {
    year: null,
    month: null,
    level: 'year',
  },
  chartStyle: 'linear',
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

function SET_ACTIVE_EVENT_ID(nextState, { activeEventID }) {
  nextState.activeEventID = activeEventID;
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

function TOGGLE_EVENT_MODE(nextState, { isEventModeEnabled }) {
  nextState.isEventModeEnabled = isEventModeEnabled;
}

function IS_CHANGING_EVENT_RANGE(nextState, { isEditingEventRange }) {
  nextState.isEditingEventRange = isEditingEventRange;
}

function IS_UPDATE_POPUP_OPEN(nextState, { isPopupOpen }) {
  nextState.isPopupOpen = isPopupOpen;
}

function ADDING_NEW_EVENTS(nextState, { isAddingEvent }) {
  nextState.isAddingEvent = isAddingEvent;
}

function NEW_EVENT_DETAILS(nextState, { newEventDetails }) {
  nextState.isEventCommentsLoading = false;
  nextState.newEventDetails = newEventDetails;
}

function ADDING_NEW_EVENT_RESULT(nextState, { result }) {
  nextState.addingNewEvent = result;
}

function SET_FILTER_TAGS(nextState, { filterTags }) {
  nextState.filterTags = filterTags;
}

function ZOOM_ON_CLICK(nextState, { zoomDirection, zoomCounter }) {
  nextState.zoomCounter = zoomCounter;
  nextState.zoomDirection = zoomDirection;
}

function TOGGLE_ZOOM(nextState, { zoomMode }) {
  nextState.zoomMode = zoomMode;
}

function UPLOAD_JSON_EVENTS(nextState, { uploadEventsStatus }) {
  nextState.uploadEventsStatus = uploadEventsStatus;
}

function EVENT_UPDATE_STATUS(nextState, { eventUpdateStatus }) {
  nextState.eventUpdateStatus = eventUpdateStatus;
}

function SET_TRANSCRIPT_STATUS(nextState, { isTranscriptSupported }) {
  nextState.isTranscriptSupported = isTranscriptSupported;
}

function SPEECH_STATUS(nextState, { isSpeechInProgress }) {
  nextState.isSpeechInProgress = isSpeechInProgress;
}

function TOGGLE_TIME_SYNC_RANGE(nextState, { isTimeSyncModeEnabled }) {
  nextState.isTimeSyncModeEnabled = isTimeSyncModeEnabled;
}

function SET_CURRENT_PERIOD_LEVEL(nextState, { periodLevel }) {
  nextState.periodLevel = periodLevel;
}

function SET_SCROLL_HISTORY(nextState, { scrollHistory }) {
  nextState.scrollHistory = scrollHistory;
}

function SWITCH_CHART_STYLE(nextState, { chartStyle }) {
  nextState.chartStyle = chartStyle;
}

export default createReducer<DatarunState>(initialState, {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
  SET_ACTIVE_EVENT_ID,
  UPDATE_EVENT_DETAILS,
  TOGGLE_PREDICTION_MODE,
  GET_EVENT_COMMENTS_SUCCESS,
  IS_CHANGING_EVENT_RANGE,
  IS_UPDATE_POPUP_OPEN,
  ADDING_NEW_EVENTS,
  NEW_EVENT_DETAILS,
  ADDING_NEW_EVENT_RESULT,
  SET_FILTER_TAGS,
  ZOOM_ON_CLICK,
  TOGGLE_ZOOM,
  SET_CURRENT_PERIOD_LEVEL,
  TOGGLE_EVENT_MODE,
  UPLOAD_JSON_EVENTS,
  EVENT_UPDATE_STATUS,
  SET_TRANSCRIPT_STATUS,
  SPEECH_STATUS,
  TOGGLE_TIME_SYNC_RANGE,
  SET_SCROLL_HISTORY,
  SWITCH_CHART_STYLE,
});
