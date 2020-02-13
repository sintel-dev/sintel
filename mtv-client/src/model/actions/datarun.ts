import {
  getCurrentEventDetails,
  getUpdatedEventsDetails,
  getDatarunDetails,
  getZoomCounter,
} from '../selectors/datarun';
import { getSelectedExperimentData } from '../../model/selectors/experiment';
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
  IS_UPDATE_POPUP_OPEN,
  ADDING_NEW_EVENTS,
  NEW_EVENT_DETAILS,
  ADDING_NEW_EVENT_RESULT,
  UPDATE_DATARUN_EVENTS,
  SET_FILTER_TAGS,
  ZOOM_ON_CLICK,
} from '../types';

export function selectDatarun(datarunID: string) {
  return function(dispatch) {
    const action: SelectDatarunAction = {
      type: SELECT_DATARUN,
      datarunID,
    };
    dispatch(action);
    dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent: false });
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
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

export function setActiveEventAction(eventIndex) {
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

    if (currentEventDetails.id) {
      // @TODO - reset time range as well (not only tag)
      const { tag } = datarun.events[eventIndex];

      const eventDetails = {
        ...currentEventDetails,
        tag,
      };
      dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails });
    } else {
      dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent: false });
    }

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

    if (updatedEventDetails.id) {
      await API.events.update(updatedEventDetails.id, payload).then(() => {
        dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: updatedEventDetails });
        dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
      });
    } else {
      dispatch(saveNewEventAction());
    }
  };
}

export function addNewEventAction(isAddingEvent) {
  return async function(dispatch) {
    dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent });
  };
}

export function updateNewEventDetailsAction(eventDetails) {
  return function(dispatch, getState) {
    const datarun = getDatarunDetails(getState());

    const eventTemplate = {
      ...eventDetails,
      datarun_id: datarun.id,
      score: '0',
      tag: '',
    };
    dispatch({ type: NEW_EVENT_DETAILS, eventDetails: eventTemplate });
    dispatch({ type: SET_CURRENT_EVENT, eventIndex: datarun.events.length });
  };
}

export function openNewDetailsPopupAction() {
  return function(dispatch) {
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: true });
  };
}

export function saveNewEventAction() {
  return async function(dispatch, getState) {
    const newEventDetails = getUpdatedEventsDetails(getState());
    let { start_time, stop_time } = newEventDetails;
    start_time /= 1000;
    stop_time /= 1000;
    const eventDetails = {
      start_time,
      stop_time,
      score: '0.00',
      tag: newEventDetails.tag || 'untagged',
      datarun_id: newEventDetails.datarun_id || newEventDetails.datarun,
    };

    await API.events
      .create(eventDetails)
      .then(async () => {
        await API.events.all(newEventDetails.datarun_id || newEventDetails.datarun).then(datarunEvents => {
          const datarun = getDatarunDetails(getState());
          const selectedExperimentData = getSelectedExperimentData(getState());
          const datarunIndex = selectedExperimentData.data.dataruns.findIndex(dataItem => dataItem.id === datarun.id);
          const newDatarunEvents = datarunEvents.events.filter(event => event.datarun === datarun.id);

          dispatch({
            type: UPDATE_DATARUN_EVENTS,
            newDatarunEvents,
            datarunIndex,
          });
          dispatch({ type: ADDING_NEW_EVENT_RESULT, result: 'success' });
          dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
          dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent: false });
        });
      })
      .catch(err => dispatch({ type: ADDING_NEW_EVENT_RESULT, result: err }));
  };
}

export function deleteEventAction() {
  return async function(dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());
    const datarunID = currentEventDetails.datarun;
    const selectedExperimentData = getSelectedExperimentData(getState());
    const datarunIndex = selectedExperimentData.data.dataruns.findIndex(dataItem => dataItem.id === datarunID);

    await API.events.delete(currentEventDetails.id).then(async () => {
      await API.events.all(datarunID).then(datarunEvents => {
        const newDatarunEvents = datarunEvents.events.filter(event => event.datarun === datarunID);
        // @TODO - address the case when the deleted comment is the last one
        // also delete the event from the top linechart
        dispatch({
          type: UPDATE_DATARUN_EVENTS,
          newDatarunEvents,
          datarunIndex,
        });
        dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
      });
    });
  };
}

export function filterEventsByTagAction(tags) {
  return function(dispatch) {
    dispatch({ type: SET_FILTER_TAGS, filterTags: tags });
  };
}

export function zoomOnClick(zoomDirection) {
  return function(dispatch, getState) {
    let zoomCounter = getZoomCounter(getState());
    zoomDirection === 'In' ? (zoomCounter += 1) : (zoomCounter -= 1);
    dispatch({ type: ZOOM_ON_CLICK, zoomDirection, zoomCounter });
  };
}
