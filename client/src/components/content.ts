import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as d3 from 'd3';
import * as _ from 'lodash';
import server from '../services/rest-server';
import dataProcessor from '../services/data-processor';
import { LineChart } from './vis/line-chart';
import { AreaChart } from './vis/area-chart';
import { HorizonChart } from './vis/horizon-chart';
import { Data as RadialAreaChartData, RadialAreaChart } from './vis/radial-area-chart';

class Content {

    public boxs = ko.observableArray([]);

    private config = {
        speed: 500   // box animation duration
    };

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);
    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;

        pip.content.on('datarun:select', self.addChart.bind(self));

        // pip.content.on('datarun:loadAll', async (msg: { db: string, signalList: string[] }) => {
        //     let copy = $('#load-all-dataruns').html();
        //     $('#load-all-dataruns').html(`<i class="fa fa-refresh fa-spin"></i>`);
        //     for (let i = 0; i < msg.signalList.length; i++) {
        //         await self.addChart({
        //             db: msg.db,
        //             signal: msg.signalList[i]
        //         });
        //     }
        //     $('#load-all-dataruns').html(copy);
        // });
    }


    // the following public methods are triggered by user interactions

    public onRemoveBox(name) {
        let self = this;
        setTimeout(() => {
            let boxs = self.boxs();
            let idx = _.findIndex(boxs, o => o === name);
            boxs.splice(idx, 1);
            self.boxs(boxs);
            pip.header.trigger('datarun:updateActives', boxs);
        }, self.config.speed);
    }


    private async addChart(msg: {dataset: string, datarun: string}) {
        let self = this;
        let name = msg.datarun; // datarun id is unique
        let boxs = self.boxs();

        console.log();

        // if new, then add a new box
        if (_.findIndex(boxs, o => o === name) < 0) {

            boxs.unshift(name);    // add to head
            self.boxs(boxs);
            pip.header.trigger('datarun:updateActives', boxs);

            // activate box interaction
            ($(`.box[name='${name}']`) as any).boxWidget({
                animationSpeed: self.config.speed,
                collapseTrigger: `button[name='${name}-collapse']`,
                removeTrigger: `button[name='${name}-remove']`
            });

            // load data for visualization
            let data = await dataProcessor.loadData(msg.dataset, msg.datarun) as any;
            console.log(data);

            // declare the element for adding the chart
            let ele;

            // add line chart
            // let anomaly = new alg.Anomaly(_.map(data, d => d.y));
            // let windows = anomaly.findPeakWidows(5, 2);
            ele = $(`#${name}-line`)[0];
            new LineChart(ele, data.timeseries, {
                height: 360,
                height2: 60,
                width: ele.parentElement.getBoundingClientRect().width,
                width2: ele.parentElement.getBoundingClientRect().width,
                // smooth: true,
                windows: data.windows
            });

            // add area chart
            ele = $(`#${name}-area`)[0];
            new AreaChart($(`#${name}-area`)[0], data.timeseries, {
                height: 400,
                width: ele.parentElement.getBoundingClientRect().width
            });

            // // add horizon chart
            ele = $(`#${name}-horizon`)[0];
            new HorizonChart($(`#${name}-horizon`)[0], data.timeseries, {
                width: ele.parentElement.getBoundingClientRect().width
                // normalized: true
            });

            // add radial area chart
            // only activated when dataset is SES
            ele = $(`#${name}-radial-area-year`)[0];
            // let ndata = dataProcessor.normalizeTimeSeries(data.timeseries);
            // let tdata = dataProcessor.transformTimeSeriesToPeriodYear(ndata);
            let yearChart = new RadialAreaChart($(`#${name}-radial-area-year`)[0],
                data.period,
                {
                    width: ele.parentElement.getBoundingClientRect().width,
                    nCol: 4
                }
            );

            ele = $(`#${name}-radial-area-month`)[0];
            let fakeMonthData = dataProcessor.genRadialAreaChartData(12, 30);
            let monthChart = new RadialAreaChart($(`#${name}-radial-area-month`)[0],
                fakeMonthData,
                {
                    width: ele.parentElement.getBoundingClientRect().width,
                    nCol: 4
                }
            );

            ele = $(`#${name}-radial-area-day`)[0];
            let fakeDayData = dataProcessor.genRadialAreaChartData(30, 24, 'day');
            let dayChart = new RadialAreaChart($(`#${name}-radial-area-day`)[0],
                fakeDayData,
                {
                    width: ele.parentElement.getBoundingClientRect().width,
                    nCol: 7
                    // cw: 60,
                    // ch: 60,
                    // size: 70
                }
            );

            yearChart.on('select', (o: RadialAreaChartData) => {
                // switch tag
                ($(`a[href="#${name}-radial-area-month"]`) as any).tab('show');
                // change tab title
                $(`#${name}-radial-area-title`)
                    .text(`Period - Year: ${o.name}`);

                monthChart.trigger('update', o.children);
            });

            monthChart.on('select', (o: RadialAreaChartData) => {
                // switch tag
                console.log('month selected', name);
                ($(`a[href="#${name}-radial-area-day"]`) as any).tab('show');

                // change tab title
                $(`#${name}-radial-area-title`)
                    .text(`Period - Year: ${o.parent.name}, Month: ${o.name}`);

                dayChart.trigger('update', o.children);
            });

        }

        // function hackDayData(o: RadialAreaChartData, dayChart) {
        //     const monNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
        //         'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        //     let monthToIndex = _.zipObject(monNames, _.range(12));
        //     let st = new Date(+o.parent.name, monthToIndex[o.name]);
        //     let ed: Date;
        //     if (st.getMonth() === 11) {
        //         ed = new Date(st.getFullYear() + 1, 0, 0);
        //     } else {
        //         ed = new Date(st.getFullYear(), st.getMonth() + 1, 0);
        //     }

        //     let pid = msg.signal.substring(0, msg.signal.length - 4);
        //     if (_.lowerCase(msg.db) === 'ses') {

        //         let dayEleTab = $(`a[href="#${name}-radial-area-day"]`);
        //         dayEleTab.addClass('overlay');
        //         dayEleTab.append(`<i class="fa fa-refresh fa-spin"></i>`);

        //         server.dbs.signals.read('ses', pid,
        //             {}, // empty body
        //             { start: st.valueOf() / 1000, end: ed.valueOf() / 1000 }
        //         ).done((data, textStatus) => {
        //             let min = Number.MAX_SAFE_INTEGER;
        //             let max = Number.MIN_SAFE_INTEGER;
        //             let dayData = _.map(data, (d, i) => {
        //                 let bins = [];
        //                 let counts = [];
        //                 let sum = 0;
        //                 let count = 0;
        //                 for (let j = 0; j < d.bins.length; j++) {
        //                     sum += d.bins[j] * d.counts[j];
        //                     count += d.counts[j];
        //                     if ((j + 1) % 30 === 0) {
        //                         if (count > 0) {
        //                             let v = sum / count;
        //                             bins.push(v);
        //                             counts.push(count);
        //                             min = min > v ? v : min;
        //                             max = max < v ? v : max;
        //                         } else {
        //                             bins.push(NaN);
        //                             counts.push(0);
        //                         }
        //                         sum = 0;
        //                         count = 0;
        //                     }
        //                 }

        //                 let newDay = {
        //                     level: 'day',
        //                     name: i + 1,  // date
        //                     bins,
        //                     counts,
        //                     children: undefined,
        //                     parent: o
        //                 };

        //                 return newDay;
        //             });

        //             // normalized
        //             let nm = d3.scaleLinear()
        //                 .domain([min, max])
        //                 .range([0, 1]);
        //             _.each(dayData, d => {
        //                 for (let i = 0; i < d.bins.length; i++) {
        //                     d.bins[i] = isNaN(d.bins[i]) ? -1 : nm(d.bins[i]);
        //                 }
        //             });
        //             console.log(`ses_pid_${pid}`, dayData);

        //             // switch tag
        //             (dayEleTab as any).tab('show');
        //             dayEleTab.removeClass('overlay');
        //             dayEleTab.find('i').remove();
        //             // change tab title
        //             $(`#${name}-radial-area-title`).text(
        //                 `Period - Year: ${o.parent.name}, Month: ${o.name}`);
        //             dayChart.trigger('update', dayData);
        //         });
        //     }
        // }
    }
}

export default Content;
