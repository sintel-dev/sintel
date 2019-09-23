import * as _ from 'lodash';
import * as d3 from 'd3';
import * as pip from '../../services/pip';
import { colorSchemes, fromIDtoTag, fromTagToID } from '../../services/helpers';
import * as dataPC from '../../services/dataProcessor';
import * as DT from '../../services/server.itf';
import {Experiment} from '../pageLanding';


export interface Option {
  svgHeight?: number;
  height?: number;
  width?: number;
  margin?: { top: number, right: number, bottom: number, left: number };

  maxTagNum?: number;
  maxEventnum?: number;
  matrixHeight?: number;
  matrixWidth?: number;
  matrixMargin?: { top: number, right: number, bottom: number, left: number };
}

export class Matrix extends pip.Events {


  private minHeight = 160;
  private minWidth = 180;

  private option: Option = {
    height: 160,  // min height
    width: 180,  // min width
    margin: {
      top: 2,
      right: 5,
      bottom: 5,
      left: 2
    },
    matrixHeight: 100,
    matrixWidth: 120
  };

  private svgContainer: d3.Selection<HTMLElement, any, any, any>;
  private svg: d3.Selection<SVGElement, any, any, any>;
  private canvas: d3.Selection<any, any, any, any>;

  constructor(
    ele: HTMLElement,
    private data: Experiment,
    option?: Option
  ) {
    super();
    let self = this;
    _.extend(self.option, option);

    self.svgContainer = d3.select<HTMLElement, any>(ele);
    self.option.width = _.isUndefined(self.option.width) ? self.minWidth : self.option.width;
    self.option.height = _.isUndefined(self.option.height) ? self.minHeight : self.option.height;

    self.svg = self.svgContainer.append<SVGElement>('svg')
      .attr('class', 'matrix')
      .attr('width', self.option.width)
      .attr('height', self.option.height);

    self.plot();
  }

  private plot() {
    let self = this;

    let g = self.svg.append<SVGGElement>('g')
      .attr('transform', `translate(${self.option.margin.left}, ${self.option.margin.top})`);

    self.option.width -= self.option.margin.left + self.option.margin.right;
    self.option.height -= self.option.margin.top + self.option.margin.bottom;

    self.addTagBars(g);
    self.addMatrixHeatmap(g);
    self.addAreaChart(g);

  }

  private addAreaChart(g: d3.Selection<SVGGElement, any, any, any>) {
    let self = this;
    let w = self.option.matrixWidth;
    let h = self.option.height - self.option.matrixHeight;

    let cg = g.append('g')
      .attr('transform', `translate(${self.option.width - w}, ${h})`);

    cg.append('line')
      .attr('class', 'sep-line')
      .attr('x1', 0)
      .attr('y1', -14)
      .attr('x2', w)
      .attr('y2', -14);

    let symbol = d3.symbol().size(36);

    cg.append('g')
      .attr('transform', `translate(4, -8)`)
      .append('path')
      .attr('d', symbol.type(d3.symbolTriangle))
      .style('fill', '#616365');

    cg.append('g')
      .attr('transform', `translate(${w - 4}, -8)`)
      .append('path')
      .attr('d', symbol.type(d3.symbolTriangle))
      .style('fill', '#616365');

    // set the ranges
    let areaG = g.append('g')
      .attr('transform', `translate(${self.option.width - w}, ${h - 16})`);

    let fx = d3.scaleLinear().range([0, w]);
    let fy = d3.scaleLinear().range([0, h - 16]);

    // define the area
    let area = d3.area()
        .x(d => d[0])
        .y0(0)
        .y1(d => d[1])
        .curve(d3.curveCardinal);

    let bins = new Array(10).fill(0);
    let binNum = bins.length;
    let interval = -1;
    // find max score
    let maxScore = 6;
    let tScore = false;
    _.each(self.data.dataruns, datarun => {
      for (let i = 0; i < datarun.events.length; i += 1) {
        if (datarun.events[i].score > 0) {
          tScore = true;
        }
      }
    });
    if (!tScore) { return; }
    interval = maxScore / binNum;
    let maxCount = 0;
    let outerMaxNum = 0;
    // get bins
    _.each(self.data.dataruns, datarun => {
      for (let i = 0; i < datarun.events.length; i += 1) {
        if (datarun.events[i].score > maxScore) {
          outerMaxNum += 1;
        } else {
          let idx = Math.trunc(datarun.events[i].score / interval);
          if (idx === datarun.events[i].score / interval) { idx -= 1; }
          bins[idx] += 1;
          maxCount = maxCount < bins[idx] ? bins[idx] : maxCount;
        }
      }
    });

    fx.domain([0, binNum]);
    fy.domain([0, maxCount]);

    let curve = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveCardinal);

    let points = _.map(_.range(binNum), i => {
      return [fx(i + 0.5), -fy(bins[i])];
    }) as [number, number][];

    points.unshift([0, 0]);
    points.push([binNum, -fy(outerMaxNum)]);

    areaG.append('path')
      .attr('class', 'area')
      .attr('d', area(points));


    cg.append('g')
      .attr('transform', `translate(-2, -4)`)
      .append('text')
      .attr('class', 'axis-text')
      .attr('text-anchor', 'end')
      .text(0);

    cg.append('g')
      .attr('transform', `translate(${w - 10}, -4)`)
      .append('text')
      .attr('class', 'axis-text')
      .attr('text-anchor', 'end')
      .text(maxScore);
  }

  private addMatrixHeatmap(g: d3.Selection<SVGGElement, any, any, any>) {
    let self = this;
    let w = self.option.matrixWidth;
    let h = self.option.matrixHeight;

    let cells: [string, number][] = _.chain(self.data.dataruns)
      .map(d => [d.signal, d.events.length])
      .sortBy(d => d[0])
      .value() as [string, number][];

    let color = d3.scaleLinear<any>()
      .range(['#A3A4A5', '#43434E'])
      .domain([0, self.option.maxEventnum]);
      // .domain(d3.extent(cells, d => d[1]));

    let rowNum = 6;
    let fx = d3.scaleBand()
      .range([ 0, w ])
      .domain(_.map(d3.range(rowNum), d => String(d)))
      .padding(0.1);

    let cg = g.append('g')
      .attr('transform', `translate(${self.option.width - w}, ${self.option.height - h})`);

    let size = fx.bandwidth();
    cg.selectAll('.cell')
      .data(cells)
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('x', (d, i) => fx(String(i % rowNum)) )
      .attr('y', (d, i) => (size + fx.paddingInner()) * i)
      .attr('width', size )
      .attr('height', size )
      .attr('fill', d => color(d[1]))
      .append('title')
      .text(d => `signal: ${d[0]}\n` + `events: ${d[1]}`);
  }


  private addTagBars(g: d3.Selection<SVGGElement, any, any, any>) {
    let self = this;
    let tagStats = _.sortBy(_.toPairs(self.data.tagStats), d => +d[0]);

    tagStats.push(tagStats[0]);
    tagStats.shift();

    let rh = 7;   // rounded height
    let rm = 3;

    let w = self.option.width - self.option.matrixWidth;
    let h = self.option.matrixHeight;

    let fx = d3
      .scaleBand()
      .domain(_.map(tagStats, d => d[0]))
      .rangeRound([0, h])
      .paddingInner(0.1);

    let fy = d3.scaleLinear()
      .range([0, w - rh - rm])
      .domain([0, self.option.maxTagNum]);

    let getTagColor = (tag: string): string => {
      let tagSeq = ['investigate', 'do not investigate', 'postpone',
        'problem', 'previously seen', 'normal'];

      let colorIdx: number;
      for (let i = 0; i < tagSeq.length; i += 1) {
        if (tagSeq[i] === tag) {
          colorIdx = i;
        }
      }
      if (_.isUndefined(colorIdx)) { colorIdx = 6; }
      return colorSchemes.tag[colorIdx];
    };

    let cg = g.append('g')
      .attr('transform', `translate(${w}, ${self.option.height - h})`);

    cg.selectAll('.bar')
      .data(tagStats)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => -fy(d[1]) - rm)
      .attr('width', d => fy(d[1]))
      .attr('y', d => fx(d[0]))
      .attr('height', fx.bandwidth())
      .attr('fill', d => getTagColor(fromIDtoTag(d[0])) )
      .append('title')
      .text(d => fromIDtoTag(d[0]) + `(${d[1]})`);

    let curve = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveBasis);

    cg.selectAll('.bar-hat')
      .data(tagStats)
    .enter().append('path')
      .attr('class', 'bar-hat')
      .each(function(d) {
        // add rounded header
        let barHat = d3.select(this);
        if (d[1] === 0) { return; }
        let [x0, y0, x1, y1] = [
          -fy(d[1]) + 1 - rm, fx(d[0]),
          -fy(d[1]) + 1 - rm, fx(d[0]) + fx.bandwidth()
        ];
        let [xm0, ym0, xm1, ym1] = [x0 - rh, y0, x1 - rh, y1];
        barHat.attr('d', curve([
          [x0, y0], [xm0, ym0], [xm1, ym1], [x1, y1]
        ]));
      })
      .attr('fill', d => getTagColor(fromIDtoTag(d[0])) )
      .append('title')
      .text(d => fromIDtoTag(d[0]) + `(${d[1]})`);

    cg.append('line')
      .attr('class', 'sep-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', h);

  }

}
