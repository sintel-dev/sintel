import { State } from '../reducers/index';

export const getSelectedDatarunID = (state: State) => state.datarun.selectedDatarunID;
export const getSelectedTimePeriod = (state: State) => state.datarun.selectedTimePeriod;
