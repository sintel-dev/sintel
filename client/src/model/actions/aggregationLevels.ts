import { timeToSeconds } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { TOGGLE_AGGREGATION_MODAL, SET_AGGREGATION_TIME_LEVEL, FETCH_SIGNAL_RAW } from '../types';
import { getCurrentEventDetails, getDatarunDetails } from '../selectors/datarun';
import { getAggregationTimeLevel, getContextInfoValue } from '../selectors/aggregationLevels';
import API from '../utils/api';

export function toggleAggregationModal(currentState: boolean) {
  return function (dispatch) {
    dispatch({
      type: TOGGLE_AGGREGATION_MODAL,
      isAggregationModalOpen: currentState,
    });
    dispatch(setAggregationLevelAction('30 hours'));
  };
}

export function setAggregationLevelAction(timeStamp) {
  return function (dispatch) {
    const time = timeToSeconds(timeStamp);
    dispatch({
      type: SET_AGGREGATION_TIME_LEVEL,
      aggregationTimeLevel: {
        selectedLevel: timeStamp,
        timeToSeconds: time,
      },
    });
    dispatch(getSignalRawDataAction());
  };
}

export function getSignalRawDataAction() {
  return async function (dispatch, getState) {
    const dataRun = getDatarunDetails(getState());
    const contextInfo = getContextInfoValue(getState());

    const { timeSeries } = dataRun;
    const currentEventDetails = getCurrentEventDetails(getState());
    const currentAggregationLevel = getAggregationTimeLevel(getState());
    const { start_time, stop_time } = currentEventDetails;
    const signalrunID = dataRun.signal_id;

    const eventInterval = timeSeries.filter((current) => current[0] >= start_time && current[0] <= stop_time);
    const startIndex =
      timeSeries.findIndex((element) => start_time - element[0] < 0) - 1 - eventInterval.length * contextInfo;
    const stopIndex =
      timeSeries.findIndex((element) => stop_time - element[0] < 0) + eventInterval.length * contextInfo;

    const eventWrapper = timeSeries.slice(startIndex, stopIndex);
    const startTime = eventWrapper[0][0] / 1000;
    const stopTime = eventWrapper[eventWrapper.length - 1][0] / 1000;

    dispatch({
      type: 'SET_EVENT_INTERVAL',
      eventInterval,
    });

    const payload = {
      signal: signalrunID,
      interval: currentAggregationLevel.timeToSeconds || timeToSeconds('30 hours'),
      start_time: startTime,
      stop_time: stopTime,
    };

    const action = {
      type: FETCH_SIGNAL_RAW,
      promise: API.signalraw.all({}, payload),
    };

    dispatch(action);
  };
}

export function setContextValueAction(contextValue) {
  return function (dispatch) {
    dispatch({ type: 'SET_CONTEXT_VALUE', contextValue });
    dispatch(getSignalRawDataAction());
  };
}
