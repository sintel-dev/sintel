import { State } from '../reducers/index';
import { createSelector } from 'reselect';
import { getSelectedExperimentData, getProcessedDataRuns } from './experiment';

type Datarun = any;
// type Datarun = {
//   id: string;
// }

export const isDatarunIDSelected = (state: State) => state.datarun.selectedDatarunID;

export const getSelectedDatarunID = createSelector(
  [getSelectedExperimentData, isDatarunIDSelected],
  (selectedExperimentData, selectedDatarunID) => selectedDatarunID || selectedExperimentData.data.dataruns[0].id,
);

export const getSelectedPeriodRange = (state: State) => state.datarun.selectedPeriodRange;

export const getDatarunDetails = createSelector(
  [getSelectedDatarunID, getProcessedDataRuns],
  (selectedDatarundID, processedDataruns) =>
    processedDataruns.find((datarun: Datarun) => datarun.id === selectedDatarundID),
);
