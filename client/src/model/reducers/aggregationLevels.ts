import createReducer from '../store/createReducer';
import { AggregationLevelsType } from '../types';

const initialState: AggregationLevelsType = {
    isAggregationModalOpen: false,
    aggregationTimeLevel: {
        selectedLevel: '30 hours',
        timeInMiliseconds: 108000000,
    },
    periodLevel: 1,
};

function TOGGLE_AGGREGATION_MODAL(nextState, { isAggregationModalOpen }) {
    nextState.isAggregationModalOpen = isAggregationModalOpen;
}

function SET_AGGREGATION_TIME_LEVEL(nextState, { aggregationTimeLevel }) {
    nextState.aggregationTimeLevel = aggregationTimeLevel;
}

export default createReducer(initialState, {
    TOGGLE_AGGREGATION_MODAL,
    SET_AGGREGATION_TIME_LEVEL,
});
