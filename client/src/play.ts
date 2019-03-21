import * as _ from 'lodash';
import * as d3 from 'd3';

// console.log(_.sum([1, 2, 3]));
// console.log(d3.interpolateReds(0.8));
// console.log(Math.max(2, 3));

let d = new Date(1224655221 * 1000);
console.log(d.toUTCString());
// let ft = d3.timeFormat();

let utcDate1 = new Date(Date.UTC(96, 1, 2, 3, 4, 5));
let utcDate2 = new Date(Date.UTC(0, 0, 0, 0, 0, 0));

console.log(utcDate1.toUTCString());
// expected output: Fri, 02 Feb 1996 03:04:05 GMT

console.log(utcDate2.toUTCString());
// expected output: Sun, 31 Dec 1899 00:00:00 GMT

let a = 'sdf';
let b = a;
b += 'bd';
console.log(String(1));
