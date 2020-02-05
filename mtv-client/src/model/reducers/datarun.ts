import { SelectDatarunAction, SetTimeseriesPeriodAction, DatarunState } from '../types';
import createReducer from '../store/createReducer';

const initialState: DatarunState = {
  selectedDatarunID: '',
  selectedPeriodRange: {
    zoomValue: 1,
    eventRange: [0, 0],
  },
};

/**
 * update the currently selected datarunID to state
 */
function SELECT_DATARUN(nextState: DatarunState, action: SelectDatarunAction) {
  nextState.selectedDatarunID = action.datarunID;
}

/**
 * set the selectedPeriodRange
 */
function SET_TIMESERIES_PERIOD(nextState: DatarunState, action: SetTimeseriesPeriodAction) {
  nextState.selectedPeriodRange = action.eventRange;
}

export default createReducer<DatarunState>(initialState, {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
});
