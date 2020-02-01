import { createSelector } from 'reselect';
import { RootState, DatarunDataType } from '../types/index';
import { getSelectedExperimentData, getProcessedDataRuns } from './experiment';

export const isDatarunIDSelected = (state: RootState) => state.datarun.selectedDatarunID;

export const getSelectedDatarunID = createSelector(
  [getSelectedExperimentData, isDatarunIDSelected],
  (selectedExperimentData, selectedDatarunID): string =>
    selectedDatarunID || selectedExperimentData.data.dataruns[0].id,
);

export const getSelectedPeriodRange = (state: RootState) => state.datarun.selectedPeriodRange;

export const getDatarunDetails = createSelector(
  [getSelectedDatarunID, getProcessedDataRuns],
  (selectedDatarundID, processedDataruns) =>
    processedDataruns.find((datarun: DatarunDataType) => datarun.id === selectedDatarundID),
);
