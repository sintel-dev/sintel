import createReducer from '../store/createReducer';

function SELECT_DATARUN(nextState, { datarunID }) {
    nextState.selectedDatarunID = datarunID;
}

function SET_TIMESERIES_PERIOD(nextState, { periodRange }) {
    nextState.selectedPeriodRange = periodRange;
}

export default createReducer({
    selectedDatarunID: null,
    selectedTimePeriod: [],
    selectedPeriodRange: {},
}, {
    SELECT_DATARUN,
    SET_TIMESERIES_PERIOD,
});
