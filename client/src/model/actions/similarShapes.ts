import Cookies from 'js-cookie';
import {
  TOGGLE_SIMILAR_SHAPES_MODAL,
  UPDATE_DATARUN_EVENTS,
  UPDATE_SIMILAR_SHAPES,
  SET_ACTIVE_SHAPE,
  CHANGE_SHAPES_METRICS,
} from '../types';
import { getCurrentEventDetails, getDatarunDetails } from '../selectors/datarun';
import API from '../utils/api';
import {
  getSimilarShapesCoords,
  getSimilarShapesFound,
  getActiveShape,
  getCurrentShapeMetrics,
  similarShapesResults,
  getPercentageInterval,
} from '../selectors/similarShapes';
import { getSelectedExperimentData } from '../selectors/experiment';
import { AUTH_USER_DATA } from '../utils/constants';

const percentageCount = () => {
  const stepValues = [];
  for (let iterator = 0; iterator <= 100; iterator += 5) {
    stepValues.push(iterator);
  }

  return stepValues;
};

export function toggleSimilarShapesAction(modalState) {
  return async function (dispatch) {
    dispatch({
      type: TOGGLE_SIMILAR_SHAPES_MODAL,
      isShapesModalOpen: modalState,
    });
  };
}

export function getSimilarShapesAction() {
  return async function (dispatch, getState) {
    const eventDetails = getCurrentEventDetails(getState());
    const shapeMetric = getCurrentShapeMetrics(getState());
    let { datarun, start_time, stop_time } = eventDetails;
    start_time /= 1000;
    stop_time /= 1000;

    const getMinpercentage = (currentPercent) => {
      const percentageRange = percentageCount();
      const percentageIndex = percentageRange.findIndex((current) => current >= currentPercent);
      return percentageRange[percentageIndex];
    };

    dispatch({ type: 'FETCH_SIMILAR_SHAPES_REQUEST' });
    await API.similar_windows
      .all({}, { start: start_time, end: stop_time, datarun_id: datarun, metric: shapeMetric })
      .then((shapesData) => {
        dispatch({ type: 'FETCH_SIMILAR_SHAPES_SUCCESS', similarShapes: shapesData.windows });
        const currentShapes = getSimilarShapesCoords(getState());
        const currentPercent = currentShapes[4]?.similarity * 100 || 0;
        const minPercentage = getMinpercentage(currentPercent);

        dispatch(updateCurrentPercentage(minPercentage));
        dispatch(toggleSimilarShapesAction(true));
      })
      .catch((error) => dispatch({ type: 'FETCH_SIMILAR_SHAPES_FAILURE', error }));
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
    const userData = JSON.parse(Cookies.get(AUTH_USER_DATA));

    const shapePayload = {
      start_time: timeSeries[start][0] / 1000,
      stop_time: timeSeries[end][0] / 1000,
      score: '0.00', // @TODO - add this data
      tag: currentShape.tag || 'Untagged',
      datarun_id: dataRun.id,
      source: 'SHAPE_MATCHING',
      created_by: userData.name,
    };
    return API.events.create(shapePayload);
  };
}

export function saveSimilarShapesAction() {
  return async function (dispatch, getState) {
    // @TODO - backend should provide a single endpoint, single API call instead of 5
    const currentShapes = getSimilarShapesCoords(getState());
    const [minPercentage] = getPercentageInterval(getState());

    currentShapes.filter((shape) => shape.similarity >= minPercentage);

    const dataRun = getDatarunDetails(getState());
    const selectedExperimentData = getSelectedExperimentData(getState());
    const datarunIndex = selectedExperimentData.data.dataruns.findIndex((dataItem) => dataItem.id === dataRun.id);

    await currentShapes.forEach((current) =>
      dispatch(saveNewShape(current)).then(async () => {
        await API.events.all(dataRun.id).then((newEvents) => {
          const newDatarunEvents = newEvents.events.filter((currentEvent) => currentEvent.datarun === dataRun.id);
          dispatch({
            type: UPDATE_DATARUN_EVENTS,
            newDatarunEvents,
            datarunIndex,
          });
        });
      }),
    );

    dispatch(resetSimilarShapesAction());
    dispatch(toggleSimilarShapesAction(false));
  };
}

export function shapesTagsOverrideAction(tag) {
  return function (dispatch, getState) {
    const currentShapes = getSimilarShapesFound(getState());
    const updatedShapes = currentShapes.map((current) => ({ ...current, tag }));

    dispatch({
      type: 'UPDATE_SHAPES_TAG',
      tag,
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

export function resetShapesTagsAction() {
  return function (dispatch, getState) {
    const currentShapes = getSimilarShapesFound(getState());
    const updatedShapes = currentShapes.map((shape) => ({ ...shape, tag: null }));
    dispatch({
      type: 'UPDATE_SHAPES_TAG',
      tag: null,
    });
    dispatch({
      type: UPDATE_SIMILAR_SHAPES,
      shapes: updatedShapes,
    });
  };
}

export function changeMetricsAction(metrics) {
  return function (dispatch) {
    dispatch({ type: CHANGE_SHAPES_METRICS, metrics });
  };
}

export function deleteShapeAction() {
  return function (dispatch, getState) {
    let similarShapes = [...similarShapesResults(getState())];
    const activeShape = getActiveShape(getState());
    const shapeIndex = similarShapes.findIndex((current) => current.similarity === activeShape.similarity);
    similarShapes.splice(shapeIndex, 1);

    dispatch({
      type: UPDATE_SIMILAR_SHAPES,
      shapes: similarShapes,
    });
  };
}

export function updateCurrentPercentage(newPercentage) {
  return function (dispatch) {
    dispatch({
      type: 'UPDATE_CURRENT_PERCENTAGE',
      percentageValue: newPercentage,
    });
  };
}
