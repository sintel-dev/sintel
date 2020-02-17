import * as d3 from 'd3';
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

    return filterTags.map(tag => tag.value);
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

const groupDataByPeriod = data => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let result = [];

  // eslint-disable-next-line no-plusplus
  for (let yearIterator = 0; yearIterator < data.length; yearIterator++) {
    const year = {
      level: 'year',
      name: data[yearIterator].year,
      bins: [],
      counts: [],
      children: [],
    };
    result.push(year);

    // eslint-disable-next-line no-plusplus
    for (let monthIterator = 0; monthIterator < 12; monthIterator++) {
      const month = {
        level: 'month',
        name: monthNames[monthIterator],
        bins: [],
        counts: [],
        children: [],
        parent: year,
      };
      year.children.push(month);

      // eslint-disable-next-line no-plusplus
      for (let dayIterator = 0; dayIterator < data[yearIterator].data[monthIterator].length; dayIterator++) {
        let day = {
          level: 'day',
          name: dayIterator + 1,
          bins: data[yearIterator].data[monthIterator][dayIterator].means,
          counts: data[yearIterator].data[monthIterator][dayIterator].counts,
          children: undefined,
          parent: month,
        };

        month.children.push(day);

        let dayData = data[yearIterator].data[monthIterator][dayIterator];
        const count = dayData.counts.reduce((currentCount, nextCount) => currentCount + nextCount, 0);
        const mean = dayData.means.reduce((currentMean, nextMean) => currentMean + nextMean, 0) / dayData.means.length;

        year.bins.push(mean);
        year.counts.push(count);

        month.bins.push(mean);
        month.counts.push(count);
      }
    }

    // 7 days as one bin
    let i = 0;
    let nbins = [];
    let ncounts = [];
    while (i < year.bins.length) {
      let s = 0;
      let c = 0;
      let v = 0;
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < 7; j++) {
        s += year.bins[i + j];
        c += year.counts[i + j];
      }
      i += 7;
      v = s / 7;
      if (i === 364) {
        s += year.bins[364];
        c += year.counts[364];
        v = s / 8;
        if (year.bins.length === 366) {
          s += year.bins[365];
          c += year.counts[365];
          v = s / 9;
        }
        i = 367;
      }
      if (c === 0) {
        nbins.push(0);
      } else {
        nbins.push(v);
      }
      ncounts.push(c);
    }
    year.bins = nbins;
    year.counts = ncounts;
  }

  return result;
};

const getPeriodRange = periodData => {
  let minRange = Number.MAX_SAFE_INTEGER;
  let maxRange = Number.MIN_SAFE_INTEGER;
  periodData.forEach(currentPeriod => {
    const { bins } = currentPeriod;
    bins.forEach(bin => {
      minRange = minRange > bin ? bin : minRange;
      maxRange = maxRange < bin ? bin : maxRange;
    });
  });
  return { minRange, maxRange };
};

const normalizePeriodData = periodData => {
  const { minRange, maxRange } = getPeriodRange(periodData);
  const normalizeScale = d3
    .scaleLinear()
    .domain([minRange, maxRange])
    .range([0, 1]);
  const period = periodData.forEach(currentPeriod => {
    currentPeriod.bins = currentPeriod.bins.map(bin => (bin !== 0 ? normalizeScale(bin) : 0));
  });
  return period;
};

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
      const period = groupDataByPeriod(datarun.raw);
      const { events } = datarun;
      normalizePeriodData(period);

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
        period,
      };
    });
  },
);
