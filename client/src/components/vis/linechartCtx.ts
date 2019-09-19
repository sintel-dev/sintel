import * as _ from 'lodash';
import * as d3 from 'd3';
import * as pip from '../../services/pipClient';
import { LineChartDataEle } from './data.interface';
import { colorSchemes } from '../../services/globals';
import dataProcessor from '../../services/dataProcessor';



export interface Option {
  // layout
  svgHeight?: number;
  height?: number;
  width?: number;
  margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
  // animation
  duration?: number;
  delay?: number;
  // axis
  xDomain?: [number, number];
  yDomain?: [number, number];
  // functions
  tooltip?: boolean;
  smooth?: boolean;
  context?: boolean;
  windows?: Array<[number, number, number, string]>;  // start_time, stop_time, score, event_id
  offset?: number;
  xAxis?: boolean;
  yAxis?: boolean;
  buffer?: number;
}

export class LineChartCtx extends pip.Events {

  private container: d3.Selection<HTMLElement, any, any, any>;
  private svg: d3.Selection<SVGElement, any, any, any>;
  private canvas: d3.Selection<any, any, any, any>;

  private defaultHeight = 300;

  private option: Option = {
    // layout
    height: 60,
    width: null,
    margin: {
      top: 8,
      right: 5,
      bottom: 5,
      left: 35
    },
    // animation
    duration: 750,
    delay: 50,
    // axis
    xDomain: null,
    yDomain: null,
    // functions
    tooltip: false,
    smooth: false,
    windows: null,
    context: false,
    xAxis: true,
    yAxis: true,
    offset: 0,
    buffer: 10
  };


  constructor(
    ele: HTMLElement,
    private data: LineChartDataEle[],
    option?: Option
  ) {
    super();
    let self = this;
    _.extend(self.option, option);
    self.container = d3.select<HTMLElement, any>(ele);

    self.option.width = self.option.width === null ? $(ele).innerWidth() : self.option.width;
    self.option.height = self.option.height === null ? self.option.svgHeight : self.option.height;

    // scroll style inside <div> container
    self.container
      // .classed('scroll-style-0', true)
      .style('overflow-x', 'hidden')
      .style('overflow-y', 'hidden');
    self.plot();
  }

  private plot() {
    let self = this;
    const option = self.option;
    const [w, h, top] = [
      option.width - option.margin.left - option.margin.right,
      option.height - option.margin.top - option.margin.bottom - option.buffer,
      option.margin.top + option.buffer / 2
    ];
    // define axis scale
    let { x, y } = self.getScale(w, h);
    self.canvas = self.container.append<any>('canvas')
      .style('position', 'absolute')
      .style('left', `${option.margin.left}px`)
      .style('top', `${top}px`)
      .attr('width', w)
      .attr('height', h);

    let context: CanvasRenderingContext2D = self.canvas.node().getContext('2d');

    // function used to plot line
    let lineCanvas = d3.line<[number, number]>()
      .x(d => x(d[0]))
      .y(d => y(d[1]))
      .context(context);

    context.beginPath();
    lineCanvas(self.data[0].timeseries);
    context.lineWidth = 1;
    context.strokeStyle = 'rgb(36, 116, 241, 0.7)';
    context.stroke();

    self.svg = self.container.append<SVGElement>('svg')
      .style('position', 'absolute')
      .style('left', 0)
      .style('top', 0)
      .attr('class', 'multi-line-chart-ctx')
      .attr('width', self.option.width)
      .attr('height', self.option.height);

    // function used to plot area
    let area = d3.area<[number, number]>()
      .x(function (d) { return x(d[0]); })
      .y0(function (d) { return -(h - y(d[1])) / 2 + h / 2; })
      .y1(function (d) { return (h - y(d[1])) / 2 + h / 2; });

    // function used to plot line
    let line = d3.line<[number, number]>()
      .x(d => x(d[0]))
      .y(d => y(d[1]));

    let highlightUpdate = self.addHighlights(h, x, line, area);

    let chart = self.svg.append<SVGGElement>('g')
      .attr('transform', `translate(${option.margin.left},${option.margin.top})`);

    // plot axis
    let xAxis = d3.axisBottom(x);
    let yAxis = d3.axisLeft(y);

    if (option.xAxis) {
      chart.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0, ${h})`)
        .call(xAxis);
    }

    if (option.yAxis) {
      chart.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis.ticks(0, ',f'));
    }

    let { brush, bUpdate } = self.addBrush(chart, w, h + option.buffer, x);
    brush.on('brush end', brushHandler);

    // events
    self.on('brush:update', xMove => {
      brush.on('brush end', null);
      bUpdate(xMove);
      brush.on('brush end', brushHandler);
    });

    self.on('data:update', dataUpdateHandler);

    self.on('event:update', eventUpdateHandler);

    // event handlers
    function brushHandler() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') { return; } // ignore brush-by-zoom
      let s = d3.event.selection || x.range();


      pip.content.trigger('ctx:brush', {
        xMove: [s[0], s[1]],
        xDomain: [x.invert(s[0]), x.invert(s[1])],
        transform: d3.zoomIdentity.scale(w / (s[1] - s[0])).translate(-s[0], 0)
      });
    }

    function dataUpdateHandler(newData: LineChartDataEle[]) {
      self.data = newData;
      let sc = self.getScale(w, h);
      [x, y] = [sc.x, sc.y];

      let t = d3.transition()
        .duration(option.duration)
        .ease(d3.easeLinear);

      context.clearRect(0, 0, w, h);
      context.beginPath();
      lineCanvas(self.data[0].timeseries);
      context.lineWidth = 1;
      context.strokeStyle = 'rgb(36, 116, 241, 0.7)';
      context.stroke();

      // let uc = chart.selectAll<any, LineChartDataEle>('.line')
      //     .data(self.data);
      // uc.enter().append('path')
      //     .attr('class', 'line')
      //     .merge(uc)
      //     .style('stroke', d => colorSchemes.getColorCode('dname'))
      //     .style('opacity', 0.5)
      //     .transition(t)
      //     .attr('d', d => line(d.timeseries));

      // let uc = chart.selectAll<any, LineChartDataEle>('.area')
      //     .data(self.data);
      // uc.enter().append('path')
      //     .attr('class', 'area')
      //     .merge(uc)
      //     .style('fill', d => colorSchemes.getColorCode('dname'))
      //     .style('opacity', 0.5)
      //     .transition(t)
      //     .attr('d', d => area(d.timeseries));

      // clean all original windows
      self.svg.selectAll('.window').remove();
      _.each(self.data, d => {
        highlightUpdate(d.windows, d.timeseries, 'dname');
      });

      // uc.exit().remove();
    }

    async function eventUpdateHandler() {
      if (self.data.length > 1) { return; }
      // only execute when there is only one timeseries
      let newWindows = await dataProcessor.loadEventData(
        self.data[0].datarun.id,
        _.map(self.data[0].timeseries, d => d[0]),
        self.option.offset
        // self.data[0].offset
      );

      self.data[0].windows = newWindows as any;
      self.svg.selectAll('.window').remove();
      _.each(self.data, (d, i) => {
        highlightUpdate(d.windows, d.timeseries, 'dname');
      });
    }
  }

  private addBrush(chart, w, h, x) {

    let brush = d3.brushX()
      .extent([[0, 0], [w, h]]);

    let brushG = chart.append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, x.range());

    let update = function (range) {
      brushG.call(brush.move, range);
    };

    return {
      brush,
      bUpdate: update
    };
  }

  private addHighlights(h, x, line, area) {
    let self = this;
    let option = self.option;

    let scoreColor = (v: number) => {
      if (v === 0) { return '#777'; }
      let level = 0;
      for (let i = 1; i <= 4; i += 1) {
        if (v > i) { level += 1; }
      }
      return colorSchemes.severity5[level];
    };


    let highlightG = self.svg.append<SVGGElement>('g')
      .attr('class', 'highlights')
      .attr('transform', `translate(${option.margin.left},${option.margin.top + option.buffer / 2})`);

    let update = function (windows, lineData, name) {
      let u = highlightG
        .selectAll<SVGAElement, [number, number, number, string]>(`.window-${name}`)
        .data(windows, d => d[3]);

      u.enter().append('g')
        .attr('class', `window window-${name}`)
        .each(function (d, i) {
          d3.select(this).append('path')
            .attr('class', 'line-highlight');
        })
        .merge(u)
        .each(function (d, i) {
          d3.select(this).select('.line-highlight')
            .attr('d', line(_.slice(lineData, d[0], d[1] + 2)));
        });

      // u.enter().append('g')
      //     .attr('class', `window window-${name}`)
      //     .each(function(d, i) {
      //         d3.select(this).append('path')
      //             .attr('class', 'area-highlight');
      //     })
      //     .merge(u)
      //     .each(function(d, i) {
      //         d3.select(this).select('.area-highlight')
      //             .attr('d', area(_.slice(lineData, d[0], d[1] + 1)));
      //     });

      u.exit().remove();
    };

    _.each(self.data, d => {
      update(d.windows, d.timeseries, 'dname');
    });

    return update;
  }

  private getScale(w, h) {
    let self = this;

    let x, y;

    x = d3.scaleTime().range([0, w]);
    if (self.option.xDomain) {
      x.domain(self.option.xDomain);
    } else {
      let mmin = Number.MAX_SAFE_INTEGER,
        mmax = Number.MIN_SAFE_INTEGER;
      _.each(self.data, d => {
        let [mm, ma] = d3.extent(d.timeseries, o => o[0]);
        mmin = mmin > mm ? mm : mmin;
        mmax = mmax < ma ? ma : mmax;
      });
      x.domain([new Date(mmin), new Date(mmax)]);
    }

    y = d3.scaleLinear().range([h, 0]);
    if (self.option.yDomain) {
      y.domain(self.option.yDomain);
    } else {
      let mmin = Number.MAX_SAFE_INTEGER,
        mmax = Number.MIN_SAFE_INTEGER;
      _.each(self.data, d => {
        let [mm, ma] = d3.extent(d.timeseries, o => o[1]);
        mmin = mmin > mm ? mm : mmin;
        mmax = mmax < ma ? ma : mmax;
      });
      y.domain([mmin, mmax]);
    }
    return { x, y };
  }
}
