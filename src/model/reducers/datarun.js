import createReducer from '../store/createReducer';

function SELECT_DATARUN(nextState, { datarunID }) {
    nextState.selectedDatarunID = datarunID;
}

export default createReducer({
    dataSetsList: [],
}, {
    SELECT_DATARUN,
});
