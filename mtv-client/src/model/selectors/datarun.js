import { createSelector } from 'reselect';
import { getSelectedExperimentData, getProcessedDataRuns } from './experiment';

export const isDatarunIDSelected = state => state.datarun.selectedDatarunID;

export const getSelectedDatarunID = createSelector(
  [getSelectedExperimentData, isDatarunIDSelected],
  (selectedExperimentData, selectedDatarunID) => selectedDatarunID || selectedExperimentData.data.dataruns[0].id,
);

export const getSelectedPeriodRange = state => state.datarun.selectedPeriodRange;

export const getDatarunDetails = createSelector(
  [getSelectedDatarunID, getProcessedDataRuns],
  (selectedDatarundID, processedDataruns) => processedDataruns.find(datarun => datarun.id === selectedDatarundID),
);

const getEventIndex = state => state.datarun.eventIndex;
const getEventComments = state => state.datarun.eventComments;
const isEventCommentsLoading = state => state.datarun.isEventCommentsLoading;
const getUpdatedEventsDetails = state => state.datarun.eventDetails;

export const getCurrentEventDetails = createSelector(
  [getDatarunDetails, getEventIndex, isEventCommentsLoading, getEventComments, getUpdatedEventsDetails],
  (datarun, eventIndex, isCommentsLoading, eventComments, updatedDetails) => {
    if (eventIndex === null) {
      return null;
    }

    const currentEvent = datarun.eventWindows[eventIndex];
    const eventDetails = {
      id: currentEvent[3],
      score: currentEvent[2],
      tag: updatedDetails && updatedDetails.tag ? updatedDetails.tag : currentEvent[4],
      start_time: new Date(datarun.timeSeries[currentEvent[0]][0]).toUTCString(),
      stop_time: new Date(datarun.timeSeries[currentEvent[1]][0]).toUTCString(),
      datarun: datarun.id,
      signal: datarun.signal,
      eventComments,
      isCommentsLoading,
    };
    return eventDetails;
  },
);
