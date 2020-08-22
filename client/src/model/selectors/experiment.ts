import * as d3 from 'd3';
import { createSelector } from 'reselect';
import * as _ from 'lodash';
import { RootState, EventDataType } from '../types';
import { months } from '../utils/Utils';
import { getFilteredExperiments } from './projects';
import { fromTagToID } from '../../components/Landing/utils';

export const getFilterTags = (state) => state.datarun.filterTags;
export const getSelectedExperimentData = (state: RootState) => state.selectedExperimentData;

export const filteringTags = createSelector(
  [getSelectedExperimentData, getFilterTags],
  (selectedExpedimentData, filterTags) => {
    if (selectedExpedimentData.isExperimentDataLoading || !filterTags.length) {
      return [];
    }

    const tags = filterTags.map((tag) => tag.value);

    if (tags.includes('Untagged')) {
      tags.push(null);
    }

    return tags;
  },
);

const groupDataBy = (
  prediction: {
    names: string[];
    data: number[][];
  },
  option: string,
) => prediction.data.map((predData) => [Math.trunc(predData[0]) * 1000, predData[prediction.names.indexOf(option)]]);

const groupByEventWindows = (events: EventDataType[], timestamps: number[]) =>
  events.map(
    (event) =>
      [
        timestamps.indexOf(event.start_time * 1000),
        timestamps.indexOf(event.stop_time * 1000),
        event.score,
        event.id,
        event.tag,
      ] as [number, number, number, string, string],
  );

const groupDataByPeriod = (data) => {
  let result = [];

  for (let yearIterator = 0; yearIterator < data.length; yearIterator += 1) {
    const year = {
      level: 'year',
      name: data[yearIterator].year,
      bins: [],
      counts: [],
      children: [],
    };
    result.push(year);

    for (let monthIterator = 0; monthIterator < 12; monthIterator += 1) {
      const month = {
        level: 'month',
        name: months[monthIterator],
        bins: [],
        counts: [],
        children: [],
        parent: year,
      };
      year.children.push(month);

      for (let dayIterator = 0; dayIterator < data[yearIterator].data[monthIterator].length; dayIterator += 1) {
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
        const count = _.sum(dayData.counts);
        const mean = _.sum(dayData.means) / dayData.means.length;
        // const count = dayData.counts.reduce((currentCount, nextCount) => currentCount + nextCount, 0);
        // const mean = dayData.means.reduce((currentMean, nextMean) => currentMean + nextMean, 0) / dayData.means.length;

        // one day one bin
        year.bins.push(mean);
        year.counts.push(count);

        month.bins.push(mean);
        month.counts.push(count);
      }
    }

    // aggregate 7 days (bins) into one
    let i = 0;
    let nbins = [];
    let ncounts = [];
    while (i < year.bins.length) {
      let s = 0;
      let c = 0;
      let v = 0;
      for (let j = 0; j < 7; j += 1) {
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
    // year.bins = nbins;
    // year.counts = ncounts;
  }

  return result;
};

const normalizePeriodRange = (periodData) => {
  let minRange = Number.MAX_SAFE_INTEGER;
  let maxRange = Number.MIN_SAFE_INTEGER;
  periodData.forEach((year) => {
    for (let monthIterator = 0; monthIterator < year.children.length; monthIterator += 1) {
      for (let dayIterator = 0; dayIterator < year.children[monthIterator].children.length; dayIterator += 1) {
        const { counts, bins } = year.children[monthIterator].children[dayIterator];
        for (let i = 0; i < bins.length; i += 1) {
          if (counts[i] !== 0) {
            minRange = Math.min(minRange, bins[i]);
            maxRange = Math.max(maxRange, bins[i]);
          }
        }
      }
    }
  });
  return { minRange, maxRange };
};

const normalizePeriodData = (periodData) => {
  const { minRange, maxRange } = normalizePeriodRange(periodData);
  const normalizeScale = d3.scaleLinear().domain([minRange, maxRange]).range([0, 1]);

  periodData.forEach((year) => {
    let countsY = year.counts;
    year.bins = _.map(year.bins, (bin, i) => {
      if (countsY[i] === 0) {
        return bin;
      }
      return normalizeScale(bin);
    });
    for (let monthIterator = 0; monthIterator < year.children.length; monthIterator += 1) {
      let countsM = year.children[monthIterator].counts;
      year.children[monthIterator].bins = _.map(year.children[monthIterator].bins, (bin, i) => {
        if (countsM[i] === 0) {
          return bin;
        }
        return normalizeScale(bin);
      });
      for (let dayIterator = 0; dayIterator < year.children[monthIterator].children.length; dayIterator += 1) {
        let countsD = year.children[monthIterator].children[dayIterator].counts;
        year.children[monthIterator].children[dayIterator].bins = _.map(
          year.children[monthIterator].children[dayIterator].bins,
          (bin, i) => {
            if (countsD[i] === 0) {
              return bin;
            }
            return normalizeScale(bin);
          },
        );
      }
    }
  });
};

export const getProcessedDataRuns = createSelector(
  [getSelectedExperimentData, filteringTags],
  (experimentData, filterTags) => {
    if (experimentData.isExperimentDataLoading) {
      return [];
    }

    const timeSeriesDataLength = experimentData.data.dataruns.map((datarun) => datarun.prediction.data.length);

    const maxTimeSeriesLength = Math.max(...timeSeriesDataLength);
    const maxTimeSeriesData = experimentData.data.dataruns.filter(
      (data) => data.prediction.data.length === maxTimeSeriesLength,
    )[0];

    return experimentData.data.dataruns.map((datarun) => {
      const timeSeries = groupDataBy(datarun.prediction, 'y_raw');
      const maxTimeSeries = groupDataBy(maxTimeSeriesData.prediction, 'y_raw');
      const timeseriesPred = groupDataBy(datarun.prediction, 'y_raw_hat');
      const timeseriesErr = groupDataBy(datarun.prediction, 'es_raw');
      const period = groupDataByPeriod(datarun.raw);
      const { events } = datarun;

      normalizePeriodData(period);

      const filteredEvents =
        filterTags && filterTags.length
          ? events.filter((currentEvent) => filterTags.includes(currentEvent.tag))
          : events;

      const sortedEvents = filteredEvents
        .map((currentEvent) => currentEvent)
        .sort((current, next) => current.start_time - next.start_time);

      const eventWindows = groupByEventWindows(
        sortedEvents,
        timeSeries.map((series) => series[0]),
      );

      const filteredEventWindows = filterTags.length
        ? eventWindows.filter((currentWindow) => filterTags.includes(currentWindow[4]))
        : eventWindows;

      return {
        ...datarun,
        timeSeries,
        timeseriesPred,
        timeseriesErr,
        eventWindows: filteredEventWindows,
        events: sortedEvents,
        period,
        maxTimeSeries,
      };
    });
  },
);

// @TODO - move logic from Experiment.tsx ove here
export const getProcessedMatrixData = createSelector([getFilteredExperiments], (filteredExperiments) => {
  let maxTagNum = Number.MIN_SAFE_INTEGER;
  let maxEventNum = Number.MIN_SAFE_INTEGER;
  let maxScore = Number.MIN_SAFE_INTEGER;
  let tagStatsList = [];

  filteredExperiments.forEach((currentExperiment) => {
    const { dataruns } = currentExperiment;
    let tagStats: { [index: string]: number } = {};
    for (let i = 0; i < 7; i += 1) {
      tagStats[String(i)] = 0;
    }
    dataruns.forEach((currentDatarun) => {
      const { events } = currentDatarun;
      events.forEach((currentEvent) => {
        let tid = fromTagToID(currentEvent.tag);
        tid = tid === 'Untagged' ? '0' : tid;
        if (!_.has(tagStats, tid)) {
          tagStats[tid] = 0;
        }
        tagStats[tid] += 1;
        maxTagNum = maxTagNum < tagStats[tid] ? tagStats[tid] : maxTagNum;

        maxScore = maxScore > currentEvent.score ? maxScore : currentEvent.score;
        maxEventNum = maxEventNum < currentDatarun.events.length ? currentDatarun.events.length : maxEventNum;
      });
    });
    tagStatsList.push(tagStats);
  });

  const scale = {
    maxTagNum,
    maxEventNum,
    maxScore,
  };

  return { scale, tagStats: tagStatsList[0] };
});

export const getCurrentExperimentDetails = (state) => state.experiments.experimentDetails;
