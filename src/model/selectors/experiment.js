import { createSelector } from 'reselect';

export const getSelectedExperimentData = (state) => state.experimentData;

const groupDataBy = (datarun, option) => {
    const indexValue = datarun.names.indexOf(option);
    return datarun.data.map(value => [
        Math.trunc(value[0]) * 1000,
        value[indexValue],
    ]);
};


export const getProcessedDataRun = createSelector(
    [getSelectedExperimentData],
    (experimentData) => {
        if (experimentData.isExperimentDataLoading) { return []; }
        return experimentData.data.dataruns.map(datarun => {
            const timeSeries = groupDataBy(datarun.prediction, 'y_raw');
            let timeseriesPred = groupDataBy(datarun.prediction, 'y_raw_hat');
            let timeseriesErr = groupDataBy(datarun.prediction, 'es_raw');
            return {
                ...datarun,
                timeSeries,
                timeseriesPred,
                timeseriesErr,
            };
        });
    },
);
