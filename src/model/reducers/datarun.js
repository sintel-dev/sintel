import createReducer from '../store/createReducer';

function SELECT_DATARUN(nextState, { datarunID }) {
    nextState.selectedDatarunID = datarunID;
}

export default createReducer({
    selectedDatarunID: null,
}, {
    SELECT_DATARUN,
});
