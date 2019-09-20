import * as RSI from '../../services/server.itf';


// export interface DataEle {
//     x: number;      // timestamp || step
//     y: number;      // value
// }
// time-sorted data for one time-series
export interface TimeSeriesData extends Array<[number, number]> { }

export interface LineChartDataEleInfoEle {
  level: string;       // year, month, or day
  name: string;        // if year: 1991, 1992, ...
  bins: number[];      // month bin, storing aggregated value
  counts?: number[];   // number of data items on each bin
  children?: LineChartDataEleInfoEle[];
  parent?: LineChartDataEleInfoEle;
  col?: number;       // layout index
  row?: number;        // layout index
}

export interface PeriodChartDataEle {
  name: string;
  info: Array<LineChartDataEleInfoEle>;
}

export interface WindowData extends Array<[number, number, number]> { }

export interface LineChartDataEle {
  timeseries: TimeSeriesData;     // raw signal after aggregation
  timeseriesPred: TimeSeriesData; // model prediction results
  timeseriesErr: TimeSeriesData;  // model errors
  windows: Array<[number, number, number, string]>;
  // start idx, end idx, anomaly score, event id
  offset?: number;
  period?: LineChartDataEleInfoEle[];
  datarun?: RSI.Datarun;
  dataset?: RSI.Dataset;
}

export interface BarChartData extends Array<[string, number]> { }
