import createReducer from '../store/createReducer';

function SELECT_DATARUN(nextState, { datarunID }) {
    nextState.selectedDatarunID = datarunID;
}

function SET_TIMESERIES_PERIOD(nextState, { period }) {
    nextState.selectedPeriodRange = period;
}

export default createReducer({
    selectedDatarunID: null,
    selectedTimePeriod: [],
}, {
    SELECT_DATARUN,
    SET_TIMESERIES_PERIOD,
});
