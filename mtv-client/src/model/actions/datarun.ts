import { getCurrentEventDetails, getUpdatedEventsDetails } from '../selectors/datarun';
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
    // @TODO - update actions types accordingly (@see setTimeseriesPeriod above)
    dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: {} });
    dispatch({ type: SET_CURRENT_EVENT, eventIndex });
    dispatch(getEventComments());
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
    const currentEventDetails = getCurrentEventDetails(getState());
    const updatedEventDetails = getUpdatedEventsDetails(getState());
    const { comments } = updatedEventDetails;
    if (comments) {
      const commentData = {
        event_id: currentEventDetails.id,
        text: comments,
        created_by: null, // no logged in user yet
      };
      // posting comments
      await API.comments.create(commentData);
      dispatch(getEventComments());
      dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: { ...updatedEventDetails, comments: '' } });
      // dispatch({ type: 'POST_COMMENT_SUCCESS', newComments });

      // posting event details
    }

    // @TODO - close the popup on save success
  };
}
