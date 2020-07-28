export const TOGGLE_AGGREGATION_MODAL = 'TOGGLE_AGGREGATION_MODAL';
export const SET_AGGREGATION_TIME_LEVEL = 'SET_AGGREGATION_TIME_LEVEL';
// export const SET_AGGREGATION_PERIOD_LEVEL = 'SET_AGGREGATION_PERIOD_LEVEL';

export type AggregationLevelsType = {
    isAggregationModalOpen: boolean;
    aggregationTimeLevel: {
        selectedLevel: string | null;
        timeInMiliseconds: number | null;
    };
    // setZoomLevel: Function;
    periodLevel: any;
};
