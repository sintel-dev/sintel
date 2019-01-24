import * as ko from 'knockout';
import * as _ from 'lodash';
import dataProcessor from '../services/data-processor';
import { LineChart } from './vis/line-chart';
import { AreaChart } from './vis/area-chart';
import { HorizonChart } from './vis/horizon-chart';
import { Data as RadialAreaChartData, RadialAreaChart } from './vis/radial-area-chart';
import server from '../services/rest-server';
import * as pip from '../services/pip-client';
import * as d3 from 'd3';
import { App } from '../main';

class Content {

    public dbSignals = ko.observableArray([]);

    private animationTime = 500;

    public initKnockoutVariables(eleId: string) {
        ko.applyBindings(this, $(eleId)[0]);
        // variables if any
    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;

        pip.content.on('signal:select', self.addChart.bind(self));

        pip.content.on('signal:loadAll', async (conf: { db: string, signalList: string[] }) => {
            let copy = $('#load-all-signals').html();
            $('#load-all-signals').html(`<i class="fa fa-refresh fa-spin"></i>`);
            for (let i = 0; i < conf.signalList.length; i++) {
                await self.addChart({
                    db: conf.db,
                    signal: conf.signalList[i]
                });
            }
            $('#load-all-signals').html(copy);
        });
    }

    constructor(eleId: string) {
        this.initKnockoutVariables(eleId);
    }


    // the following methods are triggered by user interactions

    public onRemoveDBSignal(name) {
        let self = this;
        setTimeout(() => {
            let dbSignals = self.dbSignals();
            let idx = _.findIndex(dbSignals, o => o === name);
            dbSignals.splice(idx, 1);
            self.dbSignals(dbSignals);
            pip.header.trigger('signal:updateActivation', dbSignals);
        }, self.animationTime);
    }

    // private methods

    private async addChart(conf: { db: string, signal: string }) {
        let self = this;
        let name = `${conf.db}_${conf.signal}`;
        let dbSignals = self.dbSignals();

        // if this is a new signal, then update dbSignals
        if (_.findIndex(dbSignals, o => o === name) < 0) {

            dbSignals.unshift(name);    // add to head
            self.dbSignals(dbSignals);
            pip.header.trigger('signal:updateActivation', dbSignals);

            // activate box interaction
            ($(`.box[name='${name}']`) as any).boxWidget({
                animationSpeed: self.animationTime,
                collapseTrigger: `button[name='${name}-collapse']`,
                removeTrigger: `button[name='${name}-remove']`
            });

            // load data
            let pathToFile = `./public/data/${conf.db}/${conf.signal}.csv`;
            let data = await dataProcessor.csv(pathToFile);

            // add charts to the right places
            let ele;

            // add line chart
            // let anomaly = new alg.Anomaly(_.map(data, d => d.y));
            // let windows = anomaly.findPeakWidows(5, 2);
            ele = $(`#${name}-line`)[0];
            new LineChart(ele, data, {
                height: 240,
                height2: 40,
                width: ele.parentElement.getBoundingClientRect().width,
                width2: ele.parentElement.getBoundingClientRect().width
                // smooth: true,
                // windows: windows
            });

            // add area chart
            ele = $(`#${name}-area`)[0];
            new AreaChart($(`#${name}-area`)[0], data, {
                width: ele.parentElement.getBoundingClientRect().width
            });

            // // add horizon chart
            ele = $(`#${name}-horizon`)[0];
            new HorizonChart($(`#${name}-horizon`)[0], data, {
                width: ele.parentElement.getBoundingClientRect().width
                // normalized: true
            });

            // add radial area chart
            // only activated when dataset is SES
            if (conf.db === 'SES') {
                ele = $(`#${name}-radial-area-year`)[0];
                let ndata = dataProcessor.normalizeTimeSeries(data);
                let tdata = dataProcessor.transformTimeSeriesToPeriodYear(ndata);
                let yearChart = new RadialAreaChart($(`#${name}-radial-area-year`)[0],
                    tdata,
                    {
                        width: ele.parentElement.getBoundingClientRect().width
                    }
                );

                ele = $(`#${name}-radial-area-month`)[0];
                let fakeMonthData = dataProcessor.genRadialAreaChartData(12, 30);
                let monthChart = new RadialAreaChart($(`#${name}-radial-area-month`)[0],
                    fakeMonthData,
                    {
                        width: ele.parentElement.getBoundingClientRect().width
                    }
                );

                ele = $(`#${name}-radial-area-day`)[0];
                let fakeDayData = dataProcessor.genRadialAreaChartData(30, 24);
                let dayChart = new RadialAreaChart($(`#${name}-radial-area-day`)[0],
                    fakeDayData,
                    {
                        width: ele.parentElement.getBoundingClientRect().width,
                        cw: 60,
                        ch: 60,
                        size: 70
                    }
                );

                yearChart.on('select', (o: RadialAreaChartData) => {
                    // switch tag
                    ($(`a[href="#${name}-radial-area-month"]`) as any).tab('show');
                    // change tab title
                    $(`#${name}-radial-area-title`).text(`Period - Year: ${o.name}`);

                    monthChart.trigger('update', o.children);
                });

                monthChart.on('select', (o: RadialAreaChartData) => {
                    console.log(o, conf);
                    hackDayData(o, dayChart);
                    // switch tag
                    // ($(`a[href="#${name}-radial-area-month"]`) as any).tab('show');
                    // change tab title
                    // $(`#${name}-radial-area-title`).text(`Period - Year: ${o.name}`);

                    // monthChart.trigger('update', o.children);
                });

            }
        }

        function hackDayData(o: RadialAreaChartData, dayChart) {
            const monNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            let monthToIndex = _.zipObject(monNames, _.range(12));
            let st = new Date(+o.parent.name, monthToIndex[o.name]);
            let ed: Date;
            if (st.getMonth() === 11) {
                ed = new Date(st.getFullYear() + 1, 0, 0);
            } else {
                ed = new Date(st.getFullYear(), st.getMonth() + 1, 0);
            }

            if (_.lowerCase(conf.db) === 'ses' && _.startsWith(conf.signal, '781')) {
                // server.dbs.read({}, {'foo': 12, 'boo': 13});
                server.dbs.signals.read('ses', 'pid_781',
                    {}, // empty body
                    {start: st.valueOf() / 1000, end: ed.valueOf() / 1000}
                ).done((data, textStatus) => {
                    let min = Number.MAX_SAFE_INTEGER;
                    let max = Number.MIN_SAFE_INTEGER;
                    let dayData = _.map(data, (d, i) => {
                        let bins = [];
                        let counts = [];
                        let sum = 0;
                        let count = 0;
                        for (let j = 0; j < d.bins.length; j++) {
                            sum += d.bins[j] * d.counts[j];
                            count += d.counts[j];
                            if ((j + 1) % 30 === 0) {
                                if (count > 0) {
                                    let v = sum / count;
                                    bins.push(v);
                                    counts.push(count);
                                    min = min > v ? v : min;
                                    max = max < v ? v : max;
                                } else {
                                    bins.push(NaN);
                                    counts.push(0);
                                }
                                sum = 0;
                                count = 0;
                            }
                        }

                        let newDay = {
                            level: 'day',
                            name: i + 1,  // date
                            bins,
                            counts,
                            children: undefined,
                            parent: o
                        };

                        return newDay;
                    });

                    // normalized
                    let nm = d3.scaleLinear()
                        .domain([min, max])
                        .range([0, 1]);
                    _.each(dayData, d => {
                        for (let i = 0; i < d.bins.length; i++) {
                            d.bins[i] = isNaN(d.bins[i]) ? 0 : nm(d.bins[i]);
                        }
                    });
                    console.log('ses_pid_781', dayData);

                    // switch tag
                    ($(`a[href="#${name}-radial-area-day"]`) as any).tab('show');
                    // change tab title
                    $(`#${name}-radial-area-title`).text(
                        `Period - Year: ${o.parent.name}, Month: ${o.name}`);

                    dayChart.trigger('update', dayData);
                });
            }
        }
    }
}

export default Content;
