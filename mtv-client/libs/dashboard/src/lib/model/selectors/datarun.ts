import { createSelector } from 'reselect';
import { RootState, DatarunDataType } from '../types';

import { getSelectedExperimentData, getProcessedDataRuns, filteringTags } from './experiment';
import { groupEventsByTimestamp } from '../utils/Utils';

// @TODO - set state: RootState
const getActiveEventID = state => state.datarun.activeEventID;
const getEventComments = state => state.datarun.eventComments;
const isEventCommentsLoading = state => state.datarun.isEventCommentsLoading;

export const getUpdatedEventsDetails = state => state.datarun.eventDetails;
export const getNewEventDetails = state => state.datarun.newEventDetails;
export const isPredictionEnabled = state => state.datarun.isPredictionEnabled;
export const isDatarunIDSelected = (state: RootState) => state.datarun.selectedDatarunID;
export const getSelectedPeriodRange = (state: RootState) => state.datarun.selectedPeriodRange;
export const getIsEditingEventRange = state => state.datarun.isEditingEventRange;
export const getIsEditingEventRangeDone = state => state.datarun.isEditingEventRangeDone;
export const getIsPopupOpen = state => state.datarun.isPopupOpen;
export const getIsAddingNewEvents = state => state.datarun.isAddingEvent;
export const getAddingNewEventStatus = state => state.datarun.addingNewEvent;
export const getZoomOnClickDirection = state => state.datarun.zoomDirection;
export const getZoomCounter = state => state.datarun.zoomCounter;
export const getZoomMode = state => state.datarun.zoomMode;
export const getReviewPeriod = state => state.datarun.reviewPeriod;
export const getSelectedPeriodLevel = state => state.datarun.periodLevel;

const filterDatarunPeriod = (period, periodLevel, reviewPeriod) => {
  const { month, year } = periodLevel;

  let periodData = period;
  const filterByYear = () => period.find(currentPeriod => currentPeriod.name === year).children;
  const filterByMonth = () => periodData.find(monthLevel => monthLevel.name === month).children;

  if (year) {
    periodData = filterByYear();
  }
  if (month) {
    periodData = filterByMonth();
  }

  if (reviewPeriod) {
    if (reviewPeriod === 'year') {
      periodData = period;
    }
    if (reviewPeriod === 'month') {
      periodData = filterByYear();
    }
  }
  return periodData;
};

export const getSelectedDatarunID = createSelector(
  [getSelectedExperimentData, isDatarunIDSelected],
  (selectedExperimentData, selectedDatarunID): string =>
    selectedDatarunID || selectedExperimentData.data.dataruns[0].id,
);

const getSelectedDatarun = createSelector(
  [getProcessedDataRuns, getSelectedDatarunID],
  (processedDataruns, selectedDatarunID) => {
    const dataRun = processedDataruns.find((datarun: DatarunDataType) => datarun.id === selectedDatarunID);
    return dataRun;
  },
);

export const getDatarunDetails = createSelector(
  [getSelectedDatarun, getSelectedPeriodLevel, getReviewPeriod, getUpdatedEventsDetails],
  (dataRun, periodLevel, reviewPeriod, updatedEventDetails) => {
    let { period, events, eventWindows, timeSeries } = dataRun;
    const selectedPeriod = filterDatarunPeriod(period, periodLevel, reviewPeriod);

    let currentDataRunEvents = [...events];
    let currentEventIndex = events.findIndex(currentEvent => currentEvent.id === updatedEventDetails.id);

    if (currentEventIndex !== -1) {
      updateDatarunEventWindow(updatedEventDetails, timeSeries, currentDataRunEvents, currentEventIndex, eventWindows);
    }

    const grouppedEvents = groupEventsByTimestamp(currentDataRunEvents);
    const completeDataRun = { ...dataRun, period: selectedPeriod, grouppedEvents };
    return completeDataRun;
  },
);

export const getCurrentEventDetails = createSelector(
  [getDatarunDetails, getActiveEventID, isEventCommentsLoading, getEventComments],
  (datarun, activeEventID, isCommentsLoading, eventComments) => {
    if (activeEventID === null) {
      return null;
    }
    const { timeSeries } = datarun;
    const currentEvent = datarun.eventWindows.find(windowEvent => windowEvent[3] === activeEventID);

    const start_time = datarun.timeSeries[currentEvent[0]][0];
    const stop_time = datarun.timeSeries[currentEvent[1]][0];
    const eventTag = currentEvent[4];
    const startIndex = timeSeries.findIndex(element => start_time - element[0] < 0) - 1;
    const stopIndex = timeSeries.findIndex(element => stop_time - element[0] < 0);

    if (startIndex === -1 || stopIndex === -1) {
      return null;
    }

    const eventDetails = {
      id: activeEventID,
      tag: eventTag,
      start_time: timeSeries[startIndex][0],
      stop_time: timeSeries[stopIndex][0],
      datarun: datarun.id,
      signal: datarun.signal,
      eventComments,
      isCommentsLoading,
    };
    return eventDetails;
  },
);

const updateDatarunEventWindow = (
  updatedEventDetails: any,
  timeSeries: any,
  currentDataRunEvents: any[],
  currentEventIndex: any,
  eventWindows: any,
) => {
  let { start_time, stop_time } = updatedEventDetails;
  const startIndex = timeSeries.findIndex(element => updatedEventDetails.start_time - element[0] < 0) - 1;
  const stopIndex = timeSeries.findIndex(element => updatedEventDetails.stop_time - element[0] < 0);
  const currentEventWindow = eventWindows.findIndex(currentWindow => currentWindow[3] === updatedEventDetails.id);

  start_time = timeSeries[startIndex][0] / 1000;
  stop_time = timeSeries[stopIndex][0] / 1000;

  currentDataRunEvents[currentEventIndex] = { ...updatedEventDetails, start_time, stop_time };
  eventWindows[currentEventWindow][0] = startIndex;
  eventWindows[currentEventWindow][1] = stopIndex;
  eventWindows[currentEventWindow][4] = updatedEventDetails.tag;
};
