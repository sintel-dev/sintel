import 'tooltipster';
import * as pip from '../../services/pip';
import * as _ from 'lodash';
import * as d3 from 'd3';
import * as dataDP from '../../services/dataProcessor';
import { colorSchemes } from '../../services/helpers';


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
    private data: dataDP.PeriodChartDataEle[],
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
    self.on('event:update', eventUpdateHandler.bind(self));

    // ************  event handlers  ************
    function update(o: dataDP.PeriodChartDataEle[]) {
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

    function eventUpdateHandler(events) {
      self.data[0].events = events;
      update(self.data);
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

  private toTimestamp = function (strDate) {
    let datum = Date.parse(strDate);
    return datum / 1000;
  };

  /**
   * @TODO - if possible, make a single function out of those three
  * (groupEventPerYear, groupEventsPerMonth, groupEventsPerDay)
  * should be something like groupEvents(criteria) where criteria = year or month or day
  */
  private groupEventsPerYear(year) {
    const self = this;
    const events = self.data[0].events;
    const eventsPerYear = [];

    events.forEach(evt => {
      const startYear = new Date(evt.start_time * 1000).getFullYear();
      const endYear = new Date(evt.stop_time * 1000).getFullYear();

      const eventPeriod = {
        startDate: new Date(evt.start_time * 1000).toDateString(),
        stopDate: new Date(evt.stop_time * 1000).toDateString()
      };

      let currentYear = startYear;

      while (currentYear <= endYear) {
        const maxYearDate = self.toTimestamp(`12/31/${currentYear} 23:59:59`);
        const minYearDate = self.toTimestamp(`01/01/${currentYear} 00:00:00`);

        eventsPerYear.push({
          [currentYear]: {
            id: evt.id,
            score: evt.score,
            start_time: startYear === currentYear ? evt.start_time : minYearDate,
            stop_time: endYear === currentYear ? evt.stop_time : maxYearDate,
            tag: evt.tag,
            eventPeriod
          }
        });
        currentYear++;
      }
    });

    return eventsPerYear.filter(event => event[year]);
  }

  private groupEventsPerMonth(monthName, year) {
    const self = this;
    const eventsPerMonth = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const eventsPerYear = self.groupEventsPerYear(year);

    eventsPerYear.forEach(event => {
      const startMonth = new Date(event[year].start_time * 1000).getMonth();
      const endMonth = new Date(event[year].stop_time * 1000).getMonth();

      const eventPeriod = {
        startDate: event[year].eventPeriod.startDate,
        stopDate: event[year].eventPeriod.stopDate
      };

      let currentMonth = startMonth;

      while (currentMonth <= endMonth) {
        const maxDaysInMonth = new Date(year, months.indexOf(monthName) + 1, 0).getDate();
        const maxMonthDate = self.toTimestamp(`${months.indexOf(monthName) + 1}/${maxDaysInMonth}/${year} 23:59:59`);
        const minMonthDate = self.toTimestamp(`${months.indexOf(monthName) + 1}/01/${year} 00:00:00`);

        eventsPerMonth.push({
          [currentMonth]: {
            id: event[year].id,
            score: event[year].score,
            start_time: startMonth === currentMonth ? event[year].start_time : minMonthDate,
            stop_time: endMonth === currentMonth ? event[year].stop_time : maxMonthDate,
            tag: event[year].tag,
            eventPeriod
          }
        });
        currentMonth++;
      }
    });
    return eventsPerMonth.filter(event => event[months.indexOf(monthName)]);
  }

  private groupEventsPerDay(day, monthName, year) {
    const self = this;
    const eventsPerDay = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNumber = months.indexOf(monthName);
    const eventsPerMonth = self.groupEventsPerMonth(monthName, year);
    eventsPerMonth.forEach(event => {
      const startDay = new Date(event[monthNumber].start_time * 1000).getDate();
      const endDay = new Date(event[monthNumber].stop_time * 1000).getDate();
      let currentDay = startDay;
      const month = months.indexOf(monthName);

      const eventPeriod = {
        startDate: event[month].eventPeriod.startDate,
        stopDate: event[month].eventPeriod.stopDate
      };

      while (currentDay <= endDay) {
        const maxDayDate = self.toTimestamp(`${months.indexOf(monthName) + 1}/${currentDay}/${year} 23:59:59`);
        const minDayDate = self.toTimestamp(`${months.indexOf(monthName) + 1}/${currentDay}/${year} 00:00:00`);

        eventsPerDay.push({
          [currentDay]: {
            id: event[month].id,
            score: event[month].score,
            start_time: startDay === currentDay ? event[month].start_time : minDayDate,
            stop_time: endDay === currentDay ? event[month].stop_time : maxDayDate,
            tag: event[month].tag,
            eventPeriod
          }
        });
        currentDay++;
      }
    });
    return eventsPerDay.filter(event => event[day]);
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

    function featurePlot(_cell, o: dataDP.ChartDataEleInfoEle, stationName: string, id: any) {
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


      // @TODO - refactor
      if (self.data[0].events.length) {
        const PI = Math.PI;
        const secondsInMonth = 2629743.83;
        const secondsInDay = 86400;
        const circleMonths = (2 * PI) / 12;
        const circleHours = (2 * PI) / 24;
        colorSchemes.tag.push('#fff');
        const eventRange = [];
        const tagSeq = ['investigate', 'do not investigate', 'postpone', 'problem', 'previously seen', 'normal', 'untagged'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const getTagColor = (tag: string): string => {
          let colorIdx = 0;
          for (let i = 0; i < tagSeq.length; i += 1) {
            if (tagSeq[i] === tag) {
              colorIdx = i;
            }
          }
          return colorSchemes.tag[colorIdx];
        };

        const arc = d3.arc()
          .innerRadius(targetRadius - 2)
          .outerRadius(targetRadius + 2);

        if (o.level === 'year') {
          const events = self.groupEventsPerYear(Number(o.name));
          events.length && events.forEach(event => {
            const base = new Date(Number(o.name)).getTime() / 1000;
            const startTime = ((event[Number(o.name)].start_time - base) / secondsInMonth) * circleMonths;
            const stopTime = ((event[Number(o.name)].stop_time - base) / secondsInMonth) * circleMonths;
            const { startDate, stopDate } = event[Number(o.name)].eventPeriod;
            const arcClassName = `${startDate.replace(/ /g, '_')}`;

            arc
              .startAngle(startTime)
              .endAngle(stopTime);

            target.append('path')
              .attr('class', `circle-arc ${arcClassName}`)
              .attr('d', arc)
              .attr('fill', getTagColor(event[Number(o.name)].tag || 'untagged'))
              .attr('stroke', getTagColor(event[Number(o.name)].tag || 'untagged'))
              .on('mouseover', function() {
                $(`.${arcClassName}`).addClass('active');
              })
              .on('mouseout', function() {
                $(`.${arcClassName}`).removeClass('active');
              });

            // @TODO - find a way to remove repetitive code
            $('.circle-arc').tooltipster({
              'maxWidth': 170,
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

              functionInit: function (instance) {
                let tooltipContent = `
                      <ul class="tooltip-events">
                        <li class="events">${event[o.name].tag || 'untagged'} </li>
                        <li>
                          <span>START</span>
                          <span>${startDate} </span>
                        </li>
                        <li>
                          <span>END</span>
                          <span> ${stopDate}</span>
                        </li>
                      </ul>`;
                instance.content(tooltipContent);
              }
            });
          });
        }

        if (o.level === 'month') {
          const events = self.groupEventsPerMonth(o.name, o.parent.name); // month name and year
          events.length && events.forEach(event => {
            const base = new Date(Number(o.parent.name), monthNames.indexOf(o.name)).getTime() / 1000;
            const daysInMonth = o.children.length;
            const circleDays = (2 * PI) / daysInMonth;
            const startTime = ((event[monthNames.indexOf(o.name)].start_time - base) / secondsInDay) * circleDays;
            const stopTime = ((event[monthNames.indexOf(o.name)].stop_time - base) / secondsInDay) * circleDays;
            const { startDate, stopDate } = event[monthNames.indexOf(o.name)].eventPeriod;
            const arcClassName = `${startDate.replace(/ /g, '_')}`;

            arc
              .innerRadius(targetRadius - 2)
              .outerRadius(targetRadius + 2)
              .startAngle(startTime)
              .endAngle(stopTime);

            target.append('path')
              .attr('class', `circle-arc ${arcClassName}`)
              .attr('d', arc)
              .attr('fill', getTagColor(event[monthNames.indexOf(o.name)].tag || 'untagged'))
              .attr('stroke', getTagColor(event[monthNames.indexOf(o.name)].tag || 'untagged'))
              .on('mouseover', function() {
                $(`.${arcClassName}`).addClass('active');
              })
              .on('mouseout', function() {
                $(`.${arcClassName}`).removeClass('active');
              });

            $('.circle-arc').tooltipster({
              'maxWidth': 170,
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

              functionInit: function (instance) {
                let tooltipContent = `
                      <ul class="tooltip-events">
                        <li class="events">${event[monthNames.indexOf(o.name)].tag || 'untagged'} </li>
                        <li>
                          <span>START</span>
                          <span>${startDate} </span>
                        </li>
                        <li>
                          <span>END</span>
                          <span> ${stopDate}</span>
                        </li>
                      </ul>`;
                instance.content(tooltipContent);
              }
            });
          });
        }

        if (o.level === 'day') {
          const dayEvents = self.groupEventsPerDay(o.name, o.parent.name, o.parent.parent.name);
          dayEvents.length && dayEvents.forEach(event => {
            const base = new Date(Number(o.parent.parent.name), monthNames.indexOf(o.parent.name), Number(o.name)).getTime() / 1000;
            const startTime = ((event[o.name].start_time - base) / 3600) * circleHours;
            const stopTime = ((event[o.name].stop_time - base) / 3600) * circleHours;
            const { startDate, stopDate } = event[o.name].eventPeriod;
            const arcClassName = `${startDate.replace(/ /g, '_')}`;

            arc
              .innerRadius(targetRadius + 1.5)
              .outerRadius(targetRadius - 1.5)
              .startAngle(startTime)
              .endAngle(stopTime);

            target.append('path')
              .attr('class', `circle-arc ${arcClassName}`)
              .attr('d', arc)
              .attr('fill', getTagColor(event[o.name].tag || 'untagged'))
              .attr('stroke', getTagColor(event[Number(o.name)].tag || 'untagged'))
              .on('mouseover', function() {
                $(`.${arcClassName}`).addClass('active');
              })
              .on('mouseout', function() {
                $(`.${arcClassName}`).removeClass('active');
              });


            $('.circle-arc').tooltipster({
              'maxWidth': 170,
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

              functionInit: function (instance) {
                let tooltipContent = `
                        <ul class="tooltip-events">
                          <li class="events">${event[o.name].tag || 'untagged'} </li>
                          <li>
                            <span>START</span>
                            <span>${startDate} </span>
                          </li>
                          <li>
                            <span>END</span>
                            <span> ${stopDate}</span>
                          </li>
                        </ul>`;
                instance.content(tooltipContent);
              }
            });
          });
        }

        _cell.append('text')
          .attr('class', 'radial-text-md')
          .text(o.name)
          .attr('x', function (data, arg, svgEls) {
            const textOffset = svgEls[0].clientWidth;
            return -(textOffset / 2);
          })
          .attr('y', (data, arg, svgEls) => {
            const textOffset = svgEls[0].getBBox().height;
            return size / 2 + textOffset;
          });

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
}

