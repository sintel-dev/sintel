import createReducer from '../store/createReducer';

export type DatarunState = {
  selectedDatarunID: string | null;
  selectedTimePeriod: number[];
  selectedPeriodRange: Object; // what is the format?
};

let initialState: DatarunState = {
  selectedDatarunID: null,
  selectedTimePeriod: [],
  selectedPeriodRange: {},
};

// reducer 1
type AC_SELECT_DATARUN = {
  datarunID: string | null;
};
function SELECT_DATARUN(nextState: DatarunState, { datarunID }: AC_SELECT_DATARUN) {
  nextState.selectedDatarunID = datarunID;
}

// reducer 2
type AC_SET_TIMESERIES_PERIOD = {
  eventRange: Object; // what is the format?
};
function SET_TIMESERIES_PERIOD(nextState: DatarunState, { eventRange }: AC_SET_TIMESERIES_PERIOD) {
  nextState.selectedPeriodRange = eventRange;
}

export default createReducer(initialState, {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
});
