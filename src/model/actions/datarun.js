export function selectDatarun(datarunID) {
    return function(dispatch) {
        dispatch({ type: 'SELECT_DATARUN', datarunID });
    };
}
