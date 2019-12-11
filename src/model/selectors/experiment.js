import { createSelector } from 'reselect';

export const getSelectedExperimentData = (state) => state.experimentData;

const groupDataBy = (datarun, option) => datarun.data.map(value => [
        Math.trunc(value[0]) * 1000,
        value[datarun.names.indexOf(option)],
    ]);

const groupByEventWindows = (data, timestamps) =>
     data.map(event => [
        timestamps.indexOf(Math.trunc(event.start_time) * 1000),
        timestamps.indexOf(Math.trunc(event.stop_time) * 1000),
        event.score,
        event.tag,
    ]);

export const getProcessedDataRuns = createSelector(
    [getSelectedExperimentData],
    (experimentData) => {
        if (experimentData.isExperimentDataLoading) { return []; }
        return experimentData.data.dataruns.map(datarun => {
            const timeSeries = groupDataBy(datarun.prediction, 'y_raw');
            const timeseriesPred = groupDataBy(datarun.prediction, 'y_raw_hat');
            const timeseriesErr = groupDataBy(datarun.prediction, 'es_raw');
            const eventWindows = groupByEventWindows(datarun.events, timeSeries.map(series => series[0]));
            return {
                ...datarun,
                timeSeries,
                timeseriesPred,
                timeseriesErr,
                eventWindows,
            };
        });
    },
);
