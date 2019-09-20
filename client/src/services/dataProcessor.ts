import { TimeSeriesData, LineChartDataEleInfoEle } from '../components/vis/data.itf';
import * as _ from 'lodash';
import * as G from './globals';
import * as RSI from './server.itf';
import server from './server';


class DataProcessor {

  /**
   * Load data from server
   *
   * @param {RSI.Experiment} [Experiment] A selected experiment.
   * @returns {Dict} {raw: [], prediction: [], windows: [], offset}.
   */
  public async loadData(exp: RSI.Experiment) {
    let self = this;

    let data = await server.data.read<RSI.Data>({}, {
      eid: G.headerConfig.experiment.id
    });

    let res = [];
    for (let i = 0; i < data.datasets.length; i++) {
      let timeseries = self._toTimeSeriesData(data.predictions[i], 'y_raw');
      let timeseriesPred = self._toTimeSeriesData(data.predictions[i], 'y_raw_hat');
      let timeseriesErr = self._toTimeSeriesData(data.predictions[i], 'es_raw');
      let windows = self._toEventWindows(
        data.events[i],
        _.map(timeseries, o => o[0]),
        0
      );
      res.push({
        dataset: data.datasets[i],
        datarun: data.dataruns[i],
        timeseries,
        timeseriesPred,
        timeseriesErr,
        windows,
        period: self._toPeriodData(data.raws[i]),
        offset: 0
      });
    }

    console.log('data-processor res:', res);

    return res;
  }


  public async loadEventData(datarun: string, timestamps, offset = 0) {
    let self = this;

    let data = await server.events.read({}, { datarun: datarun });

    return self._toEventWindows(data, timestamps, offset);
  }

  // TODO: other smoothing method
  constructor() {
    // init
  }

  private _toTimeSeriesData(data, attr): TimeSeriesData {
    const valueIdx = data.names.indexOf(attr);
    return _.map(data.data, d => [
      parseInt(d[0]) * 1000,
      d[valueIdx]
    ] as [number, number]);
  }

  private _toEventWindows(data, timestamps, offset = 0) {
    return _.map(data, d => [
      timestamps.indexOf(parseInt(d.start_time) * 1000 + offset),
      timestamps.indexOf(parseInt(d.stop_time) * 1000 + offset),
      d.score,
      d.id
    ]);
  }

  private _toPeriodData(data) {
    let years: LineChartDataEleInfoEle[] = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // iterate year
    for (let yy = 0; yy < data.length; yy++) {
      let year = {
        level: 'year',
        name: data[yy].year,
        bins: [],
        counts: [],
        children: []
      };
      years.push(year);

      // iterate month
      for (let mm = 0; mm < 12; mm++) {

        let month = {
          level: 'month',
          name: monthNames[mm],
          bins: [],
          counts: [],
          children: [],
          parent: year
        };
        year.children.push(month);

        for (let dd = 0; dd < data[yy].data[mm].length; dd++) {

          let day = {
            level: 'day',
            name: dd + 1,
            bins: data[yy].data[mm][dd].means,
            counts: data[yy].data[mm][dd].counts,
            children: undefined,
            parent: month
          };
          month.children.push(day);

          // daily aggregated value
          // let i = 0, sum = 0, d = data[yy].data[mm][dd];
          // while (i < d.means.length) {
          //     if (d.counts[i] > 0) {
          //         min = min > d.means[i] ? d.means[i] : min;
          //         max = max < d.means[i] ? d.means[i] : max;
          //     }
          //     sum += d.means[i] * d.counts[i];
          //     i += 1;
          // }
          // const count = _.sum(d.counts);
          // const mean = count === 0 ? 0 : sum / count;

          let d = data[yy].data[mm][dd];
          const count = _.sum(d.counts);
          const mean = _.sum(d.means) / d.means.length;

          // update year bins
          year.bins.push(mean);
          year.counts.push(count);

          // update month bins
          month.bins.push(mean);
          month.counts.push(count);

        }
        // year.bins.push(_.sum(month.bins) / month.bins.length);
        // year.counts.push(_.sum(month.counts));
      }

      // 7 days as one bin
      let i = 0, nbins = [], ncounts = [];
      while (i < year.bins.length) {
        let s = 0, c = 0, v = 0;
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
        if (c === 0) { nbins.push(0); } else { nbins.push(v); }
        ncounts.push(c);
      }
      year.bins = nbins;
      year.counts = ncounts;
    }

    return years;
  }
}

let dataProcessor = new DataProcessor();
export default dataProcessor;
