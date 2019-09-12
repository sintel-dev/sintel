import * as _ from 'lodash';
import * as RSI from './rest-server.interface';


let colors = [
    // ['darkblue', '#00649f'],
    ['cadetblue', '#426776'],
    ['darkgreen', '#718224'],
    ['darkpurple', '#593869'],
    ['darkred', '#9f3336'],
    ['darkblue', '#035484'],
];
let usedColor = new Set();
let stationColor = {};

export const colorSchemes = {
    severity5: [
        '#FFD93F', // investigate
        '#94B7FD', // do not investigate
        '#9649E3', // postpone
        '#C95555', // problem
        '#CDD15E', // previously seen
        '#7EC37C', // normal
    ],
    severity3: [
        '#91bfdb',  // light blue
        '#ffffbf',
        '#fc8d59'   // orange
    ],
    scheme10: [
        '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3',
        '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'
    ],
    scheme12: [
        '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3',
        '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd',
        '#ccebc5', '#ffed6f'
    ],
    scheme5: [
        '#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56',
    ],
    scheme8: [
        '#8891b7', '#dcb389', '#8bb2a3', '#d99694',
        '#5ca793', '#bd4f43', '#ebc844', '#0d3c55'
    ],
    scheme8_2: [
        '#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3',
        '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'
    ],
    color: function(i: number, scheme: string[]) {
        let oc = scheme[i];
        let tc = tinycolor(scheme[i]).darken(2).desaturate(12).toString();
        return tc;
    },
    clearColor: function() {
        usedColor.clear();
        stationColor = {};
    },
    delColor: function(name) {
        if (usedColor.has(stationColor[name])) {
            usedColor.delete(stationColor[name]);
            delete stationColor[name];
        }
    },
    getColorName: function(name) {
        // if (!_.isUndefined(stationColor[name])) {
        //     return colors[stationColor[name]][0];
        // }
        // for (let i = 0; i < colors.length; i += 1) {
        //     if (!usedColor.has(i)) {
        //         usedColor.add(i);
        //         stationColor[name] = i;
        //         return colors[i][0];
        //     }
        // }
        return '#426776';
    },
    getColorCode: function(name) {
        // if (!_.isUndefined(stationColor[name])) {
        //     return colors[stationColor[name]][1];
        // }
        // for (let i = 0; i < colors.length; i += 1) {
        //     if (!usedColor.has(i)) {
        //         usedColor.add(i);
        //         stationColor[name] = i;
        //         return colors[i][1];
        //     }
        // }
        return '#426776';
    }
};


interface HeaderConfig {
    experiment: RSI.Experiment;
    project: string;
}

export let headerConfig: HeaderConfig = {
    experiment: null,
    project: null
};
