import { getCurrentEventDetails, getUpdatedEventsDetails, getDatarunDetails } from '../selectors/datarun';

import API from '../utils/api';
import {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
  UPDATE_EVENT_DETAILS,
  IS_CHANGING_EVENT_RANGE,
  SET_CURRENT_EVENT,
  GET_EVENT_COMMENTS_SUCCESS,
  TOGGLE_PREDICTION_MODE,
  SelectDatarunAction,
  SetTimeseriesPeriodAction,
  SAVE_EVENT_DETAILS,
  IS_UPDATE_POPUP_OPEN,
} from '../types';

export function selectDatarun(datarunID: string) {
  return function(dispatch) {
    const action: SelectDatarunAction = {
      type: SELECT_DATARUN,
      datarunID,
    };
    dispatch(action);
  };
}

export function setTimeseriesPeriod(eventRange: { eventRange: any; zoomValue: any }) {
  return function(dispatch) {
    const action: SetTimeseriesPeriodAction = {
      type: SET_TIMESERIES_PERIOD,
      eventRange,
    };
    dispatch(action);
  };
}

export function setCurrentEventAction(eventIndex) {
  return function(dispatch) {
    dispatch({ type: SET_CURRENT_EVENT, eventIndex });
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: true });
    dispatch(getEventComments());
  };
}

export function closeEventModal() {
  return function(dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());
    const datarun = getDatarunDetails(getState());
    const eventIndex = datarun.events.findIndex(data => data.id === currentEventDetails.id);

    // @TODO - reset time range as well (not only tag)
    const { tag } = datarun.events[eventIndex];

    const eventDetails = {
      ...currentEventDetails,
      tag,
    };

    dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails });
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
  };
}

export function getEventComments() {
  return async function(dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());
    if (currentEventDetails) {
      const evtComments = await API.comments.find(`?event_id=${currentEventDetails.id}`);
      dispatch({ type: GET_EVENT_COMMENTS_SUCCESS, eventComments: evtComments });
    }
  };
}

export function togglePredictionsAction(event) {
  return function(dispatch) {
    dispatch({ type: TOGGLE_PREDICTION_MODE, isPredictionEnabled: event });
  };
}

export function updateEventDetailsAction(updatedEventDetails) {
  return function(dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());
    dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: { ...currentEventDetails, ...updatedEventDetails } });
  };
}

export function isEditingEventRangeAction(eventState) {
  return function(dispatch) {
    dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: eventState });
  };
}

export function saveEventDetailsAction() {
  return async function(dispatch, getState) {
    const updatedEventDetails = getUpdatedEventsDetails(getState());
    const { comments } = updatedEventDetails;
    const { start_time, stop_time, score, tag } = updatedEventDetails;

    const start = start_time / 1000;
    const stop = stop_time / 1000;

    const payload = {
      start_time: start,
      stop_time: stop,
      score,
      tag,
      event_id: updatedEventDetails.id,
    };
    if (comments) {
      const commentData = {
        event_id: updatedEventDetails.id,
        text: comments,
        created_by: null, // no logged in user yet
      };

      // posting comments
      await API.comments.create(commentData);
      dispatch(getEventComments());
      dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: { ...updatedEventDetails, comments: '' } });
    }

    await API.events.update(updatedEventDetails.id, payload).then(() => {
      dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: updatedEventDetails });
      dispatch({ type: SAVE_EVENT_DETAILS, eventDetails: updatedEventDetails });
      dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
    });
  };
}
