import * as _ from 'lodash';
import * as DT from './server.itf';
import server from './server';
import { Project, Experiment } from '../components/pageLanding';

export type EventWindow = [number, number, number, string, string];
// st_index, ed_index, score, id, tag

export interface ChartDataEle {
  timeseries: [number, number][];     // raw signal after aggregation
  timeseriesPred: [number, number][]; // model prediction results
  timeseriesErr: [number, number][];  // model errors
  eventWindows: EventWindow[];
  period?: ChartDataEleInfoEle[];
  datarun?: DT.Datarun;
}

export interface ChartDataEleInfoEle {
  level: string;       // year, month, or day
  name: string;        // if year: 1991, 1992, ...
  bins: number[];      // month bin, storing aggregated value
  counts?: number[];   // number of data items on each bin
  children?: ChartDataEleInfoEle[];
  parent?: ChartDataEleInfoEle;
  col?: number;       // layout index
  row?: number;       // layout index
}

export interface PeriodChartDataEle {
  name: string;
  info: ChartDataEleInfoEle[];
}

/**
 *
 * @param exp The selected experiment
 * @returns The promise of data used for plotting charts
 */
export async function getDataruns(exp: DT.Experiment): Promise<ChartDataEle[]> {
  let {dataruns} = await server.dataruns.read<{dataruns: DT.Datarun[]}>({}, { experiment_id: exp.id });

  let res: ChartDataEle[] = [];
  _.each(dataruns, datarun => {
    let timeseries = _toTimeSeriesData(datarun.prediction, 'y_raw');
    let timeseriesPred = _toTimeSeriesData(datarun.prediction, 'y_raw_hat');
    let timeseriesErr = _toTimeSeriesData(datarun.prediction, 'es_raw');
    let period = _toPeriodData(datarun.raw);
    let eventWindows = _toEventWindows(datarun.events, _.map(timeseries, o => o[0]));
    res.push({
      datarun: datarun,
      timeseries,
      timeseriesPred,
      timeseriesErr,
      eventWindows,
      period
    });
  });

  return res;

}

export async function getEvents(
    datarun: DT.Datarun, timestamps: number[]
  ): Promise<EventWindow[]> {
  let self = this;

  // Get events by datarun ID
  let data = await server.events.read<{events: DT.Event[]}>(
    {},
    { datarun_id: datarun.id }
  );

  return _toEventWindows(data.events, timestamps);
}

/**
 * @returns Project List
 */
export async function getProjects(): Promise<Project[]> {
  let exps = await server.experiments.read<{ experiments: DT.Experiment[] }>();
  let pipes = await server.pipelines.read<{ pipelines: DT.Pipeline[] }>();

  // get pipeline dict
  let pipeDict: { [index: string]: DT.Pipeline } = {};
  _.each(pipes.pipelines, pipe => {
    pipeDict[pipe.name] = pipe;
  });

  // get project dict and list
  let projDict: { [index: string]: DT.Experiment[] } = {};
  let projList: Project[] = [];
  _.each(exps.experiments, exp => {
    if (!_.has(projDict, exp.project)) { projDict[exp.project] = []; }
    projDict[exp.project].push(exp);
  });

  _.forIn(projDict, (value, key) => {

    // get pipeline of this project
    let pipelineNameSet = new Set();
    let pipelines: DT.Pipeline[] = [];
    for (let i = 0; i < value.length; i += 1) {
      if (!pipelineNameSet.has(value[i].pipeline)) {
        pipelineNameSet.add(value[i].pipeline);
        pipelines.push(pipeDict[value[i].pipeline]);
      }
    }

    // get event number of each experiment in this project
    let newExp = _.map(value, v => {
      (v as Experiment).eventNum = getExperimentEventNum(v);
      return v;
    });

    projList.push({
      name: key,
      experimentNum: value.length,
      uniquePipelineNum: pipelineNameSet.size,
      experiments: newExp as Experiment[],
      pipelines
    });
  });

  return projList;

  function getExperimentEventNum(exp: DT.Experiment) {
    let sum = 0;
    _.each(exp.dataruns, datarun => {
      sum += datarun.events.length;
    });
    return sum;
  }
}

function _toTimeSeriesData(
  data: { names: string[], data: number[][] },
  attr: string
): [number, number][] {
  const valueIdx = data.names.indexOf(attr);
  return _.map(data.data, d => [
    Math.trunc(d[0]) * 1000,
    d[valueIdx]
  ]);
}

function _toEventWindows(
    data: DT.Event[], timestamps: number[]
  ): EventWindow[]  {

  return _.map(data, d => [
    timestamps.indexOf(Math.trunc(d.start_time) * 1000),
    timestamps.indexOf(Math.trunc(d.stop_time) * 1000),
    d.score,
    d.id,
    d.tag
  ]);
}

function _toPeriodData(
  data: {
    year: number, timestamp: number,
    data: { means: number[], counts: number[] }[][]
  }[]
): ChartDataEleInfoEle[] {

  let res: ChartDataEleInfoEle[] = [];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // iterate year
  for (let yy = 0; yy < data.length; yy++) {
    let year = {
      level: 'year',
      name: String(data[yy].year),
      bins: [],
      counts: [],
      children: []
    };
    res.push(year);

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

  return res;
}
