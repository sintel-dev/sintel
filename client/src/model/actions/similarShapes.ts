import {
  TOGGLE_SIMILAR_SHAPES_MODAL,
  FETCH_SIMILAR_SHAPES,
  UPDATE_DATARUN_EVENTS,
  UPDATE_SIMILAR_SHAPES,
  UPDATE_EVENT_DETAILS,
  SET_ACTIVE_SHAPE,
} from '../types';
import { getCurrentEventDetails, getDatarunDetails } from '../selectors/datarun';
import API from '../utils/api';
import { getSimilarShapesCoords, getSimilarShapesFound, getActiveShape } from '../selectors/similarShapes';
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
    const { timeSeries } = dataRun;
    const { start, end } = currentShape;

    const shapePayload = {
      start_time: timeSeries[start][0] / 1000,
      stop_time: timeSeries[end][0] / 1000,
      score: '0.00', // @TODO - add this data
      tag: currentShape.tag || 'Untagged',
      datarun_id: dataRun.id,
      source: 'SHAPE_MATCHING',
    };
    return API.events.create(shapePayload);
  };
}

export function saveSimilarShapesAction() {
  return async function (dispatch, getState) {
    // @TODO - backend should provide a single endpoint, single API call instead of 5
    const currentShapes = getSimilarShapesCoords(getState());

    const dataRun = getDatarunDetails(getState());
    const selectedExperimentData = getSelectedExperimentData(getState());
    const datarunIndex = selectedExperimentData.data.dataruns.findIndex((dataItem) => dataItem.id === dataRun.id);

    await currentShapes.map((current) =>
      dispatch(saveNewShape(current)).then(async () => {
        await API.events.all(dataRun.id).then((newEvents) => {
          const newDatarunEvents = newEvents.events.filter((currentEvent) => currentEvent.datarun === dataRun.id);
          dispatch({
            type: UPDATE_DATARUN_EVENTS,
            newDatarunEvents,
            datarunIndex,
          }).then(() => {
            dispatch(resetSimilarShapesAction());
            dispatch(toggleSimilarShapesAction(false));
          });
        });
      }),
    );
  };
}

export function shapesTagsOverrideAction(tag) {
  return function (dispatch, getState) {
    const currentShapes = getSimilarShapesFound(getState());
    const updatedShapes = currentShapes.map((current) => ({ ...current, tag }));
    const currentEvent = getCurrentEventDetails(getState());

    dispatch({
      type: UPDATE_EVENT_DETAILS,
      eventDetails: { ...currentEvent, tag },
    });

    dispatch({
      type: UPDATE_SIMILAR_SHAPES,
      shapes: updatedShapes,
    });
  };
}

export function setActiveShapeAction(activeShape) {
  return function (dispatch) {
    dispatch({
      type: SET_ACTIVE_SHAPE,
      activeShape,
    });
  };
}

export function changeActiveShapeTagAction(tag) {
  return function (dispatch, getState) {
    const currentShapes = getSimilarShapesFound(getState());
    const activeShape = { ...getActiveShape(getState()), tag };
    const { start, end } = activeShape;
    const dataRun = getDatarunDetails(getState());
    const { timeSeries } = dataRun;
    const updatedShape = { ...activeShape, start: timeSeries[start][0] / 1000, end: timeSeries[end][0] / 1000, tag };
    const shapeIndex = currentShapes.findIndex((current) => current.similarity === activeShape.similarity);

    currentShapes[shapeIndex] = updatedShape;

    dispatch({
      type: UPDATE_SIMILAR_SHAPES,
      shapes: currentShapes,
    });
  };
}
