import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as d3 from 'd3';
import * as _ from 'lodash';
import dataProcessor from '../services/data-processor';
import { BarChart } from './vis/bar-chart';
import { LineChart } from './vis/line-chart';
import { Data as RadialAreaChartData, RadialAreaChart } from './vis/radial-area-chart';
import { Datarun } from '../services/rest-server.interface';
import server from '../services/rest-server';
import {Dataset, Event} from '../services/rest-server.interface';


interface EventDictItem {
    id: string;
    count: number;
    scores: number[];
    min: number;
    max: number;
    mean: number;
}

interface EventDict {
    [propName: string]: EventDictItem;
}

class Summary {

    public boxs = ko.observableArray([]);

    private lineCharts = {};
    private config = {
        speed: 500   // box animation duration
    };

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);

        // loading event data
        self.loadEvents();

        // self.plotOverview();
    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;

    }

    private async plotOverview() {
        let self = this;
        let datasets_ = await server.datasets.read();
        let datasets = _.sortBy(datasets_, d => {
            return +d.name.substring(4);
        });
        console.log(datasets);
        datasets = _.slice(datasets, 0, 5);

        let i = 0;
        async function aa() {
            let dataset = datasets[i];
            let dataruns = await server.dataruns.read({}, {dataset: dataset.name});
            // select the first datarun by default
            let datarun = dataruns[0];
            let data: any = await dataProcessor.loadData(dataset.name, datarun.id);
            
            // declare the element for adding the chart
            let ele;
            let xAxis = false;
            // add line chart
            ele = $(`#eventOverview`)[0];

            if (i === datasets.length - 1) {
                new LineChart(ele,
                    data.timeseries, datarun.id, dataset.name,
                {
                    height: 70,
                    width: 1400,
                    width2: 1400,
                    height2: 0,
                    windows: data.windows,
                    offset: data.offset,
                    xAxis: true,
                    margin: { top: 5, right: 20, bottom: 25, left: 80 }
                });
            } else {
                new LineChart(ele,
                    data.timeseries, datarun.id, dataset.name,
                {
                    height: 50,
                    width: 1400,
                    width2: 1400,
                    height2: 0,
                    // smooth: true,
                    windows: data.windows,
                    offset: data.offset,
                    xAxis: false
                });
            }

            
            i += 1;
            if (i < datasets.length) {
                aa();
                // setTimeout(aa, 500);
            }
        }

        aa();

        // _.each(datasets, async (dataset, di) => {
        //     let dataruns = await server.dataruns.read({}, {dataset: dataset.name});
        //     // select the first datarun by default
        //     let datarun = dataruns[0];
        //     let data: any = await dataProcessor.loadData(dataset.name, datarun.id);
            
        //     // declare the element for adding the chart
        //     let ele;
        //     let xAxis = false;
        //     if (di === datasets.length - 1) { xAxis = true; }
        //     // add line chart
        //     ele = $(`#eventOverview`)[0];
        //     new LineChart(ele,
        //         data.timeseries, datarun.id, dataset.name,
        //     {
        //         height: 50,
        //         width: 1400,
        //         width2: 1400,
        //         height2: 0,
        //         // smooth: true,
        //         windows: data.windows,
        //         offset: data.offset,
        //         xAxis
        //     });
        // });
    }

    private async loadEvents() {
        let self = this;
    
        let events: Event[] = await server.events.read() as any;

        let dict: EventDict = {}
        let scores = [];
        
        // to dict
        _.each(events, e => {
            
            // add new eid
            if (!_.has(dict, e.datarun)) {
                dict[e.datarun] = {
                    id: e.datarun,
                    count: 0,
                    scores: [],
                    min: null,
                    max: null,
                    mean: null
                }
            }

            // update existing eid
            dict[e.datarun].count += 1;
            dict[e.datarun].scores.push(e.score);
            dict[e.datarun].min = _.min(dict[e.datarun].scores);
            dict[e.datarun].max = _.max(dict[e.datarun].scores);
            dict[e.datarun].mean = _.mean(dict[e.datarun].scores);

            scores.push(e.score);
        });

        // global
        let barChartData = [];
        _.each(dict, (v, key) => {
            // console.log(v);
            barChartData.push([v.id, v.count]);
        });

        // console.log(events.length);
        // console.log(_.keys(dict).length);
        // console.log(_.min(scores), _.mean(scores), _.max(scores));

        let datasets = await server.datasets.read();
        _.each(datasets, dataset => {
            if (!_.has(dict, dataset.name)) {
                barChartData.push([dataset.name, 0]);
            }
        });

        let cc = 0;
        barChartData = _.map(barChartData, d => {
            cc += 1;
            // return [cc, d[1]];
            return [d[0].substring(4), d[1]];
        });

        barChartData = _.sortBy(barChartData, d => +d[0]);
        // barChartData = _.sortBy(barChartData, d => -d[1]);

        console.log(barChartData);
        let ele = $(`#summaryBarChart`)[0];

        new BarChart(ele, barChartData, {
            height: 500,
            width: 1300
            // width: ele.parentElement.getBoundingClientRect().width
        });
    }

}

export default Summary;
