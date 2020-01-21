import { createSelector } from 'reselect';
import { getSelectedExperimentData, getProcessedDataRuns } from './experiment';

export const isDatarunIDSelected = (state) => state.datarun.selectedDatarunID;

export const getSelectedDatarunID = createSelector(
    [getSelectedExperimentData, isDatarunIDSelected],
    (selectedExperimentData, selectedDatarunID) => selectedDatarunID || selectedExperimentData.data.dataruns[0].id,
);

export const getSelectedTimePeriod = (state) => state.datarun.selectedTimePeriod;

export const getDatarunDetails = createSelector(
    [getSelectedDatarunID, getProcessedDataRuns], (selectedDatarundID, processedDataruns) =>
        processedDataruns.find(datarun => datarun.id === selectedDatarundID),
);
