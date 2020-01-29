export function selectDatarun(datarunID) {
  return function(dispatch) {
    dispatch({ type: 'SELECT_DATARUN', datarunID });
  };
}

export function setTimeseriesPeriod(eventRange) {
  return function(dispatch) {
    dispatch({ type: 'SET_TIMESERIES_PERIOD', eventRange });
  };
}
