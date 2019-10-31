import 'select2';
import * as pip from '../services/pip';
import * as ko from 'knockout';
import * as _ from 'lodash';
import * as DT from '../services/server.itf';
import * as d3 from 'd3';
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

interface EventInfo extends DT.Event {
  signal: string;
}

class PageExp {

  public ctxs = ko.observableArray<string>([]);
  public focus = ko.observable<string>('');
  public event = ko.observable('');

  public datarun = ko.observable<string>('');
  public signal = ko.observable<string>('');
  public eventFrom = ko.observable('');
  public eventTo = ko.observable('');
  public score = ko.observable('0');
  public tag = ko.observable<string>('');
  public transcript = ko.observable('');
  public comment = '';

  private data: dataPC.ChartDataEle[];

  private selectedDatarun: DT.Datarun = null;
  private focusChart: LineChartFocus;
  private ctxCharts: CtxCharts = {};
  private periodCharts: PeriodCharts = {};
  private selectedTagID: string;
  private tagSelectionData = [
  {
    'text': 'Unknown',
    'children': [{
        'id': 1,
        'text': '<i class="select investigate"></i>investigate'
      },
      {
        'id': 2,
        'text': '<i class="select not_investigate"></i>do not investigate'
      },
      {
        'id': 3,
        'text': '<i class="select postpone"></i>postpone'
      }]
  },
  {
    'text': 'Known',
    'children': [{
        'id': 4,
        'text': '<i class="select problem"></i>problem'
      },
      {
        'id': 5,
        'text': '<i class="select seen"></i>previously seen'
      },
      {
        'id': 6,
        'text': '<i class="select normal"></i>normal'
      }]
  }
];

  private eventInfo: EventInfo;
  private commentInfo: DT.Comment;

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
    $('.pchart').height(($('.connectedSortable.ui-sortable').height() - 40) + 'px');
    this.setupEventHandlers();
    this.setupOwnEventHandlers();
  }

  public getBoxSizes() {
    const windownHeight = window.innerHeight;
    const ctxHeight = windownHeight * 35 / 100; // 35% for top box
    const focusHeight = windownHeight * 49 / 100; // 49% for the bottom box
    return [ctxHeight, focusHeight];
  }

  public remove() {
    let self = this;
    server.events.del(self.event()).done(() => {
      self.showDatasetInfo(false);
      pip.pageExp.trigger('event:update');
      // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);
    });
  }

  public modify() {
    let self = this;
    pip.pageExp.trigger('event:modify', self.eventInfo);
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
      server.events.create<DT.Event>({
        start_time: Math.trunc(self.eventInfo.start_time / 1000),
        stop_time: Math.trunc(self.eventInfo.stop_time / 1000),
        score: self.score(),
        tag: self.fromSelectionIDtoTag(self.selectedTagID),
        datarun_id: self.eventInfo.datarun
      }).done((event: DT.Event) => {
        self.showDatasetInfo(false);
        pip.pageExp.trigger('event:update');
        // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);

        if (_.isUndefined(self.commentInfo)) {
          server.comments.create({
            event_id: event.id,
            text: $('#comment').val()
          });
        } else {
          server.comments.update(self.commentInfo.id, {
            text: $('#comment').val()
          });
        }
      });
    } else {
      // update existing
      // console.log(self.selectedTagID, self.fromSelectionIDtoTag(self.selectedTagID));
      server.events.update<DT.Event>(self.event(), {
        start_time: Math.trunc(self.eventInfo.start_time / 1000),
        stop_time: Math.trunc(self.eventInfo.stop_time / 1000),
        score: self.score(),
        tag: self.fromSelectionIDtoTag(self.selectedTagID),
        event_id: self.eventInfo.id
      }).done((event: DT.Event) => {
        self.showDatasetInfo(false);
        pip.pageExp.trigger('event:update');
        // pip.pageExp.trigger('linechart:highlight:update', self.eventInfo.datarun);

        if (_.isUndefined(self.commentInfo)) {
          server.comments.create({
            event_id: event.id,
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
    self.selectedDatarun = d.datarun;

    // update focus
    self.focusChart.trigger('data:update', [d]);
    ($(`a[href="#year"]`) as any).tab('show');

    // update period
    self.periodCharts['year'].trigger(
      'update',
      [{
        name: d.datarun.signal,
        info: d.period,
        events: d.datarun.events
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
    const state = event.target.checked;

    // @TODO - space for improvements - animations/code optimisation
    this.periodCharts['year'].trigger('showPeriod', state);
    this.periodCharts['month'].trigger('showPeriod', state);
    this.periodCharts['day'].trigger('showPeriod', state);
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


  private showDatasetInfo(visible) {
    if (visible) {
      $('#datasetDescription').addClass('active');
      this.initTagSelectionMenu();
    } else {
      $('#selectLevel').empty();
      $('#selectLevel').append('<option></option>');
      $('#datasetDescription').removeClass('active');
    }
  }

  private initTagSelectionMenu() {
    $('#selectLevel').empty();
    $('#selectLevel').append('<option></option>');
    let s2 = $('#selectLevel').select2({
      minimumResultsForSearch: Infinity,
      placeholder: 'Select a tag',
      data: this.tagSelectionData,
      escapeMarkup: markup => markup
    });
    // console.log(this.eventInfo.tag, this.fromTagToSelectionID(this.eventInfo.tag));
    this.selectedTagID = undefined;
    let tagID = this.fromTagToSelectionID(this.eventInfo.tag);
    if (tagID !== 'untagged') {
      s2.val(tagID).trigger('change');
    } else {
      $('.select-line .indicator').attr('class', 'indicator untagged');
    }
  }

  private fromSelectionIDtoTag(id: string): string {
    switch (id) {
      case '1':
        return 'investigate';
      case '2':
        return 'do not investigate';
      case '3':
        return 'postpone';
      case '4':
        return 'problem';
      case '5':
        return 'previously seen';
      case '6':
        return 'normal';
      default:
        return 'untagged';
    }
  }

  private fromTagToSelectionID(tag: string): string {
    switch (tag) {
      case 'investigate':
        return '1';
      case 'do not investigate':
        return '2';
      case 'postpone':
        return '3';
      case 'problem':
        return '4';
      case 'previously seen':
        return '5';
      case 'normal':
        return '6';
      default:
        return 'untagged';
    }
  }

  private init() {
    this.ctxs([]);
    this.focus('');
    this.event('');
    this.datarun('');
    this.signal('');
    this.eventFrom('');
    this.eventTo('');
    this.transcript('');
    this.comment = '';
    this.focusChart = undefined;
    this.ctxCharts = {};
    this.periodCharts = {};
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

    pip.pageExp.on('focus:zoom', xMove => {
      _.each(self.ctxCharts, ct => {
        ct.trigger('brush:update', xMove);
      });
    });

    pip.pageExp.on('event:update', () => {
      self.focusChart.trigger('event:update');
      _.each(self.ctxCharts, ct => {
        ct.trigger('event:update');
      });
      server.events.read<{events: DT.Event[]}>(
        {},
        { datarun_id: self.selectedDatarun.id }
      ).done((data) => {
        self.periodCharts['year'].trigger('event:update', data.events);
        self.periodCharts['month'].trigger('event:update', data.events);
        self.periodCharts['day'].trigger('event:update', data.events);
      });

    });

    pip.pageExp.on('event:modify', (evt) => {
      self.focusChart.trigger('event:modify', evt);
    });

    pip.pageExp.on('comment:new', self.onComment.bind(self));
    pip.pageExp.on('comment:start', self.onComment.bind(self));
  }

  /**
   * Set up event listeners and handlers
   * for events from the component itself.
   */
  private setupOwnEventHandlers() {
    let self = this;

    $('select[name="level"]').change(function (e) {
      self.selectedTagID = $('#selectLevel option:selected').val() as string;
      // update indicator color
      let indicator = $('.select-line .indicator');
      indicator.attr('class', `indicator id${self.selectedTagID}`);
    });
  }

  /**
   * Invoked on receiving signal 'comment:new' or 'comment:start'
   * @param eventInfo eventInfo
   */
  private async onComment(eventInfo: EventInfo) {
    let self = this;
    if (eventInfo.id === 'new') {
      $('#comment').val('');
    } else {
      let data = await server.comments.read<{ comments: DT.Comment[] }>(
        {},
        { event_id: eventInfo.id }
      );
      if (data.comments.length === 0) {
        $('#comment').val('');
        self.commentInfo = undefined;
      } else {
        self.commentInfo = data.comments[0];
        $('#comment').val(self.commentInfo.text);
      }
    }
    self.eventInfo = eventInfo;
    self.event(eventInfo.id);
    self.datarun(eventInfo.datarun);
    self.signal(eventInfo.signal);
    self.tag(eventInfo.tag);
    self.score(d3.format('.3f')(eventInfo.score));
    self.eventFrom(new Date(eventInfo.start_time).toUTCString());
    self.eventTo(new Date(eventInfo.stop_time).toUTCString());
    // self.level(self.fromScoreToLevel(eventInfo.score));

    self.showDatasetInfo(true);
  }

  /**
   * Invoked on receiving signal 'experiment:change'
   * @param exp The selected experiment
   */
  private async onExperimentChange(exp: DT.Experiment) {
    let self = this;

    self.init();

    ToggleLoadingOverlay();

    dataPC.getDataruns(exp).then((data: dataPC.ChartDataEle[]) => {
      self.data = data;
      ToggleLoadingOverlay();
      self.ctxs(_.map(data, d => d.datarun.signal));

      // Select the first ctx chart by default
      // self.selectCtx(data[0].datarun.signal);
      self.selectedDatarun = data[0].datarun;
      self.focus(data[0].datarun.signal);
      $(`.chart-ctx .title`).first().parent().addClass('ctx-active');
      $('#periodView').text(data[0].datarun.signal);

      self.visualize();
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

  private visualize() {
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

      $('.chart-focus .plot').empty();
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

      $('.multi-period-chart').remove();
      // plot year period chart
      self.periodCharts['year'] = new PeriodChart(
        $('#year')[0],
        [{
          name: data[0].datarun.signal,
          info: data[0].period,
          events: data[0].datarun.events
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
          info: data[0].period[0].children,
          events: data[0].datarun.events
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
          info: data[0].period[0].children[0].children,
          events: data[0].datarun.events
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
      server.events.read<{events: DT.Event[]}>(
        {},
        { datarun_id: d.datarun.id }
      ).done((edata) => {
        self.periodCharts['year'].trigger(
          'update',
          [{
            name: d.datarun.signal,
            info: d.period,
            events: edata.events
          }]
        );
      });
    }

    // ******* handle chart events *********
    self.periodCharts['year'].on('select', async (o) => {
      let newData = [];
      let d = _.find(data, dd => dd.datarun.signal === self.focus());
      let edata: {events: DT.Event[]} = await server.events.read<any>(
        {},
        { datarun_id: d.datarun.id }
      );
      for (let i = 0; i < d.period.length; i++) {
        if (d.period[i].name !== o.name) { continue; }

        
        newData.push({
          name: d.datarun.signal,
          info: d.period[i].children,
          events: edata.events
        });
      }
      // switch tab
      ($('a[href="#month"]') as any).tab('show');
      
      // update
      self.periodCharts['month'].trigger('update', newData);
    });

    self.periodCharts['month'].on('select', async (o) => {
      let newData = [];
      let d = _.find(self.data, dd => dd.datarun.signal === self.focus());
      let edata: {events: DT.Event[]} = await server.events.read<any>(
        {},
        { datarun_id: d.datarun.id }
      );
      for (let i = 0; i < d.period.length; i++) {
        if (d.period[i].name !== o.parent.name) { continue; }
        for (let j = 0; j < d.period[i].children.length; j++) {
          if (d.period[i].children[j].name !== o.name) { continue; }
          newData.push({
            name: d.datarun.signal,
            info: d.period[i].children[j].children,
            events: edata.events
          });
        }
      }
      // switch tab
      ($('a[href="#day"]') as any).tab('show');

      // update
      self.periodCharts['day'].trigger('update', newData);
    });
  }
}

export default PageExp;
