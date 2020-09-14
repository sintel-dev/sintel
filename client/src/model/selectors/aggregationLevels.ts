import { createSelector } from 'reselect';

const getCurrentEventInterval = (state) => state.aggregationLevels.eventInterval;
export const getIsAggregationModalOpen = (state) => state.aggregationLevels.isAggregationModalOpen;
export const getAggregationTimeLevel = (state) => state.aggregationLevels.aggregationTimeLevel;
export const getIsSigRawLoading = (state) => state.aggregationLevels.isSignalRawLoading;
export const getCurrentSignalRawData = (state) => state.aggregationLevels.singalRawData;
export const getContextInfoValue = (state) => state.aggregationLevels.contextValue;

export const getSignalRawData = createSelector(
  [getIsSigRawLoading, getCurrentSignalRawData],
  (isSignalRawLoading, currentSignalRaw) => {
    if (isSignalRawLoading) {
      return null;
    }
    const timeStampConverted = [];

    currentSignalRaw.forEach((current) => {
      const start_time = current[0] * 1000;
      timeStampConverted.push([start_time, current[1]]);
    });
    return timeStampConverted;
  },
);

// get the event interval out of signalRaw data granulation
export const getEventInterval = createSelector(
  [getSignalRawData, getCurrentEventInterval, getIsSigRawLoading],
  (signalRawData, eventInterval, isSignalRawLoading) => {
    if (isSignalRawLoading) {
      return null;
    }
    return signalRawData.filter(
      (current) => current[0] >= eventInterval[0][0] && current[0] <= eventInterval[eventInterval.length - 1][0],
    );
  },
);
