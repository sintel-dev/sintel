import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as d3 from 'd3';
import * as _ from 'lodash';
import dataProcessor from '../services/data-processor';
import { LineChart } from './vis/line-chart_ori_2';
import { AreaChart } from './vis/area-chart';
import { HorizonChart } from './vis/horizon-chart';
import { Data as RadialAreaChartData, RadialAreaChart } from './vis/radial-area-chart';
import { Datarun } from '../services/rest-server.interface';
import { TimeSeriesData } from './vis/chart-data.interface';

class Content {

    public boxs = ko.observableArray([]);

    private lineCharts = {};
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
        pip.content.on('linechart:highlight:update', name => {
            self.lineCharts[name].trigger('highlight:update');
            self.lineCharts[name + '-no-period'].trigger('highlight:update');
        });

        pip.content.on('linechart:highlight:modify', msg => {
            self.lineCharts[msg.datarun].trigger('highlight:modify', msg.event);
            self.lineCharts[msg.datarun + '-no-period'].trigger('highlight:modify', msg.event);
        });
    }


    // the following public methods are triggered by user interactions

    public flipPrediction(name) {
        let self = this;
        self.lineCharts[name].trigger('prediction');
        self.lineCharts[name + '-no-period'].trigger('prediction');
    }

    public comment(name) {
        let self = this;
        self.lineCharts[name].trigger('comment');
        self.lineCharts[name + '-no-period'].trigger('comment');
    }

    public uncomment(name) {
        let self = this;
        self.lineCharts[name].trigger('uncomment');
        self.lineCharts[name + '-no-period'].trigger('uncomment');
    }

    public backward(datarun) {
        if ($(`#${datarun}-radial-area-year`).hasClass('active')) {
            return;
        }

        if ($(`#${datarun}-radial-area-month`).hasClass('active')) {
            ($(`a[href="#${datarun}-radial-area-year"]`) as any).tab('show');
        } else if ($(`#${datarun}-radial-area-day`).hasClass('active')) {
            ($(`a[href="#${datarun}-radial-area-month"]`) as any).tab('show');
        }
    }

    public onRemoveBox(name) {
        let self = this;
        setTimeout(() => {
            let boxs = self.boxs();
            let idx = _.findIndex(boxs, o => o[0] === name);
            boxs.splice(idx, 1);
            delete self.lineCharts[name];
            delete self.lineCharts[name + '-no-period'];
            self.boxs(boxs);
            pip.header.trigger('datarun:updateActives', _.map(boxs, b => b[0]));
        }, self.config.speed);
    }

    public onCollapse(name) {
        let self = this;

        console.log('name', name);

        let btn = $(`button[name='${name}-collapse']`);
        if (btn.find('.fa-angle-double-left').length > 0) {
            // collapse
            btn.html(`<i class="fa fa-angle-double-right fa-size-lg"></i>`);
            ($(`a[href="#${name}-no-period"]`) as any).tab('show');
        } else {
            // expand
            btn.html(`<i class="fa fa-angle-double-left fa-size-lg"></i>`);
            ($(`a[href="#${name}-period"]`) as any).tab('show');
        }
    }

    private async addChart(msg: {dataset: string, datarun: Datarun}) {
        let self = this;
        // let name = `${msg.dataset} : ${msg.datarun.name.split('.')[0]} (${msg.datarun.id})`; // datarun id is unique
        let title = msg.dataset;
        if (_.startsWith(msg.dataset, 'pid_')) {
            title = 'Pid-' + msg.dataset.substring(4);
        }
        let name = [
            msg.datarun.id,
            // `<label>Dataset: </label> ${msg.dataset}
            //  <label>Datarun: </label> ${msg.datarun.id}
            //  <label>created on </label> ${msg.datarun.start_time}
            // `
            `<span>Dataset: </span> <label> ${msg.dataset} </label>
             <span>Experiment created on </span> <label> ${msg.datarun.start_time.substring(0, 10)} </label>
            `
        ];
        let boxs = self.boxs();

        // if new, then add a new box
        if (_.findIndex(boxs, o => o === name) < 0) {

            boxs = [name];
            // boxs.unshift(name);    // add to head
            self.boxs(boxs);
            pip.header.trigger('datarun:updateActives', _.map(boxs, b => b[0]));

            // activate box interaction
            // ($(`.box[name='${name[0]}']`) as any).boxWidget({
            //     animationSpeed: self.config.speed,
            //     collapseTrigger: `button[name='${name[0]}-collapse']`,
            //     removeTrigger: `button[name='${name[0]}-remove']`
            // });

            // load data for visualization
            // let data = await dataProcessor.loadData(msg.dataset, msg.datarun.id) as any;
            let data = await dataProcessor.loadData2(msg.dataset, msg.datarun.id) as any;

            // declare the element for adding the chart
            let ele;

            // add line chart no period
            ele = $(`#${name[0]}-line-no-period`)[0];
            self.lineCharts[name[0] + '-no-period'] = new LineChart(ele,
                data.timeseries, data.timeseries2, data.errors, msg.datarun.id, msg.dataset,
            {
                height: 600,
                height2: 180,
                // width: ele.parentElement.getBoundingClientRect().width,
                // width2: ele.parentElement.getBoundingClientRect().width,
                width: $('.wd-12').width(),
                width2: $('.wd-12').width(),
                // smooth: true,
                windows: data.windows,
                offset: data.offset,
                clipName: 'clip-no-period'
            });

            // add line chart
            ele = $(`#${name[0]}-line`)[0];
            self.lineCharts[name[0]] = new LineChart(ele,
                data.timeseries, data.timeseries2, data.errors, msg.datarun.id, msg.dataset,
            {
                height: 600,
                height2: 180,
                // width: ele.parentElement.getBoundingClientRect().width,
                // width2: ele.parentElement.getBoundingClientRect().width,
                width: $('.wd-8').width(),
                width2: $('.wd-8').width(),
                // smooth: true,
                windows: data.windows,
                offset: data.offset,
                clipName: 'clip-period'
            });

            // // add area chart
            // ele = $(`#${name[0]}-area`)[0];
            // new AreaChart($(`#${name[0]}-area`)[0], data.timeseries, {
            //     height: 400,
            //     width: ele.parentElement.getBoundingClientRect().width
            // });

            // // // add horizon chart
            // ele = $(`#${name[0]}-horizon`)[0];
            // new HorizonChart($(`#${name[0]}-horizon`)[0], data.timeseries, {
            //     width: ele.parentElement.getBoundingClientRect().width
            //     // normalized: true
            // });

            // add radial area chart
            ele = $(`#${name[0]}-radial-area-year`)[0];
            // let ndata = dataProcessor.normalizeTimeSeries(data.timeseries);
            // let tdata = dataProcessor.transformTimeSeriesToPeriodYear(ndata);
            let yearChart = new RadialAreaChart($(`#${name[0]}-radial-area-year`)[0],
                data.period,
                {
                    width: $('.wd-4').width(),
                    // width: ele.parentElement.getBoundingClientRect().width,
                    nCol: 3
                }
            );

            ele = $(`#${name[0]}-radial-area-month`)[0];
            let fakeMonthData = dataProcessor.genRadialAreaChartData(12, 30);
            let monthChart = new RadialAreaChart($(`#${name[0]}-radial-area-month`)[0],
                fakeMonthData,
                {
                    width: $('.wd-4').width(),
                    // width: ele.parentElement.getBoundingClientRect().width,
                    nCol: 3
                }
            );

            ele = $(`#${name[0]}-radial-area-day`)[0];
            let fakeDayData = dataProcessor.genRadialAreaChartData(30, 24, 'day');
            let dayChart = new RadialAreaChart($(`#${name[0]}-radial-area-day`)[0],
                fakeDayData,
                {
                    width: $('.wd-4').width(),
                    // width: ele.parentElement.getBoundingClientRect().width,
                    nCol: 7
                    // cw: 60,
                    // ch: 60,
                    // size: 70
                }
            );

            yearChart.on('select', (o: RadialAreaChartData) => {
                // switch tag
                ($(`a[href="#${name[0]}-radial-area-month"]`) as any).tab('show');

                // change tab title
                $(`#${name[0]}-radial-area-title`)
                    .text(`Period - Year: ${o.name}`);

                monthChart.trigger('update', o.children);
            });

            monthChart.on('select', (o: RadialAreaChartData) => {
                // switch tag
                ($(`a[href="#${name[0]}-radial-area-day"]`) as any).tab('show');

                // change tab title
                $(`#${name[0]}-radial-area-title`)
                    .text(`Period - Year: ${o.parent.name}, Month: ${o.name}`);

                dayChart.trigger('update', o.children);
            });

        }
    }
}

export default Content;
