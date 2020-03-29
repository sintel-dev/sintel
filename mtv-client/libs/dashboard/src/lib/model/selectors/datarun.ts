import { createSelector } from 'reselect';
import { RootState, DatarunDataType } from '../types';

import { getSelectedExperimentData, getProcessedDataRuns } from './experiment';
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

const updateEventDetails = (updatedEventDetails, timeSeries, eventIndex, eventWindows) => {
  let { start_time, stop_time, tag } = updatedEventDetails;

  const startIndex = timeSeries.findIndex(element => start_time - element[0] < 0) - 1;
  const stopIndex = timeSeries.findIndex(element => stop_time - element[0] < 0) - 2;

  eventWindows[eventIndex][0] = startIndex;
  eventWindows[eventIndex][1] = stopIndex;
  eventWindows[eventIndex][4] = tag;
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
    let currentEventIndex = events.findIndex(windowEvent => windowEvent.id === updatedEventDetails.id);

    if (currentEventIndex !== -1) {
      updateEventDetails(updatedEventDetails, timeSeries, currentEventIndex, eventWindows);
    }

    const completeDataRun = { ...dataRun, period: selectedPeriod };
    return completeDataRun;
  },
);

export const getGrouppedDatarunEvents = createSelector(
  [getSelectedDatarun, getUpdatedEventsDetails],
  (dataRun, updatedEventDetails) => {
    const currentEventIndex = dataRun.events.findIndex(datarunEvent => datarunEvent.id === updatedEventDetails.id);
    let { events } = dataRun;
    let currentEvents = [...events];

    if (currentEventIndex !== -1) {
      currentEvents[currentEventIndex] = {
        ...currentEvents[currentEventIndex],
        start_time: updatedEventDetails.start_time / 1000,
        stop_time: updatedEventDetails.stop_time / 1000,
        tag: updatedEventDetails.tag,
      };
    }

    return groupEventsByTimestamp(currentEvents);
  },
);

export const getCurrentEventDetails = createSelector(
  [getDatarunDetails, getActiveEventID, isEventCommentsLoading, getEventComments],
  (datarun, activeEventID, isCommentsLoading, eventComments) => {
    if (activeEventID === null) {
      return null;
    }
    const { timeSeries } = datarun;
    const eventIndex = datarun.eventWindows.find(windowEvent => windowEvent[3] === activeEventID);

    const start_time = datarun.timeSeries[eventIndex[0]][0];
    const stop_time = datarun.timeSeries[eventIndex[1]][0];
    const eventTag = eventIndex[4];

    const startIndex = timeSeries.findIndex(element => start_time - element[0] < 0) - 1;
    const stopIndex = timeSeries.findIndex(element => stop_time - element[0] < 0);

    // limit editing within the datarun timeseries range
    if (startIndex === -1 || stopIndex === -1) {
      return null;
    }

    const eventDetails = {
      id: activeEventID,
      tag: eventTag,
      start_time,
      stop_time,
      datarun: datarun.id,
      signal: datarun.signal,
      eventComments,
      isCommentsLoading,
    };
    return eventDetails;
  },
);
