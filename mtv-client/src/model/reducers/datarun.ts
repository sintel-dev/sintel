import createReducer from '../store/createReducer';

export type DatarunState = {
  selectedDatarunID: string | null;
  selectedTimePeriod: number[];
};

let initialState: DatarunState = {
  selectedDatarunID: null,
  selectedTimePeriod: [],
};

function SELECT_DATARUN(nextState, { datarunID }) {
  nextState.selectedDatarunID = datarunID;
}

function SET_TIMESERIES_PERIOD(nextState, { period }) {
  nextState.selectedTimePeriod = period;
}

export default createReducer(initialState, {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
});
