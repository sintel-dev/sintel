import { TOGGLE_SIMILAR_SHAPES_MODAL, FETCH_SIMILAR_SHAPES, UPDATE_DATARUN_EVENTS } from '../types';
import { getCurrentEventDetails, getDatarunDetails } from '../selectors/datarun';
import API from '../utils/api';
import { getSimilarShapesCoords } from '../selectors/similarShapes';
import { getSelectedExperimentData } from '../selectors/experiment';

export function toggleSimilarShapesAction(modalState) {
  return async function (dispatch) {
    dispatch({
      type: TOGGLE_SIMILAR_SHAPES_MODAL,
      isShapesModalOpen: modalState,
    });
  };
}

export function getSimilarShapesAction() {
  return function (dispatch, getState) {
    const eventDetails = getCurrentEventDetails(getState());
    let { datarun, start_time, stop_time } = eventDetails;
    start_time /= 1000;
    stop_time /= 1000;
    const action = {
      type: FETCH_SIMILAR_SHAPES,
      promise: API.similar_windows.all({}, { start: start_time, end: stop_time, datarun_id: datarun, number: 4 }),
    };

    dispatch(action);
    dispatch(toggleSimilarShapesAction(true));
  };
}

export function resetSimilarShapesAction() {
  return function (dispatch, getState) {
    const currentShapes = getSimilarShapesCoords(getState());
    if (currentShapes.length !== 0) {
      dispatch({ type: 'RESET_SIMILAR_SHAPES' });
    }
  };
}

function saveNewShape(currentShape) {
  return async function (dispatch, getState) {
    const dataRun = getDatarunDetails(getState());
    const selectedExperimentData = getSelectedExperimentData(getState());
    const datarunIndex = selectedExperimentData.data.dataruns.findIndex((dataItem) => dataItem.id === dataRun.id);
    const { timeSeries } = dataRun;
    const { start, end } = currentShape;

    const shapePayload = {
      start_time: timeSeries[start][0] / 1000,
      stop_time: timeSeries[end][0] / 1000,
      score: '0.00', // @TODO - add this data and the one below
      tag: 'Untagged',
      datarun_id: dataRun.id,
    };

    await API.events.create(shapePayload).then(async () => {
      await API.events.all(dataRun.id).then((newEvents) => {
        const newDatarunEvents = newEvents.events.filter((currentEvent) => currentEvent.datarun === dataRun.id);
        dispatch({
          type: UPDATE_DATARUN_EVENTS,
          newDatarunEvents,
          datarunIndex,
        });
      });
    });
  };
}

export function saveSimilarShapesAction() {
  return async function (dispatch, getState) {
    // @TODO - backend should provide a single endpoint, single API call instead of 5
    const currentShapes = getSimilarShapesCoords(getState());
    currentShapes.map((current) => dispatch(saveNewShape(current)));
  };
}
