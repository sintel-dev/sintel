import { createSelector } from 'reselect';
import { RootState, EventDataType } from '../types';

export const getSelectedExperimentData = (state: RootState) => state.selectedExperimentData;

const groupDataBy = (
  prediction: {
    names: string[];
    data: number[][];
  },
  option: string,
) => prediction.data.map(predData => [Math.trunc(predData[0]) * 1000, predData[prediction.names.indexOf(option)]]);

const groupByEventWindows = (events: EventDataType[], timestamps: number[]) =>
  events.map(
    event =>
      [
        timestamps.indexOf(Math.trunc(event.start_time) * 1000),
        timestamps.indexOf(Math.trunc(event.stop_time) * 1000),
        event.score,
        event.tag,
      ] as [number, number, number, string],
  );

export const getProcessedDataRuns = createSelector([getSelectedExperimentData], experimentData => {
  if (experimentData.isExperimentDataLoading) {
    return [];
  }
  return experimentData.data.dataruns.map(datarun => {
    const timeSeries = groupDataBy(datarun.prediction, 'y_raw');
    const timeseriesPred = groupDataBy(datarun.prediction, 'y_raw_hat');
    const timeseriesErr = groupDataBy(datarun.prediction, 'es_raw');
    const eventWindows = groupByEventWindows(
      datarun.events,
      timeSeries.map(series => series[0]),
    );
    return {
      ...datarun,
      timeSeries,
      timeseriesPred,
      timeseriesErr,
      eventWindows,
    };
  });
});
