import { createSelector } from 'reselect';

import { getDatarunDetails } from './datarun';

export const getIsSimilarShapesModalOpen = (state) => state.similarShapes.isShapesModalOpen;
export const getIsSimilarShapesLoading = (state) => state.similarShapes.isSimilarShapesLoading;
export const getSimilarShapesFound = (state) => state.similarShapes.similarShapes;

export const getSimilarShapesCoords = createSelector(
  [getIsSimilarShapesLoading, getSimilarShapesFound, getDatarunDetails],
  (isShapesLoading, similarShapes, dataRun) => {
    if (isShapesLoading) {
      return null;
    }

    const { timeSeries } = dataRun;
    return similarShapes.map((currentShape) => {
      const { start, end } = currentShape;
      const startIndex = timeSeries.findIndex((element) => start * 1000 - element[0] < 0) - 1;
      const stopIndex = timeSeries.findIndex((element) => end * 1000 - element[0] < 0);
      return { ...currentShape, start: startIndex, end: stopIndex };
    });
  },
);
