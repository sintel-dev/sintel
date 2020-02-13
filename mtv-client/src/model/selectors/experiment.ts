import { createSelector } from 'reselect';
import { RootState, EventDataType } from '../types';

export const getFilterTags = state => state.datarun.filterTags;
export const getSelectedExperimentData = (state: RootState) => state.selectedExperimentData;

export const filteringTags = createSelector(
  [getSelectedExperimentData, getFilterTags],
  (selectedExpedimentData, filterTags) => {
    if (selectedExpedimentData.isExperimentDataLoading) {
      return [];
    }
    let tags = [];
    filterTags && filterTags.forEach(tag => tags.push(tag.value));
    return tags;
  },
);

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
        timestamps.indexOf(event.start_time * 1000),
        timestamps.indexOf(event.stop_time * 1000),
        event.score,
        event.id,
        event.tag,
      ] as [number, number, number, string, string],
  );

export const getProcessedDataRuns = createSelector(
  [getSelectedExperimentData, filteringTags],
  (experimentData, filterTags) => {
    if (experimentData.isExperimentDataLoading) {
      return [];
    }

    return experimentData.data.dataruns.map(datarun => {
      const timeSeries = groupDataBy(datarun.prediction, 'y_raw');
      const timeseriesPred = groupDataBy(datarun.prediction, 'y_raw_hat');
      const timeseriesErr = groupDataBy(datarun.prediction, 'es_raw');
      const { events } = datarun;

      const filteredEvents = filterTags.length ? events.filter(event => filterTags.includes(event.tag)) : events;
      const eventWindows = groupByEventWindows(
        filteredEvents,
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
  },
);
