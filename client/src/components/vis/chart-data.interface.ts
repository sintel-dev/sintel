// export interface DataEle {
//     x: number;      // timestamp || step
//     y: number;      // value
// }

// time-sorted data for one time-series
export interface TimeSeriesData extends Array<[number, number]> { }


export interface PeriodData {
    level: string;       // year, month, or day
    name: string;        // if year: 1991, 1992, ...
    bins: number[];      // month bin, storing aggregated value
    counts?: number[];   // number of data items on each bin
    children?: PeriodData[];
    parent?: PeriodData;
}

export interface WindowData extends Array<[number, number, number]> { }
