import 'select2';
import * as pip from '../services/pip';
import * as ko from 'knockout';
import * as _ from 'lodash';
import * as RSI from '../services/server.itf';
import * as dataPC from '../services/dataProcessor';
import { LineChartCtx } from './vis/lineChartCtx';
import { LineChartFocus } from './vis/lineChartFocus';
import { PeriodChart } from './vis/periodChart';

import server from '../services/server';

interface CtxCharts {
  [index: string]: LineChartCtx;
}

interface PeriodCharts {
  [index: string]: PeriodChart;
}

class PageExp {

  public ctxs = ko.observableArray<string>([]);
  public focus = ko.observable<string>('');
  public modes = ko.observableArray<string>([]);
  public event = ko.observable('');

  public datarun = ko.observable('');
  public dataset = ko.observable('');
  public eventFrom = ko.observable('');
  public eventTo = ko.observable('');
  public level = ko.observable('None');
  public transcript = ko.observable('');
  public comment = '';
  // public empDetails = ko.observable<string>('ceva');

  private data: dataPC.ChartDataEle[];

  private focusChart: LineChartFocus;
  private ctxCharts: CtxCharts = {};
  private periodCharts: PeriodCharts = {};

  private eventInfo: RSI.Event;
  private commentInfo: RSI.Comment;

  private config = {
    speed: 500,   // box animation duration,
    ctxHeight: this.getBoxSizes()[0],
    focusHeight: this.getBoxSizes()[1],
    periodHeight: 880
  };

  /**
   * Create experiment page instance
   *
   * @param eleId HTMLElement ID used for binding KO
   */
  constructor(eleId: string) {
    ko.applyBindings(this, $(eleId)[0]);
    $('.chart-focus-container').height(this.config.focusHeight);
    $('.chart-focus .plot').height(this.config.focusHeight); // - 45);
    $('.chart-ctx-container').height(this.config.ctxHeight);
    $('.pchart').height($('.connectedSortable').height() + 'px');
    this.setupEventHandlers();
  }

  public getBoxSizes() {
    const windownHeight = window.innerHeight;
    const ctxHeight = windownHeight * 35 / 100; // 35% for top box
    const focusHeight = windownHeight * 49 / 100; // 49% for the bottom box
    return [ctxHeight, focusHeight];
  }

  public remove() {
    let self = this;
    server.events.del<any>(self.event()).done(() => {
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
      server.events.create<any>({
        // start_time: Math.trunc((self.eventInfo.start_time - self.eventInfo.offset) / 1000),
        // stop_time: Math.trunc((self.eventInfo.stop_time - self.eventInfo.offset) / 1000),
        start_time: Math.trunc(self.eventInfo.start_time / 1000),
        stop_time: Math.trunc(self.eventInfo.stop_time / 1000),
        score: self.fromScoreToLevel(self.level()),
        datarun: self.eventInfo.datarun
      }).done(eid => {
        this.showDatasetInfo(false);
        pip.content.trigger('event:update');
        // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);

        server.comments.create({
          event_id: eid,
          text: $('#comment').val()
        });
      });
    } else {
      // update existing
      server.events.update<any>(self.event(), {
        // start_time: Math.trunc((self.eventInfo.start_time - self.eventInfo.offset) / 1000),
        // stop_time: Math.trunc((self.eventInfo.stop_time - self.eventInfo.offset) / 1000),
        start_time: Math.trunc(self.eventInfo.start_time / 1000),
        stop_time: Math.trunc(self.eventInfo.stop_time / 1000),
        score: self.fromScoreToLevel(self.level()),
        datarun: self.eventInfo.datarun
      }).done(eid => {
        this.showDatasetInfo(false);
        pip.content.trigger('event:update');
        // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);

        if (self.commentInfo.id === 'new') {
          server.comments.create({
            event_id: eid,
            text: $('#comment').val()
          });
        } else {
          server.comments.update(self.commentInfo.id, {
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
    let d = _.find(self.data, o => o.datarun.signal === name);

    // update focus
    self.focusChart.trigger('data:update', [d]);
    ($(`a[href="#year"]`) as any).tab('show');

    // update period
    self.periodCharts['year'].trigger(
      'update',
      [{
        name: d.datarun.signal,
        info: d.period
      }]
    );
    $(`.chart-ctx .title`).parent().removeClass('ctx-active');
    $(`.chart-ctx [name=title-${name}]`).parent().addClass('ctx-active');
    $('#periodView').text(name);
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
    } else {
      zoomModeInput.checked = true;
      this.focusChart.trigger('zoomPanMode', true);
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

  public zooming(factor) {
    this.focusChart.trigger('zooming', factor);
    return true;
  }

  private showDatasetInfo(visible) {
    visible ? $('#datasetDescription').addClass('active') : $('#datasetDescription').removeClass('active');
    if (visible) {
      $('#datasetDescription').addClass('active');
      $('#selectLevel').select2({ minimumResultsForSearch: Infinity });
    } else {
      $('#datasetDescription').removeClass('active');
    }
  }

  private async update(eventInfo: RSI.Event) {
    if (eventInfo.id === 'new') {
      $('#comment').val('');
    } else {
      this.commentInfo = await <any>server.comments.read({}, {
        event_id: eventInfo.id
      });
      this.commentInfo = this.commentInfo[0];
      $('#comment').val(this.commentInfo.text);
    }

    this.eventInfo = eventInfo;

    this.event(eventInfo.id);
    this.datarun(eventInfo.datarun);
    // this.dataset(eventInfo.dataset);
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
    if (level === 0) { level = 0; }

    const DropdownList = (document.getElementById('selectLevel')) as HTMLSelectElement;
    DropdownList.selectedIndex = level;
    return String(level);
  }

  private fromScoreToLevel(level: string): number {
    if (level === 'None') {
      return 0;
    } else {
      return +level;
    }
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
        let dName = data[i].datarun.signal;
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
          name: data[0].datarun.signal,
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
          name: data[0].datarun.signal,
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
          name: data[0].datarun.signal,
          info: data[0].period[0].children[0].children
        }],
        {
          width: $('.pchart').width(),
          nCol: 7
        }
      );
    } else {
      let d = _.find(self.data, o => o.datarun.signal === self.focus());

      // update focus
      self.focusChart.option.xDomain = xDomain;
      self.focusChart.trigger('data:update', [d]);

      // update context
      for (let i = 0; i < data.length; i++) {
        let dName = data[i].datarun.signal;
        // self.ctxCharts[dName].trigger('data:update', [d]);
        self.ctxCharts[dName].trigger('data:update', data[i]);
      }

      // update period-chart
      ($(`a[href="#year"]`) as any).tab('show');
      self.periodCharts['year'].trigger(
        'update',
        [{
          name: d.datarun.signal,
          info: d.period
        }]
      );
    }

    // ******* handle chart events *********
    self.periodCharts['year'].on('select', (o) => {
      let newData = [];
      let d = _.find(data, dd => dd.datarun.signal === self.focus());
      for (let i = 0; i < d.period.length; i++) {
        if (d.period[i].name !== o.name) { continue; }
        newData.push({
          name: d.datarun.signal,
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
      let d = _.find(self.data, dd => dd.datarun.signal === self.focus());
      for (let i = 0; i < d.period.length; i++) {
        if (d.period[i].name !== o.parent.name) { continue; }
        for (let j = 0; j < d.period[i].children.length; j++) {
          if (d.period[i].children[j].name !== o.name) { continue; }
          newData.push({
            name: d.datarun.signal,
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


  /**
   * Set up event handlers to handle events from other components
   */
  private setupEventHandlers() {
    let self = this;

    pip.pageExp.on('experiment:change', self.onExperimentChange.bind(self));

    pip.pageExp.on('ctx:brush', msg => {
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

    $('select[name="level"]').change(function (e) {
      let value = (<HTMLInputElement>e.target).value;
      self.level(value);
    });

    pip.content.on('comment:new', (eventInfo: RSI.Event) => {
      this.update(eventInfo);
    });

    pip.content.on('comment:start', (eventInfo: RSI.Event) => {
      this.update(eventInfo);
    });
  }

  /**
   * Invoked on receiving signal 'experiment:change'
   * @param exp The selected experiment
   */
  private async onExperimentChange(exp: RSI.Experiment) {
    let self = this;

    ToggleLoadingOverlay();
    dataPC.getDataruns(exp).then((data: dataPC.ChartDataEle[]) => {
      self.data = data;
      ToggleLoadingOverlay();
      self.ctxs(_.map(data, d => d.datarun.signal));

      if (self.focus() === '') {
        self.focus(data[0].datarun.signal);
        $($(`.chart-ctx .title`)[0]).parent().addClass('ctx-active');
      } else {
        $($(`.chart-ctx [name=title-${self.focus()}]`)).parent().addClass('ctx-active');
      }
      $('#periodView').text(data[0].datarun.signal);
      self._visualize();
    });

    function ToggleLoadingOverlay() {
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
}

export default PageExp;
