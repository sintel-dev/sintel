import { Events } from './pip-client';
import {TimeSeriesData} from '../components/vis/data.interface';
import * as _ from 'lodash';


export class Smooth extends Events {

    // locally weighted regression
    public loess(x, y, bandwidth = 0.25): number {
        let ls = science.stats.loess();  // science.js
        ls.bandwidth(bandwidth);
        return ls(x, y);
    }

    public simpleMovingAverage(ts: TimeSeriesData, windowSize= 2) {
        let nts: TimeSeriesData = [];
        for (let i = 0; i < ts.length; i += 1) {
            let st = Math.max(0, i - windowSize);
            let ed = Math.min(ts.length, i + windowSize);
            let s = 0, c = 0;
            for (let j = st; j < ed; j += 1) {
                c += 1;
                s += ts[j][1];
            }
            nts.push([ts[i][0], s / c]);
        }
        return nts;
    }

    // TODO: other smoothing method
    constructor() {
        super();
    }
}

export class Anomaly extends Events {

    /**
     * Theshold-based algorithm
     *
     * @param {number} [th=0.1] Windows whose values constantly > threshold are identified as peaks.
     * @returns {Array<[number, number]>} A set of windows ([begin_pos, end_pos]).
     * @example
     *
     * let anomaly = new Anomaly();
     * anomaly.findPeakWidowsByThreshold([4, 2, 8, 6, ...], 0.2);
     * => [[1, 2], [5, 8], ...]
     */
    public findPeakWidowsByThreshold(th = 0.1) {
        let v = this.data;
        let windows = [];
        // todo
    }


    /**
     * Offline Peak-Finding Algorithm
     *
     * Implement the peak detection algorithm from the following paper
     * Twitinfo: Aggregating and Visualizing Microblogs for Event Exploration
     * Marcus, A., Bernstein, M.S., Badar, O., Karger, D.R., Madden, S. and Miller, R.C., 2011
     *
     * @param {number} [p=5] The size of moving window.
     * @param {number} [th=2] Threshold of mean deviation.
     * @returns {Array<[number, number]>} A set of windows ([begin_pos, end_pos]).
     * @example
     *
     * let anomaly = new Anomaly();
     * anomaly.findPeakWidows([4, 2, 8, 6, ...]);
     * => [[1, 2], [5, 8], ...]
     */
    public findPeakWidows(p = 5, th = 2) {
        let v = this.data;
        let windows = [];
        let mean = v[0];
        let meanDev = math.var(_.slice(v, 0, p));

        let len = v.length - 1;
        for (let i = 1; i < len; i += 1) {
            if ((math.abs(v[i] - mean) / meanDev) > th && v[i] > v[i - 1]) {
                let start: number, end: number;
                start = i - 1;
                while ((i < len) && (v[i] > v[i - 1])) {
                    [mean, meanDev] = update(mean, meanDev, v[i]);
                    i++;
                }
                while ((i < len) && (v[i] > v[start])) {
                    if ((math.abs(v[i] - mean) / meanDev > th) && (v[i] > v[i - 1])) {
                        end = --i;
                        break;
                    } else {
                        [mean, meanDev] = update(mean, meanDev, v[i]);
                        end = i++;
                    }
                }
                windows.push([start, end]);
            } else {
                [mean, meanDev] = update(mean, meanDev, v[i]);
            }
        }

        return windows;

        function update(oldMean, oldMeanDev, updateValue, alpha = 0.125): [number, number] {
            let diff = math.abs(oldMean - oldMeanDev);
            let newMeanDev = alpha * diff + (1 - alpha) * oldMeanDev;
            let newMean = alpha * updateValue + (1 - alpha) * oldMean;
            return [newMean, newMeanDev];
        }
    }


    constructor(private data: number[]) {
        super();
    }
}
