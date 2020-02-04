import { getCurrentEventDetails } from '../selectors/datarun';
import { api } from './utils';

export function selectDatarun(datarunID) {
  return function(dispatch) {
    dispatch({ type: 'UPDATE_EVENT_DETAILS', eventDetails: {} });
    dispatch({ type: 'SET_CURRENT_EVENT', eventIndex: null });
    dispatch({ type: 'SELECT_DATARUN', datarunID });
  };
}

export function setTimeseriesPeriod(eventRange) {
  return function(dispatch) {
    dispatch({ type: 'SET_TIMESERIES_PERIOD', eventRange });
  };
}

export function setCurrentEventAction(eventIndex) {
  return function(dispatch) {
    dispatch({ type: 'UPDATE_EVENT_DETAILS', eventDetails: {} });
    dispatch({ type: 'SET_CURRENT_EVENT', eventIndex });
    dispatch(getEventComments());
  };
}

export function getEventComments() {
  return function(dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());
    return (
      currentEventDetails &&
      api
        .get(`/comments/?event_id=${currentEventDetails.id}`)
        .then(evtComments => dispatch({ type: 'GET_EVENT_COMMENT_SUCCESS', evtComments: evtComments.comments }))
    );
  };
}

export function updateEventDetailsAction(updatedEventDetails) {
  return function(dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());
    dispatch({ type: 'UPDATE_EVENT_DETAILS', eventDetails: { ...currentEventDetails, ...updatedEventDetails } });
    // dispatch({ type: 'UPDATE_EVENT_DETAILS', eventDetails: { currentEventDetails, updatedEventDetails } });
  };
}

export function togglePredictionsAction(event) {
  return function(dispatch) {
    const isPredictionEnabled = event.target.checked;
    dispatch({ type: 'TOGGLE_PREDICTION_MODE', isPredictionEnabled });
  };
}
