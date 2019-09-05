import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as _ from 'lodash';
import 'select2';
import * as RSI from '../services/rest-server.interface';
import dataProcessor from '../services/data-processor';
import { LineChartDataEle } from './vis/data.interface';
import { LineChartCtx } from './vis/linechart-ctx';
import { LineChartFocus } from './vis/linechart-focus';
import { PeriodChart} from './vis/period-chart';

import server from '../services/rest-server';

interface CtxCharts {
    [index: string]: LineChartCtx;
}

interface PeriodCharts {
    [index: string]: PeriodChart;
}

class Content {

    public ctxs = ko.observableArray<string>([]);
    public focus = ko.observable<string>('');
    public modes = ko.observableArray<string>([]);
    // public empDetails = ko.observable<string>('ceva');

    private data: LineChartDataEle[];

    private focusChart: LineChartFocus;
    private ctxCharts: CtxCharts = {};
    private periodCharts: PeriodCharts = {};

    private eventInfo: RSI.Event;
    private commentInfo: RSI.Comment;
    public event = ko.observable('');

    public datarun = ko.observable('');
    public dataset = ko.observable('');
    public eventFrom = ko.observable('');
    public eventTo = ko.observable('');
    public level = ko.observable('None');
    public transcript = ko.observable('');
    public comment = '';

    private config = {
        speed: 500,   // box animation duration,
        ctxHeight: 450,
        focusHeight: 525,
        periodHeight: 980
    };

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);

        // default select 0
        $('.chart-focus-container').height(self.config.focusHeight);
        $('.chart-focus .plot').height(self.config.focusHeight); // - 45);
        $('.chart-ctx-container').height(self.config.ctxHeight);
        $('.pchart').height($('.connectedSortable').height() + 'px');
    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;

        pip.content.on('experiment:change', (exp: RSI.Experiment) => {
            self._ToggleLoadingOverlay();

            dataProcessor.loadData(exp).then((data: LineChartDataEle[]) => {
                self.data = data;
                self._ToggleLoadingOverlay();
                self.ctxs(_.map(data, d => d.dataset.name));

                if (self.focus() === '') {
                    self.focus(data[0].dataset.name);
                    $($(`.chart-ctx .title`)[0]).parent().addClass('ctx-active');
                } else {
                    $($(`.chart-ctx [name=title-${self.focus()}]`)).parent().addClass('ctx-active');
                }
                self._visualize();
            });
        });

        pip.content.on('ctx:brush', msg => {
            self.focusChart.trigger('brush:update', msg);
            _.each(self.ctxCharts, ct => {
                ct.trigger('brush:update', msg.xMove);
            });
        });

        pip.content.on('focus:zoom', xMove => {
            _.each(self.ctxCharts, ct => {
                ct.trigger('brush:update', xMove);
            });
        });

        pip.content.on('event:update', () => {
            self.focusChart.trigger('event:update');
            _.each(self.ctxCharts, ct => {
                ct.trigger('event:update');
            });
        });

        pip.content.on('event:modify', (evt) => {
            self.focusChart.trigger('event:modify', evt);
        });

        $('input[name="level"]').change(function() {
            let val = this.getAttribute('value');
            self.level(val);
        });

        pip.content.on('comment:new', (eventInfo: RSI.Event) => {
            this.update(eventInfo);
        });

        pip.content.on('comment:start', (eventInfo: RSI.Event) => {
            this.update(eventInfo);
        });
    }

    private showDatasetInfo(visible) {
        visible ? $('#datasetDescription').addClass('active') : $('#datasetDescription').removeClass('active');
        if(visible) {
            $('#datasetDescription').addClass('active');
            $('#selectLevel').select2({
				minimumResultsForSearch: Infinity
			})
        } else {
            $('#datasetDescription').removeClass('active')
        }
    }

    private async update(eventInfo: RSI.Event) {
        if (eventInfo.id === 'new') {
            $('#comment').val('');
        } else {
            this.commentInfo = await<any> server.comments.read({}, {
                event: eventInfo.id
            });
            $('#comment').val(this.commentInfo.text);
        }

        this.eventInfo = eventInfo;

        this.event(eventInfo.id);
        this.datarun(eventInfo.datarun);
        this.dataset(eventInfo.dataset);
        this.eventFrom(new Date(eventInfo.start_time).toUTCString());
        this.eventTo(new Date(eventInfo.stop_time).toUTCString());
        this.level(this.fromLevelToScore(eventInfo.score));

        this.showDatasetInfo(true);
    }

    private fromLevelToScore(score: number): string {
        let level: number | string = 0;
        for (let i = 0; i <= 4; i += 1) {
            if (score > i) { level += 1; }
        }
        if (level === 0) { level = 'None'; }
        $('input[name="level"]').removeAttr('check');
        $('input[name="level"]').removeClass('active');
        $(`input[name="level"][value="${level}"]`).attr('check');
        $(`input[name="level"][value="${level}"]`).addClass('active');

        return String(level);
    }

    private fromScoreToLevel(level: string): number {
        if (level === 'None') {
            return 0;
        } else {
            return +level;
        }
    }

    public remove() {
        let self = this;
        server.events.del<RSI.Response>(self.event()).done(() => {
            this.showDatasetInfo(false);
            pip.content.trigger('event:update');
            // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);
        });
    }

    public modify() {
        let self = this;
        pip.content.trigger('event:modify', self.eventInfo);
        // pip.content.trigger('linechart:highlight:modify', {
        //     datarun: self.eventInfo.datarun,
        //     event: self.eventInfo
        // });
        $('#datasetDescription').removeClass('active');
    }

    public save() {
        let self = this;

        if (self.event() === 'new') {
            // create new
            server.events.create<RSI.Response>({
                start_time: Math.trunc((self.eventInfo.start_time - self.eventInfo.offset) / 1000),
                stop_time: Math.trunc((self.eventInfo.stop_time - self.eventInfo.offset) / 1000),
                score: self.fromScoreToLevel(self.level()),
                datarun: self.eventInfo.datarun
            }).done(eid => {
                this.showDatasetInfo(false);
                pip.content.trigger('event:update');
                // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);

                server.comments.create({
                    event: eid,
                    text: $('#comment').val()
                });
            });
        } else {
            // update existing
            server.events.update<RSI.Response>(self.event(), {
                start_time: Math.trunc((self.eventInfo.start_time - self.eventInfo.offset) / 1000),
                stop_time: Math.trunc((self.eventInfo.stop_time - self.eventInfo.offset) / 1000),
                score: self.fromScoreToLevel(self.level()),
                datarun: self.eventInfo.datarun
            }).done(eid => {
                this.showDatasetInfo(false);
                pip.content.trigger('event:update');
                // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);

                if (self.commentInfo.id === 'new') {
                    server.comments.create({
                        event: eid,
                        text: $('#comment').val()
                    });
                } else {
                    server.comments.update(self.commentInfo.id, {
                        event: eid,
                        text: $('#comment').val()
                    });
                }
            });
        }
    }

    // the following public methods are triggered by user interactions

    public selectCtx(name) {
        let self = this;
        self.focus(name);
        let d = _.find(self.data, o => o.dataset.name === name);

        // update focus
        self.focusChart.trigger('data:update', [d]);
        ($(`a[href="#year"]`) as any).tab('show');

        // update period
        self.periodCharts['year'].trigger(
            'update',
            [{
                name: d.dataset.name,
                info: d.period
            }]
        );
        $(`.chart-ctx .title`).parent().removeClass('ctx-active');
        $(`.chart-ctx [name=title-${name}]`).parent().addClass('ctx-active');
    }

    public showMissing(content, event) {
        let self = this;
        const isChecked = event.target.checked;

        _.each(self.periodCharts, periodChartInstance => {

            // ovveride the missing visual flag for this chart instance.
            periodChartInstance.option.missing = isChecked;

            // this is required to prevent the update animation from easing in.
            // we want the chart data paths to remain static, but at the same time,
            // we want to rerender the chart.
            let _duration = periodChartInstance.option.duration;
            periodChartInstance.option.duration = 0;

            // rerender each updated chart, to show the missing period ranges.
            periodChartInstance.trigger('update', null);

            periodChartInstance.option.duration = _duration;
        });

        return true;
    }

    public eventsHandler(content, event) {
        return true;
    }

    public backward() {
        if ($('#year').hasClass('active')) {
            return;
        } else if ($('#month').hasClass('active')) {
            ($(`a[href="#year"]`) as any).tab('show');
        } else if ($(`#day`).hasClass('active')) {
            ($(`a[href="#month"]`) as any).tab('show');
        }
    }

    public addEventMode(content, event) {
        const isChecked = event.target.checked;
        const zoomModeInput = <HTMLInputElement>document.querySelector('#zoomMode');

        if (isChecked) {
            zoomModeInput.checked = false;
            this.focusChart.trigger('zoomPanMode', false);
        }

        this.focusChart.trigger('addEventMode', isChecked);
        return true;
    }

    public showPrediction(content, event) {
        const isChecked = event.target.checked;
        this.focusChart.trigger('showPrediction', isChecked);
        return true;
    }

    public zoomPanMode(content, event) {
        const isChecked = event.target.checked;
        const eventModeInput = <HTMLInputElement>document.querySelector('#eventMode');
        if (isChecked) {
            eventModeInput.checked = false;
            this.focusChart.trigger('addEventMode', false);
        }

        this.focusChart.trigger('zoomPanMode', isChecked);
        return true;
    }

    public zooming(factor){
        this.focusChart.trigger('zooming', factor);
        return true;
    }

    private _visualize() {
        let self = this;
        let data = self.data;

        // get common x domain
        let mmin = Number.MAX_SAFE_INTEGER;
        let mmax = Number.MIN_SAFE_INTEGER;
        _.each(data, d => {
            let st = _.first(d.timeseries)[0];
            let ed = _.last(d.timeseries)[0];
            mmin = mmin > st ? st : mmin;
            mmax = mmax < ed ? ed : mmax;
        });
        let xDomain: [number, number] = [mmin, mmax];

        if (_.isUndefined(self.focusChart)) {
            // plot context chart
            for (let i = 0; i < data.length; i++) {
                let dName = data[i].dataset.name;
                self.ctxCharts[dName] = new LineChartCtx(
                    $(`.chart-ctx [name="${dName}"]`)[0],
                    [data[i]],
                    {
                        offset: 0,
                        xAxis: false,
                        yAxis: false,
                        margin: { top: 9, right: 5, bottom: 9, left: 3 },
                        xDomain: xDomain
                    }
                );
            }

            // plot focused chart
            self.focusChart = new LineChartFocus(
                $('.chart-focus .plot')[0],
                [data[0]],   // By default, plot the first one
                {
                    height: self.config.focusHeight, // - 45,
                    offset: 0,
                    xAxis: true,
                    yAxis: true,
                    margin: { top: 20, right: 20, bottom: 40, left: 40 },
                    xDomain: xDomain
                }
            );

            // plot year period chart
            self.periodCharts['year'] = new PeriodChart(
                $('#year')[0],
                [{
                    name: data[0].dataset.name,
                    info: data[0].period,
                }],
                {
                    width: $('.pchart').width(),
                    nCol: 3
                }
            );

            // plot month period chart
            self.periodCharts['month'] = new PeriodChart(
                $('#month')[0],
                [{
                    name: data[0].dataset.name,
                    info: data[0].period[0].children
                }],
                {
                    width: $('.pchart').width(),
                    nCol: 4
                }
            );

            // plot day period chart
            self.periodCharts['day'] = new PeriodChart(
                $('#day')[0],
                [{
                    name: data[0].dataset.name,
                    info: data[0].period[0].children[0].children
                }],
                {
                    width: $('.pchart').width(),
                    nCol: 7
                }
            );
        } else {
            let d = _.find(self.data, o => o.dataset.name === self.focus());

            // update focus
            self.focusChart.option.xDomain = xDomain;
            self.focusChart.trigger('data:update', [d]);

            // update context
            for (let i = 0; i < data.length; i++) {
                let dName = data[i].dataset.name;
                self.ctxCharts[dName].trigger('data:update', [d]);
            }

            // update period-chart
            ($(`a[href="#year"]`) as any).tab('show');
            self.periodCharts['year'].trigger(
                'update',
                [{
                    name: d.dataset.name,
                    info: d.period
                }]
            );
        }

        // ******* handle chart events *********
        self.periodCharts['year'].on('select', (o) => {
            let newData = [];
            let d = _.find(data, dd => dd.dataset.name === self.focus());
            for (let i = 0; i < d.period.length; i++) {
                if (d.period[i].name !== o.name) { continue; }
                newData.push({
                    name: d.dataset.name,
                    info: d.period[i].children
                });
            }
            console.log(newData);
            // switch tab
            ($('a[href="#month"]') as any).tab('show');

            // update
            self.periodCharts['month'].trigger('update', newData);
        });

        self.periodCharts['month'].on('select', (o) => {
            let newData = [];
            let d = _.find(self.data, dd => dd.dataset.name === self.focus());
            for (let i = 0; i < d.period.length; i++) {
                if (d.period[i].name !== o.parent.name) { continue; }
                for (let j = 0; j < d.period[i].children.length; j++) {
                    if (d.period[i].children[j].name !== o.name) { continue; }
                    newData.push({
                        name: d.dataset.name,
                        info: d.period[i].children[j].children
                    });
                }
            }
            // switch tab
            ($('a[href="#day"]') as any).tab('show');

            // update
            self.periodCharts['day'].trigger('update', newData);
        });
    }

    private _ToggleLoadingOverlay() {
        if ($('.timeseries-overview>.overlay').hasClass('hidden')) {
            $('.timeseries-overview>.overlay').removeClass('hidden');
            $('.timeseries-detail>.overlay').removeClass('hidden');
            $('.period-view>.overlay').removeClass('hidden');
        } else {
            $('.timeseries-overview>.overlay').addClass('hidden');
            $('.timeseries-detail>.overlay').addClass('hidden');
            $('.period-view>.overlay').addClass('hidden');
        }
    }
}

export default Content;
