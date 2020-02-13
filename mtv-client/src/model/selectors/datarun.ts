import { createSelector } from 'reselect';
import { RootState, DatarunDataType } from '../types';
import { getSelectedExperimentData, getProcessedDataRuns } from './experiment';

// @TODO - set state: RootState
const getEventIndex = state => state.datarun.eventIndex;
const getEventComments = state => state.datarun.eventComments;
const isEventCommentsLoading = state => state.datarun.isEventCommentsLoading;

export const getUpdatedEventsDetails = state => state.datarun.eventDetails;
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

export const getSelectedDatarunID = createSelector(
  [getSelectedExperimentData, isDatarunIDSelected],
  (selectedExperimentData, selectedDatarunID): string =>
    selectedDatarunID || selectedExperimentData.data.dataruns[0].id,
);

export const getDatarunDetails = createSelector(
  [getSelectedDatarunID, getProcessedDataRuns],
  (selectedDatarundID, processedDataruns) =>
    processedDataruns.find((datarun: DatarunDataType) => datarun.id === selectedDatarundID),
);

export const getCurrentEventDetails = createSelector(
  [getDatarunDetails, getEventIndex, isEventCommentsLoading, getEventComments, getUpdatedEventsDetails],
  (datarun, eventIndex, isCommentsLoading, eventComments, updatedDetails) => {
    if (eventIndex === null) {
      return null;
    }

    const { timeSeries } = datarun;
    const currentEvent = datarun.eventWindows[eventIndex];
    const start_time = (updatedDetails && updatedDetails.start_time) || datarun.timeSeries[currentEvent[0]][0];
    const stop_time = (updatedDetails && updatedDetails.stop_time) || datarun.timeSeries[currentEvent[1]][0];
    const startIndex = timeSeries.findIndex(element => start_time - element[0] < 0) - 1;
    const stopIndex = timeSeries.findIndex(element => stop_time - element[0] < 0);
    const eventDetails = {
      id: currentEvent?.[3],
      score: currentEvent?.[2],
      tag: updatedDetails.tag ? updatedDetails.tag : currentEvent?.[4],
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
