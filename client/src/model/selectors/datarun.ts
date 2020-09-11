import { createSelector } from 'reselect';
import { RootState } from '../types';

import { getSelectedExperimentData, getProcessedDataRuns } from './experiment';
import { groupEventsByTimestamp, fromMonthToIndex } from '../utils/Utils';
import { getCurrentEventHistory } from './events';
import { getCurrentActivePanel } from './sidebar';

// @TODO - set state: RootState
const getEventComments = (state) => state.datarun.eventComments;
const isEventCommentsLoading = (state) => state.datarun.isEventCommentsLoading;

export const getActiveEventID = (state) => state.datarun.activeEventID;
export const getUpdatedEventDetails = (state) => state.datarun.eventDetails;
export const getNewEventDetails = (state) => state.datarun.newEventDetails;
export const isPredictionEnabled = (state) => state.datarun.isPredictionEnabled;
export const isDatarunIDSelected = (state: RootState) => state.datarun.selectedDatarunID;
export const getSelectedPeriodRange = (state: RootState) => state.datarun.selectedPeriodRange;
export const getIsEditingEventRange = (state) => state.datarun.isEditingEventRange;
export const getIsEditingEventRangeDone = (state) => state.datarun.isEditingEventRangeDone;
export const getIsPopupOpen = (state) => state.datarun.isPopupOpen;
export const getIsAddingNewEvents = (state) => state.datarun.isAddingEvent;
export const getAddingNewEventStatus = (state) => state.datarun.addingNewEvent;
export const getZoomOnClickDirection = (state) => state.datarun.zoomDirection;
export const getZoomCounter = (state) => state.datarun.zoomCounter;
export const getZoomMode = (state) => state.datarun.zoomMode;
export const getSelectedPeriodLevel = (state) => state.datarun.periodLevel;
export const getIsEventModeEnabled = (state) => state.datarun.isEventModeEnabled;
export const getUploadEventsStatus = (state) => state.datarun.uploadEventsStatus;
export const getUpdateEventStatus = (state) => state.datarun.eventUpdateStatus;
export const getIsTranscriptSupported = (state) => state.datarun.isTranscriptSupported;
export const getIsSpeechInProgress = (state) => state.datarun.isSpeechInProgress;
export const getIsTimeSyncModeEnabled = (state) => state.datarun.isTimeSyncModeEnabled;
export const getScrollHistory = (state) => state.datarun.scrollHistory;
export const getCurrentChartStyle = (state) => state.datarun.chartStyle;

export const getSelectedDatarunID = createSelector(
  [getSelectedExperimentData, isDatarunIDSelected],
  (selectedExperimentData, selectedDatarunID): string => {
    const { isExperimentDataLoading } = selectedExperimentData;
    if (isExperimentDataLoading) {
      return null;
    }
    return selectedDatarunID || selectedExperimentData.data.dataruns[0].id;
  },
);

type ProcessedDatarun = ReturnType<typeof getProcessedDataRuns>[0];

export const getSelectedDatarun = createSelector(
  [getProcessedDataRuns, getSelectedDatarunID],
  (processedDataruns, selectedDatarunID) => {
    if (selectedDatarunID === null) {
      return null;
    }
    const dataRun = processedDataruns.find((datarun: ProcessedDatarun) => datarun.id === selectedDatarunID);
    return dataRun;
  },
);

const updateEventDetails = (updatedEventDetails, timeSeries, eventIndex, eventWindows) => {
  let { start_time, stop_time, tag, score } = updatedEventDetails;

  const startIndex = timeSeries.findIndex((element) => start_time - element[0] < 0) - 1;
  const stopIndex = timeSeries.findIndex((element) => stop_time - element[0] < 0) - 1;
  eventWindows[eventIndex][0] = startIndex;
  eventWindows[eventIndex][1] = stopIndex;
  eventWindows[eventIndex][2] = score;
  eventWindows[eventIndex][4] = tag;
};

const filterByTimeRange = (range, stack) => {
  if (range[0] === 0 && range[1] === 0) {
    return stack;
  }

  const yearStart = new Date(range[0]).getFullYear();
  const yearEnd = new Date(range[1]).getFullYear();

  const filterByYear = stack.filter((currentYear) =>
    yearStart !== yearEnd
      ? currentYear.name >= yearStart && currentYear.name <= yearEnd
      : currentYear.name === yearStart,
  );

  if (filterByYear.length === 1) {
    const months = filterByYear[0].children;
    const monthStart = new Date(range[0]).getMonth() + 1;
    const monthEnd = new Date(range[1]).getMonth() + 1;

    const filteredByMonth = months.filter(
      (currentMonth) =>
        fromMonthToIndex(currentMonth.name) >= monthStart && fromMonthToIndex(currentMonth.name) <= monthEnd,
    );

    if (filteredByMonth.length === 1) {
      return filteredByMonth[0].children;
    }

    return filteredByMonth;
  }

  return filterByYear;
};

export const getFilterDatarunPeriod = createSelector(
  [getSelectedDatarun, getSelectedPeriodLevel],
  (dataRun, periodLevel) => {
    if (dataRun === null) {
      return null;
    }

    const { level, year, month } = periodLevel;
    const { period } = dataRun;

    const filterByYear = () => period.find((currentPeriod) => currentPeriod.name === year).children;
    const filterByMonth = () => filterByYear().find((monthLevel) => monthLevel.name === month).children;

    switch (level) {
      case 'year':
        return filterByYear();
      case 'month':
        return filterByMonth();
      default:
        return period;
    }
  },
);

export const getFilteredPeriodRange = createSelector(
  [getSelectedDatarun, getSelectedPeriodRange],
  (dataRun, periodRange) => {
    if (dataRun === null) {
      return null;
    }
    const { period } = dataRun;
    let filteredRange = filterByTimeRange(periodRange.timeStamp, period);

    return filteredRange.length ? filteredRange : period;
  },
);

export const getDatarunDetails = createSelector(
  [
    getSelectedDatarun,
    getUpdatedEventDetails,
    getFilteredPeriodRange,
    getIsTimeSyncModeEnabled,
    getFilterDatarunPeriod,
  ],
  (dataRun, updatedEventDetails, filteredRange, isTimeSyncEnabled, filteredDatarunPeriod) => {
    if (dataRun === null) {
      return null;
    }
    let { events, eventWindows, timeSeries } = dataRun;
    let currentEventIndex = events.findIndex((windowEvent) => windowEvent.id === updatedEventDetails.id);

    if (currentEventIndex !== -1) {
      updateEventDetails(updatedEventDetails, timeSeries, currentEventIndex, eventWindows);
    }
    const selectedPeriod = isTimeSyncEnabled ? filteredRange : filteredDatarunPeriod;

    const datarunDetails = { ...dataRun, period: selectedPeriod };
    return datarunDetails;
  },
);

export const getGrouppedDatarunEvents = createSelector(
  [getSelectedDatarun, getUpdatedEventDetails],
  (dataRun, updatedEventDetails) => {
    const currentEventIndex = dataRun.events.findIndex((datarunEvent) => datarunEvent.id === updatedEventDetails.id);
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
    const eventInfo = datarun.events.find((event) => event.id === activeEventID);
    const eventIndex = datarun.eventWindows.find((windowEvent) => windowEvent[3] === activeEventID);

    if (eventInfo === undefined) {
      return null;
    }

    const start_time = datarun.timeSeries[eventIndex[0]][0];
    const stop_time = datarun.timeSeries[eventIndex[1]][0];
    const score = eventIndex[2];
    const eventTag = eventIndex[4];
    const { source, signalrunID } = eventInfo;

    const startIndex = timeSeries.findIndex((element) => start_time - element[0] < 0) - 1;
    const stopIndex = timeSeries.findIndex((element) => stop_time - element[0] < 0);

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
      score,
      source,
      signalrunID,
    };
    return eventDetails;
  },
);

export const getEventSortedHistory = createSelector(
  [getCurrentEventDetails, getCurrentEventHistory],
  (eventDetails, eventHistory) => {
    if (eventDetails === null || eventHistory === null) {
      return null;
    }

    const eventData = [];
    const { comments } = eventDetails.eventComments || null;
    eventData?.push(...comments);
    eventData?.push(...eventHistory);

    const stringToTimestamp = (string) => new Date(string).getTime();

    const sortedHistory = eventData.sort(
      (prev, current) => stringToTimestamp(prev.insert_time) - stringToTimestamp(current.insert_time),
    );

    return sortedHistory;
  },
);

export const getIsAggregationActive = createSelector(
  [getActiveEventID, getCurrentActivePanel, getIsEditingEventRange],
  (eventID, activePanel, isEditingEventRange) =>
    eventID !== null && activePanel === 'eventView' && !isEditingEventRange,
);
