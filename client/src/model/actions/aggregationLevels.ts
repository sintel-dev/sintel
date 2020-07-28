import { timeToMiliseconds } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { TOGGLE_AGGREGATION_MODAL, SET_AGGREGATION_TIME_LEVEL } from '../types';

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
        const time = timeToMiliseconds(timeStamp);
        dispatch({
            type: SET_AGGREGATION_TIME_LEVEL,
            aggregationTimeLevel: {
                selectedLevel: timeStamp,
                timeInMiliseconds: time,
            },
        });
    };
}
