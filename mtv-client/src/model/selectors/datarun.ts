import { createSelector } from 'reselect';
import { RootState, DatarunDataType } from '../types';

import { getSelectedExperimentData, getProcessedDataRuns, filteringTags } from './experiment';

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

const toTimestamp = function(strDate) {
  let datum = Date.parse(strDate);
  return datum / 1000;
};

const groupEventsByTimestamp = events => {
  let result = {};
  events.forEach(event => {
    const { start_time, stop_time } = event;

    const eventStartYear = new Date(start_time * 1000).getFullYear();
    const eventStopYear = new Date(stop_time * 1000).getFullYear();
    let currentYear = eventStartYear;
    while (currentYear <= eventStopYear) {
      const yearStartDate = toTimestamp(`01/01/${currentYear} 00:00:00`);
      const yearStopDate = toTimestamp(`12/31/${currentYear} 23:59:59`);

      const eventProps = {
        id: event.id,
        start_time: start_time >= yearStartDate ? start_time : yearStartDate,
        stop_time: stop_time <= yearStopDate ? stop_time : yearStopDate,
        tag: event.tag,
        score: event.score,
      };

      if (result[currentYear]) {
        result[currentYear].events[event.id] = eventProps;
      } else {
        result[currentYear] = {
          events: { [event.id]: eventProps },
          months: {},
        };
      }
      const eventStartMonth = new Date(result[currentYear].events[event.id].start_time * 1000).getMonth() + 1;
      const eventStopMonth = new Date(result[currentYear].events[event.id].stop_time * 1000).getMonth() + 1;
      let currentMonth = eventStartMonth;

      while (currentMonth <= eventStopMonth) {
        const maxDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const monthDateStart = toTimestamp(`${currentMonth}/01/${currentYear} 00:00:00`);
        const monthDateStop = toTimestamp(`${currentMonth}/${maxDaysInMonth}/${currentYear} 23:59:59`);

        let month = {
          id: event.id,
          start_time: start_time >= monthDateStart ? start_time : monthDateStart,
          stop_time: stop_time <= monthDateStop ? stop_time : monthDateStop,
          tag: event.tag,
          score: event.score,
          days: {},
        };

        const eventStartDay = new Date(month.start_time * 1000).getDate();
        const eventStopDay = new Date(month.stop_time * 1000).getDate();
        let currentDay = eventStartDay;

        result[currentYear].months[currentMonth] = month;

        while (currentDay <= eventStopDay) {
          const dayDateStart = toTimestamp(`${currentMonth}/${currentDay}/${currentYear} 00:00:00`);
          const dayDateStop = toTimestamp(`${currentMonth}/${currentDay}/${currentYear} 23:59:59`);

          let day = {
            id: event.id,
            start_time: start_time >= dayDateStart ? start_time : dayDateStart,
            stop_time: stop_time <= dayDateStop ? stop_time : dayDateStop,
            tag: event.tag,
            score: event.score,
          };

          result[currentYear].months[currentMonth].days[currentDay] = day;
          currentDay += 1;
        }

        currentMonth += 1;
      }
      currentYear += 1;
    }
  });
  return result;
};

export const getDatarunDetails = createSelector(
  [
    getSelectedDatarunID,
    getProcessedDataRuns,
    getSelectedPeriodLevel,
    getReviewPeriod,
    filteringTags,
    getUpdatedEventsDetails,
  ],
  (selectedDatarundID, processedDataruns, periodLevel, reviewPeriod, filterTags, updatedEventDetails) => {
    const dataRun = processedDataruns.find((datarun: DatarunDataType) => datarun.id === selectedDatarundID);
    let { period, events } = dataRun;
    const filteredPeriod = filterDatarunPeriod(period, periodLevel, reviewPeriod);

    let currentDataRunEvents = [...events];
    let currentEventIndex = events.findIndex(currentEvent => currentEvent.id === updatedEventDetails.id);
    if (currentEventIndex !== -1) {
      let { start_time, stop_time } = updatedEventDetails;
      start_time /= 1000;
      stop_time /= 1000;

      currentDataRunEvents[currentEventIndex] = { ...updatedEventDetails, start_time, stop_time };
    }
    const filteredEvents =
      (filterTags.length &&
        currentDataRunEvents.filter(function(currentEvent) {
          return this.indexOf(currentEvent.tag) !== -1;
        }, filterTags)) ||
      currentDataRunEvents;

    const grouppedEvents = groupEventsByTimestamp(filteredEvents);
    const newDataRun = { ...dataRun, period: filteredPeriod, grouppedEvents };
    return newDataRun;
  },
);

export const getCurrentEventDetails = createSelector(
  [getDatarunDetails, getActiveEventID, isEventCommentsLoading, getEventComments, getUpdatedEventsDetails],
  (datarun, activeEventID, isCommentsLoading, eventComments, updatedEventDetails) => {
    if (activeEventID === null) {
      return null;
    }

    const { timeSeries } = datarun;
    let start_time = 0;
    let stop_time = 0;
    let eventTag = '';

    if (updatedEventDetails.id !== activeEventID) {
      const currentEvent = datarun.eventWindows.find(event => event[3] === activeEventID);
      start_time = datarun.timeSeries[currentEvent[0]][0];
      stop_time = datarun.timeSeries[currentEvent[1]][0];
      eventTag = currentEvent[4];
    } else {
      start_time = updatedEventDetails.start_time;
      stop_time = updatedEventDetails.stop_time;
      eventTag = updatedEventDetails.tag;
    }

    const startIndex = timeSeries.findIndex(element => start_time - element[0] < 0) - 1;
    const stopIndex = timeSeries.findIndex(element => stop_time - element[0] < 0);
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
