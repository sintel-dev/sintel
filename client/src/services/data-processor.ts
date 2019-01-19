import {TimeSeriesData, PeriodData} from '../components/vis/chart-data.interface';
import * as d3 from 'd3';
import * as _ from 'lodash';


class DataProcessor {

    public async csv(fileName: string) {
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


    public transformTimeSeriesToPeriodYear(data: TimeSeriesData) {
        let res: PeriodData[] = [];
        let yearSet = new Set();
        let start: any;

        for (let i = 0; i < data.length; i++) {
            let now: any = new Date(data[i][0]);
            let year = now.getFullYear();
            let dayNum = leapYear(year) ? 366 : 365;
            if (!yearSet.has(year)) {
                // new year start
                let newYear = {
                    level: 'year',
                    name: year,
                    bins: new Array(dayNum).fill(0),
                    counts: new Array(dayNum).fill(0),
                    children: undefined
                };
                res.push(newYear);
                yearSet.add(year);
                start = new Date(now.getFullYear(), 0, 0);
                newYear.children = initMonth(newYear);
            }
            let diff = (now - start) + ((start.getTimezoneOffset() -
                now.getTimezoneOffset()) * 60 * 1000);
            let oneDay = 1000 * 60 * 60 * 24;
            let day = Math.floor(diff / oneDay);

            let last = _.last(res);     // last is the new
            last.bins[day - 1] += data[i][1];
            last.counts[day - 1] += 1;

            last.children[now.getMonth()].bins[now.getDate() - 1] += data[i][1];
            last.children[now.getMonth()].counts[now.getDate() - 1] += 1;
        }

        // year
        _.each(res, d => {
            for (let i = 0; i < d.bins.length; i++) {
                if (d.counts[i] > 0) { d.bins[i] /= d.counts[i]; }
            }

            // month
            _.each(d.children, m => {
                for (let i = 0; i < m.bins.length; i++) {
                    if (m.counts[i] > 0) { m.bins[i] /= m.counts[i]; }
                }
            });
        });

        function leapYear(year) {
            return !(year % (year % 100 ? 4 : 400));
        }

        function initMonth(o: PeriodData): PeriodData[] {
            let monNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            let monDayNum = leapYear(o.name) ? [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            let monRes = _.map(monNames, (n, i) => {
                let newMon = {
                    level: 'month',
                    name: n,
                    bins: new Array(monDayNum[i]).fill(0),
                    counts: new Array(monDayNum[i]).fill(0),
                    children: undefined
                };
                newMon.children = initDay(newMon);
                return newMon;
            });
            return monRes;
        }

        // todo
        function initDay(o: PeriodData): PeriodData[] {
            let timeInterval = 1; // (hour)
            let newDay = {
                level: 'day',
                name: 0,
                bins: new Array(24 / timeInterval).fill(0),
                counts: new Array(24 / timeInterval).fill(0),
                children: undefined
            };
            return undefined;
        }

        return res;
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


    public genRadialAreaChartData(nFeatures, mBins): PeriodData[] {
        return _.range(nFeatures).map(function (i) {
            return {
                'level': 'fake',
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
}

let dataProcessor = new DataProcessor();
export default dataProcessor;
