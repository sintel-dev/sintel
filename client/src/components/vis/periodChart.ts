import * as pip from '../../services/pipClient';
import { PeriodChartDataEle, LineChartDataEleInfoEle } from './data.itf';
import { colorSchemes } from '../../services/globals';
import 'tooltipster';
import * as _ from 'lodash';
import * as d3 from 'd3';

export interface Option {
  // svg layout
  height?: number;
  width?: number;
  margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
  // animation
  duration?: number;
  delay?: number;
  // glyph parameters
  radius?: number;
  padding?: number;
  nCol?: number;  // number of glyphs each row
  size?: number;
  minSize?: number;
  missing?: boolean;   // whether highlight missing data
  circleStroke?: number; // used to calculate circle target stroke
  scaleFactor?: number;
  marginRatio?: number;
  dayLevelTranslate?: number;
}

export class PeriodChart extends pip.Events {

  public option: Option = {
    // svg layout
    height: null,
    width: null,
    margin: { top: 0, right: 0, bottom: 10, left: 0 },
    // animation
    duration: 750,
    delay: 50,
    // glyph parameters
    nCol: null,
    padding: 18,
    size: 100,      // width = height = size (include padding)
    minSize: 6,
    missing: false,
    circleStroke: 1,
    scaleFactor: 0.9,
    marginRatio: 0,
    dayLevelTranslate: 40
  };

  private svgContainer: d3.Selection<HTMLElement, any, any, any>;
  private svg: d3.Selection<SVGElement, any, any, any>;
  private defaultHeight = 300;

  constructor(
    ele: HTMLElement,
    private data: PeriodChartDataEle[],
    option?: Option
  ) {
    super();
    let self = this;
    _.extend(self.option, option);
    self.svgContainer = d3.select<HTMLElement, any>(ele);

    self.option.width = self.option.width === null ? $(ele).innerWidth() : self.option.width;

    let { nCol, width, padding, margin } = self.option;

    if (nCol !== null) {
      self.option.size = Math.floor((width - margin.left - margin.right) / nCol);
    }

    self.option.nCol = Math.floor((width - margin.left - margin.right) / (self.option.size));

    self.option.marginRatio = self.option.size / 15 * self.option.scaleFactor; // each cell bottom margin

    if (self.option.height === null) {
      const rowsCount = Math.ceil(data[0].info.length / self.option.nCol);
      self.option.height = self.option.size * rowsCount + (rowsCount - 1)
        * self.option.marginRatio + margin.top + margin.bottom; // adding text offset height
    } else {
      self.option.height = self.defaultHeight;
    }

    // append svg to the container
    self.svg = self.svgContainer.append<SVGElement>('svg')
      .attr('class', 'multi-period-chart')
      .attr('width', self.option.width)
      .attr('height', self.option.height);
    self.plot();
  }

  private plot() {
    let self = this;
    const option = self.option;
    const { width, height, margin, padding, size, nCol } = self.option;

    const [w, h] = [
      width - margin.left - margin.right,
      height - margin.top - margin.bottom,
    ];

    let outerRadius = (size / 2) - (padding / 2);
    let innerRadius = Math.max(outerRadius / 8, option.minSize);

    // layout setting
    _.each(self.data, d => {
      _.each(d.info, (dd, i) => {
        dd.col = i % nCol;
        dd.row = Math.floor(i / nCol);
      });
    });

    // define circular axis scale for each glyph
    let { angle, radius, area, area0 } = self.getScale(innerRadius, outerRadius);

    // zoom
    let { zoom, zoomRect } = self.addZoom(w, h);
    zoom.on('zoom', zoomHandler);
    let zoomG = self.svg.append('g');

    let g = zoomG.append('g')
      .attr('transform', `translate(${option.margin.left}, ${option.margin.top})`);

    self.normalize();
    // add glyphs
    let { featurePlot } = self.addGlyphs(g, angle, radius, area, area0, size, innerRadius, outerRadius);

    // add labels
    let { label1, label2 } = self.addLabels(g, size);

    // ************  events  ************
    self.on('update', update);

    // ************  event handlers  ************
    function update(o: PeriodChartDataEle[]) {
      if (o !== null) {
        self.data = o;
      } else {
        o = self.data;
      }
      self.normalize();

      if (o[0].info[0].level === 'year') {
        let newHeight = size
          * Math.ceil((o[0].info.length) / nCol)
          + margin.top + margin.bottom + self.option.marginRatio;

        self.svg.attr('height', newHeight);
        zoomRect.attr('height', newHeight).call(zoom);
      }

      if (o[0].info[0].level === 'month') {
        label1.text(o[0].info[0].parent.name);
      }

      if (o[0].info[0].level === 'day') {
        label1.text(`${o[0].info[0].parent.name} ${(o[0].info[0].parent.parent.name)}`);
        let [mm, yy] = [
          o[0].info[0].parent.name,
          o[0].info[0].parent.parent.name
        ];
        let offset = new Date(`${mm} 1, ${yy} 00:00:00`).getDay();
        let newHeight = size
          * Math.ceil((o[0].info.length + offset) / nCol)
          + margin.top + margin.bottom + self.option.marginRatio + self.option.dayLevelTranslate;

        let nh = newHeight + margin.top + margin.bottom + self.option.marginRatio;
        self.svg.attr('height', nh);

        zoom.translateExtent([[0, 0], [w, nh]]).extent([[0, 0], [w, nh]]);
        zoomRect.attr('height', nh).call(zoom);
        _.each(self.data, d => {
          _.each(d.info, (dd, i) => {
            let dt = new Date(`${mm} ${i + 1}, ${yy} 00:00:00`);
            dd.col = (i + offset) % nCol;
            dd.row = Math.floor((i + offset) / nCol);
            dd.name += `[${dt.toString().substring(0, 3)}]`;
          });
        });
      } else {
        _.each(self.data, d => {
          _.each(d.info, (dd, i) => {
            dd.col = i % nCol;
            dd.row = Math.floor(i / nCol);
          });
        });
      }

      g.selectAll(`.feature-cell`).remove();
      _.each(self.data, (data, i) => {
        let _g = g.selectAll(`.feature-cell-${data.name}`).data(data.info);

        // append month
        _g.enter().append('g')
          .merge(_g as any)
          .attr('class', `feature-cell feature-cell-${data.name}`)
          .attr('transform', d => {
            if (d.level === 'day') {
              return `
                                translate(
                                    ${d.col * size + size / 2},
                                    ${d.row * size + size / 2 + self.option.dayLevelTranslate + self.option.marginRatio * d.row}),
                                scale(${self.option.scaleFactor})`;
            }
            return `
                            translate(${d.col * size + size / 2}, ${d.row * size + size / 2 + self.option.marginRatio * d.row}),
                            scale(${self.option.scaleFactor})`;
          })
          .each(function (d, count) {
            const randomID = self.generateRandomID();
            featurePlot(d3.select(this), d, data.name, randomID);
          });
        _g.exit().remove();
      });
    }

    function zoomHandler() {
      zoomG.attr('transform', d3.event.transform);
    }
  }

  private normalize() {
    let self = this;
    let mmin = Number.MAX_SAFE_INTEGER;
    let mmax = Number.MIN_SAFE_INTEGER;
    let clones = _.cloneDeep(self.data);
    _.each(clones, d => {
      for (let i = 0; i < d.info.length; i++) {
        for (let j = 0; j < d.info[i].bins.length; j++) {
          if (d.info[i].counts[j] === 0) { continue; }
          mmin = mmin > d.info[i].bins[j] ? d.info[i].bins[j] : mmin;
          mmax = mmax < d.info[i].bins[j] ? d.info[i].bins[j] : mmax;
        }
      }
    });

    let nm = d3.scaleLinear()
      .domain([mmin, mmax])
      .range([0, 1]);

    _.each(clones, d => {
      for (let i = 0; i < d.info.length; i++) {
        for (let j = 0; j < d.info[i].bins.length; j++) {
          if (d.info[i].counts[j] === 0) { continue; }
          d.info[i].bins[j] = nm(d.info[i].bins[j]);
        }
      }
    });
    self.data = clones;
  }

  private addZoom(w, h) {
    let self = this;
    let option = self.option;

    let zoom = d3.zoom()
      .scaleExtent([1, 6])
      .translateExtent([[0, 0], [w, h]])
      .extent([[0, 0], [w, h]]);

    let zoomRect;
    zoomRect = self.svg.append('rect')
      .attr('class', 'zoom')
      .attr('transform', `translate(${option.margin.left},${option.margin.top})`)
      .attr('width', w)
      .attr('height', h)
      .call(zoom);

    return { zoom, zoomRect };
  }

  private getScale(ir, or) {
    let angle = d3.scaleLinear()
      .range([0, 2 * Math.PI]);

    let radius = d3.scaleLinear()
      .range([ir, or])
      .clamp(true);

    let area = d3.areaRadial<number>()
      .angle((d, i) => angle(i))
      .innerRadius(d => radius(0))
      .outerRadius(d => radius(d))
      .curve(d3.curveCardinalClosed);

    let area0 = d3.areaRadial<number>()
      .angle((d, i) => angle(i))
      .innerRadius(d => radius(0))
      .outerRadius(d => radius(0))
      .curve(d3.curveCardinalClosed);

    return { angle, radius, area, area0 };
  }

  private addLabels(g, size) {
    let self = this;
    if (self.data[0].info[0].level === 'day') {
      let names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      g.append('g')
        .attr('class', 'weekdays')
        .attr('transform', 'translate(0, 35)')
        .selectAll('.weekday-text')
        .data(_.range(7))
        .enter()
        .append('text')
        .attr('class', 'radial-text-md weekday-text')
        .attr('x', d => d * size + size / 2)
        .attr('y', 0)
        .text(d => names[d]);
    }

    let label1 = self.svg.append('text')
      .attr('class', 'radial-text-md')
      .attr('x', 1)
      .attr('y', 14)
      .text('');

    let label2 = self.svg.append('text')
      .attr('class', 'radial-text-md')
      .attr('x', 1)
      .attr('y', 30)
      .text('');

    return { label1, label2 };
  }

  private generateRandomID() {
    return Math.random().toString(36).substr(2, 9);
  }

  private addGlyphs(g, angle, radius, area, area0, size, innerRadius, outerRadius) {
    let self = this;
    let option = self.option;

    // let cell = g.append('g').attr('class', `${self.data[0].info[0].level }_level`);
    // plot data on each station
    _.each(self.data, (data, count) => {
      let cell = g
        .selectAll(`.feature-cell-${data.name}`)
        .data(data.info)
        .enter()
        .append('g')
        .attr('class', `feature-cell feature-cell-${data.name}`)
        .attr('transform', d => {
          if (d.level === 'day') {
            return `translate(${d.col * size + size / 2}, ${d.row * size + size / 2 + self.option.dayLevelTranslate + self.option.marginRatio * d.row}), scale(${self.option.scaleFactor})`;
          }
          return `translate(${d.col * size + size / 2}, ${d.row * size + size / 2 + self.option.marginRatio * d.row}), scale(${self.option.scaleFactor})`;
        })
        .each(function (d) {
          const randomID = self.generateRandomID();
          featurePlot(d3.select(this), d, data.name, randomID);
        });

    });

    return { featurePlot };

    function featurePlot(_cell, o: LineChartDataEleInfoEle, stationName: string, id: any) {
      const { circleStroke } = self.option;

      // Extend the domain slightly to match the range of [0, 2π].
      angle.domain([0, o.bins.length - 0.05]);
      // angle.domain([0, o.bins.length - 0.88]);

      // notice all the data has been normalized to [0, 1]
      radius.domain([0, 1]);

      let path = _cell.append('path')
        .datum(o.bins)
        .attr('class', 'feature-area radial-cursor')
        .attr('id', `path_${id}`)
        .attr('d', area0)
        .on('click', (d) => {
          if (o.children) {
            self.trigger('select', o);
          }
        });

      let clipPath = _cell.append('clipPath');
      clipPath
        .attr('id', `clip_${id}`)
        .append('use')
        .attr('xlink:href', `#path_${id}`);

      path.transition()
        .duration(option.duration)
        .attr('d', area);

      path.append('title')
        .text(o.name);


      // create the 'target' svg circles
      let target = _cell.append('g')
        .attr('class', 'target');

      const ratio = size / 3 - circleStroke / 2;
      const targetRadius = size / 2 - circleStroke / 2;
      const strokeWidth = size / 2;

      target.append('circle')
        .attr('r', targetRadius)
        .attr('stroke-width', circleStroke);

      target.append('circle')
        .attr('r', targetRadius - ratio / 2)
        .attr('stroke-width', circleStroke);
      target.append('circle')
        .attr('r', targetRadius - ratio)
        .attr('stroke-width', circleStroke);


      // vertical/horizontal lines for the 'target'
      target.append('line')
        .attr('x1', -(strokeWidth))
        .attr('x2', strokeWidth)
        .attr('stroke-width', circleStroke)
        .attr('y1', 0)
        .attr('y2', 0);

      target.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('stroke-width', circleStroke)
        .attr('y1', -(strokeWidth))
        .attr('y2', strokeWidth);


      _cell.append('circle')
        .attr('clip-path', `url(#clip_${id})`)
        .attr('class', 'wrapper')
        .attr('r', strokeWidth)
        .attr('fill', 'url(#blueGradient)');

      _cell.append('circle')
        .attr('class', 'radial-cursor svg-tooltip')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', innerRadius)
        .style('fill', 'white')
        .style('stroke-width', 0)
        .on('click', (d) => {
          self.trigger('select', o);
        })
        .attr('title',
          '["investigate", "do not investigate", "postpone", "problem", "previously seen", "normal", "TBD"]'
        ); // should be gathered from API

      if (o.level !== 'day') {
        _cell.append('text')
          .attr('class', 'radial-text-md')
          .attr('x', -14)
          .text(o.name)
          .attr('y', (data, arg, svgEls) => {
            const textOffset = svgEls[0].getBBox().height;
            return size / 2 + textOffset;
          });
      }

      if (o.level === 'year') {
        $('.svg-tooltip').tooltipster({
          'maxWidth': 270,
          contentAsHTML: true,
          arrow: false,
          side: 'right',
          trigger: 'custom',
          debug: false,
          triggerOpen: {
            click: true,
            tap: true,
            mouseenter: true
          },
          triggerClose: {
            click: true,
            scroll: false,
            tap: true,
            mouseleave: true
          },

          functionInit: function (instance, helper) {
            const content = instance.content();
            const events = JSON.parse(content);
            let newContent = '<ul><li class="events">Events</li>';
            events.map((event, index) => {
              newContent += `<li><i class="event_${index}"/>${event}</li>`;
            });
            newContent += '</ul>';
            instance.content(newContent);
          }
        });
      }

      if (option.missing) {
        let missedData = [];
        let area00 = d3.areaRadial<number>()
          .angle((d, i) => angle(d))
          .innerRadius(d => radius(0))
          .outerRadius(d => radius(0))
          .curve(d3.curveCardinal);
        _.each(o.bins, (b, bi) => {
          if (o.counts[bi] === 0) {
            missedData.push(bi);
            _cell.append('path')
              .datum(missedData)
              .attr('class', 'missed-bins')
              .attr('d', area00([bi, bi + 1]))
              .attr('fill', '#b70e13')
              .attr('stroke', '#b70e13')
              .attr('stroke-width', 2)
              .attr('stroke-opacity', 0.7);
          }
        });
      }
    }
  }
}

