import {TimeSeriesData, PeriodData} from '../components/vis/chart-data.interface';
import * as d3 from 'd3';
import * as _ from 'lodash';
import server from './rest-server';

// let dt = new Date(1548257576796);
// console.log(dt.toTimeString());
// console.log(dt.toUTCString());


class DataProcessor {

    public async loadCsv(fileName: string) {
        let self = this;

        let content = await d3.text(fileName);
        let data = d3.csvParseRows(content);
        data.splice(0, 1);
        let transformedData: TimeSeriesData = [];

        // not using timestamp
        let scale = +data[0][0] === 0 ? 1 : 1000;

        _.each(data, d => {
            if (d[1] !== '') {
                transformedData.push([+d[0] * scale, +d[1]]);
            }
        });

        return transformedData;
    }


    /**
     * Load data from server
     *
     * @param {string} [dataset] Dataset name.
     * @param {string} [datarun] Datarun id.
     * @returns {Dict} {raw: [], prediction: [], events: []}.
     */
    public async loadData(dataset: string, datarun: string) {
        let self = this;

        return new Promise((resolve, reject) => {
            server.datasets.dataruns.read(dataset, datarun)
                .done((data, textStatus) => {
                    if (textStatus === 'success') {
                        console.log(data);
                        const timeseries = self._toTimeSeriesData(data.prediction, 'y_raw');
                        const windows = self._toEventWindows(
                            data.events,
                            _.map(timeseries, d => d[0])
                        );
                        resolve({
                            timeseries,
                            period: self._toPeriodData(data.raw),
                            windows
                        });
                    } else {
                        reject(textStatus);
                    }
                });
        });
    }

    public normalizeTimeSeries(data: TimeSeriesData): TimeSeriesData {
        // if (data[0][0] instanceof Array) {  // cd.TimeSeriesData[]

        // } else {  // TimeSeriesData

        // }
        let nm = d3.scaleLinear()
            .domain(d3.extent(data, d => d[1]))
            .range([0, 1]);

        let normalizedData = _.map(data, o => [o[0], nm(o[1])] as [number, number] );
        return normalizedData;
    }

    /* tslint:disable */
    public genTimeSeriesData(timesteps) {
        // seeded-random.js ////////////////////////////////
        // A seeded random number generators adapted from:
        // http://stackoverflow.com/questions/521295/javascript-random-seeds
        function seededRandom(s) {
            let m_w = 987654321 + s;
            let m_z = 987654321 - s;
            let mask = 0xffffffff;

            return function () {
                m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
                m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;

                let result = ((m_z << 16) + m_w) & mask;
                result /= 4294967296;

                return result + 0.5;
            };
        }
        // END seeded-random.js ////////////////////////////////


        let seed = 1, t = 0;
        function random() {
            let rand = seededRandom(seed);
            let data = [];
            for (let i = -t, variance = 0; i < timesteps; i++) {
                variance += (rand() - 0.5) / 10;
                // Pre-roll the random number generator's results to match where they should be at this `t`.
                if (i > 0) {
                    data.push([i, Math.cos((i + t) / 100) + variance]);
                }
            }
            return data;
        }

        return random();
    }
    /* tslint:enable */


    public genRadialAreaChartData(nFeatures, mBins, level= 'fake'): PeriodData[] {
        return _.range(nFeatures).map(function (i) {
            return {
                'level': level,
                'name': 'feature' + i,
                'bins': _.range(mBins).map(function (j) {
                    return Math.random();
                })
            };
        });
    }

    // TODO: other smoothing method
    constructor() {
        // init
    }

    private _toTimeSeriesData(data, attr) {
        const valueIdx = data.names.indexOf(attr);
        return _.map(data.data, d => [
            parseInt(d[0]) * 1000,    // timestamp
            d[valueIdx]
        ]);
    }

    private _toEventWindows(data, timestamps) {
        return _.map(data, d => [
            timestamps.indexOf(parseInt(d.start_time) * 1000),
            timestamps.indexOf(parseInt(d.stop_time) * 1000),
            d.score,
            d.id
        ]);
    }

    private _toPeriodData(data) {
        let years: PeriodData[] = [];

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                           'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let max = Number.MIN_SAFE_INTEGER;
        let min = Number.MAX_SAFE_INTEGER;

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
                    bins: new Array(data[yy].data[mm].length).fill(0),
                    counts: new Array(data[yy].data[mm].length).fill(0),
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
                    let i = 0, sum = 0, d = data[yy].data[mm][dd];
                    while (i < d.means.length) {
                        if (d.counts[i] > 0) {
                            min = min > d.means[i] ? d.means[i] : min;
                            max = max < d.means[i] ? d.means[i] : max;
                        }
                        sum += d.means[i] * d.counts[i];
                        i += 1;
                    }
                    const count = _.sum(d.counts);
                    const mean = count === 0 ? 0 : sum / count;

                    // update year bins
                    year.bins.push(mean);
                    year.counts.push(count);

                    // update month bins
                    month.bins.push(mean);
                    month.counts.push(count);

                    if (count > 0) {
                        min = min > mean ? mean : min;
                        max = max < mean ? mean : max;
                    }
                }
            }
        }

        // normalized to [0, 1]
        let nm = d3.scaleLinear()
            .domain([min, max])
            .range([0, 1]);

        let nmm = (node) => {
            return _.map(node.bins, (d, i) => {
                if (node.counts[i] === 0) { return 0; }
                return nm(d);
            });
        };

        for (let i = 0; i < years.length; i += 1) {
            years[i].bins = nmm(years[i]);
            for (let j = 0; j < years[i].children.length; j += 1) {
                years[i].children[j].bins = nmm(years[i].children[j]);
                for (let k = 0; k < years[i].children[j].children.length; k += 1) {
                    years[i].children[j].children[k].bins = nmm(years[i].children[j].children[k]);
                }
            }
        }

        return years;
    }
}

let dataProcessor = new DataProcessor();
export default dataProcessor;
