import { createSelector } from 'reselect';

import { getDatarunDetails, getCurrentEventDetails } from './datarun';

export const getIsSimilarShapesActive = (state) => state.similarShapes.isShapesModalOpen;
export const getIsSimilarShapesLoading = (state) => state.similarShapes.isSimilarShapesLoading;
export const similarShapesResults = (state) => state.similarShapes.similarShapes;
export const getActiveShape = (state) => state.similarShapes.activeShape;

export const getSimilarShapesFound = createSelector(
  [getIsSimilarShapesLoading, similarShapesResults, getCurrentEventDetails],
  (isSimilarShapesLoading, similarShapes, currentEvent) => {
    if (isSimilarShapesLoading || currentEvent === null) {
      return null;
    }

    let { start_time, stop_time } = currentEvent;
    start_time /= 1000;
    stop_time /= 1000;

    const filteredShapes = () =>
      similarShapes.filter((currentShape) => currentShape.start !== start_time && currentShape.end !== stop_time);

    const currentShapes = filteredShapes();
    return currentShapes;
  },
);

export const getSimilarShapesCoords = createSelector(
  [getIsSimilarShapesLoading, similarShapesResults, getDatarunDetails],
  (isShapesLoading, similarShapes, dataRun) => {
    if (isShapesLoading) {
      return [];
    }

    const { timeSeries } = dataRun;
    const { events } = dataRun;
    const currentEvents = [];

    // Avoid shapes overlaping entirely current events
    events.map((current) => {
      currentEvents.push(current.start_time);
      currentEvents.push(current.stop_time);
    });

    const filteredShapes = similarShapes.filter((shape) => currentEvents.indexOf(shape.start) === -1);
    return filteredShapes.map((currentShape) => {
      const { start, end } = currentShape;
      const startIndex = timeSeries.findIndex((element) => start * 1000 - element[0] < 0) - 1;
      const stopIndex = timeSeries.findIndex((element) => end * 1000 - element[0] < 0);
      return { ...currentShape, start: startIndex, end: stopIndex, source: 'SHAPE_MATCHING' };
    });
  },
);
