import { createSelector } from 'reselect';
import { getSelectedExperimentData } from './experiment';

export const isDatarunIDSelected = (state) => state.datarun.selectedDatarunID;

export const getSelectedDatarunID = createSelector(
    [getSelectedExperimentData, isDatarunIDSelected],
    (selectedExperimentData, selectedDatarunID) => selectedDatarunID || selectedExperimentData.data.dataruns[0].id,
);

export const getSelectedTimePeriod = (state) => state.datarun.selectedTimePeriod;
